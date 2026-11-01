// logistic.js — the `logistic` lesson widget (B06): logistic regression for a yes/no outcome. The fitted S-curve of
// the probability against one predictor (the others held at values the student sets), the 0/1 outcomes drawn at the
// top and bottom (with a little vertical jitter for drawing only), the coefficients with odds ratios, the
// likelihood-ratio test and McFadden's pseudo-R², and a threshold the student moves to see the classification table.
// Numbers from core/regression.js and core/classify.js.
//   { type: 'logistic', title, y: { name, values (0/1), yes: 'returned', no: 'didn’t return' },
//     xs: { 'First ticket ($)': [...], Near: [...], … }, axis: 'First ticket ($)' (the x of the curve),
//     binary?: ['Near', …] (predictors offered as 0/1 switches), threshold?: 0.5, show: ['coefs', 'odds', 'lr', 'table'], note }
import { h, onResize } from '../../core/dom.js?v=22';
import { xl } from '../xl.js?v=22';
import { scatter } from '../../core/charts.js?v=22';
import * as R from '../../core/regression.js?v=22';
import { confusion } from '../../core/classify.js?v=22';
import * as F from '../../core/format.js?v=22';

const fmt = (v, d = 3) => (Number.isFinite(v) ? F.num(v, d) : '—');
const pStr = (p) => (!Number.isFinite(p) ? '—' : p < 0.001 ? 'below 0.001' : p.toFixed(3));

/** The fitted model the widget shows (exported for the checker). */
export function compute(y, xs) { return R.logistic(y, xs); }

