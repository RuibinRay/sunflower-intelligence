// dashboard.js — the Company Intelligence workspace built from the imported project: overview and executive summary,
// the three statements (values, common-size, year-on-year) with reconciliation checks, ratios with the formula and
// inputs behind each one, valuation on the same engine as the Company Valuation Studio, operational datasets, data
// lineage and quality, and the report and exports. Every figure is tagged: data, derived, assumption or unavailable.
import { h, $, $$, download, onResize } from '../core/dom.js?v=31';
import * as F from '../core/format.js?v=31';
import * as V from '../core/valuation.js?v=31';
import * as R from '../core/ratios.js?v=31';
import * as W from '../core/workbook.js?v=31';
import * as IO from '../core/valuation-io.js?v=31';
import * as X from '../core/intel-export.js?v=31';
import { METRICS, GROUPS, METRIC, metricTable, missingInputs, healthSummary } from '../core/metrics.js?v=31';
import { formatter, historyNarrative } from '../core/valuation-report.js?v=31';
import { barChart, lineChart, histogramChart, tableTwin } from '../core/charts.js?v=31';
import { verdict } from '../core/ui.js?v=31';
import { waterfall, heatGrid, historyForecastBars, football } from '../valuation/charts.js?v=31';
import { numInput, textInput, selectEl, field, pctSlider, numSlider, segmented, btn, stat, dataTable, id, ROOT } from '../valuation/ui.js?v=31';

