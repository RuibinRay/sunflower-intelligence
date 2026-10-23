// tables-and-cleaning.ex.js — B03 · Excel tables and cleaning data: widgets, practice and the knowledge check (answer
// keys live here). Lantern's orders and raw export come from case.js; other businesses and records are fictional.
// Every num item's `check` recomputes its answer; every formula item is marked by its results on changed copies too.
import { ORDERS, ORDER_COLUMNS, RAW, RAW_COLUMNS, ordersCells } from './case.js?v=11';

const MONEY = '$#,##0.00';
const oc = (name) => ORDER_COLUMNS.indexOf(name);
const rc = (name) => RAW_COLUMNS.indexOf(name);
const sum = (a) => a.reduce((s, x) => s + x, 0);
const merge = (...parts) => Object.assign({}, ...parts.map((p) => p.cells || p));
/** Raw rows exactly as typed (text), in the columns named, from row 1. */
function rawCells(cols, rows, at = 0) {
  const L = 'ABCDEFGHIJKLMNOP';
  const cells = {};
  cols.forEach((c, j) => { cells[`${L[j + at]}1`] = c; });
  rows.forEach((r, i) => cols.forEach((c, j) => { if (r[rc(c)] !== '') cells[`${L[j + at]}${i + 2}`] = r[rc(c)]; }));
  return cells;
}

// ---------------------------------------------------------------- widgets
const tbl = ordersCells({ cols: ['order_id', 'quantity', 'unit_price', 'discount', 'order_total', 'channel', 'subscription'], n: 12 });
const tableDemo = merge(tbl, {
  H1: 'line_total', I2: 'Total order value', J2: '=SUM(Orders[order_total])', I3: 'Total row (SUBTOTAL 109)', J3: '=SUBTOTAL(109,Orders[order_total])',
  I4: 'App order value', J4: '=SUMIFS(Orders[order_total],Orders[channel],"app")',
});

const RAW16 = RAW.slice(0, 16);
const cleanDemo = rawCells(['order_id', 'order_date', 'quantity', 'unit_price', 'discount', 'order_total', 'channel'], RAW16);
Object.assign(cleanDemo, { H1: 'date', I1: 'quantity', J1: 'unit_price', K1: 'discount', L1: 'order_total', M1: 'total check', N1: 'repeated id' });
for (let r = 2; r <= RAW16.length + 1; r++) {
  Object.assign(cleanDemo, {
    [`H${r}`]: `=IF(MID(B${r},3,1)="/",DATE(RIGHT(B${r},4),MID(B${r},4,2),LEFT(B${r},2)),DATEVALUE(B${r}))`,
    [`I${r}`]: `=VALUE(C${r})`, [`J${r}`]: `=VALUE(D${r})`, [`K${r}`]: `=VALUE(E${r})`, [`L${r}`]: `=VALUE(F${r})`,
    [`M${r}`]: `=ROUND(L${r}-(I${r}*J${r}-K${r}),2)`, [`N${r}`]: `=COUNTIF($A$2:$A$17,A${r})>1`,
  });
}

const arr = ordersCells({ cols: ['order_id', 'customer_id', 'region', 'channel', 'order_total'], n: 20 });
const arraysDemo = merge(arr, {
  G1: 'regions', G2: '=SORT(UNIQUE(Orders[region]))', I1: 'channels', I2: '=UNIQUE(Orders[channel])',
  K1: 'customers', K2: '=UNIQUE(Orders[customer_id])', K4: 'note: move me',
  L1: 'orders over', M1: 50, M2: '=FILTER(Orders[order_id],Orders[order_total]>M1,"none")',
});

