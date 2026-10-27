// scatter.js — the `scatter` lesson widget (B05): a scatterplot of two variables with their correlations, worked out
// by core/correlation.js. Students can plot ranks instead of values (Spearman's ρ is Pearson's r on ranks), take logs,
// colour the points by a group to see each group's own correlation (Simpson's paradox), show the least-squares line,
// and leave out the points that move r most, one at a time, to see how much a few points matter.
//   { type: 'scatter', title,
//     x: { name, values, unit? }, y: { name, values, unit? },
//     group?: { name, values: ['Harbourside', …] }, labels?: ['1 Mar', …] (one per point, for the tooltip),
//     show: ['pearson', 'spearman', 'kendall', 'ci', 'r2', 'p'], toggles: ['ranks', 'logX', 'logY', 'group', 'line'],
//     defaults: { group: false, line: false }, exclude: 3 (offer the 3 most influential points to leave out),
//     jitter: { x: 0.25, y: 0 } (draw points nudged by up to this much, seeded, so whole numbers don't hide each other;
//     every statistic uses the true values), note }
import { h, onResize } from '../../core/dom.js?v=22';
import { xl } from '../xl.js?v=22';
import { scatter as drawScatter, tableTwin } from '../../core/charts.js?v=22';
import * as C from '../../core/correlation.js?v=22';
import { ranks } from '../../core/stats.js?v=22';
import * as F from '../../core/format.js?v=22';

const minus = (t) => String(t).replace(/^-/, '−');
const f3 = (v) => (Number.isFinite(v) ? minus(v.toFixed(3)) : '—');
const pStr = (p) => (!Number.isFinite(p) ? '—' : p < 0.001 ? 'below 0.001' : p.toFixed(3));
const TOGGLES = { ranks: 'Plot ranks instead of values', logX: 'Log of x', logY: 'Log of y', group: 'Colour by group', line: 'Least-squares line' };
const CLS = ['m-s1', 'm-s2', 'm-s3'];

/** The numbers the widget shows for a set of points (exported for the checker). */
export function stats(xs, ys) {
  const P = C.pearson(xs, ys), S = C.spearman(xs, ys);
  return { n: P.n, r: P.r, r2: P.r2, p: P.p, ci: P.ci, rho: S.rho, rhoP: S.p, tau: xs.length <= 400 ? C.kendall(xs, ys).tau : NaN };
}

