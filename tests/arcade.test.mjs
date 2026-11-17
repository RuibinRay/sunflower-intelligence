// arcade.test.mjs — the Pixel Arcade's engines: the mini Python and SQL interpreters, every level's reference
// solution, and the random question makers (Python answers are checked against real Python when python3 is installed).
//   node tests/arcade.test.mjs
import { execFileSync } from 'node:child_process';
import { parse, run, PyError } from '../assets/js/arcade/minipy.js';
import { query, sameResult, SqlError } from '../assets/js/arcade/minisql.js';
import { PY_LEVELS, pyRun, SQL_LEVELS, SQL_DB, sqlRun, HTML_LEVELS, htmlRun, htmlScan } from '../assets/js/arcade/levels.js';
import { makeQuestion, CATCH_ROUNDS, QUESTION_COUNTS } from '../assets/js/arcade/questions.js';
import { mulberry32 } from '../assets/js/core/rng.js';

let pass = 0, fail = 0;
const ok = (cond, name) => { if (cond) pass++; else { fail++; console.error(`FAIL ${name}`); } };
const eq = (a, b, name) => ok(JSON.stringify(a) === JSON.stringify(b), `${name}: got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`);
const pyErr = (src, re, name) => { try { const host = { actions: { move: 1, collect: 0 }, sensors: { path_clear: () => true } }; [...run(parse(src), host, { maxSteps: 200 })]; ok(false, `${name}: no error`); } catch (e) { ok(e instanceof PyError && re.test(e.message + ' ' + e.hint), `${name}: ${e.message} | ${e.hint}`); } };
const sqlErr = (sql, re, name) => { try { query(sql, SQL_DB); ok(false, `${name}: no error`); } catch (e) { ok(e instanceof SqlError && re.test(e.message + ' ' + e.hint), `${name}: ${e.message} | ${e.hint}`); } };

// ---------------------------------------------------------------- mini Python
const trace = (src) => { const log = []; const host = { actions: { move: 1, say: 1 }, sensors: { yes: () => true, no: () => false } }; for (const s of run(parse(src), host)) if (s.action !== '_set') log.push(s.args.length ? s.args[0] : s.action); return log; };
eq(trace('move()\nmove(3)'), ['move', 3], 'calls');
eq(trace('for i in range(3):\n    say(i)'), [0, 1, 2], 'for');
eq(trace('n = 2\nn += 3\nn *= 2\nsay(n)\nsay(n // 3)\nsay(n % 3)\nsay(2 + 3 * 4)\nsay((2 + 3) * 4)'), [10, 3, 1, 14, 20], 'arithmetic');
eq(trace('x = 5\nwhile x > 2:\n    say(x)\n    x -= 1'), [5, 4, 3], 'while');
eq(trace('x = 5\nif x > 9:\n    say(1)\nelif x > 3:\n    say(2)\nelse:\n    say(3)\nsay(4)'), [2, 4], 'elif');
eq(trace('if no():\n    say(1)\nelse:\n    say(2)'), [2], 'else');
eq(trace('if not no() and yes() or no():\n    say(1)'), [1], 'boolean');
eq(trace('def twice():\n    say(1)\n    say(1)\n\ntwice()\ntwice()'), [1, 1, 1, 1], 'def');
eq(trace('for i in range(2):\n    for j in range(2):\n        say(i * 2 + j)\nsay(9)'), [0, 1, 2, 3, 9], 'nested');
eq(trace('# comment\n\nmove()  # trailing'), ['move'], 'comments');
pyErr('move', /brackets/, 'bare name');
pyErr('Move()', /Did you mean move\(\)/, 'capital');
pyErr('for i in range(3)\n    move()', /colon/, 'missing colon');
pyErr('for i in range(3):\nmove()', /indented/, 'missing indent');
pyErr('move()\n    move()', /indented further/, 'stray indent');
pyErr('while path_clear():\n    collect()', /too long/, 'infinite loop');
pyErr('move(;', /semicolon/, 'semicolon');
pyErr('if path_clear() = True:\n    move()', /==/, 'single equals');
pyErr('move(n)', /not been given a value/, 'unknown variable');
pyErr('else:\n    move()', /no if above/, 'stray else');
pyErr('while true:\n    move()', /True/, 'lowercase true');
pyErr('move(', /never closed|stops before/, 'open bracket');
pyErr('path_clear()', /ignores the answer/, 'unused sensor');

