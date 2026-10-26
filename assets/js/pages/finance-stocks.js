// finance-stocks.js — stock analysis: return and risk, CAPM beta and alpha, and the long-only efficient frontier.
import { initSite, syncRanges } from '../core/site.js?v=18';
import { $, $$, h, s, onResize, debounce } from '../core/dom.js?v=18';
import * as F from '../core/format.js?v=18';
import { lineChart, barChart, scatter, tableTwin } from '../core/charts.js?v=18';
import { verdict, fillSelect, chips, checkedIn, whenNear, afterPaint } from '../core/ui.js?v=18';
import { parseTable, isNumeric } from '../core/csv.js?v=18';
import { simulatedMarket } from '../core/finsim.js?v=18';
import { returns, riskReturn, drawdowns, sma, capm, rollingBeta, moments, minVariance, maxSharpe, frontier, portRet, portVar } from '../core/portfolio.js?v=18';

initSite();

const DAYMS = 86400000;
let data = null;      // { dates: ms[], series: [{ name, prices, r }], note }
const rf = () => +$('#px-rf').value / 100;

// ---------------------------------------------------------------- loading prices
function useData(d) {
  const series = d.series.map((x) => ({ ...x, r: returns(x.prices) }));
  data = { ...d, series };
  const names = series.map((x) => x.name);
  const guess = series.find((x) => x.isMarket) || series.find((x) => /index|market|s&p|spx|\^|msci|ftse|nasdaq|dow/i.test(x.name)) || series[series.length - 1];
  fillSelect($('#px-market'), names, guess.name);
  const firstStock = names.find((n) => n !== guess.name) || names[0];
  fillSelect($('#rt-stock'), names, firstStock);
  fillSelect($('#cp-stock'), names.filter((n) => n !== guess.name).length ? names.filter((n) => n !== guess.name) : names, firstStock);
  $('#px-note').textContent = `${d.note} ${F.int(d.dates.length)} trading days, ${F.date(d.dates[0])} to ${F.date(d.dates[d.dates.length - 1])}.`;
  renderAssetsChips();
  renderAll();
}
function loadSim() {
  const m = simulatedMarket({ seed: 230 });
  useData({ dates: m.dates.map((x) => Date.parse(`${x}T00:00:00Z`)), series: m.series, note: 'Simulated prices for invented companies (not real shares).' });
}

