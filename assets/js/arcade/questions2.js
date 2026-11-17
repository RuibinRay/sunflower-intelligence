// questions2.js — question makers for the three later topics: pandas, spreadsheet formulas and JavaScript.
// As in questions.js, no answer is typed in by hand where it can be worked out: pandas answers come from
// running the code on minipandas, formula answers from the site's spreadsheet engine, and JavaScript answers
// from running the snippet. Each maker returns { prompt, code, lang, table, answer, wrong, why } or null to skip.
//   PANDAS_Q, SHEET_Q, JS_Q: [{ gen, topic }]     CATCH2: more rounds for Syntax Catcher
import { parse, exec } from './minipy.js?v=40';
import { pandasModule } from './minipandas.js?v=40';
import { jsCore } from './levels2.js?v=40';
import { Sheet, evaluate, display, shiftFormula } from '../core/sheet.js?v=40';

const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const pick = (r, list) => list[Math.floor(r() * list.length)];
const sample = (r, list, n) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };
const Q = (topic, gen) => ({ topic, gen });

// ================================================================ pandas
const MENU = [['Espresso', 'Coffee', 2.2, 40], ['Latte', 'Coffee', 3.4, 35], ['Mocha', 'Coffee', 3.8, 12], ['Green Tea', 'Tea', 2.6, 22], ['Chai', 'Tea', 3.1, 9], ['Earl Grey', 'Tea', 2.4, 30], ['Croissant', 'Bakery', 2.8, 14], ['Muffin', 'Bakery', 2.5, 0], ['Brownie', 'Bakery', 3.0, 18], ['Scone', 'Bakery', 2.3, 6]];
const LOAD = 'df = pd.read_csv("menu.csv")\n';
const menu = (r) => ({ name: 'menu.csv', columns: ['item', 'category', 'price', 'stock'], rows: sample(r, MENU, 5) });
/** What a few lines of pandas print, on the table given. */
export function runPandas(t, code) {
  const prints = [];
  exec(parse(`import pandas as pd\n${code}`), { actions: {}, modules: { pandas: pandasModule({ 'menu.csv': { columns: t.columns, rows: t.rows, float: ['price'] } }) } }, (s) => { if (s.action === 'print') prints.push(s.args[0]); }, { maxSteps: 800 });
  return prints.join('\n');
}
const pdQ = (r, t, body, mk) => { const code = LOAD + body; return { table: t, code, lang: 'python', ...mk(runPandas(t, code)) }; };
const col = (t, name) => t.rows.map((row) => row[t.columns.indexOf(name)]);

