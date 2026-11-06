// panel-model.js — the central workspace: the model selection guide, the assumptions (sliders and a per-year table),
// the DCF with its forecast, bridge and sensitivities, the other models, scenarios and Monte Carlo.
import { h, $, $$, download, onResize } from '../core/dom.js?v=26';
import * as F from '../core/format.js?v=26';
import * as V from '../core/valuation.js?v=26';
import * as IO from '../core/valuation-io.js?v=26';
import { barChart, lineChart, tableTwin, histogramChart } from '../core/charts.js?v=26';
import { verdict } from '../core/ui.js?v=26';
import { formatter } from '../core/valuation-report.js?v=26';
import { waterfall, heatGrid, historyForecastBars } from './charts.js?v=26';
import { state, on, recompute, scheduleRecompute, resetAssumptions, toggleModel, openTutorial, emit } from './state.js?v=26';
import { numInput, selectEl, field, pctSlider, numSlider, segmented, block, btn, stat, dataTable, helpLink, id } from './ui.js?v=26';
import { renderTutorial } from './tutorial.js?v=26';

const fin = Number.isFinite;
const series = (arr, n) => Array.from({ length: n }, (_, i) => (fin(arr?.[i]) ? arr[i] : (arr?.length ? arr[arr.length - 1] : 0)));
const fade = (n, a, b) => Array.from({ length: n }, (_, i) => a + (b - a) * (n > 1 ? i / (n - 1) : 1));

