// marketing-map.js — the Market map: a world choropleth of World Bank data, a weighted market-attractiveness score,
// attractiveness against reach (GE–McKinsey style) and the visitor's own measures by country.
// The outlines are prebuilt SVG paths (tools/build_map.mjs), so the page needs no map library.
import { initSite, syncRanges } from '../core/site.js?v=6';
import { $, $$, h, s, download, toCSV, onResize, debounce, rafThrottle, reducedMotion } from '../core/dom.js?v=6';
import * as F from '../core/format.js?v=6';
import * as S from '../core/stats.js?v=6';
import { parseTable, isNumeric } from '../core/csv.js?v=6';
import { Tooltip, frame, axisX, axisY, lin, tableTwin, legendEl } from '../core/charts.js?v=6';
import { verdict } from '../core/ui.js?v=6';
import { measures, attractiveness, rankDesc, haversine, reachScore } from '../core/market.js?v=6';
initSite();

// ---------------------------------------------------------------- measures and colour
// sequential: one blue, light → dark; diverging: terracotta ← warm grey → blue, four steps an arm, 0 is a break
const SEQ = ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95', '#0d366b'];
const DIV = ['#8e3b17', '#a9674c', '#c09079', '#d5b7a5', '#b2bbc5', '#8397b2', '#53729d', '#1f4a85'];
const signedPct = (d) => (v) => (Number.isFinite(v) ? `${v > 0 ? '+' : ''}${F.pct(v, d)}` : '—');
const BUILT_IN = [
  { key: 'score', label: 'Attractiveness score', title: 'Attractiveness score', unit: '0–100 with your weights, against the other countries in view', fmt: (v) => F.num(v, 0), breaks: [30, 40, 50, 60, 70, 80], kind: 'seq' },
  { key: 'gdp', label: 'Market size: GDP', title: 'GDP', unit: 'current US dollars', fmt: (v) => F.money(v, { compact: true }), breaks: [1e10, 3e10, 1e11, 3e11, 1e12, 3e12], kind: 'seq', factor: { weight: 35, log: true, name: 'Market size (GDP)' } },
  { key: 'gdppc', label: 'Wealth: GDP per person', title: 'GDP per person', unit: 'current US dollars', fmt: (v) => F.money(v), legendFmt: (v) => F.money(v, { compact: true }), breaks: [1000, 2500, 5000, 10000, 25000, 50000], kind: 'seq', factor: { weight: 25, log: true, name: 'Wealth (GDP per person)' } },
  { key: 'growth', label: 'Growth: GDP in US dollars', title: 'GDP growth', unit: 'a year, over five years, in US dollars', fmt: signedPct(1), breaks: [-0.08, -0.04, -0.02, 0, 0.02, 0.04, 0.08], kind: 'div', factor: { weight: 25, name: 'GDP growth' } },
  { key: 'pop', label: 'Population', title: 'Population', unit: 'people', fmt: (v) => F.compact(v), breaks: [1e6, 5e6, 1e7, 3e7, 1e8, 3e8], kind: 'seq', factor: { weight: 0, log: true, name: 'Population' } },
  { key: 'popGrowth', label: 'Population growth', title: 'Population growth', unit: 'a year, over five years', fmt: signedPct(2), legendFmt: signedPct(1), breaks: [-0.02, -0.01, -0.005, 0, 0.005, 0.01, 0.02], kind: 'div', factor: { weight: 15, name: 'Population growth' } },
  { key: 'reach', label: 'Reach from your home country', title: 'Reach from home', unit: '100 = next door, 0 = the far side of the planet', fmt: (v) => F.num(v, 0), breaks: [30, 45, 60, 70, 80, 90], kind: 'seq' },
];
const REGIONS = ['Africa', 'Asia', 'Europe', 'Latin America & Caribbean', 'Northern America', 'Oceania'];
const sig2 = (v) => (v === 0 ? 0 : Number(v.toPrecision(2)));

/** Class breaks for a measure we know nothing about: diverging if it crosses zero, else quantiles (on a log scale if it spans 100×). */
function autoBreaks(vals) {
  const v = S.finite(vals);
  if (v.length < 4) return { kind: 'seq', breaks: v.length ? [sig2(S.median(v))] : [] };
  const lo = Math.min(...v), hi = Math.max(...v);
  const uniq = (a) => [...new Set(a.map(sig2))].sort((x, y) => x - y);
  if (lo < 0 && hi > 0) {
    const abs = v.map(Math.abs);
    const q = uniq([0.25, 0.5, 0.75].map((p) => S.quantile(abs, p))).filter((x) => x > 0);
    return { kind: 'div', breaks: [...q.map((x) => -x).reverse(), 0, ...q] };
  }
  if (lo > 0 && hi / lo > 100) { const lg = v.map(Math.log); return { kind: 'seq', breaks: uniq([1, 2, 3, 4, 5, 6].map((k) => Math.exp(S.quantile(lg, k / 7)))) }; }
  return { kind: 'seq', breaks: uniq([1, 2, 3, 4, 5, 6].map((k) => S.quantile(v, k / 7))) };
}
/** The ramp for n classes: the full sequential range spread evenly, or the diverging arms trimmed from the outside in. */
function rampFor(kind, n) {
  if (kind === 'div') { const arm = Math.floor(n / 2); return [...DIV.slice(4 - arm, 4), ...DIV.slice(4, 4 + arm)]; }
  if (n <= 1) return [SEQ[3]];
  return Array.from({ length: n }, (_, i) => SEQ[Math.round((i * (SEQ.length - 1)) / (n - 1))]);
}
const classOf = (v, breaks) => breaks.filter((b) => v >= b).length;

