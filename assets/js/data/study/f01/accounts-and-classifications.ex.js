// accounts-and-classifications.ex.js — F01 · Accounts, terminology and classifications: widget, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).

export const widgets = {
  'eq-accounts': {
    type: 'equation',
    mode: 'watch',
    transactions: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9'],
  },
};

const ELEMENTS = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];
const GROUPS = ['Current asset', 'Noncurrent asset', 'Current liability', 'Noncurrent liability'];

export const guided = [
  {
    id: 'f01-acc-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each of these accounts from Lantern’s chart by element.',
    items: ['Supplies', 'Unearned Revenue', 'Training Revenue', 'Interest Payable', 'Common Stock', 'Rent Expense', 'Prepaid Advertising', 'Retained Earnings'],
    categories: ELEMENTS,
    answer: [0, 1, 3, 1, 2, 4, 0, 2],
    hints: [
      'Ask of each: is it something Lantern has, something it owes, the owners’ claim, something it earned, or something it used up?',
      'Watch the names: “unearned” revenue is still owed, and “prepaid” advertising has not been used yet.',
    ],
    feedback: {
      1: 'Unearned Revenue is cash received for work Lantern still has to do. It owes the work or a refund, so it is a liability, despite the word “revenue”.',
      6: 'Prepaid Advertising is advertising paid for but not yet run: a right to a future benefit, so an asset. It becomes an expense as the advertising runs.',
      7: 'Retained Earnings is the profit kept in the business over time: part of the owners’ claim, so equity.',
    },
    solution: 'Assets: Supplies, Prepaid Advertising. Liabilities: Unearned Revenue, Interest Payable. Equity: Common Stock, Retained Earnings. Revenue: Training Revenue. Expense: Rent Expense.',
  },
  {
    id: 'f01-acc-g2', type: 'classify', kind: 'applied',
    prompt: 'Classify each of Lantern’s balances at 31 March as a current or noncurrent asset or liability.',
    items: [
      'Cash',
      'Prepaid Insurance (eleven months of cover left)',
      'Equipment (expected to last five years)',
      'Accumulated Depreciation—Equipment',
      'Unearned Revenue (two catered events in April)',
      'Notes Payable (the two-year note, repayable on 1 March 2028)',
      'Wages Payable (to be paid on 5 April)',
      'Accounts Receivable (due within 30 days)',
    ],
    categories: GROUPS,
    answer: [0, 0, 1, 1, 2, 3, 2, 0],
    hints: [
      'Ask when each will turn into cash, be used up or be paid: within a year, or later?',
      'A contra account belongs to the same group as the account it reduces.',
    ],
    feedback: {
      1: 'All eleven remaining months of cover will be used within the next year, so the whole balance is current.',
      3: 'Accumulated depreciation is not owed to anyone: it is a contra-asset that reduces Equipment, so it sits with Equipment among the noncurrent assets.',
      5: 'The note is not repayable until 1 March 2028, more than twelve months after 31 March 2026, so it is noncurrent.',
    },
    solution: 'Current assets: Cash, Prepaid Insurance, Accounts Receivable. Noncurrent assets: Equipment and its contra account, Accumulated Depreciation—Equipment (reported as a deduction from Equipment). Current liabilities: Unearned Revenue and Wages Payable. Noncurrent liability: Notes Payable.',
  },
  {
    id: 'f01-acc-g3', type: 'steps', kind: 'applied',
    prompt: 'On 4 March Lantern paid $1,800 for an insurance policy covering 1 March 2026 to 28 February 2027. Work out how to classify it.',
    solution: 'On 4 March the payment buys a right to twelve months of cover, so it is an asset, Prepaid Insurance. Each month 1,800 ÷ 12 = $150 of cover expires and becomes Insurance Expense. At 31 March, 1,800 − 150 = $1,650 is still an asset, and because all of it will be used within the next eleven months, it is a current asset.',
    steps: [
      { id: 'f01-acc-g3-s1', type: 'mc',
        prompt: 'On 4 March, what is the $1,800 policy?',
        options: ['An asset: a right to twelve months of future cover', 'An expense, because the cash has been paid', 'A liability, because the insurer owes Lantern cover', 'A reduction in equity'],
        answer: 0,
        hints: ['Has Lantern used up any of the cover yet?', 'A resource the business controls and will benefit from is an asset.'],
        feedback: {
          1: 'Paying does not make something an expense; using it up does. On 4 March almost all the cover is still to come.',
          2: 'The insurer has an obligation to Lantern, but that makes it Lantern’s right, which is an asset. Lantern owes nothing.',
          3: 'Equity falls only when resources are used up or paid to the owners. Here cash turned into another asset.',
        } },
      { id: 'f01-acc-g3-s2', type: 'num',
        prompt: 'How much of the policy expires each month?',
        answer: 150, check: () => 1800 / 12, unit: '$', places: 0, tol: 0.5,
        hints: ['The policy covers twelve months evenly.'],
        wrong: [{ value: 1800, say: 'That is the whole policy. It is used up over twelve months, so only a twelfth expires each month.' }] },
      { id: 'f01-acc-g3-s3', type: 'num',
        prompt: 'How much of the policy is still an asset at 31 March?',
        answer: 1650, check: () => 1800 - 1800 / 12, unit: '$', places: 0, tol: 0.5,
        hints: ['One month of cover, March, has expired by 31 March.'],
        wrong: [
          { value: 150, say: 'That is the part that has expired and become Insurance Expense. The question asks for the part still to come.' },
          { value: 1800, say: 'March’s cover has been used, so one month’s worth is no longer an asset.' },
        ] },
      { id: 'f01-acc-g3-s4', type: 'mc',
        prompt: 'At 31 March, is the remaining Prepaid Insurance current or noncurrent?',
        options: ['Current: all of it will be used up within the next twelve months', 'Noncurrent: the policy still has almost a full year left to run, too long to count as current', 'Partly current and partly noncurrent', 'Neither: prepaid items are not classified'],
        answer: 0,
        hints: ['When will the last month of cover be used?'],
        feedback: {
          1: '“Current” means within one year (or the operating cycle, if longer). Eleven months is within a year.',
          2: 'A split is needed only when part of a prepayment covers periods more than twelve months away, as with a three-year policy.',
          3: 'Prepaid items are assets and are classified like any other asset.',
        } },
    ],
  },
  {
    id: 'f01-acc-g4', type: 'steps', kind: 'numerical',
    prompt: 'Suppose a fictional hotel borrows $240,000 on 1 July 2026, repayable in four equal annual instalments on 30 June 2027, 2028, 2029 and 2030. It prepares its balance sheet at 31 December 2026.',
    solution: 'Each instalment is 240,000 ÷ 4 = $60,000. At 31 December 2026 the instalment due on 30 June 2027 falls within twelve months, so $60,000 is a current liability. The other three instalments, 3 × 60,000 = $180,000, are noncurrent. Showing all $240,000 as noncurrent would hide a $60,000 payment due within six months.',
    steps: [
      { id: 'f01-acc-g4-s1', type: 'num', prompt: 'What is each instalment of principal?',
        answer: 60000, check: () => 240000 / 4, unit: '$', places: 0, tol: 0.5,
        hints: ['Four equal instalments repay $240,000.'] },
      { id: 'f01-acc-g4-s2', type: 'num', prompt: 'How much of the loan is a current liability at 31 December 2026?',
        answer: 60000, check: () => 240000 / 4, unit: '$', places: 0, tol: 0.5,
        hints: ['Which instalments fall due within twelve months after 31 December 2026?', 'Only the 30 June 2027 instalment does.'],
        wrong: [
          { value: 0, say: 'The loan is long-term overall, but its first instalment is due within twelve months, and that part is current.' },
          { value: 240000, say: 'Only the part due within twelve months is current; the 2028–2030 instalments are noncurrent.' },
        ] },
      { id: 'f01-acc-g4-s3', type: 'num', prompt: 'How much of the loan is a noncurrent liability at 31 December 2026?',
        answer: 180000, check: () => 240000 - 240000 / 4, unit: '$', places: 0, tol: 0.5,
        hints: ['Total loan minus the current portion.'],
        wrong: [{ value: 240000, say: 'Take the current portion, $60,000, out of the noncurrent figure.' }] },
    ],
  },
];

