// charts.js — small SVG chart kit. Thin marks, hairline grid, hover + keyboard tooltips, table twins.
// Colours come from CSS classes (see tools.css) so light and night rooms share one code path.
import { s, h } from './dom.js?v=7';
import * as F from './format.js?v=7';

export function niceTicks(min, max, count = 5) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { ticks: [], min: 0, max: 1, step: 1 };
  if (min === max) { const pad = Math.abs(min) * 0.1 || 1; min -= pad; max += pad; }
  const raw = (max - min) / Math.max(1, count);
  const e = Math.floor(Math.log10(raw)), f = raw / 10 ** e;
  const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * 10 ** e;
  const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
  const ticks = []; for (let v = lo; v <= hi + step * 1e-9; v += step) ticks.push(Math.abs(v) < step * 1e-9 ? 0 : v);
  return { ticks, min: lo, max: hi, step };
}
export const lin = (d0, d1, r0, r1) => (v) => r0 + ((v - d0) / (d1 - d0 || 1)) * (r1 - r0);

/** Sets up an SVG inside `container` sized to its width. */
export function frame(container, { height = 280, margin = {}, label = '' } = {}) {
  container.replaceChildren();
  container.classList.add('chart');
  const m = { t: 26, r: 16, b: 44, l: 58, ...margin };
  const width = Math.max(240, Math.floor(container.clientWidth || 600));
  const svg = s('svg', { width, height, viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': label, class: 'chart-svg' });
  const g = s('g', { transform: `translate(${m.l},${m.t})` });
  svg.append(g);
  container.append(svg);
  const tip = new Tooltip(container);
  return { svg, g, m, width, height, iw: width - m.l - m.r, ih: height - m.t - m.b, tip };
}

export class Tooltip {
  constructor(container) {
    this.c = container;
    this.el = h('div', { class: 'chart-tip', role: 'status', 'aria-live': 'polite' });
    this.el.hidden = true;
    container.append(this.el);
  }
  /** rows: [{value, label, key?:className}] — value leads, label follows */
  show(x, y, title, rows = []) {
    this.el.replaceChildren(
      title ? h('div', { class: 'tip-title' }, title) : '',
      ...rows.map((r) => h('div', { class: 'tip-row' }, r.key ? h('i', { class: `tip-key ${r.key}` }) : '', h('strong', {}, r.value), h('span', {}, r.label || ''))),
    );
    this.el.hidden = false;
    const cw = this.c.clientWidth, tw = this.el.offsetWidth, th = this.el.offsetHeight;
    let left = x + 14, top = y - th - 10;
    if (left + tw > cw - 4) left = x - tw - 14;
    if (left < 4) left = 4;
    if (top < 4) top = y + 16;
    this.el.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
  }
  hide() { this.el.hidden = true; }
}

export function axisX(fr, scale, ticks, { format = (v) => F.tick(v, 1), label, y = fr.ih, grid = false, labels } = {}) {
  const ax = s('g', { class: 'axis axis-x', transform: `translate(0,${y})` });
  ax.append(s('line', { x1: 0, x2: fr.iw, y1: 0, y2: 0, class: 'axis-line' }));
  ticks.forEach((t, i) => {
    const x = scale(t);
    if (grid) fr.g.append(s('line', { x1: x, x2: x, y1: 0, y2: fr.ih, class: 'grid' }));
    ax.append(s('text', { x, y: 18, 'text-anchor': 'middle', class: 'tick' }, labels ? labels[i] : format(t)));
  });
  if (label) ax.append(s('text', { x: fr.iw, y: 36, 'text-anchor': 'end', class: 'axis-label' }, label));
  fr.g.append(ax);
}
export function axisY(fr, scale, ticks, { format = (v) => F.tick(v, 1), label, grid = true } = {}) {
  const ax = s('g', { class: 'axis axis-y' });
  ticks.forEach((t) => {
    const y = scale(t);
    if (grid) fr.g.append(s('line', { x1: 0, x2: fr.iw, y1: y, y2: y, class: t === 0 ? 'grid zero' : 'grid' }));
    ax.append(s('text', { x: -10, y: y + 4, 'text-anchor': 'end', class: 'tick' }, format(t)));
  });
  if (label) ax.append(s('text', { x: -fr.m.l + 4, y: -12, 'text-anchor': 'start', class: 'axis-label' }, label));
  fr.g.prepend(ax);
}

/** Rounded data-end bar: 4px radius on the value end, square on the baseline. */
export function barPath(x, y, w, hgt, horizontal = false, r = 4) {
  if (horizontal) {
    const neg = w < 0, ww = Math.abs(w), xx = neg ? x - ww : x;
    const rr = Math.min(r, ww / 2, hgt / 2);
    return neg
      ? `M${xx + ww},${y}H${xx + rr}Q${xx},${y} ${xx},${y + rr}V${y + hgt - rr}Q${xx},${y + hgt} ${xx + rr},${y + hgt}H${xx + ww}Z`
      : `M${xx},${y}H${xx + ww - rr}Q${xx + ww},${y} ${xx + ww},${y + rr}V${y + hgt - rr}Q${xx + ww},${y + hgt} ${xx + ww - rr},${y + hgt}H${xx}Z`;
  }
  const neg = hgt < 0, hh = Math.abs(hgt), yy = neg ? y : y - hh;
  const rr = Math.min(r, w / 2, hh / 2);
  return neg
    ? `M${x},${yy}V${yy + hh - rr}Q${x},${yy + hh} ${x + rr},${yy + hh}H${x + w - rr}Q${x + w},${yy + hh} ${x + w},${yy + hh - rr}V${yy}Z`
    : `M${x},${yy + hh}V${yy + rr}Q${x},${yy} ${x + rr},${yy}H${x + w - rr}Q${x + w},${yy} ${x + w},${yy + rr}V${yy + hh}Z`;
}

/**
 * Column/bar chart. series: [{name, values, cls}] (cls = mark class, e.g. 'm-s1').
 * Hover and keyboard focus (roving: one tab stop, arrow keys) show every series at that category.
 */
export function barChart(container, { categories, series, height = 280, format = (v) => F.auto(v), yLabel, label, horizontal = false, legend = true, margin = {}, valueLabels = false } = {}) {
  const fr = frame(container, { height: horizontal ? Math.max(height, categories.length * 34 + 56) : height, label, margin: horizontal ? { l: 132, b: 36, ...margin } : margin });
  const all = series.flatMap((se) => se.values).filter(Number.isFinite);
  const nt = niceTicks(Math.min(0, ...all), Math.max(0, ...all), horizontal ? 4 : 5);
  const band = (horizontal ? fr.ih : fr.iw) / categories.length;
  const gap = 2, nS = series.length;
  const bw = Math.min(24, (band * 0.72 - gap * (nS - 1)) / nS);
  const groupW = bw * nS + gap * (nS - 1);
  const marks = [];
  if (horizontal) {
    const x = lin(nt.min, nt.max, 0, fr.iw);
    axisX(fr, x, nt.ticks, { format: (v) => format(v), grid: true });
    categories.forEach((c, i) => {
      const y0 = i * band + (band - groupW) / 2;
      fr.g.append(s('text', { x: -10, y: y0 + groupW / 2 + 4, 'text-anchor': 'end', class: 'tick tick-cat' }, c));
      series.forEach((se, k) => {
        const v = se.values[i]; if (!Number.isFinite(v)) return;
        const p = s('path', { d: barPath(x(0), y0 + k * (bw + gap), x(v) - x(0), bw, true), class: `mark ${se.cls || 'm-s1'}` });
        fr.g.append(p); marks.push({ el: p, i });
        if (valueLabels) fr.g.append(s('text', { x: x(v) + (v < 0 ? -6 : 6), y: y0 + k * (bw + gap) + bw / 2 + 4, 'text-anchor': v < 0 ? 'end' : 'start', class: 'value-label' }, format(v)));
      });
    });
    fr.g.append(s('line', { x1: x(0), x2: x(0), y1: 0, y2: fr.ih, class: 'baseline' }));
  } else {
    const y = lin(nt.min, nt.max, fr.ih, 0);
    axisY(fr, y, nt.ticks, { format: (v) => format(v), label: yLabel });
    categories.forEach((c, i) => {
      const x0 = i * band + (band - groupW) / 2;
      fr.g.append(s('text', { x: i * band + band / 2, y: fr.ih + 18, 'text-anchor': 'middle', class: 'tick' }, c));
      series.forEach((se, k) => {
        const v = se.values[i]; if (!Number.isFinite(v)) return;
        const p = s('path', { d: barPath(x0 + k * (bw + gap), y(0), bw, y(0) - y(v)), class: `mark ${se.cls || 'm-s1'}` });
        fr.g.append(p); marks.push({ el: p, i });
      });
    });
    fr.g.append(s('line', { x1: 0, x2: fr.iw, y1: y(0), y2: y(0), class: 'baseline' }));
  }
  // hit areas per category (bigger than the marks)
  const hits = s('g', { class: 'hits' });
  categories.forEach((c, i) => {
    const r = horizontal ? s('rect', { x: -fr.m.l + 4, y: i * band, width: fr.iw + fr.m.l - 4, height: band, class: 'hit' }) : s('rect', { x: i * band, y: 0, width: band, height: fr.ih + 24, class: 'hit' });
    const show = () => {
      marks.forEach((mk) => mk.el.classList.toggle('is-dim', mk.i !== i));
      const bb = r.getBBox();
      const cx = fr.m.l + (horizontal ? Math.min(fr.iw, bb.x + bb.width / 2) : bb.x + bb.width / 2), cy = fr.m.t + (horizontal ? bb.y : 24);
      fr.tip.show(cx, cy + (horizontal ? 0 : 0), c, series.map((se) => ({ value: format(se.values[i]), label: se.name, key: se.cls })));
    };
    r.addEventListener('pointerenter', show); r.addEventListener('pointermove', show);
    r.addEventListener('pointerleave', () => { marks.forEach((mk) => mk.el.classList.remove('is-dim')); fr.tip.hide(); });
    hits.append(r);
  });
  fr.g.append(hits);
  roving(fr, categories.length, (i) => hits.children[i].dispatchEvent(new Event('pointerenter')), () => hits.lastChild?.dispatchEvent(new Event('pointerleave')));
  if (legend && series.length > 1) container.append(legendEl(series.map((se) => ({ name: se.name, cls: se.cls, shape: 'rect' }))));
  return fr;
}

/** One tab stop on the chart; arrow keys walk the categories/points. */
function roving(fr, count, onIndex, onLeave) {
  fr.svg.setAttribute('tabindex', '0');
  let idx = -1;
  fr.svg.addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Escape'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === 'Escape') { idx = -1; onLeave(); return; }
    if (e.key === 'Home') idx = 0; else if (e.key === 'End') idx = count - 1;
    else idx = Math.max(0, Math.min(count - 1, idx + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1)));
    onIndex(idx);
  });
  fr.svg.addEventListener('focus', () => { if (idx < 0) { idx = 0; onIndex(0); } });
  fr.svg.addEventListener('blur', () => { idx = -1; onLeave(); });
}

