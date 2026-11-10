// survival.js — the `survival` lesson widget (M06): Kaplan–Meier survival curves for one or more groups, each a step
// down at every churn time, with 95% bands (log–log) and censored customers counted as at risk until they leave
// observation; the median lifetime and, for two or more groups, the log-rank test. With `lapse`, the student sets how
// many days without a visit count as having lapsed (a noncontractual business has to define churn), and the curves are
// recomputed from the visits. Numbers from core/customer.js.
//   { type: 'survival', title, groups: [{ name, times, events }] — or lapse: { joins: { id: day }, visits: { id: [days] },
//     end: day, group: { id: name }, days: [30, 60, 90], value: 60 } —, unit: 'days', show: ['ci', 'median', 'logrank',
//     'table'], at?: [30, 90, 180] (survival read at these times), note }
import { h, onResize } from '../../core/dom.js?v=30';
import { xl } from '../xl.js?v=30';
import { scatter, tableTwin } from '../../core/charts.js?v=30';
import * as CU from '../../core/customer.js?v=30';
import * as F from '../../core/format.js?v=30';
import { segmented } from '../dist-draw.js?v=30';

/** Groups (name, times, events) for a lapse threshold. */
export function lapseGroups(lapse, L) {
  const t = CU.lapseTimes(lapse, L), names = lapse.group ? [...new Set(Object.values(lapse.group))].sort() : ['All members'];
  return names.map((name) => { const idx = t.ids.map((id, i) => i).filter((i) => !lapse.group || lapse.group[t.ids[i]] === name); return { name, times: idx.map((i) => t.times[i]), events: idx.map((i) => t.events[i]) }; });
}

export function mount(el, cfg, ctx) {
  const base = `sv-${ctx.id}`;
  const show = cfg.show || ['ci', 'median', 'logrank'];
  const unit = cfg.unit || 'days';
  const st = { L: cfg.lapse ? cfg.lapse.value : null };
  const controls = cfg.lapse ? h('div', { class: 'cv-fields' }, segmented(`${base}-L`, 'A member has lapsed after this many days without a visit', cfg.lapse.days.map((d) => [String(d), String(d)]), String(st.L), (v) => { st.L = +v; render(); })) : null;
  const chart = h('div', { class: 'chart-box' }), out = h('div', { class: 'cv-out', 'aria-live': 'polite' }), twin = h('div');
  el.classList.add('cv-widget');
  el.append(...[cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null, controls, chart, out, twin,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null].filter(Boolean));

  function render() {
    const groups = cfg.lapse ? lapseGroups(cfg.lapse, st.L) : cfg.groups;
    const fits = groups.map((g) => ({ ...g, km: CU.kaplanMeier(g.times, g.events) }));
    const tmax = Math.max(...groups.flatMap((g) => g.times));
    const cls = ['m-s1', 'm-s3', 'm-s2'];
    const stepPts = (km, key) => {
      const p = [[0, 1]]; let prev = 1;
      for (const st of km.steps) { const v = st[key]; if (!Number.isFinite(v)) break; p.push([st.t, prev], [st.t, v]); prev = v; }
      p.push([tmax, prev]); return p;
    };
    const curves = [];
    fits.forEach((f, i) => {
      if (show.includes('ci') && fits.length <= 2) for (const key of ['low', 'high']) curves.push({ pts: stepPts(f.km, key), cls: `${cls[i]} is-thin` });
      curves.push({ pts: stepPts(f.km, 'S'), cls: cls[i] });
    });
    chart.replaceChildren();
    scatter(chart, { points: [], curves, xDomain: [0, tmax], yDomain: [0, 1], height: 280, xLabel: `Time since joining (${unit})`, yLabel: 'Share not yet churned', yFormat: (v) => F.pct(v, 0),
      label: `Kaplan–Meier survival curves for ${fits.map((f) => f.name).join(' and ')}`, legend: fits.map((f, i) => ({ name: f.name, cls: cls[i], shape: 'line' })) });
    const items = [];
    const at = cfg.at || [];
    items.push(h('div', { class: 'table-scroll' }, h('table', { class: 'data-table study-table' }, h('caption', {}, 'Survival by group'),
      h('thead', {}, h('tr', {}, ...['Group', 'Customers', 'Churned', 'Censored', ...(show.includes('median') ? [`Median lifetime (${unit})`] : []), ...at.map((t) => `S(${t})`)].map((c) => h('th', { scope: 'col' }, c)))),
      h('tbody', {}, ...fits.map((f) => h('tr', {}, h('th', { scope: 'row' }, f.name), h('td', {}, F.int(f.km.n)), h('td', {}, F.int(f.km.events)), h('td', {}, F.int(f.km.n - f.km.events)),
        ...(show.includes('median') ? [h('td', {}, f.km.median == null ? 'not reached' : F.int(f.km.median))] : []), ...at.map((t) => h('td', {}, F.pct(f.km.at(t), 1)))))))));
    if (show.includes('logrank') && fits.length > 1) {
      const lr = CU.logRank(fits.flatMap((f) => f.times), fits.flatMap((f) => f.events), fits.flatMap((f) => f.times.map(() => f.name)));
      items.push(h('p', {}, `Log-rank test of equal survival: χ² = ${F.num(lr.chi2, 2)} on ${lr.df} df, p ${lr.p < 0.001 ? 'below 0.001' : `= ${lr.p.toFixed(3)}`}. Churn observed against expected if survival were the same: ${fits.map((f, i) => `${f.name} ${F.int(lr.observed[lr.groups.indexOf(f.name)])} against ${F.num(lr.expected[lr.groups.indexOf(f.name)], 1)}`).join('; ')}.`));
    }
    out.replaceChildren(...items);
    twin.replaceChildren();
    if (show.includes('table')) {
      const f = fits[0];
      tableTwin(twin, { caption: `Kaplan–Meier steps for ${f.name}`, columns: [{ label: `Time (${unit})` }, { label: 'At risk', num: true }, { label: 'Churned', num: true }, { label: 'Censored', num: true }, { label: 'S(t)', num: true }, { label: 'Std. error', num: true }, { label: '95% interval', num: true }],
        rows: f.km.steps.map((s) => [String(s.t), F.int(s.atRisk), F.int(s.events), F.int(s.censored), F.num(s.S, 4), F.num(s.se, 4), Number.isFinite(s.low) ? `${F.num(s.low, 3)} to ${F.num(s.high, 3)}` : '—']) });
    }
  }
  render();
  onResize(chart, render);
}