// ---------------------------------------------------------------- state
const st = { doc: null, rows: [], measures: [...BUILT_IN], measure: 'score', region: 'All', weights: {}, dirs: {}, home: null, selected: -1, showAll: false, view: null, custom: [] };
const M = (key) => st.measures.find((m) => m.key === key);
const factors = () => st.measures.filter((m) => m.factor).map((m) => ({ key: m.key, weight: st.weights[m.key] || 0, log: !!m.factor.log, higherIsBetter: st.dirs[m.key] !== false }));
const inRegion = (r) => st.region === 'All' || r.r === st.region;
const regionLabel = () => (st.region === 'All' ? 'the whole world' : st.region);
const ord = (n) => { const v = n % 100; return `${n}${v >= 11 && v <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th'}`; };

function computeScore() {
  const pool = st.rows.filter(inRegion);
  const res = attractiveness(pool.map((r) => r.m), factors());
  const rank = rankDesc(res.score);
  st.rows.forEach((r) => { r.m.score = NaN; r.rank = NaN; });
  pool.forEach((r, i) => { r.m.score = res.score[i]; r.rank = rank[i]; });
  st.pool = pool; st.scored = pool.filter((r) => Number.isFinite(r.m.score));
}
function computeReach() {
  const home = st.rows.find((r) => r.iso === st.home);
  st.rows.forEach((r) => {
    r.km = home && r.ll ? haversine(home.ll, r.ll) : NaN;
    r.m.reach = reachScore(r.km);
  });
}

// ---------------------------------------------------------------- the map
let svg, gLand, gDots, gSel, tip, mapBox;
function buildMap() {
  const { width: W, height: H, sphere } = st.doc.meta;
  mapBox = $('#map-box');
  svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'map-svg', role: 'img', preserveAspectRatio: 'xMidYMid meet' });
  svg.append(s('defs', {}, s('pattern', { id: 'map-nodata', width: 5, height: 5, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' },
    s('rect', { width: 5, height: 5, class: 'nodata-bg' }), s('line', { x1: 0, y1: 0, x2: 0, y2: 5, class: 'nodata-line' }))));
  svg.append(s('path', { d: sphere, class: 'map-sphere' }));
  gLand = s('g', { class: 'map-land' }); gDots = s('g', { class: 'map-dots' }); gSel = s('g', { class: 'map-sel' });
  st.rows.forEach((r, i) => {
    r.el = r.d ? s('path', { d: r.d, 'data-i': i }) : s('circle', { cx: r.c[0], cy: r.c[1], r: 2.6, 'data-i': i });
    (r.d ? gLand : gDots).append(r.el);
  });
  svg.append(gLand, gDots, gSel);
  mapBox.replaceChildren(svg);
  tip = new Tooltip(mapBox);
  const at = (e) => { const t = e.target.closest?.('[data-i]'); return t ? +t.dataset.i : -1; };
  svg.addEventListener('pointermove', rafThrottle((e) => hover(at(e), e)));
  svg.addEventListener('pointerleave', () => hover(-1));
  svg.addEventListener('click', (e) => { const i = at(e); if (i >= 0) select(i); });
  st.view = [0, 0, W, H];
}
let hovered = -1;
function hover(i, e) {
  if (i !== hovered) { hovered = i; drawHighlights(); }
  if (i < 0) { tip.hide(); return; }
  const r = st.rows[i], m = M(st.measure), box = mapBox.getBoundingClientRect();
  const v = r.m[st.measure];
  const rows = [{ value: Number.isFinite(v) ? m.fmt(v) : 'No data', label: m.key === 'score' ? (Number.isFinite(v) ? `rank ${ord(r.rank)} of ${st.scored.length}` : '') : m.title.toLowerCase() }];
  if (m.key !== 'score' && Number.isFinite(r.m.score)) rows.push({ value: F.num(r.m.score, 0), label: 'attractiveness' });
  if (r.y && r.y !== 2023 && ['gdp', 'gdppc', 'growth', 'pop', 'popGrowth', 'score'].includes(m.key)) rows.push({ value: String(r.y), label: 'latest year with data' });
  tip.show(e.clientX - box.left, e.clientY - box.top, r.n, rows);
}
function drawHighlights() {
  gSel.replaceChildren();
  const add = (i, cls) => {
    if (i < 0) return;
    const r = st.rows[i];
    gSel.append(r.d ? s('path', { d: r.d, class: cls }) : s('circle', { cx: r.c[0], cy: r.c[1], r: dotR * 1.8, class: cls }));
  };
  add(st.selected, 'map-selected-halo');
  add(st.selected, 'map-selected');
  if (hovered !== st.selected) add(hovered, 'map-hover');
}
function fillFor(r, m, ramp) {
  if (!inRegion(r)) return null;
  const v = r.m[m.key];
  return Number.isFinite(v) ? ramp[classOf(v, m.breaks)] : 'url(#map-nodata)';
}
function paintMap() {
  if (!svg) return;
  tip.hide(); hovered = -1;
  const m = M(st.measure), ramp = rampFor(m.kind, m.breaks.length + 1);
  st.rows.forEach((r) => {
    const f = fillFor(r, m, ramp);
    r.el.classList.toggle('is-out', f == null);
    r.el.style.fill = f || '';
  });
  const older = st.rows.filter((r) => inRegion(r) && r.y && r.y < 2023).length;
  $('#map-title').textContent = m.title;
  const when = m.custom ? '' : m.key === 'reach' ? ` · home: ${st.rows.find((r) => r.iso === st.home)?.n || '—'}` : ` · 2023${older ? ` (2021–22 for ${older} ${older === 1 ? 'country' : 'countries'})` : ''}${['growth', 'popGrowth'].includes(m.key) ? ', against five years earlier' : ''}`;
  $('#map-sub').textContent = `${m.unit}${when}`;
  svg.setAttribute('aria-label', `World map coloured by ${m.title.toLowerCase()}${st.region === 'All' ? '' : `, zoomed to ${st.region}`}. Use the country finder or the tables to read each value.`);
  drawLegend(m, ramp);
  drawTwin(m);
  drawHighlights();
}
function drawLegend(m, ramp) {
  const fmt = m.legendFmt || m.fmt;
  const n = ramp.length;
  const steps = h('li', { class: 'ramp-item' },
    h('span', { class: 'ramp', style: { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` } }, ramp.map((c) => h('i', { style: { background: c } }))),
    h('span', { class: 'ramp-labels', style: { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` } }, ramp.map((_, k) => h('span', {}, k < n - 1 ? fmt(m.breaks[k]) : ''))));
  const items = [steps, h('li', {}, h('i', { class: 'sw sw-nodata' }), 'No data')];
  if (st.region !== 'All') items.push(h('li', {}, h('i', { class: 'sw sw-out' }), `Outside ${st.region}`));
  items.push(h('li', {}, h('i', { class: 'sw sw-dot' }), 'Small countries are dots'));
  $('#map-legend').replaceChildren(...items);
}
function drawTwin(m) {
  const box = $('#map-twin');
  const wasOpen = !!box.querySelector('details[open]');
  const rows = st.rows.filter((r) => inRegion(r) && r.iso).sort((a, b) => (Number.isFinite(b.m[m.key]) ? b.m[m.key] : -Infinity) - (Number.isFinite(a.m[m.key]) ? a.m[m.key] : -Infinity));
  box.replaceChildren();
  tableTwin(box, { caption: `${m.title} by country, ${regionLabel()}`, open: wasOpen, columns: [{ label: 'Country' }, { label: m.title, num: true }],
    rows: rows.map((r) => [r.n, Number.isFinite(r.m[m.key]) ? m.fmt(r.m[m.key]) : 'No data']) });
}

