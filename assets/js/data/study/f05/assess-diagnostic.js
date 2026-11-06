// assess-diagnostic.js — F05 course diagnostic: twelve items, three per module, each written so that it needs the
// module’s own method; a student who knows only F04 (discounting, annuities, perpetuities, loans) and F03 (ratios)
// should miss it, and one who has the module’s method should get it right. What each item needs:
//   dg-1  net-present-value: the discount rate is the opportunity cost of capital at the project’s risk (not the firm’s
//         return on equity or its borrowing rate).
//   dg-2  investment-criteria: two sign changes give two IRRs, so the IRR rule fails and the NPV decides.
//   dg-3  project-cash-flows: a year-0 free cash flow: after-tax sale of an old asset (tax on the gain over book value),
//         working capital net of payables, an expensed cost after tax, and a sunk study left out.
//   dg-4  choosing-between-projects: repeatable projects of unequal lives compared by equivalent annual annuity, not NPV.
//   dg-5  choosing-between-projects: timing; the higher IRR has the lower NPV below the crossover rate.
//   dg-6  project-risk: the financial (NPV) break-even: the investment’s equivalent annual cost less the depreciation
//         tax shield, grossed up for tax, on top of fixed costs.
//   dg-7  cost-of-debt-and-equity: unlever a peer’s beta for a debt-free firm, then the CAPM.
//   dg-8  weighted-average-cost-of-capital: market-value weights and the after-tax cost of debt (book values are the trap).
//   dg-9  weighted-average-cost-of-capital: a project’s own risk sets its rate, not the firm’s WACC.
//   dg-10 capital-structure: Modigliani–Miller with corporate tax, V_L = V_U + T·D, and equity = V_L − D.
//   dg-11 payout-policy: a buyback at a fair price raises EPS but not the share price; the P/E falls.
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
const claim = (ok, what) => { if (!ok) throw new Error(`assess-diagnostic: the figures no longer support “${what}”`); };

// dg-2 Ashgill Contracting: a reclamation contract with a restoration cost at the end
const AS = { flows: [-10_000, 26_000, -16_500], r: 0.20 };
const asIrrs = irrAll(AS.flows), asNpv = npv(AS.r, AS.flows), asSum = AS.flows.reduce((a, b) => a + b, 0);
claim(asIrrs.length === 2 && asIrrs[0] < AS.r && asIrrs[1] > AS.r && asNpv > 0 && asSum < 0, 'two IRRs either side of 20%, a positive NPV and a negative sum');

// dg-3 Thrushcross Dairy: year 0 of a yoghurt line
const TD = { equipment: 60_000, oldPrice: 8_000, oldBook: 3_000, inventory: 12_000, payables: 4_000, training: 5_000, study: 7_000, tax: 0.25 };
const tdOld = TD.oldPrice - TD.tax * (TD.oldPrice - TD.oldBook);
const tdFcf0 = -TD.equipment + tdOld - (TD.inventory - TD.payables) - TD.training * (1 - TD.tax);

// dg-4 Merriden Signs: two repeatable contracts with different lives
const MS = { r: 0.10, a: { npv: 12_000, n: 3 }, b: { npv: 18_000, n: 6 } };
const msA = CF.eaa(MS.a.npv, MS.r, MS.a.n), msB = CF.eaa(MS.b.npv, MS.r, MS.b.n);
claim(msA > msB && MS.b.npv > MS.a.npv, 'the shorter contract has the lower NPV and the higher equivalent annual annuity');

// dg-5 Tolverne Ferries: two refits, same cost, different timing
const TF = { r: 0.08, early: [-50_000, 36_000, 20_000, 8_000], late: [-50_000, 6_000, 16_000, 52_000] };
const tfIrrE = irr(TF.early), tfIrrL = irr(TF.late), tfNpvE = npv(TF.r, TF.early), tfNpvL = npv(TF.r, TF.late), tfX = crossover(TF.late, TF.early)[0];
claim(tfIrrE > tfIrrL && tfNpvL > tfNpvE && tfX > TF.r && tfX < tfIrrL, 'the early refit has the higher IRR, the late one the higher NPV at 8%, and they cross between 8% and both IRRs');

