// levels2.js — the levels and checkers of the three data-and-web games added after the first five:
//   Table Tamer (pandas, run by minipy.js + minipandas.js), Cell Craft (spreadsheet formulas, run by the site's
//   own engine in core/sheet.js) and Script Lab (JavaScript, really run: in a worker in the browser).
// Like levels.js this file has no DOM in it, so tests/arcade.test.mjs can run every level's solution.
import { parse, exec, PyError, show } from './minipy.js?v=39';
import { pandasModule, plain, samePlain } from './minipandas.js?v=39';
import { gradeFormula, shiftFormula, Sheet, parseRange, parseAddr, addr } from '../core/sheet.js?v=39';
import { mulberry32 } from '../core/rng.js?v=39';

const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const pick = (r, list) => list[ri(r, 0, list.length - 1)];
const STAFF = ['Ana', 'Ben', 'Cleo'];
const MENU = [['latte', 3.5], ['mocha', 4.2], ['chai', 3.8], ['tea', 2.5], ['espresso', 2.0]];

// ================================================================ Table Tamer (pandas)
/** Lantern Coffee's orders for one day: drink, price, qty, server. Always two latte orders (one of a single cup),
 *  and no two orders with the same total, so a sort has one right answer. */
function orderRows(r) {
  for (;;) {
    const n = ri(r, 8, 10);
    const rows = Array.from({ length: n }, () => { const [drink, price] = pick(r, MENU); return [drink, price, ri(r, 1, 5), pick(r, STAFF)]; });
    rows[ri(r, 0, 2)] = ['latte', 3.5, ri(r, 2, 5), pick(r, STAFF)];
    rows[ri(r, 3, 5)] = ['latte', 3.5, 1, pick(r, STAFF)];
    if (new Set(rows.map((x) => Math.round(x[1] * x[2] * 100))).size === n) return rows;
  }
}
const ORD = ['drink', 'price', 'qty', 'server'];
const ordersFile = (r) => ({ 'orders.csv': { columns: ORD, rows: orderRows(r), float: ['price'] } });
const table = (columns, rows) => ({ kind: 'table', columns, rows });
const series = (index, values) => ({ kind: 'series', index, values });
const sum = (xs) => xs.reduce((s, x) => s + x, 0);
const LOAD = 'import pandas as pd\ndf = pd.read_csv("orders.csv")\n';