// zooming to a region: the view box eases from the old window to the new one
let dotR = 2.6;
function setView(v) {
  st.view = v;
  svg.setAttribute('viewBox', v.map((x) => x.toFixed(1)).join(' '));
  const px = (svg.clientWidth || 600) / v[2];
  dotR = 3.2 / px;
  st.rows.forEach((r) => { if (!r.d) r.el.setAttribute('r', dotR.toFixed(2)); });
  drawHighlights();
}
function targetView() {
  const { width: W, height: H, views } = st.doc.meta;
  if (st.region === 'All') return [0, 0, W, H];
  const [x0, y0, x1, y1] = views[st.region];
  let w = x1 - x0 + 24, hh = y1 - y0 + 24, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  if (w / hh > W / H) hh = w * H / W; else w = hh * W / H;
  return [cx - w / 2, cy - hh / 2, w, hh];
}
let anim = 0;
function zoom() {
  if (!svg) return;
  const to = targetView(), from = st.view.slice();
  cancelAnimationFrame(anim);
  if (reducedMotion() || document.documentElement.classList.contains('motion-paused')) { setView(to); return; }
  const t0 = performance.now(), dur = 520;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  const step = (now) => {
    const t = Math.min(1, (now - t0) / dur), k = ease(t);
    setView(from.map((v, i) => v + (to[i] - v) * k));
    if (t < 1) anim = requestAnimationFrame(step);
  };
  anim = requestAnimationFrame(step);
}

