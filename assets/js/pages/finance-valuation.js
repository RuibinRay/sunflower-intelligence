// finance-valuation.js — cost of capital and discounted cash flow.
import { initSite, syncRanges } from '../core/site.js?v=12';
import { $, $$, h, s, download, toCSV, onResize, debounce } from '../core/dom.js?v=12';
import * as F from '../core/format.js?v=12';
import { barChart, tableTwin, lineChart, scatter } from '../core/charts.js?v=12';
import { verdict } from '../core/ui.js?v=12';
import { wacc as costOfCapital } from '../core/fin.js?v=12';
initSite();

// ================================================================ cost of capital
const ccVal = (id) => parseFloat($(`#${id}`).value);
let lastCC = null;
function renderCC() {
  ['cc-rf', 'cc-erp', 'cc-kd', 'cc-tax'].forEach((id) => { $(`#${id}-out`).textContent = `${F.num(ccVal(id), id === 'cc-tax' ? 0 : 1)}%`; });
  const r = costOfCapital({ rf: ccVal('cc-rf') / 100, beta: ccVal('cc-beta'), erp: ccVal('cc-erp') / 100, kd: ccVal('cc-kd') / 100, tax: ccVal('cc-tax') / 100, equity: ccVal('cc-e'), debt: ccVal('cc-d') });
  const err = $('#cc-error'); err.replaceChildren();
  if (r.error) { err.append(verdict('bad', 'No rate yet.', r.error)); lastCC = null; ['#cc-wacc', '#cc-ke', '#cc-kd-after', '#cc-we', '#cc-wd'].forEach((id) => { $(id).textContent = '—'; }); $('#cc-chart').replaceChildren(); $('#cc-use').disabled = true; return; }
  lastCC = r; $('#cc-use').disabled = false;
  $('#cc-wacc').textContent = F.pct(r.wacc, 2);
  $('#cc-line').textContent = `${F.pct(r.we, 0)} of the money comes from shareholders at ${F.pct(r.ke, 1)}, ${F.pct(r.wd, 0)} from lenders at ${F.pct(r.kdAfter, 1)} after tax.`;
  $('#cc-ke').textContent = F.pct(r.ke, 2); $('#cc-kd-after').textContent = F.pct(r.kdAfter, 2);
  $('#cc-we').textContent = F.pct(r.we, 1); $('#cc-wd').textContent = F.pct(r.wd, 1);
  barChart($('#cc-chart'), {
    categories: ['Equity', 'Debt'], horizontal: true, height: 120, legend: false, valueLabels: true, label: 'Contribution of equity and debt to the weighted average cost of capital',
    series: [{ name: 'Contribution to WACC', values: [r.we * r.ke * 100, r.wd * r.kdAfter * 100], cls: 'm-s2' }], format: (v) => `${F.num(v, 2)} pts`,
  });
}
$('#cc-form').addEventListener('input', renderCC);
$('#cc-use').addEventListener('click', () => {
  if (!lastCC) return;
  const w = $('#wacc');
  w.value = String(Math.min(+w.max, Math.max(+w.min, Math.round(lastCC.wacc * 1000) / 10)));
  syncRanges(form); renderDCF();
  $('#dcf').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  $('#dcf-ev').closest('.bench-results').focus?.();
});
renderCC();


// ================================================================ DCF
export function dcf({ fcf0, g1, years, path, wacc, gT, mid, debt, shares }) {
  if (![fcf0, g1, wacc, gT].every(Number.isFinite)) return { error: 'Fill in every cash-flow and discounting field.' };
  if (wacc <= gT) return { error: 'The cost of capital has to be higher than terminal growth. Otherwise the value of the years after the forecast has no finite answer.' };
  const rows = [];
  let fcf = fcf0;
  for (let t = 1; t <= years; t++) {
    const g = path === 'fade' ? g1 + (gT - g1) * ((t - 1) / Math.max(1, years - 1)) : g1;
    fcf *= 1 + g;
    const df = 1 / (1 + wacc) ** (mid ? t - 0.5 : t);
    rows.push({ t, g, fcf, df, pv: fcf * df });
  }
  const last = rows[rows.length - 1];
  const tv = (last.fcf * (1 + gT)) / (wacc - gT);
  const pvTV = tv / (1 + wacc) ** (mid ? years - 0.5 : years);
  const pvSum = rows.reduce((a, r) => a + r.pv, 0);
  const ev = pvSum + pvTV;
  const equity = ev - (Number.isFinite(debt) ? debt : 0);
  return { rows, tv, pvTV, pvSum, ev, equity, perShare: shares > 0 ? equity / shares : NaN, tvShare: pvTV / ev, multiple: tv / last.fcf };
}

