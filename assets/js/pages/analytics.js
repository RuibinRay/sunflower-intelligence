// analytics.js — data quality, describe, correlate, regress, classify, segment, forecast.
import { initSite } from '../core/site.js?v=3';
import { $, $$, h, s, download, toCSV, onResize, debounce } from '../core/dom.js?v=3';
import * as F from '../core/format.js?v=3';
import * as S from '../core/stats.js?v=3';
import { parseTable, audit, applyTransforms, isNumeric } from '../core/csv.js?v=3';
import { sunflowerTrials, cafeWeeks, monthlySales, subscriberChurn, mulberry32 } from '../core/rng.js?v=3';
import { logit, confusion, roc, kmeans, silhouette, standardise } from '../core/classify.js?v=3';
import { syncRanges } from '../core/site.js?v=3';
import { histogramChart, scatter, heatmap, tableTwin, lineChart, barChart } from '../core/charts.js?v=3';
import { holtWinters, backtest } from '../core/forecast.js?v=3';

initSite();

const EXAMPLES = { trials: sunflowerTrials, cafe: cafeWeeks, churn: subscriberChurn };
const TYPE_LABEL = { number: 'Number', currency: 'Money', percent: 'Percent', date: 'Date', category: 'Category', text: 'Text', id: 'Identifier' };
const state = { original: null, table: null, name: '', note: '', dropDup: false, history: [], corrCols: null, corrPair: null, regX: null };

// ---------------------------------------------------------------- loading
function load(table, name, note) {
  state.original = table; state.name = name; state.note = note; state.dropDup = false;
  state.history = [`Loaded ${name}: ${F.int(table.nRows)} rows, ${table.columns.length} columns.`, ...table.warnings];
  state.corrCols = null; state.corrPair = null; state.regX = null;
  refresh();
}
function refresh() {
  state.table = applyTransforms(state.original, { dropDuplicates: state.dropDup });
  renderQuality();
  renderDescribeOptions();
  renderCorrelate();
  renderRegressOptions();
  renderClassifyOptions();
  renderSegmentOptions();
  renderForecastOptions();
}
function loadExample(key) {
  const ex = EXAMPLES[key]();
  const t = parseTable(ex.csv);
  load(t, ex.name, ex.note);
}
$$('input[name="source"]').forEach((r) => r.addEventListener('change', () => {
  const v = r.value;
  $('#own-data').hidden = v !== 'own';
  if (v === 'own') { $('#paste').focus(); return; }
  loadExample(v);
}));
function readText(text, name) {
  const t = parseTable(text);
  const err = $('#read-error');
  if (t.error) { err.textContent = t.error; return; }
  if (!t.columns.some(isNumeric)) { err.textContent = 'No numeric columns found. The tools here need at least one column of numbers.'; return; }
  err.textContent = '';
  load(t, name, 'Your table, read in this browser tab.');
}
$('#read-paste').addEventListener('click', () => readText($('#paste').value, 'your pasted table'));
$('#file').addEventListener('change', async (e) => {
  const f = e.target.files[0]; if (!f) return;
  if (f.size > 25 * 1024 * 1024) { $('#read-error').textContent = 'That file is over 25 MB. Try a smaller extract.'; return; }
  readText(await f.text(), f.name);
});

// ---------------------------------------------------------------- quality
function renderQuality() {
  const t = state.table;
  const a = audit(state.original, { dropDuplicates: state.dropDup });
  const after = audit(t);
  $('#dataset-note').textContent = `${state.name}. ${state.note}`;
  $('#q-score').textContent = String(after.score);
  $('#q-parts').replaceChildren(...after.parts.map((p) => h('li', {},
    h('span', { class: 'q-label' }, p.label),
    h('span', { class: 'q-detail' }, p.detail),
    h('span', { class: 'q-pen num' }, p.penalty > 0.05 ? `−${F.num(p.penalty, 1)}` : '0'))));
  const sug = $('#q-suggestions');
  sug.replaceChildren();
  a.suggestions.forEach((sg) => {
    if (sg.info) { sug.append(h('li', { class: 'q-info' }, sg.text)); return; }
    const id = `sg-${sg.id}`;
    const cb = h('input', { type: 'checkbox', id });
    cb.checked = state.dropDup;
    cb.addEventListener('change', () => {
      state.dropDup = cb.checked;
      state.history.push(cb.checked ? `Removed ${a.dupIdx.length} repeated row${a.dupIdx.length === 1 ? '' : 's'} (untick to restore).` : 'Restored the repeated rows.');
      refresh();
    });
    sug.append(h('li', { class: 'q-action' }, h('label', { class: 'check', for: id }, cb, sg.text)));
  });
  if (!a.suggestions.length) sug.append(h('li', { class: 'q-info' }, 'Nothing to fix: no gaps, repeats or unusual values were found.'));
  $('#q-history').replaceChildren(...state.history.map((x) => h('li', {}, x)));
  // columns
  const cols = t.columns;
  $('#columns-table').replaceChildren(h('table', { class: 'data-table' },
    h('thead', {}, h('tr', {}, ['Column', 'Type', 'Empty', 'Distinct'].map((c, i) => h('th', { scope: 'col', class: i > 1 ? 'is-num' : '' }, c)))),
    h('tbody', {}, cols.map((c) => h('tr', {}, h('th', { scope: 'row' }, c.name), h('td', {}, TYPE_LABEL[c.type] + (c.unit && c.type !== 'number' ? ` (${c.unit})` : '')), h('td', { class: 'is-num' }, F.int(c.missing)), h('td', { class: 'is-num' }, F.int(c.unique)))))));
  // preview
  const rows = t.rawRows.slice(0, 6);
  $('#preview').replaceChildren(h('table', { class: 'data-table' },
    h('thead', {}, h('tr', {}, cols.map((c) => h('th', { scope: 'col' }, c.name)))),
    h('tbody', {}, rows.map((r) => h('tr', {}, r.map((v) => h('td', { class: v === '' ? 'is-empty' : '' }, v === '' ? 'empty' : v)))))));
}

