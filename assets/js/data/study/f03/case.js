// case.js — the F03 Financial Statement Analysis story: Lantern Coffee Co.'s second financial year, 1 January to
// 31 December 2027, the year it opened two cafés, and the comparative statements Ana Lim and Coastline Bank analyse.
// One source of truth for the 2027 transactions (in summary), the adjustments, both years' statements and every
// Lantern figure the lessons, exercises, assessments and widgets use. Every name and figure is invented for teaching.
//
// The 2027 books start from F02's closing balances (31 December 2026) and are posted by the same engine, so the two
// years tie exactly: every opening balance below is F02's closing balance.
//
// Agrees with earlier courses:
// - f02/case.js: the opening balances; the Coastline note ($10,000 at 6%, interest $150 on 1 Mar, 1 Jun, 1 Sep and
//   1 Dec, repaid 1 March 2028); the van note ($20,000 at 6%, $5,000 a year from 1 June 2027 with that year's interest);
//   espresso equipment $2,400 a year and the van $4,800 a year; kitchen rent $1,200 a month; Kilnworth Roasting supplies
//   the beans; the 25% tax rate; the unearned revenue at the start of 2027 (two January catering events $1,640, the
//   9 January workshop $1,500, subscriptions $2,960).
// - f04/case.js: Ana is paid a salary of $48,000 from 2027; the cold-brew brewer costs $24,000, bought on the supplier's
//   plan of 24 monthly payments of $1,050, the first one month after delivery (F04 module 3 finds the plan cheaper
//   than Coastline's 7.2% loan); the law firm's three-year catering contract, of which Lantern took the indexed fee:
//   $40,000 a year in March 2027 dollars, raised with the CPI, each year's fee paid at the end of the contract year.
//   The contract starts on 1 April 2027 (F04: the offer is made in March).
// - m01, b03, b04, m04: workshops at $125 for about 12 places; B03's quote sheet from January 2027; extra catering staff
//   for October–December 2027 (B03); the January 2027 workshop sold 12 places (M04).
// - m04, m05: the cafés are open by March 2027 (both open on 1 March); research in 2027 (M04's office survey and
//   interviews, $6,000; the spring customer survey, focus groups and shelf audit within M04's $7,000 budget; M05's
//   May needs study, $9,600). Lantern Cold Brew was planned for later in 2027; F03 has its launch moved to spring 2028
//   (no Cold Brew sales or cans in the 2027 accounts).
// - f00: the 2028 scenario (Coastline lends $60,000 with a covenant of a current ratio of at least 1.2; Hollis Avery
//   buys 30%) is still ahead: no new shares in 2027.
//
// New in F03 (fictional): the two cafés (Harbourside and Millbrook) on five-year leases from 1 March 2027 at $2,000 a
// month each, paid in advance; their fit-out and machines; Coastline's $30,000 revolving line of credit from August.
// Leases follow ASC 842 (operating leases: a right-of-use asset and a lease liability at the present value of the
// payments, discounted at Lantern's incremental borrowing rate; a single straight-line lease cost).
//
// Amounts are whole dollars, except where a schedule is rounded to the cent first and the year's total to the dollar.
import * as A from '../../../core/accounting.js?v=18';
import * as F02 from '../f02/case.js?v=18';

/** F02's chart plus the accounts 2027 needs. */
export const CHART = [
  ...F02.CHART.filter((a) => a.name !== 'Income Summary'),
  { no: 116, name: 'Contract Asset', type: 'asset', group: 'current' },
  { no: 155, name: 'Leasehold Improvements', type: 'asset', group: 'noncurrent' },
  { no: 156, name: 'Accumulated Depreciation—Leasehold Improvements', type: 'contra-asset', group: 'noncurrent', contra: 'Leasehold Improvements' },
  { no: 185, name: 'Operating Lease Right-of-Use Assets', type: 'asset', group: 'noncurrent', indirectGroup: 'operating lease assets and liabilities' },
  { no: 205, name: 'Line of Credit', type: 'liability', group: 'current', cashClass: 'financing' },
  { no: 241, name: 'Current Portion of Operating Lease Liabilities', type: 'liability', group: 'current', cashClass: 'operating', indirectGroup: 'operating lease assets and liabilities' },
  { no: 252, name: 'Instalment Note Payable', type: 'liability', group: 'noncurrent' },
  { no: 255, name: 'Operating Lease Liabilities', type: 'liability', group: 'noncurrent', cashClass: 'operating', indirectGroup: 'operating lease assets and liabilities' },
  { no: 406, name: 'Café Sales Revenue', type: 'revenue' },
  { no: 515, name: 'Operating Lease Cost', type: 'expense' },
  { no: 545, name: 'Market Research Expense', type: 'expense' },
  { no: 350, name: 'Income Summary', type: 'summary' },
].sort((a, b) => a.no - b.no);

// ---------------------------------------------------------------- opening balances: F02's closing balance sheet
const L26 = F02.LEDGER;
const IS26 = F02.RESULTS.incomeStatement;
const BS26 = F02.RESULTS.balanceSheet;
const OPENING_ACCOUNTS = ['Cash', 'Accounts Receivable', 'Allowance for Doubtful Accounts', 'Inventory', 'Supplies', 'Prepaid Insurance',
  'Equipment', 'Accumulated Depreciation—Equipment', 'Van', 'Accumulated Depreciation—Van',
  'Accounts Payable', 'Wages Payable', 'Interest Payable', 'Unearned Revenue', 'Income Taxes Payable', 'Current Portion of Long-Term Debt', 'Notes Payable', 'Common Stock'];
