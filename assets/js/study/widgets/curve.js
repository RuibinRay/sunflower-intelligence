// curve.js — the `curve` lesson widget (B04): a probability distribution drawn as a curve (normal, t, chi-square, F)
// or as bars (binomial, Poisson), with the area for a question shaded, the probability, and the Excel formula that
// gives the same number. Optionally a rejection region for a test at level alpha, and a test statistic marked on it.
//   { type: 'curve', title, dist: 'normal' | 't' | 'chisq' | 'f' | 'binomial' | 'poisson',
//     params: { mean, sd } | { df } | { df1, df2 } | { n, p } | { lambda },
//     vary: ['mean', 'sd'] (the parameters the student can change), limits: { sd: [min, max, step] },
//     asks: ['below', 'above', 'between', 'outside', 'exact', 'inverse'] (the first is shown first), a, b, prob (for
//     'inverse': the probability below the value wanted),
//     xLabel, places (decimals for x values), overlay: 'normal' (t only: the standard normal for comparison),
//     critical: { alpha: 0.05, tails: 'two' | 'upper' | 'lower' }, stat: { value, label } (a test statistic), note }
import { h, onResize } from '../../core/dom.js?v=12';
import { xl } from '../xl.js?v=12';
import { makeDist, drawDist, fmtP, fmtX, numberField, segmented } from '../dist-draw.js?v=12';

const PARAMS = {
  normal: [['mean', 'Mean (μ)', null, null, 'any'], ['sd', 'Standard deviation (σ)', 0.0001, null, 'any']],
  t: [['df', 'Degrees of freedom', 1, 500, 1]],
  chisq: [['df', 'Degrees of freedom', 1, 200, 1]],
  f: [['df1', 'Numerator df', 1, 200, 1], ['df2', 'Denominator df', 1, 500, 1]],
  binomial: [['n', 'Trials (n)', 1, 1000, 1], ['p', 'Probability of success (p)', 0, 1, 0.01]],
  poisson: [['lambda', 'Mean (λ)', 0.01, 200, 'any']],
};
export const CURVE_PARAMS = Object.fromEntries(Object.entries(PARAMS).map(([k, v]) => [k, v.map((x) => x[0])]));
export const ASKS = ['below', 'above', 'between', 'outside', 'exact', 'inverse'];

