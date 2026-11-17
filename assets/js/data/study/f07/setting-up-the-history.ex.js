// setting-up-the-history.ex.js — F07 · Setting up the history: widgets, practice and the knowledge check (answer keys
// live here). Lantern's figures come from case.js (HISTORY, condensed from F02/F03; DERIVED). Brightcup's are F06's
// fictional listed company. Every num item's `check` recomputes its answer.
import { HISTORY, DERIVED } from './case.js?v=33';
import { COMPANIES } from '../f06/case.js?v=33';

const H6 = HISTORY[2026], H7 = HISTORY[2027], B = COMPANIES.brightcup;
const M = '$#,##0', P = '0.0%';
const LINES = [
  [4, 'Catering', 'catering'], [5, 'Training', 'training'], [6, 'Online shop (net of returns)', 'online'], [7, 'Cafés', 'cafes'],
  [9, 'Cost of goods sold', 'costOfGoods'], [10, 'Cost of services', 'costOfServices'],
  [12, 'Wages', 'wages'], [13, 'Occupancy', 'occupancy'], [14, 'Market research', 'research'], [15, 'Advertising', 'advertising'], [16, 'Other operating costs', 'other'],
];

/** The condensed history: 2026A in column B, 2027A in C; totals and driver rows are formulas. */
export function historyCells({ drivers = true } = {}) {
  const c = { A1: 'Lantern Coffee Co.: condensed history ($)', A3: 'Line', B3: '2026A', C3: '2027A' };
  for (const [r, label, k] of LINES) { c[`A${r}`] = label; c[`B${r}`] = H6[k]; c[`C${r}`] = H7[k]; }
  for (const k of ['B', 'C']) {
    c[`${k}8`] = `=SUM(${k}4:${k}7)`; c[`${k}11`] = `=${k}8-${k}9-${k}10`; c[`${k}17`] = `=${k}11-SUM(${k}12:${k}16)`;
  }
  Object.assign(c, { A8: 'Revenue', A11: 'Gross profit', A17: 'EBITDA' });
  if (drivers) {
    Object.assign(c, {
      A19: 'Gross margin', B19: '=B11/B8', C19: '=C11/C8',
      A20: 'EBITDA margin', B20: '=B17/B8', C20: '=C17/C8',
      A21: 'One-off costs added back', C21: H7.research,
      A22: 'Normalised EBITDA', C22: '=C17+C21',
      A23: 'Normalised EBITDA margin', C23: '=C22/C8',
      A24: 'Other operating costs, share of revenue', B24: '=B16/B8', C24: '=C16/C8',
    });
  }
  return c;
}
const FORMATS = {
  ...Object.fromEntries(['B', 'C'].flatMap((k) => [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 21, 22].map((r) => [`${k}${r}`, M]))),
  ...Object.fromEntries(['B', 'C'].flatMap((k) => [19, 20, 23, 24, 26].map((r) => [`${k}${r}`, P]))),
};
const WIDTHS = { A: 36, B: 12, C: 12 };

export const widgets = {
  'hist-sheet': {
    type: 'sheet', title: 'Lantern’s condensed history and its drivers (fictional case figures)',
    sheet: { cells: historyCells() }, view: 'A1:C24', widths: WIDTHS, formats: FORMATS, editable: true, mark: ['C22:C23'],
    tools: ['formulas', 'reset'],
    note: 'Totals and the driver rows are formulas. The gross margin rises from 2026 to 2027 although no product changed price: the cafés changed the mix. Set C21 to 0 to see the reported margin again.',
  },
};

