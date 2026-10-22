// marketing.js — RFM customer segments (drawn as a seed head) and price elasticity.
import { initSite } from '../core/site.js?v=1';
import { $, $$, h, download, toCSV, onResize, debounce } from '../core/dom.js?v=1';
import * as F from '../core/format.js?v=1';
import * as S from '../core/stats.js?v=1';
import { parseTable, isNumeric } from '../core/csv.js?v=1';
import { customerOrders, priceTests } from '../core/rng.js?v=1';
import { barChart, scatter, tableTwin, Tooltip } from '../core/charts.js?v=1';
import { initFlower } from './flower.js?v=1';

initSite();
initFlower();
const DAY = 86400000;

// ================================================================ RFM
export const SEGMENTS = [
  { name: 'Champions', act: 'Reward them; ask for reviews and referrals.' },
  { name: 'Loyal', act: 'Upsell and invite them into a loyalty programme.' },
  { name: 'Potential loyalists', act: 'Offer membership or a reason for the next order.' },
  { name: 'New customers', act: 'Welcome them well; make the second order easy.' },
  { name: 'Promising', act: 'Introduce the wider range with a small incentive.' },
  { name: 'Need attention', act: 'Send time-limited offers based on what they bought.' },
  { name: 'About to sleep', act: 'Re-engage with relevant recommendations.' },
  { name: 'At risk', act: 'Write personally; find out what changed.' },
  { name: 'Can’t lose them', act: 'Win them back with your best offer, and talk to them.' },
  { name: 'Hibernating', act: 'Low-cost reminders only.' },
  { name: 'Lost', act: 'Revive with very cheap campaigns, or let go.' },
];
export function segmentOf(r, fm) {
  if (r >= 4 && fm >= 4) return 'Champions';
  if (r === 3 && fm >= 4) return 'Loyal';
  if (r >= 4 && fm === 3) return 'Potential loyalists';
  if (r === 5) return 'New customers';
  if (r === 4) return 'Promising';
  if (r === 3 && fm === 3) return 'Need attention';
  if (r === 3) return 'About to sleep';
  if (fm === 5) return 'Can’t lose them';
  if (fm >= 3) return 'At risk';
  if (r === 2) return 'Hibernating';
  return 'Lost';
}
export function rfm(ids, dates, amounts, asOf) {
  const by = new Map();
  let skipped = 0;
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i], d = dates[i], a = amounts[i];
    if (id == null || id === '' || !Number.isFinite(d) || !Number.isFinite(a)) { skipped++; continue; }
    const c = by.get(id) || { id: String(id), last: -Infinity, n: 0, m: 0 };
    c.last = Math.max(c.last, d); c.n += 1; c.m += a;
    by.set(id, c);
  }
  const cs = [...by.values()];
  cs.forEach((c) => { c.recency = Math.max(0, Math.round((asOf - c.last) / DAY)); });
  const R = S.quintileScores(cs.map((c) => c.recency), false), Fs = S.quintileScores(cs.map((c) => c.n)), M = S.quintileScores(cs.map((c) => c.m));
  cs.forEach((c, i) => { c.R = R[i]; c.F = Fs[i]; c.M = M[i]; c.FM = Math.round((c.F + c.M) / 2); c.score = c.R + c.F + c.M; c.segment = segmentOf(c.R, c.FM); });
  return { customers: cs, skipped };
}

