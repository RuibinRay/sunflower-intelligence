// assess-diagnostic.js — F01 course diagnostic: three items per module, written to separate a student who already
// knows a module from one who doesn’t (each item needs the module’s method, not just its vocabulary).
// New questions, not copies of lesson exercises or module-test items. No hints; solutions show in review.
// Lantern’s April events here are hypothetical (“Suppose…”); March figures agree with case.js.

export const items = [
  // ================================================================ Module 1: the language of business
  {
    id: 'f01-dg-1', lesson: 'what-is-accounting', type: 'mc', kind: 'conceptual',
    prompt: 'Lantern records its $12,000 espresso machine and grinder as an asset and spreads the cost over the five years it expects to use them, instead of measuring them at whatever they would fetch if Lantern had to sell them today. Which assumption most directly justifies this?',
    options: [
      'The going concern assumption',
      'The monetary unit assumption',
      'The time period assumption',
      'The economic entity assumption',
    ],
    answer: 0,
    feedback: {
      1: 'The monetary unit assumption says the accounts record only what can be measured in money. Both the cost and a resale price are in dollars, so it doesn’t choose between them.',
      2: 'The time period assumption is why the cost is split into months and years, but it doesn’t explain why Lantern ignores a forced-sale price today. That comes from expecting to keep using the equipment.',
      3: 'The economic entity assumption keeps Lantern’s records separate from Ana’s. It says whose equipment it is, not how to measure it.',
    },
    solution: 'Under the going concern assumption Lantern is expected to keep operating for the foreseeable future, so it will use the equipment rather than sell it. Its value to Lantern lies in five years of use, so the cost is spread over those years. If Lantern were about to close, what the equipment would fetch on sale would matter, and the going concern basis would no longer apply.',
  },
  {
    id: 'f01-dg-2', lesson: 'accounts-and-classifications', type: 'classify', kind: 'conceptual',
    prompt: 'A fictional island ferry company keeps its books under US GAAP. Classify each item by element.',
    items: [
      'Season tickets sold in March for crossings next summer',
      'Fuel in the ferry’s tanks, bought but not yet burned',
      'Fuel burned on last week’s crossings',
      'Fares earned from passengers carried this month',
      'An amount owed to the shipyard for a refit finished last month',
      'Shares issued to the founders in exchange for their investment',
      'The ferry itself',
    ],
    categories: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'],
    answer: [1, 0, 4, 3, 1, 2, 0],
    feedback: {
      0: 'The company has been paid for crossings it has not yet provided. It owes the service or a refund: a liability (unearned revenue).',
      1: 'Fuel still in the tanks will be used to earn future fares: it is a resource the company controls, an asset.',
      2: 'The same fuel, once burned to earn last week’s fares, has been used up: an expense.',
      4: 'The refit is finished and unpaid, so the company owes the shipyard: a liability (accounts payable).',
    },
    solution: 'Season tickets paid in advance: liability. Fuel not yet burned: asset. Fuel burned: expense. Fares for passengers carried: revenue. Amount owed for a finished refit: liability. Shares issued to the founders: equity (common stock). The ferry: asset. The fuel shows the key idea: the same thing is an asset while it can still bring future benefit and an expense once it has been used up.',
  },
  {
    id: 'f01-dg-3', lesson: 'accounting-equation', type: 'equation', kind: 'applied',
    prompt: 'A customer pays a fictional bike-repair shop $1,200 in cash. Of this, $500 settles an invoice for a repair done last month and $700 is for a repair finished today. Enter the change in each side of the accounting equation for today’s transaction (use a minus sign for a decrease and 0 for no change).',
    answer: { assets: 700, liabilities: 0, equity: 700 },
    solution: 'Cash rises by $1,200, but $500 of it replaces an amount the customer already owed (accounts receivable falls by $500), so total assets rise by 1,200 − 500 = $700. Only today’s repair is new revenue: equity rises by $700. Last month’s repair was recorded as revenue last month. No liability changes. Check: 700 = 0 + 700.',
  },

  // ================================================================ Module 2: double-entry recording
  {
    id: 'f01-dg-4', lesson: 'debits-and-credits', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these are recorded with a debit to the account named? Select all that apply.',
    options: [
      'Prepaid Rent, when rent for the next quarter is paid in advance',
      'Wages Payable, when wages accrued last month are paid',
      'Unearned Revenue, when a customer pays a deposit',
      'Accumulated Depreciation—Equipment, when depreciation is recorded',
      'Dividends, when the board declares and pays a dividend',
      'Training Revenue, when a workshop is held and paid for on the day',
      'Accounts Receivable, when a customer pays its invoice',
    ],
    answer: [0, 1, 4],
    feedback: {
      2: 'A deposit creates an obligation to the customer, a liability, which increases with a credit.',
      3: 'Accumulated depreciation is a contra-asset with a credit normal balance; recording depreciation increases it, so it is credited.',
      5: 'Revenue increases equity, so it increases with a credit.',
      6: 'Collecting an invoice reduces the amount owed to the business, an asset, so Accounts Receivable is credited (and Cash debited).',
    },
    solution: 'Debits increase assets (Prepaid Rent), expenses and Dividends, and decrease liabilities (Wages Payable when the wages are paid), equity and revenue. So Prepaid Rent, Wages Payable and Dividends are debited. Unearned Revenue and Training Revenue increase with credits; Accumulated Depreciation increases with a credit; and Accounts Receivable falls, so it is credited.',
  },
  {
    id: 'f01-dg-5', lesson: 'journal-entries', type: 'journal', kind: 'applied', chart: 'f01', date: '2026-04-10',
    prompt: 'Suppose that on 10 April Lantern buys a second-hand van for $18,000. The dealer’s invoice also includes $600 for a one-year insurance policy on the van starting that day. Lantern pays $3,600 in cash and signs a note payable to the dealer for the remaining $15,000. Record the entry.',
    accounts: ['Van', 'Prepaid Insurance', 'Insurance Expense', 'Fuel Expense', 'Cash', 'Accounts Payable', 'Notes Payable'],
    lines: [{ acct: 'Van', dr: 18000 }, { acct: 'Prepaid Insurance', dr: 600 }, { acct: 'Cash', cr: 3600 }, { acct: 'Notes Payable', cr: 15000 }],
    solution: 'A compound entry with two debits and two credits. The van will serve for years: debit Van $18,000. The insurance covers the next twelve months, so on 10 April it is still an asset: debit Prepaid Insurance $600 (it becomes Insurance Expense month by month through adjusting entries). Cash falls by $3,600: credit Cash. The rest is owed under a signed note: credit Notes Payable $15,000. Debits 18,000 + 600 = 18,600 = credits 3,600 + 15,000.',
  },
  {
    id: 'f01-dg-6', lesson: 'trial-balance', type: 'num', kind: 'numerical',
    prompt: 'In a first draft of Lantern’s unadjusted trial balance at 31 March, the bookkeeper copies Accounts Payable ($8,760) as $8,670 and lists Utilities Expense ($260) in the credit column. Every other balance is listed correctly. By how much will the credit total exceed the debit total?',
    answer: 430, check: () => (46860 - 8760 + 8670 + 260) - (46860 - 260), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 520, say: 'That is the effect of the wrong-column error alone. The transposition also made the credit column $90 too small.' },
      { value: 90, say: 'That is the effect of the transposition alone. Utilities Expense in the wrong column also moves both totals.' },
      { value: 610, say: 'The transposition understated a credit balance, which reduces the credit column’s lead: subtract the $90, don’t add it.' },
      { value: 170, say: 'A balance in the wrong column shifts both totals, so it creates a difference of twice its amount, 2 × 260 = 520, not 260.' },
    ],
    solution: 'The correct totals are $46,860 each. Moving Utilities Expense to the credit column takes $260 off the debits (46,600) and adds $260 to the credits. Writing Accounts Payable as $8,670 takes $90 off the credits. Credits = 46,860 + 260 − 90 = 47,030. Difference = 47,030 − 46,600 = $430, which is 2 × 260 − 90.',
  },

  // ================================================================ Module 3: accrual accounting and adjustments
  {
    id: 'f01-dg-7', lesson: 'accrual-vs-cash', type: 'num', kind: 'applied',
    prompt: 'A fictional dog-grooming salon has these June events. It grooms dogs for $14,000, of which customers pay $11,500 in June and the rest in July. It collects $2,000 for grooming done in May and receives $1,000 of prepayments for July appointments. Its staff earn $6,200 of wages in June, of which $5,000 is paid in June and the rest on 3 July. On 1 June it pays $1,800 of rent for June and July. It pays May’s $700 utilities bill and receives June’s $650 bill, to be paid in July. What is the salon’s accrual-basis net income for June?',
    answer: 6250, check: () => 14000 - 6200 - 1800 / 2 - 650, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 7000, say: 'That is cash-basis profit: cash in (11,500 + 2,000 + 1,000) minus cash out (5,000 + 1,800 + 700). Accrual accounting records revenue when earned and expenses when incurred.' },
      { value: 7250, say: 'The $1,000 of prepayments is for July appointments: unearned revenue, not June revenue.' },
      { value: 5350, say: 'Only half the $1,800 rent is June’s expense; the other $900 is prepaid rent for July.' },
      { value: 5550, say: 'May’s utilities bill is May’s expense, even though it was paid in June.' },
      { value: 7450, say: 'June’s expense is all $6,200 of wages earned in June, including the $1,200 paid on 3 July.' },
    ],
    solution: 'Revenue earned in June: $14,000 (the May collection and the July prepayments are not June revenue). Expenses incurred in June: wages $6,200, rent 1,800 ÷ 2 = $900, utilities $650. Net income = 14,000 − 6,200 − 900 − 650 = $6,250. Cash-basis profit would be 14,500 − 7,500 = $7,000.',
  },
  {
    id: 'f01-dg-8', lesson: 'adjusting-entries', type: 'journal', kind: 'numerical', chart: 'f01', date: '2026-04-30',
    prompt: 'Suppose Lantern now pays its baristas every two weeks. The pay period from 20 April to 3 May (14 days) costs $1,960, the wages build up evenly over the 14 days, and they will be paid on 8 May. Lantern adjusts its books at the end of every month. Record the adjusting entry on 30 April.',
    accounts: ['Wages Expense', 'Wages Payable', 'Cash', 'Accounts Payable', 'Prepaid Rent'],
    lines: [{ acct: 'Wages Expense', dr: 1540 }, { acct: 'Wages Payable', cr: 1540 }],
    solution: 'This is an accrued expense: the baristas have worked, and Lantern hasn’t paid yet. The days from 20 to 30 April are 11 of the 14 days (30 − 20 + 1 = 11), so April’s share is 1,960 ÷ 14 × 11 = 140 × 11 = $1,540. Debit Wages Expense 1,540; credit Wages Payable 1,540. No cash moves until 8 May, and the other $420 is May’s expense.',
  },
  {
    id: 'f01-dg-9', lesson: 'financial-statements', type: 'num', kind: 'numerical',
    prompt: 'A fictional window-cleaning company’s adjusted trial balance at 31 December includes: Cash $7,400; Accounts Receivable $3,250; Supplies $680; Prepaid Insurance $1,200; Van $36,000; Accumulated Depreciation—Van $9,000; Dividends $2,000; Fuel Expense $1,450; Accounts Payable $2,100; Unearned Revenue $900. What are total assets on its balance sheet?',
    answer: 39530, check: () => 7400 + 3250 + 680 + 1200 + (36000 - 9000), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 48530, say: 'Accumulated depreciation is a contra-asset: deduct it from the van, which is shown at 36,000 − 9,000 = 27,000.' },
      { value: 41530, say: 'Dividends have a debit balance but are not an asset: they reduce equity and appear in the statement of changes in equity.' },
      { value: 42980, say: 'Dividends and Fuel Expense have debit balances, but neither is an asset. Fuel Expense goes on the income statement.' },
      { value: 57530, say: 'Accumulated depreciation reduces the van; it is subtracted, not added.' },
    ],
    solution: 'Assets are Cash 7,400, Accounts Receivable 3,250, Supplies 680, Prepaid Insurance 1,200 and the van net of accumulated depreciation, 36,000 − 9,000 = 27,000. Total = 7,400 + 3,250 + 680 + 1,200 + 27,000 = $39,530. Dividends (equity) and Fuel Expense (income statement) are not assets; Accounts Payable and Unearned Revenue are liabilities.',
  },

  // ================================================================ Module 4: closing the books
  {
    id: 'f01-dg-10', lesson: 'closing-entries', type: 'journal', kind: 'numerical', chart: 'f01', date: '2026-12-31',
    prompt: 'A fictional office-catering company closes its year on 31 December 2026. It has already closed Catering Revenue ($182,400) and Interest Revenue ($600) to Income Summary, and then its expense accounts, which totalled $171,250. Dividends ($8,000) have not yet been closed. Record the entry that closes Income Summary.',
    accounts: ['Income Summary', 'Retained Earnings', 'Dividends', 'Catering Revenue', 'Common Stock', 'Cash'],
    lines: [{ acct: 'Income Summary', dr: 11750 }, { acct: 'Retained Earnings', cr: 11750 }],
    solution: 'After the first two closing entries, Income Summary holds credits of 182,400 + 600 = 183,000 and debits of 171,250, a credit balance of $11,750: the year’s net income. Close it by debiting Income Summary 11,750 and crediting Retained Earnings 11,750, because profit increases retained earnings. Dividends are not part of net income: they are closed directly to Retained Earnings in a separate entry (debit Retained Earnings 8,000, credit Dividends 8,000).',
  },
  {
    id: 'f01-dg-11', lesson: 'accounting-cycle', type: 'multi', kind: 'conceptual',
    prompt: 'Suppose Lantern decides to use reversing entries. Which of its 31 March adjustments should it reverse on 1 April? Select all that apply.',
    options: [
      'a5: wages of $1,400 earned on 16–31 March, to be paid on 5 April',
      'a6: interest of $50 on the bank note, to be paid with the rest of the quarter’s interest on 1 June',
      'a7: a $600 breakfast catered on 31 March, to be invoiced on 2 April',
      'a3: depreciation of $200 on the equipment',
      'a1: $150 of the prepaid insurance policy expired',
      'a2: $900 of supplies used',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'No later payment will record depreciation again, so reversing it would simply cancel a correct expense.',
      4: 'The insurance was paid in March and no later payment will record this expense; reversing would put the $150 back into Prepaid Insurance wrongly.',
      5: 'The supplies were paid for (or owed) when bought; reversing the adjustment would restore supplies that have been used.',
    },
    solution: 'Reversing entries are used for accruals, the adjustments that a later cash payment or receipt will settle: accrued wages (a5), accrued interest (a6) and accrued revenue (a7). Reversing them lets the later payment or invoice be recorded the routine way. Deferral adjustments and depreciation (a1, a2, a3) are never settled by a later transaction, so reversing them would only undo correct adjustments.',
  },
  {
    id: 'f01-dg-12', lesson: 'accounting-cycle', type: 'journal', kind: 'applied', chart: 'f01', date: '2026-03-31',
    prompt: 'Suppose Lantern’s bookkeeper recorded the 10 March advertising payment as debit Advertising Expense $530, credit Cash $530, although the bank shows that $350 was paid. The error is found on 31 March, before the adjusting entries. Record the correcting entry.',
    accounts: ['Cash', 'Advertising Expense', 'Prepaid Advertising', 'Accounts Payable', 'Miscellaneous Expense'],
    lines: [{ acct: 'Cash', dr: 180 }, { acct: 'Advertising Expense', cr: 180 }],
    solution: 'Compare what was recorded with what should have been. Recorded: debit Advertising Expense 530, credit Cash 530. Correct: debit Advertising Expense 350, credit Cash 350. Both accounts are overstated by 530 − 350 = $180, so the correcting entry takes $180 out of each: debit Cash 180, credit Advertising Expense 180. A difference of 180 is divisible by 9, as a transposition (350 written as 530) always is, but the trial balance would not have shown this error, because both sides were wrong by the same amount.',
  },
];

// Start at module N if the student scores at least 80% on the items for the modules before N.
export const route = [
  { module: 2, ifAtLeast: 0.8 },
  { module: 3, ifAtLeast: 0.8 },
  { module: 4, ifAtLeast: 0.8 },
];