export const OPENING = Object.fromEntries(OPENING_ACCOUNTS.filter((n) => L26[n]?.balance).map((n) => [n, L26[n].balance]));
OPENING['Retained Earnings'] = F02.RESULTS.equityStatement.retainedEarnings.end;           // 22,387 after closing

/** The facts behind the year. */
export const FACTS = {
  period: { start: '2027-01-01', end: '2027-12-31', months: 12 },
  cafes: {
    names: ['Harbourside', 'Millbrook'], opened: '2027-03-01', months: 10,
    lease: { monthlyEach: 2_000, years: 5, inAdvance: true, rate: 0.072 },   // incremental borrowing rate: Coastline's 7.2% (F04)
    fitOut: { cost: 36_000, life: 5, paid: '2027-02-26' },                      // depreciated over the lease term from March
    machines: { cost: 18_000, life: 5, bought: '2027-03-01' },                  // two espresso machines and grinders, $9,000 a café
    sales: 236_000,                                                              // at the till, card and cash
    cogsShare: 0.31,                                                             // beans, milk, cups, bought-in pastries
  },
  brewer: { price: 24_000, delivered: '2027-04-01', instalment: 1_050, payments: 24, life: 5, monthsUsed: 9, paidIn2027: 8 },
  lawFirm: { start: '2027-04-01', baseFee: 40_000, expectedInflation: 0.028, months2027: 9, paidAt: '2028-03-31' },
  catering: { events: 104, average: 880, invoiced: 85_880, collected: 80_650, writtenOff: 1_150,
              depositsReceived: 2_640, depositsEarned: 1_640 },                 // deposits: January 2027's (earned) and 2028's
  training: { workshops: 24, participants: 12, price: 125, paidForJanuary: 1_500, paidFor2028: 3_000 },
  shop: { sales: 189_400, refunds: 1_900, prepaidSubscriptions: 3_420, subscriptionsShipped: 2_960, cardFees: 6_820 },
  cafeCardFees: 4_720,
  inventory: { purchases: 166_800, paid: 159_400 },
  supplies: { bought: 19_800, paid: 19_100, onHand: 960 },
  wages: { events: 41_600, cafes: 92_000, shopAndOffice: 21_400, ana: 48_000, payable: 4_300 },
  kitchenRent: 14_400,
  utilities: { expense: 11_700, unpaid: 1_180 },
  insurance: { premium: 3_600, start: '2027-03-01', monthly: 300 },              // the new policy covers the cafés
  advertising: 11_500, research: 21_000, shipping: 20_300, fuel: 2_900, misc: 1_700,
  lineOfCredit: { limit: 30_000, rate: 0.09, draws: [{ date: '2027-09-01', amount: 12_000 }, { date: '2027-11-01', amount: 12_000 }] },
  dividends: [{ date: '2027-06-30', amount: 2_000 }],
  tax: { rate: 0.25, estimatedPaid: 4_500 },
};
const F = FACTS;
const r2 = (x) => Math.round(x * 100) / 100;
const r0 = Math.round;

// ---------------------------------------------------------------- schedules
/** The café leases: 60 payments of $4,000 on the 1st of each month from 1 March 2027; liability at the present value. */
const P = F.cafes.lease.monthlyEach * 2, iL = F.cafes.lease.rate / 12, N = F.cafes.lease.years * 12;
const pvDue = (n) => (n <= 0 ? 0 : P * (1 - (1 + iL) ** -n) / iL * (1 + iL));
export const LEASE = (() => {
  const initial = r0(pvDue(N));
  let L = initial; const rows = [];
  for (let m = 0; m < N; m++) {                  // month m: pay on the 1st, accrue interest to the month end
    L = r2(L - P);
    const interest = r2(L * iL);
    L = r2(L + interest);
    rows.push({ m, interest, end: L });
  }
  const months = F.cafes.months;
  const interest2027 = r0(rows.slice(0, months).reduce((s, r) => s + r.interest, 0));
  const end2027 = initial + interest2027 - P * months;                           // = the right-of-use asset at 31 Dec 2027
  const interest2028 = r0(rows.slice(months, months + 12).reduce((s, r) => s + r.interest, 0));
  const end2028 = end2027 + interest2028 - P * 12;
  return { payment: P, rate: F.cafes.lease.rate, initial, interest2027, paid2027: P * months, cost2027: P * months, end2027,
           current2027: end2027 - end2028, noncurrent2027: end2028, rows };
})();

