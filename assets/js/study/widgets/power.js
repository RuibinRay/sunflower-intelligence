// power.js — the `power` lesson widget (B04): the sampling distribution of a mean (or of a difference in two means)
// when the null hypothesis is true and when a stated alternative is, with the rejection region, the Type I error rate
// (α), the Type II error rate (β) and the power shaded, and the sample size that would give 80% power. The test is a z
// test with the population SD treated as known (the normal approximation the lesson explains).
//   { type: 'power', title, sigma, delta, n, alpha: 0.05, alternative: 'two-sided' | 'greater' | 'less',
//     twoSample: false, vary: ['n', 'delta', 'sigma', 'alpha'], units: 'g', null: 250 (the null value, for labels),
//     xLabel, note }
import { h, onResize } from '../../core/dom.js?v=19';
import { xl } from '../xl.js?v=19';
import * as I from '../../core/inference.js?v=19';
import { makeDist, drawDist, fmtX, numberField, segmented } from '../dist-draw.js?v=19';

export function mount(el, cfg, ctx) {
  const base = `pw-${ctx.id}`;
  const st = { n: cfg.n ?? 30, delta: cfg.delta ?? 1, sigma: cfg.sigma ?? 2, alpha: cfg.alpha ?? 0.05, alternative: cfg.alternative || 'two-sided' };
  const vary = cfg.vary || ['n', 'delta'];
  const box = h('div', { class: 'cv-fields' });
  const num = (key, label, opts) => {
    if (!vary.includes(key)) return;
    const f = numberField(`${base}-${key}`, label, st[key], { ...opts, onInput: () => { const v = Number(f.inp.value); if (f.inp.value !== '' && Number.isFinite(v)) { st[key] = v; draw(); } } });
    box.append(f.el);
  };
  const u = cfg.units ? ` (${cfg.units})` : '';
  num('n', cfg.twoSample ? 'Sample size per group (n)' : 'Sample size (n)', { min: 2, max: 100000, step: 1 });
  num('delta', `True difference from the null value${u}`, { step: 'any' });
  num('sigma', `Population SD (σ)${u}`, { min: 0.0001, step: 'any' });
  const alphaBox = vary.includes('alpha') ? segmented(`${base}-alpha`, 'Significance level (α)', [['0.01', '0.01'], ['0.05', '0.05'], ['0.1', '0.10']], String(st.alpha), (k) => { st.alpha = Number(k); draw(); }) : '';
  const altBox = vary.includes('alternative') ? segmented(`${base}-alt`, 'Alternative hypothesis', [['two-sided', 'Two-sided (≠)'], ['greater', 'Greater (>)'], ['less', 'Less (<)']], st.alternative, (k) => { st.alternative = k; draw(); }) : '';
  const chart = h('div', { class: 'chart-box cv-chart' });
  const out = h('div', { class: 'cv-out', 'aria-live': 'polite' });
  el.classList.add('cv-widget');
  el.append(...[cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null, box.childNodes.length ? box : null, alphaBox || null, altBox || null, chart,
    h('ul', { class: 'legend cv-legend', role: 'list' },
      h('li', {}, h('i', { class: 'cv-key cv-key-reject' }), 'α: rejecting H₀ when it is true (Type I error)'),
      h('li', {}, h('i', { class: 'cv-key cv-key-power' }), 'power: rejecting H₀ when the alternative is true'),
      h('li', {}, h('i', { class: 'cv-key cv-key-beta' }), 'β: missing a real difference (Type II error)')),
    out, cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null].filter(Boolean));

  function draw() {
    const n = Math.trunc(st.n), { delta, sigma, alpha, alternative } = st;
    if (!(n >= 2) || !(sigma > 0)) { chart.replaceChildren(); out.replaceChildren(h('p', { class: 'fx-note is-error', role: 'alert' }, 'Use a sample size of at least 2 and an SD above 0.')); return; }
    const se = sigma * Math.sqrt((cfg.twoSample ? 2 : 1) / n);
    const H0 = makeDist('normal', { mean: 0, sd: se }), H1 = makeDist('normal', { mean: delta, sd: se });
    const z2 = I.normInv(1 - alpha / 2), z1 = I.normInv(1 - alpha);
    const lo = alternative === 'two-sided' ? -z2 * se : alternative === 'less' ? -z1 * se : null;
    const hi = alternative === 'two-sided' ? z2 * se : alternative === 'greater' ? z1 * se : null;
    const power = I.powerMean({ delta, sigma, n, alpha, alternative, twoSample: !!cfg.twoSample });
    const L = Math.min(-4 * se, delta - 4 * se), R = Math.max(4 * se, delta + 4 * se);
    // power and β are areas under the alternative's curve; α is the area under the null's curve beyond the critical values
    const shift = cfg.null ?? 0, X = (v) => v + shift;
    drawDist(chart, {
      dist: H1, lo: L, hi: R, curves: [{ dist: H0, cls: 'cv-null' }],
      regions: [
        ...(lo != null ? [{ from: L, to: lo, cls: 'cv-power' }] : []), ...(hi != null ? [{ from: hi, to: R, cls: 'cv-power' }] : []),
        { from: lo ?? L, to: hi ?? R, cls: 'cv-beta' },
        ...(lo != null ? [{ from: L, to: lo, cls: 'cv-reject', dist: H0 }] : []), ...(hi != null ? [{ from: hi, to: R, cls: 'cv-reject', dist: H0 }] : []),
      ],
      marks: [{ x: 0, label: `H₀: ${fmtX(X(0))}`, cls: 'cv-mark-null' }, { x: delta, label: `true: ${fmtX(X(delta))}`, cls: 'cv-mark-alt' },
        ...(lo != null ? [{ x: lo, label: `critical ${fmtX(X(lo), 3)}`, cls: 'cv-mark-crit' }] : []), ...(hi != null ? [{ x: hi, label: `critical ${fmtX(X(hi), 3)}`, cls: 'cv-mark-crit' }] : [])],
      xLabel: cfg.xLabel || (cfg.twoSample ? 'Difference in sample means' : 'Sample mean'), format: (v) => fmtX(X(v), 3),
      label: `Two normal curves for the ${cfg.twoSample ? 'difference in sample means' : 'sample mean'}: centred on the null value ${fmtX(X(0))} and on the true value ${fmtX(X(delta))}, each with standard error ${fmtX(se, 4)}. Power ${(power * 100).toFixed(1)}%.`,
    });
    // a one-sided test can only detect a difference in its own direction: no sample size reaches 80% power otherwise
    const wrongWay = (alternative === 'greater' && delta <= 0) || (alternative === 'less' && delta >= 0);
    const nNeed = I.sampleSizeForPower({ delta: Math.abs(delta) || 1e-9, sigma, alpha, power: 0.8, alternative: alternative === 'two-sided' ? 'two-sided' : 'one-sided', twoSample: !!cfg.twoSample });
    out.replaceChildren(
      h('dl', { class: 'stats-row stats-dense' },
        [['Standard error', fmtX(se, 4)], ['Power', `${(power * 100).toFixed(1)}%`], ['β (Type II)', `${((1 - power) * 100).toFixed(1)}%`], ['α (Type I)', String(alpha)],
          ['n for 80% power', delta === 0 || wrongWay ? '—' : `${nNeed.toLocaleString('en-US')}${cfg.twoSample ? ' per group' : ''}`]]
          .map(([k, v]) => h('div', { class: 'stat' }, h('dt', {}, k), h('dd', { class: 'num' }, v)))),
      h('p', { class: 'fx-note' }, delta === 0
        ? 'With no true difference, every rejection is a Type I error: the chance of one is α.'
        : wrongWay
          ? `The alternative points the other way from the true ${cfg.twoSample ? 'difference' : 'mean'} (${fmtX(X(delta))}), so the test almost never rejects H₀, however large the sample: a one-sided test can only detect a difference in the direction it names.`
          : `If the true ${cfg.twoSample ? 'difference' : 'mean'} is ${fmtX(X(delta))}, a sample of ${n}${cfg.twoSample ? ' per group' : ''} detects it ${(power * 100).toFixed(1)}% of the time at α = ${alpha}. The rest of the time the ${cfg.twoSample ? 'difference in sample means' : 'sample mean'} ${alternative === 'two-sided' ? 'falls between the critical values' : 'doesn’t reach the critical value'} and the test misses it.`));
    ctx.report?.('power', { n, power });
  }
  draw();
  onResize(el, draw);
}
