// customer.js — M06 Customer Analytics: customer-level summaries from transactions, RFM scoring, cohort tables,
// retention and churn rates, Kaplan–Meier survival with Greenwood standard errors and the log-rank test, the
// shifted-beta-geometric (sBG) model of contractual retention (Fader & Hardie 2007) with discounted expected lifetimes
// (Fader & Hardie 2010), lifetime value under constant retention, acquisition-cost payback, and lift (gains) tables
// for churn scores. Pure functions; each is tested against pandas, statsmodels and SciPy, and the sBG fit against
// Fader & Hardie's published estimates, in tests/customer.test.mjs.
import { lnGamma, normQuantile, chi2PUpper, invert } from './stats.js?v=28';

export const DAY = 86_400_000;
/** 'YYYY-MM-DD' → whole days since 1970-01-01 (UTC), so date arithmetic is exact. */
export const dayNum = (iso) => Math.round(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / DAY);
/** Whole days since 1970-01-01 → 'YYYY-MM-DD'. */
export const isoDay = (d) => new Date(d * DAY).toISOString().slice(0, 10);
/** Calendar month index (year × 12 + month − 1) of a day number. */
export const monthOf = (d) => { const t = new Date(d * DAY); return t.getUTCFullYear() * 12 + t.getUTCMonth(); };

// ================================================================ customer summaries
/**
 * One row per customer from transactions [{ id, day, amount }] up to and including `asOf` (a day number; transactions
 * after it are ignored). recency = asOf − last purchase day (0 if they bought on asOf); tenure = asOf − first day;
 * frequency = number of transactions (counting the first); monetary = total spend; aov = monetary ÷ frequency.
 * `repeat` = frequency − 1 (purchases after the first, the count the Pareto/NBD family of models uses).
 */
export function summarise(tx, { asOf } = {}) {
  const by = new Map();
  for (const t of tx) {
    if (t.id == null || !Number.isFinite(t.day) || !Number.isFinite(t.amount) || (asOf != null && t.day > asOf)) continue;
    let c = by.get(t.id);
    if (!c) by.set(t.id, (c = { id: t.id, first: t.day, last: t.day, frequency: 0, monetary: 0 }));
    c.first = Math.min(c.first, t.day); c.last = Math.max(c.last, t.day); c.frequency += 1; c.monetary += t.amount;
  }
  const end = asOf ?? Math.max(...[...by.values()].map((c) => c.last));
  return [...by.values()].map((c) => ({ ...c, monetary: Math.round(c.monetary * 100) / 100, aov: c.monetary / c.frequency,
    recency: end - c.last, tenure: end - c.first, repeat: c.frequency - 1 }));
}

/** Base metrics for a set of customers: counts, repeat rate (share with 2+ purchases), purchases per customer, average
 *  order value (total spend ÷ total purchases, not the mean of customers' averages) and spend per customer. */
export function baseMetrics(customers) {
  const n = customers.length, orders = customers.reduce((s, c) => s + c.frequency, 0), spend = customers.reduce((s, c) => s + c.monetary, 0);
  const repeaters = customers.filter((c) => c.frequency >= 2).length;
  return { customers: n, orders, spend, repeaters, repeatRate: repeaters / n, frequency: orders / n, aov: spend / orders, perCustomer: spend / n };
}

// ================================================================ scoring
/** Type-7 quantile (Excel QUANTILE.INC, NumPy's default) of an unsorted array. */
export function quantile(values, q) {
  const s = Float64Array.from(values).sort(), h = (s.length - 1) * q, lo = Math.floor(h);
  return lo + 1 < s.length ? s[lo] + (h - lo) * (s[lo + 1] - s[lo]) : s[lo];
}
/**
 * Scores 1…k. `method`:
 *  - 'quantile' (default): cut at the k − 1 interior quantiles q(j/k); a value scores 1 + the number of cut points it
 *    exceeds, so ties always share a score and groups can be unequal (pandas pd.cut on the quantile edges, right-closed).
 *  - 'ntile': sort and deal into k groups of near-equal size, the first n mod k groups one larger (SQL NTILE); ties
 *    are broken by `tiebreak` (an array, higher = later), else by position, so equal values can get different scores.
 *  - 'rank': ceil(k × average rank ÷ n), clamped to 1…k (ties share a score; stats.js quintileScores for k = 5).
 *  - 'cuts': fixed cut points `cuts` (ascending); score = 1 + number of cut points the value exceeds.
 * `higherIsBetter: false` reverses the scale (k for the smallest values), as recency needs.
 */
