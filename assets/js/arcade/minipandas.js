// minipandas.js — the slice of pandas the arcade teaches, for minipy.js to run: DataFrame, Series and groupby,
// read_csv, head, filters with & and |, new columns, sort_values, value_counts, missing values and merge.
// It is not pandas: it covers what Table Tamer's levels use, and follows pandas' answers for those
// (tests/arcade.test.mjs runs every level's solution through real pandas when it is installed).
// A cell is a number, a string, true/false or null (missing, shown as NaN). Each column has a dtype:
// 'int' | 'float' | 'str' | 'bool'. Objects here speak to minipy through pyShow, pyIndex, pyMethod and friends.
import { PyError, F, show, pyRound } from './minipy.js?v=39';

const un = (v) => (v instanceof F ? (Number.isNaN(v.n) ? null : v.n) : v);
const out = (v, dtype) => (v == null ? new F(NaN) : dtype === 'float' ? new F(v) : v);
const isNumType = (t) => t === 'int' || t === 'float';
const guess = (vals) => {
  const xs = vals.filter((v) => v != null);
  if (xs.length && xs.every((v) => typeof v === 'boolean')) return 'bool';
  if (xs.every((v) => typeof v === 'number')) return xs.length !== vals.length || xs.some((v) => !Number.isInteger(v)) ? 'float' : 'int';
  return 'str';
};
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
/** A stable sort of positions by value, with missing values last (as pandas does). */
function order(vals, ascending = true) {
  return vals.map((v, i) => i).sort((i, j) => (vals[i] == null ? (vals[j] == null ? i - j : 1) : vals[j] == null ? -1 : (ascending ? cmp(vals[i], vals[j]) : cmp(vals[j], vals[i])) || i - j));
}
const cell = (v, dtype, places) => (v == null ? 'NaN' : dtype === 'float' ? v.toFixed(places) : dtype === 'bool' ? (v ? 'True' : 'False') : String(v));
const places = (vals) => Math.min(6, Math.max(1, ...vals.filter((v) => v != null).map((v) => { const s = String(Math.round(v * 1e6) / 1e6); return s.includes('.') ? s.length - s.indexOf('.') - 1 : 0; })));
const pad = (rows) => { const w = rows[0].map((_, c) => Math.max(...rows.map((r) => r[c].length))); return rows.map((r) => r.map((s, c) => s.padStart(w[c])).join('  ')).join('\n'); };
const tuple = (items) => { const t = [...items]; t.pyShow = () => `(${items.map((x) => show(x, false)).join(', ')})`; return t; };
const DTYPE = { int: 'int64', float: 'float64', str: 'str', bool: 'bool' };
const need = (cond, message, line, hint = '') => { if (!cond) throw new PyError(message, line, hint); };
const AGG = {
  sum: (xs, t) => [xs.reduce((s, x) => s + x, 0), t === 'bool' ? 'int' : t],
  mean: (xs) => [xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null, 'float'],
  max: (xs, t) => [xs.length ? xs.reduce((m, x) => (x > m ? x : m)) : null, t],
  min: (xs, t) => [xs.length ? xs.reduce((m, x) => (x < m ? x : m)) : null, t],
  count: (xs) => [xs.length, 'int'],
  median: (xs) => { const s = [...xs].sort(cmp), n = s.length; return [n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null, 'float']; },
  nunique: (xs) => [new Set(xs).size, 'int'],
};
const NEEDS_NUMBERS = new Set(['sum', 'mean', 'median']);