export const guided = [
  {
    id: 'f07-hs-g1', type: 'formula', kind: 'applied',
    prompt: 'Row 24 should show other operating costs as a share of revenue, the driver Ana will use. In B24, write the formula for 2026 so that, filled right to C24, it gives 2027’s share too.',
    sheet: { cells: { ...historyCells({ drivers: false }), A24: 'Other operating costs, share of revenue' }, fixed: ['B9', 'C13', 'C16'] }, cell: 'B24', fill: 'B24:C24', view: 'A1:C24', widths: WIDTHS, formats: FORMATS,
    answer: '=B16/B8',
    alt: ['=B16/SUM(B4:B7)'],
    wrong: [
      { formula: '=B16/$B$8', say: 'Anchoring the revenue keeps 2026’s revenue in 2027’s share. Each year divides by its own revenue: B8, relative.' },
      { formula: '=B8/B16', say: 'Upside down: a share of revenue is the cost divided by revenue.' },
      { formula: '=B16/B17', say: 'That divides by EBITDA. The driver is revenue (row 8).' },
    ],
    hints: ['A share of revenue is the cost divided by the revenue of the same year.', 'Other operating costs are in row 16, revenue in row 8: =B16/B8.'],
    solution: `<x>=B16/B8</x>: ${H6.other.toLocaleString('en-US')} ÷ ${H6.revenue.toLocaleString('en-US')} = ${(H6.other / H6.revenue * 100).toFixed(1)}% in 2026 and ${(H7.other / H7.revenue * 100).toFixed(1)}% in 2027. Ana rounds 2027’s to 9.1% for her forecast.`,
  },
  {
    id: 'f07-hs-g2', type: 'steps', kind: 'numerical',
    prompt: 'In 2027 Lantern’s cost of goods sold was $163,125, covering the cafés and the online shop. F03’s records show café cost of goods was 31% of café sales of $236,000. Find the online shop’s cost share.',
    steps: [
      { id: 'f07-hs-g2a', type: 'num', kind: 'numerical', prompt: 'Café cost of goods in 2027 ($).', answer: DERIVED.cafeCogs2027, check: () => 236000 * 0.31, unit: '$', places: 0, tol: 1, hints: ['31% of café sales.'] },
      { id: 'f07-hs-g2b', type: 'num', kind: 'numerical', prompt: 'Online cost of goods in 2027 ($).', answer: 89965, check: () => H7.costOfGoods - 236000 * 0.31, unit: '$', places: 0, tol: 1, hints: ['Total cost of goods minus the cafés’ share.'] },
      { id: 'f07-hs-g2c', type: 'num', kind: 'numerical', prompt: 'Online cost of goods as a percentage of online sales of $187,500.', answer: 47.98, check: () => (H7.costOfGoods - 236000 * 0.31) / H7.online * 100, unit: '%', places: 2, tol: 0.05, hints: ['Divide by online sales and multiply by 100.'],
        wrong: [{ value: H7.costOfGoods / (H7.cafes + H7.online) * 100, say: 'That is the cost share of cafés and online together, which mixes a 31% business with a 48% one.' }] },
    ],
    solution: '236,000 × 0.31 = 73,160 for the cafés; 163,125 − 73,160 = 89,965 for the online shop; 89,965 ÷ 187,500 = 47.98%, about 48%. The blended share for the two together (38.5%) would be wrong for either one.',
  },
  {
    id: 'f07-hs-g3', type: 'classify', kind: 'conceptual',
    prompt: 'You are building a model of a listed US company from its Form 10-K. Where would you look first for each piece of information?',
    items: ['The repayments due on each loan in each of the next five years', 'The risks management considers material', 'Why gross margin fell last year, and the capital spending planned', 'How a one-point rise in interest rates would affect interest costs', 'Revenue and operating profit by segment'],
    categories: ['Item 1A: Risk Factors', 'Item 7: MD&A', 'Item 7A: Market risk', 'Item 8: statements and notes'],
    answer: [3, 0, 1, 2, 3],
    feedback: { 0: 'Debt maturities are in the debt note to the financial statements, in Item 8.', 4: 'Segment results are in the segment note in Item 8 (and discussed in MD&A).' },
    hints: ['Numbers with a contractual schedule live in the notes. Explanations live in MD&A.'],
    solution: 'Debt maturities and segment results: notes in Item 8. Material risks: Item 1A. Reasons and plans: Item 7 (MD&A). Interest-rate sensitivity: Item 7A.',
  },
  {
    id: 'f07-hs-g4', type: 'num', kind: 'numerical',
    prompt: 'Lantern’s reported 2027 EBITDA was $52,587 on revenue of $577,860. Ana adds back the $21,000 of market research as a one-off. What is the normalised EBITDA margin, as a percentage?',
    answer: 12.73, check: () => (H7.ebitda + H7.research) / H7.revenue * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [
      { value: H7.ebitda / H7.revenue * 100, say: 'That is the reported margin, before the add-back.' },
      { value: (H7.ebitda + H7.research) / (H7.revenue + H7.research) * 100, say: 'Adding back a cost changes EBITDA, not revenue. Divide by the reported revenue.' },
    ],
    hints: ['Normalised EBITDA = reported EBITDA + one-off costs.', '(52,587 + 21,000) ÷ 577,860.'],
    solution: '(52,587 + 21,000) ÷ 577,860 = 73,587 ÷ 577,860 = 12.73%, against 9.10% reported.',
  },
];

