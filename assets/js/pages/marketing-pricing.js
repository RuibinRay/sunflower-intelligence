// marketing-pricing.js — price elasticity of demand.
import { initSite, syncRanges } from '../core/site.js?v=9';
import { $, $$, h, s, download, toCSV, onResize, debounce } from '../core/dom.js?v=9';
import * as F from '../core/format.js?v=9';
import * as S from '../core/stats.js?v=9';
import { parseTable, isNumeric } from '../core/csv.js?v=9';
import { barChart, scatter, tableTwin, Tooltip, lineChart } from '../core/charts.js?v=9';
import { priceTests } from '../core/rng.js?v=9';
initSite();

const DAY = 86400000;

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


loadElExample('seeds');
onResize($('#el-chart'), debounce(() => renderEl(), 150));
