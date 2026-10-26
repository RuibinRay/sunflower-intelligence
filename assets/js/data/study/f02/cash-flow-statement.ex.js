// cash-flow-statement.ex.js — F02 · The statement of cash flows: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// Lantern’s figures come from case.js; every other business is fictional and invented for the exercise.
import { FACTS as F, DERIVED as D, RESULTS as R, LEDGER } from './case.js?v=17';

const bal = (n) => LEDGER[n]?.balance || 0;
const money = (v) => `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
const n = (v) => Math.round(v).toLocaleString('en-US');
const interestPaid = -(R.cashFlows.lines.find((l) => l[0] === 'Interest paid') || [0, 0])[1];   // 450

export const widgets = {
  'cfs-direct': {
    type: 'formula',
    title: 'From accrual figures to cash: customers and inventory',
    intro: 'The starting values are Lantern’s first year: its net revenue, the receivables, write-off and unearned revenue at 31 December, and the beans it bought from Kilnworth Roasting.',
    inputs: [
      { id: 'rev', label: 'Net revenue', min: 0, max: 400000, step: 10, value: D.revenue, fmt: 'money' },
      { id: 'dar', label: 'Increase in receivables before the allowance (negative for a decrease)', min: -30000, max: 30000, step: 10, value: bal('Accounts Receivable'), fmt: 'money' },
      { id: 'wo', label: 'Receivables written off', min: 0, max: 5000, step: 10, value: F.catering.writtenOff, fmt: 'money' },
      { id: 'dun', label: 'Increase in unearned revenue (negative for a decrease)', min: -15000, max: 15000, step: 10, value: bal('Unearned Revenue'), fmt: 'money' },
      { id: 'cogs', label: 'Cost of goods sold', min: 0, max: 150000, step: 10, value: D.cogs, fmt: 'money' },
      { id: 'dinv', label: 'Increase in inventory (negative for a decrease)', min: -20000, max: 20000, step: 10, value: bal('Inventory'), fmt: 'money' },
      { id: 'dap', label: 'Increase in payables to inventory suppliers (negative for a decrease)', min: -20000, max: 20000, step: 10, value: F.inventory.purchases - F.inventory.paid, fmt: 'money' },
    ],
    compute: (v) => {
      const cash = v.rev - v.dar - v.wo + v.dun;
      const paid = v.cogs + v.dinv - v.dap;
      if (cash < 0) return { error: 'With these figures the business would have collected less than nothing from customers: the increase in receivables and the write-offs are larger than revenue plus the new deposits. Raise revenue or lower the receivables increase.' };
      if (paid < 0) return { error: 'With these figures the business would have received cash from its inventory suppliers. Purchases (cost of goods sold + increase in inventory) can’t be less than the increase in what it owes them.' };
      const gap = cash - v.rev;
      const why = [
        v.dar > 0 ? `receivables grew by ${money(v.dar)} (sold, not yet collected)` : '',
        v.dar < 0 ? `receivables fell by ${money(-v.dar)} (earlier sales collected)` : '',
        v.wo > 0 ? `${money(v.wo)} was written off (sold, never collected)` : '',
        v.dun > 0 ? `${money(v.dun)} of deposits came in for future sales` : '',
        v.dun < 0 ? `${money(-v.dun)} of revenue had been paid for in earlier periods` : '',
      ].filter(Boolean).join('; ');
      const head = gap === 0 ? 'Cash collected equals revenue' : `Customers paid ${money(Math.abs(gap))} ${gap < 0 ? 'less' : 'more'} than revenue`;
      const note = `${head}${why ? `: ${why}` : ''}. Purchases were ${money(v.cogs + v.dinv)}; ${v.dap >= 0 ? `${money(v.dap)} of them are still owed, so cash paid for inventory is ${money(paid)}.` : `the business also paid ${money(-v.dap)} of older bills, so cash paid for inventory is ${money(paid)}.`}`;
      return {
        headline: { label: 'Cash received from customers', value: money(cash) },
        rows: [
          ['Net revenue', money(v.rev)],
          ['Cash paid for inventory', money(paid)],
          ['Purchases (cost of goods sold + increase in inventory)', money(v.cogs + v.dinv)],
        ],
        note,
        chart: { kind: 'bar', x: { label: 'Line', values: ['Customers', 'Inventory'] },
          series: [{ name: 'Accrual amount', values: [v.rev, v.cogs] }, { name: 'Cash', values: [cash, paid] }], y: { label: 'Dollars' } },
      };
    },
  },
  'cfs-classes': {
    type: 'formula',
    title: 'Interest and dividends under US GAAP and IFRS',
    intro: 'Starting values: Lantern’s year, with interest received set to zero (Lantern had none). The first input is operating cash before interest and dividends: every other operating receipt and payment.',
    inputs: [
      { id: 'core', label: 'Other operating receipts less payments', min: 0, max: 200000, step: 10, value: D.cfo + interestPaid, fmt: 'money' },
      { id: 'ip', label: 'Interest paid', min: 0, max: 20000, step: 10, value: interestPaid, fmt: 'money' },
      { id: 'rec', label: 'Interest and dividends received', min: 0, max: 20000, step: 10, value: 0, fmt: 'money' },
      { id: 'dp', label: 'Dividends paid', min: 0, max: 40000, step: 10, value: D.dividends, fmt: 'money' },
      { id: 'capex', label: 'Paid for long-term assets', min: 0, max: 80000, step: 10, value: -D.cfi, fmt: 'money' },
      { id: 'raised', label: 'Raised from stock and borrowing', min: 0, max: 80000, step: 10, value: F.stock + F.coastline.principal, fmt: 'money' },
    ],
    compute: (v) => {
      const us = { op: v.core - v.ip + v.rec, inv: -v.capex, fin: v.raised - v.dp };
      const alt = { op: v.core - v.dp, inv: -v.capex + v.rec, fin: v.raised - v.ip };
      const ifrs = { op: v.core, inv: -v.capex + v.rec, fin: v.raised - v.ip - v.dp };
      const net = us.op + us.inv + us.fin;
      const fmt3 = (x) => `${money(x.op)} / ${money(x.inv)} / ${money(x.fin)}`;
      const spread = Math.max(us.op, alt.op, ifrs.op) - Math.min(us.op, alt.op, ifrs.op);
      return {
        headline: { label: 'Operating cash flow: US GAAP and IAS 7 with IFRS 18', value: `${money(us.op)} and ${money(ifrs.op)}` },
        rows: [
          ['US GAAP: operating / investing / financing', fmt3(us)],
          ['IAS 7 before IFRS 18, the other choices: operating / investing / financing', fmt3(alt)],
          ['IAS 7 with IFRS 18 (most companies): operating / investing / financing', fmt3(ifrs)],
          ['Net change in cash, under every set of rules', money(net)],
        ],
        note: `The same cash moves in every column, so the net change is ${money(net)} each time. Operating cash flow ranges over ${money(spread)} depending on where interest and dividends are put${spread ? '' : ' (nothing, with these inputs)'}. Before IFRS 18 an IFRS reporter could also follow the US pattern, so compare operating cash flows only after checking the classification.`,
        chart: { kind: 'bar', x: { label: 'Activity', values: ['Operating', 'Investing', 'Financing'] },
          series: [
            { name: 'US GAAP', values: [us.op, us.inv, us.fin] },
            { name: 'IAS 7 before IFRS 18 (other choices)', values: [alt.op, alt.inv, alt.fin] },
            { name: 'IAS 7 with IFRS 18', values: [ifrs.op, ifrs.inv, ifrs.fin] },
          ], y: { label: 'Dollars' } },
      };
    },
  },
};

const ACT = ['Operating', 'Investing', 'Financing', 'Not a cash flow in the statement'];

export const guided = [
  {
    id: 'f02-cfs-g1', type: 'classify', kind: 'conceptual',
    prompt: 'A fictional hotel reports under US GAAP. Where does each item go in its statement of cash flows? If it isn’t reported as a cash flow at all, choose the last category.',
    items: [
      'Deposits received from guests for rooms booked for next month',
      'Interest received on a short-term investment',
      'Interest paid on the mortgage on the hotel building',
      'Principal repaid on the same mortgage',
      'Cash paid for new laundry machines',
      'Cash used to buy a 60-day Treasury bill',
      'A shuttle bus acquired by signing a note with the dealer',
      'Dividends paid to the hotel’s shareholders',
      'Proceeds from selling old kitchen equipment',
    ],
    categories: ACT,
    answer: [0, 0, 0, 2, 1, 3, 3, 2, 1],
    hints: ['US GAAP keeps the cash effects of everything that passes through net income in operating activities, including interest paid and received.', 'Cash equivalents are part of the cash being explained; transactions with no cash at all are disclosed in a note instead.'],
    feedback: {
      0: 'Deposits are cash from customers for future services: operating, even though the revenue is recognised next month.',
      2: 'Under US GAAP interest paid is operating (ASC 230-10-45-17(d)); only the mortgage principal is financing.',
      5: 'A Treasury bill with 60 days to maturity when bought is a cash equivalent. Buying it moves money within cash and cash equivalents, so it is not a cash flow.',
      6: 'No cash moved: the bus is a noncash investing and financing activity, disclosed in a note. Later principal payments on the note will be financing.',
      8: 'Selling a long-term asset is an investing inflow, even though it isn’t revenue.',
    },
    solution: 'Operating: guest deposits, interest received, interest paid. Investing: the laundry machines and the sale of kitchen equipment. Financing: mortgage principal and dividends paid. Not a cash flow: the Treasury bill (a cash equivalent) and the shuttle bus (noncash, disclosed).',
  },
  {
    id: 'f02-cfs-g2', type: 'steps', kind: 'numerical',
    prompt: 'Lantern’s accountant derives three direct-method lines from the income statement and the balance sheet at 31 December 2026. Every balance was zero on 1 March 2026. Enter whole dollars.',
    data: { table: { head: ['Item', 'Amount ($)'], rows: [
      ['Event wages (in cost of services)', n(F.wages.events)],
      ['Wages expense (shop and office)', n(F.wages.shopAndOffice)],
      ['Wages payable, 31 December', n(bal('Wages Payable'))],
      ['Interest expense', n(D.interestExpense)],
      ['Interest payable, 31 December', n(bal('Interest Payable'))],
      ['Income tax expense', n(D.incomeTax)],
      ['Income taxes payable, 31 December', n(bal('Income Taxes Payable'))],
    ] } },
    solution: 'Employees: 25,200 + 18,400 − 2,100 = $41,500. Interest: 1,200 − 750 = $450. Income taxes: 9,129 − 3,129 = $6,000. In each case the expense less the increase in the related payable, because the payable is expense not yet paid in cash.',
    steps: [
      { id: 'f02-cfs-g2-s1', type: 'num', prompt: 'How much cash did Lantern pay to employees?',
        answer: 41500, check: () => F.wages.events + F.wages.shopAndOffice - bal('Wages Payable'), unit: '$', places: 0, tol: 0.5,
        hints: ['Wages appear in two places on the income statement: add them first.', 'Then remove the wages earned in late December and not yet paid.'],
        wrong: [
          { value: 43600, say: 'That is the total wages expense. $2,100 of it was still owed at 31 December, so less cash was paid.' },
          { value: 45700, say: 'Wages payable is an expense not yet paid, so it reduces the cash paid: subtract it.' },
          { value: 16300, say: 'Include the event baristas’ wages: they are in cost of services, but they were still paid to employees.' },
        ] },
      { id: 'f02-cfs-g2-s2', type: 'num', prompt: 'How much interest did Lantern pay?',
        answer: 450, check: () => D.interestExpense - bal('Interest Payable'), unit: '$', places: 0, tol: 0.5,
        hints: ['Interest payable is interest expense not yet paid.'],
        wrong: [
          { value: 1950, say: 'Interest payable is interest incurred but not paid, so subtract it from the expense.' },
          { value: 1200, say: 'That is the interest expense. $750 of it (December on the Coastline note and seven months on the van note) was still owed.' },
        ] },
      { id: 'f02-cfs-g2-s3', type: 'num', prompt: 'How much income tax did Lantern pay?',
        answer: 6000, check: () => D.incomeTax - bal('Income Taxes Payable'), unit: '$', places: 0, tol: 0.5,
        hints: ['Same pattern: expense less the increase in the payable.'],
        wrong: [
          { value: 12258, say: 'Income taxes payable is tax not yet paid: subtract it from the expense.' },
          { value: 9129, say: 'That is the tax expense for the year. $3,129 of it is still owed, so Lantern paid $6,000 in estimates.' },
        ] },
    ],
  },
  {
    id: 'f02-cfs-g3', type: 'num', kind: 'numerical',
    prompt: 'A fictional online furniture retailer reports net revenue of $640,000 for the year. Its accounts receivable (before the allowance) rose from $38,000 to $46,500, it wrote off $2,300 of receivables as uncollectible, and customer deposits for made-to-order furniture (unearned revenue) rose from $15,000 to $21,000. How much cash did it receive from customers? Enter whole dollars.',
    answer: 635200, check: () => 640000 - (46500 - 38000) - 2300 + (21000 - 15000), unit: '$', places: 0, tol: 0.5,
    hints: ['Start from revenue. Which changes mean cash came in later than revenue, earlier than revenue, or never?', 'Revenue − increase in receivables − write-offs + increase in deposits.'],
    wrong: [
      { value: 637500, say: 'Written-off receivables were sales that will never be collected: subtract the $2,300 too.' },
      { value: 623200, say: 'Deposits rose, so customers paid cash before the revenue was earned: add the $6,000 increase.' },
      { value: 652200, say: 'Receivables rose, so part of revenue hasn’t been collected yet: subtract the $8,500 increase.' },
    ],
    solution: 'Increase in receivables = 46,500 − 38,000 = 8,500; increase in deposits = 21,000 − 15,000 = 6,000. Cash collected = 640,000 − 8,500 − 2,300 + 6,000 = $635,200.',
  },
  {
    id: 'f02-cfs-g4', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the classification rules.',
    text: 'Under US GAAP, interest paid is classified as [[0]] and dividends received as [[1]]. A retailer reporting under IFRS that has applied IFRS 18 classifies interest paid as [[2]], interest received as [[3]] and dividends paid as [[4]].',
    blanks: [
      { options: ['operating', 'investing', 'financing'], answer: 0 },
      { options: ['operating', 'investing', 'financing'], answer: 0 },
      { options: ['operating', 'investing', 'financing'], answer: 2 },
      { options: ['operating', 'investing', 'financing'], answer: 1 },
      { options: ['operating', 'investing', 'financing'], answer: 2 },
    ],
    hints: ['US GAAP keeps everything that passes through net income in operating activities; dividends paid are the exception, because they are not an expense.', 'For most companies IFRS 18 moves the cost of finance to financing and returns on investments to investing.'],
    solution: 'US GAAP: interest paid and dividends received are operating (ASC 230-10-45-16(b) and 45-17(d)). IAS 7 as amended by IFRS 18, for a company whose main business is not investing or lending: interest paid is financing and interest received investing (paragraph 34A), and dividends paid are financing (paragraph 33A).',
  },
];

export const independent = [
  {
    id: 'f02-cfs-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional garden centre’s cost of goods sold for the year is $312,000. Its inventory rose from $54,000 to $61,000, and the accounts payable it owes to plant and product suppliers fell from $28,000 to $24,500. How much cash did it pay for inventory? Enter whole dollars.',
    answer: 322500, check: () => 312000 + (61000 - 54000) - (24500 - 28000), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 315500, say: 'Payables fell, so the centre paid more than it bought this year: add the $3,500 decrease, don’t subtract it.' },
      { value: 308500, say: 'Inventory rose, so the centre bought more than it sold: add the $7,000 increase to cost of goods sold.' },
      { value: 301500, say: 'Both signs are reversed. More inventory means more bought; fewer payables means more paid.' },
      { value: 312000, say: 'That is cost of goods sold. Adjust it for the changes in inventory and payables.' },
    ],
    solution: 'Purchases = 312,000 + 7,000 = 319,000. Payables fell by 3,500, so the centre paid for all of this year’s purchases and 3,500 of last year’s: cash paid = 319,000 + 3,500 = $322,500.',
  },
  {
    id: 'f02-cfs-i2', type: 'num', kind: 'numerical',
    prompt: 'From these figures for a fictional dental practice, find net cash from operating activities by the direct method under US GAAP. Enter whole dollars.',
    data: { table: { head: ['Item', 'Amount ($)'], rows: [
      ['Patient fees (revenue)', '880,000'], ['Increase in patient receivables', '12,000'],
      ['Salaries expense', '410,000'], ['Decrease in salaries payable', '3,000'],
      ['Supplies and other operating expenses', '190,000'], ['Increase in prepaid expenses', '2,000'], ['Increase in accounts payable for supplies', '4,000'],
      ['Depreciation expense', '45,000'],
      ['Interest expense (nothing owed at either date)', '6,000'],
      ['Income tax expense', '52,000'], ['Increase in income taxes payable', '5,000'],
    ] } },
    answer: 214000, check: () => (880000 - 12000) - (410000 + 3000) - (190000 + 2000 - 4000) - 6000 - (52000 - 5000), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 169000, say: 'Depreciation used no cash: leave it out of the direct method altogether.' },
      { value: 177000, say: 'That is net income. The direct method adds up receipts and payments.' },
      { value: 220000, say: 'Salaries payable fell, so the practice paid more than the year’s expense: 410,000 + 3,000.' },
      { value: 218000, say: 'Prepaid expenses rose, so more cash was paid than expensed: 190,000 + 2,000 − 4,000.' },
    ],
    solution: 'Received from patients 880,000 − 12,000 = 868,000. Paid: salaries 410,000 + 3,000 = 413,000; suppliers 190,000 + 2,000 − 4,000 = 188,000; interest 6,000; taxes 52,000 − 5,000 = 47,000. Net cash from operating activities = 868,000 − 413,000 − 188,000 − 6,000 − 47,000 = $214,000. Depreciation is left out.',
  },
  {
    id: 'f02-cfs-i3', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these would a fictional manufacturer disclose as noncash investing and financing activities? Select all that apply.',
    options: [
      'Converting $500,000 of its bonds into common stock',
      'Buying a warehouse with a $2 million note to the seller',
      'Recording $80,000 of depreciation on its machinery',
      'Buying a 30-day Treasury bill with spare cash',
      'Paying its shareholders a $40,000 cash dividend',
      'Exchanging a plot of land for a smaller building',
      'Writing off a $6,000 receivable as uncollectible',
    ],
    answer: [0, 1, 5],
    feedback: {
      2: 'Depreciation is a noncash expense, but it is not an investing or financing transaction. It matters for the indirect method, not this disclosure.',
      3: 'A 30-day Treasury bill is a cash equivalent: buying it moves money within the cash pool and is not reported at all.',
      4: 'A cash dividend is a financing cash outflow, reported in the statement itself.',
      6: 'A write-off is an operating matter (receivables and the allowance), not an investing or financing activity.',
    },
    solution: 'Disclose the bond conversion (financing without cash), the warehouse bought with a note to the seller (investing and financing without cash) and the land exchanged for a building (investing without cash). The others are either cash flows reported in the statement, cash-equivalent movements, or operating items.',
  },
  {
    id: 'f02-cfs-i4', type: 'num', kind: 'applied',
    prompt: 'At 31 December a fictional software company holds: bank deposits $84,000; a 90-day Treasury bill bought on 11 December for $25,000; a money market fund $40,000; a six-month certificate of deposit bought in November for $30,000; shares in a listed company worth $18,000. It also has a $6,000 overdraft at a second bank. What does it report as cash and cash equivalents under US GAAP? Enter whole dollars.',
    answer: 149000, check: () => 84000 + 25000 + 40000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 179000, say: 'The certificate of deposit had six months to run when bought: it is a short-term investment, not a cash equivalent.' },
      { value: 143000, say: 'Under US GAAP a bank overdraft is never netted against cash; it is reported as a liability.' },
      { value: 167000, say: 'Equity shares are not cash equivalents: their value can change significantly.' },
      { value: 197000, say: 'Only the deposits, the Treasury bill (90 days when bought) and the money market fund qualify.' },
    ],
    solution: 'Cash and cash equivalents = deposits 84,000 + Treasury bill 25,000 (90 days when acquired) + money market fund 40,000 = $149,000. The six-month CD and the shares are investments; the overdraft is a liability under US GAAP.',
  },
  {
    id: 'f02-cfs-i5', type: 'num', kind: 'applied',
    prompt: 'A fictional furniture maker reports under IFRS and has applied IFRS 18 since 2027. Its 2027 statement shows net cash from operating activities of $236,000; interest paid of $31,000 (financing); interest received of $4,000 and dividends received of $2,500 (investing); dividends paid of $40,000 (financing). An analyst wants its operating cash flow on a US GAAP basis to compare it with a US competitor. What is it? Enter whole dollars.',
    answer: 211500, check: () => 236000 - 31000 + 4000 + 2500, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 260500, say: 'Under US GAAP interest paid is an operating outflow, so moving it in lowers operating cash flow, and the interest and dividends received raise it.' },
      { value: 171500, say: 'Dividends paid are financing under US GAAP too: leave them where they are.' },
      { value: 205000, say: 'Interest and dividends received are operating inflows under US GAAP: add them back in.' },
    ],
    solution: 'US GAAP puts interest paid, interest received and dividends received in operating activities: 236,000 − 31,000 + 4,000 + 2,500 = $211,500. Dividends paid stay in financing under both.',
  },
];

export const check = [
  {
    id: 'f02-cfs-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A business with a 31 December year end holds these investments on 31 December. Under US GAAP, which one is a cash equivalent?',
    options: [
      'A two-year Treasury note bought on 1 December, 75 days before it matures',
      'A six-month certificate of deposit bought on 1 December',
      'A one-year Treasury bill bought last January, which now matures in under three months',
      'Shares in a listed company the business plans to sell in January',
    ],
    answer: 0,
    feedback: {
      1: 'Its maturity was six months when the business bought it, so it is a short-term investment.',
      2: 'What counts is the maturity when the business acquired it: twelve months. It doesn’t become a cash equivalent as it nears maturity.',
      3: 'Shares can change in value significantly and have no maturity: they are not cash equivalents.',
    },
    solution: 'Original maturity means the maturity when the business acquired the investment (ASC 230-10-20). The Treasury note had 75 days to run when bought, so it qualifies; the bill bought last January had a year, so it never does.',
  },
  {
    id: 'f02-cfs-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional theatre company earns ticket revenue of $1,250,000 in the year. Amounts owed by schools for group bookings fell by $6,000, and advance ticket sales for next season (unearned revenue) fell by $22,000. Nothing was written off. How much cash did it receive from customers? Enter whole dollars.',
    answer: 1234000, check: () => 1250000 - (-6000) + (-22000), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 1278000, say: 'Unearned revenue fell: some of this year’s revenue was paid for last year, so this year’s cash is lower. Subtract the $22,000.' },
      { value: 1222000, say: 'Receivables fell, so the schools paid more than this year’s bookings: add the $6,000.' },
      { value: 1266000, say: 'Both signs are reversed. Collecting receivables adds cash; earning revenue paid for last year doesn’t.' },
    ],
    solution: 'Cash collected = revenue − Δreceivables + Δunearned revenue = 1,250,000 − (−6,000) + (−22,000) = $1,234,000.',
  },
  {
    id: 'f02-cfs-k3', type: 'classify', kind: 'conceptual',
    prompt: 'A fictional battery-storage installer reports under US GAAP. Classify each cash flow.',
    items: [
      'Dividends received from an investment in another company',
      'Payment for a forklift three days after it was delivered',
      'Repayment of a bank loan’s principal',
      'Income taxes paid',
      'Buying back shares from a retiring founder',
      'A loan made to a key supplier',
    ],
    categories: ['Operating', 'Investing', 'Financing'],
    answer: [0, 1, 2, 0, 2, 1],
    feedback: {
      0: 'Under US GAAP dividends received are operating (ASC 230-10-45-16(b)), though dividends paid are financing.',
      1: 'A payment soon after the purchase of equipment is an investing outflow (ASC 230-10-45-13(c)).',
      4: 'Reacquiring the company’s own stock is a distribution to owners: financing (ASC 230-10-45-15(a)).',
      5: 'Making a loan to another entity is investing; collecting it later is an investing inflow.',
    },
    solution: 'Operating: dividends received, income taxes paid. Investing: the forklift, the loan to the supplier. Financing: loan principal repaid, shares bought back.',
  },
  {
    id: 'f02-cfs-k4', type: 'num', kind: 'applied',
    prompt: 'A fictional bakery starts the year with $14,000 of cash. During the year operating activities provide $38,000; it buys a $25,000 oven, paying $5,000 in cash and signing a note with the oven maker for the rest; it sells an old mixer for $1,500; it repays $6,000 of bank loan principal and pays $8,000 of dividends. What is its cash at the end of the year? Enter whole dollars.',
    answer: 34500, check: () => 14000 + 38000 + (-5000 + 1500) + (-6000 - 8000), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 14500, say: 'Only the $5,000 paid for the oven is a cash outflow; the $20,000 note is disclosed as a noncash activity.' },
      { value: 20500, say: 'That is the net change in cash. Add it to the $14,000 the bakery started with.' },
      { value: 33000, say: 'The $1,500 from the mixer is an investing inflow: include it.' },
    ],
    solution: 'Investing = −5,000 + 1,500 = −3,500; financing = −6,000 − 8,000 = −14,000. Net change = 38,000 − 3,500 − 14,000 = 20,500. Ending cash = 14,000 + 20,500 = $34,500. The $20,000 note is a noncash investing and financing activity.',
  },
  {
    id: 'f02-cfs-k5', type: 'mc', kind: 'applied',
    prompt: 'Which conclusion does Lantern’s first statement of cash flows, with its noncash note, support?',
    options: [
      'Operating cash covered the equipment and the van’s down payment.',
      'The van cost Lantern $10,000 in all, the amount shown in investing activities.',
      'Lantern had paid all of the interest it incurred in 2026 by 31 December.',
      'Lantern collected more cash from customers than the net revenue it earned.',
    ],
    answer: 0,
    feedback: {
      1: 'The noncash note shows a $20,000 note signed for the van as well: it cost $30,000.',
      2: 'Lantern paid $450 of interest against an expense of $1,200; $750 was still owed at 31 December.',
      3: 'Cash received from customers was $191,220 against net revenue of $193,320.',
    },
    solution: 'Net cash from operating activities was $39,940 and investing outflows were $22,000 (the $12,000 equipment and the van’s $10,000 down payment), so operations covered them with $17,940 to spare.',
  },
  {
    id: 'f02-cfs-k6', type: 'mc', kind: 'conceptual',
    prompt: 'A US company decides to present its operating cash flows by the direct method, as ASC 230 encourages. What else must it present?',
    options: [
      'A separate schedule reconciling net income to operating cash',
      'Nothing more, because the direct method replaces the reconciliation',
      'Its interest paid and dividends received moved into financing and investing',
      'A full indirect-method statement of cash flows for the previous year as well',
    ],
    answer: 0,
    feedback: {
      1: 'That is the IAS 7 position. ASC 230-10-45-30 still requires the reconciliation when the direct method is used.',
      2: 'That is the IFRS 18 classification for most IFRS reporters. US GAAP keeps interest paid and dividends received in operating activities.',
      3: 'No earlier-year indirect statement is required; the reconciliation for each period presented is.',
    },
    solution: 'Under US GAAP the reconciliation of net income to net cash from operating activities is required whichever method is used; with the direct method it goes in a separate schedule (ASC 230-10-45-29 and 45-30). That extra work is one reason most companies use the indirect method.',
  },
];
