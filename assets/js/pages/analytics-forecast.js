// analytics-forecast.js — Holt-Winters forecasting, on an example series or a column of the table loaded under Explore.
import { initSite, syncRanges } from '../core/site.js?v=8';
import { $, $$, h, s, download, toCSV, onResize, debounce } from '../core/dom.js?v=8';
import * as F from '../core/format.js?v=8';
import * as S from '../core/stats.js?v=8';
import { parseTable, isNumeric } from '../core/csv.js?v=8';
import { histogramChart, scatter, heatmap, tableTwin, lineChart, barChart } from '../core/charts.js?v=8';
import { fillSelect, chips, checkedIn, splitRows, verdict } from '../core/ui.js?v=8';
import { dataSource, loadShared } from '../core/datasource.js?v=8';
import { monthlySales } from '../core/rng.js?v=8';
import { holtWinters, backtest } from '../core/forecast.js?v=8';

initSite();

const state = { table: null, name: '' };
const shared = loadShared();
if (shared) { const t = parseTable(shared.csv); if (!t.error) { state.table = t; state.name = shared.name; } }
const numCols = () => (state.table ? state.table.columns.filter((c) => isNumeric(c)) : []);
const colBy = (name) => state.table?.columns.find((c) => c.name === name);

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


renderForecastOptions();
onResize($('#fc-chart'), debounce(() => { if (lastForecast) renderForecast(); }, 150));