export function legendEl(items) {
  return h('ul', { class: 'legend', role: 'list' }, items.map((it) => h('li', {}, h('i', { class: `legend-key ${it.shape === 'line' ? 'is-line' : ''} ${it.cls}` }), it.name)));
}

/**
 * Scatter with optional curve(s). points: [{x, y, title?, cls?}]
 * curves: [{fn | pts:[[x,y]], cls, name}] ; band: {lo(x), hi(x)} shaded
 */
export function scatter(container, { points, curves = [], band, height = 320, xLabel, yLabel, xFormat = (v) => F.auto(v), yFormat = (v) => F.auto(v), label, refY, legend, pointTitle, xDomain, yDomain, margin } = {}) {
  const fr = frame(container, { height, label, margin });
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  const xd = xDomain || [Math.min(...xs), Math.max(...xs)];
  const curveYs = [];
  curves.forEach((c) => { if (c.fn) for (let k = 0; k <= 40; k++) curveYs.push(c.fn(xd[0] + (k / 40) * (xd[1] - xd[0]))); if (c.pts) c.pts.forEach((p) => curveYs.push(p[1])); });
  const yd = yDomain || [Math.min(...ys, ...curveYs.filter(Number.isFinite)), Math.max(...ys, ...curveYs.filter(Number.isFinite))];
  if (refY != null) { yd[0] = Math.min(yd[0], refY); yd[1] = Math.max(yd[1], refY); }
  const nx = niceTicks(xd[0], xd[1], Math.max(3, Math.floor(fr.iw / 90))), ny = niceTicks(yd[0], yd[1], 5);
  const x = lin(nx.min, nx.max, 0, fr.iw), y = lin(ny.min, ny.max, fr.ih, 0);
  axisY(fr, y, ny.ticks, { format: yFormat, label: yLabel });
  axisX(fr, x, nx.ticks, { format: xFormat, label: xLabel });
  const clip = `clip-${Math.random().toString(36).slice(2, 8)}`;
  fr.svg.prepend(s('defs', {}, s('clipPath', { id: clip }, s('rect', { x: 0, y: 0, width: fr.iw, height: fr.ih }))));
  const layer = s('g', { 'clip-path': `url(#${clip})` });
  if (band) {
    const N = 60, top = [], bot = [];
    for (let k = 0; k <= N; k++) { const xv = nx.min + (k / N) * (nx.max - nx.min); top.push(`${x(xv)},${y(band.hi(xv))}`); bot.unshift(`${x(xv)},${y(band.lo(xv))}`); }
    layer.append(s('polygon', { points: top.concat(bot).join(' '), class: `band ${band.cls || 'm-s1'}` }));
  }
  if (refY != null) layer.append(s('line', { x1: 0, x2: fr.iw, y1: y(refY), y2: y(refY), class: 'ref-line' }));
  curves.forEach((c) => {
    let d = '';
    if (c.fn) { const N = 120; for (let k = 0; k <= N; k++) { const xv = nx.min + (k / N) * (nx.max - nx.min); const yv = c.fn(xv); if (Number.isFinite(yv)) d += `${d ? 'L' : 'M'}${x(xv).toFixed(1)},${y(yv).toFixed(1)}`; } }
    else d = c.pts.map((p, k) => `${k ? 'L' : 'M'}${x(p[0]).toFixed(1)},${y(p[1]).toFixed(1)}`).join('');
    layer.append(s('path', { d, class: `curve ${c.cls || 'm-s2'}` }));
  });
  const dots = points.map((p) => { const c = s('circle', { cx: x(p.x), cy: y(p.y), r: 4.5, class: `dot ${p.cls || 'm-s1'}` }); layer.append(c); return c; });
  fr.g.append(layer);
  // nearest-point hover: the pointer only has to be closest, not dead-centre
  const hit = s('rect', { x: 0, y: 0, width: fr.iw, height: fr.ih, class: 'hit' });
  let active = -1;
  const focusPoint = (i) => {
    if (active >= 0) dots[active].classList.remove('is-active');
    active = i; if (i < 0) { fr.tip.hide(); return; }
    dots[i].classList.add('is-active');
    const p = points[i];
    fr.tip.show(fr.m.l + x(p.x), fr.m.t + y(p.y), pointTitle ? pointTitle(p) : p.title || '', [{ value: yFormat(p.y), label: yLabel || 'y' }, { value: xFormat(p.x), label: xLabel || 'x' }]);
  };
  hit.addEventListener('pointermove', (e) => {
    const rect = fr.svg.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (fr.width / rect.width) - fr.m.l, py = (e.clientY - rect.top) * (fr.height / rect.height) - fr.m.t;
    let best = -1, bd = 32 * 32;
    points.forEach((p, i) => { const d = (x(p.x) - px) ** 2 + (y(p.y) - py) ** 2; if (d < bd) { bd = d; best = i; } });
    focusPoint(best);
  });
  hit.addEventListener('pointerleave', () => focusPoint(-1));
  fr.g.append(hit);
  const order = points.map((p, i) => i).sort((a, b) => points[a].x - points[b].x);
  roving(fr, points.length, (k) => focusPoint(order[k]), () => focusPoint(-1));
  if (legend) container.append(legendEl(legend));
  return { ...fr, x, y };
}

