// levels.js — the levels of the three teaching games, and the rules that judge them. No drawing here, so
// tests/arcade.test.mjs can run every reference solution.
import { parse, exec, countLines, PyError, show, fromJs, toJs } from './minipy.js?v=40';
import { parseCss, styleTree } from './minicss.js?v=40';
import { mulberry32 } from '../core/rng.js?v=40';
import { query, sameResult } from './minisql.js?v=40';

// ================================================================ Py Quest (Python)
// Maps are 10 x 7. '#' hedge, '~' pond, '.' grass, 'F' flower, 'H' hive. start = [x, y, facing].
// A level with several maps picks one at random each run, so a program has to read the garden, not memorise it.
export const PY_LEVELS = [
  {
    id: 'first-flight', title: 'First flight', concept: 'Calling a function',
    teach: ['A program is a list of instructions, run from the top line down, one at a time.', 'move() is a <b>function call</b>: a name, then brackets. The brackets are what make it run. Python is exact: Move() or move are not the same thing.'],
    goal: 'Fly to the flower and collect its pollen.',
    api: ['move()', 'collect()'],
    maps: [['##########', '#........#', '#........#', '#....F...#', '#........#', '#........#', '##########']],
    start: [2, 3, 'E'], par: 4,
    starter: '# Bee faces east. Each move() flies one tile.\nmove()\n',
    hint: 'The flower is three tiles ahead: three move() lines, then collect().',
    solution: 'move()\nmove()\nmove()\ncollect()',
  },
  {
    id: 'turning', title: 'Left and right', concept: 'Order matters',
    teach: ['turn_left() and turn_right() spin the bee a quarter turn without moving it.', 'The same lines in a different order give a different flight. When a program goes wrong, read it line by line and follow the bee with your finger.'],
    goal: 'Collect the flower up in the north-east.',
    api: ['move()', 'turn_left()', 'turn_right()', 'collect()'],
    maps: [['##########', '#........#', '#....F...#', '#........#', '#........#', '#........#', '##########']],
    start: [2, 4, 'E'], par: 7,
    starter: 'move()\nmove()\nmove()\n',
    hint: 'Three tiles east, turn_left() to face north, two tiles up, collect().',
    solution: 'move()\nmove()\nmove()\nturn_left()\nmove()\nmove()\ncollect()',
  },
  {
    id: 'arguments', title: 'Say how far', concept: 'Arguments',
    teach: ['A value inside the brackets is an <b>argument</b>: extra information for the function.', 'move(7) flies seven tiles in one line. move() with nothing inside still means one tile.'],
    goal: 'Collect both flowers in five lines or fewer.',
    api: ['move(n)', 'turn_left()', 'turn_right()', 'collect()'],
    maps: [['##########', '#.......F#', '#........#', '#........#', '#........#', '#.......F#', '##########']],
    start: [1, 5, 'E'], par: 5,
    starter: 'move(7)\n',
    hint: 'move(7), collect(), turn_left(), move(4), collect().',
    solution: 'move(7)\ncollect()\nturn_left()\nmove(4)\ncollect()',
  },
  {
    id: 'for-loops', title: 'Again and again', concept: 'for loops',
    teach: ['for i in range(6): repeats the indented lines under it six times.', 'The colon opens the loop. The <b>indentation</b> (four spaces) says which lines are inside it. Lines that are not indented run once, after the loop ends.'],
    goal: 'Six flowers in a row. Collect them all in three lines.',
    api: ['move()', 'collect()', 'for i in range(n):'],
    maps: [['##########', '#........#', '#........#', '#.FFFFFF.#', '#........#', '#........#', '##########']],
    start: [1, 3, 'E'], par: 3,
    starter: 'for i in range(2):\n    move()\n    collect()\n',
    hint: 'Change range(2) to range(6). Both indented lines repeat.',
    solution: 'for i in range(6):\n    move()\n    collect()',
  },
  {
    id: 'patterns', title: 'Round the pond', concept: 'Spot the pattern',
    teach: ['Before writing a loop, find the part that repeats. Here one side of the pond is: fly four tiles, collect, turn left.', 'That happens four times, so the whole flight is one loop of three lines.'],
    goal: 'Collect the flower at each corner of the pond.',
    api: ['move(n)', 'turn_left()', 'collect()', 'for i in range(n):'],
    maps: [['##########', '#.F...F..#', '#..~~~...#', '#..~~~...#', '#..~~~...#', '#.F...F..#', '##########']],
    start: [2, 5, 'E'], par: 4,
    starter: 'for i in range(4):\n    move(4)\n',
    hint: 'Inside the loop: move(4), then collect(), then turn_left().',
    solution: 'for i in range(4):\n    move(4)\n    collect()\n    turn_left()',
  },
  {
    id: 'variables', title: 'The growing spiral', concept: 'Variables',
    teach: ['A <b>variable</b> is a name for a value: steps = 1 stores 1 under the name steps.', 'steps = steps + 1 works out the right-hand side first (the old value plus one), then stores the answer back. So each time round the loop, move(steps) flies one tile further.'],
    goal: 'The flowers sit on a spiral: each side is one tile longer than the last.',
    api: ['move(n)', 'turn_left()', 'collect()', 'for i in range(n):', 'name = value'],
    maps: [['##########', '#.F..F...#', '#........#', '#....F...#', '#........#', '#.F....F.#', '##########']],
    start: [4, 3, 'E'], par: 6,
    starter: 'steps = 1\nfor i in range(5):\n    move(steps)\n',
    hint: 'In the loop: move(steps), collect(), turn_left(), then steps = steps + 1.',
    solution: 'steps = 1\nfor i in range(5):\n    move(steps)\n    collect()\n    turn_left()\n    steps = steps + 1',
  },
  {
    id: 'if', title: 'Only if there is one', concept: 'if',
    teach: ['on_flower() answers a question with True or False. if on_flower(): runs its indented lines only when the answer is True.', 'The flowers move every time you run, and collect() on an empty tile is an error, so the program has to check first.'],
    goal: 'Fly along the row and collect every flower, wherever they are this time.',
    api: ['move()', 'collect()', 'on_flower()', 'for i in range(n):', 'if test:'],
    maps: [
      ['##########', '#........#', '#........#', '#..F.FF.F#', '#........#', '#........#', '##########'],
      ['##########', '#........#', '#........#', '#.F..F.F.#', '#........#', '#........#', '##########'],
      ['##########', '#........#', '#........#', '#.FF...FF#', '#........#', '#........#', '##########'],
      ['##########', '#........#', '#........#', '#...F.F..#', '#........#', '#........#', '##########'],
    ],
    start: [1, 3, 'E'], par: 4,
    starter: 'for i in range(7):\n    move()\n    collect()\n',
    hint: 'Put the collect() inside an if: the line if on_flower(): and then collect() indented once more.',
    solution: 'for i in range(7):\n    move()\n    if on_flower():\n        collect()',
  },
  {
    id: 'while', title: 'As far as it goes', concept: 'while loops',
    teach: ['A for loop repeats a set number of times. A <b>while</b> loop repeats for as long as its test is True, so it suits jobs where you cannot know the count in advance.', 'path_clear() is True when the tile ahead is open. The hedge moves each run.'],
    goal: 'The flower is at the end of the tunnel, and the tunnel changes length every run.',
    api: ['move()', 'collect()', 'path_clear()', 'while test:'],
    maps: [
      ['##########', '##########', '##########', '#...F#####', '##########', '##########', '##########'],
      ['##########', '##########', '##########', '#.....F###', '##########', '##########', '##########'],
      ['##########', '##########', '##########', '#.......F#', '##########', '##########', '##########'],
      ['##########', '##########', '##########', '#..F######', '##########', '##########', '##########'],
    ],
    start: [1, 3, 'E'], par: 3,
    starter: 'while path_clear():\n',
    hint: 'while path_clear(): with move() indented under it, then collect() on a line with no indent.',
    solution: 'while path_clear():\n    move()\ncollect()',
  },
  {
    id: 'else', title: 'Home through the maze', concept: 'if / else and not',
    teach: ['else: gives an if a second branch, run when the test is False. Exactly one of the two branches runs.', 'not flips True and False, so while not at_hive(): keeps going until the bee is home.'],
    goal: 'Find the hive. Every corner of this maze is a left turn.',
    api: ['move()', 'turn_left()', 'path_clear()', 'at_hive()', 'while test:', 'if test: / else:', 'not'],
    maps: [
      ['##########', '###......#', '###.####.#', '###H####.#', '########.#', '#........#', '##########'],
      ['##########', '#.########', '#.##H....#', '#.######.#', '#.######.#', '#........#', '##########'],
    ],
    starts: [[1, 5, 'E'], [1, 1, 'S']], par: 5,
    starter: 'while not at_hive():\n    if path_clear():\n        move()\n',
    hint: 'Add else: lined up with the if, and under it turn_left().',
    solution: 'while not at_hive():\n    if path_clear():\n        move()\n    else:\n        turn_left()',
  },
  {
    id: 'def', title: 'Teach the bee a word', concept: 'Defining functions',
    teach: ['def sweep(): makes a new command out of the indented lines under it. Nothing happens when Python reads the def. The lines run each time you call sweep().', 'Naming a step lets you write it once and use it three times, and makes the rest of the program read like a plan.'],
    goal: 'Three rows of five flowers. Write the row once and reuse it.',
    api: ['move(n)', 'turn_left()', 'turn_right()', 'collect()', 'for i in range(n):', 'def name():'],
    maps: [['##########', '#.FFFFF..#', '#........#', '#FFFFF...#', '#........#', '#.FFFFF..#', '##########']],
    start: [1, 1, 'E'], par: 13,
    starter: 'def sweep():\n    for i in range(5):\n        move()\n        collect()\n\nsweep()\nturn_right()\nmove(2)\nturn_right()\n',
    hint: 'After the second sweep() the bee faces west: turn_left(), move(2), turn_left(), then sweep() again.',
    solution: 'def sweep():\n    for i in range(5):\n        move()\n        collect()\n\nsweep()\nturn_right()\nmove(2)\nturn_right()\nsweep()\nturn_left()\nmove(2)\nturn_left()\nsweep()',
  },
];

