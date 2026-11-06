// case.js — the F05 Corporate Finance story: Lantern Coffee Co. in February 2028, after its second year (F03's 2027
// accounts). One source of truth for every figure F05's lessons, exercises, assessments and project use. Every name,
// price, rate and forecast is invented for teaching: no real company, lender or market quote is described, and the
// market inputs (risk-free rate, market risk premium, peer betas) are Ana's working assumptions, not current data.
//
// Agrees with earlier courses (checked in IDENTITIES):
// - f03/case.js: the 2027 statements (revenue $577,860, EBIT $32,787, net income $22,431, the 31 December 2027
//   balance sheet), the 25% tax rate, Coastline's $30,000 line of credit at 9% ($24,000 drawn), the $2,000 dividend
//   paid on 30 June 2027, the law firm's first fee due 31 March 2028, Kilnworth Roasting supplies the beans, Cold Brew
//   launched in spring 2028 through a co-packer.
// - f04/case.js and f01: the first Coastline note ($10,000 at 6%) is repaid on 1 March 2028; Coastline quoted 7.2% for
//   a four-year equipment loan in March 2027.
// - m02/market.js: the Cold Brew product (250 ml cans, single-origin liquid at $0.74 a can including the co-packer's
//   fee and freight), shelf prices, and what natural and specialty grocers keep (38% of the shelf price) and charge
//   to list a product ($2,000 a year).
// - f00's 2028 scenario, made concrete here: in March 2028 Lantern repays the first loan, opens a second kitchen,
//   borrows $60,000 from Coastline over five years with a covenant (current ratio at least 1.2), and issues new shares
//   to Hollis Avery so that Hollis owns 30%.
// - m06: Ana's 10% a year used for customer lifetime value there was a round working rate; F05 estimates the cost of
//   capital properly (lessons may say so).
import { RESULTS as F03R, FACTS as F03F, BREWER as F03_BREWER } from '../f03/case.js?v=28';
import { COASTLINE_NOTE, BREWER as F04_BREWER } from '../f04/case.js?v=28';
import { TIERS, CHANNELS } from '../m02/market.js?v=28';
import * as CF from '../../../core/corpfin.js?v=28';
import { npv, irr, appraise } from '../../../core/invest.js?v=28';

export const TODAY = 'February 2028';
export const TAX = 0.25;

// ================================================================ lessons: Lantern's 2028 investment proposals
const single = TIERS.find((t) => t.id === 'single'), natural = CHANNELS.find((c) => c.id === 'natural');
/** Lantern Cold Brew: launched 1 April 2028 through the co-packer; five years of forecasts (April–March years). */
export const COLD_BREW = {
  shelfPrice: 3.49,                                   // natural and specialty grocers (M02)
  tradeMargin: natural.margin,                        // 0.38: distributor and grocer together
  netPrice: 3.49 * (1 - natural.margin),              // $2.1638 a can to Lantern
  cogs: single.cogs,                                  // $0.74 a can: liquid, can, co-packer fee, freight (M02)
  cans: [30_000, 45_000, 55_000, 60_000, 60_000],
  listing: natural.listing,                           // $2,000 a year for one SKU (M02)
  promotion: [30_000, 18_000, 15_000, 15_000, 15_000],
  brandManager: 24_000,                               // a part-time brand manager, a year
  equipment: 9_000,                                   // chilled display fridges for the two cafés and a sampling kit (5-year MACRS)
  launch: 6_000,                                      // can design and launch event, expensed at the start
  nwcShare: 0.15,                                     // inventory at the co-packer and 60-day receivables: 15% of next year's revenue
  cannibalised: 8_000,                                // café iced-coffee margin lost each year, before tax
  sunk: { research: 9_600, label: 'M05’s May 2027 needs study' },
  salvage: 1_500,                                     // the fridges' resale value after five years
  years: 5,
};
/** An in-house roaster instead of buying roasted beans from Kilnworth. */
export const ROASTER = {
  price: 42_000, install: 6_000, macrs: 7, life: 7, salvage: 8_000,
  kg: 2_400,                                          // roasted coffee a year (600 kg a quarter for the online shop and cafés)
  kilnworthPerKg: 36.00,                              // Kilnworth’s $9.00 for a 250 g bag of House Blend (its December 2026 price, F02), roasted and packed
  greenPerKg: 9.80, weightLoss: 0.16,                 // green beans lose about 16% of their weight in roasting
  runningPerKg: 2.80,                                 // gas, bags and labels per kg roasted
  operator: 30_000, maintenance: 2_500,               // a part-time roaster operator and servicing, a year
  space: 3_600,                                       // the kitchen corner it occupies could be sublet for $300 a month (opportunity cost)
};
/** Two roasters (mutually exclusive, different lives). */
export const ROASTERS = [
  { name: 'Roaster A (15 kg batch)', price: 48_000, life: 7, operator: 30_000, salvage: 8_000 },
  { name: 'Roaster B (5 kg batch)', price: 22_000, life: 4, operator: 36_000, salvage: 3_000 },
];
/** 2028's capital proposals and the $40,000 Ana can spend without new financing (capital rationing). */
export const PROPOSALS = [
  { name: 'Cold Brew launch', outlay: null, note: 'from COLD_BREW' },
  { name: 'In-house roaster', outlay: null, note: 'from ROASTER' },
  { name: 'Ordering kiosks for the cafés', outlay: 14_000, life: 4, saving: 5_200 },
  { name: 'Electric cargo bike for deliveries', outlay: 7_500, life: 5, saving: 2_300 },
  { name: 'Solar panels on the kitchen roof', outlay: 19_000, life: 10, saving: 3_100 },
];
export const BUDGET_2028 = 40_000;
/** The discount rate Ana uses in modules 1–2: her working estimate before module 3 estimates the cost of capital. */
export const WORKING_RATE = 0.11;
/** The debt share Ana aims for in the long run (module 3's WACC); the project uses the actual post-financing weights. */
export const TARGET_DV = 0.20;

