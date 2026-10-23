// case.js — the F02 Financial Statement Preparation story: Lantern Coffee Co.'s first financial year, 1 March to
// 31 December 2026 (ten months), and the four financial statements Ana Lim's accountant prepares from it. One source of
// truth for the chart of accounts, the year's transactions (in summary), the year-end adjustments and every figure the
// lessons, exercises, assessments and widgets use. Every name and figure is invented for teaching.
//
// Agrees with earlier courses:
// - f01/case.js: Lantern formed 1 March 2026; Ana's $20,000 for common stock; Coastline Bank's $10,000 two-year note at
//   6% (interest $150 every three months from 1 June, $50 a month accrued); espresso equipment $12,000 on 3 March,
//   five years, no residual value, straight line, a full month in the month of purchase ($200 a month); insurance $1,800
//   for 1 March 2026 – 28 February 2027; kitchen rent $1,200 a month; Harbor Tech's $2,400 deposit; a $300 dividend in
//   March. F01's "suppose that on 1 June 2026 Lantern buys a delivery van for $30,000 …" (f01/adjusting-entries.ex.js,
//   five years, $6,000 residual, $400 a month) is what happened.
// - b02 and b01: the online shop has sold bags of beans since March. Its order values were $9,096.15 for March–June
//   (B02's cleaned export) and $101,928.40 for July–December (B01: orders × average order value); together $111,025 to
//   the nearest dollar. B01 measured order values; the books also record refunds and prepaid subscriptions.
// - m01/case.js: 14 workshops averaging 12 participants at $125 ($21,000); catering at an average of $820 an event.
// - f04/case.js: Ana is paid a salary from 2027, not in 2026.
//
// F01 kept Lantern's March books with every staff cost in Wages Expense and every consumable in Supplies Expense. For
// the annual statements Lantern's accountant separates the direct costs of catering and workshops (event baristas'
// wages, catering supplies, workshop materials) into Cost of Services, so the income statement can show gross profit.
//
// Amounts are whole dollars: the shop's sales are rounded to the nearest dollar; everything else is exact.
import * as A from '../../../core/accounting.js?v=10';

