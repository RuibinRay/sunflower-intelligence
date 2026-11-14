// investments.js — the F06 Investment Analysis engine: returns and their averages, scenario risk, two-asset and n-asset
// portfolios, the capital allocation line, performance ratios, beta by regression, bond duration and convexity, fee
// drag, and the share-valuation pieces (DCF with a terminal value, the enterprise-value bridge, multiples). Portfolio
// optimisation lives in core/portfolio.js (long-only frontier, maximum Sharpe), bond pricing in core/fin.js, and the
// dividend discount models in core/valuation.js; this file re-exports what F06 needs from them.
// Tested against NumPy, pandas, statsmodels and numpy-financial in tests/investments.test.mjs.
import { mean, sd, ols } from './stats.js?v=31';
export { portRet, portVar, minVariance, maxSharpe, frontier } from './portfolio.js?v=31';
export { bondAtYield, bondYield, bondFlows } from './fin.js?v=31';
export { gordon, multiStageDdm } from './valuation.js?v=31';

// ---------------------------------------------------------------- returns
/** Holding-period return: (end price − start price + income) ÷ start price. */
export const hpr = (p0, p1, income = 0) => (p1 - p0 + income) / p0;
/** Arithmetic mean of periodic returns. */
export const arithmetic = (r) => mean(r);
/** Geometric mean (compound growth rate per period). */
export const geometric = (r) => Math.exp(r.reduce((s, v) => s + Math.log1p(v), 0) / r.length) - 1;
/** Growth of $1 over the returns (cumulative wealth index). */
export const wealth = (r, start = 1) => { const w = [start]; for (const v of r) w.push(w[w.length - 1] * (1 + v)); return w; };
/** Annualise a periodic mean (×m) and standard deviation (×√m), and compound a periodic geometric mean. */
export const annualise = { mean: (x, m = 12) => x * m, sd: (x, m = 12) => x * Math.sqrt(m), geometric: (g, m = 12) => (1 + g) ** m - 1 };
/** Real return from a nominal return and inflation (Fisher, exact). */
export const realReturn = (nominal, inflation) => (1 + nominal) / (1 + inflation) - 1;
/** Group monthly returns ('YYYY-MM' labels) into calendar-year compound returns. */
export function yearly(months, r) {
  const by = new Map();
  months.forEach((m, i) => { const y = m.slice(0, 4); by.set(y, (by.get(y) ?? 1) * (1 + r[i])); });
  return [...by].map(([year, g]) => ({ year, ret: g - 1 }));
}
/** Peak-to-trough fall of a wealth series: the largest drawdown and when. */
export function maxDrawdown(r) {
  const w = wealth(r); let peak = w[0], peakAt = 0, worst = 0, at = null;
  w.forEach((v, i) => { if (v > peak) { peak = v; peakAt = i; } const d = v / peak - 1; if (d < worst) { worst = d; at = { peak: peakAt, trough: i }; } });
  return { drawdown: worst, ...at };
}

// ---------------------------------------------------------------- scenario (expected) risk and return
/** Expected return, variance and standard deviation from scenarios [{ p, r }] (probabilities sum to 1). */
export function scenarios(list) {
  const tot = list.reduce((s, x) => s + x.p, 0);
  if (Math.abs(tot - 1) > 1e-9) throw new Error('Probabilities must sum to 1.');
  const er = list.reduce((s, x) => s + x.p * x.r, 0);
  const v = list.reduce((s, x) => s + x.p * (x.r - er) ** 2, 0);
  return { er, variance: v, sd: Math.sqrt(v) };
}
/** Covariance and correlation of two assets' returns across the same scenarios [{ p, a, b }]. */
export function scenarioCov(list) {
  const ea = list.reduce((s, x) => s + x.p * x.a, 0), eb = list.reduce((s, x) => s + x.p * x.b, 0);
  const cov = list.reduce((s, x) => s + x.p * (x.a - ea) * (x.b - eb), 0);
  const sa = Math.sqrt(list.reduce((s, x) => s + x.p * (x.a - ea) ** 2, 0)), sb = Math.sqrt(list.reduce((s, x) => s + x.p * (x.b - eb) ** 2, 0));
  return { ea, eb, cov, corr: cov / (sa * sb) };
}
/** Sample covariance and correlation of two return series. */
export function sampleCov(a, b) {
  const ma = mean(a), mb = mean(b); let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - ma) * (b[i] - mb);
  const cov = s / (a.length - 1);
  return { cov, corr: cov / (sd(a) * sd(b)) };
}

// ---------------------------------------------------------------- portfolios
/** Two-asset portfolio: weight w in A. */
export function twoAsset({ w, ra, rb, sa, sb, corr }) {
  const er = w * ra + (1 - w) * rb;
  const v = w * w * sa * sa + (1 - w) ** 2 * sb * sb + 2 * w * (1 - w) * corr * sa * sb;
  return { er, sd: Math.sqrt(Math.max(0, v)) };
}
/** The minimum-variance weight in A for two assets (may be outside 0–1 if short selling is allowed). */
export const twoAssetMinVarWeight = ({ sa, sb, corr }) => (sb * sb - corr * sa * sb) / (sa * sa + sb * sb - 2 * corr * sa * sb);
/** Standard deviation of an equally weighted portfolio of n assets with average variance and average covariance. */
export const equalWeightSd = (n, avgVar, avgCov) => Math.sqrt(avgVar / n + (1 - 1 / n) * avgCov);
/** A mix of a risky portfolio (share y) and the risk-free asset: the capital allocation line. */
export const cal = ({ y, rf, er, sd: s }) => ({ er: rf + y * (er - rf), sd: Math.abs(y) * s });
/** Optimal share in the risky portfolio for mean–variance utility U = E(r) − ½·A·σ². */
export const optimalRiskyShare = ({ rf, er, sd: s, A }) => (er - rf) / (A * s * s);