export const PANDAS_LEVELS = [
  { id: 'read', title: 'Open the file', concept: 'DataFrames and read_csv',
    teach: ['<b>pandas</b> is a Python library for tables. import pandas as pd loads it and gives it the short name pd.', 'pd.read_csv("orders.csv") reads a file into a <b>DataFrame</b>: a table with named columns and numbered rows. Analysts usually call it df. df.head() gives the first 5 rows, and df.head(3) the first 3.'],
    goal: 'Serve the first 3 rows of orders.csv.',
    files: ordersFile, expect: (f) => table(ORD, f['orders.csv'].rows.slice(0, 3)),
    starter: `${LOAD}serve(df.head())\n`, hint: 'Put the number of rows inside the brackets: df.head(3)', solution: `${LOAD}serve(df.head(3))` },
  { id: 'size', title: 'How big is it?', concept: 'len() and shape',
    teach: ['Before anything else, find out how much data you have. len(df) counts the rows.', 'df.shape gives both numbers at once, as (rows, columns). It has no brackets after it because it is a fact about the table, not a command.'],
    goal: 'Serve the number of orders (the number of rows).',
    files: ordersFile, expect: (f) => f['orders.csv'].rows.length,
    starter: `${LOAD}print(df.shape)\nserve(0)\n`, hint: 'serve(len(df))', solution: `${LOAD}serve(len(df))` },
  { id: 'column', title: 'One column', concept: 'Picking a column',
    teach: ['df["qty"] picks one column by its name. The name is text, so it goes in quotes, inside square brackets.', 'One column on its own is called a <b>Series</b>. A Series can add itself up: df["qty"].sum().'],
    goal: 'Serve the total number of cups sold: the sum of the qty column.',
    files: ordersFile, expect: (f) => sum(f['orders.csv'].rows.map((x) => x[2])),
    starter: `${LOAD}cups = df["qty"]\nserve(cups)\n`, hint: 'serve(df["qty"].sum())', solution: `${LOAD}serve(df["qty"].sum())` },
  { id: 'stats', title: 'Typical order', concept: 'mean, max and min',
    teach: ['A Series has the summaries an analyst reaches for first: .mean() is the average, .max() the largest, .min() the smallest, .count() how many.', 'Each one boils the whole column down to a single number.'],
    goal: 'Serve the average number of cups per order: the mean of qty.',
    files: ordersFile, expect: (f) => { const q = f['orders.csv'].rows.map((x) => x[2]); return sum(q) / q.length; },
    starter: `${LOAD}serve(df["qty"].max())\n`, hint: 'serve(df["qty"].mean())', solution: `${LOAD}serve(df["qty"].mean())` },
  { id: 'filter', title: 'Only the lattes', concept: 'Filtering rows',
    teach: ['df["drink"] == "latte" tests every row at once and gives a column of True and False.', 'Put that test inside df[ ] and pandas keeps only the rows marked True: df[df["drink"] == "latte"]. This is the pandas version of WHERE in SQL.'],
    goal: 'Serve only the rows where the drink is latte.',
    files: ordersFile, expect: (f) => table(ORD, f['orders.csv'].rows.filter((x) => x[0] === 'latte')),
    starter: `${LOAD}lattes = df[df["drink"] == "tea"]\nserve(lattes)\n`, hint: 'df[df["drink"] == "latte"]', solution: `${LOAD}lattes = df[df["drink"] == "latte"]\nserve(lattes)` },
  { id: 'and', title: 'Two tests at once', concept: 'Combining filters with &',
    teach: ['Join two tests with <b>&</b> (and) or <b>|</b> (or). pandas does not use the words and / or here.', 'Each test must sit in its own round brackets, or Python reads the line in the wrong order: df[(df["drink"] == "latte") & (df["qty"] >= 2)].'],
    goal: 'Serve the latte orders of 2 cups or more.',
    files: ordersFile, expect: (f) => table(ORD, f['orders.csv'].rows.filter((x) => x[0] === 'latte' && x[2] >= 2)),
    starter: `${LOAD}big = df[(df["drink"] == "latte")]\nserve(big)\n`, hint: 'df[(df["drink"] == "latte") & (df["qty"] >= 2)]', solution: `${LOAD}big = df[(df["drink"] == "latte") & (df["qty"] >= 2)]\nserve(big)` },
  { id: 'newcol', title: 'A column of your own', concept: 'Making a new column',
    teach: ['Multiply two columns and pandas multiplies them row by row: df["price"] * df["qty"].', 'Give the answer a name on the left and it becomes a new column of the table: df["total"] = df["price"] * df["qty"]. No loop needed.'],
    goal: 'Add a total column (price times qty), then serve the day’s takings: the sum of total.',
    files: ordersFile, expect: (f) => sum(f['orders.csv'].rows.map((x) => x[1] * x[2])),
    starter: `${LOAD}df["total"] = df["price"]\nserve(df["total"].sum())\n`, hint: 'df["total"] = df["price"] * df["qty"]', solution: `${LOAD}df["total"] = df["price"] * df["qty"]\nserve(df["total"].sum())` },
  { id: 'sort', title: 'Biggest first', concept: 'sort_values',
    teach: ['df.sort_values("total") puts the rows in order of one column, smallest first.', 'Add ascending=False for biggest first. Commands can be chained: sort, then .head(3) keeps the top three.'],
    goal: 'Serve the 3 orders with the biggest total, biggest first.',
    files: ordersFile, expect: (f) => table([...ORD, 'total'], f['orders.csv'].rows.map((x) => [...x, x[1] * x[2]]).sort((a, b) => b[4] - a[4]).slice(0, 3)),
    starter: `${LOAD}df["total"] = df["price"] * df["qty"]\ntop = df.sort_values("total")\nserve(top.head(3))\n`, hint: 'df.sort_values("total", ascending=False)', solution: `${LOAD}df["total"] = df["price"] * df["qty"]\ntop = df.sort_values("total", ascending=False)\nserve(top.head(3))` },
  { id: 'counts', title: 'What sells?', concept: 'value_counts',
    teach: ['.value_counts() counts how many times each value appears in a column, most common first.', 'It is the quickest way to see what is in a column of categories, and to spot misspellings in real data.'],
    goal: 'Serve how many orders there were of each drink.',
    files: ordersFile, expect: (f) => { const m = new Map(); f['orders.csv'].rows.forEach((x) => m.set(x[0], (m.get(x[0]) || 0) + 1)); const e = [...m].sort((a, b) => b[1] - a[1]); return series(e.map((x) => x[0]), e.map((x) => x[1])); },
    starter: `${LOAD}serve(df["drink"])\n`, hint: 'serve(df["drink"].value_counts())', solution: `${LOAD}serve(df["drink"].value_counts())` },
  { id: 'groupby', title: 'Group, then add', concept: 'groupby',
    teach: ['df.groupby("drink") sorts the rows into piles, one pile per drink. Then pick a column and a summary: ["qty"].sum() adds up each pile.', 'The answer has one row per group. This is GROUP BY from SQL, and the pivot table from a spreadsheet.'],
    goal: 'Serve the total cups sold of each drink.',
    files: ordersFile, expect: (f) => { const m = new Map(); f['orders.csv'].rows.forEach((x) => m.set(x[0], (m.get(x[0]) || 0) + x[2])); const e = [...m].sort((a, b) => (a[0] < b[0] ? -1 : 1)); return series(e.map((x) => x[0]), e.map((x) => x[1])); },
    starter: `${LOAD}cups = df.groupby("server")["qty"].sum()\nserve(cups)\n`, hint: 'df.groupby("drink")["qty"].sum()', solution: `${LOAD}cups = df.groupby("drink")["qty"].sum()\nserve(cups)` },
  { id: 'missing', title: 'Gaps in the data', concept: 'Missing values (NaN)',
    teach: ['Real data has gaps. pandas shows an empty cell as <b>NaN</b>, and its summaries quietly skip them: .mean() averages only the tips that were written down.', '.fillna(0) gives a copy with every gap filled by 0. Whether a gap means zero or unknown is your call, and it changes the answer.'],
    goal: 'An empty tip means no tip was left. Serve the average tip per order, counting the gaps as 0.',
    files: (r) => { const rows = orderRows(r).map((x) => [x[0], x[2], pick(r, [0.5, 1, 1.5, 2])]); rows[1][2] = null; rows[4][2] = null; if (r() < 0.5) rows[6][2] = null; return { 'orders.csv': { columns: ['drink', 'qty', 'tip'], rows, float: ['tip'] } }; },
    expect: (f) => { const t = f['orders.csv'].rows.map((x) => x[2] ?? 0); return sum(t) / t.length; },
    starter: `${LOAD}tips = df["tip"]\nserve(tips.mean())\n`, hint: 'df["tip"].fillna(0).mean()', solution: `${LOAD}tips = df["tip"].fillna(0)\nserve(tips.mean())` },
  { id: 'merge', title: 'Two tables', concept: 'merge',
    teach: ['Here the prices are not in orders.csv. They live in menu.csv. Both tables have a drink column.', 'orders.merge(menu, on="drink") lines the two tables up on that column, so every order gets its price. This is JOIN from SQL, and VLOOKUP from a spreadsheet.'],
    goal: 'Merge the orders with the menu, add a total column (price times qty), and serve the day’s takings.',
    files: (r) => ({ 'orders.csv': { columns: ['drink', 'qty', 'server'], rows: orderRows(r).map((x) => [x[0], x[2], x[3]]) }, 'menu.csv': { columns: ['drink', 'price'], rows: MENU.map((m) => [...m]), float: ['price'] } }),
    expect: (f) => sum(f['orders.csv'].rows.map((x) => x[1] * MENU.find((m) => m[0] === x[0])[1])),
    starter: 'import pandas as pd\norders = pd.read_csv("orders.csv")\nmenu = pd.read_csv("menu.csv")\nboth = orders\nserve(both)\n', hint: 'both = orders.merge(menu, on="drink"), then both["total"] = both["price"] * both["qty"], then serve(both["total"].sum()).',
    solution: 'import pandas as pd\norders = pd.read_csv("orders.csv")\nmenu = pd.read_csv("menu.csv")\nboth = orders.merge(menu, on="drink")\nboth["total"] = both["price"] * both["qty"]\nserve(both["total"].sum())' },
];

