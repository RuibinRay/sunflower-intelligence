// clv.js — the `clv` lesson widget (M06): what a customer is worth over time. Sliders for the margin per period, the
// retention rate, the discount rate and the cost of acquiring the customer; the cumulative expected (discounted)
// margin per customer acquired, period by period, against the acquisition cost, with the payback period and the
// lifetime value. With `sbg`, a second curve uses a fitted sBG model's rising retention (the α and β given; the
// retention slider doesn't move it) with the same margin and discount rate, to show what assuming everyone is alike
// does to the value. Numbers from core/customer.js.
//   { type: 'clv', title, m: 4, r: 0.9, d: 0.01, cac: 20, ranges: { m: [lo, hi, step], r: [...], d: [...], cac: [...] },
//     timing: 'start' | 'end', horizon: 60, unit: 'month', sbg?: { alpha, beta }, note }
import { h, onResize } from '../../core/dom.js?v=28';
import { xl } from '../xl.js?v=28';
import { lineChart } from '../../core/charts.js?v=28';
import * as CU from '../../core/customer.js?v=28';
import * as F from '../../core/format.js?v=28';

/** Everything the widget shows for a set of inputs (exported for the checker). */
export function compute({ m, r, d, cac, timing = 'start', horizon = 60, sbg = null }) {
  const c = CU.clvConstant({ m, r, d, timing });
  const cum = c.curve(horizon);
  const pay = timing === 'start' ? CU.payback({ cac, m, r, d }) : (() => { const k = cum.findIndex((v) => v >= cac - 1e-9); return k < 0 ? Infinity : k + 1; })();
  let s = null;
  if (sbg) {
    const del = CU.sbgDEL(sbg.alpha, sbg.beta, d), vals = []; let acc = 0;
    for (let t = 0; t < horizon; t++) { acc += m * CU.sbgS(sbg.alpha, sbg.beta, t) / (1 + d) ** t; vals.push(acc); }
    s = { value: m * del, curve: vals, payback: (() => { const k = vals.findIndex((v) => v >= cac - 1e-9); return k < 0 ? Infinity : k + 1; })() };
  }
  return { clv: c.value, multiple: c.multiple, curve: cum, payback: pay, simple: CU.simplePayback(cac, m), ratio: c.value / cac, sbg: s };
}

export function mount(el, cfg, ctx) {
  const base = `cl-${ctx.id}`;
  const unit = cfg.unit || 'period', horizon = cfg.horizon || 60, timing = cfg.timing || 'start';
  const st = { m: cfg.m, r: cfg.r, d: cfg.d ?? 0, cac: cfg.cac ?? 0 };
  const rg = Object.assign({ m: [0.5, 20, 0.25], r: [0.5, 0.99, 0.01], d: [0, 0.05, 0.0025], cac: [0, 100, 1] }, cfg.ranges || {});
  const labels = { m: `Margin per ${unit} ($)`, r: `Retention per ${unit}`, d: `Discount rate per ${unit}`, cac: 'Acquisition cost ($)' };
  const show = (k, v) => (k === 'r' || k === 'd' ? F.pct(v, k === 'd' ? 2 : 0) : F.num(v, 2));
  const sliders = Object.keys(labels).map((k) => {
    const id = `${base}-${k}`, inp = h('input', { type: 'range', id, min: rg[k][0], max: rg[k][1], step: rg[k][2], value: st[k] }), o = h('output', { for: id });
    inp.addEventListener('input', () => { st[k] = +inp.value; render(); });
    return { k, o, row: h('div', { class: 'field' }, h('label', { for: id }, labels[k], ' ', o), inp) };
  });
  const chart = h('div', { class: 'chart-box' }), out = h('div', { class: 'cv-out', 'aria-live': 'polite' });
  el.classList.add('cv-widget');
  el.append(...[cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null, h('div', { class: 'cv-fields' }, ...sliders.map((s) => s.row)), chart, out,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null].filter(Boolean));

  function render() {
    sliders.forEach((s) => { s.o.textContent = show(s.k, st[s.k]); });
    const R = compute({ ...st, timing, horizon, sbg: cfg.sbg });
    const xs = Array.from({ length: horizon }, (_, t) => t + 1);
    const series = [{ name: 'Constant retention', values: R.curve, cls: 'm-s1' }];
    if (R.sbg) series.push({ name: 'sBG', values: R.sbg.curve, cls: 'm-s3' });
    series.push({ name: 'Acquisition cost', values: xs.map(() => st.cac), cls: 'm-s2' });
    chart.replaceChildren();
    lineChart(chart, { endLabels: false, xs, series, height: 260, xLabel: `${unit[0].toUpperCase()}${unit.slice(1)}s`, yLabel: 'Cumulative value per customer ($)', yFormat: (v) => F.num(v, 0), xFormat: (v) => String(v),
      label: `Cumulative discounted margin per customer acquired over ${horizon} ${unit}s, against the acquisition cost` });
    const pb = (p) => (Number.isFinite(p) ? `${p} ${unit}${p === 1 ? '' : 's'}` : 'never');
    out.replaceChildren(h('ul', { class: 'sc-stats' },
      h('li', {}, h('b', {}, 'Lifetime value: '), `${F.money(R.clv, { digits: 2 })} = ${F.num(st.m, 2)} × ${timing === 'start' ? `(1 + ${F.num(st.d, 4)}) ÷ (1 + ${F.num(st.d, 4)} − ${F.num(st.r, 2)})` : `${F.num(st.r, 2)} ÷ (1 + ${F.num(st.d, 4)} − ${F.num(st.r, 2)})`}, ${F.num(R.multiple, 2)} times the margin per ${unit}.`),
      h('li', {}, h('b', {}, 'Payback: '), `${pb(R.payback)} with retention and discounting; ${F.num(R.simple, 1)} ${unit}s if every customer stayed (acquisition cost ÷ margin).`),
      h('li', {}, h('b', {}, 'Value ÷ acquisition cost: '), st.cac > 0 ? F.num(R.ratio, 2) : '—'),
      ...(R.sbg ? [h('li', {}, h('b', {}, 'With sBG retention: '), `lifetime value ${F.money(R.sbg.value, { digits: 2 })}, payback ${pb(R.sbg.payback)} (α = ${F.num(cfg.sbg.alpha, 3)}, β = ${F.num(cfg.sbg.beta, 3)}).`)] : [])));
  }
  render();
  onResize(chart, render);
}