// ================================================================ the cost of capital (Ana's assumptions)
export const MARKET = {
  rf: 0.042,                                          // assumed risk-free rate (long-term government bond yield)
  mrp: 0.055,                                         // assumed market risk premium
  smallFirm: 0.03,                                    // an extra premium Ana adds for a small, illiquid private firm (debated)
};
/** Listed peers (all fictional): equity betas and market debt-to-equity ratios. */
export const PEERS = [
  { name: 'Brightcup Coffee', beta: 1.05, de: 0.30, tax: 0.25 },
  { name: 'Morrow & Pike Roasters', beta: 0.90, de: 0.15, tax: 0.25 },
  { name: 'Harbour Street Foods', beta: 1.25, de: 0.55, tax: 0.25 },
];
export const DEBT = {
  termLoan: { lender: 'Coastline Bank', amount: 60_000, rate: 0.075, years: 5, monthly: true, start: '1 March 2028', covenant: { currentRatio: 1.2 } },
  lineOfCredit: { limit: F03F.lineOfCredit.limit, rate: F03F.lineOfCredit.rate, drawn: 24_000 },
  firstNote: { amount: COASTLINE_NOTE.principal, rate: COASTLINE_NOTE.rate / 100, repaid: COASTLINE_NOTE.matures },
  quote2027: F04_BREWER.loan.apr / 100,
};

// ================================================================ the project: the second kitchen and its financing
export const KITCHEN = {
  opens: '1 April 2028',
  equipment: 60_000,                                  // ovens, blast chiller, mixers (7-year MACRS)
  fitOut: 36_000,                                     // leasehold improvements; the case depreciates them for tax straight line over the 5-year lease (a simplification)
  rent: 30_000,                                       // $2,500 a month, a year
  years: 5,
  revenue: [150_000, 185_000, 205_000, 215_000, 220_000],   // extra catering and wholesale bakery sales
  variableShare: 0.42,                                // ingredients, packaging, event staff
  fixed: 40_000,                                      // a part-time kitchen supervisor, utilities, insurance and cleaning, besides rent (cooks are paid by the event: variable)
  nwcShare: 0.08,
  salvageEquipment: 12_000,
};
/** The accountant’s forecast of Lantern's current items on 31 March 2028, before the kitchen and its financing (the law
 *  firm’s $41,120 arrives that day; the first Coastline note was repaid on 1 March). Current portion of long-term debt =
 *  the van note's 1 June 2028 instalment + the brewer plan’s principal in payments 12–23 (April 2028 – March 2029), both
 *  from F03. Coastline's covenant measures the current ratio without operating lease liabilities (the loan agreement’s
 *  definition), tested each quarter end. */
