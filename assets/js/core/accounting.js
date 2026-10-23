// accounting.js — the double-entry engine behind the Accounting Lab and the F01 lesson widgets.
// Pure functions, no DOM: charts of accounts, validating and checking journal entries, posting to a ledger,
// the trial balance, the four financial statements, closing entries and a generator of practice transactions.
//
// Amounts are plain numbers of dollars. Every total and comparison is worked in whole cents, so floating-point
// noise (0.1 + 0.2) never decides whether an entry balances.
//
// An entry (a transaction, an adjustment or a closing entry) is { id, date, text, lines, cash? }, where each line is
// { acct, dr } or { acct, cr }. `cash` optionally classifies the cash movement for the statement of cash flows:
// 'operating' | 'investing' | 'financing', or { operating, investing, financing } in signed dollars for a split.
// `cashLabel` optionally names the line on a direct-method statement of cash flows (e.g. 'Cash paid to employees').
import { mulberry32 } from './rng.js?v=11';

// ---------------------------------------------------------------- account types

/**
 * What each account type means for the rules of debit and credit.
 * normal: the side that increases the account. element: where it sits in Assets = Liabilities + Equity.
 * sign: +1 if an increase in the account increases its element's total, −1 if it decreases it.
 * statement: where its balance is reported. temporary: closed to retained earnings at the end of the period.
 */
export const TYPE_INFO = {
  asset:          { normal: 'dr', element: 'assets',      sign: 1,  statement: 'balance', temporary: false, noun: 'an asset' },
  'contra-asset': { normal: 'cr', element: 'assets',      sign: -1, statement: 'balance', temporary: false, noun: 'a contra-asset account' },
  liability:      { normal: 'cr', element: 'liabilities', sign: 1,  statement: 'balance', temporary: false, noun: 'a liability' },
  equity:         { normal: 'cr', element: 'equity',      sign: 1,  statement: 'balance', temporary: false, noun: 'an equity account' },
  dividends:      { normal: 'dr', element: 'equity',      sign: -1, statement: 'equity',  temporary: true,  noun: 'the dividends account' },
  revenue:        { normal: 'cr', element: 'equity',      sign: 1,  statement: 'income',  temporary: true,  noun: 'a revenue account' },
  'contra-revenue': { normal: 'dr', element: 'equity',     sign: -1, statement: 'income',  temporary: true,  noun: 'a contra-revenue account' },
  expense:        { normal: 'dr', element: 'equity',      sign: -1, statement: 'income',  temporary: true,  noun: 'an expense' },
  summary:        { normal: 'cr', element: 'equity',      sign: 1,  statement: 'none',    temporary: true,  noun: 'a temporary closing account' },
};

/** How a wrong-side message describes each type: "<Account> <is …>, so it increases with a credit." */
const IS = {
  asset: 'is an asset',
  'contra-asset': 'is a contra-asset account, with a normal credit balance',
  liability: 'is a liability',
  equity: 'is part of equity',
  dividends: 'has a normal debit balance (dividends reduce equity)',
  revenue: 'is revenue, which increases equity',
  'contra-revenue': 'is a contra-revenue account, with a normal debit balance (it reduces revenue)',
  expense: 'is an expense, which reduces equity',
  summary: 'is a temporary closing account',
};

/** Why an account of each type goes up or down, in words a beginner can check against the transaction. */
const WHY = {
  asset: { increase: 'the business has more of this resource', decrease: 'the business has less of this resource' },
  'contra-asset': { increase: 'more of the related asset’s cost has been used up', decrease: 'less of the related asset’s cost is recorded as used up' },
  liability: { increase: 'the business owes more', decrease: 'the business owes less' },
  equity: { increase: 'the owners’ claim grows', decrease: 'the owners’ claim shrinks' },
  dividends: { increase: 'profit is being distributed to the shareholders', decrease: 'distributions to shareholders are reduced' },
  revenue: { increase: 'the business has earned revenue by delivering a service', decrease: 'revenue is reduced' },
  'contra-revenue': { increase: 'revenue is reduced by returns, allowances or discounts', decrease: 'a reduction of revenue is reversed' },
  expense: { increase: 'a cost of running the business has been used up', decrease: 'an expense is reduced' },
  summary: { increase: 'net income is being moved toward retained earnings', decrease: 'the temporary account is being cleared' },
};

export const CASH_CLASSES = ['operating', 'investing', 'financing'];

// ---------------------------------------------------------------- numbers

const C = (v) => Math.round(Number(v) * 100);            // dollars → whole cents
const D = (c) => (c === 0 ? 0 : c / 100);                 // cents → dollars (never −0)
/** Does a dr/cr field hold something? Blank, null and zero count as empty; anything else (even "abc") is present. */
const has = (v) => v != null && String(v).trim() !== '' && Number(v) !== 0;
const nf0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** "$12,000", "$37.50", "−$4,000". */
export function usd(dollars) {
  const c = Math.round(Math.abs(Number(dollars)) * 100);
  return `${dollars < 0 && c ? '−' : ''}$${(c % 100 ? nf2 : nf0).format(c / 100)}`;
}
const lower = (name) => name.toLowerCase();
/** "a board meeting", "an open-house evening". */
const an = (phrase) => `${/^[aeiou]/i.test(phrase) ? 'an' : 'a'} ${phrase}`;
/** "Harbor Tech’s", "Meridian Partners’". */
const poss = (name) => (/s$/.test(name) ? `${name}’` : `${name}’s`);

// ---------------------------------------------------------------- the chart of accounts

/**
 * Index a chart of accounts: { list, byName, byNo }. Each account gains its type's rules (normal, element, sign,
 * statement, temporary). Accepts a chart that is already made, so every function can take either form.
 * Throws on unknown types or duplicate names, so an author finds a broken chart at once.
 */
export function makeChart(list) {
  if (list && list.byName && Array.isArray(list.list)) return list;
  if (!Array.isArray(list)) throw new TypeError('makeChart: expected an array of accounts');
  const byName = Object.create(null), byNo = Object.create(null);
  const out = list.map((a, i) => {
    if (!a || typeof a.name !== 'string' || !a.name) throw new TypeError(`makeChart: account ${i + 1} has no name`);
    const info = TYPE_INFO[a.type];
    if (!info) throw new TypeError(`makeChart: account “${a.name}” has unknown type “${a.type}”`);
    if (byName[a.name]) throw new TypeError(`makeChart: account “${a.name}” appears twice`);
    const acct = { ...a, order: i, normal: info.normal, element: info.element, sign: info.sign, statement: info.statement, temporary: info.temporary };
    byName[a.name] = acct;
    if (a.no != null) byNo[a.no] = acct;
    return acct;
  });
  // groups: a contra account sits with its asset; anything unstated is current
  for (const a of out) {
    if (a.group) continue;
    if (a.type === 'contra-asset') a.group = byName[a.contra]?.group || 'noncurrent';
    else if (a.element === 'assets' || a.element === 'liabilities') a.group = 'current';
  }
  return { list: out, byName, byNo };
}
const asChart = (chart) => makeChart(chart);

export function account(name, chart) { return asChart(chart).byName[name] || null; }
export function normalSide(acctName, chart) {
  const a = account(acctName, chart);
  if (!a) throw new Error(`normalSide: “${acctName}” is not in the chart of accounts`);
  return a.normal;
}
export const isCash = (a) => !!a && (a.cash === true || (a.cash !== false && a.type === 'asset' && /^(petty )?cash\b/i.test(a.name)));
export const isRetainedEarnings = (a) => !!a && a.type === 'equity' && (a.retained === true || /retained earnings/i.test(a.name));
/** "an asset", "a liability", "a revenue account" … */
export const typeNoun = (type) => TYPE_INFO[type]?.noun || 'an account';
/** Why an account of this type moves in this direction (for feedback). */
export const directionReason = (type, direction) => WHY[type]?.[direction] || '';
/** The debit-and-credit rule for one account and direction: "Accounts Payable is a liability, so an increase is a credit." */
export function sideRule(acctName, direction, chart) {
  const a = account(acctName, chart);
  if (!a) return '';
  const inc = direction === 'increase';
  const side = inc ? a.normal : (a.normal === 'dr' ? 'cr' : 'dr');
  return `${a.name} ${IS[a.type]}, so ${inc ? 'an increase' : 'a decrease'} is ${side === 'dr' ? 'a debit' : 'a credit'}.`;
}

// ---------------------------------------------------------------- lines and entries

/** A line's side and amount, or side null when it has both or neither. */
function sideOf(line) {
  const d = has(line?.dr), c = has(line?.cr);
  if (d === c) return { side: null, amount: NaN };
  return { side: d ? 'dr' : 'cr', amount: Number(d ? line.dr : line.cr) };
}

/** The effect of one line: which way the account moves and the signed change in its element of the equation. */
export function lineEffect(line, chart) {
  const ch = asChart(chart);
  const a = ch.byName[line?.acct];
  if (!a) throw new Error(`lineEffect: “${line?.acct}” is not in the chart of accounts`);
  const { side, amount } = sideOf(line);
  if (!side) throw new Error(`lineEffect: the line for ${a.name} needs exactly one of dr or cr`);
  const direction = side === a.normal ? 'increase' : 'decrease';
  const change = D(C(amount) * (direction === 'increase' ? 1 : -1) * a.sign);
  return { acct: a.name, type: a.type, side, amount, direction, element: a.element, change };
}

/** Net debit minus credit per account, in cents, in order of first appearance. */
function netByAccount(lines) {
  const m = new Map();
  for (const l of lines || []) {
    const { side, amount } = sideOf(l);
    if (!side || !l.acct || !Number.isFinite(amount)) continue;
    m.set(l.acct, (m.get(l.acct) || 0) + (side === 'dr' ? 1 : -1) * C(amount));
  }
  return m;
}

/**
 * One effect per account, with lines for the same account netted: [{ acct, type, side, amount, direction, element, change }].
 * Debits first, then credits, each in order of first appearance (the order a journal prints them).
 */
