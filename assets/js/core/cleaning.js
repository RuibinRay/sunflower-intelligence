// cleaning.js — the Data Cleaning Lab engine. Pure functions, no DOM.
// Reads and writes CSV without trimming anything, profiles columns, detects issues, applies cleaning steps (never in
// place), replays recipes, compares before and after, checks goals and writes a data quality report.
//
// Table model: { columns: [{ name, type? }], rows: [[cell, …]], ids?: [source row number, …] }
//   cells are strings as read, or numbers / null after conversion. Dates become ISO strings (YYYY-MM-DD).
//   `ids` follows each row through every step, so a row can always be traced back to the raw file.
// Statistics: SD is the sample SD (n − 1); quartiles use linear interpolation between order statistics (R type 7,
// the same as Excel's QUARTILE.INC and NumPy's default); skewness is the adjusted Fisher–Pearson coefficient G1
// (as Excel's SKEW and pandas).
import * as S from './stats.js?v=6';
import { mulberry32 } from './rng.js?v=6';

// ================================================================ constants
export const OPS = ['dedupe', 'dedupe-key', 'trim', 'case', 'map', 'to-number', 'to-date', 'fill', 'drop-missing', 'flag-missing', 'validate', 'outliers', 'transform', 'scale', 'encode', 'derive', 'rename', 'drop-column'];
export const OP_LABELS = {
  dedupe: 'Remove exact duplicates', 'dedupe-key': 'Remove repeated keys', trim: 'Trim spaces', case: 'Change case', map: 'Map values',
  'to-number': 'Convert to numbers', 'to-date': 'Convert to dates', fill: 'Fill missing values', 'drop-missing': 'Delete rows with missing values',
  'flag-missing': 'Flag missing values', validate: 'Validate values', outliers: 'Treat outliers', transform: 'Transform', scale: 'Scale',
  encode: 'Encode categories', derive: 'Derive a column', rename: 'Rename a column', 'drop-column': 'Delete a column',
};
export const ISSUE_KINDS = ['exact-duplicate', 'duplicate-key', 'near-duplicate', 'invalid-type', 'mixed-date-format', 'ambiguous-date', 'whitespace', 'case', 'inconsistent-category', 'missing', 'out-of-range', 'rule', 'outlier', 'skewed', 'constant'];
const MISSING = new Set(['', 'na', 'n/a', 'null', 'nan', 'none', '-', '—', '?', '#n/a']);
const BOOL = new Set(['yes', 'no', 'true', 'false', 'y', 'n', 't', 'f']);
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY = 86400000;
const SERIAL_EPOCH = Date.UTC(1899, 11, 30);   // Excel's 1900 date system: serial 1 = 1 January 1900 (valid from 1 March 1900)

/** The three course datasets: what they are, the columns worth watching, and the validation rules from the data dictionary. */
export const DATASETS = {
  'lantern-orders': {
    title: 'Lantern Coffee orders', file: 'lantern-orders.csv',
    blurb: 'A coffee roaster’s online-shop export, March–June 2026: one row per order.',
    watch: ['quantity', 'order_total', 'rating'], category: 'subscription',
    rules: [
      { rule: 'unique', column: 'order_id' },
      { rule: 'type', column: 'order_date', type: 'date' },
      { rule: 'range', column: 'order_date', min: '2026-03-01', max: '2026-06-30' },
      { rule: 'pattern', column: 'email', pattern: '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$' },
      { rule: 'in-set', column: 'region', values: ['North', 'South', 'East', 'West', 'Central'] },
      { rule: 'in-set', column: 'size_g', values: ['250', '480', '750', '1000'] },
      { rule: 'range', column: 'quantity', min: 1, max: 200, integer: true },
      { rule: 'range', column: 'unit_price', min: 10, max: 100 },
      { rule: 'range', column: 'discount', min: 0 },
      { rule: 'equals', column: 'order_total', expr: 'quantity * unit_price - discount', tol: 0.01 },
      { rule: 'in-set', column: 'channel', values: ['web', 'app'] },
      { rule: 'in-set', column: 'subscription', values: ['yes', 'no'] },
      { rule: 'range', column: 'rating', min: 1, max: 5, integer: true },
    ],
  },
  'harborview-bookings': {
    title: 'Harborview Hotel bookings', file: 'harborview-bookings.csv',
    blurb: 'An 80-room hotel’s bookings for stays from June 2025 to May 2026: one row per booking.',
    watch: ['total', 'rate', 'children'], category: 'channel',
    rules: [
      { rule: 'unique', column: 'booking_id' },
      { rule: 'range', column: 'check_in', min: '2025-06-01', max: '2026-05-31' },
      { rule: 'compare', column: 'check_out', op: '>', other: 'check_in' },
      { rule: 'compare', column: 'booked_on', op: '<=', other: 'check_in' },
      { rule: 'range', column: 'nights', min: 1, max: 14, integer: true },
      { rule: 'equals', column: 'nights', expr: 'days_between(check_in, check_out)', tol: 0 },
      { rule: 'in-set', column: 'room_type', values: ['Standard', 'Deluxe', 'Family', 'Suite'] },
      { rule: 'range', column: 'adults', min: 1, max: 4, integer: true },
      { rule: 'range', column: 'children', min: 0, max: 3, integer: true },
      { rule: 'range', column: 'rate', min: 100, max: 500 },
      { rule: 'in-set', column: 'channel', values: ['Direct', 'OTA', 'Phone', 'Corporate', 'Travel agent'] },
      { rule: 'in-set', column: 'country', values: ['United States', 'Canada', 'United Kingdom', 'Mexico', 'Germany', 'France', 'Japan', 'Australia', 'Ireland'] },
      { rule: 'in-set', column: 'status', values: ['Completed', 'Cancelled', 'No-show'] },
      { rule: 'equals', column: 'total', expr: 'nights * rate', tol: 0.5 },
    ],
  },
  'northfield-students': {
    title: 'Northfield University students', file: 'northfield-students.csv',
    blurb: 'A university’s student records for 2025–26: one row per student.',
    watch: ['study_hours', 'gpa', 'entry_score'], category: 'year',
    rules: [
      { rule: 'unique', column: 'student_id' },
      { rule: 'in-set', column: 'programme', values: ['Business Administration', 'Computer Science', 'Economics', 'Nursing', 'Psychology', 'Mechanical Engineering'] },
      { rule: 'range', column: 'year', min: 1, max: 4, integer: true },
      { rule: 'range', column: 'gpa', min: 0, max: 4 },
      { rule: 'range', column: 'credits', min: 0, max: 130, integer: true },
      { rule: 'range', column: 'attendance_pct', min: 0, max: 100 },
      { rule: 'range', column: 'study_hours', min: 0 },
      { rule: 'in-set', column: 'scholarship', values: ['yes', 'no'] },
      { rule: 'range', column: 'entry_score', min: 0, max: 100 },
      { rule: 'in-set', column: 'residence', values: ['On campus', 'Off campus', 'Family home'] },
    ],
  },
};

// ================================================================ cells
export const isMissing = (v) => v == null || (typeof v === 'number' && Number.isNaN(v)) || (typeof v === 'string' && MISSING.has(v.trim().toLowerCase()));
/** A cell as text: numbers without floating-point noise, missing as ''. */
export function cellText(v) {
  if (v == null) return '';
  if (typeof v === 'number') return Number.isFinite(v) ? String(+v.toPrecision(12)) : '';
  return String(v);
}
const cellKey = (v) => (v == null ? '∅' : typeof v === 'number' ? `n:${+v.toPrecision(12)}` : `s:${v}`);
const sameCell = (a, b) => (a == null && b == null) || (typeof a === typeof b && (typeof a === 'number' ? a === b || (Number.isNaN(a) && Number.isNaN(b)) : a === b));

/** A plain number: a JS number, or text like "12", "-3.5", "1e3" (no symbols, no separators). NaN otherwise. */
export function plainNumber(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : NaN;
  if (typeof v !== 'string') return NaN;
  const t = v.trim();
  return /^[-+]?(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?$/.test(t) ? parseFloat(t) : NaN;
}

/**
 * Read a number written for people: "$1,234.50", "(300)", "−4.2%", or with decimal ',' "1.234,50". Strict about the
 * grouping: with a decimal point, commas must separate groups of three digits, so "16,50" is not read as 1,650.
 * Returns { value, currency, percent, grouped } or null.
 */
export function readNumber(raw, decimal = '.') {
  if (typeof raw === 'number') return Number.isFinite(raw) ? { value: raw, currency: false, percent: false, grouped: false } : null;
  if (typeof raw !== 'string') return null;
  let t = raw.trim().replace(/−/g, '-');
  if (!t) return null;
  let neg = false;
  if (/^\(.*\)$/.test(t)) { neg = true; t = t.slice(1, -1).trim(); }
  const sign = () => { if (/^[-+]/.test(t)) { if (t[0] === '-') neg = !neg; t = t.slice(1).trim(); } };
  sign();
  const currency = /^[$€£¥]|[$€£¥]$/.test(t);
  t = t.replace(/^[$€£¥]\s*/, '').replace(/\s*[$€£¥]$/, '');
  sign();
  let percent = false;
  if (/%$/.test(t)) { percent = true; t = t.slice(0, -1).trim(); }
  let value, grouped = false;
  if (decimal === ',') {
    if (/^\d+(,\d+)?$/.test(t)) value = parseFloat(t.replace(',', '.'));
    else if (/^\d{1,3}([.\s  ']\d{3})+(,\d+)?$/.test(t)) { value = parseFloat(t.replace(/[.\s  ']/g, '').replace(',', '.')); grouped = true; }
    else return null;
  } else if (/^(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?$/.test(t)) value = parseFloat(t);
  else if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) { value = parseFloat(t.replace(/,/g, '')); grouped = true; }
  else return null;
  return { value: neg ? -value : value, currency, percent, grouped };
}
const looseNumber = (v, decimal = '.') => { const r = readNumber(v, decimal); return r ? r.value : NaN; };

// ================================================================ dates
const ISO_RE = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ]\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;
const YMD_RE = /^(\d{4})[/.](\d{1,2})[/.](\d{1,2})$/;
const SLASH_RE = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4}|\d{2})$/;
const WRITTEN_MDY = /^(?:[A-Za-z]{3,9}\.?,?\s+)?([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/;
const WRITTEN_DMY = /^(?:[A-Za-z]{3,9}\.?,?\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,9})\.?,?\s+(\d{4})$/;
const pad2 = (n) => String(n).padStart(2, '0');
function isoOf(y, m, d) {
  if (!(m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1000 && y <= 9999)) return null;
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d ? `${y}-${pad2(m)}-${pad2(d)}` : null;
}
function monthOf(word) {
  const w = word.toLowerCase().replace(/\.$/, '');
  if (w.length < 3) return 0;
  const i = MONTHS.findIndex((m) => m === w || m.startsWith(w) || (w === 'sept' && m === 'september'));
  return i + 1;
}
/** Two-digit years: 00–68 → 2000–2068, 69–99 → 1969–1999 (the POSIX strptime %y convention). */
const fullYear = (y) => (y.length === 4 ? +y : +y < 69 ? 2000 + +y : 1900 + +y);
const isoDate = (v) => typeof v === 'string' && ISO_RE.test(v.trim()) && !!isoOf(+v.trim().slice(0, 4), +v.trim().split('-')[1], parseInt(v.trim().split('-')[2], 10));
export const dateMs = (iso) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
const serialIso = (n) => new Date(SERIAL_EPOCH + n * DAY).toISOString().slice(0, 10);

/** The family of a date written as text: iso | ymd | slash4 | slash2 | written | serial | null. */
export function dateFamily(v) {
  if (typeof v === 'number') return Number.isInteger(v) ? 'serial' : null;
  if (typeof v !== 'string') return null;
  const t = v.trim();
  if (ISO_RE.test(t)) return 'iso';
  if (YMD_RE.test(t)) return 'ymd';
  const m = t.match(SLASH_RE);
  if (m) return m[3].length === 4 ? 'slash4' : 'slash2';
  if ((WRITTEN_MDY.test(t) && monthOf(t.match(WRITTEN_MDY)[1])) || (WRITTEN_DMY.test(t) && monthOf(t.match(WRITTEN_DMY)[2]))) return 'written';
  if (/^\d{4,7}$/.test(t)) return 'serial';
  return null;
}
export const FAMILY_LABEL = { iso: 'ISO (2026-03-04)', ymd: 'year first with slashes (2026/03/04)', slash4: 'slashes with a four-digit year (04/03/2026)', slash2: 'slashes with a two-digit year (3/14/26)', written: 'written out (March 5, 2026)', serial: 'spreadsheet serial numbers (46085)' };

/**
 * Read one date. order: 'auto' (a slash date that reads both ways is reported, not guessed), 'DMY', 'MDY' or 'YMD'.
 * serial: read whole numbers as spreadsheet serials. Returns { iso, format } or { ambiguous: true, dmy, mdy } or
 * { invalid: reason } or { missing: true }.
 */
export function parseDateCell(v, { order = 'auto', serial = false } = {}) {
  if (isMissing(v)) return { missing: true };
  if (typeof v === 'number') {
    if (!Number.isInteger(v)) return { invalid: 'a number with decimals, not a date' };
    if (!serial) return { invalid: 'a whole number: turn on spreadsheet serials to read it as a date' };
    return v >= 61 && v <= 2958465 ? { iso: serialIso(v), format: 'serial' } : { invalid: 'outside the range of spreadsheet serial dates' };
  }
  const t = String(v).trim();
  let m = t.match(ISO_RE);
  if (m) { const iso = isoOf(+m[1], +m[2], +m[3]); return iso ? { iso, format: 'iso' } : { invalid: 'not a real calendar date' }; }
  m = t.match(YMD_RE);
  if (m) { const iso = isoOf(+m[1], +m[2], +m[3]); return iso ? { iso, format: 'ymd' } : { invalid: 'not a real calendar date' }; }
  m = t.match(SLASH_RE);
  if (m) {
    const a = +m[1], b = +m[2];
    if (order === 'YMD') {
      if (m[3].length !== 2) return { invalid: 'the year comes last, so it can’t be read year first' };
      const iso = isoOf(fullYear(m[1].padStart(2, '0')), b, +m[3]);
      return iso ? { iso, format: 'ymd' } : { invalid: 'not a valid year/month/day date' };
    }
    const y = fullYear(m[3]);
    const dmy = isoOf(y, b, a), mdy = isoOf(y, a, b);
    if (order === 'DMY') return dmy ? { iso: dmy, format: 'dmy' } : { invalid: 'not a valid day/month/year date' };
    if (order === 'MDY') return mdy ? { iso: mdy, format: 'mdy' } : { invalid: 'not a valid month/day/year date' };
    if (dmy && mdy && dmy !== mdy) return { ambiguous: true, dmy, mdy };
    if (dmy) return { iso: dmy, format: mdy ? 'same' : 'dmy' };
    if (mdy) return { iso: mdy, format: 'mdy' };
    return { invalid: 'not a real calendar date either way round' };
  }
  m = t.match(WRITTEN_MDY);
  if (m && monthOf(m[1])) { const iso = isoOf(+m[3], monthOf(m[1]), +m[2]); return iso ? { iso, format: 'written' } : { invalid: 'not a real calendar date' }; }
  m = t.match(WRITTEN_DMY);
  if (m && monthOf(m[2])) { const iso = isoOf(+m[3], monthOf(m[2]), +m[1]); return iso ? { iso, format: 'written' } : { invalid: 'not a real calendar date' }; }
  if (/^\d+$/.test(t)) {
    const n = +t;
    if (!serial) return { invalid: 'a whole number: turn on spreadsheet serials to read it as a date' };
    return n >= 61 && n <= 2958465 ? { iso: serialIso(n), format: 'serial' } : { invalid: 'outside the range of spreadsheet serial dates' };
  }
  return { invalid: 'not a date format the lab can read' };
}
/** A date for rules: ISO strictly, or (loose) any unambiguous reading. Milliseconds or NaN. */
function dateValue(v, loose) {
  if (isMissing(v)) return NaN;
  if (!loose) return isoDate(v) ? dateMs(String(v).trim()) : NaN;
  const r = parseDateCell(v, { order: 'auto', serial: true });
  return r.iso ? dateMs(r.iso) : NaN;
}

// ================================================================ CSV
function detectDelimiter(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim()).slice(0, 12);
  let best = ',', bestScore = -1;
  for (const d of [',', ';', '\t', '|']) {
    const counts = lines.map((l) => { let n = 0, q = false; for (const c of l) { if (c === '"') q = !q; else if (c === d && !q) n++; } return n; });
    if (!counts.length || counts[0] === 0) continue;
    const score = (counts.filter((c) => c === counts[0]).length / counts.length) * 10 + Math.min(counts[0], 20) / 20;
    if (score > bestScore) { bestScore = score; best = d; }
  }
  return best;
}
/** RFC 4180 parsing that keeps every space: quoted fields, doubled quotes, line breaks inside quotes. */
function parseRows(text, delim) {
  const rows = []; let row = [], field = '', inQ = false, quoted = false;
  const endField = () => { row.push(field); field = ''; quoted = false; };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; } else field += c;
    } else if (c === '"' && field === '' && !quoted) { inQ = true; quoted = true; }
    else if (c === delim) endField();
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      endField();
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += c;
  }
  endField();
  if (row.length > 1 || row[0] !== '') rows.push(row);
  return rows;
}
/** Read CSV text (first line = column names). Throws an Error with a plain message when the text can't be a table. */
export function fromCSV(text, { maxRows = 100000 } = {}) {
  const clean = String(text ?? '').replace(/^﻿/, '');
  if (!clean.trim()) throw new Error('The text is empty. Paste rows with column names in the first line.');
  const delimiter = detectDelimiter(clean);
  const all = parseRows(clean, delimiter);
  if (all.length < 2) throw new Error('Only one line found. A table needs a line of column names and at least one row of data.');
  const warnings = [];
  const width = Math.max(...all.slice(0, 200).map((r) => r.length));
  const seen = new Map();
  const names = Array.from({ length: width }, (_, i) => {
    let n = String(all[0][i] ?? '').trim() || `column_${i + 1}`;
    const k = (seen.get(n) || 0) + 1; seen.set(n, k);
    if (k > 1) n = `${n}_${k}`;
    return n;
  });
  let body = all.slice(1);
  if (body.length > maxRows) { warnings.push(`Only the first ${maxRows.toLocaleString('en-US')} rows were read.`); body = body.slice(0, maxRows); }
  const ragged = body.filter((r) => r.length !== width).length;
  if (ragged) warnings.push(`${ragged} row${ragged === 1 ? ' has' : 's have'} a different number of fields from the header; short rows were padded with blanks.`);
  return {
    columns: names.map((name) => ({ name })),
    rows: body.map((r) => names.map((_, j) => (r[j] == null ? '' : r[j]))),
    ids: body.map((_, i) => i + 1),
    delimiter, warnings,
  };
}
const csvField = (v) => { const t = cellText(v); return /[",\r\n]|^\s|\s$/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
export function toCSV(table) {
  return `${[table.columns.map((c) => csvField(c.name)).join(','), ...table.rows.map((r) => r.map(csvField).join(','))].join('\n')}\n`;
}
/** A table from { columns: ['a', …] | [{name}], rows } (the lesson-config shape). */
export function tableFrom(spec) {
  const cols = (spec.columns || []).map((c) => (typeof c === 'string' ? { name: c } : { ...c }));
  const rows = (spec.rows || []).map((r) => cols.map((_, j) => (r[j] === undefined ? '' : r[j])));
  return { columns: cols, rows, ids: rows.map((_, i) => i + 1) };
}

// ================================================================ type inference and profile
const colIndex = (table, name) => table.columns.findIndex((c) => c.name === name);
const columnCells = (table, j) => table.rows.map((r) => r[j]);
const idName = (name) => /(^|[_\s-])id$/i.test(name) || /^id$/i.test(name);

function inferType(name, cells) {
  const present = cells.filter((c) => !isMissing(c));
  const n = present.length;
  if (!n) return 'text';
  if (idName(name)) return 'id';
  if (present.every((c) => typeof c === 'number')) return 'number';
  const texts = present.map(cellText);
  const lower = new Set(texts.map((t) => t.trim().toLowerCase()));
  if (lower.size <= 2 && [...lower].every((t) => BOOL.has(t))) return 'boolean';
  let dateLike = 0, serialLike = 0;
  for (const t of texts) { const f = dateFamily(t); if (f === 'serial') serialLike++; else if (f) dateLike++; }
  if (dateLike >= 0.5 * n && dateLike + serialLike >= 0.8 * n) return 'date';
  const dot = present.filter((c) => readNumber(c, '.')).length, comma = present.filter((c) => readNumber(c, ',')).length;
  if (Math.max(dot, comma) >= 0.8 * n) return 'number';
  const distinct = new Set(texts).size;
  if (distinct === n && n >= 20 && texts.every((t) => /\d/.test(t) && !/\s/.test(t.trim()))) return 'id';
  if (distinct <= Math.max(12, 0.2 * n)) return 'category';
  return 'text';
}
const guessDecimal = (cells) => {
  const present = cells.filter((c) => !isMissing(c) && typeof c === 'string');
  const dot = present.filter((c) => readNumber(c, '.')).length, comma = present.filter((c) => readNumber(c, ',')).length;
  return comma > dot ? ',' : '.';
};

/** One column's profile. */
export function profileColumn(table, j) {
  const col = table.columns[j];
  const cells = columnCells(table, j);
  const type = col.type || inferType(col.name, cells);
  const present = cells.filter((c) => !isMissing(c));
  const counts = new Map();
  for (const c of present) { const k = cellText(c); counts.set(k, (counts.get(k) || 0) + 1); }
  const top = [...counts].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)).slice(0, 5);
  const examples = [...counts.keys()].slice(0, 3);
  const p = { name: col.name, type, count: cells.length, missing: cells.length - present.length, invalid: 0, unique: counts.size, top, examples };
  if (type === 'number') {
    const decimal = col.decimal || guessDecimal(cells);
    const vals = [];
    let invalid = 0, text = 0;
    for (const c of present) {
      const v = typeof c === 'number' ? c : looseNumber(c, decimal);
      if (Number.isFinite(v)) { vals.push(v); if (typeof c === 'string' && !Number.isFinite(plainNumber(c))) text++; } else invalid++;
    }
    const s = S.sorted(vals);
    Object.assign(p, {
      invalid, decimal, formatted: text, storage: present.every((c) => typeof c === 'number') ? 'number' : 'text',
      n: vals.length, min: s[0], max: s[s.length - 1], mean: S.mean(vals), median: S.quantileSorted(s, 0.5), sd: S.sd(vals),
      q1: S.quantileSorted(s, 0.25), q3: S.quantileSorted(s, 0.75), skew: S.skewness(vals),
      integer: vals.length > 0 && vals.every(Number.isInteger),
    });
    if (!vals.length) Object.assign(p, { min: NaN, max: NaN });
  } else if (type === 'date') {
    const families = {};
    let invalid = 0, ambiguous = 0;
    const isos = [];
    for (const c of present) {
      const f = dateFamily(c) || 'other';
      families[f] = (families[f] || 0) + 1;
      const r = parseDateCell(c, { order: 'auto', serial: true });
      if (r.iso) isos.push(r.iso); else if (r.ambiguous) ambiguous++; else invalid++;
    }
    isos.sort();
    Object.assign(p, { invalid, ambiguous, families, min: isos[0] ?? null, max: isos[isos.length - 1] ?? null, storage: present.every((c) => isoDate(c)) ? 'iso' : 'text' });
  } else if (type === 'boolean') {
    p.invalid = present.filter((c) => !BOOL.has(cellText(c).trim().toLowerCase())).length;
  }
  return p;
}
/** Profile every column: type, counts, and for numbers min, max, mean, median, sample SD, quartiles (type 7) and skewness. */
export function profile(table) { return table.columns.map((_, j) => profileColumn(table, j)); }

