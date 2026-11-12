// app.js — Company Intelligence: the import workflow. A workbook is read in a Web Worker (every row of every sheet),
// each sheet is shown with its row count and a scrollable preview of ALL its rows, the proposed mappings are reviewed
// and corrected, and the validated figures become the company project the dashboard and the Valuation Studio share.
import { h, $, $$, store } from '../core/dom.js?v=31';
import * as F from '../core/format.js?v=31';
import * as V from '../core/valuation.js?v=31';
import * as W from '../core/workbook.js?v=31';
import { verdict } from '../core/ui.js?v=31';
import { numInput, textInput, selectEl, field, segmented, btn, id } from '../valuation/ui.js?v=31';
import * as DB from './store.js?v=31';
import { renderDashboard } from './dashboard.js?v=31';

const fin = Number.isFinite;
export const state = { wb: null, analysis: null, settings: null, built: null, project: null, lineage: {}, issues: [], A: null, market: {}, valuationOn: false, mc: null, savedId: null, readMs: 0, activeSheet: null };
const KIND = { statement: 'Financial statement', records: 'Financial records (long)', dataset: 'Operational dataset', notes: 'Notes', empty: 'Empty', unknown: 'Not recognised' };
const UNITS = [{ value: '', label: 'Not stated' }, { value: '1', label: 'Whole units' }, { value: '1000', label: 'Thousands' }, { value: '1000000', label: 'Millions' }, { value: '1000000000', label: 'Billions' }];
const CURS = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CAD', 'AUD', 'CHF', 'INR', 'BRL', 'MXN', 'SEK', 'NOK', 'DKK', 'KRW', 'HKD', 'SGD', 'ZAR'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let root, importBox, bookBox, mapBox, dashBox, worker = null, reqId = 0;

export function initIntel(el) {
  root = el;
  importBox = h('section', { class: 'ci-step', id: 'ci-import' }); bookBox = h('section', { class: 'ci-step', id: 'ci-workbook' }); mapBox = h('section', { class: 'ci-step', id: 'ci-mapping' }); dashBox = h('section', { class: 'ci-step', id: 'ci-dashboard' });
  root.replaceChildren(importBox, bookBox, mapBox, dashBox);
  renderImport();
  // a file dropped on the homepage, or a saved project named in the address
  const q = new URLSearchParams(location.search);
  if (q.get('file') === 'pending') DB.takePendingFile().then((rec) => { if (rec) readBuffer(rec.buffer, rec.name); });
  else if (q.get('sample')) loadSample(q.get('sample') === 'xls' ? 'helio-foods-group.xls' : 'helio-foods-group.xlsx');
  else if (q.get('from') === 'studio') useStudioProject();
}