export function entryEffects(entry, chart) {
  const ch = asChart(chart);
  const out = [];
  for (const [acct, c] of netByAccount(entry?.lines)) {
    if (c === 0 || !ch.byName[acct]) continue;
    out.push(lineEffect(c > 0 ? { acct, dr: D(c) } : { acct, cr: D(-c) }, ch));
  }
  return [...out.filter((e) => e.side === 'dr'), ...out.filter((e) => e.side === 'cr')];
}

/** Is the entry a well-formed, balanced journal entry? Errors are plain English. */
export function validateEntry(entry, chart) {
  const ch = asChart(chart);
  const errors = [];
  const lines = entry?.lines || [];
  if (lines.length < 2) errors.push('A journal entry needs at least two lines: at least one debit and one credit.');
  let dr = 0, cr = 0;
  lines.forEach((l, i) => {
    const n = i + 1;
    if (!l?.acct) errors.push(`Line ${n} has no account.`);
    else if (!ch.byName[l.acct]) errors.push(`Line ${n}: “${l.acct}” is not in the chart of accounts.`);
    const d = has(l?.dr), c = has(l?.cr);
    if (d && c) { errors.push(`Line ${n} has both a debit and a credit. Give each line one or the other.`); return; }
    if (!d && !c) { errors.push(`Line ${n} has no amount.`); return; }
    const v = Number(d ? l.dr : l.cr);
    if (!Number.isFinite(v)) { errors.push(`Line ${n}: the amount is not a number.`); return; }
    if (v <= 0) { errors.push(`Line ${n}: amounts must be positive. Whether the line is a debit or a credit says which way the account moves.`); return; }
    if (Math.abs(v * 100 - Math.round(v * 100)) > 1e-6) { errors.push(`Line ${n}: amounts are in dollars and cents, so use at most two decimal places.`); return; }
    if (d) dr += C(v); else cr += C(v);
  });
  if (lines.length >= 2 && (dr === 0 || cr === 0) && dr + cr > 0) errors.push('An entry needs at least one debit and at least one credit.');
  else if (dr !== cr) errors.push(`Debits (${usd(D(dr))}) and credits (${usd(D(cr))}) are not equal: they differ by ${usd(D(Math.abs(dr - cr)))}.`);
  return { ok: errors.length === 0, errors };
}

/** The signed change in assets, liabilities and equity. For any balanced entry, assets = liabilities + equity. */
export function equationEffect(entry, chart) {
  const ch = asChart(chart);
  const t = { assets: 0, liabilities: 0, equity: 0 };
  for (const l of entry?.lines || []) { const e = lineEffect(l, ch); t[e.element] += C(e.change); }
  return { assets: D(t.assets), liabilities: D(t.liabilities), equity: D(t.equity) };
}

// ---------------------------------------------------------------- cash and its classification

/** Which activity a cash movement belongs to, judged from the account on the other side of the entry. */
export function counterClass(a) {
  if (!a) return 'operating';
  if (CASH_CLASSES.includes(a.cashClass)) return a.cashClass;
  if (a.type === 'dividends' || a.type === 'equity') return 'financing';
  if (a.type === 'liability' && /notes? payable|loans? payable|bonds? payable|mortgage|borrowing/i.test(a.name)) return 'financing';
  if ((a.type === 'asset' || a.type === 'contra-asset') && a.group === 'noncurrent') return 'investing';
  if (a.type === 'asset' && /notes? receivable|loans? receivable|investments?\b/i.test(a.name)) return 'investing';
  return 'operating';
}

/**
 * How an entry's cash movement splits across the three activities, in cents (+ in, − out), with the counter
 * accounts that decided each part. `entry.cash` wins when given.
 */
function cashSplit(entry, ch) {
  const parts = { operating: 0, investing: 0, financing: 0 };
  const by = { operating: [], investing: [], financing: [] };
  let net = 0;
  for (const l of entry?.lines || []) {
    const a = ch.byName[l.acct];
    if (!isCash(a)) continue;
    const { side, amount } = sideOf(l);
    if (side) net += (side === 'dr' ? 1 : -1) * C(amount);
  }
  if (net === 0) return { net, parts, by };
  const counterSide = net > 0 ? 'cr' : 'dr';
  const counters = [];
  for (const l of entry.lines) {
    const a = ch.byName[l.acct];
    if (!a || isCash(a)) continue;
    const { side, amount } = sideOf(l);
    if (side === counterSide) counters.push({ a, cents: C(amount), cls: counterClass(a) });
  }
  counters.sort((x, y) => y.cents - x.cents);
  counters.forEach((k) => by[k.cls].push(k.a));
  if (typeof entry.cash === 'string' && CASH_CLASSES.includes(entry.cash)) {
    parts[entry.cash] = net;
    if (!by[entry.cash].length && counters.length) by[entry.cash] = counters.map((k) => k.a);
    return { net, parts, by };
  }
  if (entry.cash && typeof entry.cash === 'object') {
    const given = Object.fromEntries(CASH_CLASSES.map((k) => [k, C(entry.cash[k] || 0)]));
    if (given.operating + given.investing + given.financing === net) {
      CASH_CLASSES.forEach((k) => { parts[k] = given[k]; if (given[k] && !by[k].length && counters.length) by[k] = counters.map((x) => x.a); });
      return { net, parts, by };
    }
  }
  if (!counters.length) { parts.operating = net; return { net, parts, by }; }
  // share the cash among the counter lines in proportion to their amounts; the largest takes any rounding cent
  const total = counters.reduce((s, k) => s + k.cents, 0);
  let left = net;
  counters.forEach((k, i) => {
    const share = i === counters.length - 1 ? left : Math.round((net * k.cents) / total);
    parts[k.cls] += share; left -= share;
  });
  return { net, parts, by };
}

/**
 * Which statements a transaction changes, and the cash-flow activity when cash moves.
 * income: a revenue or expense changes. equity: anything inside equity changes (revenue and expenses through net
 * income, dividends, stock). balance: every valid entry (revenue and expenses end up in retained earnings).
 * cash: Cash changes. cashClass: the activity (the largest part if an entry splits); cashClasses: every part.
 */
export function statementsAffected(entry, chart) {
  const ch = asChart(chart);
  const accts = (entry?.lines || []).map((l) => ch.byName[l.acct]).filter(Boolean);
  const income = accts.some((a) => a.type === 'revenue' || a.type === 'contra-revenue' || a.type === 'expense');
  const equity = accts.some((a) => a.element === 'equity' && a.type !== 'summary');
  const cashLines = accts.some(isCash);
  const split = cashLines ? cashSplit(entry, ch) : null;
  const cash = !!split && split.net !== 0;
  let cashClass = null, cashClasses = [];
  if (cash) {
    cashClasses = CASH_CLASSES.filter((k) => split.parts[k] !== 0);
    cashClass = cashClasses.slice().sort((x, y) => Math.abs(split.parts[y]) - Math.abs(split.parts[x]))[0] || 'operating';
  }
  return { income, equity, balance: validateEntry(entry, ch).ok, cash, cashClass, cashClasses };
}

// ---------------------------------------------------------------- checking a student's entry

/** Why using `x` where the transaction needs `m` is wrong (both on the same side of the entry), or null. */
function swapReason(x, m, keyHasCash) {
  if (isCash(x) && !keyHasCash) return `No cash is received or paid in this transaction, so ${x.name} doesn’t change.`;
  const pair = `${x.type}>${m.type}`;
  if (x.type === 'asset' && /receivable/i.test(x.name) && isCash(m)) return `${x.name} records amounts customers still owe. Here the money is received straight away, so cash changes instead.`;
  if (x.type === 'liability' && /payable/i.test(x.name) && isCash(m)) return `${x.name} records amounts still owed. Here the business pays straight away, so cash changes instead.`;
  if (x.type === 'equity' && isRetainedEarnings(x) && m.type === 'equity') return `${x.name} holds profits kept in the business. Money the owners invest is contributed capital and goes to ${m.name}.`;
  switch (pair) {
    case 'expense>asset': return `${x.name} is an expense, but this cost hasn’t been used up yet. Until it is used, it is an asset.`;
    case 'asset>expense': return `${x.name} is an asset, but this cost has been used up in the period, so it is an expense.`;
    case 'revenue>liability': return `${x.name} is revenue, but the work hasn’t been done yet. Until it is, the business owes it to the customer: a liability.`;
    case 'liability>revenue': return `${x.name} is a liability, but the work has been done, so the amount has been earned: it is revenue.`;
    case 'expense>dividends': return `${x.name} is an expense, but a payment to shareholders is a distribution of profit, not a cost of running the business.`;
    case 'dividends>expense': return `Dividends are distributions to shareholders. This is a cost of running the business, so it is an expense.`;
    case 'revenue>equity': return `${x.name} is revenue, but money invested by an owner isn’t earned: it is contributed capital.`;
    case 'liability>equity': return `${x.name} is a liability, but this money comes from an owner, who receives shares rather than a promise of repayment.`;
    case 'equity>liability': return `${x.name} is part of equity, but this money has to be repaid, so it is a liability.`;
    case 'expense>liability': return `${x.name} is an expense, but this cost was already recorded as an expense when it was incurred. Paying it now settles the amount owed.`;
    case 'liability>expense': return `${x.name} is a liability, but nothing was owed for this before: the cost belongs to this period, so it is an expense.`;
    case 'asset>contra-asset': return `${x.name} keeps the asset’s original cost, which doesn’t change. Depreciation builds up in the asset’s contra account instead.`;
    case 'expense>contra-asset': return null;
    case 'asset>asset': return `${x.name} isn’t the asset that changes here.`;
    case 'liability>liability': return `${x.name} isn’t the liability that changes here.`;
    case 'revenue>revenue': return `${x.name} isn’t the right revenue account: check what kind of service was provided.`;
    case 'expense>expense': return `${x.name} isn’t the right expense: check what the cost was for.`;
    case 'equity>equity': return `${x.name} isn’t the equity account that changes here.`;
    default: return null;
  }
}

/**
 * Why an account a student picked doesn't belong in the entry, for drills where the student chooses the accounts.
 * It is compared with the key's accounts the student left out (on the same side first, if `side` is known).
 */
