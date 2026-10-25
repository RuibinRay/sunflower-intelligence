// ml-charts.js — the charts the machine-learning pages need beyond charts.js: a fold-by-fold score plot, overlaid ROC
// curves, a readable decision tree, a dendrogram, a scree chart and a PCA biplot. Same marks, classes and keyboard
// pattern as charts.js (one tab stop per chart, arrow keys walk it, Escape clears), and every one has a table twin.
import { s, h } from './dom.js?v=14';
import * as F from './format.js?v=14';
import { frame, niceTicks, lin, axisX, axisY, legendEl, scatter, Tooltip } from './charts.js?v=14';

/** One tab stop; arrow keys move an index through `count` items. */
function roving(svg, count, onIndex, onLeave) {
  svg.setAttribute('tabindex', '0');
  let idx = -1;
  svg.addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Escape'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === 'Escape') { idx = -1; onLeave(); return; }
    if (e.key === 'Home') idx = 0; else if (e.key === 'End') idx = count - 1;
    else idx = Math.max(0, Math.min(count - 1, idx + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1)));
    onIndex(idx);
  });
  svg.addEventListener('focus', () => { if (idx < 0) { idx = 0; onIndex(0); } });
  svg.addEventListener('blur', () => { idx = -1; onLeave(); });
}
const short = (t, n = 18) => (t.length > n ? `${t.slice(0, n - 1)}…` : t);

// ---------------------------------------------------------------- fold-by-fold scores
/**
 * models: [{name, folds: [score…], mean, sd, cls}] — one row each: the five fold scores as small dots, the mean as a
 * larger mark with a ±1 sd whisker. Dots, not bars, so the axis needn't start at zero.
 */
export function foldPlot(container, { models, label, xLabel = 'AUC on the held-out fold', format = (v) => F.num(v, 2), ref = 0.5 }) {
  const narrow = (container.clientWidth || 600) < 480;
  const fr = frame(container, { height: models.length * 46 + 64, label, margin: { l: narrow ? 104 : 168, r: 20, b: 46, t: 14 } });
  const all = models.flatMap((m) => [...m.folds, m.mean - m.sd, m.mean + m.sd]).filter(Number.isFinite);
  let lo = Math.min(...all), hi = Math.max(...all);
  if (ref != null && ref >= lo - 0.04) lo = Math.min(lo, ref);
  const nt = niceTicks(lo - 0.01, Math.min(1, hi + 0.01), Math.max(3, Math.floor(fr.iw / 80)));
  const x = lin(nt.min, nt.max, 0, fr.iw), band = fr.ih / models.length;
  axisX(fr, x, nt.ticks, { format, label: xLabel, grid: true });
  if (ref != null && ref >= nt.min && ref <= nt.max) {
    fr.g.append(s('line', { x1: x(ref), x2: x(ref), y1: 0, y2: fr.ih, class: 'ref-line is-strong' }));
    fr.g.append(s('text', { x: x(ref) + 4, y: fr.ih - 6, class: 'tick' }, 'coin flip'));
  }
  const rows = models.map((m, i) => {
    const cy = i * band + band / 2, g = s('g', { class: 'fold-row' });
    g.append(s('text', { x: -12, y: cy + 4, 'text-anchor': 'end', class: `tick tick-cat${m.cls === 'm-s2' ? ' is-strong' : ''}` }, narrow ? short(m.short || m.name, 13) : m.name));
    if (Number.isFinite(m.mean)) {
      g.append(s('line', { x1: x(Math.max(nt.min, m.mean - m.sd)), x2: x(Math.min(nt.max, m.mean + m.sd)), y1: cy, y2: cy, class: `whisker ${m.cls}` }));
      m.folds.forEach((v, k) => g.append(s('circle', { cx: x(v), cy: cy + (k - (m.folds.length - 1) / 2) * 3.2, r: 3.2, class: `fold-dot ${m.cls}` })));
      g.append(s('rect', { x: x(m.mean) - 6, y: cy - 6, width: 12, height: 12, rx: 2, transform: `rotate(45 ${x(m.mean)} ${cy})`, class: `mean-mark ${m.cls}` }));
    } else g.append(s('text', { x: 0, y: cy + 4, class: 'tick' }, 'could not be fitted'));
    fr.g.append(g);
    return { g, cy };
  });
  const hits = s('g');
  const show = (i) => {
    rows.forEach((r, k) => r.g.classList.toggle('is-dim', i >= 0 && k !== i));
    if (i < 0) { fr.tip.hide(); return; }
    const m = models[i];
    fr.tip.show(fr.m.l + x(Number.isFinite(m.mean) ? m.mean : nt.min), fr.m.t + rows[i].cy - 8, m.name, [
      { value: format(m.mean), label: 'mean across folds' }, { value: `± ${format(m.sd)}`, label: 'sd across folds' },
      { value: m.folds.map((v) => format(v)).join(', '), label: '' }]);
  };
  models.forEach((m, i) => {
    const r = s('rect', { x: -fr.m.l + 4, y: i * band, width: fr.iw + fr.m.l - 4, height: band, class: 'hit' });
    r.addEventListener('pointerenter', () => show(i)); r.addEventListener('pointerleave', () => show(-1));
    hits.append(r);
  });
  fr.g.append(hits);
  roving(fr.svg, models.length, show, () => show(-1));
  return fr;
}

