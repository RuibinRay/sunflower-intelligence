// case.js — the F06 Investment Analysis story: Ana Lim invests for the long term, June 2028. One source of truth for
// every figure F06's lessons, exercises, assessments and project use. Every fund, index, company, price and return here
// is fictional, and the monthly returns in data.js are SIMULATED (tools/study/f06-data.py), not real market history.
//
// Agrees with earlier courses (checked in IDENTITIES):
// - f04/case.js: Ana is saving $914.19 a month in Sandpiper Online savings (3.6%, monthly) for a $60,000 deposit on a
//   flat in April 2032; Lantern pays her $48,000 a year; she assumes inflation of 2.8% a year.
// - f00/case.js: she keeps a $6,000 emergency fund.
// - f05/case.js: the three listed peers and their betas and market debt-to-equity ratios (Brightcup Coffee 1.05 and
//   0.30, Morrow & Pike Roasters 0.90 and 0.15, Harbour Street Foods 1.25 and 0.55), the assumed 4.2% risk-free rate
//   and 5.5% market risk premium. Here the betas are what a regression of 2023–2027 monthly returns gives.
import { RETURN_COLUMNS, RETURNS } from './data.js?v=31';
import { ANA_PLAN, DERIVED as F04D } from '../f04/case.js?v=31';
import { ANA as F00_ANA } from '../f00/case.js?v=31';
import { PEERS as F05_PEERS, MARKET as F05_MARKET } from '../f05/case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';

export const TODAY = 'June 2028';

// ================================================================ the simulated market history (data.js)
const col = (name) => RETURNS.map((r) => r[RETURN_COLUMNS.indexOf(name)]);
export const MONTHS = col('month');
export const SERIES = Object.fromEntries(RETURN_COLUMNS.slice(1).map((c) => [c, col(c)]));
/** What each column is. Fund returns are net of the fund's fees. */
export const ASSETS = {
  bills: { name: 'One-month bills (the risk-free rate)', kind: 'cash' },
  market: { name: 'Harbourline Total Market Index Fund', kind: 'fund', fee: 0.0004, index: 'Harbourline Total Market Index', holds: 'every listed share in the home market, weighted by market value' },
  intl: { name: 'Harbourline International Index Fund', kind: 'fund', fee: 0.0007, index: 'Harbourline International Index', holds: 'listed shares in other developed and emerging markets' },
  bonds: { name: 'Harbourline Aggregate Bond Index Fund', kind: 'fund', fee: 0.0005, index: 'Harbourline Aggregate Bond Index', holds: 'investment-grade government and corporate bonds, average duration about 6 years', duration: 6 },
  active: { name: 'Northgate Active Equity Fund', kind: 'fund', fee: 0.0085, benchmark: 'market', holds: 'about 60 home-market shares picked by its managers' },
  brightcup: { name: 'Brightcup Coffee', kind: 'share' },
  morrow: { name: 'Morrow & Pike Roasters', kind: 'share' },
  harbour: { name: 'Harbour Street Foods', kind: 'share' },
};
export const LAST60 = { from: MONTHS.length - 60, label: 'January 2023 – December 2027' };

// ================================================================ Ana's investing (lessons)
export const ANA = {
  retirement: { opens: '1 July 2028', lump: 5_000, monthly: 400, source: 'a gift from her parents (fictional)', horizon: 'until she retires, in about 30 years' },
  deposit: { monthly: Math.round(F04D.monthlySavingForDeposit * 100) / 100, target: F04D.deposit, needed: 'April 2032', where: ANA_PLAN.saving.account },
  emergency: F00_ANA.emergencyFund,
  salary: ANA_PLAN.salaryFromLantern,
  inflation: ANA_PLAN.inflation / 100,
};
/** Ana's questionnaire answers (fictional), for risk tolerance: she could stomach a fall of about a quarter. */
export const RISK_PROFILE = { worstYearShe: -0.25, aversionA: 3 };