export const widgets = {
  'tc-table': {
    type: 'sheet',
    title: 'The table Orders (A1:H13), with formulas beside it',
    sheet: { cells: tableDemo, tables: { Orders: 'A1:H13' } },
    view: 'A1:J13',
    formats: { C: MONEY, D: MONEY, E: MONEY, H: MONEY, J: MONEY },
    widths: { I: 24, J: 12 },
    tools: ['formulas', 'fill', 'reset'],
    note: 'Column H is part of the table but empty: type a formula in H2 and fill it down. This worksheet has no filter, so the SUBTOTAL in J3 equals the SUM in J2; in Excel, filtering the table would change J3 and not J2.',
  },
  'tc-clean': {
    type: 'sheet',
    title: 'The first 16 rows of the raw export (A:G, text as typed) and the cleaning formulas (H:N)',
    sheet: { cells: cleanDemo },
    view: 'A1:N17',
    formats: { H: 'date', J: MONEY, K: MONEY, L: MONEY, M: MONEY },
    widths: { B: 14, H: 12 },
    tools: ['formulas', 'reset'],
    maxHeight: '26rem',
    note: 'Columns A to G hold the raw text exactly as exported, so prices keep their dollar signs and dates their three formats. H builds day-first slash dates from their parts and uses DATEVALUE for the rest; M is the order-total check (0 when the row adds up); N is TRUE for an id that occurs more than once.',
  },
  'tc-arrays': {
    type: 'sheet',
    title: 'Dynamic arrays on twenty orders (the table Orders is A1:E21)',
    sheet: { cells: arraysDemo, tables: { Orders: 'A1:E21' } },
    allowErrors: ['K2'],
    view: 'A1:M21',
    formats: { E: MONEY, M1: MONEY },
    widths: { G: 10, K: 11, L: 11, M: 11 },
    tools: ['formulas', 'reset'],
    maxHeight: '26rem',
    note: 'G2, I2, K2 and M2 each hold one formula; the cells below them are filled by the spill. K2 shows #SPILL! until the note in K4 is deleted.',
  },
};

// ---------------------------------------------------------------- guided practice
const g1 = merge(ordersCells({ cols: ['order_id', 'quantity', 'unit_price', 'discount', 'channel'], n: 12 }), { F1: 'line_total' });
const g2Raw = RAW.slice(0, 10).map((r) => r[rc('unit_price')]);
const g2 = { A1: 'unit_price (raw text)', B1: 'unit_price' };
g2Raw.forEach((v, i) => { g2[`A${i + 2}`] = v; });
const g3Dates = ['05/03/2026', '14/03/2026', '02/04/2026', '11/05/2026', '30/05/2026', '08/06/2026'];
const g3 = { A1: 'order_date (web, text)', B1: 'order_date' };
g3Dates.forEach((v, i) => { g3[`A${i + 2}`] = v; });