// ---------------------------------------------------------------- helpers
const numCols = () => state.table.columns.filter((c) => isNumeric(c));
const colBy = (name) => state.table.columns.find((c) => c.name === name);
function fillSelect(sel, names, keep) {
  sel.replaceChildren(...names.map((n) => h('option', { value: n }, n)));
  if (keep && names.includes(keep)) sel.value = keep;
}
function chips(box, names, checked, name, onChange, disabled = []) {
  box.replaceChildren(...names.map((n, i) => {
    const id = `${name}-${i}`;
    const cb = h('input', { type: 'checkbox', id, value: n });
    cb.checked = checked.includes(n);
    cb.disabled = disabled.includes(n);
    cb.addEventListener('change', onChange);
    return h('label', { class: 'chip', for: id }, cb, h('span', {}, n));
  }));
}
const checkedIn = (box) => $$('input:checked', box).map((i) => i.value);

// ---------------------------------------------------------------- describe
function renderDescribeOptions() {
  const sel = $('#desc-col');
  const names = numCols().map((c) => c.name);
  const prev = sel.value;
  fillSelect(sel, names, prev);
  if (!names.includes(prev)) sel.value = names[names.length - 1] || '';
  renderDescribe();
}
function shapeWords(d) {
  const sk = d.skewness, ku = d.kurtosis;
  const skew = !Number.isFinite(sk) ? '' : Math.abs(sk) < 0.5 ? 'Roughly symmetric' : sk > 0 ? 'Skewed right: a tail of high values, so the median is the safer “typical” value' : 'Skewed left: a tail of low values, so the median is the safer “typical” value';
  const tails = !Number.isFinite(ku) ? '' : ku > 1 ? 'heavier tails than a normal curve (more extreme values)' : ku < -1 ? 'lighter tails than a normal curve' : 'tails close to a normal curve';
  return `${skew}${skew && tails ? ', with ' : ''}${tails}.`;
}
function renderDescribe() {
  const name = $('#desc-col').value;
  const c = colBy(name);
  if (!c) return;
  const d = S.describe(c.values);
  $('#desc-mean').textContent = F.auto(d.mean);
  $('#desc-ci').textContent = d.n > 1 ? `95% confidence interval for the mean: ${F.auto(d.ciLow)} to ${F.auto(d.ciHigh)}` : '';
  const modeText = d.mode.values.length ? (d.mode.values.length > 3 ? `${d.mode.values.length} values tie` : `${d.mode.values.map((v) => F.auto(v)).join(', ')} (×${d.mode.count})`) : 'no repeats';
  const items = [['Count', F.int(d.n)], ['Empty', F.int(d.missing)], ['Median', F.auto(d.median)], ['Mode', modeText], ['Standard deviation', F.auto(d.sd)], ['Variance', F.auto(d.variance)],
    ['Minimum', F.auto(d.min)], ['First quartile', F.auto(d.q1)], ['Third quartile', F.auto(d.q3)], ['Maximum', F.auto(d.max)], ['Interquartile range', F.auto(d.iqr)],
    ['5th percentile', F.auto(d.p5)], ['95th percentile', F.auto(d.p95)], ['Skewness', F.num(d.skewness, 2)], ['Excess kurtosis', F.num(d.kurtosis, 2)]];
  $('#desc-stats').replaceChildren(...items.map(([k, v]) => h('div', { class: 'stat' }, h('dt', {}, k), h('dd', { class: 'num' }, v))));
  $('#desc-read').textContent = d.n > 2 ? shapeWords(d) : '';
  $('#desc-hist-title').textContent = `Distribution of ${name}`;
  const hist = S.histogram(c.values);
  if (hist.bins.length) histogramChart($('#desc-hist'), { bins: hist.bins, xLabel: name, label: `Histogram of ${name}`, markers: [{ x: d.mean, label: 'mean' }, ...(Math.abs(d.mean - d.median) > (d.max - d.min) * 0.04 ? [{ x: d.median, label: 'median' }] : [])] });
  $('#desc-table').replaceChildren();
  tableTwin($('#desc-table'), {
    caption: 'Summary of every numeric column',
    columns: [{ label: 'Column' }, { label: 'Count', num: true }, { label: 'Mean', num: true }, { label: 'SD', num: true }, { label: 'Min', num: true }, { label: 'Median', num: true }, { label: 'Max', num: true }],
    rows: numCols().map((col) => { const x = S.describe(col.values); return [col.name, F.int(x.n), F.auto(x.mean), F.auto(x.sd), F.auto(x.min), F.auto(x.median), F.auto(x.max)]; }),
  });
}
$('#desc-col').addEventListener('change', renderDescribe);
$('#desc-csv').addEventListener('click', () => {
  const rows = numCols().map((c) => { const d = S.describe(c.values); return [c.name, d.n, d.missing, d.mean, d.sd, d.min, d.q1, d.median, d.q3, d.max, d.skewness, d.kurtosis, d.ciLow, d.ciHigh]; });
  download('summary-statistics.csv', toCSV(['column', 'n', 'empty', 'mean', 'sd', 'min', 'q1', 'median', 'q3', 'max', 'skewness', 'excess_kurtosis', 'mean_ci95_low', 'mean_ci95_high'], rows));
});

