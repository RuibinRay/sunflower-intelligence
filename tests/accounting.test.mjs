// Run: node tests/accounting.test.mjs   (the accounting engine behind the Accounting Lab and the F01 widgets)
// Checks the engine against Lantern Coffee Co.'s March, worked by hand in f01/case.js (MARCH_FACTS), and checks the
// rules every entry must obey on 1,000+ generated transactions.
import * as A from '../assets/js/core/accounting.js';
import { CHART, MARCH, MARCH_ADJUSTMENTS, MARCH_FACTS } from '../assets/js/data/study/f01/case.js';

let fails = 0, checks = 0;
const ok = (label, cond, detail = '') => { checks++; if (!cond) { fails++; console.log(`FAIL ${label}${detail ? `: ${detail}` : ''}`); } };
const eq = (label, got, want) => ok(label, Math.abs(got - want) < 0.005, `got ${got}, want ${want}`);
const kinds = (r) => r.issues.map((i) => i.kind).sort().join(',');

const chart = A.makeChart(CHART);
const ADJ = MARCH_ADJUSTMENTS.map((a) => ({ ...a, date: '2026-03-31' }));
const ALL = [...MARCH, ...ADJ];

// ---------------------------------------------------------------- the chart and the rules of debit and credit
ok('makeChart indexes every account', chart.list.length === CHART.length && chart.byName.Cash.no === 101 && chart.byNo[220].name === 'Unearned Revenue');
ok('makeChart accepts a made chart', A.makeChart(chart) === chart);
let threw = false; try { A.makeChart([{ name: 'Cash', type: 'asset' }, { name: 'Odd', type: 'inventory' }]); } catch { threw = true; }
ok('makeChart rejects an unknown type', threw);
threw = false; try { A.makeChart([{ name: 'Cash', type: 'asset' }, { name: 'Cash', type: 'asset' }]); } catch { threw = true; }
ok('makeChart rejects a duplicate name', threw);
ok('contra account takes its asset’s group', chart.byName['Accumulated Depreciation—Equipment'].group === 'noncurrent');
const normals = { Cash: 'dr', 'Accumulated Depreciation—Equipment': 'cr', 'Accounts Payable': 'cr', 'Common Stock': 'cr', Dividends: 'dr', 'Catering Revenue': 'cr', 'Wages Expense': 'dr', 'Income Summary': 'cr' };
for (const [n, s] of Object.entries(normals)) ok(`normalSide ${n}`, A.normalSide(n, CHART) === s);
for (const [t, info] of Object.entries(A.TYPE_INFO)) ok(`TYPE_INFO ${t} complete`, ['dr', 'cr'].includes(info.normal) && ['assets', 'liabilities', 'equity'].includes(info.element) && Math.abs(info.sign) === 1);

const le = A.lineEffect({ acct: 'Accumulated Depreciation—Equipment', cr: 200 }, CHART);
ok('lineEffect: contra asset credited increases and lowers assets', le.direction === 'increase' && le.element === 'assets' && le.change === -200 && le.side === 'cr');
const ld = A.lineEffect({ acct: 'Dividends', dr: 300 }, CHART);
ok('lineEffect: dividends debited increase and lower equity', ld.direction === 'increase' && ld.element === 'equity' && ld.change === -300);
const lp = A.lineEffect({ acct: 'Accounts Payable', dr: 1000 }, CHART);
ok('lineEffect: payable debited decreases liabilities', lp.direction === 'decrease' && lp.element === 'liabilities' && lp.change === -1000);
const lr = A.lineEffect({ acct: 'Training Revenue', cr: 1500 }, CHART);
ok('lineEffect: revenue credited increases equity', lr.direction === 'increase' && lr.change === 1500);

// ---------------------------------------------------------------- every case entry is valid
for (const e of ALL) {
  const v = A.validateEntry(e, CHART);
  ok(`${e.id} validates`, v.ok, v.errors.join(' '));
  const q = A.equationEffect(e, CHART);
  eq(`${e.id} keeps A = L + E`, q.assets, q.liabilities + q.equity);
}
ok('validateEntry: unbalanced', !A.validateEntry({ lines: [{ acct: 'Cash', dr: 100 }, { acct: 'Common Stock', cr: 90 }] }, CHART).ok);
ok('validateEntry: one line', !A.validateEntry({ lines: [{ acct: 'Cash', dr: 100 }] }, CHART).ok);
ok('validateEntry: unknown account', /not in the chart/.test(A.validateEntry({ lines: [{ acct: 'Petty Cash Box', dr: 100 }, { acct: 'Common Stock', cr: 100 }] }, CHART).errors.join(' ')));
ok('validateEntry: negative amount', /positive/.test(A.validateEntry({ lines: [{ acct: 'Cash', dr: -100 }, { acct: 'Common Stock', cr: -100 }] }, CHART).errors.join(' ')));
ok('validateEntry: both sides on one line', /both a debit and a credit/.test(A.validateEntry({ lines: [{ acct: 'Cash', dr: 100, cr: 100 }, { acct: 'Common Stock', cr: 100 }] }, CHART).errors.join(' ')));
ok('validateEntry: no amount', /no amount/.test(A.validateEntry({ lines: [{ acct: 'Cash' }, { acct: 'Common Stock', cr: 100 }] }, CHART).errors.join(' ')));
ok('validateEntry: all debits', !A.validateEntry({ lines: [{ acct: 'Cash', dr: 100 }, { acct: 'Supplies', dr: 100 }] }, CHART).ok);
ok('validateEntry: to the cent', A.validateEntry({ lines: [{ acct: 'Cash', dr: 0.1 }, { acct: 'Cash', dr: 0.2 }, { acct: 'Common Stock', cr: 0.3 }] }, CHART).ok);
ok('validateEntry: a cent out', !A.validateEntry({ lines: [{ acct: 'Cash', dr: 100.01 }, { acct: 'Common Stock', cr: 100 }] }, CHART).ok);
ok('validateEntry: fractions of a cent', !A.validateEntry({ lines: [{ acct: 'Cash', dr: 100.005 }, { acct: 'Common Stock', cr: 100.005 }] }, CHART).ok);

