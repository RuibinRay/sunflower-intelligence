// Run: node tests/sheet.test.mjs   (the B03 spreadsheet engine, assets/js/core/sheet.js)
// 1. 239 formulas recalculated by LibreOffice Calc (tests/fixtures-sheet.json, made by tests/make_fixtures_sheet.py);
//    where LibreOffice and Excel differ, the fixture holds Excel's documented value and the reason is in the script.
// 2. Functions new in Excel 365 (not in LibreOffice 24.2), checked against the rules in Microsoft's help pages.
// 3. Filling formulas, spills, tables, grading, pivot tables, Goal Seek, data tables and Solver.
import { readFileSync } from 'node:fs';
import * as X from '../assets/js/core/sheet.js';

const { Sheet, evaluate, isErr, display } = X;
let fails = 0, checks = 0;
const show = (v) => (isErr(v) ? v.code : v instanceof X.Arr ? JSON.stringify(v.rows) : JSON.stringify(v));
function same(got, want, tol = 1e-9) {
  if (want && typeof want === 'object' && 'error' in want) return isErr(got) && got.code === want.error;
  if (typeof want === 'number') return typeof got === 'number' && Math.abs(got - want) <= tol * Math.max(1, Math.abs(want));
  if (Array.isArray(want)) return got instanceof X.Arr && JSON.stringify(got.rows) === JSON.stringify(want);
  return got === want;
}
const eq = (label, got, want, tol) => { checks++; if (!same(got, want, tol)) { fails++; console.log(`FAIL ${label}: got ${show(got)}, want ${JSON.stringify(want)}`); } };
const ok = (label, cond) => { checks++; if (!cond) { fails++; console.log(`FAIL ${label}`); } };

// ---------------------------------------------------------------- 1. LibreOffice reference values
const fx = JSON.parse(readFileSync(new URL('./fixtures-sheet.json', import.meta.url)));
{
  const cells = { ...fx.cells };
  for (const [a, f] of fx.cases) cells[a] = f;
  const sh = new Sheet({ cells });
  for (const [a, f, want] of fx.cases) eq(`${a} ${f}`, sh.get(a), want);
}
const base = fx.cells;
const E = (f, extra = {}) => evaluate(f, new Sheet({ cells: { ...base, ...extra } }));

