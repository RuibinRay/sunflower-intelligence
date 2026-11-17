// case.js — the F07 Financial Modelling story: in February 2028 Coastline Bank asks Lantern Coffee Co. for a five-year
// forecast (2028–2032) before it lends the $60,000 term loan F05 arranges, and Ana builds the model this course teaches.
// One source of truth for every figure F07's lessons, exercises, assessments and project use. Every name, figure and
// forecast is invented for teaching; the assumptions are Ana's working estimates, not facts about any market.
//
// Agrees with earlier courses (checked in IDENTITIES):
// - f02 and f03: the 2026 and 2027 statements are condensed here line for line (revenue $193,320 and $577,860; net
//   income $27,387 and $22,431), so the model's history columns are the audited-style accounts students prepared.
// - f03: the two cafés opened on 1 March 2027 and traded ten months; café cost of goods is 31% of café sales; café wages
//   were $92,000 for the ten months; the market research ($21,000, including F05's May 2027 needs study) is treated by Ana as
//   a one-off; café leases are $2,000 a
//   month each; the existing kitchen's rent is $14,400 a year.
// - f05: the second kitchen opens on 1 April 2028 with KITCHEN's revenue, variable share, fixed costs and rent by
//   project year (April to March); Cold Brew's cans, net price, cost per can, promotion, listing and brand manager by
//   year, launched in 2028; the 25% tax rate.
// The model is annual, calendar years; project years are spread over calendar years by months (calendarised).
import { RESULTS as F03R, PRIOR as F03P, FACTS as F03F } from '../f03/case.js?v=37';
import { KITCHEN, COLD_BREW, TAX as F05_TAX } from '../f05/case.js?v=37';

export const TODAY = 'February 2028';
export const TAX = F05_TAX;
export const HIST = [2026, 2027];
export const YEARS = [2028, 2029, 2030, 2031, 2032];

// ================================================================ the history: F02/F03's statements, condensed
const val = (list, name) => (list || []).find((x) => x[0] === name)?.[1] ?? 0;
function condense(IS) {
  const L = IS.lists;
  const online = val(L.revenue, 'Online Sales Revenue') - val(L.contra, 'Sales Returns and Allowances');
  const op = (n) => val(L.operating, n);
  const other = ['Utilities Expense', 'Insurance Expense', 'Fuel Expense', 'Shipping Expense', 'Card and Platform Fees Expense', 'Bad Debt Expense', 'Miscellaneous Expense'].reduce((s, n) => s + op(n), 0);
  const h = {
    catering: val(L.revenue, 'Catering Revenue'), training: val(L.revenue, 'Training Revenue'), online, cafes: val(L.revenue, 'Café Sales Revenue'),
    costOfGoods: val(L.cost, 'Cost of Goods Sold'), costOfServices: val(L.cost, 'Cost of Services'),
    wages: op('Wages Expense'), occupancy: op('Rent Expense') + op('Operating Lease Cost'), advertising: op('Advertising Expense'), research: op('Market Research Expense'),
    other, depreciation: op('Depreciation Expense'), interest: val(L.otherExpense, 'Interest Expense'), tax: val(L.tax, 'Income Tax Expense'),
  };
  h.revenue = h.catering + h.training + h.online + h.cafes;
  h.grossProfit = h.revenue - h.costOfGoods - h.costOfServices;
  h.opex = h.wages + h.occupancy + h.advertising + h.research + h.other;
  h.ebitda = h.grossProfit - h.opex;
  h.ebit = h.ebitda - h.depreciation;
  h.ebt = h.ebit - h.interest;
  h.netIncome = h.ebt - h.tax;
  return h;
}
export const HISTORY = { 2026: condense(F03P.incomeStatement), 2027: condense(F03R.incomeStatement) };