/** The brewer plan: recorded at the $24,000 cash price (ASC 835-30); the $1,200 difference is interest at the plan's implied rate. */
export const BREWER = (() => {
  const b = F.brewer;
  let lo = 1e-9, hi = 0.05;
  for (let k = 0; k < 200; k++) { const mid = (lo + hi) / 2; (b.instalment * (1 - (1 + mid) ** -b.payments) / mid > b.price ? (lo = mid) : (hi = mid)); }
  const rate = (lo + hi) / 2;
  let bal = b.price; const rows = [];
  for (let k = 1; k <= b.payments; k++) { const interest = r2(bal * rate); bal = r2(bal + interest - b.instalment); rows.push({ k, interest, end: bal }); }
  // 2027: interest for April–December accrues on the balance; eight payments (1 May – 1 Dec) are made.
  // December's interest is owed at the year end and paid with the 1 January 2028 payment.
  const interestAccrued2027 = r0(rows.slice(0, 9).reduce((s, r) => s + r.interest, 0));
  const interestPaid2027 = r0(rows.slice(0, b.paidIn2027).reduce((s, r) => s + r.interest, 0));
  const interestOwed2027 = interestAccrued2027 - interestPaid2027;
  const principalPaid2027 = b.instalment * b.paidIn2027 - interestPaid2027;
  const end2027 = b.price - principalPaid2027;                                    // principal owed at 31 December 2027
  const principal2028 = r0(rows[b.paidIn2027 - 1].end - rows[b.paidIn2027 + 11].end);   // payments 9–20, January–December 2028
  return { monthlyRate: rate, apr: rate * 12, interestAccrued2027, interestPaid2027, interestOwed2027, principalPaid2027, end2027,
           current2027: principal2028, noncurrent2027: end2027 - principal2028, rows };
})();

const law = F.lawFirm;
const lawFee1 = law.baseFee * (1 + law.expectedInflation);                       // 41,120: the first year's fee, estimated
const lawRevenue = r0(lawFee1 * law.months2027 / 12);                            // 30,840
const loc = F.lineOfCredit;
const locDrawn = loc.draws.reduce((s, d) => s + d.amount, 0);
const locInterest = loc.draws.reduce((s, d) => s + d.amount * loc.rate * (12 - Number(d.date.slice(5, 7)) + 1) / 12, 0);   // to 31 Dec
const locAccrued = locDrawn * loc.rate / 12;                                     // December's, paid 1 January
const cat = F.catering, tr = F.training, shop = F.shop, inv = F.inventory, sup = F.supplies, wg = F.wages;
const op = (n) => OPENING[n] || 0;
const coastInt = 10_000 * 0.06;                                                  // 600 a year
const vanInt = { paidJune: 20_000 * 0.06, accruedDec: 15_000 * 0.06 * 7 / 12 };  // 1,200 paid; 525 owed at the year end
const vanInterest2027 = 20_000 * 0.06 * 5 / 12 + vanInt.accruedDec;              // 500 + 525 = 1,025
const depr = {
  equipment: 2_400, van: 4_800,
  machines: F.cafes.machines.cost / F.cafes.machines.life / 12 * F.cafes.months,  // 3,000
  brewer: F.brewer.price / F.brewer.life / 12 * F.brewer.monthsUsed,               // 3,600
  fitOut: F.cafes.fitOut.cost / F.cafes.fitOut.life / 12 * F.cafes.months,         // 6,000
};

/** Catering receivables at 31 December 2027 by age (the law firm's contract asset is separate: it isn't billed yet). */
export const AGING = [
  { band: 'Not yet due (0–30 days)', amount: 8_400, rate: 0.02 },
  { band: '31–60 days', amount: 2_100, rate: 0.10 },
  { band: 'Over 60 days', amount: 960, rate: 0.40 },
];
const agingAllowance = AGING.reduce((s, b) => s + b.amount * b.rate, 0);
const badDebt = agingAllowance - (op('Allowance for Doubtful Accounts') - cat.writtenOff);

