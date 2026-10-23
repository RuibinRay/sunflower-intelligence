// brightwater.js — the F02 project's business: Brightwater Bike Repair (F01's project, which followed its first
// month, July 2026) in 2027, its first full year and the year it starts selling bikes and accessories. Its chart,
// its balances at 31 December 2026, the year in summary entries, what Mateo knows at the year end, and every result,
// computed by the accounting engine. Every name and figure is invented for teaching.
//
// Agrees with f01/brightwater.js: formed 1 July 2026 with $12,000 of common stock; Harbour Credit Union's $5,000
// one-year note at 6% with the interest ($300) paid on repayment, 1 July 2027 ($25 a month accrued); equipment $4,800
// bought on 2 July 2026, five years, no residual value, straight line, a full month in the month of purchase ($80 a
// month); a 12-month liability insurance policy from 1 July 2026 for $720 ($60 a month).
import * as A from '../../../core/accounting.js?v=10';
import { CHART as F02_CHART } from './case.js';

const extra = [
  { no: 245, name: 'Short-Term Notes Payable', type: 'liability', group: 'current' },   // the one-year note (F01's Notes Payable)
  { no: 402, name: 'Repair Revenue', type: 'revenue' },
  { no: 406, name: 'Retail Sales Revenue', type: 'revenue' },
];
/** Brightwater's chart: the course chart with its own revenue accounts (it has no catering or online shop). Its
 *  accountant treats the mechanics' wages and the repair parts used as the cost of its repair services, so both sit in
 *  cost of sales on the multi-step income statement. */
export const CHART = [...F02_CHART.filter((a) => !['Catering Revenue', 'Training Revenue', 'Online Sales Revenue'].includes(a.name)), ...extra]
  .map((a) => (['Wages Expense', 'Supplies Expense'].includes(a.name) ? { ...a, section: 'cost' } : a))
  .sort((a, b) => a.no - b.no);

/** Post-closing balances at 31 December 2026, the end of Brightwater's first (six-month) period. */
export const OPENING = {
  Cash: 17_450, 'Accounts Receivable': 2_860, 'Allowance for Doubtful Accounts': 140, Supplies: 520, 'Prepaid Insurance': 360,
  Equipment: 4_800, 'Accumulated Depreciation—Equipment': 480,
  'Accounts Payable': 1_180, 'Wages Payable': 1_040, 'Interest Payable': 150, 'Unearned Revenue': 600, 'Income Taxes Payable': 1_050,
  'Short-Term Notes Payable': 5_000,               // the one-year note, due 1 July 2027
  'Common Stock': 12_000, 'Retained Earnings': 4_350,
};

/** Commuter bikes, the one model Brightwater stocks in 2027 (perpetual records, FIFO). */
export const BIKES = {
  purchases: [
    { date: '2027-03-01', units: 10, cost: 380 },
    { date: '2027-06-01', units: 12, cost: 400 },
    { date: '2027-09-01', units: 8, cost: 420 },
  ],
  sold: 24, price: 640,
};
/** Accessories and parts for sale (helmets, lights, locks): counted at the year end (periodic). */
export const ACCESSORIES = { purchases: 6_300, ending: 1_450, sales: 9_840 };
/** An ex-demonstration e-bike (cost $1,600) that can now be sold for only $1,250 after $100 of selling costs. */
export const DEMO_EBIKE = { cost: 1_600, price: 1_250, sellingCosts: 100 };
/** Accounts receivable at 31 December 2027 by age (courier company, rental fleet, regulars). */
export const AGING = [
  { band: 'Not yet due', amount: 4_200, rate: 0.01 },
  { band: '1–30 days overdue', amount: 1_300, rate: 0.05 },
  { band: '31–90 days overdue', amount: 600, rate: 0.20 },
  { band: 'Over 90 days overdue', amount: 400, rate: 0.50 },
];
export const TAX_RATE = 0.25;
export const TAX_PAID = 2_000;           // estimated tax paid during 2027

const fifo = (() => { let left = BIKES.sold, cost = 0; for (const l of BIKES.purchases) { const q = Math.min(left, l.units); cost += q * l.cost; left -= q; } return cost; })();   // 9,440
const bikesBought = BIKES.purchases.reduce((s, l) => s + l.units * l.cost, 0);                                               // 11,960
const nrv = DEMO_EBIKE.price - DEMO_EBIKE.sellingCosts;                                                                         // 1,150
const writeDown = DEMO_EBIKE.cost - nrv;                                                                                        // 450
const allowanceNeeded = AGING.reduce((s, b) => s + b.amount * b.rate, 0);                                                      // 427
const writtenOff = 380;                                                                                                         // Pedalpost's invoice, written off in August

