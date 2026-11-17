// assess-m2.js — F07 module 2 test: The three statements (working-capital-and-capex, debt-schedules,
// linking-the-statements). No hints; full solutions shown on review. Larkspur Pottery Studio and its figures are
// fictional and introduced here; the Lantern items ask new questions of case.js's model.
import { MODEL as M, OPENING as O, TERM_LOAN as T } from './case.js?v=36';

const R = M.rows;
const pmt = (P, r, n) => P * r / (1 - (1 + r) ** -n);
const kilnPay = pmt(36000, 0.06 / 12, 36);

export const items = [
  {
    id: 'f07-m2-1', lesson: 'working-capital-and-capex', type: 'num', kind: 'numerical',
    prompt: 'Larkspur Pottery Studio (fictional) sells to galleries on invoice and to walk-in customers by card. Next year it expects $146,000 of gallery sales and $219,000 of walk-in sales. Galleries pay in 40 days. What receivables should the model forecast at the year end?',
    answer: 16000, check: () => 146000 * 40 / 365, unit: '$', places: 0, tol: 1,
    wrong: [{ value: (146000 + 219000) * 40 / 365, say: 'Card sales are paid on the day: only the gallery sales leave receivables.' }],
    solution: '146,000 × 40 ÷ 365 = 16,000 dollars.',
  },
  {
    id: 'f07-m2-2', lesson: 'working-capital-and-capex', type: 'num', kind: 'numerical',
    prompt: 'Larkspur buys a kiln for $18,000 that comes into use on 1 November and is depreciated straight line over six years with no residual value. How much depreciation falls in that calendar year?',
    answer: 500, check: () => 18000 / 72 * 2, unit: '$', places: 0, tol: 1,
    wrong: [{ value: 3000, say: 'That is a full year. November and December are two months.' }],
    solution: '18,000 ÷ 72 months = 250 a month; two months = 500 dollars.',
  },
  {
    id: 'f07-m2-3', lesson: 'working-capital-and-capex', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s operating working capital rises by about $6,200 in 2029. Where does that appear in the model?',
    options: ['As a $6,200 deduction in 2029’s operating cash flow', 'As extra revenue in 2029 of about $6,200', 'As an investing cash outflow alongside capital spending', 'Nowhere: working capital is a balance sheet item only'],
    answer: 0,
    feedback: { 1: 'Working capital changes cash, not revenue.', 2: 'Working capital belongs to operating cash flow; investing is for long-lived assets.', 3: 'Its change runs through the cash flow statement; that is how the balance sheet stays balanced.' },
    solution: 'More receivables and stock than suppliers’ credit ties up cash: the increase is subtracted in operating cash flow.',
  },
  {
    id: 'f07-m2-4', lesson: 'debt-schedules', type: 'num', kind: 'numerical',
    prompt: 'Larkspur finances a $36,000 kiln with a loan at 6% a year, repaid in 36 equal monthly payments. What is the payment?',
    answer: Math.round(kilnPay * 100) / 100, check: () => pmt(36000, 0.005, 36), unit: '$', places: 2, tol: 0.01,
    solution: `36,000 × 0.005 ÷ (1 − 1.005⁻³⁶) = ${kilnPay.toFixed(2)} dollars.`,
  },
  {
    id: 'f07-m2-5', lesson: 'debt-schedules', type: 'num', kind: 'numerical',
    prompt: 'A business begins the year with $8,000 drawn on a $25,000 line of credit and wants $10,000 of cash at the year end. Before the line moves, cash would end at $26,500. What is the line’s balance at the year end?',
    answer: 0, check: () => Math.min(25000, Math.max(0, 8000 + 10000 - 26500)), unit: '$', places: 0, tol: 0.5,
    wrong: [{ value: -8500, say: 'A line of credit cannot go below zero: the spare cash repays it in full and the rest stays as cash.' }],
    solution: 'max(0, 8,000 + 10,000 − 26,500) = 0: the line is repaid in full and cash ends at 26,500 − 8,000 = 18,500.',
  },
  {
    id: 'f07-m2-6', lesson: 'debt-schedules', type: 'num', kind: 'numerical',
    prompt: `Coastline’s term loan has ${T.rows.length} monthly payments of $${T.pay.toFixed(2)}. How much interest does Lantern pay over the whole life of the $60,000 loan?`,
    answer: Math.round(T.pay * 60 - 60000), check: () => T.pay * 60 - 60000, unit: '$', places: 0, tol: 1,
    solution: `60 × ${T.pay.toFixed(2)} − 60,000 = ${Math.round(T.pay * 60 - 60000).toLocaleString('en-US')} dollars of interest.`,
  },
  {
    id: 'f07-m2-7', lesson: 'debt-schedules', type: 'mc', kind: 'conceptual',
    prompt: 'A modeller charges interest on the average of the line of credit’s opening and closing balances, and Excel warns of a circular reference. Which fix keeps the model loop-free?',
    options: ['Charge interest on the opening balance', 'Turn on iterative calculation and ignore the warning', 'Type the year’s interest in as a number', 'Remove the line of credit from the model'],
    answer: 0,
    feedback: { 1: 'Iteration hides the loop; the model becomes slow and harder to check.', 2: 'A typed number stops updating when anything changes.', 3: 'The line is the model’s balancing item; removing it breaks the cash.' },
    solution: 'The opening balance is known before the year’s cash is worked out, so nothing loops; the small cost in accuracy is stated in the model.',
  },
  {
    id: 'f07-m2-8', lesson: 'linking-the-statements', type: 'num', kind: 'numerical',
    prompt: `Lantern’s retained earnings were $${O.retained.toLocaleString('en-US')} at the end of 2027. Its net income is $${Math.round(R[0].netIncome).toLocaleString('en-US')} in 2028, $${Math.round(R[1].netIncome).toLocaleString('en-US')} in 2029 and $${Math.round(R[2].netIncome).toLocaleString('en-US')} in 2030; the only dividend in those years is $${Math.round(R[2].dividends).toLocaleString('en-US')}, paid in 2030. What are retained earnings at the end of 2030?`,
    answer: Math.round(R[2].retained), check: () => O.retained + Math.round(R[0].netIncome) + Math.round(R[1].netIncome) + Math.round(R[2].netIncome) - Math.round(R[2].dividends), unit: '$', places: 0, tol: 2,
    solution: `${O.retained.toLocaleString('en-US')} − ${Math.round(-R[0].netIncome).toLocaleString('en-US')} + ${Math.round(R[1].netIncome).toLocaleString('en-US')} + ${Math.round(R[2].netIncome).toLocaleString('en-US')} − ${Math.round(R[2].dividends).toLocaleString('en-US')} = ${Math.round(R[2].retained).toLocaleString('en-US')} dollars.`,
  },
  {
    id: 'f07-m2-9', lesson: 'linking-the-statements', type: 'mc', kind: 'applied',
    prompt: 'A model’s balance check (assets − liabilities − equity) is +4,000 in its first forecast year and in every year after, never changing. That year a $4,000 deposit paid to a landlord was added to the balance sheet as an asset. What is the most likely cause?',
    options: ['The deposit’s payment is missing from the cash flow statement', 'Depreciation was added back twice in operating cash flow', 'The opening retained earnings were typed in wrong', 'Dividends were not deducted from retained earnings'],
    answer: 0,
    feedback: { 1: 'That would make the check positive and growing every year.', 2: 'An opening error would appear in the opening column too.', 3: 'That would grow with each dividend, not appear once.' },
    solution: 'The deposit was added to assets, but the cash paid for it never left: there is no outflow in the cash flow statement, so cash is $4,000 too high and assets exceed liabilities and equity by $4,000. The difference appears in the year of the deposit and carries forward unchanged, the signature of a one-time item missing from one statement. Add the outflow and the check returns to zero.',
  },
  {
    id: 'f07-m2-10', lesson: 'linking-the-statements', type: 'num', kind: 'numerical',
    prompt: 'A covenant requires current assets of at least 1.3 times current liabilities. Current liabilities are $50,000 and current assets $59,000. How much more cash, from a long-term source, would the business need at the year end to pass?',
    answer: 6000, check: () => 1.3 * 50000 - 59000, unit: '$', places: 0, tol: 1,
    solution: '1.3 × 50,000 = 65,000 of current assets needed; 65,000 − 59,000 = 6,000 dollars, if it adds nothing to current liabilities.',
  },
];