export class Series {
  constructor(values, index = null, name = null, dtype = null) { this.values = values; this.index = index || values.map((_, i) => i); this.name = name; this.dtype = dtype || guess(values); }
  get pyType() { return 'a Series (one column)'; }
  pyLen() { return this.values.length; }
  pyList() { return this.values.map((v) => out(v, this.dtype)); }
  pyShow(top) {
    if (!top) return `<Series ${this.name ? `"${this.name}"` : ''}: ${this.values.length} values>`.replace(' :', ':');
    const p = this.dtype === 'float' ? places(this.values) : 0;
    const n = this.values.length, keep = n > 20 ? [...Array(10).keys(), -1, ...Array.from({ length: 10 }, (_, i) => n - 10 + i)] : [...Array(n).keys()];
    const body = n ? pad(keep.map((i) => (i < 0 ? ['..', '...'] : [String(this.index[i]), cell(this.values[i], this.dtype, p)])).map(([a, b]) => [a.padEnd(Math.max(...this.index.map((x) => String(x).length))), b])) : 'Series([])';
    return `${body}\n${this.name ? `Name: ${this.name}, ` : ''}dtype: ${DTYPE[this.dtype]}`;
  }
  take(pos) { return new Series(pos.map((i) => this.values[i]), pos.map((i) => this.index[i]), this.name, this.dtype); }
  map(fn, dtype = null) { return new Series(this.values.map(fn), [...this.index], this.name, dtype); }
  agg(name, line) {
    need(!(NEEDS_NUMBERS.has(name) && this.dtype === 'str'), `.${name}() needs a column of numbers, and “${this.name ?? 'this'}” holds text.`, line, 'For text, try .value_counts() or .nunique().');
    const [v, t] = AGG[name](this.values.filter((x) => x != null), this.dtype);
    return out(v, t);
  }
  pyIndex(key, line) {
    if (key instanceof Series) { need(key.dtype === 'bool' && key.values.length === this.values.length, 'A filter must be a True/False Series of the same length.', line); return this.take(this.values.map((_, i) => i).filter((i) => key.values[i] === true)); }
    const k = un(key), i = this.index.findIndex((x) => x === k);
    need(i >= 0, `This Series has no label ${show(key, false)}.`, line, `Its labels are: ${this.index.slice(0, 8).map((x) => show(x, false)).join(', ')}${this.index.length > 8 ? ', …' : ''}.`);
    return out(this.values[i], this.dtype);
  }
  pyBin(op, other, reversed, line) {
    const n = this.values.length;
    if (op === 'neg') { need(isNumType(this.dtype), 'A minus sign needs a column of numbers.', line); return this.map((v) => (v == null ? null : -v), this.dtype); }
    if (op === '~') { need(this.dtype === 'bool', '~ flips a True/False Series, such as ~(df["qty"] > 2).', line); return this.map((v) => !v, 'bool'); }
    let b, bt;
    if (other instanceof Series) { need(other.values.length === n, `These two columns have different lengths (${n} and ${other.values.length}), so they cannot be combined row by row.`, line); b = other.values; bt = other.dtype; }
    else {
      need(!(other instanceof DataFrame) && !Array.isArray(other) && !(other instanceof Map), `${op} works between a column and one value, or between two columns.`, line);
      const v = un(other); b = Array(n).fill(v); bt = other instanceof F ? 'float' : typeof v === 'string' ? 'str' : typeof v === 'boolean' ? 'bool' : 'int';
    }
    const [x, y, xt, yt] = reversed ? [b, this.values, bt, this.dtype] : [this.values, b, this.dtype, bt];
    const mk = (fn, dtype) => new Series(x.map((v, i) => fn(v, y[i])), [...this.index], this.name, dtype);
    if (op === '&' || op === '|') {
      need(xt === 'bool' && yt === 'bool', `${op} joins two True/False columns, and one side here is not True/False.`, line, 'Put each condition in its own brackets: (df["drink"] == "latte") & (df["qty"] >= 2)');
      return mk(op === '&' ? (p, q) => p === true && q === true : (p, q) => p === true || q === true, 'bool');
    }
    if (op === '==' || op === '!=') return mk((p, q) => (p != null && q != null && p === q) === (op === '=='), 'bool');
    if (['<', '>', '<=', '>='].includes(op)) {
      need((isNumType(xt) && isNumType(yt)) || (xt === 'str' && yt === 'str'), `${op} cannot compare ${xt === 'str' ? 'text' : 'numbers'} with ${yt === 'str' ? 'text' : 'numbers'}.`, line, xt === 'str' || yt === 'str' ? 'Text values need quotes: df["drink"] == "latte"' : '');
      const f = { '<': (p, q) => p < q, '>': (p, q) => p > q, '<=': (p, q) => p <= q, '>=': (p, q) => p >= q }[op];
      return mk((p, q) => p != null && q != null && f(p, q), 'bool');
    }
    if (op === '+' && xt === 'str' && yt === 'str') return mk((p, q) => (p == null || q == null ? null : p + q), 'str');
    need(isNumType(xt) && isNumType(yt), `${op} needs numbers on both sides, and one side here is ${xt === 'str' || yt === 'str' ? 'text' : 'True/False'}.`, line);
    const f = { '+': (p, q) => p + q, '-': (p, q) => p - q, '*': (p, q) => p * q, '/': (p, q) => (q === 0 ? null : p / q), '//': (p, q) => (q === 0 ? null : Math.floor(p / q)), '%': (p, q) => (q === 0 ? null : ((p % q) + q) % q) }[op];
    need(f, `${op} does not work on a column.`, line);
    const res = x.map((v, i) => (v == null || y[i] == null ? null : f(v, y[i])));
    return new Series(res, [...this.index], this.name, op === '/' || xt === 'float' || yt === 'float' || res.some((v) => v == null) ? 'float' : 'int');
  }
  pyAttr(name, line) {
    if (name === 'values' || name === 'index') return name === 'values' ? this.pyList() : [...this.index];
    if (name === 'name') return this.name;
    if (name === 'dtype') return DTYPE[this.dtype];
    if (name === 'shape') return tuple([this.values.length]);
    if (name === 'str') { need(this.dtype === 'str', '.str works on a column of text.', line); return new StrTools(this); }
    throw new PyError(`.${name} needs brackets to run: .${name}()`, line);
  }
  pyMethod(name, a, kw, line) {
    const n = (d) => (a.length ? un(a[0]) : kw.n !== undefined ? un(kw.n) : d);
    if (AGG[name]) return this.agg(name, line);
    switch (name) {
      case 'head': return this.take([...Array(this.values.length).keys()].slice(0, n(5)));
      case 'tail': return this.take([...Array(this.values.length).keys()].slice(-n(5)));
      case 'unique': return [...new Set(this.values)].map((v) => out(v, this.dtype));
      case 'tolist': case 'to_list': return this.pyList();
      case 'copy': return this.take([...Array(this.values.length).keys()]);
      case 'abs': return this.map((v) => (v == null ? null : Math.abs(v)), this.dtype);
      case 'round': return this.map((v) => (v == null ? null : pyRound(v, n(0))), this.dtype);
      case 'isna': case 'isnull': return this.map((v) => v == null, 'bool');
      case 'notna': case 'notnull': return this.map((v) => v != null, 'bool');
      case 'dropna': return this.take(this.values.map((_, i) => i).filter((i) => this.values[i] != null));
      case 'fillna': { need(a.length === 1, '.fillna() takes the value to put in the gaps, such as .fillna(0).', line); const v = un(a[0]); return this.map((x) => (x == null ? v : x), isNumType(this.dtype) && typeof v === 'number' ? (this.dtype === 'float' || !Number.isInteger(v) ? 'float' : 'int') : null); }
      case 'isin': { need(Array.isArray(a[0]), '.isin() takes a list: df["drink"].isin(["latte", "mocha"])', line); const set = new Set(a[0].map(un)); return this.map((v) => set.has(v), 'bool'); }
      case 'idxmax': case 'idxmin': { const live = this.values.map((_, i) => i).filter((i) => this.values[i] != null); need(live.length, `.${name}() needs at least one value.`, line); return this.index[live.reduce((m, i) => ((name === 'idxmax' ? this.values[i] > this.values[m] : this.values[i] < this.values[m]) ? i : m))]; }
      case 'sort_values': return this.take(order(this.values, kw.ascending === undefined ? true : kw.ascending !== false));
      case 'value_counts': {
        const counts = new Map();
        for (const v of this.values) if (v != null) counts.set(v, (counts.get(v) || 0) + 1);
        const keys = [...counts.keys()], pos = order(keys.map((k) => counts.get(k)), false);
        return new Series(pos.map((i) => counts.get(keys[i])), pos.map((i) => keys[i]), 'count', 'int');
      }
      default: throw new PyError(`A Series has no .${name}() here.`, line, 'Try .sum(), .mean(), .max(), .min(), .count(), .value_counts(), .sort_values(), .fillna() or .head().');
    }
  }
}

