// percmap.js — the `percmap` lesson widget (M05): a perceptual map from brands' mean ratings on several attributes.
// Brands are placed by the first two principal components of the attributes (core/percmap.js); each attribute is an
// arrow pointing where brands rate high on it; segments' ideal points sit in the same space. Optionally the student
// moves one brand's ratings with sliders and sees where the planned position would fall (the map's axes stay fixed),
// with every ideal point's distance to every brand in a table.
//   { type: 'percmap', title, brands: ['Lantern', …], means: [[…] per brand], attributes: ['Taste', …],
//     ideals: [{ name, profile: [...] }], highlight: 'Lantern', move: true (sliders for the highlighted brand),
//     vectors: true, noun: ['option', 'options'] (what the points are called; default brand/brands), note }
import { h, s, onResize } from '../../core/dom.js?v=19';
import { xl } from '../xl.js?v=19';
import { frame, lin, axisX, axisY, tableTwin } from '../../core/charts.js?v=19';
import { perceptualMap, distance } from '../../core/percmap.js?v=19';

const f2 = (v) => (Number.isFinite(v) ? v.toFixed(2).replace('-', '−') : '—');
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

export function mount(el, cfg, ctx) {
  const base = `pm-${ctx.id}`;
  const map = perceptualMap(cfg.means);
  if (map.error) { el.replaceChildren(h('p', { class: 'note' }, map.error)); return; }
  const hi = Math.max(0, cfg.brands.indexOf(cfg.highlight));
  const [one, many] = cfg.noun || ['brand', 'brands'];
  const nB = cfg.brands.length, nWord = WORDS[nB] || String(nB);
  // on a phone the arrows' and ideal points' labels crowd the brands, so they start switched off there
  const narrowStart = (el.clientWidth || 600) < 520;
  const st = { vectors: cfg.vectors !== false && !narrowStart, ideals: !!cfg.ideals?.length && !narrowStart, plan: cfg.means[hi].slice(), moved: false };
  const chart = h('div', { class: 'chart-box cv-chart pm-chart' });
  const out = h('div', { class: 'cv-out', 'aria-live': 'polite' });
  // the caption sits above the scroller (a <caption> scrolls with a wide table and is cut off on a phone)
  const distCap = h('p', { class: 'fx-cap', id: `${base}-dcap` });
  const table = h('div', { class: 'table-scroll', tabindex: '0', role: 'region', 'aria-labelledby': `${base}-dcap` });
  const twin = h('div');
  const hint = h('p', { class: 'fx-note', 'aria-live': 'polite' });
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
    h('p', { class: 'fx-note' }, `${nB} ${many} rated on ${cfg.attributes.length} attributes. The two axes together carry ${(map.cumulative[1] * 100).toFixed(0)}% of the differences between the ${many}’ ratings.`),
    toggles, hint, chart, twin, sliders, out, distCap, table,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null].filter(Boolean));

  function render() {
    const pts = map.scores.map((sc) => [sc[0], sc[1]]);
    const ideals = (cfg.ideals || []).map((d) => ({ name: d.name, p: map.project(d.profile) }));
    const plan = map.project(st.plan);
    // the plotting window: brands, ideals and the plan, with room for the arrows
    const all = [...pts, ...(st.ideals ? ideals.map((d) => d.p) : []), ...(st.moved ? [plan] : [])];
    const R = Math.max(1, ...all.map((p) => Math.max(Math.abs(p[0]), Math.abs(p[1])))) * 1.22;
    const cw = chart.clientWidth || 600, narrow = cw < 520;
    const fr = frame(chart, { height: Math.min(560, Math.max(300, Math.round(cw * (narrow ? 1.2 : 0.72)))), label: `Perceptual map of ${nB} ${many} on two dimensions`, margin: { t: 18, r: 12, b: 46, l: 40 } });
    // labels are laid out after every mark is drawn: each is tried at its natural place, then nudged up or down (and,
    // failing that, flipped to the other side) until it overlaps no mark and no label already placed. Widths are
    // estimated at about 0.6 em a character; brands are placed first, then the plan, the ideal points and the arrows.
    const em = narrow ? 12 : 14, emSmall = narrow ? 11.5 : 12.5;
    const marks = [], labels = [];
    const x = lin(-R, R, 0, fr.iw), y = lin(-R, R, fr.ih, 0);
    const ticks = [-Math.floor(R), 0, Math.floor(R)].filter((v, i, a) => a.indexOf(v) === i);
    axisY(fr, y, ticks, { format: (v) => v.toFixed(0), label: `Dimension 2 (${(map.ratio[1] * 100).toFixed(0)}%)` });
    axisX(fr, x, ticks, { format: (v) => v.toFixed(0), label: `Dimension 1 (${(map.ratio[0] * 100).toFixed(0)}%)` });
    fr.g.append(s('line', { x1: x(0), x2: x(0), y1: 0, y2: fr.ih, class: 'pm-zero' }), s('line', { x1: 0, x2: fr.iw, y1: y(0), y2: y(0), class: 'pm-zero' }));
    const dot = (cx, cy, r, cls) => { fr.g.append(s('circle', { cx, cy, r, class: cls })); marks.push([cx - r - 1, cy - r - 1, cx + r + 1, cy + r + 1]); };
    // a label beside a point: to the right unless it would run out of the chart
    const beside = (px, py, dy, text, cls, size, pri, dx = 9) => {
      const w = text.length * size * 0.6, right = px + dx + w <= fr.iw && px <= fr.iw * 0.68;
      labels.push({ text, cls, size, pri, w, px, py, x: right ? px + dx : px - dx, alt: right ? px - dx : px + dx, anchor: right ? 'start' : 'end', y: py + dy });
    };
    if (st.vectors) {
      const scale = R * 0.85;
      cfg.attributes.forEach((a, j) => {
        const [lx, ly] = [map.loadings[j][0] * scale, map.loadings[j][1] * scale];
        fr.g.append(s('line', { x1: x(0), y1: y(0), x2: x(lx), y2: y(ly), class: 'pm-vec', 'marker-end': `url(#${base}-arrow)` }));
        const tx = Math.max(0, Math.min(fr.iw, x(lx * 1.08))), anchor = tx > fr.iw * 0.8 ? 'end' : tx < fr.iw * 0.2 ? 'start' : (lx >= 0 ? 'start' : 'end');
        labels.push({ text: a, cls: 'pm-vec-label', size: emSmall, pri: 3, w: a.length * emSmall * 0.6, x: tx, alt: null, anchor, y: Math.max(10, Math.min(fr.ih - 4, y(ly * 1.08) + 4)) });
      });
      fr.svg.prepend(s('defs', {}, s('marker', { id: `${base}-arrow`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, s('path', { d: 'M0,0 L10,5 L0,10 z', class: 'pm-arrow' }))));
    }
    if (st.ideals) ideals.forEach((d) => { dot(x(d.p[0]), y(d.p[1]), 7, 'pm-ideal'); beside(x(d.p[0]), y(d.p[1]), 16, d.name, 'pm-ideal-label', emSmall, 2, 10); });
    pts.forEach((p, b) => { dot(x(p[0]), y(p[1]), 6, b === hi ? 'pm-brand pm-brand-on' : 'pm-brand'); beside(x(p[0]), y(p[1]), -8, cfg.brands[b], b === hi ? 'pm-label pm-label-on' : 'pm-label', em, 0); });
    if (st.moved) {
      fr.g.append(s('line', { x1: x(pts[hi][0]), y1: y(pts[hi][1]), x2: x(plan[0]), y2: y(plan[1]), class: 'pm-move-line' }));
      dot(x(plan[0]), y(plan[1]), 6, 'pm-plan');
      beside(x(plan[0]), y(plan[1]), 16, `${cfg.brands[hi]} (planned)`, 'pm-label pm-label-on', em, 1);
    }
    const boxOf = (L, lx, ly, anchor) => { const x1 = anchor === 'start' ? lx : anchor === 'end' ? lx - L.w : lx - L.w / 2; return [x1, ly - L.size * 0.85, x1 + L.w, ly + L.size * 0.25]; };
    const hit = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
    const placed = [...marks];
    let crowded = false;
    labels.sort((a, b) => a.pri - b.pri).forEach((L) => {
      const step = L.size * 1.05, sides = [[L.x, L.anchor], ...(L.alt != null ? [[L.alt, L.anchor === 'start' ? 'end' : 'start']] : [])];
      // no free place: take the candidate that overlaps least (crowded maps, mostly on a phone with everything shown)
      const overlap = (bx) => placed.reduce((a, p) => a + Math.max(0, Math.min(p[2], bx[2]) - Math.max(p[0], bx[0])) * Math.max(0, Math.min(p[3], bx[3]) - Math.max(p[1], bx[1])), 0);
      let best = null, least = null;
      for (const [lx, anchor] of sides) {
        for (const k of [0, -1, 1, -2, 2, -3, 3]) {
          const ly = Math.max(L.size, Math.min(fr.ih - 2, L.y + k * step)), raw = boxOf(L, lx, ly, anchor);
          // a label too long for either side is slid back inside the plot (and so gets a leader line)
          const sx = raw[0] < 0 ? -raw[0] : raw[2] > fr.iw ? fr.iw - raw[2] : 0;
          const bx = [raw[0] + sx, raw[1], raw[2] + sx, raw[3]];
          const cand = { lx: lx + sx, ly, anchor, bx, moved: k !== 0 || lx !== L.x || sx !== 0 }, o = overlap(bx);
          if (o === 0) { best = cand; break; }
          if (!least || o < least.o) least = { ...cand, o };
        }
        if (best) break;
      }
      if (!best) { best = least; crowded = true; }
      placed.push(best.bx);
      // a label pushed away from its point gets a thin leader line, so it can't be read as another point's
      if (best.moved && L.px != null) {
        const [x1, y1, x2, y2] = best.bx, cx = Math.max(x1, Math.min(x2, L.px)), cy = Math.max(y1, Math.min(y2, L.py));
        const d = Math.hypot(cx - L.px, cy - L.py);
        if (d > 10) fr.g.append(s('line', { x1: L.px + ((cx - L.px) * 7) / d, y1: L.py + ((cy - L.py) * 7) / d, x2: cx, y2: cy, class: 'pm-leader' }));
      }
      fr.g.append(s('text', { x: best.lx, y: best.ly, 'text-anchor': best.anchor, class: L.cls }, L.text));
    });
    // on a small screen, say so when labels had to overlap
    const hintText = narrow && crowded ? 'On a small screen the labels crowd: switch the arrows or the ideal points off, or use the tables below.' : '';
    if (hint.textContent !== hintText) hint.textContent = hintText;
    hint.hidden = !hintText;
    twin.replaceChildren();
    tableTwin(twin, { caption: 'Map coordinates', columns: [{ label: 'Point' }, { label: 'Dimension 1', num: true }, { label: 'Dimension 2', num: true }],
      rows: [...pts.map((p, b) => [cfg.brands[b], f2(p[0]), f2(p[1])]), ...ideals.map((d) => [`Ideal: ${d.name}`, f2(d.p[0]), f2(d.p[1])]), ...(st.moved ? [[`${cfg.brands[hi]} (planned)`, f2(plan[0]), f2(plan[1])]] : [])] });
    if (ideals.length) {
      // the highlighted brand and its planned position come first, so they stay in view on a narrow screen
      const order = [hi, ...cfg.brands.map((_, b) => b).filter((b) => b !== hi)];
      const cols = [cfg.brands[hi], ...(st.moved ? [`${cfg.brands[hi]} (planned)`] : []), ...order.slice(1).map((b) => cfg.brands[b])];
      const pos = [pts[hi], ...(st.moved ? [plan] : []), ...order.slice(1).map((b) => pts[b])];
      distCap.textContent = `Distance on the map from each segment’s ideal point to each ${one} (shorter = closer to what the segment wants; the nearest is in bold)`;
      table.replaceChildren(h('table', { class: 'data-table pm-dist', 'aria-labelledby': `${base}-dcap` },
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Ideal point'), ...cols.map((c) => h('th', { scope: 'col' }, c)))),
        h('tbody', {}, ...ideals.map((d) => { const ds = pos.map((p) => distance(p, d.p)); const m = Math.min(...ds); return h('tr', {}, h('th', { scope: 'row' }, d.name), ...ds.map((v) => h('td', { class: 'num' }, v === m ? h('strong', {}, f2(v)) : f2(v)))); }))));
    }
    const outText = st.moved ? `The axes stay where the ${nWord} ${many} put them, so the planned ${cfg.brands[hi]} moves without moving anyone else. A real change of ratings would come from customers, not a slider.` : `Arrows point roughly towards ${many} rated high on that attribute; ${/^[aeiou]/i.test(one) ? 'an' : 'a'} ${one} far along an arrow tends to be rated high on it, but the map is a summary, so check the averages. Distances are only meaningful within the map, and the map carries only part of the differences.`;
    if (out.textContent !== outText) out.replaceChildren(h('p', { class: 'fx-note' }, outText));
    ctx.report?.('percmap', { moved: st.moved });
  }
  render();
  onResize(el, render);
}