// ---------------------------------------------------------------- the year in summary
export const YEAR = [
  // settling the opening balances
  { id: 'z1', date: '2027-01-05', text: 'December 2026’s wages paid.', lines: [{ acct: 'Wages Payable', dr: op('Wages Payable') }, { acct: 'Cash', cr: op('Wages Payable') }], cash: 'operating', cashLabel: 'Cash paid to employees' },
  { id: 'z2', date: '2027-01-31', text: 'The amounts owed to suppliers at the start of the year are paid.', lines: [{ acct: 'Accounts Payable', dr: op('Accounts Payable') }, { acct: 'Cash', cr: op('Accounts Payable') }], cash: 'operating' },
  { id: 'z3', date: '2027-04-15', text: '2026’s remaining income tax paid.', lines: [{ acct: 'Income Taxes Payable', dr: op('Income Taxes Payable') }, { acct: 'Cash', cr: op('Income Taxes Payable') }], cash: 'operating' },
  { id: 'z4', date: '2027-02-28', text: 'The rest of the 2026 insurance policy expires (January and February).', lines: [{ acct: 'Insurance Expense', dr: op('Prepaid Insurance') }, { acct: 'Prepaid Insurance', cr: op('Prepaid Insurance') }] },
  { id: 'z5', date: '2027-01-31', text: 'January’s prepaid catering events and workshop are delivered, and the prepaid subscriptions ship.',
    lines: [{ acct: 'Unearned Revenue', dr: cat.depositsEarned + tr.paidForJanuary + shop.subscriptionsShipped },
            { acct: 'Catering Revenue', cr: cat.depositsEarned }, { acct: 'Training Revenue', cr: tr.paidForJanuary }, { acct: 'Online Sales Revenue', cr: shop.subscriptionsShipped }] },
  // the cafés
  { id: 'c1', date: '2027-02-26', text: 'Fit-out of the Harbourside and Millbrook cafés, paid on completion.', lines: [{ acct: 'Leasehold Improvements', dr: F.cafes.fitOut.cost }, { acct: 'Cash', cr: F.cafes.fitOut.cost }], cash: 'investing' },
  { id: 'c2', date: '2027-03-01', text: 'Two espresso machines and grinders for the cafés, paid in cash.', lines: [{ acct: 'Equipment', dr: F.cafes.machines.cost }, { acct: 'Cash', cr: F.cafes.machines.cost }], cash: 'investing' },
  { id: 'c3', date: '2027-03-01', text: 'The cafés’ five-year leases begin: a right-of-use asset and a lease liability at the present value of 60 payments of $4,000, at 7.2%.',
    lines: [{ acct: 'Operating Lease Right-of-Use Assets', dr: LEASE.initial }, { acct: 'Operating Lease Liabilities', cr: LEASE.initial }] },
  { id: 'c4', date: '2027-12-01', text: 'Lease payments for the cafés, $4,000 on the first of each month from March.', lines: [{ acct: 'Operating Lease Liabilities', dr: LEASE.paid2027 }, { acct: 'Cash', cr: LEASE.paid2027 }], cash: 'operating', cashLabel: 'Cash paid for the cafés’ leases' },
  { id: 'c5', date: '2027-12-31', text: 'Café sales at the tills.', lines: [{ acct: 'Cash', dr: F.cafes.sales }, { acct: 'Café Sales Revenue', cr: F.cafes.sales }], cash: 'operating' },
  { id: 'c6', date: '2027-12-31', text: 'Card fees on café sales.', lines: [{ acct: 'Card and Platform Fees Expense', dr: F.cafeCardFees }, { acct: 'Cash', cr: F.cafeCardFees }], cash: 'operating' },
  // the brewer
  { id: 'b1', date: '2027-04-01', text: 'The cold-brew brewer is delivered on the supplier’s plan: recorded at its $24,000 cash price.', lines: [{ acct: 'Equipment', dr: F.brewer.price }, { acct: 'Instalment Note Payable', cr: F.brewer.price }] },
  { id: 'b3', date: '2027-12-01', text: 'Eight payments of $1,050 (1 May – 1 December): the interest part, at the plan’s implied rate on the balance owed (April–November).', lines: [{ acct: 'Interest Expense', dr: BREWER.interestPaid2027 }, { acct: 'Cash', cr: BREWER.interestPaid2027 }], cash: 'operating' },
  { id: 'b4', date: '2027-12-01', text: 'Eight payments of $1,050 (1 May – 1 December): the principal part.', lines: [{ acct: 'Instalment Note Payable', dr: BREWER.principalPaid2027 }, { acct: 'Cash', cr: BREWER.principalPaid2027 }], cash: 'financing' },
  // catering, workshops, the shop
  { id: 'r1', date: '2027-12-31', text: 'The law firm’s events, April–December: nine months of the first year’s fee, estimated at $40,000 × 1.028, earned but not yet billable.',
    lines: [{ acct: 'Contract Asset', dr: lawRevenue }, { acct: 'Catering Revenue', cr: lawRevenue }] },
  { id: 'r2', date: '2027-12-31', text: 'The other catering events, invoiced on 30-day terms.', lines: [{ acct: 'Accounts Receivable', dr: cat.invoiced }, { acct: 'Catering Revenue', cr: cat.invoiced }] },
  { id: 'r3', date: '2027-12-31', text: 'Cash collected from catering clients.', lines: [{ acct: 'Cash', dr: cat.collected }, { acct: 'Accounts Receivable', cr: cat.collected }], cash: 'operating' },
  { id: 'r4', date: '2027-08-20', text: 'A client’s $1,150 invoice is written off.', lines: [{ acct: 'Allowance for Doubtful Accounts', dr: cat.writtenOff }, { acct: 'Accounts Receivable', cr: cat.writtenOff }] },
  { id: 'r5', date: '2027-12-31', text: 'Deposits received for two catering events in January 2028.', lines: [{ acct: 'Cash', dr: cat.depositsReceived }, { acct: 'Unearned Revenue', cr: cat.depositsReceived }], cash: 'operating' },
  { id: 'r6', date: '2027-12-31', text: 'Workshop fees: the rest of 2027’s workshops, and places paid for in 2028’s first two workshops.',
    lines: [{ acct: 'Cash', dr: (tr.workshops * tr.participants * tr.price - tr.paidForJanuary) + tr.paidFor2028 }, { acct: 'Training Revenue', cr: tr.workshops * tr.participants * tr.price - tr.paidForJanuary }, { acct: 'Unearned Revenue', cr: tr.paidFor2028 }], cash: 'operating' },
  { id: 'r7', date: '2027-12-31', text: 'Online shop: orders shipped and subscriptions paid for but not yet shipped, all by card.',
    lines: [{ acct: 'Cash', dr: shop.sales - shop.subscriptionsShipped + shop.prepaidSubscriptions }, { acct: 'Online Sales Revenue', cr: shop.sales - shop.subscriptionsShipped }, { acct: 'Unearned Revenue', cr: shop.prepaidSubscriptions }], cash: 'operating' },
  { id: 'r8', date: '2027-12-31', text: 'Refunds for damaged bags.', lines: [{ acct: 'Sales Returns and Allowances', dr: shop.refunds }, { acct: 'Cash', cr: shop.refunds }], cash: 'operating', cashLabel: 'Cash received from customers' },
  { id: 'r9', date: '2027-12-31', text: 'Card-processing and shop-platform fees.', lines: [{ acct: 'Card and Platform Fees Expense', dr: shop.cardFees }, { acct: 'Cash', cr: shop.cardFees }], cash: 'operating' },
  // costs
  { id: 'k1', date: '2027-12-31', text: 'Beans from Kilnworth Roasting and café stock (milk, cups, pastries), bought on 30-day terms.', lines: [{ acct: 'Inventory', dr: inv.purchases }, { acct: 'Accounts Payable', cr: inv.purchases }] },
  { id: 'k2', date: '2027-12-31', text: 'Payments for stock.', lines: [{ acct: 'Accounts Payable', dr: inv.paid }, { acct: 'Cash', cr: inv.paid }], cash: 'operating' },
  { id: 'k3', date: '2027-12-31', text: 'Catering supplies and workshop materials bought on account.', lines: [{ acct: 'Supplies', dr: sup.bought }, { acct: 'Accounts Payable', cr: sup.bought }] },
  { id: 'k4', date: '2027-12-31', text: 'Payments to supply vendors.', lines: [{ acct: 'Accounts Payable', dr: sup.paid }, { acct: 'Cash', cr: sup.paid }], cash: 'operating' },
  { id: 'k5', date: '2027-12-31', text: 'Wages: event baristas (a cost of services), café staff, shop and office staff, and Ana’s $48,000 salary; part of December’s is paid in January.',
    lines: [{ acct: 'Cost of Services', dr: wg.events }, { acct: 'Wages Expense', dr: wg.cafes + wg.shopAndOffice + wg.ana },
            { acct: 'Cash', cr: wg.events + wg.cafes + wg.shopAndOffice + wg.ana - wg.payable }, { acct: 'Wages Payable', cr: wg.payable }], cash: 'operating', cashLabel: 'Cash paid to employees' },
  { id: 'k6', date: '2027-12-31', text: 'Kitchen rent, $1,200 a month.', lines: [{ acct: 'Rent Expense', dr: F.kitchenRent }, { acct: 'Cash', cr: F.kitchenRent }], cash: 'operating', cashLabel: 'Cash paid to suppliers' },
  { id: 'k7', date: '2027-12-31', text: 'Utilities for the kitchen and the cafés; December’s bills are unpaid at the year end.', lines: [{ acct: 'Utilities Expense', dr: F.utilities.expense }, { acct: 'Cash', cr: F.utilities.expense - F.utilities.unpaid }, { acct: 'Accounts Payable', cr: F.utilities.unpaid }], cash: 'operating' },
  { id: 'k8', date: '2027-03-01', text: 'Insurance for 1 March 2027 – 29 February 2028, paid in advance.', lines: [{ acct: 'Prepaid Insurance', dr: F.insurance.premium }, { acct: 'Cash', cr: F.insurance.premium }], cash: 'operating', cashLabel: 'Cash paid to suppliers' },
  { id: 'k9', date: '2027-12-31', text: 'Advertising, mostly for the cafés’ opening.', lines: [{ acct: 'Advertising Expense', dr: F.advertising }, { acct: 'Cash', cr: F.advertising }], cash: 'operating', cashLabel: 'Cash paid to suppliers' },
  { id: 'k10', date: '2027-12-31', text: 'Market research: the spring surveys, focus groups and shelf audit, the office survey and interviews, and May’s needs study.', lines: [{ acct: 'Market Research Expense', dr: F.research }, { acct: 'Cash', cr: F.research }], cash: 'operating' },
  { id: 'k11', date: '2027-12-31', text: 'Couriers and postage for shop orders.', lines: [{ acct: 'Shipping Expense', dr: F.shipping }, { acct: 'Cash', cr: F.shipping }], cash: 'operating' },
  { id: 'k12', date: '2027-12-31', text: 'Fuel for the van.', lines: [{ acct: 'Fuel Expense', dr: F.fuel }, { acct: 'Cash', cr: F.fuel }], cash: 'operating' },
  { id: 'k13', date: '2027-12-31', text: 'Bank charges, licences and other small costs.', lines: [{ acct: 'Miscellaneous Expense', dr: F.misc }, { acct: 'Cash', cr: F.misc }], cash: 'operating' },
  // debt
  { id: 'd1', date: '2027-12-01', text: 'Interest on the Coastline note, paid on 1 March, 1 June, 1 September and 1 December ($50 of it was owed at the start of the year).',
    lines: [{ acct: 'Interest Payable', dr: 50 }, { acct: 'Interest Expense', dr: coastInt - 50 }, { acct: 'Cash', cr: coastInt }], cash: 'operating' },
  { id: 'd2', date: '2027-06-01', text: 'The van note’s first instalment: $1,200 of interest for June 2026 – May 2027 ($700 of it was owed at the start of the year)…',
    lines: [{ acct: 'Interest Payable', dr: 700 }, { acct: 'Interest Expense', dr: vanInt.paidJune - 700 }, { acct: 'Cash', cr: vanInt.paidJune }], cash: 'operating' },
  { id: 'd2b', date: '2027-06-01', text: '… and $5,000 of principal.',
    lines: [{ acct: 'Current Portion of Long-Term Debt', dr: 5_000 }, { acct: 'Cash', cr: 5_000 }], cash: 'financing', cashLabel: 'Repayment of notes payable' },
  ...loc.draws.map((d, i) => ({ id: `d${3 + i}`, date: d.date, text: `Lantern draws $${d.amount.toLocaleString('en-US')} on its Coastline line of credit.`,
    lines: [{ acct: 'Cash', dr: d.amount }, { acct: 'Line of Credit', cr: d.amount }], cash: 'financing' })),
  { id: 'd5', date: '2027-12-01', text: 'Interest on the line of credit at 9%, paid monthly in arrears.', lines: [{ acct: 'Interest Expense', dr: r2(locInterest - locAccrued) }, { acct: 'Cash', cr: r2(locInterest - locAccrued) }], cash: 'operating' },
  { id: 'd6', date: '2027-12-31', text: 'Estimated income tax paid during the year.', lines: [{ acct: 'Income Tax Expense', dr: F.tax.estimatedPaid }, { acct: 'Cash', cr: F.tax.estimatedPaid }], cash: 'operating' },
  ...F.dividends.map((d, i) => ({ id: `d${7 + i}`, date: d.date, text: 'Dividend declared and paid to Ana Lim.', lines: [{ acct: 'Dividends', dr: d.amount }, { acct: 'Cash', cr: d.amount }], cash: 'financing' })),
];

