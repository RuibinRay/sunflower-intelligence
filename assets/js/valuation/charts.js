// charts.js (valuation) — the studio's extra charts on top of core/charts.js: a waterfall (enterprise-to-equity
// bridge), a football field, a coloured sensitivity grid, a probability–impact matrix. Each has a table twin or a
// readable DOM form, and keyboard access where the chart is SVG.
import { h, s } from '../core/dom.js?v=27';
import * as F from '../core/format.js?v=27';
import { frame, niceTicks, lin, axisY, barPath, tableTwin, legendEl, divergingColor } from '../core/charts.js?v=27';

const fin = Number.isFinite;

/** Waterfall: steps [{label, value, total?}] where a total step draws from zero. */
export function waterfall(container, { steps, height = 260, format = (v) => F.compact(v), label = 'Waterfall', caption = 'Waterfall', unit = '' } = {}) {
  const fr = frame(container, { height, label, margin: { b: 56, l: 64 } });
  let run = 0; const bars = [];
  steps.forEach((st) => { if (st.total) { bars.push({ ...st, y0: 0, y1: st.value }); run = st.value; } else { bars.push({ ...st, y0: run, y1: run + st.value }); run += st.value; } });
  const all = bars.flatMap((b) => [b.y0, b.y1]);
  const nt = niceTicks(Math.min(0, ...all), Math.max(0, ...all), 5);
  const y = lin(nt.min, nt.max, fr.ih, 0);
  axisY(fr, y, nt.ticks, { format, label: unit });
  const band = fr.iw / bars.length, bw = Math.min(46, band * 0.62);
  const marks = [];
  bars.forEach((b, i) => {
    const x0 = i * band + (band - bw) / 2;
    const cls = b.total ? 'm-total' : b.value >= 0 ? 'm-up' : 'm-down';
    const p = s('path', { d: barPath(x0, y(b.y0), bw, y(b.y0) - y(b.y1)), class: `mark ${cls}` });
    fr.g.append(p); marks.push({ el: p, i });
    if (i < bars.length - 1) fr.g.append(s('line', { x1: x0 + bw, x2: (i + 1) * band + (band - bw) / 2, y1: y(b.y1), y2: y(b.y1), class: 'connector' }));
    const words = String(b.label).split(' '), lines = [];
    let cur = '';
    words.forEach((w) => { if ((cur + ' ' + w).trim().length > 14 && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); });
    if (cur) lines.push(cur);
    lines.slice(0, 3).forEach((ln, k) => fr.g.append(s('text', { x: i * band + band / 2, y: fr.ih + 16 + k * 13, 'text-anchor': 'middle', class: 'tick' }, ln)));
    fr.g.append(s('text', { x: i * band + band / 2, y: Math.min(y(b.y0), y(b.y1)) - 6, 'text-anchor': 'middle', class: 'value-label' }, format(b.total ? b.value : b.value)));
  });
  fr.g.append(s('line', { x1: 0, x2: fr.iw, y1: y(0), y2: y(0), class: 'baseline' }));
  const hits = s('g');
  bars.forEach((b, i) => {
    const r = s('rect', { x: i * band, y: 0, width: band, height: fr.ih + 40, class: 'hit' });
    const show = () => { marks.forEach((m) => m.el.classList.toggle('is-dim', m.i !== i)); fr.tip.show(fr.m.l + i * band + band / 2, fr.m.t + Math.min(y(b.y0), y(b.y1)), b.label, [{ value: format(b.value), label: b.total ? 'total' : b.value >= 0 ? 'added' : 'subtracted' }, ...(b.total ? [] : [{ value: format(b.y1), label: 'running total' }])]); };
    r.addEventListener('pointerenter', show); r.addEventListener('pointermove', show);
    r.addEventListener('pointerleave', () => { marks.forEach((m) => m.el.classList.remove('is-dim')); fr.tip.hide(); });
    hits.append(r);
  });
  fr.g.append(hits);
  rove(fr, bars.length, (i) => hits.children[i].dispatchEvent(new Event('pointerenter')), () => hits.lastChild?.dispatchEvent(new Event('pointerleave')));
  container.append(legendEl([{ name: 'Total', cls: 'm-total' }, { name: 'Added', cls: 'm-up' }, { name: 'Subtracted', cls: 'm-down' }]));
  tableTwin(container, { caption, columns: [{ label: 'Step' }, { label: 'Amount', num: true }, { label: 'Running total', num: true }], rows: bars.map((b) => [b.label, format(b.value), format(b.y1)]) });
  return fr;
}
function rove(fr, count, onIndex, onLeave) {
  fr.svg.setAttribute('tabindex', '0');
  let idx = -1;
  fr.svg.addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End', 'Escape'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === 'Escape') { idx = -1; onLeave(); return; }
    if (e.key === 'Home') idx = 0; else if (e.key === 'End') idx = count - 1; else idx = Math.max(0, Math.min(count - 1, idx + (e.key === 'ArrowRight' ? 1 : -1)));
    onIndex(idx);
  });
  fr.svg.addEventListener('focus', () => { if (idx < 0) { idx = 0; onIndex(0); } });
  fr.svg.addEventListener('blur', () => { idx = -1; onLeave(); });
}

