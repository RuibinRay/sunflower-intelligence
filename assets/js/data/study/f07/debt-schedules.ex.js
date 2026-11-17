// debt-schedules.ex.js — F07 · Debt schedules: widgets, practice and the knowledge check (answer keys live here).
// Figures from case.js (TERM_LOAN, MODEL, OPENING, FINANCE); every num item's `check` recomputes its answer.
import { TERM_LOAN as T, MODEL as M, OPENING as O, FINANCE as FIN } from './case.js?v=37';

const R = M.rows, L = M.loans;
const pmt = (P, r, n) => P * r / (1 - (1 + r) ** -n);
const firstYear = (P, apr, years, firstMonth) => {
  const r = apr / 12, n = years * 12, pay = pmt(P, r, n), k = Math.min(n, 13 - firstMonth);
  let b = P, i = 0, p = 0;
  for (let j = 0; j < k; j++) { const int = b * r; i += int; p += pay - int; b -= pay - int; }
  return { pay, k, interest: i, principal: p, end: b };
};
const f2 = (x) => x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const widgets = {
  'ds-loan': {
    type: 'formula', title: 'An amortising term loan in its first calendar year',
    intro: 'Coastline’s loan is the starting point: $60,000 at 7.5% over 5 years, first payment at the end of April (month 4).',
    inputs: [
      { id: 'P', label: 'Amount borrowed', min: 10000, max: 200000, step: 5000, value: 60000, fmt: 'money' },
      { id: 'apr', label: 'Interest rate a year', min: 2, max: 15, step: 0.25, value: 7.5, fmt: 'pct' },
      { id: 'years', label: 'Term', min: 1, max: 10, step: 1, value: 5, fmt: 'int', unit: 'years' },
      { id: 'm', label: 'Month of the first payment', min: 1, max: 12, step: 1, value: 4, fmt: 'int' },
    ],
    compute: (v) => {
      const y = firstYear(v.P, v.apr / 100, v.years, v.m);
      return {
        headline: { label: 'Monthly payment', value: `$${f2(y.pay)}` },
        rows: [['Payments in the first calendar year', String(y.k)], ['Interest in that year', `$${f2(y.interest)}`], ['Principal repaid in that year', `$${f2(y.principal)}`], ['Balance at the year end', `$${f2(y.end)}`]],
        note: `In its first year the loan costs $${f2(y.interest)} of interest and repays $${f2(y.principal)}. ${y.interest > y.principal ? 'Interest is more than half of what is paid: a long or expensive loan is front-loaded.' : 'Interest is ' + Math.round(y.interest / (y.interest + y.principal) * 100) + '% of what is paid.'}`,
      };
    },
  },
};

