// finance.js — discounted cash flow and Altman Z-score.
import { initSite } from '../core/site.js?v=2';
import { $, $$, h, s, download, toCSV, onResize } from '../core/dom.js?v=2';
import * as F from '../core/format.js?v=2';
import { barChart, tableTwin } from '../core/charts.js?v=2';

initSite();

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

function verdict(kind, title, text) {
  const icons = {
    good: 'M5 10.5l3.2 3.2L15 7', warn: 'M10 5.5v5.2M10 14.2v.3', bad: 'M6.5 6.5l7 7M13.5 6.5l-7 7',
  };
  return h('div', { class: `verdict is-${kind}` },
    s('svg', { viewBox: '0 0 20 20', 'aria-hidden': 'true' }, s('circle', { cx: 10, cy: 10, r: 8.6, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6 }), s('path', { d: icons[kind], fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })),
    h('p', {}, h('strong', {}, title), ' ', text));
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