// ================================================================ Ana's forecast assumptions (the model's inputs)
const cafeMonths = F03F.cafes.months;                                  // 10: the cafés opened on 1 March 2027
const cafeCogs2027 = F03F.cafes.sales * F03F.cafes.cogsShare;          // café cost of goods in 2027
const r3 = (x) => Math.round(x * 1000) / 1000;
export const ASSUME = {
  cafes: { annualised2027: F03F.cafes.sales / cafeMonths * 12, growth: [0.04, 0.04, 0.035, 0.03, 0.03], cogsShare: F03F.cafes.cogsShare },
  online: { growth: [0.12, 0.10, 0.08, 0.06, 0.05], cogsShare: r3((HISTORY[2027].costOfGoods - cafeCogs2027) / HISTORY[2027].online) },
  catering: { growth: [0.05, 0.05, 0.05, 0.05, 0.05], eventWagesShare: r3(F03F.wages.events / HISTORY[2027].catering) },
  training: { workshops: [30, 32, 34, 36, 36], participants: 12, price: [130, 135, 140, 145, 150] },
  servicesCostShare: r3(HISTORY[2027].costOfServices / (HISTORY[2027].catering + HISTORY[2027].training)),   // catering and training
  kitchen: { opensMonth: 4, revenue: KITCHEN.revenue, variableShare: KITCHEN.variableShare, fixed: KITCHEN.fixed, rent: KITCHEN.rent },
  coldBrew: { cans: COLD_BREW.cans, netPrice: COLD_BREW.netPrice, costPerCan: COLD_BREW.cogs, promotion: COLD_BREW.promotion, listing: COLD_BREW.listing, brandManager: COLD_BREW.brandManager, launch: COLD_BREW.launch },
  // fixed wages: the cafés' ten months annualised, the shop and office, and Ana's salary, growing with pay inflation
  fixedWages2027: F03F.wages.cafes / cafeMonths * 12 + F03F.wages.shopAndOffice + F03F.wages.ana,
  wageInflation: 0.03,
  occupancy: { kitchenRent: F03F.kitchenRent, cafeLeases: 2 * F03F.cafes.lease.monthlyEach * 12 },
  advertisingShare: 0.02,
  researchNormal: 0,                                                     // the 2027 market research was a one-off
  otherShare: r3(HISTORY[2027].other / HISTORY[2027].revenue),
};

// ================================================================ calendarising a project that runs April to March
/** Spread project-year amounts (year 1 = the 12 months from `opensMonth`) over calendar years: [2028, …]. */
export function calendarise(byProjectYear, opensMonth, nCal = YEARS.length) {
  const first = (13 - opensMonth) / 12;                                 // the share of project year 1 in the opening calendar year (9/12)
  return Array.from({ length: nCal }, (_, t) => (byProjectYear[t] ?? 0) * first + (t > 0 ? (byProjectYear[t - 1] ?? 0) * (1 - first) : 0));
}

// ================================================================ the forecast to EBITDA (module 1)
const grow = (base, rates) => rates.reduce((a, g) => [...a, a[a.length - 1] * (1 + g)], [base]).slice(1);
export function forecast(A = ASSUME) {
  const H = HISTORY[2027], n = YEARS.length;
  const cafes = grow(A.cafes.annualised2027, A.cafes.growth);
  const online = grow(H.online, A.online.growth);
  const catering = grow(H.catering, A.catering.growth);
  const training = A.training.workshops.map((w, t) => w * A.training.participants * A.training.price[t]);
  const kitchen = calendarise(A.kitchen.revenue, A.kitchen.opensMonth);
  const coldBrew = A.coldBrew.cans.map((c) => c * A.coldBrew.netPrice);
  const revenue = cafes.map((_, t) => cafes[t] + online[t] + catering[t] + training[t] + kitchen[t] + coldBrew[t]);
  const costOfGoods = cafes.map((_, t) => cafes[t] * A.cafes.cogsShare + online[t] * A.online.cogsShare + A.coldBrew.cans[t] * A.coldBrew.costPerCan);
  const costOfServices = cafes.map((_, t) => (catering[t] + training[t]) * A.servicesCostShare + kitchen[t] * A.kitchen.variableShare);
  const grossProfit = revenue.map((r, t) => r - costOfGoods[t] - costOfServices[t]);
  const wages = cafes.map((_, t) => A.fixedWages2027 * (1 + A.wageInflation) ** (t + 1) + catering[t] * A.catering.eventWagesShare);
  const kitchenFixed = calendarise(Array(KITCHEN.years).fill(A.kitchen.fixed), A.kitchen.opensMonth);
  const kitchenRent = calendarise(Array(KITCHEN.years).fill(A.kitchen.rent), A.kitchen.opensMonth);
  const occupancy = cafes.map((_, t) => A.occupancy.kitchenRent + A.occupancy.cafeLeases + kitchenRent[t]);
  const coldBrewFixed = cafes.map((_, t) => A.coldBrew.promotion[t] + A.coldBrew.listing + A.coldBrew.brandManager + (t === 0 ? A.coldBrew.launch : 0));
  const advertising = revenue.map((r) => r * A.advertisingShare);
  const research = Array(n).fill(A.researchNormal);
  const other = revenue.map((r) => r * A.otherShare);
  const opex = cafes.map((_, t) => wages[t] + occupancy[t] + kitchenFixed[t] + coldBrewFixed[t] + advertising[t] + research[t] + other[t]);
  const ebitda = grossProfit.map((g, t) => g - opex[t]);
  return { years: YEARS, cafes, online, catering, training, kitchen, coldBrew, revenue, costOfGoods, costOfServices, grossProfit, wages, kitchenFixed, kitchenRent, occupancy, coldBrewFixed, advertising, research, other, opex, ebitda, ebitdaMargin: ebitda.map((e, t) => e / revenue[t]) };
}
export const FORECAST = forecast();