// ---------------------------------------------------------------- Py Quest levels
for (const lv of PY_LEVELS) {
  for (let v = 0; v < lv.maps.length; v++) {
    const r = pyRun(lv, lv.solution, v);
    ok(r.ok && r.stars === 3, `py ${lv.id} map ${v}: ${r.error ? r.error.message : `stars ${r.stars}, lines ${r.lines}/${lv.par}`}`);
  }
  ok(!pyRun(lv, lv.starter, 0).ok, `py ${lv.id}: the starter code should not already solve it`);
  ok(lv.maps.every((m) => m.length === 7 && m.every((row) => row.length === 10)), `py ${lv.id}: maps are 10 x 7`);
}
ok(pyRun(PY_LEVELS[0], 'move()\nmove()\nmove()\nmove()\nmove()\nmove()\nmove()', 0).error.message.includes('hedge'), 'py bump');
ok(pyRun(PY_LEVELS[0], 'collect()', 0).error.message.includes('no flower'), 'py empty collect');
ok(pyRun(PY_LEVELS[6], 'for i in range(7):\n    move()\n    collect()', 0).ok === false, 'py if level needs the if');

// ---------------------------------------------------------------- mini SQL
const q = (sql) => query(sql, SQL_DB);
eq(q('SELECT * FROM menu').rows.length, 12, 'select *');
eq(q('select item from menu where price > 3 and category = \'Coffee\'').rows.flat(), ['Latte', 'Flat White', 'Mocha'], 'where and');
eq(q("SELECT item FROM menu WHERE category = 'Tea' OR category = 'Other' AND price > 9").rows.length, 3, 'and before or');
eq(q("SELECT item FROM menu WHERE item LIKE '%tea'").rows.flat(), ['Green Tea'], 'like');
eq(q("SELECT item FROM menu WHERE category IN ('Tea', 'Other') ORDER BY price DESC LIMIT 2").rows.flat(), ['Hot Chocolate', 'Chai'], 'in, order, limit');
eq(q('SELECT item FROM menu WHERE price BETWEEN 3 AND 3.2 ORDER BY item').rows.flat(), ['Brownie', 'Chai', 'Flat White'], 'between');
eq(q('SELECT COUNT(*), SUM(stock), MIN(price), MAX(price) FROM menu').rows, [[12, 234, 2.2, 3.8]], 'aggregates');
eq(q('SELECT category, COUNT(*) AS n FROM menu GROUP BY category ORDER BY n DESC, category').rows, [['Bakery', 4], ['Coffee', 4], ['Tea', 3], ['Other', 1]], 'group by with alias order');
eq(q('SELECT category, ROUND(AVG(price), 2) FROM menu GROUP BY category HAVING AVG(price) > 3').rows, [['Coffee', 3.15], ['Other', 3.5]], 'having');
eq(q('SELECT DISTINCT city FROM orders ORDER BY city').rows.flat(), ['Hull', 'Leeds', 'York'], 'distinct');
eq(q('SELECT city, SUM(qty * price) FROM orders JOIN menu ON orders.item = menu.item GROUP BY city ORDER BY 2 DESC').rows, [['Leeds', 33.2], ['York', 15.6], ['Hull', 13.3]], 'join group');
eq(q('SELECT item, price * 2 AS double FROM menu WHERE id = 1').rows, [['Espresso', 4.4]], 'arithmetic');
eq(q('SELECT * FROM menu WHERE stock < 10').picked, [5, 8, 10], 'picked rows');
sqlErr('SELECT * FROM menus', /no table/, 'unknown table');
sqlErr('SELECT cost FROM menu', /no column/, 'unknown column');
sqlErr('SELECT * FROM menu WHERE category = "Tea"', /single quotes/, 'double quotes');
sqlErr('SELECT * FROM menu WHERE category = Tea', /no column called Tea/, 'unquoted text');
sqlErr('SELECT * FROM menu WHERE price == 3', /single =/, 'double equals');
sqlErr('SELECT * FROM menu ORDER BY price WHERE price > 3', /wrong place|order/i, 'clause order');
sqlErr('SELECT item FROM menu WHERE COUNT(*) > 2', /HAVING/, 'aggregate in where');
sqlErr('SELECT category, item FROM menu GROUP BY category', /GROUP BY/, 'ungrouped column');
sqlErr('SELECT item FROM orders JOIN menu ON orders.item = menu.item', /Both tables/, 'ambiguous column');
sqlErr('FROM menu SELECT *', /starts with SELECT/, 'no select');
sqlErr('SELECT FROM menu', /which columns/, 'no columns');
sqlErr('SELECT item price FROM menu', /comma/, 'missing comma');
for (const lv of SQL_LEVELS) {
  const r = sqlRun(lv, lv.solution);
  ok(r.ok, `sql ${lv.id}: solution passes`);
  ok(sqlRun(lv, lv.hint.startsWith('SELECT') ? lv.hint : lv.solution).ok, `sql ${lv.id}: hint passes`);
  const s = sqlRun(lv, lv.starter);
  ok(!s.ok, `sql ${lv.id}: the starter should not already solve it`);
  ok(r.result.rows.length > 0, `sql ${lv.id}: returns rows`);
}
ok(!sqlRun(SQL_LEVELS[5], 'SELECT item, price FROM menu ORDER BY price').ok, 'sql ordered level checks order');
ok(sqlRun(SQL_LEVELS[5], 'SELECT item, price FROM menu ORDER BY price').why.includes('order'), 'sql wrong-order message');