// ---------------------------------------------------------------- year-end adjustments
const leaseAmort = LEASE.cost2027 - LEASE.interest2027;
const pre = [
  { id: 'e1', date: '2027-12-31', adjusting: true, kind: 'lease cost', text: 'The cafés’ lease cost for March–December: interest on the liability and amortisation of the right-of-use asset, together $4,000 a month.',
    lines: [{ acct: 'Operating Lease Cost', dr: LEASE.cost2027 }, { acct: 'Operating Lease Liabilities', cr: LEASE.interest2027 }, { acct: 'Operating Lease Right-of-Use Assets', cr: leaseAmort }] },
  { id: 'e2', date: '2027-12-31', adjusting: true, kind: 'prepaid expense', text: 'Ten months of the new $3,600 policy have expired.',
    lines: [{ acct: 'Insurance Expense', dr: F.insurance.monthly * 10 }, { acct: 'Prepaid Insurance', cr: F.insurance.monthly * 10 }] },
  { id: 'e3', date: '2027-12-31', adjusting: true, kind: 'supplies used', text: 'A count finds $960 of supplies on hand.',
    lines: [{ acct: 'Cost of Services', dr: op('Supplies') + sup.bought - sup.onHand }, { acct: 'Supplies', cr: op('Supplies') + sup.bought - sup.onHand }] },
  { id: 'e4', date: '2027-12-31', adjusting: true, kind: 'depreciation', text: 'Depreciation: the kitchen’s espresso equipment $2,400, the cafés’ machines $3,000 (March–December) and the brewer $3,600 (April–December).',
    lines: [{ acct: 'Depreciation Expense', dr: depr.equipment + depr.machines + depr.brewer }, { acct: 'Accumulated Depreciation—Equipment', cr: depr.equipment + depr.machines + depr.brewer }] },
  { id: 'e5', date: '2027-12-31', adjusting: true, kind: 'depreciation', text: 'Depreciation on the van, $4,800 a year.',
    lines: [{ acct: 'Depreciation Expense', dr: depr.van }, { acct: 'Accumulated Depreciation—Van', cr: depr.van }] },
  { id: 'e6', date: '2027-12-31', adjusting: true, kind: 'depreciation', text: 'Depreciation on the cafés’ fit-out over the five-year leases, March–December.',
    lines: [{ acct: 'Depreciation Expense', dr: depr.fitOut }, { acct: 'Accumulated Depreciation—Leasehold Improvements', cr: depr.fitOut }] },
  { id: 'e7', date: '2027-12-31', adjusting: true, kind: 'accrued interest', text: `Interest owed at 31 December: $50 on the Coastline note, $525 on the van note, $${locAccrued} on the line of credit and $${BREWER.interestOwed2027} on the brewer plan.`,
    lines: [{ acct: 'Interest Expense', dr: 50 + vanInt.accruedDec + locAccrued + BREWER.interestOwed2027 }, { acct: 'Interest Payable', cr: 50 + vanInt.accruedDec + locAccrued + BREWER.interestOwed2027 }] },
  { id: 'e8', date: '2027-12-31', adjusting: true, kind: 'bad debts', text: 'The aging of receivables sets the allowance.',
    lines: [{ acct: 'Bad Debt Expense', dr: badDebt }, { acct: 'Allowance for Doubtful Accounts', cr: badDebt }] },
  { id: 'e9', date: '2027-12-31', adjusting: true, kind: 'cost of goods sold', text: 'Cost of the bags shipped and the café stock used, from the perpetual records.',
    lines: [{ acct: 'Cost of Goods Sold', dr: 0 }, { acct: 'Inventory', cr: 0 }] },
  { id: 'e10', date: '2027-12-31', adjusting: true, kind: 'reclassification', text: 'Debt due within a year is shown as current: the Coastline note ($10,000, 1 March 2028), the van note’s 2028 instalment ($5,000) and the brewer plan’s 2028 principal.',
    lines: [{ acct: 'Notes Payable', dr: 15_000 }, { acct: 'Instalment Note Payable', dr: BREWER.current2027 }, { acct: 'Current Portion of Long-Term Debt', cr: 15_000 + BREWER.current2027 }] },
  { id: 'e11', date: '2027-12-31', adjusting: true, kind: 'reclassification', text: 'The lease liability falling due in 2028 is shown as current.',
    lines: [{ acct: 'Operating Lease Liabilities', dr: LEASE.current2027 }, { acct: 'Current Portion of Operating Lease Liabilities', cr: LEASE.current2027 }] },
];
// cost of goods sold: the shop's at 47.5% of its gross sales, the cafés' at 31% of theirs
const cogs = r0(shop.sales * 0.475 + F.cafes.sales * F.cafes.cogsShare);
pre.find((e) => e.id === 'e9').lines = [{ acct: 'Cost of Goods Sold', dr: cogs }, { acct: 'Inventory', cr: cogs }];
const before = A.post([...YEAR, ...pre], CHART, OPENING);
const pretax = A.multiStepIncome(before, CHART).incomeBeforeTax;
const taxTotal = r0(pretax * F.tax.rate);
export const ADJUSTMENTS = [
  ...pre,
  { id: 'e12', date: '2027-12-31', adjusting: true, kind: 'income tax', text: 'Income tax for the year at 25% of income before tax, less the amount already paid.',
    lines: [{ acct: 'Income Tax Expense', dr: taxTotal - F.tax.estimatedPaid }, { acct: 'Income Taxes Payable', cr: taxTotal - F.tax.estimatedPaid }] },
];