// ---------------------------------------------------------------- correlate
const strength = (r) => { const a = Math.abs(r); return a < 0.1 ? 'negligible' : a < 0.3 ? 'weak' : a < 0.5 ? 'moderate' : a < 0.7 ? 'strong' : 'very strong'; };
function corrMatrix(cols, method, missing) {
  let vecs = cols.map((c) => c.values);
  if (missing === 'listwise') {
    const keep = vecs[0].map((_, i) => vecs.every((v) => Number.isFinite(v[i])));
    vecs = vecs.map((v) => v.filter((_, i) => keep[i]));
  }
  const n = cols.length;
  const R = [], P = [], N = [];
  for (let i = 0; i < n; i++) { R.push([]); P.push([]); N.push([]); for (let j = 0; j < n; j++) {
    const [a, b] = S.pairwise(vecs[i], vecs[j]);
    const res = i === j ? { r: 1, p: 0, n: a.length } : a.length >= 3 ? (method === 'spearman' ? S.spearman(a, b) : S.pearson(a, b)) : { r: NaN, p: NaN, n: a.length };
    R[i].push(res.r); P[i].push(res.p); N[i].push(a.length);
  } }
  return { R, P, N, vecs };
}
function renderCorrelate() {
  const names = numCols().map((c) => c.name);
  if (!state.corrCols) state.corrCols = names.slice(0, 8);
  state.corrCols = state.corrCols.filter((n) => names.includes(n));
  chips($('#corr-cols'), names, state.corrCols, 'cc', () => { state.corrCols = checkedIn($('#corr-cols')); state.corrPair = null; drawCorrelation(); });
  drawCorrelation();
}
function drawCorrelation() {
  const method = $('input[name="cmethod"]:checked').value, missing = $('input[name="cmissing"]:checked').value;
  const cols = state.corrCols.map(colBy).filter(Boolean);
  const heat = $('#corr-heat');
  if (cols.length < 2) {
    heat.replaceChildren(h('p', { class: 'note' }, 'Choose at least two columns.'));
    $('#corr-table').replaceChildren(); $('#pair-chart').replaceChildren(); $('#pair-read').textContent = ''; return;
  }
  const { R, P, N, vecs } = corrMatrix(cols, method, missing);
  if (!state.corrPair) { // open on the strongest relationship
    let best = [0, 1], bv = -1;
    for (let i = 0; i < cols.length; i++) for (let j = i + 1; j < cols.length; j++) if (Math.abs(R[i][j]) > bv) { bv = Math.abs(R[i][j]); best = [i, j]; }
    state.corrPair = best;
  }
  const [pi, pj] = state.corrPair;
  heatmap(heat, { labels: cols.map((c) => c.name), values: R, pvalues: P, ns: N, label: `${method === 'spearman' ? 'Spearman' : 'Pearson'} correlation matrix`, selected: [pi, pj], onSelect: (i, j) => { if (i !== j) { state.corrPair = [i, j]; drawCorrelation(); $('#pair-chart').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } } });
  $('#corr-table').replaceChildren();
  tableTwin($('#corr-table'), {
    caption: 'Correlation coefficients with p-values',
    columns: [{ label: '' }, ...cols.map((c) => ({ label: c.name, num: true }))],
    rows: cols.map((c, i) => [c.name, ...cols.map((_, j) => (i === j ? '1' : `${F.num(R[i][j], 2)} (p ${F.pValue(P[i][j])})`))]),
  });
  // the pair
  const [a, b] = S.pairwise(vecs[pi], vecs[pj]);
  const r = R[pi][pj], p = P[pi][pj];
  $('#pair-title').textContent = `${cols[pi].name} and ${cols[pj].name}`;
  if (!Number.isFinite(r)) { $('#pair-read').textContent = 'Not enough varied values to measure this pair.'; $('#pair-chart').replaceChildren(); return; }
  const dir = r > 0 ? 'positive: they tend to rise together' : 'negative: as one rises, the other tends to fall';
  $('#pair-read').textContent = `r = ${F.num(r, 2)} (${strength(r)}, ${dir}). p ${F.pValue(p).startsWith('<') ? '' : '= '}${F.pValue(p)} across ${F.int(a.length)} pairs${p < 0.05 ? ', unlikely to be chance alone' : ', which could easily be chance'}.`;
  const fit = S.ols([a], b);
  scatter($('#pair-chart'), {
    points: a.map((x, i) => ({ x, y: b[i] })), height: 300, xLabel: cols[pi].name, yLabel: cols[pj].name, label: `Scatter of ${cols[pj].name} against ${cols[pi].name}`,
    curves: fit.error ? [] : [{ fn: (x) => fit.beta[0] + fit.beta[1] * x, cls: 'm-s2' }],
  });
}
$$('input[name="cmethod"], input[name="cmissing"]').forEach((r) => r.addEventListener('change', drawCorrelation));

