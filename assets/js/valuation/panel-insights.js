// panel-insights.js — the right panel: the headline results across methods (football field), what they mean,
// the risk register with its probability–impact matrix and explicit effects on the forecast, learning notes, and the
// report generator.
import { h, $, $$ } from '../core/dom.js?v=26';
import * as F from '../core/format.js?v=26';
import * as V from '../core/valuation.js?v=26';
import { verdict } from '../core/ui.js?v=26';
import { formatter, buildReport } from '../core/valuation-report.js?v=26';
import { football, riskMatrix } from './charts.js?v=26';
import { state, on, recompute, scheduleRecompute, emit, setStep } from './state.js?v=26';
import { numInput, textInput, selectEl, field, numSlider, block, btn, dataTable, helpLink, id } from './ui.js?v=26';
import { renderReport } from './report-view.js?v=26';
import { LEARN_LINKS } from '../data/valuation-tutorials.js?v=26';
import { ROOT } from './ui.js?v=26';

const fin = Number.isFinite;

export function renderInsightsPanel(root) {
  const panel = h('section', { class: 'cv-panel cv-panel--insights', 'aria-labelledby': 'cv-ins-title' }, h('div', { class: 'cv-panel-head' }, h('h2', { id: 'cv-ins-title' }, 'Insights and risks'), h('span', { class: 'muted' }, 'right panel')));
  root.append(panel);
  const keyBox = h('div'), readBox = h('div'), riskBox = h('div'), learnBox = h('div'), reportBox = h('div');
  panel.append(
    block({ title: 'Key results', step: 3, children: [keyBox] }),
    block({ title: 'What the numbers say', step: 3, children: [readBox] }),
    block({ title: 'Risk register', step: 4, sub: 'Pick risks from the catalogue, rate likelihood and severity, record evidence and mitigation, and state how each one would change the forecast. Risks change cash flows and the cost of debt in the scenario you assign them to; they never add a premium to WACC, which would count them twice.', children: [riskBox] }),
    block({ title: 'Learn as you build', step: 2, children: [learnBox] }),
    block({ title: 'Report', step: 6, sub: 'Generates the twelve-section report from exactly the numbers above.', children: [reportBox] }),
  );
  const renderAll = () => { renderKey(keyBox); renderReading(readBox); renderRisks(riskBox); renderLearn(learnBox); renderReportBox(reportBox); };
  renderAll();
  on((kind) => { if (kind === 'structure') renderAll(); else if (kind === 'results') { renderKey(keyBox); renderReading(readBox); refreshRiskSummary(riskBox); } else if (kind === 'mode') renderLearn(learnBox); });
  return panel;
}

// ---------------------------------------------------------------- key results
function renderKey(box) {
  box.replaceChildren();
  const R = state.results, f = formatter(state.project), { m } = V.market(state.project);
  const rows = [];
  if (R.dcf?.ok) rows.push(['DCF (base case)', f.perShare(R.dcf.perShare)]);
  if (state.scenarios && fin(state.scenarios.weighted)) rows.push(['Scenarios, probability-weighted', f.perShare(state.scenarios.weighted)]);
  if (R.fcfe?.ok) rows.push(['FCFE', f.perShare(R.fcfe.perShare)]);
  if (R.comps?.ok && R.comps.range) rows.push([`Comparables (${R.comps.stat})`, f.perShare(R.comps.range.mid)]);
  if (R.ddm?.ok && R.ddm.multi.ok) rows.push(['Dividend model (multi-stage)', f.perShare(R.ddm.multi.value)]);
  if (R.asset?.ok) rows.push(['Tangible book value', f.perShare(R.asset.perShare.tangible)], ['Orderly liquidation', f.perShare(R.asset.orderly.perShare)]);
  if (R.sotp?.ok) rows.push(['Sum of the parts', f.perShare(R.sotp.perShare)]);
  if (R.earnings?.ok) rows.push(['Earnings-power value', f.perShare(R.earnings.perShare.epv)]);
  if (R.vc?.ok) rows.push(['VC method, post-money (total)', f.money(R.vc.postMoney)]);
  if (fin(m.sharePrice)) rows.push(['Market price', f.perShare(m.sharePrice)]);
  if (!rows.length) { box.append(h('p', { class: 'note' }, state.errors.length ? 'Fix the data errors on the left to see results.' : 'Results appear once the latest year’s statements are in.')); return; }
  const ff = h('div');
  box.append(h('dl', { class: 'cv-keyvals' }, rows.map(([k, v]) => h('div', {}, h('dt', {}, k), h('dd', {}, v)))), h('figure', { class: 'cv-figure' }, h('figcaption', { class: 'figure-title' }, 'Football field'), ff));
  football(ff, { bars: state.football, price: m.sharePrice, format: (v) => f.perShare(v), caption: 'Valuation ranges by method, per share' });
}

