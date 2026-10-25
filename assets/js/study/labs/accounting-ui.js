// accounting-ui.js — the Accounting Lab's interface, shared by the F01 lesson widgets (equation, journal, ledger,
// statements), the lab page and the F01 project page: journals, T-accounts, trial balances, the four statements and
// closing, the equation check, the transaction-analysis drill (mountDrill) and the record-and-post bench (mountRecorder).
// Every number comes from the engine (core/accounting.js). Text people type goes in through value/textContent only.
import { h, s as svg } from '../../core/dom.js?v=13';
import { verdict } from '../../core/ui.js?v=13';
import * as A from '../../core/accounting.js?v=13';
import { CHART, MARCH, MARCH_ADJUSTMENTS } from '../../data/study/f01/case.js?v=13';

export { A, CHART, MARCH, MARCH_ADJUSTMENTS };

let seq = 0;
/** A page-unique id, so several widgets can share a page. */
export const uid = (p = 'acc') => `${p}-${++seq}`;

/** Lesson pages may not link lab-accounting.css themselves: add it once if it's missing. */
export function ensureStyles() {
  if (typeof document === 'undefined' || document.querySelector('link[href*="lab-accounting.css"]')) return;
  document.head.append(h('link', { rel: 'stylesheet', href: new URL('../../../css/lab-accounting.css?v=13', import.meta.url).href }));
}

// ---------------------------------------------------------------- the case's transactions

const ADJ_DATE = '2026-03-31';
const CASE_TX = new Map([
  ...MARCH.map((t) => [t.id, t]),
  ...MARCH_ADJUSTMENTS.map((a) => [a.id, { ...a, date: a.date || ADJ_DATE, adjusting: true }]),
]);
/** Widget configs list case ids ('m1'…'m15', 'a1'…'a7') or inline transactions; return full transactions. */
export function resolveTransactions(list) {
  return (list || []).map((t, k) => {
    if (typeof t === 'string') {
      const f = CASE_TX.get(t);
      if (!f) throw new Error(`Transaction “${t}” isn’t in Lantern’s March (case.js).`);
      return f;
    }
    return { ...t, id: t.id ?? `t${k + 1}`, date: t.date ?? null, text: t.text ?? '' };
  });
}

/** Lantern's balances after March is adjusted and closed: the opening balances for a practice April. */
let aprilCache = null;
export function marchClosingBalances() {
  if (aprilCache) return aprilCache;
  const all = [...MARCH, ...MARCH_ADJUSTMENTS.map((a) => ({ ...a, date: ADJ_DATE }))];
  const L = A.post(all, CHART);
  const closed = A.post([...all, ...A.closingEntries(L, CHART, { method: 'summary', date: ADJ_DATE })], CHART);
  aprilCache = Object.fromEntries(A.ledgerAccounts(closed, CHART).filter((t) => t.balance).map((t) => [t.acct, t.balance]));
  return aprilCache;
}

// ---------------------------------------------------------------- formatting

const nf0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** 12000 → "12,000"; 37.5 → "37.50" (no sign). */
export function amt(v) { const c = Math.round(Math.abs(Number(v)) * 100); return (c % 100 ? nf2 : nf0).format(c / 100); }
export const usd = A.usd;
/** Statement style: negatives in parentheses. */
export const paren = (v, dollar = false) => { const t = `${dollar ? '$' : ''}${amt(v)}`; return Math.round(v * 100) < 0 ? `(${t})` : t; };
/** "+$12,000", "−$4,000", "$0". */
export const signed = (v) => (Math.round(v * 100) > 0 ? `+${usd(v)}` : usd(v));
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ymd = (iso) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? [+m[1], +m[2], +m[3]] : null; };
export function dateShort(iso) { const d = ymd(iso); return d ? `${d[2]} ${MONTHS[d[1] - 1].slice(0, 3)}` : ''; }
export function dateLong(iso) { const d = ymd(iso); return d ? `${d[2]} ${MONTHS[d[1] - 1]} ${d[0]}` : ''; }
/** The first and last day of the month of a date, as ISO strings. */
/** “For the month ended 31 March 2026”, or the period's own phrase (e.g. “For the ten months ended”). */
const endedPhrase = (period) => `${period.phrase || 'For the month ended'} ${dateLong(period.end)}`;
export function monthOf(iso) {
  const d = ymd(iso) || [2026, 3, 1];
  const last = new Date(Date.UTC(d[0], d[1], 0)).getUTCDate();
  const p = (x) => String(x).padStart(2, '0');
  return { start: `${d[0]}-${p(d[1])}-01`, end: `${d[0]}-${p(d[1])}-${p(last)}`, name: `${MONTHS[d[1] - 1]} ${d[0]}` };
}
/** Read a typed amount: "12,000", "$12,000", "−4,000", "(4,000)", "+800", "37.5". Blank → null; nonsense → NaN. */
export function parseAmount(s) {
  if (s == null) return null;
  let t = String(s).trim();
  if (!t) return null;
  let neg = false;
  if (/^\(.*\)$/.test(t)) { neg = true; t = t.slice(1, -1).trim(); }
  t = t.replace(/[−–—]/g, '-').replace(/[$,\s]/g, '');
  if (t.startsWith('-')) { neg = !neg; t = t.slice(1); } else if (t.startsWith('+')) t = t.slice(1);
  if (!/^(\d+\.?\d*|\.\d+)$/.test(t)) return NaN;
  const v = Number(t);
  return neg ? -v : v;
}
const C = (v) => Math.round(Number(v) * 100);
const sameMoney = (a, b) => Number.isFinite(a) && Number.isFinite(b) && C(a) === C(b);
const listWords = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
const plural = (k, one, many = `${one}s`) => `${k} ${k === 1 ? one : many}`;

/** A polite live region; `say` re-announces even identical text. */
export function liveRegion() { return h('div', { class: 'visually-hidden', 'aria-live': 'polite', 'aria-atomic': 'true' }); }
export function say(region, text) { region.textContent = ''; setTimeout(() => { region.textContent = text; }, 40); }