const rs = { table: null, name: '', note: '' };
function guessCols(t) {
  const cols = t.columns;
  const find = (re, ok) => cols.find((c) => re.test(c.name) && ok(c));
  const date = cols.find((c) => c.type === 'date');
  const amt = find(/amount|revenue|sales|total|value|spend|price/i, isNumeric) || [...cols].reverse().find(isNumeric);
  const id = find(/customer|client|user|buyer|account|id/i, (c) => c !== amt && c !== date) || cols.find((c) => c !== amt && c !== date);
  return { id: id?.name, date: date?.name, amt: amt?.name };
}
function setRFMTable(t, name, note) {
  rs.table = t; rs.name = name; rs.note = note;
  $('#rfm-note').textContent = note;
  const g = guessCols(t);
  const all = t.columns.map((c) => c.name);
  const fill = (sel, names, v) => { sel.replaceChildren(...names.map((n) => h('option', { value: n }, n))); if (v) sel.value = v; };
  fill($('#rfm-id'), all, g.id);
  fill($('#rfm-date'), t.columns.filter((c) => c.type === 'date').map((c) => c.name), g.date);
  fill($('#rfm-amt'), t.columns.filter(isNumeric).map((c) => c.name), g.amt);
  const dateCol = t.columns.find((c) => c.name === $('#rfm-date').value);
  const max = dateCol ? Math.max(...dateCol.values.filter(Number.isFinite)) : NaN;
  $('#rfm-asof').value = Number.isFinite(max) ? F.date(max + DAY) : '';
  renderRFM();
}
function loadRFMExample() { const ex = customerOrders(); setRFMTable(parseTable(ex.csv), ex.name, ex.note); }
function readRFM(text) {
  const t = parseTable(text);
  const err = $('#rfm-error');
  if (t.error) { err.textContent = t.error; return; }
  if (!t.columns.some((c) => c.type === 'date')) { err.textContent = 'No date column found. Dates like 2026-03-14 or 3/14/2026 work.'; return; }
  if (!t.columns.some(isNumeric)) { err.textContent = 'No amount column found: one column needs to hold numbers.'; return; }
  err.textContent = '';
  setRFMTable(t, 'your orders', `Your orders: ${F.int(t.nRows)} rows, read in this browser tab.`);
}
$$('input[name="rfmsrc"]').forEach((r) => r.addEventListener('change', () => {
  $('#rfm-own-box').hidden = r.value !== 'own';
  if (r.value === 'example') loadRFMExample(); else $('#rfm-paste').focus();
}));
$('#rfm-read').addEventListener('click', () => readRFM($('#rfm-paste').value));
$('#rfm-file').addEventListener('change', async (e) => { const f = e.target.files[0]; if (f) readRFM(await f.text()); });
['#rfm-id', '#rfm-date', '#rfm-amt', '#rfm-asof'].forEach((id) => $(id).addEventListener('change', renderRFM));

let rfmResult = null, highlight = null;
function renderRFM() {
  const t = rs.table; if (!t) return;
  const col = (n) => t.columns.find((c) => c.name === n);
  const idC = col($('#rfm-id').value), dC = col($('#rfm-date').value), aC = col($('#rfm-amt').value);
  const box = $('#rfm-error-box');
  box.replaceChildren();
  if (!idC || !dC || !aC) { box.append(h('div', { class: 'verdict is-bad' }, h('p', {}, h('strong', {}, 'Choose the columns. '), 'RFM needs a customer, a date and an amount.'))); return; }
  const asOf = Date.parse(`${$('#rfm-asof').value}T00:00:00Z`);
  const lastOrder = Math.max(...dC.values.filter(Number.isFinite));
  const ref = Number.isFinite(asOf) ? asOf : lastOrder + DAY;
  const r = rfm(idC.raw, dC.values, aC.values, ref);
  if (r.customers.length < 10) { box.append(h('div', { class: 'verdict is-bad' }, h('p', {}, h('strong', {}, 'Too few customers. '), 'Quintile scores need at least 10 customers.'))); return; }
  rfmResult = r;
  const cs = r.customers;
  const revenue = cs.reduce((a, c) => a + c.m, 0), orders = cs.reduce((a, c) => a + c.n, 0);
  const champs = cs.filter((c) => c.segment === 'Champions');
  const champRev = champs.reduce((a, c) => a + c.m, 0);
  $('#rfm-stats').replaceChildren(...[
    ['Customers', F.int(cs.length)], ['Orders', F.int(orders)], ['Revenue', F.money(revenue, { compact: revenue >= 1e5 })],
    ['Median days since last order', F.int(S.median(cs.map((c) => c.recency)))], [`Revenue from Champions, who are ${F.pct(champs.length / cs.length, 0)} of customers`, F.pct(champRev / revenue, 0)],
  ].map(([k, v]) => h('div', { class: 'stat' }, h('dt', {}, k), h('dd', { class: 'num' }, v))));
  if (r.skipped) box.append(h('div', { class: 'verdict is-warn' }, h('p', {}, h('strong', {}, `${F.int(r.skipped)} rows skipped `), 'because the customer, date or amount was empty or unreadable.')));
  if (asOf < lastOrder) box.append(h('div', { class: 'verdict is-warn' }, h('p', {}, h('strong', {}, 'Recency date is before the last order. '), 'Orders after it count as zero days ago.')));
  // segment summary
  const segs = SEGMENTS.map((sg) => {
    const g = cs.filter((c) => c.segment === sg.name);
    const rev = g.reduce((a, c) => a + c.m, 0);
    return { ...sg, n: g.length, rev, share: g.length / cs.length, revShare: rev / revenue, rec: g.length ? S.mean(g.map((c) => c.recency)) : NaN, freq: g.length ? S.mean(g.map((c) => c.n)) : NaN, spend: g.length ? S.mean(g.map((c) => c.m)) : NaN };
  }).filter((g) => g.n);
  renderSegTable(segs);
  renderGrid(cs);
  barChart($('#rfm-bars'), {
    categories: segs.map((g) => g.name), horizontal: true, label: 'Share of customers and share of revenue by segment',
    series: [{ name: 'Share of customers', values: segs.map((g) => g.share), cls: 'm-s1' }, { name: 'Share of revenue', values: segs.map((g) => g.revShare), cls: 'm-s2' }],
    format: (v) => F.pct(v, 0), margin: { l: 150 },
  });
  drawSeedhead();
}

