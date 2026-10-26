// regression.js — the "regression" lesson widget: the Summary Output that Excel's Analysis ToolPak Regression tool
// produces (B03), for data the lesson supplies, with a choice of X variables and, for one X, a scatter chart with the
// fitted line. The statistics come from core/stats.js ols().
//   { type: 'regression', title, y: { name, values }, xs: [{ name, values }], picked: [0], format?: { x, y }, note }
import { h } from '../../core/dom.js?v=19';
import { xl } from '../xl.js?v=19';
import { ols } from '../../core/stats.js?v=19';
import { scatter } from '../../core/charts.js?v=19';
import * as F from '../../core/format.js?v=19';

/** Numbers as the ToolPak prints them, shortened: 6 significant figures (2 decimals from 10,000 up); tiny values in E notation (1.23E-08). */
function num(v) {
  if (!Number.isFinite(v)) return '#N/A';
  if (v !== 0 && Math.abs(v) < 1e-4) return v.toExponential(2).replace('e', 'E').replace(/E([+-])(\d)$/, 'E$10$2');
  if (Math.abs(v) >= 1e4) return String(Math.round(v * 100) / 100);   // large sums of squares keep their whole part
  return String(Number(v.toPrecision(6)));
}
const table = (caption, head, rows) => h('div', { class: 'table-scroll' }, h('table', { class: 'data-table study-table' },
  h('caption', {}, caption),
  head ? h('thead', {}, h('tr', {}, head.map((c) => h('th', { scope: 'col' }, c)))) : null,
  h('tbody', {}, rows.map((r) => h('tr', {}, r.map((c, k) => (k === 0 ? h('th', { scope: 'row' }, c) : h('td', {}, c))))))));

export function mount(el, cfg, ctx) {
  const base = `rg-${ctx.id}`;
  const picked = new Set(cfg.picked || [0]);
  const boxes = cfg.xs.map((x, i) => {
    const cb = h('input', { type: 'checkbox', id: `${base}-x${i}`, checked: picked.has(i) });
    cb.addEventListener('change', draw);
    return { cb, row: h('label', { for: cb.id }, cb, h('span', {}, x.name)) };
  });
  const out = h('div', { class: 'rg-out', 'aria-live': 'polite' });
  const chart = h('div', { class: 'chart-box' });
  function draw() {
    const use = cfg.xs.filter((_, i) => boxes[i].cb.checked);
    if (!use.length) { out.replaceChildren(h('p', { class: 'fx-note is-error' }, 'Choose at least one X variable (Input X Range).')); chart.replaceChildren(); return; }
    const fit = ols(use.map((x) => x.values), cfg.y.values, { names: use.map((x) => x.name) });
    if (fit.error) { out.replaceChildren(h('p', { class: 'fx-note is-error' }, fit.error)); chart.replaceChildren(); return; }
    const ssr = fit.sst - fit.sse;
    out.replaceChildren(
      h('h4', {}, 'Summary output'),
      table('Regression Statistics', null, [['Multiple R', num(Math.sqrt(fit.r2))], ['R Square', num(fit.r2)], ['Adjusted R Square', num(fit.adjR2)], ['Standard Error', num(fit.sigma)], ['Observations', String(fit.n)]]),
      table('ANOVA', ['', 'df', 'SS', 'MS', 'F', 'Significance F'], [
        ['Regression', String(fit.dfModel), num(ssr), num(ssr / fit.dfModel), num(fit.F), num(fit.pF)],
        ['Residual', String(fit.df), num(fit.sse), num(fit.s2), '', ''],
        ['Total', String(fit.n - 1), num(fit.sst), '', '', '']]),
      table('Coefficients', ['', 'Coefficients', 'Standard Error', 't Stat', 'P-value', 'Lower 95%', 'Upper 95%'],
        fit.coefs.map((c) => [c.name, num(c.estimate), num(c.se), num(c.t), num(c.p), num(c.low), num(c.high)])));
    chart.replaceChildren();
    if (use.length === 1) {
      const xs = use[0].values, b0 = fit.beta[0], b1 = fit.beta[1];
      const fx = cfg.format?.x === 'money' ? (v) => F.money(v) : (v) => F.auto(v), fy = cfg.format?.y === 'money' ? (v) => F.money(v) : (v) => F.auto(v);
      scatter(chart, { points: xs.map((x, i) => ({ x, y: cfg.y.values[i] })), curves: [{ fn: (x) => b0 + b1 * x }], xLabel: use[0].name, yLabel: cfg.y.name, xFormat: fx, yFormat: fy, height: 280,
        label: `Scatter chart of ${cfg.y.name} against ${use[0].name}, with the fitted line ${cfg.y.name} = ${num(b0)} + ${num(b1)} × ${use[0].name}` });
      chart.append(h('p', { class: 'fx-note' }, `Trendline: y = ${num(b1)}x ${b0 < 0 ? '−' : '+'} ${num(Math.abs(b0))}, R² = ${num(fit.r2)}`));
    }
    ctx.report?.('regression', { k: use.length });
  }
  el.append(...[
    cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null,
    h('p', { class: 'small' }, h('strong', {}, 'Input Y Range: '), cfg.y.name),
    h('div', { class: 'rg-vars', role: 'group', 'aria-label': 'Input X Range' }, h('strong', {}, 'Input X Range:'), boxes.map((b) => b.row)),
    out, chart,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null,
  ].filter(Boolean));
  draw();
}