export const independent = [
  {
    id: 'f01-acc-i1', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each account as permanent or temporary.',
    items: ['Cash', 'Catering Revenue', 'Dividends', 'Accumulated Depreciation—Equipment', 'Retained Earnings', 'Depreciation Expense', 'Unearned Revenue', 'Income Summary'],
    categories: ['Permanent', 'Temporary'],
    answer: [0, 1, 1, 0, 0, 1, 0, 1],
    feedback: {
      2: 'Dividends record one period’s distributions to shareholders. They are closed to Retained Earnings at the end of the period, so the account is temporary.',
      3: 'Accumulated depreciation keeps growing from period to period until the asset is disposed of: a permanent contra-asset account.',
      4: 'Retained Earnings is where temporary accounts are closed to. Its balance carries forward: permanent.',
      6: 'Unearned Revenue is a liability, and its balance carries forward until the work is done: permanent, despite the word “revenue”.',
      7: 'Income Summary is used only during closing and is itself emptied: temporary.',
    },
    solution: 'Permanent: Cash, Accumulated Depreciation—Equipment, Retained Earnings and Unearned Revenue (asset, contra-asset, equity and liability accounts). Temporary: Catering Revenue, Dividends, Depreciation Expense and Income Summary.',
  },
  {
    id: 'f01-acc-i2', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement about a contra account is correct?',
    options: [
      'It is paired with another account and reduces it, and the two are reported together.',
      'It records amounts the business owes because of an asset, so it is reported as a liability.',
      'It is a temporary account, closed at the end of each period.',
      'It replaces the original account once the asset starts being used.',
    ],
    answer: 0,
    feedback: {
      1: 'Accumulated depreciation, for example, is not owed to anyone: it measures how much of an asset’s cost has been used up.',
      2: 'Contra-asset accounts such as accumulated depreciation carry their balances forward, so they are permanent.',
      3: 'The original account keeps the cost; the contra account sits beside it, so both figures remain visible.',
    },
    solution: 'A contra account is paired with a partner account and reduces it. Accumulated Depreciation—Equipment, for instance, is subtracted from Equipment: $12,000 − $200 = $11,800 at Lantern on 31 March. Keeping it separate preserves the original cost and shows how much has been used up.',
  },
  {
    id: 'f01-acc-i3', type: 'classify', kind: 'applied',
    prompt: 'Classify each item by element.',
    items: [
      'An airline’s tickets sold for flights next month',
      'A university’s tuition fees earned for the term just taught',
      'An online retailer’s delivery vans',
      'A hotel’s cost of the electricity it used this month',
      'A clothing brand’s bank overdraft',
      'A battery-storage installer’s right to be paid for an installation completed last week',
    ],
    categories: ELEMENTS,
    answer: [1, 3, 0, 4, 1, 0],
    feedback: {
      0: 'The airline has been paid but has not flown the passengers yet. It owes the flights or refunds: a liability.',
      3: 'Electricity used to run the hotel this month is a resource used up in earning revenue: an expense, whether or not the bill has been paid.',
      4: 'An overdraft is money the brand owes its bank: a liability, not negative cash.',
      5: 'The installer has done the work and has a right to collect: an asset (a receivable).',
    },
    solution: 'Tickets for future flights: liability (unearned revenue). Tuition earned: revenue. Delivery vans: asset. Electricity used: expense. Overdraft: liability. Right to be paid for completed work: asset.',
  },
  {
    id: 'f01-acc-i4', type: 'num', kind: 'numerical',
    prompt: 'At 31 December a clothing brand’s sewing machinery cost $85,000, and its accumulated depreciation is $34,000. At what net amount is the machinery shown on the balance sheet?',
    answer: 51000, check: () => 85000 - 34000, unit: '$', places: 0, tol: 0.5,
    wrong: [{ value: 119000, say: 'Accumulated depreciation is a contra account: subtract it from the cost, don’t add it.' }],
    solution: 'Net amount = cost − accumulated depreciation = 85,000 − 34,000 = $51,000. Both figures are shown, so readers can see the original investment and how much of it has been used up.',
  },
  {
    id: 'f01-acc-i5', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s two-year note (1 March 2026 to 1 March 2028) is repayable in full at the end of its term. How will it be classified on Lantern’s balance sheet at 31 March 2027?',
    options: [
      'As a current liability, because by then it is due within twelve months',
      'As a noncurrent liability, because it was a two-year note when Lantern signed it',
      'Half current and half noncurrent',
      'It is not shown, because none of it has been repaid yet',
    ],
    answer: 0,
    feedback: {
      1: 'Classification follows when the payment falls due, not the loan’s original length. On 31 March 2027, repayment is eleven months away.',
      2: 'There is a single repayment, all due on 1 March 2028, so there is nothing to split.',
      3: 'An unpaid loan is exactly what a liability is; it stays on the balance sheet until it is repaid.',
    },
    solution: 'At 31 March 2027 the whole $10,000 is due on 1 March 2028, within twelve months, so it is a current liability. At 31 March 2026 it was noncurrent; it moves to current as the repayment date comes within a year.',
  },
  {
    id: 'f01-acc-i6', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these pairs correctly match an IFRS or UK name to the US name used in this course? Select all that apply.',
    options: [
      'Trade receivables: Accounts Receivable',
      'Share capital: Common Stock',
      'Statement of financial position: balance sheet',
      'Turnover: Notes Payable',
      'Contract liability: Unearned Revenue',
    ],
    answer: [0, 1, 2, 4],
    feedback: {
      3: 'Turnover is the UK company-law term for revenue, not for a loan. A loan is usually called borrowings.',
    },
    solution: 'Trade receivables = Accounts Receivable; share capital = Common Stock; statement of financial position = balance sheet; contract liability = Unearned Revenue. Turnover is the UK term for revenue.',
  },
];