const describe = (p) => (p && p.kind === 'table' ? `a table of ${p.rows.length} row${p.rows.length === 1 ? '' : 's'} (columns: ${p.columns.join(', ')})` : p && p.kind === 'series' ? `a Series of ${p.values.length} value${p.values.length === 1 ? '' : 's'}` : p && p.kind === 'other' ? p.text : Array.isArray(p) ? `the list ${JSON.stringify(p)}` : typeof p === 'number' ? `the number ${Math.round(p * 1e6) / 1e6}` : typeof p === 'string' ? `the text "${p}"` : String(p));
function pandasOnce(level, program, seed) {
  const files = level.files(mulberry32(seed));
  const prints = [], served = [];
  const host = { actions: { serve: 1 }, free: new Set(['serve']), modules: { pandas: pandasModule(files) } };
  exec(program, host, (s) => { if (s.action === 'print') prints.push(s.args[0]); else if (s.action === 'serve') served.push(s.args.length ? s.args[0] : null); }, { maxSteps: 2000 });
  const want = level.expect(files);
  const got = served.length ? plain(served[served.length - 1]) : undefined;
  return { files, prints, want, got, ok: got !== undefined && samePlain(got, want) };
}
/** Run a learner's program for a Table Tamer level, on the files shown and on two more sets that are not.
 *  Returns { ok, error, files, prints, got, want }. */
export function pandasRun(level, source, seed = 1) {
  const out = { ok: false, error: null, files: level.files(mulberry32(seed)), prints: [], got: undefined, want: null };
  try {
    const program = parse(source);
    const first = pandasOnce(level, program, seed);
    Object.assign(out, { prints: first.prints, got: first.got, want: first.want });
    if (first.got === undefined) { out.error = { message: 'The program ran but never called serve().', line: 0, hint: 'Hand over your answer with serve(answer).' }; return out; }
    if (!first.ok) {
      const kind = (p) => (p && p.kind) || (Array.isArray(p) ? 'list' : typeof p);
      const hint = kind(first.got) !== kind(first.want) ? 'The goal asks for a different kind of answer. Read it again: a table, one column, or a single number?'
        : first.want.kind === 'table' && first.got.columns.join() !== first.want.columns.join() ? `The columns should be: ${first.want.columns.join(', ')}.`
          : first.want.kind === 'table' ? 'Right columns, wrong rows. Check which rows the goal asks for, and their order.' : 'Check each step with print(), for example print(df.head()).';
      out.error = { message: `You served ${describe(first.got)}, but the goal needs ${describe(first.want)}.`, line: 0, hint };
      return out;
    }
    for (const s of [seed + 101, seed + 202]) {
      const again = pandasOnce(level, program, s);
      if (!again.ok) { out.error = { message: 'That is right for this file, but not for another day’s orders.', line: 0, hint: `On a different file it should serve ${describe(again.want)}, and yours served ${again.got === undefined ? 'nothing' : describe(again.got)}. Work the answer out from df rather than typing it in.` }; return out; }
    }
    out.ok = true;
  } catch (e) {
    if (!(e instanceof PyError)) throw e;
    out.error = { message: e.message, line: e.line, hint: e.hint };
  }
  return out;
}
/** A table spec as the text of a CSV file (for showing the file, and for the tests' check against real pandas). */
export const toCsv = (spec) => [spec.columns.join(','), ...spec.rows.map((row) => row.map((v, c) => (v == null ? '' : (spec.float || []).includes(spec.columns[c]) ? (Number.isInteger(v) ? `${v}.0` : String(v)) : String(v))).join(','))].join('\n');
export { plain as pandasPlain, show as pyShow };

// ================================================================ Cell Craft (spreadsheet formulas)
/** Six orders on a sheet: A drink, B price, C cups, and (when asked) D total as a formula. */
function orderSheet(r, { total = false, price = true } = {}) {
  const cells = { A1: 'Drink', C1: 'Cups' };
  if (price) cells.B1 = 'Price';
  if (total) cells.D1 = 'Total';
  const rows = orderRows(r).slice(0, 6);
  rows.forEach(([drink, p, qty], i) => {
    const n = i + 2;
    cells[`A${n}`] = drink; cells[`C${n}`] = qty;
    if (price) cells[`B${n}`] = p;
    if (total) cells[`D${n}`] = `=B${n}*C${n}`;
  });
  return { cells };
}
const withCells = (spec, extra) => ({ cells: { ...spec.cells, ...extra } });

