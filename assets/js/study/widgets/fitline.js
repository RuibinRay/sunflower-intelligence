// fitline.js — the `fitline` lesson widget (B06): a scatterplot with a line the student sets by its intercept and
// slope, the residuals drawn as vertical segments (and, optionally, as squares), and the sum of squared residuals.
// "Show the least-squares line" puts the line where that sum is smallest, so the student sees what "least squares"
// means before reading a formula. The least-squares figures come from core/regression.js.
//   { type: 'fitline', title, x: { name, values, unit? }, y: { name, values, unit? }, labels?: [...],
//     start: { intercept, slope }, ranges: { intercept: [lo, hi, step], slope: [lo, hi, step] },
//     show: ['residuals', 'squares', 'sse', 'mean'] (draw the mean line ȳ and its SST for comparison), note }
import { h, s, onResize } from '../../core/dom.js?v=27';
import { xl } from '../xl.js?v=27';
import { scatter } from '../../core/charts.js?v=27';
import * as R from '../../core/regression.js?v=27';
import * as F from '../../core/format.js?v=27';

const fmt = (v, d = 2) => (Number.isFinite(v) ? F.num(v, d) : '—');

/** The least-squares line and sums of squares the widget compares against (exported for the checker). */
export function leastSquares(xs, ys) {
  const f = R.fit(ys, { x: xs });
  return { intercept: f.beta[0], slope: f.beta[1], sse: f.sse, sst: f.sst, r2: f.r2 };
}
export const sseOf = (xs, ys, a, b) => xs.reduce((t, x, i) => t + (ys[i] - a - b * x) ** 2, 0);

export function mount(el, cfg, ctx) {
  const base = `fl-${ctx.id}`;
  const xs = cfg.x.values, ys = cfg.y.values;
  const ls = leastSquares(xs, ys);
  const show = cfg.show || ['residuals', 'sse'];
  const st = { a: cfg.start?.intercept ?? ls.intercept, b: cfg.start?.slope ?? 0, squares: show.includes('squares') };
  const span = (v) => Math.max(1, Math.abs(v)) * 2;
  const rg = cfg.ranges || { intercept: [ls.intercept - span(ls.intercept), ls.intercept + span(ls.intercept), 0.01], slope: [ls.slope - span(ls.slope), ls.slope + span(ls.slope), 0.001] };
  const slider = (key, label, [lo, hi, step]) => {
    const id = `${base}-${key}`;
    const inp = h('input', { type: 'range', id, min: lo, max: hi, step, value: st[key] });
    const out = h('output', { for: id });
    inp.addEventListener('input', () => { st[key] = +inp.value; render(); });
    return { inp, out, row: h('div', { class: 'field' }, h('label', { for: id }, label, ' ', out), inp) };
  };
  const A = slider('a', 'Intercept', rg.intercept), B = slider('b', 'Slope', rg.slope);
  const best = h('button', { type: 'button', class: 'btn btn-secondary btn-sm' }, 'Show the least-squares line');
  best.addEventListener('click', () => { st.a = ls.intercept; st.b = ls.slope; A.inp.value = st.a; B.inp.value = st.b; render(); });
  const sq = h('input', { type: 'checkbox', id: `${base}-sq`, ...(st.squares ? { checked: '' } : {}) });
  sq.addEventListener('change', () => { st.squares = sq.checked; render(); });
  const chart = h('div', { class: 'chart-box' });
  const out = h('div', { class: 'cv-out', 'aria-live': 'polite' });
  el.classList.add('cv-widget');
  el.append(...[cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null,
    h('div', { class: 'cv-fields' }, A.row, B.row),
    h('div', { class: 'sp-toggles' }, best, h('div', { class: 'field sp-check' }, sq, h('label', { for: sq.id }, 'Draw the squared residuals'))),
    chart, out,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null].filter(Boolean));

  function render() {
    A.out.textContent = fmt(st.a, 2); B.out.textContent = fmt(st.b, 3);
    chart.replaceChildren();
    const curves = [{ fn: (x) => st.a + st.b * x, cls: 'm-s2' }];
    const my = ys.reduce((t, v) => t + v, 0) / ys.length;
    if (show.includes('mean')) curves.push({ fn: () => my, cls: 'm-s3' });
    const fr = scatter(chart, { points: xs.map((x, i) => ({ x, y: ys[i], title: cfg.labels ? cfg.labels[i] : '' })), curves, height: 300,
      xLabel: `${cfg.x.name}${cfg.x.unit ? ` (${cfg.x.unit})` : ''}`, yLabel: `${cfg.y.name}${cfg.y.unit ? ` (${cfg.y.unit})` : ''}`,
      label: `Scatterplot of ${cfg.y.name} against ${cfg.x.name} with the line ${cfg.y.name} = ${fmt(st.a)} + ${fmt(st.b, 3)} × ${cfg.x.name}` });
    if (show.includes('residuals') || st.squares) {
      const g = s('g', { class: 'fl-resid', 'aria-hidden': 'true' });
      xs.forEach((x, i) => {
        const yhat = st.a + st.b * x, px = fr.x(x), py = fr.y(ys[i]), ph = fr.y(yhat);
        if (st.squares) { const side = Math.abs(py - ph); g.append(s('rect', { x: st.b >= 0 ? px - side : px, y: Math.min(py, ph), width: side, height: side, class: 'fl-square' })); }
        g.append(s('line', { x1: px, x2: px, y1: py, y2: ph, class: 'fl-seg' }));
      });
      fr.g.prepend(g);
    }
    const sse = sseOf(xs, ys, st.a, st.b);
    const items = [h('li', {}, h('b', {}, 'Your line: '), `${cfg.y.name} = ${fmt(st.a)} + ${fmt(st.b, 3)} × ${cfg.x.name}`)];
    if (show.includes('sse')) items.push(h('li', {}, h('b', {}, 'Sum of squared residuals: '), fmt(sse, 1), sse <= ls.sse * 1.0005 ? ' (the smallest possible)' : ` (least squares: ${fmt(ls.sse, 1)})`));
    if (show.includes('mean')) items.push(h('li', {}, h('b', {}, 'Squared distances from the mean ȳ (SST): '), fmt(ls.sst, 1)));
    out.replaceChildren(h('ul', { class: 'sc-stats' }, ...items));
  }
  render();
  onResize(chart, render);
}