export function explainExtra(name, key, chart, { side = null, chosen = [] } = {}) {
  const ch = asChart(chart);
  const x = ch.byName[name];
  if (!x) return `“${name}” isn’t in this chart of accounts.`;
  const keyNet = netByAccount(key?.lines);
  const keyHasCash = [...keyNet.keys()].some((n) => isCash(ch.byName[n]));
  if (isCash(x) && !keyHasCash) return swapReason(x, x, false);
  const cands = [...keyNet].filter(([n, k]) => k && n !== name && ch.byName[n] && !chosen.includes(n)).map(([n, k]) => ({ a: ch.byName[n], k }));
  if (side) cands.sort((p, q) => ((p.k > 0) !== (side === 'dr')) - ((q.k > 0) !== (side === 'dr')));
  for (const c of cands) { const w = swapReason(x, c.a, keyHasCash); if (w) return w; }
  return `${x.name} doesn’t change in this transaction.`;
}

/** "Accounts Payable is a liability, so it increases with a credit. You debited it." */
function sideMessage(a, keyCents, gotCents) {
  const keySide = keyCents > 0 ? 'dr' : 'cr';
  const rule = keySide === 'dr' ? 'a debit' : 'a credit';
  const did = gotCents > 0 ? 'debited' : 'credited';
  const is = IS[a.type] || 'is an account';
  return keySide === a.normal
    ? `${a.name} ${is}, so it increases with ${rule}. You ${did} it.`
    : `${a.name} decreases here. It ${is}, so a decrease is ${rule}. You ${did} it.`;
}

/**
 * Compare a student's entry with the answer key, account by account on the NET amount (debits − credits),
 * ignoring line order and how the student split lines, to the cent.
 * Returns { correct, issues: [{ kind, acct, expected, got, message }] } where kind is one of
 * 'empty', 'unbalanced', 'unknown-account', 'missing-account', 'extra-account', 'wrong-side', 'wrong-amount'.
 * expected / got are signed dollars (+ debit, − credit) for account-level issues.
 */
export function checkEntry(key, answer, chart) {
  const ch = asChart(chart);
  const issues = [];
  const push = (kind, acct, expected, got, message) => issues.push({ kind, acct, expected, got, message });
  const lines = (answer?.lines || []).filter((l) => l && (l.acct || has(l.dr) || has(l.cr)));
  if (!lines.length) {
    push('empty', null, null, null, 'Write the entry first: choose the accounts that change and give each a debit or a credit amount.');
    return { correct: false, issues };
  }
  const got = new Map();
  let drT = 0, crT = 0;
  for (const l of lines) {
    const a = l.acct ? ch.byName[l.acct] : null;
    if (!l.acct) { push('unknown-account', null, null, null, 'Choose an account for every line that has an amount.'); continue; }
    if (!a) { push('unknown-account', l.acct, null, null, `“${l.acct}” isn’t in this chart of accounts. Choose an account from the list.`); continue; }
    const d = has(l.dr), c = has(l.cr);
    if (d && c) { push('wrong-side', a.name, null, null, `Put ${a.name}’s amount in one column only: debit or credit.`); continue; }
    if (!d && !c) { push('wrong-amount', a.name, null, null, `Give ${a.name} an amount in the debit or the credit column.`); continue; }
    const v = Number(d ? l.dr : l.cr);
    if (!Number.isFinite(v) || v <= 0) { push('wrong-amount', a.name, null, null, `The amount for ${a.name} must be a positive number. The column, debit or credit, says which way the account moves.`); continue; }
    const cents = C(v);
    if (d) drT += cents; else crT += cents;
    got.set(a.name, (got.get(a.name) || 0) + (d ? cents : -cents));
  }
  if (drT !== crT && (drT || crT)) push('unbalanced', null, null, { dr: D(drT), cr: D(crT) }, `Your debits total ${usd(D(drT))} but your credits total ${usd(D(crT))}. In every entry the debits and credits are equal.`);

  const keyNet = netByAccount(key?.lines);
  const keyHasCash = [...keyNet.keys()].some((n) => isCash(ch.byName[n]));
  const missing = [], extra = [];
  for (const [acct, k] of keyNet) {
    if (k === 0) continue;
    const g = got.get(acct) || 0;
    const a = ch.byName[acct];
    if (g === 0) { missing.push({ a, k }); continue; }
    if (Math.sign(g) !== Math.sign(k)) {
      push('wrong-side', acct, D(k), D(g), sideMessage(a, k, g) + (Math.abs(g) !== Math.abs(k) ? ' Check the amount too.' : ''));
      continue;
    }
    if (g !== k) push('wrong-amount', acct, D(k), D(g), `You ${g > 0 ? 'debited' : 'credited'} ${acct} ${usd(D(Math.abs(g)))}, which is ${Math.abs(g) > Math.abs(k) ? 'more' : 'less'} than its change in this transaction. Check the figures in the transaction.`);
  }
  for (const [acct, g] of got) if (g !== 0 && !keyNet.get(acct)) extra.push({ a: ch.byName[acct], g });
  // an extra account on the same side as a missing one is usually a substitution: explain the mix-up
  const used = new Set();
  for (const x of extra) {
    let m = missing.find((mm, i) => !used.has(i) && Math.sign(mm.k) === Math.sign(x.g) && mm.k === x.g);
    if (!m) m = missing.find((mm, i) => !used.has(i) && Math.sign(mm.k) === Math.sign(x.g));
    if (m) used.add(missing.indexOf(m));
    const why = (m && swapReason(x.a, m.a, keyHasCash)) || (isCash(x.a) && !keyHasCash ? swapReason(x.a, x.a, false) : null);
    push('extra-account', x.a.name, 0, D(x.g), why || `${x.a.name} doesn’t change in this transaction.`);
  }
  for (const m of missing) push('missing-account', m.a.name, D(m.k), 0, `Your entry leaves out ${typeNoun(m.a.type)} that changes in this transaction.`);
  return { correct: issues.length === 0, issues };
}

// ---------------------------------------------------------------- posting and the trial balance

/** A short label for an entry in journals and T-accounts: m3 → "3", a2 → "A2", c1 → "C1", g4 → "4". */
export function entryLabel(e) {
  if (e?.label) return String(e.label);
  const id = String(e?.id ?? '');
  let m;
  if ((m = /^[mg](\d+)$/.exec(id))) return m[1];
  if ((m = /^([ac])(\d+)$/.exec(id))) return `${m[1].toUpperCase()}${m[2]}`;
  return id;
}

/**
 * Post entries to a general ledger. `opening` gives starting balances by account name, positive on the
 * account's normal side. Returns { [acct]: { acct, no, type, normal, lines: [{ date, ref, label, memo, dr, cr, balance }], dr, cr, balance } }
 * with every balance positive on the account's normal side (negative means an abnormal balance).
 */
export function post(entries, chart, opening = {}) {
  const ch = asChart(chart);
  const L = {};
  const acc = (a) => (L[a.name] ||= { acct: a.name, no: a.no ?? null, type: a.type, normal: a.normal, lines: [], dr: 0, cr: 0, balance: 0 });
  const add = (a, line, side, cents) => {
    const t = acc(a);
    if (side === 'dr') t.dr += cents; else t.cr += cents;
    t.balance = a.normal === 'dr' ? t.dr - t.cr : t.cr - t.dr;
    t.lines.push({ ...line, dr: side === 'dr' ? cents : null, cr: side === 'cr' ? cents : null, balance: t.balance });
  };
  for (const a of ch.list) {
    const v = opening?.[a.name];
    if (!v || !Number.isFinite(Number(v))) continue;
    const cents = C(v);
    const side = cents > 0 ? a.normal : (a.normal === 'dr' ? 'cr' : 'dr');
    add(a, { date: null, ref: 'opening', label: 'Bal.', memo: 'Opening balance' }, side, Math.abs(cents));
  }
  for (const e of entries || []) {
    for (const l of e.lines || []) {
      const a = ch.byName[l.acct];
      if (!a) throw new Error(`post: “${l.acct}” in entry ${e.id ?? ''} is not in the chart of accounts`);
      const { side, amount } = sideOf(l);
      if (!side || !Number.isFinite(amount)) throw new Error(`post: a line for ${a.name} in entry ${e.id ?? ''} needs exactly one of dr or cr`);
      add(a, { date: e.date ?? null, ref: e.id ?? null, label: entryLabel(e), memo: l.memo ?? e.memo ?? e.text ?? '' }, side, C(amount));
    }
  }
  // cents → dollars
  for (const t of Object.values(L)) {
    t.dr = D(t.dr); t.cr = D(t.cr); t.balance = D(t.balance);
    t.lines = t.lines.map((x) => ({ ...x, dr: x.dr == null ? null : D(x.dr), cr: x.cr == null ? null : D(x.cr), balance: D(x.balance) }));
  }
  return L;
}

/** Ledger accounts in chart order (only those posted to). */
export function ledgerAccounts(ledger, chart) {
  return asChart(chart).list.filter((a) => ledger[a.name]).map((a) => ledger[a.name]);
}
const bal = (ledger, name) => C(ledger?.[name]?.balance || 0);

/** The trial balance: one row per account with a balance, in chart order. Zero balances are omitted. */
export function trialBalance(ledger, chart) {
  const ch = asChart(chart);
  const rows = [];
  let dr = 0, cr = 0;
  for (const a of ch.list) {
    const b = bal(ledger, a.name);
    if (!b) continue;
    const onDr = (a.normal === 'dr') === (b > 0);
    const v = Math.abs(b);
    rows.push({ acct: a.name, no: a.no ?? null, type: a.type, dr: onDr ? D(v) : 0, cr: onDr ? 0 : D(v) });
    if (onDr) dr += v; else cr += v;
  }
  return { rows, dr: D(dr), cr: D(cr), balanced: dr === cr };
}

/** Balances of every account by element, signed so that assets = liabilities + equity. */
export function equationTotals(ledger, chart) {
  const ch = asChart(chart);
  const t = { assets: 0, liabilities: 0, equity: 0 };
  for (const a of ch.list) t[a.element] += a.sign * bal(ledger, a.name);
  return { assets: D(t.assets), liabilities: D(t.liabilities), equity: D(t.equity), balanced: t.assets === t.liabilities + t.equity };
}