export const SHEET_LEVELS = [
  { id: 'formula', title: 'Your first formula', concept: 'Formulas and cell references',
    teach: ['A spreadsheet is a grid of <b>cells</b>. Each cell has an address: its column letter then its row number, so B2 is column B, row 2.', 'A cell can hold a value, or a <b>formula</b> that works one out. A formula starts with an equals sign and uses addresses instead of numbers: =B2*C2. Change B2 and the answer updates by itself.'],
    goal: 'In D2, work out the first order’s total: its price times its cups.',
    sheet: (r) => withCells(orderSheet(r), { D1: 'Total' }), cell: 'D2', answer: '=B2*C2',
    starter: '=B2', hint: 'Multiply with a star: =B2*C2', solution: '=B2*C2' },
  { id: 'fill', title: 'Fill it down', concept: 'Filling down (relative references)',
    teach: ['You do not type a formula once per row. You write it in the top cell and <b>fill it down</b>.', 'As the formula moves down a row, its addresses move with it: =B2*C2 becomes =B3*C3, then =B4*C4. Here your formula in D2 is filled down to D7 for you.'],
    goal: 'Write one formula in D2 that gives every order’s total when it is filled down to D7.',
    sheet: (r) => withCells(orderSheet(r), { D1: 'Total' }), cell: 'D2', fill: 'D2:D7', answer: '=B2*C2',
    starter: '=B2*3', hint: 'Use addresses for both numbers, so both move as the formula is filled: =B2*C2', solution: '=B2*C2' },
  { id: 'sum', title: 'Add a column', concept: 'SUM and ranges',
    teach: ['A <b>function</b> is a named calculation. =SUM(…) adds up everything inside its brackets.', 'A <b>range</b> is a block of cells, written as its first and last cell with a colon between: D2:D7 means D2 down to D7.'],
    goal: 'In D8, add up all six totals.',
    sheet: (r) => withCells(orderSheet(r, { total: true }), { A8: 'All orders' }), cell: 'D8', answer: '=SUM(D2:D7)', require: ['SUM'],
    starter: '=SUM(D2:D3)', hint: '=SUM(D2:D7)', solution: '=SUM(D2:D7)' },
  { id: 'average', title: 'The typical order', concept: 'AVERAGE, MIN and MAX',
    teach: ['=AVERAGE(range) gives the mean of a range. =MIN(range) and =MAX(range) give its smallest and largest values.', 'They take a range exactly as SUM does. Most of the functions you will ever need work this way.'],
    goal: 'In C8, work out the average number of cups per order.',
    sheet: (r) => withCells(orderSheet(r, { total: true }), { A8: 'Average cups' }), cell: 'C8', answer: '=AVERAGE(C2:C7)', require: ['AVERAGE'],
    starter: '=MAX(C2:C7)', hint: '=AVERAGE(C2:C7)', solution: '=AVERAGE(C2:C7)' },
  { id: 'count', title: 'How many were recorded?', concept: 'COUNT and COUNTA',
    teach: ['=COUNT(range) counts the cells that hold a number. Empty cells and text are skipped.', '=COUNTA(range) counts every cell that is not empty, text included. Here some tips were never written down, and one says “n/a”.'],
    goal: 'In D8, count how many orders have a tip recorded as a number.',
    sheet: (r) => { const s = orderSheet(r); const cells = { ...s.cells, D1: 'Tip', A8: 'Tips recorded' }; const gaps = new Set([ri(r, 2, 3), ri(r, 5, 6)]); const text = ri(r, 4, 4) + (r() < 0.5 ? 0 : 3); for (let n = 2; n <= 7; n++) { if (n === text) cells[`D${n}`] = 'n/a'; else if (!gaps.has(n)) cells[`D${n}`] = pick(r, [0.5, 1, 1.5, 2]); } if (r() < 0.5) delete cells.D3; return { cells }; },
    cell: 'D8', answer: '=COUNT(D2:D7)', require: ['COUNT'],
    starter: '=COUNTA(D2:D7)', hint: 'COUNTA also counts the “n/a”. =COUNT(D2:D7) counts numbers only.', solution: '=COUNT(D2:D7)' },
  { id: 'absolute', title: 'Pin it down', concept: 'Absolute references ($)',
    teach: ['Sometimes one cell must stay put while the formula is filled down. Here the tax rate lives in G1 only.', 'A dollar sign pins part of an address: <b>$G$1</b> always means G1, however far the formula is filled. Without the dollars, G1 would slide to G2, which is empty.'],
    goal: 'In E2, work out the tax on the first total (total times the rate in G1), so that it still works when filled down to E7.',
    sheet: (r) => withCells(orderSheet(r, { total: true }), { E1: 'Tax', F1: 'Tax rate', G1: pick(r, [0.05, 0.08, 0.1, 0.2]) }), cell: 'E2', fill: 'E2:E7', answer: '=D2*$G$1',
    starter: '=D2*G1', hint: 'Pin the rate with dollar signs: =D2*$G$1', solution: '=D2*$G$1' },
  { id: 'if', title: 'One thing or another', concept: 'IF',
    teach: ['=IF(test, value if true, value if false) chooses between two answers. The test is a comparison such as C2>=3.', 'Text inside a formula goes in double quotes: "Bulk". Without quotes the spreadsheet looks for a cell or function called Bulk.'],
    goal: 'In E2, show Bulk when the order is 3 cups or more and Single otherwise. It is filled down to E7.',
    sheet: (r) => { const s = orderSheet(r, { total: true }); return withCells(s, { E1: 'Size', C3: 3, C4: 2 }); }, cell: 'E2', fill: 'E2:E7', answer: '=IF(C2>=3,"Bulk","Single")', require: ['IF'],
    starter: '=IF(C2>3,"Bulk","Single")', hint: '3 cups counts as Bulk, so the test is C2>=3.', solution: '=IF(C2>=3,"Bulk","Single")' },
  { id: 'countif', title: 'Count the lattes', concept: 'COUNTIF',
    teach: ['=COUNTIF(range, what to look for) counts only the cells that match.', 'To match text, put it in quotes: =COUNTIF(A2:A7,"latte"). To match numbers by a test, quote the test: ">=3".'],
    goal: 'In B9, count how many of the orders were for latte.',
    sheet: (r) => withCells(orderSheet(r, { total: true }), { A9: 'Latte orders' }), cell: 'B9', answer: '=COUNTIF(A2:A7,"latte")', require: ['COUNTIF'],
    starter: '=COUNTIF(A2:A7,"tea")', hint: '=COUNTIF(A2:A7,"latte")', solution: '=COUNTIF(A2:A7,"latte")' },
  { id: 'sumif', title: 'Add up the lattes', concept: 'SUMIF',
    teach: ['=SUMIF(range to test, what to look for, range to add) adds up one column, but only on the rows where another column matches.', 'Here: look down column A for latte, and add up the cups in column C on those rows.'],
    goal: 'In C9, add up the cups in the latte orders only.',
    sheet: (r) => withCells(orderSheet(r, { total: true }), { A9: 'Latte cups' }), cell: 'C9', answer: '=SUMIF(A2:A7,"latte",C2:C7)', require: ['SUMIF'],
    starter: '=SUMIF(A2:A7,"latte",D2:D7)', hint: 'The third part is the column to add. Cups are in C: =SUMIF(A2:A7,"latte",C2:C7)', solution: '=SUMIF(A2:A7,"latte",C2:C7)' },
  { id: 'round', title: 'Tidy numbers', concept: 'ROUND and functions inside functions',
    teach: ['=ROUND(number, places) rounds to that many decimal places. =ROUND(3.14159,2) is 3.14.', 'A function can go inside another. The inside one is worked out first: =ROUND(AVERAGE(D2:D7),1) takes the average, then rounds it.'],
    goal: 'In D8, show the average order total rounded to 1 decimal place.',
    sheet: (r) => withCells(orderSheet(r, { total: true }), { A8: 'Average total' }), cell: 'D8', answer: '=ROUND(AVERAGE(D2:D7),1)', require: ['ROUND'],
    starter: '=AVERAGE(D2:D7)', hint: 'Wrap it: =ROUND(AVERAGE(D2:D7),1)', solution: '=ROUND(AVERAGE(D2:D7),1)' },
  { id: 'join', title: 'Stick text together', concept: 'Joining text with &',
    teach: ['The <b>&</b> sign joins pieces of text into one. Cell values and quoted text can be mixed: =A2&" x"&C2 gives latte x3.', 'A number joined this way becomes text. Mind the spaces: they only appear if you put them inside the quotes.'],
    goal: 'In E2, make a label such as latte x3 (the drink, a space, an x, then the cups). It is filled down to E7.',
    sheet: (r) => withCells(orderSheet(r, { total: true }), { E1: 'Label' }), cell: 'E2', fill: 'E2:E7', answer: '=A2&" x"&C2',
    starter: '=A2&C2', hint: '=A2&" x"&C2', solution: '=A2&" x"&C2' },
  { id: 'lookup', title: 'Look it up', concept: 'VLOOKUP',
    teach: ['Here the orders have no prices. The price list is a separate table in F2:G6. <b>VLOOKUP</b> finds a value in the first column of a table and returns the cell beside it.', '=VLOOKUP(A2,$F$2:$G$6,2,FALSE) means: find A2 in the table, give back column 2 of that row, exact matches only. The table is pinned with $ so it stays put when filled down. Newer spreadsheets also have XLOOKUP, which does the same job.'],
    goal: 'In B2, look up the price of the drink in A2 from the price list. It is filled down to B7.',
    sheet: (r) => { const s = orderSheet(r, { price: false }); const cells = { ...s.cells, B1: 'Price', F1: 'Drink', G1: 'Price' }; const m = [...MENU].sort(() => r() - 0.5); m.forEach(([d, p], i) => { cells[`F${i + 2}`] = d; cells[`G${i + 2}`] = p; }); return { cells }; },
    cell: 'B2', fill: 'B2:B7', answer: '=VLOOKUP(A2,$F$2:$G$6,2,FALSE)',
    starter: '=VLOOKUP(A2,F2:G6,2,FALSE)', hint: 'Without $ the table slides down as the formula is filled. Pin it: $F$2:$G$6', solution: '=VLOOKUP(A2,$F$2:$G$6,2,FALSE)' },
];

