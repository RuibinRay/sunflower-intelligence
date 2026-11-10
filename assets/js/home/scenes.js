// scenes.js — the homepage below the painting: previews of each part of the site, drawn as small live panels, and
// the scroll choreography. Three tiers:
//   1. no JavaScript, reduced motion or motion paused: everything is simply there, top to bottom;
//   2. motion on: sections and charts reveal as they enter (IntersectionObserver + CSS);
//   3. motion on and GSAP loaded: ScrollTrigger scrubs a camera zoom into the painting's central sunflower while the
//      stage is pinned, and tilts each panel into place in 3D. GSAP is fetched only after the first paint.
// Figures in the panels come from the site's fictional sample companies, and say so.
import { $, $$, h, s, reducedMotion } from '../core/dom.js?v=30';
import { mulberry32 } from '../core/rng.js?v=30';

const body = document.body, root = document.documentElement;
const forceMotion = new URLSearchParams(location.search).get('motion') === 'force';   // ?motion=force: run the choreography even under reduced motion (testing)
const motionOn = () => forceMotion || (!reducedMotion() && !root.classList.contains('motion-paused'));

// ================================================================ panels
const GOLD = '#E8B923', OCHRE = '#C99216', CREAM = '#FFF8E8', BLUE = '#6A93D6', PLUM = '#C26E9A', OLIVE = '#9DB06B', TERRA = '#E08A5C';
const svg = (w, hgt, ...kids) => s('svg', { viewBox: `0 0 ${w} ${hgt}`, class: 'panel-svg', 'aria-hidden': 'true' }, ...kids);
const count = (value, { digits = 1, prefix = '', suffix = '' } = {}) => h('strong', { 'data-count': value, 'data-digits': digits, 'data-prefix': prefix, 'data-suffix': suffix }, `${prefix}${value.toFixed(digits)}${suffix}`);
const head = (...kids) => h('div', { class: 'panel-head' }, ...kids);
const foot = (text) => h('p', { class: 'panel-foot' }, text);

