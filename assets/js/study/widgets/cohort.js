// cohort.js — the `cohort` lesson widget (M06): a cohort table, one row per joining month and one column per month since
// joining, shaded so the triangle reads at a glance, with a switch between the share of the cohort active, the number
// active and revenue per member who joined; and the share-active curves of the cohorts the student picks, with the pooled
// curve across every cohort observed that long. Tables come from core/customer.js cohortTable(), computed by the lesson
// for each group it offers.
//   { type: 'cohort', title, tables: { 'Both cafés': cohortTable(...), 'Harbourside': …, … }, view: 'retention' | 'active'
//     | 'revenue', curves?: ['2027-03', '2027-06'] (cohorts drawn at first), note }
import { h, onResize } from '../../core/dom.js?v=27';
import { xl } from '../xl.js?v=27';
import { lineChart } from '../../core/charts.js?v=27';
import * as F from '../../core/format.js?v=27';
import { segmented } from '../dist-draw.js?v=27';

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthName = (label) => `${MON[+label.slice(5, 7) - 1]} ${label.slice(0, 4)}`;
/** The values the widget shows for a view (exported for the checker). */
export function values(t, view) {
  if (view === 'active') return t.active;
  if (view === 'revenue') return t.revenue.map((row, c) => row.map((v) => v / t.cohorts[c].size));
  return t.retention;
}

export function mount(el, cfg, ctx) {
  const base = `co-${ctx.id}`;
  const groups = Object.keys(cfg.tables);
  const st = { g: groups[0], view: cfg.view || 'retention', picked: new Set((cfg.curves || []).slice(0, 2)) };
  const controls = h('div', { class: 'cv-fields' },
    ...(groups.length > 1 ? [segmented(`${base}-g`, 'Members of', groups.map((g, i) => [String(i), g]), '0', (v) => { st.g = groups[+v]; render(); })] : []),
    segmented(`${base}-v`, 'Show', [['retention', 'Share active'], ['active', 'Number active'], ['revenue', 'Revenue per joiner']], st.view, (v) => { st.view = v; render(); }));
  const tbl = h('div', { class: 'table-scroll' }), picks = h('div', { class: 'sp-toggles' }), chart = h('div', { class: 'chart-box' });
  el.classList.add('cv-widget');
  el.append(...[cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null, controls, tbl, h('p', { class: 'fx-title' }, 'Share of each cohort active, by months since joining'), picks, chart,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null].filter(Boolean));

  function render() {
    const t = cfg.tables[st.g], V = values(t, st.view), maxK = Math.max(...V.map((r) => r.length));
    const fmt = st.view === 'retention' ? (v) => F.pct(v, 0) : st.view === 'active' ? (v) => F.int(v) : (v) => F.money(v, { digits: 2 });
    const all = V.flatMap((r, c) => r.slice(st.view === 'retention' ? 1 : 0)).filter(Number.isFinite), mx = Math.max(...all, 1e-9);
    tbl.replaceChildren(h('table', { class: 'co-table' }, h('caption', {}, `${st.view === 'retention' ? 'Share of each cohort active' : st.view === 'active' ? 'Members active' : 'Revenue per member who joined ($)'} in each month since joining (month 0 = the joining month)`),
      h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Cohort'), h('th', { scope: 'col' }, 'Joined'), ...Array.from({ length: maxK }, (_, k) => h('th', { scope: 'col' }, String(k))))),
      h('tbody', {}, ...t.cohorts.map((c, i) => h('tr', {}, h('th', { scope: 'row' }, monthName(c.label)), h('td', {}, F.int(c.size)),
        ...Array.from({ length: maxK }, (_, k) => {
          if (k >= V[i].length) return h('td', { class: 'is-empty' }, '');
          const v = V[i][k], td = h('td', {}, fmt(v));
          const shade = st.view === 'retention' && k === 0 ? 0 : v / mx;
          td.style.setProperty('--v', shade.toFixed(3)); if (shade > 0.7) td.classList.add('is-dark');
          return td;
        }))),
        h('tr', { class: 'co-pooled' }, h('th', { scope: 'row' }, 'All cohorts'), h('td', {}, F.int(t.cohorts.reduce((s, c) => s + c.size, 0))),
          ...t.pooled.map((p) => h('td', {}, st.view === 'retention' ? F.pct(p.rate, 0) : st.view === 'active' ? F.int(p.active) : F.money(t.revenue.reduce((s, row, c) => s + (p.k < row.length ? row[p.k] : 0), 0) / p.size, { digits: 2 })))))));
    picks.replaceChildren(...t.cohorts.map((c, i) => {
      const id = `${base}-p${i}`, inp = h('input', { type: 'checkbox', id, ...(st.picked.has(c.label) ? { checked: '' } : {}) });
      inp.addEventListener('change', () => {
        if (inp.checked) { st.picked.add(c.label); if (st.picked.size > 2) { const first = [...st.picked][0]; st.picked.delete(first); render(); return; } } else st.picked.delete(c.label);
        draw();
      });
      return h('div', { class: 'field sp-check' }, inp, h('label', { for: id }, monthName(c.label)));
    }));
    draw();
  }
  function draw() {
    const t = cfg.tables[st.g], maxK = t.pooled.length, xs = Array.from({ length: maxK }, (_, k) => k);
    const cls = ['m-s1', 'm-s3'];                     // two cohorts at a time (the validated palette has three series colours; gold is the pooled curve)
    const series = t.cohorts.map((c, i) => ({ c, i })).filter(({ c }) => st.picked.has(c.label)).slice(0, cls.length)
      .map(({ c, i }, j) => ({ name: monthName(c.label), values: xs.map((k) => (k < t.retention[i].length ? t.retention[i][k] : NaN)), cls: cls[j] }));
    series.push({ name: 'All cohorts', values: t.pooled.map((p) => p.rate), cls: 'm-s2' });
    chart.replaceChildren();
    lineChart(chart, { endLabels: false, xs, series, height: 260, xLabel: 'Months since joining', yLabel: 'Share active', yFormat: (v) => F.pct(v, 0), xFormat: (v) => String(v), yDomain: [0, 1],
      label: `Share active by months since joining for ${series.map((s) => s.name).join(', ')}` });
  }
  render();
  onResize(chart, draw);
}
