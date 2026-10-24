// assess-m3.js — F02 module 3 test: The statement of cash flows (cash-flow-statement, indirect-method).
// New questions, not copies of lesson exercises: other fictional businesses, other numbers, other angles (a bank under
// IFRS 18, a change in payables worked backwards, comparative balances with a disposal, a debt roll-forward).
// No hints; solutions show in review.

const SALE_ACCOUNTS = ['Cash', 'Equipment', 'Accumulated Depreciation—Equipment', 'Depreciation Expense', 'Loss on Sale of Equipment', 'Gain on Sale of Equipment', 'Notes Payable', 'Miscellaneous Expense'];

export const items = [
  // ---------------------------------------------------------------- cash-flow-statement
  {
    id: 'f02-m3-1', lesson: 'cash-flow-statement', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional bank reports under IFRS and has applied IFRS 18 since 2027. Lending to customers is its main business, and it presents all its interest expense in the operating category of its income statement. How does it classify the interest it pays in its statement of cash flows?',
    options: [
      'As operating, matching its income statement',
      'As financing, like every other IFRS reporter',
      'As operating or financing, as it chooses',
      'As investing, because it relates to loans',
    ],
    answer: 0,
    feedback: {
      1: 'Financing is the rule for companies whose main business is not investing or lending (IAS 7, paragraph 34A as amended). A bank follows its income statement (paragraphs 34B–34C).',
      2: 'A free choice was IAS 7’s position before IFRS 18; the amendments removed it.',
      3: 'Interest paid is the cost of the bank’s funding, not an investment. It follows the income statement category.',
    },
    solution: 'Under IAS 7 as amended by IFRS 18, an entity that provides finance to customers as a main business activity classifies interest paid by reference to where it presents interest expense in the income statement. All of it is in the operating category, so all interest paid is operating (paragraphs 34B–34C).',
  },
  {
    id: 'f02-m3-2', lesson: 'cash-flow-statement', type: 'num', kind: 'numerical',
    prompt: 'A fictional bookshop chain paid its publishers $1,187,000 during the year. Its cost of goods sold was $1,240,000 and its inventory fell by $35,000. Every purchase is made on account from publishers. By how much did its accounts payable to publishers change? Enter an increase as a positive number and a decrease as a negative number, in whole dollars.',
    answer: 18000, check: () => (1240000 - 35000) - 1187000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: -18000, say: 'The chain bought $1,205,000 and paid only $1,187,000, so it owes more than at the start: payables rose.' },
      { value: 53000, say: 'Purchases are not cost of goods sold: inventory fell, so the chain bought less than it sold (1,240,000 − 35,000 = 1,205,000).' },
      { value: 88000, say: 'Inventory fell, so subtract the $35,000 from cost of goods sold to find purchases, don’t add it.' },
    ],
    solution: 'Purchases = cost of goods sold + Δinventory = 1,240,000 − 35,000 = 1,205,000. Cash paid = purchases − Δpayables, so Δpayables = 1,205,000 − 1,187,000 = +$18,000.',
  },
  {
    id: 'f02-m3-3', lesson: 'cash-flow-statement', type: 'num', kind: 'applied',
    prompt: 'A fictional regional airline reports under US GAAP. Its cash records for the year show: ticket receipts, including bookings for next quarter’s flights, $2,400,000; interest received on bank deposits $18,000; paid for fuel, airport charges and other suppliers $1,310,000; paid to employees $720,000; interest paid $64,000; income taxes paid $41,000; a deposit paid to an aircraft maker for a new plane $150,000; 60-day Treasury bills bought $100,000; loan principal repaid $90,000. What is net cash from operating activities? Enter whole dollars.',
    answer: 283000, check: () => 2400000 + 18000 - 1310000 - 720000 - 64000 - 41000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 347000, say: 'Under US GAAP interest paid is an operating outflow.' },
      { value: 265000, say: 'Under US GAAP interest received is an operating inflow.' },
      { value: 183000, say: '60-day Treasury bills are cash equivalents: buying them is not a cash flow at all.' },
      { value: 133000, say: 'A deposit towards a new aircraft is an advance payment for equipment: an investing outflow.' },
      { value: 193000, say: 'Repaying loan principal is a financing outflow.' },
    ],
    solution: 'Operating = 2,400,000 + 18,000 − 1,310,000 − 720,000 − 64,000 − 41,000 = $283,000. Advance bookings are cash from customers (operating). The aircraft deposit is investing, the loan repayment financing, and the Treasury bills are cash equivalents.',
  },
  {
    id: 'f02-m3-4', lesson: 'cash-flow-statement', type: 'multi', kind: 'conceptual',
    prompt: 'For a company reporting under US GAAP, which statements are true? Select all that apply.',
    options: [
      'Customer deposits received in advance are operating inflows',
      'Interest paid on a bank loan is a financing outflow, like the loan’s principal',
      'Buying a 60-day Treasury bill with cash is not a reported cash flow',
      'Dividends received from investments in other companies are investing inflows',
      'Only the cash part of a part-cash equipment purchase is in the statement',
      'A bank overdraft that is part of cash management may be netted against cash',
    ],
    answer: [0, 2, 4],
    feedback: {
      1: 'Under US GAAP interest paid is operating (ASC 230-10-45-17(d)); only principal is financing.',
      3: 'Under US GAAP dividends received are operating (ASC 230-10-45-16(b)). IFRS 18 makes them investing for most IFRS reporters.',
      5: 'US GAAP never includes overdrafts in cash and cash equivalents; IAS 7 sometimes does.',
    },
    solution: 'True: deposits are cash from customers; a cash equivalent bought with cash stays within the cash pool; a part-cash purchase shows only its cash part, with the rest disclosed. False: interest paid and dividends received are operating under US GAAP, and overdrafts are liabilities.',
  },
  {
    id: 'f02-m3-5', lesson: 'cash-flow-statement', type: 'classify', kind: 'conceptual',
    prompt: 'A fictional clothing brand reports under IFRS and has applied IFRS 18 since 2027. Its main business is designing and selling clothes. Classify each 2027 cash flow.',
    items: [
      'Interest paid on a bank loan',
      'Dividends received on shares held as an investment',
      'Dividends paid to the brand’s shareholders',
      'Interest received on bank deposits',
      'Wages paid to shop staff',
      'Payment for a new delivery van',
      'Cash received from customers',
    ],
    categories: ['Operating', 'Investing', 'Financing'],
    answer: [2, 1, 2, 1, 0, 1, 0],
    feedback: {
      0: 'For a company whose main business is not lending or investing, IFRS 18 makes interest paid financing (IAS 7, paragraph 34A).',
      1: 'Dividends received are investing for such a company (paragraph 34A).',
      3: 'Interest received is investing for such a company (paragraph 34A).',
    },
    solution: 'Operating: wages and cash from customers. Investing: dividends received, interest received, the van. Financing: interest paid and dividends paid (IAS 7, paragraphs 33A and 34A as amended by IFRS 18).',
  },

  // ---------------------------------------------------------------- indirect-method
  {
    id: 'f02-m3-6', lesson: 'indirect-method', type: 'journal', kind: 'applied', chart: 'f02', date: '2027-12-31',
    prompt: 'A fictional laundry company’s equipment at cost went from $52,000 to $47,000 in 2027, after it bought $6,000 of new equipment for cash; accumulated depreciation went from $20,000 to $21,500 after depreciation expense of $4,700. It sold one machine for $7,000 cash. Record the sale.',
    accounts: SALE_ACCOUNTS,
    lines: [{ acct: 'Cash', dr: 7000 }, { acct: 'Accumulated Depreciation—Equipment', dr: 3200 }, { acct: 'Loss on Sale of Equipment', dr: 800 }, { acct: 'Equipment', cr: 11000 }],
    solution: 'Roll each account forward. Cost of the machine sold = 52,000 + 6,000 − 47,000 = 11,000; accumulated depreciation removed = 20,000 + 4,700 − 21,500 = 3,200; book value 11,000 − 3,200 = 7,800, so selling for 7,000 is a loss of 800. Debit Cash 7,000, Accumulated Depreciation—Equipment 3,200 and Loss on Sale of Equipment 800; credit Equipment 11,000. In the statement of cash flows the $7,000 is an investing inflow (with the $6,000 purchase an investing outflow), and the indirect method adds the $800 loss back to net income.',
  },
  {
    id: 'f02-m3-7', lesson: 'indirect-method', type: 'num', kind: 'numerical',
    prompt: 'A fictional dairy farm reports net income of $210,000 for 2027, after depreciation of $58,000. During the year it sold a tractor that cost $40,000, with accumulated depreciation of $31,000, for $15,000; the gain is included in net income. Use the balances below to find net cash from operating activities by the indirect method. Enter whole dollars.',
    data: { table: { head: ['Account', '1 January ($)', '31 December ($)'], rows: [
      ['Accounts receivable', '46,000', '57,000'],
      ['Feed inventory', '38,000', '31,000'],
      ['Prepaid insurance', '4,500', '6,000'],
      ['Accounts payable', '29,000', '21,000'],
      ['Wages payable', '3,500', '6,000'],
      ['Income taxes payable', '9,000', '6,000'],
    ] } },
    answer: 248000, check: () => 210000 + 58000 - (15000 - (40000 - 31000)) - (57000 - 46000) - (31000 - 38000) - (6000 - 4500) + (21000 - 29000) + (6000 - 3500) + (6000 - 9000), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 260000, say: 'The gain of $6,000 is subtracted, not added: the tractor’s sale price is an investing inflow.' },
      { value: 254000, say: 'The $6,000 gain (15,000 − 9,000) is inside net income: subtract it.' },
      { value: 239000, say: 'Subtract the gain, not the whole $15,000 of proceeds; the proceeds go to investing.' },
      { value: 264000, say: 'Accounts payable fell by $8,000: the farm paid more than it bought, so subtract the decrease.' },
    ],
    solution: 'Gain = 15,000 − (40,000 − 31,000) = 6,000. Working capital: receivables +11,000 (−), inventory −7,000 (+), prepaid +1,500 (−), payables −8,000 (−), wages payable +2,500 (+), taxes payable −3,000 (−): net −14,000. Net cash from operating activities = 210,000 + 58,000 − 6,000 − 14,000 = $248,000.',
  },
  {
    id: 'f02-m3-8', lesson: 'indirect-method', type: 'num', kind: 'applied',
    prompt: 'A fictional hotel’s long-term debt was $150,000 current and $900,000 noncurrent at 31 December 2026, and $180,000 current and $1,020,000 noncurrent at 31 December 2027. In 2027 it borrowed $400,000 from its bank; the only other changes were principal repayments and the reclassification of next year’s instalments to current. How much principal did it repay in 2027? Enter whole dollars.',
    answer: 250000, check: () => (150000 + 900000) + 400000 - (180000 + 1020000), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 150000, say: 'That is the instalment due at the start of the year. The roll-forward of total debt shows that more was repaid.' },
      { value: 280000, say: 'Include the current portion: roll forward total debt (current + noncurrent), because reclassification moves amounts between the two.' },
      { value: 30000, say: 'That is only the change in the current portion, which reflects reclassification as well as repayment.' },
    ],
    solution: 'Total debt: opening 1,050,000 + borrowing 400,000 − repayments = closing 1,200,000, so repayments = $250,000, a financing outflow (the borrowing is a $400,000 financing inflow). Reclassifying instalments to current moves no cash.',
  },
  {
    id: 'f02-m3-9', lesson: 'indirect-method', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional software company’s unearned revenue fell by $12,000 during the year. How does the indirect method treat this change?',
    options: [
      'Subtracted: revenue was earned from cash received in an earlier period',
      'Added: a liability that decreases releases cash for the business',
      'Added: the revenue earned this year increases operating profit',
      'Left out: unearned revenue is a financing item, like a loan from customers',
    ],
    answer: 0,
    feedback: {
      1: 'A decreasing liability means cash went out or, here, revenue was earned without new cash: it reduces operating cash relative to net income.',
      2: 'The revenue is already in net income. The adjustment removes the part of it that brought no cash this year.',
      3: 'Unearned revenue arises from customers paying in advance for goods or services: an operating item.',
    },
    solution: 'Net income includes $12,000 of revenue that customers paid for in an earlier year, so this year’s cash is $12,000 lower than net income suggests: subtract the decrease.',
  },
  {
    id: 'f02-m3-10', lesson: 'indirect-method', type: 'num', kind: 'numerical',
    prompt: 'A fictional plumbing supplier’s accounts receivable were $64,000 with an allowance for doubtful accounts of $3,000 at the start of the year, and $71,000 with an allowance of $4,200 at the end. It takes receivables net of the allowance in its indirect-method reconciliation, and adds back nothing for bad debts. What adjustment does it make for receivables? Enter a subtraction as a negative number, in whole dollars.',
    answer: -5800, check: () => -((71000 - 4200) - (64000 - 3000)), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: -7000, say: 'That is the change in gross receivables. Net receivables are receivables less the allowance.' },
      { value: 5800, say: 'Net receivables rose, so revenue was recorded faster than cash came in: subtract the increase.' },
      { value: -8200, say: 'The allowance is deducted from receivables, so its increase reduces the net increase.' },
    ],
    solution: 'Net receivables: opening 64,000 − 3,000 = 61,000; closing 71,000 − 4,200 = 66,800. Increase 5,800, so subtract $5,800. Bad debt expense is already inside this net change, which is why it isn’t added back separately.',
  },
  {
    id: 'f02-m3-11', lesson: 'indirect-method', type: 'mc', kind: 'applied',
    prompt: 'Two fictional coffee chains each report net income of $2.0 million. Chain A’s operating cash flow is $3.1 million, mainly because of $1.2 million of depreciation. Chain B’s is also $3.1 million, mainly because its accounts payable rose by $1.2 million. Which statement is most defensible?',
    options: [
      'Chain A’s is likelier to recur: B’s depends on paying suppliers later',
      'Chain B’s is better quality, because depreciation brings in no cash',
      'They are equally sustainable, because both start from the same net income',
      'Chain A is weaker, because large depreciation means its equipment is failing',
    ],
    answer: 0,
    feedback: {
      1: 'Depreciation brings in no cash, but neither does it take any: the add-back reflects cash spent in earlier years. B’s extra cash comes from delaying payments, which reverses.',
      2: 'The adjustments differ in kind: depreciation recurs while assets are in use; a rise in payables reverses when the bills are paid.',
      3: 'Depreciation allocates cost over an asset’s life; a large charge reflects a large asset base, not failing equipment.',
    },
    solution: 'A’s operating cash flow exceeds net income because of a noncash expense that recurs as long as it runs its stores. B’s comes from paying suppliers later, which can’t continue indefinitely and reverses when suppliers insist on their terms. A’s is more likely to recur.',
  },
];