// ================================================================ expressions (for equals rules)
function tokenize(src) {
  const out = []; let i = 0;
  const s = String(src).replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[\d.]/.test(c)) { const m = s.slice(i).match(/^(\d+(\.\d*)?|\.\d+)/); if (!m) throw new Error(`Unexpected “${c}” in the expression.`); out.push({ t: 'num', v: parseFloat(m[0]) }); i += m[0].length; continue; }
    if (/[A-Za-z_]/.test(c)) { const m = s.slice(i).match(/^[A-Za-z_][A-Za-z0-9_]*/); out.push({ t: 'id', v: m[0] }); i += m[0].length; continue; }
    if (c === '`') { const e = s.indexOf('`', i + 1); if (e < 0) throw new Error('A column name in backticks isn’t closed.'); out.push({ t: 'id', v: s.slice(i + 1, e) }); i = e + 1; continue; }
    if ('+-*/(),'.includes(c)) { out.push({ t: c }); i++; continue; }
    throw new Error(`Unexpected “${c}” in the expression.`);
  }
  return out;
}
const FUNCS = { days_between: 2, abs: 1, round: 2 };
/** Compile an arithmetic expression over column names: + − × ÷, brackets, days_between(a, b), abs(x), round(x, digits). */
export function compileExpr(src, names) {
  const toks = tokenize(src); let p = 0;
  const used = new Set();
  const peek = () => toks[p], eat = (t) => { if (toks[p]?.t !== t) throw new Error(`Expected “${t}” in the expression.`); p++; };
  const primary = () => {
    const tk = toks[p++];
    if (!tk) throw new Error('The expression ends too soon.');
    if (tk.t === 'num') return { k: 'num', v: tk.v };
    if (tk.t === '-') return { k: 'neg', a: primary() };
    if (tk.t === '(') { const e = expr(); eat(')'); return e; }
    if (tk.t === 'id') {
      if (peek()?.t === '(' && FUNCS[tk.v] != null) {
        p++; const args = [expr()];
        while (peek()?.t === ',') { p++; args.push(expr()); }
        eat(')');
        if (args.length !== FUNCS[tk.v] && !(tk.v === 'round' && args.length === 1)) throw new Error(`${tk.v} takes ${FUNCS[tk.v]} values.`);
        return { k: 'fn', name: tk.v, args };
      }
      if (!names.includes(tk.v)) throw new Error(`There is no column called “${tk.v}”.`);
      used.add(tk.v);
      return { k: 'col', name: tk.v };
    }
    throw new Error('The expression isn’t complete.');
  };
  const term = () => { let a = primary(); while (peek() && (peek().t === '*' || peek().t === '/')) { const op = toks[p++].t; a = { k: 'bin', op, a, b: primary() }; } return a; };
  const expr = () => { let a = term(); while (peek() && (peek().t === '+' || peek().t === '-')) { const op = toks[p++].t; a = { k: 'bin', op, a, b: term() }; } return a; };
  const ast = expr();
  if (p < toks.length) throw new Error('Something follows the end of the expression.');
  const ev = (n, get) => {
    switch (n.k) {
      case 'num': return n.v;
      case 'col': return get(n.name, 'number');
      case 'neg': return -ev(n.a, get);
      case 'bin': { const a = ev(n.a, get), b = ev(n.b, get); return n.op === '+' ? a + b : n.op === '-' ? a - b : n.op === '*' ? a * b : a / b; }
      case 'fn':
        if (n.name === 'days_between') {
          const [x, y] = n.args.map((a) => (a.k === 'col' ? get(a.name, 'date') : NaN));
          return (y - x) / DAY;
        }
        if (n.name === 'abs') return Math.abs(ev(n.args[0], get));
        { const f = 10 ** (n.args[1] ? ev(n.args[1], get) : 0); return Math.round(ev(n.args[0], get) * f) / f; }
      default: return NaN;
    }
  };
  return { columns: [...used], eval: (get) => ev(ast, get) };
}
const prettyExpr = (e) => String(e).replace(/\s*\*\s*/g, ' × ').replace(/\s*\/\s*/g, ' ÷ ').replace(/\s+-\s+/g, ' − ');

// ================================================================ rules (validation rules and goals share one shape)
const numFor = (loose) => (loose ? (v) => looseNumber(v) : plainNumber);
const short = (v) => { const t = cellText(v); return t.length > 24 ? `${t.slice(0, 23)}…` : t; };
const quoteList = (vals, n = 4) => vals.slice(0, n).map((v) => `“${short(v)}”`).join(', ') + (vals.length > n ? ', …' : '');
const plural = (n, one, many = `${one}s`) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
const fmtNum = (v) => (Number.isFinite(v) ? (Math.abs(v) >= 1000 ? (+v.toFixed(2)).toLocaleString('en-US') : String(+v.toPrecision(4))).replace(/^-/, '−') : '—');
const isDateBound = (b) => typeof b === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b);

/** Plain-English text for a rule or goal. */
export function ruleText(r) {
  switch (r.rule) {
    case 'unique': return `${r.column} has no repeated values`;
    case 'no-missing': return `${r.column} has no missing values`;
    case 'type': return `${r.column} is stored as ${r.type === 'number' ? 'numbers' : r.type === 'date' ? 'ISO dates (YYYY-MM-DD)' : r.type}`;
    case 'in-set': return `${r.column} is one of ${r.values.join(', ')}`;
    case 'range': {
      const lo = r.min != null, hi = r.max != null;
      const what = r.integer ? 'whole numbers ' : '';
      return `${r.column} is ${what}${lo && hi ? `from ${r.min} to ${r.max}` : lo ? `at least ${r.min}` : hi ? `at most ${r.max}` : 'in range'}`;
    }
    case 'pattern': return `${r.column} matches the pattern ${r.pattern}`;
    case 'rows-between': return `The table has between ${r.min} and ${r.max} rows`;
    case 'equals': return `${r.column} = ${prettyExpr(r.expr)}${r.tol ? ` (within ${r.tol})` : ''}`;
    case 'compare': return `${r.column} ${{ '>': 'is after or above', '>=': 'is on or after', '<': 'is before or below', '<=': 'is on or before', '!=': 'differs from' }[r.op] || r.op} ${r.other}`;
    default: return r.text || String(r.rule);
  }
}

/** Evaluate one rule. loose: read "$12" as a number and any unambiguous date (detection); strict for goals. */
export function evalRule(table, r, { loose = false } = {}) {
  const res = (rows, detail, extra = {}) => ({ met: rows.length === 0 && !extra.fail, rows, count: rows.length, detail, text: r.text || ruleText(r), ...extra });
  if (r.rule === 'rows-between') {
    const n = table.rows.length, ok = (r.min == null || n >= r.min) && (r.max == null || n <= r.max);
    return res([], `${plural(n, 'row')}${ok ? '' : ` (needs ${r.min ?? 0}–${r.max ?? '∞'})`}`, { fail: !ok });
  }
  const j = colIndex(table, r.column);
  if (j < 0) return res([], `There is no column called ${r.column}.`, { fail: true });
  const cells = columnCells(table, j);
  const num = numFor(loose);
  const bad = [];
  switch (r.rule) {
    case 'unique': {
      const seen = new Map();
      cells.forEach((c, i) => { if (isMissing(c)) return; const k = cellKey(c); if (seen.has(k)) bad.push(i); else seen.set(k, i); });
      const vals = [...new Set(bad.map((i) => cellText(cells[i])))];
      return res(bad, bad.length ? `${plural(vals.length, 'value')} appear more than once: ${quoteList(vals)}` : `All ${plural(cells.filter((c) => !isMissing(c)).length, 'value')} are different`);
    }
    case 'no-missing': {
      cells.forEach((c, i) => { if (isMissing(c)) bad.push(i); });
      return res(bad, bad.length ? `${plural(bad.length, 'value')} missing` : 'No missing values');
    }
    case 'type': {
      const ok = r.type === 'number' ? (c) => Number.isFinite(plainNumber(c)) : r.type === 'date' ? isoDate : r.type === 'boolean' ? (c) => BOOL.has(cellText(c).trim().toLowerCase()) : () => true;
      cells.forEach((c, i) => { if (!isMissing(c) && !ok(c)) bad.push(i); });
      return res(bad, bad.length ? `${plural(bad.length, 'value')} aren’t ${r.type === 'number' ? 'plain numbers' : r.type === 'date' ? 'ISO dates' : r.type}, e.g. ${quoteList(bad.map((i) => cells[i]), 3)}` : `Every value is ${r.type === 'number' ? 'a number' : r.type === 'date' ? 'an ISO date' : `a ${r.type}`}`);
    }
    case 'in-set': {
      const allowed = new Set(r.values.map(String));
      cells.forEach((c, i) => { if (!isMissing(c) && !allowed.has(cellText(c))) bad.push(i); });
      const vals = [...new Set(bad.map((i) => cellText(cells[i])))];
      return res(bad, bad.length ? `${plural(bad.length, 'value')} outside the list: ${quoteList(vals)}` : 'Every value is on the list');
    }
    case 'range': {
      const dates = isDateBound(r.min) || isDateBound(r.max);
      const lo = r.min == null ? -Infinity : dates ? dateMs(r.min) : +r.min, hi = r.max == null ? Infinity : dates ? dateMs(r.max) : +r.max;
      let skipped = 0;
      cells.forEach((c, i) => {
        if (isMissing(c)) return;
        const v = dates ? dateValue(c, loose) : num(c);
        if (!Number.isFinite(v)) { if (loose) skipped++; else bad.push(i); return; }
        if (v < lo || v > hi || (r.integer && !Number.isInteger(v))) bad.push(i);
      });
      const vals = [...new Set(bad.map((i) => cellText(cells[i])))];
      return res(bad, bad.length ? `${plural(bad.length, 'value')} break it: ${quoteList(vals)}` : `Every value is in range${skipped ? ` (${skipped} couldn’t be read and weren’t checked)` : ''}`);
    }
    case 'pattern': {
      let re; try { re = new RegExp(r.pattern, r.flags || ''); } catch { return res([], 'The pattern isn’t a valid regular expression.', { fail: true }); }
      cells.forEach((c, i) => { if (!isMissing(c) && !re.test(cellText(c))) bad.push(i); });
      return res(bad, bad.length ? `${plural(bad.length, 'value')} don’t match, e.g. ${quoteList(bad.map((i) => cells[i]), 3)}` : 'Every value matches');
    }
    case 'equals': {
      let fn; try { fn = compileExpr(r.expr, table.columns.map((c) => c.name)); } catch (e) { return res([], e.message, { fail: true }); }
      const idx = Object.fromEntries(table.columns.map((c, k) => [c.name, k]));
      const tol = r.tol ?? 0.005;
      let unread = 0;
      table.rows.forEach((row, i) => {
        if (isMissing(row[j]) || fn.columns.some((n) => isMissing(row[idx[n]]))) return;
        const get = (n, kind) => (kind === 'date' ? dateValue(row[idx[n]], loose) : num(row[idx[n]]));
        const lhs = num(row[j]), rhs = fn.eval(get);
        if (!Number.isFinite(lhs) || !Number.isFinite(rhs)) { if (loose) return; unread++; bad.push(i); return; }
        if (Math.abs(lhs - rhs) > tol + 1e-9) bad.push(i);
      });
      return res(bad, bad.length ? `${plural(bad.length - unread, 'row')} disagree${unread ? `; ${plural(unread, 'row')} can’t be checked until the columns are numbers` : ''}` : 'Every row agrees');
    }
    case 'compare': {
      const k = colIndex(table, r.other);
      if (k < 0) return res([], `There is no column called ${r.other}.`, { fail: true });
      const dates = profileColumn(table, j).type === 'date' || isoDate(cells.find((c) => !isMissing(c)));
      const val = (c) => (dates ? dateValue(c, loose) : num(c));
      const test = { '>': (a, b) => a > b, '>=': (a, b) => a >= b, '<': (a, b) => a < b, '<=': (a, b) => a <= b, '!=': (a, b) => a !== b }[r.op] || (() => true);
      table.rows.forEach((row, i) => {
        if (isMissing(row[j]) || isMissing(row[k])) return;
        const a = val(row[j]), b = val(row[k]);
        if (!Number.isFinite(a) || !Number.isFinite(b)) { if (!loose) bad.push(i); return; }
        if (!test(a, b)) bad.push(i);
      });
      return res(bad, bad.length ? `${plural(bad.length, 'row')} break it` : 'Every row passes');
    }
    default: return res([], 'Unknown rule.', { fail: true });
  }
}