/** Multi-series line chart with a snapping crosshair. xs: numbers; series: [{name, values, cls}] */
export function lineChart(container, { xs, series, height = 260, xLabel, yLabel, xFormat = (v) => F.auto(v), yFormat = (v) => F.auto(v), label, highlightX, yDomain, endLabels = true, xTicks, band } = {}) {
  const fr = frame(container, { height, label, margin: { r: endLabels ? 96 : 16 } });
  const all = series.flatMap((se) => se.values).concat(band ? [...band.lo, ...band.hi] : []).filter(Number.isFinite);
  const nx = niceTicks(Math.min(...xs), Math.max(...xs), Math.min(xs.length, Math.max(3, Math.floor(fr.iw / 70))));
  const ny = niceTicks(yDomain ? yDomain[0] : Math.min(...all), yDomain ? yDomain[1] : Math.max(...all), 5);
  const x = xTicks ? lin(Math.min(...xs), Math.max(...xs), 0, fr.iw) : lin(nx.min, nx.max, 0, fr.iw), y = lin(ny.min, ny.max, fr.ih, 0);
  axisY(fr, y, ny.ticks, { format: yFormat, label: yLabel });
  axisX(fr, x, xTicks || nx.ticks.filter((t) => t >= Math.min(...xs) && t <= Math.max(...xs)), { format: xFormat, label: xLabel });
  if (band) {
    // band: {lo: [], hi: [], cls} aligned with xs; drawn wherever both edges exist
    const idx = xs.map((_, i) => i).filter((i) => Number.isFinite(band.lo[i]) && Number.isFinite(band.hi[i]));
    if (idx.length > 1) {
      const top = idx.map((i) => `${x(xs[i]).toFixed(1)},${y(band.hi[i]).toFixed(1)}`), bot = idx.slice().reverse().map((i) => `${x(xs[i]).toFixed(1)},${y(band.lo[i]).toFixed(1)}`);
      fr.g.append(s('polygon', { points: top.concat(bot).join(' '), class: `band ${band.cls || 'm-s2'}` }));
    }
  }
  if (highlightX != null) fr.g.append(s('line', { x1: x(highlightX), x2: x(highlightX), y1: 0, y2: fr.ih, class: 'ref-line is-strong' }));
  series.forEach((se) => {
    const d = se.values.map((v, i) => (Number.isFinite(v) ? `${i && Number.isFinite(se.values[i - 1]) ? 'L' : 'M'}${x(xs[i]).toFixed(1)},${y(Math.min(ny.max, v)).toFixed(1)}` : '')).join('');
    fr.g.append(s('path', { d, class: `curve ${se.cls}` }));
    const li = se.values.length - 1;
    if (endLabels && Number.isFinite(se.values[li])) fr.g.append(s('text', { x: x(xs[li]) + 8, y: y(Math.min(ny.max, se.values[li])) + 4, class: 'end-label' }, se.name));
  });
  const cross = s('line', { y1: 0, y2: fr.ih, class: 'crosshair' }); cross.style.display = 'none';
  const markers = series.map((se) => { const c = s('circle', { r: 4.5, class: `dot ${se.cls}` }); c.style.display = 'none'; fr.g.append(c); return c; });
  fr.g.append(cross);
  const at = (i) => {
    if (i < 0) { cross.style.display = 'none'; markers.forEach((mk) => { mk.style.display = 'none'; }); fr.tip.hide(); return; }
    cross.setAttribute('x1', x(xs[i])); cross.setAttribute('x2', x(xs[i])); cross.style.display = '';
    series.forEach((se, k) => { const v = se.values[i]; const mk = markers[k]; if (Number.isFinite(v) && v <= ny.max) { mk.setAttribute('cx', x(xs[i])); mk.setAttribute('cy', y(v)); mk.style.display = ''; } else mk.style.display = 'none'; });
    const rowsTip = series.filter((se) => Number.isFinite(se.values[i])).map((se) => ({ value: yFormat(se.values[i]), label: se.name, key: se.cls }));
    if (band && Number.isFinite(band.lo[i]) && band.label) rowsTip.push({ value: `${yFormat(band.lo[i])} to ${yFormat(band.hi[i])}`, label: band.label, key: band.cls || 'm-s2' });
    fr.tip.show(fr.m.l + x(xs[i]), fr.m.t + 8, `${xLabel ? `${xLabel} ` : ''}${xFormat(xs[i])}`, rowsTip);
  };
  const hit = s('rect', { x: 0, y: 0, width: fr.iw, height: fr.ih, class: 'hit' });
  hit.addEventListener('pointermove', (e) => {
    const rect = fr.svg.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (fr.width / rect.width) - fr.m.l;
    let best = 0; xs.forEach((v, i) => { if (Math.abs(x(v) - px) < Math.abs(x(xs[best]) - px)) best = i; });
    at(best);
  });
  hit.addEventListener('pointerleave', () => at(-1));
  fr.g.append(hit);
  roving(fr, xs.length, at, () => at(-1));
  container.append(legendEl(series.map((se) => ({ name: se.name, cls: se.cls, shape: 'line' }))));
  return { ...fr, x, y };
}

