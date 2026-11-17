// assess-m1.js — F07 module 1 test: Foundations of a model (modelling-principles, setting-up-the-history,
// revenue-and-cost-forecasts). No hints; full solutions shown on review. New scenarios: Fernhill Bakery and its figures
// are fictional and introduced here; the Lantern items ask new questions of case.js's figures.
import { HISTORY, ASSUME } from './case.js?v=37';

const H7 = HISTORY[2027];
const FERN = { y2027: 312_000, months: 8, growth: [0.06, 0.05], ingredients: 0.34, rent: 26_400, inflation: 0.03 };
const fernBase = FERN.y2027 * 12 / FERN.months;
const FM = '$#,##0';

export const items = [
  {
    id: 'f07-m1-1', lesson: 'modelling-principles', type: 'formula', kind: 'applied',
    prompt: 'Fernhill Bakery (fictional) forecasts flour costs as a share of bread sales. Bread sales for 2028–2031 are in C4:F4; the flour share, the same every year, is in B6. In C7, write the 2028 flour cost so that it is right when filled right to F7.',
    sheet: { cells: { A1: 'Fernhill Bakery ($)', A3: 'Year', C3: '2028E', D3: '2029E', E3: '2030E', F3: '2031E', A4: 'Bread sales', C4: 180_000, D4: 192_600, E4: 204_156, F4: 214_364, A6: 'Flour, share of bread sales', B6: 0.12, A7: 'Flour cost' } },
    cell: 'C7', fill: 'C7:F7', view: 'A1:F7', widths: { A: 28, B: 9, C: 11, D: 11, E: 11, F: 11 }, formats: { C4: FM, D4: FM, E4: FM, F4: FM, B6: '0.0%', C7: FM, D7: FM, E7: FM, F7: FM },
    answer: '=C4*$B$6', alt: ['=$B$6*C4', '=C4*$B6'],
    wrong: [{ formula: '=C4*B6', say: 'B6 moves to C6, D6 … when filled right, where there is nothing. Anchor the share: $B$6.' }, { formula: '=C4*0.12', say: 'The 12% is typed into the formula, so a change in B6 never reaches it.' }],
    solution: '<x>=C4*$B$6</x>: sales move with the year, the single share stays put. 180,000 × 12% = 21,600 in 2028.',
  },
  {
    id: 'f07-m1-2', lesson: 'modelling-principles', type: 'mc', kind: 'conceptual',
    prompt: 'A model’s 2030 revenue cell contains <x>=E9*1.07</x>, while its neighbours contain <x>=D9*(1+E$4)</x> and so on. What is the main risk?',
    options: ['The 7% will not change when the growth input for 2030 does', 'The formula refers to the wrong year’s revenue, so 2030 grows twice', 'Multiplying by 1.07 rounds the result to whole dollars', 'Excel cannot fill a formula that mixes numbers and references'],
    answer: 0,
    feedback: { 1: 'E9 is last year’s revenue for a 2030 cell in column F; the reference is fine. The problem is the typed 1.07.', 2: 'No rounding happens; the answer can be any value.', 3: 'Excel fills such formulas; the result is just inflexible.' },
    solution: 'The growth assumption is hard-coded into one cell. When anyone changes the input for 2030, this cell (and everything grown from it) ignores the change.',
  },
  {
    id: 'f07-m1-3', lesson: 'modelling-principles', type: 'num', kind: 'numerical',
    prompt: 'A new shop opens on 1 August. A full year of its rent would be $42,000. With a months-open row multiplying an annual amount, what rent does the model charge in the opening year?',
    answer: 17500, check: () => 42000 * 5 / 12, unit: '$', places: 0, tol: 1,
    wrong: [{ value: 42000 * 4 / 12, say: 'August to December is five months, not four.' }],
    solution: 'August–December = 5 months; 42,000 × 5 ÷ 12 = 17,500 dollars.',
  },
  {
    id: 'f07-m1-4', lesson: 'setting-up-the-history', type: 'num', kind: 'numerical',
    prompt: 'Fernhill Bakery’s café opened on 1 May and sold $312,000 in its eight months to 31 December. What is the twelve-month figure its forecast should grow from?',
    answer: fernBase, check: () => 312000 * 12 / 8, unit: '$', places: 0, tol: 1,
    wrong: [{ value: 312000 * 8 / 12, say: 'Eight months is less than a year, so the full year is larger: × 12 ÷ 8.' }],
    solution: '312,000 × 12 ÷ 8 = 468,000 dollars.',
  },
  {
    id: 'f07-m1-5', lesson: 'setting-up-the-history', type: 'classify', kind: 'applied',
    prompt: 'You are condensing Lantern’s 2027 income statement for the model. Which model line does each account belong to?',
    items: ['Sales Returns and Allowances', 'Operating Lease Cost (the cafés)', 'Card and Platform Fees Expense', 'Interest Expense', 'Market Research Expense'],
    categories: ['Netted against online sales', 'Occupancy', 'Other operating costs (a share of revenue)', 'Below EBITDA', 'Its own line, normalised as a one-off'],
    answer: [0, 1, 2, 3, 4],
    solution: 'Returns reduce the online sales they arise from; lease cost joins rent in occupancy; small mixed costs go to other operating costs; interest is below EBITDA; the one-off research keeps its own line so it can be added back.',
  },
  {
    id: 'f07-m1-6', lesson: 'setting-up-the-history', type: 'num', kind: 'numerical',
    prompt: `Lantern’s 2027 condensed history shows revenue of $${H7.revenue.toLocaleString('en-US')} and wages of $${H7.wages.toLocaleString('en-US')}. What were wages as a percentage of revenue, to one decimal place?`,
    answer: Math.round(H7.wages / H7.revenue * 1000) / 10, check: () => H7.wages / H7.revenue * 100, unit: '%', places: 1, tol: 0.06,
    solution: `${H7.wages.toLocaleString('en-US')} ÷ ${H7.revenue.toLocaleString('en-US')} = ${(H7.wages / H7.revenue * 100).toFixed(1)}%. The forecast does not use this share as a driver, because most wages are fixed.`,
  },
  {
    id: 'f07-m1-7', lesson: 'setting-up-the-history', type: 'mc', kind: 'applied',
    prompt: 'A company adds back “restructuring costs” in its adjusted EBITDA for the fifth year running. How should your model treat them?',
    options: ['As a recurring cost of the business', 'As a one-off, because the company labels it so', 'As an increase in revenue', 'As a financing cost below EBITDA'],
    answer: 0,
    feedback: { 1: 'A label is not evidence. Five years in a row is a pattern.', 2: 'Restructuring costs are costs, not revenue.', 3: 'They are operating costs, not financing.' },
    solution: 'A cost that recurs every year is part of running the business; normalising it out would flatter the base the forecast grows from.',
  },
  {
    id: 'f07-m1-8', lesson: 'revenue-and-cost-forecasts', type: 'num', kind: 'numerical',
    prompt: 'Fernhill Bakery’s rent is $26,400 a year, fixed by a lease that rises with inflation of 3% a year from next year. Fernhill’s sales are forecast to grow 6% next year. What rent should the model show next year?',
    answer: 27192, check: () => 26400 * 1.03, unit: '$', places: 0, tol: 1,
    wrong: [{ value: 26400 * 1.06, say: 'Rent follows the lease’s inflation clause, not sales growth.' }],
    solution: '26,400 × 1.03 = 27,192 dollars. A fixed cost rises with its own driver, not with sales.',
  },
  {
    id: 'f07-m1-9', lesson: 'revenue-and-cost-forecasts', type: 'num', kind: 'numerical',
    prompt: 'A franchise’s project years run July to June. Its first project year brings $240,000 of revenue and its second $300,000. How much revenue falls in its second calendar year?',
    answer: 270000, check: () => 240000 * 6 / 12 + 300000 * 6 / 12, unit: '$', places: 0, tol: 1,
    solution: 'January–June of the second calendar year belong to project year 1 (6/12 × 240,000 = 120,000) and July–December to project year 2 (6/12 × 300,000 = 150,000): 270,000 dollars.',
  },
  {
    id: 'f07-m1-10', lesson: 'revenue-and-cost-forecasts', type: 'mc', kind: 'applied',
    prompt: `Ana’s plan sells ${ASSUME.coldBrew.cans[0].toLocaleString('en-US')} cans of Cold Brew in 2028 against fixed launch costs of $62,000. If the cans came in 20% short, what would happen to Cold Brew’s 2028 contribution?`,
    options: ['It falls by 20% of the cans’ margin, about $8,500', 'It falls by 20% of revenue and 20% of fixed costs together', 'It improves, because fewer cans cost less to produce', 'It stays the same, because fixed costs dominate the launch'],
    answer: 0,
    feedback: { 1: 'Fixed costs do not shrink with volume; only the per-can costs do.', 2: 'Fewer cans cost less, but they also bring in less, and the margin on each can is positive.', 3: 'The fixed costs stay; the margin lost on the missing cans comes straight off the contribution.' },
    solution: `6,000 fewer cans × ($2.1638 − $0.74) = ${Math.round(6000 * (2.1638 - 0.74)).toLocaleString('en-US')} dollars of contribution lost; the $62,000 of fixed costs is unchanged.`,
  },
];