const DEFAULTS = { fcf0: 120, g1: 9, years: '5', path: 'fade', wacc: 9, gt: 2.5, mid: false, debt: 300, shares: 85 };
const form = $('#dcf-form');
const val = (id) => parseFloat($(`#${id}`).value);
const radio = (name) => form.querySelector(`input[name="${name}"]:checked`).value;
const moneyM = (v) => (Math.abs(v) >= 1000 ? `${F.money(v / 1000, { digits: 2 })}bn` : `${F.money(v, { digits: 0 })}m`);

function readDCF() {
  return {
    fcf0: val('fcf0'), g1: val('g1') / 100, years: +radio('years'), path: radio('path'),
    wacc: val('wacc') / 100, gT: val('gt') / 100, mid: $('#mid').checked, debt: val('debt'), shares: val('shares'),
  };
}

function syncSlider(input) {
  const out = $(`#${input.id}-out`);
  if (out) out.textContent = `${F.num(+input.value, 1)}%`;
  const p = ((input.value - input.min) / (input.max - input.min)) * 100;
  input.style.setProperty('--fill', `${p}%`);
}

let lastDCF = null;
function renderDCF() {
  $$('input[type="range"]', form).forEach(syncSlider);
  const inp = readDCF();
  const r = dcf(inp);
  const warn = $('#dcf-warn');
  warn.replaceChildren();
  if (r.error) {
    $('#dcf-ev').textContent = '—';
    $('#dcf-share-line').textContent = '';
    ['#dcf-pv', '#dcf-pvtv', '#dcf-tvshare', '#dcf-mult'].forEach((id) => { $(id).textContent = '—'; });
    warn.append(verdict('bad', 'No valuation yet.', r.error));
    $('#dcf-chart').replaceChildren(); $('#dcf-split').replaceChildren(); $('#dcf-sens').replaceChildren(); $('#dcf-table').replaceChildren();
    lastDCF = null;
    return;
  }
  lastDCF = { inp, r };
  $('#dcf-ev').textContent = moneyM(r.ev);
  $('#dcf-share-line').textContent = Number.isFinite(r.perShare)
    ? `Equity value ${moneyM(r.equity)}, or ${F.money(r.perShare, { digits: 2 })} per share`
    : `Equity value ${moneyM(r.equity)}`;
  $('#dcf-pv').textContent = moneyM(r.pvSum);
  $('#dcf-pvtv').textContent = moneyM(r.pvTV);
  $('#dcf-tvshare').textContent = F.pct(r.tvShare, 0);
  $('#dcf-mult').textContent = `${F.num(r.multiple, 1)}×`;
  if (inp.fcf0 <= 0) warn.append(verdict('warn', 'Negative starting cash flow.', 'A perpetuity of losses only makes sense if the business turns positive; consider forecasting that turnaround explicitly.'));
  if (r.tvShare > 0.75) warn.append(verdict('warn', `${F.pct(r.tvShare, 0)} of the value comes after the forecast.`, 'The answer leans heavily on the long-run assumptions. Check the sensitivity table before trusting the headline.'));
  if (inp.gT > 0.04) warn.append(verdict('warn', 'Terminal growth above 4%.', 'Growing faster than the wider economy forever is hard to defend; most analysts stay near long-run inflation plus real growth.'));

  const cats = r.rows.map((x) => `Y${x.t}`);
  barChart($('#dcf-chart'), {
    categories: cats, height: 250, label: 'Forecast free cash flow and its present value by year',
    series: [{ name: 'Forecast cash flow', values: r.rows.map((x) => x.fcf), cls: 'm-light' }, { name: 'Present value', values: r.rows.map((x) => x.pv), cls: 'm-s2' }],
    format: (v) => F.compact(v), yLabel: '$m',
  });
  $('#dcf-table').replaceChildren();
  tableTwin($('#dcf-table'), {
    caption: 'DCF schedule',
    columns: [{ label: 'Year' }, { label: 'Growth', num: true }, { label: 'Free cash flow ($m)', num: true }, { label: 'Discount factor', num: true }, { label: 'Present value ($m)', num: true }],
    rows: [...r.rows.map((x) => [`Year ${x.t}`, F.pct(x.g, 1), F.num(x.fcf, 1), F.num(x.df, 4), F.num(x.pv, 1)]),
      ['Terminal value', F.pct(inp.gT, 1), F.num(r.tv, 1), F.num(r.pvTV / r.tv, 4), F.num(r.pvTV, 1)]],
  });
  renderSplit(r);
  renderSensitivity(inp);
}