// ---------------------------------------------------------------- 2. Excel 365 functions (Microsoft's help pages)
// XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode]):
// match_mode 0 exact (default) | -1 exact or next smaller | 1 exact or next larger | 2 wildcard;
// search_mode 1 first-to-last (default) | -1 last-to-first; #N/A when nothing matches and if_not_found is missing.
eq('XLOOKUP exact', E('=XLOOKUP("Pastry",C2:C13,F2:F13)'), 13);
eq('XLOOKUP first match', E('=XLOOKUP("House Blend",C2:C13,A2:A13)'), base.A2);
eq('XLOOKUP last match (search_mode -1)', E('=XLOOKUP("House Blend",C2:C13,A2:A13,,0,-1)'), base.A13);
eq('XLOOKUP not found', E('=XLOOKUP("Tea",C2:C13,F2:F13)'), { error: '#N/A' });
eq('XLOOKUP if_not_found', E('=XLOOKUP("Tea",C2:C13,F2:F13,"none")'), 'none');
eq('XLOOKUP case-insensitive', E('=XLOOKUP("pastry",C2:C13,D2:D13)'), 4);
eq('XLOOKUP next smaller (-1)', E('=XLOOKUP(180,J2:J5,K2:K5,,-1)'), 0.02);
eq('XLOOKUP next larger (1)', E('=XLOOKUP(180,J2:J5,K2:K5,,1)'), 0.05);
eq('XLOOKUP exact beats next smaller', E('=XLOOKUP(250,J2:J5,K2:K5,,-1)'), 0.05);
eq('XLOOKUP wildcard (2)', E('=XLOOKUP("Single*",C2:C13,F2:F13,,2)'), 120);
eq('XLOOKUP "*" is literal without match_mode 2', E('=XLOOKUP("Single*",C2:C13,F2:F13)'), { error: '#N/A' });
eq('XLOOKUP horizontal', E('=XLOOKUP("Q3",M1:P1,M2:P2)'), 150);
eq('XLOOKUP several columns spill', E('=XLOOKUP("Pastry",C2:C13,D2:F13)'), [[4, 3.25, 13]]);
eq('XLOOKUP size mismatch', E('=XLOOKUP("Pastry",C2:C13,F2:F12)'), { error: '#VALUE!' });
eq('XLOOKUP:XLOOKUP range (Microsoft example 6)', E('=SUM(XLOOKUP("Flat White",C2:C13,F2:F13):XLOOKUP("Pastry",C2:C13,F2:F13))'), 12.6 + 15 + 190 + 13);
eq('XMATCH exact', E('=XMATCH("Pastry",C2:C13)'), 5);
eq('XMATCH next larger', E('=XMATCH(180,J2:J5,1)'), 3);
eq('XMATCH last', E('=XMATCH("Online",B2:B13,0,-1)'), 11);
// FILTER(array, include, [if_empty]): #CALC! when nothing is left and if_empty is missing
eq('FILTER rows', E('=FILTER(C2:D13,B2:B13="Wholesale")'), [['House Blend', 20], ['Single Origin', 10], ['House Blend', 15]]);
eq('FILTER AND (*)', E('=FILTER(F2:F13,(B2:B13="Online")*(D2:D13>1))'), [[28], [42], [30]]);
eq('FILTER OR (+)', E('=FILTER(D2:D13,(B2:B13="Wholesale")+(D2:D13>5))'), [[20], [10], [6], [15]]);
eq('FILTER empty', E('=FILTER(F2:F13,B2:B13="Retail")'), { error: '#CALC!' });
eq('FILTER if_empty', E('=FILTER(F2:F13,B2:B13="Retail","none")'), 'none');
eq('FILTER size mismatch', E('=FILTER(F2:F13,B2:B12="Online")'), { error: '#VALUE!' });
// UNIQUE(array, [by_col], [exactly_once]); comparisons ignore case
eq('UNIQUE', E('=UNIQUE(B2:B13)'), [['Online'], ['Café'], ['Wholesale']]);
eq('UNIQUE exactly_once', E('=UNIQUE(S1:S8,FALSE,TRUE)'), [[7], [9], [2], [1]]);
eq('UNIQUE ignores case', E('=UNIQUE(H9:H11)', { H9: 'North', H10: 'north', H11: 'South' }), [['North'], ['South']]);
eq('UNIQUE rows', E('=UNIQUE(B2:C13)').h, 7);
// SORT(array, [sort_index], [sort_order]); SORTBY(array, by_array, [sort_order])
eq('SORT ascending', E('=SORT(R1:R4)'), [[25], [50], [75], [100]]);
eq('SORT by column 2 descending', E('=SORT(J2:K5,2,-1)'), [[500, 0.08], [250, 0.05], [100, 0.02], [0, 0]]);
eq('SORT text', E('=SORT(UNIQUE(B2:B13))'), [['Café'], ['Online'], ['Wholesale']]);
eq('SORTBY', E('=SORTBY(C2:C5,F2:F5,-1)'), [['House Blend'], ['House Blend'], ['Decaf Blend'], ['Flat White']]);
eq('SORT(FILTER) (Microsoft example 3)', E('=SORT(FILTER(C2:D13,B2:B13="Online"),2,-1)'), [['House Blend', 3], ['House Blend', 2], ['Decaf Blend', 2], ['Decaf Blend', 1], ['Single Origin', 1]]);
// SEQUENCE(rows, [columns], [start], [step])
eq('SEQUENCE', E('=SEQUENCE(2,3,10,5)'), [[10, 15, 20], [25, 30, 35]]);
eq('TEXTBEFORE', E('=TEXTBEFORE("LC-10001","-")'), 'LC');
eq('TEXTAFTER', E('=TEXTAFTER("LC-10001","-")'), '10001');
eq('TEXTAFTER missing', E('=TEXTAFTER("LC10001","-")'), { error: '#N/A' });
eq('TRANSPOSE', E('=TRANSPOSE(M1:P1)'), [['Q1'], ['Q2'], ['Q3'], ['Q4']]);
eq('FREQUENCY', E('=FREQUENCY(F2:F13,{20,50,100})'), [[6], [3], [0], [3]]);
eq('SUBTOTAL 9', E('=SUBTOTAL(9,F2:F13)'), E('=SUM(F2:F13)'));
eq('SUBTOTAL skips subtotals', E('=SUBTOTAL(9,F2:F14)', { F14: '=SUBTOTAL(9,F2:F13)' }), E('=SUM(F2:F13)'));
eq('SUBTOTAL 1', E('=SUBTOTAL(101,D2:D13)'), E('=AVERAGE(D2:D13)'));