/** Account fields beyond F01's: section (multi-step income statement), da / noncash (depreciation), cashClass. */
export const CHART = [
  { no: 101, name: 'Cash', type: 'asset', group: 'current' },
  { no: 110, name: 'Accounts Receivable', type: 'asset', group: 'current' },
  { no: 111, name: 'Allowance for Doubtful Accounts', type: 'contra-asset', group: 'current', contra: 'Accounts Receivable' },
  { no: 112, name: 'Interest Receivable', type: 'asset', group: 'current' },
  { no: 115, name: 'Notes Receivable', type: 'asset', group: 'current' },
  { no: 118, name: 'Inventory', type: 'asset', group: 'current' },
  { no: 120, name: 'Supplies', type: 'asset', group: 'current' },
  { no: 130, name: 'Prepaid Insurance', type: 'asset', group: 'current' },
  { no: 131, name: 'Prepaid Rent', type: 'asset', group: 'current' },
  { no: 150, name: 'Equipment', type: 'asset', group: 'noncurrent' },
  { no: 151, name: 'Accumulated Depreciation—Equipment', type: 'contra-asset', group: 'noncurrent', contra: 'Equipment' },
  { no: 160, name: 'Van', type: 'asset', group: 'noncurrent' },
  { no: 161, name: 'Accumulated Depreciation—Van', type: 'contra-asset', group: 'noncurrent', contra: 'Van' },
  { no: 170, name: 'Land', type: 'asset', group: 'noncurrent' },
  { no: 175, name: 'Building', type: 'asset', group: 'noncurrent' },
  { no: 176, name: 'Accumulated Depreciation—Building', type: 'contra-asset', group: 'noncurrent', contra: 'Building' },
  { no: 180, name: 'Patents', type: 'asset', group: 'noncurrent' },
  { no: 181, name: 'Accumulated Amortisation—Patents', type: 'contra-asset', group: 'noncurrent', contra: 'Patents' },
  { no: 201, name: 'Accounts Payable', type: 'liability', group: 'current' },
  { no: 210, name: 'Wages Payable', type: 'liability', group: 'current' },
  { no: 215, name: 'Interest Payable', type: 'liability', group: 'current' },
  { no: 220, name: 'Unearned Revenue', type: 'liability', group: 'current' },
  { no: 225, name: 'Income Taxes Payable', type: 'liability', group: 'current' },
  { no: 230, name: 'Dividends Payable', type: 'liability', group: 'current', cashClass: 'financing' },
  { no: 240, name: 'Current Portion of Long-Term Debt', type: 'liability', group: 'current', cashClass: 'financing' },
  { no: 250, name: 'Notes Payable', type: 'liability', group: 'noncurrent' },
  { no: 301, name: 'Common Stock', type: 'equity' },
  { no: 310, name: 'Additional Paid-in Capital', type: 'equity' },
  { no: 320, name: 'Retained Earnings', type: 'equity' },
  { no: 330, name: 'Dividends', type: 'dividends' },
  { no: 350, name: 'Income Summary', type: 'summary' },
  { no: 401, name: 'Catering Revenue', type: 'revenue' },
  { no: 402, name: 'Training Revenue', type: 'revenue' },
  { no: 403, name: 'Online Sales Revenue', type: 'revenue' },
  { no: 404, name: 'Sales Returns and Allowances', type: 'contra-revenue' },
  { no: 405, name: 'Sales Discounts', type: 'contra-revenue' },
  { no: 410, name: 'Interest Revenue', type: 'revenue', section: 'other' },
  { no: 420, name: 'Gain on Sale of Equipment', type: 'revenue', section: 'other', gain: true },
  { no: 501, name: 'Wages Expense', type: 'expense' },
  { no: 505, name: 'Cost of Goods Sold', type: 'expense', section: 'cost' },
  { no: 506, name: 'Cost of Services', type: 'expense', section: 'cost' },
  { no: 510, name: 'Rent Expense', type: 'expense' },
  { no: 520, name: 'Supplies Expense', type: 'expense' },
  { no: 530, name: 'Utilities Expense', type: 'expense' },
  { no: 540, name: 'Advertising Expense', type: 'expense' },
  { no: 550, name: 'Insurance Expense', type: 'expense' },
  { no: 560, name: 'Depreciation Expense', type: 'expense', da: true, noncash: true },
  { no: 565, name: 'Amortisation Expense', type: 'expense', da: true, noncash: true },
  { no: 570, name: 'Fuel Expense', type: 'expense' },
  { no: 575, name: 'Delivery Expense', type: 'expense' },
  { no: 576, name: 'Card and Platform Fees Expense', type: 'expense' },
  { no: 585, name: 'Bad Debt Expense', type: 'expense' },
  { no: 599, name: 'Miscellaneous Expense', type: 'expense' },
  { no: 580, name: 'Interest Expense', type: 'expense', section: 'other', interest: true },
  { no: 590, name: 'Loss on Sale of Equipment', type: 'expense', section: 'other', loss: true },
  { no: 600, name: 'Income Tax Expense', type: 'expense', section: 'tax' },
];

/** The facts behind the year, in one place (the transactions below are built from them). */
export const FACTS = {
  period: { start: '2026-03-01', end: '2026-12-31', months: 10 },
  stock: 20_000,
  coastline: { principal: 10_000, rate: 0.06, interestPaid: 450, interestAccrued: 50 },       // paid 1 Jun, 1 Sep, 1 Dec; December accrued
  equipment: { cost: 12_000, life: 5, residual: 0, monthly: 200, months: 10 },
  van: { cost: 30_000, residual: 6_000, life: 5, monthly: 400, months: 7, bought: '2026-06-01', cashDown: 10_000 },
  vanNote: { principal: 20_000, rate: 0.06, instalment: 5_000, first: '2027-06-01', last: '2030-06-01', months: 7 },   // interest paid with each instalment
  insurance: { premium: 1_800, monthly: 150, expired: 10 },
  rent: { monthly: 1_200, months: 10 },
  catering: { events: 76, average: 820, depositsReceived: 4_040, depositsEarned: 2_400, invoiced: 59_920, collected: 51_720, writtenOff: 820 },
  training: { workshops: 14, participants: 12, price: 125, paidForJanuary: 1_500 },
  shop: { orderValueMarJun: 9_096.15, orderValueJulDec: 101_928.40, sales: 111_025, refunds: 1_025, prepaidSubscriptions: 2_960, cardFees: 4_010 },
  inventory: { purchases: 58_600, paid: 50_200, cogsPerpetual: 52_400, writeDown: 400 },
  supplies: { bought: 11_540, paid: 11_020, onHand: 640 },
  wages: { events: 25_200, shopAndOffice: 18_400, payable: 2_100 },
  utilities: { expense: 2_860, unpaid: 290 },
  advertising: 6_500, delivery: 12_630, fuel: 1_960, misc: 640,
  dividends: [{ date: '2026-03-30', amount: 300 }, { date: '2026-12-15', amount: 4_700 }],
  tax: { rate: 0.25, estimatedPaid: 6_000 },     // a combined federal (21%) and state rate assumed for the case
};