// ---------------------------------------------------------------- regress
let lastFit = null;
function renderRegressOptions() {
  const names = numCols().map((c) => c.name);
  const sel = $('#reg-y');
  const prev = sel.value;
  fillSelect(sel, names, prev);
  if (!names.includes(prev)) sel.value = names[names.length - 1];
  renderRegressChips();
}
function renderRegressChips() {
  const y = $('#reg-y').value;
  const names = numCols().map((c) => c.name).filter((n) => n !== y);
  if (!state.regX) state.regX = names.slice(0, 6);
  state.regX = state.regX.filter((n) => names.includes(n));
  if (!state.regX.length && names.length) state.regX = [names[0]];
  chips($('#reg-x'), names, state.regX, 'rx', () => { state.regX = checkedIn($('#reg-x')); renderRegress(); });
  renderRegress();
}
function renderRegress() {
  const yName = $('#reg-y').value, xNames = state.regX, sq = $('#reg-sq').checked;
  const err = $('#reg-error'), body = $('#reg-body');
  err.replaceChildren();
  lastFit = null;
  const fail = (msg) => { err.append(h('div', { class: 'verdict is-bad' }, h('p', {}, h('strong', {}, 'No model yet. '), msg))); body.hidden = true; };
  if (!yName) return fail('There are no numeric columns to model.');
  if (!xNames.length) return fail('Choose at least one predictor.');
  const ycol = colBy(yName).values, xcols = xNames.map((n) => colBy(n).values);
  const keep = ycol.map((v, i) => Number.isFinite(v) && xcols.every((x) => Number.isFinite(x[i])));
  const y = ycol.filter((_, i) => keep[i]);
  let X = xcols.map((x) => x.filter((_, i) => keep[i]));
  let names = [...xNames];
  const sqSkipped = [];
  const sqIdx = [];
  if (sq) {
    // centre before squaring so the linear and squared terms aren't needlessly collinear;
    // a two-valued column (0/1) squared is just itself again, so it gets no squared term
    const base = X.length;
    for (let j = 0; j < base; j++) {
      const x = X[j];
      if (new Set(x).size <= 2) { sqSkipped.push(xNames[j]); continue; }
      const m = S.mean(x); X.push(x.map((v) => (v - m) ** 2)); names.push(`(${xNames[j]} − mean)²`); sqIdx.push(j);
    }
  }
  const fit = S.ols(X, y, { names });
  if (fit.error) return fail(fit.error);
  body.hidden = false;
  const robust = $('#reg-robust').checked;
  const rob = robust ? fit.robust() : null;
  const coefs = robust ? rob.coefs : fit.coefs;
  lastFit = { fit, coefs, robust, names, X, y, yName, xNames, sq, sqIdx, means: xcols.map((x) => S.mean(x.filter((_, i) => keep[i]))) };
  $('#reg-r2').textContent = F.pct(fit.r2, 1);
  $('#reg-adj').textContent = `Adjusted R² ${F.pct(fit.adjR2, 1)}, which penalises extra predictors.`;
  $('#reg-n').textContent = `${F.int(fit.n)}${fit.n < ycol.length ? ` of ${F.int(ycol.length)}` : ''}`;
  $('#reg-f').textContent = `p ${F.pValue(robust ? rob.pF : fit.pF)}${robust ? ' (robust)' : ''}`;
  $('#reg-rmse').textContent = F.auto(fit.rmse);
  $('#reg-mae').textContent = F.auto(fit.mae);
  const vifs = X.length > 1 ? S.vif(X) : [1];
  $('#reg-coefs').replaceChildren(h('table', { class: 'data-table' },
    h('thead', {}, h('tr', {}, ['Term', 'Estimate', robust ? 'Std. error (HC3)' : 'Std. error', 't', 'p', '95% CI', 'VIF'].map((c, i) => h('th', { scope: 'col', class: i ? 'is-num' : '' }, c)))),
    h('tbody', {}, coefs.map((c, i) => h('tr', { class: i && c.p < 0.05 ? 'is-strong' : '' },
      h('th', { scope: 'row' }, c.name), h('td', { class: 'is-num' }, F.auto(c.estimate)), h('td', { class: 'is-num' }, F.auto(c.se)), h('td', { class: 'is-num' }, F.num(c.t, 2)),
      h('td', { class: 'is-num' }, F.pValue(c.p)), h('td', { class: 'is-num' }, `${F.auto(c.low)} to ${F.auto(c.high)}`), h('td', { class: 'is-num' }, i ? F.num(vifs[i - 1], 2) : ''))))));
  // plain reading
  const reading = $('#reg-reading');
  reading.replaceChildren();
  coefs.slice(1).forEach((c) => {
    const isSq = c.name.includes('²');
    if (c.p >= 0.05) { reading.append(h('li', { class: 'muted' }, `${c.name}: no clear effect once the others are held fixed (p ${F.pValue(c.p)}).`)); return; }
    if (isSq) { reading.append(h('li', {}, `${c.name}: the effect ${c.estimate < 0 ? 'flattens or reverses at the extremes' : 'grows at the extremes'} (p ${F.pValue(c.p)}).`)); return; }
    reading.append(h('li', {}, `Each extra unit of ${c.name} goes with ${F.signed(c.estimate, Math.abs(c.estimate) < 0.01 ? 4 : 3)} in ${yName}, holding the others fixed (p ${F.pValue(c.p)}).`));
  });
  if (sqSkipped.length) reading.append(h('li', { class: 'muted' }, `No squared term for ${sqSkipped.join(', ')}: a column with only two values can’t curve.`));
  reading.append(h('li', { class: 'muted' }, 'These are associations in this data. They describe causes only if the data came from a designed experiment.'));
  drawDiagnostic();
  // checks
  const checks = $('#reg-checks');
  checks.replaceChildren();
  const bp = S.breuschPagan(X, fit.resid);
  if (!bp.error) {
    checks.append(bp.p < 0.05
      ? h('div', { class: robust ? 'verdict is-good' : 'verdict is-warn' }, h('p', {}, h('strong', {}, 'Uneven spread of errors. '), `Breusch–Pagan LM = ${F.num(bp.lm, 2)}, p ${F.pValue(bp.p)}. The coefficients are still unbiased, but ordinary standard errors and p-values are not reliable. `,
          robust ? 'The table uses robust (HC3) standard errors, which allow for this.' : 'Tick “Robust standard errors (HC3)” to correct them.'))
      : h('div', { class: 'verdict is-good' }, h('p', {}, h('strong', {}, 'Even spread of errors. '), `Breusch–Pagan LM = ${F.num(bp.lm, 2)}, p ${F.pValue(bp.p)}: no evidence that the errors grow or shrink with the predictors.`)));
  }
  const high = names.filter((n, i) => vifs[i] > 5 && !n.includes('²'));
  if (high.length) checks.append(h('div', { class: 'verdict is-warn' }, h('p', {}, h('strong', {}, 'Overlapping predictors. '), `${high.join(', ')} ${high.length > 1 ? 'have' : 'has'} a variance inflation factor above 5: ${high.length > 1 ? 'they share' : 'it shares'} much of ${high.length > 1 ? 'their' : 'its'} information with other predictors, so ${high.length > 1 ? 'their' : 'its'} individual effects are hard to pin down.`)));
  if (fit.n < 10 * (fit.p)) checks.append(h('div', { class: 'verdict is-warn' }, h('p', {}, h('strong', {}, 'Few rows per coefficient. '), `${fit.n} rows for ${fit.p} coefficients. Estimates will be noisy; aim for at least ten rows per coefficient.`)));
  // predict
  const grid = $('#pred-inputs');
  grid.replaceChildren(...xNames.map((n, j) => h('div', { class: 'field' }, h('label', { for: `pred-${j}` }, n),
    Object.assign(h('input', { class: 'input', id: `pred-${j}`, type: 'number', step: 'any', inputmode: 'decimal' }), { value: String(+lastFit.means[j].toPrecision(4)) }))));
  $$('input', grid).forEach((i) => i.addEventListener('input', predict));
  predict();
}
function predict() {
  if (!lastFit) return;
  const { fit, xNames, sq, sqIdx, means, yName } = lastFit;
  const xs = xNames.map((_, j) => parseFloat($(`#pred-${j}`).value));
  if (!xs.every(Number.isFinite)) { $('#pred-out').textContent = 'Fill in every predictor.'; return; }
  const row = sq ? [...xs, ...sqIdx.map((j) => (xs[j] - means[j]) ** 2)] : xs;
  const p = fit.predict(row);
  $('#pred-out').replaceChildren(h('strong', {}, `${yName} ≈ ${F.auto(p.yhat)}`), ` (95% of individual outcomes between ${F.auto(p.piLow)} and ${F.auto(p.piHigh)}; the average outcome between ${F.auto(p.ciLow)} and ${F.auto(p.ciHigh)})`);
}
function drawDiagnostic() {
  if (!lastFit) return;
  const { fit, yName } = lastFit;
  const kind = $('input[name="dplot"]:checked').value;
  const fitted = Array.from(fit.fitted), resid = Array.from(fit.resid);
  if (kind === 'resid') {
    scatter($('#reg-plot'), { points: fitted.map((x, i) => ({ x, y: resid[i] })), refY: 0, height: 280, xLabel: `Fitted ${yName}`, yLabel: 'Residual', label: 'Residuals against fitted values' });
  } else {
    const all = fitted.concat(lastFit.y);
    const lo = Math.min(...all), hi = Math.max(...all);
    scatter($('#reg-plot'), { points: fitted.map((x, i) => ({ x, y: lastFit.y[i] })), curves: [{ pts: [[lo, lo], [hi, hi]], cls: 'm-s2' }], height: 280, xLabel: `Predicted ${yName}`, yLabel: `Actual ${yName}`, label: 'Actual against predicted values', xDomain: [lo, hi], yDomain: [lo, hi] });
  }
}
$('#reg-y').addEventListener('change', () => { state.regX = null; renderRegressChips(); });
$('#reg-sq').addEventListener('change', renderRegress);
$('#reg-robust').addEventListener('change', renderRegress);
$$('input[name="dplot"]').forEach((r) => r.addEventListener('change', drawDiagnostic));
$('#reg-csv').addEventListener('click', () => {
  if (!lastFit) return;
  const { fit, coefs, robust } = lastFit;
  download('regression-coefficients.csv', toCSV(['term', 'estimate', robust ? 'std_error_hc3' : 'std_error', 't', 'p_value', 'ci95_low', 'ci95_high'], coefs.map((c) => [c.name, c.estimate, c.se, c.t, c.p, c.low, c.high]).concat([[], ['r_squared', fit.r2], ['adj_r_squared', fit.adjR2], ['n', fit.n], ['rmse', fit.rmse]])));
});