// ---------------------------------------------------------------- the March case reproduces MARCH_FACTS
const unadj = A.trialBalance(A.post(MARCH, CHART), CHART);
eq('unadjusted trial balance debits', unadj.dr, MARCH_FACTS.unadjustedTotal);
eq('unadjusted trial balance credits', unadj.cr, MARCH_FACTS.unadjustedTotal);
ok('unadjusted trial balance balances', unadj.balanced);
const L = A.post(ALL, CHART);
const tb = A.trialBalance(L, CHART);
eq('adjusted trial balance debits', tb.dr, MARCH_FACTS.adjustedTotal);
eq('adjusted trial balance credits', tb.cr, MARCH_FACTS.adjustedTotal);
ok('adjusted trial balance in chart order, no zero rows', tb.rows.every((r, i) => i === 0 || chart.byName[r.acct].order > chart.byName[tb.rows[i - 1].acct].order) && tb.rows.every((r) => r.dr || r.cr));
eq('cash at 31 March', L.Cash.balance, MARCH_FACTS.cashEnd);
ok('ledger lines carry running balances', L.Cash.lines.length === MARCH.filter((t) => t.lines.some((l) => l.acct === 'Cash')).length && L.Cash.lines.at(-1).balance === MARCH_FACTS.cashEnd);
ok('ledger lines carry labels', L.Equipment.lines[0].label === '3' && L['Prepaid Insurance'].lines.at(-1).label === 'A1');
const is = A.incomeStatement(L, CHART);
eq('revenue', is.totalRevenue, MARCH_FACTS.revenue);
eq('expenses', is.totalExpenses, MARCH_FACTS.expenses);
eq('net income', is.netIncome, MARCH_FACTS.netIncome);
ok('catering revenue 5,600 and training 1,500', is.revenues[0][1] === 5600 && is.revenues[1][1] === 1500);
const es = A.equityStatement(L, CHART);
eq('ending retained earnings', es.retainedEarnings.end, MARCH_FACTS.retainedEarningsEnd);
eq('dividends', es.retainedEarnings.dividends, MARCH_FACTS.dividends);
eq('equity statement total', es.total, MARCH_FACTS.totalEquity);
eq('common stock issued in March', es.commonStock.issued, 20000);
ok('equity statement rows run from beginning to ending balance', es.rows[0][0] === 'Beginning balance' && es.rows.at(-1)[3] === MARCH_FACTS.totalEquity);
const bs = A.balanceSheet(L, CHART);
eq('total assets', bs.assets.total, MARCH_FACTS.totalAssets);
eq('current assets', bs.assets.currentTotal, 30700);
eq('total liabilities', bs.liabilities.total, MARCH_FACTS.totalLiabilities);
eq('current liabilities', bs.liabilities.currentTotal, 11810);
eq('total equity', bs.equityTotal, MARCH_FACTS.totalEquity);
ok('balance sheet balances', bs.balanced);
const contraAt = bs.assets.noncurrent.findIndex((r) => r[0] === 'Accumulated Depreciation—Equipment');
ok('contra account shown as a negative straight after its asset', contraAt > 0 && bs.assets.noncurrent[contraAt - 1][0] === 'Equipment' && bs.assets.noncurrent[contraAt][1] === -200);
ok('retained earnings on the balance sheet include March’s net income less dividends', bs.equity.find((r) => r[0] === 'Retained Earnings')?.[1] === 690);
const cf = A.cashFlows(ALL, CHART);
eq('operating cash flow', cf.operating, MARCH_FACTS.cashFlows.operating);
eq('investing cash flow', cf.investing, MARCH_FACTS.cashFlows.investing);
eq('financing cash flow', cf.financing, MARCH_FACTS.cashFlows.financing);
eq('net change in cash = ending cash', cf.net, MARCH_FACTS.cashEnd);
eq('cash-flow lines add up', cf.lines.reduce((s, l) => s + l[1], 0), cf.net);
ok('customers line is 6,900', cf.lines.find((l) => l[0] === 'Cash received from customers')?.[1] === 6900);
ok('noncash: equipment of $8,000 on credit', cf.noncash.length === 1 && /Equipment/.test(cf.noncash[0]) && /\$8,000/.test(cf.noncash[0]));
const tot = A.equationTotals(L, CHART);
ok('equation totals', tot.assets === 42500 && tot.liabilities === 21810 && tot.equity === 20690 && tot.balanced);
const cfOverride = A.cashFlows(MARCH.map((t) => ({ ...t, cash: undefined })), CHART);
ok('cash classes worked out from the counter accounts agree with case.js', cfOverride.operating === 950 && cfOverride.investing === -4000 && cfOverride.financing === 29700);