/** Football field: bars [{label, low, high, mid, group}] on one per-share axis, with the market price as a dashed line. */
export function football(container, { bars, price, format = (v) => F.money(v, { digits: 2 }), caption = 'Valuation ranges' } = {}) {
  container.replaceChildren();
  if (!bars.length) { container.append(h('p', { class: 'note' }, 'No ranges yet.')); return; }
  const lo = Math.min(...bars.map((b) => b.low), fin(price) ? price : Infinity), hi = Math.max(...bars.map((b) => b.high), fin(price) ? price : -Infinity);
  const nt = niceTicks(Math.min(0, lo), hi, 5);
  const x = (v) => ((v - nt.min) / (nt.max - nt.min || 1)) * 100;
  const box = h('div', { class: 'cv-football', role: 'img', 'aria-label': `${caption}: ${bars.map((b) => `${b.label} ${format(b.low)} to ${format(b.high)}`).join('; ')}${fin(price) ? `; market price ${format(price)}` : ''}` });
  bars.forEach((b) => {
    const track = h('div', { class: 'cv-football-track' },
      h('span', { class: `cv-football-bar g-${b.group}`, style: { left: `${x(b.low)}%`, width: `${Math.max(0.6, x(b.high) - x(b.low))}%` }, title: `${format(b.low)} to ${format(b.high)}` }),
      fin(b.mid) ? h('span', { class: 'cv-football-mid', style: { left: `calc(${x(b.mid)}% - 1px)` }, title: `central ${format(b.mid)}` }) : null,
      fin(price) ? h('span', { class: 'cv-football-price', style: { left: `${x(price)}%` } }) : null);
    box.append(h('div', { class: 'cv-football-row' }, h('div', { class: 'cv-football-label' }, b.label), track));
  });
  box.append(h('div', { class: 'cv-football-row' }, h('div'), h('div', { class: 'cv-football-axis' }, nt.ticks.map((t) => h('span', {}, format(t))))));
  box.append(h('p', { class: 'cv-football-legend' }, `Bars show the low to high of each method; the dark mark is its central estimate${fin(price) ? '; the dashed red line is the market price' : ''}.`));
  container.append(box);
  tableTwin(container, { caption, columns: [{ label: 'Method' }, { label: 'Low', num: true }, { label: 'Central', num: true }, { label: 'High', num: true }], rows: bars.map((b) => [b.label, format(b.low), format(b.mid), format(b.high)]) });
}