// ================================================================ derived figures the lessons quote
const H26 = HISTORY[2026], H27 = HISTORY[2027];
export const DERIVED = {
  growth2027: H27.revenue / H26.revenue - 1,
  ebitdaMargin: { 2026: H26.ebitda / H26.revenue, 2027: H27.ebitda / H27.revenue },
  normalisedEbitda2027: H27.ebitda + H27.research,                                  // the one-off research added back
  cafeCogs2027,
  annualisedCafes: ASSUME.cafes.annualised2027,
};

// ================================================================ identities with earlier courses
export const IDENTITIES = [
  ['F02/F03 revenue: $193,320 in 2026 and $577,860 in 2027', H26.revenue === 193_320 && H27.revenue === 577_860],
  ['condensed lines rebuild F03’s 2027 EBITDA ($52,587) and EBIT ($32,787)', Math.abs(H27.ebitda - F03R.incomeStatement.ebitda) < 1e-9 && Math.abs(H27.ebit - F03R.incomeStatement.ebit) < 1e-9],
  ['condensed lines rebuild net income: $27,387 in 2026 and $22,431 in 2027', Math.abs(H26.netIncome - 27_387) < 1e-9 && Math.abs(H27.netIncome - 22_431) < 1e-9],
  ['the cafés traded ten months of 2027', F03F.cafes.months === 10 && F03F.cafes.opened === '2027-03-01'],
  ['café leases: two at $2,000 a month', F03F.cafes.lease.monthlyEach === 2_000],
  ['F03 2027 occupancy = kitchen rent $14,400 + ten months of café lease cost $40,000', H27.occupancy === 14_400 + 40_000],
  ['the second kitchen opens on 1 April 2028 (F05)', KITCHEN.opens === '1 April 2028'],
  ['the tax rate is F03’s and F05’s 25%', F03F.tax.rate === TAX],
];

// ================================================================ module 2: the full three-statement model
// Everything below builds on FORECAST (to EBITDA). Conventions, each stated in the lessons:
// - depreciation is straight line by month from the month an asset comes into use (F02/F03's convention);
// - interest is charged loan by loan for the months each balance is outstanding; the line of credit is charged on its
//   opening balance for the year, which keeps the model free of circular references;
// - the line of credit is the model's balancing item: it is drawn to keep cash at a minimum and repaid when cash allows;
// - the cafés' operating leases keep a right-of-use asset equal to the lease liability (level payments, no incentives),
//   and are renewed on the same terms when they end in February 2032; the second kitchen's rent is expensed as paid
//   (a simplification: a lease of over a year would normally be on the balance sheet);
// - tax is 25% of pre-tax profit; a loss is carried forward against later profits (no other book–tax differences).
import { BREWER as F03_BREWER, LEASE as F03_LEASE } from '../f03/case.js?v=37';
import { DEBT as F05_DEBT, HOLLIS as F05_HOLLIS } from '../f05/case.js?v=37';