/** replaceChildren that skips null and false (the DOM would print them as text). */
export function fill(el, ...kids) { el.replaceChildren(...kids.flat().filter((k) => k != null && k !== false)); return el; }
/** A small cross icon for remove buttons (SVG namespace). */
export function crossIcon() { return svg('svg', { viewBox: '0 0 20 20', 'aria-hidden': 'true', focusable: 'false' }, svg('path', { d: 'M6 6l8 8M14 6l-8 8', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', fill: 'none' })); }

/** A small right/wrong mark that never relies on colour alone. */
function mark(ok) {
  return h('span', { class: `acc-mark ${ok ? 'is-right' : 'is-wrong'}` }, h('span', { 'aria-hidden': 'true' }, ok ? '✓' : '✗'), h('span', { class: 'visually-hidden' }, ok ? 'Right.' : 'Not right.'));
}
function errorBox(el, message) {
  el.replaceChildren(h('div', { class: 'acc' }, verdict('bad', 'This exercise couldn’t load.', message)));
}
export { errorBox };

// ---------------------------------------------------------------- the chart as a picker

const GROUPS = [['asset', 'Assets'], ['contra-asset', 'Contra-asset accounts'], ['liability', 'Liabilities'], ['equity', 'Equity'], ['dividends', 'Dividends'], ['revenue', 'Revenue'], ['contra-revenue', 'Contra-revenue accounts'], ['expense', 'Expenses'], ['summary', 'Closing']];
/** A select of the chart's accounts, grouped by type. */
export function accountSelect(chart, { id, exclude = ['summary'], value = '', placeholder = 'Choose an account' } = {}) {
  const ch = A.makeChart(chart);
  const sel = h('select', { class: 'select acc-acct-select', id });
  sel.append(h('option', { value: '' }, placeholder));
  for (const [type, label] of GROUPS) {
    if (exclude.includes(type)) continue;
    const accts = ch.list.filter((a) => a.type === type);
    if (accts.length) sel.append(h('optgroup', { label }, accts.map((a) => h('option', { value: a.name }, a.name))));
  }
  sel.value = value || '';
  return sel;
}

// ---------------------------------------------------------------- journal, T-accounts, trial balance

const hasAmt = (v) => v != null && String(v).trim() !== '' && Number(v) !== 0;
const isCrLine = (l) => hasAmt(l.cr) && !hasAmt(l.dr);

/**
 * A general journal: debits first, credits indented, the explanation under each entry.
 * opts: { caption, chart, refs (show posting references), posted (true | Set of ids posted), highlight (id), next (id), memo }
 */
export function journalTable(entries, { caption, chart = CHART, refs = true, posted = true, highlight = null, next = null, memo = true, empty = 'No entries yet.' } = {}) {
  const ch = A.makeChart(chart);
  const cols = refs ? 5 : 4;
  const table = h('table', { class: 'data-table acc-journal' },
    caption ? h('caption', {}, caption) : null,
    h('thead', {}, h('tr', {},
      h('th', { scope: 'col', class: 'acc-j-date' }, 'Date'),
      h('th', { scope: 'col' }, 'Account'),
      refs ? h('th', { scope: 'col', class: 'acc-j-ref' }, h('abbr', { title: 'Posting reference: the ledger account number, written in once the line is posted' }, 'Ref.')) : null,
      h('th', { scope: 'col', class: 'is-num' }, 'Debit'),
      h('th', { scope: 'col', class: 'is-num' }, 'Credit'))));
  if (!entries.length) table.append(h('tbody', {}, h('tr', {}, h('td', { colspan: cols, class: 'acc-empty' }, empty))));
  for (const e of entries) {
    const isPosted = posted === true || (posted instanceof Set && posted.has(e.id));
    const lines = [...e.lines.filter((l) => !isCrLine(l)), ...e.lines.filter(isCrLine)];
    const cls = ['acc-j-entry', e.id === highlight ? 'is-new' : '', e.id === next ? 'is-next' : '', isPosted ? 'is-posted' : ''].filter(Boolean).join(' ');
    const tb = h('tbody', { class: cls, dataset: { id: String(e.id) } });
    lines.forEach((l, k) => {
      const cr = isCrLine(l);
      const a = ch.byName[l.acct];
      tb.append(h('tr', { class: k === 0 ? 'acc-j-first' : null },
        h('td', { class: 'acc-j-date' }, k === 0 ? [
          e.id === highlight ? h('span', { class: 'visually-hidden' }, 'Just posted. ') : null,
          e.id === next ? h('span', { class: 'acc-j-flag' }, 'Next') : null,
          h('span', { class: 'acc-j-no', title: `Entry ${A.entryLabel(e)}` }, A.entryLabel(e)), ' ', dateShort(e.date)] : null),
        h('td', { class: cr ? 'acc-j-cr' : 'acc-j-dr' }, l.acct),
        refs ? h('td', { class: 'acc-j-ref' }, isPosted && a?.no != null ? String(a.no) : '') : null,
        h('td', { class: 'is-num' }, cr ? '' : amt(l.dr)),
        h('td', { class: 'is-num' }, cr ? amt(l.cr) : '')));
    });
    if (memo && e.text) tb.append(h('tr', { class: 'acc-j-memo' }, h('td'), h('td', { colspan: cols - 1 }, e.text)));
    table.append(tb);
  }
  return h('div', { class: 'table-scroll', role: 'region', 'aria-label': caption ? String(caption) : 'Journal entries' }, table);
}

/** An empty ledger account, so a T-account can be drawn before anything is posted to it. */
export function blankAccount(name, chart = CHART) {
  const a = A.makeChart(chart).byName[name];
  return { acct: name, no: a?.no ?? null, type: a?.type, normal: a?.normal || 'dr', lines: [], dr: 0, cr: 0, balance: 0 };
}

/**
 * A T-account: a real table, drawn with a heavy top rule and a centre rule. Lines posted by the entry in
 * `highlight` (an id or a Set of ids) are marked. `balance` replaces the balance row (an element), or
 * hideBalance shows a question mark instead of the figure.
 */
export function tAccount(t, { highlight = null, hideBalance = false, balance = null } = {}) {
  const dr = t.lines.filter((x) => x.dr != null), cr = t.lines.filter((x) => x.cr != null);
  const rows = Math.max(dr.length, cr.length, 1);
  const hi = (x) => x && highlight != null && (highlight instanceof Set ? highlight.has(x.ref) : highlight === x.ref);
  const cell = (x) => (x
    ? h('td', { class: hi(x) ? 'is-new' : null },
      hi(x) ? h('span', { class: 'visually-hidden' }, 'Just posted: ') : null,
      h('span', { class: 'acc-t-ref' }, x.label ?? ''), ' ', h('span', { class: 'acc-t-amt' }, amt(x.dr ?? x.cr)))
    : h('td'));
  const b = t.balance;
  const side = b === 0 ? t.normal : ((b > 0) === (t.normal === 'dr') ? 'dr' : 'cr');
  const balCell = (s) => h('td', { class: 'acc-t-bal' }, s === side ? [h('span', { class: 'acc-t-ref' }, 'Bal.'), ' ', h('span', { class: 'acc-t-amt' }, hideBalance ? '?' : amt(b))] : '');
  const foot = balance
    ? h('tfoot', {}, h('tr', {}, h('td', { colspan: 2, class: 'acc-t-slot' }, balance)))
    : h('tfoot', {}, h('tr', {}, balCell('dr'), balCell('cr')));
  return h('table', { class: `acc-t${t.lines.some(hi) ? ' has-new' : ''}`, dataset: { acct: t.acct } },
    h('caption', {}, h('span', { class: 'acc-t-name' }, t.acct), t.no != null ? h('span', { class: 'acc-t-no' }, h('span', { class: 'visually-hidden' }, ', account '), String(t.no)) : null),
    h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Debit'), h('th', { scope: 'col' }, 'Credit'))),
    h('tbody', {}, Array.from({ length: rows }, (_, k) => h('tr', {}, cell(dr[k]), cell(cr[k])))),
    foot);
}

/** T-accounts for every account in the ledger (plus `include`), in chart order. */
export function tAccountsGrid(ledger, chart = CHART, { include = [], highlight = null, hideBalance = false, slots = null, empty = 'Nothing has been posted yet.' } = {}) {
  const ch = A.makeChart(chart);
  const names = ch.list.filter((a) => ledger[a.name] || include.includes(a.name)).map((a) => a.name);
  if (!names.length) return h('p', { class: 'acc-empty' }, empty);
  return h('div', { class: 'acc-taccounts' }, names.map((n) => tAccount(ledger[n] || blankAccount(n, ch), { highlight, hideBalance, balance: slots?.[n] || null })));
}

/** The trial balance with its totals and whether it balances. `highlight` is a Set of account names. */
export function trialBalanceTable(tb, { caption = 'Trial balance', highlight = new Set(), empty = 'No balances yet.' } = {}) {
  const table = h('table', { class: 'data-table acc-tb' },
    h('caption', {}, caption),
    h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Account'), h('th', { scope: 'col', class: 'is-num' }, 'Debit'), h('th', { scope: 'col', class: 'is-num' }, 'Credit'))),
    h('tbody', {}, tb.rows.length ? tb.rows.map((r) => h('tr', { class: highlight.has(r.acct) ? 'is-new' : null },
      h('th', { scope: 'row' }, highlight.has(r.acct) ? h('span', { class: 'acc-chg', 'aria-hidden': 'true' }, '●') : null, r.acct, highlight.has(r.acct) ? h('span', { class: 'visually-hidden' }, ' (just changed)') : null),
      h('td', { class: 'is-num' }, r.dr ? amt(r.dr) : ''),
      h('td', { class: 'is-num' }, r.cr ? amt(r.cr) : ''))) : h('tr', {}, h('td', { colspan: 3, class: 'acc-empty' }, empty))),
    h('tfoot', {}, h('tr', { class: 'acc-tb-total' }, h('th', { scope: 'row' }, 'Total'), h('td', { class: 'is-num' }, usd(tb.dr)), h('td', { class: 'is-num' }, usd(tb.cr)))));
  const status = h('p', { class: `acc-tb-status ${tb.balanced ? 'is-ok' : 'is-off'}` },
    h('span', { 'aria-hidden': 'true' }, tb.balanced ? '✓ ' : '✗ '),
    tb.balanced ? `Debits equal credits: ${usd(tb.dr)} each.` : `Out of balance by ${usd(Math.abs(tb.dr - tb.cr))}.`);
  return h('div', { class: 'acc-tb-wrap' }, h('div', { class: 'table-scroll' }, table), status);
}

// ---------------------------------------------------------------- the equation check

/** Assets = Liabilities + Equity, always in view. update(totals, { scale }) redraws it. */
export function equationBar() {
  const el = h('div', { class: 'acc-eqbar', role: 'group', 'aria-label': 'Accounting equation check' });
  let max = 0;
  const update = ({ assets, liabilities, equity }, { scale } = {}) => {
    const ok = C(assets) === C(liabilities) + C(equity);
    max = Math.max(scale || 0, max, assets, liabilities + Math.max(equity, 0), 1);
    const w = (v) => `${Math.max(0, (v / max) * 100).toFixed(2)}%`;
    const term = (cls, name, v) => h('span', { class: `acc-eqbar-term ${cls}` }, h('span', { class: 'acc-eqbar-name' }, name), ' ', h('strong', { class: 'num' }, usd(v)));
    const bars = equity >= 0 && liabilities >= 0 && assets >= 0
      ? h('div', { class: 'acc-eqbar-bars', 'aria-hidden': 'true' },
        h('div', { class: 'acc-eqbar-row' }, h('span', { class: 'is-a', style: { width: w(assets) } })),
        h('div', { class: 'acc-eqbar-row' }, h('span', { class: 'is-l', style: { width: w(liabilities) } }), h('span', { class: 'is-e', style: { width: w(equity) } })))
      : null;
    fill(el,
      h('p', { class: 'acc-eqbar-eq' },
        term('is-a', 'Assets', assets), h('span', { class: 'acc-eqbar-op', 'aria-hidden': 'true' }, '='), h('span', { class: 'visually-hidden' }, ' equals '),
        term('is-l', 'Liabilities', liabilities), h('span', { class: 'acc-eqbar-op', 'aria-hidden': 'true' }, '+'), h('span', { class: 'visually-hidden' }, ' plus '),
        term('is-e', 'Equity', equity),
        h('span', { class: `acc-eqbar-ok ${ok ? 'is-ok' : 'is-off'}` }, h('span', { 'aria-hidden': 'true' }, ok ? '✓' : '✗'), ok ? ' In balance' : ' Out of balance')),
      bars);
  };
  return { el, update };
}

// ---------------------------------------------------------------- statements

/**
 * A statement as a table: rows [{ label, a, b, kind, dollar, ruleA, ruleB, double, indent }] where a is the inner
 * column (items) and b the outer column (totals). Negatives print in parentheses.
 */
function statementEl({ business, title, period, rows, note, id }) {
  const cell = (v, r, col) => {
    if (v == null) return h('td', { class: `is-num acc-st-${col}` });
    const rule = col === 'a' ? r.ruleA : r.ruleB;
    return h('td', { class: `is-num acc-st-${col}${rule ? ' has-rule' : ''}${col === 'b' && r.double ? ' has-double' : ''}` }, paren(v, !!r.dollar));
  };
  const body = h('tbody', {}, rows.map((r) => {
    if (r.kind === 'head') return h('tr', { class: 'acc-st-head' }, h('th', { scope: 'rowgroup', colspan: 3 }, r.label));
    if (r.kind === 'sub') return h('tr', { class: 'acc-st-sub' }, h('th', { scope: 'rowgroup', colspan: 3 }, r.label));
    return h('tr', { class: `acc-st-${r.kind || 'item'}${r.indent ? ' is-indent' : ''}` }, h('th', { scope: 'row' }, r.label), cell(r.a, r, 'a'), cell(r.b, r, 'b'));
  }));
  return h('figure', { class: 'acc-statement', id },
    h('figcaption', {}, h('span', { class: 'acc-st-business' }, business), h('span', { class: 'acc-st-title' }, title), h('span', { class: 'acc-st-period' }, period)),
    h('div', { class: 'table-scroll' }, h('table', { class: 'acc-st-table' },
      h('caption', { class: 'visually-hidden' }, `${title}, ${business}, ${period}`),
      h('thead', { class: 'visually-hidden' }, h('tr', {}, h('th', { scope: 'col' }, 'Item'), h('th', { scope: 'col' }, 'Amount ($)'), h('th', { scope: 'col' }, 'Total ($)'))),
      body)),
    note ? h('p', { class: 'acc-st-note' }, note) : null);
}
function itemRows(list, { dollarFirst = true, ruleLast = true } = {}) {
  return list.map(([label, v], k) => ({ label, a: v, dollar: dollarFirst && k === 0, ruleA: ruleLast && k === list.length - 1, indent: true }));
}

export function incomeStatementEl(is, { business = 'Lantern Coffee Co.', period }) {
  const rows = [{ kind: 'head', label: 'Revenue' }, ...itemRows(is.revenues), { kind: 'total', label: 'Total revenue', b: is.totalRevenue, dollar: true },
    { kind: 'head', label: 'Expenses' }, ...itemRows(is.expenses), { kind: 'total', label: 'Total expenses', b: is.totalExpenses, ruleB: true },
    { kind: 'grand', label: is.netIncome >= 0 ? 'Net income' : 'Net loss', b: is.netIncome, dollar: true, double: true }];
  if (!is.revenues.length) rows.splice(1, 0, { label: 'No revenue recorded', a: 0, indent: true });
  return statementEl({ business, title: 'Income statement', period: endedPhrase(period), rows });
}

export function equityStatementEl(es, { business = 'Lantern Coffee Co.', period }) {
  const label = (l) => (l === 'Beginning balance' ? `Balance, ${dateLong(period.start)}` : l === 'Ending balance' ? `Balance, ${dateLong(period.end)}` : l);
  const n = es.rows.length;
  const table = h('table', { class: 'acc-st-table acc-st-equity' },
    h('caption', { class: 'visually-hidden' }, `Statement of changes in equity, ${business}, ${endedPhrase(period).replace(/^For the /, '')}`),
    h('thead', {}, h('tr', {}, h('td'), h('th', { scope: 'col', class: 'is-num' }, 'Common stock'), h('th', { scope: 'col', class: 'is-num' }, 'Retained earnings'), h('th', { scope: 'col', class: 'is-num' }, 'Total equity'))),
    h('tbody', {}, es.rows.map((r, k) => h('tr', { class: k === n - 1 ? 'acc-st-grand' : k === 0 ? 'acc-st-first' : null },
      h('th', { scope: 'row' }, label(r[0])),
      ...[1, 2, 3].map((c) => h('td', { class: `is-num${k === n - 2 ? ' has-rule' : ''}${k === n - 1 ? ' has-double' : ''}` }, r[c] == null ? '' : paren(r[c], k === 0 || k === n - 1)))))));
  return h('figure', { class: 'acc-statement' },
    h('figcaption', {}, h('span', { class: 'acc-st-business' }, business), h('span', { class: 'acc-st-title' }, 'Statement of changes in equity'), h('span', { class: 'acc-st-period' }, endedPhrase(period))),
    h('div', { class: 'table-scroll' }, table));
}

export function balanceSheetEl(bs, { business = 'Lantern Coffee Co.', period }) {
  const assetRows = (list) => list.map(([n, v], k) => ({ label: v < 0 ? `Less: ${n}` : n, a: v, dollar: false, indent: true, ruleA: k === list.length - 1 }));
  const rows = [{ kind: 'head', label: 'Assets' }];
  if (bs.assets.current.length) {
    rows.push({ kind: 'sub', label: 'Current assets' }, ...assetRows(bs.assets.current), { kind: 'total', label: 'Total current assets', b: bs.assets.currentTotal });
    rows[2].dollar = true;
  }
  if (bs.assets.noncurrent.length) rows.push({ kind: 'sub', label: 'Long-term assets' }, ...assetRows(bs.assets.noncurrent), { kind: 'total', label: 'Total long-term assets', b: bs.assets.noncurrentTotal, ruleB: true });
  else rows[rows.length - 1].ruleB = true;
  rows.push({ kind: 'grand', label: 'Total assets', b: bs.assets.total, dollar: true, double: true });
  rows.push({ kind: 'head', label: 'Liabilities' });
  const libStart = rows.length;
  if (bs.liabilities.current.length) rows.push({ kind: 'sub', label: 'Current liabilities' }, ...itemRows(bs.liabilities.current, { dollarFirst: false }), { kind: 'total', label: 'Total current liabilities', b: bs.liabilities.currentTotal });
  if (bs.liabilities.noncurrent.length) rows.push({ kind: 'sub', label: 'Long-term liabilities' }, ...itemRows(bs.liabilities.noncurrent, { dollarFirst: false }), { kind: 'total', label: 'Total long-term liabilities', b: bs.liabilities.noncurrentTotal, ruleB: true });
  if (rows.length === libStart) rows.push({ label: 'No liabilities', a: 0, indent: true });
  rows.push({ kind: 'total', label: 'Total liabilities', b: bs.liabilities.total });
  rows.push({ kind: 'head', label: 'Stockholders’ equity' }, ...itemRows(bs.equity, { dollarFirst: false }), { kind: 'total', label: 'Total stockholders’ equity', b: bs.equityTotal, ruleB: true });
  rows.push({ kind: 'grand', label: 'Total liabilities and stockholders’ equity', b: bs.liabilities.total + bs.equityTotal, dollar: true, double: true });
  return statementEl({ business, title: 'Balance sheet', period: `At ${dateLong(period.end)}`, rows });
}

export function cashFlowEl(cf, { business = 'Lantern Coffee Co.', period, beginningCash = 0 }) {
  const names = { operating: 'operating', investing: 'investing', financing: 'financing' };
  const rows = [];
  for (const cls of ['operating', 'investing', 'financing']) {
    const items = cf.lines.filter((l) => l[2] === cls);
    rows.push({ kind: 'head', label: `Cash flows from ${names[cls]} activities` });
    if (items.length) rows.push(...items.map(([label, v], k) => ({ label, a: v, dollar: k === 0, indent: true, ruleA: k === items.length - 1 })));
    else rows.push({ label: 'None this month', a: 0, indent: true, ruleA: true });
    rows.push({ kind: 'total', label: `Net cash ${cf[cls] < 0 ? 'used in' : 'provided by'} ${names[cls]} activities`, b: cf[cls], dollar: cls === 'operating', ruleB: cls === 'financing' });
  }
  rows.push({ kind: 'total', label: `Net ${cf.net < 0 ? 'decrease' : 'increase'} in cash`, b: cf.net });
  rows.push({ label: `Cash at ${dateLong(period.start)}`, b: beginningCash, ruleB: true });
  rows.push({ kind: 'grand', label: `Cash at ${dateLong(period.end)}`, b: beginningCash + cf.net, dollar: true, double: true });
  const note = cf.noncash.length ? `Noncash investing and financing activities: ${cf.noncash.join(' ')}` : null;
  return statementEl({ business, title: 'Statement of cash flows (direct method)', period: endedPhrase(period), rows, note });
}

/**
 * All four statements from a list of entries (built before closing). build: which to show.
 * Returns the element; the numbers come from the engine.
 */
export function statementsBlock(entries, { chart = CHART, opening = {}, business = 'Lantern Coffee Co.', period, build = ['income', 'equity', 'balance', 'cash'] } = {}) {
  const ch = A.makeChart(chart);
  const L = A.post(entries, ch, opening);
  const per = period || monthOf(entries.find((e) => e.date)?.date);
  const parts = [];
  if (build.includes('income')) parts.push(incomeStatementEl(A.incomeStatement(L, ch), { business, period: per }));
  if (build.includes('equity')) parts.push(equityStatementEl(A.equityStatement(L, ch, opening), { business, period: per }));
  if (build.includes('balance')) parts.push(balanceSheetEl(A.balanceSheet(L, ch), { business, period: per }));
  if (build.includes('cash')) {
    const cashName = ch.list.find(A.isCash)?.name;
    parts.push(cashFlowEl(A.cashFlows(entries, ch), { business, period: per, beginningCash: Number(opening?.[cashName] || 0) }));
  }
  return h('div', { class: 'acc-statements' }, parts);
}

/**
 * Closing the books: choose Income Summary or closing directly, see the closing entries, the two accounts they
 * run through and the post-closing trial balance.
 */
export function mountClosing(el, { entries, chart = CHART, opening = {}, date, method = 'summary', onMethod } = {}) {
  ensureStyles();
  const ch = A.makeChart(chart);
  const hasSummary = ch.list.some((a) => a.type === 'summary');
  let m = hasSummary ? method : 'direct';
  const name = uid('close');
  const L = A.post(entries, ch, opening);
  const box = h('div', { class: 'acc-closing-body' });
  const live = liveRegion();
  const draw = () => {
    const ce = A.closingEntries(L, ch, { method: m, date });
    const after = A.post([...entries, ...ce], ch, opening);
    const re = ch.list.find(A.isRetainedEarnings)?.name;
    const is = ch.list.find((a) => a.type === 'summary')?.name;
    const ids = new Set(ce.map((e) => e.id));
    const shown = [m === 'summary' ? is : null, re].filter(Boolean);
    const post = A.trialBalance(after, ch);
    box.replaceChildren(
      h('div', { class: 'acc-closing-grid' },
        h('div', {}, h('h4', { class: 'acc-h' }, 'Closing entries'),
          ce.length ? journalTable(ce, { chart: ch, refs: true, memo: true }) : h('p', { class: 'acc-empty' }, 'There are no revenue, expense or dividend balances to close.')),
        h('div', {}, h('h4', { class: 'acc-h' }, 'Where they go'),
          h('div', { class: 'acc-taccounts is-pair' }, shown.map((n) => tAccount(after[n] || blankAccount(n, ch), { highlight: ids }))),
          h('p', { class: 'acc-note' }, m === 'summary'
            ? `Income Summary collects every revenue and expense, so its balance before the third entry is the month’s net income. After closing it is zero again.`
            : `Closing directly skips Income Summary: each revenue and expense goes straight to ${re}. The result is the same.`))),
      h('div', { class: 'acc-closing-tb' }, trialBalanceTable(post, { caption: 'Post-closing trial balance' }),
        h('p', { class: 'acc-note' }, `Only balance-sheet accounts remain. Revenue, expenses and dividends start the next month at zero, and ${re} now holds ${usd(after[re]?.balance || 0)}.`)));
    say(live, `${ce.length} closing ${ce.length === 1 ? 'entry' : 'entries'}. The post-closing trial balance totals ${usd(post.dr)}.`);
  };
  const seg = h('div', { class: 'segmented', role: 'radiogroup', 'aria-label': 'How to close the books' },
    [['summary', 'Through Income Summary'], ['direct', 'Directly to Retained Earnings']].flatMap(([v, t]) => {
      const id = uid('cm');
      const inp = h('input', { type: 'radio', name, id, value: v, disabled: v === 'summary' && !hasSummary });
      inp.checked = v === m;
      inp.addEventListener('change', () => { m = v; onMethod?.(v); draw(); });
      return [inp, h('label', { for: id }, t)];
    }));
  el.replaceChildren(h('div', { class: 'acc acc-closing' }, seg, box, live));
  draw();
}

// ---------------------------------------------------------------- the transaction-analysis drill

export const ASK_ALL = ['accounts', 'direction', 'side', 'amount', 'equation', 'statements'];
const PART = { accounts: 'Which accounts change', direction: 'Increase or decrease', side: 'Debit or credit', amount: 'Amounts', equation: 'Effect on the equation', statements: 'Statements affected' };
const ELEMENT = { assets: 'Assets', liabilities: 'Liabilities', equity: 'Equity' };
const CLASS_WHY = {
  operating: 'it comes from running the business day to day: an operating activity',
  investing: 'it is for long-term assets, or money lent to others: an investing activity',
  financing: 'it is with the owners or lenders who fund the business: a financing activity',
};
const STATEMENTS = [['income', 'Income statement'], ['equity', 'Statement of changes in equity'], ['balance', 'Balance sheet']];

/** "Equipment, an asset, increases: debit $12,000; Cash, an asset, decreases: credit $4,000." */
export function explainEntry(entry, chart = CHART) {
  return `${A.entryEffects(entry, chart).map((e) => `${e.acct}, ${A.typeNoun(e.type)}, ${e.direction}s: ${e.side === 'dr' ? 'debit' : 'credit'} ${usd(e.amount)}`).join('; ')}.`;
}
/** "Assets +$8,000 = Liabilities +$8,000 + Equity $0" */
export function equationLine(q) { return `Assets ${signed(q.assets)} = Liabilities ${signed(q.liabilities)} + Equity ${signed(q.equity)}`; }

function elementBreakdown(entry, ch, el) {
  const parts = A.entryEffects(entry, ch).filter((e) => e.element === el);
  return parts.map((e) => `${e.acct} ${signed(e.change)}`);
}

/** Why each statement is (or isn't) affected, for feedback. */
function statementReason(kind, entry, ch, st) {
  const effects = A.entryEffects(entry, ch);
  const names = (pred) => listWords(effects.filter(pred).map((e) => e.acct));
  if (kind === 'income') return st.income
    ? `The income statement changes: ${names((e) => e.type === 'revenue' || e.type === 'contra-revenue' || e.type === 'expense')} ${effects.filter((e) => e.type === 'revenue' || e.type === 'contra-revenue' || e.type === 'expense').length > 1 ? 'are' : 'is'} reported on it.`
    : 'The income statement doesn’t change: no revenue or expense is involved.';
  if (kind === 'equity') {
    if (!st.equity) return 'The statement of changes in equity doesn’t change: no revenue, expense, dividend or stock is involved.';
    if (effects.some((e) => e.type === 'revenue' || e.type === 'contra-revenue' || e.type === 'expense')) return 'The statement of changes in equity changes: net income changes, and net income is added to retained earnings.';
    if (effects.some((e) => e.type === 'dividends')) return 'The statement of changes in equity changes: dividends reduce retained earnings.';
    return `The statement of changes in equity changes: ${names((e) => e.element === 'equity')} ${effects.filter((e) => e.element === 'equity').length > 1 ? 'are' : 'is'} part of equity.`;
  }
  if (kind === 'balance') {
    const bs = effects.filter((e) => e.element !== 'equity' || e.type === 'equity');
    return bs.length
      ? `Every transaction changes the balance sheet: ${listWords(bs.map((e) => e.acct))} ${bs.length > 1 ? 'are' : 'is'} on it.`
      : 'Every transaction changes the balance sheet: revenue and expenses end up in retained earnings, which is on it.';
  }
  if (!st.cash) return 'No cash moves, so the statement of cash flows isn’t affected.';
  const q = A.equationEffect({ lines: entry.lines.filter((l) => A.isCash(ch.byName[l.acct])) }, ch);
  const dir = q.assets > 0 ? `Cash comes in (${usd(q.assets)})` : `Cash goes out (${usd(-q.assets)})`;
  const extra = st.cashClasses.length > 1 ? ` Part of it is ${listWords(st.cashClasses.filter((k) => k !== st.cashClass))}: interest paid is operating under US GAAP.` : '';
  return `${dir}, and ${CLASS_WHY[st.cashClass]}.${extra}`;
}

/**
 * The drill: for each transaction the student answers the questions in `ask`, checks, reads specific feedback,
 * sees the right entry, and moves on; a score summary closes the run.
 * opts: { transactions (resolved), chart, ask, onDone(result), onProgress({ done, total, perfect }), actions: [buttons for the summary] }
 */
export function mountDrill(el, { transactions, chart = CHART, ask, onDone, onProgress, actions = [] } = {}) {
  ensureStyles();
  const ch = A.makeChart(chart);
  const asks = ask && ask.length ? ASK_ALL.filter((k) => ask.includes(k)) : ASK_ALL;
  const has = (k) => asks.includes(k);
  const rowParts = ['direction', 'side', 'amount'].filter(has);
  const showRows = has('accounts') || rowParts.length > 0;
  const txs = transactions;
  let results = txs.map(() => null);
  let i = 0;
  const root = h('div', { class: 'acc acc-drill' });
  const live = liveRegion();
  el.replaceChildren(root, live);

  const progressDots = () => h('ol', { class: 'acc-steps', 'aria-label': 'Progress through the transactions' }, txs.map((t, k) => {
    const r = results[k];
    const state = k === i && !r ? 'is-current' : r ? (r.perfect ? 'is-right' : 'is-part') : '';
    const words = r ? (r.perfect ? 'every part right' : `${r.right} of ${r.total} parts right`) : k === i ? 'current' : 'not done yet';
    return h('li', { class: state, 'aria-current': k === i ? 'step' : null }, h('span', { 'aria-hidden': 'true' }, r ? (r.perfect ? '✓' : '•') : String(k + 1)), h('span', { class: 'visually-hidden' }, `Transaction ${k + 1}: ${words}`));
  }));

  function segField({ name, label, options, aria }) {
    return h('div', { class: 'acc-field', dataset: { part: label } },
      h('span', { class: 'acc-mini', 'aria-hidden': 'true' }, label),
      h('div', { class: 'segmented acc-seg', role: 'radiogroup', 'aria-label': aria }, options.flatMap(([v, t]) => {
        const id = uid('opt');
        return [h('input', { type: 'radio', name, id, value: v }), h('label', { for: id }, t)];
      })));
  }
  function moneyField({ id, label, aria, placeholder = '' }) {
    return h('div', { class: 'acc-field acc-field-amt' },
      h('label', { class: 'acc-mini', for: id }, label),
      h('div', { class: 'affix' }, h('span', { class: 'affix-pre', 'aria-hidden': 'true' }, '$'),
        h('input', { class: 'input', id, type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false', placeholder, 'aria-label': aria })));
  }

  function show() {
    const t = txs[i];
    const key = A.entryEffects(t, ch);
    const keyBy = new Map(key.map((e) => [e.acct, e]));
    const order = (a, b) => ch.byName[a.acct].order - ch.byName[b.acct].order;
    const rows = has('accounts') || !rowParts.length ? [] : key.slice().sort(order).map((e) => ({ acct: e.acct, id: uid('row') }));
    const textId = uid('tx');
    let qn = 0;
    const qTitle = (text) => `${++qn}. ${text}`;

    const rowsBox = h('div', { class: 'acc-rows' });
    const errorEl = h('p', { class: 'error-text acc-form-error', role: 'alert' });
    const form = h('form', { class: 'acc-drill-form', novalidate: true, 'aria-describedby': textId });
    const result = h('div', { class: 'acc-drill-result', tabindex: '-1' });

    function rowEl(r) {
      const fs = h('fieldset', { class: 'acc-row', dataset: { acct: r.acct } }, h('legend', { class: 'acc-row-acct' }, r.acct));
      const fields = h('div', { class: 'acc-row-fields' });
      if (has('direction')) fields.append(segField({ name: `${r.id}-dir`, label: 'Change', options: [['increase', 'Increase'], ['decrease', 'Decrease']], aria: `${r.acct}: increase or decrease` }));
      if (has('side')) fields.append(segField({ name: `${r.id}-side`, label: 'Entry', options: [['dr', 'Debit'], ['cr', 'Credit']], aria: `${r.acct}: debit or credit` }));
      if (has('amount')) fields.append(moneyField({ id: `${r.id}-amt`, label: 'Amount', aria: `${r.acct}: amount in dollars` }));
      if (has('accounts')) {
        const rm = h('button', { class: 'icon-btn icon-btn-sm acc-remove', type: 'button', 'aria-label': `Remove ${r.acct}`, title: `Remove ${r.acct}` }, crossIcon());
        rm.addEventListener('click', () => { rows.splice(rows.indexOf(r), 1); drawRows(); addSel?.focus(); say(live, `${r.acct} removed.`); });
        fields.append(rm);
      }
      fs.append(fields, h('div', { class: 'acc-row-fb' }));
      return fs;
    }
    function drawRows() {
      // each row keeps its element, so adding or removing an account never clears answers already given
      rowsBox.replaceChildren(...(rows.length ? rows.map((r) => (r.el ||= rowEl(r))) : [h('p', { class: 'acc-empty' }, 'No accounts added yet.')]));
    }

    // 1. accounts
    let addSel = null;
    if (has('accounts')) {
      const selId = uid('add');
      addSel = accountSelect(ch, { id: selId });
      const addBtn = h('button', { class: 'btn btn-secondary', type: 'button' }, 'Add account');
      const addErr = h('p', { class: 'error-text', 'aria-live': 'polite' });
      addBtn.addEventListener('click', () => {
        const v = addSel.value;
        addErr.textContent = '';
        if (!v) { addErr.textContent = 'Choose an account from the list first.'; addSel.focus(); return; }
        if (rows.some((r) => r.acct === v)) { addErr.textContent = `${v} is already in your list.`; return; }
        const r = { acct: v, id: uid('row') };
        rows.push(r); drawRows();
        addSel.value = '';
        say(live, `${v} added.`);
        (rowsBox.querySelector(`[data-acct="${CSS.escape(v)}"] input`) || addSel).focus();
      });
      form.append(h('div', { class: 'acc-q' },
        h('p', { class: 'acc-q-title' }, qTitle(PART.accounts)),
        h('p', { class: 'acc-hint' }, rowParts.length ? 'Add each account the transaction changes, then say how each one changes.' : 'Add each account the transaction changes.'),
        h('div', { class: 'acc-add' }, h('label', { class: 'visually-hidden', for: selId }, 'Account to add'), addSel, addBtn), addErr));
    }
    if (showRows) {
      const what = rowParts.map((p) => ({ direction: 'increase or decrease', side: 'debit or credit', amount: 'the amount' }[p]));
      if (!has('accounts') && rowParts.length) form.append(h('div', { class: 'acc-q' }, h('p', { class: 'acc-q-title' }, qTitle(`For each account: ${listWords(what)}`))));
      else if (rowParts.length) form.append(h('p', { class: 'acc-q-title acc-q-inline' }, qTitle(`For each account: ${listWords(what)}`)));
      form.append(rowsBox);
      drawRows();
    }
    // equation
    let eqIds = null;
    if (has('equation')) {
      eqIds = { assets: uid('eqa'), liabilities: uid('eql'), equity: uid('eqe') };
      const inp = (k) => h('div', { class: 'acc-eq-in' }, h('label', { for: eqIds[k], class: 'acc-mini' }, ELEMENT[k]),
        h('input', { class: 'input', id: eqIds[k], type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false', 'aria-label': `Change in ${k}, in dollars` }));
      form.append(h('fieldset', { class: 'acc-q acc-q-eq' }, h('legend', { class: 'acc-q-title' }, qTitle(PART.equation)),
        h('p', { class: 'acc-hint' }, 'Enter the change in each total in dollars. Use a minus sign for a decrease and 0 for no change.'),
        h('div', { class: 'acc-eq-inputs' }, inp('assets'), h('span', { class: 'acc-eq-op', 'aria-hidden': 'true' }, '='), inp('liabilities'), h('span', { class: 'acc-eq-op', 'aria-hidden': 'true' }, '+'), inp('equity')),
        h('div', { class: 'acc-q-fb' })));
    }
    // statements
    let stName = null;
    if (has('statements')) {
      stName = uid('st');
      const chipsBox = h('div', { class: 'chips' }, STATEMENTS.map(([v, t]) => { const id = uid('chip'); return h('label', { class: 'chip', for: id }, h('input', { type: 'checkbox', id, value: v, name: `${stName}-s` }), h('span', {}, t)); }));
      const cashSeg = h('div', { class: 'segmented acc-seg', role: 'radiogroup', 'aria-label': 'Statement of cash flows' },
        [['none', 'Not affected'], ['operating', 'Operating'], ['investing', 'Investing'], ['financing', 'Financing']].flatMap(([v, t]) => { const id = uid('cf'); return [h('input', { type: 'radio', name: `${stName}-cf`, id, value: v }), h('label', { for: id }, t)]; }));
      form.append(h('fieldset', { class: 'acc-q acc-q-st' }, h('legend', { class: 'acc-q-title' }, qTitle(PART.statements)),
        h('p', { class: 'acc-hint' }, 'Tick every statement the transaction changes. For the statement of cash flows, choose the activity if cash moves.'),
        chipsBox,
        h('div', { class: 'acc-cf' }, h('p', { class: 'acc-mini', 'aria-hidden': 'true' }, 'Statement of cash flows'), cashSeg),
        h('div', { class: 'acc-q-fb' })));
    }
    const checkBtn = h('button', { class: 'btn btn-primary', type: 'submit' }, 'Check my analysis');
    form.append(h('div', { class: 'acc-actions' }, checkBtn), errorEl);

    const val = (name) => form.querySelector(`input[name="${name}"]:checked`)?.value || '';
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      if (form.dataset.checked) return;
      // every part answered?
      const todo = [];
      let first = null;
      const need = (cond, words, elx) => { if (cond) { todo.push(words); first ||= elx; } };
      if (has('accounts')) need(!rows.length, 'add the accounts that change', addSel);
      for (const r of rows) {
        if (has('direction')) need(!val(`${r.id}-dir`), `increase or decrease for ${r.acct}`, form.querySelector(`input[name="${r.id}-dir"]`));
        if (has('side')) need(!val(`${r.id}-side`), `debit or credit for ${r.acct}`, form.querySelector(`input[name="${r.id}-side"]`));
        if (has('amount')) { const x = form.querySelector(`#${r.id}-amt`); const v = parseAmount(x.value); need(v == null || !Number.isFinite(v) || v <= 0, `a positive amount for ${r.acct}`, x); }
      }
      if (has('equation')) for (const k of ['assets', 'liabilities', 'equity']) { const x = form.querySelector(`#${eqIds[k]}`); const v = parseAmount(x.value); need(v == null || Number.isNaN(v), `the change in ${k} (0 if none)`, x); }
      if (has('statements')) need(!val(`${stName}-cf`), 'a choice for the statement of cash flows', form.querySelector(`input[name="${stName}-cf"]`));
      if (todo.length) {
        errorEl.textContent = `Answer every part first. Still to do: ${listWords(todo.slice(0, 3))}${todo.length > 3 ? ` and ${todo.length - 3} more` : ''}.`;
        first?.focus();
        return;
      }
      errorEl.textContent = '';
      grade(t, key, keyBy, rows, form, result, val, eqIds, stName);
    });

    root.replaceChildren(
      progressDots(),
      h('div', { class: 'acc-slip' },
        h('p', { class: 'acc-kicker' }, `Transaction ${i + 1} of ${txs.length}${t.date ? ` · ${dateLong(t.date)}` : ''}${t.adjusting ? ' · Month-end adjustment' : ''}`),
        h('p', { class: 'acc-tx-text', id: textId }, t.text)),
      form, result);
  }

  function grade(t, key, keyBy, rows, form, result, val, eqIds, stName) {
    const tally = Object.fromEntries(asks.map((k) => [k, [0, 0]]));
    const add = (k, ok) => { tally[k][1]++; if (ok) tally[k][0]++; };
    const chosen = new Set(rows.map((r) => r.acct));
    const extras = rows.filter((r) => !keyBy.has(r.acct));
    const missing = key.filter((e) => !chosen.has(e.acct));
    if (has('accounts')) add('accounts', !extras.length && !missing.length);
    for (const r of rows) {
      const fs = form.querySelector(`fieldset[data-acct="${CSS.escape(r.acct)}"]`);
      const fb = fs.querySelector('.acc-row-fb');
      const e = keyBy.get(r.acct);
      const notes = [];
      if (!e) {
        fs.classList.add('is-extra');
        const side = val(`${r.id}-side`) || null;
        notes.push(h('p', {}, mark(false), ' ', A.explainExtra(r.acct, t, ch, { side, chosen: [...chosen] })));
      } else {
        fs.classList.add('is-key');
        const fieldMark = (sel, ok) => { const f = sel && fs.querySelector(sel)?.closest('.acc-field'); if (f) { f.classList.add(ok ? 'is-right' : 'is-wrong'); f.append(mark(ok)); } };
        if (has('direction')) {
          const ok = val(`${r.id}-dir`) === e.direction; add('direction', ok);
          fieldMark(`input[name="${r.id}-dir"]`, ok);
          if (!ok) notes.push(h('p', {}, `${r.acct} ${e.direction}s here: ${A.directionReason(e.type, e.direction)}.`));
        }
        if (has('side')) {
          const ok = val(`${r.id}-side`) === e.side; add('side', ok);
          fieldMark(`input[name="${r.id}-side"]`, ok);
          if (!ok) notes.push(h('p', {}, A.sideRule(r.acct, e.direction, ch)));
        }
        if (has('amount')) {
          const ok = sameMoney(parseAmount(form.querySelector(`#${r.id}-amt`).value), e.amount); add('amount', ok);
          fieldMark(`#${r.id}-amt`, ok);
          if (!ok) notes.push(h('p', {}, `${r.acct} changes by ${usd(e.amount)}.`));
        }
        if (!rowParts.length) notes.push(h('p', {}, mark(true), ' Changes in this transaction.'));
      }
      fb.replaceChildren(...notes);
    }
    // key accounts the student didn't list still count for the row questions
    for (const e of missing) for (const p of rowParts) add(p, false);
    if (missing.length && showRows) {
      const rowsBox = form.querySelector('.acc-rows');
      for (const e of missing) {
        rowsBox.append(h('div', { class: 'acc-row is-missing' },
          h('p', { class: 'acc-row-acct' }, mark(false), ' Missing: ', e.acct),
          h('div', { class: 'acc-row-fb' }, h('p', {}, `${e.acct} is ${A.typeNoun(e.type)} and ${e.direction}s here (${A.directionReason(e.type, e.direction)}): ${e.side === 'dr' ? 'debit' : 'credit'} ${usd(e.amount)}.`))));
      }
    }
    // equation
    const q = A.equationEffect(t, ch);
    if (has('equation')) {
      const box = form.querySelector('.acc-q-eq');
      const got = {};
      const notes = [];
      for (const k of ['assets', 'liabilities', 'equity']) {
        const x = form.querySelector(`#${eqIds[k]}`);
        got[k] = parseAmount(x.value);
        const ok = sameMoney(got[k], q[k]); add('equation', ok);
        x.closest('.acc-eq-in').classList.add(ok ? 'is-right' : 'is-wrong');
        x.closest('.acc-eq-in').append(mark(ok));
        if (!ok) {
          const parts = elementBreakdown(t, ch, k);
          const one = k === 'equity';
          const none = { assets: 'asset', liabilities: 'liability', equity: 'revenue, expense, dividend or stock' }[k];
          notes.push(h('p', {}, q[k] === 0 && !parts.length
            ? `${ELEMENT[k]} ${one ? 'doesn’t' : 'don’t'} change: no ${none} is involved.`
            : `${ELEMENT[k]} ${one ? 'changes' : 'change'} by ${signed(q[k])}${parts.length ? ` (${parts.join(', ')})` : ''}.`));
        }
      }
      if (Number.isFinite(got.assets + got.liabilities + got.equity) && C(got.assets) !== C(got.liabilities) + C(got.equity)) {
        notes.push(h('p', {}, `Your three changes don’t balance: assets ${signed(got.assets)}, but liabilities plus equity come to ${signed(got.liabilities + got.equity)}. Every transaction keeps assets equal to liabilities plus equity.`));
      }
      box.querySelector('.acc-q-fb').replaceChildren(...notes);
    }
    // statements
    if (has('statements')) {
      const st = A.statementsAffected(t, ch);
      const box = form.querySelector('.acc-q-st');
      const notes = [];
      for (const [k] of STATEMENTS) {
        const input = box.querySelector(`input[name="${stName}-s"][value="${k}"]`);
        const ok = input.checked === st[k]; add('statements', ok);
        input.closest('.chip').classList.add(ok ? 'is-right' : 'is-wrong');
        input.closest('.chip').append(mark(ok));
        if (!ok) notes.push(h('p', {}, statementReason(k, t, ch, st)));
      }
      const cf = val(`${stName}-cf`);
      const want = st.cash ? st.cashClass : 'none';
      const okCf = cf === want; add('statements', okCf);
      const cfBox = box.querySelector('.acc-cf');
      cfBox.classList.add(okCf ? 'is-right' : 'is-wrong'); cfBox.append(mark(okCf));
      if (!okCf) notes.push(h('p', {}, statementReason('cash', t, ch, st)));
      else if (st.cash && st.cashClasses.length > 1) notes.push(h('p', {}, statementReason('cash', t, ch, st)));
      box.querySelector('.acc-q-fb').replaceChildren(...notes);
    }
    // lock the form
    form.dataset.checked = 'true';
    form.querySelectorAll('input, select, button').forEach((x) => { x.disabled = true; });
    form.querySelector('.acc-actions')?.remove();
    form.querySelector('.acc-add')?.remove();
    const right = Object.values(tally).reduce((s, [r]) => s + r, 0);
    const total = Object.values(tally).reduce((s, [, n]) => s + n, 0);
    const perfect = right === total && !extras.length;
    results[i] = { tally, right, total, perfect };
    const nextBtn = h('button', { class: 'btn btn-primary', type: 'button' }, i + 1 < txs.length ? 'Next transaction' : 'See your results');
    nextBtn.addEventListener('click', () => { i++; if (i < txs.length) { show(); focusSlip(); } else summary(); });
    const headId = uid('res');
    result.setAttribute('aria-labelledby', headId);
    result.replaceChildren(
      h('h4', { class: 'visually-hidden', id: headId }, 'Your result'),
      verdict(perfect ? 'good' : right / total >= 0.5 ? 'warn' : 'bad', perfect ? 'All right.' : `${right} of ${total} parts right.`, perfect ? 'Every part of your analysis matches the entry below.' : 'The notes beside each answer say what went wrong. Compare with the entry below.'),
      h('div', { class: 'acc-answer' },
        h('p', { class: 'acc-answer-title' }, 'The journal entry'),
        journalTable([t], { chart: ch, refs: false, memo: false }),
        h('p', { class: 'acc-explain' }, explainEntry(t, ch)),
        h('p', { class: 'acc-eqline num' }, equationLine(q))),
      h('div', { class: 'acc-actions' }, nextBtn));
    say(live, perfect ? 'All right.' : `${right} of ${total} parts right. Feedback is shown beside each answer.`);
    result.focus({ preventScroll: false });
    onProgress?.({ done: results.filter(Boolean).length, total: txs.length, perfect: results.filter((r) => r?.perfect).length });
  }
  function focusSlip() {
    const k = root.querySelector('.acc-slip');
    if (k) { k.setAttribute('tabindex', '-1'); k.focus({ preventScroll: false }); }
  }

  function summary() {
    const perfect = results.filter((r) => r?.perfect).length;
    const parts = asks.map((k) => [k, results.reduce((s, r) => s + (r?.tally[k]?.[0] || 0), 0), results.reduce((s, r) => s + (r?.tally[k]?.[1] || 0), 0)]).filter((p) => p[2]);
    const again = h('button', { class: 'btn btn-secondary', type: 'button' }, 'Go through them again');
    again.addEventListener('click', () => { results = txs.map(() => null); i = 0; show(); focusSlip(); });
    const headId = uid('sum');
    root.replaceChildren(progressDots(), h('section', { class: 'acc-summary', 'aria-labelledby': headId, tabindex: '-1' },
      h('h4', { class: 'acc-kicker', id: headId }, 'Your results'),
      h('div', { class: 'figure-hero' }, h('span', { class: 'hero-value num' }, `${perfect} of ${txs.length}`), h('span', { class: 'hero-label' }, `transactions with every part right`)),
      h('div', { class: 'table-scroll' }, h('table', { class: 'data-table acc-score' },
        h('caption', { class: 'visually-hidden' }, 'Your score by part'),
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Part'), h('th', { scope: 'col', class: 'is-num' }, 'Right'), h('th', { scope: 'col', class: 'is-num' }, 'Out of'))),
        h('tbody', {}, parts.map(([k, r, n]) => h('tr', {}, h('th', { scope: 'row' }, PART[k]), h('td', { class: 'is-num' }, String(r)), h('td', { class: 'is-num' }, String(n))))))),
      h('p', { class: 'acc-note' }, perfect === txs.length ? 'Every transaction right. Try a harder set, or record these entries in full.' : 'The parts with the lowest scores are the ones to practise. Go through the set again, or try a new one.'),
      h('div', { class: 'acc-actions' }, again, ...actions)));
    root.querySelector('.acc-summary').focus();
    say(live, `${perfect} of ${txs.length} transactions with every part right.`);
    onDone?.({ perfect, total: txs.length, parts: Object.fromEntries(parts.map(([k, r, n]) => [k, { right: r, of: n }])) });
  }

  show();
  return { destroy() { el.replaceChildren(); } };
}

// ---------------------------------------------------------------- record and post

/**
 * The record-and-post bench: the student writes each journal entry; a right entry is posted to the general
 * journal, the T-accounts and the trial balance, with the equation check always in view.
 * scenario: { name, chart: [accounts like CHART], transactions: [{ id, date, text, lines, cash? }], adjustments?: [...],
 *             opening?: { [acct]: balance } }  (opening is an addition: balances brought forward)
 * opts: { onProgress({ done, total, firstTry }), onChange(api), store: { load() → saved | null, save(saved) } }
 * Returns an api: { entries(), ledger(), complete(), reset(), destroy() }.
 */
export function mountRecorder(el, scenario, opts = {}) {
  ensureStyles();
  let ch;
  try { ch = A.makeChart(scenario.chart || CHART); } catch (e) { errorBox(el, e.message); return null; }
  const base = (scenario.transactions || []).map((t, k) => ({ ...t, id: t.id ?? `t${k + 1}` }));
  const lastDate = [...base].reverse().find((t) => t.date)?.date;
  const adj = (scenario.adjustments || []).map((t, k) => ({ ...t, id: t.id ?? `a${k + 1}`, adjusting: true, date: t.date || (lastDate ? monthOf(lastDate).end : null) }));
  const txs = [...base, ...adj];
  const opening = scenario.opening || {};
  const total = txs.length;
  for (const t of txs) { const v = A.validateEntry(t, ch); if (!v.ok) { errorBox(el, `Entry ${t.id}: ${v.errors[0]}`); return null; } }

  // saved progress: accepted entries, in order
  let done = [];
  try {
    const saved = opts.store?.load?.();
    if (saved && Array.isArray(saved.done)) {
      for (const d of saved.done) {
        const t = txs[done.length];
        if (!t || d.id !== t.id || !A.checkEntry(t, { lines: d.lines }, ch).correct) break;
        done.push({ id: d.id, lines: d.lines, firstTry: !!d.firstTry });
      }
    }
  } catch { done = []; }
  let draft = null, attempts = 0, shown = false, phase = 'edit', justPosted = null, confirming = false;
  const save = () => { try { opts.store?.save?.({ done }); } catch { /* storage unavailable: progress lasts for this visit */ } };

  const txOf = (id) => txs.find((t) => t.id === id);
  const entries = () => done.map((d) => { const t = txOf(d.id); return { id: t.id, date: t.date, text: t.text, lines: d.lines, cash: t.cash, adjusting: t.adjusting }; });
  const ledger = () => A.post(entries(), ch, opening);
  const firstTry = () => done.filter((d) => d.firstTry).length;
  const api = { entries, ledger, complete: () => done.length === total, total, scenario, chart: ch, opening, reset, destroy: () => el.replaceChildren() };

  // the answer key's largest totals keep the equation bars on one scale
  const fullTotals = A.equationTotals(A.post(txs, ch, opening), ch);
  const scale = Math.max(fullTotals.assets, A.equationTotals(A.post([], ch, opening), ch).assets, 1) * 1.04;

  const root = h('div', { class: 'acc acc-rec' });
  const live = liveRegion();
  const statusEl = h('div', { class: 'acc-rec-status' });
  const eq = equationBar();
  const work = h('section', { class: 'acc-rec-work', 'aria-label': 'The entry you are writing' });
  const journalBox = h('div', { class: 'acc-scrollbox', tabindex: '0', role: 'region', 'aria-label': 'General journal (scrolls)' });
  const ledgerBox = h('div', { class: 'acc-rec-ledger-body' });
  const tbBox = h('div');
  const jId = uid('jh'), lId = uid('lh'), tId = uid('th');
  root.append(statusEl, h('div', { class: 'acc-eqbar-wrap' }, eq.el),
    h('div', { class: 'acc-rec-main' }, work, h('section', { class: 'acc-rec-journal', 'aria-labelledby': jId }, h('h4', { class: 'acc-h', id: jId }, 'General journal'), journalBox)),
    h('section', { class: 'acc-rec-ledger', 'aria-labelledby': lId }, h('h4', { class: 'acc-h', id: lId }, 'General ledger'), h('p', { class: 'acc-note' }, 'Each line of a posted entry lands in its account: debits on the left, credits on the right, numbered by entry. The balance sits on the larger side.'), ledgerBox),
    h('section', { class: 'acc-rec-tb', 'aria-labelledby': tId }, h('h4', { class: 'acc-h', id: tId }, 'Trial balance'), tbBox),
    live);
  el.replaceChildren(root);

  function drawStatus() {
    const pct = total ? (done.length / total) * 100 : 0;
    const resetBtn = h('button', { class: 'btn btn-ghost acc-btn-small', type: 'button' }, 'Start again');
    resetBtn.addEventListener('click', () => { confirming = true; drawStatus(); statusEl.querySelector('.acc-confirm button')?.focus(); });
    const confirm = confirming ? h('div', { class: 'acc-confirm', role: 'group', 'aria-label': 'Confirm starting again' },
      h('span', {}, done.length ? `Clear your ${plural(done.length, 'recorded entry', 'recorded entries')}?` : 'Start from the first transaction?'),
      (() => { const b = h('button', { class: 'btn btn-primary acc-btn-small', type: 'button' }, 'Clear and start again'); b.addEventListener('click', () => { reset(); }); return b; })(),
      (() => { const b = h('button', { class: 'btn btn-secondary acc-btn-small', type: 'button' }, 'Cancel'); b.addEventListener('click', () => { confirming = false; drawStatus(); statusEl.querySelector('.acc-btn-small')?.focus(); }); return b; })()) : null;
    statusEl.replaceChildren(
      h('div', { class: 'acc-rec-progress' },
        h('p', {}, h('strong', {}, `${done.length} of ${total}`), ` entries recorded · ${firstTry()} right first time`),
        h('div', { class: 'acc-meter', role: 'progressbar', 'aria-label': 'Entries recorded', 'aria-valuemin': '0', 'aria-valuemax': String(total), 'aria-valuenow': String(done.length) }, h('span', { style: { width: `${pct}%` } }))),
      confirm || resetBtn);
  }

  function drawBooks() {
    const L = ledger();
    const posted = justPosted ? txOf(justPosted) : null;
    const touched = new Set(posted ? posted.lines.map((l) => l.acct) : []);
    eq.update(A.equationTotals(L, ch), { scale });
    journalBox.replaceChildren(journalTable(entries(), { chart: ch, posted: true, highlight: justPosted, empty: 'Entries appear here as you post them.' }));
    journalBox.scrollTop = journalBox.scrollHeight;
    ledgerBox.replaceChildren(tAccountsGrid(L, ch, { highlight: justPosted, empty: 'Nothing has been posted yet. Write the first entry above.' }));
    tbBox.replaceChildren(trialBalanceTable(A.trialBalance(L, ch), { caption: `Trial balance after ${plural(done.length, 'entry', 'entries')}`, highlight: touched, empty: 'No balances yet.' }));
  }

  function lineRow(d, k, n) {
    const ids = { a: uid('la'), d: uid('ld'), c: uid('lc') };
    const sel = accountSelect(ch, { id: ids.a, value: d.acct });
    const money = (id, v, label) => h('div', { class: 'affix' }, h('span', { class: 'affix-pre', 'aria-hidden': 'true' }, '$'), (() => { const x = h('input', { class: 'input', id, type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false', 'aria-label': label }); x.value = v ?? ''; return x; })());
    const row = h('div', { class: `acc-ed-line${isCrLine(d) ? ' is-credit' : ''}`, dataset: { k: String(k) } },
      h('div', { class: 'acc-ed-acct' }, h('label', { class: 'visually-hidden', for: ids.a }, `Line ${k + 1}: account`), sel),
      h('div', { class: 'acc-ed-dr' }, h('span', { class: 'acc-mini acc-ed-colname', 'aria-hidden': 'true' }, 'Debit'), money(ids.d, d.dr, `Line ${k + 1}: debit amount`)),
      h('div', { class: 'acc-ed-cr' }, h('span', { class: 'acc-mini acc-ed-colname', 'aria-hidden': 'true' }, 'Credit'), money(ids.c, d.cr, `Line ${k + 1}: credit amount`)),
      (() => {
        const rm = h('button', { class: 'icon-btn icon-btn-sm acc-remove', type: 'button', 'aria-label': `Remove line ${k + 1}`, title: `Remove line ${k + 1}`, disabled: n <= 2 }, crossIcon());
        rm.addEventListener('click', () => { draft.splice(k, 1); drawWork('.acc-add-line'); });
        return rm;
      })());
    sel.addEventListener('change', () => { d.acct = sel.value; updateTotals(); });
    row.querySelector(`#${ids.d}`).addEventListener('input', (ev) => { d.dr = ev.target.value; row.classList.toggle('is-credit', isCrLine(d)); updateTotals(); });
    row.querySelector(`#${ids.c}`).addEventListener('input', (ev) => { d.cr = ev.target.value; row.classList.toggle('is-credit', isCrLine(d)); updateTotals(); });
    return row;
  }
  let totalsEl = null;
  function updateTotals() {
    if (!totalsEl) return;
    let dr = 0, cr = 0, bad = false;
    for (const d of draft) { const x = parseAmount(d.dr), y = parseAmount(d.cr); if (Number.isNaN(x) || Number.isNaN(y)) bad = true; dr += C(x || 0); cr += C(y || 0); }
    totalsEl.replaceChildren(
      h('span', {}, 'Debits ', h('strong', { class: 'num' }, usd(dr / 100))),
      h('span', {}, 'Credits ', h('strong', { class: 'num' }, usd(cr / 100))),
      h('span', { class: dr === cr && dr ? 'is-ok' : 'is-off' }, bad ? 'Check the amounts: one isn’t a number.' : dr === cr ? (dr ? 'Equal' : '') : `Difference ${usd(Math.abs(dr - cr) / 100)}`));
  }

  function drawWork(focusSel = null) {
    if (done.length >= total) {
      const L = ledger();
      const tb = A.trialBalance(L, ch);
      work.replaceChildren(h('div', { class: 'acc-done', tabindex: '-1' },
        verdict('good', 'Every entry is recorded and posted.', `${firstTry()} of ${total} were right first time. The trial balance totals ${usd(tb.dr)} on each side.`),
        h('p', { class: 'acc-note' }, 'The statements and the closing entries below are built from your ledger.')));
      if (focusSel === 'done') work.querySelector('.acc-done').focus();
      return;
    }
    const t = txs[done.length];
    const headId = uid('wh');
    const label = A.entryLabel(t);
    const heading = h('h4', { class: 'acc-work-title', id: headId, tabindex: '-1' }, `${t.adjusting ? 'Adjustment' : 'Transaction'} ${label}${t.date ? ` · ${dateLong(t.date)}` : ''}`);
    if (phase === 'posted' && justPosted) {
      const p = txOf(justPosted);
      const next = h('button', { class: 'btn btn-primary', type: 'button' }, `Next: ${t.adjusting ? 'adjustment' : 'transaction'} ${label}`);
      next.addEventListener('click', () => { phase = 'edit'; justPosted = null; draft = null; drawWork('heading'); drawBooks(); });
      work.replaceChildren(
        h('div', { class: 'acc-posted', tabindex: '-1' },
          verdict('good', `${p.adjusting ? 'Adjustment' : 'Entry'} ${A.entryLabel(p)} posted.`, `${done.at(-1).firstTry ? 'Right first time. ' : ''}Its lines are marked in the journal, the T-accounts and the trial balance below.`),
          h('p', { class: 'acc-eqline num' }, equationLine(A.equationEffect(p, ch))),
          h('div', { class: 'acc-actions' }, next)));
      if (focusSel === 'next') next.focus();
      return;
    }
    if (!draft) { draft = [{ acct: '', dr: '', cr: '' }, { acct: '', dr: '', cr: '' }]; attempts = 0; shown = false; }
    const form = h('form', { class: 'acc-editor', novalidate: true, 'aria-labelledby': headId });
    const linesBox = h('div', { class: 'acc-ed-lines' }, draft.map((d, k) => lineRow(d, k, draft.length)));
    const addId = uid('addl');
    const addLine = h('button', { class: 'btn btn-secondary acc-btn-small acc-add-line', id: addId, type: 'button' }, '+ Add a line');
    addLine.addEventListener('click', () => { draft.push({ acct: '', dr: '', cr: '' }); drawWork(`[data-k="${draft.length - 1}"] select`); });
    totalsEl = h('p', { class: 'acc-ed-totals', 'aria-live': 'off' });
    const feedback = h('div', { class: 'acc-feedback', 'aria-live': 'polite' });
    const showBtn = h('button', { class: 'btn btn-ghost', type: 'button' }, 'Show the entry');
    showBtn.addEventListener('click', () => {
      shown = true;
      const lines = [...t.lines.filter((l) => !isCrLine(l)), ...t.lines.filter(isCrLine)];
      draft = lines.map((l) => ({ acct: l.acct, dr: isCrLine(l) ? '' : amt(l.dr), cr: isCrLine(l) ? amt(l.cr) : '' }));
      drawWork('.acc-check');
      work.querySelector('.acc-feedback').replaceChildren(verdict('warn', 'Here is the entry.', 'Read it against the transaction, then choose Check and post. It won’t count as right first time.'));
    });
    form.append(
      h('div', { class: 'acc-ed-head', 'aria-hidden': 'true' }, h('span', {}, 'Account'), h('span', {}, 'Debit'), h('span', {}, 'Credit'), h('span')),
      linesBox,
      h('div', { class: 'acc-ed-foot' }, addLine, totalsEl),
      h('div', { class: 'acc-actions' }, h('button', { class: 'btn btn-primary acc-check', type: 'submit' }, 'Check and post'), showBtn),
      feedback);
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const lines = draft.map((d) => ({ acct: d.acct, dr: parseAmount(d.dr), cr: parseAmount(d.cr) })).filter((l) => l.acct || l.dr != null || l.cr != null);
      const res = A.checkEntry(t, { lines }, ch);
      form.querySelectorAll('.acc-ed-line').forEach((r) => { r.classList.remove('is-flagged'); r.querySelector('select').removeAttribute('aria-invalid'); });
      if (res.correct) {
        const clean = lines.filter((l) => l.acct && (hasAmt(l.dr) || hasAmt(l.cr))).map((l) => (hasAmt(l.dr) ? { acct: l.acct, dr: l.dr } : { acct: l.acct, cr: l.cr }));
        done.push({ id: t.id, lines: clean, firstTry: attempts === 0 && !shown });
        save();
        justPosted = t.id; phase = 'posted'; draft = null;
        drawStatus(); drawBooks();
        if (done.length >= total) { justPosted = null; phase = 'edit'; drawWork('done'); }
        else drawWork('next');
        const q = A.equationTotals(ledger(), ch);
        say(live, `Posted. Assets ${usd(q.assets)} equal liabilities ${usd(q.liabilities)} plus equity ${usd(q.equity)}.`);
        opts.onProgress?.({ done: done.length, total, firstTry: firstTry() });
        opts.onChange?.(api);
        return;
      }
      attempts++;
      const msgs = [...new Set(res.issues.map((x) => x.message))];
      const flagged = new Set(res.issues.filter((x) => x.acct && x.kind !== 'missing-account').map((x) => x.acct));
      form.querySelectorAll('.acc-ed-line').forEach((r) => { const d = draft[+r.dataset.k]; if (d && flagged.has(d.acct)) { r.classList.add('is-flagged'); r.querySelector('select').setAttribute('aria-invalid', 'true'); } });
      feedback.replaceChildren(verdict('bad', 'Not yet.', msgs.length === 1 ? 'One thing to fix:' : `${msgs.length} things to fix:`),
        h('ul', { class: 'acc-issues' }, msgs.map((m) => h('li', {}, m))),
        h('p', { class: 'acc-note' }, attempts >= 2 ? 'Stuck? Choose Show the entry to see it, then post it.' : 'Change the entry and check again.'));
    });
    fill(work, heading,
      h('p', { class: 'acc-tx-text' }, t.text),
      t.kind ? h('p', { class: 'acc-tx-kind' }, `Adjustment for: ${t.kind}`) : null,
      form);
    updateTotals();
    if (focusSel === 'heading') heading.focus();
    else if (focusSel) work.querySelector(focusSel)?.focus();
  }

  function reset() {
    done = []; draft = null; attempts = 0; shown = false; phase = 'edit'; justPosted = null; confirming = false;
    save();
    drawStatus(); drawBooks(); drawWork('heading');
    say(live, 'Cleared. Starting from the first transaction.');
    opts.onProgress?.({ done: 0, total, firstTry: 0 });
    opts.onChange?.(api);
  }

  drawStatus(); drawBooks(); drawWork();
  opts.onProgress?.({ done: done.length, total, firstTry: firstTry() });
  opts.onChange?.(api);
  return api;
}