const brewerNext12 = Math.round((F03_BREWER.rows[10].end - F03_BREWER.rows[22].end) * 100) / 100;
export const FORECAST_MAR28 = {
  assets: [['Cash', 46_000], ['Accounts receivable (net)', 11_900], ['Inventory', 10_200], ['Supplies and prepaid insurance', 1_500]],
  liabilities: [['Accounts payable', 9_800], ['Line of credit', 24_000], ['Wages payable', 4_500], ['Interest payable', 980], ['Unearned revenue', 8_900],
    ['Income taxes payable', 3_100], ['Current portion of long-term debt', 5_000 + brewerNext12]],
  leases: 38_000,                                     // current portion of operating lease liabilities (left out of the covenant)
};
export const COVENANT = { currentRatio: 1.2, excludes: 'operating lease liabilities', tested: 'each quarter end' };
export const HOLLIS = { name: 'Hollis Avery', stake: 0.30, cash: 75_000, required: 0.20 };
export const SHARES = { existing: 20_000 };          // Ana's 20,000 shares (F03: common stock $20,000 at $1)

// ================================================================ derived figures
const cb = COLD_BREW;
const cbRevenue = cb.cans.map((n) => n * cb.netPrice);
export const coldBrewFlows = (over = {}) => {
  const c = { ...cb, ...over };
  const rev = c.cans.map((n) => n * c.netPrice);
  return CF.projectCashFlows({
    capex: c.equipment, years: c.years, revenue: rev, variable: c.cans.map((n) => n * c.cogs),
    fixed: c.promotion.map((p) => p + c.listing + c.brandManager), dep: CF.depreciation(c.equipment, { method: 5 }).slice(0, c.years),
    tax: TAX, nwcShare: c.nwcShare, salvage: c.salvage, upfront: c.launch, side: Array(c.years).fill(-c.cannibalised * (1 - TAX)),
  });
};
const roasterSaving = ROASTER.kg * (ROASTER.kilnworthPerKg - ROASTER.greenPerKg / (1 - ROASTER.weightLoss) - ROASTER.runningPerKg);
export const roasterFlows = () => CF.projectCashFlows({
  capex: ROASTER.price + ROASTER.install, years: ROASTER.life, revenue: Array(ROASTER.life).fill(roasterSaving),
  variable: Array(ROASTER.life).fill(0), fixed: ROASTER.operator + ROASTER.maintenance + ROASTER.space,
  dep: CF.depreciation(ROASTER.price + ROASTER.install, { method: ROASTER.macrs }).slice(0, ROASTER.life), tax: TAX, salvage: ROASTER.salvage,
});
export const kitchenFlows = (over = {}) => {
  const k = { ...KITCHEN, ...over };
  const depE = CF.depreciation(k.equipment, { method: 7 }).slice(0, k.years), depF = CF.depreciation(k.fitOut, { life: k.years });
  return CF.projectCashFlows({
    capex: k.equipment + k.fitOut, years: k.years, revenue: k.revenue, variableShare: k.variableShare, fixed: k.fixed + k.rent,
    dep: depE.map((d, i) => d + depF[i]), tax: TAX, nwcShare: k.nwcShare, salvage: k.salvageEquipment,
  });
};
const peersU = PEERS.map((p) => CF.unleverBeta(p.beta, p.de, p.tax));
const betaU = peersU.reduce((a, b) => a + b, 0) / peersU.length;

