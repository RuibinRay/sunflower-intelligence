// pivot.js — the "pivot" lesson widget: a PivotTable over a list of records (B03). Pick the row field, the column
// field, the value field, how to summarise it and how to show it, and filter by one field, as in Excel's PivotTable
// Fields pane. The arithmetic is core/sheet.js pivot().
//   { type: 'pivot', title, records: [{ field: value }], fields: ['Month', 'Region', …], values: ['Revenue', …],
//     defaults: { rows, cols, value, agg: 'sum'|'count'|'average'|'max'|'min', show: 'value'|'pct-total'|'pct-row'|'pct-col', filter: [field, value] },
//     formats: { Revenue: '$#,##0.00', Quantity: '#,##0' }, order: { Month: ['Mar', 'Apr', …] }, note }
import { h } from '../../core/dom.js?v=11';
import { xl } from '../xl.js?v=11';
import { pivot, display } from '../../core/sheet.js?v=11';

const AGG = [['sum', 'Sum'], ['count', 'Count'], ['average', 'Average'], ['max', 'Max'], ['min', 'Min']];
const SHOW = [['value', 'No calculation'], ['pct-total', '% of Grand Total'], ['pct-col', '% of Column Total'], ['pct-row', '% of Row Total']];

export function mount(el, cfg, ctx) {
  const base = `pv-${ctx.id}`;
  const d = { rows: cfg.fields[0], cols: '', value: cfg.values[0], agg: 'sum', show: 'value', ...(cfg.defaults || {}) };
  const sel = (id, label, options, value) => {
    const s = h('select', { class: 'select', id: `${base}-${id}` }, options.map(([v, l]) => h('option', { value: v, selected: v === (value ?? '') }, l)));
    return { s, f: h('div', { class: 'field' }, h('label', { for: s.id }, label), s) };
  };
  const rows = sel('rows', 'Rows', cfg.fields.map((f) => [f, f]), d.rows);
  const cols = sel('cols', 'Columns', [['', '(none)'], ...cfg.fields.map((f) => [f, f])], d.cols || '');
  const val = sel('val', 'Values', cfg.values.map((f) => [f, f]), d.value);
  const agg = sel('agg', 'Summarise values by', AGG, d.agg);
  const show = sel('show', 'Show values as', SHOW, d.show);
  const fField = sel('ff', 'Filter', [['', '(all)'], ...cfg.fields.map((f) => [f, f])], d.filter?.[0] || '');
  const fValue = h('select', { class: 'select', id: `${base}-fv`, 'aria-label': 'Filter value' });
  const out = h('div', { class: 'table-scroll' });
  const live = h('p', { class: 'visually-hidden', 'aria-live': 'polite' });
  const keysOf = (field) => {
    const seen = [...new Set(cfg.records.map((r) => String(r[field] ?? '(blank)')))];
    const order = cfg.order?.[field];
    return order ? seen.sort((a, b) => order.indexOf(a) - order.indexOf(b)) : seen.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  };
  const fillValues = (keep) => {
    const f = fField.s.value;
    fValue.replaceChildren(...(f ? keysOf(f).map((k) => h('option', { value: k, selected: k === keep }, k)) : []));
    fValue.hidden = !f;
  };
  fillValues(d.filter?.[1]);
  function draw() {
    const R = rows.s.value, C = cols.s.value || null, V = val.s.value, A = agg.s.value, S = show.s.value;
    const ff = fField.s.value, fv = fValue.value;
    const pv = pivot(cfg.records, { rows: R, cols: C, value: V, agg: A, show: S, filter: ff ? (r) => String(r[ff] ?? '(blank)') === fv : null });
    const sortBy = (keys, field) => { const order = cfg.order?.[field]; return order ? [...keys].sort((a, b) => order.indexOf(a) - order.indexOf(b)) : keys; };
    const rk = sortBy(pv.rowKeys, R), ck = C ? sortBy(pv.colKeys, C) : pv.colKeys;
    const fmt = S === 'value' ? (A === 'count' ? '#,##0' : cfg.formats?.[V] || 'general') : '0.0%';
    const cell = (v) => (v == null ? '' : display(v, fmt));
    const title = `${S === 'value' ? '' : `${SHOW.find(([k]) => k === S)[1]}: `}${AGG.find(([k]) => k === A)[1]} of ${V}`;
    const table = h('table', { class: 'data-table study-table pv-table' },
      h('caption', {}, `${title} by ${R}${C ? ` and ${C}` : ''}${ff ? ` (${ff} = ${fv})` : ''}`),
      h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, `${R}${C ? ` \\ ${C}` : ''}`), C ? ck.map((c) => h('th', { scope: 'col' }, c)) : h('th', { scope: 'col' }, title), C ? h('th', { scope: 'col', class: 'pv-total-col' }, 'Grand Total') : null)),
      h('tbody', {},
        rk.map((r) => h('tr', {}, h('th', { scope: 'row' }, r), (C ? ck : ['Total']).map((c) => h('td', {}, cell(pv.cells.get(`${r}|${c}`)))), C ? h('td', { class: 'pv-total-col' }, cell(pv.rowTotals.get(r))) : null)),
        h('tr', { class: 'pv-total' }, h('th', { scope: 'row' }, 'Grand Total'), (C ? ck : ['Total']).map((c) => h('td', {}, cell(pv.colTotals.get(c)))), C ? h('td', { class: 'pv-total-col' }, cell(pv.grand)) : null)));
    out.replaceChildren(table);
    live.textContent = `${table.querySelector('caption').textContent}: ${rk.length} rows.`;
    ctx.report?.('pivot', { R, C, V, A, S });
  }
  [rows, cols, val, agg, show].forEach((x) => x.s.addEventListener('change', draw));
  fField.s.addEventListener('change', () => { fillValues(); draw(); });
  fValue.addEventListener('change', draw);
  el.append(...[
    cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null,
    h('div', { class: 'pv-controls' }, rows.f, cols.f, val.f, agg.f, show.f, h('div', { class: 'field' }, h('label', { for: fField.s.id }, 'Filter'), fField.s, fValue)),
    out, live,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null,
  ].filter(Boolean));
  draw();
}
