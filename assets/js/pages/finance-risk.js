// finance-risk.js — market risk (Value at Risk, Expected Shortfall, backtest, stress) and credit risk (Altman Z).
import { initSite, syncRanges, fillRange } from '../core/site.js?v=5';
import { $, $$, h, s, download, toCSV, onResize, debounce } from '../core/dom.js?v=5';
import * as F from '../core/format.js?v=5';
import * as S from '../core/stats.js?v=5';
import { barChart, tableTwin, lineChart, scatter, histogramChart, lin } from '../core/charts.js?v=5';
import { verdict, whenNear, afterPaint } from '../core/ui.js?v=5';
import { parseTable, isNumeric } from '../core/csv.js?v=5';
import { simulatedMarket } from '../core/finsim.js?v=5';
import { returns } from '../core/portfolio.js?v=5';
import * as RK from '../core/risk.js?v=5';

initSite();

// ================================================================ the returns being measured
let mr = null;   // { r, dates (ms of each return) | null, unit: 'day' | 'month', name, note }
const METHODS = [
  { key: 'historical', name: 'Historical simulation', short: 'Historical', cls: 'm-s1' },
  { key: 'normal', name: 'Normal (variance–covariance)', short: 'Normal', cls: 'm-s2' },
  { key: 'mc', name: 'Monte Carlo, Student-t', short: 'Monte Carlo', cls: 'm-s3' },
];
const BT_METHODS = [{ key: 'historical', name: 'Historical' }, { key: 'normal', name: 'Normal' }, { key: 'ewma', name: 'EWMA normal' }];
const conf = () => +$('input[name="var-conf"]:checked').value;
const plural = (n, u) => `${n} ${u}${n === 1 ? '' : 's'}`;
const ly = (u) => (u === 'day' ? 'daily' : 'monthly');
const span = (n, u) => (n === 1 ? `one-${u}` : `${n}-${u}`);

