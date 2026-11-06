// project-risk.ex.js — F05 · Project risk: widgets, practice and the knowledge check (answer keys live here).
// Every number is recomputed by `check` (see ../AUTHORING.md). Cold Brew figures come from COLD_BREW and coldBrewFlows() in
// case.js; the pessimistic scenario (70% volume, $3.29 shelf price, $0.80 a can) is Ana’s, as in the lesson. The food truck,
// app studio, pottery studio, climbing wall and the other businesses named here are fictional.
import { COLD_BREW, ROASTER, WORKING_RATE, TAX, coldBrewFlows, roasterFlows, DERIVED } from './case.js?v=28';
import { depreciation, breakEvenVolumes, eaa } from '../../../core/corpfin.js?v=28';
import { npv } from '../../../core/invest.js?v=28';

const cb = COLD_BREW, r = WORKING_RATE;
const money = (v) => `${v < -0.5 ? '−' : ''}$${Math.round(Math.abs(v)).toLocaleString('en-US')}`;
const num = (v, d = 0) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

const nAt = (vol) => npv(r, coldBrewFlows({ cans: cb.cans.map((n) => n * vol) }).fcf);
const worst = coldBrewFlows({ cans: cb.cans.map((n) => n * 0.7), netPrice: 3.29 * (1 - cb.tradeMargin), cogs: 0.80 }).fcf.map(Math.round);
const npvSheet = {
  cells: { A1: 'Discount rate', B1: 0.11, A2: 'Year', B2: 'Free cash flow', A3: 0, A4: 1, A5: 2, A6: 3, A7: 4, A8: 5,
    B3: worst[0], B4: worst[1], B5: worst[2], B6: worst[3], B7: worst[4], B8: worst[5], D1: 'NPV' },
  fixed: ['A3:A8'], vary: { B1: [0.09, 0.13, 0.15] },
};
const truck = breakEvenVolumes({ price: 12, unitCost: 5, fixed: 70000, dep: 10000, capex: 40000, n: 4, r: 0.12, tax: 0.25 });
const roPerKg = (DERIVED.roasterSavingPerYear / ROASTER.kg) * (1 - TAX) * (1 - 1.11 ** -7) / 0.11;

