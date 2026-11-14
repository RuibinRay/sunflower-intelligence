// valuation.js — the company valuation engine behind Finance › Company Valuation Studio: statement fields and
// derivations, validation, historical analysis, forecasts, discounted cash flow (FCFF at WACC and FCFE at the cost of
// equity), comparable companies, dividend discount models, asset-based values, sum of the parts, earnings-based and
// venture-capital methods, scenarios, sensitivity grids, Monte Carlo and the risk register.
// Pure functions on plain objects; no DOM. The studio page draws the results and valuation-report.js explains them.
// Checked in tests/valuation.test.mjs against figures worked independently (tests/make_fixtures_valuation.py).
//
// Conventions: every rate is a fraction (0.08 = 8%); money is in the project's unit (meta.unit, e.g. millions) and
// shares are in the same unit, so equity ÷ shares is a per-share figure in whole currency; capital expenditure is a
// positive number (cash spent). Nothing here fills a missing figure silently: derive() returns how each derived value
// was made, validate() lists what is missing or inconsistent, and every model returns { error } when it cannot run.
import { wacc as costOfCapital } from './fin.js?v=31';
import * as R from './ratios.js?v=31';
import { mulberry32, normalGen } from './rng.js?v=31';

export const fin = (x) => typeof x === 'number' && Number.isFinite(x);
const n0 = (x) => (fin(x) ? x : 0);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const sum = (xs) => xs.reduce((a, b) => a + b, 0);
export const mean = (xs) => (xs.length ? sum(xs) / xs.length : NaN);
/** Quantile with linear interpolation between order statistics (NumPy's default). */
export function quantile(xs, q) {
  const s = xs.filter(fin).sort((a, b) => a - b);
  if (!s.length) return NaN;
  const pos = (s.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}
export const median = (xs) => quantile(xs, 0.5);

// ================================================================ statement fields
export const STATEMENTS = [
  { id: 'is', name: 'Income statement' },
  { id: 'bs', name: 'Balance sheet' },
  { id: 'cf', name: 'Cash flow statement' },
];
/** Every line a period can hold. `derive` marks lines the engine can work out from others; `opt` lines may stay blank. */
export const FIELDS = [
  { id: 'revenue', st: 'is', label: 'Revenue', hint: 'Net sales for the year.' },
  { id: 'cogs', st: 'is', label: 'Cost of goods sold', hint: 'Cost of sales, before depreciation and amortisation where it is reported separately.' },
  { id: 'grossProfit', st: 'is', label: 'Gross profit', derive: true },
  { id: 'opex', st: 'is', label: 'Operating expenses (excluding D&A)', hint: 'Selling, general and administrative, research and development and other operating costs, before depreciation and amortisation.', derive: true },
  { id: 'ebitda', st: 'is', label: 'EBITDA', derive: true },
  { id: 'da', st: 'is', label: 'Depreciation and amortisation' },
  { id: 'ebit', st: 'is', label: 'EBIT (operating income)', derive: true },
  { id: 'interestExpense', st: 'is', label: 'Interest expense' },
  { id: 'interestIncome', st: 'is', label: 'Interest and other income', opt: true },
  { id: 'pretax', st: 'is', label: 'Pre-tax income', derive: true },
  { id: 'tax', st: 'is', label: 'Income tax', derive: true },
  { id: 'netIncome', st: 'is', label: 'Net income', derive: true },
  { id: 'shares', st: 'is', label: 'Diluted shares (weighted average)', opt: true, hint: 'In the same unit as the money (millions of shares when figures are in millions).' },
  { id: 'cash', st: 'bs', label: 'Cash and cash equivalents' },
  { id: 'shortTermInvestments', st: 'bs', label: 'Short-term investments', opt: true },
  { id: 'receivables', st: 'bs', label: 'Accounts receivable' },
  { id: 'inventory', st: 'bs', label: 'Inventory' },
  { id: 'otherCurrentAssets', st: 'bs', label: 'Other current assets', opt: true },
  { id: 'currentAssets', st: 'bs', label: 'Total current assets', derive: true },
  { id: 'ppeNet', st: 'bs', label: 'Property, plant and equipment (net)' },
  { id: 'goodwill', st: 'bs', label: 'Goodwill', opt: true },
  { id: 'intangibles', st: 'bs', label: 'Other intangible assets', opt: true },
  { id: 'otherNoncurrentAssets', st: 'bs', label: 'Other non-current assets', opt: true },
  { id: 'totalAssets', st: 'bs', label: 'Total assets', derive: true },
  { id: 'payables', st: 'bs', label: 'Accounts payable' },
  { id: 'currentDebt', st: 'bs', label: 'Short-term debt and current portion of long-term debt', opt: true },
  { id: 'otherCurrentLiabilities', st: 'bs', label: 'Other current liabilities', opt: true },
  { id: 'currentLiabilities', st: 'bs', label: 'Total current liabilities', derive: true },
  { id: 'longTermDebt', st: 'bs', label: 'Long-term debt' },
  { id: 'leaseLiabilities', st: 'bs', label: 'Lease liabilities', opt: true },
  { id: 'otherNoncurrentLiabilities', st: 'bs', label: 'Other non-current liabilities', opt: true },
  { id: 'totalLiabilities', st: 'bs', label: 'Total liabilities', derive: true },
  { id: 'minorityInterest', st: 'bs', label: 'Non-controlling (minority) interest', opt: true },
  { id: 'preferredEquity', st: 'bs', label: 'Preferred equity', opt: true },
  { id: 'equity', st: 'bs', label: "Shareholders' equity", derive: true },
  { id: 'retainedEarnings', st: 'bs', label: 'Retained earnings', opt: true },
  { id: 'cfo', st: 'cf', label: 'Operating cash flow' },
  { id: 'capex', st: 'cf', label: 'Capital expenditure', hint: 'Cash spent on property, plant, equipment and capitalised development, as a positive number.' },
  { id: 'investingCF', st: 'cf', label: 'Investing cash flow', opt: true },
  { id: 'financingCF', st: 'cf', label: 'Financing cash flow', opt: true },
  { id: 'nwcChange', st: 'cf', label: 'Change in working capital (cash effect)', opt: true, hint: 'As reported in the operating section: negative when working capital absorbed cash.' },
  { id: 'dividends', st: 'cf', label: 'Dividends paid', opt: true },
  { id: 'buybacks', st: 'cf', label: 'Share repurchases', opt: true },
  { id: 'fcf', st: 'cf', label: 'Free cash flow', derive: true },
];
export const FIELD = Object.fromEntries(FIELDS.map((f) => [f.id, f]));
export const label = (id) => FIELD[id]?.label || DERIVED_LABELS[id] || id;
const DERIVED_LABELS = { effectiveTax: 'Effective tax rate', debt: 'Total debt', nwc: 'Operating net working capital', netDebt: 'Net debt', investedCapital: 'Invested capital', marketCap: 'Market capitalisation', ev: 'Enterprise value' };

/** Fills what can be worked out from the lines given. Returns the completed period and how each derived line was made. */
export function derive(raw) {
  const p = { ...raw }, how = {};
  const has = (k) => fin(p[k]);
  const set = (k, v, why) => { if (!has(k) && fin(v)) { p[k] = v; how[k] = why; } };
  const sumIf = (...ks) => (ks.every(has) ? sum(ks.map((k) => p[k])) : NaN);
  if (fin(p.capex) && p.capex < 0) { p.capex = -p.capex; how.capex = 'entered as a negative outflow; its size is used'; }
  set('grossProfit', p.revenue - p.cogs, 'revenue − cost of goods sold');
  set('cogs', p.revenue - p.grossProfit, 'revenue − gross profit');
  set('ebitda', p.ebit + p.da, 'EBIT + D&A');
  set('ebitda', p.grossProfit - p.opex, 'gross profit − operating expenses');
  set('ebit', p.ebitda - p.da, 'EBITDA − D&A');
  set('da', p.ebitda - p.ebit, 'EBITDA − EBIT');
  set('opex', p.grossProfit - p.ebitda, 'gross profit − EBITDA');
  set('pretax', p.ebit - n0(p.interestExpense) + n0(p.interestIncome), 'EBIT − interest expense + interest and other income');
  set('tax', p.pretax - p.netIncome, 'pre-tax income − net income');
  set('netIncome', p.pretax - p.tax, 'pre-tax income − income tax');
  set('effectiveTax', has('tax') && has('pretax') && p.pretax > 0 ? p.tax / p.pretax : NaN, 'income tax ÷ pre-tax income');
  set('debt', sumIf('currentDebt', 'longTermDebt'), 'short-term + long-term debt');
  set('debt', p.longTermDebt, 'long-term debt (no short-term debt entered)');
  set('debt', p.currentDebt, 'short-term debt (no long-term debt entered)');
  set('currentAssets', sumIf('cash', 'receivables', 'inventory') + n0(p.shortTermInvestments) + n0(p.otherCurrentAssets), 'cash + short-term investments + receivables + inventory + other current assets');
  set('currentLiabilities', sumIf('payables') + n0(p.currentDebt) + n0(p.otherCurrentLiabilities), 'payables + short-term debt + other current liabilities');
  set('totalAssets', sumIf('currentAssets', 'ppeNet') + n0(p.goodwill) + n0(p.intangibles) + n0(p.otherNoncurrentAssets), 'current assets + PP&E + goodwill + intangibles + other non-current assets');
  set('totalLiabilities', sumIf('currentLiabilities', 'longTermDebt') + n0(p.leaseLiabilities) + n0(p.otherNoncurrentLiabilities), 'current liabilities + long-term debt + leases + other non-current liabilities');
  set('totalLiabilities', p.totalAssets - p.equity - n0(p.minorityInterest) - n0(p.preferredEquity), 'total assets − equity − minority interest − preferred equity');
  set('equity', p.totalAssets - p.totalLiabilities - n0(p.minorityInterest) - n0(p.preferredEquity), 'total assets − total liabilities − minority interest − preferred equity');
  set('totalAssets', p.totalLiabilities + p.equity + n0(p.minorityInterest) + n0(p.preferredEquity), 'total liabilities + equity + minority interest + preferred equity');
  if (['receivables', 'inventory', 'payables'].every(has)) set('nwc', p.receivables + p.inventory + n0(p.otherCurrentAssets) - p.payables - n0(p.otherCurrentLiabilities), 'receivables + inventory + other current assets − payables − other current liabilities');
  else if (['currentAssets', 'cash', 'currentLiabilities'].every(has)) set('nwc', p.currentAssets - p.cash - n0(p.shortTermInvestments) - (p.currentLiabilities - n0(p.currentDebt)), 'current assets without cash − current liabilities without debt');
  set('netDebt', p.debt - p.cash - n0(p.shortTermInvestments), 'debt − cash − short-term investments');
  set('investedCapital', p.debt + p.equity + n0(p.minorityInterest) + n0(p.preferredEquity) - p.cash - n0(p.shortTermInvestments), 'debt + equity + minority + preferred − cash');
  set('fcf', p.cfo - p.capex, 'operating cash flow − capital expenditure');
  set('fcf', p.ebit * (1 - clamp(n0(p.effectiveTax), 0, 0.5)) + p.da - p.capex, 'EBIT × (1 − tax rate) + D&A − capital expenditure (no cash-flow statement given)');
  set('eps', has('shares') && p.shares > 0 ? p.netIncome / p.shares : NaN, 'net income ÷ diluted shares');
  set('dps', has('shares') && p.shares > 0 && has('dividends') ? p.dividends / p.shares : NaN, 'dividends paid ÷ diluted shares');
  return { p, how };
}

/** Derived periods in year order. */
export function history(project) {
  return (project.history || []).filter((h) => Number.isInteger(h.year)).slice().sort((a, b) => a.year - b.year).map((raw) => ({ year: raw.year, raw, ...derive(raw) }));
}
export const latest = (project) => { const H = history(project); return H.length ? H[H.length - 1] : null; };

/** Market block with the derived capitalisation and enterprise value. */
export function market(project) {
  const m = { ...(project.market || {}) }, L = latest(project)?.p || {}, how = {};
  const shares = fin(m.sharesOutstanding) ? m.sharesOutstanding : L.shares;
  if (!fin(m.sharesOutstanding) && fin(L.shares)) how.sharesOutstanding = 'diluted shares of the latest year';
  m.sharesOutstanding = shares;
  if (!fin(m.marketCap) && fin(m.sharePrice) && fin(shares)) { m.marketCap = m.sharePrice * shares; how.marketCap = 'share price × shares outstanding'; }
  if (!fin(m.ev) && fin(m.marketCap) && fin(L.debt)) { m.ev = m.marketCap + L.debt + n0(L.minorityInterest) + n0(L.preferredEquity) - n0(L.cash) - n0(L.shortTermInvestments); how.ev = 'market capitalisation + debt + minority interest + preferred − cash and short-term investments'; }
  return { m, how };
}

// ================================================================ validation
const near = (a, b, tol = 0.005) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
/** Problems with the data: errors stop a model, warnings are shown beside it, infos disclose what the engine did. */
export function validate(project) {
  const out = [];
  const add = (level, text, where = null) => out.push({ level, text, where });
  const hist = (project.history || []);
  if (!hist.length) { add('error', 'No historical periods yet. Enter at least one fiscal year.'); return out; }
  const years = hist.map((h) => h.year);
  hist.forEach((h, i) => { if (!Number.isInteger(h.year)) add('error', `Period ${i + 1} has no fiscal year.`); });
  const dups = [...new Set(years.filter((y, i) => Number.isInteger(y) && years.indexOf(y) !== i))];
  if (dups.length) add('error', `Duplicate fiscal years: ${dups.join(', ')}. Each year may appear once.`);
  const sorted = years.filter(Number.isInteger).sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) if (sorted[i] - sorted[i - 1] > 1) add('warn', `No statements between ${sorted[i - 1]} and ${sorted[i]}. Growth across the gap is treated as one step, not annualised.`);
  const unit = project.meta?.unit || 1, unitName = project.meta?.unitLabel || 'units';
  const H = history(project);
  H.forEach(({ year: y, raw, p, how }) => {
    const rel = (k, v, text) => { if (fin(raw[k]) && fin(v) && !near(raw[k], v)) add('warn', `${y}: ${text}.`, k); };
    rel('grossProfit', raw.revenue - raw.cogs, 'gross profit does not equal revenue − cost of goods sold');
    if (fin(raw.ebitda) && fin(raw.ebit) && fin(raw.da)) rel('ebitda', raw.ebit + raw.da, 'EBITDA does not equal EBIT + D&A (if operating expenses include D&A, leave EBITDA blank)');
    if (fin(raw.pretax) && fin(raw.netIncome) && fin(raw.tax)) rel('netIncome', raw.pretax - raw.tax, 'net income does not equal pre-tax income − tax (discontinued operations or minority share?)');
    if (fin(raw.totalAssets) && fin(raw.totalLiabilities) && fin(raw.equity)) rel('totalAssets', raw.totalLiabilities + raw.equity + n0(raw.minorityInterest) + n0(raw.preferredEquity), 'total assets do not equal liabilities + equity (+ minority and preferred)');
    if (fin(raw.currentAssets) && fin(raw.totalAssets) && raw.currentAssets > raw.totalAssets * 1.001) add('warn', `${y}: current assets exceed total assets.`, 'currentAssets');
    if (fin(raw.currentLiabilities) && fin(raw.totalLiabilities) && raw.currentLiabilities > raw.totalLiabilities * 1.001) add('warn', `${y}: current liabilities exceed total liabilities.`, 'currentLiabilities');
    if (fin(raw.cash) && fin(raw.currentAssets) && raw.cash > raw.currentAssets * 1.001) add('warn', `${y}: cash exceeds current assets.`, 'cash');
    if (fin(raw.fcf) && fin(raw.cfo) && fin(raw.capex)) rel('fcf', raw.cfo - Math.abs(raw.capex), 'free cash flow does not equal operating cash flow − capital expenditure');
    if (fin(raw.revenue) && raw.revenue < 0) add('error', `${y}: revenue is negative.`, 'revenue');
    if (fin(raw.capex) && raw.capex < 0) add('info', `${y}: capital expenditure was entered as a negative outflow; the model uses its size.`, 'capex');
    if (fin(raw.shares) && raw.shares <= 0) add('error', `${y}: shares must be above zero.`, 'shares');
    if (unit >= 1e6 && fin(p.revenue) && p.revenue > 2e7) add('warn', `${y}: revenue of ${p.revenue.toLocaleString('en-US')} ${unitName} looks like whole currency units. Check the unit setting.`, 'revenue');
    if (fin(p.netIncome) && fin(p.revenue) && p.revenue > 0 && Math.abs(p.netIncome) > 1.5 * p.revenue) add('warn', `${y}: net income is more than 1.5× revenue. Check the figures.`, 'netIncome');
    if (fin(p.effectiveTax) && (p.effectiveTax < 0 || p.effectiveTax > 0.6)) add('warn', `${y}: effective tax rate of ${(p.effectiveTax * 100).toFixed(0)}% is outside the usual range; the forecast uses the rate you set, not this one.`, 'tax');
    Object.entries(how).forEach(([k, why]) => { if (k !== 'capex' && FIELD[k]) add('info', `${y}: ${label(k)} was derived as ${why}.`, k); });
  });
  for (let i = 1; i < H.length; i++) {
    const a = H[i - 1].p, b = H[i].p;
    if (['cfo', 'investingCF', 'financingCF'].every((k) => fin(b[k])) && fin(a.cash) && fin(b.cash)) {
      const flows = b.cfo + b.investingCF + b.financingCF, dCash = b.cash - a.cash;
      if (!near(flows, dCash, 0.03)) add('warn', `${b.year}: the three cash flows sum to ${flows.toLocaleString('en-US', { maximumFractionDigits: 1 })} but cash moved by ${dCash.toLocaleString('en-US', { maximumFractionDigits: 1 })} (exchange-rate effects, restricted cash outside the cash line, or a mismatch).`, 'cfo');
    }
  }
  return out;
}

