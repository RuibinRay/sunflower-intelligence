// lookups.ex.js — B03 · Lookups: widgets, practice and the knowledge check (answer keys live here). Lantern's data come
// from case.js; Spokewise Cycles, the courier and every other business here are fictional. Every num item's `check`
// recomputes its answer; every formula item is marked by its results on the sheet and on two changed copies.
import { ORDERS, ORDER_COLUMNS, EVENTS, PRODUCTS, DELIVERY_BANDS, SIZE_BANDS, ordersCells, productCells, eventsCells, tableCells } from './case.js?v=15';

const MONEY = '$#,##0.00';
const col = (name) => ORDER_COLUMNS.indexOf(name);
const charge = (v) => { let k = -1; DELIVERY_BANDS.forEach((b, i) => { if (b[0] <= v) k = i; }); return DELIVERY_BANDS[k][1]; };
const month = (d) => ['Mar', 'Apr', 'May', 'Jun'][Number(d.slice(5, 7)) - 3];
const value = (m, ch) => Math.round(ORDERS.filter((r) => month(r[col('order_date')]) === m && r[col('channel')] === ch).reduce((s, r) => s + r[col('order_total')], 0) * 100) / 100;
const merge = (...parts) => Object.assign({}, ...parts.map((p) => p.cells || p));

// ---------------------------------------------------------------- the Explore worksheet
const demoOrders = ordersCells({ cols: ['order_id', 'product', 'quantity', 'order_total'], n: 8 });
const demoCells = merge(demoOrders, productCells({ at: 'A12' }), { E1: 'unit_cost', F1: 'delivery', G12: 'from', H12: 'charge', G13: DELIVERY_BANDS[0][0], H13: DELIVERY_BANDS[0][1], G14: DELIVERY_BANDS[1][0], H14: DELIVERY_BANDS[1][1] });
for (let r = 2; r <= 9; r++) { demoCells[`E${r}`] = `=VLOOKUP(B${r},$A$13:$E$23,5,FALSE)`; demoCells[`F${r}`] = `=VLOOKUP(D${r},$G$13:$H$14,2,TRUE)`; }

export const widgets = {
  'lk-sheet': {
    type: 'sheet',
    title: 'Lantern’s first eight spring orders, the price list and the delivery bands',
    sheet: { cells: demoCells },
    view: 'A1:H23',
    formats: { D: MONEY, E: MONEY, F: MONEY, G: MONEY, H: MONEY },
    widths: { A: 24, B: 24 },
    tools: ['formulas', 'fill', 'reset'],
    note: 'Column E looks up each order’s unit cost in the price list (A12:E23) with an exact match; column F looks up the July delivery charge in the band table (G12:H14) with an approximate match. Every cell can be edited, and Reset puts the sheet back.',
  },
};

// ---------------------------------------------------------------- guided practice
const g1 = merge(ordersCells({ cols: ['product', 'quantity'], n: 8 }), productCells({ at: 'D1' }), { C1: 'unit_cost' });

const g2Totals = [14, 37, 34, 35.1, 111, 31, 35, 35.01];
const g2 = { A1: 'order_total', B1: 'delivery', D1: 'from', E1: 'charge', D2: DELIVERY_BANDS[0][0], E2: DELIVERY_BANDS[0][1], D3: DELIVERY_BANDS[1][0], E3: DELIVERY_BANDS[1][1] };
g2Totals.forEach((v, i) => { g2[`A${i + 2}`] = v; });

const g4 = merge(eventsCells({ cols: ['event_id', 'invoice', 'client', 'event_type'], n: 15 }), { F1: 'client', F2: 'Harbor Tech', F3: 'Alder & Finch Architects', G1: 'invoice of first event' });