/** Histogram with optional vertical markers [{x, label}]. */
export function histogramChart(container, { bins, height = 240, xLabel, format = (v) => F.auto(v), label, markers = [] } = {}) {
  const fr = frame(container, { height, label });
  const maxC = Math.max(...bins.map((b) => b.count));
  const ny = niceTicks(0, maxC, 4);
  const lo = bins[0].x0, hi = bins[bins.length - 1].x1;
  const x = lin(lo, hi, 0, fr.iw), y = lin(0, ny.max, fr.ih, 0);
  axisY(fr, y, ny.ticks.filter((t) => Number.isInteger(t)), { format: (v) => F.int(v), label: 'Count' });
  const nx = niceTicks(lo, hi, Math.max(3, Math.floor(fr.iw / 80)));
  axisX(fr, x, nx.ticks.filter((t) => t >= lo - 1e-9 && t <= hi + 1e-9), { format, label: xLabel });
  const bars = bins.map((b) => {
    const w = Math.max(1, x(b.x1) - x(b.x0) - 2);
    const p = s('path', { d: barPath(x(b.x0) + 1, y(0), w, y(0) - y(b.count)), class: 'mark m-accent' });
    fr.g.append(p); return p;
  });
  markers.forEach((mk) => {
    if (mk.x < lo || mk.x > hi) return;
    fr.g.append(s('line', { x1: x(mk.x), x2: x(mk.x), y1: -4, y2: fr.ih, class: 'ref-line is-strong' }));
    fr.g.append(s('text', { x: x(mk.x) + 4, y: 8, class: 'end-label' }, mk.label));
  });
  const hits = s('g');
  bins.forEach((b, i) => {
    const r = s('rect', { x: x(b.x0), y: 0, width: Math.max(4, x(b.x1) - x(b.x0)), height: fr.ih, class: 'hit' });
    const show = () => { bars.forEach((bb, k) => bb.classList.toggle('is-dim', k !== i)); fr.tip.show(fr.m.l + x((b.x0 + b.x1) / 2), fr.m.t + y(b.count), `${format(b.x0)} to ${format(b.x1)}`, [{ value: F.int(b.count), label: b.count === 1 ? 'row' : 'rows' }]); };
    r.addEventListener('pointerenter', show); r.addEventListener('pointerleave', () => { bars.forEach((bb) => bb.classList.remove('is-dim')); fr.tip.hide(); });
    hits.append(r);
  });
  fr.g.append(hits);
  roving(fr, bins.length, (i) => hits.children[i].dispatchEvent(new Event('pointerenter')), () => hits.children[0]?.dispatchEvent(new Event('pointerleave')));
  return fr;
}

