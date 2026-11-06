// panel-data.js — the left panel: the company, where its statements come from (example, by hand, upload, SEC EDGAR,
// a saved project), the statement editor with required/optional/derived markers, market data, peers and data checks.
import { h, $, $$, download } from '../core/dom.js?v=28';
import * as F from '../core/format.js?v=28';
import * as V from '../core/valuation.js?v=28';
import * as IO from '../core/valuation-io.js?v=28';
import * as E from '../core/valuation-edgar.js?v=28';
import { parseTable } from '../core/csv.js?v=28';
import { verdict } from '../core/ui.js?v=28';
import { state, on, recompute, scheduleRecompute, loadProject, loadExample, newProject, setHistory, addYear, removeYear, setYear, emit } from './state.js?v=28';
import { numInput, textInput, selectEl, field, block, btn, helpLink, segmented, id } from './ui.js?v=28';
import { inline } from './inline.js?v=28';

const fin = Number.isFinite;
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CAD', 'AUD', 'CHF', 'INR', 'BRL', 'SEK', 'NOK', 'DKK', 'SGD', 'HKD', 'KRW', 'MXN', 'ZAR'];
const UNITS = [{ value: '1', label: 'Whole units' }, { value: '1000', label: 'Thousands' }, { value: '1000000', label: 'Millions' }, { value: '1000000000', label: 'Billions' }];
const unitLabel = (u) => ({ 1: 'whole units', 1000: 'thousands', 1000000: 'millions', 1000000000: 'billions' })[u] || 'millions';

export function renderDataPanel(root) {
  const panel = h('section', { class: 'cv-panel cv-panel--data', 'aria-labelledby': 'cv-data-title' }, h('div', { class: 'cv-panel-head' }, h('h2', { id: 'cv-data-title' }, 'Project and data'), h('span', { class: 'muted' }, 'left panel')));
  root.append(panel);
  const sourceBox = h('div'), companyBox = h('div'), yearsBox = h('div'), marketBox = h('div'), peersBox = h('div'), checksBox = h('div');
  panel.append(
    block({ title: 'Where the data comes from', step: 1, sub: 'Try the fictional company first, then bring your own statements. Nothing leaves this browser.', children: [sourceBox] }),
    block({ title: 'Company', step: 1, children: [companyBox] }),
    block({ title: 'Financial statements', step: 1, sub: 'One column per fiscal year. Chips say what the chosen models need; <i>derived</i> lines are worked out from the others and shown in italics.', children: [yearsBox] }),
    block({ title: 'Market and company information', step: 1, children: [marketBox] }),
    block({ title: 'Comparable companies', step: 2, sub: 'Listed peers of similar size, growth, margins and risk. Figures in the project’s unit.', children: [peersBox] }),
    block({ title: 'Data checks', step: 1, children: [checksBox] }),
  );
  const renderAll = () => { renderSource(sourceBox); renderCompany(companyBox); renderYears(yearsBox); renderMarket(marketBox); renderPeers(peersBox); renderChecks(checksBox); };
  renderAll();
  on((kind) => { if (kind === 'structure') renderAll(); else if (kind === 'results') { renderChecks(checksBox); refreshDerived(yearsBox); } });
  return panel;
}

