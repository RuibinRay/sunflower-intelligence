// assess-final.js — F05 cumulative final: 24 items across all four modules and all eight of the course’s outcomes,
// two or three per lesson (seven for module 1, five for module 2, five for module 3 and seven for module 4). 70% passes.
// Outcomes (main one per item): 1 NPV and the opportunity cost of capital fn-1, fn-2; 2 IRR, MIRR, payback and PI fn-3,
// fn-4 (and fn-5); 3 incremental free cash flows fn-5, fn-6, fn-7; 4 mutually exclusive projects and rationing fn-8,
// fn-9, fn-10; 5 risk analysis fn-11, fn-12; 6 the cost of capital fn-13, fn-14, fn-15, fn-16, fn-17 (and fn-8, fn-9);
// 7 capital structure fn-18, fn-19, fn-20; 8 payout and financial planning fn-21, fn-22, fn-23, fn-24 (and fn-18).
// Mixed conceptual, numerical and applied items (7, 8 and 9). Four items are spreadsheet formula items with five formulas
// between them (fn-7 is a steps item with two), and the copies the marker builds scale the inputs so a typed-in result fails: the roaster’s MIRR (fn-3); the fridges’
// depreciation tax shields filled down and their after-tax salvage in one formula (fn-7, steps); roaster B’s equivalent
// annual cost from its cost stream in one formula (fn-10, life fixed, rate varied); a cost of equity with the beta
// relevered inside the formula (fn-15, the target D/E varied).
// Items that combine lessons: a project’s NPV as a share-price effect (fn-1: net-present-value, payout-policy); a
// package’s NPV as the sum of its parts at Ana’s rate (fn-2: net-present-value, choosing-between-projects); a project’s
// free cash flows built from MACRS, working capital and after-tax salvage, then its NPV and IRR (fn-5:
// project-cash-flows, net-present-value, investment-criteria); Cold Brew’s working capital and its NPV (fn-6:
// project-cash-flows, net-present-value); the fridges’ tax shields and after-tax salvage (fn-7: project-cash-flows);
// a WACC computed from market values, then two machines of unequal lives compared by EAA at it (fn-8:
// weighted-average-cost-of-capital, choosing-between-projects); the NPV the $40,000 budget costs Lantern at its target
// WACC (fn-9: weighted-average-cost-of-capital, choosing-between-projects, net-present-value); an EAC from a cost
// stream with NPV and PMT (fn-10: choosing-between-projects, net-present-value); a scenario’s cash flow, NPV and the
// expected NPV (fn-11: project-risk, project-cash-flows); what an NPV break-even does and doesn’t say (fn-12:
// project-risk); unlever and average two peers’ betas, relever at the target, WACC, then Cold Brew’s NPV at it (fn-13:
// cost-of-debt-and-equity, weighted-average-cost-of-capital, net-present-value); a cost of equity with relevering in
// one formula (fn-15: cost-of-debt-and-equity); a low-risk project judged at the WACC and at its own rate (fn-16:
// weighted-average-cost-of-capital, net-present-value, investment-criteria); a WACC with the cost of debt from a bond’s
// price (fn-17: weighted-average-cost-of-capital, cost-of-debt-and-equity); MM with tax and the buyback that follows
// (fn-18: capital-structure, payout-policy); MM with tax and the WACC (fn-20: capital-structure,
// weighted-average-cost-of-capital); a buyback above value: shares, price and who gains (fn-21: payout-policy);
// AFN, then the sustainable growth rate, then what closes the gap (fn-23: financial-planning); a cash budget with a
// line of credit at its limit (fn-24: financial-planning). Single-lesson items: fn-4, fn-14, fn-19, fn-22.
// Lantern items use case.js (Cold Brew, the roaster and the roasters, the proposals and the budget, the peers, the market
// assumptions and Coastline’s 7.5%), never the project’s parts. Every other business and figure is fictional. Every
// figure the text shows is computed below with core/corpfin.js and core/invest.js; claims about the figures’ shape throw
// if the numbers stop supporting them. New questions, not copies of lesson exercises, module-test, diagnostic or project
// items. No hints; solutions show in review.
import { COLD_BREW, ROASTERS, PROPOSALS, BUDGET_2028, WORKING_RATE, TARGET_DV, TAX, MARKET, PEERS, DEBT, DERIVED, coldBrewFlows, roasterFlows } from './case.js?v=28';
import * as CF from '../../../core/corpfin.js?v=28';
import { npv, irr, irrAll, mirr, signChanges } from '../../../core/invest.js?v=28';

