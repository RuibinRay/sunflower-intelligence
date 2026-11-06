// capstructure.js — the `capstructure` lesson widget (F05): the cost of capital and leverage. Peers' equity betas are
// unlevered (Hamada: β_U = β_L ÷ (1 + (1 − T) D/E)) and averaged; the student picks a debt share D/V; the average is
// relevered at that D/E, CAPM gives the cost of equity (plus any extra premium), the cost of debt comes from `rates`
// (higher as leverage rises, if given) and the WACC follows. The chart draws the cost of equity, the after-tax cost of
// debt and the WACC across debt shares; a tax switch shows the Modigliani–Miller cases (without tax the WACC stays flat
// when debt is priced at the risk-free rate; with tax it falls). With `Vu`, the value of the levered firm
// V_L = V_U + T·D is shown too. Numbers from core/corpfin.js.
//   { type: 'capstructure', title, peers: [{ name, beta, de, tax }], rf, mrp, premium?: 0.03, tax, rD | rates: [[upToDV, rD], …],
//     dv: 0.2, dvMax: 0.7, taxToggle?: true, Vu?: 250000, note }
import { h, onResize } from '../../core/dom.js?v=28';
import { xl } from '../xl.js?v=28';
import { lineChart, tableTwin } from '../../core/charts.js?v=28';
// (fillRange inlined: core/site.js touches document at load, and the checker imports this file in Node)
const fillRange = (el) => { const min = el.min === '' ? 0 : +el.min, max = el.max === '' ? 100 : +el.max; el.style.setProperty('--fill', `${((+el.value - min) / (max - min || 1)) * 100}%`); };
import * as CF from '../../core/corpfin.js?v=28';
import * as F0 from '../../core/format.js?v=28';
// Percentages nudged by a hair before rounding, so 5.625% shows as 5.63% (0.075 × 0.75 is 0.056249999… in floating point).
const F = { ...F0, pct: (x, d = 1) => F0.pct(Number.isFinite(x) ? x + Math.sign(x) * 1e-12 : x, d) };
import { segmented } from '../dist-draw.js?v=28';

/** Cost of debt at debt share dv: the first band whose upper limit is at least dv (the last band beyond). */
export function debtRate(cfg, dv) {
  if (!cfg.rates) return cfg.rD;
  const band = cfg.rates.find(([upTo]) => dv <= upTo + 1e-12);
  return (band || cfg.rates[cfg.rates.length - 1])[1];
}
/** Everything at one debt share (exported for the checker). */
export function compute(cfg, dv, tax = cfg.tax) {
  const peers = cfg.peers.map((p) => ({ ...p, betaU: CF.unleverBeta(p.beta, p.de, p.tax ?? cfg.tax) }));
  const betaU = peers.reduce((s, p) => s + p.betaU, 0) / peers.length;
  const de = dv / (1 - dv), betaL = CF.releverBeta(betaU, de, tax);
  const rE = CF.capm({ rf: cfg.rf, beta: betaL, mrp: cfg.mrp }) + (cfg.premium || 0), rD = debtRate(cfg, dv);
  const w = CF.wacc({ E: 1 - dv, D: dv, rE, rD, tax });
  const rU = CF.capm({ rf: cfg.rf, beta: betaU, mrp: cfg.mrp }) + (cfg.premium || 0);
  const VL = cfg.Vu ? cfg.Vu / (1 - tax * dv) : null;
  return { peers, betaU, de, betaL, rE, rD, rDafter: rD * (1 - tax), wacc: w.wacc, rU, VL, D: VL != null ? dv * VL : null };
}