export const widgets = {
  'risk-tornado': {
    type: 'capbudget',
    title: 'Cold Brew: sensitivity of the NPV',
    inputs: [
      { id: 'vol', label: 'Volume (% of forecast)', min: 50, max: 150, step: 5, value: 100, fmt: 'pct' },
      { id: 'price', label: 'Shelf price a can', min: 2.79, max: 4.19, step: 0.05, value: cb.shelfPrice, fmt: 'money', digits: 2 },
      { id: 'cost', label: 'Co-packer cost a can', min: 0.6, max: 0.9, step: 0.01, value: cb.cogs, fmt: 'money', digits: 2 },
      { id: 'promo', label: 'Promotion (% of plan)', min: 50, max: 150, step: 5, value: 100, fmt: 'pct' },
      { id: 'rate', label: 'Discount rate', min: 6, max: 16, step: 0.5, value: 11, fmt: 'pct' },
    ],
    model: (v) => {
      const cans = cb.cans.map((n) => n * v.vol / 100), net = v.price * (1 - cb.tradeMargin);
      return { capex: cb.equipment, years: cb.years, revenue: cans.map((n) => n * net), variable: cans.map((n) => n * v.cost),
        fixed: cb.promotion.map((p) => p * v.promo / 100 + cb.listing + cb.brandManager), dep: depreciation(cb.equipment, { method: 5 }).slice(0, cb.years),
        tax: TAX, nwcShare: cb.nwcShare, salvage: cb.salvage, upfront: cb.launch, side: Array(cb.years).fill(-cb.cannibalised * (1 - TAX)) };
    },
    rate: 'rate', show: ['metrics', 'tornado'],
    tornado: { vol: [70, 130], price: [3.19, 3.79], cost: [0.64, 0.84], promo: [80, 120], rate: [9, 13] },
    note: 'The model is Cold Brew’s free-cash-flow model from project-cash-flows: grocers keep 38% of the shelf price, working capital is 15% of next year’s revenue, the $6,000 launch is expensed up front and $8,000 a year of café margin is lost. The tornado moves each input to the low and high values in the lesson’s table, holding the others where the sliders are. Figures from the fictional case.',
  },
  'risk-breakeven': {
    type: 'formula',
    title: 'Break-even volumes and operating leverage',
    intro: 'A product sold at a constant volume for five years, like a steady year of Cold Brew: grocers keep 38% of the shelf price, straight-line depreciation over five years, tax 25%. The chart shows EBIT, operating cash flow after tax (OCF) and the investment’s equivalent annual cost (EAC): OCF crosses EAC at the financial break-even. Starting values from the fictional case.',
    inputs: [
      { id: 'price', label: 'Shelf price a unit', min: 2.79, max: 4.19, step: 0.05, value: cb.shelfPrice, fmt: 'money', digits: 2 },
      { id: 'cost', label: 'Variable cost a unit', min: 0.5, max: 1.2, step: 0.01, value: cb.cogs, fmt: 'money', digits: 2 },
      { id: 'fixed', label: 'Fixed cash costs a year', min: 20000, max: 80000, step: 1000, value: 49000, fmt: 'money' },
      { id: 'capex', label: 'Investment at the start', min: 0, max: 60000, step: 1000, value: cb.equipment, fmt: 'money' },
      { id: 'q', label: 'Expected volume a year', min: 20000, max: 90000, step: 1000, value: 60000, fmt: 'int', unit: 'units' },
      { id: 'rate', label: 'Required return', min: 5, max: 20, step: 0.5, value: 11, fmt: 'pct' },
    ],
    compute: (v) => {
      const p = v.price * (1 - cb.tradeMargin), m = p - v.cost, dep = v.capex / 5, k = v.rate / 100;
      if (m <= 0) return { error: `Each unit brings in ${money(p)} after the trade’s 38% but costs ${money(v.cost)}: no volume breaks even. Raise the price or lower the cost.` };
      const be = breakEvenVolumes({ price: p, unitCost: v.cost, fixed: v.fixed, dep, capex: v.capex, n: 5, r: k, tax: TAX });
      const ebit = v.q * m - v.fixed - dep, dol = ebit > 0 ? v.q * m / ebit : NaN;
      const xs = Array.from({ length: 11 }, (_, i) => i * 10000);
      const ann = eaa(v.capex, k, 5);
      const safety = (v.q - be.financial) / v.q;
      return {
        headline: { label: 'Financial (NPV) break-even', value: `${num(Math.round(be.financial))} units a year` },
        rows: [
          ['Net price and contribution a unit', `$${p.toFixed(4)}; $${m.toFixed(4)}`],
          ['Cash break-even (cash costs covered)', `${num(Math.round(be.cash))} units`],
          ['Accounting break-even (EBIT = 0)', `${num(Math.round(be.accounting))} units`],
          ['Financial break-even (NPV = 0)', `${num(Math.round(be.financial))} units`],
          ['EBIT at the expected volume', money(ebit)],
          ['Degree of operating leverage there', Number.isFinite(dol) ? dol.toFixed(2) : 'not defined (EBIT ≤ 0)'],
          ['Margin of safety on the financial break-even', `${(safety * 100).toFixed(1)}%`],
        ],
        note: safety > 0
          ? `Expected volume could fall ${(safety * 100).toFixed(1)}% before the investment stops earning ${v.rate}%.${Number.isFinite(dol) ? ` At the expected volume a 10% fall in volume cuts EBIT by about ${(dol * 10).toFixed(0)}%.` : ''} For a project with heavier early costs (a launch, working capital), find the break-even on the full model: Cold Brew’s is 86% of forecast.`
          : `Expected volume is below the financial break-even: on these figures the investment destroys value.`,
        chart: { kind: 'line', x: { label: 'Units a year (thousands)', values: xs.map((x) => x / 1000) },
          series: [
            { name: 'OCF', values: xs.map((q) => Math.round((q * m - v.fixed - dep) * (1 - TAX) + dep)) },
            { name: 'EAC', values: xs.map(() => Math.round(ann)) },
            { name: 'EBIT', values: xs.map((q) => Math.round(q * m - v.fixed - dep)) },
          ], y: { label: 'Dollars a year' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f05-risk-g1', type: 'steps', kind: 'numerical',
    prompt: 'A fictional food truck sells meals at $12 each; ingredients and packaging cost $5 a meal. Fixed costs (pitch fees, staff, insurance) are $70,000 a year. The truck costs $40,000, depreciated straight line over four years to zero, after which it is scrapped. Tax is 25% and the owners require 12% a year.',
    solution: 'Contribution = 12 − 5 = $7 a meal; depreciation = 40,000 ÷ 4 = $10,000. Accounting: (70,000 + 10,000) ÷ 7 = 11,429 meals. Cash: 70,000 ÷ 7 = 10,000 meals. Financial: EAC = 40,000 × 0.12 ÷ (1 − 1.12⁻⁴) = $13,169.38; Q = [70,000 + (13,169.38 − 0.25 × 10,000) ÷ 0.75] ÷ 7 = 12,032 meals a year.',
    steps: [
      { id: 'f05-risk-g1-s1', type: 'num', prompt: 'What is the accounting break-even, in meals a year (to the nearest meal)?',
        answer: 11429, check: () => truck.accounting, unit: 'meals', places: 0, tol: 1,
        hints: ['Accounting break-even covers fixed costs and depreciation: (F + D) ÷ (P − v).'],
        wrong: [{ value: 10000, say: 'That covers only the fixed cash costs (the cash break-even). Add the $10,000 of depreciation.' }, { value: 6667, say: 'That divides by the price, not the contribution. Each meal contributes 12 − 5 = $7.' }] },
      { id: 'f05-risk-g1-s2', type: 'num', prompt: 'What is the cash break-even, in meals a year?',
        answer: 10000, check: () => truck.cash, unit: 'meals', places: 0, tol: 1,
        hints: ['Depreciation is not a cash cost: F ÷ (P − v).'] },
      { id: 'f05-risk-g1-s3', type: 'num', prompt: 'What is the financial (NPV) break-even, in meals a year (to the nearest meal)?',
        answer: 12032, check: () => truck.financial, unit: 'meals', places: 0, tol: 2,
        hints: ['First the truck’s equivalent annual cost: 40,000 × 0.12 ÷ (1 − 1.12⁻⁴).', 'Then Q = [F + (EAC − T × D) ÷ (1 − T)] ÷ (P − v), with EAC = $13,169.38.'],
        wrong: [{ value: 11881, say: 'That adds the EAC to fixed costs as if there were no tax. Operating cash flow is after tax, so gross the EAC up: (EAC − T × D) ÷ (1 − T).' }, { value: 11428.57, say: 'That is the accounting break-even. The financial break-even must also earn 12% on the $40,000.' }] },
    ],
  },
  {
    id: 'f05-risk-g2', type: 'steps', kind: 'applied',
    prompt: 'A fictional app studio has three scenarios for a new game: pessimistic, NPV −$60,000 (probability 30%); base, NPV $40,000 (50%); optimistic, NPV $150,000 (20%). All are at the studio’s risk-adjusted rate.',
    solution: 'Expected NPV = 0.3 × (−60,000) + 0.5 × 40,000 + 0.2 × 150,000 = −18,000 + 20,000 + 30,000 = $32,000. It is positive, so on these judgements the game adds value; but a 30% chance of a $60,000 loss is a real risk for a small studio, and the scenarios’ probabilities are judgements that deserve scrutiny.',
    steps: [
      { id: 'f05-risk-g2-s1', type: 'num', prompt: 'What is the expected NPV?',
        answer: 32000, check: () => 0.3 * -60000 + 0.5 * 40000 + 0.2 * 150000, unit: '$', places: 0, tol: 1,
        hints: ['Weight each scenario’s NPV by its probability and add.'],
        wrong: [{ value: 43333, say: 'That is a simple average of the three NPVs. Weight each by its probability.' }, { value: 40000, say: 'That is the base case only. The expected NPV weights all three scenarios.' }] },
      { id: 'f05-risk-g2-s2', type: 'mc', prompt: 'What does scenario analysis add to the one-at-a-time sensitivity analysis the studio has already done?',
        options: ['It shows the effect of several inputs moving together in a consistent way', 'It removes the need to choose a low and a high value for each uncertain input', 'It turns the NPV into a probability of success that can be relied on for the decision', 'It replaces the discount rate as the way to allow for the project’s risk'],
        answer: 0,
        feedback: { 1: 'Scenarios still need judgements about each input’s value in each story, and about the probabilities.', 2: 'The probabilities are judgements; the output is no more reliable than they are.', 3: 'Systematic risk still belongs in the rate; scenarios improve the expected cash flows.' },
        hints: ['Sensitivity analysis moves one input at a time.'] },
    ],
  },
  {
    id: 'f05-risk-g3', type: 'steps', kind: 'numerical',
    prompt: 'A fictional pottery studio sells 6,000 classes a year with a contribution of $20 each. Its fixed costs, including depreciation, are $90,000 a year.',
    solution: 'Contribution = 6,000 × 20 = $120,000; EBIT = 120,000 − 90,000 = $30,000; DOL = 120,000 ÷ 30,000 = 4. A 5% fall in volume cuts EBIT by about 4 × 5% = 20%, to $24,000. Check: 5,700 × 20 − 90,000 = $24,000.',
    steps: [
      { id: 'f05-risk-g3-s1', type: 'num', prompt: 'What is the degree of operating leverage at 6,000 classes?',
        answer: 4, check: () => (6000 * 20) / (6000 * 20 - 90000), unit: '', places: 2, tol: 0.01,
        hints: ['DOL = contribution ÷ EBIT.', 'Contribution = 6,000 × $20; EBIT = contribution − fixed costs.'],
        wrong: [{ value: 0.75, say: 'That is fixed costs ÷ contribution. DOL is contribution ÷ EBIT.' }, { value: 1.33, say: 'That is contribution ÷ fixed costs. Divide by EBIT instead.' }] },
      { id: 'f05-risk-g3-s2', type: 'num', prompt: 'If volume falls 5%, what will EBIT be?',
        answer: 24000, check: () => 6000 * 0.95 * 20 - 90000, unit: '$', places: 0, tol: 1,
        hints: ['EBIT falls by DOL × 5%.', 'Or recompute directly at 5,700 classes.'],
        wrong: [{ value: 28500, say: 'That cuts EBIT by only 5%. Fixed costs don’t fall with volume, so EBIT falls by DOL × 5% = 20%.' }] },
    ],
  },
  {
    id: 'f05-risk-g4', type: 'formula', kind: 'numerical',
    prompt: 'B3:B8 hold Cold Brew’s free cash flows in Ana’s pessimistic scenario (70% of forecast volume, a $3.29 shelf price, $0.80 a can), for year 0 (1 April 2028) to year 5. In D2, calculate the scenario’s NPV at the rate in B1.',
    sheet: npvSheet,
    cell: 'D2', answer: '=NPV(B1,B4:B8)+B3', require: ['NPV'],
    alt: ['=B3+NPV(B1,B4:B8)', '=NPV(B1,B3:B8)*(1+B1)'],
    view: 'A1:D8', formats: { B1: '0.0%', B: '$#,##0', D2: '$#,##0' }, widths: { A: 13, B: 14, D: 12 },
    hints: ['Excel’s NPV treats its first value as arriving at the end of period 1.', 'Discount years 1 to 5 with NPV, then add year 0, which is already in today’s money.'],
    wrong: [
      { formula: '=NPV(B1,B3:B8)', say: 'That discounts year 0 by a year as well, because Excel’s NPV assumes its first value comes at the end of period 1. Use NPV on B4:B8 and add B3.' },
      { formula: '=NPV(B1,B4:B8)', say: 'That leaves out year 0. Add B3, the cash spent on 1 April 2028.' },
      { formula: '=SUM(B3:B8)', say: 'That adds dollars from different years without discounting. Use NPV for years 1 to 5 and add year 0.' },
    ],
    solution: `<x>=NPV(B1,B4:B8)+B3</x> = about ${money(npv(r, worst))} at 11% (the lesson’s −$46,683 uses unrounded flows). In the pessimistic case Cold Brew loses money, and the loss is big enough that Lantern must be able to absorb it.`,
  },
];

export const independent = [
  {
    id: 'f05-risk-i1', type: 'mc', kind: 'applied',
    prompt: 'Cold Brew’s tornado (base NPV $25,737): volume 70%–130% swings the NPV by $110,789; shelf price $3.19–$3.79 by $48,814; cost a can $0.64–$0.84 by $26,834; promotion 80%–120% by $21,416; the rate 9%–13% by $9,166. Ana has a week before deciding. How should she spend it?',
    options: ['Gathering evidence on how many cans grocers will actually sell', 'Estimating the discount rate more precisely, since the rate is the most debatable input', 'Negotiating the co-packer’s fee, because cost is the input she controls', 'Nothing: the base NPV is positive, so the tornado doesn’t affect the decision'],
    answer: 0,
    feedback: {
      1: 'Over these ranges the rate moves the NPV least; refining it changes little.',
      2: 'A lower fee helps, but the tornado shows cost matters far less than volume over plausible ranges.',
      3: 'Volume 30% below forecast turns the NPV to −$29,657. A positive base case built on an uncertain volume deserves testing.',
    },
    solution: 'The tornado ranks the inputs by how much they move the NPV over plausible ranges. Volume dwarfs the rest, and a 30% shortfall makes the NPV negative, so the most valuable information is about volume. (Ranges are judgements: if Ana thought the co-packer’s fee could double, the ranking would change.)',
  },
  {
    id: 'f05-risk-i2', type: 'num', kind: 'numerical',
    prompt: 'Cold Brew’s NPV at 11% is $25,737 at 100% of forecast volume and −$29,657 at 70%. Every cash flow in the model is proportional to volume or fixed, so NPV is a straight line in volume. At what percentage of forecast volume is NPV zero? Give one decimal place.',
    answer: 86.1, check: () => 100 - 30 * 25737 / (25737 + 29657), unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: 13.9, say: 'That is the margin of safety (how far volume can fall). The question asks for the break-even volume itself, 100% − 13.9%.' },
      { value: 53.6, say: 'Check the interpolation: NPV falls by 55,394 over 30 points, about 1,846 a point; it reaches zero 25,737 ÷ 1,846 ≈ 13.9 points below 100%.' },
    ],
    solution: 'NPV falls by 25,737 + 29,657 = $55,394 over 30 percentage points: $1,846.47 a point. It reaches zero 25,737 ÷ 1,846.47 = 13.9 points below the forecast, at 86.1%. Because the model is linear in volume, the straight line is exact here; the lesson’s search on the full model gives the same 86.1%.',
  },
  {
    id: 'f05-risk-i3', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each feature of a project as an option to expand, an option to abandon, an option to wait, or not a real option at all.',
    items: [
      'A hotel builds foundations strong enough to add two more floors if occupancy is high.',
      'A mining company holds a licence for a deposit and can develop it any time in the next ten years.',
      'A retailer signs a one-year lease with a break clause rather than a ten-year lease.',
      'A café adds a 3-point premium to the discount rate for a new branch.',
      'A food brand launches in one region first, with the right to roll out nationally if sales are strong.',
    ],
    categories: ['Option to expand', 'Option to abandon', 'Option to wait', 'Not a real option'],
    answer: [0, 2, 1, 3, 0],
    feedback: { 1: 'The licence lets the company delay development until it learns more about prices: an option to wait.', 2: 'The break clause lets the retailer walk away cheaply if the shop fails: an option to abandon.', 3: 'A higher rate is a way of discounting, not a decision the firm can make later.', 4: 'A regional launch followed by a choice to roll out is a pilot: an option to expand.' },
    solution: 'Expand: the hotel’s stronger foundations and the regional launch. Wait: the development licence. Abandon: the short lease with a break clause. The rate premium is not an option: it changes how the cash flows are valued, not what managers can do.',
  },
  {
    id: 'f05-risk-i4', type: 'mc', kind: 'conceptual',
    prompt: 'A manager raises the discount rate on a new product from 11% to 16% “because launches are risky”. The main risk is that the product fails in its first year, and it is specific to this firm. What is wrong with this?',
    options: ['It cuts distant cash flows far more than near ones, though this risk is early; it belongs in the expected cash flows', 'Nothing: a project that is riskier than the firm’s average should always be discounted at a higher rate than the average, whatever the source of its risk', 'The rate should be lowered instead, because the product might also do much better than expected', 'It is fine as long as the same 16% is then used for every other project the firm takes on'],
    answer: 0,
    feedback: {
      1: 'Higher rates are for higher systematic risk, which investors can’t diversify. A launch failure specific to one firm should lower the expected cash flows instead.',
      2: 'Upside surprises are part of the expected cash flows too; changing the rate is not the way to allow for either.',
      3: 'Using one rate for every project is a different error: it ignores real differences in systematic risk between projects.',
    },
    solution: 'Five extra points cut a year-1 flow by about 4% but a year-5 flow by about 20%, which is right only if risk compounds steadily. Here the risk is early and largely diversifiable: model it in the expected cash flows (scenarios with probabilities, including the chance to stop), and use a rate that reflects systematic risk.',
  },
  {
    id: 'f05-risk-i5', type: 'num', kind: 'applied',
    prompt: 'A fictional brewery is valuing a new taproom. After a year it will know whether trade is strong (probability 50%; NPV $80,000) or weak (50%; NPV −$50,000 if it carries on). In the weak case it could instead close after a year and sublet the premises, which would make the NPV of the weak case −$20,000. All NPVs are measured today. What is the option to close worth today?',
    answer: 15000, check: () => (0.5 * 80000 + 0.5 * Math.max(-50000, -20000)) - (0.5 * 80000 + 0.5 * -50000), unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 30000, say: 'That is what closing saves in the weak case. Weight it by the 50% chance of the weak case.' },
      { value: 30000 / 1.11, say: 'The NPVs are already measured today; no further discounting is needed.' },
    ],
    solution: 'Without the option: 0.5 × 80,000 + 0.5 × (−50,000) = $15,000. With it, the brewery closes in the weak case: 0.5 × 80,000 + 0.5 × (−20,000) = $30,000. The option is worth 30,000 − 15,000 = $15,000: the 50% chance of the weak case times the $30,000 that closing saves.',
  },
  {
    id: 'f05-risk-i6', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about Monte Carlo simulation of a project’s NPV are correct? Select all that apply.',
    options: [
      'It shows the whole distribution of NPVs, including the chance of a loss, not just a few scenarios.',
      'If low volume tends to come with low prices but they are drawn independently, the simulation understates how bad (and how good) outcomes can be.',
      'Its results are only as reliable as the distributions and correlations assumed for the inputs.',
      'Because it uses thousands of draws, its probability of loss can be relied on to the decimal place.',
      'The simulated NPVs should be discounted at the risk-free rate, since the simulation already shows the risk.',
    ],
    answer: [0, 1, 2],
    feedback: { 3: 'Thousands of draws make the result precise about the assumed model, not accurate about the world.', 4: 'Each draw’s cash flows are possible outcomes, not certainty equivalents; discount them at the risk-adjusted rate.' },
    solution: 'Simulation gives a full distribution (A), but ignored correlations understate the tails (B), and everything rests on the assumed distributions (C). Many draws give false precision, not reliability (D), and the cash flows still need the risk-adjusted rate (E).',
  },
];