/** What each model needs from the latest period and the market block; `missing` lists the gaps. */
export const REQUIRES = {
  dcf: { need: ['revenue', 'ebit', 'da', 'capex', 'nwc', 'debt', 'cash'], nice: ['sharesOutstanding', 'sharePrice', 'beta'] },
  fcfe: { need: ['revenue', 'ebit', 'da', 'capex', 'nwc', 'debt', 'interestExpense'], nice: ['sharesOutstanding', 'sharePrice', 'beta'] },
  comps: { need: ['revenue', 'ebitda', 'ebit', 'netIncome', 'debt', 'cash', 'sharesOutstanding'], nice: ['equity', 'fcf', 'sharePrice'] },
  ddm: { need: ['dividends', 'sharesOutstanding'], nice: ['sharePrice', 'beta'] },
  asset: { need: ['totalAssets', 'totalLiabilities', 'equity'], nice: ['goodwill', 'intangibles', 'sharesOutstanding'] },
  sotp: { need: ['debt', 'cash', 'sharesOutstanding'], nice: [] },
  earnings: { need: ['netIncome', 'ebit', 'sharesOutstanding'], nice: ['sharePrice'] },
  vc: { need: ['revenue'], nice: ['netIncome'] },
};
export function missingFor(project, model) {
  const L = latest(project)?.p || {}, { m } = market(project);
  const have = (k) => fin(L[k]) || fin(m[k]);
  const r = REQUIRES[model] || { need: [], nice: [] };
  return { missing: r.need.filter((k) => !have(k)), optional: r.nice.filter((k) => !have(k)) };
}

