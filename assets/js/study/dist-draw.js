// dist-draw.js — shared by B04's distribution widgets (curve, power): each named distribution with its density, tails,
// inverse and the Excel formula that gives the same number, and an SVG drawing of a density or probability mass
// function with shaded regions and labelled markers.
import { s, h } from '../core/dom.js?v=16';
import { frame, lin, niceTicks, axisX } from '../core/charts.js?v=16';
import * as I from '../core/inference.js?v=16';

/** A number as typed into an Excel formula: plain digits, no thousands separators, at most 10 significant figures. */
export const xn = (v) => String(Number(Number(v).toPrecision(10)));
/** A probability for display: four decimal places, or “less than 0.0001”. */
export const fmtP = (p) => (!Number.isFinite(p) ? '—' : p > 0 && p < 0.0001 ? 'less than 0.0001' : p > 0.9999 && p < 1 ? 'more than 0.9999' : p.toFixed(4));
/** A value on the x-axis for display, with thousands separators. */
export const fmtX = (v, places) => (!Number.isFinite(v) ? '—' : v.toLocaleString('en-US', { maximumFractionDigits: places ?? (Math.abs(v) >= 100 ? 2 : 4), minimumFractionDigits: 0 }));

/**
 * Build a distribution: { name, discrete, pdf, cdf (P(X ≤ x)), sf (P(X > x)), inv(p), lo, hi, label, excel }.
 * excel.below(a), excel.above(a), excel.between(a, b), excel.exact(k), excel.inv(p), excel.invRight(q) give formulas.
 */