const fin = Number.isFinite;
const TABS = [['overview', 'Overview'], ['statements', 'Statements'], ['ratios', 'Ratios'], ['valuation', 'Valuation'], ['operations', 'Operations'], ['lineage', 'Data lineage and quality'], ['report', 'Report and exports']];
const tag = (kind, text) => h('span', { class: `cv-tag is-${kind}`, title: { verified: 'From the imported data', estimate: 'Derived by the engine from other lines', assumption: 'An assumption you set', interpretation: 'A reading of the numbers' }[kind] }, text || { verified: 'data', estimate: 'derived', assumption: 'assumption', interpretation: 'reading' }[kind]);
const slug = (s) => String(s || 'company').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function renderDashboard(box, state, hooks = {}) {
  const P = state.project;
  let tab = 'overview', C = {};
  const compute = () => {
    C = { f: formatter(P), H: [], validation: [], table: {}, val: null };
    if (P.history.length) {
      try { C.H = V.historical(P); C.validation = V.validate(P); C.table = metricTable(C.H); } catch (e) { console.error(e); }
    }
    if (state.valuationOn && state.A && C.H.length) {
      P.market = { ...state.market };
      const L = C.H[C.H.length - 1].p;
      P.models = { dcf: true, fcfe: fin(L.interestExpense) || fin(L.debt), ddm: fin(L.dividends) && L.dividends > 0, asset: fin(L.totalAssets) && fin(L.totalLiabilities) && fin(L.equity), comps: (P.peers || []).some((p) => p && p.name), sotp: false, earnings: false, vc: false };
      try { C.val = V.valueAll(P, state.A); C.val.tornado = V.tornado(P, state.A); } catch (e) { console.error(e); C.val = { results: { dcf: { error: e.message } } }; }
    }
    C.narr = C.H.length ? historyNarrative(C.f, C.H, C.val?.results?.dcf?.ok ? C.val.results.dcf : null) : { paras: [] };
    C.health = C.H.length ? healthSummary(C.H) : [];
  };
  compute();
  const hasData = () => C.H.length > 0;
  const datasets = () => (state.analysis ? state.analysis.sheets.filter((s) => s.kind === 'dataset') : []);
  const tabs = h('div', { class: 'ci-tabs', role: 'tablist', 'aria-label': 'Company Intelligence views' });
  const body = h('div', { class: 'ci-tab-body', role: 'tabpanel' });
  const head = h('div', { class: 'ci-step-head' }, h('span', { class: 'ci-step-n' }, state.wb ? '4' : '2'), h('h3', {}, 'Company dashboard'));
  const drawTabs = () => tabs.replaceChildren(...TABS.filter(([k]) => (k === 'operations' ? datasets().length : hasData() || k === 'lineage')).map(([k, name]) => { const b = h('button', { type: 'button', role: 'tab', class: 'ci-tab', 'aria-selected': String(k === tab), 'data-tab': k }, name); b.addEventListener('click', () => { tab = k; drawTabs(); draw(); }); return b; }));
  const draw = () => {
    body.replaceChildren();
    ({ overview, statements, ratios, valuation, operations, lineage, report })[tab]();
  };
  if (!hasData()) tab = datasets().length ? 'operations' : 'lineage';
  box.replaceChildren(head, tabs, body);
  drawTabs(); draw();
  onResize(body, () => { if (tab === 'overview' || tab === 'valuation' || tab === 'ratios' || tab === 'operations') draw(); });
  const fmtMetric = (m, v) => (!fin(v) ? '—' : m.fmt === 'pct' ? F.pct(v, 1) : m.fmt === 'x' ? `${F.num(v, 2)}×` : m.fmt === 'days' ? `${F.num(v, 1)} days` : m.fmt === 'money' ? C.f.money(v) : F.num(v, 2));
  const fmtVar = (v, kind) => (!fin(v) ? 'not available' : kind === 'pct' ? F.pct(v, 1) : kind === 'days' ? `${F.num(v, 1)} days` : kind === 'num' ? F.num(v, 0) : kind === 'num4' ? F.num(v, 4) : C.f.money(v));

  // ================================================================ overview
  function overview() {
    const f = C.f, H = C.H, L = H[H.length - 1], t = C.table, last = H.length - 1;
    const name = textInput({ value: P.meta.name, ariaLabel: 'Company name', onInput: (v) => { P.meta.name = v; } });
    const ind = selectEl(V.INDUSTRIES, P.meta.industry || 'general', (v) => { P.meta.industry = v; compute(); });
    const kpis = [['Revenue', f.money(L.p.revenue), fin(L.growth.revenue) ? `${F.signed(L.growth.revenue * 100, 1)}% on ${L.year - 1}` : `FY${L.year}`], ['EBITDA margin', F.pct(L.margins.ebitda), fin(L.p.ebitda) ? f.money(L.p.ebitda) : ''], ['Net income', f.money(L.p.netIncome), fin(L.margins.net) ? `${F.pct(L.margins.net)} margin` : ''], ['Free cash flow', f.money(L.p.fcf), fin(L.drivers.cashConversion) ? `cash conversion ${F.num(L.drivers.cashConversion, 2)}×` : ''],
      ['Return on equity', F.pct(t.roe?.[last]), fin(t.roic?.[last]) ? `ROIC ${F.pct(t.roic[last])}` : ''], ['Net debt ÷ EBITDA', fin(t.netDebtToEbitda?.[last]) ? `${F.num(t.netDebtToEbitda[last], 2)}×` : '—', fin(t.interestCoverage?.[last]) ? `interest cover ${F.num(t.interestCoverage[last], 1)}×` : ''], ['Current ratio', fin(t.current?.[last]) ? `${F.num(t.current[last], 2)}×` : '—', fin(t.quick?.[last]) ? `quick ${F.num(t.quick[last], 2)}×` : ''], ['Altman Z″', fin(t.altmanZ2?.[last]) ? F.num(t.altmanZ2[last], 2) : '—', R.altman(L.p, 'zdouble').zone ? `${R.altman(L.p, 'zdouble').zone} zone` : '']];
    const strip = h('div', { class: 'ci-kpis on-night' }, kpis.map(([k, v, s]) => h('div', { class: 'ci-kpi' }, h('span', { class: 'ci-kpi-label' }, k), h('span', { class: 'ci-kpi-value' }, v), h('span', { class: 'ci-kpi-sub' }, s))));
    const summary = h('div', { class: 'ci-summary' }, h('h4', {}, 'Executive summary'), ...summaryParas().map(([kind, text]) => h('p', {}, text, ' ', tag(kind))));
    const health = h('div', { class: 'ci-health' }, h('h4', {}, 'Financial health'), ...C.health.map((x) => verdict(x.kind, x.title, x.text)));
    const c1 = h('div', { class: 'chart' }), c2 = h('div', { class: 'chart' }), c3 = h('div', { class: 'chart' });
    body.append(h('div', { class: 'cv-inline-fields ci-id' }, field('Company', name), field('Industry (drives the model guide)', ind), h('p', { class: 'field-hint' }, `${H.length} fiscal years, FY${H[0].year}–FY${L.year}, in ${f.cur} ${f.unitLabel}. ${P.source?.note || ''}`)),
      strip, h('div', { class: 'ci-two' }, summary, health),
      h('div', { class: 'cv-results-grid' }, h('figure', { class: 'cv-figure' }, h('figcaption', { class: 'figure-title' }, 'Revenue and EBITDA'), c1), h('figure', { class: 'cv-figure' }, h('figcaption', { class: 'figure-title' }, 'Margins'), c2), h('figure', { class: 'cv-figure' }, h('figcaption', { class: 'figure-title' }, 'Cash flow'), c3)));
    requestAnimationFrame(() => {
      const yrs = H.map((x) => String(x.year));
      barChart(c1, { categories: yrs, height: 230, label: 'Revenue and EBITDA by year', yLabel: f.unitLabel, format: (v) => F.compact(v), series: [{ name: 'Revenue', values: H.map((x) => x.p.revenue), cls: 'm-s1' }, { name: 'EBITDA', values: H.map((x) => x.p.ebitda), cls: 'm-s2' }] });
      if (H.length > 1) lineChart(c2, { xs: H.map((x) => x.year), xTicks: H.map((x) => x.year), height: 230, xFormat: (v) => String(v), yFormat: (v) => `${F.num(v, 1)}%`, label: 'Gross, EBITDA and net margin by year', series: [{ name: 'Gross', values: H.map((x) => x.margins.gross * 100), cls: 'm-s1' }, { name: 'EBITDA', values: H.map((x) => x.margins.ebitda * 100), cls: 'm-s2' }, { name: 'Net', values: H.map((x) => x.margins.net * 100), cls: 'm-s3' }] });
      else c2.append(h('p', { class: 'note' }, 'One year only: no trend to draw.'));
      barChart(c3, { categories: yrs, height: 230, label: 'Operating cash flow, capital expenditure and free cash flow by year', yLabel: f.unitLabel, format: (v) => F.compact(v), series: [{ name: 'Operating cash flow', values: H.map((x) => x.p.cfo), cls: 'm-s1' }, { name: 'Capex', values: H.map((x) => (fin(x.p.capex) ? -x.p.capex : NaN)), cls: 'm-neg' }, { name: 'Free cash flow', values: H.map((x) => x.p.fcf), cls: 'm-s2' }] });
    });
  }
  /** Sentences for the summary, each tied to a computed figure: [kind, text]. */
  function summaryParas() {
    const f = C.f, H = C.H, L = H[H.length - 1], out = [];
    out.push(['verified', `${P.meta.name || 'The company'} reported revenue of ${f.money(L.p.revenue)} in fiscal ${L.year}${fin(L.p.netIncome) ? ` and net income of ${f.money(L.p.netIncome)}` : ''}${fin(L.p.totalAssets) ? `, on total assets of ${f.money(L.p.totalAssets)}` : ''}.`]);
    C.narr.paras.slice(0, 5).forEach((t) => out.push(['interpretation', t]));
    const d = C.val?.results?.dcf;
    if (d?.ok) out.push(['assumption', `On the assumptions set in the Valuation tab (WACC ${F.pct(d.r, 2)}, terminal ${d.assumptions.terminal.method === 'exit' ? `multiple ${F.num(d.assumptions.terminal.multiple, 1)}×` : `growth ${F.pct(d.assumptions.terminal.growth)}`}), the discounted cash flow gives an enterprise value of ${f.money(d.ev)} and an equity value of ${f.money(d.equity)}${fin(d.perShare) ? `, ${f.perShare(d.perShare)} a share` : ''}; ${F.pct(d.tvShare, 0)} of it is terminal value.`]);
    else out.push(['interpretation', 'No valuation has been run: a workbook holds no share price, beta or cost of capital, so those have to be entered on the Valuation tab first.']);
    const gaps = unavailable();
    if (gaps.length) out.push(['interpretation', `Not available from this data: ${gaps.join('; ')}.`]);
    return out;
  }
  function unavailable() {
    const L = C.H[C.H.length - 1].p, out = [];
    const need = (k, label) => { if (!fin(L[k])) out.push(label); };
    need('cfo', 'operating cash flow (cash-flow ratios and free cash flow are derived or missing)'); need('interestExpense', 'interest expense (no interest coverage)'); need('inventory', 'inventory (no inventory days)'); need('retainedEarnings', 'retained earnings (no Altman scores)'); need('shares', 'share count (no per-share values)'); need('da', 'depreciation and amortisation (no EBITDA unless reported)');
    if (!fin(state.market.sharePrice)) out.push('a share price (no market capitalisation, multiples or upside)');
    if (!(P.peers || []).length) out.push('peer companies (no comparable-company valuation)');
    return out;
  }

  // ================================================================ statements
  let stKind = 'is', stView = 'values';
  function statements() {
    const H = C.H, f = C.f;
    const pick = segmented(id('st'), V.STATEMENTS.map((s) => ({ id: s.id, name: s.name })), stKind, (v) => { stKind = v; draw(); });
    const view = segmented(id('sv'), [{ id: 'values', name: 'Values' }, { id: 'common', name: 'Common-size' }, { id: 'yoy', name: 'Year-on-year change' }], stView, (v) => { stView = v; draw(); });
    const fields = V.FIELDS.filter((x) => x.st === stKind && H.some((y) => fin(y.p[x.id])));
    const base = stKind === 'bs' ? 'totalAssets' : 'revenue';
    const cell = (x, i, fd) => {
      const v = x.p[fd.id];
      if (!fin(v)) return h('td', { class: 'is-num is-na', title: 'Not in the source and not derivable from the other lines' }, '—');
      let text;
      if (stView === 'common') text = fin(x.p[base]) && x.p[base] !== 0 && fd.id !== 'shares' ? F.pct(v / x.p[base], 1) : '—';
      else if (stView === 'yoy') { const pv = i ? H[i - 1].p[fd.id] : NaN; text = fin(pv) && pv !== 0 ? `${F.signed(((v - pv) / Math.abs(pv)) * 100, 1)}%` : '—'; }
      else text = F.num(v, Math.abs(v) >= 1000 ? 0 : 1);
      const src = state.lineage[x.year]?.[fd.id];
      return h('td', { class: `is-num${x.how[fd.id] ? ' is-derived' : ''}`, title: x.how[fd.id] ? `Derived: ${x.how[fd.id]}` : src ? `${src.sheet} › ${src.label} (${(src.cells || []).slice(0, 3).join(', ')})` : 'As entered' }, text);
    };
    const table = h('table', { class: 'data-table ci-statement' }, h('caption', { class: 'visually-hidden' }, `${V.STATEMENTS.find((s) => s.id === stKind).name}, ${stView}`), h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, `${f.cur} ${f.unitLabel}`), H.map((x) => h('th', { scope: 'col', class: 'is-num' }, `FY${x.year}`)))),
      h('tbody', {}, fields.map((fd) => h('tr', { class: /^(grossProfit|ebitda|ebit|netIncome|totalAssets|totalLiabilities|equity|cfo|fcf|currentAssets|currentLiabilities)$/.test(fd.id) ? 'is-strong' : '' }, h('th', { scope: 'row' }, fd.label, H.some((x) => x.how[fd.id]) ? tag('estimate') : null), H.map((x, i) => cell(x, i, fd))))));
    body.append(h('div', { class: 'cv-inline-fields' }, pick, view), h('p', { class: 'field-hint' }, stView === 'common' ? `Each line as a share of ${stKind === 'bs' ? 'total assets' : 'revenue'}.` : stView === 'yoy' ? 'Change on the prior year, measured against the size of the prior figure.' : 'Italic figures were derived from other lines (hover for how); a dash means the source does not provide the figure. Hover any number for its source cell.'),
      fields.length ? h('div', { class: 'table-scroll' }, table) : verdict('warn', 'This statement is not in the data.', 'Nothing was mapped to it. Ratios and models that need it are shown as unavailable.'),
      h('h4', {}, 'Reconciliation checks'), reconciliation());
  }
  function reconciliation() {
    const H = C.H;
    const tol = (a, b) => Math.abs(a - b) <= 0.005 * Math.max(1, Math.abs(a), Math.abs(b));
    const checks = [
      ['Assets = liabilities + equity', (x) => (['totalAssets', 'totalLiabilities', 'equity'].every((k) => fin(x.raw[k])) ? [x.raw.totalAssets, x.raw.totalLiabilities + x.raw.equity + (x.raw.minorityInterest || 0) + (x.raw.preferredEquity || 0)] : null)],
      ['Gross profit = revenue − cost of goods sold', (x) => (['grossProfit', 'revenue', 'cogs'].every((k) => fin(x.raw[k])) ? [x.raw.grossProfit, x.raw.revenue - x.raw.cogs] : null)],
      ['Net income = pre-tax income − tax', (x) => (['netIncome', 'pretax', 'tax'].every((k) => fin(x.raw[k])) ? [x.raw.netIncome, x.raw.pretax - x.raw.tax] : null)],
      ['Operating + investing + financing cash flow = change in cash', (x, i) => (i > 0 && ['cfo', 'investingCF', 'financingCF', 'cash'].every((k) => fin(x.p[k])) && fin(H[i - 1].p.cash) ? [x.p.cfo + x.p.investingCF + x.p.financingCF, x.p.cash - H[i - 1].p.cash] : null)],
      ['Current assets = their parts', (x) => (['currentAssets', 'cash', 'receivables', 'inventory'].every((k) => fin(x.raw[k])) ? [x.raw.currentAssets, x.raw.cash + (x.raw.shortTermInvestments || 0) + x.raw.receivables + x.raw.inventory + (x.raw.otherCurrentAssets || 0)] : null)],
    ];
    const Hx = H.map((x, i) => ({ ...x, raw: P.history.find((y) => y.year === x.year) || {}, i }));
    const rows = checks.map(([label, fn]) => [label, ...Hx.map((x, i) => { const r = fn(x, i); if (!r) return 'n/a'; return tol(r[0], r[1]) ? '✓ ties' : `✕ off by ${F.num(r[0] - r[1], 1)}`; })]);
    return h('div', {}, dataTable([{ label: 'Check' }, ...H.map((x) => ({ label: `FY${x.year}`, num: true }))], rows, 'Accounting reconciliation checks'), h('p', { class: 'field-hint' }, '“n/a” means the source does not give every line the check needs (a derived line ties by construction, so it proves nothing). Differences up to 0.5% count as ties; the cash-flow check allows for exchange-rate effects in the engine’s own validation.'),
      C.validation.filter((w) => w.level !== 'info').length ? h('ul', { class: 'cv-validation' }, C.validation.filter((w) => w.level !== 'info').map((w) => h('li', { class: `is-${w.level}` }, w.text))) : verdict('good', 'No inconsistencies found in the statements.', 'Totals and relationships agree within 0.5%.'));
  }

  // ================================================================ ratios
  let chartMetric = 'roe';
  function ratios() {
    const H = C.H, t = C.table;
    const chart = h('div', { class: 'chart' });
    const sel = selectEl(METRICS.filter((m) => t[m.id].some(fin)).map((m) => ({ value: m.id, label: m.name })), chartMetric, (v) => { chartMetric = v; drawChart(); });
    const drawChart = () => { const m = METRIC[chartMetric]; const k = m.fmt === 'pct' ? 100 : 1; chart.replaceChildren(); if (H.length > 1) lineChart(chart, { xs: H.map((x) => x.year), xTicks: H.map((x) => x.year), height: 220, xFormat: (v) => String(v), yFormat: (v) => (m.fmt === 'pct' ? `${F.num(v, 1)}%` : F.num(v, 2)), label: `${m.name} by year`, series: [{ name: m.name, values: t[m.id].map((v) => v * k), cls: 'm-s2' }] }); else chart.append(h('p', { class: 'note' }, 'One year only.')); };
    body.append(h('p', { class: 'cv-sub' }, 'Every ratio is computed from the statements above by the same engine the courses use. Press “Learn this calculation” for its formula, the numbers that went in, the convention chosen and the lesson that teaches it. A dash means an input is missing; hover it to see which.'),
      h('div', { class: 'cv-inline-fields' }, field('Chart', sel)), h('figure', { class: 'cv-figure' }, chart));
    for (const g of GROUPS) {
      const ms = METRICS.filter((m) => m.group === g.id);
      const tb = h('tbody');
      ms.forEach((m) => {
        const detail = h('tr', { class: 'ci-learn-row', hidden: true }, h('td', { colspan: H.length + 1 }));
        const open = btn('Learn this calculation', () => { detail.hidden = !detail.hidden; if (!detail.hidden) fillLearn(detail.firstChild, m); open.setAttribute('aria-expanded', String(!detail.hidden)); }, { cls: 'btn-sm ci-learn-btn' });
        open.setAttribute('aria-expanded', 'false');
        tb.append(h('tr', {}, h('th', { scope: 'row' }, h('span', { class: 'ci-metric-name' }, m.name), open), t[m.id].map((v, i) => h('td', { class: `is-num${fin(v) ? '' : ' is-na'}`, title: fin(v) ? m.formula : `Unavailable: needs ${missingInputs(m, H, i).join(', ') || 'more data'}` }, fmtMetric(m, v)))), detail);
      });
      body.append(h('h4', {}, g.name), h('div', { class: 'table-scroll' }, h('table', { class: 'data-table ci-ratios' }, h('caption', { class: 'visually-hidden' }, `${g.name} ratios by year`), h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Metric'), H.map((x) => h('th', { scope: 'col', class: 'is-num' }, `FY${x.year}`)))), tb)));
    }
    requestAnimationFrame(drawChart);
  }
  function fillLearn(td, m) {
    const H = C.H, i = H.length - 1;
    let vars = []; try { vars = m.vars(H, i); } catch { vars = []; }
    const v = C.table[m.id][i];
    td.replaceChildren(h('div', { class: 'ci-learn' },
      h('div', { class: 'cv-formula' }, `${m.name} = ${m.formula}`),
      h('p', {}, h('strong', {}, `FY${H[i].year}: `), vars.map(([label, val, kind]) => `${label} ${fmtVar(val, kind)}`).join(' · '), ' → ', h('strong', {}, fmtMetric(m, v)), fin(v) ? '' : ` (unavailable: ${missingInputs(m, H, i).join(', ')} missing)`),
      m.note ? h('p', { class: 'field-hint' }, `Convention: ${m.note}`) : null,
      h('p', { class: 'field-hint' }, `Source: ${m.source}.`),
      h('div', { class: 'input-actions' }, h('a', { class: 'btn btn-secondary btn-sm', href: ROOT + m.learn }, 'Open the lesson'), h('a', { class: 'btn btn-secondary btn-sm', href: `${ROOT}learn/formulas/` }, 'Formula library'), h('a', { class: 'btn btn-secondary btn-sm', href: `${ROOT}learn/glossary/` }, 'Glossary'))));
  }

  // ================================================================ valuation
  function valuation() {
    const f = C.f, H = C.H, L = H[H.length - 1], A = state.A;
    if (!A) { body.append(verdict('bad', 'No valuation is possible.', 'The data has no revenue to forecast from.')); return; }
    const guide = V.modelGuide(V.profileOf({ ...P, market: state.market }));
    const M = state.market;
    const kdObs = fin(L.p.interestExpense) && fin(L.p.debt) && L.p.debt > 0 ? L.p.interestExpense / L.p.debt : NaN;
    const setM = (k, alsoA) => (v) => { if (fin(v)) M[k] = v; else delete M[k]; if (alsoA && fin(v)) A.discount[alsoA] = v; };
    const inputs = h('div', { class: 'cv-field-grid' },
      field(`Share price (${f.cur})`, numInput({ value: M.sharePrice, placeholder: 'not in the workbook', onInput: setM('sharePrice') }), { hint: 'Optional. Without it there is no market capitalisation, so WACC weights use book equity.' }),
      field(`Shares outstanding (${f.unitLabel})`, numInput({ value: M.sharesOutstanding, placeholder: fin(L.p.shares) ? `${F.num(L.p.shares, 2)} (diluted, FY${L.year})` : 'needed for per-share values', onInput: setM('sharesOutstanding') })),
      field('Beta', numInput({ value: M.beta ?? A.discount.beta, digits: 2, onInput: setM('beta', 'beta') }), { hint: 'Site default 1.00 (the market). Estimate it from prices on the Stock analysis page.' }),
      field('Risk-free rate (%)', numInput({ value: M.rf ?? A.discount.rf, scale: 100, digits: 2, onInput: setM('rf', 'rf') }), { hint: 'Site default 4.20%. Use a current long government yield.' }),
      field('Equity risk premium (%)', numInput({ value: M.erp ?? A.discount.erp, scale: 100, digits: 2, onInput: setM('erp', 'erp') }), { hint: 'Site default 5.00%.' }),
      field('Pre-tax cost of debt (%)', numInput({ value: M.kd ?? A.discount.kd, scale: 100, digits: 2, onInput: setM('kd', 'kd') }), { hint: fin(kdObs) ? `Interest ÷ debt in FY${L.year} was ${F.pct(kdObs, 2)}.` : 'No interest and debt in the data: set it.' }));
    const run = btn(state.valuationOn ? 'Update the valuation' : 'Run the valuation with these assumptions', () => { state.valuationOn = true; state.mc = null; compute(); draw(); }, { kind: 'sun' });
    body.append(h('div', { class: 'ci-need' }, h('h4', {}, 'What the workbook cannot tell you ', tag('assumption')), h('p', { class: 'cv-sub' }, 'A spreadsheet of statements holds no share price, no beta and no cost of capital. Nothing is filled in for you beyond the site’s stated defaults: confirm or change each one, then run. Forecast drivers start from the company’s own history and stay editable below.'), inputs, h('div', { class: 'input-actions' }, run)),
      h('h4', {}, 'Which models this data supports'),
      h('ul', { class: 'cv-models' }, guide.map((g) => { const miss = V.missingFor({ ...P, market: state.market }, g.id).missing; return h('li', { class: 'cv-model' }, h('span', { class: `cv-fit is-${miss.length && g.fit !== 'unsuitable' ? 'caution' : g.fit}` }, miss.length && g.fit !== 'unsuitable' ? 'needs data' : g.fit), h('div', {}, h('span', { class: 'cv-model-name' }, g.name), h('p', {}, miss.length ? `Missing: ${miss.map((k) => ({ sharesOutstanding: 'shares outstanding', sharePrice: 'share price' }[k] || V.label(k))).join(', ')}. ` : '', g.id === 'comps' && !(P.peers || []).length ? 'No peers are in the data and none are invented: add them in the Valuation Studio. ' : '', g.why))); })));
    if (!state.valuationOn) { distress(); return; }
    const res = h('div', { class: 'ci-val-results' });
    // live scenario sliders
    const N = A.horizon, fade = (n, a, b) => Array.from({ length: n }, (_, i) => a + (b - a) * (n > 1 ? i / (n - 1) : 1));
    const rerun = () => { state.mc = null; compute(); results(res); };
    const sliders = h('div', { class: 'cv-sliders' },
      pctSlider({ label: 'Revenue growth, year 1 (fades to terminal)', value: A.growth[0], min: -20, max: 40, step: 0.5, onInput: (v) => { A.growth = fade(A.horizon, v, A.terminal.growth); rerun(); } }),
      pctSlider({ label: 'EBITDA margin', value: A.margin[0], min: -20, max: 70, step: 0.5, onInput: (v) => { A.margin = Array(A.horizon).fill(v); rerun(); } }),
      pctSlider({ label: 'Capex as % of revenue', value: A.capexPct[0], min: 0, max: 30, step: 0.1, onInput: (v) => { A.capexPct = Array(A.horizon).fill(v); rerun(); } }),
      pctSlider({ label: 'Terminal growth', value: A.terminal.growth, min: -2, max: 6, step: 0.1, onInput: (v) => { const g0 = A.growth[0]; A.terminal.growth = v; A.growth = fade(A.horizon, g0, v); rerun(); } }),
      numSlider({ label: 'Beta', value: A.discount.beta, min: 0.2, max: 2.5, step: 0.05, digits: 2, onInput: (v) => { A.discount.beta = v; M.beta = v; rerun(); } }));
    const horizon = segmented(id('hz'), [{ id: '3', name: '3 years' }, { id: '5', name: '5 years' }, { id: '10', name: '10 years' }], String([3, 5, 10].includes(N) ? N : 5), (v) => { const n = +v, g0 = A.growth[0]; A.horizon = n; A.growth = fade(n, g0, A.terminal.growth); ['margin', 'daPct', 'capexPct', 'nwcPct', 'taxRate'].forEach((k) => { A[k] = Array(n).fill(A[k][0]); }); rerun(); });
    body.append(h('h4', {}, 'Scenario builder ', tag('assumption')), h('p', { class: 'field-hint' }, `Starting values come from the history: growth from the ${H.length > 1 ? `${H.length - 1}-year revenue CAGR` : 'default'}, margin, capex and working capital from the last three years’ averages, tax from the effective rate.`), h('div', { class: 'cv-inline-fields' }, h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Projection horizon'), horizon)), sliders, res);
    results(res);
    distress();
  }
  function results(box) {
    const f = C.f, H = C.H, R0 = C.val?.results || {}, d = R0.dcf, S = C.val?.scenarios;
    box.replaceChildren();
    if (!d || d.error) { box.append(verdict('bad', 'The discounted cash flow could not run.', d?.error || 'Check the assumptions.')); return; }
    const per = fin(d.perShare);
    const hero = h('div', { class: 'cv-hero' }, h('div', { class: 'figure-hero' }, h('span', { class: 'hero-value' }, per ? f.perShare(d.perShare) : f.money(d.equity)), h('span', { class: 'hero-label' }, per ? 'value per share, base case ' : 'equity value, base case (no share count) ', tag('estimate'))), h('p', { class: 'hero-label' }, `Enterprise value ${f.money(d.ev)} → equity ${f.money(d.equity)}. WACC ${F.pct(d.r, 2)} (${d.cc.how}); ${F.pct(d.tvShare, 0)} of the value is terminal value.`, fin(d.upside) ? ` ${F.signed(d.upside * 100, 1)}% against the ${f.perShare(d.price)} share price.` : ''));
    const stats = h('dl', { class: 'stats-row cv-stats' }, stat('FCFF model (at WACC)', per ? f.perShare(d.perShare) : f.money(d.equity)), R0.fcfe?.ok ? stat('FCFE model (at cost of equity)', per ? f.perShare(R0.fcfe.perShare) : f.money(R0.fcfe.equity), `cost of equity ${F.pct(R0.fcfe.ke, 2)}`) : stat('FCFE model', '—', R0.fcfe?.error || 'needs debt and interest'),
      R0.ddm?.ok ? stat('Dividend discount (multi-stage)', R0.ddm.multi.ok ? f.perShare(R0.ddm.multi.value) : '—', `Gordon ${R0.ddm.gordon.ok ? f.perShare(R0.ddm.gordon.value) : '—'}; growth 5% then ${F.pct(state.A.terminal.growth)} assumed`) : stat('Dividend discount', '—', R0.ddm?.error ? 'no dividends in the data, or no share count' : 'not applicable'),
      R0.asset?.ok ? stat('Tangible book value', per ? f.perShare(R0.asset.perShare.tangible) : f.money(R0.asset.tangible), `orderly liquidation ${per ? f.perShare(R0.asset.orderly.perShare) : f.money(R0.asset.orderly.net)}`) : stat('Asset-based', '—', 'needs a balance sheet'),
      stat('Comparable companies', R0.comps?.ok && R0.comps.range ? f.perShare(R0.comps.range.mid) : '—', R0.comps?.ok ? '' : 'no peers supplied'));
    const warns = h('div', {}, d.warnings.map((w) => verdict(w.kind, w.title, w.text)));
    const c1 = h('div', { class: 'chart' }), c2 = h('div', { class: 'chart' }), c3 = h('div', { class: 'chart' }), g1 = h('div'), tor = h('div'), ff = h('div'), mcBox = h('div');
    const scen = S ? ['bear', 'base', 'bull'].filter((k) => S.scenarios[k]) : [];
    const projT = h('div');
    box.append(hero, warns, stats,
      h('div', { class: 'cv-results-grid' }, h('figure', { class: 'cv-figure' }, h('figcaption', { class: 'figure-title' }, `Revenue: history and ${d.N}-year projection`), c1), h('figure', { class: 'cv-figure' }, h('figcaption', { class: 'figure-title' }, 'Free cash flow to the firm and its present value'), c2)),
      projT,
      h('figure', { class: 'cv-figure' }, h('figcaption', { class: 'figure-title' }, 'From enterprise value to equity value'), c3),
      h('div', { class: 'cv-results-grid' }, h('figure', { class: 'cv-figure' }, h('figcaption', { class: 'figure-title' }, 'Tornado: what moves the value most'), tor), h('figure', { class: 'cv-figure' }, h('figcaption', { class: 'figure-title' }, 'Sensitivity: WACC × terminal growth'), g1)),
      h('h4', {}, 'Bear, base and bull'), h('dl', { class: 'stats-row cv-stats' }, ...scen.map((k) => stat(`${S.scenarios[k].name} case`, S.scenarios[k].result.ok ? (per ? f.perShare(S.scenarios[k].result.perShare) : f.money(S.scenarios[k].result.equity)) : '—', `growth ${F.signed(S.scenarios[k].deltas.growth * 100, 0)} pts, margin ${F.signed(S.scenarios[k].deltas.margin * 100, 0)} pts, WACC ${F.signed(S.scenarios[k].deltas.wacc * 100, 0)} pt`)), per && S ? stat('Probability-weighted (25/50/25)', f.perShare(S.weighted)) : null),
      h('figure', { class: 'cv-figure' }, h('figcaption', { class: 'figure-title' }, 'Ranges by method'), ff),
      h('h4', {}, 'Monte Carlo'), h('p', { class: 'field-hint' }, '2,000 draws: growth and margin shifts are normal (sd 2 and 1.5 points, correlation 0.4), WACC normal (sd 0.75 point), terminal growth triangular (±1 point). These spreads are assumptions; the result shows how they propagate, not the probability of outcomes.'), h('div', { class: 'input-actions' }, btn('Run the simulation', () => { state.mc = V.monteCarlo(P, state.A, V.DEFAULT_MC); drawMc(); }, { cls: 'btn-sm', kind: 'primary' })), mcBox,
      h('div', { class: 'input-actions ci-handoff' }, btn('Continue in the Company Valuation Studio', () => { try { localStorage.setItem('si:cv:handoff', JSON.stringify({ project: { ...P, market: { ...state.market }, models: { ...P.models, comps: false } }, A: state.A, from: 'intel' })); location.href = '../company-valuation/'; } catch (e) { box.prepend(verdict('bad', 'The handover failed.', e.message)); } }, { kind: 'primary' }), h('span', { class: 'field-hint' }, 'Adds peers, the risk register, every other model, the tutorials and the twelve-section valuation report, on this same project.')));
    const drawMc = () => { mcBox.replaceChildren(); const mc = state.mc; if (!mc) return; if (mc.error) { mcBox.append(verdict('bad', 'The simulation could not run.', mc.error)); return; } const ch = h('div', { class: 'chart' }); mcBox.append(h('dl', { class: 'stats-row cv-stats' }, stat('5th percentile', f.perShare(mc.p5)), stat('Median', f.perShare(mc.p50)), stat('95th percentile', f.perShare(mc.p95)), stat('Runs below the price', fin(mc.belowPrice) ? F.pct(mc.belowPrice, 0) : 'no price given')), h('figure', { class: 'cv-figure' }, ch)); requestAnimationFrame(() => histogramChart(ch, { bins: mc.bins, height: 200, xLabel: per ? 'value per share' : 'equity value', format: (v) => (per ? f.perShare(v) : f.money(v)), label: 'Histogram of simulated values', markers: [{ x: mc.p50, label: 'median' }] })); };
    requestAnimationFrame(() => {
      historyForecastBars(barChart, c1, { histYears: H.map((x) => x.year), histValues: H.map((x) => x.p.revenue), fcYears: d.rows.map((x) => x.year), fcValues: d.rows.map((x) => x.revenue), name: 'Revenue', format: (v) => F.compact(v), yLabel: f.unitLabel, height: 220, label: 'Revenue, history and projection' });
      barChart(c2, { categories: d.rows.map((x) => (d.rows.length > 7 ? `’${String(x.year).slice(-2)}` : String(x.year))), height: 220, label: 'Projected free cash flow and present value', yLabel: f.unitLabel, format: (v) => F.compact(v), series: [{ name: 'FCFF', values: d.rows.map((x) => x.fcff), cls: 'm-light' }, { name: 'Present value', values: d.rows.map((x) => x.pv), cls: 'm-s2' }] });
      tableTwin(projT, { caption: 'Projection', columns: [{ label: `${f.cur} ${f.unitLabel}` }, ...d.rows.map((x) => ({ label: String(x.year), num: true }))], rows: [['Revenue', ...d.rows.map((x) => F.num(x.revenue, 1))], ['Growth', ...d.rows.map((x) => F.pct(x.growth))], ['EBITDA', ...d.rows.map((x) => F.num(x.ebitda, 1))], ['EBIT', ...d.rows.map((x) => F.num(x.ebit, 1))], ['NOPAT', ...d.rows.map((x) => F.num(x.nopat, 1))], ['Capex', ...d.rows.map((x) => F.num(x.capex, 1))], ['Change in working capital', ...d.rows.map((x) => F.num(x.dNwc, 1))], ['FCFF', ...d.rows.map((x) => F.num(x.fcff, 1))], ['FCFE', ...d.rows.map((x) => F.num(x.fcfe, 1))], ['Present value of FCFF', ...d.rows.map((x) => F.num(x.pv, 1))]] });
      waterfall(c3, { steps: [{ label: 'PV of forecast', value: d.sumPv }, { label: 'PV of terminal value', value: d.pvTV }, { label: 'Enterprise value', value: d.ev, total: true }, { label: 'Debt and leases', value: -(d.debt + d.leases) }, { label: 'Preferred and minority', value: -(d.preferred + d.minority) }, { label: 'Cash', value: d.cash + d.nonOp }, { label: 'Equity value', value: d.equity, total: true }], format: (v) => F.compact(v), unit: f.unitLabel, label: 'Bridge from enterprise value to equity', caption: 'Enterprise value to equity value' });
      tornadoChart(tor, C.val.tornado, per ? (v) => f.perShare(v) : (v) => f.money(v));
      const dW = [-0.02, -0.01, 0, 0.01, 0.02], dG = [-0.01, -0.005, 0, 0.005, 0.01];
      heatGrid(g1, { rowLabels: dW.map((x) => F.pct(d.r + x, 2)), colLabels: dG.map((x) => F.pct(state.A.terminal.growth + x)), values: dW.map((dw) => dG.map((dg) => { const r = V.dcf(P, V.applyDeltas(state.A, { wacc: dw, gT: dg })); return r.ok ? (per ? r.perShare : r.equity) : NaN; })), format: per ? (v) => f.perShare(v) : (v) => F.num(v, 0), rowTitle: 'WACC', colTitle: 'terminal growth', centre: [2, 2] });
      if (per) football(ff, { bars: C.val.football, price: state.market.sharePrice, format: (v) => f.perShare(v), caption: 'Valuation ranges by method, per share' }); else ff.append(h('p', { class: 'note' }, 'Per-share ranges need a share count.'));
      drawMc();
    });
  }
  function tornadoChart(box, T, fmt) {
    box.replaceChildren();
    if (!T?.ok) { box.append(h('p', { class: 'note' }, 'Not available.')); return; }
    const lo = Math.min(...T.rows.map((r) => Math.min(r.low, r.high))), hi = Math.max(...T.rows.map((r) => Math.max(r.low, r.high))), span = hi - lo || 1, x = (v) => ((v - lo) / span) * 100;
    const wrap = h('div', { class: 'ci-tornado', role: 'img', 'aria-label': `Tornado chart: ${T.rows.map((r) => `${r.label} ${r.step}: ${fmt(Math.min(r.low, r.high))} to ${fmt(Math.max(r.low, r.high))}`).join('; ')}` });
    T.rows.forEach((r) => { const a = Math.min(r.low, r.high), b = Math.max(r.low, r.high); wrap.append(h('div', { class: 'ci-tornado-row' }, h('span', { class: 'ci-tornado-label' }, r.label, h('small', {}, ` ${r.step}`)), h('div', { class: 'ci-tornado-track' }, h('span', { class: 'ci-tornado-bar is-down', style: { left: `${x(a)}%`, width: `${Math.max(0.5, x(T.base) - x(a))}%` } }), h('span', { class: 'ci-tornado-bar is-up', style: { left: `${x(T.base)}%`, width: `${Math.max(0.5, x(b) - x(T.base))}%` } }), h('span', { class: 'ci-tornado-base', style: { left: `${x(T.base)}%` } })), h('span', { class: 'ci-tornado-vals' }, `${fmt(a)} – ${fmt(b)}`))); });
    box.append(wrap, h('p', { class: 'field-hint' }, `Each driver is moved down and up by the step shown with the others held; the line is the base case (${fmt(T.base)}).`));
    tableTwin(box, { caption: 'Tornado', columns: [{ label: 'Driver' }, { label: 'Step' }, { label: 'Low', num: true }, { label: 'High', num: true }, { label: 'Range', num: true }], rows: T.rows.map((r) => [r.label, r.step, fmt(Math.min(r.low, r.high)), fmt(Math.max(r.low, r.high)), fmt(r.range)]) });
  }
  function distress() {
    const H = C.H, t = C.table;
    const zone = (i, v) => R.altman(H[i].p, v).zone || '—';
    body.append(h('h4', {}, 'Financial distress indicators ', tag('estimate')), dataTable([{ label: 'Indicator' }, ...H.map((x) => ({ label: `FY${x.year}`, num: true }))], [['Altman Z″ (score)', ...t.altmanZ2.map((v) => (fin(v) ? F.num(v, 2) : '—'))], ['Altman Z″ (zone)', ...H.map((_, i) => zone(i, 'zdouble'))], ['Altman Z′ (score)', ...t.altmanZ1.map((v) => (fin(v) ? F.num(v, 2) : '—'))], ['Altman Z′ (zone)', ...H.map((_, i) => zone(i, 'zprime'))], ['Interest coverage', ...t.interestCoverage.map((v) => (fin(v) ? `${F.num(v, 1)}×` : '—'))], ['Net debt ÷ EBITDA', ...t.netDebtToEbitda.map((v) => (fin(v) ? `${F.num(v, 2)}×` : '—'))], ['Current ratio', ...t.current.map((v) => (fin(v) ? `${F.num(v, 2)}×` : '—'))]], 'Distress indicators by year'),
      h('p', { class: 'field-hint' }, 'Z″ suits non-manufacturers and private firms (distress below 1.10, safe above 2.60); Z′ suits private manufacturers (1.23 and 2.90). The original Z needs the market value of equity, so it appears only once a share price is given, in Risk management. These are screens built on 1960s–1990s samples, not predictions.'));
  }

  // ================================================================ operations
  let opSheet = null, opMeasure = null, opDim = null;
  function operations() {
    const list = datasets();
    if (!list.length) { body.append(h('p', { class: 'note' }, 'No operational dataset in this workbook.')); return; }
    if (!list.some((s) => s.name === opSheet)) { opSheet = list[0].name; opMeasure = null; opDim = null; }
    const prof = list.find((s) => s.name === opSheet), sheet = state.wb.sheets.find((s) => s.name === opSheet);
    if (opMeasure === null || !prof.measures.includes(opMeasure)) opMeasure = prof.measures.find((c) => /revenue|sales|amount|value/i.test(prof.columns[c].name)) ?? prof.measures[0];
    if (opDim === null || !prof.dims.includes(opDim)) opDim = prof.dims[0] ?? null;
    const sum = W.summariseDataset(sheet, prof, { measure: opMeasure, dim: opDim });
    const q = prof.quality;
    const c1 = h('div', { class: 'chart' }), c2 = h('div', { class: 'chart' });
    const name = (c) => prof.columns[c].name;
    body.append(h('div', { class: 'cv-inline-fields' }, field('Dataset', selectEl(list.map((s) => ({ value: s.name, label: `${s.name} (${F.int(s.dataRows)} rows)` })), opSheet, (v) => { opSheet = v; opMeasure = null; opDim = null; draw(); })), field('Measure', selectEl(prof.measures.map((c) => ({ value: String(c), label: name(c) })), String(opMeasure), (v) => { opMeasure = +v; draw(); })), prof.dims.length ? field('Break down by', selectEl(prof.dims.map((c) => ({ value: String(c), label: name(c) })), String(opDim), (v) => { opDim = +v; draw(); })) : ''),
      verdict('good', `All ${F.int(q.rows)} rows were processed.`, `${name(opMeasure)} totals ${F.num(sum.total, 2)} over ${F.int(sum.n)} rows with a number${sum.skipped ? `; ${F.int(sum.skipped)} rows have no number in this column and are not in the total` : ''}.`),
      h('dl', { class: 'stats-row cv-stats' }, stat('Rows', F.int(q.rows)), stat('Blank cells', F.int(q.missing), q.missingByColumn.slice(0, 3).map((m) => `${m.column}: ${m.missing}`).join('; ')), stat('Repeated rows', F.int(q.duplicates), q.duplicateExamples.slice(0, 2).map((d) => `row ${d.row} repeats row ${d.sameAs}`).join('; ')), stat('Abnormal values', F.int(q.outliers.reduce((a, o) => a + o.count, 0)), q.outliers.slice(0, 2).map((o) => `${o.column}: ${o.examples.map((e) => `${e.cell} = ${F.num(e.value, 2)}`).join(', ')} (median ${F.num(o.median, 2)})`).join('; '))),
      h('div', { class: 'cv-results-grid' }, h('figure', { class: 'cv-figure' }, h('figcaption', { class: 'figure-title' }, `${name(opMeasure)} by month`), c1), h('figure', { class: 'cv-figure' }, h('figcaption', { class: 'figure-title' }, opDim !== null ? `${name(opMeasure)} by ${name(opDim)}` : 'By year'), c2)),
      h('p', { class: 'field-hint' }, 'Blank cells, repeated rows and abnormal values are reported, not corrected: clean them in the source, or in Learn › Labs › Data Cleaning Lab, and import again. Abnormal means more than twelve robust standard deviations from the column’s median (on a log scale for columns that are always positive).'));
    requestAnimationFrame(() => {
      if (sum.byMonth.length > 1) lineChart(c1, { xs: sum.byMonth.map((_, i) => i), xTicks: sum.byMonth.map((_, i) => i).filter((i) => i % Math.max(1, Math.ceil(sum.byMonth.length / 6)) === 0), height: 230, xFormat: (i) => sum.byMonth[Math.round(i)]?.[0] ?? '', yFormat: (v) => F.compact(v), label: `${name(opMeasure)} by month`, endLabels: false, series: [{ name: name(opMeasure), values: sum.byMonth.map((x) => x[1]), cls: 'm-s2' }] });
      else c1.append(h('p', { class: 'note' }, 'No date column to chart over time.'));
      const cats = opDim !== null ? sum.byDim.slice(0, 12) : sum.byYear;
      if (cats.length) barChart(c2, { categories: cats.map((x) => String(x[0])), horizontal: true, height: 230, legend: false, valueLabels: true, label: `${name(opMeasure)} by category`, series: [{ name: name(opMeasure), values: cats.map((x) => x[1]), cls: 'm-s1' }], format: (v) => F.compact(v) });
    });
  }

  // ================================================================ lineage and quality
  function lineage() {
    const H = C.H, f = C.f;
    const lv = { error: 'Left out or blocked', warn: 'Check', info: 'For the record' };
    const groups = ['error', 'warn', 'info'].map((k) => [k, state.issues.filter((i) => i.level === k)]).filter(([, l]) => l.length);
    body.append(h('h4', {}, 'Findings'), groups.length ? h('div', {}, groups.map(([k, l]) => h('div', {}, h('p', { class: 'field-label' }, `${lv[k]} (${l.length})`), h('ul', { class: 'cv-validation' }, l.map((x) => h('li', { class: `is-${k}` }, x.text)))))) : verdict('good', 'No findings.', 'The import raised nothing.'));
    if (!H.length) return;
    let year = H[H.length - 1].year;
    const tb = h('div');
    const drawT = () => {
      const x = H.find((y) => y.year === year), L = state.lineage[year] || {};
      const rows = V.FIELDS.filter((fd) => fin(x.p[fd.id])).map((fd) => { const s = L[fd.id]; return [fd.label, F.num(x.p[fd.id], 2), x.how[fd.id] ? 'derived' : 'data', s ? `${s.sheet} › ${s.label}` : (x.how[fd.id] ? '' : 'entered'), s ? (s.cells || []).slice(0, 6).join(', ') + ((s.cells || []).length > 6 ? ', …' : '') : '', x.how[fd.id] ? x.how[fd.id] : s ? [s.how, s.scaled ? `scaled ×${s.scaled}` : null, s.signFlipped ? 'sign flipped' : null, s.confirmedBy ? `agrees with ${[...new Set(s.confirmedBy)].join(', ')}` : null].filter(Boolean).join('; ') || 'as reported' : '']; });
      tb.replaceChildren(dataTable([{ label: 'Field' }, { label: `Value (${f.unitLabel})`, num: true }, { label: 'Basis' }, { label: 'Source' }, { label: 'Cells' }, { label: 'How' }], rows, `Data lineage for fiscal ${year}`));
    };
    const missing = V.FIELDS.filter((fd) => !fd.derive && !H.some((x) => fin(x.p[fd.id]))).map((fd) => fd.label);
    body.append(h('h4', {}, 'Where each figure comes from'), h('div', { class: 'cv-inline-fields' }, field('Fiscal year', selectEl(H.map((x) => ({ value: String(x.year), label: `FY${x.year}` })), String(year), (v) => { year = +v; drawT(); }))), tb,
      h('h4', {}, 'Not in the data'), h('p', { class: 'note' }, missing.length ? `${missing.join('; ')}. Nothing was estimated for these; metrics that need them show a dash.` : 'Every line the engine knows was found or derived.'));
    drawT();
  }

  // ================================================================ report and exports
  function report() {
    const f = C.f, H = C.H, t = C.table, d = C.val?.results?.dcf, L = H[H.length - 1];
    const M = P.meta;
    const analyst = textInput({ value: M.analyst || '', placeholder: 'Your name (optional)', onInput: (v) => { M.analyst = v; } });
    const saveMsg = h('span', { class: 'field-hint' });
    const bar = h('div', { class: 'cv-export-bar' },
      btn('Print or save as PDF', () => window.print(), { kind: 'primary' }),
      btn('Excel workbook (formulas)', () => download(`${slug(M.name)}-analysis.xlsx`, X.buildAnalysisWorkbook(P, H, { lineage: state.lineage, issues: state.issues, valuation: d?.ok ? d : null }), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')),
      btn('Statements (CSV)', () => download(`${slug(M.name)}-statements.csv`, X.statementsCSV(H))),
      btn('Ratios (CSV)', () => download(`${slug(M.name)}-ratios.csv`, X.ratiosCSV(H))),
      btn('Project (JSON)', () => download(`${slug(M.name)}-project.json`, IO.serializeProject({ ...P, market: { ...state.market } }, state.A, { lineage: state.lineage, issues: state.issues }), 'application/json')),
      btn('Save in this browser', async () => { try { await hooks.onSave(); saveMsg.textContent = 'Saved. It appears under “Saved in this browser” at the top of the page.'; } catch (e) { saveMsg.textContent = `Could not save: ${e.message}`; } }), saveMsg);
    const sec = (title, ...kids) => h('section', {}, h('h2', {}, title), ...kids.filter(Boolean));
    const yearsHead = [{ label: '' }, ...H.map((x) => ({ label: `FY${x.year}`, num: true }))];
    const stTable = (st) => { const fields = V.FIELDS.filter((x) => x.st === st.id && H.some((y) => fin(y.p[x.id]))); return fields.length ? h('figure', { class: 'cv-figure' }, h('figcaption', { class: 'figure-title' }, `${st.name}, ${f.cur} ${f.unitLabel}`, tag('verified')), dataTable(yearsHead, fields.map((fd) => [`${fd.label}${H.some((x) => x.how[fd.id]) ? ' (derived)' : ''}`, ...H.map((x) => (fin(x.p[fd.id]) ? F.num(x.p[fd.id], Math.abs(x.p[fd.id]) >= 1000 ? 0 : 1) : '—'))]))) : null; };
    const art = h('article', { class: 'cv-report ci-report', 'aria-label': 'Company analysis report' },
      h('div', { class: 'cv-report-cover' }, h('p', { class: 'cv-cover-kicker' }, 'Company analysis report'), h('h2', {}, `${M.name || 'Company'}: financial analysis`), h('div', { class: 'cv-report-meta' }, h('span', {}, `FY${H[0].year}–FY${L.year}`), h('span', {}, `${f.cur} ${f.unitLabel}`), h('span', {}, `Prepared ${new Date().toISOString().slice(0, 10)}${M.analyst ? ` by ${M.analyst}` : ''}`)), h('p', { class: 'muted small' }, P.source?.note || ''), h('div', { class: 'cv-tag-key' }, h('span', {}, 'Labels: '), h('span', {}, tag('verified'), ' from the imported data'), h('span', {}, tag('estimate'), ' derived from it'), h('span', {}, tag('assumption'), ' set by the analyst'), h('span', {}, tag('interpretation'), ' a reading of the numbers')), verdict('warn', 'Not investment advice.', 'This report describes the imported figures and, where assumptions were supplied, values the company on them. It makes no recommendation.')),
      sec('Executive summary', ...summaryParas().map(([kind, text]) => h('p', {}, text, ' ', tag(kind)))),
      sec('Financial health', ...C.health.map((x) => verdict(x.kind, x.title, x.text))),
      sec('Financial statements', ...V.STATEMENTS.map(stTable)),
      sec('Ratios', ...GROUPS.map((g) => h('figure', { class: 'cv-figure' }, h('figcaption', { class: 'figure-title' }, g.name, tag('estimate')), dataTable(yearsHead, METRICS.filter((m) => m.group === g.id).map((m) => [m.name, ...t[m.id].map((v) => fmtMetric(m, v))]))))),
      d?.ok ? sec('Valuation', h('p', {}, `Discounted cash flow, ${d.N}-year projection, free cash flow to the firm at a ${F.pct(d.r, 2)} WACC (${d.cc.how}); terminal value by ${d.assumptions.terminal.method === 'exit' ? 'exit multiple' : `perpetual growth of ${F.pct(d.assumptions.terminal.growth)}`}.`, ' ', tag('assumption')),
        dataTable([{ label: 'Assumption' }, { label: 'Value', num: true }], [['Risk-free rate', F.pct(state.A.discount.rf, 2)], ['Beta', F.num(state.A.discount.beta, 2)], ['Equity risk premium', F.pct(state.A.discount.erp, 2)], ['Pre-tax cost of debt', F.pct(state.A.discount.kd, 2)], ['Tax rate', F.pct(state.A.taxRate[0], 1)], ['Revenue growth, year 1', F.pct(state.A.growth[0])], ['EBITDA margin', F.pct(state.A.margin[0])], ['Capex % of revenue', F.pct(state.A.capexPct[0])], ['Working capital % of revenue', F.pct(state.A.nwcPct[0])], ['Share price', fin(state.market.sharePrice) ? f.perShare(state.market.sharePrice) : 'not given']]),
        dataTable([{ label: 'Result' }, { label: 'Value', num: true }], [['Enterprise value', f.money(d.ev)], ['Equity value', f.money(d.equity)], ['Value per share', fin(d.perShare) ? f.perShare(d.perShare) : 'no share count'], ['Terminal value share of EV', F.pct(d.tvShare, 0)], ...(C.val.scenarios ? ['bear', 'base', 'bull'].map((k) => [`${C.val.scenarios.scenarios[k].name} case`, C.val.scenarios.scenarios[k].result.ok ? (fin(d.perShare) ? f.perShare(C.val.scenarios.scenarios[k].result.perShare) : f.money(C.val.scenarios.scenarios[k].result.equity)) : '—']) : []), ...(C.val.results.fcfe?.ok ? [['FCFE model', fin(d.perShare) ? f.perShare(C.val.results.fcfe.perShare) : f.money(C.val.results.fcfe.equity)]] : [])]),
        C.val.tornado?.ok ? dataTable([{ label: 'Driver (one at a time)' }, { label: 'Low', num: true }, { label: 'High', num: true }], C.val.tornado.rows.map((r) => [`${r.label} ${r.step}`, C.val.tornado.perShare ? f.perShare(Math.min(r.low, r.high)) : f.money(Math.min(r.low, r.high)), C.val.tornado.perShare ? f.perShare(Math.max(r.low, r.high)) : f.money(Math.max(r.low, r.high))])) : null,
        ...d.warnings.map((w) => verdict(w.kind, w.title, w.text))) : sec('Valuation', h('p', {}, 'Not run. The workbook supplies no share price, beta or cost of capital; enter them on the Valuation tab to add this section.', ' ', tag('interpretation'))),
      sec('Data quality and limitations', state.issues.filter((i) => i.level !== 'info').length ? h('ul', { class: 'caveats' }, state.issues.filter((i) => i.level !== 'info').map((i) => h('li', {}, i.text))) : h('p', {}, 'The import raised no warnings.'), h('p', {}, unavailable().length ? `Unavailable from this data: ${unavailable().join('; ')}.` : 'All inputs the analysis uses were available.', ' ', tag('interpretation')), h('p', { class: 'muted small' }, 'Ratios follow the definitions in the Ratios tab (averages of opening and closing balances where a prior year exists). Sources: CFA Institute, Financial Statement Analysis; Koller, Goedhart and Wessels, Valuation (7th ed.); Altman (2000).')));
    body.append(h('div', { class: 'cv-report-editable ci-report-controls' }, field('Analyst', analyst)), bar, art);
  }
}