/** Accounts receivable at 31 December by age, and the share of each band Lantern expects not to collect. */
export const AGING = [
  { band: 'Not yet due (0–30 days)', amount: 5_000, rate: 0.02 },
  { band: '31–60 days', amount: 1_560, rate: 0.10 },
  { band: 'Over 60 days', amount: 820, rate: 0.40 },
];

/** House Blend 250 g bags in the shop, October–December 2026 (perpetual records; a slice of the year's inventory). */
export const HOUSE_BLEND_Q4 = {
  opening: { date: '2026-10-01', units: 300, cost: 8.00 },
  purchases: [
    { date: '2026-10-12', units: 600, cost: 8.40 },
    { date: '2026-11-09', units: 900, cost: 8.80 },
    { date: '2026-12-03', units: 1_200, cost: 9.00 },
  ],
  sold: 2_600,              // bags shipped in the quarter
  price: 18,                // list price a bag (B02)
};

const F = FACTS;
const cat = F.catering, shop = F.shop, inv = F.inventory, sup = F.supplies, wg = F.wages;
const vanNoteInterest = F.vanNote.principal * F.vanNote.rate * F.vanNote.months / 12;          // 700
const agingAllowance = AGING.reduce((s, b) => s + b.amount * b.rate, 0);                         // 584
const badDebt = agingAllowance + cat.writtenOff;                                                  // 1,404: the allowance had a debit balance of 820