class StrTools {
  constructor(s) { this.s = s; }
  get pyType() { return 'the .str tools of a column'; }
  pyShow() { return '<.str tools>'; }
  pyMethod(name, a, kw, line) {
    const each = (fn, dtype) => this.s.map((v) => (v == null ? null : fn(v)), dtype);
    if (name === 'upper') return each((v) => v.toUpperCase(), 'str');
    if (name === 'lower') return each((v) => v.toLowerCase(), 'str');
    if (name === 'title') return each((v) => v.replace(/\b\w/g, (c) => c.toUpperCase()), 'str');
    if (name === 'strip') return each((v) => v.trim(), 'str');
    if (name === 'len') return each((v) => v.length, 'int');
    if (name === 'contains' || name === 'startswith') { need(typeof a[0] === 'string', `.str.${name}() takes the text to look for.`, line); return this.s.map((v) => v != null && (name === 'contains' ? v.includes(a[0]) : v.startsWith(a[0])), 'bool'); }
    throw new PyError(`.str has no .${name}() here.`, line, 'Try .str.upper(), .str.lower(), .str.contains("…") or .str.len().');
  }
}

export class DataFrame {
  /** cols: [{ name, values, dtype }] */
  constructor(cols, index = null) { this.cols = cols; this.index = index || (cols[0] ? cols[0].values.map((_, i) => i) : []); }
  /** From a table spec: { columns: [...], rows: [[...]], float: [names of decimal columns] } */
  static from(spec) { return new DataFrame(spec.columns.map((name, c) => { const values = spec.rows.map((r) => (r[c] === undefined ? null : r[c])); return { name, values, dtype: (spec.float || []).includes(name) ? 'float' : guess(values) }; })); }
  get pyType() { return 'a DataFrame (a table)'; }
  get n() { return this.index.length; }
  pyLen() { return this.n; }
  names() { return this.cols.map((c) => c.name); }
  col(name, line) {
    const c = this.cols.find((x) => x.name === name);
    need(c, `There is no column called ${show(name, false)}.`, line, `The columns are: ${this.names().map((x) => `"${x}"`).join(', ')}. Spelling and capitals count.`);
    return c;
  }
  series(name, line) { const c = this.col(name, line); return new Series([...c.values], [...this.index], c.name, c.dtype); }
  take(pos) { return new DataFrame(this.cols.map((c) => ({ name: c.name, dtype: c.dtype, values: pos.map((i) => c.values[i]) })), pos.map((i) => this.index[i])); }
  all() { return [...Array(this.n).keys()]; }
  pyShow(top) {
    if (!top) return `<DataFrame: ${this.n} rows, ${this.cols.length} columns>`;
    if (!this.cols.length) return 'Empty DataFrame';
    const p = this.cols.map((c) => (c.dtype === 'float' ? places(c.values) : 0));
    const keep = this.n > 20 ? [...Array(10).keys(), -1, ...Array.from({ length: 10 }, (_, i) => this.n - 10 + i)] : this.all();
    const text = pad([['', ...this.names()], ...keep.map((i) => (i < 0 ? ['..', ...this.cols.map(() => '...')] : [String(this.index[i]), ...this.cols.map((c, k) => cell(c.values[i], c.dtype, p[k]))]))]);
    return this.n > 20 ? `${text}\n\n[${this.n} rows x ${this.cols.length} columns]` : text;
  }
  pyIndex(key, line) {
    if (typeof key === 'string') return this.series(key, line);
    if (key instanceof Series) {
      need(key.dtype === 'bool', 'Inside df[ ] goes a column name or a True/False test, and this is neither.', line, 'A test looks like: df[df["qty"] > 2]');
      need(key.values.length === this.n, 'This filter was made from a table with a different number of rows.', line);
      return this.take(this.all().filter((i) => key.values[i] === true));
    }
    if (Array.isArray(key)) { need(key.every((k) => typeof k === 'string'), 'A list inside df[ ] must be column names: df[["drink", "qty"]]', line); return new DataFrame(key.map((k) => { const c = this.col(k, line); return { ...c, values: [...c.values] }; }), [...this.index]); }
    if (typeof key === 'number') throw new PyError('df[0] does not pick a row. Square brackets on a DataFrame pick a column by name.', line, 'For the first rows use df.head(). For a column use df["qty"].');
    throw new PyError('Inside df[ ] goes a column name, a list of names, or a True/False test.', line);
  }
  pySetIndex(key, v, line) {
    need(typeof key === 'string', 'A new column needs a name in quotes: df["total"] = …', line);
    let col;
    if (v instanceof Series) { need(v.values.length === this.n, `The new column has ${v.values.length} values but the table has ${this.n} rows.`, line); col = { name: key, values: [...v.values], dtype: v.dtype }; }
    else { need(!(v instanceof DataFrame) && !Array.isArray(v), 'A new column is made from a column sum, or one value for every row.', line); const x = un(v); col = { name: key, values: Array(this.n).fill(x), dtype: v instanceof F ? 'float' : guess([x]) }; }
    const at = this.cols.findIndex((c) => c.name === key);
    if (at >= 0) this.cols[at] = col; else this.cols.push(col);
  }
  pyAttr(name, line) {
    if (name === 'shape') return tuple([this.n, this.cols.length]);
    if (name === 'columns') return this.names();
    if (name === 'index') return [...this.index];
    if (this.cols.some((c) => c.name === name)) return this.series(name, line);
    throw new PyError(`A DataFrame has no .${name} here.`, line, `If ${name} is a command, add brackets: .${name}(). Columns are picked with df["name"].`);
  }
  pyMethod(name, a, kw, line) {
    const n = (d) => (a.length ? un(a[0]) : kw.n !== undefined ? un(kw.n) : d);
    switch (name) {
      case 'head': return this.take(this.all().slice(0, n(5)));
      case 'tail': return this.take(this.all().slice(-n(5)));
      case 'copy': return this.take(this.all());
      case 'reset_index': { const d = this.take(this.all()); d.index = d.all(); return d; }
      case 'sort_values': {
        const by = a.length ? a[0] : kw.by;
        need(typeof by === 'string', '.sort_values() needs the name of the column to sort by: df.sort_values("qty")', line);
        return this.take(order(this.col(by, line).values, kw.ascending === undefined ? true : kw.ascending !== false));
      }
      case 'nlargest': case 'nsmallest': { need(a.length === 2 && typeof a[1] === 'string', `.${name}() takes how many and a column: df.${name}(3, "qty")`, line); return this.take(order(this.col(a[1], line).values, name === 'nsmallest').slice(0, un(a[0]))); }
      case 'dropna': return this.take(this.all().filter((i) => this.cols.every((c) => c.values[i] != null)));
      case 'fillna': { need(a.length === 1, '.fillna() takes the value to put in the gaps, such as .fillna(0).', line); const v = un(a[0]); const d = this.take(this.all()); d.cols.forEach((c) => { c.values = c.values.map((x) => (x == null ? v : x)); }); return d; }
      case 'drop': { const cols = kw.columns; need(cols !== undefined, '.drop() here removes columns: df.drop(columns=["server"])', line); const gone = new Set(Array.isArray(cols) ? cols : [cols]); gone.forEach((g) => this.col(g, line)); const d = this.take(this.all()); d.cols = d.cols.filter((c) => !gone.has(c.name)); return d; }
      case 'groupby': { need(a.length === 1 && typeof a[0] === 'string', '.groupby() takes the column to group by: df.groupby("drink")', line); this.col(a[0], line); return new GroupBy(this, a[0]); }
      case 'merge': { need(a[0] instanceof DataFrame, '.merge() takes the other table: orders.merge(menu, on="drink")', line); return merge(this, a[0], kw, line); }
      default: throw new PyError(`A DataFrame has no .${name}() here.`, line, name in AGG ? `Pick a column first: df["qty"].${name}()` : 'Try .head(), .sort_values(), .groupby(), .merge(), .dropna() or .fillna().');
    }
  }
}

