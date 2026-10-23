// assess-diagnostic.js — F02 course diagnostic: three items per module, each testing what the module builds on: F01’s
// accruals, deferrals, depreciation, statements and articulation, applied to F02’s starting points. Module 1: a deferral
// earned over time (revenue recognition), the cost of goods used from a count (cost of goods sold), which statement an
// account belongs to. Module 2: an unrecorded accrual (receivables), straight-line depreciation over a part year (book
// value), equity from a trial balance (retained earnings and the balance sheet). Module 3: what changes cash but not
// profit, cash from operations in a first year, paying an accrued liability. Module 4: net income from the equation,
// an omitted adjustment through the statements, who sets the standards.
// New questions, not copies of lesson exercises, module-test, final or project items; every business other than
// Lantern is fictional and appears nowhere else in the site. No hints; solutions show in review.

export const items = [
  // ================================================================ Module 1: revenue, inventory and the income statement
  {
    id: 'f02-dg-1', lesson: 'revenue-recognition', type: 'journal', kind: 'applied', chart: 'f02', date: '2026-12-31',
    prompt: 'On 1 November 2026 Allegro Piano School, a fictional business, receives $7,200 from a family for six months of weekly lessons, November 2026 to April 2027, and records it as Unearned Revenue. The lessons go ahead as planned, and the school records its lesson fees as Training Revenue. Record the adjusting entry at its year end, 31 December 2026.',
    accounts: ['Cash', 'Unearned Revenue', 'Training Revenue', 'Accounts Receivable', 'Prepaid Insurance', 'Wages Payable', 'Sales Discounts'],
    lines: [{ acct: 'Unearned Revenue', dr: 2400 }, { acct: 'Training Revenue', cr: 2400 }],
    solution: 'A deferral: the cash arrived before the service, so it was recorded as a liability. Each month of lessons earns 7,200 ÷ 6 = $1,200, and two months (November and December) have been taught: 2 × 1,200 = $2,400. Debit Unearned Revenue 2,400 and credit Training Revenue 2,400, leaving $4,800 owed in lessons for January to April. No cash moves at the adjustment. This is the F01 adjustment that F02’s revenue recognition lesson generalises: revenue follows the delivery of the service, here over time.',
  },
  {
    id: 'f02-dg-2', lesson: 'inventory-and-cost-of-goods-sold', type: 'num', kind: 'numerical',
    prompt: 'Petalcraft Florist, a fictional shop, has flowers costing $1,300 in its cold room on 1 December. During December it buys flowers costing $8,600. A count on 31 December finds flowers costing $900 still unsold. What was the cost of the flowers sold or thrown away in December? Enter whole dollars.',
    answer: 9000, check: () => 1300 + 8600 - 900, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 9900, say: 'The $900 of flowers still in the cold room haven’t been used: subtract them.' },
      { value: 8600, say: 'Purchases aren’t the cost of what was used. Add the flowers on hand at the start and subtract those left at the end.' },
      { value: 7700, say: 'The $1,300 of flowers on hand on 1 December were available to sell too: add them.' },
      { value: 10800, say: 'The closing count is subtracted, not added: those flowers are still an asset.' },
    ],
    solution: 'The same reasoning as F01’s supplies adjustment: what was available (opening 1,300 + bought 8,600 = 9,900) less what is left (900) was used up: 9,900 − 900 = $9,000. For a business that sells goods this is cost of goods sold = beginning inventory + purchases − ending inventory, the starting point of F02’s inventory lesson.',
  },
  {
    id: 'f02-dg-3', lesson: 'income-statement', type: 'classify', kind: 'conceptual',
    prompt: 'Lantern’s accountant prepares the income statement, the statement of changes in equity and the balance sheet from the adjusted trial balance at 31 December 2026. On which statement is each account’s balance reported?',
    items: [
      'Unearned Revenue',
      'Dividends',
      'Cost of Goods Sold',
      'Inventory',
      'Accumulated Depreciation—Van',
      'Interest Expense',
      'Income Taxes Payable',
      'Sales Returns and Allowances',
    ],
    categories: ['Income statement', 'Statement of changes in equity', 'Balance sheet'],
    answer: [2, 1, 0, 2, 2, 0, 2, 0],
    feedback: {
      0: 'Despite its name, Unearned Revenue is an obligation to deliver: a liability on the balance sheet.',
      1: 'Dividends are distributions to the owners, not an expense. They reduce retained earnings in the statement of changes in equity.',
      4: 'Accumulated depreciation is a contra-asset, deducted from the van on the balance sheet. Depreciation Expense is the income statement account.',
      7: 'Sales Returns and Allowances reduces revenue: it is deducted from sales at the top of the income statement.',
    },
    solution: 'Income statement: Cost of Goods Sold, Interest Expense and Sales Returns and Allowances (a deduction from revenue). Statement of changes in equity: Dividends. Balance sheet: Unearned Revenue and Income Taxes Payable (liabilities), Inventory (an asset) and Accumulated Depreciation—Van (deducted from the van).',
  },

  // ================================================================ Module 2: the balance sheet
  {
    id: 'f02-dg-4', lesson: 'receivables-and-payables', type: 'mc', kind: 'conceptual',
    prompt: 'By 31 December, Elderfield Architects, a fictional practice, has completed a design stage worth $8,000 under a signed contract with a client. It will invoice the client on 10 January. The accountant forgets to record the year-end adjusting entry. Which is true of its 31 December statements?',
    options: [
      'Revenue and assets are both understated by $8,000',
      'Revenue is understated and liabilities are overstated by $8,000',
      'Nothing is misstated, because revenue is recorded when the invoice is sent',
      'Assets are understated by $8,000, but revenue is right until the client pays',
    ],
    answer: 0,
    feedback: {
      1: 'No liability is involved: the client hasn’t paid anything in advance. The missing entry is a receivable, an asset.',
      2: 'Revenue belongs to the period in which the work is done, not the one in which it is invoiced.',
      3: 'Revenue is earned by doing the work, not by being paid. Both sides of the missing entry are understated.',
    },
    solution: 'This is accrued revenue. The missing entry is a debit to Accounts Receivable and a credit to revenue for $8,000, so revenue, net income and retained earnings are understated by $8,000, and so are total assets. Liabilities are unaffected. Receivables like this one are where F02’s receivables lesson starts.',
  },
  {
    id: 'f02-dg-5', lesson: 'long-lived-assets', type: 'num', kind: 'numerical',
    prompt: 'Nutfield Bakery, a fictional business, buys an oven on 1 April 2026 for $27,000. It expects to use it for six years and then sell it for $3,000. It uses the straight-line method, charging a full month in the month of purchase, and its year ends on 31 December. What is the oven’s book value at 31 December 2027? Enter whole dollars.',
    answer: 20000, check: () => 27000 - (27000 - 3000) / 6 / 12 * (9 + 12), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 19000, say: 'That charges two full years. The oven was bought on 1 April, so 2026 bears only nine months: 21 months in all.' },
      { value: 17000, say: 'The residual value is already used in the depreciation. Book value is cost less accumulated depreciation; don’t subtract the residual again.' },
      { value: 19125, say: 'Depreciate the cost less the residual value: (27,000 − 3,000) ÷ 6 = $4,000 a year, not $4,500.' },
      { value: 23000, say: 'That is the book value after one full year. By 31 December 2027 the oven has been used for 21 months.' },
    ],
    solution: 'Annual depreciation = (27,000 − 3,000) ÷ 6 = $4,000, or $333.33 a month. April 2026 to December 2027 is 9 + 12 = 21 months, so accumulated depreciation is 4,000 × 21 ÷ 12 = $7,000. Book value = 27,000 − 7,000 = $20,000.',
  },
  {
    id: 'f02-dg-6', lesson: 'balance-sheet-and-equity', type: 'num', kind: 'applied',
    prompt: 'Bellbrook Plumbing Inc., a fictional company, has this adjusted trial balance at 31 December 2026, before the closing entries. What total equity will its balance sheet show? Enter whole dollars.',
    data: { table: { head: ['Account', 'Debit ($)', 'Credit ($)'], rows: [
      ['Cash', '33,100', ''],
      ['Accounts Receivable', '9,600', ''],
      ['Van', '40,000', ''],
      ['Accumulated Depreciation—Van', '', '8,000'],
      ['Accounts Payable', '', '9,400'],
      ['Unearned Revenue', '', '2,100'],
      ['Common Stock', '', '30,000'],
      ['Retained Earnings (1 January 2026)', '', '18,500'],
      ['Dividends', '6,000', ''],
      ['Plumbing Revenue', '', '142,000'],
      ['Expenses (all accounts)', '121,300', ''],
    ] } },
    answer: 63200, check: () => 30000 + 18500 + (142000 - 121300) - 6000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 48500, say: 'The Retained Earnings balance in a trial balance before closing is the opening balance. Add the year’s net income and deduct the dividends.' },
      { value: 69200, say: 'Dividends reduce retained earnings: deduct the $6,000.' },
      { value: 33200, say: 'Total equity includes the $30,000 of common stock as well as retained earnings.' },
      { value: 74700, say: 'That is total assets. Equity is what is left after the $11,500 of liabilities.' },
    ],
    solution: 'Net income = 142,000 − 121,300 = $20,700. Closing retained earnings = 18,500 + 20,700 − 6,000 = $33,200 (the statement of changes in equity). Total equity = common stock 30,000 + retained earnings 33,200 = $63,200. Check: assets 33,100 + 9,600 + (40,000 − 8,000) = 74,700 = liabilities 9,400 + 2,100 + equity 63,200.',
  },

  // ================================================================ Module 3: the statement of cash flows
  {
    id: 'f02-dg-7', lesson: 'cash-flow-statement', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these change a business’s cash but not its net income? Select all that apply.',
    options: [
      'Collecting $2,000 from a customer for work invoiced last month',
      'Paying a $1,500 dividend declared and paid on the same day',
      'Buying a delivery van for $24,000 in cash',
      'Borrowing $10,000 from a bank on a three-year loan',
      'Recording $900 of depreciation on the shop’s equipment',
      'Accruing $600 of wages earned but not yet paid',
      'Selling services for $400 in cash on the day they are provided',
      'Using $300 of supplies that were bought and paid for last month',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'Depreciation reduces net income but moves no cash: the cash left when the equipment was bought.',
      5: 'Accrued wages reduce net income now; the cash goes out later, when they are paid.',
      6: 'Revenue earned and collected on the same day changes cash and net income by the same $400.',
      7: 'Supplies used are an expense this month, but the cash was paid last month.',
    },
    solution: 'Cash only: collecting a receivable (the revenue was recorded last month), paying a dividend (a distribution, not an expense), buying a van (an asset, depreciated later) and borrowing (a liability). Net income only: depreciation, accrued wages and supplies used. Both: the cash sale. Because so many transactions affect one and not the other, profit and cash flow differ, which is why F02 needs a separate statement of cash flows.',
  },
  {
    id: 'f02-dg-8', lesson: 'indirect-method', type: 'num', kind: 'applied',
    prompt: 'Saxby Pool Cleaning Inc., a fictional company, finishes its first year with net income of $24,000. At the year end customers owe it $3,500 for cleaning already done, and other customers have paid $900 in advance for January visits, correctly recorded as unearned revenue. Its expenses include $2,000 of depreciation on its van and $1,200 of wages earned in late December and paid in January. It started the year with no balances and has no other noncash items or year-end balances from its operations. How much cash did its operations generate in the year? Enter whole dollars.',
    answer: 24600, check: () => 24000 - 3500 + 900 + 2000 + 1200, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 31600, say: 'The $3,500 owed by customers is in revenue but hasn’t been collected: subtract it.' },
      { value: 20600, say: 'Depreciation reduced net income without using cash this year: add it back, don’t subtract it.' },
      { value: 22800, say: 'The $900 paid in advance arrived as cash but isn’t in revenue yet: add it.' },
      { value: 22200, say: 'The $1,200 of December wages reduced net income but hadn’t been paid: add it.' },
      { value: 24000, say: 'Net income isn’t cash. Adjust for the revenue not collected, the cash received in advance, depreciation and the unpaid wages.' },
    ],
    solution: 'Start from net income, $24,000. Revenue not yet collected: −3,500. Cash received for next year’s visits: +900. Depreciation, an expense with no cash: +2,000. Wages expensed but unpaid: +1,200. Cash from operations = 24,000 − 3,500 + 900 + 2,000 + 1,200 = $24,600. In a first year each change is the year-end balance itself; this is the indirect method, built from F01’s accrual and cash bases.',
  },
  {
    id: 'f02-dg-9', lesson: 'cash-flow-statement', type: 'equation', kind: 'numerical',
    prompt: 'On 5 January Eastbrook Garage, a fictional business, pays its mechanics $4,000 in wages: $2,500 for days worked in late December, which was accrued at its 31 December year end, and $1,500 for 1–5 January. Enter the change in each side of the accounting equation for the payment (use a minus sign for a decrease and 0 for no change).',
    answer: { assets: -4000, liabilities: -2500, equity: -1500 },
    solution: 'Cash, an asset, falls by $4,000. The $2,500 for December settles Wages Payable, so liabilities fall by $2,500 with no new expense: December’s expense was recorded by the accrual. The $1,500 for January is this year’s wages expense, which reduces equity. Check: −4,000 = −2,500 + (−1,500). A statement of cash flows shows the whole $4,000 as cash paid to employees, though only $1,500 is January’s expense.',
  },

  // ================================================================ Module 4: putting the statements together
  {
    id: 'f02-dg-10', lesson: 'linking-the-statements', type: 'num', kind: 'numerical',
    prompt: 'During the year the total assets of Zennor Surf School Inc., a fictional company, rose by $46,000 and its total liabilities by $12,500. It issued new shares for $10,000 in cash and declared and paid dividends of $8,000; nothing else changed its equity. What was its net income? Enter whole dollars.',
    answer: 31500, check: () => (46000 - 12500) - 10000 + 8000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 33500, say: 'That is the change in equity. Part of it came from the new shares, and dividends took some away.' },
      { value: 23500, say: 'Dividends reduced equity, so net income must have been $8,000 larger than the rest of the change: add them back.' },
      { value: 41500, say: 'The $10,000 of new shares added to equity without being income: take it out.' },
      { value: 15500, say: 'Dividends are added back, not subtracted: they took equity away, so profit had to cover them.' },
    ],
    solution: 'Change in equity = change in assets − change in liabilities = 46,000 − 12,500 = $33,500. Equity changes through shares issued, net income and dividends: 33,500 = 10,000 + net income − 8,000, so net income = 33,500 − 10,000 + 8,000 = $31,500. This is the articulation F02 builds on: net income flows through the statement of changes in equity into the balance sheet.',
  },
  {
    id: 'f02-dg-11', lesson: 'linking-the-statements', type: 'multi', kind: 'applied',
    prompt: 'On 1 September Cranford Tutoring Inc., a fictional company, received $12,000 for a year of weekly tutoring, September to August, and credited Unearned Revenue. At its 31 December year end the accountant forgot the adjusting entry for the tutoring delivered since September. Ignoring income tax, which statements about its 31 December statements are true? Select all that apply.',
    options: [
      'Revenue and net income are understated by $4,000.',
      'Liabilities are overstated by $4,000.',
      'Retained earnings at 31 December are understated by $4,000.',
      'Cash is correct, because the missing entry moves no cash.',
      'Total assets are understated by $4,000.',
      'Cash is overstated by $4,000, because the money was received early.',
      'Revenue is overstated, because all the cash arrived in September.',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'The missing entry moves an amount from a liability to revenue. No asset account is involved.',
      5: 'The cash was received and recorded in September; it is correct. The error is in how it is classified.',
      6: 'The cash was recorded as a liability, not as revenue, so revenue is too low, not too high.',
    },
    solution: 'Four months of twelve have been delivered: 12,000 × 4 ÷ 12 = $4,000. The missing entry is debit Unearned Revenue 4,000, credit revenue 4,000. Without it, revenue and net income are $4,000 too low, so retained earnings are too, while liabilities are $4,000 too high: the balance sheet still balances. Cash and total assets are correct. One missed entry reaches the income statement, the statement of changes in equity and the balance sheet, which is how F02’s linking lesson traces transactions.',
  },
  {
    id: 'f02-dg-12', lesson: 'gaap-and-ifrs', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the description of who sets the rules for financial statements.',
    text: 'US GAAP is written by the [[0]], an independent private-sector body. The [[1]], a federal agency, requires US public companies to report under US GAAP. IFRS Accounting Standards are written by the [[2]]. The SEC accepts statements prepared under IFRS, without a reconciliation to US GAAP, from [[3]].',
    blanks: [
      { options: ['FASB', 'SEC', 'IASB', 'IRS'], answer: 0 },
      { options: ['FASB', 'SEC', 'IASB', 'IRS'], answer: 1 },
      { options: ['FASB', 'SEC', 'IASB', 'IRS'], answer: 2 },
      { options: ['US public companies', 'foreign private issuers', 'every listed company', 'US private companies only'], answer: 1 },
    ],
    solution: 'The Financial Accounting Standards Board (FASB) writes US GAAP. The Securities and Exchange Commission (SEC) has legal authority over US public companies’ reporting, recognises the FASB as their standard setter and requires them to use US GAAP. The International Accounting Standards Board (IASB) writes IFRS. Since 2007 the SEC has accepted IFRS statements from foreign private issuers, foreign companies whose securities trade in the United States. F02’s last lesson compares the two frameworks for the statements in this course.',
  },
];

// Start at module N if the student scores at least the threshold on the items for all the modules before N. The
// threshold for module 2 is 80% of the three module-1 items (2.4 of 3, so in practice all three, allowing a slip on part
// of a classify item). The later rules pool earlier modules, so they are raised to keep the same bar for each module:
// with 2.4 of 3 needed per module, module 3 needs (2.4 + 3) ÷ 6 = 90% of the module 1–2 items and module 4 needs
// (2.4 + 3 + 3) ÷ 9 ≈ 93.3% of the module 1–3 items. A lower pooled bar would let a strong module hide a weak one.
// The items mostly test F01 knowledge, so the bar is set high: skipping a module should need a near-clean sweep.
export const route = [
  { module: 2, ifAtLeast: 0.8 },
  { module: 3, ifAtLeast: 0.9 },
  { module: 4, ifAtLeast: 0.933 },
];
