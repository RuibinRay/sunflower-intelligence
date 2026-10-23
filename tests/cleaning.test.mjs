// Run: node tests/cleaning.test.mjs   — the Data Cleaning Lab engine (assets/js/core/cleaning.js) and the B02 datasets.
// No dependencies. Prints the pass count; exits 1 on any failure.
import { readFileSync } from 'node:fs';
import * as C from '../assets/js/core/cleaning.js?v=6';
import { buildAll } from '../tools/study-datasets.mjs';

let pass = 0, failed = 0;
const ok = (cond, label) => { if (cond) pass++; else { failed++; console.log(`FAIL ${label}`); } };
const sortKeys = (o) => (o && typeof o === 'object' && !Array.isArray(o) ? Object.fromEntries(Object.keys(o).sort().map((k) => [k, sortKeys(o[k])])) : o);
const eqMap = (got, want, label) => ok(JSON.stringify(sortKeys(got)) === JSON.stringify(sortKeys(want)), `${label}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
const eq = (got, want, label) => ok(JSON.stringify(got) === JSON.stringify(want), `${label}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
const close = (got, want, label, tol = 1e-9) => ok(Number.isFinite(got) && Math.abs(got - want) <= tol * Math.max(1, Math.abs(want)), `${label}: got ${got}, want ${want}`);
const T = (columns, rows) => C.tableFrom({ columns, rows });
const ci = (t, name) => t.columns.findIndex((c) => c.name === name);
const col = (t, name) => t.rows.map((r) => r[ci(t, name)]);
const ROOT = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, ROOT), 'utf8');
/** apply() and check the input was not touched */
function step(t, s) {
  const snap = JSON.stringify(t);
  const r = C.apply(t, s);
  ok(JSON.stringify(t) === snap, `${s.op}: input table unchanged`);
  return r;
}

// ================================================================ CSV
{
  const t = C.fromCSV('a,b\n north ,"x, y"\n"say ""hi""",2\r\n,\n');
  eq(t.columns.map((c) => c.name), ['a', 'b'], 'csv header');
  eq(t.rows, [[' north ', 'x, y'], ['say "hi"', '2'], ['', '']], 'csv keeps spaces, quotes, commas; blank row kept');
  eq(t.ids, [1, 2, 3], 'csv ids');
  const again = C.fromCSV(C.toCSV(t));
  eq(again.rows, t.rows, 'csv round trip');
  ok(C.toCSV(t).includes('" north "'), 'csv quotes leading/trailing spaces');
  const s = C.fromCSV('x;y\n1,5;2\n3;4');
  eq([s.delimiter, s.rows[0]], [';', ['1,5', '2']], 'semicolon delimiter detected');
  const d = C.fromCSV('a,a,\n1,2,3\n4');
  eq(d.columns.map((c) => c.name), ['a', 'a_2', 'column_3'], 'duplicate and blank names');
  eq(d.rows[1], ['4', '', ''], 'ragged row padded');
  ok(d.warnings.length === 1, 'ragged row warning');
  let threw = false; try { C.fromCSV('   '); } catch { threw = true; }
  ok(threw, 'empty text throws');
  threw = false; try { C.fromCSV('only,a,header'); } catch { threw = true; }
  ok(threw, 'header only throws');
  eq(C.toCSV(T(['n'], [[0.1 + 0.2], [null], ['t']])), 'n\n0.3\n\nt\n', 'toCSV writes numbers without float noise and null as blank');
}

// ================================================================ numbers and dates
{
  const rn = (s, d) => C.readNumber(s, d);
  eq(rn('$1,234.50'), { value: 1234.5, currency: true, percent: false, grouped: true }, 'readNumber $1,234.50');
  eq(rn('16,50', '.'), null, 'decimal comma refused with a decimal point');
  eq(rn('16,50', ',').value, 16.5, 'decimal comma read with decimal ,');
  eq(rn('1.234,50', ',').value, 1234.5, 'grouped with decimal comma');
  eq(rn('$1,234.50', ','), null, 'decimal point refused with decimal ,');
  eq(rn('(300)').value, -300, 'parentheses negative');
  eq(rn('−4.2%').value, -4.2, 'unicode minus and percent');
  ok(rn('−4.2%').percent, 'percent flag');
  eq(rn('$-5').value, -5, 'sign after currency');
  eq(rn('1e3').value, 1000, 'exponent');
  eq(rn('12,3456'), null, 'bad grouping refused');
  eq(rn('abc'), null, 'text refused');
  ok(Number.isNaN(C.plainNumber('$5')) && C.plainNumber(' 7 ') === 7 && C.plainNumber(3) === 3, 'plainNumber');
  const pd = (s, o) => C.parseDateCell(s, o);
  eq(pd('2026-03-04'), { iso: '2026-03-04', format: 'iso' }, 'ISO date');
  eq(pd('04/03/2026'), { ambiguous: true, dmy: '2026-03-04', mdy: '2026-04-03' }, 'ambiguous in auto');
  eq(pd('04/03/2026', { order: 'DMY' }).iso, '2026-03-04', 'DMY');
  eq(pd('04/03/2026', { order: 'MDY' }).iso, '2026-04-03', 'MDY');
  eq(pd('21/04/2026'), { iso: '2026-04-21', format: 'dmy' }, 'unambiguous day first');
  eq(pd('4/21/26'), { iso: '2026-04-21', format: 'mdy' }, 'unambiguous month first, two-digit year');
  ok(pd('4/21/26', { order: 'DMY' }).invalid, 'impossible in the chosen order is refused, not flipped');
  eq(pd('05/05/2026'), { iso: '2026-05-05', format: 'same' }, 'same both ways is not ambiguous');
  eq(pd('March 5, 2026').iso, '2026-03-05', 'written US');
  eq(pd('5 March 2026').iso, '2026-03-05', 'written day first');
  eq(pd('Thu, Mar 5, 2026').iso, '2026-03-05', 'weekday and short month');
  eq(pd('46085', { serial: true }), { iso: '2026-03-04', format: 'serial' }, 'spreadsheet serial 46085 = 2026-03-04');
  eq(pd(46085, { serial: true }).iso, '2026-03-04', 'numeric serial');
  ok(pd('46085').invalid, 'serial needs the option');
  ok(pd('31/02/2026').invalid, 'impossible slash date');
  ok(pd('2026-02-30').invalid, 'impossible ISO date');
  eq(pd('1/2/69', { order: 'MDY' }).iso, '1969-01-02', 'two-digit year 69 → 1969');
  eq(pd('1/2/68', { order: 'MDY' }).iso, '2068-01-02', 'two-digit year 68 → 2068');
  eq(pd('26/03/04', { order: 'YMD' }).iso, '2026-03-04', 'year first');
  ok(pd('').missing && pd('NA').missing, 'missing dates');
}