export function makeDist(name, p = {}) {
  if (name === 'normal') {
    const mu = p.mean ?? 0, sd = p.sd ?? 1, std = mu === 0 && sd === 1;
    const args = `${xn(mu)},${xn(sd)}`;
    return {
      name, discrete: false, label: std ? 'the standard normal distribution' : `a normal distribution with mean ${fmtX(mu)} and standard deviation ${fmtX(sd)}`,
      pdf: (x) => I.normal.pdf(x, mu, sd), cdf: (x) => I.normal.cdf(x, mu, sd), sf: (x) => I.normal.sf(x, mu, sd), inv: (q) => I.normal.inv(q, mu, sd),
      lo: mu - 4 * sd, hi: mu + 4 * sd, symmetric: mu,
      excel: std
        ? { below: (a) => `=NORM.S.DIST(${xn(a)},TRUE)`, above: (a) => `=1-NORM.S.DIST(${xn(a)},TRUE)`, between: (a, b) => `=NORM.S.DIST(${xn(b)},TRUE)-NORM.S.DIST(${xn(a)},TRUE)`, inv: (q) => `=NORM.S.INV(${xn(q)})`, invRight: (q) => `=NORM.S.INV(${xn(1 - q)})` }
        : { below: (a) => `=NORM.DIST(${xn(a)},${args},TRUE)`, above: (a) => `=1-NORM.DIST(${xn(a)},${args},TRUE)`, between: (a, b) => `=NORM.DIST(${xn(b)},${args},TRUE)-NORM.DIST(${xn(a)},${args},TRUE)`, inv: (q) => `=NORM.INV(${xn(q)},${args})`, invRight: (q) => `=NORM.INV(${xn(1 - q)},${args})` },
    };
  }
  if (name === 't') {
    const df = p.df ?? 10, w = Math.min(8, Math.max(4, -I.tInv(0.002, df)));
    return {
      name, discrete: false, label: `a t distribution with ${df} degrees of freedom`,
      pdf: (x) => I.tPdf(x, df), cdf: (x) => I.tCdf(x, df), sf: (x) => I.tSf(x, df), inv: (q) => I.tInv(q, df), lo: -w, hi: w, symmetric: 0,
      excel: { below: (a) => `=T.DIST(${xn(a)},${df},TRUE)`, above: (a) => `=T.DIST.RT(${xn(a)},${df})`, between: (a, b) => `=T.DIST(${xn(b)},${df},TRUE)-T.DIST(${xn(a)},${df},TRUE)`, inv: (q) => `=T.INV(${xn(q)},${df})`, invRight: (q) => `=T.INV(${xn(1 - q)},${df})`, twoTail: (a) => `=T.DIST.2T(${xn(Math.abs(a))},${df})` },
    };
  }
  if (name === 'chisq') {
    const df = p.df ?? 4;
    return {
      name, discrete: false, label: `a chi-square distribution with ${df} degree${df === 1 ? '' : 's'} of freedom`,
      pdf: (x) => I.chi2Pdf(x, df), cdf: (x) => I.chi2Cdf(x, df), sf: (x) => I.chi2Sf(x, df), inv: (q) => I.chi2Inv(q, df), lo: 0, hi: I.chi2InvSf(0.001, df),
      excel: { below: (a) => `=CHISQ.DIST(${xn(a)},${df},TRUE)`, above: (a) => `=CHISQ.DIST.RT(${xn(a)},${df})`, between: (a, b) => `=CHISQ.DIST(${xn(b)},${df},TRUE)-CHISQ.DIST(${xn(a)},${df},TRUE)`, inv: (q) => `=CHISQ.INV(${xn(q)},${df})`, invRight: (q) => `=CHISQ.INV.RT(${xn(q)},${df})` },
    };
  }
  if (name === 'f') {
    const d1 = p.df1 ?? 3, d2 = p.df2 ?? 30;
    return {
      name, discrete: false, label: `an F distribution with ${d1} and ${d2} degrees of freedom`,
      pdf: (x) => I.fPdf(x, d1, d2), cdf: (x) => I.fCdf(x, d1, d2), sf: (x) => I.fSf(x, d1, d2), inv: (q) => I.fInv(q, d1, d2), lo: 0, hi: Math.max(4, I.fInvSf(0.002, d1, d2)),
      excel: { below: (a) => `=F.DIST(${xn(a)},${d1},${d2},TRUE)`, above: (a) => `=F.DIST.RT(${xn(a)},${d1},${d2})`, between: (a, b) => `=F.DIST(${xn(b)},${d1},${d2},TRUE)-F.DIST(${xn(a)},${d1},${d2},TRUE)`, inv: (q) => `=F.INV(${xn(q)},${d1},${d2})`, invRight: (q) => `=F.INV.RT(${xn(q)},${d1},${d2})` },
    };
  }
  if (name === 'binomial') {
    const n = p.n ?? 10, q = p.p ?? 0.5;
    let lo = 0, hi = n;
    while (lo < n && I.binomPmf(lo, n, q) < 1e-4 && I.binomCdf(lo, n, q) < 1e-4) lo++;
    while (hi > 0 && I.binomPmf(hi, n, q) < 1e-4 && I.binomSf(hi - 1, n, q) < 1e-4) hi--;
    const args = `${n},${xn(q)}`;
    return {
      name, discrete: true, label: `a binomial distribution with ${n} trials and probability ${xn(q)}`,
      pdf: (k) => I.binomPmf(k, n, q), cdf: (k) => I.binomCdf(k, n, q), sf: (k) => I.binomSf(k, n, q), inv: (a) => I.binomInv(a, n, q), lo, hi, max: n,
      excel: { exact: (k) => `=BINOM.DIST(${k},${args},FALSE)`, below: (k) => `=BINOM.DIST(${k},${args},TRUE)`, above: (k) => (k <= 0 ? '=1' : `=1-BINOM.DIST(${k - 1},${args},TRUE)`), between: (a, b) => `=BINOM.DIST.RANGE(${args},${a},${b})`, inv: (a) => `=BINOM.INV(${args},${xn(a)})` },
    };
  }
  if (name === 'poisson') {
    const lam = p.lambda ?? 2;
    let hi = Math.ceil(lam + 5 * Math.sqrt(lam) + 4);
    while (hi > 1 && I.poissonPmf(hi, lam) < 1e-4 && I.poissonSf(hi - 1, lam) < 1e-4) hi--;
    return {
      name, discrete: true, label: `a Poisson distribution with mean ${xn(lam)}`,
      pdf: (k) => I.poissonPmf(k, lam), cdf: (k) => I.poissonCdf(k, lam), sf: (k) => I.poissonSf(k, lam), inv: null, lo: 0, hi,
      excel: { exact: (k) => `=POISSON.DIST(${k},${xn(lam)},FALSE)`, below: (k) => `=POISSON.DIST(${k},${xn(lam)},TRUE)`, above: (k) => (k <= 0 ? '=1' : `=1-POISSON.DIST(${k - 1},${xn(lam)},TRUE)`), between: (a, b) => (a <= 0 ? `=POISSON.DIST(${b},${xn(lam)},TRUE)` : `=POISSON.DIST(${b},${xn(lam)},TRUE)-POISSON.DIST(${a - 1},${xn(lam)},TRUE)`) },
    };
  }
  throw new Error(`unknown distribution ${name}`);
}

/**
 * Draw a distribution. regions: [{ from, to, cls, dist? }] shaded under the curve (or under `dist`, another curve drawn
 * in `curves`) for a continuous distribution, or the bars from..to (inclusive) for a discrete one; marks: [{ x, label, cls }]; curves: [{ dist, cls }] extra outlines (a reference distribution).
 */