// ================================================================ step 1: bring a workbook
function renderImport() {
  const input = h('input', { type: 'file', class: 'visually-hidden', accept: '.xls,.xlsx,.xlsm,.xlsb,.ods,.csv,.tsv,.txt' });
  input.addEventListener('change', () => { const f = input.files[0]; if (f) readFile(f); input.value = ''; });
  const drop = h('div', { class: 'ci-drop', tabindex: '0', role: 'button', 'aria-label': 'Choose a workbook to analyse' },
    h('p', { class: 'ci-drop-title' }, 'Drop a workbook here'),
    h('p', { class: 'ci-drop-sub' }, 'Excel .xls or .xlsx, or CSV / TSV. Every sheet and every row is read, in this browser. Nothing is uploaded.'),
    h('label', { class: 'btn btn-sun file-btn' }, 'Choose a file', input));
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('is-over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('is-over'));
  drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('is-over'); const f = e.dataTransfer.files[0]; if (f) readFile(f); });
  drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
  const saved = h('div', { class: 'ci-saved' });
  const progress = h('div', { class: 'ci-progress', hidden: true, role: 'status', 'aria-live': 'polite' }, h('div', { class: 'ci-progress-bar' }, h('span')), h('p', { class: 'ci-progress-text' }));
  importBox.replaceChildren(
    h('div', { class: 'ci-step-head' }, h('span', { class: 'ci-step-n' }, '1'), h('h3', {}, 'Bring the company’s data')),
    h('div', { class: 'ci-import-grid' }, drop,
      h('div', { class: 'ci-import-side' },
        h('p', { class: 'field-label' }, 'Or start from'),
        btn('Sample workbook, .xlsx (26,581 rows, 6 sheets)', () => loadSample('helio-foods-group.xlsx'), { cls: 'btn-sm' }),
        btn('Sample workbook, .xls (11,575 rows, 4 sheets)', () => loadSample('helio-foods-group.xls'), { cls: 'btn-sm' }),
        btn('The project open in the Valuation Studio', () => useStudioProject(), { cls: 'btn-sm' }),
        h('p', { class: 'field-hint' }, 'The samples are Helio Foods Group, a fictional company: three statements, 11,520 monthly records and, in the .xlsx, 15,001 order lines with a few planted data problems.'),
        saved)),
    progress, h('div', { class: 'ci-import-msg' }));
  refreshSaved(saved);
}
async function refreshSaved(box = $('.ci-saved', importBox)) {
  if (!box) return;
  const list = await DB.listProjects();
  box.replaceChildren();
  if (!list.length) return;
  box.append(h('p', { class: 'field-label' }, 'Saved in this browser'), h('ul', { class: 'ci-saved-list' }, list.map((p) => h('li', {}, btn(`${p.name} · ${p.summary || ''} · ${String(p.savedAt).slice(0, 10)}`, async () => { const rec = await DB.loadProject(p.id); if (rec) openSaved(rec); }, { cls: 'btn-sm' }), btn('Delete', async () => { await DB.deleteProject(p.id); refreshSaved(); }, { cls: 'btn-sm' })))));
}
function setProgress(frac, text) {
  const p = $('.ci-progress', importBox); if (!p) return;
  p.hidden = frac === null;
  if (frac !== null) { $('.ci-progress-bar span', p).style.width = `${Math.round(Math.max(0.03, Math.min(1, frac)) * 100)}%`; $('.ci-progress-text', p).textContent = text; }
}
const msg = (node) => { const m = $('.ci-import-msg', importBox); if (m) m.replaceChildren(node || ''); };

async function loadSample(name) {
  msg(); setProgress(0.05, `Fetching ${name}`);
  try { const r = await fetch(new URL(`../../data/samples/${name}`, import.meta.url)); if (!r.ok) throw new Error(`The sample could not be loaded (${r.status}).`); readBuffer(await r.arrayBuffer(), name); }
  catch (e) { setProgress(null); msg(verdict('bad', 'The sample did not load.', e.message)); }
}
function readFile(file) {
  if (file.size > 150 * 1024 * 1024) { msg(verdict('bad', 'That file is over 150 MB.', 'Browsers run out of memory reading workbooks this large. Export the sheets you need to a smaller workbook or to CSV.')); return; }
  setProgress(0.03, `Opening ${file.name}`);
  file.arrayBuffer().then((buf) => readBuffer(buf, file.name)).catch((e) => { setProgress(null); msg(verdict('bad', 'The file could not be opened.', e.message)); });
}
function readBuffer(buffer, name) {
  msg(); bookBox.replaceChildren(); mapBox.replaceChildren(); dashBox.replaceChildren();
  const t0 = performance.now();
  const done = (wb) => { state.readMs = Math.round(performance.now() - t0); setProgress(1, 'Read'); setTimeout(() => setProgress(null), 400); useWorkbook(wb); };
  const fail = (m) => { setProgress(null); msg(verdict('bad', 'This file could not be read.', `${m} If it is an Excel file, open it in Excel and save it again as .xlsx; if it is text, save it as CSV (UTF-8).`)); };
  try {
    if (worker) worker.terminate();
    worker = new Worker(new URL('../core/workbook-worker.js?v=31', import.meta.url));
    const my = ++reqId;
    worker.onmessage = (e) => {
      const d = e.data; if (d.id !== my) return;
      if (d.type === 'progress') setProgress(d.stage === 'parse' ? 0.15 : 0.2 + 0.75 * (d.total ? d.done / d.total : 1), `${d.text}${d.total > 1 ? ` (${F.int(d.done)} of ${F.int(d.total)} rows)` : ''}`);
      else if (d.type === 'done') done(d.workbook);
      else fail(d.message);
    };
    worker.onerror = (e) => fail(e.message || 'The reader stopped.');
    setProgress(0.1, `Reading ${name}`);
    worker.postMessage({ id: my, name, buffer }, [buffer]);
  } catch (e) { fail(e.message); }
}

