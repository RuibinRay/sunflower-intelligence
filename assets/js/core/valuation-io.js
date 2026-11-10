// valuation-io.js — getting company data in and out of the Company Valuation Studio: mapping uploaded statement
// tables (CSV, or the sheets of an .xlsx read in the browser) to the engine's fields, unit detection, project save
// and reload as JSON, CSV tables, and an Excel workbook of the model with live formulas. Pure functions; no DOM.
// Everything runs in the browser: no file leaves the visitor's device.
import { FIELDS, FIELD, fin } from './valuation.js?v=30';
import { parseNumber } from './csv.js?v=30';

// ================================================================ label matching
// Patterns are tested against a lower-cased label with punctuation collapsed. Order matters: the first match wins,
// and specific lines (gross profit) come before general ones (profit).
export const SYNONYMS = [
  ['revenue', [/^(total |net )?(revenue|revenues|sales|net sales|turnover)( net)?$/, /^(total )?net (sales|revenue)/, /^revenue(s)? from contracts?/, /^sales revenue/, /^operating revenue/]],
  ['cogs', [/cost of (goods|sales|revenue|products)/, /^cogs$/, /^cost of goods and services/]],
  ['grossProfit', [/^gross (profit|margin|income)$/]],
  ['da', [/depreciation.*amorti[sz]ation|depreciation and amortization|^d ?& ?a$|^depreciation$|depreciation, depletion/]],
  ['opex', [/^(total )?operating expenses?( excl.*)?$/, /^(sg&a|sga|selling,? general and administrative( expenses?)?)$/, /^selling general/, /^opex$/]],
  ['ebitda', [/^(adjusted )?ebitda$/]],
  ['ebit', [/^ebit$/, /^operating (income|profit)( \(loss\))?$/, /^income from operations/, /^operating income/]],
  ['interestExpense', [/^interest expense/, /^finance costs?/, /^interest paid/]],
  ['interestIncome', [/^interest (and other )?income/, /^other income/, /^finance income/]],
  ['pretax', [/^(income|earnings|profit) before (income )?tax/, /^pre-?tax (income|profit)/, /^ebt$/]],
  ['tax', [/^(provision for |income )?tax(es)?( expense)?$/, /^income tax/, /^provision for income tax/, /^tax expense/]],
  ['netIncome', [/^net (income|profit|earnings)( attributable to.*)?$/, /^profit for the (year|period)/, /^net income \(loss\)/, /^net earnings/]],
  ['shares', [/diluted (weighted )?(average )?shares/, /^weighted average (diluted )?shares/, /^shares outstanding.*diluted/, /^diluted shares/]],
  ['dividends', [/^dividends? paid/, /^(cash )?dividends?$/, /^payments? of dividends/]],
  ['buybacks', [/repurchase|buy-?backs?/]],
  ['cash', [/^cash( and cash equivalents| & cash equivalents| and equivalents)?$/, /^cash and short-?term/]],
  ['shortTermInvestments', [/^(short-?term|marketable) (investments|securities)/]],
  ['receivables', [/^(accounts |trade )?receivables?( net)?/, /^trade and other receivables/, /^accounts receivable/]],
  ['inventory', [/^inventor(y|ies)( net)?$/]],
  ['otherCurrentAssets', [/^other current assets/, /^prepaid/]],
  ['currentAssets', [/^total current assets$/]],
  ['ppeNet', [/property,? plant,? (and |& )?equipment/, /^pp&e/, /^fixed assets/, /^tangible fixed assets/]],
  ['goodwill', [/^goodwill$/]],
  ['intangibles', [/^(other )?intangible assets?/, /^intangibles/]],
  ['otherNoncurrentAssets', [/^other (non-?current|long-?term) assets/]],
  ['totalAssets', [/^total assets$/]],
  ['payables', [/^(accounts |trade )?payables?$/, /^accounts payable/, /^trade and other payables/]],
  ['currentDebt', [/^(short-?term|current) (debt|borrowings)/, /^current portion of (long-?term )?debt/, /^commercial paper/, /^notes payable/]],
  ['otherCurrentLiabilities', [/^other current liabilities/, /^accrued (expenses|liabilities)/]],
  ['currentLiabilities', [/^total current liabilities$/]],
  ['longTermDebt', [/^long-?term (debt|borrowings)/, /^(total )?debt$/, /^borrowings$/, /^bonds payable/]],
  ['leaseLiabilities', [/lease liabilit/]],
  ['otherNoncurrentLiabilities', [/^other (non-?current|long-?term) liabilities/, /^deferred tax liabilit/]],
  ['totalLiabilities', [/^total liabilities$/]],
  ['minorityInterest', [/minority interest|non-?controlling interest/]],
  ['preferredEquity', [/^preferred (stock|equity|shares)/]],
  ['equity', [/^total (stockholders'?|shareholders'?) equity/, /^(total )?equity$/, /^shareholders'? funds/, /^stockholders'? equity/, /^total equity attributable/]],
  ['retainedEarnings', [/^retained earnings/, /^accumulated (deficit|earnings)/]],
  ['cfo', [/^(net )?cash (provided by|from|generated from|flows? from) operat/, /^operating cash flow/, /^cash from operations/, /^cfo$/]],
  ['capex', [/^capital expenditure/, /^capex$/, /purchases? of property/, /^additions to property/, /^investments? in property/, /^purchase of (fixed|tangible)/]],
  ['investingCF', [/^(net )?cash (used in|provided by|from|flows? from) investing/, /^investing cash flow/]],
  ['financingCF', [/^(net )?cash (used in|provided by|from|flows? from) financing/, /^financing cash flow/]],
  ['nwcChange', [/^changes? in (net )?working capital/, /^changes? in operating assets and liabilities/]],
  ['fcf', [/^free cash flow/, /^fcf$/]],
];
const norm = (s) => String(s || '').toLowerCase().replace(/[–—]/g, '-').replace(/\s+/g, ' ').replace(/[.:;]+$/g, '').trim();
/** The engine field a statement label most likely means, or null. */
export function matchLabel(text) {
  const t = norm(text);
  if (!t) return null;
  for (const [field, pats] of SYNONYMS) if (pats.some((p) => p.test(t))) return field;
  return null;
}