function merge(left, right, kw, line) {
  const on = kw.on;
  need(typeof on === 'string', 'Say which column the two tables share: on="drink"', line);
  const how = kw.how === undefined ? 'inner' : kw.how;
  need(how === 'inner' || how === 'left', 'This game knows how="inner" (the default) and how="left".', line);
  const lk = left.col(on, line), rk = right.col(on, line);
  const pairs = [];
  for (let i = 0; i < left.n; i++) {
    const hits = right.all().filter((j) => lk.values[i] != null && rk.values[j] === lk.values[i]);
    if (hits.length) hits.forEach((j) => pairs.push([i, j])); else if (how === 'left') pairs.push([i, -1]);
  }
  const clash = new Set(left.names().filter((x) => x !== on && right.names().includes(x)));
  const cols = [
    ...left.cols.map((c) => ({ name: clash.has(c.name) ? `${c.name}_x` : c.name, dtype: c.dtype, values: pairs.map(([i]) => c.values[i]) })),
    ...right.cols.filter((c) => c.name !== on).map((c) => { const values = pairs.map(([, j]) => (j < 0 ? null : c.values[j])); return { name: clash.has(c.name) ? `${c.name}_y` : c.name, values, dtype: c.dtype === 'int' && values.some((v) => v == null) ? 'float' : c.dtype }; }),
  ];
  return new DataFrame(cols, pairs.map((_, i) => i));
}

