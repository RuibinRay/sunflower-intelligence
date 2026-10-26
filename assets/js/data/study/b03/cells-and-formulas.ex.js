// cells-and-formulas.ex.js — B03 · Cells, references and formulas: widgets, practice and the knowledge check (answer
// keys live here). Lantern's orders, prices and monthly values come from case.js; Riverbend Cycles and the Blue Heron
// Inn are fictional. Formula items are marked by their results on the sheet and on three copies with the numbers changed.
import { ORDERS, ORDER_COLUMNS, PRODUCTS, DERIVED as D, tableCells } from './case.js?v=18';

const r2 = (x) => Math.round(x * 100) / 100;
const price = (p) => PRODUCTS.find((x) => x[0] === p)[3];
const MONTHS = ['Mar', 'Apr', 'May', 'Jun'];
const MONTH_VALUES = MONTHS.map((m) => D.byMonth.value[m]);
const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// the first eight orders with the columns a line total needs: A order_id, B product, C quantity, D unit_price, E discount
const LINES8 = tableCells(ORDER_COLUMNS, ORDERS, { cols: ['order_id', 'product', 'quantity', 'unit_price', 'discount'], n: 8 });
const MONEY = '$#,##0.00';

// a small price list for the price-rise items
const SIX = ['House Blend 250g', 'House Blend 1kg', 'Espresso Roast 250g', 'Colombia Huila 250g', 'Ethiopia Yirgacheffe 250g', 'Cold Brew Pack'];
const priceRows = (at) => Object.fromEntries(SIX.flatMap((p, i) => [[`A${at + i}`, p], [`B${at + i}`, price(p)]]));

// the two-way price table: prices down B3:B6, rises across C2:E2
const FOUR = ['House Blend 250g', 'Colombia Huila 250g', 'Ethiopia Yirgacheffe 250g', 'Espresso Roast 1kg'];
// guided 4 uses other products and rises than the lesson's challenging example
const G4_PRODUCTS = ['Espresso Roast 250g', 'Decaf Colombia 250g', 'Sumatra Mandheling 250g', 'House Blend 1kg'];
const twoWay = {
  A1: 'New price after a rise of:', A2: 'Product', B2: 'Price', C2: 0.03, D2: 0.05, E2: 0.08,
  ...Object.fromEntries(G4_PRODUCTS.flatMap((p, i) => [[`A${i + 3}`, p], [`B${i + 3}`, price(p)]])),
};

// Riverbend Cycles (fictional): a labour rate named Rate in B1, service hours in B, parts in C
const SERVICES = [['Basic tune-up', 1, 0], ['Brake overhaul', 1.5, 24], ['Wheel true', 0.5, 0], ['Full service', 2.5, 35], ['Chain replacement', 0.5, 28]];
const riverbend = {
  A1: 'Labour rate ($ per hour)', B1: 48, A3: 'Service', B3: 'Hours', C3: 'Parts ($)', D3: 'Price ($)',
  ...Object.fromEntries(SERVICES.flatMap(([s, h, p], i) => [[`A${i + 4}`, s], [`B${i + 4}`, h], [`C${i + 4}`, p]])),
};

// monthly order values (Lantern, spring 2026)
const months = (extra = {}) => ({
  A1: 'Month', B1: 'Order value', ...Object.fromEntries(MONTHS.flatMap((m, i) => [[`A${i + 2}`, m], [`B${i + 2}`, MONTH_VALUES[i]]])), ...extra,
});

// the Blue Heron Inn (fictional): rooms sold per night (A3:A6) × nightly rate (B2:D2)
const heron = { A1: 'Room revenue per night ($)', A2: 'Rooms sold', B2: 110, C2: 125, D2: 140, A3: 20, A4: 25, A5: 30, A6: 35 };