/** Check goals against the current table. Goals use the rule shape: { id, rule, column, … , text? }. */
export function checkGoals(table, goals = []) {
  return goals.map((g, i) => { const r = evalRule(table, g); return { id: g.id ?? `goal-${i + 1}`, text: g.text || ruleText(g), met: r.met, detail: r.detail, rows: r.rows }; });
}

// ================================================================ suggested mappings for messy categories
const COUNTRIES = [
  ['united states', 'us', 'usa', 'united states of america', 'america'], ['united kingdom', 'uk', 'gb', 'gbr', 'great britain', 'britain'],
  ['canada', 'ca', 'can'], ['germany', 'de', 'deu', 'deutschland'], ['france', 'fr', 'fra'], ['mexico', 'mx', 'mex'], ['japan', 'jp', 'jpn'],
  ['australia', 'au', 'aus'], ['ireland', 'ie', 'irl'], ['spain', 'es', 'esp', 'espana'], ['italy', 'it', 'ita'], ['netherlands', 'nl', 'nld', 'holland', 'the netherlands'],
  ['china', 'cn', 'chn'], ['india', 'in', 'ind'], ['brazil', 'br', 'bra', 'brasil'], ['south korea', 'kr', 'kor', 'korea', 'republic of korea'],
  ['switzerland', 'ch', 'che'], ['new zealand', 'nz', 'nzl'], ['costa rica', 'cr', 'cri'], ['saudi arabia', 'sa', 'sau', 'ksa'], ['portugal', 'pt', 'prt'], ['sweden', 'se', 'swe'],
];
const COUNTRY_OF = new Map(COUNTRIES.flatMap((names) => names.map((n) => [n.replace(/\s+/g, ''), names[0]])));
/** Normalised key: no accents, lower case, punctuation as spaces, single spaces, & as "and". */
export function normKey(v) {
  return cellText(v).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, ' and ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}
/** Damerau–Levenshtein (optimal string alignment) distance, with the kinds of edit used. */
function editDistance(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => { const r = new Array(n + 1).fill(0); r[0] = i; return r; });
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    const cost = a[i - 1] === b[j - 1] ? 0 : 1;
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
  }
  return d[m][n];
}
const substitutionOnly = (a, b) => a.length === b.length && [...a].filter((c, i) => c !== b[i]).length === 1 && !([...a].sort().join('') === [...b].sort().join(''));

/**
 * Suggest how to merge spelling variants. Values are grouped by a normalised key (trim, case, punctuation, accents),
 * then rarer groups join a bigger one when they are its abbreviation (“N.” → north, “Bus. Admin.” → business
 * administration), its initials (“CS”), a country code or a one-letter typing slip. Each group maps to its most
 * frequent spelling, or to an allowed value when `targets` is given. Returns { variant: target }.
 */
export function suggestMapping(values, { targets } = {}) {
  const counts = new Map();
  for (const v of values) { if (isMissing(v)) continue; const t = cellText(v); counts.set(t, (counts.get(t) || 0) + 1); }
  const allowed = (targets || []).map(String);
  const keys = new Map();
  const groupOf = (k) => { if (!keys.has(k)) keys.set(k, { key: k, members: new Map(), total: 0, parent: null }); return keys.get(k); };
  for (const [raw, n] of counts) { const g = groupOf(normKey(raw)); g.members.set(raw, n); g.total += n; }
  for (const a of allowed) groupOf(normKey(a));
  // country codes and names, when the column looks like countries
  const all = [...keys.values()];
  const countryShare = all.reduce((s, g) => s + (COUNTRY_OF.has(g.key.replace(/\s+/g, '')) ? g.total : 0), 0) / Math.max(1, all.reduce((s, g) => s + g.total, 0));
  if (countryShare >= 0.5) {
    for (const g of all) {
      const c = COUNTRY_OF.get(g.key.replace(/\s+/g, ''));
      if (c && c !== g.key) { const t = groupOf(c); if (t !== g) g.parent = t; }
    }
  }
  const root = (g) => { while (g.parent) g = g.parent; return g; };
  const isTarget = (g) => allowed.some((a) => normKey(a) === g.key);
  const size = (g) => g.total + (isTarget(g) ? 0.5 : 0);
  const tokens = (k) => k.split(' ').filter(Boolean);
  const ordered = [...keys.values()].filter((g) => !g.parent).sort((a, b) => size(a) - size(b) || a.key.localeCompare(b.key));
  for (const g of ordered) {
    if (!g.total || g.parent || isTarget(g)) continue;
    const gt = tokens(g.key), compact = g.key.replace(/\s+/g, '');
    const cands = { prefix: [], acronym: [], compact: [], typo: [] };
    for (const t of keys.values()) {
      if (t === g || t.parent || size(t) <= size(g) || !t.key) continue;
      const tt = tokens(t.key);
      if (gt.length === tt.length && gt.every((w, i) => tt[i].startsWith(w)) && g.key !== t.key) cands.prefix.push(t);
      else if (tt.length >= 2 && !g.key.includes(' ') && compact.length >= 2 && compact === tt.map((w) => w[0]).join('')) cands.acronym.push(t);
      else if (compact === t.key.replace(/\s+/g, '')) cands.compact.push(t);
      else if (t.key.length >= 4 && g.total * 3 <= t.total) {
        const dist = editDistance(g.key, t.key), lim = t.key.length >= 8 ? 2 : 1;
        if (dist <= lim && !(t.key.length <= 4 && substitutionOnly(g.key, t.key))) cands.typo.push(t);
      }
    }
    for (const kind of ['prefix', 'acronym', 'compact', 'typo']) {
      const c = cands[kind];
      if (c.length === 1) { g.parent = c[0]; break; }
      if (c.length > 1) break;
    }
  }
  const groups = new Map();
  for (const g of keys.values()) { const r = root(g); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(g); }
  const mapping = {};
  for (const [r, gs] of groups) {
    const members = new Map();
    gs.forEach((g) => g.members.forEach((n, raw) => members.set(raw, (members.get(raw) || 0) + n)));
    if (!members.size) continue;
    const allowedHere = allowed.find((a) => gs.some((g) => g.key === normKey(a)));
    const nice = (s) => (s === s.trim() && !/\s{2}/.test(s) ? 2 : 0) + (s !== s.toLowerCase() && s !== s.toUpperCase() ? 1 : 0);
    const target = allowedHere ?? [...members].sort((a, b) => b[1] - a[1] || nice(b[0]) - nice(a[0]) || (a[0] < b[0] ? -1 : 1))[0][0];
    for (const raw of members.keys()) if (raw !== target) mapping[raw] = target;
    void r;
  }
  return mapping;
}

// ================================================================ issue detection
const SEVERITY = { 'exact-duplicate': 'error', 'duplicate-key': 'error', 'near-duplicate': 'warning', 'invalid-type': 'error', 'mixed-date-format': 'warning', 'ambiguous-date': 'error', whitespace: 'warning', case: 'warning', 'inconsistent-category': 'warning', missing: 'warning', 'out-of-range': 'error', rule: 'error', outlier: 'info', skewed: 'info', constant: 'info' };
export const ISSUE_TITLES = { 'exact-duplicate': 'Exact duplicate rows', 'duplicate-key': 'Repeated keys', 'near-duplicate': 'Same record, different id', 'invalid-type': 'Values stored as text', 'mixed-date-format': 'Mixed date formats', 'ambiguous-date': 'Ambiguous dates', whitespace: 'Stray spaces', case: 'Inconsistent capitals', 'inconsistent-category': 'Spelling variants', missing: 'Missing values', 'out-of-range': 'Impossible values', rule: 'Rule broken', outlier: 'Outliers', skewed: 'Skewed distribution', constant: 'Constant column' };
export const ISSUE_WHY = {
  'exact-duplicate': 'Repeated rows count one record twice: counts and totals go up, and the repeated records get extra weight in every average.',
  'duplicate-key': 'An identifier should point to one record. When two rows share an id but disagree, they can’t both be right: decide which copy to keep and check the columns where they differ.',
  'near-duplicate': 'Rows that match in every column except the identifier are usually one event recorded twice, for example by a system sync. Counting both overstates totals. Genuinely separate records can look alike, so confirm with the source when you can.',
  'invalid-type': 'Values with $ signs, thousands separators or a different decimal mark are text to most software: they can’t be added or averaged, and they sort alphabetically. Converting them makes the column usable; values that don’t convert need a decision.',
  'mixed-date-format': 'Dates written in different formats can’t be sorted, compared or subtracted until they share one. Converting them to ISO 8601 (YYYY-MM-DD) removes the confusion.',
  'ambiguous-date': 'A date like 04/05/2026 is 4 May when written day first and 5 April when written month first. Reading it the wrong way moves the date by weeks or months, so decide from evidence, such as dates from the same source that can only be read one way, and record the assumption.',
  whitespace: 'Leading, trailing or doubled spaces are invisible, but they make “North” and “North ” different values, so groups split and lookups or joins fail.',
  case: 'Most software treats “north” and “North” as different values, so counts per group are split.',
  'inconsistent-category': 'Spelling variants split one group into several, so counts, shares and group averages are wrong. Map every variant to one standard value. The suggestion is based on spelling alone, so check it before applying it.',
  missing: 'Missing values shrink the sample. If whether a value is missing depends on another variable (missing at random, MAR) or on the value itself (missing not at random, MNAR), the rows that remain are not representative, and the way you handle the gaps can change the answer.',
  'out-of-range': 'Values outside what is possible, such as a negative quantity or attendance above 100%, are errors. Correct them from another source if you can; otherwise set them to missing or exclude the rows, and record the decision.',
  rule: 'Columns that should agree don’t. At least one value on each of these rows is wrong; work out which before changing anything.',
  outlier: 'Values far from the rest can be errors or genuine extremes. They pull the mean and standard deviation, so look at each one: correct errors, and keep genuine values (you can analyse with and without them).',
  skewed: 'In a long-tailed distribution the mean is pulled toward the tail, so the median describes a typical value better. Methods that assume roughly symmetric data often work better after a log or square-root transformation.',
  constant: 'A column with a single value carries no information, and some calculations (scaling, correlation) fail on it.',
};
const KIND_ORDER = Object.fromEntries(ISSUE_KINDS.map((k, i) => [k, i]));

function chiSquareRate(groups) {
  // 2 × k test of independence between "missing" and the group
  const tot = groups.reduce((a, g) => a + g.n, 0), miss = groups.reduce((a, g) => a + g.m, 0);
  if (!tot || !miss || miss === tot) return { stat: 0, p: 1 };
  let x2 = 0;
  for (const g of groups) {
    const e1 = (g.n * miss) / tot, e0 = g.n - e1;
    if (e1 > 0) x2 += (g.m - e1) ** 2 / e1;
    if (e0 > 0) x2 += (g.n - g.m - e0) ** 2 / e0;
  }
  return { stat: x2, p: S.chi2PUpper(x2, groups.length - 1) };
}

/**
 * Find data quality issues. rules: validation rules (see evalRule) that add range, list and cross-column checks.
 * Each issue: { id, kind, column, rows (indexes into table.rows), count, severity, title, message, why, suggestion (a
 * step, or null), detail? }.
 */