// ================================================================ statement tables
const yearOf = (s) => { const m = /(?:fy|fiscal|year|ye)?\s*'?((?:19|20)\d{2})(?!\d)/i.exec(String(s || '')); return m ? +m[1] : null; };
const numOf = (raw) => { const p = parseNumber(raw); return Number.isNaN(p.value) ? NaN : p.value; };

/** Guess the unit of a set of statement values (actual, thousands or millions) from their size. */
export function detectUnit(values) {
  const v = values.filter((x) => fin(x) && x !== 0).map(Math.abs);
  if (!v.length) return { unit: 1e6, label: 'millions', why: 'no figures to judge from; millions assumed' };
  const big = v.slice().sort((a, b) => b - a)[Math.floor(v.length * 0.1)];
  if (big >= 1e8) return { unit: 1, label: 'whole units', why: `the largest figures are around ${big.toExponential(1)}, which reads as whole currency units` };
  if (big >= 1e5) return { unit: 1e3, label: 'thousands', why: `the largest figures are around ${Math.round(big).toLocaleString('en-US')}, which reads as thousands` };
  return { unit: 1e6, label: 'millions', why: `the largest figures are around ${Math.round(big).toLocaleString('en-US')}, which reads as millions` };
}

/**
 * Reads a parsed table (csv.js's parseTable output) as a financial statement. Detects whether years run across the
 * columns (labels down the first column) or down the rows (one row per year, lines across), maps each line to a field,
 * and returns the mapping for review. Nothing is changed silently: duplicate years, unmapped lines, negatives in lines
 * that should be positive and unit guesses are reported.
 */
export function mapStatementTable(table) {
  if (!table || table.error) return { error: table?.error || 'No table to read.' };
  const warnings = [];
  let names = table.columns.map((c) => c.name), raw = table.rawRows;
  // the table reader treats a heading row of years as data (most cells look numeric); take it back as the header
  if (!table.header && raw.length && raw[0].filter((v) => Number.isInteger(yearOf(v))).length >= 1 && raw[0].filter((v) => Number.isInteger(yearOf(v))).length >= raw[0].length / 2) { names = raw[0].map((v, i) => String(v).trim() || `Column ${i + 1}`); raw = raw.slice(1); }
  const colYears = names.map(yearOf);
  const firstColYears = raw.map((r) => yearOf(r[0]));
  const colHits = colYears.filter(Number.isInteger).length, rowHits = firstColYears.filter(Number.isInteger).length;
  let orientation, years, rows;
  if (colHits >= 1 && colHits >= rowHits) {
    orientation = 'years-in-columns';
    const yearCols = names.map((n, j) => ({ j, year: colYears[j] })).filter((c) => Number.isInteger(c.year));
    years = yearCols.map((c) => c.year);
    const labelCol = names.findIndex((n, j) => !Number.isInteger(colYears[j]));
    rows = raw.map((r, i) => {
      const labelText = r[labelCol < 0 ? 0 : labelCol];
      const values = yearCols.map((c) => numOf(r[c.j]));
      return { i, label: labelText, field: matchLabel(labelText), values, keep: true };
    }).filter((r) => r.label && r.values.some(fin));
  } else if (rowHits >= 1) {
    orientation = 'years-in-rows';
    const yearRows = raw.map((r, i) => ({ i, year: firstColYears[i] })).filter((x) => Number.isInteger(x.year));
    years = yearRows.map((x) => x.year);
    rows = names.slice(1).map((n, k) => ({ i: k + 1, label: n, field: matchLabel(n), values: yearRows.map((x) => numOf(raw[x.i][k + 1])), keep: true })).filter((r) => r.values.some(fin));
  } else {
    return { error: 'No fiscal years found. Put the years in the column headings (FY2023, 2024 …) with one line per row, or one row per year with the lines as columns.' };
  }
  const dup = years.filter((y, i) => years.indexOf(y) !== i);
  if (dup.length) warnings.push(`Duplicate periods: ${[...new Set(dup)].join(', ')} appear more than once. Keep one column per fiscal year.`);
  const unmapped = rows.filter((r) => !r.field);
  if (unmapped.length) warnings.push(`${unmapped.length} line${unmapped.length > 1 ? 's were' : ' was'} not recognised and will be ignored unless you map ${unmapped.length > 1 ? 'them' : 'it'}: ${unmapped.slice(0, 6).map((r) => `“${r.label}”`).join(', ')}${unmapped.length > 6 ? '…' : ''}.`);
  const seen = new Map();
  rows.forEach((r) => { if (r.field) { if (seen.has(r.field)) { warnings.push(`Both “${seen.get(r.field)}” and “${r.label}” map to ${FIELD[r.field].label}; the second is ignored unless you change it.`); r.field = null; } else seen.set(r.field, r.label); } });
  rows.forEach((r) => { if (r.field === 'capex' && r.values.some((v) => fin(v) && v < 0)) warnings.push('Capital expenditure is shown as a negative outflow; the model uses its size and says so.'); });
  rows.forEach((r) => { if (r.field === 'revenue' && r.values.some((v) => fin(v) && v < 0)) warnings.push('Revenue has a negative value; check the line.'); });
  const unitGuess = detectUnit(rows.flatMap((r) => r.values));
  const missingYears = rows.filter((r) => r.field).some((r) => r.values.some((v) => !fin(v)));
  if (missingYears) warnings.push('Some mapped lines have blank years. Blank cells stay blank: nothing is estimated for them.');
  return { orientation, years, rows, unitGuess, warnings, nRows: raw.length };
}

/** Turns a reviewed mapping into history periods in the project's unit (targetUnit), merging over existing ones by year. */
export function applyMapping(mapped, rows, { unit = 1e6, targetUnit = 1e6, existing = [] } = {}) {
  const scale = unit / targetUnit;
  const byYear = new Map(existing.map((h) => [h.year, { ...h }]));
  const used = [];
  mapped.years.forEach((year, k) => {
    const h = byYear.get(year) || { year };
    rows.filter((r) => r.keep !== false && r.field).forEach((r) => {
      const v = r.values[k];
      if (!fin(v)) return;
      const isShares = r.field === 'shares';
      h[r.field] = isShares ? v * (unit / targetUnit) : v * scale;
      if (r.field === 'capex' && h.capex < 0) h.capex = -h.capex;
    });
    byYear.set(year, h);
    used.push(year);
  });
  const history = [...byYear.values()].sort((a, b) => a.year - b.year);
  return { history, years: used, fieldsMapped: rows.filter((r) => r.keep !== false && r.field).map((r) => r.field) };
}

// ================================================================ projects as JSON
export const PROJECT_VERSION = 1;
export function serializeProject(project, assumptions, extra = {}) {
  return JSON.stringify({ app: 'sunflower-intelligence/company-valuation', version: PROJECT_VERSION, savedAt: new Date().toISOString(), project, assumptions, ...extra }, null, 1);
}
export function parseProject(text) {
  let o;
  try { o = JSON.parse(text); } catch { return { error: 'That file is not valid JSON.' }; }
  if (!o || typeof o !== 'object' || o.app !== 'sunflower-intelligence/company-valuation' || !o.project || !Array.isArray(o.project.history)) return { error: 'That JSON was not saved by the Company Valuation Studio (no project with a history inside).' };
  if (o.version > PROJECT_VERSION) return { error: `This project was saved by a newer version of the studio (format ${o.version}); this page reads format ${PROJECT_VERSION}.` };
  return { project: o.project, assumptions: o.assumptions || null, savedAt: o.savedAt, extra: o };
}

// ================================================================ CSV tables
const esc = (v) => { const t = v == null ? '' : String(v); return /[",\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
export const toCSV = (columns, rows) => [columns.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n');
const r6 = (v) => (fin(v) ? Math.round(v * 1e6) / 1e6 : '');
/** The history as a statement table (lines down, years across). */
export function historyCSV(project) {
  const H = (project.history || []).slice().sort((a, b) => a.year - b.year);
  const cols = ['line', 'field', ...H.map((h) => `FY${h.year}`)];
  const rows = FIELDS.filter((f) => H.some((h) => fin(h[f.id]))).map((f) => [f.label, f.id, ...H.map((h) => r6(h[f.id]))]);
  return toCSV(cols, rows);
}
/** The forecast and DCF schedule. */
export function dcfCSV(result) {
  const cols = ['year', 'revenue', 'growth', 'ebitda', 'margin', 'd_and_a', 'ebit', 'tax', 'nopat', 'capex', 'nwc', 'change_in_nwc', 'fcff', 'discount_exponent', 'discount_factor', 'present_value'];
  const rows = result.rows.map((x) => [x.year, r6(x.revenue), r6(x.growth), r6(x.ebitda), r6(x.margin), r6(x.da), r6(x.ebit), r6(x.tax), r6(x.nopat), r6(x.capex), r6(x.nwc), r6(x.dNwc), r6(x.fcff), r6(x.exponent), r6(x.df), r6(x.pv)]);
  rows.push([]); rows.push(['terminal_value', r6(result.tv)], ['pv_terminal_value', r6(result.pvTV)], ['sum_pv_forecast', r6(result.sumPv)], ['enterprise_value', r6(result.ev)], ['debt', r6(result.debt)], ['leases', r6(result.leases)], ['cash', r6(result.cash)], ['minority_interest', r6(result.minority)], ['preferred', r6(result.preferred)], ['equity_value', r6(result.equity)], ['shares', r6(result.shares)], ['value_per_share', r6(result.perShare)], ['wacc', r6(result.r)], ['terminal_method', result.assumptions.terminal.method], ['terminal_growth', r6(result.assumptions.terminal.growth)], ['exit_multiple', r6(result.assumptions.terminal.multiple)], ['mid_year', String(!!result.assumptions.midYear)]);
  return toCSV(cols, rows);
}
/** Every assumption as key,value rows (enough to reproduce the model). */
export function assumptionsCSV(A, project) {
  const rows = [['company', project.meta?.name || ''], ['currency', project.meta?.currency || ''], ['unit', project.meta?.unitLabel || ''], ['valuation_date', project.meta?.valuationDate || ''], ['horizon', A.horizon], ['margin_basis', A.marginBasis], ['tax_on_losses', A.taxLosses]];
  ['growth', 'margin', 'daPct', 'capexPct', 'nwcPct', 'taxRate'].forEach((k) => (A[k] || []).forEach((v, i) => rows.push([`${k}_year_${i + 1}`, r6(v)])));
  rows.push(['terminal_method', A.terminal.method], ['terminal_growth', r6(A.terminal.growth)], ['exit_multiple', r6(A.terminal.multiple)], ['exit_multiple_basis', A.terminal.multipleBasis], ['mid_year', String(!!A.midYear)]);
  Object.entries(A.discount).forEach(([k, v]) => rows.push([`discount_${k}`, typeof v === 'number' ? r6(v) : String(v)]));
  Object.entries(A.bridge || {}).forEach(([k, v]) => rows.push([`bridge_${k}`, typeof v === 'number' ? r6(v) : String(v)]));
  return toCSV(['assumption', 'value'], rows);
}

// ================================================================ Excel workbook with formulas (no library)
// A minimal .xlsx writer: the OOXML parts below, stored (uncompressed) in a ZIP with CRC-32s. Excel, Numbers and
// LibreOffice open it and calculate the formulas on load.
const CRC_TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
export function crc32(bytes) { let c = 0xFFFFFFFF; for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
const enc = new TextEncoder();
/** files: [{ name, text }] → the bytes of a ZIP archive using the "stored" method. */
export function zipStore(files) {
  const parts = [], central = [];
  let offset = 0;
  const u16 = (v) => [v & 0xFF, (v >>> 8) & 0xFF], u32 = (v) => [v & 0xFF, (v >>> 8) & 0xFF, (v >>> 16) & 0xFF, (v >>> 24) & 0xFF];
  const dosTime = 0x0000, dosDate = ((2026 - 1980) << 9) | (1 << 5) | 1;
  for (const f of files) {
    const name = enc.encode(f.name), data = typeof f.text === 'string' ? enc.encode(f.text) : f.text, crc = crc32(data);
    const local = new Uint8Array([...u32(0x04034b50), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(dosTime), ...u16(dosDate), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0), ...name]);
    parts.push(local, data);
    central.push(new Uint8Array([...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(dosTime), ...u16(dosDate), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset), ...name]));
    offset += local.length + data.length;
  }
  const cdStart = offset, cdLen = central.reduce((a, c) => a + c.length, 0);
  const end = new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(cdLen), ...u32(cdStart), ...u16(0)]);
  const all = [...parts, ...central, end], total = all.reduce((a, c) => a + c.length, 0);
  const out = new Uint8Array(total); let p = 0; for (const c of all) { out.set(c, p); p += c.length; }
  return out;
}
const xmlEsc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const colName = (i) => { let s = ''; i += 1; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
export const cellRef = (r, c) => `${colName(c)}${r + 1}`;
/** A cell is a number, a string, or { f: 'B2*C2' } for a formula; { v, s } sets a style index (1 = bold, 2 = percent, 3 = input). */
function sheetXml(rows, { widths = [] } = {}) {
  const cols = widths.length ? `<cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>` : '';
  const body = rows.map((row, r) => `<row r="${r + 1}">${row.map((cell, c) => {
    if (cell == null || cell === '') return '';
    const ref = cellRef(r, c);
    const style = cell && typeof cell === 'object' && cell.s ? ` s="${cell.s}"` : '';
    if (cell && typeof cell === 'object' && cell.f) return `<c r="${ref}"${style}><f>${xmlEsc(cell.f)}</f>${typeof cell.v === 'number' && Number.isFinite(cell.v) ? `<v>${cell.v}</v>` : ''}</c>`;   // the stored result lets readers that do not calculate show the value
    const v = cell && typeof cell === 'object' ? cell.v : cell;
    if (typeof v === 'number') return Number.isFinite(v) ? `<c r="${ref}"${style}><v>${v}</v></c>` : '';
    return `<c r="${ref}" t="inlineStr"${style}><is><t>${xmlEsc(v)}</t></is></c>`;
  }).join('')}</row>`).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${cols}<sheetData>${body}</sheetData></worksheet>`;
}
/** sheets: [{ name, rows, widths }] → .xlsx bytes. */
export function buildXlsx(sheets) {
  const files = [
    { name: '[Content_Types].xml', text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((s, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>` },
    { name: '_rels/.rels', text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { name: 'xl/workbook.xml', text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><calcPr fullCalcOnLoad="1"/><sheets>${sheets.map((s, i) => `<sheet name="${xmlEsc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>` },
    { name: 'xl/_rels/workbook.xml.rels', text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((s, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
    { name: 'xl/styles.xml', text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0.0"/></numFmts><fonts count="3"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font><font><sz val="11"/><color rgb="FF1F4E9A"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFF4D6"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="5"><xf numFmtId="164" fontId="0" fillId="0" borderId="0" applyNumberFormat="1"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" applyFont="1"/><xf numFmtId="10" fontId="0" fillId="0" borderId="0" applyNumberFormat="1"/><xf numFmtId="164" fontId="2" fillId="2" borderId="0" applyFont="1" applyFill="1" applyNumberFormat="1"/><xf numFmtId="10" fontId="2" fillId="2" borderId="0" applyFont="1" applyFill="1" applyNumberFormat="1"/></cellXfs></styleSheet>` },
    ...sheets.map((s, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, text: sheetXml(s.rows, { widths: s.widths }) })),
  ];
  return zipStore(files);
}

/** The valuation model as a workbook: inputs on one sheet (blue on yellow), the forecast and DCF on another with
 *  formulas that reference them, so every number can be traced and changed. */
export function buildModelWorkbook(project, A, result) {
  const B = { s: 1 }, IN = { s: 3 }, INP = { s: 4 }, PCT = { s: 2 };
  const H = (project.history || []).slice().sort((a, b) => a.year - b.year);
  const latest = result.forecast.base;
  const N = result.rows.length;
  const unit = project.meta?.unitLabel || 'millions', cur = project.meta?.currency || 'USD';
  // ---- Inputs sheet: row index map for formulas
  const inputs = [
    [{ v: `${project.meta?.name || 'Company'}: valuation model inputs`, ...B }], [`Figures in ${cur} ${unit}; shares in ${unit}. Blue cells on yellow are inputs; everything else is a formula.`], [],
    [{ v: 'Latest year', ...B }, { v: latest.year, ...IN }],
    [{ v: 'Revenue, latest year', ...B }, { v: latest.revenue, ...IN }],
    [{ v: 'Net working capital, latest year', ...B }, { v: fin(latest.nwc) ? latest.nwc : 0, ...IN }],
    [{ v: 'Debt', ...B }, { v: result.debt, ...IN }], [{ v: 'Lease liabilities counted as debt', ...B }, { v: result.leases, ...IN }], [{ v: 'Cash and short-term investments', ...B }, { v: result.cash, ...IN }],
    [{ v: 'Minority interest', ...B }, { v: result.minority, ...IN }], [{ v: 'Preferred equity', ...B }, { v: result.preferred, ...IN }], [{ v: 'Other claims', ...B }, { v: result.other, ...IN }], [{ v: 'Non-operating assets', ...B }, { v: result.nonOp, ...IN }],
    [{ v: 'Shares outstanding', ...B }, { v: fin(result.shares) ? result.shares : 0, ...IN }], [{ v: 'Share price', ...B }, { v: fin(result.price) ? result.price : 0, ...IN }], [],
    [{ v: 'Risk-free rate', ...B }, { v: A.discount.rf, ...INP }], [{ v: 'Beta', ...B }, { v: A.discount.beta, ...IN }], [{ v: 'Equity risk premium', ...B }, { v: A.discount.erp, ...INP }],
    [{ v: 'Pre-tax cost of debt', ...B }, { v: A.discount.kd, ...INP }], [{ v: 'Tax rate for the debt shield', ...B }, { v: A.discount.taxRate, ...INP }],
    [{ v: 'Equity value for weights', ...B }, { v: fin(result.cc.E) ? result.cc.E : 1, ...IN }], [{ v: 'Debt value for weights', ...B }, { v: fin(result.cc.D) ? result.cc.D : 0, ...IN }],
    [{ v: 'Cost of equity', ...B }, { f: 'B17+B18*B19', ...PCT }], [{ v: 'After-tax cost of debt', ...B }, { f: 'B20*(1-B21)', ...PCT }],
    [{ v: 'WACC', ...B }, A.discount.mode === 'direct' ? { v: A.discount.direct, ...INP } : { f: 'B22/(B22+B23)*B24+B23/(B22+B23)*B25', ...PCT }], [],
    [{ v: 'Terminal method (1 = perpetuity, 2 = exit multiple)', ...B }, { v: A.terminal.method === 'exit' ? 2 : 1, ...IN }], [{ v: 'Terminal growth', ...B }, { v: A.terminal.growth, ...INP }], [{ v: 'Exit multiple (× EBITDA)', ...B }, { v: A.terminal.multiple, ...IN }],
    [{ v: 'Mid-year convention (1 = yes)', ...B }, { v: A.midYear ? 1 : 0, ...IN }],
  ];
  // ---- Forecast sheet
  const yrs = result.rows.map((x) => x.year);
  const hdr = ['Line', 'Basis', ...yrs];
  const cols = yrs.map((_, j) => colName(j + 2));   // C, D, E ...
  const perYear = (labelText, values) => [{ v: labelText, ...B }, 'assumption', ...values.map((v) => ({ v, ...INP }))];
  const F = [
    [{ v: 'Forecast and discounted cash flow', ...B }], [`Rows 4–9 are the assumptions for each year (inputs). Everything below is a formula that uses them and the Inputs sheet.`], hdr,
    perYear('Revenue growth', result.rows.map((x) => x.growth)), perYear('EBITDA margin', result.rows.map((x) => x.ebitda / x.revenue)), perYear('D&A as % of revenue', result.rows.map((x) => x.da / x.revenue)), perYear('Capex as % of revenue', result.rows.map((x) => x.capex / x.revenue)), perYear('Working capital as % of revenue', result.rows.map((x) => x.nwc / x.revenue)), perYear('Tax rate', result.rows.map((x) => x.taxRate)),
    [],
    [{ v: 'Revenue', ...B }, 'prior × (1 + growth)', ...cols.map((c, j) => ({ f: j === 0 ? `Inputs!B5*(1+${c}4)` : `${cols[j - 1]}11*(1+${c}4)` }))],
    [{ v: 'EBITDA', ...B }, 'revenue × margin', ...cols.map((c) => ({ f: `${c}11*${c}5` }))],
    [{ v: 'D&A', ...B }, 'revenue × D&A %', ...cols.map((c) => ({ f: `${c}11*${c}6` }))],
    [{ v: 'EBIT', ...B }, 'EBITDA − D&A', ...cols.map((c) => ({ f: `${c}12-${c}13` }))],
    [{ v: 'Tax on EBIT', ...B }, 'max(0, EBIT) × tax rate', ...cols.map((c) => ({ f: `MAX(0,${c}14)*${c}9` }))],
    [{ v: 'NOPAT', ...B }, 'EBIT − tax', ...cols.map((c) => ({ f: `${c}14-${c}15` }))],
    [{ v: 'Capital expenditure', ...B }, 'revenue × capex %', ...cols.map((c) => ({ f: `${c}11*${c}7` }))],
    [{ v: 'Net working capital', ...B }, 'revenue × NWC %', ...cols.map((c) => ({ f: `${c}11*${c}8` }))],
    [{ v: 'Change in NWC', ...B }, 'NWC − prior NWC', ...cols.map((c, j) => ({ f: j === 0 ? `${c}18-Inputs!B6` : `${c}18-${cols[j - 1]}18` }))],
    [{ v: 'Free cash flow to the firm', ...B }, 'NOPAT + D&A − capex − ΔNWC', ...cols.map((c) => ({ f: `${c}16+${c}13-${c}17-${c}19` }))],
    [{ v: 'Year', ...B }, 't', ...cols.map((c, j) => j + 1)],
    [{ v: 'Discount exponent', ...B }, 't − 0.5 if mid-year', ...cols.map((c) => ({ f: `${c}21-0.5*Inputs!B31` }))],
    [{ v: 'Discount factor', ...B }, '1 ÷ (1 + WACC)^exponent', ...cols.map((c) => ({ f: `1/(1+Inputs!B26)^${c}22` }))],
    [{ v: 'Present value', ...B }, 'FCFF × factor', ...cols.map((c) => ({ f: `${c}20*${c}23` }))],
    [],
    [{ v: 'Sum of present values', ...B }, '', { f: `SUM(C24:${cols[N - 1]}24)` }],
    [{ v: 'Terminal value', ...B }, 'perpetuity: FCFF × (1+g) ÷ (WACC − g); exit: EBITDA × multiple', { f: `IF(Inputs!B28=2,${cols[N - 1]}12*Inputs!B30,${cols[N - 1]}20*(1+Inputs!B29)/(Inputs!B26-Inputs!B29))` }],
    [{ v: 'PV of terminal value', ...B }, 'discounted at N (N − 0.5 for a mid-year perpetuity)', { f: `C27/(1+Inputs!B26)^(${N}-IF(Inputs!B28=2,0,0.5*Inputs!B31))` }],
    [{ v: 'Enterprise value', ...B }, 'sum of PVs + PV of terminal value', { f: 'C26+C28' }],
    [{ v: 'Less debt and leases', ...B }, '', { f: '-(Inputs!B7+Inputs!B8)' }],
    [{ v: 'Less preferred, minority and other claims', ...B }, '', { f: '-(Inputs!B10+Inputs!B11+Inputs!B12)' }],
    [{ v: 'Plus cash and non-operating assets', ...B }, '', { f: 'Inputs!B9+Inputs!B13' }],
    [{ v: 'Equity value', ...B }, '', { f: 'SUM(C29:C32)' }],
    [{ v: 'Value per share', ...B }, 'equity ÷ shares', { f: 'IF(Inputs!B14>0,C33/Inputs!B14,"")' }],
    [{ v: 'Upside to the share price', ...B }, '', { f: 'IF(AND(Inputs!B14>0,Inputs!B15>0),C34/Inputs!B15-1,"")', ...PCT }],
    [{ v: 'Terminal value share of EV', ...B }, '', { f: 'C28/C29', ...PCT }],
  ];
  // ---- History sheet
  const hist = [[{ v: 'Historical statements (as entered)', ...B }], [`${cur} ${unit}`], ['Line', 'Field', ...H.map((h) => h.year)], ...FIELDS.filter((f) => H.some((h) => fin(h[f.id]))).map((f) => [f.label, f.id, ...H.map((h) => (fin(h[f.id]) ? h[f.id] : ''))])];
  // ---- Sources and notes
  const notes = [[{ v: 'Notes', ...B }], ['Built by Sunflower Intelligence, Finance › Company Valuation Studio.'], [`Saved ${new Date().toISOString().slice(0, 10)}.`], [project.source?.note || ''], ['Every figure on the Inputs sheet and rows 4–9 of the Forecast sheet is an input; change them and the workbook recalculates.'], ['Mid-year convention: cash flows are discounted at t − 0.5 and a perpetuity terminal value at N − 0.5; an exit-multiple terminal value is always discounted at N.']];
  return buildXlsx([{ name: 'Inputs', rows: inputs, widths: [44, 16] }, { name: 'Forecast', rows: F, widths: [34, 40, ...yrs.map(() => 14)] }, { name: 'History', rows: hist, widths: [44, 22, ...H.map(() => 14)] }, { name: 'Notes', rows: notes, widths: [120] }]);
}

// ================================================================ reading .xlsx in the browser
// Parses the ZIP central directory, inflates the shared strings and each worksheet with DecompressionStream
// ('deflate-raw'; Chrome 103+, Safari 16.4+, Firefox 113+), and returns the cells as text. No library.
const dec = new TextDecoder();
const rd16 = (b, o) => b[o] | (b[o + 1] << 8), rd32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;
async function inflateRaw(bytes) {
  if (typeof DecompressionStream === 'undefined') throw new Error('This browser cannot decompress .xlsx files. Save the sheet as CSV and upload that instead.');
  const ds = new DecompressionStream('deflate-raw');
  const w = ds.writable.getWriter(); w.write(bytes); w.close();
  return new Uint8Array(await new Response(ds.readable).arrayBuffer());
}
export async function unzip(buffer) {
  const b = new Uint8Array(buffer);
  let eocd = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 70000); i--) if (rd32(b, i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('Not a ZIP (or .xlsx) file.');
  const count = rd16(b, eocd + 10), cdOff = rd32(b, eocd + 16);
  const entries = {};
  let p = cdOff;
  for (let i = 0; i < count; i++) {
    if (rd32(b, p) !== 0x02014b50) break;
    const method = rd16(b, p + 10), csize = rd32(b, p + 20), nlen = rd16(b, p + 28), elen = rd16(b, p + 30), clen = rd16(b, p + 32), lho = rd32(b, p + 42);
    const name = dec.decode(b.subarray(p + 46, p + 46 + nlen));
    entries[name] = { method, csize, lho };
    p += 46 + nlen + elen + clen;
  }
  const read = async (name) => {
    const e = entries[name]; if (!e) return null;
    const nlen = rd16(b, e.lho + 26), elen = rd16(b, e.lho + 28), start = e.lho + 30 + nlen + elen;
    const data = b.subarray(start, start + e.csize);
    if (e.method === 0) return dec.decode(data);
    if (e.method === 8) return dec.decode(await inflateRaw(data));
    throw new Error(`Unsupported compression method ${e.method} in the workbook.`);
  };
  return { names: Object.keys(entries), read };
}
const colIndex = (ref) => { let n = 0; for (const ch of ref.replace(/\d+/g, '')) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; };
const unxml = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
/** → [{ name, rows: [[text, …], …] }] for every worksheet, cells as text (numbers as typed by Excel's stored value). */
export async function readXlsx(buffer) {
  const z = await unzip(buffer);
  const wb = await z.read('xl/workbook.xml');
  if (!wb) throw new Error('No workbook inside: this is not an .xlsx file.');
  const rels = (await z.read('xl/_rels/workbook.xml.rels')) || '';
  const relMap = {}; for (const m of rels.matchAll(/<Relationship\b[^>]*>/g)) { const id = /Id="([^"]+)"/.exec(m[0])?.[1], target = /Target="([^"]+)"/.exec(m[0])?.[1]; if (id && target) relMap[id] = target.replace(/^\/?(xl\/)?/, 'xl/'); }
  const shared = [];
  const ss = await z.read('xl/sharedStrings.xml');
  if (ss) for (const m of ss.matchAll(/<si>([\s\S]*?)<\/si>/g)) shared.push(unxml([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join('')));
  const sheets = [];
  for (const m of wb.matchAll(/<sheet\b[^>]*>/g)) {
    const name = unxml(/name="([^"]*)"/.exec(m[0])?.[1] || ''), rid = /r:id="([^"]+)"/.exec(m[0])?.[1];
    const xml = await z.read(relMap[rid] || '');
    if (!xml) continue;
    const rows = [];
    for (const r of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
      const row = [];
      for (const c of r[1].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const attrs = c[1], inner = c[2] || '';
        const ref = /r="([A-Z]+)\d+"/.exec(attrs)?.[1], type = /t="([^"]+)"/.exec(attrs)?.[1];
        const ci = ref ? colIndex(ref) : row.length;
        let text = '';
        if (type === 's') { const idx = +(/<v>([^<]*)<\/v>/.exec(inner)?.[1] ?? -1); text = shared[idx] ?? ''; }
        else if (type === 'inlineStr') text = unxml([...inner.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join(''));
        else text = unxml(/<v>([^<]*)<\/v>/.exec(inner)?.[1] ?? '');
        while (row.length < ci) row.push('');
        row[ci] = text;
      }
      rows.push(row);
    }
    sheets.push({ name, rows });
  }
  return { sheets };
}
/** A sheet's rows as CSV text, so the same table reader handles CSV and Excel uploads. */
export const rowsToCSV = (rows) => rows.map((r) => r.map(esc).join(',')).join('\n');