function renderSegTable(segs) {
  const tbl = h('table', { class: 'data-table seg-table' },
    h('thead', {}, h('tr', {}, ['Segment', 'Customers', 'Revenue', 'Days since order', 'Orders', 'Spend', 'What to do'].map((c, i) => h('th', { scope: 'col', class: i && i < 6 ? 'is-num' : '' }, c)))),
    h('tbody', {}, segs.map((g) => {
      const btn = h('button', { class: 'seg-btn', type: 'button', 'aria-pressed': String(highlight === g.name) }, g.name);
      btn.addEventListener('click', () => { highlight = highlight === g.name ? null : g.name; $$('.seg-btn').forEach((b) => b.setAttribute('aria-pressed', String(b.textContent === highlight))); drawSeedhead(); });
      return h('tr', {}, h('th', { scope: 'row' }, btn), h('td', { class: 'is-num' }, `${F.int(g.n)} (${F.pct(g.share, 0)})`), h('td', { class: 'is-num' }, F.pct(g.revShare, 0)),
        h('td', { class: 'is-num' }, F.int(g.rec)), h('td', { class: 'is-num' }, F.num(g.freq, 1)), h('td', { class: 'is-num' }, F.money(g.spend)), h('td', { class: 'seg-act' }, g.act));
    })));
  $('#rfm-table').replaceChildren(tbl);
}

function renderGrid(cs) {
  const counts = {}; cs.forEach((c) => { const k = `${c.R}-${c.FM}`; counts[k] = (counts[k] || 0) + 1; });
  const max = Math.max(...Object.values(counts));
  const tbl = h('table', { class: 'data-table rfm-grid' },
    h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Recency ↓ / F+M →'), [1, 2, 3, 4, 5].map((fm) => h('th', { scope: 'col', class: 'is-num' }, String(fm))))),
    h('tbody', {}, [5, 4, 3, 2, 1].map((r) => h('tr', {}, h('th', { scope: 'row' }, String(r)), [1, 2, 3, 4, 5].map((fm) => {
      const n = counts[`${r}-${fm}`] || 0;
      const t = n / max;
      return h('td', { class: 'grid-cell', style: { background: `rgba(201, 146, 22, ${(0.08 + 0.5 * t).toFixed(3)})` } }, h('span', { class: 'grid-seg' }, segmentOf(r, fm)), h('span', { class: 'grid-n num' }, F.int(n)));
    })))));
  $('#rfm-grid').replaceChildren(tbl);
}