export const guided = [
  {
    id: 'b03-lk-g1', type: 'formula', kind: 'applied',
    prompt: 'Column A lists the products of eight spring orders and D1:H12 holds Kilnworth’s price list. In C2, use VLOOKUP to return the order’s <code>unit_cost</code>, then fill it down to C9.',
    sheet: { cells: g1 }, cell: 'C2', fill: 'C2:C9', answer: '=VLOOKUP(A2,$D$2:$H$12,5,FALSE)',
    view: 'A1:H12', formats: { C: MONEY, G: MONEY, H: MONEY }, widths: { A: 24, D: 24 }, require: ['VLOOKUP'],
    alt: ['=VLOOKUP(A2,$D$2:$H$12,5,0)', '=VLOOKUP($A2,$D$2:$H$12,5,FALSE)'],
    wrong: [
      { formula: '=VLOOKUP(A2,$D$2:$H$12,5)', say: 'Without a fourth argument VLOOKUP makes an approximate match, which assumes column D is sorted. It isn’t, so some products come back with another product’s cost or with #N/A. Add FALSE.' },
      { formula: '=VLOOKUP(A2,D2:H12,5,FALSE)', say: 'The first row is right, but filling down slides the table to D3:H13, D4:H14… and the products near the top of the list drop out of it. Lock the table with $D$2:$H$12.' },
      { formula: '=VLOOKUP(A2,$D$2:$H$12,4,FALSE)', say: 'Column 4 of D:H is <code>price</code>, Lantern’s shop price. Count again: product is 1, so <code>unit_cost</code> is 5.' },
    ],
    hints: ['The four arguments are: what to find, where (with $), which column of that range to return, and FALSE for an exact match.', 'Count the columns of D:H: product 1, line 2, size_g 3, price 4, unit_cost 5. So <x>=VLOOKUP(A2,$D$2:$H$12,5,FALSE)</x>.'],
    solution: '<x>=VLOOKUP(A2,$D$2:$H$12,5,FALSE)</x> in C2, filled to C9. A2 moves down as the formula is filled; the price list is locked with $; 5 picks <code>unit_cost</code>; FALSE asks for an exact match. C2 shows $20.00 (Gift Box Trio) and C9 $8.40 (Ethiopia Yirgacheffe 250g).',
  },
  {
    id: 'b03-lk-g2', type: 'steps', kind: 'applied',
    prompt: 'Column A holds six spring order values and two test values ($35.00 and $35.01). D1:E3 is the July delivery rule as a band table: orders up to $35.00 pay $4.95, orders over $35 travel free.',
    solution: 'An approximate match is needed, because order values fall between the bounds. <x>=XLOOKUP(A2,$D$2:$D$3,$E$2:$E$3,,-1)</x> (or <x>=VLOOKUP(A2,$D$2:$E$3,2,TRUE)</x>) filled to B9 gives $4.95 for $14.00, $34.00, $31.00 and the $35.00 test, and $0.00 for $37.00, $35.10, $111.00 and $35.01. Three of the six real orders pay.',
    steps: [
      { id: 'b03-lk-g2-s1', type: 'mc',
        prompt: 'Which kind of match does this lookup need?',
        options: ['Approximate: the last band whose lower bound isn’t above the value', 'Exact: the band whose lower bound is equal to the order value in column A', 'Approximate: the first band whose lower bound is above the order value', 'Exact, with the order values rounded to the nearest dollar first'],
        answer: 0,
        hints: ['Is $37.00 in column D?', 'An order belongs to the band it has reached, not the one it hasn’t.'],
        feedback: {
          1: 'Only orders of exactly $0.00 or $35.01 would be found; every other order would show #N/A.',
          2: 'That is the next band up: $14.00 would land in the free band, which starts above it.',
          3: 'Rounding doesn’t make $37 equal to 0 or 35.01, and it would move $35.01 to $35, the wrong side of the boundary.',
        } },
      { id: 'b03-lk-g2-s2', type: 'formula',
        prompt: 'In B2, return the delivery charge for A2 from the band table, and fill it down to B9.',
        sheet: { cells: g2 }, cell: 'B2', fill: 'B2:B9', answer: '=XLOOKUP(A2,$D$2:$D$3,$E$2:$E$3,,-1)',
        view: 'A1:E9', formats: { A: MONEY, B: MONEY, D: MONEY, E: MONEY }, widths: { A: 12 },
        alt: ['=VLOOKUP(A2,$D$2:$E$3,2,TRUE)', '=VLOOKUP(A2,$D$2:$E$3,2)', '=INDEX($E$2:$E$3,MATCH(A2,$D$2:$D$3,1))'],
        wrong: [
          { formula: '=XLOOKUP(A2,$D$2:$D$3,$E$2:$E$3)', say: 'XLOOKUP matches exactly by default, and no order value equals 0 or 35.01, so you get #N/A. Add match_mode −1: exact match or else the next smaller item.' },
          { formula: '=VLOOKUP(A2,$D$2:$E$3,2,FALSE)', say: 'FALSE asks for an exact match, which fails for every order value that isn’t a lower bound. Bands need TRUE.' },
          { formula: '=XLOOKUP(A2,$D$2:$D$3,$E$2:$E$3,,1)', say: 'Match mode 1 takes the next larger item, the band above the value: small orders would travel free. Use −1.' },
          { formula: '=IF(A2>35,0,4.95)', say: 'That reproduces today’s rule, but with the thresholds typed into the formula: change the band table and it won’t follow. Look the charge up in D2:E3.' },
          { formula: '=XLOOKUP(A2,D2:D3,E2:E3,,-1)', say: 'Without $ the band table slides down as you fill, and lower rows look in empty cells. Lock it with $D$2:$E$3.' },
        ],
        hints: ['XLOOKUP needs match_mode −1 (the fifth argument); leave if_not_found empty with two commas.', '<x>=XLOOKUP(A2,$D$2:$D$3,$E$2:$E$3,,-1)</x>, or <x>=VLOOKUP(A2,$D$2:$E$3,2,TRUE)</x>.'] },
      { id: 'b03-lk-g2-s3', type: 'num',
        prompt: 'How many of the six real orders (rows 2 to 7) would pay the delivery charge?',
        answer: 3, check: () => g2Totals.slice(0, 6).filter((v) => charge(v) > 0).length, unit: 'orders', places: 0, tol: 0,
        hints: ['Count the rows from 2 to 7 that show $4.95.', 'Only orders of $35.00 or less pay.'],
        wrong: [{ value: 2, say: 'Check $34.00: it is under $35, so it pays.' }, { value: 4, say: 'Rows 8 and 9 are test values, not orders; and $35.10 is over $35, so it travels free.' }] },
    ],
  },
  {
    id: 'b03-lk-g3', type: 'mc', kind: 'conceptual',
    prompt: '<x>=XLOOKUP(B7,$H$2:$H$12,$L$2:$L$12)</x> returns #N/A for an order whose product reads “Cold Brew Pack”, although Cold Brew Pack is on the price list in H2:H12. Which test is the best first step?',
    options: ['<x>=LEN(B7)</x>, compared with the 14 characters of “Cold Brew Pack”', '<x>=ISNUMBER(B7)</x>, to see whether the product is stored as a number', 'Sort the price list A to Z and try again', 'Add a fifth argument of −1 to allow the next smaller item'],
    answer: 0,
    hints: ['Two text values can look identical on screen and still differ.', 'What can’t you see in a cell?'],
    feedback: {
      1: 'A product name is text either way; the type test matters for numeric keys such as order ids or part numbers.',
      2: 'XLOOKUP’s exact match doesn’t need a sorted list, so sorting changes nothing.',
      3: 'That would return some other product’s cost instead of an error: hiding the problem, not finding it.',
    },
    solution: 'Invisible characters are the usual reason two names that look the same don’t match. If <x>=LEN(B7)</x> returns 15 instead of 14, there is a stray space, and <x>=XLOOKUP(TRIM(B7),$H$2:$H$12,$L$2:$L$12)</x> (or cleaning column B with TRIM) fixes it.',
  },
  {
    id: 'b03-lk-g4', type: 'formula', kind: 'applied',
    prompt: 'A2:D16 lists Lantern’s first 15 catering events, with the invoice in column B and the client in column C. In G2, return the invoice of the first event for the client named in F2, and fill it down to G3 for the client in F3. (VLOOKUP can’t do this one: why not?)',
    sheet: { cells: g4 }, cell: 'G2', fill: 'G2:G3', answer: '=INDEX($B$2:$B$16,MATCH(F2,$C$2:$C$16,0))',
    view: 'A1:G16', formats: { B: MONEY, G: MONEY }, widths: { C: 26, F: 26, G: 22 },
    alt: ['=XLOOKUP(F2,$C$2:$C$16,$B$2:$B$16)', '=INDEX($B$2:$B$16,XMATCH(F2,$C$2:$C$16))', '=INDEX(B2:B16,MATCH(F2,C2:C16,0))'],
    wrong: [
      { formula: '=VLOOKUP(F2,$B$2:$C$16,2,FALSE)', say: 'VLOOKUP searches the first column of its range, here the invoices, for a client’s name: there is none, so #N/A. The client column is to the right of the invoices, so use INDEX and MATCH or XLOOKUP.' },
      { formula: '=INDEX($B$2:$B$16,MATCH(F2,$C$2:$C$16))', say: 'MATCH without 0 makes an approximate match on an unsorted list. Add 0 as the third argument.' },
      { formula: '=INDEX($B$2:$B$16,MATCH(F2,$C$2:$C$16,0),2)', say: 'B2:B16 has only one column, so a column number of 2 gives #REF!. Leave the column number out.' },
      { formula: '=INDEX($B$2:$B$16,MATCH($F$2,$C$2:$C$16,0))', say: 'With $F$2 the filled formula in G3 still looks up Harbor Tech. Leave F2 relative so that it becomes F3.' },
    ],
    hints: ['MATCH finds the position a client first takes in C2:C16; INDEX returns the invoice in that position of B2:B16. Lock both ranges with $ so that they stay put when the formula is filled.', '<x>=INDEX($B$2:$B$16,MATCH(F2,$C$2:$C$16,0))</x>, or <x>=XLOOKUP(F2,$C$2:$C$16,$B$2:$B$16)</x>.'],
    solution: '<x>=INDEX($B$2:$B$16,MATCH(F2,$C$2:$C$16,0))</x>, filled to G3. For Harbor Tech, MATCH(…,0) finds the first exact match in position 2 and INDEX returns the 2nd invoice, $800.00 (EV-002 on 26 March); for Alder & Finch Architects it finds position 4, $460.00 (EV-004). VLOOKUP can’t do it because it only returns columns to the right of the key, and the invoices are to the left of the clients. <x>=XLOOKUP(F2,$C$2:$C$16,$B$2:$B$16)</x> works too.',
  },
];