export const widgets = {
  'cf-lines': {
    type: 'sheet',
    title: 'Rebuild the first eight order values',
    sheet: { cells: {
      ...tableCells(ORDER_COLUMNS, ORDERS, { cols: ['order_id', 'quantity', 'unit_price', 'discount', 'order_total'], n: 8 }).cells,
      F1: 'line total', G1: 'difference',
    } },
    view: 'A1:G9',
    formats: { C: MONEY, D: MONEY, E: MONEY, F: MONEY, G: MONEY },
    widths: { A: 10, F: 12, G: 12 },
    editable: 'F2:G9',
    mark: ['F2:G9'],
    tools: ['formulas', 'fill', 'reset'],
    note: 'Column B is the quantity, C the unit price, D the discount and E the total the shop recorded. Columns F and G are yours.',
  },
  'cf-table': {
    type: 'sheet',
    title: 'A two-way table of new prices',
    sheet: { cells: {
      A1: 'Product', B1: 'Price', C1: 0.04, D1: 0.06, E1: 0.10,
      ...Object.fromEntries(FOUR.flatMap((p, i) => [[`A${i + 2}`, p], [`B${i + 2}`, price(p)]])),
    } },
    view: 'A1:E5',
    formats: { B: MONEY, C: MONEY, D: MONEY, E: MONEY, C1: '0%', D1: '0%', E1: '0%' },
    widths: { A: 24 },
    editable: true,
    mark: ['C2:E5'],
    tools: ['formulas', 'fill', 'reset'],
    note: 'Row 1 holds the rises and column B the current prices. Change a rise and see which cells follow it.',
  },
};

export const guided = [
  {
    id: 'b03-cf-g1', type: 'formula', kind: 'applied',
    prompt: 'Lantern’s first eight orders. In F2, write a formula for LC-10001’s line total: quantity × unit price − discount. Your formula will be filled down to F9, as Excel’s fill handle does.',
    sheet: { cells: { ...LINES8.cells, F1: 'line total' } },
    cell: 'F2', fill: 'F2:F9', view: 'A1:F9',
    formats: { D: MONEY, E: MONEY, F: MONEY }, widths: { B: 24 },
    answer: '=C2*D2-E2',
    alt: ['=D2*C2-E2', '=-E2+C2*D2'],
    wrong: [
      { formula: '=C2*D2', say: 'That is the value before the discount. Subtract the discount in column E.' },
      { formula: '=C2*(D2-E2)', say: 'The parentheses take the discount off every item. The discount is for the whole order: multiply first, then subtract.' },
    ],
    hints: ['Quantity is in column C, unit price in D and the discount in E, all on row 2.', 'Multiplication comes before subtraction, so no parentheses are needed: <x>=C2*D2-E2</x>.'],
    solution: '<x>=C2*D2-E2</x> gives 2 × 58 − 5 = 111 for LC-10001. The references are relative, so filled down each copy reads its own row: F3 is <x>=C3*D3-E3</x>, and so on to F9.',
  },
  {
    id: 'b03-cf-g2', type: 'num', kind: 'numerical',
    prompt: 'What does Excel return for <x>=-2^2+10%*50</x>?',
    answer: 9, check: () => (-2) ** 2 + (10 / 100) * 50, unit: '', places: 0, tol: 0.001,
    hints: ['Negation comes before exponentiation, and percent comes before multiplication.', 'So the formula is (−2)² + 0.10 × 50.'],
    wrong: [
      { value: 1, say: 'You squared 2 and then made it negative. In Excel negation comes first: −2 squared is 4.' },
      { value: 504, say: 'The % turns 10 into 0.10 before the multiplication: 0.10 × 50 = 5.' },
    ],
    solution: 'Excel’s order is negation, then percent, then ^, then * and /, then + and −. So −2 is squared to give 4, 10% becomes 0.10, 0.10 × 50 = 5, and 4 + 5 = 9.',
  },
  {
    id: 'b03-cf-g3', type: 'formula', kind: 'applied',
    prompt: 'B1 holds a planned price rise. In C4, write a formula for the House Blend 250g price after the rise that stays right when it is filled down to C9.',
    sheet: { cells: { A1: 'Price rise', B1: 0.06, A3: 'Product', B3: 'Price', C3: 'New price', ...priceRows(4) } },
    cell: 'C4', fill: 'C4:C9', view: 'A1:C9',
    formats: { B1: '0%', B: MONEY, C: MONEY }, widths: { A: 26 },
    answer: '=B4*(1+$B$1)',
    alt: ['=B4+B4*$B$1', '=(1+$B$1)*B4', '=B4*(1+B$1)'],
    wrong: [
      { formula: '=B4*(1+B1)', say: 'Without dollar signs the rise reference moves too: C5 reads B2, which is empty, so every price after the first is unchanged. Fix it with $B$1.' },
      { formula: '=B4*$B$1', say: 'That is the size of the rise, not the new price. The new price is the price times (1 + rise).' },
      { formula: '=B4+$B$1', say: 'That adds 0.06 dollars. A 6% rise multiplies the price by 1.06.' },
    ],
    hints: ['New price = price × (1 + rise).', 'The price reference should move down the rows; the rise reference must stay on B1, so give it dollar signs: $B$1.'],
    solution: '<x>=B4*(1+$B$1)</x>: the price reference B4 moves to B5, B6 … as the formula is filled, while $B$1 stays on the rise. For House Blend 250g that is 14.00 × 1.06 = $14.84. <x>=B4*(1+B$1)</x> also works when you only fill down, because only the row needs fixing; <x>$B$1</x> is safer if the formula is ever copied sideways.',
  },
  {
    id: 'b03-cf-g4', type: 'formula', kind: 'applied',
    prompt: 'Prices are in B3:B6 and three possible rises in C2:E2. Write one formula in C3 that, filled across to E3 and down to E6, gives each product’s new price under each rise.',
    sheet: { cells: twoWay },
    cell: 'C3', fill: 'C3:E6', view: 'A1:E6',
    formats: { B: MONEY, C: MONEY, D: MONEY, E: MONEY, C2: '0%', D2: '0%', E2: '0%' }, widths: { A: 26 },
    answer: '=$B3*(1+C$2)',
    alt: ['=$B3+$B3*C$2', '=(1+C$2)*$B3'],
    wrong: [
      { formula: '=B3*(1+C2)', say: 'With no dollar signs both references move: one column to the right, the price reference points at the previous new price instead of column B, and the rise reference drops below row 2.' },
      { formula: '=$B$3*(1+C$2)', say: '$B$3 fixes the row as well, so every row shows the Espresso Roast 250g prices. Fix only the column: $B3.' },
      { formula: '=$B3*(1+$C$2)', say: '$C$2 fixes the column as well, so every column uses the 3% rise. Fix only the row: C$2.' },
      { formula: '=B$3*(1+$C2)', say: 'The dollar signs are on the wrong parts. The prices run down column B (fix the column, $B3); the rises run along row 2 (fix the row, C$2).' },
    ],
    hints: ['Every cell needs the price from column B on its own row, and the rise from row 2 in its own column.', 'Fix the column of the price reference ($B3) and the row of the rise reference (C$2).'],
    solution: '<x>=$B3*(1+C$2)</x>. Filled across and down, $B3 always reads column B on the cell’s own row and C$2 always reads row 2 in the cell’s own column; in E6, for example, it becomes <x>=$B6*(1+E$2)</x> = 46.00 × 1.08 = $49.68.',
  },
];