// ---------------------------------------------------------------- the statements
const ALL = [...YEAR, ...ADJUSTMENTS];
export const LEDGER = A.post(ALL, CHART, OPENING);
const IS = A.multiStepIncome(LEDGER, CHART);
const SCE = A.equityStatement(LEDGER, CHART, OPENING);
const BS = A.balanceSheet(LEDGER, CHART);
const CF = A.cashFlows(ALL, CHART);
const IND = A.indirectOperating(LEDGER, CHART, OPENING);
const bal = (n) => LEDGER[n]?.balance || 0;
export const RESULTS = { incomeStatement: IS, equityStatement: SCE, balanceSheet: BS, cashFlows: CF, indirect: IND, trialBalance: A.trialBalance(LEDGER, CHART) };
export const PRIOR = { incomeStatement: IS26, balanceSheet: BS26, cashFlows: F02.RESULTS.cashFlows, equityStatement: F02.RESULTS.equityStatement };

export const IDENTITIES = [
  ['balance sheet balances', BS.balanced],
  ['trial balance balances', RESULTS.trialBalance.balanced],
  ['opening cash = F02 closing cash', OPENING.Cash === F02.RESULTS.cashFlows.net],
  ['cash from the ledger = opening + net cash flow', r2(bal('Cash')) === r2(OPENING.Cash + CF.net)],
  ['direct operating = indirect operating', r2(CF.operating) === r2(IND.operating)],
  ['right-of-use asset = lease liabilities at the year end', r2(bal('Operating Lease Right-of-Use Assets')) === r2(bal('Operating Lease Liabilities') + bal('Current Portion of Operating Lease Liabilities'))],
  ['allowance = aging estimate', r2(bal('Allowance for Doubtful Accounts')) === r2(agingAllowance)],
  ['receivables = the aging total', bal('Accounts Receivable') === AGING.reduce((s, b) => s + b.amount, 0)],
  ['unearned revenue = January 2028 deposits + 2028 workshops + subscriptions', bal('Unearned Revenue') === cat.depositsReceived + tr.paidFor2028 + shop.prepaidSubscriptions],
  ['Notes Payable = the van note’s last two instalments', bal('Notes Payable') === 10_000],
  ['brewer plan principal = its schedule', bal('Instalment Note Payable') + BREWER.current2027 === BREWER.end2027],
  ['interest expense = Coastline + van + brewer + line', r2(IS.interestExpense) === r2(coastInt + vanInterest2027 + BREWER.interestAccrued2027 + locInterest)],
  ['the line of credit is within its limit', locDrawn <= loc.limit],
  ['the law firm’s contract asset = 9/12 of $41,120', bal('Contract Asset') === 30_840],
  ['training revenue = workshops × places × price', bal('Training Revenue') === tr.workshops * tr.participants * tr.price],
];