// ================================================================ profile against hand calculations
{
  const t = T(['x', 'c', 'd', 'e'], [
    ['2', 'a', '2026-03-01', ''], ['4', 'b', '04/03/2026', ''], ['4', 'a', '2026-03-05', 'NA'], ['4', '', '21/03/2026', ''],
    ['5', 'a', 'March 9, 2026', ''], ['5', 'b', '2026-03-02', ''], ['7', 'NA', 'not a date', ''], ['9', 'a', '2026-06-30', ''],
  ]);
  const [x, c, d, e] = C.profile(t);
  eq([x.type, x.count, x.missing, x.unique, x.n], ['number', 8, 0, 5, 8], 'profile counts');
  close(x.mean, 5, 'mean');
  close(x.median, 4.5, 'median');
  close(x.sd, Math.sqrt(32 / 7), 'sample SD (n − 1)');
  close(x.q1, 4, 'Q1 linear interpolation: position 1.75 between 4 and 4');
  close(x.q3, 5.5, 'Q3 linear interpolation: 5 + 0.25 × (7 − 5)');
  close(x.skew, (Math.sqrt(56) / 6) * (5.25 / 8), 'skewness G1 = √(n(n−1))/(n−2) × m3/m2^1.5');
  eq([x.min, x.max, x.integer], [2, 9, true], 'min, max, integer');
  eq(x.top, [['4', 3], ['5', 2], ['2', 1], ['7', 1], ['9', 1]], 'top values (ties alphabetical)');
  eq([c.type, c.missing, c.unique, c.top], ['category', 2, 2, [['a', 4], ['b', 2]]], 'category profile; NA counts as missing');
  eq([d.type, d.invalid, d.ambiguous, d.min, d.max], ['date', 1, 1, '2026-03-01', '2026-06-30'], 'date profile');
  eq(d.families, { iso: 4, slash4: 2, written: 1, other: 1 }, 'date families');
  eq([e.missing, e.count, e.unique], [8, 8, 0], 'all-missing column');
  const p = C.profile(T(['p'], [['$1.00'], ['2'], ['16,50'], ['x'], ['1,000'], ['3'], ['4'], ['5'], ['6'], ['7']]))[0];
  eq([p.type, p.invalid, p.formatted, p.storage, p.decimal], ['number', 2, 2, 'text', '.'], 'numbers stored as text: 2 invalid, 2 formatted');
  const one = C.profile(T(['v'], [['3']]))[0];
  ok(one.mean === 3 && Number.isNaN(one.sd), 'single value: SD undefined');
  eq(C.profile(T(['order_id'], [['A1'], ['A1']]))[0].type, 'id', 'id by name');
  eq(C.profile(T(['flag'], [['yes'], ['No'], ['yes']]))[0].type, 'boolean', 'boolean');
}