export const independent = [
  {
    id: 'b03-cf-i1', type: 'classify', kind: 'conceptual',
    prompt: 'Which error value does each formula return?',
    items: [
      '<x>=E2/F2</x>, where F2 is empty',
      '<x>=C2*D2</x>, where D2 holds the text “TBC”',
      '<x>=SUMM(F2:F9)</x>',
      '<x>=SUM(B2,C2,D2)</x>, after column C has been deleted',
      '<x>=10^400</x>',
      'A lookup that can’t find the product code it was given',
      '<x>=IF(B2>50,large,small)</x>',
    ],
    categories: ['#DIV/0!', '#VALUE!', '#NAME?', '#REF!', '#N/A', '#NUM!'],
    answer: [0, 1, 2, 3, 5, 4, 2],
    feedback: {
      0: 'An empty cell counts as 0 in arithmetic, so this divides by zero.',
      1: 'Multiplying by text that isn’t a number is a value of the wrong type.',
      3: 'The formula pointed at C2 by itself; when column C is deleted that reference has nothing left to point at.',
      4: '10^400 is far beyond the largest number Excel can hold (about 1E+308), so the result is an invalid number.',
      6: 'Text in a formula must be in double quotes. Without them Excel looks for names called large and small, finds none, and returns #NAME?.',
    },
    solution: '<x>=E2/F2</x> with F2 empty: #DIV/0!. <x>=C2*D2</x> with text in D2: #VALUE!. <x>=SUMM(F2:F9)</x>: #NAME? (no such function). <x>=SUM(B2,C2,D2)</x> after deleting C: #REF!. <x>=10^400</x>: #NUM! (too large). A failed lookup: #N/A. <x>=IF(B2>50,large,small)</x>: #NAME?, because unquoted text is read as a name.',
  },
  {
    id: 'b03-cf-i2', type: 'formula', kind: 'applied',
    prompt: 'Lantern’s order value by month in spring 2026, with the total in B6. In C2, write a formula for March’s share of the spring total that can be filled down to C5.',
    sheet: { cells: months({ A6: 'Total', B6: '=SUM(B2:B5)', C1: 'Share of total' }) },
    cell: 'C2', fill: 'C2:C5', view: 'A1:C6',
    formats: { B: MONEY, C: '0.0%' }, widths: { B: 14, C: 16 },
    answer: '=B2/$B$6',
    alt: ['=B2/B$6', '=B2/SUM($B$2:$B$5)'],
    wrong: [
      { formula: '=B2/B6', say: 'Filled down, B6 moves to B7, B8 …, which are empty, so C3 to C5 show #DIV/0!. The total must stay put: $B$6.' },
      { formula: '=B2/SUM(B2:B5)', say: 'The range moves when the formula is filled, so April’s share is divided by April to July. Fix the range ($B$2:$B$5) or refer to the total in $B$6.' },
      { formula: '=$B$6/B2', say: 'That is the total divided by the month, upside down. A share is the part divided by the whole.' },
    ],
    solution: `<x>=B2/$B$6</x>, filled down and formatted as a percentage. March: ${money(MONTH_VALUES[0])} ÷ ${money(D.orderValue)} = ${(MONTH_VALUES[0] / D.orderValue * 100).toFixed(1)}%; the four shares add up to 100%. The total’s reference needs the dollar signs (at least on the row, B$6) because every month divides by the same cell.`,
  },
  {
    id: 'b03-cf-i3', type: 'num', kind: 'numerical',
    prompt: 'A $100 platter fee is split over three invoice lines, each <x>=100/3</x> formatted to two decimal places, so each shows $33.33 and the total <x>=SUM(B2:B4)</x> shows $100.00. Ana changes each line to <x>=ROUND(100/3,2)</x>. What does the total show now? Give it to the cent.',
    answer: 99.99, check: () => 3 * Math.round((100 / 3) * 100) / 100, unit: '$', places: 2, tol: 0.001,
    wrong: [{ value: 100, say: 'Before the change the lines stored 33.333…, so they added to 100 even though each showed 33.33. ROUND changes the stored value to 33.33, and three of those make 99.99.' }],
    solution: 'ROUND stores 33.33 in each line, so the total is 3 × 33.33 = $99.99. Now the lines and the total agree; the missing cent is a business decision (add it to one line), not a formatting one.',
  },
  {
    id: 'b03-cf-i4', type: 'formula', kind: 'applied',
    prompt: 'Riverbend Cycles (fictional) prices each service as hours × labour rate + parts. The rate is in B1, which has the name Rate. In D4, write the price of a basic tune-up so that the formula can be filled down to D8. You may use the name or a cell reference.',
    sheet: { cells: riverbend, names: { Rate: 'B1' } },
    cell: 'D4', fill: 'D4:D8', view: 'A1:D8',
    formats: { B1: MONEY, C: MONEY, D: MONEY }, widths: { A: 22, C: 10, D: 10 },
    answer: '=B4*Rate+C4',
    alt: ['=B4*$B$1+C4', '=C4+Rate*B4', '=B4*B$1+C4'],
    wrong: [
      { formula: '=B4*B1+C4', say: 'B1 is relative, so in D5 it becomes B2, which is empty, and the labour charge disappears. Use the name Rate or $B$1.' },
      { formula: '=(B4+C4)*Rate', say: 'That multiplies the parts by the hourly rate too. Only the hours are charged at the rate; parts are added at their price.' },
      { formula: '=B4*Rate', say: 'That is the labour charge only. Add the parts in column C.' },
    ],
    solution: '<x>=B4*Rate+C4</x> (or <x>=B4*$B$1+C4</x>). A full service: 2.5 × $48 + $35 = $155.00. The name reads like the rule, and because a name defined by selecting a cell is an absolute reference, it doesn’t move when the formula is filled.',
  },
  {
    id: 'b03-cf-i5', type: 'mc', kind: 'conceptual',
    prompt: 'Line totals are in F2:F9. In F10, directly below them, Ana types <x>=SUM(F:F)</x>. What happens?',
    options: [
      'Excel warns of a circular reference: F10 is inside F:F.',
      'F10 shows the total of F2:F9, because SUM skips the cell that it sits in.',
      'F10 shows #REF!, because a whole-column reference isn’t allowed in a formula.',
      'F10 shows twice the total, because the total gets added to itself.',
    ],
    answer: 0,
    feedback: {
      1: 'SUM doesn’t skip its own cell: F:F includes F10, so the formula depends on its own result.',
      2: 'Whole-column references such as F:F are allowed; the problem is where the formula sits.',
      3: 'Excel doesn’t keep adding the result to itself: it stops and reports the circular reference.',
    },
    solution: 'A formula that refers to its own cell is a circular reference. Excel warns the first time; afterwards the cell may show 0 or its last calculated value. Put the total outside the column, or use <x>=SUM(F2:F9)</x>.',
  },
  {
    id: 'b03-cf-i6', type: 'order', kind: 'conceptual',
    prompt: 'Put Excel’s operators in the order in which Excel applies them, first to last.',
    items: [
      'Negation, as in <x>=-A1</x>',
      'Percent, <x>%</x>',
      'Exponentiation, <x>^</x>',
      'Multiplication and division, <x>*</x> and <x>/</x>',
      'Addition and subtraction, <x>+</x> and <x>-</x>',
      'Joining text, <x>&</x>',
      'Comparison, such as <x>=</x> and <x>></x>',
    ],
    solution: 'Negation, percent, exponentiation, then multiplication and division, addition and subtraction, joining text with &, and comparison last (Microsoft’s precedence table, after the reference operators). That is why <x>=-2^2</x> is 4 and <x>=A1&B1="LC"</x> joins the text before comparing it.',
  },
];

