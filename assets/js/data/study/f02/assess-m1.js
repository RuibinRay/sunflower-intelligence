// assess-m1.js — F02 module 1 test: Revenue, inventory and the income statement (revenue recognition, inventory and
// cost of goods sold, the multi-step income statement). New questions, not copies of lesson exercises: new businesses,
// new numbers, different angles. No hints; solutions show in review. Lantern’s 2027 events are hypothetical (“Suppose…”)
// and agree with case.js (the two January events were paid for by $1,640 of deposits in December 2026).

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
    prompt: 'A fictional mobile network sells a contract that includes a handset and 24 months of service for $40 a month, with nothing to pay up front. It sells the handset alone for $600 and the same service without a handset for $25 a month. How much revenue does it recognise when the customer takes the handset? Round to the nearest dollar.',
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
    prompt: 'Suppose Lantern caters the first of its two January 2027 events on 14 January. The client paid an $800 deposit in December 2026, which is part of the $1,640 in Unearned Revenue. The event is priced at $1,150, and Lantern invoices the balance on 30-day terms. Record the entry for 14 January.',
    accounts: ['Cash', 'Accounts Receivable', 'Unearned Revenue', 'Catering Revenue', 'Training Revenue', 'Sales Discounts', 'Cost of Services'],
    lines: [{ acct: 'Unearned Revenue', dr: 800 }, { acct: 'Accounts Receivable', dr: 350 }, { acct: 'Catering Revenue', cr: 1150 }],
    solution: 'The event is catered, so the whole $1,150 is revenue. The $800 already received settles part of it: debit Unearned Revenue 800. The rest is now an unconditional right to payment: debit Accounts Receivable 350. Credit Catering Revenue 1,150. No cash moves on 14 January.',
  },
  {
    id: 'f02-m1-4', lesson: 'revenue-recognition', type: 'mc', kind: 'applied',
    prompt: 'Hollybrook Garden Centre, a fictional business, sells plants supplied on consignment by a nursery. The nursery owns the plants until they are sold, sets their minimum prices and takes back any that don’t sell; Hollybrook keeps 35% of each sale. Customers paid $80,000 for consigned plants this year. What revenue should Hollybrook report from them?',
    options: ['$28,000, its commission', '$80,000, the price customers paid', '$52,000, the amount passed to the nursery', 'Nothing until the nursery is paid'],
    answer: 0,
    feedback: {
      1: 'Hollybrook never controls the plants: the nursery owns them, sets the prices and bears the risk of unsold stock. It is an agent.',
      2: 'The $52,000 is the nursery’s money, which Hollybrook collects and passes on.',
      3: 'Hollybrook’s commission is earned when each sale is made; paying the nursery doesn’t change that.',
    },
    solution: 'The nursery controls the plants before sale (ownership, pricing, inventory risk), so Hollybrook is an agent and reports its commission: 0.35 × 80,000 = $28,000.',
  },
  // ---------------------------------------------------------------- inventory-and-cost-of-goods-sold
  {
    id: 'f02-m1-5', lesson: 'inventory-and-cost-of-goods-sold', type: 'num', kind: 'numerical',
    prompt: 'Brightmoor Wholesale, a fictional distributor, uses a periodic system. For the year: beginning inventory $22,000; purchases $140,000; purchase discounts taken $2,800; purchase returns $3,200; freight-in $4,000; ending inventory from the count $26,000. What is cost of goods sold?',
    answer: 134000, check: () => 22000 + (140000 - 2800 - 3200 + 4000) - 26000, unit: '$', places: 0,
    wrong: [
      { value: 130000, say: 'Freight-in is a cost of bringing the goods to the warehouse: add it to purchases.' },
      { value: 140000, say: 'Purchase discounts and returns reduce the cost of purchases: subtract both.' },
      { value: 186000, say: 'Ending inventory is subtracted from goods available, not added.' },
    ],
    solution: 'Net purchases = 140,000 − 2,800 − 3,200 + 4,000 = 138,000. Goods available = 22,000 + 138,000 = 160,000. Cost of goods sold = 160,000 − 26,000 = $134,000.',
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
    id: 'f02-m1-8', lesson: 'inventory-and-cost-of-goods-sold', type: 'num', kind: 'applied',
    prompt: 'Calderwood Instruments, a fictional distributor, bought $12,000 of goods on 29 December 2026 on terms FOB shipping point and recorded the purchase, but its 31 December count left them out because they were still on the lorry. Its 31 December 2027 count was correct, and its income tax rate is 25%. By how much is its 2027 net income overstated?',
    answer: 9000, check: () => 12000 * (1 - 0.25), unit: '$', places: 0,
    wrong: [
      { value: 12000, say: 'That is the effect on 2027 cost of goods sold and income before tax; a quarter of it is offset by income tax.' },
      { value: 0, say: 'The 2026 error carries into 2027 through beginning inventory, so 2027 cost of goods sold is understated.' },
      { value: 3000, say: 'That is the effect on income tax expense, not on net income.' },
    ],
    solution: 'The goods belonged to Calderwood from shipment, so 2026 ending inventory was understated by 12,000. That is 2027’s beginning inventory, so 2027 cost of goods sold is understated and income before tax overstated by 12,000; after tax at 25%, net income is overstated by 12,000 × 0.75 = $9,000. (2026 net income was understated by the same amount.)',
  },
  // ---------------------------------------------------------------- income-statement
  {
    id: 'f02-m1-9', lesson: 'income-statement', type: 'num', kind: 'numerical',
    prompt: 'Wrenmoor Optics, a fictional company, reports net sales of $940,000, cost of goods sold of $520,000, selling expenses of $150,000, general and administrative expenses of $118,000, interest expense of $14,000 and a loss on the sale of equipment of $6,000, which it shows after operating income. What is its income before income tax?',
    answer: 132000, check: () => 940000 - 520000 - 150000 - 118000 - 14000 - 6000, unit: '$', places: 0,
    wrong: [
      { value: 152000, say: 'That is operating income. Interest and the loss on sale come after it, before income tax.' },
      { value: 138000, say: 'The loss on the sale of equipment also reduces income before tax.' },
      { value: 144000, say: 'A loss is subtracted, not added.' },
    ],
    solution: 'Gross profit = 940,000 − 520,000 = 420,000. Operating income = 420,000 − 150,000 − 118,000 = 152,000. Income before income tax = 152,000 − 14,000 − 6,000 = $132,000.',
  },
  {
    id: 'f02-m1-10', lesson: 'income-statement', type: 'num', kind: 'applied',
    prompt: 'Saltash Ferries, a fictional operator, reports net income of $31,500 after interest expense of $4,000 and income tax expense of $10,500. Its expenses include depreciation of $8,000 on its boats and amortisation of $2,000 on a licence. A lender asks for EBITDA as the SEC staff define it. What figure should Saltash give?',
    answer: 56000, check: () => 31500 + 4000 + 10500 + 8000 + 2000, unit: '$', places: 0,
    wrong: [
      { value: 46000, say: 'That is EBIT. EBITDA also adds back depreciation and amortisation.' },
      { value: 54000, say: 'Add back the amortisation of the licence as well as the depreciation of the boats.' },
      { value: 41500, say: 'Interest and tax are added back as well as depreciation and amortisation.' },
    ],
    solution: 'EBIT = 31,500 + 4,000 + 10,500 = 46,000; EBITDA = 46,000 + 8,000 + 2,000 = $56,000. Starting from net income, as the SEC staff do, makes the reconciliation easy to show.',
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
    solution: 'Effective tax rate = 552,000 ÷ 2,400,000 = 0.23, or 23.0%. It differs from the 21% statutory federal rate because of state taxes and other differences between taxable and accounting income.',
  },
];