// ================================================================ operations
{
  // dedupe
  const t = T(['k', 'v', 'w'], [['1', 'a', 'x'], ['2', 'b', ''], ['1', 'a', 'x'], ['2', 'b', 'y'], ['1', 'a', 'x']]);
  let r = step(t, { op: 'dedupe' });
  eq(r.table.rows.length, 3, 'dedupe removes exact repeats');
  eq(r.change.removedRows, [2, 4], 'dedupe removedRows');
  eq(r.table.ids, [1, 2, 4], 'ids follow the rows');
  eq([r.change.rowsBefore, r.change.rowsAfter], [5, 3], 'dedupe row counts');
  // dedupe-key
  r = step(t, { op: 'dedupe-key', columns: ['k'], keep: 'first' });
  eq(r.table.ids, [1, 2], 'dedupe-key first');
  r = step(t, { op: 'dedupe-key', columns: ['k'], keep: 'last' });
  eq(r.table.ids, [4, 5], 'dedupe-key last');
  r = step(t, { op: 'dedupe-key', columns: ['k'], keep: 'most-complete' });
  eq(r.table.ids, [1, 4], 'dedupe-key most complete (tie → first)');
  ok(/differed/.test(r.change.note), 'dedupe-key reports conflicts');
  r = step(T(['k'], [[''], [''], ['a']]), { op: 'dedupe-key', columns: ['k'] });
  eq(r.table.rows.length, 3, 'blank keys left alone');
  ok(step(t, { op: 'dedupe-key', columns: [] }).change.error, 'dedupe-key needs a column');
  // trim and case
  r = step(T(['s'], [['  a   b '], [' c'], [3], ['ok']]), { op: 'trim', column: 's' });
  eq(col(r.table, 's'), ['a b', 'c', 3, 'ok'], 'trim collapses spaces and NBSP, leaves numbers');
  eq(r.change.cellsChanged, 2, 'trim counts changes');
  r = step(T(['s', 't'], [[' a ', ' b ']]), { op: 'trim', all: true });
  eq(r.table.rows[0], ['a', 'b'], 'trim all columns');
  r = step(T(['s'], [['house blend 250G'], ['COLD BREW-PACK']]), { op: 'case', column: 's', to: 'title' });
  eq(col(r.table, 's'), ['House Blend 250g', 'Cold Brew-Pack'], 'title case');
  eq(col(step(T(['s'], [['Ab']]), { op: 'case', column: 's', to: 'upper' }).table, 's'), ['AB'], 'upper');
  eq(col(step(T(['s'], [['Ab']]), { op: 'case', column: 's', to: 'lower' }).table, 's'), ['ab'], 'lower');
  // map
  r = step(T(['r'], [['N.'], ['north'], ['South'], ['']]), { op: 'map', column: 'r', mapping: { 'N.': 'North', north: 'North', Zzz: 'Z' } });
  eq(col(r.table, 'r'), ['North', 'North', 'South', ''], 'map');
  ok(/matched nothing/.test(r.change.note), 'map reports unused entries');
  ok(step(T(['r'], [['a']]), { op: 'map', column: 'r', mapping: {} }).change.error, 'empty mapping refused');
  // to-number
  r = step(T(['p'], [['$18.50'], ['1,800.00'], ['16,50'], ['NA'], ['(3)'], [7]]), { op: 'to-number', column: 'p', decimal: '.' });
  eq(col(r.table, 'p'), [18.5, 1800, '16,50', null, -3, 7], 'to-number with decimal point');
  eq(r.change.unresolved.length, 1, 'to-number leaves one value');
  ok(/decimal comma/.test(r.change.unresolved[0].reason), 'to-number explains the decimal comma');
  eq(r.table.columns[0].type, 'number', 'to-number sets the type');
  r = step(r.table, { op: 'to-number', column: 'p', decimal: ',' });
  eq(col(r.table, 'p'), [18.5, 1800, 16.5, null, -3, 7], 'second pass with decimal comma');
  // to-date
  const dt = T(['d'], [['2026-03-04'], ['04/03/2026'], ['21/04/2026'], ['4/21/26'], ['46085'], ['March 5, 2026'], [''], ['2026-3-9']]);
  r = step(dt, { op: 'to-date', column: 'd', order: 'auto', serial: true });
  eq(col(r.table, 'd'), ['2026-03-04', '04/03/2026', '2026-04-21', '2026-04-21', '2026-03-04', '2026-03-05', null, '2026-03-09'], 'to-date auto leaves the ambiguous date');
  ok(r.change.unresolved.length === 1 && /ambiguous/.test(r.change.unresolved[0].reason), 'ambiguous date listed');
  r = step(dt, { op: 'to-date', column: 'd', order: 'DMY', serial: false });
  eq(col(r.table, 'd'), ['2026-03-04', '2026-03-04', '2026-04-21', '4/21/26', '46085', '2026-03-05', null, '2026-03-09'], 'to-date DMY; serial off');
  eq(r.change.unresolved.length, 2, 'DMY lists the month-first date and the serial');
  eq(r.table.columns[0].type, 'date', 'to-date sets the type');
  // fill
  const ft = T(['g', 'v', 's'], [['a', '1', 'x'], ['a', '', 'y'], ['b', '4', 'y'], ['b', '6', ''], ['b', '', 'x'], ['c', '', 'z']]);
  r = step(ft, { op: 'fill', column: 'v', method: 'mean' });
  eq(col(r.table, 'v'), [1, 11 / 3, 4, 6, 11 / 3, 11 / 3], 'fill mean');
  r = step(ft, { op: 'fill', column: 'v', method: 'median' });
  eq(col(r.table, 'v'), [1, 4, 4, 6, 4, 4], 'fill median');
  r = step(ft, { op: 'fill', column: 'v', method: 'group-median', by: 'g' });
  eq(col(r.table, 'v'), [1, 1, 4, 6, 5, 4], 'fill group median; empty group falls back to the overall median');
  ok(/1 row in groups with no observed value/.test(r.change.note), 'group fallback noted');
  r = step(ft, { op: 'fill', column: 's', method: 'mode' });
  eq(col(r.table, 's'), ['x', 'y', 'y', 'x', 'x', 'z'], 'fill mode (tie x/y → x)');
  r = step(ft, { op: 'fill', column: 's', method: 'mode', by: 'g' });
  eq(col(r.table, 's')[3], 'x', 'fill mode within group b (x and y tie → x)');
  r = step(ft, { op: 'fill', column: 'v', method: 'constant', value: '0' });
  eq(col(r.table, 'v'), ['1', 0, '4', '6', 0, 0], 'fill constant (a number in a numeric column)');
  ok(step(T(['v'], [[''], ['NA']]), { op: 'fill', column: 'v', method: 'mean' }).change.error, 'fill on an all-missing column refused');
  ok(step(T(['v'], [['$1'], ['']]), { op: 'fill', column: 'v', method: 'mean' }).change.error, 'fill mean needs numbers');
  const big = T(['v'], Array.from({ length: 20 }, (_, i) => [i < 18 ? String(i) : '']));
  const tr = C.trainRows(20, 0.7, 7);
  const trainMean = [...tr].filter((i) => i < 18).reduce((a, i) => a + i, 0) / [...tr].filter((i) => i < 18).length;
  r = step(big, { op: 'fill', column: 'v', method: 'mean', fit: 'train', seed: 7 });
  close(col(r.table, 'v')[19], trainMean, 'fill mean learned from the training subset');
  eq(tr.size, 14, 'training subset is 70%');
  // drop-missing and flag-missing
  r = step(ft, { op: 'drop-missing', columns: ['v'] });
  eq(r.table.ids, [1, 3, 4], 'drop-missing');
  r = step(ft, { op: 'flag-missing', column: 'v' });
  eq(r.table.columns.map((c) => c.name), ['g', 'v', 'v_missing', 's'], 'flag column after its source');
  eq(col(r.table, 'v_missing'), [0, 1, 0, 0, 1, 1], 'flag-missing values');
  // validate
  const vt = T(['q', 'e', 'd'], [['-2', 'a@b.co', '2026-02-28'], ['0', 'A@b.co', '2026-03-01'], ['3', 'x', '2026-07-01'], ['2.5', '', ''], ['999', 'c@d.org', '2026-06-30']]);
  r = step(vt, { op: 'validate', column: 'q', rule: { min: 1, max: 200, integer: true }, action: 'set-missing' });
  eq(col(r.table, 'q'), [null, null, '3', null, null], 'validate set-missing');
  r = step(vt, { op: 'validate', column: 'q', rule: { min: 1 }, action: 'drop' });
  eq(r.table.ids, [3, 4, 5], 'validate drop');
  r = step(vt, { op: 'validate', column: 'e', rule: { pattern: '^[a-z0-9.]+@[a-z0-9.]+\\.[a-z]{2,}$' }, action: 'flag' });
  eq(col(r.table, 'e_invalid'), [0, 1, 1, 0, 0], 'validate pattern flag (missing not flagged)');
  r = step(vt, { op: 'validate', column: 'd', rule: { min: '2026-03-01', max: '2026-06-30' }, action: 'flag' });
  eq(col(r.table, 'd_invalid'), [1, 0, 1, 0, 0], 'validate date range');
  r = step(vt, { op: 'validate', column: 'e', rule: { in: ['a@b.co', 'x'] }, action: 'flag' });
  eq(col(r.table, 'e_invalid'), [0, 1, 0, 0, 1], 'validate allowed list');
  ok(step(vt, { op: 'validate', column: 'q', rule: {} }).change.error, 'validate needs a rule');
  // outliers
  const ot = T(['x'], [['1'], ['2'], ['2'], ['3'], ['3'], ['3'], ['4'], ['4'], ['5'], ['30']]);
  r = step(ot, { op: 'outliers', column: 'x', method: 'iqr', k: 1.5, action: 'flag' });
  eq([r.change.params.q1, r.change.params.q3, r.change.params.lower, r.change.params.upper], [2.25, 4, -0.375, 6.625], 'IQR fences by hand: Q1 2.25, Q3 4');
  eq(col(r.table, 'x_outlier'), [0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 'IQR flags 30');
  r = step(ot, { op: 'outliers', column: 'x', method: 'iqr', action: 'cap' });
  eq(col(r.table, 'x')[9], 6.625, 'cap at the upper fence');
  eq(r.change.cellsChanged, 1, 'cap counts one change');
  r = step(ot, { op: 'outliers', column: 'x', method: 'iqr', action: 'drop' });
  eq(r.table.rows.length, 9, 'drop outliers');
  const xs = [1, 2, 2, 3, 3, 3, 4, 4, 5, 30];
  const m = xs.reduce((a, b) => a + b) / 10, sd = Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / 9);
  r = step(ot, { op: 'outliers', column: 'x', method: 'z', k: 2, action: 'flag' });
  close(r.change.params.sd, sd, 'z rule uses the sample SD');
  eq(col(r.table, 'x_outlier')[9], 1, 'z flags 30 at k = 2');
  r = step(ot, { op: 'outliers', column: 'x', method: 'mad', action: 'flag' });
  eq([r.change.params.median, r.change.params.mad], [3, 1], 'median 3, MAD 1');
  close(r.change.params.upper, 3 + 3.5 / 0.6745, 'modified z bound = median + 3.5 × MAD / 0.6745');
  ok(/MAD is 0/.test(step(T(['x'], [['1'], ['1'], ['1'], ['5']]), { op: 'outliers', column: 'x', method: 'mad' }).change.error), 'MAD = 0 refused with a reason');
  ok(step(T(['x'], [['1'], ['2']]), { op: 'outliers', column: 'x' }).change.error, 'too few values refused');
  // transform
  const err = step(T(['x'], [['0'], ['5'], ['-1']]), { op: 'transform', column: 'x', fn: 'log' }).change.error;
  ok(/undefined for zero and negative/.test(err) && /2 values/.test(err), 'log of zero/negative refused with a clear message');
  r = step(T(['x'], [['0'], ['9']]), { op: 'transform', column: 'x', fn: 'log1p', as: 'lx' });
  eq(col(r.table, 'lx'), [0, Math.log(10)], 'log1p handles zero, as a new column');
  eq(col(r.table, 'x'), ['0', '9'], 'source column kept');
  r = step(T(['x'], [['4'], ['9']]), { op: 'transform', column: 'x', fn: 'sqrt' });
  eq(col(r.table, 'x'), [2, 3], 'sqrt in place');
  ok(step(T(['x'], [['-4']]), { op: 'transform', column: 'x', fn: 'sqrt' }).change.error, 'sqrt of a negative refused');
  r = step(T(['g'], [['3.2'], ['80'], ['']]), { op: 'transform', column: 'g', fn: 'rescale', factor: 0.04, above: 4 });
  eq(col(r.table, 'g'), [3.2, 3.2, null], 'rescale only above the threshold');
  // scale
  const st = T(['x'], [['2'], ['4'], ['6'], ['8'], ['']]);
  r = step(st, { op: 'scale', column: 'x', method: 'zscore' });
  const zs = col(r.table, 'x').slice(0, 4);
  close(zs.reduce((a, b) => a + b) / 4, 0, 'z-scores have mean 0');
  close(Math.sqrt(zs.reduce((a, b) => a + b * b, 0) / 3), 1, 'z-scores have sample SD 1');
  eq(col(r.table, 'x')[4], null, 'missing stays missing');
  r = step(st, { op: 'scale', column: 'x', method: 'minmax' });
  eq(col(r.table, 'x').slice(0, 4), [0, 1 / 3, 2 / 3, 1], 'min-max');
  r = step(st, { op: 'scale', column: 'x', method: 'robust', as: 'xr' });
  eq(col(r.table, 'xr').slice(0, 4), [-1, -1 / 3, 1 / 3, 1], 'robust: (x − median) ÷ IQR, median 5, IQR 6.5 − 3.5 = 3');
  const many = T(['x'], Array.from({ length: 10 }, (_, i) => [String(i * i)]));
  r = step(many, { op: 'scale', column: 'x', method: 'minmax', fit: 'train', seed: 7 });
  const trn = [...C.trainRows(10, 0.7, 7)].map((i) => i * i);
  eq([r.change.params.min, r.change.params.max, r.change.params.trainRows], [Math.min(...trn), Math.max(...trn), 7], 'min-max fitted on the 70% training subset');
  ok(/training subset/.test(r.change.note) && /never influenced/.test(r.change.note), 'train fit explained');
  ok(/leakage/.test(step(many, { op: 'scale', column: 'x' }).change.note), 'fit on all rows mentions leakage');
  ok(step(T(['x'], [['3'], ['3']]), { op: 'scale', column: 'x' }).change.error, 'SD 0 refused');
  // encode
  const et = T(['r', 'n'], [['North', '1'], ['South', '2'], ['East', '3'], ['', '4'], ['North', '5']]);
  r = step(et, { op: 'encode', column: 'r', method: 'onehot' });
  eq(r.table.columns.map((c) => c.name), ['r_East', 'r_North', 'r_South', 'n'], 'one-hot columns in alphabetical order, in place');
  eq(r.table.rows[3].slice(0, 3), [0, 0, 0], 'missing → zeros');
  r = step(et, { op: 'encode', column: 'r', method: 'onehot', dropFirst: true });
  eq(r.table.columns.map((c) => c.name), ['r_North', 'r_South', 'n'], 'drop first level');
  r = step(T(['y'], [['Low'], ['High'], ['Mid'], ['Odd'], ['']]), { op: 'encode', column: 'y', method: 'ordinal', order: ['Low', 'Mid', 'High'] });
  eq(col(r.table, 'y'), [0, 2, 1, null, ''], 'ordinal codes; unknown → missing');
  eq(r.change.unresolved.length, 1, 'ordinal lists the unknown value');
  // derive
  const dv = T(['a', 'b', 'd1', 'd2'], [['6', '3', '2026-03-02', '2026-03-05'], ['1', '0', '2026-12-31', '2027-01-01'], ['', '2', '', '2026-01-01']]);
  r = step(dv, { op: 'derive', as: 'ratio', from: ['a', 'b'], fn: 'divide' });
  eq(col(r.table, 'ratio'), [2, null, null], 'divide; zero divisor and missing → missing');
  ok(/divisor was 0/.test(r.change.note), 'zero divisor noted');
  eq(col(step(dv, { op: 'derive', as: 'p', from: ['a', 'b'], fn: 'multiply' }).table, 'p'), [18, 0, null], 'multiply');
  eq(col(step(dv, { op: 'derive', as: 'g', from: ['d1', 'd2'], fn: 'days-between' }).table, 'g'), [3, 1, null], 'days between');
  eq(col(step(dv, { op: 'derive', as: 'y', from: ['d1'], fn: 'year' }).table, 'y'), [2026, 2026, null], 'year');
  eq(col(step(dv, { op: 'derive', as: 'm', from: ['d1'], fn: 'month' }).table, 'm'), [3, 12, null], 'month');
  eq(col(step(dv, { op: 'derive', as: 'w', from: ['d1'], fn: 'weekday' }).table, 'w'), ['Monday', 'Thursday', null], 'weekday');
  ok(/Convert/.test(step(T(['d'], [['04/03/2026'], ['x']]), { op: 'derive', as: 'y', from: ['d'], fn: 'year' }).change.error), 'derive from text dates refused');
  ok(step(dv, { op: 'derive', as: 'a', from: ['a', 'b'], fn: 'add' }).change.error, 'derive name clash refused');
  // rename and drop-column
  r = step(dv, { op: 'rename', from: 'a', to: 'alpha' });
  eq(r.table.columns[0].name, 'alpha', 'rename');
  ok(step(dv, { op: 'rename', from: 'a', to: 'b' }).change.error, 'rename clash refused');
  r = step(dv, { op: 'drop-column', column: 'b' });
  eq([r.table.columns.length, r.table.rows[0]], [3, ['6', '2026-03-02', '2026-03-05']], 'drop-column');
  // fitting on rows marked in a split column, target encoding, cross-column validation
  const sp = T(['split', 'x', 'g', 'y'], [['train', '10', 'a', '1'], ['train', '20', 'a', '0'], ['train', '30', 'b', '1'], ['test', '400', 'b', '0'], ['test', '50', 'c', '1']]);
  r = step(sp, { op: 'scale', column: 'x', method: 'minmax', fit: 'train', split: 'split' });
  eq([r.change.params.min, r.change.params.max, r.change.params.trainRows], [10, 30, 3], 'min-max fitted on split = train rows');
  eq(col(r.table, 'x'), [0, 0.5, 1, 19.5, 2], 'test rows scaled with training parameters');
  ok(/split = train/.test(r.change.note), 'split fit explained');
  r = step(sp, { op: 'scale', column: 'x', method: 'minmax', fit: 'all', split: 'split' });
  eq(r.change.params.max, 400, 'fit on all rows includes the test row (leakage)');
  ok(step(sp, { op: 'scale', column: 'x', fit: 'train', split: 'nope' }).change.error, 'unknown split column refused');
  r = step(sp, { op: 'encode', column: 'g', method: 'target', target: 'y', fit: 'train', split: 'split' });
  eq(col(r.table, 'g_target'), [0.5, 0.5, 1, 1, 2 / 3], 'target means from training rows; unseen level gets the training mean');
  r = step(sp, { op: 'encode', column: 'g', method: 'target', target: 'y', fit: 'all' });
  eq(col(r.table, 'g_target'), [0.5, 0.5, 0.5, 0.5, 1], 'target means from all rows');
  ok(/leakage/.test(r.change.note), 'target encoding on all rows names the leakage');
  const hv = T(['ci', 'co', 'n'], [['2026-03-01', '2026-03-04', '3'], ['2026-03-05', '2026-02-07', '3'], ['2026-03-01', '2026-03-03', '3']]);
  r = step(hv, { op: 'validate', column: 'co', rule: { other: 'ci', op: '>' }, action: 'flag' });
  eq(col(r.table, 'co_invalid'), [0, 1, 0], 'validate: check_out after check_in');
  r = step(hv, { op: 'validate', column: 'n', rule: { expr: 'days_between(ci, co)' }, action: 'flag' });
  eq(col(r.table, 'n_invalid'), [0, 1, 1], 'validate: nights equals the days between the dates');
  // refusals
  ok(/Unknown operation/.test(C.apply(dv, { op: 'shuffle' }).change.error), 'unknown op refused');
  ok(/no column called/.test(C.apply(dv, { op: 'trim', column: 'zz' }).change.error), 'missing column refused');
  ok(C.apply(dv, { op: 'trim', column: 'zz' }).table === dv, 'refused step returns the input table');
  // single row edge cases
  const one = T(['x'], [['5']]);
  ok(step(one, { op: 'dedupe' }).table.rows.length === 1, 'single row dedupe');
  ok(step(one, { op: 'scale', column: 'x' }).change.error, 'single row scale refused');
}