// ---------------------------------------------------------------- reading
function renderReading(box) {
  box.replaceChildren();
  const d = state.results.dcf, f = formatter(state.project), H = state.historical, L = H[H.length - 1];
  const notes = [];
  if (d?.ok) {
    if (fin(d.upside)) notes.push(['interpretation', `The base case is ${F.pct(Math.abs(d.upside), 0)} ${d.upside >= 0 ? 'above' : 'below'} the share price. The report works out what terminal growth or discount rate the price implies.`]);
    notes.push([d.tvShare > 0.75 ? 'warn' : 'estimate', `${F.pct(d.tvShare, 0)} of enterprise value is terminal value${d.tvShare > 0.75 ? ': the answer rests on the long-run assumptions; check the WACC × growth grid' : ''}.`]);
    if (d.assumptions.terminal.method === 'perpetuity' && fin(d.impliedMultiple)) { const ev = state.results.comps?.ok ? state.results.comps.table.find((t) => t.id === 'evEbitda') : null; notes.push(['estimate', `Perpetual growth of ${F.pct(d.assumptions.terminal.growth)} implies exiting at ${F.num(d.impliedMultiple, 1)}× EBITDA${ev && fin(ev.stats.median) ? ` against a peer median of ${F.num(ev.stats.median, 1)}×` : ''}.`]); }
    if (L && fin(L.ratios.solvency.netDebtToEbitda)) notes.push([L.ratios.solvency.netDebtToEbitda > 3 ? 'warn' : 'verified', `Net debt is ${F.num(L.ratios.solvency.netDebtToEbitda, 1)}× EBITDA${L.ratios.solvency.netDebtToEbitda > 3 ? ': high leverage; a weak year leaves little room' : ''}.`]);
    if (H.length >= 2 && fin(L.growth.revenue) && fin(L.margins.ebitda) && fin(H[H.length - 2].margins.ebitda)) { const dm = L.margins.ebitda - H[H.length - 2].margins.ebitda; if (L.growth.revenue > 0 && dm < -0.01) notes.push(['interpretation', `Last year revenue grew ${F.pct(L.growth.revenue)} but the EBITDA margin fell ${F.num(-dm * 100, 1)} points: costs grew faster than sales.`]); else if (dm > 0.01) notes.push(['interpretation', `The EBITDA margin widened ${F.num(dm * 100, 1)} points last year: profit grew faster than sales.`]); }
    const vals = [['DCF', d.perShare], ['comparables', state.results.comps?.range?.mid], ['dividend model', state.results.ddm?.multi?.value], ['sum of the parts', state.results.sotp?.perShare]].filter((x) => fin(x[1]));
    if (vals.length >= 2) { const hi = vals.reduce((a, b) => (b[1] > a[1] ? b : a)), lo = vals.reduce((a, b) => (b[1] < a[1] ? b : a)); if (lo[1] > 0 && hi[1] / lo[1] > 1.3) notes.push(['warn', `The methods disagree: ${hi[0]} ${f.perShare(hi[1])} against ${lo[0]} ${f.perShare(lo[1])}. The report discusses why.`]); else notes.push(['good', `The methods broadly agree (${f.perShare(lo[1])} to ${f.perShare(hi[1])}).`]); }
  } else if (state.errors.length) notes.push(['bad', state.errors[0].text]);
  else notes.push(['estimate', 'Enter the latest year’s statements to see the reading.']);
  const kindOf = { warn: 'warn', bad: 'bad', good: 'good' };
  box.append(...notes.map(([k, t]) => (kindOf[k] ? verdict(kindOf[k], '', t) : h('p', { class: 'note' }, h('span', { class: `cv-tag is-${k}` }, k === 'verified' ? 'data' : k), ' ', t))));
}

