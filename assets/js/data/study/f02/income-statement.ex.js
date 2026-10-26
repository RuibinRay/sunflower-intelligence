// income-statement.ex.js — F02 · The multi-step income statement: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// Lantern's figures come from case.js; its 2027 events are hypothetical (“Suppose…”); other businesses are fictional.
import { FACTS, DERIVED as D } from './case.js?v=17';

const money = (x) => `${x < -0.004 ? '−' : ''}$${Math.abs(Math.round(x)).toLocaleString('en-US')}`;
const delta = (x) => (Math.abs(x) < 0.5 ? 'unchanged' : `${x > 0 ? 'up' : 'down'} ${money(Math.abs(x))}`);
const base = { revenue: D.revenue, cos: D.costOfSales, dep: D.depreciation, other: D.operatingExpenses - D.depreciation, interest: D.interestExpense, rate: FACTS.tax.rate * 100 };
const run = (v) => {
  const gp = v.revenue - v.cos, oi = gp - v.dep - v.other, ebitda = oi + v.dep, ibt = oi - v.interest;
  const tax = ibt > 0 ? ibt * v.rate / 100 : 0;
  return { gp, oi, ebitda, ibt, tax, ni: ibt - tax };
};

export const widgets = {
  'is-drivers': {
    type: 'formula',
    title: 'What moves each subtotal',
    intro: 'Defaults are Lantern’s 2026 figures. Income tax is charged only on a positive income before tax.',
    inputs: [
      { id: 'revenue', label: 'Net revenue', min: 120000, max: 260000, step: 10, value: base.revenue, fmt: 'money' },
      { id: 'cos', label: 'Cost of sales', min: 40000, max: 150000, step: 100, value: base.cos, fmt: 'money' },
      { id: 'dep', label: 'Depreciation', min: 0, max: 15000, step: 100, value: base.dep, fmt: 'money' },
      { id: 'other', label: 'Other operating expenses', min: 30000, max: 100000, step: 1, value: base.other, fmt: 'money' },
      { id: 'interest', label: 'Interest expense', min: 0, max: 6000, step: 50, value: base.interest, fmt: 'money' },
      { id: 'rate', label: 'Income tax rate', min: 0, max: 40, step: 1, value: base.rate, fmt: 'pct' },
    ],
    compute: (v) => {
      const r = run(v), b = run(base);
      return {
        headline: { label: 'Net income', value: money(r.ni) },
        rows: [
          ['Gross profit', `${money(r.gp)} (${(r.gp / v.revenue * 100).toFixed(1)}% of revenue)`],
          ['EBITDA', money(r.ebitda)],
          ['Operating income (= EBIT here)', money(r.oi)],
          ['Income before income tax', money(r.ibt)],
          ['Income tax expense', money(r.tax)],
        ],
        note: `Compared with Lantern’s actual year: gross profit ${delta(r.gp - b.gp)}, EBITDA ${delta(r.ebitda - b.ebitda)}, operating income and EBIT ${delta(r.oi - b.oi)}, net income ${delta(r.ni - b.ni)}.${r.ibt < 0 ? ' Income before tax is negative, so this simple model charges no tax.' : ''}`,
        chart: { kind: 'bar', x: { label: 'Subtotal', values: ['Net revenue', 'Gross profit', 'EBITDA', 'Operating income', 'Income before tax', 'Net income'] },
          series: [{ name: 'Dollars', values: [v.revenue, r.gp, r.ebitda, r.oi, r.ibt, r.ni].map((x) => Math.round(x)) }], y: { label: 'Dollars' } },
      };
    },
  },
};

const SECTIONS = ['Revenue section', 'Cost of sales', 'Operating expenses and gains', 'Other income and expenses', 'Income tax', 'Not on the income statement'];