// ================================================================ historical analysis
/** Growth, margins, cash conversion and the ratio groups from ratios.js for every period. */
export function historical(project) {
  const H = history(project);
  return H.map((h, i) => {
    const p = h.p, prev = i ? H[i - 1].p : null;
    const div = (a, b) => (fin(a) && fin(b) && b !== 0 ? a / b : NaN);
    const growth = (k) => (prev && fin(p[k]) && fin(prev[k]) && prev[k] !== 0 ? (p[k] - prev[k]) / Math.abs(prev[k]) : NaN);
    const ratios = R.analyse({ ...p, operatingIncome: p.ebit, marketEquity: project.market?.marketCap }, prev);
    const nopat = fin(p.ebit) ? p.ebit * (1 - clamp(n0(p.effectiveTax), 0, 0.5)) : NaN;
    const ic = prev && fin(prev.investedCapital) ? (p.investedCapital + prev.investedCapital) / 2 : p.investedCapital;
    return {
      year: h.year, p, how: h.how,
      growth: { revenue: growth('revenue'), ebitda: growth('ebitda'), ebit: growth('ebit'), netIncome: growth('netIncome'), fcf: growth('fcf') },
      margins: { gross: div(p.grossProfit, p.revenue), ebitda: div(p.ebitda, p.revenue), ebit: div(p.ebit, p.revenue), net: div(p.netIncome, p.revenue), fcf: div(p.fcf, p.revenue) },
      drivers: { daPct: div(p.da, p.revenue), capexPct: div(p.capex, p.revenue), nwcPct: div(p.nwc, p.revenue), dNwc: prev && fin(p.nwc) && fin(prev.nwc) ? p.nwc - prev.nwc : NaN, taxRate: p.effectiveTax, cashConversion: div(p.cfo, p.netIncome), roic: div(nopat, ic), nopat },
      ratios,
    };
  });
}

// ================================================================ assumptions and forecast
export const LIMITS = { horizon: [3, 10], growth: [-0.5, 1], margin: [-0.5, 0.8], pct: [0, 0.6], tax: [0, 0.6], rate: [0, 0.4], gT: [-0.02, 0.06], multiple: [0, 60] };
const series = (n, v) => Array.from({ length: n }, (_, i) => (Array.isArray(v) ? (fin(v[i]) ? v[i] : v[v.length - 1]) : v));
const fade = (n, from, to) => Array.from({ length: n }, (_, i) => from + (to - from) * (n > 1 ? i / (n - 1) : 1));

/** Starting assumptions read from the history: growth fading from the historical CAGR to terminal growth, three-year
 *  average margins and drivers, the effective tax rate, and a CAPM cost of capital with reasoned market inputs. */
export function defaultAssumptions(project, { horizon = 5 } = {}) {
  const A = historical(project), L = A[A.length - 1], n = A.length;
  const last3 = A.slice(-3);
  const avg = (fn) => { const v = last3.map(fn).filter(fin); return v.length ? mean(v) : NaN; };
  const cagr = n >= 2 ? R.cagr(L.p.revenue, A[0].p.revenue, L.year - A[0].year) : null;   // years elapsed, so a gap in the statements does not inflate the rate
  const g0 = clamp(fin(cagr) ? cagr : 0.05, -0.1, 0.25), gT = 0.025;
  const margin = clamp(fin(avg((x) => x.margins.ebitda)) ? avg((x) => x.margins.ebitda) : 0.15, -0.5, 0.8);
  const daPct = clamp(fin(avg((x) => x.drivers.daPct)) ? avg((x) => x.drivers.daPct) : 0.04, 0, 0.6);
  const capexPct = clamp(fin(avg((x) => x.drivers.capexPct)) ? avg((x) => x.drivers.capexPct) : 0.05, 0, 0.6);
  const nwcPct = clamp(fin(L.drivers.nwcPct) ? L.drivers.nwcPct : 0.1, -0.5, 0.6);
  const tax = fin(avg((x) => x.drivers.taxRate)) ? clamp(avg((x) => x.drivers.taxRate), 0, 0.4) : 0.25;
  const kdObs = fin(L.p.interestExpense) && fin(L.p.debt) && L.p.debt > 0 ? L.p.interestExpense / L.p.debt : NaN;
  const mk = project.market || {};
  return {
    horizon,
    growth: fade(horizon, g0, gT), marginBasis: 'ebitda', margin: series(horizon, margin),
    daPct: series(horizon, daPct), capexPct: series(horizon, capexPct), nwcPct: series(horizon, nwcPct), taxRate: series(horizon, tax),
    taxLosses: 'none',
    terminal: { method: 'perpetuity', growth: gT, multiple: 8, multipleBasis: 'ebitda' },
    discount: { mode: 'build', rf: fin(mk.rf) ? mk.rf : 0.042, beta: fin(mk.beta) ? mk.beta : 1.0, erp: fin(mk.erp) ? mk.erp : 0.05, kd: fin(mk.kd) ? mk.kd : (fin(kdObs) ? clamp(kdObs, 0.02, 0.15) : 0.06), taxRate: tax, weights: 'market', targetDebtWeight: 0.2, direct: 0.09 },
    midYear: false,
    bridge: { includeLeases: false, nonOperatingAssets: 0, otherClaims: 0 },
    fcfe: { debtFunding: null },
  };
}

/** The cost of capital for the DCF: built from CAPM and the capital structure, or a rate entered directly. */
export function costOfCapitalFor(project, A) {
  const d = A.discount, L = latest(project)?.p || {}, { m } = market(project);
  if (d.mode === 'direct') {
    if (!fin(d.direct) || d.direct <= 0) return { error: 'Enter a discount rate above zero.' };
    return { wacc: d.direct, ke: d.ke ?? NaN, kdAfter: NaN, we: NaN, wd: NaN, how: 'entered directly' };
  }
  const debt = n0(L.debt) + (A.bridge?.includeLeases ? n0(L.leaseLiabilities) : 0);
  let E, D, how;
  if (d.weights === 'target') { D = clamp(d.targetDebtWeight, 0, 0.95); E = 1 - D; how = `target capital structure, ${Math.round(D * 100)}% debt`; }
  else if (fin(m.marketCap) && m.marketCap > 0) { E = m.marketCap; D = debt; how = 'market value of equity and book debt'; }
  else if (fin(L.equity) && L.equity > 0) { E = L.equity; D = debt; how = 'book equity (no share price) and book debt'; }
  else { E = 1; D = 0; how = 'all equity (no equity value available)'; }
  const w = costOfCapital({ rf: d.rf, beta: d.beta, erp: d.erp, kd: d.kd, tax: d.taxRate, equity: E, debt: D });
  if (w.error) return { error: w.error };
  return { ...w, how, E, D };
}

/** Year-by-year forecast of the operating lines and free cash flow to the firm and to equity. */
export function forecast(project, A) {
  const L = latest(project);
  if (!L) return { error: 'No historical period to forecast from.' };
  const p = L.p, N = clamp(Math.round(A.horizon), LIMITS.horizon[0], LIMITS.horizon[1]);
  const need = ['revenue'].filter((k) => !fin(p[k]));
  if (need.length) return { error: `The latest year needs ${need.map(label).join(', ')} before a forecast can start.` };
  const g = series(N, A.growth), mg = series(N, A.margin), da = series(N, A.daPct), cx = series(N, A.capexPct), nw = series(N, A.nwcPct), tx = series(N, A.taxRate);
  const cc = costOfCapitalFor(project, A);
  const debtW = fin(A.fcfe?.debtFunding) ? A.fcfe.debtFunding : (fin(cc.wd) ? cc.wd : 0);
  const rows = [];
  let rev = p.revenue, nwcPrev = fin(p.nwc) ? p.nwc : p.revenue * nw[0], debtPrev = n0(p.debt);
  const nwcStart = fin(p.nwc) ? 'latest balance sheet' : 'latest revenue × working-capital share (no balance sheet detail)';
  for (let t = 1; t <= N; t++) {
    rev *= 1 + g[t - 1];
    const daV = rev * da[t - 1];
    const ebitda = A.marginBasis === 'ebit' ? rev * mg[t - 1] + daV : rev * mg[t - 1];
    const ebit = ebitda - daV;
    const tax = (A.taxLosses === 'credit' ? ebit : Math.max(0, ebit)) * tx[t - 1];
    const nopat = ebit - tax;
    const capex = rev * cx[t - 1];
    const nwc = rev * nw[t - 1], dNwc = nwc - nwcPrev;
    const fcff = nopat + daV - capex - dNwc;
    const interest = n0(A.discount.kd) * debtPrev;
    const netBorrowing = debtW * (capex - daV + dNwc);
    const netIncome = (ebit - interest) - (A.taxLosses === 'credit' ? ebit - interest : Math.max(0, ebit - interest)) * tx[t - 1];
    const fcfe = netIncome + daV - capex - dNwc + netBorrowing;
    rows.push({ t, year: L.year + t, revenue: rev, growth: g[t - 1], ebitda, margin: ebitda / rev, da: daV, ebit, taxRate: tx[t - 1], tax, nopat, capex, nwc, dNwc, fcff, interest, netIncome, netBorrowing, fcfe, debt: debtPrev + netBorrowing });
    nwcPrev = nwc; debtPrev += netBorrowing;
  }
  return { rows, base: { year: L.year, revenue: p.revenue, ebitda: p.ebitda, ebit: p.ebit, da: p.da, capex: p.capex, nwc: nwcPrev === undefined ? NaN : (fin(p.nwc) ? p.nwc : p.revenue * nw[0]), fcff: p.fcf, netIncome: p.netIncome }, nwcStart, cc };
}

/** Converts an enterprise value into equity value and a value per share. */
export function equityBridge(project, A, ev) {
  const L = latest(project)?.p || {}, { m } = market(project), b = A.bridge || {};
  const debt = n0(L.debt), leases = b.includeLeases ? n0(L.leaseLiabilities) : 0;
  const cash = n0(L.cash) + n0(L.shortTermInvestments);
  const minority = n0(L.minorityInterest), preferred = n0(L.preferredEquity), other = n0(b.otherClaims), nonOp = n0(b.nonOperatingAssets);
  const equity = ev - debt - leases - preferred - minority - other + cash + nonOp;
  const shares = m.sharesOutstanding;
  return { ev, debt, leases, cash, minority, preferred, other, nonOp, equity, shares, perShare: fin(shares) && shares > 0 ? equity / shares : NaN, price: m.sharePrice, upside: fin(m.sharePrice) && m.sharePrice > 0 && fin(shares) && shares > 0 ? equity / shares / m.sharePrice - 1 : NaN };
}

