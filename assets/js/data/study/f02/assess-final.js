// assess-final.js — F02 cumulative final: 25 items, every lesson two or three times; eight conceptual, eight numerical
// and nine applied. Four items follow one business across several statements: a membership deferral (revenue, unearned
// revenue, operating cash and the indirect method), two inventory count errors in successive years, after tax (income
// statement and balance sheet), a disposal through all three statements, and Lantern’s van note in 2027 (interest
// expense, interest payable, the current portion and the split of the payment between operating and financing).
// New questions, not copies of lesson exercises, module-test or project items: every other business here is fictional
// and appears nowhere else in the site. Lantern’s 2027 events are hypothetical (“Suppose…”) and agree with case.js.
// No hints; solutions show in review. 70% passes. Gains and losses on disposals sit inside operating income
// (ASC 360-10-45-5), as in the course chart.
import { FACTS } from './case.js';

const usd = (x) => `$${x.toLocaleString('en-US')}`;

// Lantern’s van note in 2027 (item f02-fn-23), from the case facts
const VN = FACTS.vanNote;
const vanAccrued2026 = VN.principal * VN.rate * VN.months / 12;                                        // 700, June–December 2026
const vanInterestPaid = VN.principal * VN.rate;                                                        // 1,200 for June 2026 – May 2027
const vanPayment = VN.instalment + vanInterestPaid;                                                    // 6,200 on 1 June 2027
const vanLeft = VN.principal - VN.instalment;                                                          // 15,000 after the first instalment
const vanExpense2027 = VN.principal * VN.rate * 5 / 12 + vanLeft * VN.rate * 7 / 12;                    // 500 + 525 = 1,025
const vanPayable2027 = vanLeft * VN.rate * 7 / 12;                                                     // 525, June–December 2027