// dg-6 Fellbeck Bakery: a wholesale delivery round
const FB = { price: 25, unitCost: 10, fixed: 30_000, capex: 40_000, n: 4, r: 0.12, tax: 0.25 };
FB.dep = FB.capex / FB.n;
const fbBE = CF.breakEvenVolumes({ price: FB.price, unitCost: FB.unitCost, fixed: FB.fixed, dep: FB.dep, capex: FB.capex, n: FB.n, r: FB.r, tax: FB.tax });

// dg-7 Cawdell Fabrics: one listed peer, a debt-free target
const CW = { beta: 1.30, de: 0.60, tax: 0.25, rf: 0.042, mrp: 0.055 };
const cwBu = CF.unleverBeta(CW.beta, CW.de, CW.tax), cwRe = CF.capm({ rf: CW.rf, beta: cwBu, mrp: CW.mrp });

// dg-8 Marlcombe Glassworks: market against book weights
const MG = { shares: 4_000_000, price: 18, bookEquity: 30_000_000, face: 40_000_000, quote: 0.95, ytm: 0.064, rE: 0.105, tax: 0.25 };
MG.E = MG.shares * MG.price; MG.D = MG.face * MG.quote;
const mgW = CF.wacc({ E: MG.E, D: MG.D, rE: MG.rE, rD: MG.ytm, tax: MG.tax }).wacc;
const mgBook = CF.wacc({ E: MG.bookEquity, D: MG.face, rE: MG.rE, rD: MG.ytm, tax: MG.tax }).wacc;
const mgPre = (MG.E * MG.rE + MG.D * MG.ytm) / (MG.E + MG.D);

// dg-10 Wendron Freight: borrowing to buy back shares, MM with corporate tax
const WF = { Vu: 50_000_000, D: 12_000_000, tax: 0.25 };
const wfMM = CF.mm({ Vu: WF.Vu, D: WF.D, rU: 0.10, rD: 0.05, tax: WF.tax });

// dg-11 Morvah Pasta: a buyback at the market price
const MP = { shares: 10_000_000, price: 20, cash: 20_000_000, earnings: 15_000_000, interest: 600_000 };
const mpPay = CF.payout({ shares: MP.shares, price: MP.price, amount: MP.cash, earnings: MP.earnings, lostIncome: MP.interest });
const mpPE0 = MP.price / mpPay.epsBefore, mpPE1 = mpPay.buyback.priceAfter / mpPay.buyback.eps;
claim(Math.abs(mpPay.buyback.sharesBought / MP.shares - 0.1) < 1e-12 && Math.abs(mpPay.buyback.priceAfter - MP.price) < 1e-9 && mpPay.buyback.eps > mpPay.epsBefore && mpPE1 < mpPE0, 'the price is unchanged, EPS rises and the P/E falls');

// dg-12 Treloweth Tiles: the sustainable growth rate
const TT = { ni: 360_000, div: 90_000, equity: 2_400_000 };
const ttRoe = TT.ni / TT.equity, ttB = 1 - TT.div / TT.ni, ttSgr = CF.sustainableGrowth(ttRoe, ttB);
claim(Math.abs(ttB - 0.75) < 1e-12, 'Treloweth retains three-quarters of its profit');