// ---------------------------------------------------------------- one country in detail
function select(i, { scroll = false } = {}) {
  st.selected = i;
  drawHighlights();
  renderDetail();
  if (scroll) $('#world').scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
}
function renderDetail() {
  const box = $('#map-detail');
  if (st.selected < 0) { box.replaceChildren(h('p', { class: 'note map-hint' }, 'Point at a country to read its numbers; click or tap one, or find it by name, to keep it here.')); return; }
  const r = st.rows[st.selected];
  const home = st.rows.find((x) => x.iso === st.home);
  const item = (k, v, sub) => h('div', { class: 'stat' }, h('dt', {}, k), h('dd', { class: 'num' }, v, sub ? h('span', { class: 'stat-sub' }, ` ${sub}`) : ''));
  const items = [];
  if (Number.isFinite(r.m.score)) items.push(item('Attractiveness', F.num(r.m.score, 0), `${ord(r.rank)} of ${st.scored.length}`));
  else if (inRegion(r)) items.push(item('Attractiveness', 'Not scored', 'missing a weighted measure'));
  else items.push(item('Attractiveness', 'Not scored', `outside ${st.region}`));
  BUILT_IN.filter((m) => m.factor).forEach((m) => items.push(item(m.title, Number.isFinite(r.m[m.key]) ? m.fmt(r.m[m.key]) : 'No data')));
  st.custom.forEach((m) => items.push(item(m.title, Number.isFinite(r.m[m.key]) ? m.fmt(r.m[m.key]) : 'No data')));
  if (home && r.iso !== home.iso && Number.isFinite(r.km)) items.push(item(`From ${home.n}`, `${F.int(r.km)} km`, `reach ${F.num(r.m.reach, 0)}`));
  const canHome = r.ll && r.iso && r.iso !== st.home;
  const btn = canHome ? h('button', { class: 'btn btn-secondary', type: 'button' }, `Make ${r.n} the home country`) : null;
  btn?.addEventListener('click', () => setHome(r.iso));
  const close = h('button', { class: 'icon-btn cc-close', type: 'button', 'aria-label': `Close ${r.n}` }, '×');
  close.addEventListener('click', () => select(-1));
  box.replaceChildren(h('article', { class: 'country-card', 'aria-label': r.n },
    h('div', { class: 'cc-head' }, h('div', {}, h('h3', {}, r.n), h('p', { class: 'cc-region' }, [r.sr || r.r, r.y && r.y !== 2023 ? `figures for ${r.y}` : ''].filter(Boolean).join(' · '))), close),
    r.gdp == null && !st.custom.some((m) => Number.isFinite(r.m[m.key])) ? h('p', { class: 'note' }, 'The World Bank has no recent GDP figure for this country, so it is left out of the ranking.') : h('dl', { class: 'stats-row cc-grid' }, items),
    btn ? h('div', { class: 'input-actions' }, btn) : ''));
}
function findCountry() {
  const q = $('#map-find').value.trim().toLowerCase();
  const err = $('#map-find-error');
  if (!q) { err.textContent = ''; return; }
  const i = st.rows.findIndex((r) => r.n.toLowerCase() === q || r.iso.toLowerCase() === q);
  const j = i >= 0 ? i : st.rows.findIndex((r) => r.n.toLowerCase().startsWith(q));
  if (j < 0) { err.textContent = `No country called “${$('#map-find').value.trim()}”. Pick one from the list.`; return; }
  err.textContent = '';
  if (!inRegion(st.rows[j])) setRegion('All');
  select(j);
}

// ---------------------------------------------------------------- the score
function buildWeights() {
  const box = $('#score-weights');
  $$('.slider-field', box).forEach((el) => el.remove());
  st.measures.filter((m) => m.factor && !m.custom).forEach((m) => box.append(weightSlider(m)));
  const extra = $('#score-extra');
  extra.replaceChildren();
  if (st.custom.length) {
    const fs = h('fieldset', {}, h('legend', {}, 'Your measures'));
    st.custom.forEach((m) => {
      const dir = h('select', { class: 'select select-sm', id: `dir-${m.id}`, 'aria-label': `For ${m.title}` }, h('option', { value: 'up' }, 'Higher is better'), h('option', { value: 'down' }, 'Lower is better'));
      dir.value = st.dirs[m.key] === false ? 'down' : 'up';
      dir.addEventListener('change', () => { st.dirs[m.key] = dir.value === 'up'; update(); });
      fs.append(weightSlider(m), dir);
    });
    extra.append(fs);
  }
  syncRanges(box); syncRanges(extra);
}
function weightSlider(m) {
  const id = `w-${m.id || m.key}`;
  const out = h('output', { for: id }, String(st.weights[m.key] || 0));
  const input = h('input', { type: 'range', id, min: 0, max: 100, step: 5, value: st.weights[m.key] || 0 });
  input.addEventListener('input', () => { st.weights[m.key] = +input.value; out.textContent = input.value; updateScoreLive(); });
  return h('div', { class: 'slider-field' }, h('div', { class: 'slider-top' }, h('label', { for: id }, m.factor.name), out), input);
}
const updateScoreLive = rafThrottle(() => update());
function renderScore() {
  const err = $('#score-error');
  err.replaceChildren();
  const live = factors().filter((f) => f.weight > 0);
  const scored = st.scored;
  if (!live.length) err.append(verdict('bad', 'No score yet.', 'Give at least one measure a weight above zero.'));
  else if (scored.length < 3) err.append(verdict('bad', 'Too few countries to compare.', `Only ${scored.length} countries in ${regionLabel()} have every weighted measure.`));
  const left = st.pool.filter((r) => !Number.isFinite(r.m.score) && (r.gdp != null || st.custom.some((m) => Number.isFinite(r.m[m.key])))).length;
  const top = scored.slice().sort((a, b) => a.rank - b.rank);
  $('#score-stats').replaceChildren(...[
    ['Countries scored', `${F.int(scored.length)}`, `in ${regionLabel()}`],
    ['Top market', top[0] ? top[0].n : '—', top[0] ? F.num(top[0].m.score, 0) : ''],
    ['Left out, missing data', F.int(left), ''],
  ].map(([k, v, sub]) => h('div', { class: 'stat' }, h('dt', {}, k), h('dd', {}, v, sub ? h('span', { class: 'stat-sub' }, ` ${sub}`) : ''))));
  // ranking table
  const cols = st.measures.filter((m) => m.factor && (st.weights[m.key] || 0) > 0);
  const shown = st.showAll ? top : top.slice(0, 15);
  $('#score-table-title').textContent = `Ranking, ${regionLabel()}${st.showAll || top.length <= 15 ? '' : `: top 15 of ${top.length}`}`;
  const table = h('table', { class: 'data-table rank-table' },
    h('caption', { class: 'visually-hidden' }, `Countries ranked by attractiveness score, ${regionLabel()}`),
    h('thead', {}, h('tr', {}, h('th', { scope: 'col', class: 'is-num' }, '#'), h('th', { scope: 'col' }, 'Country'),
      h('th', { scope: 'col' }, 'Score'), cols.map((m) => h('th', { scope: 'col', class: 'is-num' }, m.title)))),
    h('tbody', {}, shown.map((r) => {
      const b = h('button', { class: 'country-btn', type: 'button', 'aria-label': `${r.n}: show on the map` }, r.n);
      b.addEventListener('click', () => select(r.i, { scroll: true }));
      return h('tr', { class: r.i === st.selected ? 'is-strong' : '' },
        h('td', { class: 'is-num' }, String(r.rank)), h('th', { scope: 'row' }, b, st.region === 'All' ? h('span', { class: 'rank-region' }, r.r) : ''),
        h('td', {}, h('span', { class: 'score-cell' }, h('span', { class: 'score-bar', 'aria-hidden': 'true' }, h('i', { style: { width: `${Math.max(1, r.m.score).toFixed(1)}%` } })), h('strong', { class: 'num' }, F.num(r.m.score, 0)))),
        cols.map((m) => h('td', { class: 'is-num' }, m.fmt(r.m[m.key]))));
    })));
  $('#score-table').replaceChildren(top.length ? table : h('p', { class: 'note' }, 'Nothing to rank yet.'));
  const more = $('#score-more');
  more.hidden = top.length <= 15;
  more.textContent = st.showAll ? 'Show the top 15' : `Show all ${top.length} countries`;
  more.setAttribute('aria-expanded', String(st.showAll));
}

