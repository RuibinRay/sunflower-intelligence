// finsim.js — simulated share prices for invented companies, used by Stock analysis and Risk management.
// The market follows a GARCH(1,1) process with Student-t shocks, so calm and stormy spells bunch together and
// big days come more often than a normal curve allows, as in real markets. Every name here is made up.
import { mulberry32, normalGen } from './rng.js?v=6';

export const SIM_STOCKS = [
  { name: 'Arles Rail', beta: 0.8, alpha: 0.02, idio: 0.22, start: 42 },
  { name: 'Saffron Labs', beta: 1.35, alpha: 0.06, idio: 0.38, start: 118 },
  { name: 'Yellow House Media', beta: 1.15, alpha: -0.03, idio: 0.3, start: 23 },
  { name: 'Provence Power', beta: 0.5, alpha: 0.01, idio: 0.15, start: 64 },
  { name: 'Gauguin Goods', beta: 0.7, alpha: 0.015, idio: 0.2, start: 87 },
];

/** Weekday dates ending on `end` (ISO strings). */
export function businessDays(n, end = '2026-09-30') {
  const out = [], d = new Date(`${end}T00:00:00Z`);
  while (out.length < n) { const wd = d.getUTCDay(); if (wd !== 0 && wd !== 6) out.push(d.toISOString().slice(0, 10)); d.setUTCDate(d.getUTCDate() - 1); }
  return out.reverse();
}

/** Standardised Student-t draw (variance 1) from normals: z / √(χ²/ν) with integer ν. */
function tDraw(N, nu) { let c = 0; for (let k = 0; k < nu; k++) c += N() ** 2; return (N() / Math.sqrt(c / nu)) * Math.sqrt((nu - 2) / nu); }

/** Three years of daily prices for the invented companies and a market index. */
export function simulatedMarket({ days = 756, seed = 1888 } = {}) {
  const rand = mulberry32(seed), N = normalGen(rand);
  const longVar = (0.17 / Math.sqrt(252)) ** 2, a = 0.09, b = 0.89, w = (1 - a - b) * longVar, drift = 0.075 / 252;
  let v = longVar, e = 0;
  const mkt = [];
  for (let t = 0; t < days; t++) {
    v = w + a * e * e + b * v;
    e = Math.sqrt(v) * tDraw(N, 5);
    mkt.push(drift - v / 2 + e);
  }
  const dates = businessDays(days + 1);
  const index = [1000];
  mkt.forEach((r) => index.push(index[index.length - 1] * (1 + r)));
  const stocks = SIM_STOCKS.map((s) => {
    const p = [s.start], sig = s.idio / Math.sqrt(252);
    for (let t = 0; t < days; t++) {
      const r = s.alpha / 252 + s.beta * mkt[t] + sig * tDraw(N, 6);
      p.push(p[p.length - 1] * (1 + r));
    }
    return { name: s.name, prices: p.map((x) => Math.round(x * 100) / 100) };
  });
  return { dates, series: [...stocks, { name: 'Market index', prices: index.map((x) => Math.round(x * 100) / 100), isMarket: true }] };
}