const BS27 = F03R.balanceSheet;
const line = (side, list, name) => (list ? BS27[side][list] : BS27[side]).find((x) => x[0] === name)?.[1] ?? 0;
/** The balance sheet at 31 December 2027, condensed into the model's lines (F03). */
export const OPENING = {
  cash: line('assets', 'current', 'Cash'),
  receivables: line('assets', 'current', 'Accounts Receivable') + line('assets', 'current', 'Allowance for Doubtful Accounts'),
  contractAsset: line('assets', 'current', 'Contract Asset'),
  inventory: line('assets', 'current', 'Inventory'),
  prepaid: line('assets', 'current', 'Supplies') + line('assets', 'current', 'Prepaid Insurance'),
  ppeCost: line('assets', 'noncurrent', 'Equipment') + line('assets', 'noncurrent', 'Leasehold Improvements') + line('assets', 'noncurrent', 'Van'),
  accDep: -(line('assets', 'noncurrent', 'Accumulated Depreciation—Equipment') + line('assets', 'noncurrent', 'Accumulated Depreciation—Leasehold Improvements') + line('assets', 'noncurrent', 'Accumulated Depreciation—Van')),
  rou: line('assets', 'noncurrent', 'Operating Lease Right-of-Use Assets'),
  payables: line('liabilities', 'current', 'Accounts Payable'),
  loc: line('liabilities', 'current', 'Line of Credit'),
  wagesPayable: line('liabilities', 'current', 'Wages Payable'),
  interestPayable: line('liabilities', 'current', 'Interest Payable'),
  unearned: line('liabilities', 'current', 'Unearned Revenue'),
  taxPayable: line('liabilities', 'current', 'Income Taxes Payable'),
  currentDebt: line('liabilities', 'current', 'Current Portion of Long-Term Debt'),
  leaseLiability: line('liabilities', 'current', 'Current Portion of Operating Lease Liabilities') + line('liabilities', 'noncurrent', 'Operating Lease Liabilities'),
  longDebt: line('liabilities', 'noncurrent', 'Notes Payable') + line('liabilities', 'noncurrent', 'Instalment Note Payable'),
  commonStock: line('equity', null, 'Common Stock'),
  retained: line('equity', null, 'Retained Earnings'),
};

/** Assets: cost, first month in use (year, month 1–12), monthly depreciation and life in months. */
const mo = (y, m) => y * 12 + (m - 1);
export const ASSETS = [
  { name: 'Espresso equipment (F02)', cost: 12_000, from: mo(2026, 3), monthly: 200, months: 60 },
  { name: 'Van (F02; $6,000 residual)', cost: 30_000, from: mo(2026, 6), monthly: 400, months: 60 },
  { name: 'Café espresso machines (F03)', cost: 18_000, from: mo(2027, 3), monthly: 300, months: 60 },
  { name: 'Cold-brew brewer (F03)', cost: 24_000, from: mo(2027, 4), monthly: 400, months: 60 },
  { name: 'Café fit-out (F03)', cost: 36_000, from: mo(2027, 3), monthly: 600, months: 60 },
  { name: 'Second kitchen equipment (F05)', cost: KITCHEN.equipment, from: mo(2028, 4), monthly: KITCHEN.equipment / 84, months: 84, capex: 2028 },
  { name: 'Second kitchen fit-out (F05)', cost: KITCHEN.fitOut, from: mo(2028, 4), monthly: KITCHEN.fitOut / 60, months: 60, capex: 2028 },
  { name: 'Cold Brew display fridges (F05)', cost: COLD_BREW.equipment, from: mo(2028, 4), monthly: COLD_BREW.equipment / 60, months: 60, capex: 2028 },
  ...[2029, 2030, 2031, 2032].map((y) => ({ name: `Replacements and upkeep ${y}`, cost: 25_000, from: mo(y, 7), monthly: 25_000 / 60, months: 60, capex: y })),
  { name: 'Café refit at lease renewal (fit-out)', cost: 36_000, from: mo(2032, 3), monthly: 600, months: 60, capex: 2032 },
  { name: 'Café refit at lease renewal (espresso machines)', cost: 18_000, from: mo(2032, 3), monthly: 300, months: 60, capex: 2032 },
];
/** Depreciation of one asset in calendar year y. */
export const depIn = (a, y) => { let d = 0; for (let m = mo(y, 1); m <= mo(y, 12); m++) if (m >= a.from && m < a.from + a.months) d += a.monthly; return d; };