export function detectIssues(table, { rules = [] } = {}) {
  const prof = profile(table);
  const names = table.columns.map((c) => c.name);
  const n = table.rows.length;
  const issues = [];
  const add = (kind, column, rows, message, suggestion, extra = {}) => {
    issues.push({ id: `${kind}:${column ?? '*'}`, kind, column, rows, count: extra.count ?? rows.length, severity: SEVERITY[kind], title: ISSUE_TITLES[kind], message, why: extra.why || ISSUE_WHY[kind], suggestion, ...extra });
  };
  const rulesFor = (col, type) => rules.filter((r) => r.column === col && (!type || r.rule === type));

  // ---- exact duplicates
  const firstOf = new Map(), exact = [];
  table.rows.forEach((r, i) => { const k = r.map(cellKey).join('␟'); if (firstOf.has(k)) exact.push(i); else firstOf.set(k, i); });
  const exactSet = new Set(exact);
  if (exact.length) add('exact-duplicate', null, exact, `${plural(exact.length, 'row')} repeat${exact.length === 1 ? 's' : ''} an earlier row exactly.`, { op: 'dedupe' }, { detail: exact.slice(0, 6).map((i) => `row ${table.ids?.[i] ?? i + 1} repeats row ${table.ids?.[firstOf.get(table.rows[i].map(cellKey).join('␟'))] ?? ''}`).join('; ') });

  // ---- repeated keys and near duplicates
  const keyCols = [...new Set([...rules.filter((r) => r.rule === 'unique').map((r) => r.column),
    ...prof.filter((p) => p.type === 'id' && p.count - p.missing > 0 && p.unique / (p.count - p.missing) >= 0.9).map((p) => p.name)])].filter((c) => names.includes(c));
  for (const kc of keyCols) {
    const j = names.indexOf(kc);
    const groups = new Map();
    table.rows.forEach((r, i) => { if (exactSet.has(i) || isMissing(r[j])) return; const k = cellKey(r[j]); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(i); });
    const multi = [...groups.values()].filter((g) => g.length > 1);
    if (!multi.length) continue;
    const rows = multi.flat().sort((a, b) => a - b);
    const extra = multi.reduce((a, g) => a + g.length - 1, 0);
    const detail = multi.slice(0, 4).map((g) => {
      const diff = names.filter((_, k) => g.some((i) => !sameCell(table.rows[i][k], table.rows[g[0]][k])));
      return `${cellText(table.rows[g[0]][j])}: rows ${g.map((i) => table.ids?.[i] ?? i + 1).join(' and ')} differ in ${diff.join(', ') || 'nothing'}`;
    }).join('; ');
    add('duplicate-key', kc, rows, `${plural(multi.length, 'value')} of ${kc} appear on more than one row (${plural(extra, 'extra row')}), and the copies disagree.`, { op: 'dedupe-key', columns: [kc], keep: 'most-complete' }, { count: extra, detail });
  }
  if (keyCols.length && names.length - keyCols.length >= 3) {
    const others = names.filter((c) => !keyCols.includes(c)), idx = others.map((c) => names.indexOf(c));
    const groups = new Map();
    table.rows.forEach((r, i) => { if (exactSet.has(i)) return; const k = idx.map((j) => cellKey(r[j])).join('␟'); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(i); });
    const multi = [...groups.values()].filter((g) => g.length > 1 && g.some((i) => keyCols.some((kc) => !sameCell(table.rows[i][names.indexOf(kc)], table.rows[g[0]][names.indexOf(kc)]))));
    if (multi.length) {
      const extra = multi.reduce((a, g) => a + g.length - 1, 0);
      add('near-duplicate', keyCols[0], multi.flat().sort((a, b) => a - b), `${plural(extra, 'row')} match${extra === 1 ? 'es' : ''} another row in every column except ${keyCols.join(' and ')}.`, { op: 'dedupe-key', columns: others, keep: 'first' }, { count: extra, detail: multi.slice(0, 4).map((g) => g.map((i) => cellText(table.rows[i][names.indexOf(keyCols[0])])).join(' and ')).join('; ') });
    }
  }

  // ---- column by column
  prof.forEach((p, j) => {
    const cells = columnCells(table, j);
    const col = p.name;
    const strIdx = cells.map((c, i) => (typeof c === 'string' && !isMissing(c) ? i : -1)).filter((i) => i >= 0);
    // numbers stored as text
    if (p.type === 'number') {
      const fmt = [], bad = [];
      cells.forEach((c, i) => {
        if (isMissing(c) || typeof c === 'number' || Number.isFinite(plainNumber(c))) return;
        if (readNumber(c, p.decimal)) fmt.push(i); else bad.push(i);
      });
      if (fmt.length || bad.length) {
        const other = p.decimal === '.' ? ',' : '.';
        const commaish = bad.filter((i) => readNumber(cells[i], other));
        const parts = [];
        if (fmt.length) parts.push(`${plural(fmt.length, 'value')} carry $ signs, thousands separators or other symbols, so most software reads them as text`);
        if (bad.length) parts.push(`${plural(bad.length, 'value')} can’t be read as a number with a decimal ${p.decimal === '.' ? 'point' : 'comma'}: ${quoteList(bad.map((i) => cells[i]))}${commaish.length ? ` (${commaish.length === bad.length ? '' : 'some '}may use a decimal ${p.decimal === '.' ? 'comma' : 'point'})` : ''}`);
        add('invalid-type', col, [...fmt, ...bad].sort((a, b) => a - b), `${col}: ${parts.join('; ')}.`, { op: 'to-number', column: col, decimal: p.decimal }, { unreadable: bad });
      }
    }
    // dates
    if (p.type === 'date' && p.storage !== 'iso') {
      const fam = cells.map((c) => (isMissing(c) ? null : dateFamily(c) || 'other'));
      const counts = {};
      fam.forEach((f) => { if (f) counts[f] = (counts[f] || 0) + 1; });
      const kinds = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
      const main = kinds.includes('iso') ? 'iso' : kinds[0];
      const rows = fam.map((f, i) => (f && f !== main && f !== 'iso' ? i : f === main && main !== 'iso' ? i : -1)).filter((i) => i >= 0);
      const list = kinds.map((k) => `${k === 'other' ? 'unreadable' : FAMILY_LABEL[k]}: ${counts[k]}`).join('; ');
      add(kinds.length > 1 ? 'mixed-date-format' : 'invalid-type', col, rows, kinds.length > 1 ? `${col} mixes ${kinds.length} formats (${list}).` : `${col} is written as ${FAMILY_LABEL[kinds[0]] || 'text'}, not ISO dates.`, { op: 'to-date', column: col, order: 'auto', serial: !!counts.serial });
      // ambiguity, with the evidence from dates in the same family that read only one way
      const amb = [], ev = { slash4: { dmy: 0, mdy: 0 }, slash2: { dmy: 0, mdy: 0 } };
      const ambFam = new Set();
      cells.forEach((c, i) => {
        const f = fam[i];
        if (f !== 'slash4' && f !== 'slash2') return;
        const r = parseDateCell(c);
        if (r.ambiguous) { amb.push(i); ambFam.add(f); } else if (r.format === 'dmy') ev[f].dmy++; else if (r.format === 'mdy') ev[f].mdy++;
      });
      if (amb.length) {
        const fams = [...ambFam];
        const dirs = fams.map((f) => (ev[f].dmy > 0 && ev[f].mdy === 0 ? 'DMY' : ev[f].mdy > 0 && ev[f].dmy === 0 ? 'MDY' : null));
        const order = dirs.every((d) => d && d === dirs[0]) ? dirs[0] : null;
        const evid = fams.map((f) => `among ${f === 'slash4' ? 'four' : 'two'}-digit-year dates that read only one way, ${ev[f].dmy} are day first and ${ev[f].mdy} month first`).join('; ');
        const ex = parseDateCell(cells[amb[0]]);
        const exText = (iso) => { const [y, m, d] = iso.split('-'); return `${+d} ${MONTH_NAMES[+m - 1]} ${y}`; };
        add('ambiguous-date', col, amb, `${plural(amb.length, 'date')} in ${col} can be read day first or month first (${cellText(cells[amb[0]]).trim()} is ${exText(ex.dmy)} or ${exText(ex.mdy)}). Evidence: ${evid}.`, order ? { op: 'to-date', column: col, order, serial: !!counts.serial } : null, { detail: order ? `The evidence points to ${order === 'DMY' ? 'day first' : 'month first'}. Dates that can only be read the other way are left as text by this step; convert them in a second step.` : 'The evidence is mixed: check the source system before choosing an order.' });
      }
    }
    // stray spaces
    const ws = strIdx.filter((i) => /^\s|\s$|\s{2,}|[   ]/.test(cells[i]));
    if (ws.length) add('whitespace', col, ws, `${plural(ws.length, 'value')} in ${col} ${ws.length === 1 ? 'has' : 'have'} leading, trailing or doubled spaces, e.g. ${quoteList(ws.map((i) => cells[i]), 3)}.`, { op: 'trim', column: col });
    // capitals
    if (['category', 'text', 'boolean', 'id'].includes(p.type) && strIdx.length) {
      const emailish = strIdx.filter((i) => cells[i].includes('@')).length >= 0.8 * strIdx.length;
      let rows = [];
      let to = 'title';
      if (emailish) { rows = strIdx.filter((i) => /[A-Z]/.test(cells[i])); to = 'lower'; }
      else if (p.type !== 'id' && p.type !== 'text') {
        const norm = (s) => s.trim().replace(/\s+/g, ' ');
        const byLower = new Map();
        strIdx.forEach((i) => { const k = norm(cells[i]).toLowerCase(); if (!byLower.has(k)) byLower.set(k, new Map()); const m = byLower.get(k); const s = norm(cells[i]); m.set(s, (m.get(s) || []).concat(i)); });
        const majors = [];
        for (const m of byLower.values()) {
          const sp = [...m].sort((a, b) => b[1].length - a[1].length);
          majors.push(sp[0][0]);
          sp.slice(1).forEach(([, idx]) => rows.push(...idx));
        }
        const style = (s) => (s === s.toLowerCase() ? 'lower' : s === s.toUpperCase() ? 'upper' : 'title');
        const styles = majors.map(style);
        to = ['title', 'lower', 'upper'].sort((a, b) => styles.filter((x) => x === b).length - styles.filter((x) => x === a).length)[0];
        // keep only values that the case change turns into a spelling already used (“us” → “Us” is left to the mapping)
        const conv = (x) => (to === 'upper' ? x.toUpperCase() : to === 'lower' ? x.toLowerCase() : x.toLowerCase().replace(/(^|[\s\-/(])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()));
        const spellings = new Set(strIdx.map((i) => norm(cells[i])));
        rows = rows.filter((i) => spellings.has(conv(norm(cells[i]))));
      }
      if (rows.length) add('case', col, rows.sort((a, b) => a - b), `${plural(rows.length, 'value')} in ${col} use different capitals from the rest, e.g. ${quoteList(rows.map((i) => cells[i]), 3)}${emailish ? ' (e-mail addresses are compared without regard to case in practice)' : ''}.`, { op: 'case', column: col, to });
    }
    // spelling variants (and values outside an allowed list)
    const inSet = rulesFor(col, 'in-set')[0];
    if ((p.type === 'category' || p.type === 'boolean' || inSet) && strIdx.length && p.type !== 'number' && p.type !== 'date') {
      const mapping = suggestMapping(cells, { targets: inSet?.values });
      const outside = inSet ? strIdx.filter((i) => !inSet.values.map(String).includes(cells[i])) : [];
      const rows = [...new Set([...strIdx.filter((i) => mapping[cells[i]] != null), ...outside])].sort((a, b) => a - b);
      if (rows.length) {
        const targets = new Set(Object.values(mapping));
        const unmapped = [...new Set(outside.filter((i) => mapping[cells[i]] == null).map((i) => cells[i]))];
        const spellings = new Set(strIdx.map((i) => cells[i])).size;
        add('inconsistent-category', col, rows, `${col} has ${plural(spellings, 'different spelling')}${Object.keys(mapping).length ? `; ${plural(Object.keys(mapping).length, 'variant')} look like ${plural(targets.size, 'standard value')}` : ''}${inSet ? ` (allowed: ${inSet.values.join(', ')})` : ''}.${unmapped.length ? ` No suggestion for ${quoteList(unmapped)}.` : ''}`, Object.keys(mapping).length ? { op: 'map', column: col, mapping } : { op: 'validate', column: col, rule: { in: inSet.values }, action: 'flag' }, { mapping });
      }
    }
    // missing
    if (p.missing > 0) {
      const rows = cells.map((c, i) => (isMissing(c) ? i : -1)).filter((i) => i >= 0);
      let assoc = null;
      prof.forEach((q, k) => {
        if (k === j || q.unique < 2 || q.unique > 10 || q.missing > 0.5 * q.count || q.type === 'id') return;
        const by = new Map();
        table.rows.forEach((r, i) => { const g = cellText(r[k]).trim(); if (!g) return; if (!by.has(g)) by.set(g, { g, n: 0, m: 0 }); const e = by.get(g); e.n++; if (isMissing(r[j])) e.m++; });
        const groups = [...by.values()].filter((g) => g.n >= 5);
        if (groups.length < 2) return;
        const t = chiSquareRate(groups);
        const rates = groups.map((g) => g.m / g.n);
        const spread = Math.max(...rates) - Math.min(...rates);
        if (t.p < 0.01 && spread >= 0.15 && (!assoc || t.p < assoc.p)) assoc = { column: q.name, p: t.p, groups: groups.sort((a, b) => b.m / b.n - a.m / a.n) };
      });
      // a key that carries the same value on every row (e.g. a customer's e-mail): gaps can be recovered from it
      let recover = null;
      if (p.type !== 'number') {
        prof.forEach((q, k) => {
          if (k === j || recover || keyCols.includes(q.name) || !(q.type === 'id' || q.type === 'category')) return;
          const vals = new Map();
          let consistent = 0, groupsN = 0;
          table.rows.forEach((r) => { if (isMissing(r[j]) || isMissing(r[k])) return; const g = cellKey(r[k]); if (!vals.has(g)) vals.set(g, new Set()); vals.get(g).add(cellText(r[j]).trim().toLowerCase()); });
          vals.forEach((s) => { groupsN++; if (s.size === 1) consistent++; });
          const multiRow = [...vals.keys()].length < table.rows.filter((r) => !isMissing(r[j])).length;
          const n2 = rows.filter((i) => vals.has(cellKey(table.rows[i][k]))).length;
          if (groupsN && multiRow && consistent / groupsN >= 0.95 && n2) recover = { column: q.name, n: n2 };
        });
      }
      const share = p.missing / p.count;
      const msg = [`${col}: ${plural(p.missing, 'value')} missing (${(share * 100).toFixed(share < 0.1 ? 1 : 0)}% of rows).`];
      let suggestion;
      const intCount = p.type === 'number' && p.integer && p.min >= 0 && p.top[0] && +p.top[0][0] === 0;
      if (assoc) {
        const g = assoc.groups;
        msg.push(`Missing in ${(g[0].m / g[0].n * 100).toFixed(0)}% of rows where ${assoc.column} = ${g[0].g} but ${(g[g.length - 1].m / g[g.length - 1].n * 100).toFixed(0)}% where ${assoc.column} = ${g[g.length - 1].g} (chi-square test p ${assoc.p < 0.001 ? '< 0.001' : `= ${assoc.p.toFixed(3)}`}), so the values are not missing completely at random.`);
      }
      if (recover) msg.push(`${plural(recover.n, 'gap')} can be filled from other rows with the same ${recover.column}.`);
      if (share === 1) suggestion = { op: 'drop-column', column: col };
      else if (recover) suggestion = { op: 'fill', column: col, method: 'mode', by: recover.column };
      else if (intCount) { suggestion = { op: 'fill', column: col, method: 'constant', value: 0 }; msg.push('0 is the most common value of this count, so a blank may mean zero; check the data dictionary before filling.'); }
      else if (p.type === 'number') suggestion = assoc ? { op: 'fill', column: col, method: 'median', by: assoc.column } : { op: 'fill', column: col, method: 'median' };
      else if (p.type === 'category' || p.type === 'boolean') suggestion = { op: 'fill', column: col, method: 'constant', value: 'Unknown' };
      else suggestion = { op: 'flag-missing', column: col };
      add('missing', col, rows, msg.join(' '), suggestion, { association: assoc ? { column: assoc.column, p: assoc.p, rates: assoc.groups.map((g) => [g.g, g.m / g.n, g.n]) } : null, recover });
    }
    // impossible values: rules first, then heuristics
    if (p.type === 'number') {
      const rr = rulesFor(col, 'range').filter((r) => !isDateBound(r.min) && !isDateBound(r.max));
      if (rr.length) {
        const rows = [...new Set(rr.flatMap((r) => evalRule(table, r, { loose: true }).rows))].sort((a, b) => a - b);
        const r0 = rr[0];
        if (rows.length) add('out-of-range', col, rows, `${plural(rows.length, 'value')} in ${col} ${rows.length === 1 ? 'breaks' : 'break'} the rule “${ruleText(r0)}”: ${quoteList(rows.map((i) => cells[i]))}.`, { op: 'validate', column: col, rule: { min: r0.min, max: r0.max, integer: r0.integer }, action: 'set-missing' });
      } else if (p.n >= 10) {
        const vals = cells.map((c) => (typeof c === 'number' ? c : looseNumber(c, p.decimal)));
        const fin = vals.filter(Number.isFinite);
        const rows = new Set();
        const notes = [];
        const negs = vals.map((v, i) => (v < 0 ? i : -1)).filter((i) => i >= 0);
        if (negs.length && negs.length <= 0.05 * fin.length) { negs.forEach((i) => rows.add(i)); notes.push(`${plural(negs.length, 'negative value')} in a column that is otherwise never negative`); }
        const absSorted = S.sorted(fin.map(Math.abs));
        const p95 = S.quantileSorted(absSorted, 0.95);
        const ph = vals.map((v, i) => ([99, 999, 9999, 99999, -99, -999, -9999].includes(v) && Math.abs(v) > 3 * p95 ? i : -1)).filter((i) => i >= 0);
        if (ph.length) { ph.forEach((i) => rows.add(i)); notes.push(`${plural(ph.length, 'value')} like ${fmtNum(vals[ph[0]])}, a common placeholder for “unknown”`); }
        if (/pct|percent|share/i.test(col)) {
          const pc = vals.map((v, i) => (v > 100 || v < 0 ? i : -1)).filter((i) => i >= 0);
          if (pc.length) { pc.forEach((i) => rows.add(i)); notes.push(`${plural(pc.length, 'percentage')} outside 0–100`); }
        }
        if (rows.size) {
          const lo = p.min < 0 && negs.length ? 0 : undefined, hi = /pct|percent|share/i.test(col) ? 100 : undefined;
          add('out-of-range', col, [...rows].sort((a, b) => a - b), `${col}: ${notes.join('; ')}.`, { op: 'validate', column: col, rule: { min: lo ?? (negs.length ? 0 : undefined), max: hi ?? (ph.length ? Math.max(...fin.filter((v) => Math.abs(v) <= 3 * p95)) : undefined) }, action: 'set-missing' });
        }
      }
    }
    // outliers and skew
    if (p.type === 'number' && p.n >= 8 && p.unique >= 8) {
      const vals = cells.map((c) => (typeof c === 'number' ? c : looseNumber(c, p.decimal)));
      const iqr = p.q3 - p.q1;
      if (iqr > 0) {
        const lo = p.q1 - 1.5 * iqr, hi = p.q3 + 1.5 * iqr, flo = p.q1 - 3 * iqr, fhi = p.q3 + 3 * iqr;
        const rows = vals.map((v, i) => (Number.isFinite(v) && (v < lo || v > hi) ? i : -1)).filter((i) => i >= 0);
        const far = rows.filter((i) => vals[i] < flo || vals[i] > fhi);
        if (rows.length) {
          const ex = [...new Set(far.map((i) => vals[i]))].sort((a, b) => Math.abs(b - p.median) - Math.abs(a - p.median));
          add('outlier', col, rows, `${plural(rows.length, 'value')} in ${col} ${rows.length === 1 ? 'lies' : 'lie'} outside the 1.5 × IQR fences (${fmtNum(lo)} to ${fmtNum(hi)})${far.length ? `; ${far.length} beyond 3 × IQR: ${ex.slice(0, 5).map(fmtNum).join(', ')}${ex.length > 5 ? ', …' : ''}` : ''}.`, { op: 'outliers', column: col, method: 'iqr', k: 1.5, action: 'flag' }, { fences: [lo, hi] });
        }
      }
      if (p.n >= 20 && p.unique >= 12 && Math.abs(p.skew) > 1) {
        const right = p.skew > 0;
        add('skewed', col, [], `${col} is strongly ${right ? 'right' : 'left'}-skewed (skewness ${fmtNum(p.skew)}): the mean (${fmtNum(p.mean)}) sits ${right ? 'above' : 'below'} the median (${fmtNum(p.median)}).`, right && p.min > 0 ? { op: 'transform', column: col, fn: 'log', as: `log_${col}` } : right && p.min >= 0 ? { op: 'transform', column: col, fn: 'log1p', as: `log1p_${col}` } : null, { count: p.n });
      }
    }
    // constant
    if (p.unique === 1 && p.count - p.missing >= 2) add('constant', col, [], `${col} has the same value (${quoteList([p.top[0][0]], 1)}) on every row that has one.`, { op: 'drop-column', column: col });
  });

  // ---- cross-column rules and patterns
  for (const r of rules) {
    if (!['equals', 'compare', 'pattern'].includes(r.rule) || !names.includes(r.column)) continue;
    const res = evalRule(table, r, { loose: true });
    let rows = res.rows;
    if (r.rule === 'pattern') {
      const covered = new Set(issues.filter((x) => x.column === r.column).flatMap((x) => x.rows));
      rows = rows.filter((i) => !covered.has(i));
    }
    if (!rows.length) continue;
    const id = `rule:${r.column}:${r.rule}:${r.expr || r.other || r.pattern}`;
    issues.push({ id, kind: 'rule', column: r.column, rows, count: rows.length, severity: 'error', title: ISSUE_TITLES.rule, message: `${plural(rows.length, 'row')} break${rows.length === 1 ? 's' : ''} the rule “${ruleText(r)}”.`, why: ISSUE_WHY.rule, suggestion: r.rule === 'pattern' ? { op: 'validate', column: r.column, rule: { pattern: r.pattern }, action: 'flag' } : null, rule: r });
  }
  // date ranges from rules
  for (const r of rules) {
    if (r.rule !== 'range' || !(isDateBound(r.min) || isDateBound(r.max)) || !names.includes(r.column)) continue;
    const res = evalRule(table, r, { loose: true });
    if (res.rows.length) add('out-of-range', r.column, res.rows, `${plural(res.rows.length, 'date')} in ${r.column} fall outside ${r.min ?? '…'} to ${r.max ?? '…'}.`, { op: 'validate', column: r.column, rule: { min: r.min, max: r.max }, action: 'flag' });
  }
  issues.sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || names.indexOf(a.column) - names.indexOf(b.column));
  return issues;
}