// ---------------------------------------------------------------- the financial statements

/** Income statement from an adjusted ledger (before closing). Amounts are positive for normal balances; a contra-revenue
 *  account (sales returns, discounts) appears among the revenues as a negative amount, so totalRevenue is net revenue. */
export function incomeStatement(ledger, chart) {
  const ch = asChart(chart);
  const revenues = [], expenses = [];
  let rv = 0, ex = 0;
  for (const a of ch.list) {
    const b = bal(ledger, a.name);
    if (!b) continue;
    if (a.type === 'revenue') { revenues.push([a.name, D(b)]); rv += b; }
    if (a.type === 'contra-revenue') { revenues.push([a.name, D(-b)]); rv -= b; }
    if (a.type === 'expense') { expenses.push([a.name, D(b)]); ex += b; }
  }
  return { revenues, expenses, totalRevenue: D(rv), totalExpenses: D(ex), netIncome: D(rv - ex) };
}

function equityParts(ledger, ch) {
  let contributed = 0, re = 0, ni = 0, div = 0, summary = 0;
  const contributedRows = [];
  for (const a of ch.list) {
    const b = bal(ledger, a.name);
    if (a.type === 'equity' && !isRetainedEarnings(a)) { contributed += b; if (b) contributedRows.push([a.name, D(b)]); }
    if (isRetainedEarnings(a)) re += b;
    if (a.type === 'revenue') ni += b;
    if (a.type === 'contra-revenue') ni -= b;
    if (a.type === 'expense') ni -= b;
    if (a.type === 'dividends') div += b;
    if (a.type === 'summary') summary += b;
  }
  const reName = ch.list.find(isRetainedEarnings)?.name || 'Retained Earnings';
  return { contributed, contributedRows, re, ni, div, summary, reName };
}

/**
 * Statement of changes in equity. `opening` gives beginning balances by account name (normal side positive).
 * rows: [[label, commonStock|null, retainedEarnings|null, total]] from beginning to ending balance.
 */
export function equityStatement(ledger, chart, opening = {}) {
  const ch = asChart(chart);
  const p = equityParts(ledger, ch);
  const csBegin = ch.list.filter((a) => a.type === 'equity' && !isRetainedEarnings(a)).reduce((s, a) => s + C(opening?.[a.name] || 0), 0);
  const reBegin = ch.list.filter(isRetainedEarnings).reduce((s, a) => s + C(opening?.[a.name] || 0), 0);
  const issued = p.contributed - csBegin;
  const other = p.re + p.summary - reBegin;          // changes posted straight to retained earnings (e.g. closing already done)
  const reEnd = p.re + p.summary + p.ni - p.div;
  const rows = [['Beginning balance', D(csBegin), D(reBegin), D(csBegin + reBegin)]];
  if (issued) rows.push([issued > 0 ? 'Common stock issued' : 'Common stock repurchased', D(issued), null, D(issued)]);
  if (p.ni) rows.push([p.ni >= 0 ? 'Net income' : 'Net loss', null, D(p.ni), D(p.ni)]);
  if (p.div) rows.push(['Dividends', null, D(-p.div), D(-p.div)]);
  if (other) rows.push(['Other changes in retained earnings', null, D(other), D(other)]);
  rows.push(['Ending balance', D(p.contributed), D(reEnd), D(p.contributed + reEnd)]);
  return {
    rows,
    commonStock: { begin: D(csBegin), issued: D(issued), end: D(p.contributed) },
    retainedEarnings: { begin: D(reBegin), netIncome: D(p.ni), dividends: D(p.div), other: D(other), end: D(reEnd) },
    total: D(p.contributed + reEnd),
  };
}

/**
 * Balance sheet. Contra accounts appear as negatives straight after their asset. Retained earnings include this
 * period's net income less dividends while the temporary accounts are still open.
 */
export function balanceSheet(ledger, chart) {
  const ch = asChart(chart);
  const section = () => ({ current: [], noncurrent: [], currentTotal: 0, noncurrentTotal: 0, total: 0 });
  const A = section(), Lb = section();
  const placed = new Set();
  const addA = (a, cents) => { const g = a.group === 'noncurrent' ? 'noncurrent' : 'current'; A[g].push([a.name, D(cents)]); A[`${g}Total`] += cents; A.total += cents; };
  for (const a of ch.list) {
    if (a.type !== 'asset') continue;
    const b = bal(ledger, a.name);
    const contras = ch.list.filter((c) => c.type === 'contra-asset' && c.contra === a.name && bal(ledger, c.name));
    if (!b && !contras.length) continue;
    if (b || contras.length) addA(a, b);
    for (const c of contras) { addA({ ...c, group: a.group }, -bal(ledger, c.name)); placed.add(c.name); }
  }
  for (const c of ch.list) if (c.type === 'contra-asset' && !placed.has(c.name) && bal(ledger, c.name)) addA(c, -bal(ledger, c.name));
  for (const a of ch.list) {
    if (a.type !== 'liability') continue;
    const b = bal(ledger, a.name);
    if (!b) continue;
    const g = a.group === 'noncurrent' ? 'noncurrent' : 'current';
    Lb[g].push([a.name, D(b)]); Lb[`${g}Total`] += b; Lb.total += b;
  }
  const p = equityParts(ledger, ch);
  const reEnd = p.re + p.summary + p.ni - p.div;
  const equity = [...p.contributedRows];
  if (reEnd || p.re || p.ni || p.div) equity.push([p.reName, D(reEnd)]);
  const eqTotal = p.contributed + reEnd;
  const money = (s) => ({ current: s.current, noncurrent: s.noncurrent, currentTotal: D(s.currentTotal), noncurrentTotal: D(s.noncurrentTotal), total: D(s.total) });
  return { assets: money(A), liabilities: money(Lb), equity, equityTotal: D(eqTotal), balanced: A.total === Lb.total + eqTotal };
}

/** A line label for the direct-method statement of cash flows. */
function flowLabel(cls, a, inflow) {
  const n = a?.name || '';
  if (cls === 'operating') {
    if (inflow) {
      if (/interest/i.test(n)) return 'Interest received';
      if (/dividend/i.test(n)) return 'Dividends received';
      if (!a || a.type === 'revenue' || a.type === 'contra-revenue' || /receivable|unearned|deferred/i.test(n)) return 'Cash received from customers';
      return 'Other operating receipts';
    }
    if (/wage|salar|payroll/i.test(n)) return 'Cash paid to employees';
    if (/interest/i.test(n)) return 'Interest paid';
    if (/tax/i.test(n)) return 'Income taxes paid';
    if (/insurance/i.test(n)) return 'Cash paid for insurance';
    if (/rent/i.test(n)) return 'Cash paid for rent';
    if (/advertis/i.test(n)) return 'Cash paid for advertising';
    if (a?.type === 'contra-revenue' || /unearned|deferred|receivable/i.test(n)) return 'Refunds paid to customers';
    return 'Cash paid to suppliers';
  }
  if (cls === 'investing') {
    if (/receivable/i.test(n)) return inflow ? `Collection of ${lower(n)}` : 'Loans made to others';
    return inflow ? `Sale of ${lower(n || 'long-term assets')}` : `Purchase of ${lower(n || 'long-term assets')}`;
  }
  if (a?.type === 'dividends') return inflow ? 'Dividends returned' : 'Dividends paid';
  if (a?.type === 'equity') return inflow ? `Issuance of ${lower(n)}` : `Repurchase of ${lower(n)}`;
  return inflow ? `Proceeds from ${lower(n || 'borrowing')}` : `Repayment of ${lower(n || 'borrowing')}`;
}

/** The noncash part of a purchase when some cash was paid: "on credit", "through a note payable". */
function partBy(a) {
  if (/accounts payable/i.test(a.name)) return 'on credit';
  if (/notes? payable/i.test(a.name)) return 'through a note payable';
  if (a.type === 'equity') return `in ${lower(a.name)}`;
  return `through ${lower(a.name)}`;
}
/** How a noncurrent asset was paid for when no cash moved: "on credit", "by signing a note payable". */
function acquiredBy(a) {
  if (/accounts payable/i.test(a.name)) return 'bought on credit';
  if (/notes? payable/i.test(a.name)) return 'bought by signing a note payable';
  if (a.type === 'equity') return `received in exchange for ${lower(a.name)}`;
  return `acquired in exchange for ${lower(a.name)}`;
}

/**
 * Statement of cash flows by the direct method, built from the Cash lines of the entries.
 * Returns { operating, investing, financing, net, lines: [[text, amount, class]], noncash: [text] }.
 * Within each activity, receipts come before payments; noncash lists investing and financing activities with
 * no cash, such as equipment bought on credit.
 */