/** The stand sold on 1 October 2027: part of the July 2026 equipment. No depreciation in the month of sale. */
export const STAND = { cost: 1_500, monthly: 25, months: 15, price: 700 };      // July 2026 – September 2027
const standBook = STAND.cost - STAND.monthly * STAND.months;                                                                    // 1,125
const standLoss = standBook - STAND.price;                                                                                      // 425
/** New workshop equipment bought on 1 March 2027 for $9,000: five years, no residual value. */
export const NEW_EQUIPMENT = { cost: 9_000, monthly: 150, months: 10 };
/** Harbour Credit Union's new loan, 1 March 2027: $12,000 at 7%, repaid $3,000 each 1 March from 2028; interest paid yearly then. */
export const NEW_LOAN = { principal: 12_000, rate: 0.07, instalment: 3_000, months: 10 };

const oldEquipDep = (4_800 - STAND.cost) / 60 * 12 + STAND.monthly * 9;                                                        // 660 + 225 = 885
const depreciation = oldEquipDep + NEW_EQUIPMENT.monthly * NEW_EQUIPMENT.months;                                               // 2,385

/** 2027 in summary entries. */
export const YEAR = [
  { id: 'w1', date: '2027-03-01', text: 'On 1 March, borrows $12,000 from Harbour Credit Union at 7%: $3,000 is repaid each 1 March from 2028, with the year’s interest.',
    lines: [{ acct: 'Cash', dr: NEW_LOAN.principal }, { acct: 'Notes Payable', cr: NEW_LOAN.principal }], cash: 'financing' },
  { id: 'w2', date: '2027-03-01', text: 'On 1 March, buys a hydraulic work stand and e-bike diagnostic tools for $9,000 in cash.',
    lines: [{ acct: 'Equipment', dr: NEW_EQUIPMENT.cost }, { acct: 'Cash', cr: NEW_EQUIPMENT.cost }], cash: 'investing' },
  { id: 'w3', date: '2027-12-31', text: 'Repairs and servicing: $41,600 paid at the counter and $26,800 invoiced to the courier company, the rental fleet and regular customers.',
    lines: [{ acct: 'Cash', dr: 41_600 }, { acct: 'Accounts Receivable', dr: 26_800 }, { acct: 'Repair Revenue', cr: 68_400 }], cash: 'operating' },
  { id: 'w4', date: '2027-12-31', text: 'Cash collected from customers on account.',
    lines: [{ acct: 'Cash', dr: 22_780 }, { acct: 'Accounts Receivable', cr: 22_780 }], cash: 'operating' },
  { id: 'w5', date: '2027-08-14', text: 'On 14 August, Pedalpost, a courier start-up, closes owing $380; Brightwater writes the invoice off.',
    lines: [{ acct: 'Allowance for Doubtful Accounts', dr: writtenOff }, { acct: 'Accounts Receivable', cr: writtenOff }] },
  { id: 'w6', date: '2027-12-31', text: 'Service plans: $1,900 paid in advance; tune-ups worth $2,100 delivered (including last year’s $600).',
    lines: [{ acct: 'Cash', dr: 1_900 }, { acct: 'Unearned Revenue', cr: 1_900 }], cash: 'operating' },
  { id: 'w7', date: '2027-12-31', text: 'Service-plan tune-ups delivered.',
    lines: [{ acct: 'Unearned Revenue', dr: 2_100 }, { acct: 'Repair Revenue', cr: 2_100 }] },
  { id: 'w8', date: '2027-12-31', text: 'Commuter bikes bought on account (three deliveries).',
    lines: [{ acct: 'Inventory', dr: bikesBought }, { acct: 'Accounts Payable', cr: bikesBought }] },
  { id: 'w9', date: '2027-12-31', text: 'Accessories bought on account.',
    lines: [{ acct: 'Inventory', dr: ACCESSORIES.purchases }, { acct: 'Accounts Payable', cr: ACCESSORIES.purchases }] },
  { id: 'w10', date: '2027-04-20', text: 'On 20 April, buys an ex-demonstration e-bike for the shop floor for $1,600 in cash.',
    lines: [{ acct: 'Inventory', dr: DEMO_EBIKE.cost }, { acct: 'Cash', cr: DEMO_EBIKE.cost }], cash: 'operating' },
  { id: 'w11', date: '2027-12-31', text: 'Retail sales, paid by card: 24 bikes at $640 and accessories of $9,840.',
    lines: [{ acct: 'Cash', dr: BIKES.sold * BIKES.price + ACCESSORIES.sales }, { acct: 'Retail Sales Revenue', cr: BIKES.sold * BIKES.price + ACCESSORIES.sales }], cash: 'operating' },
  { id: 'w12', date: '2027-12-31', text: 'Refunds for faulty accessories returned by customers (the faulty items were thrown away).',
    lines: [{ acct: 'Sales Returns and Allowances', dr: 600 }, { acct: 'Cash', cr: 600 }], cash: 'operating', cashLabel: 'Cash received from customers' },
  { id: 'w13', date: '2027-12-31', text: 'Cost of the bikes sold (FIFO, perpetual).',
    lines: [{ acct: 'Cost of Goods Sold', dr: fifo }, { acct: 'Inventory', cr: fifo }] },
  { id: 'w14', date: '2027-12-31', text: 'Payments to suppliers on account (bikes, accessories, parts).',
    lines: [{ acct: 'Accounts Payable', dr: 25_490 }, { acct: 'Cash', cr: 25_490 }], cash: 'operating' },
  { id: 'w15', date: '2027-12-31', text: 'Repair parts and workshop supplies bought on account.',
    lines: [{ acct: 'Supplies', dr: 8_100 }, { acct: 'Accounts Payable', cr: 8_100 }] },
  { id: 'w16', date: '2027-12-31', text: 'Mechanics’ wages for the year (Brightwater’s only employees; Mateo serves in the shop himself); $1,320 earned in late December is paid on 4 January.',
    lines: [{ acct: 'Wages Expense', dr: 33_600 }, { acct: 'Cash', cr: 33_600 + 1_040 - 1_320 }, { acct: 'Wages Payable', cr: 1_320 - 1_040 }], cash: 'operating', cashLabel: 'Cash paid to employees' },
  { id: 'w17', date: '2027-12-31', text: 'Workshop and shop rent, $1,500 a month.',
    lines: [{ acct: 'Rent Expense', dr: 18_000 }, { acct: 'Cash', cr: 18_000 }], cash: 'operating', cashLabel: 'Cash paid to suppliers' },
  { id: 'w18', date: '2027-12-31', text: 'Utilities, all paid.',
    lines: [{ acct: 'Utilities Expense', dr: 2_460 }, { acct: 'Cash', cr: 2_460 }], cash: 'operating' },
  { id: 'w19', date: '2027-12-31', text: 'Advertising.',
    lines: [{ acct: 'Advertising Expense', dr: 1_800 }, { acct: 'Cash', cr: 1_800 }], cash: 'operating', cashLabel: 'Cash paid to suppliers' },
  { id: 'w20', date: '2027-12-31', text: 'Card-processing fees.',
    lines: [{ acct: 'Card and Platform Fees Expense', dr: 1_051 }, { acct: 'Cash', cr: 1_051 }], cash: 'operating' },
  { id: 'w21', date: '2027-07-01', text: 'On 1 July, renews the liability insurance for 1 July 2027 – 30 June 2028.',
    lines: [{ acct: 'Prepaid Insurance', dr: 780 }, { acct: 'Cash', cr: 780 }], cash: 'operating', cashLabel: 'Cash paid to suppliers' },
  { id: 'w22', date: '2027-07-01', text: 'On 1 July, repays the one-year note with its $300 of interest.',
    lines: [{ acct: 'Short-Term Notes Payable', dr: 5_000 }, { acct: 'Interest Payable', dr: 150 }, { acct: 'Interest Expense', dr: 150 }, { acct: 'Cash', cr: 5_300 }],
    cash: { financing: -5_000, operating: -300 } },
  { id: 'w23a', date: '2027-10-01', text: 'On 1 October, before the sale, records the stand’s depreciation for January–September 2027 ($25 a month).',
    lines: [{ acct: 'Depreciation Expense', dr: STAND.monthly * 9 }, { acct: 'Accumulated Depreciation—Equipment', cr: STAND.monthly * 9 }] },
  { id: 'w23', date: '2027-10-01', text: 'On 1 October, sells the original repair stand (cost $1,500, $25 a month of depreciation since July 2026) for $700 in cash.',
    lines: [{ acct: 'Cash', dr: STAND.price }, { acct: 'Accumulated Depreciation—Equipment', dr: STAND.monthly * STAND.months }, { acct: 'Loss on Sale of Equipment', dr: standLoss }, { acct: 'Equipment', cr: STAND.cost }], cash: 'investing' },
  { id: 'w24', date: '2027-04-15', text: 'On 15 April, pays the 2026 income tax owed.',
    lines: [{ acct: 'Income Taxes Payable', dr: 1_050 }, { acct: 'Cash', cr: 1_050 }], cash: 'operating' },
  { id: 'w25', date: '2027-12-31', text: 'Estimated income tax paid for 2027.',
    lines: [{ acct: 'Income Tax Expense', dr: TAX_PAID }, { acct: 'Cash', cr: TAX_PAID }], cash: 'operating' },
  { id: 'w26', date: '2027-12-31', text: 'Dividends declared and paid to Mateo, $400 a month.',
    lines: [{ acct: 'Dividends', dr: 4_800 }, { acct: 'Cash', cr: 4_800 }], cash: 'financing' },
];