// ---------------------------------------------------------------- risks
function renderRisks(box) {
  box.replaceChildren();
  const P = state.project; P.risks ||= [];
  const list = h('ul', { class: 'cv-risks' });
  P.risks.forEach((r, i) => list.append(riskCard(r, i)));
  const cat = selectEl(V.RISK_CATALOG.map((c) => ({ value: c.id, label: c.name })), 'financial', () => fillItems());
  const item = selectEl([], '', () => {});
  const fillItems = () => { const c = V.RISK_CATALOG.find((x) => x.id === cat.value); item.replaceChildren(...c.items.map((it) => h('option', { value: it.id }, it.name))); };
  fillItems();
  const add = btn('Add this risk', () => { P.risks.push(V.newRisk(item.value)); recompute(); emit('structure'); }, { kind: 'primary', cls: 'btn-sm' });
  const matrix = h('div');
  const summary = h('div', { class: 'cv-risk-summary' });
  box.append(list, h('div', { class: 'cv-risk-add' }, h('div', { class: 'cv-inline-fields' }, field('Category', cat), field('Risk', item), add)), h('figure', { class: 'cv-figure' }, h('figcaption', { class: 'figure-title' }, 'Probability–impact matrix'), matrix), summary);
  riskMatrix(matrix, { cells: V.riskMatrix(P.risks), onSelect: (r) => { const card = $(`[data-risk="${r.id}"] details`, box); if (card) { card.open = true; card.scrollIntoView({ block: 'nearest' }); } } });
  refreshRiskSummary(box);
}
function riskCard(r, i) {
  const P = state.project;
  const score = () => V.riskScore(r);
  const scoreEl = h('span', { class: `cv-risk-score is-${V.riskBand(score())}` }, `score ${score()}`);
  const upd = () => { scoreEl.textContent = `score ${score()}`; scoreEl.className = `cv-risk-score is-${V.riskBand(score())}`; scheduleRecompute(); };
  const name = textInput({ value: r.name, ariaLabel: 'Risk name', onInput: (v) => { r.name = v; upd(); } });
  const desc = h('textarea', { class: 'textarea', placeholder: 'Description' }); desc.value = r.description || ''; desc.addEventListener('input', () => { r.description = desc.value; scheduleRecompute(); });
  const mit = h('textarea', { class: 'textarea', placeholder: 'Mitigation measures' }); mit.value = r.mitigation || ''; mit.addEventListener('input', () => { r.mitigation = mit.value; scheduleRecompute(); });
  const ev = h('textarea', { class: 'textarea', placeholder: 'Evidence or source (document, page, date)' }); ev.value = r.evidence || ''; ev.addEventListener('input', () => { r.evidence = ev.value; scheduleRecompute(); });
  const effects = h('div', { class: 'cv-risk-effects' }, ...[['growth', 'Growth (pts/yr)'], ['margin', 'Margin (pts)'], ['capexPct', 'Capex % (pts)'], ['nwcPct', 'NWC % (pts)'], ['kd', 'Cost of debt (pts)']].map(([k, lab]) => field(lab, numInput({ value: r.effect?.[k] || 0, scale: 100, digits: 2, ariaLabel: `${r.name}: effect on ${lab}`, onInput: (v) => { r.effect ||= {}; if (fin(v)) r.effect[k] = v; else delete r.effect[k]; scheduleRecompute(); } }))));
  const details = h('details', {}, h('summary', {}, 'Details, evidence and effect on the forecast'),
    h('div', { class: 'cv-list-editor' },
      h('div', { class: 'cv-field-grid' }, field('Likelihood (1–5)', selectEl([1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) })), String(r.likelihood), (v) => { r.likelihood = +v; upd(); })), field('Severity (1–5)', selectEl([1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) })), String(r.severity), (v) => { r.severity = +v; upd(); })), field('Time horizon', selectEl(V.HORIZONS, r.horizon || 'medium', (v) => { r.horizon = v; scheduleRecompute(); })), field(`Financial exposure (${P.meta.unitLabel})`, numInput({ value: r.exposure, onInput: (v) => { r.exposure = fin(v) ? v : null; scheduleRecompute(); } }), { hint: 'Optional: the amount at stake.' }), field('Apply its effect to', selectEl([{ value: 'bear', label: 'Bear case' }, { value: 'base', label: 'Base case' }, { value: 'bull', label: 'Bull case' }, { value: 'none', label: 'Do not apply' }], r.applyTo || 'bear', (v) => { r.applyTo = v; scheduleRecompute(); }))),
      field('Description', desc), field('Mitigation', mit), field('Evidence', ev),
      h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Proposed effect on the forecast assumptions'), effects, h('p', { class: 'field-hint' }, 'Negative growth and margin points, positive capex and cost-of-debt points. The catalogue suggests starting values; make them match the evidence.')),
      h('div', { class: 'input-actions' }, btn('Remove this risk', () => { P.risks.splice(i, 1); recompute(); emit('structure'); }, { cls: 'btn-sm' }))));
  return h('li', { class: 'cv-risk', 'data-risk': r.id }, h('div', { class: 'cv-risk-head' }, h('span', { class: 'cv-chip is-na' }, V.RISK_CATALOG.find((c) => c.id === r.category)?.name || r.category), name, scoreEl), details);
}
function refreshRiskSummary(box) {
  const out = $('.cv-risk-summary', box); if (!out) return;
  out.replaceChildren();
  const P = state.project, f = formatter(P);
  if (!P.risks.length) { out.append(h('p', { class: 'note' }, 'No risks yet. The bear case then uses only its own shifts.')); return; }
  ['bear', 'base', 'bull'].forEach((k) => {
    const e = V.riskEffects(P.risks, k);
    if (!e.contributors.length) return;
    const parts = Object.entries(e.deltas).map(([key, v]) => `${{ growth: 'growth', margin: 'margin', capexPct: 'capex', nwcPct: 'NWC', kd: 'cost of debt' }[key]} ${F.signed(v * 100, 2)} pts`).join(', ');
    out.append(h('p', { class: 'note' }, h('strong', {}, `${k[0].toUpperCase()}${k.slice(1)} case: `), `${e.contributors.length} risk${e.contributors.length === 1 ? '' : 's'} (${e.contributors.map((c) => c.name).join(', ')}) → ${parts || 'no numeric effect'}.`));
    if (e.flags.length) out.append(verdict('warn', 'Check for double counting.', e.flags.join(' ')));
  });
  const m = $('.cv-matrix', box)?.parentElement;
  if (m) riskMatrix(m, { cells: V.riskMatrix(P.risks), onSelect: (r) => { const card = $(`[data-risk="${r.id}"] details`, box); if (card) { card.open = true; card.scrollIntoView({ block: 'nearest' }); } } });
}