/** The year in summary: each entry totals one kind of transaction for March–December. `cash` classifies cash lines. */
export const YEAR = [
  { id: 'y1', date: '2026-03-01', text: 'Ana Lim invests $20,000 in Lantern in exchange for common stock.',
    lines: [{ acct: 'Cash', dr: F.stock }, { acct: 'Common Stock', cr: F.stock }], cash: 'financing' },
  { id: 'y2', date: '2026-03-01', text: 'Lantern borrows $10,000 from Coastline Bank on a two-year note at 6%, repayable on 1 March 2028.',
    lines: [{ acct: 'Cash', dr: F.coastline.principal }, { acct: 'Notes Payable', cr: F.coastline.principal }], cash: 'financing' },
  { id: 'y3', date: '2026-03-03', text: 'Espresso machine and grinder, $12,000 ($4,000 paid on 3 March, the other $8,000 on 2 April).',
    lines: [{ acct: 'Equipment', dr: F.equipment.cost }, { acct: 'Cash', cr: F.equipment.cost }], cash: 'investing' },
  { id: 'y4', date: '2026-06-01', text: 'A delivery van for $30,000: $10,000 in cash and a $20,000 note payable to the dealer’s finance company at 6%, repaid in four yearly instalments of $5,000 from 1 June 2027, with the interest due on each instalment date.',
    lines: [{ acct: 'Van', dr: F.van.cost }, { acct: 'Cash', cr: F.van.cashDown }, { acct: 'Notes Payable', cr: F.vanNote.principal }], cash: 'investing' },
  { id: 'y5', date: '2026-03-04', text: 'Insurance for 1 March 2026 – 28 February 2027, paid in advance.',
    lines: [{ acct: 'Prepaid Insurance', dr: F.insurance.premium }, { acct: 'Cash', cr: F.insurance.premium }], cash: 'operating', cashLabel: 'Cash paid to suppliers' },
  { id: 'y6', date: '2026-12-31', text: 'Catering deposits received: Harbor Tech’s $2,400 in March and $1,640 in December for two January events.',
    lines: [{ acct: 'Cash', dr: cat.depositsReceived }, { acct: 'Unearned Revenue', cr: cat.depositsReceived }], cash: 'operating' },
  { id: 'y7', date: '2026-12-31', text: 'Harbor Tech’s three prepaid events are catered (March and April).',
    lines: [{ acct: 'Unearned Revenue', dr: cat.depositsEarned }, { acct: 'Catering Revenue', cr: cat.depositsEarned }] },
  { id: 'y8', date: '2026-12-31', text: 'The other catering events, invoiced on 30-day terms.',
    lines: [{ acct: 'Accounts Receivable', dr: cat.invoiced }, { acct: 'Catering Revenue', cr: cat.invoiced }] },
  { id: 'y9', date: '2026-12-31', text: 'Cash collected from catering clients.',
    lines: [{ acct: 'Cash', dr: cat.collected }, { acct: 'Accounts Receivable', cr: cat.collected }], cash: 'operating' },
  { id: 'y10', date: '2026-11-20', text: 'Quayline Events, a one-off client, closes down owing $820 for a September event; Lantern writes the invoice off.',
    lines: [{ acct: 'Allowance for Doubtful Accounts', dr: cat.writtenOff }, { acct: 'Accounts Receivable', cr: cat.writtenOff }] },
  { id: 'y11', date: '2026-12-31', text: 'Workshop fees received: $21,000 for the 14 workshops held and $1,500 for a workshop on 9 January 2027.',
    lines: [{ acct: 'Cash', dr: 21_000 + F.training.paidForJanuary }, { acct: 'Training Revenue', cr: 21_000 }, { acct: 'Unearned Revenue', cr: F.training.paidForJanuary }], cash: 'operating' },
  { id: 'y12', date: '2026-12-31', text: 'Online shop: orders shipped ($111,025) and subscriptions paid for but not yet shipped ($2,960), all paid by card.',
    lines: [{ acct: 'Cash', dr: shop.sales + shop.prepaidSubscriptions }, { acct: 'Online Sales Revenue', cr: shop.sales }, { acct: 'Unearned Revenue', cr: shop.prepaidSubscriptions }], cash: 'operating' },
  { id: 'y13', date: '2026-12-31', text: 'Refunds for bags damaged in transit, paid back to customers’ cards.',
    lines: [{ acct: 'Sales Returns and Allowances', dr: shop.refunds }, { acct: 'Cash', cr: shop.refunds }], cash: 'operating', cashLabel: 'Cash received from customers' },
  { id: 'y14', date: '2026-12-31', text: 'Card-processing and shop-platform fees.',
    lines: [{ acct: 'Card and Platform Fees Expense', dr: shop.cardFees }, { acct: 'Cash', cr: shop.cardFees }], cash: 'operating' },
  { id: 'y15', date: '2026-12-31', text: 'Bags of roasted beans bought for the shop from Tidewater Roasting on 30-day terms.',
    lines: [{ acct: 'Inventory', dr: inv.purchases }, { acct: 'Accounts Payable', cr: inv.purchases }] },
  { id: 'y16', date: '2026-12-31', text: 'Payments to Tidewater Roasting.',
    lines: [{ acct: 'Accounts Payable', dr: inv.paid }, { acct: 'Cash', cr: inv.paid }], cash: 'operating' },
  { id: 'y17', date: '2026-12-31', text: 'Cost of the bags shipped, from the perpetual inventory records (first in, first out).',
    lines: [{ acct: 'Cost of Goods Sold', dr: inv.cogsPerpetual }, { acct: 'Inventory', cr: inv.cogsPerpetual }] },
  { id: 'y18', date: '2026-12-31', text: 'Catering supplies and workshop materials bought on account.',
    lines: [{ acct: 'Supplies', dr: sup.bought }, { acct: 'Accounts Payable', cr: sup.bought }] },
  { id: 'y19', date: '2026-12-31', text: 'Payments to supply vendors.',
    lines: [{ acct: 'Accounts Payable', dr: sup.paid }, { acct: 'Cash', cr: sup.paid }], cash: 'operating' },
  { id: 'y20', date: '2026-12-31', text: 'Wages: event baristas $25,200 (a cost of services) and shop and office staff $18,400; $2,100 earned in late December is paid on 5 January.',
    lines: [{ acct: 'Cost of Services', dr: wg.events }, { acct: 'Wages Expense', dr: wg.shopAndOffice }, { acct: 'Cash', cr: wg.events + wg.shopAndOffice - wg.payable }, { acct: 'Wages Payable', cr: wg.payable }], cash: 'operating', cashLabel: 'Cash paid to employees' },
  { id: 'y21', date: '2026-12-31', text: 'Kitchen rent, $1,200 a month.',
    lines: [{ acct: 'Rent Expense', dr: F.rent.monthly * F.rent.months }, { acct: 'Cash', cr: F.rent.monthly * F.rent.months }], cash: 'operating', cashLabel: 'Cash paid to suppliers' },
  { id: 'y22', date: '2026-12-31', text: 'Utilities; December’s $290 bill is unpaid at the year end.',
    lines: [{ acct: 'Utilities Expense', dr: F.utilities.expense }, { acct: 'Cash', cr: F.utilities.expense - F.utilities.unpaid }, { acct: 'Accounts Payable', cr: F.utilities.unpaid }], cash: 'operating' },
  { id: 'y23', date: '2026-12-31', text: 'Advertising.',
    lines: [{ acct: 'Advertising Expense', dr: F.advertising }, { acct: 'Cash', cr: F.advertising }], cash: 'operating', cashLabel: 'Cash paid to suppliers' },
  { id: 'y24', date: '2026-12-31', text: 'Couriers and postage for shop orders.',
    lines: [{ acct: 'Delivery Expense', dr: F.delivery }, { acct: 'Cash', cr: F.delivery }], cash: 'operating' },
  { id: 'y25', date: '2026-12-31', text: 'Fuel for the van.',
    lines: [{ acct: 'Fuel Expense', dr: F.fuel }, { acct: 'Cash', cr: F.fuel }], cash: 'operating' },
  { id: 'y26', date: '2026-12-31', text: 'Bank charges, licences and other small costs.',
    lines: [{ acct: 'Miscellaneous Expense', dr: F.misc }, { acct: 'Cash', cr: F.misc }], cash: 'operating' },
  { id: 'y27', date: '2026-12-01', text: 'Interest on the Coastline note, paid on 1 June, 1 September and 1 December.',
    lines: [{ acct: 'Interest Expense', dr: F.coastline.interestPaid }, { acct: 'Cash', cr: F.coastline.interestPaid }], cash: 'operating' },
  { id: 'y28', date: '2026-12-31', text: 'Estimated income tax paid during the year.',
    lines: [{ acct: 'Income Tax Expense', dr: F.tax.estimatedPaid }, { acct: 'Cash', cr: F.tax.estimatedPaid }], cash: 'operating' },
  ...F.dividends.map((d, i) => ({ id: `y${29 + i}`, date: d.date, text: `Dividend declared and paid to Ana Lim.`,
    lines: [{ acct: 'Dividends', dr: d.amount }, { acct: 'Cash', cr: d.amount }], cash: 'financing' })),
];