const DIRS = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
const LEFT = { N: 'W', W: 'S', S: 'E', E: 'N' };
const RIGHT = { N: 'E', E: 'S', S: 'W', W: 'N' };

/** Run `source` on one map of a level. Returns { ok, frames, error, lines, stars, left }. */
export function pyRun(level, source, variant = 0) {
  const map = level.maps[variant % level.maps.length];
  const [sx, sy, sd] = level.starts ? level.starts[variant % level.starts.length] : level.start;
  const flowers = new Set();
  let hive = null;
  map.forEach((row, y) => [...row].forEach((c, x) => { if (c === 'F') flowers.add(`${x},${y}`); if (c === 'H') hive = `${x},${y}`; }));
  const total = flowers.size;
  const bee = { x: sx, y: sy, d: sd };
  const open = (x, y) => map[y] && map[y][x] && map[y][x] !== '#' && map[y][x] !== '~';
  const frames = [{ ...bee, line: 0, ev: 'start' }];
  const snap = (line, ev, extra = {}) => frames.push({ ...bee, line, ev, ...extra });
  const host = {
    actions: { move: 1, turn_left: 0, turn_right: 0, collect: 0 },
    sensors: {
      path_clear: () => { const [dx, dy] = DIRS[bee.d]; return !!open(bee.x + dx, bee.y + dy); },
      on_flower: () => flowers.has(`${bee.x},${bee.y}`),
      at_hive: () => `${bee.x},${bee.y}` === hive,
    },
  };
  const result = { ok: false, frames, error: null, lines: countLines(source), stars: 0, left: total, total, variant };
  try {
    const program = parse(source);
    exec(program, host, (step) => {
      if (step.action === '_set') { snap(step.line, 'set', { name: step.args[0], value: step.args[1] }); return; }
      if (step.action === 'move') {
        const n = step.args.length ? step.args[0] : 1;
        for (let i = 0; i < n; i++) {
          const [dx, dy] = DIRS[bee.d];
          if (!open(bee.x + dx, bee.y + dy)) { snap(step.line, 'bump'); throw new PyError(map[bee.y + dy][bee.x + dx] === '~' ? 'Splash! The bee flew into the pond.' : 'Bump! The bee flew into the hedge.', step.line, 'Count the tiles again, or check which way the bee is facing.'); }
          bee.x += dx; bee.y += dy; snap(step.line, 'move');
        }
      } else if (step.action === 'turn_left') { bee.d = LEFT[bee.d]; snap(step.line, 'turn'); }
      else if (step.action === 'turn_right') { bee.d = RIGHT[bee.d]; snap(step.line, 'turn'); }
      else if (step.action === 'collect') {
        const k = `${bee.x},${bee.y}`;
        if (!flowers.has(k)) { snap(step.line, 'miss'); throw new PyError('There is no flower on this tile to collect.', step.line, level.api.includes('on_flower()') ? 'Check first with if on_flower():' : 'Move onto the flower before you collect().'); }
        flowers.delete(k); snap(step.line, 'collect', { at: k });
      }
    });
  } catch (e) {
    if (!(e instanceof PyError)) throw e;
    result.error = { message: e.message, line: e.line, hint: e.hint };
    result.left = flowers.size;
    return result;
  }
  result.left = flowers.size;
  const home = !hive || `${bee.x},${bee.y}` === hive;
  result.ok = flowers.size === 0 && home;
  if (!result.ok) result.error = { message: flowers.size ? `The program finished, but ${flowers.size} flower${flowers.size > 1 ? 's are' : ' is'} still waiting.` : 'The program finished, but the bee is not at the hive.', line: 0, hint: 'Follow the bee line by line to see where it stopped.' };
  else result.stars = result.lines <= level.par ? 3 : result.lines <= level.par + 3 ? 2 : 1;
  return result;
}

// ================================================================ Query Quest (SQL)
// Lantern Coffee is the fictional business used in the analytics courses. These tables are made up for the game.
export const SQL_DB = {
  menu: {
    columns: ['id', 'item', 'category', 'price', 'stock'],
    rows: [
      [1, 'Espresso', 'Coffee', 2.2, 40], [2, 'Latte', 'Coffee', 3.4, 35], [3, 'Flat White', 'Coffee', 3.2, 28], [4, 'Mocha', 'Coffee', 3.8, 12],
      [5, 'Green Tea', 'Tea', 2.6, 22], [6, 'Chai', 'Tea', 3.1, 9], [7, 'Earl Grey', 'Tea', 2.4, 30],
      [8, 'Croissant', 'Bakery', 2.8, 14], [9, 'Muffin', 'Bakery', 2.5, 0], [10, 'Brownie', 'Bakery', 3.0, 18], [11, 'Scone', 'Bakery', 2.3, 6],
      [12, 'Hot Chocolate', 'Other', 3.5, 20],
    ],
  },
  orders: {
    columns: ['id', 'customer', 'city', 'item', 'qty'],
    rows: [
      [1, 'Ana', 'Leeds', 'Latte', 2], [2, 'Ben', 'York', 'Espresso', 1], [3, 'Cleo', 'Leeds', 'Croissant', 3], [4, 'Dev', 'Hull', 'Chai', 1], [5, 'Ana', 'Leeds', 'Brownie', 2],
      [6, 'Eli', 'York', 'Latte', 1], [7, 'Fay', 'Leeds', 'Mocha', 2], [8, 'Ben', 'York', 'Muffin', 4], [9, 'Gus', 'Hull', 'Latte', 3], [10, 'Cleo', 'Leeds', 'Espresso', 2],
    ],
  },
};

