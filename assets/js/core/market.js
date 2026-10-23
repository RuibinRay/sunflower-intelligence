// market.js — the arithmetic behind Market segmentation and the Market map: needs-based segment profiles,
// targeting scores, market-attractiveness scores, great-circle distances and growth rates.
// Every function here is checked against pandas/NumPy/scikit-learn in tests/mkt.test.mjs.
import * as S from './stats.js?v=11';
import { mulberry32, normalGen } from './rng.js?v=11';

// ================================================================ geography
export const EARTH_KM = 6371.0088;                  // mean Earth radius (IUGG)
export const HALF_EARTH_KM = Math.PI * EARTH_KM;    // the farthest two places can be: 20,015 km

/** Great-circle distance in km between [lat, lon] pairs in degrees (haversine formula). */
export function haversine([lat1, lon1], [lat2, lon2]) {
  const r = Math.PI / 180;
  const a = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lon2 - lon1) * r) / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}
/** Reach on 0–100: 100 next door, 0 on the far side of the planet; falls in a straight line with distance. */
export const reachScore = (km) => (Number.isFinite(km) ? 100 * (1 - Math.min(km, HALF_EARTH_KM) / HALF_EARTH_KM) : NaN);

/** Compound annual growth rate; NaN unless both values are positive. */
export function cagr(end, start, years) {
  if (!(end > 0) || !(start > 0) || !(years > 0)) return NaN;
  return (end / start) ** (1 / years) - 1;
}

/** The map's built-in measures for one country record from assets/data/world-markets.json. */
export function measures(c) {
  const ok = Number.isFinite(c.gdp) && Number.isFinite(c.pop) && c.pop > 0;
  return {
    gdp: ok ? c.gdp : NaN,
    gdppc: ok ? c.gdp / c.pop : NaN,
    growth: ok && c.gdp0 != null ? cagr(c.gdp, c.gdp0, 5) : NaN,
    pop: ok ? c.pop : NaN,
    popGrowth: ok && c.pop0 != null ? cagr(c.pop, c.pop0, 5) : NaN,
  };
}

// ================================================================ attractiveness
/**
 * Rescales one measure to 0–100 across the given values: optional log, then capped at the `cap` quantiles
 * (so one outlier can't squash everyone else), then min–max. Lower-is-better measures are flipped.
 * Non-finite inputs (or non-positive ones under log) stay NaN.
 */
export function rescale(values, { log = false, cap = [0.05, 0.95], higherIsBetter = true } = {}) {
  const t = values.map((v) => (Number.isFinite(v) && (!log || v > 0) ? (log ? Math.log(v) : v) : NaN));
  const ok = S.finite(t);
  if (!ok.length) return t.map(() => NaN);
  const s = S.sorted(ok);
  const lo = cap ? S.quantileSorted(s, cap[0]) : s[0], hi = cap ? S.quantileSorted(s, cap[1]) : s[s.length - 1];
  return t.map((v) => {
    if (!Number.isFinite(v)) return NaN;
    if (hi === lo) return 50;
    const x = (Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo) * 100;
    return higherIsBetter ? x : 100 - x;
  });
}

/**
 * Weighted attractiveness. rows: objects; factors: [{ key, weight, log?, higherIsBetter? }].
 * Only rows complete on every factor with weight > 0 are scored; weights are divided by their sum.
 * Returns { score: number[] (NaN for rows left out), parts: { key: number[] }, used: indices }.
 */
export function attractiveness(rows, factors) {
  const live = factors.filter((f) => f.weight > 0);
  const total = live.reduce((a, f) => a + f.weight, 0);
  const used = rows.map((r, i) => i).filter((i) => live.every((f) => Number.isFinite(rows[i][f.key]) && (!f.log || rows[i][f.key] > 0)));
  const parts = {};
  for (const f of factors) {
    const vals = rescale(used.map((i) => rows[i][f.key]), { log: f.log, higherIsBetter: f.higherIsBetter !== false });
    parts[f.key] = rows.map(() => NaN);
    used.forEach((i, k) => { parts[f.key][i] = vals[k]; });
  }
  const score = rows.map(() => NaN);
  if (total > 0) used.forEach((i) => { score[i] = live.reduce((a, f) => a + (f.weight / total) * parts[f.key][i], 0); });
  return { score, parts, used };
}

/** Rank 1 = highest; ties share the better rank; NaN stays unranked. */
export function rankDesc(values) {
  const idx = values.map((v, i) => i).filter((i) => Number.isFinite(values[i])).sort((a, b) => values[b] - values[a]);
  const rank = values.map(() => NaN);
  idx.forEach((i, k) => { rank[i] = k && values[i] === values[idx[k - 1]] ? rank[idx[k - 1]] : k + 1; });
  return rank;
}