// ---------------------------------------------------------------- year-end adjustments (income tax last: it depends on the rest)
const pre = [
  { id: 'e1', date: '2026-12-31', adjusting: true, kind: 'prepaid expense', text: 'Ten months of the $1,800 insurance policy have expired.',
    lines: [{ acct: 'Insurance Expense', dr: F.insurance.monthly * F.insurance.expired }, { acct: 'Prepaid Insurance', cr: F.insurance.monthly * F.insurance.expired }] },
  { id: 'e2', date: '2026-12-31', adjusting: true, kind: 'supplies used', text: 'A count finds $640 of supplies on hand; the rest was used at events and workshops.',
    lines: [{ acct: 'Cost of Services', dr: sup.bought - sup.onHand }, { acct: 'Supplies', cr: sup.bought - sup.onHand }] },
  { id: 'e3', date: '2026-12-31', adjusting: true, kind: 'depreciation', text: 'Depreciation on the espresso equipment: $200 a month for ten months.',
    lines: [{ acct: 'Depreciation Expense', dr: F.equipment.monthly * F.equipment.months }, { acct: 'Accumulated Depreciation—Equipment', cr: F.equipment.monthly * F.equipment.months }] },
  { id: 'e4', date: '2026-12-31', adjusting: true, kind: 'depreciation', text: 'Depreciation on the van: ($30,000 − $6,000) ÷ 5 = $4,800 a year, $400 a month for June–December.',
    lines: [{ acct: 'Depreciation Expense', dr: F.van.monthly * F.van.months }, { acct: 'Accumulated Depreciation—Van', cr: F.van.monthly * F.van.months }] },
  { id: 'e5', date: '2026-12-31', adjusting: true, kind: 'accrued interest', text: 'Interest owed at 31 December: $50 on the Coastline note for December and $700 on the van note for June–December.',
    lines: [{ acct: 'Interest Expense', dr: F.coastline.interestAccrued + vanNoteInterest }, { acct: 'Interest Payable', cr: F.coastline.interestAccrued + vanNoteInterest }] },
  { id: 'e6', date: '2026-12-31', adjusting: true, kind: 'bad debts', text: 'The aging of receivables says $584 of the $7,380 owed will not be collected; the allowance has a debit balance of $820 after the write-off.',
    lines: [{ acct: 'Bad Debt Expense', dr: badDebt }, { acct: 'Allowance for Doubtful Accounts', cr: badDebt }] },
  { id: 'e7', date: '2026-12-31', adjusting: true, kind: 'inventory write-down', text: 'Holiday Blend bags costing $1,000 can now be sold for only $600 after selling costs: written down to net realisable value.',
    lines: [{ acct: 'Cost of Goods Sold', dr: inv.writeDown }, { acct: 'Inventory', cr: inv.writeDown }] },
  { id: 'e8', date: '2026-12-31', adjusting: true, kind: 'reclassification', text: 'The $5,000 instalment of the van note due on 1 June 2027 is shown as a current liability.',
    lines: [{ acct: 'Notes Payable', dr: F.vanNote.instalment }, { acct: 'Current Portion of Long-Term Debt', cr: F.vanNote.instalment }] },
];
const before = A.post([...YEAR, ...pre], CHART);
const pretax = A.multiStepIncome(before, CHART).incomeBeforeTax;                       // income tax is below this line
const taxTotal = Math.round(pretax * F.tax.rate);
export const ADJUSTMENTS = [
  ...pre,
  { id: 'e9', date: '2026-12-31', adjusting: true, kind: 'income tax', text: `Income tax for the year at 25% of income before tax, less the $6,000 already paid.`,
    lines: [{ acct: 'Income Tax Expense', dr: taxTotal - F.tax.estimatedPaid }, { acct: 'Income Taxes Payable', cr: taxTotal - F.tax.estimatedPaid }] },
];

