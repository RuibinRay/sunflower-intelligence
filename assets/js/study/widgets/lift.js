// lift.js — the `lift` lesson widget (M06): how well a score ranks customers for a campaign. Customers sorted from the
// highest score, the cumulative gains curve (share of all positives found against share of customers contacted) for each
// score offered, against the diagonal a random list would give; and the lift table for the chosen score and number of
// groups. With `cost`, the student sets the cost of a contact and the value of reaching a positive, and sees the profit
// of contacting the top groups. Numbers from core/customer.js liftTable and core/classify.js roc.
//   { type: 'lift', title, y: { name, values (0/1), yes: 'lapsed' }, scores: { 'Model': [...], 'Recency only': [...] },
//     k: 10, cost?: { contact: 2, value: 15 }, note }
import { h, onResize } from '../../core/dom.js?v=25';
import { xl } from '../xl.js?v=25';
import { lineChart } from '../../core/charts.js?v=25';
import * as CU from '../../core/customer.js?v=25';
import { roc } from '../../core/classify.js?v=25';
import * as F from '../../core/format.js?v=25';
import { segmented } from '../dist-draw.js?v=25';

/** Lift table and AUC for one score (exported for the checker). */
export function compute(y, score, k = 10) { return { ...CU.liftTable(y, score, k), auc: roc(y, score).auc }; }

export function mount(el, cfg, ctx) {
  const base = `lf-${ctx.id}`;
  const names = Object.keys(cfg.scores), y = cfg.y.values, yes = cfg.y.yes || 'positive';
  const st = { s: names[0], k: cfg.k || 10, contact: cfg.cost?.contact ?? 0, value: cfg.cost?.value ?? 0 };
  const fields = [segmented(`${base}-s`, 'Score', names.map((n, i) => [String(i), n]), '0', (v) => { st.s = names[+v]; render(); }),
    segmented(`${base}-k`, 'Groups', [['5', '5'], ['10', '10']], String(st.k), (v) => { st.k = +v; render(); })];
  const num = (key, label, step) => { const id = `${base}-${key}`, inp = h('input', { type: 'number', id, value: st[key], step, min: 0 }); inp.addEventListener('input', () => { if (inp.value !== '' && Number.isFinite(+inp.value)) { st[key] = +inp.value; render(); } }); return h('div', { class: 'field' }, h('label', { for: id }, label), inp); };
  if (cfg.cost) fields.push(num('contact', 'Cost of contacting one customer ($)', 0.5), num('value', `Value of reaching one who has ${yes} ($)`, 1));
  const chart = h('div', { class: 'chart-box' }), out = h('div', { class: 'cv-out', 'aria-live': 'polite' });
  el.classList.add('cv-widget');
  el.append(...[cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null, h('div', { class: 'cv-fields' }, ...fields), chart, out,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null].filter(Boolean));

  function render() {
    const T = compute(y, cfg.scores[st.s], st.k);
    const xs = [0, ...T.rows.map((r) => r.cumShare)];
    const cls = ['m-s1', 'm-s3'];
    const series = names.map((n, i) => ({ name: n, values: [0, ...compute(y, cfg.scores[n], st.k).rows.map((r) => r.captured)], cls: cls[i] }));
    series.push({ name: 'Random', values: xs, cls: 'm-s2' });
    chart.replaceChildren();
    lineChart(chart, { endLabels: false, xs, series, height: 260, xLabel: 'Share of customers contacted, highest score first', yLabel: `Share of all who ${yes} found`, xFormat: (v) => F.pct(v, 0), yFormat: (v) => F.pct(v, 0), yDomain: [0, 1],
      label: `Cumulative gains for ${names.join(', ')} against a random order` });
    const profit = (r) => r.captured * T.positives * st.value - r.cumShare * T.n * st.contact;
    const best = cfg.cost ? T.rows.reduce((b, r) => (profit(r) > profit(b) ? r : b), T.rows[0]) : null;
    out.replaceChildren(
      h('p', {}, `${F.int(T.n)} customers, ${F.int(T.positives)} of whom ${yes} (${F.pct(T.base, 1)}). Area under the ROC curve for “${st.s}”: ${F.num(T.auc, 3)} (0.5 = no better than random).`),
      h('div', { class: 'table-scroll' }, h('table', { class: 'data-table study-table' }, h('caption', {}, `Lift table for “${st.s}”: ${st.k} groups from the highest score`),
        h('thead', {}, h('tr', {}, ...['Group', 'Customers', yes[0].toUpperCase() + yes.slice(1), 'Rate', 'Lift', 'Cumulative share found', 'Cumulative lift', ...(cfg.cost ? ['Profit if contacted down to here ($)'] : [])].map((c) => h('th', { scope: 'col' }, c)))),
        h('tbody', {}, ...T.rows.map((r) => h('tr', best === r ? { class: 'is-best' } : {}, h('th', { scope: 'row' }, String(r.group)), h('td', {}, F.int(r.n)), h('td', {}, F.int(r.positives)), h('td', {}, F.pct(r.rate, 1)),
          h('td', {}, F.num(r.lift, 2)), h('td', {}, F.pct(r.captured, 1)), h('td', {}, F.num(r.cumLift, 2)), ...(cfg.cost ? [h('td', {}, F.num(profit(r), 0))] : [])))))),
      ...(cfg.cost ? [h('p', {}, `At $${F.num(st.contact, 2)} a contact and $${F.num(st.value, 2)} for each one reached, contacting down to group ${best.group} (${F.pct(best.cumShare, 0)} of customers) makes the most: $${F.num(profit(best), 0)}. This counts every contacted customer who ${yes} as worth the full value, as if contact always changed the outcome; what contact really changes needs a test with a control group.`)] : []));
  }
  render();
  onResize(chart, render);
}