for (const method of ['summary', 'direct']) {
  const ce = A.closingEntries(L, CHART, { method, date: '2026-03-31' });
  ok(`${method}: ${method === 'summary' ? 4 : 3} closing entries`, ce.length === (method === 'summary' ? 4 : 3));
  ce.forEach((e) => ok(`${method}: closing entry ${e.id} validates`, A.validateEntry(e, CHART).ok));
  ok(`${method}: Income Summary used only when asked`, ce.some((e) => e.lines.some((l) => l.acct === 'Income Summary')) === (method === 'summary'));
  const Lc = A.post([...ALL, ...ce], CHART);
  const post = A.trialBalance(Lc, CHART);
  eq(`${method}: post-closing trial balance`, post.dr, MARCH_FACTS.postClosingTotal);
  ok(`${method}: post-closing trial balance balances`, post.balanced);
  ok(`${method}: temporary accounts are zero`, chart.list.filter((a) => a.temporary).every((a) => !Lc[a.name] || Lc[a.name].balance === 0));
  eq(`${method}: retained earnings after closing`, Lc['Retained Earnings'].balance, MARCH_FACTS.retainedEarningsEnd);
  ok(`${method}: balance sheet unchanged by closing`, A.balanceSheet(Lc, CHART).assets.total === 42500 && A.balanceSheet(Lc, CHART).equityTotal === 20690);
}
const ceSum = A.closingEntries(L, CHART, { method: 'summary' });
eq('Income Summary closes net income of 990', ceSum[2].lines.find((l) => l.acct === 'Retained Earnings').cr, 990);
threw = false; try { A.closingEntries(L, CHART.filter((a) => a.type !== 'summary'), { method: 'summary' }); } catch { threw = true; }
ok('closing through Income Summary needs the account', threw);

// a net loss closes the other way
const lossLedger = A.post([MARCH[0], { id: 'x', date: '2026-03-02', text: 'Rent', lines: [{ acct: 'Rent Expense', dr: 900 }, { acct: 'Cash', cr: 900 }] }, { id: 'y', date: '2026-03-03', text: 'Sale', lines: [{ acct: 'Cash', dr: 400 }, { acct: 'Catering Revenue', cr: 400 }] }], CHART);
const lossClose = A.closingEntries(lossLedger, CHART, { method: 'summary' });
ok('net loss: Income Summary credited to close', lossClose[2].lines.some((l) => l.acct === 'Income Summary' && l.cr === 500) && lossClose[2].lines.some((l) => l.acct === 'Retained Earnings' && l.dr === 500));
eq('net loss on the income statement', A.incomeStatement(lossLedger, CHART).netIncome, -500);

// opening balances: April continues from March's post-closing ledger
const closed = A.post([...ALL, ...A.closingEntries(L, CHART, { method: 'summary' })], CHART);
const opening = Object.fromEntries(A.ledgerAccounts(closed, CHART).filter((t) => t.balance).map((t) => [t.acct, t.balance]));
const april = A.post([], CHART, opening);
ok('opening balances post as a balanced trial balance', A.trialBalance(april, CHART).dr === MARCH_FACTS.postClosingTotal && A.trialBalance(april, CHART).balanced);
const esApril = A.equityStatement(april, CHART, opening);
ok('equity statement starts from the opening balances', esApril.rows[0][3] === 20690 && esApril.retainedEarnings.begin === 690 && esApril.commonStock.issued === 0);

// ---------------------------------------------------------------- statements affected
const sa = (e) => A.statementsAffected(e, CHART);
const s8 = sa(MARCH[7]);
ok('revenue on account: income, equity, balance; no cash', s8.income && s8.equity && s8.balance && !s8.cash && s8.cashClass === null);
const s14 = sa(MARCH[13]);
ok('cash dividend: equity and cash (financing), not income', !s14.income && s14.equity && s14.balance && s14.cash && s14.cashClass === 'financing');
const sEq = sa({ id: 'q', lines: [{ acct: 'Equipment', dr: 3000 }, { acct: 'Accounts Payable', cr: 3000 }] });
ok('equipment on credit: balance sheet only', !sEq.income && !sEq.equity && sEq.balance && !sEq.cash);
const s12 = sa(MARCH[11]);
ok('collecting a receivable: balance sheet and operating cash only', !s12.income && !s12.equity && s12.balance && s12.cash && s12.cashClass === 'operating');
const sA3 = sa(ADJ[2]);
ok('adjusting entry (depreciation): income, equity, balance; no cash', sA3.income && sA3.equity && sA3.balance && !sA3.cash);
ok('equipment bought for cash with no class given: investing', sa({ lines: [{ acct: 'Equipment', dr: 900 }, { acct: 'Cash', cr: 900 }] }).cashClass === 'investing');
ok('borrowing with no class given: financing', sa({ lines: [{ acct: 'Cash', dr: 900 }, { acct: 'Notes Payable', cr: 900 }] }).cashClass === 'financing');
ok('issuing stock with no class given: financing', sa({ lines: [{ acct: 'Cash', dr: 900 }, { acct: 'Common Stock', cr: 900 }] }).cashClass === 'financing');
ok('paying interest: operating', sa({ lines: [{ acct: 'Interest Payable', dr: 50 }, { acct: 'Cash', cr: 50 }] }).cashClass === 'operating');
const split = sa({ lines: [{ acct: 'Notes Payable', dr: 2000 }, { acct: 'Interest Expense', dr: 60 }, { acct: 'Cash', cr: 2060 }] });
ok('loan repayment with interest: financing mostly, operating too', split.cashClass === 'financing' && split.cashClasses.includes('operating') && split.cashClasses.length === 2);
const cfSplit = A.cashFlows([{ lines: [{ acct: 'Notes Payable', dr: 2000 }, { acct: 'Interest Expense', dr: 60 }, { acct: 'Cash', cr: 2060 }] }], CHART);
ok('cash flows split principal and interest', cfSplit.financing === -2000 && cfSplit.operating === -60);
const cfGiven = A.cashFlows([{ lines: [{ acct: 'Notes Payable', dr: 2000 }, { acct: 'Interest Expense', dr: 60 }, { acct: 'Cash', cr: 2060 }], cash: { financing: -2000, operating: -60 } }], CHART);
ok('cash flows honour an explicit split', cfGiven.financing === -2000 && cfGiven.operating === -60);

