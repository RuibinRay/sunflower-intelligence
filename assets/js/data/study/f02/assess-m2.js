// assess-m2.js — F02 module 2 test: The balance sheet (receivables and payables, long-lived assets, the balance sheet
// and equity). New questions, not copies of lesson exercises: other businesses, other numbers, other angles.
// No hints; solutions show in review. Every business here is fictional.

export const items = [
  // ---------------------------------------------------------------- receivables-and-payables
  {
    id: 'f02-m2-1', lesson: 'receivables-and-payables', type: 'num', kind: 'numerical',
    prompt: 'A fictional veterinary practice’s aging at 31 December says its allowance for doubtful accounts should be $3,360, and its year-end adjusting entry debited Bad Debt Expense $3,770. What was the allowance’s balance before the adjustment? Enter a credit balance as a positive number and a debit balance as a negative number, to the nearest dollar.',
    answer: -410, check: () => 3360 - 3770, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 410, say: 'The expense is larger than the balance required, so the account must have started below zero: a debit balance, entered as −410.' },
      { value: 7130, say: 'Expense = required balance − unadjusted balance, so unadjusted balance = 3,360 − 3,770.' },
    ],
    solution: 'Expense = required − unadjusted, so unadjusted = 3,360 − 3,770 = −410: a debit balance of $410. Write-offs during the year exceeded what the allowance held, and the adjustment had to cover that as well as the $3,360 required.',
  },
  {
    id: 'f02-m2-2', lesson: 'receivables-and-payables', type: 'journal', kind: 'applied', chart: 'f02', date: '2026-03-31',
    prompt: 'A fictional office-equipment dealer holds a customer’s $9,000, four-month note at 9% a year. The interest for the full term, $270, has already been accrued in Interest Receivable. On the maturity date, 31 March 2026, the customer fails to pay. Record the entry that moves the dishonoured note and its interest into Accounts Receivable.',
    accounts: ['Accounts Receivable', 'Notes Receivable', 'Interest Receivable', 'Interest Revenue', 'Allowance for Doubtful Accounts', 'Bad Debt Expense', 'Cash'],
    lines: [{ acct: 'Accounts Receivable', dr: 9270 }, { acct: 'Notes Receivable', cr: 9000 }, { acct: 'Interest Receivable', cr: 270 }],
    solution: 'The customer still owes principal and interest, now as an overdue account: debit Accounts Receivable 9,270; credit Notes Receivable 9,000 and Interest Receivable 270. No revenue is added (the interest was earned and accrued already) and nothing is written off yet; the dealer pursues the debt, and the allowance absorbs it later if it proves uncollectible.',
  },
  {
    id: 'f02-m2-3', lesson: 'receivables-and-payables', type: 'mc', kind: 'conceptual',
    prompt: 'Under the current expected credit loss (CECL) model of ASC 326, which statement about a company’s trade receivables at its year end is correct?',
    options: [
      'The allowance reflects losses expected over the receivables’ remaining life, even if no customer has yet defaulted.',
      'No allowance is recorded until a loss is probable and has already been incurred.',
      'The allowance must be set as a percentage of the year’s credit sales.',
      'Receivables are shown at the full amount invoiced, and the expected losses are disclosed only in a note to the statements.',
    ],
    answer: 0,
    feedback: {
      1: 'That describes the older incurred-loss approach that CECL replaced. CECL records expected losses before any default.',
      2: 'CECL accepts several methods, aging schedules among them; it doesn’t prescribe a percentage of sales.',
      3: 'The allowance is deducted from receivables to present the net amount expected to be collected.',
    },
    solution: 'CECL measures the allowance as the losses expected over the receivables’ contractual life, using history adjusted for current conditions and reasonable and supportable forecasts, and deducts it to show the net amount expected to be collected.',
  },
  {
    id: 'f02-m2-4', lesson: 'receivables-and-payables', type: 'num', kind: 'numerical',
    prompt: 'A fictional catering-equipment supplier’s allowance for doubtful accounts had a credit balance of $5,200 on 1 January. Bad debt expense for the year was $7,900, there were no recoveries, and the balance on 31 December, after the adjustment, is $6,100. How much was written off during the year? Round to the nearest dollar.',
    answer: 7000, check: () => 5200 + 7900 - 6100, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 8800, say: 'Work through the allowance account: opening credit + expense (credits) − write-offs (debits) = closing credit. 5,200 + 7,900 − 6,100.' },
      { value: 1800, say: 'That is the expense less the closing balance; the opening balance was also available to absorb write-offs.' },
    ],
    solution: 'Allowance: 5,200 + 7,900 − write-offs = 6,100, so write-offs = $7,000.',
  },

  // ---------------------------------------------------------------- long-lived-assets
  {
    id: 'f02-m2-5', lesson: 'long-lived-assets', type: 'num', kind: 'numerical',
    prompt: 'A fictional printing company depreciates a press costing $50,000, with a ten-year life and a $5,000 residual value, by the 150% declining-balance method, starting with a full year. What is depreciation in the second year? Give dollars and cents if needed.',
    answer: 6375, check: () => (50000 - 50000 * 0.15) * 0.15, unit: '$', places: 2, tol: 0.5,
    wrong: [
      { value: 8000, say: 'That is double-declining balance (20%). The 150% method uses 1.5 × 10% = 15%.' },
      { value: 5737.5, say: 'Declining-balance methods apply the rate to book value without deducting the residual value.' },
      { value: 7500, say: 'That is the first year. In year two the rate applies to the lower book value, 42,500.' },
    ],
    solution: 'Rate = 1.5 × (1 ÷ 10) = 15%. Year 1: 50,000 × 0.15 = 7,500; book value 42,500. Year 2: 42,500 × 0.15 = $6,375.',
  },
  {
    id: 'f02-m2-6', lesson: 'long-lived-assets', type: 'journal', kind: 'applied', chart: 'f02', date: '2026-07-31',
    prompt: 'A fictional brewery sells a canning machine that cost $64,000. Depreciation has been brought up to the date of sale, and accumulated depreciation is $41,600. Instead of cash, the buyer gives the brewery a note receivable for $26,000. Record the sale.',
    accounts: ['Notes Receivable', 'Cash', 'Equipment', 'Accumulated Depreciation—Equipment', 'Gain on Sale of Equipment', 'Loss on Sale of Equipment', 'Depreciation Expense'],
    lines: [{ acct: 'Notes Receivable', dr: 26000 }, { acct: 'Accumulated Depreciation—Equipment', dr: 41600 }, { acct: 'Equipment', cr: 64000 }, { acct: 'Gain on Sale of Equipment', cr: 3600 }],
    solution: 'Book value = 64,000 − 41,600 = 22,400; proceeds (the note) 26,000; gain 3,600. Debit Notes Receivable 26,000 and Accumulated Depreciation—Equipment 41,600; credit Equipment 64,000 and Gain on Sale of Equipment 3,600.',
  },
  {
    id: 'f02-m2-7', lesson: 'long-lived-assets', type: 'mc', kind: 'applied',
    prompt: 'A fictional ferry operator’s ticket machine has a carrying amount of $80,000. Its expected future cash flows are $85,000 undiscounted, with a present value (value in use) of $74,000. It could be sold for $70,000, less $1,000 of selling costs. What impairment loss is recognised under each framework?',
    options: [
      'US GAAP: none; IFRS: $6,000',
      'US GAAP: $10,000; IFRS: $6,000',
      'US GAAP: none; IFRS: none',
      'US GAAP: $10,000; IFRS: $11,000',
    ],
    answer: 0,
    feedback: {
      1: 'US GAAP writes down only if the undiscounted cash flows ($85,000) are below the carrying amount. They are not, so there is no loss.',
      2: 'IAS 36 compares the carrying amount with the recoverable amount, the higher of $69,000 and $74,000. At $74,000 it is below $80,000.',
      3: 'IFRS uses the higher of fair value less costs of disposal and value in use, not the lower.',
    },
    solution: 'US GAAP: step one compares $80,000 with undiscounted cash flows of $85,000; the asset is recoverable, so no loss. IFRS: recoverable amount = higher of 69,000 and 74,000 = 74,000; loss = 80,000 − 74,000 = $6,000.',
  },
  {
    id: 'f02-m2-8', lesson: 'long-lived-assets', type: 'classify', kind: 'conceptual',
    prompt: 'For each situation, does the company apply the change from now on, or correct an earlier period?',
    items: [
      'A machine expected to last ten years will now be replaced after seven',
      'Last year’s depreciation was calculated on the wrong cost because of a typing error',
      'The residual value of a fleet of vans is cut because second-hand prices have fallen',
      'The company moves a machine from straight line to units of production because its use has become irregular',
      'A new building was expensed in full last year instead of being capitalised',
    ],
    categories: ['Change in estimate: apply from now on', 'Error: correct the earlier period'],
    answer: [0, 1, 0, 0, 1],
    feedback: {
      1: 'A mistake in applying information that was available is an error, corrected in the period it affected.',
      3: 'A change of depreciation method that reflects a new pattern of use is treated as a change in estimate (under US GAAP, one effected by a change in principle) and applied prospectively.',
      4: 'Expensing a building was a misapplication of the rules, not a new estimate: it is corrected.',
    },
    solution: 'New information about life, residual value or the pattern of use changes estimates, which are applied prospectively. Mistakes (a wrong cost, a building expensed) are errors and are corrected in the earlier period.',
  },

  // ---------------------------------------------------------------- balance-sheet-and-equity
  {
    id: 'f02-m2-9', lesson: 'balance-sheet-and-equity', type: 'num', kind: 'numerical',
    prompt: 'At 31 December a fictional garden centre has current assets of $72,000, accounts payable of $21,000, accrued liabilities of $4,500, a dividend of $6,000 declared on 20 December and payable on 15 January, and a $150,000 mortgage of which $9,000 of principal is due within the next year. What is its current ratio? Round to two decimal places.',
    answer: 1.78, check: () => 72000 / (21000 + 4500 + 6000 + 9000), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 2.82, say: 'Both the dividend payable and the mortgage’s current portion are current liabilities.' },
      { value: 2.09, say: 'The $9,000 of mortgage principal due within the year is a current liability.' },
      { value: 2.29, say: 'A dividend declared but unpaid is a current liability, Dividends Payable.' },
    ],
    solution: 'Current liabilities = 21,000 + 4,500 + 6,000 + 9,000 = 40,500. Current ratio = 72,000 ÷ 40,500 ≈ 1.78.',
  },
  {
    id: 'f02-m2-10', lesson: 'balance-sheet-and-equity', type: 'journal', kind: 'applied', chart: 'f02', date: '2026-04-15',
    prompt: 'A fictional landscaping corporation issues 4,000 shares of $1 par common stock to the owner of a delivery van in exchange for the van, whose fair value is $36,000. The shares have no reliable market price. Record the issue.',
    accounts: ['Van', 'Cash', 'Common Stock', 'Additional Paid-in Capital', 'Retained Earnings', 'Notes Payable'],
    lines: [{ acct: 'Van', dr: 36000 }, { acct: 'Common Stock', cr: 4000 }, { acct: 'Additional Paid-in Capital', cr: 32000 }],
    solution: 'Record the van at the more reliable value, its fair value of $36,000. Common Stock = 4,000 × $1 = 4,000; APIC = 36,000 − 4,000 = 32,000. Debit Van 36,000; credit Common Stock 4,000 and Additional Paid-in Capital 32,000.',
  },
  {
    id: 'f02-m2-11', lesson: 'balance-sheet-and-equity', type: 'num', kind: 'applied',
    prompt: 'A lender reviewing a fictional furniture retailer sees retained earnings of $140,000 at the start of 2026 and $171,500 at the end. Net income for 2026 was $52,000, and nothing else affected retained earnings except dividends. What dividends were declared in 2026? Round to the nearest dollar.',
    answer: 20500, check: () => 140000 + 52000 - 171500, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 31500, say: 'That is the increase in retained earnings, which is net income minus dividends.' },
      { value: 83500, say: 'Dividends reduce retained earnings: beginning + net income − dividends = ending.' },
    ],
    solution: 'Ending = beginning + net income − dividends, so dividends = 140,000 + 52,000 − 171,500 = $20,500.',
  },
  {
    id: 'f02-m2-12', lesson: 'balance-sheet-and-equity', type: 'multi', kind: 'conceptual',
    prompt: 'A company has current assets of $200,000 and current liabilities of $100,000, a current ratio of 2.0. Which of these transactions would change its current ratio? Select all that apply.',
    options: [
      'Paying $20,000 of accounts payable in cash',
      'Reclassifying $10,000 of a long-term loan as current',
      'Buying equipment for $15,000 in cash',
      'Borrowing $30,000 on a five-year loan',
      'Recording $8,000 of depreciation',
      'Writing off a $1,000 receivable against the allowance',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'Depreciation reduces a noncurrent asset; current assets and liabilities are unchanged.',
      5: 'Receivables and the allowance fall together; net current assets are unchanged.',
    },
    solution: 'Paying payables (2.25), reclassifying debt (200,000 ÷ 110,000 ≈ 1.82), buying equipment for cash (185,000 ÷ 100,000 = 1.85) and borrowing long-term (230,000 ÷ 100,000 = 2.3) all change the ratio. Depreciation and a write-off against an adequate allowance do not.',
  },
];
