// portfolio.js — the `portfolio` lesson widget (F06): mean–standard deviation diagrams.
//   mode 'two': two assets with sliders for the weight in A and their correlation; the curve of every mix, the chosen
//     mix, the minimum-variance mix; at correlation 1 the curve is a straight line, at −1 it touches zero risk.
//   mode 'many': several assets with annualised means and covariances (from return series or given); the long-only
//     efficient frontier, the minimum-variance and maximum-Sharpe portfolios, and the capital allocation line from the
//     risk-free rate through the maximum-Sharpe portfolio, with a slider for the share y held in it (y > 1 borrows).
// Numbers from core/investments.js and core/portfolio.js.
//   { type: 'portfolio', mode: 'two', title, a: { name, er, sd }, b: { name, er, sd }, corr, w: 0.5, corrSlider: true, note }
//   { type: 'portfolio', mode: 'many', title, assets: [{ name, er, sd }] + cov: [[…]] | series: { name: [monthly returns] },
//     rf, y?: 1, maxY?: 1.5, show: ['frontier', 'cal', 'assets', 'weights'], note }
import { h, onResize } from '../../core/dom.js?v=31';
import { xl } from '../xl.js?v=31';
import { scatter, tableTwin } from '../../core/charts.js?v=31';
import * as IV from '../../core/investments.js?v=31';
import * as F0 from '../../core/format.js?v=31';
import { moments } from '../../core/portfolio.js?v=31';

const F = { ...F0, pct: (x, d = 1) => F0.pct(Number.isFinite(x) ? x + Math.sign(x) * 1e-12 : x, d) };
const ax = (v) => F.pct(v, Math.abs(v * 100 - Math.round(v * 100)) > 1e-9 ? 1 : 0);   // axis ticks: 7.5% not 8%
const fillRange = (el) => { const min = +el.min, max = +el.max; el.style.setProperty('--fill', `${((+el.value - min) / (max - min || 1)) * 100}%`); };

/** Annualised means and covariance for the 'many' mode (exported for the checker). */
export function inputs(cfg) {
  if (cfg.series) {
    const names = Object.keys(cfg.series), mo = moments(names.map((n) => cfg.series[n]), 12);
    return { names, mu: mo.mu, cov: mo.cov };
  }
  return { names: cfg.assets.map((a) => a.name), mu: cfg.assets.map((a) => a.er), cov: cfg.cov };
}
/** Everything the 'many' mode shows. */
export function computeMany(cfg, y = cfg.y ?? 1) {
  const { names, mu, cov } = inputs(cfg);
  const fr = IV.frontier(mu, cov, 41), tan = IV.maxSharpe(mu, cov, cfg.rf);
  const stats = (w) => ({ w, er: IV.portRet(w, mu), sd: Math.sqrt(IV.portVar(w, cov)) });
  const T = tan ? stats(tan) : null, G = stats(fr.gmv);
  return { names, mu, cov, sds: cov.map((r, i) => Math.sqrt(r[i])), frontier: fr.points, gmv: G, tangency: T, sharpe: T ? IV.sharpe(T.er, cfg.rf, T.sd) : NaN, mix: T ? IV.cal({ y, rf: cfg.rf, er: T.er, sd: T.sd }) : null };
}

function slider(id, label, min, max, step, value, onInput) {
  const r = h('input', { type: 'range', id, min, max, step, value }), o = h('output', { for: id });
  r.addEventListener('input', () => onInput(+r.value));
  return { r, o, el: h('div', { class: 'slider-field' }, h('div', { class: 'slider-top' }, h('label', { for: id }, label), o), r) };
}