/** One parsed table → series. A file with an (Adj) Close column becomes one series named `fallback`. */
function seriesFromTable(t, fallback) {
  const dateCol = t.columns.find((c) => c.type === 'date');
  if (!dateCol) return { error: 'No date column found. The first column should hold dates such as 2025-01-31.' };
  const nums = t.columns.filter(isNumeric);
  const adj = nums.find((c) => /adj\.?\s*close/i.test(c.name)) || nums.find((c) => /^close$/i.test(c.name.trim()));
  const pick = adj ? [{ ...adj, name: fallback }] : nums.filter((c) => !/volume/i.test(c.name));
  if (!pick.length) return { error: 'No price columns found.' };
  return { dates: dateCol.values, cols: pick.map((c) => ({ name: c.name, values: c.values })) };
}
/** Line several tables up on the dates they share, dropping any date with a missing or non-positive price. */
function merge(parts) {
  const maps = parts.flatMap((p) => p.cols.map((c) => ({ name: c.name, m: new Map(p.dates.map((d, i) => [d, c.values[i]])) })));
  const seen = new Map(); maps.forEach((m) => { const k = seen.get(m.name) || 0; seen.set(m.name, k + 1); if (k) m.name = `${m.name} (${k + 1})`; });
  const all = [...new Set(parts.flatMap((p) => p.dates))].filter(Number.isFinite).sort((a, b) => a - b);
  const keep = all.filter((d) => maps.every((m) => m.m.get(d) > 0));
  return { dates: keep, series: maps.map((m) => ({ name: m.name, prices: keep.map((d) => m.m.get(d)) })), dropped: all.length - keep.length };
}
function deliverOwn(parts) {
  const err = $('#px-err');
  const bad = parts.find((p) => p.error);
  if (bad) { err.textContent = bad.error; return; }
  const m = merge(parts);
  if (m.series.length < 2) { err.textContent = 'Add at least two price series: a share and a market index.'; return; }
  if (m.dates.length < 60) { err.textContent = `Only ${m.dates.length} dates have a price for every series. At least 60 are needed; check the files cover the same period.`; return; }
  if (m.series.length > 12) { err.textContent = 'Up to 12 price series at once.'; return; }
  err.textContent = '';
  useData({ dates: m.dates, series: m.series, note: `Your prices${m.dropped ? ` (${m.dropped} dates without a price for every series were left out)` : ''}.` });
}
$('#px-read').addEventListener('click', () => {
  const t = parseTable($('#px-paste').value);
  if (t.error) { $('#px-err').textContent = t.error; return; }
  deliverOwn([seriesFromTable(t, 'Your share')]);
});
$('#px-file').addEventListener('change', async (e) => {
  const files = [...e.target.files];
  if (!files.length) return;
  if (files.some((f) => f.size > 25 * 1024 * 1024)) { $('#px-err').textContent = 'One of the files is over 25 MB.'; return; }
  const parts = [];
  for (const f of files) {
    const t = parseTable(await f.text());
    parts.push(t.error ? { error: `${f.name}: ${t.error}` } : seriesFromTable(t, f.name.replace(/\.[^.]+$/, '')));
  }
  deliverOwn(parts);
});
$$('input[name="px-src"]').forEach((r) => r.addEventListener('change', () => {
  const own = $('#px-own').checked;
  $('#px-own-box').hidden = !own;
  if (own) $('#px-paste').focus(); else loadSim();
}));

