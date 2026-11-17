// minipy.js — a small interpreter for the slice of Python that Py Quest teaches: calls, numbers, variables,
// for … in range(), while, if / elif / else, def (no parameters), and / or / not, comparisons and arithmetic.
// It is not Python: it exists so a learner can type real Python syntax and watch it run one step at a time.
// parse(source) -> program; run(program, host) -> generator of host actions. Errors are PyError with a line.

export class PyError extends Error {
  constructor(message, line, hint = '') { super(message); this.line = line; this.hint = hint; }
}

const KEYWORDS = new Set(['for', 'in', 'while', 'if', 'elif', 'else', 'def', 'and', 'or', 'not', 'True', 'False', 'pass', 'range']);
const WRONG_WORDS = { true: 'True', false: 'False', elseif: 'elif', 'else if': 'elif', function: 'def', repeat: 'for', foreach: 'for', then: ':' };

// ---------------------------------------------------------------- tokens (one line at a time)
function tokens(text, line) {
  const out = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === ' ' || c === '\t') { i++; continue; }
    if (c === '#') break;
    if (/[0-9]/.test(c)) { let j = i; while (j < text.length && /[0-9]/.test(text[j])) j++; out.push({ t: 'num', v: +text.slice(i, j) }); i = j; continue; }
    if (/[A-Za-z_]/.test(c)) { let j = i; while (j < text.length && /[A-Za-z0-9_]/.test(text[j])) j++; out.push({ t: 'name', v: text.slice(i, j) }); i = j; continue; }
    const two = text.slice(i, i + 2);
    if (['==', '!=', '<=', '>=', '//', '+=', '-=', '*='].includes(two)) { out.push({ t: 'op', v: two }); i += 2; continue; }
    if ('()+-*<>=:,%'.includes(c)) { out.push({ t: 'op', v: c }); i++; continue; }
    if (c === ';') throw new PyError('Python does not end lines with a semicolon.', line, 'Delete the ; at the end of the line.');
    if (c === '{' || c === '}') throw new PyError('Python does not use curly braces for blocks.', line, 'End the line with a colon and indent the lines inside it.');
    throw new PyError(`I don’t know what “${c}” means here.`, line);
  }
  return out;
}

// ---------------------------------------------------------------- expressions
function parseExpr(tk, line) {
  let p = 0;
  const peek = () => tk[p];
  const is = (v) => tk[p] && tk[p].v === v && tk[p].t !== 'num';
  const eat = (v) => { if (!is(v)) throw new PyError(`Expected “${v}” here.`, line); p++; };
  const or = () => { let a = and(); while (is('or')) { p++; a = { k: 'or', a, b: and() }; } return a; };
  const and = () => { let a = not(); while (is('and')) { p++; a = { k: 'and', a, b: not() }; } return a; };
  const not = () => { if (is('not')) { p++; return { k: 'not', a: not() }; } return cmp(); };
  const cmp = () => {
    let a = sum();
    while (peek() && peek().t === 'op' && ['==', '!=', '<', '>', '<=', '>='].includes(peek().v)) { const op = tk[p++].v; a = { k: 'bin', op, a, b: sum() }; }
    if (is('=')) throw new PyError('A single = stores a value. To compare two values use ==.', line, 'Write == to ask “are these equal?”.');
    return a;
  };
  const sum = () => { let a = term(); while (peek() && peek().t === 'op' && (peek().v === '+' || peek().v === '-')) { const op = tk[p++].v; a = { k: 'bin', op, a, b: term() }; } return a; };
  const term = () => { let a = unary(); while (peek() && peek().t === 'op' && ['*', '//', '%'].includes(peek().v)) { const op = tk[p++].v; a = { k: 'bin', op, a, b: unary() }; } return a; };
  const unary = () => { if (is('-')) { p++; return { k: 'neg', a: unary() }; } return atom(); };
  const atom = () => {
    const t = tk[p];
    if (!t) throw new PyError('This line stops before it is finished.', line);
    if (t.t === 'num') { p++; return { k: 'num', v: t.v }; }
    if (t.t === 'name') {
      p++;
      if (t.v === 'True' || t.v === 'False') return { k: 'bool', v: t.v === 'True' };
      if (WRONG_WORDS[t.v]) throw new PyError(`Python does not know “${t.v}”.`, line, `Python spells it ${WRONG_WORDS[t.v]}.`);
      if (is('(')) {
        p++;
        const args = [];
        while (!is(')')) { if (!tk[p]) throw new PyError('A bracket is opened but never closed.', line, 'Add the missing ).'); args.push(or()); if (is(',')) p++; else if (!is(')')) throw new PyError('Expected a comma or a closing bracket.', line); }
        p++;
        return { k: 'call', name: t.v, args };
      }
      return { k: 'var', name: t.v };
    }
    if (t.v === '(') { p++; const e = or(); eat(')'); return e; }
    throw new PyError(`I did not expect “${t.v}” here.`, line);
  };
  const e = or();
  return { e, rest: tk.slice(p) };
}

