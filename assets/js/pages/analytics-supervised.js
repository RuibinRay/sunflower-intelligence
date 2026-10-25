// analytics-supervised.js — supervised learning: model comparison by cross-validation, a decision tree you can read,
// feature importance, and logistic regression in depth. One outcome and one set of predictors drive every section.
import { initSite, syncRanges } from '../core/site.js?v=15';
import { $, $$, h, download, toCSV, onResize, debounce } from '../core/dom.js?v=15';
import * as F from '../core/format.js?v=15';
import { isNumeric } from '../core/csv.js?v=15';
import { lineChart, barChart, tableTwin } from '../core/charts.js?v=15';
import { fillSelect, chips, checkedIn, splitRows, verdict } from '../core/ui.js?v=15';
import { dataSource } from '../core/datasource.js?v=15';
import { subscriberChurn, cafeWeeks } from '../core/rng.js?v=15';
import { logit, confusion, roc } from '../core/classify.js?v=15';
import { cart, leafRules, compareModels, sampleIndices } from '../core/ml.js?v=15';
import { foldPlot, rocOverlay, treeDiagram, tprAt } from '../core/ml-charts.js?v=15';

initSite();

const MODELS = [
  { key: 'logistic', name: 'Logistic regression', short: 'Logistic' },
  { key: 'tree', name: 'Decision tree', short: 'Tree' },
  { key: 'knn', name: 'Nearest neighbours', short: 'k-NN' },
  { key: 'forest', name: 'Random forest', short: 'Forest' },
];
const nameOf = (key) => MODELS.find((m) => m.key === key).name;
const CAP = 2000;                      // rows used for cross-validation; above this a seeded sample keeps the page quick

const state = { table: null, name: '', yName: '', xNames: null, d: null, version: 0, cmp: null, pick: null, pickTouched: false };
const numCols = () => state.table.columns.filter((c) => isNumeric(c));
const colBy = (name) => state.table.columns.find((c) => c.name === name);
const twoValued = (c) => new Set(c.values.filter(Number.isFinite)).size === 2;

// ---------------------------------------------------------------- the question: outcome and predictors
function renderQuestion() {
  const bin = numCols().filter(twoValued).map((c) => c.name);
  const sel = $('#sup-y'), prev = state.yName;
  fillSelect(sel, bin, prev);
  sel.value = bin.includes(prev) ? prev : bin.includes('churned') ? 'churned' : bin[bin.length - 1] || '';
  state.yName = sel.value;
  state.xNames = null;
  renderPredictors();
}
function renderPredictors() {
  const names = numCols().map((c) => c.name).filter((n) => n !== state.yName);
  if (!state.xNames) state.xNames = names.slice(0, 6);
  state.xNames = state.xNames.filter((n) => names.includes(n));
  chips($('#sup-x'), names, state.xNames, 'sx', () => { state.xNames = checkedIn($('#sup-x')); update(); });
  update();
}
$('#sup-y').addEventListener('change', () => { state.yName = $('#sup-y').value; state.xNames = null; renderPredictors(); });

/** Complete rows, the outcome coded 0/1, and predictors as rows. */
function prepare() {
  const yName = state.yName, xNames = state.xNames || [];
  if (!yName) return { error: 'This table has no column with exactly two values to predict. Choose “Seed club members” above to try it.' };
  if (!xNames.length) return { error: 'Choose at least one predictor.' };
  const ycol = colBy(yName).values, xcols = xNames.map((n) => colBy(n).values);
  const vals = [...new Set(ycol.filter(Number.isFinite))].sort((a, b) => a - b);
  const rowsIdx = []; ycol.forEach((v, i) => { if (Number.isFinite(v) && xcols.every((x) => Number.isFinite(x[i]))) rowsIdx.push(i); });
  const y = rowsIdx.map((i) => (ycol[i] === vals[1] ? 1 : 0));
  const X = rowsIdx.map((i) => xcols.map((x) => x[i]));
  const pos = y.reduce((a, v) => a + v, 0), minority = Math.min(pos, y.length - pos);
  if (y.length < 20) return { error: `Needs at least 20 complete rows; this choice leaves ${y.length}.` };
  if (minority < 2) return { error: 'Needs at least two rows of each outcome to score a model on rows it hasn’t seen.' };
  return { yName, xNames, vals, rowsIdx, y, X, base: pos / y.length, folds: Math.min(5, minority) };
}