function useWorkbook(wb) {
  state.wb = wb; state.analysis = W.analyseWorkbook(wb); state.settings = W.defaultSettings(state.analysis);
  state.built = null; state.project = null; state.savedId = null; state.valuationOn = false; state.mc = null; state.market = {};
  state.activeSheet = (state.analysis.sheets.find((s) => s.kind === 'statement') || state.analysis.sheets[0])?.name;
  renderWorkbook(); renderMapping(); dashBox.replaceChildren();
  bookBox.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}
function useStudioProject() {
  const saved = store.get('si:cv:project', null);
  if (!saved?.project?.history?.length) { msg(verdict('warn', 'Nothing to bring over.', 'The Valuation Studio has no saved project in this browser yet. Open it once, or import a workbook here.')); return; }
  state.wb = null; state.analysis = null; bookBox.replaceChildren(); mapBox.replaceChildren();
  openProject(JSON.parse(JSON.stringify(saved.project)), {}, [{ level: 'info', text: 'This project came from the Company Valuation Studio; its figures were entered or imported there.' }], saved.A || null);
}
function openSaved(rec) {
  state.wb = null; state.analysis = null; bookBox.replaceChildren(); mapBox.replaceChildren();
  state.savedId = rec.id; state.market = rec.market || {};
  openProject(rec.project, rec.lineage || {}, rec.issues || [], rec.A || null, rec.valuationOn);
}
function openProject(project, lineage, issues, A = null, valuationOn = false) {
  state.project = project; state.lineage = lineage; state.issues = issues;
  state.market = { ...(project.market || {}), ...state.market };
  try { state.A = A || V.defaultAssumptions(project); } catch { state.A = null; }
  state.valuationOn = !!valuationOn && !!state.A; state.mc = null;
  renderDashboard(dashBox, state, { onSave: saveCurrent, onReopenMapping: state.wb ? () => mapBox.scrollIntoView({ block: 'start' }) : null });
  dashBox.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}
async function saveCurrent() {
  const P = state.project, ys = P.history.map((x) => x.year);
  state.savedId = await DB.saveProject({ id: state.savedId || undefined, name: P.meta.name || 'Company', summary: `FY${ys[0]}–${ys[ys.length - 1]}`, project: P, lineage: state.lineage, issues: state.issues, A: state.A, market: state.market, valuationOn: state.valuationOn });
  refreshSaved();
  return state.savedId;
}