export function score(values, { k = 5, method = 'quantile', higherIsBetter = true, cuts = null, tiebreak = null } = {}) {
  const n = values.length;
  let s;
  if (method === 'ntile') {
    const idx = [...values.keys()].sort((a, b) => (higherIsBetter ? values[a] - values[b] : values[b] - values[a])
      || (tiebreak ? tiebreak[a] - tiebreak[b] : a - b));
    s = new Array(n); const base = Math.floor(n / k), extra = n % k;
    let pos = 0;
    for (let g = 0; g < k; g++) { const size = base + (g < extra ? 1 : 0); for (let j = 0; j < size; j++) s[idx[pos++]] = g + 1; }
    return s;
  }
  if (method === 'rank') {
    const order = [...values.keys()].sort((a, b) => values[a] - values[b]), rk = new Array(n);
    for (let i = 0; i < n;) { let j = i; while (j + 1 < n && values[order[j + 1]] === values[order[i]]) j++; for (let t = i; t <= j; t++) rk[order[t]] = (i + j) / 2 + 1; i = j + 1; }
    s = rk.map((r) => Math.min(k, Math.max(1, Math.ceil((k * r) / n))));
  } else {
    const c = method === 'cuts' ? cuts : Array.from({ length: k - 1 }, (_, j) => quantile(values, (j + 1) / k));
    s = values.map((v) => 1 + c.filter((q) => v > q).length);
    if (method === 'cuts') k = c.length + 1;
  }
  return higherIsBetter ? s : s.map((v) => k + 1 - v);
}
/** The k − 1 interior quantile cut points score() uses for 'quantile'. */
export const cutPoints = (values, k = 5) => Array.from({ length: k - 1 }, (_, j) => quantile(values, (j + 1) / k));

/** One widely used naming of the R × FM grid (R and the rounded mean of F and M, each 1–5). A practitioner
 *  convention, not a standard: other schemes name and draw the cells differently. */
export const SEGMENTS = [
  { name: 'Champions', act: 'Reward them; ask for reviews and referrals.' },
  { name: 'Loyal', act: 'Upsell and invite them into a loyalty scheme.' },
  { name: 'Potential loyalists', act: 'Give them a reason for the next visit.' },
  { name: 'New customers', act: 'Welcome them; make the second purchase easy.' },
  { name: 'Promising', act: 'Introduce the wider range with a small incentive.' },
  { name: 'Need attention', act: 'Send a time-limited offer based on what they buy.' },
  { name: 'About to sleep', act: 'Re-engage with relevant recommendations.' },
  { name: 'At risk', act: 'Contact them personally; find out what changed.' },
  { name: 'Can’t lose them', act: 'Win them back with the best offer, and talk to them.' },
  { name: 'Hibernating', act: 'Low-cost reminders only.' },
  { name: 'Lost', act: 'Very cheap reactivation, or let them go.' },
];
export function segmentOf(r, fm) {
  if (r >= 4 && fm >= 4) return 'Champions';
  if (r === 3 && fm >= 4) return 'Loyal';
  if (r >= 4 && fm === 3) return 'Potential loyalists';
  if (r === 5) return 'New customers';
  if (r === 4) return 'Promising';
  if (r === 3 && fm === 3) return 'Need attention';
  if (r === 3) return 'About to sleep';
  if (fm === 5) return 'Can’t lose them';
  if (fm >= 3) return 'At risk';
  if (r === 2) return 'Hibernating';
  return 'Lost';
}
/** RFM scores for customer summaries: R on recency (lower is better), F on frequency, M on monetary, all by the same
 *  method; FM = round((F + M) ÷ 2) (halves round up); cell 'RFM' as a string; total R + F + M; segment from the grid. */
