// minisql.js — a small SQL engine for the arcade: one SELECT over in-memory tables.
//   SELECT [DISTINCT] list FROM t [JOIN u ON a = b] [WHERE …] [GROUP BY …] [HAVING …] [ORDER BY … [ASC|DESC]] [LIMIT n]
// with =, <>, !=, <, <=, >, >=, LIKE, IN (…), BETWEEN, AND, OR, NOT, + - * /, COUNT, SUM, AVG, MIN, MAX, ROUND, UPPER, LOWER, LENGTH.
// query(sql, db) -> { columns, rows, picked }  (picked: for a single-table query without grouping, the source rows kept)
// db = { tableName: { columns: [...], rows: [[...], ...] } }

export class SqlError extends Error {
  constructor(message, hint = '') { super(message); this.hint = hint; }
}

const KW = new Set(['SELECT', 'DISTINCT', 'FROM', 'JOIN', 'INNER', 'ON', 'WHERE', 'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'AND', 'OR', 'NOT', 'LIKE', 'IN', 'BETWEEN', 'AS', 'IS', 'NULL']);
const AGG = new Set(['COUNT', 'SUM', 'AVG', 'MIN', 'MAX']);
const FN = new Set(['ROUND', 'UPPER', 'LOWER', 'LENGTH']);
const ORDER = ['SELECT', 'FROM', 'JOIN', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT'];

function lex(sql) {
  const out = [];
  let i = 0;
  const s = sql.trim().replace(/;\s*$/, '');
  if (!s) throw new SqlError('There is no query to run yet.', 'Start with SELECT.');
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '-' && s[i + 1] === '-') { while (i < s.length && s[i] !== '\n') i++; continue; }
    if (c === "'" ) {
      let j = i + 1, v = '';
      while (j < s.length && !(s[j] === "'" && s[j + 1] !== "'")) { if (s[j] === "'") j++; v += s[j]; j++; }
      if (j >= s.length) throw new SqlError('A text value is opened with a quote but never closed.', "Text goes between two single quotes, like 'Leeds'.");
      out.push({ t: 'str', v }); i = j + 1; continue;
    }
    if (c === '"') throw new SqlError('SQL text values use single quotes, not double quotes.', "Write 'Leeds' rather than \"Leeds\".");
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(s[i + 1] || ''))) { let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; out.push({ t: 'num', v: +s.slice(i, j) }); i = j; continue; }
    if (/[A-Za-z_]/.test(c)) {
      let j = i; while (j < s.length && /[A-Za-z0-9_]/.test(s[j])) j++;
      const w = s.slice(i, j), up = w.toUpperCase();
      out.push(KW.has(up) ? { t: 'kw', v: up } : { t: 'id', v: w }); i = j; continue;
    }
    const two = s.slice(i, i + 2);
    if (two === '==') throw new SqlError('SQL compares with a single =, not ==.', 'Write city = \'Leeds\'.');
    if (['<>', '!=', '<=', '>='].includes(two)) { out.push({ t: 'op', v: two === '!=' ? '<>' : two }); i += 2; continue; }
    if ('*,().=<>+-/'.includes(c)) { out.push({ t: 'op', v: c }); i++; continue; }
    if (c === ';') throw new SqlError('One query at a time: there is text after the semicolon.');
    throw new SqlError(`I don’t know what “${c}” means here.`);
  }
  return out;
}

