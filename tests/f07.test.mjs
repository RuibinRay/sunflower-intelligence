// f07.test.mjs — F07 Financial Modelling's case: the history agrees with F02/F03, the identities with earlier courses
// hold, the forecast is internally consistent, and the lessons' worksheets reproduce case.js's model exactly.
// Run: node tests/f07.test.mjs
import { Sheet } from '../assets/js/core/sheet.js';
import * as C from '../assets/js/data/study/f07/case.js';
import { forecastCells } from '../assets/js/data/study/f07/revenue-and-cost-forecasts.ex.js';
import { modelCells } from '../assets/js/data/study/f07/modelling-principles.ex.js';
import { historyCells } from '../assets/js/data/study/f07/setting-up-the-history.ex.js';
import { wcCells } from '../assets/js/data/study/f07/working-capital-and-capex.ex.js';
import { covenant2028 } from '../assets/js/data/study/f07/linking-the-statements.ex.js';

let pass = 0, fail = 0;
const ok = (cond, what) => { if (cond) pass++; else { fail++; console.error(`✗ ${what}`); } };
const near = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;

for (const [what, holds] of C.IDENTITIES) ok(holds, `identity: ${what}`);

// the history: totals rebuild from the condensed lines
for (const y of C.HIST) {
  const h = C.HISTORY[y];
  ok(near(h.revenue, h.catering + h.training + h.online + h.cafes), `${y}: revenue is the sum of its lines`);
  ok(near(h.ebitda, h.revenue - h.costOfGoods - h.costOfServices - h.wages - h.occupancy - h.advertising - h.research - h.other), `${y}: EBITDA rebuilds`);
  ok(near(h.tax / h.ebt, C.TAX, 0.0005), `${y}: tax is 25% of pre-tax profit`);
}

// calendarising: shares sum to the project totals over a long enough window, and the first year is 9/12
const cal = C.calendarise([120, 240, 360], 4, 4);
ok(near(cal[0], 90) && near(cal[1], 30 + 180) && near(cal[2], 60 + 270) && near(cal[3], 90), 'calendarise splits April–March years 9/12 and 3/12');
ok(near(cal.reduce((a, b) => a + b, 0), 720), 'calendarise keeps the project total');

// the forecast: internal consistency
const F = C.FORECAST;
F.years.forEach((y, t) => {
  ok(near(F.revenue[t], F.cafes[t] + F.online[t] + F.catering[t] + F.training[t] + F.kitchen[t] + F.coldBrew[t]), `${y}: revenue adds up`);
  ok(near(F.ebitda[t], F.grossProfit[t] - F.opex[t]), `${y}: EBITDA = gross profit − operating costs`);
  ok(F.ebitdaMargin[t] > 0 && F.ebitdaMargin[t] < 0.2, `${y}: EBITDA margin is plausible (${(F.ebitdaMargin[t] * 100).toFixed(1)}%)`);
});
ok(near(F.kitchen[0], 112_500) && near(F.kitchen[1], 176_250), 'kitchen calendarised: 112,500 and 176,250');

// the worksheets reproduce the case
const s = new Sheet({ cells: forecastCells() });
['D', 'E', 'F', 'G', 'H'].forEach((k, t) => {
  for (const [r, key] of [[28, 'cafes'], [29, 'online'], [30, 'catering'], [31, 'training'], [34, 'revenue'], [35, 'costOfGoods'], [36, 'costOfServices'], [37, 'grossProfit'], [38, 'wages'], [42, 'advertising'], [43, 'other'], [44, 'ebitda'], [45, 'ebitdaMargin']]) {
    ok(near(s.get(`${k}${r}`), F[key][t], 1e-6), `forecast sheet ${k}${r} = case ${key} ${F.years[t]}`);
  }
});
const m = new Sheet({ cells: modelCells() });
ok(near(m.get('D9'), 210_000) && near(m.get('F9'), 249_480) && near(m.get('D8'), F.cafes[0]), 'model extract sheet: online and café forecasts');
const hs = new Sheet({ cells: historyCells() });
ok(near(hs.get('B17'), C.HISTORY[2026].ebitda) && near(hs.get('C17'), C.HISTORY[2027].ebitda), 'history sheet: EBITDA both years');
ok(near(hs.get('C22'), C.DERIVED.normalisedEbitda2027), 'history sheet: normalised EBITDA');

// ---------------------------------------------------------------- module 2: the linked model
const O = C.OPENING, MM = C.MODEL;
const ca27 = O.cash + O.receivables + O.contractAsset + O.inventory + O.prepaid;
ok(near(ca27 + O.ppeCost - O.accDep + O.rou, O.payables + O.loc + O.wagesPayable + O.interestPayable + O.unearned + O.taxPayable + O.currentDebt + O.leaseLiability + O.longDebt + O.commonStock + O.retained), 'opening balance sheet (F03, condensed) balances');
ok(near(C.ASSETS.reduce((s, a) => s + C.depIn(a, 2027), 0), 19_800), 'fixed asset schedule rebuilds 2027 depreciation ($19,800)');
ok(near(C.TERM_LOAN.pay, 1202.2769, 1e-3), 'term loan payment $1,202.28');
ok(near(C.TERM_LOAN.rows.reduce((s, r) => s + r.principal, 0), 60_000, 1e-6), 'term loan repays its $60,000');
let prevRE = O.retained, prevCash = O.cash;
MM.rows.forEach((r, t) => {
  ok(Math.abs(r.check) < 1e-6, `${r.year}: the balance sheet balances (check ${r.check.toFixed(6)})`);
  ok(near(r.cash, prevCash + r.cfo + r.cfi + r.cff), `${r.year}: closing cash = opening + cash flows`);
  ok(near(r.retained, prevRE + r.netIncome - r.dividends), `${r.year}: retained earnings roll forward`);
  ok(r.loc >= 0 && r.loc <= C.FINANCE.locLimit + 1e-9, `${r.year}: line of credit within 0 and its limit`);
  ok(r.loc === 0 || near(r.cash, C.FINANCE.minCash), `${r.year}: the line is drawn only to keep cash at the minimum`);
  ok(near(r.rou, r.leaseLiability), `${r.year}: right-of-use asset = lease liability`);
  ok(near(r.tax, Math.max(0, r.tax)) && r.tax >= 0, `${r.year}: tax is never negative`);
  prevRE = r.retained; prevCash = r.cash;
});
ok(MM.rows[0].currentRatio < 1.2 && MM.rows[1].currentRatio > 1.2, 'the covenant fails at the end of 2028 and passes from 2029 (the lesson’s finding)');
ok(near(covenant2028().ratio, MM.rows[0].currentRatio), 'covenant widget reproduces the model at its defaults');
ok(covenant2028({ extra: 14_000 }).ratio > 1.2 && covenant2028({ minCash: 30_000 }).ratio < 1.2, 'covenant widget: long-term money fixes it, cash on the line does not');
const w = new Sheet({ cells: wcCells() });
['D', 'E', 'F', 'G', 'H'].forEach((k, t) => {
  for (const [r, key] of [[21, 'receivables'], [23, 'inventory'], [25, 'payables'], [26, 'wagesPayable'], [27, 'unearned'], [28, 'taxPayable']]) ok(near(w.get(`${k}${r}`), MM.rows[t][key], 1e-6), `working capital sheet ${k}${r} = model ${key}`);
});

console.log(fail ? `${fail} failed, ${pass} passed` : `${pass}/${pass} F07 checks passed`);
process.exit(fail ? 1 : 0);