// ================================================================ suggestMapping
{
  const region = ['North', 'North', 'North', 'North', 'north ', 'N.', 'Nrth', 'South', 'South', 'South', 'S.', 'Soth', 'East', 'East', 'East', 'east', 'E.', 'West', 'West', 'West', 'Wset', 'Central', 'Central', 'Central', 'central'];
  eqMap(C.suggestMapping(region), { 'north ': 'North', 'N.': 'North', Nrth: 'North', 'S.': 'South', Soth: 'South', east: 'East', 'E.': 'East', Wset: 'West', central: 'Central' }, 'region variants');
  eqMap(C.suggestMapping(['East', 'East', 'West', 'West', 'West', 'West', 'West', 'West', 'West']), {}, 'East and West are not merged');
  eqMap(C.suggestMapping(['United States', 'United States', 'United States', 'US', 'USA', 'us', 'U.S.', 'Canada', 'Canada', 'CA', 'UK', 'United Kingdom', 'GB']),
    { US: 'United States', USA: 'United States', us: 'United States', 'U.S.': 'United States', CA: 'Canada', UK: 'United Kingdom', GB: 'United Kingdom' }, 'country codes');
  const prog = ['Computer Science', 'Computer Science', 'Computer Science', 'CS', 'Comp. Sci.', 'Business Administration', 'Business Administration', 'Business Administration', 'Bus. Admin.', 'Business Admin', 'Psychology', 'Psychology', 'Psychology', 'Psych', 'Pyschology'];
  eqMap(C.suggestMapping(prog), { CS: 'Computer Science', 'Comp. Sci.': 'Computer Science', 'Bus. Admin.': 'Business Administration', 'Business Admin': 'Business Administration', Psych: 'Psychology', Pyschology: 'Psychology' }, 'abbreviations, initials and a transposition');
  eqMap(C.suggestMapping(['On campus', 'On campus', 'Off campus', 'Off campus', 'Off campus'], { targets: ['On campus', 'Off campus'] }), {}, 'allowed values are never merged');
  eqMap(C.suggestMapping(['US', 'US', 'United States'], { targets: ['United States'] }), { US: 'United States' }, 'allowed value wins over the most frequent spelling');
}