export function rfm(customers, { k = 5, method = 'quantile', tiebreak = null } = {}) {
  const R = score(customers.map((c) => c.recency), { k, method, higherIsBetter: false, tiebreak });
  const Fq = score(customers.map((c) => c.frequency), { k, method, tiebreak });
  const M = score(customers.map((c) => c.monetary), { k, method, tiebreak });
  return customers.map((c, i) => {
    const fm = Math.floor((Fq[i] + M[i]) / 2 + 0.5);
    return { ...c, R: R[i], F: Fq[i], M: M[i], FM: fm, cell: `${R[i]}${Fq[i]}${M[i]}`, total: R[i] + Fq[i] + M[i], segment: k === 5 ? segmentOf(R[i], fm) : null };
  });
}
/** Counts, customers' share, spend and spend share by a key (segment, cell, R score…), largest spend first. */
export function groupBy(scored, key) {
  const tot = scored.reduce((s, c) => s + c.monetary, 0), m = new Map();
  for (const c of scored) { const g = typeof key === 'function' ? key(c) : c[key]; const v = m.get(g) || { key: g, n: 0, spend: 0, frequency: 0, recency: 0 }; v.n++; v.spend += c.monetary; v.frequency += c.frequency; v.recency += c.recency; m.set(g, v); }
  return [...m.values()].map((v) => ({ ...v, share: v.n / scored.length, spendShare: v.spend / tot, meanSpend: v.spend / v.n, meanFrequency: v.frequency / v.n, meanRecency: v.recency / v.n }))
    .sort((a, b) => b.spend - a.spend);
}

// ================================================================ cohorts
/**
 * Cohort table by calendar month. `joins`: Map or object id → join day; `tx`: [{ id, day, amount }]. A customer is
 * active in month k of their cohort (k = 0 is the join month) if they have a transaction in that calendar month.
 * Months run up to `lastMonth` (a monthOf index; default the last transaction's month), so later cohorts have fewer
 * observed months (the triangle). Returns cohorts (label 'YYYY-MM', size), active[c][k], retention[c][k] = active ÷
 * size, revenue[c][k] and, by months since joining, the pooled active rate over the cohorts observed that long.
 */
export function cohortTable(joins, tx, { lastMonth = null } = {}) {
  const J = joins instanceof Map ? joins : new Map(Object.entries(joins));
  const months = [...new Set([...J.values()].map(monthOf))].sort((a, b) => a - b);
  const last = lastMonth ?? Math.max(...tx.map((t) => monthOf(t.day)));
  const ci = new Map(months.map((m, i) => [m, i]));
  const size = months.map(() => 0);
  for (const d of J.values()) size[ci.get(monthOf(d))]++;
  const width = months.map((m) => last - m + 1);
  const seen = months.map((_, c) => Array.from({ length: width[c] }, () => new Set()));
  const revenue = months.map((_, c) => new Array(width[c]).fill(0));
  for (const t of tx) {
    const jd = J.get(t.id); if (jd == null) continue;
    const c = ci.get(monthOf(jd)), k = monthOf(t.day) - monthOf(jd);
    if (k < 0 || k >= width[c]) continue;
    seen[c][k].add(t.id); revenue[c][k] += t.amount;
  }
  const active = seen.map((row) => row.map((s) => s.size));
  const retention = active.map((row, c) => row.map((a) => a / size[c]));
  const maxK = Math.max(...width), pooled = [];
  for (let k = 0; k < maxK; k++) {
    let a = 0, n = 0; months.forEach((_, c) => { if (k < width[c]) { a += active[c][k]; n += size[c]; } });
    pooled.push({ k, active: a, size: n, rate: a / n, cohorts: months.filter((_, c) => k < width[c]).length });
  }
  const label = (m) => `${Math.floor(m / 12)}-${String((m % 12) + 1).padStart(2, '0')}`;
  return { cohorts: months.map((m, c) => ({ label: label(m), month: m, size: size[c] })), active, retention,
    revenue: revenue.map((row) => row.map((v) => Math.round(v * 100) / 100)), pooled };
}