function renderSplit(r) {
  const box = $('#dcf-split');
  box.replaceChildren();
  const pos = Math.max(0, r.pvSum), tvp = Math.max(0, r.pvTV), tot = pos + tvp || 1;
  const bar = h('div', { class: 'split-bar', role: 'img', 'aria-label': `Forecast years ${F.pct(pos / tot, 0)} of enterprise value, terminal value ${F.pct(tvp / tot, 0)}` },
    h('span', { class: 'split-a', style: { flexBasis: `${(pos / tot) * 100}%` } }),
    h('span', { class: 'split-b', style: { flexBasis: `${(tvp / tot) * 100}%` } }));
  const legend = h('ul', { class: 'legend', role: 'list' },
    h('li', {}, h('i', { class: 'legend-key m-s1' }), `Forecast years: ${moneyM(r.pvSum)} (${F.pct(pos / tot, 0)})`),
    h('li', {}, h('i', { class: 'legend-key m-s2' }), `After the forecast: ${moneyM(r.pvTV)} (${F.pct(tvp / tot, 0)})`));
  box.append(bar, legend);
}

function renderSensitivity(inp) {
  const usePS = inp.shares > 0;
  $('#sens-title').textContent = usePS ? 'Sensitivity: value per share' : 'Sensitivity: enterprise value ($m)';
  const dW = [-0.01, -0.005, 0, 0.005, 0.01], dG = [-0.01, -0.005, 0, 0.005, 0.01];
  const table = h('table', { class: 'data-table sens-table' },
    h('caption', { class: 'visually-hidden' }, 'Valuation for each combination of cost of capital and terminal growth'),
    h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'WACC ↓  g →'), dG.map((d) => h('th', { scope: 'col', class: 'is-num' }, F.pct(inp.gT + d, 1))))),
    h('tbody', {}, dW.map((dw) => h('tr', {}, h('th', { scope: 'row' }, F.pct(inp.wacc + dw, 1)), dG.map((dg) => {
      const r = dcf({ ...inp, wacc: inp.wacc + dw, gT: inp.gT + dg });
      const v = r.error ? '—' : usePS ? F.money(r.perShare, { digits: 2 }) : F.num(r.ev, 0);
      return h('td', { class: `is-num${dw === 0 && dg === 0 ? ' cell-hi' : ''}` }, v);
    })))));
  $('#dcf-sens').replaceChildren(table);
}


function resetDCF() {
  $('#fcf0').value = DEFAULTS.fcf0; $('#g1').value = DEFAULTS.g1; $('#wacc').value = DEFAULTS.wacc; $('#gt').value = DEFAULTS.gt;
  $('#debt').value = DEFAULTS.debt; $('#shares').value = DEFAULTS.shares; $('#mid').checked = DEFAULTS.mid;
  $(`#y${DEFAULTS.years}`).checked = true; $('#p-fade').checked = true;
  renderDCF();
}
form.addEventListener('input', renderDCF);
form.addEventListener('change', renderDCF);
$('#dcf-reset').addEventListener('click', resetDCF);
$('#dcf-csv').addEventListener('click', () => {
  if (!lastDCF) return;
  const { inp, r } = lastDCF;
  const rows = r.rows.map((x) => [x.t, x.g.toFixed(4), x.fcf.toFixed(2), x.df.toFixed(6), x.pv.toFixed(2)]);
  rows.push(['terminal', inp.gT.toFixed(4), r.tv.toFixed(2), (r.pvTV / r.tv).toFixed(6), r.pvTV.toFixed(2)]);
  rows.push([]); rows.push(['enterprise_value', '', '', '', r.ev.toFixed(2)]); rows.push(['equity_value', '', '', '', r.equity.toFixed(2)]);
  rows.push(['wacc', inp.wacc]); rows.push(['terminal_growth', inp.gT]); rows.push(['mid_year', inp.mid]);
  download('dcf-schedule.csv', toCSV(['year', 'growth', 'free_cash_flow_m', 'discount_factor', 'present_value_m'], rows));
});
renderDCF();
onResize($('#dcf-chart'), renderDCF);