// ================================================================ rules, goals, compare
{
  const t = T(['id', 'q', 'p', 'd', 'tot', 'r', 'a', 'b'], [
    ['1', '2', '10', '0', '20', 'North', '2026-03-01', '2026-03-03'],
    ['2', '1', '$5.00', '1', '4', 'north', '2026-03-05', '2026-03-04'],
    ['2', '3', '2', '0', '7', '', '2026-03-05', '2026-03-09'],
  ]);
  const g = C.checkGoals(t, [
    { id: 'u', rule: 'unique', column: 'id' },
    { id: 'nm', rule: 'no-missing', column: 'r' },
    { id: 'ty', rule: 'type', column: 'p', type: 'number' },
    { id: 'tq', rule: 'type', column: 'q', type: 'number' },
    { id: 'td', rule: 'type', column: 'a', type: 'date' },
    { id: 'set', rule: 'in-set', column: 'r', values: ['North', 'South'] },
    { id: 'rg', rule: 'range', column: 'q', min: 1, max: 3, integer: true },
    { id: 'rows', rule: 'rows-between', min: 2, max: 3 },
    { id: 'rows2', rule: 'rows-between', min: 4, max: 9 },
    { id: 'eq', rule: 'equals', column: 'tot', expr: 'q * p - d', tol: 0.01 },
    { id: 'cmp', rule: 'compare', column: 'b', op: '>', other: 'a' },
  ]);
  const met = Object.fromEntries(g.map((x) => [x.id, x.met]));
  eq(met, { u: false, nm: false, ty: false, tq: true, td: true, set: false, rg: true, rows: true, rows2: false, eq: false, cmp: false }, 'goal results');
  ok(g.find((x) => x.id === 'eq').rows.join() === '1,2', 'equals: strict goals count text numbers as unchecked, and 3 × 2 − 0 ≠ 7');
  ok(g.every((x) => typeof x.text === 'string' && x.text.length > 5 && typeof x.detail === 'string'), 'goals carry text and detail');
  eq(C.evalRule(t, { rule: 'equals', column: 'tot', expr: 'q * p - d' }, { loose: true }).rows, [2], 'loose evaluation reads $5.00');
  let threw = false; try { C.compileExpr('q * nope', ['q']); } catch { threw = true; }
  ok(threw, 'unknown column in an expression throws');
  eq(C.compileExpr('(a + b) × 2 − abs(c)', ['a', 'b', 'c']).eval((n) => ({ a: 1, b: 2, c: -3 })[n]), 3, 'expression arithmetic');
  // compare
  const before = T(['sub', 'rating'], [['yes', '5'], ['yes', '4'], ['no', ''], ['no', '3'], ['no', ''], ['no', '2']]);
  const after = C.apply(before, { op: 'drop-missing', columns: ['rating'] }).table;
  const [s, rt] = C.compare(before, after, { watch: ['sub', 'rating'] });
  eq([s.kind, s.before.levels.find((l) => l[0] === 'yes')[2], s.after.levels.find((l) => l[0] === 'yes')[2]], ['category', 2 / 6, 2 / 4], 'deleting missing ratings raises the subscriber share');
  eq([rt.kind, rt.before.count, rt.after.count, rt.before.missing, rt.after.missing], ['number', 4, 4, 2, 0], 'numeric compare counts');
  close(rt.after.mean, 3.5, 'mean after');
  const filled = C.apply(before, { op: 'fill', column: 'rating', method: 'mean' }).table;
  const [, rf] = C.compare(before, filled, { watch: ['sub', 'rating'] });
  ok(rf.after.sd < rf.before.sd && Math.abs(rf.after.mean - rf.before.mean) < 1e-12, 'mean imputation keeps the mean and shrinks the SD');
}