// ---------------------------------------------------------------- shared helpers
const byName = (n) => data.series.find((x) => x.name === n);
const market = () => byName($('#px-market').value);
const yearTicks = (xs) => {
  const lo = xs[0], hi = xs[xs.length - 1], out = [];
  const y0 = new Date(lo).getUTCFullYear(), y1 = new Date(hi).getUTCFullYear();
  const span = (hi - lo) / (365.25 * DAYMS);
  const every = span > 12 ? 5 : span > 6 ? 2 : 1;
  for (let y = y0; y <= y1 + 1; y++) { const t = Date.UTC(y, 0, 1); if (t >= lo && t <= hi && y % every === 0) out.push(t); }
  if (out.length < 2 && span <= 2.5) for (let y = y0; y <= y1; y++) for (const mth of [3, 6, 9]) { const t = Date.UTC(y, mth, 1); if (t >= lo && t <= hi) out.push(t); }
  return out.sort((a, b) => a - b);
};
const dateFmt = (ms) => { const d = new Date(ms); return d.getUTCMonth() === 0 && d.getUTCDate() === 1 ? String(d.getUTCFullYear()) : d.getUTCDate() === 1 ? d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' }) : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }); };
const stat = (label, value, sub) => h('div', { class: 'stat' }, h('dt', {}, label), h('dd', { class: 'num' }, value), sub ? h('dd', { class: 'stat-sub' }, sub) : '');

// beta and the frontier render when they come near the viewport
const ready = { capm: false, frontier: false };
const lazy = (key, id, fn) => { if (ready[key]) { fn(); return; } if (lazy[key]) return; lazy[key] = true; whenNear($(id), () => { ready[key] = true; fn(); }); };
function renderAll() {
  $('#px-rf-out').textContent = F.pct(rf(), 2);
  renderReturns(); lazy('capm', '#capm', renderCapm); lazy('frontier', '#frontier', renderFrontier);
}

// ---------------------------------------------------------------- return and risk
function renderReturns() {
  const x = byName($('#rt-stock').value), mk = market();
  const rs = riskReturn(x.r, { rf: rf() }), dd = drawdowns(x.prices);
  const recovered = dd.recovery >= 0 ? `recovered ${F.date(data.dates[dd.recovery])}` : 'not yet recovered';
  $('#rt-stats').replaceChildren(
    stat('Annual return', F.pct(rs.annMean, 1), `growth rate ${F.pct(rs.cagr, 1)} a year`),
    stat('Volatility', F.pct(rs.vol, 1), 'standard deviation, per year'),
    stat('Sharpe ratio', F.num(rs.sharpe, 2), `Sortino ${F.num(rs.sortino, 2)}`),
    stat('Maximum drawdown', F.pct(dd.max, 1), `${F.date(data.dates[dd.peak])} to ${F.date(data.dates[dd.trough])}, ${recovered}`),
  );
  const vbox = $('#rt-verdict'); vbox.replaceChildren();
  if (mk && mk !== x) {
    const m = riskReturn(mk.r, { rf: rf() });
    const better = rs.sharpe > m.sharpe;
    vbox.append(h('p', { class: 'note' }, `${x.name} returned ${F.pct(rs.annMean, 1)} a year against ${F.pct(m.annMean, 1)} for ${mk.name}, with ${F.num(rs.vol / m.vol, 1)}× its volatility. Per unit of risk it did ${better ? 'better' : 'worse'} (Sharpe ${F.num(rs.sharpe, 2)} against ${F.num(m.sharpe, 2)}).`,
      rs.kurt > 1 ? ` Its daily returns have fat tails (excess kurtosis ${F.num(rs.kurt, 1)}): extreme days come more often than a normal curve predicts.` : ''));
  }
  const xs = data.dates, ticks = yearTicks(xs);
  const growth = [{ name: x.name, values: x.prices.map((p) => (100 * p) / x.prices[0]), cls: 'm-s1' }];
  if (mk && mk !== x) growth.push({ name: mk.name, values: mk.prices.map((p) => (100 * p) / mk.prices[0]), cls: 'm-s2' });
  $('#rt-growth-title').textContent = `Growth of $100 in ${x.name}${mk && mk !== x ? ` and ${mk.name}` : ''}`;
  lineChart($('#rt-growth'), { xs, series: growth, height: 260, xFormat: dateFmt, xTicks: ticks, yFormat: (v) => F.money(v), label: `Growth of $100 invested in ${x.name}`, endLabels: false });
  lineChart($('#rt-ma'), {
    xs, xTicks: ticks, xFormat: dateFmt, yFormat: (v) => F.money(v, { digits: v < 10 ? 2 : 0 }), height: 260, endLabels: false, label: `${x.name} price with moving averages`,
    series: [{ name: 'Price', values: x.prices, cls: 'm-s1' }, { name: '50-day average', values: sma(x.prices, 50), cls: 'm-s2' }, { name: '200-day average', values: sma(x.prices, 200), cls: 'm-s3' }],
  });
  const fr = lineChart($('#rt-dd'), { xs, xTicks: ticks, xFormat: dateFmt, yFormat: (v) => F.pct(v, 0), height: 200, endLabels: false, label: `${x.name} drawdown`, series: [{ name: 'Below the peak', values: dd.series, cls: 'm-neg' }], band: { lo: dd.series, hi: dd.series.map(() => 0), cls: 'm-neg' } });
  fr.g.append(s('circle', { cx: fr.x(xs[dd.trough]), cy: fr.y(dd.max), r: 5, class: 'dot m-neg' }),
    s('text', { x: fr.x(xs[dd.trough]) + (dd.trough > xs.length * 0.7 ? -8 : 8), y: fr.y(dd.max) + 4, 'text-anchor': dd.trough > xs.length * 0.7 ? 'end' : 'start', class: 'pt-label' }, `worst ${F.pct(dd.max, 1)}`));
  // all shares
  const rows = data.series.map((sr) => { const q = riskReturn(sr.r, { rf: rf() }); return { sr, q, dd: drawdowns(sr.prices).max }; });
  const cols = ['Share', 'Annual return', 'Growth rate', 'Volatility', 'Sharpe', 'Sortino', 'Max drawdown', 'Worst day', 'Best day', 'Skew', 'Excess kurtosis'];
  $('#rt-table').replaceChildren(h('table', { class: 'data-table' }, h('caption', { class: 'visually-hidden' }, 'Return and risk for every share'),
    h('thead', {}, h('tr', {}, cols.map((c, i) => h('th', { scope: 'col', class: i ? 'is-num' : '' }, c)))),
    h('tbody', {}, rows.map(({ sr, q, dd: d }) => h('tr', { class: sr === x ? 'is-strong' : '' }, h('th', { scope: 'row' }, sr.name),
      [F.pct(q.annMean, 1), F.pct(q.cagr, 1), F.pct(q.vol, 1), F.num(q.sharpe, 2), F.num(q.sortino, 2), F.pct(d, 1), F.pct(q.worst, 1), F.pct(q.best, 1), F.num(q.skew, 2), F.num(q.kurt, 1)].map((v) => h('td', { class: 'is-num' }, v)))))));
}

// ---------------------------------------------------------------- CAPM
function renderCapm() {
  const x = byName($('#cp-stock').value), mk = market();
  const vbox = $('#cp-verdict'); vbox.replaceChildren();
  if (!mk || x === mk) {
    ['#cp-stats', '#cp-scatter', '#cp-roll', '#cp-table'].forEach((id) => $(id).replaceChildren());
    vbox.append(verdict('warn', 'Pick a different share.', 'Beta compares a share with the market, so the share can’t be the market itself.'));
    return;
  }
  const erp = +$('#cp-erp').value / 100;
  $('#cp-erp-out').textContent = F.pct(erp, 2);
  const c = capm(x.r, mk.r, { rf: rf() });
  if (c.error) { vbox.append(verdict('bad', 'Can’t fit the regression.', c.error)); return; }
  const b = c.beta, a = c.alpha, required = rf() + b.estimate * erp, realised = riskReturn(x.r).annMean;
  $('#cp-stats').replaceChildren(
    stat('Beta', F.num(b.estimate, 2), `95% interval ${F.num(b.low, 2)} to ${F.num(b.high, 2)}`),
    stat('Alpha, per year', F.pct(c.alphaAnnual, 1), `p = ${F.pValue(a.p)}`),
    stat('R²', F.num(c.r2, 2), `${F.pct(c.systematicShare, 0)} of the variance is market risk`),
    stat('CAPM required return', F.pct(required, 1), `realised ${F.pct(realised, 1)} a year`),
  );
  const moves = b.estimate > 1.1 ? `amplifies the market: on a day the market moves 1%, it moves about ${F.num(b.estimate, 2)}% on average` : b.estimate < 0.9 ? `is defensive: on a day the market moves 1%, it moves about ${F.num(b.estimate, 2)}% on average` : 'moves roughly one-for-one with the market';
  vbox.append(verdict(a.p < 0.05 ? (c.alphaAnnual > 0 ? 'good' : 'bad') : 'warn',
    a.p < 0.05 ? `Alpha of ${F.pct(c.alphaAnnual, 1)} a year, unlikely to be luck (p = ${F.pValue(a.p)}).` : 'No alpha you can tell apart from luck.',
    `${x.name} ${moves}. ${a.p < 0.05 ? 'It earned more than its beta explains over this period; whether that lasts is another question.' : `Its alpha of ${F.pct(c.alphaAnnual, 1)} a year has a p-value of ${F.pValue(a.p)}: daily returns are too noisy to call it skill.`} The other ${F.pct(1 - c.systematicShare, 0)} of its variance is specific to the company and could be diversified away.`));
  const per = rf() / 252;
  const pts = x.r.map((v, i) => ({ x: mk.r[i] - per, y: v - per, title: F.date(data.dates[i + 1]) }));
  $('#cp-scatter-title').textContent = `Daily excess returns: ${x.name} against ${mk.name}`;
  scatter($('#cp-scatter'), {
    points: pts.map((p) => ({ ...p, cls: 'm-light' })), height: 320, xLabel: `${mk.name}`, yLabel: x.name, xFormat: (v) => F.pct(v, 1), yFormat: (v) => F.pct(v, 1),
    curves: [{ fn: (v) => a.estimate + b.estimate * v, cls: 'm-s1', name: 'Fitted line' }], label: `Scatter of daily excess returns with a fitted line of slope ${F.num(b.estimate, 2)}`,
    legend: [{ name: 'A day', cls: 'm-light' }, { name: `Fitted line, beta ${F.num(b.estimate, 2)}`, cls: 'm-s1', shape: 'line' }],
  });
  $$('#cp-scatter circle.dot').forEach((d) => d.setAttribute('r', 3));
  const w = +$('input[name="cp-win"]:checked').value;
  if (x.r.length > w + 20) {
    const rb = rollingBeta(x.r, mk.r, w), xs = data.dates.slice(1);
    lineChart($('#cp-roll'), { xs, xTicks: yearTicks(xs), xFormat: dateFmt, yFormat: (v) => F.num(v, 2), height: 220, endLabels: false, label: `Rolling ${w}-day beta of ${x.name}`,
      series: [{ name: `Beta, trailing ${w} days`, values: rb, cls: 'm-s1' }, { name: 'Whole period', values: rb.map((v) => (Number.isFinite(v) ? b.estimate : NaN)), cls: 'm-s2' }] });
  } else $('#cp-roll').replaceChildren(h('p', { class: 'note' }, 'Not enough days for this window.'));
  $('#cp-table').replaceChildren();
  tableTwin($('#cp-table'), {
    caption: 'CAPM regression', columns: [{ label: 'Term' }, { label: 'Estimate', num: true }, { label: 'Std. error', num: true }, { label: 't', num: true }, { label: 'p-value', num: true }, { label: '95% interval', num: true }],
    rows: [['Alpha (per day)', a], ['Beta', b]].map(([n, k]) => [n, F.auto(k.estimate), F.auto(k.se), F.num(k.t, 2), F.pValue(k.p), `${F.auto(k.low)} to ${F.auto(k.high)}`]),
  });
}

// ---------------------------------------------------------------- efficient frontier
function renderAssetsChips() {
  const names = data.series.map((x) => x.name);
  const mk = $('#px-market').value;
  const prev = checkedIn($('#ef-assets'));
  const pick = prev.length >= 2 && prev.every((n) => names.includes(n)) ? prev : names.filter((n) => n !== mk).slice(0, 8);
  chips($('#ef-assets'), names, pick, 'ef', () => { limitChips(); renderFrontier(); });
  limitChips();
}
function limitChips() {
  const on = checkedIn($('#ef-assets'));
  $$('#ef-assets input').forEach((i) => { i.disabled = (!i.checked && on.length >= 8) || (i.checked && on.length <= 2); });
}
function renderFrontier() {
  const names = checkedIn($('#ef-assets'));
  const vbox = $('#ef-verdict'); vbox.replaceChildren();
  ['#ef-chart', '#ef-table', '#ef-weights', '#ef-stab'].forEach((id) => $(id).replaceChildren());
  if (names.length < 2) { vbox.append(verdict('warn', 'Pick at least two shares.', 'A frontier needs something to combine.')); return; }
  const set = names.map(byName), cols = set.map((x) => x.r);
  const { mu, cov } = moments(cols), r0 = rf();
  const fr = frontier(mu, cov, 40), ms = maxSharpe(mu, cov, r0), gmv = fr.gmv;
  const mode = $('input[name="ef-pick"]:checked').value;
  $('#ef-target-field').hidden = mode !== 'target';
  const lo = portRet(gmv, mu), hi = Math.max(...mu);
  const tgt = lo + ((hi - lo) * +$('#ef-target').value) / 100;
  $('#ef-target-out').textContent = F.pct(tgt, 1);
  let w = mode === 'gmv' ? gmv : mode === 'ms' ? ms : minVariance(mu, cov, tgt);
  if (mode === 'ms' && !ms) {
    vbox.append(verdict('warn', 'No mix beats the risk-free rate.', `Every share earned less than ${F.pct(r0, 2)} a year here, so the best Sharpe ratio is negative. Showing the least-risk mix instead.`));
    w = gmv;
  }
  const ret = portRet(w, mu), vol = Math.sqrt(portVar(w, cov)), sh = (ret - r0) / vol;
  const held = names.map((n, i) => ({ n, w: w[i] })).filter((o) => o.w > 0.0005).sort((a, b) => b.w - a.w);
  const label = { gmv: 'The least-risk mix', ms: 'The max-Sharpe mix', target: `The least-risk mix returning ${F.pct(tgt, 1)}` }[mode === 'ms' && !ms ? 'gmv' : mode];
  const bestSingle = names.map((n, i) => ({ n, sh: (mu[i] - r0) / Math.sqrt(cov[i][i]) })).sort((a, b) => b.sh - a.sh)[0];
  vbox.append(verdict('good', `${label}: ${F.pct(ret, 1)} a year at ${F.pct(vol, 1)} volatility.`,
    `It holds ${held.map((o) => `${o.n} ${F.pct(o.w, 0)}`).join(', ')}${held.length < names.length ? `, and none of the others` : ''}. Sharpe ratio ${F.num(sh, 2)}, against ${F.num(bestSingle.sh, 2)} for the best single share (${bestSingle.n}).`));
  // chart
  const vols = names.map((_, i) => Math.sqrt(cov[i][i]));
  const xMax = Math.max(...vols, ...fr.points.map((p) => p.vol)) * 1.12;
  const yVals = [...mu, r0, ...fr.points.map((p) => p.ret)];
  const pts = [
    ...names.map((n, i) => ({ x: vols[i], y: mu[i], title: n, cls: 'm-muted', lab: n })),
    { x: Math.sqrt(portVar(gmv, cov)), y: portRet(gmv, mu), title: 'Minimum variance', cls: 'm-hollow', key: 'Least risk' },
    ...(ms ? [{ x: Math.sqrt(portVar(ms, cov)), y: portRet(ms, mu), title: 'Max Sharpe', cls: 'm-s2', key: 'Max Sharpe' }] : []),
    { x: vol, y: ret, title: `${label} (shown)`, cls: 'm-s1', lab: 'shown' },
  ];
  const curves = [{ pts: fr.points.map((p) => [p.vol, p.ret]), cls: 'm-s1', name: 'Efficient frontier' }];
  if (ms) { const slope = (portRet(ms, mu) - r0) / Math.sqrt(portVar(ms, cov)); curves.push({ fn: (v) => r0 + slope * v, cls: 'm-s2 is-dashed', name: 'Capital market line' }); }
  const ch = scatter($('#ef-chart'), {
    points: pts, curves, height: 340, xLabel: 'Volatility', yLabel: 'Annual return', xFormat: (v) => F.pct(v, 0), yFormat: (v) => F.pct(v, 0),
    xDomain: [0, xMax], yDomain: [Math.min(0, ...yVals), Math.max(...yVals) * 1.08], label: 'Efficient frontier with each share and the chosen portfolio',
    legend: [{ name: 'Efficient frontier', cls: 'm-s1', shape: 'line' }, ...(ms ? [{ name: 'Capital market line', cls: 'm-s2', shape: 'line' }] : []), { name: 'Single share', cls: 'm-muted' }, { name: 'Portfolio shown', cls: 'm-s1' }],
  });
  pts.forEach((p) => {
    if (p.lab && p.lab !== 'shown') { const right = ch.x(p.x) > ch.iw - 110; ch.g.append(s('text', { x: ch.x(p.x) + (right ? -8 : 8), y: ch.y(p.y) - 8, 'text-anchor': right ? 'end' : 'start', class: 'pt-label is-muted' }, p.lab)); }
    if (p.key) ch.g.append(s('text', { x: ch.x(p.x) - 10, y: ch.y(p.y) + (p.key === 'Least risk' ? 4 : -10), 'text-anchor': 'end', class: 'pt-label' }, p.key));
  });
  tableTwin($('#ef-table'), {
    caption: 'Efficient frontier portfolios', columns: [{ label: 'Return' }, { label: 'Volatility', num: true }, { label: 'Sharpe', num: true }, ...names.map((n) => ({ label: n, num: true }))],
    rows: fr.points.filter((_, i) => i % 3 === 0 || i === fr.points.length - 1).map((p) => [F.pct(p.ret, 1), F.pct(p.vol, 1), F.num((p.ret - r0) / p.vol, 2), ...p.w.map((v) => F.pct(v, 0))]),
  });
  $('#ef-w-title').textContent = `Weights in ${label.charAt(0).toLowerCase()}${label.slice(1)}`;
  barChart($('#ef-weights'), { categories: names, horizontal: true, legend: false, valueLabels: true, height: 160, series: [{ name: 'Weight', values: w, cls: 'm-s1' }], format: (v) => F.pct(v, 0), label: 'Portfolio weights', margin: { l: 150, r: 52 } });
  // stability: the same choice on each half of the data
  const half = Math.floor(cols[0].length / 2);
  const solveOn = (cs) => { const m = moments(cs); return mode === 'gmv' || (mode === 'ms' && !ms) ? minVariance(m.mu, m.cov) : maxSharpe(m.mu, m.cov, r0) || minVariance(m.mu, m.cov); };
  const w1 = solveOn(cols.map((c) => c.slice(0, half))), w2 = solveOn(cols.map((c) => c.slice(half)));
  const shown = mode === 'target' ? (ms || gmv) : w;
  const swing = Math.max(...names.map((_, i) => Math.abs(w1[i] - w2[i])));
  $('#ef-stab').replaceChildren(h('table', { class: 'data-table' }, h('caption', { class: 'visually-hidden' }, 'Weights estimated on each half of the data'),
    h('thead', {}, h('tr', {}, ['Share', 'All the data', 'First half', 'Second half'].map((c, i) => h('th', { scope: 'col', class: i ? 'is-num' : '' }, c)))),
    h('tbody', {}, names.map((n, i) => h('tr', {}, h('th', { scope: 'row' }, n), [shown[i], w1[i], w2[i]].map((v) => h('td', { class: 'is-num' }, F.pct(v, 0))))))),
  h('p', { class: 'note' }, `${mode === 'target' ? 'Shown for the max-Sharpe mix. ' : ''}The largest swing in any weight between the halves is ${F.pct(swing, 0)}${swing > 0.25 ? ': treat these weights as a rough direction, not a recipe.' : ', fairly stable for an optimiser.'}`));
}

// ---------------------------------------------------------------- wiring
$('#px-market').addEventListener('change', () => {
  const mk = $('#px-market').value, names = data.series.map((x) => x.name);
  const keep = $('#cp-stock').value;
  fillSelect($('#cp-stock'), names.filter((n) => n !== mk), keep);
  renderAll();
});
$('#px-rf').addEventListener('input', debounce(renderAll, 60));
$('#rt-stock').addEventListener('change', renderReturns);
$('#cp-stock').addEventListener('change', renderCapm);
$('#cp-erp').addEventListener('input', renderCapm);
$$('input[name="cp-win"]').forEach((r) => r.addEventListener('change', renderCapm));
$$('input[name="ef-pick"]').forEach((r) => r.addEventListener('change', () => { renderFrontier(); syncRanges(); }));
$('#ef-target').addEventListener('input', renderFrontier);

afterPaint().then(() => { loadSim(); syncRanges(); });
onResize($('#rt-growth'), debounce(() => data && renderAll(), 150));
