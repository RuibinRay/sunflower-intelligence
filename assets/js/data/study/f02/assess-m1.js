// assess-m1.js — F02 module 1 test: Revenue, inventory and the income statement (revenue recognition, inventory and
// cost of goods sold, the multi-step income statement). New questions, not copies of lesson exercises: new businesses,
// new numbers, different angles. No hints; solutions show in review. Lantern’s 2027 events are hypothetical (“Suppose…”)
// and agree with case.js (the two January events were paid for by $1,640 of deposits in December 2026: $900 and $740).

export const items = [
  // ---------------------------------------------------------------- revenue-recognition
  {
    id: 'f02-m1-1', lesson: 'revenue-recognition', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional furniture maker ships a sofa to a customer on 28 December. Its terms say that legal title and the risk of damage pass to the customer on delivery, and the sofa arrives on 3 January. The customer paid in full when ordering in November. The maker’s year ends on 31 December. When does it recognise the revenue?',
    options: ['On 3 January, on delivery', 'On 28 December, on shipment', 'In November, when paid', 'When the order was signed'],
    answer: 0,
    feedback: {
      1: 'Shipping alone doesn’t transfer control here: title, the risk of damage and physical possession all stay with the maker until delivery.',
      2: 'Payment in advance creates a contract liability, not revenue.',
      3: 'Signing creates the contract (step 1); revenue waits for the transfer of control (step 5).',
    },
    solution: 'The sofa is a good, so the obligation is satisfied at a point in time. The indicators of control (legal title, physical possession, risks and rewards) all pass on 3 January, so the revenue belongs to the next year. At 31 December the payment is still a contract liability.',
  },
  {
    id: 'f02-m1-2', lesson: 'revenue-recognition', type: 'num', kind: 'numerical',
    prompt: 'A fictional mobile network sells a contract that includes a handset and 24 months of service for $40 a month, with nothing to pay up front. It sells the handset alone for $600 and the same service without a handset for $25 a month. How much revenue does it recognise when the customer takes the handset? Ignore any financing effect, and round to the nearest dollar.',
    answer: 480, check: () => (40 * 24) * 600 / (600 + 25 * 24), unit: '$', places: 0,
    wrong: [
      { value: 600, say: 'That is the handset’s stand-alone price. The contract’s $960 is shared between the handset and the service in proportion to their stand-alone prices ($600 and $600).' },
      { value: 0, say: 'Revenue follows the transfer of control, not the cash. The customer controls the handset from day one.' },
      { value: 40, say: 'That is one month’s payment. The handset is a separate performance obligation, satisfied when it is handed over.' },
    ],
    solution: 'Transaction price = 24 × 40 = 960. Stand-alone prices: handset 600, service 24 × 25 = 600, total 1,200. Handset: 960 × 600 ÷ 1,200 = $480, recognised when the customer takes it; the other $480 is recognised over the 24 months of service, $20 a month.',
  },
  {
    id: 'f02-m1-3', lesson: 'revenue-recognition', type: 'journal', kind: 'applied', chart: 'f02', date: '2027-01-14',
    prompt: 'Suppose Lantern caters the first of its two January 2027 events on 14 January. The client paid a $900 deposit in December 2026, which is part of the $1,640 in Unearned Revenue. The event is priced at $1,380, and Lantern invoices the balance on 30-day terms. Record the entry for 14 January.',
    accounts: ['Cash', 'Accounts Receivable', 'Unearned Revenue', 'Catering Revenue', 'Training Revenue', 'Sales Discounts', 'Cost of Services'],
    lines: [{ acct: 'Unearned Revenue', dr: 900 }, { acct: 'Accounts Receivable', dr: 480 }, { acct: 'Catering Revenue', cr: 1380 }],
    solution: 'The event is catered, so the whole $1,380 is revenue. The $900 already received settles part of it: debit Unearned Revenue 900. The rest, 1,380 − 900 = 480, is now an unconditional right to payment: debit Accounts Receivable 480. Credit Catering Revenue 1,380. No cash moves on 14 January.',
  },
  {
    id: 'f02-m1-4', lesson: 'revenue-recognition', type: 'multi', kind: 'conceptual',
    prompt: 'Hollybrook Garden Centre, a fictional business, sells plants supplied on consignment by a nursery and keeps 35% of each sale. Customers paid $80,000 for these plants this year. Which facts indicate that Hollybrook is an agent for them rather than a principal? Select all that apply.',
    options: [
      'The nursery owns the plants until they are sold',
      'The nursery takes back any plants that don’t sell',
      'The nursery sets the plants’ minimum prices',
      'Customers pay at Hollybrook’s tills',
      'The plants are displayed in Hollybrook’s greenhouse',
      'Hollybrook’s staff answer customers’ questions',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Collecting the customer’s money doesn’t give Hollybrook control of the plants; agents often handle the payments.',
      4: 'Holding the plants on display isn’t control: the nursery still owns them and bears the risk if they don’t sell.',
      5: 'Helping customers is part of arranging the sale, which is what an agent does.',
    },
    solution: 'The control indicators all point to the nursery: it owns the plants until sale, bears the inventory risk (it takes back unsold plants) and has discretion over price (it sets minimum prices). Hollybrook arranges the sales, so it is an agent and reports only its commission: 0.35 × 80,000 = $28,000.',
  },
  // ---------------------------------------------------------------- inventory-and-cost-of-goods-sold
  {
    id: 'f02-m1-5', lesson: 'inventory-and-cost-of-goods-sold', type: 'num', kind: 'numerical',
    prompt: 'Kestrelford Wholesale, a fictional distributor, keeps perpetual records. At the year end they show cost of goods sold of $131,500 and ending inventory of $27,100. The physical count values the goods on hand at $26,000. What cost of goods sold does Kestrelford report for the year?',
    answer: 132600, check: () => 131500 + (27100 - 26000), unit: '$', places: 0,
    wrong: [
      { value: 131500, say: 'That ignores the count. The records show $1,100 more inventory than is on hand; the shortfall is moved to cost of goods sold.' },
      { value: 130400, say: 'The count is lower than the records, so goods have been lost: cost of goods sold rises, it doesn’t fall.' },
      { value: 1100, say: 'That is the shrinkage alone. Add it to the cost of goods sold already recorded.' },
    ],
    solution: 'Shrinkage = 27,100 − 26,000 = 1,100: debit Cost of Goods Sold 1,100, credit Inventory 1,100. Cost of goods sold = 131,500 + 1,100 = $132,600, and ending inventory is reported at the counted $26,000.',
  },
  {
    id: 'f02-m1-6', lesson: 'inventory-and-cost-of-goods-sold', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional US department store measures its inventory with the retail inventory method. Under US GAAP after ASU 2015-11, which test does it apply when its inventory may be worth less than cost?',
    options: ['Lower of cost or market', 'Lower of cost and net realisable value', 'Fair value through profit or loss', 'No test: inventory stays at cost'],
    answer: 0,
    feedback: {
      1: 'ASU 2015-11 moved inventory measured by other methods, such as FIFO and average cost, to the lower of cost and net realisable value; LIFO and the retail inventory method were left out.',
      2: 'Inventory is measured at cost, subject to a write-down test; it is not carried at fair value.',
      3: 'Every inventory method has a write-down test: inventory isn’t carried above what can be recovered.',
    },
    solution: 'ASC 330-10-35-1C keeps the lower of cost or market test for inventory measured by LIFO or the retail inventory method; other inventory is measured at the lower of cost and net realisable value (ASC 330-10-35-1B).',
  },
  {
    id: 'f02-m1-7', lesson: 'inventory-and-cost-of-goods-sold', type: 'journal', kind: 'applied', chart: 'f02', date: '2027-02-10',
    prompt: 'Suppose that on 2 February 2027 Kilnworth Roasting delivers $5,000 of bags to Lantern on terms of 1/10, n/30, and Lantern records the purchase at the invoice amount. Lantern pays on 10 February. Record the payment (perpetual system).',
    accounts: ['Cash', 'Accounts Payable', 'Inventory', 'Cost of Goods Sold', 'Sales Discounts', 'Interest Expense', 'Miscellaneous Expense'],
    lines: [{ acct: 'Accounts Payable', dr: 5000 }, { acct: 'Inventory', cr: 50 }, { acct: 'Cash', cr: 4950 }],
    solution: '10 February is within 10 days of 2 February, so Lantern takes 1% off: 0.01 × 5,000 = 50. Debit Accounts Payable 5,000 (the whole invoice is settled); credit Cash 4,950 and Inventory 50, because a discount on purchases reduces the cost of the goods. Sales Discounts is the seller’s account, not the buyer’s.',
  },
  {
    id: 'f02-m1-8', lesson: 'inventory-and-cost-of-goods-sold', type: 'classify', kind: 'applied',
    prompt: 'Calderwood Instruments, a fictional distributor, uses a periodic system. Its 31 December 2026 count included $12,000 of goods that a supplier had left with it on consignment and still owned; no purchase had been recorded for them. Its 31 December 2027 count was correct. Ignoring tax, classify the effect of the error on each item.',
    items: [
      'Cost of goods sold for 2026',
      'Net income for 2026',
      'Retained earnings at 31 December 2026',
      'Cost of goods sold for 2027',
      'Net income for 2027',
      'Retained earnings at 31 December 2027',
    ],
    categories: ['Overstated', 'Understated', 'Correct'],
    answer: [1, 0, 0, 0, 1, 2],
    feedback: {
      0: 'Ending inventory was overstated by goods Calderwood didn’t own, so cost of goods sold = goods available − ending inventory came out too low.',
      3: 'The overstated 2026 ending inventory is 2027’s beginning inventory, so 2027 goods available, and cost of goods sold, are too high.',
      5: 'The 2026 overstatement and the 2027 understatement of profit cancel, so retained earnings are right again by the end of 2027.',
    },
    solution: 'Consigned goods belong to the supplier, so counting them overstated 2026 ending inventory by $12,000. 2026: cost of goods sold understated, net income and retained earnings overstated by $12,000. 2027: beginning inventory overstated, so cost of goods sold overstated and net income understated by $12,000; retained earnings at 31 December 2027 are correct.',
  },
  // ---------------------------------------------------------------- income-statement
  {
    id: 'f02-m1-9', lesson: 'income-statement', type: 'num', kind: 'numerical',
    prompt: 'Wrenmoor Optics, a fictional company, reports net sales of $940,000, cost of goods sold of $520,000, selling expenses of $150,000, general and administrative expenses of $118,000, interest expense of $14,000 and a loss on the sale of equipment of $6,000. It reports under US GAAP. What is its operating income?',
    answer: 146000, check: () => 940000 - 520000 - 150000 - 118000 - 6000, unit: '$', places: 0,
    wrong: [
      { value: 152000, say: 'That leaves out the loss on sale, which US GAAP includes in operating income (ASC 360-10-45-5).' },
      { value: 132000, say: 'That is income before income tax: interest comes after operating income.' },
      { value: 158000, say: 'A loss is subtracted, not added.' },
    ],
    solution: 'Gross profit = 940,000 − 520,000 = 420,000; operating income = 420,000 − 150,000 − 118,000 − 6,000 = $146,000. Interest then gives income before income tax of 146,000 − 14,000 = $132,000.',
  },
  {
    id: 'f02-m1-10', lesson: 'income-statement', type: 'num', kind: 'applied',
    prompt: 'Saltash Ferries, a fictional US operator, reports operating income of $46,000 after depreciation of $8,000, amortisation of $2,000 and a $2,000 loss on selling an old boat. Interest expense is $4,000 and income tax expense $10,500, so net income is $31,500. A lender asks for EBITDA as the SEC staff define it. What figure should Saltash give?',
    answer: 56000, check: () => 31500 + 4000 + 10500 + 8000 + 2000, unit: '$', places: 0,
    wrong: [
      { value: 58000, say: 'Adding back the loss on the boat makes it an adjusted measure: call it something else, such as Adjusted EBITDA. EBITDA adds back only interest, taxes, depreciation and amortisation.' },
      { value: 46000, say: 'That is EBIT (here equal to operating income). EBITDA also adds back depreciation and amortisation.' },
      { value: 41500, say: 'Interest and tax are added back as well as depreciation and amortisation.' },
    ],
    solution: 'From net income: 31,500 + 4,000 + 10,500 = 46,000 of EBIT; EBITDA = 46,000 + 8,000 + 2,000 = $56,000. The $2,000 loss stays in: it is inside operating income under US GAAP, and the SEC staff’s EBITDA adds back nothing else. A figure that also added it back ($58,000) would need its own name and a reconciliation.',
  },
  {
    id: 'f02-m1-11', lesson: 'income-statement', type: 'mc', kind: 'conceptual',
    prompt: 'A company reporting under IAS 1 presents its expenses by function: cost of sales, distribution costs and administrative expenses. What must it also disclose?',
    options: [
      'Depreciation, amortisation and employee benefits by nature',
      'A second, complete income statement with every expense classified by nature',
      'Its EBITDA, reconciled to profit for the year in a separate note',
      'Nothing more, because the function method already shows every cost',
    ],
    answer: 0,
    feedback: {
      1: 'A full second statement isn’t required; additional information on the nature of expenses is.',
      2: 'EBITDA is not required by IAS 1.',
      3: 'IAS 1 asks function-method companies for extra disclosure because a function analysis hides amounts such as staff costs.',
    },
    solution: 'IAS 1 paragraph 104: an entity classifying expenses by function discloses additional information on the nature of expenses, including depreciation and amortisation expense and employee benefits expense. Paragraph 103 also requires cost of sales to be shown separately.',
  },
  {
    id: 'f02-m1-12', lesson: 'income-statement', type: 'num', kind: 'numerical',
    prompt: 'A fictional US company reports income before income tax of $2,400,000 and income tax expense of $552,000. The US federal corporate rate is 21%. What is the company’s effective tax rate? Give the percentage to one decimal place.',
    answer: 23.0, check: () => 552000 / 2400000 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 21.0, say: 'That is the statutory federal rate. The effective rate is the company’s own tax expense divided by its income before tax.' },
      { value: 77.0, say: 'That is the share of income before tax left after tax. The effective rate is tax ÷ income before tax.' },
    ],
    solution: 'Effective tax rate = 552,000 ÷ 2,400,000 = 0.23, or 23.0%. It differs from the 21% statutory federal rate because of state income taxes, tax credits and items that are never taxable or deductible.',
  },
];