// ================================================================ the listed companies (fictional; F05's peers)
// Financial year 2027 ($ millions except per share), share price at 31 December 2027.
export const COMPANIES = {
  morrow: { name: 'Morrow & Pike Roasters', price: 28.00, shares: 40, revenue: 760, ebitda: 118, da: 26, ebit: 92, interest: 9, tax: 0.25, debt: 168, cash: 30, bookEquity: 520, dps: 0.70, capex: 34, dNwc: 4, growthForecast: 0.08,
    blurb: 'a speciality roaster selling to cafés and grocers in three states' },
  harbour: { name: 'Harbour Street Foods', price: 18.00, shares: 120, revenue: 3_900, ebitda: 410, da: 120, ebit: 290, interest: 64, tax: 0.25, debt: 1_188, cash: 60, bookEquity: 1_650, dps: 0.60, capex: 125, dNwc: 10, growthForecast: 0.05,
    blurb: 'a packaged-food maker whose brands include coffee, snacks and frozen meals' },
  brightcup: { name: 'Brightcup Coffee', price: 42.00, shares: 50, revenue: 1_450, ebitda: 232, da: 58, ebit: 174, interest: 32, tax: 0.25, debt: 630, cash: 40, bookEquity: 760, dps: 0.85, capex: 70, dNwc: 8, growthForecast: 0.10,
    blurb: 'a chain of 410 coffee shops with a growing grocery range' },
};
for (const c of Object.values(COMPANIES)) {
  c.netIncome = (c.ebit - c.interest) * (1 - c.tax);
  c.eps = c.netIncome / c.shares;
  c.marketCap = c.price * c.shares;
  c.m = IV.multiples({ price: c.price, shares: c.shares, netIncome: c.netIncome, ebitda: c.ebitda, ebit: c.ebit, revenue: c.revenue, bookEquity: c.bookEquity, debt: c.debt, cash: c.cash, growth: c.growthForecast, dps: c.dps });
  c.fcff = c.ebit * (1 - c.tax) + c.da - c.capex - c.dNwc;
}
/** Morrow & Pike's five-year forecast (lessons' DCF; fictional analyst consensus). */
export const MORROW_FORECAST = { growth: [0.08, 0.08, 0.07, 0.06, 0.05], ebitMargin: 0.121, daShare: 0.034, capexShare: 0.042, nwcShare: 0.06, terminalGrowth: 0.03 };
/** Brightcup's forecast: the project's (lessons must not value Brightcup). */
export const BRIGHTCUP_FORECAST = { growth: [0.10, 0.10, 0.09, 0.07, 0.05], ebitMargin: [0.12, 0.125, 0.13, 0.13, 0.13], daShare: 0.04, capexShare: 0.05, nwcShare: 0.055, terminalGrowth: 0.03, stores: 410, newStoresPerYear: 35 };
export const MARKET = { rf: F05_MARKET.rf, mrp: F05_MARKET.mrp };
/** The project: Ana's retirement mix after module 3 (her choice), Brightcup's bond (F05 module 3: 6 years, 5% annual
 *  coupon, $96.20 per $100) and the share of her account she is tempted to put in Brightcup. */
export const ANA_PORTFOLIO = { market: 0.60, intl: 0.20, bonds: 0.20 };
export const BRIGHTCUP_BOND = { couponRate: 0.05, years: 6, freq: 1, price: 96.20, face: 100 };
export const BRIGHTCUP_IDEA = { share: 0.10, why: 'she knows the business, sees its shops busy and thinks it is cheap' };

// ================================================================ bonds (lessons; fictional)
export const BONDS = [
  { name: 'Government note, 5-year', couponRate: 0.0400, years: 5, freq: 2, ytm: 0.0420, rating: 'government' },
  { name: 'Government bond, 20-year', couponRate: 0.0450, years: 20, freq: 2, ytm: 0.0465, rating: 'government' },
  { name: 'Harbour Street Foods 2035 bond', couponRate: 0.0550, years: 7, freq: 2, ytm: 0.0610, rating: 'BBB' },
  { name: 'Morrow & Pike 2031 bond', couponRate: 0.0475, years: 3.5, freq: 2, ytm: 0.0545, rating: 'BBB' },
  { name: 'Government note, 2-year', couponRate: 0.0400, years: 2, freq: 2, ytm: 0.0410, rating: 'government' },   // added last so earlier indices hold
];

