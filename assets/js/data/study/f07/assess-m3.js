// assess-m3.js — F07 module 3 test: Valuation and review (dcf-model, scenarios-and-sensitivity,
// model-review-and-presentation). No hints; full solutions shown on review. Tidewater Kayaks and its figures are
// fictional and introduced here; the Lantern items ask new questions of case.js's model, scenarios and DCF.
import { DCF as D, SCENARIO_RESULTS as S, scenario, MODEL as M } from './case.js?v=36';

const TW = { ebit: 60000, tax: 0.25, dep: 14000, capex: 22000, dNwc: 3000 };
const twFcff = TW.ebit * (1 - TW.tax) + TW.dep - TW.capex - TW.dNwc;
const e90 = scenario({ termAmount: 90000 }).ratios[0];

export const items = [
  {
    id: 'f07-m3-1', lesson: 'dcf-model', type: 'num', kind: 'numerical',
    prompt: 'Tidewater Kayaks (fictional) expects EBIT of $60,000 next year, depreciation of $14,000, capital spending of $22,000 and a $3,000 increase in working capital. Its tax rate is 25% and it pays $5,000 of interest. What is its free cash flow to the firm?',
    answer: twFcff, check: () => 60000 * 0.75 + 14000 - 22000 - 3000, unit: '$', places: 0, tol: 1,
    wrong: [{ value: twFcff - 5000, say: 'Interest is not deducted from FCFF: it is a payment to lenders, whose cost is in the WACC.' }],
    solution: '60,000 × 0.75 + 14,000 − 22,000 − 3,000 = 34,000 dollars; the $5,000 of interest plays no part.',
  },
  {
    id: 'f07-m3-2', lesson: 'dcf-model', type: 'num', kind: 'numerical',
    prompt: 'Tidewater’s last forecast year has NOPAT of $52,000 and operating working capital of $20,000. Long-run growth is 2% and its WACC 12%. Using a normalised year (capital spending equal to depreciation, working capital growing with sales), what is the terminal value at the end of the forecast?',
    answer: (52000 * 1.02 - 0.02 * 20000) / 0.10, check: () => (52000 * 1.02 - 0.02 * 20000) / (0.12 - 0.02), unit: '$', places: 0, tol: 1,
    solution: 'FCFF next year: 52,000 × 1.02 − 0.02 × 20,000 = 52,640; terminal value 52,640 ÷ 0.10 = 526,400 dollars.',
  },
  {
    id: 'f07-m3-3', lesson: 'dcf-model', type: 'mc', kind: 'conceptual',
    prompt: 'A valuation subtracts lease liabilities as debt, but its free cash flow is calculated after paying rent on those leases. What is wrong?',
    options: ['The leases are counted twice', 'Nothing: leases should always be treated as debt', 'Rent should be added to EBIT before any tax', 'The WACC should be raised to compensate'],
    answer: 0,
    feedback: { 1: 'Treating leases as debt is allowed, but then their cost must be added back to the cash flows.', 2: 'Adding rent back is half of the alternative treatment; doing only that is still inconsistent.', 3: 'Changing the rate does not undo a double count.' },
    solution: 'Either keep leases as operating costs and out of net debt, or treat them as debt and add their cost back to FCFF. Mixing the two counts them twice.',
  },
  {
    id: 'f07-m3-4', lesson: 'dcf-model', type: 'num', kind: 'numerical',
    prompt: `Lantern’s DCF gives an enterprise value of $${Math.round(D.ev).toLocaleString('en-US')}, of which the terminal value contributes $${Math.round(D.pvTv).toLocaleString('en-US')}. What share of the value comes from after 2032, as a percentage to the nearest whole number?`,
    answer: Math.round(D.tvShare * 100), check: () => D.pvTv / D.ev * 100, unit: '%', places: 0, tol: 0.6,
    solution: `${Math.round(D.pvTv).toLocaleString('en-US')} ÷ ${Math.round(D.ev).toLocaleString('en-US')} = ${(D.tvShare * 100).toFixed(1)}%: most of Lantern’s value rests on the long-run assumptions.`,
  },
  {
    id: 'f07-m3-5', lesson: 'scenarios-and-sensitivity', type: 'mc', kind: 'applied',
    prompt: 'Ana tests a three-month delay to the second kitchen and finds the 2028 current ratio barely moves. Hollis says that means kitchen risk does not matter. What is the best reply?',
    options: ['The delay barely moves the covenant, but other kitchen risks, such as weaker sales, could', 'He is right: no kitchen risk can affect the business', 'The test must be wrong, because a delay to a new kitchen always hurts its first year of results badly', 'Delays matter only to value, never to cash'],
    answer: 0,
    feedback: { 1: 'One scenario tests one risk; weaker kitchen sales would not move its costs back with them.', 2: 'The test is right: costs and sales move back together.', 3: 'A delay moves both cash and value a little; here, little.' },
    solution: 'A delay shifts the kitchen’s sales and costs together. Lower sales after opening would not, so it is a different risk and needs its own scenario.',
  },
  {
    id: 'f07-m3-6', lesson: 'scenarios-and-sensitivity', type: 'num', kind: 'numerical',
    prompt: `With a $90,000 term loan instead of $60,000, Lantern’s 2028 current ratio is ${e90.toFixed(2)}. What is its headroom over the 1.2 covenant, as a percentage of the limit, to one decimal place?`,
    answer: Math.round((e90 - 1.2) / 1.2 * 1000) / 10, check: () => (e90 - 1.2) / 1.2 * 100, unit: '%', places: 1, tol: 0.3,
    solution: `(${e90.toFixed(2)} − 1.2) ÷ 1.2 = ${((e90 - 1.2) / 1.2 * 100).toFixed(1)}%.`,
  },
  {
    id: 'f07-m3-7', lesson: 'scenarios-and-sensitivity', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these are sound practice when building scenarios? Select all that apply.',
    options: ['One model with a block of scenario inputs and a selector', 'Changing together the inputs that a story would change together', 'A separate copy of the model for each scenario', 'Choosing ranges for a tornado that are equally plausible for each input', 'Averaging a covenant pass and a breach into one expected ratio'],
    answer: [0, 1, 3],
    feedback: { 2: 'Copies drift apart as they are corrected.', 4: 'A covenant either holds or it does not; averaging hides a breach.' },
    solution: 'One model with scenario inputs, consistent stories and comparable ranges. Copies drift; averaging pass and fail hides the risk a lender cares about.',
  },
  {
    id: 'f07-m3-8', lesson: 'scenarios-and-sensitivity', type: 'mc', kind: 'applied',
    prompt: `Under slow growth, Lantern’s current ratio is ${S.slow.ratios[0].toFixed(2)} in 2028 and ${S.slow.ratios[1].toFixed(2)} in 2029 with the original $60,000 loan. What does that tell Coastline?`,
    options: ['A realistic downside breaks the 1.2 covenant for two years', 'Lantern will certainly breach its covenant in 2028', 'The base case is wrong and should be replaced by the slow-growth case in the proposal', 'The covenant should be removed from the loan entirely'],
    answer: 0,
    feedback: { 1: 'A scenario shows what happens if; it is not a prediction.', 2: 'The downside complements the base case; it does not replace it.', 3: 'Lenders keep covenants; they may agree to change their levels.' },
    solution: 'It shows the plan’s weak point: a plausible slowdown breaches for two years, which is why Ana proposes a larger loan and a stepped covenant.',
  },
  {
    id: 'f07-m3-9', lesson: 'model-review-and-presentation', type: 'mc', kind: 'applied',
    prompt: 'Reviewing a model, you set every growth rate to zero and revenue still rises in 2030. What does that tell you?',
    options: ['Something besides the growth inputs drives 2030 revenue: find it', 'The model is working correctly, because inflation always raises revenue whatever the growth inputs say', 'The growth inputs need to be set to a negative value instead', 'Nothing, because extreme-input tests are not meaningful'],
    answer: 0,
    feedback: { 1: 'A forecast with no growth should be flat unless another input says otherwise; find which one.', 2: 'Negative growth would hide the problem, not explain it.', 3: 'Obvious inputs with obvious answers are exactly how logic errors surface.' },
    solution: 'With growth at zero, revenue should be flat. A rise means a typed number, a wrong reference or an input you did not know about: trace the 2030 cell.',
  },
  {
    id: 'f07-m3-10', lesson: 'model-review-and-presentation', type: 'num', kind: 'numerical',
    prompt: `Lantern’s capital spending is $${M.capex[2].toLocaleString('en-US')} in 2030 and its depreciation $${Math.round(M.dep[2]).toLocaleString('en-US')}. What is the ratio of capital spending to depreciation, to two decimal places?`,
    answer: Math.round(M.capex[2] / M.dep[2] * 100) / 100, check: () => M.capex[2] / M.dep[2], unit: '×', places: 2, tol: 0.006,
    solution: `${M.capex[2].toLocaleString('en-US')} ÷ ${Math.round(M.dep[2]).toLocaleString('en-US')} = ${(M.capex[2] / M.dep[2]).toFixed(2)}: below 1, explained by the newness of the 2028 assets.`,
  },
];