// ================================================================ discounted cash flow (FCFF at WACC)
export function dcf(project, A) {
  const F = forecast(project, A);
  if (F.error) return F;
  const cc = costOfCapitalFor(project, A);
  if (cc.error) return cc;
  const r = cc.wacc, N = F.rows.length, T = A.terminal, warnings = [];
  const rows = F.rows.map((x) => { const e = A.midYear ? x.t - 0.5 : x.t; const df = (1 + r) ** -e; return { ...x, exponent: e, df, pv: x.fcff * df }; });
  const last = rows[N - 1];
  let tv, pvTV, tvHow, impliedMultiple = NaN, impliedGrowth = NaN, fcfN1 = NaN;
  if (T.method === 'exit') {
    const key = T.multipleBasis === 'ebit' ? 'ebit' : T.multipleBasis === 'revenue' ? 'revenue' : T.multipleBasis === 'fcf' ? 'fcff' : 'ebitda';
    if (!fin(T.multiple) || T.multiple < 0) return { error: 'Enter an exit multiple of zero or more.' };
    tv = last[key] * T.multiple;
    pvTV = tv / (1 + r) ** N;
    tvHow = `${T.multiple.toFixed(1)}× year-${N} ${key === 'fcff' ? 'free cash flow' : key.toUpperCase()}`;
    impliedGrowth = tv + last.fcff !== 0 ? (tv * r - last.fcff) / (tv + last.fcff) : NaN;
  } else {
    if (!fin(T.growth)) return { error: 'Enter a terminal growth rate.' };
    if (r <= T.growth) return { error: `The discount rate (${(r * 100).toFixed(2)}%) has to be above terminal growth (${(T.growth * 100).toFixed(2)}%), or the value of the years after the forecast has no finite answer.` };
    fcfN1 = last.fcff * (1 + T.growth);
    tv = fcfN1 / (r - T.growth);
    pvTV = tv / (1 + r) ** (A.midYear ? N - 0.5 : N);
    tvHow = `year-${N} free cash flow × (1 + ${(T.growth * 100).toFixed(1)}%) ÷ (${(r * 100).toFixed(2)}% − ${(T.growth * 100).toFixed(1)}%)`;
    impliedMultiple = fin(last.ebitda) && last.ebitda > 0 ? tv / last.ebitda : NaN;
  }
  const sumPv = sum(rows.map((x) => x.pv));
  const ev = sumPv + pvTV;
  const bridge = equityBridge(project, A, ev);
  const tvShare = ev !== 0 ? pvTV / ev : NaN;
  if (T.method !== 'exit' && last.fcff <= 0) warnings.push({ kind: 'bad', title: 'The final forecast year has negative free cash flow.', text: 'A perpetuity of losses is meaningless, so the terminal value is negative. Extend the horizon until cash flow turns positive, or use an exit multiple.' });
  if (fin(tvShare) && tvShare > 0.75) warnings.push({ kind: 'warn', title: `${Math.round(tvShare * 100)}% of enterprise value comes after the forecast.`, text: 'The answer leans on the terminal assumptions. Check the WACC × growth sensitivity before trusting the headline.' });
  if (T.method !== 'exit' && T.growth > 0.04) warnings.push({ kind: 'warn', title: 'Terminal growth above 4%.', text: 'Growing faster than the economy forever is hard to defend; long-run inflation plus real growth is the usual ceiling.' });
  if (T.method !== 'exit' && r - T.growth < 0.02) warnings.push({ kind: 'warn', title: 'WACC and terminal growth are within two points.', text: 'The perpetuity formula divides by their difference, so the value is extremely sensitive here.' });
  if (T.method === 'exit' && fin(impliedGrowth) && impliedGrowth > 0.05) warnings.push({ kind: 'warn', title: `The exit multiple implies ${(impliedGrowth * 100).toFixed(1)}% growth forever.`, text: 'Cross-check: an exit multiple is only as sensible as the perpetual growth it implies.' });
  if (rows.some((x) => x.growth > 0.3)) warnings.push({ kind: 'warn', title: 'Revenue growth above 30% in some years.', text: 'Few companies sustain this; make sure the history or the plan supports it.' });
  if (fin(bridge.equity) && bridge.equity < 0) warnings.push({ kind: 'bad', title: 'Equity value is negative.', text: 'Debt and other claims exceed the enterprise value. Shareholders would be worth nothing on these assumptions; check the bridge inputs and the forecast.' });
  if (fin(cc.wd) && cc.wd > 0.6) warnings.push({ kind: 'warn', title: 'Debt is over 60% of capital.', text: 'A WACC built on a heavy debt weight understates the cost of equity unless beta is relevered; consider a target structure.' });
  return { ok: true, model: 'dcf', rows, cc, r, N, tv, pvTV, tvHow, fcfN1, sumPv, ev, tvShare, impliedMultiple, impliedGrowth, ...bridge, warnings, forecast: F, assumptions: A };
}

/** Free cash flow to equity, discounted at the cost of equity. */
export function fcfe(project, A) {
  const F = forecast(project, A);
  if (F.error) return F;
  const cc = costOfCapitalFor(project, A);
  if (cc.error) return cc;
  const ke = A.discount.mode === 'direct' ? (fin(A.discount.ke) ? A.discount.ke : A.discount.direct) : cc.ke;
  const g = A.terminal.growth, N = F.rows.length;
  if (!fin(ke) || ke <= g) return { error: `The cost of equity (${(ke * 100).toFixed(2)}%) has to be above terminal growth (${(g * 100).toFixed(2)}%).` };
  const rows = F.rows.map((x) => { const e = A.midYear ? x.t - 0.5 : x.t; const df = (1 + ke) ** -e; return { ...x, df, pv: x.fcfe * df }; });
  const last = rows[N - 1];
  const tv = (last.fcfe * (1 + g)) / (ke - g), pvTV = tv / (1 + ke) ** (A.midYear ? N - 0.5 : N);
  const sumPv = sum(rows.map((x) => x.pv)), equity = sumPv + pvTV;
  const { m } = market(project), shares = m.sharesOutstanding;
  const warnings = [];
  if (last.fcfe <= 0) warnings.push({ kind: 'bad', title: 'Final-year free cash flow to equity is negative.', text: 'The terminal value is negative; extend the horizon or revisit the borrowing assumption.' });
  if (F.rows.some((x) => x.netBorrowing > x.capex)) warnings.push({ kind: 'warn', title: 'Net borrowing exceeds capital expenditure in some years.', text: 'The debt-funding share is high; equity holders are being paid out of new debt.' });
  return { ok: true, model: 'fcfe', rows, ke, tv, pvTV, sumPv, equity, shares, perShare: fin(shares) && shares > 0 ? equity / shares : NaN, price: m.sharePrice, upside: fin(m.sharePrice) && fin(shares) && shares > 0 ? equity / shares / m.sharePrice - 1 : NaN, debtFunding: fin(A.fcfe?.debtFunding) ? A.fcfe.debtFunding : cc.wd, warnings, forecast: F };
}

/** The simple FCF-growth DCF used by Finance › Valuation (one starting cash flow, a growth path, Gordon terminal value). */
export function fcfGrowthDcf({ fcf0, g1, years, path, wacc, gT, mid, debt, shares }) {
  if (![fcf0, g1, wacc, gT].every(Number.isFinite)) return { error: 'Fill in every cash-flow and discounting field.' };
  if (wacc <= gT) return { error: 'The cost of capital has to be higher than terminal growth. Otherwise the value of the years after the forecast has no finite answer.' };
  const rows = [];
  let fcf = fcf0;
  for (let t = 1; t <= years; t++) {
    const g = path === 'fade' ? g1 + (gT - g1) * ((t - 1) / Math.max(1, years - 1)) : g1;
    fcf *= 1 + g;
    const df = 1 / (1 + wacc) ** (mid ? t - 0.5 : t);
    rows.push({ t, g, fcf, df, pv: fcf * df });
  }
  const last = rows[rows.length - 1];
  const tv = (last.fcf * (1 + gT)) / (wacc - gT);
  const pvTV = tv / (1 + wacc) ** (mid ? years - 0.5 : years);
  const pvSum = rows.reduce((a, r) => a + r.pv, 0);
  const ev = pvSum + pvTV;
  const equity = ev - (Number.isFinite(debt) ? debt : 0);
  return { rows, tv, pvTV, pvSum, ev, equity, perShare: shares > 0 ? equity / shares : NaN, tvShare: pvTV / ev, multiple: tv / last.fcf };
}