// ================================================================ step 2: what is in the workbook
function renderWorkbook() {
  const a = state.analysis, wb = state.wb;
  const head = h('div', { class: 'ci-step-head' }, h('span', { class: 'ci-step-n' }, '2'), h('h3', {}, 'What the workbook holds'));
  const totals = verdict('good', `Read all ${F.int(a.totalRows)} rows in ${a.sheets.length} sheet${a.sheets.length === 1 ? '' : 's'}.`, `${wb.name} (${a.format.toUpperCase()}, ${F.num(a.bytes / 1048576, 2)} MB, ${F.int(a.totalCells)} filled cells) in ${F.int(wb.ms ?? state.readMs)} ms. Nothing was truncated: the row counts below are the sheets’ full extent.`);
  const rows = a.sheets.map((s, i) => {
    const raw = wb.sheets[i];
    const open = btn('Preview', () => { state.activeSheet = s.name; renderPreview(); $$('.ci-sheets tr', bookBox).forEach((tr) => tr.classList.toggle('is-active', tr.dataset.sheet === s.name)); }, { cls: 'btn-sm' });
    const notes = [s.hidden ? 'hidden' : null, raw.merges ? `${raw.merges} merged` : null, raw.formulas ? `${F.int(raw.formulas)} formulas${raw.formulasNoCache ? ` (${raw.formulasNoCache} without a stored result)` : ''}` : null, raw.errorCount ? `${raw.errorCount} error cells` : null,
      s.quality?.missing ? `${F.int(s.quality.missing)} blank cells` : null, s.quality?.duplicates ? `${F.int(s.quality.duplicates)} repeated row${s.quality.duplicates === 1 ? '' : 's'}` : null, s.quality?.outliers.length ? `${s.quality.outliers.reduce((x, o) => x + o.count, 0)} abnormal value${s.quality.outliers.reduce((x, o) => x + o.count, 0) === 1 ? '' : 's'}` : null].filter(Boolean);
    return h('tr', { 'data-sheet': s.name, class: s.name === state.activeSheet ? 'is-active' : '' }, h('th', { scope: 'row' }, s.name), h('td', {}, h('span', { class: `ci-kind is-${s.kind}` }, KIND[s.kind] || s.kind), s.kind === 'statement' ? ` · ${{ is: 'income statement', bs: 'balance sheet', cf: 'cash flow' }[s.statement] || 'lines'} · ${s.periods.length} periods` : s.kind === 'records' ? ` · ${s.accounts.length} accounts` : ''),
      h('td', { class: 'is-num' }, F.int(s.nRows)), h('td', { class: 'is-num' }, F.int(s.nCols)), h('td', {}, [s.unit ? W.UNIT_NAMES[s.unit] : null, s.currency].filter(Boolean).join(', ') || '—'), h('td', {}, notes.join('; ') || '—'), h('td', {}, open));
  });
  const table = h('div', { class: 'table-scroll' }, h('table', { class: 'data-table ci-sheets' }, h('caption', { class: 'visually-hidden' }, 'Sheets in the workbook'), h('thead', {}, h('tr', {}, ['Sheet', 'Read as', 'Rows', 'Columns', 'Units stated', 'Findings', ''].map((t, i) => h('th', { scope: 'col', class: i === 2 || i === 3 ? 'is-num' : '' }, t)))), h('tbody', {}, rows)));
  const issues = a.issues.length ? h('ul', { class: 'cv-validation' }, a.issues.map((x) => h('li', { class: `is-${x.level}` }, x.text))) : null;
  bookBox.replaceChildren(head, totals, table, issues || '', h('div', { class: 'ci-preview' }));
  renderPreview();
}