// the seed head: Vogel's model, r = c·√i, θ = i·137.508°
const RAMP = [[244, 215, 126], [221, 162, 43], [154, 94, 23], [46, 28, 9]];
function rampColor(t) {
  const x = Math.min(0.999, Math.max(0, t)) * (RAMP.length - 1), i = Math.floor(x), f = x - i;
  const c = RAMP[i].map((v, k) => Math.round(v + (RAMP[i + 1][k] - v) * f));
  return `rgb(${c.join(',')})`;
}
let seedCanvas = null, seedTip = null, seedPts = [];
function drawSeedhead() {
  const box = $('#seedhead');
  if (!rfmResult) return;
  const cs = [...rfmResult.customers].sort((a, b) => b.score - a.score || b.m - a.m);
  const size = Math.min(box.clientWidth || 360, 460);
  if (!seedCanvas) {
    seedCanvas = h('canvas', { role: 'img' });
    box.append(seedCanvas);
    seedTip = new Tooltip(box);
    seedCanvas.addEventListener('pointermove', onSeedMove);
    seedCanvas.addEventListener('pointerleave', () => { seedTip.hide(); hoverSeed = -1; paint(); });
  }
  const dpr = Math.min(2, devicePixelRatio || 1);
  seedCanvas.width = size * dpr; seedCanvas.height = size * dpr;
  seedCanvas.style.width = `${size}px`; seedCanvas.style.height = `${size}px`;
  seedCanvas.setAttribute('aria-label', `Seed head of ${cs.length} customers ordered by RFM score, best at the centre. The segment table below lists every group.`);
  const R = size / 2 - 8, c = R / Math.sqrt(cs.length + 0.5);
  const golden = Math.PI * (3 - Math.sqrt(5));
  seedPts = cs.map((cu, i) => { const rr = c * Math.sqrt(i + 0.5), th = i * golden; return { cu, x: size / 2 + rr * Math.cos(th), y: size / 2 + rr * Math.sin(th) }; });
  seedDot = Math.max(1.4, c * 0.62);
  paint();
}
let hoverSeed = -1, seedDot = 3;
function paint() {
  const ctx = seedCanvas.getContext('2d');
  const dpr = seedCanvas.width / parseFloat(seedCanvas.style.width);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const size = parseFloat(seedCanvas.style.width);
  ctx.clearRect(0, 0, size, size);
  seedPts.forEach((p, i) => {
    ctx.globalAlpha = highlight && p.cu.segment !== highlight ? 0.14 : 1;
    ctx.beginPath(); ctx.arc(p.x, p.y, seedDot, 0, Math.PI * 2);
    ctx.fillStyle = rampColor((p.cu.score - 3) / 12); ctx.fill();
  });
  ctx.globalAlpha = 1;
  if (hoverSeed >= 0) {
    const p = seedPts[hoverSeed];
    ctx.beginPath(); ctx.arc(p.x, p.y, seedDot + 3, 0, Math.PI * 2);
    ctx.lineWidth = 2; ctx.strokeStyle = '#192B49'; ctx.stroke();
  }
}
function onSeedMove(e) {
  const r = seedCanvas.getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  let best = -1, bd = 18 * 18;
  seedPts.forEach((p, i) => { const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = i; } });
  hoverSeed = best; paint();
  if (best < 0) { seedTip.hide(); return; }
  const cu = seedPts[best].cu;
  seedTip.show(seedPts[best].x + (seedCanvas.offsetLeft || 0), seedPts[best].y, `${cu.id} · ${cu.segment}`, [
    { value: `${F.int(cu.recency)} days`, label: `since last order (R ${cu.R})` },
    { value: `${F.int(cu.n)} orders`, label: `(F ${cu.F})` },
    { value: F.money(cu.m, { digits: 2 }), label: `spent (M ${cu.M})` },
  ]);
}
$('#rfm-csv').addEventListener('click', () => {
  if (!rfmResult) return;
  download('rfm-customers.csv', toCSV(['customer', 'recency_days', 'frequency', 'monetary', 'R', 'F', 'M', 'segment'],
    rfmResult.customers.map((c) => [c.id, c.recency, c.n, c.m.toFixed(2), c.R, c.F, c.M, c.segment])));
});