// ---------------------------------------------------------------- learn notes
const NOTES = {
  1: { title: 'Where the numbers come from', text: 'Statements are facts; everything in the centre panel is a forecast. Keep them apart in your head and the report keeps them apart on the page.', links: ['f03', 'f02'] },
  2: { title: 'Choosing a model', text: 'The right model follows the business: cash-generating companies get a DCF, banks get dividend or book-based models, asset-heavy or failing ones get asset values, start-ups the VC method. Multiples cross-check them all.', links: ['valuation', 'glossary'] },
  3: { title: 'Reading a DCF', text: 'Look at three things: the value against the price, the share of value in the terminal period, and how far the sensitivity grid moves for one point of WACC.', links: ['tvm', 'wacc'] },
  4: { title: 'Risks belong in cash flows', text: 'A risk that is likely and severe should lower the forecast it threatens, not inflate the discount rate. Adding a premium for a risk already in the cash flows counts it twice.', links: ['risk', 'formulas'] },
  5: { title: 'Scenarios over points', text: 'Report a range. The bear case should be a coherent story (slower growth, thinner margins, dearer debt together), not a worst case of everything at once.', links: ['tvm'] },
  6: { title: 'A report that can be checked', text: 'Every number in the report comes from the workspace, each sentence from a rule, and each claim carries a label: data, assumption, estimate or interpretation.', links: ['formulas', 'glossary'] },
};
function renderLearn(box) {
  box.replaceChildren();
  const n = NOTES[state.step] || NOTES[3];
  box.append(h('div', { class: 'cv-note-card' }, h('strong', {}, n.title), h('span', {}, n.text), h('span', {}, 'On the Learn platform: ', ...n.links.flatMap((k, i) => [i ? ' · ' : '', h('a', { href: ROOT + LEARN_LINKS[k].href }, LEARN_LINKS[k].label)])), h('span', { class: 'field-hint' }, `Level: ${state.level}. Each model’s tutorial (centre panel) adapts to it.`)));
}

// ---------------------------------------------------------------- report
function renderReportBox(box) {
  box.replaceChildren();
  const M = state.project.meta;
  const title = textInput({ value: M.title || '', placeholder: `${M.name || 'Company'}: company valuation`, onInput: (v) => { M.title = v; } });
  const analyst = textInput({ value: M.analyst || '', placeholder: 'Your name (optional)', onInput: (v) => { M.analyst = v; } });
  const purpose = textInput({ value: M.purpose || '', placeholder: 'e.g. to estimate fair value for a long-term investment case', onInput: (v) => { M.purpose = v; } });
  const comments = h('textarea', { class: 'textarea', placeholder: 'Analyst comments printed on the cover (optional)' }); comments.value = M.comments || ''; comments.addEventListener('input', () => { M.comments = comments.value; });
  const gen = btn('Generate company valuation report', () => {
    if (state.errors.length) { box.prepend(verdict('bad', 'Fix the data errors first.', state.errors.map((e) => e.text).join(' '))); return; }
    const all = { results: state.results, scenarios: state.scenarios, football: state.football };
    state.report = buildReport(state.project, state.A, all, { validation: state.validation, historical: state.historical, guide: state.guide, mc: state.mc, options: { title: M.title, analyst: M.analyst, comments: M.comments, purpose: M.purpose } });
    renderReport($('#cv-report-root'), state.report);
    setStep(6);
    $('#report').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }, { kind: 'sun', cls: 'cv-generate' });
  box.append(h('div', { class: 'cv-report-editable' }, field('Report title', title), field('Analyst', analyst), field('Purpose of the valuation', purpose), field('Cover comments', comments)), gen, h('p', { class: 'field-hint' }, 'The report is rebuilt from the current workspace each time you press the button, so change an assumption and regenerate to see it move.'));
}
