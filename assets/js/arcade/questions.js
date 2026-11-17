// questions.js — the question makers behind the two endless games. Every question is built from random
// numbers and words, so a run never repeats; the answers are worked out here (Python by rules that copy what
// Python prints, SQL by running the query on minisql), never typed in by hand.
//   makeQuestion(track, tier, rand) -> { track, prompt, code, lang, table, options, answer, why }
//   CATCH_ROUNDS: rules for Syntax Catcher, each makes { rule, good: [text], bad: [{ t, why }] }
import { query } from './minisql.js?v=33';

// ---------------------------------------------------------------- helpers
const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const pick = (r, list) => list[Math.floor(r() * list.length)];
export function shuffle(r, list) { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const sample = (r, list, n) => shuffle(r, list).slice(0, n);
/** How Python prints a value. Floats are passed as { f: number } so 4.0 keeps its ".0". */
export function py(v) {
  if (v === null) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (typeof v === 'object' && 'f' in v) return Number.isInteger(v.f) ? `${v.f}.0` : String(Math.round(v.f * 1e10) / 1e10);
  if (Array.isArray(v)) return `[${v.map((x) => (typeof x === 'string' ? `'${x}'` : py(x))).join(', ')}]`;
  return String(v);
}
/** Four options with the answer among them; pads with nearby numbers or stock answers if the wrong ones repeat. */
function finish(r, q) {
  const answer = String(q.answer);
  const wrong = [];
  for (const w of q.wrong.map(String)) if (w !== answer && !wrong.includes(w)) wrong.push(w);
  const n = Number(answer);
  let k = 1;
  while (wrong.length < 3) {
    const filler = answer !== '' && Number.isFinite(n) && !/[.\s]/.test(answer) ? String(n + (k % 2 ? k : -k)) : ['Error', 'None', 'True', 'False', '0', 'Nothing is printed'][k - 1];
    if (filler !== undefined && filler !== answer && !wrong.includes(filler)) wrong.push(filler);
    if (++k > 12) break;
  }
  const options = shuffle(r, [answer, ...wrong.slice(0, 3)]);
  return { track: q.track, prompt: q.prompt || 'What does this print?', code: q.code || '', lang: q.lang || '', table: q.table || null, options, answer: options.indexOf(answer), why: q.why };
}

// ================================================================ Python
const WORDS = ['sunflower', 'lantern', 'coffee', 'python', 'garden', 'pollen', 'ledger', 'banana', 'analyst', 'market'];
const NAMES = ['Ana', 'Ben', 'Cleo', 'Dev', 'Eli', 'Fay'];
const PY = {
  1: [
    (r) => { const a = ri(r, 2, 9), b = ri(r, 2, 6), c = ri(r, 2, 6); return { code: `print(${a} + ${b} * ${c})`, answer: a + b * c, wrong: [(a + b) * c, a * b + c, a + b + c], why: `Multiplication happens before addition: ${b} * ${c} = ${b * c}, then ${a} + ${b * c} = ${a + b * c}.` }; },
    (r) => { const b = ri(r, 2, 5), a = b * ri(r, 2, 6) + ri(r, 1, b - 1); const fl = Math.floor(a / b), m = a % b; return r() < 0.5 ? { code: `print(${a} // ${b})`, answer: fl, wrong: [m, fl + 1, py({ f: Math.round((a / b) * 10) / 10 })], why: `// is floor division: it divides and throws away the remainder. ${b} goes into ${a} ${fl} whole times.` } : { code: `print(${a} % ${b})`, answer: m, wrong: [fl, m + 1, 0], why: `% gives the remainder. ${a} = ${b} × ${fl} + ${m}, so the remainder is ${m}.` }; },
    (r) => { const b = ri(r, 2, 5), q = ri(r, 2, 6); return { code: `print(${b * q} / ${b})`, answer: `${q}.0`, wrong: [q, `${q}.5`, `${q + 1}.0`], why: `A single / always gives a float in Python, even when the division is exact, so it prints ${q}.0 rather than ${q}.` }; },
    (r) => { const s = pick(r, ['ab', 'la', 'ha', 'py', 'no']), n = ri(r, 2, 4); return { code: `print("${s}" * ${n})`, answer: s.repeat(n), wrong: [`${s}${n}`, Array(n).fill(s).join(' '), 'Error'], why: `Multiplying a string by a whole number repeats it: "${s}" ${n} times, with nothing in between.` }; },
    (r) => { const a = ri(r, 2, 9), b = ri(r, 2, 9); return r() < 0.5 ? { code: `print("${a}" + "${b}")`, answer: `${a}${b}`, wrong: [a + b, `${a} ${b}`, 'Error'], why: `The quotes make these strings, not numbers. + joins strings end to end, so you get ${a}${b}, not ${a + b}.` } : { code: `print(int("${a}") + ${b})`, answer: a + b, wrong: [`${a}${b}`, 'Error', a * b], why: `int("${a}") turns the string into the number ${a}, and then + adds: ${a + b}.` }; },
    (r) => { const a = ri(r, 2, 8), b = ri(r, 2, 6), c = ri(r, 2, 4); return { code: `x = ${a}\nx += ${b}\nx *= ${c}\nprint(x)`, answer: (a + b) * c, wrong: [a + b * c, a * c + b, a + b], why: `Follow x line by line: it starts at ${a}, += ${b} makes it ${a + b}, then *= ${c} makes it ${(a + b) * c}.` }; },
    (r) => { const w = pick(r, WORDS); return { code: `print(len("${w}"))`, answer: w.length, wrong: [w.length - 1, w.length + 1, w.length + 2], why: `len() counts the characters in a string. "${w}" has ${w.length}.` }; },
    (r) => { const a = ri(r, 2, 5), b = ri(r, 2, 3); return { code: `print(${a} ** ${b})`, answer: a ** b, wrong: [a * b, a + b, b ** a === a ** b ? a ** b + a : b ** a], why: `** is “to the power of”: ${a} multiplied by itself ${b} times is ${a ** b}. It is not ${a} × ${b}.` }; },
    (r) => { const a = ri(r, 3, 9), b = ri(r, 3, 9); const t = a > b; return { code: `a = ${a}\nb = ${b}\nprint(a > b)`, answer: py(t), wrong: [py(!t), a > b ? a : b, 'Error'], why: `A comparison gives a Boolean. ${a} > ${b} is ${py(t)}. Python writes them with a capital letter.` }; },
  ],
  2: [
    (r) => { const xs = sample(r, [3, 5, 8, 12, 14, 20, 21, 27, 30, 42], 5), i = pick(r, [0, 1, 2, 3, -1, -2]); const v = xs.at(i); return { code: `nums = ${py(xs)}\nprint(nums[${i}])`, answer: v, wrong: [xs.at(i + 1 >= 5 ? 0 : i + 1), xs.at(i - 1), xs.length], why: i < 0 ? `A negative index counts from the end: -1 is the last item, -2 the one before. nums[${i}] is ${v}.` : `Lists are numbered from 0, so nums[${i}] is item number ${i + 1}: ${v}.` }; },
    (r) => { const xs = sample(r, [2, 4, 6, 7, 9, 11, 13, 15], 5), a = ri(r, 0, 2), b = a + ri(r, 1, 2); return { code: `nums = ${py(xs)}\nprint(nums[${a}:${b}])`, answer: py(xs.slice(a, b)), wrong: [py(xs.slice(a, b + 1)), py(xs.slice(a + 1, b + 1)), py(xs.slice(a + 1, b + 2))], why: `A slice [${a}:${b}] starts at index ${a} and stops before index ${b}. The end index is not included.` }; },
    (r) => { const n = ri(r, 3, 6), a = ri(r, 0, 2); const total = (n * (n - 1)) / 2 - (a * (a - 1)) / 2; return { code: `total = 0\nfor i in range(${a ? `${a}, ` : ''}${n}):\n    total += i\nprint(total)`, answer: total, wrong: [total + n, n, total - a - 1 === total ? total + 1 : total + a + 1], why: `range(${a ? `${a}, ` : ''}${n}) gives ${Array.from({ length: n - a }, (_, i) => i + a).join(', ')}. It stops before ${n}. Those add up to ${total}.` }; },
    (r) => { const x = ri(r, 1, 99), hi = 70, lo = 30; const ans = x > hi ? 'high' : x > lo ? 'mid' : 'low'; return { code: `x = ${x}\nif x > ${hi}:\n    print("high")\nelif x > ${lo}:\n    print("mid")\nelse:\n    print("low")`, answer: ans, wrong: ['high', 'mid', 'low', 'high mid'].filter((o) => o !== ans), why: `Python tests the branches from the top and runs only the first one that is True. ${x} > ${hi} is ${py(x > hi)}${x > hi ? '' : `, ${x} > ${lo} is ${py(x > lo)}`}, so it prints ${ans}.` }; },
    (r) => { const w = pick(r, WORDS); const k = ri(r, 0, 3); const cases = [[`"${w}".upper()`, w.toUpperCase(), [w, w[0].toUpperCase() + w.slice(1), 'Error'], '.upper() returns the whole string in capitals.'], [`"${w}"[0]`, w[0], [w[1], w.at(-1), w], 'Index 0 is the first character of a string.'], [`"${w}"[-1]`, w.at(-1), [w[0], w.at(-2), 'Error'], 'Index -1 is the last character of a string.'], [`"${w}".replace("a", "o")`, w.replaceAll('a', 'o'), [w, w.replace('a', 'o') === w.replaceAll('a', 'o') ? `${w}o` : w.replace('a', 'o'), w.replaceAll('a', '')], '.replace() swaps every match, not just the first one.']]; const c = cases[k]; return { code: `print(${c[0]})`, answer: c[1], wrong: c[2], why: c[3] }; },
    (r) => { const w = pick(r, WORDS); const sub = r() < 0.5 ? w.slice(1, 3) : pick(r, ['zz', 'qu', w.slice(0, 2).toUpperCase()]); const t = w.includes(sub); return { code: `print("${sub}" in "${w}")`, answer: py(t), wrong: [py(!t), t ? w.indexOf(sub) : -1, 'Error'], why: `in asks whether one string appears inside another, and answers True or False. Capitals matter. Here it is ${py(t)}.` }; },
    (r) => { const a = ri(r, 1, 9), b = ri(r, 1, 9), c = r() < 0.5; const val = a > b && c; return { code: `a = ${a}\nb = ${b}\nok = ${py(c)}\nprint(a > b and ok)`, answer: py(val), wrong: [py(!val), a, 'Error'], why: `and is True only when both sides are True. a > b is ${py(a > b)} and ok is ${py(c)}, so the result is ${py(val)}.` }; },
    (r) => { const xs = sample(r, [4, 7, 9, 10, 15], 3), d = ri(r, 1, 9); return { code: `xs = ${py(xs)}\nxs.append(${d})\nprint(len(xs))`, answer: 4, wrong: [3, 5, d], why: '.append() adds one item to the end of the list, so three items become four.' }; },
    (r) => { const name = pick(r, NAMES), n = ri(r, 2, 5), m = ri(r, 2, 4); return { code: `name = "${name}"\nn = ${n}\nprint(f"{name} has {n * ${m}} cups")`, answer: `${name} has ${n * m} cups`, wrong: [`${name} has ${n} cups`, `{name} has {n * ${m}} cups`, `${name} has n * ${m} cups`], why: `In an f-string, Python works out whatever is inside each pair of curly braces and puts the result into the text: ${n} * ${m} = ${n * m}.` }; },
    (r) => { const a = ri(r, 2, 5), b = ri(r, 2, 4); return { code: `count = 0\nfor i in range(${a}):\n    for j in range(${b}):\n        count += 1\nprint(count)`, answer: a * b, wrong: [a + b, a, a * b - 1], why: `The inner loop runs ${b} times for each of the ${a} turns of the outer loop: ${a} × ${b} = ${a * b}.` }; },
  ],
  3: [
    (r) => { const a = ri(r, 2, 5), b = ri(r, 2, 5), c = ri(r, 1, 3); return { code: `prices = {"tea": ${a}, "latte": ${b}}\nprices["tea"] += ${c}\nprint(prices["tea"] + prices.get("mocha", 0))`, answer: a + c, wrong: [a + b + c, a, 'Error'], why: `prices["tea"] becomes ${a + c}. There is no "mocha" key, so .get("mocha", 0) returns the default 0 instead of an error.` }; },
    (r) => { const xs = sample(r, [1, 2, 3, 4, 5, 6, 7, 8], 5), t = ri(r, 3, 5), m = ri(r, 2, 3); const out = xs.filter((x) => x > t).map((x) => x * m); return { code: `nums = ${py(xs)}\nprint([x * ${m} for x in nums if x > ${t}])`, answer: py(out), wrong: [py(xs.map((x) => x * m)), py(xs.filter((x) => x > t)), py(xs.filter((x) => x >= t).map((x) => x * m))], why: `A list comprehension reads right to left: keep the x that pass the test (x > ${t}), then put x * ${m} in the new list.` }; },
    (r) => { const n = pick(r, [10, 17, 20, 33, 40, 64, 100]); let v = n, c = 0; while (v > 1) { v = Math.floor(v / 2); c++; } return { code: `n = ${n}\ncount = 0\nwhile n > 1:\n    n = n // 2\n    count += 1\nprint(count)`, answer: c, wrong: [c + 1, c - 1, v], why: `Halve ${n} and throw away the remainder until it reaches 1, counting each halving. That takes ${c} steps.` }; },
    (r) => { const a = ri(r, 2, 6), b = ri(r, 3, 5); return { code: `def scale(x, y=2):\n    return x * y\n\nprint(scale(${a}) + scale(${a}, ${b}))`, answer: a * 2 + a * b, wrong: [a * b * 2, a * 2 + a * 2, a + a * b], why: `y=2 is a default: it is used when the call leaves y out. scale(${a}) is ${a * 2} and scale(${a}, ${b}) is ${a * b}.` }; },
    (r) => { const w = pick(r, ['latte', 'mocha', 'bloom', 'query', 'table', 'petal']); return { code: `word = "${w}"\nprint(word[::-1])`, answer: [...w].reverse().join(''), wrong: [w, w.slice(1), w.slice(0, -1)], why: 'A slice with a step of -1 walks through the string backwards, so [::-1] reverses it.' }; },
    (r) => { const xs = sample(r, [3, 8, 11, 14, 19, 22, 25], 4); const s = [...xs].sort((x, y) => x - y); return r() < 0.5 ? { code: `nums = ${py(xs)}\nprint(sorted(nums)[1])`, answer: s[1], wrong: [xs[1] === s[1] ? s[2] : xs[1], s[0], s[3]], why: `sorted() returns a new list in order: ${py(s)}. Index 1 of that is ${s[1]}.` } : { code: `nums = ${py(xs)}\nprint(max(nums) - min(nums))`, answer: s[3] - s[0], wrong: [s[3], s[3] + s[0], xs[0] - xs[3]], why: `The largest is ${s[3]} and the smallest is ${s[0]}; the gap between them (the range) is ${s[3] - s[0]}.` }; },
    (r) => { const a = ri(r, 1, 4), b = ri(r, 5, 9), c = ri(r, 1, 9); return { code: `a = [${a}, ${b}]\nb = a\nb.append(${c})\nprint(len(a))`, answer: 3, wrong: [2, 4, c], why: 'b = a does not copy the list. Both names point at the same list, so appending through b changes what a sees too.' }; },
    (r) => { const a = ri(r, 2, 4), b = ri(r, 1, 9); return { code: `print("${a}" * 2 + "${b}")`, answer: `${a}${a}${b}`, wrong: [a * 2 + b, `${a * 2}${b}`, 'Error'], why: `These are strings. "${a}" * 2 repeats it to "${a}${a}", and + joins "${b}" on the end.` }; },
    (r) => { const xs = sample(r, [2, 3, 5, 6, 8, 9, 12], 5); const evens = xs.filter((x) => x % 2 === 0); return { code: `nums = ${py(xs)}\ntotal = 0\nfor n in nums:\n    if n % 2 == 0:\n        total += n\nprint(total)`, answer: evens.reduce((s, x) => s + x, 0), wrong: [xs.reduce((s, x) => s + x, 0), evens.length, xs.filter((x) => x % 2).reduce((s, x) => s + x, 0)], why: `n % 2 == 0 is True for even numbers. The evens here are ${evens.join(', ') || 'none'}, and they add up to ${evens.reduce((s, x) => s + x, 0)}.` }; },
  ],
};

// ================================================================ SQL
const MENU = [['Espresso', 'Coffee', 2.2, 40], ['Latte', 'Coffee', 3.4, 35], ['Mocha', 'Coffee', 3.8, 12], ['Green Tea', 'Tea', 2.6, 22], ['Chai', 'Tea', 3.1, 9], ['Earl Grey', 'Tea', 2.4, 30], ['Croissant', 'Bakery', 2.8, 14], ['Muffin', 'Bakery', 2.5, 0], ['Brownie', 'Bakery', 3.0, 18], ['Scone', 'Bakery', 2.3, 6]];
function tinyTable(r) { return { name: 'menu', columns: ['item', 'category', 'price', 'stock'], rows: sample(r, MENU, 6) }; }
const sqlQ = (r, t, sql, prompt, mk) => { const res = query(sql, { menu: t }); return { table: t, code: sql, lang: 'sql', prompt, ...mk(res) }; };
const SQL_CONCEPTS = [
  (r) => ({ prompt: 'Which clause filters rows before they are grouped?', answer: 'WHERE', wrong: ['HAVING', 'ORDER BY', 'LIMIT'], why: 'WHERE tests single rows before any grouping. HAVING tests the groups afterwards.' }),
  (r) => ({ prompt: 'Which clause can filter on COUNT(*)?', answer: 'HAVING', wrong: ['WHERE', 'GROUP BY', 'SELECT'], why: 'COUNT(*) only exists once the rows are grouped, and HAVING is the clause that runs after grouping.' }),
  (r) => ({ prompt: 'Which keyword removes repeated rows from a result?', answer: 'DISTINCT', wrong: ['UNIQUE', 'LIMIT', 'GROUP'], why: 'SELECT DISTINCT city returns each city once, however many rows it appears in.' }),
  (r) => ({ prompt: 'ORDER BY price sorts in which direction when you do not say?', answer: 'Smallest first (ASC)', wrong: ['Largest first (DESC)', 'The order the rows were added', 'Alphabetical by the first column'], why: 'Ascending is the default. Add DESC for largest first.' }),
  (r) => { const c = pick(r, ['Leeds', 'York', 'Hull']); return { prompt: 'Which of these is written correctly?', answer: `WHERE city = '${c}'`, wrong: [`WHERE city = ${c}`, `WHERE city == '${c}'`, `WHERE city is "${c}"`], why: 'Text values go in single quotes, and SQL compares with a single equals sign.' }; },
  (r) => ({ prompt: 'Which order are these clauses written in?', answer: 'SELECT, FROM, WHERE, GROUP BY, ORDER BY', wrong: ['SELECT, WHERE, FROM, GROUP BY, ORDER BY', 'FROM, SELECT, WHERE, ORDER BY, GROUP BY', 'SELECT, FROM, GROUP BY, WHERE, ORDER BY'], why: 'The order is fixed: SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT.' }),
  (r) => { const l = pick(r, ['C', 'M', 'S', 'B']); return { prompt: `Which pattern matches every item that starts with ${l}?`, answer: `LIKE '${l}%'`, wrong: [`LIKE '%${l}'`, `LIKE '${l}'`, `= '${l}*'`], why: `% stands for any run of characters. '${l}%' means ${l} followed by anything.` }; },
  (r) => ({ prompt: 'In a JOIN, what does the ON part do?', answer: 'Says which columns must match for two rows to be paired', wrong: ['Chooses which columns to show', 'Sorts the joined rows', 'Removes repeated rows'], why: 'ON orders.item = menu.item pairs each order with the menu row for the same item.' }),
  (r) => ({ prompt: 'How do you find rows where a value is missing?', answer: 'WHERE stock IS NULL', wrong: ['WHERE stock = NULL', "WHERE stock = ''", 'WHERE stock = 0'], why: 'NULL means unknown, and nothing equals unknown, so = NULL never matches. IS NULL is the test.' }),
  (r) => ({ prompt: 'Which join keeps menu items that nobody has ordered?', answer: 'menu LEFT JOIN orders', wrong: ['menu JOIN orders', 'menu INNER JOIN orders', 'menu AND orders'], why: 'A plain (inner) JOIN drops rows with no match. LEFT JOIN keeps every row of the left table and fills the gaps with NULL.' }),
  (r) => ({ prompt: 'A query has GROUP BY category. Which SELECT is allowed?', answer: 'SELECT category, AVG(price)', wrong: ['SELECT category, item', 'SELECT *', 'SELECT item, AVG(price)'], why: 'Each column must be in GROUP BY or inside a summary function. A group has many items, so item on its own has no single value.' }),
];
const SQLGEN = [
  (r) => { const t = tinyTable(r); const cat = pick(r, [...new Set(t.rows.map((x) => x[1]))]); return sqlQ(r, t, `SELECT * FROM menu\nWHERE category = '${cat}'`, 'How many rows does this query return?', (res) => ({ answer: res.rows.length, wrong: [res.rows.length + 1, 6, 6 - res.rows.length], why: `WHERE keeps only the rows whose category is ${cat}: ${res.rows.map((x) => x[0]).join(', ')}.` })); },
  (r) => { const t = tinyTable(r); const p = pick(r, [2.5, 2.8, 3.0]); const op = pick(r, ['>', '<', '>=']); return sqlQ(r, t, `SELECT item FROM menu\nWHERE price ${op} ${p}`, 'How many rows does this query return?', (res) => ({ answer: res.rows.length, wrong: [res.rows.length + 1, Math.max(0, res.rows.length - 1), 6 - res.rows.length], why: `Check each price against ${op} ${p}. ${res.rows.length ? `These pass: ${res.rows.map((x) => x[0]).join(', ')}.` : 'None pass.'}${op === '>=' ? ' >= includes the value itself.' : ''}` })); },
  (r) => { const t = tinyTable(r); const desc = r() < 0.5; const col = pick(r, ['price', 'stock']); const res0 = query(`SELECT ${col} FROM menu ORDER BY ${col} ${desc ? 'DESC' : ''}`, { menu: t }); if (res0.rows[0][0] === res0.rows[1][0]) return null; return sqlQ(r, t, `SELECT item FROM menu\nORDER BY ${col}${desc ? ' DESC' : ''}\nLIMIT 1`, 'Which item does this query return?', (res) => ({ answer: res.rows[0][0], wrong: sample(r, t.rows.map((x) => x[0]).filter((x) => x !== res.rows[0][0]), 3), why: `ORDER BY ${col}${desc ? ' DESC puts the largest first' : ' puts the smallest first'}, and LIMIT 1 keeps only the top row.` })); },
  (r) => { const t = tinyTable(r); const fn = pick(r, ['SUM', 'MAX', 'MIN']); return sqlQ(r, t, `SELECT ${fn}(stock) FROM menu`, 'What number does this query return?', (res) => { const s = t.rows.map((x) => x[3]); const v = res.rows[0][0]; return { answer: v, wrong: [fn === 'SUM' ? v - s[0] : Math.max(...s) === v ? Math.min(...s) : Math.max(...s), s.length, fn === 'SUM' ? v + 10 : s.reduce((a, b) => a + b, 0)], why: `${fn}() looks at the whole stock column (${s.join(', ')}) and returns ${fn === 'SUM' ? 'the total' : fn === 'MAX' ? 'the largest' : 'the smallest'}: ${v}.` }; }); },
  (r) => { const t = tinyTable(r); return sqlQ(r, t, 'SELECT category, COUNT(*)\nFROM menu\nGROUP BY category', 'How many rows does this query return?', (res) => ({ answer: res.rows.length, wrong: [6, res.rows.length + 1, 1], why: `GROUP BY gives one row per different category. This table has ${res.rows.length}: ${res.rows.map((x) => x[0]).join(', ')}.` })); },
  (r) => { const t = tinyTable(r); const cats = [...new Set(t.rows.map((x) => x[1]))]; if (cats.length < 2) return null; const [a, b] = sample(r, cats, 2); const p = pick(r, [2.5, 3.0]); return sqlQ(r, t, `SELECT item FROM menu\nWHERE category = '${a}'\n   OR category = '${b}' AND price > ${p}`, 'How many rows does this query return?', (res) => { const naive = t.rows.filter((x) => (x[1] === a || x[1] === b) && x[2] > p).length; return { answer: res.rows.length, wrong: [naive === res.rows.length ? naive + 1 : naive, res.rows.length - 1 < 0 ? 7 : res.rows.length - 1, 6], why: `AND is worked out before OR. So this keeps every ${a} row, plus the ${b} rows priced above ${p}.` }; }); },
  (r) => { const t = tinyTable(r); return sqlQ(r, t, 'SELECT COUNT(*) FROM menu\nWHERE stock < 10', 'What number does this query return?', (res) => ({ answer: res.rows[0][0], wrong: [res.rows[0][0] + 1, 6, 6 - res.rows[0][0]], why: `WHERE runs first and keeps the rows with stock below 10. COUNT(*) then counts them: ${res.rows[0][0]}.` })); },
];

// ================================================================ HTML and CSS
const TAGS = [['the main heading of a page', '<h1>'], ['a paragraph', '<p>'], ['a link', '<a>'], ['a picture', '<img>'], ['a bulleted list', '<ul>'], ['a numbered list', '<ol>'], ['one item in a list', '<li>'], ['a button', '<button>'], ['a line break', '<br>'], ['the navigation links', '<nav>'], ['important text', '<strong>'], ['a row in a table', '<tr>']];
const ATTRS = [['the address a link goes to', 'href'], ['the file an image shows', 'src'], ['the description of an image for people who cannot see it', 'alt'], ['a name that CSS selects with a dot', 'class'], ['a name that must be unique on the page', 'id']];
const COLORS = ['red', 'blue', 'green', 'orange', 'purple', 'teal'];
const WEB = [
  (r) => { const [what, tag] = pick(r, TAGS); return { prompt: `Which tag makes ${what}?`, answer: tag, wrong: sample(r, TAGS.map((t) => t[1]).filter((t) => t !== tag), 3), why: `${tag} is ${what}.` }; },
  (r) => { const [what, at] = pick(r, ATTRS); return { prompt: `Which attribute holds ${what}?`, answer: at, wrong: sample(r, [...ATTRS.map((a) => a[1]), 'link', 'name', 'title'].filter((a) => a !== at), 3), why: `${at} holds ${what}.` }; },
  (r) => { const n = ri(r, 2, 5), items = sample(r, ['Latte', 'Mocha', 'Chai', 'Scone', 'Muffin', 'Espresso'], n); const extra = r() < 0.5; return { prompt: 'How many list items will the browser show?', lang: 'html', code: `<ul>\n${items.map((i) => `  <li>${i}</li>`).join('\n')}\n</ul>${extra ? '\n<p>Open daily</p>' : ''}`, answer: n, wrong: [n + 1, n - 1, n + 2], why: `Each <li> is one item. There are ${n}.${extra ? ' The <p> is outside the list.' : ''}` }; },
  (r) => { const a = pick(r, ['strong', 'em']); return { prompt: 'Which line is nested correctly?', answer: `<p>Try the <${a}>new</${a}> latte</p>`, wrong: [`<p>Try the <${a}>new</p></${a}> latte`, `<p>Try the <${a}>new<${a}> latte</p>`, `<p>Try the <${a}>new</${a}> latte<p>`], why: 'Tags close in the reverse of the order they opened, and a closing tag has a slash.' }; },
  (r) => { const [a, b, c] = sample(r, COLORS, 3); const hasId = r() < 0.5, hasClass = r() < 0.7; const ans = hasId ? c : hasClass ? b : a; return { prompt: 'What colour is the paragraph’s text?', lang: 'css', code: `p { color: ${a}; }\n.note { color: ${b}; }\n#main { color: ${c}; }\n\n<p${hasClass ? ' class="note"' : ''}${hasId ? ' id="main"' : ''}>Hello</p>`, answer: ans, wrong: [a, b, c, 'black'].filter((x) => x !== ans), why: `When rules disagree, the more specific selector wins: an id (#) beats a class (.), and a class beats a tag name. Here that is ${ans}.` }; },
  (r) => { const [a, b] = sample(r, COLORS, 2); return { prompt: 'What colour is the heading?', lang: 'css', code: `h1 { color: ${a}; }\nh1 { color: ${b}; }`, answer: b, wrong: [a, 'black', 'Both: it is striped'], why: 'When two rules have the same selector, the one written later wins.' }; },
  (r) => { const n = ri(r, 1, 3), m = ri(r, 1, 3); const lines = shuffle(r, [...Array(n).fill('<li class="hot">Latte</li>'), ...Array(m).fill('<li>Scone</li>')]); return { prompt: 'How many elements does the selector .hot match?', lang: 'html', code: `<ul>\n${lines.map((l) => `  ${l}`).join('\n')}\n</ul>`, answer: n, wrong: [n + m, m === n ? n + 1 : m, 0], why: `.hot selects elements whose class is hot. ${n} of the ${n + m} items have it.` }; },
  (r) => { const isId = r() < 0.5, name = pick(r, ['menu', 'hero', 'price', 'card']); return { prompt: `Which selector matches <div ${isId ? 'id' : 'class'}="${name}">?`, answer: `${isId ? '#' : '.'}${name}`, wrong: [`${isId ? '.' : '#'}${name}`, name, `<${name}>`], why: `A dot selects a class and a hash selects an id. A bare word would look for a tag called <${name}>.` }; },
  (r) => { const w = pick(r, [100, 120, 200]), p = pick(r, [5, 10, 20]), b = pick(r, [1, 2, 5]); return { prompt: 'How wide is the box on screen, edge to edge?', lang: 'css', code: `.card {\n  width: ${w}px;\n  padding: ${p}px;\n  border: ${b}px solid black;\n}`, answer: `${w + 2 * p + 2 * b}px`, wrong: [`${w}px`, `${w + p + b}px`, `${w + 2 * p}px`], why: `By default width is the content only. Padding and border are added on both sides: ${w} + 2 × ${p} + 2 × ${b} = ${w + 2 * p + 2 * b}px.` }; },
  (r) => ({ prompt: 'Which of these tags has no closing tag?', answer: pick(r, ['<img>', '<br>', '<input>']), wrong: sample(r, ['<p>', '<a>', '<li>', '<div>', '<h1>'], 3), why: 'Elements that cannot hold content, such as <img>, <br> and <input>, are written as a single tag.' }),
  (r) => { const bad = pick(r, [['<a href="menu.html>Menu</a>', 'The href value has an opening quote but no closing quote.'], ['<h2>Drinks</h3>', 'The closing tag does not match the opening tag.'], ['<img src="cup.png" alt="A cup"></img>', '<img> has no closing tag.'], ['<p>Open daily<p>', 'The closing tag is missing its slash.']]); return { prompt: 'Which line has a mistake?', answer: bad[0], wrong: ['<a href="menu.html">Menu</a>', '<h2>Drinks</h2>', '<p>Open daily</p>'], why: bad[1] }; },
  (r) => ({ prompt: 'Which declaration lays an element’s children out side by side in a row?', answer: 'display: flex;', wrong: ['display: row;', 'float: side;', 'align: horizontal;'], why: 'display: flex makes the element a flex container, and its children line up in a row.' }),
  (r) => { const px = pick(r, [8, 12, 16, 24]); return { prompt: 'Which rule adds space inside the box, between its border and its content?', answer: `padding: ${px}px;`, wrong: [`margin: ${px}px;`, `border: ${px}px;`, `spacing: ${px}px;`], why: 'Padding is inside the border; margin is outside it. There is no CSS property called spacing.' }; },
];

export const TRACKS = { python: 'Python', sql: 'SQL', web: 'HTML & CSS', mixed: 'Mixed' };

// The idea each maker tests, in the same order as the makers above. Bug Battle keeps score by topic.
const tag = (track, list, topics) => list.map((gen, i) => ({ track, gen, topic: topics[i] }));
const POOL = {
  py1: tag('python', PY[1], ['Operator order', 'Floor division and remainder', 'Division gives a float', 'Repeating text', 'Text versus numbers', 'Updating a variable', 'len()', 'Powers', 'Comparisons']),
  py2: tag('python', PY[2], ['List positions', 'Slices', 'for and range()', 'if / elif / else', 'String methods', 'in', 'and / or', 'append()', 'f-strings', 'Nested loops']),
  py3: tag('python', PY[3], ['Dictionaries', 'List comprehensions', 'while loops', 'Functions and defaults', 'Reversing with a slice', 'sorted, max and min', 'Two names, one list', 'Text versus numbers', 'A test inside a loop']),
  sqlgen: tag('sql', SQLGEN, ['WHERE', 'WHERE', 'ORDER BY and LIMIT', 'Summary functions', 'GROUP BY', 'AND before OR', 'COUNT with WHERE']),
  sqlc: tag('sql', SQL_CONCEPTS, ['WHERE versus HAVING', 'WHERE versus HAVING', 'DISTINCT', 'ORDER BY and LIMIT', 'Quotes and =', 'Clause order', 'LIKE', 'JOIN', 'NULL', 'LEFT JOIN', 'GROUP BY']),
  web: tag('web', WEB, ['HTML tags', 'Attributes', 'Lists', 'Nesting', 'CSS specificity', 'Which rule wins', 'Class selectors', 'Selectors', 'The box model', 'Tags with no closing tag', 'Spotting mistakes', 'Flexbox', 'The box model']),
};
const EVERY = Object.values(POOL).flat();

/** One question. tier 1 (first ideas) to 3 (harder). `focus` is a list of "track|topic" keys to favour. */
export function makeQuestion(track, tier, rand, focus = null) {
  for (let tries = 0; tries < 30; tries++) {
    let pool = null;
    if (focus && focus.length && rand() < 0.75) { const [ft, topic] = pick(rand, focus).split('|'); pool = EVERY.filter((x) => x.track === ft && x.topic === topic); if (!pool.length) pool = null; }
    if (!pool) {
      const t = track === 'mixed' ? pick(rand, ['python', 'python', 'sql', 'web']) : track;
      const lv = Math.min(3, Math.max(1, tier));
      pool = t === 'python' ? (lv === 1 ? POOL.py1 : lv === 2 ? [...POOL.py2, ...POOL.py2, ...POOL.py1] : [...POOL.py3, ...POOL.py3, ...POOL.py2])
        : t === 'sql' ? (tier > 1 || rand() < 0.6 ? [...POOL.sqlgen, ...POOL.sqlc] : POOL.sqlc) : POOL.web;
    }
    const maker = pick(rand, pool);
    const q = maker.gen(rand);
    if (!q) continue;
    const done = finish(rand, { ...(maker.track === 'python' ? { lang: 'python' } : {}), ...q, track: maker.track });
    if (done.options.length === 4 && done.answer >= 0) return { ...done, topic: maker.topic };
  }
  throw new Error(`no question for ${track}`);
}
export const QUESTION_COUNTS = { python: PY[1].length + PY[2].length + PY[3].length, sql: SQLGEN.length + SQL_CONCEPTS.length, web: WEB.length };

// ================================================================ Syntax Catcher rounds
const B = (t, why) => ({ t, why });
export const CATCH_ROUNDS = [
  { rule: 'Catch the Python keywords', lang: 'Python', make: () => ({
    good: ['def', 'for', 'while', 'if', 'elif', 'else', 'return', 'import', 'in', 'not', 'and', 'or', 'True', 'False', 'None', 'class', 'break', 'pass'],
    bad: [B('function', 'Python defines functions with def.'), B('then', 'Python has no then: the colon does that job.'), B('elseif', 'Python spells it elif.'), B('foreach', 'Python loops with for … in.'), B('true', 'Python writes True with a capital T.'), B('null', 'Python’s “nothing” value is None.'), B('var', 'Python needs no keyword to make a variable.'), B('end', 'Python ends a block by un-indenting, not with end.'), B('switch', 'Python uses if / elif (or match), not switch.'), B('false', 'Python writes False with a capital F.'), B('&&', 'Python writes and, not &&.')] }) },
  { rule: 'Catch the SQL keywords', lang: 'SQL', make: () => ({
    good: ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'JOIN', 'HAVING', 'LIMIT', 'DISTINCT', 'AND', 'LIKE', 'ON', 'AS', 'DESC'],
    bad: [B('SORT BY', 'SQL sorts with ORDER BY.'), B('FILTER', 'SQL filters rows with WHERE.'), B('PICK', 'SQL chooses columns with SELECT.'), B('GRAB', 'SQL chooses columns with SELECT.'), B('COMBINE', 'SQL puts tables together with JOIN.'), B('LOOKUP', 'LOOKUP is a spreadsheet idea. SQL uses JOIN.'), B('WHERES', 'The clause is WHERE.'), B('TOP DOWN', 'Largest-first is ORDER BY … DESC.'), B('IF ONLY', 'Conditions go in WHERE.'), B('==', 'SQL compares with a single =.')] }) },
  { rule: 'Catch the real HTML tags', lang: 'HTML', make: () => ({
    good: ['<p>', '<h1>', '<a>', '<img>', '<ul>', '<li>', '<div>', '<span>', '<table>', '<button>', '<form>', '<input>', '<nav>', '<h3>'],
    bad: [B('<h7>', 'Headings only go from <h1> to <h6>.'), B('<para>', 'A paragraph is <p>.'), B('<list>', 'Lists are <ul> or <ol>.'), B('<pic>', 'A picture is <img>.'), B('<bold>', 'Important text is <strong>.'), B('<click>', 'A clickable control is <button>.'), B('<row>', 'A table row is <tr>.'), B('<heading>', 'Headings are <h1> to <h6>.'), B('<photo>', 'A picture is <img>.'), B('<linkto>', 'A link is <a>.')] }) },
  { rule: 'Catch what is True in Python', lang: 'Python', make: (r) => {
    const good = ['not False', '"a" in "cat"', 'len("hi") == 2', '5 == 5.0', '"b" > "a"', 'True or False', '3 != 4'];
    const bad = [B('not True', 'not True is False.'), B('"A" == "a"', 'Capitals matter: "A" and "a" are different strings.'), B('1 == "1"', 'A number never equals a string.'), B('0.1 + 0.2 == 0.3', 'Floats are stored approximately: 0.1 + 0.2 is 0.30000000000000004.'), B('True and False', 'and needs both sides to be True.'), B('bool("")', 'An empty string counts as False.'), B('bool(0)', 'Zero counts as False.')];
    for (let i = 0; i < 8; i++) {
      const a = ri(r, 2, 12), b = ri(r, 2, 12), k = ri(r, 0, 3);
      const [text, val, why] = k === 0 ? [`${a} > ${b}`, a > b, `${a} is not greater than ${b}.`] : k === 1 ? [`${a} % 2 == 0`, a % 2 === 0, `${a} is odd, so ${a} % 2 is 1.`] : k === 2 ? [`${a} // ${b} == ${Math.floor(a / b) + (i % 2)}`, i % 2 === 0, `${a} // ${b} is ${Math.floor(a / b)}.`] : [`${a} <= ${b}`, a <= b, `${a} is greater than ${b}.`];
      if (val) good.push(text); else bad.push(B(text, why));
    }
    return { good, bad };
  } },
  { rule: 'Catch the SQL summary functions', lang: 'SQL', make: () => ({
    good: ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'],
    bad: [B('UPPER', 'UPPER changes one value at a time. It does not summarise many rows.'), B('ROUND', 'ROUND works on one value at a time.'), B('LENGTH', 'LENGTH works on one value at a time.'), B('WHERE', 'WHERE is a clause, not a function.'), B('LOWER', 'LOWER works on one value at a time.'), B('LIKE', 'LIKE is a pattern test.'), B('MEAN', 'SQL calls the average AVG.'), B('ADD', 'SQL totals a column with SUM.')] }) },
  { rule: 'Catch the valid Python variable names', lang: 'Python', make: () => ({
    good: ['total_sales', 'x1', '_tmp', 'userName', 'price2', 'is_open', 'n', 'MAX_SIZE'],
    bad: [B('2fast', 'A name cannot start with a digit.'), B('my-var', 'A hyphen means minus. Use an underscore.'), B('class', 'class is a keyword.'), B('for', 'for is a keyword.'), B('total sales', 'Names cannot contain spaces.'), B('$cost', 'Names can only use letters, digits and underscores.'), B('first.name', 'A dot means “attribute of”. Use an underscore.'), B('return', 'return is a keyword.')] }) },
  { rule: 'Catch the tags with NO closing tag', lang: 'HTML', make: () => ({
    good: ['<br>', '<img>', '<hr>', '<input>', '<meta>', '<link>'],
    bad: ['<p>', '<div>', '<a>', '<li>', '<span>', '<h1>', '<ul>', '<button>'].map((t) => B(t, `${t} holds content, so it needs ${t.replace('<', '</')}.`)) }) },
  { rule: 'Catch the real CSS properties', lang: 'CSS', make: () => ({
    good: ['color', 'font-size', 'margin', 'padding', 'border', 'background', 'display', 'width', 'text-align'],
    bad: [B('text-colour', 'Text colour is set with color.'), B('colour', 'CSS uses the American spelling: color.'), B('size', 'Text size is font-size; box size is width and height.'), B('align', 'Text is aligned with text-align.'), B('spacing', 'Space is added with margin or padding.'), B('bg', 'The property is background.'), B('font-colour', 'Text colour is set with color.'), B('thickness', 'Line thickness is border-width.')] }) },
  { rule: 'Catch the Python strings', lang: 'Python', make: () => ({
    good: ['"42"', "'hi'", 'str(5)', '"True"', '"3.0"', "''", 'f"{n}"'],
    bad: [B('42', '42 with no quotes is an integer.'), B('3.0', '3.0 with no quotes is a float.'), B('True', 'True with no quotes is a Boolean.'), B('[1, 2]', 'Square brackets make a list.'), B('None', 'None is its own type.'), B('int("7")', 'int() turns the string into a number.'), B('len("hi")', 'len() returns a number.')] }) },
];
