// marketing-growth.js — unit economics and A/B tests.
import { initSite, syncRanges } from '../core/site.js?v=5';
import { $, $$, h, s, download, toCSV, onResize, debounce } from '../core/dom.js?v=5';
import * as F from '../core/format.js?v=5';
import * as S from '../core/stats.js?v=5';
import { parseTable, isNumeric } from '../core/csv.js?v=5';
import { barChart, scatter, tableTwin, Tooltip, lineChart } from '../core/charts.js?v=5';
import { unitEconomics, readUnitEconomics, PRESETS } from '../core/saas.js?v=5';
import { compareRates, sampleSize } from '../core/abtest.js?v=5';
initSite();

const DAY = 86400000;

// ================================================================ unit economics
const UE_FIELDS = { arpa: 'ue-arpa', sm: 'ue-sm', newCust: 'ue-new', netNewArr: 'ue-netnew', startArr: 'ue-start', upgrades: 'ue-up', losses: 'ue-loss' };
function setPreset(key) {
  const pr = PRESETS[key];
  Object.entries(UE_FIELDS).forEach(([k, id]) => { $(`#${id}`).value = String(pr[k]); });
  $('#ue-margin').value = String(Math.round(pr.margin * 100));
  $('#ue-churn').value = String(+(pr.churn * 100).toFixed(1));
  syncRanges($('#unit-economics'));
  renderUE();
}
function renderUE() {
  const inp = Object.fromEntries(Object.entries(UE_FIELDS).map(([k, id]) => [k, parseFloat($(`#${id}`).value)]));
  inp.margin = +$('#ue-margin').value / 100; inp.churn = +$('#ue-churn').value / 100;
  $('#ue-margin-out').textContent = F.pct(inp.margin, 0);
  $('#ue-churn-out').textContent = F.pct(inp.churn, 1);
  const err = $('#ue-error'), body = $('#ue-body');
  err.replaceChildren();
  const u = unitEconomics(inp);
  if (u.error) { err.append(h('div', { class: 'verdict is-bad' }, h('p', {}, h('strong', {}, 'Can’t work this out yet. '), u.error))); body.hidden = true; return; }
  body.hidden = false;
  const r = readUnitEconomics(u);
  const money = (v) => (Math.abs(v) >= 1e5 ? F.money(v, { compact: true }) : F.money(v));
  const months = (m) => (Number.isFinite(m) ? `${F.num(m, 1)}` : 'never');
  $('#ue-ratio').textContent = `${F.num(u.ratio, 1)}×`;
  $('#ue-ratio-sub').textContent = `A customer brings ${money(u.ltv)} of gross profit over about ${F.num(u.lifetimeMonths, 0)} months and costs ${money(u.cac)} to win.`;
  const tone = { good: 'is-good', warn: 'is-warn', bad: 'is-bad' };
  $('#ue-call').replaceChildren(h('div', { class: `verdict ${tone[r.call.tone]}` }, h('p', {}, h('strong', {}, `${r.call.head} `), r.call.text)));
  const mark = (id, text, t) => { const el = $(id); el.textContent = text; el.dataset.tone = t; };
  mark('#ue-cac', money(u.cac), '');
  mark('#ue-ltv', money(u.ltv), '');
  mark('#ue-payback', months(u.paybackSimple), r.payback);
  mark('#ue-magic', Number.isFinite(u.magic) ? F.num(u.magic, 2) : '—', r.magic);
  mark('#ue-nrr', F.pct(u.nrr, 0), r.nrr);
  mark('#ue-grr', F.pct(u.grr, 0), '');
  $('#ue-ratio').dataset.tone = r.ratio;
  // chart: cumulative gross profit per customer won, against the acquisition cost
  const horizon = Math.min(72, Math.max(24, Math.ceil((Number.isFinite(u.paybackChurn) ? u.paybackChurn : u.lifetimeMonths) * 1.5)));
  const xs = Array.from({ length: horizon + 1 }, (_, t) => t);
  const cum = u.curve(horizon);
  lineChart($('#ue-chart'), {
    xs, series: [{ name: 'Gross profit earned', values: cum, cls: 'm-s1' }, { name: 'Cost to win', values: xs.map(() => u.cac), cls: 'm-s2' }],
    highlightX: Number.isFinite(u.paybackChurn) && u.paybackChurn <= horizon ? u.paybackChurn : null,
    height: 260, xLabel: 'Month', xFormat: (v) => F.int(v), yFormat: money, label: 'Cumulative gross profit from one new customer against the cost of winning it',
  });
  $('#ue-table').replaceChildren();
  const step = horizon > 36 ? 12 : 6;
  tableTwin($('#ue-table'), {
    caption: 'Gross profit earned back per customer',
    columns: [{ label: 'Month' }, { label: 'Gross profit earned', num: true }, { label: 'Cost to win', num: true }],
    rows: xs.filter((t) => t % step === 0).map((t) => [String(t), money(cum[t]), money(u.cac)]),
  });
  // reading
  const say = { good: '', warn: 'is-warn', bad: 'is-warn' };
  const list = $('#ue-reading'); list.replaceChildren(
    h('li', { class: say[r.ratio] }, `Lifetime value is ${F.num(u.ratio, 1)} times the cost to win a customer. The usual bar is 3.`),
    h('li', { class: say[r.payback] }, Number.isFinite(u.paybackChurn)
      ? `The cost comes back in ${months(u.paybackSimple)} months of gross profit; allowing for customers who leave first, a typical cohort earns it back by month ${F.num(Math.ceil(u.paybackChurn), 0)}. The usual bar is 12 months.`
      : `Customers leave before they repay what they cost: on average a cohort never earns back its acquisition cost.`),
    h('li', { class: say[r.magic] }, `Magic number ${Number.isFinite(u.magic) ? F.num(u.magic, 2) : '—'}: each dollar of last quarter’s sales and marketing added ${Number.isFinite(u.magic) ? F.money(u.magic, { digits: 2 }) : '—'} of annual recurring revenue. Above about 0.75 is usually read as efficient; below 0.5 as a warning.`),
    h('li', { class: u.nrr >= 1 ? '' : 'is-warn' }, u.nrr >= 1
      ? `Net revenue retention of ${F.pct(u.nrr, 0)}: customers from a year ago now pay more in total than they did, so the business grows even before new sales.`
      : `Net revenue retention of ${F.pct(u.nrr, 0)}: customers from a year ago pay ${F.pct(1 - u.nrr, 0)} less in total than they did, so new sales first have to refill that gap.`),
  );
}
$$('input[name="uepreset"]').forEach((el) => el.addEventListener('change', () => setPreset(el.value)));
[...Object.values(UE_FIELDS), 'ue-margin', 'ue-churn'].forEach((id) => $(`#${id}`).addEventListener('input', renderUE));


