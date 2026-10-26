// ratios.js — financial statement analysis: growth, common-size statements, liquidity, solvency, efficiency,
// profitability, DuPont, cash-flow quality and distress scores. Pure functions on plain objects, shared by the F03
// lessons, widgets and tools/study-check.mjs. No DOM.
//
// A period's figures are a plain object (any field may be missing; ratios that need it return null):
//   revenue, cogs, grossProfit, operatingIncome, ebit, interestExpense, pretax, tax, netIncome, da,
//   cash, shortTermInvestments, receivables (net), inventory, currentAssets, ppeNet, totalAssets,
//   payables, currentLiabilities, totalLiabilities, debt (interest-bearing, current + noncurrent),
//   leaseLiabilities (operating, current + noncurrent), equity, retainedEarnings, marketEquity,
//   cfo, capex (a positive number: cash spent), dividends, purchases, months (length of the period, default 12),
//   creditSales (sales on credit, for receivables days), cogsGoods (cost of the goods sold, for inventory days, when cost
//   of sales also holds services), leaseInterest and leaseCost (operating leases: the interest inside the lease cost, and
//   the whole cost), used when leases are counted as debt
// Ratios that divide a flow by a stock use the average of the opening and closing stock when the prior period is
// given (`prev`), and the closing stock otherwise; `basis` in each result says which.

const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
const div = (a, b) => (num(a) === null || num(b) === null || b === 0 ? null : a / b);
const sub = (a, b) => (num(a) === null || num(b) === null ? null : a - b);
const add = (...xs) => (xs.every((x) => num(x) !== null) ? xs.reduce((s, x) => s + x, 0) : null);

/** The period's length in days: 365 for a year, months × 365 / 12 otherwise. */
export const days = (p) => (p?.months ?? 12) * 365 / 12;

/** Average of opening and closing; the closing value when there is no opening. */
export function avg(cur, prev, key) {
  const c = num(cur?.[key]), o = num(prev?.[key]);
  if (c === null) return null;
  return o === null ? c : (c + o) / 2;
}
const basisOf = (prev, key) => (num(prev?.[key]) === null ? 'closing' : 'average');

/** Scale a flow from a part-year to a year (a ten-month figure × 12/10). Stocks are never annualised. */
export const annualise = (x, months = 12) => (num(x) === null ? null : x * 12 / months);

/** Growth from prev to cur (0.25 = 25%). With `annualised`, flows of part-year periods are first scaled to a year. */
export function growth(cur, prev, { annualised = false, curMonths = 12, prevMonths = 12 } = {}) {
  const c = annualised ? annualise(cur, curMonths) : cur, p = annualised ? annualise(prev, prevMonths) : prev;
  if (num(c) === null || num(p) === null || p === 0) return null;
  return (c - p) / Math.abs(p);
}

/** Compound annual growth rate over `years`. */
export const cagr = (end, start, years) => (num(end) === null || num(start) === null || start <= 0 || end < 0 || !years ? null : (end / start) ** (1 / years) - 1);

/** Common-size: each [label, value] as a share of `base` (revenue for an income statement, total assets for a balance sheet). */
export function commonSize(rows, base) {
  return rows.map(([label, value]) => [label, value, div(value, base)]);
}

/** Horizontal analysis: [label, prev, cur, change, % change] for rows given as [label, prev, cur]. */
export function horizontal(rows) {
  return rows.map(([label, p, c]) => [label, p, c, sub(c, p), num(p) && p !== 0 && num(c) !== null ? (c - p) / Math.abs(p) : null]);
}

/** Liquidity. */
export function liquidity(p) {
  const quickAssets = add(p.cash ?? null, p.shortTermInvestments ?? 0, p.receivables ?? null);
  return {
    workingCapital: sub(p.currentAssets, p.currentLiabilities),
    current: div(p.currentAssets, p.currentLiabilities),
    quick: div(quickAssets, p.currentLiabilities),
    cash: div(add(p.cash ?? null, p.shortTermInvestments ?? 0), p.currentLiabilities),
    operatingCashFlow: div(p.cfo, p.currentLiabilities),
  };
}

