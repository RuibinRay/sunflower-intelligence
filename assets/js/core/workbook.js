// workbook.js — understands a workbook that workbook-read.js has turned into rows: finds each sheet's table, works out
// whether it is a financial statement (lines down, periods across, or the reverse), a set of long financial records
// (one row per date, account and amount), or an operational dataset; proposes a mapping to the valuation engine's
// fields; checks data quality over EVERY row; and builds the company project that the dashboard and the Company
// Valuation Studio share. Pure functions, no DOM. Nothing is guessed silently: every proposal is returned for review,
// every figure keeps its lineage (sheet, row label, cells, scaling, sign change), and gaps stay gaps.
import { FIELDS, FIELD, fin } from './valuation.js?v=30';
import { matchLabel } from './valuation-io.js?v=30';
import { parseNumber } from './csv.js?v=30';

// ================================================================ small helpers
const MISSING = new Set(['', 'na', 'n/a', 'null', 'nan', 'none', '-', '—', '–', '?', '#n/a', 'nm', 'n.m.', 'n/m']);
export const isBlank = (v) => v === null || v === undefined || (typeof v === 'string' && MISSING.has(v.trim().toLowerCase()));
/** A cell as a number: numbers pass through; "1,234", "(500)", "$12", "4.2%" are parsed; anything else is NaN. */
export function num(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : NaN;
  if (typeof v !== 'string' || isBlank(v)) return NaN;
  const p = parseNumber(v);
  return Number.isNaN(p.value) ? NaN : p.value;
}
const colLetter = (i) => { let s = ''; i += 1; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
export const cellRef = (sheet, r, c) => `${colLetter((sheet.c0 || 0) + c)}${(sheet.r0 || 0) + r + 1}`;
const sum = (xs) => xs.reduce((a, b) => a + b, 0);
/** v × factor, dividing when the factor is a clean reciprocal (5600 ÷ 1000 = 5.6 exactly, where 5600 × 0.001 is not). */
const rescale = (v, f) => { if (f === 1) return v; const inv = 1 / f; return Math.abs(inv - Math.round(inv)) < 1e-9 && inv >= 1 ? v / Math.round(inv) : v * f; };
const median = (xs) => { const s = xs.slice().sort((a, b) => a - b); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : NaN; };

// ================================================================ periods
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
/**
 * Reads a period label. Returns null when the cell is not a period, otherwise
 * { fy, kind: 'year' | 'quarter' | 'half' | 'month' | 'date' | 'ltm', q?, month?, date?, estimate, split, partial, label }.
 * `fy` is the fiscal year the label names (for a split year such as 2023-24, the year it ends in).
 */
export function parsePeriod(v) {
  if (v === null || v === undefined || typeof v === 'boolean') return null;
  if (typeof v === 'number') return Number.isInteger(v) && v >= 1950 && v <= 2100 ? { fy: v, kind: 'year', estimate: false, label: String(v) } : null;
  const s = String(v).trim();
  if (!s || s.length > 60) return null;
  const low = s.toLowerCase();
  const estimate = /(?:19|20)\d{2}\s?[efp]\b|\b(forecast|budget|plan|projected|projection|estimate|estimated|guidance|target|proforma|pro forma)\b/i.test(s);
  const base = { estimate, label: s };
  if (/\b(ltm|ttm|trailing)\b/i.test(s)) return { ...base, fy: (/((?:19|20)\d{2})/.exec(s) || [])[1] ? +/((?:19|20)\d{2})/.exec(s)[1] : NaN, kind: 'ltm' };
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return { ...base, fy: +m[1], kind: 'date', month: +m[2], date: `${m[1]}-${m[2]}-${m[3]}` };
  m = /^(\d{1,2})[/.](\d{1,2})[/.]((?:19|20)\d{2})$/.exec(s);
  if (m) { const a = +m[1], b = +m[2]; const month = a > 12 ? b : b > 12 ? a : NaN; return { ...base, fy: +m[3], kind: 'date', month: Number.isFinite(month) ? month : undefined, ambiguousDate: !Number.isFinite(month) }; }
  m = /\bq([1-4])\s*['’\- ]?\s*((?:19|20)?\d{2})\b/i.exec(s) || null;
  if (m) return { ...base, fy: +m[2] < 100 ? 2000 + +m[2] : +m[2], kind: 'quarter', q: +m[1] };
  m = /((?:19|20)\d{2})\s*[- ]?\s*q([1-4])\b/i.exec(s);
  if (m) return { ...base, fy: +m[1], kind: 'quarter', q: +m[2] };
  m = /\bh([12])\s*['’\- ]?\s*((?:19|20)?\d{2})\b/i.exec(s) || /((?:19|20)\d{2})\s*[- ]?\s*h([12])\b/i.exec(s);
  if (m) { const y = /^\d{4}$/.test(m[1]) ? +m[1] : (+m[2] < 100 ? 2000 + +m[2] : +m[2]); return { ...base, fy: y, kind: 'half', h: /^\d{4}$/.test(m[1]) ? +m[2] : +m[1] }; }
  const partial = /\b(three|six|nine|3|6|9)\s+months?\b|\b(13|26|39)\s+weeks?\b/i.test(s);
  m = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(?:\d{1,2},?\s*)?((?:19|20)\d{2}|['’]\d{2})\b/i.exec(s) || /\b\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+((?:19|20)\d{2})\b/i.exec(s);
  if (m) m[2] = m[2].replace(/['’]/, '');
  if (m) { const y = +m[2] < 100 ? 2000 + +m[2] : +m[2]; const month = MONTHS.indexOf(m[1].toLowerCase()) + 1; const yearly = /\b(year|twelve months|12 months|52 weeks|53 weeks|fy)\b/i.test(s); return { ...base, fy: y, kind: yearly ? 'year' : 'month', month, partial }; }
  m = /\b(?:fy\s*)?((?:19|20)\d{2})\s*[/\-–]\s*(\d{2}|(?:19|20)\d{2})\b/i.exec(s);
  if (m) { const a = +m[1]; let b = +m[2]; if (b < 100) b = Math.floor(a / 100) * 100 + b; if (b === a + 1) return { ...base, fy: b, kind: 'year', split: true }; }
  m = /\bfy\s*['’]?(\d{4}|\d{2})\s?[aefp]?\b/i.exec(s);
  if (m) return { ...base, fy: +m[1] < 100 ? 2000 + +m[1] : +m[1], kind: 'year', partial };
  const years = low.match(/\b(?:19|20)\d{2}\b/g) || s.match(/(?:19|20)\d{2}(?=[aefp]\b)/gi);
  if (years && years.length === 1 && s.length <= 40) return { ...base, fy: +years[0].slice(0, 4), kind: 'year', partial };
  return null;
}
/** Fiscal year of a transaction or month-end date, for a fiscal year that ends in month `fyEnd` (1–12). */
export const fiscalYearOf = (iso, fyEnd = 12) => { const y = +iso.slice(0, 4), mo = +iso.slice(5, 7); return mo > fyEnd ? y + 1 : y; };

// ================================================================ units and currency in the sheet's own words
const CURRENCIES = [['USD', /\b(usd|us\$|u\.s\. dollars?|us dollars?)\b|\$/i], ['EUR', /\b(eur|euros?)\b|€/i], ['GBP', /\b(gbp|pounds? sterling|sterling)\b|£/i], ['JPY', /\b(jpy|yen)\b|¥/i], ['CNY', /\b(cny|rmb|yuan|renminbi)\b/i], ['CAD', /\b(cad|canadian dollars?)\b|c\$/i], ['AUD', /\b(aud|australian dollars?)\b|a\$/i], ['CHF', /\b(chf|swiss francs?)\b/i], ['INR', /\b(inr|rupees?)\b|₹/i], ['BRL', /\b(brl|reais|real)\b|r\$/i], ['MXN', /\b(mxn|pesos?)\b/i], ['SEK', /\bsek\b/i], ['NOK', /\bnok\b/i], ['DKK', /\bdkk\b/i], ['KRW', /\b(krw|won)\b|₩/i], ['HKD', /\b(hkd|hk\$)\b/i], ['SGD', /\b(sgd|s\$)\b/i], ['ZAR', /\b(zar|rand)\b/i]];
export const UNIT_NAMES = { 1: 'whole units', 1e3: 'thousands', 1e6: 'millions', 1e9: 'billions' };
/** What a piece of text says about units and currency: { unit, currency } (either may be null). */
export function readUnitText(text) {
  const t = String(text || '');
  let unit = null;
  if (/\b(in |\()?\s*(billions?|bn)\b|\b000,?000,?000s?\b/i.test(t)) unit = 1e9;
  else if (/\b(millions?|mm|mn|mio)\b|(?:[$€£¥]|\b(?:usd|eur|gbp|chf|cad|aud|jpy))\s?m\b|\(m\)|\b000,?000s?\b|['’]000,000/i.test(t)) unit = 1e6;
  else if (/\b(thousands?|k)\b|\b000s?\b|['’]000\b|\$\s?k\b|\(k\)/i.test(t)) unit = 1e3;
  else if (/\b(whole|actual|units of one|in dollars|in euros|in pounds)\b/i.test(t)) unit = 1;
  let currency = null;
  for (const [code, re] of CURRENCIES) if (re.test(t)) { currency = code; break; }
  return { unit, currency };
}

// ================================================================ labels
const OPEX_PARTS = [/^(selling|sales)( and |, | & )(marketing|distribution)/, /^(sales|selling|marketing|advertising)( expenses?| costs?)?$/, /^general( and | & )administrative/, /^(administrative|admin)( expenses?| costs?)?$/, /^research( and | & )development/, /^r ?& ?d( expenses?)?$/, /^other operating (expenses?|costs?)/, /^(distribution|fulfil?lment|technology and development|product development)( expenses?| costs?)?$/, /^(personnel|staff|employee) (expenses?|costs?)/, /^(rent|occupancy)( expenses?| costs?)?$/];
/** Strips account codes, note references and trailing qualifiers from a statement label. */
export function cleanLabel(raw) {
  return String(raw ?? '').replace(/^\s*\d{3,7}\s*[-.:)]?\s+/, '').replace(/\((note|notes|see)\s[^)]*\)/gi, '').replace(/\s*\[[^\]]*\]\s*$/, '').replace(/\s+/g, ' ').replace(/[:.;]+$/, '').trim();
}
/** The engine field a label most likely means: { field, part } or null. `part` marks one of several lines that add up to the field. */
export function matchField(raw) {
  const label = cleanLabel(raw), t = label.toLowerCase().replace(/[–—]/g, '-').replace(/[’]/g, "'");
  if (!t || t.length > 90) return null;
  if (OPEX_PARTS.some((p) => p.test(t))) return { field: 'opex', part: true };
  if (/cash .*operating activities|^(net )?cash (flow )?from operations$/.test(t)) return { field: 'cfo' };
  if (/cash .*investing activities/.test(t)) return { field: 'investingCF' };
  if (/cash .*financing activities/.test(t)) return { field: 'financingCF' };
  if (/^(product|service|net|total|operating|sales|subscription)s? revenues?$|^revenues?,? net$|^total net (sales|revenues?)$/.test(t)) return { field: 'revenue' };
  if (/^income tax (expense|provision)|^(provision for|income) taxes?$/.test(t)) return { field: 'tax' };
  if (/^(total )?(shareholders'?|stockholders'?|owners'?) (equity|funds)|^total equity$/.test(t)) return { field: 'equity' };
  if (/^(basic and )?diluted .*shares|shares .*diluted/.test(t)) return { field: 'shares' };
  if (/^total (debt|borrowings)$/.test(t)) return { field: 'longTermDebt' };
  const f = matchLabel(label.replace(/,\s*net$/i, ' net').replace(/\s*\([^)]*\)\s*$/, ''));
  return f ? { field: f } : null;
}
const EXPECT_POSITIVE = new Set(['cogs', 'opex', 'da', 'interestExpense', 'capex', 'dividends', 'buybacks']);
const STOCK = (field) => FIELD[field]?.st === 'bs';

// ================================================================ sheet profiling
function columnProfile(sheet, headerRow, c) {
  let numbers = 0, texts = 0, dates = 0, missing = 0, total = 0, s = 0, min = Infinity, max = -Infinity;
  const distinct = new Set(); let distinctOver = false;
  for (let r = headerRow + 1; r < sheet.rows.length; r++) {
    const v = sheet.rows[r][c]; total++;
    if (isBlank(v)) { missing++; continue; }
    if (typeof v === 'number') { numbers++; s += v; if (v < min) min = v; if (v > max) max = v; }
    else if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) dates++;
    else if (typeof v === 'string' && Number.isFinite(num(v))) { const x = num(v); numbers++; s += x; if (x < min) min = x; if (x > max) max = x; }
    else texts++;
    if (!distinctOver) { distinct.add(v); if (distinct.size > 5000) distinctOver = true; }
  }
  const present = total - missing;
  const type = !present ? 'empty' : dates >= 0.8 * present ? 'date' : numbers >= 0.8 * present ? 'number' : 'text';
  return { index: c, name: String(sheet.rows[headerRow][c] ?? `Column ${colLetter(c)}`).trim() || `Column ${colLetter(c)}`, type, missing, present, numbers, texts, dates, sum: numbers ? s : NaN, min: numbers ? min : NaN, max: numbers ? max : NaN, mean: numbers ? s / numbers : NaN, distinct: distinctOver ? '5000+' : distinct.size, mixed: type === 'number' ? texts : type === 'text' ? 0 : texts };
}

/** Looks at one sheet and says what it is, with a mapping proposal to review. */
export function profileSheet(sheet) {
  const rows = sheet.rows || [], nR = rows.length, nC = sheet.nCols || 0;
  const base = { name: sheet.name, nRows: nR, nCols: nC, hidden: !!sheet.hidden, kind: 'empty', issues: [] };
  if (!nR || !nC) return base;
  const headText = rows.slice(0, 12).map((r) => r.filter((v) => typeof v === 'string').join(' ')).join(' ');
  const unitInfo = readUnitText(`${sheet.name} ${headText}`);
  base.unit = unitInfo.unit; base.currency = unitInfo.currency;

  // ---- lines down, periods across: a header row with period labels
  let best = null;
  for (let r = 0; r < Math.min(nR, 40); r++) {
    const cells = rows[r].map((v, c) => ({ c, p: parsePeriod(v), n: typeof v === 'number' })).filter((x) => x.p && (x.p.kind === 'ltm' || Number.isFinite(x.p.fy)));
    if (cells.length < 1) continue;
    if (cells.every((x) => x.n) && (cells.length < 2 || new Set(cells.map((x) => x.p.fy)).size < cells.length || rows[r].some((v) => typeof v === 'number' && !parsePeriod(v)))) continue;
    const firstPeriodCol = cells[0].c;
    // rows below must carry numbers in those columns and text labels to their left
    let numRows = 0, labelRows = 0;
    for (let k = r + 1; k < Math.min(nR, r + 60); k++) {
      const hasNum = cells.some((x) => Number.isFinite(num(rows[k][x.c])));
      const hasLabel = rows[k].slice(0, firstPeriodCol).some((v) => typeof v === 'string' && v.trim() && !Number.isFinite(num(v)));
      if (hasNum) numRows++; if (hasNum && hasLabel) labelRows++;
    }
    const score = cells.length * 2 + labelRows - (firstPeriodCol === 0 ? 100 : 0);
    if (labelRows >= 2 && (!best || score > best.score)) best = { r, cells, score, firstPeriodCol };
  }
  if (best) {
    const { r: headerRow, cells } = best;
    // the label column: the one left of the periods with the most text below the header
    let labelCol = 0, mostText = -1;
    for (let c = 0; c < best.firstPeriodCol; c++) { let t = 0; for (let k = headerRow + 1; k < nR; k++) if (typeof rows[k][c] === 'string' && rows[k][c].trim()) t++; if (t > mostText) { mostText = t; labelCol = c; } }
    const lines = [];
    for (let k = headerRow + 1; k < nR; k++) {
      const label = rows[k][labelCol];
      if (typeof label !== 'string' || !label.trim()) continue;
      const values = cells.map((x) => num(rows[k][x.c]));
      if (!values.some(Number.isFinite)) continue;
      const m = matchField(label);
      const lu = readUnitText(label);
      lines.push({ r: k, label: label.trim(), field: m ? m.field : null, part: !!(m && m.part), sign: 0, values, cells: cells.map((x) => cellRef(sheet, k, x.c)), unit: /share/i.test(label) ? lu.unit : null, textCells: cells.filter((x) => !isBlank(rows[k][x.c]) && !Number.isFinite(num(rows[k][x.c]))).length });
    }
    const counts = { is: 0, bs: 0, cf: 0 };
    lines.forEach((l) => { if (l.field) counts[FIELD[l.field].st]++; });
    const matched = lines.filter((l) => l.field).length;
    if (matched >= 2 || (lines.length >= 3 && /income|profit|loss|balance|cash ?flow|statement|p&l/i.test(sheet.name))) {
      const st = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      resolveDuplicates(lines);
      return { ...base, kind: 'statement', orientation: 'periods-across', headerRow, labelCol, statement: matched ? st[0] : null, counts,
        periods: cells.map((x) => ({ c: x.c, ...x.p, use: !x.p.estimate && x.p.kind !== 'ltm' && !x.p.partial, header: String(rows[headerRow][x.c]) })), lines };
    }
  }

  // ---- a table with a header row
  let headerRow = -1;
  for (let r = 0; r < Math.min(nR - 1, 30); r++) {
    const cells = rows[r].filter((v) => !isBlank(v));
    if (cells.length < 2) continue;
    const strings = cells.filter((v) => typeof v === 'string' && !Number.isFinite(num(v)) && !/^\d{4}-\d{2}-\d{2}$/.test(v)).length;
    const next = rows[r + 1].filter((v) => !isBlank(v)).length;
    if (strings >= Math.max(2, 0.7 * cells.length) && next >= Math.min(2, cells.length)) { headerRow = r; break; }
  }
  if (headerRow < 0) return { ...base, kind: nR <= 60 ? 'notes' : 'unknown' };
  const columns = []; for (let c = 0; c < nC; c++) columns.push(columnProfile(sheet, headerRow, c));
  const dataRows = nR - headerRow - 1;
  const dateCols = columns.filter((c) => c.type === 'date');
  const numCols = columns.filter((c) => c.type === 'number');
  const textCols = columns.filter((c) => c.type === 'text');
  // one row per period, lines across
  const periodCol = columns.find((c) => { if (dataRows > 80 || c.present < 2) return false; let ok = 0; for (let r = headerRow + 1; r < nR; r++) if (parsePeriod(rows[r][c.index])) ok++; return ok >= 2 && ok >= 0.6 * c.present && (c.type !== 'number' || /year|period|fy|fiscal/i.test(c.name)); });
  const headerMatches = columns.map((c) => ({ c, m: matchField(c.name) })).filter((x) => x.m && x.c.type === 'number');
  if (periodCol && headerMatches.length >= 3) {
    const periodRows = []; for (let r = headerRow + 1; r < nR; r++) { const p = parsePeriod(rows[r][periodCol.index]); if (p && Number.isFinite(p.fy)) periodRows.push({ r, p }); }
    const lines = columns.filter((c) => c.index !== periodCol.index && c.type === 'number').map((c) => { const m = matchField(c.name); return { r: c.index, label: c.name, field: m ? m.field : null, part: !!(m && m.part), sign: 0, values: periodRows.map((x) => num(rows[x.r][c.index])), cells: periodRows.map((x) => cellRef(sheet, x.r, c.index)), unit: /share/i.test(c.name) ? readUnitText(c.name).unit : null, textCells: 0 }; });
    resolveDuplicates(lines);
    const counts = { is: 0, bs: 0, cf: 0 }; lines.forEach((l) => { if (l.field) counts[FIELD[l.field].st]++; });
    return { ...base, kind: 'statement', orientation: 'periods-down', headerRow, labelCol: periodCol.index, statement: Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0], counts,
      periods: periodRows.map((x) => ({ c: x.r, ...x.p, use: !x.p.estimate && x.p.kind !== 'ltm' && !x.p.partial, header: String(rows[x.r][periodCol.index]) })), lines, columns };
  }
  // long financial records: a date (or period), an account label, an amount
  let labelCol = null, labelScore = 0, accounts = null;
  for (const c of textCols) {
    if (typeof c.distinct !== 'number' || c.distinct > 400 || c.distinct < 2) continue;
    const counts = new Map();
    for (let r = headerRow + 1; r < nR; r++) { const v = rows[r][c.index]; if (typeof v === 'string' && v.trim()) counts.set(v.trim(), (counts.get(v.trim()) || 0) + 1); }
    const list = [...counts.entries()].map(([label, n]) => { const m = matchField(label); return { label, n, field: m ? m.field : null, part: !!(m && m.part) }; });
    const hit = list.filter((a) => a.field).length;
    if (hit >= 3 && hit / list.length > labelScore) { labelScore = hit / list.length; labelCol = c; accounts = list; }
  }
  const timeCol = dateCols[0] || columns.find((c) => /^(period|year|fiscal year|fy|date|month)/i.test(c.name) && c.present > 0);
  if (labelCol && labelScore >= 0.25 && timeCol && numCols.length) {
    const valueCol = numCols.find((c) => /amount|value|balance|total|usd|eur|gbp/i.test(c.name)) || numCols.slice().sort((a, b) => Math.abs(b.sum) - Math.abs(a.sum))[0];
    const currencyCol = columns.find((c) => c.type === 'text' && (/currency|ccy|curr\b/i.test(c.name)));
    const dims = textCols.filter((c) => c.index !== labelCol.index && (!currencyCol || c.index !== currencyCol.index) && typeof c.distinct === 'number' && c.distinct <= 200);
    resolveDuplicateAccounts(accounts);
    const vu = readUnitText(valueCol.name);
    return { ...base, kind: 'records', headerRow, columns, dateCol: timeCol.index, labelCol: labelCol.index, valueCol: valueCol.index, currencyCol: currencyCol ? currencyCol.index : null, dimCols: dims.map((c) => c.index),
      unit: vu.unit ?? base.unit ?? 1, currency: vu.currency ?? base.currency, accounts: accounts.map((a) => ({ ...a, mode: a.field && STOCK(a.field) ? 'last' : 'sum', sign: 0 })), dataRows };
  }
  if (dataRows >= 1 && columns.filter((c) => c.type !== 'empty').length >= 2) {
    const dateCol = dateCols[0] || null;
    return { ...base, kind: 'dataset', headerRow, columns, dateCol: dateCol ? dateCol.index : null, measures: numCols.filter((c) => !/\b(id|code|zip|postal|year)\b/i.test(c.name)).map((c) => c.index), dims: textCols.filter((c) => typeof c.distinct === 'number' && c.distinct <= 60 && c.distinct >= 2).map((c) => c.index), dataRows };
  }
  return { ...base, kind: 'notes' };
}
/** When several lines map to one field, keep the first as the mapping (operating-expense parts all stay: they add up). */
function resolveDuplicates(lines) {
  const seen = new Map();
  const hasTotalOpex = lines.some((l) => l.field === 'opex' && !l.part);
  for (const l of lines) {
    if (!l.field) continue;
    if (l.field === 'opex' && l.part) { if (hasTotalOpex) { l.field = null; l.note = 'part of total operating expenses (the total is mapped)'; } continue; }
    if (seen.has(l.field)) { l.note = `also looks like ${FIELD[l.field].label}, which “${seen.get(l.field)}” already maps to`; l.field = null; l.duplicate = true; }
    else seen.set(l.field, l.label);
  }
}
function resolveDuplicateAccounts(accounts) {
  const seen = new Map(); const hasTotalOpex = accounts.some((a) => a.field === 'opex' && !a.part);
  for (const a of accounts) {
    if (!a.field) continue;
    if (a.field === 'opex' && a.part) { if (hasTotalOpex) a.field = null; continue; }
    if (seen.has(a.field)) { a.note = `also looks like ${FIELD[a.field].label}`; a.field = null; } else seen.set(a.field, a.label);
  }
}

/** The distinct labels of a records sheet's account column with their proposed fields (used when the reviewer picks another column). */
export function recordsAccounts(sheet, profile, labelCol = profile.labelCol) {
  const counts = new Map(), rows = sheet.rows;
  for (let r = profile.headerRow + 1; r < rows.length; r++) { const v = rows[r][labelCol]; if (typeof v === 'string' && v.trim()) counts.set(v.trim(), (counts.get(v.trim()) || 0) + 1); }
  const list = [...counts.entries()].map(([label, n]) => { const m = matchField(label); return { label, n, field: m ? m.field : null, part: !!(m && m.part) }; });
  resolveDuplicateAccounts(list);
  return list.map((a2) => ({ ...a2, mode: a2.field && STOCK(a2.field) ? 'last' : 'sum', sign: 0 }));
}

// ================================================================ data quality over every row
/** Missing cells, exact duplicate rows, text in number columns and abnormal values for a table sheet. */
export function qualityOfTable(sheet, profile) {
  const out = { rows: 0, missing: 0, missingByColumn: [], duplicates: 0, duplicateExamples: [], mixed: [], outliers: [], negatives: [] };
  if (!profile || !profile.columns) return out;
  const rows = sheet.rows, h = profile.headerRow, seen = new Map();
  out.rows = rows.length - h - 1;
  profile.columns.forEach((c) => { if (c.missing && c.type !== 'empty') out.missingByColumn.push({ column: c.name, missing: c.missing, share: c.missing / (c.missing + c.present) }); out.missing += c.type === 'empty' ? 0 : c.missing; if (c.type === 'number' && c.texts) out.mixed.push({ column: c.name, texts: c.texts }); });
  for (let r = h + 1; r < rows.length; r++) {
    const key = rows[r].join('\u0001');
    const first = seen.get(key);
    if (first !== undefined) { out.duplicates++; if (out.duplicateExamples.length < 5) out.duplicateExamples.push({ row: (sheet.r0 || 0) + r + 1, sameAs: (sheet.r0 || 0) + first + 1 }); } else seen.set(key, r);
  }
  for (const c of profile.columns) {
    if (c.type !== 'number' || c.numbers < 20) continue;
    const vals = []; for (let r = h + 1; r < rows.length; r++) { const x = num(rows[r][c.index]); if (Number.isFinite(x)) vals.push(x); }
    // amounts and prices are right-skewed, so positive columns are judged on a log scale (a long tail is not an error)
    const logScale = c.min > 0, tr = logScale ? Math.log : (x) => x;
    const tv = vals.map(tr), medT = median(tv), mad = median(tv.map((x) => Math.abs(x - medT))) * 1.4826, med = median(vals);
    if (!(mad > 0)) continue;
    let n = 0; const ex = [];
    for (let r = h + 1; r < rows.length; r++) { const x = num(rows[r][c.index]); if (Number.isFinite(x) && Math.abs(tr(x) - medT) / mad > 12) { n++; if (ex.length < 3) ex.push({ cell: cellRef(sheet, r, c.index), value: x }); } }
    if (n && n <= Math.max(5, vals.length * 0.002)) out.outliers.push({ column: c.name, count: n, median: med, examples: ex });
    if (c.min < 0 && /price|units|quantity|qty|revenue|sales|cost/i.test(c.name)) { let neg = 0; for (const x of vals) if (x < 0) neg++; out.negatives.push({ column: c.name, count: neg }); }
  }
  return out;
}

/** The whole workbook: every sheet profiled, with workbook-level findings. */
export function analyseWorkbook(wb) {
  const sheets = wb.sheets.map((s) => { const p = profileSheet(s); if (p.kind === 'records' || p.kind === 'dataset') p.quality = qualityOfTable(s, p); return p; });
  const issues = (wb.warnings || []).map((text) => ({ level: 'warn', text }));
  const statementSheets = sheets.filter((s) => s.kind === 'statement');
  const units = [...new Set(statementSheets.map((s) => s.unit).filter(Boolean))];
  if (units.length > 1) issues.push({ level: 'warn', text: `The statement sheets state different units (${statementSheets.filter((s) => s.unit).map((s) => `${s.name}: ${UNIT_NAMES[s.unit]}`).join('; ')}). Each sheet is scaled by its own unit; confirm them in the mapping.` });
  const curs = [...new Set(sheets.map((s) => s.currency).filter(Boolean))];
  if (curs.length > 1) issues.push({ level: 'warn', text: `More than one currency is named (${sheets.filter((s) => s.currency).map((s) => `${s.name}: ${s.currency}`).join('; ')}). Figures are not converted: choose the reporting currency and leave out sheets in another one, or give an exchange rate.` });
  sheets.forEach((s) => { if (s.hidden) issues.push({ level: 'info', text: `Sheet “${s.name}” is hidden in the workbook; it was read like the others.` }); });
  return { name: wb.name, format: wb.format, bytes: wb.bytes, hasMacros: !!wb.hasMacros, sheets, issues, totalRows: sum(wb.sheets.map((s) => s.nRows)), totalCells: sum(wb.sheets.map((s) => s.cells || 0)),
    unit: units[0] || null, currency: curs[0] || null };
}

// ================================================================ from reviewed mappings to the company project
/** Default settings for buildProject, read from the analysis. */
export function defaultSettings(analysis) {
  const sheets = {};
  analysis.sheets.forEach((s) => { sheets[s.name] = { use: s.kind === 'statement' || s.kind === 'records', unit: s.unit || (s.kind === 'records' ? 1 : null), currency: s.currency || null }; });
  return { targetUnit: 1e6, currency: analysis.currency || 'USD', fyEndMonth: 12, includePartialYears: false, fx: {}, sheets };
}

/**
 * Builds the project (the same shape the Company Valuation Studio uses) from the workbook and the reviewed profiles.
 * Statement sheets are the primary source; long records fill what the statements lack and are cross-checked against them.
 * Returns { project, lineage, issues, coverage }.
 */
export function buildProject(wb, analysis, settings) {
  const S = settings, issues = [], lineage = {}, byYear = new Map();
  const target = S.targetUnit || 1e6;
  // each sheet is gathered on its own first (lines that are parts of one field add up within a sheet), then merged:
  // the first sheet to supply a figure keeps it, and a later sheet's figure for the same field and year is a cross-check
  let local = new Map();
  const put = (year, field, value, src) => {
    if (!fin(value)) return;
    if (src.signRow === -1) { value = -value; src.signFlipped = true; }
    const key = `${year}|${field}`, cur = local.get(key);
    if (!cur) { local.set(key, { year, field, value, src: src.additive ? { ...src, parts: [src] } : src }); return; }
    if (src.additive && cur.src.additive) { cur.value += value; cur.src.parts.push(src); cur.src.how = `sum of ${cur.src.parts.length} lines`; cur.src.cells = cur.src.parts.flatMap((x) => x.cells); cur.src.label = cur.src.parts.map((x) => x.label).join(' + '); }
  };
  const mergeSheet = () => {
    for (const { year, field, value, src } of local.values()) {
      const h = byYear.get(year) || { year }; byYear.set(year, h);
      lineage[year] ||= {};
      if (fin(h[field])) {
        const prev = lineage[year][field], a = h[field], rel = Math.abs(a - value) / Math.max(1e-9, Math.abs(a), Math.abs(value));
        if (rel > 0.005 && Math.abs(Math.abs(a) - Math.abs(value)) / Math.max(1e-9, Math.abs(a)) > 0.005) issues.push({ level: 'warn', text: `${year} ${FIELD[field].label}: “${src.sheet}” gives ${fmt(value)} but “${prev.sheet}” gives ${fmt(a)} (${(rel * 100).toFixed(1)}% apart). The first is kept.`, field, year });
        else (prev.confirmedBy ||= []).push(src.sheet);
        continue;
      }
      h[field] = value; lineage[year][field] = src;
    }
    local = new Map();
  };
  const fmt = (v) => v.toLocaleString('en-US', { maximumFractionDigits: 1 });
  const sheetByName = Object.fromEntries(wb.sheets.map((s) => [s.name, s]));
  const order = analysis.sheets.filter((p) => S.sheets[p.name]?.use).sort((a, b) => (a.kind === 'statement' ? 0 : 1) - (b.kind === 'statement' ? 0 : 1));
  const usedCurrencies = new Set();
  let unitUnknown = [];

  for (const p of order) {
    const conf = S.sheets[p.name], sheet = sheetByName[p.name];
    const unit = conf.unit || null;
    if (!unit) { unitUnknown.push(p.name); }
    const scale = (unit || target) / target;
    if (conf.currency) usedCurrencies.add(conf.currency);
    if (conf.currency && conf.currency !== S.currency && !fin(S.fx[conf.currency])) { issues.push({ level: 'error', text: `Sheet “${p.name}” is in ${conf.currency} but the project is in ${S.currency}, and no exchange rate was given. The sheet was left out rather than mixing currencies.` }); continue; }
    const fx = conf.currency && conf.currency !== S.currency ? S.fx[conf.currency] : 1;

    if (p.kind === 'statement') {
      // group the chosen period columns by fiscal year
      const cols = p.periods.map((per, k) => ({ ...per, k })).filter((per) => per.use && Number.isFinite(per.fy));
      const byFy = new Map(); cols.forEach((c) => { (byFy.get(c.fy) || byFy.set(c.fy, []).get(c.fy)).push(c); });
      p.periods.filter((per) => !per.use).forEach((per) => issues.push({ level: 'info', text: `“${p.name}”: column “${per.header}” was left out (${per.estimate ? 'a forecast or budget, not an actual' : per.kind === 'ltm' ? 'a trailing-twelve-month column' : per.partial ? 'a part-year period' : 'not selected'}).` }));
      for (const [fy, list] of byFy) {
        const annual = list.filter((c) => c.kind === 'year' || c.kind === 'date' || (c.kind === 'month' && list.length === 1));
        let pick = null, agg = null;
        if (annual.length) { pick = annual[0]; if (annual.length > 1) issues.push({ level: 'warn', text: `“${p.name}”: ${annual.length} columns are labelled fiscal ${fy} (${annual.map((c) => `“${c.header}”`).join(', ')}). The first is used; untick the others or correct their years.` }); }
        else {
          const q = list.filter((c) => c.kind === 'quarter'), hh = list.filter((c) => c.kind === 'half'), mo = list.filter((c) => c.kind === 'month');
          const full = q.length === 4 ? q : hh.length === 2 ? hh : mo.length === 12 ? mo : null;
          if (full) agg = full;
          else { issues.push({ level: 'warn', text: `“${p.name}”: fiscal ${fy} has ${list.length} part-year column${list.length === 1 ? '' : 's'} (${list.map((c) => c.header).join(', ')}), not a full year, so it was left out. Annual figures are needed.` }); continue; }
        }
        for (const l of p.lines) {
          if (!l.field || l.use === false) continue;
          const isShares = l.field === 'shares';
          const lineScale = isShares ? ((l.unit || unit || target) / target) : scale * fx;
          let v, cells, how = null;
          if (pick) { v = l.values[pick.k]; cells = [l.cells[pick.k]]; }
          else {
            const vals = agg.map((c) => l.values[c.k]);
            if (!vals.every(fin)) continue;
            if (STOCK(l.field) || isShares) { const lastC = agg.slice().sort((a, b) => (a.q || a.h || a.month) - (b.q || b.h || b.month)).pop(); v = l.values[lastC.k]; cells = [l.cells[lastC.k]]; how = `balance at the last of ${agg.length} periods`; }
            else { v = sum(vals); cells = agg.map((c) => l.cells[c.k]); how = `sum of ${agg.length} ${agg[0].kind}s`; }
          }
          if (!fin(v)) continue;
          put(fy, l.field, rescale(v, lineScale), { sheet: p.name, label: l.label, cells, unit: isShares ? (l.unit || unit) : unit, scaled: lineScale !== 1 ? lineScale : null, how, additive: l.part, signRow: l.sign, line: l });
        }
      }
    } else if (p.kind === 'records') {
      const rows = sheet.rows, h = p.headerRow;
      const acc = new Map(p.accounts.filter((a) => a.field && a.use !== false).map((a) => [a.label, a]));
      const fyEnd = S.fyEndMonth || 12;
      const bucket = new Map();   // `${fy}|${label}` -> { sum, lastDate, lastSum, months:Set, n, firstRow, lastRow }
      const otherCur = new Map(); let badDate = 0, badValue = 0;
      for (let r = h + 1; r < rows.length; r++) {
        const row = rows[r], label = typeof row[p.labelCol] === 'string' ? row[p.labelCol].trim() : null;
        const a = label ? acc.get(label) : null; if (!a) continue;
        const d = row[p.dateCol]; let fy, key;
        if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)) { fy = fiscalYearOf(d, fyEnd); key = d.slice(0, 10); }
        else { const per = parsePeriod(d); if (!per || !Number.isFinite(per.fy)) { badDate++; continue; } fy = per.fy; key = `${per.fy}-${String(per.month || per.q || 0).padStart(2, '0')}`; }
        let v = num(row[p.valueCol]); if (!fin(v)) { if (!isBlank(row[p.valueCol])) badValue++; continue; }
        if (p.currencyCol !== null) {
          const cur = String(row[p.currencyCol] || '').trim().toUpperCase();
          if (cur && cur !== S.currency) { if (fin(S.fx[cur])) v *= S.fx[cur]; else { const o = otherCur.get(cur) || { n: 0, sum: 0 }; o.n++; o.sum += v; otherCur.set(cur, o); continue; } }
          if (cur) usedCurrencies.add(cur);
        }
        const id = `${fy}|${label}`; let b = bucket.get(id);
        if (!b) { b = { fy, a, sum: 0, lastKey: '', lastSum: 0, months: new Set(), n: 0, firstRow: r, lastRow: r }; bucket.set(id, b); }
        b.sum += v; b.n++; b.lastRow = r; b.months.add(key.slice(0, 7));
        if (key > b.lastKey) { b.lastKey = key; b.lastSum = v; } else if (key === b.lastKey) b.lastSum += v;
      }
      if (badDate) issues.push({ level: 'warn', text: `“${p.name}”: ${badDate.toLocaleString('en-US')} rows have no readable date or period and were left out.` });
      if (badValue) issues.push({ level: 'warn', text: `“${p.name}”: ${badValue.toLocaleString('en-US')} rows have text where the amount should be and were left out.` });
      for (const [cur, o] of otherCur) issues.push({ level: 'error', text: `“${p.name}”: ${o.n.toLocaleString('en-US')} rows are in ${cur} (total ${fmt(o.sum)}), not ${S.currency}. They were left out rather than added to another currency; give a ${cur}→${S.currency} rate to include them.` });
      // a fiscal year needs twelve months of records to count as a year
      const monthsByFy = new Map(); for (const b of bucket.values()) { const m = monthsByFy.get(b.fy) || new Set(); b.months.forEach((x) => m.add(x)); monthsByFy.set(b.fy, m); }
      const monthly = [...monthsByFy.values()].some((m) => m.size > 1);
      for (const b of bucket.values()) {
        const nMonths = monthsByFy.get(b.fy).size;
        if (monthly && nMonths < 12 && !S.includePartialYears) continue;
        const stock = b.a.mode === 'last';
        put(b.fy, b.a.field, rescale(stock ? b.lastSum : b.sum, scale), { sheet: p.name, label: b.a.label, cells: [`rows ${(sheet.r0 || 0) + b.firstRow + 1}–${(sheet.r0 || 0) + b.lastRow + 1}`], unit, scaled: scale !== 1 ? scale : null, how: stock ? `balance at ${b.lastKey} across ${b.n.toLocaleString('en-US')} rows` : `sum of ${b.n.toLocaleString('en-US')} rows`, additive: b.a.part, signRow: b.a.sign });
      }
      if (monthly) for (const [fy, m] of monthsByFy) if (m.size < 12) issues.push({ level: 'warn', text: `“${p.name}”: fiscal ${fy} has ${m.size} month${m.size === 1 ? '' : 's'} of records, not twelve${S.includePartialYears ? '; it is included as a part year because you chose to' : ', so it was left out of the annual figures'}.` });
    }
    mergeSheet();
  }
  if (unitUnknown.length) issues.push({ level: 'warn', text: `No unit was found on ${unitUnknown.map((n) => `“${n}”`).join(', ')}; figures were taken as already in ${UNIT_NAMES[target]}. Set the unit in the mapping if that is wrong.` });

  // signs: expenses and outflows reported as negatives are stored as positive sizes, and said so
  const years = [...byYear.keys()].sort((a, b) => a - b);
  for (const f of EXPECT_POSITIVE) {
    const vals = years.map((y) => byYear.get(y)[f]).filter(fin).filter((v) => v !== 0);
    if (vals.length && vals.every((v) => v < 0)) { years.forEach((y) => { const h = byYear.get(y); if (fin(h[f])) { h[f] = -h[f]; lineage[y][f].signFlipped = true; } }); issues.push({ level: 'info', text: `${FIELD[f].label} is reported as a negative number in every year; the model stores its size as a positive figure.` }); }
    else if (vals.some((v) => v < 0)) issues.push({ level: 'warn', text: `${FIELD[f].label} is negative in some years and positive in others (${years.filter((y) => fin(byYear.get(y)[f]) && byYear.get(y)[f] < 0).join(', ')}). Check the sign convention in the source.`, field: f });
  }
  for (let i = 1; i < years.length; i++) if (years[i] - years[i - 1] > 1) issues.push({ level: 'warn', text: `No figures for fiscal ${years[i - 1] + 1}${years[i] - years[i - 1] > 2 ? `–${years[i] - 1}` : ''}: growth across the gap is not annual.` });
  const history = years.map((y) => byYear.get(y));
  const coverage = FIELDS.map((f) => ({ field: f.id, label: f.label, st: f.st, years: years.filter((y) => fin(byYear.get(y)[f.id])).length })).filter((c) => c.years > 0);
  if (!history.length) issues.push({ level: 'error', text: 'No annual figures could be built from the sheets selected. Map at least one statement or set of records.' });
  const project = {
    version: 1,
    meta: { name: (analysis.name || 'Company').replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase()), ticker: '', industry: 'general', maturity: 'mature', country: '', currency: S.currency, unit: target, unitLabel: UNIT_NAMES[target], fiscalYearEnd: MONTHS[(S.fyEndMonth || 12) - 1].replace(/^\w/, (ch) => ch.toUpperCase()), valuationDate: new Date().toISOString().slice(0, 10), title: '', analyst: '', comments: '' },
    source: { kind: 'upload', document: analysis.name, retrieved: new Date().toISOString().slice(0, 10), note: `Workbook ${analysis.name} (${analysis.format}; ${analysis.totalRows.toLocaleString('en-US')} rows in ${analysis.sheets.length} sheets) read in the browser. Sheets used: ${order.map((p) => p.name).join(', ')}.`,
      mapping: order.flatMap((p) => (p.kind === 'statement' ? p.lines : p.accounts).filter((l) => l.field && l.use !== false).map((l) => ({ label: `${p.name} › ${l.label}`, field: l.field }))) },
    history, market: {}, models: { dcf: true, comps: false, ddm: false, asset: true, fcfe: false, sotp: false, earnings: false, vc: false }, peers: [], risks: [], segments: [],
  };
  return { project, lineage, issues, coverage, currencies: [...usedCurrencies] };
}

// ================================================================ operational datasets
/** Totals of a measure by month, by year and by one dimension, over every row of a dataset sheet. */
export function summariseDataset(sheet, profile, { measure, dim = null, dateCol = profile.dateCol } = {}) {
  const rows = sheet.rows, h = profile.headerRow;
  const byMonth = new Map(), byYear = new Map(), byDim = new Map();
  let total = 0, n = 0, skipped = 0;
  for (let r = h + 1; r < rows.length; r++) {
    const v = num(rows[r][measure]);
    if (!fin(v)) { skipped++; continue; }
    total += v; n++;
    const d = dateCol !== null ? rows[r][dateCol] : null;
    if (typeof d === 'string' && /^\d{4}-\d{2}/.test(d)) { const mk = d.slice(0, 7), yk = d.slice(0, 4); byMonth.set(mk, (byMonth.get(mk) || 0) + v); byYear.set(yk, (byYear.get(yk) || 0) + v); }
    if (dim !== null) { const key = isBlank(rows[r][dim]) ? '(blank)' : String(rows[r][dim]); byDim.set(key, (byDim.get(key) || 0) + v); }
  }
  const sortKeys = (m) => [...m.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
  return { total, n, skipped, byMonth: sortKeys(byMonth), byYear: sortKeys(byYear), byDim: [...byDim.entries()].sort((a, b) => b[1] - a[1]) };
}
