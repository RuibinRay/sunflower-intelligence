// sbg.js — the `sbg` lesson widget (M06): project contractual retention. The share of a cohort still subscribed after
// each period, with two projections fitted to the first few periods only (the student sets how many): constant
// retention (one churn rate for everyone, the "average churn" a spreadsheet uses) and the shifted-beta-geometric model,
// in which each customer has their own churn rate drawn from a beta distribution, so the flighty leave first and the
// retention rate rises. The periods after the fitting window show which projection holds; a second chart shows the
// period-by-period retention rates. Numbers from core/customer.js.
//   { type: 'sbg', title, cohorts: [{ name?, alive: [n0, n1, …] }] (pooled when several), fit: 7 (periods used),
//     fitRange: [3, 12], horizon: 24 (periods projected), unit: 'year' | 'month', note }
import { h, onResize } from '../../core/dom.js?v=25';
import { xl } from '../xl.js?v=25';
import { lineChart } from '../../core/charts.js?v=25';
import * as CU from '../../core/customer.js?v=25';
import * as F from '../../core/format.js?v=25';

/** Both fits to the first `fit` periods of the cohorts (exported for the checker). Constant retention is fitted by
 *  maximum likelihood too: renewals ÷ chances to renew over the window, pooled across cohorts. */
export function compute(cohorts, fit) {
  const cut = cohorts.map((c) => ({ alive: c.alive.slice(0, fit + 1) }));
  const s = CU.sbgFit(cut);
  let renew = 0, chances = 0;
  for (const { alive } of cut) for (let t = 1; t < alive.length; t++) { renew += alive[t]; chances += alive[t - 1]; }
  return { sbg: s, r: renew / chances };
}

export function mount(el, cfg, ctx) {
  const base = `sb-${ctx.id}`;
  const cohorts = cfg.cohorts, unit = cfg.unit || 'period';
  const maxObs = Math.max(...cohorts.map((c) => c.alive.length - 1));
  const [lo, hi] = cfg.fitRange || [2, Math.max(2, maxObs - 1)];
  const st = { fit: Math.min(cfg.fit || lo, maxObs) };
  const horizon = Math.max(cfg.horizon || maxObs, maxObs);
  const id = `${base}-f`, inp = h('input', { type: 'range', id, min: lo, max: Math.min(hi, maxObs), step: 1, value: st.fit }), outF = h('output', { for: id });
  inp.addEventListener('input', () => { st.fit = +inp.value; render(); });
  const chart = h('div', { class: 'chart-box' }), chart2 = h('div', { class: 'chart-box' }), out = h('div', { class: 'cv-out', 'aria-live': 'polite' });
  el.classList.add('cv-widget');
  el.append(...[cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null,
    h('div', { class: 'field' }, h('label', { for: id }, `Fit both models to the first `, outF, ` ${unit}s`), inp), chart, out,
    h('p', { class: 'fx-title' }, `Retention rate in each ${unit}: the share of those still subscribed who renew`), chart2,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null].filter(Boolean));

  function render() {
    outF.textContent = String(st.fit);
    const { sbg, r } = compute(cohorts, st.fit);
    const n0 = cohorts.reduce((s, c) => s + c.alive[0], 0);
    const xs = Array.from({ length: horizon + 1 }, (_, t) => t);
    // actual: pooled share surviving, over the cohorts observed that far
    const actual = xs.map((t) => { const obs = cohorts.filter((c) => t < c.alive.length); return obs.length ? obs.reduce((s, c) => s + c.alive[t], 0) / obs.reduce((s, c) => s + c.alive[0], 0) : NaN; });
    chart.replaceChildren();
    lineChart(chart, { endLabels: false, xs, series: [{ name: 'Actual', values: actual, cls: 'm-s1' }, { name: 'sBG', values: xs.map((t) => sbg.S(t)), cls: 'm-s2' }, { name: 'Constant', values: xs.map((t) => r ** t), cls: 'm-s3' }],
      height: 280, xLabel: `${unit[0].toUpperCase()}${unit.slice(1)}s since joining`, yLabel: 'Share still subscribed', yFormat: (v) => F.pct(v, 0), xFormat: (v) => String(v), yDomain: [0, 1], highlightX: st.fit,
      label: `Share still subscribed: actual, the sBG model and constant retention, both fitted to the first ${st.fit} ${unit}s` });
    const rate = (t) => { const obs = cohorts.filter((c) => t < c.alive.length && c.alive[t - 1] > 0); return obs.length ? obs.reduce((s, c) => s + c.alive[t], 0) / obs.reduce((s, c) => s + c.alive[t - 1], 0) : NaN; };
    const xr = xs.slice(1);
    chart2.replaceChildren();
    lineChart(chart2, { endLabels: false, xs: xr, series: [{ name: 'Actual', values: xr.map(rate), cls: 'm-s1' }, { name: 'sBG', values: xr.map((t) => sbg.r(t)), cls: 'm-s2' }, { name: 'Constant', values: xr.map(() => r), cls: 'm-s3' }],
      height: 220, xLabel: `${unit[0].toUpperCase()}${unit.slice(1)}`, yLabel: 'Retention rate', yFormat: (v) => F.pct(v, 0), xFormat: (v) => String(v), highlightX: st.fit, label: 'Retention rate by period: actual, sBG and constant' });
    const last = maxObs, lastActual = actual[last];
    out.replaceChildren(h('ul', { class: 'sc-stats' },
      h('li', {}, h('b', {}, 'sBG: '), `α = ${F.num(sbg.alpha, 3)} (s.e. ${F.num(sbg.seAlpha, 3)}), β = ${F.num(sbg.beta, 3)} (s.e. ${F.num(sbg.seBeta, 3)}); mean churn α ÷ (α + β) = ${F.pct(sbg.meanChurn, 1)}; log-likelihood ${F.num(sbg.logLik, 2)}.`),
      h('li', {}, h('b', {}, 'Constant retention: '), `r = ${F.pct(r, 1)} a ${unit} (churn ${F.pct(1 - r, 1)}).`),
      h('li', {}, h('b', {}, `After ${last} ${unit}s: `), `actual ${F.pct(lastActual, 1)}; sBG ${F.pct(sbg.S(last), 1)}; constant ${F.pct(r ** last, 1)}.`),
      h('li', {}, h('b', {}, 'Customers: '), `${F.int(n0)} in ${cohorts.length} cohort${cohorts.length > 1 ? 's' : ''}.`)));
  }
  render();
  onResize(chart, render);
}