export const guided = [
  {
    id: 'b03-tc-g1', type: 'formula', kind: 'applied',
    prompt: 'A1:F13 is the table <code>Orders</code>, and its last column, <code>line_total</code>, is empty. In F2, write a calculated column with structured references that gives quantity × unit_price − discount for the same row, and fill it down to F13 (Excel would fill it for you).',
    sheet: { cells: g1, tables: { Orders: 'A1:F13' } }, cell: 'F2', fill: 'F2:F13', answer: '=[@quantity]*[@unit_price]-[@discount]',
    view: 'A1:F13', formats: { C: MONEY, D: MONEY, F: MONEY },
    alt: ['=Orders[@quantity]*Orders[@unit_price]-Orders[@discount]', '=B2*C2-D2', '=[@[quantity]]*[@[unit_price]]-[@[discount]]'],
    wrong: [
      { formula: '=[@quantity]*[@unit_price]', say: 'That is the value before the discount. Subtract <code>[@discount]</code>.' },
      { formula: '=Orders[quantity]*Orders[unit_price]-Orders[discount]', say: 'Without @ each reference means the whole column, so the formula returns twelve values at once; Excel would show #SPILL!, because spilled formulas aren’t allowed inside a table. Use <code>[@quantity]</code> for this row’s value.' },
    ],
    hints: ['Inside the table, <code>[@quantity]</code> means “the quantity in this row”.', '<x>=[@quantity]*[@unit_price]-[@discount]</x>'],
    solution: '<x>=[@quantity]*[@unit_price]-[@discount]</x> in F2. In Excel the table fills it down automatically and gives it to any row added later; here, fill it to F13. F2 shows $111.00 (2 × $58.00 − $5.00), which equals the order’s recorded total.',
  },
  {
    id: 'b03-tc-g2', type: 'formula', kind: 'applied',
    prompt: 'Column A holds unit prices exactly as the raw export typed them: text, some with a dollar sign. In B2, convert A2 to a number, and fill it down to B11.',
    sheet: { cells: g2 }, cell: 'B2', fill: 'B2:B11', answer: '=VALUE(A2)',
    view: 'A1:B11', formats: { B: MONEY }, widths: { A: 20, B: 12 },
    alt: ['=A2*1', '=--A2', '=A2+0', '=VALUE(SUBSTITUTE(A2,"$",""))', '=VALUE(TRIM(A2))'],
    wrong: [
      { formula: '=SUBSTITUTE(A2,"$","")', say: 'That removes the dollar sign but leaves text: “58.00” is still a string, and SUM would skip it. Wrap it in VALUE, or use VALUE alone, which understands the $.' },
      { formula: '=TRIM(A2)', say: 'TRIM removes spaces; the result is still text. VALUE converts text to a number.' },
      { formula: '=SUM(A2)', say: 'SUM skips text in a cell reference, so every row shows 0. That is the problem you are fixing; use VALUE.' },
    ],
    hints: ['Which function turns text that looks like a number into a number?', '<x>=VALUE(A2)</x>: VALUE reads “$58.00” as 58.'],
    solution: '<x>=VALUE(A2)</x>, filled to B11. VALUE converts text in any number format Excel recognises, including “$58.00”, to a number: B2 shows $58.00 as a real number that SUM can add. Arithmetic such as <x>=A2*1</x> converts the same way. Check with <x>=COUNT(B2:B11)</x>, which should be 10.',
  },
  {
    id: 'b03-tc-g3', type: 'formula', kind: 'applied',
    prompt: 'Column A holds web-shop order dates as text. B02 established that the web shop writes the day first (05/03/2026 is 5 March 2026). In B2, build the true date from the text’s parts, and fill it down to B7.',
    sheet: { cells: g3 }, cell: 'B2', fill: 'B2:B7', answer: '=DATE(RIGHT(A2,4),MID(A2,4,2),LEFT(A2,2))',
    view: 'A1:B7', formats: { B: 'date' }, widths: { A: 22, B: 14 },
    alt: ['=DATE(MID(A2,7,4),MID(A2,4,2),LEFT(A2,2))', '=DATE(VALUE(RIGHT(A2,4)),VALUE(MID(A2,4,2)),VALUE(LEFT(A2,2)))'],
    wrong: [
      { formula: '=DATEVALUE(A2)', say: 'DATEVALUE reads the text with the computer’s date settings. With US settings it takes the month first: 05/03/2026 becomes 3 May, and 14/03/2026 gives #VALUE! because there is no month 14. Build the date from its parts.' },
      { formula: '=DATE(RIGHT(A2,4),LEFT(A2,2),MID(A2,4,2))', say: 'That puts the first two characters in the month: you have read the date month first. DATE takes year, month, day; the month is MID(A2,4,2).' },
    ],
    hints: ['DATE(year, month, day). The year is the last four characters, the month the two in the middle, the day the first two.', '<x>=DATE(RIGHT(A2,4),MID(A2,4,2),LEFT(A2,2))</x>'],
    solution: '<x>=DATE(RIGHT(A2,4),MID(A2,4,2),LEFT(A2,2))</x>, filled to B7. RIGHT takes “2026”, MID the month “03”, LEFT the day “05”, and DATE turns the text digits into a date: 5 Mar 2026. Because the order of day and month is written into the formula, it gives the same answer on any computer, unlike DATEVALUE.',
  },
  {
    id: 'b03-tc-g4', type: 'order', kind: 'conceptual',
    prompt: 'Put Ana’s monthly cleaning routine in order.',
    items: [
      'Paste the new export into the raw sheet, which nobody edits',
      'Let the cleaning formulas recalculate and read the check and flag columns',
      'Decide each flagged case (a duplicate, a wrong total, an ambiguous date) and record the decision in the cleaning log',
      'Paste the clean values into the Orders table',
      'Refresh the PivotTables and charts that read the table',
    ],
    hints: ['The raw data come first and are never edited.', 'Decisions are made, and logged, before anything reaches the table that reports read.'],
    solution: 'Paste the raw export; let the formulas recalculate and read the flags; decide and log each flagged case; paste the clean values into the table; refresh what reads the table. Logging comes before loading, so nothing reaches a report without a recorded decision.',
  },
];