// ---------------------------------------------------------------- classify (logistic regression)
let lastCls = null;
const twoValued = (c) => { const v = new Set(c.values.filter(Number.isFinite)); return v.size === 2; };
function renderClassifyOptions() {
  const bin = numCols().filter(twoValued).map((c) => c.name);
  const sel = $('#cls-y'), prev = sel.value;
  fillSelect(sel, bin, prev);
  if (!bin.includes(prev)) sel.value = bin.includes('churned') ? 'churned' : bin[bin.length - 1] || '';
  state.clsX = null;
  renderClassifyChips();
}
function renderClassifyChips() {
  const y = $('#cls-y').value;
  const names = numCols().map((c) => c.name).filter((n) => n !== y);
  if (!state.clsX) state.clsX = names.slice(0, 6);
  state.clsX = state.clsX.filter((n) => names.includes(n));
  chips($('#cls-x'), names, state.clsX, 'cx', () => { state.clsX = checkedIn($('#cls-x')); renderClassify(); });
  renderClassify();
}
function splitRows(n, seed = 7) {
  const r = mulberry32(seed), idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  const cut = Math.round(n * 0.7);
  return { train: idx.slice(0, cut), test: idx.slice(cut) };
}
function renderClassify() {
  const err = $('#cls-error'), body = $('#cls-body');
  err.replaceChildren(); lastCls = null;
  const t = +$('#cls-t').value / 100;
  $('#cls-t-out').textContent = F.pct(t, 0);
  const fail = (msg) => { err.append(h('div', { class: 'verdict is-bad' }, h('p', {}, h('strong', {}, 'No model yet. '), msg))); body.hidden = true; };
  const yName = $('#cls-y').value;
  if (!yName) { $('#cls-y-note').textContent = ''; return fail('This table has no column with exactly two values. Choose “Seed club members” above to try it.'); }
  const xNames = state.clsX;
  if (!xNames.length) return fail('Choose at least one predictor.');
  const ycol = colBy(yName).values, xcols = xNames.map((n) => colBy(n).values);
  const vals = [...new Set(ycol.filter(Number.isFinite))].sort((a, b) => a - b);
  $('#cls-y-note').textContent = `Predicting ${yName} = ${F.auto(vals[1])} (the other value, ${F.auto(vals[0])}, counts as no).`;
  const keep = ycol.map((v, i) => Number.isFinite(v) && xcols.every((x) => Number.isFinite(x[i])));
  const rowsIdx = keep.map((k, i) => (k ? i : -1)).filter((i) => i >= 0);
  const y = rowsIdx.map((i) => (ycol[i] === vals[1] ? 1 : 0));
  const X = xcols.map((x) => rowsIdx.map((i) => x[i]));
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
  lastCls = { fit, rowsIdx, y, yName };
  $('#cls-auc').textContent = F.num(rc.auc, 2);
  $('#cls-auc-line').textContent = `${rc.auc >= 0.8 ? 'Strong' : rc.auc >= 0.7 ? 'Useful' : rc.auc > 0.6 ? 'Weak' : 'Little better than chance'}: pick one yes and one no at random, and the model ranks the yes higher ${F.pct(rc.auc, 0)} of the time (0.5 is a coin flip). Base rate: ${F.pct(fit.base, 0)} yes.`;
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
  // ROC
  const pts = rc.pts;
  lineChart($('#cls-roc'), {
    xs: pts.map((q) => q.fpr), series: [{ name: 'Model', values: pts.map((q) => q.tpr), cls: 'm-s2' }, { name: 'Coin flip', values: pts.map((q) => q.fpr), cls: 'm-s1' }],
    height: 260, xLabel: 'False-positive rate', yLabel: 'True-positive rate', xFormat: (v) => F.pct(v, 0), yFormat: (v) => F.pct(v, 0), yDomain: [0, 1], endLabels: false,
    label: `ROC curve on held-back rows, area ${F.num(rc.auc, 2)}`,
  });
  // confusion matrix at the threshold
  $('#cls-cm-title').textContent = `At a ${F.pct(t, 0)} threshold, on the held-back rows`;
  $('#cls-cm').replaceChildren(h('table', { class: 'data-table cm-table' },
    h('caption', { class: 'visually-hidden' }, 'Confusion matrix'),
    h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, ''), h('th', { scope: 'col', class: 'is-num' }, 'Flagged'), h('th', { scope: 'col', class: 'is-num' }, 'Not flagged'))),
    h('tbody', {},
      h('tr', {}, h('th', { scope: 'row' }, `Actually ${yName}`), h('td', { class: 'is-num cell-hi' }, `${cm.tp} caught`), h('td', { class: 'is-num' }, `${cm.fn} missed`)),
      h('tr', {}, h('th', { scope: 'row' }, 'Actually not'), h('td', { class: 'is-num' }, `${cm.fp} false alarms`), h('td', { class: 'is-num' }, `${cm.tn} correctly left`)))),
    h('p', { class: 'figure-sub' }, `Raising the threshold flags fewer rows: fewer false alarms, more misses.`));
  // checks
  const checks = $('#cls-checks'); checks.replaceChildren();
  const minority = Math.min(fit.base, 1 - fit.base) * fit.n;
  if (fit.separated) checks.append(h('div', { class: 'verdict is-warn' }, h('p', {}, h('strong', {}, 'Near-perfect separation. '), 'One predictor (or a mix) almost perfectly splits the classes, so some coefficients run off towards infinity and their standard errors can’t be trusted.')));
  if (minority / xNames.length < 10) checks.append(h('div', { class: 'verdict is-warn' }, h('p', {}, h('strong', {}, 'Few events per predictor. '), `${Math.round(minority)} cases in the rarer class for ${xNames.length} predictor${xNames.length > 1 ? 's' : ''}. Aim for at least ten per predictor, or coefficients will be unstable.`)));
}
$('#cls-y').addEventListener('change', () => { state.clsX = null; renderClassifyChips(); });
$('#cls-t').addEventListener('input', renderClassify);
$('#cls-csv').addEventListener('click', () => {
  if (!lastCls) return;
  const { fit, rowsIdx, y, yName } = lastCls, t = +$('#cls-t').value / 100;
  const idCol = state.table.columns.find((c) => c.type === 'id');
  download('logistic-predictions.csv', toCSV([idCol ? idCol.name : 'row', `actual_${yName}`, 'probability', 'flagged'],
    rowsIdx.map((r, i) => [idCol ? idCol.raw[r] : r + 1, y[i], fit.prob[i], fit.prob[i] >= t ? 1 : 0])));
});

