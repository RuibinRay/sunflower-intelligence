// csv.test.mjs — the table reader's date handling: a column's day/month order is decided from the whole column,
// and the reader says so whenever it has to guess. Run: node tests/csv.test.mjs
import { parseTable, parseDate } from '../assets/js/core/csv.js';

let pass = 0, fail = 0;
const iso = (v) => (Number.isFinite(v) ? new Date(v).toISOString().slice(0, 10) : 'NaN');
const eq = (what, got, want) => { if (JSON.stringify(got) === JSON.stringify(want)) pass++; else { fail++; console.log(`✗ ${what}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); } };
const col = (text) => parseTable(text);

let t = col('d\n13/02/2026\n03/04/2026');
eq('day-first column read day-first', t.columns[0].values.map(iso), ['2026-02-13', '2026-04-03']);
eq('no warning when the column settles the order', t.warnings, []);
t = col('d\n02/13/2026\n03/04/2026');
eq('month-first column read month-first', t.columns[0].values.map(iso), ['2026-02-13', '2026-03-04']);
t = col('d\n03/04/2026\n05/06/2026');
eq('all-ambiguous column read month/day', t.columns[0].values.map(iso), ['2026-03-04', '2026-05-06']);
eq('all-ambiguous column warns', t.warnings.length, 1);
t = col('d\n13/02/2026\n02/13/2026');
eq('mixed column warns', t.warnings.length, 1);
eq('ISO dates untouched', iso(parseDate('2026-07-31')), '2026-07-31');
eq('explicit dmy', iso(parseDate('03/04/2026', 'dmy')), '2026-04-03');
eq('impossible date rejected', iso(parseDate('31/02/2026', 'dmy')), 'NaN');
console.log(fail ? `${fail} failed, ${pass} passed` : `all ${pass} checks passed`);
process.exit(fail ? 1 : 0);