// ---------------------------------------------------------------- on your own
const i1Names = ['  north', 'WEST ', 'Central', 'east  ', ' south', 'North'];
const i1 = { A1: 'region (raw)', B1: 'region' };
i1Names.forEach((v, i) => { i1[`A${i + 2}`] = v; });

const i2 = merge(ordersCells({ cols: ['order_id', 'region', 'channel', 'subscription', 'discount', 'order_total'], n: 20 }), { H1: 'subscriber discounts' });
const i3o = ordersCells({ cols: ['order_id', 'customer_id', 'order_total'], n: 60 });
const i3 = merge(i3o, { E1: 'customers with an order over $30' });
const NINE = ORDERS.slice(8, 16);
const webNine = sum(NINE.filter((r) => r[oc('channel')] === 'web').map((r) => r[oc('order_total')]));

export const independent = [
  {
    id: 'b03-tc-i1', type: 'formula', kind: 'applied',
    prompt: 'Column A holds region names typed by hand, with stray spaces and mixed capitals. In B2, return the name with the spaces removed and a capital first letter (North, West…), and fill it down to B7.',
    sheet: { cells: i1 }, cell: 'B2', fill: 'B2:B7', answer: '=PROPER(TRIM(A2))',
    view: 'A1:B7', widths: { A: 14, B: 12 },
    alt: ['=TRIM(PROPER(A2))'],
    wrong: [
      { formula: '=TRIM(A2)', say: 'The spaces are gone but “north” and “WEST” keep their capitals. Add PROPER.' },
      { formula: '=PROPER(A2)', say: 'The capitals are right but the spaces remain, so “ South” still won’t match “South”. Add TRIM.' },
      { formula: '=UPPER(TRIM(A2))', say: 'UPPER gives NORTH, WEST… The names Lantern uses have a capital first letter only: PROPER.' },
    ],
    solution: '<x>=PROPER(TRIM(A2))</x>, filled to B7: TRIM removes the leading, trailing and doubled spaces, and PROPER capitalises the first letter and lowers the rest. B2 shows North and B3 West.',
  },
  {
    id: 'b03-tc-i2', type: 'formula', kind: 'applied',
    prompt: 'A1:F21 is the table <code>Orders</code> (the first 20 spring orders). In H2, use structured references to total the discounts given on subscription orders.',
    sheet: { cells: i2, tables: { Orders: 'A1:F21' } }, cell: 'H2', answer: '=SUMIFS(Orders[discount],Orders[subscription],"yes")',
    view: 'A1:H21', formats: { E: MONEY, F: MONEY, H: MONEY }, widths: { H: 20 }, maxHeight: '24rem',
    alt: ['=SUMIF(Orders[subscription],"yes",Orders[discount])', '=SUMIFS(E2:E21,D2:D21,"yes")', '=SUM(FILTER(Orders[discount],Orders[subscription]="yes"))'],
    wrong: [
      { formula: '=SUM(Orders[discount])', say: 'That totals every discount, including the $5 promotion codes on one-off orders. Add the condition subscription = "yes" with SUMIFS.' },
      { formula: '=SUMIFS(Orders[order_total],Orders[subscription],"yes")', say: 'That is the subscription orders’ value. The question asks for their discounts: sum Orders[discount].' },
      { formula: '=SUMIFS(Orders[discount],Orders[subscription],"no")', say: '"no" picks the one-off orders. Subscription orders are "yes".' },
    ],
    solution: '<x>=SUMIFS(Orders[discount],Orders[subscription],"yes")</x> gives $15.25: the 10% discounts on the subscription orders among the first 20. All discounts together come to $30.25, the rest being $5 promotion codes.',
  },
  {
    id: 'b03-tc-i3', type: 'formula', kind: 'applied',
    prompt: 'A1:C61 is the table <code>Orders</code> (the first 60 spring orders). In E2, count how many <i>different customers</i> placed at least one order over $30. (This needs Excel for Microsoft 365, 2021 or 2024.)',
    sheet: { cells: i3, tables: { Orders: 'A1:C61' } }, cell: 'E2', answer: '=ROWS(UNIQUE(FILTER(Orders[customer_id],Orders[order_total]>30)))',
    view: 'A1:E61', formats: { C: MONEY }, widths: { E: 30 }, maxHeight: '24rem',
    alt: ['=COUNTA(UNIQUE(FILTER(Orders[customer_id],Orders[order_total]>30)))'],
    wrong: [
      { formula: '=COUNTIFS(Orders[order_total],">30")', say: 'That counts orders over $30, and one customer can place several. Take the customers of those orders with FILTER, remove repeats with UNIQUE, then count with ROWS.' },
      { formula: '=ROWS(UNIQUE(Orders[customer_id]))', say: 'That counts every customer in the list. FILTER them first to the orders over $30.' },
      { formula: '=ROWS(FILTER(Orders[customer_id],Orders[order_total]>30))', say: 'FILTER keeps one row per order, so a customer with two big orders is counted twice. Wrap it in UNIQUE.' },
    ],
    solution: '<x>=ROWS(UNIQUE(FILTER(Orders[customer_id],Orders[order_total]>30)))</x> returns 23. FILTER keeps the customer ids of the 24 orders over $30, UNIQUE removes the one repeat, and ROWS counts what is left.',
  },
  {
    id: 'b03-tc-i4', type: 'classify', kind: 'conceptual',
    prompt: 'What does each action do to the data already in the sheet?',
    items: ['Data › Remove Duplicates', 'Sorting the table by order_total', 'Filtering the table to the app channel', 'Find and Replace with Replace All', 'A VALUE formula in a new column', 'A Power Query step that changes a column’s type', 'Adding a data validation rule to the channel column', 'Text to Columns on the customer name'],
    categories: ['Changes or deletes values in the sheet', 'Moves or hides rows, values unchanged', 'Leaves the existing data as they are'],
    answer: [0, 1, 1, 0, 2, 2, 2, 0],
    feedback: {
      0: 'Remove Duplicates deletes rows permanently (Undo apart).',
      2: 'A filter hides rows; nothing is deleted, and the rows return when the filter is cleared.',
      3: 'Replace All edits the cells in place.',
      5: 'Power Query transforms a copy as it loads; the source stays unchanged.',
      6: 'Validation guards new typing; it doesn’t change or even flag what is already there (Circle Invalid Data does that).',
      7: 'Text to Columns overwrites the column and the columns to its right.',
    },
    solution: 'Remove Duplicates, Replace All and Text to Columns change the sheet’s values; sorting moves rows and filtering hides them without changing values; a formula column, a Power Query step and a validation rule leave the existing data as they are.',
  },
  {
    id: 'b03-tc-i5', type: 'num', kind: 'numerical',
    prompt: 'A table holds orders LC-10009 to LC-10016: $15.30 (web), $14.85 (app), $17.00 (app), $17.00 (web), $16.20 (app), $17.55 (app), $34.00 (app) and $14.85 (app). Ana filters the channel column to web. What does the table’s total row, <x>=SUBTOTAL(109,[order_total])</x>, show?',
    answer: 32.3, check: () => webNine, unit: '$', places: 2, tol: 0.005,
    wrong: [
      { value: 146.75, say: 'That is the total of all eight orders, what SUM would show. SUBTOTAL leaves out rows hidden by the filter.' },
      { value: 114.45, say: 'That is the app orders’ total: the rows the filter hides.' },
    ],
    solution: 'SUBTOTAL ignores rows hidden by a filter, so the total row adds only the visible web orders: $15.30 + $17.00 = $32.30. A SUM of the column would still show $146.75.',
  },
  {
    id: 'b03-tc-i6', type: 'mc', kind: 'applied',
    prompt: 'Ana types <x>=UNIQUE(Orders[region])</x> into the first cell of a new column inside the <code>Orders</code> table, hoping for a list of regions. The cell shows #SPILL!. Why?',
    options: [
      'Spilled array formulas aren’t supported inside an Excel table; put the formula in a cell outside the table',
      'UNIQUE needs the regions sorted first, so it should be SORT(UNIQUE(…)) instead',
      'Structured references can’t be used inside a dynamic array function',
      'The region column contains text, and UNIQUE works only on numbers',
    ],
    answer: 0,
    feedback: {
      1: 'UNIQUE works on unsorted data; SORT only changes the order of the result.',
      2: 'They can: Microsoft’s own examples point FILTER and UNIQUE at table columns, so the results grow with the table.',
      3: 'UNIQUE works on text, numbers and dates alike.',
    },
    solution: 'Microsoft lists “spilled array formulas aren’t supported in Excel tables” among the causes of #SPILL!. Typed beside the table, <x>=UNIQUE(Orders[region])</x> spills the five regions and keeps up as the table grows.',
  },
];

