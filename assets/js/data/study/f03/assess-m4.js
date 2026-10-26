// assess-m4.js — F03 module 4 test: Judging financial health (cash-flow-and-earnings-quality, distress-scores,
// benchmarking-and-annual-reports). New questions, not copies of lesson exercises: other fictional businesses and other
// angles (cash flow from a subscription business, the EBIT needed to leave a zone, actions that move Z″, a six-firm
// median, sorting a memo’s statements). No hints; solutions show in review. Every business here is fictional.
import * as R from '../../../core/ratios.js?v=19';

// Pellham Couriers ($ thousands)
const PC = { ni: 1200, da: 500, wc: 900, capex: 600 };
// Saltmarsh Travel: the four Z″ ratios on the analyst’s worksheet
const ST_X = [-0.0375, 0.094, 0.044, 0.28];
// Quayside Furnishings ($ thousands): Z″ 0.80 on total assets of 2,000
const QF = { score: 0.80, ta: 2000 };
const qfEbit = (R.ALTMAN.zdouble.zones[0] - QF.score) / R.ALTMAN.zdouble.w[2] * QF.ta;
const median = (xs) => { const s = [...xs].sort((a, b) => a - b), m = s.length / 2; return s.length % 2 ? s[Math.floor(m)] : (s[m - 1] + s[m]) / 2; };
const DPO = [41, 55, 38, 62, 47, 50];