export const PANDAS_Q = [
  Q('shape', (r) => { const t = menu(r); t.rows = t.rows.slice(0, ri(r, 3, 5)); const n = t.rows.length; return pdQ(r, t, 'print(df.shape)', (a) => ({ answer: a, wrong: [`(4, ${n})`, String(n), String(n * 4)], why: `shape is (rows, columns): ${n} rows and 4 columns.` })); }),
  Q('Column summaries', (r) => { const t = menu(r), f = pick(r, ['sum', 'max', 'min']), s = col(t, 'stock'); return pdQ(r, t, `print(df["stock"].${f}())`, (a) => ({ answer: a, wrong: [s.reduce((x, y) => x + y, 0), Math.max(...s), Math.min(...s), s.length], why: `df["stock"] is the stock column, and .${f}() gives its ${f === 'sum' ? 'total' : f === 'max' ? 'largest value' : 'smallest value'}.` })); }),
  Q('Column summaries', (r) => { const t = menu(r), s = col(t, 'stock'), total = s.reduce((x, y) => x + y, 0); if (total % s.length) return null; return pdQ(r, t, 'print(df["stock"].mean())', (a) => ({ answer: a, wrong: [String(total / s.length), String(total), `${total}.0`], why: '.mean() is the total divided by the number of rows, and it always gives a decimal number.' })); }),
  Q('Filtering rows', (r) => { const t = menu(r), cut = pick(r, [2.5, 2.8, 3.0]), n = col(t, 'price').filter((p) => p > cut).length; return pdQ(r, t, `big = df[df["price"] > ${cut === 3 ? '3.0' : cut}]\nprint(len(big))`, (a) => ({ answer: a, wrong: [5 - n, 5, n + 1], why: `The test keeps the rows whose price is above ${cut}. ${n} row${n === 1 ? ' is' : 's are'} left.` })); }),
  Q('Filtering rows', (r) => { const t = menu(r), cat = pick(r, col(t, 'category')), s = col(t, 'stock'); return pdQ(r, t, `some = df[df["category"] == "${cat}"]\nprint(some["stock"].sum())`, (a) => ({ answer: a, wrong: [s.reduce((x, y) => x + y, 0), col(t, 'category').filter((c) => c === cat).length, Math.max(...s)], why: `First only the ${cat} rows are kept, then their stock is added up.` })); }),
  Q('Combining filters with &', (r) => { const t = menu(r), cat = pick(r, col(t, 'category')), cut = pick(r, [10, 15, 20]); return pdQ(r, t, `both = df[(df["category"] == "${cat}") & (df["stock"] > ${cut})]\nprint(len(both))`, (a) => ({ answer: a, wrong: [col(t, 'category').filter((c) => c === cat).length, col(t, 'stock').filter((s) => s > cut).length, 5], why: `& keeps a row only when both tests are True: ${cat}, and stock above ${cut}.` })); }),
  Q('sort_values', (r) => { const t = menu(r), desc = r() < 0.5, by = pick(r, ['price', 'stock']), v = col(t, by); if (new Set(v).size < v.length) return null; return pdQ(r, t, `ordered = df.sort_values("${by}"${desc ? ', ascending=False' : ''})\nprint(ordered["item"].tolist()[0])`, (a) => ({ answer: a, wrong: sample(r, col(t, 'item').filter((x) => x !== a), 3), why: desc ? `ascending=False puts the biggest ${by} first.` : `sort_values puts the smallest ${by} first unless told otherwise.` })); }),
  Q('value_counts', (r) => { const t = menu(r), cats = col(t, 'category'), cat = pick(r, cats); return pdQ(r, t, `counts = df["category"].value_counts()\nprint(counts["${cat}"])`, (a) => ({ answer: a, wrong: [new Set(cats).size, 5, Number(a) + 1], why: `value_counts() counts the rows for each category. ${cat} appears ${a} time${a === '1' ? '' : 's'}.` })); }),
  Q('groupby', (r) => { const t = menu(r), cats = col(t, 'category'), cat = pick(r, cats), f = pick(r, ['sum', 'max']); return pdQ(r, t, `by_cat = df.groupby("category")["stock"].${f}()\nprint(by_cat["${cat}"])`, (a) => ({ answer: a, wrong: [col(t, 'stock').reduce((x, y) => x + y, 0), cats.filter((c) => c === cat).length, Math.max(...col(t, 'stock'))], why: `groupby makes one group per category, and .${f}() is taken inside each group. This asks for the ${cat} group.` })); }),
  Q('groupby', (r) => { const t = menu(r); return pdQ(r, t, 'print(len(df.groupby("category")["stock"].sum()))', (a) => ({ answer: a, wrong: [5, 4, 1], why: 'The answer has one row per group, so its length is the number of different categories.' })); }),
  Q('Making a new column', (r) => { const t = menu(r), k = pick(r, [2, 3, 10]); return pdQ(r, t, `df["extra"] = df["stock"] * ${k}\nprint(df["extra"].max())`, (a) => ({ answer: a, wrong: [Math.max(...col(t, 'stock')), col(t, 'stock').reduce((x, y) => x + y, 0) * k, Number(a) + k], why: `Every stock value is multiplied by ${k}, row by row, and the largest result is printed.` })); }),
  Q('Picking a column', (r) => pick(r, [
    { prompt: 'In pandas, what is one column of a DataFrame called?', answer: 'A Series', wrong: ['A list', 'A row', 'A cell'], why: 'df["price"] gives a Series: one column with its row labels.' },
    { prompt: 'Which line picks the price column of df?', answer: 'df["price"]', wrong: ['df(price)', 'df.price()', 'df{price}'], why: 'A column is picked by its name, in quotes, inside square brackets.' },
    { prompt: 'Which line reads a CSV file into a DataFrame?', answer: 'pd.read_csv("orders.csv")', wrong: ['pd.open("orders.csv")', 'pd.load_csv("orders.csv")', 'read("orders.csv")'], why: 'pandas reads a CSV file with pd.read_csv().' },
  ])),
  Q('Filtering rows', (r) => pick(r, [
    { prompt: 'Which line keeps only the rows where qty is above 2?', answer: 'df[df["qty"] > 2]', wrong: ['df["qty" > 2]', 'df.where(qty > 2)', 'df[qty > 2]'], why: 'The test df["qty"] > 2 marks each row True or False; df[ ] keeps the True rows.' },
    { prompt: 'What does df["qty"] > 2 give, on its own?', answer: 'A column of True and False', wrong: ['The rows above 2', 'How many rows are above 2', 'An error'], why: 'A test on a column answers for every row at once. Put it in df[ ] to keep the rows.' },
  ])),
  Q('Missing values (NaN)', (r) => pick(r, [
    { prompt: 'In pandas, what does NaN in a cell mean?', answer: 'The value is missing', wrong: ['The value is zero', 'The value is text', 'The column is hidden'], why: 'NaN marks a gap in the data. Summaries such as .mean() skip it.' },
    { prompt: 'Which line fills the gaps in the tip column with 0?', answer: 'df["tip"].fillna(0)', wrong: ['df["tip"].dropna(0)', 'df["tip"].replace(0)', 'df["tip"].isna(0)'], why: '.fillna(value) fills every missing cell with that value.' },
    { prompt: 'A column holds 2, NaN and 4. What is its .mean()?', answer: '3.0', wrong: ['2.0', 'NaN', '6.0'], why: 'pandas skips the NaN and averages 2 and 4.' },
  ])),
  Q('merge', (r) => pick(r, [
    { prompt: 'Which pandas command does the job of a SQL JOIN?', answer: 'merge', wrong: ['groupby', 'concat_rows', 'sort_values'], why: 'orders.merge(menu, on="drink") lines two tables up on a shared column.' },
    { prompt: 'orders.merge(menu, on="drink"): what must both tables have?', answer: 'A column called drink', wrong: ['The same number of rows', 'The same columns', 'The same row order'], why: 'merge matches rows by the shared column. Sizes and order do not matter.' },
  ])),
];