export const check = [
  {
    id: 'f05-risk-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What is the main difference between sensitivity analysis and scenario analysis?',
    options: [
      'Sensitivity moves one input at a time; a scenario moves several together',
      'Sensitivity analysis uses probabilities; scenario analysis does not',
      'Scenario analysis changes one input at a time; sensitivity analysis changes them all at once',
      'Sensitivity analysis is for the discount rate only; scenario analysis is for the cash flows',
    ],
    answer: 0,
    feedback: { 1: 'It is scenario analysis that often attaches probabilities, to give an expected NPV.', 2: 'The other way round.', 3: 'Sensitivity analysis can move any input, including volume, price or costs; the rate is often the least important.' },
    solution: 'One-at-a-time changes (sensitivity, shown as a tornado) find which inputs matter; scenarios capture inputs moving together, such as low volume with price cuts, and can be weighted by probabilities.',
  },
  {
    id: 'f05-risk-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional climbing wall charges $15 a visit; each visit costs $3 in staff time and cleaning. Fixed cash costs are $84,000 a year and depreciation $12,000 a year. What is its accounting break-even, in visits a year?',
    answer: 8000, check: () => (84000 + 12000) / (15 - 3), unit: 'visits', places: 0, tol: 1,
    wrong: [
      { value: 7000, say: 'That is the cash break-even (fixed cash costs only). Accounting break-even also covers depreciation.' },
      { value: 6400, say: 'That divides by the price, not the contribution of $12 a visit.' },
    ],
    solution: '(84,000 + 12,000) ÷ (15 − 3) = 96,000 ÷ 12 = 8,000 visits a year. The cash break-even is 7,000; the financial break-even, which must also earn a return on the investment, is higher than 8,000.',
  },
  {
    id: 'f05-risk-k3', type: 'num', kind: 'numerical',
    prompt: 'A fictional ferry operator’s degree of operating leverage at its current volume is 3.2. If passenger numbers rise by 8%, by what percentage does EBIT rise (prices and costs per passenger unchanged)?',
    answer: 25.6, check: () => 3.2 * 8, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 8, say: 'With fixed costs, EBIT moves by more than volume: DOL × 8%.' }, { value: 2.5, say: 'That divides 8 by 3.2. Multiply instead.' }],
    solution: '%ΔEBIT ≈ DOL × %Δvolume = 3.2 × 8% = 25.6%. High fixed costs work both ways: a fall of 8% would cut EBIT by 25.6%.',
  },
  {
    id: 'f05-risk-k4', type: 'mc', kind: 'applied',
    prompt: 'Cold Brew’s expected NPV is positive, but its pessimistic case loses $46,683 and its NPV break-even is 86% of forecast volume. Which plan best uses what the risk analysis shows?',
    options: ['Launch with a few grocers on short contracts, measure sell-through, keep the right to stop', 'Reject Cold Brew, since a 25% chance of losing $46,683 is too large a risk for a small firm', 'Launch at full scale and raise the discount rate to 16% to allow for the launch risk', 'Launch at full scale: the expected NPV is positive, and the risk analysis is only a check'],
    answer: 0,
    feedback: { 1: 'A positive expected NPV with a survivable downside is worth taking; a staged launch makes the downside smaller still.', 2: 'Raising the rate double-counts a risk that is early and specific to Lantern, and does nothing to reduce it.', 3: 'The analysis also shows how to reduce the downside: staging the launch adds option value.' },
    solution: 'The risk is concentrated in early volume. A staged launch with short commitments turns that into an option to abandon (worth about $7,099 in the lesson’s example) and an option to expand, while keeping the positive expected NPV.',
  },
  {
    id: 'f05-risk-k5', type: 'mc', kind: 'conceptual',
    prompt: 'For a project with an up-front investment and a positive required return, why is the financial (NPV) break-even volume higher than the accounting break-even?',
    options: ['Covering depreciation recovers the investment but earns no return on it; NPV = 0 also needs the opportunity cost', 'Because depreciation is a cash cost that the accounting break-even leaves out of the calculation', 'Because taxes are ignored at the accounting break-even but included in the financial break-even', 'It isn’t: for a project with no working capital the two break-even volumes are always equal'],
    answer: 0,
    feedback: { 1: 'Depreciation is not a cash cost, and the accounting break-even includes it.', 2: 'At the accounting break-even EBIT is zero, so there is no tax either way; that is not the reason.', 3: 'They are equal only if the required return is zero.' },
    solution: 'Covering depreciation recovers the investment with no return, which is zero NPV only at a 0% rate. At a positive rate, operating cash flow must cover the investment’s equivalent annual cost, which is larger than its depreciation.',
  },
  {
    id: 'f05-risk-k6', type: 'num', kind: 'applied',
    prompt: 'Lantern’s roaster has an NPV of $18,386 at 11% when it roasts the 2,400 kg a year Lantern needs. Each kilogram roasted instead of bought saves $21.53 before tax (25%), every year for seven years; everything else is unaffected by volume. Using the 7-year annuity factor at 11%, 4.7122, at what volume (kg a year) is the roaster’s NPV zero? Round to the nearest kilogram.',
    answer: 2158, check: () => ROASTER.kg - npv(r, roasterFlows().fcf) / roPerKg, unit: 'kg', places: 0, tol: 1.5,
    wrong: [
      { value: 2219, say: 'That uses the pre-tax saving. Each kilogram adds 21.53 × (1 − 0.25) a year after tax.' },
      { value: 1262, say: 'That forgets to discount: a kilogram a year adds 21.53 × 0.75 = $16.15 for seven years, worth 16.15 × 4.7122 = $76.09 today.' },
    ],
    solution: 'One more kilogram a year adds 21.53 × 0.75 = $16.15 a year after tax, worth 16.15 × 4.7122 ≈ $76.09 today. The NPV falls to zero 18,386 ÷ 76.09 ≈ 242 kg below 2,400, at about 2,158 kg a year: 90% of Lantern’s need. A 10% fall in roasted coffee sales would wipe out the roaster’s value.',
  },
];