// ---------------------------------------------------------------- overlaid ROC curves
/** TPR of a step ROC curve at false-positive rate f (the best TPR reached without exceeding f). */
export function tprAt(pts, f) { let t = 0; for (const [fp, tp] of pts) if (fp <= f + 1e-12) t = Math.max(t, tp); return t; }

/** curves: [{name, pts: [[fpr, tpr]…], cls}] drawn muted first, highlighted last; hover reads every curve at one FPR. */
export function rocOverlay(container, { curves, label, height = 320 }) {
  const fr = frame(container, { height, label, margin: { r: 18, b: 46 } });
  const x = lin(0, 1, 0, fr.iw), y = lin(0, 1, fr.ih, 0), ticks = [0, 0.25, 0.5, 0.75, 1];
  axisY(fr, y, ticks, { format: (v) => F.pct(v, 0), label: 'True-positive rate' });
  axisX(fr, x, ticks, { format: (v) => F.pct(v, 0), label: 'False-positive rate' });
  fr.g.append(s('line', { x1: x(0), y1: y(0), x2: x(1), y2: y(1), class: 'ref-line is-strong diag' }));
  const order = curves.map((c, i) => i).sort((a, b) => (curves[a].cls === 'm-s2') - (curves[b].cls === 'm-s2'));
  order.forEach((i) => {
    const c = curves[i];
    fr.g.append(s('path', { d: c.pts.map(([fp, tp], k) => `${k ? 'L' : 'M'}${x(fp).toFixed(1)},${y(tp).toFixed(1)}`).join(''), class: `curve ${c.cls}${c.cls === 'm-s2' ? ' is-strong' : ''}` }));
  });
  const cross = s('line', { y1: 0, y2: fr.ih, class: 'crosshair' }); cross.style.display = 'none'; fr.g.append(cross);
  const marks = curves.map((c) => { const d = s('circle', { r: 4.5, class: `dot ${c.cls}` }); d.style.display = 'none'; fr.g.append(d); return d; });
  const grid = Array.from({ length: 21 }, (_, k) => k / 20);
  const at = (f) => {
    if (f == null) { cross.style.display = 'none'; marks.forEach((d) => { d.style.display = 'none'; }); fr.tip.hide(); return; }
    cross.setAttribute('x1', x(f)); cross.setAttribute('x2', x(f)); cross.style.display = '';
    curves.forEach((c, i) => { const t = tprAt(c.pts, f); marks[i].setAttribute('cx', x(f)); marks[i].setAttribute('cy', y(t)); marks[i].style.display = ''; });
    fr.tip.show(fr.m.l + x(f), fr.m.t + 8, `Flagging ${F.pct(f, 0)} of the no’s`, order.slice().reverse().map((i) => ({ value: F.pct(tprAt(curves[i].pts, f), 0), label: `of yes caught: ${curves[i].name}`, key: curves[i].cls })));
  };
  const hit = s('rect', { x: 0, y: 0, width: fr.iw, height: fr.ih, class: 'hit' });
  hit.addEventListener('pointermove', (e) => {
    const r = fr.svg.getBoundingClientRect();
    const px = (e.clientX - r.left) * (fr.width / r.width) - fr.m.l;
    at(Math.max(0, Math.min(1, Math.round((px / fr.iw) * 100) / 100)));
  });
  hit.addEventListener('pointerleave', () => at(null));
  fr.g.append(hit);
  roving(fr.svg, grid.length, (k) => at(grid[k]), () => at(null));
  container.append(legendEl(order.slice().reverse().map((i) => ({ name: curves[i].name, cls: curves[i].cls, shape: 'line' }))));
  return fr;
}