// ================================================================ comparable companies
export const MULTIPLES = [
  { id: 'pe', name: 'P/E', num: 'marketCap', den: 'netIncome', basis: 'equity', what: 'price ÷ earnings per share, or market capitalisation ÷ net income' },
  { id: 'evEbitda', name: 'EV/EBITDA', num: 'ev', den: 'ebitda', basis: 'ev', what: 'enterprise value ÷ EBITDA' },
  { id: 'evEbit', name: 'EV/EBIT', num: 'ev', den: 'ebit', basis: 'ev', what: 'enterprise value ÷ EBIT' },
  { id: 'evRevenue', name: 'EV/Revenue', num: 'ev', den: 'revenue', basis: 'ev', what: 'enterprise value ÷ revenue' },
  { id: 'pb', name: 'P/B', num: 'marketCap', den: 'equity', basis: 'equity', what: 'market capitalisation ÷ book equity' },
  { id: 'pfcf', name: 'P/FCF', num: 'marketCap', den: 'fcf', basis: 'equity', what: 'market capitalisation ÷ free cash flow' },
];
/** A peer with its capitalisation and enterprise value filled in. */
export function derivePeer(raw) {
  const p = { ...raw };
  if (!fin(p.marketCap) && fin(p.price) && fin(p.shares)) p.marketCap = p.price * p.shares;
  if (!fin(p.ev) && fin(p.marketCap)) p.ev = p.marketCap + n0(p.debt) + n0(p.minorityInterest) + n0(p.preferredEquity) - n0(p.cash);
  if (!fin(p.fcf) && fin(p.cfo) && fin(p.capex)) p.fcf = p.cfo - Math.abs(p.capex);
  return p;
}
const stats = (vals) => {
  const v = vals.filter(fin);
  return { n: v.length, mean: mean(v), median: median(v), min: v.length ? Math.min(...v) : NaN, max: v.length ? Math.max(...v) : NaN, q1: quantile(v, 0.25), q3: quantile(v, 0.75) };
};
/** Peer multiples, their spread, and what each implies for the target. */
export function comparables(project, { peers = project.peers || [], use = MULTIPLES.map((x) => x.id), stat = 'median' } = {}) {
  const P = peers.filter((x) => x && x.name).map(derivePeer);
  if (!P.length) return { error: 'Add at least one comparable company.' };
  const L = latest(project)?.p || {}, { m } = market(project);
  const target = { ...L, marketCap: m.marketCap, ev: m.ev, sharesOutstanding: m.sharesOutstanding, netDebt: n0(L.debt) - n0(L.cash) - n0(L.shortTermInvestments), claims: n0(L.minorityInterest) + n0(L.preferredEquity) };
  const warnings = [];
  if (P.length < 3) warnings.push({ kind: 'warn', title: `Only ${P.length} peer${P.length === 1 ? '' : 's'}.`, text: 'Averages of fewer than three or four companies say more about the sample than the market; add peers of similar size, growth and margins.' });
  const table = MULTIPLES.filter((mu) => use.includes(mu.id)).map((mu) => {
    const values = P.map((p) => (fin(p[mu.num]) && fin(p[mu.den]) && p[mu.den] > 0 && p[mu.num] > 0 ? p[mu.num] / p[mu.den] : null));
    const st = stats(values.map((v) => (v === null ? NaN : v)));
    const tDen = target[mu.den];
    const own = fin(target[mu.num]) && fin(tDen) && tDen > 0 ? target[mu.num] / tDen : NaN;
    const implied = {};
    ['q1', 'median', 'mean', 'q3', 'min', 'max'].forEach((k) => {
      const mult = st[k];
      if (!fin(mult) || !fin(tDen) || tDen <= 0) { implied[k] = { value: NaN, equity: NaN, perShare: NaN }; return; }
      const value = mult * tDen;
      const equity = mu.basis === 'ev' ? value - target.netDebt - target.claims : value;
      implied[k] = { value, equity, perShare: fin(target.sharesOutstanding) && target.sharesOutstanding > 0 ? equity / target.sharesOutstanding : NaN };
    });
    const nm = fin(tDen) && tDen <= 0;
    if (nm) warnings.push({ kind: 'info', title: `${mu.name} is not meaningful for the target.`, text: `${label(mu.den)} is zero or negative, so this multiple cannot be applied.` });
    return { ...mu, values, stats: st, own, implied, nm, targetMetric: tDen };
  });
  const usable = table.filter((t) => !t.nm && fin(t.implied[stat].perShare));
  const range = usable.length ? { low: Math.min(...usable.map((t) => t.implied.q1.perShare).filter(fin)), high: Math.max(...usable.map((t) => t.implied.q3.perShare).filter(fin)), mid: median(usable.map((t) => t.implied[stat].perShare)) } : null;
  return { ok: true, model: 'comps', peers: P, table, target, range, stat, warnings };
}

// ================================================================ dividend discount models
/** Gordon growth: value = next year's dividend ÷ (cost of equity − growth). */
export function gordon({ d0, d1, g, ke }) {
  const next = fin(d1) ? d1 : (fin(d0) ? d0 * (1 + g) : NaN);
  if (!fin(next) || !fin(g) || !fin(ke)) return { error: 'Enter the dividend, its growth and the cost of equity.' };
  if (ke <= g) return { error: `The cost of equity (${(ke * 100).toFixed(2)}%) has to be above dividend growth (${(g * 100).toFixed(2)}%).` };
  return { ok: true, model: 'ddm', d1: next, value: next / (ke - g), payoutImplied: NaN };
}
/** Multi-stage: dividends grow at each stage's rate, then at the terminal rate forever (Gordon at the end of the last stage). */
export function multiStageDdm({ d0, stages = [], gT, ke, mid = false }) {
  if (!fin(d0) || !fin(gT) || !fin(ke)) return { error: 'Enter the latest dividend, terminal growth and the cost of equity.' };
  if (ke <= gT) return { error: `The cost of equity (${(ke * 100).toFixed(2)}%) has to be above terminal growth (${(gT * 100).toFixed(2)}%).` };
  const rows = []; let d = d0, t = 0;
  for (const s of stages) for (let i = 0; i < Math.max(0, Math.round(s.years)); i++) { t++; d *= 1 + s.growth; const e = mid ? t - 0.5 : t; const df = (1 + ke) ** -e; rows.push({ t, growth: s.growth, dividend: d, df, pv: d * df }); }
  const N = t, tv = (d * (1 + gT)) / (ke - gT), pvTV = tv / (1 + ke) ** (mid ? Math.max(0, N - 0.5) : N);
  const sumPv = sum(rows.map((x) => x.pv));
  return { ok: true, model: 'ddm', rows, N, tv, pvTV, sumPv, value: sumPv + pvTV, tvShare: (sumPv + pvTV) !== 0 ? pvTV / (sumPv + pvTV) : NaN };
}
/** The whole dividend module for a project: per-share dividends from the history, Gordon and multi-stage values. */
export function ddm(project, spec) {
  const L = latest(project)?.p || {}, { m } = market(project), H = history(project);
  const ke = fin(spec.ke) ? spec.ke : NaN;
  const dps = fin(spec.d0) ? spec.d0 : (fin(L.dividends) && fin(m.sharesOutstanding) && m.sharesOutstanding > 0 ? L.dividends / m.sharesOutstanding : NaN);
  if (!fin(dps) || dps <= 0) return { error: 'No dividend to discount. The dividend discount model needs a company that pays dividends; enter dividends paid in the history, or a dividend per share.' };
  const g = gordon({ d0: dps, g: spec.gT, ke });
  const ms = multiStageDdm({ d0: dps, stages: spec.stages || [{ years: 5, growth: spec.g1 }], gT: spec.gT, ke });
  const divs = H.map((h) => h.p.dividends).filter(fin);
  const histGrowth = divs.length >= 2 && divs[0] > 0 ? (divs[divs.length - 1] / divs[0]) ** (1 / (divs.length - 1)) - 1 : NaN;
  const payout = fin(L.dividends) && fin(L.netIncome) && L.netIncome > 0 ? L.dividends / L.netIncome : NaN;
  const warnings = [];
  if (fin(payout) && payout > 1) warnings.push({ kind: 'warn', title: 'Dividends exceed earnings.', text: 'A payout above 100% cannot last; the growth assumption should reflect that.' });
  if (fin(spec.g1) && fin(ke) && spec.g1 >= ke) warnings.push({ kind: 'info', title: 'Stage-one growth is at or above the cost of equity.', text: 'That is allowed for a limited stage, but only the terminal rate must stay below the cost of equity.' });
  return { ok: true, model: 'ddm', dps, ke, gordon: g, multi: ms, histGrowth, payout, price: m.sharePrice, upside: ms.ok && fin(m.sharePrice) && m.sharePrice > 0 ? ms.value / m.sharePrice - 1 : NaN, warnings };
}

// ================================================================ asset-based values
export const ASSET_LINES = ['cash', 'shortTermInvestments', 'receivables', 'inventory', 'otherCurrentAssets', 'ppeNet', 'goodwill', 'intangibles', 'otherNoncurrentAssets'];
export const RECOVERY = {
  orderly: { cash: 1, shortTermInvestments: 0.98, receivables: 0.85, inventory: 0.6, otherCurrentAssets: 0.5, ppeNet: 0.5, goodwill: 0, intangibles: 0.1, otherNoncurrentAssets: 0.4, residual: 0.4 },
  forced: { cash: 1, shortTermInvestments: 0.95, receivables: 0.65, inventory: 0.35, otherCurrentAssets: 0.25, ppeNet: 0.3, goodwill: 0, intangibles: 0.05, otherNoncurrentAssets: 0.2, residual: 0.2 },
};
/** Book value, tangible book value, an adjusted net asset value and liquidation scenarios. */
export function assetBased(project, { adjustments = {}, recovery = {}, costs = 0.05 } = {}) {
  const L = latest(project)?.p;
  if (!L) return { error: 'No balance sheet yet.' };
  if (![L.totalAssets, L.totalLiabilities, L.equity].every(fin)) return { error: 'The asset-based models need total assets, total liabilities and equity.' };
  const { m } = market(project), shares = m.sharesOutstanding;
  const lines = ASSET_LINES.map((k) => ({ id: k, label: label(k), book: n0(L[k]) }));
  const known = sum(lines.map((l) => l.book));
  const residual = L.totalAssets - known;
  if (Math.abs(residual) > 0.005 * Math.max(1, L.totalAssets)) lines.push({ id: 'residual', label: 'Other assets (total assets less the lines above)', book: residual });
  const claims = n0(L.minorityInterest) + n0(L.preferredEquity);
  const book = L.equity, tangible = L.equity - n0(L.goodwill) - n0(L.intangibles);
  const adjLines = lines.map((l) => ({ ...l, factor: 1 + n0(adjustments[l.id]), adjusted: l.book * (1 + n0(adjustments[l.id])) }));
  const liabFactor = 1 + n0(adjustments.liabilities);
  const adjustedNav = sum(adjLines.map((l) => l.adjusted)) - L.totalLiabilities * liabFactor - claims;
  const liq = (mode) => {
    const rec = { ...RECOVERY[mode], ...(recovery[mode] || {}) };
    const rows = lines.map((l) => ({ ...l, rate: fin(rec[l.id]) ? rec[l.id] : rec.residual, proceeds: l.book * (fin(rec[l.id]) ? rec[l.id] : rec.residual) }));
    const gross = sum(rows.map((r) => r.proceeds)), cost = gross * costs;
    const net = gross - cost - L.totalLiabilities - claims;
    return { mode, rows, gross, cost, net, perShare: fin(shares) && shares > 0 ? net / shares : NaN };
  };
  const per = (v) => (fin(shares) && shares > 0 ? v / shares : NaN);
  const warnings = [];
  if (fin(L.goodwill) && L.goodwill > 0.3 * L.totalAssets) warnings.push({ kind: 'info', title: 'Goodwill is a large share of assets.', text: 'Book value includes goodwill from past acquisitions, which has no value on its own in a liquidation; tangible book value strips it out.' });
  return { ok: true, model: 'asset', book, tangible, adjustedNav, lines: adjLines, liabilities: L.totalLiabilities, liabFactor, claims, orderly: liq('orderly'), forced: liq('forced'), costs, shares, perShare: { book: per(book), tangible: per(tangible), adjustedNav: per(adjustedNav) }, price: m.sharePrice, warnings };
}

