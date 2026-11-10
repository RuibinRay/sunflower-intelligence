// assess-final.js — F05 cumulative final: 24 items across all four modules and all eight of the course’s outcomes,
// two or three per lesson (seven for module 1, five for module 2, five for module 3 and seven for module 4). 70% passes.
// Outcomes (main one per item): 1 NPV, timing and the opportunity cost of capital fn-1, fn-2; 2 IRR, MIRR, payback and
// PI fn-3, fn-4 (and fn-5); 3 incremental free cash flows fn-5, fn-6, fn-7; 4 mutually exclusive projects and rationing
// fn-8 (unequal lives), fn-9 (rationing where the PI ranking fails), fn-10 (timing and the crossover rate); 5 risk
// analysis fn-11, fn-12; 6 the cost of capital fn-13, fn-14, fn-15, fn-16, fn-17 (and fn-8, fn-9); 7 capital structure
// fn-18, fn-19, fn-20; 8 payout and financial planning fn-21, fn-22, fn-23, fn-24 (and fn-18).
// Mixed conceptual, numerical and applied items (7, 8 and 9). Four items are spreadsheet formula items, one of them a
// step of a steps item, and the marking copies scale the inputs so a typed-in result fails: a MIRR with a later
// outflow, so both rates matter (fn-3); a profitability index with NPV (fn-4, step 3); a cost of equity with the beta
// relevered inside the formula (fn-15, the target D/E varied); the WACC under MM with tax (fn-20, the debt varied).
// Items that combine lessons: an NPV with payments at the start of each year (fn-1: net-present-value); a package’s NPV
// as the sum of its parts at Ana’s rate (fn-2: net-present-value, choosing-between-projects); payback, discounted
// payback and the PI in a formula (fn-4: investment-criteria, net-present-value); free cash flows built from MACRS,
// working capital and after-tax salvage, then NPV and IRR (fn-5: project-cash-flows, net-present-value,
// investment-criteria); Cold Brew’s working capital and its NPV (fn-6: project-cash-flows, net-present-value); a WACC
// from market values, then two machines of unequal lives by EAA at it (fn-8: weighted-average-cost-of-capital,
// choosing-between-projects); a WACC, then the best set within a budget where ranking by PI fails (fn-9:
// weighted-average-cost-of-capital, choosing-between-projects, investment-criteria); the crossover rate and the choice
// (fn-10: choosing-between-projects, investment-criteria); a scenario’s cash flow, NPV and the expected NPV (fn-11:
// project-risk, project-cash-flows); unlever and average two peers’ betas, relever at the target, WACC, then an
// average-risk project’s NPV at it (fn-13: cost-of-debt-and-equity, weighted-average-cost-of-capital,
// net-present-value); a low-risk project judged at the WACC and at its own rate (fn-16: weighted-average-cost-of-capital,
// net-present-value, investment-criteria); a WACC with the cost of debt from a bond’s price (fn-17:
// weighted-average-cost-of-capital, cost-of-debt-and-equity); MM with tax and the buyback that follows (fn-18:
// capital-structure, payout-policy); MM with tax and the WACC (fn-20: capital-structure,
// weighted-average-cost-of-capital); a targeted buyback above value: shares, price and who gains (fn-21: payout-policy);
// AFN, then the sustainable growth rate, then what closes the gap (fn-23: financial-planning); a cash budget with a line
// of credit at its limit (fn-24: financial-planning). Single-lesson items: fn-3, fn-7 (sorting what belongs in a free
// cash flow), fn-12, fn-14 (a semi-annual bond’s yield), fn-15, fn-19, fn-22.
// Lantern items use case.js (Cold Brew, the kiosks, cargo bike and solar panels, the peers, the market assumptions,
// and Coastline’s 7.5%), never the project’s parts. Every other business and figure is
// fictional. Every figure the text shows is computed below with core/corpfin.js and core/invest.js; claims about the
// figures’ shape throw if the numbers stop supporting them. New questions, not copies of lesson exercises, module-test,
// diagnostic or project items. No hints; solutions show in review.
import { COLD_BREW, PROPOSALS, WORKING_RATE, TARGET_DV, TAX, MARKET, PEERS, DEBT, DERIVED, coldBrewFlows } from './case.js?v=30';
import * as CF from '../../../core/corpfin.js?v=30';
import { npv, irr, mirr, payback, profitabilityIndex, crossover, ration } from '../../../core/invest.js?v=30';

