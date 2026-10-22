// analytics-unsupervised.js — unsupervised learning: k-means, Ward hierarchical clustering and principal components,
// all on one shared choice of columns.
import { initSite, syncRanges } from '../core/site.js?v=6';
import { $, $$, h, download, toCSV, onResize } from '../core/dom.js?v=6';
import * as F from '../core/format.js?v=6';
import * as S from '../core/stats.js?v=6';
import { isNumeric } from '../core/csv.js?v=6';
import { scatter, tableTwin, barChart } from '../core/charts.js?v=6';
import { fillSelect, chips, checkedIn, splitRows, whenNear, afterPaint } from '../core/ui.js?v=6';
import { dataSource } from '../core/datasource.js?v=6';
import { subscriberChurn, sunflowerTrials } from '../core/rng.js?v=6';
import { kmeans, silhouette, standardise } from '../core/classify.js?v=6';
import { ward, cutTree, leafOrder, betweenShare, adjustedRand, pca, sampleIndices } from '../core/ml.js?v=6';
import { dendrogram, screeChart, biplot } from '../core/ml-charts.js?v=6';

initSite();

const HC_CAP = 300;                      // Ward compares every pair of rows: above this, a seeded sample
const state = { table: null, name: '', xNames: null, d: null, segShow: 0, hcShow: 0 };
const numCols = () => state.table.columns.filter((c) => isNumeric(c));
const colBy = (name) => state.table.columns.find((c) => c.name === name);
const twoValued = (c) => new Set(c.values.filter(Number.isFinite)).size === 2;
const idCol = () => state.table.columns.find((c) => c.type === 'id');
const rowId = (r) => { const c = idCol(); return c ? c.raw[r] : r + 1; };

// ---------------------------------------------------------------- the shared columns
function renderColumns() {
  const names = numCols().map((c) => c.name);
  const cont = numCols().filter((c) => !twoValued(c)).map((c) => c.name);
  state.xNames = state.xNames ? state.xNames.filter((n) => names.includes(n)) : null;
  if (!state.xNames || state.xNames.length < 2) state.xNames = cont.length >= 2 ? cont.slice(0, 6) : names.slice(0, 6);
  chips($('#uns-x'), names, state.xNames, 'ux', () => { state.xNames = checkedIn($('#uns-x')); update(); });
  fillSelect($('#pca-flag'), ['(no colour)', ...numCols().filter(twoValued).map((c) => c.name)]);
  const flags = numCols().filter(twoValued).map((c) => c.name);
  $('#pca-flag').value = flags.includes('churned') ? 'churned' : '(no colour)';
  update();
}
/** Complete rows on the chosen columns: values by column (original units) and standardised rows. */
function prepare() {
  const xNames = state.xNames || [];
  if (xNames.length < 2) return { error: 'Choose at least two columns.' };
  const cols = xNames.map((n) => colBy(n).values);
  const idx = []; cols[0].forEach((_, i) => { if (cols.every((c) => Number.isFinite(c[i]))) idx.push(i); });
  if (idx.length < 12) return { error: `Needs at least 12 complete rows; these columns leave ${idx.length}.` };
  const data = cols.map((c) => idx.map((i) => c[i]));
  const flat = xNames.filter((_, j) => !(S.sd(data[j]) > 0));
  if (flat.length) return { error: `${flat.join(', ')} never varies in these rows, so it can’t be put on a common scale. Untick it.` };
  return { xNames, idx, data, rows: standardise(data).rows };
}
function update() {
  const d = prepare();
  state.d = d.error ? null : d;
  $('#uns-note').textContent = d.error ? '' : `${F.int(d.idx.length)} complete rows on ${d.xNames.length} columns.`;
  for (const p of ['seg', 'hc', 'pca']) {
    $(`#${p}-error`).replaceChildren(...(d.error ? [h('div', { class: 'verdict is-bad' }, h('p', {}, h('strong', {}, 'Nothing to show yet. '), d.error))] : []));
    $(`#${p}-body`).hidden = !!d.error;
  }
  if (d.error) return;
  state.segShow = 0; state.hcShow = 0;
  renderSegment();
  if (ready.hc) renderHierarchy();
  if (ready.pca) renderPCA();
}
// hierarchical clustering and PCA render when they come near the viewport
const ready = { hc: false, pca: false };
whenNear($('#hierarchy'), () => { ready.hc = true; if (state.d) renderHierarchy(); });
whenNear($('#pca'), () => { ready.pca = true; if (state.d) renderPCA(); });