// ---------------------------------------------------------------- a decision tree you can read
/**
 * Draws a fitted CART tree top-down: each split reads "column ≤ value", the left branch is "yes", and every leaf shows
 * its share of yes with a small bar. Hovering or arrowing to a leaf lights the path of rules that leads to it.
 */
export function treeDiagram(container, { tree, names, yName, fmt = (v) => F.auto(v) }) {
  container.replaceChildren();
  const leaves = [], pos = new Map();
  const walk = (nd) => { if (nd.leaf) { pos.set(nd, leaves.length); leaves.push(nd); return pos.get(nd); } const a = walk(nd.left), b = walk(nd.right); pos.set(nd, (a + b) / 2); return pos.get(nd); };
  walk(tree.root);
  const PAD = 8, avail = (container.clientWidth || 800) - PAD * 2;
  const COL = Math.max(122, Math.min(156, Math.floor(avail / leaves.length))), BW = COL - 10, BH = 62, ROW = 104;
  const width = Math.max(leaves.length * COL + PAD * 2, BW + PAD * 2), height = (tree.depth + 1) * ROW - (ROW - BH) + PAD * 2 + 4;
  const svg = s('svg', { width, height, viewBox: `0 0 ${width} ${height}`, role: 'img', class: 'chart-svg tree-svg',
    'aria-label': `Decision tree with ${leaves.length} leaves, ${tree.depth} levels deep. The rules are listed as text below.` });
  const wrap = h('div', { class: 'tree-scroll' }, svg);
  container.classList.add('chart');
  container.append(wrap);
  if (width > (container.clientWidth || 0) + 2) container.append(h('p', { class: 'tree-hint' }, `This tree is wider than the page: scroll sideways to see all ${leaves.length} leaves.`));
  const tip = new Tooltip(container);
  const cx = (nd) => PAD + pos.get(nd) * COL + COL / 2, top = (nd) => PAD + nd.depth * ROW;
  const edges = s('g'), boxes = s('g'), parentOf = new Map(), edgeOf = new Map(), boxOf = new Map(), fits = [];
  tree.nodes.forEach((nd) => {
    if (nd.leaf) return;
    [[nd.left, 'yes'], [nd.right, 'no']].forEach(([ch, word]) => {
      parentOf.set(ch, nd);
      const x1 = cx(nd), y1 = top(nd) + BH, x2 = cx(ch), y2 = top(ch), my = (y1 + y2) / 2;
      const e = s('g', { class: 'tree-edge' },
        s('path', { d: `M${x1},${y1}C${x1},${my} ${x2},${my} ${x2},${y2}` }),
        s('text', { x: (x1 + x2) / 2 + (word === 'yes' ? -6 : 6), y: my - 2, 'text-anchor': word === 'yes' ? 'end' : 'start', class: 'edge-label' }, word));
      edges.append(e); edgeOf.set(ch, e);
    });
  });
  // each line of text tries its variants, longest first, and is cut with an ellipsis only if none fits the box
  const line = (g, x, y, cls, variants) => { const t = s('text', { x, y, class: cls }, variants[0]); g.append(t); fits.push({ t, variants }); };
  tree.nodes.forEach((nd) => {
    const x0 = cx(nd) - BW / 2, y0 = top(nd), g = s('g', { class: `tree-node${nd.leaf ? ' is-leaf' : ''}` });
    g.append(s('rect', { x: x0, y: y0, width: BW, height: BH, rx: 8, class: 'node-box' }));
    if (nd.leaf) {
      line(g, x0 + 10, y0 + 21, 'node-main', [`${F.pct(nd.p1, 0)} ${yName}`, `${F.pct(nd.p1, 0)} yes`]);
      line(g, x0 + 10, y0 + 38, 'node-sub', [`${F.int(nd.n)} rows`]);
      g.append(s('rect', { x: x0 + 10, y: y0 + 47, width: BW - 20, height: 5, rx: 2.5, class: 'leaf-track' }));
      g.append(s('rect', { x: x0 + 10, y: y0 + 47, width: Math.max(2, (BW - 20) * nd.p1), height: 5, rx: 2.5, class: 'leaf-bar' }));
    } else {
      line(g, x0 + 10, y0 + 19, 'node-main', [names[nd.feature]]);
      line(g, x0 + 10, y0 + 35, 'node-rule', [`≤ ${fmt(nd.threshold)}?`]);
      line(g, x0 + 10, y0 + 51, 'node-sub', [`${F.int(nd.n)} rows · ${F.pct(nd.p1, 0)} yes`, `${F.int(nd.n)} · ${F.pct(nd.p1, 0)} yes`, `${F.int(nd.n)} rows`]);
    }
    boxes.append(g); boxOf.set(nd, g);
  });
  svg.append(edges, boxes);
  const room = BW - 20;
  const fitAll = () => fits.forEach(({ t, variants }) => {
    for (const v of variants) { t.textContent = v; if (t.getComputedTextLength() <= room) return; }
    let v = variants[variants.length - 1];
    while (v.length > 4 && t.getComputedTextLength() > room) { v = v.slice(0, -1); t.textContent = `${v}…`; }
  });
  fitAll();
  document.fonts?.ready.then(fitAll);
  wrap.scrollLeft = Math.max(0, cx(tree.root) - wrap.clientWidth / 2);
  const rule = (nd) => { const out = []; let c = nd; while (parentOf.has(c)) { const p = parentOf.get(c); out.unshift(`${names[p.feature]} ${p.left === c ? '≤' : '>'} ${fmt(p.threshold)}`); c = p; } return out; };
  const light = (leaf) => {
    svg.querySelectorAll('.is-path').forEach((el) => el.classList.remove('is-path'));
    if (!leaf) { tip.hide(); return; }
    let c = leaf; boxOf.get(c).classList.add('is-path');
    while (parentOf.has(c)) { edgeOf.get(c).classList.add('is-path'); c = parentOf.get(c); boxOf.get(c).classList.add('is-path'); }
    const left = cx(leaf) - wrap.scrollLeft, maxL = wrap.clientWidth - 40;
    if (left > maxL || left < 0) wrap.scrollLeft = Math.max(0, cx(leaf) - wrap.clientWidth / 2);
    tip.show(Math.min(cx(leaf) - wrap.scrollLeft, wrap.clientWidth - 10), top(leaf) + 4, `${F.pct(leaf.p1, 0)} ${yName}, ${F.int(leaf.n)} rows`,
      rule(leaf).map((r) => ({ value: r, label: '' })));
  };
  leaves.forEach((lf) => { const g = boxOf.get(lf); g.addEventListener('pointerenter', () => light(lf)); g.addEventListener('pointerleave', () => light(null)); });
  roving(svg, leaves.length, (k) => light(leaves[k]), () => light(null));
  return { svg, leaves };
}

