// minipy.js — a small interpreter for the slice of Python the arcade teaches: numbers, text, lists and
// dictionaries, variables, print(), for and while loops, if / elif / else, def with inputs and return,
// and / or / not / in, comparisons and arithmetic.
// It is not Python: it exists so a learner can type real Python syntax and watch it run one step at a time.
// parse(source) -> program; exec(program, host, emit) runs it, calling emit for every action. Errors are PyError with a line.

export class PyError extends Error {
  constructor(message, line, hint = '') { super(message); this.line = line; this.hint = hint; }
}

const KEYWORDS = new Set(['import', 'for', 'in', 'while', 'if', 'elif', 'else', 'def', 'return', 'and', 'or', 'not', 'True', 'False', 'None', 'pass']);
const WRONG_WORDS = { true: 'True', false: 'False', null: 'None', none: 'None', elseif: 'elif', function: 'def', repeat: 'for', foreach: 'for', then: ':' };

/** A float. Python keeps whole numbers (int) and decimals (float) apart: 8 / 2 is 4.0, not 4. */
export class F { constructor(n) { this.n = n; } }
const isNum = (v) => typeof v === 'number' || v instanceof F;
const raw = (v) => (v instanceof F ? v.n : v);
const num = (n, float) => (float ? new F(n) : n);
/** How Python shows a value: str() at the top level, repr() inside a list or dictionary. */
export function show(v, top = true) {
  if (v === null || v === undefined) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (v.pyShow) return v.pyShow(top);
  if (v instanceof F && Number.isNaN(v.n)) return 'nan';
  if (v instanceof F) return Number.isInteger(v.n) ? `${v.n}.0` : String(Math.round(v.n * 1e10) / 1e10);
  if (typeof v === 'string') return top ? v : `'${v}'`;
  if (Array.isArray(v)) return `[${v.map((x) => show(x, false)).join(', ')}]`;
  if (v instanceof Map) return `{${[...v].map(([k, x]) => `${show(k, false)}: ${show(x, false)}`).join(', ')}}`;
  return String(v);
}
/** A plain JavaScript value into a Python one: decimals become floats, objects become dictionaries. */
export function fromJs(v) {
  if (Array.isArray(v)) return v.map(fromJs);
  if (v && typeof v === 'object' && !(v instanceof F) && !(v instanceof Map)) return new Map(Object.entries(v).map(([k, x]) => [k, fromJs(x)]));
  if (typeof v === 'number' && !Number.isInteger(v)) return new F(v);
  return v;
}
/** A Python value back into plain JavaScript (floats become numbers, dictionaries become objects). */
export function toJs(v) {
  if (v instanceof F) return v.n;
  if (Array.isArray(v)) return v.map(toJs);
  if (v instanceof Map) return Object.fromEntries([...v].map(([k, x]) => [String(k), toJs(x)]));
  return v === undefined ? null : v;
}
const typeName = (v) => (v === null ? 'None' : v && v.pyType ? v.pyType : typeof v === 'boolean' ? 'a True/False value' : isNum(v) ? 'a number' : typeof v === 'string' ? 'text' : Array.isArray(v) ? 'a list' : 'a dictionary');
/** Python's round(): to the nearest, and an exact half goes to the even neighbour (round(2.5) is 2). */
export function pyRound(x, d = 0) {
  if (!Number.isFinite(x)) return x;
  const s = Math.abs(x).toFixed(Math.min(100, d + 40)), cut = s.indexOf('.') + 1 + d, tail = s.slice(cut);
  let n = Number(Math.abs(x).toFixed(d));
  if (/^50*$/.test(tail)) { const down = Number(s.slice(0, cut)); const last = Number(s.slice(0, cut).replace('.', '').slice(-1)); n = last % 2 === 0 ? down : n; }
  return x < 0 ? -n : n;
}
const truthy = (v) => !(v === false || v === null || v === 0 || v === '' || (v instanceof F && v.n === 0) || (Array.isArray(v) && !v.length) || (v instanceof Map && !v.size));
const same = (a, b) => (isNum(a) && isNum(b) ? raw(a) === raw(b) : typeName(a) === typeName(b) && show(a, false) === show(b, false));