// ---------------------------------------------------------------- knowledge check
const kRaw = RAW.slice(9, 16);
const k1 = { A1: 'order_id', B1: 'quantity', C1: 'unit_price', D1: 'discount', E1: 'order_total', F1: 'gap' };
kRaw.forEach((r, i) => { const n = i + 2; Object.assign(k1, { [`A${n}`]: r[0], [`B${n}`]: Number(r[rc('quantity')]), [`C${n}`]: r[rc('unit_price')], [`D${n}`]: Number(r[rc('discount')]), [`E${n}`]: r[rc('order_total')] }); });
const k4 = ordersCells({ cols: ['order_id', 'region', 'channel', 'order_total'], n: 20 });
const k4cells = merge(k4, { F1: 'West app value' });
// a fictional July list for Remove Duplicates
const JULY = [['LC-20101', '1 Jul', 22], ['LC-20102', '1 Jul', 14], ['LC-20101', '1 Jul', 22], ['LC-20103', '2 Jul', 46], ['LC-20102', '2 Jul', 12.6], ['LC-20104', '2 Jul', 17], ['LC-20103', '2 Jul', 46], ['LC-20103', '2 Jul', 46], ['LC-20105', '3 Jul', 58]];
const distinctRows = new Set(JULY.map((r) => r.join('|'))).size;
const distinctIds = new Set(JULY.map((r) => r[0])).size;

