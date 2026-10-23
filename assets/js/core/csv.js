// csv.js — parse pasted or uploaded tables, infer column types, and audit data quality.
// Nothing here edits values silently: parsing keeps the raw text beside every parsed value.

const MISSING = new Set(['', 'na', 'n/a', 'null', 'nan', 'none', '-', '—', '?', '#n/a']);
const DELIMS = [',', ';', '\t', '|'];

function splitLine(text, delim) {
  // RFC 4180-style: quoted fields, doubled quotes, newlines inside quotes
  const rows = []; let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"' && field === '') inQ = true;
    else if (c === delim) { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.length > 1 || row[0] !== '') rows.push(row);
  return rows;
}

function detectDelimiter(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim()).slice(0, 12);
  let best = ',', bestScore = -1;
  for (const d of DELIMS) {
    const counts = lines.map((l) => l.split(d).length - 1);
    if (!counts.length || counts[0] === 0) continue;
    const consistent = counts.filter((c) => c === counts[0]).length / counts.length;
    const score = consistent * 10 + Math.min(counts[0], 20) / 20;
    if (score > bestScore) { bestScore = score; best = d; }
  }
  return best;
}

const NUM_RE = /^[(]?[-+−]?\s*[$€£¥]?\s*[-+−]?(\d[\d,.]*|\.\d+)([eE][-+]?\d+)?\s*%?[)]?$/;
/** Parse "1,234.5", "$12", "(300)", "−4.2%", or with decimalComma "1.234,5". Keeps unit hints. */
export function parseNumber(raw, decimalComma = false) {
  let t = String(raw).trim();
  if (!NUM_RE.test(t)) return { value: NaN };
  const neg = /^\(.*\)$/.test(t) || /^[-−]/.test(t.replace(/[$€£¥\s(]/g, ''));
  const currency = /[$€£¥]/.test(t), percent = /%\)?$/.test(t);
  t = t.replace(/[()$€£¥%\s+]/g, '').replace(/−/g, '-');
  t = decimalComma ? t.replace(/\./g, '').replace(',', '.') : t.replace(/,/g, '');
  if (!/^-?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(t)) return { value: NaN };
  let v = parseFloat(t);
  if (neg && v > 0) v = -v;
  return { value: v, currency, percent };
}

const ISO = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}):(\d{2})(?::(\d{2}))?)?/;
const MDY = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/;
function validDate(y, mo, d, ms) {
  if (Number.isNaN(ms)) return NaN;
  const t = new Date(ms);
  return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d ? ms : NaN;
}
/**
 * Parse a date. ISO dates are unambiguous. For slash/dot dates, `order` is 'mdy', 'dmy' or 'auto' (per value:
 * day/month only when the first part can't be a month). inferColumn decides the order for a whole column, so a
 * column of day-first dates isn't read as month-first just because some of its days are 12 or less.
 */
export function parseDate(raw, order = 'auto') {
  const t = String(raw).trim();
  let m = t.match(ISO);
  if (m) return validDate(+m[1], +m[2], +m[3], Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)));
  m = t.match(MDY);
  if (m) {
    let [a, b, y] = [+m[1], +m[2], +m[3]];
    if (y < 100) y += 2000;
    let month = a, day = b;
    if (order === 'dmy' || (order === 'auto' && a > 12 && b <= 12)) { month = b; day = a; }
    return validDate(y, month, day, Date.UTC(y, month - 1, day));
  }
  return NaN;
}

/** Day/month order for a column of slash dates: { order, note } where note says when the order was a guess. */
function dateOrder(values) {
  let firstBig = 0, secondBig = 0, slash = 0;
  for (const v of values) { const m = String(v).trim().match(MDY); if (!m) continue; slash++; if (+m[1] > 12) firstBig++; if (+m[2] > 12) secondBig++; }
  if (!slash) return { order: 'auto', note: '' };
  if (firstBig && secondBig) return { order: 'auto', note: 'mixes day-first and month-first dates; each ambiguous one was read as month/day' };
  if (firstBig) return { order: 'dmy', note: '' };
  if (secondBig) return { order: 'mdy', note: '' };
  return { order: 'mdy', note: 'has dates that could be day/month or month/day; they were read as month/day' };
}

/**
 * Parse text into columns. Returns { columns, nRows, delimiter, header, warnings, rawRows }.
 * Each column: { name, type, values, raw, missing, unique, unit }.
 * type ∈ number | currency | percent | date | category | text | id
 */