// ---------------------------------------------------------------- the statements, computed by the engine
const ALL = [...YEAR, ...ADJUSTMENTS];
export const LEDGER = A.post(ALL, CHART);
const unadjusted = A.post(YEAR, CHART);
const IS = A.multiStepIncome(LEDGER, CHART);
const SCE = A.equityStatement(LEDGER, CHART);
const BS = A.balanceSheet(LEDGER, CHART);
const CF = A.cashFlows(ALL, CHART);
const IND = A.indirectOperating(LEDGER, CHART);
const bal = (n) => LEDGER[n]?.balance || 0;

/** Every figure the course quotes about Lantern's year, recomputed here (and re-checked by tools/study-check.mjs). */
export const DERIVED = {
  shopOrderValue: shop.orderValueMarJun + shop.orderValueJulDec,                  // 111,024.55 → 111,025
  cateringRevenue: bal('Catering Revenue'),                                        // 62,320 = 76 × 820
  trainingRevenue: bal('Training Revenue'),                                        // 21,000
  onlineSales: bal('Online Sales Revenue'),                                        // 111,025
  netOnlineSales: bal('Online Sales Revenue') - bal('Sales Returns and Allowances'),   // 110,000
  grossRevenue: IS.grossRevenue,                                                   // 194,345
  revenue: IS.revenue,                                                             // 193,320
  cogs: bal('Cost of Goods Sold'),                                                 // 52,800
  costOfServices: bal('Cost of Services'),                                         // 36,100
  costOfSales: IS.costOfSales,                                                     // 88,900
  grossProfit: IS.grossProfit,                                                     // 104,420
  shopGrossMargin: (bal('Online Sales Revenue') - bal('Sales Returns and Allowances') - bal('Cost of Goods Sold')) / (bal('Online Sales Revenue') - bal('Sales Returns and Allowances')),   // 0.52
  operatingExpenses: IS.operatingExpenses,                                         // 66,704
  operatingIncome: IS.operatingIncome,                                             // 37,716
  depreciation: bal('Depreciation Expense'),                                       // 4,800
  ebit: IS.ebit, ebitda: IS.ebitda,                                                // 37,716; 42,516
  interestExpense: IS.interestExpense,                                             // 1,200
  incomeBeforeTax: IS.incomeBeforeTax,                                             // 36,516
  incomeTax: IS.incomeTax,                                                         // 9,129
  netIncome: IS.netIncome,                                                         // 27,387
  dividends: bal('Dividends'),                                                     // 5,000
  retainedEarnings: SCE.retainedEarnings.end,                                      // 22,387
  equity: SCE.total,                                                               // 42,387
  allowance: bal('Allowance for Doubtful Accounts'),                               // 584
  badDebt: bal('Bad Debt Expense'),                                                // 1,404
  receivablesNet: bal('Accounts Receivable') - bal('Allowance for Doubtful Accounts'),   // 6,796
  inventoryEnd: bal('Inventory'),                                                  // 5,800
  unearned: bal('Unearned Revenue'),                                               // 6,100
  currentAssets: BS.assets.currentTotal,                                           // 56,476
  noncurrentAssets: BS.assets.noncurrentTotal,                                     // 37,200
  totalAssets: BS.assets.total,                                                    // 93,676
  currentLiabilities: BS.liabilities.currentTotal,                                 // 26,289
  noncurrentLiabilities: BS.liabilities.noncurrentTotal,                           // 25,000
  totalLiabilities: BS.liabilities.total,                                          // 51,289
  workingCapital: BS.assets.currentTotal - BS.liabilities.currentTotal,            // 30,187
  currentRatio: BS.assets.currentTotal / BS.liabilities.currentTotal,              // 2.15
  cashEnd: bal('Cash'),                                                            // 42,940
  cfo: CF.operating, cfi: CF.investing, cff: CF.financing, netCash: CF.net,       // 39,940; −22,000; 25,000; 42,940
  cfoIndirect: IND.operating,                                                      // 39,940
  taxPayable: bal('Income Taxes Payable'),                                         // 3,129
  unadjustedTrialBalance: A.trialBalance(unadjusted, CHART).dr,
  adjustedTrialBalance: A.trialBalance(LEDGER, CHART).dr,
};