// ---------------------------------------------------------------- source
function renderSource(box) {
  box.replaceChildren();
  const P = state.project;
  const src = P.source || { kind: 'manual' };
  const kinds = [['example', 'Example company'], ['manual', 'Enter by hand'], ['upload', 'Upload CSV or Excel'], ['edgar', 'SEC EDGAR'], ['json', 'Open a saved project']];
  const current = h('p', { class: 'cv-source-card' }, h('strong', {}, src.kind === 'example' ? 'Built-in example (fictional)' : src.kind === 'edgar' ? `SEC EDGAR: ${src.entityName || P.meta.name}` : src.kind === 'upload' ? `Uploaded: ${src.document || 'file'}` : src.kind === 'json' ? `Saved project: ${src.document || ''}` : 'Entered by hand'), h('span', {}, src.note || ''), src.retrieved ? h('span', {}, `Retrieved ${src.retrieved}.`) : null, src.periods ? h('span', {}, `Periods: ${src.periods.map((p) => `FY${p.year} (${p.form} filed ${p.filed})`).join('; ')}`) : null);
  const picker = h('div', { class: 'input-actions' });
  const flows = h('div');
  const choose = (k) => {
    flows.replaceChildren();
    if (k === 'example') { loadExample(); return; }
    if (k === 'manual') { newProject(); return; }
    if (k === 'upload') flows.append(uploadFlow());
    if (k === 'edgar') flows.append(edgarFlow());
    if (k === 'json') flows.append(jsonFlow());
  };
  kinds.forEach(([k, name]) => picker.append(btn(name, () => choose(k), { kind: 'secondary', cls: 'btn-sm' })));
  box.append(current, picker, flows);
}

function fileButton(label, accept, onFile) {
  const input = h('input', { type: 'file', class: 'visually-hidden', accept });
  input.addEventListener('change', () => { const f = input.files[0]; if (f) onFile(f); input.value = ''; });
  return h('label', { class: 'btn btn-primary file-btn' }, label, input);
}
function dropZone(text, accept, onFile) {
  const z = h('div', { class: 'cv-drop' }, h('p', {}, text), fileButton('Choose a file', accept, onFile));
  z.addEventListener('dragover', (e) => { e.preventDefault(); z.classList.add('is-over'); });
  z.addEventListener('dragleave', () => z.classList.remove('is-over'));
  z.addEventListener('drop', (e) => { e.preventDefault(); z.classList.remove('is-over'); const f = e.dataTransfer.files[0]; if (f) onFile(f); });
  return z;
}