/** A window onto every row of the sheet: only the rows in view are in the page, so 15,000 rows scroll smoothly. */
function renderPreview() {
  const box = $('.ci-preview', bookBox); if (!box) return;
  const i = state.analysis.sheets.findIndex((s) => s.name === state.activeSheet); if (i < 0) { box.replaceChildren(); return; }
  const sheet = state.wb.sheets[i], prof = state.analysis.sheets[i];
  const ROW = 30, MAXC = 40, nC = Math.min(sheet.nCols, MAXC), nR = sheet.nRows;
  const wrap = h('div', { class: 'ci-vt', tabindex: '0', role: 'group', 'aria-label': `All ${F.int(nR)} rows of ${sheet.name}; scroll to move through them` });
  const table = h('table', { class: 'ci-vt-table', style: { width: `${64 + nC * 150}px` } });
  const colLetter = (c) => { let s = ''; c += 1 + (sheet.c0 || 0); while (c > 0) { const m = (c - 1) % 26; s = String.fromCharCode(65 + m) + s; c = Math.floor((c - 1) / 26); } return s; };
  table.append(h('thead', {}, h('tr', {}, h('th', { class: 'ci-vt-n' }, ''), Array.from({ length: nC }, (_, c) => h('th', {}, colLetter(c))))));
  const body = h('tbody'); table.append(body); wrap.append(table);
  const fmt = (v) => (v === null || v === undefined ? '' : typeof v === 'number' ? (Number.isInteger(v) ? F.int(v) : F.num(v, Math.abs(v) < 10 ? 4 : 2)) : String(v));
  let from = -1;
  const draw = () => {
    const first = Math.max(0, Math.floor(wrap.scrollTop / ROW) - 6), count = Math.ceil((wrap.clientHeight || 380) / ROW) + 14, last = Math.min(nR, first + count);
    if (first === from) return; from = first;
    const frag = document.createDocumentFragment();
    if (first > 0) frag.append(h('tr', { style: { height: `${first * ROW}px` }, 'aria-hidden': 'true' }, h('td', { colspan: nC + 1 })));
    for (let r = first; r < last; r++) {
      const row = sheet.rows[r], tr = h('tr', { class: r === prof.headerRow ? 'is-header' : '' }, h('th', { class: 'ci-vt-n', scope: 'row' }, String((sheet.r0 || 0) + r + 1)));
      for (let c = 0; c < nC; c++) { const v = row[c]; tr.append(h('td', { class: typeof v === 'number' ? 'is-num' : v === null ? 'is-blank' : '' , title: typeof v === 'string' && v.length > 22 ? v : null }, fmt(v))); }
      frag.append(tr);
    }
    if (last < nR) frag.append(h('tr', { style: { height: `${(nR - last) * ROW}px` }, 'aria-hidden': 'true' }, h('td', { colspan: nC + 1 })));
    body.replaceChildren(frag);
  };
  wrap.addEventListener('scroll', () => requestAnimationFrame(draw));
  const jump = numInput({ value: NaN, digits: 0, placeholder: 'row', ariaLabel: 'Jump to row', onInput: (v) => { if (fin(v)) { wrap.scrollTop = Math.max(0, Math.min(nR - 1, v - 1 - (sheet.r0 || 0))) * ROW; } } });
  box.replaceChildren(h('div', { class: 'ci-preview-head' }, h('p', {}, h('strong', {}, sheet.name), ` · ${F.int(nR)} rows × ${F.int(sheet.nCols)} columns${sheet.nCols > MAXC ? ` (the preview shows the first ${MAXC} columns; all ${F.int(sheet.nCols)} are processed)` : ''}${prof.headerRow >= 0 && prof.headerRow !== undefined ? ` · header on row ${(sheet.r0 || 0) + prof.headerRow + 1}` : ''}`), h('div', { class: 'ci-jump' }, h('span', {}, 'Go to row'), jump, btn('Last row', () => { wrap.scrollTop = nR * ROW; }, { cls: 'btn-sm' }))), wrap,
    prof.columns ? columnProfile(prof) : '');
  requestAnimationFrame(draw);
}
function columnProfile(prof) {
  const cols = prof.columns.filter((c) => c.type !== 'empty');
  return h('details', { class: 'table-twin' }, h('summary', {}, `Column profile over all ${F.int(prof.dataRows ?? 0)} data rows`), h('div', { class: 'table-scroll' }, h('table', { class: 'data-table' }, h('thead', {}, h('tr', {}, ['Column', 'Type', 'Filled', 'Blank', 'Distinct', 'Sum', 'Min', 'Max'].map((t, i) => h('th', { scope: 'col', class: i > 1 ? 'is-num' : '' }, t)))), h('tbody', {}, cols.map((c) => h('tr', {}, h('th', { scope: 'row' }, c.name), h('td', {}, c.type), h('td', { class: 'is-num' }, F.int(c.present)), h('td', { class: 'is-num' }, F.int(c.missing)), h('td', { class: 'is-num' }, String(c.distinct)), h('td', { class: 'is-num' }, c.type === 'number' ? F.num(c.sum, 2) : ''), h('td', { class: 'is-num' }, c.type === 'number' ? F.num(c.min, 2) : ''), h('td', { class: 'is-num' }, c.type === 'number' ? F.num(c.max, 2) : '')))))));
}

