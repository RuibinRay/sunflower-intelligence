// project.js — F05 applied project: funding Lantern's second kitchen. Every fact comes from case.js (KITCHEN, HOLLIS,
// DEBT, PEERS, MARKET, FORECAST_MAR28, COVENANT); every number is computed below and checked by `verify` and the checker.
import { KITCHEN as K, HOLLIS as H, DEBT, PEERS, MARKET, TAX, FORECAST_MAR28 as FC, COVENANT, WORKING_RATE, DERIVED as D, kitchenFlows } from './case.js?v=28';
import * as CF from '../../../core/corpfin.js?v=28';
import { appraise, npv } from '../../../core/invest.js?v=28';

// ---------------------------------------------------------------- the kitchen's cash flows
const KF = kitchenFlows();
const FCF = KF.fcf;
const DEP1 = KF.rows[1].depreciation;                                   // 8,574 + 7,200
const MACRS7 = CF.depreciation(K.equipment, { method: 7 });
const BOOK = K.equipment - MACRS7.slice(0, K.years).reduce((a, b) => a + b, 0);   // equipment's tax book value after 5 years
const SALV = KF.rows[K.years].salvage;                                  // after-tax salvage
// ---------------------------------------------------------------- the cost of capital after the financing
const POST = H.cash / H.stake, PRE = POST - H.cash;                     // 250,000 and 175,000
const LOAN = DEBT.termLoan.amount, DV = LOAN / (POST + LOAN), DE = LOAN / POST;
const BETA_U = D.betaU, BETA_L = CF.releverBeta(BETA_U, DE, TAX);
const RE = CF.capm({ rf: MARKET.rf, beta: BETA_L, mrp: MARKET.mrp }) + MARKET.smallFirm;
const WACC = CF.wacc({ E: POST, D: LOAN, rE: RE, rD: DEBT.termLoan.rate, tax: TAX }).wacc;
// ---------------------------------------------------------------- value and risk
const A = appraise(FCF, { rate: WACC });
const npvScaled = (s, over = {}) => npv(WACC, kitchenFlows({ revenue: K.revenue.map((x) => x * s), ...over }).fcf);
const BE = CF.breakEven((v) => npvScaled(v.s), { s: 1 }, 's', 0.5, 1);   // revenue as a share of the forecast at NPV 0
const PESS = { scale: 0.85, variableShare: 0.45, fixed: 44_000 }, OPT = { scale: 1.1, variableShare: 0.40, fixed: 38_000 };
const NPV_PESS = npvScaled(PESS.scale, { variableShare: PESS.variableShare, fixed: PESS.fixed });
const NPV_OPT = npvScaled(OPT.scale, { variableShare: OPT.variableShare, fixed: OPT.fixed });
// ---------------------------------------------------------------- the loan and the covenant
const rm = DEBT.termLoan.rate / 12, PMT = LOAN * rm / (1 - (1 + rm) ** -(DEBT.termLoan.years * 12));
let bal = LOAN, P12 = 0, I12 = 0;
for (let m = 1; m <= 12; m++) { const it = bal * rm; I12 += it; P12 += PMT - it; bal -= PMT - it; }
const CA0 = FC.assets.reduce((s, x) => s + x[1], 0), CL0 = FC.liabilities.reduce((s, x) => s + x[1], 0);
const CAPEX = K.equipment + K.fitOut;
const CA1 = CA0 + H.cash + LOAN - CAPEX, CL1 = CL0 + P12;               // the kitchen's opening stock moves cash into inventory: current assets unchanged
const LOC = FC.liabilities.find((x) => x[0] === 'Line of credit')[1];
const CR0 = CA0 / CL0, CR1 = CA1 / CL1, CR2 = (CA1 - LOC) / (CL1 - LOC);
const MAXDIV = (CA1 - LOC) - COVENANT.currentRatio * (CL1 - LOC);
const HOLLIS_WORTH = H.stake * (PRE + H.cash + A.npv);