function update() {
  state.version++;
  state.cmp = null;
  const d = prepare();
  state.d = d.error ? null : d;
  $('#sup-y-note').textContent = d.error || `Predicting ${d.yName} = ${F.auto(d.vals[1])} (the other value, ${F.auto(d.vals[0])}, counts as no). ${F.int(d.y.length)} complete rows, ${F.pct(d.base, 0)} yes.`;
  if (d.error) { ['cmp', 'tree', 'imp', 'cls'].forEach((p) => showError(p, d.error)); $('#cmp-status').textContent = ''; return; }
  ['cmp', 'tree', 'imp', 'cls'].forEach((p) => { $(`#${p}-error`).replaceChildren(); });
  renderPick();
  renderTree();
  requestCompare();
  renderClassify();
}
function showError(prefix, msg) {
  $(`#${prefix}-error`).replaceChildren(h('div', { class: 'verdict is-bad' }, h('p', {}, h('strong', {}, 'Nothing to show yet. '), msg)));
  $(`#${prefix}-body`).hidden = true;
}

// ---------------------------------------------------------------- the comparison, worked out in a worker
let worker = null, reqId = 0, lastReq = null, statusTimer = 0;
const localCache = {};
try {
  worker = new Worker(new URL('../core/ml-worker.js?v=15', import.meta.url), { type: 'module' });
  worker.onmessage = (e) => onResults(e.data);
  worker.onerror = (e) => { e.preventDefault?.(); worker = null; if (lastReq) runHere(lastReq); };
} catch { worker = null; }
function runHere(req) { setTimeout(() => { let res; try { res = compareModels(localCache, req); } catch (err) { res = { error: String(err.message || err) }; } onResults({ id: req.id, ...res }); }, 0); }

const modelSpecs = () => [
  { key: 'logistic', opts: {} },
  { key: 'tree', opts: { maxDepth: +$('#tree-depth').value, minLeaf: +$('#tree-leaf').value } },
  { key: 'knn', opts: { k: +$('#cmp-k').value } },
  { key: 'forest', opts: { trees: +$('#cmp-trees').value } },
];
function requestCompare() {
  const d = state.d; if (!d) return;
  const idx = sampleIndices(d.y.length, CAP, 5);
  const sampled = idx.length < d.y.length;
  const req = {
    id: ++reqId, version: state.version, k: d.folds,
    X: sampled ? idx.map((i) => d.X[i]) : d.X, y: sampled ? idx.map((i) => d.y[i]) : d.y,
    models: modelSpecs(), importance: state.pickTouched ? state.pick : 'best',
  };
  d.cvIdx = idx;
  lastReq = req;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { $('#cmp-status').textContent = `Working: cross-validating four models on ${F.int(req.y.length)} rows…`; $('#ledger').classList.add('is-busy'); }, 120);
  if (worker) worker.postMessage(req); else runHere(req);
}
const requestSoon = debounce(requestCompare, 160);

function onResults(msg) {
  if (msg.id !== reqId) return;                         // a newer request is on its way
  clearTimeout(statusTimer);
  $('#cmp-status').textContent = '';
  $('#ledger').classList.remove('is-busy');
  if (msg.error) { showError('cmp', `The comparison failed: ${msg.error}`); return; }
  state.cmp = msg;
  if (!state.pickTouched || !state.pick) state.pick = bestKey();
  renderPick();
  renderCompare();
  renderImportance();
  renderTreeStats();
  clsNote();
}
function bestKey() {
  let best = null;
  for (const m of MODELS) { const r = state.cmp.results[m.key]; if (r && !r.error && (!best || r.auc > state.cmp.results[best].auc)) best = m.key; }
  return best || 'logistic';
}

