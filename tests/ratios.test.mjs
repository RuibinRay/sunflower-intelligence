// Run: node tests/ratios.test.mjs   (compares assets/js/core/ratios.js with ratios computed independently in Python)
import { readFileSync } from 'node:fs';
import * as R from '../assets/js/core/ratios.js';

const fx = JSON.parse(readFileSync(new URL('./fixtures-ratios.json', import.meta.url)));
let fails = 0, checks = 0;
const close = (label, got, want, tol = 1e-9) => {
  checks++;
  const ok = typeof got === 'number' && Math.abs(got - want) <= tol * Math.max(1, Math.abs(want));
  if (!ok) { fails++; console.log(`FAIL ${label}: got ${got}, want ${want}`); }
};
const truth = (label, cond) => { checks++; if (!cond) { fails++; console.log(`FAIL ${label}`); } };

fx.cases.forEach(({ cur, prev, exp }, n) => {
  const L = R.liquidity(cur), S = R.solvency(cur), SL = R.solvency(cur, { withLeases: true });
  const E = R.efficiency(cur, prev), P = R.profitability(cur, prev), D = R.dupont(cur, prev), Q = R.cashQuality(cur, prev);
  close(`${n} current`, L.current, exp.current); close(`${n} quick`, L.quick, exp.quick); close(`${n} cash ratio`, L.cash, exp.cashRatio);
  close(`${n} OCF ratio`, L.operatingCashFlow, exp.ocf);
  close(`${n} debt ratio`, S.debtRatio, exp.debtRatio); close(`${n} D/E`, S.debtToEquity, exp.de); close(`${n} D/E with leases`, SL.debtToEquity, exp.deL);
  close(`${n} debt to capital`, S.debtToCapital, exp.dcap); close(`${n} equity multiplier (closing)`, S.equityMultiplier, exp.em);
  close(`${n} interest coverage`, S.interestCoverage, exp.cover); close(`${n} EBITDA coverage`, S.ebitdaCoverage, exp.ebitdaCover);
  close(`${n} net debt / EBITDA`, S.netDebtToEbitda, exp.netDebtEbitda);
  close(`${n} asset turnover`, E.assetTurnover, exp.assetTurnover); close(`${n} DSO`, E.dso, exp.dso); close(`${n} DIO`, E.dio, exp.dio);
  close(`${n} DPO`, E.dpo, exp.dpo); close(`${n} CCC`, E.cashConversionCycle, exp.ccc);
  close(`${n} gross margin`, P.grossMargin, exp.grossMargin); close(`${n} net margin`, P.netMargin, exp.netMargin);
  close(`${n} ROA`, P.roa, exp.roa); close(`${n} ROE`, P.roe, exp.roe);
  close(`${n} DuPont multiplier (average)`, D.equityMultiplier, exp.emAvg); close(`${n} tax burden`, D.taxBurden, exp.taxBurden);
  close(`${n} interest burden`, D.interestBurden, exp.interestBurden);
  close(`${n} DuPont 3-step = ROE`, D.roe, exp.roe); close(`${n} DuPont 5-step = ROE`, D.roe5, exp.roe);
  close(`${n} DuPont ROA = ROA`, D.roa, exp.roa);
  close(`${n} CFO / NI`, Q.cfoToNetIncome, exp.cfoToNi); close(`${n} accruals ratio`, Q.accrualsRatio, exp.accrualsRatio); close(`${n} FCF`, Q.freeCashFlow, exp.fcf);
  close(`${n} Z''`, R.altman(cur, 'zdouble').score, exp.zdouble); close(`${n} Z`, R.altman(cur, 'z').score, exp.z); close(`${n} Z'`, R.altman(cur, 'zprime').score, exp.zprime);
  close(`${n} annualised growth`, R.growth(cur.revenue, prev.revenue, { annualised: true, curMonths: cur.months, prevMonths: prev.months }), exp.growthAnnualised);
  truth(`${n} bases are averages`, E.basis.receivables === 'average' && P.basis.equity === 'average');
});

// closing balances when there is no prior period; nulls when an input is missing or a divisor is zero
const p = fx.cases[0].cur;
truth('no prev: ROE on closing equity', Math.abs(R.profitability(p).roe - p.netIncome / p.equity) < 1e-12 && R.profitability(p).basis.equity === 'closing');
truth('missing inventory gives null DIO and CCC', R.efficiency({ ...p, inventory: undefined }).dio === null && R.efficiency({ ...p, inventory: undefined }).cashConversionCycle === null);
truth('zero interest gives null coverage', R.solvency({ ...p, interestExpense: 0 }).interestCoverage === null);
truth('a ten-month period has 304.17 days', Math.abs(R.days({ months: 10 }) - 3650 / 12) < 1e-12);
truth('growth from a negative base is measured against its size', Math.abs(R.growth(5, -10) - 1.5) < 1e-12);
truth('CAGR doubles in 7.27 years at 10%', Math.abs(R.cagr(2, 1, Math.log(2) / Math.log(1.1)) - 0.1) < 1e-12);
truth('common-size shares', JSON.stringify(R.commonSize([['a', 25], ['b', 75]], 100).map((r) => r[2])) === '[0.25,0.75]');
truth('horizontal change and %', JSON.stringify(R.horizontal([['x', 80, 100]])[0].slice(3)) === '[20,0.25]');
truth('Z″ zones', R.altman({ currentAssets: 1, currentLiabilities: 1, totalAssets: 10, retainedEarnings: 0, ebit: 0, equity: 1, totalLiabilities: 1 }).zone === 'distress');
truth('unknown Altman variant throws', (() => { try { R.altman(p, 'zzz'); return false; } catch { return true; } })());

// leases as debt: EBIT gains the lease interest, EBITDA the whole lease cost, interest the lease interest
{
  const q = { ebit: 100, da: 50, interestExpense: 10, debt: 200, cash: 20, equity: 100, totalAssets: 500, totalLiabilities: 400, leaseLiabilities: 300, leaseInterest: 15, leaseCost: 60 };
  const a = R.solvency(q, { withLeases: true }), b = R.solvency(q);
  truth('lease-adjusted coverage', Math.abs(a.interestCoverage - 115 / 25) < 1e-12 && Math.abs(b.interestCoverage - 10) < 1e-12);
  truth('lease-adjusted net debt / EBITDA', Math.abs(a.netDebtToEbitda - 480 / 210) < 1e-12 && Math.abs(b.netDebtToEbitda - 180 / 150) < 1e-12);
  truth('net debt subtracts short-term investments too', R.solvency({ ...q, shortTermInvestments: 30 }).netDebt === 150);
  truth('leases as debt without lease cost leaves earnings as reported', Math.abs(R.solvency({ ...q, leaseCost: undefined, leaseInterest: undefined }, { withLeases: true }).netDebtToEbitda - 480 / 150) < 1e-12);
  truth('inventory days on the cost of goods sold when given', Math.abs(R.efficiency({ cogs: 300, cogsGoods: 100, inventory: 10 }).dio - 36.5) < 1e-12);
}

console.log(`${checks - fails}/${checks} ratio checks passed`);
if (fails) process.exit(1);