export function mount(el, cfg, ctx) {
  const base = `cs-${ctx.id}`, max = cfg.dvMax ?? 0.7;
  const st = { dv: cfg.dv ?? 0.2, tax: cfg.tax };
  const rid = `${base}-dv`;
  const range = h('input', { type: 'range', id: rid, min: 0, max, step: 0.01, value: st.dv }), out = h('output', { for: rid });
  range.addEventListener('input', () => { st.dv = +range.value; render(); });
  const fields = [h('div', { class: 'slider-field' }, h('div', { class: 'slider-top' }, h('label', { for: rid }, 'Debt as a share of the firm’s value, D/V'), out), range)];
  if (cfg.taxToggle) fields.push(segmented(`${base}-tax`, 'Corporate tax', [['0', 'None'], [String(cfg.tax), F.pct(cfg.tax, 0)]], String(cfg.tax), (x) => { st.tax = +x; render(); }));
  const peerBox = h('div'), stats = h('div', { class: 'cv-out', 'aria-live': 'polite' }), chart = h('div', { class: 'chart-box' });
  el.classList.add('cv-widget');
  el.append(...[cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null, peerBox, h('div', { class: 'fx-inputs' }, ...fields), stats, chart,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null].filter(Boolean));

  function render() {
    out.textContent = F.pct(st.dv, 0); fillRange(range);
    const R = compute(cfg, st.dv, st.tax);
    peerBox.replaceChildren(h('div', { class: 'table-scroll' }, h('table', { class: 'data-table study-table' }, h('caption', {}, 'Comparable firms: unlevering their betas'),
      h('thead', {}, h('tr', {}, ...['Firm', 'Equity beta', 'D/E', 'Tax rate', 'Unlevered beta'].map((c) => h('th', { scope: 'col' }, c)))),
      h('tbody', {}, ...R.peers.map((p) => h('tr', {}, h('th', { scope: 'row' }, p.name), h('td', {}, F.num(p.beta, 2)), h('td', {}, F.num(p.de, 2)), h('td', {}, F.pct(p.tax ?? cfg.tax, 0)), h('td', {}, F.num(p.betaU, 3)))),
        h('tr', { class: 'is-total' }, h('th', { scope: 'row' }, 'Average'), h('td', {}, ''), h('td', {}, ''), h('td', {}, ''), h('td', {}, F.num(R.betaU, 3)))))));
    stats.replaceChildren(h('ul', { class: 'sc-stats' },
      h('li', {}, h('b', {}, 'Relevered beta: '), `${F.num(R.betaU, 3)} × (1 + (1 − ${F.pct(st.tax, 0)}) × ${F.num(R.de, 3)}) = ${F.num(R.betaL, 3)} at D/E ${F.num(R.de, 3)}`),
      h('li', {}, h('b', {}, 'Cost of equity: '), `${F.pct(cfg.rf, 1)} + ${F.num(R.betaL, 3)} × ${F.pct(cfg.mrp, 1)}${cfg.premium ? ` + ${F.pct(cfg.premium, 1)}` : ''} = ${F.pct(R.rE, 2)}`),
      h('li', {}, h('b', {}, 'Cost of debt: '), `${F.pct(R.rD, 2)} before tax, ${F.pct(R.rDafter, 2)} after tax`),
      h('li', {}, h('b', {}, 'WACC: '), `${F.pct(1 - st.dv, 0)} × ${F.pct(R.rE, 2)} + ${F.pct(st.dv, 0)} × ${F.pct(R.rDafter, 2)} = ${F.pct(R.wacc, 2)}`),
      ...(R.VL != null ? [h('li', {}, h('b', {}, 'Firm value: '), `${F.money(cfg.Vu)} unlevered + ${F.pct(st.tax, 0)} × debt ${F.money(R.D)} = ${F.money(R.VL)}`)] : [])));
    const xs = Array.from({ length: Math.round(max * 100) + 1 }, (_, i) => i / 100);
    const pts = xs.map((d) => compute(cfg, d, st.tax));
    chart.replaceChildren();
    lineChart(chart, { endLabels: false, xs, highlightX: st.dv, height: 260, xLabel: 'Debt share D/V', yLabel: 'Rate', xFormat: (x) => F.pct(x, 0), yFormat: (y) => F.pct(y, Math.abs(y * 100 - Math.round(y * 100)) > 1e-9 ? 1 : 0),
      series: [{ name: 'Cost of equity', values: pts.map((p) => p.rE), cls: 'm-s1' }, { name: 'WACC', values: pts.map((p) => p.wacc), cls: 'm-s3' }, { name: 'Cost of debt after tax', values: pts.map((p) => p.rDafter), cls: 'm-s2' }],
      label: `Cost of equity, WACC and after-tax cost of debt for debt shares from 0% to ${F.pct(max, 0)}, with tax at ${F.pct(st.tax, 0)}` });
    tableTwin(chart, { caption: 'Rates by debt share', columns: [{ label: 'D/V' }, { label: 'Cost of equity', num: true }, { label: 'After-tax cost of debt', num: true }, { label: 'WACC', num: true }],
      rows: pts.filter((_, i) => i % 10 === 0).map((p, i) => [F.pct(i / 10, 0), F.pct(p.rE, 2), F.pct(p.rDafter, 2), F.pct(p.wacc, 2)]) });
  }
  render();
  onResize(chart, render);
}