/** The cells a level's formula is filled into: [{ cell, formula }]. */
export function sheetTargets(level, formula) {
  if (!level.fill) return [{ cell: level.cell, formula }];
  const at = parseAddr(level.cell), rg = parseRange(level.fill), out = [];
  for (let r = rg.r0; r <= rg.r1; r++) for (let c = rg.c0; c <= rg.c1; c++) out.push({ cell: addr(r, c), formula: shiftFormula(formula, r - at.r, c - at.c) });
  return out;
}
/** Check a formula for a Cell Craft level: on the sheet shown and on three more with different data.
 *  Returns { ok, message, hint, spec, sheet (with the formula in place, for drawing), targets }. */
export function sheetRun(level, formula, seed = 1) {
  const spec = level.sheet(mulberry32(seed));
  const f = String(formula || '').trim();
  const res = gradeFormula(spec, { cell: level.cell, formula: f, answer: level.answer, fill: level.fill || null, require: level.require || [], variants: 3, perturb: (_, k) => level.sheet(mulberry32(seed + 101 * (k + 1))) });
  const sheet = new Sheet(spec);
  let targets = [];
  if (f.startsWith('=') && f.length > 1) { try { targets = sheetTargets(level, f); targets.forEach((t) => sheet.set(t.cell, t.formula)); } catch { targets = []; } }
  let hint = '';
  if (!res.ok) {
    if (!f.startsWith('=')) hint = 'Without the = the cell just shows what you typed, as text.';
    else if (/[“”]/.test(f)) hint = 'Use straight double quotes (") round text, not curly ones.';
    else if (level.fill && res.results.length && res.results[0].ok) hint = 'The first cell is right, so look at what happens to each address as the formula is filled down.';
    else if (/^=\s*[-+]?\d+(\.\d+)?\s*$/.test(f)) hint = 'A typed number does not update when the data changes. Use the cell addresses.';
  }
  return { ok: res.ok, message: res.message, hint, spec, sheet, targets, results: res.results };
}

// ================================================================ Script Lab (JavaScript)
/** Run a piece of JavaScript with some variables, a console, serve() and a small stand-in for a web page.
 *  This function uses nothing outside itself, so its text can be sent to a worker and run there.
 *  Returns { logs, served, servedText, hasServed, page, error }. */
export function jsCore(source, vars, page, clicks) {
  const logs = [];
  const out = { logs, served: null, servedText: '', hasServed: false, page: {}, error: null };
  const text = (v, d) => {
    if (v === undefined) return 'undefined';
    if (v === null) return 'null';
    if (typeof v === 'string') return d ? JSON.stringify(v) : v;
    if (typeof v === 'function') return '[a function]';
    if (Array.isArray(v)) return d > 4 ? '[…]' : `[${v.map((x) => text(x, d + 1)).join(', ')}]`;
    if (typeof v === 'object') { if (v._el) return `<element #${v.id}>`; return d > 4 ? '{…}' : `{ ${Object.keys(v).map((k) => `${k}: ${text(v[k], d + 1)}`).join(', ')} }`; }
    return String(v);
  };
  const flat = (v, d) => {
    if (v === undefined) return { $: 'undefined' };
    if (typeof v === 'function') return { $: 'function' };
    if (typeof v === 'number' && !Number.isFinite(v)) return { $: String(v) };
    if (typeof v === 'bigint' || typeof v === 'symbol') return { $: String(v) };
    if (Array.isArray(v)) return d > 6 ? { $: 'deep' } : v.map((x) => flat(x, d + 1));
    if (v && typeof v === 'object') { if (v._el) return { $: `element #${v.id}` }; if (d > 6) return { $: 'deep' }; const o = {}; Object.keys(v).forEach((k) => { o[k] = flat(v[k], d + 1); }); return o; }
    return v;
  };
  const log = (...a) => { if (logs.length < 100) logs.push(a.map((x) => text(x, 0)).join(' ')); };
  const fakeConsole = { log, info: log, warn: log, error: log };
  const serve = (v) => { out.hasServed = true; out.served = flat(v, 0); out.servedText = text(v, 1); };
  const els = {};
  Object.keys(page || {}).forEach((id) => {
    const on = {};
    els[id] = { _el: true, id, textContent: page[id], onclick: null,
      addEventListener(type, fn) { if (typeof fn !== 'function') throw new TypeError('addEventListener needs a function as its second input'); (on[type] = on[type] || []).push(fn); },
      click() { const ev = { type: 'click', target: els[id] }; (on.click || []).forEach((fn) => fn(ev)); if (typeof els[id].onclick === 'function') els[id].onclick(ev); } };
  });
  const find = (sel) => { const s = String(sel); return s[0] === '#' && els[s.slice(1)] ? els[s.slice(1)] : null; };
  const fakeDocument = { querySelector: find, getElementById: (id) => els[id] || null };
  const names = Object.keys(vars || {});
  const hidden = ['self', 'globalThis', 'fetch', 'XMLHttpRequest', 'importScripts', 'postMessage', 'WebSocket', 'indexedDB', 'caches'];
  try {
    const fn = new Function('console', 'serve', 'document', ...names, ...hidden, `"use strict";\n${source}`);
    fn(fakeConsole, serve, fakeDocument, ...names.map((k) => vars[k]));
    if (clicks && els[clicks.id]) for (let i = 0; i < clicks.n; i++) els[clicks.id].click();
  } catch (e) {
    out.error = { name: (e && e.name) || 'Error', message: (e && e.message) || String(e) };
  }
  Object.keys(els).forEach((id) => { out.page[id] = text(els[id].textContent, 0); });
  return out;
}

