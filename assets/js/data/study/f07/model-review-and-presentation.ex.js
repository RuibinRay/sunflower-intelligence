// model-review-and-presentation.ex.js — F07 · Model review and presentation: widgets, practice and the knowledge check
// (answer keys live here). The error explorer plants errors in case.js's MODEL; every num item's `check` recomputes.
import { MODEL as M, OPENING as O } from './case.js?v=36';

const R = M.rows;
const cum = (f) => R.map((r, t) => R.slice(0, t + 1).reduce((s, x, i) => s + f(x, i), 0));
const ERRORS = [
  { name: 'No error', check: R.map(() => 0), why: 'The model as built: every check is zero.' },
  { name: 'Dividends not deducted from retained earnings', check: cum((x) => -x.dividends), why: 'Zero until dividends start in 2030, then minus their running total: equity is overstated by every dividend paid.' },
  { name: 'Depreciation added back twice in operating cash flow', check: cum((x) => x.dep), why: 'Positive in every year and growing by each year’s depreciation: cash, and so assets, are overstated.' },
  { name: 'Increase in receivables added instead of subtracted', check: cum((x, i) => 2 * (x.receivables - (i ? R[i - 1].receivables : O.receivables))), why: 'Twice each year’s change in receivables, accumulating: the classic signature of a sign error.' },
];
const f0 = (x) => (Math.round(x) + 0).toLocaleString('en-US');