/** Working capital assumptions (Ana's, from the 2027 accounts). */
export const WC = { dso: 25, coldBrewDays: 60, dio: 21, dpo: 21, wageDays: 10, unearnedShare: 0.016, taxPayableShare: 0.40, prepaid: OPENING.prepaid };
export const FINANCE = { minCash: 15_000, locLimit: F05_DEBT.lineOfCredit.limit, locRate: F05_DEBT.lineOfCredit.rate, hollis: F05_HOLLIS.cash, payout: 0.30 };   // dividends: 30% of the previous year's profit, none after a loss

// ---------------------------------------------------------------- loan schedules (calendar-year interest, principal, closing balance, interest owed)
function amortise(P, rMonth, n) { const pay = P * rMonth / (1 - (1 + rMonth) ** -n); const rows = []; let b = P; for (let k = 1; k <= n; k++) { const i = b * rMonth; b = b + i - pay; rows.push({ k, interest: i, principal: pay - i, end: Math.max(0, b) }); } return { pay, rows }; }
/** Coastline's term loan for a given amount (F05's terms: 7.5%, 60 monthly payments from 30 April 2028). */
export function termLoan(amount = F05_DEBT.termLoan.amount) { const t = F05_DEBT.termLoan; const a = amortise(amount, t.rate / 12, t.years * 12); return { ...a, amount, rate: t.rate, firstPayment: mo(2028, 4) }; }
export const TERM_LOAN = termLoan();
export function loanYears(TL = TERM_LOAN) {
  const ys = YEARS, out = {};
  // the first Coastline note: $10,000 at 6%, interest quarterly, repaid 1 March 2028
  out.note = ys.map((y) => (y === 2028 ? { interest: 10_000 * 0.06 * 2 / 12, principal: 10_000, end: 0, owed: 0 } : { interest: 0, principal: 0, end: 0, owed: 0 }));
  // the van note: $5,000 each 1 June with the year's interest at 6%
  const vanBal = { 2027: 15_000, 2028: 10_000, 2029: 5_000, 2030: 0 };
  out.van = ys.map((y) => { const open = vanBal[y - 1] ?? 0, close = vanBal[y] ?? 0; return { interest: open * 0.06 * 5 / 12 + close * 0.06 * 7 / 12, principal: open - close, end: close, owed: close * 0.06 * 7 / 12 }; });
  // the brewer plan: payment k on the 1st of month (April 2027 + k) covers the interest of month (April 2027 + k − 1)
  const R = F03_BREWER.rows, monthOf = (k) => mo(2027, 4) + (k - 1);          // the month whose interest payment k carries
  const payMonth = (k) => mo(2027, 5) + (k - 1);
  out.brewer = ys.map((y) => {
    const interest = R.filter((r) => monthOf(r.k) >= mo(y, 1) && monthOf(r.k) <= mo(y, 12)).reduce((s, r) => s + r.interest, 0);
    const paid = R.filter((r) => payMonth(r.k) >= mo(y, 1) && payMonth(r.k) <= mo(y, 12));
    const endRow = R.filter((r) => payMonth(r.k) <= mo(y, 12)).pop();
    const startRow = R.filter((r) => payMonth(r.k) <= mo(y - 1, 12)).pop();
    const end = endRow.k === R.length ? 0 : endRow.end;
    const owedRow = R.find((r) => monthOf(r.k) === mo(y, 12));
    // the plan's last row leaves a cent of rounding (treated as repaid); its 2027 year-end balance is taken as F03's balance
    // sheet shows it, to the dollar, so the model starts from the accounts
    const start = !startRow || startRow.k === R.length ? 0 : y === 2028 ? Math.round(startRow.end) : startRow.end;
    return { interest, principal: start - end, end, owed: owedRow ? owedRow.interest : 0, payments: paid.length * F03F.brewer.instalment };
  });
  // the term loan: drawn 31 March 2028, payments at each month end from 30 April 2028 (interest included: nothing owed)
  out.term = ys.map((y) => { const rows = TL.rows.filter((r, i) => TL.firstPayment + i >= mo(y, 1) && TL.firstPayment + i <= mo(y, 12)); const last = TL.rows.filter((r, i) => TL.firstPayment + i <= mo(y, 12)).pop(); return { interest: rows.reduce((q, r) => q + r.interest, 0), principal: rows.reduce((q, r) => q + r.principal, 0), end: last ? last.end : 0, owed: 0, drawn: y === 2028 ? TL.amount : 0 }; });
  return out;
}
/** The cafés' lease liability (= right-of-use asset) at each year end, with renewal on the same terms in March 2032. */
export function leaseYears() {
  const R = F03_LEASE.rows;                                                 // month m = 0 is March 2027; row m's end is after that month
  const at = (y) => { const m = mo(y, 12) - mo(2027, 3); return m < R.length ? R[m].end : null; };
  return YEARS.map((y) => { const v = at(y); return v ?? R[mo(y, 12) - mo(2032, 3)].end; });   // renewed: the same schedule restarts in March 2032
}

