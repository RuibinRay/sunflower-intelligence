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
import { RESULTS as F03R, PRIOR as F03P, FACTS as F03F } from '../f03/case.js?v=33';
import { KITCHEN, COLD_BREW, TAX as F05_TAX } from '../f05/case.js?v=33';

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
