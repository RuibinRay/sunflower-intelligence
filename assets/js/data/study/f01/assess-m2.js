// assess-m2.js — F01 module 2 test: Double-entry recording (debits and credits, journal entries, the general ledger,
// the trial balance). New questions, not copies of lesson exercises. No hints; solutions show in review.
// Lantern’s April transactions here are hypothetical (“Suppose…”); March figures agree with case.js.

export const items = [
  // ---------------------------------------------------------------- debits-and-credits
  {
    id: 'f01-m2-1', lesson: 'debits-and-credits', type: 'classify', kind: 'conceptual',
    prompt: 'What is the normal balance of each account?',
    items: ['Prepaid Insurance', 'Unearned Revenue', 'Dividends', 'Accumulated Depreciation—Equipment', 'Training Revenue', 'Utilities Expense', 'Notes Payable'],
    categories: ['Debit', 'Credit'],
    answer: [0, 1, 0, 1, 1, 0, 1],
    feedback: {
      1: 'Unearned Revenue is a liability (service owed to a customer), so it increases with credits.',
      2: 'Dividends reduce equity, so they take the side opposite equity: a debit. They are still not an expense.',
      3: 'A contra-asset reduces an asset, so it takes the opposite normal balance: a credit.',
    },
    solution: 'Assets (Prepaid Insurance), expenses (Utilities Expense) and Dividends have debit balances. Liabilities (Unearned Revenue, Notes Payable), revenue (Training Revenue) and contra-assets (Accumulated Depreciation—Equipment) have credit balances. The rule comes from the equation: each account increases on the side where it sits, and accounts that reduce another take its opposite side.',
  },
  {
    id: 'f01-m2-2', lesson: 'debits-and-credits', type: 'mc', kind: 'conceptual',
    prompt: 'A new bookkeeper says: “We debited Cash $3,000 when Meridian Partners paid its invoice, so Lantern had a $3,000 expense that day.” What is wrong with this reasoning?',
    options: [
      'A debit is the left side of an account and nothing more. For an asset such as Cash it records an increase, not an expense.',
      'Nothing: every debit records an expense.',
      'Cash should have been credited, because money came in.',
      'The $3,000 should have been debited to Catering Revenue instead.',
    ],
    answer: 0,
    feedback: {
      1: 'Debits also record increases in assets and dividends and decreases in liabilities, equity and revenue. Debit means left, nothing more.',
      2: 'Cash is an asset, and assets increase on the debit side. A receipt of cash is a debit to Cash.',
      3: 'The revenue was recorded on 12 March when the conference was catered. Collecting the invoice reduces Accounts Receivable; it doesn’t touch revenue.',
    },
    solution: 'The entry is debit Cash $3,000, credit Accounts Receivable $3,000: one asset rises and another falls. No expense is involved. “Debit” and “credit” name the left and right sides of an account; what they do to the balance depends on the type of account.',
  },
  {
    id: 'f01-m2-3', lesson: 'debits-and-credits', type: 'num', kind: 'numerical',
    prompt: 'Suppose Lantern’s Accounts Receivable account begins April with a debit balance of $1,200. During April it is debited $5,600 and $2,350 for invoices sent, and credited for cash collected from customers. Its balance at 30 April is $2,780 (debit). How much did Lantern collect from customers in April?',
    answer: 6370, check: () => 1200 + 5600 + 2350 - 2780, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 5170, say: 'You left out the opening balance of $1,200. Collections can include amounts owed from March.' },
      { value: 11930, say: 'You added the ending balance. Collections are what was taken out: opening balance plus invoices, minus what is still owed.' },
    ],
    solution: 'For a debit-normal account, opening balance + debits − credits = ending balance. So credits = 1,200 + 5,600 + 2,350 − 2,780 = $6,370 collected.',
  },

  // ---------------------------------------------------------------- journal-entries
  {
    id: 'f01-m2-4', lesson: 'journal-entries', type: 'journal', kind: 'applied', chart: 'f01', date: '2026-04-07',
    prompt: 'Suppose that on 7 April a company pays Lantern $900 for a barista-training workshop Lantern will run on 20 April. Record the entry on 7 April.',
    accounts: ['Cash', 'Accounts Receivable', 'Unearned Revenue', 'Training Revenue', 'Accounts Payable'],
    lines: [{ acct: 'Cash', dr: 900 }, { acct: 'Unearned Revenue', cr: 900 }],
    solution: 'Cash (an asset) increases: debit Cash $900. Lantern hasn’t run the workshop yet, so it hasn’t earned revenue; it owes the workshop or a refund, a liability: credit Unearned Revenue $900. On 20 April, when the workshop runs, Unearned Revenue is debited and Training Revenue credited.',
  },
  {
    id: 'f01-m2-5', lesson: 'journal-entries', type: 'journal', kind: 'applied', chart: 'f01', date: '2026-04-09',
    prompt: 'Suppose that on 9 April Lantern buys a $2,500 cold-brew tower, which it expects to use for several years. It pays $1,000 in cash and agrees to pay the supplier the rest in 30 days. Record the entry.',
    accounts: ['Equipment', 'Supplies', 'Repairs Expense', 'Cash', 'Accounts Payable', 'Notes Payable'],
    lines: [{ acct: 'Equipment', dr: 2500 }, { acct: 'Cash', cr: 1000 }, { acct: 'Accounts Payable', cr: 1500 }],
    solution: 'A compound entry. The tower will serve for years, so it is equipment (an asset): debit Equipment $2,500. Cash falls by $1,000: credit Cash. Lantern owes the supplier 2,500 − 1,000 = $1,500 on ordinary 30-day terms: credit Accounts Payable $1,500. Debits 2,500 = credits 1,000 + 1,500.',
  },
  {
    id: 'f01-m2-6', lesson: 'journal-entries', type: 'journal', kind: 'applied', chart: 'f01', date: '2026-04-14',
    prompt: 'Suppose that on 14 April Lantern caters a product launch for $2,400. The client pays $600 on the day and is invoiced for the rest, due in 30 days. Record the entry.',
    accounts: ['Cash', 'Accounts Receivable', 'Catering Revenue', 'Unearned Revenue', 'Training Revenue'],
    lines: [{ acct: 'Cash', dr: 600 }, { acct: 'Accounts Receivable', dr: 1800 }, { acct: 'Catering Revenue', cr: 2400 }],
    solution: 'A compound entry with two debits. The service has been delivered, so the whole $2,400 is earned now: credit Catering Revenue $2,400. Lantern received $600 (debit Cash) and is owed 2,400 − 600 = $1,800 (debit Accounts Receivable). Debits 600 + 1,800 = credit 2,400.',
  },

  // ---------------------------------------------------------------- general-ledger
  {
    id: 'f01-m2-7', lesson: 'general-ledger', type: 'journal', kind: 'applied', chart: 'f01', date: '2026-04-24',
    prompt: 'Suppose that in Lantern’s April ledger, Cash (101) shows a credit of $1,200 dated 24 April with reference J4; Accounts Payable (201) shows a debit of $500 and Supplies (120) a debit of $700, both dated 24 April with reference J4. Reconstruct the journal entry on page J4 from these postings.',
    accounts: ['Cash', 'Accounts Payable', 'Supplies', 'Supplies Expense', 'Accounts Receivable'],
    lines: [{ acct: 'Accounts Payable', dr: 500 }, { acct: 'Supplies', dr: 700 }, { acct: 'Cash', cr: 1200 }],
    solution: 'Posting copies each journal line to its account on the same side, so the postings that share the date and reference J4 rebuild the entry: debit Accounts Payable $500, debit Supplies $700, credit Cash $1,200. Read as a transaction, Lantern paid the $500 it owed the supplies vendor and bought $700 of new supplies, paying $1,200 in all. Paying the old bill is not an expense; the new supplies are an asset until used.',
  },
  {
    id: 'f01-m2-8', lesson: 'general-ledger', type: 'num', kind: 'numerical',
    prompt: 'Suppose Lantern’s Cash account (101), kept in balance-column form, starts April with a debit balance of $26,650. Its April postings, in date order, are: credit $8,000; debit $1,200; credit $1,400; debit $3,600; credit $1,200. What is the balance after the last posting?',
    answer: 20850, check: () => 26650 - 8000 + 1200 - 1400 + 3600 - 1200, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 32450, say: 'You reversed the rule. Cash is an asset: debits add to its balance and credits subtract.' },
      { value: -5800, say: 'You left out the opening balance. A running balance starts from the balance brought forward.' },
    ],
    solution: 'Debit-normal account: add debits, subtract credits, one posting at a time. 26,650 − 8,000 = 18,650; + 1,200 = 19,850; − 1,400 = 18,450; + 3,600 = 22,050; − 1,200 = $20,850. Check by totals: debits 26,650 + 1,200 + 3,600 = 31,450; credits 8,000 + 1,400 + 1,200 = 10,600; 31,450 − 10,600 = 20,850.',
  },
  {
    id: 'f01-m2-9', lesson: 'general-ledger', type: 'num', kind: 'numerical',
    prompt: 'A fictional online retailer’s Accounts Payable control account shows $41,380, but its supplier accounts total $40,930. Investigation shows that one supplier bill was posted to the control account twice, and to the supplier’s account once. What was the amount of the bill?',
    answer: 450, check: () => 41380 - 40930, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 225, say: 'Halving applies when an amount is on the wrong side. A bill posted twice adds its amount once too often, so the difference equals the bill.' },
      { value: 900, say: 'The extra posting adds the bill’s amount once, not twice. The control account is too high by exactly one bill.' },
    ],
    solution: 'The control account is 41,380 − 40,930 = $450 higher than the supplier accounts. The duplicate posting added the bill once too often, so the bill was $450. Removing the duplicate brings the control account to $40,930.',
  },

  // ---------------------------------------------------------------- trial-balance
  {
    id: 'f01-m2-10', lesson: 'trial-balance', type: 'num', kind: 'numerical',
    prompt: 'Suppose Lantern’s trial balance at 30 April shows debits of $58,734 and credits of $59,904. The bookkeeper has established that the only error is one balance listed in the wrong column. What is that balance?',
    answer: 585, check: () => (59904 - 58734) / 2, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 1170, say: 'That is the difference. A balance in the wrong column shifts both totals, so the difference is twice the balance.' },
      { value: 130, say: 'That is the difference divided by 9, the test for transpositions and slides. For a wrong-column balance, halve the difference.' },
    ],
    solution: 'Difference = 59,904 − 58,734 = $1,170. A balance in the wrong column leaves a difference of twice its amount, so the balance is 1,170 ÷ 2 = $585. The credit column is larger, so it is a debit balance listed as a credit.',
  },
  {
    id: 'f01-m2-11', lesson: 'trial-balance', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these mistakes in Lantern’s March records would make the trial balance totals differ? Select all that apply.',
    options: [
      'The $300 dividend posted as a debit to Dividends and as a debit to Cash',
      'March rent posted to Advertising Expense',
      'The Equipment balance of $12,000 copied onto the trial balance as $1,200',
      'Harbor Tech’s deposit recorded as a debit to Cash and a credit to Catering Revenue',
      'The whole 18 March payment to the supplies vendor left out of the journal',
      'Utilities Expense left off the trial balance',
    ],
    answer: [0, 2, 5],
    feedback: {
      1: 'The rent is still a debit, just in the wrong expense account, so the debit total is unchanged.',
      3: 'Crediting revenue instead of Unearned Revenue is a serious error, but the credit is still a credit: the totals agree.',
      4: 'An omitted transaction removes both its debit and its credit, so both totals fall equally.',
    },
    solution: 'Two debits and no credit for the dividend leave a $600 difference; the Equipment slide leaves 12,000 − 1,200 = $10,800 (= 9 × 1,200); leaving Utilities off makes the debit column $260 short. Rent posted to the wrong expense, a deposit credited to the wrong account and an omitted transaction all keep debits equal to credits.',
  },
  {
    id: 'f01-m2-12', lesson: 'trial-balance', type: 'mc', kind: 'conceptual',
    prompt: 'Lantern’s unadjusted trial balance at 31 March has no line for Retained Earnings, although Lantern earned revenue and paid a dividend in March. Why?',
    options: [
      'Retained Earnings has a zero balance: Lantern began on 1 March, and March’s revenue, expenses and dividends stay in their own accounts until the books are closed.',
      'Retained Earnings is a total on the financial statements, not an account in the ledger.',
      'The bookkeeper made an error of omission, which the trial balance can’t detect.',
      'Retained Earnings appears only on the post-closing trial balance.',
    ],
    answer: 0,
    feedback: {
      1: 'Retained Earnings is a ledger account (320 in Lantern’s chart). It has no postings yet.',
      2: 'Nothing has been omitted: no March transaction affects Retained Earnings directly.',
      3: 'In later months Retained Earnings appears on every trial balance, with its balance at the start of the period on the unadjusted and adjusted ones.',
    },
    solution: 'A trial balance lists accounts with balances, and Retained Earnings has none in Lantern’s first month. Profit reaches Retained Earnings only through the closing entries, so until then revenue, expenses and dividends sit in their own accounts and appear on the trial balance individually.',
  },
];