export function parseTable(text, { maxRows = 50000 } = {}) {
  const warnings = [];
  const clean = String(text || '').replace(/^﻿/, '');
  if (!clean.trim()) return { error: 'The table is empty. Paste rows with a header line, or choose an example dataset.' };
  const delimiter = detectDelimiter(clean);
  let rows = splitLine(clean, delimiter);
  if (rows.length < 2) return { error: 'Only one row found. Add a header line and at least two rows of data.' };
  const width = Math.max(...rows.slice(0, 50).map((r) => r.length));
  const first = rows[0];
  const looksNumeric = (v) => !Number.isNaN(parseNumber(v).value);
  const header = first.filter((v) => looksNumeric(v)).length < Math.max(1, first.length / 2);
  let names = header ? first.map((v, i) => String(v).trim() || `Column ${i + 1}`) : Array.from({ length: width }, (_, i) => `Column ${i + 1}`);
  // unique names
  const seen = new Map();
  names = names.map((n) => { const c = seen.get(n) || 0; seen.set(n, c + 1); return c ? `${n} (${c + 1})` : n; });
  while (names.length < width) names.push(`Column ${names.length + 1}`);
  let body = header ? rows.slice(1) : rows;
  if (body.length > maxRows) { warnings.push(`Only the first ${maxRows.toLocaleString('en-US')} rows were read.`); body = body.slice(0, maxRows); }
  const ragged = body.filter((r) => r.length !== width).length;
  if (ragged) warnings.push(`${ragged} row${ragged > 1 ? 's have' : ' has'} a different number of fields; missing fields were treated as blank.`);

  const decimalComma = delimiter === ';';
  const columns = names.map((name, j) => {
    const raw = body.map((r) => (r[j] == null ? '' : String(r[j]).trim()));
    return inferColumn(name, raw, decimalComma);
  });
  columns.forEach((c) => { if (c.dateNote) warnings.push(`“${c.name}” ${c.dateNote}. Check the source.`); });
  return { columns, nRows: body.length, delimiter, decimalComma, header, warnings, rawRows: body.map((r) => names.map((_, j) => (r[j] == null ? '' : String(r[j]).trim()))) };
}

export function inferColumn(name, raw, decimalComma = false) {
  const present = raw.filter((v) => !MISSING.has(v.toLowerCase()));
  const missing = raw.length - present.length;
  const nums = present.map((v) => parseNumber(v, decimalComma));
  const numOk = nums.filter((p) => !Number.isNaN(p.value));
  const dateOk = present.filter((v) => !Number.isNaN(parseDate(v)) && /[-/.]/.test(v));
  const unique = new Set(present).size;
  let type = 'text', values, unit = '', dateNote = '';
  const share = (k) => (present.length ? k / present.length : 0);
  if (present.length && share(dateOk.length) >= 0.9 && dateOk.length >= numOk.length) {
    type = 'date';
    const d = dateOrder(present);
    values = raw.map((v) => (MISSING.has(v.toLowerCase()) ? NaN : parseDate(v, d.order)));
    dateNote = d.note;
  } else if (present.length && share(numOk.length) >= 0.9) {
    const pctShare = numOk.filter((p) => p.percent).length / numOk.length;
    const curShare = numOk.filter((p) => p.currency).length / numOk.length;
    type = pctShare > 0.5 ? 'percent' : curShare > 0.5 ? 'currency' : 'number';
    unit = type === 'percent' ? '%' : type === 'currency' ? '$' : '';
    values = raw.map((v) => (MISSING.has(v.toLowerCase()) ? NaN : parseNumber(v, decimalComma).value));
    const ints = numOk.every((p) => Number.isInteger(p.value));
    if (ints && unique === present.length && present.length > 20 && /(^|_|\s)(id|code|number|no)$|^id/i.test(name)) type = 'id';
  } else {
    values = raw.map((v) => (MISSING.has(v.toLowerCase()) ? null : v));
    if (unique <= Math.max(12, present.length * 0.2)) type = 'category';
    if (unique === present.length && present.length > 20) type = 'id';
  }
  const invalid = type === 'number' || type === 'currency' || type === 'percent' ? present.length - numOk.length : type === 'date' ? present.length - dateOk.length : 0;
  return { name, type, values, raw, missing, unique, unit, invalid, dateNote };
}

export const isNumeric = (c) => c.type === 'number' || c.type === 'currency' || c.type === 'percent';