/** Solvency (leverage and coverage). `withLeases` adds operating lease liabilities to debt. */
export function solvency(p, { withLeases = false } = {}) {
  const debt = withLeases ? add(p.debt ?? null, p.leaseLiabilities ?? 0) : num(p.debt);
  // Counting leases as debt means treating the lease cost as interest plus amortisation, so earnings move too: EBIT
  // rises by the lease interest, EBITDA by the whole lease cost, and interest by the lease interest. Without leaseCost
  // and leaseInterest the earnings are left as reported.
  const li = withLeases ? (num(p.leaseInterest) ?? 0) : 0, lc = withLeases ? (num(p.leaseCost) ?? 0) : 0;
  const ebit = num(p.ebit) === null ? null : p.ebit + li;
  const interest = num(p.interestExpense) === null ? null : p.interestExpense + li;
  const ebitda = add(p.ebit ?? null, p.da ?? null) === null ? null : p.ebit + p.da + lc;
  return {
    ebit, ebitda, interest,
    debt,
    debtRatio: div(p.totalLiabilities, p.totalAssets),
    liabilitiesToEquity: div(p.totalLiabilities, p.equity),
    debtToEquity: div(debt, p.equity),
    debtToCapital: div(debt, add(debt, p.equity ?? null)),
    equityMultiplier: div(p.totalAssets, p.equity),
    interestCoverage: div(ebit, interest),
    ebitdaCoverage: div(ebitda, interest),
    netDebt: sub(debt, add(p.cash ?? null, p.shortTermInvestments ?? 0)),                 // less cash and short-term investments
    netDebtToEbitda: div(sub(debt, add(p.cash ?? null, p.shortTermInvestments ?? 0)), ebitda),
  };
}

/** Efficiency (activity). Turnovers use average balances when `prev` is given; days use the period's length. */
export function efficiency(p, prev = null) {
  const d = days(p);
  const ar = avg(p, prev, 'receivables'), inv = avg(p, prev, 'inventory'), ap = avg(p, prev, 'payables');
  const ta = avg(p, prev, 'totalAssets'), ppe = avg(p, prev, 'ppeNet');
  const receivablesTurnover = div(p.revenue, ar);
  const inventoryTurnover = div(num(p.cogsGoods) ?? p.cogs, inv);
  const payablesTurnover = div(num(p.purchases) ?? p.cogs, ap);
  const dso = div(d, receivablesTurnover), dio = div(d, inventoryTurnover), dpo = div(d, payablesTurnover);
  return {
    days: d,
    assetTurnover: div(p.revenue, ta),
    fixedAssetTurnover: div(p.revenue, ppe),
    receivablesTurnover, dso,
    inventoryTurnover, dio,
    payablesTurnover, dpo,
    operatingCycle: add(dso, dio),
    cashConversionCycle: dso === null || dio === null || dpo === null ? null : dso + dio - dpo,
    basis: { receivables: basisOf(prev, 'receivables'), inventory: basisOf(prev, 'inventory'), payables: basisOf(prev, 'payables'), totalAssets: basisOf(prev, 'totalAssets') },
  };
}

/** Profitability. Returns on assets and equity use average balances when `prev` is given. */
export function profitability(p, prev = null) {
  const gp = num(p.grossProfit) ?? sub(p.revenue, p.cogs);
  const ta = avg(p, prev, 'totalAssets'), eq = avg(p, prev, 'equity');
  const ebitda = add(p.ebit ?? p.operatingIncome ?? null, p.da ?? null);
  return {
    grossMargin: div(gp, p.revenue),
    operatingMargin: div(p.operatingIncome, p.revenue),
    ebitMargin: div(p.ebit, p.revenue),
    ebitdaMargin: div(ebitda, p.revenue),
    netMargin: div(p.netIncome, p.revenue),
    roa: div(p.netIncome, ta),
    roe: div(p.netIncome, eq),
    basis: { totalAssets: basisOf(prev, 'totalAssets'), equity: basisOf(prev, 'equity') },
  };
}

/** DuPont. Three steps: net margin × asset turnover × equity multiplier = ROE (each on the same averages, so the
 *  product equals ROE exactly). Five steps split net margin into tax burden × interest burden × EBIT margin. */
