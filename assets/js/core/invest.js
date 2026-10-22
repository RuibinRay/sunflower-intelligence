// invest.js — capital budgeting: NPV, IRR (every root), MIRR, payback, profitability index, crossover rate,
// and capital rationing by exact search. Checked against numpy-financial, NumPy and SciPy (tests/make_fixtures.py).

/** Net present value at `rate`; flows[0] falls today, flows[t] at the end of year t. */
export function npv(rate, flows) {
  let v = 0, d = 1;
  for (let t = 0; t < flows.length; t++) { v += flows[t] / d; d *= 1 + rate; }
  return v;
}

/** How many times the cash-flow signs change (zeros skipped). More than one change can mean more than one IRR. */
export function signChanges(flows) {
  let n = 0, last = 0;
  for (const f of flows) { if (!f) continue; const sg = Math.sign(f); if (last && sg !== last) n++; last = sg; }
  return n;
}

/** Every internal rate of return between −99% and +1000%: scan for sign changes of NPV, then bisect each bracket. */
export function irrAll(flows, { lo = -0.99, hi = 10, steps = 4000 } = {}) {
  if (signChanges(flows) === 0) return [];
  // scan on log(1 + r) so short rates get fine steps and long ones coarse
  const a = Math.log1p(lo), b = Math.log1p(hi), roots = [];
  let rPrev = lo, fPrev = npv(rPrev, flows);
  for (let k = 1; k <= steps; k++) {
    const r = Math.expm1(a + ((b - a) * k) / steps), f = npv(r, flows);
    if (fPrev === 0) roots.push(rPrev);
    else if (Math.sign(f) !== Math.sign(fPrev) && f !== 0) roots.push(bisect((x) => npv(x, flows), rPrev, r));
    rPrev = r; fPrev = f;
  }
  if (fPrev === 0) roots.push(rPrev);
  return roots.filter((r, i) => i === 0 || Math.abs(r - roots[i - 1]) > 1e-9);
}
function bisect(f, a, b) {
  let fa = f(a);
  for (let i = 0; i < 200; i++) {
    const m = (a + b) / 2, fm = f(m);
    if (fm === 0 || (b - a) / 2 < 1e-15) return m;
    if (Math.sign(fm) === Math.sign(fa)) { a = m; fa = fm; } else b = m;
  }
  return (a + b) / 2;
}
/** The IRR when there is exactly one; NaN when there is none or several (see irrAll). */
export function irr(flows) { const r = irrAll(flows); return r.length === 1 ? r[0] : NaN; }

/** Modified IRR (as in Excel and numpy-financial): outflows discounted at `financeRate`, inflows compounded at `reinvestRate`. */
export function mirr(flows, financeRate, reinvestRate) {
  const n = flows.length - 1;
  let pvNeg = 0, fvPos = 0;
  flows.forEach((f, t) => {
    if (f < 0) pvNeg += f / (1 + financeRate) ** t;
    else fvPos += f * (1 + reinvestRate) ** (n - t);
  });
  if (pvNeg >= 0 || fvPos <= 0 || n < 1) return NaN;
  return (fvPos / -pvNeg) ** (1 / n) - 1;
}

/** Years until the cumulative (optionally discounted) cash flow first reaches zero, interpolated within the year. NaN if never. */
export function payback(flows, rate = null) {
  let cum = 0;
  for (let t = 0; t < flows.length; t++) {
    const f = rate == null ? flows[t] : flows[t] / (1 + rate) ** t;
    const before = cum; cum += f;
    if (t > 0 && before < 0 && cum >= 0) return t - 1 + -before / f;
    if (t === 0 && cum >= 0) return 0;
  }
  return NaN;
}

/** Profitability index: present value of everything after today per dollar invested today. */
export function profitabilityIndex(rate, flows) {
  const outlay = -flows[0];
  if (!(outlay > 0)) return NaN;
  return (npv(rate, flows) + outlay) / outlay;
}

/** All the measures for one project. */
export function appraise(flows, { rate, financeRate = rate, reinvestRate = rate }) {
  const roots = irrAll(flows);
  return {
    npv: npv(rate, flows), irrs: roots, irr: roots.length === 1 ? roots[0] : NaN,
    mirr: mirr(flows, financeRate, reinvestRate), payback: payback(flows), discPayback: payback(flows, rate),
    pi: profitabilityIndex(rate, flows), signChanges: signChanges(flows),
  };
}

/** Rates at which two projects have equal NPV: the IRRs of their difference. */
export function crossover(a, b) {
  const n = Math.max(a.length, b.length);
  const diff = Array.from({ length: n }, (_, t) => (a[t] || 0) - (b[t] || 0));
  return irrAll(diff).filter((r) => r > -0.99 && r < 10);
}

/**
 * Capital rationing with indivisible projects: the set with the highest total NPV whose outlays fit the budget,
 * by checking every combination (fine up to ~16 projects), next to the usual shortcut of ranking by PI.
 * projects: [{name, outlay, npv}]
 */
export function ration(projects, budget) {
  const n = projects.length;
  if (n > 16) throw new Error('Up to 16 projects.');
  let best = { mask: 0, npv: 0, outlay: 0 };
  for (let mask = 1; mask < 1 << n; mask++) {
    let o = 0, v = 0;
    for (let i = 0; i < n; i++) if (mask & (1 << i)) { o += projects[i].outlay; v += projects[i].npv; }
    if (o <= budget + 1e-9 && (v > best.npv + 1e-9 || (Math.abs(v - best.npv) <= 1e-9 && o < best.outlay))) best = { mask, npv: v, outlay: o };
  }
  const exact = projects.map((_, i) => !!(best.mask & (1 << i)));
  // PI shortcut: take positive-NPV projects in order of PI while they fit (skipping any that don't)
  const order = projects.map((p, i) => i).filter((i) => projects[i].npv > 0 && projects[i].outlay > 0)
    .sort((i, j) => (projects[j].npv + projects[j].outlay) / projects[j].outlay - (projects[i].npv + projects[i].outlay) / projects[i].outlay);
  const greedy = projects.map(() => false);
  let left = budget, gNpv = 0, gOut = 0;
  for (const i of order) if (projects[i].outlay <= left + 1e-9) { greedy[i] = true; left -= projects[i].outlay; gNpv += projects[i].npv; gOut += projects[i].outlay; }
  // divisible projects: fill by PI, taking a fraction of the last one (the linear-programming answer)
  const frac = projects.map(() => 0);
  let room = budget, fNpv = 0;
  for (const i of order) { const take = Math.max(0, Math.min(1, room / projects[i].outlay)); frac[i] = take; room -= take * projects[i].outlay; fNpv += take * projects[i].npv; if (room <= 1e-9) break; }
  return { exact, exactNpv: best.npv, exactOutlay: best.outlay, greedy, greedyNpv: gNpv, greedyOutlay: gOut, order, fractions: frac, fractionalNpv: fNpv };
}