function useReturns(d) {
  mr = d;
  const hMax = d.unit === 'month' ? 12 : 20;
  const hs = $('#var-h'); hs.max = hMax; if (+hs.value > hMax) hs.value = hMax;
  fillRange(hs);
  $('#var-note').textContent = `${d.note} ${F.int(d.r.length)} ${ly(d.unit)} returns${d.dates ? `, ${F.date(d.dates[0])} to ${F.date(d.dates[d.dates.length - 1])}` : ''}.`;
  const wins = d.unit === 'month' ? [[60, '5 years'], [120, '10 years']] : [[250, '1 year'], [500, '2 years']];
  const fits = wins.filter(([w]) => d.r.length >= w + 60);
  $('#bt-windows').replaceChildren(...(fits.length ? fits : [[Math.max(20, Math.floor(d.r.length / 3)), 'a third of the data']]).flatMap(([w, lab], i) => [
    Object.assign(h('input', { type: 'radio', id: `bt-w${i}`, name: 'bt-w', value: w }), { checked: i === 0 }),
    h('label', { for: `bt-w${i}` }, `${lab} (${w})`)]));
  renderVar(); showBacktest();
}
// the backtest and stress sections render when they come near the viewport
const ready = { bt: false, st: false };
function showBacktest() {
  if (ready.bt) { renderBacktest(); return; }
  if (showBacktest.armed) return;
  showBacktest.armed = true;
  whenNear($('#backtest'), () => { ready.bt = true; renderBacktest(); });
}
function loadSim() {
  const m = simulatedMarket({ days: 2520, seed: 13 });
  const rs = m.series.filter((x) => !x.isMarket).map((x) => returns(x.prices));
  const r = rs[0].map((_, t) => rs.reduce((a, x) => a + x[t], 0) / rs.length);
  useReturns({ r, dates: m.dates.slice(1).map((x) => Date.parse(`${x}T00:00:00Z`)), unit: 'day', name: 'invented portfolio', note: 'Equal amounts in five invented companies, rebalanced daily (simulated, not real prices).' });
}
let spCache = null;
async function loadSP() {
  try {
    spCache ||= await (await fetch('../../assets/data/sp500-monthly.json')).json();
    useReturns({ r: spCache.returns, dates: spCache.months.map((m) => Date.parse(`${m}-01T00:00:00Z`)), unit: 'month', name: 'S&P 500', note: 'S&P 500 total return (price plus dividends), from Robert Shiller’s data.' });
  } catch { $('#var-note').textContent = 'The S&P 500 file didn’t load. Check your connection and choose it again.'; }
}
function readOwn(text) {
  const err = $('#var-err');
  const t = parseTable(text);
  if (t.error) { err.textContent = t.error; return; }
  const nums = t.columns.filter(isNumeric);
  if (!nums.length) { err.textContent = 'No column of numbers found.'; return; }
  const col = nums.find((c) => /adj\.?\s*close/i.test(c.name)) || nums.find((c) => /^close$/i.test(c.name.trim())) || nums[nums.length - 1];
  const dcol = t.columns.find((c) => c.type === 'date');
  let rows = col.values.map((v, i) => ({ v, d: dcol ? dcol.values[i] : i })).filter((o) => Number.isFinite(o.v));
  if (dcol) rows = rows.filter((o) => Number.isFinite(o.d)).sort((a, b) => a.d - b.d);
  const prices = $('#var-k-px').checked;
  let r, dates = null;
  if (prices) {
    if (rows.some((o) => o.v <= 0)) { err.textContent = 'Prices must be above zero. If these are returns, choose “Returns”.'; return; }
    r = rows.slice(1).map((o, i) => o.v / rows[i].v - 1);
    if (dcol) dates = rows.slice(1).map((o) => o.d);
  } else {
    r = rows.map((o) => (col.type === 'percent' ? o.v / 100 : o.v));
    if (dcol) dates = rows.map((o) => o.d);
  }
  if (r.length < 100) { err.textContent = `Only ${r.length} returns. At least 100 are needed, and a few hundred for a backtest.`; return; }
  if (r.some((v) => v <= -1)) { err.textContent = 'A return of −100% or worse was found. If these are prices, choose “Prices”.'; return; }
  const gaps = dates ? S.median(dates.slice(1).map((d, i) => d - dates[i])) / 86400000 : 1;
  err.textContent = '';
  useReturns({ r, dates, unit: gaps > 20 ? 'month' : 'day', name: 'your returns', note: `Your ${prices ? 'prices, turned into returns' : 'returns'} (column “${col.name}”).` });
}
$$('input[name="var-src"]').forEach((el) => el.addEventListener('change', () => {
  const v = $('input[name="var-src"]:checked').value;
  $('#var-own-box').hidden = v !== 'own';
  if (v === 'sim') loadSim(); else if (v === 'sp') loadSP(); else $('#var-paste').focus();
}));
$('#var-read').addEventListener('click', () => readOwn($('#var-paste').value));
$('#var-file').addEventListener('change', async (e) => {
  const f = e.target.files[0]; if (!f) return;
  if (f.size > 25 * 1024 * 1024) { $('#var-err').textContent = 'That file is over 25 MB.'; return; }
  readOwn(await f.text());
});