export function drawDist(box, { dist, regions = [], marks = [], curves = [], xLabel = '', format = (v) => fmtX(v), height = 240, label = '', lo, hi, yMax }) {
  const L = lo ?? dist.lo, H = hi ?? dist.hi;
  const fr = frame(box, { height, label, margin: { t: 30, r: 14, b: 46, l: 14 } });
  const x = lin(L, H, 0, fr.iw);
  let peak = yMax;
  if (peak == null) {
    peak = 0;
    if (dist.discrete) for (let k = Math.ceil(L); k <= Math.floor(H); k++) peak = Math.max(peak, dist.pdf(k));
    else for (let i = 0; i <= 200; i++) { const v = dist.pdf(L + ((H - L) * i) / 200); if (Number.isFinite(v)) peak = Math.max(peak, v); }
    for (const c of curves) for (let i = 0; i <= 200; i++) { const v = c.dist.pdf(L + ((H - L) * i) / 200); if (Number.isFinite(v)) peak = Math.max(peak, v); }
    peak = peak * 1.08 || 1;
  }
  const y = (v) => fr.ih - (Math.min(v, peak) / peak) * fr.ih;
  const g = fr.g;
  const rows = [];                                    // marker labels sit above the plot, staggered so they never overlap
  if (dist.discrete) {
    const ks = []; for (let k = Math.ceil(L); k <= Math.floor(H); k++) ks.push(k);
    const bw = Math.max(1.5, Math.min(26, (fr.iw / Math.max(1, ks.length)) * 0.72));
    const xk = lin(L - 0.5, H + 0.5, 0, fr.iw);
    for (const k of ks) {
      const r = regions.find((rg) => k >= rg.from && k <= rg.to);
      g.append(s('rect', { x: xk(k) - bw / 2, y: y(dist.pdf(k)), width: bw, height: Math.max(0, fr.ih - y(dist.pdf(k))), class: r ? `cv-bar ${r.cls || 'cv-in'}` : 'cv-bar' }));
    }
    const step = Math.max(1, Math.ceil(ks.length / 10));
    const tk = ks.filter((k) => (k - ks[0]) % step === 0);
    axisX(fr, xk, tk, { format: (v) => String(v), label: xLabel });
    for (const m of marks) if (Number.isFinite(m.x)) markAt(xk(m.x), m);
  } else {
    for (const rg of regions) {
      const a = Math.max(L, rg.from ?? L), b = Math.min(H, rg.to ?? H);
      if (!(b > a)) continue;
      const pts = []; const N = 120;
      const under = rg.dist || dist;
      for (let i = 0; i <= N; i++) { const v = a + ((b - a) * i) / N; pts.push(`${x(v).toFixed(2)},${y(under.pdf(v)).toFixed(2)}`); }
      g.append(s('path', { d: `M${x(a).toFixed(2)},${fr.ih}L${pts.join('L')}L${x(b).toFixed(2)},${fr.ih}Z`, class: `cv-area ${rg.cls || 'cv-in'}` }));
    }
    for (const c of curves) g.append(s('path', { d: pathOf(c.dist), class: `cv-line ${c.cls || 'cv-ref'}` }));
    g.append(s('path', { d: pathOf(dist), class: 'cv-line' }));
    const t = niceTicks(L, H, Math.max(3, Math.min(8, Math.floor(fr.iw / 70)))).ticks.filter((v) => v >= L - 1e-9 && v <= H + 1e-9);
    axisX(fr, x, t, { format, label: xLabel });
    for (const m of marks) if (Number.isFinite(m.x) && m.x >= L && m.x <= H) markAt(x(m.x), m);
  }
  function pathOf(d) {
    const N = 240, pts = [];
    for (let i = 0; i <= N; i++) { const v = L + ((H - L) * i) / N; const p = d.pdf(v); if (Number.isFinite(p)) pts.push(`${x(v).toFixed(2)},${y(p).toFixed(2)}`); }
    return `M${pts.join('L')}`;
  }
  function markAt(px, m) {
    const w = (m.label || '').length * 6.4 + 8;
    const left = Math.max(-fr.m.l + 2, Math.min(fr.iw + fr.m.r - w, px - w / 2));
    let row = rows.findIndex((end) => left > end + 4); if (row < 0) { row = rows.length; rows.push(0); } rows[row] = left + w;
    g.append(s('line', { x1: px, x2: px, y1: -4 - row * 12, y2: fr.ih, class: `cv-mark ${m.cls || ''}` }));
    if (m.label) g.append(s('text', { x: left + 4, y: -8 - row * 12, class: 'cv-mark-label' }, m.label));
  }
  return fr;
}

/** A labelled number input inside a field. */
export function numberField(id, label, value, { min, max, step = 'any', onInput, hint } = {}) {
  const inp = h('input', { type: 'number', id, value: String(value), step: String(step), inputmode: 'decimal', class: 'cv-num', ...(min != null ? { min: String(min) } : {}), ...(max != null ? { max: String(max) } : {}) });
  if (onInput) inp.addEventListener('input', onInput);
  return { inp, el: h('div', { class: 'field cv-field' }, h('label', { for: id }, label), inp, hint ? h('span', { class: 'field-hint' }, hint) : '') };
}
/** A segmented radio group. */
export function segmented(id, label, options, value, onChange) {
  const lid = `${id}-l`;
  const box = h('div', { class: 'segmented cv-seg', role: 'radiogroup', 'aria-labelledby': lid });
  for (const [k, text] of options) {
    const rid = `${id}-${k}`;
    const inp = h('input', { type: 'radio', name: id, id: rid, value: k });
    inp.checked = k === value;
    inp.addEventListener('change', () => { if (inp.checked) onChange(k); });
    box.append(inp, h('label', { for: rid }, text));
  }
  return h('div', { class: 'field cv-field' }, h('span', { class: 'field-label', id: lid }, label), box);
}