// ---------------------------------------------------------------- tokens (one line at a time)
function tokens(text, line) {
  const out = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === ' ' || c === '\t') { i++; continue; }
    if (c === '#') break;
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < text.length && text[j] !== c) j++;
      if (j >= text.length) throw new PyError('A piece of text is opened with a quote but never closed.', line, `Text goes between two matching quotes, like ${c}latte${c}.`);
      out.push({ t: 'str', v: text.slice(i + 1, j) }); i = j + 1; continue;
    }
    if (/[0-9]/.test(c)) { let j = i; while (j < text.length && /[0-9]/.test(text[j])) j++; let float = false; if (text[j] === '.' && /[0-9]/.test(text[j + 1] || '')) { float = true; j++; while (j < text.length && /[0-9]/.test(text[j])) j++; } out.push({ t: 'num', v: +text.slice(i, j), float }); i = j; continue; }
    if (/[A-Za-z_]/.test(c)) { let j = i; while (j < text.length && /[A-Za-z0-9_]/.test(text[j])) j++; out.push({ t: 'name', v: text.slice(i, j) }); i = j; continue; }
    const two = text.slice(i, i + 2);
    if (['==', '!=', '<=', '>=', '//', '+=', '-=', '*=', '/='].includes(two)) { out.push({ t: 'op', v: two }); i += 2; continue; }
    if ('()+-*/<>=:,%[]{}.&|~'.includes(c)) { out.push({ t: 'op', v: c }); i++; continue; }
    if (c === ';') throw new PyError('Python does not end lines with a semicolon.', line, 'Delete the ; at the end of the line.');
    throw new PyError(`I don’t know what “${c}” means here.`, line);
  }
  return out;
}

// ---------------------------------------------------------------- expressions
function parseExpr(tk, line) {
  let p = 0;
  const is = (v) => tk[p] && tk[p].v === v && tk[p].t !== 'num' && tk[p].t !== 'str';
  const isOp = (v) => tk[p] && tk[p].t === 'op' && tk[p].v === v;
  const eat = (v, hint = '') => { if (!isOp(v)) throw new PyError(tk[p] ? `Expected “${v}” but found “${tk[p].v}”.` : `A bracket is opened but never closed: “${v}” is missing.`, line, hint || `Add the missing ${v}`); p++; };
  const or = () => { let a = and(); while (is('or')) { p++; a = { k: 'or', a, b: and() }; } return a; };
  const and = () => { let a = not(); while (is('and')) { p++; a = { k: 'and', a, b: not() }; } return a; };
  const not = () => { if (is('not')) { p++; return { k: 'not', a: not() }; } return cmp(); };
  const cmp = () => {
    let a = bor();
    for (;;) {
      if (tk[p] && tk[p].t === 'op' && ['==', '!=', '<', '>', '<=', '>='].includes(tk[p].v)) { const op = tk[p++].v; a = { k: 'bin', op, a, b: bor() }; }
      else if (is('in')) { p++; a = { k: 'in', a, b: bor() }; }
      else if (is('not') && tk[p + 1] && tk[p + 1].v === 'in' && tk[p + 1].t === 'name') { p += 2; a = { k: 'not', a: { k: 'in', a, b: bor() } }; }
      else break;
    }
    if (isOp('=')) throw new PyError('A single = stores a value. To compare two values use ==.', line, 'Write == to ask “are these equal?”.');
    return a;
  };
  // & and | bind tighter than a comparison, which is why pandas filters need brackets round each condition
  const bor = () => { let a = band(); while (isOp('|')) { p++; a = { k: 'bit', op: '|', a, b: band() }; } return a; };
  const band = () => { let a = sum(); while (isOp('&')) { p++; a = { k: 'bit', op: '&', a, b: sum() }; } return a; };
  const sum = () => { let a = term(); while (isOp('+') || isOp('-')) { const op = tk[p++].v; a = { k: 'bin', op, a, b: term() }; } return a; };
  const term = () => { let a = unary(); while (isOp('*') || isOp('//') || isOp('%') || isOp('/')) { const op = tk[p++].v; a = { k: 'bin', op, a, b: unary() }; } return a; };
  const unary = () => { if (isOp('-')) { p++; return { k: 'neg', a: unary() }; } if (isOp('~')) { p++; return { k: 'inv', a: unary() }; } return postfix(); };
  const args = () => {
    const list = [];
    list.kw = {};
    while (!isOp(')')) { if (!tk[p]) throw new PyError('A bracket is opened but never closed.', line, 'Add the missing )'); if (tk[p].t === 'name' && tk[p + 1] && tk[p + 1].t === 'op' && tk[p + 1].v === '=') { const key = tk[p].v; p += 2; list.kw[key] = or(); } else list.push(or()); if (isOp(',')) p++; else if (!isOp(')')) throw new PyError(tk[p] ? 'Expected a comma or a closing bracket.' : 'A bracket is opened but never closed.', line, tk[p] ? '' : 'Add the missing )'); }
    p++;
    return list;
  };
  const postfix = () => {
    let e = atom();
    for (;;) {
      if (isOp('(')) { p++; const list = args(); if (e.k === 'var') e = { k: 'call', name: e.name, args: list, kw: list.kw }; else if (e.k === 'attr') e = { k: 'method', obj: e.obj, name: e.name, args: list, kw: list.kw }; else throw new PyError('Only a name can be called with brackets.', line); }
      else if (isOp('[')) {
        p++;
        let a = null;
        if (!isOp(':')) a = or();
        if (isOp(':')) { p++; const b = isOp(']') ? null : or(); eat(']'); e = { k: 'slice', obj: e, a, b }; } else { eat(']'); e = { k: 'index', obj: e, i: a }; }
      } else if (isOp('.')) { p++; const t = tk[p]; if (!t || t.t !== 'name') throw new PyError('A dot must be followed by a name, like orders.append(3).', line); p++; e = { k: 'attr', obj: e, name: t.v }; }
      else break;
    }
    return e;
  };
  const atom = () => {
    const t = tk[p];
    if (!t) throw new PyError('This line stops before it is finished.', line);
    if (t.t === 'num') { p++; return { k: 'lit', v: num(t.v, t.float) }; }
    if (t.t === 'str') { p++; return { k: 'lit', v: t.v }; }
    if (t.t === 'name') {
      p++;
      if (t.v === 'True' || t.v === 'False') return { k: 'lit', v: t.v === 'True' };
      if (t.v === 'None') return { k: 'lit', v: null };
      if (WRONG_WORDS[t.v]) throw new PyError(`Python does not know “${t.v}”.`, line, `Python spells it ${WRONG_WORDS[t.v]}.`);
      return { k: 'var', name: t.v };
    }
    if (t.v === '(') { p++; const e = or(); eat(')'); return e; }
    if (t.v === '[') { p++; const items = []; while (!isOp(']')) { if (!tk[p]) throw new PyError('A list is opened with [ but never closed.', line, 'Add the missing ]'); items.push(or()); if (isOp(',')) p++; else if (!isOp(']')) throw new PyError('Put a comma between the items of a list.', line); } p++; return { k: 'list', items }; }
    if (t.v === '{') { p++; const pairs = []; while (!isOp('}')) { if (!tk[p]) throw new PyError('A dictionary is opened with { but never closed.', line, 'Add the missing }'); const key = or(); eat(':', 'A dictionary pairs a key with a value: {"latte": 3}'); pairs.push([key, or()]); if (isOp(',')) p++; else if (!isOp('}')) throw new PyError('Put a comma between the pairs of a dictionary.', line); } p++; return { k: 'dict', pairs }; }
    throw new PyError(`I did not expect “${t.v}” here.`, line);
  };
  const e = or();
  return { e, rest: tk.slice(p) };
}