// ================================================================ VaR and ES
function renderVar() {
  if (!mr) return;
  const c = conf(), hz = +$('#var-h').value, value = parseFloat($('#var-value').value);
  const unit = mr.unit;
  $('#var-h-out').textContent = plural(hz, unit);
  const res = { historical: RK.historical(mr.r, c, hz), normal: RK.parametric(mr.r, c, hz), mc: RK.monteCarlo(mr.r, c, hz) };
  const money = (f) => (Number.isFinite(value) && value > 0 ? F.money(f * value) : '—');
  const hist = res.historical;
  $('#var-hero').textContent = Number.isFinite(value) && value > 0 ? F.money(hist.var * value) : F.pct(hist.var, 2);
  $('#var-hero-label').textContent = `${F.pct(c, c === 0.975 ? 1 : 0)} ${span(hz, unit)} VaR, historical: losses beyond this on ${F.pct(1 - c, 1)} of ${hz === 1 ? `${unit}s` : `${span(hz, unit)} periods`}`;
  $('#var-table').replaceChildren(h('caption', { class: 'visually-hidden' }, 'Value at Risk and Expected Shortfall by method'),
    h('thead', {}, h('tr', {}, ['Method', 'VaR', 'VaR, % of value', 'Expected Shortfall', 'ES, % of value'].map((x, i) => h('th', { scope: 'col', class: i ? 'is-num' : '' }, x)))),
    h('tbody', {}, METHODS.map((m) => h('tr', {}, h('th', { scope: 'row' }, h('span', { class: 'flow-key' }, h('i', { class: `legend-key is-line ${m.cls}` }), m.name)),
      h('td', { class: 'is-num' }, money(res[m.key].var)), h('td', { class: 'is-num' }, F.pct(res[m.key].var, 2)),
      h('td', { class: 'is-num' }, money(res[m.key].es)), h('td', { class: 'is-num' }, F.pct(res[m.key].es, 2))))));
  const vbox = $('#var-verdict'); vbox.replaceChildren();
  const kurt = S.kurtosis(mr.r), gap = hist.var / res.normal.var - 1;
  if (gap > 0.08) vbox.append(verdict('warn', `The normal model understates the risk by ${F.pct(gap, 0)}.`, `It puts VaR at ${money(res.normal.var)}; the returns themselves say ${money(hist.var)}. Their tails are fat (excess kurtosis ${F.num(kurt, 1)}; a normal curve has 0), so extreme ${unit}s come more often than the bell curve allows.`));
  else if (gap < -0.08) vbox.append(verdict('warn', `Here the normal model is the more cautious one, by ${F.pct(-gap, 0)}.`, `At this confidence level the sample’s own tail is thinner than a normal curve with the same volatility. Look at Expected Shortfall too.`));
  else vbox.append(verdict('good', 'The three methods roughly agree.', `Within ${F.pct(Math.abs(gap), 0)} of each other on VaR at this confidence level.`));
  vbox.append(h('p', { class: 'note' }, `On the ${F.pct(1 - c, 1)} of ${unit}s that break VaR, the historical average loss is ${money(hist.es)}, ${F.num(hist.es / hist.var, 2)}× VaR. That gap is why the Basel rules moved bank capital from VaR to Expected Shortfall (at 97.5%) in 2016.`));
  // the distribution, one period
  const one = { historical: RK.historical(mr.r, c, 1).var, normal: RK.parametric(mr.r, c, 1).var, mc: hz === 1 ? res.mc.var : RK.monteCarlo(mr.r, c, 1).var };
  const { bins } = S.histogram(mr.r, 60);
  $('#var-hist-title').textContent = `Distribution of ${ly(unit)} returns, with one-${unit} VaR`;
  const fr = histogramChart($('#var-hist'), { bins, height: 260, xLabel: `${unit === 'day' ? 'Daily' : 'Monthly'} return`, format: (v) => F.pct(v, Math.abs(v) < 0.1 ? 1 : 0), label: `Histogram of ${ly(unit)} returns with VaR lines` });
  $$('#var-hist path.mark').forEach((el) => { el.classList.remove('m-accent'); el.classList.add('m-muted'); });
  const x = lin(bins[0].x0, bins[bins.length - 1].x1, 0, fr.iw);
  const order = METHODS.slice().sort((a, b) => one[b.key] - one[a.key]);
  order.forEach((m, k) => {
    const xv = x(-one[m.key]);
    fr.g.append(s('line', { x1: xv, x2: xv, y1: -2, y2: fr.ih, class: `vline ${m.cls}` }),
      s('text', { x: xv - 6, y: 10 + k * 15, 'text-anchor': 'end', class: 'pt-label' }, `${m.short} ${F.pct(-one[m.key], 1)}`));
  });
  fr.svg.setAttribute('aria-label', `Histogram of ${ly(unit)} returns. One-${unit} VaR as a return: ${METHODS.map((m) => `${m.short} ${F.pct(-one[m.key], 2)}`).join(', ')}.`);
}