export function dupont(p, prev = null) {
  const ta = avg(p, prev, 'totalAssets'), eq = avg(p, prev, 'equity');
  const netMargin = div(p.netIncome, p.revenue), assetTurnover = div(p.revenue, ta), equityMultiplier = div(ta, eq);
  const taxBurden = div(p.netIncome, p.pretax), interestBurden = div(p.pretax, p.ebit), ebitMargin = div(p.ebit, p.revenue);
  const prod = (...xs) => (xs.every((x) => x !== null) ? xs.reduce((s, x) => s * x, 1) : null);
  return {
    netMargin, assetTurnover, equityMultiplier, roa: prod(netMargin, assetTurnover), roe: prod(netMargin, assetTurnover, equityMultiplier),
    taxBurden, interestBurden, ebitMargin, roe5: prod(taxBurden, interestBurden, ebitMargin, assetTurnover, equityMultiplier),
    basis: { totalAssets: basisOf(prev, 'totalAssets'), equity: basisOf(prev, 'equity') },
  };
}

/** Cash-flow quality: how much of profit arrived as cash, and the accruals that filled the gap. */
export function cashQuality(p, prev = null) {
  const ta = avg(p, prev, 'totalAssets');
  const fcf = sub(p.cfo, p.capex);
  return {
    cfoToNetIncome: div(p.cfo, p.netIncome),
    accruals: sub(p.netIncome, p.cfo),
    accrualsRatio: div(sub(p.netIncome, p.cfo), ta),          // (net income − CFO) ÷ average total assets
    freeCashFlow: fcf,
    fcfMargin: div(fcf, p.revenue),
    capexToDa: div(p.capex, p.da),
    cashReturnOnAssets: div(p.cfo, ta),
    payout: div(p.dividends, p.netIncome),
  };
}

/** Altman's Z-scores. variant 'z' (public manufacturers, market value of equity), 'zprime' (private firms, book
 *  equity), 'zdouble' (non-manufacturers and private firms, no sales term). Ratios: X1 working capital ÷ total
 *  assets, X2 retained earnings ÷ total assets, X3 EBIT ÷ total assets, X4 equity ÷ total liabilities, X5 sales ÷ total assets. */
// Sources: coefficients and the Z′ zones (1.23–2.90) from Altman (2000), "Predicting financial distress of companies:
// revisiting the Z-score and ZETA models" (NYU Stern working paper); Z's 1.81 lower bound from the same paper and 2.99
// from Altman's own slides (Hofstra 2017, LSE 2019: "1.8 < Z < 2.99 grey"); Z″'s zones are Altman's 4.35 and 5.85 for
// the emerging-market form with its +3.25 constant (Hofstra 2017, slide 27), less 3.25.
export const ALTMAN = {
  z: { w: [1.2, 1.4, 3.3, 0.6, 1.0], zones: [1.81, 2.99], equity: 'marketEquity', label: 'Z (1968): public manufacturers' },
  zprime: { w: [0.717, 0.847, 3.107, 0.42, 0.998], zones: [1.23, 2.9], equity: 'equity', label: 'Z′: private manufacturers' },
  zdouble: { w: [6.56, 3.26, 6.72, 1.05], zones: [1.1, 2.6], equity: 'equity', label: 'Z″: non-manufacturers and private firms' },
};
export function altman(p, variant = 'zdouble') {
  const m = ALTMAN[variant];
  if (!m) throw new Error(`altman: unknown variant ${variant}`);
  const x = [div(sub(p.currentAssets, p.currentLiabilities), p.totalAssets), div(p.retainedEarnings, p.totalAssets),
    div(p.ebit, p.totalAssets), div(p[m.equity], p.totalLiabilities), div(p.revenue, p.totalAssets)].slice(0, m.w.length);
  if (x.some((v) => v === null)) return { variant, x, terms: null, score: null, zone: null };
  const terms = x.map((v, i) => v * m.w[i]);
  const score = terms.reduce((s, t) => s + t, 0);
  const zone = score < m.zones[0] ? 'distress' : score > m.zones[1] ? 'safe' : 'grey';
  return { variant, x, terms, score, zone, zones: m.zones };
}

/** Every ratio group for one period at once (prev optional). */
export function analyse(p, prev = null, { withLeases = false } = {}) {
  return { liquidity: liquidity(p), solvency: solvency(p, { withLeases }), efficiency: efficiency(p, prev),
           profitability: profitability(p, prev), dupont: dupont(p, prev), cash: cashQuality(p, prev) };
}