// ---------------------------------------------------------------- 3a. operators and parsing
eq('array constant', E('=SUM({1,2;3,4})'), 10);
eq('array maths spills', E('=D2:D4*2'), [[4], [6], [2]]);
eq('% after ^', E('=10%^2'), 0.01);
eq('unknown function', E('=SUMM(1,2)'), { error: '#NAME?' });
eq('unknown name', E('=Revenue*2'), { error: '#NAME?' });
for (const bad of ['=SUM(1,', '=1+', '="abc', '=(1+2', '=1 2']) {
  let threw = false; try { X.parse(bad); } catch { threw = true; }
  ok(`parse error ${bad}`, threw);
}
eq('semicolon separators accepted', E('=SUM(1;2;3)'), 6);
eq('_xlfn prefix', E('=_xlfn.STDEV.S(1,2,3)'), 1);
ok('functionsUsed', [...X.functionsUsed('=IFERROR(SUMIFS(F:F,B:B,"x")/COUNTIF(B:B,"x"),0)')].sort().join() === 'COUNTIF,IFERROR,SUMIFS');
ok('literalsUsed', JSON.stringify(X.literalsUsed('=F2*1.1+ROUND(3,0)')) === '[1.1,3,0]');
ok('FUNCTIONS list', X.FUNCTIONS.includes('XLOOKUP') && X.FUNCTIONS.includes('SUMIFS') && X.FUNCTIONS.length > 100);

// ---------------------------------------------------------------- 3b. filling and copying formulas
const sf = X.shiftFormula;
eq('fill down relative', sf('=D2*E2', 1, 0), '=D3*E3');
eq('fill down absolute', sf('=D2*$E$2', 3, 0), '=D5*$E$2');
eq('fill right mixed', sf('=$A2*B$1', 0, 2), '=$A2*D$1');
eq('fill down mixed', sf('=$A2*B$1', 2, 0), '=$A4*B$1');
eq('ranges move', sf('=SUM(B2:B5)', 0, 1), '=SUM(C2:C5)');
eq('anchored range', sf('=SUM($B$2:B2)', 3, 0), '=SUM($B$2:B5)');
eq('text untouched', sf('="A1"&A1', 1, 0), '="A1"&A2');
eq('function names untouched', sf('=LOG10(A1)+ATAN2(1,1)', 1, 1), '=LOG10(B2)+ATAN2(1,1)');
eq('structured refs untouched', sf('=[@Qty]*Orders[Price]', 5, 0), '=[@Qty]*Orders[Price]');
eq('off the sheet', sf('=A1', -1, 0), '=#REF!');
eq('whole column refs', sf('=SUM(F:F)', 4, 0), '=SUM(F:F)');
eq('colToIndex', X.colToIndex('AB'), 27);
eq('indexToCol', X.indexToCol(27), 'AB');
eq('date serial', X.isoToSerial('2026-03-14'), 46095);
ok('serialToYMD', X.serialToYMD(46095).join('-') === '2026-3-14');