// ================================================================ backtest
let btCache = null;
function renderBacktest() {
  if (!mr) return;
  const c = conf(), p = 1 - c;
  const w = +($('input[name="bt-w"]:checked')?.value || 250);
  const method = $('input[name="bt-m"]:checked').value;
  const key = `${mr.name}|${mr.r.length}|${c}|${w}`;
  if (!btCache || btCache.key !== key) btCache = { key, runs: Object.fromEntries(BT_METHODS.map((m) => [m.key, RK.backtest(mr.r, c, { method: m.key, window: w })])) };
  const runs = btCache.runs;
  const tests = (b) => ({ k: RK.kupiec(b.exceptions, b.n, p), ch: RK.christoffersen(b.hit, p), tl: RK.trafficLight(b.exceptions, b.n, p) });
  const b = runs[method], T = tests(b);
  const zoneChip = (z) => h('span', { class: `zone-chip is-${z}` }, { green: 'Green', yellow: 'Yellow', red: 'Red' }[z]);
  const unit = mr.unit;
  $('#bt-stats').replaceChildren(
    h('div', { class: 'stat' }, h('dt', {}, 'Breaks'), h('dd', { class: 'num' }, `${b.exceptions} of ${F.int(b.n)}`), h('dd', { class: 'stat-sub' }, `expected about ${F.num(b.n * p, 0)} (${F.pct(p, 1)})`)),
    h('div', { class: 'stat' }, h('dt', {}, 'Kupiec p-value'), h('dd', { class: 'num' }, F.pValue(T.k.p)), h('dd', { class: 'stat-sub' }, 'is the break rate right?')),
    h('div', { class: 'stat' }, h('dt', {}, 'Christoffersen p-value'), h('dd', { class: 'num' }, F.pValue(T.ch.pInd)), h('dd', { class: 'stat-sub' }, 'are breaks independent?')),
    h('div', { class: 'stat' }, h('dt', {}, 'Traffic light'), h('dd', {}, zoneChip(T.tl.zone)), h('dd', { class: 'stat-sub' }, `binomial probability ${F.pct(T.tl.cum, 2)}`)),
  );
  const vbox = $('#bt-verdict'); vbox.replaceChildren();
  const many = b.exceptions > b.n * p;
  const failsPof = T.k.p < 0.05, failsInd = T.ch.pInd < 0.05;
  if (!failsPof && !failsInd) vbox.append(verdict('good', 'The model passes both tests.', `${b.exceptions} breaks against about ${F.num(b.n * p, 0)} expected, and no sign that they bunch together (p-values ${F.pValue(T.k.p)} and ${F.pValue(T.ch.pInd)}).`));
  else {
    const parts = [];
    if (failsPof) parts.push(many ? `Too many breaks: ${b.exceptions} against about ${F.num(b.n * p, 0)} expected, so the VaR has been too low.` : `Too few breaks: ${b.exceptions} against about ${F.num(b.n * p, 0)} expected, so the VaR has been needlessly high.`);
    if (failsInd) parts.push(`Breaks bunch together: after a break, the chance of another the next ${unit} was ${F.pct(T.ch.afterException, 0)}, against ${F.pct(T.ch.afterQuiet, 1)} after a quiet ${unit}. The model is slow to notice that the market has turned stormy.`);
    vbox.append(verdict('bad', `The model fails ${failsPof && failsInd ? 'both tests' : failsPof ? 'on the number of breaks' : 'on independence'}.`, parts.join(' ')));
  }
  if (method !== 'ewma' && failsInd) vbox.append(h('p', { class: 'note' }, 'A fixed window weights a calm day a year ago as much as yesterday. The EWMA method lets recent days count more, so its VaR rises quickly when volatility does; compare it in the table below.'));
  // chart
  const xs = mr.dates ? b.at.map((t) => mr.dates[t]) : b.at.map((t) => t + 1);
  const ret = b.at.map((t) => mr.r[t]), thr = b.var.map((v) => -v);
  $('#bt-chart-title').textContent = `${unit === 'day' ? 'Daily' : 'Monthly'} returns against the ${F.pct(c, c === 0.975 ? 1 : 0)} VaR forecast (${BT_METHODS.find((m) => m.key === method).name})`;
  const dateFmt = (ms) => (mr.dates ? new Date(ms).toLocaleDateString('en-GB', { day: unit === 'day' ? 'numeric' : undefined, month: 'short', year: 'numeric', timeZone: 'UTC' }) : `#${ms}`);
  let ticks;
  if (mr.dates) { const y0 = new Date(xs[0]).getUTCFullYear(), y1 = new Date(xs[xs.length - 1]).getUTCFullYear(), span = y1 - y0, every = span > 40 ? 10 : span > 16 ? 5 : span > 6 ? 2 : 1; ticks = []; for (let y = Math.ceil(y0 / every) * every; y <= y1; y += every) { const t0 = Date.UTC(y, 0, 1); if (t0 >= xs[0] && t0 <= xs[xs.length - 1]) ticks.push(t0); } }
  const fr = lineChart($('#bt-chart'), {
    xs, xTicks: ticks, xFormat: mr.dates ? (v) => (ticks && ticks.includes(v) ? String(new Date(v).getUTCFullYear()) : dateFmt(v)) : (v) => F.int(v), yFormat: (v) => F.pct(v, Math.abs(v) < 0.1 ? 1 : 0),
    height: 280, endLabels: false, label: `Returns and VaR threshold; ${b.exceptions} breaks`,
    series: [{ name: `${unit === 'day' ? 'Daily' : 'Monthly'} return`, values: ret, cls: 'm-muted is-thin' }, { name: 'VaR threshold', values: thr, cls: 'm-s1' }],
  });
  b.hit.forEach((hit, i) => { if (hit) fr.g.append(s('circle', { cx: fr.x(xs[i]), cy: fr.y(ret[i]), r: 4, class: 'dot dot-hit' })); });
  $('#bt-chart .legend').append(h('li', {}, h('i', { class: 'legend-key m-neg', style: { borderRadius: '50%' } }), 'Break'));
  // all methods
  $('#bt-table').replaceChildren(h('table', { class: 'data-table' }, h('caption', { class: 'visually-hidden' }, 'Backtest of all three methods'),
    h('thead', {}, h('tr', {}, ['Method', 'Breaks', 'Expected', 'Break rate', 'Kupiec p', 'Christoffersen p', 'Traffic light'].map((x, i) => h('th', { scope: 'col', class: i ? 'is-num' : '' }, x)))),
    h('tbody', {}, BT_METHODS.map((m) => { const r = runs[m.key], q = tests(r); return h('tr', { class: m.key === method ? 'is-strong' : '' }, h('th', { scope: 'row' }, m.name),
      [F.int(r.exceptions), F.num(r.n * p, 1), F.pct(r.exceptions / r.n, 2), F.pValue(q.k.p), F.pValue(q.ch.pInd)].map((v) => h('td', { class: 'is-num' }, v)), h('td', { class: 'is-num' }, zoneChip(q.tl.zone))); }))));
}