export function cashFlows(entries, chart) {
  const ch = asChart(chart);
  const totals = { operating: 0, investing: 0, financing: 0 };
  const groups = new Map();   // `${cls}|${label}` → { cls, label, cents, order, inflow }
  const noncash = [];
  let order = 0;
  for (const e of entries || []) {
    const sp = cashSplit(e, ch);
    for (const cls of CASH_CLASSES) {
      const c = sp.parts[cls];
      if (!c) continue;
      totals[cls] += c;
      const label = (typeof e.cashLabel === 'string' && e.cashLabel) || flowLabel(cls, sp.by[cls][0], c > 0);
      const k = `${cls}|${label}`;
      if (!groups.has(k)) groups.set(k, { cls, label, cents: 0, order: order++, inflow: c > 0 });
      groups.get(k).cents += c;
    }
    // noncash investing and financing: a long-term asset paid for (partly) with a liability or stock
    const lines = e.lines || [];
    const ncDebits = lines.filter((l) => { const a = ch.byName[l.acct]; return a && a.type === 'asset' && counterClass(a) === 'investing' && sideOf(l).side === 'dr'; });
    const finCredits = lines.filter((l) => { const a = ch.byName[l.acct]; return a && (a.type === 'liability' || a.type === 'equity') && sideOf(l).side === 'cr'; });
    if (ncDebits.length && finCredits.length) {
      const assetCents = ncDebits.reduce((s, l) => s + C(sideOf(l).amount), 0);
      const paid = -sp.parts.investing;
      const finCents = finCredits.reduce((s, l) => s + C(sideOf(l).amount), 0);
      const nc = Math.min(assetCents - Math.max(paid, 0), finCents);
      if (nc > 0) {
        const how = finCredits.sort((x, y) => C(sideOf(y).amount) - C(sideOf(x).amount))[0];
        const what = ncDebits.map((l) => l.acct).join(' and ');
        // ASC 230-10-50-3: relate the cash and noncash parts of a part-cash purchase
        noncash.push(paid > 0
          ? `${what} costing ${usd(D(assetCents))} acquired for ${usd(D(paid))} in cash (shown in investing activities) and ${usd(D(nc))} ${partBy(ch.byName[how.acct])}.`
          : `${what} of ${usd(D(nc))} ${acquiredBy(ch.byName[how.acct])}.`);
      }
    } else if (!sp.net) {
      // debt settled by issuing stock
      const drDebt = lines.find((l) => { const a = ch.byName[l.acct]; return a && counterClass(a) === 'financing' && a.type === 'liability' && sideOf(l).side === 'dr'; });
      const crStock = lines.find((l) => { const a = ch.byName[l.acct]; return a && a.type === 'equity' && sideOf(l).side === 'cr'; });
      if (drDebt && crStock) noncash.push(`${drDebt.acct} of ${usd(sideOf(drDebt).amount)} settled by issuing ${lower(crStock.acct)}.`);
    }
  }
  const lines = [...groups.values()]
    .filter((g) => g.cents)
    .sort((x, y) => CASH_CLASSES.indexOf(x.cls) - CASH_CLASSES.indexOf(y.cls) || (y.cents > 0) - (x.cents > 0) || x.order - y.order)
    .map((g) => [g.label, D(g.cents), g.cls]);
  const net = totals.operating + totals.investing + totals.financing;
  return { operating: D(totals.operating), investing: D(totals.investing), financing: D(totals.financing), net: D(net), lines, noncash };
}

// ---------------------------------------------------------------- F02: the multi-step income statement and the indirect method

/**
 * A multi-step income statement from an adjusted ledger (before closing). Accounts say where they go:
 * - revenue: `section: 'other'` for non-operating income (interest revenue); a revenue account with `gain: true` and no
 *   `section: 'other'` is an operating gain, added after operating expenses (ASC 360-10-45-5 puts gains and losses on
 *   selling long-lived assets inside operating income when that subtotal is shown); otherwise it is operating revenue.
 * - contra-revenue: subtracted from operating revenue (sales returns and allowances, sales discounts).
 * - expense: `section: 'cost'` (cost of sales), 'operating' (the default), 'other' (interest expense, losses) or 'tax'.
 *   `da: true` marks depreciation and amortisation (for EBITDA); `interest: true` marks interest (for EBIT).
 * EBIT = income before tax + interest expense − interest revenue; EBITDA = EBIT + depreciation and amortisation.
 * Amounts are in dollars; lists are [name, amount] in chart order.
 */
export function multiStepIncome(ledger, chart) {
  const ch = asChart(chart);
  const L = { revenue: [], contra: [], cost: [], operating: [], operatingGains: [], otherIncome: [], otherExpense: [], tax: [] };
  const T = { grossRevenue: 0, contra: 0, cost: 0, operating: 0, operatingGains: 0, otherIncome: 0, otherExpense: 0, tax: 0, da: 0, interestExp: 0, interestRev: 0 };
  for (const a of ch.list) {
    const b = bal(ledger, a.name);
    if (!b) continue;
    if (a.type === 'revenue') {
      if (a.section === 'other') { L.otherIncome.push([a.name, D(b)]); T.otherIncome += b; if (a.interest || /interest/i.test(a.name)) T.interestRev += b; }
      else if (a.gain) { L.operatingGains.push([a.name, D(b)]); T.operatingGains += b; }
      else { L.revenue.push([a.name, D(b)]); T.grossRevenue += b; }
    } else if (a.type === 'contra-revenue') { L.contra.push([a.name, D(b)]); T.contra += b; }
    else if (a.type === 'expense') {
      const sec = ['cost', 'other', 'tax'].includes(a.section) ? a.section : 'operating';
      const key = sec === 'other' ? 'otherExpense' : sec;
      L[key].push([a.name, D(b)]); T[key] += b;
      if (a.da) T.da += b;
      if (sec !== 'tax' && (a.interest || (sec === 'other' && /interest/i.test(a.name)))) T.interestExp += b;
    }
  }
  const revenue = T.grossRevenue - T.contra;
  const grossProfit = revenue - T.cost;
  const operatingIncome = grossProfit - T.operating + T.operatingGains;
  const incomeBeforeTax = operatingIncome + T.otherIncome - T.otherExpense;
  const netIncome = incomeBeforeTax - T.tax;
  const ebit = incomeBeforeTax + T.interestExp - T.interestRev;
  return {
    lists: Object.fromEntries(Object.entries(L)),
    grossRevenue: D(T.grossRevenue), contraRevenue: D(T.contra), revenue: D(revenue),
    costOfSales: D(T.cost), grossProfit: D(grossProfit),
    operatingExpenses: D(T.operating), operatingGains: D(T.operatingGains), operatingIncome: D(operatingIncome),
    otherIncome: D(T.otherIncome), otherExpenses: D(T.otherExpense),
    incomeBeforeTax: D(incomeBeforeTax), incomeTax: D(T.tax), netIncome: D(netIncome),
    interestExpense: D(T.interestExp), interestRevenue: D(T.interestRev),
    depreciationAmortisation: D(T.da), ebit: D(ebit), ebitda: D(ebit + T.da),
  };
}

/**
 * Cash from operating activities by the indirect method: net income, adjusted for noncash items and for the change
 * in each operating current asset and liability between `opening` (balances at the start, normal side positive)
 * and the adjusted ledger at the end (before closing).
 * - Expenses with `noncash: true` (depreciation, amortisation, impairment) are added back; revenue accounts with
 *   `gain: true` are subtracted and expense accounts with `loss: true` added back (their cash is investing).
 * - Working capital: every current asset (other than cash) and current liability whose activity is operating
 *   (see counterClass; give an account `cashClass` to override). A current contra-asset (an allowance) is netted with
 *   its asset, so receivables are taken net.
 * Returns { netIncome, adjustments: [[label, amount]], workingCapital: [[label, amount]], operating }.
 */
export function indirectOperating(ledger, chart, opening = {}) {
  const ch = asChart(chart);
  const ni = C(incomeStatement(ledger, ch).netIncome);
  const adjustments = [], workingCapital = [];
  let total = ni;
  for (const a of ch.list) {
    const b = bal(ledger, a.name);
    if (!b) continue;
    if (a.type === 'expense' && (a.noncash || a.loss)) { adjustments.push([a.loss ? `Loss on ${lower(a.name.replace(/^loss on /i, ''))}` : a.name.replace(/\s+expense$/i, ''), D(b)]); total += b; }
    if (a.type === 'revenue' && a.gain) { adjustments.push([a.name, D(-b)]); total -= b; }
  }
  const open = (name) => C(opening?.[name] || 0);
  const handled = new Set();
  for (const a of ch.list) {
    if (handled.has(a.name) || isCash(a)) continue;
    if (!['asset', 'contra-asset', 'liability'].includes(a.type) || a.group !== 'current' || counterClass(a) !== 'operating') continue;
    if (a.type === 'contra-asset' && a.contra && ch.byName[a.contra]) continue;   // netted with its asset below
    let change = (bal(ledger, a.name) - open(a.name));                           // on the account's normal side
    let name = a.name;
    if (a.type === 'asset') {
      const contras = ch.list.filter((c) => c.type === 'contra-asset' && c.contra === a.name);
      for (const c of contras) { change -= bal(ledger, c.name) - open(c.name); handled.add(c.name); }
      if (contras.length && contras.some((c) => bal(ledger, c.name) || open(c.name))) name = `${a.name} (net)`;
    }
    handled.add(a.name);
    if (!change) continue;
    const effect = a.type === 'liability' ? change : -change;                    // more assets use cash; more liabilities supply it
    workingCapital.push([`${change > 0 ? 'Increase' : 'Decrease'} in ${lower(name)}`, D(effect)]);
    total += effect;
  }
  return { netIncome: D(ni), adjustments, workingCapital, operating: D(total) };
}

// ---------------------------------------------------------------- closing the books

/**
 * Closing entries for the temporary accounts. method 'summary' closes revenues and expenses to Income Summary,
 * then Income Summary and Dividends to Retained Earnings (four entries when all are present); 'direct' closes
 * revenues, expenses and dividends straight to Retained Earnings. Accounts with zero balances are skipped.
 */
export function closingEntries(ledger, chart, { method = 'summary', date = null } = {}) {
  const ch = asChart(chart);
  const re = ch.list.find(isRetainedEarnings);
  if (!re) throw new Error('closingEntries: the chart needs a Retained Earnings account');
  const is = ch.list.find((a) => a.type === 'summary');
  if (method === 'summary' && !is) throw new Error('closingEntries: the chart has no Income Summary account; close directly instead');
  const target = method === 'summary' ? is : re;
  const entries = [];
  const close = (accts, text, into) => {
    const lines = [];
    let net = 0;   // dr − cr of the closing lines, in cents
    for (const a of accts) {
      const b = bal(ledger, a.name);
      if (!b) continue;
      // move the balance off: post the opposite of its normal side (or the normal side for an abnormal balance)
      const side = (b > 0) === (a.normal === 'dr') ? 'cr' : 'dr';
      lines.push(side === 'dr' ? { acct: a.name, dr: D(Math.abs(b)) } : { acct: a.name, cr: D(Math.abs(b)) });
      net += (side === 'dr' ? 1 : -1) * Math.abs(b);
    }
    if (!lines.length || !net) return 0;
    const plug = net > 0 ? { acct: into.name, cr: D(net) } : { acct: into.name, dr: D(-net) };
    const dr = lines.filter((l) => l.dr != null), cr = lines.filter((l) => l.cr != null);
    entries.push({ id: `c${entries.length + 1}`, date, text, lines: plug.dr != null ? [plug, ...dr, ...cr] : [...dr, ...cr, plug] });
    return net;
  };
  const revs = ch.list.filter((a) => a.type === 'revenue' || a.type === 'contra-revenue');
  const exps = ch.list.filter((a) => a.type === 'expense');
  const divs = ch.list.filter((a) => a.type === 'dividends');
  close(revs, `Close the revenue accounts to ${target.name}.`, target);
  close(exps, `Close the expense accounts to ${target.name}.`, target);
  if (method === 'summary') {
    const ni = bal(ledger, is.name) + revs.reduce((s, a) => s + (a.type === 'contra-revenue' ? -1 : 1) * bal(ledger, a.name), 0) - exps.reduce((s, a) => s + bal(ledger, a.name), 0);
    if (ni > 0) entries.push({ id: `c${entries.length + 1}`, date, text: `Close ${is.name} (net income) to ${re.name}.`, lines: [{ acct: is.name, dr: D(ni) }, { acct: re.name, cr: D(ni) }] });
    if (ni < 0) entries.push({ id: `c${entries.length + 1}`, date, text: `Close ${is.name} (net loss) to ${re.name}.`, lines: [{ acct: re.name, dr: D(-ni) }, { acct: is.name, cr: D(-ni) }] });
  }
  close(divs, `Close Dividends to ${re.name}.`, re);
  return entries;
}