/** "high X, low Y": the two columns where a group's mean is furthest from the overall mean, in sds. */
function standsOut(means, overall, sds, xNames) {
  const z = means.map((m, j) => ({ j, z: (m - overall[j]) / sds[j] })).sort((a, b) => Math.abs(b.z) - Math.abs(a.z)).filter((v) => Math.abs(v.z) >= 0.3).slice(0, 2);
  return z.length ? z.map((v) => `${v.z > 0 ? 'high' : 'low'} ${xNames[v.j]}`).join(', ') : 'close to average';
}
function profileTable(box, { data, labels, k, xNames, name = (c) => `Group ${c + 1}`, sizes }) {
  const n = labels.length;
  const means = Array.from({ length: k }, (_, c) => data.map((col) => S.mean(col.filter((_, i) => labels[i] === c))));
  const overall = data.map((col) => S.mean(col)), sds = data.map((col) => S.sd(col) || 1);
  box.replaceChildren(h('table', { class: 'data-table' },
    h('thead', {}, h('tr', {}, ['Group', 'Rows', ...xNames, 'Stands out for'].map((c, i) => h('th', { scope: 'col', class: i && i <= xNames.length + 1 ? 'is-num' : '' }, c)))),
    h('tbody', {},
      ...means.map((m, c) => h('tr', {}, h('th', { scope: 'row' }, name(c)), h('td', { class: 'is-num' }, `${F.int(sizes[c])} (${F.pct(sizes[c] / n, 0)})`), ...m.map((v) => h('td', { class: 'is-num' }, F.auto(v))), h('td', {}, standsOut(m, overall, sds, xNames)))),
      h('tr', { class: 'is-total' }, h('th', { scope: 'row' }, 'All rows'), h('td', { class: 'is-num' }, F.int(n)), ...overall.map((v) => h('td', { class: 'is-num' }, F.auto(v))), h('td', {}, '')))));
}
function highlighter(box, k, current, name, onPick) {
  box.replaceChildren(...Array.from({ length: k }, (_, c) => [
    Object.assign(h('input', { type: 'radio', id: `${name}-${c}`, name, value: String(c) }), { checked: c === current }),
    h('label', { for: `${name}-${c}` }, `${c + 1}`),
  ]).flat());
  $$('input', box).forEach((el) => el.addEventListener('change', () => onPick(+el.value)));
}

// ---------------------------------------------------------------- k-means
let lastSeg = null;
function renderSegment() {
  const d = state.d; lastSeg = null; if (!d) return;
  const k = +$('#seg-k').value;
  $('#seg-k-out').textContent = String(k);
  const { rows, data, xNames } = d;
  // silhouette is O(n²): above 1,500 rows it is scored on a seeded sample
  const sampleIdx = rows.length > 1500 ? splitRows(rows.length, 3).train.slice(0, 1500) : null;
  const silOf = (labels) => (sampleIdx ? silhouette(sampleIdx.map((i) => rows[i]), sampleIdx.map((i) => labels[i])) : silhouette(rows, labels));
  const runs = [2, 3, 4, 5, 6].filter((kk) => kk < rows.length).map((kk) => { const km = kmeans(rows, kk); return { k: kk, km, sil: silOf(km.labels) }; });
  const run = runs.find((r) => r.k === k) || runs[runs.length - 1];
  const best = runs.reduce((a, b) => (b.sil > a.sil ? b : a));
  lastSeg = { km: run.km, best };
  $('#seg-sil').textContent = F.num(run.sil, 2);
  $('#seg-line').textContent = `${run.sil >= 0.5 ? 'Clear groups' : run.sil >= 0.25 ? 'Some structure, with overlap' : 'Weak structure: these groups are a convenient cut more than a natural one'}. Best-separated: ${best.k} groups (${F.num(best.sil, 2)})${sampleIdx ? '; scored on a sample of 1,500 rows' : ''}.`;
  barChart($('#seg-k-chart'), {
    categories: runs.map((r) => `${r.k} groups`), height: 200, legend: false, valueLabels: true, label: 'Silhouette score for each number of groups',
    series: [{ name: 'Silhouette', values: runs.map((r) => r.sil), cls: 'm-s2' }], format: (v) => F.num(v, 2),
  });
  profileTable($('#seg-profile'), { data, labels: run.km.labels, k: run.k, xNames, sizes: run.km.sizes });
  if (!(state.segShow < run.k)) state.segShow = 0;
  highlighter($('#seg-show'), run.k, state.segShow, 'seg-show', (c) => { state.segShow = c; drawSegPlot(); });
  drawSegPlot();
}
function drawSegPlot() {
  if (!lastSeg || !state.d) return;
  const { km } = lastSeg, { data, xNames } = state.d, c = state.segShow;
  $('#seg-plot-title').textContent = `${xNames[1]} against ${xNames[0]}: group ${c + 1} highlighted`;
  const pts = data[0].map((x, i) => ({ x, y: data[1][i], cls: km.labels[i] === c ? 'm-s2' : 'm-muted', title: `Group ${km.labels[i] + 1}` }));
  pts.sort((a, b) => (a.cls === 'm-s2') - (b.cls === 'm-s2'));          // highlighted group drawn on top
  scatter($('#seg-plot'), { points: pts, height: 300, xLabel: xNames[0], yLabel: xNames[1], label: `Rows by ${xNames[0]} and ${xNames[1]}, group ${c + 1} highlighted`,
    legend: [{ name: `Group ${c + 1}`, cls: 'm-s2' }, { name: 'Other groups', cls: 'm-muted' }] });
}
$('#seg-k').addEventListener('input', renderSegment);
$('#seg-best').addEventListener('click', () => { if (!lastSeg) return; $('#seg-k').value = String(lastSeg.best.k); syncRanges($('#segment')); renderSegment(); });
$('#seg-csv').addEventListener('click', () => {
  if (!lastSeg || !state.d) return;
  const { idx, data, xNames } = state.d, { km } = lastSeg;
  download('kmeans-groups.csv', toCSV([idCol() ? idCol().name : 'row', ...xNames, 'group'], idx.map((r, i) => [rowId(r), ...data.map((col) => col[i]), km.labels[i] + 1])));
});