export function model(A = ASSUME, W = WC, Fin = FINANCE) {
  const TL = termLoan(Fin.termAmount ?? F05_DEBT.termLoan.amount);
  const F = forecast(A), n = YEARS.length, L = loanYears(TL), lease = leaseYears();
  const dep = YEARS.map((y) => ASSETS.reduce((s, a) => s + depIn(a, y), 0));
  const capex = YEARS.map((y) => ASSETS.filter((a) => a.capex === y).reduce((s, a) => s + a.cost, 0));
  const out = { years: YEARS, F, dep, capex, lease, loans: L, termLoan: TL, rows: [] };
  let prev = { ...OPENING, nol: 0, netIncome: 0 };
  for (let t = 0; t < n; t++) {
    const y = YEARS[t];
    const dividends = t === 0 ? 0 : Fin.payout * Math.max(0, prev.netIncome);
    const ebit = F.ebitda[t] - dep[t];
    const locInterest = prev.loc * Fin.locRate;
    const interest = L.note[t].interest + L.van[t].interest + L.brewer[t].interest + L.term[t].interest + locInterest;
    const ebt = ebit - interest;
    const taxable = Math.max(0, ebt - prev.nol);
    const nol = Math.max(0, prev.nol - Math.max(0, ebt)) + Math.max(0, -ebt);
    const tax = taxable * TAX;
    const netIncome = ebt - tax;
    // working capital at the year end
    const invoiced = F.catering[t] + F.training[t] + F.kitchen[t];
    const wc = {
      receivables: invoiced * W.dso / 365 + F.coldBrew[t] * W.coldBrewDays / 365, contractAsset: 0,
      inventory: F.costOfGoods[t] * W.dio / 365, prepaid: W.prepaid,
      payables: F.costOfGoods[t] * W.dpo / 365, wagesPayable: F.wages[t] * W.wageDays / 365,
      unearned: F.revenue[t] * W.unearnedShare, taxPayable: tax * W.taxPayableShare,
    };
    const debtPrincipal = L.note[t].principal + L.van[t].principal + L.brewer[t].principal + L.term[t].principal;
    const ppeCost = prev.ppeCost + capex[t], accDep = prev.accDep + dep[t];
    // cash before the line of credit moves
    const dNwcAssets = (wc.receivables - prev.receivables) + (wc.contractAsset - prev.contractAsset) + (wc.inventory - prev.inventory) + (wc.prepaid - prev.prepaid);
    const dNwcLiabs = (wc.payables - prev.payables) + (wc.wagesPayable - prev.wagesPayable) + (wc.unearned - prev.unearned) + (wc.taxPayable - prev.taxPayable);
    const fixedOwed = L.note[t].owed + L.van[t].owed + L.brewer[t].owed + L.term[t].owed;
    const cfoBeforeLocOwed = netIncome + dep[t] - dNwcAssets + dNwcLiabs + (fixedOwed - prev.interestPayable);
    const cfi = -capex[t];
    const cffBeforeLoc = L.term[t].drawn + (t === 0 ? Fin.hollis : 0) - debtPrincipal - dividends;
    const cashBefore = prev.cash + cfoBeforeLocOwed + cfi + cffBeforeLoc;
    // the line of credit: draw or repay so that cash ends at the minimum, within the limit; its interest is paid in the year
    const loc = Math.min(Fin.locLimit, Math.max(0, prev.loc + Fin.minCash - cashBefore));
    const locOwedEnd = 0;
    const cash = cashBefore + (loc - prev.loc);
    const interestPayable = fixedOwed;
    out.locNeed = out.locNeed || []; out.locNeed[t] = prev.loc + Fin.minCash - cashBefore;   // > limit means a funding gap
    out.cashBefore = out.cashBefore || []; out.cashBefore[t] = cashBefore;
    const cfo = cfoBeforeLocOwed + locOwedEnd;
    const cff = cffBeforeLoc + (loc - prev.loc);
    const debtEnd = L.van[t].end + L.brewer[t].end + L.term[t].end;
    const nextPrincipal = t + 1 < n ? L.van[t + 1].principal + L.brewer[t + 1].principal + L.term[t + 1].principal : TL.rows.filter((r, i) => TL.firstPayment + i >= mo(y + 1, 1) && TL.firstPayment + i <= mo(y + 1, 12)).reduce((q, r) => q + r.principal, 0);
    const commonStock = prev.commonStock + (t === 0 ? Fin.hollis : 0);
    const retained = prev.retained + netIncome - dividends;
    const row = {
      year: y, ebitda: F.ebitda[t], dep: dep[t], ebit, interest, locInterest, ebt, tax, netIncome, nol,
      cash, ...wc, ppeCost, accDep, ppeNet: ppeCost - accDep, rou: lease[t],
      loc, interestPayable, currentDebt: nextPrincipal, longDebt: debtEnd - nextPrincipal, debtEnd, leaseLiability: lease[t],
      commonStock, retained, dividends, capex: capex[t], debtPrincipal, cfo, cfi, cff, dNwcAssets, dNwcLiabs,
    };
    row.currentAssets = row.cash + row.receivables + row.contractAsset + row.inventory + row.prepaid;
    row.totalAssets = row.currentAssets + row.ppeNet + row.rou;
    row.currentLiabsCovenant = row.payables + row.loc + row.wagesPayable + row.interestPayable + row.unearned + row.taxPayable + row.currentDebt;
    row.totalLiabs = row.currentLiabsCovenant + row.longDebt + row.leaseLiability;
    row.equity = row.commonStock + row.retained;
    row.check = row.totalAssets - row.totalLiabs - row.equity;
    row.currentRatio = row.currentAssets / row.currentLiabsCovenant;
    row.netChangeInCash = cfo + cfi + cff;
    out.rows.push(row);
    prev = { ...row };
  }
  return out;
}
export const MODEL = model();