// ---------------------------------------------------------------- compare: render
function renderPick() {
  const box = $('#cmp-pick');
  if (!box.children.length) {
    box.replaceChildren(...MODELS.map((m) => [
      h('input', { type: 'radio', id: `cmp-pick-${m.key}`, name: 'cmp-pick', value: m.key }),
      h('label', { for: `cmp-pick-${m.key}` }, m.short),
    ]).flat());
    $$('input', box).forEach((el) => el.addEventListener('change', () => {
      state.pick = el.value; state.pickTouched = true;
      if (!state.cmp) return;
      renderCompare();
      const imp = state.cmp.importance;
      if (!imp || imp.key !== state.pick) { $('#imp-sub').textContent = `Working out importance for the ${nameOf(state.pick).toLowerCase()}…`; requestCompare(); }
    }));
  }
  $$('input', box).forEach((el) => { el.checked = el.value === state.pick; });
}

let lastCompare = null;
function renderCompare() {
  const res = state.cmp.results, d = state.d, pick = state.pick, k = state.cmp.folds;
  const ok = MODELS.filter((m) => res[m.key] && !res[m.key].error);
  $('#cmp-error').replaceChildren(...MODELS.filter((m) => res[m.key]?.error).map((m) => verdict('warn', `${m.name} couldn’t be fitted.`, res[m.key].error)));
  if (!ok.length) { $('#cmp-body').hidden = true; return; }
  $('#cmp-body').hidden = false;
  const best = bestKey(), rb = res[best];
  const ranked = ok.slice().sort((a, b) => res[b.key].auc - res[a.key].auc);
  $('#cmp-best').textContent = F.num(rb.auc, 2);
  $('#cmp-best-label').textContent = `mean AUC across the ${k} held-out folds: ${nameOf(best).toLowerCase()} scores highest`;
  let line = '';
  if (ranked.length > 1) {
    const second = ranked[1].key, wins = res[best].perFold.filter((f, i) => f.auc > res[second].perFold[i].auc).length;
    line = wins >= k - (k >= 5 ? 1 : 0)
      ? `It beats the next best, the ${nameOf(second).toLowerCase()} (${F.num(res[second].auc, 2)}), on ${wins} of ${k} folds: a consistent edge on this data.`
      : `But it beats the next best, the ${nameOf(second).toLowerCase()} (${F.num(res[second].auc, 2)}), on only ${wins} of ${k} folds: treat the two as level on this data.`;
  }
  $('#cmp-line').textContent = `${line} An AUC of 0.5 is a coin flip; 1 ranks every yes above every no.`;
  const cls = (key) => (key === pick ? 'm-s2' : 'm-muted');
  foldPlot($('#cmp-folds'), {
    label: `AUC on each of ${k} held-out folds, by model; ${nameOf(pick)} highlighted`,
    models: MODELS.map((m) => { const r = res[m.key]; return { name: m.name, short: m.short, cls: cls(m.key), folds: r && !r.error ? r.perFold.map((f) => f.auc) : [], mean: r && !r.error ? r.auc : NaN, sd: r && !r.error ? r.aucSd : NaN }; }),
  });
  tableTwin($('#cmp-folds'), {
    caption: 'AUC on each held-out fold',
    columns: [{ label: 'Model' }, ...Array.from({ length: k }, (_, i) => ({ label: `Fold ${i + 1}`, num: true })), { label: 'Mean', num: true }],
    rows: ok.map((m) => [m.name, ...res[m.key].perFold.map((f) => F.num(f.auc, 3)), F.num(res[m.key].auc, 3)]),
  });
  const always = Math.max(d.base, 1 - d.base);
  $('#cmp-table').replaceChildren(h('table', { class: 'data-table' },
    h('caption', { class: 'visually-hidden' }, 'Cross-validated scores by model'),
    h('thead', {}, h('tr', {}, ['Model', 'AUC', '± sd', 'Accuracy at 50%', '± sd'].map((c, i) => h('th', { scope: 'col', class: i ? 'is-num' : '' }, c)))),
    h('tbody', {},
      ...ranked.map((m) => { const r = res[m.key]; return h('tr', { class: m.key === pick ? 'is-strong is-picked' : '' }, h('th', { scope: 'row' }, m.name), h('td', { class: 'is-num' }, F.num(r.auc, 3)), h('td', { class: 'is-num' }, F.num(r.aucSd, 3)), h('td', { class: 'is-num' }, F.pct(r.acc, 1)), h('td', { class: 'is-num' }, F.pct(r.accSd, 1))); }),
      h('tr', { class: 'is-total' }, h('th', { scope: 'row' }, `Always answer “${always === d.base ? 'yes' : 'no'}”`), h('td', { class: 'is-num' }, '0.500'), h('td', {}, ''), h('td', { class: 'is-num' }, F.pct(always, 1)), h('td', {}, '')))));
  const curves = ok.map((m) => ({ name: `${m.name} (${F.num(res[m.key].pooledAuc, 2)})`, pts: res[m.key].roc, cls: cls(m.key) }));
  rocOverlay($('#cmp-roc'), { curves, label: `ROC curves from out-of-fold predictions; ${nameOf(pick)} highlighted` });
  tableTwin($('#cmp-roc'), {
    caption: 'Share of yes rows caught at a given share of no rows flagged',
    columns: [{ label: 'Model' }, { label: 'Caught at 10% flagged', num: true }, { label: 'at 20%', num: true }, { label: 'at 30%', num: true }, { label: 'Pooled AUC', num: true }],
    rows: ok.map((m) => [m.name, ...[0.1, 0.2, 0.3].map((f) => F.pct(tprAt(res[m.key].roc, f), 0)), F.num(res[m.key].pooledAuc, 3)]),
  });
  const cav = [
    `Accuracy counts a row as yes when its probability is at least 50%. Always answering “${always === d.base ? 'yes' : 'no'}” would already be right ${F.pct(always, 0)} of the time here, which is why AUC leads.`,
    'The settings above weren’t chosen on separate data. Trying many and keeping the best flatters it a little; nested cross-validation is the strict fix.',
    'The forest grows each tree fully on a bootstrap sample and looks at √p of the columns at each split (Breiman’s defaults). On small tables with mostly straight-line effects, logistic regression often wins; forests pay off with interactions and many rows.',
  ];
  if (d.cvIdx.length < d.y.length) cav.unshift(`Your table has ${F.int(d.y.length)} complete rows; the comparison uses a seeded random sample of ${F.int(d.cvIdx.length)} so the page stays quick.`);
  $('#cmp-caveats').replaceChildren(...cav.map((t) => h('li', {}, t)));
  lastCompare = { k };
}
$('#cmp-k').addEventListener('input', () => { $('#cmp-k-out').textContent = $('#cmp-k').value; requestSoon(); });
$('#cmp-trees').addEventListener('input', () => { $('#cmp-trees-out').textContent = $('#cmp-trees').value; requestSoon(); });
$('#cmp-csv').addEventListener('click', () => {
  if (!state.cmp || !state.d) return;
  const d = state.d, res = state.cmp.results, idCol = state.table.columns.find((c) => c.type === 'id');
  const ok = MODELS.filter((m) => res[m.key] && !res[m.key].error);
  download('out-of-fold-predictions.csv', toCSV([idCol ? idCol.name : 'row', `actual_${d.yName}`, ...ok.map((m) => `p_${m.key}`)],
    d.cvIdx.map((i, q) => [idCol ? idCol.raw[d.rowsIdx[i]] : d.rowsIdx[i] + 1, d.y[i], ...ok.map((m) => res[m.key].oof[q])])));
});