// ---------------------------------------------------------------- practice transactions

/**
 * Standing facts about Lantern Coffee Co. that the generator uses when it continues the story from the case's
 * balances. They agree with f01/case.js (tests/accounting.test.mjs checks them against its adjusting entries).
 */
export const LANTERN_FACTS = {
  owner: 'Ana Lim',
  lender: 'Coastline Bank',
  noteRate: 0.06,               // the $10,000 note signed on 1 March
  insuranceAnnual: 1800,        // 12-month policy from 1 March
  equipmentLifeYears: 5,        // straight-line, no residual value, full month in the month of purchase
  rent: 1200,                   // shared kitchen, per month
  unearned: { client: 'Harbor Tech', per: 800 },   // two prepaid events still to cater after March
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const CLIENTS = ['Meridian Partners', 'Pier Nine Studio', 'Northgate Library', 'Saltmarsh Design', 'Tidewater Dental', 'Quayside Hotel', 'Wren & Hale Architects', 'Orchard Lane School', 'Lumen Yoga', 'Harbor Tech'];
const EVENTS = ['team breakfast', 'product launch', 'board meeting', 'staff training day', 'open-house evening', 'client workshop', 'charity reception', 'two-day conference'];
const SUPPLIES = [['coffee beans', 'Ridgeback Roasters'], ['milk and oat milk', 'Valley Fresh Dairy'], ['cups, lids and sleeves', 'Greenleaf Packaging'], ['filters and cleaning tablets', 'Greenleaf Packaging'], ['a month’s coffee beans', 'Ridgeback Roasters']];
const EQUIPMENT = [['second espresso grinder', 1800, 3000], ['cold-brew tower', 900, 1500], ['portable espresso cart', 3600, 6000], ['water-filtration unit', 600, 1200], ['commercial milk frother', 600, 900], ['set of insulated airpots', 300, 900]];
const BILLS = [['Utilities Expense', 'Bayline Power', 'electricity used this month', 140, 320], ['Repairs Expense', 'Steamworks Repairs', 'servicing the espresso machine', 150, 450], ['Advertising Expense', 'Fernhill Print', 'flyers handed out this month', 120, 400]];
const CASH_COSTS = [
  ['Advertising Expense', (x) => `Lantern pays ${usd(x)} for social-media advertising that runs this month.`, 150, 600, 10],
  ['Utilities Expense', (x, m) => `Lantern pays its ${usd(x)} internet and phone bill for ${m}.`, 80, 160, 5],
  ['Fuel Expense', (x) => `Lantern pays ${usd(x)} for fuel for its catering deliveries.`, 60, 220, 5],
  ['Repairs Expense', (x) => `Lantern pays a technician ${usd(x)} to fix a leaking steam wand.`, 120, 380, 10],
  ['Miscellaneous Expense', (x) => `Lantern pays ${usd(x)} to renew its food-hygiene certificate.`, 75, 150, 5],
];

/** Pick helpers on a seeded generator. */
function picker(r) {
  const int = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
  return {
    r, int,
    one: (arr) => arr[Math.floor(r() * arr.length)],
    step: (lo, hi, st) => lo + st * int(0, Math.floor((hi - lo) / st)),
  };
}

/**
 * Practice transactions in Lantern's world, deterministic for a seed.
 *   level 1: two-account cash and stock transactions
 *   level 2: purchases and sales on account, collections and payments
 *   level 3: unearned and prepaid items, accruals, dividends and notes
 *   level 4: compound entries during the month, then adjusting entries at its end
 * opts: { level = 1, count = 8, start = '2026-04-01', opening = {} (balances to continue from, normal side
 * positive), facts = LANTERN_FACTS (used only for balances that come from `opening`) }.
 * Every entry balances, uses only accounts from Lantern's chart and never takes a balance below zero.
 * Returns [{ id, date, text, lines, cash? }] in date order.
 */
export function generateTransactions(seed, { level = 1, count = 8, start = '2026-04-01', opening = {}, facts = LANTERN_FACTS } = {}) {
  const lv = Math.min(4, Math.max(1, Math.round(Number(level)) || 1));
  const P = picker(mulberry32(((Number(seed) >>> 0) ^ ((0x9E3779B9 * lv) >>> 0)) >>> 0));
  const n = Math.min(40, Math.max(1, Math.round(Number(count)) || 8));
  const [yy, mm] = start.split('-').map(Number);
  const month = MONTHS[mm - 1];
  const lastDay = new Date(Date.UTC(yy, mm, 0)).getUTCDate();
  const iso = (d) => `${yy}-${String(mm).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const dayText = (d) => `${d} ${month}`;

  // what the business has: balances (normal side, cents) and the stories behind some of them
  const st = { bal: {}, receivables: [], payables: [], unearned: [], notes: [], prepaid: {}, equipCost: 0 };
  const B = (name) => st.bal[name] || 0;
  for (const [k, v] of Object.entries(opening || {})) if (Number(v)) st.bal[k] = C(v);
  if (B('Accounts Receivable') > 0) st.receivables.push({ who: null, cents: B('Accounts Receivable') });
  if (B('Accounts Payable') > 0) st.payables.push({ who: null, cents: B('Accounts Payable') });
  if (B('Unearned Revenue') > 0) st.unearned.push({ who: facts?.unearned?.client || null, per: C(facts?.unearned?.per || 0), cents: B('Unearned Revenue') });
  if (B('Notes Payable') > 0) st.notes.push({ lender: facts?.lender || 'the bank', cents: B('Notes Payable'), rate: facts?.noteRate ?? null, fullMonth: true });
  if (B('Prepaid Insurance') > 0 && facts?.insuranceAnnual) st.prepaid.insurance = { monthly: C(facts.insuranceAnnual / 12), annual: C(facts.insuranceAnnual) };
  if (B('Equipment') > 0) st.equipCost = B('Equipment');
  const NORMAL = { Cash: 'dr', 'Accounts Receivable': 'dr', 'Interest Receivable': 'dr', 'Notes Receivable': 'dr', Supplies: 'dr', 'Prepaid Insurance': 'dr', 'Prepaid Rent': 'dr', 'Prepaid Advertising': 'dr', Equipment: 'dr', Van: 'dr', Land: 'dr', Building: 'dr', Dividends: 'dr' };
  const normalOf = (name) => NORMAL[name] || (/Expense$/.test(name) ? 'dr' : 'cr');
  const apply = (lines) => lines.forEach((l) => { const s = l.dr != null ? 'dr' : 'cr'; st.bal[l.acct] = B(l.acct) + (s === normalOf(l.acct) ? 1 : -1) * C(l.dr ?? l.cr); });
  const cash = () => B('Cash');
  const two = (dr, cr, x) => [{ acct: dr, dr: x }, { acct: cr, cr: x }];

  // ---- templates: each returns { text, lines, cash?, after? } or null when it can't happen now
  const T = {
    // level 1
    stock: () => {
      const x = P.step(2000, 10000, 500);
      const who = P.r() < 0.6 ? `${facts?.owner || 'The owner'} invests a further ${usd(x)} in Lantern in exchange for common stock.` : `Ravi Mehta, a friend of ${facts?.owner || 'the owner'}’s, buys ${usd(x)} of Lantern’s common stock for cash.`;
      return { text: who, lines: two('Cash', 'Common Stock', x), cash: 'financing' };
    },
    cateringCash: () => {
      const x = P.step(350, 2400, 25);
      return { text: `Lantern caters ${an(P.one(EVENTS))} for ${P.one(CLIENTS)}, which pays ${usd(x)} in cash on the day.`, lines: two('Cash', 'Catering Revenue', x), cash: 'operating' };
    },
    trainingCash: () => {
      const k = P.int(4, 10), p = P.one([95, 110, 120, 125, 150]);
      return { text: `Lantern runs a barista-training workshop for ${k} people at ${usd(p)} each, paid in cash on the day.`, lines: two('Cash', 'Training Revenue', k * p), cash: 'operating' };
    },
    suppliesCash: () => {
      const [what, who] = P.one(SUPPLIES); const x = P.step(120, 900, 10);
      if (cash() < C(x)) return null;
      return { text: `Lantern buys ${what} from ${who} for ${usd(x)}, paying in cash.`, lines: two('Supplies', 'Cash', x), cash: 'operating' };
    },
    equipmentCash: () => {
      const [item, lo, hi] = P.one(EQUIPMENT); const x = P.step(lo, hi, 300);
      if (cash() < C(x)) return null;
      st.equipCost += C(x);
      return { text: `Lantern buys a ${item} for ${usd(x)}, paying in cash.`, lines: two('Equipment', 'Cash', x), cash: 'investing' };
    },
    rentCash: () => {
      const x = facts?.rent || 1200;
      if (cash() < C(x)) return null;
      return { text: `Lantern pays ${usd(x)} rent for its shared commercial kitchen for ${month}.`, lines: two('Rent Expense', 'Cash', x), cash: 'operating' };
    },
    wagesCash: () => {
      const x = P.step(600, 1800, 50);
      if (cash() < C(x)) return null;
      return { text: `Lantern pays its baristas ${usd(x)} for the shifts they worked this week.`, lines: two('Wages Expense', 'Cash', x), cash: 'operating' };
    },
    costCash: () => {
      const [acct, say, lo, hi, s] = P.one(CASH_COSTS); const x = P.step(lo, hi, s);
      if (cash() < C(x)) return null;
      return { text: say(x, month), lines: two(acct, 'Cash', x), cash: 'operating' };
    },
    // level 2
    suppliesAccount: () => {
      const [what, who] = P.one(SUPPLIES); const x = P.step(200, 1500, 10);
      st.payables.push({ who, cents: C(x) });
      return { text: `Lantern buys ${what} from ${who} for ${usd(x)} on account.`, lines: two('Supplies', 'Accounts Payable', x) };
    },
    equipmentAccount: () => {
      const [item, lo, hi] = P.one(EQUIPMENT); const x = P.step(lo, hi, 300); const who = 'Kettleworth Equipment';
      st.payables.push({ who, cents: C(x) }); st.equipCost += C(x);
      return { text: `Lantern buys a ${item} from ${who} for ${usd(x)}, to be paid in 60 days.`, lines: two('Equipment', 'Accounts Payable', x) };
    },
    invoiceCatering: () => {
      const x = P.step(500, 4000, 50); const who = P.one(CLIENTS);
      st.receivables.push({ who, cents: C(x) });
      return { text: `Lantern caters ${an(P.one(EVENTS))} for ${who} and sends an invoice for ${usd(x)}, due in 30 days.`, lines: two('Accounts Receivable', 'Catering Revenue', x) };
    },
    invoiceTraining: () => {
      const x = P.step(400, 1800, 50); const who = P.one(CLIENTS);
      st.receivables.push({ who, cents: C(x) });
      return { text: `Lantern runs a barista course for ${poss(who)} staff and invoices ${usd(x)}, due in 30 days.`, lines: two('Accounts Receivable', 'Training Revenue', x) };
    },
    collect: () => {
      const open = st.receivables.filter((k) => k.cents > 0);
      if (!open.length) return null;
      const k = P.one(open);
      const all = P.r() < 0.55 || k.cents < 20000;
      const x = all ? k.cents : Math.round(k.cents * P.one([0.5, 0.6, 0.75]) / 5000) * 5000 || k.cents;
      k.cents -= x;
      const text = k.who
        ? (all ? `${k.who} pays the ${usd(D(x))} it owes Lantern.` : `${k.who} pays ${usd(D(x))} of the ${usd(D(x + k.cents))} it owes Lantern.`)
        : `Clients pay ${usd(D(x))} of the amounts they owed Lantern at the start of ${month}.`;
      return { text, lines: two('Cash', 'Accounts Receivable', D(x)), cash: 'operating' };
    },
    paySupplier: () => {
      const open = st.payables.filter((k) => k.cents > 0);
      if (!open.length) return null;
      const k = P.one(open);
      let x = P.r() < 0.5 ? k.cents : Math.round(k.cents * P.one([0.4, 0.5, 0.6]) / 5000) * 5000 || k.cents;
      x = Math.min(x, cash());
      if (x < 5000) return null;
      const all = x === k.cents;
      k.cents -= x;
      const text = k.who
        ? (all ? `Lantern pays ${k.who} the ${usd(D(x))} it owes.` : `Lantern pays ${k.who} ${usd(D(x))} of the ${usd(D(x + k.cents))} it owes.`)
        : `Lantern pays suppliers ${usd(D(x))} of the amount it owed them at the start of ${month}.`;
      return { text, lines: two('Accounts Payable', 'Cash', D(x)), cash: 'operating' };
    },
    billExpense: () => {
      const [acct, who, what, lo, hi] = P.one(BILLS); const x = P.step(lo, hi, 5);
      st.payables.push({ who, cents: C(x) });
      return { text: `Lantern receives a ${usd(x)} bill from ${who} for ${what}, due next month.`, lines: two(acct, 'Accounts Payable', x) };
    },
    // level 3
    deposit: () => {
      const k = P.int(2, 4), per = P.step(500, 1200, 50); const who = P.one(CLIENTS);
      st.unearned.push({ who, per: C(per), cents: C(k * per) });
      return { text: `${who} pays Lantern a ${usd(k * per)} deposit for ${k} catered events over the coming weeks, at ${usd(per)} each.`, lines: two('Cash', 'Unearned Revenue', k * per), cash: 'operating' };
    },
    earnUnearned: () => {
      const open = st.unearned.filter((u) => u.cents > 0);
      if (!open.length) return null;
      const u = P.one(open);
      const x = u.per && u.per <= u.cents ? u.per : u.cents;
      u.cents -= x;
      const text = u.who && u.per
        ? `Lantern caters one of the events ${u.who} paid for in advance: ${usd(D(x))} of the deposit is now earned.`
        : `Lantern delivers ${usd(D(x))} of catering that a client had paid for in advance.`;
      return { text, lines: two('Unearned Revenue', 'Catering Revenue', D(x)) };
    },
    prepayInsurance: () => {
      const months = P.one([6, 12]); const monthly = P.step(60, 160, 10); const x = months * monthly;
      if (cash() < C(x)) return null;
      st.prepaid.insurance = { monthly: C(monthly), annual: C(monthly * 12), months };
      return { text: `Lantern pays ${usd(x)} for a ${months}-month insurance policy on its catering equipment, starting on 1 ${MONTHS[mm % 12]}.`, lines: two('Prepaid Insurance', 'Cash', x), cash: 'operating' };
    },
    prepayRent: () => {
      const months = P.one([3, 6]); const monthly = P.step(150, 300, 25); const x = months * monthly;
      if (cash() < C(x)) return null;
      st.prepaid.rent = { monthly: C(monthly), months };
      return { text: `Lantern pays ${usd(x)} in advance for ${months} months’ rent on a storage unit, starting next month.`, lines: two('Prepaid Rent', 'Cash', x), cash: 'operating' };
    },
    prepayAds: () => {
      const months = P.one([3, 4, 6]); const monthly = P.step(80, 200, 10); const x = months * monthly;
      if (cash() < C(x)) return null;
      st.prepaid.advertising = { monthly: C(monthly), months };
      return { text: `Lantern pays the Coastline Weekly ${usd(x)} in advance for advertisements in its next ${months} monthly issues.`, lines: two('Prepaid Advertising', 'Cash', x), cash: 'operating' };
    },
    borrow: () => {
      const x = P.step(4000, 15000, 1000); const rate = P.one([0.06, 0.072, 0.09]); const yrs = P.int(2, 4);
      st.notes.push({ lender: facts?.lender || 'the bank', cents: C(x), rate, fullMonth: false });
      return { text: `Lantern borrows ${usd(x)} from ${facts?.lender || 'its bank'}, signing a ${yrs}-year note payable at ${+(rate * 100).toFixed(1)}% annual interest.`, lines: two('Cash', 'Notes Payable', x), cash: 'financing' };
    },
    repayNote: () => {
      const np = B('Notes Payable');
      if (np < 100000) return null;
      const x = Math.min(P.step(1000, 3000, 500), D(np));
      if (cash() < C(x)) return null;
      const note = st.notes.find((k) => k.cents >= C(x)); if (note) note.cents -= C(x);
      return { text: `Lantern repays ${usd(x)} of the principal of its bank loan early. No interest is due today.`, lines: two('Notes Payable', 'Cash', x), cash: 'financing' };
    },
    dividend: () => {
      const x = P.step(200, 800, 50);
      if (cash() < C(x) * 4) return null;
      return { text: `Lantern’s board declares and pays a ${usd(x)} cash dividend to its shareholders.`, lines: two('Dividends', 'Cash', x), cash: 'financing' };
    },
    payAccruedWages: () => {
      const x = B('Wages Payable');
      if (!x || cash() < x) return null;
      return { text: `Lantern pays its baristas the ${usd(D(x))} of wages they earned at the end of last month.`, lines: two('Wages Payable', 'Cash', D(x)), cash: 'operating' };
    },
    payAccruedInterest: () => {
      const x = B('Interest Payable');
      if (!x || cash() < x) return null;
      return { text: `Lantern pays the ${usd(D(x))} of interest that had built up on its bank note.`, lines: two('Interest Payable', 'Cash', D(x)), cash: 'operating' };
    },
    lendNote: () => {
      const x = P.step(1000, 4000, 500); const months = P.one([6, 9, 12]); const rate = P.one([0.05, 0.06]);
      if (cash() < C(x) * 2) return null;
      return { text: `Lantern lends ${usd(x)} to Mia Torres, a former barista starting her own coffee cart. She signs a ${months}-month note receivable at ${rate * 100}% interest.`, lines: two('Notes Receivable', 'Cash', x), cash: 'investing' };
    },
    // level 4: compound
    equipPartCash: () => {
      const [item, lo, hi] = P.one(EQUIPMENT.filter((e) => e[2] >= 1500)); const x = P.step(Math.max(lo, 1500), hi, 300);
      const y = Math.round((x * P.one([0.25, 1 / 3, 0.4, 0.5])) / 100) * 100;
      if (cash() < C(y) || y <= 0 || y >= x) return null;
      st.equipCost += C(x); st.payables.push({ who: 'Kettleworth Equipment', cents: C(x - y) });
      return { text: `Lantern buys a ${item} for ${usd(x)}, paying ${usd(y)} in cash and owing Kettleworth Equipment the remaining ${usd(x - y)}.`, lines: [{ acct: 'Equipment', dr: x }, { acct: 'Cash', cr: y }, { acct: 'Accounts Payable', cr: x - y }], cash: 'investing' };
    },
    cateringPartCash: () => {
      const x = P.step(800, 3600, 100); const y = Math.round((x * P.one([0.25, 0.4, 0.5])) / 50) * 50; const who = P.one(CLIENTS);
      st.receivables.push({ who, cents: C(x - y) });
      return { text: `Lantern caters ${an(P.one(EVENTS))} for ${who} for ${usd(x)}. ${who} pays ${usd(y)} on the day and will pay the remaining ${usd(x - y)} within 30 days.`, lines: [{ acct: 'Cash', dr: y }, { acct: 'Accounts Receivable', dr: x - y }, { acct: 'Catering Revenue', cr: x }], cash: 'operating' };
    },
    suppliesSplit: () => {
      const [what, who] = P.one(SUPPLIES); const x = P.step(400, 1600, 20); const y = Math.round((x * P.one([0.25, 0.5])) / 10) * 10;
      if (cash() < C(y)) return null;
      st.payables.push({ who, cents: C(x - y) });
      return { text: `Lantern buys ${what} from ${who} for ${usd(x)}, paying ${usd(y)} in cash and putting the rest on account.`, lines: [{ acct: 'Supplies', dr: x }, { acct: 'Cash', cr: y }, { acct: 'Accounts Payable', cr: x - y }], cash: 'operating' };
    },
    wagesWithAccrued: () => {
      const y = B('Wages Payable');
      if (!y) return null;
      const z = P.step(400, 1200, 50); const x = D(y) + z;
      if (cash() < C(x)) return null;
      return { text: `Lantern pays its baristas ${usd(x)}: ${usd(D(y))} for wages accrued at the end of last month and ${usd(z)} for work done this month.`, lines: [{ acct: 'Wages Payable', dr: D(y) }, { acct: 'Wages Expense', dr: z }, { acct: 'Cash', cr: x }], cash: 'operating' };
    },
    vanWithNote: () => {
      if (B('Van')) return null;
      const x = P.step(14000, 24000, 1000); const y = P.step(3000, 6000, 1000);
      if (cash() < C(y)) return null;
      st.notes.push({ lender: facts?.lender || 'the bank', cents: C(x - y), rate: null, fullMonth: false });
      const monthly = Math.round((x * 0.8) / 48 / 25) * 25;   // straight-line over 4 years, in whole dollars a month
      st.van = { cost: C(x), residual: C(x - monthly * 48), years: 4 };
      return { text: `Lantern buys a used delivery van for ${usd(x)}, paying ${usd(y)} in cash and signing a note payable with ${facts?.lender || 'its bank'} for the remaining ${usd(x - y)}.`, lines: [{ acct: 'Van', dr: x }, { acct: 'Cash', cr: y }, { acct: 'Notes Payable', cr: x - y }], cash: 'investing' };
    },
    stockAndEquipment: () => {
      const y = P.step(2000, 6000, 500); const z = P.step(1200, 3600, 300);
      st.equipCost += C(z);
      return { text: `${facts?.owner || 'The owner'} invests ${usd(y)} in cash and a coffee cart worth ${usd(z)} in Lantern, in exchange for ${usd(y + z)} of common stock.`, lines: [{ acct: 'Cash', dr: y }, { acct: 'Equipment', dr: z }, { acct: 'Common Stock', cr: y + z }], cash: 'financing' };
    },
    // level 4: adjustments at the end of the month
    adjDepreciation: () => {
      if (st.van && !st.vanDone) {
        st.vanDone = true;
        const amt = (st.van.cost - st.van.residual) / (12 * st.van.years);
        return { text: `Month-end adjustment: the van, which cost ${usd(D(st.van.cost))}, is depreciated straight-line over ${st.van.years} years to a residual value of ${usd(D(st.van.residual))}, with a full month in the month of purchase.`, lines: two('Depreciation Expense', 'Accumulated Depreciation—Van', D(Math.round(amt))) };
      }
      if (!st.equipCost || st.equipDone) return null;
      st.equipDone = true;
      const yrs = facts?.equipmentLifeYears || 5;
      const amt = Math.round(st.equipCost / (12 * yrs));
      return { text: `Month-end adjustment: Lantern depreciates its equipment, which cost ${usd(D(st.equipCost))}, straight-line over ${yrs} years with no residual value, taking a full month in the month of purchase.`, lines: two('Depreciation Expense', 'Accumulated Depreciation—Equipment', D(amt)) };
    },
    adjInterest: () => {
      const note = st.notes.find((k) => k.fullMonth && k.rate && k.cents > 0 && !k.accrued);
      if (!note) return null;
      note.accrued = true;
      const amt = Math.round(note.cents * note.rate / 12);
      return { text: `Month-end adjustment: a month of interest has built up on the ${usd(D(note.cents))} note payable at ${+(note.rate * 100).toFixed(1)}% a year. It will be paid with the next quarterly payment.`, lines: two('Interest Expense', 'Interest Payable', D(amt)) };
    },
    adjSupplies: () => {
      const b = B('Supplies');
      if (b < 20000 || st.suppliesDone) return null;
      st.suppliesDone = true;
      const onHand = Math.round((b * P.one([0.2, 0.3, 0.4, 0.5])) / 1000) * 1000;
      return { text: `Month-end adjustment: a count finds ${usd(D(onHand))} of supplies on hand. The Supplies account shows ${usd(D(b))}.`, lines: two('Supplies Expense', 'Supplies', D(b - onHand)) };
    },
    adjInsurance: () => {
      const p = st.prepaid.insurance;
      if (!p || st.insuranceDone || B('Prepaid Insurance') < p.monthly) return null;
      st.insuranceDone = true;
      return { text: `Month-end adjustment: another month of Lantern’s prepaid insurance has expired. The policy costs ${usd(D(p.annual))} a year.`, lines: two('Insurance Expense', 'Prepaid Insurance', D(p.monthly)) };
    },
    adjUnearned: () => {
      const u = st.unearned.find((k) => k.cents > 0 && k.per);
      if (!u || st.unearnedDone) return null;
      st.unearnedDone = true; u.cents -= u.per;
      return { text: `Month-end adjustment: during the month Lantern catered one of the events ${u.who || 'a client'} had paid for in advance, at ${usd(D(u.per))} each.`, lines: two('Unearned Revenue', 'Catering Revenue', D(u.per)) };
    },
    adjWages: () => {
      if (st.wagesDone) return null;
      st.wagesDone = true;
      const x = P.step(600, 1600, 50);
      return { text: `Month-end adjustment: baristas have earned ${usd(x)} of wages since their last payday. They will be paid on 5 ${MONTHS[mm % 12]}.`, lines: two('Wages Expense', 'Wages Payable', x) };
    },
    adjAccruedRevenue: () => {
      if (st.accruedRevDone) return null;
      st.accruedRevDone = true;
      const x = P.step(300, 1200, 50); const who = P.one(CLIENTS);
      return { text: `Month-end adjustment: on ${dayText(lastDay)} Lantern catered ${an(P.one(EVENTS))} for ${who}, worth ${usd(x)}. It will send the invoice on 2 ${MONTHS[mm % 12]}.`, lines: two('Accounts Receivable', 'Catering Revenue', x) };
    },
  };

  const LEVELS = {
    1: { start: ['stock', 'cateringCash', 'trainingCash'], pool: ['stock', 'cateringCash', 'trainingCash', 'suppliesCash', 'equipmentCash', 'rentCash', 'wagesCash', 'costCash', 'costCash'] },
    2: { start: ['invoiceCatering', 'suppliesAccount'], pool: ['suppliesAccount', 'equipmentAccount', 'invoiceCatering', 'invoiceTraining', 'collect', 'collect', 'paySupplier', 'paySupplier', 'billExpense'] },
    3: { start: ['deposit', 'borrow'], pool: ['deposit', 'earnUnearned', 'prepayInsurance', 'prepayRent', 'prepayAds', 'borrow', 'repayNote', 'dividend', 'payAccruedWages', 'payAccruedInterest', 'lendNote'] },
    4: { start: ['cateringPartCash', 'stockAndEquipment'], pool: ['equipPartCash', 'cateringPartCash', 'suppliesSplit', 'wagesWithAccrued', 'vanWithNote', 'stockAndEquipment'],
      adjust: ['adjDepreciation', 'adjInterest', 'adjSupplies', 'adjInsurance', 'adjUnearned', 'adjWages', 'adjAccruedRevenue', 'adjDepreciation'] },
  };
  const spec = LEVELS[lv];
  const nAdj = lv === 4 ? Math.max(1, Math.min(n - 1, Math.floor(n / 2))) : 0;
  const nMain = n - nAdj;
  // distinct days in the month, in order; adjustments fall on the last day
  const days = [];
  const span = Math.max(1, lastDay - 2);
  for (let i = 0; i < nMain; i++) days.push(1 + Math.floor(((i + P.r() * 0.9) * span) / Math.max(1, nMain)));
  const out = [];
  const used = new Map();
  const tryOne = (name) => { const snapshot = JSON.stringify(st); const t = T[name](); if (!t) { Object.assign(st, JSON.parse(snapshot)); return null; } return t; };
  const choose = (pool) => {
    // prefer templates used least so far; fall back through the pool until one is possible
    const order = pool.map((name, i) => ({ name, k: (used.get(name) || 0) + P.r() * 0.9 + i * 1e-6 })).sort((a, b) => a.k - b.k);
    for (const { name } of order) { const t = tryOne(name); if (t) { used.set(name, (used.get(name) || 0) + 1); return t; } }
    return null;
  };
  for (let i = 0; i < nMain; i++) {
    const pool = i === 0 && cash() === 0 && !Object.keys(st.bal).length ? spec.start : spec.pool;
    let t = choose(pool) || choose(spec.start);
    if (!t) t = tryOne('stock');
    apply(t.lines);
    out.push({ id: `g${out.length + 1}`, date: iso(Math.min(lastDay, days[i])), text: t.text, lines: t.lines, ...(t.cash ? { cash: t.cash } : {}) });
  }
  for (let i = 0; i < nAdj; i++) {
    const t = choose(spec.adjust) || tryOne('adjAccruedRevenue') || (() => { st.wagesDone = false; return tryOne('adjWages'); })();
    apply(t.lines);
    out.push({ id: `g${out.length + 1}`, date: iso(lastDay), text: t.text, lines: t.lines, adjusting: true });
  }
  return out;
}