// ================================================================ spreadsheet formulas
const DRINKS = ['latte', 'mocha', 'chai', 'tea', 'espresso', 'scone'];
/** A small sheet: A drink, B price (whole numbers), C cups, rows 2 to 5. Returns { table, sheet, val }. */
function grid(r, { unique = false, repeat = false } = {}) {
  const names = unique ? sample(r, DRINKS, 4) : Array.from({ length: 4 }, () => pick(r, DRINKS.slice(0, 4)));
  if (repeat) { names[0] = 'latte'; names[ri(r, 1, 3)] = 'latte'; }
  const rows = names.map((d) => [d, ri(r, 2, 6), ri(r, 1, 6)]);
  const cells = { A1: 'Drink', B1: 'Price', C1: 'Cups' };
  rows.forEach(([d, p, c], i) => { cells[`A${i + 2}`] = d; cells[`B${i + 2}`] = p; cells[`C${i + 2}`] = c; });
  const sheet = new Sheet({ cells });
  return { rows, sheet, val: (f) => display(evaluate(f, sheet)), table: { name: 'sheet', columns: ['', 'A', 'B', 'C'], rows: [['1', 'Drink', 'Price', 'Cups'], ...rows.map((x, i) => [String(i + 2), ...x])] } };
}
const fQ = (g, formula, mk, prompt = 'What does this formula show?') => ({ table: g.table, code: formula, lang: 'formula', prompt, ...mk(g.val(formula)) });