/** Sensitivity grid as a coloured table: values[i][j], coloured by distance from the centre cell (or from `ref`). */
export function heatGrid(container, { rowLabels, colLabels, values, format = (v) => F.num(v, 2), rowTitle = '', colTitle = '', centre = null, ref = null, caption = '' } = {}) {
  container.replaceChildren();
  const night = !!container.closest('.on-night');
  const flat = values.flat().filter(fin);
  const base = fin(ref) ? ref : (centre && fin(values[centre[0]]?.[centre[1]]) ? values[centre[0]][centre[1]] : (flat.length ? flat.reduce((a, b) => a + b, 0) / flat.length : 0));
  const spread = Math.max(1e-9, ...flat.map((v) => Math.abs(v - base)));
  const t = h('table', { class: 'cv-heat' },
    h('caption', {}, caption || `Rows: ${rowTitle}. Columns: ${colTitle}. Colour shows the distance from the centre case.`),
    h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, `${rowTitle} ↓ ${colTitle} →`), colLabels.map((c) => h('th', { scope: 'col' }, c)))),
    h('tbody', {}, values.map((row, i) => h('tr', {}, h('th', { scope: 'row' }, rowLabels[i]), row.map((v, j) => {
      const c = fin(v) ? divergingColor((v - base) / spread, night) : { fill: 'transparent', ink: 'inherit' };
      return h('td', { class: centre && centre[0] === i && centre[1] === j ? 'is-centre' : '', style: { background: c.fill, color: c.ink } }, fin(v) ? format(v) : '—');
    })))));
  container.append(h('div', { class: 'table-scroll' }, t));
}

/** Probability–impact matrix: cells from valuation.riskMatrix(); likelihood down (5 at the top), severity across. */
export function riskMatrix(container, { cells, onSelect = null, selectedId = null } = {}) {
  container.replaceChildren();
  const grid = h('div', { class: 'cv-matrix', role: 'img', 'aria-label': 'Probability–impact matrix: likelihood from 1 at the bottom to 5 at the top, severity from 1 on the left to 5 on the right' });
  grid.append(h('div', { class: 'cv-matrix-axis is-y', style: { gridRow: '1 / span 5' } }, 'Likelihood →'));
  cells.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      const lk = 5 - ri, sv = ci + 1, score = lk * sv;
      const band = score >= 15 ? 'high' : score >= 8 ? 'medium' : 'low';
      const el = h('div', { class: `cv-matrix-cell is-${band}`, title: `likelihood ${lk}, severity ${sv}: score ${score}` });
      cell.forEach((r) => el.append(h('button', { type: 'button', class: 'cv-matrix-dot', title: r.name, 'aria-label': `${r.name}, score ${score}`, style: selectedId === r.id ? { background: 'var(--sun)', color: 'var(--midnight)' } : {}, onclick: () => onSelect && onSelect(r) }, r.name.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase())));
      grid.append(el);
    });
  });
  grid.append(h('div'), ...[1, 2, 3, 4, 5].map((sv) => h('div', { class: 'cv-matrix-axis' }, String(sv))));
  container.append(grid, h('p', { class: 'cv-matrix-legend' }, 'Severity 1 to 5 across; likelihood 1 to 5 up. Green scores below 8, amber 8–14, red 15 and above. Initials mark each risk; press one to edit it.'));
}

/** History and forecast bars in one chart: two series so the forecast years are visibly different. */
export function historyForecastBars(barChart, container, { histYears, histValues, fcYears, fcValues, name, format, yLabel, height = 240, label }) {
  const all = [...histYears, ...fcYears];
  const cats = all.map((y) => (all.length > 7 && container.clientWidth < 520 ? `’${String(y).slice(-2)}` : String(y)));
  return barChart(container, { categories: cats, height, label, yLabel, format, series: [{ name: `${name} (history)`, values: [...histValues, ...fcYears.map(() => NaN)], cls: 'm-s1' }, { name: `${name} (forecast)`, values: [...histYears.map(() => NaN), ...fcValues], cls: 'm-light' }], legend: true });
}