// ---------------------------------------------------------------- guided practice
export const guided = [
  {
    id: 'f02-is-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Where does each Lantern account appear on its multi-step income statement?',
    items: ['Sales Returns and Allowances', 'Cost of Services', 'Shipping Expense', 'Depreciation Expense', 'Interest Expense', 'Gain on Sale of Equipment', 'Income Tax Expense', 'Dividends', 'Cost of Goods Sold'],
    categories: SECTIONS,
    answer: [0, 1, 2, 2, 3, 2, 4, 5, 1],
    hints: ['Contra-revenue accounts are deducted inside the revenue section; direct costs of what was sold are cost of sales.', 'Interest is a cost of financing the business, not of running it; dividends are not an expense at all.'],
    feedback: {
      2: 'Lantern treats shipping to customers as a selling cost, so it sits among operating expenses (some companies put it in cost of sales).',
      3: 'Lantern shows depreciation among operating expenses; EBITDA adds it back later.',
      5: 'Under US GAAP a gain on selling equipment is included in operating income (ASC 360-10-45-5): Lantern adds it after its operating expenses.',
      7: 'Dividends are distributions to owners, shown in the statement of changes in equity.',
    },
    solution: 'Revenue section: Sales Returns and Allowances (deducted). Cost of sales: Cost of Goods Sold, Cost of Services. Operating expenses and gains: Shipping, Depreciation, Gain on Sale of Equipment. Other income and expenses: Interest Expense. Income tax: Income Tax Expense. Not on the income statement: Dividends.',
  },
  {
    id: 'f02-is-g2', type: 'steps', kind: 'numerical',
    prompt: 'Fellside Outdoor Gear, a fictional retailer, reports for the year: Sales $860,000; Sales Returns and Allowances $14,000; Sales Discounts $6,000; Cost of Goods Sold $472,000; selling expenses $128,000; general and administrative expenses $96,000; Interest Expense $9,000; Gain on Sale of Equipment $3,000. Under US GAAP the gain is included in operating income. Its income tax rate is 25%.',
    solution: 'Net sales = 860,000 − 14,000 − 6,000 = 840,000. Gross profit = 840,000 − 472,000 = 368,000. Operating income = 368,000 − 128,000 − 96,000 + 3,000 = 147,000. Income before tax = 147,000 − 9,000 = 138,000; tax 34,500; net income 103,500.',
    steps: [
      { id: 'f02-is-g2-s1', type: 'num', prompt: 'What are net sales?',
        answer: 840000, check: () => 860000 - 14000 - 6000, unit: '$', places: 0, tol: 0.5,
        hints: ['Both contra-revenue accounts are deducted from sales.'],
        wrong: [{ value: 846000, say: 'Sales discounts are deducted too: 860,000 − 14,000 − 6,000.' }],
        solution: '860,000 − 14,000 − 6,000 = $840,000.' },
      { id: 'f02-is-g2-s2', type: 'num', prompt: 'What is gross profit?',
        answer: 368000, check: () => 840000 - 472000, unit: '$', places: 0, tol: 0.5,
        hints: ['Gross profit = net sales − cost of goods sold.'],
        wrong: [{ value: 388000, say: 'Start from net sales, not gross sales.' }],
        solution: '840,000 − 472,000 = $368,000.' },
      { id: 'f02-is-g2-s3', type: 'num', prompt: 'What is operating income?',
        answer: 147000, check: () => 368000 - 128000 - 96000 + 3000, unit: '$', places: 0, tol: 0.5,
        hints: ['Deduct the selling and the general and administrative expenses, then add the gain on disposal.', 'Interest comes after operating income.'],
        wrong: [
          { value: 144000, say: 'That leaves out the $3,000 gain, which US GAAP includes in operating income (ASC 360-10-45-5).' },
          { value: 138000, say: 'That is income before tax: interest is deducted after operating income.' },
        ],
        solution: '368,000 − 128,000 − 96,000 + 3,000 = $147,000.' },
      { id: 'f02-is-g2-s4', type: 'num', prompt: 'What is net income?',
        answer: 103500, check: () => (147000 - 9000) * (1 - 0.25), unit: '$', places: 0, tol: 0.5,
        hints: ['Income before tax = operating income − interest.', 'Net income = income before tax × (1 − 0.25).'],
        wrong: [
          { value: 138000, say: 'That is income before income tax. Deduct tax at 25%.' },
          { value: 99000, say: 'The gain increases income; it is already inside operating income, so don’t subtract it.' },
        ],
        solution: 'Income before tax = 147,000 − 9,000 = 138,000; tax = 0.25 × 138,000 = 34,500; net income = $103,500.' },
    ],
  },
  {
    id: 'f02-is-g3', type: 'steps', kind: 'applied',
    prompt: 'Copperfield Print Works, a fictional printer, reports net income of $54,000 after interest expense of $6,000 and income tax expense of $18,000. Its operating expenses include depreciation of $15,000 and amortisation of $3,000. It has no other non-operating items.',
    solution: 'EBIT = 54,000 + 6,000 + 18,000 = 78,000. EBITDA = 78,000 + 15,000 + 3,000 = 96,000. A figure that also adds back restructuring costs must not be called EBITDA; call it, for example, Adjusted EBITDA and reconcile it to net income.',
    steps: [
      { id: 'f02-is-g3-s1', type: 'num', prompt: 'What is EBIT?',
        answer: 78000, check: () => 54000 + 6000 + 18000, unit: '$', places: 0, tol: 0.5,
        hints: ['Start from net income and add back what EBIT excludes.', 'Add interest and income tax.'],
        wrong: [{ value: 60000, say: 'EBIT is before taxes as well as interest: add back the $18,000 of income tax.' }],
        solution: '54,000 + 6,000 + 18,000 = $78,000.' },
      { id: 'f02-is-g3-s2', type: 'num', prompt: 'What is EBITDA?',
        answer: 96000, check: () => 78000 + 15000 + 3000, unit: '$', places: 0, tol: 0.5,
        hints: ['EBITDA = EBIT + depreciation + amortisation.'],
        wrong: [{ value: 93000, say: 'Add back amortisation as well as depreciation: the A in EBITDA.' }],
        solution: '78,000 + 15,000 + 3,000 = $96,000.' },
      { id: 'f02-is-g3-s3', type: 'mc', prompt: 'Copperfield’s managers also want to add back $4,000 of restructuring costs and present $100,000 in a press release. Under the SEC staff’s guidance, how should a registrant present that figure?',
        options: ['As “Adjusted EBITDA”, reconciled to net income', 'As “EBITDA”, since restructuring is one-off', 'As “Operating income”, in the income statement', 'It may not be presented at all'],
        answer: 0,
        hints: ['The SEC staff define EBITDA as net income plus interest, taxes, depreciation and amortisation.', 'A differently calculated figure needs a different name and a reconciliation.'],
        feedback: { 1: 'A measure calculated differently from net income plus interest, taxes, depreciation and amortisation shouldn’t be called EBITDA.', 2: 'Operating income is a GAAP subtotal; it can’t be redefined to exclude costs.', 3: 'Non-GAAP measures are allowed if they are reconciled, not misleading and no more prominent than the GAAP measure.' },
        solution: 'Call it something distinct, such as Adjusted EBITDA, show the reconciliation from net income ($54,000) and give net income at least equal prominence.' },
    ],
  },
  {
    id: 'f02-is-g4', type: 'steps', kind: 'applied',
    prompt: 'Suppose that in December 2027 a bookkeeper records $1,850 of wages for the baristas who worked at a client’s wedding in Wages Expense instead of Cost of Services. The accountant finds the error before preparing the statements.',
    solution: 'Correcting entry: debit Cost of Services 1,850, credit Wages Expense 1,850. Cost of sales rises and operating expenses fall by $1,850, so gross profit falls by $1,850 while operating income, and everything below it, is unchanged.',
    steps: [
      { id: 'f02-is-g4-s1', type: 'journal', chart: 'f02', date: '2027-12-31',
        prompt: 'Record the correcting entry.',
        accounts: ['Cost of Services', 'Wages Expense', 'Wages Payable', 'Cash', 'Cost of Goods Sold', 'Catering Revenue', 'Supplies Expense'],
        lines: [{ acct: 'Cost of Services', dr: 1850 }, { acct: 'Wages Expense', cr: 1850 }],
        hints: ['Move the cost from one expense account to the other.', 'Debit the account that should hold it; credit the one that holds it wrongly.'],
        solution: 'Debit Cost of Services 1,850; credit Wages Expense 1,850. No cash or liability changes.' },
      { id: 'f02-is-g4-s2', type: 'num', prompt: 'By how much does the correction reduce gross profit?',
        answer: 1850, check: () => 1850, unit: '$', places: 0, tol: 0.5,
        hints: ['Cost of Services is part of cost of sales, above gross profit.'],
        wrong: [{ value: 0, say: 'The cost moves into cost of sales, so gross profit does change. It is operating income that doesn’t.' }],
        solution: 'Cost of sales rises by $1,850, so gross profit falls by $1,850.' },
      { id: 'f02-is-g4-s3', type: 'num', prompt: 'By how much does the correction change operating income?',
        answer: 0, check: () => 1850 - 1850, unit: '$', places: 0, tol: 0.5,
        hints: ['Gross profit falls; what happens to operating expenses?'],
        wrong: [{ value: 1850, say: 'Operating expenses fall by the same $1,850, so the two effects cancel at operating income.' }],
        solution: 'Gross profit −1,850 and operating expenses −1,850: operating income is unchanged.' },
    ],
  },
];