export const SQL_LEVELS = [
  { id: 'select-all', title: 'Open the stockroom', concept: 'SELECT and FROM', table: 'menu',
    teach: ['A table is a grid: every <b>row</b> is one thing (here, one item on the menu) and every <b>column</b> is one fact about it.', 'SELECT says which columns you want and FROM says which table. The star * means every column.'],
    goal: 'Show every column of every row in the menu table.',
    starter: 'SELECT * FROM ', hint: 'SELECT * FROM menu', solution: 'SELECT * FROM menu' },
  { id: 'columns', title: 'Just the price list', concept: 'Choosing columns', table: 'menu',
    teach: ['Name the columns you want, separated by commas, in the order you want them.', 'Asking only for what you need keeps a result readable, and on a big database it is faster.'],
    goal: 'Show only the item and price columns.',
    starter: 'SELECT  FROM menu', hint: 'SELECT item, price FROM menu', solution: 'SELECT item, price FROM menu' },
  { id: 'where-text', title: 'Tea time', concept: 'WHERE', table: 'menu',
    teach: ['WHERE keeps only the rows that pass a test. It comes after FROM.', 'Text values go in <b>single quotes</b>: \'Tea\'. Without quotes SQL thinks Tea is a column name.'],
    goal: 'Show every column for the items whose category is Tea.',
    starter: 'SELECT * FROM menu WHERE ', hint: "SELECT * FROM menu WHERE category = 'Tea'", solution: "SELECT * FROM menu WHERE category = 'Tea'" },
  { id: 'where-number', title: 'The pricey ones', concept: 'Comparing numbers', table: 'menu',
    teach: ['Numbers are compared with =, <>, <, >, <= and >=, and are written without quotes.', '<> means “not equal to”.'],
    goal: 'Show the item and price of everything that costs more than 3.',
    starter: 'SELECT item, price FROM menu ', hint: 'Add WHERE price > 3', solution: 'SELECT item, price FROM menu WHERE price > 3' },
  { id: 'and', title: 'Two conditions', concept: 'AND and OR', table: 'menu',
    teach: ['AND keeps a row only if both tests are true. OR keeps it if either is.', 'When you mix them, AND is worked out first, so put brackets round an OR to be safe.'],
    goal: 'Show the item names of coffees that cost less than 3.50.',
    starter: "SELECT item FROM menu WHERE category = 'Coffee' ", hint: 'Add AND price < 3.5', solution: "SELECT item FROM menu WHERE category = 'Coffee' AND price < 3.5" },
  { id: 'order', title: 'Dearest first', concept: 'ORDER BY', table: 'menu', ordered: true,
    teach: ['A table has no natural order. If the order matters, ask for it with ORDER BY.', 'ORDER BY sorts smallest first (ASC). Add DESC for largest first.'],
    goal: 'Show item and price, most expensive first.',
    starter: 'SELECT item, price FROM menu ', hint: 'Add ORDER BY price DESC', solution: 'SELECT item, price FROM menu ORDER BY price DESC' },
  { id: 'limit', title: 'Three cheapest', concept: 'LIMIT', table: 'menu', ordered: true,
    teach: ['LIMIT 3 keeps only the first three rows of the result. It is always the last clause.', 'On its own LIMIT gives you any three rows. Sort first and it gives the top or bottom three.'],
    goal: 'Show the item and price of the three cheapest things on the menu, cheapest first.',
    starter: 'SELECT item, price FROM menu ', hint: 'ORDER BY price LIMIT 3', solution: 'SELECT item, price FROM menu ORDER BY price LIMIT 3' },
  { id: 'like', title: 'Starts with C', concept: 'LIKE', table: 'menu',
    teach: ['LIKE matches text against a pattern. The percent sign % stands for any run of characters.', "'C%' means starts with C. '%tea' means ends with tea. '%a%' means has an a anywhere."],
    goal: 'Show the names of items that start with the letter C.',
    starter: 'SELECT item FROM menu WHERE item LIKE ', hint: "SELECT item FROM menu WHERE item LIKE 'C%'", solution: "SELECT item FROM menu WHERE item LIKE 'C%'" },
  { id: 'distinct', title: 'Where do they come from?', concept: 'DISTINCT', table: 'orders',
    teach: ['The orders table has one row per order, so a city appears once for every order from it.', 'SELECT DISTINCT removes the repeats: each different value is returned once.'],
    goal: 'Show each city that has ordered, once each.',
    starter: 'SELECT city FROM orders', hint: 'SELECT DISTINCT city FROM orders', solution: 'SELECT DISTINCT city FROM orders' },
  { id: 'in', title: 'One of these', concept: 'IN', table: 'menu',
    teach: ["IN tests a value against a list: category IN ('Tea', 'Other') is true when the category is either one.", 'It says the same as two tests joined by OR, in less space.'],
    goal: 'Show the item and category of everything that is Tea or Bakery.',
    starter: 'SELECT item, category FROM menu WHERE category ', hint: "WHERE category IN ('Tea', 'Bakery')", solution: "SELECT item, category FROM menu WHERE category IN ('Tea', 'Bakery')" },
  { id: 'count', title: 'Running low', concept: 'COUNT', table: 'menu',
    teach: ['COUNT(*) is a <b>summary function</b>: it takes many rows and returns one number, the number of rows.', 'WHERE runs first, so COUNT(*) counts only the rows that passed the test.'],
    goal: 'How many items have fewer than 10 in stock? Return that one number.',
    starter: 'SELECT COUNT(*) FROM menu ', hint: 'Add WHERE stock < 10', solution: 'SELECT COUNT(*) FROM menu WHERE stock < 10' },
  { id: 'group', title: 'One row per category', concept: 'GROUP BY', table: 'menu',
    teach: ['GROUP BY category puts rows with the same category into one pile, then the summary function runs once per pile.', 'Every column in SELECT must either be in GROUP BY or be inside a summary function. Otherwise SQL cannot know which row’s value to show.'],
    goal: 'Show each category with the number of items in it.',
    starter: 'SELECT category, COUNT(*) FROM menu ', hint: 'Add GROUP BY category', solution: 'SELECT category, COUNT(*) FROM menu GROUP BY category' },
  { id: 'avg', title: 'Which category costs most?', concept: 'AVG with ORDER BY', table: 'menu', ordered: true,
    teach: ['SUM, AVG, MIN and MAX work like COUNT, on a column of numbers.', 'You can sort by a summary: ORDER BY AVG(price) DESC puts the category with the highest average first.'],
    goal: 'Show each category with its average price, highest average first.',
    starter: 'SELECT category, AVG(price) FROM menu GROUP BY category ', hint: 'Add ORDER BY AVG(price) DESC', solution: 'SELECT category, AVG(price) FROM menu GROUP BY category ORDER BY AVG(price) DESC' },
  { id: 'having', title: 'Busy cities', concept: 'HAVING', table: 'orders',
    teach: ['WHERE filters rows before they are grouped. HAVING filters the groups afterwards, so it can use a summary function.', 'This level uses the orders table: one row per order.'],
    goal: 'Show each city with its number of orders, but only cities with more than 2 orders.',
    starter: 'SELECT city, COUNT(*) FROM orders GROUP BY city ', hint: 'Add HAVING COUNT(*) > 2', solution: 'SELECT city, COUNT(*) FROM orders GROUP BY city HAVING COUNT(*) > 2' },
  { id: 'join', title: 'Two tables, one answer', concept: 'JOIN', table: 'orders',
    teach: ['orders knows what was bought and menu knows what it costs. JOIN puts the two side by side.', 'ON says how rows match: orders.item = menu.item. Both tables have an item column, so write the table name, a dot, then the column.'],
    goal: 'For every order show the customer, the item and the order’s value (qty times price).',
    starter: 'SELECT orders.customer, orders.item, qty * price\nFROM orders JOIN menu ON ', hint: 'Finish with ON orders.item = menu.item', solution: 'SELECT orders.customer, orders.item, qty * price FROM orders JOIN menu ON orders.item = menu.item' },
  { id: 'left-join', title: 'Never ordered', concept: 'LEFT JOIN and NULL', table: 'menu',
    teach: ['A plain JOIN drops menu items that nobody ordered, because they have no matching order. LEFT JOIN keeps every row of the left table and fills the missing side with NULL, which means “no value”.', 'Nothing equals NULL, so the test is IS NULL, never = NULL.'],
    goal: 'Show the names of menu items that have never been ordered.',
    starter: 'SELECT menu.item\nFROM menu LEFT JOIN orders ON menu.item = orders.item\n', hint: 'Add WHERE orders.id IS NULL', solution: 'SELECT menu.item FROM menu LEFT JOIN orders ON menu.item = orders.item WHERE orders.id IS NULL' },
  { id: 'boss', title: 'The manager’s question', concept: 'Putting it together', table: 'orders', ordered: true,
    teach: ['Real questions use several clauses at once. They always go in this order: SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT.', 'Build it in steps: join the tables, group by city, add up qty * price, then sort.'],
    goal: 'Show each city with its total sales value, biggest first.',
    starter: 'SELECT city, SUM(qty * price)\nFROM orders JOIN menu ON orders.item = menu.item\n', hint: 'GROUP BY city, then ORDER BY SUM(qty * price) DESC', solution: 'SELECT city, SUM(qty * price) FROM orders JOIN menu ON orders.item = menu.item GROUP BY city ORDER BY SUM(qty * price) DESC' },
];