// ---------------------------------------------------------------- dendrogram
/**
 * Ward dendrogram: leaves along the bottom in dendrogram order, each merge drawn at its height. Links below the cut are
 * grouped; one group is drawn in colour and the rest muted. groups: [{size}] numbered left to right.
 */
export function dendrogram(container, { link, order, cut, highlight = 0, label, height = 320 }) {
  const { n, merges } = link;
  const fr = frame(container, { height, label, margin: { l: 58, r: 16, b: 56, t: 18 } });
  const maxH = merges[merges.length - 1].height;
  const nt = niceTicks(0, maxH * 1.04, 4);
  const y = lin(0, nt.max, fr.ih, 0), step = fr.iw / n;
  axisY(fr, y, nt.ticks, { format: (v) => F.tick(v, nt.step), label: 'Merge height (Ward)' });
  const xOf = new Float64Array(2 * n - 1), hOf = new Float64Array(2 * n - 1), groupOf = new Int32Array(2 * n - 1).fill(-1);
  order.forEach((leaf, k) => { xOf[leaf] = (k + 0.5) * step; groupOf[leaf] = cut.labels[leaf]; });
  const below = n - cut.k;                                   // merges 0…below−1 sit under the cut
  const paths = { top: '', groups: Array.from({ length: cut.k }, () => '') };
  merges.forEach((m, s0) => {
    const c = n + s0;
    xOf[c] = (xOf[m.a] + xOf[m.b]) / 2; hOf[c] = m.height;
    const d = `M${xOf[m.a].toFixed(1)},${y(hOf[m.a]).toFixed(1)}V${y(m.height).toFixed(1)}H${xOf[m.b].toFixed(1)}V${y(hOf[m.b]).toFixed(1)}`;
    if (s0 < below) { groupOf[c] = groupOf[m.a]; paths.groups[groupOf[c]] += d; } else paths.top += d;
  });
  paths.groups.forEach((d, g) => { if (d) fr.g.append(s('path', { d, class: `dendro ${g === highlight ? 'm-s2 is-strong' : 'm-muted'}` })); });
  if (paths.top) fr.g.append(s('path', { d: paths.top, class: 'dendro dendro-top' }));
  if (cut.k > 1) {
    fr.g.append(s('line', { x1: 0, x2: fr.iw, y1: y(cut.cutHeight), y2: y(cut.cutHeight), class: 'ref-line is-strong cut-line' }));
    fr.g.append(s('text', { x: fr.iw, y: y(cut.cutHeight) - 6, 'text-anchor': 'end', class: 'end-label' }, `cut: ${cut.k} groups`));
  }
  // group brackets along the bottom, numbered left to right
  const spans = Array.from({ length: cut.k }, () => [Infinity, -Infinity, 0]);
  order.forEach((leaf, k) => { const g = cut.labels[leaf]; spans[g][0] = Math.min(spans[g][0], k); spans[g][1] = Math.max(spans[g][1], k); spans[g][2]++; });
  const brackets = spans.map(([a, b], g) => {
    const x0 = a * step + 1, x1 = (b + 1) * step - 1, el = s('g', { class: `group-span ${g === highlight ? 'm-s2' : 'm-muted'}` });
    el.append(s('rect', { x: x0, y: fr.ih + 8, width: Math.max(1, x1 - x0), height: 6, rx: 2 }));
    if (x1 - x0 >= 14) el.append(s('text', { x: (x0 + x1) / 2, y: fr.ih + 30, 'text-anchor': 'middle', class: `tick${g === highlight ? ' is-strong' : ''}` }, String(g + 1)));
    fr.g.append(el);
    return { x0, x1 };
  });
  fr.g.append(s('text', { x: 0, y: fr.ih + 48, class: 'axis-label' }, 'Groups, left to right'));
  const hits = s('g');
  const show = (g) => {
    if (g < 0) { fr.tip.hide(); return; }
    fr.tip.show(fr.m.l + (brackets[g].x0 + brackets[g].x1) / 2, fr.m.t + fr.ih - 12, `Group ${g + 1}`, [{ value: F.int(spans[g][2]), label: spans[g][2] === 1 ? 'row' : 'rows' }]);
  };
  brackets.forEach((b, g) => {
    const r = s('rect', { x: b.x0, y: 0, width: Math.max(4, b.x1 - b.x0), height: fr.ih + 36, class: 'hit' });
    r.addEventListener('pointerenter', () => show(g)); r.addEventListener('pointerleave', () => show(-1));
    hits.append(r);
  });
  fr.g.append(hits);
  roving(fr.svg, cut.k, show, () => show(-1));
  return fr;
}