// ================================================================ retention and churn rates
/** Customer retention over a period: of those at the start, the share still customers at the end (new customers won
 *  during the period are excluded). churn = 1 − retention. */
export function periodRetention({ start, end, acquired }) {
  const kept = end - acquired, r = kept / start;
  return { kept, lost: start - kept, retention: r, churn: 1 - r };
}
/** Convert a constant per-period churn rate to another horizon: 1 − (1 − c)^periods. */
export const compoundChurn = (c, periods) => 1 - (1 - c) ** periods;
/** Expected lifetime in periods under constant retention r, counting the first period: 1 ÷ (1 − r). */
export const expectedLifetime = (r) => 1 / (1 - r);

// ================================================================ survival analysis
/**
 * Kaplan–Meier estimate. times: time to the event or to censoring (> 0); events: 1 = event observed (churned), 0 =
 * censored (still active when observation stopped). Returns one step per distinct event time: t, atRisk, events,
 * censored (censorings at t, counted as at risk at t), S, se (Greenwood), and 95% limits by the log–log transform
 * (Kalbfleisch–Prentice; always inside 0–1). Also the median (first t with S ≤ 0.5, or null) and S(t) as a function.
 */
export function kaplanMeier(times, events, { conf = 0.95 } = {}) {
  const idx = [...times.keys()].sort((a, b) => times[a] - times[b]);
  const z = normQuantile(0.5 + conf / 2);
  let atRisk = times.length, S = 1, gw = 0;
  const steps = [];
  for (let i = 0; i < idx.length;) {
    const t = times[idx[i]]; let d = 0, c = 0, j = i;
    while (j < idx.length && times[idx[j]] === t) { if (events[idx[j]]) d++; else c++; j++; }
    if (d > 0) {
      S *= 1 - d / atRisk;
      gw += atRisk > d ? d / (atRisk * (atRisk - d)) : Infinity;
      const se = S * Math.sqrt(gw);
      let low = NaN, high = NaN;
      if (S > 0 && S < 1 && Number.isFinite(gw)) {
        const v = Math.sqrt(gw) / Math.log(S);                    // SE of log(−log S) is √gw ÷ |log S|
        low = S ** Math.exp(-z * v); high = S ** Math.exp(z * v);   // log S < 0, so v < 0: low < S < high
        if (low > high) [low, high] = [high, low];
      }
      steps.push({ t, atRisk, events: d, censored: c, S, se, low, high });
    } else if (steps.length) steps[steps.length - 1].censoredAfter = (steps[steps.length - 1].censoredAfter || 0) + c;
    atRisk -= d + c; i = j;
  }
  const med = steps.find((s) => s.S <= 0.5);
  const at = (t) => { let s = 1; for (const st of steps) { if (st.t > t) break; s = st.S; } return s; };
  return { steps, median: med ? med.t : null, at, n: times.length, events: events.reduce((a, b) => a + (b ? 1 : 0), 0) };
}
/**
 * Lapse-defined lifetimes. A member has lapsed at a visit followed by more than L days without another (within the data,
 * which ends on `end`); the lifetime is days from joining to that visit, the event 1, so a member who never came back
 * after joining lapses at 0. A member who lapsed and later came back counts as lapsed the first time. A member whose last
 * visit is within L days of `end` hasn't lapsed yet: censored at their last visit (known to be active then).
 * lapse: { joins: { id: join day }, visits: { id: [visit days, ascending] }, end: last day of data }.
 */