// ---------------------------------------------------------------- statements (indentation makes the blocks)
export function parse(source) {
  const lines = source.replace(/\r/g, '').split('\n').map((raw, i) => {
    const text = raw.replace(/\t/g, '    ');
    const body = text.trim();
    return { n: i + 1, indent: text.length - text.trimStart().length, body: body.startsWith('#') ? '' : body };
  }).filter((l) => l.body);
  if (!lines.length) throw new PyError('There is no code to run yet.', 1, 'Type a command, for example move()');
  let p = 0;
  const funcs = new Set();

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
    if (!tk.length || tk[tk.length - 1].v !== ':') throw new PyError(`A ${what} line must end with a colon.`, l.n, 'Add : at the end of the line.');
    return tk.slice(0, -1);
  }
  function condition(tk, l) {
    const { e, rest } = parseExpr(tk, l.n);
    if (rest.length) throw new PyError(`I did not expect “${rest[0].v}” here.`, l.n);
    return e;
  }
  function statement(l, indent) {
    const tk = tokens(l.body, l.n);
    p++;
    const first = tk[0];
    if (first.t === 'name' && WRONG_WORDS[first.v] && first.v !== 'true' && first.v !== 'false') throw new PyError(`Python does not know “${first.v}”.`, l.n, `Python spells it ${WRONG_WORDS[first.v]}.`);
    if (first.v === 'for' && first.t === 'name') {
      const h = header(tk, l, 'for');
      if (!(h[1] && h[1].t === 'name' && !KEYWORDS.has(h[1].v) && h[2] && h[2].v === 'in' && h[3] && h[3].v === 'range')) throw new PyError('A for loop here looks like: for i in range(4):', l.n, 'Check the words for, in and range are all there, in that order.');
      const { e, rest } = parseExpr(h.slice(3), l.n);
      if (rest.length || e.k !== 'call' || e.args.length !== 1) throw new PyError('range() takes one number: how many times to repeat.', l.n, 'For example range(4) repeats four times.');
      return { k: 'for', line: l.n, name: h[1].v, count: e.args[0], body: body(l, indent) };
    }
    if (first.v === 'while' && first.t === 'name') return { k: 'while', line: l.n, cond: condition(header(tk, l, 'while').slice(1), l), body: body(l, indent) };
    if (first.v === 'if' && first.t === 'name') {
      const node = { k: 'if', line: l.n, arms: [{ cond: condition(header(tk, l, 'if').slice(1), l), body: body(l, indent) }], other: null };
      while (p < lines.length && lines[p].indent === indent) {
        const nl = lines[p];
        const ntk = tokens(nl.body, nl.n);
        if (ntk[0].v === 'elif' && ntk[0].t === 'name') { p++; node.arms.push({ cond: condition(header(ntk, nl, 'elif').slice(1), nl), body: body(nl, indent) }); continue; }
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
    if ((first.v === 'else' || first.v === 'elif') && first.t === 'name') throw new PyError(`This ${first.v} has no if above it at the same indentation.`, l.n, `Line up ${first.v} with the if it belongs to.`);
    if (first.v === 'def' && first.t === 'name') {
      const h = header(tk, l, 'def');
      if (!(h.length === 4 && h[1].t === 'name' && h[2].v === '(' && h[3].v === ')')) throw new PyError('A function definition here looks like: def lap():', l.n, 'Give it a name, then empty brackets, then a colon.');
      if (KEYWORDS.has(h[1].v)) throw new PyError(`“${h[1].v}” is a Python keyword, so it cannot be a function name.`, l.n);
      funcs.add(h[1].v);
      return { k: 'def', line: l.n, name: h[1].v, body: body(l, indent) };
    }
    if (first.v === 'pass' && tk.length === 1) return { k: 'pass', line: l.n };
    // assignment: name = expr, name += expr
    if (first.t === 'name' && tk[1] && tk[1].t === 'op' && ['=', '+=', '-=', '*='].includes(tk[1].v)) {
      if (KEYWORDS.has(first.v)) throw new PyError(`“${first.v}” is a Python keyword, so it cannot be a variable name.`, l.n);
      const { e, rest } = parseExpr(tk.slice(2), l.n);
      if (rest.length) throw new PyError(`I did not expect “${rest[0].v}” here.`, l.n);
      return { k: 'set', line: l.n, name: first.v, op: tk[1].v, e };
    }
    if (tk[tk.length - 1].v === ':') throw new PyError('Only for, while, if, elif, else and def lines end with a colon.', l.n);
    const { e, rest } = parseExpr(tk, l.n);
    if (rest.length) throw new PyError(`I did not expect “${rest[0].v}” here.`, l.n, rest[0].t === 'name' ? 'One command per line.' : '');
    if (e.k === 'var') throw new PyError(`“${e.name}” on its own does nothing.`, l.n, `To run a command, add brackets: ${e.name}()`);
    if (e.k !== 'call') throw new PyError('This line works something out but does nothing with it.', l.n);
    return { k: 'expr', line: l.n, e };
  }
  const prog = block(lines[0].indent);
  if (lines[0].indent > 0) throw new PyError('The first line should not be indented.', lines[0].n);
  return { body: prog, lines: lines.length };
}

/** How many lines of code a source has (blank lines and comments do not count). */
export function countLines(source) {
  return source.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#')).length;
}

// ---------------------------------------------------------------- running
// host = { actions: {name: arity}, sensors: {name: fn}, } ; run yields { action, args, line } for each action call.
export function* run(program, host, { maxSteps = 600 } = {}) {
  const vars = new Map();
  const defs = new Map();
  let steps = 0;
  const tick = (line) => { if (++steps > maxSteps) throw new PyError('The program ran for too long. A loop probably never stops.', line, 'Check that the while condition can become False.'); };

  function value(e, line) {
    switch (e.k) {
      case 'num': case 'bool': return e.v;
      case 'var':
        if (!vars.has(e.name)) throw new PyError(`The name “${e.name}” has not been given a value yet.`, line, host.actions[e.name] !== undefined || host.sensors[e.name] ? `To use the command, add brackets: ${e.name}()` : `Give it a value first, for example ${e.name} = 3`);
        return vars.get(e.name);
      case 'neg': return -value(e.a, line);
      case 'not': return !value(e.a, line);
      case 'and': return value(e.a, line) && value(e.b, line);
      case 'or': return value(e.a, line) || value(e.b, line);
      case 'bin': {
        const a = value(e.a, line), b = value(e.b, line);
        switch (e.op) {
          case '+': return a + b; case '-': return a - b; case '*': return a * b;
          case '//': if (b === 0) throw new PyError('You cannot divide by zero.', line); return Math.floor(a / b);
          case '%': if (b === 0) throw new PyError('You cannot divide by zero.', line); return ((a % b) + b) % b;
          case '==': return a === b; case '!=': return a !== b; case '<': return a < b; case '>': return a > b; case '<=': return a <= b; default: return a >= b;
        }
      }
      case 'call':
        if (host.sensors[e.name]) { if (e.args.length) throw new PyError(`${e.name}() takes nothing inside its brackets.`, line); return host.sensors[e.name](); }
        if (host.actions[e.name] !== undefined) throw new PyError(`${e.name}() is a command: it does something but gives no answer back.`, line, 'Use it on a line of its own.');
        throw new PyError(`There is no command called ${e.name}().`, line, nearest(e.name));
      default: throw new PyError('I cannot work this out.', line);
    }
  }
  function nearest(name) {
    const all = [...Object.keys(host.actions), ...Object.keys(host.sensors), ...defs.keys()];
    const lower = name.toLowerCase().replace(/_/g, '');
    const hit = all.find((n) => n.toLowerCase().replace(/_/g, '') === lower) || all.find((n) => n.startsWith(name.slice(0, 3)));
    return hit ? `Did you mean ${hit}()? Python is exact about spelling and capitals.` : `The commands are: ${Object.keys(host.actions).map((n) => `${n}()`).join(', ')}.`;
  }
  function* block(list, depth) {
    for (const s of list) yield* stmt(s, depth);
  }
  function* stmt(s, depth) {
    tick(s.line);
    switch (s.k) {
      case 'pass': return;
      case 'set': {
        const v = value(s.e, s.line);
        if (s.op === '=') vars.set(s.name, v);
        else {
          if (!vars.has(s.name)) throw new PyError(`“${s.name}” has no value yet, so ${s.op} cannot change it.`, s.line, `Start with ${s.name} = 0`);
          const old = vars.get(s.name);
          vars.set(s.name, s.op === '+=' ? old + v : s.op === '-=' ? old - v : old * v);
        }
        yield { action: '_set', args: [s.name, vars.get(s.name)], line: s.line };
        return;
      }
      case 'def': defs.set(s.name, s); return;
      case 'for': {
        const n = value(s.count, s.line);
        if (typeof n !== 'number') throw new PyError('range() needs a number.', s.line);
        for (let i = 0; i < n; i++) { vars.set(s.name, i); tick(s.line); yield* block(s.body, depth); }
        return;
      }
      case 'while':
        while (value(s.cond, s.line)) { tick(s.line); yield* block(s.body, depth); }
        return;
      case 'if':
        for (const arm of s.arms) if (value(arm.cond, s.line)) { yield* block(arm.body, depth); return; }
        if (s.other) yield* block(s.other, depth);
        return;
      default: {
        const e = s.e;
        if (defs.has(e.name)) {
          if (e.args.length) throw new PyError(`${e.name}() was defined with nothing in its brackets.`, s.line);
          if (depth > 40) throw new PyError('A function keeps calling itself and never stops.', s.line);
          yield* block(defs.get(e.name).body, depth + 1);
          return;
        }
        if (host.sensors[e.name]) throw new PyError(`${e.name}() asks a question, but this line ignores the answer.`, s.line, `Use it in a test: if ${e.name}():`);
        const arity = host.actions[e.name];
        if (arity === undefined) throw new PyError(`There is no command called ${e.name}().`, s.line, nearest(e.name));
        if (e.args.length > arity) throw new PyError(arity ? `${e.name}() takes at most ${arity} number inside its brackets.` : `${e.name}() takes nothing inside its brackets.`, s.line);
        const args = e.args.map((a) => value(a, s.line));
        if (args.some((a) => typeof a !== 'number' || a < 0)) throw new PyError(`${e.name}() needs a number that is zero or more.`, s.line);
        yield { action: e.name, args, line: s.line };
      }
    }
  }
  yield* block(program.body, 0);
}