// the spilled range operator. Microsoft's “Spilled range operator” page: with =SEQUENCE(10) in A2, =SUM(A2#) is 55.
// The page doesn't say what A2# gives when A2 doesn't spill; this engine returns #REF!.
eq('Microsoft’s A2# example', evaluate('=C2', new Sheet({ cells: { A2: '=SEQUENCE(10)', C2: '=SUM(A2#)' } })), 55);
{
  const sh = new Sheet({ cells: { A1: 3, A2: 1, A3: 2, C1: '=SORT(A1:A3)', D1: '=SUM(C1#)', D2: '=ROWS(C1#)', D3: '=SUM(A1#)', E1: 5, E2: '=E1*2', D4: '=SUM(E2#)' } });
  eq('A2# sums the spill', sh.get('D1'), 6);
  eq('A2# has the spill’s rows', sh.get('D2'), 3);
  eq('A2# on a value is #REF!', sh.get('D3'), { error: '#REF!' });
  eq('A2# on a formula that doesn’t spill is #REF!', sh.get('D4'), { error: '#REF!' });
  eq('A2# moves when filled', X.shiftFormula('=SUM(C1#)', 1, 1), '=SUM(D2#)');
}
// Microsoft's COUNTIFS help, example 2: dates written as text in the criteria
{
  const cells = { A2: 1, A3: 2, A4: 3, A5: 4, A6: 5, A7: 6 };
  [2, 3, 4, 5, 6, 7].forEach((r, i) => { cells[`B${r}`] = X.isoToSerial(`2011-05-0${i + 1}`); });
  eq('COUNTIFS with a date in the criteria', evaluate('=COUNTIFS(A2:A7,"<5",B2:B7,"<5/3/2011")', new Sheet({ cells })), 2);
  eq('COUNTIF with a written-out date', evaluate('=COUNTIF(B2:B7,">=May 4, 2011")', new Sheet({ cells })), 3);
}
eq('ROW of a range spills', E('=ROW(C2:C5)'), [[2], [3], [4], [5]]);
eq('COLUMN of a range spills', E('=COLUMN(C2:E2)'), [[3, 4, 5]]);
eq('last match with MAX(IF(…ROW…))', E('=INDEX(F:F,MAX(IF(C2:C13="House Blend",ROW(C2:C13))))'), 142.5);
eq('CHOOSE with an array index', E('=CHOOSE({1,2},10,20)'), [[10, 20]]);
eq('left lookup with CHOOSE', E('=VLOOKUP(28,CHOOSE({1,2},F2:F13,A2:A13),2,FALSE)'), base.A2);
eq('near-zero sum is 0 (Microsoft KB 78113)', E('=1.333+1.225-1.333-1.225'), 0);
eq('empty criterion cell counts as 0', evaluate('=COUNTIF(A1:A4,B1)', new Sheet({ cells: { A1: 0, A2: 3, A4: 0 } })), 2);
eq('SUMIF sum_range resized from its top-left cell', E('=SUMIF(B2:B13,"Online",F2:F3)'), E('=SUMIF(B2:B13,"Online",F2:F13)'));
eq('TRIM keeps a non-breaking space', E('=LEN(TRIM(" a "&CHAR(160)))'), 3);
eq('PROPER after an apostrophe', E('=PROPER("o\'neil")'), "O'Neil");
eq('CHAR(128) is the euro sign in Windows-1252', E('=CHAR(128)'), '€');
eq('criteria error passes through', E('=COUNTIFS(B2:B13,"Online",D2:D13,yes)'), { error: '#NAME?' });

// ---------------------------------------------------------------- 3c. a sheet: recalculation, spills, tables, names
{
  const sh = new Sheet({ cells: { A1: 2, A2: 3, B1: '=A1*10', B2: '=B1+A2', C1: '=UNIQUE({1;1;2})', D1: '=B1:B2*2', E1: '=E2', E2: '=E1' } });
  eq('chained', sh.get('B2'), 23);
  sh.set('A1', 5);
  eq('recalculates after a change', sh.get('B2'), 53);
  eq('spill anchor', sh.get('C1'), 1);
  eq('spill below', sh.get('C2'), 2);
  eq('spill ends', sh.get('C3'), null);
  eq('array arithmetic spill', sh.get('D2'), 106);
  eq('circular', sh.get('E1'), { error: '#CIRC!' });
  sh.set('C2', 'x');
  eq('blocked spill', sh.get('C1'), { error: '#SPILL!' });
  eq('blocking cell kept', sh.get('C2'), 'x');
}
{
  const cells = { A1: 'Product', B1: 'Qty', C1: 'Price', D1: 'Revenue', A2: 'House', B2: 2, C2: 14, A3: 'Decaf', B3: 1, C3: 15, A4: 'House', B4: 3, C4: 14 };
  ['D2', 'D3', 'D4'].forEach((d) => { cells[d] = '=[@Qty]*[@Price]'; });
  cells.F1 = '=SUM(Orders[Revenue])'; cells.F2 = '=SUMIFS(Orders[Revenue],Orders[Product],"House")'; cells.F3 = '=ROWS(Orders)'; cells.F4 = '=Orders[@Qty]';
  cells.F5 = '=Rate*100'; cells.G1 = 0.05;
  const sh = new Sheet({ cells, tables: { Orders: 'A1:D4' }, names: { Rate: 'G1' } });
  eq('[@Col]', sh.get('D3'), 15);
  eq('Table[Col]', sh.get('F1'), 85);
  eq('SUMIFS on table columns', sh.get('F2'), 70);
  eq('table name is its data', sh.get('F3'), 3);
  eq('Table[@Col] in a row the table crosses', sh.get('F4'), 3);
  sh.set('F6', '=Orders[@Qty]');
  eq('Table[@Col] in a row outside the table', sh.get('F6'), { error: '#VALUE!' });
  eq('defined name', sh.get('F5'), 5);
  eq('unknown column', evaluate('=SUM(Orders[Cost])', sh), { error: '#REF!' });
}
eq('display general', display(1 / 3), '0.333333333333333');
eq('display money', display(1234.5, '$#,##0.00'), '$1,234.50');
eq('display pct', display(0.1234, '0.0%'), '12.3%');
eq('display date', display(46095, 'date'), '14 Mar 2026');
eq('display error', display(X.ERR.NA), '#N/A');
eq('display bool', display(true), 'TRUE');
eq('round half away', X.round(-0.125, 2), -0.13);
eq('round 15 digits', X.round(1.005, 2), 1.01);
eq('criterion >=', X.criterion('>=10')(10), true);
eq('criterion text <>', X.criterion('<>North')(7), true);
eq('criterion ~*', X.criterion('~*')('*'), true);
eq('criterion ~* no wildcard', X.criterion('~*')('a'), false);