// ================================================================ recipes replay identically
{
  const raw = C.fromCSV(read('assets/data/study/lantern-orders.csv'));
  const recipe = [
    { op: 'dedupe' }, { op: 'trim', all: true }, { op: 'to-number', column: 'unit_price' }, { op: 'nonsense' },
    { op: 'fill', column: 'rating', method: 'median', by: 'subscription' }, { op: 'outliers', column: 'quantity', method: 'iqr', action: 'flag' },
  ];
  const a = C.run(raw, recipe), b = C.run(raw, recipe);
  ok(C.toCSV(a.table) === C.toCSV(b.table), 'run twice → identical CSV');
  let t = raw;
  recipe.forEach((s) => { t = C.apply(t, s).table; });
  ok(C.toCSV(t) === C.toCSV(a.table), 'run equals applying the steps one by one');
  ok(a.changes[3].error && a.changes.length === recipe.length, 'refused step recorded and skipped');
  ok(C.toCSV(C.run(raw, []).table) === C.toCSV(raw), 'empty recipe returns the raw table');
}

// ================================================================ datasets: generator, manifests and truth
const files = buildAll();
{
  const again = buildAll();
  ok(Object.keys(files).every((k) => files[k] === again[k]), 'generator is deterministic');
  for (const [rel, text] of Object.entries(files)) ok(read(rel) === text, `${rel} on disk matches a fresh build`);
}
const NAMES = ['lantern-orders', 'harborview-bookings', 'northfield-students'];
const ROW_KINDS = new Set(['exact-duplicate', 'duplicate-key', 'near-duplicate']);
const sameValue = (a, b) => {
  if (a === b) return true;
  const x = C.readNumber(a), y = C.readNumber(b);
  return !!(x && y && Math.abs(x.value - y.value) < 1e-9 && !/^\s|\s$/.test(a) && !/^\s|\s$/.test(b));
};
for (const name of NAMES) {
  const raw = C.fromCSV(files[`assets/data/study/${name}.csv`]);
  const truth = C.fromCSV(files[`tests/fixtures-study/${name}.truth.csv`]);
  const man = JSON.parse(files[`assets/data/study/${name}.manifest.json`]);
  eq([raw.rows.length, truth.rows.length], [man.rows, man.truthRows], `${name}: row counts match the manifest`);
  eq(raw.columns.map((c) => c.name), man.columns, `${name}: columns`);
  const extra = new Set(man.defects.filter((d) => ROW_KINDS.has(d.kind)).map((d) => d.extraRow));
  eq(raw.rows.length - extra.size, truth.rows.length, `${name}: removing the extra rows aligns raw with truth`);
  // row-level defects
  for (const d of man.defects.filter((x) => ROW_KINDS.has(x.kind))) {
    const keep = d.kind === 'exact-duplicate' ? d.duplicateOf : d.keepRow;
    const a = raw.rows[keep - 1], b = raw.rows[d.extraRow - 1];
    if (d.kind === 'exact-duplicate') ok(a.join('␟') === b.join('␟'), `${name}: exact duplicate rows ${d.rows}`);
    else {
      const diff = man.columns.filter((_, j) => a[j] !== b[j]);
      eq(diff, d.differences.map((x) => x.column), `${name}: ${d.kind} rows ${d.rows} differ only in the listed columns`);
      d.differences.forEach((x) => ok(a[man.columns.indexOf(x.column)] === x.kept && b[man.columns.indexOf(x.column)] === x.extra, `${name}: ${d.kind} values at rows ${d.rows}`));
      if (d.kind === 'duplicate-key') ok(a[0] === b[0], `${name}: duplicate-key rows share the key`);
    }
  }
  // cell defects: present at the stated row, and the truth differs only there
  const cellDefects = man.defects.filter((x) => !ROW_KINDS.has(x.kind));
  const listed = new Map(cellDefects.map((d) => [`${d.rows[0]}|${d.column}`, d]));
  ok(listed.size === cellDefects.length, `${name}: one defect per cell`);
  let t = 0, diffs = 0, unlisted = 0, wrong = 0;
  raw.rows.forEach((row, i) => {
    if (extra.has(i + 1)) return;
    const tr = truth.rows[t++];
    man.columns.forEach((c, j) => {
      const d = listed.get(`${i + 1}|${c}`);
      if (d) { diffs++; if (row[j] !== d.corrupted || tr[j] !== d.original) wrong++; }
      else if (!sameValue(row[j], tr[j])) { unlisted++; if (unlisted < 4) console.log(`  unlisted difference ${name} row ${i + 1} ${c}: “${row[j]}” vs “${tr[j]}”`); }
    });
  });
  eq([diffs, wrong, unlisted], [cellDefects.length, 0, 0], `${name}: every listed defect is at its row and the truth differs only there`);
  for (const nb of man.notable) ok(raw.rows[nb.rows[0] - 1][man.columns.indexOf(nb.column)] === nb.value, `${name}: notable value ${nb.value} at row ${nb.rows[0]}`);
  // the truth passes every validation rule of the data dictionary
  const truthTable = C.fromCSV(files[`tests/fixtures-study/${name}.truth.csv`]);
  C.checkGoals(truthTable, C.DATASETS[name].rules).forEach((g) => ok(g.met, `${name}: truth passes “${g.text}” (${g.detail})`));
  // defects are a minority of rows
  ok(man.rowsWithDefects / man.rows < 0.4, `${name}: ${man.rowsWithDefects} of ${man.rows} rows have a defect (under 40%)`);
  // detectIssues finds every kind, at the stated rows
  const issues = C.detectIssues(raw, { rules: C.DATASETS[name].rules });
  const KIND = { 'exact-duplicate': ['exact-duplicate'], 'duplicate-key': ['duplicate-key'], 'near-duplicate': ['near-duplicate'], 'date-format': ['mixed-date-format'], 'decimal-comma': ['invalid-type'], 'out-of-range': ['out-of-range'], 'outlier-error': ['outlier', 'out-of-range'], 'inconsistent-category': ['inconsistent-category'], whitespace: ['whitespace'], case: ['case'], missing: ['missing'], 'rule-violation': ['rule'], 'scale-mix': ['out-of-range'], 'date-order': ['rule'] };
  const kindsSeen = new Set();
  for (const d of man.defects) {
    const want = KIND[d.kind];
    ok(!!want, `${name}: manifest kind ${d.kind} is mapped`);
    const rows = ROW_KINDS.has(d.kind) ? [d.extraRow] : d.rows;
    const colOk = (x) => ROW_KINDS.has(d.kind) || x.column === d.column || (x.kind === 'rule' && x.rule && (x.rule.column === d.column || x.rule.other === d.column || (x.rule.expr || '').includes(d.column)));
    const found = issues.some((x) => want.includes(x.kind) && colOk(x) && rows.every((r) => x.rows.includes(r - 1)));
    ok(found, `${name}: detectIssues finds ${d.kind} at row ${rows} (${d.column})`);
    if (found) kindsSeen.add(d.kind);
    if (d.kind === 'date-format' && d.ambiguous) ok(issues.some((x) => x.kind === 'ambiguous-date' && x.rows.includes(d.rows[0] - 1)), `${name}: ambiguous date at row ${d.rows[0]}`);
  }
  ok(kindsSeen.size === new Set(man.defects.map((d) => d.kind)).size, `${name}: every defect kind detected`);
}

