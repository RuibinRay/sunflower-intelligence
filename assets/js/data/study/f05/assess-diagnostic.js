// assess-diagnostic.js — F05 course diagnostic: twelve items, three per module, each written so that it needs the
// module’s own method; a student who knows only F04 (discounting, annuities, perpetuities, loans), F03 (ratios) and F00
// should miss it, and one who has the module’s method should get it right. What each item needs:
//   dg-1  net-present-value: an unexpected positive-NPV project raises the share price by its NPV per share.
//   dg-2  investment-criteria: two sign changes give two IRRs, so the IRR rule fails and the NPV decides.
//   dg-3  project-cash-flows: a year-0 free cash flow: after-tax sale of an old asset (tax on the gain over book value),
//         working capital net of payables, an expensed cost after tax, and a sunk study left out.
//   dg-4  choosing-between-projects: repeatable projects of unequal lives compared by equivalent annual annuity, not NPV.
//   dg-5  choosing-between-projects: timing; the crossover rate (the IRR of the difference) below which the later-paying
//         project is worth more, although its own IRR is lower.
//   dg-6  project-risk: the financial (NPV) break-even with a taxable resale at the end: the investment’s net equivalent
//         annual cost less the depreciation tax shield, grossed up for tax, on top of fixed costs.
//   dg-7  cost-of-debt-and-equity: unlever a peer’s beta for a debt-free firm, then the CAPM.
//   dg-8  weighted-average-cost-of-capital: market-value weights and the after-tax cost of debt (book values are the trap).
//   dg-9  weighted-average-cost-of-capital: a project’s rate by the pure-play approach (unlever the peer, relever at the
//         firm’s target, then a project WACC), not the firm’s WACC.
//   dg-10 capital-structure: Modigliani–Miller without taxes: shareholders’ required return falls to the assets’ return
//         when the debt is repaid (proposition II read backwards).
//   dg-11 payout-policy: a dividend and a buyback of the same cash at a fair price leave shareholders equally well off.
//   dg-12 financial-planning: the sustainable growth rate on end-of-year equity, ROE·b ÷ (1 − ROE·b).
// New questions, not copies of lesson exercises, module-test or project items. No hints; solutions show in review.
// Every business, person, price and rate here is fictional, and every figure the text shows is computed below with
// core/corpfin.js and core/invest.js (claims about the figures’ shape throw if the numbers stop supporting them).
import * as CF from '../../../core/corpfin.js?v=28';
import { npv, irrAll, irr, crossover } from '../../../core/invest.js?v=28';

