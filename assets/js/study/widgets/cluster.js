// cluster.js — the `cluster` lesson widget (M05): segment survey respondents on their needs with k-means and see
// how the choice of k, of variables and of standardising changes the segments. Shows the elbow (within-cluster sum of
// squares) and the mean silhouette for every k, the segments' profiles as indexes against the average respondent, and
// the respondents on the first two principal components of the chosen needs with one segment picked out.
//   { type: 'cluster', title, rows: [[r1 … rp] per respondent], vars: ['Taste', …], k: 5, ks: [2 … 8],
//     choose: true (let the student pick which needs to use), raw: true (offer clustering without standardising),
//     spend: [per respondent] (adds spend per head and share of spend), seed: 1888,
//     noun: ['variable', 'variables'] (what the columns are called when they aren't all needs; default need/needs), note }
import { h, s, onResize } from '../../core/dom.js?v=14';
import { xl } from '../xl.js?v=14';
import { frame, lin, niceTicks, axisX, axisY, tableTwin } from '../../core/charts.js?v=14';
import { standardise, kmeans, silhouette } from '../../core/classify.js?v=14';
import { pca } from '../../core/ml.js?v=14';
import { segmented } from '../dist-draw.js?v=14';

const LETTERS = 'ABCDEFGH';
const fmt = (v, d = 0) => (Number.isFinite(v) ? v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—');
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

export function mount(el, cfg, ctx) {
  const base = `cl-${ctx.id}`;
  const P = cfg.vars.length, N = cfg.rows.length;
  const [one, many] = cfg.noun || ['need', 'needs'];
  const cap = (t) => t[0].toUpperCase() + t.slice(1);
  const ks = cfg.ks || [2, 3, 4, 5, 6, 7, 8];
  const st = { k: ks.includes(cfg.k) ? cfg.k : ks[Math.min(3, ks.length - 1)], use: cfg.vars.map(() => true), std: true, show: 0 };
  const cache = new Map();   // key → { fits, pcs }
  const cols = cfg.vars.map((_, j) => cfg.rows.map((r) => r[j]));

  function compute() {
    const used = cfg.vars.map((_, j) => j).filter((j) => st.use[j]);
    const key = `${used.join(',')}|${st.std ? 'z' : 'raw'}`;
    if (cache.has(key)) return cache.get(key);
    const ucols = used.map((j) => cols[j]);
    const X = st.std ? standardise(ucols).rows : cfg.rows.map((r) => used.map((j) => r[j]));
    const fits = new Map(ks.map((k) => { const km = kmeans(X, k, { seed: cfg.seed ?? 1888, restarts: 12 }); return [k, { km, inertia: km.inertia, sil: silhouette(X, km.labels) }]; }));
    const pc = used.length >= 2 ? pca(ucols) : null;
    const out = { used, fits, pc };
    cache.set(key, out);
    return out;
  }

  const kBox = segmented(`${base}-k`, 'Number of segments (k)', ks.map((k) => [String(k), String(k)]), String(st.k), (v) => { st.k = Number(v); st.show = 0; render(); });
  const varBox = cfg.choose ? h('fieldset', { class: 'field cl-vars' }, h('legend', { class: 'field-label' }, `${cap(many)} to segment on`),
    ...cfg.vars.map((v, j) => { const id = `${base}-v${j}`; const inp = h('input', { type: 'checkbox', id, checked: '' }); inp.addEventListener('change', () => {
      const next = st.use.slice(); next[j] = inp.checked;
      if (next.filter(Boolean).length < 2) { inp.checked = true; return; }
      st.use = next; st.show = 0; render(); }); return h('span', { class: 'cl-var' }, inp, h('label', { for: id }, v)); })) : null;
  const stdBox = cfg.raw ? (() => { const id = `${base}-std`; const inp = h('input', { type: 'checkbox', id, checked: '' }); inp.addEventListener('change', () => { st.std = inp.checked; st.show = 0; render(); });
    return h('div', { class: 'field sp-check' }, inp, h('label', { for: id }, `Standardise each ${one} first (z-scores)`)); })() : null;
  const charts = h('div', { class: 'cl-charts' });
  const elbowBox = h('div', { class: 'chart-box cv-chart' }), silBox = h('div', { class: 'chart-box cv-chart' });
  charts.append(elbowBox, silBox);
  const twin = h('div');
  const out = h('div', { class: 'cv-out', 'aria-live': 'polite' });
  // the caption sits above the scroller (a <caption> scrolls with a wide table and is cut off on a phone)
  const profCap = h('p', { class: 'fx-cap', id: `${base}-pcap` });
  const profile = h('div', { class: 'table-scroll cl-profile', tabindex: '0', role: 'region', 'aria-labelledby': `${base}-pcap` });
  const showBox = h('div');
  const scatterBox = h('div', { class: 'chart-box cv-chart' });
  el.classList.add('cv-widget', 'cl-widget');
  el.append(...[cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null,
    h('p', { class: 'fx-note' }, `${fmt(N)} respondents, ${cfg.noun ? 'measured on' : 'who rated'} ${P} ${many}. k-means sorts them into k segments; the charts show every k at once, the table the k you choose.`),
    h('div', { class: 'cv-fields' }, kBox), varBox, stdBox, charts, twin, out, profCap, profile, showBox, scatterBox,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null].filter(Boolean));

  function lineChart(box, ys, { label, yLabel, format }) {
    const fr = frame(box, { height: 200, label, margin: { t: 22, r: 14, b: 44, l: 54 } });
    const x = lin(ks[0], ks[ks.length - 1], 0, fr.iw);
    const lo = Math.min(...ys), hi = Math.max(...ys), pad = (hi - lo) * 0.12 || 1;
    const t = niceTicks(lo - pad, hi + pad, 4);
    const y = lin(t.min, t.max, fr.ih, 0);
    axisY(fr, y, t.ticks, { format, label: yLabel });
    axisX(fr, x, ks, { format: (v) => String(v), label: 'k' });
    fr.g.append(s('path', { d: ks.map((k, i) => `${i ? 'L' : 'M'}${x(k)},${y(ys[i])}`).join(''), class: 'cv-line' }));
    ks.forEach((k, i) => fr.g.append(s('circle', { cx: x(k), cy: y(ys[i]), r: k === st.k ? 6 : 4, class: k === st.k ? 'cl-pt cl-pt-on' : 'cl-pt' })));
  }

  function render() {
    const { used, fits, pc } = compute();
    const cur = fits.get(st.k), km = cur.km;
    lineChart(elbowBox, ks.map((k) => fits.get(k).inertia), { label: 'Within-cluster sum of squares for each number of segments', yLabel: 'Within-cluster sum of squares', format: (v) => fmt(v) });
    lineChart(silBox, ks.map((k) => fits.get(k).sil), { label: 'Mean silhouette for each number of segments', yLabel: 'Mean silhouette', format: (v) => v.toFixed(2) });
    twin.replaceChildren();
    tableTwin(twin, { caption: 'Elbow and silhouette by k', columns: [{ label: 'k' }, { label: 'Within-cluster sum of squares', num: true }, { label: 'Mean silhouette', num: true }],
      rows: ks.map((k) => [String(k), fmt(fits.get(k).inertia, 1), fits.get(k).sil.toFixed(3)]) });
    // profiles: index against the average on every need (all needs, used or not), sizes and spend
    const segs = Array.from({ length: st.k }, (_, g) => km.labels.map((l, i) => (l === g ? i : -1)).filter((i) => i >= 0));
    const overall = cols.map(mean);
    const idx = segs.map((m) => cols.map((c, j) => (mean(m.map((i) => c[i])) / overall[j]) * 100));
    const spendTot = cfg.spend ? cfg.spend.reduce((a, b) => a + b, 0) : NaN;
    const head = ['Segment', 'Respondents', ...(cfg.spend ? ['Spend a head', 'Share of spend'] : []), ...cfg.vars.map((v, j) => (st.use[j] ? v : `${v} (not used)`))];
    // diverging tint around 100: cool (the site's --pos) above average, warm (--neg) below; the number carries the value
    const cell = (v) => { const t = Math.max(-1, Math.min(1, (v - 100) / 50)); const rgb = t >= 0 ? '47,93,158' : '180,83,42'; return h('td', { class: 'num cl-ix', style: `background: rgba(${rgb},${(0.3 * Math.abs(t)).toFixed(3)})` }, fmt(v)); };
    profCap.textContent = `Segments for k = ${st.k}: each ${one}’s index against the average respondent (100 = average; above 100, the segment scores higher than average on it)`;
    profile.replaceChildren(h('table', { class: 'data-table cl-table', 'aria-labelledby': `${base}-pcap` },
      h('thead', {}, h('tr', {}, ...head.map((t) => h('th', { scope: 'col' }, t)))),
      h('tbody', {}, ...segs.map((m, g) => h('tr', {}, h('th', { scope: 'row' }, LETTERS[g]),
        h('td', { class: 'num' }, `${fmt(m.length)} (${fmt((m.length / N) * 100)}%)`),
        ...(cfg.spend ? [h('td', { class: 'num' }, `$${fmt(mean(m.map((i) => cfg.spend[i])), 2)}`), h('td', { class: 'num' }, `${fmt((m.reduce((a, i) => a + cfg.spend[i], 0) / spendTot) * 100, 1)}%`)] : []),
        ...idx[g].map(cell))))));
    const best = ks.slice().sort((a, b) => fits.get(b).sil - fits.get(a).sil)[0];
    out.replaceChildren(h('dl', { class: 'stats-row stats-dense' },
      ...[['k', String(st.k)], ['Within-cluster sum of squares', fmt(cur.inertia, 1)], ['Mean silhouette', cur.sil.toFixed(3)], ['Highest silhouette', `k = ${best}`]]
        .map(([a, b]) => h('div', { class: 'stat' }, h('dt', {}, a), h('dd', { class: 'num' }, b)))),
    h('p', { class: 'fx-note' }, `Segments are lettered by size, largest first. ${st.std ? `Each ${one} was standardised, so every ${one} counts equally in the distances.` : `Without standardising, ${many} with a wider spread of values count for more in the distances.`}`));
    // scatter on the first two components, one segment picked out
    showBox.replaceChildren(segmented(`${base}-s`, 'Pick out a segment', segs.map((_, g) => [String(g), LETTERS[g]]), String(st.show), (v) => { st.show = Number(v); drawScatter(km, pc); }));
    drawScatter(km, pc);
    ctx.report?.('cluster', { k: st.k, vars: used.length, std: st.std });
  }

  function drawScatter(km, pc) {
    if (!pc || pc.error) { scatterBox.replaceChildren(); return; }
    const pts = pc.scores.map((sc) => [sc[0], sc[1]]);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const fr = frame(scatterBox, { height: 300, label: `Respondents on the first two principal components of the ${many} used, segment ${LETTERS[st.show]} picked out`, margin: { t: 20, r: 14, b: 46, l: 46 } });
    const tx = niceTicks(Math.min(...xs), Math.max(...xs), 5), ty = niceTicks(Math.min(...ys), Math.max(...ys), 5);
    const x = lin(tx.min, tx.max, 0, fr.iw), y = lin(ty.min, ty.max, fr.ih, 0);
    axisY(fr, y, ty.ticks, { format: (v) => v.toFixed(0), label: `Component 2 (${fmt(pc.ratio[1] * 100)}% of the variance)` });
    axisX(fr, x, tx.ticks, { format: (v) => v.toFixed(0), label: `Component 1 (${fmt(pc.ratio[0] * 100)}% of the variance)` });
    const back = s('g', { class: 'cl-back' }), front = s('g', { class: 'cl-front' });
    pts.forEach((p, i) => (km.labels[i] === st.show ? front : back).append(s('circle', { cx: x(p[0]), cy: y(p[1]), r: km.labels[i] === st.show ? 3.6 : 2.6, class: km.labels[i] === st.show ? 'cl-dot cl-dot-on' : 'cl-dot' })));
    fr.g.append(back, front);
    const n = km.labels.filter((l) => l === st.show).length;
    fr.g.append(s('text', { x: fr.iw, y: 4, 'text-anchor': 'end', class: 'cl-key' }, `Segment ${LETTERS[st.show]}: ${fmt(n)} respondents`));
  }

  render();
  onResize(el, render);
}