// ---------------------------------------------------------------- 3d. grading a typed formula
{
  const spec = { cells: { A1: 'Qty', B1: 'Price', C1: 'Revenue', A2: 2, B2: 14, A3: 3, B3: 4.2, A4: 1, B4: 15, E1: 'Tax rate', E2: 0.08 } };
  const g = (formula, opts = {}) => X.gradeFormula(spec, { cell: 'C2', answer: '=A2*B2', formula, ...opts });
  ok('right formula', g('=A2*B2').ok);
  ok('equivalent formula', g('=PRODUCT(A2,B2)').ok);
  ok('equivalent formula (order)', g('= B2 * A2').ok);
  ok('hard-coded answer fails', !g('=28').ok);
  ok('hard-coded message', /calculate the result from the cells/.test(g('=28').message));
  ok('wrong cell fails', !g('=A2*B3').ok);
  ok('needs =', !g('A2*B2').ok && /equals sign/.test(g('A2*B2').message));
  ok('unreadable', !g('=A2*(B2').ok && /couldn’t read/.test(g('=A2*(B2').message));
  ok('unknown function', /isn’t a function/.test(g('=MULTIPLY(A2,B2)').message));
  const f = (formula) => X.gradeFormula(spec, { cell: 'C2', fill: 'C2:C4', answer: '=A2*B2*(1+$E$2)', formula });
  ok('fill: right with $', f('=A2*B2*(1+$E$2)').ok);
  ok('fill: wrong without $', !f('=A2*B2*(1+E2)').ok);
  ok('fill: wrong message names a cell', /^C3 shows/.test(f('=A2*B2*(1+E2)').message));
  ok('fill: mixed $E2 works when filling down', f('=A2*B2*(1+$E$2)').ok && f('=A2*B2*(1+E$2)').ok);
  ok('require a function', !X.gradeFormula(spec, { cell: 'C2', answer: '=SUM(A2:A4)', formula: '=A2+A3+A4', require: ['SUM'] }).ok);
  ok('require met', X.gradeFormula(spec, { cell: 'C2', answer: '=SUM(A2:A4)', formula: '=SUM(A2:A4)', require: ['SUM'] }).ok);
  ok('fixed cells stay', X.gradeFormula({ ...spec, fixed: ['E2'] }, { cell: 'C2', answer: '=E2', formula: '=0.08' }).ok);
  // a spilled answer is marked in every cell it fills
  const fr = { cells: { A1: 12, A2: 25, A3: 37, A4: 51, A5: 8, C1: 20, C2: 40, C3: 60 } };
  ok('spill: right', X.gradeFormula(fr, { cell: 'E1', answer: '=FREQUENCY(A1:A5,C1:C3)', formula: '=FREQUENCY(A1:A5,C1:C3)' }).ok);
  const fw = X.gradeFormula(fr, { cell: 'E1', answer: '=FREQUENCY(A1:A5,C1:C3)', formula: '=FREQUENCY(A1:A5,C1:C2)' });
  ok('spill: a shorter bin range fails', !fw.ok && /fills 3 rows by 1 column; it should fill 4 rows/.test(fw.message));
  // dates move by whole months on the test copies, so a month window stays a month window
  const ds = { cells: { A1: 46083, A2: 46100, A3: 46130, B1: 5, B2: 7, B3: 9, D1: 46082 } };   // 2 Mar, 19 Mar, 18 Apr 2026; D1 = 1 Mar
  ok('date window by reference', X.gradeFormula(ds, { cell: 'E1', answer: '=SUMIFS(B1:B3,A1:A3,">="&D1,A1:A3,"<"&EDATE(D1,1))', formula: '=SUMIFS(B1:B3,A1:A3,">="&D1,A1:A3,"<="&EOMONTH(D1,0))' }).ok);
  ok('typed-in date fails', !X.gradeFormula(ds, { cell: 'E1', answer: '=SUMIFS(B1:B3,A1:A3,">="&D1,A1:A3,"<"&EDATE(D1,1))', formula: '=SUMIFS(B1:B3,A1:A3,">="&DATE(2026,3,1),A1:A3,"<"&DATE(2026,4,1))' }).ok);
}