export function mount(el, cfg, ctx) {
  const base = `sc-${ctx.id}`;
  const show = cfg.show || ['pearson', 'spearman', 'ci', 'r2', 'p'];
  const st = { ranks: false, logX: false, logY: false, group: false, line: false, ...(cfg.defaults || {}), out: [] };
  const n0 = cfg.x.values.length;
  const groups = cfg.group ? [...new Set(cfg.group.values)] : [];
  const check = (key) => {
    const id = `${base}-${key}`;
    const inp = h('input', { type: 'checkbox', id, ...(st[key] ? { checked: '' } : {}) });
    inp.addEventListener('change', () => { st[key] = inp.checked; render(); });
    return h('div', { class: 'field sp-check' }, inp, h('label', { for: id }, key === 'group' && cfg.group ? `Colour by ${cfg.group.name.toLowerCase()}` : TOGGLES[key]));
  };
  const toggles = h('div', { class: 'sp-toggles' }, ...(cfg.toggles || []).filter((k) => TOGGLES[k] && (k !== 'group' || cfg.group)).map(check));
  const outBox = h('div', { class: 'sc-out' });
  const chart = h('div', { class: 'chart-box sc-chart' });
  const res = h('div', { class: 'cv-out', 'aria-live': 'polite' });
  const twin = h('div');
  el.classList.add('cv-widget');
  el.append(...[cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null, toggles.childNodes.length ? toggles : null, chart, res, outBox, twin,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null].filter(Boolean));

  const keep = () => cfg.x.values.map((_, i) => i).filter((i) => !st.out.includes(i) && Number.isFinite(cfg.x.values[i]) && Number.isFinite(cfg.y.values[i]));
  const transform = (vals, log, idx) => {
    let v = idx.map((i) => vals[i]);
    if (log) v = v.map((u) => (u > 0 ? Math.log10(u) : NaN));
    return v;
  };

  function render() {
    const idx0 = keep();
    let xs = transform(cfg.x.values, st.logX, idx0), ys = transform(cfg.y.values, st.logY, idx0);
    const ok = xs.map((v, k) => Number.isFinite(v) && Number.isFinite(ys[k]));
    const idx = idx0.filter((_, k) => ok[k]); xs = xs.filter((_, k) => ok[k]); ys = ys.filter((_, k) => ok[k]);
    const dropped = idx0.length - idx.length;
    const px = st.ranks ? ranks(xs) : xs, py = st.ranks ? ranks(ys) : ys;
    const name = (axis, log) => `${st.ranks ? 'Rank of ' : log ? 'log₁₀ ' : ''}${cfg[axis].name}${!st.ranks && !log && cfg[axis].unit ? ` (${cfg[axis].unit})` : ''}`;
    const gIdx = (i) => groups.indexOf(cfg.group.values[i]);
    const jit = (axis, k) => { const a = st.ranks ? 0 : cfg.jitter?.[axis] || 0; if (!a) return 0; const t = Math.sin((idx[k] + 1) * (axis === 'x' ? 12.9898 : 78.233)) * 43758.5453; return (t - Math.floor(t) - 0.5) * 2 * a; };
    const points = idx.map((i, k) => ({ x: px[k] + jit('x', k), y: py[k] + jit('y', k), cls: st.group ? CLS[gIdx(i) % 3] : 'm-s1', title: cfg.labels ? cfg.labels[i] : '' }));
    const curves = [];
    if (st.line && px.length > 2) {
      const mx = px.reduce((s, v) => s + v, 0) / px.length, my = py.reduce((s, v) => s + v, 0) / py.length;
      let sxy = 0, sxx = 0; for (let k = 0; k < px.length; k++) { sxy += (px[k] - mx) * (py[k] - my); sxx += (px[k] - mx) ** 2; }
      const b = sxy / sxx, a = my - b * mx; curves.push({ fn: (v) => a + b * v, cls: 'm-s2' });
    }
    chart.replaceChildren();
    drawScatter(chart, { points, curves, xLabel: name('x', st.logX), yLabel: name('y', st.logY), label: `Scatterplot of ${cfg.y.name} against ${cfg.x.name}`,
      legend: st.group ? groups.map((g, k) => ({ name: g, cls: CLS[k % 3] })) : null, pointTitle: (p) => p.title || '' });
    // statistics (on the values or ranks shown; Spearman is the same either way)
    const S = stats(xs, ys);
    const line = (label, v) => h('li', {}, h('b', {}, `${label}: `), v);
    const items = [line('Pairs', F.int(S.n) + (st.out.length ? ` (${st.out.length} left out)` : '') + (dropped ? ` (${dropped} with no log)` : ''))];
    if (show.includes('pearson')) items.push(line(st.ranks ? 'Pearson’s r of the ranks (= Spearman’s ρ)' : 'Pearson’s r', f3(st.ranks ? S.rho : S.r)));
    if (show.includes('ci') && !st.ranks) items.push(line('95% confidence interval for ρ (Fisher’s z)', `${f3(S.ci[0])} to ${f3(S.ci[1])}`));
    if (show.includes('r2') && !st.ranks) items.push(line('r²', f3(S.r2)));
    if (show.includes('p')) items.push(line('p-value (test of no correlation)', pStr(st.ranks ? S.rhoP : S.p)));
    if (show.includes('spearman') && !st.ranks) items.push(line('Spearman’s ρ', f3(S.rho)));
    if (show.includes('kendall') && Number.isFinite(S.tau)) items.push(line('Kendall’s τ-b', f3(S.tau)));
    if (st.group) for (const g of groups) {
      const k = idx.map((i, j) => [i, j]).filter(([i]) => cfg.group.values[i] === g).map(([, j]) => j);
      const r = C.pearson(k.map((j) => px[j]), k.map((j) => py[j])).r;
      items.push(line(`${g} only (${k.length} pairs)`, `r = ${f3(r)}`));
    }
    res.replaceChildren(h('ul', { class: 'sc-stats' }, ...items));
    // leaving points out: offer the most influential remaining points
    outBox.replaceChildren();
    if (cfg.exclude) {
      const inf = C.influence(xs, ys);
      const order = inf.without.map((r, k) => [k, Math.abs(r - inf.r)]).sort((a, b) => b[1] - a[1]).slice(0, cfg.exclude);
      const pick = h('div', { class: 'sc-pick' }, h('span', { class: 'field-label' }, 'Leave out a point that moves r most:'),
        ...order.map(([k]) => {
          const i = idx[k];
          const b = h('button', { type: 'button', class: 'btn btn-ghost btn-sm' }, `${cfg.labels ? cfg.labels[i] : `point ${i + 1}`} (r would be ${f3(inf.without[k])})`);
          b.addEventListener('click', () => { st.out.push(i); render(); });
          return b;
        }));
      outBox.append(pick);
      if (st.out.length) {
        const back = h('button', { type: 'button', class: 'btn btn-secondary btn-sm' }, `Put back all ${st.out.length} left out`);
        back.addEventListener('click', () => { st.out = []; render(); });
        outBox.append(h('p', {}, `Left out: ${st.out.map((i) => (cfg.labels ? cfg.labels[i] : `point ${i + 1}`)).join(', ')}. `, back));
      }
    }
    twin.replaceChildren();
    if (n0 <= 60) tableTwin(twin, { caption: `${cfg.x.name} and ${cfg.y.name}`, columns: [{ label: cfg.labels ? 'Point' : '#' }, { label: cfg.x.name, num: true }, { label: cfg.y.name, num: true }],
      rows: cfg.x.values.map((v, i) => [cfg.labels ? cfg.labels[i] : String(i + 1), F.auto(v), F.auto(cfg.y.values[i])]) });
  }
  render();
  onResize(chart, render);
}