$('#var-form').addEventListener('input', debounce(() => { renderVar(); }, 80));
$$('input[name="var-conf"]').forEach((el) => el.addEventListener('change', () => { renderVar(); if (ready.bt) renderBacktest(); }));
$('#bt-windows').addEventListener('change', renderBacktest);
$$('input[name="bt-m"]').forEach((el) => el.addEventListener('change', renderBacktest));

// ================================================================ stress scenarios
const SCENARIOS = [
  { key: 'crash', name: 'Equity crash', eq: -35, r: -100, sp: 150, fx: 8, co: -25 },
  { key: 'rates', name: 'Rates jump', eq: -10, r: 200, sp: 50, fx: -3, co: 0 },
  { key: 'stag', name: 'Stagflation', eq: -20, r: 150, sp: 100, fx: -5, co: 35 },
  { key: 'credit', name: 'Credit crunch', eq: -25, r: -50, sp: 300, fx: 5, co: -15 },
];
const SL = [['st-s-eq', 'eq', (v) => F.signed(v, 0) + '%'], ['st-s-r', 'r', (v) => `${F.signed(v, 0)} bp`], ['st-s-s', 'sp', (v) => `${F.signed(v, 0)} bp`], ['st-s-fx', 'fx', (v) => F.signed(v, 0) + '%'], ['st-s-co', 'co', (v) => F.signed(v, 0) + '%']];
$('#st-scn').replaceChildren(...SCENARIOS.map((x) => h('option', { value: x.key }, x.name)), h('option', { value: 'own' }, 'Your own'));
function setScenario(key) {
  const sc = SCENARIOS.find((x) => x.key === key); if (!sc) return;
  SL.forEach(([id, k]) => { $(`#${id}`).value = sc[k]; });
  syncRanges($('#st-form')); renderStress();
}
const shockOf = (sc) => ({ equity: sc.eq / 100, rates: sc.r, spreads: sc.sp, fx: sc.fx / 100, commodity: sc.co / 100 });
const readBook = () => {
  const v = (id) => parseFloat($(`#${id}`).value);
  return { equity: v('st-eq'), govt: { value: v('st-gv'), duration: v('st-gd'), convexity: v('st-gc') }, corp: { value: v('st-cv'), duration: v('st-cd'), convexity: v('st-cc') }, fx: v('st-fx'), commodity: v('st-co') };
};
function renderStress() {
  const cur = Object.fromEntries(SL.map(([id, k, fmt]) => { const v = +$(`#${id}`).value; $(`#${id}-out`).textContent = fmt(v); return [k, v]; }));
  const match = SCENARIOS.find((x) => SL.every(([, k]) => x[k] === cur[k]));
  $('#st-scn').value = match ? match.key : 'own';
  const book = readBook();
  const flat = [book.equity, book.govt.value, book.govt.duration, book.govt.convexity, book.corp.value, book.corp.duration, book.corp.convexity, book.fx, book.commodity];
  const vbox = $('#st-verdict'); vbox.replaceChildren();
  if (!flat.every(Number.isFinite)) { $('#st-hero').textContent = '—'; vbox.append(verdict('warn', 'Waiting for numbers.', 'Fill in every position (use 0 for none).')); return; }
  const r = RK.stress(book, shockOf(cur));
  const name = match ? match.name : 'Your scenario';
  $('#st-hero').textContent = `${r.total < 0 ? '−' : '+'}$${F.num(Math.abs(r.total), 1)}m`;
  $('#st-hero-label').textContent = `${name}: ${F.pct(r.pct, 1)} of a $${F.num(r.value, 0)}m portfolio`;
  const worst = r.lines.slice().sort((a, b) => a.pnl - b.pnl)[0], best = r.lines.slice().sort((a, b) => b.pnl - a.pnl)[0];
  vbox.append(h('p', { class: 'note' }, `${worst.pnl < 0 ? `${worst.name} lose the most (${F.money(worst.pnl, { digits: 1 })}m).` : 'Nothing loses money in this scenario.'}${best.pnl > 0 ? ` ${best.name} cushion the blow (+${F.money(best.pnl, { digits: 1 })}m), the diversification a stress test should reveal.` : ' No position gains, so diversification doesn’t help here.'}`));
  barChart($('#st-chart'), { categories: r.lines.map((l) => l.name), horizontal: true, legend: false, valueLabels: true, height: 200, series: [{ name: 'Profit or loss', values: r.lines.map((l) => l.pnl), cls: 'm-s1' }], format: (v) => `${v < 0 ? '−' : ''}$${F.num(Math.abs(v), 1)}m`, label: `Profit and loss by position under ${name}`, margin: { l: 170, r: 64 } });
  $$('#st-chart path.mark').forEach((el, k) => { el.classList.remove('m-s1'); el.classList.add(r.lines[k].pnl < 0 ? 'm-neg' : 'm-pos'); });
  $('#st-table').replaceChildren();
  tableTwin($('#st-table'), { caption: 'Stress P&L by position', columns: [{ label: 'Position' }, { label: 'Value ($m)', num: true }, { label: 'P&L ($m)', num: true }, { label: 'Change', num: true }],
    rows: [...r.lines.map((l) => [l.name, F.num(l.value, 1), F.signed(l.pnl, 2), l.value ? F.pct(l.pnl / l.value, 1) : '—']), ['Total', F.num(r.value, 1), F.signed(r.total, 2), F.pct(r.pct, 1)]] });
  const all = [...SCENARIOS, ...(match ? [] : [{ key: 'own', name: 'Your scenario', ...cur }])];
  $('#st-all').replaceChildren(h('table', { class: 'data-table' }, h('caption', { class: 'visually-hidden' }, 'Every scenario on this portfolio ($m)'),
    h('thead', {}, h('tr', {}, ['Scenario', 'Shares', 'Govt bonds', 'Corp. bonds', 'FX', 'Commodities', 'Total', '% of portfolio'].map((x, i) => h('th', { scope: 'col', class: i ? 'is-num' : '' }, x)))),
    h('tbody', {}, all.map((sc) => { const q = RK.stress(book, shockOf(sc)); return h('tr', { class: (match ? sc.key === match.key : sc.key === 'own') ? 'is-strong' : '' }, h('th', { scope: 'row' }, sc.name),
      [...q.lines.map((l) => F.signed(l.pnl, 1)), F.signed(q.total, 1), F.pct(q.pct, 1)].map((v) => h('td', { class: 'is-num' }, v))); }))));
}
$('#st-scn').addEventListener('change', (e) => { if (e.target.value !== 'own') setScenario(e.target.value); });
$('#st-form').addEventListener('input', (e) => { if (e.target.id !== 'st-scn') renderStress(); });

