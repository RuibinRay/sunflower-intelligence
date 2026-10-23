// fin.js — cost of capital, bonds and options. Pure functions; the finance room draws them.
import { normCdf } from './stats.js?v=7';

const normPdf = (x) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);

// ---------------------------------------------------------------- cost of capital
/**
 * CAPM cost of equity and the weighted average cost of capital.
 * All rates as fractions. equity and debt are market values (any currency unit).
 */
export function wacc({ rf, beta, erp, kd, tax, equity, debt }) {
  const vals = [rf, beta, erp, kd, tax, equity, debt];
  if (!vals.every(Number.isFinite)) return { error: 'Fill in every field.' };
  if (equity < 0 || debt < 0 || equity + debt <= 0) return { error: 'Equity and debt values can’t be negative, and at least one has to be above zero.' };
  if (tax < 0 || tax >= 1) return { error: 'The tax rate has to be between 0% and 100%.' };
  const ke = rf + beta * erp;
  const kdAfter = kd * (1 - tax);
  const v = equity + debt, we = equity / v, wd = debt / v;
  return { ke, kdAfter, we, wd, wacc: we * ke + wd * kdAfter };
}

// ---------------------------------------------------------------- bonds
/** Cash flows of a plain coupon bond: [{t (years), cf}]. Assumes the bond is priced on a coupon date. */
export function bondFlows({ face, couponRate, years, freq }) {
  const n = Math.round(years * freq), c = (face * couponRate) / freq;
  return Array.from({ length: n }, (_, i) => ({ t: (i + 1) / freq, cf: c + (i === n - 1 ? face : 0) }));
}

/** Price, Macaulay and modified duration, and convexity at an annual yield compounded `freq` times a year. */
export function bondAtYield(spec, y) {
  const { freq } = spec, flows = bondFlows(spec), r = y / freq;
  let price = 0, mac = 0, conv = 0;
  flows.forEach(({ t, cf }, i) => {
    const k = i + 1, df = (1 + r) ** -k, pv = cf * df;
    price += pv; mac += t * pv; conv += pv * k * (k + 1);
  });
  const macaulay = mac / price;
  return {
    price, macaulay, modified: macaulay / (1 + r),
    convexity: conv / (price * freq * freq * (1 + r) ** 2),   // in years², for the annual-yield approximation
    flows,
  };
}

/** Yield to maturity from a price, by bisection (the price falls monotonically as the yield rises). */
export function bondYield(spec, price) {
  if (!(price > 0)) return NaN;
  let lo = -0.99 * spec.freq + 1e-6, hi = 5;
  const f = (y) => bondAtYield(spec, y).price - price;
  if (f(lo) < 0 || f(hi) > 0) return NaN;
  for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (f(mid) > 0) lo = mid; else hi = mid; if (hi - lo < 1e-12) break; }
  return (lo + hi) / 2;
}

export function bond({ face, couponRate, years, freq, mode, ytm, price }) {
  if (![face, couponRate, years, freq].every(Number.isFinite)) return { error: 'Fill in every field.' };
  if (face <= 0 || years <= 0 || couponRate < 0) return { error: 'Face value and years to maturity have to be above zero, and the coupon can’t be negative.' };
  if (Math.abs(years * freq - Math.round(years * freq)) > 1e-9) return { error: `With ${freq === 1 ? 'annual' : freq === 2 ? 'semiannual' : 'quarterly'} coupons, maturity has to be a whole number of coupon periods.` };
  const spec = { face, couponRate, years, freq };
  let y = ytm;
  if (mode === 'price') { y = bondYield(spec, price); if (!Number.isFinite(y)) return { error: 'No yield gives that price. Check the price is above zero and realistic for the bond.' }; }
  else if (!Number.isFinite(y) || y <= -freq) return { error: 'Enter a yield to maturity.' };
  const at = bondAtYield(spec, y);
  const current = (face * couponRate) / at.price;
  // price change for a yield move, by duration alone and with convexity, against the exact repricing
  const shock = (dy) => ({ dy, exact: bondAtYield(spec, y + dy).price - at.price, duration: -at.modified * at.price * dy, withConvexity: -at.modified * at.price * dy + 0.5 * at.convexity * at.price * dy * dy });
  return { ...at, ytm: y, currentYield: current, premium: at.price - face, shock, spec };
}

// ---------------------------------------------------------------- options
/**
 * Black–Scholes–Merton price and Greeks for a European option on a stock with continuous dividend yield q.
 * T in years; r, q, sigma as annual fractions. Theta per year (divide by 365 for per day); vega and rho per 1.00 change.
 */
export function blackScholes({ S, K, T, r, q = 0, sigma, type }) {
  if (![S, K, T, r, q, sigma].every(Number.isFinite)) return { error: 'Fill in every field.' };
  if (S <= 0 || K <= 0) return { error: 'Share price and strike have to be above zero.' };
  if (T <= 0) return { error: 'Time to expiry has to be above zero.' };
  if (sigma <= 0) return { error: 'Volatility has to be above zero.' };
  const sq = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * sq), d2 = d1 - sigma * sq;
  const dq = Math.exp(-q * T), dr = Math.exp(-r * T);
  const call = S * dq * normCdf(d1) - K * dr * normCdf(d2);
  const put = K * dr * normCdf(-d2) - S * dq * normCdf(-d1);
  const isCall = type !== 'put';
  const gamma = (dq * normPdf(d1)) / (S * sigma * sq);
  const vega = S * dq * normPdf(d1) * sq;
  const delta = isCall ? dq * normCdf(d1) : -dq * normCdf(-d1);
  const theta = isCall
    ? -(S * dq * normPdf(d1) * sigma) / (2 * sq) - r * K * dr * normCdf(d2) + q * S * dq * normCdf(d1)
    : -(S * dq * normPdf(d1) * sigma) / (2 * sq) + r * K * dr * normCdf(-d2) - q * S * dq * normCdf(-d1);
  const rho = isCall ? K * T * dr * normCdf(d2) : -K * T * dr * normCdf(-d2);
  const price = isCall ? call : put;
  const intrinsic = Math.max(0, isCall ? S - K : K - S);
  return { price, call, put, d1, d2, delta, gamma, vega, theta, rho, intrinsic, timeValue: price - intrinsic, probITM: isCall ? normCdf(d2) : normCdf(-d2) };
}

/** Implied volatility by bisection on the Black–Scholes price. */
export function impliedVol(spec, target) {
  let lo = 1e-4, hi = 5;
  const f = (s) => blackScholes({ ...spec, sigma: s }).price - target;
  if (!(f(lo) <= 0 && f(hi) >= 0)) return NaN;
  for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (f(m) > 0) hi = m; else lo = m; if (hi - lo < 1e-10) break; }
  return (lo + hi) / 2;
}