// ---------------------------------------------------------------- attractiveness against reach
const zoneOf = (score, reach) => { const L = (v) => (v >= 200 / 3 ? 3 : v >= 100 / 3 ? 2 : 1); const t = L(score) + L(reach); return t >= 5 ? 'invest' : t === 4 ? 'select' : 'avoid'; };
const ZONES = { invest: 'Invest and grow', select: 'Selective', avoid: 'Harvest or avoid' };
let reachActive = -1;
function renderReach() {
  const box = $('#reach-plot');
  const home = st.rows.find((r) => r.iso === st.home);
  const pts = st.scored.filter((r) => r.iso !== st.home && Number.isFinite(r.m.reach)).map((r) => ({ r, x: r.m.reach, y: r.m.score, zone: zoneOf(r.m.score, r.m.reach) }));
  $('#reach-plot-title').textContent = `Attractiveness against reach from ${home ? home.n : '—'}, ${regionLabel()}`;
  if (pts.length < 3) { box.replaceChildren(h('p', { class: 'note' }, 'Not enough scored countries to plot.')); $('#reach-list').replaceChildren(); return; }
  const fr = frame(box, { height: Math.min(440, Math.max(300, (box.clientWidth || 600) * 0.62)), label: `Scatter of ${pts.length} countries: attractiveness score against reach from ${home?.n}. The shortlist and the table below list them.`, margin: { l: 46, r: 14, t: 18, b: 46 } });
  const x = lin(0, 100, 0, fr.iw), y = lin(0, 100, fr.ih, 0);
  const third = [0, 100 / 3, 200 / 3, 100];
  const zg = s('g', { class: 'zones' });
  for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) {
    const z = zoneOf(third[b] + 1, third[a] + 1);                   // b = score band, a = reach band
    zg.append(s('rect', { x: x(third[a]), y: y(third[b + 1]), width: x(third[a + 1]) - x(third[a]), height: y(third[b]) - y(third[b + 1]), class: `zone zone-${z}` }));
  }
  fr.g.append(zg);
  axisX(fr, x, [0, 25, 50, 75, 100], { format: (v) => F.int(v), label: 'Reach: 100 = next door →' });
  axisY(fr, y, [0, 25, 50, 75, 100], { format: (v) => F.int(v), label: '↑ Attractiveness score', grid: false });
  [1, 2].forEach((k) => { fr.g.append(s('line', { x1: x(third[k]), x2: x(third[k]), y1: 0, y2: fr.ih, class: 'zone-line' })); fr.g.append(s('line', { x1: 0, x2: fr.iw, y1: y(third[k]), y2: y(third[k]), class: 'zone-line' })); });
  fr.g.append(s('text', { x: fr.iw - 6, y: 14, 'text-anchor': 'end', class: 'zone-label' }, ZONES.invest));
  fr.g.append(s('text', { x: 6, y: 14, class: 'zone-label' }, ZONES.select));
  fr.g.append(s('text', { x: 6, y: fr.ih - 8, class: 'zone-label' }, ZONES.avoid));
  const order = pts.slice().sort((a, b) => (a.zone === 'invest') - (b.zone === 'invest'));
  const dots = new Map();
  order.forEach((p) => { const c = s('circle', { cx: x(p.x), cy: y(p.y), r: 4.5, class: `dot ${p.zone === 'invest' ? 'm-s1' : 'm-muted'}${p.r.i === st.selected ? ' is-selected' : ''}` }); fr.g.append(c); dots.set(p, c); });
  // direct labels for the strongest few in the invest zone, skipping any that would collide
  const placed = [];
  pts.filter((p) => p.zone === 'invest').sort((a, b) => (b.x + b.y) - (a.x + a.y)).slice(0, fr.iw < 420 ? 4 : 7).forEach((p) => {
    const w = p.r.n.length * 6.6 + 4, px = x(p.x), py = y(p.y);
    const right = px + 8 + w < fr.iw;
    const bx = right ? px + 8 : px - 8 - w, by = py - 8;
    if (placed.some((q) => bx < q[0] + q[2] && bx + w > q[0] && by < q[1] + 14 && by + 14 > q[1])) return;
    placed.push([bx, by, w]);
    fr.g.append(s('text', { x: right ? px + 8 : px - 8, y: py + 4, 'text-anchor': right ? 'start' : 'end', class: 'pt-label' }, p.r.n));
  });
  // nearest-point hover and one-tab-stop keyboard walk
  const show = (p) => {
    dots.forEach((c) => c.classList.remove('is-active'));
    if (!p) { fr.tip.hide(); return; }
    dots.get(p).classList.add('is-active');
    fr.tip.show(fr.m.l + x(p.x), fr.m.t + y(p.y), p.r.n, [
      { value: F.num(p.y, 0), label: 'attractiveness' }, { value: F.num(p.x, 0), label: `reach (${F.int(p.r.km)} km)` }, { value: ZONES[p.zone], label: '' }]);
  };
  const hit = s('rect', { x: 0, y: 0, width: fr.iw, height: fr.ih, class: 'hit' });
  hit.addEventListener('pointermove', (e) => {
    const rc = fr.svg.getBoundingClientRect();
    const px = (e.clientX - rc.left) * (fr.width / rc.width) - fr.m.l, py = (e.clientY - rc.top) * (fr.height / rc.height) - fr.m.t;
    let best = null, bd = 30 * 30;
    pts.forEach((p) => { const d = (x(p.x) - px) ** 2 + (y(p.y) - py) ** 2; if (d < bd) { bd = d; best = p; } });
    show(best);
  });
  hit.addEventListener('pointerleave', () => show(null));
  hit.addEventListener('click', () => { const a = fr.svg.querySelector('.dot.is-active'); const p = [...dots].find(([, c]) => c === a)?.[0]; if (p) select(p.r.i); });
  fr.g.append(hit);
  const walk = pts.slice().sort((a, b) => (b.x + b.y) - (a.x + a.y));
  fr.svg.setAttribute('tabindex', '0');
  fr.svg.addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Escape', 'Enter'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === 'Escape') { reachActive = -1; show(null); return; }
    if (e.key === 'Enter' && reachActive >= 0) { select(walk[reachActive].r.i); return; }
    reachActive = e.key === 'Home' ? 0 : e.key === 'End' ? walk.length - 1 : Math.max(0, Math.min(walk.length - 1, reachActive + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1)));
    show(walk[reachActive]);
  });
  fr.svg.addEventListener('blur', () => { reachActive = -1; show(null); });
  box.append(legendEl([{ name: 'In the invest-and-grow cells', cls: 'm-s1' }, { name: 'Other markets', cls: 'm-muted' }]));
  tableTwin(box, { caption: 'Every market: zone, score, reach and distance', columns: [{ label: 'Country' }, { label: 'Zone' }, { label: 'Score', num: true }, { label: 'Reach', num: true }, { label: 'Distance', num: true }],
    rows: walk.map((p) => [p.r.n, ZONES[p.zone], F.num(p.y, 0), F.num(p.x, 0), `${F.int(p.r.km)} km`]) });
  // the shortlist
  const short = walk.filter((p) => p.zone === 'invest').slice(0, 10);
  $('#reach-list').replaceChildren(h('h3', { class: 'figure-title' }, short.length ? `Shortlist: the ${short.length === 1 ? 'one market' : `${short.length} strongest markets`} to grow into first` : 'No market lands in the invest-and-grow cells'),
    short.length ? h('ol', { class: 'shortlist' }, short.map((p) => {
      const b = h('button', { class: 'country-btn', type: 'button' }, p.r.n);
      b.addEventListener('click', () => select(p.r.i, { scroll: true }));
      return h('li', {}, b, h('span', { class: 'muted' }, ` score ${F.num(p.y, 0)} · ${F.int(p.r.km)} km`));
    })) : h('p', { class: 'note' }, 'Try a different home country, a wider region, or other weights.'));
}