export const items = [
  // ---------------------------------------------------------------- cash-flow-and-earnings-quality
  {
    id: 'f03-m4-1', lesson: 'cash-flow-and-earnings-quality', type: 'num', kind: 'numerical',
    prompt: 'Pellham Couriers, a fictional parcel firm, reports net income of $1,200 thousand and depreciation of $500 thousand. Growth in receivables and fuel stock absorbed $900 thousand of working capital, and it bought vans for $600 thousand. What was its free cash flow, in thousands of dollars?',
    answer: 200, check: () => PC.ni + PC.da - PC.wc - PC.capex, tol: 0.5, unit: '$ thousand', places: 0,
    wrong: [
      { value: 800, say: 'That is cash from operations. Free cash flow subtracts the $600 thousand of vans.' },
      { value: 1100, say: 'You left out the working capital absorbed: cash from operations is 1,200 + 500 − 900 = 800.' },
      { value: 1700, say: 'Working capital absorbed and capital expenditure both reduce cash; subtract them.' },
    ],
    solution: 'Cash from operations = 1,200 + 500 − 900 = 800. Free cash flow = 800 − 600 = $200 thousand.',
  },
  {
    id: 'f03-m4-2', lesson: 'cash-flow-and-earnings-quality', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional appliance retailer lowers its estimate of the cost of future warranty repairs, reducing its warranty provision. In the year of the change, what happens?',
    options: [
      'Net income rises; cash from operations is unchanged',
      'Net income and cash from operations both rise by the same amount',
      'Cash from operations rises because less cash is set aside for repairs, while net income is unchanged',
      'Neither changes, because estimates are disclosed in the notes rather than recorded in the statements',
    ],
    answer: 0,
    feedback: {
      1: 'A provision is an estimate; changing it moves the expense, not the cash paid for repairs this year.',
      2: 'A provision is not cash set aside; it is a liability recorded by an accrual.',
      3: 'Changes in estimates are recorded in the period of change and affect net income.',
    },
    solution: 'Lower warranty expense raises net income; repairs are paid when they happen, so operating cash doesn’t change. The gap between profit and cash widens: positive accruals.',
  },
  {
    id: 'f03-m4-3', lesson: 'cash-flow-and-earnings-quality', type: 'mc', kind: 'applied',
    prompt: 'A fictional language-learning app sells annual subscriptions paid in advance. Its sales grew 40% this year; net income was $2.1 million and cash from operations $5.8 million, mostly because unearned revenue rose. An investor says the cash flow proves its earnings are of very high quality. What is the best response?',
    options: [
      'Partly right: the cash is real, but it is mostly prepayment for service still owed, and it shrinks when growth stops',
      'Wrong: cash from operations above net income is always a sign that the accounting is aggressive and revenue has been pulled forward',
      'Right: whenever cash from operations exceeds net income the earnings need no further analysis',
      'Wrong: unearned revenue should be added to net income, which would make the two figures equal',
    ],
    answer: 0,
    feedback: {
      1: 'Operating cash above profit is usually reassuring; here it reflects customers paying ahead.',
      2: 'High cash conversion still needs explaining: here growth in prepayments, which reverses if growth stops.',
      3: 'Unearned revenue is a liability until the service is delivered; it is not revenue.',
    },
    solution: 'The cash is genuine and the earnings are not inflated, but the gap comes from growth in prepayments, a liability. The ratio would fall if sales stopped growing, so judge it with the growth rate.',
  },
  // ---------------------------------------------------------------- distress-scores
  {
    id: 'f03-m4-4', lesson: 'distress-scores', type: 'num', kind: 'numerical',
    prompt: 'A credit analyst’s worksheet for Saltmarsh Travel, a fictional private travel agency, already shows its four Z″ ratios: X₁ = −0.0375, X₂ = 0.094, X₃ = 0.044 and X₄ = 0.28. Her bank reports scores on Altman’s emerging-market scale, which adds a constant of 3.25 to Z″. What score should she report? Enter two decimal places.',
    answer: 3.90, check: () => ST_X.reduce((s, x, i) => s + x * R.ALTMAN.zdouble.w[i], 0) + 3.25, tol: 0.01, unit: '', places: 2,
    wrong: [
      { value: 0.65, say: 'That is the plain Z″. The emerging-market scale adds 3.25.' },
      { value: 4.15, say: 'You left out the first term: 6.56 × X₁ = −0.25 must be included.' },
    ],
    solution: '6.56 × (−0.0375) + 3.26 × 0.094 + 6.72 × 0.044 + 1.05 × 0.28 = −0.25 + 0.31 + 0.30 + 0.29 = 0.65; plus 3.25 gives 3.90. On that scale the zones are 4.35 and 5.85, so Saltmarsh is in the distress zone (as its plain 0.65 is below 1.10).',
  },
  {
    id: 'f03-m4-5', lesson: 'distress-scores', type: 'mc', kind: 'conceptual',
    prompt: 'Why does Altman’s Z″ leave out sales ÷ total assets, which the original Z includes?',
    options: [
      'Asset turnover differs so much between industries that it would distort the score',
      'Sales are already counted in EBIT ÷ total assets, so the ratio would count them twice',
      'Non-manufacturers do not report sales on their income statements',
      'The ratio cannot be calculated from book values',
    ],
    answer: 0,
    feedback: {
      1: 'EBIT is a profit, not sales; the two ratios measure different things.',
      2: 'Service and retail firms report revenue like any other business.',
      3: 'Sales and total assets are both book figures; the issue is the industry effect.',
    },
    solution: 'Altman dropped X₅ to reduce the industry effect: a retailer’s or café’s high turnover would otherwise lift its score regardless of risk.',
  },
  {
    id: 'f03-m4-6', lesson: 'distress-scores', type: 'num', kind: 'applied',
    prompt: 'Quayside Furnishings, a fictional private furniture retailer, has a Z″ of 0.80 on total assets of $2,000 thousand. Holding everything else constant, by how much would its EBIT have to rise for Z″ to reach the bottom of the grey zone (1.10)? Enter thousands of dollars to the nearest thousand.',
    answer: 89, check: () => qfEbit, tol: 0.5, unit: '$ thousand', places: 0,
    wrong: [
      { value: 600, say: 'You multiplied the gap in points by total assets without dividing by the weight on EBIT ÷ total assets (6.72).' },
      { value: 182, say: 'That uses the original Z’s weight on EBIT ÷ total assets (3.3). Z″’s weight is 6.72.' },
    ],
    solution: 'The score must rise by 1.10 − 0.80 = 0.30 points. Each dollar of EBIT adds 6.72 ÷ 2,000 points, so EBIT must rise by 0.30 ÷ 6.72 × 2,000 = $89 thousand (ignoring the effect of extra profit on retained earnings and assets).',
  },
  {
    id: 'f03-m4-7', lesson: 'distress-scores', type: 'multi', kind: 'conceptual',
    prompt: 'Select all that apply: which of these, each taken alone, would raise Z″ for a typical profitable private firm?',
    options: [
      'Issuing new shares for cash',
      'Refinancing a bank loan due in six months with a five-year loan',
      'Paying a dividend out of cash',
      'Buying equipment for cash',
      'Signing a new operating lease for a larger shop',
    ],
    answer: [0, 1],
    feedback: {
      2: 'Cash and equity both fall: working capital and equity ÷ liabilities drop.',
      3: 'Cash (a current asset) becomes equipment: working capital falls.',
      4: 'A right-of-use asset and lease liability are recorded: assets grow and equity ÷ liabilities falls.',
    },
    solution: 'New equity raises working capital and equity ÷ liabilities; moving debt from current to noncurrent raises working capital. A dividend, buying equipment with cash and a new lease all lower the score.',
  },
  // ---------------------------------------------------------------- benchmarking-and-annual-reports
  {
    id: 'f03-m4-8', lesson: 'benchmarking-and-annual-reports', type: 'num', kind: 'numerical',
    prompt: 'Six fictional bookshop chains take 41, 55, 38, 62, 47 and 50 days to pay their suppliers. What is the median? Enter one decimal place.',
    answer: 48.5, check: () => median(DPO), tol: 0.05, unit: 'days', places: 1,
    wrong: [
      { value: 48.8, say: 'That is the average. The median is the middle of the sorted list: with six values, the average of the third and fourth.' },
      { value: 62, say: 'Sort the values before taking the middle.' },
    ],
    solution: 'Sorted: 38, 41, 47, 50, 55, 62. With six values the median is the average of the third and fourth: (47 + 50) ÷ 2 = 48.5 days.',
  },
  {
    id: 'f03-m4-9', lesson: 'benchmarking-and-annual-reports', type: 'mc', kind: 'conceptual',
    prompt: 'An analyst wants to know how much of a company’s borrowing must be repaid in each of the next five years and whether any loan has covenants. Where should she look first?',
    options: [
      'The debt note to the financial statements',
      'Item 1A, Risk Factors',
      'The auditor’s report',
      'The balance sheet, whose current and noncurrent debt lines show the years in which each loan falls due',
    ],
    answer: 0,
    feedback: {
      1: 'Risk factors may mention debt in general terms, but the maturities and covenants are in the note.',
      2: 'The auditor gives an opinion on the statements; it doesn’t list maturities.',
      3: 'The balance sheet splits debt only into within one year and after; the note gives each year.',
    },
    solution: 'The debt note lists each borrowing, its rate, its security, its covenants and its maturities by year.',
  },
  {
    id: 'f03-m4-10', lesson: 'benchmarking-and-annual-reports', type: 'classify', kind: 'applied',
    prompt: 'Sort each sentence from a fictional analyst’s memo on a furniture maker into the section where it belongs.',
    items: [
      'We recommend extending the $200,000 facility for one year at the current limit.',
      'The current ratio fell from 1.6 to 1.1, against a peer median of 1.4.',
      'If the main customer, 30% of sales, moved to another supplier, interest coverage would fall below 2.',
      'The borrower will provide quarterly management accounts and keep the current ratio above 1.0.',
      'Cash from operations has been below net income for three years, as receivables days rose from 48 to 71.',
    ],
    categories: ['Conclusion', 'Evidence', 'Risk', 'Conditions'],
    answer: [0, 1, 2, 3, 1],
    feedback: {
      2: 'It describes what could make the conclusion wrong: a risk.',
      4: 'A benchmarked trend supports the conclusion: evidence.',
    },
    solution: 'The recommendation opens the memo; benchmarked ratios and trends are evidence; what could go wrong is risk; reporting and covenants are conditions.',
  },
  {
    id: 'f03-m4-11', lesson: 'benchmarking-and-annual-reports', type: 'mc', kind: 'applied',
    prompt: 'A fictional regional bookshop chain with eight shops, all owned and run by the company and reporting under US GAAP, wants a peer group. Which is the most suitable?',
    options: [
      'Other regional chains of five to fifteen owned bookshops reporting under US GAAP',
      'The largest listed online retailers, because books are among the products they sell',
      'Bookshop chains that mainly franchise their shops to independent owners',
      'A European chain of similar size that reports under IFRS, with no adjustment',
    ],
    answer: 0,
    feedback: {
      1: 'Online retailers differ in scale and model (no shops, different working capital).',
      2: 'Franchisors earn fees with little capital; their ratios differ from those of owner-operators.',
      3: 'Different leasing and cash-flow rules under IFRS mean adjusting before comparing.',
    },
    solution: 'Same model (owned shops), similar size and the same accounting basis make the best peers.',
  },
];
