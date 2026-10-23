// sheet.js — a small spreadsheet engine for the B03 Excel lessons: A1 references, ranges, tables with structured
// references, operators with Excel's precedence, dynamic arrays that spill, and about ninety worksheet functions with
// Excel's rules (coercion, criteria, wildcards, error values, approximate matching, half-away-from-zero rounding).
// Pure functions and a Sheet class; no DOM. Checked against LibreOffice Calc and Microsoft's documented examples
// (tests/sheet.test.mjs).
//
// Values: number | string | boolean | null (empty) | Err (an error value) | Arr (a 2-D array, from a range or a
// function that returns several values). Dates are serial numbers in the 1900 date system (1 = 1 January 1900; the
// fictitious 29 February 1900 is kept, so serials from 61 on match Excel's).

// ---------------------------------------------------------------- values
export class Err { constructor(code) { this.code = code; } toString() { return this.code; } }
export const ERR = Object.freeze({
  DIV0: new Err('#DIV/0!'), NA: new Err('#N/A'), VALUE: new Err('#VALUE!'), REF: new Err('#REF!'),
  NAME: new Err('#NAME?'), NUM: new Err('#NUM!'), SPILL: new Err('#SPILL!'), CALC: new Err('#CALC!'), CIRC: new Err('#CIRC!'),
});
export const isErr = (v) => v instanceof Err;
export class Arr {
  constructor(rows) { this.rows = rows; }                        // rows: [[v, v], [v, v]]
  get h() { return this.rows.length; }
  get w() { return this.rows[0]?.length || 0; }
  flat() { return this.rows.flat(); }
  at(r, c) { return this.rows[r]?.[c]; }
}
const isArr = (v) => v instanceof Arr;
const arr1 = (list, asCol = true) => new Arr(asCol ? list.map((v) => [v]) : [list]);

// ---------------------------------------------------------------- addresses
export function colToIndex(col) { let n = 0; for (const ch of col.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; }
export function indexToCol(i) { let s = ''; i += 1; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
export const addr = (r, c) => `${indexToCol(c)}${r + 1}`;
/** "B3" → { r: 2, c: 1 }; "$B$3" too. Returns null if it isn't a cell reference. */
export function parseAddr(s) {
  const m = /^\$?([A-Za-z]{1,3})\$?(\d{1,7})$/.exec(String(s).trim());
  return m ? { r: Number(m[2]) - 1, c: colToIndex(m[1]) } : null;
}
/** "A1:C5" → { r0, c0, r1, c1 } (normalised so r0 ≤ r1, c0 ≤ c1). */
export function parseRange(s) {
  const [a, b] = String(s).split(':');
  const p = parseAddr(a), q = parseAddr(b ?? a);
  if (!p || !q) return null;
  return { r0: Math.min(p.r, q.r), c0: Math.min(p.c, q.c), r1: Math.max(p.r, q.r), c1: Math.max(p.c, q.c) };
}

// ---------------------------------------------------------------- dates (1900 system)
const DAY = 86400000;
const EPOCH = Date.UTC(1899, 11, 30);                            // serial 0 for dates from 1 March 1900
export function dateSerial(y, m, d) {
  // DATE(): months and days may overflow or be ≤ 0, as in Excel
  const t = Date.UTC(y, m - 1, 1) + (d - 1) * DAY;
  let s = Math.round((t - EPOCH) / DAY);
  if (s < 61) s -= 1;                                            // before 1 March 1900 (Excel's 29 February 1900 bug)
  return s;
}
export function serialToYMD(s) {
  s = Math.floor(s);
  if (s === 60) return [1900, 2, 29];
  const t = EPOCH + (s < 60 ? s + 1 : s) * DAY;
  const d = new Date(t);
  return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()];
}
/** "2026-03-14" → serial; returns null if not an ISO date. */
export function isoToSerial(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
  return m ? dateSerial(+m[1], +m[2], +m[3]) : null;
}

// ---------------------------------------------------------------- numbers
/** Excel shows and compares numbers to 15 significant digits. */
const p15 = (x) => (Number.isFinite(x) ? Number(x.toPrecision(15)) : x);
/** Round half away from zero to `d` decimal places (d may be negative), as Excel's ROUND does. */
export function round(x, d = 0, mode = 'half') {
  const p = 10 ** d;
  const y = p15(Math.abs(x) * p);
  const r = mode === 'up' ? Math.ceil(y) : mode === 'down' ? Math.floor(y) : Math.floor(y + 0.5);
  return Math.sign(x) * r / p || 0;
}

// ---------------------------------------------------------------- tokenizer
const FN_RE = /^[A-Za-z_][A-Za-z0-9_.]*(?=\s*\()/;
function tokenize(src) {
  const t = [];
  let i = 0, braces = 0;
  const s = src;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (ch === '"') {
      let j = i + 1, str = '';
      for (;;) {
        if (j >= s.length) throw new SyntaxError('A text value is missing its closing quote');
        if (s[j] === '"') { if (s[j + 1] === '"') { str += '"'; j += 2; continue; } break; }
        str += s[j++];
      }
      t.push({ k: 'str', v: str }); i = j + 1; continue;
    }
    if (ch === '#') {
      const m = /^#(DIV\/0!|N\/A|VALUE!|REF!|NAME\?|NUM!|SPILL!|CALC!)/i.exec(s.slice(i));
      if (m) { t.push({ k: 'err', v: Object.values(ERR).find((e) => e.code === m[0].toUpperCase()) }); i += m[0].length; continue; }
    }
    // structured references: Table[Col], Table[@Col], Table[[#Headers],[Col]] (kept simple), [@Col]
    let m = /^([A-Za-z_][A-Za-z0-9_.]*)?\[(@?)(?:\[?([^\]]+?)\]?)\]/.exec(s.slice(i));
    if (m && (m[1] || m[2])) { t.push({ k: 'sref', table: m[1] || null, at: !!m[2], col: m[3].trim() }); i += m[0].length; continue; }
    m = /^\$?[A-Za-z]{1,3}\$?\d{1,7}(?::\$?[A-Za-z]{1,3}\$?\d{1,7})?(?![A-Za-z0-9_(])/.exec(s.slice(i));
    if (m) { t.push({ k: 'ref', v: m[0] }); i += m[0].length; continue; }
    m = /^\$?[A-Za-z]{1,3}:\$?[A-Za-z]{1,3}(?![A-Za-z0-9_(])/.exec(s.slice(i));         // whole columns, A:A
    if (m) { t.push({ k: 'ref', v: m[0], cols: true }); i += m[0].length; continue; }
    m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(s.slice(i));
    if (m) { t.push({ k: 'num', v: Number(m[0]) }); i += m[0].length; continue; }
    m = FN_RE.exec(s.slice(i));
    if (m) { t.push({ k: 'fn', v: m[0].toUpperCase() }); i += m[0].length; continue; }
    m = /^(TRUE|FALSE)(?![A-Za-z0-9_])/i.exec(s.slice(i));
    if (m) { t.push({ k: 'bool', v: m[0].toUpperCase() === 'TRUE' }); i += m[0].length; continue; }
    m = /^[A-Za-z_][A-Za-z0-9_.]*/.exec(s.slice(i));
    if (m) { t.push({ k: 'name', v: m[0] }); i += m[0].length; continue; }
    m = /^(<>|<=|>=|[-+*/^&=<>%(),:;{}])/.exec(s.slice(i));
    if (m) {
      if (m[0] === '{') braces++; else if (m[0] === '}') braces--;
      // ";" separates rows inside an array constant; elsewhere it is an argument separator (as in many locales)
      t.push({ k: 'op', v: m[0] === ';' && !braces ? ',' : m[0] }); i += m[0].length; continue;
    }
    throw new SyntaxError(`Unexpected character “${ch}”`);
  }
  return t;
}

// ---------------------------------------------------------------- parser (Excel precedence)
// lowest → highest: comparison, &, + -, * /, ^, %, unary −/+, then primaries. (Unary minus binds tighter than ^,
// so =-2^2 is 4, as in Excel.)
export function parse(formula) {
  const src = String(formula).replace(/^=/, '');
  const toks = tokenize(src);
  let p = 0;
  const peek = () => toks[p];
  const isOp = (v) => peek()?.k === 'op' && peek().v === v;
  const take = (v) => { if (!isOp(v)) throw new SyntaxError(`Expected “${v}”`); p++; };
  function comparison() {
    let a = concat();
    while (peek()?.k === 'op' && ['=', '<>', '<', '>', '<=', '>='].includes(peek().v)) { const op = toks[p++].v; a = { t: 'bin', op, a, b: concat() }; }
    return a;
  }
  function concat() { let a = additive(); while (isOp('&')) { p++; a = { t: 'bin', op: '&', a, b: additive() }; } return a; }
  function additive() { let a = mult(); while (isOp('+') || isOp('-')) { const op = toks[p++].v; a = { t: 'bin', op, a, b: mult() }; } return a; }
  function mult() { let a = power(); while (isOp('*') || isOp('/')) { const op = toks[p++].v; a = { t: 'bin', op, a, b: power() }; } return a; }
  function power() { let a = percent(); while (isOp('^')) { p++; a = { t: 'bin', op: '^', a, b: percent() }; } return a; }
  function percent() { let a = unary(); while (isOp('%')) { p++; a = { t: 'pct', a }; } return a; }
  function unary() {
    if (isOp('-')) { p++; return { t: 'neg', a: unary() }; }
    if (isOp('+')) { p++; return unary(); }
    return primary();
  }
  function primary() {
    let a = atom();
    while (isOp(':')) { p++; a = { t: 'rng', a, b: atom() }; }      // the range operator: INDEX(…):INDEX(…)
    return a;
  }
  function atom() {
    const tk = toks[p++];
    if (!tk) throw new SyntaxError('The formula ends too early');
    if (tk.k === 'num') return { t: 'lit', v: tk.v };
    if (tk.k === 'str') return { t: 'lit', v: tk.v };
    if (tk.k === 'bool') return { t: 'lit', v: tk.v };
    if (tk.k === 'err') return { t: 'lit', v: tk.v };
    if (tk.k === 'ref') return { t: 'ref', v: tk.v, cols: !!tk.cols };
    if (tk.k === 'sref') return { t: 'sref', table: tk.table, at: tk.at, col: tk.col };
    if (tk.k === 'name') return { t: 'name', v: tk.v };
    if (tk.k === 'fn') {
      take('(');
      const args = [];
      if (!isOp(')')) {
        for (;;) {
          if (isOp(',') ) { args.push({ t: 'missing' }); p++; continue; }
          args.push(comparison());
          if (isOp(',')) { p++; if (isOp(')')) { args.push({ t: 'missing' }); break; } continue; }
          break;
        }
      }
      take(')');
      return { t: 'fn', name: tk.v.replace(/^_XLFN\./, ''), args };
    }
    if (tk.k === 'op' && tk.v === '(') { const e = comparison(); take(')'); return e; }
    if (tk.k === 'op' && tk.v === '{') {                      // array constant {1,2;3,4}
      const rows = [[]];
      for (;;) {
        const neg = isOp('-') ? (p++, -1) : 1;
        const v = toks[p++];
        if (!v || !['num', 'str', 'bool'].includes(v.k)) throw new SyntaxError('Array constants hold only numbers, text and TRUE/FALSE');
        rows[rows.length - 1].push(v.k === 'num' ? neg * v.v : v.v);
        if (isOp(',')) { p++; continue; }
        if (peek()?.k === 'op' && peek().v === ';') { p++; rows.push([]); continue; }
        break;
      }
      take('}');
      return { t: 'lit', v: new Arr(rows) };
    }
    throw new SyntaxError(`Unexpected “${tk.v ?? tk.k}”`);
  }
  const ast = comparison();
  if (p < toks.length) throw new SyntaxError(`Unexpected “${toks[p].v ?? toks[p].k}”`);
  return ast;
}

/** Every function name a formula calls (upper case), for exercises that ask for a particular function. */
export function functionsUsed(formula) {
  const out = new Set();
  const walk = (n) => { if (!n || typeof n !== 'object') return; if (n.t === 'fn') { out.add(n.name); n.args.forEach(walk); } ['a', 'b'].forEach((k) => walk(n[k])); };
  try { walk(parse(formula)); } catch { /* unparseable */ }
  return out;
}
/** Numeric literals typed into a formula (for "don't hard-code the answer" checks). */
export function literalsUsed(formula) {
  const out = [];
  const walk = (n) => { if (!n || typeof n !== 'object') return; if (n.t === 'lit' && typeof n.v === 'number') out.push(n.v); if (n.t === 'fn') n.args.forEach(walk); ['a', 'b'].forEach((k) => walk(n[k])); };
  try { walk(parse(formula)); } catch { /* unparseable */ }
  return out;
}

// ---------------------------------------------------------------- moving formulas (fill and copy)
/** Shift the relative parts of every A1 reference in `formula` by dr rows and dc columns, as Excel does when a
 *  formula is filled or copied. Absolute parts ($) stay. A reference pushed off the sheet becomes #REF!. */
export function shiftFormula(formula, dr, dc) {
  const s = String(formula);
  let out = '', i = 0, inStr = false;
  while (i < s.length) {
    const ch = s[i];
    if (ch === '"') { inStr = !inStr; out += ch; i++; continue; }
    if (inStr) { out += ch; i++; continue; }
    if (ch === '[') { const j = s.indexOf(']', i); const k = s[j + 1] === ']' ? j + 2 : j + 1; out += s.slice(i, k); i = k; continue; }
    const rest = s.slice(i);
    const prev = out.slice(-1);
    const m = /^(\$?)([A-Za-z]{1,3})(\$?)(\d{1,7})(?![A-Za-z0-9_(])/.exec(rest);
    if (m && !/[A-Za-z0-9_.]/.test(prev)) {
      const c = colToIndex(m[2]) + (m[1] ? 0 : dc), r = Number(m[4]) - 1 + (m[3] ? 0 : dr);
      out += c < 0 || r < 0 ? '#REF!' : `${m[1]}${indexToCol(c)}${m[3]}${r + 1}`;
      i += m[0].length; continue;
    }
    const w = /^[A-Za-z_][A-Za-z0-9_.]*/.exec(rest);
    if (w && !/[A-Za-z0-9_.]/.test(prev)) { out += w[0]; i += w[0].length; continue; }
    out += ch; i++;
  }
  return out;
}

// ---------------------------------------------------------------- coercion and comparison
const TEXT_NUM = /^\s*[-+]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?\s*%?\s*$/i;
// text Excel (US settings) reads as a number: currency signs, thousands separators, accounting brackets
const TEXT_MONEY = /^\s*(\()?\s*([-+])?\s*\$?\s*(\d{1,3}(?:,\d{3})+|\d+)?(\.\d+)?\s*(\))?\s*(%)?\s*$/;
function moneyText(t) {
  const m = TEXT_MONEY.exec(t);
  if (!m || (!m[3] && !m[4]) || Boolean(m[1]) !== Boolean(m[5]) || (!/\$|,/.test(t) && !m[1])) return null;
  const n = Number(`${m[3] || '0'}`.replace(/,/g, '') + (m[4] || ''));
  const v = (m[1] || m[2] === '-' ? -n : n) / (m[6] ? 100 : 1);
  return v;
}
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const monthOf = (w) => { const k = MONTHS.findIndex((x) => x.startsWith(w.toLowerCase().slice(0, 3)) && w.length >= 3 && x.startsWith(w.toLowerCase())); return k; };
/** Text Excel (with US regional settings) recognises as a date: 2026-03-14, March 14, 2026, Mar 14 2026,
 *  14 March 2026, 14-Mar-2026, 3/14/2026 (month first). Returns a serial number or null. */
export function dateText(str) {
  const t = String(str).trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t);
  const ok = (y, mo, d) => mo >= 1 && mo <= 12 && d >= 1 && d <= new Date(Date.UTC(y, mo, 0)).getUTCDate();
  if (m) return ok(+m[1], +m[2], +m[3]) ? dateSerial(+m[1], +m[2], +m[3]) : null;
  m = /^([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})$/.exec(t);
  if (m) { const k = monthOf(m[1]); return k >= 0 && ok(+m[3], k + 1, +m[2]) ? dateSerial(+m[3], k + 1, +m[2]) : null; }
  m = /^(\d{1,2})[\s-]+([A-Za-z]{3,9})\.?[\s-]+(\d{4})$/.exec(t);
  if (m) { const k = monthOf(m[2]); return k >= 0 && ok(+m[3], k + 1, +m[1]) ? dateSerial(+m[3], k + 1, +m[1]) : null; }
  m = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(t);
  if (m) return ok(+m[1], +m[2], +m[3]) ? dateSerial(+m[1], +m[2], +m[3]) : null;
  m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t);
  if (m) return ok(+m[3], +m[1], +m[2]) ? dateSerial(+m[3], +m[1], +m[2]) : null;
  return null;
}
/** A value as a number for arithmetic: empty → 0, TRUE → 1, numeric text → its number, other text → #VALUE!. */
function toNum(v) {
  if (isErr(v)) return v;
  if (v == null || v === '') return v === '' ? ERR.VALUE : 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'string') {
    const t = v.trim();
    if (TEXT_NUM.test(t)) { const pct = t.endsWith('%'); const n = Number(t.replace('%', '')); return pct ? n / 100 : n; }
    const money = moneyText(t); if (money != null) return money;
    const d = dateText(t); if (d != null) return d;
    return ERR.VALUE;
  }
  return ERR.VALUE;
}
function toStr(v) {
  if (v == null) return '';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') return generalText(v);
  return String(v);
}
function toBool(v) {
  if (isErr(v)) return v;
  if (v == null) return false;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  const u = String(v).toUpperCase();
  if (u === 'TRUE') return true; if (u === 'FALSE') return false;
  return ERR.VALUE;
}
const typeRank = (v) => (typeof v === 'number' ? 0 : typeof v === 'string' ? 1 : typeof v === 'boolean' ? 2 : -1);
/** Excel's ordering: numbers < text < FALSE < TRUE; text compared without regard to case; empty acts as 0 or "". */
function compare(a, b) {
  if (a == null) a = typeof b === 'string' ? '' : typeof b === 'boolean' ? false : 0;
  if (b == null) b = typeof a === 'string' ? '' : typeof a === 'boolean' ? false : 0;
  const ta = typeRank(a), tb = typeRank(b);
  if (ta !== tb) return ta < tb ? -1 : 1;
  if (typeof a === 'number') { const x = p15(a), y = p15(b); return x < y ? -1 : x > y ? 1 : 0; }
  if (typeof a === 'string') { const x = a.toLowerCase(), y = b.toLowerCase(); return x < y ? -1 : x > y ? 1 : 0; }
  return a === b ? 0 : a ? 1 : -1;
}