export function renderModelPanel(root) {
  const panel = h('section', { class: 'cv-panel cv-panel--model', 'aria-labelledby': 'cv-model-title' }, h('div', { class: 'cv-panel-head' }, h('h2', { id: 'cv-model-title' }, 'Valuation model'), h('span', { class: 'muted' }, 'centre workspace')));
  root.append(panel);
  const tutorialBox = h('div');
  const guideBox = h('div'), assumeBox = h('div'), dcfBox = h('div'), othersBox = h('div'), scenBox = h('div'), sensBox = h('div'), mcBox = h('div');
  panel.append(tutorialBox,
    block({ title: 'Choose the models', step: 2, sub: 'The guide reads the industry, stage, profitability, dividends and peers you entered and says how well each model fits. Tick the ones to run; each has a tutorial.', children: [guideBox] }),
    block({ title: 'Assumptions', step: 3, sub: 'Historical facts stay on the left; everything here is a forecast assumption you control. Every change recalculates every model.', children: [assumeBox], actions: btn('Reset from history', () => resetAssumptions(), { cls: 'btn-sm' }) }),
    block({ title: 'Discounted cash flow', step: 3, children: [dcfBox] }),
    h('div', {}, othersBox),
    block({ title: 'Scenarios', step: 5, sub: 'Bear, base and bull cases shift the assumptions in parallel; the register’s risk effects are added to the scenario each risk is assigned to.', children: [scenBox] }),
    block({ title: 'Sensitivity', step: 5, children: [sensBox] }),
    block({ title: 'Monte Carlo (optional)', step: 5, adv: true, sub: 'Random draws of growth, margin, WACC and terminal growth around the base case, with the distributions stated. A spread of model outputs under assumed uncertainty, not a probability of what will happen.', children: [mcBox] }),
  );
  const renderInputs = () => { renderGuide(guideBox); renderAssumptions(assumeBox); renderScenarioEditor(scenBox); renderMC(mcBox); };
  const renderOutputs = () => { renderDCF(dcfBox); renderOthers(othersBox); renderScenarioResults(scenBox); renderSensitivity(sensBox); renderMCResults(mcBox); };
  renderInputs(); renderOutputs();
  // charts measure their container, so they are drawn again when a collapsed block opens (a step or mode change)
  on((kind) => { if (kind === 'structure') { renderInputs(); renderOutputs(); } else if (kind === 'results') renderOutputs(); else if (kind === 'tutorial') renderTutorialBox(tutorialBox); else if (kind === 'mode') { requestAnimationFrame(renderOutputs); if (state.tutorial) renderTutorialBox(tutorialBox); } });
  onResize(panel, () => renderOutputs());
  return panel;
}
function renderTutorialBox(box) {
  box.replaceChildren();
  if (!state.tutorial) return;
  renderTutorial(box, state.tutorial);
  box.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

// ---------------------------------------------------------------- guide
function renderGuide(box) {
  box.replaceChildren();
  const models = state.project.models;
  const order = ['recommended', 'usable', 'caution', 'unsuitable'];
  const list = h('ul', { class: 'cv-models' });
  state.guide.forEach((g) => {
    const cb = h('input', { type: 'checkbox', id: `cv-m-${g.id}` });
    cb.checked = !!models[g.id];
    cb.addEventListener('change', () => toggleModel(g.id, cb.checked));
    list.append(h('li', { class: `cv-model${models[g.id] ? ' is-on' : ''}` }, cb, h('div', {}, h('label', { class: 'cv-model-name', for: `cv-m-${g.id}` }, g.name, h('span', { class: `cv-fit is-${g.fit}` }, g.fit)), h('p', {}, g.why), h('div', { class: 'cv-model-actions' }, btn('Learn this model', () => openTutorial(g.id), { cls: 'btn-sm' })))));
  });
  box.append(list, h('p', { class: 'field-hint' }, `Ranked ${order.join(' › ')}. "Unsuitable" models can still be ticked, but the report will say why they do not fit.`));
}

// ---------------------------------------------------------------- assumptions
function renderAssumptions(box) {
  box.replaceChildren();
  const A = state.A, P = state.project, L = state.historical[state.historical.length - 1];
  const N = A.horizon;
  const hist = (fn) => (L ? fn(L) : NaN);
  const histNote = (v, fmt = (x) => F.pct(x)) => (fin(v) ? `latest year ${fmt(v)}` : '');
  // top sliders
  const g1 = pctSlider({ label: 'Revenue growth, year 1', value: A.growth[0], min: -20, max: 40, step: 0.5, onInput: (v) => { A.growth = fade(N, v, A.terminal.growth); scheduleRecompute(); syncYearTable(); }, help: 'tvm' });
  const gT = pctSlider({ label: 'Terminal growth', value: A.terminal.growth, min: -2, max: 6, step: 0.1, onInput: (v) => { const g0 = A.growth[0]; A.terminal.growth = v; A.growth = fade(N, g0, v); scheduleRecompute(); syncYearTable(); } });
  const mg = pctSlider({ label: `${A.marginBasis === 'ebit' ? 'EBIT' : 'EBITDA'} margin`, value: A.margin[0], min: -20, max: 70, step: 0.5, onInput: (v) => { A.margin = series([v], N); scheduleRecompute(); syncYearTable(); } });
  const da = pctSlider({ label: 'D&A as % of revenue', value: A.daPct[0], min: 0, max: 25, step: 0.1, onInput: (v) => { A.daPct = series([v], N); scheduleRecompute(); syncYearTable(); } });
  const cx = pctSlider({ label: 'Capex as % of revenue', value: A.capexPct[0], min: 0, max: 30, step: 0.1, onInput: (v) => { A.capexPct = series([v], N); scheduleRecompute(); syncYearTable(); } });
  const nw = pctSlider({ label: 'Working capital as % of revenue', value: A.nwcPct[0], min: -20, max: 50, step: 0.5, onInput: (v) => { A.nwcPct = series([v], N); scheduleRecompute(); syncYearTable(); } });
  const tx = pctSlider({ label: 'Tax rate', value: A.taxRate[0], min: 0, max: 45, step: 0.5, onInput: (v) => { A.taxRate = series([v], N); A.discount.taxRate = v; scheduleRecompute(); syncYearTable(); } });
  const notes = h('p', { class: 'field-hint' }, [
    fin(hist((x) => x.growth.revenue)) ? `History: revenue growth ${F.pct(L.growth.revenue)} last year` : null,
    fin(hist((x) => x.margins.ebitda)) ? `EBITDA margin ${F.pct(L.margins.ebitda)}` : null,
    fin(hist((x) => x.drivers.capexPct)) ? `capex ${F.pct(L.drivers.capexPct)} of revenue` : null,
    fin(hist((x) => x.drivers.nwcPct)) ? `working capital ${F.pct(L.drivers.nwcPct)}` : null,
    fin(hist((x) => x.drivers.taxRate)) ? `effective tax ${F.pct(L.drivers.taxRate)}` : null,
  ].filter(Boolean).join('; ') + (L ? '.' : 'No history yet.'));
  const horizon = selectEl([3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({ value: String(n), label: `${n} years` })), String(N), (v) => { const n = +v; A.horizon = n; A.growth = fade(n, A.growth[0], A.terminal.growth); ['margin', 'daPct', 'capexPct', 'nwcPct', 'taxRate'].forEach((k) => { A[k] = series(A[k], n); }); recompute(); emit('structure'); });
  const basis = segmented(id('mb'), [{ id: 'ebitda', name: 'EBITDA margin' }, { id: 'ebit', name: 'EBIT margin' }], A.marginBasis, (v) => { const Lm = L ? (v === 'ebit' ? L.margins.ebit : L.margins.ebitda) : A.margin[0]; A.marginBasis = v; if (fin(Lm)) A.margin = series([Lm], N); recompute(); emit('structure'); });
  // terminal
  const tMethod = segmented(id('tm'), [{ id: 'perpetuity', name: 'Perpetual growth' }, { id: 'exit', name: 'Exit multiple' }], A.terminal.method, (v) => { A.terminal.method = v; recompute(); emit('structure'); });
  const mult = numSlider({ label: 'Exit multiple', value: A.terminal.multiple, min: 2, max: 30, step: 0.5, suffix: '×', onInput: (v) => { A.terminal.multiple = v; scheduleRecompute(); } });
  const multBasis = selectEl([{ value: 'ebitda', label: 'of EBITDA' }, { value: 'ebit', label: 'of EBIT' }, { value: 'revenue', label: 'of revenue' }, { value: 'fcf', label: 'of free cash flow' }], A.terminal.multipleBasis, (v) => { A.terminal.multipleBasis = v; recompute(); });
  const exitBox = h('div', { class: 'cv-inline-fields', style: { display: A.terminal.method === 'exit' ? '' : 'none' } }, h('div', { style: { flex: '1', minWidth: '200px' } }, mult), field('Multiple', multBasis));
  const mid = h('label', { class: 'check' }, h('input', { type: 'checkbox', onchange: (e) => { A.midYear = e.target.checked; recompute(); } }), ' Mid-year discounting');
  $('input', mid).checked = !!A.midYear;
  // discount rate
  const dMode = segmented(id('dm'), [{ id: 'build', name: 'Build from CAPM and the capital structure' }, { id: 'direct', name: 'Enter a rate' }], A.discount.mode, (v) => { A.discount.mode = v; recompute(); emit('structure'); });
  const D = A.discount;
  const buildBox = h('div', { class: 'cv-sliders', style: { display: D.mode === 'build' ? '' : 'none' } },
    pctSlider({ label: 'Risk-free rate', value: D.rf, min: 0, max: 10, step: 0.1, onInput: (v) => { D.rf = v; scheduleRecompute(); }, help: 'wacc' }),
    numSlider({ label: 'Beta', value: D.beta, min: 0.2, max: 2.5, step: 0.05, digits: 2, onInput: (v) => { D.beta = v; scheduleRecompute(); }, help: 'stocks' }),
    pctSlider({ label: 'Equity risk premium', value: D.erp, min: 2, max: 9, step: 0.1, onInput: (v) => { D.erp = v; scheduleRecompute(); } }),
    pctSlider({ label: 'Pre-tax cost of debt', value: D.kd, min: 0, max: 15, step: 0.1, onInput: (v) => { D.kd = v; scheduleRecompute(); } }),
    pctSlider({ label: 'Tax rate for the debt shield', value: D.taxRate, min: 0, max: 45, step: 0.5, onInput: (v) => { D.taxRate = v; scheduleRecompute(); } }),
  );
  const weights = segmented(id('w'), [{ id: 'market', name: 'Market values' }, { id: 'target', name: 'Target structure' }], D.weights, (v) => { D.weights = v; recompute(); emit('structure'); });
  const targetW = pctSlider({ label: 'Debt share of capital (target)', value: D.targetDebtWeight, min: 0, max: 90, step: 1, digits: 0, onInput: (v) => { D.targetDebtWeight = v; scheduleRecompute(); } });
  const weightsBox = h('div', { class: 'cv-inline-fields is-adv-only', style: { display: D.mode === 'build' ? '' : 'none' } }, h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Weights'), weights), h('div', { style: { flex: '1', minWidth: '200px', display: D.weights === 'target' ? '' : 'none' } }, targetW));
  const directBox = h('div', { class: 'cv-sliders', style: { display: D.mode === 'direct' ? '' : 'none' } }, pctSlider({ label: 'Discount rate (WACC)', value: D.direct, min: 3, max: 25, step: 0.1, onInput: (v) => { D.direct = v; scheduleRecompute(); } }), pctSlider({ label: 'Cost of equity (for FCFE and dividends)', value: fin(D.ke) ? D.ke : D.direct + 0.02, min: 3, max: 30, step: 0.1, onInput: (v) => { D.ke = v; scheduleRecompute(); } }));
  // bridge (advanced)
  const B = A.bridge;
  const leases = h('label', { class: 'check' }, h('input', { type: 'checkbox', onchange: (e) => { B.includeLeases = e.target.checked; recompute(); } }), ' Count lease liabilities as debt (and in the WACC weights)');
  $('input', leases).checked = !!B.includeLeases;
  const bridgeBox = h('div', { class: 'cv-field-grid is-adv-only' }, field('Non-operating assets to add', numInput({ value: B.nonOperatingAssets, onInput: (v) => { B.nonOperatingAssets = fin(v) ? v : 0; scheduleRecompute(); } }), { hint: 'Investments, surplus property, in the unit.' }), field('Other claims to subtract', numInput({ value: B.otherClaims, onInput: (v) => { B.otherClaims = fin(v) ? v : 0; scheduleRecompute(); } }), { hint: 'Pension deficits, litigation, earn-outs.' }), field('Tax on losses', selectEl([{ value: 'none', label: 'No tax credit on losses' }, { value: 'credit', label: 'Losses create a tax credit' }], A.taxLosses, (v) => { A.taxLosses = v; recompute(); })));
  // per-year table (advanced)
  const yearTable = h('div', { class: 'table-scroll is-adv-only' });
  const buildYearTable = () => {
    yearTable.replaceChildren();
    const years = L ? Array.from({ length: N }, (_, i) => L.year + i + 1) : Array.from({ length: N }, (_, i) => `Y${i + 1}`);
    const rows = [['growth', 'Revenue growth'], ['margin', `${A.marginBasis === 'ebit' ? 'EBIT' : 'EBITDA'} margin`], ['daPct', 'D&A % revenue'], ['capexPct', 'Capex % revenue'], ['nwcPct', 'NWC % revenue'], ['taxRate', 'Tax rate']];
    yearTable.append(h('table', { class: 'data-table cv-year-table' }, h('caption', { class: 'visually-hidden' }, 'Assumptions by year, editable'), h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Driver (%)'), years.map((y) => h('th', { scope: 'col', class: 'is-num' }, String(y))))), h('tbody', {}, rows.map(([k, lab]) => h('tr', {}, h('th', { scope: 'row' }, lab), A[k].map((v, i) => h('td', { class: 'is-num' }, numInput({ value: v, scale: 100, digits: 1, ariaLabel: `${lab}, ${years[i]}`, onInput: (nv) => { if (fin(nv)) { A[k][i] = nv; scheduleRecompute(); } } }))))))));
  };
  const syncYearTable = () => buildYearTable();
  buildYearTable();
  box.append(
    h('div', { class: 'cv-inline-fields' }, field('Forecast horizon', horizon), h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Margin basis'), basis)),
    h('div', { class: 'cv-sliders' }, g1, gT, mg, da, cx, nw, tx), notes,
    h('p', { class: 'field-hint is-adv-only' }, 'Year by year (sliders set the whole path; edit single years here):'), yearTable,
    h('div', { class: 'cv-terminal' }, h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Terminal value', helpLink('tvm')), tMethod), exitBox, mid),
    h('div', { class: 'cv-terminal' }, h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Discount rate', helpLink('wacc')), dMode), buildBox, weightsBox, directBox),
    h('div', { class: 'cv-terminal is-adv-only' }, h('span', { class: 'field-label' }, 'From enterprise value to equity'), leases, bridgeBox),
  );
}

// ---------------------------------------------------------------- DCF results
function renderDCF(box) {
  box.replaceChildren();
  const d = state.results.dcf, f = formatter(state.project);
  if (!state.project.models.dcf) { box.append(h('p', { class: 'note' }, 'The DCF is switched off. Tick it under "Choose the models" to run it.')); return; }
  if (!d || d.error) { box.append(verdict('bad', 'No DCF yet.', d?.error || (state.errors[0]?.text) || 'Enter the latest year’s statements.')); return; }
  const cc = d.cc;
  const hero = h('div', { class: 'cv-hero' }, h('div', { class: 'figure-hero' }, h('span', { class: 'hero-value' }, fin(d.perShare) ? f.perShare(d.perShare) : f.money(d.equity)), h('span', { class: 'hero-label' }, fin(d.perShare) ? 'value per share (base case)' : 'equity value (no share count)')), h('p', { class: 'hero-label' }, `Enterprise value ${f.money(d.ev)} → equity ${f.money(d.equity)}${fin(d.upside) ? '; ' : '.'}`, fin(d.upside) ? h('span', { class: `cv-upside ${d.upside >= 0 ? 'is-pos' : 'is-neg'}` }, `${F.signed(d.upside * 100, 1)}% against the ${f.perShare(d.price)} share price`) : null));
  const stats = h('dl', { class: 'stats-row cv-stats' }, stat('WACC', F.pct(d.r, 2), cc.how), stat('Cost of equity', F.pct(cc.ke, 2)), stat('PV of forecast cash flows', f.money(d.sumPv)), stat('PV of terminal value', f.money(d.pvTV)), stat('Terminal value share', F.pct(d.tvShare, 0)), stat(d.assumptions.terminal.method === 'exit' ? 'Implied perpetual growth' : 'Implied exit multiple', d.assumptions.terminal.method === 'exit' ? F.pct(d.impliedGrowth) : (fin(d.impliedMultiple) ? `${F.num(d.impliedMultiple, 1)}× EBITDA` : '—')));
  const warns = h('div', {}, d.warnings.map((w) => verdict(w.kind, w.title, w.text)));
  const H = state.historical;
  const revChart = h('div', { class: 'chart' }), fcfChart = h('div', { class: 'chart' }), bridgeChart = h('div', { class: 'chart' });
  const figs = h('div', { class: 'cv-results-grid' },
    h('figure', { class: 'cv-figure' }, h('figcaption', { class: 'figure-title' }, 'Revenue: history and forecast'), revChart),
    h('figure', { class: 'cv-figure' }, h('figcaption', { class: 'figure-title' }, 'Free cash flow to the firm and its present value'), fcfChart));
  const bridgeFig = h('figure', { class: 'cv-figure' }, h('figcaption', { class: 'figure-title' }, 'From enterprise value to equity value'), bridgeChart);
  const tableBox = h('div');
  const actions = h('div', { class: 'input-actions' }, btn('DCF schedule (CSV)', () => download('dcf-schedule.csv', IO.dcfCSV(d)), { cls: 'btn-sm' }), btn('Assumptions (CSV)', () => download('valuation-assumptions.csv', IO.assumptionsCSV(state.A, state.project)), { cls: 'btn-sm' }), btn('Learn this model', () => openTutorial('dcf'), { cls: 'btn-sm' }));
  box.append(hero, warns, stats, figs, bridgeFig, tableBox, actions);
  requestAnimationFrame(() => {
    historyForecastBars(barChart, revChart, { histYears: H.map((x) => x.year), histValues: H.map((x) => x.p.revenue), fcYears: d.rows.map((x) => x.year), fcValues: d.rows.map((x) => x.revenue), name: 'Revenue', format: (v) => F.compact(v), yLabel: f.unitLabel, height: 230, label: 'Revenue by year, history and forecast' });
    barChart(fcfChart, { categories: d.rows.map((x) => String(x.year)), height: 230, label: 'Forecast free cash flow and its present value by year', series: [{ name: 'FCFF', values: d.rows.map((x) => x.fcff), cls: 'm-light' }, { name: 'Present value', values: d.rows.map((x) => x.pv), cls: 'm-s2' }], format: (v) => F.compact(v), yLabel: f.unitLabel });
    waterfall(bridgeChart, { steps: [{ label: 'PV of forecast', value: d.sumPv }, { label: 'PV of terminal value', value: d.pvTV }, { label: 'Enterprise value', value: d.ev, total: true }, { label: 'Debt and leases', value: -(d.debt + d.leases) }, { label: 'Preferred and minority', value: -(d.preferred + d.minority) }, ...(d.other ? [{ label: 'Other claims', value: -d.other }] : []), { label: 'Cash', value: d.cash + d.nonOp }, { label: 'Equity value', value: d.equity, total: true }], format: (v) => F.compact(v), unit: f.unitLabel, label: 'Bridge from enterprise value to equity value', caption: 'Enterprise value to equity value' });
    tableTwin(tableBox, { caption: 'Forecast and discounted cash flow', open: true, columns: [{ label: 'Line' }, ...d.rows.map((x) => ({ label: String(x.year), num: true }))], rows: [['Revenue', ...d.rows.map((x) => F.num(x.revenue, 1))], ['Growth', ...d.rows.map((x) => F.pct(x.growth))], ['EBITDA', ...d.rows.map((x) => F.num(x.ebitda, 1))], ['EBITDA margin', ...d.rows.map((x) => F.pct(x.margin))], ['D&A', ...d.rows.map((x) => F.num(x.da, 1))], ['EBIT', ...d.rows.map((x) => F.num(x.ebit, 1))], ['Tax on EBIT', ...d.rows.map((x) => F.num(x.tax, 1))], ['NOPAT', ...d.rows.map((x) => F.num(x.nopat, 1))], ['Capex', ...d.rows.map((x) => F.num(x.capex, 1))], ['Net working capital', ...d.rows.map((x) => F.num(x.nwc, 1))], ['Change in NWC', ...d.rows.map((x) => F.num(x.dNwc, 1))], ['FCFF', ...d.rows.map((x) => F.num(x.fcff, 1))], ['Discount factor', ...d.rows.map((x) => F.num(x.df, 4))], ['Present value', ...d.rows.map((x) => F.num(x.pv, 1))], ['Terminal value', ...d.rows.map((x, i) => (i === d.N - 1 ? F.num(d.tv, 1) : ''))]] });
  });
}

// ---------------------------------------------------------------- the other models
function renderOthers(box) {
  box.replaceChildren();
  const P = state.project, R = state.results, f = formatter(P), A = state.A;
  const unit = `${P.meta.currency} ${P.meta.unitLabel}`;
  if (P.models.comps) box.append(block({ title: 'Comparable companies', step: 3, children: [compsView(R.comps, f)], actions: btn('Learn', () => openTutorial('comps'), { cls: 'btn-sm' }) }));
  if (P.models.fcfe) box.append(block({ title: 'Free cash flow to equity', step: 3, children: [fcfeView(R.fcfe, f, A)], actions: btn('Learn', () => openTutorial('fcfe'), { cls: 'btn-sm' }) }));
  if (P.models.ddm) box.append(block({ title: 'Dividend discount models', step: 3, children: [ddmView(R.ddm, f)], actions: btn('Learn', () => openTutorial('ddm'), { cls: 'btn-sm' }) }));
  if (P.models.asset) box.append(block({ title: 'Asset-based values', step: 3, children: [assetView(R.asset, f)], actions: btn('Learn', () => openTutorial('asset'), { cls: 'btn-sm' }) }));
  if (P.models.sotp) box.append(block({ title: 'Sum of the parts', step: 3, children: [sotpView(R.sotp, f)], actions: btn('Learn', () => openTutorial('sotp'), { cls: 'btn-sm' }) }));
  if (P.models.earnings) box.append(block({ title: 'Earnings-based values', step: 3, children: [earningsView(R.earnings, f)], actions: btn('Learn', () => openTutorial('earnings'), { cls: 'btn-sm' }) }));
  if (P.models.vc) box.append(block({ title: 'Venture-capital method', step: 3, children: [vcView(R.vc, f, unit)], actions: btn('Learn', () => openTutorial('vc'), { cls: 'btn-sm' }) }));
}
const warnList = (r) => h('div', {}, (r?.warnings || []).map((w) => verdict(w.kind, w.title, w.text)));
function compsView(c, f) {
  if (!c || c.error) return verdict('warn', 'Comparables not run.', c?.error || 'Add peers in the left panel.');
  const statSel = selectEl([{ value: 'median', label: 'Median' }, { value: 'mean', label: 'Mean' }, { value: 'q1', label: '25th percentile' }, { value: 'q3', label: '75th percentile' }], state.compsStat, (v) => { state.compsStat = v; recompute(); });
  const useSel = h('div', { class: 'chips' }, V.MULTIPLES.map((m) => { const cb = h('input', { type: 'checkbox', id: `cv-mu-${m.id}` }); cb.checked = !(state.project.compsUse && !state.project.compsUse.includes(m.id)); cb.addEventListener('change', () => { state.project.compsUse = V.MULTIPLES.map((x) => x.id).filter((idd) => $(`#cv-mu-${idd}`)?.checked); recompute(); }); return h('label', { class: 'chip', for: `cv-mu-${m.id}` }, cb, h('span', {}, m.name)); }));
  const use = state.project.compsUse || V.MULTIPLES.map((x) => x.id);
  const rows = c.table.filter((t) => use.includes(t.id)).map((t) => [t.name, String(t.stats.n), f.x(t.stats.q1), f.x(t.stats.median), f.x(t.stats.mean), f.x(t.stats.q3), t.nm ? 'n/m' : f.x(t.own), t.nm ? 'n/m' : f.perShare(t.implied.q1.perShare), t.nm ? 'n/m' : f.perShare(t.implied[c.stat].perShare), t.nm ? 'n/m' : f.perShare(t.implied.q3.perShare)]);
  const peerRows = c.peers.map((p, i) => [p.name, F.num(p.marketCap, 0), F.num(p.ev, 0), ...c.table.map((t) => (t.values[i] === null ? 'n/m' : f.x(t.values[i])))]);
  return h('div', { class: 'cv-list-editor' }, warnList(c), h('div', { class: 'cv-inline-fields' }, field('Central statistic', statSel), h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Multiples'), useSel)),
    dataTable([{ label: 'Multiple' }, { label: 'n', num: true }, { label: '25th', num: true }, { label: 'Median', num: true }, { label: 'Mean', num: true }, { label: '75th', num: true }, { label: 'Company today', num: true }, { label: 'Implied low', num: true }, { label: `Implied (${c.stat})`, num: true }, { label: 'Implied high', num: true }], rows, 'Peer multiples and implied values per share'),
    h('details', { class: 'table-twin' }, h('summary', {}, 'Each peer’s multiples'), dataTable([{ label: 'Peer' }, { label: 'Market cap', num: true }, { label: 'EV', num: true }, ...c.table.map((t) => ({ label: t.name, num: true }))], peerRows, 'Peer multiples')),
    c.range ? h('p', { class: 'note' }, `Across the usable multiples the implied value runs from ${f.perShare(c.range.low)} (25th percentiles) to ${f.perShare(c.range.high)} (75th), with a ${c.stat} of ${f.perShare(c.range.mid)}. "n/m" marks a multiple whose denominator is zero or negative.`) : null);
}
function fcfeView(r, f, A) {
  const slider = pctSlider({ label: 'Share of net investment funded by debt', value: fin(A.fcfe?.debtFunding) ? A.fcfe.debtFunding : (r?.ok ? r.debtFunding : 0.2), min: 0, max: 100, step: 1, digits: 0, onInput: (v) => { A.fcfe = { ...(A.fcfe || {}), debtFunding: v }; scheduleRecompute(); } });
  if (!r || r.error) return h('div', { class: 'cv-list-editor' }, slider, verdict('warn', 'FCFE not run.', r?.error || ''));
  return h('div', { class: 'cv-list-editor' }, slider, warnList(r), h('dl', { class: 'stats-row cv-stats' }, stat('Cost of equity', F.pct(r.ke, 2)), stat('PV of FCFE', f.money(r.sumPv)), stat('PV of terminal value', f.money(r.pvTV)), stat('Equity value', f.money(r.equity)), stat('Per share', f.perShare(r.perShare))),
    dataTable([{ label: 'Line' }, ...r.rows.map((x) => ({ label: String(x.year), num: true }))], [['Net income', ...r.rows.map((x) => F.num(x.netIncome, 1))], ['Interest', ...r.rows.map((x) => F.num(x.interest, 1))], ['Net borrowing', ...r.rows.map((x) => F.num(x.netBorrowing, 1))], ['FCFE', ...r.rows.map((x) => F.num(x.fcfe, 1))], ['Present value', ...r.rows.map((x) => F.num(x.pv, 1))]], 'FCFE schedule'),
    h('p', { class: 'note' }, `Compare with the DCF: ${state.results.dcf?.ok ? `${f.perShare(state.results.dcf.perShare)} from FCFF at WACC` : 'not available'}. The two agree when the debt-funding share matches the WACC weights and leverage is stable.`));
}
function ddmView(r, f) {
  const P = state.project; P.ddm ||= { g1: 0.05, years: 5, gT: state.A.terminal.growth };
  const ctl = h('div', { class: 'cv-sliders' },
    pctSlider({ label: 'Dividend growth, first stage', value: P.ddm.g1, min: -10, max: 30, step: 0.5, onInput: (v) => { P.ddm.g1 = v; P.ddm.stages = null; scheduleRecompute(); } }),
    numSlider({ label: 'Years in the first stage', value: P.ddm.years || 5, min: 1, max: 15, step: 1, digits: 0, onInput: (v) => { P.ddm.years = v; P.ddm.stages = null; scheduleRecompute(); } }),
    pctSlider({ label: 'Terminal dividend growth', value: fin(P.ddm.gT) ? P.ddm.gT : state.A.terminal.growth, min: -2, max: 6, step: 0.1, onInput: (v) => { P.ddm.gT = v; scheduleRecompute(); } }),
    field('Dividend per share (optional override)', numInput({ value: P.ddm.d0, digits: null, onInput: (v) => { if (fin(v)) P.ddm.d0 = v; else delete P.ddm.d0; scheduleRecompute(); } }), { hint: 'Blank: dividends paid ÷ shares outstanding.' }));
  if (!r || r.error) return h('div', { class: 'cv-list-editor' }, ctl, verdict('warn', 'Dividend model not run.', r?.error || ''));
  return h('div', { class: 'cv-list-editor' }, ctl, warnList(r), h('dl', { class: 'stats-row cv-stats' }, stat('Dividend per share', f.perShare(r.dps)), stat('Cost of equity', F.pct(r.ke, 2)), stat('Gordon growth value', r.gordon.ok ? f.perShare(r.gordon.value) : r.gordon.error), stat('Multi-stage value', r.multi.ok ? f.perShare(r.multi.value) : r.multi.error), stat('Payout ratio', F.pct(r.payout, 0)), stat('Historical dividend growth', F.pct(r.histGrowth))),
    r.multi.ok ? dataTable([{ label: 'Year' }, { label: 'Growth', num: true }, { label: 'Dividend', num: true }, { label: 'Factor', num: true }, { label: 'PV', num: true }], [...r.multi.rows.map((x) => [String(x.t), F.pct(x.growth), F.num(x.dividend, 3), F.num(x.df, 4), F.num(x.pv, 3)]), ['Terminal', '', F.num(r.multi.tv, 2), '', F.num(r.multi.pvTV, 3)]], 'Dividend schedule') : null);
}
function assetView(r, f) {
  const P = state.project; P.assetOpts ||= { adjustments: {} };
  const adj = P.assetOpts.adjustments;
  const ctl = h('div', { class: 'cv-field-grid is-adv-only' }, ...['ppeNet', 'inventory', 'receivables', 'intangibles', 'goodwill', 'otherNoncurrentAssets'].map((k) => field(`${V.label(k)}: adjustment`, numInput({ value: adj[k], scale: 100, digits: 0, onInput: (v) => { if (fin(v)) adj[k] = v; else delete adj[k]; scheduleRecompute(); } }), { hint: '% over (+) or under (−) book, for the adjusted NAV.' })), field('Selling costs in liquidation', numInput({ value: fin(P.assetOpts.costs) ? P.assetOpts.costs : 0.05, scale: 100, digits: 0, onInput: (v) => { P.assetOpts.costs = fin(v) ? v : 0.05; scheduleRecompute(); } }), { hint: '% of gross proceeds.' }));
  if (!r || r.error) return h('div', { class: 'cv-list-editor' }, ctl, verdict('warn', 'Asset-based values not run.', r?.error || ''));
  return h('div', { class: 'cv-list-editor' }, ctl, warnList(r), h('dl', { class: 'stats-row cv-stats' }, stat('Book value', `${f.money(r.book)} · ${f.perShare(r.perShare.book)}`), stat('Tangible book', `${f.money(r.tangible)} · ${f.perShare(r.perShare.tangible)}`), stat('Adjusted NAV', `${f.money(r.adjustedNav)} · ${f.perShare(r.perShare.adjustedNav)}`), stat('Orderly liquidation', `${f.money(r.orderly.net)} · ${f.perShare(r.orderly.perShare)}`), stat('Forced liquidation', `${f.money(r.forced.net)} · ${f.perShare(r.forced.perShare)}`)),
    dataTable([{ label: 'Asset' }, { label: 'Book', num: true }, { label: 'Orderly rate', num: true }, { label: 'Orderly', num: true }, { label: 'Forced rate', num: true }, { label: 'Forced', num: true }], [...r.orderly.rows.map((x, i) => [x.label, F.num(x.book, 1), F.pct(x.rate, 0), F.num(x.proceeds, 1), F.pct(r.forced.rows[i].rate, 0), F.num(r.forced.rows[i].proceeds, 1)]), ['Less costs, liabilities and claims', '', '', F.num(-(r.orderly.cost + r.liabilities + r.claims), 1), '', F.num(-(r.forced.cost + r.liabilities + r.claims), 1)], { cells: ['Net to shareholders', '', '', F.num(r.orderly.net, 1), '', F.num(r.forced.net, 1)], strong: true }], 'Liquidation scenarios'),
    h('p', { class: 'note' }, 'Recovery rates are starting assumptions (orderly: receivables 85%, inventory 60%, PP&E 50%; forced: 65%, 35%, 30%; goodwill nil). Accounting value records what was paid, not what the assets can earn.'));
}
function sotpView(r, f) {
  const P = state.project; P.segments ||= []; P.corporate ||= { value: 0, multiple: 0 };
  const list = h('div', { class: 'cv-list-editor' });
  P.segments.forEach((sg, i) => list.append(h('div', { class: 'cv-list-row' }, field('Segment', (() => { const t = h('input', { class: 'input input-name', type: 'text', value: sg.name || '' }); t.addEventListener('input', () => { sg.name = t.value; scheduleRecompute(); }); return t; })()), field('Metric', selectEl([{ value: 'ebitda', label: 'EBITDA' }, { value: 'ebit', label: 'EBIT' }, { value: 'revenue', label: 'Revenue' }, { value: 'ev', label: 'Value (direct)' }], sg.metric || 'ebitda', (v) => { sg.metric = v; scheduleRecompute(); })), field('Amount', numInput({ value: sg.value, onInput: (v) => { sg.value = v; scheduleRecompute(); } })), field('Multiple', numInput({ value: sg.multiple, onInput: (v) => { sg.multiple = v; scheduleRecompute(); } })), btn('Remove', () => { P.segments.splice(i, 1); recompute(); emit('structure'); }, { cls: 'btn-sm' }))));
  const corp = h('div', { class: 'cv-inline-fields' }, field('Corporate costs (negative EBITDA)', numInput({ value: P.corporate.value, onInput: (v) => { P.corporate.value = fin(v) ? v : 0; scheduleRecompute(); } })), field('Multiple on corporate costs', numInput({ value: P.corporate.multiple, onInput: (v) => { P.corporate.multiple = fin(v) ? v : 0; scheduleRecompute(); } })));
  const add = btn('Add a segment', () => { P.segments.push({ name: '', metric: 'ebitda', value: NaN, multiple: 8 }); recompute(); emit('structure'); }, { kind: 'primary', cls: 'btn-sm' });
  const out = !r || r.error ? verdict('warn', 'Sum of the parts not run.', r?.error || '') : h('div', {}, h('dl', { class: 'stats-row cv-stats' }, stat('Sum of the parts (EV)', f.money(r.ev)), stat('Implied group multiple', `${F.num(r.blended, 1)}× EBITDA`), stat('Equity value', f.money(r.equity)), stat('Per share', f.perShare(r.perShare))), dataTable([{ label: 'Segment' }, { label: 'How' }, { label: 'Value', num: true }], [...r.rows.map((x) => [x.name, x.how, F.num(x.ev, 1)]), ['Corporate', `${F.num(r.corporate.value, 1)} × ${F.num(r.corporate.multiple, 1)}`, F.num(r.corporate.ev, 1)]], 'Segment values'));
  return h('div', { class: 'cv-list-editor' }, list, h('div', { class: 'input-actions' }, add), corp, out);
}
function earningsView(r, f) {
  const P = state.project; P.earningsOpts ||= { pe: 15, growth: 0.02 };
  const ctl = h('div', { class: 'cv-field-grid' }, field('Normalised earnings (optional)', numInput({ value: P.earningsOpts.normalisedEarnings, onInput: (v) => { if (fin(v)) P.earningsOpts.normalisedEarnings = v; else delete P.earningsOpts.normalisedEarnings; scheduleRecompute(); } }), { hint: 'Blank: latest net income.' }), field('Growth in the cap rate', numInput({ value: P.earningsOpts.growth, scale: 100, digits: 1, onInput: (v) => { P.earningsOpts.growth = fin(v) ? v : 0; scheduleRecompute(); } }), { hint: '%: cap rate = cost of equity − growth.' }), field('Target P/E', numInput({ value: P.earningsOpts.pe, onInput: (v) => { P.earningsOpts.pe = v; scheduleRecompute(); } })));
  if (!r || r.error) return h('div', { class: 'cv-list-editor' }, ctl, verdict('warn', 'Earnings-based values not run.', r?.error || ''));
  return h('div', { class: 'cv-list-editor' }, ctl, warnList(r), h('dl', { class: 'stats-row cv-stats' }, stat('Earnings used', f.money(r.earnings)), stat('Capitalised earnings', `${f.money(r.capitalised)} · ${f.perShare(r.perShare.capitalised)}`), stat('Earnings-power value (equity)', r.epv ? `${f.money(r.epv.equity)} · ${f.perShare(r.epv.perShare)}` : '—'), stat('At the target P/E', `${f.money(r.peValue)} · ${f.perShare(r.perShare.pe)}`)));
}
function vcView(r, f, unit) {
  const P = state.project; P.vc ||= { exitYear: 5, exitMetric: NaN, exitMultiple: 8, targetReturn: 0.35, investment: NaN, retention: 0.8 };
  const v = P.vc;
  const ctl = h('div', { class: 'cv-field-grid' }, field('Years to exit', numInput({ value: v.exitYear, digits: 0, onInput: (x) => { v.exitYear = x; scheduleRecompute(); } })), field(`Exit-year metric (${unit})`, numInput({ value: v.exitMetric, onInput: (x) => { v.exitMetric = x; scheduleRecompute(); } }), { hint: 'Revenue or EBITDA in the exit year.' }), field('Exit multiple', numInput({ value: v.exitMultiple, onInput: (x) => { v.exitMultiple = x; scheduleRecompute(); } })), field('Target return (% a year)', numInput({ value: v.targetReturn, scale: 100, digits: 0, onInput: (x) => { v.targetReturn = x; scheduleRecompute(); } })), field(`Investment (${unit})`, numInput({ value: v.investment, onInput: (x) => { v.investment = x; scheduleRecompute(); } })), field('Retention after later rounds (%)', numInput({ value: v.retention, scale: 100, digits: 0, onInput: (x) => { v.retention = fin(x) ? x : 1; scheduleRecompute(); } })));
  if (!r || r.error) return h('div', { class: 'cv-list-editor' }, ctl, verdict('warn', 'VC method not run.', r?.error || ''));
  return h('div', { class: 'cv-list-editor' }, ctl, warnList(r), h('dl', { class: 'stats-row cv-stats' }, stat('Exit value', f.money(r.exitValue)), stat('Post-money value today', f.money(r.postMoney)), stat('Pre-money value', f.money(r.preMoney)), stat('Ownership required at exit', F.pct(r.ownership)), stat('Ownership needed today', F.pct(r.ownershipToday))));
}

// ---------------------------------------------------------------- scenarios
function renderScenarioEditor(box) {
  box.replaceChildren();
  const P = state.project; P.scenarios ||= JSON.parse(JSON.stringify(V.DEFAULT_SCENARIOS));
  const keys = ['bear', 'base', 'bull'];
  const cols = [['growth', 'Growth', 2], ['margin', 'Margin', 2], ['capexPct', 'Capex %', 2], ['wacc', 'WACC', 2], ['gT', 'Terminal g', 2], ['exitMultiple', 'Exit ×', 1]];
  const t = h('table', { class: 'data-table cv-year-table' }, h('caption', { class: 'visually-hidden' }, 'Scenario shifts in percentage points'), h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Scenario'), cols.map(([, lab]) => h('th', { scope: 'col', class: 'is-num' }, `${lab} (pts)`)), h('th', { scope: 'col', class: 'is-num' }, 'Weight %'))),
    h('tbody', {}, keys.map((k) => { const s = P.scenarios[k]; return h('tr', {}, h('th', { scope: 'row' }, s.name), cols.map(([c, lab, dg]) => h('td', { class: 'is-num' }, numInput({ value: s.deltas[c] || 0, scale: c === 'exitMultiple' ? 1 : 100, digits: dg, ariaLabel: `${s.name} ${lab} shift`, onInput: (v) => { if (fin(v)) { s.deltas[c] = v; scheduleRecompute(); } } }))), h('td', { class: 'is-num' }, numInput({ value: s.weight, scale: 100, digits: 0, ariaLabel: `${s.name} weight`, onInput: (v) => { if (fin(v)) { s.weight = v; scheduleRecompute(); } } }))); })));
  const editor = h('div', { class: 'cv-scen-editor' }, h('div', { class: 'table-scroll' }, t), h('p', { class: 'field-hint' }, 'Shifts are added to every forecast year (growth, margin, capex) or to the rate (WACC through the risk-free rate, terminal growth, exit multiple). Weights are for the probability-weighted value; they need not sum to 100 (they are normalised).'));
  box.append(editor, h('div', { class: 'cv-scen-results' }));
}
function renderScenarioResults(box) {
  const out = $('.cv-scen-results', box); if (!out) return;
  out.replaceChildren();
  const S = state.scenarios, f = formatter(state.project);
  if (!S) { out.append(h('p', { class: 'note' }, 'Scenarios run once the DCF runs.')); return; }
  const keys = ['bear', 'base', 'bull'].filter((k) => S.scenarios[k]);
  const chart = h('div', { class: 'chart' });
  const rows = keys.map((k) => { const s = S.scenarios[k]; return [s.name, s.result.ok ? f.money(s.result.ev) : s.result.error, s.result.ok ? f.money(s.result.equity) : '—', s.result.ok ? f.perShare(s.result.perShare) : '—', s.risk.contributors.length ? s.risk.contributors.map((c) => c.name).join(', ') : '—']; });
  out.append(h('dl', { class: 'stats-row cv-stats' }, ...keys.map((k) => stat(`${S.scenarios[k].name} case`, S.scenarios[k].result.ok ? f.perShare(S.scenarios[k].result.perShare) : '—')), stat('Probability-weighted', f.perShare(S.weighted))),
    h('figure', { class: 'cv-figure' }, h('figcaption', { class: 'figure-title' }, 'Value per share by scenario'), chart),
    dataTable([{ label: 'Scenario' }, { label: 'Enterprise value', num: true }, { label: 'Equity', num: true }, { label: 'Per share', num: true }, { label: 'Risks applied' }], rows, 'Scenario results'));
  const flags = keys.flatMap((k) => S.scenarios[k].risk.flags);
  if (flags.length) out.append(verdict('warn', 'Possible double counting.', flags.join(' ')));
  requestAnimationFrame(() => barChart(chart, { categories: keys.map((k) => S.scenarios[k].name), height: 200, legend: false, valueLabels: true, horizontal: true, label: 'Value per share by scenario', series: [{ name: 'Per share', values: keys.map((k) => (S.scenarios[k].result.ok ? S.scenarios[k].result.perShare : NaN)), cls: 'm-s2' }], format: (v) => f.perShare(v) }));
}
// ---------------------------------------------------------------- sensitivity
function renderSensitivity(box) {
  box.replaceChildren();
  const d = state.results.dcf, A = state.A, f = formatter(state.project);
  if (!d?.ok) { box.append(h('p', { class: 'note' }, 'Sensitivity tables appear once the DCF runs.')); return; }
  const per = fin(d.perShare), fmt = per ? (v) => f.perShare(v) : (v) => f.money(v);
  const val = (r) => (r.ok ? (per ? r.perShare : r.ev) : NaN);
  const dW = [-0.02, -0.01, 0, 0.01, 0.02], dG = [-0.01, -0.005, 0, 0.005, 0.01];
  const g1 = h('div'), g2 = h('div'), g3 = h('div');
  heatGrid(g1, { rowLabels: dW.map((x) => F.pct(d.r + x, 2)), colLabels: dG.map((x) => F.pct(A.terminal.growth + x)), values: dW.map((dw) => dG.map((dg) => val(V.dcf(state.project, V.applyDeltas(A, { wacc: dw, gT: dg }))))), format: fmt, rowTitle: 'WACC', colTitle: 'terminal growth', centre: [2, 2], caption: `${per ? 'Value per share' : 'Enterprise value'}: WACC down, terminal growth across. Centre is the base case.` });
  const dM = [-0.04, -0.02, 0, 0.02, 0.04], dGr = [-0.04, -0.02, 0, 0.02, 0.04];
  heatGrid(g2, { rowLabels: dM.map((x) => `${F.signed(x * 100, 0)} pts`), colLabels: dGr.map((x) => `${F.signed(x * 100, 0)} pts`), values: dM.map((dm) => dGr.map((dg) => val(V.dcf(state.project, V.applyDeltas(A, { margin: dm, growth: dg }))))), format: fmt, rowTitle: 'margin shift', colTitle: 'growth shift', centre: [2, 2], caption: 'EBITDA margin shift down, revenue growth shift across, in points added to every year.' });
  const dX = [-3, -2, -1, 0, 1, 2, 3];
  heatGrid(g3, { rowLabels: dW.map((x) => F.pct(d.r + x, 2)), colLabels: dX.map((x) => `${F.num(A.terminal.multiple + x, 1)}×`), values: dW.map((dw) => dX.map((dx) => val(V.dcf(state.project, V.applyDeltas({ ...A, terminal: { ...A.terminal, method: 'exit' } }, { wacc: dw, exitMultiple: dx }))))), format: fmt, rowTitle: 'WACC', colTitle: 'exit multiple', centre: [2, 3], caption: `With an exit-multiple terminal value (${A.terminal.multipleBasis.toUpperCase()}): WACC down, multiple across.` });
  box.append(h('div', { class: 'cv-results-grid' }, h('figure', { class: 'cv-figure' }, h('figcaption', { class: 'figure-title' }, 'WACC × terminal growth'), g1), h('figure', { class: 'cv-figure' }, h('figcaption', { class: 'figure-title' }, 'Margin × growth'), g2)), h('figure', { class: 'cv-figure is-adv-only' }, h('figcaption', { class: 'figure-title' }, 'WACC × exit multiple'), g3));
}
// ---------------------------------------------------------------- Monte Carlo
function renderMC(box) {
  box.replaceChildren();
  const P = state.project; P.mcSpec ||= { ...V.DEFAULT_MC };
  const s = P.mcSpec;
  const ctl = h('div', { class: 'cv-field-grid' }, field('Runs', numInput({ value: s.n, digits: 0, min: 100, max: 10000, onInput: (v) => { if (fin(v)) s.n = v; } })), field('Seed', numInput({ value: s.seed, digits: 0, onInput: (v) => { if (fin(v)) s.seed = v; } })), field('Growth shift: sd (pts)', numInput({ value: s.growth.sd, scale: 100, digits: 1, onInput: (v) => { if (fin(v)) s.growth = { sd: v }; } })), field('Margin shift: sd (pts)', numInput({ value: s.margin.sd, scale: 100, digits: 1, onInput: (v) => { if (fin(v)) s.margin = { sd: v }; } })), field('Growth–margin correlation', numInput({ value: s.rho, digits: 2, min: -1, max: 1, onInput: (v) => { if (fin(v)) s.rho = v; } })), field('WACC shift: sd (pts)', numInput({ value: s.wacc.sd, scale: 100, digits: 2, onInput: (v) => { if (fin(v)) s.wacc = { sd: v }; } })), field('Terminal growth shift: low (pts)', numInput({ value: s.gT.lo, scale: 100, digits: 1, onInput: (v) => { if (fin(v)) s.gT = { ...s.gT, lo: v }; } })), field('Terminal growth shift: high (pts)', numInput({ value: s.gT.hi, scale: 100, digits: 1, onInput: (v) => { if (fin(v)) s.gT = { ...s.gT, hi: v }; } })));
  const run = btn('Run the simulation', () => { state.mc = V.monteCarlo(P, state.A, s); emit('results'); }, { kind: 'primary' });
  box.append(ctl, h('div', { class: 'input-actions' }, run), h('div', { class: 'cv-mc-out' }));
}
function renderMCResults(box) {
  const out = $('.cv-mc-out', box); if (!out) return;
  out.replaceChildren();
  const mc = state.mc, f = formatter(state.project);
  if (!mc) return;
  if (mc.error) { out.append(verdict('bad', 'The simulation could not run.', mc.error)); return; }
  const chart = h('div', { class: 'chart' });
  out.append(h('dl', { class: 'stats-row cv-stats' }, stat('5th percentile', f.perShare(mc.p5)), stat('25th', f.perShare(mc.p25)), stat('Median', f.perShare(mc.p50)), stat('75th', f.perShare(mc.p75)), stat('95th', f.perShare(mc.p95)), stat('Runs below the price', F.pct(mc.belowPrice, 0))), h('figure', { class: 'cv-figure' }, h('figcaption', { class: 'figure-title' }, 'Distribution of simulated values per share'), chart), verdict('warn', 'Read this as the spread of the model, not of the world.', `${mc.n} runs from the stated distributions (normal shifts of growth and margin with correlation ${F.num(mc.spec.rho, 2)}, a normal WACC shift, a triangular terminal-growth shift). The distributions are assumptions; a wider or narrower choice changes the percentiles directly, and ${mc.failed} runs were dropped because WACC fell below terminal growth.`));
  requestAnimationFrame(() => histogramChart(chart, { bins: mc.bins, height: 220, xLabel: 'value per share', format: (v) => f.perShare(v), label: 'Histogram of simulated values per share', markers: [{ x: mc.p50, label: 'median' }, ...(fin(mc.price) ? [{ x: mc.price, label: 'price' }] : [])] }));
}