// ================================================================ step 3: review the mapping
const FIELD_OPTS = [{ value: '', label: '— not used —' }, ...V.STATEMENTS.flatMap((st) => V.FIELDS.filter((f) => f.st === st.id).map((f) => ({ value: f.id, label: `${f.label}` })))];
function renderMapping() {
  const a = state.analysis, S = state.settings;
  const usable = a.sheets.filter((s) => s.kind === 'statement' || s.kind === 'records');
  const head = h('div', { class: 'ci-step-head' }, h('span', { class: 'ci-step-n' }, '3'), h('h3', {}, 'Review the mapping'));
  if (!usable.length) {
    mapBox.replaceChildren(head, verdict('warn', 'No financial statements or records were recognised.', 'A statement needs its lines down the first column and periods across the top (FY2023, 2024 …), or one row per year with the lines as columns; long records need a date, an account name and an amount. Datasets can still be explored on the Operations tab.'),
      a.sheets.some((s) => s.kind === 'dataset') ? h('div', { class: 'input-actions' }, btn('Explore the datasets', () => build(true), { kind: 'primary' })) : '');
    return;
  }
  const otherCurs = [...new Set(a.sheets.map((s) => S.sheets[s.name].currency).filter((c) => c && c !== S.currency))];
  const globals = h('div', { class: 'cv-field-grid ci-globals' },
    field('Reporting currency', selectEl(CURS.map((c) => ({ value: c, label: c })), S.currency, (v) => { S.currency = v; renderMapping(); }), { hint: 'Sheets in another currency need a rate or are left out.' }),
    field('Show figures in', selectEl(UNITS.slice(1), String(S.targetUnit), (v) => { S.targetUnit = +v; })),
    field('Fiscal year ends in', selectEl(MONTHS.map((m, i) => ({ value: String(i + 1), label: m })), String(S.fyEndMonth), (v) => { S.fyEndMonth = +v; }), { hint: 'Used to put dated records into fiscal years.' }),
    ...otherCurs.map((c) => field(`${c} → ${S.currency} rate`, numInput({ value: S.fx[c], placeholder: 'needed', onInput: (v) => { if (fin(v) && v > 0) S.fx[c] = v; else delete S.fx[c]; } }), { hint: 'One rate for all years (a simplification you choose; none is assumed).' })));
  const partial = h('label', { class: 'check' }, h('input', { type: 'checkbox', onchange: (e) => { S.includePartialYears = e.target.checked; } }), ' Include fiscal years with fewer than twelve months of records');
  const cards = usable.map((p) => (p.kind === 'statement' ? statementCard(p) : recordsCard(p)));
  const go = btn('Build the analysis', () => build(false), { kind: 'sun', cls: 'ci-build' });
  mapBox.replaceChildren(head, h('p', { class: 'cv-sub' }, 'These are proposals, not facts. Check each line’s field, the periods, the unit and the currency. A line that is “not used” is ignored; several lines mapped to one field are added together.'), globals, partial, ...cards, h('div', { class: 'input-actions' }, go), h('div', { class: 'ci-build-msg' }));
}
function sheetControls(p) {
  const conf = state.settings.sheets[p.name];
  const use = h('input', { type: 'checkbox', id: id('use') }); use.checked = conf.use; use.addEventListener('change', () => { conf.use = use.checked; });
  return h('div', { class: 'cv-inline-fields' }, h('label', { class: 'check', for: use.id }, use, ' Use this sheet'),
    field('Unit of its figures', selectEl(UNITS, conf.unit ? String(conf.unit) : '', (v) => { conf.unit = v ? +v : null; }), { hint: p.unit ? `The sheet says ${W.UNIT_NAMES[p.unit]}.` : 'Not stated on the sheet: choose it.' }),
    field('Currency', selectEl([{ value: '', label: 'Not stated' }, ...CURS.map((c) => ({ value: c, label: c }))], conf.currency || '', (v) => { conf.currency = v || null; renderMapping(); }), { hint: p.currency ? `The sheet says ${p.currency}.` : '' }));
}
function statementCard(p) {
  const periods = h('div', { class: 'ci-periods' }, p.periods.map((per) => {
    const cb = h('input', { type: 'checkbox', id: id('per') }); cb.checked = per.use; cb.addEventListener('change', () => { per.use = cb.checked; });
    const yr = numInput({ value: per.fy, digits: 0, ariaLabel: `Fiscal year of column ${per.header}`, onInput: (v) => { if (Number.isInteger(v) && v > 1900 && v < 2200) per.fy = v; } });
    return h('div', { class: `ci-period${per.estimate ? ' is-est' : ''}` }, h('label', { class: 'check', for: cb.id }, cb, ` ${per.header}`), h('span', { class: 'ci-period-meta' }, per.estimate ? 'forecast' : per.kind === 'year' || per.kind === 'date' ? 'fiscal year' : per.kind), yr);
  }));
  const refreshParts = () => { const count = {}; p.lines.forEach((l) => { if (l.field) count[l.field] = (count[l.field] || 0) + 1; }); p.lines.forEach((l) => { l.part = !!l.field && count[l.field] > 1; }); };
  const rows = p.lines.map((l) => {
    const sel = selectEl(FIELD_OPTS, l.field || '', (v) => { l.field = v || null; l.duplicate = false; refreshParts(); tr.classList.toggle('is-unmapped', !l.field); });
    const sign = selectEl([{ value: '0', label: 'as is (auto)' }, { value: '-1', label: 'flip sign' }], String(l.sign || 0), (v) => { l.sign = +v; });
    const shown = l.values.map((v, k) => ({ v, k })).filter((x) => p.periods[x.k]).slice(-3);
    const tr = h('tr', { class: l.field ? '' : 'is-unmapped' }, h('th', { scope: 'row' }, l.label, l.note ? h('span', { class: 'field-hint' }, ` ${l.note}`) : null, l.textCells ? h('span', { class: 'field-hint' }, ` ${l.textCells} cell${l.textCells === 1 ? '' : 's'} with text instead of a number`) : null), h('td', {}, sel), h('td', {}, sign), shown.map((x) => h('td', { class: 'is-num' }, fin(x.v) ? F.num(x.v, Math.abs(x.v) >= 100 ? 0 : 2) : '—')));
    return tr;
  });
  const last3 = p.periods.slice(-3);
  const mapped = p.lines.filter((l) => l.field).length;
  return h('details', { class: 'ci-map-card', open: true }, h('summary', {}, h('strong', {}, p.name), ` · ${{ is: 'income statement', bs: 'balance sheet', cf: 'cash flow statement' }[p.statement] || 'statement'} · ${mapped} of ${p.lines.length} lines mapped · ${p.periods.filter((x) => x.use).length} periods`),
    sheetControls(p), h('p', { class: 'field-label' }, p.orientation === 'periods-down' ? 'Periods (one row each)' : 'Periods (columns)'), periods,
    h('div', { class: 'table-scroll' }, h('table', { class: 'data-table cv-map' }, h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Line in the sheet'), h('th', { scope: 'col' }, 'Maps to'), h('th', { scope: 'col' }, 'Sign'), last3.map((x) => h('th', { scope: 'col', class: 'is-num' }, x.header)))), h('tbody', {}, rows))));
}
function recordsCard(p) {
  const sheet = state.wb.sheets.find((s) => s.name === p.name);
  const colOpts = p.columns.map((c) => ({ value: String(c.index), label: `${c.name} (${c.type})` }));
  const body = h('tbody');
  const drawAccounts = () => body.replaceChildren(...p.accounts.map((a) => {
    const sel = selectEl(FIELD_OPTS, a.field || '', (v) => { a.field = v || null; if (a.field) { a.mode = V.FIELD[a.field].st === 'bs' ? 'last' : 'sum'; mode.value = a.mode; } const count = {}; p.accounts.forEach((x) => { if (x.field) count[x.field] = (count[x.field] || 0) + 1; }); p.accounts.forEach((x) => { x.part = !!x.field && count[x.field] > 1; }); tr.classList.toggle('is-unmapped', !a.field); });
    const mode = selectEl([{ value: 'sum', label: 'add up over the year (a flow)' }, { value: 'last', label: 'take the year-end balance' }], a.mode, (v) => { a.mode = v; });
    const tr = h('tr', { class: a.field ? '' : 'is-unmapped' }, h('th', { scope: 'row' }, a.label, a.note ? h('span', { class: 'field-hint' }, ` ${a.note}`) : null), h('td', { class: 'is-num' }, F.int(a.n)), h('td', {}, sel), h('td', {}, mode));
    return tr;
  }));
  drawAccounts();
  const pick = (label, key, nullable = false) => field(label, selectEl(nullable ? [{ value: '', label: '— none —' }, ...colOpts] : colOpts, p[key] === null || p[key] === undefined ? '' : String(p[key]), (v) => { p[key] = v === '' ? null : +v; if (key === 'labelCol') { p.accounts = W.recordsAccounts(sheet, p); drawAccounts(); } }));
  return h('details', { class: 'ci-map-card', open: true }, h('summary', {}, h('strong', {}, p.name), ` · ${F.int(p.dataRows)} records · ${p.accounts.filter((a) => a.field).length} of ${p.accounts.length} accounts mapped`),
    sheetControls(p), h('div', { class: 'cv-field-grid' }, pick('Date or period column', 'dateCol'), pick('Account or line column', 'labelCol'), pick('Amount column', 'valueCol'), pick('Currency column', 'currencyCol', true)),
    h('p', { class: 'field-hint' }, 'Records fill what the statement sheets do not provide, and where both give a figure they are compared: a difference above 0.5% is reported.'),
    h('div', { class: 'table-scroll ci-accounts' }, h('table', { class: 'data-table cv-map' }, h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Account'), h('th', { scope: 'col', class: 'is-num' }, 'Rows'), h('th', { scope: 'col' }, 'Maps to'), h('th', { scope: 'col' }, 'How a year is formed'))), body)));
}

function build(datasetsOnly) {
  const out = $('.ci-build-msg', mapBox);
  let built;
  try { built = W.buildProject(state.wb, state.analysis, state.settings); } catch (e) { if (out) out.replaceChildren(verdict('bad', 'The analysis could not be built.', e.message)); return; }
  state.built = built;
  const errors = built.issues.filter((i) => i.level === 'error');
  if (!built.project.history.length && !datasetsOnly) { if (out) out.replaceChildren(verdict('bad', 'No annual figures could be built.', errors.map((e) => e.text).join(' ') || 'Map at least one statement.')); return; }
  if (out) out.replaceChildren(errors.length ? verdict('warn', `${errors.length} problem${errors.length === 1 ? '' : 's'} left data out.`, errors.map((e) => e.text).join(' ')) : '');
  state.market = {}; state.savedId = null;
  openProject(built.project, built.lineage, [...state.analysis.issues, ...built.issues]);
}