export const independent = [
  {
    id: 'f07-hs-i1', type: 'num', kind: 'numerical',
    prompt: 'The cafés paid $92,000 of wages in the ten months they traded in 2027. What is the twelve-month figure Ana starts her wage forecast from?',
    answer: 110400, check: () => 92000 * 12 / 10, unit: '$', places: 0, tol: 1,
    wrong: [{ value: 92000 * 10 / 12, say: 'Ten months is less than a year: multiply by 12 ÷ 10, not 10 ÷ 12.' }],
    solution: '92,000 × 12 ÷ 10 = 110,400 dollars.',
  },
  {
    id: 'f07-hs-i2', type: 'num', kind: 'numerical',
    prompt: 'Lantern’s cost of services was $61,080 in 2027, on catering revenue of $118,360 and training revenue of $36,000. What share of catering and training revenue is that, as a percentage?',
    answer: 39.57, check: () => H7.costOfServices / (H7.catering + H7.training) * 100, unit: '%', places: 2, tol: 0.05,
    wrong: [{ value: H7.costOfServices / H7.revenue * 100, say: 'Cost of services belongs to catering and training, not to the whole business. Divide by their revenue only.' }],
    solution: '61,080 ÷ (118,360 + 36,000) = 61,080 ÷ 154,360 = 39.57%, about 39.6%.',
  },
  {
    id: 'f07-hs-i3', type: 'mc', kind: 'conceptual',
    prompt: 'Lantern’s revenue grew 199% in 2027. Why would it be wrong to forecast 2028 by growing 2027 revenue at a similar rate?',
    options: [
      'Most of it came from opening two cafés: a one-time change, not a trend.',
      'Growth rates above 100% cannot be entered into a spreadsheet model without causing an error.',
      'Revenue should never be forecast from growth rates, only from prices and volumes.',
      'Because 2026 included a large one-off market research cost that depressed that year.',
    ],
    answer: 0,
    feedback: { 1: 'Spreadsheets handle any rate; the problem is economic, not technical.', 2: 'Growth rates are fine for lines whose business is stable.', 3: 'The research was in 2027, and it is a cost: it does not affect revenue growth.' },
    solution: 'The 2027 jump reflects a change in what Lantern is (two cafés opened), not how fast its existing lines grow. Forecast each line from its own driver.',
  },
  {
    id: 'f07-hs-i4', type: 'multi', kind: 'applied',
    prompt: 'Which of these would you normalise out of a company’s history when building a forecast base? Select all that apply.',
    options: ['A gain on selling the company’s old head office', 'A one-time legal settlement paid last year', 'The rent on the shops it trades from', 'Costs it calls “restructuring” every year for five years', 'Ten months of sales from shops opened in March, restated to twelve'],
    answer: [0, 1, 4],
    feedback: { 2: 'Rent recurs every year: it belongs in the forecast.', 3: 'A cost that recurs every year is part of the business, whatever it is called. Normalising it out would flatter the base.' },
    solution: 'One-off gains and costs (the sale, the settlement) come out; part years are restated. Recurring costs stay, even when labelled one-off.',
  },
  {
    id: 'f07-hs-i5', type: 'num', kind: 'numerical',
    prompt: 'Brightcup Coffee (fictional, F06) has debt of $630 million, cash of $40 million and EBITDA of $232 million. What is its net debt as a multiple of EBITDA?',
    answer: 2.54, check: () => (B.debt - B.cash) / B.ebitda, unit: '×', places: 2, tol: 0.01,
    wrong: [{ value: B.debt / B.ebitda, say: 'That uses gross debt. Net debt subtracts cash: 630 − 40.' }],
    solution: '(630 − 40) ÷ 232 = 590 ÷ 232 = 2.54 times.',
  },
];