function parse(sql) {
  const tk = lex(sql);
  let p = 0;
  const at = (v, t) => tk[p] && tk[p].v === v && (!t || tk[p].t === t) && tk[p].t !== 'str';
  const kw = (v) => at(v, 'kw');
  const op = (v) => at(v, 'op');
  const need = (v, hint) => { if (!at(v)) throw new SqlError(`Expected ${v}${tk[p] ? ` but found “${tk[p].v}”` : ' but the query stopped'}.`, hint); p++; };
  const ident = (what) => { const t = tk[p]; if (!t || t.t !== 'id') throw new SqlError(`Expected ${what}${t ? ` but found “${t.v}”` : ''}.`); p++; return t.v; };

  const expr = () => or();
  const or = () => { let a = and(); while (kw('OR')) { p++; a = { k: 'or', a, b: and() }; } return a; };
  const and = () => { let a = not(); while (kw('AND')) { p++; a = { k: 'and', a, b: not() }; } return a; };
  const not = () => { if (kw('NOT')) { p++; return { k: 'not', a: not() }; } return cmp(); };
  const cmp = () => {
    const a = sum();
    if (tk[p] && tk[p].t === 'op' && ['=', '<>', '<', '>', '<=', '>='].includes(tk[p].v)) { const o = tk[p++].v; return { k: 'cmp', op: o, a, b: sum() }; }
    let neg = false;
    if (kw('NOT') && tk[p + 1] && ['LIKE', 'IN', 'BETWEEN'].includes(tk[p + 1].v)) { neg = true; p++; }
    let node = null;
    if (kw('LIKE')) { p++; node = { k: 'like', a, b: sum() }; }
    else if (kw('IN')) { p++; need('(', 'IN is followed by a list in brackets: IN (\'Tea\', \'Coffee\').'); const list = [expr()]; while (op(',')) { p++; list.push(expr()); } need(')'); node = { k: 'in', a, list }; }
    else if (kw('BETWEEN')) { p++; const lo = sum(); need('AND', 'BETWEEN needs two ends: BETWEEN 2 AND 5.'); node = { k: 'between', a, lo, hi: sum() }; }
    else if (kw('IS')) { p++; const n = kw('NOT'); if (n) p++; need('NULL'); node = { k: 'isnull', a, neg: n }; }
    if (!node) return a;
    return neg ? { k: 'not', a: node } : node;
  };
  const sum = () => { let a = term(); while (op('+') || op('-')) { const o = tk[p++].v; a = { k: 'math', op: o, a, b: term() }; } return a; };
  const term = () => { let a = unary(); while (op('*') || op('/')) { const o = tk[p++].v; a = { k: 'math', op: o, a, b: unary() }; } return a; };
  const unary = () => { if (op('-')) { p++; return { k: 'math', op: '-', a: { k: 'lit', v: 0 }, b: unary() }; } return atom(); };
  const atom = () => {
    const t = tk[p];
    if (!t) throw new SqlError('The query stops before it is finished.');
    if (t.t === 'num' || t.t === 'str') { p++; return { k: 'lit', v: t.v }; }
    if (t.t === 'kw' && t.v === 'NULL') { p++; return { k: 'lit', v: null }; }
    if (op('(')) { p++; const e = expr(); need(')'); return e; }
    if (t.t === 'id') {
      p++;
      const up = t.v.toUpperCase();
      if (op('(')) {
        p++;
        if (AGG.has(up)) {
          if (op('*')) { p++; need(')'); if (up !== 'COUNT') throw new SqlError(`${up}(*) is not allowed. ${up} needs a column.`, `For example ${up}(price).`); return { k: 'agg', fn: up, star: true }; }
          let distinct = false;
          if (kw('DISTINCT')) { distinct = true; p++; }
          const a = expr(); need(')');
          return { k: 'agg', fn: up, a, distinct };
        }
        if (FN.has(up)) { const args = [expr()]; while (op(',')) { p++; args.push(expr()); } need(')'); return { k: 'fn', fn: up, args }; }
        throw new SqlError(`There is no function called ${t.v}().`, 'The functions here are COUNT, SUM, AVG, MIN, MAX, ROUND, UPPER, LOWER and LENGTH.');
      }
      if (op('.')) { p++; return { k: 'col', table: t.v, name: ident('a column name after the dot') }; }
      return { k: 'col', name: t.v };
    }
    throw new SqlError(`I did not expect “${t.v}” here.`, clauseHint(t.v));
  };
  const clauseHint = (word) => (ORDER.some((c) => c.startsWith(word)) ? `Clauses go in this order: ${ORDER.join(', ')}.` : '');

  if (!kw('SELECT')) throw new SqlError('A query starts with SELECT.', 'For example: SELECT * FROM menu');
  p++;
  const q = { distinct: false, items: [], from: null, join: null, where: null, group: [], having: null, order: [], limit: null };
  if (kw('DISTINCT')) { q.distinct = true; p++; }
  do {
    if (op(',')) p++;
    if (kw('FROM')) throw new SqlError('SELECT needs to know which columns you want.', 'Write SELECT * for every column, or name the columns.');
    if (op('*')) { p++; q.items.push({ star: true }); continue; }
    const e = expr();
    let alias = null;
    if (kw('AS')) { p++; alias = ident('a name after AS'); } else if (tk[p] && tk[p].t === 'id') { throw new SqlError(`I did not expect “${tk[p].v}” here.`, 'Put a comma between columns.'); }
    q.items.push({ e, alias });
  } while (op(','));
  if (!kw('FROM')) throw new SqlError(tk[p] ? `Expected FROM but found “${tk[p].v}”.` : 'The query needs a FROM: which table should the rows come from?', 'After the column list, write FROM and the table name.');
  p++;
  q.from = ident('a table name after FROM');
  if (kw('INNER')) p++;
  if (kw('JOIN')) {
    p++;
    const table = ident('a table name after JOIN');
    need('ON', 'JOIN needs ON to say which columns match, e.g. ON orders.item = menu.item.');
    q.join = { table, on: expr() };
  }
  if (kw('WHERE')) { p++; q.where = expr(); }
  if (kw('GROUP')) { p++; need('BY', 'It is two words: GROUP BY.'); q.group.push(expr()); while (op(',')) { p++; q.group.push(expr()); } }
  if (kw('HAVING')) { p++; q.having = expr(); }
  if (kw('ORDER')) {
    p++; need('BY', 'It is two words: ORDER BY.');
    do { if (op(',')) p++; const e = expr(); let desc = false; if (kw('DESC')) { desc = true; p++; } else if (kw('ASC')) p++; q.order.push({ e, desc }); } while (op(','));
  }
  if (kw('LIMIT')) { p++; const t = tk[p]; if (!t || t.t !== 'num') throw new SqlError('LIMIT needs a number.', 'For example LIMIT 3.'); q.limit = t.v; p++; }
  if (p < tk.length) {
    const w = tk[p].v;
    const two = `${w} ${tk[p + 1] ? tk[p + 1].v : ''}`.trim();
    const clause = ORDER.find((c) => c === w || c === two);
    throw new SqlError(clause ? `${clause} is in the wrong place.` : `I did not expect “${w}” here.`, clause ? `Clauses go in this order: ${ORDER.join(', ')}.` : (tk[p].t === 'id' && /^(sort|filter|orderby|groupby)$/i.test(w) ? 'SQL sorts with ORDER BY and filters with WHERE.' : ''));
  }
  return q;
}