// ================================================================ segments
/** Index vs average: segment mean ÷ overall mean × 100, for every column. cols: number[][] (column-major). */
export function indexVsAverage(cols, labels, k) {
  const overall = cols.map((c) => S.mean(c));
  return Array.from({ length: k }, (_, g) => cols.map((c, j) => {
    const m = S.mean(c.filter((_, i) => labels[i] === g));
    return overall[j] === 0 ? NaN : (m / overall[j]) * 100;
  }));
}
/** Per segment: respondents, share, and (when spend is given) spend, share of spend and spend per head. */
export function segmentSizes(labels, k, spend = null) {
  const n = labels.length;
  const tot = spend ? S.sum(spend) : NaN;
  return Array.from({ length: k }, (_, g) => {
    const idx = labels.map((l, i) => (l === g ? i : -1)).filter((i) => i >= 0);
    const sp = spend ? S.sum(idx.map((i) => spend[i])) : NaN;
    return { n: idx.length, share: idx.length / n, spend: sp, spendShare: sp / tot, perHead: idx.length ? sp / idx.length : NaN };
  });
}
/**
 * How well each segment's needs match what you're good at. centres: segment means in standardised units (z);
 * strengths: −1 weak, 0 average, +1 strong for each need. fit = Σ z·s ÷ Σ|s|  (0 = no better than average).
 */
export function needsFit(centres, strengths) {
  const denom = strengths.reduce((a, s) => a + Math.abs(s), 0);
  return centres.map((c) => (denom ? c.reduce((a, z, j) => a + z * strengths[j], 0) / denom : 0));
}
/**
 * Targeting score on 0–100 per segment. size and spend per head are scored against the best segment
 * (100 = the biggest / highest-spending); fit is centred on 50 (= average) and scaled by the largest |fit|.
 */
export function targetScores({ share, perHead, fit }, { size = 1, spend = 1, fitW = 1 } = {}) {
  const maxShare = Math.max(...share), maxHead = Math.max(...perHead.filter(Number.isFinite)), maxFit = Math.max(...fit.map(Math.abs));
  const sizeS = share.map((v) => (v / maxShare) * 100);
  const spendS = perHead.map((v) => (Number.isFinite(v) && maxHead > 0 ? (v / maxHead) * 100 : NaN));
  const fitS = fit.map((v) => (maxFit > 0 ? 50 + (50 * v) / maxFit : 50));
  const parts = [[size, sizeS], [spend, spendS], [fitW, fitS]].filter(([w, a]) => w > 0 && a.every(Number.isFinite));
  const wsum = parts.reduce((a, [w]) => a + w, 0);
  const total = share.map((_, g) => (wsum ? parts.reduce((a, [w, arr]) => a + (w / wsum) * arr[g], 0) : NaN));
  return { sizeS, spendS, fitS, total };
}

const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
/** Plain names from each segment's top-indexing needs (index ≥ 110), lettered A, B, C… */
export function nameSegments(index, needs, { strong = 110 } = {}) {
  const seen = new Map();
  return index.map((row, g) => {
    const top = row.slice(0, needs.length).map((v, j) => ({ v, j })).filter((d) => d.v >= strong).sort((a, b) => b.v - a.v);
    let name = top.length >= 2 ? `${cap(needs[top[0].j])} and ${needs[top[1].j]}` : top.length ? `${cap(needs[top[0].j])} first` : 'No strong lean';
    const count = (seen.get(name) || 0) + 1; seen.set(name, count);
    if (count > 1) name += ` (${count})`;
    return `${String.fromCharCode(65 + g)} · ${name}`;
  });
}

// ================================================================ the example survey
/**
 * A fictional survey of 600 shoppers at a garden-and-seed brand: how much each of six things matters when they
 * buy (1 = not at all, 7 = essential), plus age and spend over the last 12 months. Five kinds of shopper are
 * planted with noise, so k-means has real but overlapping structure to find.
 */
export function shopperSurvey(seed = 1894) {
  const r = mulberry32(seed), N = normalGen(r);
  const needs = ['price', 'quality', 'convenience', 'sustainability', 'brand', 'advice'];
  const types = [
    { share: 0.26, m: [6.3, 3.8, 4.6, 2.9, 2.6, 3.0], spend: 120, age: 46 },
    { share: 0.17, m: [3.0, 6.4, 3.8, 4.6, 5.8, 4.0], spend: 420, age: 53 },
    { share: 0.19, m: [3.8, 5.2, 3.4, 6.5, 3.4, 4.3], spend: 260, age: 35 },
    { share: 0.22, m: [4.2, 4.0, 6.5, 3.2, 3.5, 2.4], spend: 210, age: 39 },
    { share: 0.16, m: [4.6, 4.4, 4.6, 4.2, 3.6, 6.4], spend: 150, age: 29 },
  ];
  const pick = () => { let u = r(), acc = 0; for (const t of types) { acc += t.share; if (u <= acc) return t; } return types[types.length - 1]; };
  const rows = [];
  for (let i = 1; i <= 600; i++) {
    const t = pick();
    const ratings = t.m.map((mu) => Math.min(7, Math.max(1, Math.round(N(mu, 0.7)))));
    const age = Math.round(Math.min(82, Math.max(18, N(t.age, 9))));
    const spend = Math.round(Math.exp(N(Math.log(t.spend), 0.45)));
    rows.push([`R${String(i).padStart(4, '0')}`, age, spend, ...ratings]);
  }
  const head = ['respondent', 'age', 'spend_12m', ...needs];
  return { name: 'Shopper survey', note: 'Fictional: 600 survey answers generated for this demo.', csv: [head, ...rows].map((x) => x.join(',')).join('\n'), needs };
}