// ================================================================ sum of the parts, earnings-based, venture capital
/** Each segment valued on its own multiple (or a value entered directly), less corporate costs, then the equity bridge. */
export function sotp(project, A, { segments = project.segments || [], corporate = project.corporate || { value: 0, multiple: 0 } } = {}) {
  const S = segments.filter((s) => s && s.name && fin(s.value));
  if (!S.length) return { error: 'Add at least one segment with a value.' };
  const rows = S.map((s) => ({ ...s, ev: s.metric === 'ev' ? s.value : s.value * n0(s.multiple), how: s.metric === 'ev' ? 'value entered' : `${s.metric.toUpperCase()} ${s.value.toLocaleString('en-US')} × ${n0(s.multiple)}` }));
  const corpEv = n0(corporate.value) * n0(corporate.multiple);
  const ev = sum(rows.map((r) => r.ev)) + corpEv;
  const bridge = equityBridge(project, A, ev);
  const L = latest(project)?.p || {};
  const blended = fin(L.ebitda) && L.ebitda > 0 ? ev / L.ebitda : NaN;
  return { ok: true, model: 'sotp', rows, corporate: { ...corporate, ev: corpEv }, ev, blended, ...bridge, warnings: [] };
}
/** Capitalised earnings, the earnings-power value (no-growth EBIT after tax at WACC) and a target P/E applied to earnings. */
export function earningsBased(project, A, { normalisedEarnings, capRate, pe, growth = 0 } = {}) {
  const L = latest(project)?.p, { m } = market(project);
  if (!L) return { error: 'No income statement yet.' };
  const cc = costOfCapitalFor(project, A);
  const ke = cc.error ? NaN : (A.discount.mode === 'direct' ? A.discount.direct : cc.ke), wacc = cc.error ? NaN : cc.wacc;
  const earnings = fin(normalisedEarnings) ? normalisedEarnings : L.netIncome;
  const shares = m.sharesOutstanding;
  const cap = fin(capRate) ? capRate : ke - growth;
  const warnings = [];
  if (!fin(earnings) || earnings <= 0) warnings.push({ kind: 'bad', title: 'Earnings are zero or negative.', text: 'Earnings-based values need positive, sustainable earnings; use a normalised figure or another model.' });
  const capitalised = fin(earnings) && fin(cap) && cap > 0 ? earnings / cap : NaN;
  const taxRate = series(1, A.taxRate)[0];
  const epvEv = fin(L.ebit) && fin(wacc) && wacc > 0 ? (L.ebit * (1 - taxRate)) / wacc : NaN;
  const epv = fin(epvEv) ? equityBridge(project, A, epvEv) : null;
  const peValue = fin(pe) && fin(earnings) ? pe * earnings : NaN;
  const per = (v) => (fin(shares) && shares > 0 ? v / shares : NaN);
  return { ok: true, model: 'earnings', earnings, capRate: cap, ke, wacc, capitalised, epvEv, epv, pe, peValue, shares, perShare: { capitalised: per(capitalised), epv: epv ? epv.perShare : NaN, pe: per(peValue) }, price: m.sharePrice, warnings };
}
/** The venture-capital method: a planned exit value discounted at the investor's target return. */
export function vcMethod({ exitYear, exitMetric, exitMultiple, targetReturn, investment, retention = 1 }) {
  if (![exitYear, exitMetric, exitMultiple, targetReturn].every(fin)) return { error: 'Enter the exit year, the exit-year metric, the multiple and the target return.' };
  if (exitYear <= 0 || targetReturn <= -1) return { error: 'The exit year must be positive and the target return above −100%.' };
  const exitValue = exitMetric * exitMultiple;
  const postMoney = exitValue / (1 + targetReturn) ** exitYear;
  const preMoney = fin(investment) ? postMoney - investment : NaN;
  const ownership = fin(investment) && postMoney > 0 ? investment / postMoney : NaN;
  const ownershipToday = fin(ownership) && retention > 0 ? ownership / retention : NaN;
  return { ok: true, model: 'vc', exitValue, postMoney, preMoney, ownership, ownershipToday, retention, warnings: [{ kind: 'info', title: 'Target returns of 30–60% a year are typical for early-stage investors.', text: 'They price in failure risk and illiquidity, not just the time value of money; this is why the method gives low values for young companies.' }] };
}

// ================================================================ sensitivity, scenarios, Monte Carlo
/** A grid of fn(row, col) over two assumption ranges. */
export function sensitivity(fn, rows, cols) {
  return { rows, cols, grid: rows.values.map((r) => cols.values.map((c) => fn(r, c))) };
}
export const DEFAULT_SCENARIOS = {
  bear: { name: 'Bear', deltas: { growth: -0.03, margin: -0.02, capexPct: 0.005, wacc: 0.01, gT: -0.005, exitMultiple: -1 }, weight: 0.25 },
  base: { name: 'Base', deltas: { growth: 0, margin: 0, capexPct: 0, wacc: 0, gT: 0, exitMultiple: 0 }, weight: 0.5 },
  bull: { name: 'Bull', deltas: { growth: 0.03, margin: 0.02, capexPct: -0.005, wacc: -0.01, gT: 0.005, exitMultiple: 1 }, weight: 0.25 },
};
const shift = (arr, d) => arr.map((v) => v + d);
/** Base assumptions shifted by scenario deltas (parallel shifts of the yearly series; WACC moves through the direct rate or the risk-free rate). */
export function applyDeltas(A, deltas = {}) {
  const d = { growth: 0, margin: 0, capexPct: 0, nwcPct: 0, wacc: 0, gT: 0, exitMultiple: 0, kd: 0, ...deltas };
  const N = A.horizon;
  const disc = { ...A.discount };
  if (disc.mode === 'direct') disc.direct += d.wacc; else { disc.rf += d.wacc; disc.kd += d.kd; }
  return { ...A, growth: shift(series(N, A.growth), d.growth), margin: shift(series(N, A.margin), d.margin), capexPct: shift(series(N, A.capexPct), d.capexPct).map((v) => Math.max(0, v)), nwcPct: shift(series(N, A.nwcPct), d.nwcPct), discount: disc, terminal: { ...A.terminal, growth: A.terminal.growth + d.gT, multiple: Math.max(0, A.terminal.multiple + d.exitMultiple) } };
}
/** Bear, base and bull valuations, each with the risk effects assigned to it, and the probability-weighted value. */
export function runScenarios(project, A, scenarios = DEFAULT_SCENARIOS, risks = []) {
  const out = {};
  for (const [key, sc] of Object.entries(scenarios)) {
    const re = riskEffects(risks, key);
    const deltas = { ...sc.deltas };
    for (const k of Object.keys(re.deltas)) deltas[k] = n0(deltas[k]) + re.deltas[k];
    const Ai = applyDeltas(A, deltas);
    out[key] = { key, name: sc.name, weight: sc.weight, deltas, risk: re, A: Ai, result: dcf(project, Ai) };
  }
  const ok = Object.values(out).filter((s) => s.result.ok && fin(s.result.perShare));
  const wsum = sum(ok.map((s) => n0(s.weight)));
  const weighted = ok.length && wsum > 0 ? sum(ok.map((s) => s.result.perShare * n0(s.weight))) / wsum : NaN;
  const weightedEquity = ok.length && wsum > 0 ? sum(ok.map((s) => s.result.equity * n0(s.weight))) / wsum : NaN;
  return { scenarios: out, weighted, weightedEquity, wsum };
}
/** Draws from a triangular distribution. */
export const triangular = (u, lo, mode, hi) => { const f = (mode - lo) / (hi - lo); return u < f ? lo + Math.sqrt(u * (hi - lo) * (mode - lo)) : hi - Math.sqrt((1 - u) * (hi - lo) * (hi - mode)); };
export const DEFAULT_MC = { n: 2000, seed: 7, growth: { sd: 0.02 }, margin: { sd: 0.015 }, wacc: { sd: 0.0075 }, gT: { lo: -0.01, mode: 0, hi: 0.01 }, rho: 0.4 };
/** Monte Carlo on four assumptions: normal shifts of growth and margin (correlated by rho), a normal shift of WACC and a
 *  triangular shift of terminal growth. Each draw is a parallel shift applied to every forecast year. */
export function monteCarlo(project, A, spec = DEFAULT_MC) {
  const s = { ...DEFAULT_MC, ...spec };
  const rand = mulberry32(s.seed), N = normalGen(rand);
  const out = [], evs = [];
  let failed = 0;
  for (let i = 0; i < s.n; i++) {
    const z1 = N(), z2 = N();
    const dg = z1 * s.growth.sd, dm = (s.rho * z1 + Math.sqrt(1 - s.rho * s.rho) * z2) * s.margin.sd;
    const dw = N() * s.wacc.sd, dt = triangular(rand(), s.gT.lo, s.gT.mode, s.gT.hi);
    const r = dcf(project, applyDeltas(A, { growth: dg, margin: dm, wacc: dw, gT: dt }));
    if (!r.ok || !fin(r.perShare)) { failed++; continue; }
    out.push(r.perShare); evs.push(r.ev);
  }
  if (!out.length) return { error: 'No simulated run produced a value: the base case probably fails (WACC below terminal growth in some draws).' };
  const sorted = out.slice().sort((a, b) => a - b);
  const pct = (q) => quantile(sorted, q);
  const { m } = market(project);
  const price = m.sharePrice;
  const nb = 24, lo = sorted[0], hi = sorted[sorted.length - 1], w = (hi - lo) / nb || 1;
  const bins = Array.from({ length: nb }, (_, k) => ({ x0: lo + k * w, x1: lo + (k + 1) * w, count: 0 }));
  sorted.forEach((v) => { bins[Math.min(nb - 1, Math.floor((v - lo) / w))].count++; });
  return { ok: true, n: out.length, failed, spec: s, values: sorted, p5: pct(0.05), p25: pct(0.25), p50: pct(0.5), p75: pct(0.75), p95: pct(0.95), mean: mean(out), sd: Math.sqrt(mean(out.map((v) => (v - mean(out)) ** 2))), belowPrice: fin(price) ? sorted.filter((v) => v < price).length / sorted.length : NaN, bins, price };
}