export function lapseTimes(lapse, L) {
  const out = { times: [], events: [], ids: [] };
  for (const [id, join] of Object.entries(lapse.joins)) {
    const v = lapse.visits[id] || [join];
    let t = null, ev = 0;
    for (let i = 0; i < v.length; i++) {
      const next = i + 1 < v.length ? v[i + 1] : lapse.end + L + 1;   // no later visit: the gap runs past the end
      if (next - v[i] > L && (i + 1 < v.length || lapse.end - v[i] > L)) { t = v[i] - join; ev = 1; break; }
    }
    if (t == null) { t = v[v.length - 1] - join; ev = 0; }
    out.ids.push(id); out.times.push(t); out.events.push(ev);
  }
  return out;
}
/** Log-rank test of equal survival across groups (χ² on groups − 1 df), as statsmodels survdiff computes it. */
export function logRank(times, events, groups) {
  const labels = [...new Set(groups)], G = labels.length;
  const ts = [...new Set(times.filter((_, i) => events[i]))].sort((a, b) => a - b);
  const O = new Array(G).fill(0), E = new Array(G).fill(0), V = Array.from({ length: G }, () => new Array(G).fill(0));
  for (const t of ts) {
    const n = labels.map((g) => times.filter((x, i) => groups[i] === g && x >= t).length);
    const d = labels.map((g) => times.filter((x, i) => groups[i] === g && x === t && events[i]).length);
    const N = n.reduce((a, b) => a + b, 0), D = d.reduce((a, b) => a + b, 0);
    if (N < 2) { labels.forEach((_, g) => { O[g] += d[g]; E[g] += N ? D * n[g] / N : 0; }); continue; }
    for (let g = 0; g < G; g++) {
      O[g] += d[g]; E[g] += D * n[g] / N;
      for (let h = 0; h < G; h++) V[g][h] += D * (N - D) / (N - 1) * (n[g] / N) * ((g === h ? 1 : 0) - n[h] / N);
    }
  }
  const k = G - 1, diff = O.slice(0, k).map((o, g) => o - E[g]);
  const Vi = invert(V.slice(0, k).map((row) => row.slice(0, k)));
  let chi2 = 0; for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) chi2 += diff[a] * Vi[a][b] * diff[b];
  return { groups: labels, observed: O, expected: E, chi2, df: k, p: chi2PUpper(chi2, k) };
}

// ================================================================ the shifted-beta-geometric model
const lnBeta = (a, b) => lnGamma(a) + lnGamma(b) - lnGamma(a + b);
/** sBG: probability of churning in period t (t = 1, 2, …): B(α + 1, β + t − 1) ÷ B(α, β). */
export const sbgP = (a, b, t) => Math.exp(lnBeta(a + 1, b + t - 1) - lnBeta(a, b));
/** sBG survivor function: share still a customer after t renewals' worth of periods, S(t) = B(α, β + t) ÷ B(α, β). */
export const sbgS = (a, b, t) => (t <= 0 ? 1 : Math.exp(lnBeta(a, b + t) - lnBeta(a, b)));
/** sBG retention rate in period t: S(t) ÷ S(t − 1) = (β + t − 1) ÷ (α + β + t − 1); it rises with t. */
export const sbgRetention = (a, b, t) => (b + t - 1) / (a + b + t - 1);

/**
 * Maximum-likelihood sBG fit. cohorts: [{ alive: [n0, n1, …, nT] }] — customers still active at the start and after
 * each period (n0 = cohort size). Churners in period t contribute log P(T = t); the nT still active contribute log S(T).
 * Nelder–Mead on (log α, log β) from several starts; standard errors from the numerical Hessian of the
 * log-likelihood in (α, β).
 */
