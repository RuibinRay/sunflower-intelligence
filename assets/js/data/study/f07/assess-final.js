// assess-final.js — F07 final: all three modules, 22 items; 70% passes. No hints; solutions on review. Marlow Garden
// Centre and its figures are fictional and introduced here; the Lantern items ask new questions of case.js's model.
import { MODEL as M, DCF as D, OPENING as O, scenario, FORECAST as F, ASSUME as A } from './case.js?v=40';

const R = M.rows;
const pmt = (P, r, n) => P * r / (1 - (1 + r) ** -n);
const glass = pmt(48000, 0.08 / 12, 48);
const s70 = scenario({ termAmount: 70000 });
const MG = '$#,##0';

export const items = [
  // ---------------------------------------------------------------- module 1
  {
    id: 'f07-fn-1', lesson: 'modelling-principles', type: 'formula', kind: 'applied',
    prompt: 'Marlow Garden Centre (fictional) grows plant sales by a different rate each year (C3:F3). 2027’s actual sales are in B5. In C5, write the 2028 forecast so that it fills right to F5.',
    sheet: { cells: { A1: 'Marlow Garden Centre ($)', A2: 'Year', B2: '2027A', C2: '2028E', D2: '2029E', E2: '2030E', F2: '2031E', A3: 'Plant sales growth', C3: 0.04, D3: 0.06, E3: 0.05, F3: 0.03, A5: 'Plant sales', B5: 640_000 } },
    cell: 'C5', fill: 'C5:F5', view: 'A1:F5', widths: { A: 22, B: 11, C: 11, D: 11, E: 11, F: 11 }, formats: { C3: '0.0%', D3: '0.0%', E3: '0.0%', F3: '0.0%', B5: MG, C5: MG, D5: MG, E5: MG, F5: MG },
    answer: '=B5*(1+C$3)', alt: ['=B5*(1+C3)', '=B5+B5*C$3', '=B5+B5*C3', '=(1+C$3)*B5'],
    wrong: [{ formula: '=B5*(1+$C$3)', say: 'Filled right, every year would use 2028’s 4%. Let the column move: C$3.' }, { formula: '=$B$5*(1+C$3)', say: 'Each year must grow the year before, not 2027 every time.' }],
    solution: '<x>=B5*(1+C$3)</x>: 640,000 × 1.04 = 665,600 in 2028, then each year grows the last by its own rate.',
  },
  {
    id: 'f07-fn-2', lesson: 'modelling-principles', type: 'mc', kind: 'applied',
    prompt: 'Marlow’s café will open on 1 September 2028. Which model design lets the opening date change without editing formulas?',
    options: ['Typing the café’s 2028 figures into each row by hand', 'A months-open input row multiplied into every café line', 'A separate worksheet for the café that is copied in when it opens', 'Leaving the café out until it has a year of actual results'],
    answer: 1,
    feedback: { 0: 'Typed figures do not move when the date does.', 2: 'Copies drift; the date would still be buried in them.', 3: 'Then the forecast ignores a decision already made.' },
    solution: 'A months-open row (4 in 2028, 12 after) carries the date into every café line; change the input and they all follow.',
  },
  {
    id: 'f07-fn-3', lesson: 'setting-up-the-history', type: 'num', kind: 'numerical',
    prompt: 'Marlow’s 2027 cost of goods was $410,000, covering plants and its small café. The café’s food cost was 30% of its $90,000 of sales. Plant sales were $640,000. What was the plants’ cost share, as a percentage?',
    answer: 59.84, check: () => (410000 - 0.30 * 90000) / 640000 * 100, unit: '%', places: 2, tol: 0.05,
    wrong: [{ value: 410000 / (640000 + 90000) * 100, say: 'That blends the café into the plants’ cost share. Take the café’s cost out first.' }],
    solution: 'Café cost 0.30 × 90,000 = 27,000; plants 410,000 − 27,000 = 383,000; 383,000 ÷ 640,000 = 59.84%.',
  },
  {
    id: 'f07-fn-4', lesson: 'setting-up-the-history', type: 'mc', kind: 'conceptual',
    prompt: 'Why does a model keep the reported history beside the normalised figures instead of replacing it?',
    options: ['So that readers can see each adjustment and judge it', 'Because spreadsheets cannot overwrite historical numbers', 'Because normalised figures are always lower than reported ones', 'So that the forecast can be grown from either figure at random'],
    answer: 0,
    feedback: { 1: 'They can; the issue is transparency.', 2: 'Adding back a one-off cost makes the normalised figure higher.', 3: 'The forecast grows from the normalised base, deliberately.' },
    solution: 'Visible adjustments can be challenged; hidden ones cannot. The reported figures stay as the record.',
  },
  {
    id: 'f07-fn-5', lesson: 'revenue-and-cost-forecasts', type: 'num', kind: 'numerical',
    prompt: 'Marlow’s staff cost $210,000 last year. Pay rises 2.5% a year, and from the second forecast year it adds a greenhouse manager, a step cost of $38,000 a year (not yet subject to rises). What are staff costs in the third forecast year?',
    answer: Math.round(210000 * 1.025 ** 3 + 38000), check: () => 210000 * 1.025 ** 3 + 38000, unit: '$', places: 0, tol: 1,
    wrong: [{ value: Math.round(210000 * 1.025 ** 3), say: 'The manager joins from the second year: add the step cost.' }],
    solution: `210,000 × 1.025³ = ${Math.round(210000 * 1.025 ** 3).toLocaleString('en-US')}; plus the manager’s 38,000 = ${Math.round(210000 * 1.025 ** 3 + 38000).toLocaleString('en-US')} dollars.`,
  },
  {
    id: 'f07-fn-6', lesson: 'revenue-and-cost-forecasts', type: 'mc', kind: 'applied',
    prompt: 'Marlow forecasts its greenhouse heating, a fixed cost, as 3% of sales. Sales are forecast to grow 20% over three years. What does that do to the forecast margin?',
    options: ['It understates the margin’s rise as fixed costs are spread over more sales', 'It overstates profit, because heating will rise faster than sales once the glasshouses are full', 'Nothing, because 3% of sales and a fixed amount are the same thing', 'It makes the heating cost fall as sales grow over the three years'],
    answer: 0,
    feedback: { 1: 'If heating is fixed, it rises less than sales, not more.', 2: 'They agree only in the base year.', 3: 'At 3% of sales it rises with sales.' },
    solution: 'A fixed cost forecast as a share of sales grows with sales, so the margin stays flat when it would really improve.',
  },
  {
    id: 'f07-fn-7', lesson: 'revenue-and-cost-forecasts', type: 'num', kind: 'numerical',
    prompt: `In 2030 Lantern sells ${A.coldBrew.cans[2].toLocaleString('en-US')} cans of Cold Brew at $2.1638, each costing $0.74, with promotion, listing and the brand manager costing $41,000. What is Cold Brew’s contribution?`,
    answer: Math.round(A.coldBrew.cans[2] * (2.1638 - 0.74) - 41000), check: () => A.coldBrew.cans[2] * (A.coldBrew.netPrice - A.coldBrew.costPerCan) - F.coldBrewFixed[2], unit: '$', places: 0, tol: 1,
    solution: `${A.coldBrew.cans[2].toLocaleString('en-US')} × (2.1638 − 0.74) − 41,000 = ${Math.round(A.coldBrew.cans[2] * (2.1638 - 0.74) - 41000).toLocaleString('en-US')} dollars.`,
  },
  // ---------------------------------------------------------------- module 2
  {
    id: 'f07-fn-8', lesson: 'working-capital-and-capex', type: 'num', kind: 'numerical',
    prompt: 'Marlow pays its plant nurseries in 45 days. Its cost of goods next year is forecast at $438,000. What payables should the model show at the year end?',
    answer: 54000, check: () => 438000 * 45 / 365, unit: '$', places: 0, tol: 1,
    solution: '438,000 × 45 ÷ 365 = 54,000 dollars.',
  },
  {
    id: 'f07-fn-9', lesson: 'working-capital-and-capex', type: 'num', kind: 'numerical',
    prompt: 'Marlow’s net property and equipment is $180,000 at the start of the year. It builds a $48,000 glasshouse, in use from 1 April and depreciated over 20 years, and its other assets depreciate by $15,000. What is net property and equipment at the year end?',
    answer: 211200, check: () => 180000 + 48000 - (48000 / 240 * 9 + 15000), unit: '$', places: 0, tol: 1,
    solution: 'Glasshouse depreciation 48,000 ÷ 240 × 9 = 1,800; total 16,800; 180,000 + 48,000 − 16,800 = 211,200 dollars.',
  },
  {
    id: 'f07-fn-10', lesson: 'working-capital-and-capex', type: 'mc', kind: 'conceptual',
    prompt: 'Which of these is a use of cash in the year it happens?',
    options: ['An increase in payables', 'An increase in inventory', 'An increase in unearned revenue from customers paying ahead', 'Depreciation charged on equipment bought in earlier years'],
    answer: 1,
    feedback: { 0: 'More credit from suppliers provides cash.', 2: 'Customers paying in advance provide cash.', 3: 'Depreciation is not a cash payment.' },
    solution: 'More stock means cash spent before it is recovered from customers.',
  },
  {
    id: 'f07-fn-11', lesson: 'debt-schedules', type: 'num', kind: 'numerical',
    prompt: `Marlow’s $48,000 glasshouse loan at 8% a year is repaid in 48 equal monthly payments of $${glass.toFixed(2)}. How much interest does Marlow pay over the life of the loan?`,
    answer: Math.round(glass * 48 - 48000), check: () => pmt(48000, 0.08 / 12, 48) * 48 - 48000, unit: '$', places: 0, tol: 1,
    solution: `48 × ${glass.toFixed(2)} − 48,000 = ${Math.round(glass * 48 - 48000).toLocaleString('en-US')} dollars: everything paid beyond the amount borrowed is interest.`,
  },
  {
    id: 'f07-fn-12', lesson: 'debt-schedules', type: 'num', kind: 'numerical',
    prompt: `At 31 December 2029 Lantern owes $${Math.round(R[1].debtEnd).toLocaleString('en-US')} on its van note and term loan, of which $${Math.round(R[1].currentDebt).toLocaleString('en-US')} is due during 2030. How much should the balance sheet show as long-term debt?`,
    answer: Math.round(R[1].longDebt), check: () => R[1].debtEnd - R[1].currentDebt, unit: '$', places: 0, tol: 1,
    solution: `${Math.round(R[1].debtEnd).toLocaleString('en-US')} − ${Math.round(R[1].currentDebt).toLocaleString('en-US')} = ${Math.round(R[1].longDebt).toLocaleString('en-US')} dollars; the rest is the current portion, a current liability.`,
  },
  {
    id: 'f07-fn-13', lesson: 'debt-schedules', type: 'mc', kind: 'applied',
    prompt: 'Marlow’s revolver formula asks for $70,000 on a $50,000 line of credit. What should the model show?',
    options: ['$70,000 drawn, because the bank will probably agree to extend the line when asked', 'The line at $50,000 and a $20,000 funding gap shown in its own row', 'The minimum cash balance lowered by $20,000 to make it fit', 'Cash at minus $20,000 at the year end, with no further comment'],
    answer: 1,
    feedback: { 0: 'Assuming more credit than agreed hides the problem.', 2: 'Changing an assumption to make a problem disappear is worse than showing it.', 3: 'A negative cash balance without explanation is a broken model.' },
    solution: 'Cap the line at its limit and show the gap, so the business sees it needs more financing or less spending.',
  },
  {
    id: 'f07-fn-14', lesson: 'linking-the-statements', type: 'num', kind: 'numerical',
    prompt: 'A business made a tax loss of $24,000 last year and a pre-tax profit of $60,000 this year. At 25%, with the loss carried forward in full, what is this year’s tax?',
    answer: 9000, check: () => 0.25 * (60000 - 24000), unit: '$', places: 0, tol: 1,
    solution: '25% × (60,000 − 24,000) = 9,000 dollars.',
  },
  {
    id: 'f07-fn-15', lesson: 'linking-the-statements', type: 'num', kind: 'numerical',
    prompt: `Lantern ends 2029 with $${Math.round(R[1].cash).toLocaleString('en-US')} of cash. In 2030 its operating cash flow is $${Math.round(R[2].cfo).toLocaleString('en-US')}, capital spending $25,000 and financing cash flow −$${Math.round(-R[2].cff).toLocaleString('en-US')}. What is cash at the end of 2030?`,
    answer: Math.round(R[2].cash), check: () => Math.round(R[1].cash) + Math.round(R[2].cfo) - 25000 - Math.round(-R[2].cff), unit: '$', places: 0, tol: 2,
    solution: `${Math.round(R[1].cash).toLocaleString('en-US')} + ${Math.round(R[2].cfo).toLocaleString('en-US')} − 25,000 − ${Math.round(-R[2].cff).toLocaleString('en-US')} = ${Math.round(R[2].cash).toLocaleString('en-US')} dollars.`,
  },
  {
    id: 'f07-fn-16', lesson: 'linking-the-statements', type: 'mc', kind: 'applied',
    prompt: 'To lift its current ratio at the year end, Marlow considers delaying a $15,000 glasshouse repair into the next year. Why can that help where drawing on its line of credit cannot?',
    options: ['Cash stays higher with no new current liability', 'Repairs are not counted in any financial statement', 'Delaying spending always raises next year’s profit by the same amount', 'The line of credit is not allowed to be drawn at a year end'],
    answer: 0,
    feedback: { 1: 'A repair is an expense or capital spending; it appears.', 2: 'It moves the cost, it does not remove it.', 3: 'Lines can be drawn at any time; drawn amounts are current liabilities.' },
    solution: 'Spending less keeps cash (a current asset) up without adding to current liabilities, unlike short-term borrowing.',
  },
  // ---------------------------------------------------------------- module 3
  {
    id: 'f07-fn-17', lesson: 'dcf-model', type: 'num', kind: 'numerical',
    prompt: 'A business’s enterprise value is $820,000. At the valuation date it owes $140,000, has $35,000 of cash, and its lease cost is already deducted in its free cash flow. What is its equity value?',
    answer: 715000, check: () => 820000 - 140000 + 35000, unit: '$', places: 0, tol: 1,
    solution: '820,000 − (140,000 − 35,000) = 715,000 dollars; leases stay out of net debt because their cost is already in the cash flows.',
  },
  {
    id: 'f07-fn-18', lesson: 'dcf-model', type: 'mc', kind: 'conceptual',
    prompt: 'Why does Lantern’s DCF calculate tax on EBIT rather than on profit after interest?',
    options: ['Because Lantern pays no interest', 'The interest tax shield is counted in the WACC’s after-tax cost of debt', 'Because tax law charges tax on EBIT', 'To make the result more conservative than a normal valuation would be'],
    answer: 1,
    feedback: { 0: 'Lantern pays interest on several loans.', 2: 'Tax is charged on profit after interest; the choice avoids double counting.', 3: 'It is about consistency, not caution.' },
    solution: 'FCFF is the cash flow of the business as if unlevered; the benefit of deducting interest enters through the after-tax cost of debt.',
  },
  {
    id: 'f07-fn-19', lesson: 'dcf-model', type: 'num', kind: 'numerical',
    prompt: `Lantern’s terminal value is $${Math.round(D.tv).toLocaleString('en-US')} at the end of 2032 and its WACC 11.16%. What is it worth at the end of 2027, five years earlier?`,
    answer: Math.round(D.pvTv), check: () => D.tv / (1 + D.wacc) ** 5, unit: '$', places: 0, tol: 60,
    solution: `${Math.round(D.tv).toLocaleString('en-US')} ÷ 1.1116⁵ = ${Math.round(D.pvTv).toLocaleString('en-US')} dollars.`,
  },
  {
    id: 'f07-fn-20', lesson: 'scenarios-and-sensitivity', type: 'num', kind: 'numerical',
    prompt: `With a $70,000 term loan, Lantern’s current ratio at the end of 2028 is ${s70.ratios[0].toFixed(2)}. By how many points of ratio does it fall short of the 1.2 covenant?`,
    answer: Math.round((1.2 - s70.ratios[0]) * 100) / 100, check: () => 1.2 - s70.ratios[0], unit: '', places: 2, tol: 0.006,
    solution: `1.2 − ${s70.ratios[0].toFixed(2)} = ${(1.2 - s70.ratios[0]).toFixed(2)}: closer than with $60,000, but still a breach.`,
  },
  {
    id: 'f07-fn-21', lesson: 'scenarios-and-sensitivity', type: 'mc', kind: 'applied',
    prompt: 'Marlow’s tornado chart puts the price of compost at the top, but the modeller gave compost a ±40% range and everything else ±5%. What should a reviewer conclude?',
    options: ['Compost is the business’s biggest risk', 'The ranking mostly reflects the ranges chosen; redo it with comparable ranges', 'Tornado charts cannot be used for garden centres', 'The other assumptions are now shown to be unimportant and can be left out of the scenarios'],
    answer: 1,
    feedback: { 0: 'It might be, but this chart cannot show it fairly.', 2: 'They work for any business.', 3: 'With fair ranges they might matter a great deal.' },
    solution: 'A tornado ranks swings, and swings depend on the ranges given. Use equally plausible ranges before reading the order.',
  },
  {
    id: 'f07-fn-22', lesson: 'model-review-and-presentation', type: 'mc', kind: 'applied',
    prompt: 'Marlow’s balance check is zero in the first forecast year, then +2,000, +4,000, +6,000 in the next three. Its glasshouse loan repays $2,000 of principal a year from the second year. What is the likely error?',
    options: ['Dividends are deducted twice', 'The repayments reduce the loan but never leave cash', 'The opening balance sheet does not balance at the start of the model', 'Depreciation on the glasshouse is not charged in the first year'],
    answer: 1,
    feedback: { 0: 'That would make equity too low by the dividends, not track the repayments.', 2: 'An opening error would show in the opening column and stay constant.', 3: 'That would affect one year, not grow by $2,000 a year.' },
    solution: 'A positive check means assets exceed liabilities and equity. Growing by $2,000 a year from the second year, it matches the repayments: the loan balance falls each year, but the cash paid out is missing from financing cash flow, so cash (an asset) stays too high. Add the repayment to the cash flow statement.',
  },
];