// ---------------------------------------------------------------- statements (indentation makes the blocks)
export function parse(source) {
  const lines = source.replace(/\r/g, '').split('\n').map((rawLine, i) => {
    const text = rawLine.replace(/\t/g, '    ');
    const body = text.trim();
    return { n: i + 1, indent: text.length - text.trimStart().length, body: body.startsWith('#') ? '' : body };
  }).filter((l) => l.body);
  if (!lines.length) throw new PyError('There is no code to run yet.', 1, 'Type a line of Python, then press Run.');
  let p = 0;

  function block(indent) {
    const out = [];
    while (p < lines.length) {
      const l = lines[p];
      if (l.indent < indent) break;
      if (l.indent > indent) throw new PyError('This line is indented further than the line above it, but nothing opened a block.', l.n, 'Only indent the lines that belong inside a for, while, if or def.');
      out.push(statement(l, indent));
    }
    return out;
  }
  function body(l, indent) {
    const next = lines[p];
    if (!next || next.indent <= indent) throw new PyError('The line above ends with a colon, so the next line must be indented.', next ? next.n : l.n, 'Put four spaces in front of the lines that belong inside it.');
    return block(next.indent);
  }
  function header(tk, l, what) {
    if (tk[tk.length - 1].v === '{' && tk[tk.length - 1].t === 'op') throw new PyError('Python does not use curly braces for blocks.', l.n, 'End the line with a colon and indent the lines inside it.');
    if (!tk.length || tk[tk.length - 1].v !== ':' || tk[tk.length - 1].t !== 'op') throw new PyError(`A ${what} line must end with a colon.`, l.n, 'Add : at the end of the line.');
    return tk.slice(0, -1);
  }
  function whole(tk, l) {
    const { e, rest } = parseExpr(tk, l.n);
    if (rest.length) throw new PyError(`I did not expect “${rest[0].v}” here.`, l.n, rest[0].t === 'name' ? 'One instruction per line.' : '');
    return e;
  }
  function statement(l, indent) {
    const tk = tokens(l.body, l.n);
    p++;
    const first = tk[0];
    const word = first.t === 'name' ? first.v : '';
    if (word && WRONG_WORDS[word] && !['true', 'false', 'null', 'none'].includes(word)) throw new PyError(`Python does not know “${word}”.`, l.n, `Python spells it ${WRONG_WORDS[word]}.`);
    if (first.t === 'op' && first.v === '}') throw new PyError('Python does not use curly braces for blocks.', l.n, 'A block ends when the indentation stops.');
    if (word === 'for') {
      const h = header(tk, l, 'for');
      if (!(h[1] && h[1].t === 'name' && !KEYWORDS.has(h[1].v) && h[2] && h[2].v === 'in' && h[2].t === 'name' && h[3])) throw new PyError('A for loop looks like: for i in range(4):', l.n, 'Check the words for and in are both there, with a name between them.');
      return { k: 'for', line: l.n, name: h[1].v, iter: whole(h.slice(3), l), body: body(l, indent) };
    }
    if (word === 'while') return { k: 'while', line: l.n, cond: whole(header(tk, l, 'while').slice(1), l), body: body(l, indent) };
    if (word === 'if') {
      const node = { k: 'if', line: l.n, arms: [{ cond: whole(header(tk, l, 'if').slice(1), l), body: body(l, indent) }], other: null };
      while (p < lines.length && lines[p].indent === indent) {
        const nl = lines[p];
        const ntk = tokens(nl.body, nl.n);
        if (ntk[0].v === 'elif' && ntk[0].t === 'name') { p++; node.arms.push({ cond: whole(header(ntk, nl, 'elif').slice(1), nl), body: body(nl, indent) }); continue; }
        if (ntk[0].v === 'else' && ntk[0].t === 'name') {
          p++;
          if (ntk.length > 2) throw new PyError('else takes no condition. Use elif if you need to test something.', nl.n);
          header(ntk, nl, 'else');
          node.other = body(nl, indent);
        }
        break;
      }
      return node;
    }
    if (word === 'else' || word === 'elif') throw new PyError(`This ${word} has no if above it at the same indentation.`, l.n, `Line up ${word} with the if it belongs to.`);
    if (word === 'def') {
      const h = header(tk, l, 'def');
      const ok = h.length >= 4 && h[1].t === 'name' && h[2].v === '(' && h[h.length - 1].v === ')';
      const params = ok ? h.slice(3, -1).filter((t) => !(t.t === 'op' && t.v === ',')) : [];
      if (!ok || params.some((t) => t.t !== 'name')) throw new PyError('A function definition looks like: def total(prices):', l.n, 'Give it a name, then brackets (with the names of its inputs, if any), then a colon.');
      if (KEYWORDS.has(h[1].v)) throw new PyError(`“${h[1].v}” is a Python keyword, so it cannot be a function name.`, l.n);
      return { k: 'def', line: l.n, name: h[1].v, params: params.map((t) => t.v), body: body(l, indent) };
    }
    if (word === 'import' || word === 'from') {
      const ok = word === 'import' && tk[1] && tk[1].t === 'name' && (tk.length === 2 || (tk.length === 4 && tk[2].v === 'as' && tk[3].t === 'name'));
      if (!ok) throw new PyError('An import line looks like: import pandas as pd', l.n);
      return { k: 'import', line: l.n, module: tk[1].v, as: tk.length === 4 ? tk[3].v : tk[1].v };
    }
    if (word === 'return') return { k: 'return', line: l.n, e: tk.length > 1 ? whole(tk.slice(1), l) : null };
    if (word === 'pass' && tk.length === 1) return { k: 'pass', line: l.n };
    // assignment: target = value, target += value (the = is outside any bracket)
    let depth = 0, at = -1;
    for (let i = 0; i < tk.length; i++) { const t = tk[i]; if (t.t !== 'op') continue; if ('([{'.includes(t.v)) depth++; else if (')]}'.includes(t.v)) depth--; else if (depth === 0 && ['=', '+=', '-=', '*=', '/='].includes(t.v)) { at = i; break; } }
    if (at > 0) {
      if (word && KEYWORDS.has(word)) throw new PyError(`“${word}” is a Python keyword, so it cannot be a variable name.`, l.n);
      const target = whole(tk.slice(0, at), l);
      if (target.k !== 'var' && target.k !== 'index') throw new PyError('The left of = must be a name (or one item of a list or dictionary).', l.n, 'The name goes on the left and the value on the right: total = 5');
      return { k: 'set', line: l.n, target, op: tk[at].v, e: whole(tk.slice(at + 1), l) };
    }
    if (tk[tk.length - 1].v === '{' && tk[tk.length - 1].t === 'op') throw new PyError('Python does not use curly braces for blocks.', l.n, 'End the line with a colon and indent the lines inside it.');
    if (tk[tk.length - 1].v === ':' && tk[tk.length - 1].t === 'op') throw new PyError('Only for, while, if, elif, else and def lines end with a colon.', l.n);
    const e = whole(tk, l);
    if (e.k === 'var') throw new PyError(`“${e.name}” on its own does nothing.`, l.n, `To run a command, add brackets: ${e.name}()`);
    if (e.k === 'attr') throw new PyError(`.${e.name} on its own does nothing.`, l.n, `If it is a command, add brackets: .${e.name}()`);
    if (e.k !== 'call' && e.k !== 'method') throw new PyError('This line works something out but does nothing with it.', l.n, 'Store it in a variable, or print() it.');
    return { k: 'expr', line: l.n, e };
  }
  const prog = block(lines[0].indent);
  if (lines[0].indent > 0) throw new PyError('The first line should not be indented.', lines[0].n);
  return { body: prog, lines: lines.length, defs: prog.filter((s) => s.k === 'def').map((s) => s.name) };
}