// ---------------------------------------------------------------- upload: CSV or Excel → mapping review → apply
function uploadFlow() {
  const wrap = h('div', { class: 'cv-list-editor' });
  const err = h('p', { class: 'error-text', role: 'alert' });
  const review = h('div');
  wrap.append(h('p', { class: 'cv-sub' }, 'A statement table with the fiscal years across the columns (FY2023, 2024 …) and one line per row, or one row per year with the lines as columns. CSV, TSV or .xlsx (read here with no upload). Figures in whole units, thousands or millions; the studio guesses and you confirm.'), dropZone('Drop a CSV or Excel file here', '.csv,.tsv,.txt,.xlsx,text/csv', handle), err, review);
  async function handle(file) {
    err.textContent = ''; review.replaceChildren();
    if (file.size > 25 * 1024 * 1024) { err.textContent = 'That file is over 25 MB.'; return; }
    try {
      if (/\.xlsx$/i.test(file.name)) {
        const wb = await IO.readXlsx(await file.arrayBuffer());
        if (!wb.sheets.length) throw new Error('No worksheets found.');
        const pick = selectEl(wb.sheets.map((s, i) => ({ value: String(i), label: `${s.name} (${s.rows.length} rows)` })), '0', () => show(parseTable(IO.rowsToCSV(wb.sheets[+pick.value].rows)), `${file.name} › ${wb.sheets[+pick.value].name}`));
        review.append(field('Worksheet', pick));
        show(parseTable(IO.rowsToCSV(wb.sheets[0].rows)), `${file.name} › ${wb.sheets[0].name}`);
      } else show(parseTable(await file.text()), file.name);
    } catch (e) { err.textContent = e.message; }
  }
  function show(table, docName) {
    $('.cv-map-review', review)?.remove();
    const m = IO.mapStatementTable(table);
    const box = h('div', { class: 'cv-map-review cv-list-editor' });
    review.append(box);
    if (m.error) { box.append(verdict('bad', 'Could not read the table.', m.error)); return; }
    const unitSel = selectEl(UNITS, String(m.unitGuess.unit), () => {});
    const mode = segmented(id('merge'), [{ id: 'replace', name: 'Replace the current years' }, { id: 'merge', name: 'Merge into them' }], 'replace', () => {});
    const fieldOptions = [{ value: '', label: '— ignore —' }, ...V.FIELDS.map((f) => ({ value: f.id, label: f.label }))];
    const rows = m.rows;
    const mapTable = h('table', { class: 'data-table cv-map' }, h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Line in your file'), h('th', { scope: 'col' }, 'Maps to'), m.years.map((y) => h('th', { scope: 'col', class: 'is-num' }, String(y))))),
      h('tbody', {}, rows.map((r) => { const sel = selectEl(fieldOptions, r.field || '', (v) => { r.field = v || null; }); return h('tr', { class: r.field ? '' : 'is-unmapped' }, h('th', { scope: 'row' }, r.label), h('td', {}, sel), r.values.map((v) => h('td', { class: 'is-num' }, fin(v) ? F.num(v, Math.abs(v) >= 100 ? 0 : 2) : '—'))); })));
    const apply = btn('Use these statements', () => {
      const unit = +unitSel.value;
      const target = state.project.meta.unit || 1e6;
      const chosen = rows.filter((r) => r.field);
      const dup = chosen.map((r) => r.field).filter((f, i, a) => a.indexOf(f) !== i);
      if (dup.length) { box.prepend(verdict('bad', 'Two lines map to the same field.', `${[...new Set(dup)].map(V.label).join(', ')}: change one of them to “ignore” or another line.`)); return; }
      const merge = $('input:checked', mode).value === 'merge';
      const applied = IO.applyMapping(m, rows, { unit, targetUnit: target, existing: merge ? state.project.history : [] });
      const P = state.project;
      P.history = applied.history;
      P.source = { kind: 'upload', note: `Uploaded statements (${m.orientation.replace(/-/g, ' ')}; figures read as ${unitLabel(unit)} and converted to ${unitLabel(target)}).`, document: docName, retrieved: new Date().toISOString().slice(0, 10), mapping: chosen.map((r) => ({ label: r.label, field: r.field })) };
      recompute(); emit('structure');
    }, { kind: 'primary' });
    box.append(
      h('p', { class: 'cv-sub' }, `${m.orientation === 'years-in-columns' ? 'Years found in the column headings' : 'Years found down the first column'}: ${m.years.join(', ')}. ${m.nRows} rows read. Unit guess: ${m.unitGuess.label} (${m.unitGuess.why}).`),
      h('ul', { class: 'cv-validation', hidden: !m.warnings.length }, m.warnings.map((w) => h('li', { class: 'is-warn' }, w))),
      h('div', { class: 'cv-inline-fields' }, field('Figures in the file are in', unitSel), h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Existing years'), mode)),
      h('div', { class: 'table-scroll' }, mapTable),
      h('p', { class: 'field-hint' }, 'Blank cells stay blank; nothing is estimated. Capital expenditure shown as a negative outflow is used by its size and disclosed in the data checks.'),
      h('div', { class: 'input-actions' }, apply));
  }
  return wrap;
}

// ---------------------------------------------------------------- SEC EDGAR
function edgarFlow() {
  const wrap = h('div', { class: 'cv-list-editor' });
  const q = textInput({ placeholder: 'Ticker (AAPL), company name, or CIK', ariaLabel: 'Ticker, company name or CIK' });
  const results = h('div'), detail = h('div');
  const look = btn('Look up', () => {
    results.replaceChildren(); detail.replaceChildren();
    const hits = E.lookupTicker(q.value);
    if (!hits.length) { results.append(verdict('warn', 'No match in the built-in list.', 'The list holds 160 large SEC registrants. For any other company, find its CIK on EDGAR’s company search and enter the number here.'), h('p', {}, h('a', { href: E.companySearchUrl(q.value), target: '_blank', rel: 'noopener' }, 'Search EDGAR for this company (opens sec.gov)'))); return; }
    results.append(h('ul', { class: 'cv-validation' }, hits.map((x) => h('li', { class: 'is-info' }, btn(`${x.ticker ? `${x.ticker} · ` : ''}${x.name} (CIK ${x.cik})`, () => pick(x), { cls: 'btn-sm' })))));
  }, { kind: 'primary' });
  q.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); look.click(); } });
  wrap.append(h('p', { class: 'cv-sub' }, inline('US-listed companies file XBRL financial data that SEC EDGAR publishes as JSON. The studio reads the <b>company facts</b> document (every annual 10-K figure), maps the tags to its fields and records the filing, period and retrieval date for each year. The browser can read EDGAR’s <i>submissions</i> endpoint directly, but the XBRL endpoints do not allow cross-origin requests from another website, so when the direct fetch is blocked you open the JSON link and upload the file: the mapping then runs here, identically.')), h('div', { class: 'cv-inline-fields' }, field('Company', q), look), results, detail,
    h('p', { class: 'field-hint' }, 'SEC asks automated clients to identify themselves and to stay under ten requests a second; the studio makes at most two per lookup. ', h('a', { href: E.EDGAR_POLICY_URL, target: '_blank', rel: 'noopener' }, 'Accessing EDGAR data'), ' · ', h('a', { href: E.EDGAR_API_DOC_URL, target: '_blank', rel: 'noopener' }, 'EDGAR APIs'), '.'));
  async function pick(x) {
    detail.replaceChildren(h('p', { class: 'note' }, `Reading SEC submissions for CIK ${x.cik}…`));
    let subs = null;
    try { subs = await E.fetchSubmissions(x.cik); } catch (e) { subs = null; detail.replaceChildren(verdict('warn', 'Could not read the submissions endpoint.', `${e.message} The company facts can still be uploaded below.`)); }
    const card = h('div', { class: 'cv-source-card' });
    if (subs) card.append(h('strong', {}, `${subs.name} (CIK ${subs.cik})`), h('span', {}, `SIC ${subs.sic || '—'} ${subs.sicDescription || ''} · fiscal year ends ${subs.fiscalYearEnd ? `${subs.fiscalYearEnd.slice(0, 2)}/${subs.fiscalYearEnd.slice(2)}` : '—'} · tickers ${subs.tickers.join(', ') || '—'}`), h('span', {}, 'Recent annual reports:'), h('ul', { class: 'cv-edgar-filings' }, subs.tenKs.map((k) => h('li', {}, h('a', { href: k.url, target: '_blank', rel: 'noopener' }, `${k.form} for the period ending ${k.period}, filed ${k.filed}`)))));
    const status = h('div');
    const upload = h('div');
    detail.replaceChildren(card, status, upload);
    status.append(h('p', { class: 'note' }, 'Trying to fetch the company facts directly…'));
    try {
      const facts = await E.fetchFacts(x.cik);
      status.replaceChildren();
      applyFacts(facts, subs, status, 'fetched directly from data.sec.gov');
    } catch (e) {
      status.replaceChildren(verdict(e.corsBlocked ? 'warn' : 'bad', e.corsBlocked ? 'Direct fetch blocked by the browser, as expected.' : 'The fetch failed.', e.message));
      upload.append(h('ol', { class: 'cv-edgar-filings' }, h('li', {}, 'Open ', h('a', { href: E.factsUrl(x.cik), target: '_blank', rel: 'noopener' }, `the company facts JSON for CIK ${x.cik}`), ' (sec.gov shows it as text).'), h('li', {}, 'Save the page as a .json file (File → Save page as).'), h('li', {}, 'Upload it here. It is read in this tab and never sent anywhere.')), dropZone('Drop the companyfacts JSON here', '.json,application/json', async (f) => { try { const facts = JSON.parse(await f.text()); applyFacts(facts, subs, status, `uploaded file ${f.name}`); } catch (err) { status.replaceChildren(verdict('bad', 'That file is not the company facts JSON.', err.message)); } }));
    }
  }
  function applyFacts(facts, subs, status, how) {
    const r = E.factsToHistory(facts, { years: 6, unit: 1e6 });
    if (r.error) { status.replaceChildren(verdict('bad', 'No usable annual figures.', r.error)); return; }
    const preview = h('div', { class: 'table-scroll' }, h('table', { class: 'data-table cv-map' }, h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Line'), r.history.map((y) => h('th', { scope: 'col', class: 'is-num' }, String(y.year))))), h('tbody', {}, ['revenue', 'ebit', 'netIncome', 'totalAssets', 'equity', 'cfo', 'capex', 'shares'].filter((k) => r.history.some((y) => fin(y[k]))).map((k) => h('tr', {}, h('th', { scope: 'row' }, `${V.label(k)} ← ${r.source.tags[k] || ''}`), r.history.map((y) => h('td', { class: 'is-num' }, fin(y[k]) ? F.num(y[k], 1) : '—')))))));
    const apply = btn('Use these statements', () => {
      const P = state.project;
      P.history = r.history;
      P.meta.name = facts.entityName || P.meta.name; P.meta.currency = r.source.currency; P.meta.unit = 1e6; P.meta.unitLabel = 'millions';
      if (subs) { P.meta.ticker = subs.tickers[0] || ''; P.meta.fiscalYearEnd = subs.fiscalYearEnd ? `${subs.fiscalYearEnd.slice(0, 2)}/${subs.fiscalYearEnd.slice(2)}` : P.meta.fiscalYearEnd; }
      P.source = { ...r.source, kind: 'edgar', document: `SEC EDGAR company facts (${how})`, sic: subs?.sic, sicDescription: subs?.sicDescription, note: r.source.note };
      P.market = { ...P.market, sharePrice: P.market.sharePrice };
      state.A = V.defaultAssumptions(P);
      recompute(); emit('structure');
      status.append(verdict('good', 'Statements loaded.', `${r.history.length} fiscal years, in USD millions. Enter the share price (and its date) under Market data: EDGAR has no prices.`));
    }, { kind: 'primary' });
    status.replaceChildren(h('p', { class: 'cv-sub' }, `${facts.entityName}: ${r.history.length} fiscal years (${r.history[0].year}–${r.history[r.history.length - 1].year}) from ${how}, retrieved ${r.source.retrieved}.`), h('ul', { class: 'cv-validation', hidden: !r.warnings.length }, r.warnings.map((w) => h('li', { class: 'is-warn' }, w))), preview, h('p', { class: 'field-hint' }, 'The latest filed figure wins for each fiscal year, so restated years replace the originals. Every mapped tag and filing is listed in the report’s appendix.'), h('div', { class: 'input-actions' }, apply));
  }
  return wrap;
}

// ---------------------------------------------------------------- saved JSON
function jsonFlow() {
  const wrap = h('div', { class: 'cv-list-editor' });
  const err = h('p', { class: 'error-text', role: 'alert' });
  wrap.append(h('p', { class: 'cv-sub' }, 'A project saved with the Save button: company, statements, models, assumptions, risks and scenarios.'), dropZone('Drop a saved project (.json) here', '.json,application/json', async (f) => {
    const r = IO.parseProject(await f.text());
    if (r.error) { err.textContent = r.error; return; }
    err.textContent = '';
    r.project.source = { ...(r.project.source || {}), kind: r.project.source?.kind || 'json', document: f.name };
    loadProject(r.project, r.assumptions);
  }), err);
  return wrap;
}

// ---------------------------------------------------------------- company
function renderCompany(box) {
  box.replaceChildren();
  const M = state.project.meta;
  const set = (k) => (v) => { M[k] = v; scheduleRecompute(); };
  const grid = h('div', { class: 'cv-field-grid' },
    field('Company name', textInput({ value: M.name, onInput: (v) => { M.name = v; scheduleRecompute(); } })),
    field('Ticker', textInput({ value: M.ticker || '', onInput: set('ticker') })),
    field('Industry', selectEl(V.INDUSTRIES, M.industry || 'general', (v) => { M.industry = v; recompute(); emit('structure'); }), { hint: 'Drives the model selection guide.' }),
    field('Stage', selectEl(V.MATURITY, M.maturity || 'mature', (v) => { M.maturity = v; recompute(); emit('structure'); })),
    field('Country', textInput({ value: M.country || '', onInput: set('country') })),
    field('Currency', selectEl(CURRENCIES.map((c) => ({ value: c, label: c })), M.currency || 'USD', (v) => { M.currency = v; recompute(); emit('structure'); })),
    field('Figures are in', selectEl(UNITS, String(M.unit || 1e6), (v) => { M.unit = +v; M.unitLabel = unitLabel(+v); recompute(); emit('structure'); }), { hint: 'Shares use the same unit.' }),
    field('Fiscal year end', textInput({ value: M.fiscalYearEnd || '', placeholder: 'December', onInput: set('fiscalYearEnd') })),
    field('Valuation date', textInput({ value: M.valuationDate || '', placeholder: 'YYYY-MM-DD', onInput: set('valuationDate') })),
  );
  const desc = h('textarea', { class: 'textarea', style: { minHeight: '64px', fontFamily: 'inherit', fontSize: 'inherit' }, placeholder: 'What the company sells, to whom and where (used in the report’s overview).' });
  desc.value = M.business || '';
  desc.addEventListener('input', () => { M.business = desc.value; scheduleRecompute(); });
  box.append(grid, h('div', { class: 'field is-adv-only' }, h('label', { for: (desc.id = id('desc')) }, 'Business description'), desc));
}

// ---------------------------------------------------------------- statements
const GROUPS = [['is', 'Income statement'], ['bs', 'Balance sheet'], ['cf', 'Cash flow statement']];
function requirementChips() {
  const models = state.project.models || {};
  const need = new Map(), nice = new Map();
  Object.entries(V.REQUIRES).forEach(([m, r]) => { if (!models[m]) return; r.need.forEach((k) => need.set(k, [...(need.get(k) || []), V.MODELS[m].short])); r.nice.forEach((k) => nice.set(k, [...(nice.get(k) || []), V.MODELS[m].short])); });
  return { need, nice };
}
function renderYears(box) {
  box.replaceChildren();
  const P = state.project, H = P.history;
  const { need, nice } = requirementChips();
  const derivedBy = state.historical.map((x) => x.how);
  const derivedVals = state.historical.map((x) => x.p);
  const table = h('table', { class: 'cv-grid' });
  const head = h('tr', {}, h('th', { scope: 'col' }, 'Line'));
  H.forEach((y, i) => {
    const yin = numInput({ value: y.year, digits: 0, ariaLabel: `Fiscal year of column ${i + 1}`, placeholder: 'Year', onInput: (v) => { if (Number.isInteger(v) && v > 1900 && v < 2200) { P.history[i].year = v; scheduleRecompute(); } } });
    yin.addEventListener('change', () => { const v = Number(yin.value); if (Number.isInteger(v)) setYear(i, v); });
    head.append(h('th', { scope: 'col' }, h('div', { class: 'year-head' }, yin, btn('Remove', () => removeYear(i), { cls: 'btn-sm', title: `Remove ${y.year}` }))));
  });
  table.append(h('thead', {}, head));
  const tb = h('tbody');
  GROUPS.forEach(([st, name]) => {
    tb.append(h('tr', { class: 'cv-group' }, h('th', { scope: 'row', colspan: H.length + 1 }, name)));
    V.FIELDS.filter((f) => f.st === st).forEach((f) => {
      const chips = [];
      if (need.has(f.id)) chips.push(h('span', { class: 'cv-chip is-req', title: `Needed by ${need.get(f.id).join(', ')}` }, 'required'));
      else if (nice.has(f.id)) chips.push(h('span', { class: 'cv-chip is-opt', title: `Useful for ${nice.get(f.id).join(', ')}` }, 'optional'));
      else if (f.derive) chips.push(h('span', { class: 'cv-chip is-der' }, 'derived'));
      else if (f.opt) chips.push(h('span', { class: 'cv-chip is-na' }, 'if available'));
      const row = h('tr', { 'data-field': f.id }, h('th', { scope: 'row', title: f.hint || '' }, f.label, ...chips));
      H.forEach((y, i) => {
        const raw = y[f.id];
        const der = !fin(raw) && fin(derivedVals[i]?.[f.id]) ? derivedVals[i][f.id] : NaN;
        const inp = numInput({ value: fin(raw) ? raw : NaN, ariaLabel: `${f.label}, ${y.year}`, placeholder: fin(der) ? F.num(der, 1) : '', derived: false, title: fin(der) ? `Derived: ${derivedBy[i]?.[f.id] || ''}` : (f.hint || ''), onInput: (v) => setHistory(i, f.id, v) });
        if (fin(der)) inp.classList.add('is-derived');
        inp.dataset.year = i;
        row.append(h('td', {}, inp));
      });
      tb.append(row);
    });
  });
  table.append(tb);
  const actions = h('div', { class: 'cv-years-actions' }, btn('Add a year', () => addYear(), { kind: 'primary', cls: 'btn-sm' }), btn('Download as CSV', () => download(`${(P.meta.name || 'company').replace(/\s+/g, '-').toLowerCase()}-statements.csv`, IO.historyCSV(P)), { cls: 'btn-sm' }), h('span', { class: 'field-hint' }, `${P.meta.currency || 'USD'} ${P.meta.unitLabel || 'millions'}; shares in ${P.meta.unitLabel || 'millions'}. Blank means unknown.`));
  box.append(actions, h('div', { class: 'cv-grid-wrap' }, table));
}
/** After a recompute, refresh the derived placeholders without rebuilding the inputs the user is typing in. */
function refreshDerived(box) {
  const derivedVals = state.historical.map((x) => x.p), how = state.historical.map((x) => x.how);
  $$('tr[data-field]', box).forEach((row) => {
    const f = row.dataset.field;
    $$('input', row).forEach((inp) => {
      const i = +inp.dataset.year, raw = state.project.history[i]?.[f];
      const der = !fin(raw) && fin(derivedVals[i]?.[f]) ? derivedVals[i][f] : NaN;
      inp.placeholder = fin(der) ? F.num(der, 1) : '';
      inp.classList.toggle('is-derived', fin(der));
      if (fin(der)) inp.title = `Derived: ${how[i]?.[f] || ''}`;
    });
  });
}

// ---------------------------------------------------------------- market
function renderMarket(box) {
  box.replaceChildren();
  const M = state.project.market, meta = state.project.meta;
  const { m, how } = V.market(state.project);
  const set = (k) => (v) => { if (fin(v)) M[k] = v; else delete M[k]; scheduleRecompute(); };
  const grid = h('div', { class: 'cv-field-grid' },
    field(`Share price (${meta.currency || 'USD'})`, numInput({ value: M.sharePrice, onInput: set('sharePrice') }), { hint: 'Per share, in whole currency.' }),
    field('Price date', textInput({ value: M.priceDate || '', placeholder: 'YYYY-MM-DD', onInput: (v) => { M.priceDate = v; scheduleRecompute(); } })),
    field(`Shares outstanding (${meta.unitLabel || 'millions'})`, numInput({ value: M.sharesOutstanding, onInput: set('sharesOutstanding'), placeholder: fin(m.sharesOutstanding) && !fin(M.sharesOutstanding) ? F.num(m.sharesOutstanding, 2) : '' }), { hint: how.sharesOutstanding ? `Blank: ${how.sharesOutstanding}.` : 'Diluted, today.' }),
    field('Beta', numInput({ value: M.beta, onInput: (v) => { set('beta')(v); if (fin(v)) { state.A.discount.beta = v; } } }), { help: 'stocks', hint: 'Also sets the CAPM beta in the assumptions.' }),
    field('Risk-free rate', numInput({ value: M.rf, scale: 100, onInput: (v) => { set('rf')(v); if (fin(v)) state.A.discount.rf = v; } }), { hint: '% a year; a long government bond yield.' }),
    field('Equity risk premium', numInput({ value: M.erp, scale: 100, onInput: (v) => { set('erp')(v); if (fin(v)) state.A.discount.erp = v; } }), { hint: '%; Damodaran publishes estimates each January.', help: 'wacc' }),
    field('Pre-tax cost of debt', numInput({ value: M.kd, scale: 100, onInput: (v) => { set('kd')(v); if (fin(v)) state.A.discount.kd = v; } }), { hint: '%; the yield on the company’s bonds or loans.' }),
  );
  const derived = h('dl', { class: 'cv-keyvals' }, h('div', {}, h('dt', {}, 'Market capitalisation'), h('dd', {}, fin(m.marketCap) ? `${meta.currency} ${F.num(m.marketCap, 1)}${suffix(meta)}` : '—')), h('div', {}, h('dt', {}, 'Enterprise value at market'), h('dd', {}, fin(m.ev) ? `${meta.currency} ${F.num(m.ev, 1)}${suffix(meta)}` : '—')));
  box.append(grid, derived);
}
const suffix = (meta) => ({ 1e9: 'bn', 1e6: 'm', 1e3: 'k' }[meta.unit] || '');

// ---------------------------------------------------------------- peers
const PEER_FIELDS = [['price', 'Price'], ['shares', 'Shares'], ['debt', 'Debt'], ['cash', 'Cash'], ['revenue', 'Revenue'], ['ebitda', 'EBITDA'], ['ebit', 'EBIT'], ['netIncome', 'Net income'], ['equity', 'Book equity'], ['fcf', 'Free cash flow']];
function renderPeers(box) {
  box.replaceChildren();
  const P = state.project;
  const list = h('div', { class: 'cv-list-editor' });
  P.peers.forEach((pe, i) => {
    const row = h('div', { class: 'cv-list-row' }, field('Company', textInput({ value: pe.name || '', cls: 'input-name', onInput: (v) => { pe.name = v; scheduleRecompute(); } })));
    PEER_FIELDS.forEach(([k, lab]) => row.append(field(lab, numInput({ value: pe[k], onInput: (v) => { if (fin(v)) pe[k] = v; else delete pe[k]; scheduleRecompute(); } }))));
    row.append(btn('Remove', () => { P.peers.splice(i, 1); recompute(); emit('structure'); }, { cls: 'btn-sm' }));
    list.append(row);
  });
  box.append(list, h('div', { class: 'input-actions' }, btn('Add a peer', () => { P.peers.push({ name: '' }); recompute(); emit('structure'); }, { kind: 'primary', cls: 'btn-sm' })), h('p', { class: 'field-hint' }, 'Price per share in whole currency; everything else in the project’s unit. Market cap and EV are worked out from these.'));
}

// ---------------------------------------------------------------- checks
function renderChecks(box) {
  box.replaceChildren();
  const v = state.validation;
  const main = v.filter((x) => x.level !== 'info'), infos = v.filter((x) => x.level === 'info');
  if (!main.length) box.append(verdict('good', 'The statements pass the checks.', `${state.project.history.length} fiscal year${state.project.history.length === 1 ? '' : 's'}; totals and relationships agree within 0.5%.`));
  else box.append(h('ul', { class: 'cv-validation' }, main.map((x) => h('li', { class: `is-${x.level}` }, x.text))));
  const missing = Object.keys(V.MODELS).filter((m) => state.project.models?.[m]).map((m) => ({ m, ...V.missingFor(state.project, m) })).filter((x) => x.missing.length);
  if (missing.length) box.append(h('ul', { class: 'cv-validation' }, missing.map((x) => h('li', { class: 'is-warn' }, `${V.MODELS[x.m].short} still needs: ${x.missing.map((k) => ({ sharesOutstanding: 'shares outstanding', sharePrice: 'share price', beta: 'beta' }[k] || V.label(k))).join(', ')}.`))));
  if (infos.length) box.append(h('details', { class: 'cv-infos' }, h('summary', {}, `${infos.length} derived figure${infos.length === 1 ? '' : 's'} (how each was worked out)`), h('ul', { class: 'cv-validation' }, infos.map((x) => h('li', { class: 'is-info' }, x.text)))));
}