// ---------------------------------------------------------------- the two years as inputs to core/ratios.js
const periodOf = (L, IS_, BS_, CF_, months, extra = {}) => {
  const b = (n) => L[n]?.balance || 0;
  const ppeNet = ['Equipment', 'Van', 'Leasehold Improvements'].reduce((s, n) => s + b(n), 0)
    - ['Accumulated Depreciation—Equipment', 'Accumulated Depreciation—Van', 'Accumulated Depreciation—Leasehold Improvements'].reduce((s, n) => s + b(n), 0);
  return {
    months,
    revenue: IS_.revenue, cogs: IS_.costOfSales, grossProfit: IS_.grossProfit, operatingIncome: IS_.operatingIncome, ebit: IS_.ebit,
    interestExpense: IS_.interestExpense, pretax: IS_.incomeBeforeTax, tax: IS_.incomeTax, netIncome: IS_.netIncome, da: IS_.depreciationAmortisation,
    cash: b('Cash'), receivables: b('Accounts Receivable') - b('Allowance for Doubtful Accounts'), contractAsset: b('Contract Asset'),
    inventory: b('Inventory'), currentAssets: BS_.assets.currentTotal, ppeNet, rightOfUse: b('Operating Lease Right-of-Use Assets'),
    totalAssets: BS_.assets.total, payables: b('Accounts Payable'), currentLiabilities: BS_.liabilities.currentTotal,
    totalLiabilities: BS_.liabilities.total,
    debt: b('Notes Payable') + b('Current Portion of Long-Term Debt') + b('Instalment Note Payable') + b('Line of Credit'),
    leaseLiabilities: b('Operating Lease Liabilities') + b('Current Portion of Operating Lease Liabilities'),
    equity: BS_.equityTotal, retainedEarnings: b('Retained Earnings') + (IS_.netIncome) - b('Dividends'),
    cfo: CF_.operating, capex: -CF_.investing, dividends: b('Dividends'),
    creditSales: b('Catering Revenue'),          // only catering is sold on credit; café, shop and workshop sales are paid for at once
    ...extra,
  };
};
/** 2026 (ten months, F02) and 2027 (twelve months). */
export const PERIODS = {
  2026: periodOf(L26, IS26, BS26, F02.RESULTS.cashFlows, 10),
  2027: periodOf(LEDGER, IS, BS, CF, 12),
};

