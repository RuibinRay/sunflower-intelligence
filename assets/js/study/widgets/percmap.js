// percmap.js — the `percmap` lesson widget (M05): a perceptual map from brands' mean ratings on several attributes.
// Brands are placed by the first two principal components of the attributes (core/percmap.js); each attribute is an
// arrow pointing where brands rate high on it; segments' ideal points sit in the same space. Optionally the student
// moves one brand's ratings with sliders and sees where the planned position would fall (the map's axes stay fixed),
// with every ideal point's distance to every brand in a table.
//   { type: 'percmap', title, brands: ['Lantern', …], means: [[…] per brand], attributes: ['Taste', …],
//     ideals: [{ name, profile: [...] }], highlight: 'Lantern', move: true (sliders for the highlighted brand),
//     vectors: true, note }
import { h, s, onResize } from '../../core/dom.js?v=14';
import { xl } from '../xl.js?v=14';
import { frame, lin, axisX, axisY, tableTwin } from '../../core/charts.js?v=14';
import { perceptualMap, distance } from '../../core/percmap.js?v=14';

const f2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : '—');

export function mount(el, cfg, ctx) {
  const base = `pm-${ctx.id}`;
  const map = perceptualMap(cfg.means);
  if (map.error) { el.replaceChildren(h('p', { class: 'note' }, map.error)); return; }
  const hi = Math.max(0, cfg.brands.indexOf(cfg.highlight));
  // on a phone the arrows' and ideal points' labels crowd the brands, so they start switched off there
  const narrowStart = (el.clientWidth || 600) < 520;
  const st = { vectors: cfg.vectors !== false && !narrowStart, ideals: !!cfg.ideals?.length && !narrowStart, plan: cfg.means[hi].slice(), moved: false };
  const chart = h('div', { class: 'chart-box cv-chart pm-chart' });
  const out = h('div', { class: 'cv-out', 'aria-live': 'polite' });
  const table = h('div', { class: 'table-scroll', tabindex: '0', role: 'region', 'aria-label': 'Distances on the map' });
  const twin = h('div');
  const toggle = (id, label, on, set) => {
    const inp = h('input', { type: 'checkbox', id, ...(on ? { checked: '' } : {}) });
    inp.addEventListener('change', () => { set(inp.checked); render(); });
    return h('div', { class: 'field sp-check' }, inp, h('label', { for: id }, label));
  };
  const toggles = h('div', { class: 'sp-toggles' }, toggle(`${base}-v`, 'Show the attribute arrows', st.vectors, (v) => { st.vectors = v; }),
    ...(cfg.ideals?.length ? [toggle(`${base}-i`, 'Show the segments’ ideal points', st.ideals, (v) => { st.ideals = v; })] : []));
  const sliders = cfg.move ? h('fieldset', { class: 'field pm-move' }, h('legend', { class: 'field-label' }, `Plan a new position for ${cfg.brands[hi]}: its average rating on each attribute`),
    ...cfg.attributes.map((a, j) => {
      const id = `${base}-m${j}`, outp = h('output', { for: id, class: 'num' }, cfg.means[hi][j].toFixed(1));
      const inp = h('input', { type: 'range', id, min: 1, max: 7, step: 0.1, value: cfg.means[hi][j].toFixed(1) });
      inp.addEventListener('input', () => { st.plan[j] = Number(inp.value); st.moved = true; outp.textContent = Number(inp.value).toFixed(1); render(); });
      return h('div', { class: 'pm-slider' }, h('label', { for: id }, a), inp, outp);
    }),
    (() => { const b = h('button', { type: 'button', class: 'btn btn-ghost btn-sm' }, 'Reset'); b.addEventListener('click', () => { st.plan = cfg.means[hi].slice(); st.moved = false; sliders.querySelectorAll('input[type=range]').forEach((inp, j) => { inp.value = cfg.means[hi][j].toFixed(1); inp.nextSibling.textContent = cfg.means[hi][j].toFixed(1); }); render(); }); return b; })()) : null;
  el.classList.add('cv-widget', 'pm-widget');
  el.append(...[cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null,
    h('p', { class: 'fx-note' }, `${cfg.brands.length} brands rated on ${cfg.attributes.length} attributes. The two axes together carry ${(map.cumulative[1] * 100).toFixed(0)}% of the differences between the brands’ ratings.`),
    toggles, chart, twin, sliders, out, table,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null].filter(Boolean));

  function render() {
    const pts = map.scores.map((sc) => [sc[0], sc[1]]);
    const ideals = (cfg.ideals || []).map((d) => ({ name: d.name, p: map.project(d.profile) }));
    const plan = map.project(st.plan);
    // the plotting window: brands, ideals and the plan, with room for the arrows
    const all = [...pts, ...(st.ideals ? ideals.map((d) => d.p) : []), ...(st.moved ? [plan] : [])];
    const R = Math.max(1, ...all.map((p) => Math.max(Math.abs(p[0]), Math.abs(p[1])))) * 1.22;
    const cw = chart.clientWidth || 600, narrow = cw < 520;
    const fr = frame(chart, { height: Math.min(560, Math.max(300, Math.round(cw * (narrow ? 1 : 0.72)))), label: `Perceptual map of ${cfg.brands.length} brands on two dimensions`, margin: { t: 18, r: 12, b: 46, l: 40 } });
    // text near the right edge is anchored at its end so it stays inside the chart
    const place = (px, py, dx = 9) => (px > fr.iw * 0.68 ? { x: px - dx, anchor: 'end' } : { x: px + dx, anchor: 'start' });
    const x = lin(-R, R, 0, fr.iw), y = lin(-R, R, fr.ih, 0);
    const ticks = [-Math.floor(R), 0, Math.floor(R)].filter((v, i, a) => a.indexOf(v) === i);
    axisY(fr, y, ticks, { format: (v) => v.toFixed(0), label: `Dimension 2 (${(map.ratio[1] * 100).toFixed(0)}%)` });
    axisX(fr, x, ticks, { format: (v) => v.toFixed(0), label: `Dimension 1 (${(map.ratio[0] * 100).toFixed(0)}%)` });
    fr.g.append(s('line', { x1: x(0), x2: x(0), y1: 0, y2: fr.ih, class: 'pm-zero' }), s('line', { x1: 0, x2: fr.iw, y1: y(0), y2: y(0), class: 'pm-zero' }));
    if (st.vectors) {
      const scale = R * 0.85;
      cfg.attributes.forEach((a, j) => {
        const [lx, ly] = [map.loadings[j][0] * scale, map.loadings[j][1] * scale];
        fr.g.append(s('line', { x1: x(0), y1: y(0), x2: x(lx), y2: y(ly), class: 'pm-vec', 'marker-end': `url(#${base}-arrow)` }));
        const tx = Math.max(0, Math.min(fr.iw, x(lx * 1.08))), anchor = tx > fr.iw * 0.8 ? 'end' : tx < fr.iw * 0.2 ? 'start' : (lx >= 0 ? 'start' : 'end');
        fr.g.append(s('text', { x: tx, y: Math.max(10, Math.min(fr.ih - 4, y(ly * 1.08) + 4)), 'text-anchor': anchor, class: 'pm-vec-label' }, a));
      });
      fr.svg.prepend(s('defs', {}, s('marker', { id: `${base}-arrow`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, s('path', { d: 'M0,0 L10,5 L0,10 z', class: 'pm-arrow' }))));
    }
    if (st.ideals) ideals.forEach((d) => {
      fr.g.append(s('circle', { cx: x(d.p[0]), cy: y(d.p[1]), r: 7, class: 'pm-ideal' }));
      const t = place(x(d.p[0]), y(d.p[1]), 10);
      fr.g.append(s('text', { x: t.x, y: y(d.p[1]) + 16, 'text-anchor': t.anchor, class: 'pm-ideal-label' }, d.name));
    });
    pts.forEach((p, b) => {
      fr.g.append(s('circle', { cx: x(p[0]), cy: y(p[1]), r: 6, class: b === hi ? 'pm-brand pm-brand-on' : 'pm-brand' }));
      const t = place(x(p[0]), y(p[1]));
      fr.g.append(s('text', { x: t.x, y: y(p[1]) - 8, 'text-anchor': t.anchor, class: b === hi ? 'pm-label pm-label-on' : 'pm-label' }, cfg.brands[b]));
    });
    if (st.moved) {
      fr.g.append(s('line', { x1: x(pts[hi][0]), y1: y(pts[hi][1]), x2: x(plan[0]), y2: y(plan[1]), class: 'pm-move-line' }));
      fr.g.append(s('circle', { cx: x(plan[0]), cy: y(plan[1]), r: 6, class: 'pm-plan' }));
      const t = place(x(plan[0]), y(plan[1]));
      fr.g.append(s('text', { x: t.x, y: y(plan[1]) + 16, 'text-anchor': t.anchor, class: 'pm-label pm-label-on' }, `${cfg.brands[hi]} (planned)`));
    }
    twin.replaceChildren();
    tableTwin(twin, { caption: 'Map coordinates', columns: [{ label: 'Point' }, { label: 'Dimension 1', num: true }, { label: 'Dimension 2', num: true }],
      rows: [...pts.map((p, b) => [cfg.brands[b], f2(p[0]), f2(p[1])]), ...ideals.map((d) => [`Ideal: ${d.name}`, f2(d.p[0]), f2(d.p[1])]), ...(st.moved ? [[`${cfg.brands[hi]} (planned)`, f2(plan[0]), f2(plan[1])]] : [])] });
    if (ideals.length) {
      const cols = [...cfg.brands, ...(st.moved ? [`${cfg.brands[hi]} (planned)`] : [])];
      const pos = [...pts, ...(st.moved ? [plan] : [])];
      table.replaceChildren(h('table', { class: 'data-table' }, h('caption', {}, 'Distance on the map from each segment’s ideal point to each brand (shorter = closer to what the segment wants; the nearest is in bold)'),
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Ideal point'), ...cols.map((c) => h('th', { scope: 'col' }, c)))),
        h('tbody', {}, ...ideals.map((d) => { const ds = pos.map((p) => distance(p, d.p)); const m = Math.min(...ds); return h('tr', {}, h('th', { scope: 'row' }, d.name), ...ds.map((v) => h('td', { class: 'num' }, v === m ? h('strong', {}, f2(v)) : f2(v)))); }))));
    }
    out.replaceChildren(h('p', { class: 'fx-note' }, st.moved ? `The axes stay where the six brands put them, so the planned ${cfg.brands[hi]} moves without moving anyone else. A real change of ratings would come from customers, not a slider.` : 'Arrows point towards brands rated high on that attribute; a brand far along an arrow is seen as strong on it. Distances are only meaningful within the map, and the map carries only part of the differences.'));
    ctx.report?.('percmap', { moved: st.moved });
  }
  render();
  onResize(el, render);
}