export const SHEET_Q = [
  Q('Formulas and cell references', (r) => { const g = grid(r), n = ri(r, 2, 5); return fQ(g, `=B${n}*C${n}`, (a) => ({ answer: a, wrong: [g.val(`=B${n}+C${n}`), g.val(`=B${n}`), g.val(`=B${n === 5 ? 4 : n + 1}*C${n}`)], why: `B${n} is column B, row ${n}; C${n} is beside it. The star multiplies them.` })); }),
  Q('SUM and ranges', (r) => { const g = grid(r), c = pick(r, ['B', 'C']); return fQ(g, `=SUM(${c}2:${c}5)`, (a) => ({ answer: a, wrong: [g.val(`=${c}2+${c}5`), g.val(`=SUM(${c}2:${c}4)`), g.val(`=MAX(${c}2:${c}5)`)], why: `${c}2:${c}5 is all four cells from ${c}2 down to ${c}5, and SUM adds them.` })); }),
  Q('AVERAGE, MIN and MAX', (r) => { const g = grid(r), f = pick(r, ['AVERAGE', 'MAX', 'MIN']), c = pick(r, ['B', 'C']); return fQ(g, `=${f}(${c}2:${c}5)`, (a) => ({ answer: a, wrong: ['AVERAGE', 'MAX', 'MIN', 'SUM'].filter((x) => x !== f).map((x) => g.val(`=${x}(${c}2:${c}5)`)), why: `${f} gives the ${f === 'AVERAGE' ? 'mean' : f === 'MAX' ? 'largest value' : 'smallest value'} of the range.` })); }),
  Q('AVERAGE, MIN and MAX', (r) => { const g = grid(r); return fQ(g, '=MAX(C2:C5)-MIN(C2:C5)', (a) => ({ answer: a, wrong: [g.val('=MAX(C2:C5)'), g.val('=MAX(C2:C5)+MIN(C2:C5)'), g.val('=SUM(C2:C5)')], why: 'Each function is worked out first, then the smallest is taken from the largest.' })); }),
  Q('IF', (r) => { const g = grid(r), n = ri(r, 2, 5), k = ri(r, 2, 5), op = pick(r, ['>=', '>']); return fQ(g, `=IF(C${n}${op}${k},"Bulk","Single")`, (a) => ({ answer: a, wrong: [a === 'Bulk' ? 'Single' : 'Bulk', 'TRUE', g.val(`=C${n}`)], why: `C${n} is ${g.val(`=C${n}`)}. The test C${n}${op}${k} is ${g.val(`=C${n}${op}${k}`) === 'TRUE' ? 'true, so the first answer is shown' : 'false, so the second answer is shown'}.` })); }),
  Q('COUNTIF', (r) => { const g = grid(r), k = ri(r, 2, 4); return fQ(g, `=COUNTIF(C2:C5,">=${k}")`, (a) => ({ answer: a, wrong: [g.val(`=COUNTIF(C2:C5,">${k}")`), g.val(`=SUMIF(C2:C5,">=${k}")`), 4], why: `COUNTIF counts the cells in C2:C5 that are ${k} or more.` })); }),
  Q('COUNTIF', (r) => { const g = grid(r, { repeat: true }); return fQ(g, '=COUNTIF(A2:A5,"latte")', (a) => ({ answer: a, wrong: [g.val('=SUMIF(A2:A5,"latte",C2:C5)'), 4, 1], why: 'COUNTIF counts how many cells in A2:A5 hold latte.' })); }),
  Q('SUMIF', (r) => { const g = grid(r, { repeat: true }); return fQ(g, '=SUMIF(A2:A5,"latte",C2:C5)', (a) => ({ answer: a, wrong: [g.val('=COUNTIF(A2:A5,"latte")'), g.val('=SUM(C2:C5)'), g.val('=SUMIF(A2:A5,"latte",B2:B5)')], why: 'SUMIF looks down column A for latte and adds the cups in column C on those rows only.' })); }),
  Q('Joining text with &', (r) => { const g = grid(r), n = ri(r, 2, 5), sep = pick(r, ['', ' x', '-']); const d = g.rows[n - 2][0], c = g.rows[n - 2][2]; return fQ(g, `=A${n}&"${sep}"&C${n}`, (a) => ({ answer: a, wrong: [`${d} ${sep.trim()} ${c}`.replace(/  +/g, ' '), `${d}${sep}`, `${d}&${c}`, `${d}${c}${sep}`], why: '& joins exactly what it is given, with no extra spaces.' })); }),
  Q('ROUND', (r) => { const x = (ri(r, 100, 999) / 100 + 0.004).toFixed(2), p = pick(r, [0, 1]); if (/[05]$/.test(x) || /5.$/.test(x)) return null; const g = grid(r); const q = fQ(g, `=ROUND(${x},${p})`, (a) => ({ answer: a, wrong: [display(Math.floor(Number(x) * 10 ** p) / 10 ** p), display(Math.ceil(Number(x) * 10 ** p) / 10 ** p), x], why: `ROUND(${x},${p}) rounds to ${p} decimal place${p === 1 ? '' : 's'}, to the nearest.` })); q.table = null; return q; }),
  Q('VLOOKUP', (r) => { const g = grid(r, { unique: true }), n = ri(r, 2, 5), d = g.rows[n - 2][0], c = pick(r, [2, 3]); return fQ(g, `=VLOOKUP("${d}",A2:C5,${c},FALSE)`, (a) => ({ answer: a, wrong: [g.val(`=VLOOKUP("${d}",A2:C5,${c === 2 ? 3 : 2},FALSE)`), String(n), d], why: `It finds ${d} in the first column of A2:C5 and returns column ${c} of that row (${c === 2 ? 'Price' : 'Cups'}).` })); }),
  Q('COUNT and COUNTA', (r) => { const g = grid(r), n = ri(r, 2, 5), f = pick(r, ['COUNT', 'COUNTA']); g.sheet.set(`C${n}`, 'n/a'); g.table.rows[n - 1][3] = 'n/a'; return fQ(g, `=${f}(C2:C5)`, (a) => ({ answer: a, wrong: [f === 'COUNT' ? 4 : 3, 1, 5], why: f === 'COUNT' ? 'COUNT counts only the cells that hold a number, so the n/a is skipped.' : 'COUNTA counts every cell that is not empty, text included.' })); }),
  Q('Filling down', (r) => { const k = ri(r, 1, 3), f = pick(r, ['=B2*C2', '=B2+C2', '=C2*2']); const a = shiftFormula(f, k, 0); return { prompt: `${f} is in D2. It is filled down to D${2 + k}. What is in D${2 + k}?`, answer: a, wrong: [f, shiftFormula(f, 0, k), shiftFormula(f, k + 1, 0)], why: `Moving down ${k} row${k === 1 ? '' : 's'} adds ${k} to every row number in the formula.` }; }),
  Q('Absolute references ($)', (r) => { const k = ri(r, 1, 3), f = pick(r, ['=D2*$G$1', '=B2*$F$1', '=C2/$H$1']); const a = shiftFormula(f, k, 0), bare = f.replace(/\$/g, ''); return { prompt: `${f} is in E2. It is filled down to E${2 + k}. What is in E${2 + k}?`, answer: a, wrong: [f, shiftFormula(bare, k, 0), shiftFormula(bare, k, 0).replace(/([A-Z])(\d+)$/, '$$$1$$$2')], why: 'The address without dollar signs moves down with the formula. The one pinned with $ stays where it is.' }; }),
  Q('Formulas and cell references', (r) => pick(r, [
    { prompt: 'What must every spreadsheet formula start with?', answer: '=', wrong: ['fx', '#', '$'], why: 'Without the equals sign the cell shows what you typed, as plain text.' },
    { prompt: 'Which cell is in column C, row 4?', answer: 'C4', wrong: ['4C', 'C:4', 'D3'], why: 'An address is the column letter followed by the row number.' },
    { prompt: 'How many cells are in the range B2:B7?', answer: '6', wrong: ['5', '2', '7'], why: 'B2, B3, B4, B5, B6 and B7: both ends are included.' },
  ])),
];