// ================================================================ applying steps
const copyTable = (t, rows = t.rows.map((r) => r.slice()), columns = t.columns.map((c) => ({ ...c })), ids = t.ids ? t.ids.slice() : undefined) => ({ ...t, columns, rows, ids });
function baseChange(table, step) {
  return { op: step.op, rowsBefore: table.rows.length, rowsAfter: table.rows.length, removedRows: [], cellsChanged: 0, samples: [], columnsAdded: [], columnsRemoved: [], unresolved: [], params: {}, note: '' };
}
const fail = (table, step, message) => ({ table, change: { ...baseChange(table, step), error: message, note: message } });
function needColumn(table, name) { const j = colIndex(table, name); if (j < 0) throw new StepError(name ? `There is no column called “${name}”.` : 'Choose a column.'); return j; }
class StepError extends Error {}
function uniqueName(table, base) { let n = base, k = 2; const names = table.columns.map((c) => c.name); while (names.includes(n)) n = `${base}_${k++}`; return n; }
function removeRows(table, drop) {
  const keep = table.rows.map((_, i) => !drop.has(i));
  return { ...copyTable(table, table.rows.filter((_, i) => keep[i]), undefined, table.ids?.filter((_, i) => keep[i])) };
}
/** Replace column j via fn(cell, i); counts changed cells and keeps up to 8 samples. */
function mapColumn(table, j, fn, change) {
  const out = copyTable(table);
  out.rows.forEach((r, i) => {
    const before = r[j], after = fn(before, i);
    if (after === undefined) return;
    if (!sameCell(before, after)) {
      change.cellsChanged++;
      if (change.samples.length < 8) change.samples.push([i, table.columns[j].name, before, after]);
    }
    r[j] = after;
  });
  return out;
}
function insertColumn(table, at, name, values, type) {
  const out = copyTable(table);
  out.columns.splice(at, 0, { name, ...(type ? { type } : {}) });
  out.rows.forEach((r, i) => r.splice(at, 0, values[i]));
  return out;
}
/** The numeric values of a column for numeric steps: numbers, or plain numeric text. Throws if other text remains. */
function numericValues(table, j) {
  const vals = [], bad = [];
  table.rows.forEach((r, i) => {
    const c = r[j];
    if (isMissing(c)) { vals.push(null); return; }
    const v = typeof c === 'number' ? c : plainNumber(c);
    if (Number.isFinite(v)) vals.push(v); else { vals.push(null); bad.push(i); }
  });
  if (bad.length) throw new StepError(`${plural(bad.length, 'value')} in ${table.columns[j].name} ${bad.length === 1 ? 'isn’t a' : 'aren’t'} plain number${bad.length === 1 ? '' : 's'} (for example “${short(table.rows[bad[0]][j])}”). Convert the column to numbers first.`);
  return vals;
}
function setNumericColumn(table, j, vals) {
  // keep the numbers as numbers from now on (plain numeric text becomes a number; not counted as a change)
  table.rows.forEach((r, i) => { r[j] = vals[i]; });
  table.columns[j] = { ...table.columns[j], type: 'number' };
}
/** Seeded train/test split of row indexes (the same shuffle as the site's other labs). */
export function trainRows(n, share = 0.7, seed = 7) {
  const r = mulberry32(seed);
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) { const k = Math.floor(r() * (i + 1)); [idx[i], idx[k]] = [idx[k], idx[i]]; }
  return new Set(idx.slice(0, Math.round(n * share)));
}
/** Rows a step learns from: all, a seeded 70% subset, or the rows marked “train” in a split column. */
function fitRows(table, step) {
  if (step.fit !== 'train') return null;
  if (step.split) {
    const k = needColumn(table, step.split);
    const set = new Set(table.rows.map((r, i) => (cellText(r[k]).trim().toLowerCase() === 'train' ? i : -1)).filter((i) => i >= 0));
    if (!set.size) throw new StepError(`No row has “train” in ${step.split}, so there is nothing to learn from.`);
    return set;
  }
  return trainRows(table.rows.length, step.trainShare ?? 0.7, step.seed ?? 7);
}
const fitText = (step, set, n) => (step.split ? `the ${set.size} training rows (${step.split} = train)` : `a ${Math.round((step.trainShare ?? 0.7) * 100)}% training subset (${set.size} of ${n} rows, seed ${step.seed ?? 7})`);
const rowLabel = (table, i) => `row ${table.ids?.[i] ?? i + 1}`;
const median = (a) => S.quantileSorted(S.sorted(a), 0.5);
function modeOf(values) {
  const counts = new Map();
  values.forEach((v) => { const k = cellKey(v); const e = counts.get(k) || { v, n: 0 }; e.n++; counts.set(k, e); });
  const list = [...counts.values()].sort((a, b) => b.n - a.n || (typeof a.v === 'number' && typeof b.v === 'number' ? a.v - b.v : cellText(a.v) < cellText(b.v) ? -1 : 1));
  return list.length ? { value: list[0].v, n: list[0].n, ties: list.filter((e) => e.n === list[0].n).length } : null;
}

/** Apply one step. Never changes the input. Returns { table, change }; on a refused step, change.error says why and the table is unchanged. */
export function apply(table, step) {
  try {
    if (!step || !OPS.includes(step.op)) return fail(table, step || {}, `Unknown operation “${step?.op}”.`);
    return OPS_IMPL[step.op](table, step);
  } catch (e) {
    if (e instanceof StepError) return fail(table, step, e.message);
    throw e;
  }
}

