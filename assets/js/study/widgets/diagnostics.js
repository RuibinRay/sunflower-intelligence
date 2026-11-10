// diagnostics.js — the `diagnostics` lesson widget (B06): residual plots for a least-squares model, so a model is
// never judged by its coefficients alone. Residuals against fitted values (curvature, funnels), a normal Q–Q plot of
// the studentized residuals, the scale–location plot (√|studentized residual| against fitted), residuals against
// leverage with Cook's distance, and residuals in time order with the Durbin–Watson statistic. Optional toggles take
// logs of y or add or remove predictors. Numbers from core/regression.js.
//   { type: 'diagnostics', title, y: { name, values }, xs: { 'High (°F)': [...], … }, picked?: ['High (°F)'] (default all),
//     choose?: true (offer the predictors as checkboxes), toggles?: ['logY'], plots: ['fitted', 'qq', 'scale', 'leverage', 'order'],
//     labels?: ['1 Mar', …], note }
import { h, s, onResize } from '../../core/dom.js?v=30';
import { xl } from '../xl.js?v=30';
import { scatter } from '../../core/charts.js?v=30';
import * as R from '../../core/regression.js?v=30';
import * as F from '../../core/format.js?v=30';

const fmt = (v, d = 3) => (Number.isFinite(v) ? F.num(v, d) : '—');
const pStr = (p) => (!Number.isFinite(p) ? '—' : p < 0.001 ? 'below 0.001' : p.toFixed(3));
const TITLES = { fitted: 'Residuals against fitted values', qq: 'Normal Q–Q plot of the studentized residuals', scale: 'Scale–location', leverage: 'Residuals against leverage', order: 'Residuals in time order' };

/** Everything the widget shows for a choice of predictors (exported for the checker). */
export function compute(y, xs, names, { logY = false } = {}) {
  const yy = logY ? y.map(Math.log) : y;
  const cols = names.map((n) => xs[n]);
  const f = R.fit(yy, Object.fromEntries(names.map((n) => [n, xs[n]])));
  if (f.error) return { error: f.error };
  const I = R.influence(cols, yy), bp = R.breuschPagan(cols, f.resid);
  return { fit: f, inf: I, bp, dw: R.durbinWatson(f.resid), maxCooks: Math.max(...I.cooks) };
}

