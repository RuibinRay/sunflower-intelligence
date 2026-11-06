// Run: node tests/corpfin.test.mjs   (assets/js/core/corpfin.js against pandas/numpy-financial fixtures, hand-worked
// cases and the identities each formula must satisfy)
import { readFileSync } from 'node:fs';
import * as C from '../assets/js/core/corpfin.js';
import { npv, irr } from '../assets/js/core/invest.js';

const fx = JSON.parse(readFileSync(new URL('./fixtures-corpfin.json', import.meta.url)));
let fails = 0, checks = 0;
const close = (label, got, want, tol = 1e-9) => { checks++; if (!(typeof got === 'number' && Math.abs(got - want) <= tol * Math.max(1, Math.abs(want)))) { fails++; console.log(`FAIL ${label}: got ${got}, want ${want}`); } };
const ok = (label, cond) => { checks++; if (!cond) { fails++; console.log(`FAIL ${label}`); } };

// ---- MACRS (IRS Pub 946 Table A-1) and depreciation
for (const k of [3, 5, 7]) close(`MACRS ${k} sums to 100`, C.MACRS[k].reduce((a, b) => a + b, 0), 100, 1e-12);
close('MACRS 5-year year 2', C.depreciation(10000, { method: 5 })[1], 3200);
ok('MACRS 7-year has 8 years', C.depreciation(1, { method: 7 }).length === 8);
close('straight line', C.depreciation(24000, { life: 5, salvage: 4000 })[0], 4000);

// ---- project cash flows against pandas, NPV and IRR against numpy-financial
fx.projects.forEach((p, j) => {
  const r = C.projectCashFlows(p.inputs);
  p.fcf.forEach((v, t) => close(`project ${j} fcf[${t}]`, r.fcf[t], v, 1e-9));
  p.ocf.forEach((v, t) => close(`project ${j} ocf[${t}]`, r.rows[t].ocf, v, 1e-9));
  p.dNwc.forEach((v, t) => close(`project ${j} dNwc[${t}]`, r.rows[t].dNwc, v, 1e-9));
  close(`project ${j} npv`, npv(p.rate, r.fcf), p.npv, 1e-9);
  close(`project ${j} irr`, irr(r.fcf), p.irr, 1e-7);
  close(`project ${j} working capital all recovered`, r.rows.reduce((s, x) => s + x.dNwc, 0), 0, 1e-9);
});
{ // hand case: $10,000 machine, 2 years, straight line, revenue 9,000 a year, variable 40%, fixed 1,000, tax 25%, salvage 2,000 vs book 0
  const r = C.projectCashFlows({ capex: 10000, years: 2, revenue: [9000, 9000], variableShare: 0.4, fixed: 1000, dep: C.depreciation(10000, { life: 2 }), tax: 0.25, salvage: 2000 });
  // EBIT = 9,000 − 3,600 − 1,000 − 5,000 = −600; tax −150; OCF = −450 + 5,000 = 4,550; salvage after tax 1,500
  close('hand ebit', r.rows[1].ebit, -600); close('hand ocf', r.rows[1].ocf, 4550); close('hand year-2 fcf', r.fcf[2], 6050); close('hand year-0 fcf', r.fcf[0], -10000);
  const shield = C.taxShield([5000, 5000], 0.25); close('tax shield', shield[0], 1250);
}
{ // an opportunity cost is charged at year 0; a sunk cost is not
  const base = { capex: 5000, years: 1, revenue: [8000], variableShare: 0, fixed: 0, dep: [5000], tax: 0 };
  close('opportunity cost', C.projectCashFlows({ ...base, opportunity: 1200 }).fcf[0], -6200);
  close('sunk cost ignored', C.projectCashFlows({ ...base, sunk: 900 }).fcf[0], -5000);
}

// ---- annuities, EAC and comparing unequal lives
fx.annuity.forEach((a, j) => close(`eaa ${j}`, C.eaa(a.pv, a.rate, a.n), a.pmt, 1e-10));
{
  const e = C.eac({ price: 12000, costs: [800, 800, 800, 800], salvage: 2000, rate: 0.1 });
  const pv = 12000 + 800 * (1 - 1.1 ** -4) / 0.1 - 2000 / 1.1 ** 4;
  close('eac pv', e.pv, pv); close('eac', e.eac, pv * 0.1 / (1 - 1.1 ** -4));
  // an EAA's PV over n years equals the original PV
  close('eaa round trip', C.eaa(5000, 0.07, 6) * (1 - 1.07 ** -6) / 0.07, 5000);
}