const OPS_IMPL = {
  dedupe(table, step) {
    const ch = baseChange(table, step);
    const seen = new Set(), drop = new Set();
    table.rows.forEach((r, i) => { const k = r.map(cellKey).join('␟'); if (seen.has(k)) drop.add(i); else seen.add(k); });
    const out = removeRows(table, drop);
    ch.removedRows = [...drop]; ch.rowsAfter = out.rows.length;
    ch.note = drop.size ? `Removed ${plural(drop.size, 'row')} that repeated an earlier row exactly; the first copy of each stays.` : 'No row repeats an earlier row exactly, so nothing was removed.';
    return { table: out, change: ch };
  },
  'dedupe-key'(table, step) {
    const ch = baseChange(table, step);
    const cols = (step.columns || (step.column ? [step.column] : [])).filter(Boolean);
    if (!cols.length) throw new StepError('Choose at least one key column.');
    const idx = cols.map((c) => needColumn(table, c));
    const keep = step.keep || 'first';
    const groups = new Map();
    let blank = 0;
    table.rows.forEach((r, i) => { if (idx.some((j) => isMissing(r[j]))) { blank++; return; } const k = idx.map((j) => cellKey(r[j])).join('␟'); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(i); });
    const drop = new Set(), conflicts = [];
    const missingIn = (i) => table.rows[i].filter(isMissing).length;
    let nGroups = 0;
    for (const g of groups.values()) {
      if (g.length < 2) continue;
      nGroups++;
      let kept = keep === 'last' ? g[g.length - 1] : g[0];
      if (keep === 'most-complete') kept = g.reduce((best, i) => (missingIn(i) < missingIn(best) ? i : best), g[0]);
      for (const i of g) {
        if (i === kept) continue;
        drop.add(i);
        const diff = table.columns.map((c) => c.name).filter((_, k) => !idx.includes(k) && !sameCell(table.rows[i][k], table.rows[kept][k]));
        if (diff.length) conflicts.push(`${rowLabel(table, i)} differed from the kept ${rowLabel(table, kept)} in ${diff.join(', ')}`);
      }
    }
    const out = removeRows(table, drop);
    ch.removedRows = [...drop].sort((a, b) => a - b); ch.rowsAfter = out.rows.length;
    ch.params = { conflicts };
    const keepText = { first: 'the first row', last: 'the last row', 'most-complete': 'the most complete row (ties: the first)' }[keep];
    ch.note = drop.size
      ? `Found ${plural(nGroups, 'key')} on more than one row by ${cols.join(' + ')}. Kept ${keepText} of each and removed ${plural(drop.size, 'row')}.${conflicts.length ? ` ${conflicts.length} removed ${conflicts.length === 1 ? 'row' : 'rows'} held different values: ${conflicts.slice(0, 3).join('; ')}${conflicts.length > 3 ? '; …' : ''}. Check which copy is right.` : ' The removed copies were identical in the other columns.'}`
      : `Every ${cols.join(' + ')} value appears once, so nothing was removed.`;
    if (blank) ch.note += ` ${plural(blank, 'row')} with a blank key ${blank === 1 ? 'was' : 'were'} left alone.`;
    return { table: out, change: ch };
  },
  trim(table, step) {
    const ch = baseChange(table, step);
    const js = step.all ? table.columns.map((_, j) => j) : [needColumn(table, step.column)];
    let out = table;
    for (const j of js) out = mapColumn(out, j, (c) => (typeof c === 'string' ? c.replace(/[   ]/g, ' ').replace(/\s+/g, ' ').trim() : undefined), ch);
    ch.note = ch.cellsChanged ? `Trimmed ${plural(ch.cellsChanged, 'value')} in ${step.all ? 'the text columns' : step.column}: removed leading and trailing spaces and turned runs of spaces into one (like a spreadsheet’s TRIM).` : `No ${step.all ? 'text' : step.column} value had stray spaces.`;
    return { table: out, change: ch };
  },
  case(table, step) {
    const ch = baseChange(table, step);
    const j = needColumn(table, step.column);
    const to = step.to || 'lower';
    const f = to === 'upper' ? (s) => s.toUpperCase() : to === 'title' ? (s) => s.toLowerCase().replace(/(^|[\s\-/(])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()) : (s) => s.toLowerCase();
    const out = mapColumn(table, j, (c) => (typeof c === 'string' ? f(c) : undefined), ch);
    ch.note = ch.cellsChanged ? `Changed ${plural(ch.cellsChanged, 'value')} in ${step.column} to ${to === 'upper' ? 'UPPER CASE' : to === 'title' ? 'Title Case' : 'lower case'}.` : `Every ${step.column} value was already in ${to === 'title' ? 'Title Case' : `${to} case`}.`;
    return { table: out, change: ch };
  },
  map(table, step) {
    const ch = baseChange(table, step);
    const j = needColumn(table, step.column);
    const mapping = step.mapping || {};
    if (!Object.keys(mapping).length) throw new StepError('The mapping is empty: add at least one value to change.');
    const used = new Map();
    const out = mapColumn(table, j, (c) => {
      const k = cellText(c);
      if (!isMissing(c) && Object.prototype.hasOwnProperty.call(mapping, k)) { used.set(k, (used.get(k) || 0) + 1); const v = mapping[k]; return v == null || v === '' ? null : v; }
      return undefined;
    }, ch);
    const unused = Object.keys(mapping).filter((k) => !used.has(k));
    ch.params = { used: Object.fromEntries(used) };
    ch.note = `Mapped ${plural(ch.cellsChanged, 'value')} in ${step.column} (${plural(used.size, 'spelling')} → ${plural(new Set([...used.keys()].map((k) => mapping[k])).size, 'value')}).${unused.length ? ` ${plural(unused.length, 'mapping')} matched nothing: ${quoteList(unused)}.` : ''}`;
    return { table: out, change: ch };
  },
  'to-number'(table, step) {
    const ch = baseChange(table, step);
    const j = needColumn(table, step.column);
    const decimal = step.decimal === ',' ? ',' : '.';
    let cur = 0, grp = 0, pct = 0, conv = 0, blanks = 0;
    const out = mapColumn(table, j, (c, i) => {
      if (typeof c === 'number') return undefined;
      if (isMissing(c)) { if (c !== null) { blanks++; return null; } return undefined; }
      const r = readNumber(c, decimal);
      if (!r) {
        const other = readNumber(c, decimal === '.' ? ',' : '.');
        ch.unresolved.push({ row: i, column: step.column, value: c, reason: other ? `reads as ${fmtNum(other.value)} only with a decimal ${decimal === '.' ? 'comma' : 'point'}` : 'not a number' });
        return undefined;
      }
      conv++; if (r.currency) cur++; if (r.grouped) grp++; if (r.percent) pct++;
      return r.value;
    }, ch);
    out.columns[j] = { ...out.columns[j], type: 'number', decimal };
    const bits = [];
    if (cur) bits.push(`removed currency signs from ${cur}`);
    if (grp) bits.push(`thousands separators from ${grp}`);
    if (pct) bits.push(`% signs from ${pct} (the numbers stay percentages, so 45% becomes 45)`);
    ch.note = `Read ${plural(conv, 'value')} in ${step.column} as ${conv === 1 ? 'a number' : 'numbers'} with a decimal ${decimal === '.' ? 'point' : 'comma'}${bits.length ? `; ${bits.join(', ')}` : ''}.${blanks ? ` ${plural(blanks, 'placeholder')} such as “NA” became missing.` : ''}${ch.unresolved.length ? ` ${plural(ch.unresolved.length, 'value')} could not be read and ${ch.unresolved.length === 1 ? 'was' : 'were'} left as text: ${ch.unresolved.slice(0, 4).map((u) => `“${short(u.value)}” (${rowLabel(table, u.row)}, ${u.reason})`).join('; ')}.` : ''}`;
    return { table: out, change: ch };
  },
  'to-date'(table, step) {
    const ch = baseChange(table, step);
    const j = needColumn(table, step.column);
    const order = ['DMY', 'MDY', 'YMD'].includes(step.order) ? step.order : 'auto';
    const serial = !!step.serial;
    const formats = {};
    let already = 0;
    const out = mapColumn(table, j, (c, i) => {
      if (isMissing(c)) return c === null ? undefined : null;
      if (isoDate(c) && String(c) === String(c).trim() && String(c).length === 10) { already++; return undefined; }
      const r = parseDateCell(c, { order, serial });
      if (r.iso) { formats[r.format] = (formats[r.format] || 0) + 1; return r.iso; }
      ch.unresolved.push({ row: i, column: step.column, value: c, reason: r.ambiguous ? `ambiguous: ${r.dmy} if day first, ${r.mdy} if month first` : r.invalid });
      return undefined;
    }, ch);
    out.columns[j] = { ...out.columns[j], type: 'date' };
    const fmtName = { iso: 'ISO with a time or single digits', ymd: 'year first', dmy: 'day first', mdy: 'month first', same: 'slash dates that read the same either way', written: 'written out', serial: 'spreadsheet serials (days since 30 December 1899)' };
    const parts = Object.entries(formats).map(([k, n]) => `${n} ${fmtName[k]}`);
    const amb = ch.unresolved.filter((u) => u.reason.startsWith('ambiguous'));
    const orderText = { auto: 'Order: automatic (a date that reads both ways is left alone)', DMY: 'Order: day first (DD/MM/YYYY)', MDY: 'Order: month first (MM/DD/YYYY)', YMD: 'Order: year first (YY/MM/DD)' }[order];
    ch.params = { order, serial };
    ch.note = `${orderText}. Converted ${plural(ch.cellsChanged, 'value')} in ${step.column} to ISO dates (YYYY-MM-DD)${parts.length ? `: ${parts.join(', ')}` : ''}.${already ? ` ${already} ${already === 1 ? 'was' : 'were'} already ISO.` : ''}${ch.unresolved.length ? ` Left ${plural(ch.unresolved.length, 'value')} unchanged${amb.length ? `, including ${amb.length} ambiguous (${amb.slice(0, 2).map((u) => `“${u.value}”`).join(', ')})` : ''}: ${ch.unresolved.filter((u) => !u.reason.startsWith('ambiguous')).slice(0, 3).map((u) => `“${short(u.value)}” (${u.reason})`).join('; ') || 'decide their order from the evidence and convert them in another step'}.` : ''}`;
    return { table: out, change: ch };
  },
  fill(table, step) {
    const ch = baseChange(table, step);
    const j = needColumn(table, step.column);
    const method = step.method || 'median';
    const by = method === 'group-median' ? step.by : step.by || null;
    if (method === 'group-median' && !by) throw new StepError('Choose the column that defines the groups.');
    const k = by ? needColumn(table, by) : -1;
    const missingRows = table.rows.map((r, i) => (isMissing(r[j]) ? i : -1)).filter((i) => i >= 0);
    if (!missingRows.length) { ch.note = `${step.column} has no missing values, so nothing was filled.`; return { table, change: ch }; }
    const numeric = ['mean', 'median', 'group-median'].includes(method);
    const vals = numeric ? numericValues(table, j) : table.rows.map((r) => (isMissing(r[j]) ? null : r[j]));
    const train = fitRows(table, step);
    const source = (rows) => rows.filter((i) => vals[i] != null && (!train || train.has(i))).map((i) => vals[i]);
    const stat = (rows) => {
      const a = source(rows);
      if (!a.length) return null;
      if (method === 'mean') return S.mean(a);
      if (method === 'median' || method === 'group-median') return median(a);
      return modeOf(a)?.value ?? null;
    };
    const all = table.rows.map((_, i) => i);
    let fillFor;
    const used = {};
    let fallback = 0;
    if (method === 'constant') {
      if (step.value == null || step.value === '') throw new StepError('Enter the value to fill with.');
      const isNum = profileColumn(table, j).type === 'number';
      const v = isNum && Number.isFinite(plainNumber(step.value)) ? plainNumber(step.value) : String(step.value);
      fillFor = () => v; used.all = v;
    } else if (by) {
      const groups = new Map();
      table.rows.forEach((r, i) => { const g = cellText(r[k]).trim(); if (!groups.has(g)) groups.set(g, []); groups.get(g).push(i); });
      const overall = stat(all);
      if (overall == null) throw new StepError(`${step.column} has no observed values to calculate a ${method === 'mode' ? 'mode' : method.replace('group-', '')} from.`);
      const per = new Map();
      for (const [g, rows] of groups) { const s = stat(rows); per.set(g, s); if (s != null) used[g || '(blank)'] = s; }
      fillFor = (i) => { const s = per.get(cellText(table.rows[i][k]).trim()); if (s == null) { fallback++; return overall; } return s; };
    } else {
      const s = stat(all);
      if (s == null) throw new StepError(`${step.column} has no observed values to calculate a ${method} from.`);
      fillFor = () => s; used.all = s;
    }
    if (method === 'mode' && profileColumn(table, j).type === 'number') { const inner = fillFor; fillFor = (i) => { const v = inner(i); return Number.isFinite(plainNumber(v)) ? plainNumber(v) : v; }; }
    const out = mapColumn(table, j, (c, i) => (isMissing(c) ? fillFor(i) : undefined), ch);
    if (numeric) { const nv = out.rows.map((r) => (typeof r[j] === 'number' ? r[j] : plainNumber(r[j]))); setNumericColumn(out, j, nv.map((v) => (Number.isFinite(v) ? v : null))); }
    ch.params = { method, by, values: used, fit: train ? 'train' : 'all' };
    const what = method === 'constant' ? `the value ${cellText(used.all)}` : by
      ? `the ${method === 'group-median' ? 'median' : method} of each ${by} group (${Object.entries(used).slice(0, 6).map(([g, v]) => `${g}: ${typeof v === 'number' ? fmtNum(v) : `“${short(v)}”`}`).join(', ')}${Object.keys(used).length > 6 ? ', …' : ''})`
      : `the ${method} (${typeof used.all === 'number' ? fmtNum(used.all) : `“${short(used.all)}”`})`;
    const fitNote = train ? ` The ${method === 'constant' ? 'value' : 'statistic'} was calculated from ${fitText(step, train, table.rows.length)} only.` : method === 'constant' ? '' : ' The statistic was calculated from every row’s observed values.';
    ch.note = `Filled ${plural(ch.cellsChanged, 'missing value')} in ${step.column} with ${what}.${fitNote}${fallback ? ` ${plural(fallback, 'row')} in groups with no observed value got the overall figure.` : ''}`;
    return { table: out, change: ch };
  },
  'drop-missing'(table, step) {
    const ch = baseChange(table, step);
    const cols = (step.columns || (step.column ? [step.column] : [])).filter(Boolean);
    if (!cols.length) throw new StepError('Choose at least one column.');
    const idx = cols.map((c) => needColumn(table, c));
    const drop = new Set(table.rows.map((r, i) => (idx.some((j) => isMissing(r[j])) ? i : -1)).filter((i) => i >= 0));
    const out = removeRows(table, drop);
    ch.removedRows = [...drop]; ch.rowsAfter = out.rows.length;
    ch.note = drop.size ? `Deleted ${plural(drop.size, 'row')} (${(drop.size / table.rows.length * 100).toFixed(1)}% of rows) with a missing ${cols.join(' or ')}.` : `No row has a missing ${cols.join(' or ')}, so nothing was deleted.`;
    return { table: out, change: ch };
  },
  'flag-missing'(table, step) {
    const ch = baseChange(table, step);
    const j = needColumn(table, step.column);
    const name = uniqueName(table, `${step.column}_missing`);
    const vals = table.rows.map((r) => (isMissing(r[j]) ? 1 : 0));
    const out = insertColumn(table, j + 1, name, vals, 'number');
    ch.columnsAdded = [name];
    ch.cellsChanged = 0;
    ch.note = `Added ${name}: 1 on the ${plural(vals.filter(Boolean).length, 'row')} where ${step.column} is missing, 0 elsewhere. The missing values themselves are unchanged.`;
    return { table: out, change: ch };
  },
  validate(table, step) {
    const ch = baseChange(table, step);
    const j = needColumn(table, step.column);
    const rule = step.rule || {};
    const hasMin = rule.min != null && rule.min !== '', hasMax = rule.max != null && rule.max !== '';
    const inList = Array.isArray(rule.in) && rule.in.length ? new Set(rule.in.map(String)) : null;
    let re = null;
    if (rule.pattern) { try { re = new RegExp(rule.pattern); } catch { throw new StepError('The pattern isn’t a valid regular expression.'); } }
    const kOther = rule.other ? needColumn(table, rule.other) : -1;
    let expr = null;
    if (rule.expr) { try { expr = compileExpr(rule.expr, table.columns.map((c) => c.name)); } catch (e) { throw new StepError(e.message); } }
    if (!hasMin && !hasMax && !inList && !re && !rule.integer && kOther < 0 && !expr) throw new StepError('Set at least one rule: a minimum, a maximum, whole numbers, a list of allowed values, a pattern, a comparison with another column or a formula it must equal.');
    const cmpOp = rule.op || '>';
    const cmpTest = { '>': (a, b) => a > b, '>=': (a, b) => a >= b, '<': (a, b) => a < b, '<=': (a, b) => a <= b, '!=': (a, b) => a !== b }[cmpOp] || ((a, b) => a > b);
    const idxOf = Object.fromEntries(table.columns.map((c, k) => [c.name, k]));
    const asVal = (c, dates2) => (dates2 ? (isoDate(c) ? dateMs(String(c).trim()) : NaN) : typeof c === 'number' ? c : plainNumber(c));
    const dates = isDateBound(rule.min) || isDateBound(rule.max);
    const lo = hasMin ? (dates ? dateMs(rule.min) : +rule.min) : -Infinity, hi = hasMax ? (dates ? dateMs(rule.max) : +rule.max) : Infinity;
    const bad = [];
    table.rows.forEach((r, i) => {
      const c = r[j];
      if (isMissing(c)) return;
      if (hasMin || hasMax || rule.integer) {
        const v = dates ? (isoDate(c) ? dateMs(String(c).trim()) : NaN) : typeof c === 'number' ? c : plainNumber(c);
        if (!Number.isFinite(v)) { bad.push([i, dates ? 'not an ISO date' : 'not a number']); return; }
        if (v < lo || v > hi) { bad.push([i, v < lo ? 'below the minimum' : 'above the maximum']); return; }
        if (rule.integer && !Number.isInteger(v)) { bad.push([i, 'not a whole number']); return; }
      }
      if (inList && !inList.has(cellText(c))) { bad.push([i, 'not an allowed value']); return; }
      if (re && !re.test(cellText(c))) { bad.push([i, 'does not match the pattern']); return; }
      if (kOther >= 0 && !isMissing(r[kOther])) {
        const dd = isoDate(c) || isoDate(r[kOther]);
        const a = asVal(c, dd), b2 = asVal(r[kOther], dd);
        if (!Number.isFinite(a) || !Number.isFinite(b2)) { bad.push([i, dd ? 'not an ISO date in both columns' : 'not a number in both columns']); return; }
        if (!cmpTest(a, b2)) { bad.push([i, `not ${cmpOp} ${rule.other}`]); return; }
      }
      if (expr && !expr.columns.some((n) => isMissing(r[idxOf[n]]))) {
        const lhs = typeof c === 'number' ? c : plainNumber(c);
        const rhs = expr.eval((n, kind) => (kind === 'date' ? (isoDate(r[idxOf[n]]) ? dateMs(String(r[idxOf[n]]).trim()) : NaN) : asVal(r[idxOf[n]], false)));
        if (!Number.isFinite(lhs) || !Number.isFinite(rhs)) { bad.push([i, 'the formula can’t be calculated (convert the columns first)']); return; }
        if (Math.abs(lhs - rhs) > (+rule.tol || 0) + 1e-9) bad.push([i, `does not equal ${prettyExpr(rule.expr)} (${fmtNum(rhs)})`]);
      }
    });
    const action = step.action || 'flag';
    const desc = [hasMin && hasMax ? `${rule.min} to ${rule.max}` : hasMin ? `at least ${rule.min}` : hasMax ? `at most ${rule.max}` : '', rule.integer ? 'whole numbers' : '', inList ? `one of ${[...inList].slice(0, 6).join(', ')}${inList.size > 6 ? ', …' : ''}` : '', re ? `matching ${rule.pattern}` : '', kOther >= 0 ? `${cmpOp} ${rule.other}` : '', expr ? `equal to ${prettyExpr(rule.expr)}${+rule.tol ? ` within ${rule.tol}` : ''}` : ''].filter(Boolean).join('; ');
    let out = table;
    const badSet = new Set(bad.map((b) => b[0]));
    if (action === 'set-missing') out = mapColumn(table, j, (c, i) => (badSet.has(i) ? null : undefined), ch);
    else if (action === 'drop') { out = removeRows(table, badSet); ch.removedRows = [...badSet]; ch.rowsAfter = out.rows.length; }
    else { const name = uniqueName(table, `${step.column}_invalid`); out = insertColumn(table, j + 1, name, table.rows.map((_, i) => (badSet.has(i) ? 1 : 0)), 'number'); ch.columnsAdded = [name]; }
    ch.params = { violations: bad.map(([i, why]) => ({ row: i, value: table.rows[i][j], why })) };
    const ex = bad.slice(0, 5).map(([i]) => `“${short(table.rows[i][j])}”`).join(', ');
    ch.note = bad.length
      ? `Checked ${step.column} against: ${desc}. ${plural(bad.length, 'value')} broke the rule (${ex}${bad.length > 5 ? ', …' : ''}); ${action === 'set-missing' ? 'they are now missing' : action === 'drop' ? `deleted ${plural(bad.length, 'row')}` : `flagged them in ${ch.columnsAdded[0]}`}.`
      : `Checked ${step.column} against: ${desc}. Every value passed${action === 'flag' ? `; ${ch.columnsAdded[0]} is 0 on every row` : ''}.`;
    return { table: out, change: ch };
  },
  outliers(table, step) {
    const ch = baseChange(table, step);
    const j = needColumn(table, step.column);
    const vals = numericValues(table, j);
    const fin = vals.filter((v) => v != null);
    const method = step.method || 'iqr';
    const k = Number.isFinite(+step.k) && +step.k > 0 ? +step.k : method === 'iqr' ? 1.5 : method === 'z' ? 3 : 3.5;
    if (fin.length < 3) throw new StepError(`${step.column} has ${fin.length} value${fin.length === 1 ? '' : 's'}; outlier rules need at least 3.`);
    let lo, hi, desc;
    const s = S.sorted(fin);
    if (method === 'iqr') {
      const q1 = S.quantileSorted(s, 0.25), q3 = S.quantileSorted(s, 0.75), iqr = q3 - q1;
      lo = q1 - k * iqr; hi = q3 + k * iqr;
      ch.params = { method, k, q1, q3, iqr, lower: lo, upper: hi };
      desc = `${k} × IQR rule: Q1 = ${fmtNum(q1)}, Q3 = ${fmtNum(q3)}, IQR = ${fmtNum(iqr)}, fences ${fmtNum(lo)} and ${fmtNum(hi)}${iqr === 0 ? ' (the IQR is 0, so every value different from the quartiles counts as an outlier)' : ''}`;
    } else if (method === 'z') {
      const m = S.mean(fin), sd = S.sd(fin);
      if (!(sd > 0)) throw new StepError(`Every ${step.column} value is the same, so z-scores can’t be calculated (the SD is 0).`);
      lo = m - k * sd; hi = m + k * sd;
      ch.params = { method, k, mean: m, sd, lower: lo, upper: hi };
      desc = `|z| > ${k} with z = (x − mean) ÷ SD: mean ${fmtNum(m)}, sample SD ${fmtNum(sd)}, so values outside ${fmtNum(lo)} to ${fmtNum(hi)}`;
    } else {
      const med = S.quantileSorted(s, 0.5);
      const mad = median(fin.map((v) => Math.abs(v - med)));
      if (!(mad > 0)) throw new StepError(`More than half of the ${step.column} values equal the median, so the MAD is 0 and modified z-scores can’t be calculated. Use the IQR rule instead.`);
      lo = med - (k * mad) / 0.6745; hi = med + (k * mad) / 0.6745;
      ch.params = { method, k, median: med, mad, lower: lo, upper: hi };
      desc = `modified z > ${k} with Mz = 0.6745 × (x − median) ÷ MAD: median ${fmtNum(med)}, MAD ${fmtNum(mad)}, so values outside ${fmtNum(lo)} to ${fmtNum(hi)}`;
    }
    const isOut = (v) => v != null && (v < lo || v > hi);
    const outIdx = vals.map((v, i) => (isOut(v) ? i : -1)).filter((i) => i >= 0);
    const action = step.action || 'flag';
    let out;
    if (action === 'drop') { out = removeRows(table, new Set(outIdx)); ch.removedRows = outIdx; ch.rowsAfter = out.rows.length; }
    else if (action === 'cap') { out = mapColumn(table, j, (c, i) => (vals[i] == null ? undefined : vals[i] < lo ? lo : vals[i] > hi ? hi : vals[i]), ch); setNumericColumn(out, j, out.rows.map((r) => (typeof r[j] === 'number' ? r[j] : null))); }
    else { const name = uniqueName(table, `${step.column}_outlier`); out = insertColumn(table, j + 1, name, vals.map((v) => (isOut(v) ? 1 : 0)), 'number'); ch.columnsAdded = [name]; }
    // cap counts only real value changes (plain text that became a number isn't a change)
    if (action === 'cap') { ch.cellsChanged = outIdx.length; ch.samples = outIdx.slice(0, 8).map((i) => [i, step.column, table.rows[i][j], vals[i] < lo ? lo : hi]); }
    ch.params.outliers = outIdx.map((i) => ({ row: i, value: vals[i] }));
    const centre = S.quantileSorted(s, 0.5);
    const shown = [...new Set(outIdx.map((i) => vals[i]))].sort((a, b) => Math.abs(b - centre) - Math.abs(a - centre));
    ch.note = `${desc[0].toUpperCase()}${desc.slice(1)}. ${plural(outIdx.length, 'value')} outside${outIdx.length ? ` (${shown.length < outIdx.length ? 'distinct values, most extreme first: ' : ''}${shown.slice(0, 6).map(fmtNum).join(', ')}${shown.length > 6 ? ', …' : ''})` : ''}: ${action === 'drop' ? `deleted ${plural(outIdx.length, 'row')}` : action === 'cap' ? 'capped at the nearest fence' : `flagged in ${ch.columnsAdded[0]}`}.`;
    return { table: out, change: ch };
  },
  transform(table, step) {
    const ch = baseChange(table, step);
    const j = needColumn(table, step.column);
    const vals = numericValues(table, j);
    const fn = step.fn || 'log';
    const bad = (pred) => vals.map((v, i) => (v != null && pred(v) ? i : -1)).filter((i) => i >= 0);
    let f, label;
    if (fn === 'log') {
      const b = bad((v) => v <= 0);
      if (b.length) throw new StepError(`log is undefined for zero and negative numbers: ${plural(b.length, 'value')} in ${step.column} ${b.length === 1 ? 'is' : 'are'} 0 or below (for example ${fmtNum(vals[b[0]])} in ${rowLabel(table, b[0])}). Use log(1 + x) if the column has zeros but no negatives, or fix those values first.`);
      f = Math.log; label = 'natural logarithm, ln(x)';
    } else if (fn === 'log1p') {
      const b = bad((v) => v <= -1);
      if (b.length) throw new StepError(`log(1 + x) needs values above −1: ${plural(b.length, 'value')} in ${step.column} ${b.length === 1 ? 'is' : 'are'} −1 or below (for example ${fmtNum(vals[b[0]])} in ${rowLabel(table, b[0])}).`);
      f = Math.log1p; label = 'ln(1 + x)';
    } else if (fn === 'sqrt') {
      const b = bad((v) => v < 0);
      if (b.length) throw new StepError(`The square root is undefined for negative numbers: ${plural(b.length, 'value')} in ${step.column} ${b.length === 1 ? 'is' : 'are'} negative (for example ${fmtNum(vals[b[0]])} in ${rowLabel(table, b[0])}).`);
      f = Math.sqrt; label = 'square root';
    } else if (fn === 'rescale') {
      const factor = +step.factor;
      if (!Number.isFinite(factor) || factor === 0) throw new StepError('Enter the factor to multiply by (for example 0.04 to turn a 0–100 value into a 0–4 one).');
      const above = step.above === '' || step.above == null ? -Infinity : +step.above;
      f = (v) => (v > above ? v * factor : v);
      label = `× ${fmtNum(factor)}${Number.isFinite(above) ? ` for values above ${fmtNum(above)}` : ''}`;
    } else throw new StepError(`Unknown transformation “${fn}”.`);
    const nv = vals.map((v) => (v == null ? null : f(v)));
    let out;
    if (step.as && step.as !== step.column) {
      if (colIndex(table, step.as) >= 0) throw new StepError(`A column called ${step.as} already exists.`);
      out = insertColumn(table, j + 1, step.as, nv, 'number'); ch.columnsAdded = [step.as];
      ch.cellsChanged = 0;
    } else {
      out = copyTable(table);
      vals.forEach((v, i) => { if (v != null && nv[i] !== v) { ch.cellsChanged++; if (ch.samples.length < 8) ch.samples.push([i, step.column, table.rows[i][j], nv[i]]); } });
      setNumericColumn(out, j, nv);
    }
    const changed = fn === 'rescale' ? vals.filter((v) => v != null && f(v) !== v).length : vals.filter((v) => v != null).length;
    ch.note = `${fn === 'rescale' ? `Rescaled ${plural(changed, 'value')} of ${step.column} (${label})` : `Applied the ${label} to ${plural(changed, 'value')} of ${step.column}`}${ch.columnsAdded.length ? `, as a new column ${step.as}; ${step.column} is unchanged` : ', in place'}.${fn !== 'rescale' ? ' Results are in log units (or square-root units): back-transform before reporting them in the original units.' : ''}`;
    return { table: out, change: ch };
  },
  scale(table, step) {
    const ch = baseChange(table, step);
    const j = needColumn(table, step.column);
    const vals = numericValues(table, j);
    const method = step.method || 'zscore';
    const train = fitRows(table, step);
    const fitVals = vals.filter((v, i) => v != null && (!train || train.has(i)));
    if (fitVals.length < 2) throw new StepError('Scaling needs at least two values to learn from.');
    let f, params;
    const s = S.sorted(fitVals);
    if (method === 'zscore') {
      const m = S.mean(fitVals), sd = S.sd(fitVals);
      if (!(sd > 0)) throw new StepError('The SD is 0 (every value is the same), so z-scores can’t be calculated.');
      f = (v) => (v - m) / sd; params = { mean: m, sd };
    } else if (method === 'minmax') {
      const mn = s[0], mx = s[s.length - 1];
      if (!(mx > mn)) throw new StepError('The minimum equals the maximum, so min-max scaling would divide by zero.');
      f = (v) => (v - mn) / (mx - mn); params = { min: mn, max: mx };
    } else if (method === 'robust') {
      const med = S.quantileSorted(s, 0.5), iqr = S.quantileSorted(s, 0.75) - S.quantileSorted(s, 0.25);
      if (!(iqr > 0)) throw new StepError('The IQR is 0, so robust scaling would divide by zero.');
      f = (v) => (v - med) / iqr; params = { median: med, iqr };
    } else throw new StepError(`Unknown scaling method “${method}”.`);
    const nv = vals.map((v) => (v == null ? null : f(v)));
    let out;
    if (step.as && step.as !== step.column) {
      if (colIndex(table, step.as) >= 0) throw new StepError(`A column called ${step.as} already exists.`);
      out = insertColumn(table, j + 1, step.as, nv, 'number'); ch.columnsAdded = [step.as];
    } else {
      out = copyTable(table);
      vals.forEach((v, i) => { if (v != null && nv[i] !== v) { ch.cellsChanged++; if (ch.samples.length < 8) ch.samples.push([i, step.column, table.rows[i][j], nv[i]]); } });
      setNumericColumn(out, j, nv);
    }
    ch.params = { method, fit: train ? 'train' : 'all', ...params, trainRows: train ? train.size : vals.length };
    const pText = method === 'zscore' ? `mean ${fmtNum(params.mean)} and sample SD ${fmtNum(params.sd)}` : method === 'minmax' ? `minimum ${fmtNum(params.min)} and maximum ${fmtNum(params.max)}` : `median ${fmtNum(params.median)} and IQR ${fmtNum(params.iqr)}`;
    const name = { zscore: 'Standardised (z-score: (x − mean) ÷ SD)', minmax: 'Min-max scaled ((x − min) ÷ (max − min))', robust: 'Robust-scaled ((x − median) ÷ IQR)' }[method];
    ch.note = `${name} ${step.column}${ch.columnsAdded.length ? ` into ${step.as}` : ''} using ${pText}, ${train ? `learned from ${fitText(step, train, table.rows.length)} and applied to every row. Rows outside the training ${step.split ? 'rows' : 'subset'} never influenced the parameters${method === 'minmax' ? ', so their scaled values can fall below 0 or above 1' : ''}.` : `learned from all ${table.rows.length} rows. If you later split the data into training and test sets, the test rows have already influenced these parameters (leakage).`}`;
    return { table: out, change: ch };
  },
  encode(table, step) {
    const ch = baseChange(table, step);
    const j = needColumn(table, step.column);
    const method = step.method || 'onehot';
    const cells = columnCells(table, j);
    const levels = [...new Set(cells.filter((c) => !isMissing(c)).map(cellText))].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
    const nMiss = cells.filter(isMissing).length;
    if (method === 'onehot') {
      if (levels.length > 30) throw new StepError(`${step.column} has ${levels.length} different values; one-hot encoding would add too many columns. Group rare values first.`);
      if (levels.length < 2) throw new StepError(`${step.column} has fewer than two different values, so there is nothing to encode.`);
      const use = step.dropFirst ? levels.slice(1) : levels;
      const out = copyTable(table);
      const base = table.columns.filter((_, k) => k !== j);
      const newNames = [];
      const taken = new Set(base.map((c) => c.name));
      use.forEach((lv) => { let nm = `${step.column}_${lv.replace(/\s+/g, '_')}`, k = 2; while (taken.has(nm)) nm = `${step.column}_${lv.replace(/\s+/g, '_')}_${k++}`; taken.add(nm); newNames.push(nm); });
      out.columns.splice(j, 1, ...newNames.map((nm) => ({ name: nm, type: 'number' })));
      out.rows.forEach((r, i) => { const v = cellText(cells[i]); r.splice(j, 1, ...use.map((lv) => (!isMissing(cells[i]) && v === lv ? 1 : 0))); });
      ch.columnsAdded = newNames; ch.columnsRemoved = [step.column];
      ch.params = { levels, reference: step.dropFirst ? levels[0] : null };
      ch.note = `Replaced ${step.column} with ${plural(newNames.length, '0/1 column')} (${newNames.join(', ')}), one per value in alphabetical order${step.dropFirst ? `; dropped the first, ${levels[0]}, which becomes the reference category (a row with 0 in every column is ${levels[0]})` : ''}.${nMiss ? ` ${plural(nMiss, 'row')} with a missing ${step.column} ${nMiss === 1 ? 'has' : 'have'} 0 in every new column${step.dropFirst ? ', the same as the reference category' : ''}.` : ''}`;
      return { table: out, change: ch };
    }
    if (method === 'target') {
      const k = needColumn(table, step.target);
      if (k === j) throw new StepError('The target must be a different column.');
      const y = numericValues(table, k);
      const train = fitRows(table, step);
      const sums = new Map();
      let tot = 0, cnt = 0;
      table.rows.forEach((r, i) => {
        if (train && !train.has(i)) return;
        if (y[i] == null || isMissing(r[j])) return;
        const lv = cellText(r[j]); const e = sums.get(lv) || { s: 0, n: 0 }; e.s += y[i]; e.n++; sums.set(lv, e); tot += y[i]; cnt++;
      });
      if (!cnt) throw new StepError('No rows to learn the target means from.');
      const overall = tot / cnt;
      let unseen = 0;
      const vals = table.rows.map((r) => { if (isMissing(r[j])) return null; const e = sums.get(cellText(r[j])); if (!e) { unseen++; return overall; } return e.s / e.n; });
      const name = step.as && step.as !== step.column ? step.as : uniqueName(table, `${step.column}_target`);
      if (colIndex(table, name) >= 0) throw new StepError(`A column called ${name} already exists.`);
      const out = insertColumn(table, j + 1, name, vals, 'number');
      ch.columnsAdded = [name];
      ch.params = { target: step.target, means: Object.fromEntries([...sums].map(([lv, e]) => [lv, e.s / e.n])), overall, fit: train ? 'train' : 'all' };
      ch.note = `Added ${name}: each ${step.column} value replaced by the mean of ${step.target} for that value (${[...sums].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([lv, e]) => `${lv} ${fmtNum(e.s / e.n)} from ${e.n} row${e.n === 1 ? '' : 's'}`).join(', ')}), learned from ${train ? fitText(step, train, table.rows.length) : `all ${table.rows.length} rows, so every row’s own outcome helped set its code (target leakage)`}.${unseen ? ` ${plural(unseen, 'row')} with a value not seen in those rows got the overall mean (${fmtNum(overall)}).` : ''} Means from few rows are noisy.`;
      return { table: out, change: ch };
    }
    if (method !== 'ordinal') throw new StepError(`Unknown encoding “${method}”.`);
    const order = (Array.isArray(step.order) && step.order.length ? step.order : levels).map(String);
    const code = new Map(order.map((v, k) => [v, k]));
    const out = mapColumn(table, j, (c, i) => {
      if (isMissing(c)) return undefined;
      const k = code.get(cellText(c));
      if (k == null) { ch.unresolved.push({ row: i, column: step.column, value: c, reason: 'not in the order list' }); return null; }
      return k;
    }, ch);
    out.columns[j] = { ...out.columns[j], type: 'number' };
    ch.params = { order };
    ch.note = `Replaced ${step.column} with codes 0 to ${order.length - 1} in this order: ${order.map((v, k) => `${v} = ${k}`).join(', ')}.${Array.isArray(step.order) && step.order.length ? '' : ' No order was given, so the values were sorted alphabetically; check that this order means something.'} The codes assume equal steps between neighbouring levels.${ch.unresolved.length ? ` ${plural(ch.unresolved.length, 'value')} not in the list became missing.` : ''}`;
    return { table: out, change: ch };
  },
  derive(table, step) {
    const ch = baseChange(table, step);
    const fn = step.fn;
    const from = (step.from || []).filter(Boolean);
    const as = String(step.as || '').trim();
    if (!as) throw new StepError('Name the new column.');
    if (colIndex(table, as) >= 0) throw new StepError(`A column called ${as} already exists.`);
    const two = ['multiply', 'divide', 'add', 'subtract', 'days-between'].includes(fn);
    if (!two && !['year', 'month', 'weekday'].includes(fn)) throw new StepError(`Unknown calculation “${fn}”.`);
    if (from.length < (two ? 2 : 1)) throw new StepError(two ? 'Choose two columns.' : 'Choose a date column.');
    const idx = from.slice(0, two ? 2 : 1).map((c) => needColumn(table, c));
    let vals;
    let divZero = 0, unread = 0;
    if (['multiply', 'divide', 'add', 'subtract'].includes(fn)) {
      const a = numericValues(table, idx[0]), b = numericValues(table, idx[1]);
      vals = a.map((x, i) => {
        const y = b[i];
        if (x == null || y == null) return null;
        if (fn === 'divide' && y === 0) { divZero++; return null; }
        return fn === 'multiply' ? x * y : fn === 'divide' ? x / y : fn === 'add' ? x + y : x - y;
      });
    } else {
      const ds = idx.map((k) => table.rows.map((r) => (isMissing(r[k]) ? null : isoDate(r[k]) ? dateMs(String(r[k]).trim()) : NaN)));
      const nonIso = ds.flat().filter((v) => Number.isNaN(v)).length;
      const present = ds.flat().filter((v) => v != null).length;
      if (present && nonIso > present / 2) throw new StepError(`${from.join(' and ')} ${from.length > 1 ? 'are' : 'is'} not stored as ISO dates yet. Convert ${from.length > 1 ? 'them' : 'it'} to dates first.`);
      const WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      vals = table.rows.map((_, i) => {
        const a = ds[0][i], b = ds[1]?.[i];
        if (a == null || (fn === 'days-between' && b == null)) return null;
        if (Number.isNaN(a) || (fn === 'days-between' && Number.isNaN(b))) { unread++; return null; }
        const t = new Date(a);
        return fn === 'year' ? t.getUTCFullYear() : fn === 'month' ? t.getUTCMonth() + 1 : fn === 'weekday' ? WD[t.getUTCDay()] : Math.round((b - a) / DAY);
      });
    }
    const out = insertColumn(table, table.columns.length, as, vals, fn === 'weekday' ? 'category' : 'number');
    ch.columnsAdded = [as];
    const sym = { multiply: '×', divide: '÷', add: '+', subtract: '−' }[fn];
    const formula = sym ? `${from[0]} ${sym} ${from[1]}` : fn === 'days-between' ? `days from ${from[0]} to ${from[1]}` : `${fn} of ${from[0]}${fn === 'month' ? ' (1–12)' : ''}`;
    ch.params = { formula };
    ch.note = `Added ${as} = ${formula}.${vals.filter((v) => v == null).length ? ` ${plural(vals.filter((v) => v == null).length, 'row')} ${vals.filter((v) => v == null).length === 1 ? 'is' : 'are'} missing because an input was missing${divZero ? ` or the divisor was 0 (${divZero})` : ''}${unread ? ` or a date couldn’t be read (${unread})` : ''}.` : ''}`;
    return { table: out, change: ch };
  },
  rename(table, step) {
    const ch = baseChange(table, step);
    const j = needColumn(table, step.from);
    const to = String(step.to || '').trim();
    if (!to) throw new StepError('Enter the new name.');
    if (to !== step.from && colIndex(table, to) >= 0) throw new StepError(`A column called ${to} already exists.`);
    const out = copyTable(table);
    out.columns[j] = { ...out.columns[j], name: to };
    ch.note = `Renamed ${step.from} to ${to}. The values are unchanged.`;
    return { table: out, change: ch };
  },
  'drop-column'(table, step) {
    const ch = baseChange(table, step);
    const j = needColumn(table, step.column);
    const out = copyTable(table);
    out.columns.splice(j, 1);
    out.rows.forEach((r) => r.splice(j, 1));
    ch.columnsRemoved = [step.column];
    ch.note = `Deleted the column ${step.column} (${plural(table.rows.filter((r) => !isMissing(r[j])).length, 'value')}).`;
    return { table: out, change: ch };
  },
};

/** Replay a recipe from the raw table. Refused steps are recorded (change.error) and skipped. */
export function run(raw, recipe = []) {
  let t = raw; const changes = [];
  for (const step of recipe) { const r = apply(t, step); changes.push(r.change); t = r.table; }
  return { table: t, changes };
}

// ================================================================ before and after
function numStats(table, j) {
  const p = profileColumn(table, j);
  if (p.type !== 'number') {
    const vals = columnCells(table, j).map((c) => (typeof c === 'number' ? c : looseNumber(c))).filter(Number.isFinite);
    const s = S.sorted(vals);
    return { count: vals.length, missing: p.missing, mean: S.mean(vals), median: S.quantileSorted(s, 0.5), sd: S.sd(vals), min: s[0], max: s[s.length - 1] };
  }
  return { count: p.n, missing: p.missing, mean: p.mean, median: p.median, sd: p.sd, min: p.min, max: p.max };
}
function catStats(table, j) {
  const cells = columnCells(table, j);
  const counts = new Map();
  let missing = 0;
  cells.forEach((c) => { if (isMissing(c)) { missing++; return; } const k = cellText(c); counts.set(k, (counts.get(k) || 0) + 1); });
  const total = cells.length - missing;
  return { count: total, missing, rows: cells.length, levels: [...counts].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).map(([v, n]) => [v, n, total ? n / total : NaN]) };
}
/**
 * Effects on watched columns. Numeric columns: { count, missing, mean, median, sd, min, max } before and after;
 * other columns: the share of each value among the rows that have one, before and after.
 */