// ---------------------------------------------------------------- on your own
const i1 = { A1: 'month', B1: 'app', C1: 'web', E1: 'month', F1: 'channel', G1: 'order value', E2: 'Apr', F2: 'app', E3: 'Jun', F3: 'web' };
['Mar', 'Apr', 'May', 'Jun'].forEach((m, i) => { i1[`A${i + 2}`] = m; i1[`B${i + 2}`] = value(m, 'app'); i1[`C${i + 2}`] = value(m, 'web'); });

const i2Ids = ['LC-10001', 'LC-10002', 'LC-10004', 'LC-10005', 'LC-10006', 'LC-10019', 'LC-10021', 'LC-10144'];
const i2 = { A1: 'order_id', B1: 'order_total', C1: 'size band', E1: 'from', F1: 'band' };
i2Ids.forEach((id, i) => { const r = ORDERS.find((x) => x[0] === id); i2[`A${i + 2}`] = id; i2[`B${i + 2}`] = r[col('order_total')]; });
SIZE_BANDS.forEach((b, i) => { i2[`E${i + 2}`] = b[0]; i2[`F${i + 2}`] = b[1]; });

const i3Products = ['House Blend 250g', 'Kenya AA 250g', 'Cold Brew Pack', 'Espresso Roast 1kg', 'Decaf Colombia 250g', 'Holiday Blend 250g'];
const i3 = merge(productCells({ at: 'C1' }), { A1: 'product', B1: 'unit_cost' });
i3Products.forEach((p, i) => { i3[`A${i + 2}`] = p; });