// ================================================================ module 3: valuation and scenarios
import { DERIVED as F05_DERIVED, MARKET as F05_MARKET } from '../f05/case.js?v=37';
/** Valuation inputs: F05's post-financing WACC; Ana's long-run growth; valued at 31 December 2027. */
export const VALUATION = { wacc: F05_DERIVED.wacc, terminalGrowth: 0.025, hollisPre: F05_DERIVED.preMoney, hollisPost: F05_DERIVED.postMoney };
const opNwc = (x) => x.receivables + x.contractAsset + x.inventory + x.prepaid - x.payables - x.wagesPayable - x.unearned - x.taxPayable;
/** Net debt at the valuation date: loans and the line of credit less cash (leases excluded: their cost is inside EBITDA). */
export const NET_DEBT_2027 = OPENING.currentDebt + OPENING.longDebt + OPENING.loc - OPENING.cash;

/** Free cash flow to the firm and a DCF value of Lantern from a model run. */
export function dcf(Mo = MODEL, V = VALUATION) {
  const R = Mo.rows, w = V.wacc, g = V.terminalGrowth;
  const nwc = R.map(opNwc), nwc0 = opNwc(OPENING);
  const rows = R.map((r, t) => {
    const opTax = TAX * Math.max(0, r.ebit);                      // operating tax on EBIT (none in a loss year)
    const nopat = r.ebit - opTax;
    const dNwc = nwc[t] - (t ? nwc[t - 1] : nwc0);
    const fcff = nopat + r.dep - r.capex - dNwc;
    const df = 1 / (1 + w) ** (t + 1);
    return { year: r.year, ebit: r.ebit, opTax, nopat, dep: r.dep, capex: r.capex, dNwc, fcff, df, pv: fcff * df };
  });
  const last = rows[rows.length - 1];
  // the terminal year is normalised: capital spending equal to depreciation, working capital growing with sales
  const fcffNext = last.nopat * (1 + g) - nwc[nwc.length - 1] * g;
  const tv = fcffNext / (w - g);
  const pvTv = tv * last.df;
  const sumPv = rows.reduce((q, r) => q + r.pv, 0);
  const ev = sumPv + pvTv;
  const equity = ev - NET_DEBT_2027;
  return { rows, fcffNext, tv, pvTv, sumPv, ev, netDebt: NET_DEBT_2027, equity, tvShare: pvTv / ev, wacc: w, g };
}
export const DCF = dcf();