// ---- sensitivity and break-even
{
  const model = ({ q, price }) => npv(0.1, [-1000, q * price - 300, q * price - 300]);
  const s = C.sensitivity(model, { q: 100, price: 6 }, { q: [80, 120], price: [5, 7] });
  ok('tornado sorted', s[0].swing >= s[1].swing);
  const be = C.breakEven(model, { q: 100, price: 6 }, 'q', 0, 1000);
  close('break-even npv zero', model({ q: be, price: 6 }), 0, 1e-7);
  // financial break-even volume gives NPV 0 in the full cash-flow model
  const P = { price: 5, unitCost: 2, fixed: 20000, dep: 8000, capex: 40000, n: 5, r: 0.09, tax: 0.25 };
  const v = C.breakEvenVolumes(P);
  close('accounting break-even', v.accounting, 28000 / 3); close('cash break-even', v.cash, 20000 / 3);
  const flows = C.projectCashFlows({ capex: 40000, years: 5, revenue: Array(5).fill(v.financial * 5), variable: Array(5).fill(v.financial * 2), fixed: 20000, dep: Array(5).fill(8000), tax: 0.25 }).fcf;
  close('financial break-even NPV 0', npv(0.09, flows), 0, 1e-8);
  ok('break-evens ordered (cash < accounting < financial here)', v.cash < v.accounting && v.accounting < v.financial);
}

// ---- cost of capital
close('capm', C.capm({ rf: 0.04, beta: 1.2, mrp: 0.055 }), 0.106);
close('unlever then relever', C.releverBeta(C.unleverBeta(1.3, 0.5, 0.25), 0.5, 0.25), 1.3);
close('unlever', C.unleverBeta(1.3, 0.5, 0.25), 1.3 / 1.375);
{
  const w = C.wacc({ E: 60, D: 40, rE: 0.12, rD: 0.07, tax: 0.25 });
  close('wacc', w.wacc, 0.6 * 0.12 + 0.4 * 0.07 * 0.75); close('weights', w.wE + w.wD, 1);
}
fx.ytm.forEach((y, j) => close(`ytm ${j}`, C.ytm({ price: y.price, coupon: y.coupon, years: y.years, freq: y.freq }), y.ytm, 1e-9));
close('dividend growth cost', C.dividendGrowthCost({ d1: 2, p0: 40, g: 0.03 }), 0.08);

// ---- Modigliani–Miller
{
  const a = C.mm({ Vu: 1000, D: 400, rU: 0.1, rD: 0.06, tax: 0 });
  close('MM no tax: V_L = V_U', a.VL, 1000); close('MM no tax: WACC = r_U', a.wacc, 0.1);
  close('MM no tax: r_E', a.rE, 0.1 + 0.04 * 400 / 600);
  const b = C.mm({ Vu: 1000, D: 400, rU: 0.1, rD: 0.06, tax: 0.25 });
  close('MM tax: V_L = V_U + TD', b.VL, 1100);
  close('MM tax: WACC = r_U (1 − T D/V)', b.wacc, 0.1 * (1 - 0.25 * 400 / 1100));
  close('MM tax: E r_E = r_U V_U-part consistency', b.E * b.rE + 400 * 0.06 * 0.75, b.VL * b.wacc);
}

// ---- payout
{
  const p = C.payout({ shares: 1000, price: 50, amount: 10000, earnings: 6000 });
  close('dividend per share', p.dividend.perShare, 10); close('price after dividend', p.dividend.priceAfter, 40);
  close('shares bought', p.buyback.sharesBought, 200); close('price after buyback', p.buyback.priceAfter, 50);
  close('same wealth', p.dividend.wealth, p.buyback.wealth); close('buyback eps up', p.buyback.eps, 7.5);
}

// ---- planning
{
  const a = C.afn({ sales0: 1000, growth: 0.2, assets: 800, spontaneous: 100, margin: 0.05, payout: 0.4 });
  close('afn', a.afn, 0.8 * 200 - 0.1 * 200 - 0.05 * 1200 * 0.6);
  close('sgr', C.sustainableGrowth(0.15, 0.6), 0.09 / 0.91); close('igr', C.internalGrowth(0.06, 0.5), 0.03 / 0.97);
  // at the internal growth rate, AFN = 0 when nothing is spontaneous (ROA on end-of-year assets)
  const g = C.internalGrowth(0.05 * 1000 / 800, 0.6);          // ROA = margin × S/A with A/S constant
  close('AFN zero at IGR', C.afn({ sales0: 1000, growth: g, assets: 800, spontaneous: 0, margin: 0.05, payout: 0.4 }).afn, 0, 1e-9);
  const cb = C.cashBudget({ opening: 5000, receipts: [10000, 6000, 20000], payments: [12000, 14000, 8000], minimum: 2000, rate: 0.01 });
  close('cash budget month 1 borrow', cb.rows[0].borrow, 0); close('month 2 borrow', cb.rows[1].borrow, 7000);
  close('month 3 interest', cb.rows[2].interest, 70); close('month 3 repay', cb.rows[2].repay, 7000); close('end cash', cb.endCash, 2000 + 11930 - 7000);
  close('peak debt', cb.peakDebt, 7000);
}

console.log(`${checks - fails}/${checks} checks passed`);
if (fails) process.exit(1);