const fx = (v, d = 0) => `${v < 0 ? '−' : ''}${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const money = (v, d = 0) => `${v < 0 ? '−' : ''}$${fx(Math.abs(v), d)}`;
const pc = (v, d = 1) => `${fx(v * 100, d)}%`;
const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const af = (r, n) => (1 - (1 + r) ** -n) / r;
const claim = (ok, what) => { if (!ok) throw new Error(`assess-final: the figures no longer support “${what}”`); };
const M = '$#,##0';
const r11 = WORKING_RATE;

// ---------------------------------------------------------------- module 1
// fn-1 Elmscott Laundry (fictional): lease payments at the start of each year, savings at the end
const EL = { lease: 60_000, saving: 70_000, n: 4, r: 0.09 };
const elFlows = [-EL.lease, ...Array(EL.n).fill(0).map((_, t) => EL.saving - (t + 1 < EL.n ? EL.lease : 0))];   // year 0 … n
const elNpv = npv(EL.r, elFlows);
claim(elNpv > 0 && (EL.saving - EL.lease) * af(EL.r, EL.n) > elNpv, 'the NPV is positive and lower than with year-end lease payments');
// fn-2 Lantern’s kiosks, cargo bike and solar panels as one package (savings are after tax, no resale: as the lessons value them)
const SMALL = PROPOSALS.slice(2).map((p) => ({ ...p, flows: [-p.outlay, ...Array(p.life).fill(p.saving)] }));
const [KIOSK, BIKE, SOLAR] = SMALL;
const KIOSK_FLOWS = KIOSK.flows;
const smNpv = SMALL.map((p) => npv(r11, p.flows));
const pkg = smNpv.reduce((a, b) => a + b, 0), pkgGood = smNpv[0] + smNpv[1];
claim(smNpv[0] > 0 && smNpv[1] > 0 && smNpv[2] < 0 && pkg > 0, 'kiosks and bike positive, panels negative, the package positive');
// fn-3 Vellicott Orchards (fictional): a replanting outlay in year 3, so the finance rate matters
const VO = { flows: [-40_000, 14_000, 15_000, -9_000, 17_000, 18_000, 19_000], fin: 0.08, re: 0.06 };
const voMirr = mirr(VO.flows, VO.fin, VO.re);
claim(Math.abs(mirr(VO.flows, VO.re, VO.fin) - voMirr) > 0.001, 'swapping the rates changes the MIRR');
// fn-4 Saffrin Cinemas (fictional): payback, discounted payback and the profitability index
const SC = { r: 0.10, flows: [-60_000, 22_000, 20_000, 15_000, 16_000, 12_000] };
const scPb = payback(SC.flows), scDpb = payback(SC.flows, SC.r), scPi = profitabilityIndex(SC.r, SC.flows);
claim(scPb > 3 && scPb < 4 && scDpb > 4 && scDpb < 5 && scPi > 1, 'payback in year 4, discounted payback in year 5, PI above 1');
const scCells = { A1: 'Discount rate', B1: SC.r, A3: 'Year', ...Object.fromEntries(SC.flows.flatMap((v, i) => [[`${'BCDEFG'[i]}3`, i], [`${'BCDEFG'[i]}4`, v]])), A4: 'Cash flow', A6: 'Profitability index' };
// fn-5 Wrexcombe Hotels (fictional): guest e-bikes, 3-year MACRS, working capital and a sale at the end
const WX = { capex: 30_000, revenue: 36_000, costs: 16_000, nwc: 3_000, sale: 4_000, n: 3, r: 0.10 };
const wxDep = CF.depreciation(WX.capex, { method: 3 });
const WXF = CF.projectCashFlows({ capex: WX.capex, years: WX.n, revenue: Array(WX.n).fill(WX.revenue), variable: Array(WX.n).fill(0), fixed: WX.costs,
  dep: wxDep.slice(0, WX.n), tax: TAX, nwc: Array(WX.n).fill(WX.nwc), salvage: WX.sale });
const wxF = WXF.fcf, wxNpv = npv(WX.r, wxF), wxIrr = irr(wxF);
const wxBook = WX.capex - wxDep.slice(0, WX.n).reduce((a, b) => a + b, 0);
// fn-6 Cold Brew with working capital at 25% of next year’s revenue
const NWC_ALT = 0.25;
const cbNpv = npv(r11, coldBrewFlows().fcf), cbNpvAlt = npv(r11, coldBrewFlows({ nwcShare: NWC_ALT }).fcf);
// fn-7 Ellacombe Bakeries (fictional): one year of a sandwich line, with items to keep and items to leave out
const EB = { revenue: 120_000, ingredients: 0.45, staff: 20_000, dep: 6_000, cannibal: 10_000, rent: 4_800, overhead: 8_000, interest: 3_000, study: 5_000, tax: 0.25 };
const ebEbit = EB.revenue * (1 - EB.ingredients) - EB.staff - EB.dep - EB.cannibal - EB.rent;
const ebFcf = ebEbit * (1 - EB.tax) + EB.dep;

// ---------------------------------------------------------------- module 2
// fn-8 Pellisant Foods (fictional): a WACC, then two packing lines of unequal lives
const PV = { E: 6_000_000, rE: 0.12, D: 2_000_000, rD: 0.064, tax: 0.25, S: { out: 80_000, cf: 34_000, n: 3 }, L: { out: 150_000, cf: 36_000, n: 6 } };
const pvW = CF.wacc({ E: PV.E, D: PV.D, rE: PV.rE, rD: PV.rD, tax: PV.tax }).wacc;
const pvNS = npv(pvW, [-PV.S.out, ...Array(PV.S.n).fill(PV.S.cf)]), pvNL = npv(pvW, [-PV.L.out, ...Array(PV.L.n).fill(PV.L.cf)]);
const pvES = CF.eaa(pvNS, pvW, PV.S.n), pvEL = CF.eaa(pvNL, pvW, PV.L.n);
claim(pvNL > pvNS && pvES > pvEL && pvES > 0 && pvEL > 0, 'the long line has the higher NPV, the short line the higher EAA');
// fn-9 Corrimer Labs (fictional): a WACC, then a budget where ranking by PI fails
const CL = { E: 3_000_000, rE: 0.12, D: 1_000_000, rD: 0.08, tax: 0.25, budget: 90_000, n: 5,
  P: [{ name: 'A', outlay: 50_000, cf: 15_500 }, { name: 'B', outlay: 45_000, cf: 13_800 }, { name: 'C', outlay: 45_000, cf: 13_700 }, { name: 'D', outlay: 25_000, cf: 7_200 }] };
const clW = CF.wacc({ E: CL.E, D: CL.D, rE: CL.rE, rD: CL.rD, tax: CL.tax }).wacc;
const clP = CL.P.map((p) => ({ ...p, npv: p.cf * af(clW, CL.n) - p.outlay, pi: p.cf * af(clW, CL.n) / p.outlay }));
const clR = ration(clP, CL.budget);
const clBest = clR.exact.map((x, i) => (x ? i : -1)).filter((i) => i >= 0);
claim(clBest.join() === '1,2' && clR.greedyNpv < clR.exactNpv && clR.greedy[0] && clP[0].pi === Math.max(...clP.map((p) => p.pi)), 'B and C are best; ranking by PI takes A first and does worse');
// fn-10 Wexmoor Vineyards (fictional): two plantings of the same cost, different timing
const WV = { r: 0.08, early: [-60_000, 34_000, 24_000, 12_000, 6_000], late: [-60_000, 6_000, 14_000, 26_000, 40_000] };
const wvX = crossover(WV.late, WV.early), wvIE = irr(WV.early), wvIL = irr(WV.late);
claim(wvX.length === 1 && wvIE > wvIL && wvX[0] > WV.r && npv(WV.r, WV.late) > npv(WV.r, WV.early), 'one crossover above 8%; the early planting has the higher IRR, the late one the higher NPV at 8%');
// fn-11 Ostrell Boatyard (fictional): winter storage, three scenarios
const GB = { capex: 48_000, n: 4, fixed: 40_000, unit: 80, tax: 0.25, r: 0.10,
  base: { q: 400, p: 300 }, pess: { q: 260, p: 270 }, opt: { q: 460, p: 310 }, prob: [0.25, 0.5, 0.25] };
const gbDep = GB.capex / GB.n;
const gbOcf = (s) => (s.q * (s.p - GB.unit) - GB.fixed - gbDep) * (1 - GB.tax) + gbDep;
const gbNpv = (s) => npv(GB.r, CF.projectCashFlows({ capex: GB.capex, years: GB.n, revenue: Array(GB.n).fill(s.q * s.p), variable: Array(GB.n).fill(s.q * GB.unit), fixed: GB.fixed, dep: Array(GB.n).fill(gbDep), tax: GB.tax }).fcf);
const gbE = GB.prob[0] * gbNpv(GB.pess) + GB.prob[1] * gbNpv(GB.base) + GB.prob[2] * gbNpv(GB.opt);
claim(gbNpv(GB.pess) < 0 && gbNpv(GB.base) > 0 && gbE > 0, 'the pessimistic NPV is negative, base and expected positive');
// fn-12 Cold Brew’s NPV break-even volume at 11%
const cbAt = (s) => npv(r11, coldBrewFlows({ cans: COLD_BREW.cans.map((n) => n * s) }).fcf);
const cbBE = CF.breakEven((v) => cbAt(v.s), { s: 1 }, 's', 0.3, 1);
claim(cbBE > 0.8 && cbBE < 0.9, 'Cold Brew breaks even at between 80% and 90% of forecast volume');

// ---------------------------------------------------------------- module 3
// fn-13 Lantern with two coffee peers (Harbour Street Foods dropped)
const TWO = PEERS.filter((p) => !/Harbour Street/.test(p.name));
const twoU = TWO.map((p) => CF.unleverBeta(p.beta, p.de, p.tax)), twoBu = (twoU[0] + twoU[1]) / 2;
const tDE = TARGET_DV / (1 - TARGET_DV), twoBl = CF.releverBeta(twoBu, tDE, TAX);
const twoRe = CF.capm({ rf: MARKET.rf, beta: twoBl, mrp: MARKET.mrp }) + MARKET.smallFirm;
const twoW = CF.wacc({ E: 1 - TARGET_DV, D: TARGET_DV, rE: twoRe, rD: DEBT.termLoan.rate, tax: TAX }).wacc;
const twoKiosk = npv(twoW, KIOSK_FLOWS);
claim(TWO.length === 2 && twoBu < DERIVED.betaU && twoW < DERIVED.targetWacc, 'dropping Harbour Street lowers the beta and the WACC');
// fn-14 a Brightcup Coffee bond (fictional, as the peer is)
// fn-14 a Brightcup Coffee bond (fictional, as the peer is), coupons twice a year
const BC = { years: 6, coupon: 0.05, price: 96.8 };
const bcY = CF.ytm({ price: BC.price, face: 100, coupon: BC.coupon, years: BC.years, freq: 2 });
// fn-15 Lantern’s cost of equity in one formula
const BU3 = rnd(DERIVED.betaU, 3);
const ceCells = { A1: 'Risk-free rate', B1: MARKET.rf, A2: 'Unlevered beta (peer average)', B2: BU3, A3: 'Target debt-to-equity', B3: tDE, A4: 'Tax rate', B4: TAX,
  A5: 'Market risk premium', B5: MARKET.mrp, A6: 'Extra premium', B6: MARKET.smallFirm, A8: 'Cost of equity' };
const ceVal = MARKET.rf + BU3 * (1 + (1 - TAX) * tDE) * MARKET.mrp + MARKET.smallFirm;
// fn-16 the solar panels at the target WACC and at a rate for low-risk savings
const LOWR = 0.07;
const solW = npv(DERIVED.targetWacc, SOLAR.flows), solL = npv(LOWR, SOLAR.flows), solIrr = irr(SOLAR.flows);
claim(solW < 0 && solL > 0 && solIrr > LOWR && solIrr < DERIVED.targetWacc, 'the panels lose value at the WACC and add it at 7%');
// fn-17 Hollimere Print (fictional, listed): the cost of debt from its bond price, then the WACC
const SP = { shares: 3_000_000, price: 12, face: 20_000_000, coupon: 0.05, years: 5, quote: 96, rE: 0.115, tax: 0.25 };
SP.E = SP.shares * SP.price; SP.D = SP.face * SP.quote / 100;
const spY = CF.ytm({ price: SP.quote, face: 100, coupon: SP.coupon, years: SP.years });
const spW = CF.wacc({ E: SP.E, D: SP.D, rE: SP.rE, rD: spY, tax: SP.tax }).wacc;
const spCoupon = CF.wacc({ E: SP.E, D: SP.D, rE: SP.rE, rD: SP.coupon, tax: SP.tax }).wacc;
const spFace = CF.wacc({ E: SP.E, D: SP.face, rE: SP.rE, rD: spY, tax: SP.tax }).wacc;

// ---------------------------------------------------------------- module 4
// fn-18 Ferrimond Instruments (fictional, listed): borrow permanently and buy back at the new price
const FI = { shares: 8_000_000, price: 25, D: 40_000_000, tax: 0.25 };
const fiVu = FI.shares * FI.price, fiP = (fiVu + FI.tax * FI.D) / FI.shares, fiLeft = FI.shares - FI.D / fiP;
// fn-20 Ambleforth Outdoor (fictional): MM with tax and the WACC
const AO = { Vu: 40_000_000, D: 16_000_000, rU: 0.10, rD: 0.06, tax: 0.25 };
const aoMM = CF.mm({ Vu: AO.Vu, D: AO.D, rU: AO.rU, rD: AO.rD, tax: AO.tax });
const aoNoT = (() => { const rE = AO.rU + (AO.rU - AO.rD) * aoMM.de; return (aoMM.E * rE + AO.D * AO.rD * (1 - AO.tax)) / aoMM.VL; })();
const aoCells = { A1: 'Value with no debt (V_U)', B1: AO.Vu, A2: 'Permanent debt (D)', B2: AO.D, A3: 'Unlevered cost of capital (r_U)', B3: AO.rU, A4: 'Pre-tax cost of debt', B4: AO.rD, A5: 'Tax rate', B5: AO.tax, A7: 'WACC' };
// fn-21 Glenholme Water (fictional, listed): a buyback at a premium to value
const GW = { shares: 6_000_000, value: 40, earnings: 18_000_000, interest: 300_000, cash: 12_000_000, offer: 44 };
const gwBought = GW.cash / GW.offer, gwLeft = GW.shares - gwBought, gwPrice = (GW.shares * GW.value - GW.cash) / gwLeft;
const gwEps0 = GW.earnings / GW.shares, gwEps1 = (GW.earnings - GW.interest) / gwLeft;
claim(gwPrice < GW.value && gwEps1 > gwEps0, 'after paying above value the price falls while EPS rises');
// fn-23 Calveran Cycles (fictional): AFN and the sustainable growth rate
const TC = { sales: 3_000_000, assets: 1_800_000, spont: 300_000, margin: 0.06, payout: 0.4, equity: 1_000_000, g: 0.20 };
const tcA = CF.afn({ sales0: TC.sales, growth: TC.g, assets: TC.assets, spontaneous: TC.spont, margin: TC.margin, payout: TC.payout });
const tcRoe = TC.margin * TC.sales / TC.equity, tcSgr = CF.sustainableGrowth(tcRoe, 1 - TC.payout);
claim(tcA.afn > 0 && tcSgr < TC.g, 'the plan needs outside money and outruns the sustainable growth rate');
// fn-24 Elvanstone Joinery (fictional): a cash budget with the line of credit at its limit
const EJ = { opening: 18_000, minimum: 10_000, limit: 25_000, rate: 0.01, receipts: [40_000, 35_000, 30_000], payments: [55_000, 52_000, 38_000] };
const ejB = CF.cashBudget({ opening: EJ.opening, receipts: EJ.receipts, payments: EJ.payments, minimum: EJ.minimum, rate: EJ.rate, limit: EJ.limit });
const ejShort = EJ.minimum - ejB.rows[2].end;
claim(!ejB.rows[0].breach && !ejB.rows[1].breach && ejB.rows[2].breach && ejB.rows[2].end > 0 && ejB.rows[2].debt === EJ.limit, 'the line reaches its limit in month 3 and cash ends below the minimum but above zero');
const MON = ['April', 'May', 'June'];

export const items = [
  // ================================================================ Module 1: Investment decisions
  {
    id: 'f05-fn-1', lesson: 'net-present-value', type: 'num', kind: 'numerical',
    prompt: `Elmscott Laundry (fictional) can lease a set of high-speed machines for ${EL.n} years. The lease costs ${money(EL.lease)} a year after tax, paid at the start of each year, the first payment today. The machines would save ${money(EL.saving)} a year after tax, arriving at the end of each year. Elmscott’s opportunity cost of capital is ${pc(EL.r, 0)}. Taking today as year 0, what is the lease’s NPV? Give whole dollars.`,
    answer: rnd(elNpv, 0),
    check: () => -60_000 * (1 + af(0.09, 3)) + 70_000 * af(0.09, 4),
    unit: '$', places: 0, tol: 2,
    wrong: [
      { value: rnd((EL.saving - EL.lease) * af(EL.r, EL.n), 0), say: 'That puts the lease payments at the end of each year, with the savings. They are paid at the start: years 0 to 3, not 1 to 4.' },
      { value: rnd(-EL.lease * (1 + af(EL.r, EL.n - 1)) + EL.saving * af(EL.r, EL.n) / (1 + EL.r), 0), say: 'That discounts the savings one year too many. On a timeline with today as year 0, the first saving arrives at year 1.' },
      { value: EL.n * (EL.saving - EL.lease), say: 'That adds the cash flows without discounting.' },
    ],
    solution: `Timeline: lease payments at years 0, 1, 2 and 3; savings at years 1 to 4. PV of the lease = ${fx(EL.lease)} × (1 + ${fx(af(EL.r, EL.n - 1), 6)}) ≈ ${money(EL.lease * (1 + af(EL.r, EL.n - 1)))}; PV of the savings = ${fx(EL.saving)} × ${fx(af(EL.r, EL.n), 6)} ≈ ${money(EL.saving * af(EL.r, EL.n))}. NPV ≈ ${money(elNpv)}: accept. Year by year the cash flows are ${elFlows.map((v) => fx(v)).join(', ')}. Treating the lease as paid at each year’s end would overstate the NPV at ${money((EL.saving - EL.lease) * af(EL.r, EL.n))}.`,
  },
  {
    id: 'f05-fn-2', lesson: 'net-present-value', type: 'mc', kind: 'conceptual',
    prompt: `A supplier offers Lantern the café kiosks, the electric cargo bike and the solar panels as one package, at the sum of their separate prices (${money(KIOSK.outlay)}, ${money(BIKE.outlay)} and ${money(SOLAR.outlay)}); Ana may also buy any of them on its own at those prices. At her ${pc(r11, 0)} working rate their NPVs are ${money(smNpv[0])}, ${money(smNpv[1])} and ${money(smNpv[2])}, and the package’s is ${money(pkg)}. Ignore the 2028 budget. What should she do?`,
    options: [
      `Buy the whole package, because its NPV of ${money(pkg)} is positive`,
      `Buy none of it, because the package includes a project that destroys value`,
      'Buy only the kiosks, the project with the highest NPV of the three',
      `Buy the kiosks and the bike, worth ${money(pkgGood)} together, and leave out the panels`,
    ],
    answer: 3,
    feedback: {
      0: `A positive total can hide a project that loses value. NPVs add, so the panels’ ${money(smNpv[2])} simply lowers the package’s value from ${money(pkgGood)} to ${money(pkg)}.`,
      1: 'The projects can be bought separately, so judge each on its own: two of them add value.',
      2: 'Without a budget limit, every independent project with a positive NPV adds value; the bike’s does too.',
    },
    solution: `NPVs are additive: the package is worth ${money(smNpv[0])} + ${money(smNpv[1])} − ${money(-smNpv[2])} = ${money(pkg)}. Because the parts can be bought separately, take each one whose NPV is positive: the kiosks and the bike add ${money(pkgGood)}, ${money(-smNpv[2])} more than the package. Bundling a negative-NPV project with good ones is a common way to get it approved. (Module 3 asks whether 11% suits low-risk savings like the panels’.)`,
  },
  {
    id: 'f05-fn-3', lesson: 'investment-criteria', type: 'formula', kind: 'applied',
    prompt: 'Vellicott Orchards (fictional) is planting a new block of cider apple trees. B2:B8 hold its cash flows for years 0 to 6; the outflow in year 3 is the cost of replanting trees lost to disease. The orchard pays the rate in B10 on money it borrows and earns the rate in B11 on cash it holds. In B13, write a formula for the block’s modified IRR.',
    sheet: { cells: { A1: 'Year', B1: 'Cash flow', ...Object.fromEntries(VO.flows.flatMap((v, i) => [[`A${2 + i}`, i], [`B${2 + i}`, v]])), A10: 'Borrowing rate', B10: VO.fin, A11: 'Rate earned on cash', B11: VO.re, A13: 'MIRR' }, fixed: ['A2:A8'] },
    cell: 'B13', view: 'A1:B13', widths: { A: 18, B: 13 }, formats: { B2: M, B3: M, B4: M, B5: M, B6: M, B7: M, B8: M, B10: '0.0%', B11: '0.0%', B13: '0.00%' },
    answer: '=MIRR(B2:B8,B10,B11)',
    require: ['MIRR'],
    wrong: [
      { formula: '=MIRR(B2:B8,B11,B10)', say: 'The rates are swapped. The outflows (today and the year-3 replanting) are financed at the borrowing rate, MIRR’s second argument; the inflows are reinvested at the rate earned on cash, the third.' },
      { formula: '=IRR(B2:B8)', say: 'That is the IRR, which in effect assumes each cash flow earns the IRR itself. The MIRR uses the two rates the orchard actually faces.' },
      { formula: '=MIRR(B3:B8,B10,B11)', say: 'The range must start with the year-0 planting cost in B2: MIRR takes the whole stream.' },
    ],
    solution: `<x>=MIRR(B2:B8,B10,B11)</x> ≈ ${pc(voMirr, 2)}, against an IRR of ${pc(irr(VO.flows), 2)}. MIRR discounts the outflows (years 0 and 3) to today at the borrowing rate, compounds the inflows to year 6 at the rate earned on cash, and finds the single rate linking the two. Because the replanting cost is discounted at ${pc(VO.fin, 0)}, the borrowing rate changes the answer: swapping the two rates gives ${pc(mirr(VO.flows, VO.re, VO.fin), 2)}.`,
  },
  {
    id: 'f05-fn-4', lesson: 'investment-criteria', type: 'steps', kind: 'numerical',
    prompt: `Saffrin Cinemas (fictional) can install a laser projector for ${money(-SC.flows[0])} today. It expects extra cash flows after tax of ${SC.flows.slice(1).map((v) => money(v)).join(', ')} at the end of years 1 to 5, and its cost of capital is ${pc(SC.r, 0)} (in B1 of the sheet). Assume cash arrives evenly within each year when you interpolate.`,
    steps: [
      {
        id: 'f05-fn-4-s1', type: 'num', prompt: 'How many years does the projector take to repay its cost, counting cash flows as they arrive? Give two decimal places.',
        answer: rnd(scPb, 2),
        check: () => 3 + (60_000 - 22_000 - 20_000 - 15_000) / 16_000,
        unit: 'years', places: 2, tol: 0.01,
        wrong: [{ value: 4, say: 'The cumulative cash flow turns positive during year 4: interpolate. After three years $3,000 is still to recover, a fraction 3,000 ÷ 16,000 of year 4.' }],
      },
      {
        id: 'f05-fn-4-s2', type: 'num', prompt: `How many years does it take if each cash flow is first discounted at ${pc(SC.r, 0)}? Give two decimal places.`,
        answer: rnd(scDpb, 2),
        check: () => { let c = -60_000; const f = [22_000, 20_000, 15_000, 16_000, 12_000]; for (let t = 1; t <= 5; t++) { const pv = f[t - 1] / 1.1 ** t; if (c + pv >= 0) return t - 1 + -c / pv; c += pv; } return NaN; },
        unit: 'years', places: 2, tol: 0.01,
        wrong: [{ value: rnd(scPb, 2), say: 'That is the payback on undiscounted cash flows. Discount each year’s cash flow at 10% first, then accumulate.' }],
      },
      {
        id: 'f05-fn-4-s3', type: 'formula',
        prompt: 'B4:G4 hold the cash flows for years 0 to 5. In B6, write a formula for the projector’s profitability index: the present value of the cash flows after today per dollar invested today.',
        sheet: { cells: scCells, fixed: ['B3:G3'] }, cell: 'B6', view: 'A1:G6', widths: { A: 18, B: 10, C: 9, D: 9, E: 9, F: 9, G: 9 },
        formats: { B1: '0%', B4: M, C4: M, D4: M, E4: M, F4: M, G4: M, B6: '0.000' },
        answer: '=NPV(B1,C4:G4)/-B4',
        alt: ['=-NPV(B1,C4:G4)/B4', '=1+(B4+NPV(B1,C4:G4))/-B4'],
        require: ['NPV'],
        wrong: [
          { formula: '=NPV(B1,B4:G4)/-B4', say: 'Excel’s NPV discounts its first value by a year, so including B4 discounts today’s outlay and leaves it inside the numerator. Take NPV of C4:G4 only.' },
          { formula: '=(B4+NPV(B1,C4:G4))/-B4', say: 'That is NPV ÷ outlay, which is the profitability index minus 1.' },
          { formula: '=SUM(C4:G4)/-B4', say: 'That ignores the time value of money. Use the present value of the cash flows: NPV(B1,C4:G4).' },
        ],
      },
    ],
    solution: `Payback: after three years ${fx(-SC.flows[0] - 22_000 - 20_000 - 15_000)} is still to recover, so ${fx(scPb, 2)} years. Discounted payback: the present values are ${SC.flows.slice(1).map((v, t) => fx(v / 1.1 ** (t + 1))).join(', ')}, and the cumulative total turns positive in year 5, at ${fx(scDpb, 2)} years. PI: <x>=NPV(B1,C4:G4)/-B4</x> ≈ ${fx(scPi, 3)}. A cinema with a three-year payback cutoff would reject the projector although its NPV, ${money(npv(SC.r, SC.flows))}, is positive and its PI above 1: payback ignores the later years that make it worthwhile.`,
  },
  {
    id: 'f05-fn-5', lesson: 'project-cash-flows', type: 'steps', kind: 'numerical',
    prompt: `Wrexcombe Hotels (fictional) is appraising a fleet of e-bikes for guests. The bikes cost ${money(WX.capex)} today, are 3-year MACRS property (${CF.MACRS[3].slice(0, 3).map((p) => fx(p, 2) + '%').join(', ')} in years 1 to 3) and will be sold for ${money(WX.sale)} at the end of year 3. They bring in ${money(WX.revenue)} a year and cost ${money(WX.costs)} a year to run, in cash. Spare parts and batteries tie up ${money(WX.nwc)} of working capital from today until the end of year 3. Tax is ${pc(TAX, 0)}, the hotel’s other profits absorb any loss, and the rate is ${pc(WX.r, 0)}. Year 0’s free cash flow is ${money(wxF[0])} and year 1’s is ${money(wxF[1], 2)}.`,
    steps: [
      {
        id: 'f05-fn-5-s1', type: 'num', prompt: 'How much free cash flow does the e-bike fleet generate in year 2, when working capital doesn’t change? Give dollars and cents.',
        answer: rnd(wxF[2], 2),
        check: () => { const d = 30_000 * 0.4445; return (36_000 - 16_000 - d) * 0.75 + d; },
        unit: '$', places: 2, tol: 0.5,
        wrong: [{ value: rnd((WX.revenue - WX.costs) * 0.75, 2), say: 'That leaves out the depreciation tax shield. Depreciation is deductible: OCF = (revenue − costs − depreciation) × (1 − T) + depreciation.' }],
      },
      {
        id: 'f05-fn-5-s2', type: 'num', prompt: 'What is year 3’s free cash flow, including the working capital recovered and the sale of the bikes? Give dollars and cents.',
        answer: rnd(wxF[3], 2),
        check: () => { const d = 30_000 * 0.1481, book = 30_000 * 0.0741; return (36_000 - 16_000 - d) * 0.75 + d + 3_000 + 4_000 - 0.25 * (4_000 - book); },
        unit: '$', places: 2, tol: 0.5,
        wrong: [
          { value: rnd(wxF[3] + TAX * (WX.sale - wxBook), 2), say: `That adds the whole sale price. The bikes sell for more than their tax book value (${fx(CF.MACRS[3][3], 2)}% of the cost is still undepreciated), and the gain is taxed.` },
          { value: rnd(wxF[3] - WX.nwc, 2), say: 'That leaves out the working capital, which comes back at the end of the project.' },
        ],
      },
      {
        id: 'f05-fn-5-s3', type: 'num', prompt: `What is the project’s NPV at ${pc(WX.r, 0)}? Give whole dollars.`,
        answer: rnd(wxNpv, 0),
        check: () => { const d = [0.3333, 0.4445, 0.1481].map((p) => 30_000 * p), o = d.map((x) => (20_000 - x) * 0.75 + x); return npv(0.10, [-33_000, o[0], o[1], o[2] + 3_000 + 4_000 - 0.25 * (4_000 - 30_000 * 0.0741)]); },
        unit: '$', places: 0, tol: 3,
      },
      {
        id: 'f05-fn-5-s4', type: 'num', prompt: 'At what discount rate would the e-bike fleet’s NPV be exactly zero? Give a percentage to one decimal place.',
        answer: rnd(wxIrr * 100, 1),
        check: () => { let lo = 0, hi = 2; for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (npv(m, wxF) > 0) lo = m; else hi = m; } return lo * 100; },
        unit: '%', places: 1, tol: 0.1,
      },
    ],
    solution: `Depreciation: ${wxDep.slice(0, 3).map((d) => fx(d)).join(', ')}; book value after year 3 = ${fx(wxBook)}. Year 2: EBIT = ${fx(WX.revenue)} − ${fx(WX.costs)} − ${fx(wxDep[1])} = ${fx(WXF.rows[2].ebit)}; OCF = ${fx(WXF.rows[2].ebit)} × 0.75 + ${fx(wxDep[1])} = ${money(wxF[2], 2)}. Year 3: OCF = ${fx(WXF.rows[3].ebit)} × 0.75 + ${fx(wxDep[2])} = ${money(WXF.rows[3].ocf, 2)}; working capital back +${fx(WX.nwc)}; after-tax sale = ${fx(WX.sale)} − 0.25 × (${fx(WX.sale)} − ${fx(wxBook)}) = ${money(WXF.rows[3].salvage, 2)}; FCF = ${money(wxF[3], 2)}. NPV at ${pc(WX.r, 0)} = ${fx(wxF[0])} + ${fx(wxF[1], 2)} ÷ 1.1 + ${fx(wxF[2], 2)} ÷ 1.1² + ${fx(wxF[3], 2)} ÷ 1.1³ ≈ ${money(wxNpv)}. IRR ≈ ${pc(wxIrr)}: well above 10%, so the NPV and IRR rules agree.`,
  },
  {
    id: 'f05-fn-6', lesson: 'project-cash-flows', type: 'num', kind: 'applied',
    prompt: `Cold Brew’s forecast holds working capital (inventory at the co-packer and receivables) equal to ${pc(COLD_BREW.nwcShare, 0)} of the next year’s revenue, built up from 1 April 2028 and recovered in full at the end of year 5. Grocers are pressing for longer credit, and Ana’s accountant thinks ${pc(NWC_ALT, 0)} is more realistic. With everything else in the case unchanged, by how much would Cold Brew’s NPV at ${pc(r11, 0)} fall? Give whole dollars.`,
    answer: rnd(cbNpv - cbNpvAlt, 0),
    check: () => {
      const rev = COLD_BREW.cans.map((n) => n * COLD_BREW.netPrice);
      const extra = [...rev.map((x) => 0.10 * x), 0];                            // extra working capital held at the end of years 0…5
      return extra.reduce((s, lv, t) => s + (lv - (t ? extra[t - 1] : 0)) / 1.11 ** t, 0);
    },
    unit: '$', places: 0, tol: 2,
    wrong: [
      { value: 0, say: 'All the working capital comes back at the end, but it is tied up for five years first. Money returned later is worth less than money spent now, so more working capital lowers the NPV.' },
      { value: rnd(0.10 * DERIVED.coldBrewRevenue[0], 0), say: 'That is only the extra working capital at the start. More is added as revenue grows, and all of it comes back in year 5: discount each change in working capital to today.' },
    ],
    solution: `Working capital at the end of each year 0 to 4 is a share of the next year’s revenue (${DERIVED.coldBrewRevenue.map((v) => money(v)).join(', ')}), and zero after year 5. Raising the share from 15% to 25% adds 10% of revenue: extra outflows of ${money(0.1 * DERIVED.coldBrewRevenue[0])} at year 0, then ${DERIVED.coldBrewRevenue.slice(1).map((v, i) => money(0.1 * (v - DERIVED.coldBrewRevenue[i]))).join(', ')} in years 1 to 4, and ${money(0.1 * DERIVED.coldBrewRevenue[4])} back in year 5. Discounted at 11%, these cost about ${money(cbNpv - cbNpvAlt)}: the NPV falls from ${money(cbNpv)} to ${money(cbNpvAlt)}. Working capital is recovered in money terms, not in value.`,
  },
  {
    id: 'f05-fn-7', lesson: 'project-cash-flows', type: 'num', kind: 'applied',
    prompt: `Ellacombe Bakeries (fictional) is appraising a sandwich line in its shops. For the line’s second year, when working capital doesn’t change, its analyst lists: extra sales ${money(EB.revenue)}; ingredients and packaging ${pc(EB.ingredients, 0)} of those sales; two extra staff ${money(EB.staff)}; depreciation on the chillers ${money(EB.dep)}; lost margin, before tax, on pastries that sandwich buyers would otherwise have bought ${money(EB.cannibal)}; rent of ${money(EB.rent)} a year that Ellacombe would get by letting the back room the line uses; a share of head-office costs, which don’t change, ${money(EB.overhead)}; interest on the loan for the chillers ${money(EB.interest)}; and the ${money(EB.study)} recipe study paid last year. Tax is ${pc(EB.tax, 0)}. What is the line’s free cash flow in year 2? Give whole dollars.`,
    answer: rnd(ebFcf, 0),
    check: () => { const ebit = 120_000 * 0.55 - 20_000 - 6_000 - 10_000 - 4_800; return ebit * 0.75 + 6_000; },
    unit: '$', places: 0, tol: 1,
    wrong: [
      { value: rnd(ebFcf - (EB.overhead + EB.interest) * (1 - EB.tax), 0), say: 'That deducts the head-office share and the interest. Head-office costs don’t change with the line, so they aren’t incremental; interest is a financing cost, reflected in the discount rate.' },
      { value: rnd(ebFcf + (EB.cannibal + EB.rent) * (1 - EB.tax), 0), say: 'That leaves out the lost pastry margin and the forgone rent. Both are real effects of taking the line: a side effect and an opportunity cost.' },
      { value: rnd(ebFcf - EB.dep, 0), say: 'Depreciation is deducted to find the tax, then added back: it isn’t a cash payment.' },
      { value: rnd(ebFcf - EB.study, 0), say: 'The recipe study was paid last year whatever Ellacombe decides now: a sunk cost.' },
    ],
    solution: `Keep: sales ${fx(EB.revenue)}, ingredients −${fx(EB.revenue * EB.ingredients)}, staff −${fx(EB.staff)}, depreciation −${fx(EB.dep)} (for tax), lost pastry margin −${fx(EB.cannibal)} (a side effect), forgone rent −${fx(EB.rent)} (an opportunity cost). EBIT = ${fx(ebEbit)}; after tax ${fx(ebEbit * (1 - EB.tax))}; add back depreciation: FCF = ${money(ebFcf)}. Leave out the head-office share (not incremental), the interest (financing enters through the discount rate) and the recipe study (sunk).`,
  },

  // ================================================================ Module 2: Analysing projects
  {
    id: 'f05-fn-8', lesson: 'choosing-between-projects', type: 'steps', kind: 'applied',
    prompt: `Pellisant Foods (fictional, listed) has equity worth ${money(PV.E)} with a cost of ${pc(PV.rE, 0)}, and debt worth ${money(PV.D)} costing ${pc(PV.rD)} before tax; tax is ${pc(PV.tax, 0)}. It must choose one of two packing lines of average risk for the firm, and will replace whichever it picks on the same terms when it wears out. Line S costs ${money(PV.S.out)} and returns ${money(PV.S.cf)} a year for ${PV.S.n} years; line L costs ${money(PV.L.out)} and returns ${money(PV.L.cf)} a year for ${PV.L.n} years (year-end cash flows, after tax, no resale).`,
    steps: [
      {
        id: 'f05-fn-8-s1', type: 'num', prompt: 'Weighting by market values, what does Pellisant’s capital cost on average after tax? Give a percentage to two decimal places.',
        answer: rnd(pvW * 100, 2),
        check: () => (6 * 12 + 2 * 6.4 * 0.75) / 8,
        unit: '%', places: 2, tol: 0.01,
        wrong: [{ value: rnd((PV.E * PV.rE + PV.D * PV.rD) / (PV.E + PV.D) * 100, 2), say: 'That uses the pre-tax cost of debt. Interest is deductible, so weight 6.4% × 0.75.' }],
      },
      {
        id: 'f05-fn-8-s2', type: 'num', prompt: 'What is line S’s equivalent annual annuity at the WACC? Give whole dollars.',
        answer: rnd(pvES, 0),
        check: () => { const w = 0.102; return PV.S.cf - PV.S.out * w / (1 - (1 + w) ** -3); },
        unit: '$', places: 0, tol: 3,
      },
      {
        id: 'f05-fn-8-s3', type: 'num', prompt: 'What is line L’s equivalent annual annuity at the WACC? Give whole dollars.',
        answer: rnd(pvEL, 0),
        check: () => { const w = 0.102; return PV.L.cf - PV.L.out * w / (1 - (1 + w) ** -6); },
        unit: '$', places: 0, tol: 3,
      },
      {
        id: 'f05-fn-8-s4', type: 'mc', prompt: 'Which line should Pellisant choose?',
        options: [
          'Line L, because over its own life it adds more NPV than line S',
          'Line S, because it adds more value a year when each line is repeated',
          'Line L, because it needs replacing only half as often as line S',
          'Either, because both have a positive NPV at the WACC',
        ],
        answer: 1,
        feedback: {
          0: 'Line L’s NPV covers six years, line S’s only three. To compare them, put both on the same footing: their equivalent annual annuities, or line S twice against line L once.',
          2: 'Replacing less often is already in the cash flows; what matters is the value added per year.',
          3: 'They are mutually exclusive: both add value, but only one can be bought, so choose the one that adds more.',
        },
      },
    ],
    solution: `WACC = (${fx(PV.E / 1e6)} × ${pc(PV.rE, 0)} + ${fx(PV.D / 1e6)} × ${pc(PV.rD)} × 0.75) ÷ ${fx((PV.E + PV.D) / 1e6)} = ${pc(pvW, 2)}. NPVs at ${pc(pvW, 2)}: S ≈ ${money(pvNS)} over three years, L ≈ ${money(pvNL)} over six. EAA = NPV ÷ annuity factor: S ≈ ${money(pvES)} a year, L ≈ ${money(pvEL)} a year. Line S wins: repeated, it adds more each year (over six years, S twice is worth ${money(pvNS + pvNS / (1 + pvW) ** 3)}). The WACC is the right rate only because the lines are of average risk for the firm, and the EAA comparison assumes each line can be replaced on the same terms.`,
  },
  {
    id: 'f05-fn-9', lesson: 'choosing-between-projects', type: 'steps', kind: 'applied',
    prompt: `Corrimer Labs (fictional) has equity worth ${money(CL.E)} costing ${pc(CL.rE, 0)} and debt worth ${money(CL.D)} costing ${pc(CL.rD, 0)} before tax; tax is ${pc(CL.tax, 0)}. This year it will spend at most ${money(CL.budget)} on four independent projects of average risk, none of which can be split. Each returns a level after-tax cash flow at the end of each of the next ${CL.n} years: ${CL.P.map((p) => `${p.name} costs ${money(p.outlay)} and returns ${money(p.cf)} a year`).join('; ')}.`,
    steps: [
      {
        id: 'f05-fn-9-s1', type: 'num', prompt: 'At market values, what is Corrimer’s after-tax average cost of capital? Give a percentage to two decimal places.',
        answer: rnd(clW * 100, 2),
        check: () => (3 * 12 + 1 * 8 * 0.75) / 4,
        unit: '%', places: 2, tol: 0.01,
      },
      {
        id: 'f05-fn-9-s2', type: 'multi', prompt: 'Discounting at that rate, which projects should Corrimer fund? Select all that apply.',
        options: CL.P.map((p) => `Project ${p.name}`),
        answer: clBest,
        feedback: { 0: 'A has the highest profitability index, but once it is chosen only $40,000 is left, too little for B or C: the PI ranking leaves money idle.', 3: 'D adds value, but taking it would mean dropping B or C, each of which adds more.' },
      },
      {
        id: 'f05-fn-9-s3', type: 'num', prompt: 'Measured in today’s dollars, how much value does Corrimer create by funding the projects you chose? Give whole dollars.',
        answer: rnd(clR.exactNpv, 0),
        check: () => { const w = 0.105, a = (1 - (1 + w) ** -5) / w; return (13_800 + 13_700) * a - 90_000; },
        unit: '$', places: 0, tol: 3,
        wrong: [{ value: rnd(clR.greedyNpv, 0), say: 'That is what ranking by PI gives: A, then D, since B and C no longer fit. B and C together use the whole budget and add more.' }],
      },
    ],
    solution: `WACC = (3 × 12% + 1 × 8% × 0.75) ÷ 4 = ${pc(clW, 2)}; the annuity factor for ${CL.n} years is ${fx(af(clW, CL.n), 4)}. NPVs and PIs: ${clP.map((p) => `${p.name} ${money(p.npv)} (PI ${fx(p.pi, 3)})`).join('; ')}. Ranking by PI takes A first; only ${money(CL.budget - CL.P[0].outlay)} is left, so then only D fits: ${money(clR.greedyNpv)}. Checking every combination that fits, B and C use the whole ${money(CL.budget)} and add ${money(clR.exactNpv)}. With indivisible projects the PI ranking can leave money idle; compare the sets that fit.`,
  },
  {
    id: 'f05-fn-10', lesson: 'choosing-between-projects', type: 'steps', kind: 'conceptual',
    prompt: `Wexmoor Vineyards (fictional) can plant one of two slopes, not both, each costing ${money(-WV.early[0])} today. Early-ripening vines return ${WV.early.slice(1).map((v) => money(v)).join(', ')} at the end of years 1 to 4 (IRR ${pc(wvIE)}); late-ripening vines return ${WV.late.slice(1).map((v) => money(v)).join(', ')} (IRR ${pc(wvIL)}). Wexmoor’s cost of capital is ${pc(WV.r, 0)}.`,
    steps: [
      {
        id: 'f05-fn-10-s1', type: 'num', prompt: 'At what discount rate do the two plantings have the same NPV? Give a percentage to one decimal place.',
        answer: rnd(wvX[0] * 100, 1),
        check: () => { const d = WV.late.map((v, t) => v - WV.early[t]); let lo = 0, hi = 1; for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (npv(m, d) > 0) lo = m; else hi = m; } return lo * 100; },
        unit: '%', places: 1, tol: 0.1,
        wrong: [{ value: rnd((wvIE - wvIL) * 100, 1), say: 'Subtracting the IRRs doesn’t give the rate where the NPVs are equal. Subtract the cash flows year by year and find the IRR of the difference.' }],
      },
      {
        id: 'f05-fn-10-s2', type: 'mc', prompt: 'Which slope should Wexmoor plant?',
        options: [
          'The early-ripening vines, because their IRR is higher',
          'The late-ripening vines, because at Wexmoor’s cost of capital their NPV is higher',
          'The early-ripening vines, because cash that comes back sooner is always worth more',
          'Either, because both IRRs are above the cost of capital',
        ],
        answer: 1,
        feedback: {
          0: 'For mutually exclusive projects of different timing the IRRs can rank them wrongly. At rates below the crossover, the later, larger cash flows are worth more.',
          2: 'Early cash is worth more per dollar, but the late vines pay many more dollars. At 8% the extra later cash outweighs the delay.',
          3: 'Both pass on their own, but only one slope can be planted: choose the higher NPV at the cost of capital.',
        },
      },
    ],
    solution: `Late minus early: ${WV.late.map((v, t) => fx(v - WV.early[t])).join(', ')}; its IRR, the crossover rate, is about ${pc(wvX[0])}. Wexmoor’s ${pc(WV.r, 0)} is below it, so the late vines have the higher NPV (${money(npv(WV.r, WV.late))} against ${money(npv(WV.r, WV.early))}), although their own IRR is lower. Above ${pc(wvX[0])} the early vines would win.`,
  },
  {
    id: 'f05-fn-11', lesson: 'project-risk', type: 'steps', kind: 'applied',
    prompt: `Ostrell Boatyard (fictional) is considering a winter-storage shed: ${money(GB.capex)} today, depreciated straight line over ${GB.n} years to zero and worth nothing at the end. Each boat stored costs ${money(GB.unit)} to handle; fixed cash costs are ${money(GB.fixed)} a year. Tax is ${pc(GB.tax, 0)} (the yard’s other profits absorb any loss) and the rate ${pc(GB.r, 0)}. In the base case it stores ${GB.base.q} boats a year at ${money(GB.base.p)} (NPV ${money(gbNpv(GB.base))}); in the optimistic case ${GB.opt.q} boats at ${money(GB.opt.p)} (NPV ${money(gbNpv(GB.opt))}). In the pessimistic case a new marina nearby takes customers and forces prices down: ${GB.pess.q} boats at ${money(GB.pess.p)}.`,
    steps: [
      {
        id: 'f05-fn-11-s1', type: 'num', prompt: 'What is the pessimistic case’s operating cash flow each year? Give whole dollars.',
        answer: rnd(gbOcf(GB.pess), 0),
        check: () => { const ebit = 260 * (270 - 80) - 40_000 - 12_000; return ebit * 0.75 + 12_000; },
        unit: '$', places: 0, tol: 1,
        wrong: [{ value: rnd(GB.pess.q * (GB.pess.p - GB.unit) - GB.fixed, 0), say: 'That is the pre-tax cash margin, and it ignores the depreciation tax shield. EBIT = 260 × 190 − 40,000 − 12,000 is negative, so the loss saves tax: OCF = EBIT × 0.75 + 12,000.' }],
      },
      {
        id: 'f05-fn-11-s2', type: 'num', prompt: 'What is the pessimistic case’s NPV? Give whole dollars, with a minus sign if negative.',
        answer: rnd(gbNpv(GB.pess), 0),
        check: () => gbOcf(GB.pess) * (1 - 1.1 ** -4) / 0.1 - 48_000,
        unit: '$', places: 0, tol: 2,
      },
      {
        id: 'f05-fn-11-s3', type: 'num', prompt: `With probabilities of ${pc(GB.prob[0], 0)} pessimistic, ${pc(GB.prob[1], 0)} base and ${pc(GB.prob[2], 0)} optimistic, what is the expected NPV? Give whole dollars.`,
        answer: rnd(gbE, 0),
        check: () => 0.25 * (gbOcf(GB.pess) * af(0.1, 4) - 48_000) + 0.5 * (gbOcf(GB.base) * af(0.1, 4) - 48_000) + 0.25 * (gbOcf(GB.opt) * af(0.1, 4) - 48_000),
        unit: '$', places: 0, tol: 3,
        wrong: [{ value: rnd(gbNpv(GB.base), 0), say: 'That is the base case’s NPV. The expected NPV weights all three scenarios by their probabilities.' }],
      },
    ],
    solution: `Pessimistic: EBIT = ${GB.pess.q} × (${GB.pess.p} − ${GB.unit}) − ${fx(GB.fixed)} − ${fx(gbDep)} = ${fx(GB.pess.q * (GB.pess.p - GB.unit) - GB.fixed - gbDep)}; OCF = ${fx(GB.pess.q * (GB.pess.p - GB.unit) - GB.fixed - gbDep)} × 0.75 + ${fx(gbDep)} = ${money(gbOcf(GB.pess))} (the loss saves tax). NPV = ${fx(gbOcf(GB.pess))} × ${fx(af(GB.r, GB.n), 4)} − ${fx(GB.capex)} ≈ ${money(gbNpv(GB.pess))}. Expected NPV = 0.25 × (${fx(gbNpv(GB.pess))}) + 0.5 × ${fx(gbNpv(GB.base))} + 0.25 × ${fx(gbNpv(GB.opt))} ≈ ${money(gbE)}. The scenarios move volume and price together, as a rival marina would; the expected NPV is positive, but there is a real chance of losing about ${money(-gbNpv(GB.pess))}.`,
  },
  {
    id: 'f05-fn-12', lesson: 'project-risk', type: 'mc', kind: 'conceptual',
    prompt: `Cold Brew’s NPV at 11% is zero at about ${pc(cbBE, 0)} of the forecast volume each year, other inputs held at the forecast. Ana’s accountant says: “So there’s a chance of about ${pc(cbBE, 0)} that Cold Brew adds value.” What is the soundest response?`,
    options: [
      `He is right: a break-even at ${pc(cbBE, 0)} of forecast volume means a chance of about ${pc(cbBE, 0)} of reaching it`,
      `The chance is nearer ${pc(1 - cbBE, 0)}: that is how far volume can fall short of the forecast before NPV turns negative`,
      `${pc(cbBE, 0)} of forecast volume is a threshold, not a probability; the chance of reaching it depends on how uncertain volume is`,
      'Reject Cold Brew: the margin above break-even is too thin',
    ],
    answer: 2,
    feedback: {
      0: 'A break-even point is a threshold, not a probability. To turn it into a chance you need a distribution for volume (from scenarios or a simulation), which the break-even calculation doesn’t contain.',
      1: `The margin of safety (about ${pc(1 - cbBE, 0)}) is a distance, not a chance. Whether volume is likely to fall that far depends on how uncertain the forecast is.`,
      3: 'Break-even says how much room there is, not whether to accept. The forecast NPV is positive; a narrow margin is a reason to test demand (a pilot, say) or limit the downside, not an automatic rejection.',
    },
    solution: `The NPV break-even answers “how far can volume fall before NPV is zero?”: to about ${pc(cbBE, 0)} of forecast, with price, costs and the rate at their forecast values. It gives no probability. If price or cost per can also fall short when volume does, the true threshold is higher. To speak of chances Ana needs a distribution of volume (scenarios with probabilities, or a Monte Carlo simulation with sensibly correlated inputs).`,
  },

  // ================================================================ Module 3: The cost of capital
  {
    id: 'f05-fn-13', lesson: 'cost-of-debt-and-equity', type: 'steps', kind: 'numerical',
    prompt: `Ana decides that Harbour Street Foods is more a food manufacturer than a coffee business, and drops it from Lantern’s peer set. That leaves ${TWO.map((p) => `${p.name} (equity beta ${fx(p.beta, 2)}, D/E ${fx(p.de, 2)})`).join(' and ')}, both taxed at ${pc(TAX, 0)}. She keeps everything else: a ${pc(TARGET_DV, 0)} target debt share, a ${pc(MARKET.rf)} risk-free rate, a ${pc(MARKET.mrp)} market risk premium, her ${pc(MARKET.smallFirm, 0)} extra premium and Coastline’s ${pc(DEBT.termLoan.rate)} for debt. The café ordering kiosks cost ${money(KIOSK.outlay)} and would save ${money(KIOSK.saving)} a year after tax for ${KIOSK.life} years (year-end, no resale); their savings come from the cafés, so they are as risky as Lantern’s business on average.`,
    steps: [
      {
        id: 'f05-fn-13-s1', type: 'num', prompt: 'What is the two peers’ average unlevered beta? Give three decimal places.',
        answer: rnd(twoBu, 3),
        check: () => (1.05 / (1 + 0.75 * 0.30) + 0.90 / (1 + 0.75 * 0.15)) / 2,
        unit: '', places: 3, tol: 0.001,
        wrong: [{ value: rnd((TWO[0].beta + TWO[1].beta) / 2, 3), say: 'That averages the equity betas, which include each peer’s own debt. Unlever each first: β_U = β_L ÷ (1 + (1 − T) D/E).' }],
      },
      {
        id: 'f05-fn-13-s2', type: 'num', prompt: 'What is Lantern’s cost of equity, including Ana’s extra premium? Give a percentage to two decimal places.',
        answer: rnd(twoRe * 100, 2),
        check: () => { const bu = (1.05 / 1.225 + 0.9 / 1.1125) / 2; return (0.042 + bu * (1 + 0.75 * 0.25) * 0.055 + 0.03) * 100; },
        unit: '%', places: 2, tol: 0.02,
        wrong: [{ value: rnd((CF.capm({ rf: MARKET.rf, beta: twoBu, mrp: MARKET.mrp }) + MARKET.smallFirm) * 100, 2), say: `That uses the unlevered beta. Lantern will carry ${pc(TARGET_DV, 0)} debt (D/E = ${fx(tDE, 2)}), so relever: β_L = β_U × (1 + 0.75 × ${fx(tDE, 2)}).` }],
      },
      {
        id: 'f05-fn-13-s3', type: 'num', prompt: 'What is Lantern’s WACC at its target debt share? Give a percentage to two decimal places.',
        answer: rnd(twoW * 100, 2),
        check: () => 0.8 * twoRe * 100 + 0.2 * 7.5 * 0.75,
        unit: '%', places: 2, tol: 0.02,
      },
      {
        id: 'f05-fn-13-s4', type: 'num', prompt: 'What is the kiosks’ NPV at that WACC? Give whole dollars.',
        answer: rnd(twoKiosk, 0),
        check: () => 5_200 * (1 - (1 + twoW) ** -4) / twoW - 14_000,
        unit: '$', places: 0, tol: 6,
      },
    ],
    solution: `Unlevered betas: ${TWO.map((p, i) => `${p.name} ${fx(p.beta, 2)} ÷ (1 + 0.75 × ${fx(p.de, 2)}) = ${fx(twoU[i], 4)}`).join('; ')}; average ${fx(twoBu, 4)}. Relevered at D/E = ${fx(tDE, 2)}: ${fx(twoBu, 4)} × ${fx(1 + 0.75 * tDE, 4)} = ${fx(twoBl, 4)}. Cost of equity = ${pc(MARKET.rf)} + ${fx(twoBl, 4)} × ${pc(MARKET.mrp)} + ${pc(MARKET.smallFirm, 0)} = ${pc(twoRe, 2)}. WACC = 0.8 × ${pc(twoRe, 2)} + 0.2 × ${pc(DEBT.termLoan.rate)} × 0.75 = ${pc(twoW, 2)}, against ${pc(DERIVED.targetWacc, 2)} with all three peers. The kiosks’ NPV at ${pc(twoW, 2)} = ${fx(KIOSK.saving)} × ${fx(af(twoW, KIOSK.life), 4)} − ${fx(KIOSK.outlay)} ≈ ${money(twoKiosk)}. The firm’s WACC suits the kiosks because their risk is the cafés’ risk; a riskier venture such as Cold Brew needs its own rate from pure-play peers (the WACC lesson’s approach).`,
  },
  {
    id: 'f05-fn-14', lesson: 'cost-of-debt-and-equity', type: 'num', kind: 'numerical',
    prompt: `Brightcup Coffee, one of Lantern’s fictional listed peers, has bonds maturing in ${BC.years} years with a ${pc(BC.coupon, 0)} annual coupon, paid in two halves of $${fx(BC.coupon * 50, 2)} per $100 of face value each year. They trade at $${fx(BC.price, 2)} per $100. Brightcup pays tax at ${pc(PEERS[0].tax, 0)}. Quoting the yield as twice the half-year rate, what is Brightcup’s after-tax cost of debt? Give a percentage to two decimal places.`,
    answer: rnd(bcY * (1 - PEERS[0].tax) * 100, 2),
    check: () => {
      const pv = (h) => { let s = 0; for (let k = 1; k <= 12; k++) s += 2.5 / (1 + h) ** k; return s + 100 / (1 + h) ** 12; };
      let lo = 0, hi = 0.2; for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (pv(m) > 96.8) lo = m; else hi = m; } return 2 * lo * 0.75 * 100;
    },
    unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(BC.coupon * 0.75 * 100, 2), say: 'That uses the coupon rate. The bonds trade below $100, so lenders now require more than the coupon: solve for the yield to maturity at today’s price.' },
      { value: rnd(bcY * 100, 2), say: 'That is the yield before tax. Interest is deductible, so the cost to Brightcup is the yield × (1 − 0.25).' },
      { value: rnd(bcY / 2 * 0.75 * 100, 2), say: 'That is the half-year yield after tax. Quote it as an annual rate: twice the half-year rate.' },
    ],
    solution: `Work in half-years: 12 coupons of $${fx(BC.coupon * 50, 2)} and $100 at the end. The half-year yield h solves 2.5 × [1 − (1 + h)⁻¹²] ÷ h + 100 ÷ (1 + h)¹² = ${fx(BC.price, 2)} (Excel: =RATE(12,2.5,−${fx(BC.price, 2)},100)): h ≈ ${pc(bcY / 2, 3)}, so the yield is about ${pc(bcY, 2)} a year, above the 5% coupon because the bonds trade below face. After tax: ${pc(bcY, 2)} × 0.75 ≈ ${pc(bcY * 0.75, 2)}.`,
  },
  {
    id: 'f05-fn-15', lesson: 'cost-of-debt-and-equity', type: 'formula', kind: 'numerical',
    prompt: 'B1:B6 hold the inputs for Lantern’s cost of equity: the risk-free rate, the peers’ average unlevered beta, Lantern’s target debt-to-equity ratio, the tax rate, the market risk premium and Ana’s extra premium. In B8, write one formula for the cost of equity, relevering the beta within the formula.',
    sheet: { cells: ceCells, vary: { B3: [0.4286, 0.6667] } },
    cell: 'B8', view: 'A1:B8', widths: { A: 30, B: 10 }, formats: { B1: '0.0%', B2: '0.000', B3: '0.00', B4: '0%', B5: '0.0%', B6: '0.0%', B8: '0.00%' },
    answer: '=B1+B2*(1+(1-B4)*B3)*B5+B6',
    alt: ['=B1+B2*(1+B3*(1-B4))*B5+B6', '=B6+B1+B5*B2*(1+(1-B4)*B3)'],
    wrong: [
      { formula: '=B1+B2*B5+B6', say: 'That uses the unlevered beta. Lantern’s shareholders bear the risk of its debt too: relever with β_U × (1 + (1 − T) × D/E).' },
      { formula: '=B1+B2*(1+B3)*B5+B6', say: 'That relevers without tax. Interest is deductible, so debt adds β_U × (1 − T) × D/E, not β_U × D/E.' },
      { formula: '=B1+B2*(1+(1-B4)*B3)*B5', say: 'That is the CAPM cost alone. Ana adds her extra premium in B6 on top.' },
    ],
    solution: `<x>=B1+B2*(1+(1-B4)*B3)*B5+B6</x>: relever the unlevered beta at the target D/E, β_L = ${fx(BU3, 3)} × (1 + 0.75 × ${fx(tDE, 2)}) = ${fx(BU3 * (1 + 0.75 * tDE), 4)}, then ${pc(MARKET.rf)} + β_L × ${pc(MARKET.mrp)} + ${pc(MARKET.smallFirm, 0)} ≈ ${pc(ceVal, 2)}. A higher debt-to-equity ratio in B3 raises the cost of equity, as module 4’s Modigliani–Miller argument predicts.`,
  },
  {
    id: 'f05-fn-16', lesson: 'weighted-average-cost-of-capital', type: 'mc', kind: 'conceptual',
    prompt: `At Lantern’s WACC of ${pc(DERIVED.targetWacc, 2)}, the solar panels (${money(SOLAR.outlay)} for ${money(SOLAR.saving)} a year of savings for ${SOLAR.life} years) have an NPV of ${money(solW)} and an IRR of ${pc(solIrr)}. The savings depend only on sunshine and the power tariff, and are far steadier than the cafés’ profits. Suppose investors would accept about ${pc(LOWR, 0)} on cash flows this safe (an assumption for this question). What should Ana conclude?`,
    options: [
      `Reject the panels: their IRR of ${pc(solIrr)} is below the WACC, the hurdle every Lantern project must clear`,
      `Buy the panels only if Coastline lends the whole cost, because debt at ${pc(DEBT.termLoan.rate)} is cheaper than the WACC`,
      `The WACC is too high a rate for them; at ${pc(LOWR, 0)} their NPV is about ${money(solL)}, so they add value`,
      `Keep the WACC but shorten the panels’ life in the forecast, to be on the safe side`,
    ],
    answer: 2,
    feedback: {
      0: 'The WACC is the rate for projects as risky as Lantern’s average business. Savings this steady deserve a lower rate, and judged at it the panels add value.',
      1: 'How the panels are paid for doesn’t change their risk or their rate. Cheap debt is available for any project and raises the risk borne by the shareholders.',
      3: 'Changing the cash flows to make up for a wrong rate mixes two adjustments and makes the forecast less honest. Put the risk in the rate, at the level the savings deserve, and keep the forecast unbiased.',
    },
    solution: `A firm’s WACC suits projects of the firm’s average risk. The panels’ savings are much less risky than cafés and catering, so their rate should be lower. At ${pc(LOWR, 0)} their NPV is ${fx(SOLAR.saving)} × ${fx(af(LOWR, SOLAR.life), 4)} − ${fx(SOLAR.outlay)} ≈ ${money(solL)}, and their IRR of ${pc(solIrr)} beats ${pc(LOWR, 0)}. Using the WACC for every project rejects safe projects like this and accepts risky ones that should fail; the hard part is estimating the right rate, here an assumption.`,
  },
  {
    id: 'f05-fn-17', lesson: 'weighted-average-cost-of-capital', type: 'num', kind: 'applied',
    prompt: `Hollimere Print (fictional, listed) has ${fx(SP.shares)} shares at ${money(SP.price)}. Its only debt is a bond issue with a face value of ${money(SP.face)}, a ${pc(SP.coupon, 0)} coupon paid once a year and ${SP.years} years to maturity, trading at ${fx(SP.quote)} per 100 of face value. Its cost of equity is ${pc(SP.rE)} and its tax rate ${pc(SP.tax, 0)}. What is Hollimere’s WACC? Give a percentage to two decimal places.`,
    answer: rnd(spW * 100, 2),
    check: () => {
      const pv = (y) => { let s = 0; for (let t = 1; t <= 5; t++) s += 5 / (1 + y) ** t; return s + 100 / (1 + y) ** 5; };
      let lo = 0, hi = 0.2; for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (pv(m) > 96) lo = m; else hi = m; }
      const E = 36e6, D = 19.2e6; return (E * 0.115 + D * lo * 0.75) / (E + D) * 100;
    },
    unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(spCoupon * 100, 2), say: 'That uses the 5% coupon as the cost of debt. The bond trades below face, so lenders now require more: solve for the yield to maturity at a price of 96.' },
      { value: rnd(spFace * 100, 2), say: 'That weights the debt at its face value. Use what the bonds are worth today: 96% of face.' },
    ],
    solution: `Cost of debt: the yield y with 5 × [1 − (1 + y)⁻⁵] ÷ y + 100 ÷ (1 + y)⁵ = 96, about ${pc(spY, 2)} (=RATE(5,5,−96,100)). Market values: E = ${fx(SP.shares)} × ${money(SP.price)} = ${money(SP.E)}; D = 0.96 × ${money(SP.face)} = ${money(SP.D)}. WACC = (${fx(SP.E / 1e6, 1)} × ${pc(SP.rE)} + ${fx(SP.D / 1e6, 1)} × ${pc(spY, 2)} × 0.75) ÷ ${fx((SP.E + SP.D) / 1e6, 1)} ≈ ${pc(spW, 2)}.`,
  },

  // ================================================================ Module 4: Financing and payout
  {
    id: 'f05-fn-18', lesson: 'capital-structure', type: 'num', kind: 'applied',
    prompt: `Ferrimond Instruments (fictional, listed) has ${fx(FI.shares)} shares at ${money(FI.price)} and no debt, and pays corporate tax at ${pc(FI.tax, 0)}. It announces that it will borrow ${money(FI.D)}, keep the debt permanently, and use all of it to buy back shares at the market price after the announcement. Under Modigliani and Miller with corporate tax, and ignoring costs of financial distress, how many shares will be left after the buyback? Give a whole number.`,
    answer: rnd(fiLeft, 0),
    check: () => { const p = (200e6 + 0.25 * 40e6) / 8e6; return 8e6 - 40e6 / p; },
    unit: 'shares', places: 0, tol: 2,
    wrong: [
      { value: FI.shares - FI.D / FI.price, say: 'That buys at $25, the price before the announcement. Once investors learn of the permanent debt, the tax shields’ value, T × D, is in the price, so the buyback happens at the higher price.' },
      { value: rnd(FI.D / fiP, 0), say: 'That is the number of shares bought back. Subtract it from the 8,000,000 in issue.' },
    ],
    solution: `V_U = ${fx(FI.shares)} × ${money(FI.price)} = ${money(fiVu)}. The permanent debt adds T × D = ${money(FI.tax * FI.D)}, so the announcement lifts the price to (${fx(fiVu)} + ${fx(FI.tax * FI.D)}) ÷ ${fx(FI.shares)} = ${money(fiP, 2)}. The buyback takes ${fx(FI.D)} ÷ ${fx(fiP, 2)} ≈ ${fx(FI.D / fiP)} shares, leaving about ${fx(fiLeft)}. Check: equity = V_L − D = ${money(fiVu + FI.tax * FI.D - FI.D)}, or ${money((fiVu + FI.tax * FI.D - FI.D) / fiLeft, 2)} a share. The price doesn’t move again at the buyback itself.`,
  },
  {
    id: 'f05-fn-19', lesson: 'capital-structure', type: 'mc', kind: 'conceptual',
    prompt: 'Fenstrode Quarries (fictional, listed) has no debt, decades of reserves and large, steady cash flows, but few projects worth investing in. In recent years its managers have spent its surplus cash buying unrelated businesses whose returns have disappointed. An activist shareholder proposes that Fenstrode borrow heavily and pay the money out. Which argument for the proposal rests on how managers behave?',
    options: [
      'Interest is tax-deductible, so borrowing adds the present value of the tax shields to the firm',
      'Steady cash flows and tangible assets keep the expected costs of financial distress low',
      'Fixed payments to lenders leave managers less free cash flow to spend on poor acquisitions',
      'Firms prefer internal funds, then debt, then equity, so the debt would be used first',
    ],
    answer: 2,
    feedback: {
      0: 'That is a real argument for debt, but it is about taxes and would apply whatever the managers did.',
      1: 'That is the trade-off theory’s point that Fenstrode can carry debt cheaply. It says nothing about managers’ choices.',
      3: 'The pecking order describes how firms prefer to finance new investment. Fenstrode has few projects to finance, and the order says nothing about curbing managers.',
    },
    solution: 'This is the agency argument: managers with spare cash and few good projects may spend it on growth that serves them more than the owners. Debt commits the cash to interest and repayment, so less is left to waste, and lenders watch the firm too. The tax shield and low distress costs also favour debt for Fenstrode, but neither depends on how the managers behave. The cost of the fix: too much debt brings back the risk of financial distress.',
  },
  {
    id: 'f05-fn-20', lesson: 'capital-structure', type: 'formula', kind: 'numerical',
    prompt: 'Ambleforth Outdoor (fictional) has no debt. B1 holds what it is worth, B3 its assets’ required return and B5 its tax rate. It will borrow the amount in B2 at the rate in B4, keep the debt permanently, and pay the money out to shareholders. In B7, write a formula for its WACC afterwards under Modigliani and Miller with corporate tax.',
    sheet: { cells: aoCells, vary: { B2: [12_000_000, 20_000_000] } },
    cell: 'B7', view: 'A1:B7', widths: { A: 30, B: 14 }, formats: { B1: M, B2: M, B3: '0.0%', B4: '0.0%', B5: '0%', B7: '0.00%' },
    answer: '=B3*(1-B5*B2/(B1+B5*B2))',
    alt: ['=B3-B3*B5*B2/(B1+B5*B2)'],
    wrong: [
      { formula: '=B3', say: 'Without taxes the WACC wouldn’t change. With corporate tax, permanent debt adds tax shields worth T × D and lowers the WACC.' },
      { formula: '=B3*(1-B5*B2/B1)', say: 'That divides by the value without debt. The debt’s share is measured against the levered firm’s value, V_L = V_U + T × D.' },
      { formula: '=(B1*B3+B2*B4*(1-B5))/(B1+B2)', say: 'That weights the unlevered return as if it were the cost of equity and adds the debt on top. Under MM with tax, WACC = r_U × (1 − T × D ÷ V_L).' },
    ],
    solution: `<x>=B3*(1-B5*B2/(B1+B5*B2))</x>: V_L = ${fx(AO.Vu)} + 0.25 × ${fx(AO.D)} = ${money(aoMM.VL)}, and WACC = r_U × (1 − T × D ÷ V_L) = 10% × (1 − 0.25 × 16 ÷ 44) ≈ ${pc(aoMM.wacc, 2)}. The longer route gives the same: E = ${money(aoMM.E)}, r_E = ${pc(AO.rU, 0)} + (${pc(AO.rU, 0)} − ${pc(AO.rD, 0)}) × 0.75 × ${fx(aoMM.de, 4)} = ${pc(aoMM.rE, 2)}, and (E × r_E + D × r_D × 0.75) ÷ V_L ≈ ${pc(aoMM.wacc, 2)}. In this model the WACC keeps falling as debt rises; costs of financial distress are what stop it in practice.`,
  },
  {
    id: 'f05-fn-21', lesson: 'payout-policy', type: 'steps', kind: 'conceptual',
    prompt: `Glenholme Water (fictional, listed) has ${fx(GW.shares)} shares, fairly valued at ${money(GW.value)}, and earns ${money(GW.earnings)} a year, including ${money(GW.interest)} of after-tax interest on ${money(GW.cash)} of surplus cash. Its largest shareholder, a fund, wants to sell out, and the board agrees to buy shares from the fund alone, with all of that cash, at ${money(GW.offer)}: ${pc(GW.offer / GW.value - 1, 0)} above their value. No other shareholder can sell. Assume a market without taxes in which investors know the shares’ value.`,
    steps: [
      {
        id: 'f05-fn-21-s1', type: 'num', prompt: 'How many shares does Glenholme buy? Give a whole number.',
        answer: rnd(gwBought, 0),
        check: () => 12e6 / 44,
        unit: 'shares', places: 0, tol: 1,
        wrong: [{ value: GW.cash / GW.value, say: 'That buys at $40. The offer is $44 a share.' }],
      },
      {
        id: 'f05-fn-21-s2', type: 'num', prompt: 'What is each remaining share worth after the buyback? Give dollars and cents.',
        answer: rnd(gwPrice, 2),
        check: () => (6e6 * 40 - 12e6) / (6e6 - 12e6 / 44),
        unit: '$', places: 2, tol: 0.01,
        wrong: [{ value: GW.value, say: 'That would hold if the shares were bought at their value. Paying $44 for shares worth $40 hands the excess to the sellers, at the expense of the shareholders who stay.' }],
      },
      {
        id: 'f05-fn-21-s3', type: 'mc', prompt: 'What does the buyback do?',
        options: [
          'It raises EPS, so the shareholders who keep their shares are better off than before',
          'It moves value from the shareholders who stay to those who sell, although EPS rises',
          'It leaves everyone as well off as before, because the fund was paid only the price it asked',
          'It destroys value for both groups, because cash leaves the firm and earns nothing',
        ],
        answer: 1,
        feedback: {
          0: `EPS does rise, to about ${money(gwEps1, 2)} from ${money(gwEps0, 2)}, because fewer shares share the earnings; but the shares were bought for more than they were worth, and each remaining share is worth less.`,
          2: 'The fund gains the premium, and the other shareholders, who could not sell, pay for it: each of their shares is now worth less. The total is unchanged; the split is not.',
          3: 'The firm’s total value falls by exactly the cash paid out, so no value is destroyed in total: the sellers’ gain is the stayers’ loss.',
        },
      },
    ],
    solution: `Shares bought = ${fx(GW.cash)} ÷ ${GW.offer} ≈ ${fx(gwBought)}, leaving ${fx(gwLeft)}. Value left = ${money(GW.shares * GW.value)} − ${money(GW.cash)} = ${money(GW.shares * GW.value - GW.cash)}, so each remaining share is worth ${money(gwPrice, 2)}. The fund received ${money(GW.offer - GW.value)} more than value on each of ${fx(gwBought)} shares, about ${money((GW.offer - GW.value) * gwBought)} in all, which the remaining shareholders lose. EPS still rises, from ${money(gwEps0, 2)} to ${money(gwEps1, 2)}: EPS accretion says nothing about value.`,
  },
  {
    id: 'f05-fn-22', lesson: 'payout-policy', type: 'mc', kind: 'conceptual',
    prompt: 'Quarnell Ceramics (fictional, listed) has paid a steady dividend for twenty years. It announces that it will halve the dividend to help fund a new kiln, which analysts agree has a positive NPV. The share price falls 6% on the day. Which explanation fits best?',
    options: [
      'In a perfect market a dividend cut always lowers the price by the amount of cash withheld',
      'Investors read the cut as news that managers expect lower earnings',
      'The kiln must have a negative NPV after all, since otherwise the price would have risen',
      'The cut pushes Quarnell’s shareholders into a higher tax bracket on their income',
    ],
    answer: 1,
    feedback: {
      0: 'In a perfect market cash kept in the firm is worth as much as cash paid out, so the policy alone shouldn’t move the price; the money withheld stays in the value of the shares.',
      2: 'A price fall doesn’t show the kiln is bad. The analysts’ view of the kiln may be right while investors are reacting to what the cut suggests about everything else.',
      3: 'A smaller dividend lowers shareholders’ taxable income; it can’t push them into a higher bracket.',
    },
    solution: 'Firms that smooth their dividends cut them only reluctantly, so investors treat a cut as a signal that managers expect earnings to fall. Even if the stated reason is a good investment, the cut can carry that information, and the price falls. Some shareholders who rely on the income (a dividend clientele) may also sell. A firm in this position can explain the cut carefully, or fund the kiln another way and keep the dividend.',
  },
  {
    id: 'f05-fn-23', lesson: 'financial-planning', type: 'steps', kind: 'numerical',
    prompt: `Calveran Cycles (fictional) had sales of ${money(TC.sales)} last year. Its assets of ${money(TC.assets)} are all in full use and rise in proportion to sales, as do its payables and accruals of ${money(TC.spont)}. Its net margin is ${pc(TC.margin, 0)}, it pays out ${pc(TC.payout, 0)} of its profit, and its equity at the end of the year was ${money(TC.equity)}. It plans ${pc(TC.g, 0)} sales growth next year, with the same margin and payout.`,
    steps: [
      {
        id: 'f05-fn-23-s1', type: 'num', prompt: 'What are the additional funds needed next year? Give whole dollars.',
        answer: rnd(tcA.afn, 0),
        check: () => 0.6 * 600_000 - 0.1 * 600_000 - 0.06 * 3_600_000 * 0.6,
        unit: '$', places: 0, tol: 1,
        wrong: [
          { value: rnd(tcA.needAssets, 0), say: 'That is the rise in assets. Part is financed by payables and accruals that grow with sales, and part by retained earnings.' },
          { value: rnd(tcA.afn + TC.margin * TC.g * TC.sales * (1 - TC.payout), 0), say: `That uses this year’s profit for retained earnings. Next year’s profit is on next year’s sales: ${pc(TC.margin, 0)} × ${money(tcA.s1)}.` },
        ],
      },
      {
        id: 'f05-fn-23-s2', type: 'num', prompt: 'What is Calveran’s sustainable growth rate, with ROE on end-of-year equity? Give a percentage to two decimal places.',
        answer: rnd(tcSgr * 100, 2),
        check: () => { const x = 180_000 / 1_000_000 * 0.6; return x / (1 - x) * 100; },
        unit: '%', places: 2, tol: 0.01,
      },
      {
        id: 'f05-fn-23-s3', type: 'mc', prompt: 'Calveran’s owners will not sell new shares. What would let it grow as planned?',
        options: [
          'Borrow enough to fund the gap, letting its debt-to-equity ratio rise',
          'Pay out more of its profit, so that shareholders will back the plan',
          'Hold its asset turnover down by keeping more stock in hand',
          'Nothing: growth above the sustainable rate is impossible without new shares',
        ],
        answer: 0,
        feedback: {
          1: 'A higher payout leaves less profit in the business and lowers the sustainable growth rate.',
          2: 'More assets per dollar of sales means more funds needed, not fewer.',
          3: 'The sustainable growth rate holds the debt ratio, margin, turnover and payout fixed. Changing any of them, by borrowing more for instance, allows faster growth for a while.',
        },
      },
    ],
    solution: `AFN: assets rise by 0.6 × ${money(TC.g * TC.sales)} = ${money(tcA.needAssets)}; payables and accruals by 0.1 × ${money(TC.g * TC.sales)} = ${money(tcA.spont)}; retained earnings add 6% × ${money(tcA.s1)} × 0.6 = ${money(tcA.retained)}. AFN = ${money(tcA.afn)}. SGR: ROE = ${money(TC.margin * TC.sales)} ÷ ${money(TC.equity)} = ${pc(tcRoe, 0)}; ROE × b = ${fx(tcRoe * 0.6, 3)}; SGR = ${fx(tcRoe * 0.6, 3)} ÷ ${fx(1 - tcRoe * 0.6, 3)} ≈ ${pc(tcSgr, 2)}. The plan’s ${pc(TC.g, 0)} outruns it, so with no new shares Calveran must borrow more than its current debt ratio allows, raise its margin or turnover, or cut its payout; otherwise it must grow more slowly.`,
  },
  {
    id: 'f05-fn-24', lesson: 'financial-planning', type: 'num', kind: 'applied',
    prompt: `Elvanstone Joinery (fictional) starts ${MON[0]} with ${money(EJ.opening)} of cash and nothing drawn on its ${money(EJ.limit)} line of credit, which charges ${pc(EJ.rate, 0)} a month on the balance drawn at the start of each month. It keeps at least ${money(EJ.minimum)} of cash, drawing on the line when cash would fall below that. Receipts are ${EJ.receipts.map((v) => money(v)).join(', ')} and payments (before interest) ${EJ.payments.map((v) => money(v)).join(', ')} in ${MON.join(', ')}. By how much will cash fall short of the minimum at the end of ${MON[2]}? Give dollars and cents.`,
    answer: rnd(ejShort, 2),
    check: () => {
      let cash = 18_000, debt = 0, end = 0;
      const rec = [40_000, 35_000, 30_000], pay = [55_000, 52_000, 38_000];
      for (let m = 0; m < 3; m++) { let c = cash + rec[m] - pay[m] - debt * 0.01; const draw = Math.max(0, Math.min(10_000 - c, 25_000 - debt)); debt += draw; c += draw; cash = c; end = c; }
      return 10_000 - end;
    },
    unit: '$', places: 2, tol: 0.05,
    wrong: [
      { value: rnd(ejShort - ejB.rows[2].interest - ejB.rows[1].interest, 2), say: 'That leaves out the interest on the line. Each month’s interest is 1% of the balance at the start of the month, and it is paid in cash.' },
      { value: 0, say: 'The line has a $25,000 limit. By June the joinery has drawn nearly all of it, so it can’t borrow enough to restore the minimum.' },
      { value: rnd(ejShort + EJ.limit - ejB.rows[1].debt, 2), say: 'That ignores the little room left on the line. Draw what remains before the limit: $25,000 less May’s closing balance.' },
    ],
    solution: `${ejB.rows.map((r, i) => `${MON[i]}: ${fx(r.start)} + ${fx(r.receipts)} − ${fx(r.payments)} − interest ${fx(r.interest, 2)} = ${fx(r.start + r.net, 2)}; draw ${fx(r.borrow, 2)} (line ${fx(r.debt, 2)}); cash ${fx(r.end, 2)}`).join('. ')}. In ${MON[2]} the line reaches its ${money(EJ.limit)} limit and cash ends at ${money(ejB.rows[2].end, 2)}, ${money(ejShort, 2)} short of the minimum. The budget shows the problem two months ahead: Elvanstone needs a larger line, earlier collections or deferred payments before ${MON[2]}.`,
  },
];
