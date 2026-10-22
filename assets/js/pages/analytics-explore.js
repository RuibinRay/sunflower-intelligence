// analytics-explore.js — data quality, describe, correlate, regress. The loaded table is shared with the other analytics pages.
import { initSite, syncRanges } from '../core/site.js?v=5';
import { $, $$, h, s, download, toCSV, onResize, debounce } from '../core/dom.js?v=5';
import * as F from '../core/format.js?v=5';
import * as S from '../core/stats.js?v=5';
import { parseTable, audit, applyTransforms, isNumeric } from '../core/csv.js?v=5';
import { sunflowerTrials, cafeWeeks, subscriberChurn } from '../core/rng.js?v=5';
import { histogramChart, scatter, heatmap, tableTwin } from '../core/charts.js?v=5';
import { fillSelect, chips, checkedIn } from '../core/ui.js?v=5';
import { saveShared } from '../core/datasource.js?v=5';

initSite();

const EXAMPLES = { trials: sunflowerTrials, cafe: cafeWeeks, churn: subscriberChurn };
const TYPE_LABEL = { number: 'Number', currency: 'Money', percent: 'Percent', date: 'Date', category: 'Category', text: 'Text', id: 'Identifier' };
const state = { original: null, table: null, name: '', note: '', dropDup: false, history: [], corrCols: null, corrPair: null, regX: null, csv: '' };

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
}
function loadExample(key) {
  state.csv = '';
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
  // your own table follows you to the other analytics pages (this tab only)
  state.csv = text;
  saveShared({ name, note: 'The table you loaded under Explore.', csv: text, dropDup: false });
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
      if (state.csv) saveShared({ name: state.name, note: 'The table you loaded under Explore.', csv: state.csv, dropDup: state.dropDup });
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


// ---------------------------------------------------------------- go
loadExample('trials');
const redraw = debounce(() => { if (!state.table) return; renderDescribe(); drawCorrelation(); drawDiagnostic(); }, 150);
onResize($('#desc-hist'), redraw);