export const guided = [
  {
    id: 'f07-ds-g1', type: 'num', kind: 'numerical',
    prompt: 'Coastline lends $60,000 at 7.5% a year over five years, repaid in 60 equal monthly payments. What is the monthly payment?',
    answer: 1202.28, check: () => pmt(60000, 0.075 / 12, 60), unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: 60000 / 60, say: 'That repays the principal but no interest. Use the annuity formula: P r ÷ (1 − (1 + r)⁻ⁿ).' }, { value: pmt(60000, 0.075, 5) / 12, say: 'That spreads an annual payment over 12 months; with monthly payments, use the monthly rate (0.625%) and 60 periods.' }],
    hints: ['Monthly rate r = 7.5% ÷ 12 = 0.00625; n = 60.', '60,000 × 0.00625 ÷ (1 − 1.00625⁻⁶⁰).'],
    solution: '60,000 × 0.00625 ÷ (1 − 1.00625⁻⁶⁰) = 1,202.28 dollars. In Excel, =PMT(7.5%/12,60,-60000).',
  },
  {
    id: 'f07-ds-g2', type: 'steps', kind: 'numerical',
    prompt: 'The van note: $15,000 owed on 1 January 2028 at 6%, with $5,000 of principal repaid on 1 June 2028 together with the interest for the previous twelve months.',
    steps: [
      { id: 'f07-ds-g2a', type: 'num', kind: 'numerical', prompt: 'Interest expense for January–May 2028 ($).', answer: 375, check: () => 15000 * 0.06 * 5 / 12, unit: '$', places: 0, tol: 1, hints: ['Five months on $15,000 at 6% a year.'] },
      { id: 'f07-ds-g2b', type: 'num', kind: 'numerical', prompt: 'Interest expense for June–December 2028 ($).', answer: 350, check: () => 10000 * 0.06 * 7 / 12, unit: '$', places: 0, tol: 1, hints: ['After the repayment the balance is $10,000, for seven months.'] },
      { id: 'f07-ds-g2c', type: 'num', kind: 'numerical', prompt: 'Interest owed (payable) at 31 December 2028 ($).', answer: 350, check: () => 10000 * 0.06 * 7 / 12, unit: '$', places: 0, tol: 1, hints: ['Interest since 1 June is paid next June.'] },
    ],
    solution: 'January–May: 15,000 × 6% × 5/12 = 375; June–December: 10,000 × 6% × 7/12 = 350; expense 725. The 350 since June is still owed at the year end.',
  },
  {
    id: 'f07-ds-g3', type: 'num', kind: 'numerical',
    prompt: 'A business starts the year with $12,000 drawn on a $30,000 line of credit and wants at least $15,000 of cash at the year end. Before the line moves, its cash at the year end would be $4,000. What will the line’s balance be at the year end?',
    answer: 23000, check: () => Math.min(30000, Math.max(0, 12000 + 15000 - 4000)), unit: '$', places: 0, tol: 1,
    wrong: [{ value: 11000, say: 'That is the extra drawing; the balance is the opening 12,000 plus the 11,000 drawn.' }, { value: 27000, say: 'Cash before the line is 4,000, not zero: it needs 11,000 more, not 15,000.' }],
    hints: ['Line = opening + minimum cash − cash before the line, between 0 and the limit.'],
    solution: 'min(30,000, max(0, 12,000 + 15,000 − 4,000)) = 23,000 dollars: it draws 11,000, ending with exactly 15,000 of cash.',
  },
  {
    id: 'f07-ds-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Why does Lantern’s model charge the line of credit’s interest on its opening balance rather than its average balance?',
    options: ['To avoid a circular reference in the model', 'Because banks always charge interest only on the balance at the start of the year', 'The opening balance is larger', 'Because the average of two balances cannot be calculated in a spreadsheet'],
    answer: 0,
    feedback: { 1: 'Banks charge on the daily balance; the opening-balance convention is a modelling choice.', 2: 'Not always: if the line grows, the closing balance is larger.', 3: 'It can be; the problem is that the closing balance itself depends on interest.' },
    hints: ['What does the closing balance of the line depend on?'],
    solution: 'The closing balance depends on the cash need, which depends on profit, which depends on interest. Charging on the opening balance breaks the loop at a small cost in accuracy.',
  },
];

export const independent = [
  {
    id: 'f07-ds-i1', type: 'num', kind: 'numerical',
    prompt: 'What is the interest in the term loan’s first monthly payment ($60,000 at 7.5% a year)?',
    answer: 375, check: () => 60000 * 0.075 / 12, unit: '$', places: 2, tol: 0.01,
    solution: '60,000 × 0.075 ÷ 12 = 375 dollars; the other 827.28 of the payment is principal.',
  },
  {
    id: 'f07-ds-i2', type: 'num', kind: 'numerical',
    prompt: 'At the end of 2028 Lantern’s loans will repay $5,000 (van), $4,159 (brewer) and $10,868 (term loan) of principal in 2029. What is the current portion of long-term debt at 31 December 2028?',
    answer: Math.round(R[0].currentDebt), check: () => L.van[1].principal + L.brewer[1].principal + L.term[1].principal, unit: '$', places: 0, tol: 1,
    solution: '5,000 + 4,159 + 10,868 = 20,027 dollars, a current liability.',
  },
  {
    id: 'f07-ds-i3', type: 'num', kind: 'numerical',
    prompt: 'A business has EBITDA of $90,000, interest of $6,000 and scheduled principal repayments of $24,000 in a year. What is its debt service coverage ratio (EBITDA ÷ debt service)?',
    answer: 3, check: () => 90000 / (6000 + 24000), unit: '×', places: 2, tol: 0.01,
    wrong: [{ value: 15, say: 'That divides by interest only. Debt service includes the scheduled principal.' }],
    solution: '90,000 ÷ (6,000 + 24,000) = 3.0 times.',
  },
  {
    id: 'f07-ds-i4', type: 'classify', kind: 'conceptual',
    prompt: 'Where in the model does each part of a term loan payment go?',
    items: ['The interest part of each payment', 'The principal part of each payment', 'Principal due in the next twelve months', 'The amount first borrowed'],
    categories: ['Income statement (interest expense)', 'Financing cash flow and lower debt', 'Current liability on the balance sheet', 'Financing cash inflow'],
    answer: [0, 1, 2, 3],
    solution: 'Interest is an expense; principal repayments are financing outflows that reduce debt; next year’s principal is the current portion; the drawing is a financing inflow.',
  },
  {
    id: 'f07-ds-i5', type: 'mc', kind: 'applied',
    prompt: 'A model’s revolver formula asks for $42,000 when the line of credit’s limit is $30,000. What should the model do?',
    options: ['Cap the line at $30,000 and show the $12,000 shortfall as a funding gap', 'Draw $42,000 anyway, since the bank will probably agree to lend it', 'Lower the minimum cash balance until the formula fits within the limit', 'Ignore it, because a revolver always balances the model whatever happens'],
    answer: 0,
    feedback: { 1: 'Assuming the bank will lend more than agreed hides the very problem the model is for.', 2: 'Quietly changing an assumption to make a problem disappear is worse than showing it.', 3: 'It balances only within its limit; beyond that, the gap is real.' },
    solution: 'Show the gap. It tells Ana and the bank that the plan needs more financing, or less spending, before it happens.',
  },
];