// ---------------------------------------------------------------- checking a student's entry
const m3 = MARCH[2];
const right = A.checkEntry(m3, { lines: [{ acct: 'Equipment', dr: 12000 }, { acct: 'Cash', cr: 4000 }, { acct: 'Accounts Payable', cr: 8000 }] }, CHART);
ok('checkEntry: correct', right.correct && right.issues.length === 0);
ok('checkEntry: reordered lines', A.checkEntry(m3, { lines: [{ acct: 'Accounts Payable', cr: 8000 }, { acct: 'Equipment', dr: 12000 }, { acct: 'Cash', cr: 4000 }] }, CHART).correct);
ok('checkEntry: split lines', A.checkEntry(m3, { lines: [{ acct: 'Equipment', dr: 7000 }, { acct: 'Equipment', dr: 5000 }, { acct: 'Cash', cr: 4000 }, { acct: 'Accounts Payable', cr: 3000 }, { acct: 'Accounts Payable', cr: 5000 }] }, CHART).correct);
ok('checkEntry: amounts as text with blanks and empty rows', A.checkEntry(m3, { lines: [{ acct: 'Equipment', dr: '12000', cr: '' }, { acct: 'Cash', cr: '4000.00' }, { acct: '', dr: '' }, { acct: 'Accounts Payable', cr: '8000' }] }, CHART).correct);
ok('checkEntry: to the cent', A.checkEntry({ lines: [{ acct: 'Interest Expense', dr: 37.5 }, { acct: 'Interest Payable', cr: 37.5 }] }, { lines: [{ acct: 'Interest Expense', dr: 37.50 }, { acct: 'Interest Payable', cr: '37.5' }] }, CHART).correct);
ok('checkEntry: a cent out is wrong', !A.checkEntry({ lines: [{ acct: 'Interest Expense', dr: 37.5 }, { acct: 'Interest Payable', cr: 37.5 }] }, { lines: [{ acct: 'Interest Expense', dr: 37.49 }, { acct: 'Interest Payable', cr: 37.49 }] }, CHART).correct);
const ws = A.checkEntry(MARCH[4], { lines: [{ acct: 'Accounts Payable', dr: 1500 }, { acct: 'Supplies', cr: 1500 }] }, CHART);
ok('checkEntry: wrong side (both lines)', kinds(ws) === 'wrong-side,wrong-side', kinds(ws));
const wsAP = ws.issues.find((i) => i.acct === 'Accounts Payable');
ok('checkEntry: wrong-side message teaches the rule', wsAP.message === 'Accounts Payable is a liability, so it increases with a credit. You debited it.', wsAP.message);
ok('checkEntry: wrong-side signed amounts', wsAP.expected === -1500 && wsAP.got === 1500);
const wsDec = A.checkEntry(MARCH[9], { lines: [{ acct: 'Cash', dr: 1000 }, { acct: 'Accounts Payable', cr: 1000 }] }, CHART);
ok('checkEntry: wrong side on a decrease', /Accounts Payable decreases here\. It is a liability, so a decrease is a debit\. You credited it\./.test(wsDec.issues.find((i) => i.acct === 'Accounts Payable').message));
const wsDiv = A.checkEntry(MARCH[13], { lines: [{ acct: 'Cash', dr: 300 }, { acct: 'Dividends', cr: 300 }] }, CHART);
ok('checkEntry: dividends message says normal debit balance', /normal debit balance/.test(wsDiv.issues.find((i) => i.acct === 'Dividends').message));
const wsContra = A.checkEntry(ADJ[2], { lines: [{ acct: 'Accumulated Depreciation—Equipment', dr: 200 }, { acct: 'Depreciation Expense', cr: 200 }] }, CHART);
ok('checkEntry: contra-asset message', /contra-asset account, with a normal credit balance, so it increases with a credit/.test(wsContra.issues.find((i) => i.acct === 'Accumulated Depreciation—Equipment').message));
ok('checkEntry: expense message does not call a debit bad', /is an expense, which reduces equity, so it increases with a debit/.test(wsContra.issues.find((i) => i.acct === 'Depreciation Expense').message));
const wa = A.checkEntry(m3, { lines: [{ acct: 'Equipment', dr: 4000 }, { acct: 'Cash', cr: 4000 }, { acct: 'Accounts Payable', cr: 8000 }] }, CHART);
ok('checkEntry: wrong amount (and so unbalanced)', kinds(wa) === 'unbalanced,wrong-amount', kinds(wa));
ok('checkEntry: wrong-amount detail', wa.issues.find((i) => i.kind === 'wrong-amount').expected === 12000 && wa.issues.find((i) => i.kind === 'wrong-amount').got === 4000);
const miss = A.checkEntry(m3, { lines: [{ acct: 'Equipment', dr: 12000 }, { acct: 'Cash', cr: 12000 }] }, CHART);
ok('checkEntry: missing account', kinds(miss) === 'missing-account,wrong-amount', kinds(miss));
ok('checkEntry: missing message names the kind of account, not the account', /leaves out a liability/.test(miss.issues.find((i) => i.kind === 'missing-account').message) && !/Accounts Payable/.test(miss.issues.find((i) => i.kind === 'missing-account').message));
const extra = A.checkEntry(MARCH[7], { lines: [{ acct: 'Accounts Receivable', dr: 4200 }, { acct: 'Catering Revenue', cr: 4200 }, { acct: 'Cash', dr: 100 }] }, CHART);
ok('checkEntry: extra account', kinds(extra) === 'extra-account,unbalanced', kinds(extra));
ok('checkEntry: extra cash explained', /No cash is received or paid/.test(extra.issues.find((i) => i.kind === 'extra-account').message));
const swap = A.checkEntry(MARCH[4], { lines: [{ acct: 'Supplies Expense', dr: 1500 }, { acct: 'Accounts Payable', cr: 1500 }] }, CHART);
ok('checkEntry: substitution of an expense for an asset', kinds(swap) === 'extra-account,missing-account' && /hasn’t been used up yet/.test(swap.issues[0].message));
const swapDiv = A.checkEntry(MARCH[13], { lines: [{ acct: 'Miscellaneous Expense', dr: 300 }, { acct: 'Cash', cr: 300 }] }, CHART);
ok('checkEntry: a dividend recorded as an expense', /distribution of profit/.test(swapDiv.issues.find((i) => i.kind === 'extra-account').message));
const swapUR = A.checkEntry(MARCH[5], { lines: [{ acct: 'Cash', dr: 2400 }, { acct: 'Catering Revenue', cr: 2400 }] }, CHART);
ok('checkEntry: a deposit recorded as revenue', /hasn’t been done yet/.test(swapUR.issues.find((i) => i.kind === 'extra-account').message));
const swapWP = A.checkEntry({ lines: [{ acct: 'Wages Payable', dr: 1400 }, { acct: 'Cash', cr: 1400 }] }, { lines: [{ acct: 'Wages Expense', dr: 1400 }, { acct: 'Cash', cr: 1400 }] }, CHART);
ok('checkEntry: paying accrued wages recorded as a new expense', /already recorded as an expense/.test(swapWP.issues.find((i) => i.kind === 'extra-account').message));
const unb = A.checkEntry(m3, { lines: [{ acct: 'Equipment', dr: 12000 }, { acct: 'Cash', cr: 4000 }, { acct: 'Accounts Payable', cr: 800 }] }, CHART);
ok('checkEntry: unbalanced', unb.issues.some((i) => i.kind === 'unbalanced') && /\$12,000/.test(unb.issues.find((i) => i.kind === 'unbalanced').message) && /\$4,800/.test(unb.issues.find((i) => i.kind === 'unbalanced').message));
ok('checkEntry: empty', kinds(A.checkEntry(m3, { lines: [] }, CHART)) === 'empty' && kinds(A.checkEntry(m3, { lines: [{ acct: '', dr: '' }] }, CHART)) === 'empty' && kinds(A.checkEntry(m3, null, CHART)) === 'empty');
ok('checkEntry: unknown account', A.checkEntry(m3, { lines: [{ acct: 'Espresso Machine', dr: 12000 }, { acct: 'Cash', cr: 4000 }, { acct: 'Accounts Payable', cr: 8000 }] }, CHART).issues.some((i) => i.kind === 'unknown-account' && i.acct === 'Espresso Machine'));
ok('checkEntry: account chosen but no amount', A.checkEntry(m3, { lines: [{ acct: 'Equipment', dr: 12000 }, { acct: 'Cash', cr: 4000 }, { acct: 'Accounts Payable' }] }, CHART).issues.some((i) => i.kind === 'wrong-amount' && i.acct === 'Accounts Payable'));
ok('checkEntry: amount but no account', A.checkEntry(m3, { lines: [{ acct: 'Equipment', dr: 12000 }, { acct: '', cr: 4000 }, { acct: 'Accounts Payable', cr: 8000 }] }, CHART).issues.some((i) => i.kind === 'unknown-account'));
ok('checkEntry: whole entry reversed gives one wrong-side issue per account', A.checkEntry(m3, { lines: [{ acct: 'Equipment', cr: 12000 }, { acct: 'Cash', dr: 4000 }, { acct: 'Accounts Payable', dr: 8000 }] }, CHART).issues.filter((i) => i.kind === 'wrong-side').length === 3);
for (const e of ALL) ok(`checkEntry: ${e.id} against itself`, A.checkEntry(e, e, CHART).correct);