// ================================================================ A/B test
function renderAB() {
  const v = (id) => parseFloat($(`#${id}`).value);
  $('#ab-mde-out').textContent = `${v('ab-mde')}%`;
  const r = compareRates({ n: v('ab-na'), conv: v('ab-ca') }, { n: v('ab-nb'), conv: v('ab-cb') });
  const err = $('#ab-error'), body = $('#ab-body'); err.replaceChildren();
  if (r.error) { err.append(h('div', { class: 'verdict is-bad' }, h('p', {}, h('strong', {}, 'Can’t compare yet. '), r.error))); body.hidden = true; return; }
  body.hidden = false;
  $('#ab-lift').textContent = Number.isFinite(r.lift) ? `${r.lift >= 0 ? '+' : '−'}${F.pct(Math.abs(r.lift), 1)}` : '—';
  $('#ab-ci').textContent = Number.isFinite(r.liftLow) ? `95% interval for the lift: ${F.pct(r.liftLow, 1)} to ${F.pct(r.liftHigh, 1)} (${F.pct(r.low, 2)} to ${F.pct(r.high, 2)} in conversion rate).` : '';
  $('#ab-pa').textContent = F.pct(r.pa, 2); $('#ab-pb').textContent = F.pct(r.pb, 2);
  $('#ab-z').textContent = F.num(r.z, 2); $('#ab-p').textContent = F.pValue(r.p);
  const sig = r.p < 0.05;
  const verdict = r.small
    ? ['is-warn', 'Too few conversions to judge. ', 'With under ten conversions or non-conversions in a version, keep the test running.']
    : sig
      ? (r.diff > 0 ? ['is-good', 'B is better, beyond chance. ', `A gap this large would turn up by chance alone less than ${r.p < 0.001 ? '0.1%' : F.pct(Math.max(r.p, 0.001), 1)} of the time if the versions were really the same.`]
        : ['is-bad', 'B is worse, beyond chance. ', 'Keep version A.'])
      : ['is-warn', 'No clear winner yet. ', `A gap this size would turn up by chance ${F.pct(r.p, 0)} of the time even if the versions were the same; the interval for the lift still includes zero.`];
  $('#ab-verdict').replaceChildren(h('div', { class: `verdict ${verdict[0]}` }, h('p', {}, h('strong', {}, verdict[1]), verdict[2])));
  const z = 1.959963984540054;
  const ci = (p, n) => [Math.max(0, p - z * Math.sqrt(p * (1 - p) / n)), Math.min(1, p + z * Math.sqrt(p * (1 - p) / n))];
  const [aLo, aHi] = ci(r.pa, v('ab-na')), [bLo, bHi] = ci(r.pb, v('ab-nb'));
  scatter($('#ab-chart'), {
    points: [{ x: 1, y: r.pa, title: 'Version A', cls: 'm-s1' }, { x: 2, y: r.pb, title: 'Version B', cls: 'm-s2' }],
    curves: [{ pts: [[1, aLo], [1, aHi]], cls: 'm-s1' }, { pts: [[2, bLo], [2, bHi]], cls: 'm-s2' }],
    xDomain: [0.5, 2.5], yDomain: [Math.max(0, Math.min(aLo, bLo) * 0.9), Math.min(1, Math.max(aHi, bHi) * 1.1)], height: 220,
    xFormat: (x) => (Math.abs(x - 1) < 0.01 ? 'A' : Math.abs(x - 2) < 0.01 ? 'B' : ''), yFormat: (y) => F.pct(y, 1), yLabel: 'Conversion rate', xLabel: 'Version',
    label: `Conversion rates with 95% intervals: A ${F.pct(r.pa, 2)}, B ${F.pct(r.pb, 2)}`,
    legend: [{ name: 'Version A', cls: 'm-s1' }, { name: 'Version B', cls: 'm-s2' }],
  });
  // planning
  const base = v('ab-base') / 100, mde = v('ab-mde') / 100, daily = v('ab-daily');
  const plan = $('#ab-plan');
  if (!(base > 0 && base < 1) || !(base * (1 + mde) < 1)) { plan.textContent = 'Enter a current conversion rate between 0% and 100%.'; return; }
  const n = sampleSize(base, base * (1 + mde));
  const days = daily > 0 ? Math.ceil((2 * n) / daily) : NaN;
  plan.replaceChildren(h('strong', {}, `${F.int(n)} visitors per version`), ` (${F.int(2 * n)} in all) to detect a ${F.pct(mde, 0)} lift from ${F.pct(base, 1)} to ${F.pct(base * (1 + mde), 2)}, with 80% power at the 5% significance level${Number.isFinite(days) ? `: about ${F.int(days)} day${days === 1 ? '' : 's'} at ${F.int(daily)} visitors a day` : ''}. Halving the lift you want to detect roughly quadruples the visitors needed.`);
}
$('#ab-test').addEventListener('input', renderAB);

setPreset('club');
renderAB();
onResize($('#ue-chart'), debounce(() => { renderUE(); renderAB(); }, 150));