// ---------------------------------------------------------------- a tree you can read
let lastTree = null;
function renderTree() {
  const d = state.d; if (!d) return;
  const depth = +$('#tree-depth').value, leaf = +$('#tree-leaf').value;
  $('#tree-depth-out').textContent = String(depth);
  $('#tree-leaf-out').textContent = String(leaf);
  const tree = cart(d.X, d.y, { maxDepth: depth, minLeaf: leaf });
  lastTree = { tree, depth, leaf };
  $('#tree-body').hidden = false;
  $('#tree-leaves').textContent = F.int(tree.leaves);
  $('#tree-train-auc').textContent = F.num(roc(d.y, d.X.map(tree.predict)).auc, 2);
  $('#tree-fig-title').textContent = `The tree, grown on all ${F.int(d.y.length)} rows`;
  treeDiagram($('#tree-chart'), { tree, names: d.xNames, yName: d.yName });
  const rules = leafRules(tree, d.xNames, (v) => F.auto(v)).sort((a, b) => b.node.p1 - a.node.p1);
  $('#tree-rules').replaceChildren(...rules.map((r) => h('li', {}, h('strong', {}, `${F.pct(r.node.p1, 0)} ${d.yName}`), ` (${F.int(r.node.n)} rows) when `, r.path.length ? r.path.join(' and ') : 'always (the tree has no splits)')));
  renderTreeStats();
  renderTreeImportance();
}
function renderTreeStats() {
  const r = state.cmp?.results?.tree, spec = lastReq?.models?.find((m) => m.key === 'tree')?.opts;
  const current = spec && lastTree && spec.maxDepth === lastTree.depth && spec.minLeaf === lastTree.leaf;
  $('#tree-auc').textContent = r && !r.error && current ? `${F.num(r.auc, 2)} ± ${F.num(r.aucSd, 2)}` : '…';
}
const treeInput = () => { renderTree(); requestSoon(); };
$('#tree-depth').addEventListener('input', treeInput);
$('#tree-leaf').addEventListener('input', debounce(treeInput, 60));