export const items = [
  // ---------------------------------------------------------------- revenue-recognition
  {
    id: 'f02-fn-1', lesson: 'revenue-recognition', type: 'mc', kind: 'conceptual',
    prompt: 'Foxglove Barn, a fictional wedding venue, sells a couple a package for $9,000, paid in full on booking: their engagement party at the barn on 12 December 2026 and their wedding there on 20 March 2027. Sold separately, it charges $4,000 for a party and $6,000 for a wedding. Its year ends on 31 December. How much revenue from the package does it recognise in 2026, and why?',
    options: [
      '$3,600: the $1,000 discount is shared in proportion to the stand-alone prices',
      '$4,000: the party keeps its own price, and the wedding absorbs the whole discount',
      '$4,500: the $9,000 is split equally, because the two events matter equally to the couple',
      '$9,000: the whole price is earned when the couple pays it in December',
    ],
    answer: 0,
    feedback: {
      1: 'Nothing in the contract ties the discount to the wedding. Step 4 spreads a bundle discount over all the obligations in proportion to their stand-alone selling prices.',
      2: 'The price is allocated by stand-alone selling prices, not in equal shares: the wedding would sell for more on its own, so it takes the larger share.',
      3: 'Payment isn’t a recognition event. The wedding hasn’t happened by 31 December, so its share of the price is still owed in service: a contract liability.',
    },
    solution: 'Two distinct performance obligations (step 2) share a $9,000 transaction price (step 3). Their stand-alone selling prices total 4,000 + 6,000 = $10,000, so each receives 9,000 ÷ 10,000 = 90% of its own price (step 4): party $3,600, wedding $5,400. The party is held on 12 December, so $3,600 is revenue in 2026 (step 5); the other $5,400 stays in unearned revenue (a contract liability) until the wedding on 20 March 2027.',
  },
  {
    id: 'f02-fn-2', lesson: 'revenue-recognition', type: 'journal', kind: 'applied', chart: 'f02', date: '2027-01-14',
    prompt: 'Pembury Home, a fictional online homeware shop, keeps perpetual inventory records. On 14 January 2027 a customer returns two table lamps bought on 6 January for $95 each, which had cost Pembury $52 each. Pembury refunds $190 to the customer’s card and puts the undamaged lamps back on sale. Record the return in one compound entry.',
    accounts: ['Cash', 'Accounts Receivable', 'Online Sales Revenue', 'Sales Returns and Allowances', 'Sales Discounts', 'Inventory', 'Cost of Goods Sold', 'Unearned Revenue', 'Miscellaneous Expense'],
    lines: [{ acct: 'Sales Returns and Allowances', dr: 190 }, { acct: 'Inventory', dr: 104 }, { acct: 'Cash', cr: 190 }, { acct: 'Cost of Goods Sold', cr: 104 }],
    solution: 'The return undoes both halves of the sale. Revenue side: debit Sales Returns and Allowances 190 (a contra-revenue account, so the original sale stays visible in Online Sales Revenue) and credit Cash 190. Cost side: the lamps can be sold again, so they go back into inventory at their cost, 2 × 52 = $104: debit Inventory 104 and credit Cost of Goods Sold 104. Debits and credits both total $294, and gross profit falls by 190 − 104 = $86, the margin on the lost sale. Had the lamps been broken and thrown away, only the first pair of lines would be recorded.',
  },
  {
    id: 'f02-fn-3', lesson: 'revenue-recognition', type: 'multi', kind: 'applied',
    prompt: 'Stillwater Swim School, a fictional business reporting under US GAAP, sells 80 annual family memberships on 1 November 2026 at $750 each, paid in cash, for unlimited swimming from 1 November 2026 to 31 October 2027. Its year ends on 31 December, and it prepares the operating section of its statement of cash flows by the indirect method. Looking only at the memberships, which statements about its 2026 financial statements are true? Select all that apply.',
    options: [
      'The income statement includes $10,000 of membership revenue.',
      'The balance sheet shows a $50,000 current liability for unearned revenue.',
      'Operating activities include the $60,000 received from members.',
      'The indirect method adds the $50,000 increase in unearned revenue to net income.',
      'Revenue includes all $60,000, because the fees can’t be refunded.',
      'Accounts receivable includes $50,000 for the months still to come.',
      'Financing activities include the $60,000, because members fund the school in advance.',
      'Retained earnings rise by $60,000 before the costs of running the pool.',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'Whether or not the fees can be refunded, the school earns them by providing swimming month by month. Ten of the twelve months are still to come.',
      5: 'The members have already paid, so they owe nothing. The school is the one that owes: ten months of swimming, a liability.',
      6: 'Customers paying in advance for services is an operating cash flow. Financing covers owners and lenders.',
      7: 'Retained earnings rise only through net income, and only $10,000 of the fees has been earned.',
    },
    solution: 'Cash received: 80 × 750 = $60,000, an operating inflow. Earned in 2026: two months of twelve, 60,000 × 2 ÷ 12 = $10,000 of revenue (and so $10,000 more net income and retained earnings, before costs). The other $50,000 is unearned revenue, a current liability because the swimming is provided within the next ten months. In the indirect method, net income contains only the $10,000, so the $50,000 increase in unearned revenue is added to reach the $60,000 of operating cash. No receivable arises: the members paid in full.',
  },

  // ---------------------------------------------------------------- inventory-and-cost-of-goods-sold
  {
    id: 'f02-fn-4', lesson: 'inventory-and-cost-of-goods-sold', type: 'num', kind: 'numerical',
    prompt: 'Dunlin Wines, a fictional merchant, uses a periodic system. It starts the year with 200 cases of a house red costing $60 a case, buys 300 cases at $66 and then 500 at $72, and sells 800 cases at $100 each. By how many percentage points is its gross margin on the wine higher under FIFO than under LIFO? Give two decimal places.',
    answer: 3, check: () => {
      const sales = 800 * 100;
      const fifo = 200 * 60 + 300 * 66 + 300 * 72;                  // oldest first: 53,400
      const lifo = 500 * 72 + 300 * 66;                             // newest first: 55,800
      return ((sales - fifo) - (sales - lifo)) / sales * 100;
    },
    unit: 'percentage points', places: 2, tol: 0.005,
    wrong: [
      { value: 33.25, say: 'That is the FIFO gross margin itself. The question asks for the gap between the FIFO and LIFO margins.' },
      { value: 30.25, say: 'That is the LIFO gross margin. Subtract it from the FIFO margin, 33.25%.' },
      { value: -3, say: 'With costs rising, FIFO charges the older, cheaper cases to cost of goods sold, so its margin is the higher one.' },
      { value: 1.05, say: 'That compares FIFO with the weighted average ($67.80 a case). The question asks about LIFO.' },
      { value: 2400, say: 'That is the gap in dollars of cost of goods sold (and gross profit). Express it as a share of the $80,000 of sales.' },
    ],
    solution: 'Goods available: 1,000 cases costing 12,000 + 19,800 + 36,000 = $67,800; 200 cases remain. FIFO cost of goods sold takes the oldest cases: 200 × 60 + 300 × 66 + 300 × 72 = $53,400, so gross profit is 80,000 − 53,400 = $26,600, a margin of 33.25%. LIFO takes the newest: 500 × 72 + 300 × 66 = $55,800, gross profit $24,200, a margin of 30.25%. FIFO’s margin is 33.25 − 30.25 = 3.00 percentage points higher, because in a year of rising costs LIFO matches the dearest costs against sales; the same $2,400 is why LIFO would lower the tax bill.',
  },
  {
    id: 'f02-fn-5', lesson: 'inventory-and-cost-of-goods-sold', type: 'fill', kind: 'applied',
    prompt: 'Mortlake Hardware, a fictional shop, uses a periodic system and pays income tax at 25% of its income before tax. Its count on 31 December 2026 counted one aisle twice, overstating ending inventory by $4,000. Its count on 31 December 2027 missed a storeroom, understating ending inventory by $1,500. Neither error was found, and every later count was correct. Complete the effects on its financial statements.',
    text: 'Net income for 2026 is [[0]]. Net income for 2027 is [[1]]. On the balance sheet at 31 December 2027, inventory is [[2]] and retained earnings are [[3]].',
    blanks: [
      { options: ['overstated by $4,000', 'understated by $3,000', 'overstated by $3,000', 'correct'], answer: 2 },
      { options: ['understated by $1,125', 'understated by $4,125', 'understated by $1,875', 'overstated by $1,875'], answer: 1 },
      { options: ['understated by $1,500', 'overstated by $2,500', 'understated by $5,500', 'correct'], answer: 0 },
      { options: ['correct', 'overstated by $1,875', 'understated by $4,125', 'understated by $1,125'], answer: 3 },
    ],
    solution: '2026: closing inventory $4,000 too high, so cost of goods sold $4,000 too low and income before tax $4,000 too high; after 25% tax, net income is overstated by 4,000 × 0.75 = $3,000. 2027: opening inventory is $4,000 too high and closing inventory $1,500 too low, and both make cost of goods sold too high: by 4,000 + 1,500 = $5,500, so net income is understated by 5,500 × 0.75 = $4,125. At 31 December 2027 only the second error remains in the balance sheet: inventory is understated by $1,500, and retained earnings, which hold both years’ net income, are understated by 4,125 − 3,000 = $1,125: the 2027 error after tax. The other $375 is tax: the tax charged on the reported figures is $375 too low, so income taxes payable is too. When the 2028 count is correct, the second error reverses as well.',
  },
  {
    id: 'f02-fn-6', lesson: 'inventory-and-cost-of-goods-sold', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about perpetual and periodic inventory records are true? Select all that apply.',
    options: [
      'Under FIFO, perpetual and periodic records give the same cost of goods sold.',
      'A business with perpetual records still needs a physical count, to find shrinkage and damaged goods.',
      'A periodic system finds cost of goods sold after the count: opening inventory plus purchases less closing inventory.',
      'Under LIFO, perpetual and periodic records always give the same cost of goods sold.',
      'Perpetual records make a write-down to net realisable value unnecessary, because each sale is costed when it happens.',
      'The moving average is a periodic method: one average is worked out for the whole year at the year end.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Perpetual LIFO costs each sale from the layers on hand at that date, so it can differ from periodic LIFO, which uses the newest layers of the whole period.',
      4: 'Costing each sale says nothing about whether the goods still on hand can be sold for more than they cost. Only a count and a review of selling prices find that.',
      5: 'The moving average belongs to perpetual records: it is recalculated after every purchase. The periodic version uses one average for the period.',
    },
    solution: 'True: FIFO gives the same answer whenever costs are assigned, because the oldest goods on hand are always the oldest; a count is still needed under a perpetual system to find shrinkage and goods worth less than cost; a periodic system derives cost of goods sold from the count. False: perpetual and periodic LIFO (and the moving and periodic averages) generally differ; perpetual records don’t replace the lower of cost and net realisable value test; the moving average is a perpetual method.',
  },

  // ---------------------------------------------------------------- income-statement
  {
    id: 'f02-fn-7', lesson: 'income-statement', type: 'num', kind: 'numerical',
    prompt: 'Tamworth Valves Inc., a fictional manufacturer, reports net income of $84,600 after income tax expense of $28,200. After operating income, its multi-step income statement shows interest expense of $9,400 and interest revenue of $3,000 earned on a bank deposit; it has no other items there. What is its operating income? Enter whole dollars.',
    answer: 119200, check: () => (84600 + 28200) + 9400 - 3000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 122200, say: 'That is EBIT: net income plus interest expense and income tax. It still contains the $3,000 of interest revenue, which sits after operating income, so take it out.' },
      { value: 125200, say: 'Interest revenue increased net income, so working back up to operating income it is subtracted, not added.' },
      { value: 112800, say: 'That is income before income tax. Interest expense and interest revenue also sit between it and operating income.' },
      { value: 100400, say: 'Interest expense reduced net income, so working back up it is added back, not subtracted.' },
    ],
    solution: 'Work up from the bottom. Income before income tax = 84,600 + 28,200 = $112,800. Undo the items after operating income: add back interest expense (+9,400) and take out interest revenue (−3,000): operating income = 112,800 + 9,400 − 3,000 = $119,200. EBIT, net income plus interest expense and income tax, is 84,600 + 9,400 + 28,200 = $122,200: operating income plus the other income. The two are equal only when, as at Lantern, there is no other income.',
  },
  {
    id: 'f02-fn-8', lesson: 'income-statement', type: 'classify', kind: 'conceptual',
    prompt: 'Marlowe Office Supplies, a fictional retailer, presents its expenses by function on a multi-step income statement. Where does each cost belong?',
    items: [
      'The cost of the paper and printer cartridges sold to customers',
      'Freight paid to bring goods from manufacturers to Marlowe’s warehouse, for goods since sold',
      'Wages of the drivers who deliver orders to customers',
      'Online advertising',
      'The finance director’s salary',
      'The fee for the annual audit',
      'Interest on a bank loan',
      'Federal and state taxes on the year’s profit',
    ],
    categories: ['Cost of sales', 'Selling and fulfilment', 'General and administrative', 'Other income and expense', 'Income tax expense'],
    answer: [0, 0, 1, 1, 2, 2, 3, 4],
    feedback: {
      1: 'Freight-in is part of the cost of inventory, so it reaches the income statement through cost of goods sold when the goods are sold.',
      2: 'Delivering to customers (freight-out) is a cost of selling and fulfilling orders, not part of the goods’ cost.',
      5: 'The audit serves the business as a whole: general and administrative.',
      6: 'Interest is a cost of borrowing, shown after operating income.',
    },
    solution: 'Cost of sales: the goods sold, including the freight-in capitalised in their cost. Selling and fulfilment: delivery drivers’ wages (freight-out) and advertising. General and administrative: the finance director’s salary and the audit fee. Other income and expense, after operating income: interest. Income tax expense: the taxes on profit, last of all.',
  },

  // ---------------------------------------------------------------- receivables-and-payables
  {
    id: 'f02-fn-9', lesson: 'receivables-and-payables', type: 'journal', kind: 'applied', chart: 'f02', date: '2026-12-31',
    prompt: 'Bosworth Paper Merchants, a fictional wholesaler, ages its receivables at 31 December 2026, and the aging says its allowance for doubtful accounts should be $3,150. Fewer customers defaulted during the year than expected, and before any adjustment the allowance has a credit balance of $3,900. Record the year-end adjusting entry.',
    accounts: ['Bad Debt Expense', 'Allowance for Doubtful Accounts', 'Accounts Receivable', 'Cash', 'Sales Returns and Allowances', 'Retained Earnings', 'Miscellaneous Expense'],
    lines: [{ acct: 'Allowance for Doubtful Accounts', dr: 750 }, { acct: 'Bad Debt Expense', cr: 750 }],
    solution: 'Under the balance sheet approach the entry brings the allowance to the balance the aging requires. It already holds $3,900, which is $750 more than the $3,150 needed, so the allowance must fall: debit Allowance for Doubtful Accounts 750 and credit Bad Debt Expense 750. Expense = required − unadjusted = 3,150 − 3,900 = −$750, a reduction of the year’s bad debt expense because earlier estimates were too high. Accounts Receivable is untouched: no customer has been written off.',
  },
  {
    id: 'f02-fn-10', lesson: 'receivables-and-payables', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about the two ways of estimating bad debts are true? Select all that apply.',
    options: [
      'The income statement approach multiplies the period’s credit sales by a loss rate to give the expense.',
      'Under the balance sheet approach, a debit balance in the allowance before adjustment increases the expense.',
      'The percentage of sales is quick but doesn’t test whether the allowance left is sensible.',
      'Under the balance sheet approach, the year’s expense always equals the allowance’s balance after adjustment.',
      'An aging of receivables is one form of the income statement approach, because it uses loss rates.',
      'Either approach removes the need to write off a customer’s balance once it is known to be uncollectible.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Only if the allowance stood at zero before the adjustment. The expense is the required balance minus the unadjusted balance, so a credit balance makes it smaller and a debit balance larger.',
      4: 'An aging starts from the receivables held at the period end and decides how large the allowance must be: the balance sheet approach.',
      5: 'The estimate covers losses on the pool of receivables. When a particular customer’s balance proves uncollectible it is still written off against the allowance.',
    },
    solution: 'The income statement approach applies a loss rate to credit sales and records the result as the expense; whatever is then in the allowance is its balance, which nothing in the method tests. The balance sheet approach (most often an aging) sets the balance the allowance must have and records whatever expense gets it there: required − unadjusted, so a debit balance adds to the expense. Under either approach specific uncollectible balances are written off against the allowance.',
  },

  // ---------------------------------------------------------------- long-lived-assets
  {
    id: 'f02-fn-11', lesson: 'long-lived-assets', type: 'num', kind: 'numerical',
    prompt: 'Ferncliff Dental Group, a fictional US private company reporting under US GAAP, buys a dental practice on 1 January 2027 for $1,450,000. The practice’s own books show assets of $1,020,000 and liabilities of $260,000. At fair value, its identifiable assets are worth $1,180,000 (including a patient list it had never recorded) and its liabilities $260,000. Ferncliff elects the private-company alternative and amortises goodwill on a straight line over ten years. What is the goodwill amortisation for 2027? Enter whole dollars.',
    answer: 53000, check: () => (1450000 - (1180000 - 260000)) / 10, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 69000, say: 'That uses the practice’s book values. Goodwill is the price paid less the fair value of the identifiable net assets.' },
      { value: 27000, say: 'Deduct the liabilities Ferncliff takes on: the net assets acquired are 1,180,000 − 260,000 = 920,000.' },
      { value: 0, say: 'A public company wouldn’t amortise goodwill, but a US private company may elect to amortise it over ten years or less, and Ferncliff has.' },
      { value: 530000, say: 'That is the goodwill itself. Spread it over ten years for one year’s amortisation.' },
      { value: 145000, say: 'Only the goodwill is amortised as goodwill; the price also buys identifiable assets, which are recorded and depreciated or amortised separately.' },
    ],
    solution: 'Goodwill = price paid − (fair value of identifiable assets − fair value of liabilities) = 1,450,000 − (1,180,000 − 260,000) = $530,000. The patient list is an identifiable intangible asset, so it is part of the $1,180,000, not of goodwill. Under the private-company alternative (ASU 2014-02), amortisation is 530,000 ÷ 10 = $53,000 a year. A public company would not amortise the goodwill but test it for impairment at least annually.',
  },
  {
    id: 'f02-fn-12', lesson: 'long-lived-assets', type: 'fill', kind: 'applied',
    prompt: 'Pressmark Printing, a fictional US company, sells a printing press on 30 June 2027 for $9,000 in cash. The press cost $48,000, and its accumulated depreciation, brought up to the date of sale, is $35,500. It prepares its operating cash flows by the indirect method. Ignoring income tax, complete the sale’s effects on its 2027 statements.',
    text: 'On the income statement the sale gives [[0]], which is included in operating income. In the operating section of the statement of cash flows, the accountant [[1]] net income. The investing section shows [[2]]. On the balance sheet, property and equipment, net of accumulated depreciation, falls by [[3]], and total assets fall by [[4]].',
    blanks: [
      { options: ['a gain of $9,000', 'a loss of $3,500', 'a gain of $3,500', 'a loss of $12,500'], answer: 1 },
      { options: ['adds $3,500 back to', 'subtracts $3,500 from', 'adds $9,000 to', 'makes no adjustment to'], answer: 0 },
      { options: ['an outflow of $3,500', 'an inflow of $12,500', 'an inflow of $3,500', 'an inflow of $9,000'], answer: 3 },
      { options: ['$3,500', '$12,500', '$35,500', '$48,000'], answer: 1 },
      { options: ['$12,500', '$9,000', '$3,500', '$0'], answer: 2 },
    ],
    solution: 'Book value = 48,000 − 35,500 = $12,500; proceeds $9,000; loss = 12,500 − 9,000 = $3,500, reported within operating income (ASC 360-10-45-5). Indirect method: the loss reduced net income without using operating cash, so it is added back. Investing: the whole $9,000 received is an inflow. Balance sheet: Equipment falls by 48,000 and Accumulated Depreciation by 35,500, so the net figure falls by $12,500; cash rises by $9,000, so total assets fall by 12,500 − 9,000 = $3,500, matching the fall in equity through the loss.',
  },
  {
    id: 'f02-fn-13', lesson: 'long-lived-assets', type: 'num', kind: 'applied',
    prompt: 'Strathmore Conference Centre Ltd, a fictional company reporting under IFRS, uses the revaluation model for its land, which is not depreciated. It bought the land in 2024 for $1,800,000 and revalued it to its fair value of $2,300,000 at 31 December 2025, the only revaluation before 2027. At 31 December 2027 the land’s fair value has fallen to $1,650,000. How much of the decrease does it recognise in profit or loss for 2027? Enter whole dollars.',
    answer: 150000, check: () => { const fall = 2300000 - 1650000, surplus = 2300000 - 1800000; return Math.max(0, fall - surplus); }, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 650000, say: 'Part of the decrease reverses the earlier increase, which went to other comprehensive income. That part is taken out of the revaluation surplus, not profit or loss.' },
      { value: 500000, say: 'That is the part charged against the revaluation surplus in other comprehensive income. The question asks for the part in profit or loss.' },
      { value: 0, say: 'The surplus holds only the $500,000 the land gained in 2025. The fall below the original cost has nothing left to reverse, so it goes to profit or loss.' },
    ],
    solution: 'The 2025 increase, 2,300,000 − 1,800,000 = $500,000, went to other comprehensive income and built a revaluation surplus in equity. The 2027 decrease is 2,300,000 − 1,650,000 = $650,000. IAS 16 charges a decrease to other comprehensive income to the extent it reverses the asset’s surplus ($500,000), and the rest to profit or loss: 650,000 − 500,000 = $150,000, the amount by which the land has fallen below its cost. Under US GAAP the land would have stayed at its $1,800,000 cost throughout, unless it was impaired.',
  },

  // ---------------------------------------------------------------- balance-sheet-and-equity
  {
    id: 'f02-fn-14', lesson: 'balance-sheet-and-equity', type: 'num', kind: 'numerical',
    prompt: 'Netherby Robotics Inc., a fictional company, starts 2027 with common stock ($1 par) of $50,000, additional paid-in capital of $150,000 and retained earnings of $84,000. During 2027 it issues 5,000 shares at $12 each for cash, earns net income of $46,500 and declares dividends of $18,000, of which $4,500 is still unpaid at 31 December. What total equity does its statement of changes in equity show at 31 December 2027? Enter whole dollars.',
    answer: 372500, check: () => 50000 + 150000 + 84000 + 5000 * 12 + 46500 - 18000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 377000, say: 'Retained earnings fall when a dividend is declared. The $4,500 still unpaid is a liability, but it has already left equity.' },
      { value: 317500, say: 'The share issue adds the whole $60,000 to equity: $5,000 to common stock at par and $55,000 to additional paid-in capital.' },
      { value: 390500, say: 'Deduct the $18,000 of dividends declared: they reduce retained earnings.' },
      { value: 312500, say: 'Include the $60,000 raised by the new shares.' },
    ],
    solution: 'Common stock: 50,000 + 5,000 × $1 = 55,000. Additional paid-in capital: 150,000 + 5,000 × (12 − 1) = 205,000. Retained earnings: 84,000 + 46,500 − 18,000 = 112,500. Total equity = 55,000 + 205,000 + 112,500 = $372,500. The unpaid $4,500 is a current liability (dividends payable); equity fell by the whole $18,000 on declaration.',
  },
  {
    id: 'f02-fn-15', lesson: 'balance-sheet-and-equity', type: 'journal', kind: 'applied', chart: 'f02', date: '2027-03-31',
    prompt: 'On 1 March 2027 Wisteria Analytics Inc., a fictional company, issued 6,000 shares of $2 par common stock at $15 a share for cash. The bookkeeper debited Cash and credited Common Stock with the whole $90,000. The error is found on 31 March, before any statements are prepared. Record the correcting entry.',
    accounts: ['Cash', 'Common Stock', 'Additional Paid-in Capital', 'Retained Earnings', 'Dividends', 'Dividends Payable', 'Notes Payable'],
    lines: [{ acct: 'Common Stock', dr: 78000 }, { acct: 'Additional Paid-in Capital', cr: 78000 }],
    solution: 'Common Stock should hold only the par value of the shares issued, 6,000 × $2 = $12,000; the other 6,000 × (15 − 2) = $78,000 belongs in additional paid-in capital. Cash was recorded correctly. So move $78,000: debit Common Stock 78,000 and credit Additional Paid-in Capital 78,000. Total equity and total contributed capital don’t change; only the split between the two lines does.',
  },

  // ---------------------------------------------------------------- cash-flow-statement
  {
    id: 'f02-fn-16', lesson: 'cash-flow-statement', type: 'num', kind: 'numerical',
    prompt: 'Bramblecote Veterinary Clinic, a fictional practice, presents its operating cash flows by the direct method. Its income statement shows other operating expenses of $186,000 (everything except cost of goods sold and wages), which include depreciation of $22,000 and bad debt expense of $3,000. During the year its prepaid expenses fell from $9,500 to $7,000, and its accrued liabilities for these expenses rose from $11,000 to $15,000. How much cash did it pay for these other operating expenses? Enter whole dollars.',
    answer: 154500, check: () => (186000 - 22000 - 3000) + (7000 - 9500) - (15000 - 11000), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 157500, say: 'Bad debt expense uses no cash either: it is an estimate of receivables that won’t be collected. Leave it out, as well as depreciation.' },
      { value: 176500, say: 'Depreciation uses no cash: the cash left when the equipment was bought. Leave it out.' },
      { value: 159500, say: 'Prepaid expenses fell, so part of this year’s expense was paid for last year: subtract the $2,500 decrease.' },
      { value: 162500, say: 'Accrued liabilities rose, so part of this year’s expense is still unpaid: subtract the $4,000 increase.' },
      { value: 161000, say: 'That leaves out the noncash items but not the balance sheet changes. Adjust for the fall in prepaid expenses and the rise in accrued liabilities.' },
    ],
    solution: 'Start from the expenses that are paid in cash: 186,000 − 22,000 (depreciation) − 3,000 (bad debts) = 161,000. Cash paid = expense + Δprepaid − Δaccrued liability = 161,000 + (7,000 − 9,500) − (15,000 − 11,000) = 161,000 − 2,500 − 4,000 = $154,500. Less cash went out than the expense because some of the year’s costs were prepaid last year and some are still owed.',
  },
  {
    id: 'f02-fn-17', lesson: 'cash-flow-statement', type: 'classify', kind: 'conceptual',
    prompt: 'Dovecote Event Hire, a fictional US company, presents its operating cash flows by the direct method, using the categories of ASC 230. On which line, if any, of its operating section does each cash flow belong?',
    items: [
      'Deposits received in December for marquee hire next June',
      'Refunds paid to customers after a festival was cancelled',
      'Rent paid for the warehouse',
      'Wages paid to the crew who put up the marquees',
      'Interest paid on the bank loan',
      'Quarterly estimated income tax payments',
      'Cash paid for a new delivery lorry',
      'Dividends paid to shareholders',
    ],
    categories: ['Cash received from customers', 'Cash paid to suppliers', 'Cash paid to employees', 'Interest paid', 'Income taxes paid', 'Not in the operating section'],
    answer: [0, 0, 1, 2, 3, 4, 5, 5],
    feedback: {
      0: 'Advance payments come from customers, so they belong in cash received from customers in the year they arrive, although the revenue is next year’s.',
      1: 'Refunds reverse receipts from customers, so they reduce the customers line.',
      4: 'Under US GAAP interest paid is an operating cash flow, shown on its own line.',
      6: 'Buying a long-lived asset is an investing activity.',
      7: 'Dividends paid are a financing activity under US GAAP.',
    },
    solution: 'Customers: deposits received (net of the refunds paid). Suppliers: rent, like other payments for goods and services. Employees: the crew’s wages. Interest paid and income taxes paid have their own lines. The lorry is an investing outflow and the dividends a financing outflow, so neither appears in the operating section.',
  },
  {
    id: 'f02-fn-18', lesson: 'cash-flow-statement', type: 'num', kind: 'numerical',
    prompt: 'Ormsby Logistics Inc., a fictional US company, has these 2027 events: it issues 10,000 shares of common stock for $85,000 in cash; it issues shares worth $40,000 to the owner of a plot of land in exchange for the land; it borrows $120,000 from its bank; it repays $70,000 of principal on an older loan, together with $9,500 of interest; it pays the $6,000 dividend declared in December 2026; and it declares dividends of $30,000 in 2027, of which $7,500 is unpaid at 31 December 2027. What is its net cash from financing activities for 2027? Enter whole dollars.',
    answer: 106500, check: () => 85000 + 120000 - 70000 - (6000 + (30000 - 7500)), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 97000, say: 'Under US GAAP interest paid is an operating cash flow. Only the $70,000 of principal is financing.' },
      { value: 146500, say: 'The shares given for the land brought in no cash: a noncash investing and financing activity, disclosed beneath the statement.' },
      { value: 112500, say: 'The $6,000 declared in December 2026 was paid in 2027, so it is a 2027 financing outflow too.' },
      { value: 105000, say: 'Count dividends paid, not declared: $6,000 from last year plus $22,500 of this year’s.' },
      { value: 99000, say: 'The $7,500 still unpaid at the year end isn’t a 2027 cash flow.' },
    ],
    solution: 'Inflows: shares issued for cash 85,000; bank loan 120,000. Outflows: loan principal 70,000; dividends paid 6,000 + (30,000 − 7,500) = 28,500. Net cash from financing = 85,000 + 120,000 − 70,000 − 28,500 = $106,500. The $9,500 of interest is operating under US GAAP, and the land bought with shares is disclosed as a noncash investing and financing activity.',
  },

  // ---------------------------------------------------------------- indirect-method
  {
    id: 'f02-fn-19', lesson: 'indirect-method', type: 'num', kind: 'numerical',
    prompt: 'Rinsewell Laundries, a fictional US company, prepares its operating cash flows by the indirect method. Its current balances are shown below. What is the net total of the working-capital adjustments in its operating section for 2027? Enter whole dollars, with a minus sign for a net subtraction.',
    data: { table: { head: ['Account', '1 January 2027 ($)', '31 December 2027 ($)'], rows: [
      ['Cash', '24,000', '31,500'],
      ['Accounts receivable', '58,000', '66,500'],
      ['Supplies (detergent and packaging)', '41,000', '37,800'],
      ['Prepaid rent', '6,000', '6,600'],
      ['Accounts payable', '33,000', '35,900'],
      ['Wages payable', '4,200', '3,500'],
      ['Unearned revenue (prepaid laundry contracts)', '7,500', '10,100'],
      ['Dividends payable', '5,000', '8,000'],
      ['Current portion of long-term debt', '20,000', '25,000'],
    ] } },
    answer: -1100,
    check: () => -(66500 - 58000) - (37800 - 41000) - (6600 - 6000) + (35900 - 33000) + (3500 - 4200) + (10100 - 7500),
    unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 6900, say: 'Dividends payable and the current portion of long-term debt are financing items: leave their changes out of the operating section.' },
      { value: 3900, say: 'The current portion of long-term debt is debt reclassified from noncurrent, a financing item. Leave it out.' },
      { value: 1900, say: 'Dividends payable belong to financing (dividends paid). Leave the change out.' },
      { value: 1100, say: 'Check the signs: an increase in an operating asset is subtracted and an increase in an operating liability is added.' },
      { value: -8600, say: 'Cash is what the statement explains, so its own change is never an adjustment.' },
      { value: -600, say: 'That subtracts the whole change in working capital. The operating section uses only the operating items: not cash, dividends payable or the current portion of debt.' },
    ],
    solution: 'Use the operating items only: receivables rose 8,500 (−8,500); supplies fell 3,200 (+3,200); prepaid rent rose 600 (−600); accounts payable rose 2,900 (+2,900); wages payable fell 700 (−700); unearned revenue rose 2,600 (+2,600). Net total = −8,500 + 3,200 − 600 + 2,900 − 700 + 2,600 = −$1,100. Cash is the figure being explained, and dividends payable and the current portion of long-term debt belong to financing, so their changes are left out.',
  },
  {
    id: 'f02-fn-20', lesson: 'indirect-method', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional removals company sells an old van for $14,000 in cash, at a gain of $3,000, and prepares its operating cash flows by the indirect method under US GAAP. Why does it subtract the $3,000 from net income?',
    options: [
      'The whole $14,000 is an investing inflow, and the gain in net income is part of it',
      'A gain is a noncash item like depreciation: no cash changed hands when the van was sold',
      'Gains on disposals are financing cash flows under US GAAP, so they move to that section',
      'The gain is reported below operating income, so operating activities may not include it',
    ],
    answer: 0,
    feedback: {
      1: 'Cash did change hands: $14,000. The point is where that cash is reported, not whether there was any.',
      2: 'Proceeds from selling long-lived assets are investing inflows. Nothing about a disposal is financing.',
      3: 'Under ASC 360-10-45-5 the gain sits inside operating income. It is subtracted because the cash it represents is already counted in investing.',
    },
    solution: 'The $14,000 received is the van’s book value ($11,000) plus the gain ($3,000), and all of it is reported as an investing inflow. Net income already includes the $3,000 gain, so leaving it there would count that cash twice, once in operating and once in investing activities. Subtracting it leaves operating cash flow free of the sale. A loss is added back for the mirror-image reason.',
  },

  // ---------------------------------------------------------------- linking-the-statements
  {
    id: 'f02-fn-21', lesson: 'linking-the-statements', type: 'mc', kind: 'applied',
    prompt: 'On the first draft of its balance sheet at 31 December 2027, Yardley Opticians Inc., a fictional company, finds that total assets exceed total liabilities and equity by $43,400. Its net income for 2027 was $61,400, and it declared dividends of $18,000, of which $3,000 is unpaid. Its income statement and statement of changes in equity are correct. Which error explains the difference?',
    options: [
      'Retained earnings were taken from the adjusted trial balance, before closing entries',
      'Net income was left out of retained earnings, although the dividends were deducted',
      'The $3,000 of dividends payable was left out of the draft’s current liabilities',
      'The year’s dividends were deducted twice when closing retained earnings was worked out',
    ],
    answer: 0,
    feedback: {
      1: 'Leaving out net income but deducting dividends would make the gap $61,400, not $43,400.',
      2: 'Missing dividends payable would leave liabilities $3,000 short: a gap of $3,000.',
      3: 'Deducting the dividends twice would leave retained earnings $18,000 short: a gap of $18,000.',
    },
    solution: 'Before closing, the Retained Earnings account in the adjusted trial balance still shows the opening balance: net income and dividends haven’t been closed into it yet. Copying it to the balance sheet leaves out 61,400 − 18,000 = $43,400, exactly the gap. The fix is to take closing retained earnings from the statement of changes in equity, the link between the income statement and the balance sheet.',
  },
  {
    id: 'f02-fn-22', lesson: 'linking-the-statements', type: 'multi', kind: 'conceptual',
    prompt: 'In one year’s complete set of financial statements, which pairs of figures must always be equal? Select all that apply.',
    options: [
      'Net income on the income statement and net income in the statement of changes in equity',
      'Closing retained earnings in the statement of changes in equity and on the balance sheet',
      'Closing cash on the statement of cash flows and the balance sheet cash balances it explains',
      'Dividends declared in the statement of changes in equity and dividends paid under financing activities',
      'Depreciation expense for the year and the year’s increase in accumulated depreciation on the balance sheet',
      'Revenue on the income statement and cash received from customers on the statement of cash flows',
      'Net income and net cash from operating activities',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'They differ whenever dividends payable change: a dividend declared in December and paid in January is in this year’s equity statement and next year’s cash flows.',
      4: 'Selling or scrapping an asset removes its accumulated depreciation, so the account can rise by less than the year’s depreciation, or even fall.',
      5: 'Changes in receivables and unearned revenue, and write-offs, make cash from customers differ from revenue.',
      6: 'They differ by the noncash items and working-capital changes the indirect method lists.',
    },
    solution: 'The statements articulate: net income passes from the income statement into the statement of changes in equity; closing retained earnings (and every other component of equity) pass from that statement to the balance sheet; and the statement of cash flows ends at the balance sheet’s cash and cash equivalents (with any restricted cash, under US GAAP). The other pairs differ by timing: dividends payable, disposals, receivables and unearned revenue, and all the accruals between net income and operating cash flow.',
  },
  {
    id: 'f02-fn-23', lesson: 'linking-the-statements', type: 'fill', kind: 'applied',
    prompt: `Lantern’s van note (y4) is ${usd(VN.principal)} at ${VN.rate * 100}%, repaid in instalments of ${usd(VN.instalment)} each 1 June from 2027 to 2030, with the year’s interest paid on each instalment date. At 31 December 2026 Lantern had accrued ${usd(vanAccrued2026)} of interest on it and shown ${usd(VN.instalment)} as current. Suppose every 2027 payment is made on time. Complete the description of the note in Lantern’s 2027 statements (US GAAP).`,
    text: 'On 1 June 2027 Lantern pays [[0]] in total, of which its statement of cash flows reports [[1]] in operating activities and the rest in financing activities. The van note’s interest expense for 2027 is [[2]]. At 31 December 2027 the balance sheet shows interest payable on the van note of [[3]], and the van note’s current portion is [[4]].',
    blanks: [
      { options: [usd(VN.instalment), usd(VN.instalment + vanAccrued2026), usd(vanPayment), usd(VN.instalment + 500)], answer: 2 },
      { options: [usd(vanAccrued2026), usd(vanInterestPaid), '$0', usd(vanPayment)], answer: 1 },
      { options: [usd(vanInterestPaid), usd(vanLeft * VN.rate), usd(vanExpense2027), usd(vanPayable2027)], answer: 2 },
      { options: [usd(vanPayable2027), '$0', usd(vanAccrued2026), usd(vanLeft * VN.rate)], answer: 0 },
      { options: ['$0', usd(vanLeft), usd(vanLeft - VN.instalment), usd(VN.instalment)], answer: 3 },
    ],
    solution: `On 1 June 2027 Lantern pays the ${usd(VN.instalment)} instalment and a year’s interest, ${usd(VN.principal)} × ${VN.rate * 100}% = ${usd(vanInterestPaid)}: ${usd(vanPayment)} in all. Under US GAAP the interest paid is an operating outflow and the principal a financing outflow. Of the ${usd(vanInterestPaid)}, ${usd(vanAccrued2026)} was 2026’s expense (it settles the interest payable); 2027’s expense is January–May on ${usd(VN.principal)} plus June–December on ${usd(vanLeft)}: ${usd(VN.principal * VN.rate * 5 / 12)} + ${usd(vanPayable2027)} = ${usd(vanExpense2027)}. The June–December interest, ${usd(vanPayable2027)}, is unpaid at 31 December 2027 and shown as interest payable. Of the ${usd(vanLeft)} still owed, the instalment due on 1 June 2028, ${usd(VN.instalment)}, is current and ${usd(vanLeft - VN.instalment)} noncurrent. (Lantern’s total current portion of debt will also include Coastline’s note, due on 1 March 2028.)`,
  },

  // ---------------------------------------------------------------- gaap-and-ifrs
  {
    id: 'f02-fn-24', lesson: 'gaap-and-ifrs', type: 'num', kind: 'numerical',
    prompt: 'Vantor Pumps Inc., a fictional US manufacturer, reports under US GAAP. Its 2027 income before income tax is $2,400,000, and its managers want to know what the figure would be under IFRS. Three differences matter. (1) It uses LIFO; purchase costs rose during 2027, and under FIFO its 2027 cost of goods sold would have been $180,000 lower. (2) At 31 December 2026 it wrote a stock of pump castings down by $60,000; the castings are still unsold, and during 2027 their net realisable value rose above their original cost. (3) Under IFRS it would use the revaluation model for its land, whose fair value rose by $250,000 during 2027. Treating each difference on its own, what would its 2027 income before income tax be under IFRS? Enter whole dollars.',
    answer: 2640000, check: () => 2400000 + 180000 + 60000,   // FIFO, then the reversal; the revaluation goes to other comprehensive income
    unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 2890000, say: 'A revaluation increase goes to other comprehensive income and builds a revaluation surplus in equity; it doesn’t pass through profit.' },
      { value: 2830000, say: 'IAS 2 reverses the castings’ write-down once their value recovers, which adds $60,000 to 2027 profit; and the land revaluation belongs in other comprehensive income, not profit.' },
      { value: 2580000, say: 'That adjusts only for LIFO. Under IAS 2 the $60,000 write-down is also reversed in 2027, because the castings’ value has recovered.' },
      { value: 2460000, say: 'IAS 2 doesn’t allow LIFO either: under FIFO cost of goods sold is $180,000 lower, so income is $180,000 higher.' },
      { value: 2280000, say: 'With rising costs FIFO gives a lower cost of goods sold than LIFO, so IFRS income is higher by $180,000, not lower.' },
    ],
    solution: 'LIFO: IAS 2 doesn’t permit it, and under FIFO cost of goods sold is $180,000 lower, so income rises by $180,000. Write-down: under US GAAP the written-down amount became the castings’ new cost; IAS 2 reverses a write-down when net realisable value recovers, up to the original amount, so all $60,000 comes back into 2027 profit. Land: a revaluation increase goes to other comprehensive income (a revaluation surplus in equity), so it doesn’t change income before tax. IFRS income before tax = 2,400,000 + 180,000 + 60,000 = $2,640,000; equity is also $250,000 higher through the surplus.',
  },
  {
    id: 'f02-fn-25', lesson: 'gaap-and-ifrs', type: 'classify', kind: 'conceptual',
    prompt: 'Compare a company applying IFRS (with IFRS 18 from 2027, and no specified main business activity) with an identical company applying US GAAP. What does each IFRS requirement or option change?',
    items: [
      'IAS 2 doesn’t permit LIFO',
      'IAS 2 reverses an inventory write-down when net realisable value recovers',
      'IAS 38 capitalises development costs once its criteria are met',
      'IAS 16 lets a company carry a class of property at revalued amounts',
      'Interest paid is a financing cash flow under IAS 7 as amended by IFRS 18',
      'Dividends received are an investing cash flow under IAS 7 as amended by IFRS 18',
      'IFRS 18 requires an operating profit subtotal',
      'IFRS 18 requires management-defined performance measures to be explained in a note',
    ],
    categories: ['Measurement: profit, assets or equity', 'Only the classification of cash flows', 'Only presentation or disclosure'],
    answer: [0, 0, 0, 0, 1, 1, 2, 2],
    feedback: {
      3: 'Revaluation changes the carrying amount of the property and equity (through other comprehensive income), and later depreciation with it.',
      4: 'The same interest is paid either way. Moving it from operating to financing changes operating cash flow, not total cash.',
      6: 'A required subtotal rearranges the statement of profit or loss; it doesn’t change any amount in it.',
      7: 'The note explains and reconciles the measure; profit itself is unchanged.',
    },
    solution: 'Measurement differences change reported amounts: the LIFO ban, write-down reversals and capitalised development costs change profit and assets; revaluation changes assets and equity and later depreciation. The IAS 7 amendments only move interest paid and dividends received between sections, leaving total cash unchanged. IFRS 18’s subtotals and its note on management-defined performance measures change presentation and disclosure, not profit.',
  },
];