// ================================================================ elasticity
const es = { table: null };
function setElTable(t, note) {
  es.table = t;
  $('#el-note').textContent = note;
  const nums = t.columns.filter(isNumeric).map((c) => c.name);
  const fill = (sel, v) => { sel.replaceChildren(...nums.map((n) => h('option', { value: n }, n))); if (v) sel.value = v; };
  fill($('#el-p'), nums.find((n) => /price/i.test(n)) || nums[0]);
  fill($('#el-q'), nums.find((n) => /unit|qty|quantity|volume|sold|demand/i.test(n)) || nums[nums.length - 1]);
  renderEl();
}
function loadElExample(kind) { const ex = priceTests(kind); setElTable(parseTable(ex.csv), `${ex.name}. ${ex.note}`); }
$$('input[name="elsrc"]').forEach((r) => r.addEventListener('change', () => {
  $('#el-own-box').hidden = r.value !== 'own';
  if (r.value !== 'own') loadElExample(r.value); else $('#el-paste').focus();
}));
$('#el-read').addEventListener('click', () => {
  const t = parseTable($('#el-paste').value);
  const err = $('#el-error');
  if (t.error) { err.textContent = t.error; return; }
  if (t.columns.filter(isNumeric).length < 2) { err.textContent = 'Two numeric columns are needed: price and units.'; return; }
  err.textContent = '';
  setElTable(t, `Your data: ${F.int(t.nRows)} rows.`);
});
['#el-p', '#el-q', '#el-cost'].forEach((id) => $(id).addEventListener('input', renderEl));
$('#el-change').addEventListener('input', renderEl);