// ---------------------------------------------------------------- comparative statements (rows: [label, 2026, 2027])
const merge = (a, b) => { const names = [...new Set([...a.map((r) => r[0]), ...b.map((r) => r[0])])]; const get = (list, n) => list.find((r) => r[0] === n)?.[1] ?? 0; return names.map((n) => [n, get(a, n), get(b, n)]); };
const I26 = IS26, I27 = IS;
const B26 = BS26, B27 = BS;
const C26 = F02.RESULTS.cashFlows, C27 = CF;
/** Comparative statements for the lessons' tables. Contra items are negative; 2026 is the ten months from 1 March. */
export const COMPARATIVE = {
  income: [
    ...merge(I26.lists.revenue, I27.lists.revenue),
    ...merge(I26.lists.contra, I27.lists.contra).map(([n, a, b]) => [n, -a, -b]),
    ['Net revenue', I26.revenue, I27.revenue],
    ...merge(I26.lists.cost, I27.lists.cost),
    ['Gross profit', I26.grossProfit, I27.grossProfit],
    ...merge(I26.lists.operating, I27.lists.operating),
    ['Operating income', I26.operatingIncome, I27.operatingIncome],
    ...merge(I26.lists.otherExpense, I27.lists.otherExpense),
    ['Income before income tax', I26.incomeBeforeTax, I27.incomeBeforeTax],
    ...merge(I26.lists.tax, I27.lists.tax),
    ['Net income', I26.netIncome, I27.netIncome],
  ],
  balance: [
    ...merge(B26.assets.current, B27.assets.current), ['Total current assets', B26.assets.currentTotal, B27.assets.currentTotal],
    ...merge(B26.assets.noncurrent, B27.assets.noncurrent), ['Total noncurrent assets', B26.assets.noncurrentTotal, B27.assets.noncurrentTotal],
    ['Total assets', B26.assets.total, B27.assets.total],
    ...merge(B26.liabilities.current, B27.liabilities.current), ['Total current liabilities', B26.liabilities.currentTotal, B27.liabilities.currentTotal],
    ...merge(B26.liabilities.noncurrent, B27.liabilities.noncurrent), ['Total noncurrent liabilities', B26.liabilities.noncurrentTotal, B27.liabilities.noncurrentTotal],
    ['Total liabilities', B26.liabilities.total, B27.liabilities.total],
    ['Common Stock', 20_000, 20_000], ['Retained Earnings', PERIODS[2026].retainedEarnings, PERIODS[2027].retainedEarnings],
    ['Total equity', B26.equityTotal, B27.equityTotal],
    ['Total liabilities and equity', B26.liabilities.total + B26.equityTotal, B27.liabilities.total + B27.equityTotal],
  ],
  cash: [
    ...merge(C26.lines.filter((l) => l[2] === 'operating'), C27.lines.filter((l) => l[2] === 'operating')), ['Net cash from operating activities', C26.operating, C27.operating],
    ...merge(C26.lines.filter((l) => l[2] === 'investing'), C27.lines.filter((l) => l[2] === 'investing')), ['Net cash used in investing activities', C26.investing, C27.investing],
    ...merge(C26.lines.filter((l) => l[2] === 'financing'), C27.lines.filter((l) => l[2] === 'financing')), ['Net cash from financing activities', C26.financing, C27.financing],
    ['Net change in cash', C26.net, C27.net], ['Cash at the start', 0, OPENING.Cash], ['Cash at the end', C26.net, OPENING.Cash + C27.net],
  ],
  indirect2027: [['Net income', IND.netIncome], ...IND.adjustments, ...IND.workingCapital, ['Net cash from operating activities', IND.operating]],
  noncash2027: CF.noncash,
};