export function compare(before, after, { watch = [] } = {}) {
  return watch.map((name) => {
    const jb = colIndex(before, name), ja = colIndex(after, name);
    const ref = ja >= 0 ? profileColumn(after, ja) : jb >= 0 ? profileColumn(before, jb) : null;
    if (!ref) return { column: name, kind: 'none', before: null, after: null };
    const looksNum = (t, j) => j >= 0 && (profileColumn(t, j).type === 'number');
    const numeric = ref.type === 'number' || (jb >= 0 && looksNum(before, jb) && ja < 0);
    if (numeric) return { column: name, kind: 'number', before: jb >= 0 ? numStats(before, jb) : null, after: ja >= 0 ? numStats(after, ja) : null };
    return { column: name, kind: 'category', before: jb >= 0 ? catStats(before, jb) : null, after: ja >= 0 ? catStats(after, ja) : null };
  });
}

// ================================================================ describing steps and the report
const caseName = { lower: 'lower case', upper: 'UPPER CASE', title: 'Title Case' };
/** One line of plain English for a step. */
export function describeStep(st) {
  switch (st.op) {
    case 'dedupe': return 'Remove exact duplicate rows';
    case 'dedupe-key': return `Remove repeated ${(st.columns || []).length > 3 ? `records (matching on ${st.columns.length} columns)` : (st.columns || []).join(' + ')}, keeping the ${{ first: 'first', last: 'last', 'most-complete': 'most complete' }[st.keep || 'first']} row`;
    case 'trim': return st.all ? 'Trim spaces in every text column' : `Trim spaces in ${st.column}`;
    case 'case': return `Change ${st.column} to ${caseName[st.to || 'lower']}`;
    case 'map': return `Map ${plural(Object.keys(st.mapping || {}).length, 'spelling')} in ${st.column} to standard values`;
    case 'to-number': return `Convert ${st.column} to numbers (decimal ${st.decimal === ',' ? 'comma' : 'point'})`;
    case 'to-date': return `Convert ${st.column} to dates (${{ auto: 'automatic order', DMY: 'day first', MDY: 'month first', YMD: 'year first' }[st.order || 'auto']}${st.serial ? '; spreadsheet serials on' : ''})`;
    case 'fill': {
      const how = st.method === 'constant' ? `the value ${cellText(st.value)}` : st.method === 'group-median' ? `the median of each ${st.by} group` : `the ${st.method || 'median'}${st.by ? ` of each ${st.by} group` : ''}`;
      return `Fill missing ${st.column} with ${how}${st.fit === 'train' ? ' (learned from the training subset)' : ''}`;
    }
    case 'drop-missing': return `Delete rows with a missing ${(st.columns || [st.column]).join(' or ')}`;
    case 'flag-missing': return `Add ${st.column}_missing (1 = missing)`;
    case 'validate': {
      const r = st.rule || {};
      const parts = [r.min != null && r.min !== '' && r.max != null && r.max !== '' ? `${r.min} to ${r.max}` : r.min != null && r.min !== '' ? `at least ${r.min}` : r.max != null && r.max !== '' ? `at most ${r.max}` : '', r.integer ? 'whole numbers' : '', r.in?.length ? `one of ${r.in.length} values` : '', r.pattern ? 'matches a pattern' : '', r.other ? `${r.op || '>'} ${r.other}` : '', r.expr ? `= ${prettyExpr(r.expr)}` : ''].filter(Boolean).join(', ');
      return `Check ${st.column} (${parts}); ${{ 'set-missing': 'set failures to missing', drop: 'delete failing rows', flag: 'flag failures' }[st.action || 'flag']}`;
    }
    case 'outliers': {
      const rule = { iqr: `${st.k ?? 1.5} × IQR fences`, z: `|z| > ${st.k ?? 3}`, mad: `modified z > ${st.k ?? 3.5}` }[st.method || 'iqr'];
      return `${{ flag: 'Flag', cap: 'Cap', drop: 'Delete rows with' }[st.action || 'flag']} ${st.column} outliers (${rule})`;
    }
    case 'transform': return st.fn === 'rescale' ? `Rescale ${st.column} (× ${st.factor}${st.above != null && st.above !== '' ? ` above ${st.above}` : ''})` : `Apply ${{ log: 'ln(x)', log1p: 'ln(1 + x)', sqrt: '√x' }[st.fn || 'log']} to ${st.column}${st.as && st.as !== st.column ? ` as ${st.as}` : ''}`;
    case 'scale': return `${{ zscore: 'Standardise (z-score)', minmax: 'Min-max scale', robust: 'Robust-scale' }[st.method || 'zscore']} ${st.column}${st.as && st.as !== st.column ? ` as ${st.as}` : ''}, fitted on ${st.fit === 'train' ? (st.split ? `the training rows (${st.split} = train)` : `a ${Math.round((st.trainShare ?? 0.7) * 100)}% training subset`) : 'all rows'}`;
    case 'encode': return st.method === 'ordinal' ? `Ordinal-encode ${st.column}` : st.method === 'target' ? `Target-encode ${st.column} with the mean of ${st.target}, fitted on ${st.fit === 'train' ? (st.split ? 'the training rows' : 'a training subset') : 'all rows'}` : `One-hot encode ${st.column}${st.dropFirst ? ' (drop the first level)' : ''}`;
    case 'derive': {
      const f = (st.from || []);
      const sym = { multiply: '×', divide: '÷', add: '+', subtract: '−' }[st.fn];
      return `Add ${st.as} = ${sym ? `${f[0]} ${sym} ${f[1]}` : st.fn === 'days-between' ? `days from ${f[0]} to ${f[1]}` : `${st.fn} of ${f[0]}`}`;
    }
    case 'rename': return `Rename ${st.from} to ${st.to}`;
    case 'drop-column': return `Delete the column ${st.column}`;
    default: return String(st.op);
  }
}
/** The assumption a step makes, in a sentence, or null. */
function assumptionOf(st) {
  switch (st.op) {
    case 'dedupe': return 'Rows identical in every column record the same event once, not two identical events.';
    case 'dedupe-key': return `Rows sharing ${(st.columns || []).length > 3 ? 'every value except the identifier' : (st.columns || []).join(' + ')} are copies of one record, and the ${{ first: 'first', last: 'last', 'most-complete': 'most complete' }[st.keep || 'first']} copy is the right one.`;
    case 'to-date': return [st.order === 'DMY' ? `Slash dates in ${st.column} were written day first (DD/MM/YYYY).` : st.order === 'MDY' ? `Slash dates in ${st.column} were written month first (MM/DD/YYYY).` : st.order === 'YMD' ? `Slash dates in ${st.column} were written year first.` : null, 'Two-digit years 00–68 mean 2000–2068 and 69–99 mean 1969–1999.', st.serial ? `Whole numbers in ${st.column} are spreadsheet serial dates in the 1900 date system (day 1 = 1 January 1900).` : null].filter(Boolean).join(' ');
    case 'to-number': return st.decimal === ',' ? `${st.column} uses a decimal comma.` : null;
    case 'fill':
      if (st.method === 'constant') return `A missing ${st.column} means ${cellText(st.value)}.`;
      return `Missing ${st.column} values are missing at random${st.by ? ` given ${st.by}` : ' (or completely at random)'}, so the ${st.method === 'group-median' ? 'group median' : st.method || 'median'} is a reasonable stand-in. Filled values understate the spread of ${st.column}.`;
    case 'drop-missing': return `Rows with a missing ${(st.columns || [st.column]).join(' or ')} are missing completely at random; otherwise the remaining rows are a biased sample.`;
    case 'validate': return st.action === 'set-missing' ? `Values of ${st.column} outside the rule are errors that can’t be corrected from this file.` : null;
    case 'outliers': return st.action === 'flag' ? null : `Values of ${st.column} beyond the fences are errors or too influential to keep as they are; genuine extremes treated this way lose information.`;
    case 'scale': return st.fit === 'train' ? null : `Scaling parameters for ${st.column} were learned from all rows; for modelling, learn them from the training rows only.`;
    case 'encode': return st.method === 'ordinal' ? `${st.column} has a meaningful order with roughly equal steps between levels.` : st.method === 'target' && st.fit !== 'train' ? `Target means for ${st.column} were learned from all rows, including the rows they are later used to predict (leakage).` : null;
    default: return null;
  }
}
const mdCell = (v) => cellText(v).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
const fmtStat = (v) => (Number.isFinite(v) ? fmtNum(v) : '—');