const PANELS = {
  intel(box) {
    const rows = [['Revenue', 561.4, 618.9, 672.3], ['EBITDA', 90.4, 108.9, 123.7], ['Net income', 44.6, 55.6, 67.3], ['Free cash flow', 46.9, 58.0, 62.9]];
    box.append(head(h('span', { class: 'panel-chip' }, h('i', { class: 'panel-dot' }), 'helio-foods-group.xlsx'), h('span', {}, '26,581 rows · 6 sheets · read in 0.4 s')), h('div', { class: 'panel-progress' }, h('span')),
      h('div', { class: 'panel-kpis' }, h('div', { class: 'panel-kpi' }, h('span', {}, 'Revenue'), count(672.3, { prefix: '$', suffix: 'm' })), h('div', { class: 'panel-kpi' }, h('span', {}, 'EBITDA margin'), count(18.4, { suffix: '%' })), h('div', { class: 'panel-kpi' }, h('span', {}, 'Return on equity'), count(25.1, { suffix: '%' })), h('div', { class: 'panel-kpi' }, h('span', {}, 'Net debt ÷ EBITDA'), count(0.6, { digits: 2, suffix: '×' }))),
      h('table', { class: 'panel-table' }, h('thead', {}, h('tr', {}, h('th', {}, 'USD millions'), h('th', {}, 'FY2023'), h('th', {}, 'FY2024'), h('th', {}, 'FY2025'))), h('tbody', {}, rows.map((r) => h('tr', {}, h('td', {}, r[0]), r.slice(1).map((v) => h('td', {}, v.toFixed(1))))))),
      foot('Helio Foods Group is fictional. These are the dashboard’s own figures for the sample workbook.'));
  },
  finance(box) {
    const rand = mulberry32(1889), W = 360, H = 220, n = 90;
    let p = 100; const pts = [p]; for (let i = 1; i < n; i++) { p *= 1 + 0.0016 + (rand() - 0.5) * 0.034; pts.push(p); }
    const ma = pts.map((_, i) => (i < 14 ? NaN : pts.slice(i - 14, i + 1).reduce((a, b) => a + b, 0) / 15));
    const lo = Math.min(...pts) * 0.98, hi = Math.max(...pts) * 1.02, x = (i) => 8 + (i / (n - 1)) * (W - 16), y = (v) => H - 22 - ((v - lo) / (hi - lo)) * (H - 44);
    const path = (arr) => arr.map((v, i) => (Number.isFinite(v) ? `${Number.isFinite(arr[i - 1]) ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}` : '')).join('');
    const area = `${path(pts)}L${x(n - 1)},${H - 22}L${x(0)},${H - 22}Z`;
    const chart = svg(W, H, s('defs', {}, s('linearGradient', { id: 'pf-g', x1: 0, y1: 0, x2: 0, y2: 1 }, s('stop', { offset: 0, 'stop-color': GOLD, 'stop-opacity': 0.32 }), s('stop', { offset: 1, 'stop-color': GOLD, 'stop-opacity': 0 }))),
      [0.25, 0.5, 0.75].map((f) => s('line', { x1: 8, x2: W - 8, y1: 22 + f * (H - 44), y2: 22 + f * (H - 44), class: 'grid' })),
      s('path', { d: area, fill: 'url(#pf-g)', class: 'pop', style: 'transform-origin: 50% 100%' }), s('path', { d: path(pts), class: 'line draw', stroke: GOLD, pathLength: 1 }), s('path', { d: path(ma), class: 'line draw', stroke: BLUE, 'stroke-dasharray': '1', pathLength: 1, style: 'stroke-width:1.6' }),
      s('circle', { cx: x(n - 1), cy: y(pts[n - 1]), r: 4.5, fill: GOLD, class: 'pop' }), s('text', { x: 8, y: H - 6 }, 'simulated share price'), s('text', { x: W - 8, y: H - 6, 'text-anchor': 'end' }, '15-day average'));
    box.append(head(h('span', { class: 'panel-chip' }, 'Stock analysis'), h('span', {}, 'return · risk · beta')), h('div', { class: 'panel-split' }, chart,
      h('dl', { class: 'panel-list' }, h('div', {}, h('dt', {}, 'NPV at 10%'), h('dd', {}, '$1.24m')), h('div', {}, h('dt', {}, 'IRR'), h('dd', {}, '14.2%')), h('div', {}, h('dt', {}, 'Beta'), h('dd', {}, '1.12')), h('div', {}, h('dt', {}, 'Sharpe ratio'), h('dd', {}, '0.84')), h('div', {}, h('dt', {}, '95% one-day VaR'), h('dd', {}, '2.1%')))),
      foot('An illustration with simulated prices. The tools compute these from your own data.'));
  },
  valuation(box) {
    const bars = [['DCF, WACC ±1 pt', 31.4, 39.9, 54.3, GOLD], ['Bear to bull', 8.4, 41.6, 78.3, BLUE], ['EV/EBITDA peers', 34.7, 42.7, 50.1, OCHRE], ['P/E peers', 34.3, 51.8, 52.4, OCHRE], ['Dividend models', 13.0, 15.1, 15.1, PLUM], ['Asset floor', -5.7, 9.5, 9.5, '#8E97A8']];
    const W = 520, rowH = 34, L = 132, x = (v) => L + ((v + 10) / 95) * (W - L - 12), price = 34.5;
    const chart = svg(W, bars.length * rowH + 44, [0, 20, 40, 60, 80].map((t) => [s('line', { x1: x(t), x2: x(t), y1: 4, y2: bars.length * rowH + 8, class: 'grid' }), s('text', { x: x(t), y: bars.length * rowH + 24, 'text-anchor': 'middle' }, `$${t}`)]),
      bars.map(([name, lo, mid, hi, col], i) => [s('text', { x: L - 10, y: i * rowH + 24, 'text-anchor': 'end' }, name), s('rect', { x: x(lo), y: i * rowH + 10, width: Math.max(3, x(hi) - x(lo)), height: 18, rx: 4, fill: col, opacity: 0.88, class: 'bar-x', style: `transition-delay:${i * 90}ms` }), s('rect', { x: x(mid) - 1.5, y: i * rowH + 6, width: 3, height: 26, fill: CREAM, class: 'pop', style: `transition-delay:${500 + i * 90}ms` })]),
      s('line', { x1: x(price), x2: x(price), y1: 0, y2: bars.length * rowH + 8, stroke: TERRA, 'stroke-width': 2, 'stroke-dasharray': '5 4', class: 'pop' }), s('text', { x: x(price) + 6, y: bars.length * rowH + 40, class: 'lbl-strong' }, 'price $34.50'));
    box.append(head(h('span', { class: 'panel-chip' }, 'Sunmarsh Foods'), h('span', {}, 'value per share by method')), h('div', { class: 'panel-kpis', style: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', marginBottom: '12px' } }, h('div', { class: 'panel-kpi' }, h('span', {}, 'DCF value'), count(39.91, { digits: 2, prefix: '$' })), h('div', { class: 'panel-kpi' }, h('span', {}, 'WACC'), count(7.57, { digits: 2, suffix: '%' })), h('div', { class: 'panel-kpi' }, h('span', {}, 'Terminal share'), count(80, { digits: 0, suffix: '%' }))), chart,
      foot('Sunmarsh Foods is the studio’s fictional example; these are its default results.'));
  },
  analytics(box) {
    const rand = mulberry32(31), W = 520, H = 300, pts = [];
    const cl = [[130, 205, BLUE], [270, 150, GOLD], [400, 86, PLUM]];
    cl.forEach(([cx, cy, col]) => { for (let i = 0; i < 26; i++) { const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * 52; pts.push([cx + Math.cos(a) * r * 1.15, cy + Math.sin(a) * r * 0.8, col]); } });
    const n = pts.length, mx = pts.reduce((a, q) => a + q[0], 0) / n, my = pts.reduce((a, q) => a + q[1], 0) / n;
    const b = pts.reduce((a, q) => a + (q[0] - mx) * (q[1] - my), 0) / pts.reduce((a, q) => a + (q[0] - mx) ** 2, 0), a0 = my - b * mx;
    const chart = svg(W, H, [60, 120, 180, 240].map((y) => s('line', { x1: 30, x2: W - 10, y1: y, y2: y, class: 'grid' })), s('line', { x1: 30, x2: 30, y1: 10, y2: H - 26, class: 'grid' }),
      pts.map(([px, py, col], i) => s('circle', { cx: px.toFixed(1), cy: py.toFixed(1), r: 5, fill: col, opacity: 0.85, class: 'pop', style: `transition-delay:${(i % 26) * 22}ms` })),
      s('path', { d: `M40,${(a0 + b * 40).toFixed(1)}L${W - 20},${(a0 + b * (W - 20)).toFixed(1)}`, class: 'line draw', stroke: CREAM, pathLength: 1 }), s('text', { x: W - 12, y: H - 8, 'text-anchor': 'end' }, 'k-means groups and a least-squares line'));
    box.append(head(h('span', { class: 'panel-chip' }, 'Explore · model · cluster'), h('span', {}, `${n} points · 3 clusters · slope ${b.toFixed(2)}`)), chart, foot('Synthetic points. Bring your own table to the analytics room.'));
  },
  marketing(box) {
    const W = 340, H = 240, bEl = -2.4, cost = 3.5, pStar = (cost * bEl) / (1 + bEl), q = (p) => 900 * (p / 5) ** bEl;
    const x = (p) => 34 + ((p - 3) / 9) * (W - 46), y = (v) => H - 28 - (v / q(3)) * (H - 50);
    let d = ''; for (let p = 3; p <= 12.01; p += 0.25) d += `${d ? 'L' : 'M'}${x(p).toFixed(1)},${y(q(p)).toFixed(1)}`;
    const chart = svg(W, H, [0.25, 0.5, 0.75].map((f) => s('line', { x1: 34, x2: W - 12, y1: 22 + f * (H - 50), y2: 22 + f * (H - 50), class: 'grid' })), s('path', { d, class: 'line draw', stroke: OLIVE, pathLength: 1 }),
      s('line', { x1: x(pStar), x2: x(pStar), y1: y(q(pStar)), y2: H - 28, stroke: GOLD, 'stroke-dasharray': '4 4', class: 'pop' }), s('circle', { cx: x(pStar), cy: y(q(pStar)), r: 6, fill: GOLD, class: 'pop' }), s('text', { x: x(pStar) + 10, y: y(q(pStar)) - 8, class: 'lbl-strong' }, `best price $${pStar.toFixed(2)}`), s('text', { x: 34, y: H - 8 }, 'price'), s('text', { x: W - 12, y: H - 8, 'text-anchor': 'end' }, 'units sold fall as price rises'));
    const seg = [['Value seekers', 38, OLIVE], ['Loyal regulars', 27, GOLD], ['Premium', 21, PLUM], ['Occasional', 14, BLUE]];
    const segs = svg(170, 150, seg.map(([name, share, col], i) => [s('text', { x: 0, y: i * 36 + 12 }, name), s('rect', { x: 0, y: i * 36 + 18, width: (share / 40) * 150, height: 10, rx: 4, fill: col, class: 'bar-x', style: `transition-delay:${i * 110}ms` }), s('text', { x: 166, y: i * 36 + 12, 'text-anchor': 'end', class: 'lbl-strong' }, `${share}%`)]));
    box.append(head(h('span', { class: 'panel-chip' }, 'Pricing and segments'), h('span', {}, `elasticity ${bEl} · unit cost $${cost.toFixed(2)}`)), h('div', { class: 'panel-split' }, chart, segs), foot('An illustration: constant-elasticity demand, best price = cost × e ÷ (1 + e).'));
  },
  async learn(box) {
    let levels = [['Introductory', 9, 10], ['Intermediate', 7, 14], ['Advanced', 0, 9]], lessons = null;
    try { const C = await import('../data/study/catalog.js?v=30'); const key = { intro: 0, intermediate: 1, advanced: 2 }; const t = [[0, 0], [0, 0], [0, 0]]; C.COURSES.forEach((c) => { const k = key[c.level]; if (k === undefined) return; t[k][1]++; if (c.status === 'complete') t[k][0]++; }); levels = levels.map((l, i) => [l[0], t[i][0], t[i][1]]); lessons = C.COURSES.filter((c) => c.status === 'complete').reduce((a, c) => a + (c.modules || []).reduce((x, m) => x + (m.lessons || []).length, 0), 0); } catch { /* the static counts stand */ }
    const ring = (done, total, col) => { const r = 34, c = 2 * Math.PI * r, f = total ? done / total : 0; return s('svg', { viewBox: '0 0 84 84', 'aria-hidden': 'true' }, s('circle', { cx: 42, cy: 42, r, fill: 'none', stroke: 'rgba(255,248,232,.12)', 'stroke-width': 8 }), s('circle', { cx: 42, cy: 42, r, fill: 'none', stroke: col, 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-dasharray': `${(c * f).toFixed(1)} ${c.toFixed(1)}`, transform: 'rotate(-90 42 42)' }), s('text', { x: 42, y: 47, 'text-anchor': 'middle', style: `fill:${CREAM};font:700 17px var(--f-text)` }, `${done}/${total}`)); };
    box.append(head(h('span', { class: 'panel-chip' }, 'Course platform'), h('span', {}, `${levels.reduce((a, l) => a + l[1], 0)} courses complete${lessons ? ` · ${lessons} lessons` : ''} · progress stays in your browser`)),
      h('div', { class: 'panel-levels' }, levels.map(([name, done, total], i) => h('div', { class: 'panel-level' }, ring(done, total, [GOLD, BLUE, PLUM][i]), h('strong', {}, name), h('span', {}, done === total ? 'all built' : `${done} built · ${total - done} planned`)))),
      h('dl', { class: 'panel-list', style: { marginTop: '12px', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' } }, h('div', {}, h('dt', {}, 'Each lesson'), h('dd', {}, '3 worked examples')), h('div', {}, h('dt', {}, 'Practice'), h('dd', {}, 'hints + checks')), h('div', {}, h('dt', {}, 'Mastery'), h('dd', {}, 'tracked')), h('div', {}, h('dt', {}, 'Review'), h('dd', {}, 'spaced'))),
      foot('Counts are read from the course catalogue: built courses are complete and tested; planned ones say so.'));
  },
};

// ================================================================ reveal, counters, the section bar
function runCounters(scene) {
  $$('[data-count]', scene).forEach((el) => {
    if (el.dataset.done) return; el.dataset.done = '1';
    const to = +el.dataset.count, dg = +el.dataset.digits, pre = el.dataset.prefix, suf = el.dataset.suffix, t0 = performance.now(), dur = 1300;
    const step = (now) => { const k = Math.min(1, Math.max(0, (now - t0) / dur)), e = 1 - (1 - k) ** 3; el.textContent = `${pre}${(to * e).toFixed(dg)}${suf}`; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}
function observe() {
  const scenes = $$('.scene');
  if (!('IntersectionObserver' in window)) { scenes.forEach((sc) => sc.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); if (motionOn()) runCounters(e.target); } }), { threshold: 0.22 });
  scenes.forEach((sc) => io.observe(sc));
  const links = $$('.scene-bar li a');
  const spy = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === `#${e.target.id}`))); }), { rootMargin: '-45% 0px -50% 0px' });
  scenes.forEach((sc) => spy.observe(sc));
}

// ================================================================ the file drop: hand the workbook to Company Intelligence
function initDrop() {
  const drop = $('#home-drop'), input = $('#home-file');
  if (!drop || !input) return;
  const go = async (file) => {
    const note = $('.scene-drop-note', drop);
    try { const DB = await import('../intel/store.js?v=30'); note.textContent = `Handing over ${file.name}…`; await DB.putPendingFile(file); location.href = 'finance/company-intelligence/?file=pending'; }
    catch { note.textContent = 'This browser would not hold the file for the handover. Open Company Intelligence and choose it there.'; }
  };
  input.addEventListener('change', () => { if (input.files[0]) go(input.files[0]); });
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('is-over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('is-over'));
  drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('is-over'); const f = e.dataTransfer.files[0]; if (f) go(f); });
}

// ================================================================ GSAP: the camera and the 3D panels
const loadScript = (src) => new Promise((resolve, reject) => { const el = document.createElement('script'); el.src = src; el.async = true; el.onload = resolve; el.onerror = () => reject(new Error(`could not load ${src}`)); document.head.append(el); });
let triggers = [];
async function cinematics(setZoom) {
  const base = new URL('../../vendor/', import.meta.url);
  await loadScript(new URL('gsap.min.js', base).href); await loadScript(new URL('ScrollTrigger.min.js', base).href);
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  // the camera: while the stage is pinned, scroll moves the view into the central sunflower and the labels fade
  mm.add('(min-width: 961px) and (min-aspect-ratio: 23/20) and (min-height: 600px)', () => {
    if (!setZoom || body.classList.contains('label-below')) return undefined;
    body.classList.add('has-zoom');
    const st = ScrollTrigger.create({ trigger: '.stage-track', start: 'top top', end: 'bottom bottom', scrub: 0.6, onUpdate: (self) => {
      const p = self.progress, e = p * p * (3 - 2 * p);
      setZoom(e);
      const fade = Math.max(0, 1 - p * 2.4);
      gsap.set(['.plaque', '.home-header', '.scroll-cue'], { opacity: fade, y: -40 * (1 - fade), pointerEvents: fade < 0.3 ? 'none' : '' });
      gsap.set('.doors', { opacity: Math.max(0, 1 - p * 3), pointerEvents: p > 0.2 ? 'none' : '' });
      gsap.set('.stage', { filter: p > 0.75 ? `brightness(${1 - (p - 0.75) * 1.6})` : 'none' });
    } });
    triggers.push(st);
    return () => { st.kill(); body.classList.remove('has-zoom'); setZoom(0); gsap.set(['.plaque', '.home-header', '.scroll-cue', '.doors', '.stage'], { clearProps: 'all' }); };
  });
  // panels tilt up into place; the flowers drift at their own pace (layered depth)
  mm.add('(min-width: 961px)', () => {
    const made = [];
    $$('.scene').forEach((sc) => {
      const panel = $('.scene-panel', sc), flower = $('.scene-flower', sc);
      if (panel) made.push(gsap.fromTo(panel, { rotateX: 20, rotateY: sc.classList.contains('scene--flip') ? 9 : -9, y: 90, z: -120, scale: 0.94 }, { rotateX: 0, rotateY: 0, y: 0, z: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: sc, start: 'top 92%', end: 'top 28%', scrub: 0.7 } }));
      if (panel) made.push(gsap.to(panel, { y: -46, ease: 'none', scrollTrigger: { trigger: sc, start: 'bottom 70%', end: 'bottom top', scrub: 0.7 } }));
      if (flower) made.push(gsap.fromTo(flower, { y: 46 }, { y: -30, ease: 'none', scrollTrigger: { trigger: sc, start: 'top bottom', end: 'bottom top', scrub: 1 } }));
    });
    return () => made.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); gsap.set(t.targets(), { clearProps: 'transform' }); });
  });
  window.addEventListener('si:motion', (e) => { if (e.detail.paused) { mm.revert(); body.classList.remove('scenes-anim'); $$('.scene').forEach((sc) => sc.classList.add('is-in')); } });
  ScrollTrigger.refresh();
}

export async function initScenes({ setZoom } = {}) {
  $$('.scene-panel').forEach((box) => { const draw = PANELS[box.dataset.panel]; if (draw) { try { const r = draw(box); if (r?.catch) r.catch(() => {}); } catch (e) { console.error(e); } } });
  initDrop();
  $$('[data-top]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: motionOn() ? 'smooth' : 'auto' }); history.replaceState(null, '', location.pathname + location.search); }));
  if (!motionOn()) { $$('.scene').forEach((sc) => sc.classList.add('is-in')); observe(); return; }
  body.classList.add('scenes-anim');
  observe();
  const idle = window.requestIdleCallback ? (fn) => requestIdleCallback(fn, { timeout: 1500 }) : (fn) => setTimeout(fn, 400);
  idle(() => cinematics(setZoom).catch(() => { /* the reveal tier already works without GSAP */ }));
}