// ---------------------------------------------------------------- feature importance
function renderImportance() {
  const imp = state.cmp?.importance, d = state.d;
  if (!imp || !d) return;
  $('#imp-body').hidden = false;
  const order = d.xNames.map((n, j) => j).sort((a, b) => imp.values[b].mean - imp.values[a].mean);
  $('#imp-title-fig').textContent = `Fall in AUC when a column is shuffled: ${nameOf(imp.key).toLowerCase()}`;
  $('#imp-sub').textContent = `Mean over the ${state.cmp.folds} held-out folds, three shuffles each. Choose another model under Compare models to see what it leans on.`;
  barChart($('#imp-chart'), {
    categories: order.map((j) => d.xNames[j]), horizontal: true, legend: false, valueLabels: true,
    series: [{ name: 'Fall in AUC', values: order.map((j) => imp.values[j].mean), cls: 'm-s2' }], format: (v) => F.num(v, 3),
    label: `Permutation importance for the ${nameOf(imp.key)}`,
  });
  tableTwin($('#imp-chart'), {
    caption: 'Permutation importance by column',
    columns: [{ label: 'Column' }, { label: 'Mean fall in AUC', num: true }, { label: 'sd across folds', num: true }, ...Array.from({ length: state.cmp.folds }, (_, i) => ({ label: `Fold ${i + 1}`, num: true }))],
    rows: order.map((j) => [d.xNames[j], F.num(imp.values[j].mean, 3), F.num(imp.values[j].sd, 3), ...imp.values[j].folds.map((v) => F.num(v, 3))]),
  });
}
function renderTreeImportance() {
  if (!lastTree || !state.d) return;
  const d = state.d, imp = lastTree.tree.importance;
  const order = d.xNames.map((n, j) => j).sort((a, b) => imp[b] - imp[a]);
  if (imp.every((v) => v === 0)) { $('#imp-tree').replaceChildren(h('p', { class: 'muted' }, 'This tree has no splits yet, so no column has removed any impurity.')); return; }
  barChart($('#imp-tree'), {
    categories: order.map((j) => d.xNames[j]), horizontal: true, legend: false, valueLabels: true,
    series: [{ name: 'Share of impurity removed', values: order.map((j) => imp[j]), cls: 'm-s1' }], format: (v) => F.pct(v, 0),
    label: 'Impurity importance in the readable decision tree',
  });
  tableTwin($('#imp-tree'), { caption: 'Impurity importance by column', columns: [{ label: 'Column' }, { label: 'Share of impurity removed', num: true }], rows: order.map((j) => [d.xNames[j], F.pct(imp[j], 1)]) });
}

