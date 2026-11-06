// capbudget.js — the `capbudget` lesson widget (F05): a capital-budgeting model a student can push around. Sliders
// for a project's drivers (volume, price, costs, the discount rate…); the free-cash-flow table year by year (revenue to
// EBIT, tax, operating cash flow, capital spending, working capital, after-tax salvage); NPV, IRR, MIRR, payback,
// discounted payback and the profitability index; the NPV profile (NPV against the discount rate, crossing zero at the
// IRR); and a tornado of one-at-a-time sensitivities. Numbers from core/corpfin.js projectCashFlows and core/invest.js.
//   { type: 'capbudget', title, inputs: [{ id, label, min, max, step, value, fmt: 'money'|'pct'|'int'|'num', unit }],
//     model: (v) => projectCashFlows inputs, rate: 'rate' (the id of an input in %, 11 = 11%) | 0.11,
//     show: ['metrics', 'table', 'profile', 'tornado'], tornado?: { inputId: [low, high] }, profileMax?: 0.4, note }
import { h, onResize } from '../../core/dom.js?v=28';
import { xl } from '../xl.js?v=28';
import { lineChart, barChart, tableTwin } from '../../core/charts.js?v=28';
// (fillRange inlined: core/site.js touches document at load, and the checker imports this file in Node)
const fillRange = (el) => { const min = el.min === '' ? 0 : +el.min, max = el.max === '' ? 100 : +el.max; el.style.setProperty('--fill', `${((+el.value - min) / (max - min || 1)) * 100}%`); };
import * as CF from '../../core/corpfin.js?v=28';
import { appraise, npv } from '../../core/invest.js?v=28';
import * as F from '../../core/format.js?v=28';

const rateOf = (cfg, v) => (typeof cfg.rate === 'string' ? v[cfg.rate] / 100 : cfg.rate ?? 0.1);
const npvAt = (cfg, v) => npv(rateOf(cfg, v), CF.projectCashFlows(cfg.model(v)).fcf);

/** Everything the widget shows for a set of input values (exported for the checker). */
export function compute(cfg, v) {
  const p = CF.projectCashFlows(cfg.model(v)), r = rateOf(cfg, v), a = appraise(p.fcf, { rate: r });
  const tornado = cfg.tornado ? CF.sensitivity((x) => npvAt(cfg, x), v, cfg.tornado) : null;
  return { ...a, rate: r, rows: p.rows, fcf: p.fcf, tornado };
}

function digitsOf(inp) { return inp.digits ?? (inp.step < 1 ? Math.min(3, Math.ceil(-Math.log10(inp.step) - 1e-9)) : 0); }
function show(inp, v) {
  const d = digitsOf(inp), u = inp.unit ? ` ${inp.unit}` : '';
  if (inp.fmt === 'pct') return `${F.num(v, d)}%`;
  if (inp.fmt === 'money') return `${F.money(v, { digits: d })}${u}`;
  if (inp.fmt === 'int') return `${F.int(v)}${u}`;
  return `${F.num(v, d)}${u}`;
}
const money = (v) => (Math.abs(v) < 0.5 ? '0' : F.int(v));

