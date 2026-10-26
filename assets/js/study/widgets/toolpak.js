// toolpak.js — the `toolpak` lesson widget (B04): the output tables of Excel's Analysis ToolPak tests, for data the
// lesson supplies — t-Test: Paired Two Sample for Means, t-Test: Two-Sample Assuming Equal Variances, t-Test:
// Two-Sample Assuming Unequal Variances, and Anova: Single Factor — with the dialog's Alpha and Hypothesized Mean
// Difference. The arithmetic is core/inference.js; the unequal-variances tool reports its degrees of freedom rounded to
// a whole number and works its p-values and critical values from that rounded df, as the ToolPak does (T.TEST type 3
// keeps the unrounded df, so its p-value can differ slightly).
//   { type: 'toolpak', title, tool: 'ttest-paired' | 'ttest-equal' | 'ttest-unequal' | 'anova',
//     tools: [...] (offer a choice), groups: [{ name, values }], alpha: 0.05, hypothesized: 0, note }
import { h } from '../../core/dom.js?v=19';
import { xl } from '../xl.js?v=19';
import * as I from '../../core/inference.js?v=19';
import { mean, variance } from '../../core/stats.js?v=19';
import { segmented, numberField } from '../dist-draw.js?v=19';

export const TOOLS = {
  'ttest-paired': 't-Test: Paired Two Sample for Means',
  'ttest-equal': 't-Test: Two-Sample Assuming Equal Variances',
  'ttest-unequal': 't-Test: Two-Sample Assuming Unequal Variances',
  anova: 'Anova: Single Factor',
};
/** Numbers as the ToolPak's General format shows them, shortened to 6 significant figures; tiny values in E notation. */
function num(v) {
  if (v === '' || v == null) return '';
  if (typeof v === 'string') return v;
  if (!Number.isFinite(v)) return '#DIV/0!';
  if (v !== 0 && Math.abs(v) < 1e-4) return v.toExponential(2).replace('e', 'E').replace(/E([+-])(\d)$/, 'E$10$2');
  if (Math.abs(v) >= 1e5) return String(Math.round(v * 100) / 100);
  return String(Number(v.toPrecision(6)));
}
const table = (caption, head, rows) => h('div', { class: 'table-scroll' }, h('table', { class: 'data-table study-table tp-table' },
  h('caption', {}, caption),
  head ? h('thead', {}, h('tr', {}, head.map((c, i) => h('th', { scope: 'col' }, i === 0 && !c ? h('span', { class: 'visually-hidden' }, 'Row') : c)))) : null,
  h('tbody', {}, rows.map((r) => h('tr', {}, r.map((c, k) => (k === 0 ? h('th', { scope: 'row' }, c) : h('td', {}, num(c)))))))));

/** The ToolPak's rows for a two-sample t-test (also used by the checker and the tests). */
export function tTestRows(tool, a, b, { alpha = 0.05, hypothesized = 0 } = {}) {
  const m1 = mean(a), m2 = mean(b), v1 = variance(a), v2 = variance(b);
  let t, df, extra = [];
  if (tool === 'ttest-paired') {
    const r = I.tTestPaired(a, b, { delta: hypothesized });
    t = r.t; df = r.df;
    extra = [['Pearson Correlation', r.r, '']];
  } else if (tool === 'ttest-equal') {
    const r = I.tTest2(a, b, { equalVar: true, delta: hypothesized });
    t = r.t; df = r.df; extra = [['Pooled Variance', r.pooledVar, '']];
  } else {
    const r = I.tTest2(a, b, { equalVar: false, delta: hypothesized });
    t = r.t; df = Math.round(r.df);                    // the ToolPak shows and uses whole-number df
  }
  const one = I.tSf(Math.abs(t), df);
  return {
    t, df, pOne: one, pTwo: Math.min(1, 2 * one), critOne: I.tInv(1 - alpha, df), critTwo: I.tInv(1 - alpha / 2, df),
    rows: [['Mean', m1, m2], ['Variance', v1, v2], ['Observations', a.length, b.length], ...extra, ['Hypothesized Mean Difference', hypothesized, ''],
      ['df', df, ''], ['t Stat', t, ''], ['P(T<=t) one-tail', one, ''], ['t Critical one-tail', I.tInv(1 - alpha, df), ''],
      ['P(T<=t) two-tail', Math.min(1, 2 * one), ''], ['t Critical two-tail', I.tInv(1 - alpha / 2, df), '']],
  };
}

export function mount(el, cfg, ctx) {
  const base = `tp-${ctx.id}`;
  const tools = (cfg.tools || [cfg.tool || 'ttest-unequal']).filter((t) => TOOLS[t]);
  const st = { tool: tools[0], alpha: cfg.alpha ?? 0.05, hypothesized: cfg.hypothesized ?? 0 };
  const out = h('div', { class: 'rg-out', 'aria-live': 'polite' });
  const toolBox = tools.length > 1 ? segmented(`${base}-tool`, 'Analysis tool', tools.map((t) => [t, TOOLS[t].replace(/^t-Test: /, '')]), st.tool, (t) => { st.tool = t; draw(); ctx.report?.('interact', { tool: t }); }) : '';
  const fa = numberField(`${base}-alpha`, 'Alpha', st.alpha, { min: 0.001, max: 0.5, step: 0.01, onInput: () => { const v = Number(fa.inp.value); if (v > 0 && v < 1) { st.alpha = v; draw(); } } });
  const fh = numberField(`${base}-hyp`, 'Hypothesized Mean Difference', st.hypothesized, { step: 'any', onInput: () => { const v = Number(fh.inp.value); if (fh.inp.value !== '' && Number.isFinite(v)) { st.hypothesized = v; draw(); } } });
  el.append(...[cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null, toolBox || null, h('div', { class: 'cv-fields' }, fa.el, fh.el), out,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null].filter(Boolean));
  function draw() {
    const G = cfg.groups;
    fh.el.hidden = st.tool === 'anova';
    if (st.tool === 'anova') {
      const r = I.anova1(G.map((g) => g.values), { alpha: st.alpha });
      out.replaceChildren(h('h4', {}, TOOLS.anova),
        table('SUMMARY', ['Groups', 'Count', 'Sum', 'Average', 'Variance'], G.map((g, i) => [g.name, r.counts[i], r.sums[i], r.means[i], r.vars[i]])),
        table('ANOVA', ['Source of Variation', 'SS', 'df', 'MS', 'F', 'P-value', 'F crit'], [
          ['Between Groups', r.ssb, r.dfb, r.msb, r.F, r.p, r.fCrit], ['Within Groups', r.ssw, r.dfw, r.msw, '', '', ''], ['Total', r.sst, r.dft, '', '', '', '']]));
      ctx.report?.('toolpak', { tool: st.tool });
      return;
    }
    const [A, B] = G;
    if (st.tool === 'ttest-paired' && A.values.length !== B.values.length) { out.replaceChildren(h('p', { class: 'fx-note is-error' }, 'A paired test needs the same number of values in both ranges.')); return; }
    const r = tTestRows(st.tool, A.values, B.values, st);
    out.replaceChildren(table(TOOLS[st.tool], ['', A.name, B.name], r.rows),
      st.tool === 'ttest-unequal' ? h('p', { class: 'fx-note' }, 'The ToolPak rounds this test’s degrees of freedom to a whole number and works its p-values from that, so T.TEST with type 3, which keeps the unrounded df, can give a slightly different p-value.') : '');
    ctx.report?.('toolpak', { tool: st.tool });
  }
  draw();
}