const f = (x, d = 2) => (x < 0 ? `−${Math.abs(x).toFixed(d)}` : x.toFixed(d));
const money = (x, d = 0) => `${x < 0 ? '−' : ''}$${Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const pc = (x, d = 1) => `${(x * 100).toFixed(d)}%`;
const r = (x, d) => Math.round(x * 10 ** d) / 10 ** d;
const num = (id, prompt, answer, check, solution, wrong, { unit = '$', places = 0, tol, kind = 'numerical' } = {}) =>
  ({ id, type: 'num', kind, unit, places, prompt, answer, check, tol: tol ?? 0.6 * 10 ** -places, solution, ...(wrong ? { wrong } : {}) });

const table = (caption, head, rows, align) => ({ table: { caption, head, rows, align } });
const htmlTable = (caption, head, rows) => `<div class="table-scroll"><table class="data-table study-table"><caption>${caption}</caption><thead><tr>${head.map((x) => `<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${rows.map(([a, b, cls]) => `<tr${cls ? ` class="${cls}"` : ''}><th scope="row">${a}</th><td>${b}</td></tr>`).join('')}</tbody></table></div>`;
const fmt = (x) => x.toLocaleString('en-US', { maximumFractionDigits: 0 });

// ---------------------------------------------------------------- tools
const kitchenInputs = [
  { id: 'scale', label: 'Revenue (% of forecast)', min: 60, max: 130, step: 1, value: 100, fmt: 'pct' },
  { id: 'vshare', label: 'Variable costs (% of revenue)', min: 30, max: 55, step: 1, value: Math.round(K.variableShare * 100), fmt: 'pct' },
  { id: 'fixed', label: 'Fixed costs besides rent ($ a year)', min: 25_000, max: 60_000, step: 500, value: K.fixed, fmt: 'money' },
  { id: 'rate', label: 'Discount rate', min: 5, max: 25, step: 0.05, value: WORKING_RATE * 100, fmt: 'pct', digits: 2 },
];
const kitchenModel = (v) => {
  const depE = CF.depreciation(K.equipment, { method: 7 }).slice(0, K.years), depF = CF.depreciation(K.fitOut, { life: K.years });
  return { capex: CAPEX, years: K.years, revenue: K.revenue.map((x) => x * v.scale / 100), variableShare: v.vshare / 100, fixed: v.fixed + K.rent,
    dep: depE.map((d, i) => d + depF[i]), tax: TAX, nwcShare: K.nwcShare, salvage: K.salvageEquipment };
};
const forecastTool = { kind: 'widget', widget: { type: 'capbudget', title: 'The second kitchen: free cash flow, April 2028 – March 2033', inputs: kitchenInputs, model: kitchenModel, rate: 'rate', show: ['table', 'metrics'],
  note: `The sliders start at the forecast and Ana’s working rate of ${pc(WORKING_RATE, 0)}. Depreciation is 7-year MACRS on the equipment and straight line over the five-year lease on the fit-out; rent of ${money(K.rent)} a year is added to the fixed costs.` } };
const riskTool = { kind: 'widget', widget: { type: 'capbudget', title: 'What could go wrong with the kitchen?', inputs: kitchenInputs, model: kitchenModel, rate: 'rate', show: ['metrics', 'profile', 'tornado'],
  tornado: { scale: [80, 120], vshare: [38, 46], fixed: [34_000, 46_000], rate: [9, 14] },
  note: 'Set the discount rate to the WACC you estimated (the slider moves in steps of 0.05 points). The tornado moves one input at a time, the others held where the sliders are.' } };
const waccTool = { kind: 'widget', widget: { type: 'capstructure', title: 'Lantern’s cost of capital after the financing', peers: PEERS, rf: MARKET.rf, mrp: MARKET.mrp, premium: MARKET.smallFirm, tax: TAX, rD: DEBT.termLoan.rate, dv: 0.2, dvMax: 0.6,
  note: 'The slider moves in whole percentage points, so it can only get close to Lantern’s actual debt share: work the exact figures by hand (or in a spreadsheet) from the widget’s formulas.' } };

const kitchenTable = table('The second kitchen: Ana’s forecast (all fictional)', ['Item', 'Figure'], [
  ['Opens', K.opens], ['Ovens, blast chiller, mixers', `${money(K.equipment)} (7-year MACRS), worth ${money(K.salvageEquipment)} after five years`],
  ['Fit-out (leasehold improvements)', `${money(K.fitOut)}, worth nothing at the end; for simplicity, depreciated for tax straight line over the five-year lease`],
  ['Rent', `${money(K.rent / 12)} a month`], ['Extra catering and wholesale bakery sales', K.revenue.map((x) => money(x)).join(', ') + ' (years 1–5)'],
  ['Ingredients, packaging, cooks and event staff', `${pc(K.variableShare, 0)} of sales`], ['A part-time kitchen supervisor, utilities, insurance and cleaning', `${money(K.fixed)} a year (cooks and event staff are paid by the job and counted in the variable costs)`],
  ['Working capital (stock, receivables less payables)', `${pc(K.nwcShare, 0)} of the coming year’s sales, all recovered at the end`], ['Tax', `${pc(TAX, 0)}; a loss saves tax on Lantern’s other profits`],
], ['l', 'l']);
const forecastTable = htmlTable('Current items forecast for 31 March 2028, before the kitchen and its financing ($; fictional)', ['Item', 'Amount'], [
  ...FC.assets.map(([n, v]) => [n, fmt(v)]), ['Current assets', fmt(CA0), 'is-total'],
  ...FC.liabilities.map(([n, v]) => [n, fmt(v)]), ['Current liabilities, as the covenant counts them', fmt(CL0), 'is-total'],
  ['Current portion of operating lease liabilities (left out by the covenant)', fmt(FC.leases)],
]);

export default {
  title: 'Funding Lantern’s second kitchen',
  brief: [
    { case: `February 2028. Lantern’s catering and wholesale bakery orders have outgrown the kitchen it has rented since 2026, and Ana has found a second one to lease from ${K.opens}. Fitting it out costs ${money(CAPEX)}, more than Lantern can find on its own. Coastline Bank will lend ${money(LOAN)} over five years at ${pc(DEBT.termLoan.rate, 1)} (monthly payments from 1 April 2028), on condition that Lantern’s current ratio, as the loan agreement defines it, stays at least ${COVENANT.currentRatio} at each quarter end. ${H.name}, a private investor, offers ${money(H.cash)} for new shares that would give her ${pc(H.stake, 0)} of Lantern; she says she wants at least ${pc(H.required, 0)} a year on her money. Both deals would close in March, before the kitchen opens. Ana, Hollis, the kitchen, the bank and every figure are fictional.` },
    { p: 'Ana asks you four things: what the kitchen’s free cash flows are, what rate to discount them at now that Lantern will have outside owners and a bank loan, whether the kitchen is worth it and how badly it could go, and whether the financing works: the covenant, the price Hollis is paying, and how much room is left for a dividend.' },
    kitchenTable,
  ],
  deliverables: [
    'The kitchen’s free cash flows for years 0–5, with depreciation, working capital and after-tax salvage shown.',
    'Lantern’s weighted average cost of capital after the financing, with the beta, the cost of equity and the weights stated.',
    'The kitchen’s NPV, IRR and payback at that rate, its break-even sales and a pessimistic scenario.',
    'The covenant test on 31 March 2028 before and after the financing, and the largest dividend it allows.',
    'What Hollis’s shares are worth at her price, and a memo to Ana.',
  ],
  stages: [
    {
      id: 'forecast', title: 'The kitchen’s free cash flows',
      html: '<p>Build the kitchen’s free cash flows from the forecast. Leave the financing out: the loan’s interest and repayments, and Hollis’s money, enter through the discount rate in the next stage, not the cash flows.</p>',
      tool: forecastTool,
      items: [
        num('f05-pj-1', 'What is the kitchen’s depreciation for tax in year 1 (equipment and fit-out together)? Give dollars.', DEP1,
          () => K.equipment * 14.29 / 100 + K.fitOut / K.years,
          `Equipment: 14.29% (7-year MACRS, year 1) × ${money(K.equipment)} = ${money(K.equipment * 0.1429)}. Fit-out: ${money(K.fitOut)} ÷ ${K.years} = ${money(K.fitOut / K.years)}. Total ${money(DEP1)}.`,
          [{ value: K.equipment / 7 + K.fitOut / K.years, say: 'That depreciates the equipment straight line over seven years. The tax rules give 14.29% in year 1 (the half-year convention).' }],
          { tol: 1 }),
        num('f05-pj-2', 'What is the kitchen’s free cash flow in year 0? Give dollars (negative for an outflow).', FCF[0],
          () => -(CAPEX + K.nwcShare * K.revenue[0]),
          `Capital spending ${money(CAPEX)} plus the working capital needed before the first year: ${pc(K.nwcShare, 0)} × ${money(K.revenue[0])} = ${money(K.nwcShare * K.revenue[0])}. Year 0: ${money(FCF[0])}.`,
          [{ value: -CAPEX, say: 'The kitchen needs stock and will wait to be paid by catering customers: the working capital for year 1 is tied up at the start.' }],
          { tol: 1 }),
        num('f05-pj-3', 'What is the kitchen’s free cash flow in year 1? Give dollars.', r(FCF[1], 0),
          () => FCF[1],
          `Revenue ${money(K.revenue[0])} − variable ${money(K.revenue[0] * K.variableShare)} − fixed and rent ${money(K.fixed + K.rent)} − depreciation ${money(DEP1)} = EBIT ${money(KF.rows[1].ebit)}; tax ${money(KF.rows[1].taxes)}; operating cash flow ${money(KF.rows[1].ocf)}; less the increase in working capital (${money(KF.rows[1].nwc)} − ${money(KF.rows[0].nwc)} = ${money(KF.rows[1].dNwc)}) gives ${money(FCF[1])}.`,
          [{ value: r(KF.rows[1].ocf, 0), say: 'That is the operating cash flow. Year 2’s higher sales need more working capital, and the increase is spent in year 1.' }],
          { tol: 2 }),
        num('f05-pj-4', 'The equipment is sold for its expected value at the end of year 5. What does the sale add to year 5’s cash flow after tax? Give dollars.', SALV,
          () => K.salvageEquipment - TAX * (K.salvageEquipment - BOOK),
          `After five years of 7-year MACRS, ${pc((8.92 + 8.93 + 4.46) / 100, 2)} of the equipment’s cost is undepreciated: book value ${money(BOOK)}. Selling at ${money(K.salvageEquipment)} is a loss of ${money(BOOK - K.salvageEquipment)}, which saves ${money(TAX * (BOOK - K.salvageEquipment))} of tax: ${money(K.salvageEquipment)} + ${money(TAX * (BOOK - K.salvageEquipment))} = ${money(SALV, 1)}.`,
          [{ value: K.salvageEquipment * (1 - TAX), say: 'That taxes the whole sale price. Only a gain over book value is taxed, and here the sale is below book, so it saves tax.' },
            { value: K.salvageEquipment, say: 'The sale is below the equipment’s tax book value, so the loss saves tax on Lantern’s other profits.' }],
          { tol: 1 }),
        { id: 'f05-pj-5', type: 'multi', kind: 'conceptual',
          prompt: 'Which of these belong in the kitchen’s free cash flows? Select all that apply.',
          options: [
            'The interest Lantern will pay Coastline on the loan',
            'The rent on the second kitchen',
            'The $9,000 Ana paid an architect in January 2028 to check whether the space could be fitted out (spent whether or not she goes ahead)',
            'Margin lost at Lantern’s first kitchen if some of its catering orders move to the new one',
            'Stock held in the new kitchen, recovered when it closes',
          ],
          answer: [1, 3, 4],
          solution: 'Rent, side effects on Lantern’s other business and working capital are incremental cash flows. Interest is a financing flow: it is in the discount rate, so counting it again would charge for the money twice. The architect’s fee is sunk (it was spent whether or not the kitchen goes ahead). Margin the first kitchen loses to the new one is a side effect: only the extra business the second kitchen brings is incremental.' },
      ],
    },
    {
      id: 'rate', title: 'Lantern’s cost of capital after the financing',
      html: `<p>After March, Lantern will have ${money(LOAN)} of term debt and equity priced by Hollis’s deal. Use her price to value Lantern’s equity, the three comparable firms for beta, and Ana’s market assumptions: risk-free rate ${pc(MARKET.rf, 1)}, market risk premium ${pc(MARKET.mrp, 1)}, plus the ${pc(MARKET.smallFirm, 0)} she adds for a small private firm. Coastline’s ${pc(DEBT.termLoan.rate, 1)} is the cost of new debt. Leave the line of credit out of the weights: it finances working capital and will be repaid.</p>`,
      tool: waccTool,
      items: [
        num('f05-pj-6', `Hollis pays ${money(H.cash)} for ${pc(H.stake, 0)} of Lantern after the deal. What value does her price put on all of Lantern’s equity after the deal (the post-money value)? Give dollars.`, POST,
          () => H.cash / H.stake,
          `${money(H.cash)} ÷ ${H.stake} = ${money(POST)}. Before her money arrives (the pre-money value), that is ${money(POST)} − ${money(H.cash)} = ${money(PRE)}.`,
          [{ value: PRE, say: 'That is the pre-money value. After the deal the company also holds Hollis’s cash.' }, { value: H.cash / (1 - H.stake), say: 'Her 30% is of the company after the deal: divide her payment by 0.30.' }],
          { tol: 1 }),
        num('f05-pj-7', 'Using that equity value and the term loan, what is Lantern’s debt as a share of its total value, D/V? Give a percentage to two decimal places.', r(DV * 100, 2),
          () => LOAN / (H.cash / H.stake + LOAN) * 100,
          `${money(LOAN)} ÷ (${money(POST)} + ${money(LOAN)}) = ${pc(DV, 2)}. D/E is ${money(LOAN)} ÷ ${money(POST)} = ${f(DE, 2)}.`,
          [{ value: r(DE * 100, 2), say: 'That is D/E. D/V divides by debt plus equity.' }],
          { unit: '%', places: 2, tol: 0.006 }),
        num('f05-pj-8', 'Unlever the three peers’ betas, average them, relever at Lantern’s D/E and add Ana’s premium. What is Lantern’s cost of equity? Give a percentage to two decimal places.', r(RE * 100, 2),
          () => (CF.capm({ rf: MARKET.rf, beta: CF.releverBeta(PEERS.reduce((s, p) => s + CF.unleverBeta(p.beta, p.de, p.tax), 0) / PEERS.length, LOAN / POST, TAX), mrp: MARKET.mrp }) + MARKET.smallFirm) * 100,
          `Unlevered betas ${PEERS.map((p) => f(CF.unleverBeta(p.beta, p.de, p.tax), 3)).join(', ')}; average ${f(BETA_U, 3)}. Relevered: ${f(BETA_U, 3)} × (1 + 0.75 × ${f(DE, 2)}) = ${f(BETA_L, 3)}. Cost of equity: ${pc(MARKET.rf)} + ${f(BETA_L, 3)} × ${pc(MARKET.mrp)} + ${pc(MARKET.smallFirm)} = ${pc(RE, 2)}.`,
          [{ value: r((CF.capm({ rf: MARKET.rf, beta: PEERS.reduce((s, p) => s + p.beta, 0) / 3, mrp: MARKET.mrp }) + MARKET.smallFirm) * 100, 2), say: 'That averages the peers’ equity betas as they are. Each carries its own firm’s leverage: unlever them first, then relever at Lantern’s.' },
            { value: r(CF.capm({ rf: MARKET.rf, beta: BETA_L, mrp: MARKET.mrp }) * 100, 2), say: 'Add the 3% premium Ana uses for a small private firm.' }],
          { unit: '%', places: 2, tol: 0.03 }),
        num('f05-pj-9', 'What is Lantern’s WACC after the financing? Give a percentage to two decimal places.', r(WACC * 100, 2),
          () => (POST / (POST + LOAN) * RE + LOAN / (POST + LOAN) * DEBT.termLoan.rate * (1 - TAX)) * 100,
          `${pc(1 - DV, 2)} × ${pc(RE, 2)} + ${pc(DV, 2)} × ${pc(DEBT.termLoan.rate)} × (1 − ${TAX}) = ${pc(WACC, 2)}.`,
          [{ value: r((POST / (POST + LOAN) * RE + LOAN / (POST + LOAN) * DEBT.termLoan.rate) * 100, 2), say: 'Interest is tax-deductible: use the after-tax cost of debt, 7.5% × (1 − 0.25).' }],
          { unit: '%', places: 2, tol: 0.03 }),
        { id: 'f05-pj-10', type: 'mc', kind: 'conceptual',
          prompt: `Hollis wants at least ${pc(H.required, 0)} a year; your cost of equity is lower. Which rate should Lantern use for the kitchen’s cash flows?`,
          options: [
            `${pc(H.required, 0)}, because Hollis is the marginal investor and her price sets the cost of all of Lantern’s equity`,
            `The WACC you estimated, if the kitchen is about as risky as Lantern’s existing business`,
            `${pc(DEBT.termLoan.rate, 1)}, because Coastline’s loan pays for most of the kitchen and its rate is a contracted, observable cost`,
            `${pc(WORKING_RATE, 0)}, Ana’s working rate, because one rate for every project keeps decisions consistent from year to year`,
          ],
          answer: 1,
          feedback: {
            0: 'Hollis isn’t a market: her 20% reflects one illiquid, undiversified stake and her bargaining position. What she earns depends on the price she pays, not on the kitchen’s risk.',
            2: 'The loan pays for under half of the kitchen, and the equity that pays for the rest bears most of the risk. The cost of capital blends both.',
            3: 'A working rate is a placeholder. Now that Lantern’s financing is known, its cost of capital should be estimated, and riskier projects need higher rates.',
          },
          solution: 'The kitchen is a catering and bakery operation much like Lantern’s existing kitchen, so the firm’s WACC is a reasonable rate for it. The loan’s rate ignores the equity that bears most of the risk; a single working rate ignores what Lantern’s capital costs now. Hollis’s 20% reflects her own position: one illiquid, undiversified stake and the bargaining over price. Her return depends on the price she pays, which the last stage looks at; it doesn’t change the risk of the kitchen’s cash flows. (CAPM inputs for a small private firm are rough, which is why the next stage tests the rate.)' },
      ],
    },
    {
      id: 'value', title: 'Is the kitchen worth it, and how badly could it go?',
      html: `<p>Set the discount rate to your WACC and read the kitchen’s value; then find how far sales could fall before it stops paying, and try a pessimistic case: sales ${pc(1 - PESS.scale, 0)} below forecast, variable costs ${pc(PESS.variableShare, 0)} of sales and fixed costs ${money(PESS.fixed)}.</p>`,
      tool: riskTool,
      items: [
        num('f05-pj-11', 'What is the kitchen’s NPV at Lantern’s WACC? Give dollars.', r(A.npv, 0),
          () => A.npv,
          `Discounting the free cash flows (${FCF.map((x) => fmt(x)).join(', ')}) at ${pc(WACC, 2)} gives ${money(A.npv)}. At the slider’s nearest rate, ${pc(r(WACC, 4), 2)}, the widget shows ${money(npv(r(WACC, 4), FCF))}.`,
          [{ value: r(npv(WORKING_RATE, FCF), 0), say: `That uses Ana’s working rate of ${pc(WORKING_RATE, 0)}, not the WACC.` }, { value: r(npv(H.required, FCF), 0), say: 'That discounts at Hollis’s 20%.' }],
          { tol: 120 }),
        num('f05-pj-12', 'What is the kitchen’s IRR? Give a percentage to one decimal place.', r(A.irr * 100, 1),
          () => A.irr * 100, `The rate at which NPV = 0: ${pc(A.irr)}. Excel: =IRR(B2:G2) on the six cash flows. The cash flows change sign once, so there is one IRR.`, null, { unit: '%', places: 1, tol: 0.06 }),
        num('f05-pj-13', 'Keeping costs as forecast, by how much could sales fall short of the forecast every year before the NPV at the WACC reaches zero? Give a percentage of the forecast to one decimal place.', r((1 - BE) * 100, 1),
          () => (1 - CF.breakEven((v) => npvScaled(v.s), { s: 1 }, 's', 0.5, 1)) * 100,
          `NPV falls to zero when sales are ${pc(BE)} of the forecast, ${pc(1 - BE)} short. The fixed costs and rent don’t fall with sales, and working capital falls only a little, so a small shortfall eats the margin fast.`,
          [{ value: r(BE * 100, 1), say: 'That is the break-even level of sales as a share of the forecast. The question asks for the shortfall.' }],
          { unit: '%', places: 1, tol: 0.25 }),
        num('f05-pj-14', `What is the NPV at the WACC in the pessimistic case (sales ${pc(1 - PESS.scale, 0)} below forecast, variable costs ${pc(PESS.variableShare, 0)} of sales, fixed costs ${money(PESS.fixed)})? Give dollars.`, r(NPV_PESS, 0),
          () => NPV_PESS,
          `${money(NPV_PESS)}. In an optimistic case (sales 10% above, variable costs 40%, fixed $38,000) it is ${money(NPV_OPT)}. The range is wide: the kitchen is worth doing on the forecast, but the forecast is doing a lot of work.`,
          null, { tol: 150 }),
        { id: 'f05-pj-15', type: 'mc', kind: 'applied',
          prompt: 'Which step would most reduce the risk the analysis shows, short of not opening the kitchen?',
          options: [
            'Raise the discount rate to 15% to allow for the uncertainty, and open the kitchen only if NPV is still positive',
            'Sign some catering and wholesale contracts before committing to the lease',
            'Depreciate the fit-out faster so that more of its cost is deducted from tax in the early years',
            'Take more of the money from Coastline so that Hollis bears less of the risk',
          ],
          answer: 1,
          feedback: {
            0: 'A higher rate doesn’t make sales any more certain; it just rejects more projects, good and bad. Model the risk in the cash flows and test them.',
            2: 'Tax depreciation is set by the tax rules, not chosen to suit; faster deductions would only move tax between years, and they don’t touch the sales risk.',
            3: 'More debt moves risk to the owners rather than removing it, and Coastline won’t lend more than the covenant allows.',
          },
          solution: 'Sales are the input that matters most (the tornado), and a shortfall of about 11% wipes out the NPV. Evidence on demand before the lease is signed attacks that risk directly; so would a shorter lease or a break clause. A higher rate doesn’t reduce risk, it only demands more of the forecast. The fit-out’s tax depreciation is set by the tax rules, and faster deductions only shift tax between years. More debt moves risk to equity holders, it doesn’t remove it, and the covenant limits it anyway.' },
      ],
    },
    {
      id: 'financing', title: 'The covenant, Hollis’s price and a dividend',
      html: `<p>The accountant’s forecast of Lantern’s current items on 31 March 2028, before the kitchen and its financing, is below. The loan agreement measures the current ratio without operating lease liabilities. In March, Hollis’s ${money(H.cash)} and the loan arrive and the ${money(CAPEX)} fit-out is paid. The kitchen’s opening stock is bought with cash, which moves money from one current asset to another. The part of the loan repaid in the next twelve months is a current liability.</p>${forecastTable}`,
      items: [
        { id: 'f05-pj-16', type: 'mc', kind: 'numerical',
          prompt: `On the forecast before the financing, what is Lantern’s current ratio as the covenant counts it, and would it pass?`,
          options: [`${f(CR0, 2)}: it would fail the ${COVENANT.currentRatio} minimum`, `${f(CA0 / (CL0 + FC.leases), 2)}: it would fail`, `${f(CR0 + 0.2, 2)}: it would pass`, `${f((CA0 + 41_120) / CL0, 2)}: it would pass once the law firm pays`],
          answer: 0,
          feedback: {
            1: 'That counts the operating lease liabilities, which the loan agreement leaves out.',
            2: `Recompute: ${fmt(CA0)} ÷ ${fmt(CL0)}.`,
            3: 'The law firm pays on 31 March, and its $41,120 is already in the forecast cash: adding it again counts it twice.',
          },
          solution: `${fmt(CA0)} ÷ ${fmt(CL0)} = ${f(CR0, 2)}, below ${COVENANT.currentRatio}. (With the leases it would be ${f(CA0 / (CL0 + FC.leases), 2)}, but the agreement leaves them out.) The law firm’s $41,120 is already in the forecast cash. Without new money Lantern couldn’t take the loan on these terms: Hollis’s equity is what makes the covenant workable.` },
        num('f05-pj-17', `How much of the loan’s principal is repaid in its first 12 monthly payments (April 2028 – March 2029)? This is the loan’s current portion on 31 March 2028. Give dollars.`, r(P12, 0),
          () => { let b = LOAN, p = 0; for (let m = 1; m <= 12; m++) { const it = b * rm; p += PMT - it; b -= PMT - it; } return p; },
          `Payment: ${money(PMT, 2)} a month (=PMT(7.5%/12, 60, −60000)). Interest falls as the balance falls; the first 12 payments repay ${money(P12, 2)} of principal (the sum of =PPMT(7.5%/12, k, 60, −60000) for k = 1 to 12) and ${money(I12, 2)} of interest.`,
          [{ value: r(PMT * 12, 0), say: 'That is the 12 payments in total. Only the principal part reduces the debt; the interest is an expense.' }, { value: LOAN / 5, say: 'Equal principal each year would be $12,000, but a level payment repays less principal early on.' }],
          { tol: 3 }),
        num('f05-pj-18', 'With Hollis’s money and the loan in, the fit-out paid and the line of credit still drawn, what is the covenant current ratio on 31 March 2028? Give two decimal places.', r(CR1, 2),
          () => (CA0 + H.cash + LOAN - CAPEX) / (CL0 + P12),
          `Current assets ${fmt(CA0)} + ${fmt(H.cash)} + ${fmt(LOAN)} − ${fmt(CAPEX)} = ${fmt(CA1)}. Current liabilities ${fmt(CL0)} + ${fmt(P12)} (the loan’s current portion) = ${fmt(CL1)}. Ratio ${f(CR1, 2)}.`,
          [{ value: r((CA0 + H.cash + LOAN - CAPEX - K.nwcShare * K.revenue[0]) / (CL0 + P12), 2), say: 'Buying stock with cash moves money between current assets; it doesn’t lower them.' }, { value: r((CA0 + H.cash + LOAN - CAPEX) / CL0, 2), say: 'Add the loan’s principal due within a year to current liabilities.' }],
          { unit: '', places: 2, tol: 0.006 }),
        num('f05-pj-19', `Suppose Lantern also repays the ${money(LOC)} line of credit from that cash. What is the largest cash dividend it could then pay on 31 March and still meet the covenant? Give dollars.`, r(MAXDIV, 0),
          () => (CA0 + H.cash + LOAN - CAPEX - LOC) - COVENANT.currentRatio * (CL0 + P12 - LOC),
          `Repaying the line takes ${money(LOC)} off both sides: ${fmt(CA1 - LOC)} ÷ ${fmt(CL1 - LOC)} = ${f(CR2, 2)}. Current assets must stay at least 1.2 × ${fmt(CL1 - LOC)} = ${fmt(1.2 * (CL1 - LOC))}, so a dividend can be at most ${money(MAXDIV)}. (With the line still drawn the room would be ${money(CA1 - 1.2 * CL1)}: when the ratio is above 1, repaying current debt with cash raises it.)`,
          [{ value: r(CA1 - 1.2 * CL1, 0), say: 'That keeps the line of credit drawn. Repaying it lowers current assets and current liabilities by the same amount, which raises a ratio above 1.' }],
          { tol: 3 }),
        { id: 'f05-pj-20', type: 'mc', kind: 'applied',
          prompt: `The same ${money(MAXDIV)} of headroom is all Lantern has at the quarter end. In April Ana also wants to spend money from the $40,000 she set aside for the smaller proposals (display fridges, ordering kiosks, a cargo bike). How does that spending affect the covenant?`,
          options: [
            'Not at all: buying equipment swaps one asset for another, and the covenant counts total assets',
            'It uses the same headroom as a dividend, because cash spent on equipment leaves current assets',
            'It helps: equipment raises Lantern’s total assets and so its borrowing capacity under the loan',
            'Only the part financed by the line of credit matters, because the covenant counts debt, not cash',
          ],
          answer: 1,
          feedback: {
            0: 'The covenant is a current ratio: it counts current assets only, and equipment is not one.',
            2: 'Total assets don’t enter a current-ratio covenant; equipment bought with cash lowers the ratio.',
            3: 'Cash is in the numerator: spending it lowers current assets whatever the source of the money.',
          },
          solution: 'Cash is a current asset; equipment is not. Every dollar spent on fixed assets, like every dollar paid out as a dividend, lowers the ratio, and by the 30 June test operating cash flows and the loan’s payments will have moved both sides. Ana needs a quarterly forecast of the ratio before committing to all three: the kitchen, the proposals and a dividend.' },
        num('f05-pj-21', `Suppose Lantern without the kitchen is worth the ${money(PRE)} pre-money value, and the kitchen’s NPV at the WACC is as you found. What are Hollis’s ${pc(H.stake, 0)} worth just after the deal? Give dollars.`, r(HOLLIS_WORTH, 0),
          () => H.stake * (PRE + H.cash + A.npv),
          `After the deal Lantern’s equity is worth the old business (${money(PRE)}) plus Hollis’s cash (${money(H.cash)}) plus the kitchen’s NPV (${money(A.npv)}); the loan brings in as much cash as it adds in debt. Hollis owns ${pc(H.stake, 0)}: ${money(HOLLIS_WORTH)}, ${money(HOLLIS_WORTH - H.cash)} more than she pays. That is her share of the kitchen’s NPV: at this price Ana gives ${pc(H.stake, 0)} of the value the kitchen creates to the investor who makes it possible.`,
          [{ value: H.cash, say: 'That leaves out her share of the kitchen’s NPV, which the deal’s price doesn’t include.' }],
          { tol: 60 }),
      ],
    },
    {
      id: 'memo', title: 'Advise Ana',
      items: [
        { id: 'f05-pj-22', type: 'short', kind: 'applied',
          prompt: 'Write Ana a memo (about 250 words): whether to open the kitchen, what it is worth and what could go wrong, the rate you used and why, and how to finance it: the loan and its covenant, Hollis’s offer and price, and whether to pay a dividend this year.',
          rubric: [
            `Gives the kitchen’s NPV at the WACC (about ${money(r(A.npv, -2))} at ${pc(WACC, 1)}) and IRR (about ${pc(A.irr, 0)}), with the cash flows’ main assumptions.`,
            `Explains the rate: peers’ betas unlevered and relevered, the cost of equity, market-value weights, and why neither the loan’s rate nor Hollis’s 20% is the right discount rate.`,
            `Says how fragile the value is (sales ${pc(1 - BE, 0)} below forecast erase it; the pessimistic case loses about ${money(-r(NPV_PESS, -3))}) and proposes a way to reduce the risk before committing.`,
            `Reports the covenant: it fails before the financing (${f(CR0, 2)}), passes after it (${f(CR1, 2)}, or ${f(CR2, 2)} with the line repaid), with little headroom for a dividend and the April proposals together.`,
            `Notes that Hollis’s price gives her a share of the kitchen’s NPV (her stake is worth about ${money(r(HOLLIS_WORTH, -3))} for ${money(H.cash)}), and suggests negotiating or explains why the price is acceptable.`,
          ],
          model: `<b>To:</b> Ana · <b>Re:</b> the second kitchen<br><br>On your forecast the kitchen is worth doing: its free cash flows (${money(FCF[0])} now, then ${FCF.slice(1).map((x) => money(x)).join(', ')}) have an NPV of about ${money(r(A.npv, -2))} at Lantern’s cost of capital of ${pc(WACC, 1)}, and an IRR of ${pc(A.irr, 0)}. The rate comes from three listed coffee and food firms’ betas, unlevered and relevered at our new debt level (${pc(DV, 0)} of value), giving a cost of equity of ${pc(RE, 1)} with your small-firm premium, and Coastline’s ${pc(DEBT.termLoan.rate, 1)} after tax.<br><br>The value is fragile. If sales run ${pc(1 - BE, 0)} below forecast every year, the NPV is zero; with weaker sales and dearer ingredients it is ${money(r(NPV_PESS, -2))}. Sales matter most, so I’d sign up some catering and wholesale contracts, or negotiate a break clause in the lease, before committing.<br><br>The financing works, just. Without Hollis’s money our current ratio would be ${f(CR0, 2)}, below the covenant’s ${COVENANT.currentRatio}. With her ${money(H.cash)} and the loan it is ${f(CR1, 2)}, or ${f(CR2, 2)} if we repay the line of credit, which I recommend. That leaves about ${money(r(MAXDIV, -3))} of headroom, which the April proposals will use, so I would not pay a dividend until the June quarter shows the ratio holding. Hollis’s price values the business before the kitchen at ${money(PRE)}; it gives her about ${money(r(HOLLIS_WORTH - H.cash, -3))} of the kitchen’s value. That may be a fair price for money no one else will provide, but it is worth asking for a higher pre-money value.`,
          solution: 'Compare your memo with the model and the rubric. Other recommendations earn full marks if they rest on the numbers, say how uncertain they are and say what would change the decision.' },
      ],
    },
  ],
  rubric: [
    'Cash flows are incremental and after tax, with depreciation’s tax shield, working capital and after-tax salvage; financing costs are left out of the cash flows.',
    'The discount rate reflects the kitchen’s risk: peers’ betas unlevered and relevered at Lantern’s market-value weights, the after-tax cost of debt, and the assumptions named.',
    'Value is reported with its fragility: break-even sales and a pessimistic case, not just one NPV.',
    'The covenant is tested as the loan agreement defines it, before and after the financing, and the dividend and spending decisions respect it.',
  ],
  verify() {
    return [
      ['year-0 FCF', FCF[0], -108_000], ['year-1 FCF', FCF[1], 13_893.5, 0.01], ['year-5 FCF', FCF[5], 76_286, 0.01], ['year-1 depreciation', DEP1, 15_774, 1e-9],
      ['equipment book after 5 years', BOOK, 13_386, 1e-6], ['after-tax salvage', SALV, 12_346.5, 1e-6],
      ['post-money', POST, 250_000], ['pre-money', PRE, 175_000], ['D/V', DV, 0.19355, 0.00001], ['relevered beta', BETA_L, 1.0034, 0.0001], ['cost of equity', RE, 0.12719, 0.00001], ['WACC', WACC, 0.11346, 0.00001],
      ['WACC = DERIVED.wacc', WACC, D.wacc, 1e-12],
      ['NPV at WACC', A.npv, 32_752, 1], ['IRR', A.irr, 0.2034, 0.0001], ['break-even sales share', BE, 0.8903, 0.0001], ['pessimistic NPV', NPV_PESS, -36_421, 1], ['optimistic NPV', NPV_OPT, 79_663, 1],
      ['loan payment', PMT, 1_202.28, 0.005], ['principal in year 1', P12, 10_275.79, 0.01], ['interest in year 1', I12, 4_151.54, 0.01],
      ['current ratio before', CR0, 1.016, 0.0005], ['after, line kept', CR1, 1.378, 0.0005], ['after, line repaid', CR2, 1.544, 0.0005], ['largest dividend', MAXDIV, 18_851, 1],
      ['Hollis’s stake worth', HOLLIS_WORTH, 84_826, 1], ['the IRR clears Hollis’s 20%, barely', A.irr > H.required && A.irr < H.required + 0.01 ? 1 : 0, 1],
    ];
  },
};