export function mount(el, cfg, ctx) {
  const base = `lg-${ctx.id}`;
  const names = Object.keys(cfg.xs), y = cfg.y.values;
  const m = compute(y, cfg.xs);
  const show = cfg.show || ['coefs', 'odds', 'lr', 'table'];
  const binary = new Set(cfg.binary || names.filter((n) => cfg.xs[n].every((v) => v === 0 || v === 1)));
  const axis = cfg.axis || names.find((n) => !binary.has(n)) || names[0];
  const mean = (a) => a.reduce((t, v) => t + v, 0) / a.length;
  const st = { at: Object.fromEntries(names.map((n) => [n, binary.has(n) ? 0 : mean(cfg.xs[n])])), t: cfg.threshold ?? 0.5 };
  if (m.error) { el.append(h('p', { class: 'fx-note is-error' }, m.error)); return; }
  const others = names.filter((n) => n !== axis);
  const fields = others.map((n, i) => {
    const id = `${base}-o${i}`;
    if (binary.has(n)) {
      const inp = h('input', { type: 'checkbox', id });
      inp.addEventListener('change', () => { st.at[n] = inp.checked ? 1 : 0; render(); });
      return h('div', { class: 'field sp-check' }, inp, h('label', { for: id }, n));
    }
    const inp = h('input', { type: 'number', id, value: +st.at[n].toFixed(2), step: 'any' });
    inp.addEventListener('input', () => { if (Number.isFinite(+inp.value)) { st.at[n] = +inp.value; render(); } });
    return h('div', { class: 'field' }, h('label', { for: id }, `${n} held at`), inp);
  });
  const tid = `${base}-t`, tIn = h('input', { type: 'range', id: tid, min: 0.05, max: 0.95, step: 0.05, value: st.t }), tOut = h('output', { for: tid });
  tIn.addEventListener('input', () => { st.t = +tIn.value; render(); });
  const chart = h('div', { class: 'chart-box' }), out = h('div', { class: 'cv-out', 'aria-live': 'polite' }), tbl = h('div');
  el.classList.add('cv-widget');
  el.append(...[cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null,
    fields.length ? h('div', { class: 'cv-fields' }, ...fields) : null, chart, out,
    show.includes('table') ? h('div', { class: 'field' }, h('label', { for: tid }, 'Classify as “', cfg.y.yes || 'yes', '” when the probability is at least ', tOut), tIn) : null, tbl,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null].filter(Boolean));

  function render() {
    tOut.textContent = st.t.toFixed(2);
    const xa = cfg.xs[axis], lo = Math.min(...xa), hi = Math.max(...xa);
    const pAt = (v) => m.predict(names.map((n) => (n === axis ? v : st.at[n])));
    chart.replaceChildren();
    const jit = (i) => { const t = Math.sin((i + 1) * 78.233) * 43758.5453; return (t - Math.floor(t) - 0.5) * 0.06; };
    scatter(chart, { points: xa.map((v, i) => ({ x: v, y: y[i] + (y[i] ? -0.03 : 0.03) + jit(i), cls: `${y[i] ? 'm-s1' : 'm-s3'}${xa.length > 150 ? ' m-dense' : ''}` })),
      curves: [{ fn: pAt, cls: 'm-s2' }], yDomain: [0, 1], height: 280, xLabel: axis, yLabel: `Probability (${cfg.y.yes || 'yes'})`,
      label: `Fitted probability of ${cfg.y.yes || 'yes'} against ${axis}, with each case drawn at 1 (${cfg.y.yes || 'yes'}) or 0 (${cfg.y.no || 'no'})` });
    const items = [];
    if (show.includes('coefs') || show.includes('odds')) items.push(h('div', { class: 'table-scroll' }, h('table', { class: 'data-table study-table' },
      h('caption', {}, `Logistic regression of ${cfg.y.name} (${m.n} cases)`),
      h('thead', {}, h('tr', {}, ...['', 'Coefficient (log-odds)', 'Std. error', 'z', 'p-value', ...(show.includes('odds') ? ['Odds ratio', '95% CI for the odds ratio'] : [])].map((c) => h('th', { scope: 'col' }, c)))),
      h('tbody', {}, ...m.coefs.map((c) => h('tr', {}, h('th', { scope: 'row' }, c.name), h('td', {}, fmt(c.estimate)), h('td', {}, fmt(c.se)), h('td', {}, fmt(c.z, 2)), h('td', {}, pStr(c.p)),
        ...(show.includes('odds') ? [h('td', {}, c.name === 'Intercept' ? '' : fmt(c.or)), h('td', {}, c.name === 'Intercept' ? '' : `${fmt(c.orLow)} to ${fmt(c.orHigh)}`)] : [])))))));
    if (show.includes('lr')) items.push(h('p', {}, `Likelihood-ratio test against the model with no predictors: χ² = ${fmt(m.lr, 2)} on ${m.lrDf} df, p ${m.lrP < 0.001 ? 'below 0.001' : `= ${pStr(m.lrP)}`}. McFadden’s pseudo-R² = ${fmt(m.mcfadden)}.`));
    out.replaceChildren(...items);
    tbl.replaceChildren();
    if (show.includes('table')) {
      const c = confusion(y, m.prob, st.t);
      tbl.append(h('table', { class: 'lg-matrix' }, h('caption', {}, `Classification at a threshold of ${st.t.toFixed(2)}`),
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, ''), h('th', { scope: 'col' }, `Predicted ${cfg.y.yes || 'yes'}`), h('th', { scope: 'col' }, `Predicted ${cfg.y.no || 'no'}`))),
        h('tbody', {}, h('tr', {}, h('th', { scope: 'row' }, `Actually ${cfg.y.yes || 'yes'}`), h('td', {}, String(c.tp)), h('td', {}, String(c.fn))),
          h('tr', {}, h('th', { scope: 'row' }, `Actually ${cfg.y.no || 'no'}`), h('td', {}, String(c.fp)), h('td', {}, String(c.tn))))),
        h('p', { class: 'small' }, `Accuracy ${fmt(c.accuracy * 100, 1)}%; sensitivity ${fmt(c.recall * 100, 1)}%; specificity ${fmt(c.specificity * 100, 1)}%. Without a model, always guessing the commoner outcome is right ${fmt(Math.max(m.base, 1 - m.base) * 100, 1)}% of the time.`));
    }
  }
  render();
  onResize(chart, render);
}
