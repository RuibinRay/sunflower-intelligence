// assess-m3.js — F01 module 3 test: Accrual accounting and adjustments (accrual versus cash, adjusting entries,
// financial statements). New questions, not copies of lesson exercises. No hints; solutions show in review.
// Lantern’s May transactions here are hypothetical (“Suppose…”); March figures agree with case.js.

export const items = [
  // ---------------------------------------------------------------- accrual-vs-cash
  {
    id: 'f01-m3-1', lesson: 'accrual-vs-cash', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional theatre sells $30,000 of tickets in October for a play performed on 12 December. Its financial year ends on 31 December. When does it recognise the $30,000 as revenue?',
    options: [
      'In December, when the performance takes place',
      'In October, when the cash is received',
      'In October, when each ticket is sold and the contract exists',
      'Spread evenly over October, November and December',
    ],
    answer: 0,
    feedback: {
      1: 'That is the cash basis. Until the play is performed, the theatre owes the audience a performance: unearned revenue.',
      2: 'Selling a ticket creates the contract (step 1). Revenue waits for step 5: satisfying the performance obligation.',
      3: 'Nothing is delivered in October or November; the obligation is satisfied at a point in time, on the night of the performance.',
    },
    solution: 'The performance obligation (the play) is satisfied on 12 December, so the revenue belongs to December. From October to December the $30,000 is unearned revenue, a liability.',
  },
  {
    id: 'f01-m3-2', lesson: 'accrual-vs-cash', type: 'num', kind: 'numerical',
    prompt: 'A fictional design agency’s cash-basis profit for March is $8,200. In March it also received $3,000 in advance for work it will do in April; finished $2,600 of work that it has not yet billed; paid $2,400 for a 12-month software licence starting on 1 March; and used $900 of a freelancer’s services that it will pay for in April. All other cash flows relate to March revenue and expenses. What is accrual-basis net income for March?',
    answer: 9100, check: () => 8200 - 3000 + 2600 + (2400 - 2400 / 12) - 900, unit: '$', places: 0,
    wrong: [
      { value: 15100, say: 'The $3,000 advance was counted in cash profit but isn’t earned: subtract it.' },
      { value: 9300, say: 'One month of the licence ($200) is March’s expense; add back only the $2,200 that covers April to February.' },
      { value: 10900, say: 'The freelancer’s work was used in March: it is March’s expense although unpaid. Subtract it.' },
    ],
    solution: 'Cash profit 8,200 − 3,000 (received, not earned) + 2,600 (earned, not billed) + 2,200 (licence paid for later months: 2,400 − 200) − 900 (expense not yet paid) = $9,100.',
  },
  {
    id: 'f01-m3-3', lesson: 'accrual-vs-cash', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each item from the point of view of the business named.',
    items: [
      'A software company receives annual subscription fees on 1 December.',
      'A battery-storage installer’s technicians work overtime on 30–31 December, paid on 10 January.',
      'An airline pays its aircraft insurance for the next 12 months.',
      'A hotel’s conference guests stay on 31 December and are invoiced on 3 January.',
      'A university pays a year’s software licence fees in advance.',
    ],
    categories: ['Unearned revenue (cash first)', 'Accrued revenue (revenue first)', 'Prepaid expense (cash first)', 'Accrued expense (expense first)'],
    answer: [0, 3, 2, 1, 2],
    feedback: {
      0: 'The company is paid before it provides the service: a liability until each month of service is delivered.',
      1: 'The overtime was worked in December, so it is December’s expense, paid later.',
      3: 'The rooms were provided in December: revenue now, invoice and cash later.',
    },
    solution: 'Subscription fees received ahead: unearned revenue. Overtime worked but unpaid: accrued expense. Insurance and licences paid ahead: prepaid expenses. Rooms provided but not yet invoiced: accrued revenue.',
  },
  {
    id: 'f01-m3-4', lesson: 'accrual-vs-cash', type: 'num', kind: 'applied',
    prompt: 'A fictional hotel sells a wedding package for $18,000 that includes a block of rooms, a dinner and spa vouchers. Sold separately, the rooms would cost $12,000, the dinner $6,000 and the vouchers $2,000. Using the five-step model, how much of the $18,000 is allocated to the dinner?',
    answer: 5400, check: () => 18000 * 6000 / (12000 + 6000 + 2000), unit: '$', places: 0,
    wrong: [
      { value: 6000, say: 'That is the dinner’s stand-alone price. The package is sold at a discount, which is shared in proportion: 18,000 × 6,000 ÷ 20,000.' },
      { value: 5333.33, say: 'That shares the $2,000 discount equally between the three items (6,000 − 2,000 ÷ 3). Step 4 allocates the price in proportion to stand-alone selling prices.' },
    ],
    solution: 'Stand-alone prices total 12,000 + 6,000 + 2,000 = 20,000. Allocation in proportion (step 4): dinner = 18,000 × 6,000 ÷ 20,000 = $5,400. (Rooms 10,800; vouchers 1,800.) Each part is recognised when that obligation is satisfied.',
  },

  // ---------------------------------------------------------------- adjusting-entries
  {
    id: 'f01-m3-5', lesson: 'adjusting-entries', type: 'journal', kind: 'applied', chart: 'f01', date: '2026-05-31',
    prompt: 'Suppose that on 1 May Lantern pays $3,600 for six months’ rent of a second kitchen (May to October) and debits Prepaid Rent. Record the adjusting entry on 31 May.',
    accounts: ['Rent Expense', 'Prepaid Rent', 'Cash', 'Accounts Payable', 'Prepaid Insurance'],
    lines: [{ acct: 'Rent Expense', dr: 600 }, { acct: 'Prepaid Rent', cr: 600 }],
    solution: 'One of six months has been used: 3,600 ÷ 6 = $600. Debit Rent Expense 600; credit Prepaid Rent 600, leaving $3,000 of prepaid rent for June to October. No cash moves: the payment was recorded on 1 May.',
  },
  {
    id: 'f01-m3-6', lesson: 'adjusting-entries', type: 'journal', kind: 'numerical', chart: 'f01', date: '2026-06-30',
    prompt: 'On 1 April a fictional clothing brand lends $8,000 to a supplier on a note at 4.5% a year; interest and principal are due on 31 December. The brand’s financial year ends on 30 June and it has made no earlier entry for the interest. Record the adjusting entry on 30 June.',
    accounts: ['Interest Receivable', 'Interest Revenue', 'Notes Receivable', 'Cash', 'Interest Payable', 'Interest Expense'],
    lines: [{ acct: 'Interest Receivable', dr: 90 }, { acct: 'Interest Revenue', cr: 90 }],
    solution: 'The brand is the lender, so it has earned interest: I = 8,000 × 0.045 × 3/12 = $90 for April to June. Accrued revenue: debit Interest Receivable 90; credit Interest Revenue 90.',
  },
  {
    id: 'f01-m3-7', lesson: 'adjusting-entries', type: 'journal', kind: 'numerical', chart: 'f01', date: '2026-12-31',
    prompt: 'A fictional hotel’s building cost $2,400,000. The hotel expects to use it for 40 years and then sell it for $600,000, and it uses the straight-line method. Record one full year’s depreciation on 31 December.',
    accounts: ['Depreciation Expense', 'Accumulated Depreciation—Building', 'Building', 'Accumulated Depreciation—Equipment', 'Cash'],
    lines: [{ acct: 'Depreciation Expense', dr: 45000 }, { acct: 'Accumulated Depreciation—Building', cr: 45000 }],
    solution: '(2,400,000 − 600,000) ÷ 40 = $45,000 a year. Debit Depreciation Expense 45,000; credit the contra-asset Accumulated Depreciation—Building 45,000. The Building account stays at cost.',
  },
  {
    id: 'f01-m3-8', lesson: 'adjusting-entries', type: 'journal', kind: 'applied', chart: 'f01', date: '2026-05-31',
    prompt: 'Suppose that on 2 May a company pays Lantern $4,500 in advance for nine weekly office coffee services at $500 each, starting on 6 May; Lantern records the receipt as Cash and Unearned Revenue. By 31 May Lantern has provided four of the services. Record the adjusting entry on 31 May.',
    accounts: ['Unearned Revenue', 'Catering Revenue', 'Training Revenue', 'Cash', 'Accounts Receivable'],
    lines: [{ acct: 'Unearned Revenue', dr: 2000 }, { acct: 'Catering Revenue', cr: 2000 }],
    solution: 'Four services delivered: 4 × 500 = $2,000 earned. Debit Unearned Revenue 2,000; credit Catering Revenue 2,000. Unearned Revenue keeps $2,500 for the five services still owed.',
  },
  {
    id: 'f01-m3-9', lesson: 'adjusting-entries', type: 'equation', kind: 'conceptual',
    prompt: 'Lantern forgets adjustment a7, the $600 breakfast catered for Pier Nine Studio on 31 March and invoiced on 2 April. Enter how far each total on its 31 March balance sheet would be wrong: a positive number if overstated, a negative number if understated, 0 if unaffected.',
    answer: { assets: -600, liabilities: 0, equity: -600 },
    solution: 'Without a7, Accounts Receivable is $600 too low, so assets are understated (−600). Catering Revenue is $600 too low, so net income and equity are understated (−600). No liability is involved. The errors satisfy the equation: −600 = 0 + (−600).',
  },

  // ---------------------------------------------------------------- financial-statements
  {
    id: 'f01-m3-10', lesson: 'financial-statements', type: 'num', kind: 'numerical',
    prompt: 'A fictional tutoring company’s adjusted trial balance at 31 December shows: Retained Earnings (1 January) $15,400; Tutoring Revenue $48,000; Interest Revenue $2,500; total expenses $39,300; Dividends $4,000; Common Stock $25,000. What are retained earnings on the 31 December balance sheet?',
    answer: 22600, check: () => 15400 + (48000 + 2500 - 39300) - 4000, unit: '$', places: 0,
    wrong: [
      { value: 15400, say: 'That is the beginning balance shown in the trial balance. The balance sheet needs the ending figure, after net income and dividends.' },
      { value: 30600, say: 'Dividends are subtracted from retained earnings, not added.' },
      { value: 47600, say: 'Common stock is a separate component of equity; it isn’t part of retained earnings.' },
    ],
    solution: 'Net income = 48,000 + 2,500 − 39,300 = 11,200. Ending retained earnings = 15,400 + 11,200 − 4,000 = $22,600.',
  },
  {
    id: 'f01-m3-11', lesson: 'financial-statements', type: 'num', kind: 'applied',
    prompt: 'A fictional bike shop’s cash records for June show: received from customers $41,000 (including $2,000 for May invoices); paid suppliers $17,500; paid employees $12,300; paid interest on a bank loan $250; paid $1,200 for a 12-month insurance policy; bought tools for $2,800; the owner invested $5,000 in exchange for stock. Using the direct method under US GAAP, what is net cash provided by operating activities?',
    answer: 9750, check: () => 41000 - 17500 - 12300 - 250 - 1200, unit: '$', places: 0,
    wrong: [
      { value: 7750, say: 'Cash collected for May invoices is still cash received from customers in June: it is an operating receipt.' },
      { value: 6950, say: 'The tools are a long-term asset: an investing outflow, not operating.' },
      { value: 10950, say: 'The insurance payment is an operating outflow when paid, even though most of it covers later months.' },
      { value: 10000, say: 'Under US GAAP interest paid is an operating outflow.' },
    ],
    solution: 'Operating = 41,000 − 17,500 − 12,300 − 250 − 1,200 = $9,750. The statement of cash flows records cash when it moves, so the May collections and the whole insurance payment count. The tools (−2,800) are investing; the owner’s investment (+5,000) is financing.',
  },
  {
    id: 'f01-m3-12', lesson: 'financial-statements', type: 'mc', kind: 'conceptual',
    prompt: 'A student prepares a balance sheet from an adjusted trial balance. Total assets exceed total liabilities plus equity by exactly the period’s net income minus dividends. What is the most likely mistake?',
    options: [
      'Retained earnings were taken from the trial balance (the beginning balance) instead of the ending figure from the statement of changes in equity.',
      'Accumulated depreciation was deducted from the related asset.',
      'Unearned revenue was listed as a current liability.',
      'Dividends were left off the income statement.',
    ],
    answer: 0,
    feedback: {
      1: 'Deducting accumulated depreciation from the asset is correct presentation.',
      2: 'Unearned revenue due within a year is correctly a current liability.',
      3: 'Dividends belong in the statement of changes in equity, not the income statement, so that is correct too.',
    },
    solution: 'Until the period’s net income and dividends are carried into retained earnings, the trial balance’s Retained Earnings figure is the beginning balance. Assets then exceed liabilities plus equity by net income − dividends. Using the ending retained earnings from the statement of changes in equity makes the balance sheet balance.',
  },
];