// ================================================================ a full clean of lantern-orders reaches the truth
{
  const raw = C.fromCSV(read('assets/data/study/lantern-orders.csv'));
  const truth = C.fromCSV(read('tests/fixtures-study/lantern-orders.truth.csv'));
  const man = JSON.parse(read('assets/data/study/lantern-orders.manifest.json'));
  const rules = C.DATASETS['lantern-orders'].rules;
  const cats = (t, c) => C.suggestMapping(col(t, c), { targets: rules.find((r) => r.column === c && r.rule === 'in-set')?.values });
  let t = raw;
  const recipe = [];
  const add = (s) => { recipe.push(s); const r = C.apply(t, s); ok(!r.change.error, `lantern recipe step ${s.op} ${s.column || ''}: ${r.change.error || 'ok'}`); t = r.table; };
  add({ op: 'dedupe' });
  add({ op: 'trim', all: true });
  add({ op: 'map', column: 'region', mapping: cats(t, 'region') });
  add({ op: 'case', column: 'product', to: 'title' });
  add({ op: 'case', column: 'email', to: 'lower' });
  add({ op: 'dedupe-key', columns: ['order_id'], keep: 'most-complete' });
  add({ op: 'to-date', column: 'order_date', order: 'DMY', serial: true });
  add({ op: 'to-date', column: 'order_date', order: 'auto' });
  add({ op: 'to-number', column: 'unit_price', decimal: '.' });
  add({ op: 'to-number', column: 'unit_price', decimal: ',' });
  add({ op: 'to-number', column: 'order_total', decimal: '.' });
  add({ op: 'fill', column: 'email', method: 'mode', by: 'customer_id' });
  const extra = new Set(man.defects.filter((d) => ROW_KINDS.has(d.kind)).map((d) => d.extraRow));
  eq(t.ids, raw.ids.filter((id) => !extra.has(id)), 'lantern: dedupe + dedupe-key remove exactly the extra rows');
  for (const c of ['order_date', 'region', 'product']) eq(col(t, c), col(truth, c), `lantern: ${c} equals the truth after cleaning`);
  const emailsOk = col(t, 'email').filter((v, i) => v === col(truth, 'email')[i]).length;
  eq(emailsOk, truth.rows.length - 3, 'lantern: every e-mail recovered except the 3 customers with one order');
  const goals = C.checkGoals(t, [{ rule: 'unique', column: 'order_id' }, { rule: 'type', column: 'order_date', type: 'date' }, { rule: 'type', column: 'unit_price', type: 'number' }, { rule: 'in-set', column: 'region', values: ['North', 'South', 'East', 'West', 'Central'] }, { rule: 'rows-between', min: 231, max: 231 }]);
  ok(goals.every((g) => g.met), `lantern: goals met (${goals.filter((g) => !g.met).map((g) => g.text).join('; ')})`);
  const iss = C.detectIssues(t, { rules });
  ok(!iss.some((x) => ['exact-duplicate', 'duplicate-key', 'mixed-date-format', 'ambiguous-date', 'whitespace', 'case', 'inconsistent-category'].includes(x.kind)), 'lantern: format and text issues all resolved');
  // the report
  const rep = C.qualityReport(raw, t, recipe, { name: 'lantern-orders', date: '2026-10-22', rules, notes: ['Checked against the shop system.'] });
  ok(rep === C.qualityReport(raw, null, recipe, { name: 'lantern-orders', date: '2026-10-22', rules, notes: ['Checked against the shop system.'] }), 'report is reproducible');
  for (const h of ['# Data quality report: lantern-orders', '## Summary', '## Issues found and what happened to them', '## Cleaning steps', '## Effect on the main variables', '## Remaining caveats', '## Assumptions', '## Recipe']) ok(rep.includes(h), `report has “${h}”`);
  ok(rep.includes('| Rows | 240 | 231 |'), 'report rows before and after');
  ok(rep.includes('Slash dates in order_date were written day first'), 'report states the date assumption');
  ok(rep.includes('Checked against the shop system.'), 'report includes the notes');
  ok(!/Step 7 left/.test(rep), 'caveats skip values a later step fixed (month-first dates)');
  const json = rep.split('```json\n')[1].split('\n```')[0];
  eq(JSON.parse(json).length, recipe.length, 'report recipe is valid JSON');
  ok(!/!/.test(rep.replace(/```json[\s\S]*```/, '').replace(/!=/g, '')), 'report has no exclamation marks');
}

// ================================================================ speed with a 5,000-row upload
{
  const raw = C.fromCSV(read('assets/data/study/lantern-orders.csv'));
  const rows = [];
  for (let k = 0; rows.length < 5000; k++) raw.rows.forEach((r) => { if (rows.length < 5000) rows.push(r.map((c, j) => (j === 0 ? `${c}-${k}` : c))); });
  const big = { columns: raw.columns, rows, ids: rows.map((_, i) => i + 1) };
  const t0 = performance.now();
  C.detectIssues(big, { rules: C.DATASETS['lantern-orders'].rules });
  const t1 = performance.now();
  C.run(big, [{ op: 'dedupe' }, { op: 'trim', all: true }, { op: 'to-date', column: 'order_date', order: 'auto', serial: true }, { op: 'to-number', column: 'unit_price' }]);
  const t2 = performance.now();
  console.log(`  5,000 rows: detectIssues ${(t1 - t0).toFixed(0)} ms, four steps ${(t2 - t1).toFixed(0)} ms`);
  ok(t1 - t0 < 4000 && t2 - t1 < 2000, '5,000 rows are processed in seconds');
}

console.log(`\n${pass} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