// ================================================================ derived figures
const ann = (r) => ({ mean: IV.annualise.mean(IV.arithmetic(r)), sd: IV.annualise.sd(sdOf(r)), growth: IV.annualise.geometric(IV.geometric(r)) });
function sdOf(r) { const m = r.reduce((a, b) => a + b, 0) / r.length; return Math.sqrt(r.reduce((s, v) => s + (v - m) ** 2, 0) / (r.length - 1)); }
const last60 = (a) => a.slice(LAST60.from);
export const DERIVED = {
  stats: Object.fromEntries(Object.entries(SERIES).map(([k, r]) => [k, ann(r)])),
  betas60: Object.fromEntries(['brightcup', 'morrow', 'harbour', 'active', 'intl', 'bonds'].map((k) => [k, IV.regressBeta(last60(SERIES[k]), last60(SERIES.market), last60(SERIES.bills))])),
  corr: { marketBonds: IV.sampleCov(SERIES.market, SERIES.bonds).corr, marketIntl: IV.sampleCov(SERIES.market, SERIES.intl).corr },
  worstYear: Object.fromEntries(['market', 'bonds', 'intl'].map((k) => [k, Math.min(...IV.yearly(MONTHS, SERIES[k]).map((y) => y.ret))])),
  drawdown: Object.fromEntries(['market', 'bonds'].map((k) => [k, IV.maxDrawdown(SERIES[k])])),
};

// ================================================================ identities with earlier courses and the generator
const peer = (n) => F05_PEERS.find((p) => p.name.startsWith(n));
const near = (a, b, t = 1e-9) => Math.abs(a - b) < t;
export const IDENTITIES = [
  ['180 months, January 2013 – December 2027', MONTHS.length === 180 && MONTHS[0] === '2013-01' && MONTHS[179] === '2027-12'],
  ['2023–2027 regression betas are F05’s (1.05, 0.90, 1.25) and alphas zero', ['Brightcup', 'Morrow', 'Harbour'].every((n, i) => { const k = ['brightcup', 'morrow', 'harbour'][i], b = DERIVED.betas60[k]; return near(b.beta, peer(n).beta, 5e-6) && Math.abs(b.alpha) < 5e-7; })],
  ['market D/E at the end of 2027 is F05’s (debt ÷ market capitalisation)', ['brightcup', 'morrow', 'harbour'].every((k) => near(COMPANIES[k].debt / COMPANIES[k].marketCap, peer(COMPANIES[k].name.split(' ')[0]).de, 1e-9))],
  ['F05’s risk-free rate and market risk premium', MARKET.rf === 0.042 && MARKET.mrp === 0.055],
  ['F04: Ana saves about $914 a month for a $60,000 deposit in April 2032', near(ANA.deposit.monthly, 914.19, 0.006) && ANA.deposit.target === 60_000],
  ['F00: a $6,000 emergency fund', ANA.emergency === 6_000],
  ['the active fund trails the index over the 15 years', DERIVED.stats.active.mean < DERIVED.stats.market.mean],
  ['the bond index lost 13% in 2022 (planted)', near(IV.yearly(MONTHS, SERIES.bonds).find((y) => y.year === '2022').ret, -0.13, 1e-5)],
  ['the market’s sample mean excess return is 0.70% a month (planted)', near(SERIES.market.reduce((s, v, i) => s + v - SERIES.bills[i], 0) / 180, 0.007, 1e-6)],
  ['Ana’s mix sums to 100%', near(Object.values(ANA_PORTFOLIO).reduce((a, b) => a + b, 0), 1)],
  ['net income = (EBIT − interest) × (1 − tax) for each company', Object.values(COMPANIES).every((c) => near(c.netIncome, (c.ebit - c.interest) * 0.75))],
];