/** One-at-a-time sensitivity for a tornado chart: each driver moved down and up by a stated step, the rest held. */
export const TORNADO = [
  { key: 'wacc', label: 'Discount rate (WACC)', delta: 0.01, step: '±1 pt' }, { key: 'gT', label: 'Terminal growth', delta: 0.005, step: '±0.5 pt' },
  { key: 'margin', label: 'EBITDA margin', delta: 0.02, step: '±2 pts' }, { key: 'growth', label: 'Revenue growth, every year', delta: 0.02, step: '±2 pts' },
  { key: 'capexPct', label: 'Capex as % of revenue', delta: 0.01, step: '±1 pt' }, { key: 'nwcPct', label: 'Working capital as % of revenue', delta: 0.02, step: '±2 pts' },
];
export function tornado(project, A, spec = TORNADO) {
  const base = dcf(project, A);
  if (!base.ok) return base;
  const perShare = fin(base.perShare), val = (r) => (r.ok ? (perShare ? r.perShare : r.equity) : NaN);
  const rows = spec.map((d) => { const low = val(dcf(project, applyDeltas(A, { [d.key]: -d.delta }))), high = val(dcf(project, applyDeltas(A, { [d.key]: d.delta }))); return { ...d, low, high, range: Math.abs(high - low) }; })
    .filter((r) => fin(r.low) && fin(r.high)).sort((x, y) => y.range - x.range);
  return { ok: true, base: val(base), perShare, rows };
}

// ================================================================ model selection guide
export const MODELS = {
  dcf: { name: 'Discounted cash flow (FCFF at WACC)', short: 'DCF' },
  comps: { name: 'Comparable companies', short: 'Comparables' },
  ddm: { name: 'Dividend discount', short: 'Dividends' },
  asset: { name: 'Asset-based', short: 'Assets' },
  fcfe: { name: 'Free cash flow to equity', short: 'FCFE' },
  sotp: { name: 'Sum of the parts', short: 'SOTP' },
  earnings: { name: 'Earnings-based', short: 'Earnings' },
  vc: { name: 'Venture-capital method', short: 'VC method' },
};
export const INDUSTRIES = [
  { id: 'general', name: 'General: industrial, consumer, services' },
  { id: 'software', name: 'Software and technology' },
  { id: 'healthcare', name: 'Healthcare and pharmaceuticals' },
  { id: 'energy', name: 'Energy, mining and materials' },
  { id: 'utility', name: 'Utility or infrastructure' },
  { id: 'bank', name: 'Bank' },
  { id: 'insurer', name: 'Insurer' },
  { id: 'reit', name: 'Real estate (REIT or property company)' },
  { id: 'holding', name: 'Conglomerate or holding company' },
  { id: 'startup', name: 'Start-up or pre-profit growth company' },
];
export const MATURITY = [{ id: 'startup', name: 'Start-up (pre-profit)' }, { id: 'growth', name: 'Growth' }, { id: 'mature', name: 'Mature' }, { id: 'declining', name: 'Declining or distressed' }];
/** Which models fit a company, with the reason. profile: { industry, maturity, profitable, fcfPositive, paysDividends, hasPeers, years, segments }. */
export function modelGuide(profile) {
  const P = { industry: 'general', maturity: 'mature', profitable: true, fcfPositive: true, paysDividends: false, hasPeers: true, years: 3, segments: false, ...profile };
  const fin$ = P.industry === 'bank' || P.industry === 'insurer';
  const g = {};
  const put = (id, fit, why) => { g[id] = { fit, why }; };
  // DCF (FCFF)
  if (fin$) put('dcf', 'unsuitable', 'For a bank or insurer, debt is raw material rather than financing and capital expenditure and working capital have no clear meaning, so free cash flow to the firm and WACC are not defined. Value the equity directly: dividends, free cash flow to equity after regulatory capital, or price-to-book against return on equity.');
  else if (P.industry === 'holding') put('dcf', 'caution', 'A holding company is best valued part by part (sum of the parts); a single consolidated DCF hides the segments’ different risks and growth.');
  else if (P.maturity === 'startup' || !P.fcfPositive) put('dcf', 'caution', 'Negative free cash flow today means the whole value sits in a distant terminal value, so the DCF is extremely sensitive to growth and the discount rate. Use a long horizon with an explicit path to profit, and read the result as one scenario among several.');
  else if (P.years < 2) put('dcf', 'usable', 'With only one year of history the forecast drivers rest on judgement rather than a trend; document where each assumption comes from.');
  else put('dcf', 'recommended', 'Positive, forecastable cash flows and a stable business: the standard case for discounting free cash flow to the firm at the weighted average cost of capital.');
  // comparables
  if (!P.hasPeers) put('comps', 'usable', 'No peers entered yet. Add listed companies of similar size, growth, margins and risk; the multiples are only as good as the match.');
  else if (!P.profitable) put('comps', 'caution', 'With losses, earnings multiples (P/E, EV/EBIT) are not meaningful; EV/Revenue and, for a bank, P/B remain usable but say nothing about profitability.');
  else put('comps', 'recommended', 'Market prices of similar companies give a cross-check on the DCF and the range the market pays today.');
  // dividend discount
  if (!P.paysDividends) put('ddm', 'unsuitable', 'No dividends to discount: the model would give zero. It suits mature payers whose dividends track their capacity to pay, and banks and utilities in particular.');
  else if (fin$ || P.industry === 'utility') put('ddm', 'recommended', 'Regulated or capital-constrained businesses that pay out most of their earnings are the natural home of dividend models.');
  else if (P.maturity === 'growth' || P.maturity === 'startup') put('ddm', 'caution', 'Dividends are small relative to earnings and will change as the company matures; a multi-stage model with an explicit payout path is needed, and the result will lean on the terminal stage.');
  else put('ddm', 'usable', 'A mature dividend payer; check that dividends are close to what the company could pay (free cash flow to equity), or the model undervalues retained cash.');
  // asset-based
  if (P.industry === 'reit' || P.industry === 'holding') put('asset', 'recommended', 'Property companies and holding companies are collections of assets whose market values can be estimated line by line; net asset value is the standard measure.');
  else if (P.maturity === 'declining' || !P.profitable) put('asset', 'recommended', 'When earnings are weak or negative, what the assets would fetch sets a floor; the liquidation scenarios show it.');
  else if (P.industry === 'software' || P.industry === 'healthcare') put('asset', 'caution', 'The value of a software or research business lies in people, code and brands that the balance sheet does not carry, so book and liquidation values understate it badly; useful only as a floor.');
  else put('asset', 'usable', 'A floor rather than a target: book value records past costs, not the earning power of the assets.');
  // FCFE
  if (fin$) put('fcfe', 'caution', 'Free cash flow to equity can be defined for a bank as net income less the increase in regulatory capital, but the studio’s FCFE forecast uses capital expenditure and working capital, which do not apply.');
  else if (P.maturity === 'startup' || !P.fcfPositive) put('fcfe', 'caution', 'Negative cash flow makes the equity model as fragile as the firm model, and the borrowing assumption adds another lever.');
  else put('fcfe', 'usable', 'Values equity directly at the cost of equity; it should agree with the DCF when leverage is stable. Use it when the capital structure is changing or debt is hard to value.');
  // SOTP
  if (P.segments || P.industry === 'holding') put('sotp', 'recommended', 'Segments with different growth, margins and risk deserve their own multiples; one blended multiple would mis-price them.');
  else put('sotp', 'usable', 'Only worth doing when segment figures are disclosed and the parts differ materially.');
  // earnings-based
  if (!P.profitable) put('earnings', 'unsuitable', 'There are no positive earnings to capitalise.');
  else if (P.maturity === 'mature') put('earnings', 'usable', 'Capitalised earnings and earnings-power value suit a steady business; they ignore growth, so they are a floor for a growing one.');
  else put('earnings', 'caution', 'Capitalising current earnings misses growth (or decline); use it only as a cross-check.');
  // VC method
  if (P.maturity === 'startup' || P.industry === 'startup') put('vc', 'recommended', 'For a young company the question is what an exit could be worth and what return the investor needs; the venture-capital method asks exactly that.');
  else put('vc', 'caution', 'Built for pre-profit companies with a planned exit; for an established business it reduces to an exit multiple discounted at an arbitrary rate.');
  const order = ['recommended', 'usable', 'caution', 'unsuitable'];
  return Object.entries(g).map(([id, v]) => ({ id, ...MODELS[id], ...v })).sort((a, b) => order.indexOf(a.fit) - order.indexOf(b.fit));
}
/** A profile read from the data, for the guide's defaults. */
export function profileOf(project) {
  const L = latest(project)?.p || {}, H = history(project);
  return {
    industry: project.meta?.industry || 'general', maturity: project.meta?.maturity || 'mature',
    profitable: fin(L.netIncome) ? L.netIncome > 0 : true, fcfPositive: fin(L.fcf) ? L.fcf > 0 : true,
    paysDividends: fin(L.dividends) && L.dividends > 0, hasPeers: (project.peers || []).filter((p) => p && p.name).length > 0, years: H.length, segments: (project.segments || []).length > 1,
  };
}

// ================================================================ risk register
/** The catalogue users pick from. `effect` is a suggested, editable change to the forecast assumptions (fractions:
 *  growth and margin in points of revenue, capexPct in points of revenue, kd in points of the cost of debt). */