// ---------------------------------------------------------------- home country and region
function setHome(iso) {
  st.home = iso;
  $('#reach-home').value = iso;
  $('#reach-home-note').textContent = '';
  computeReach();
  update({ score: false });
}
function setRegion(region) {
  st.region = region;
  $$('.region-select').forEach((sel) => { sel.value = region; });
  st.showAll = false;
  update();
  zoom();
}
function fillRegionSelects() {
  const count = (r) => st.rows.filter((x) => x.gdp != null && (r === 'All' || x.r === r)).length;
  $$('.region-select').forEach((sel) => {
    sel.replaceChildren(h('option', { value: 'All' }, `The whole world (${count('All')})`), ...REGIONS.map((r) => h('option', { value: r }, `${r} (${count(r)})`)));
    sel.value = st.region;
    sel.addEventListener('change', () => setRegion(sel.value));
  });
}
function fillMeasureSelect() {
  const sel = $('#map-measure');
  sel.replaceChildren(h('optgroup', { label: 'Built in' }, BUILT_IN.map((m) => h('option', { value: m.key }, m.label))),
    st.custom.length ? h('optgroup', { label: 'Your measures' }, st.custom.map((m) => h('option', { value: m.key }, m.label))) : '');
  sel.value = st.measure;
}

// ---------------------------------------------------------------- your own measures
const norm = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();
const ALIASES = { 'united states of america': 'USA', usa: 'USA', us: 'USA', uk: 'GBR', 'great britain': 'GBR', britain: 'GBR', 'korea rep': 'KOR', 'republic of korea': 'KOR', korea: 'KOR', russia: 'RUS', 'russian federation': 'RUS', 'czech republic': 'CZE', turkey: 'TUR', 'viet nam': 'VNM', 'iran islamic rep': 'IRN', 'egypt arab rep': 'EGY', 'congo dem rep': 'COD', 'democratic republic of the congo': 'COD', 'congo rep': 'COG', 'ivory coast': 'CIV', 'cote d ivoire': 'CIV', 'hong kong sar china': 'HKG', 'macao sar china': 'MAC', 'slovak republic': 'SVK', 'kyrgyz republic': 'KGZ', 'lao pdr': 'LAO', 'syrian arab republic': 'SYR', 'venezuela rb': 'VEN', 'yemen rep': 'YEM', 'gambia the': 'GMB', 'bahamas the': 'BHS', 'micronesia fed sts': 'FSM', eswatini: 'SWZ', swaziland: 'SWZ', burma: 'MMR', 'cabo verde': 'CPV', 'cape verde': 'CPV', holland: 'NLD', 'the netherlands': 'NLD', 'uae': 'ARE' };
function matchCountry(raw) {
  const t = String(raw || '').trim();
  if (/^[A-Za-z]{3}$/.test(t)) { const r = st.rows.find((x) => x.iso === t.toUpperCase()); if (r) return r; }
  const n = norm(t);
  if (ALIASES[n]) return st.rows.find((x) => x.iso === ALIASES[n]) || null;
  return st.rows.find((x) => norm(x.n) === n) || null;
}
function readOwn(text) {
  const err = $('#own-error');
  const t = parseTable(text);
  if (t.error) { err.textContent = t.error; return; }
  // the country column: the text column that matches the most countries
  const textCols = t.columns.filter((c) => !isNumeric(c));
  let best = null, bestHits = 0;
  textCols.forEach((c) => { const hits = c.raw.filter((v) => matchCountry(v)).length; if (hits > bestHits) { bestHits = hits; best = c; } });
  if (!best || bestHits < 2) { err.textContent = 'No column of country codes or names found. Put three-letter codes like DEU in one column.'; return; }
  const nums = t.columns.filter((c) => isNumeric(c) && c !== best);
  if (!nums.length) { err.textContent = 'No number columns found next to the countries. Fill in at least one column of numbers.'; return; }
  err.textContent = '';
  clearOwn(false);
  const unmatched = [...new Set(best.raw.filter((v) => v && !matchCountry(v)))];
  nums.forEach((c, k) => {
    const key = `u${k}`;
    const vals = new Map();
    best.raw.forEach((v, i) => { const r = matchCountry(v); if (r && Number.isFinite(c.values[i])) vals.set(r.i, c.values[i]); });
    st.rows.forEach((r) => { r.m[key] = vals.has(r.i) ? vals.get(r.i) : NaN; });
    const ab = autoBreaks([...vals.values()]);
    const m = { key, id: `own-${k}`, custom: true, label: c.name, title: c.name, unit: 'your data', fmt: (v) => F.auto(v), ...ab, factor: { weight: 0, name: c.name } };
    st.measures.push(m); st.custom.push(m); st.weights[key] = 0; st.dirs[key] = true;
  });
  fillMeasureSelect(); buildWeights();
  st.measure = st.custom[0].key; $('#map-measure').value = st.measure;
  const matched = new Set(best.raw.map((v) => matchCountry(v)?.i).filter((v) => v != null)).size;
  $('#own-clear').hidden = false;
  $('#own-result').replaceChildren(
    verdict('good', `Added ${nums.length === 1 ? 'one measure' : `${nums.length} measures`}:`, `${nums.map((c) => c.name).join(', ')}, for ${F.int(matched)} countries. The map now shows ${nums[0].name}; each one also has a weight under the score, starting at zero.`),
    unmatched.length ? verdict('warn', `${F.int(unmatched.length)} not matched:`, `${unmatched.slice(0, 12).join(', ')}${unmatched.length > 12 ? '…' : ''}. Use three-letter ISO codes for these.`) : '');
  update();
}
function clearOwn(redraw = true) {
  st.measures = st.measures.filter((m) => !m.custom);
  st.custom.forEach((m) => { delete st.weights[m.key]; delete st.dirs[m.key]; st.rows.forEach((r) => { delete r.m[m.key]; }); });
  st.custom = [];
  if (!M(st.measure)) st.measure = 'score';
  if (!redraw) return;
  $('#own-clear').hidden = true;
  $('#own-result').replaceChildren(h('p', { class: 'note' }, 'Your measures are removed.'));
  fillMeasureSelect(); buildWeights(); update();
}

