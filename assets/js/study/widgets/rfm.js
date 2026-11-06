// rfm.js — the `rfm` lesson widget (M06): score customers on recency, frequency and monetary value and see where they
// fall. The cut points for each score; the R × FM grid shaded by customers or by spend; and the named segments with
// their size, share of spend and average recency, frequency and spend. The method (quantile cut points, where ties share
// a score, or equal-sized groups, where ties are split) and the number of groups can be switched, so a student sees how
// much a "segment" depends on choices made before any marketing. Numbers from core/customer.js.
//   { type: 'rfm', title, customers: [{ id, recency, frequency, monetary }], k: 5, choose: true (offer method and k),
//     method: 'quantile' | 'ntile', show: ['cuts', 'grid', 'segments'], unit: 'visits', note }
import { h } from '../../core/dom.js?v=28';
import { xl } from '../xl.js?v=28';
import * as CU from '../../core/customer.js?v=28';
import * as F from '../../core/format.js?v=28';
import { segmented } from '../dist-draw.js?v=28';

/** The scored customers and their groupings (exported for the checker). */
export function compute(customers, { k = 5, method = 'quantile' } = {}) {
  const scored = CU.rfm(customers, { k, method });
  const cuts = method === 'quantile' ? { R: CU.cutPoints(customers.map((c) => c.recency), k), F: CU.cutPoints(customers.map((c) => c.frequency), k), M: CU.cutPoints(customers.map((c) => c.monetary), k) } : null;
  return { scored, cuts, segments: k === 5 ? CU.groupBy(scored, 'segment') : [], total: scored.reduce((s, c) => s + c.monetary, 0) };
}

export function mount(el, cfg, ctx) {
  const base = `rf-${ctx.id}`;
  const st = { k: cfg.k || 5, method: cfg.method || 'quantile', shade: 'n' };
  const show = cfg.show || ['cuts', 'grid', 'segments'];
  const unit = cfg.unit || 'purchases';
  const controls = h('div', { class: 'cv-fields' },
    ...(cfg.choose ? [segmented(`${base}-m`, 'Scores from', [['quantile', 'Quantile cut points'], ['ntile', 'Equal-sized groups']], st.method, (v) => { st.method = v; render(); }),
      segmented(`${base}-k`, 'Groups per score', [['3', '3'], ['4', '4'], ['5', '5']], String(st.k), (v) => { st.k = +v; render(); })] : []),
    ...(show.includes('grid') ? [segmented(`${base}-s`, 'Shade the grid by', [['n', 'Customers'], ['spend', 'Spend']], st.shade, (v) => { st.shade = v; render(); })] : []));
  const out = h('div', { class: 'cv-out', 'aria-live': 'polite' });
  el.classList.add('cv-widget');
  el.append(...[cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null, controls, out,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null].filter(Boolean));

  function render() {
    const R = compute(cfg.customers, { k: st.k, method: st.method }), k = st.k, n = R.scored.length;
    const items = [h('p', {}, `${F.int(n)} customers, ${F.money(R.total, { digits: 2 })} of spend. R scores recency (${k} = most recent), F frequency and M monetary value (${k} = highest).`)];
    if (show.includes('cuts')) {
      if (R.cuts) {
        const row = (lab, c, fmt) => h('tr', {}, h('th', { scope: 'row' }, lab), ...c.map((v) => h('td', {}, fmt(v))));
        items.push(h('div', { class: 'table-scroll' }, h('table', { class: 'data-table study-table' }, h('caption', {}, `Cut points (quantiles at ${Array.from({ length: k - 1 }, (_, j) => F.pct((j + 1) / k, 0)).join(', ')}): a value above a cut point moves F and M up a score, and R down (fewer days since the last purchase scores higher)`),
          h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, ''), ...Array.from({ length: k - 1 }, (_, j) => h('th', { scope: 'col' }, `Cut ${j + 1}`)))),
          h('tbody', {}, row('Recency (days)', R.cuts.R, (v) => F.num(v, 1)), row(`Frequency (${unit})`, R.cuts.F, (v) => F.num(v, 1)), row('Monetary ($)', R.cuts.M, (v) => F.num(v, 2))))));
      }
      const sizes = (key) => Array.from({ length: k }, (_, j) => R.scored.filter((c) => c[key] === j + 1).length);
      items.push(h('div', { class: 'table-scroll' }, h('table', { class: 'data-table study-table' }, h('caption', {}, 'Customers with each score'),
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Score'), ...Array.from({ length: k }, (_, j) => h('th', { scope: 'col' }, String(j + 1))))),
        h('tbody', {}, ...['R', 'F', 'M'].map((key) => h('tr', {}, h('th', { scope: 'row' }, key), ...sizes(key).map((v) => h('td', {}, F.int(v)))))))));
    }
    if (show.includes('grid')) {
      const cell = (r, fm) => R.scored.filter((c) => c.R === r && c.FM === fm);
      const val = (cs) => (st.shade === 'n' ? cs.length / n : cs.reduce((s, c) => s + c.monetary, 0) / R.total);
      const cells = Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) => cell(k - i, j + 1)));
      const mx = Math.max(...cells.flat().map(val), 1e-9);
      items.push(h('p', { class: 'fx-title', id: `${base}-gc` }, `Share of ${st.shade === 'n' ? 'customers' : 'spend'} by R (rows) and FM, the rounded mean of F and M (columns)`), h('div', { class: 'table-scroll' }, h('table', { class: 'rf-grid', 'aria-labelledby': `${base}-gc` },
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'R \\ FM'), ...Array.from({ length: k }, (_, j) => h('th', { scope: 'col' }, String(j + 1))))),
        h('tbody', {}, ...cells.map((row, i) => h('tr', {}, h('th', { scope: 'row' }, String(k - i)), ...row.map((cs, j) => {
          const v = val(cs), td = h('td', { title: k === 5 ? CU.segmentOf(k - i, j + 1) : '' }, F.pct(v, 1), h('span', { class: 'rf-n' }, ` (${F.int(cs.length)})`));
          td.style.setProperty('--v', (v / mx).toFixed(3)); if (v / mx > 0.7) td.classList.add('is-dark');
          return td;
        })))))));
    }
    if (show.includes('segments')) {
      if (k !== 5) items.push(h('p', { class: 'fx-note' }, 'The named segments are defined on a 5 × 5 grid; choose 5 groups to see them.'));
      else items.push(h('div', { class: 'table-scroll' }, h('table', { class: 'data-table study-table' }, h('caption', {}, 'Segments (one common naming of the R × FM grid)'),
        h('thead', {}, h('tr', {}, ...['Segment', 'Customers', 'Share', 'Share of spend', 'Mean recency (days)', `Mean frequency (${unit})`, 'Mean spend ($)'].map((c) => h('th', { scope: 'col' }, c)))),
        h('tbody', {}, ...R.segments.map((g) => h('tr', {}, h('th', { scope: 'row' }, g.key), h('td', {}, F.int(g.n)), h('td', {}, F.pct(g.share, 1)), h('td', {}, F.pct(g.spendShare, 1)),
          h('td', {}, F.num(g.meanRecency, 1)), h('td', {}, F.num(g.meanFrequency, 2)), h('td', {}, F.num(g.meanSpend, 2))))))));
    }
    out.replaceChildren(...items);
  }
  render();
}