/** Run a learner's query for a level. Returns { ok, result, error, why }. */
export function sqlRun(level, sql) {
  const want = query(level.solution, SQL_DB);
  let got;
  try { got = query(sql, SQL_DB); } catch (e) {
    if (e.name === 'SqlError' || e.hint !== undefined) return { ok: false, error: { message: e.message, hint: e.hint || '' } };
    throw e;
  }
  const ok = sameResult(got, want, !!level.ordered);
  let why = '';
  if (!ok) {
    if (got.columns.length !== want.columns.length) why = `The result should have ${want.columns.length} column${want.columns.length > 1 ? 's' : ''}; yours has ${got.columns.length}.`;
    else if (got.rows.length !== want.rows.length) why = `The result should have ${want.rows.length} row${want.rows.length > 1 ? 's' : ''}; yours has ${got.rows.length}.`;
    else if (level.ordered && sameResult(got, want, false)) why = 'These are the right rows, in the wrong order.';
    else why = 'The shape is right but some of the values are different. Check which columns and rows you asked for.';
  }
  return { ok, result: got, why };
}

// ================================================================ Tag Builder (HTML)
const VOID = new Set(['br', 'img', 'hr', 'input', 'meta', 'link']);
export const HTML_ALLOWED = ['h1', 'h2', 'h3', 'p', 'a', 'img', 'ul', 'ol', 'li', 'strong', 'em', 'br', 'hr', 'button', 'div', 'span', 'nav', 'header', 'footer', 'main', 'section'];