class GroupBy {
  constructor(df, key, col = null) { this.df = df; this.key = key; this.colName = col; }
  get pyType() { return 'a groupby (rows sorted into groups)'; }
  pyShow() { return `<groupby "${this.key}"${this.colName ? ` → "${this.colName}"` : ''}: add .sum(), .mean() or .count() to get an answer>`; }
  groups() {
    const k = this.df.col(this.key).values, map = new Map();
    k.forEach((v, i) => { if (v != null) { if (!map.has(v)) map.set(v, []); map.get(v).push(i); } });
    return [...map.keys()].sort(cmp).map((key) => [key, map.get(key)]);
  }
  pyIndex(key, line) { need(typeof key === 'string', 'After groupby, pick one column by name: df.groupby("drink")["qty"]', line); this.df.col(key, line); return new GroupBy(this.df, this.key, key); }
  pyMethod(name, a, kw, line) {
    const g = this.groups();
    if (name === 'size') return new Series(g.map(([, rows]) => rows.length), g.map(([k]) => k), null, 'int');
    need(AGG[name], `A groupby has no .${name}() here.`, line, 'Try .sum(), .mean(), .count(), .max(), .min() or .size().');
    need(this.colName, `Say which column to ${name === 'count' ? 'count' : `take the ${name} of`}.`, line, `Pick it first: df.groupby("${this.key}")["qty"].${name}()`);
    const c = this.df.col(this.colName, line);
    need(!(NEEDS_NUMBERS.has(name) && c.dtype === 'str'), `.${name}() needs a column of numbers, and “${c.name}” holds text.`, line);
    let dtype = 'int';
    const vals = g.map(([, rows]) => { const [v, t] = AGG[name](rows.map((i) => c.values[i]).filter((x) => x != null), c.dtype); dtype = t; return v; });
    return new Series(vals, g.map(([k]) => k), c.name, vals.some((v) => v == null) ? 'float' : dtype);
  }
}