// ================================================================ Altman Z
export const Z_MODELS = {
  z: { label: 'Z', name: 'Public manufacturer (Z, 1968)', coef: [1.2, 1.4, 3.3, 0.6, 1.0], equity: 'market', cut: [1.81, 2.99], range: [-1, 5] },
  zp: { label: 'Z′', name: 'Private manufacturer (Z′)', coef: [0.717, 0.847, 3.107, 0.42, 0.998], equity: 'book', cut: [1.23, 2.9], range: [-1, 5] },
  zpp: { label: 'Z″', name: 'Non-manufacturer (Z″)', coef: [6.56, 3.26, 6.72, 1.05, 0], equity: 'book', cut: [1.1, 2.6], range: [-3, 8] },
};
const PARTS = ['Working capital / total assets', 'Retained earnings / total assets', 'EBIT / total assets', 'Equity / total liabilities', 'Sales / total assets'];
export function altman(model, d) {
  const m = Z_MODELS[model];
  const eq = m.equity === 'market' ? d.mve : d.bve;
  const need = [d.ca, d.cl, d.ta, d.tl, d.re, d.ebit, eq].concat(m.coef[4] ? [d.sales] : []);
  if (!need.every(Number.isFinite)) return { error: 'Fill in every field to see the score.' };
  if (d.ta <= 0) return { error: 'Total assets must be above zero.' };
  if (d.tl <= 0) return { error: 'Total liabilities must be above zero (the equity ratio divides by them).' };
  const x = [(d.ca - d.cl) / d.ta, d.re / d.ta, d.ebit / d.ta, eq / d.tl, (d.sales || 0) / d.ta];
  const contrib = x.map((v, i) => v * m.coef[i]);
  const z = contrib.reduce((a, b) => a + b, 0);
  const zone = z < m.cut[0] ? 'distress' : z > m.cut[1] ? 'safe' : 'grey';
  return { x, contrib, z, zone, m };
}
const PRESETS = {
  steady: { model: 'z', ca: 420, cl: 210, ta: 1000, tl: 450, re: 380, ebit: 135, sales: 1150, mve: 980, bve: 550 },
  stretched: { model: 'zpp', ca: 310, cl: 360, ta: 900, tl: 760, re: 40, ebit: 18, sales: 1500, mve: 120, bve: 140 },
};
const zForm = $('#z-form');
function loadPreset(key) {
  const p = PRESETS[key];
  $(`#m-${p.model}`).checked = true;
  ['ca', 'cl', 'ta', 'tl', 're', 'ebit', 'sales', 'mve', 'bve'].forEach((k) => { $(`#${k}`).value = p[k]; });
  renderZ();
}
function renderZ() {
  const model = zForm.querySelector('input[name="model"]:checked').value;
  const m = Z_MODELS[model];
  $('#mve-field').hidden = m.equity !== 'market';
  $('#bve-field').hidden = m.equity !== 'book';
  $('#sales-field').hidden = !m.coef[4];
  const d = Object.fromEntries(['ca', 'cl', 'ta', 'tl', 're', 'ebit', 'sales', 'mve', 'bve'].map((k) => [k, parseFloat($(`#${k}`).value)]));
  const r = altman(model, d);
  const vbox = $('#z-verdict');
  vbox.replaceChildren();
  $('#z-name').textContent = m.name;
  if (r.error) {
    $('#z-score').textContent = '—';
    vbox.append(verdict('warn', 'Waiting for numbers.', r.error));
    $('#z-scale').replaceChildren(); $('#z-chart').replaceChildren(); $('#z-table').replaceChildren();
    return;
  }
  $('#z-score').textContent = `${m.label} = ${F.num(r.z, 2)}`;
  const zoneText = {
    safe: ['good', 'Safe zone.', `Above ${F.num(m.cut[1], 2)}: firms like this rarely failed within two years in Altman’s samples.`],
    grey: ['warn', 'Grey zone.', `Between ${F.num(m.cut[0], 2)} and ${F.num(m.cut[1], 2)}: the model can’t call it. Look closer at liquidity and profitability.`],
    distress: ['bad', 'Distress zone.', `Below ${F.num(m.cut[0], 2)}: the profile matches companies that went bankrupt in Altman’s samples.`],
  }[r.zone];
  vbox.append(verdict(...zoneText));
  const used = PARTS.map((p, i) => ({ p, i })).filter(({ i }) => m.coef[i]);
  const order = [...used].sort((a, b) => Math.abs(r.contrib[b.i]) - Math.abs(r.contrib[a.i]));
  const top = order[0], neg = used.filter(({ i }) => r.contrib[i] < 0);
  const expl = h('p', { class: 'note' }, `${top.p} contributes the most (${F.signed(r.contrib[top.i], 2)}).`, neg.length ? ` ${neg.map((n) => n.p).join(' and ')} ${neg.length > 1 ? 'are' : 'is'} negative, pulling the score down.` : '');
  vbox.append(expl);
  renderScale(r);
  barChart($('#z-chart'), {
    categories: used.map(({ p }) => p), horizontal: true, height: 200, label: 'Contribution of each ratio to the Z-score', legend: false, valueLabels: true,
    series: [{ name: 'Contribution', values: used.map(({ i }) => r.contrib[i]), cls: 'm-s1' }], format: (v) => F.num(v, 2), margin: { l: 210, r: 48 },
  });
  // colour each bar by sign (polarity): cool for positive, warm for negative
  $$('#z-chart path.mark').forEach((p, k) => { p.classList.remove('m-s1'); p.classList.add(r.contrib[used[k].i] < 0 ? 'm-neg' : 'm-pos'); });
  $('#z-table').replaceChildren();
  tableTwin($('#z-table'), {
    caption: 'Z-score components',
    columns: [{ label: 'Ratio' }, { label: 'Value', num: true }, { label: 'Weight', num: true }, { label: 'Contribution', num: true }],
    rows: [...used.map(({ p, i }) => [p, F.num(r.x[i], 3), F.num(m.coef[i], 3), F.signed(r.contrib[i], 3)]), [`${m.label}-score`, '', '', F.num(r.z, 3)]],
  });
}