export function mount(el, cfg, ctx) {
  const base = `pf-${ctx.id}`, chart = h('div', { class: 'chart-box' }), out = h('div', { class: 'cv-out', 'aria-live': 'polite' }), twin = h('div');
  el.classList.add('cv-widget');
  const fields = [];
  let draw;
  if (cfg.mode === 'two') {
    const st = { w: cfg.w ?? 0.5, corr: cfg.corr };
    const sw = slider(`${base}-w`, `Weight in ${cfg.a.name}`, 0, 1, 0.01, st.w, (v) => { st.w = v; draw(); });
    fields.push(sw.el);
    const sc = cfg.corrSlider ? slider(`${base}-c`, 'Correlation between them', -1, 1, 0.05, st.corr, (v) => { st.corr = v; draw(); }) : null;
    if (sc) fields.push(sc.el);
    draw = () => {
      sw.o.textContent = `${F.pct(st.w, 0)} / ${F.pct(1 - st.w, 0)}`; fillRange(sw.r);
      if (sc) { sc.o.textContent = F.num(st.corr, 2); fillRange(sc.r); }
      const p = { ra: cfg.a.er, rb: cfg.b.er, sa: cfg.a.sd, sb: cfg.b.sd, corr: st.corr };
      const curve = Array.from({ length: 101 }, (_, k) => { const q = IV.twoAsset({ ...p, w: k / 100 }); return [q.sd, q.er]; });
      const now = IV.twoAsset({ ...p, w: st.w });
      const wmin = Math.min(1, Math.max(0, IV.twoAssetMinVarWeight(p))), mv = IV.twoAsset({ ...p, w: wmin });
      const xmax = Math.max(cfg.a.sd, cfg.b.sd) * 1.15, ys = [cfg.a.er, cfg.b.er];
      chart.replaceChildren();
      scatter(chart, { points: [{ x: cfg.a.sd, y: cfg.a.er, title: cfg.a.name, cls: 'm-s2' }, { x: cfg.b.sd, y: cfg.b.er, title: cfg.b.name, cls: 'm-s2' }, { x: now.sd, y: now.er, title: 'Your mix', cls: 'm-s1' }, { x: mv.sd, y: mv.er, title: 'Least risky mix', cls: 'm-s3' }],
        curves: [{ pts: curve, cls: 'm-s1' }], xDomain: [0, xmax], yDomain: [Math.min(...ys, 0) , Math.max(...ys) * 1.1], height: 280,
        xLabel: 'Risk: standard deviation a year', yLabel: 'Expected return a year', xFormat: ax, yFormat: ax,
        label: `Every mix of ${cfg.a.name} and ${cfg.b.name} with correlation ${F.num(st.corr, 2)}`, legend: [{ name: 'Mixes', cls: 'm-s1', shape: 'line' }, { name: 'The two assets', cls: 'm-s2' }, { name: 'Least risky mix', cls: 'm-s3' }] });
      out.replaceChildren(h('ul', { class: 'sc-stats' },
        h('li', {}, h('b', {}, 'Your mix: '), `expected return ${F.pct(now.er, 2)}, standard deviation ${F.pct(now.sd, 2)}`),
        h('li', {}, h('b', {}, 'Weighted average of the two standard deviations: '), `${F.pct(st.w * cfg.a.sd + (1 - st.w) * cfg.b.sd, 2)}; diversification saves ${F.pct(st.w * cfg.a.sd + (1 - st.w) * cfg.b.sd - now.sd, 2)}`),
        h('li', {}, h('b', {}, 'Least risky mix: '), `${F.pct(wmin, 1)} in ${cfg.a.name}, standard deviation ${F.pct(mv.sd, 2)}`)));
      twin.replaceChildren(); tableTwin(twin, { caption: 'Mixes in steps of 10%', columns: [{ label: `Weight in ${cfg.a.name}` }, { label: 'Expected return', num: true }, { label: 'Standard deviation', num: true }],
        rows: Array.from({ length: 11 }, (_, k) => { const q = IV.twoAsset({ ...p, w: k / 10 }); return [F.pct(k / 10, 0), F.pct(q.er, 2), F.pct(q.sd, 2)]; }) });
    };
  } else {
    const st = { y: cfg.y ?? 1 }, maxY = cfg.maxY ?? 1.5, show = cfg.show || ['frontier', 'cal', 'assets', 'weights'];
    const sy = show.includes('cal') ? slider(`${base}-y`, 'Share in the best risky portfolio (the rest in bills; over 100% borrows)', 0, maxY, 0.05, st.y, (v) => { st.y = v; draw(); }) : null;
    if (sy) fields.push(sy.el);
    draw = () => {
      if (sy) { sy.o.textContent = F.pct(st.y, 0); fillRange(sy.r); }
      const R = computeMany(cfg, st.y);
      const pts = R.names.map((n, i) => ({ x: R.sds[i], y: R.mu[i], title: n, cls: 'm-s2' }));
      pts.push({ x: R.gmv.sd, y: R.gmv.er, title: 'Minimum-variance portfolio', cls: 'm-s3' });
      if (R.tangency) pts.push({ x: R.tangency.sd, y: R.tangency.er, title: 'Maximum-Sharpe portfolio', cls: 'm-s1' });
      if (R.mix && show.includes('cal')) pts.push({ x: R.mix.sd, y: R.mix.er, title: 'Your mix', cls: 'm-s1' });
      const xmax = Math.max(...R.sds, R.mix ? R.mix.sd : 0) * 1.1;
      const curves = [{ pts: R.frontier.map((p) => [p.vol, p.ret]), cls: 'm-s1' }];
      if (R.tangency && show.includes('cal')) curves.push({ fn: (s) => cfg.rf + R.sharpe * s, cls: 'm-s3' });
      chart.replaceChildren();
      scatter(chart, { points: pts, curves, xDomain: [0, xmax], height: 300, xLabel: 'Risk: standard deviation a year', yLabel: 'Expected return a year', xFormat: ax, yFormat: ax,
        label: `Efficient frontier of ${R.names.join(', ')}${show.includes('cal') ? ' and the capital allocation line' : ''}`, legend: [{ name: 'Efficient frontier', cls: 'm-s1', shape: 'line' }, ...(show.includes('cal') ? [{ name: 'Capital allocation line', cls: 'm-s3', shape: 'line' }] : []), { name: 'Single assets', cls: 'm-s2' }] });
      const items = [];
      if (R.tangency) items.push(h('li', {}, h('b', {}, 'Maximum-Sharpe portfolio: '), `expected return ${F.pct(R.tangency.er, 2)}, standard deviation ${F.pct(R.tangency.sd, 2)}, Sharpe ratio ${F.num(R.sharpe, 3)}`));
      items.push(h('li', {}, h('b', {}, 'Minimum-variance portfolio: '), `expected return ${F.pct(R.gmv.er, 2)}, standard deviation ${F.pct(R.gmv.sd, 2)}`));
      if (R.mix && show.includes('cal')) items.push(h('li', {}, h('b', {}, 'Your mix: '), `${F.pct(st.y, 0)} in the maximum-Sharpe portfolio, ${F.pct(1 - st.y, 0)} in bills at ${F.pct(cfg.rf, 1)}: expected return ${F.pct(R.mix.er, 2)}, standard deviation ${F.pct(R.mix.sd, 2)}`));
      out.replaceChildren(h('ul', { class: 'sc-stats' }, ...items));
      twin.replaceChildren();
      if (show.includes('weights')) tableTwin(twin, { caption: 'Weights and annualised figures', columns: [{ label: 'Asset' }, { label: 'Expected return', num: true }, { label: 'Standard deviation', num: true }, { label: 'Minimum-variance weight', num: true }, { label: 'Maximum-Sharpe weight', num: true }],
        rows: R.names.map((n, i) => [n, F.pct(R.mu[i], 2), F.pct(R.sds[i], 2), F.pct(R.gmv.w[i], 1), R.tangency ? F.pct(R.tangency.w[i], 1) : '—']) });
    };
  }
  el.append(...[cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null, fields.length ? h('div', { class: 'fx-inputs' }, ...fields) : null, chart, out, twin,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null].filter(Boolean));
  draw();
  onResize(chart, draw);
}