const fx = (v, d = 0) => `${v < 0 ? '−' : ''}${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const money = (v, d = 0) => `${v < 0 ? '−' : ''}$${fx(Math.abs(v), d)}`;
const pc = (v, d = 1) => `${fx(v * 100, d)}%`;
const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const af = (r, n) => (1 - (1 + r) ** -n) / r;
const claim = (ok, what) => { if (!ok) throw new Error(`assess-diagnostic: the figures no longer support “${what}”`); };

// dg-1 Kestrion Couriers: an unexpected contract and the share price
const KC = { shares: 1_000_000, price: 8, outlay: 900_000, cf: 280_000, n: 5, r: 0.10 };
const kcNpv = npv(KC.r, [-KC.outlay, ...Array(KC.n).fill(KC.cf)]);
claim(kcNpv > 0, 'the contract has a positive NPV');

// dg-2 Orrinford Contracting: a reclamation contract with a restoration cost at the end
const AS = { flows: [-10_000, 26_000, -16_500], r: 0.20 };
const asIrrs = irrAll(AS.flows), asNpv = npv(AS.r, AS.flows), asSum = AS.flows.reduce((a, b) => a + b, 0);
claim(asIrrs.length === 2 && asIrrs[0] < AS.r && asIrrs[1] > AS.r && asNpv > 0 && asSum < 0, 'two IRRs either side of 20%, a positive NPV and a negative sum');

// dg-3 Thrushwell Dairy: year 0 of a yoghurt line
const TD = { equipment: 60_000, oldPrice: 8_000, oldBook: 3_000, inventory: 12_000, payables: 4_000, training: 5_000, study: 7_000, tax: 0.25 };
const tdOld = TD.oldPrice - TD.tax * (TD.oldPrice - TD.oldBook);
const tdFcf0 = -TD.equipment + tdOld - (TD.inventory - TD.payables) - TD.training * (1 - TD.tax);

// dg-4 Brackmere Signs: two repeatable fit-outs with different lives
const MS = { r: 0.10, a: { npv: 12_000, n: 3 }, b: { npv: 18_000, n: 6 } };
const msA = CF.eaa(MS.a.npv, MS.r, MS.a.n), msB = CF.eaa(MS.b.npv, MS.r, MS.b.n);
claim(msA > msB && MS.b.npv > MS.a.npv, 'the shorter fit-out has the lower NPV and the higher equivalent annual annuity');

// dg-5 Brisvane Ferries: two refits, same cost, different timing
const TF = { r: 0.08, early: [-50_000, 36_000, 20_000, 8_000], late: [-50_000, 6_000, 16_000, 52_000] };
const tfIrrE = irr(TF.early), tfIrrL = irr(TF.late), tfX = crossover(TF.late, TF.early)[0];
claim(crossover(TF.late, TF.early).length === 1 && tfIrrE > tfIrrL && npv(TF.r, TF.late) > npv(TF.r, TF.early) && tfX > TF.r && tfX < tfIrrL, 'the early refit has the higher IRR, the late one the higher NPV at 8%, and they cross once between 8% and both IRRs');

// dg-6 Fellbeck Bakery: a wholesale delivery round; the van is resold at the end
const FB = { price: 25, unitCost: 10, fixed: 30_000, capex: 40_000, n: 4, r: 0.12, tax: 0.25, resale: 8_000 };
FB.dep = FB.capex / FB.n; FB.m = FB.price - FB.unitCost;
FB.salvAT = FB.resale * (1 - FB.tax);                                          // book value is zero, so the whole resale is taxed
const fbOcf = CF.eaa(FB.capex - FB.salvAT / (1 + FB.r) ** FB.n, FB.r, FB.n);   // the OCF a year that gives NPV = 0
const fbQ = ((fbOcf - FB.dep) / (1 - FB.tax) + FB.fixed + FB.dep) / FB.m;
const fbNoSalv = CF.breakEvenVolumes({ price: FB.price, unitCost: FB.unitCost, fixed: FB.fixed, dep: FB.dep, capex: FB.capex, n: FB.n, r: FB.r, tax: FB.tax });
{ const N = (q) => npv(FB.r, CF.projectCashFlows({ capex: FB.capex, years: FB.n, revenue: Array(FB.n).fill(q * FB.price), variable: Array(FB.n).fill(q * FB.unitCost), fixed: FB.fixed, dep: Array(FB.n).fill(FB.dep), tax: FB.tax, salvage: FB.resale }).fcf);
  claim(Math.abs(N(fbQ)) < 1e-6, 'the break-even volume gives NPV = 0 in the cash-flow model'); }

// dg-7 Cawdell Fabrics: one listed peer, a debt-free target
const CW = { beta: 1.30, de: 0.60, tax: 0.25, rf: 0.042, mrp: 0.055 };
const cwBu = CF.unleverBeta(CW.beta, CW.de, CW.tax), cwRe = CF.capm({ rf: CW.rf, beta: cwBu, mrp: CW.mrp });

// dg-8 Marlcombe Glassworks: market against book weights
const MG = { shares: 4_000_000, price: 18, bookEquity: 30_000_000, face: 40_000_000, quote: 0.95, ytm: 0.064, rE: 0.105, tax: 0.25 };
MG.E = MG.shares * MG.price; MG.D = MG.face * MG.quote;
const mgW = CF.wacc({ E: MG.E, D: MG.D, rE: MG.rE, rD: MG.ytm, tax: MG.tax }).wacc;
const mgBook = CF.wacc({ E: MG.bookEquity, D: MG.face, rE: MG.rE, rD: MG.ytm, tax: MG.tax }).wacc;
const mgPre = (MG.E * MG.rE + MG.D * MG.ytm) / (MG.E + MG.D);

// dg-9 Aldmoor Water: a battery-storage venture valued with a pure-play peer
const AW = { wacc: 0.085, beta: 1.5, de: 0.4, dv: 0.30, rD: 0.06, tax: 0.25, rf: 0.042, mrp: 0.055 };
AW.tde = AW.dv / (1 - AW.dv);
const awBu = CF.unleverBeta(AW.beta, AW.de, AW.tax), awBl = CF.releverBeta(awBu, AW.tde, AW.tax);
const awRe = CF.capm({ rf: AW.rf, beta: awBl, mrp: AW.mrp });
const awW = CF.wacc({ E: 1 - AW.dv, D: AW.dv, rE: awRe, rD: AW.rD, tax: AW.tax }).wacc;
const awRaw = CF.wacc({ E: 1 - AW.dv, D: AW.dv, rE: CF.capm({ rf: AW.rf, beta: AW.beta, mrp: AW.mrp }), rD: AW.rD, tax: AW.tax }).wacc;
const awPre = (1 - AW.dv) * awRe + AW.dv * AW.rD;
claim(awW > AW.wacc, 'the venture’s rate is above the utility’s WACC');

// dg-10 Venwick Freight: repaying its debt in a world without taxes
const VF = { rE: 0.14, rD: 0.06, de: 0.5 };
const vfU = (VF.rE + VF.rD * VF.de) / (1 + VF.de);
claim(Math.abs(CF.mm({ Vu: 1, D: VF.de / (1 + VF.de), rU: vfU, rD: VF.rD, tax: 0 }).rE - VF.rE) < 1e-12, 'MM proposition II at D/E 0.5 gives back the 14% cost of equity');

// dg-11 Draymoss Pasta: a dividend against a buyback of the same cash
const DP = { shares: 10_000_000, price: 20, cash: 20_000_000, hold: 1_000 };
const dpPay = CF.payout({ shares: DP.shares, price: DP.price, amount: DP.cash, earnings: 1 });
claim(Math.abs(dpPay.dividend.wealth - dpPay.buyback.wealth) < 1e-9 && Math.abs(dpPay.buyback.priceAfter - DP.price) < 1e-9, 'equal wealth per share; the buyback leaves the price unchanged');

// dg-12 Tarrowby Tiles: the sustainable growth rate
const TT = { ni: 360_000, div: 90_000, equity: 2_400_000 };
const ttRoe = TT.ni / TT.equity, ttB = 1 - TT.div / TT.ni, ttSgr = CF.sustainableGrowth(ttRoe, ttB);
claim(Math.abs(ttB - 0.75) < 1e-12, 'Tarrowby retains three-quarters of its profit');

export const items = [
  // ================================================================ Module 1: Investment decisions
  {
    id: 'f05-dg-1', lesson: 'net-present-value', type: 'num', kind: 'applied',
    prompt: `Kestrion Couriers (fictional, listed) has ${fx(KC.shares)} shares trading at ${money(KC.price)}. It unexpectedly wins a delivery contract that needs ${money(KC.outlay)} of vans today and brings in ${money(KC.cf)} a year after tax at the end of each of the next ${KC.n} years, with nothing left at the end. Kestrion’s opportunity cost of capital for this work is ${pc(KC.r, 0)}. If investors believe the forecasts, by how much should the share price rise when the contract is announced? Give dollars and cents.`,
    answer: rnd(kcNpv / KC.shares, 2),
    check: () => { let pv = 0; for (let t = 1; t <= 5; t++) pv += 280_000 / 1.1 ** t; return (pv - 900_000) / 1_000_000; },
    unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 0, say: 'Paying $900,000 for the vans doesn’t simply swap cash for assets of equal value. The contract is worth more than it costs, and that surplus, its NPV, belongs to the shareholders as soon as investors expect it.' },
      { value: rnd((KC.n * KC.cf - KC.outlay) / KC.shares, 2), say: 'That adds the cash flows without discounting. The value added is the NPV at 10%, per share.' },
      { value: rnd((kcNpv + KC.outlay) / KC.shares, 2), say: 'That is the present value of the inflows per share. The vans cost $900,000, so the value added is the NPV.' },
    ],
    solution: `NPV = ${fx(KC.cf)} × ${fx(af(KC.r, KC.n), 6)} − ${fx(KC.outlay)} ≈ ${money(kcNpv)}. A positive-NPV project adds that much to what the firm is worth, and the gain goes to the shareholders: about ${money(kcNpv / KC.shares, 2)} a share, taking the price to about ${money(KC.price + kcNpv / KC.shares, 2)}. Had investors already expected the contract, the price would have moved earlier and not on the announcement.`,
  },
  {
    id: 'f05-dg-2', lesson: 'investment-criteria', type: 'mc', kind: 'applied',
    prompt: `Orrinford Contracting (fictional) can take a land-reclamation contract: it spends ${money(-AS.flows[0])} on equipment now, is paid ${money(AS.flows[1])} at the end of year 1, and must spend ${money(-AS.flows[2])} restoring the site at the end of year 2. Its opportunity cost of capital is ${pc(AS.r, 0)}. A spreadsheet’s IRR function returns ${pc(asIrrs[0])}. What should Ashgill do?`,
    options: [
      `Reject it, because the IRR of ${pc(asIrrs[0])} is below the ${pc(AS.r, 0)} cost of capital`,
      `Reject it: the cash flows add up to ${money(asSum)}, so the contract loses money`,
      `Accept it: the NPV at ${pc(AS.r, 0)} is about ${money(asNpv)}; the flows have two IRRs, ${pc(asIrrs[0])} and ${pc(asIrrs[1])}`,
      `Accept it only if the cost of capital is above ${pc(asIrrs[1])}, the higher of the two IRRs`,
    ],
    answer: 2,
    feedback: {
      0: `The cash flows change sign twice (−, +, −), so there are two IRRs, ${pc(asIrrs[0])} and ${pc(asIrrs[1])}, and the “accept if IRR > cost of capital” rule doesn’t apply. Use the NPV.`,
      1: 'Adding cash flows from different years ignores the time value of money. The large payment comes a year before the restoration cost, and at 20% the restoration is worth much less today.',
      3: `That reverses it. The NPV is positive for rates between the two IRRs and negative outside them; at ${pc(asIrrs[1])} or above it is negative.`,
    },
    solution: `NPV at ${pc(AS.r, 0)} = ${fx(AS.flows[0])} + ${fx(AS.flows[1])} ÷ 1.2 − ${fx(-AS.flows[2])} ÷ 1.2² = ${fx(AS.flows[0])} + ${fx(AS.flows[1] / 1.2, 2)} − ${fx(-AS.flows[2] / 1.44, 2)} ≈ ${money(asNpv, 2)}: accept. With two sign changes the NPV is zero at two rates, ${pc(asIrrs[0])} and ${pc(asIrrs[1])}, and positive between them. The IRR function reports whichever root it reaches from its starting guess, so its answer can’t be compared with the cost of capital.`,
  },
  {
    id: 'f05-dg-3', lesson: 'project-cash-flows', type: 'num', kind: 'numerical',
    prompt: `Thrushwell Dairy (fictional) is starting a yoghurt line today. It buys equipment for ${money(TD.equipment)} and sells an old filler that the line replaces for ${money(TD.oldPrice)}; the filler’s tax book value is ${money(TD.oldBook)}. Inventory rises by ${money(TD.inventory)} and payables by ${money(TD.payables)}. Staff training costs ${money(TD.training)} today and is expensed for tax. Last year the dairy paid ${money(TD.study)} for a market study of the line. Tax is ${pc(TD.tax, 0)}, and the dairy’s other profits absorb any deduction. What is the project’s free cash flow at year 0? Give whole dollars, with a minus sign for an outflow.`,
    answer: rnd(tdFcf0, 0),
    check: () => {
      const gainTax = 0.25 * (8_000 - 3_000), nwc = 12_000 - 4_000, trainingAfterTax = 5_000 - 0.25 * 5_000;
      return -60_000 + (8_000 - gainTax) - nwc - trainingAfterTax;
    },
    unit: '$', places: 0, tol: 1,
    wrong: [
      { value: rnd(tdFcf0 - TD.study, 0), say: 'That includes the market study. It was paid last year and can’t be recovered whatever the dairy decides, so it is a sunk cost and stays out.' },
      { value: rnd(tdFcf0 + TD.tax * (TD.oldPrice - TD.oldBook), 0), say: `That takes the old filler’s full sale price. It sells for more than its tax book value, so the gain is taxed: it brings in ${fx(TD.oldPrice)} − 0.25 × ${fx(TD.oldPrice - TD.oldBook)}.` },
      { value: rnd(tdFcf0 - TD.tax * TD.training, 0), say: `That counts the training at its full cost. It is deductible, so with tax at ${pc(TD.tax, 0)} it costs ${fx(TD.training)} × 0.75 after tax.` },
      { value: rnd(tdFcf0 - TD.payables, 0), say: 'That counts the whole rise in inventory as tied-up cash. Suppliers finance part of it: the increase in working capital is inventory less payables.' },
    ],
    solution: `Equipment: −${fx(TD.equipment)}. Old filler: ${fx(TD.oldPrice)} − 0.25 × (${fx(TD.oldPrice)} − ${fx(TD.oldBook)}) = +${fx(tdOld, 0)}. Working capital: −(${fx(TD.inventory)} − ${fx(TD.payables)}) = −${fx(TD.inventory - TD.payables)}. Training after tax: −${fx(TD.training)} × 0.75 = −${fx(TD.training * 0.75)}. The study is sunk. Year-0 FCF = ${money(tdFcf0)}.`,
  },

  // ================================================================ Module 2: Analysing projects
  {
    id: 'f05-dg-4', lesson: 'choosing-between-projects', type: 'num', kind: 'applied',
    prompt: `Brackmere Signs (fictional) can fit out its workshop in one of two ways, not both, and expects to renew the choice on the same terms when each ends. Option A has an NPV of ${money(MS.a.npv)} and lasts ${MS.a.n} years; option B has an NPV of ${money(MS.b.npv)} and lasts ${MS.b.n} years. Both NPVs are at ${pc(MS.r, 0)}. How much more value a year, in equivalent annual terms, does the better option add? Give whole dollars.`,
    answer: rnd(msA - msB, 0),
    check: () => 12_000 / af(0.1, 3) - 18_000 / af(0.1, 6),
    unit: '$', places: 0, tol: 2,
    wrong: [
      { value: MS.b.npv - MS.a.npv, say: 'That compares the NPVs, which cover different periods: B’s six years against A’s three. Spread each NPV over its own life as an annuity (the equivalent annual annuity) and compare those.' },
      { value: rnd(MS.a.npv / MS.a.n - MS.b.npv / MS.b.n, 0), say: 'Dividing each NPV by its life ignores the time value of money. The equivalent annual annuity is NPV ÷ the annuity factor at 10%.' },
      { value: rnd(msA, 0), say: 'That is A’s equivalent annual annuity on its own. Subtract B’s.' },
    ],
    solution: `Equivalent annual annuity = NPV ÷ annuity factor. A: ${fx(MS.a.npv)} ÷ ${fx(af(0.1, 3), 4)} ≈ ${money(msA, 2)} a year. B: ${fx(MS.b.npv)} ÷ ${fx(af(0.1, 6), 4)} ≈ ${money(msB, 2)} a year. A adds about ${money(msA - msB)} a year more, so A wins although its own NPV is smaller: repeated every three years, it earns its NPV twice in six years. The comparison assumes each choice can be repeated on the same terms.`,
  },
  {
    id: 'f05-dg-5', lesson: 'choosing-between-projects', type: 'num', kind: 'numerical',
    prompt: `Brisvane Ferries (fictional) can refit its ferry in one of two ways, not both, each costing ${money(-TF.early[0])} today. The quick refit returns ${TF.early.slice(1).map((v) => money(v)).join(', ')} at the end of years 1 to 3 (IRR ${pc(tfIrrE)}); the thorough refit returns ${TF.late.slice(1).map((v) => money(v)).join(', ')} (IRR ${pc(tfIrrL)}). Below what discount rate does the thorough refit add more value than the quick one? Give a percentage to one decimal place.`,
    answer: rnd(tfX * 100, 1),
    check: () => { const d = TF.late.map((v, t) => v - TF.early[t]); let lo = 0, hi = 1; for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (npv(m, d) > 0) lo = m; else hi = m; } return lo * 100; },
    unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: rnd(tfIrrL * 100, 1), say: 'That is the thorough refit’s own IRR, where its NPV is zero. The question is where the two NPVs are equal: the IRR of the difference in their cash flows.' },
      { value: rnd(tfIrrE * 100, 1), say: 'That is the quick refit’s own IRR. Find the rate at which the two NPV profiles cross: the IRR of thorough minus quick.' },
      { value: rnd((tfIrrE - tfIrrL) * 100, 1), say: 'Subtracting the IRRs doesn’t give the crossover. Subtract the cash flows year by year and find the IRR of the difference.' },
    ],
    solution: `Thorough minus quick: ${TF.late.map((v, t) => fx(v - TF.early[t])).join(', ')}. The rate at which this difference has an NPV of zero, the crossover rate, is about ${pc(tfX)}. Below it the thorough refit’s larger later cash flows make its NPV the higher (at 8%: ${money(npv(0.08, TF.late))} against ${money(npv(0.08, TF.early))}), although its own IRR is the lower. Above it, the quick refit wins.`,
  },
  {
    id: 'f05-dg-6', lesson: 'project-risk', type: 'num', kind: 'numerical',
    prompt: `Fellbeck Bakery (fictional) is considering a wholesale delivery round. It sells boxes of pastries at ${money(FB.price)} each, which cost ${money(FB.unitCost)} each to bake. Fixed cash costs are ${money(FB.fixed)} a year. The van costs ${money(FB.capex)} today and is depreciated straight line over ${FB.n} years to zero; Fellbeck expects to sell it for ${money(FB.resale)} at the end of year ${FB.n}. Tax is ${pc(FB.tax, 0)}, the required return ${pc(FB.r, 0)}, and the bakery’s other profits absorb any tax loss. How many boxes a year must the round sell for its NPV to be zero? Round to the nearest box.`,
    answer: rnd(fbQ, 0),
    check: () => {
      const net = 40_000 - 8_000 * 0.75 / 1.12 ** 4;                           // van less the PV of its after-tax resale
      const need = net * 0.12 / (1 - 1.12 ** -4);                             // OCF a year for NPV = 0
      return ((need - 10_000) / 0.75 + 30_000 + 10_000) / 15;                // OCF = (15Q − 30,000 − 10,000) × 0.75 + 10,000
    },
    unit: 'boxes', places: 0, tol: 1,
    wrong: [
      { value: rnd(fbNoSalv.financial, 0), say: 'That leaves out the van’s resale. Its after-tax value, $8,000 × 0.75 (book value is zero, so all of it is taxed), comes back in year 4 and lowers the yearly cost of the van.' },
      { value: rnd(fbNoSalv.accounting, 0), say: 'That is the accounting break-even (EBIT = 0), which earns no return on the money tied up in the van.' },
      { value: rnd(((CF.eaa(FB.capex - FB.resale / (1 + FB.r) ** FB.n, FB.r, FB.n) - FB.dep) / (1 - FB.tax) + FB.fixed + FB.dep) / FB.m, 0), say: 'That counts the resale before tax. The van is fully depreciated, so the whole $8,000 is a taxable gain: it brings in $6,000.' },
    ],
    solution: `The van’s net cost today is ${fx(FB.capex)} − ${fx(FB.salvAT)} ÷ 1.12⁴ ≈ ${money(FB.capex - FB.salvAT / 1.12 ** 4, 2)} (after-tax resale ${fx(FB.resale)} × 0.75 = ${fx(FB.salvAT)}). Spread over ${FB.n} years at ${pc(FB.r, 0)}: ${money(fbOcf, 2)} a year, the operating cash flow needed for NPV = 0. OCF = (Q × ${FB.m} − ${fx(FB.fixed)} − ${fx(FB.dep)}) × 0.75 + ${fx(FB.dep)}, so Q = [(${fx(fbOcf, 2)} − ${fx(FB.dep)}) ÷ 0.75 + ${fx(FB.fixed + FB.dep)}] ÷ ${FB.m} ≈ ${fx(fbQ, 1)}, about ${fx(fbQ)} boxes a year. Without the resale it would be ${fx(fbNoSalv.financial)}; the accounting break-even is ${fx(fbNoSalv.accounting)}.`,
  },

  // ================================================================ Module 3: The cost of capital
  {
    id: 'f05-dg-7', lesson: 'cost-of-debt-and-equity', type: 'num', kind: 'numerical',
    prompt: `Cawdell Fabrics (fictional) is private, has no debt and intends to stay debt-free. Its closest listed peer has an equity beta of ${fx(CW.beta, 2)} and a market debt-to-equity ratio of ${fx(CW.de, 2)}; both firms pay tax at ${pc(CW.tax, 0)}. With a risk-free rate of ${pc(CW.rf)} and a market risk premium of ${pc(CW.mrp)}, what is Cawdell’s cost of equity from the CAPM? Give a percentage to two decimal places.`,
    answer: rnd(cwRe * 100, 2),
    check: () => (0.042 + 1.3 / (1 + 0.75 * 0.6) * 0.055) * 100,
    unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(CF.capm({ rf: CW.rf, beta: CW.beta, mrp: CW.mrp }) * 100, 2), say: 'That uses the peer’s equity beta as it stands. The peer’s shareholders carry the extra risk of its debt; Cawdell has none, so unlever the beta first: β_U = 1.30 ÷ (1 + 0.75 × 0.60).' },
      { value: rnd((CW.rf + CF.unleverBeta(CW.beta, CW.de, 0) * CW.mrp) * 100, 2), say: 'That unlevers without tax. With corporate tax the formula is β_U = β_L ÷ (1 + (1 − T) D/E): interest is deductible, so debt adds less risk to equity.' },
    ],
    solution: `Unlever the peer’s beta: β_U = ${fx(CW.beta, 2)} ÷ (1 + 0.75 × ${fx(CW.de, 2)}) = ${fx(CW.beta, 2)} ÷ ${fx(1 + 0.75 * CW.de, 2)} ≈ ${fx(cwBu, 4)}. With no debt Cawdell’s equity beta is its unlevered beta. CAPM: ${pc(CW.rf)} + ${fx(cwBu, 4)} × ${pc(CW.mrp)} ≈ ${pc(cwRe, 2)}.`,
  },
  {
    id: 'f05-dg-8', lesson: 'weighted-average-cost-of-capital', type: 'num', kind: 'applied',
    prompt: `Marlcombe Glassworks (fictional, listed) has ${fx(MG.shares)} shares trading at ${money(MG.price)}; its balance sheet shows equity of ${money(MG.bookEquity)}. Its bonds have a face value of ${money(MG.face)}, trade at ${fx(MG.quote * 100)}% of face and yield ${pc(MG.ytm)}. Its cost of equity is ${pc(MG.rE)} and its tax rate ${pc(MG.tax, 0)}. What is Marlcombe’s WACC? Give a percentage to two decimal places.`,
    answer: rnd(mgW * 100, 2),
    check: () => { const E = 4e6 * 18, D = 40e6 * 0.95; return (E * 10.5 + D * 6.4 * 0.75) / (E + D); },
    unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(mgBook * 100, 2), say: 'That weights by book values. Investors’ required returns apply to what their claims are worth today: equity at 4,000,000 × $18 and the bonds at 95% of face.' },
      { value: rnd(mgPre * 100, 2), say: 'That uses the pre-tax cost of debt. Interest is deductible, so debt costs 6.4% × (1 − 0.25) after tax.' },
    ],
    solution: `Market values: E = ${fx(MG.shares)} × ${money(MG.price)} = ${money(MG.E)}; D = ${fx(MG.quote, 2)} × ${money(MG.face)} = ${money(MG.D)}; V = ${money(MG.E + MG.D)}. WACC = (${fx(MG.E / 1e6)} × ${pc(MG.rE)} + ${fx(MG.D / 1e6)} × ${pc(MG.ytm)} × 0.75) ÷ ${fx((MG.E + MG.D) / 1e6)} ≈ ${pc(mgW, 2)}. Book weights would give ${pc(mgBook, 2)}: book equity of ${money(MG.bookEquity)} says little about what shareholders’ claims are worth.`,
  },
  {
    id: 'f05-dg-9', lesson: 'weighted-average-cost-of-capital', type: 'num', kind: 'applied',
    prompt: `Aldmoor Water (fictional), a regulated water utility with a WACC of ${pc(AW.wacc)}, is considering a battery-storage venture. A listed firm that does only battery storage has an equity beta of ${fx(AW.beta, 2)} at a debt-to-equity ratio of ${fx(AW.de, 2)}. Aldmoor finances itself with ${pc(AW.dv, 0)} debt (of value) at ${pc(AW.rD, 0)} before tax and would do the same for the venture. Tax is ${pc(AW.tax, 0)} for both firms; the risk-free rate is ${pc(AW.rf)} and the market risk premium ${pc(AW.mrp)}. What discount rate should Aldmoor use for the venture? Give a percentage to two decimal places.`,
    answer: rnd(awW * 100, 2),
    check: () => { const bu = 1.5 / (1 + 0.75 * 0.4), bl = bu * (1 + 0.75 * 0.3 / 0.7); return (0.7 * (0.042 + bl * 0.055) + 0.3 * 0.06 * 0.75) * 100; },
    unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: AW.wacc * 100, say: 'That is Aldmoor’s own WACC, the rate for projects as risky as a water utility. Battery storage is a different business: take its risk from the pure-play peer.' },
      { value: rnd(awRaw * 100, 2), say: 'That uses the peer’s equity beta as it stands, at the peer’s D/E of 0.40. Unlever it, then relever it at Aldmoor’s own D/E of 0.30 ÷ 0.70.' },
      { value: rnd(awPre * 100, 2), say: 'That uses the pre-tax cost of debt. Interest is deductible, so weight 6% × 0.75.' },
    ],
    solution: `Unlever the pure play: β_U = ${fx(AW.beta, 2)} ÷ (1 + 0.75 × ${fx(AW.de, 2)}) ≈ ${fx(awBu, 4)}. Relever at Aldmoor’s D/E = ${fx(AW.dv, 2)} ÷ ${fx(1 - AW.dv, 2)} ≈ ${fx(AW.tde, 4)}: β_L ≈ ${fx(awBu, 4)} × ${fx(1 + 0.75 * AW.tde, 4)} ≈ ${fx(awBl, 4)}. Cost of equity = ${pc(AW.rf)} + ${fx(awBl, 4)} × ${pc(AW.mrp)} ≈ ${pc(awRe, 2)}. Venture rate = ${fx(1 - AW.dv, 2)} × ${pc(awRe, 2)} + ${fx(AW.dv, 2)} × ${pc(AW.rD, 0)} × 0.75 ≈ ${pc(awW, 2)}, well above the utility’s ${pc(AW.wacc)}: a firm’s WACC suits only projects as risky as the firm.`,
  },

  // ================================================================ Module 4: Financing and payout
  {
    id: 'f05-dg-10', lesson: 'capital-structure', type: 'num', kind: 'numerical',
    prompt: `In a world without taxes, Venwick Freight (fictional) has debt equal to half the market value of its equity. Its shareholders require ${pc(VF.rE, 0)} and its lenders ${pc(VF.rD, 0)}. Venwick issues new shares and uses the money to repay all its debt; its business is unchanged. Under Modigliani and Miller, what return will its shareholders now require? Give a percentage to two decimal places.`,
    answer: rnd(vfU * 100, 2),
    check: () => (2 / 3) * 14 + (1 / 3) * 6,
    unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: VF.rE * 100, say: 'The shareholders’ required return reflects the extra risk debt puts on them. Without debt they bear only the business risk, so they require less: the assets’ return, the old WACC.' },
      { value: rnd((VF.rE + VF.rD) / 2 * 100, 2), say: 'That averages the two rates equally. Weight them by value: with D/E = 0.5, equity is two-thirds of the firm and debt one-third.' },
      { value: rnd((VF.rE + (VF.rE - VF.rD) * VF.de) * 100, 2), say: 'That applies proposition II the wrong way, as if Venwick were borrowing more. Repaying the debt lowers the shareholders’ risk.' },
    ],
    solution: `Without taxes the WACC doesn’t depend on the debt: it is the return on the assets, r_U = (E × r_E + D × r_D) ÷ V = (2/3) × ${pc(VF.rE, 0)} + (1/3) × ${pc(VF.rD, 0)} ≈ ${pc(vfU, 2)}. With no debt left, the shareholders bear only that business risk and require ${pc(vfU, 2)}. Check with proposition II: r_E = ${pc(vfU, 2)} + (${pc(vfU, 2)} − ${pc(VF.rD, 0)}) × 0.5 = ${pc(VF.rE, 0)} before the change.`,
  },
  {
    id: 'f05-dg-11', lesson: 'payout-policy', type: 'mc', kind: 'conceptual',
    prompt: `Draymoss Pasta (fictional, listed) has ${fx(DP.shares)} shares trading at ${money(DP.price)} and ${money(DP.cash)} of surplus cash. It can pay the cash as a dividend of ${money(dpPay.dividend.perShare)} a share, or use it to buy back shares at ${money(DP.price)}. In a perfect market, with no taxes, how do the two compare for a shareholder with ${fx(DP.hold)} shares who doesn’t sell?`,
    options: [
      `The buyback is better: her shares stay at ${money(dpPay.buyback.priceAfter)} instead of falling to ${money(dpPay.dividend.priceAfter)}`,
      `The dividend is better: she gets ${money(DP.hold * dpPay.dividend.perShare)} in cash and keeps all her shares`,
      `They are the same: ${money(DP.hold * dpPay.dividend.priceAfter)} of shares plus ${money(DP.hold * dpPay.dividend.perShare)} of cash, or ${money(DP.hold * dpPay.buyback.priceAfter)} of shares`,
      `The buyback is better, because it raises the earnings per share of the shares that remain`,
    ],
    answer: 2,
    feedback: {
      0: `The price after the dividend falls by exactly the cash paid out, which she now holds. Her wealth is ${money(DP.hold * dpPay.dividend.wealth)} either way.`,
      1: `She keeps all her shares, but each is now worth ${money(dpPay.dividend.priceAfter)}: the cash has left the firm. Shares plus cash come to ${money(DP.hold * dpPay.dividend.wealth)}, the same as after a buyback.`,
      3: 'EPS does rise after a buyback, but that is not a gain in value: the price is unchanged, and the shares bought were paid exactly what they were worth.',
    },
    solution: `Dividend: the shares go ex-dividend at ${money(DP.price)} − ${money(dpPay.dividend.perShare)} = ${money(dpPay.dividend.priceAfter)}; she holds ${money(DP.hold * dpPay.dividend.priceAfter)} of shares and ${money(DP.hold * dpPay.dividend.perShare)} of cash. Buyback: ${fx(dpPay.buyback.sharesBought)} shares are bought at ${money(DP.price)}; the ${money(DP.shares * DP.price - DP.cash)} left is spread over ${fx(dpPay.buyback.shares)} shares, still ${money(dpPay.buyback.priceAfter)} each, so her ${fx(DP.hold)} shares are worth ${money(DP.hold * dpPay.buyback.priceAfter)}. Same wealth; if she wanted cash she could sell ${fx(DP.hold * dpPay.dividend.perShare / DP.price)} shares herself. Taxes, signalling and costs are what can make the two differ in practice.`,
  },
  {
    id: 'f05-dg-12', lesson: 'financial-planning', type: 'num', kind: 'applied',
    prompt: `Tarrowby Tiles (fictional) earned net income of ${money(TT.ni)} last year and paid dividends of ${money(TT.div)}. Its equity at the end of the year was ${money(TT.equity)}, and it issued and bought back no shares. If it keeps its profit margin, asset turnover, payout ratio and debt-to-equity ratio as they are, and sells no new shares, how fast can its sales grow? Give a percentage to two decimal places.`,
    answer: rnd(ttSgr * 100, 2),
    check: () => { const retained = 360_000 - 90_000; return retained / (2_400_000 - retained) * 100; },
    unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(ttRoe * ttB * 100, 2), say: 'ROE × b with ROE on end-of-year equity divides this year’s retained profit by equity that already includes it. Growth is measured from the opening equity, so SGR = ROE × b ÷ (1 − ROE × b).' },
      { value: rnd(ttRoe * 100, 2), say: 'That is the return on equity. Only the retained part of profit, 75% of it, adds to equity.' },
      { value: rnd(CF.internalGrowth(TT.ni / TT.equity, 1) * 100, 2), say: 'That assumes all profit is retained. Tarrowby pays out a quarter of it, so the retention ratio is 0.75.' },
    ],
    solution: `This is the sustainable growth rate. ROE = ${fx(TT.ni)} ÷ ${fx(TT.equity)} = ${pc(ttRoe)}; retention b = 1 − ${fx(TT.div)} ÷ ${fx(TT.ni)} = ${fx(ttB, 2)}. SGR = ROE × b ÷ (1 − ROE × b) = ${fx(ttRoe * ttB, 4)} ÷ ${fx(1 - ttRoe * ttB, 4)} ≈ ${pc(ttSgr, 2)}. Check: retained earnings of ${money(TT.ni - TT.div)} grew equity from ${money(TT.equity - (TT.ni - TT.div))} to ${money(TT.equity)}, a ${pc(ttSgr, 2)} rise, and with fixed ratios sales, assets and debt grow at the same rate.`,
  },
];

// Start at module N if the student scores at least 75% on the items for all the modules before N. With three items per
// module that means all three module-1 items for module 2, five of the six module 1–2 items for module 3, and seven of
// the nine module 1–3 items for module 4.
export const route = [
  { module: 2, ifAtLeast: 0.75 },
  { module: 3, ifAtLeast: 0.75 },
  { module: 4, ifAtLeast: 0.75 },
];