/** A small tag scanner: returns { nodes, error }. nodes are { tag, attrs, children, text } trees. */
export function htmlScan(src) {
  const root = { tag: '#root', attrs: {}, children: [] };
  const stack = [root];
  const re = /<\s*(\/?)\s*([A-Za-z][A-Za-z0-9]*)([^<>]*)>|<([^>]*)$|([^<]+)/g;
  let m;
  const err = (message, hint = '') => ({ nodes: root.children, error: { message, hint } });
  if (/<\s*>/.test(src)) return err('There is an empty pair of angle brackets.', 'A tag needs a name inside it, like <p>.');
  while ((m = re.exec(src))) {
    if (m[4] !== undefined) return err('A tag is opened with < but never closed with >.', `Finish the tag: <${m[4].trim().split(/\s/)[0] || 'p'}>`);
    if (m[5] !== undefined) { if (m[5].trim()) stack[stack.length - 1].children.push({ tag: '#text', text: m[5].replace(/\s+/g, ' ') }); continue; }
    const closing = m[1] === '/', tag = m[2].toLowerCase(), rest = m[3];
    if (m[2] !== tag) return err(`Write tag names in lower case: <${tag}> rather than <${m[2]}>.`);
    if (closing) {
      const top = stack[stack.length - 1];
      if (top.tag === tag) { stack.pop(); continue; }
      if (VOID.has(tag)) return err(`<${tag}> never has a closing tag.`, `Delete </${tag}>.`);
      if (stack.some((n) => n.tag === tag)) return err(`</${tag}> closes too early: <${top.tag}> is still open inside it.`, `Tags close in the reverse of the order they opened. Close </${top.tag}> first.`);
      return err(`</${tag}> has no opening <${tag}> before it.`);
    }
    if (!HTML_ALLOWED.includes(tag)) return err(`<${tag}> is not a tag this workshop knows.`, tag === 'b' ? 'Use <strong> for important text.' : tag === 'i' ? 'Use <em> for emphasis.' : /^h[7-9]$/.test(tag) ? 'Headings stop at <h6>.' : `Try one of: ${HTML_ALLOWED.slice(0, 10).map((t) => `<${t}>`).join(' ')} …`);
    const attrs = {};
    const body = rest.replace(/\/\s*$/, '');
    const are = /([A-Za-z-]+)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g;
    let a;
    if ((body.match(/"/g) || []).length % 2) return err(`An attribute value in <${tag}> has an opening quote but no closing quote.`, 'Attribute values go between two double quotes.');
    while ((a = are.exec(body))) attrs[a[1].toLowerCase()] = a[2] ?? a[3] ?? a[4] ?? '';
    const node = { tag, attrs, children: [] };
    stack[stack.length - 1].children.push(node);
    if (!VOID.has(tag)) stack.push(node);
  }
  if (stack.length > 1) { const open = stack[stack.length - 1].tag; return err(`<${open}> is never closed.`, `Add </${open}> after its content.`); }
  return { nodes: root.children, error: null };
}
const walk = (nodes, fn) => nodes.forEach((n) => { fn(n); if (n.children) walk(n.children, fn); });
const all = (nodes, tag) => { const out = []; walk(nodes, (n) => { if (n.tag === tag) out.push(n); }); return out; };
const textOf = (n) => (n.tag === '#text' ? n.text : (n.children || []).map(textOf).join('')).trim();
const kids = (n, tag) => (n.children || []).filter((c) => c.tag === tag);

export const HTML_LEVELS = [
  { id: 'heading', title: 'Paint the sign', concept: 'Elements and tags',
    teach: ['HTML marks up text with <b>tags</b>. An opening tag <h1>, some content, and a closing tag </h1> together make an <b>element</b>.', 'h1 is the main heading of a page. The closing tag is the same name with a slash in front.'],
    goal: 'Give the shop a main heading that says Lantern Coffee.',
    starter: '<h1></h1>', hint: '<h1>Lantern Coffee</h1>', solution: '<h1>Lantern Coffee</h1>',
    checks: [['There is one <h1> element', (n) => all(n, 'h1').length === 1], ['The heading says Lantern Coffee', (n) => all(n, 'h1').some((h) => /lantern coffee/i.test(textOf(h)))]] },
  { id: 'paragraph', title: 'Say hello', concept: 'Paragraphs',
    teach: ['<p> is a paragraph. A browser ignores the line breaks you type, so it is the tags that separate one block of text from the next.', 'Elements follow each other down the page in the order you write them.'],
    goal: 'Keep the heading and add a paragraph of welcome under it (any words you like).',
    starter: '<h1>Lantern Coffee</h1>\n', hint: 'Add a line: <p>Fresh coffee, roasted in Leeds.</p>', solution: '<h1>Lantern Coffee</h1>\n<p>Fresh coffee, roasted in Leeds.</p>',
    checks: [['The <h1> is still there', (n) => all(n, 'h1').length === 1], ['There is a <p> with some words in it', (n) => all(n, 'p').some((p) => textOf(p).length > 2)], ['The paragraph comes after the heading', (n) => { const i = n.findIndex((x) => x.tag === 'h1'), j = n.findIndex((x) => x.tag === 'p'); return i >= 0 && j > i; }]] },
  { id: 'nesting', title: 'Make a word stand out', concept: 'Nesting',
    teach: ['Elements can sit inside other elements. <strong> marks important text and <em> marks emphasis.', 'A tag opened inside another must close inside it too: <p><strong>…</strong></p>, never <p><strong>…</p></strong>.'],
    goal: 'Inside the paragraph, wrap the word free in <strong>.',
    starter: '<p>Every tenth coffee is free.</p>', hint: '<p>Every tenth coffee is <strong>free</strong>.</p>', solution: '<p>Every tenth coffee is <strong>free</strong>.</p>',
    checks: [['There is a <strong> inside the <p>', (n) => all(n, 'p').some((p) => all(p.children, 'strong').length > 0)], ['The <strong> holds the word free', (n) => all(n, 'strong').some((s) => /^free\.?$/i.test(textOf(s)))]] },
  { id: 'link', title: 'A door to the menu', concept: 'Attributes',
    teach: ['An <b>attribute</b> adds information to an opening tag: a name, an equals sign and a value in double quotes.', '<a> is a link. Its href attribute holds the address it goes to. The words between the tags are what people click.'],
    goal: 'Make a link with the words See the menu that goes to menu.html.',
    starter: '<a href="">See the menu</a>', hint: '<a href="menu.html">See the menu</a>', solution: '<a href="menu.html">See the menu</a>',
    checks: [['There is an <a> element', (n) => all(n, 'a').length > 0], ['Its href is menu.html', (n) => all(n, 'a').some((a) => a.attrs.href === 'menu.html')], ['The link text says See the menu', (n) => all(n, 'a').some((a) => /see the menu/i.test(textOf(a)))]] },
  { id: 'image', title: 'Hang a picture', concept: 'Images and alt text',
    teach: ['<img> shows a picture. It has no content, so it has no closing tag. src is the file to show.', 'alt is a description, read aloud by screen readers and shown if the picture fails to load. Try a file that does not exist and see what appears. The workshop has bee.png, sunflower.png and cup.png.'],
    goal: 'Show sunflower.png with an alt text that describes it.',
    starter: '<img src="" alt="">', hint: '<img src="sunflower.png" alt="A sunflower in a pot">', solution: '<img src="sunflower.png" alt="A sunflower in a pot">',
    checks: [['There is an <img>', (n) => all(n, 'img').length > 0], ['Its src is sunflower.png', (n) => all(n, 'img').some((i) => i.attrs.src === 'sunflower.png')], ['Its alt text describes the picture (3 letters or more)', (n) => all(n, 'img').some((i) => (i.attrs.alt || '').trim().length >= 3)]] },
  { id: 'list', title: 'Chalk up the menu', concept: 'Lists',
    teach: ['<ul> is an unordered (bulleted) list. Each item inside it is an <li>.', '<ol> is the same with numbers. A <li> only makes sense inside one of the two.'],
    goal: 'Make a bulleted list of three drinks.',
    starter: '<ul>\n  <li>Latte</li>\n</ul>', hint: 'Add two more lines like <li>Mocha</li> between <ul> and </ul>.', solution: '<ul>\n  <li>Latte</li>\n  <li>Mocha</li>\n  <li>Chai</li>\n</ul>',
    checks: [['There is a <ul>', (n) => all(n, 'ul').length > 0], ['It has exactly three <li> items', (n) => all(n, 'ul').some((u) => kids(u, 'li').length === 3)], ['Every item has some text', (n) => all(n, 'li').every((l) => textOf(l).length > 0)]] },
  { id: 'headings', title: 'Headings in order', concept: 'Document outline',
    teach: ['Headings make an outline. h1 is the page title, h2 a section inside it, h3 a part of that section.', 'Choose the level by meaning, not by size: do not jump from h1 to h3 because it looks smaller.'],
    goal: 'Under the h1, add two sections: an h2 that says Drinks and an h2 that says Bakery, each followed by a paragraph.',
    starter: '<h1>Lantern Coffee</h1>\n<h2>Drinks</h2>\n<p>Coffee and tea.</p>\n', hint: 'Add <h2>Bakery</h2> and then a <p> with a few words.', solution: '<h1>Lantern Coffee</h1>\n<h2>Drinks</h2>\n<p>Coffee and tea.</p>\n<h2>Bakery</h2>\n<p>Baked this morning.</p>',
    checks: [['One <h1>', (n) => all(n, 'h1').length === 1], ['Two <h2> headings: Drinks and Bakery', (n) => { const t = all(n, 'h2').map((h) => textOf(h).toLowerCase()); return t.length === 2 && t.includes('drinks') && t.includes('bakery'); }], ['A <p> straight after each <h2>', (n) => n.every((x, i) => x.tag !== 'h2' || (n[i + 1] && n[i + 1].tag === 'p'))], ['No heading level is skipped', (n) => all(n, 'h3').length === 0]] },
  { id: 'page', title: 'Open for business', concept: 'A whole page',
    teach: ['Semantic tags say what a part of the page is for: <header> for the top, <nav> for navigation links, <main> for the content, <footer> for the bottom.', 'They look the same as a <div>, but search engines and screen readers use them to find their way round.'],
    goal: 'Build the page: a <header> holding the h1, a <nav> holding two links, and a <main> holding a paragraph.',
    starter: '<header>\n  <h1>Lantern Coffee</h1>\n</header>\n<nav>\n  <a href="menu.html">Menu</a>\n</nav>\n', hint: 'Add a second <a> inside <nav>, then <main><p>…</p></main>.', solution: '<header>\n  <h1>Lantern Coffee</h1>\n</header>\n<nav>\n  <a href="menu.html">Menu</a>\n  <a href="visit.html">Visit</a>\n</nav>\n<main>\n  <p>Fresh coffee, roasted in Leeds.</p>\n</main>',
    checks: [['A <header> with the <h1> inside it', (n) => all(n, 'header').some((h) => all(h.children, 'h1').length === 1)], ['A <nav> with two links', (n) => all(n, 'nav').some((v) => all(v.children, 'a').length === 2)], ['Each link has an href', (n) => all(n, 'a').length > 0 && all(n, 'a').every((a) => (a.attrs.href || '').length > 0)], ['A <main> with a paragraph inside it', (n) => all(n, 'main').some((m) => all(m.children, 'p').some((p) => textOf(p).length > 2))]] },
];

/** Judge a learner's HTML for a level. Returns { ok, error, checks: [[label, passed]], nodes }. */
export function htmlRun(level, src) {
  const { nodes, error } = htmlScan(src);
  if (error) return { ok: false, error, checks: level.checks.map(([label]) => [label, false]), nodes };
  const checks = level.checks.map(([label, fn]) => [label, !!fn(nodes)]);
  return { ok: checks.every((c) => c[1]), error: null, checks, nodes };
}

// ================================================================ Data Diner (Python with data)
// Each level hands the program some variables (different every run) and asks for one answer through serve()
// or print(). A program passes only if it is right for the order on screen and for two more it has not seen.
const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const some = (r, list, n) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };
const PEOPLE = ['Ana', 'Ben', 'Cleo', 'Dev', 'Eli', 'Fay', 'Gus', 'Hana'];
const DRINKS = { latte: 3, mocha: 4, chai: 3, espresso: 2, tea: 2, scone: 2 };
const numbers = (r) => Array.from({ length: ri(r, 4, 6) }, () => ri(r, 1, 6));
const twoDp = (x) => Math.round((x + Number.EPSILON) * 100) / 100;

export const DATA_LEVELS = [
  { id: 'print', title: 'Say it out loud', concept: 'print() and text', judge: 'print',
    teach: ['print() shows a value on the screen. It is how a program talks to you.', 'Text in Python is called a <b>string</b> and goes inside quotes: "Latte". Without quotes Python thinks Latte is the name of something.'],
    goal: 'Print exactly: Welcome to Lantern',
    given: () => ({}), expect: () => 'Welcome to Lantern',
    starter: 'print("Hello")\n', hint: 'print("Welcome to Lantern")', solution: 'print("Welcome to Lantern")' },
  { id: 'variables', title: 'Name your numbers', concept: 'Variables',
    teach: ['A <b>variable</b> is a name that holds a value. total = price * cups works out the right-hand side and stores the answer under the name total.', 'The customer gives you price and cups (they change every run). serve() hands your answer back.'],
    goal: 'Work out what the customer owes (price times cups) and serve it.',
    given: (r) => ({ price: ri(r, 2, 5), cups: ri(r, 2, 6) }), expect: (v) => v.price * v.cups,
    starter: 'total = price\nserve(total)\n', hint: 'total = price * cups, then serve(total).', solution: 'total = price * cups\nserve(total)' },
  { id: 'types', title: 'Words and numbers', concept: 'Text, numbers and str()',
    teach: ['Every value has a <b>type</b>. "3" in quotes is text; 3 without quotes is a number. They are different things.', '+ joins text to text and adds numbers to numbers, but it cannot mix them. str(cups) turns the number into text so it can be joined.'],
    goal: 'Serve the sentence for the ticket, such as: Ana ordered 3 cups',
    given: (r) => ({ name: some(r, PEOPLE, 1)[0], cups: ri(r, 2, 9) }), expect: (v) => `${v.name} ordered ${v.cups} cups`,
    starter: 'ticket = name + " ordered "\nserve(ticket)\n', hint: 'name + " ordered " + str(cups) + " cups"', solution: 'ticket = name + " ordered " + str(cups) + " cups"\nserve(ticket)' },
  { id: 'lists', title: 'The queue', concept: 'Lists and positions',
    teach: ['A <b>list</b> holds several values in order, inside square brackets: ["Ana", "Ben", "Cleo"].', 'Each item has a position, counted from 0. queue[0] is the first person. A negative position counts from the end, so queue[-1] is always the last, however long the list is.'],
    goal: 'Serve the name of the last person in the queue.',
    given: (r) => ({ queue: some(r, PEOPLE, ri(r, 3, 5)) }), expect: (v) => v.queue[v.queue.length - 1],
    starter: 'serve(queue[0])\n', hint: 'serve(queue[-1])', solution: 'serve(queue[-1])' },
  { id: 'len', title: 'How many?', concept: 'len()',
    teach: ['len() counts the items in a list (or the characters in a string) and gives the number back.', 'A function that gives a value back can be used anywhere a value can: inside serve(), in sums, or stored in a variable.'],
    goal: 'Serve the number of people in the queue.',
    given: (r) => ({ queue: some(r, PEOPLE, ri(r, 2, 7)) }), expect: (v) => v.queue.length,
    starter: 'serve(queue)\n', hint: 'serve(len(queue))', solution: 'serve(len(queue))' },
  { id: 'loop-total', title: 'Add them up', concept: 'Looping over a list',
    teach: ['for n in orders: runs its indented lines once for each item, with n holding that item.', 'To add up a list, start a total at 0 before the loop and add each item to it inside the loop. This “running total” pattern is one of the most used in data work.'],
    goal: 'orders is a list of cups per order. Serve the total number of cups.',
    given: (r) => ({ orders: numbers(r) }), expect: (v) => v.orders.reduce((s, x) => s + x, 0),
    starter: 'total = 0\nfor n in orders:\n    total = total\nserve(total)\n', hint: 'Inside the loop: total = total + n', solution: 'total = 0\nfor n in orders:\n    total = total + n\nserve(total)' },
  { id: 'loop-if', title: 'Count the big ones', concept: 'if inside a loop',
    teach: ['Put an if inside a loop to treat some items differently. Its lines are indented twice: once for the loop, once for the if.', 'Counting works like totalling: start at 0 and add 1 each time the test is True.'],
    goal: 'Serve how many orders are for more than 3 cups.',
    given: (r) => ({ orders: numbers(r) }), expect: (v) => v.orders.filter((x) => x > 3).length,
    starter: 'big = 0\nfor n in orders:\n    big = big + 1\nserve(big)\n', hint: 'Add the line if n > 3: above big = big + 1, and indent that line once more.', solution: 'big = 0\nfor n in orders:\n    if n > 3:\n        big = big + 1\nserve(big)' },
  { id: 'average', title: 'The usual order', concept: 'Division and round()',
    teach: ['An average is the total divided by how many there are. A single / always gives a decimal number (a <b>float</b>), even when it divides exactly.', 'round(x, 2) rounds x to two decimal places.'],
    goal: 'Serve the average cups per order, rounded to 2 decimal places.',
    given: (r) => ({ orders: numbers(r) }), expect: (v) => twoDp(v.orders.reduce((s, x) => s + x, 0) / v.orders.length),
    starter: 'total = 0\nfor n in orders:\n    total = total + n\nserve(total)\n', hint: 'serve(round(total / len(orders), 2))', solution: 'total = 0\nfor n in orders:\n    total = total + n\nserve(round(total / len(orders), 2))' },
  { id: 'append', title: 'A new list', concept: 'Building a list',
    teach: ['Start with an empty list, [], and add to it with .append(value). Each append puts one more item on the end.', 'Looping over one list and appending to another is how data gets transformed: prices in, new prices out.'],
    goal: 'Prices are doubling for the festival. Serve a new list with every price doubled.',
    given: (r) => ({ prices: Array.from({ length: ri(r, 3, 5) }, () => ri(r, 2, 6)) }), expect: (v) => v.prices.map((x) => x * 2),
    starter: 'doubled = []\nfor p in prices:\n    doubled.append(p)\nserve(doubled)\n', hint: 'doubled.append(p * 2)', solution: 'doubled = []\nfor p in prices:\n    doubled.append(p * 2)\nserve(doubled)' },
  { id: 'dict', title: 'Look it up', concept: 'Dictionaries',
    teach: ['A <b>dictionary</b> pairs keys with values, in curly braces: {"latte": 3, "mocha": 4}.', 'You look a value up by its key, not its position: menu["latte"] is 3. Here the key you need is held in the variable item.'],
    goal: 'menu holds each drink’s price. Serve the price of the drink named in item.',
    given: (r) => ({ menu: DRINKS, item: some(r, Object.keys(DRINKS), 1)[0] }), expect: (v) => v.menu[v.item],
    starter: 'serve(menu["latte"])\n', hint: 'serve(menu[item])', solution: 'serve(menu[item])' },
  { id: 'dict-loop', title: 'Ring it up', concept: 'Looking up inside a loop',
    teach: ['Now put the pieces together: loop over a list, look each item up in a dictionary, and keep a running total.', 'This is what a till does, and what a JOIN does in SQL: match each row to its price, then add up.'],
    goal: 'order is a list of drinks. Serve the total cost using the prices in menu.',
    given: (r) => ({ menu: DRINKS, order: Array.from({ length: ri(r, 2, 5) }, () => some(r, Object.keys(DRINKS), 1)[0]) }), expect: (v) => v.order.reduce((s, x) => s + v.menu[x], 0),
    starter: 'total = 0\nfor drink in order:\n    total = total + 1\nserve(total)\n', hint: 'total = total + menu[drink]', solution: 'total = 0\nfor drink in order:\n    total = total + menu[drink]\nserve(total)' },
  { id: 'functions', title: 'Write it once', concept: 'Functions that return', needsDef: true,
    teach: ['def bill(items): makes your own function. items is its <b>input</b>: a name for whatever list the caller passes in.', 'return hands a value back to the line that called it, so bill(morning) can be used like a number.'],
    goal: 'Two orders came in. Write a function bill(items) that returns an order’s cost, then serve the cost of morning plus afternoon.',
    given: (r) => ({ menu: DRINKS, morning: Array.from({ length: ri(r, 2, 4) }, () => some(r, Object.keys(DRINKS), 1)[0]), afternoon: Array.from({ length: ri(r, 2, 4) }, () => some(r, Object.keys(DRINKS), 1)[0]) }),
    expect: (v) => [...v.morning, ...v.afternoon].reduce((s, x) => s + v.menu[x], 0),
    starter: 'def bill(items):\n    total = 0\n    for drink in items:\n        total = total + menu[drink]\n\nserve(bill(morning))\n', hint: 'End the function with return total (indented once), then serve(bill(morning) + bill(afternoon)).', solution: 'def bill(items):\n    total = 0\n    for drink in items:\n        total = total + menu[drink]\n    return total\n\nserve(bill(morning) + bill(afternoon))' },
];

const closeTo = (a, b) => (typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) < 1e-9 : Array.isArray(a) && Array.isArray(b) ? a.length === b.length && a.every((x, i) => closeTo(x, b[i])) : a === b);
function dataOnce(level, program, seed) {
  const vars = level.given(mulberry32(seed));
  const prints = [], served = [];
  const host = { actions: { serve: 1 }, free: new Set(['serve']), sensors: {}, vars };
  exec(program, host, (s) => { if (s.action === 'print') prints.push(s.args[0]); else if (s.action === 'serve') served.push({ value: s.args.length ? s.args[0] : null, line: s.line }); });
  const want = level.expect(vars);
  const got = level.judge === 'print' ? prints.join('\n').trim() : served.length ? toJs(served[served.length - 1].value) : undefined;
  return { vars, prints, served: served.map((x) => show(x.value, false)), want, got, ok: got !== undefined && closeTo(got, want), shown: got === undefined ? null : level.judge === 'print' ? got : show(served[served.length - 1].value, false), wantShown: level.judge === 'print' ? want : show(fromJs(want), false) };
}
/** Run a learner's program for a Data Diner level. Returns { ok, error, vars, prints, shown, wantShown }. */
export function dataRun(level, source, seed = 1) {
  const out = { ok: false, error: null, vars: level.given(mulberry32(seed)), prints: [], shown: null, wantShown: '' };
  try {
    const program = parse(source);
    const first = dataOnce(level, program, seed);
    Object.assign(out, { prints: first.prints, shown: first.shown, wantShown: first.wantShown });
    if (first.got === undefined) { out.error = { message: level.judge === 'print' ? 'The program ran but printed nothing.' : 'The program ran but never called serve().', line: 0, hint: level.judge === 'print' ? 'Use print("…") to show text.' : 'Hand over your answer with serve(answer).' }; return out; }
    if (!first.ok) { out.error = { message: level.judge === 'print' ? `It printed “${first.shown}”, but the goal is “${first.wantShown}”.` : `You served ${first.shown}, but the customer expected ${first.wantShown}.`, line: 0, hint: level.judge === 'print' ? 'Capitals, spaces and spelling all count.' : 'Follow your code line by line with the values on the ticket.' }; return out; }
    if (level.needsDef && !program.defs.length) { out.error = { message: 'The answer is right, but this level asks for a function.', line: 0, hint: 'Define it with def bill(items): and use return.' }; return out; }
    for (const s of [seed + 101, seed + 202]) {
      const again = dataOnce(level, program, s);
      if (!again.ok) { out.error = { message: 'That works for this customer, but not for the next one.', line: 0, hint: `With ${Object.entries(again.vars).filter(([k]) => k !== 'menu').map(([k, v]) => `${k} = ${show(fromJs(v), false)}`).join(', ')} it should serve ${again.wantShown}, and yours served ${again.shown ?? 'nothing'}. Use the variables rather than typing their values in.` }; return out; }
    }
    out.ok = true;
  } catch (e) {
    if (!(e instanceof PyError)) throw e;
    out.error = { message: e.message, line: e.line, hint: e.hint };
  }
  return out;
}
export const showValue = (v) => show(fromJs(v), false);

// ================================================================ Style Shop (CSS)
// One page for every level. Each element has a key the checks use; the page is shown to the learner as HTML.
const T = (text) => ({ text });
export const CSS_PAGE = [
  { key: 'top', tag: 'header', id: 'top', children: [
    { key: 'h1', tag: 'h1', children: [T('Lantern Coffee')] },
    { key: 'nav', tag: 'nav', children: [{ key: 'a1', tag: 'a', children: [T('Menu')] }, { key: 'a2', tag: 'a', children: [T('Visit')] }] }] },
  { key: 'main', tag: 'main', children: [
    { key: 'intro', tag: 'p', cls: ['intro'], children: [T('Fresh coffee, roasted in Leeds.')] },
    { key: 'ul', tag: 'ul', children: [{ key: 'li1', tag: 'li', cls: ['hot'], children: [T('Latte')] }, { key: 'li2', tag: 'li', children: [T('Iced tea')] }, { key: 'li3', tag: 'li', cls: ['hot'], children: [T('Mocha')] }] },
    { key: 'p2', tag: 'p', children: [T('Open daily. '), { key: 'a3', tag: 'a', children: [T('Our story')] }] }] },
];
export const CSS_PAGE_HTML = `<header id="top">
  <h1>Lantern Coffee</h1>
  <nav><a>Menu</a> <a>Visit</a></nav>
</header>
<main>
  <p class="intro">Fresh coffee, roasted in Leeds.</p>
  <ul>
    <li class="hot">Latte</li>
    <li>Iced tea</li>
    <li class="hot">Mocha</li>
  </ul>
  <p>Open daily. <a>Our story</a></p>
</main>`;
export const CSS_LEVELS = [
  { id: 'rule', title: 'Your first rule', concept: 'Selector, property, value',
    teach: ['HTML says what is on a page. <b>CSS</b> says how it looks. A CSS <b>rule</b> names some elements, then lists changes inside curly braces.', 'In h1 { color: navy; } the <b>selector</b> h1 picks every h1, color is the <b>property</b> and navy is the <b>value</b>. A colon goes between them and a semicolon ends the line.'],
    goal: 'Make the main heading orange.',
    starter: 'h1 {\n  color: navy;\n}\n', hint: 'Change navy to orange.', solution: 'h1 {\n  color: orange;\n}',
    checks: [['The h1 text is orange', (g) => g('h1', 'color') === 'orange']] },
  { id: 'two', title: 'More than one change', concept: 'Several declarations',
    teach: ['A rule can hold as many declarations as you like, one per line, each ending with a semicolon.', 'Sizes need a unit. px (pixels) is the simplest: font-size: 20px;'],
    goal: 'Make every paragraph navy with a font size of 20px.',
    starter: 'p {\n  color: navy;\n}\n', hint: 'Add a second line inside the braces: font-size: 20px;', solution: 'p {\n  color: navy;\n  font-size: 20px;\n}',
    checks: [['Paragraphs are navy', (g) => g('intro', 'color') === 'navy' && g('p2', 'color') === 'navy'], ['Paragraphs are 20px', (g) => g('intro', 'font-size') === '20px' && g('p2', 'font-size') === '20px']] },
  { id: 'class', title: 'Only some of them', concept: 'Class selectors',
    teach: ['A tag selector changes every element of that kind. To change only some, the HTML gives them a <b>class</b>: &lt;li class="hot"&gt;.', 'In CSS a dot selects a class: .hot { … } changes every element with class="hot" and nothing else.'],
    goal: 'Make only the hot drinks red. Iced tea stays as it is.',
    starter: 'li {\n  color: red;\n}\n', hint: 'Change the selector from li to .hot', solution: '.hot {\n  color: red;\n}',
    checks: [['Latte and Mocha are red', (g) => g('li1', 'color') === 'red' && g('li3', 'color') === 'red'], ['Iced tea is not red', (g) => g('li2', 'color') !== 'red']] },
  { id: 'id', title: 'One of a kind', concept: 'id selectors and background',
    teach: ['An <b>id</b> names one single element on the page: &lt;header id="top"&gt;. In CSS a hash selects it: #top { … }.', 'background-color fills the box behind an element’s content.'],
    goal: 'Give the header (id="top") a gold background.',
    starter: '#top {\n  \n}\n', hint: 'background-color: gold;', solution: '#top {\n  background-color: gold;\n}',
    checks: [['The header’s background is gold', (g) => g('top', 'background-color') === 'gold']] },
  { id: 'box', title: 'Room to breathe', concept: 'The box model',
    teach: ['Every element is a box. <b>padding</b> is space inside the box, between its edge and its content. <b>border</b> is the edge itself. <b>margin</b> is space outside, pushing other boxes away.', 'A border needs three things: a width, a style and a colour, such as 2px solid navy.'],
    goal: 'Give the intro paragraph 12px of padding and a 2px solid navy border.',
    starter: '.intro {\n  padding: 0;\n}\n', hint: 'padding: 12px; and border: 2px solid navy;', solution: '.intro {\n  padding: 12px;\n  border: 2px solid navy;\n}',
    checks: [['The intro has 12px padding', (g) => g('intro', 'padding') === '12px'], ['The intro has a 2px solid navy border', (g) => (g('intro', 'border') || '').split(' ').sort().join(' ') === '2px navy solid'], ['The other paragraph has no border', (g) => !g('p2', 'border')]] },
  { id: 'specificity', title: 'Which rule wins?', concept: 'Specificity',
    teach: ['When two rules set the same property on the same element, the more <b>specific</b> selector wins: an id beats a class, and a class beats a tag name.', 'So you can set a general rule for all paragraphs, then override it for one class without touching the first rule.'],
    goal: 'Keep the rule that makes paragraphs navy. Add a rule so the intro paragraph alone is green.',
    starter: 'p {\n  color: navy;\n}\n', hint: 'Add a second rule: .intro { color: green; }', solution: 'p {\n  color: navy;\n}\n.intro {\n  color: green;\n}',
    checks: [['The intro is green', (g) => g('intro', 'color') === 'green'], ['The other paragraph is still navy', (g) => g('p2', 'color') === 'navy']] },
  { id: 'descendant', title: 'Inside something else', concept: 'Descendant selectors',
    teach: ['Two selectors with a space between them mean “the second, inside the first”. nav a picks only the links that are inside the nav.', 'The link in the last paragraph is not inside nav, so nav a leaves it alone.'],
    goal: 'Make the two links in the nav brown with no underline. Leave the “Our story” link alone.',
    starter: 'a {\n  color: brown;\n}\n', hint: 'Use the selector nav a, and add text-decoration: none;', solution: 'nav a {\n  color: brown;\n  text-decoration: none;\n}',
    checks: [['The nav links are brown', (g) => g('a1', 'color') === 'brown' && g('a2', 'color') === 'brown'], ['The nav links have no underline', (g) => g('a1', 'text-decoration') === 'none' && g('a2', 'text-decoration') === 'none'], ['“Our story” is unchanged', (g) => g('a3', 'color') !== 'brown' && !g('a3', 'text-decoration')]] },
  { id: 'group', title: 'Two at once', concept: 'Grouping selectors',
    teach: ['A comma between selectors means “and also”: h1, .intro { … } applies the same declarations to both.', 'It saves writing the same rule twice, and keeps the two in step when you change it.'],
    goal: 'Centre the heading and the intro paragraph with one rule.',
    starter: 'h1 {\n  text-align: center;\n}\n', hint: 'Change the selector to h1, .intro', solution: 'h1, .intro {\n  text-align: center;\n}',
    checks: [['The heading is centred', (g) => g('h1', 'text-align') === 'center'], ['The intro is centred', (g) => g('intro', 'text-align') === 'center'], ['The list is not centred', (g) => g('li1', 'text-align') !== 'center'], ['It is done in one rule', (g, n) => n === 1]] },
  { id: 'flex', title: 'Side by side', concept: 'Flexbox',
    teach: ['display: flex turns an element into a row and lays its children out side by side. It is the usual way to build navigation bars and card rows.', 'gap sets the space between the children, and justify-content says where they sit along the row.'],
    goal: 'Lay the nav out as a centred row with a 16px gap between its links.',
    starter: 'nav {\n  display: block;\n}\n', hint: 'display: flex; gap: 16px; justify-content: center;', solution: 'nav {\n  display: flex;\n  gap: 16px;\n  justify-content: center;\n}',
    checks: [['The nav is a flex row', (g) => g('nav', 'display') === 'flex'], ['The gap is 16px', (g) => g('nav', 'gap') === '16px'], ['The links are centred', (g) => g('nav', 'justify-content') === 'center']] },
];
const keyed = (nodes, map = new Map()) => { nodes.forEach((n) => { if (n.key) map.set(n.key, n); if (n.children) keyed(n.children, map); }); return map; };
/** Judge a learner's CSS for a level. Returns { ok, error, checks: [[label, passed]], styles: Map(node -> { own, all }) }. */
export function cssRun(level, src) {
  const { rules, error } = parseCss(src);
  const styles = styleTree(CSS_PAGE, rules);
  if (error) return { ok: false, error, checks: level.checks.map(([label]) => [label, false]), styles };
  const nodes = keyed(CSS_PAGE);
  const get = (key, prop) => styles.get(nodes.get(key)).all[prop];
  const blocks = (src.replace(/\/\*[\s\S]*?\*\//g, '').match(/\{/g) || []).length;
  const checks = level.checks.map(([label, fn]) => [label, !!fn(get, blocks)]);
  return { ok: checks.every((c) => c[1]), error: null, checks, styles };
}
