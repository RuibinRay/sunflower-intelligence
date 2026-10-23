// assess-final.js — F01 cumulative final: 25 items, every lesson at least twice, roughly a third each conceptual,
// numerical and applied. New questions, not copies of lesson exercises or module-test items. No hints; solutions
// show in review. 70% passes. Lantern’s April and later events here are hypothetical (“Suppose…”); March figures
// agree with case.js.

export const items = [
  // ---------------------------------------------------------------- what-is-accounting
  {
    id: 'f01-fn-1', lesson: 'what-is-accounting', type: 'mc', kind: 'applied',
    prompt: 'A fictional clothing brand changes the method it uses to depreciate its sewing machinery every year. Each year’s figures are free from error, and the notes explain each change. Which qualitative characteristic of its financial information suffers most?',
    options: ['Comparability', 'Timeliness', 'Verifiability', 'Relevance'],
    answer: 0,
    feedback: {
      1: 'Timeliness is about having information in time to influence decisions. Changing methods doesn’t delay the statements.',
      2: 'Verifiability means independent observers could agree the figures are faithfully represented. Each year’s figures are error-free and the method is disclosed, so they can still be checked.',
      3: 'The figures still bear on users’ decisions. What suffers is the ability to compare them from year to year, an enhancing characteristic.',
    },
    solution: 'Comparability lets users identify similarities and differences between periods and between businesses, and using the same methods from period to period (consistency) helps achieve it. Changing the depreciation method every year means a change in profit could come from the method rather than the business, so year-on-year comparisons become unreliable even though each year is accurate and disclosed.',
  },
  {
    id: 'f01-fn-2', lesson: 'what-is-accounting', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the description of who sets the rules and what makes information useful.',
    text: 'In the United States the standards known as US GAAP are written by the [[0]]; most other countries use IFRS, written by the [[1]]. Reports prepared for a business’s own managers belong to [[2]] accounting and follow no such external standards. Information is useful only if it has both fundamental qualitative characteristics: [[3]] and faithful representation.',
    blanks: [
      { options: ['SEC', 'FASB', 'IRS', 'IASB'], answer: 1 },
      { options: ['FASB', 'AICPA', 'IASB', 'SEC'], answer: 2 },
      { options: ['financial', 'tax', 'managerial'], answer: 2 },
      { options: ['comparability', 'relevance', 'timeliness', 'verifiability'], answer: 1 },
    ],
    solution: 'The Financial Accounting Standards Board (FASB) writes US GAAP; the SEC has legal authority over public companies’ reporting but recognises the FASB as the standard setter. The International Accounting Standards Board (IASB) writes IFRS. Internal reports are managerial accounting, shaped only by what helps the decision. The two fundamental characteristics are relevance and faithful representation; comparability, verifiability, timeliness and understandability are enhancing characteristics.',
  },

  // ---------------------------------------------------------------- accounts-and-classifications
  {
    id: 'f01-fn-3', lesson: 'accounts-and-classifications', type: 'num', kind: 'numerical',
    prompt: 'On 1 October 2026 a fictional hotel pays $54,000 for three years of booking-software licences, covering 1 October 2026 to 30 September 2029, and records it as a prepaid expense. How much of the prepayment is a noncurrent asset on its balance sheet at 31 December 2026?',
    answer: 31500, check: () => (54000 / 36) * (36 - 3 - 12), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 49500, say: 'That is the whole unexpired amount. The part that will be used in the next twelve months (2027) is a current asset.' },
      { value: 36000, say: 'You took out the current portion but not the three months (October to December 2026) already used up and expensed.' },
      { value: 18000, say: 'That is the current portion: the twelve months of 2027. The question asks for the part used after that.' },
    ],
    solution: 'The licences cost 54,000 ÷ 36 = $1,500 a month. By 31 December 2026, 3 months ($4,500) have been used, leaving $49,500. The next 12 months, $18,000, will be used within a year: current. The remaining 36 − 3 − 12 = 21 months (January 2028 to September 2029) are noncurrent: 21 × 1,500 = $31,500.',
  },
  {
    id: 'f01-fn-4', lesson: 'accounts-and-classifications', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each account from Lantern’s chart of accounts.',
    items: ['Accumulated Depreciation—Van', 'Notes Receivable', 'Interest Revenue', 'Unearned Revenue', 'Prepaid Advertising', 'Interest Payable', 'Fuel Expense', 'Common Stock'],
    categories: ['Asset', 'Contra-asset', 'Liability', 'Equity', 'Revenue', 'Expense'],
    answer: [1, 0, 4, 2, 0, 2, 5, 3],
    feedback: {
      0: 'Accumulated depreciation reduces the van’s cost to its book value: a contra-asset with a credit balance.',
      1: 'A note receivable is a written promise that someone will pay Lantern: an asset. (A note payable would be a liability.)',
      3: 'Despite its name, Unearned Revenue is not revenue: it is an obligation to deliver a service already paid for, a liability.',
      4: 'Advertising paid for but not yet run is a resource for future periods: an asset until it is used.',
    },
    solution: 'Accumulated Depreciation—Van: contra-asset. Notes Receivable: asset. Interest Revenue: revenue. Unearned Revenue: liability. Prepaid Advertising: asset. Interest Payable: liability. Fuel Expense: expense. Common Stock: equity. Names can mislead: “Unearned Revenue” is a liability and “Prepaid Advertising” an asset; classify by what the account represents, not the words in its name.',
  },

  // ---------------------------------------------------------------- accounting-equation
  {
    id: 'f01-fn-5', lesson: 'accounting-equation', type: 'equation', kind: 'applied',
    prompt: 'A fictional event-photography studio photographs a wedding for $3,000. Last month the couple paid a $1,000 deposit, which the studio recorded as unearned revenue. On the day they pay $1,500, and they will pay the remaining $500 next week. Enter the change in each side of the accounting equation on the wedding day (use a minus sign for a decrease and 0 for no change).',
    answer: { assets: 2000, liabilities: -1000, equity: 3000 },
    solution: 'The whole $3,000 is earned on the wedding day, so equity rises by $3,000. The deposit stops being owed: unearned revenue (a liability) falls by $1,000. Assets rise by the cash received ($1,500) plus the amount still owed ($500 of accounts receivable): +2,000. Check: 2,000 = −1,000 + 3,000.',
  },
  {
    id: 'f01-fn-6', lesson: 'accounting-equation', type: 'num', kind: 'numerical',
    prompt: 'A fictional bicycle-courier company began the year with assets of $84,000 and liabilities of $51,000. During the year it earned net income of $18,500 and issued $5,000 of new common stock. At the end of the year its assets were $97,000 and its liabilities $52,500. How much did it pay in dividends?',
    answer: 12000, check: () => { const eq0 = 84000 - 51000, eq1 = 97000 - 52500; return eq0 + 5000 + 18500 - eq1; }, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 11500, say: 'That is the increase in equity. Dividends are what is missing between that increase and what stock and profit added.' },
      { value: 7000, say: 'You left out the new stock. Equity was raised by $5,000 of stock as well as by net income, so dividends must have taken out more.' },
      { value: 2000, say: 'New stock increases equity, so it belongs with net income: dividends = 5,000 + 18,500 − 11,500.' },
    ],
    solution: 'Equity at the start = 84,000 − 51,000 = 33,000; at the end = 97,000 − 52,500 = 44,500. Ending equity = beginning equity + stock issued + net income − dividends, so dividends = 33,000 + 5,000 + 18,500 − 44,500 = $12,000.',
  },

  // ---------------------------------------------------------------- debits-and-credits
  {
    id: 'f01-fn-7', lesson: 'debits-and-credits', type: 'num', kind: 'numerical',
    prompt: 'A fictional airline’s Prepaid Insurance account began the year with a debit balance of $48,000. During the year it was debited for $180,000 of premiums paid in advance, and credited as cover expired. It ended the year with a debit balance of $54,000. What was the airline’s insurance expense for the year?',
    answer: 174000, check: () => 48000 + 180000 - 54000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 180000, say: 'That is what was paid. Some of the payments are still prepaid at the year end, and some of last year’s prepayment expired this year.' },
      { value: 186000, say: 'You swapped the opening and closing balances. Start from the opening balance and add the debits; what is left at the end was not used.' },
      { value: 282000, say: 'The ending balance is cover not yet used: subtract it.' },
    ],
    solution: 'For a debit-normal account, opening balance + debits − credits = ending balance. The credits are the cover that expired, which is the expense: 48,000 + 180,000 − 54,000 = $174,000. Each credit to Prepaid Insurance is matched by a debit to Insurance Expense.',
  },
  {
    id: 'f01-fn-8', lesson: 'debits-and-credits', type: 'mc', kind: 'conceptual',
    prompt: 'In which of these Lantern entries does a debit decrease the balance of the account debited?',
    options: [
      'Debit Accounts Payable $1,000, when Lantern pays part of what it owes for supplies (18 March)',
      'Debit Supplies $1,500, when Lantern buys beans, milk and cups on account (5 March)',
      'Debit Wages Expense $1,600, when Lantern pays its baristas (20 March)',
      'Debit Dividends $300, when the board declares and pays a dividend (30 March)',
    ],
    answer: 0,
    feedback: {
      1: 'Supplies is an asset, and assets increase with debits: Lantern has more supplies after the purchase.',
      2: 'Wages Expense increases with a debit: Lantern has used up more of its resources to earn revenue.',
      3: 'Dividends increase with a debit. Paying a dividend reduces equity, but it does so by increasing the Dividends account.',
    },
    solution: 'Accounts Payable is a liability, which increases with credits and decreases with debits. Paying the supplier reduces what Lantern owes, so the debit lowers the balance. In the other three entries the debit increases a debit-normal account (an asset, an expense and Dividends). Debit means the left side; whether it raises or lowers a balance depends on the type of account.',
  },

  // ---------------------------------------------------------------- journal-entries
  {
    id: 'f01-fn-9', lesson: 'journal-entries', type: 'journal', kind: 'applied', chart: 'f01', date: '2026-04-09',
    prompt: 'On 9 April Lantern caters the second of Harbor Tech’s three prepaid events ($800, part of the deposit received on 8 March). Suppose that on the day Harbor Tech also orders an extra coffee bar for $350, which Lantern invoices, due in 30 days. Lantern records the event on the day. Record the entry on 9 April.',
    accounts: ['Cash', 'Accounts Receivable', 'Unearned Revenue', 'Catering Revenue', 'Training Revenue', 'Accounts Payable'],
    lines: [{ acct: 'Unearned Revenue', dr: 800 }, { acct: 'Accounts Receivable', dr: 350 }, { acct: 'Catering Revenue', cr: 1150 }],
    solution: 'A compound entry with two debits. Catering the event earns the $800 Harbor Tech paid for in advance, so the liability falls: debit Unearned Revenue 800. The extra coffee bar is earned and billed but not paid: debit Accounts Receivable 350. Both are catering earned on 9 April: credit Catering Revenue 800 + 350 = $1,150. No cash moves on 9 April.',
  },
  {
    id: 'f01-fn-10', lesson: 'journal-entries', type: 'rows', kind: 'applied',
    prompt: 'Suppose these entries come from Lantern’s April journal. Judge each entry on its own, as if every other entry were correct, and select the entries that are wrong.',
    data: { table: {
      head: ['Date', 'Event', 'Entry recorded'],
      rows: [
        ['2 Apr', 'Paid the equipment supplier the $8,000 owed since 3 March', 'Debit Accounts Payable 8,000; credit Cash 8,000'],
        ['6 Apr', 'Received $900 for a barista workshop to be held on 20 April', 'Debit Cash 900; credit Training Revenue 900'],
        ['8 Apr', 'Bought $700 of coffee beans and cups on account', 'Debit Supplies 700; credit Accounts Payable 700'],
        ['12 Apr', 'Ana Lim paid her personal phone bill of $95 from her own bank account', 'Debit Utilities Expense 95; credit Cash 95'],
        ['15 Apr', 'Meridian Partners paid the $1,200 still owed on its March invoice', 'Debit Cash 1,200; credit Catering Revenue 1,200'],
        ['20 Apr', 'Ran the workshop paid for on 6 April', 'Debit Unearned Revenue 900; credit Training Revenue 900'],
        ['28 Apr', 'Paid $1,200 rent for the kitchen for April', 'Debit Rent Expense 1,200; credit Cash 1,200'],
      ],
    } },
    answer: [1, 3, 4],
    solution: 'Wrong: 6 April (the workshop hasn’t happened, so Lantern owes a service: credit Unearned Revenue, not Training Revenue); 12 April (Ana’s personal bill, paid from her own account, is not a Lantern transaction: the economic entity assumption says Lantern records nothing); 15 April (the revenue was recorded when the conference was catered in March, so the collection credits Accounts Receivable). Correct: paying the supplier reduces Accounts Payable; supplies bought on account are an asset and a liability; the workshop held on 20 April earns the deposit; April’s rent is April’s expense.',
  },

  // ---------------------------------------------------------------- general-ledger
  {
    id: 'f01-fn-11', lesson: 'general-ledger', type: 'num', kind: 'numerical',
    prompt: 'Lantern’s Unearned Revenue account (220) starts April with a credit balance of $1,600: Harbor Tech’s two remaining events. Suppose its April postings, in date order, are: 6 April credit $900 (workshop deposit); 9 April debit $800 (Harbor Tech event); 20 April debit $900 (workshop held); 22 April credit $1,800 (deposit for two May workshops); 23 April debit $800 (Harbor Tech event). What is the balance after the last posting?',
    answer: 1800, check: () => { let b = 1600; for (const [side, amt] of [['cr', 900], ['dr', 800], ['dr', 900], ['cr', 1800], ['dr', 800]]) b += side === 'cr' ? amt : -amt; return b; }, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 1400, say: 'You reversed the rule. Unearned Revenue is a liability: credits add to its balance and debits subtract.' },
      { value: 200, say: 'You left out the opening balance of $1,600. A running balance starts from the balance brought forward.' },
    ],
    solution: 'Credit-normal account: add credits, subtract debits. 1,600 + 900 = 2,500; − 800 = 1,700; − 900 = 800; + 1,800 = 2,600; − 800 = $1,800 (credit). Check by totals: credits 1,600 + 900 + 1,800 = 4,300; debits 800 + 900 + 800 = 2,500; 4,300 − 2,500 = 1,800. Harbor Tech’s events are all delivered, so the $1,800 is the deposit for the two May workshops.',
  },
  {
    id: 'f01-fn-12', lesson: 'general-ledger', type: 'classify', kind: 'conceptual',
    prompt: 'Does each description fit the journal or the ledger?',
    items: [
      'Records each transaction in full, in date order, with a short explanation',
      'Shows the running balance of a single account',
      'Its posting-reference column holds account numbers, such as 101',
      'Its posting-reference column holds journal page numbers, such as J2',
      'Is called the book of original entry',
      'Supplies the balances listed on the trial balance',
    ],
    categories: ['Journal', 'Ledger'],
    answer: [0, 1, 0, 1, 0, 1],
    feedback: {
      2: 'After a line is posted, the account number is written next to it in the journal, to show where it went.',
      3: 'Each ledger posting records the journal page it came from, so the trail can be followed back to the full entry.',
      5: 'The trial balance lists each account’s balance, which only the ledger shows.',
    },
    solution: 'The journal records whole transactions in date order, with explanations, and is the book of original entry; after posting, its posting-reference column shows the account number. The ledger sorts the same amounts by account, keeps each account’s running balance, records the journal page in its posting-reference column, and supplies the balances for the trial balance.',
  },

  // ---------------------------------------------------------------- trial-balance
  {
    id: 'f01-fn-13', lesson: 'trial-balance', type: 'num', kind: 'numerical',
    prompt: 'A fictional food-truck company’s trial balance shows debits of $61,284 and credits of $60,078. The bookkeeper has found that the only error is a slide: one balance was copied with its decimal point moved one place to the left, so it appears at one-tenth of its true amount. What is the true amount of that balance?',
    answer: 1340, check: () => (61284 - 60078) / (1 - 1 / 10), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 134, say: 'That is the difference divided by 9, which is the amount that was written down, not the true balance.' },
      { value: 1206, say: 'That is the difference itself. A slide to one-tenth makes the difference nine-tenths of the true balance.' },
      { value: 603, say: 'Halving the difference is the test for a balance in the wrong column, not for a slide.' },
    ],
    solution: 'Difference = 61,284 − 60,078 = $1,206. Writing a balance B as B ÷ 10 understates it by 0.9 × B, so B = 1,206 ÷ 0.9 = $1,340 (it was written as $134; 1,340 − 134 = 1,206). The difference is divisible by 9 (1,206 ÷ 9 = 134), as a slide’s always is. Credits are the smaller column, so it is a credit balance that was understated.',
  },
  {
    id: 'f01-fn-14', lesson: 'trial-balance', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the statements about the trial balance.',
    text: 'If one debit balance is listed in the credit column, the two totals differ by [[0]]. A difference that divides exactly by [[1]] points to a transposition or a slide. Totals that agree prove only that [[2]].',
    blanks: [
      { options: ['half the balance', 'the balance', 'twice the balance'], answer: 2 },
      { options: ['2', '9', '10'], answer: 1 },
      { options: ['every balance is correct', 'total debits equal total credits', 'no transaction has been left out'], answer: 1 },
    ],
    solution: 'A debit balance moved to the credit column leaves the debit total short by the balance and the credit total over by the same amount: a difference of twice the balance. Transpositions and slides leave differences divisible by 9, because the right and wrong figures share a digit sum. Agreement shows only that debits equal credits: an omitted transaction, an entry in the wrong account or two offsetting errors all leave the totals equal.',
  },

  // ---------------------------------------------------------------- accrual-vs-cash
  {
    id: 'f01-fn-15', lesson: 'accrual-vs-cash', type: 'num', kind: 'applied',
    prompt: 'Suppose that on 4 May Lantern sells a café owner a package for $2,340, paid in full that day: a two-day barista course on 12–13 May, normally sold alone for $2,000, and four equipment check-up visits on the first Monday of June, July, August and September, normally $150 each. How much revenue from the package does Lantern recognise by 30 June?',
    answer: 1935, check: () => { const ssp = 2000 + 4 * 150; return 2340 * 2000 / ssp + 2340 * 150 / ssp; }, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 2340, say: 'Receiving the cash doesn’t earn the revenue. Three of the visits haven’t happened yet: their share is unearned revenue at 30 June.' },
      { value: 2150, say: 'Those are stand-alone prices. The package is sold at a discount, so the $2,340 is allocated in proportion to them.' },
      { value: 1800, say: 'The June visit has also been made by 30 June, so its share ($135) is earned too.' },
      { value: 2000, say: 'The course’s stand-alone price is not its share of a discounted package: 2,340 × 2,000 ÷ 2,600 = 1,800.' },
    ],
    solution: 'Two performance obligations (step 2). Stand-alone prices total 2,000 + 4 × 150 = 2,600, so the $2,340 price is allocated in proportion (step 4): course 2,340 × 2,000 ÷ 2,600 = $1,800; each visit 2,340 × 150 ÷ 2,600 = $135. Revenue is recognised as each obligation is satisfied (step 5): the course in May and the June visit, 1,800 + 135 = $1,935. The other $405 stays in Unearned Revenue until the July, August and September visits.',
  },
  {
    id: 'f01-fn-16', lesson: 'accrual-vs-cash', type: 'multi', kind: 'conceptual',
    prompt: 'Lantern’s net income for March was $990, but its cash rose from nothing to $26,650. Which of these March items affected cash and net income by different amounts, and so help explain the gap? Select all that apply.',
    options: [
      'Ana Lim’s $20,000 investment in exchange for common stock',
      'The $1,500 barista workshop, paid for in cash on the day',
      'The $200 of depreciation on the equipment',
      'Harbor Tech’s $2,400 deposit, of which $800 was earned in March',
      'The $1,200 rent for March, paid on 28 March',
      'Wages: $3,000 earned by the baristas in March, of which $1,600 was paid',
      'The $350 of social-media advertising for March, paid on 10 March',
    ],
    answer: [0, 2, 3, 5],
    feedback: {
      1: 'The workshop was earned and paid for on the same day, so cash and net income both rose by $1,500.',
      4: 'March’s rent was paid in March: cash and net income both fell by $1,200.',
      6: 'The advertising ran in March and was paid in March, so cash and net income fell by the same $350.',
    },
    solution: 'The investment raised cash by $20,000 but is not income (it is financing). Depreciation reduced net income by $200 without using cash. The deposit raised cash by $2,400 but only $800 was revenue. Wages expense was $3,000 but only $1,600 was paid. The workshop, rent and advertising were earned or incurred and paid in March, so they moved cash and net income equally. Profit and cash flow differ; neither tells the whole story.',
  },

  // ---------------------------------------------------------------- adjusting-entries
  {
    id: 'f01-fn-17', lesson: 'adjusting-entries', type: 'journal', kind: 'numerical', chart: 'f01', date: '2026-12-31',
    prompt: 'On 1 August 2026 a fictional online retailer pays $4,800 for twelve months of search advertising (August 2026 to July 2027) and debits Prepaid Advertising. It has made no adjustment since. Record the adjusting entry at its year end, 31 December 2026.',
    accounts: ['Advertising Expense', 'Prepaid Advertising', 'Cash', 'Accounts Payable', 'Prepaid Rent'],
    lines: [{ acct: 'Advertising Expense', dr: 2000 }, { acct: 'Prepaid Advertising', cr: 2000 }],
    solution: 'A prepaid expense: the cost moves to expense as the months pass. The advertising costs 4,800 ÷ 12 = $400 a month, and five months (August to December) have been used: 5 × 400 = $2,000. Debit Advertising Expense 2,000; credit Prepaid Advertising 2,000, leaving $2,800 prepaid for January to July 2027. No cash moves at the adjustment.',
  },
  {
    id: 'f01-fn-18', lesson: 'adjusting-entries', type: 'journal', kind: 'applied', chart: 'f01', date: '2026-04-30',
    prompt: 'Suppose that from Friday 24 April Lantern provides a law firm with a daily office coffee service at $140 a working day. By 30 April it has provided 5 days of service. The firm will be invoiced on 4 May for these days together with May’s. Record Lantern’s adjusting entry on 30 April.',
    accounts: ['Accounts Receivable', 'Unearned Revenue', 'Catering Revenue', 'Training Revenue', 'Cash'],
    lines: [{ acct: 'Accounts Receivable', dr: 700 }, { acct: 'Catering Revenue', cr: 700 }],
    solution: 'Accrued revenue: Lantern has earned 5 × 140 = $700 in April but has not billed or been paid. Revenue belongs to the period in which the service is provided, so debit Accounts Receivable 700 and credit Catering Revenue 700. The amount is not Unearned Revenue, which would mean cash had arrived before the service. When the invoice is sent on 4 May, it covers this $700 already recorded plus May’s service.',
  },

  // ---------------------------------------------------------------- financial-statements
  {
    id: 'f01-fn-19', lesson: 'financial-statements', type: 'num', kind: 'numerical',
    prompt: 'A fictional language school starts the year with common stock of $40,000 and retained earnings of $22,500. During the year it issues $10,000 of new common stock, earns revenue of $168,000, incurs expenses of $151,700 and pays dividends of $9,000. What is total equity on its balance sheet at the end of the year?',
    answer: 79800, check: () => { const ni = 168000 - 151700; const re = 22500 + ni - 9000; return 40000 + 10000 + re; }, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 69800, say: 'You left out the $10,000 of new stock, which increases the common stock column of the statement of changes in equity.' },
      { value: 88800, say: 'Dividends take money out of retained earnings: subtract the $9,000.' },
      { value: 29800, say: 'That is ending retained earnings only. Total equity also includes common stock of $50,000.' },
    ],
    solution: 'Net income = 168,000 − 151,700 = 16,300. Retained earnings = 22,500 + 16,300 − 9,000 = 29,800. Common stock = 40,000 + 10,000 = 50,000. Total equity = 50,000 + 29,800 = $79,800, the figure the statement of changes in equity carries to the balance sheet.',
  },
  {
    id: 'f01-fn-20', lesson: 'financial-statements', type: 'classify', kind: 'applied',
    prompt: 'Suppose these events happen at Lantern in the second quarter of 2026. Under US GAAP, where does each appear in the statement of cash flows?',
    items: [
      'On 1 June, pays the $150 of interest for March to May on the Coastline Bank note',
      'Collects the $1,200 Meridian Partners still owes',
      'Receives $1,800 in advance for two barista workshops next month',
      'Buys a $2,500 cold-brew tower, paying cash',
      'Pays a $500 dividend to Ana Lim',
      'Repays $2,000 of the bank note’s principal early',
      'Records $200 of depreciation on the equipment',
    ],
    categories: ['Operating activity', 'Investing activity', 'Financing activity', 'Not a cash flow'],
    answer: [0, 0, 0, 1, 2, 2, 3],
    feedback: {
      0: 'Under US GAAP interest paid is an operating cash flow, even though the loan itself is financing. (IFRS allows a choice.)',
      2: 'Customers’ advance payments are cash received from customers: operating, although the revenue is not yet earned.',
      5: 'Repaying principal returns money to a lender: financing. Only the interest is operating.',
      6: 'Depreciation is an expense with no cash payment: it never appears as a cash flow.',
    },
    solution: 'Operating: interest paid (US GAAP), cash collected from a customer, and a customer’s advance payment. Investing: buying a long-term asset, the cold-brew tower. Financing: the dividend and the repayment of principal. Depreciation moves no cash, so it is not a cash flow (it affects net income, not cash).',
  },

  // ---------------------------------------------------------------- closing-entries
  {
    id: 'f01-fn-21', lesson: 'closing-entries', type: 'journal', kind: 'numerical', chart: 'f01', date: '2026-04-30',
    prompt: 'Suppose Lantern closes its books again on 30 April. These are some of the balances on its adjusted trial balance. Record the first closing entry, which closes the revenue accounts.',
    data: { table: {
      head: ['Account', 'Debit ($)', 'Credit ($)'],
      rows: [
        ['Unearned Revenue', '', '1,800'],
        ['Retained Earnings', '', '690'],
        ['Dividends', '500', ''],
        ['Catering Revenue', '', '6,450'],
        ['Training Revenue', '', '2,700'],
        ['Interest Expense', '50', ''],
      ],
      align: ['l', 'r', 'r'],
    } },
    accounts: ['Catering Revenue', 'Training Revenue', 'Unearned Revenue', 'Income Summary', 'Retained Earnings', 'Dividends', 'Interest Expense'],
    lines: [{ acct: 'Catering Revenue', dr: 6450 }, { acct: 'Training Revenue', dr: 2700 }, { acct: 'Income Summary', cr: 9150 }],
    solution: 'Revenue accounts have credit balances, so each is debited for its balance to bring it to zero: debit Catering Revenue 6,450 and Training Revenue 2,700. Income Summary is credited for the total, 6,450 + 2,700 = $9,150. Unearned Revenue is a liability (permanent), so it is not closed. Retained Earnings ($690 after March’s close) receives net income later, in the third entry. Dividends and Interest Expense are temporary but are closed in other entries.',
  },
  {
    id: 'f01-fn-22', lesson: 'closing-entries', type: 'equation', kind: 'conceptual',
    prompt: 'Lantern posts all four of its 31 March closing entries. Enter the total change these entries make to total assets, total liabilities and total equity (use a minus sign for a decrease and 0 for no change).',
    answer: { assets: 0, liabilities: 0, equity: 0 },
    solution: 'Closing entries move balances between accounts that are all part of equity: revenue, expenses and dividends into Income Summary and then Retained Earnings. Revenue ($7,100) and expenses ($6,110) had already changed equity during March, and so had the dividend ($300); closing only gathers the net $690 into Retained Earnings. No asset or liability account is touched, and total equity stays at $20,690.',
  },

  // ---------------------------------------------------------------- accounting-cycle
  {
    id: 'f01-fn-23', lesson: 'accounting-cycle', type: 'order', kind: 'conceptual',
    prompt: 'Suppose Lantern uses reversing entries. Put these steps in the life of the $1,400 of wages earned on 16–31 March in the order they happen.',
    items: [
      'Record and post adjustment a5 on 31 March: debit Wages Expense 1,400, credit Wages Payable 1,400',
      'Prepare the March income statement, which reports wages expense of $3,000',
      'Close Wages Expense to Income Summary on 31 March',
      'Prepare the post-closing trial balance, which still lists Wages Payable of $1,400',
      'Record the reversing entry on 1 April: debit Wages Payable 1,400, credit Wages Expense 1,400',
      'Record the 5 April payroll: debit Wages Expense 1,400, credit Cash 1,400',
    ],
    solution: 'The accrual comes first, at the end of March, so that the statements report all $3,000 of March wages (1,600 paid + 1,400 accrued). Closing follows the statements and empties Wages Expense; the post-closing trial balance then shows only permanent accounts, including the $1,400 liability. On the first day of April the reversal clears the liability and puts a $1,400 credit in Wages Expense, so the routine 5 April payroll entry leaves April’s wages expense at zero for these March wages.',
  },
  {
    id: 'f01-fn-24', lesson: 'accounting-cycle', type: 'journal', kind: 'applied', chart: 'f01', date: '2026-04-01',
    prompt: 'Suppose Lantern reverses its accruals. Record the 1 April entry that reverses adjustment a7: the $600 breakfast catered for Pier Nine Studio on 31 March, to be invoiced on 2 April.',
    accounts: ['Accounts Receivable', 'Catering Revenue', 'Unearned Revenue', 'Cash', 'Income Summary'],
    lines: [{ acct: 'Catering Revenue', dr: 600 }, { acct: 'Accounts Receivable', cr: 600 }],
    solution: 'A reversing entry is the exact opposite of the adjustment. Adjustment a7 debited Accounts Receivable 600 and credited Catering Revenue 600, so the reversal debits Catering Revenue 600 and credits Accounts Receivable 600. When the invoice is sent on 2 April it is recorded the routine way (debit Accounts Receivable 600, credit Catering Revenue 600), so April’s revenue from the breakfast nets to zero (it was March’s revenue) and Accounts Receivable shows the $600 once.',
  },
  {
    id: 'f01-fn-25', lesson: 'accounting-cycle', type: 'num', kind: 'numerical',
    prompt: 'In a fictional dog-grooming salon’s year-end worksheet, the income statement columns total $84,350 of debits and $91,200 of credits. The balance sheet columns total $156,000 of debits. Before net income is entered to balance the columns, what is the total of the balance sheet credit column?',
    answer: 149150, check: () => 156000 - (91200 - 84350), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 162850, say: 'Net income is the one change in equity not yet in the balance sheet accounts, so it is added to the credit column to balance it: the credit column starts smaller than the debit column.' },
      { value: 156000, say: 'The balance sheet columns differ by the period’s net income until it is entered, because Retained Earnings still shows its beginning balance.' },
      { value: 6850, say: 'That is net income. The question asks for the credit total of the balance sheet columns.' },
    ],
    solution: 'Net income = income statement credits − debits = 91,200 − 84,350 = $6,850. Before it is entered, the balance sheet columns differ by the same amount, because Retained Earnings still holds its beginning balance. Profit adds to equity, which sits on the credit side, so the credit column is the smaller one: 156,000 − 6,850 = $149,150. Entering the $6,850 as a credit brings both columns to $156,000.',
  },
];