export const check = [
  {
    id: 'b03-cf-k1', type: 'mc', kind: 'conceptual',
    prompt: 'D4 holds <x>=B$3*$C2</x>. You copy D4 and paste it into F7 (two columns right, three rows down). What does F7 hold?',
    options: ['<x>=D$3*$C5</x>', '<x>=D$6*$E5</x>', '<x>=B$3*$C2</x>', '<x>=B$6*$C5</x>'],
    answer: 0,
    feedback: {
      1: 'The dollar signs fix B$3’s row and $C2’s column; those parts don’t move.',
      2: 'Copying moves the parts without dollar signs; only moving (cut and paste) keeps every reference the same.',
      3: 'The columns move too: B$3 has no $ before its column, so B becomes D.',
    },
    solution: 'B$3: the column moves two to the right (D), the row stays: D$3. $C2: the column stays, the row moves three down: $C5. So F7 holds <x>=D$3*$C5</x>.',
  },
  {
    id: 'b03-cf-k2', type: 'num', kind: 'numerical',
    prompt: 'What does Excel return for <x>=-3^2+20%*10</x>?',
    answer: 11, check: () => (-3) ** 2 + (20 / 100) * 10, unit: '', places: 0, tol: 0.001,
    wrong: [
      { value: -7, say: 'In Excel negation comes before ^, so −3 is squared: 9, not −9.' },
      { value: 209, say: 'The % turns 20 into 0.20 before the multiplication: 0.20 × 10 = 2.' },
    ],
    solution: '(−3)² = 9 because negation comes first; 20% = 0.20 and 0.20 × 10 = 2; 9 + 2 = 11.',
  },
  {
    id: 'b03-cf-k3', type: 'formula', kind: 'applied',
    prompt: 'Lantern’s order value by month. In C2, write a formula for the running total (March; then March and April; and so on) that can be filled down to C5.',
    sheet: { cells: months({ C1: 'Running total' }) },
    cell: 'C2', fill: 'C2:C5', view: 'A1:C5',
    formats: { B: MONEY, C: MONEY }, widths: { B: 14, C: 14 },
    answer: '=SUM($B$2:B2)',
    alt: ['=SUM(B$2:B2)'],
    wrong: [
      { formula: '=SUM(B2:B2)', say: 'Both ends of the range move when it is filled, so each cell adds only its own month. Anchor the start: $B$2:B2.' },
      { formula: '=SUM($B$2:$B$2)', say: 'Both ends are fixed, so every cell shows March. Fix the start and let the end move: $B$2:B2.' },
      { formula: '=SUM($B$2:$B$5)', say: 'That is the spring total in every row, not a running total.' },
    ],
    solution: `<x>=SUM($B$2:B2)</x>. The start of the range is fixed and the end moves, so C3 is <x>=SUM($B$2:B3)</x> and C5 adds all four months: ${money(D.orderValue)}.`,
  },
  {
    id: 'b03-cf-k4', type: 'multi', kind: 'applied',
    prompt: 'Ana is tidying the price-rise worksheet before sending it to Lantern’s accountant. Select all the changes that make it easier to check.',
    options: [
      'Put the rise in one labelled input cell and refer to it with an absolute reference or a name.',
      'Type 1.06 into each price formula so that the rise is visible in the formula.',
      'Add a cell that should show 0 when the rebuilt line totals agree with the recorded totals.',
      'Use the same formula, filled, all the way down each calculation column.',
      'Format the new prices to two decimals instead of rounding them, although the rounded price is what customers will pay.',
    ],
    answer: [0, 2, 3],
    feedback: {
      1: 'A constant inside each formula is invisible in the grid and must be found and changed in every copy when the rise changes.',
      4: 'If the rounded price is what is charged, the stored value should be rounded with ROUND; formatting changes only the display.',
    },
    solution: 'A labelled input referred to absolutely, a check cell that should show 0, and one consistent formula per column all make the sheet easier to check. Hard-coding 1.06 hides the assumption in every cell, and formatting instead of rounding leaves stored values that differ from what customers pay.',
  },
  {
    id: 'b03-cf-k5', type: 'num', kind: 'numerical',
    prompt: 'A1 is formatted to show no decimal places and shows 15; it holds 14.6. What does <x>=A1*2</x> return before any formatting is applied to it?',
    answer: 29.2, check: () => 14.6 * 2, unit: '', places: 1, tol: 0.001,
    wrong: [{ value: 30, say: 'Formulas use the stored value, 14.6, not the displayed 15.' }],
    solution: 'A number format changes only what is shown. The formula uses the stored 14.6, so it returns 29.2 (which would show as 29 if it had the same format).',
  },
  {
    id: 'b03-cf-k6', type: 'formula', kind: 'applied',
    prompt: 'The Blue Heron Inn (fictional) wants a table of room revenue per night: rooms sold down A3:A6, nightly rates across B2:D2. Write one formula in B3 that can be filled across to D3 and down to D6.',
    sheet: { cells: heron },
    cell: 'B3', fill: 'B3:D6', view: 'A1:D6',
    formats: { B2: MONEY, C2: MONEY, D2: MONEY, B: '$#,##0', C: '$#,##0', D: '$#,##0' }, widths: { A: 12 },
    answer: '=$A3*B$2',
    alt: ['=B$2*$A3'],
    wrong: [
      { formula: '=A3*B2', say: 'Both references move: filled right, the rooms reference leaves column A; filled down, the rate reference leaves row 2. Fix the column of one and the row of the other.' },
      { formula: '=$A$3*B$2', say: '$A$3 fixes the row too, so every row uses 20 rooms. Use $A3.' },
      { formula: '=A$3*$B2', say: 'The dollar signs are on the wrong parts: rooms run down column A ($A3) and rates along row 2 (B$2).' },
    ],
    solution: '<x>=$A3*B$2</x>: $A3 always reads the rooms in column A on the cell’s own row, and B$2 the rate in row 2 in the cell’s own column. In D6 it becomes <x>=$A6*D$2</x> = 35 × $140 = $4,900.',
  },
];