let elFit = null;
function renderEl() {
  const t = es.table; if (!t) return;
  const sl = $('#el-change');
  $('#el-change-out').textContent = `${+sl.value > 0 ? '+' : ''}${sl.value}%`;
  sl.style.setProperty('--fill', `${((sl.value - sl.min) / (sl.max - sl.min)) * 100}%`);
  const P0 = t.columns.find((c) => c.name === $('#el-p').value)?.values || [], Q0 = t.columns.find((c) => c.name === $('#el-q').value)?.values || [];
  const pts = P0.map((p, i) => ({ p, q: Q0[i] })).filter((d) => d.p > 0 && d.q > 0);
  const box = $('#el-error-box');
  box.replaceChildren();
  const dropped = P0.length - pts.length;
  if ($('#el-p').value === $('#el-q').value || pts.length < 5) {
    box.append(h('div', { class: 'verdict is-bad' }, h('p', {}, h('strong', {}, 'Not enough to fit. '), 'Choose two different columns with at least five rows where both price and units are above zero.')));
    $('#el-b').textContent = '—'; $('#el-ci').textContent = ''; $('#el-verdict').replaceChildren(); $('#el-whatif').replaceChildren(); $('#el-chart').replaceChildren(); return;
  }
  if (dropped) box.append(h('div', { class: 'verdict is-warn' }, h('p', {}, h('strong', {}, `${dropped} rows left out `), 'because a log needs values above zero.')));
  const fit = S.ols([pts.map((d) => Math.log(d.p))], pts.map((d) => Math.log(d.q)), { names: ['ln price'] });
  if (fit.error) { box.append(h('div', { class: 'verdict is-bad' }, h('p', {}, fit.error))); return; }
  elFit = { fit, pts };
  const b = fit.beta[1], c = fit.coefs[1];
  $('#el-b').textContent = F.num(b, 2);
  $('#el-ci').textContent = `95% confidence interval ${F.num(c.low, 2)} to ${F.num(c.high, 2)}; R² ${F.num(fit.r2, 2)} across ${pts.length} observations`;
  const vb = $('#el-verdict');
  let kind, title, text;
  if (b >= 0) { kind = 'bad'; title = 'Demand rises with price here.'; text = 'That usually means something else moved with price (promotions, seasons, quality). Use cleaner price tests before acting on it.'; }
  else if (c.high < -1) { kind = 'warn'; title = 'Elastic demand.'; text = `A 1% price rise cuts units by about ${F.num(-b, 1)}%, so raising prices lowers revenue and cutting them raises it.`; }
  else if (c.low > -1) { kind = 'good'; title = 'Inelastic demand.'; text = `A 1% price rise cuts units by only about ${F.num(-b, 1)}%, so a price rise lifts revenue while volume dips.`; }
  else { kind = 'warn'; title = 'Close to unit elastic.'; text = 'The interval includes −1, so revenue barely moves with price. The data can’t tell which side of the line it is on.'; }
  vb.replaceChildren(h('div', { class: `verdict is-${kind}` }, h('p', {}, h('strong', {}, title), ' ', text)));
  // what if
  const d = +sl.value / 100;
  const qExact = (1 + d) ** b - 1, rExact = (1 + d) ** (1 + b) - 1, qApprox = b * d;
  const cost = parseFloat($('#el-cost').value);
  const prices = pts.map((x) => x.p), lo = Math.min(...prices), hi = Math.max(...prices);
  const w = $('#el-whatif');
  w.replaceChildren(
    h('div', { class: 'stat' }, h('dt', {}, `Units after a ${sl.value > 0 ? '+' : ''}${sl.value}% price change`), h('dd', { class: 'num' }, F.pct(qExact, 1)), h('dd', { class: 'stat-sub' }, `the 1% rule says ${F.pct(qApprox, 1)}`)),
    h('div', { class: 'stat' }, h('dt', {}, 'Revenue'), h('dd', { class: 'num' }, F.pct(rExact, 1))),
  );
  if (Number.isFinite(cost) && cost > 0) {
    if (b < -1) {
      const pStar = cost * b / (1 + b);
      const inRange = pStar >= lo * 0.95 && pStar <= hi * 1.05;
      w.append(h('div', { class: 'stat' }, h('dt', {}, 'Profit-maximising price'), h('dd', { class: 'num' }, F.money(pStar, { digits: 2 })), h('dd', { class: 'stat-sub' }, inRange ? `cost × b ÷ (1 + b), inside your tested range` : `outside the tested ${F.money(lo, { digits: 2 })}–${F.money(hi, { digits: 2 })}: test it before trusting it`)));
    } else {
      w.append(h('div', { class: 'stat' }, h('dt', {}, 'Profit-maximising price'), h('dd', { class: 'num' }, 'No finite answer'), h('dd', { class: 'stat-sub' }, 'With inelastic demand the formula says “keep raising price”; in reality demand turns elastic somewhere above the range tested.')));
    }
  }
  // chart: data + fitted curve + 95% band for the average
  const a = fit.beta[0];
  scatter($('#el-chart'), {
    points: pts.map((x) => ({ x: x.p, y: x.q })), height: 300, xLabel: 'Price ($)', yLabel: 'Units sold', label: 'Units sold against price with fitted constant-elasticity demand curve',
    curves: [{ fn: (p) => Math.exp(a + b * Math.log(p)), cls: 'm-s2' }],
    band: { lo: (p) => Math.exp(fit.predict([Math.log(p)]).ciLow), hi: (p) => Math.exp(fit.predict([Math.log(p)]).ciHigh), cls: 'm-s2' },
    xFormat: (v) => F.money(v, { digits: 2 }), yFormat: (v) => F.int(v), xDomain: [lo, hi],
  });
  $('#el-table').replaceChildren();
  tableTwin($('#el-table'), {
    caption: 'Price tests', columns: [{ label: 'Row' }, { label: 'Price', num: true }, { label: 'Units', num: true }, { label: 'Fitted units', num: true }],
    rows: pts.map((x, i) => [String(i + 1), F.money(x.p, { digits: 2 }), F.int(x.q), F.int(Math.exp(a + b * Math.log(x.p)))]),
  });
}

loadRFMExample();
loadElExample('seeds');
const redraw = debounce(() => { drawSeedhead(); renderRFMBarsOnly(); renderEl(); }, 150);
function renderRFMBarsOnly() { if (rfmResult) renderRFM(); }
onResize($('#rfm-bars'), redraw);