/** Data quality audit with a transparent 0–100 score. */
export function audit(table, { dropDuplicates = false } = {}) {
  const { columns, rawRows } = table;
  const n = rawRows.length, m = columns.length;
  const key = (r) => r.join('␟');
  const seen = new Map(); const dupIdx = [];
  rawRows.forEach((r, i) => { const k = key(r); if (seen.has(k)) dupIdx.push(i); else seen.set(k, i); });
  const cells = n * m;
  const missingCells = columns.reduce((a, c) => a + c.missing, 0);
  const invalidCells = columns.reduce((a, c) => a + (c.invalid || 0), 0);
  const numeric = columns.filter(isNumeric);
  let outlierCells = 0, numericCells = 0;
  const outliers = numeric.map((c) => {
    const v = c.values.filter(Number.isFinite).sort((a, b) => a - b);
    numericCells += v.length;
    if (v.length < 8) return { name: c.name, count: 0 };
    const q = (p) => { const hh = (v.length - 1) * p, lo = Math.floor(hh); return v[lo] + (hh - lo) * (v[Math.ceil(hh)] - v[lo]); };
    const q1 = q(0.25), q3 = q(0.75), iqr = q3 - q1;
    const lo = q1 - 1.5 * iqr, hi = q3 + 1.5 * iqr;
    const count = v.filter((x) => x < lo || x > hi).length;
    outlierCells += count;
    return { name: c.name, count, lo, hi };
  });
  const constant = columns.filter((c) => c.unique <= 1).map((c) => c.name);
  const pMissing = cells ? missingCells / cells : 0;
  const pDup = n ? dupIdx.length / n : 0;
  const pOut = numericCells ? outlierCells / numericCells : 0;
  const pInvalid = cells ? invalidCells / cells : 0;
  const parts = [
    { label: 'Completeness', detail: `${missingCells} of ${cells} cells empty`, penalty: Math.min(40, pMissing * 200) },
    { label: 'Duplicates', detail: `${dupIdx.length} repeated row${dupIdx.length === 1 ? '' : 's'}`, penalty: Math.min(20, pDup * 200) },
    { label: 'Consistent types', detail: `${invalidCells} cell${invalidCells === 1 ? '' : 's'} that don't match their column's type`, penalty: Math.min(25, pInvalid * 250) },
    { label: 'Outliers', detail: `${outlierCells} value${outlierCells === 1 ? '' : 's'} outside 1.5 × IQR`, penalty: Math.min(15, pOut * 150) },
  ];
  const score = Math.round(Math.max(0, 100 - parts.reduce((a, p) => a + p.penalty, 0)));
  const suggestions = [];
  if (dupIdx.length) suggestions.push({ id: 'dedupe', text: `Remove ${dupIdx.length} exact duplicate row${dupIdx.length === 1 ? '' : 's'}`, active: dropDuplicates });
  columns.filter((c) => c.missing).forEach((c) => suggestions.push({ id: `missing:${c.name}`, info: true, text: `${c.name}: ${c.missing} empty — analyses skip those rows for this column only (pairwise), or for every selected column (listwise).` }));
  outliers.filter((o) => o.count).forEach((o) => suggestions.push({ id: `outlier:${o.name}`, info: true, text: `${o.name}: ${o.count} unusual value${o.count === 1 ? '' : 's'} (outside ${fmtShort(o.lo)} to ${fmtShort(o.hi)}). Kept as-is; check them before trusting a regression.` }));
  constant.forEach((name) => suggestions.push({ id: `const:${name}`, info: true, text: `${name} has a single value, so it can't explain anything. Leave it out of models.` }));
  return { n, m, score, parts, dupIdx, missingCells, outliers, constant, suggestions };
}
const fmtShort = (v) => (Math.abs(v) >= 1000 ? Math.round(v).toLocaleString('en-US') : Number(v.toPrecision(3)).toString());

/** Apply accepted transformations to a parsed table without touching the original. */
export function applyTransforms(table, { dropDuplicates }) {
  if (!dropDuplicates) return table;
  const a = audit(table);
  if (!a.dupIdx.length) return table;
  const drop = new Set(a.dupIdx);
  const keep = (arr) => arr.filter((_, i) => !drop.has(i));
  return {
    ...table,
    nRows: table.nRows - drop.size,
    rawRows: keep(table.rawRows),
    columns: table.columns.map((c) => inferColumn(c.name, keep(c.raw), table.decimalComma)),
  };
}