// ---------------------------------------------------------------- scree
/** Share of variance per component (bars) and the running total (line), with the average column's share as a guide. */
export function screeChart(container, { ratio, cumulative, values, label, height = 260 }) {
  const p = ratio.length;
  const fr = frame(container, { height, label, margin: { r: 18 } });
  const y = lin(0, 1, fr.ih, 0), band = fr.iw / p, bw = Math.min(40, band * 0.56);
  axisY(fr, y, [0, 0.25, 0.5, 0.75, 1], { format: (v) => F.pct(v, 0), label: 'Share of the variation' });
  const bars = ratio.map((r, i) => {
    const x0 = i * band + (band - bw) / 2;
    fr.g.append(s('text', { x: i * band + band / 2, y: fr.ih + 18, 'text-anchor': 'middle', class: 'tick' }, `PC${i + 1}`));
    const el = s('rect', { x: x0, y: y(r), width: bw, height: Math.max(0.5, y(0) - y(r)), rx: 3, class: 'mark m-s1' });
    fr.g.append(el); return el;
  });
  fr.g.append(s('line', { x1: 0, x2: fr.iw, y1: y(0), y2: y(0), class: 'baseline' }));
  const avg = 1 / p;
  fr.g.append(s('line', { x1: 0, x2: fr.iw, y1: y(avg), y2: y(avg), class: 'ref-line is-strong' }));
  fr.g.append(s('text', { x: fr.iw, y: y(avg) - 6, 'text-anchor': 'end', class: 'tick' }, `one column’s worth (${F.pct(avg, 0)})`));
  const cx = (i) => i * band + band / 2;
  fr.g.append(s('path', { d: cumulative.map((c, i) => `${i ? 'L' : 'M'}${cx(i).toFixed(1)},${y(c).toFixed(1)}`).join(''), class: 'curve m-s2' }));
  cumulative.forEach((c, i) => fr.g.append(s('circle', { cx: cx(i), cy: y(c), r: 3.5, class: 'dot m-s2' })));
  const hits = s('g');
  const show = (i) => {
    bars.forEach((b, k) => b.classList.toggle('is-dim', i >= 0 && k !== i));
    if (i < 0) { fr.tip.hide(); return; }
    fr.tip.show(fr.m.l + cx(i), fr.m.t + y(Math.max(ratio[i], cumulative[i])), `Component ${i + 1}`, [
      { value: F.pct(ratio[i], 1), label: 'of the variation', key: 'm-s1' }, { value: F.pct(cumulative[i], 1), label: 'running total', key: 'm-s2' },
      { value: F.num(values[i], 2), label: 'eigenvalue' }]);
  };
  ratio.forEach((_, i) => {
    const r = s('rect', { x: i * band, y: 0, width: band, height: fr.ih + 24, class: 'hit' });
    r.addEventListener('pointerenter', () => show(i)); r.addEventListener('pointerleave', () => show(-1));
    hits.append(r);
  });
  fr.g.append(hits);
  roving(fr.svg, p, show, () => show(-1));
  container.append(legendEl([{ name: 'This component', cls: 'm-s1', shape: 'rect' }, { name: 'Running total', cls: 'm-s2', shape: 'line' }]));
  return fr;
}

