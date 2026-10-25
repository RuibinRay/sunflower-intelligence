// chart.js — the "chart" lesson widget: a fixed chart of data the lesson supplies, with its numbers as a table
// for screen readers and anyone who prefers them. Also exports drawChart, which the formula explorer reuses.
//   { type: 'chart', kind: 'line' | 'bar', title, x: { label, values }, series: [{ name, values }],
//     y: { label, format: 'money' | 'pct' | 'int' | 'num' }, note: 'html' }
import { h } from '../../core/dom.js?v=13';
import { xl } from '../xl.js?v=13';
import * as F from '../../core/format.js?v=13';
import { lineChart, barChart, tableTwin } from '../../core/charts.js?v=13';
import { onResize } from '../../core/dom.js?v=13';

const CLS = ['m-s1', 'm-s2', 'm-s3'];
export function formatter(kind) {
  if (kind === 'money') return (v) => F.money(v, { digits: Math.abs(v) < 100 && !Number.isInteger(v) ? 2 : 0 });
  if (kind === 'pct') return (v) => `${F.num(v, Math.abs(v) < 10 ? 1 : 0)}%`;
  if (kind === 'int') return (v) => F.int(v);
  return (v) => F.auto(v);
}

/** Draw `spec` into `box` (replacing what's there) and add the data table after it. */
export function drawChart(box, spec, { height = 260 } = {}) {
  const xs = spec.x?.values || [];
  const series = (spec.series || []).slice(0, 3).map((se, i) => ({ name: se.name, values: se.values.map(Number), cls: CLS[i] }));
  const yFmt = formatter(spec.y?.format);
  const numericX = xs.every((v) => typeof v === 'number' && Number.isFinite(v));
  const label = `${spec.title || 'Chart'}${spec.y?.label ? `: ${spec.y.label}` : ''}${spec.x?.label ? ` by ${spec.x.label.toLowerCase()}` : ''}`;
  const plot = h('div');
  box.replaceChildren(plot);
  if (spec.kind === 'bar' || !numericX) {
    barChart(plot, { categories: xs.map(String), series, height, format: yFmt, yLabel: spec.y?.label, label, legend: series.length > 1 });
  } else {
    lineChart(plot, { xs, series, height, xLabel: spec.x?.label, yLabel: spec.y?.label, yFormat: yFmt, xFormat: (v) => F.auto(v), label, endLabels: series.length > 1 });
  }
  tableTwin(box, {
    caption: label,
    columns: [{ label: spec.x?.label || '' }, ...series.map((se) => ({ label: se.name, num: true }))],
    rows: xs.map((xv, i) => [String(xv), ...series.map((se) => yFmt(se.values[i]))]),
  });
}

export function mount(el, cfg) {
  const box = h('div', { class: 'chart-widget' });
  el.append(cfg.title ? h('p', { class: 'chart-title' }, cfg.title) : '', box);
  const draw = () => drawChart(box, cfg, { height: cfg.height || 280 });
  draw();
  if (cfg.note) { const n = h('p', { class: 'fx-note' }); n.innerHTML = xl(cfg.note); el.append(n); }
  onResize(box, draw);
}