/** What Mateo knows on 31 December 2027 (the project's adjustments). */
export const YEAR_END = [
  `A count finds accessories costing $${ACCESSORIES.ending.toLocaleString('en-US')} on the shelves; the rest of the $${ACCESSORIES.purchases.toLocaleString('en-US')} bought was sold or returned.`,
  `The ex-demonstration e-bike (cost $${DEMO_EBIKE.cost.toLocaleString('en-US')}) is still unsold; it can be sold for $${DEMO_EBIKE.price.toLocaleString('en-US')}, with $${DEMO_EBIKE.sellingCosts} of selling costs.`,
  'A count finds $640 of repair parts and supplies on hand.',
  'Insurance: the old policy ran to 30 June 2027; the renewal costs $780 for twelve months from 1 July.',
  'Depreciation still to record: the original equipment other than the sold stand at $55 a month for the whole year; the new equipment at $150 a month from March.',
  'The aging of receivables (below) gives the allowance needed.',
  'Interest has built up on the new loan for March–December.',
  'The $3,000 instalment due on 1 March 2028 is a current liability.',
  'Income tax for 2027 is 25% of income before tax; $2,000 has been paid.',
];

const supUsed = OPENING.Supplies + 8_100 - 640;                                                                                 // 7,980
const accessoriesCogs = ACCESSORIES.purchases - ACCESSORIES.ending;                                                             // 4,850
const insurance = 360 + 780 * 6 / 12;                                                                                           // 750
const allowanceBefore = OPENING['Allowance for Doubtful Accounts'] - writtenOff;                                                // −240 (a debit balance)
const badDebt = allowanceNeeded - allowanceBefore;                                                                              // 667
const loanInterest = NEW_LOAN.principal * NEW_LOAN.rate * NEW_LOAN.months / 12;                                                 // 700
const pre = [
  { id: 'v1', date: '2027-12-31', adjusting: true, text: 'Cost of the accessories sold (periodic: purchases − ending count).',
    lines: [{ acct: 'Cost of Goods Sold', dr: accessoriesCogs }, { acct: 'Inventory', cr: accessoriesCogs }] },
  { id: 'v2', date: '2027-12-31', adjusting: true, text: 'Write the ex-demonstration e-bike down to net realisable value.',
    lines: [{ acct: 'Cost of Goods Sold', dr: writeDown }, { acct: 'Inventory', cr: writeDown }] },
  { id: 'v3', date: '2027-12-31', adjusting: true, text: 'Repair parts and supplies used.',
    lines: [{ acct: 'Supplies Expense', dr: supUsed }, { acct: 'Supplies', cr: supUsed }] },
  { id: 'v4', date: '2027-12-31', adjusting: true, text: 'Insurance expired: January–June of the old policy and July–December of the new one.',
    lines: [{ acct: 'Insurance Expense', dr: insurance }, { acct: 'Prepaid Insurance', cr: insurance }] },
  { id: 'v5', date: '2027-12-31', adjusting: true, text: 'Depreciation for 2027 on the equipment still held (the sold stand’s was recorded at the sale).',
    lines: [{ acct: 'Depreciation Expense', dr: depreciation - STAND.monthly * 9 }, { acct: 'Accumulated Depreciation—Equipment', cr: depreciation - STAND.monthly * 9 }] },
  { id: 'v6', date: '2027-12-31', adjusting: true, text: 'Bad debts: bring the allowance from a $240 debit balance to the $427 the aging requires.',
    lines: [{ acct: 'Bad Debt Expense', dr: badDebt }, { acct: 'Allowance for Doubtful Accounts', cr: badDebt }] },
  { id: 'v7', date: '2027-12-31', adjusting: true, text: 'Interest on the new loan, March–December.',
    lines: [{ acct: 'Interest Expense', dr: loanInterest }, { acct: 'Interest Payable', cr: loanInterest }] },
  { id: 'v8', date: '2027-12-31', adjusting: true, text: 'The instalment due on 1 March 2028 is shown as current.',
    lines: [{ acct: 'Notes Payable', dr: NEW_LOAN.instalment }, { acct: 'Current Portion of Long-Term Debt', cr: NEW_LOAN.instalment }] },
];
const before = A.post([...YEAR, ...pre], CHART, OPENING);
const pretax = A.multiStepIncome(before, CHART).incomeBeforeTax;
const taxTotal = Math.round(pretax * TAX_RATE);
export const ADJUSTMENTS = [...pre,
  { id: 'v9', date: '2027-12-31', adjusting: true, text: 'Income tax for 2027, less the $2,000 already paid.',
    lines: [{ acct: 'Income Tax Expense', dr: taxTotal - TAX_PAID }, { acct: 'Income Taxes Payable', cr: taxTotal - TAX_PAID }] },
];