// a fictional courier's weight bands
const COURIER = [[0, 4.20], [2, 6.80], [5, 9.50], [10, 14.00]];
const PARCELS = [1.8, 2.0, 4.99, 5.0, 12.3];
const courier = (kg, over = false) => { let k = 0; COURIER.forEach((b, i) => { if (over ? kg > b[0] || b[0] === 0 : kg >= b[0]) k = i; }); return COURIER[k][1]; };

export const independent = [
  {
    id: 'b03-lk-i1', type: 'formula', kind: 'applied',
    prompt: 'A1:C5 shows Lantern’s spring order value by month and channel. E2:F3 holds two questions, each a month and a channel. In G2, write a two-way lookup that returns the order value for the month in E2 and the channel in F2, whatever they hold, and fill it down to G3.',
    sheet: { cells: i1 }, cell: 'G2', fill: 'G2:G3', answer: '=INDEX($B$2:$C$5,MATCH(E2,$A$2:$A$5,0),MATCH(F2,$B$1:$C$1,0))',
    view: 'A1:G5', formats: { B: MONEY, C: MONEY, G: MONEY }, widths: { G: 13 },
    alt: ['=INDEX($B$2:$C$5,XMATCH(E2,$A$2:$A$5),XMATCH(F2,$B$1:$C$1))', '=XLOOKUP(E2,$A$2:$A$5,XLOOKUP(F2,$B$1:$C$1,$B$2:$C$5))'],
    wrong: [
      { formula: '=INDEX($B$2:$C$5,MATCH(F2,$B$1:$C$1,0),MATCH(E2,$A$2:$A$5,0))', say: 'The row and column numbers are swapped: INDEX takes the row first. The month’s MATCH gives the row, the channel’s MATCH the column.' },
      { formula: '=INDEX($B$2:$C$5,MATCH(E2,$A$1:$A$5,0),MATCH(F2,$B$1:$C$1,0))', say: 'MATCH over A1:A5 counts the header as position 1, so every row is one too low. Search A2:A5, the same rows as B2:C5.' },
      { formula: '=INDEX(B2:C5,MATCH(E2,A2:A5,0),MATCH(F2,B1:C1,0))', say: 'G2 is right, but filled to G3 the ranges slide down a row and the channel headings are no longer in B1:C1. Lock the ranges with $.' },
    ],
    solution: '<x>=INDEX($B$2:$C$5,MATCH(E2,$A$2:$A$5,0),MATCH(F2,$B$1:$C$1,0))</x>, filled to G3. For April and app, the first MATCH finds April in position 2 of A2:A5, the second finds app in position 1 of B1:C1, and INDEX returns row 2, column 1 of B2:C5: $1,012.65. For June and web it returns row 4, column 2: $1,052.90. With Microsoft 365, <x>=INDEX($B$2:$C$5,XMATCH(E2,$A$2:$A$5),XMATCH(F2,$B$1:$C$1))</x> is the same idea.',
  },
  {
    id: 'b03-lk-i2', type: 'formula', kind: 'applied',
    prompt: 'E1:F5 holds Ana’s order-size bands. In C2, return the size band of the order value in B2, and fill it down to C9.',
    sheet: { cells: i2, fixed: ['E2:E5'] }, cell: 'C2', fill: 'C2:C9', answer: '=XLOOKUP(B2,$E$2:$E$5,$F$2:$F$5,,-1)',
    view: 'A1:F9', formats: { B: MONEY, E: MONEY }, widths: { C: 15, F: 15 },
    alt: ['=VLOOKUP(B2,$E$2:$F$5,2,TRUE)', '=VLOOKUP(B2,$E$2:$F$5,2)', '=INDEX($F$2:$F$5,MATCH(B2,$E$2:$E$5,1))'],
    wrong: [
      { formula: '=XLOOKUP(B2,$E$2:$E$5,$F$2:$F$5)', say: 'An exact match finds only order values equal to a lower bound. Bands need match_mode −1 (or VLOOKUP with TRUE).' },
      { formula: '=XLOOKUP(B2,$E$2:$E$5,$F$2:$F$5,,1)', say: 'Match mode 1 returns the next band up: $14.00 would be labelled “$20 to $39.99”. Use −1.' },
      { formula: '=VLOOKUP(B2,E2:F5,2,TRUE)', say: 'Without $ the band table slides down as you fill, and the bottom rows lose the lower bands. Lock it with $E$2:$F$5.' },
    ],
    solution: '<x>=XLOOKUP(B2,$E$2:$E$5,$F$2:$F$5,,-1)</x> or <x>=VLOOKUP(B2,$E$2:$F$5,2,TRUE)</x>, filled to C9. $111.00 and $92.00 fall in “$100 and over” and “$40 to $99.99”; $12.60 in “Under $20”; the $1,512.00 office order (LC-10144) in “$100 and over”.',
  },
  {
    id: 'b03-lk-i3', type: 'formula', kind: 'applied',
    prompt: 'Column A lists products on a draft autumn order; two of them are new and not on Kilnworth’s spring list (C1:G12). In B2, return each product’s <code>unit_cost</code>, or the text <i>not on price list</i> when the product isn’t there, and fill it down to B7.',
    sheet: { cells: i3 }, cell: 'B2', fill: 'B2:B7', answer: '=XLOOKUP(A2,$C$2:$C$12,$G$2:$G$12,"not on price list")',
    view: 'A1:G12', formats: { B: MONEY, F: MONEY, G: MONEY }, widths: { A: 22, B: 16, C: 24 },
    alt: ['=IFNA(VLOOKUP(A2,$C$2:$G$12,5,FALSE),"not on price list")', '=IFNA(INDEX($G$2:$G$12,MATCH(A2,$C$2:$C$12,0)),"not on price list")', '=IFNA(XLOOKUP(A2,$C$2:$C$12,$G$2:$G$12),"not on price list")'],
    wrong: [
      { formula: '=XLOOKUP(A2,$C$2:$C$12,$G$2:$G$12)', say: 'The known products are right, but the new ones show #N/A. Give XLOOKUP a fourth argument, <x>"not on price list"</x>.' },
      { formula: '=XLOOKUP(A2,$C$2:$C$12,$G$2:$G$12,0)', say: 'A cost of $0.00 for the new products would make them look free and understate any total. Return the message instead, so the rows stand out.' },
      { formula: '=XLOOKUP(A2,$C$2:$C$12,$F$2:$F$12,"not on price list")', say: 'Column F is the shop price. The cost Kilnworth charges is in column G.' },
    ],
    solution: '<x>=XLOOKUP(A2,$C$2:$C$12,$G$2:$G$12,"not on price list")</x>, filled to B7. Kenya AA 250g and Holiday Blend 250g show the message; the other four show $8.00, $8.50, $24.50 and $7.90. In a version without XLOOKUP, <x>=IFNA(VLOOKUP(A2,$C$2:$G$12,5,FALSE),"not on price list")</x> does the same.',
  },
  {
    id: 'b03-lk-i4', type: 'classify', kind: 'conceptual',
    prompt: 'Each lookup below fails. Choose the fix for each.',
    items: [
      'The order sheet says “Cold Brew Pack ” (with a space at the end)',
      'Order ids are numbers in one sheet and text in the other',
      'The order sheet says “Etiopia Yirgacheffe 250g”',
      'Kenya AA 250g was launched after the price list was made',
      '<x>=VLOOKUP(B2,$H$2:$L$12,5)</x> on the unsorted price list',
      '<x>=VLOOKUP(B2,H2:L12,5,FALSE)</x> filled down the order sheet',
    ],
    categories: ['Clean the key with TRIM', 'Convert one side so both keys have the same type', 'Correct the spelling, or map it to the right name', 'Add it to the table, or flag it as not found', 'Add FALSE for an exact match', 'Lock the table range with $'],
    answer: [0, 1, 2, 3, 4, 5],
    feedback: {
      1: 'The number 10144 never equals the text “10144”. Convert one side with VALUE (text to number) or by joining an empty string (number to text).',
      3: 'The product really isn’t there: no cleaning will find it. Add it once Kilnworth prices it, and until then let if_not_found or IFNA say so.',
      4: 'Without a fourth argument VLOOKUP approximates on an unsorted list and returns plausible wrong costs.',
      5: 'Without $ the range slides down as the formula is filled, so lower rows search a shrinking part of the list.',
    },
    solution: 'Trailing space: TRIM. Text against number: convert one side. Misspelling: correct it or map it. New product: add it or flag it. Missing FALSE: add it. Sliding range: lock it with $.',
  },
  {
    id: 'b03-lk-i5', type: 'num', kind: 'numerical',
    prompt: 'A courier (fictional) charges by parcel weight with this band table: from 0 kg $4.20, from 2 kg $6.80, from 5 kg $9.50, from 10 kg $14.00. A weight equal to a lower bound belongs to that band. What does it charge in total for five parcels weighing 1.8, 2.0, 4.99, 5.0 and 12.3 kg? Give dollars and cents.',
    answer: 41.3, check: () => PARCELS.reduce((s, kg) => s + courier(kg), 0), unit: '$', places: 2, tol: 0.005,
    wrong: [
      { value: 36, say: 'You put the 2.0 kg and 5.0 kg parcels in the band below. In an approximate match a value equal to a lower bound belongs to that band: 2.0 kg pays $6.80 and 5.0 kg $9.50.' },
      { value: PARCELS.reduce((s, kg) => { const k = COURIER.findIndex((b) => b[1] === courier(kg)); return s + COURIER[Math.min(k + 1, COURIER.length - 1)][1]; }, 0), say: 'You moved every parcel up a band, to the next larger item (the 12.3 kg parcel has no band above, so it stays at $14.00). An approximate match takes the band whose lower bound is the largest one not above the weight.' },
    ],
    solution: 'Each parcel takes the band with the largest lower bound not above its weight: 1.8 kg $4.20; 2.0 kg $6.80; 4.99 kg $6.80; 5.0 kg $9.50; 12.3 kg $14.00. Total: 4.20 + 6.80 + 6.80 + 9.50 + 14.00 = $41.30.',
  },
  {
    id: 'b03-lk-i6', type: 'mc', kind: 'applied',
    prompt: 'Ana’s order workbook uses XLOOKUP throughout. Kilnworth’s accountant, who will open it to check the costs, has Excel 2019. What should Ana do?',
    options: [
      'Rebuild the lookups with INDEX and MATCH (match_type 0), which work in Excel 2019',
      'Nothing: Excel 2019 recalculates XLOOKUP as long as the file is saved as .xlsx',
      'Replace each XLOOKUP with VLOOKUP and leave out the fourth argument, so the lookups stay short',
      'Wrap each XLOOKUP in IFERROR so that the accountant sees blanks instead of errors',
    ],
    answer: 0,
    feedback: {
      1: 'Microsoft states that XLOOKUP is not available in Excel 2016 or Excel 2019; the file format doesn’t add functions to an older version.',
      2: 'VLOOKUP works in Excel 2019, but leaving out the fourth argument makes it approximate: wrong costs on an unsorted list.',
      3: 'The accountant would see blanks where costs should be, which is worse than an error: the workbook would look complete and be wrong.',
    },
    solution: 'XLOOKUP needs Excel for Microsoft 365, 2021 or 2024. INDEX with MATCH (match_type 0) does the same exact lookup in every version, so it is the right choice for a workbook shared with Excel 2019. VLOOKUP with FALSE would also work.',
  },
];