// ---------------------------------------------------------------- 3e. pivot tables agree with SUMIFS / COUNTIFS
{
  const rows = [];
  for (let r = 2; r <= 13; r++) rows.push({ Channel: base[`B${r}`], Product: base[`C${r}`], Qty: base[`D${r}`], Revenue: base[`F${r}`] });
  const pv = X.pivot(rows, { rows: 'Channel', cols: 'Product', value: 'Revenue', agg: 'sum' });
  for (const ch of pv.rowKeys) for (const pr of pv.colKeys) {
    const want = E(`=SUMIFS(F2:F13,B2:B13,"${ch}",C2:C13,"${pr}")`);
    const got = pv.cells.get(`${ch}|${pr}`) ?? 0;
    eq(`pivot ${ch} × ${pr}`, got, want);
  }
  eq('pivot grand total', pv.grand, E('=SUM(F2:F13)'));
  eq('pivot row total', pv.rowTotals.get('Online'), E('=SUMIF(B2:B13,"Online",F2:F13)'));
  const cnt = X.pivot(rows, { rows: 'Channel', value: 'Revenue', agg: 'count' });
  eq('pivot count', cnt.cells.get('Café|Total'), 4);
  const avg = X.pivot(rows, { rows: 'Channel', value: 'Revenue', agg: 'average' });
  eq('pivot average', avg.cells.get('Wholesale|Total'), E('=AVERAGEIF(B2:B13,"Wholesale",F2:F13)'));
  const pct = X.pivot(rows, { rows: 'Channel', value: 'Revenue', agg: 'sum', show: 'pct-total' });
  eq('pivot % of total', pct.cells.get('Online|Total'), E('=SUMIF(B2:B13,"Online",F2:F13)/SUM(F2:F13)'));
  const pr = X.pivot(rows, { rows: 'Channel', cols: 'Product', value: 'Revenue', show: 'pct-row' });
  eq('pivot % of row', pr.cells.get('Online|House Blend'), (28 + 42) / E('=SUMIF(B2:B13,"Online",F2:F13)'));
  eq('pivot max', X.pivot(rows, { rows: 'Product', value: 'Qty', agg: 'max' }).cells.get('House Blend|Total'), 20);
  eq('pivot filter', X.pivot(rows, { rows: 'Product', value: 'Revenue', filter: (r) => r.Channel === 'Online' }).grand, E('=SUMIF(B2:B13,"Online",F2:F13)'));
}