/** Diverging colour for a value in [-1, 1]: cool pole positive, warm pole negative, grey midpoint. */
export function divergingColor(v, night = false) {
  const t = Math.min(1, Math.abs(v));
  const [neg, pos, mid] = night ? [[224, 138, 92], [127, 162, 214], [42, 53, 80]] : [[180, 83, 42], [47, 93, 158], [236, 230, 218]];
  const end = v < 0 ? neg : pos;
  const c = mid.map((m, i) => Math.round(m + (end[i] - m) * t));
  const ink = night ? (t > 0.55 ? '#13223B' : '#FFF8E8') : (t > 0.55 ? '#FFFBF2' : '#192B49');
  return { fill: `rgb(${c.join(',')})`, ink };
}

/** Correlation heatmap; cells are one roving tab stop; onSelect(i, j). */
export function heatmap(container, { labels, values, pvalues, ns, format = (v) => F.num(v, 2), label, onSelect, selected = [-1, -1] } = {}) {
  container.replaceChildren();
  container.classList.add('chart');
  const night = !!container.closest('.on-night');
  const n = labels.length;
  const width = Math.max(260, container.clientWidth);
  const labelW = Math.min(150, Math.max(70, width * 0.24));
  const cell = Math.max(30, Math.min(64, (width - labelW - 8) / n));
  const H = labelW * 0.0 + cell * n + 70;
  const svg = s('svg', { width: labelW + cell * n + 8, height: H, viewBox: `0 0 ${labelW + cell * n + 8} ${H}`, role: 'img', 'aria-label': label, class: 'chart-svg' });
  container.append(svg);
  const tip = new Tooltip(container);
  const g = s('g', { transform: `translate(${labelW},8)` });
  svg.append(g);
  const short = (t) => (t.length > 14 ? `${t.slice(0, 13)}…` : t);
  labels.forEach((l, i) => {
    g.append(s('text', { x: -8, y: i * cell + cell / 2 + 4, 'text-anchor': 'end', class: 'tick tick-cat' }, short(l)));
    g.append(s('text', { x: i * cell + cell / 2, y: n * cell + 16, 'text-anchor': 'end', transform: `rotate(-35 ${i * cell + cell / 2} ${n * cell + 16})`, class: 'tick tick-cat' }, short(l)));
  });
  const rects = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const v = values[i][j], c = divergingColor(Number.isFinite(v) ? v : 0, night);
    const r = s('rect', { x: j * cell + 1, y: i * cell + 1, width: cell - 2, height: cell - 2, rx: 3, fill: Number.isFinite(v) ? c.fill : 'none', class: `cell${i === selected[0] && j === selected[1] ? ' is-selected' : ''}` });
    g.append(r); rects.push({ r, i, j });
    if (cell >= 38 && Number.isFinite(v)) g.append(s('text', { x: j * cell + cell / 2, y: i * cell + cell / 2 + 4, 'text-anchor': 'middle', fill: c.ink, class: 'cell-label' }, format(v)));
  }
  const show = (k) => {
    rects.forEach((o) => o.r.classList.remove('is-focus'));
    if (k < 0) { tip.hide(); return; }
    const o = rects[k]; o.r.classList.add('is-focus');
    tip.show(labelW + o.j * cell + cell / 2, 8 + o.i * cell, `${labels[o.i]} × ${labels[o.j]}`, [
      { value: format(values[o.i][o.j]), label: 'correlation' },
      ...(pvalues ? [{ value: F.pValue(pvalues[o.i][o.j]), label: 'p-value' }] : []),
      ...(ns ? [{ value: F.int(ns[o.i][o.j]), label: 'pairs' }] : []),
    ]);
  };
  rects.forEach((o, k) => {
    o.r.addEventListener('pointerenter', () => show(k));
    o.r.addEventListener('pointerleave', () => show(-1));
    o.r.addEventListener('click', () => onSelect && onSelect(o.i, o.j));
    o.r.style.cursor = onSelect ? 'pointer' : 'default';
  });
  svg.setAttribute('tabindex', '0');
  let fi = -1, fj = -1;
  svg.addEventListener('keydown', (e) => {
    const keys = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0] };
    if (keys[e.key]) { e.preventDefault(); if (fi < 0) { fi = 0; fj = 0; } else { fi = Math.max(0, Math.min(n - 1, fi + keys[e.key][0])); fj = Math.max(0, Math.min(n - 1, fj + keys[e.key][1])); } show(fi * n + fj); }
    else if ((e.key === 'Enter' || e.key === ' ') && fi >= 0) { e.preventDefault(); onSelect && onSelect(fi, fj); }
    else if (e.key === 'Escape') { show(-1); }
  });
  svg.addEventListener('blur', () => show(-1));
  return { svg };
}

/** A collapsible table twin for any chart: the WCAG-clean way to read every value. */
export function tableTwin(container, { caption, columns, rows, open = false }) {
  const det = h('details', { class: 'table-twin' });
  if (open) det.open = true;
  det.append(h('summary', {}, 'Show the numbers as a table'));
  const table = h('table', { class: 'data-table' },
    caption ? h('caption', { class: 'visually-hidden' }, caption) : '',
    h('thead', {}, h('tr', {}, columns.map((c) => h('th', { scope: 'col', class: c.num ? 'is-num' : '' }, c.label)))),
    h('tbody', {}, rows.map((r) => h('tr', {}, r.map((v, k) => (k === 0 ? h('th', { scope: 'row' }, v) : h('td', { class: columns[k]?.num ? 'is-num' : '' }, v)))))));
  det.append(h('div', { class: 'table-scroll' }, table));
  container.append(det);
  return det;
}