/** "General" format: up to 11 characters wide in a cell; here, up to 10 decimal places without trailing zeros. */
export function generalText(n) {
  if (!Number.isFinite(n)) return '#NUM!';
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n);
  const a = Math.abs(n);
  if (a !== 0 && (a < 1e-9 || a >= 1e15)) return n.toExponential(5).replace(/\.?0+e/, 'E').replace('e', 'E');
  return String(Number(n.toPrecision(15))).replace(/(\.\d*?)0+$/, '$1');
}

// ---------------------------------------------------------------- criteria (SUMIF, COUNTIF, …)
function wildcardRe(pattern) {
  let re = '';
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i];
    if (ch === '~' && i + 1 < pattern.length) { re += pattern[++i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); continue; }
    if (ch === '*') re += '[\\s\\S]*'; else if (ch === '?') re += '[\\s\\S]'; else re += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`, 'i');
}
/** A criteria test: 10, ">=10", "<>North", "N*", "", "<>" … */
export function criterion(crit) {
  if (isErr(crit)) return () => false;
  if (typeof crit === 'number' || typeof crit === 'boolean') return (v) => (typeof v === typeof crit || (typeof crit === 'number' && typeof v === 'string' && TEXT_NUM.test(v))) && compare(typeof crit === 'number' ? toNum(v) : v, crit) === 0;
  const s = crit == null ? '' : String(crit);
  const m = /^(<>|<=|>=|=|<|>)?([\s\S]*)$/.exec(s);
  const op = m[1] || '=';
  const rhs = m[2];
  const num = rhs.trim() !== '' && TEXT_NUM.test(rhs) ? toNum(rhs) : (isoToSerial(rhs.trim()) ?? null);
  const isBoolText = /^(TRUE|FALSE)$/i.test(rhs);
  return (v) => {
    if (isErr(v)) return false;
    if (rhs === '') {
      if (op === '=') return v == null || v === '';
      if (op === '<>') return !(v == null || v === '');
    }
    if (num != null && typeof num === 'number') {
      if (typeof v !== 'number') {
        if (op === '<>') return true;
        if (op === '=' && typeof v === 'string' && TEXT_NUM.test(v)) return toNum(v) === num;
        return false;
      }
      const c = compare(v, num);
      return op === '=' ? c === 0 : op === '<>' ? c !== 0 : op === '<' ? c < 0 : op === '>' ? c > 0 : op === '<=' ? c <= 0 : c >= 0;
    }
    if (isBoolText) {
      const b = rhs.toUpperCase() === 'TRUE';
      if (typeof v !== 'boolean') return op === '<>';
      return op === '=' ? v === b : op === '<>' ? v !== b : false;
    }
    // text criteria
    if (op === '=' || op === '<>') {
      const match = typeof v === 'string' && wildcardRe(rhs).test(v);
      return op === '=' ? match : !match;
    }
    if (typeof v !== 'string') return false;
    const c = compare(v, rhs);
    return op === '<' ? c < 0 : op === '>' ? c > 0 : op === '<=' ? c <= 0 : c >= 0;
  };
}

// ---------------------------------------------------------------- the Sheet
/**
 * new Sheet({ cells: { A1: 'Region', B2: 12.5, C2: '=B2*2', … }, tables: { Orders: 'A1:F51' }, names: { Rate: 'B1' } })
 * Cell input: a number, boolean, text, or a formula string starting with "=". Text that looks like a number is kept
 * as text (as when a cell is formatted as Text); pass numbers as numbers. Tables have a header row; `Orders[Total]`
 * is the column's data, `[@Total]` (or `Orders[@Total]`) the same row's cell.
 */
export class Sheet {
  constructor({ cells = {}, tables = {}, names = {} } = {}) {
    this.input = new Map();
    for (const [k, v] of Object.entries(cells)) this.input.set(k.replace(/\$/g, '').toUpperCase(), v);
    this.tables = {};
    for (const [name, ref] of Object.entries(tables)) this.tables[name.toLowerCase()] = { name, ...parseRange(ref) };
    this.names = Object.fromEntries(Object.entries(names).map(([k, v]) => [k.toLowerCase(), v]));
    this.reset();
  }
  reset() { this.cache = new Map(); this.spills = new Map(); this.spillOwner = new Map(); this.computing = new Set(); this.allDone = false; }
  /** Set a cell (value or "=formula") and clear the results. */
  set(a, v) { const k = a.replace(/\$/g, '').toUpperCase(); if (v == null || v === '') this.input.delete(k); else this.input.set(k, v); this.reset(); }
  raw(a) { return this.input.get(a.replace(/\$/g, '').toUpperCase()); }
  isFormula(a) { const v = this.raw(a); return typeof v === 'string' && v.startsWith('='); }
  /** The extent of everything entered: { rows, cols }. */
  extent() { let r = 0, c = 0; for (const k of this.input.keys()) { const p = parseAddr(k); if (p) { r = Math.max(r, p.r + 1); c = Math.max(c, p.c + 1); } } for (const k of this.spillOwner.keys()) { const p = parseAddr(k); r = Math.max(r, p.r + 1); c = Math.max(c, p.c + 1); } return { rows: r, cols: c }; }
  clone() { const s = new Sheet(); s.input = new Map(this.input); s.tables = { ...this.tables }; s.names = { ...this.names }; return s; }

  /** The value of one cell (a scalar; a spilling formula's own cell shows the array's top-left value). */
  get(a) {
    const k = a.replace(/\$/g, '').toUpperCase();
    if (this.input.has(k)) {
      const v = this.input.get(k);
      if (typeof v === 'string' && v.startsWith('=')) { const res = this.formulaValue(k); return isArr(res) ? res.at(0, 0) : res; }
      return v;
    }
    // possibly part of a spill: compute every formula first
    this.computeAll();
    if (this.spillOwner.has(k)) return this.spillOwner.get(k).value;
    return null;
  }
  computeAll() { if (this.allDone) return; this.allDone = true; for (const [k, v] of this.input) if (typeof v === 'string' && v.startsWith('=')) this.formulaValue(k); }
  /** A formula cell's full result (an Arr when it spills). */
  formulaValue(k) {
    if (this.cache.has(k)) return this.cache.get(k);
    if (this.computing.has(k)) return ERR.CIRC;
    this.computing.add(k);
    let res;
    try { res = evaluate(this.input.get(k), this, { at: k }); }
    catch (e) { res = e instanceof SyntaxError ? new Err('#NAME?') : ERR.VALUE; }
    this.computing.delete(k);
    if (isArr(res) && (res.h > 1 || res.w > 1)) {
      const p = parseAddr(k);
      // spill into the cells below and to the right; blocked if any is occupied
      const blocked = res.rows.some((row, i) => row.some((_, j) => (i || j) && (this.input.has(addr(p.r + i, p.c + j)) || (this.spillOwner.has(addr(p.r + i, p.c + j)) && this.spillOwner.get(addr(p.r + i, p.c + j)).owner !== k))));
      if (blocked) res = ERR.SPILL;
      else res.rows.forEach((row, i) => row.forEach((v, j) => { if (i || j) this.spillOwner.set(addr(p.r + i, p.c + j), { owner: k, value: v ?? 0 }); }));
      if (!blocked) this.spills.set(k, { h: res.h, w: res.w });
    } else if (isArr(res)) res = res.at(0, 0);
    if (res == null && typeof this.input.get(k) === 'string') res = 0;   // =A1 with A1 empty shows 0
    this.cache.set(k, res);
    return res;
  }
  /** Values of a rectangular range as an Arr. */
  range(r0, c0, r1, c1) {
    const rows = [];
    for (let r = r0; r <= r1; r++) { const row = []; for (let c = c0; c <= c1; c++) row.push(this.get(addr(r, c))); rows.push(row); }
    return new Arr(rows);
  }
  table(name) { return this.tables[String(name).toLowerCase()] || null; }
  /** A table column's position: { r0, r1, c } of its data rows. */
  tableColumn(t, col) {
    for (let c = t.c0; c <= t.c1; c++) if (String(this.get(addr(t.r0, c)) ?? '').toLowerCase() === col.toLowerCase()) return { r0: t.r0 + 1, r1: t.r1, c };
    return null;
  }
}

// ---------------------------------------------------------------- evaluation
/** Evaluate a formula ("=…") or an AST against a sheet. `at` is the cell it sits in (for [@Col] and ROW()). */
export function evaluate(formula, sheet = new Sheet(), { at = null } = {}) {
  const ast = typeof formula === 'string' ? parse(formula) : formula;
  return ev(ast, { sheet, at: at ? parseAddr(at) : null });
}

function refValue(node, ctx) {
  const { sheet } = ctx;
  if (node.cols) {
    const [a, b] = node.v.replace(/\$/g, '').split(':');
    const { rows } = sheet.extent();
    const c0 = colToIndex(a), c1 = colToIndex(b);
    return { range: true, r0: 0, c0: Math.min(c0, c1), r1: Math.max(rows - 1, 0), c1: Math.max(c0, c1) };
  }
  const rg = parseRange(node.v.replace(/\$/g, ''));
  if (!rg) return ERR.REF;
  if (rg.r0 === rg.r1 && rg.c0 === rg.c1 && !node.v.includes(':')) return { range: false, r: rg.r0, c: rg.c0 };
  return { range: true, ...rg };
}
function srefValue(node, ctx) {
  const { sheet, at } = ctx;
  let t = node.table ? sheet.table(node.table) : null;
  if (!t && at) t = Object.values(sheet.tables).find((x) => at.r > x.r0 && at.r <= x.r1 && at.c >= x.c0 && at.c <= x.c1) || null;
  if (!t) return ERR.REF;
  const col = sheet.tableColumn(t, node.col);
  if (!col) return ERR.REF;
  if (node.at) { if (!at || at.r < col.r0 || at.r > col.r1) return ERR.VALUE; return { range: false, r: at.r, c: col.c }; }
  return { range: true, r0: col.r0, c0: col.c, r1: col.r1, c1: col.c };
}
/** Evaluate to a reference object if the node is a reference, else a value. */
function evRef(node, ctx) {
  if (node.t === 'ref') return refValue(node, ctx);
  if (node.t === 'sref') return srefValue(node, ctx);
  if (node.t === 'name') {
    const n = ctx.sheet.names[node.v.toLowerCase()];
    if (n != null) return refValue({ v: n }, ctx);
    if (ctx.sheet.table(node.v)) { const t = ctx.sheet.table(node.v); return { range: true, r0: t.r0 + 1, c0: t.c0, r1: t.r1, c1: t.c1 }; }
    return ERR.NAME;
  }
  if (node.t === 'fn' && (node.name === 'INDEX' || node.name === 'XLOOKUP')) { const r = callRef(node, ctx); if (r) return r; }
  if (node.t === 'rng') {
    const a = evRef(node.a, ctx), b = evRef(node.b, ctx);
    if (!isRef(a) || !isRef(b)) return ERR.REF;
    const box = (x) => (x.range ? x : { r0: x.r, c0: x.c, r1: x.r, c1: x.c });
    const A = box(a), B = box(b);
    return { range: true, r0: Math.min(A.r0, B.r0), c0: Math.min(A.c0, B.c0), r1: Math.max(A.r1, B.r1), c1: Math.max(A.c1, B.c1) };
  }
  return ev(node, ctx);
}
const isRef = (x) => x && typeof x === 'object' && 'range' in x;
function deref(x, ctx) {
  if (!isRef(x)) return x;
  if (!x.range) return ctx.sheet.get(addr(x.r, x.c));
  return ctx.sheet.range(x.r0, x.c0, x.r1, x.c1);
}
function ev(node, ctx) {
  switch (node.t) {
    case 'lit': return node.v;
    case 'missing': return null;
    case 'ref': case 'sref': case 'name': case 'rng': {
      const r = evRef(node, ctx);
      if (isErr(r)) return r;
      const v = deref(r, ctx);
      // a range in a scalar position: the same row (or column) as the formula (implicit intersection) is not used;
      // dynamic-array Excel returns the whole array, which spills
      return v;
    }
    case 'neg': return mapArr(ev(node.a, ctx), (v) => { const n = toNum(v); return isErr(n) ? n : -n; });
    case 'pct': return mapArr(ev(node.a, ctx), (v) => { const n = toNum(v); return isErr(n) ? n : n / 100; });
    case 'bin': return binop(node.op, ev(node.a, ctx), ev(node.b, ctx));
    case 'fn': return call(node, ctx);
    default: return ERR.VALUE;
  }
}
function mapArr(v, f) { return isArr(v) ? new Arr(v.rows.map((row) => row.map(f))) : f(v); }
function binop(op, a, b) {
  if (isArr(a) || isArr(b)) {
    const A = isArr(a) ? a : new Arr([[a]]), B = isArr(b) ? b : new Arr([[b]]);
    const h = Math.max(A.h, B.h), w = Math.max(A.w, B.w);
    const get = (M, i, j) => (M.h === 1 && M.w === 1 ? M.at(0, 0) : M.h === 1 ? (j < M.w ? M.at(0, j) : ERR.NA) : M.w === 1 ? (i < M.h ? M.at(i, 0) : ERR.NA) : (i < M.h && j < M.w ? M.at(i, j) : ERR.NA));
    return new Arr(Array.from({ length: h }, (_, i) => Array.from({ length: w }, (__, j) => binop(op, get(A, i, j), get(B, i, j)))));
  }
  if (isErr(a)) return a; if (isErr(b)) return b;
  if (op === '&') return toStr(a) + toStr(b);
  if (['=', '<>', '<', '>', '<=', '>='].includes(op)) {
    const c = compare(a, b);
    return op === '=' ? c === 0 : op === '<>' ? c !== 0 : op === '<' ? c < 0 : op === '>' ? c > 0 : op === '<=' ? c <= 0 : c >= 0;
  }
  const x = toNum(a), y = toNum(b);
  if (isErr(x)) return x; if (isErr(y)) return y;
  switch (op) {
    case '+': return x + y;
    case '-': return x - y;
    case '*': return x * y;
    case '/': return y === 0 ? ERR.DIV0 : x / y;
    case '^': { if (x === 0 && y === 0) return ERR.NUM; const r = x ** y; return Number.isFinite(r) ? r : ERR.NUM; }
    default: return ERR.VALUE;
  }
}

// ---------------------------------------------------------------- argument helpers
/** Numbers for SUM-like functions: from references only numbers count; typed arguments are coerced. */
function numbersOf(args, ctx, { countText = false } = {}) {
  const out = [];
  for (const a of args) {
    if (a.t === 'missing') continue;
    const r = evRef(a, ctx);
    if (isErr(r)) return r;
    if (isRef(r) || isArr(r)) {
      const vals = isRef(r) ? (r.range ? deref(r, ctx).flat() : [deref(r, ctx)]) : r.flat();
      for (const v of vals) { if (isErr(v)) return v; if (typeof v === 'number') out.push(v); else if (countText && v != null) out.push(v === true ? 1 : 0); }
    } else {
      if (isErr(r)) return r;
      if (r == null) continue;
      const n = toNum(r); if (isErr(n)) return n; out.push(n);
    }
  }
  return out;
}
/** Flatten any argument to a list of values (for COUNTA, AND, CONCAT …). */
function valuesOf(a, ctx) {
  const r = evRef(a, ctx);
  if (isErr(r)) return [r];
  if (isRef(r)) return r.range ? deref(r, ctx).flat() : [deref(r, ctx)];
  if (isArr(r)) return r.flat();
  return [r];
}
/** An argument as an Arr (a range, an array, or a single value as 1×1). */
function arrOf(a, ctx) {
  if (!a || a.t === 'missing') return null;
  const r = evRef(a, ctx);
  if (isErr(r)) return r;
  if (isRef(r)) return r.range ? deref(r, ctx) : new Arr([[deref(r, ctx)]]);
  if (isArr(r)) return r;
  return new Arr([[r]]);
}
function scalar(a, ctx) {
  if (!a || a.t === 'missing') return null;
  const v = ev(a, ctx);
  return isArr(v) ? v.at(0, 0) : v;
}
const numArg = (a, ctx, dflt) => { const v = scalar(a, ctx); if (v == null && dflt !== undefined) return dflt; return toNum(v); };
/** Map a function over an array argument (for functions that spill when given a range). */
function lift(a, ctx, f) {
  const v = a && a.t !== 'missing' ? ev(a, ctx) : null;
  return isArr(v) ? mapArr(v, f) : f(v);
}

// ---------------------------------------------------------------- statistics helpers
const sumOf = (xs) => xs.reduce((s, x) => s + x, 0);
const meanOf = (xs) => sumOf(xs) / xs.length;
function varOf(xs, sample) { const m = meanOf(xs); return xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - (sample ? 1 : 0)); }
function percentileInc(xs, k) {
  const s = [...xs].sort((a, b) => a - b);
  const h = (s.length - 1) * k, lo = Math.floor(h);
  return s[lo] + (h - lo) * ((s[lo + 1] ?? s[lo]) - s[lo]);
}
function pairs(a, b, ctx) {
  const A = arrOf(a, ctx), B = arrOf(b, ctx);
  if (isErr(A)) return A; if (isErr(B)) return B;
  const x = A.flat(), y = B.flat();
  if (x.length !== y.length) return ERR.NA;
  const xs = [], ys = [];
  for (let i = 0; i < x.length; i++) if (typeof x[i] === 'number' && typeof y[i] === 'number') { xs.push(x[i]); ys.push(y[i]); }
  return { xs, ys };
}
function linfit(xs, ys) {
  const mx = meanOf(xs), my = meanOf(ys);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < xs.length; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
  return { slope: sxy / sxx, intercept: my - (sxy / sxx) * mx, r: sxy / Math.sqrt(sxx * syy), sxx, syy, sxy, mx, my, n: xs.length };
}

// ---------------------------------------------------------------- lookups
function lookupIndex(value, list, mode = 0, search = 1) {
  // mode: 0 exact, -1 exact or next smaller, 1 exact or next larger, 2 wildcard; search: 1 first→last, -1 last→first
  const idx = list.map((_, i) => i);
  if (search === -1) idx.reverse();
  if (mode === 2 && typeof value === 'string') { const re = wildcardRe(value); return idx.find((i) => typeof list[i] === 'string' && re.test(list[i])) ?? -1; }
  const exact = idx.find((i) => list[i] != null && typeof list[i] === typeof value && compare(list[i], value) === 0);
  if (exact !== undefined) return exact;
  if (mode === 0 || mode === 2) return -1;
  let best = -1;
  for (const i of idx) {
    const v = list[i];
    if (v == null || typeof v !== typeof value) continue;
    const c = compare(v, value);
    if (mode === -1 && c < 0 && (best < 0 || compare(v, list[best]) > 0)) best = i;
    if (mode === 1 && c > 0 && (best < 0 || compare(v, list[best]) < 0)) best = i;
  }
  return best;
}
/** Binary search as Excel does for approximate VLOOKUP/MATCH(…,1): the last position whose value ≤ the lookup
 *  value, assuming the list is sorted ascending (on unsorted data the answer is unreliable, as in Excel). */
function approxAsc(value, list) {
  let lo = 0, hi = list.length - 1, ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const v = list[mid];
    if (v == null || typeof v !== typeof value) { hi = mid - 1; continue; }
    if (compare(v, value) <= 0) { ans = mid; lo = mid + 1; } else hi = mid - 1;
  }
  return ans;
}

// ---------------------------------------------------------------- TEXT() formats
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export function textFormat(v, fmt) {
  const n = typeof v === 'number' ? v : toNum(v);
  if (isErr(n)) return typeof v === 'string' ? v : n;
  const f = String(fmt);
  if (/[yd]|m{3,}/i.test(f) && !/0/.test(f)) {                      // a date format
    const [y, m, d] = serialToYMD(n);
    const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    return f.replace(/yyyy|yy|mmmm|mmm|mm|m|dddd|ddd|dd|d/gi, (t) => {
      const T = t.toLowerCase();
      return T === 'yyyy' ? String(y) : T === 'yy' ? String(y).slice(-2) : T === 'mmmm' ? MON[m - 1] : T === 'mmm' ? MON[m - 1].slice(0, 3)
        : T === 'mm' ? String(m).padStart(2, '0') : T === 'm' ? String(m) : T === 'dddd' ? DOW[wd] : T === 'ddd' ? DOW[wd].slice(0, 3)
          : T === 'dd' ? String(d).padStart(2, '0') : String(d);
    });
  }
  const pct = f.includes('%');
  const x = pct ? n * 100 : n;
  const dec = (f.split('.')[1] || '').replace(/[^0#]/g, '').length;
  const grouped = f.includes(',');
  const r = round(Math.abs(x), dec);
  let body = r.toFixed(dec);
  const minInt = ((f.split('.')[0] || '').match(/0/g) || []).length;
  { const [i, frac] = body.split('.'); body = (minInt === 0 && i === '0' && dec > 0 ? '' : i.padStart(minInt, '0')) + (frac ? `.${frac}` : ''); }
  if (grouped) { const [i, frac] = body.split('.'); body = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (frac ? `.${frac}` : ''); }
  const prefix = (/^[^0#]*/.exec(f.replace(/"/g, ''))[0] || '').replace(/[,%]/g, '');
  return `${x < 0 && r !== 0 ? '-' : ''}${prefix}${body}${pct ? '%' : ''}`;
}

// ---------------------------------------------------------------- the functions
const FN = {};
const need = (args, lo, hi = lo) => args.length >= lo && args.length <= hi;
function agg(name, f, opts) {
  FN[name] = (args, ctx) => { const xs = numbersOf(args, ctx, opts); if (isErr(xs)) return xs; return f(xs); };
}
agg('SUM', sumOf);
agg('AVERAGE', (xs) => (xs.length ? meanOf(xs) : ERR.DIV0));
agg('AVERAGEA', (xs) => (xs.length ? meanOf(xs) : ERR.DIV0), { countText: true });
agg('MIN', (xs) => (xs.length ? Math.min(...xs) : 0));
agg('MAX', (xs) => (xs.length ? Math.max(...xs) : 0));
FN.COUNT = (args, ctx) => {
  let n = 0;
  for (const a of args) {
    if (a.t === 'missing') continue;
    const r = evRef(a, ctx);
    if (isRef(r) || isArr(r)) { const vals = isRef(r) ? (r.range ? deref(r, ctx).flat() : [deref(r, ctx)]) : r.flat(); n += vals.filter((v) => typeof v === 'number').length; }
    else if (r != null && !isErr(r) && !isErr(toNum(r))) n++;
  }
  return n;
};
agg('MEDIAN', (xs) => (xs.length ? percentileInc(xs, 0.5) : ERR.NUM));
agg('STDEV.S', (xs) => (xs.length > 1 ? Math.sqrt(varOf(xs, true)) : ERR.DIV0));
agg('STDEV.P', (xs) => (xs.length ? Math.sqrt(varOf(xs, false)) : ERR.DIV0));
agg('VAR.S', (xs) => (xs.length > 1 ? varOf(xs, true) : ERR.DIV0));
agg('VAR.P', (xs) => (xs.length ? varOf(xs, false) : ERR.DIV0));
FN.STDEV = FN['STDEV.S']; FN.STDEVP = FN['STDEV.P']; FN.VAR = FN['VAR.S']; FN.VARP = FN['VAR.P'];
agg('PRODUCT', (xs) => xs.reduce((p, x) => p * x, 1));
FN['MODE.SNGL'] = (args, ctx) => {
  const xs = numbersOf(args, ctx); if (isErr(xs)) return xs;
  const seen = new Map(); let best = null, bestN = 1;
  for (const x of xs) { const k = p15(x); const c = (seen.get(k) || 0) + 1; seen.set(k, c); if (c > bestN) { bestN = c; best = k; } }
  // ties go to the value that first reaches the top count in the order given
  if (best == null) return ERR.NA;
  let first = null; const cnt = new Map();
  for (const x of xs) { const k = p15(x); cnt.set(k, (cnt.get(k) || 0) + 1); }
  for (const x of xs) { if (cnt.get(p15(x)) === bestN) { first = p15(x); break; } }
  return first;
};
FN.MODE = FN['MODE.SNGL'];
FN.COUNTA = (args, ctx) => args.reduce((n, a) => n + valuesOf(a, ctx).filter((v) => v != null && v !== undefined).length, 0);
FN.COUNTBLANK = (args, ctx) => valuesOf(args[0], ctx).filter((v) => v == null || v === '').length;
FN['PERCENTILE.INC'] = (args, ctx) => { const xs = numbersOf([args[0]], ctx); if (isErr(xs)) return xs; const k = numArg(args[1], ctx); if (isErr(k)) return k; if (!xs.length || k < 0 || k > 1) return ERR.NUM; return percentileInc(xs, k); };
FN.PERCENTILE = FN['PERCENTILE.INC'];
FN['QUARTILE.INC'] = (args, ctx) => { const xs = numbersOf([args[0]], ctx); if (isErr(xs)) return xs; const q = Math.trunc(numArg(args[1], ctx)); if (!xs.length || q < 0 || q > 4) return ERR.NUM; return percentileInc(xs, q / 4); };
FN.QUARTILE = FN['QUARTILE.INC'];
FN.LARGE = (args, ctx) => { const xs = numbersOf([args[0]], ctx); if (isErr(xs)) return xs; const k = Math.ceil(numArg(args[1], ctx)); const s = [...xs].sort((a, b) => b - a); return k >= 1 && k <= s.length ? s[k - 1] : ERR.NUM; };
FN.SMALL = (args, ctx) => { const xs = numbersOf([args[0]], ctx); if (isErr(xs)) return xs; const k = Math.ceil(numArg(args[1], ctx)); const s = [...xs].sort((a, b) => a - b); return k >= 1 && k <= s.length ? s[k - 1] : ERR.NUM; };
FN['RANK.EQ'] = (args, ctx) => {
  const x = numArg(args[0], ctx); if (isErr(x)) return x;
  const xs = numbersOf([args[1]], ctx); if (isErr(xs)) return xs;
  const asc = args[2] && numArg(args[2], ctx, 0) !== 0;
  if (!xs.some((v) => p15(v) === p15(x))) return ERR.NA;
  return 1 + xs.filter((v) => (asc ? v < x : v > x)).length;
};
FN.RANK = FN['RANK.EQ'];
FN.CORREL = (args, ctx) => { const p = pairs(args[0], args[1], ctx); if (isErr(p)) return p; if (p.xs.length < 2) return ERR.DIV0; const f = linfit(p.xs, p.ys); return Number.isFinite(f.r) ? f.r : ERR.DIV0; };
FN.PEARSON = FN.CORREL;
FN.RSQ = (args, ctx) => { const r = FN.CORREL(args, ctx); return isErr(r) ? r : r * r; };
// SLOPE(known_y's, known_x's), INTERCEPT(known_y's, known_x's)
FN.SLOPE = (args, ctx) => { const p = pairs(args[1], args[0], ctx); if (isErr(p)) return p; if (p.xs.length < 2) return ERR.DIV0; const f = linfit(p.xs, p.ys); return Number.isFinite(f.slope) ? f.slope : ERR.DIV0; };
FN.INTERCEPT = (args, ctx) => { const p = pairs(args[1], args[0], ctx); if (isErr(p)) return p; if (p.xs.length < 2) return ERR.DIV0; const f = linfit(p.xs, p.ys); return Number.isFinite(f.intercept) ? f.intercept : ERR.DIV0; };
FN['FORECAST.LINEAR'] = (args, ctx) => { const x = numArg(args[0], ctx); if (isErr(x)) return x; const p = pairs(args[2], args[1], ctx); if (isErr(p)) return p; const f = linfit(p.xs, p.ys); return f.intercept + f.slope * x; };
FN.FORECAST = FN['FORECAST.LINEAR'];
FN.STEYX = (args, ctx) => { const p = pairs(args[1], args[0], ctx); if (isErr(p)) return p; if (p.xs.length < 3) return ERR.DIV0; const f = linfit(p.xs, p.ys); return Math.sqrt((f.syy - f.sxy ** 2 / f.sxx) / (f.n - 2)); };
FN.COVARIANCE_S = null;
FN['COVARIANCE.S'] = (args, ctx) => { const p = pairs(args[0], args[1], ctx); if (isErr(p)) return p; if (p.xs.length < 2) return ERR.DIV0; const f = linfit(p.xs, p.ys); return f.sxy / (f.n - 1); };
FN['COVARIANCE.P'] = (args, ctx) => { const p = pairs(args[0], args[1], ctx); if (isErr(p)) return p; if (!p.xs.length) return ERR.DIV0; const f = linfit(p.xs, p.ys); return f.sxy / f.n; };
// LINEST(known_y's, known_x's, [const], [stats]) for one x: [slope, intercept]; with stats a 5 × 2 array
FN.LINEST = (args, ctx) => {
  const p = pairs(args[1] || args[0], args[0], ctx); if (isErr(p)) return p;
  const f = linfit(p.xs, p.ys);
  if (!args[3] || !toBool(scalar(args[3], ctx))) return new Arr([[f.slope, f.intercept]]);
  const sse = f.syy - f.sxy ** 2 / f.sxx, df = f.n - 2, ssr = f.syy - sse;
  const se = Math.sqrt(sse / df), seSlope = se / Math.sqrt(f.sxx), seInt = se * Math.sqrt(1 / f.n + f.mx ** 2 / f.sxx);
  return new Arr([[f.slope, f.intercept], [seSlope, seInt], [ssr / f.syy, se], [(ssr / 1) / (sse / df), df], [ssr, sse]]);
};

// FREQUENCY(data, bins): how many values fall in each bin (≤ the bin's upper edge and > the one before), plus one
// more count for values above the last edge; returned as a column that spills.
FN.FREQUENCY = (args, ctx) => {
  const xs = numbersOf([args[0]], ctx); if (isErr(xs)) return xs;
  const edges = numbersOf([args[1]], ctx); if (isErr(edges)) return edges;
  const sorted = edges.map((e, i) => [e, i]).sort((a, b) => a[0] - b[0]);
  const counts = new Array(edges.length + 1).fill(0);
  for (const x of xs) { const k = sorted.find(([e]) => x <= e); counts[k ? k[1] : edges.length] += 1; }
  return arr1(counts);
};
// SUBTOTAL(function_num, ref…): 1 AVERAGE, 2 COUNT, 3 COUNTA, 4 MAX, 5 MIN, 6 PRODUCT, 7 STDEV.S, 8 STDEV.P, 9 SUM,
// 10 VAR.S, 11 VAR.P (101–111 the same; this sheet has no hidden rows). Cells that are themselves SUBTOTALs are left
// out, so subtotals don't count twice.
FN.SUBTOTAL = (args, ctx) => {
  const k = numArg(args[0], ctx); if (isErr(k)) return k;
  const names = { 1: 'AVERAGE', 2: 'COUNT', 3: 'COUNTA', 4: 'MAX', 5: 'MIN', 6: 'PRODUCT', 7: 'STDEV.S', 8: 'STDEV.P', 9: 'SUM', 10: 'VAR.S', 11: 'VAR.P' };
  const name = names[k > 100 ? k - 100 : k]; if (!name) return ERR.VALUE;
  const vals = [];
  for (const a of args.slice(1)) {
    const r = evRef(a, ctx); if (!isRef(r)) return ERR.VALUE;
    const box = r.range ? r : { r0: r.r, c0: r.c, r1: r.r, c1: r.c };
    for (let i = box.r0; i <= box.r1; i++) for (let j = box.c0; j <= box.c1; j++) {
      const raw = ctx.sheet.raw(addr(i, j));
      if (typeof raw === 'string' && /^=\s*SUBTOTAL\(/i.test(raw)) continue;
      vals.push(ctx.sheet.get(addr(i, j)));
    }
  }
  return FN[name]([{ t: 'lit', v: new Arr([vals.length ? vals : [null]]) }], ctx);
};

// conditional aggregates
function condPairs(args, ctx, start) {
  // args from `start`: range1, crit1, range2, crit2, …; returns a mask over positions or an error
  let mask = null, size = null;
  for (let i = start; i < args.length; i += 2) {
    const R = arrOf(args[i], ctx); if (isErr(R)) return R;
    const crit = scalar(args[i + 1], ctx);
    const test = criterion(crit);
    const vals = R.flat();
    if (size == null) size = [R.h, R.w]; else if (R.h !== size[0] || R.w !== size[1]) return ERR.VALUE;
    const m = vals.map(test);
    mask = mask ? mask.map((x, j) => x && m[j]) : m;
  }
  return { mask, size };
}
FN.SUMIFS = (args, ctx) => { const S = arrOf(args[0], ctx); if (isErr(S)) return S; const c = condPairs(args, ctx, 1); if (isErr(c)) return c; if (S.h !== c.size[0] || S.w !== c.size[1]) return ERR.VALUE; const v = S.flat(); return v.reduce((s, x, i) => s + (c.mask[i] && typeof x === 'number' ? x : 0), 0); };
FN.COUNTIFS = (args, ctx) => { const c = condPairs(args, ctx, 0); if (isErr(c)) return c; return c.mask.filter(Boolean).length; };
FN.AVERAGEIFS = (args, ctx) => { const S = arrOf(args[0], ctx); if (isErr(S)) return S; const c = condPairs(args, ctx, 1); if (isErr(c)) return c; const xs = S.flat().filter((x, i) => c.mask[i] && typeof x === 'number'); return xs.length ? meanOf(xs) : ERR.DIV0; };
FN.MAXIFS = (args, ctx) => { const S = arrOf(args[0], ctx); if (isErr(S)) return S; const c = condPairs(args, ctx, 1); if (isErr(c)) return c; const xs = S.flat().filter((x, i) => c.mask[i] && typeof x === 'number'); return xs.length ? Math.max(...xs) : 0; };
FN.MINIFS = (args, ctx) => { const S = arrOf(args[0], ctx); if (isErr(S)) return S; const c = condPairs(args, ctx, 1); if (isErr(c)) return c; const xs = S.flat().filter((x, i) => c.mask[i] && typeof x === 'number'); return xs.length ? Math.min(...xs) : 0; };
// SUMIF(range, criteria, [sum_range]); AVERAGEIF likewise; COUNTIF(range, criteria)
FN.SUMIF = (args, ctx) => { if (!need(args, 2, 3)) return ERR.VALUE; const R = arrOf(args[0], ctx); if (isErr(R)) return R; const S = args[2] && args[2].t !== 'missing' ? arrOf(args[2], ctx) : R; if (isErr(S)) return S; const t = criterion(scalar(args[1], ctx)); const r = R.flat(); let s = 0; for (let i = 0; i < r.length; i++) { const v = S.flat()[i]; if (t(r[i]) && typeof v === 'number') s += v; } return s; };
FN.COUNTIF = (args, ctx) => { if (!need(args, 2)) return ERR.VALUE; const R = arrOf(args[0], ctx); if (isErr(R)) return R; const t = criterion(scalar(args[1], ctx)); return R.flat().filter(t).length; };
FN.AVERAGEIF = (args, ctx) => { const R = arrOf(args[0], ctx); if (isErr(R)) return R; const S = args[2] && args[2].t !== 'missing' ? arrOf(args[2], ctx) : R; const t = criterion(scalar(args[1], ctx)); const xs = R.flat().map((v, i) => (t(v) ? S.flat()[i] : null)).filter((v) => typeof v === 'number'); return xs.length ? meanOf(xs) : ERR.DIV0; };
FN.SUMPRODUCT = (args, ctx) => {
  const As = args.map((a) => arrOf(a, ctx));
  const e = As.find(isErr); if (e) return e;
  const h = As[0].h, w = As[0].w;
  if (As.some((A) => A.h !== h || A.w !== w)) return ERR.VALUE;
  let s = 0;
  for (let i = 0; i < h; i++) for (let j = 0; j < w; j++) {
    let p = 1;
    for (const A of As) { const v = A.at(i, j); if (isErr(v)) return v; p *= typeof v === 'number' ? v : typeof v === 'boolean' && As.length === 1 ? 0 : (typeof v === 'boolean' ? 0 : 0); }
    s += p;
  }
  return s;
};

// logic
FN.IF = (args, ctx) => { if (!need(args, 1, 3)) return ERR.VALUE; const c = ev(args[0], ctx); if (isArr(c)) return mapArr(c, (x) => { const b = toBool(x); return isErr(b) ? b : b ? (args[1] ? scalar(args[1], ctx) : true) : (args[2] ? scalar(args[2], ctx) : false); }); const b = toBool(c); if (isErr(b)) return b; if (b) return args[1] && args[1].t !== 'missing' ? ev(args[1], ctx) : (args[1] ? 0 : true); return args[2] ? (args[2].t === 'missing' ? 0 : ev(args[2], ctx)) : false; };
FN.IFS = (args, ctx) => { for (let i = 0; i + 1 < args.length; i += 2) { const b = toBool(scalar(args[i], ctx)); if (isErr(b)) return b; if (b) return ev(args[i + 1], ctx); } return ERR.NA; };
FN.SWITCH = (args, ctx) => { const v = scalar(args[0], ctx); if (isErr(v)) return v; let i = 1; for (; i + 1 < args.length; i += 2) { const m = scalar(args[i], ctx); if (compare(v, m) === 0 && typeof v === typeof m) return ev(args[i + 1], ctx); } return i < args.length ? ev(args[i], ctx) : ERR.NA; };
FN.AND = (args, ctx) => { let seen = false; for (const a of args) for (const v of valuesOf(a, ctx)) { if (isErr(v)) return v; if (v == null || (typeof v === 'string' && a.t !== 'lit')) continue; const b = toBool(v); if (isErr(b)) return b; seen = true; if (!b) return false; } return seen ? true : ERR.VALUE; };
FN.OR = (args, ctx) => { let seen = false; for (const a of args) for (const v of valuesOf(a, ctx)) { if (isErr(v)) return v; if (v == null || (typeof v === 'string' && a.t !== 'lit')) continue; const b = toBool(v); if (isErr(b)) return b; seen = true; if (b) return true; } return seen ? false : ERR.VALUE; };
FN.NOT = (args, ctx) => lift(args[0], ctx, (v) => { const b = toBool(v); return isErr(b) ? b : !b; });
FN.IFERROR = (args, ctx) => { const v = ev(args[0], ctx); if (isArr(v)) return mapArr(v, (x) => (isErr(x) ? scalar(args[1], ctx) : x)); return isErr(v) ? ev(args[1], ctx) : v; };
FN.IFNA = (args, ctx) => { const v = ev(args[0], ctx); return v === ERR.NA || (isErr(v) && v.code === '#N/A') ? ev(args[1], ctx) : v; };
FN.TRUE = () => true; FN.FALSE = () => false;
FN.ISBLANK = (args, ctx) => lift(args[0], ctx, (v) => v == null);
FN.ISNUMBER = (args, ctx) => lift(args[0], ctx, (v) => typeof v === 'number');
FN.ISTEXT = (args, ctx) => lift(args[0], ctx, (v) => typeof v === 'string');
FN.ISERROR = (args, ctx) => lift(args[0], ctx, (v) => isErr(v));
FN.ISNA = (args, ctx) => lift(args[0], ctx, (v) => isErr(v) && v.code === '#N/A');
FN.ISERR = (args, ctx) => lift(args[0], ctx, (v) => isErr(v) && v.code !== '#N/A');
FN.ISLOGICAL = (args, ctx) => lift(args[0], ctx, (v) => typeof v === 'boolean');
FN.NA = () => ERR.NA;

// maths
const num1 = (f) => (args, ctx) => lift(args[0], ctx, (v) => { const n = toNum(v); return isErr(n) ? n : f(n); });
FN.ABS = num1(Math.abs);
FN.INT = num1(Math.floor);
FN.SQRT = num1((n) => (n < 0 ? ERR.NUM : Math.sqrt(n)));
FN.EXP = num1(Math.exp);
FN.LN = num1((n) => (n <= 0 ? ERR.NUM : Math.log(n)));
FN.LOG10 = num1((n) => (n <= 0 ? ERR.NUM : Math.log10(n)));
FN.SIGN = num1(Math.sign);
FN.POWER = (args, ctx) => binop('^', scalar(args[0], ctx), scalar(args[1], ctx));
FN.MOD = (args, ctx) => { const n = numArg(args[0], ctx), d = numArg(args[1], ctx); if (isErr(n)) return n; if (isErr(d)) return d; if (d === 0) return ERR.DIV0; return n - d * Math.floor(n / d); };
const roundFn = (mode) => (args, ctx) => { const d = numArg(args[1], ctx, 0); if (isErr(d)) return d; return lift(args[0], ctx, (v) => { const n = toNum(v); return isErr(n) ? n : round(n, Math.trunc(d), mode); }); };
FN.ROUND = roundFn('half'); FN.ROUNDUP = roundFn('up'); FN.ROUNDDOWN = roundFn('down');
FN.TRUNC = (args, ctx) => FN.ROUNDDOWN([args[0], args[1] || { t: 'lit', v: 0 }], ctx);
FN.CEILING = (args, ctx) => { const n = numArg(args[0], ctx), s = numArg(args[1], ctx, 1); if (isErr(n)) return n; if (isErr(s)) return s; if (s === 0) return 0; return Math.ceil(p15(n / s)) * s; };
FN.FLOOR = (args, ctx) => { const n = numArg(args[0], ctx), s = numArg(args[1], ctx, 1); if (isErr(n)) return n; if (isErr(s)) return s; if (s === 0) return ERR.DIV0; return Math.floor(p15(n / s)) * s; };
FN.PI = () => Math.PI;
FN.MROUND = (args, ctx) => { const n = numArg(args[0], ctx), m = numArg(args[1], ctx); if (isErr(n)) return n; if (isErr(m)) return m; if (m === 0) return 0; if (Math.sign(n) * Math.sign(m) < 0) return ERR.NUM; return round(n / m, 0) * m; };
FN.LOG = (args, ctx) => { const n = numArg(args[0], ctx), b = numArg(args[1], ctx, 10); if (isErr(n)) return n; if (isErr(b)) return b; return n <= 0 || b <= 0 || b === 1 ? ERR.NUM : Math.log(n) / Math.log(b); };

// finance (the F04 formulas, Excel's sign convention: money paid out is negative)
FN.PMT = (args, ctx) => { const r = numArg(args[0], ctx), n = numArg(args[1], ctx), pv = numArg(args[2], ctx), fv = numArg(args[3], ctx, 0), t = numArg(args[4], ctx, 0); for (const x of [r, n, pv, fv, t]) if (isErr(x)) return x; if (r === 0) return -(pv + fv) / n; const f = (1 + r) ** n; return -(r * (pv * f + fv)) / ((1 + r * (t ? 1 : 0)) * (f - 1)); };
FN.FV = (args, ctx) => { const r = numArg(args[0], ctx), n = numArg(args[1], ctx), pmt = numArg(args[2], ctx, 0), pv = numArg(args[3], ctx, 0), t = numArg(args[4], ctx, 0); for (const x of [r, n, pmt, pv, t]) if (isErr(x)) return x; if (r === 0) return -(pv + pmt * n); const f = (1 + r) ** n; return -(pv * f + pmt * (1 + r * (t ? 1 : 0)) * (f - 1) / r); };
FN.PV = (args, ctx) => { const r = numArg(args[0], ctx), n = numArg(args[1], ctx), pmt = numArg(args[2], ctx, 0), fv = numArg(args[3], ctx, 0), t = numArg(args[4], ctx, 0); for (const x of [r, n, pmt, fv, t]) if (isErr(x)) return x; if (r === 0) return -(fv + pmt * n); const f = (1 + r) ** n; return -(fv + pmt * (1 + r * (t ? 1 : 0)) * (f - 1) / r) / f; };
FN.NPV = (args, ctx) => { const r = numArg(args[0], ctx); if (isErr(r)) return r; const xs = numbersOf(args.slice(1), ctx); if (isErr(xs)) return xs; return xs.reduce((s, x, i) => s + x / (1 + r) ** (i + 1), 0); };

// text
const str1 = (f) => (args, ctx) => lift(args[0], ctx, (v) => (isErr(v) ? v : f(toStr(v))));
FN.LEN = str1((s) => s.length);
FN.UPPER = str1((s) => s.toUpperCase());
FN.LOWER = str1((s) => s.toLowerCase());
FN.PROPER = str1((s) => s.toLowerCase().replace(/(^|[^a-z’'])([a-z])/g, (m, a, b) => a + b.toUpperCase()).replace(/(['’])([A-Z])/g, (m, a, b) => a + b.toLowerCase()));
FN.TRIM = str1((s) => s.replace(/ +/g, ' ').trim());
FN.CLEAN = str1((s) => s.replace(/[\x00-\x1f]/g, ''));
FN.LEFT = (args, ctx) => { const n = numArg(args[1], ctx, 1); if (isErr(n)) return n; if (n < 0) return ERR.VALUE; return lift(args[0], ctx, (v) => (isErr(v) ? v : toStr(v).slice(0, n))); };
FN.RIGHT = (args, ctx) => { const n = numArg(args[1], ctx, 1); if (isErr(n)) return n; if (n < 0) return ERR.VALUE; return lift(args[0], ctx, (v) => (isErr(v) ? v : (n === 0 ? '' : toStr(v).slice(-n)))); };
FN.MID = (args, ctx) => { const st = numArg(args[1], ctx), n = numArg(args[2], ctx); if (isErr(st)) return st; if (isErr(n)) return n; if (st < 1 || n < 0) return ERR.VALUE; return lift(args[0], ctx, (v) => (isErr(v) ? v : toStr(v).substr(st - 1, n))); };
FN.CONCAT = (args, ctx) => { let s = ''; for (const a of args) for (const v of valuesOf(a, ctx)) { if (isErr(v)) return v; s += toStr(v); } return s; };
FN.CONCATENATE = (args, ctx) => { let s = ''; for (const a of args) { const v = scalar(a, ctx); if (isErr(v)) return v; s += toStr(v); } return s; };
FN.TEXTJOIN = (args, ctx) => { const d = toStr(scalar(args[0], ctx)); const ign = toBool(scalar(args[1], ctx)); const parts = []; for (const a of args.slice(2)) for (const v of valuesOf(a, ctx)) { if (isErr(v)) return v; if (ign && (v == null || v === '')) continue; parts.push(toStr(v)); } return parts.join(d); };
FN.SUBSTITUTE = (args, ctx) => { const s = toStr(scalar(args[0], ctx)), o = toStr(scalar(args[1], ctx)), n = toStr(scalar(args[2], ctx)); if (!o) return s; if (args[3]) { const k = numArg(args[3], ctx); let i = -1; for (let j = 0; j < k; j++) { i = s.indexOf(o, i + 1); if (i < 0) return s; } return s.slice(0, i) + n + s.slice(i + o.length); } return s.split(o).join(n); };
FN.FIND = (args, ctx) => { const f = toStr(scalar(args[0], ctx)), s = toStr(scalar(args[1], ctx)); const st = numArg(args[2], ctx, 1); const i = s.indexOf(f, st - 1); return i < 0 ? ERR.VALUE : i + 1; };
FN.SEARCH = (args, ctx) => { const f = toStr(scalar(args[0], ctx)), s = toStr(scalar(args[1], ctx)); const st = numArg(args[2], ctx, 1); const re = wildcardRe(f).source.slice(1, -1); const m = new RegExp(re, 'i').exec(s.slice(st - 1)); return m ? m.index + st : ERR.VALUE; };
FN.EXACT = (args, ctx) => toStr(scalar(args[0], ctx)) === toStr(scalar(args[1], ctx));
FN.VALUE = (args, ctx) => lift(args[0], ctx, (v) => (typeof v === 'number' ? v : toNum(v)));
FN.TEXT = (args, ctx) => { const f = toStr(scalar(args[1], ctx)); return lift(args[0], ctx, (v) => (isErr(v) ? v : textFormat(v, f))); };
FN.REPT = (args, ctx) => { const n = numArg(args[1], ctx); if (isErr(n) || n < 0) return ERR.VALUE; return toStr(scalar(args[0], ctx)).repeat(Math.floor(n)); };
FN.TEXTBEFORE = (args, ctx) => { const s = toStr(scalar(args[0], ctx)), d = toStr(scalar(args[1], ctx)); const i = s.toLowerCase().indexOf(d.toLowerCase()); return i < 0 ? ERR.NA : s.slice(0, i); };
FN.TEXTAFTER = (args, ctx) => { const s = toStr(scalar(args[0], ctx)), d = toStr(scalar(args[1], ctx)); const i = s.toLowerCase().indexOf(d.toLowerCase()); return i < 0 ? ERR.NA : s.slice(i + d.length); };

// dates
FN.DATE = (args, ctx) => { const y = numArg(args[0], ctx), m = numArg(args[1], ctx), d = numArg(args[2], ctx); for (const x of [y, m, d]) if (isErr(x)) return x; const Y = y < 1900 ? y + 1900 : y; return dateSerial(Math.trunc(Y), Math.trunc(m), Math.trunc(d)); };
FN.YEAR = (args, ctx) => lift(args[0], ctx, (v) => { const n = toNum(v); return isErr(n) ? n : serialToYMD(n)[0]; });
FN.MONTH = (args, ctx) => lift(args[0], ctx, (v) => { const n = toNum(v); return isErr(n) ? n : serialToYMD(n)[1]; });
FN.DAY = (args, ctx) => lift(args[0], ctx, (v) => { const n = toNum(v); return isErr(n) ? n : serialToYMD(n)[2]; });
FN.EOMONTH = (args, ctx) => { const s = numArg(args[0], ctx), k = numArg(args[1], ctx); if (isErr(s)) return s; if (isErr(k)) return k; const [y, m] = serialToYMD(s); return dateSerial(y, m + Math.trunc(k) + 1, 0); };
FN.EDATE = (args, ctx) => { const s = numArg(args[0], ctx), k = numArg(args[1], ctx); if (isErr(s)) return s; if (isErr(k)) return k; const [y, m, d] = serialToYMD(s); const last = serialToYMD(dateSerial(y, m + Math.trunc(k) + 1, 0))[2]; return dateSerial(y, m + Math.trunc(k), Math.min(d, last)); };
// WEEKDAY(serial, [type]): type 1 (default) Sunday = 1 … Saturday = 7; type 2 Monday = 1 … Sunday = 7
FN.WEEKDAY = (args, ctx) => { const s = numArg(args[0], ctx), t = numArg(args[1], ctx, 1); if (isErr(s)) return s; const [y, m, d] = serialToYMD(s); const w = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); return t === 2 ? (w === 0 ? 7 : w) : t === 3 ? (w + 6) % 7 : w + 1; };
FN.DAYS = (args, ctx) => { const e = numArg(args[0], ctx), s = numArg(args[1], ctx); if (isErr(e)) return e; if (isErr(s)) return s; return Math.floor(e) - Math.floor(s); };
FN.DATEVALUE = (args, ctx) => lift(args[0], ctx, (v) => { if (isErr(v)) return v; if (typeof v !== 'string') return ERR.VALUE; const d = dateText(v); return d == null ? ERR.VALUE : d; });
FN.TODAY = () => { const n = new Date(); return dateSerial(n.getFullYear(), n.getMonth() + 1, n.getDate()); };
FN.NOW = () => { const n = new Date(); return dateSerial(n.getFullYear(), n.getMonth() + 1, n.getDate()) + (n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds()) / 86400; };
const isWorkday = (s, hol) => { const [y, m, d] = serialToYMD(s); const w = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); return w !== 0 && w !== 6 && !hol.has(Math.floor(s)); };
// NETWORKDAYS(start, end, [holidays]): working days (Monday–Friday) from start to end, both counted
FN.NETWORKDAYS = (args, ctx) => { const a = numArg(args[0], ctx), b = numArg(args[1], ctx); if (isErr(a)) return a; if (isErr(b)) return b; const hol = new Set(args[2] ? numbersOf([args[2]], ctx) : []); const lo = Math.floor(Math.min(a, b)), hi = Math.floor(Math.max(a, b)); let n = 0; for (let x = lo; x <= hi; x++) if (isWorkday(x, hol)) n++; return a <= b ? n : -n; };
// WORKDAY(start, days, [holidays]): the date `days` working days after (or before) start
FN.WORKDAY = (args, ctx) => { let x = Math.floor(numArg(args[0], ctx)); const k = numArg(args[1], ctx); if (isErr(x) || isErr(k)) return ERR.VALUE; const hol = new Set(args[2] ? numbersOf([args[2]], ctx) : []); let left = Math.abs(Math.trunc(k)); const step = k < 0 ? -1 : 1; while (left > 0) { x += step; if (isWorkday(x, hol)) left--; } return x; };
// DATEDIF(start, end, unit): whole years "Y", months "M" or days "D" between two dates (#NUM! if start > end)
FN.DATEDIF = (args, ctx) => { const a = numArg(args[0], ctx), b = numArg(args[1], ctx); const u = String(scalar(args[2], ctx)).toUpperCase(); if (isErr(a)) return a; if (isErr(b)) return b; if (a > b) return ERR.NUM; const [y1, m1, d1] = serialToYMD(a), [y2, m2, d2] = serialToYMD(b); const months = (y2 - y1) * 12 + (m2 - m1) - (d2 < d1 ? 1 : 0); if (u === 'D') return Math.floor(b) - Math.floor(a); if (u === 'M') return months; if (u === 'Y') return Math.floor(months / 12); return ERR.NUM; };
// WEEKNUM(serial, [type]): week of the year; type 1 (default) weeks start on Sunday, type 2 on Monday
FN.WEEKNUM = (args, ctx) => { const s = numArg(args[0], ctx), t = numArg(args[1], ctx, 1); if (isErr(s)) return s; const [y] = serialToYMD(s); const jan1 = dateSerial(y, 1, 1); const [yy, mm, dd] = serialToYMD(jan1); const w = new Date(Date.UTC(yy, mm - 1, dd)).getUTCDay(); const off = t === 2 ? (w + 6) % 7 : w; return Math.floor((Math.floor(s) - jan1 + off) / 7) + 1; };

// lookup and reference
FN.VLOOKUP = (args, ctx) => {
  if (!need(args, 3, 4)) return ERR.VALUE;
  const v = scalar(args[0], ctx); if (isErr(v)) return v;
  const T = arrOf(args[1], ctx); if (isErr(T)) return T;
  const col = numArg(args[2], ctx); if (isErr(col)) return col;
  if (col < 1) return ERR.VALUE; if (col > T.w) return ERR.REF;
  const approx = args[3] && args[3].t !== 'missing' ? toBool(scalar(args[3], ctx)) : true;   // the default is approximate
  const first = T.rows.map((r) => r[0]);
  const i = approx ? approxAsc(v, first) : (typeof v === 'string' ? lookupIndex(v, first, 2) : lookupIndex(v, first, 0));
  return i < 0 ? ERR.NA : T.at(i, col - 1) ?? 0;
};
FN.HLOOKUP = (args, ctx) => {
  const v = scalar(args[0], ctx); const T = arrOf(args[1], ctx); if (isErr(T)) return T; const row = numArg(args[2], ctx);
  if (row < 1) return ERR.VALUE; if (row > T.h) return ERR.REF;
  const approx = args[3] && args[3].t !== 'missing' ? toBool(scalar(args[3], ctx)) : true;
  const first = T.rows[0];
  const i = approx ? approxAsc(v, first) : lookupIndex(v, first, typeof v === 'string' ? 2 : 0);
  return i < 0 ? ERR.NA : T.at(row - 1, i) ?? 0;
};
FN.MATCH = (args, ctx) => {
  const v = scalar(args[0], ctx); if (isErr(v)) return v;
  const A = arrOf(args[1], ctx); if (isErr(A)) return A;
  if (A.h > 1 && A.w > 1) return ERR.NA;
  const list = A.flat();
  const type = args[2] && args[2].t !== 'missing' ? numArg(args[2], ctx) : 1;
  let i;
  if (type === 0) i = lookupIndex(v, list, typeof v === 'string' ? 2 : 0);
  else if (type > 0) i = approxAsc(v, list);
  else { i = -1; for (let j = 0; j < list.length; j++) { if (list[j] == null || typeof list[j] !== typeof v) continue; if (compare(list[j], v) >= 0) i = j; else break; } }
  return i < 0 ? ERR.NA : i + 1;
};
FN.XMATCH = (args, ctx) => {
  const v = scalar(args[0], ctx); const A = arrOf(args[1], ctx); if (isErr(A)) return A;
  const mode = numArg(args[2], ctx, 0), search = numArg(args[3], ctx, 1);
  const i = lookupIndex(v, A.flat(), mode, search < 0 ? -1 : 1);
  return i < 0 ? ERR.NA : i + 1;
};
FN.XLOOKUP = (args, ctx) => {
  if (!need(args, 3, 6)) return ERR.VALUE;
  const v = scalar(args[0], ctx); if (isErr(v)) return v;
  const L = arrOf(args[1], ctx); if (isErr(L)) return L;
  const R = arrOf(args[2], ctx); if (isErr(R)) return R;
  const vertical = L.w === 1;
  if (vertical ? R.h !== L.h : R.w !== L.w) return ERR.VALUE;
  const mode = numArg(args[4], ctx, 0), search = numArg(args[5], ctx, 1);
  const i = lookupIndex(v, L.flat(), mode, search < 0 ? -1 : 1);
  if (i < 0) return args[3] && args[3].t !== 'missing' ? ev(args[3], ctx) : ERR.NA;
  if (vertical) return R.w === 1 ? R.at(i, 0) ?? 0 : new Arr([R.rows[i]]);
  return R.h === 1 ? R.at(0, i) ?? 0 : new Arr(R.rows.map((row) => [row[i]]));
};
FN.INDEX = (args, ctx) => {
  const A = arrOf(args[0], ctx); if (isErr(A)) return A;
  let r = numArg(args[1], ctx, 0), c = args[2] ? numArg(args[2], ctx, 0) : 0;
  if (isErr(r)) return r; if (isErr(c)) return c;
  if (A.h === 1 && !args[2]) { c = r; r = 1; }
  if (r < 0 || c < 0 || r > A.h || c > A.w) return ERR.REF;
  if (r === 0 && c === 0) return A;
  if (r === 0) return new Arr(A.rows.map((row) => [row[c - 1]]));
  if (c === 0) return A.w === 1 ? A.at(r - 1, 0) ?? 0 : new Arr([A.rows[r - 1]]);
  return A.at(r - 1, c - 1) ?? 0;
};
/** INDEX as a reference (so INDEX(...):INDEX(...) and SUM(INDEX(…)) work on cells). */
function callRef(node, ctx) {
  if (node.name === 'XLOOKUP') {
    const ret = evRef(node.args[2], ctx);
    if (!isRef(ret) || !ret.range || (ret.r0 !== ret.r1 && ret.c0 !== ret.c1)) return null;
    const v = scalar(node.args[0], ctx); const L = arrOf(node.args[1], ctx);
    if (isErr(v) || isErr(L)) return null;
    const i = lookupIndex(v, L.flat(), numArg(node.args[4], ctx, 0), numArg(node.args[5], ctx, 1) < 0 ? -1 : 1);
    if (i < 0) return null;
    return ret.r0 === ret.r1 ? { range: false, r: ret.r0, c: ret.c0 + i } : { range: false, r: ret.r0 + i, c: ret.c0 };
  }
  if (node.name !== 'INDEX') return null;
  const base = evRef(node.args[0], ctx);
  if (!isRef(base) || !base.range) return null;
  const r = numArg(node.args[1], ctx, 0), c = node.args[2] ? numArg(node.args[2], ctx, 0) : (base.r0 === base.r1 ? r : 1);
  if (isErr(r) || isErr(c)) return null;
  const h = base.r1 - base.r0 + 1, w = base.c1 - base.c0 + 1;
  const rr = base.r0 === base.r1 && !node.args[2] ? 1 : r;
  if (rr < 1 || c < 1 || rr > h || c > w) return null;
  return { range: false, r: base.r0 + rr - 1, c: base.c0 + c - 1 };
}
FN.CHOOSE = (args, ctx) => { const k = numArg(args[0], ctx); if (isErr(k)) return k; const i = Math.trunc(k); return i >= 1 && i < args.length ? ev(args[i], ctx) : ERR.VALUE; };
FN.ROW = (args, ctx) => { if (!args.length) return ctx.at ? ctx.at.r + 1 : ERR.VALUE; const r = evRef(args[0], ctx); return isRef(r) ? (r.range ? r.r0 : r.r) + 1 : ERR.VALUE; };
FN.COLUMN = (args, ctx) => { if (!args.length) return ctx.at ? ctx.at.c + 1 : ERR.VALUE; const r = evRef(args[0], ctx); return isRef(r) ? (r.range ? r.c0 : r.c) + 1 : ERR.VALUE; };
FN.ROWS = (args, ctx) => { const A = arrOf(args[0], ctx); return isErr(A) ? A : A.h; };
FN.COLUMNS = (args, ctx) => { const A = arrOf(args[0], ctx); return isErr(A) ? A : A.w; };

// dynamic arrays
FN.UNIQUE = (args, ctx) => {
  const A = arrOf(args[0], ctx); if (isErr(A)) return A;
  const once = args[2] ? toBool(scalar(args[2], ctx)) : false;
  const key = (row) => row.map((v) => (typeof v === 'string' ? `s:${v.toLowerCase()}` : `${typeof v}:${v}`)).join('|');
  const counts = new Map(); A.rows.forEach((row) => counts.set(key(row), (counts.get(key(row)) || 0) + 1));
  const seen = new Set(), out = [];
  for (const row of A.rows) { const k = key(row); if (seen.has(k)) continue; seen.add(k); if (once && counts.get(k) > 1) continue; out.push(row); }
  return out.length ? new Arr(out) : ERR.CALC;
};
FN.SORT = (args, ctx) => {
  const A = arrOf(args[0], ctx); if (isErr(A)) return A;
  const i = numArg(args[1], ctx, 1) - 1, ord = numArg(args[2], ctx, 1);
  const rows = A.rows.map((r, k) => [r, k]).sort((x, y) => (compare(x[0][i], y[0][i]) || x[1] - y[1]) * (ord < 0 && compare(x[0][i], y[0][i]) ? -1 : 1));
  return new Arr(rows.map((r) => r[0]));
};
FN.SORTBY = (args, ctx) => {
  const A = arrOf(args[0], ctx); if (isErr(A)) return A;
  const B = arrOf(args[1], ctx); if (isErr(B)) return B; const ord = numArg(args[2], ctx, 1);
  const keys = B.flat();
  const rows = A.rows.map((r, k) => [r, k]).sort((x, y) => (compare(keys[x[1]], keys[y[1]]) * (ord < 0 ? -1 : 1)) || x[1] - y[1]);
  return new Arr(rows.map((r) => r[0]));
};
FN.FILTER = (args, ctx) => {
  const A = arrOf(args[0], ctx); if (isErr(A)) return A;
  const inc = ev(args[1], ctx);
  const I = isArr(inc) ? inc : new Arr([[inc]]);
  // include is one column as tall as the array (keep rows) or one row as wide as it (keep columns)
  const byRow = I.w === 1 && I.h === A.h;
  if (!byRow && !(I.h === 1 && I.w === A.w)) return ERR.VALUE;
  const keep = (byRow ? I.rows.map((r) => r[0]) : I.rows[0]).map((v) => { const b = toBool(v); return !isErr(b) && b; });
  const rows = byRow ? A.rows.filter((_, i) => keep[i]) : A.rows.map((r) => r.filter((_, j) => keep[j]));
  if (!rows.length || !rows[0].length) return args[2] ? ev(args[2], ctx) : ERR.CALC;
  return new Arr(rows);
};
FN.SEQUENCE = (args, ctx) => { const r = numArg(args[0], ctx), c = numArg(args[1], ctx, 1), s = numArg(args[2], ctx, 1), st = numArg(args[3], ctx, 1); return new Arr(Array.from({ length: r }, (_, i) => Array.from({ length: c }, (__, j) => s + (i * c + j) * st))); };
FN.TRANSPOSE = (args, ctx) => { const A = arrOf(args[0], ctx); if (isErr(A)) return A; return new Arr(Array.from({ length: A.w }, (_, j) => A.rows.map((r) => r[j]))); };

function call(node, ctx) {
  const f = FN[node.name];
  if (!f) return ERR.NAME;
  try { return f(node.args, ctx); } catch { return ERR.VALUE; }
}
/** Names of the functions this engine knows (for autocomplete and checks). */
export const FUNCTIONS = Object.keys(FN).filter((k) => FN[k]).sort();

// ---------------------------------------------------------------- display
/** How a value appears in a cell: numbers in a format ('general', '0.00', '#,##0', '$#,##0.00', '0.0%', 'date'). */
export function display(v, fmt = 'general') {
  if (v == null) return '';
  if (isErr(v)) return v.code;
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'string') return v;
  if (fmt === 'general' || !fmt) return generalText(v);
  if (fmt === 'date') return textFormat(v, 'd mmm yyyy');
  return textFormat(v, fmt);
}

// ---------------------------------------------------------------- grading formulas (B03 exercises)
/**
 * Grade a formula typed into `cell` of `sheet`, against a model answer. The formula is checked by its results:
 * on the sheet as given and on `variants` copies whose numeric input data are changed (so typing the answer as a
 * number, or pointing at the right cell by eye, fails). With `fill: 'F2:F11'` the formula is filled from `cell`
 * across that range, as Excel's fill handle does, and every filled cell must match.
 * Returns { ok, results: [{ cell, got, want }], message }.
 */
export function gradeFormula(sheetSpec, { cell, formula, answer, fill = null, variants = 2, tol = 1e-9, seed = 7, require = [], perturb = null }) {
  const f = String(formula || '').trim();
  if (!f.startsWith('=')) return { ok: false, results: [], message: 'Start the formula with an equals sign (=).' };
  try { parse(f); } catch (e) { return { ok: false, results: [], message: `Excel couldn’t read that formula: ${e.message}.` }; }
  const used = functionsUsed(f);
  const unknown = [...used].filter((n) => !FN[n]);
  if (unknown.length) return { ok: false, results: [], message: `${unknown[0]} isn’t a function this sheet knows. Check the spelling.` };
  const missing = require.filter((n) => !used.has(n.toUpperCase()));
  const targets = [];
  const at = parseAddr(cell);
  if (fill) { const rg = parseRange(fill); for (let r = rg.r0; r <= rg.r1; r++) for (let c = rg.c0; c <= rg.c1; c++) targets.push({ cell: addr(r, c), dr: r - at.r, dc: c - at.c }); }
  else targets.push({ cell, dr: 0, dc: 0 });
  const rand = mulberry(seed);
  const sheets = [new Sheet(sheetSpec)];
  for (let k = 0; k < variants; k++) sheets.push(new Sheet(perturb ? perturb(sheetSpec, k, rand) : perturbSpec(sheetSpec, rand)));
  const results = [];
  let ok = true;
  sheets.forEach((base, si) => {
    const mine = base.clone(), model = base.clone();
    for (const t of targets) { mine.set(t.cell, shiftFormula(f, t.dr, t.dc)); model.set(t.cell, shiftFormula(answer, t.dr, t.dc)); }
    for (const t of targets) {
      const got = mine.get(t.cell), want = model.get(t.cell);
      const same = sameValue(got, want, tol);
      if (si === 0) results.push({ cell: t.cell, got, want, ok: same });
      if (!same) ok = false;
    }
  });
  const firstWrong = results.find((x) => !x.ok);
  let message;
  if (ok && missing.length) return { ok: false, results, message: `That gives the right result, but this exercise practises ${missing.join(' and ')}: use it in your formula.` };
  if (ok) message = fill ? `Right in every cell from ${targets[0].cell} to ${targets[targets.length - 1].cell}.` : 'Right.';
  else if (firstWrong) message = `${firstWrong.cell} shows ${display(firstWrong.got)}; it should show ${display(firstWrong.want)}.`;
  else message = 'Your formula gives the right answer for this data, but not when the numbers change: it must calculate the result from the cells, not contain it.';
  return { ok, results, message };
}
function sameValue(a, b, tol) {
  if (isErr(a) || isErr(b)) return isErr(a) && isErr(b) && a.code === b.code;
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
  if (a == null && b === 0) return true;
  if (typeof a === 'string' && typeof b === 'string') return a === b;
  return a === b;
}
function mulberry(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
/** Cells named in `fixed` (addresses or ranges such as 'J2:K5'), as a set of addresses. */
function fixedSet(list = []) {
  const out = new Set();
  for (const f of list) { const rg = parseRange(f); if (!rg) continue; for (let r = rg.r0; r <= rg.r1; r++) for (let c = rg.c0; c <= rg.c1; c++) out.add(addr(r, c)); }
  return out;
}
/** A copy of the sheet's data with every numeric input scaled by a random factor (integers stay integers). Cells in
 *  `spec.fixed` keep their values (a sorted rate table, say, that a formula relies on staying sorted). */
function perturbSpec(spec, rand) {
  const cells = {};
  const fixed = fixedSet(spec.fixed);
  for (const [k, v] of Object.entries(spec.cells || {})) {
    if (typeof v === 'number' && !fixed.has(k.replace(/\$/g, '').toUpperCase())) {
      const f = 0.6 + rand() * 0.9;
      cells[k] = Number.isInteger(v) ? Math.max(Math.round(v * f), v === 0 ? 0 : 1) : Math.round(v * f * 100) / 100;
    } else cells[k] = v;
  }
  return { ...spec, cells };
}

// ---------------------------------------------------------------- pivot tables
/**
 * Summarise records like a PivotTable. records: [{ field: value }]; rows/cols: field names (or null);
 * value: field; agg: 'sum' | 'count' | 'average' | 'max' | 'min'; show: 'value' | 'pct-total' | 'pct-row' | 'pct-col'.
 * Returns { rowKeys, colKeys, cells: Map("r|c" → n), rowTotals, colTotals, grand }.
 */
export function pivot(records, { rows = null, cols = null, value, agg = 'sum', show = 'value', filter = null }) {
  const recs = filter ? records.filter(filter) : records;
  const groups = new Map();
  const rk = new Set(), ck = new Set();
  for (const r of recs) {
    const a = rows ? String(r[rows] ?? '(blank)') : 'Total', b = cols ? String(r[cols] ?? '(blank)') : 'Total';
    rk.add(a); ck.add(b);
    for (const k of [`${a}|${b}`, `${a}|*`, `*|${b}`, '*|*']) { if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r[value]); }
  }
  const reduce = (xs) => {
    const nums = xs.filter((x) => typeof x === 'number');
    if (agg === 'count') return xs.filter((x) => x != null && x !== '').length;
    if (!nums.length) return agg === 'sum' ? 0 : null;
    if (agg === 'sum') return sumOf(nums);
    if (agg === 'average') return meanOf(nums);
    if (agg === 'max') return Math.max(...nums);
    if (agg === 'min') return Math.min(...nums);
    return null;
  };
  const sortKeys = (s) => [...s].sort((x, y) => { const nx = Number(x), ny = Number(y); return Number.isFinite(nx) && Number.isFinite(ny) ? nx - ny : x.localeCompare(y); });
  const rowKeys = sortKeys(rk), colKeys = sortKeys(ck);
  const raw = (k) => (groups.has(k) ? reduce(groups.get(k)) : null);
  const grand = raw('*|*');
  const cell = (a, b) => {
    const v = raw(`${a}|${b}`);
    if (v == null || show === 'value') return v;
    const base = show === 'pct-total' ? grand : show === 'pct-row' ? raw(`${a}|*`) : raw(`*|${b}`);
    return base ? v / base : null;
  };
  const cells = new Map();
  for (const a of rowKeys) for (const b of colKeys) cells.set(`${a}|${b}`, cell(a, b));
  const rowTotals = new Map(rowKeys.map((a) => [a, show === 'value' ? raw(`${a}|*`) : show === 'pct-row' ? 1 : (raw(`${a}|*`) ?? 0) / (show === 'pct-total' ? grand : grand)]));
  const colTotals = new Map(colKeys.map((b) => [b, show === 'value' ? raw(`*|${b}`) : show === 'pct-col' ? 1 : (raw(`*|${b}`) ?? 0) / grand]));
  return { rowKeys, colKeys, cells, rowTotals, colTotals, grand: show === 'value' ? grand : 1 };
}

// ---------------------------------------------------------------- what-if tools
/** Goal Seek: change `changing` until `target` equals `goal`. Secant steps with a bisection fallback. */
export function goalSeek(sheet, { target, goal, changing, guess = null, maxIter = 200, tol = 1e-7 }) {
  const s = sheet.clone();
  const f = (x) => { s.set(changing, x); const v = s.get(target); return typeof v === 'number' ? v - goal : NaN; };
  let x0 = guess ?? (typeof sheet.get(changing) === 'number' ? sheet.get(changing) : 0);
  let x1 = x0 === 0 ? 1 : x0 * 1.1;
  let f0 = f(x0), f1 = f(x1);
  for (let i = 0; i < maxIter; i++) {
    if (!Number.isFinite(f0) || !Number.isFinite(f1)) break;
    if (Math.abs(f1) < tol * Math.max(1, Math.abs(goal))) return { ok: true, value: x1, iterations: i + 1 };
    const d = f1 - f0;
    if (d === 0) break;
    const x2 = x1 - f1 * (x1 - x0) / d;
    x0 = x1; f0 = f1; x1 = x2; f1 = f(x1);
  }
  return Math.abs(f1) < 1e-6 * Math.max(1, Math.abs(goal)) ? { ok: true, value: x1, iterations: maxIter } : { ok: false, value: x1 };
}
/** A one- or two-variable data table: the value of `target` for each input value (as Excel's Data Table). */
export function dataTable(sheet, { target, rowInput = null, rowValues = [], colInput = null, colValues = [] }) {
  const s = sheet.clone();
  if (!colInput) return rowValues.map((x) => { s.set(rowInput, x); return s.get(target); });
  return rowValues.map((x) => colValues.map((y) => { s.set(rowInput, x); s.set(colInput, y); return s.get(target); }));
}
/**
 * Solver for a linear programme (Simplex LP): maximise or minimise c·x subject to rows of A·x (≤ | ≥ | =) b and
 * x ≥ 0, with optional integer variables (branch and bound). Small problems only (a teaching tool).
 * Returns { ok, x, objective, status: 'optimal' | 'infeasible' | 'unbounded' }.
 */
export function solveLP({ objective, sense = 'max', constraints, integer = [] }) {
  const best = { ok: false, status: 'infeasible', objective: sense === 'max' ? -Infinity : Infinity, x: null };
  const better = (v) => (sense === 'max' ? v > best.objective + 1e-9 : v < best.objective - 1e-9);
  const stack = [constraints];
  let nodes = 0;
  while (stack.length && nodes++ < 500) {
    const cons = stack.pop();
    const r = simplex(objective, sense, cons);
    if (r.status === 'unbounded') return { ok: false, status: 'unbounded' };
    if (r.status !== 'optimal' || !better(r.objective)) continue;
    r.x = r.x.map((v) => (Math.abs(v) < 1e-9 ? 0 : v));
    const ok = cons.every((k) => { const lhs = k.coef.reduce((acc, a, j) => acc + a * r.x[j], 0), tol = 1e-7 * Math.max(1, Math.abs(k.rhs)); return k.op === '<=' ? lhs <= k.rhs + tol : k.op === '>=' ? lhs >= k.rhs - tol : Math.abs(lhs - k.rhs) <= tol; });
    if (!ok) continue;                                       // a numerical failure: never report an infeasible point
    const j = integer.find((k) => Math.abs(r.x[k] - Math.round(r.x[k])) > 1e-7);
    if (j === undefined) { Object.assign(best, { ok: true, status: 'optimal', x: r.x.map((v, k) => (integer.includes(k) ? Math.round(v) + 0 : v)), objective: r.objective }); continue; }
    const lo = Math.floor(r.x[j]), unit = objective.map((_, k) => (k === j ? 1 : 0));
    stack.push([...cons, { coef: unit, op: '<=', rhs: lo }], [...cons, { coef: unit, op: '>=', rhs: lo + 1 }]);
  }
  return best.ok ? best : { ok: false, status: 'infeasible' };
}
function simplex(c, sense, cons) {
  // two-phase simplex on: max c·x, rows with ≤ / ≥ / =, x ≥ 0
  const n = c.length;
  const rows = cons.map((k) => (k.rhs < 0 ? { coef: k.coef.map((v) => -v), op: k.op === '<=' ? '>=' : k.op === '>=' ? '<=' : '=', rhs: -k.rhs } : k));
  let m = rows.length;
  const slack = rows.filter((k) => k.op !== '=').length, art = rows.filter((k) => k.op !== '<=').length;
  const W = n + slack + art + 1;
  const T = [];
  const basis = [];
  let si = n, ai = n + slack;
  const artCols = [];
  rows.forEach((k) => {
    const row = new Array(W).fill(0);
    k.coef.forEach((v, j) => { row[j] = v; });
    if (k.op === '<=') { row[si] = 1; basis.push(si++); }
    else if (k.op === '>=') { row[si++] = -1; row[ai] = 1; artCols.push(ai); basis.push(ai++); }
    else { row[ai] = 1; artCols.push(ai); basis.push(ai++); }
    row[W - 1] = k.rhs;
    T.push(row);
  });
  const pivotOn = (r, col) => {
    const pv = T[r][col];
    for (let j = 0; j < W; j++) T[r][j] /= pv;
    for (let i = 0; i < T.length; i++) if (i !== r && Math.abs(T[i][col]) > 1e-12) { const f = T[i][col]; for (let j = 0; j < W; j++) T[i][j] -= f * T[r][j]; }
    basis[r] = col;
  };
  const run = (obj, allowed) => {
    for (let it = 0; it < 500; it++) {
      // reduced costs for maximising obj
      let enter = -1, bestRc = 1e-9;
      for (let j = 0; j < W - 1; j++) {
        if (!allowed(j) || basis.includes(j)) continue;
        let rc = obj[j] || 0;
        for (let i = 0; i < m; i++) rc -= (obj[basis[i]] || 0) * T[i][j];
        if (rc > bestRc) { bestRc = rc; enter = j; }
      }
      if (enter < 0) return 'optimal';
      let leave = -1, ratio = Infinity;
      for (let i = 0; i < m; i++) if (T[i][enter] > 1e-12) { const q = T[i][W - 1] / T[i][enter]; if (q < ratio - 1e-12) { ratio = q; leave = i; } }
      if (leave < 0) return 'unbounded';
      pivotOn(leave, enter);
    }
    return 'optimal';
  };
  if (artCols.length) {
    const ph1 = new Array(W).fill(0); artCols.forEach((j) => { ph1[j] = -1; });
    run(ph1, () => true);
    const infeas = basis.some((b, i) => artCols.includes(b) && T[i][W - 1] > 1e-7);
    if (infeas) return { status: 'infeasible' };
    // drive any artificial still in the basis (at zero) out, so phase 2 can't raise it again; a row with no other
    // non-zero entry is redundant and is dropped
    for (let i = m - 1; i >= 0; i--) {
      if (!artCols.includes(basis[i])) continue;
      const j = T[i].findIndex((v, k) => k < W - 1 && !artCols.includes(k) && Math.abs(v) > 1e-9);
      if (j >= 0) pivotOn(i, j);
      else { T.splice(i, 1); basis.splice(i, 1); m -= 1; }
    }
  }
  const obj = new Array(W).fill(0); c.forEach((v, j) => { obj[j] = sense === 'max' ? v : -v; });
  const st = run(obj, (j) => !artCols.includes(j));
  if (st === 'unbounded') return { status: 'unbounded' };
  const x = new Array(n).fill(0);
  basis.forEach((b, i) => { if (b < n) x[b] = T[i][W - 1]; });
  const val = c.reduce((s, v, j) => s + v * x[j], 0);
  return { status: 'optimal', x, objective: val };
}

/**
 * Solver on a sheet, as Excel's Simplex LP: choose the values of `changing` cells to maximise, minimise or hit a value
 * of the `objective` cell, subject to constraints [{ cell, op: '<=' | '>=' | '=', rhs: number | 'B7' }], with every
 * changing cell ≥ 0 when `nonNegative` (Excel's "Make Unconstrained Variables Non-Negative", on by default) and
 * `integer` naming changing cells that must be whole numbers. The model must be linear in the changing cells: the
 * coefficients are read by setting each changing cell to 1 in turn, and linearity is checked at two more points, as
 * Excel reports "The linearity conditions required by this LP Solver are not satisfied".
 * Returns { ok, status: 'optimal' | 'infeasible' | 'unbounded' | 'nonlinear', values: { cell: v }, objective, sheet }.
 */
export function solveSheet(sheet, { objective, sense = 'max', target = 0, changing, constraints = [], integer = [], nonNegative = true }) {
  const vars = changing.flatMap((c) => { const rg = parseRange(c); const out = []; for (let r = rg.r0; r <= rg.r1; r++) for (let k = rg.c0; k <= rg.c1; k++) out.push(addr(r, k)); return out; });
  const intSet = new Set(integer.flatMap((c) => { const rg = parseRange(c); const out = []; for (let r = rg.r0; r <= rg.r1; r++) for (let k = rg.c0; k <= rg.c1; k++) out.push(addr(r, k)); return out; }));
  const s = sheet.clone();
  const at = (xs, cell) => { vars.forEach((v, i) => s.set(v, xs[i])); const val = s.get(cell); return typeof val === 'number' ? val : NaN; };
  const rhsOf = (c, xs) => (typeof c.rhs === 'number' ? c.rhs : at(xs, c.rhs));
  // each linear function f(x) = f(0) + Σ a_i x_i
  const lin = (fn) => {
    const zero = new Array(vars.length).fill(0);
    const f0 = fn(zero);
    const a = vars.map((_, i) => { const e = zero.slice(); e[i] = 1; return fn(e) - f0; });
    return { f0, a };
  };
  const fns = [(xs) => at(xs, objective), ...constraints.map((c) => (xs) => at(xs, c.cell) - rhsOf(c, xs))];
  const models = fns.map(lin);
  // linearity check at two other points
  const rand = mulberry(11);
  for (let t = 0; t < 2; t++) {
    const xs = vars.map(() => 1 + Math.floor(rand() * 9));
    for (let k = 0; k < fns.length; k++) {
      const want = models[k].f0 + models[k].a.reduce((acc, ai, i) => acc + ai * xs[i], 0), got = fns[k](xs);
      if (!Number.isFinite(got) || Math.abs(got - want) > 1e-7 * Math.max(1, Math.abs(got))) return { ok: false, status: 'nonlinear' };
    }
  }
  const cons = constraints.map((c, k) => ({ coef: models[k + 1].a, op: c.op, rhs: -models[k + 1].f0 }));
  if (sense === 'value') cons.push({ coef: models[0].a, op: '=', rhs: target - models[0].f0 });
  let free = [];
  if (!nonNegative) {
    // x = x⁺ − x⁻ with both ≥ 0
    free = vars.map((_, i) => i);
  }
  const expand = (coef) => (nonNegative ? coef : [...coef, ...coef.map((v) => -v)]);
  const res = solveLP({
    objective: expand(sense === 'value' ? models[0].a.map(() => 0) : models[0].a), sense: sense === 'min' ? 'min' : 'max',
    constraints: cons.map((c) => ({ ...c, coef: expand(c.coef) })),
    integer: vars.map((v, i) => (intSet.has(v) ? i : -1)).filter((i) => i >= 0).flatMap((i) => (nonNegative ? [i] : [i, i + vars.length])),
  });
  if (!res.ok) return { ok: false, status: res.status };
  const xs = vars.map((_, i) => (nonNegative ? res.x[i] : res.x[i] - res.x[i + vars.length])).map((v) => (Math.abs(v) < 1e-9 ? 0 : Number(v.toPrecision(12))));
  const out = sheet.clone();
  vars.forEach((v, i) => out.set(v, xs[i]));
  const ov = out.get(objective);
  void free;
  return { ok: true, status: 'optimal', values: Object.fromEntries(vars.map((v, i) => [v, xs[i]])), objective: ov, sheet: out };
}