// ---------------------------------------------------------------- generated transactions
const CHART_NAMES = new Set(CHART.map((a) => a.name));
let generated = 0, eqFails = 0, badAcct = 0, invalid = 0, negative = 0, badClass = 0, dateOrder = 0, noText = 0;
for (const startFrom of [{}, opening]) {
  for (let seed = 1; seed <= 32; seed++) {
    for (const level of [1, 2, 3, 4]) {
      const set = A.generateTransactions(seed * 7919, { level, count: 8, opening: startFrom });
      ok(`generator level ${level} seed ${seed}: count`, set.length === 8);
      set.forEach((t, i) => {
        generated++;
        if (!t.text || t.text.length < 20 || /undefined|NaN|\ba [aeio]|\ban [bcdfghjklmnpqrstvwxyz]/i.test(t.text)) noText++;
        if (!t.lines.every((l) => CHART_NAMES.has(l.acct))) badAcct++;
        if (!A.validateEntry(t, CHART).ok) invalid++;
        const q = A.equationEffect(t, CHART);
        if (Math.round(q.assets * 100) !== Math.round((q.liabilities + q.equity) * 100)) eqFails++;
        const s = A.statementsAffected(t, CHART);
        if (s.cash !== !!t.cash || (t.cash && t.cash !== s.cashClass)) badClass++;
        if (i && t.date < set[i - 1].date) dateOrder++;
      });
      // the set never drives a balance below zero (or a contra account above its asset)
      const Lg = A.post(set, CHART, startFrom);
      for (const acc of Object.values(Lg)) if (acc.lines.some((x) => x.balance < 0)) negative++;
    }
  }
}
ok('generated at least 1,000 entries', generated >= 1000, String(generated));
ok('generated entries keep A = L + E', eqFails === 0, `${eqFails} failures`);
ok('generated entries use only chart accounts', badAcct === 0, `${badAcct} failures`);
ok('generated entries validate', invalid === 0, `${invalid} failures`);
ok('generated entries never push a balance below zero', negative === 0, `${negative} accounts`);
ok('generated cash classes agree with the engine', badClass === 0, `${badClass} failures`);
ok('generated entries are in date order', dateOrder === 0);
ok('generated texts read properly', noText === 0, `${noText} failures`);
const a1 = A.generateTransactions(42, { level: 3, count: 10 }), a2 = A.generateTransactions(42, { level: 3, count: 10 });
ok('generator is deterministic', JSON.stringify(a1) === JSON.stringify(a2));
ok('different seeds give different sets', JSON.stringify(A.generateTransactions(43, { level: 3, count: 10 })) !== JSON.stringify(a1));
ok('different levels give different sets', JSON.stringify(A.generateTransactions(42, { level: 2, count: 10 })) !== JSON.stringify(a1));
const lvl1 = A.generateTransactions(5, { level: 1, count: 12 });
ok('level 1: two accounts, cash or stock', lvl1.every((t) => t.lines.length === 2 && t.lines.some((l) => l.acct === 'Cash')));
const lvl2 = Array.from({ length: 10 }, (_, s) => A.generateTransactions(s + 1, { level: 2, count: 8 })).flat();
ok('level 2: on-account items appear', lvl2.some((t) => t.lines.some((l) => l.acct === 'Accounts Receivable')) && lvl2.some((t) => t.lines.some((l) => l.acct === 'Accounts Payable')));
const lvl3 = Array.from({ length: 10 }, (_, s) => A.generateTransactions(s + 1, { level: 3, count: 8, opening })).flat();
ok('level 3: unearned, prepaid, dividends and notes appear', ['Unearned Revenue', 'Dividends', 'Notes Payable'].every((n) => lvl3.some((t) => t.lines.some((l) => l.acct === n))) && lvl3.some((t) => t.lines.some((l) => /^Prepaid/.test(l.acct))));
const lvl4 = Array.from({ length: 10 }, (_, s) => A.generateTransactions(s + 1, { level: 4, count: 8, opening })).flat();
ok('level 4: compound entries appear', lvl4.some((t) => t.lines.length >= 3));
ok('level 4: adjusting entries (depreciation, accrued interest, supplies used) appear', ['Depreciation Expense', 'Interest Payable', 'Supplies Expense'].every((n) => lvl4.some((t) => t.adjusting && t.lines.some((l) => l.acct === n))));
ok('level 4: adjustments come last, on the last day', lvl4.filter((t) => t.adjusting).every((t) => t.date === '2026-04-30'));
const fromMarch = A.generateTransactions(3, { level: 4, count: 12, opening });
const deps = Array.from({ length: 40 }, (_, s) => A.generateTransactions(s + 1, { level: 4, count: 8, opening })).flat().filter((t) => t.lines.some((l) => l.acct === 'Accumulated Depreciation—Equipment'));
ok('continuing from March: equipment depreciation is cost ÷ 60 months (12,000 → 200)', deps.length > 0 && deps.every((t) => { const m = /which cost \$([\d,]+), straight-line over 5 years/.exec(t.text); return m && t.lines[0].dr === Number(m[1].replace(/,/g, '')) / 60 && Number.isInteger(t.lines[0].dr); }));
const vans = Array.from({ length: 40 }, (_, s) => A.generateTransactions(s + 1, { level: 4, count: 8 })).flat().filter((t) => t.lines.some((l) => l.acct === 'Accumulated Depreciation—Van'));
ok('van depreciation is (cost − residual) ÷ 48 in whole dollars', vans.length > 0 && vans.every((t) => { const m = /cost \$([\d,]+), is depreciated straight-line over 4 years to a residual value of \$([\d,]+)/.exec(t.text); const n = (x) => Number(x.replace(/,/g, '')); return m && t.lines[0].dr === (n(m[1]) - n(m[2])) / 48 && Number.isInteger(t.lines[0].dr); }));
ok('continuing from March: interest on the $10,000 note is $50', lvl4.filter((t) => /\$10,000 note payable/.test(t.text)).every((t) => t.lines[0].dr === 50));
ok('a set of 12 continuing from March validates', fromMarch.every((t) => A.validateEntry(t, CHART).ok));