const fx = (v, d = 0) => `${v < 0 ? '−' : ''}${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const money = (v, d = 0) => `${v < 0 ? '−' : ''}$${fx(Math.abs(v), d)}`;
const pc = (v, d = 1) => `${fx(v * 100, d)}%`;
const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const af = (r, n) => (1 - (1 + r) ** -n) / r;
const claim = (ok, what) => { if (!ok) throw new Error(`assess-final: the figures no longer support “${what}”`); };
const M = '$#,##0';
const r11 = WORKING_RATE;

// ---------------------------------------------------------------- module 1
// fn-1 Elmscott Laundry (fictional, listed): a contract’s NPV per share
const EL = { shares: 500_000, price: 14, outlay: 1_200_000, cf: 320_000, n: 6, r: 0.09 };
const elNpv = npv(EL.r, [-EL.outlay, ...Array(EL.n).fill(EL.cf)]);
// fn-2 Lantern’s kiosks, cargo bike and solar panels as one package (savings are after tax, no resale: as the lessons value them)
const SMALL = PROPOSALS.slice(2).map((p) => ({ ...p, flows: [-p.outlay, ...Array(p.life).fill(p.saving)] }));
const [KIOSK, BIKE, SOLAR] = SMALL;
const smNpv = SMALL.map((p) => npv(r11, p.flows));
const pkg = smNpv.reduce((a, b) => a + b, 0), pkgGood = smNpv[0] + smNpv[1];
claim(smNpv[0] > 0 && smNpv[1] > 0 && smNpv[2] < 0 && pkg > 0, 'kiosks and bike positive, panels negative, the package positive');
// fn-3 and fn-4: the roaster’s and Cold Brew’s free cash flows, rounded to the dollar as a sheet would hold them
const RO = roasterFlows().fcf.map((v) => Math.round(v));
const RO_FIN = DEBT.lineOfCredit.rate;
const roMirr = mirr(RO, RO_FIN, r11);
const CB = coldBrewFlows().fcf.map((v) => Math.round(v));
const cbIrrs = irrAll(CB);
claim(CB[0] < 0 && CB[1] < 0 && CB.slice(2).every((v) => v > 0) && signChanges(CB) === 1 && cbIrrs.length === 1, 'Cold Brew’s first two flows are negative, the rest positive, one sign change and one IRR');
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
// fn-7 the display fridges: 5-year MACRS, sold after year 5
const FR = { cost: COLD_BREW.equipment, sale: COLD_BREW.salvage, pct: CF.MACRS[5].map((p) => p / 100) };
const frBook = FR.cost * (1 - FR.pct.slice(0, 5).reduce((a, b) => a + b, 0));
const frSalv = FR.sale - TAX * (FR.sale - frBook);
claim(Math.abs(frSalv - coldBrewFlows().rows[5].salvage) < 1e-6, 'the fridges’ after-tax salvage matches case.js');
const frCells = {
  A1: 'Fridges’ cost', B1: FR.cost, A2: 'Tax rate', B2: TAX, A3: 'Sale price after year 5', B3: FR.sale,
  A5: 'Year', B5: 'MACRS %', C5: 'Tax shield',
  ...Object.fromEntries(FR.pct.flatMap((p, i) => [[`A${6 + i}`, i + 1], [`B${6 + i}`, p]])),
  A13: 'After-tax salvage',
};
const frSheet = { cells: frCells, fixed: ['A6:B11'] };

// ---------------------------------------------------------------- module 2
// fn-8 Polvellan Foods (fictional): a WACC, then two packing lines of unequal lives
const PV = { E: 6_000_000, rE: 0.12, D: 2_000_000, rD: 0.064, tax: 0.25, S: { out: 80_000, cf: 34_000, n: 3 }, L: { out: 150_000, cf: 36_000, n: 6 } };
const pvW = CF.wacc({ E: PV.E, D: PV.D, rE: PV.rE, rD: PV.rD, tax: PV.tax }).wacc;
const pvNS = npv(pvW, [-PV.S.out, ...Array(PV.S.n).fill(PV.S.cf)]), pvNL = npv(pvW, [-PV.L.out, ...Array(PV.L.n).fill(PV.L.cf)]);
const pvES = CF.eaa(pvNS, pvW, PV.S.n), pvEL = CF.eaa(pvNL, pvW, PV.L.n);
claim(pvNL > pvNS && pvES > pvEL && pvES > 0 && pvEL > 0, 'the long line has the higher NPV, the short line the higher EAA');
// fn-9 the $40,000 budget at Lantern’s target WACC, rounded to 2 dp as students will use it
const WT = rnd(DERIVED.targetWacc, 4);
const PROJ9 = [{ name: 'Cold Brew', flows: CB }, { name: 'In-house roaster', flows: RO }, ...SMALL.map((p) => ({ name: p.name, flows: p.flows }))]
  .map((p) => ({ ...p, outlay: -p.flows[0], npv: npv(WT, p.flows) }));
const best9 = (() => { let b = 0; for (let m = 0; m < 1 << PROJ9.length; m++) { let o = 0, v = 0; PROJ9.forEach((p, i) => { if (m & (1 << i)) { o += p.outlay; v += p.npv; } }); if (o <= BUDGET_2028 && v > b) b = v; } return b; })();
const allPos9 = PROJ9.filter((p) => p.npv > 0).reduce((s, p) => s + p.npv, 0);
claim(PROJ9[1].outlay > BUDGET_2028 && PROJ9[4].npv < 0 && PROJ9.slice(0, 4).every((p) => p.npv > 0), 'the roaster alone exceeds the budget; the panels are negative; the others positive');
// fn-10 roaster B’s after-tax cost stream (the lesson’s method: operator, MACRS shield and salvage; common items left out)
const RB = ROASTERS[1];
const rbF = CF.projectCashFlows({ capex: RB.price, years: RB.life, revenue: Array(RB.life).fill(0), variable: Array(RB.life).fill(0), fixed: RB.operator,
  dep: CF.depreciation(RB.price, { method: 7 }).slice(0, RB.life), tax: TAX, salvage: RB.salvage }).fcf.map((v) => Math.round(v));
const rbEac = -CF.eaa(npv(r11, rbF), r11, RB.life);
const rbCells = { A1: 'Discount rate', B1: r11, A2: 'Life (years)', B2: RB.life, A4: 'Year', B4: 'After-tax cost', ...Object.fromEntries(rbF.flatMap((v, i) => [[`A${5 + i}`, i], [`B${5 + i}`, v]])), A12: 'Equivalent annual cost' };
// fn-11 Gorran Boatyard (fictional): winter storage, three scenarios
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
const twoCb = npv(twoW, CB);
claim(TWO.length === 2 && twoBu < DERIVED.betaU && twoW < DERIVED.targetWacc, 'dropping Harbour Street lowers the beta and the WACC');
// fn-14 a Brightcup Coffee bond (fictional, as the peer is)
const BC = { years: 6, coupon: 0.05, price: 103.2 };
const bcY = CF.ytm({ price: BC.price, face: 100, coupon: BC.coupon, years: BC.years });
// fn-15 Lantern’s cost of equity in one formula
const BU3 = rnd(DERIVED.betaU, 3);
const ceCells = { A1: 'Risk-free rate', B1: MARKET.rf, A2: 'Unlevered beta (peer average)', B2: BU3, A3: 'Target debt-to-equity', B3: tDE, A4: 'Tax rate', B4: TAX,
  A5: 'Market risk premium', B5: MARKET.mrp, A6: 'Extra premium', B6: MARKET.smallFirm, A8: 'Cost of equity' };
const ceVal = MARKET.rf + BU3 * (1 + (1 - TAX) * tDE) * MARKET.mrp + MARKET.smallFirm;
// fn-16 the solar panels at the target WACC and at a rate for low-risk savings
const LOWR = 0.07;
const solW = npv(DERIVED.targetWacc, SOLAR.flows), solL = npv(LOWR, SOLAR.flows), solIrr = irr(SOLAR.flows);
claim(solW < 0 && solL > 0 && solIrr > LOWR && solIrr < DERIVED.targetWacc, 'the panels lose value at the WACC and add it at 7%');
// fn-17 Stennack Print (fictional, listed): the cost of debt from its bond price, then the WACC
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
// fn-21 Glenholme Water (fictional, listed): a buyback at a premium to value
const GW = { shares: 6_000_000, value: 40, earnings: 18_000_000, interest: 300_000, cash: 12_000_000, offer: 44 };
const gwBought = GW.cash / GW.offer, gwLeft = GW.shares - gwBought, gwPrice = (GW.shares * GW.value - GW.cash) / gwLeft;
const gwEps0 = GW.earnings / GW.shares, gwEps1 = (GW.earnings - GW.interest) / gwLeft;
claim(gwPrice < GW.value && gwEps1 > gwEps0, 'after paying above value the price falls while EPS rises');
// fn-23 Tregarne Cycles (fictional): AFN and the sustainable growth rate
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
    id: 'f05-fn-1', lesson: 'net-present-value', type: 'num', kind: 'applied',
    prompt: `Elmscott Laundry (fictional, listed) has ${fx(EL.shares)} shares trading at ${money(EL.price)}. It wins a contract to run a hospital’s laundry: ${money(EL.outlay)} of machines today, then ${money(EL.cf)} a year after tax at the end of each of the next ${EL.n} years, with nothing left at the end. Its opportunity cost of capital for this kind of work is ${pc(EL.r, 0)}. Investors had not expected the contract and believe the forecasts. By how much should the share price rise when the contract is announced? Give dollars and cents.`,
    answer: rnd(elNpv / EL.shares, 2),
    check: () => { let pv = 0; for (let t = 1; t <= 6; t++) pv += 320_000 / 1.09 ** t; return (pv - 1_200_000) / 500_000; },
    unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: rnd((EL.n * EL.cf - EL.outlay) / EL.shares, 2), say: 'That adds the cash flows without discounting. The share price rises by the value the contract adds: its NPV at 9%, per share.' },
      { value: rnd((elNpv + EL.outlay) / EL.shares, 2), say: 'That is the present value of the inflows per share. Elmscott pays $1,200,000 for the machines, so the value added is the NPV.' },
      { value: rnd(elNpv, 0), say: 'That is the NPV of the whole contract. Divide it among the 500,000 shares.' },
    ],
    solution: `NPV = ${fx(EL.cf)} × ${fx(af(EL.r, EL.n), 6)} − ${fx(EL.outlay)} ≈ ${money(elNpv)}. Spread over ${fx(EL.shares)} shares, that is about ${money(elNpv / EL.shares, 2)} a share, taking the price from ${money(EL.price)} to about ${money(EL.price + elNpv / EL.shares, 2)}. A positive NPV is value that goes to the owners as soon as investors believe in it, if they had not already expected it.`,
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
    prompt: `B2:B9 hold the in-house roaster’s free cash flows for years 0 to 7, rounded to the dollar. Lantern would pay for any shortfall from its line of credit at the rate in E1 (${pc(RO_FIN, 0)}), and could reinvest the roaster’s cash at Ana’s working rate in E2 (${pc(r11, 0)}). In E4, write a formula for the roaster’s modified IRR.`,
    sheet: { cells: { A1: 'Year', B1: 'Free cash flow', ...Object.fromEntries(RO.flatMap((v, i) => [[`A${2 + i}`, i], [`B${2 + i}`, v]])), D1: 'Finance rate', E1: RO_FIN, D2: 'Reinvestment rate', E2: r11, D4: 'MIRR' }, fixed: ['A2:A9'] },
    cell: 'E4', view: 'A1:E9', widths: { A: 6, B: 14, D: 18, E: 10 }, formats: { B: M, E1: '0.0%', E2: '0.0%', E4: '0.00%' },
    answer: '=MIRR(B2:B9,E1,E2)',
    require: ['MIRR'],
    wrong: [
      { formula: '=MIRR(B2:B9,E2,E1)', say: 'The rates are swapped. MIRR’s second argument is the finance rate (for negative flows), the third the reinvestment rate (for positive ones).' },
      { formula: '=IRR(B2:B9)', say: 'That is the IRR, which in effect assumes each cash flow is reinvested at the IRR itself. The MIRR compounds the inflows at the reinvestment rate in E2.' },
      { formula: '=MIRR(B3:B9,E1,E2)', say: 'The range must start with the year-0 outlay in B2; without a negative flow there is nothing to earn a return on.' },
    ],
    solution: `<x>=MIRR(B2:B9,E1,E2)</x> ≈ ${pc(roMirr, 2)}, against an IRR of ${pc(irr(RO), 2)}. MIRR discounts the negative flows at the finance rate and compounds the positive ones to year 7 at the reinvestment rate. The roaster’s only negative flow is today’s outlay, so the finance rate makes no difference here: the MIRR is (future value of the inflows at 11% ÷ ${fx(-RO[0])})^(1/7) − 1.`,
  },
  {
    id: 'f05-fn-4', lesson: 'investment-criteria', type: 'mc', kind: 'conceptual',
    prompt: 'Cold Brew’s free cash flows, rounded to the dollar, are in the table: negative in year 0 and again in year 1, when the launch promotion is heaviest, then positive. How many internal rates of return do they have?',
    data: { table: { head: ['Year', 'Free cash flow ($)'], rows: CB.map((v, i) => [i, fx(v)]) } },
    options: [
      'Two, one for each year in which the cash flow is negative',
      `One, about ${pc(cbIrrs[0])}: the signs change only once, from − to +`,
      'None that can be relied on, because a negative year 1 breaks the IRR rule',
      'It depends on the discount rate Ana uses for Cold Brew',
    ],
    answer: 1,
    feedback: {
      0: 'The number of possible IRRs depends on how often the sign changes, not on how many years are negative. Here the flows go −, −, +, +, +, +: one change.',
      2: 'A run of outflows before the inflows is still a conventional pattern. Trouble starts when the flows turn negative again after turning positive.',
      3: 'The IRR is a property of the cash flows alone, the rate at which their NPV is zero. The discount rate is what you compare it with.',
    },
    solution: `By Descartes’ rule of signs, cash flows can have at most as many IRRs as they have sign changes. Cold Brew’s go −, −, +, +, +, +: one change, so exactly one IRR, about ${pc(cbIrrs[0])}, and the NPV falls as the rate rises through it. The IRR rule works as usual: accept if the IRR exceeds the opportunity cost of capital.`,
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
    id: 'f05-fn-7', lesson: 'project-cash-flows', type: 'steps', kind: 'numerical',
    prompt: `Cold Brew’s chilled display fridges cost ${money(FR.cost)} (B1) and are 5-year MACRS property: B6:B11 hold the share of the cost deducted in each of years 1 to 6. Tax is in B2. Ana expects to sell the fridges for ${money(FR.sale)} (B3) at the end of year 5, after five years of deductions.`,
    steps: [
      {
        id: 'f05-fn-7-s1', type: 'formula',
        prompt: 'In C6, write a formula for year 1’s depreciation tax shield that can be filled down to C10 for years 2 to 5.',
        sheet: frSheet, cell: 'C6', fill: 'C6:C10', view: 'A1:C13', widths: { A: 24, B: 12, C: 12 }, formats: { B1: M, B2: '0%', B3: M, B6: '0.00%', B7: '0.00%', B8: '0.00%', B9: '0.00%', B10: '0.00%', B11: '0.00%', C: '$#,##0.00' },
        answer: '=$B$1*B6*$B$2',
        alt: ['=B6*$B$1*$B$2', '=$B$2*$B$1*B6'],
        wrong: [
          { formula: '=B1*B6*B2', say: 'Without $ signs, B1 and B2 slide down as the formula fills, so the lower rows multiply by the wrong cells. Anchor the cost and the tax rate: $B$1, $B$2.' },
          { formula: '=$B$1*B6', say: 'That is the depreciation itself. The tax shield is the tax it saves: depreciation × the tax rate.' },
        ],
      },
      {
        id: 'f05-fn-7-s2', type: 'formula',
        prompt: 'In B13, write one formula for the fridges’ after-tax salvage value, using only the cells above.',
        sheet: frSheet, cell: 'B13', view: 'A1:C13', widths: { A: 24, B: 12, C: 12 }, formats: { B1: M, B2: '0%', B3: M, B6: '0.00%', B7: '0.00%', B8: '0.00%', B9: '0.00%', B10: '0.00%', B11: '0.00%', B13: '$#,##0.00' },
        answer: '=B3-B2*(B3-B1*(1-SUM(B6:B10)))',
        alt: ['=B3-B2*(B3-B1*B11)', '=B3*(1-B2)+B2*B1*(1-SUM(B6:B10))'],
        wrong: [
          { formula: '=B3*(1-B2)', say: 'That taxes the whole sale price, as if the fridges had no book value left. After five years’ deductions 5.76% of the cost is still undepreciated, and only the gain over that book value is taxed.' },
          { formula: '=B3', say: 'The sale price is above the book value, so the gain is taxed: after-tax salvage = price − T × (price − book value).' },
          { formula: '=B3-B2*(B1*(1-SUM(B6:B10))-B3)', say: 'The sign of the gain is reversed. The fridges sell for more than their book value, so tax is paid on (price − book value).' },
        ],
      },
    ],
    solution: `Tax shields: <x>=$B$1*B6*$B$2</x> filled down gives ${FR.pct.slice(0, 5).map((p) => money(FR.cost * p * TAX)).join(', ')}. Book value after five years = ${fx(FR.cost)} × (1 − ${pc(FR.pct.slice(0, 5).reduce((a, b) => a + b, 0), 2)}) = ${money(frBook, 2)}, which is the year-6 share (${pc(FR.pct[5], 2)}) still to come. After-tax salvage <x>=B3-B2*(B3-B1*(1-SUM(B6:B10)))</x> = ${fx(FR.sale)} − 0.25 × (${fx(FR.sale)} − ${fx(frBook, 2)}) = ${money(frSalv, 2)}, the figure in Cold Brew’s year-5 cash flow.`,
  },

  // ================================================================ Module 2: Analysing projects
  {
    id: 'f05-fn-8', lesson: 'choosing-between-projects', type: 'steps', kind: 'applied',
    prompt: `Polvellan Foods (fictional, listed) has equity worth ${money(PV.E)} with a cost of ${pc(PV.rE, 0)}, and debt worth ${money(PV.D)} costing ${pc(PV.rD)} before tax; tax is ${pc(PV.tax, 0)}. It must choose one of two packing lines of average risk for the firm, and will replace whichever it picks on the same terms when it wears out. Line S costs ${money(PV.S.out)} and returns ${money(PV.S.cf)} a year for ${PV.S.n} years; line L costs ${money(PV.L.out)} and returns ${money(PV.L.cf)} a year for ${PV.L.n} years (year-end cash flows, after tax, no resale).`,
    steps: [
      {
        id: 'f05-fn-8-s1', type: 'num', prompt: 'Weighting by market values, what does Polvellan’s capital cost on average after tax? Give a percentage to two decimal places.',
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
        id: 'f05-fn-8-s4', type: 'mc', prompt: 'Which line should Polvellan choose?',
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
    id: 'f05-fn-9', lesson: 'choosing-between-projects', type: 'num', kind: 'applied',
    prompt: `Module 3 puts Lantern’s WACC at its target debt share at ${pc(WT, 2)}. Suppose Ana uses it for all five 2028 proposals and still has only ${money(BUDGET_2028)} to spend on 1 April. The table holds Cold Brew’s and the roaster’s free cash flows, rounded to the dollar. The kiosks cost ${money(KIOSK.outlay)} and save ${money(KIOSK.saving)} a year for ${KIOSK.life} years; the cargo bike costs ${money(BIKE.outlay)} and saves ${money(BIKE.saving)} a year for ${BIKE.life} years; the solar panels cost ${money(SOLAR.outlay)} and save ${money(SOLAR.saving)} a year for ${SOLAR.life} years (after tax, year-end, no resale). Projects can’t be split. How much NPV does the budget limit cost Lantern, compared with funding every project with a positive NPV? Give whole dollars.`,
    data: { table: { head: ['Year', 'Cold Brew ($)', 'Roaster ($)'], rows: RO.map((v, i) => [i, i < CB.length ? fx(CB[i]) : '', fx(v)]) } },
    answer: rnd(allPos9 - best9, 0),
    check: () => {
      const v = PROJ9.map((p) => npv(0.1133, p.flows)), o = PROJ9.map((p) => -p.flows[0]);
      const pos = v.filter((x) => x > 0).reduce((a, b) => a + b, 0);
      // feasible sets: Cold Brew with the kiosks, or with the bike, or the kiosks with the bike; the roaster alone is over budget
      const sets = [[0, 2], [0, 3], [2, 3], [0], [2], [3]].filter((s) => s.reduce((a, i) => a + o[i], 0) <= 40_000);
      return pos - Math.max(...sets.map((s) => s.reduce((a, i) => a + v[i], 0)));
    },
    unit: '$', places: 0, tol: 15,
    wrong: [
      { value: rnd(PROJ9[1].npv, 0), say: 'That is the roaster’s NPV. The cargo bike is left out of the best set too: with Cold Brew and the kiosks there isn’t room for it.' },
      { value: rnd(allPos9 - best9 + PROJ9[4].npv, 0), say: 'That counts the solar panels as a loss of the budget. At the WACC their NPV is negative, so Lantern would not fund them even with unlimited money.' },
    ],
    solution: `NPVs at ${pc(WT, 2)}: ${PROJ9.map((p) => `${p.name.replace(/ for .*$/, '')} ${money(p.npv)} (outlay ${money(p.outlay)})`).join('; ')}. Every positive-NPV project together adds ${money(allPos9)}. Within ${money(BUDGET_2028)} the roaster can’t be bought at all, and the best set is Cold Brew and the kiosks (outlay ${money(PROJ9[0].outlay + PROJ9[2].outlay)}, NPV ${money(best9)}); adding the bike would take the outlay over the budget. The limit costs about ${money(allPos9 - best9)}. If the limit is self-imposed (soft rationing), that is the value Ana gives up by not raising more money; module 4 looks at how.`,
  },
  {
    id: 'f05-fn-10', lesson: 'choosing-between-projects', type: 'formula', kind: 'numerical',
    prompt: 'B5:B9 hold roaster B’s after-tax costs for years 0 to 4, as negative cash flows: its price, then each year its operator less the depreciation tax shield, with the after-tax resale in year 4. The discount rate is in B1 and the life in B2. In B12, write one formula for roaster B’s equivalent annual cost, as a positive number, using NPV and PMT.',
    sheet: { cells: { ...rbCells }, fixed: ['A5:A9', 'B2'], vary: { B1: [0.09, 0.13] } },
    cell: 'B12', view: 'A1:B12', widths: { A: 24, B: 14 }, formats: { B1: '0.0%', B: M, B12: '$#,##0.00' },
    answer: '=PMT(B1,B2,B5+NPV(B1,B6:B9))',
    alt: ['=-PMT(B1,B2,-(B5+NPV(B1,B6:B9)))', '=PMT(B1,B2,NPV(B1,B6:B9)+B5)'],
    require: ['PMT', 'NPV'],
    wrong: [
      { formula: '=PMT(B1,B2,NPV(B1,B5:B9))', say: 'Excel’s NPV discounts its first value by a year, so the price paid today in B5 would be discounted. Add B5 outside NPV.' },
      { formula: '=-PMT(B1,B2,B5+NPV(B1,B6:B9))', say: 'That gives the cost as a negative number. PMT returns a payment with the opposite sign to the present value, so with negative costs it is already positive.' },
      { formula: '=-(B5+NPV(B1,B6:B9))/B2', say: 'Dividing by the life ignores the time value of money. The equivalent annual cost is the annuity with the same present value: use PMT.' },
    ],
    solution: `<x>=PMT(B1,B2,B5+NPV(B1,B6:B9))</x>: the present value of the cost stream (B5 as it stands, plus NPV of years 1 to 4, since Excel’s NPV discounts its first value) turned into ${RB.life} equal yearly amounts. At 11% it gives ${money(rbEac, 2)} a year, the figure to compare with roaster A’s equivalent annual cost over its seven years.`,
  },
  {
    id: 'f05-fn-11', lesson: 'project-risk', type: 'steps', kind: 'applied',
    prompt: `Gorran Boatyard (fictional) is considering a winter-storage shed: ${money(GB.capex)} today, depreciated straight line over ${GB.n} years to zero and worth nothing at the end. Each boat stored costs ${money(GB.unit)} to handle; fixed cash costs are ${money(GB.fixed)} a year. Tax is ${pc(GB.tax, 0)} (the yard’s other profits absorb any loss) and the rate ${pc(GB.r, 0)}. In the base case it stores ${GB.base.q} boats a year at ${money(GB.base.p)} (NPV ${money(gbNpv(GB.base))}); in the optimistic case ${GB.opt.q} boats at ${money(GB.opt.p)} (NPV ${money(gbNpv(GB.opt))}). In the pessimistic case a new marina nearby takes customers and forces prices down: ${GB.pess.q} boats at ${money(GB.pess.p)}.`,
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
      `Neither is a chance: ${pc(cbBE, 0)} of forecast volume is a threshold, not a probability`,
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
    prompt: `Ana decides that Harbour Street Foods is more a food manufacturer than a coffee business, and drops it from Lantern’s peer set. That leaves ${TWO.map((p) => `${p.name} (equity beta ${fx(p.beta, 2)}, D/E ${fx(p.de, 2)})`).join(' and ')}, both taxed at ${pc(TAX, 0)}. She keeps everything else: a ${pc(TARGET_DV, 0)} target debt share, a ${pc(MARKET.rf)} risk-free rate, a ${pc(MARKET.mrp)} market risk premium, her ${pc(MARKET.smallFirm, 0)} extra premium and Coastline’s ${pc(DEBT.termLoan.rate)} for debt. Cold Brew’s free cash flows, rounded to the dollar, are in the table.`,
    data: { table: { head: ['Year', 'Cold Brew FCF ($)'], rows: CB.map((v, i) => [i, fx(v)]) } },
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
        id: 'f05-fn-13-s4', type: 'num', prompt: 'What is Cold Brew’s NPV at that WACC? Give whole dollars.',
        answer: rnd(twoCb, 0),
        check: () => CB.reduce((s, v, t) => s + v / (1 + twoW) ** t, 0),
        unit: '$', places: 0, tol: 25,
      },
    ],
    solution: `Unlevered betas: ${TWO.map((p, i) => `${p.name} ${fx(p.beta, 2)} ÷ (1 + 0.75 × ${fx(p.de, 2)}) = ${fx(twoU[i], 4)}`).join('; ')}; average ${fx(twoBu, 4)}. Relevered at D/E = ${fx(tDE, 2)}: ${fx(twoBu, 4)} × ${fx(1 + 0.75 * tDE, 4)} = ${fx(twoBl, 4)}. Cost of equity = ${pc(MARKET.rf)} + ${fx(twoBl, 4)} × ${pc(MARKET.mrp)} + ${pc(MARKET.smallFirm, 0)} = ${pc(twoRe, 2)}. WACC = 0.8 × ${pc(twoRe, 2)} + 0.2 × ${pc(DEBT.termLoan.rate)} × 0.75 = ${pc(twoW, 2)}, against ${pc(DERIVED.targetWacc, 2)} with all three peers. Cold Brew’s NPV at ${pc(twoW, 2)} ≈ ${money(twoCb)}. The choice of peers moves the rate a little; whether these peers’ risk matches canned cold brew’s is the bigger question.`,
  },
  {
    id: 'f05-fn-14', lesson: 'cost-of-debt-and-equity', type: 'num', kind: 'numerical',
    prompt: `Brightcup Coffee, one of Lantern’s fictional listed peers, has a bond with ${BC.years} years to maturity, a ${pc(BC.coupon)} coupon paid once a year and a face value of $100. It trades at $${fx(BC.price, 2)}. Brightcup pays tax at ${pc(PEERS[0].tax, 0)}. What is its after-tax cost of debt? Give a percentage to two decimal places.`,
    answer: rnd(bcY * (1 - PEERS[0].tax) * 100, 2),
    check: () => {
      const pv = (y) => { let s = 0; for (let t = 1; t <= 6; t++) s += 5 / (1 + y) ** t; return s + 100 / (1 + y) ** 6; };
      let lo = 0, hi = 0.2; for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (pv(m) > 103.2) lo = m; else hi = m; } return lo * 0.75 * 100;
    },
    unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(BC.coupon * 0.75 * 100, 2), say: 'That uses the coupon rate. The coupon was set when the bond was issued; what lenders require now is the yield to maturity at today’s price, here below the coupon because the bond trades above $100.' },
      { value: rnd(bcY * 100, 2), say: 'That is the yield before tax. Interest is deductible, so the cost to Brightcup is the yield × (1 − 0.25).' },
      { value: rnd(5 / BC.price * 0.75 * 100, 2), say: `That uses the current yield (coupon ÷ price), which ignores the $${fx(BC.price - 100, 2)} loss to holders as the price falls to $100 at maturity. Solve for the yield to maturity.` },
    ],
    solution: `Find the yield y with 5 × [1 − (1 + y)⁻⁶] ÷ y + 100 ÷ (1 + y)⁶ = ${fx(BC.price, 2)} (Excel: =RATE(6,5,−${fx(BC.price, 2)},100)): y ≈ ${pc(bcY, 2)}, below the 5% coupon because the bond trades above face value. After tax: ${pc(bcY, 2)} × 0.75 ≈ ${pc(bcY * 0.75, 2)}.`,
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
    prompt: `Stennack Print (fictional, listed) has ${fx(SP.shares)} shares at ${money(SP.price)}. Its only debt is a bond issue with a face value of ${money(SP.face)}, a ${pc(SP.coupon, 0)} coupon paid once a year and ${SP.years} years to maturity, trading at ${fx(SP.quote)} per 100 of face value. Its cost of equity is ${pc(SP.rE)} and its tax rate ${pc(SP.tax, 0)}. What is Stennack’s WACC? Give a percentage to two decimal places.`,
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
    prompt: 'Carnmoor Quarries (fictional, listed) has no debt, decades of reserves and large, steady cash flows, but few projects worth investing in. In recent years its managers have spent its surplus cash buying unrelated businesses whose returns have disappointed. An activist shareholder proposes that Carnmoor borrow heavily and pay the money out. Which argument for the proposal rests on how managers behave?',
    options: [
      'Interest is tax-deductible, so borrowing adds the present value of the tax shields to the firm',
      'Steady cash flows and tangible assets keep the expected costs of financial distress low',
      'Fixed payments to lenders leave managers less free cash flow to spend on poor acquisitions',
      'Firms prefer internal funds, then debt, then equity, so the debt would be used first',
    ],
    answer: 2,
    feedback: {
      0: 'That is a real argument for debt, but it is about taxes and would apply whatever the managers did.',
      1: 'That is the trade-off theory’s point that Carnmoor can carry debt cheaply. It says nothing about managers’ choices.',
      3: 'The pecking order describes how firms prefer to finance new investment. Carnmoor has few projects to finance, and the order says nothing about curbing managers.',
    },
    solution: 'This is the agency argument: managers with spare cash and few good projects may spend it on growth that serves them more than the owners. Debt commits the cash to interest and repayment, so less is left to waste, and lenders watch the firm too. The tax shield and low distress costs also favour debt for Carnmoor, but neither depends on how the managers behave. The cost of the fix: too much debt brings back the risk of financial distress.',
  },
  {
    id: 'f05-fn-20', lesson: 'capital-structure', type: 'num', kind: 'numerical',
    prompt: `Ambleforth Outdoor (fictional) is worth ${money(AO.Vu)} with no debt, and its assets’ required return is ${pc(AO.rU, 0)}. It pays tax at ${pc(AO.tax, 0)}. It borrows ${money(AO.D)} at ${pc(AO.rD, 0)}, permanently, and pays the money out to shareholders. Under Modigliani and Miller with corporate tax, what is its WACC afterwards? Give a percentage to two decimal places.`,
    answer: rnd(aoMM.wacc * 100, 2),
    check: () => 10 * (1 - 0.25 * 16 / (40 + 0.25 * 16)),
    unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: AO.rU * 100, say: 'Without taxes the WACC would stay at 10%. With corporate tax, interest saves tax, and permanent debt lowers the WACC.' },
      { value: rnd(aoNoT * 100, 2), say: 'That uses MM’s no-tax formula for the cost of equity. With tax, r_E = r_U + (r_U − r_D)(1 − T) D/E: the shareholders bear less extra risk because the tax shield is safe.' },
    ],
    solution: `V_L = ${fx(AO.Vu)} + 0.25 × ${fx(AO.D)} = ${money(aoMM.VL)}; E = ${money(aoMM.E)}; D/E = ${fx(aoMM.de, 4)}. r_E = ${pc(AO.rU, 0)} + (${pc(AO.rU, 0)} − ${pc(AO.rD, 0)}) × 0.75 × ${fx(aoMM.de, 4)} = ${pc(aoMM.rE, 2)}. WACC = (${fx(aoMM.E / 1e6)} × ${pc(aoMM.rE, 2)} + ${fx(AO.D / 1e6)} × ${pc(AO.rD, 0)} × 0.75) ÷ ${fx(aoMM.VL / 1e6)} ≈ ${pc(aoMM.wacc, 2)}. Check: WACC = r_U × (1 − T × D/V_L) = 10% × (1 − 0.25 × 16 ÷ 44). In this model the WACC keeps falling as debt rises; costs of financial distress are what stop it in practice.`,
  },
  {
    id: 'f05-fn-21', lesson: 'payout-policy', type: 'steps', kind: 'conceptual',
    prompt: `Glenholme Water (fictional, listed) has ${fx(GW.shares)} shares, fairly valued at ${money(GW.value)}, and earns ${money(GW.earnings)} a year, including ${money(GW.interest)} of after-tax interest on ${money(GW.cash)} of surplus cash. To get the buyback done quickly, its board offers to buy shares with all of that cash at ${money(GW.offer)}, ${pc(GW.offer / GW.value - 1, 0)} above their value. Assume a market without taxes in which investors know the shares’ value.`,
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
          'It leaves everyone as well off as before, because all shareholders could tender',
          'It destroys value for both groups, because cash leaves the firm and earns nothing',
        ],
        answer: 1,
        feedback: {
          0: `EPS does rise, to about ${money(gwEps1, 2)} from ${money(gwEps0, 2)}, because fewer shares share the earnings; but the shares were bought for more than they were worth, and each remaining share is worth less.`,
          2: 'Holders who tender get the premium; those who don’t (or whose shares aren’t all taken) end up with shares worth less. The total is unchanged; the split is not.',
          3: 'The firm’s total value falls by exactly the cash paid out, so no value is destroyed in total: the sellers’ gain is the stayers’ loss.',
        },
      },
    ],
    solution: `Shares bought = ${fx(GW.cash)} ÷ ${GW.offer} ≈ ${fx(gwBought)}, leaving ${fx(gwLeft)}. Value left = ${money(GW.shares * GW.value)} − ${money(GW.cash)} = ${money(GW.shares * GW.value - GW.cash)}, so each remaining share is worth ${money(gwPrice, 2)}. The sellers received ${money(GW.offer - GW.value)} more than value on each of ${fx(gwBought)} shares, about ${money((GW.offer - GW.value) * gwBought)} in all, which the stayers lose. EPS still rises, from ${money(gwEps0, 2)} to ${money(gwEps1, 2)}: EPS accretion says nothing about value.`,
  },
  {
    id: 'f05-fn-22', lesson: 'payout-policy', type: 'mc', kind: 'conceptual',
    prompt: 'Polgrain Ceramics (fictional, listed) has paid a steady dividend for twenty years. It announces that it will halve the dividend to help fund a new kiln, which analysts agree has a positive NPV. The share price falls 6% on the day. Which explanation fits best?',
    options: [
      'In a perfect market a dividend cut always lowers the price by the amount of cash withheld',
      'Investors read the cut as news that managers expect lower earnings',
      'The kiln must have a negative NPV after all, since otherwise the price would have risen',
      'The cut pushes Polgrain’s shareholders into a higher tax bracket on their income',
    ],
    answer: 1,
    feedback: {
      0: 'In a perfect market cash kept in the firm is worth as much as cash paid out, so the policy alone shouldn’t move the price; the money withheld stays in the value of the shares.',
      2: 'A price fall doesn’t show the kiln is bad. The analysts’ view of the kiln may be right while investors are reacting to what the cut suggests about everything else.',
      3: 'Shareholders’ tax rates depend on their own circumstances, not on the size of the firm’s dividend.',
    },
    solution: 'Firms that smooth their dividends cut them only reluctantly, so investors treat a cut as a signal that managers expect earnings to fall. Even if the stated reason is a good investment, the cut can carry that information, and the price falls. Some shareholders who rely on the income (a dividend clientele) may also sell. A firm in this position can explain the cut carefully, or fund the kiln another way and keep the dividend.',
  },
  {
    id: 'f05-fn-23', lesson: 'financial-planning', type: 'steps', kind: 'numerical',
    prompt: `Tregarne Cycles (fictional) had sales of ${money(TC.sales)} last year. Its assets of ${money(TC.assets)} are all in full use and rise in proportion to sales, as do its payables and accruals of ${money(TC.spont)}. Its net margin is ${pc(TC.margin, 0)}, it pays out ${pc(TC.payout, 0)} of its profit, and its equity at the end of the year was ${money(TC.equity)}. It plans ${pc(TC.g, 0)} sales growth next year, with the same margin and payout.`,
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
        id: 'f05-fn-23-s2', type: 'num', prompt: 'What is Tregarne’s sustainable growth rate, with ROE on end-of-year equity? Give a percentage to two decimal places.',
        answer: rnd(tcSgr * 100, 2),
        check: () => { const x = 180_000 / 1_000_000 * 0.6; return x / (1 - x) * 100; },
        unit: '%', places: 2, tol: 0.01,
      },
      {
        id: 'f05-fn-23-s3', type: 'mc', prompt: 'Tregarne’s owners will not sell new shares. What would let it grow as planned?',
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
    solution: `AFN: assets rise by 0.6 × ${money(TC.g * TC.sales)} = ${money(tcA.needAssets)}; payables and accruals by 0.1 × ${money(TC.g * TC.sales)} = ${money(tcA.spont)}; retained earnings add 6% × ${money(tcA.s1)} × 0.6 = ${money(tcA.retained)}. AFN = ${money(tcA.afn)}. SGR: ROE = ${money(TC.margin * TC.sales)} ÷ ${money(TC.equity)} = ${pc(tcRoe, 0)}; ROE × b = ${fx(tcRoe * 0.6, 3)}; SGR = ${fx(tcRoe * 0.6, 3)} ÷ ${fx(1 - tcRoe * 0.6, 3)} ≈ ${pc(tcSgr, 2)}. The plan’s ${pc(TC.g, 0)} outruns it, so with no new shares Tregarne must borrow more than its current debt ratio allows, raise its margin or turnover, or cut its payout; otherwise it must grow more slowly.`,
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
