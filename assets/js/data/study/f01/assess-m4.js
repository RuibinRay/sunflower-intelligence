// assess-m4.js — F01 module 4 test: Closing the books (closing entries; the complete accounting cycle).
// New questions, not copies of lesson exercises. No hints; solutions show in review.
// Lantern errors here are hypothetical (“Suppose…”); March figures agree with case.js.

export const items = [
  // ---------------------------------------------------------------- closing-entries
  {
    id: 'f01-m4-1', lesson: 'closing-entries', type: 'journal', kind: 'numerical', chart: 'f01', date: '2026-09-30',
    prompt: 'A fictional wedding-catering company closes its year on 30 September 2026. Its expense accounts show Supplies Expense $84,600, Wages Expense $121,300, Rent Expense $24,000, Fuel Expense $6,850 and Depreciation Expense $12,500. Record the entry that closes the expense accounts to Income Summary.',
    accounts: ['Supplies Expense', 'Wages Expense', 'Rent Expense', 'Fuel Expense', 'Depreciation Expense', 'Supplies', 'Accumulated Depreciation—Van', 'Income Summary', 'Retained Earnings'],
    lines: [{ acct: 'Income Summary', dr: 249250 }, { acct: 'Supplies Expense', cr: 84600 }, { acct: 'Wages Expense', cr: 121300 }, { acct: 'Rent Expense', cr: 24000 }, { acct: 'Fuel Expense', cr: 6850 }, { acct: 'Depreciation Expense', cr: 12500 }],
    solution: 'Each expense has a debit balance, so each is credited for that balance. Income Summary is debited for the total: 84,600 + 121,300 + 24,000 + 6,850 + 12,500 = $249,250. Supplies and Accumulated Depreciation—Van are balance-sheet accounts and are not closed.',
  },
  {
    id: 'f01-m4-2', lesson: 'closing-entries', type: 'journal', kind: 'applied', chart: 'f01', date: '2026-12-31',
    prompt: 'After closing its revenue and expense accounts for 2026, a fictional driving school’s Income Summary shows credits of $96,400 and debits of $101,150. Record the entry that closes Income Summary.',
    accounts: ['Income Summary', 'Retained Earnings', 'Dividends', 'Training Revenue', 'Cash'],
    lines: [{ acct: 'Retained Earnings', dr: 4750 }, { acct: 'Income Summary', cr: 4750 }],
    solution: 'Debits exceed credits by 101,150 − 96,400 = $4,750, so Income Summary has a debit balance: a net loss. Close it on the opposite side, crediting Income Summary 4,750, and debit Retained Earnings 4,750, because a loss reduces retained earnings.',
  },
  {
    id: 'f01-m4-3', lesson: 'closing-entries', type: 'num', kind: 'numerical',
    prompt: 'A fictional coding school had Retained Earnings of $48,300 at the start of its year. For the year, revenue was $412,000, expenses $389,750 and dividends $15,000. What is the balance of Retained Earnings after the closing entries are posted?',
    answer: 55550, check: () => 48300 + (412000 - 389750) - 15000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 70550, say: 'You closed net income but not the dividends. Dividends are closed to Retained Earnings too.' },
      { value: 7250, say: 'That is the change in Retained Earnings (net income less dividends). Add it to the opening balance.' },
      { value: 33300, say: 'You left out the year’s net income of $22,250, which closing moves into Retained Earnings.' },
    ],
    solution: 'Net income = 412,000 − 389,750 = 22,250. Retained Earnings after closing = 48,300 + 22,250 − 15,000 = $55,550.',
  },
  {
    id: 'f01-m4-4', lesson: 'closing-entries', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these accounts can appear, with a balance, on a post-closing trial balance? Select all that apply.',
    options: ['Unearned Revenue', 'Interest Revenue', 'Accumulated Depreciation—Van', 'Income Summary', 'Retained Earnings', 'Fuel Expense', 'Interest Receivable', 'Dividends'],
    answer: [0, 2, 4, 6],
    feedback: {
      1: 'Interest Revenue is a revenue account and is closed in the first closing entry.',
      3: 'Income Summary is zero after the third closing entry.',
      5: 'Fuel Expense is closed in the second closing entry.',
      7: 'Dividends is temporary and is closed to Retained Earnings.',
    },
    solution: 'Only permanent accounts remain after closing: Unearned Revenue (a liability), Accumulated Depreciation—Van (a contra-asset), Retained Earnings and Interest Receivable (an asset). Revenue, expense, Dividends and Income Summary accounts are all zero.',
  },
  {
    id: 'f01-m4-5', lesson: 'closing-entries', type: 'mc', kind: 'conceptual',
    prompt: 'Suppose Lantern closed its $300 Dividends account to Income Summary instead of to Retained Earnings, and then closed Income Summary to Retained Earnings as usual. What would the result be?',
    options: [
      'Income Summary’s balance would be $690 instead of the $990 of net income, although Retained Earnings would still end at $690.',
      'Retained Earnings would end at $390.',
      'Net income on the income statement would fall to $690.',
      'The post-closing trial balance would not balance.',
    ],
    answer: 0,
    feedback: {
      1: 'The $300 is subtracted only once, inside Income Summary, so Retained Earnings still ends at 990 − 300 = 690.',
      2: 'The income statement was prepared before closing and still reports $990. Only the closing entry misstates it.',
      3: 'Every entry balances, so the trial balance does too. The error is in what Income Summary represents.',
    },
    solution: 'Income Summary would hold 7,100 − 6,110 − 300 = $690, so entry 3 would record $690 as if it were the period’s net income, and Income Summary would no longer agree with the income statement’s $990. Retained Earnings happens to end at the right $690, but the check Income Summary provides is lost. Dividends should be closed directly to Retained Earnings.',
  },
  // ---------------------------------------------------------------- accounting-cycle
  {
    id: 'f01-m4-6', lesson: 'accounting-cycle', type: 'order', kind: 'conceptual',
    prompt: 'Put these end-of-period tasks in the order they are done.',
    items: [
      'Prepare the unadjusted trial balance',
      'Record and post adjusting entries',
      'Prepare the adjusted trial balance',
      'Prepare the financial statements',
      'Record and post closing entries',
      'Prepare the post-closing trial balance',
      'Record reversing entries for accruals, on the first day of the next period',
    ],
    solution: 'Unadjusted trial balance, adjusting entries, adjusted trial balance, statements, closing entries, post-closing trial balance, and finally (optionally) reversing entries on the first day of the new period. The statements need adjusted balances, closing must wait for the statements, and reversals belong to the next period.',
  },
  {
    id: 'f01-m4-7', lesson: 'accounting-cycle', type: 'journal', kind: 'applied', chart: 'f01', date: '2026-03-31',
    prompt: 'Suppose Lantern recorded its 18 March payment of $1,000 to its supplier as a purchase of supplies (debit Supplies 1,000, credit Cash 1,000) instead of a payment of the amount it owed. The error is found on 31 March, before the adjusting entries. Record the correcting entry.',
    accounts: ['Supplies', 'Supplies Expense', 'Accounts Payable', 'Cash', 'Prepaid Insurance'],
    lines: [{ acct: 'Accounts Payable', dr: 1000 }, { acct: 'Supplies', cr: 1000 }],
    solution: 'Made: debit Supplies 1,000, credit Cash 1,000. Should have been: debit Accounts Payable 1,000, credit Cash 1,000. Cash is right in both and drops out. The correction moves the debit: debit Accounts Payable 1,000, credit Supplies 1,000. Fixing it before the supplies count matters: otherwise the adjustment (a2) would have expensed $1,000 of supplies that never existed.',
  },
  {
    id: 'f01-m4-8', lesson: 'accounting-cycle', type: 'num', kind: 'numerical',
    prompt: 'A fictional ski resort pays interest on a bank loan every six months. At 31 December it accrued $5,400 of interest for November and December, and on 1 January it reversed the accrual. On 30 April it paid $16,200 of interest for November to April and recorded the whole payment as Interest Expense. What net interest expense does this payment add to the period from 1 January to 30 April?',
    answer: 10800, check: () => 16200 - 5400, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 16200, say: 'You have ignored the reversing entry, which credited Interest Expense $5,400 on 1 January.' },
      { value: 5400, say: 'That is the interest for November and December, which belonged to last year.' },
      { value: 21600, say: 'The reversal is a credit to Interest Expense, so it reduces this year’s expense rather than adding to it.' },
    ],
    solution: 'The reversal credits Interest Expense 5,400; the payment debits it 16,200. Net: 16,200 − 5,400 = $10,800, which is four months (January to April) at 16,200 ÷ 6 = 2,700 a month.',
  },
  {
    id: 'f01-m4-9', lesson: 'accounting-cycle', type: 'mc', kind: 'applied',
    prompt: 'At a fictional clothing brand, the warehouse supervisor receives deliveries of stock, records them in the stock system and counts the stock at the year end. Which change best reduces the risk that missing stock goes unnoticed?',
    options: [
      'Have someone independent of the warehouse count the stock at the year end.',
      'Ask the supervisor to count the stock twice.',
      'Close the books every month instead of once a year, so that errors are caught sooner.',
      'Prepare a post-closing trial balance after the count, to check that the stock figure balances.',
    ],
    answer: 0,
    feedback: {
      1: 'Counting twice repeats the check by the same person, who also holds the stock and keeps its records.',
      2: 'How often the books are closed doesn’t separate custody of the stock from the records of it.',
      3: 'A trial balance checks arithmetic, not whether the recorded stock physically exists.',
    },
    solution: 'The supervisor has custody of the stock, records it and checks it, so a shortage could be hidden. An independent count separates the check from custody and recording: segregation of duties, applied through an independent reconciliation of the records with what is physically there.',
  },
  {
    id: 'f01-m4-10', lesson: 'accounting-cycle', type: 'num', kind: 'applied',
    prompt: 'A fictional online retailer’s adjusted trial balance at 31 December shows net income of $58,400. Before closing, a review finds two errors. A $3,000 computer bought on 1 December was recorded as Miscellaneous Expense; it should be Equipment, with a five-year life, no residual value and depreciation of $50 for December. And $1,200 of rent paid in advance on 30 November for December is still in Prepaid Rent. What is the corrected net income?',
    answer: 60150, check: () => 58400 + 3000 - 3000 / 5 / 12 - 1200, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 61400, say: 'You removed the computer from expenses but forgot its December depreciation and the expired rent.' },
      { value: 60200, say: 'Once the computer is equipment it must be depreciated: December’s $50 is an expense.' },
      { value: 61350, say: 'December’s rent has been used up, so the $1,200 must move from Prepaid Rent to Rent Expense, reducing net income.' },
    ],
    solution: 'Moving the computer to Equipment removes a $3,000 expense; December depreciation adds 3,000 ÷ 5 ÷ 12 = $50; the expired rent adds $1,200 of Rent Expense. Corrected net income = 58,400 + 3,000 − 50 − 1,200 = $60,150. The corrections go in before closing, while the year’s revenue and expense accounts are still open.',
  },
];