/** The pandas module itself: what `import pandas as pd` gives. files = { 'orders.csv': table spec } */
export function pandasModule(files) {
  return {
    pyType: 'the pandas module',
    pyShow: () => '<module pandas>',
    pyMethod(name, a, kw, line) {
      if (name === 'read_csv') {
        need(typeof a[0] === 'string', 'pd.read_csv() takes the file name in quotes: pd.read_csv("orders.csv")', line);
        need(files[a[0]], `There is no file called “${a[0]}”.`, line, `The files here are: ${Object.keys(files).join(', ')}.`);
        return DataFrame.from(files[a[0]]);
      }
      if (name === 'merge') { need(a[0] instanceof DataFrame && a[1] instanceof DataFrame, 'pd.merge() takes two tables: pd.merge(orders, menu, on="drink")', line); return merge(a[0], a[1], kw, line); }
      if (name === 'DataFrame') { need(a[0] instanceof Map, 'pd.DataFrame() takes a dictionary of lists: pd.DataFrame({"drink": ["latte"], "qty": [2]})', line); return new DataFrame([...a[0]].map(([k, v]) => { need(Array.isArray(v), 'Each column must be a list.', line); const values = v.map(un); return { name: String(k), values, dtype: v.some((x) => x instanceof F) ? 'float' : guess(values) }; })); }
      throw new PyError(`pd has no .${name}() here.`, line, 'This game has pd.read_csv() and pd.merge().');
    },
  };
}