// ---------------------------------------------------------------- the standing facts agree with case.js
eq('facts: interest a6', 10000 * A.LANTERN_FACTS.noteRate / 12, ADJ[5].lines[0].dr);
eq('facts: insurance a1', A.LANTERN_FACTS.insuranceAnnual / 12, ADJ[0].lines[0].dr);
eq('facts: depreciation a3', 12000 / (A.LANTERN_FACTS.equipmentLifeYears * 12), ADJ[2].lines[0].dr);
eq('facts: unearned a4', A.LANTERN_FACTS.unearned.per, ADJ[3].lines[0].dr);
eq('facts: rent m13', A.LANTERN_FACTS.rent, MARCH[12].lines[0].dr);

// ---------------------------------------------------------------- small helpers
ok('usd', A.usd(12000) === '$12,000' && A.usd(37.5) === '$37.50' && A.usd(-4000) === '−$4,000' && A.usd(0) === '$0');
ok('entryLabel', A.entryLabel({ id: 'm12' }) === '12' && A.entryLabel({ id: 'a3' }) === 'A3' && A.entryLabel({ id: 'c2' }) === 'C2' && A.entryLabel({ id: 'x', label: 'Q' }) === 'Q');
ok('entryEffects nets lines, debits first', JSON.stringify(A.entryEffects({ lines: [{ acct: 'Cash', cr: 10 }, { acct: 'Supplies', dr: 4 }, { acct: 'Supplies', dr: 6 }] }, CHART).map((e) => [e.acct, e.side, e.amount])) === JSON.stringify([['Supplies', 'dr', 10], ['Cash', 'cr', 10]]));