// ---------------------------------------------------------------- knowledge check
const k2 = merge(eventsCells({ cols: ['event_id', 'event_date', 'client', 'invoice'], n: 20 }), { F1: 'client', F2: 'Harbor Tech', F3: 'Weatherglass Records', G1: 'latest invoice' });
const k3Totals = [12.6, 35, 46, 30.6, 35.1, 22];
const k5 = merge(ordersCells({ cols: ['order_id', 'product'], n: 6 }), productCells({ at: 'E1' }), { C1: 'price' });

export const check = [
  {
    id: 'b03-lk-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A colleague inserts a new column for supplier codes into the middle of the price list. Which lookup keeps returning the right cost without being edited?',
    options: [
      '<x>=INDEX($L$2:$L$12,MATCH(B2,$H$2:$H$12,0))</x>, because its ranges move with the data',
      '<x>=VLOOKUP(B2,$H$2:$L$12,5,FALSE)</x>, because the $ signs fix the table in place',
      '<x>=VLOOKUP(B2,$H$2:$L$12,5,TRUE)</x>, because an approximate match adapts to the new layout',
      'Neither kind: every lookup must be rewritten when a column is inserted',
    ],
    answer: 0,
    feedback: {
      1: 'The $ signs stop the range moving when the formula is filled, but Excel still widens it to include the new column, and the typed 5 then points at the column before the cost.',
      2: 'TRUE changes how the key is matched, not which column is returned; the column number is still a fixed 5, and the match is now approximate as well.',
      3: 'INDEX and MATCH (and XLOOKUP) refer to the cost column itself, so Excel shifts the reference when the column moves.',
    },
    solution: 'INDEX and MATCH refer to the key column and the cost column directly; inserting a column shifts both references with the data. VLOOKUP’s column number is a constant, so after the insertion it counts to the wrong column.',
  },
  {
    id: 'b03-lk-k2', type: 'formula', kind: 'applied',
    prompt: 'A2:D21 lists Lantern’s first 20 catering events in date order. In G2, return the invoice of the most recent event in the list for the client named in F2, and fill it down to G3 for the client in F3.',
    sheet: { cells: k2 }, cell: 'G2', fill: 'G2:G3', answer: '=XLOOKUP(F2,$C$2:$C$21,$D$2:$D$21,,0,-1)',
    view: 'A1:G21', formats: { B: 'date', D: MONEY, G: MONEY }, widths: { B: 12, C: 26, F: 22, G: 14 },
    alt: ['=XLOOKUP(F2,$C$2:$C$21,$D$2:$D$21,"",0,-1)', '=XLOOKUP(F2,$C$2:$C$21,$D$2:$D$21,,,-1)'],
    wrong: [
      { formula: '=XLOOKUP(F2,$C$2:$C$21,$D$2:$D$21)', say: 'That is the client’s first event in the list. Search from the last item with search_mode −1 (the sixth argument).' },
      { formula: '=INDEX($D$2:$D$21,MATCH(F2,$C$2:$C$21,0))', say: 'MATCH with 0 finds the first match, the client’s earliest event. XLOOKUP’s search_mode −1 finds the last.' },
      { formula: '=MAXIFS($D$2:$D$21,$C$2:$C$21,F2)', say: 'That is the client’s largest invoice, not the most recent one. (For Weatherglass Records the two happen to coincide; for Harbor Tech they don’t.)' },
    ],
    solution: '<x>=XLOOKUP(F2,$C$2:$C$21,$D$2:$D$21,,0,-1)</x>, filled to G3: exact match (0), searching from the last row up (−1). Harbor Tech’s last event in these 20 rows is EV-014 on 22 May, invoiced $390.00 (searching from the top would return its first event, EV-002, at $800.00); Weatherglass Records’ last is EV-020 on 18 June, $1,050.00.',
  },
  {
    id: 'b03-lk-k3', type: 'num', kind: 'numerical',
    prompt: 'Under the July delivery rule (orders over $35 travel free; the rest pay $4.95), what would these six orders pay in delivery charges altogether: $12.60, $35.00, $46.00, $30.60, $35.10 and $22.00?',
    answer: 19.8, check: () => k3Totals.reduce((s, v) => s + charge(v), 0), unit: '$', places: 2, tol: 0.005,
    wrong: [
      { value: 24.75, say: 'You charged the $35.10 order. It is over $35, so it travels free.' },
      { value: 14.85, say: 'The $35.00 order is not over $35, so it pays $4.95 too.' },
    ],
    solution: 'Orders of $35.00 or less pay $4.95: $12.60, $35.00, $30.60 and $22.00, four orders, so 4 × $4.95 = $19.80. The $46.00 and $35.10 orders are over $35 and travel free.',
  },
  {
    id: 'b03-lk-k4', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements about XLOOKUP that are true.',
    options: [
      'Without a match_mode it looks for an exact match.',
      'Its return range can be to the left of its lookup range.',
      'Its if_not_found argument replaces #N/A with a value of your choice.',
      'With search_mode −1 it returns the last match instead of the first.',
      'It needs its lookup range sorted from smallest to largest, like VLOOKUP’s approximate match.',
      'It works in Excel 2016 and Excel 2019 as well as in Microsoft 365.',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'Only the binary search modes (2 and −2) need sorted data. The default search reads the list from the first item to the last.',
      5: 'Microsoft states that XLOOKUP is not available in Excel 2016 or Excel 2019; it needs Microsoft 365, 2021 or 2024.',
    },
    solution: 'True: exact match by default; return range anywhere; if_not_found; search_mode −1 returns the last match. False: sorting is needed only for the binary search modes, and XLOOKUP isn’t available in Excel 2016 or 2019.',
  },
  {
    id: 'b03-lk-k5', type: 'formula', kind: 'applied',
    prompt: 'The workbook must also open correctly in Excel 2019. In C2, use INDEX and MATCH to return the shop <code>price</code> of the order’s product from the price list in E1:I12, and fill it down to C7.',
    sheet: { cells: k5 }, cell: 'C2', fill: 'C2:C7', answer: '=INDEX($H$2:$H$12,MATCH(B2,$E$2:$E$12,0))',
    view: 'A1:I12', formats: { C: MONEY, H: MONEY, I: MONEY }, widths: { B: 24, E: 24 }, require: ['INDEX', 'MATCH'],
    alt: ['=INDEX($E$2:$I$12,MATCH(B2,$E$2:$E$12,0),4)'],
    wrong: [
      { formula: '=INDEX($H$2:$H$12,MATCH(B2,$E$2:$E$12))', say: 'MATCH’s default match_type is 1, an approximate match that assumes a sorted list. Add 0 for an exact match.' },
      { formula: '=INDEX($I$2:$I$12,MATCH(B2,$E$2:$E$12,0))', say: 'Column I is Kilnworth’s unit cost. The shop price is in column H.' },
      { formula: '=INDEX(H2:H12,MATCH(B2,E2:E12,0))', say: 'Without $ both ranges slide down as the formula is filled, and lower rows can’t see the top of the list. Lock them.' },
    ],
    solution: '<x>=INDEX($H$2:$H$12,MATCH(B2,$E$2:$E$12,0))</x>, filled to C7. MATCH finds the product’s position in E2:E12 (exact, with 0); INDEX returns the price in the same position of H2:H12. C2 shows $58.00 for the Gift Box Trio.',
  },
  {
    id: 'b03-lk-k6', type: 'fill', kind: 'conceptual',
    prompt: 'Complete Ana’s VLOOKUP so that it returns the exact <code>unit_cost</code> for the product in B2 from the price list in H2:L12 (product in H, unit_cost in L), and still works when filled down.',
    text: '=VLOOKUP(B2, [[0]], [[1]], [[2]])',
    blanks: [
      { options: ['H2:L12', '$L$2:$L$12', '$H$2:$L$12', '$H$2:$H$12'], answer: 2 },
      { options: ['4', '5', '12', '1'], answer: 1 },
      { options: ['TRUE', '1', '−1', 'FALSE'], answer: 3 },
    ],
    fixed: true,
    solution: '<x>=VLOOKUP(B2,$H$2:$L$12,5,FALSE)</x>: the whole table locked with $, column 5 (H is 1, so L is 5) and FALSE for an exact match. TRUE or 1 would make it approximate.',
  },
];