// ---------------------------------------------------------------- on your own
export const independent = [
  {
    id: 'f02-is-i1', type: 'num', kind: 'numerical',
    prompt: 'Wolds Garden Supplies, a fictional chain, reports net sales of $2,450,000 and cost of sales of $1,568,000. What is its gross margin? Give the percentage to one decimal place.',
    answer: 36.0, check: () => (2450000 - 1568000) / 2450000 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 64.0, say: 'That is cost of sales as a share of net sales. Gross margin is gross profit ÷ net sales.' }],
    solution: 'Gross profit = 2,450,000 − 1,568,000 = 882,000; gross margin = 882,000 ÷ 2,450,000 = 0.36, or 36.0%.',
  },
  {
    id: 'f02-is-i2', type: 'journal', kind: 'applied', chart: 'f02', date: '2027-12-31',
    prompt: 'Suppose Lantern’s income before income tax for 2027 is $48,000, taxed at the case’s combined rate of 25%, and it paid $9,000 of estimated tax during the year (already recorded in Income Tax Expense). Record the year-end income tax adjustment.',
    accounts: ['Income Tax Expense', 'Income Taxes Payable', 'Cash', 'Retained Earnings', 'Interest Payable', 'Accounts Payable', 'Dividends'],
    lines: [{ acct: 'Income Tax Expense', dr: 3000 }, { acct: 'Income Taxes Payable', cr: 3000 }],
    solution: 'Total tax for the year = 0.25 × 48,000 = 12,000. The $9,000 paid is already in Income Tax Expense, so accrue the remaining 3,000: debit Income Tax Expense 3,000; credit Income Taxes Payable 3,000.',
  },
  {
    id: 'f02-is-i3', type: 'num', kind: 'numerical',
    prompt: 'Fernmoor Software Inc., a fictional listed company, reports net income of $10,350,000 and declares preferred dividends of $450,000 for the year. It had 5,000,000 common shares outstanding from 1 January and issued another 1,000,000 on 1 October. What is basic earnings per share? Round to the cent.',
    answer: 1.89, check: () => (10350000 - 450000) / (5000000 + 1000000 * 3 / 12), unit: '$', places: 2, tol: 0.005,
    wrong: [
      { value: 1.97, say: 'Deduct the preferred dividends: they are not available to common shareholders.' },
      { value: 1.65, say: 'The new shares were outstanding for only three months. Weight them: 5,000,000 + 1,000,000 × 3 ÷ 12 = 5,250,000.' },
      { value: 1.98, say: 'The 1,000,000 shares issued on 1 October count for the three months they were outstanding.' },
    ],
    solution: 'Earnings for common shareholders = 10,350,000 − 450,000 = 9,900,000. Weighted average shares = 5,000,000 + 1,000,000 × 3 ÷ 12 = 5,250,000. Basic EPS = 9,900,000 ÷ 5,250,000 ≈ $1.89.',
  },
  {
    id: 'f02-is-i4', type: 'order', kind: 'conceptual',
    prompt: 'Put the lines of a multi-step income statement in order, from top to bottom.',
    items: ['Net revenue', 'Cost of sales', 'Gross profit', 'Operating expenses', 'Operating income', 'Other income and expenses', 'Income before income tax', 'Income tax expense', 'Net income'],
    solution: 'Net revenue − cost of sales = gross profit; − operating expenses = operating income; ± other income and expenses = income before income tax; − income tax expense = net income.',
  },
  {
    id: 'f02-is-i5', type: 'mc', kind: 'conceptual',
    prompt: 'A company registered with the SEC announces its results in a press release and includes EBITDA. Under Regulation G, what must accompany the EBITDA figure?',
    options: [
      'Net income and a quantitative reconciliation',
      'An auditor’s report on the EBITDA figure',
      'EBITDA for each of the last five years',
      'A statement that EBITDA equals operating cash flow',
    ],
    answer: 0,
    feedback: {
      1: 'Regulation G requires the comparable GAAP measure and a reconciliation, not a separate audit of the non-GAAP figure.',
      2: 'No particular number of years is required by Regulation G; the reconciliation must cover what is presented.',
      3: 'That would be misleading: EBITDA ignores interest and tax paid, working capital and replacement spending.',
    },
    solution: 'Rule 100(a) of Regulation G: present the most directly comparable GAAP measure (for EBITDA, net income) and a quantitative reconciliation between them. Rule 100(b) also forbids a misleading presentation.',
  },
  {
    id: 'f02-is-i6', type: 'num', kind: 'applied',
    prompt: 'A fictional manufacturer reporting under IFRS presents its expenses by function: cost of sales $600,000, distribution costs $150,000 and administrative expenses $130,000. Its note on the nature of expenses shows goods and materials $440,000, employee benefits $310,000 and depreciation and amortisation $70,000, plus other expenses. What are its other expenses by nature?',
    answer: 60000, check: () => (600000 + 150000 + 130000) - (440000 + 310000 + 70000), unit: '$', places: 0,
    wrong: [
      { value: 880000, say: 'That is total expenses. The nature analysis must add up to the same total; find the missing piece.' },
      { value: -60000, say: 'The nature items shown add up to 820,000, less than the 880,000 total, so the missing amount is positive.' },
    ],
    solution: 'Both analyses describe the same expenses: total by function = 600,000 + 150,000 + 130,000 = 880,000. By nature: 880,000 − 440,000 − 310,000 − 70,000 = $60,000 of other expenses.',
  },
];

