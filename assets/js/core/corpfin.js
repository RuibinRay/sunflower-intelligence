// corpfin.js — F05 Corporate Finance: project free cash flows with depreciation tax shields and working capital, MACRS
// schedules, equivalent annual annuities, sensitivity and break-even, CAPM and beta (un)levering, WACC with any
// weights, Modigliani–Miller with corporate tax, dividends against buybacks, percent-of-sales planning and a cash budget.
// NPV, IRR, MIRR, payback and PI live in core/invest.js. Pure functions; tested in tests/corpfin.test.mjs against
// numpy-financial, hand-worked textbook cases and the identities each formula must satisfy.
import { npv, irr } from './invest.js?v=30';

// ================================================================ depreciation
/** MACRS percentages, half-year convention (IRS Publication 946, Table A-1), in % of the depreciable basis. */
export const MACRS = {
  3: [33.33, 44.45, 14.81, 7.41],
  5: [20.00, 32.00, 19.20, 11.52, 11.52, 5.76],
  7: [14.29, 24.49, 17.49, 12.49, 8.93, 8.92, 8.93, 4.46],
};
/** A depreciation schedule: 'sl' straight line to `salvage` over `life` years (book depreciation; salvage defaults to
 *  0), or a MACRS class (3, 5 or 7; tax depreciation of the full cost, ignoring salvage, as the tax rules do).
 *  Returns amounts for years 1… */
export function depreciation(cost, { method = 'sl', life = 5, salvage = 0 } = {}) {
  if (method === 'sl') return Array.from({ length: life }, () => (cost - salvage) / life);
  const p = MACRS[method]; if (!p) throw new Error(`Unknown MACRS class ${method}`);
  return p.map((x) => cost * x / 100);
}

// ================================================================ project free cash flows
/**
 * Project free cash flows, one row per year 0…n (year 0 = today):
 *   EBIT = revenue − variable costs − fixed costs − depreciation;  tax on EBIT at `tax` (negative EBIT earns a credit
 *   against the firm's other profits, as for a profitable company);  operating cash flow = EBIT − tax + depreciation;
 *   capital spending at year 0 (`capex`, and any in `extraCapex[t]`);  net working capital = `nwc` (an amount per year,
 *   or a share of next year's revenue with `nwcShare`, held from year 0) with the change in NWC as a cash outflow and
 *   all of it recovered in year n;  after-tax salvage in year n = salvage − tax × (salvage − book value left).
 * FCF = OCF − capital spending − ΔNWC + after-tax salvage.
 * inputs: { capex, years, revenue: [y1…yn], variable: [..] or variableShare, fixed: [..] or a number, dep: [..]
 *   (from depreciation()), tax, nwc?: [y0…yn], nwcShare?, salvage? (market value at the end), sunk? (ignored, listed
 *   only so lessons can show it is left out), opportunity? (after-tax value forgone, charged at year 0), upfront?
 *   (costs expensed at year 0, such as launch marketing: tax-deductible, so they cost upfront × (1 − T)), side?: [y1…yn]
 *   (after-tax effects on the firm's other cash flows, e.g. −lost margin from cannibalisation, added to FCF) }
 */
export function projectCashFlows(p) {
  const n = p.years, T = p.tax ?? 0;
  const at = (x, t) => (Array.isArray(x) ? x[t - 1] ?? 0 : x ?? 0);
  const rev = (t) => (t >= 1 && t <= n ? at(p.revenue, t) : 0);
  const nwcLevel = (t) => {
    if (Array.isArray(p.nwc)) return t <= n - 1 ? p.nwc[t] ?? 0 : 0;
    if (p.nwcShare != null) return t <= n - 1 ? p.nwcShare * rev(t + 1) : 0;
    return 0;
  };
  const dep = (t) => (t >= 1 ? p.dep?.[t - 1] ?? 0 : 0);
  const depTotal = (p.dep || []).slice(0, n).reduce((a, b) => a + b, 0), book = p.capex - depTotal;
  const rows = [];
  for (let t = 0; t <= n; t++) {
    const R = rev(t);
    const V = t >= 1 ? (p.variableShare != null ? p.variableShare * R : at(p.variable, t)) : 0;
    const Fx = t >= 1 ? at(p.fixed, t) : 0, D = dep(t);
    const ebit = t >= 1 ? R - V - Fx - D : 0, taxes = ebit * T, nopat = ebit - taxes, ocf = nopat + D;
    const capex = (t === 0 ? p.capex : 0) + (p.extraCapex?.[t] ?? 0) + (t === 0 ? p.opportunity ?? 0 : 0);
    const upfront = t === 0 ? (p.upfront ?? 0) * (1 - T) : 0, side = t >= 1 ? p.side?.[t - 1] ?? 0 : 0;
    const dNwc = nwcLevel(t) - (t === 0 ? 0 : nwcLevel(t - 1));
    const salvage = t === n && p.salvage != null ? p.salvage - T * (p.salvage - book) : 0;
    rows.push({ t, revenue: R, variable: V, fixed: Fx, depreciation: D, ebit, taxes, nopat, ocf, capex, upfront, side, nwc: nwcLevel(t), dNwc, salvage, fcf: ocf - capex - upfront + side - dNwc + salvage });
  }
  return { rows, fcf: rows.map((r) => r.fcf), book, depTotal };
}
/** The depreciation tax shield each year: tax × depreciation. */
export const taxShield = (dep, tax) => dep.map((d) => d * tax);