const ALL = [...YEAR, ...ADJUSTMENTS];
export const LEDGER = A.post(ALL, CHART, OPENING);
const IS = A.multiStepIncome(LEDGER, CHART);
const SCE = A.equityStatement(LEDGER, CHART, OPENING);
const BS = A.balanceSheet(LEDGER, CHART);
const BS0 = A.balanceSheet(A.post([], CHART, OPENING), CHART);
const CF = A.cashFlows(ALL, CHART);
const IND = A.indirectOperating(LEDGER, CHART, OPENING);
const bal = (n) => LEDGER[n]?.balance || 0;

export const RESULTS = {
  bikesBought, fifoCogs: fifo, fifoEnding: bikesBought - fifo, accessoriesCogs, nrv, writeDown,
  cogs: bal('Cost of Goods Sold'), inventoryEnd: bal('Inventory'),
  retailNet: bal('Retail Sales Revenue') - bal('Sales Returns and Allowances'),
  retailGrossMargin: (bal('Retail Sales Revenue') - bal('Sales Returns and Allowances') - bal('Cost of Goods Sold')) / (bal('Retail Sales Revenue') - bal('Sales Returns and Allowances')),
  allowanceNeeded, allowanceBefore, badDebt, receivablesNet: bal('Accounts Receivable') - bal('Allowance for Doubtful Accounts'), receivablesGross: bal('Accounts Receivable'),
  depreciation, standBook, standLoss, loanInterest, supUsed, insurance,
  revenue: IS.revenue, costOfSales: IS.costOfSales, grossProfit: IS.grossProfit, operatingExpenses: IS.operatingExpenses,
  operatingIncome: IS.operatingIncome, otherExpenses: IS.otherExpenses, incomeBeforeTax: IS.incomeBeforeTax, incomeTax: IS.incomeTax,
  netIncome: IS.netIncome, ebit: IS.ebit, ebitda: IS.ebitda, taxPayable: bal('Income Taxes Payable'),
  retainedEarnings: SCE.retainedEarnings.end, equity: SCE.total, dividends: bal('Dividends'),
  currentAssets: BS.assets.currentTotal, totalAssets: BS.assets.total, currentLiabilities: BS.liabilities.currentTotal,
  totalLiabilities: BS.liabilities.total, workingCapital: BS.assets.currentTotal - BS.liabilities.currentTotal,
  workingCapital2026: BS0.assets.currentTotal - BS0.liabilities.currentTotal, totalAssets2026: BS0.assets.total,
  cash: bal('Cash'), cfo: CF.operating, cfi: CF.investing, cff: CF.financing, netCash: CF.net, cfoIndirect: IND.operating,
  receipts: CF.lines.find((l) => l[0] === 'Cash received from customers')?.[1],
  statements: { income: IS, equity: SCE, balance: BS, balance2026: BS0, cash: CF, indirect: IND },
};

export const IDENTITIES = [
  ['balance sheet balances (2027)', BS.balanced],
  ['balance sheet balances (2026)', BS0.balanced],
  ['cash: opening + net flow = ledger', Math.round((OPENING.Cash + CF.net) * 100) === Math.round(bal('Cash') * 100)],
  ['direct operating = indirect operating', Math.round(CF.operating * 100) === Math.round(IND.operating * 100)],
  ['retained earnings roll forward', Math.round((OPENING['Retained Earnings'] + IS.netIncome - bal('Dividends')) * 100) === Math.round(SCE.retainedEarnings.end * 100)],
  ['the stand is depreciated over 60 months at $25', STAND.monthly * 60 === STAND.cost],
  ['income before tax is a whole multiple of 4 (tax in whole dollars)', Number.isInteger(pretax * TAX_RATE)],
  ['aging total = gross receivables', AGING.reduce((s, b) => s + b.amount, 0) === bal('Accounts Receivable')],
  ['inventory = FIFO bikes + accessories counted + demo e-bike at NRV', bal('Inventory') === bikesBought - fifo + ACCESSORIES.ending + nrv],
];