// ---------------------------------------------------------------- F02: contra-revenue, multi-step income, the indirect method
// A small merchandiser worked by hand: opening balances, a year of entries, then the statements.
const MC = A.makeChart([
  { name: 'Cash', type: 'asset', group: 'current' },
  { name: 'Accounts Receivable', type: 'asset', group: 'current' },
  { name: 'Allowance for Doubtful Accounts', type: 'contra-asset', group: 'current', contra: 'Accounts Receivable' },
  { name: 'Inventory', type: 'asset', group: 'current' },
  { name: 'Equipment', type: 'asset', group: 'noncurrent' },
  { name: 'Accumulated Depreciation—Equipment', type: 'contra-asset', group: 'noncurrent', contra: 'Equipment' },
  { name: 'Accounts Payable', type: 'liability', group: 'current' },
  { name: 'Current Portion of Long-Term Debt', type: 'liability', group: 'current', cashClass: 'financing' },
  { name: 'Notes Payable', type: 'liability', group: 'noncurrent' },
  { name: 'Common Stock', type: 'equity' },
  { name: 'Retained Earnings', type: 'equity' },
  { name: 'Dividends', type: 'dividends' },
  { name: 'Income Summary', type: 'summary' },
  { name: 'Sales Revenue', type: 'revenue' },
  { name: 'Sales Returns and Allowances', type: 'contra-revenue' },
  { name: 'Interest Revenue', type: 'revenue', section: 'other' },
  { name: 'Gain on Sale of Equipment', type: 'revenue', section: 'other', gain: true },   // shown as other income here, to test that path
  { name: 'Cost of Goods Sold', type: 'expense', section: 'cost' },
  { name: 'Wages Expense', type: 'expense' },
  { name: 'Bad Debt Expense', type: 'expense' },
  { name: 'Depreciation Expense', type: 'expense', da: true, noncash: true },
  { name: 'Interest Expense', type: 'expense', section: 'other', interest: true },
  { name: 'Income Tax Expense', type: 'expense', section: 'tax' },
]);
ok('contra-revenue: normal debit, reduces equity', A.normalSide('Sales Returns and Allowances', MC) === 'dr' && A.lineEffect({ acct: 'Sales Returns and Allowances', dr: 100 }, MC).change === -100);
const OPEN = { Cash: 5000, 'Accounts Receivable': 4000, 'Allowance for Doubtful Accounts': 200, Inventory: 6000, Equipment: 20000, 'Accumulated Depreciation—Equipment': 4000, 'Accounts Payable': 3000, 'Notes Payable': 10000, 'Common Stock': 15000, 'Retained Earnings': 2800 };
const MY = [
  { id: 'x1', lines: [{ acct: 'Accounts Receivable', dr: 50000 }, { acct: 'Sales Revenue', cr: 50000 }] },
  { id: 'x2', lines: [{ acct: 'Sales Returns and Allowances', dr: 1000 }, { acct: 'Accounts Receivable', cr: 1000 }] },
  { id: 'x3', lines: [{ acct: 'Cash', dr: 46000 }, { acct: 'Accounts Receivable', cr: 46000 }], cash: 'operating' },
  { id: 'x4', lines: [{ acct: 'Allowance for Doubtful Accounts', dr: 300 }, { acct: 'Accounts Receivable', cr: 300 }] },
  { id: 'x5', lines: [{ acct: 'Inventory', dr: 30000 }, { acct: 'Accounts Payable', cr: 30000 }] },
  { id: 'x6', lines: [{ acct: 'Cost of Goods Sold', dr: 28000 }, { acct: 'Inventory', cr: 28000 }] },
  { id: 'x7', lines: [{ acct: 'Accounts Payable', dr: 29000 }, { acct: 'Cash', cr: 29000 }], cash: 'operating' },
  { id: 'x8', lines: [{ acct: 'Wages Expense', dr: 9000 }, { acct: 'Cash', cr: 9000 }], cash: 'operating', cashLabel: 'Cash paid to employees' },
  { id: 'x9', lines: [{ acct: 'Bad Debt Expense', dr: 450 }, { acct: 'Allowance for Doubtful Accounts', cr: 450 }] },
  { id: 'x10', lines: [{ acct: 'Depreciation Expense', dr: 2000 }, { acct: 'Accumulated Depreciation—Equipment', cr: 2000 }] },
  // sell equipment costing 5,000 with 3,000 depreciated for 2,600 cash: gain 600
  { id: 'x11', lines: [{ acct: 'Cash', dr: 2600 }, { acct: 'Accumulated Depreciation—Equipment', dr: 3000 }, { acct: 'Equipment', cr: 5000 }, { acct: 'Gain on Sale of Equipment', cr: 600 }], cash: 'investing' },
  { id: 'x12', lines: [{ acct: 'Interest Expense', dr: 600 }, { acct: 'Cash', cr: 600 }], cash: 'operating' },
  { id: 'x13', lines: [{ acct: 'Cash', dr: 100 }, { acct: 'Interest Revenue', cr: 100 }], cash: 'operating' },
  { id: 'x14', lines: [{ acct: 'Notes Payable', dr: 2000 }, { acct: 'Current Portion of Long-Term Debt', cr: 2000 }] },
  { id: 'x15', lines: [{ acct: 'Income Tax Expense', dr: 2200 }, { acct: 'Cash', cr: 2200 }], cash: 'operating' },
  { id: 'x16', lines: [{ acct: 'Dividends', dr: 1500 }, { acct: 'Cash', cr: 1500 }], cash: 'financing' },
];
const ML = A.post(MY, MC, OPEN);
const MS = A.multiStepIncome(ML, MC);
// by hand: net sales 49,000; gross profit 21,000; operating expenses 11,450; operating income 9,550;
// other: +100 interest revenue +600 gain −600 interest expense → before tax 9,650; tax 2,200 → net income 7,450
eq('multi-step: net revenue', MS.revenue, 49000);
eq('multi-step: contra revenue', MS.contraRevenue, 1000);
eq('multi-step: gross profit', MS.grossProfit, 21000);
eq('multi-step: operating income', MS.operatingIncome, 9550);
eq('multi-step: income before tax', MS.incomeBeforeTax, 9650);
eq('multi-step: net income', MS.netIncome, 7450);
eq('multi-step agrees with the single-step statement', A.incomeStatement(ML, MC).netIncome, 7450);
eq('EBIT = before tax + interest expense − interest revenue', MS.ebit, 9650 + 600 - 100);
eq('EBITDA = EBIT + depreciation', MS.ebitda, 10150 + 2000);
const MI = A.indirectOperating(ML, MC, OPEN);
// by hand: 7,450 + 2,000 depreciation − 600 gain; net receivables 4,000 − 200 = 3,800 → 6,700 − 350 = 6,350 (−2,550);
// inventory 6,000 → 8,000 (−2,000); payables 3,000 → 4,000 (+1,000); the current portion of debt is financing → 5,300
// (direct: 46,000 − 29,000 − 9,000 − 600 + 100 − 2,200 = 5,300)
eq('indirect: operating cash flow', MI.operating, 5300);
ok('indirect: the gain is subtracted and depreciation added back', MI.adjustments.some(([n, v]) => /depreciation/i.test(n) && v === 2000) && MI.adjustments.some(([n, v]) => /gain/i.test(n) && v === -600));
ok('indirect: receivables are taken net of the allowance', MI.workingCapital.some(([n, v]) => /receivable \(net\)/.test(n) && v === -2550));
ok('indirect: the current portion of long-term debt is not working capital', !MI.workingCapital.some(([n]) => /current portion/i.test(n)));
const MCF = A.cashFlows(MY, MC);
eq('indirect = direct (operating)', MCF.operating, MI.operating);
ok('cashLabel names a direct-method line', MCF.lines.some(([n, v]) => n === 'Cash paid to employees' && v === -9000));
const MCL = A.closingEntries(ML, MC);
const MAfter = A.post([...MY, ...MCL], MC, OPEN);
eq('closing with a contra-revenue account: retained earnings', MAfter['Retained Earnings'].balance, 2800 + 7450 - 1500);
ok('closing clears the contra-revenue account', !MAfter['Sales Returns and Allowances'].balance);
eq('statement of changes in equity with contra revenue', A.equityStatement(ML, MC, OPEN).retainedEarnings.end, 2800 + 7450 - 1500);
ok('balance sheet balances with contra revenue', A.balanceSheet(ML, MC).balanced);
// ASC 360-10-45-5: with no section: 'other', the gain is operating and lands inside operating income
const MC2 = A.makeChart(MC.list.map((x) => (x.name === 'Gain on Sale of Equipment' ? { name: x.name, type: 'revenue', gain: true } : { ...x })));
const MS2 = A.multiStepIncome(A.post(MY, MC2, OPEN), MC2);
eq('operating gain: operating income includes the gain', MS2.operatingIncome, 9550 + 600);
eq('operating gain: net income unchanged', MS2.netIncome, 7450);
eq('operating gain: not in revenue', MS2.revenue, 49000);

console.log(`${checks - fails} of ${checks} checks passed`);
if (fails) { console.log(`${fails} failed`); process.exit(1); }