export const widgets = {
  'mr-errors': {
    type: 'formula', title: 'Plant an error, read the balance check',
    intro: '0 is the model as built; 1–3 each plant one classic error.',
    inputs: [{ id: 'e', label: 'Error planted (0–3)', min: 0, max: 3, step: 1, value: 0, fmt: 'int' }],
    compute: (v) => {
      const E = ERRORS[v.e];
      return {
        headline: { label: E.name, value: E.check.every((x) => Math.abs(x) < 0.5) ? 'Checks pass' : 'Balance check fails' },
        rows: R.map((r, t) => [`Balance check ${r.year}`, f0(E.check[t])]),
        note: E.why,
        chart: { kind: 'bar', x: { label: 'Year', values: R.map((r) => String(r.year)) }, series: [{ name: 'Balance check', values: E.check.map((x) => Math.round(x)) }], y: { label: 'Dollars' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f07-mr-g1', type: 'order', kind: 'conceptual',
    prompt: 'Put the layers of a model review in the order a reviewer works through them.',
    items: ['Structure: inputs apart, labelled, units and signs stated', 'Integrity: the check rows are zero', 'Consistency: one formula per row, no typed numbers, no circularity', 'Reasonableness: the forecast against the history', 'Documentation: purpose, sources, versions'],
    hints: ['Mechanical before judgemental.'],
    solution: 'Structure, integrity and consistency are mechanical and come first; reasonableness needs judgement; documentation makes the model usable by others.',
  },
  {
    id: 'f07-mr-g2', type: 'mc', kind: 'applied',
    prompt: 'A model’s balance check reads 0, 0, −3,000, −7,000, −12,000. Dividends of 3,000, 4,000 and 5,000 start in the third year. What is the likely error?',
    options: ['Dividends never reach retained earnings', 'Depreciation is added back twice in operating cash flow', 'An opening balance error', 'A loan drawn in the third year has no cash inflow'],
    answer: 0,
    feedback: { 1: 'That would make the check positive from the first year.', 2: 'Then the check would be wrong from the first period.', 3: 'A missing loan inflow would appear as one amount, not a total that grows with the dividends.' },
    hints: ['Compare the differences with the running total of dividends.'],
    solution: '3,000, 3,000 + 4,000 and 3,000 + 4,000 + 5,000: the check is minus the cumulative dividends, so equity was never reduced by them.',
  },
  {
    id: 'f07-mr-g3', type: 'num', kind: 'numerical',
    prompt: 'A business spends $25,000 on capital assets and its depreciation is $48,000. What is the ratio of capital spending to depreciation?',
    answer: 0.52, check: () => 25000 / 48000, unit: '×', places: 2, tol: 0.005,
    hints: ['Capex ÷ depreciation.'],
    solution: '25,000 ÷ 48,000 = 0.52: well below 1, which a reviewer will ask about.',
  },
  {
    id: 'f07-mr-g4', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these does passing the balance check prove? Select all that apply.',
    options: ['Every balance sheet change has a matching profit or cash flow', 'The sales forecast is realistic', 'The tax rate is correct', 'No balance has been left out of the cash flow statement'],
    answer: [0, 3],
    feedback: { 1: 'A model can balance on any sales forecast.', 2: 'A wrong tax rate is applied consistently and still balances.' },
    hints: ['The check is about internal consistency.'],
    solution: 'It proves internal consistency: the statements tie together. It says nothing about whether the assumptions are realistic or correct.',
  },
];

export const independent = [
  {
    id: 'f07-mr-i1', type: 'num', kind: 'numerical',
    prompt: 'Total assets are $359,774, total liabilities $241,249 and equity $118,526. What does the balance check show?',
    answer: -1, check: () => 359774 - 241249 - 118526, unit: '$', places: 0, tol: 0.5,
    solution: '359,774 − 241,249 − 118,526 = −1: a rounding difference from figures shown to the dollar. In the model itself (unrounded) the check is exactly zero.',
  },
  {
    id: 'f07-mr-i2', type: 'mc', kind: 'applied',
    prompt: 'A reviewer finds that Lantern’s capital spending is about half of depreciation from 2029 to 2031. What is the best response?',
    options: ['Explain it: the 2028 assets are not yet due for replacement', 'Raise capital spending until it equals depreciation every year', 'Lower depreciation to match capital spending', 'Ignore it, because capital spending never affects a covenant'],
    answer: 0,
    feedback: { 1: 'Forcing them equal without a plan would be arbitrary.', 2: 'Depreciation follows the assets owned; it cannot be chosen.', 3: 'Capital spending uses cash, which affects the current ratio.' },
    solution: 'The gap has a reason; a sentence in the notes shows the reviewer it was considered, not missed.',
  },
  {
    id: 'f07-mr-i3', type: 'num', kind: 'numerical',
    prompt: 'A sign error adds a $10,000 increase in receivables in the cash flow statement instead of subtracting it. By how much does the balance check move in that year?',
    answer: 20000, check: () => 2 * 10000, unit: '$', places: 0, tol: 1,
    solution: 'Cash is overstated by twice the change, 2 × 10,000 = 20,000 dollars.',
  },
  {
    id: 'f07-mr-i4', type: 'order', kind: 'applied',
    prompt: 'Order the parts of a one-page summary for a lender.',
    items: ['The request and the answer: loan amount and terms', 'The base case evidence: cash, coverage, covenant', 'The downside case and the risks', 'The key assumptions with their sources', 'The model’s checks and simplifications'],
    solution: 'Answer first, then evidence, then risks, then the assumptions and checks a reader needs to audit it.',
  },
  {
    id: 'f07-mr-i5', type: 'classify', kind: 'conceptual',
    prompt: 'Which review layer catches each problem?',
    items: ['A typed number among the formulas of a forecast row', 'Assets do not equal liabilities plus equity', 'Gross margin jumps ten points with no reason', 'Nobody can tell which version Coastline received'],
    categories: ['Consistency', 'Integrity', 'Reasonableness', 'Documentation'],
    answer: [0, 1, 2, 3],
    solution: 'Typed numbers: consistency. Balance failures: integrity. Unexplained jumps: reasonableness. Lost versions: documentation.',
  },
];

export const check = [
  {
    id: 'f07-mr-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why should someone other than the builder review a model?',
    options: ['Builders overrate their own accuracy', 'Because lenders refuse models reviewed by their builders', 'Because only accountants may check spreadsheets', 'Because a second person types faster'],
    answer: 0,
    feedback: { 1: 'Some require independent review; the reason is the one in the key.', 2: 'Anyone careful, with a checklist, can review.', 3: 'Speed is not the point.' },
    solution: 'Research on spreadsheet errors finds them common and their builders overconfident; a fresh reviewer sees what the builder cannot.',
  },
  {
    id: 'f07-mr-k2', type: 'mc', kind: 'applied',
    prompt: 'A balance check is +36,000 in the first year and grows by about the year’s depreciation every year. What is the likely error?',
    options: ['Depreciation added back twice in operating cash flow', 'Dividends not deducted from retained earnings at all', 'An opening balance typed in incorrectly at the start', 'Interest charged on the closing balance of the line'],
    answer: 0,
    feedback: { 1: 'That makes the check negative and starts when dividends start.', 2: 'An opening error would show the same amount every year, not a growing one.', 3: 'That would change profit and cash consistently, not break the balance.' },
    solution: 'Positive and accumulating by depreciation each year: cash is overstated by depreciation counted twice.',
  },
  {
    id: 'f07-mr-k3', type: 'num', kind: 'numerical',
    prompt: 'Capital spending is $79,000 and depreciation $47,000. What is the ratio?',
    answer: 1.68, check: () => 79000 / 47000, unit: '×', places: 2, tol: 0.005,
    solution: '79,000 ÷ 47,000 = 1.68: Lantern’s 2032, with the café refit.',
  },
  {
    id: 'f07-mr-k4', type: 'mc', kind: 'applied',
    prompt: 'What should be the first line of Lantern’s summary for Coastline?',
    options: ['The request: an $80,000 loan with a stepped covenant', 'A history of Lantern since Ana founded it in early 2026', 'The full list of the model’s assumptions with their sources', 'The balance check for every year of the forecast model'],
    answer: 0,
    feedback: { 1: 'Background belongs later, if at all.', 2: 'Assumptions are evidence for the reader who wants to audit.', 3: 'Checks reassure, but they do not answer the question.' },
    solution: 'Lead with the answer to the reader’s question; the rest supports it.',
  },
  {
    id: 'f07-mr-k5', type: 'mc', kind: 'conceptual',
    prompt: 'A model passes every integrity check. What can you conclude?',
    options: ['Only that its statements are consistent', 'Its forecast is accurate and ready to send', 'It contains no hard-coded numbers', 'Its assumptions are reasonable'],
    answer: 0,
    feedback: { 1: 'Balanced models can forecast the impossible.', 2: 'A hard-coded forecast can still balance.', 3: 'Reasonableness is a separate layer.' },
    solution: 'Integrity proves the arithmetic ties together; reasonableness and consistency need their own checks.',
  },
  {
    id: 'f07-mr-k6', type: 'mc', kind: 'applied',
    prompt: 'Ana has sent version 1.0 of the model to Coastline and then finds a small error. What should she do?',
    options: ['Fix it in version 1.1, log the change and tell Coastline', 'Correct version 1.0 quietly, since the error is only small', 'Leave it alone, because the bank has already seen the model', 'Delete version 1.0 so that there is only ever one model'],
    answer: 0,
    feedback: { 1: 'Then the bank and Ana would be looking at different numbers under the same name.', 2: 'An uncorrected error undermines the model later.', 3: 'Versions that were sent must be kept.' },
    solution: 'Never edit a version that has been sent; correct in a new version, record it, and tell the recipient.',
  },
];