const QUEUE = ['Ana', 'Ben', 'Cleo', 'Dev', 'Eli', 'Fay', 'Gus', 'Hana'];
const shuffled = (r, list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const prices = (r) => Array.from({ length: ri(r, 4, 6) }, () => ri(r, 2, 6));
const cupOrders = (r) => { const o = Array.from({ length: ri(r, 4, 6) }, () => ({ drink: pick(r, MENU)[0], cups: ri(r, 1, 5) })); o[0].cups = 3; o[1].cups = 2; return o; };

export const JS_LEVELS = [
  { id: 'log', title: 'Say something', concept: 'console.log()', judge: 'log',
    teach: ['<b>JavaScript</b> is the language that runs inside web pages. console.log() writes a message to the console, the place programmers look to see what their code is doing.', 'Text goes in quotes, and each instruction ends with a semicolon.'],
    goal: 'Log exactly: Open for coffee',
    given: () => ({}), expect: () => 'Open for coffee',
    starter: 'console.log("Hello");\n', hint: 'console.log("Open for coffee");', solution: 'console.log("Open for coffee");' },
  { id: 'variables', title: 'Name your values', concept: 'const and let',
    teach: ['A <b>variable</b> is a name that holds a value. <b>const</b> makes one that never changes; <b>let</b> makes one you can change later.', 'const total = price * cups; works out the right-hand side and stores it under the name total. serve() hands your answer over.'],
    goal: 'Work out what the customer owes (price times cups) and serve it.',
    given: (r) => ({ price: ri(r, 2, 5), cups: ri(r, 2, 6) }), expect: (v) => v.price * v.cups,
    starter: 'const total = price;\nserve(total);\n', hint: 'const total = price * cups;', solution: 'const total = price * cups;\nserve(total);' },
  { id: 'template', title: 'Fill in the blanks', concept: 'Template strings',
    teach: ['Text in backticks is a <b>template string</b>. Anything inside ${ } is worked out and dropped into the text: `Table ${n}`.', 'Unlike Python, JavaScript will also join text and a number with +, turning the number into text for you. Templates are easier to read.'],
    goal: 'Serve the sentence for the ticket, such as: Ana ordered 3 cups',
    given: (r) => ({ name: pick(r, QUEUE), cups: ri(r, 2, 9) }), expect: (v) => `${v.name} ordered ${v.cups} cups`,
    starter: 'const ticket = `${name} ordered`;\nserve(ticket);\n', hint: '`${name} ordered ${cups} cups`', solution: 'const ticket = `${name} ordered ${cups} cups`;\nserve(ticket);' },
  { id: 'if', title: 'Make a choice', concept: 'if, else and ===',
    teach: ['if (test) { … } else { … } runs one block or the other. The test goes in round brackets and each block in curly braces.', 'Compare with <b>===</b> (exactly equal), and with &lt;, &gt;, &lt;= and &gt;=. A single = stores a value; it does not compare.'],
    goal: 'Serve "Bulk" when cups is 5 or more, and "Single" otherwise.',
    given: (r) => ({ cups: ri(r, 1, 9) }), also: [{ cups: 5 }, { cups: 4 }], expect: (v) => (v.cups >= 5 ? 'Bulk' : 'Single'),
    starter: 'if (cups > 5) {\n    serve("Bulk");\n}\n', hint: 'Use >= so that exactly 5 counts, and add: else { serve("Single"); }', solution: 'if (cups >= 5) {\n    serve("Bulk");\n} else {\n    serve("Single");\n}' },
  { id: 'arrays', title: 'The queue', concept: 'Arrays',
    teach: ['An <b>array</b> is a list of values in order, in square brackets: ["Ana", "Ben", "Cleo"]. Positions count from 0, so queue[0] is the first.', 'queue.length is how many items there are, so the last one is at queue[queue.length - 1]. queue.push("Dev") adds to the end.'],
    goal: 'Serve the name of the last person in the queue.',
    given: (r) => ({ queue: shuffled(r, QUEUE).slice(0, ri(r, 3, 6)) }), expect: (v) => v.queue[v.queue.length - 1],
    starter: 'serve(queue[0]);\n', hint: 'serve(queue[queue.length - 1]);', solution: 'serve(queue[queue.length - 1]);' },
  { id: 'loop', title: 'Add them up', concept: 'for … of loops',
    teach: ['for (const p of prices) { … } runs the block once for each item in the array, with p holding that item.', 'To add things up, start a total at 0 with let (it will change), and add to it each time round: total += p;'],
    goal: 'Serve the sum of all the numbers in prices.',
    given: (r) => ({ prices: prices(r) }), expect: (v) => sum(v.prices),
    starter: 'let total = 0;\nfor (const p of prices) {\n    total = p;\n}\nserve(total);\n', hint: 'total += p; adds p to the running total.', solution: 'let total = 0;\nfor (const p of prices) {\n    total += p;\n}\nserve(total);' },
  { id: 'functions', title: 'Your own command', concept: 'Functions',
    teach: ['A <b>function</b> is a named set of steps. function bill(price, cups) { … } takes inputs in its brackets, and <b>return</b> hands a value back.', 'Nothing happens until the function is called: bill(3, 2). A short function can also be written with an arrow: const bill = (price, cups) => price * cups;'],
    goal: 'Write a function bill(price, cups) that returns price times cups, then serve bill(price, cups).',
    given: (r) => ({ price: ri(r, 2, 5), cups: ri(r, 2, 6) }), expect: (v) => v.price * v.cups,
    needs: [[/function\s+\w+\s*\(|=>/, 'The answer is right, but this level asks for a function.', 'Write function bill(price, cups) { return price * cups; } and serve bill(price, cups).']],
    starter: 'function bill(price, cups) {\n    return price;\n}\nserve(bill(price, cups));\n', hint: 'return price * cups;', solution: 'function bill(price, cups) {\n    return price * cups;\n}\nserve(bill(price, cups));' },
  { id: 'objects', title: 'One order, many facts', concept: 'Objects',
    teach: ['An <b>object</b> groups named values in curly braces: { drink: "latte", price: 3, cups: 2 }. Each name is a <b>property</b>.', 'Read a property with a dot: order.price. Data from a web server nearly always arrives as objects like this (the format is called JSON).'],
    goal: 'The order is an object. Serve what it costs: its price times its cups.',
    given: (r) => ({ order: { drink: pick(r, MENU)[0], price: ri(r, 2, 5), cups: ri(r, 2, 6) } }), expect: (v) => v.order.price * v.order.cups,
    starter: 'serve(order.price);\n', hint: 'serve(order.price * order.cups);', solution: 'serve(order.price * order.cups);' },
  { id: 'map', title: 'Change every item', concept: 'map() and arrow functions',
    teach: ['array.map(fn) makes a new array by running a function on every item. The function is usually a short <b>arrow function</b>: (p) => p + 1 takes p and gives back p + 1.', 'The original array is left alone. map replaces most loops that build a new list.'],
    goal: 'Every price goes up by 1. Serve the new array of prices.',
    given: (r) => ({ prices: prices(r) }), expect: (v) => v.prices.map((p) => p + 1),
    needs: [[/\.map\s*\(/, 'The answer is right, but this level practises .map().', 'serve(prices.map((p) => p + 1));']],
    starter: 'const raised = prices.map((p) => p);\nserve(raised);\n', hint: '(p) => p + 1', solution: 'const raised = prices.map((p) => p + 1);\nserve(raised);' },
  { id: 'filter', title: 'Keep only some', concept: 'filter()',
    teach: ['array.filter(fn) makes a new array with only the items for which the function says true.', 'orders is an array of objects, so the test looks at a property: (o) => o.cups >= 3 keeps the orders of 3 cups or more.'],
    goal: 'Serve how many orders are for 3 cups or more.',
    given: (r) => ({ orders: cupOrders(r) }), expect: (v) => v.orders.filter((o) => o.cups >= 3).length,
    needs: [[/\.filter\s*\(/, 'The answer is right, but this level practises .filter().', 'const big = orders.filter((o) => o.cups >= 3);']],
    starter: 'const big = orders.filter((o) => o.cups > 3);\nserve(big);\n', hint: 'Use >= 3, and serve big.length (how many), not the array itself.', solution: 'const big = orders.filter((o) => o.cups >= 3);\nserve(big.length);' },
  { id: 'dom', title: 'Change the page', concept: 'Changing the page (the DOM)', judge: 'page',
    teach: ['This is what JavaScript is for: changing a web page while someone is looking at it. The browser keeps the page as a tree of elements called the <b>DOM</b>.', 'document.querySelector("#sign") finds the element whose id is sign (the # means id, as in CSS). Setting its textContent changes the words on the page.'],
    goal: 'Change the sign on the page to say Open until, then the hour held in closes. For example: Open until 6',
    given: (r) => ({ closes: ri(r, 4, 9) }), page: () => ({ sign: 'Closed' }), expect: (v) => ({ sign: `Open until ${v.closes}` }),
    starter: 'const sign = document.querySelector("#sign");\nsign.textContent = "Open";\n', hint: 'sign.textContent = `Open until ${closes}`;', solution: 'const sign = document.querySelector("#sign");\nsign.textContent = `Open until ${closes}`;' },
  { id: 'events', title: 'React to a click', concept: 'Events', judge: 'page',
    teach: ['Pages wait for things to happen: a click, a key press, a form being sent. These are <b>events</b>.', 'button.addEventListener("click", () => { … }) hands the browser a function to run every time the button is clicked. The function is not run now; it is kept for later.'],
    goal: 'Each click on the button should add 1 to cups and show the new number in #count. Press Run, then click the button on the page.',
    given: () => ({}), page: () => ({ count: '0', add: 'Add a cup' }), clicks: [3, 1, 5], clickId: 'add', expect: (v, n) => ({ count: String(n) }),
    starter: 'let cups = 0;\nconst button = document.querySelector("#add");\nbutton.addEventListener("click", () => {\n    cups = cups + 1;\n});\n', hint: 'Inside the function, after adding 1: document.querySelector("#count").textContent = cups;',
    solution: 'let cups = 0;\nconst button = document.querySelector("#add");\nbutton.addEventListener("click", () => {\n    cups = cups + 1;\n    document.querySelector("#count").textContent = cups;\n});' },
];

/** Habits from other languages, caught before the code runs so the message can be kind. */
export function jsLint(source) {
  const code = source.replace(/\/\/.*$/gm, '').replace(/`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/g, '""');
  const at = (re) => { const m = re.exec(code); return m ? code.slice(0, m.index).split('\n').length : 0; };
  const rules = [
    [/\bprint\s*\(/, 'JavaScript has no print().', 'Use console.log("…") to show a message.'],
    [/^\s*def\s/m, 'def is Python.', 'In JavaScript a function is written: function bill(price, cups) { … }'],
    [/\belif\b/, 'elif is Python.', 'JavaScript writes it as two words: else if (test) { … }'],
    [/\b(True|False|None)\b/, 'JavaScript spells these in lower case.', 'true, false and null.'],
    [/\b(and|or|not)\s/, 'JavaScript does not use the words and, or, not.', 'Use && for and, || for or, and ! for not.'],
    [/^\s*(if|for|while)\b[^{\n]*:\s*$/m, 'JavaScript does not end these lines with a colon.', 'Put the test in round brackets and the block in curly braces: if (cups >= 5) { … }'],
  ];
  for (const [re, message, hint] of rules) { const line = at(re); if (line) return { message, hint, line }; }
  return null;
}
const jsHint = (e, level) => {
  const m = e.message;
  if (e.name === 'Timeout') return 'A loop probably never ends. Check that its test can become false.';
  if (/already been declared/.test(m)) return 'That name is already taken. The ticket gives you some names ready-made: use them as they are, or pick a different name for yours.';
  if (e.name === 'SyntaxError') return 'JavaScript could not read the code. Check that every bracket, brace and quote that opens also closes.';
  if (/is not defined/.test(m)) return 'Check the spelling and capitals. A new name has to be made first with const or let.';
  if (/constant/.test(m)) return 'A const cannot be changed. If the value needs to change, make it with let.';
  if (/null|undefined/.test(m) && level.page) return `document.querySelector() found nothing, so there was nothing to change. The ids on this page are: ${Object.keys(level.page()).map((k) => `#${k}`).join(', ')}.`;
  if (/is not a function/.test(m)) return 'Something is being called with brackets that is not a function. Check the name before the brackets.';
  if (/undefined/.test(m)) return 'A value is missing where the code expects one. Check property names and positions in arrays.';
  return '';
};
const jsSame = (a, b) => (typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) < 1e-9 : Array.isArray(a) && Array.isArray(b) ? a.length === b.length && a.every((x, i) => jsSame(x, b[i])) : a && b && typeof a === 'object' && typeof b === 'object' ? !Array.isArray(a) && !Array.isArray(b) && Object.keys(a).length === Object.keys(b).length && Object.keys(a).every((k) => jsSame(a[k], b[k])) : a === b);
const jsText = (v) => (typeof v === 'string' ? JSON.stringify(v) : Array.isArray(v) ? `[${v.map(jsText).join(', ')}]` : v && typeof v === 'object' ? (v.$ ? v.$ : `{ ${Object.entries(v).map(([k, x]) => `${k}: ${jsText(x)}`).join(', ')} }`) : String(v));

/** The three runs a Script Lab level is checked on: the one shown, then two that are not. [{ vars, page, clicks }] */
export function jsCases(level, seed = 1) {
  return [0, 1, 2].map((i) => {
    const vars = { ...level.given(mulberry32(seed + 101 * i)), ...(i && level.also ? level.also[i - 1] : {}) };
    return { vars, page: level.page ? level.page(vars) : null, clicks: level.clicks ? { id: level.clickId, n: level.clicks[i] } : null };
  });
}
/** Judge the results of running a learner's source on jsCases(level, seed). Returns { ok, error, logs, shown, page }. */
export function jsJudge(level, source, cases, results) {
  const first = results[0];
  const out = { ok: false, error: null, logs: first ? first.logs : [], shown: first && first.hasServed ? first.servedText : null, page: first ? first.page : {} };
  const verdict = (c, res) => {
    const want = level.expect(c.vars, c.clicks ? c.clicks.n : 0);
    if (level.judge === 'log') return { ok: res.logs.join('\n').trim() === want, got: res.logs.join(' / '), want, none: !res.logs.length };
    if (level.judge === 'page') { const bad = Object.keys(want).find((k) => res.page[k] !== want[k]); return { ok: !bad, got: bad ? res.page[bad] : '', want: bad ? want[bad] : '', id: bad }; }
    return { ok: res.hasServed && jsSame(res.served, want), got: res.servedText, want: jsText(want), none: !res.hasServed, wantType: Array.isArray(want) ? 'array' : typeof want, gotType: Array.isArray(res.served) ? 'array' : typeof res.served };
  };
  if (first.error) { out.error = { message: `${first.error.name}: ${first.error.message}`, hint: jsHint(first.error, level) }; return out; }
  const v = verdict(cases[0], first);
  if (!v.ok) {
    if (level.judge === 'log') out.error = v.none ? { message: 'The code ran but logged nothing.', hint: 'Use console.log("…") to show a message.' } : { message: `It logged “${v.got}”, but the goal is “${v.want}”.`, hint: 'Capitals, spaces and spelling all count.' };
    else if (level.judge === 'page') out.error = { message: cases[0].clicks ? `After ${cases[0].clicks.n} clicks #${v.id} shows “${v.got}”, but it should show “${v.want}”.` : `#${v.id} shows “${v.got}”, but it should show “${v.want}”.`, hint: cases[0].clicks ? 'Change the page inside the function that runs on each click.' : 'Set the element’s textContent.' };
    else if (v.none) out.error = { message: 'The code ran but never called serve().', hint: 'Hand over your answer with serve(answer);' };
    else out.error = { message: `You served ${v.got}, but the customer expected ${v.want}.`, hint: v.wantType !== v.gotType && v.gotType !== 'object' ? `The goal needs ${v.wantType === 'string' ? 'text' : v.wantType === 'number' ? 'a number' : 'an array'}, and you served ${v.gotType === 'string' ? 'text' : v.gotType === 'number' ? 'a number' : v.gotType === 'array' ? 'an array' : `a ${v.gotType}`}.` : 'Follow your code line by line with the values on the ticket.' };
    return out;
  }
  for (const [re, message, hint] of level.needs || []) if (!re.test(source)) { out.error = { message, hint }; return out; }
  for (let i = 1; i < cases.length; i++) {
    const res = results[i], w = res.error ? { ok: false } : verdict(cases[i], res);
    if (!w.ok) {
      const given = Object.entries(cases[i].vars).map(([k, x]) => `${k} = ${jsText(x)}`).join(', ');
      out.error = { message: level.judge === 'page' && cases[i].clicks ? `That works for ${cases[0].clicks.n} clicks, but not for ${cases[i].clicks.n}.` : 'That works this time, but not for the next customer.', hint: res.error ? `With ${given} it stopped with ${res.error.name}: ${res.error.message}` : level.judge === 'page' ? `It should then show “${w.want}”, and yours shows “${w.got}”.` : `With ${given} it should give ${w.want}, and yours gave ${w.none ? 'nothing' : w.got}. Use the variables rather than typing their values in.` };
      return out;
    }
  }
  out.ok = true;
  return out;
}
/** Run and judge in one go, on this thread (the tests use this; the game runs the code in a worker instead). */
export function jsRunSync(level, source, seed = 1) {
  const lint = jsLint(source);
  if (lint) return { ok: false, error: lint, logs: [], shown: null, page: level.page ? level.page({}) : {} };
  const cases = jsCases(level, seed);
  return jsJudge(level, source, cases, cases.map((c) => jsCore(source, c.vars, c.page, c.clicks)));
}