// ---------------------------------------------------------------- Tag Builder
for (const lv of HTML_LEVELS) {
  const r = htmlRun(lv, lv.solution);
  ok(r.ok, `html ${lv.id}: solution passes (${r.error ? r.error.message : r.checks.filter((c) => !c[1]).map((c) => c[0]).join('; ')})`);
  ok(!htmlRun(lv, lv.starter).ok, `html ${lv.id}: the starter should not already solve it`);
}
ok(/never closed/.test(htmlScan('<p>hello').error.message), 'html unclosed');
ok(/closes too early/.test(htmlScan('<p><strong>hi</p></strong>').error.message), 'html bad nesting');
ok(/no opening/.test(htmlScan('hello</p>').error.message), 'html stray close');
ok(/quote/.test(htmlScan('<a href="x>go</a>').error.message), 'html quote');
ok(/never has a closing/.test(htmlScan('<img src="a.png"></img>').error.message), 'html void close');
ok(/lower case/.test(htmlScan('<P>hi</P>').error.message), 'html case');
ok(/strong/.test(htmlScan('<b>hi</b>').error.hint), 'html b hint');
ok(htmlScan('<ul>\n <li>a</li>\n <li>b <em>c</em></li>\n</ul>').nodes[0].children.length === 2, 'html tree');

// ---------------------------------------------------------------- questions
const rand = mulberry32(20261117);
const pyQs = [];
for (const track of ['python', 'sql', 'web', 'mixed']) {
  for (let i = 0; i < 400; i++) {
    const tier = 1 + (i % 3);
    let qn;
    try { qn = makeQuestion(track, tier, rand); } catch (e) { ok(false, `${track} question threw: ${e.message}`); continue; }
    ok(qn.options.length === 4 && new Set(qn.options).size === 4, `${track}: four different options (${JSON.stringify(qn.options)}) for ${qn.code || qn.prompt}`);
    ok(qn.answer >= 0 && qn.answer < 4 && qn.why && qn.prompt, `${track}: has an answer and a reason`);
    if (qn.track === 'python') pyQs.push(qn);
  }
}
ok(QUESTION_COUNTS.python >= 25 && QUESTION_COUNTS.sql >= 15 && QUESTION_COUNTS.web >= 12, 'enough question makers');
for (const round of CATCH_ROUNDS) {
  const { good, bad } = round.make(rand);
  ok(good.length >= 5 && bad.length >= 5 && bad.every((b) => b.t && b.why), `catch round "${round.rule}" has tokens with reasons`);
  ok(!good.some((g) => bad.some((b) => b.t === g)), `catch round "${round.rule}": no token is both right and wrong`);
}
// Python's own answer for every generated Python question
let checkedPy = 0;
try {
  const script = `import io, json, sys, contextlib\nqs = json.load(sys.stdin)\nout = []\nfor q in qs:\n    buf = io.StringIO()\n    with contextlib.redirect_stdout(buf):\n        exec(q, {})\n    out.append(buf.getvalue().rstrip("\\n"))\nprint(json.dumps(out))`;
  const res = JSON.parse(execFileSync('python3', ['-c', script], { input: JSON.stringify(pyQs.map((x) => x.code)), encoding: 'utf8' }));
  pyQs.forEach((x, i) => { checkedPy++; ok(res[i] === x.options[x.answer], `python agrees on:\n${x.code}\n  python: ${res[i]}  ours: ${x.options[x.answer]}`); });
} catch (e) { if (e.code === 'ENOENT') console.log('python3 not found: skipped the cross-check against real Python'); else throw e; }
// the catcher's "True in Python" round against real Python
try {
  const { good, bad } = CATCH_ROUNDS.find((x) => x.rule.includes('True')).make(mulberry32(7));
  const exprs = [...good, ...bad.map((b) => b.t)];
  const res = JSON.parse(execFileSync('python3', ['-c', 'import json,sys\nprint(json.dumps([bool(eval(e)) for e in json.load(sys.stdin)]))'], { input: JSON.stringify(exprs), encoding: 'utf8' }));
  exprs.forEach((e, i) => ok(res[i] === (i < good.length), `python truth of ${e}`));
} catch (e) { if (e.code !== 'ENOENT') throw e; }

console.log(`${pass} passed, ${fail} failed (${checkedPy} Python questions checked against python3)`);
process.exit(fail ? 1 : 0);