// ---------------------------------------------------------------- logistic regression in depth
let lastCls = null;
function renderClassify() {
  const err = $('#cls-error'), body = $('#cls-body');
  err.replaceChildren(); lastCls = null;
  const t = +$('#cls-t').value / 100;
  $('#cls-t-out').textContent = F.pct(t, 0);
  const fail = (msg) => { err.append(h('div', { class: 'verdict is-bad' }, h('p', {}, h('strong', {}, 'No model yet. '), msg))); body.hidden = true; };
  const d = state.d; if (!d) return;
  const { y, xNames, yName } = d, X = xNames.map((_, j) => d.X.map((r) => r[j]));
  const fit = logit(X, y, { names: xNames });
  if (fit.error) return fail(fit.error);
  // judge it on rows it never saw: fit on 70%, score the other 30%
  const sp = splitRows(y.length);
  const fitTr = logit(X.map((c) => sp.train.map((i) => c[i])), sp.train.map((i) => y[i]), { names: xNames });
  if (fitTr.error) return fail(`On the 70% training split: ${fitTr.error}`);
  const yTe = sp.test.map((i) => y[i]), pTe = sp.test.map((i) => fitTr.predict(X.map((c) => c[i])));
  if (new Set(yTe).size < 2) return fail('The held-back rows contain only one class, so the model can’t be judged. Use a larger table.');
  body.hidden = false;
  const rc = roc(yTe, pTe), cm = confusion(yTe, pTe, t);
  lastCls = { fit, d };
  $('#cls-auc').textContent = F.num(rc.auc, 2);
  $('#cls-auc-line').textContent = `${rc.auc >= 0.8 ? 'Strong' : rc.auc >= 0.7 ? 'Useful' : rc.auc > 0.6 ? 'Weak' : 'Little better than chance'}: pick one yes and one no at random, and the model ranks the yes higher ${F.pct(rc.auc, 0)} of the time (0.5 is a coin flip). Base rate: ${F.pct(fit.base, 0)} yes.`;
  lastCls.splitAuc = rc.auc;
  clsNote();
  $('#cls-acc').textContent = F.pct(cm.accuracy, 0);
  $('#cls-prec').textContent = F.pct(cm.precision, 0);
  $('#cls-rec').textContent = F.pct(cm.recall, 0);
  $('#cls-r2').textContent = F.num(fit.pseudoR2, 2);
  $('#cls-coefs').replaceChildren(h('table', { class: 'data-table' },
    h('thead', {}, h('tr', {}, ['Term', 'Coefficient', 'Odds ratio', '95% CI', 'p'].map((c, i) => h('th', { scope: 'col', class: i ? 'is-num' : '' }, c)))),
    h('tbody', {}, fit.coefs.map((c, i) => h('tr', { class: i && c.p < 0.05 ? 'is-strong' : '' },
      h('th', { scope: 'row' }, c.name), h('td', { class: 'is-num' }, F.num(c.estimate, 3)), h('td', { class: 'is-num' }, i ? F.num(c.or, 3) : ''),
      h('td', { class: 'is-num' }, i ? `${F.num(c.orLow, 2)} to ${F.num(c.orHigh, 2)}` : ''), h('td', { class: 'is-num' }, F.pValue(c.p)))))));
  const reading = $('#cls-reading'); reading.replaceChildren();
  fit.coefs.slice(1).forEach((c) => {
    if (c.p >= 0.05) { reading.append(h('li', { class: 'muted' }, `${c.name}: no clear effect once the others are held fixed (p ${F.pValue(c.p)}).`)); return; }
    const change = c.or >= 1 ? `${F.pct(c.or - 1, 0)} higher` : `${F.pct(1 - c.or, 0)} lower`;
    const bin = new Set(colBy(c.name).values.filter(Number.isFinite)).size === 2;
    reading.append(h('li', {}, bin ? `${c.name} at its higher value: odds of ${yName} ${change} (×${F.num(c.or, 2)}), holding the others fixed.` : `Each extra unit of ${c.name}: odds of ${yName} ${change} (×${F.num(c.or, 2)}), holding the others fixed.`));
  });
  reading.append(h('li', { class: 'muted' }, 'Odds ratios describe association in this data, not cause.'));
  const pts = rc.pts;
  lineChart($('#cls-roc'), {
    xs: pts.map((q) => q.fpr), series: [{ name: 'Model', values: pts.map((q) => q.tpr), cls: 'm-s2' }, { name: 'Coin flip', values: pts.map((q) => q.fpr), cls: 'm-s1' }],
    height: 260, xLabel: 'False-positive rate', yLabel: 'True-positive rate', xFormat: (v) => F.pct(v, 0), yFormat: (v) => F.pct(v, 0), yDomain: [0, 1], endLabels: false,
    label: `ROC curve on held-back rows, area ${F.num(rc.auc, 2)}`,
  });
  $('#cls-cm-title').textContent = `At a ${F.pct(t, 0)} threshold, on the held-back rows`;
  $('#cls-cm').replaceChildren(h('div', { class: 'table-scroll' }, h('table', { class: 'data-table cm-table' },
    h('caption', { class: 'visually-hidden' }, 'Confusion matrix'),
    h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, ''), h('th', { scope: 'col', class: 'is-num' }, 'Flagged'), h('th', { scope: 'col', class: 'is-num' }, 'Not flagged'))),
    h('tbody', {},
      h('tr', {}, h('th', { scope: 'row' }, `Actually ${yName}`), h('td', { class: 'is-num cell-hi' }, `${cm.tp} caught`), h('td', { class: 'is-num' }, `${cm.fn} missed`)),
      h('tr', {}, h('th', { scope: 'row' }, 'Actually not'), h('td', { class: 'is-num' }, `${cm.fp} false alarms`), h('td', { class: 'is-num' }, `${cm.tn} correctly left`))))),
    h('p', { class: 'figure-sub' }, 'Raising the threshold flags fewer rows: fewer false alarms, more misses.'));
  const checks = $('#cls-checks'); checks.replaceChildren();
  const minority = Math.min(fit.base, 1 - fit.base) * fit.n;
  if (fit.separated) checks.append(h('div', { class: 'verdict is-warn' }, h('p', {}, h('strong', {}, 'Near-perfect separation. '), 'One predictor (or a mix) almost perfectly splits the classes, so some coefficients run off towards infinity and their standard errors can’t be trusted.')));
  if (minority / xNames.length < 10) checks.append(h('div', { class: 'verdict is-warn' }, h('p', {}, h('strong', {}, 'Few events per predictor. '), `${Math.round(minority)} cases in the rarer class for ${xNames.length} predictor${xNames.length > 1 ? 's' : ''}. Aim for at least ten per predictor, or coefficients will be unstable.`)));
}
/** One 70/30 split is noisier than five folds: say so once the cross-validated figure is in. */
function clsNote() {
  const r = state.cmp?.results?.logistic, el = $('#cls-split-note');
  el.textContent = r && !r.error && lastCls ? `One split is a noisy judge: the five-fold average under Compare models, ${F.num(r.auc, 2)}, is the steadier figure for this model.` : '';
}
$('#cls-t').addEventListener('input', renderClassify);
$('#cls-csv').addEventListener('click', () => {
  if (!lastCls) return;
  const { fit, d } = lastCls, t = +$('#cls-t').value / 100;
  const idCol = state.table.columns.find((c) => c.type === 'id');
  download('logistic-predictions.csv', toCSV([idCol ? idCol.name : 'row', `actual_${d.yName}`, 'probability', 'flagged'],
    d.rowsIdx.map((r, i) => [idCol ? idCol.raw[r] : r + 1, d.y[i], fit.prob[i], fit.prob[i] >= t ? 1 : 0])));
});

// ---------------------------------------------------------------- data
$('#cmp-k-out').textContent = $('#cmp-k').value;
$('#cmp-trees-out').textContent = $('#cmp-trees').value;
dataSource($('#ds'), {
  prefix: 'sup',
  examples: [{ key: 'churn', label: 'Seed club members (who cancelled)', name: 'Seed club members', make: subscriberChurn }, { key: 'cafe', label: 'Café weekly sales (promotion weeks)', name: 'Café weekly sales', make: cafeWeeks }],
  onLoad: ({ table, name }) => { state.table = table; state.name = name; renderQuestion(); },
}).select('churn');
syncRanges();
onResize($('#ledger'), () => {
  if (state.cmp) { renderCompare(); renderImportance(); }
  if (lastTree) renderTreeImportance();
  if (lastCls) renderClassify();
});