/** How many lines of code a source has (blank lines and comments do not count). */
export function countLines(source) {
  return source.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#')).length;
}

// ---------------------------------------------------------------- running
// host = { actions: { name: maxArgs }, sensors: { name: fn }, vars: { name: value }, free: Set of actions that take any value }
// exec calls emit({ action, args, line }) for every action, print and assignment, in order, as the program runs.
export function exec(program, host, emit, { maxSteps = 600 } = {}) {
  const globals = new Map(Object.entries(host.vars || {}).map(([k, v]) => [k, fromJs(v)]));
  const defs = new Map();
  const actions = host.actions || {}, sensors = host.sensors || {};
  let steps = 0;
  const tick = (line) => { if (++steps > maxSteps) throw new PyError('The program ran for too long. A loop probably never stops.', line, 'Check that the while condition can become False.'); };
  const RET = Symbol('return');
  const BUILTINS = {
    len: (a, line) => { const v = a[0]; if (v && v.pyLen) return v.pyLen(); if (typeof v === 'string' || Array.isArray(v)) return v.length; if (v instanceof Map) return v.size; throw new PyError(`len() counts the items in a list or the characters in text, not ${typeName(v)}.`, line); },
    str: (a) => show(a[0]),
    int: (a, line) => { const v = a[0]; const n = typeof v === 'string' ? Number(v) : raw(v); if (!Number.isFinite(n) || (typeof v === 'string' && !/^-?\d+$/.test(v.trim()))) throw new PyError(`int() cannot turn ${show(v, false)} into a whole number.`, line); return Math.trunc(n); },
    float: (a, line) => { const n = Number(typeof a[0] === 'string' ? a[0] : raw(a[0])); if (!Number.isFinite(n)) throw new PyError(`float() cannot turn ${show(a[0], false)} into a number.`, line); return new F(n); },
    round: (a) => { const n = raw(a[0]); return a.length > 1 ? new F(pyRound(n, raw(a[1]))) : pyRound(n, 0); },
    abs: (a) => num(Math.abs(raw(a[0])), a[0] instanceof F),
    range: (a, line) => { const v = a.map(raw); if (!v.length || v.some((x) => !Number.isInteger(x))) throw new PyError('range() needs a whole number: how many times to repeat.', line, 'For example range(4) repeats four times.'); const [s, e, st] = v.length === 1 ? [0, v[0], 1] : [v[0], v[1], v[2] || 1]; const out = []; for (let i = s; st > 0 ? i < e : i > e; i += st) { out.push(i); if (out.length > maxSteps) break; } return out; },
    sum: (a, line) => { if (!Array.isArray(a[0]) || !a[0].every(isNum)) throw new PyError('sum() adds up a list of numbers.', line); return num(a[0].reduce((s, x) => s + raw(x), 0), a[0].some((x) => x instanceof F)); },
    min: (a) => (Array.isArray(a[0]) ? a[0] : a).reduce((m, x) => (raw(x) < raw(m) ? x : m)),
    max: (a) => (Array.isArray(a[0]) ? a[0] : a).reduce((m, x) => (raw(x) > raw(m) ? x : m)),
    sorted: (a) => [...a[0]].sort((x, y) => (raw(x) < raw(y) ? -1 : raw(x) > raw(y) ? 1 : 0)),
  };
  const known = () => [...Object.keys(actions), ...Object.keys(sensors), ...defs.keys(), ...Object.keys(BUILTINS), 'print'];
  function nearest(name) {
    const lower = name.toLowerCase().replace(/_/g, '');
    const hit = known().find((n) => n.toLowerCase().replace(/_/g, '') === lower) || known().find((n) => n.startsWith(name.slice(0, 3)));
    return hit ? `Did you mean ${hit}()? Python is exact about spelling and capitals.` : Object.keys(actions).length ? `The commands are: ${Object.keys(actions).map((n) => `${n}()`).join(', ')}.` : '';
  }
  const lookup = (name, scope, line) => {
    if (scope && scope.has(name)) return scope.get(name);
    if (globals.has(name)) return globals.get(name);
    throw new PyError(`The name “${name}” has not been given a value yet.`, line, known().includes(name) ? `To use the command, add brackets: ${name}()` : `Check the spelling, or give it a value first: ${name} = 3. If it is meant as text, put it in quotes: "${name}"`);
  };
  function math(op, a, b, line) {
    if (op === '+' && typeof a === 'string' && typeof b === 'string') return a + b;
    if (op === '+' && Array.isArray(a) && Array.isArray(b)) return [...a, ...b];
    if (op === '*' && typeof a === 'string' && typeof b === 'number') return a.repeat(Math.max(0, b));
    if (op === '+' && (typeof a === 'string') !== (typeof b === 'string')) throw new PyError('You cannot add text and a number.', line, 'Turn the number into text first with str(), for example "Total: " + str(total)');
    if (!isNum(a) || !isNum(b)) throw new PyError(`${op} does not work between ${typeName(a)} and ${typeName(b)}.`, line);
    const x = raw(a), y = raw(b), fl = a instanceof F || b instanceof F;
    if (op === '+') return num(x + y, fl);
    if (op === '-') return num(x - y, fl);
    if (op === '*') return num(x * y, fl);
    if (y === 0) throw new PyError('You cannot divide by zero.', line);
    if (op === '/') return new F(x / y);
    if (op === '//') return num(Math.floor(x / y), fl);
    return num(((x % y) + y) % y, fl);
  }
  function at(obj, i, line) {
    if (obj instanceof Map) { for (const [k, v] of obj) if (same(k, i)) return v; throw new PyError(`There is no key ${show(i, false)} in this dictionary.`, line, `Its keys are: ${[...obj.keys()].map((k) => show(k, false)).join(', ')}.`); }
    if (typeof obj !== 'string' && !Array.isArray(obj)) throw new PyError(`Square brackets pick an item out of a list, text or a dictionary, not out of ${typeName(obj)}.`, line);
    if (typeof i !== 'number') throw new PyError('A position in a list must be a whole number.', line);
    const n = obj.length, k = i < 0 ? n + i : i;
    if (k < 0 || k >= n) throw new PyError(`Position ${i} is past the end. There are ${n} items, numbered 0 to ${n - 1}.`, line, 'Counting starts at 0, so the last item is at position len(...) - 1, or simply [-1].');
    return obj[k];
  }
  function method(obj, name, a, line) {
    if (Array.isArray(obj) && name === 'append') { if (a.length !== 1) throw new PyError('.append() adds exactly one item.', line); obj.push(a[0]); return null; }
    if (typeof obj === 'string') { if (name === 'upper') return obj.toUpperCase(); if (name === 'lower') return obj.toLowerCase(); if (name === 'strip') return obj.trim(); if (name === 'replace') return obj.split(String(a[0])).join(String(a[1])); }
    if (obj instanceof Map) { if (name === 'get') { for (const [k, v] of obj) if (same(k, a[0])) return v; return a.length > 1 ? a[1] : null; } if (name === 'keys') return [...obj.keys()]; if (name === 'values') return [...obj.values()]; }
    throw new PyError(`${typeName(obj)[0].toUpperCase()}${typeName(obj).slice(1)} has no .${name}() here.`, line, Array.isArray(obj) ? 'Lists have .append().' : typeof obj === 'string' ? 'Text has .upper(), .lower(), .strip() and .replace().' : obj instanceof Map ? 'Dictionaries have .get(), .keys() and .values().' : '');
  }
  function call(e, scope, line, asStatement) {
    const name = e.name;
    if (e.kw && Object.keys(e.kw).length) throw new PyError(`${name}() does not take named inputs here.`, line, `Remove ${Object.keys(e.kw)[0]}= and pass the value on its own.`);
    if (defs.has(name)) {
      const d = defs.get(name);
      if (e.args.length !== d.params.length) throw new PyError(`${name}() takes ${d.params.length} input${d.params.length === 1 ? '' : 's'}, but this call gives it ${e.args.length}.`, line);
      if (scope && scope.depth > 40) throw new PyError('A function keeps calling itself and never stops.', line);
      const local = new Map(d.params.map((pn, i) => [pn, value(e.args[i], scope, line)]));
      local.depth = (scope ? scope.depth : 0) + 1;
      try { block(d.body, local); } catch (r) { if (r && r[RET]) return r.value; throw r; }
      return null;
    }
    if (sensors[name]) {
      if (e.args.length) throw new PyError(`${name}() takes nothing inside its brackets.`, line);
      if (asStatement) throw new PyError(`${name}() asks a question, but this line ignores the answer.`, line, `Use it in a test: if ${name}():`);
      return sensors[name]();
    }
    if (actions[name] !== undefined) {
      if (!asStatement) throw new PyError(`${name}() is a command: it does something but gives no answer back.`, line, 'Use it on a line of its own.');
      const arity = actions[name];
      if (e.args.length > arity) throw new PyError(arity ? `${name}() takes at most ${arity} value inside its brackets.` : `${name}() takes nothing inside its brackets.`, line);
      const vals = e.args.map((x) => value(x, scope, line));
      if (!(host.free && host.free.has(name)) && vals.some((v) => typeof v !== 'number' || v < 0)) throw new PyError(`${name}() needs a whole number that is zero or more.`, line);
      emit({ action: name, args: vals, line });
      return null;
    }
    if (name === 'print') { emit({ action: 'print', args: [e.args.map((x) => show(value(x, scope, line))).join(' ')], line }); return null; }
    if (BUILTINS[name]) {
      const vals = e.args.map((x) => value(x, scope, line)).map((v) => (v && v.pyList && name !== 'len' ? v.pyList() : v));
      if (!vals.length) throw new PyError(`${name}() needs a value inside its brackets.`, line);
      return BUILTINS[name](vals, line);
    }
    throw new PyError(`There is no command called ${name}().`, line, nearest(name));
  }
  function value(e, scope, line) {
    switch (e.k) {
      case 'lit': return e.v;
      case 'var': return lookup(e.name, scope, line);
      case 'list': return e.items.map((x) => value(x, scope, line));
      case 'dict': return new Map(e.pairs.map(([k, v]) => [value(k, scope, line), value(v, scope, line)]));
      case 'attr': { const o = value(e.obj, scope, line); if (o && o.pyAttr) return o.pyAttr(e.name, line); throw new PyError(`.${e.name} needs brackets to run: .${e.name}()`, line); }
      case 'inv': { const v = value(e.a, scope, line); if (v && v.pyBin) return v.pyBin('~', null, false, line); throw new PyError('~ flips a True/False column. For one value, use not.', line); }
      case 'bit': { const a = value(e.a, scope, line), b = value(e.b, scope, line); if (a && a.pyBin) return a.pyBin(e.op, b, false, line); if (b && b.pyBin) return b.pyBin(e.op, a, true, line); throw new PyError(`${e.op} joins two True/False columns. For plain values use ${e.op === '&' ? 'and' : 'or'}.`, line); }
      case 'neg': { const v = value(e.a, scope, line); if (v && v.pyBin) return v.pyBin('neg', null, false, line); if (!isNum(v)) throw new PyError(`A minus sign needs a number, not ${typeName(v)}.`, line); return num(-raw(v), v instanceof F); }
      case 'not': return !truthy(value(e.a, scope, line));
      case 'and': { const a = value(e.a, scope, line); return truthy(a) ? value(e.b, scope, line) : a; }
      case 'or': { const a = value(e.a, scope, line); return truthy(a) ? a : value(e.b, scope, line); }
      case 'in': { const a = value(e.a, scope, line), b = value(e.b, scope, line); if (typeof b === 'string') return typeof a === 'string' && b.includes(a); if (Array.isArray(b)) return b.some((x) => same(x, a)); if (b instanceof Map) return [...b.keys()].some((x) => same(x, a)); throw new PyError(`in looks inside a list, text or a dictionary, not ${typeName(b)}.`, line); }
      case 'index': { const o = value(e.obj, scope, line), i = value(e.i, scope, line); return o && o.pyIndex ? o.pyIndex(i, line) : at(o, i, line); }
      case 'slice': { const o = value(e.obj, scope, line); if (typeof o !== 'string' && !Array.isArray(o)) throw new PyError(`A slice cuts a piece out of a list or text, not ${typeName(o)}.`, line); return o.slice(e.a ? raw(value(e.a, scope, line)) : 0, e.b ? raw(value(e.b, scope, line)) : undefined); }
      case 'method': {
        const o = value(e.obj, scope, line), a = e.args.map((x) => value(x, scope, line));
        if (o && o.pyMethod) return o.pyMethod(e.name, a, Object.fromEntries(Object.entries(e.kw || {}).map(([k, x]) => [k, value(x, scope, line)])), line);
        return method(o, e.name, a, line);
      }
      case 'call': return call(e, scope, line, false);
      case 'bin': {
        const a = value(e.a, scope, line), b = value(e.b, scope, line);
        if (a && a.pyBin) return a.pyBin(e.op, b, false, line);
        if (b && b.pyBin) return b.pyBin(e.op, a, true, line);
        if (e.op === '==') return same(a, b);
        if (e.op === '!=') return !same(a, b);
        if (['<', '>', '<=', '>='].includes(e.op)) {
          if (!((isNum(a) && isNum(b)) || (typeof a === 'string' && typeof b === 'string'))) throw new PyError(`${e.op} cannot compare ${typeName(a)} with ${typeName(b)}.`, line);
          const x = raw(a), y = raw(b);
          return e.op === '<' ? x < y : e.op === '>' ? x > y : e.op === '<=' ? x <= y : x >= y;
        }
        return math(e.op, a, b, line);
      }
      default: throw new PyError('I cannot work this out.', line);
    }
  }
  function block(list, scope) { for (const s of list) stmt(s, scope); }
  function stmt(s, scope) {
    tick(s.line);
    switch (s.k) {
      case 'pass': return;
      case 'import': { const m = (host.modules || {})[s.module]; if (!m) throw new PyError(`There is no module called “${s.module}” here.`, s.line, host.modules ? `This game has: ${Object.keys(host.modules).map((k) => `import ${k}`).join(', ')}` : 'This game needs no imports.'); globals.set(s.as, m); return; }
      case 'def': defs.set(s.name, s); return;
      case 'return': if (!scope) throw new PyError('return only works inside a function (under a def).', s.line); throw { [RET]: true, value: s.e ? value(s.e, scope, s.line) : null };
      case 'set': {
        let v = value(s.e, scope, s.line);
        const t = s.target;
        if (t.k === 'var') {
          if (s.op !== '=') { const has = (scope && scope.has(t.name)) || globals.has(t.name); if (!has) throw new PyError(`“${t.name}” has no value yet, so ${s.op} cannot change it.`, s.line, `Start with ${t.name} = 0`); v = math(s.op[0], lookup(t.name, scope, s.line), v, s.line); }
          (scope || globals).set(t.name, v);
          emit({ action: '_set', args: [t.name, show(v, false)], line: s.line });
        } else {
          const obj = value(t.obj, scope, s.line), key = value(t.i, scope, s.line);
          if (s.op !== '=') v = math(s.op[0], at(obj, key, s.line), v, s.line);
          if (obj && obj.pySetIndex) obj.pySetIndex(key, v, s.line);
          else if (obj instanceof Map) { let found = false; for (const k of obj.keys()) if (same(k, key)) { obj.set(k, v); found = true; } if (!found) obj.set(key, v); }
          else if (Array.isArray(obj)) { at(obj, key, s.line); obj[key < 0 ? obj.length + key : key] = v; }
          else throw new PyError(`You cannot change one item of ${typeName(obj)}.`, s.line);
        }
        return;
      }
      case 'for': {
        const it = value(s.iter, scope, s.line);
        const items = it && it.pyList ? it.pyList() : Array.isArray(it) ? it : typeof it === 'string' ? [...it] : it instanceof Map ? [...it.keys()] : null;
        if (!items) throw new PyError(`A for loop goes through a list, text or range(), not ${typeName(it)}.`, s.line, isNum(it) ? `To repeat ${show(it)} times write: for i in range(${show(it)}):` : '');
        for (const x of [...items]) { (scope || globals).set(s.name, x); tick(s.line); block(s.body, scope); }
        return;
      }
      case 'while': while (truthy(value(s.cond, scope, s.line))) { tick(s.line); block(s.body, scope); } return;
      case 'if':
        for (const arm of s.arms) if (truthy(value(arm.cond, scope, s.line))) { block(arm.body, scope); return; }
        if (s.other) block(s.other, scope);
        return;
      default:
        if (s.e.k === 'call') call(s.e, scope, s.line, true); else value(s.e, scope, s.line);
    }
  }
  block(program.body, null);
}
/** The same run as a list of steps. Steps made before an error are yielded, then the error is thrown. */
export function* run(program, host, opts) {
  const steps = [];
  let err = null;
  try { exec(program, host, (s) => steps.push(s), opts); } catch (e) { err = e; }
  yield* steps;
  if (err) throw err;
}