export function mount(el, cfg, ctx) {
  const base = `dg-${ctx.id}`;
  const names = Object.keys(cfg.xs);
  const st = { picked: new Set(cfg.picked || names), logY: false };
  const plots = cfg.plots || ['fitted', 'qq'];
  const toggle = (id, label, on, fn) => { const inp = h('input', { type: 'checkbox', id, ...(on ? { checked: '' } : {}) }); inp.addEventListener('change', () => fn(inp.checked)); return h('div', { class: 'field sp-check' }, inp, h('label', { for: id }, label)); };
  const controls = h('div', { class: 'sp-toggles' },
    ...(cfg.choose ? names.map((n, i) => toggle(`${base}-x${i}`, n, st.picked.has(n), (on) => { if (on) st.picked.add(n); else st.picked.delete(n); render(); })) : []),
    ...((cfg.toggles || []).includes('logY') ? [toggle(`${base}-log`, `Use the natural log of ${cfg.y.name}`, false, (on) => { st.logY = on; render(); })] : []));
  const box = h('div', { class: `dg-plots${plots.length >= 4 ? ' is-four' : ''}` });
  const out = h('div', { class: 'cv-out', 'aria-live': 'polite' });
  el.classList.add('cv-widget');
  el.append(...[cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null, controls.childNodes.length ? controls : null, out, box,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null].filter(Boolean));

  function render() {
    const use = names.filter((n) => st.picked.has(n));
    box.replaceChildren();
    if (!use.length) { out.replaceChildren(h('p', { class: 'fx-note is-error' }, 'Choose at least one predictor.')); return; }
    const D = compute(cfg.y.values, cfg.xs, use, { logY: st.logY });
    if (D.error) { out.replaceChildren(h('p', { class: 'fx-note is-error' }, D.error)); return; }
    const { fit, inf } = D, n = fit.n, lab = (i) => (cfg.labels ? cfg.labels[i] : `row ${i + 1}`);
    const yName = st.logY ? `ln ${cfg.y.name}` : cfg.y.name;
    const line = (label, v) => h('li', {}, h('b', {}, `${label}: `), v);
    out.replaceChildren(h('ul', { class: 'sc-stats' },
      line('Model', `${yName} on ${use.join(', ')} (${n} rows)`), line('R²', fmt(fit.r2)), line('Residual standard error', fmt(fit.sigma)),
      line('Breusch–Pagan test of constant variance (Koenker)', `LM = ${fmt(D.bp.lm, 2)}, p ${D.bp.p < 0.001 ? 'below 0.001' : `= ${pStr(D.bp.p)}`}`),
      ...(plots.includes('order') ? [line('Durbin–Watson', fmt(D.dw, 2))] : []),
      ...(plots.includes('leverage') ? [line('Largest Cook’s distance', `${fmt(D.maxCooks)} (${lab(inf.cooks.indexOf(D.maxCooks))})`)] : [])));
    for (const kind of plots) {
      const wrap = h('div', { class: 'chart-box' }, h('p', { class: 'fx-title' }, TITLES[kind]));
      box.append(wrap);
      const dense = n > 150 ? ' m-dense' : '';
      const pt = (x, y, i) => ({ x, y, title: i == null ? '' : lab(i), cls: `m-s1${dense}` });
      if (kind === 'fitted') scatter(wrap, { points: inf.fitted.map((v, i) => pt(v, inf.resid[i], i)), refY: 0, height: 240, xLabel: `Fitted ${yName}`, yLabel: 'Residual', label: `${TITLES[kind]} for ${yName}` });
      if (kind === 'qq') {
        const q = R.normalScores(inf.internal), lo = q[0].theoretical, hi = q[q.length - 1].theoretical;
        scatter(wrap, { points: q.map((d) => pt(d.theoretical, d.sample)), curves: [{ pts: [[lo, lo], [hi, hi]], cls: 'm-s2' }], height: 240, xLabel: 'Normal quantile', yLabel: 'Studentized residual', label: TITLES[kind] });
      }
      if (kind === 'scale') scatter(wrap, { points: inf.fitted.map((v, i) => pt(v, Math.sqrt(Math.abs(inf.internal[i])), i)), height: 240, xLabel: `Fitted ${yName}`, yLabel: '√|studentized residual|', label: TITLES[kind] });
      if (kind === 'leverage') {
        const fr = scatter(wrap, { points: inf.hat.map((v, i) => pt(v, inf.internal[i], i)), refY: 0, height: 240, xLabel: 'Leverage', yLabel: 'Studentized residual', label: `${TITLES[kind]}; dashed curves mark Cook’s distance 0.5 and 1` });
        // Cook's distance contours: r = ±√(D p (1 − h) / h)
        const g = s('g', { 'aria-hidden': 'true' }), hmax = Math.max(...inf.hat) * 1.05;
        for (const D0 of [0.5, 1]) for (const sign of [1, -1]) {
          let d = ''; for (let k = 1; k <= 60; k++) { const hh = (k / 60) * hmax, r = sign * Math.sqrt(D0 * fit.p * (1 - hh) / hh); const yy = fr.y(r); if (Number.isFinite(yy) && yy >= 0 && yy <= fr.ih) d += `${d ? 'L' : 'M'}${fr.x(hh).toFixed(1)},${yy.toFixed(1)}`; }
          if (d) g.append(s('path', { d, class: 'curve m-s3', 'stroke-dasharray': '4 4' }));
        }
        fr.g.append(g);
      }
      if (kind === 'order') scatter(wrap, { points: inf.resid.map((v, i) => pt(i + 1, v, i)), refY: 0, height: 240, xLabel: 'Row (time order)', yLabel: 'Residual', label: TITLES[kind] });
    }
  }
  render();
  onResize(box, render);
}
