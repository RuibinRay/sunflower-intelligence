// derivatives.js — forwards, futures, swaps, hedge ratios and binomial option trees for F08 Derivatives and Risk
// Management. Pure functions, no DOM. Conventions (stated in the lessons):
// - rates are annual and compounded annually unless `continuous: true`; time T is in years;
// - a long forward or futures position gains S_T − K at maturity; a short one gains K − S_T;
// - futures are marked to market daily: each day's gain or loss is (settlement price − previous settlement) × size;
// - swaps here pay annually; a payer swap pays fixed and receives floating. Black–Scholes lives in core/fin.js.
// Tested in tests/derivatives.test.mjs against an independent NumPy implementation (tests/make_fixtures_derivatives.py)
// and against identities that must hold (put–call parity, zero value at inception, binomial → Black–Scholes).

const growth = (r, T, continuous) => (continuous ? Math.exp(r * T) : (1 + r) ** T);

/** Payoff at maturity of one unit of a forward (or futures held to maturity). */
export const forwardPayoff = (ST, K, long = true) => (long ? ST - K : K - ST);

/** Option payoff at expiry (not net of the premium). */
export const optionPayoff = (ST, K, type = 'call') => (type === 'call' ? Math.max(0, ST - K) : Math.max(0, K - ST));

/** Profit at expiry of one option position: payoff less the premium paid, grown to expiry if r and T are given. */
export function optionProfit(ST, K, { type = 'call', long = true, premium = 0, r = 0, T = 0 } = {}) {
  const p = optionPayoff(ST, K, type) - premium * growth(r, T, false);
  return long ? p : -p;
}

/**
 * Forward price by cost of carry: F = (S − PV(income) + PV(storage)) × (1 + r)^T.
 * `income` and `storage` are present values at time 0 (dividends, coupons; warehouse and insurance costs).
 */
export function forwardPrice({ S, r, T, income = 0, storage = 0, continuous = false }) {
  return (S - income + storage) * growth(r, T, continuous);
}

/** Currency forward by interest-rate parity, quoted as domestic currency per unit of foreign. */
export function fxForward({ spot, rDomestic, rForeign, T, continuous = false }) {
  return spot * growth(rDomestic, T, continuous) / growth(rForeign, T, continuous);
}

/** Value today of an existing long forward with delivery price K, when today's forward price for the same date is F. */
export function forwardValue({ F, K, r, T, long = true, continuous = false }) {
  const v = (F - K) / growth(r, T, continuous);
  return long ? v : -v;
}

/**
 * A futures margin account, marked to market at each settlement price.
 * `prices[0]` is the price the position was opened at. A margin call restores the balance to the initial margin
 * whenever it falls below the maintenance margin. Returns one row per settlement after the opening.
 */
export function marginAccount({ prices, contracts = 1, size, initial, maintenance, long = true }) {
  const sign = long ? 1 : -1, init = initial * contracts, maint = maintenance * contracts;
  const rows = [];
  let balance = init, cumulative = 0, deposits = init;
  for (let i = 1; i < prices.length; i++) {
    const gain = sign * (prices[i] - prices[i - 1]) * size * contracts;
    cumulative += gain;
    const before = balance + gain;
    const call = before < maint ? init - before : 0;
    balance = before + call;
    deposits += call;
    rows.push({ day: i, price: prices[i], gain, cumulative, before, call, balance });
  }
  return { rows, initial: init, maintenance: maint, deposits, cumulative, finalBalance: balance };
}

/** Discount factors from annual zero rates z[0..n−1] for years 1..n (annual compounding). */
export const discountFactors = (zeros) => zeros.map((z, i) => 1 / (1 + z) ** (i + 1));

/** The fixed rate that gives a new annual-pay swap zero value: (1 − DF_n) ÷ Σ DF_i. */
export function swapRate(df) {
  return (1 - df[df.length - 1]) / df.reduce((s, d) => s + d, 0);
}

/**
 * Value of a swap to the fixed-rate payer, at a reset date, with discount factors for the remaining annual payments:
 * the floating leg is worth par (the notional) and the fixed leg is a bond paying `fixed` a year.
 */
export function swapValue({ notional, fixed, df, payFixed = true }) {
  const floating = notional;                                          // at a reset date the floating leg is worth par
  const fixedLeg = notional * (fixed * df.reduce((s, d) => s + d, 0) + df[df.length - 1]);
  const v = floating - fixedLeg;
  return payFixed ? v : -v;
}

/** Minimum-variance hedge ratio h* = ρ σ_S ÷ σ_F, and the share of variance it removes (ρ²). */
export function hedgeRatio({ rho, sdSpot, sdFutures }) {
  return { h: rho * sdSpot / sdFutures, effectiveness: rho * rho };
}

/** Futures contracts for a hedge: h × exposure ÷ contract size (unrounded; round to whole contracts in use). */
export const contractsNeeded = ({ h, exposure, size }) => h * exposure / size;

/** Put–call parity for European options: C − P = S − PV(K) (no dividends). Returns the gap, which should be 0. */
export function parityGap({ C, P, S, K, r, T, continuous = true }) {
  return C - P - (S - K / growth(r, T, continuous));
}

/**
 * Cox–Ross–Rubinstein binomial tree. u = e^{σ√Δt}, d = 1/u, risk-neutral p = (e^{rΔt} − d)/(u − d) (continuous r).
 * American options check early exercise at every node. Returns the price and the first step's numbers.
 */
export function binomial({ S, K, T, r, sigma, steps, type = 'call', american = false, q = 0 }) {
  const dt = T / steps, u = Math.exp(sigma * Math.sqrt(dt)), d = 1 / u;
  const disc = Math.exp(-r * dt), p = (Math.exp((r - q) * dt) - d) / (u - d);
  let v = Array.from({ length: steps + 1 }, (_, j) => optionPayoff(S * u ** j * d ** (steps - j), K, type));
  for (let i = steps - 1; i >= 0; i--) {
    v = v.slice(0, i + 1).map((_, j) => {
      const cont = disc * (p * v[j + 1] + (1 - p) * v[j]);
      return american ? Math.max(cont, optionPayoff(S * u ** j * d ** (i - j), K, type)) : cont;
    });
  }
  return { price: v[0], u, d, p, dt };
}

/** One-step binomial price with replication: Δ = (Cu − Cd)/(Su − Sd), bond B = (Cu − ΔSu)/(1 + r) (annual r). */
export function oneStep({ S, u, d, K, r, type = 'call' }) {
  const Su = S * u, Sd = S * d, Cu = optionPayoff(Su, K, type), Cd = optionPayoff(Sd, K, type);
  const delta = (Cu - Cd) / (Su - Sd), bond = (Cu - delta * Su) / (1 + r);
  const p = (1 + r - d) / (u - d);
  return { Su, Sd, Cu, Cd, delta, bond, price: delta * S + bond, p, riskNeutral: (p * Cu + (1 - p) * Cd) / (1 + r) };
}