// ================================================================ JavaScript
/** What a snippet logs (several lines joined), or "An error" if it stops. */
export function runJs(code) { const res = jsCore(code, {}, null, null); return res.error ? 'An error' : res.logs.join('\n'); }
const jQ = (code, mk, prompt = 'What does this log?') => ({ code, lang: 'js', prompt, ...mk(runJs(code)) });
const NAMES = ['Ana', 'Ben', 'Cleo', 'Dev', 'Eli', 'Fay'];

export const JS_Q = [
  Q('Text and numbers with +', (r) => { const a = ri(r, 1, 9), b = ri(r, 1, 9), k = ri(r, 0, 2); return jQ(k === 0 ? `console.log("${a}" + ${b});` : k === 1 ? `console.log(${a} + ${b});` : `console.log("${a}" + "${b}");`, (ans) => ({ answer: ans, wrong: [a + b, `${a}${b}`, 'An error', a * b], why: k === 1 ? 'Two numbers are added.' : 'When either side of + is text, JavaScript joins them as text.' })); }),
  Q('Template strings', (r) => { const n = ri(r, 2, 8), k = ri(r, 1, 3); return jQ(`const cups = ${n};\nconsole.log(\`You have \${cups + ${k}} cups\`);`, (a) => ({ answer: a, wrong: [`You have \${cups + ${k}} cups`, `You have ${n}${k} cups`, `You have ${n} cups`], why: 'Whatever is inside ${ } is worked out first, then dropped into the text.' })); }),
  Q('=== and ==', (r) => { const n = ri(r, 1, 9), k = ri(r, 0, 3); return jQ([`console.log(${n} === "${n}");`, `console.log(${n} === ${n});`, `console.log("${n}" === "${n}");`, `console.log(${n} !== ${n + 1});`][k], (a) => ({ answer: a, wrong: [a === 'true' ? 'false' : 'true', 'An error', 'undefined'], why: k === 0 ? '=== is true only when the value and the type both match. A number is not text.' : '=== compares both the value and the type, and here they match.' })); }),
  Q('typeof', (r) => { const [v, why] = pick(r, [['42', 'A number.'], ['"42"', 'Quotes make it text, which JavaScript calls a string.'], ['true', 'true and false are booleans.'], ['[1, 2]', 'An array is a kind of object in JavaScript.'], ['undefined', 'undefined has its own type.'], ['{ cups: 2 }', 'Curly braces make an object.']]); return jQ(`console.log(typeof ${v});`, (a) => ({ answer: a, wrong: ['number', 'string', 'boolean', 'object', 'array'].filter((x) => x !== a), why })); }),
  Q('Arrays', (r) => { const q = sample(r, NAMES, ri(r, 3, 5)), k = ri(r, 0, 2); const e = ['q[q.length - 1]', 'q[1]', 'q.length'][k]; return jQ(`const q = ${JSON.stringify(q).replace(/,/g, ', ')};\nconsole.log(${e});`, (a) => ({ answer: a, wrong: k === 2 ? [q.length - 1, q.length + 1, q[q.length - 1]] : [q[0], q[k === 0 ? q.length - 2 : 2], 'undefined'], why: k === 0 ? 'Positions start at 0, so the last one is at length - 1.' : k === 1 ? 'Positions start at 0, so [1] is the second item.' : '.length is how many items the array holds.' })); }),
  Q('Arrays', (r) => { const a = ri(r, 1, 5), b = ri(r, 1, 5), c = ri(r, 6, 9); return jQ(`const xs = [${a}, ${b}];\nxs.push(${c});\nconsole.log(xs.length);`, (ans) => ({ answer: ans, wrong: [2, c, a + b + c], why: '.push() adds one item to the end, so there are now three.' })); }),
  Q('for … of loops', (r) => { const xs = Array.from({ length: ri(r, 3, 4) }, () => ri(r, 1, 6)); return jQ(`let total = 0;\nfor (const x of [${xs.join(', ')}]) {\n    total += x;\n}\nconsole.log(total);`, (a) => ({ answer: a, wrong: [xs[xs.length - 1], xs.length, Number(a) + xs[0]], why: 'The loop adds each item to total in turn.' })); }),
  Q('if and else', (r) => { const n = ri(r, 2, 8), k = ri(r, 3, 7), op = pick(r, ['>=', '>']); return jQ(`const cups = ${n};\nif (cups ${op} ${k}) {\n    console.log("Bulk");\n} else {\n    console.log("Single");\n}`, (a) => ({ answer: a, wrong: [a === 'Bulk' ? 'Single' : 'Bulk', 'Bulk\nSingle', 'Nothing'], why: `${n} ${op} ${k} is ${a === 'Bulk' ? 'true, so the first block runs' : 'false, so the else block runs'}.` })); }),
  Q('Functions', (r) => { const a = ri(r, 2, 6), b = ri(r, 2, 6), ret = r() < 0.6; return jQ(`function bill(price, cups) {\n    ${ret ? 'return ' : ''}price * cups;\n}\nconsole.log(bill(${a}, ${b}));`, (ans) => ({ answer: ans, wrong: [a * b, a + b, 'undefined', 'An error'], why: ret ? 'return hands price * cups back to the caller.' : 'There is no return, so the function hands back undefined even though it did the sum.' })); }),
  Q('Objects', (r) => { const d = pick(r, ['tea', 'latte', 'mocha']), p = ri(r, 2, 5), c = ri(r, 2, 5), k = ri(r, 0, 1); return jQ(`const order = { drink: "${d}", price: ${p}, cups: ${c} };\nconsole.log(${k ? 'order.price * order.cups' : 'order.drink'});`, (a) => ({ answer: a, wrong: k ? [p + c, p, c] : ['drink', 'order', p], why: 'A dot reads the property with that name from the object.' })); }),
  Q('map()', (r) => { const xs = [ri(r, 1, 4), ri(r, 1, 4), ri(r, 5, 9)], k = ri(r, 2, 3); return jQ(`const xs = [${xs.join(', ')}];\nconsole.log(xs.map((n) => n * ${k}));`, (a) => ({ answer: a, wrong: [`[${xs.join(', ')}]`, String(xs.reduce((s, x) => s + x * k, 0)), `[${xs.map((x) => x + k).join(', ')}]`], why: `map runs the function on every item and collects the results in a new array.` })); }),
  Q('filter()', (r) => { const xs = sample(r, [1, 2, 3, 4, 5, 6, 7, 8, 9], 5), k = ri(r, 3, 6), len = r() < 0.5; return jQ(`const xs = [${xs.join(', ')}];\nconst big = xs.filter((n) => n > ${k});\nconsole.log(big${len ? '.length' : ''});`, (a) => ({ answer: a, wrong: len ? [xs.length, xs.filter((n) => n >= k).length + 1, xs.filter((n) => n <= k).length] : [`[${xs.filter((n) => n <= k).join(', ')}]`, String(xs.filter((n) => n > k).length), `[${xs.join(', ')}]`], why: `filter keeps the items for which the test is true: those above ${k}.` })); }),
  Q('const and let', (r) => { const n = ri(r, 2, 5), isLet = r() < 0.5; return jQ(`${isLet ? 'let' : 'const'} cups = ${n};\ncups = cups + 1;\nconsole.log(cups);`, (a) => ({ answer: a, wrong: [n, n + 1, 'An error', 'undefined'], why: isLet ? 'A let can be given a new value.' : 'A const cannot be changed, so the second line stops the program.' })); }),
  Q('&& and ||', (r) => { const a = ri(r, 1, 9), b = ri(r, 1, 9), op = pick(r, ['&&', '||']); return jQ(`console.log(${a} > 4 ${op} ${b} > 4);`, (ans) => ({ answer: ans, wrong: [ans === 'true' ? 'false' : 'true', 'An error', String(a > 4 ? a : b)], why: op === '&&' ? '&& is true only when both sides are true.' : '|| is true when at least one side is true.' })); }),
  Q('The DOM and events', (r) => pick(r, [
    { prompt: 'Which line finds the element whose id is sign?', answer: 'document.querySelector("#sign")', wrong: ['document.querySelector(".sign")', 'document.find("sign")', 'page.get(#sign)'], why: '# means id, as in CSS. A dot would mean a class.' },
    { prompt: 'Which property changes the words inside an element?', answer: 'textContent', wrong: ['words', 'value.text', 'contentText'], why: 'Setting el.textContent replaces the text shown inside the element.' },
    { prompt: 'button.addEventListener("click", fn): when does fn run?', answer: 'Each time the button is clicked', wrong: ['Once, straight away', 'When the page closes', 'Never'], why: 'The browser keeps the function and calls it on every click.' },
    { prompt: 'Where does console.log() show its message?', answer: 'In the browser’s console', wrong: ['On the web page', 'In a pop-up box', 'In the address bar'], why: 'The console is a developer tool. Visitors to the page do not see it.' },
  ])),
];