// ---------------------------------------------------------------- segment (k-means)
let lastSeg = null;
function renderSegmentOptions() {
  const names = numCols().map((c) => c.name);
  const cont = numCols().filter((c) => !twoValued(c)).map((c) => c.name);
  state.segX = state.segX ? state.segX.filter((n) => names.includes(n)) : null;
  if (!state.segX || state.segX.length < 2) state.segX = cont.slice(0, 3).length >= 2 ? cont.slice(0, 3) : names.slice(0, 3);
  chips($('#seg-x'), names, state.segX, 'sx', () => { state.segX = checkedIn($('#seg-x')); state.segShow = 0; renderSegment(); });
  state.segShow = 0;
  renderSegment();
}
function renderSegment() {
  const err = $('#seg-error'), body = $('#seg-body');
  err.replaceChildren(); lastSeg = null;
  const k = +$('#seg-k').value;
  $('#seg-k-out').textContent = String(k);
  const fail = (msg) => { err.append(h('div', { class: 'verdict is-bad' }, h('p', {}, h('strong', {}, 'No groups yet. '), msg))); body.hidden = true; };
  const xNames = state.segX || [];
  if (xNames.length < 2) return fail('Choose at least two columns.');
  const cols = xNames.map((n) => colBy(n).values);
  const keep = cols[0].map((_, i) => cols.every((c) => Number.isFinite(c[i])));
  const idx = keep.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
  if (idx.length < 12) return fail('Needs at least 12 complete rows.');
  const data = cols.map((c) => idx.map((i) => c[i]));
  const { rows } = standardise(data);
  // silhouette is O(n²): above 1,500 rows it is scored on a seeded sample
  const sampleIdx = rows.length > 1500 ? splitRows(rows.length, 3).train.slice(0, 1500) : null;
  const silOf = (labels) => (sampleIdx ? silhouette(sampleIdx.map((i) => rows[i]), sampleIdx.map((i) => labels[i])) : silhouette(rows, labels));
  const runs = [2, 3, 4, 5, 6].filter((kk) => kk < rows.length).map((kk) => { const km = kmeans(rows, kk); return { k: kk, km, sil: silOf(km.labels) }; });
  const run = runs.find((r) => r.k === k) || runs[runs.length - 1];
  const best = runs.reduce((a, b) => (b.sil > a.sil ? b : a));
  body.hidden = false;
  lastSeg = { idx, km: run.km, xNames, data, best };
  $('#seg-sil').textContent = F.num(run.sil, 2);
  $('#seg-line').textContent = `${run.sil >= 0.5 ? 'Clear groups' : run.sil >= 0.25 ? 'Some structure, with overlap' : 'Weak structure: these groups are a convenient cut more than a natural one'}. Best-separated: ${best.k} groups (${F.num(best.sil, 2)})${sampleIdx ? '; scored on a sample of 1,500 rows' : ''}.`;
  barChart($('#seg-k-chart'), {
    categories: runs.map((r) => `${r.k} groups`), height: 200, legend: false, valueLabels: true, label: 'Silhouette score for each number of groups',
    series: [{ name: 'Silhouette', values: runs.map((r) => r.sil), cls: 'm-s2' }], format: (v) => F.num(v, 2),
  });
  // profiles in original units
  const { labels, sizes } = run.km, n = idx.length;
  const means = Array.from({ length: run.k }, (_, c) => data.map((col) => S.mean(col.filter((_, i) => labels[i] === c))));
  const overall = data.map((col) => S.mean(col)), sds = data.map((col) => S.sd(col) || 1);
  const describeGroup = (c) => {
    const z = means[c].map((m, j) => ({ j, z: (m - overall[j]) / sds[j] })).sort((a, b) => Math.abs(b.z) - Math.abs(a.z)).filter((d) => Math.abs(d.z) >= 0.3).slice(0, 2);
    return z.length ? z.map((d) => `${d.z > 0 ? 'high' : 'low'} ${xNames[d.j]}`).join(', ') : 'close to average';
  };
  $('#seg-profile').replaceChildren(h('table', { class: 'data-table' },
    h('thead', {}, h('tr', {}, ['Group', 'Rows', ...xNames, 'Stands out for'].map((c, i) => h('th', { scope: 'col', class: i && i <= xNames.length + 1 ? 'is-num' : '' }, c)))),
    h('tbody', {},
      ...means.map((m, c) => h('tr', {}, h('th', { scope: 'row' }, `Group ${c + 1}`), h('td', { class: 'is-num' }, `${F.int(sizes[c])} (${F.pct(sizes[c] / n, 0)})`), ...m.map((v) => h('td', { class: 'is-num' }, F.auto(v))), h('td', {}, describeGroup(c)))),
      h('tr', { class: 'is-total' }, h('th', { scope: 'row' }, 'All rows'), h('td', { class: 'is-num' }, F.int(n)), ...overall.map((v) => h('td', { class: 'is-num' }, F.auto(v))), h('td', {}, '')))));
  // highlight one group at a time (scatter colours stay readable for any number of groups)
  if (!(state.segShow < run.k)) state.segShow = 0;
  const box = $('#seg-show');
  box.replaceChildren(...Array.from({ length: run.k }, (_, c) => [
    Object.assign(h('input', { type: 'radio', id: `seg-show-${c}`, name: 'seg-show', value: String(c) }), { checked: c === state.segShow }),
    h('label', { for: `seg-show-${c}` }, `${c + 1}`),
  ]).flat());
  $$('input', box).forEach((el) => el.addEventListener('change', () => { state.segShow = +el.value; drawSegPlot(); }));
  drawSegPlot();
}
function drawSegPlot() {
  if (!lastSeg) return;
  const { km, data, xNames } = lastSeg, c = state.segShow;
  $('#seg-plot-title').textContent = `${xNames[1]} against ${xNames[0]}: group ${c + 1} highlighted`;
  const pts = data[0].map((x, i) => ({ x, y: data[1][i], cls: km.labels[i] === c ? 'm-s2' : 'm-muted', title: `Group ${km.labels[i] + 1}` }));
  pts.sort((a, b) => (a.cls === 'm-s2') - (b.cls === 'm-s2'));          // highlighted group drawn on top
  scatter($('#seg-plot'), { points: pts, height: 300, xLabel: xNames[0], yLabel: xNames[1], label: `Rows by ${xNames[0]} and ${xNames[1]}, group ${c + 1} highlighted`,
    legend: [{ name: `Group ${c + 1}`, cls: 'm-s2' }, { name: 'Other groups', cls: 'm-muted' }] });
}
$('#seg-k').addEventListener('input', renderSegment);
$('#seg-best').addEventListener('click', () => { if (!lastSeg) return; $('#seg-k').value = String(lastSeg.best.k); syncRanges($('#segment')); renderSegment(); });
$('#seg-csv').addEventListener('click', () => {
  if (!lastSeg) return;
  const { idx, km, xNames, data } = lastSeg;
  const idCol = state.table.columns.find((c) => c.type === 'id');
  download('kmeans-groups.csv', toCSV([idCol ? idCol.name : 'row', ...xNames, 'group'], idx.map((r, i) => [idCol ? idCol.raw[r] : r + 1, ...data.map((col) => col[i]), km.labels[i] + 1])));
});