export const check = [
  {
    id: 'f07-ds-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why give each loan its own rows in a debt schedule instead of one line for total debt?',
    options: ['Each loan’s rate, timetable and maturity differ', 'Because accounting standards forbid adding loans together on the balance sheet', 'So the model looks more detailed to the bank than it really is', 'Because spreadsheets cannot add different loans together in one row'],
    answer: 0,
    feedback: { 1: 'Balance sheets often show total debt; the notes give the detail, and a model needs it.', 2: 'Detail is for accuracy, not appearance.', 3: 'They can; the problem is the different terms.' },
    solution: 'Each loan’s own terms determine its interest, its repayments and how much is due within a year.',
  },
  {
    id: 'f07-ds-k2', type: 'num', kind: 'numerical',
    prompt: 'A $100,000 loan at 6% a year is repaid in 36 equal monthly payments. What is the payment?',
    answer: 3042.19, check: () => pmt(100000, 0.005, 36), unit: '$', places: 2, tol: 0.01,
    solution: '100,000 × 0.005 ÷ (1 − 1.005⁻³⁶) = 3,042.19 dollars.',
  },
  {
    id: 'f07-ds-k3', type: 'num', kind: 'numerical',
    prompt: 'A line of credit had $18,000 drawn at the start of the year and is charged 9% a year on its opening balance. What interest does the model charge for the year?',
    answer: 1620, check: () => 18000 * 0.09, unit: '$', places: 0, tol: 1,
    solution: '18,000 × 9% = 1,620 dollars.',
  },
  {
    id: 'f07-ds-k4', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s DSCR is 0.56 in 2028 and 3.45 in 2029. What is the best reading for Coastline?',
    options: ['New financing covers 2028’s repayments; from 2029 cover is ample', 'Lantern cannot repay its debt and the new loan should be refused', 'The 2029 figure must be an error, because coverage cannot rise that fast', 'DSCR below 1 means the model is out of balance in 2028'],
    answer: 0,
    feedback: { 1: 'A weak launch year funded by new money is normal; the later years matter more.', 2: 'EBITDA nearly quadruples while debt service falls, so coverage jumps.', 3: 'DSCR is unrelated to whether the balance sheet balances.' },
    solution: 'The 2028 shortfall is financed by the loan and Hollis’s equity; from 2029 EBITDA covers debt service more than three times.',
  },
  {
    id: 'f07-ds-k5', type: 'num', kind: 'numerical',
    prompt: 'A loan is drawn on 1 October. Its interest is $6,000 a year. Interest is paid at each month end. How much interest expense falls in its first calendar year?',
    answer: 1500, check: () => 6000 * 3 / 12, unit: '$', places: 0, tol: 1,
    solution: 'October to December: 3 months × 6,000 ÷ 12 = 1,500 dollars.',
  },
  {
    id: 'f07-ds-k6', type: 'mc', kind: 'conceptual',
    prompt: 'Hollis Avery pays $75,000 for new shares in Lantern. Where does it appear in the model?',
    options: ['Common stock and a financing inflow', 'The debt schedule, as a loan with interest at Hollis’s required return', 'As 2028 revenue', 'Nowhere, because issuing shares does not change the balance sheet'],
    answer: 0,
    feedback: { 1: 'Equity carries no interest or repayment schedule; Hollis is paid through ownership.', 2: 'Selling shares is financing, not revenue.', 3: 'It raises cash and equity by $75,000.' },
    solution: 'New equity raises cash and common stock; it is financing, but not debt.',
  },
];