export function mount(el, cfg, ctx) {
  const base = `cv-${ctx.id}`;
  const st = { ...cfg.params, ask: (cfg.asks || ['below'])[0], a: cfg.a ?? 0, b: cfg.b ?? 1, prob: cfg.prob ?? 0.95 };
  const discrete = cfg.dist === 'binomial' || cfg.dist === 'poisson';
  const sym = discrete ? { lt: '≤', gt: '≥', lt2: '≤' } : { lt: '<', gt: '>', lt2: '<' };
  const ASK_LABEL = {
    below: `P(X ${sym.lt} a)`, above: `P(X ${sym.gt} a)`, between: `P(a ${sym.lt2} X ${sym.lt2} b)`,
    outside: 'Both tails', exact: 'P(X = k)', inverse: 'Value for a probability',
  };
  const asks = (cfg.asks || ['below']).filter((k) => ASK_LABEL[k] && !(k === 'exact' && !discrete) && !(k === 'inverse' && cfg.dist === 'poisson'));
  const inputs = {};
  const paramBox = h('div', { class: 'cv-fields' });
  for (const [key, label, min, max, step] of PARAMS[cfg.dist]) {
    if (!(cfg.vary || []).includes(key)) continue;
    const lim = cfg.limits?.[key] || [];
    const f = numberField(`${base}-${key}`, label, st[key], { min: lim[0] ?? min, max: lim[1] ?? max, step: lim[2] ?? step, onInput: () => { const v = Number(f.inp.value); if (f.inp.value !== '' && Number.isFinite(v)) { st[key] = v; draw(); } } });
    inputs[key] = f; paramBox.append(f.el);
  }
  const fa = numberField(`${base}-a`, discrete && st.ask === 'exact' ? 'k' : 'a', st.a, { step: discrete ? 1 : 'any', onInput: () => { const v = Number(fa.inp.value); if (fa.inp.value !== '' && Number.isFinite(v)) { st.a = v; draw(); } } });
  const fb = numberField(`${base}-b`, 'b', st.b, { step: discrete ? 1 : 'any', onInput: () => { const v = Number(fb.inp.value); if (fb.inp.value !== '' && Number.isFinite(v)) { st.b = v; draw(); } } });
  const fp = numberField(`${base}-prob`, 'Probability below the value', st.prob, { min: 0.0001, max: 0.9999, step: 0.01, onInput: () => { const v = Number(fp.inp.value); if (fp.inp.value !== '' && Number.isFinite(v)) { st.prob = v; draw(); } } });
  const askBox = asks.length > 1 ? segmented(`${base}-ask`, 'Question', asks.map((k) => [k, ASK_LABEL[k]]), st.ask, (k) => { st.ask = k; draw(); ctx.report?.('interact', { ask: k }); }) : '';
  const qBox = h('div', { class: 'cv-fields' }, fa.el, fb.el, fp.el);
  const chart = h('div', { class: 'chart-box cv-chart' });
  const out = h('div', { class: 'cv-out', 'aria-live': 'polite' });
  el.classList.add('cv-widget');
  el.append(...[cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null, paramBox.childNodes.length ? paramBox : null, askBox || null, qBox, chart, out,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null].filter(Boolean));

  function draw() {
    const params = Object.fromEntries((PARAMS[cfg.dist] || []).map(([k]) => [k, st[k]]));
    if (cfg.dist === 'normal' && !(params.sd > 0)) return fail('The standard deviation must be more than 0.');
    if (['t', 'chisq'].includes(cfg.dist) && !(params.df >= 1)) return fail('The degrees of freedom must be at least 1.');
    if (cfg.dist === 'f' && !(params.df1 >= 1 && params.df2 >= 1)) return fail('Both degrees of freedom must be at least 1.');
    if (cfg.dist === 'binomial' && !(params.n >= 1 && params.p >= 0 && params.p <= 1)) return fail('Use at least 1 trial and a probability between 0 and 1.');
    if (cfg.dist === 'poisson' && !(params.lambda > 0)) return fail('The mean must be more than 0.');
    if (['t', 'chisq'].includes(cfg.dist)) params.df = Math.trunc(params.df);
    if (cfg.dist === 'f') { params.df1 = Math.trunc(params.df1); params.df2 = Math.trunc(params.df2); }
    if (cfg.dist === 'binomial') params.n = Math.trunc(params.n);
    const D = makeDist(cfg.dist, params);
    const ask = st.ask;
    fa.el.hidden = ask === 'inverse'; fb.el.hidden = !(ask === 'between' || (ask === 'outside' && D.symmetric == null));
    fp.el.hidden = ask !== 'inverse';
    fa.el.querySelector('label').textContent = ask === 'exact' ? 'k' : ask === 'outside' && D.symmetric != null ? 'Distance from the centre' : 'a';
    let a = st.a, b = st.b;
    if (discrete) { a = Math.round(a); b = Math.round(b); }
    let prob, text, formula, regions = [], marks = [];
    const nm = 'X';
    if (ask === 'below') { prob = D.cdf(a); regions = [{ from: D.lo - 1e9, to: a, cls: 'cv-in' }]; marks = [{ x: a, label: `a = ${fmtX(a, cfg.places)}` }]; text = `P(${nm} ${sym.lt} ${fmtX(a, cfg.places)}) = ${fmtP(prob)}`; formula = D.excel.below(a); }
    else if (ask === 'above') { prob = discrete ? D.sf(a - 1) : D.sf(a); regions = [{ from: a, to: D.hi + 1e9, cls: 'cv-in' }]; marks = [{ x: a, label: `a = ${fmtX(a, cfg.places)}` }]; text = `P(${nm} ${sym.gt} ${fmtX(a, cfg.places)}) = ${fmtP(prob)}`; formula = D.excel.above(a); }
    else if (ask === 'between') {
      if (b < a) return fail('b must be at least a.');
      prob = discrete ? D.cdf(b) - D.cdf(a - 1) : D.cdf(b) - D.cdf(a); regions = [{ from: a, to: b, cls: 'cv-in' }];
      marks = [{ x: a, label: `a = ${fmtX(a, cfg.places)}` }, { x: b, label: `b = ${fmtX(b, cfg.places)}` }];
      text = `P(${fmtX(a, cfg.places)} ${sym.lt2} ${nm} ${sym.lt2} ${fmtX(b, cfg.places)}) = ${fmtP(prob)}`; formula = D.excel.between(a, b);
    } else if (ask === 'outside') {
      if (D.symmetric != null) {
        const c = D.symmetric, d = Math.abs(a), lo = c - d, hi = c + d;
        prob = D.cdf(lo) + D.sf(hi); regions = [{ from: D.lo - 1e9, to: lo, cls: 'cv-in' }, { from: hi, to: D.hi + 1e9, cls: 'cv-in' }];
        marks = [{ x: lo, label: fmtX(lo, cfg.places) }, { x: hi, label: fmtX(hi, cfg.places) }];
        text = `P(${nm} ${sym.lt} ${fmtX(lo, cfg.places)} or ${nm} ${sym.gt} ${fmtX(hi, cfg.places)}) = ${fmtP(prob)}`;
        formula = D.excel.twoTail && c === 0 ? D.excel.twoTail(d) : `=2*${D.excel.below(lo).slice(1)}`;
      } else {
        if (b < a) return fail('b must be at least a.');
        prob = D.cdf(a) + D.sf(b); regions = [{ from: D.lo - 1e9, to: a, cls: 'cv-in' }, { from: b, to: D.hi + 1e9, cls: 'cv-in' }];
        marks = [{ x: a, label: `a = ${fmtX(a, cfg.places)}` }, { x: b, label: `b = ${fmtX(b, cfg.places)}` }];
        text = `P(${nm} ${sym.lt} ${fmtX(a, cfg.places)} or ${nm} ${sym.gt} ${fmtX(b, cfg.places)}) = ${fmtP(prob)}`; formula = `${D.excel.below(a)}+${D.excel.above(b).slice(1)}`;
      }
    } else if (ask === 'exact') {
      prob = D.pdf(a); regions = [{ from: a, to: a, cls: 'cv-in' }]; marks = [];
      text = `P(${nm} = ${a}) = ${fmtP(prob)}`; formula = D.excel.exact(a);
    } else {
      const q = st.prob; if (!(q > 0 && q < 1)) return fail('Give a probability between 0 and 1.');
      const v = D.inv(q); regions = [{ from: D.lo - 1e9, to: v, cls: 'cv-in' }]; marks = [{ x: v, label: fmtX(v, cfg.places ?? 4) }];
      text = discrete ? `The smallest k with P(${nm} ≤ k) ≥ ${q} is ${v}` : `P(${nm} < ${fmtX(v, cfg.places ?? 4)}) = ${q}`;
      formula = D.excel.inv(q); prob = q;
    }
    // a test's rejection region and statistic
    const extra = [];
    if (cfg.critical) {
      const al = cfg.critical.alpha ?? 0.05, tails = cfg.critical.tails || 'two';
      const lo = tails === 'two' ? D.inv(al / 2) : tails === 'lower' ? D.inv(al) : null;
      const hi = tails === 'two' ? D.inv(1 - al / 2) : tails === 'upper' ? D.inv(1 - al) : null;
      if (lo != null) { regions.push({ from: D.lo - 1e9, to: lo, cls: 'cv-reject' }); marks.push({ x: lo, label: `critical ${fmtX(lo, 3)}`, cls: 'cv-mark-crit' }); }
      if (hi != null) { regions.push({ from: hi, to: D.hi + 1e9, cls: 'cv-reject' }); marks.push({ x: hi, label: `critical ${fmtX(hi, 3)}`, cls: 'cv-mark-crit' }); }
      extra.push(h('p', { class: 'cv-line-text' }, `Rejection region at α = ${al} (${tails === 'two' ? 'two-tailed' : tails === 'upper' ? 'upper tail' : 'lower tail'}): `,
        [lo != null ? `below ${fmtX(lo, 3)}` : null, hi != null ? `above ${fmtX(hi, 3)}` : null].filter(Boolean).join(' or '), '.'));
    }
    if (cfg.stat && Number.isFinite(cfg.stat.value)) marks.push({ x: cfg.stat.value, label: `${cfg.stat.label || 'statistic'} = ${fmtX(cfg.stat.value, 3)}`, cls: 'cv-mark-stat' });
    const curves = cfg.overlay === 'normal' && cfg.dist === 't' ? [{ dist: makeDist('normal', { mean: 0, sd: 1 }), cls: 'cv-ref' }] : [];
    const desc = `${D.label}: ${text}.`;
    drawDist(chart, { dist: D, regions, marks, curves, xLabel: cfg.xLabel || '', format: (v) => fmtX(v, cfg.places), label: `Chart of ${desc}` });
    out.replaceChildren(
      h('p', { class: 'cv-result' }, h('strong', {}, text)),
      h('p', { class: 'cv-excel' }, 'In Excel: ', h('code', { class: 'xl' }, formula)),
      ...extra,
      curves.length ? h('p', { class: 'fx-note' }, 'Dashed: the standard normal distribution, for comparison. The t distribution has heavier tails; the two get closer as the degrees of freedom grow.') : '');
    ctx.report?.('curve', { ask, prob });
  }
  function fail(msg) { chart.replaceChildren(); out.replaceChildren(h('p', { class: 'fx-note is-error', role: 'alert' }, msg)); }
  draw();
  onResize(el, draw);
}