// ================================================================ Syntax Catcher rounds
const B = (t, why) => ({ t, why });
export const CATCH2 = [
  { rule: 'Catch the JavaScript keywords', lang: 'JavaScript', make: () => ({
    good: ['const', 'let', 'function', 'return', 'if', 'else', 'for', 'while', 'true', 'false', 'null', 'typeof', 'new', 'class', 'break'],
    bad: [B('def', 'def is Python. JavaScript uses function.'), B('elif', 'JavaScript writes else if, as two words.'), B('None', 'JavaScript’s “nothing” values are null and undefined.'), B('True', 'JavaScript writes true in lower case.'), B('then', 'Curly braces mark the block, not then.'), B('and', 'JavaScript writes and as &&.'), B('or', 'JavaScript writes or as ||.'), B('not', 'JavaScript writes not as !.'), B('func', 'The keyword is function.'), B('elseif', 'JavaScript writes else if, as two words.'), B('end', 'A block ends with a closing curly brace.')] }) },
  { rule: 'Catch the real spreadsheet functions', lang: 'Spreadsheets', make: () => ({
    good: ['SUM', 'AVERAGE', 'COUNT', 'COUNTA', 'IF', 'VLOOKUP', 'SUMIF', 'COUNTIF', 'ROUND', 'MAX', 'MIN', 'XLOOKUP'],
    bad: [B('MEAN', 'A spreadsheet calls the mean AVERAGE.'), B('AVG', 'AVG is SQL. A spreadsheet uses AVERAGE.'), B('TOTAL', 'A range is added up with SUM.'), B('ADD', 'A range is added up with SUM.'), B('LOOKUPV', 'The function is VLOOKUP.'), B('COUNTALL', 'Every non-empty cell is counted with COUNTA.'), B('IFELSE', 'IF already takes both answers: IF(test, yes, no).'), B('SUMUP', 'A range is added up with SUM.'), B('ROUNDED', 'The function is ROUND.'), B('PLUS', 'Use + or SUM.')] }) },
  { rule: 'Catch the real pandas commands', lang: 'pandas', make: () => ({
    good: ['read_csv', 'head', 'groupby', 'merge', 'sort_values', 'value_counts', 'fillna', 'dropna', 'mean', 'isna', 'tail', 'nunique'],
    bad: [B('open_csv', 'A CSV file is read with read_csv.'), B('group_by', 'pandas spells it as one word: groupby.'), B('order_by', 'ORDER BY is SQL. pandas sorts with sort_values.'), B('sortby', 'pandas sorts with sort_values.'), B('top', 'The first rows come from head().'), B('count_values', 'The command is value_counts.'), B('fill_na', 'pandas spells it as one word: fillna.'), B('join_tables', 'Two tables are joined with merge.'), B('average', 'pandas calls the average mean().'), B('vlookup', 'VLOOKUP is a spreadsheet function. pandas uses merge.'), B('where_rows', 'Rows are filtered with df[ test ].')] }) },
  { rule: 'Catch the valid cell addresses and ranges', lang: 'Spreadsheets', make: () => ({
    good: ['A1', 'B2:B9', '$G$1', 'C10', 'AA3', '$A2', 'D2:F2', 'B$4'],
    bad: [B('1A', 'The column letter comes first, then the row number.'), B('B2-B9', 'A range uses a colon: B2:B9.'), B('G1$', 'A dollar sign goes in front of the part it pins.'), B('B2..B9', 'A range uses a colon: B2:B9.'), B('2B', 'The column letter comes first, then the row number.'), B('A:1', 'An address has no colon inside it: A1.'), B('B2;B9', 'A range uses a colon: B2:B9.'), B('#C3', 'An address is just the letter and the number.')] }) },
  { rule: 'Catch what is true in JavaScript', lang: 'JavaScript', make: (r) => {
    const good = ['5 === 5', '"a" !== "b"', '!false', '3 > 2 && 2 > 1', '[1, 2].length === 2', 'typeof "x" === "string"', '5 == "5"', 'true || false'];
    const bad = [B('5 === "5"', '=== also compares the type, and a number is not text.'), B('0.1 + 0.2 === 0.3', 'Decimals are stored approximately: 0.1 + 0.2 is 0.30000000000000004.'), B('!true', '! flips true to false.'), B('"A" === "a"', 'Capitals matter in text.'), B('true && false', '&& needs both sides to be true.'), B('null === undefined', 'They are two different values.'), B('[] === []', 'These are two separate arrays, and === asks whether they are the same one.')];
    for (let i = 0; i < 6; i++) {
      const a = ri(r, 2, 12), b = ri(r, 2, 12), k = ri(r, 0, 2);
      const [text, val, why] = k === 0 ? [`${a} > ${b}`, a > b, `${a} is not greater than ${b}.`] : k === 1 ? [`${a} % 2 === 0`, a % 2 === 0, `${a} is odd, so ${a} % 2 is 1.`] : [`${a} <= ${b}`, a <= b, `${a} is greater than ${b}.`];
      if (!good.includes(text) && !bad.some((x) => x.t === text)) { if (val) good.push(text); else bad.push(B(text, why)); }
    }
    return { good, bad };
  } },
];
