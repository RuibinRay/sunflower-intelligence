// corrmatrix.js — the `corrmatrix` lesson widget (B05): a correlation matrix as a heatmap (blue positive, warm
// negative, grey near zero), Pearson or Spearman, with p-values unadjusted or adjusted for the number of pairs tested
// (Bonferroni, Holm, Benjamini–Hochberg), and the pairs that stay significant marked. Choosing a cell draws that pair's
// scatterplot, so a single number is never read without its picture. Numbers from core/correlation.js.
//   { type: 'corrmatrix', title, columns: { 'High temperature (°F)': [...], … }, method: 'pearson',
//     adjust: 'none' | 'bonferroni' | 'holm' | 'fdr_bh', alpha: 0.05, choose: true (offer method and adjustment), note }
import { h, onResize } from '../../core/dom.js?v=22';
import { xl } from '../xl.js?v=22';
import { heatmap, scatter as drawScatter, tableTwin } from '../../core/charts.js?v=22';
import * as C from '../../core/correlation.js?v=22';
import * as F from '../../core/format.js?v=22';
import { segmented } from '../dist-draw.js?v=22';

const minus = (t) => String(t).replace(/^-/, '−');
const f2 = (v) => (Number.isFinite(v) ? minus(v.toFixed(2)) : '—');
const pStr = (p) => (!Number.isFinite(p) ? '—' : p < 0.001 ? '< 0.001' : p.toFixed(3));
const ADJ = [['none', 'None'], ['bonferroni', 'Bonferroni'], ['holm', 'Holm'], ['fdr_bh', 'Benjamini–Hochberg']];

/** The matrix the widget shows (exported for the checker). */
export function compute(columns, method = 'pearson', adjust = 'none') {
  return C.matrix(columns, { method, adjustMethod: adjust === 'none' ? null : adjust });
}

export function mount(el, cfg, ctx) {
  const base = `cm-${ctx.id}`;
  const st = { method: cfg.method || 'pearson', adjust: cfg.adjust || 'none', sel: [-1, -1] };
  const alpha = cfg.alpha ?? 0.05;
  const names = Object.keys(cfg.columns);
  const controls = cfg.choose === false ? null : h('div', { class: 'cv-fields' },
    segmented(`${base}-m`, 'Correlation', [['pearson', 'Pearson'], ['spearman', 'Spearman']], st.method, (k) => { st.method = k; render(); }),
    segmented(`${base}-a`, 'Adjust p-values for the number of pairs', ADJ, st.adjust, (k) => { st.adjust = k; render(); }));
  const map = h('div', { class: 'chart-box cm-map' });
  const summary = h('p', { class: 'fx-note', 'aria-live': 'polite' });
  const pair = h('div', { class: 'cv-out', 'aria-live': 'polite' });
  const twin = h('div');
  el.classList.add('cv-widget');
  el.append(...[cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null, controls, map, summary, pair, twin,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null].filter(Boolean));

  function render() {
    const M = compute(cfg.columns, st.method, st.adjust);
    const P = M.pAdj || M.p;
    heatmap(map, { labels: names, values: M.r, pvalues: P, ns: M.n, label: `${st.method === 'spearman' ? 'Spearman' : 'Pearson'} correlation matrix`,
      selected: st.sel, onSelect: (i, j) => { st.sel = [i, j]; render(); } });
    let sig = 0;
    for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) if (P[i][j] < alpha) sig++;
    summary.textContent = `${sig} of the ${M.pairs} pairs are significant at ${alpha}${st.adjust === 'none' ? ' with no adjustment' : ` after the ${ADJ.find((a) => a[0] === st.adjust)[1]} adjustment`}. Choose a cell (or use the arrow keys and Enter) to see its scatterplot.`;
    pair.replaceChildren();
    const [i, j] = st.sel;
    if (i >= 0 && j >= 0 && i !== j) {
      const xs = cfg.columns[names[j]], ys = cfg.columns[names[i]];
      const box = h('div', { class: 'chart-box' });
      pair.append(h('p', {}, h('b', {}, `${names[i]} against ${names[j]}: `), `${st.method === 'spearman' ? 'ρ' : 'r'} = ${f2(M.r[i][j])}, n = ${F.int(M.n[i][j])}, p ${M.pAdj ? '(adjusted) ' : ''}= ${pStr(P[i][j])}`), box);
      drawScatter(box, { points: xs.map((x, k) => ({ x, y: ys[k] })).filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y)), xLabel: names[j], yLabel: names[i], height: 260, label: `Scatterplot of ${names[i]} against ${names[j]}` });
    }
    twin.replaceChildren();
    tableTwin(twin, { caption: 'Correlation matrix', columns: [{ label: '' }, ...names.map((n) => ({ label: n, num: true }))],
      rows: names.map((n, a) => [n, ...names.map((_, b) => `${f2(M.r[a][b])}${a !== b && P[a][b] < alpha ? ' *' : ''}`)]) });
  }
  render();
  onResize(map, render);
}