// ---------------------------------------------------------------- knowledge check
export const check = [
  {
    id: 'f02-is-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which subtotal can a reader find on a multi-step income statement but not on a single-step one?',
    options: ['Gross profit', 'Net income', 'Total revenues', 'Total income tax'],
    answer: 0,
    feedback: {
      1: 'Both formats end at the same net income.',
      2: 'A single-step statement adds up all revenues.',
      3: 'Income tax appears among the expenses in a single-step statement too.',
    },
    solution: 'A single-step statement totals revenues and expenses and subtracts once. Gross profit, operating income and income before income tax appear only in the multi-step format.',
  },
  {
    id: 'f02-is-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional business reports net revenue of $1,280,000, cost of sales of $704,000, selling expenses of $190,000, administrative expenses of $148,000 and interest expense of $22,000. Its tax rate is 25%. What is its operating income?',
    answer: 238000, check: () => 1280000 - 704000 - 190000 - 148000, unit: '$', places: 0,
    wrong: [
      { value: 216000, say: 'Interest is deducted after operating income: that is income before income tax.' },
      { value: 576000, say: 'That is gross profit. Deduct the selling and administrative expenses too.' },
      { value: 162000, say: 'That is net income. Operating income is before interest and tax.' },
    ],
    solution: 'Gross profit = 1,280,000 − 704,000 = 576,000; operating income = 576,000 − 190,000 − 148,000 = $238,000.',
  },
  {
    id: 'f02-is-k3', type: 'num', kind: 'applied',
    prompt: `Lantern’s 2026 depreciation was ${money(D.depreciation)} and its EBITDA ${money(D.ebitda)}. Suppose the accountant had used a shorter useful life for the van, making 2026 depreciation $6,000 with nothing else changed. What would Lantern’s 2026 EBITDA have been?`,
    answer: 42516, check: () => D.ebitda, unit: '$', places: 0,
    wrong: [
      { value: 41316, say: 'Extra depreciation lowers operating income and EBIT by $1,200, but EBITDA adds depreciation back, so it is unchanged.' },
      { value: 43716, say: 'EBITDA adds back whatever depreciation was charged; it doesn’t rise when depreciation does.' },
    ],
    solution: 'EBIT falls by 6,000 − 4,800 = 1,200 to 36,516, but EBITDA = EBIT + D&A = 36,516 + 6,000 = $42,516, unchanged. Net income would fall by 1,200 × (1 − 0.25) = 900.',
  },
  {
    id: 'f02-is-k4', type: 'multi', kind: 'conceptual',
    prompt: 'On Lantern’s multi-step income statement, which of these accounts appear below operating income? Select all that apply.',
    options: ['Interest Expense', 'Income Tax Expense', 'Gain on Sale of Equipment', 'Depreciation Expense', 'Bad Debt Expense', 'Cost of Services', 'Loss on Sale of Equipment', 'Interest Revenue'],
    answer: [0, 1, 7],
    feedback: {
      2: 'Under US GAAP gains and losses on selling equipment are included in operating income (ASC 360-10-45-5).',
      3: 'Depreciation is an operating expense; it is added back only when calculating EBITDA.',
      4: 'Bad debts are a cost of selling on credit, so they are operating expenses.',
      5: 'Cost of Services is part of cost of sales, above gross profit.',
      6: 'Under US GAAP gains and losses on selling equipment are included in operating income (ASC 360-10-45-5).',
    },
    solution: 'Below operating income: Interest Expense and Interest Revenue (other income and expenses) and Income Tax Expense. Gains and losses on selling equipment are inside operating income under US GAAP (ASC 360-10-45-5); depreciation and bad debts are operating expenses; Cost of Services is cost of sales.',
  },
  {
    id: 'f02-is-k5', type: 'mc', kind: 'applied',
    prompt: 'A listed company presents EBITDA in its earnings release as a measure of its performance. According to the SEC staff’s interpretations, which GAAP measure should EBITDA be reconciled to?',
    options: ['Net income', 'Operating income', 'Net cash from operating activities', 'Gross profit'],
    answer: 0,
    feedback: {
      1: 'The staff say operating income is not the most directly comparable measure, because EBITDA adjusts for items that operating income doesn’t include, such as interest and tax.',
      2: 'Net cash from operating activities is a cash-flow measure. For EBITDA presented as a measure of performance, the staff point to net income.',
      3: 'Gross profit leaves out operating expenses that EBITDA includes, so it isn’t comparable.',
    },
    solution: 'C&DI 103.02: when EBIT or EBITDA is presented as a performance measure, it should be reconciled to net income as presented in the income statement. Operating income is not the most directly comparable measure, because EBIT and EBITDA adjust for items that operating income doesn’t include.',
  },
  {
    id: 'f02-is-k6', type: 'num', kind: 'numerical',
    prompt: 'A fictional company’s income tax expense for the year is $18,100. Its Income Taxes Payable account rose from $2,400 at the start of the year to $3,100 at the end. How much income tax did it pay during the year?',
    answer: 17400, check: () => 2400 + 18100 - 3100, unit: '$', places: 0,
    wrong: [
      { value: 18100, say: 'That is the expense. Part of it is still owed at the year end, and part of the opening balance was paid.' },
      { value: 18800, say: 'The payable rose by $700, so the company paid $700 less than the expense, not $700 more.' },
    ],
    solution: 'Tax paid = opening payable + expense − closing payable = 2,400 + 18,100 − 3,100 = $17,400. The payable rose by 700 because the company paid 700 less than it was charged.',
  },
];