/** A made-up table for trying the upload: last year's sales and the number of rival seed brands in 30 markets. */
function exampleOwn() {
  const isos = ['USA', 'CAN', 'MEX', 'BRA', 'ARG', 'CHL', 'GBR', 'IRL', 'FRA', 'DEU', 'NLD', 'BEL', 'ESP', 'ITA', 'POL', 'SWE', 'DNK', 'TUR', 'ZAF', 'NGA', 'KEN', 'EGY', 'IND', 'CHN', 'JPN', 'KOR', 'AUS', 'NZL', 'SGP', 'ARE'];
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const lines = isos.map((iso) => { const r = st.rows.find((x) => x.iso === iso); const size = Math.log10(r.gdp); return `${iso},${Math.round(10 ** (size - 7.2) * (0.4 + rnd()))},${Math.max(1, Math.round(size * 2.4 - 22 + rnd() * 6))}`; });
  return ['iso3,example_sales_usd,rival_brands', ...lines].join('\n');
}

// ---------------------------------------------------------------- one update for every view
function update({ score = true } = {}) {
  if (score) computeScore();
  paintMap();
  renderScore();
  renderReach();
  renderDetail();
}

// ---------------------------------------------------------------- start
function defaultHome() {
  for (const tag of navigator.languages || [navigator.language]) {
    const a2 = String(tag || '').split('-')[1]?.toUpperCase();
    const r = a2 && st.rows.find((x) => x.a2 === a2 && x.ll);
    if (r) return { iso: r.iso, note: `Set from your browser’s region setting (${tag}).` };
  }
  return { iso: 'USA', note: '' };
}
async function start() {
  let doc;
  try {
    const res = await fetch('../../assets/data/world-markets.json');
    if (!res.ok) throw new Error(res.status);
    doc = await res.json();
  } catch {
    $('#map-box').replaceChildren(verdict('bad', 'The map data didn’t load.', 'Check the connection and reload the page.'));
    return;
  }
  st.doc = doc;
  st.rows = doc.countries.map((c, i) => ({ ...c, i, m: measures(c) }));
  BUILT_IN.forEach((m) => { if (m.factor) st.weights[m.key] = m.factor.weight; });
  const dh = defaultHome();
  st.home = dh.iso;
  // controls
  fillMeasureSelect();
  $('#map-measure').addEventListener('change', (e) => { st.measure = e.target.value; paintMap(); });
  fillRegionSelects();
  $('#map-names').replaceChildren(...st.rows.filter((r) => r.iso).map((r) => h('option', { value: r.n })));
  $('#map-find').addEventListener('change', findCountry);
  $('#map-find').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); findCountry(); } });
  const homeSel = $('#reach-home');
  homeSel.replaceChildren(...st.rows.filter((r) => r.iso && r.ll && r.gdp != null).map((r) => h('option', { value: r.iso }, r.n)));
  homeSel.value = st.home;
  $('#reach-home-note').textContent = dh.note;
  homeSel.addEventListener('change', () => setHome(homeSel.value));
  buildWeights();
  $('#score-reset').addEventListener('click', () => { BUILT_IN.forEach((m) => { if (m.factor) st.weights[m.key] = m.factor.weight; }); st.custom.forEach((m) => { st.weights[m.key] = 0; }); buildWeights(); update(); });
  $('#score-more').addEventListener('click', () => { st.showAll = !st.showAll; renderScore(); });
  $('#score-csv').addEventListener('click', () => {
    const cols = st.measures.filter((m) => m.factor);
    const top = st.scored.slice().sort((a, b) => a.rank - b.rank);
    download(`market-ranking-${st.region === 'All' ? 'world' : norm(st.region).replace(/ /g, '-')}.csv`, toCSV(['rank', 'iso3', 'country', 'region', 'score', ...cols.map((m) => m.key), 'distance_km'],
      top.map((r) => [r.rank, r.iso, r.n, r.r, r.m.score.toFixed(2), ...cols.map((m) => (Number.isFinite(r.m[m.key]) ? +r.m[m.key].toPrecision(6) : '')), Number.isFinite(r.km) ? Math.round(r.km) : ''])));
  });
  $('#own-read').addEventListener('click', () => readOwn($('#own-paste').value));
  $('#own-file').addEventListener('change', async (e) => { const f = e.target.files[0]; if (!f) return; if (f.size > 25 * 1024 * 1024) { $('#own-error').textContent = 'That file is over 25 MB.'; return; } readOwn(await f.text()); });
  $('#own-template').addEventListener('click', () => download('market-measures-template.csv', toCSV(['iso3', 'country', 'my_measure'], st.rows.filter((r) => r.iso && r.gdp != null).map((r) => [r.iso, r.n, '']))));
  $('#own-clear').addEventListener('click', () => clearOwn());
  $('#own-example').addEventListener('click', () => { $('#own-paste').value = exampleOwn(); readOwn($('#own-paste').value); });
  buildMap();
  computeReach();
  update();
  setView(targetView());
  onResize($('#map-box'), debounce(() => { setView(st.view); }, 100));
  onResize($('#reach-plot'), debounce(() => renderReach(), 150));
}
start();