export const check = [
  {
    id: 'f07-hs-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why must the condensed history add back exactly to the reported totals?',
    options: [
      'Otherwise a line was dropped or double-counted, and every driver inherits the error.',
      'Because lenders require every condensed statement in a model to be audited by a firm.',
      'Because a spreadsheet cannot add up two lists that have different numbers of rows.',
      'So that the forecast years grow at the same rate as the history did before them.',
    ],
    answer: 0,
    feedback: { 1: 'Nobody audits a model’s condensing; that is why the modeller checks it.', 2: 'Nothing technical stops the totals differing; that is the danger.', 3: 'Agreement with the totals says nothing about growth.' },
    solution: 'Agreement with the reported revenue, EBIT and net income proves no line went missing in the mapping. It is the first check on any model.',
  },
  {
    id: 'f07-hs-k2', type: 'num', kind: 'numerical',
    prompt: 'Lantern’s gross profit was $104,420 on revenue of $193,320 in 2026, and $353,655 on $577,860 in 2027. By how many percentage points did the gross margin rise?',
    answer: 7.19, check: () => (H7.grossProfit / H7.revenue - H6.grossProfit / H6.revenue) * 100, unit: 'pts', places: 2, tol: 0.03,
    solution: '353,655 ÷ 577,860 = 61.20%; 104,420 ÷ 193,320 = 54.01%; the margin rose 7.19 points, mainly because the cafés, with goods costing 31% of sales, joined the mix.',
  },
  {
    id: 'f07-hs-k3', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s 2027 EBITDA margin (9.1%) is far below 2026’s (22.0%). What should Ana’s model show Coastline?',
    options: [
      'The reported figures, labelled adjustment rows, and the normalised 12.7% beside them.',
      'Only the normalised figures, because they represent a typical year better than reported ones.',
      'Only the reported figures, because adjusting the history is not allowed in a lender’s model.',
      'The 2026 margin of 22.0%, because it was the better year and shows what Lantern can earn.',
    ],
    answer: 0,
    feedback: { 1: 'Replacing the reported figures hides what was adjusted and why. A lender will distrust it.', 2: 'Adjustments are normal and useful, as long as they are visible and explained.', 3: '2026 had no cafés: it is not a picture of the business that exists now.' },
    solution: 'Reported, adjustments and normalised side by side: the reader sees the facts, your judgement, and the base you chose.',
  },
  {
    id: 'f07-hs-k4', type: 'mc', kind: 'applied',
    prompt: 'A modeller needs the interest rate and repayment dates of a listed company’s bank loans. Where in its Form 10-K are they most likely to be?',
    options: ['In the debt note to the financial statements, in Item 8', 'In Item 1A, Risk Factors, where the company lists what could go wrong', 'In Item 5, on the market for its shares, dividends and repurchases', 'In Item 9A, Controls and Procedures over financial reporting'],
    answer: 0,
    feedback: { 1: 'Risk factors may mention that the company has debt, but not its terms.', 2: 'Item 5 covers the shares: trading, dividends and repurchases.', 3: 'Item 9A is about internal controls over financial reporting.' },
    solution: 'The notes in Item 8 give each borrowing’s rate, terms and the amounts due in each of the next years.',
  },
  {
    id: 'f07-hs-k5', type: 'num', kind: 'numerical',
    prompt: 'A large accelerated filer’s financial year ends on 31 December 2027. Within how many days of that date must it file its Form 10-K?',
    answer: 60, check: () => 60, unit: 'days', places: 0, tol: 0,
    wrong: [{ value: 90, say: '90 days is the period for filers that are neither large accelerated nor accelerated.' }, { value: 75, say: '75 days is for accelerated filers.' }],
    solution: 'Large accelerated filers have 60 days, accelerated filers 75 and other filers 90.',
  },
  {
    id: 'f07-hs-k6', type: 'mc', kind: 'conceptual',
    prompt: 'Which historical ratio is the soundest basis for a forecast?',
    options: [
      'One with a causal reason, a stable record and no planned change.',
      'The ratio from the most recent year, whatever happened in it, because it is the most up to date.',
      'The average of all the company’s ratios taken together, which smooths out any odd one.',
      'Any ratio at all, as long as it is calculated precisely to four decimal places.',
    ],
    answer: 0,
    feedback: { 1: 'The latest year may contain one-offs or a part year, as Lantern’s 2027 does.', 2: 'Averaging unrelated ratios produces a number with no meaning.', 3: 'Precision is not accuracy.' },
    solution: 'Reason, stability and no planned change. Where history is short, as Lantern’s is, combine it with business knowledge and say so.',
  },
];