// ---------------------------------------------------------------- biplot
/**
 * Rows' scores on two components (dots) with each column's loading drawn as an arrow from the origin, scaled to fit.
 * flag (optional): 1 marks rows to draw in colour, the rest muted.
 */
export function biplot(container, { scores, loadings, a, b, names, ratio, flag = null, flagName = '', idOf = (i) => `Row ${i + 1}`, label, height = 380 }) {
  const pts = scores.map((sc, i) => ({ x: sc[a], y: sc[b], cls: flag ? (flag[i] ? 'm-s2' : 'm-muted') : 'm-s1', title: idOf(i), i }));
  if (flag) pts.sort((p, q) => (p.cls === 'm-s2') - (q.cls === 'm-s2'));
  const ext = Math.max(...scores.map((sc) => Math.max(Math.abs(sc[a]), Math.abs(sc[b]))), 1e-9);
  const lmax = Math.max(...loadings.map((l) => Math.hypot(l[a], l[b])), 1e-9);
  const k = (0.9 * ext) / lmax;
  const dom = [-ext * 1.08, ext * 1.08];
  const pcA = `PC${a + 1} (${F.pct(ratio[a], 0)})`, pcB = `PC${b + 1} (${F.pct(ratio[b], 0)})`;
  const legend = flag ? [{ name: flagName, cls: 'm-s2' }, { name: 'Other rows', cls: 'm-muted' }] : null;
  const fr = scatter(container, { points: pts, height, xLabel: pcA, yLabel: pcB, label, xDomain: dom, yDomain: dom, legend, xFormat: (v) => F.num(v, 1), yFormat: (v) => F.num(v, 1) });
  const g = s('g', { class: 'loadings', 'aria-hidden': 'true' });
  const defs = fr.svg.querySelector('defs') || fr.svg.insertBefore(s('defs'), fr.svg.firstChild);
  const mid = `ah-${Math.random().toString(36).slice(2, 8)}`;
  defs.append(s('marker', { id: mid, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, s('path', { d: 'M0,1L9,5L0,9Z', class: 'arrow-head' })));
  loadings.forEach((l, j) => {
    const x2 = fr.x(l[a] * k), y2 = fr.y(l[b] * k), x1 = fr.x(0), y1 = fr.y(0);
    g.append(s('line', { x1, y1, x2, y2, class: 'load-arrow', 'marker-end': `url(#${mid})` }));
    const len = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / len, uy = (y2 - y1) / len;
    g.append(s('text', { x: x2 + ux * 10, y: y2 + uy * 10 + 4, 'text-anchor': Math.abs(ux) < 0.3 ? 'middle' : ux > 0 ? 'start' : 'end', class: 'load-label' }, short(names[j], 16)));
  });
  fr.g.insertBefore(g, fr.g.lastChild);                   // under the hover layer, over the dots
  // keep every label inside the chart: nudge any that would run off either side
  g.querySelectorAll('.load-label').forEach((t) => {
    const bb = t.getBBox(), lo = -fr.m.l + 2, hi = fr.iw + fr.m.r - 2;
    if (bb.x + bb.width > hi) t.setAttribute('x', +t.getAttribute('x') - (bb.x + bb.width - hi));
    else if (bb.x < lo) t.setAttribute('x', +t.getAttribute('x') + (lo - bb.x));
  });
  return { ...fr, scale: k };
}