export const check = [
  {
    id: 'b03-tc-k1', type: 'formula', kind: 'applied',
    prompt: 'A1:F8 is the table <code>Raw</code>, seven orders from the raw export. Quantity and discount arrived as numbers; unit_price and order_total arrived as text. In F2, write a calculated column that gives order_total minus (quantity × unit_price − discount), so that 0 means the row adds up, and fill it down to F8.',
    sheet: { cells: k1, tables: { Raw: 'A1:F8' } }, cell: 'F2', fill: 'F2:F8', answer: '=VALUE([@order_total])-([@quantity]*VALUE([@unit_price])-[@discount])',
    view: 'A1:F8', formats: { D: MONEY, F: MONEY }, widths: { C: 11, E: 12 },
    alt: ['=[@order_total]-([@quantity]*[@unit_price]-[@discount])', '=VALUE(E2)-(B2*VALUE(C2)-D2)', '=ROUND(VALUE([@order_total])-([@quantity]*VALUE([@unit_price])-[@discount]),2)'],
    wrong: [
      { formula: '=VALUE([@order_total])-[@quantity]*VALUE([@unit_price])-[@discount]', say: 'Without the brackets the discount is subtracted instead of added back: you get total − quantity × price − discount. Put quantity × price − discount in brackets.' },
      { formula: '=[@quantity]*VALUE([@unit_price])-[@discount]', say: 'That is the expected total. The check is the gap between the recorded total and it.' },
      { formula: '=SUM([@order_total])-([@quantity]*VALUE([@unit_price])-[@discount])', say: 'SUM skips text, so SUM of “$15.30” is 0. Convert it with VALUE.' },
    ],
    solution: '<x>=VALUE([@order_total])-([@quantity]*VALUE([@unit_price])-[@discount])</x>, filled to F8. Every row is $0.00 except LC-10016, where $21.35 − (1 × $16.50 − $1.65) = $6.50: the total disagrees with its parts. (Arithmetic converts text that looks like a number by itself, so the version without VALUE works too; VALUE makes the conversion visible.)',
  },
  {
    id: 'b03-tc-k2', type: 'mc', kind: 'conceptual',
    prompt: 'An export holds two rows for order LC-10102: the original at $14.00 and, below it, a corrected version at $12.60. Ana selects the data and runs Remove Duplicates with only the order_id column ticked. What happens?',
    options: [
      'The second row, the correction at $12.60, is deleted, because Remove Duplicates keeps the first occurrence',
      'The first row is deleted, because Remove Duplicates keeps the most recent version of each order',
      'Nothing is deleted, because the two rows differ in order_total',
      'Both rows are moved to a separate sheet for Ana to review',
    ],
    answer: 0,
    feedback: {
      1: 'Remove Duplicates knows nothing about recency: it keeps the first occurrence in the list and deletes the others.',
      2: 'Only the ticked columns are compared. With order_id alone, the two rows count as duplicates, and the whole second row goes.',
      3: 'It deletes rows permanently (Undo apart); it doesn’t set them aside. That is why to work on a copy.',
    },
    solution: 'Remove Duplicates compares only the ticked columns, keeps the first occurrence and deletes the rest of each matching row. Here it keeps the outdated $14.00 row and deletes the correction. Decide which version survives first (B02’s survivorship rule), or tick every column to remove only exact duplicates.',
  },
  {
    id: 'b03-tc-k3', type: 'multi', kind: 'conceptual',
    prompt: 'Ana adds a data validation List (app, web) to the channel column of her manual-order sheet. Select all the statements that are true.',
    options: [
      'With the Stop alert, typing “website” in a validated cell is refused.',
      'A value pasted into a validated cell from another sheet can get past the rule.',
      'Cells that already held “Web ” before the rule was added are not flagged until she uses Circle Invalid Data.',
      'The Warning alert lets a user keep an invalid entry after a warning.',
      'The rule also corrects the existing values to app or web.',
      'The rule applies only to rows added after it was created, never to cells already in the range.',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'Validation never changes values; it only restricts what can be typed.',
      5: 'The rule applies to every cell in the range: an existing cell that is edited is checked like any other. It just doesn’t flag old values by itself.',
    },
    solution: 'Stop refuses an invalid typed entry and Warning lets the user keep it after a warning. Pasted or filled values can bypass validation, and existing invalid values stay unflagged until Circle Invalid Data marks them. Validation never corrects values.',
  },
  {
    id: 'b03-tc-k4', type: 'formula', kind: 'applied',
    prompt: 'A1:D21 is the table <code>Orders</code> (the first 20 spring orders). In F2, use FILTER to return the total value of orders that are both from the West region and placed in the app.',
    sheet: { cells: k4cells, tables: { Orders: 'A1:D21' } }, cell: 'F2', answer: '=SUM(FILTER(Orders[order_total],(Orders[region]="West")*(Orders[channel]="app")))',
    view: 'A1:F21', formats: { D: MONEY, F: MONEY }, widths: { F: 16 }, maxHeight: '24rem',
    alt: ['=SUMIFS(Orders[order_total],Orders[region],"West",Orders[channel],"app")', '=SUM(FILTER(Orders[order_total],(Orders[channel]="app")*(Orders[region]="West")))'],
    wrong: [
      { formula: '=SUM(FILTER(Orders[order_total],(Orders[region]="West")+(Orders[channel]="app")))', say: 'Adding the conditions means OR: West orders from any channel plus app orders from any region. Multiply them for AND.' },
      { formula: '=SUM(FILTER(Orders[order_total],Orders[region]="West"))', say: 'That is every West order. Add the second condition, channel = "app", multiplied in.' },
    ],
    solution: '<x>=SUM(FILTER(Orders[order_total],(Orders[region]="West")*(Orders[channel]="app")))</x> gives $104.65. Each condition gives a column of TRUE and FALSE; multiplying them gives 1 only where both hold. <x>=SUMIFS(Orders[order_total],Orders[region],"West",Orders[channel],"app")</x> gives the same in any version.',
  },
  {
    id: 'b03-tc-k5', type: 'num', kind: 'numerical',
    prompt: 'A fictional July list has nine rows (order_id, date, total): LC-20101 1 Jul $22.00; LC-20102 1 Jul $14.00; LC-20101 1 Jul $22.00; LC-20103 2 Jul $46.00; LC-20102 2 Jul $12.60; LC-20104 2 Jul $17.00; LC-20103 2 Jul $46.00; LC-20103 2 Jul $46.00; LC-20105 3 Jul $58.00. Ana runs Remove Duplicates with all three columns ticked. How many rows remain?',
    answer: distinctRows, check: () => new Set(JULY.map((r) => `${r[0]}|${r[1]}|${r[2]}`)).size, unit: 'rows', places: 0, tol: 0,
    wrong: [
      { value: distinctIds, say: 'That is the number with only order_id ticked. With every column ticked, the two LC-20102 rows differ (date and total), so both stay.' },
      { value: 9, say: 'Three rows are exact copies of an earlier row (one LC-20101 and two LC-20103): they go.' },
    ],
    solution: 'With every column ticked, only exact copies go: the second LC-20101 and the second and third LC-20103. Nine rows become 6. The two LC-20102 rows differ, so both stay, and Ana must still decide which version of that order is right.',
  },
  {
    id: 'b03-tc-k6', type: 'mc', kind: 'applied',
    prompt: 'Every Monday a café chain’s finance assistant receives the same supplier export, splits a name column, converts text amounts and removes test rows. Which approach suits this best?',
    options: [
      'A Power Query whose recorded steps run again on Refresh each week',
      'Flash Fill and Find and Replace each Monday, since they are quick',
      'Text to Columns on the raw sheet, then typing over the amounts that fail',
      'Data validation on the export, so that the bad values can’t arrive',
    ],
    answer: 0,
    feedback: {
      1: 'They change the cells there and then; each Monday the whole job is repeated by hand, and nothing records what was done.',
      2: 'Typing over values is the editing in place that makes cleaning impossible to check or repeat.',
      3: 'Validation applies to typing in Excel; it can’t control what another system exports, and it doesn’t check pasted values.',
    },
    solution: 'A weekly, identical job wants recorded steps: Power Query keeps the source unchanged, lists each transformation in Applied Steps, and reruns them all on Refresh. A formula-based cleaning sheet would also work; one-off tools would have to be repeated by hand every week.',
  },
];
