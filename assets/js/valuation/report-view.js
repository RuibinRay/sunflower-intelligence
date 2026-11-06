// report-view.js — renders the generated report (valuation-report.js) on the page with its charts, and the export
// bar: print to PDF, Markdown, every table as CSV (zipped), the model as an Excel workbook, the project as JSON.
import { h, download } from '../core/dom.js?v=27';
import * as F from '../core/format.js?v=27';
import * as V from '../core/valuation.js?v=27';
import * as IO from '../core/valuation-io.js?v=27';
import { reportToMarkdown, reportTablesCSV } from '../core/valuation-report.js?v=27';
import { barChart, lineChart, histogramChart, tableTwin } from '../core/charts.js?v=27';
import { verdict } from '../core/ui.js?v=27';
import { waterfall, football, heatGrid, riskMatrix, historyForecastBars } from './charts.js?v=27';
import { state } from './state.js?v=27';
import { btn } from './ui.js?v=27';
import { inline } from './inline.js?v=27';

const fin = Number.isFinite;
const slug = (s) => String(s || 'company').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function renderReport(container, rep) {
  container.replaceChildren();
  const P = state.project, f = rep.format;
  const tag = (t) => (t ? h('span', { class: `cv-tag is-${t}`, title: rep.labels[t] }, t === 'verified' ? 'data' : t) : null);
  const exportBar = h('div', { class: 'cv-export-bar' },
    btn('Print or save as PDF', () => window.print(), { kind: 'primary' }),
    btn('Markdown', () => download(`${slug(rep.company)}-valuation-report.md`, reportToMarkdown(rep), 'text/markdown;charset=utf-8')),
    btn('Tables (CSV, zipped)', () => { const files = reportTablesCSV(rep); const bytes = IO.zipStore(files.map((x) => ({ name: x.name, text: `# ${x.caption}\n${x.csv}` }))); download(`${slug(rep.company)}-report-tables.zip`, bytes, 'application/zip'); }),
    state.results.dcf?.ok ? btn('Excel model (formulas)', () => download(`${slug(rep.company)}-valuation-model.xlsx`, IO.buildModelWorkbook(P, state.A, state.results.dcf), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) : null,
    btn('Project (JSON)', () => download(`${slug(rep.company)}-valuation-project.json`, IO.serializeProject(P, state.A, { reportTitle: rep.title }), 'application/json')),
    state.results.dcf?.ok ? btn('DCF schedule (CSV)', () => download(`${slug(rep.company)}-dcf.csv`, IO.dcfCSV(state.results.dcf))) : null,
    btn('Assumptions (CSV)', () => download(`${slug(rep.company)}-assumptions.csv`, IO.assumptionsCSV(state.A, P))),
  );
  const toc = h('ul', { class: 'cv-report-toc', role: 'list' }, rep.sections.filter((s) => s.id !== 'cover').map((s) => h('li', {}, h('a', { href: `#rep-${s.id}` }, s.title))));
  const cover = h('div', { class: 'cv-report-cover' }, h('p', { class: 'cv-cover-kicker' }, 'Company valuation report'), h('h2', {}, rep.title), h('div', { class: 'cv-report-meta' }, h('span', {}, h('strong', {}, rep.company)), h('span', {}, rep.meta.industry), h('span', {}, `Valuation date ${rep.meta.valuationDate}`), h('span', {}, `${rep.meta.currency} ${rep.meta.unitLabel}`)), h('p', {}, h('strong', {}, 'Methods: '), rep.meta.methods.join('; ') || '—'), h('p', { class: 'muted small' }, `Prepared ${rep.meta.generated} with Sunflower Intelligence’s Company Valuation Studio${rep.meta.analyst ? ` by ${rep.meta.analyst}` : ''}. Data: ${rep.meta.source}.`), rep.meta.comments ? h('blockquote', { class: 'quote', style: { fontSize: 'var(--t-md)' } }, rep.meta.comments) : null,
    h('div', { class: 'cv-tag-key' }, h('span', {}, 'Labels: '), ...Object.entries(rep.labels).map(([k, v]) => h('span', {}, tag(k), ` ${v}`))),
    verdict('warn', 'Not investment advice.', 'This report values the company on explicit, editable assumptions. It issues no recommendation to buy, hold or sell and considers no reader’s circumstances.'));
  const art = h('article', { class: 'cv-report', 'aria-label': rep.title }, exportBar, cover, h('nav', { 'aria-label': 'Report contents' }, toc));
  rep.sections.filter((s) => s.id !== 'cover').forEach((s) => {
    const sec = h('section', { id: `rep-${s.id}`, 'aria-labelledby': `rep-${s.id}-h` }, h('h2', { id: `rep-${s.id}-h` }, s.title));
    s.blocks.forEach((b) => sec.append(renderBlock(b, tag, f)));
    art.append(sec);
  });
  container.append(art);
  requestAnimationFrame(() => drawFigures(art, f));
}
function renderBlock(b, tag, f) {
  if (b.type === 'p') return h('p', {}, inline(b.text), tag(b.tag));
  if (b.type === 'h3') return h('h3', {}, b.text);
  if (b.type === 'formula') return h('div', { class: 'cv-formula' }, inline(b.text), b.note ? h('small', {}, inline(b.note)) : null);
  if (b.type === 'list') return h('ul', { class: 'caveats', style: { fontSize: 'var(--t-sm)' } }, b.items.map((t) => h('li', {}, inline(t))), tag(b.tag));
  if (b.type === 'kv') return h('dl', { class: 'cv-kv' }, b.rows.flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, inline(String(v)))]), tag(b.tag));
  if (b.type === 'warn') return verdict(b.kind, b.title, b.text);
  if (b.type === 'figure') return h('figure', { class: 'cv-figure', 'data-chart': b.chart }, h('figcaption', { class: 'figure-title' }, b.caption), h('div', { class: 'chart' }));
  if (b.type === 'table') return h('figure', { class: 'cv-figure' }, h('figcaption', { class: 'figure-title' }, b.caption, tag(b.tag)), h('div', { class: 'table-scroll' }, h('table', { class: 'data-table' }, h('thead', {}, h('tr', {}, b.columns.map((c) => h('th', { scope: 'col', class: c.num ? 'is-num' : '' }, c.label)))), h('tbody', {}, b.rows.map((r) => h('tr', {}, r.map((v, k) => (k === 0 ? h('th', { scope: 'row' }, v) : h('td', { class: b.columns[k]?.num ? 'is-num' : '' }, v)))))))));
  return h('p', {}, String(b.text || ''));
}
/** Draws every figure placeholder from the live results (so the charts show exactly the report's numbers). */
function drawFigures(art, f) {
  const R = state.results, d = R.dcf, H = state.historical, P = state.project, { m } = V.market(P);
  art.querySelectorAll('figure[data-chart]').forEach((fig) => {
    const box = fig.querySelector('.chart');
    const kind = fig.dataset.chart;
    try {
      if (kind === 'forecast' && d?.ok) { historyForecastBars(barChart, box, { histYears: H.map((x) => x.year), histValues: H.map((x) => x.p.revenue), fcYears: d.rows.map((x) => x.year), fcValues: d.rows.map((x) => x.revenue), name: 'Revenue', format: (v) => F.compact(v), yLabel: f.unitLabel, height: 240, label: 'Revenue, history and forecast' }); const e = h('div', { class: 'chart' }); fig.append(e); historyForecastBars(barChart, e, { histYears: H.map((x) => x.year), histValues: H.map((x) => x.p.ebitda), fcYears: d.rows.map((x) => x.year), fcValues: d.rows.map((x) => x.ebitda), name: 'EBITDA', format: (v) => F.compact(v), yLabel: f.unitLabel, height: 200, label: 'EBITDA, history and forecast' }); }
      else if (kind === 'fcf' && d?.ok) barChart(box, { categories: d.rows.map((x) => String(x.year)), height: 220, label: 'Free cash flow to the firm and its present value', series: [{ name: 'FCFF', values: d.rows.map((x) => x.fcff), cls: 'm-light' }, { name: 'Present value', values: d.rows.map((x) => x.pv), cls: 'm-s2' }], format: (v) => F.compact(v), yLabel: f.unitLabel });
      else if (kind === 'bridge' && d?.ok) waterfall(box, { steps: [{ label: 'PV of forecast', value: d.sumPv }, { label: 'PV of terminal value', value: d.pvTV }, { label: 'Enterprise value', value: d.ev, total: true }, { label: 'Debt and leases', value: -(d.debt + d.leases) }, { label: 'Preferred and minority', value: -(d.preferred + d.minority) }, ...(d.other ? [{ label: 'Other claims', value: -d.other }] : []), { label: 'Cash', value: d.cash + d.nonOp }, { label: 'Equity value', value: d.equity, total: true }], format: (v) => F.compact(v), unit: f.unitLabel, label: 'Bridge from enterprise value to equity value', caption: 'Enterprise value to equity value' });
      else if (kind === 'football') football(box, { bars: state.football, price: m.sharePrice, format: (v) => f.perShare(v), caption: 'Valuation ranges by method' });
      else if (kind === 'scenarios' && state.scenarios) { const keys = ['bear', 'base', 'bull'].filter((k) => state.scenarios.scenarios[k]); barChart(box, { categories: keys.map((k) => state.scenarios.scenarios[k].name), height: 180, legend: false, valueLabels: true, horizontal: true, label: 'Value per share by scenario', series: [{ name: 'Per share', values: keys.map((k) => (state.scenarios.scenarios[k].result.ok ? state.scenarios.scenarios[k].result.perShare : NaN)), cls: 'm-s2' }], format: (v) => f.perShare(v) }); }
      else if (kind === 'sensitivity' && d?.ok) { const A = state.A, dW = [-0.02, -0.01, 0, 0.01, 0.02], dG = [-0.01, -0.005, 0, 0.005, 0.01]; heatGrid(box, { rowLabels: dW.map((x) => F.pct(d.r + x, 2)), colLabels: dG.map((x) => F.pct(A.terminal.growth + x)), values: dW.map((dw) => dG.map((dg) => { const r = V.dcf(P, V.applyDeltas(A, { wacc: dw, gT: dg })); return r.ok ? r.perShare : NaN; })), format: (v) => f.perShare(v), rowTitle: 'WACC', colTitle: 'terminal growth', centre: [2, 2] }); }
      else if (kind === 'risk-matrix') riskMatrix(box, { cells: V.riskMatrix(P.risks || []) });
      else if (kind === 'ratios' && H.length) { const xs = [...H.map((x) => x.year), ...(d?.ok ? d.rows.map((x) => x.year) : [])]; lineChart(box, { xs, height: 230, xLabel: 'year', yLabel: '%', xFormat: (v) => String(v), yFormat: (v) => F.num(v, 1), label: 'Margins and returns, history and forecast', xTicks: xs, series: [{ name: 'EBITDA margin', values: [...H.map((x) => x.margins.ebitda * 100), ...(d?.ok ? d.rows.map((x) => x.margin * 100) : [])], cls: 'm-s2' }, { name: 'Net margin', values: [...H.map((x) => x.margins.net * 100), ...(d?.ok ? d.rows.map(() => NaN) : [])], cls: 'm-s1' }, { name: 'Return on invested capital', values: [...H.map((x) => x.drivers.roic * 100), ...(d?.ok ? d.rows.map(() => NaN) : [])], cls: 'm-s3' }] }); }
      else if (kind === 'mc' && state.mc?.ok) histogramChart(box, { bins: state.mc.bins, height: 220, xLabel: 'value per share', format: (v) => f.perShare(v), label: 'Histogram of simulated values per share', markers: [{ x: state.mc.p50, label: 'median' }, ...(fin(state.mc.price) ? [{ x: state.mc.price, label: 'price' }] : [])] });
      else box.append(h('p', { class: 'note' }, 'Figure not available for the current models.'));
    } catch (e) { console.error(e); box.append(h('p', { class: 'note' }, 'This figure could not be drawn.')); }
  });
}