const hasAgg = (e) => !!e && (e.k === 'agg' || ['a', 'b', 'lo', 'hi'].some((key) => hasAgg(e[key])) || (e.args || []).some(hasAgg) || (e.list || []).some(hasAgg));
const likeRe = (pat) => new RegExp(`^${String(pat).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.')}$`, 'i');
const cmpVal = (a, b) => (typeof a === 'string' && typeof b === 'string' ? a.localeCompare(b) : a < b ? -1 : a > b ? 1 : 0);
const same = (a, b) => (typeof a === 'string' && typeof b === 'string' ? a.toLowerCase() === b.toLowerCase() : a === b);
const round = (v) => (typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : v);

export function query(sql, db) {
  const q = parse(sql);
  const table = (name) => {
    const key = Object.keys(db).find((k) => k.toLowerCase() === name.toLowerCase());
    if (!key) throw new SqlError(`There is no table called ${name}.`, `The tables are: ${Object.keys(db).join(', ')}.`);
    return { name: key, ...db[key] };
  };
  const A = table(q.from);
  // each working row: { cols: [{table, name}], vals: [...], src: index in A }
  let cols = A.columns.map((name) => ({ table: A.name, name }));
  let rows = A.rows.map((vals, i) => ({ vals, src: i }));
  const lookup = (e) => {
    const hits = cols.map((c, i) => ({ c, i })).filter(({ c }) => c.name.toLowerCase() === e.name.toLowerCase() && (!e.table || c.table.toLowerCase() === e.table.toLowerCase()));
    if (!hits.length) throw new SqlError(`There is no column called ${e.table ? `${e.table}.` : ''}${e.name}.`, `The columns are: ${[...new Set(cols.map((c) => c.name))].join(', ')}.`);
    if (hits.length > 1) throw new SqlError(`Both tables have a column called ${e.name}.`, `Say which one: ${hits.map((h) => `${h.c.table}.${h.c.name}`).join(' or ')}.`);
    return hits[0].i;
  };
  function ev(e, row, group) {
    switch (e.k) {
      case 'lit': return e.v;
      case 'col': return (row || group[0]).vals[lookup(e)];
      case 'or': return !!(ev(e.a, row, group) || ev(e.b, row, group));
      case 'and': return !!(ev(e.a, row, group) && ev(e.b, row, group));
      case 'not': return !ev(e.a, row, group);
      case 'cmp': {
        const a = ev(e.a, row, group), b = ev(e.b, row, group);
        if (a === null || b === null) return false;
        if (typeof a !== typeof b) throw new SqlError(`You are comparing ${typeof a === 'string' ? 'text' : 'a number'} with ${typeof b === 'string' ? 'text' : 'a number'}.`, 'Text values need single quotes; numbers do not.');
        const c = same(a, b) ? 0 : cmpVal(a, b);
        return e.op === '=' ? c === 0 : e.op === '<>' ? c !== 0 : e.op === '<' ? c < 0 : e.op === '>' ? c > 0 : e.op === '<=' ? c <= 0 : c >= 0;
      }
      case 'like': return likeRe(ev(e.b, row, group)).test(String(ev(e.a, row, group)));
      case 'in': { const a = ev(e.a, row, group); return e.list.some((x) => same(a, ev(x, row, group))); }
      case 'between': { const a = ev(e.a, row, group); return cmpVal(a, ev(e.lo, row, group)) >= 0 && cmpVal(a, ev(e.hi, row, group)) <= 0; }
      case 'isnull': return (ev(e.a, row, group) === null) !== e.neg;
      case 'math': {
        const a = ev(e.a, row, group), b = ev(e.b, row, group);
        if (typeof a !== 'number' || typeof b !== 'number') throw new SqlError('Arithmetic needs numbers on both sides.');
        return round(e.op === '+' ? a + b : e.op === '-' ? a - b : e.op === '*' ? a * b : b === 0 ? null : a / b);
      }
      case 'fn': {
        const v = e.args.map((x) => ev(x, row, group));
        if (e.fn === 'ROUND') { const f = 10 ** (v[1] || 0); return Math.round((v[0] + Number.EPSILON) * f) / f; }
        if (e.fn === 'UPPER') return String(v[0]).toUpperCase();
        if (e.fn === 'LOWER') return String(v[0]).toLowerCase();
        return String(v[0]).length;
      }
      case 'agg': {
        if (!group) throw new SqlError(`${e.fn}() summarises many rows, so it cannot be used in WHERE.`, 'Filter groups with HAVING, after GROUP BY.');
        if (e.star) return group.length;
        let vals = group.map((r) => ev(e.a, r, null)).filter((v) => v !== null);
        if (e.distinct) vals = [...new Set(vals)];
        if (e.fn === 'COUNT') return vals.length;
        if (!vals.length) return null;
        if (e.fn === 'MIN') return vals.reduce((m, v) => (cmpVal(v, m) < 0 ? v : m));
        if (e.fn === 'MAX') return vals.reduce((m, v) => (cmpVal(v, m) > 0 ? v : m));
        if (vals.some((v) => typeof v !== 'number')) throw new SqlError(`${e.fn}() needs a column of numbers.`);
        const total = vals.reduce((s, v) => s + v, 0);
        return round(e.fn === 'SUM' ? total : total / vals.length);
      }
      default: throw new SqlError('I cannot work this out.');
    }
  }

  if (q.join) {
    const B = table(q.join.table);
    const bcols = B.columns.map((name) => ({ table: B.name, name }));
    const joined = [];
    cols = [...cols, ...bcols];
    for (const a of rows) for (const b of B.rows) { const r = { vals: [...a.vals, ...b], src: a.src }; if (ev(q.join.on, r, null)) joined.push(r); }
    rows = joined;
  }
  if (q.where) { if (hasAgg(q.where)) ev(q.where, rows[0] || { vals: [] }, null); rows = rows.filter((r) => ev(q.where, r, null)); }

  const grouped = q.group.length > 0 || q.items.some((it) => !it.star && hasAgg(it.e)) || hasAgg(q.having);
  const label = (it) => it.alias || text(it.e);
  let columns, out;
  if (grouped) {
    if (q.items.some((it) => it.star)) throw new SqlError('SELECT * cannot be mixed with GROUP BY or a summary function.', 'Name the grouping column and the summary, e.g. SELECT city, COUNT(*).');
    const groups = new Map();
    if (!q.group.length) groups.set('all', rows);
    else for (const r of rows) { const key = JSON.stringify(q.group.map((g) => { const v = ev(g, r, null); return typeof v === 'string' ? v.toLowerCase() : v; })); if (!groups.has(key)) groups.set(key, []); groups.get(key).push(r); }
    const groupText = q.group.map(text);
    for (const it of q.items) if (!hasAgg(it.e) && it.e.k !== 'lit' && !groupText.includes(text(it.e))) throw new SqlError(`${text(it.e)} is not in GROUP BY and is not inside a summary function.`, q.group.length ? `Add it to GROUP BY, or wrap it in COUNT, SUM, AVG, MIN or MAX.` : `Add GROUP BY ${text(it.e)} to get one row per ${text(it.e)}.`);
    let gs = [...groups.values()].filter((g) => g.length || !q.group.length);
    if (q.having) gs = gs.filter((g) => ev(q.having, g[0] || null, g));
    columns = q.items.map(label);
    out = gs.map((g) => ({ vals: q.items.map((it) => ev(it.e, g[0] || null, g)), g }));
    if (q.order.length) out.sort((x, y) => { for (const o of q.order) { const c = cmpVal(orderVal(o.e, x), orderVal(o.e, y)); if (c) return o.desc ? -c : c; } return 0; });
  } else {
    if (q.having) throw new SqlError('HAVING filters groups, so it needs GROUP BY.', 'To filter single rows use WHERE.');
    if (q.order.length) rows = [...rows].sort((x, y) => { for (const o of q.order) { const c = cmpVal(rowOrder(o.e, x), rowOrder(o.e, y)); if (c) return o.desc ? -c : c; } return 0; });
    columns = q.items.flatMap((it) => (it.star ? cols.map((c) => c.name) : [label(it)]));
    out = rows.map((r) => ({ vals: q.items.flatMap((it) => (it.star ? r.vals : [ev(it.e, r, null)])), src: r.src }));
  }
  function aliasIndex(e) { return e.k === 'col' && !e.table ? q.items.findIndex((it) => it.alias && it.alias.toLowerCase() === e.name.toLowerCase()) : -1; }
  function orderVal(e, o) { const i = aliasIndex(e); if (i >= 0) return o.vals[i]; if (e.k === 'lit' && Number.isInteger(e.v) && o.vals[e.v - 1] !== undefined) return o.vals[e.v - 1]; return ev(e, o.g[0] || null, o.g); }
  function rowOrder(e, r) { const i = aliasIndex(e); if (i >= 0) return ev(q.items[i].e, r, null); return ev(e, r, null); }
  if (q.distinct) { const seen = new Set(); out = out.filter((o) => { const k = JSON.stringify(o.vals); if (seen.has(k)) return false; seen.add(k); return true; }); }
  if (q.limit !== null) out = out.slice(0, q.limit);
  return { columns, rows: out.map((o) => o.vals), picked: grouped || q.join ? null : out.map((o) => o.src), ordered: q.order.length > 0 };
}

function text(e) {
  switch (e.k) {
    case 'lit': return typeof e.v === 'string' ? `'${e.v}'` : String(e.v);
    case 'col': return (e.table ? `${e.table}.` : '') + e.name.toLowerCase();
    case 'agg': return `${e.fn}(${e.star ? '*' : `${e.distinct ? 'DISTINCT ' : ''}${text(e.a)}`})`;
    case 'fn': return `${e.fn}(${e.args.map(text).join(', ')})`;
    case 'math': return `${text(e.a)} ${e.op} ${text(e.b)}`;
    default: return 'value';
  }
}

/** Do two results hold the same data? Column names are ignored; row order matters only if `ordered`. */
export function sameResult(a, b, ordered = false) {
  if (a.columns.length !== b.columns.length || a.rows.length !== b.rows.length) return false;
  const norm = (r) => JSON.stringify(r.map((v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : typeof v === 'string' ? v.toLowerCase() : v)));
  const x = a.rows.map(norm), y = b.rows.map(norm);
  if (!ordered) { x.sort(); y.sort(); }
  return x.every((v, i) => v === y[i]);
}