export const check = [
  {
    id: 'f01-acc-k1', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each of these accounts from Lantern’s chart by element.',
    items: ['Accounts Payable', 'Interest Revenue', 'Prepaid Rent', 'Fuel Expense', 'Common Stock', 'Notes Receivable'],
    categories: ELEMENTS,
    answer: [1, 3, 0, 4, 2, 0],
    feedback: {
      2: 'Rent paid in advance is a right to use the kitchen in future months: an asset until the months pass.',
      5: 'A note receivable is a written promise by someone else to pay Lantern: an asset.',
    },
    solution: 'Accounts Payable: liability. Interest Revenue: revenue. Prepaid Rent: asset. Fuel Expense: expense. Common Stock: equity. Notes Receivable: asset.',
  },
  {
    id: 'f01-acc-k2', type: 'num', kind: 'numerical',
    prompt: 'An online retailer’s liabilities at 31 December are: accounts payable $46,000; wages payable $8,500; customers’ prepayments for orders to be shipped in January $12,000; and a bank loan of $150,000, of which $25,000 is due on 30 June next year and the rest over the following five years. What are its total current liabilities?',
    answer: 91500, check: () => 46000 + 8500 + 12000 + 25000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 66500, say: 'You left out the current portion of the loan. The $25,000 due on 30 June falls within twelve months, so it is current.' },
      { value: 216500, say: 'Only the part of the loan due within twelve months is current. The remaining $125,000 is noncurrent.' },
      { value: 79500, say: 'Customers’ prepayments are unearned revenue: the retailer owes the goods, so they are a current liability.' },
    ],
    solution: 'Current liabilities = 46,000 + 8,500 + 12,000 + 25,000 = $91,500. The customers’ prepayments are unearned revenue due to be settled in January; only the $25,000 of the loan due within twelve months is current, and the other $125,000 is noncurrent.',
  },
  {
    id: 'f01-acc-k3', type: 'mc', kind: 'applied',
    prompt: 'A battery-storage installer pays $36,000 on 1 January for three years of software licences. At the end of that first year, how should the unexpired $24,000 be classified?',
    options: [
      '$12,000 as a current asset and $12,000 as a noncurrent asset',
      '$24,000 as a current asset, because it is a prepaid expense',
      '$24,000 as an expense, because it has been paid',
      '$24,000 as a noncurrent asset, because the licence runs beyond one year',
    ],
    answer: 0,
    feedback: {
      1: 'Prepaid items are current only for the part that will be used within the next year. The third year of licences is more than twelve months away.',
      2: 'Payment does not make it an expense. Two years of licences are still to be used, so they are an asset.',
      3: 'The next year’s licences, $12,000, will be used within twelve months, so that part is current.',
    },
    solution: 'The licences cost 36,000 ÷ 3 = $12,000 a year. After one year, $24,000 is unexpired: the $12,000 for the next twelve months is a current asset, and the $12,000 for the year after that is a noncurrent asset.',
  },
  {
    id: 'f01-acc-k4', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these are temporary accounts? Select all that apply.',
    options: ['Training Revenue', 'Dividends', 'Prepaid Rent', 'Interest Expense', 'Common Stock', 'Accumulated Depreciation—Van'],
    answer: [0, 1, 3],
    feedback: {
      2: 'Prepaid Rent is an asset, so its balance carries forward: permanent.',
      4: 'Common Stock is an equity account whose balance carries forward: permanent.',
      5: 'Accumulated depreciation keeps growing until the van is disposed of: a permanent contra-asset account.',
    },
    solution: 'Revenue, expense and dividends accounts collect one period’s activity and are closed to Retained Earnings: Training Revenue, Dividends and Interest Expense are temporary. Prepaid Rent, Common Stock and Accumulated Depreciation—Van carry their balances forward.',
  },
  {
    id: 'f01-acc-k5', type: 'mc', kind: 'conceptual',
    prompt: 'What is the best reason that Harbor Tech’s $2,400 deposit is recorded as a liability on 8 March?',
    options: [
      'Lantern has a present obligation to cater the events or return the money.',
      'Cash received is always a liability until the end of the month.',
      'Deposits are too small to count as revenue.',
      'Lantern will have to pay tax on the deposit later.',
    ],
    answer: 0,
    feedback: {
      1: 'Cash from a customer for work already done is revenue straight away. What matters is whether the work has been done.',
      2: 'Size has nothing to do with it; materiality decides how much detail to report, not what kind of item something is.',
      3: 'Tax is a separate matter. The deposit is a liability because Lantern owes Harbor Tech the catering.',
    },
    solution: 'A liability is a present obligation to transfer resources. Having taken the deposit, Lantern must cater three events or refund the money. As each event is catered, $800 of the liability becomes revenue.',
  },
  {
    id: 'f01-acc-k6', type: 'classify', kind: 'applied',
    prompt: 'Lantern’s chart numbers accounts by type: 100s assets, 200s liabilities, 300s equity, 400s revenue, 500s expenses. Suppose Lantern opens these new accounts. In which range does each belong?',
    items: ['Prepaid Software Licences', 'Sales Tax Payable', 'Workshop Materials Expense', 'Consulting Revenue', 'Van Loan Payable (five years)', 'Additional Paid-in Capital'],
    categories: ['100s (assets)', '200s (liabilities)', '300s (equity)', '400s (revenue)', '500s (expenses)'],
    answer: [0, 1, 4, 3, 1, 2],
    feedback: {
      1: 'Sales tax collected from customers is owed to the government: a liability.',
      4: 'A loan is a liability whatever its length; within the 200s it would go among the noncurrent liabilities, near Notes Payable (250).',
      5: 'Additional paid-in capital is money shareholders paid for their shares beyond the shares’ par value: equity, alongside Common Stock.',
    },
    solution: 'Prepaid Software Licences: 100s (asset). Sales Tax Payable: 200s (liability). Workshop Materials Expense: 500s. Consulting Revenue: 400s. Van Loan Payable: 200s (liability, noncurrent except for any part due within a year). Additional Paid-in Capital: 300s (equity).',
  },
];