/** The engine's own results, for widgets and the checker. */
export const RESULTS = { incomeStatement: IS, equityStatement: SCE, balanceSheet: BS, cashFlows: CF, indirect: IND, trialBalance: A.trialBalance(LEDGER, CHART) };

// ---------------------------------------------------------------- the statements as `statement` blocks for the lessons
const title = 'Lantern Coffee Co.';
const period = 'for the ten months ended 31 December 2026';
const rows = (list, sign = 1) => list.map(([n, v]) => [n, sign * v]);
const neg = (list) => rows(list, -1);

export const STATEMENTS = {
  income: {
    title, subtitle: `Income statement ${period}`,
    sections: [
      { head: 'Revenue', rows: [...rows(IS.lists.revenue), ...neg(IS.lists.contra)], total: ['Net revenue', IS.revenue] },
      { head: 'Cost of sales', rows: rows(IS.lists.cost), total: ['Total cost of sales', IS.costOfSales] },
      { rows: [['Net revenue', IS.revenue], ['Less total cost of sales', -IS.costOfSales]], total: ['Gross profit', IS.grossProfit] },
      { head: 'Operating expenses', rows: rows(IS.lists.operating), total: ['Total operating expenses', IS.operatingExpenses] },
      { rows: [['Gross profit', IS.grossProfit], ['Less total operating expenses', -IS.operatingExpenses]], total: ['Operating income', IS.operatingIncome] },
      { rows: [['Operating income', IS.operatingIncome], ...neg(IS.lists.otherExpense)], total: ['Income before income tax', IS.incomeBeforeTax] },
      { rows: [['Income before income tax', IS.incomeBeforeTax], ...neg(IS.lists.tax)], total: ['Net income', IS.netIncome] },
    ],
  },
  equity: {
    title, subtitle: `Statement of changes in equity ${period}`,
    sections: [
      { head: 'Common stock', rows: [['Balance, 1 March 2026', 0], ['Shares issued', SCE.commonStock.issued]], total: ['Balance, 31 December 2026', SCE.commonStock.end] },
      { head: 'Retained earnings', rows: [['Balance, 1 March 2026', 0], ['Net income', SCE.retainedEarnings.netIncome], ['Dividends', -SCE.retainedEarnings.dividends]], total: ['Balance, 31 December 2026', SCE.retainedEarnings.end] },
      { rows: [['Common stock', SCE.commonStock.end], ['Retained earnings', SCE.retainedEarnings.end]], total: ['Total equity, 31 December 2026', SCE.total] },
    ],
  },
  balance: {
    title, subtitle: 'Balance sheet at 31 December 2026',
    sections: [
      { head: 'Current assets', rows: BS.assets.current, total: ['Total current assets', BS.assets.currentTotal] },
      { head: 'Property and equipment', rows: BS.assets.noncurrent, total: ['Total property and equipment', BS.assets.noncurrentTotal] },
      { rows: [['Total current assets', BS.assets.currentTotal], ['Total property and equipment', BS.assets.noncurrentTotal]], total: ['Total assets', BS.assets.total] },
      { head: 'Current liabilities', rows: BS.liabilities.current, total: ['Total current liabilities', BS.liabilities.currentTotal] },
      { head: 'Noncurrent liabilities', rows: BS.liabilities.noncurrent, total: ['Total noncurrent liabilities', BS.liabilities.noncurrentTotal] },
      { head: 'Equity', rows: BS.equity, total: ['Total equity', BS.equityTotal] },
      { rows: [['Total liabilities', BS.liabilities.total], ['Total equity', BS.equityTotal]], total: ['Total liabilities and equity', BS.liabilities.total + BS.equityTotal] },
    ],
  },
  cashDirect: {
    title, subtitle: `Statement of cash flows (direct method) ${period}`,
    sections: ['operating', 'investing', 'financing'].map((k) => ({
      head: `${k[0].toUpperCase()}${k.slice(1)} activities`, rows: CF.lines.filter((l) => l[2] === k).map(([n, v]) => [n, v]),
      total: [`Net cash from ${k} activities`, CF[k]] })).concat([
      { rows: [['Net cash from operating activities', CF.operating], ['Net cash used in investing activities', CF.investing], ['Net cash from financing activities', CF.financing], ['Cash, 1 March 2026', 0]], total: ['Cash, 31 December 2026', CF.net] },
    ]),
    note: 'Noncash investing and financing: ' + CF.noncash.join(' '),
  },
  cashIndirect: {
    title, subtitle: `Cash flows from operating activities (indirect method) ${period}`,
    sections: [
      { rows: [['Net income', IND.netIncome], ...IND.adjustments, ...IND.workingCapital], total: ['Net cash from operating activities', IND.operating] },
    ],
  },
};