export function mount(el, cfg, ctx) {
  const base = `cb-${ctx.id}`;
  const showing = cfg.show || ['metrics', 'table', 'profile'];
  const controls = cfg.inputs.map((inp) => {
    const rid = `${base}-${inp.id}`;
    const range = h('input', { type: 'range', id: rid, min: inp.min, max: inp.max, step: inp.step, value: inp.value });
    const out = h('output', { for: rid });
    const exact = h('input', { class: 'input fx-num', type: 'number', min: inp.min, max: inp.max, step: inp.step, value: inp.value, 'aria-label': `${inp.label}: type an exact value` });
    return { inp, range, out, exact, field: h('div', { class: 'slider-field' }, h('div', { class: 'slider-top' }, h('label', { for: rid }, inp.label), out), range, exact) };
  });
  const reset = h('button', { type: 'button', class: 'btn btn-secondary btn-sm fx-reset' }, 'Reset');
  const stats = h('div', { class: 'cv-out', 'aria-live': 'polite' }), table = h('div'), profile = h('div', { class: 'chart-box' }), tornado = h('div', { class: 'chart-box' }), tnote = h('p', { class: 'fx-note' });
  el.classList.add('cv-widget');
  el.append(...[cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null,
    h('div', { class: 'fx-inputs', role: 'group', 'aria-label': `${cfg.title || 'Project'} inputs` }, controls.map((c) => c.field), reset),
    stats, showing.includes('table') ? table : null, showing.includes('profile') ? profile : null, showing.includes('tornado') && cfg.tornado ? tornado : null, showing.includes('tornado') && cfg.tornado ? tnote : null,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null].filter(Boolean));

  let R = null, v = {};
  function run() {
    v = {};
    controls.forEach((c) => { v[c.inp.id] = +c.range.value; c.out.textContent = show(c.inp, +c.range.value); fillRange(c.range); });
    try { R = compute(cfg, v); } catch { R = null; }
    if (!R) { stats.replaceChildren(h('p', { class: 'is-error' }, 'These inputs can’t be calculated.')); return; }
    const yrs = (x) => (Number.isFinite(x) ? `${F.num(x, 2)} years` : 'not within the project’s life');
    const irrText = R.irrs.length === 1 ? F.pct(R.irr, 1) : R.irrs.length === 0 ? 'none (the NPV never crosses zero)' : `${R.irrs.length} rates (${R.irrs.map((x) => F.pct(x, 1)).join(' and ')}): the cash flows change sign ${R.signChanges} times`;
    if (showing.includes('metrics')) stats.replaceChildren(h('ul', { class: 'sc-stats' },
      h('li', {}, h('b', {}, `NPV at ${F.pct(R.rate, 1)}: `), F.money(R.npv, { digits: 0 }), R.npv >= 0 ? ' (accept: it adds value at this rate)' : ' (reject at this rate)'),
      h('li', {}, h('b', {}, 'IRR: '), irrText),
      h('li', {}, h('b', {}, 'MIRR: '), Number.isFinite(R.mirr) ? `${F.pct(R.mirr, 1)} (financing and reinvestment at ${F.pct(R.rate, 1)})` : '—'),
      h('li', {}, h('b', {}, 'Payback: '), `${yrs(R.payback)}; discounted payback ${yrs(R.discPayback)}`),
      h('li', {}, h('b', {}, 'Profitability index: '), Number.isFinite(R.pi) ? F.num(R.pi, 2) : '—')));
    else stats.replaceChildren(h('p', {}, h('b', {}, `NPV at ${F.pct(R.rate, 1)}: `), F.money(R.npv, { digits: 0 })));
    if (showing.includes('table')) {
      const cols = R.rows.map((r) => ({ label: `Year ${r.t}`, num: true }));
      const line = (label, key, sign = 1, skip0 = false) => [label, ...R.rows.map((r) => (skip0 && r.t === 0 ? '' : money(sign * r[key])))];
      const rows = [line('Revenue', 'revenue', 1, true), line('− Variable costs', 'variable', 1, true), line('− Fixed costs', 'fixed', 1, true), line('− Depreciation', 'depreciation', 1, true), line('= EBIT', 'ebit', 1, true),
        line('− Tax on EBIT', 'taxes', 1, true), line('+ Depreciation', 'depreciation', 1, true), line('= Operating cash flow', 'ocf', 1, true), line('− Capital spending', 'capex'),
        ...(R.rows.some((r) => r.upfront) ? [line('− Up-front costs after tax', 'upfront')] : []), ...(R.rows.some((r) => r.side) ? [line('+ Effects on other cash flows', 'side')] : []),
        line('Working capital held', 'nwc'), line('− Increase in working capital', 'dNwc'), line('+ Salvage after tax', 'salvage'), line('= Free cash flow', 'fcf'),
        ['Discounted at ' + F.pct(R.rate, 1), ...R.fcf.map((f, t) => money(f / (1 + R.rate) ** t))]];
      table.replaceChildren(h('div', { class: 'table-scroll' }, h('table', { class: 'data-table study-table' }, h('caption', {}, 'Free cash flow by year ($)'),
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, ''), ...cols.map((c) => h('th', { scope: 'col' }, c.label)))),
        h('tbody', {}, ...rows.map(([lab, ...cells]) => h('tr', /^=/.test(lab) ? { class: 'is-total' } : {}, h('th', { scope: 'row' }, lab), ...cells.map((c) => h('td', {}, c))))))));
    }
    draw();
  }
  function draw() {
    if (!R) return;
    if (showing.includes('profile')) {
      const top = cfg.profileMax ?? Math.max(0.3, Math.min(1, (Number.isFinite(R.irr) ? R.irr : 0.2) * 1.5));
      const xs = Array.from({ length: 41 }, (_, i) => top * i / 40);
      profile.replaceChildren();
      lineChart(profile, { endLabels: false, xs, series: [{ name: 'NPV', values: xs.map((r) => npv(r, R.fcf)), cls: 'm-s1' }, { name: 'NPV = 0', values: xs.map(() => 0), cls: 'm-s2' }], height: 240,
        xLabel: 'Discount rate', yLabel: 'NPV ($)', xFormat: (x) => F.pct(x, 0), yFormat: (y) => F.num(y, 0), highlightX: R.rate,
        label: `NPV profile: NPV against the discount rate from 0% to ${F.pct(top, 0)}${Number.isFinite(R.irr) ? `, crossing zero at the IRR, ${F.pct(R.irr, 1)}` : ''}` });
      tableTwin(profile, { caption: 'NPV at each discount rate', columns: [{ label: 'Rate' }, { label: 'NPV ($)', num: true }], rows: xs.filter((_, i) => i % 4 === 0).map((r) => [F.pct(r, 1), money(npv(r, R.fcf))]) });
    }
    if (showing.includes('tornado') && R.tornado) {
      const lab = (id) => cfg.inputs.find((i) => i.id === id)?.label || id;
      tornado.replaceChildren();
      barChart(tornado, { horizontal: true, categories: R.tornado.map((t) => lab(t.name)), series: [{ name: 'NPV at the low value', values: R.tornado.map((t) => t.lowNpv), cls: 'm-s3' }, { name: 'NPV at the high value', values: R.tornado.map((t) => t.highNpv), cls: 'm-s1' }],
        format: (y) => F.num(y, 0), label: 'Tornado: NPV with each input moved to its low and high value, the others as set above, widest swing first' });
      tnote.textContent = `Each pair of bars moves one input, the others held where the sliders are (NPV ${F.money(R.npv, { digits: 0 })}). ${R.tornado.map((t) => `${lab(t.name)} ${show(cfg.inputs.find((i) => i.id === t.name) || {}, t.low)} to ${show(cfg.inputs.find((i) => i.id === t.name) || {}, t.high)}: NPV ${F.money(t.lowNpv, { digits: 0 })} to ${F.money(t.highNpv, { digits: 0 })}`).join('; ')}.`;
    }
  }
  let raf = 0;
  const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(run); };
  controls.forEach((c) => {
    c.range.addEventListener('input', () => { c.exact.value = c.range.value; schedule(); });
    c.exact.addEventListener('change', () => { let val = +c.exact.value; if (!Number.isFinite(val) || c.exact.value === '') val = +c.range.value; val = Math.min(+c.inp.max, Math.max(+c.inp.min, val)); c.exact.value = val; c.range.value = val; schedule(); });
  });
  reset.addEventListener('click', () => { controls.forEach((c) => { c.range.value = c.inp.value; c.exact.value = c.inp.value; }); run(); ctx.report?.('reset'); });
  run();
  onResize(profile, draw);
}