export const items = [
  // ================================================================ Module 1: Investment decisions
  {
    id: 'f05-dg-1', lesson: 'net-present-value', type: 'mc', kind: 'conceptual',
    prompt: 'Larkhollow Gyms (fictional) earns a return on equity of 18% on its gyms and borrows from its bank at 6%. It has been offered a contract to supply fitness equipment to a government agency, which would pay fixed amounts each year for five years; the payments are as safe as government bonds, which yield 4%. What rate should Larkhollow use to find the contract’s NPV?',
    options: [
      '18%: the contract must earn at least what the gyms already return on equity',
      'About 4%, the return on investments as safe as the agency’s payments',
      '6%, because that is what the money to fund the contract would cost to borrow',
      'An average of 18% and 6%, weighted by how much of the contract is financed by each',
    ],
    answer: 1,
    feedback: {
      0: 'The 18% is what the gyms, a much riskier business, earn on equity in the accounts. The contract’s payments are as safe as government bonds, and investors could earn 4% elsewhere at that risk; that is the return the contract gives up.',
      2: 'The borrowing rate reflects the bank’s risk in lending to Larkhollow as a whole, not the risk of this contract’s cash flows. The rate to use is what investors could earn elsewhere on investments as risky as the project.',
      3: 'How the contract is paid for doesn’t set its rate; the risk of its cash flows does. A blend of the gyms’ return and the bank rate describes neither.',
    },
    solution: 'The discount rate in an NPV is the opportunity cost of capital: the expected return investors could earn elsewhere on investments of the same risk as the project. The agency’s payments are about as safe as government bonds, so about 4% is the right rate. Using 18% would turn away safe contracts that add value; Larkhollow’s own return on equity measures the risk of its gyms, not of this contract.',
  },
  {
    id: 'f05-dg-2', lesson: 'investment-criteria', type: 'mc', kind: 'applied',
    prompt: `Ashgill Contracting (fictional) can take a land-reclamation contract: it spends ${money(-AS.flows[0])} on equipment now, is paid ${money(AS.flows[1])} at the end of year 1, and must spend ${money(-AS.flows[2])} restoring the site at the end of year 2. Its opportunity cost of capital is ${pc(AS.r, 0)}. A spreadsheet’s IRR function returns ${pc(asIrrs[0])}. What should Ashgill do?`,
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
    prompt: `Thrushcross Dairy (fictional) is starting a yoghurt line today. It buys equipment for ${money(TD.equipment)} and sells an old filler that the line replaces for ${money(TD.oldPrice)}; the filler’s tax book value is ${money(TD.oldBook)}. Inventory rises by ${money(TD.inventory)} and payables by ${money(TD.payables)}. Staff training costs ${money(TD.training)} today and is expensed for tax. Last year the dairy paid ${money(TD.study)} for a market study of the line. Tax is ${pc(TD.tax, 0)}, and the dairy’s other profits absorb any deduction. What is the project’s free cash flow at year 0? Give whole dollars, with a minus sign for an outflow.`,
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
    prompt: `Merriden Signs (fictional) can fit out its workshop in one of two ways, not both, and expects to renew the choice on the same terms when each ends. Option A has an NPV of ${money(MS.a.npv)} and lasts ${MS.a.n} years; option B has an NPV of ${money(MS.b.npv)} and lasts ${MS.b.n} years. Both NPVs are at ${pc(MS.r, 0)}. How much more value a year, in equivalent annual terms, does the better option add? Give whole dollars.`,
    answer: rnd(msA - msB, 0),
    check: () => {
      const af = (n) => (1 - 1.1 ** -n) / 0.1;
      return 12_000 / af(3) - 18_000 / af(6);
    },
    unit: '$', places: 0, tol: 2,
    wrong: [
      { value: MS.b.npv - MS.a.npv, say: 'That compares the NPVs, which cover different periods: B’s six years against A’s three. Spread each NPV over its own life as an annuity (the equivalent annual annuity) and compare those.' },
      { value: rnd(MS.b.npv / MS.b.n - MS.a.npv / MS.a.n, 0), say: 'Dividing each NPV by its life ignores the time value of money. The equivalent annual annuity is NPV ÷ the annuity factor at 10%.' },
      { value: rnd(msA, 0), say: 'That is A’s equivalent annual annuity on its own. Subtract B’s.' },
    ],
    solution: `Equivalent annual annuity = NPV ÷ annuity factor. A: ${fx(MS.a.npv)} ÷ ${fx((1 - 1.1 ** -3) / 0.1, 4)} ≈ ${money(msA, 2)} a year. B: ${fx(MS.b.npv)} ÷ ${fx((1 - 1.1 ** -6) / 0.1, 4)} ≈ ${money(msB, 2)} a year. A adds about ${money(msA - msB)} a year more, so A wins although its own NPV is smaller: repeated every three years, it earns its NPV twice in six years. The comparison assumes each choice can be repeated on the same terms.`,
  },
  {
    id: 'f05-dg-5', lesson: 'choosing-between-projects', type: 'mc', kind: 'conceptual',
    prompt: `Tolverne Ferries (fictional) can refit its ferry in one of two ways, each costing ${money(-TF.early[0])} today. The quick refit returns ${TF.early.slice(1).map((v) => money(v)).join(', ')} at the end of years 1 to 3 (IRR ${pc(tfIrrE)}). The thorough refit returns ${TF.late.slice(1).map((v) => money(v)).join(', ')} (IRR ${pc(tfIrrL)}). Tolverne’s cost of capital is ${pc(TF.r, 0)}. Which refit should it choose?`,
    options: [
      'The quick refit, because its higher IRR shows the better return on the same outlay',
      `The thorough refit: its NPV at ${pc(TF.r, 0)} is higher, about ${money(tfNpvL)} against ${money(tfNpvE)}`,
      'The quick refit, because its money comes back sooner and is less exposed to risk',
      'Either: both IRRs are well above 8%, so both refits are acceptable and equally good',
    ],
    answer: 1,
    feedback: {
      0: `For mutually exclusive projects the IRR can rank them wrongly. The two NPV profiles cross at about ${pc(tfX)}; below that rate the thorough refit, with its larger later cash flows, has the higher NPV.`,
      2: 'Both refits are discounted at the same 8%, so the rate already prices the time value of money; if the thorough refit’s later cash flows were riskier, the rate would have to say so.',
      3: 'Both pass on their own, but only one can be done. Choose the one that adds more value at the cost of capital.',
    },
    solution: `At ${pc(TF.r, 0)}: quick refit NPV ≈ ${money(tfNpvE)}, thorough refit NPV ≈ ${money(tfNpvL)}. The IRRs rank them the other way because the quick refit’s cash comes back early, which matters more at high rates. The NPV profiles cross at about ${pc(tfX)}: below it the thorough refit is worth more. At Tolverne’s ${pc(TF.r, 0)}, choose the thorough refit.`,
  },
  {
    id: 'f05-dg-6', lesson: 'project-risk', type: 'num', kind: 'numerical',
    prompt: `Fellbeck Bakery (fictional) is considering a wholesale delivery round. It sells boxes of pastries at ${money(FB.price)} each, which cost ${money(FB.unitCost)} each to bake. Fixed cash costs are ${money(FB.fixed)} a year. The van costs ${money(FB.capex)} today and is depreciated straight line over ${FB.n} years to zero, after which it is scrapped. Tax is ${pc(FB.tax, 0)}, the required return ${pc(FB.r, 0)}, and the bakery’s other profits absorb any tax loss. How many boxes a year must the round sell for its NPV to be zero? Round to the nearest box.`,
    answer: rnd(fbBE.financial, 0),
    check: () => {
      const af = (1 - 1.12 ** -4) / 0.12, ocfNeeded = 40_000 / af;           // the OCF a year that repays the van at 12%
      // OCF = (Q × 15 − 30,000 − 10,000) × 0.75 + 10,000
      return ((ocfNeeded - 10_000) / 0.75 + 30_000 + 10_000) / 15;
    },
    unit: 'boxes', places: 0, tol: 1,
    wrong: [
      { value: rnd(fbBE.accounting, 0), say: 'That is the accounting break-even (EBIT = 0), which only recovers the van’s cost, not the 12% return on the money tied up in it.' },
      { value: rnd(fbBE.cash, 0), say: 'That is the cash break-even, which covers only the fixed cash costs. The NPV break-even must also earn back the van with a 12% return.' },
      { value: rnd((FB.fixed + CF.eaa(FB.capex, FB.r, FB.n)) / (FB.price - FB.unitCost), 0), say: `That ignores tax. Operating profit is taxed at ${pc(FB.tax, 0)}, and depreciation saves tax of 0.25 × ${money(FB.dep)} a year: OCF = (Q × ${FB.price - FB.unitCost} − ${fx(FB.fixed)} − ${fx(FB.dep)}) × 0.75 + ${fx(FB.dep)}.` },
    ],
    solution: `The van’s equivalent annual cost at ${pc(FB.r, 0)} over ${FB.n} years is ${fx(FB.capex)} ÷ ${fx((1 - 1.12 ** -4) / 0.12, 4)} ≈ ${money(CF.eaa(FB.capex, FB.r, FB.n), 2)}: the operating cash flow needed each year for NPV = 0. OCF = (Q × ${FB.price - FB.unitCost} − ${fx(FB.fixed)} − ${fx(FB.dep)}) × 0.75 + ${fx(FB.dep)}. Setting it equal: Q = [${fx(FB.fixed)} + (${fx(CF.eaa(FB.capex, FB.r, FB.n), 2)} − 0.25 × ${fx(FB.dep)}) ÷ 0.75] ÷ ${FB.price - FB.unitCost} ≈ ${fx(fbBE.financial, 1)}, about ${fx(fbBE.financial)} boxes a year, against an accounting break-even of ${fx(fbBE.accounting)} and a cash break-even of ${fx(fbBE.cash)}.`,
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
    id: 'f05-dg-9', lesson: 'weighted-average-cost-of-capital', type: 'mc', kind: 'conceptual',
    prompt: 'Cresswold Energy (fictional) develops wind farms and its WACC is 11%. It could also buy an office building already let on a long lease to a government department; the rent is fixed and very safe. Listed property firms that own buildings let to governments have a cost of capital of about 6%. The building’s expected return is 8%. What should Cresswold conclude?',
    options: [
      'Reject it, because 8% is below the 11% Cresswold’s capital costs',
      'Accept it only if Cresswold can borrow the whole price at less than 8%',
      'Use an average of 11% and 6%, since the building would join Cresswold’s other assets',
      'It adds value if 6% fits the rent’s risk: judge it at that rate, not at the WACC',
    ],
    answer: 3,
    feedback: {
      0: 'The 11% is the right rate for Cresswold’s average project, a wind farm. The building’s rent is far safer, so investors would accept about 6% on it; rejecting it at 11% turns away value.',
      1: 'How the purchase is financed doesn’t set its rate. The rent’s risk does, and investors would accept about 6% for that risk.',
      2: 'An average of the two rates belongs to neither the wind farms nor the building. Each project’s cash flows are discounted at the return investors require for their own risk.',
    },
    solution: 'A firm’s WACC is the right rate only for projects as risky as the firm’s average. The building’s fixed, government-backed rent is much safer than wind farms, so its rate comes from firms that own such buildings: about 6%. Its 8% expected return beats that, so it adds value. Using the 11% WACC for every project rejects safe projects that add value and accepts risky ones that don’t.',
  },

  // ================================================================ Module 4: Financing and payout
  {
    id: 'f05-dg-10', lesson: 'capital-structure', type: 'num', kind: 'numerical',
    prompt: `Wendron Freight (fictional, listed) has no debt and is worth ${money(WF.Vu)}. It pays corporate tax at ${pc(WF.tax, 0)}. It will borrow ${money(WF.D)}, keep the debt permanently, and use the money to buy back shares. Under Modigliani and Miller with corporate tax (no costs of financial distress), what will the market value of Wendron’s equity be after the buyback? Give whole dollars.`,
    answer: rnd(wfMM.E, 0),
    check: () => 50_000_000 + 0.25 * 12_000_000 - 12_000_000,
    unit: '$', places: 0, tol: 1,
    wrong: [
      { value: WF.Vu - WF.D, say: 'That is MM without taxes: the firm’s value is unchanged and equity falls by the debt. With corporate tax, interest saves tax, and permanent debt adds the tax shields’ present value, T × D, to the firm.' },
      { value: rnd(wfMM.VL, 0), say: 'That is the value of the whole levered firm, debt and equity together. The shareholders’ part is V_L − D.' },
      { value: WF.Vu, say: 'The buyback hands $12,000,000 to the selling shareholders, so the remaining equity is worth less than the whole firm.' },
    ],
    solution: `V_L = V_U + T × D = ${money(WF.Vu)} + 0.25 × ${money(WF.D)} = ${money(wfMM.VL)}. Equity = V_L − D = ${money(wfMM.VL)} − ${money(WF.D)} = ${money(wfMM.E)}. The ${money(WF.tax * WF.D)} of tax shields goes to the shareholders, who also received ${money(WF.D)} in the buyback.`,
  },
  {
    id: 'f05-dg-11', lesson: 'payout-policy', type: 'mc', kind: 'conceptual',
    prompt: `Morvah Pasta (fictional, listed) has ${fx(MP.shares)} shares trading at ${money(MP.price)} and earns ${money(MP.earnings)} a year, including ${money(MP.interest)} of after-tax interest on ${money(MP.cash)} of surplus cash. It uses all the surplus cash to buy back shares at ${money(MP.price)}. In a perfect market, what happens?`,
    options: [
      `EPS rises to ${money(mpPay.buyback.eps, 2)} and, at an unchanged P/E of ${fx(mpPE0, 1)}, the price rises to ${money(mpPay.buyback.eps * mpPE0, 2)}`,
      `EPS rises to ${money(MP.earnings / mpPay.buyback.shares, 2)}, the same earnings spread over fewer shares, so the price rises`,
      `EPS rises to ${money(mpPay.buyback.eps, 2)}, the price stays at ${money(MP.price)} and the P/E falls from ${fx(mpPE0, 1)} to ${fx(mpPE1, 1)}`,
      `Neither EPS nor the price changes, because the shares are bought back at a fair price`,
    ],
    answer: 2,
    feedback: {
      0: 'The P/E doesn’t stay put. The cash Morvah paid out was safe; the earnings left are all from the riskier pasta business, so investors pay less for each dollar of them. The shares were bought at their value, so the remaining ones are worth exactly what they were.',
      1: `The cash that went to the sellers no longer earns its ${money(MP.interest)}, so earnings fall to ${money(MP.earnings - MP.interest)} before they are spread over the remaining shares.`,
      3: 'The price is unchanged, but EPS does rise: earnings fall by only the interest the cash earned, while the number of shares falls by a tenth.',
    },
    solution: `Shares bought = ${money(MP.cash)} ÷ ${money(MP.price)} = ${fx(mpPay.buyback.sharesBought)}, leaving ${fx(mpPay.buyback.shares)}. EPS before = ${money(mpPay.epsBefore, 2)}; after = (${fx(MP.earnings)} − ${fx(MP.interest)}) ÷ ${fx(mpPay.buyback.shares)} = ${money(mpPay.buyback.eps, 2)}. Value left = ${money(MP.shares * MP.price)} − ${money(MP.cash)} = ${money(MP.shares * MP.price - MP.cash)}, or ${money(mpPay.buyback.priceAfter, 2)} a share. EPS rises, but the price doesn’t: the P/E falls from ${fx(mpPE0, 2)} to ${fx(mpPE1, 2)} because the earnings left are riskier. A higher EPS is not a gain in value.`,
  },
  {
    id: 'f05-dg-12', lesson: 'financial-planning', type: 'num', kind: 'applied',
    prompt: `Treloweth Tiles (fictional) earned net income of ${money(TT.ni)} last year and paid dividends of ${money(TT.div)}. Its equity at the end of the year was ${money(TT.equity)}, and it issued and bought back no shares. If it keeps its profit margin, asset turnover, payout ratio and debt-to-equity ratio as they are, and sells no new shares, how fast can its sales grow? Give a percentage to two decimal places.`,
    answer: rnd(ttSgr * 100, 2),
    check: () => { const retained = 360_000 - 90_000; return retained / (2_400_000 - retained) * 100; },
    unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(ttRoe * ttB * 100, 2), say: 'ROE × b is the growth in equity measured on the end-of-year equity. Equity grows from the start of the year: with ROE on end-of-year equity, the sustainable growth rate is ROE × b ÷ (1 − ROE × b).' },
      { value: rnd(ttRoe * 100, 2), say: 'That is the return on equity. Only the retained part of profit, 75% of it, adds to equity.' },
      { value: rnd(CF.internalGrowth(TT.ni / TT.equity, 1) * 100, 2), say: 'That assumes all profit is retained. Treloweth pays out a quarter of it, so the retention ratio is 0.75.' },
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