/**
 * The data quality report in Markdown: rows and columns before and after, issues found and fixed, each step with its
 * rationale and effect, the effect on the main variables, remaining caveats and the assumptions. opts: { name, notes,
 * date (YYYY-MM-DD), rules, watch }.
 */
export function qualityReport(raw, cleaned, recipe = [], opts = {}) {
  const { name = 'dataset', notes = [], rules = [], watch } = opts;
  const date = opts.date || new Date().toISOString().slice(0, 10);
  const inputs = [];
  let tcur = raw;
  const changes = recipe.map((st) => { inputs.push(tcur); const r = apply(tcur, st); tcur = r.table; return r.change; });
  const clean = cleaned || tcur;
  const before = detectIssues(raw, { rules }), after = detectIssues(clean, { rules });
  const missingCells = (t) => t.rows.reduce((a, r) => a + r.filter(isMissing).length, 0);
  const removed = changes.reduce((a, c) => a + (c.error ? 0 : c.rowsBefore - c.rowsAfter), 0);
  const cells = changes.reduce((a, c) => a + (c.error ? 0 : c.cellsChanged), 0);
  const L = [];
  L.push(`# Data quality report: ${name}`, '');
  L.push(`Prepared with the Data Cleaning Lab (Sunflower Intelligence) on ${date}. Every figure was calculated from the raw file and the recipe at the end; replaying the recipe on the raw file reproduces the cleaned data exactly.`, '');
  L.push('## Summary', '');
  L.push('| | Raw | Cleaned |', '|---|---:|---:|');
  L.push(`| Rows | ${raw.rows.length} | ${clean.rows.length} |`);
  L.push(`| Columns | ${raw.columns.length} | ${clean.columns.length} |`);
  L.push(`| Missing cells | ${missingCells(raw)} | ${missingCells(clean)} |`);
  L.push(`| Issues detected | ${before.length} | ${after.length} |`, '');
  L.push(`${plural(recipe.length, 'step')} changed ${plural(cells, 'cell')}, removed ${plural(removed, 'row')}, added ${plural(changes.reduce((a, c) => a + (c.error ? 0 : c.columnsAdded.length), 0), 'column')} and deleted ${plural(changes.reduce((a, c) => a + (c.error ? 0 : c.columnsRemoved.length), 0), 'column')}.`, '');
  L.push('## Issues found and what happened to them', '');
  if (!before.length) L.push('No issues were detected in the raw file.', '');
  else {
    L.push('| Issue | Column | Raw | Cleaned |', '|---|---|---:|---:|');
    const afterBy = new Map(after.map((x) => [x.id, x]));
    before.forEach((x) => { const a = afterBy.get(x.id); L.push(`| ${x.title} | ${mdCell(x.column ?? 'all')} | ${x.count} | ${a ? a.count : 'fixed'} |`); });
    after.filter((x) => !before.some((b) => b.id === x.id)).forEach((x) => L.push(`| ${x.title} (new) | ${mdCell(x.column ?? 'all')} | 0 | ${x.count} |`));
    L.push('', 'Counts are rows or values affected. Outliers and skewness are reported for review, not as errors: a genuine extreme can stay.', '');
  }
  L.push('## Cleaning steps', '');
  if (!recipe.length) L.push('No steps were applied.', '');
  recipe.forEach((st, i) => {
    const c = changes[i];
    L.push(`${i + 1}. **${mdCell(describeStep(st))}**`);
    L.push(`   - Why: ${st.why ? mdCell(st.why) : 'no reason recorded.'}`);
    if (c.error) L.push(`   - Not applied: ${mdCell(c.error)}`);
    else L.push(`   - Effect: ${mdCell(c.note)} Rows ${c.rowsBefore} → ${c.rowsAfter}; ${plural(c.cellsChanged, 'cell')} changed.`);
  });
  L.push('');
  // effect on the main variables
  const numCols = (watch && watch.length ? watch : clean.columns.map((c) => c.name)).filter((nm) => colIndex(raw, nm) >= 0 && colIndex(clean, nm) >= 0);
  const effects = compare(raw, clean, { watch: numCols }).filter((e) => e.kind === 'number' && e.before && e.after).slice(0, 10);
  if (effects.length) {
    L.push('## Effect on the main variables', '');
    L.push('Raw figures read numbers stored as text (for example “$18.50”) as numbers, so the two columns compare like with like. SD is the sample standard deviation.', '');
    L.push('| Column | Values | Missing | Mean | Median | SD | Min | Max |', '|---|---:|---:|---:|---:|---:|---:|---:|');
    effects.forEach((e) => {
      const b = e.before, a = e.after;
      const pair = (x, y, f = fmtStat) => (f(x) === f(y) ? f(y) : `${f(x)} → ${f(y)}`);
      L.push(`| ${mdCell(e.column)} | ${pair(b.count, a.count, String)} | ${pair(b.missing, a.missing, String)} | ${pair(b.mean, a.mean)} | ${pair(b.median, a.median)} | ${pair(b.sd, a.sd)} | ${pair(b.min, a.min)} | ${pair(b.max, a.max)} |`);
    });
    L.push('');
  }
  L.push('## Remaining caveats', '');
  const caveats = [];
  after.forEach((x) => caveats.push(`${x.title}: ${x.message}`));
  changes.forEach((c, i) => {
    if (c.error) caveats.push(`Step ${i + 1} was not applied: ${c.error}`);
    // only values that are still as they were at the end (a later step may have fixed them)
    const still = (c.unresolved || []).filter((u) => {
      const id = inputs[i].ids?.[u.row];
      const k = clean.ids ? clean.ids.indexOf(id) : -1, j = colIndex(clean, u.column);
      return k >= 0 && j >= 0 && sameCell(clean.rows[k][j], u.value);
    });
    if (still.length) caveats.push(`Step ${i + 1} left ${plural(still.length, 'value')} unchanged that ${still.length === 1 ? 'is' : 'are'} still in the data: ${still.slice(0, 4).map((u) => `“${short(u.value)}” (${u.reason})`).join('; ')}${still.length > 4 ? '; …' : ''}.`);
  });
  if (!caveats.length) caveats.push('No issues remain that the lab can detect. That does not prove the data are right: values can be wrong without breaking any rule.');
  caveats.forEach((x) => L.push(`- ${mdCell(x)}`));
  L.push('');
  L.push('## Assumptions', '');
  const ass = [...new Set(recipe.map(assumptionOf).filter(Boolean))];
  const userNotes = (Array.isArray(notes) ? notes : [notes]).filter((x) => x && String(x).trim());
  if (!ass.length && !userNotes.length) L.push('- None recorded.');
  ass.forEach((x) => L.push(`- ${mdCell(x)}`));
  userNotes.forEach((x) => L.push(`- ${mdCell(x)}`));
  L.push('', '## Recipe', '', 'Replay these steps, in order, on the raw file to reproduce the cleaned data.', '', '```json', JSON.stringify(recipe.map(({ why, ...s }) => (why ? { ...s, why } : s)), null, 2), '```', '');
  return L.join('\n');
}