// ---------------------------------------------------------------- hierarchical clustering (Ward)
let hc = null;                       // { key, sample, link, order, rows, data, sils }
function hierarchyBase() {
  const d = state.d, key = `${state.name}|${d.xNames.join(',')}|${d.idx.length}`;
  if (hc && hc.key === key) return hc;
  const sample = sampleIndices(d.rows.length, HC_CAP, 9);
  const rows = sample.map((i) => d.rows[i]), data = d.data.map((col) => sample.map((i) => col[i]));
  const link = ward(rows);
  const ks = [2, 3, 4, 5, 6, 7, 8].filter((k) => k < rows.length);
  const sils = ks.map((k) => ({ k, sil: silhouette(rows, cutTree(link, k).labels) }));
  hc = { key, sample, rows, data, link, order: leafOrder(link), sils };
  return hc;
}
let lastHc = null;
function renderHierarchy() {
  const d = state.d; lastHc = null; if (!d) return;
  const base = hierarchyBase(), k = Math.min(+$('#hc-k').value, base.rows.length - 1);
  $('#hc-k-out').textContent = String(k);
  const cut = cutTree(base.link, k);
  const sizes = Array.from({ length: cut.k }, (_, c) => cut.labels.filter((l) => l === c).length);
  const best = base.sils.reduce((a, b) => (b.sil > a.sil ? b : a));
  const sil = base.sils.find((s) => s.k === k)?.sil;
  const km = kmeans(base.rows, k), ari = adjustedRand(cut.labels, km.labels);
  lastHc = { cut, base, best };
  $('#hc-between').textContent = F.pct(betweenShare(base.rows, cut.labels), 0);
  $('#hc-line').textContent = `Silhouette at this cut ${F.num(sil, 2)}; best-separated at ${best.k} groups (${F.num(best.sil, 2)}). Agreement with k-means on the same rows and number of groups: adjusted Rand index ${F.num(ari, 2)} (1 is the same grouping, about 0 is no better than chance).`;
  $('#hc-fig-title').textContent = `The dendrogram of ${F.int(base.rows.length)} rows, cut into ${cut.k} groups`;
  if (!(state.hcShow < cut.k)) state.hcShow = 0;
  highlighter($('#hc-show'), cut.k, state.hcShow, 'hc-show', (c) => { state.hcShow = c; drawDendrogram(); });
  drawDendrogram();
  profileTable($('#hc-profile'), { data: base.data, labels: cut.labels, k: cut.k, xNames: d.xNames, sizes });
  const cav = [
    'Ward’s method favours compact groups of similar size, like k-means, but a merge is never undone: an early, slightly wrong join stays in the tree.',
    'Groups are numbered left to right as they appear in the dendrogram.',
  ];
  if (base.sample.length < d.rows.length) cav.unshift(`It compares every pair of rows, so your ${F.int(d.rows.length)} rows are clustered on a seeded random sample of ${F.int(base.sample.length)}. The averages above are for that sample.`);
  else cav.unshift(`It compares every pair of rows, so tables over ${F.int(HC_CAP)} rows are clustered on a seeded random sample of ${F.int(HC_CAP)}.`);
  $('#hc-caveats').replaceChildren(...cav.map((t) => h('li', {}, t)));
}
function drawDendrogram() {
  if (!lastHc) return;
  const { cut, base } = lastHc;
  dendrogram($('#hc-chart'), { link: base.link, order: base.order, cut, highlight: state.hcShow, label: `Dendrogram of ${base.rows.length} rows cut into ${cut.k} groups, group ${state.hcShow + 1} highlighted` });
  const ms = base.link.merges, n = base.rows.length;
  tableTwin($('#hc-chart'), {
    caption: 'The last merges in the dendrogram',
    columns: [{ label: 'Groups before the merge' }, { label: 'Merge height', num: true }, { label: 'Rows in the merged group', num: true }],
    rows: ms.slice(Math.max(0, n - 10)).reverse().map((m, q) => [`${q + 2} → ${q + 1}`, F.num(m.height, 2), F.int(m.size)]),
  });
}
$('#hc-k').addEventListener('input', renderHierarchy);
$('#hc-best').addEventListener('click', () => { if (!lastHc) return; $('#hc-k').value = String(lastHc.best.k); syncRanges($('#hierarchy')); renderHierarchy(); });
$('#hc-csv').addEventListener('click', () => {
  if (!lastHc || !state.d) return;
  const { cut, base } = lastHc, d = state.d;
  download('ward-groups.csv', toCSV([idCol() ? idCol().name : 'row', ...d.xNames, 'group'], base.sample.map((s, q) => [rowId(d.idx[s]), ...base.data.map((col) => col[q]), cut.labels[q] + 1])));
});