// ---------------------------------------------------------------- forecast
const SALES = monthlySales();
let lastForecast = null;
function renderForecastOptions() {
  const sel = $('#fc-src'), prev = sel.value;
  const opts = [{ v: 'example', t: `Example: ${SALES.name.toLowerCase()} (${SALES.rows.length} months)` }]
    .concat(numCols().map((c) => ({ v: `col:${c.name}`, t: `${c.name}, from ${state.name}` })));
  sel.replaceChildren(...opts.map((o) => h('option', { value: o.v }, o.t)));
  sel.value = opts.some((o) => o.v === prev) ? prev : 'example';
  renderForecast();
}
function forecastSeries() {
  const v = $('#fc-src').value;
  if (v === 'example') {
    const [y0, m0] = SALES.rows[0].date.split('-').map(Number);
    const label = (i) => { const k = (m0 - 1) + Math.round(i); return `${y0 + Math.floor(k / 12)}-${String((k % 12) + 1).padStart(2, '0')}`; };
    return { y: SALES.rows.map((r) => r.value), label, unit: 'month', name: 'Monthly sales', note: SALES.note, money: true };
  }
  const name = v.slice(4), col = colBy(name);
  return { y: col ? col.values : [], label: (i) => `row ${Math.round(i) + 1}`, unit: 'row', name, note: 'Rows are read in table order, as equally spaced periods.', money: col?.type === 'currency' };
}
function renderForecast() {
  const err = $('#fc-error'), body = $('#fc-body');
  err.replaceChildren(); lastForecast = null;
  const fail = (msg) => { err.append(h('div', { class: 'verdict is-bad' }, h('p', {}, h('strong', {}, 'No forecast yet. '), msg))); body.hidden = true; };
  const src = forecastSeries();
  $('#fc-src-note').textContent = src.note;
  const m = Math.round(parseFloat($('#fc-m').value)), hz = +$('#fc-h').value, mode = $('input[name="fc-mode"]:checked').value;
  $('#fc-h-out').textContent = `${hz} ${src.unit}${hz === 1 ? '' : 's'}`;
  if (!(m >= 2 && m <= 104)) return fail('Set a season length between 2 and 104.');
  if (src.y.some((v) => !Number.isFinite(v))) return fail(`${src.name} has empty or non-numeric cells. A forecast needs an unbroken run of numbers.`);
  if (mode === 'multiplicative' && src.y.some((v) => v <= 0)) return fail('Seasonal swings that grow with the level are modelled on logarithms, so every value has to be above zero.');
  const res = holtWinters(src.y, m, hz, { mode });
  if (res.error) return fail(res.error);
  body.hidden = false;
  const fmt = (v) => (src.money ? F.money(v) : F.auto(v));
  const n = src.y.length;
  lastForecast = { res, src, n, hz };
  $('#fc-next').textContent = fmt(res.mean[0]);
  $('#fc-next-label').textContent = `forecast for ${src.label(n)}`;
  $('#fc-range').textContent = `95% range ${fmt(res.lo[0])} to ${fmt(res.hi[0])}; by ${src.label(n + hz - 1)}, ${fmt(res.lo[hz - 1])} to ${fmt(res.hi[hz - 1])}.`;
  $('#fc-kind').textContent = res.kind === 'multiplicative' ? 'Grow with level' : 'Fixed size';
  // hold back the last season, forecast it, compare with repeating last season
  const bt = n >= 3 * m + 2 ? backtest(src.y, m, m, res.kind) : { error: 'too short' };
  const useMape = !bt.error && Number.isFinite(bt.model.mape);
  const errText = (e) => (useMape ? `${F.pct(e.mape, 1)} off` : `RMSE ${fmt(e.rmse)}`);
  $('#fc-bt-model').textContent = bt.error ? 'Too short' : errText(bt.model);
  $('#fc-bt-naive').textContent = bt.error ? '—' : errText(bt.naive);
  $('#fc-bt-cover').textContent = bt.error ? '—' : `${bt.covered} of ${bt.h}`;
  // chart: history, forecast continuing from the last actual value, and its band
  const xs = Array.from({ length: n + hz }, (_, i) => i);
  const hist = xs.map((i) => (i < n ? src.y[i] : NaN));
  const fc = xs.map((i) => (i === n - 1 ? src.y[n - 1] : i >= n ? res.mean[i - n] : NaN));
  const lo = xs.map((i) => (i === n - 1 ? src.y[n - 1] : i >= n ? res.lo[i - n] : NaN));
  const hi = xs.map((i) => (i === n - 1 ? src.y[n - 1] : i >= n ? res.hi[i - n] : NaN));
  lineChart($('#fc-chart'), {
    xs, series: [{ name: 'Actual', values: hist, cls: 'm-s1' }, { name: 'Forecast', values: fc, cls: 'm-s2' }],
    band: { lo, hi, cls: 'm-s2', label: '95% range' }, highlightX: n - 1, height: 300,
    xFormat: (i) => src.label(i), yFormat: fmt, yLabel: src.name, label: `${src.name}: history and ${hz}-${src.unit} forecast with a 95% range`, endLabels: false,
  });
  // plain reading
  const r = $('#fc-reading'); r.replaceChildren();
  const alt = res.alternative;
  if (res.reason === 'auto' && alt) r.append(h('li', {}, res.kind === 'multiplicative'
    ? `The seasonal swings grow as the series grows, so the model works on logarithms (one-step error ${fmt(res.rmse)} against ${fmt(alt.rmse)} with fixed-size swings).`
    : `The seasonal swings keep roughly the same size as the series grows (one-step error ${fmt(res.rmse)} against ${fmt(alt.rmse)} with swings that scale).`));
  if (res.reason === 'non-positive') r.append(h('li', { class: 'muted' }, 'The series has zero or negative values, so only fixed-size seasonal swings can be modelled.'));
  if (!bt.error) {
    const better = (useMape ? bt.model.mape < bt.naive.mape : bt.model.rmse < bt.naive.rmse);
    const ratio = useMape ? 1 - bt.model.mape / bt.naive.mape : 1 - bt.model.rmse / bt.naive.rmse;
    r.append(h('li', { class: better ? '' : 'is-warn' }, better
      ? `On the hidden last season the model’s error was ${F.pct(ratio, 0)} smaller than simply repeating the season before it, and ${bt.covered} of ${bt.h} hidden values fell inside its 95% range.`
      : `On the hidden last season the model did no better than repeating the season before it. Treat this forecast as a rough guide only.`));
  } else r.append(h('li', { class: 'muted' }, `With fewer than three seasons of history there is no season to spare for an honest check, so the forecast is untested.`));
  const p = res.params;
  r.append(h('li', {}, `Smoothing weights: level ${F.num(p.alpha, 2)}, trend ${F.num(p.beta, 2)}, season ${F.num(p.gamma, 2)}. Weights near 0 mean the model trusts the long history; near 1, mostly the latest ${src.unit}s.`));
  r.append(h('li', { class: 'muted' }, 'The forecast assumes the past pattern continues. One-off events, price changes and new competitors are not in it, which is why the range widens the further it reaches.'));
  // table twin
  $('#fc-table').replaceChildren();
  tableTwin($('#fc-table'), {
    caption: 'Forecast with 95% range',
    columns: [{ label: src.unit === 'month' ? 'Month' : 'Period' }, { label: 'Forecast', num: true }, { label: 'Low (95%)', num: true }, { label: 'High (95%)', num: true }],
    rows: res.mean.map((v, i) => [src.label(n + i), fmt(v), fmt(res.lo[i]), fmt(res.hi[i])]),
  });
}
$('#fc-src').addEventListener('change', () => { if ($('#fc-src').value === 'example') $('#fc-m').value = '12'; renderForecast(); });
$('#fc-m').addEventListener('input', debounce(renderForecast, 250));
$('#fc-h').addEventListener('input', renderForecast);
$$('input[name="fc-mode"]').forEach((el) => el.addEventListener('change', renderForecast));
$('#fc-csv').addEventListener('click', () => {
  if (!lastForecast) return;
  const { res, src, n } = lastForecast;
  download('holt-winters-forecast.csv', toCSV(['period', 'forecast', 'low_95', 'high_95'], res.mean.map((v, i) => [src.label(n + i), v, res.lo[i], res.hi[i]])
    .concat([[], ['seasonal_swings', res.kind], ['alpha', res.params.alpha], ['beta', res.params.beta], ['gamma', res.params.gamma]])));
});

// ---------------------------------------------------------------- go
loadExample('trials');
const redraw = debounce(() => { if (!state.table) return; renderDescribe(); drawCorrelation(); drawDiagnostic(); if (lastCls) renderClassify(); if (lastSeg) drawSegPlot(); if (lastForecast) renderForecast(); }, 150);
onResize($('#desc-hist'), redraw);