/** A value as plain data, for checking and for drawing: a table, a series, or a plain value (NaN becomes null). */
export function plain(v) {
  if (v instanceof DataFrame) return { kind: 'table', columns: v.names(), index: [...v.index], rows: v.all().map((i) => v.cols.map((c) => c.values[i])), float: v.cols.filter((c) => c.dtype === 'float').map((c) => c.name) };
  if (v instanceof Series) return { kind: 'series', name: v.name, index: [...v.index], values: [...v.values], float: v.dtype === 'float' };
  if (v instanceof F) return Number.isNaN(v.n) ? null : v.n;
  if (Array.isArray(v)) return v.map(plain);
  if (v instanceof Map) return Object.fromEntries([...v].map(([k, x]) => [String(k), plain(x)]));
  if (v && typeof v === 'object') return { kind: 'other', text: show(v, false) };
  return v === undefined ? null : v;
}
const near = (a, b) => (typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) < 1e-9 : a === b);
const list = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => (Array.isArray(x) ? list(x, b[i]) : near(x, b[i])));
/** Are two plain answers the same? A series made by counting may list tied labels in any order. */
export function samePlain(a, b) {
  if (a && b && a.kind === 'table' && b.kind === 'table') return list(a.columns, b.columns) && list(a.rows, b.rows);
  if (a && b && a.kind === 'series' && b.kind === 'series') {
    if (a.index.length !== b.index.length || !list(a.values, b.values)) return false;
    const m = new Map(b.index.map((k, i) => [k, b.values[i]]));
    return a.index.every((k, i) => m.has(k) && near(m.get(k), a.values[i]));
  }
  if (Array.isArray(a) || Array.isArray(b)) return list(a, b);
  if ((a && typeof a === 'object') || (b && typeof b === 'object')) return false;
  return near(a, b);
}