// ---------------------------------------------------------------- 3f. what-if tools
{
  // break-even: profit = units × (price − variable cost) − fixed costs
  const sh = new Sheet({ cells: { B1: 14, B2: 8.5, B3: 1200, B4: 100, B5: '=B4*(B1-B2)-B3' } });
  const gs = X.goalSeek(sh, { target: 'B5', goal: 0, changing: 'B4' });
  ok('goal seek converges', gs.ok);
  eq('goal seek break-even units', gs.value, 1200 / 5.5, 1e-7);
  const gp = X.goalSeek(sh, { target: 'B5', goal: 500, changing: 'B1' });
  eq('goal seek price', gp.value, 8.5 + 1700 / 100, 1e-7);
  const loan = new Sheet({ cells: { B1: 0.05, B2: 60, B3: 20000, B4: '=-PMT(B1/12,B2,B3)' } });
  const gl = X.goalSeek(loan, { target: 'B4', goal: 400, changing: 'B3' });
  eq('goal seek loan size', gl.value, 400 / loan.get('B4') * 20000, 1e-7);
  ok('goal seek leaves the sheet alone', sh.get('B4') === 100);
  const dt = X.dataTable(sh, { target: 'B5', rowInput: 'B1', rowValues: [12, 14, 16] });
  ok('one-variable data table', JSON.stringify(dt) === JSON.stringify([-850, -650, -450]));
  const dt2 = X.dataTable(sh, { target: 'B5', rowInput: 'B1', rowValues: [12, 14], colInput: 'B4', colValues: [100, 200] });
  ok('two-variable data table', JSON.stringify(dt2) === JSON.stringify([[-850, -500], [-650, -100]]));
}
{
  // Wyndor Glass (Hillier & Lieberman): max 3x + 5y, x ≤ 4, 2y ≤ 12, 3x + 2y ≤ 18 → x = 2, y = 6, Z = 36
  const w = X.solveLP({ objective: [3, 5], constraints: [{ coef: [1, 0], op: '<=', rhs: 4 }, { coef: [0, 2], op: '<=', rhs: 12 }, { coef: [3, 2], op: '<=', rhs: 18 }] });
  ok('LP max', w.ok && Math.abs(w.objective - 36) < 1e-9 && Math.abs(w.x[0] - 2) < 1e-9 && Math.abs(w.x[1] - 6) < 1e-9);
  const m = X.solveLP({ objective: [2, 3], sense: 'min', constraints: [{ coef: [1, 1], op: '>=', rhs: 4 }, { coef: [1, 3], op: '>=', rhs: 6 }] });
  ok('LP min with ≥', m.ok && Math.abs(m.objective - 9) < 1e-9);
  const i = X.solveLP({ objective: [5, 4], constraints: [{ coef: [6, 4], op: '<=', rhs: 24 }, { coef: [1, 2], op: '<=', rhs: 6 }], integer: [0, 1] });
  ok('integer LP (relaxation 21 at (3, 1.5); integer optimum 20 at (4, 0))', i.ok && i.objective === 20 && i.x[0] === 4 && i.x[1] === 0);
  ok('LP equality', (() => { const r = X.solveLP({ objective: [1, 1], constraints: [{ coef: [1, 1], op: '=', rhs: 5 }, { coef: [1, -1], op: '=', rhs: 1 }] }); return r.ok && Math.abs(r.x[0] - 3) < 1e-9; })());
  ok('LP infeasible', X.solveLP({ objective: [1], constraints: [{ coef: [1], op: '<=', rhs: 1 }, { coef: [1], op: '>=', rhs: 2 }] }).status === 'infeasible');
  ok('LP unbounded', X.solveLP({ objective: [1], constraints: [{ coef: [1], op: '>=', rhs: 1 }] }).status === 'unbounded');
  const sh = new Sheet({ cells: { B1: 0, B2: 0, B4: '=3*B1+5*B2', C1: '=B1', C2: '=2*B2', C3: '=SUMPRODUCT({3,2},TRANSPOSE(B1:B2))', D3: 18 } });
  const r = X.solveSheet(sh, { objective: 'B4', changing: ['B1:B2'], constraints: [{ cell: 'C1', op: '<=', rhs: 4 }, { cell: 'C2', op: '<=', rhs: 12 }, { cell: 'C3', op: '<=', rhs: 'D3' }] });
  ok('Solver on a sheet', r.ok && r.values.B1 === 2 && r.values.B2 === 6 && r.objective === 36);
  ok('Solver leaves the sheet alone', sh.get('B1') === 0);
  ok('Solver nonlinear', X.solveSheet(new Sheet({ cells: { B1: 1, B4: '=B1*B1' } }), { objective: 'B4', changing: ['B1'], constraints: [{ cell: 'B1', op: '<=', rhs: 3 }] }).status === 'nonlinear');
  const v = X.solveSheet(new Sheet({ cells: { B1: 0, B2: '=4*B1+10' } }), { objective: 'B2', sense: 'value', target: 30, changing: ['B1'] });
  ok('Solver value of', v.ok && v.values.B1 === 5);
}

console.log(`${checks - fails}/${checks} sheet checks passed`);
if (fails) process.exit(1);