function renderScale(r) {
  const box = $('#z-scale');
  box.replaceChildren();
  const [lo, hi] = r.m.range;
  const W = Math.max(260, box.clientWidth), H = 84, pad = 16;
  const x = (v) => pad + ((Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo)) * (W - pad * 2);
  const svg = s('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Score ${F.num(r.z, 2)}, ${r.zone} zone; cut-offs at ${r.m.cut[0]} and ${r.m.cut[1]}`, class: 'chart-svg' });
  const y = 30, bh = 24;
  svg.append(
    s('rect', { x: x(lo), y, width: x(r.m.cut[0]) - x(lo) - 1, height: bh, rx: 4, class: 'zone zone-bad' }),
    s('rect', { x: x(r.m.cut[0]) + 1, y, width: x(r.m.cut[1]) - x(r.m.cut[0]) - 2, height: bh, class: 'zone zone-warn' }),
    s('rect', { x: x(r.m.cut[1]) + 1, y, width: x(hi) - x(r.m.cut[1]) - 1, height: bh, rx: 4, class: 'zone zone-good' }),
  );
  const zones = [['Distress', lo, r.m.cut[0]], ['Grey', r.m.cut[0], r.m.cut[1]], ['Safe', r.m.cut[1], hi]];
  zones.forEach(([t, a, b]) => { if (x(b) - x(a) > 48) svg.append(s('text', { x: (x(a) + x(b)) / 2, y: y + bh / 2 + 4, 'text-anchor': 'middle', class: 'zone-name' }, t)); });
  r.m.cut.forEach((c) => svg.append(s('text', { x: x(c), y: y + bh + 16, 'text-anchor': 'middle', class: 'tick' }, F.num(c, 2))));
  const mx = x(r.z);
  const off = r.z < lo || r.z > hi;
  svg.append(s('line', { x1: mx, x2: mx, y1: y - 6, y2: y + bh + 3, class: 'zone-marker-line' }), s('path', { d: `M${mx},${y - 4}l-6,-8h12z`, class: 'zone-marker' }));
  const label = `${r.m.label} ${F.num(r.z, 2)}${off ? ' (off scale)' : ''}`;
  const anchor = mx < 70 ? 'start' : mx > W - 70 ? 'end' : 'middle';
  svg.append(s('text', { x: mx, y: y - 16, 'text-anchor': anchor, class: 'zone-score' }, label));
  box.append(svg);
}

zForm.addEventListener('input', renderZ);
zForm.addEventListener('change', renderZ);
$$('[data-preset]').forEach((b) => b.addEventListener('click', () => loadPreset(b.dataset.preset)));
loadPreset('steady');
onResize($('#z-chart'), renderZ);

afterPaint().then(() => { loadSim(); syncRanges(); });
whenNear($('#stress'), () => { ready.st = true; setScenario('crash'); });
onResize($('#var-hist'), debounce(() => { renderVar(); if (ready.bt) renderBacktest(); if (ready.st) renderStress(); }, 150));