/** A scenario: changes to Ana's assumptions and financing, applied to copies of the base. */
const clone = (o) => JSON.parse(JSON.stringify(o));
export function scenario({ online = 1, cafeGrowth = null, cans = 1, opensMonth = 4, termAmount = F05_DEBT.termLoan.amount, minCash = FINANCE.minCash, wacc = VALUATION.wacc, terminalGrowth = VALUATION.terminalGrowth } = {}) {
  const A = clone(ASSUME);
  A.online.growth = A.online.growth.map((x) => x * online);
  if (cafeGrowth != null) A.cafes.growth = A.cafes.growth.map(() => cafeGrowth);
  A.coldBrew.cans = A.coldBrew.cans.map((x) => x * cans);
  A.kitchen.opensMonth = opensMonth;
  const Mo = model(A, WC, { ...FINANCE, termAmount, minCash });
  const D = dcf(Mo, { ...VALUATION, wacc, terminalGrowth });
  const R = Mo.rows;
  return { model: Mo, dcf: D, ratios: R.map((r) => r.currentRatio), minRatio: Math.min(...R.map((r) => r.currentRatio)), passes: R.every((r) => r.currentRatio >= 1.2), ebitda2028: R[0].ebitda, cash2028: R[0].cash, loc2028: R[0].loc, locNeed: Mo.locNeed, gap: Math.max(0, ...Mo.locNeed.map((x) => x - FINANCE.locLimit)), equity: D.equity };
}
/** The scenarios the lessons compare. */
export const SCENARIOS = {
  base: { name: 'Base case', set: {} },
  slow: { name: 'Slow growth', set: { online: 0.5, cafeGrowth: 0.02, cans: 0.75 }, why: 'online growth halved, cafés 2% a year, a quarter fewer Cold Brew cans' },
  late: { name: 'Kitchen opens three months late', set: { opensMonth: 7 }, why: 'the second kitchen opens on 1 July 2028 instead of 1 April' },
  loan75: { name: 'Base case, $75,000 term loan', set: { termAmount: 75_000 }, why: 'Coastline lends $75,000 on the same terms' },
  slow75: { name: 'Slow growth, $75,000 term loan', set: { online: 0.5, cafeGrowth: 0.02, cans: 0.75, termAmount: 75_000 } },
};
export const SCENARIO_RESULTS = Object.fromEntries(Object.entries(SCENARIOS).map(([k, v]) => [k, { ...v, ...scenario(v.set) }]));
