// assess-diagnostic.js — F02 course diagnostic: three items per module, each written so that it needs that module’s
// method, not just F01: a student who has finished F01 but not F02 should miss most of them, and one who already knows a
// module should get its items right. Module 1: allocating a bundle by stand-alone selling prices, FIFO ending inventory,
// what reaches gross profit on a multi-step statement. Module 2: what a debit balance in the allowance means, a
// double-declining-balance book value at disposal, par (stated value) and additional paid-in capital. Module 3: the ASC
// 230 classification of investing flows, an indirect-method figure worked backwards with a gain, the noncash disclosure.
// Module 4: net income from the equation, an omitted adjustment through the statements, who sets the standards.
// New questions, not copies of lesson exercises, module-test, final or project items; every business is fictional and
// appears nowhere else in the site. No hints; solutions show in review.

export const items = [
  // ================================================================ Module 1: revenue, inventory and the income statement
  {
    id: 'f02-dg-1', lesson: 'revenue-recognition', type: 'journal', kind: 'applied', chart: 'f02', date: '2027-03-31',
    prompt: 'Fallowfield Yarns, a fictional online shop, sells a learn-to-knit box for $243, paid by card when ordered: a set of needles and tools, shipped at once, and six monthly parcels of yarn, the first shipped the following month. Sold separately, the tools cost $90 and each parcel $30. In March 2027 it sells 50 boxes and ships all their tools; the first parcels go out in April. Record one summary entry for March’s sales on 31 March (the revenue side only).',
    accounts: ['Cash', 'Accounts Receivable', 'Online Sales Revenue', 'Unearned Revenue', 'Sales Discounts', 'Sales Returns and Allowances', 'Inventory', 'Cost of Goods Sold'],
    lines: [{ acct: 'Cash', dr: 12150 }, { acct: 'Online Sales Revenue', cr: 4050 }, { acct: 'Unearned Revenue', cr: 8100 }],
    solution: 'Two performance obligations: the tools and the yarn parcels. Their stand-alone selling prices total 90 + 6 × 30 = $270, so each receives 243 ÷ 270 = 90% of its own price: tools $81 and parcels $162 a box. For 50 boxes: cash 50 × 243 = $12,150; revenue for the tools shipped in March 50 × 81 = $4,050; and 50 × 162 = $8,100 of unearned revenue (a contract liability) for parcels still to be sent, recognised as each month’s parcel ships. Debit Cash 12,150; credit Online Sales Revenue 4,050 and Unearned Revenue 8,100. Taking the tools at their own $90 price would put the whole bundle discount on the parcels.',
  },
  {
    id: 'f02-dg-2', lesson: 'inventory-and-cost-of-goods-sold', type: 'num', kind: 'numerical',
    prompt: 'Olivewood Deli Supplies, a fictional wholesaler, uses a periodic system and the FIFO cost formula. It starts the year with 120 cases of olive oil costing $25 each, buys 200 cases at $27 in March and 180 cases at $30 in August, and sells 380 cases during the year. What is the cost of the cases left at the year end? Enter whole dollars.',
    answer: 3600, check: () => { const left = 120 + 200 + 180 - 380; return left * 30; }, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 3000, say: 'That is LIFO, which leaves the oldest costs in inventory. FIFO sells the oldest cases first, so the cases left are the latest ones, bought at $30.' },
      { value: 3312, say: 'That is the weighted average ($27.60 a case). FIFO assigns the cases left the most recent costs.' },
      { value: 10200, say: 'That is FIFO cost of goods sold for the 380 cases sold. The question asks for the 120 cases left.' },
      { value: 3240, say: 'The 120 cases left all come from the last delivery of 180 at $30, not from the March layer.' },
    ],
    solution: 'Cases available: 120 + 200 + 180 = 500; sold 380, so 120 are left. FIFO assumes the oldest cases were sold first, so the 120 left come from the August layer: 120 × $30 = $3,600. Cost of goods sold is the rest of the $13,800 available: 13,800 − 3,600 = $10,200. LIFO would leave the opening 120 cases at $25 ($3,000) and the weighted average 120 × $27.60 ($3,312).',
  },
  {
    id: 'f02-dg-3', lesson: 'income-statement', type: 'multi', kind: 'conceptual',
    prompt: 'Kingsdown Interiors, a fictional retailer, prepares a multi-step income statement under US GAAP. Which of these reduce its gross profit? Select all that apply.',
    options: [
      'Refunds to customers for goods they returned',
      'Freight-in on goods bought and since sold',
      'Discounts customers take for paying early',
      'A loss on selling an old delivery van for less than its book value',
      'Interest on the bank loan that financed its stock of furniture',
      'Wages of the staff who run its website and answer customers',
      'Dividends paid to its shareholders out of the year’s profit',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'A loss on disposing of equipment is included in operating income under US GAAP (ASC 360-10-45-5), but it is not part of net revenue or cost of sales, so it sits below gross profit.',
      4: 'Interest is a cost of borrowing, shown after operating income.',
      5: 'Running the website is an operating expense, deducted after gross profit.',
      6: 'Dividends are distributions to owners, not expenses: they appear in the statement of changes in equity.',
    },
    solution: 'Gross profit is net revenue minus cost of sales. Returns and sales discounts are contra-revenue items that reduce net revenue, and freight-in is part of the goods’ cost, which reaches cost of goods sold when they are sold. The van loss and the website wages are deducted after gross profit, within operating income; interest comes after operating income; dividends are not on the income statement at all.',
  },

  // ================================================================ Module 2: the balance sheet
  {
    id: 'f02-dg-4', lesson: 'receivables-and-payables', type: 'mc', kind: 'conceptual',
    prompt: 'Tilbury Timber, a fictional wholesaler, uses the allowance method. Before its year-end adjustment, its allowance for doubtful accounts has a debit balance of $1,900. What does this tell you?',
    options: [
      'This year’s write-offs were larger than the allowance it started with',
      'Some customers have paid more than they owed, so it owes them refunds',
      'Last year’s bad debt expense was too high, so this year’s will be lower',
      'It must have switched to the direct write-off method during the year',
    ],
    answer: 0,
    feedback: {
      1: 'Overpayments would show as credit balances in customers’ accounts receivable, not in the allowance.',
      2: 'The reverse: the earlier estimates were too small for the losses that followed, and this year’s expense must also make good the $1,900.',
      3: 'Writing balances off against the allowance is the allowance method itself; the direct write-off method has no allowance.',
    },
    solution: 'The allowance is credited by each period-end estimate and debited when specific balances are written off. A debit balance before the adjustment means the write-offs since the last estimate were larger than the allowance it set up. The adjustment must first clear the $1,900 and then build the balance the aging or other estimate requires, so this year’s bad debt expense is the required balance plus $1,900, and the business should revisit its loss rates.',
  },
  {
    id: 'f02-dg-5', lesson: 'long-lived-assets', type: 'num', kind: 'numerical',
    prompt: 'Corbridge Bakery, a fictional business, bought a delivery van on 1 January 2025 for $40,000, expecting to use it for five years and sell it for $4,000. It uses the double-declining-balance method, with a full year in the year of purchase. On 31 December 2026, after recording 2026’s depreciation, it sells the van for $16,000 in cash. What is the gain or loss on the sale? Enter a loss as a negative number, in whole dollars.',
    answer: 1600, check: () => { const rate = 2 / 5; const bv = 40000 * (1 - rate) * (1 - rate); return 16000 - bv; }, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: -9600, say: 'That uses the straight-line method, $7,200 a year. Double-declining balance charges 40% of the book value each year, so far more in the early years.' },
      { value: -960, say: 'Double-declining balance applies the rate to the book value, not to cost less residual value; the residual only stops depreciation going too far later on.' },
      { value: -8000, say: 'That takes only one year’s depreciation. The van has been depreciated for 2025 and 2026.' },
      { value: 16000, say: 'That is the cash received. The gain is the proceeds less the van’s book value.' },
    ],
    solution: 'The rate is 2 × (1 ÷ 5) = 40% of the book value each year, ignoring the residual value until the end. 2025: 40% × 40,000 = 16,000, leaving 24,000. 2026: 40% × 24,000 = 9,600, leaving a book value of $14,400, still above the $4,000 residual. Gain = proceeds − book value = 16,000 − 14,400 = $1,600, included in operating income.',
  },
  {
    id: 'f02-dg-6', lesson: 'balance-sheet-and-equity', type: 'mc', kind: 'conceptual',
    prompt: 'Quarrington Labs Inc., a fictional company, issues 8,000 shares of no-par common stock for $96,000 in cash. Its board has given the shares a stated value of $1 each. How is the $96,000 shown in equity?',
    options: [
      'Common Stock $8,000 and Additional Paid-in Capital $88,000',
      'Common Stock $96,000, because the shares have no par value',
      'Additional Paid-in Capital $96,000, because there is no par value',
      'Common Stock $88,000 and Additional Paid-in Capital $8,000',
    ],
    answer: 0,
    feedback: {
      1: 'No-par shares are credited in full to Common Stock only when they have no stated value. A stated value is treated like par.',
      2: 'Common Stock always receives at least the stated (or par) value of the shares issued.',
      3: 'The split is the right way round only if Common Stock gets the stated value, 8,000 × $1, and the excess goes to additional paid-in capital.',
    },
    solution: 'A stated value assigned by the board is treated like par: Common Stock is credited with 8,000 × $1 = $8,000 and the rest, 96,000 − 8,000 = $88,000, goes to additional paid-in capital. The entry is debit Cash 96,000; credit Common Stock 8,000 and Additional Paid-in Capital 88,000. Without a stated value the whole $96,000 would go to Common Stock, as Ana’s investment did at Lantern; total equity rises by $96,000 either way.',
  },

  // ================================================================ Module 3: the statement of cash flows
  {
    id: 'f02-dg-7', lesson: 'cash-flow-statement', type: 'num', kind: 'applied',
    prompt: 'Marchbank Engineering Inc., a fictional company reporting under US GAAP, has these 2027 cash transactions: it buys two delivery vans for $64,000; sells an old forklift for $9,000; lends a supplier $12,000 on a one-year note and collects $4,000 of it by December; buys a six-month certificate of deposit for $20,000 and a 60-day Treasury bill for $15,000; receives $1,200 of interest and $800 of dividends; and pays $3,500 of interest on its bank loan. What is its net cash from investing activities? Enter a net outflow as a negative number, in whole dollars.',
    answer: -83000, check: () => -64000 + 9000 - 12000 + 4000 - 20000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: -98000, say: 'A 60-day Treasury bill is a cash equivalent: buying it moves money within cash and cash equivalents, so it isn’t a cash flow at all.' },
      { value: -81000, say: 'Under US GAAP interest and dividends received are operating inflows, not investing.' },
      { value: -63000, say: 'A six-month certificate of deposit is not a cash equivalent: its maturity when bought is over three months, so buying it is an investing outflow.' },
      { value: -86500, say: 'Interest paid is an operating outflow under US GAAP; the loan it relates to is a financing item.' },
      { value: -75000, say: 'Making a loan to another business, and collecting it, are investing cash flows.' },
    ],
    solution: 'Investing: vans −64,000; forklift +9,000; loan to the supplier −12,000 and its collection +4,000; certificate of deposit −20,000. Net = −64,000 + 9,000 − 12,000 + 4,000 − 20,000 = −$83,000. The 60-day Treasury bill is a cash equivalent, so buying it is not a cash flow; interest and dividends received, and interest paid, are operating cash flows under ASC 230.',
  },
  {
    id: 'f02-dg-8', lesson: 'indirect-method', type: 'num', kind: 'numerical',
    prompt: 'Halsey Toys, a fictional retailer, reports net income of $48,000, after depreciation of $12,000 and a $2,500 gain on selling equipment. During the year its accounts receivable rose by $4,000 and its accounts payable fell by $1,500; the only other change in its operating assets and liabilities was in inventory. By the indirect method its net cash from operating activities is $46,500. By how much did its inventory change? Enter an increase as a positive number and a decrease as a negative number, in whole dollars.',
    answer: 5500, check: () => (48000 + 12000 - 2500 - 4000 - 1500) - 46500, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: -5500, say: 'Before the inventory line the reconciliation reaches $52,000, more than the $46,500 reported, so the inventory line is a subtraction: inventory rose.' },
      { value: 10500, say: 'The gain is subtracted from net income, not added: the sale’s cash is reported in investing activities.' },
      { value: 8500, say: 'A fall in accounts payable is subtracted: the business paid suppliers more than it bought from them.' },
      { value: 13500, say: 'A rise in receivables is subtracted: revenue was recorded faster than cash came in.' },
      { value: -18500, say: 'Depreciation is added back, not subtracted: it reduced net income without using cash.' },
    ],
    solution: 'Work the reconciliation down to the missing line: 48,000 + 12,000 (depreciation) − 2,500 (gain) − 4,000 (receivables up) − 1,500 (payables down) = 52,000. Reported operating cash is 46,500, so the inventory line must be 46,500 − 52,000 = −5,500. A subtraction means inventory rose: Halsey spent $5,500 more on stock than it charged to cost of goods sold.',
  },
  {
    id: 'f02-dg-9', lesson: 'cash-flow-statement', type: 'num', kind: 'applied',
    prompt: 'Penwith Storage Inc., a fictional company reporting under US GAAP, has these 2027 events: it buys a warehouse for $300,000, paying $60,000 in cash and giving the seller a $240,000 note; it settles a $25,000 loan from its founder by issuing her shares; it records $18,000 of depreciation; it buys a 45-day Treasury bill for $10,000; and it pays a $12,000 cash dividend. What total does it disclose beneath its statement of cash flows as noncash investing and financing activities? Enter whole dollars.',
    answer: 265000, check: () => (300000 - 60000) + 25000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 325000, say: 'The $60,000 paid in cash is an investing outflow in the statement itself. Only the part financed by the seller’s note is noncash.' },
      { value: 283000, say: 'Depreciation is a noncash expense, but not an investing or financing activity: it belongs in the indirect reconciliation, not this disclosure.' },
      { value: 240000, say: 'Issuing shares to settle a loan is also financing without cash, so it is disclosed too.' },
      { value: 275000, say: 'Buying a 45-day Treasury bill moves money within cash and cash equivalents; it is neither a cash flow nor a noncash activity to disclose.' },
      { value: 277000, say: 'The cash dividend is a financing outflow reported in the statement itself.' },
    ],
    solution: 'Noncash investing and financing activities are investing or financing transactions with no cash: the part of the warehouse paid for with the seller’s note ($240,000) and the loan settled with shares ($25,000), $265,000 in all. The $60,000 cash part of the warehouse is an investing outflow and the dividend a financing outflow in the statement; depreciation appears only in the indirect reconciliation; the Treasury bill is a cash equivalent.',
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
export const route = [
  { module: 2, ifAtLeast: 0.8 },
  { module: 3, ifAtLeast: 0.9 },
  { module: 4, ifAtLeast: 0.933 },
];