/** Inventory costing for the House Blend in the fourth quarter (FIFO, LIFO, weighted average, periodic). */
const hb = HOUSE_BLEND_Q4;
const layers = [hb.opening, ...hb.purchases];
const units = layers.reduce((s, l) => s + l.units, 0);                        // 3,000
const goodsAvailable = layers.reduce((s, l) => s + l.units * l.cost, 0);      // 26,160
const endUnits = units - hb.sold;                                             // 400
const take = (order, n) => { let left = n, cost = 0; for (const l of order) { const q = Math.min(left, l.units); cost += q * l.cost; left -= q; if (!left) break; } return cost; };
export const COSTING = {
  units, goodsAvailable, endUnits,
  fifo: { cogs: take(layers, hb.sold), ending: take([...layers].reverse(), endUnits) },                 // 22,560; 3,600
  lifo: { cogs: take([...layers].reverse(), hb.sold), ending: take(layers, endUnits) },                // 22,920; 3,240 (periodic)
  average: { unitCost: goodsAvailable / units, cogs: goodsAvailable / units * hb.sold, ending: goodsAvailable / units * endUnits },   // 8.72; 22,672; 3,488 (periodic)
  sales: hb.sold * hb.price,                                                  // 46,800
};

/** Identities the checker relies on: if any is false, the case is broken. */
export const IDENTITIES = [
  ['balance sheet balances', BS.balanced],
  ['trial balance balances', RESULTS.trialBalance.balanced],
  ['cash from the ledger = net cash flow', Math.round(bal('Cash') * 100) === Math.round(CF.net * 100)],
  ['direct operating = indirect operating', Math.round(CF.operating * 100) === Math.round(IND.operating * 100)],
  ['net income agrees (single-step vs multi-step)', Math.round(A.incomeStatement(LEDGER, CHART).netIncome * 100) === Math.round(IS.netIncome * 100)],
  ['catering revenue = events × average', bal('Catering Revenue') === cat.events * cat.average],
  ['shop sales = B02 + B01 order values, to the dollar', Math.round(shop.orderValueMarJun + shop.orderValueJulDec) === shop.sales],
  ['training revenue = workshops × participants × price', bal('Training Revenue') === F.training.workshops * F.training.participants * F.training.price],
  ['allowance = aging estimate', Math.round(bal('Allowance for Doubtful Accounts') * 100) === Math.round(agingAllowance * 100)],
  ['FIFO ending inventory + COGS = goods available', COSTING.fifo.cogs + COSTING.fifo.ending === goodsAvailable],
];