// ================================================================ comparing projects
/** Equivalent annual annuity: the level payment over n years with the same present value as `pv` at `rate`. */
export const eaa = (pv, rate, n) => (rate === 0 ? pv / n : pv * rate / (1 - (1 + rate) ** -n));
/** Equivalent annual cost of owning an asset: (purchase + PV of operating costs − PV of salvage) spread over its life. */
export function eac({ price, costs, salvage = 0, rate }) {
  const n = costs.length, pvCosts = costs.reduce((s, c, i) => s + c / (1 + rate) ** (i + 1), 0);
  const pv = price + pvCosts - salvage / (1 + rate) ** n;
  return { pv, eac: eaa(pv, rate, n) };
}

// ================================================================ risk in project analysis
/** One-at-a-time sensitivity: NPV with each input moved to each of its `cases` values, others at base.
 *  model(inputs) → NPV. Returns [{ name, low, base, high, lowNpv, highNpv, swing }] sorted by swing (tornado order). */
export function sensitivity(model, base, ranges) {
  const b = model(base);
  return Object.entries(ranges).map(([name, [lo, hi]]) => {
    const l = model({ ...base, [name]: lo }), h = model({ ...base, [name]: hi });
    return { name, low: lo, high: hi, base: base[name], lowNpv: l, highNpv: h, swing: Math.abs(h - l), baseNpv: b };
  }).sort((x, y) => y.swing - x.swing);
}
/** The value of one input at which model(inputs) = target (default 0), by bisection between lo and hi. */
export function breakEven(model, base, name, lo, hi, target = 0) {
  const f = (v) => model({ ...base, [name]: v }) - target;
  let a = lo, b = hi, fa = f(a);
  if (Math.sign(fa) === Math.sign(f(b))) return NaN;
  for (let i = 0; i < 200; i++) { const m = (a + b) / 2, fm = f(m); if (Math.sign(fm) === Math.sign(fa)) { a = m; fa = fm; } else b = m; }
  return (a + b) / 2;
}
/** Accounting break-even (EBIT = 0) and cash break-even (EBITDA = 0: operating cash flow before tax is zero; after tax, a firm with other profits still collects the T × D shield) volumes, and the financial (NPV) break-even
 *  volume for a project with constant volume: price, variable cost per unit, fixed costs a year, depreciation a year,
 *  capex at year 0, life n, rate r, tax T. */
export function breakEvenVolumes({ price, unitCost, fixed, dep, capex, n, r, tax }) {
  const margin = price - unitCost;
  const ann = eaa(capex, r, n);                     // the annual cost of the investment
  return {
    accounting: (fixed + dep) / margin,
    cash: fixed / margin,
    financial: (fixed + (ann - tax * dep) / (1 - tax)) / margin,
  };
}