export function sbgFit(cohorts) {
  const ll = (a, b) => {
    let s = 0;
    for (const { alive } of cohorts) {
      for (let t = 1; t < alive.length; t++) { const lost = alive[t - 1] - alive[t]; if (lost) s += lost * Math.log(sbgP(a, b, t)); }
      const T = alive.length - 1; if (alive[T]) s += alive[T] * Math.log(sbgS(a, b, T));
    }
    return s;
  };
  const f = ([x, y]) => -ll(Math.exp(x), Math.exp(y));
  let best = null;
  for (const st of [[0, 0], [-1, 1], [1, 2], [-2, -1], [0.5, 3]]) { const r = nelderMead(f, st); if (!best || r.fx < best.fx) best = r; }
  const a = Math.exp(best.x[0]), b = Math.exp(best.x[1]);
  // Hessian of −ll in (α, β) by central differences
  const g = (u, v) => -ll(u, v), ha = a * 1e-4, hb = b * 1e-4;
  const faa = (g(a + ha, b) - 2 * g(a, b) + g(a - ha, b)) / ha ** 2, fbb = (g(a, b + hb) - 2 * g(a, b) + g(a, b - hb)) / hb ** 2;
  const fab = (g(a + ha, b + hb) - g(a + ha, b - hb) - g(a - ha, b + hb) + g(a - ha, b - hb)) / (4 * ha * hb);
  const det = faa * fbb - fab ** 2;
  return { alpha: a, beta: b, logLik: -best.fx, seAlpha: Math.sqrt(fbb / det), seBeta: Math.sqrt(faa / det),
    meanChurn: a / (a + b), S: (t) => sbgS(a, b, t), r: (t) => sbgRetention(a, b, t) };
}
function nelderMead(f, x0, { iter = 4000, tol = 1e-12 } = {}) {
  const n = x0.length; let pts = [x0.slice()];
  for (let i = 0; i < n; i++) { const p = x0.slice(); p[i] += 0.5; pts.push(p); }
  let vals = pts.map(f);
  for (let it = 0; it < iter; it++) {
    const o = [...pts.keys()].sort((a, b) => vals[a] - vals[b]); pts = o.map((i) => pts[i]); vals = o.map((i) => vals[i]);
    if (Math.abs(vals[n] - vals[0]) < tol * (1 + Math.abs(vals[0])) && it > 50) break;
    const c = Array.from({ length: n }, (_, j) => pts.slice(0, n).reduce((s, p) => s + p[j], 0) / n);
    const at = (t) => c.map((cj, j) => cj + t * (pts[n][j] - cj));
    const xr = at(-1), fr = f(xr);
    if (fr < vals[0]) { const xe = at(-2), fe = f(xe); if (fe < fr) { pts[n] = xe; vals[n] = fe; } else { pts[n] = xr; vals[n] = fr; } }
    else if (fr < vals[n - 1]) { pts[n] = xr; vals[n] = fr; }
    else {
      const xc = fr < vals[n] ? at(-0.5) : at(0.5), fc = f(xc);
      if (fc < Math.min(fr, vals[n])) { pts[n] = xc; vals[n] = fc; }
      else for (let i = 1; i <= n; i++) { pts[i] = pts[i].map((v, j) => pts[0][j] + 0.5 * (v - pts[0][j])); vals[i] = f(pts[i]); }
    }
  }
  return { x: pts[0], fx: vals[0] };
}

/**
 * Discounted expected residual lifetime (Fader & Hardie 2010, eq. 9): for a customer who has been active for n periods
 * and is about to renew, Σ_{t ≥ n} [S(t) ÷ S(n − 1)] ÷ (1 + d)^(t − n). Cash is booked at the start of each period,
 * so the coming renewal is undiscounted. Multiply by the margin per period for residual lifetime value.
 */
export function sbgDERL(a, b, d, n = 1, { tol = 1e-12, maxT = 200_000 } = {}) {
  const s0 = sbgS(a, b, n - 1); let sum = 0;
  for (let t = n; t < n + maxT; t++) { const term = sbgS(a, b, t) / s0 / (1 + d) ** (t - n); sum += term; if (term < tol * sum) break; }
  return sum;
}
/** Discounted expected lifetime of a customer just acquired: the first period (paid now) plus every renewal,
 *  Σ_{t ≥ 0} S(t) ÷ (1 + d)^t = 1 + DERL(n = 1) ÷ (1 + d). */