// ---------------------------------------------------------------- principal components
let lastPca = null;
function renderPCA() {
  const d = state.d; lastPca = null; if (!d) return;
  const res = pca(d.data);
  if (res.error) { $('#pca-error').replaceChildren(h('div', { class: 'verdict is-bad' }, h('p', {}, h('strong', {}, 'No components. '), res.error))); $('#pca-body').hidden = true; return; }
  lastPca = res;
  const p = res.p, pcs = Array.from({ length: p }, (_, c) => `PC${c + 1}`);
  const a0 = $('#pca-a').value, b0 = $('#pca-b').value;
  fillSelect($('#pca-a'), pcs, pcs.includes(a0) ? a0 : 'PC1');
  fillSelect($('#pca-b'), pcs, pcs.includes(b0) && b0 !== $('#pca-a').value ? b0 : 'PC2');
  if (!pcs.includes(a0)) $('#pca-a').value = 'PC1';
  if (!pcs.includes(b0) || $('#pca-b').value === $('#pca-a').value) $('#pca-b').value = $('#pca-a').value === 'PC2' ? 'PC1' : 'PC2';
  const need80 = res.cumulative.findIndex((c) => c >= 0.8) + 1, kaiser = res.values.filter((v) => v > 1).length;
  $('#pca-two').textContent = F.pct(res.cumulative[1], 0);
  $('#pca-line').textContent = `${need80 === 1 ? 'One component carries' : `${need80} components carry`} at least 80% of it; ${kaiser} ${kaiser === 1 ? 'has' : 'have'} an eigenvalue above 1, more than any single column on its own (the Kaiser rule).`;
  screeChart($('#pca-scree'), { ratio: res.ratio, cumulative: res.cumulative, values: res.values, label: `Share of variation carried by each of ${p} components` });
  tableTwin($('#pca-scree'), {
    caption: 'Variation carried by each component',
    columns: [{ label: 'Component' }, { label: 'Eigenvalue', num: true }, { label: 'Share', num: true }, { label: 'Running total', num: true }],
    rows: res.values.map((v, c) => [pcs[c], F.num(v, 3), F.pct(res.ratio[c], 1), F.pct(res.cumulative[c], 1)]),
  });
  const show = Math.min(p, 6);
  $('#pca-loadings').replaceChildren(h('table', { class: 'data-table' },
    h('caption', { class: 'visually-hidden' }, 'Correlation of each column with each component'),
    h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Column'), ...pcs.slice(0, show).map((c, i) => h('th', { scope: 'col', class: 'is-num' }, `${c} (${F.pct(res.ratio[i], 0)})`)))),
    h('tbody', {}, d.xNames.map((n, j) => h('tr', {}, h('th', { scope: 'row' }, n), ...res.loadings[j].slice(0, show).map((v) => h('td', { class: `is-num load-cell${Math.abs(v) >= 0.5 ? ' is-big' : ''}` },
      h('span', { class: 'load-in' },
        h('span', { class: 'load-track', 'aria-hidden': 'true' }, h('i', { class: v >= 0 ? 'is-pos' : 'is-neg', style: { left: v >= 0 ? '50%' : `${50 - Math.min(1, -v) * 50}%`, width: `${Math.min(1, Math.abs(v)) * 50}%` } })),
        h('span', { class: 'load-num' }, F.num(v, 2))))))))));
  drawBiplot();
}
function drawBiplot() {
  const res = lastPca, d = state.d; if (!res || !d) return;
  const a = +$('#pca-a').value.slice(2) - 1, b = +$('#pca-b').value.slice(2) - 1;
  const fname = $('#pca-flag').value, fcol = fname && fname !== '(no colour)' ? colBy(fname) : null;
  let flag = null, flagName = '';
  if (fcol) {
    const vals = [...new Set(fcol.values.filter(Number.isFinite))].sort((x, y) => x - y);
    flag = d.idx.map((r) => (fcol.values[r] === vals[1] ? 1 : 0));
    flagName = `${fname} = ${F.auto(vals[1])}`;
  }
  // a dot per row up to 1,500; beyond that a seeded sample keeps the chart quick and readable
  const keep = sampleIndices(res.scores.length, 1500, 13);
  $('#pca-bi-title').textContent = `The rows on PC${a + 1} and PC${b + 1}, with each column as an arrow${keep.length < res.scores.length ? ` (a sample of ${F.int(keep.length)} rows)` : ''}`;
  biplot($('#pca-biplot'), {
    scores: keep.map((i) => res.scores[i]), loadings: res.loadings, a, b, names: d.xNames, ratio: res.ratio,
    flag: flag ? keep.map((i) => flag[i]) : null, flagName, idOf: (q) => `Row ${rowId(d.idx[keep[q]])}`,
    label: `Biplot of component ${a + 1} against component ${b + 1}${flag ? `, ${flagName} in colour` : ''}`,
  });
  tableTwin($('#pca-biplot'), {
    caption: 'Arrow coordinates: correlation of each column with the two components',
    columns: [{ label: 'Column' }, { label: `PC${a + 1}`, num: true }, { label: `PC${b + 1}`, num: true }],
    rows: d.xNames.map((n, j) => [n, F.num(res.loadings[j][a], 2), F.num(res.loadings[j][b], 2)]),
  });
}
$('#pca-a').addEventListener('change', () => { if ($('#pca-a').value === $('#pca-b').value) $('#pca-b').value = $('#pca-a').value === 'PC1' ? 'PC2' : 'PC1'; drawBiplot(); });
$('#pca-b').addEventListener('change', () => { if ($('#pca-a').value === $('#pca-b').value) $('#pca-a').value = $('#pca-b').value === 'PC1' ? 'PC2' : 'PC1'; drawBiplot(); });
$('#pca-flag').addEventListener('change', drawBiplot);
$('#pca-csv').addEventListener('click', () => {
  if (!lastPca || !state.d) return;
  const d = state.d, pcs = Array.from({ length: lastPca.p }, (_, c) => `PC${c + 1}`);
  download('component-scores.csv', toCSV([idCol() ? idCol().name : 'row', ...pcs], d.idx.map((r, i) => [rowId(r), ...lastPca.scores[i]])));
});

// ---------------------------------------------------------------- data
const unsSource = dataSource($('#ds'), {
  prefix: 'uns',
  examples: [{ key: 'churn', label: 'Seed club members', name: 'Seed club members', make: subscriberChurn }, { key: 'trials', label: 'Sunflower field trials', name: 'Sunflower field trials', make: sunflowerTrials }],
  onLoad: ({ table, name }) => { state.table = table; state.name = name; state.xNames = null; hc = null; renderColumns(); },
});
afterPaint().then(() => unsSource.select('churn'));
syncRanges();
onResize($('#ledger'), () => { drawSegPlot(); if (lastSeg) renderSegment(); drawDendrogram(); drawBiplot(); });