// ---------------------------------------------------------------- performance and CAPM
export const sharpe = (er, rf, s) => (er - rf) / s;
export const treynor = (er, rf, beta) => (er - rf) / beta;
/** Jensen's alpha: actual return less the CAPM required return. */
export const jensenAlpha = (er, rf, beta, rm) => er - (rf + beta * (rm - rf));
/** CAPM required return. */
export const capm = ({ rf, beta, mrp }) => rf + beta * mrp;
/** Beta (and alpha, R², the slope's SE) by regressing excess returns of the asset on those of the market. */
export function regressBeta(asset, market, rf = null) {
  const y = rf ? asset.map((v, i) => v - rf[i]) : asset, x = rf ? market.map((v, i) => v - rf[i]) : market;
  const f = ols([x], y);
  return { alpha: f.coefs[0].estimate, beta: f.coefs[1].estimate, r2: f.r2, seAlpha: f.coefs[0].se, seBeta: f.coefs[1].se, n: y.length };
}
/** Beta from covariance and variance (the same slope). */
export const betaCov = (cov, varM) => cov / varM;
/** Tracking error: SD of the difference between a fund's and its benchmark's returns. */
export const trackingError = (fund, bench) => sd(fund.map((v, i) => v - bench[i]));

// ---------------------------------------------------------------- bonds: duration and convexity (yield per period y, freq per year)
/** Macaulay and modified duration (years) and convexity (years²) of a bond priced at yield ytm (annual, compounded freq). */
export function duration({ face = 100, couponRate, years, freq = 1, ytm }) {
  const n = Math.round(years * freq), y = ytm / freq, c = face * couponRate / freq;
  let price = 0, w = 0, cx = 0;
  for (let k = 1; k <= n; k++) {
    const cf = c + (k === n ? face : 0), pv = cf / (1 + y) ** k;
    price += pv; w += (k / freq) * pv; cx += cf * k * (k + 1) / (1 + y) ** (k + 2);
  }
  const macaulay = w / price, modified = macaulay / (1 + y);
  return { price, macaulay, modified, convexity: cx / (price * freq * freq) };
}
/** Approximate % price change for a yield change dy (decimal): −D_mod·dy + ½·C·dy². */
export const priceChangeApprox = ({ modified, convexity = 0 }, dy) => -modified * dy + 0.5 * convexity * dy * dy;

// ---------------------------------------------------------------- funds
/** What fees cost: the value of `amount` after `years` growing at gross return r with and without an annual expense ratio. */
export function feeDrag({ amount, years, r, fee, monthly = 0 }) {
  const grow = (rate) => { let v = amount; for (let m = 0; m < years * 12; m++) v = v * (1 + rate) ** (1 / 12) + monthly; return v; };
  const gross = grow(r), net = grow((1 + r) * (1 - fee) - 1);
  return { gross, net, cost: gross - net, share: 1 - net / gross };
}

// ---------------------------------------------------------------- share valuation
/** DCF of free cash flows to the firm: explicit years, then a Gordon terminal value (or an exit multiple of the last year's metric). */
export function dcf({ fcf, rate, g = null, exitMultiple = null, exitMetric = null }) {
  const pv = fcf.map((f, i) => f / (1 + rate) ** (i + 1));
  const n = fcf.length, last = fcf[n - 1];
  let tv;
  if (exitMultiple != null) tv = exitMultiple * exitMetric;
  else { if (!(rate > g)) throw new Error('The discount rate must exceed terminal growth.'); tv = last * (1 + g) / (rate - g); }
  const pvTv = tv / (1 + rate) ** n, sumPv = pv.reduce((a, b) => a + b, 0);
  return { pv, sumPv, tv, pvTv, value: sumPv + pvTv, tvShare: pvTv / (sumPv + pvTv), impliedGrowth: exitMultiple != null ? (tv * rate - last) / (tv + last) : g };
}
/** From enterprise value to value per share: EV − debt + cash (− minorities, − preferred) ÷ shares. */
export const evToEquity = ({ ev, debt, cash = 0, other = 0, shares }) => { const equity = ev - debt + cash - other; return { equity, perShare: equity / shares }; };
/** Enterprise value from market capitalisation: equity + debt − cash (+ other claims). */
export const enterpriseValue = ({ marketCap, debt, cash = 0, other = 0 }) => marketCap + debt - cash + other;
/** The common multiples for one company. */
export function multiples({ price, shares, netIncome, ebitda, ebit, revenue, bookEquity, debt, cash = 0, growth = null, dps = null }) {
  const cap = price * shares, ev = enterpriseValue({ marketCap: cap, debt, cash }), eps = netIncome / shares, pe = price / eps;
  return { marketCap: cap, ev, eps, pe, evEbitda: ev / ebitda, evEbit: ev / ebit, evRevenue: ev / revenue, pb: cap / bookEquity, peg: growth ? pe / (growth * 100) : NaN, dividendYield: dps != null ? dps / price : NaN, earningsYield: eps / price };
}
/** Value implied by applying a multiple to a target's metric; EV multiples are bridged to equity per share. */
export function impliedValue({ multiple, metric, basis = 'equity', debt = 0, cash = 0, shares }) {
  if (basis === 'ev') return evToEquity({ ev: multiple * metric, debt, cash, shares });
  const equity = multiple * metric; return { equity, perShare: equity / shares };
}
/** Sustainable growth of earnings: retention × return on equity (b × ROE). */
export const earningsGrowth = (retention, roe) => retention * roe;
/** Present value of growth opportunities: price − EPS ÷ cost of equity. */
export const pvgo = (price, eps, ke) => price - eps / ke;