export const sbgDEL = (a, b, d) => 1 + sbgDERL(a, b, d, 1) / (1 + d);
/** Gauss hypergeometric ₂F₁(a, b; c; z) for |z| < 1 by its series (to check the closed form of DERL). */
export function hyp2f1(a, b, c, z, { tol = 1e-15, maxN = 1_000_000 } = {}) {
  let term = 1, sum = 1;
  for (let k = 0; k < maxN; k++) { term *= (a + k) * (b + k) / ((c + k) * (k + 1)) * z; sum += term; if (Math.abs(term) < tol * Math.abs(sum)) break; }
  return sum;
}

// ================================================================ lifetime value and payback
/**
 * Lifetime value with constant retention r per period, margin m per period and discount rate d per period.
 * timing 'start': the margin arrives at the start of each period the customer is active, the first now:
 *   Σ_{t=0}^{H−1} m r^t ÷ (1 + d)^t → m (1 + d) ÷ (1 + d − r) as H → ∞.
 * timing 'end': the first margin arrives at the end of the first period, and only if the customer is retained
 *   (the value of a customer seen just after the first period's margin has been paid, before the first renewal):
 *   Σ_{t=1}^{H} m r^t ÷ (1 + d)^t → m r ÷ (1 + d − r).
 * horizon: number of periods H (Infinity for the closed form). `curve` gives the cumulative value after each period.
 */
export function clvConstant({ m, r, d = 0, timing = 'start', horizon = Infinity }) {
  if (!(r >= 0 && r < 1 + d)) return { error: 'Retention must be at least 0 and below 1 + d.' };
  const term = (t) => m * r ** t / (1 + d) ** t;
  const first = timing === 'start' ? 0 : 1;
  const closed = timing === 'start' ? m * (1 + d) / (1 + d - r) : m * r / (1 + d - r);
  let value = closed;
  if (Number.isFinite(horizon)) { value = 0; for (let t = first; t < first + horizon; t++) value += term(t); }
  const curve = (H) => { const out = []; let s = 0; for (let t = first; t < first + H; t++) { s += term(t); out.push(s); } return out; };
  return { value, closed, curve, multiple: closed / m };
}
/** Periods until the cumulative (discounted, retention-weighted) margin of an acquired customer first covers the
 *  acquisition cost, with margins at the start of each period (period 1 = the first). Infinity if it never does. */
export function payback({ cac, m, r, d = 0, maxT = 1200 }) {
  let s = 0;
  for (let t = 0; t < maxT; t++) { s += m * r ** t / (1 + d) ** t; if (s >= cac - 1e-9) return t + 1; }
  return Infinity;
}
/** Payback ignoring retention and discounting: CAC ÷ margin per period (the optimistic figure often quoted). */
export const simplePayback = (cac, m) => cac / m;

// ================================================================ scoring models: gains and lift
/**
 * Lift table: sort by score (highest first; ties keep their order), cut into k groups of near-equal size (the first
 * n mod k one larger), and report each group's n, positives, rate, lift (rate ÷ overall rate) and the cumulative share
 * of all positives captured (the gains curve).
 */
export function liftTable(y, scores, k = 10) {
  const idx = [...y.keys()].sort((a, b) => scores[b] - scores[a] || a - b), n = y.length;
  const P = y.reduce((a, v) => a + v, 0), base = P / n, size = Math.floor(n / k), extra = n % k;
  const rows = []; let pos = 0, cumP = 0, cumN = 0;
  for (let g = 0; g < k; g++) {
    const m = size + (g < extra ? 1 : 0); let p = 0;
    for (let j = 0; j < m; j++) p += y[idx[pos++]];
    cumP += p; cumN += m;
    rows.push({ group: g + 1, n: m, positives: p, rate: p / m, lift: p / m / base, cumShare: cumN / n, captured: cumP / P, cumLift: (cumP / cumN) / base });
  }
  return { rows, base, positives: P, n };
}