export const DERIVED = {
  coldBrewNetPrice: cb.netPrice, coldBrewRevenue: cbRevenue, coldBrewFcf: coldBrewFlows().fcf,
  roasterSavingPerYear: roasterSaving, roasterFcf: roasterFlows().fcf,
  kitchenFcf: kitchenFlows().fcf,
  peerUnlevered: peersU, betaU,
  termLoanPayment: -(-DEBT.termLoan.amount * (DEBT.termLoan.rate / 12) / (1 - (1 + DEBT.termLoan.rate / 12) ** -60)),
  postMoney: HOLLIS.cash / HOLLIS.stake, preMoney: HOLLIS.cash / HOLLIS.stake - HOLLIS.cash,
  newShares: SHARES.existing * HOLLIS.stake / (1 - HOLLIS.stake),
};
// Module 3: Lantern’s WACC at its target debt share.
{
  const de = TARGET_DV / (1 - TARGET_DV), bL = CF.releverBeta(betaU, de, TAX);
  DERIVED.targetBeta = bL;
  DERIVED.targetCostOfEquity = CF.capm({ rf: MARKET.rf, beta: bL, mrp: MARKET.mrp }) + MARKET.smallFirm;
  DERIVED.targetWacc = CF.wacc({ E: 1 - TARGET_DV, D: TARGET_DV, rE: DERIVED.targetCostOfEquity, rD: DEBT.termLoan.rate, tax: TAX }).wacc;
}
// The project: Lantern after the financing: equity at Hollis's post-money valuation, debt = the new term loan (the line of credit is
// treated as working capital and left out, which lessons say).
const E = DERIVED.postMoney, D = DEBT.termLoan.amount;
DERIVED.targetDE = D / E;
DERIVED.betaL = CF.releverBeta(betaU, D / E, TAX);
DERIVED.costOfEquityCapm = CF.capm({ rf: MARKET.rf, beta: DERIVED.betaL, mrp: MARKET.mrp });
DERIVED.costOfEquity = DERIVED.costOfEquityCapm + MARKET.smallFirm;
DERIVED.wacc = CF.wacc({ E, D, rE: DERIVED.costOfEquity, rD: DEBT.termLoan.rate, tax: TAX }).wacc;

// ================================================================ identities with earlier courses
const IS = F03R.incomeStatement, BS = F03R.balanceSheet;
const bsLine = (side, list, name) => (BS[side][list] || BS[side]).find((x) => x[0] === name)?.[1];
export const IDENTITIES = [
  ['F03 2027 revenue, EBIT and net income', IS.revenue === 577_860 && IS.ebit === 32_787 && IS.netIncome === 22_431],
  ['F03’s tax rate is the 25% used here', F03F.tax.rate === TAX],
  ['the line of credit: $30,000 at 9%, $24,000 drawn at the end of 2027', DEBT.lineOfCredit.limit === 30_000 && DEBT.lineOfCredit.rate === 0.09 && BS.liabilities.current.find((x) => x[0] === 'Line of Credit')[1] === 24_000],
  ['a $2,000 dividend in 2027', F03F.dividends.reduce((s, d) => s + d.amount, 0) === 2_000],
  ['F03’s common stock is $20,000 (Ana’s 20,000 $1 shares)', BS.equity.find((x) => x[0] === 'Common Stock')[1] === SHARES.existing],
  ['the first Coastline note ($10,000 at 6%) is repaid on 1 March 2028', COASTLINE_NOTE.principal === 10_000 && COASTLINE_NOTE.rate === 6 && COASTLINE_NOTE.matures === '1 March 2028'],
  ['Coastline’s March 2027 quote was 7.2%; the 2028 term loan is dearer', Math.abs(DEBT.quote2027 - 0.072) < 1e-12 && DEBT.termLoan.rate > DEBT.quote2027],
  ['Cold Brew: M02’s single-origin cost and natural grocers’ terms', COLD_BREW.cogs === 0.74 && COLD_BREW.tradeMargin === 0.38 && COLD_BREW.listing === 2_000],
  ['Hollis ends with 30%', Math.abs(DERIVED.newShares / (SHARES.existing + DERIVED.newShares) - HOLLIS.stake) < 1e-12],
  ['the roaster replaces Kilnworth beans worth less than 2027’s purchases of goods', ROASTER.kg * ROASTER.kilnworthPerKg < F03F.inventory.purchases],
  ['Kilnworth’s price is F02’s December 2026 House Blend price, $9.00 a 250 g bag', ROASTER.kilnworthPerKg === 9 * 4],
  ['the law firm’s first fee is due 31 March 2028', F03F.lawFirm.paidAt === '2028-03-31'],
  ['the brewer plan’s 24 payments run May 2027 – April 2029, so 12 fall due April 2028 – March 2029', F03F.brewer.payments === 24 && F03_BREWER.rows.length === 24],
  ['the van note: $5,000 a year each 1 June; F03 shows $10,000 of it due after 2028, so $5,000 falls due on 1 June 2028', bsLine('liabilities', 'noncurrent', 'Notes Payable') === 10_000],
];
export { bsLine };