// ================================================================ cost of capital
/** CAPM: r_E = r_f + β (market risk premium). */
export const capm = ({ rf, beta, mrp }) => rf + beta * mrp;
/** Unlever and relever an equity beta (Hamada, with debt beta 0 and corporate tax): β_U = β_L ÷ (1 + (1 − T) D/E). */
export const unleverBeta = (betaL, de, tax = 0) => betaL / (1 + (1 - tax) * de);
export const releverBeta = (betaU, de, tax = 0) => betaU * (1 + (1 - tax) * de);
/** Weighted-average cost of capital with market-value weights: E/V r_E + D/V r_D (1 − T) (+ P/V r_P for preferred). */
export function wacc({ E, D, P = 0, rE, rD, rP = 0, tax }) {
  const V = E + D + P;
  return { V, wE: E / V, wD: D / V, wP: P / V, wacc: (E * rE + D * rD * (1 - tax) + P * rP) / V };
}
/** The yield to maturity of a level-coupon bond (annual coupons by default) from its price, by bisection. */
export function ytm({ price, face = 100, coupon, years, freq = 1 }) {
  const n = Math.round(years * freq), c = face * coupon / freq;
  const pv = (y) => { const r = y / freq; let v = 0; for (let k = 1; k <= n; k++) v += c / (1 + r) ** k; return v + face / (1 + r) ** n; };
  let lo = -0.5, hi = 2;
  for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (pv(m) > price) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
/** Dividend growth (Gordon) cost of equity: r_E = D₁ ÷ P₀ + g. */
export const dividendGrowthCost = ({ d1, p0, g }) => d1 / p0 + g;

// ================================================================ capital structure (Modigliani–Miller)
/** MM with corporate tax and permanent debt: V_L = V_U + T D; r_E = r_U + (r_U − r_D)(1 − T) D/E; WACC falls with D.
 *  Without tax (T = 0): V_L = V_U and r_E = r_U + (r_U − r_D) D/E. Given V_U, D, r_U, r_D and T. */
export function mm({ Vu, D, rU, rD, tax = 0 }) {
  const VL = Vu + tax * D, E = VL - D, de = D / E;
  const rE = rU + (rU - rD) * (1 - tax) * de;
  return { VL, E, de, rE, wacc: (E * rE + D * rD * (1 - tax)) / VL, taxShieldPV: tax * D };
}

// ================================================================ payout
/** A cash dividend against a share repurchase of the same total cash, in a perfect market (no taxes, buyback at the
 *  market price). Before: `shares` shares at `price`, `cash` of it in cash, earnings `earnings` (after the payout,
 *  earnings fall by the interest the cash would have earned, `lostIncome`). */
export function payout({ shares, price, amount, earnings, lostIncome = 0 }) {
  const value = shares * price, after = value - amount, e2 = earnings - lostIncome;
  const dividend = { perShare: amount / shares, priceAfter: after / shares, shares, eps: e2 / shares, wealth: after / shares + amount / shares };
  const bought = amount / price, left = shares - bought;
  const buyback = { sharesBought: bought, shares: left, priceAfter: after / left, eps: e2 / left, wealth: after / left };
  return { epsBefore: earnings / shares, dividend, buyback };
}

// ================================================================ financial planning
/**
 * Percent-of-sales forecast and the external financing needed (AFN): assets and spontaneous liabilities that move
 * with sales grow with them; retained earnings grow by next year's profit × (1 − payout).
 * AFN = (A/S) ΔS − (L/S) ΔS − m S₁ (1 − d).
 */
export function afn({ sales0, growth, assets, spontaneous, margin, payout }) {
  const s1 = sales0 * (1 + growth), dS = s1 - sales0;
  const needAssets = (assets / sales0) * dS, spont = (spontaneous / sales0) * dS, retained = margin * s1 * (1 - payout);
  return { s1, dS, needAssets, spont, retained, afn: needAssets - spont - retained };
}
/** Internal growth rate ROA b ÷ (1 − ROA b) and sustainable growth rate ROE b ÷ (1 − ROE b), with ROA and ROE on
 *  end-of-year totals (the convention under which these are the growth rates with AFN = 0 and fixed ratios). */
export const internalGrowth = (roa, b) => roa * b / (1 - roa * b);
export const sustainableGrowth = (roe, b) => roe * b / (1 - roe * b);
/**
 * Monthly cash budget: opening cash, receipts and payments each month; when cash would fall below `minimum`, borrow
 * on the line of credit (interest at `rate` a month on the opening balance, paid that month); repay when there is a
 * surplus above the minimum.
 */
export function cashBudget({ opening, receipts, payments, minimum = 0, rate = 0, limit = Infinity }) {
  let cash = opening, debt = 0;
  const rows = receipts.map((rec, i) => {
    const interest = debt * rate, start = cash, net = rec - payments[i] - interest;
    let c = start + net, borrow = 0, repay = 0;
    if (c < minimum) { borrow = Math.min(minimum - c, limit - debt); debt += borrow; c += borrow; }
    else if (debt > 0) { repay = Math.min(debt, c - minimum); debt -= repay; c -= repay; }
    cash = c;
    return { month: i + 1, start, receipts: rec, payments: payments[i], interest, net, borrow, repay, end: c, debt, breach: c < minimum - 1e-9 };
  });
  return { rows, peakDebt: Math.max(0, ...rows.map((r) => r.debt)), endCash: cash, endDebt: debt };
}

export { npv, irr };