export const RISK_CATALOG = [
  { id: 'financial', name: 'Financial', items: [
    { id: 'leverage', name: 'Debt and leverage', desc: 'High debt relative to earnings leaves little room for a weak year and raises the cost of new borrowing.', effect: { kd: 0.01, growth: -0.005 } },
    { id: 'liquidity', name: 'Liquidity', desc: 'Thin cash and undrawn facilities against near-term obligations.', effect: { nwcPct: 0.01, kd: 0.005 } },
    { id: 'interest', name: 'Interest-rate exposure', desc: 'Floating-rate debt or refinancing due when rates are higher.', effect: { kd: 0.01 } },
    { id: 'fx', name: 'Foreign-exchange exposure', desc: 'Revenues and costs in different currencies, or translation of overseas earnings.', effect: { margin: -0.01 } },
    { id: 'refinancing', name: 'Refinancing risk', desc: 'Large maturities that must be rolled over in uncertain markets.', effect: { kd: 0.015 } },
    { id: 'cashflow', name: 'Cash-flow instability', desc: 'Lumpy or seasonal cash generation that complicates servicing fixed obligations.', effect: { nwcPct: 0.01 } },
  ] },
  { id: 'operational', name: 'Operational', items: [
    { id: 'supply', name: 'Supply-chain disruption', desc: 'Interruptions to inputs or logistics that stop production or raise costs.', effect: { margin: -0.015, nwcPct: 0.01 } },
    { id: 'supplier', name: 'Supplier concentration', desc: 'A few suppliers account for most inputs, with pricing power over the company.', effect: { margin: -0.01 } },
    { id: 'labour', name: 'Labour costs and availability', desc: 'Wage inflation, skills shortages or industrial action.', effect: { margin: -0.01 } },
    { id: 'inefficiency', name: 'Operational inefficiency', desc: 'Costs running ahead of peers; projects and integrations that overrun.', effect: { margin: -0.01, capexPct: 0.005 } },
    { id: 'technology', name: 'Technology failure or cyber incident', desc: 'Outages, data loss or breaches that disrupt operations and trust.', effect: { margin: -0.005, capexPct: 0.005 } },
  ] },
  { id: 'market', name: 'Market', items: [
    { id: 'competition', name: 'Competition', desc: 'New entrants or price competition eroding share and margins.', effect: { growth: -0.02, margin: -0.01 } },
    { id: 'demand', name: 'Demand changes', desc: 'Shifts in customer preferences or spending power.', effect: { growth: -0.02 } },
    { id: 'saturation', name: 'Market saturation', desc: 'The core market approaching its ceiling; growth must come from new products or regions.', effect: { growth: -0.015 } },
    { id: 'commodity', name: 'Commodity prices', desc: 'Input costs that swing with raw-material markets.', effect: { margin: -0.015 } },
    { id: 'customer', name: 'Customer concentration', desc: 'A few customers account for a large share of revenue.', effect: { growth: -0.01, margin: -0.005 } },
  ] },
  { id: 'strategic', name: 'Strategic', items: [
    { id: 'management', name: 'Management quality and succession', desc: 'Key-person dependence, weak governance or poor capital allocation.', effect: { growth: -0.005, margin: -0.005 } },
    { id: 'model', name: 'Business-model sustainability', desc: 'Whether the way the company earns money can last as conditions change.', effect: { growth: -0.01, margin: -0.01 } },
    { id: 'disruption', name: 'Technological disruption', desc: 'A new technology or channel making the product or process obsolete.', effect: { growth: -0.02, capexPct: 0.01 } },
    { id: 'product', name: 'Product concentration', desc: 'Dependence on one product, patent or franchise.', effect: { growth: -0.015 } },
    { id: 'moat', name: 'Erosion of competitive advantage', desc: 'Brand, cost or network advantages weakening over time.', effect: { margin: -0.01 } },
  ] },
  { id: 'external', name: 'External', items: [
    { id: 'regulation', name: 'Regulatory change', desc: 'New rules, taxes or licence conditions affecting costs or permitted activities.', effect: { margin: -0.01, capexPct: 0.005 } },
    { id: 'geopolitics', name: 'Geopolitical developments', desc: 'Trade barriers, sanctions or conflict affecting markets and supply.', effect: { growth: -0.01, margin: -0.005 } },
    { id: 'inflation', name: 'Inflation', desc: 'Costs rising faster than prices can be raised.', effect: { margin: -0.01 } },
    { id: 'recession', name: 'Economic recession', desc: 'A downturn in the company’s markets.', effect: { growth: -0.03, margin: -0.01 } },
    { id: 'climate', name: 'Climate and environmental exposure', desc: 'Physical risks to assets and transition costs from decarbonisation.', effect: { capexPct: 0.01, margin: -0.005 } },
  ] },
];
export const RISK_ITEM = Object.fromEntries(RISK_CATALOG.flatMap((c) => c.items.map((i) => [i.id, { ...i, category: c.id, categoryName: c.name }])));
export const HORIZONS = [{ id: 'short', name: 'Within a year' }, { id: 'medium', name: '1 to 3 years' }, { id: 'long', name: 'Beyond 3 years' }];
/** A new register entry from the catalogue. */
export function newRisk(itemId, over = {}) {
  const it = RISK_ITEM[itemId];
  return { id: `${itemId}-${Math.random().toString(36).slice(2, 7)}`, item: itemId, category: it?.category || 'other', name: it?.name || itemId, description: it?.desc || '', likelihood: 3, severity: 3, horizon: 'medium', exposure: null, mitigation: '', evidence: '', effect: { ...(it?.effect || {}) }, applyTo: 'bear', ...over };
}
export const riskScore = (r) => n0(r.likelihood) * n0(r.severity);
export const riskBand = (score) => (score >= 15 ? 'high' : score >= 8 ? 'medium' : 'low');
/** The 5 × 5 probability-impact matrix: cells hold the risks at that likelihood and severity. */
export function riskMatrix(risks) {
  const cells = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => []));
  risks.forEach((r) => { const l = clamp(Math.round(n0(r.likelihood)), 1, 5), s = clamp(Math.round(n0(r.severity)), 1, 5); cells[5 - l][s - 1].push(r); });
  return cells;
}
/** Summed assumption changes from the risks assigned to a scenario, and the double-counting checks. */
export function riskEffects(risks, scenario) {
  const deltas = {}, contributors = [], flags = [];
  risks.filter((r) => r.applyTo === scenario).forEach((r) => {
    const e = r.effect || {};
    const used = Object.entries(e).filter(([k, v]) => fin(v) && v !== 0 && ['growth', 'margin', 'capexPct', 'nwcPct', 'kd'].includes(k));
    used.forEach(([k, v]) => { deltas[k] = n0(deltas[k]) + v; });
    if (Object.keys(e).some((k) => k === 'wacc' || k === 'beta')) flags.push(`${r.name}: a change to WACC or beta was ignored. Risks enter through cash flows and the cost of debt, not an added premium.`);
    contributors.push({ id: r.id, name: r.name, score: riskScore(r), effect: Object.fromEntries(used) });
  });
  const total = Object.values(deltas).reduce((a, v) => a + Math.abs(v), 0);
  if (n0(deltas.growth) < -0.08) flags.push('The combined growth effect is below −8 points a year: several risks may describe the same downturn.');
  if (n0(deltas.margin) < -0.06) flags.push('The combined margin effect is below −6 points: check the risks are not counting the same cost pressure twice.');
  return { deltas, contributors, flags, total };
}

// ================================================================ bringing the methods together
/** Every enabled model at once, plus the football-field ranges. */
export function valueAll(project, A, opts = {}) {
  const models = project.models || {};
  const out = {};
  if (models.dcf !== false) out.dcf = dcf(project, A);
  if (models.fcfe) out.fcfe = fcfe(project, A);
  if (models.comps) out.comps = comparables(project, opts.comps || {});
  if (models.ddm) {
    const sp = { ...(project.ddm || {}) }, cc = costOfCapitalFor(project, A);
    if (!fin(sp.ke)) sp.ke = A.discount.mode === 'direct' ? (fin(A.discount.ke) ? A.discount.ke : A.discount.direct) : cc.ke;
    if (!fin(sp.gT)) sp.gT = A.terminal.growth;
    if (!fin(sp.g1)) sp.g1 = 0.05;
    if (!sp.stages) sp.stages = [{ years: fin(sp.years) ? sp.years : 5, growth: sp.g1 }];
    out.ddm = ddm(project, sp);
  }
  if (models.asset) out.asset = assetBased(project, project.assetOpts || {});
  if (models.sotp) out.sotp = sotp(project, A, {});
  if (models.earnings) out.earnings = earningsBased(project, A, project.earningsOpts || {});
  if (models.vc) out.vc = vcMethod(project.vc || {});
  const scen = models.dcf !== false ? runScenarios(project, A, project.scenarios || DEFAULT_SCENARIOS, project.risks || []) : null;
  return { results: out, scenarios: scen, football: footballField(project, A, out, scen) };
}
/** Ranges for the football-field chart: one bar per method, per share. */
export function footballField(project, A, results, scen) {
  const bars = [];
  const add = (label, low, high, mid, group) => { if ([low, high].every(fin)) bars.push({ label, low: Math.min(low, high), high: Math.max(low, high), mid: fin(mid) ? mid : (low + high) / 2, group }); };
  const d = results.dcf;
  if (d?.ok) {
    const vals = [];
    [-0.01, 0, 0.01].forEach((dw) => [-0.005, 0, 0.005].forEach((dg) => { const r = dcf(project, applyDeltas(A, { wacc: dw, gT: dg })); if (r.ok && fin(r.perShare)) vals.push(r.perShare); }));
    if (vals.length) add('DCF (WACC ±1 pt, growth ±0.5 pt)', Math.min(...vals), Math.max(...vals), d.perShare, 'dcf');
  }
  if (scen) { const s = Object.values(scen.scenarios).filter((x) => x.result.ok && fin(x.result.perShare)); if (s.length) add('Scenarios (bear to bull)', Math.min(...s.map((x) => x.result.perShare)), Math.max(...s.map((x) => x.result.perShare)), scen.weighted, 'scenario'); }
  if (results.fcfe?.ok) add('FCFE at the cost of equity', results.fcfe.perShare * 0.9, results.fcfe.perShare * 1.1, results.fcfe.perShare, 'fcfe');
  if (results.comps?.ok) results.comps.table.filter((t) => !t.nm && fin(t.implied.q1.perShare)).forEach((t) => add(`${t.name} (peer 25th–75th)`, t.implied.q1.perShare, t.implied.q3.perShare, t.implied.median.perShare, 'comps'));
  if (results.ddm?.ok) { const g = results.ddm.gordon.ok ? results.ddm.gordon.value : NaN, mv = results.ddm.multi.ok ? results.ddm.multi.value : NaN; if (fin(g) || fin(mv)) add('Dividend models', fin(g) ? g : mv, fin(mv) ? mv : g, mv, 'ddm'); }
  if (results.asset?.ok) { const a = results.asset; add('Asset-based (forced sale to adjusted NAV)', a.forced.perShare, a.perShare.adjustedNav, a.perShare.book, 'asset'); }
  if (results.sotp?.ok) add('Sum of the parts', results.sotp.perShare * 0.9, results.sotp.perShare * 1.1, results.sotp.perShare, 'sotp');
  if (results.earnings?.ok) { const e = results.earnings.perShare; const v = [e.capitalised, e.epv, e.pe].filter(fin); if (v.length) add('Earnings-based', Math.min(...v), Math.max(...v), e.epv, 'earnings'); }
  return bars;
}
