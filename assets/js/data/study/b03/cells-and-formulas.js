// cells-and-formulas.js — B03 · Cells, references and formulas. Content only; exercises are in
// cells-and-formulas.ex.js. Lantern's orders and prices come from case.js (ORDERS, PRODUCTS, DERIVED); the price-rise
// sheet, the two-way price table and Riverbend Cycles are fictional and labelled. Real-world claims (Excel's behaviour,
// Panko's spreadsheet-error research, the Reinhart–Rogoff spreadsheet) are cited in `references`.
import { ORDERS, ORDER_COLUMNS, PRODUCTS, DERIVED as D } from './case.js';

const col = (name) => ORDER_COLUMNS.indexOf(name);
const order = (i) => Object.fromEntries(ORDER_COLUMNS.map((c, k) => [c, ORDERS[i][k]]));
const first = [0, 1, 2, 3, 4].map(order);                     // LC-10001 … LC-10005
const ten = Array.from({ length: 10 }, (_, i) => order(i));  // LC-10001 … LC-10010
const price = (p) => PRODUCTS.find((x) => x[0] === p)[3];
const r2 = (x) => Math.round(x * 100) / 100;
const sum = (a) => a.reduce((s, x) => s + x, 0);
const gross10 = sum(ten.map((o) => o.quantity * o.unit_price));                 // 423.00
const RISES = [0.04, 0.06, 0.10];
const TABLE_PRODUCTS = ['House Blend 250g', 'Colombia Huila 250g', 'Ethiopia Yirgacheffe 250g', 'Espresso Roast 1kg'];
const cellOf = (p, r) => r2(price(p) * (1 + r));
const money = (x) => `$${x.toFixed(2)}`;

export default {
  slug: 'cells-and-formulas',
  title: 'Cells, references and formulas',
  blurb: 'A spreadsheet is only as trustworthy as its formulas. Learn how Excel reads a formula, how references move when a formula is filled or copied, why a number can look rounded without being rounded, what each error value means, and how to lay out a worksheet that someone else can check.',
  status: 'draft',
  objectives: [
    'Identify cells, ranges and references in a worksheet, and distinguish a typed value from a formula.',
    'Calculate what a formula returns using Excel’s order of operations, including negation and the percent sign.',
    'Build formulas with relative, absolute and mixed references that stay right when filled down and across.',
    'Explain the difference between a cell’s displayed value and its stored value, and decide when to round with ROUND.',
    'Diagnose the common error values and trace a formula’s precedents and dependents.',
    'Design a worksheet whose inputs are labelled and kept apart from its calculations, so that it can be checked.',
  ],
  prerequisites: [
    { lesson: 'b02/types-and-formats', why: 'Numbers stored as text and serial dates behave differently in formulas; this lesson assumes you can recognise them.' },
    { lesson: 'b01/summarising-data', why: 'Totals, averages and shares of a total are what the formulas here calculate.' },
    { text: 'Arithmetic with percentages: a 6% rise on $14.00 is 14 × 1.06 = $14.84.' },
  ],
  case: 'lantern',

  concept: [
    { case: `Ana Lim has B02’s cleaned export of Lantern’s spring orders: ${D.orders} orders placed between 1 March and 30 June 2026, worth $9,096.15 in all. Before she builds anything on it she wants two things. First, every order’s value rebuilt from its parts (quantity times unit price, less any discount) and compared with the <code>order_total</code> the shop recorded. Second, a quick look at what a price rise in July would have done to those orders. Both are jobs for formulas: a few typed once, then filled down hundreds of rows.` },

    { h: 'The grid' },
    { p: 'An Excel file is a <b>workbook</b>, and each tab in it is a worksheet: a grid of columns lettered A, B, C … and rows numbered 1, 2, 3 …. Where a column and a row cross is a cell, and its address, the column letter followed by the row number, is its <g>cell reference</g>: F2 is the cell in column F, row 2. After Z the column letters double (AA, AB …) and then triple. Microsoft’s published limit is 1,048,576 rows by 16,384 columns per worksheet, so the last column is XFD. Lantern’s orders fill a sliver of that.' },
    { p: 'A <g>cell range</g> is a rectangle of cells, written as its top-left and bottom-right cells joined by a colon: <x>B2:B232</x> is column B from row 2 to row 232, and <x>B2:D9</x> is three columns by eight rows, 24 cells. A whole column is written with its letter twice, <x>F:F</x>. Microsoft calls the colon the range operator. A comma joins references into one list, as in <x>=SUM(B2:B9,D2:D9)</x>, and a single space gives only the cells two references share, so <x>=SUM(B7:D7 C6:C8)</x> adds C7 alone; you will rarely need that one.' },

    { h: 'Values and formulas' },
    { p: 'A cell holds either a value or a formula. A <b>value</b> is what you type: a number (14), text (House Blend 250g), a date, which Excel stores as a <g>serial date</g>, or one of the logical values TRUE and FALSE. A <g>formula</g> starts with an equals sign and calculates. Type <x>=G2*H2-I2</x> into a cell and the cell shows the result while the formula bar above the grid shows the formula. When G2, H2 or I2 changes, the result changes with it: that is the point of a spreadsheet, and it works only if the formula refers to the cells that hold the inputs.' },
    { p: `In Lantern’s order sheet, column G holds <code>quantity</code>, H <code>unit_price</code> and I <code>discount</code>. The first order, LC-10001, was ${first[0].quantity} Gift Box Trios at ${money(first[0].unit_price)} with a ${money(first[0].discount)} promotion code, so <x>=G2*H2-I2</x> returns <m>${first[0].quantity} \\times ${first[0].unit_price} - ${first[0].discount} = ${first[0].order_total}</m>, the $111.00 the shop recorded.` },
    { p: 'A number typed inside a formula, such as the 0.1 in <x>=G2*H2*0.1</x>, is a <b>constant</b>. It is invisible in the grid, it doesn’t change when the inputs do, and whoever revises the sheet next year has to find every copy of it. Most of the advice on worksheet design at the end of this lesson follows from that.' },

    { h: 'How Excel reads a formula' },
    { p: 'A formula combines references, constants, functions (the next lesson) and operators. The arithmetic operators are <x>+</x> (add), <x>-</x> (subtract, or negate a single number), <x>*</x> (multiply), <x>/</x> (divide), <x>^</x> (raise to a power) and <x>%</x> (percent). The comparison operators return TRUE or FALSE, and <x>&</x> joins text. When a formula has several operators, Excel doesn’t work strictly from left to right. It follows an order of precedence, which Microsoft publishes:' },
    { table: {
      caption: 'Excel’s order of operations, first to last (Microsoft)',
      head: ['Order', 'Operator', 'Meaning'],
      align: ['r', 'l', 'l'],
      rows: [
        ['1', '<x>:</x> (colon), a single space, <x>,</x> (comma)', 'Reference operators: range, intersection, union'],
        ['2', '<x>-</x>', 'Negation, as in −1'],
        ['3', '<x>%</x>', 'Percent'],
        ['4', '<x>^</x>', 'Exponentiation'],
        ['5', '<x>*</x> and <x>/</x>', 'Multiplication and division'],
        ['6', '<x>+</x> and <x>-</x>', 'Addition and subtraction'],
        ['7', '<x>&</x>', 'Joining two pieces of text'],
        ['8', '<x>= < > <= >= <></x>', 'Comparison'],
      ],
    } },
    { p: 'Operators on the same level are worked from left to right, so <x>=20/4*2</x> is 10, not 2.5, and <x>=2^3^2</x> is <m>(2^3)^2 = 64</m>, where a mathematician would read <m>2^{3^2} = 512</m>. Parentheses override everything. Microsoft’s own example is <x>=5+2*3</x>, which gives 11, against <x>=(5+2)*3</x>, which gives 21.' },
    { p: `Two rows of the table surprise people. Negation comes before exponentiation, so <x>=-2^2</x> squares −2 and returns 4; write <x>=-(2^2)</x> or <x>=0-2^2</x> if you mean −4. Percent divides only the number it follows by 100, before any multiplying or adding, so <x>=5+10%</x> is 5.1, not 5.5. In Lantern’s line total, multiplication comes before subtraction, so <x>=G2*H2-I2</x> takes the discount off the order once. <x>=G2*(H2-I2)</x> would take it off every bag, and turn LC-10001’s $111.00 into <m>${first[0].quantity} \\times (${first[0].unit_price} - ${first[0].discount}) = ${first[0].quantity * (first[0].unit_price - first[0].discount)}</m>.` },
    { p: 'Excel also converts values when an operator needs another type. Microsoft’s examples: <x>="1"+"2"</x> returns 3, because text that looks like a number is converted, and <x>=1+"$4.00"</x> returns 5; but <x>=SQRT("8+1")</x> returns #VALUE!, because “8+1” isn’t a number in any format Excel accepts. Relying on these conversions is fragile, and B02’s rule still applies: convert deliberately and check.' },
    { callout: 'key', title: 'Read a formula aloud before you trust it', html: 'Say what each part does in words: “quantity times unit price, then minus the discount”. If the words don’t match the formula, add parentheses until they do. Parentheses that change nothing still make a formula easier to check.' },
    { figure: {
      svg: '<svg viewBox="0 0 660 250" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor"><defs><marker id="cf-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--series-1)"/></marker><marker id="cf-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--series-2)"/></marker></defs><text x="10" y="18" font-weight="600">(a) Filled down: relative references move, absolute ones stay</text><g stroke="var(--rule-strong)" fill="none"><rect x="10" y="30" width="24" height="24"/><rect x="34" y="30" width="70" height="24"/><rect x="104" y="30" width="60" height="24"/><rect x="164" y="30" width="140" height="24"/><rect x="10" y="54" width="24" height="24"/><rect x="34" y="54" width="70" height="24"/><rect x="104" y="54" width="60" height="24"/><rect x="164" y="54" width="140" height="24"/><rect x="10" y="78" width="24" height="24"/><rect x="34" y="78" width="70" height="24"/><rect x="104" y="78" width="60" height="24"/><rect x="164" y="78" width="140" height="24"/><rect x="10" y="102" width="24" height="24"/><rect x="34" y="102" width="70" height="24"/><rect x="104" y="102" width="60" height="24"/><rect x="164" y="102" width="140" height="24"/><rect x="10" y="126" width="24" height="24"/><rect x="34" y="126" width="70" height="24"/><rect x="104" y="126" width="60" height="24"/><rect x="164" y="126" width="140" height="24"/></g><g fill="var(--ink-3)" text-anchor="middle"><text x="69" y="46">A</text><text x="134" y="46">B</text><text x="234" y="46">C</text><text x="22" y="70">1</text><text x="22" y="94">2</text><text x="22" y="118">3</text><text x="22" y="142">4</text></g><text x="40" y="70">Price</text><text x="110" y="70">6%</text><text x="170" y="70">New price</text><text x="98" y="94" text-anchor="end">14.00</text><text x="98" y="118" text-anchor="end">17.00</text><text x="98" y="142" text-anchor="end">19.50</text><g font-family="ui-monospace, Menlo, Consolas, monospace"><text x="170" y="94">=A2*(1+$B$1)</text><text x="170" y="118">=A3*(1+$B$1)</text><text x="170" y="142">=A4*(1+$B$1)</text></g><path d="M166 114 L106 114" stroke="var(--series-1)" stroke-width="2" fill="none" marker-end="url(#cf-ar1)"/><path d="M168 110 C150 95 140 90 136 80" stroke="var(--series-2)" stroke-width="2" fill="none" stroke-dasharray="5 3" marker-end="url(#cf-ar2)"/><text x="10" y="176" fill="var(--series-1)">A3 moved with the row</text><text x="10" y="194" fill="var(--series-2)">$B$1 stayed on the rise</text><text x="360" y="18" font-weight="600">(b) A two-way table: mixed references</text><g stroke="var(--rule-strong)" fill="none"><rect x="360" y="30" width="24" height="24"/><rect x="384" y="30" width="96" height="24"/><rect x="480" y="30" width="58" height="24"/><rect x="538" y="30" width="58" height="24"/><rect x="596" y="30" width="58" height="24"/><rect x="360" y="54" width="24" height="24"/><rect x="384" y="54" width="96" height="24"/><rect x="480" y="54" width="58" height="24"/><rect x="538" y="54" width="58" height="24"/><rect x="596" y="54" width="58" height="24"/><rect x="360" y="78" width="24" height="24"/><rect x="384" y="78" width="96" height="24"/><rect x="480" y="78" width="58" height="24"/><rect x="538" y="78" width="58" height="24"/><rect x="596" y="78" width="58" height="24"/><rect x="360" y="102" width="24" height="24"/><rect x="384" y="102" width="96" height="24"/><rect x="480" y="102" width="58" height="24"/><rect x="538" y="102" width="58" height="24"/><rect x="596" y="102" width="58" height="24"/></g><rect x="596" y="102" width="58" height="24" fill="none" stroke="var(--ink)" stroke-width="2.5"/><g fill="var(--ink-3)" text-anchor="middle"><text x="432" y="46">A</text><text x="509" y="46">B</text><text x="567" y="46">C</text><text x="625" y="46">D</text><text x="372" y="70">2</text><text x="372" y="94">3</text><text x="372" y="118">4</text></g><text x="486" y="70">Price</text><text x="567" y="70" text-anchor="middle">4%</text><text x="625" y="70" text-anchor="middle">6%</text><text x="390" y="94">House Blend</text><text x="390" y="118">Colombia</text><text x="532" y="94" text-anchor="end">14.00</text><text x="532" y="118" text-anchor="end">17.00</text><path d="M598 114 L540 114" stroke="var(--series-1)" stroke-width="2" fill="none" marker-end="url(#cf-ar1)"/><path d="M625 104 L625 80" stroke="var(--series-2)" stroke-width="2" fill="none" stroke-dasharray="5 3" marker-end="url(#cf-ar2)"/><text x="360" y="152" font-family="ui-monospace, Menlo, Consolas, monospace">D4: =$B4*(1+D$2)</text><text x="360" y="176" fill="var(--series-1)">$B4: column B fixed, row moves</text><text x="360" y="194" fill="var(--series-2)">D$2: row 2 fixed, column moves</text><text x="360" y="220" fill="var(--ink-3)">Typed once in C3, filled across and down</text></svg>',
      caption: 'How references behave when a formula is filled. (a) A price-rise formula filled down column C: the relative reference to the price moves with each row, while the absolute reference $B$1 keeps pointing at the rise. (b) In a two-way table, $B4 keeps the column of prices and D$2 keeps the row of rises, so one formula serves every cell.',
      alt: 'Two small worksheet diagrams. Left: column A holds prices 14.00, 17.00 and 19.50 in rows 2 to 4, cell B1 holds 6%, and column C holds the formulas =A2*(1+$B$1), =A3*(1+$B$1) and =A4*(1+$B$1). From the formula in C3 one solid arrow points left to A3, labelled “A3 moved with the row”, and a dashed arrow points up to B1, labelled “$B$1 stayed on the rise”. Right: a table with products in column A, prices in column B, rises of 4% and 6% across row 2 in columns C and D, and cell D4 outlined. D4 holds =$B4*(1+D$2); a solid arrow runs from D4 left to the price in B4, labelled “column B fixed, row moves”, and a dashed arrow runs up to the 6% in D2, labelled “row 2 fixed, column moves”. A note says the formula was typed once in C3 and filled across and down.',
    } },
  ],

  theory: [
    { h: 'Relative, absolute and mixed references' },
    { p: 'When a formula is filled or copied to another cell, Excel adjusts its references. By default a reference is a <g>relative reference</g>: it means “the cell so many rows and columns away from this one”. The formula <x>=G2*H2-I2</x> in K2 really says “this row’s quantity times this row’s price, less this row’s discount”, so filled down to K3 it becomes <x>=G3*H3-I3</x>, and so on to row 232. That is exactly right for a calculation repeated on every row.' },
    { p: 'It is exactly wrong for an input that every row shares. Suppose P1 holds a planned price rise of 6% and L2 holds <x>=H2*(1+P1)</x>. Filled down, L3 becomes <x>=H3*(1+P2)</x>; P2 is empty, an empty cell counts as 0 in arithmetic, and every row after the first quietly shows today’s price.' },
    { p: 'A dollar sign fixes the part of a reference it stands in front of. An <g>absolute reference</g> fixes both, <x>$P$1</x>, and <x>=H2*(1+$P$1)</x> fills down correctly. A <g>mixed reference</g> fixes one part: <x>$P1</x> keeps the column, <x>P$1</x> keeps the row.' },
    { table: {
      caption: 'A reference in a formula copied two rows down and two columns to the right (Microsoft’s example)',
      head: ['Reference', 'Becomes', 'Type'],
      rows: [
        ['<x>$A$1</x>', '<x>$A$1</x>', 'Absolute: nothing moves'],
        ['<x>A$1</x>', '<x>C$1</x>', 'Mixed: the column moves, the row stays'],
        ['<x>$A1</x>', '<x>$A3</x>', 'Mixed: the row moves, the column stays'],
        ['<x>A1</x>', '<x>C3</x>', 'Relative: both move'],
      ],
    } },
    { p: 'You don’t have to type the dollar signs. In Windows Excel, put the cursor in a reference in the formula bar and press F4 to cycle through the combinations of absolute and relative; on a Mac, press Command+T (<a href="https://support.microsoft.com/en-us/excel/switch-between-relative-and-absolute-references">Microsoft’s Mac page</a>). The question to ask of every reference is: when this formula is copied, which part of this address should move?' },
    { p: 'Mixed references earn their keep in two-way tables. To show four products’ prices after rises of 4%, 6% and 10%, put the prices down column B (B3:B6) and the rises across row 2 (C2:E2). Every cell needs “this row’s price, in column B” and “this column’s rise, in row 2”, so the formula in C3 is <x>=$B3*(1+C$2)</x>. Filled across and down it fills all twelve cells correctly; the challenging example works it through.' },

    { h: 'Filling, copying and moving' },
    { p: 'The fill handle is the small square at the bottom-right corner of the selected cell: drag it down or across and Excel copies the formula into each cell it passes, adjusting relative references as it goes. Ctrl+D fills the top cell of a selection down, and Ctrl+R fills the left-hand cell right; on a Mac, Control+D and Control+R do the same (<a href="https://support.microsoft.com/en-us/excel/copy-a-formula-by-dragging-the-fill-handle-in-excel-for-mac">Microsoft’s Mac page</a>). Copying and pasting adjusts references in the same way. Moving a formula, by cutting and pasting it or dragging its cell, does not: Microsoft notes that the references stay the same whatever their type.' },
    { p: 'A column of calculations should hold one formula, filled. Show Formulas (below) makes this easy to check, because every cell in the column should then read the same apart from its row numbers. A cell that differs, such as a typed-in number among formulas or a formula pointing at the wrong row, is one of the commonest signs of a spreadsheet error, and the applied example finds one.' },

    { h: 'Ranges and whole-column references' },
    { p: 'Functions work on ranges: <x>=SUM(J2:J232)</x> adds the 231 order totals. If Ana pastes July’s orders below row 232, that range doesn’t grow; a whole-column reference such as <x>=SUM(J:J)</x> does, and SUM skips the text heading in J1.' },
    { p: 'But a whole column includes everything in it. Put that total in J234 and the formula refers to its own cell, a circular reference. Microsoft also advises against whole columns in heavy functions such as SUMPRODUCT, which then multiply every cell in the column, empty ones included. Excel tables, whose references grow with the data, are the better answer; they come in the tables-and-cleaning lesson.' },

    { h: 'What a cell shows and what it stores' },
    { p: 'A number format changes how a value looks, not the value. Format 2.345 to two decimal places and the cell shows 2.35, but every formula that uses it still gets 2.345. Usually that is what you want: carry full precision and round only what you report.' },
    { p: 'It goes wrong when the rounded figure is the real one. Split a $100 platter fee into three invoice lines with <x>=100/3</x>: each line shows $33.33, the total <x>=SUM(B2:B4)</x> shows $100.00, and a client who adds the lines gets $99.99. If each line is what is actually charged, round it. <x>=ROUND(100/3,2)</x> stores 33.33, and then the lines and the total agree, at $99.99; whether the missing cent goes on one line is a business decision, not a formatting one.' },
    { p: 'Underneath, Excel stores numbers in binary to 15 significant digits of precision. Most decimal fractions, 0.1 among them, have no exact binary form, so tiny errors appear far to the right of the decimal point. Microsoft’s example: <x>=(43.1-43.2)+1</x>, formatted to 15 decimal places, shows 0.899999999999999 rather than 0.9. Since Excel 97, when an addition or subtraction gives a result at or very close to zero, Excel compensates for the conversion error, so Microsoft’s <x>=1.333+1.225-1.333-1.225</x> shows 0 where Excel 95 showed −2.22044604925031E−16.' },
    { p: 'You may also meet <x>=0.1+0.2=0.3</x>. In binary, 0.1 + 0.2 is not exactly 0.3, yet Excel shows TRUE, and so do the worksheets on this site, which compare numbers to 15 significant digits. Microsoft doesn’t document the exact rule its comparisons follow, so don’t build a model on the exact equality of calculated decimals: compare rounded values, <x>=ROUND(A2,2)=ROUND(B2,2)</x>, or test the size of the difference, <x>=ABS(A2-B2)<0.005</x>. Microsoft also offers a workbook option, Set precision as displayed, which permanently cuts every stored value down to its displayed format. It can’t be undone; leave it alone.' },

    { h: 'Error values' },
    { p: 'When a formula can’t produce a result it returns an <g>error value</g>, which names what went wrong. Learn to read them rather than hide them.' },
    { table: {
      caption: 'The common error values, from Microsoft’s troubleshooting pages',
      head: ['Error', 'What it means', 'A typical cause', 'The fix'],
      rows: [
        ['#DIV/0!', 'A number divided by zero', '<x>=J2/K2</x> where K2 is 0 or blank', 'Check the divisor; if zero is legitimate, test for it with IF'],
        ['#VALUE!', 'A value of the wrong type', '<x>=G2*H2</x> where H2 holds text such as “TBC”, or a space that makes it look empty', 'Clean the input; functions such as SUM skip text that operators can’t'],
        ['#NAME?', 'Excel doesn’t recognise a name', '<x>=SUMM(J2:J9)</x>; text without quotation marks; <x>=SUM(B2B9)</x>, missing its colon', 'Correct the spelling; put text in double quotes'],
        ['#REF!', 'A reference that is no longer valid', 'Deleting column C under <x>=SUM(B2,C2,D2)</x>, which becomes <x>=SUM(B2,#REF!,C2)</x>', 'Undo; refer to ranges such as <x>=SUM(B2:D2)</x>, which adjust'],
        ['#N/A', 'A value is not available', 'A lookup that can’t find its key (Module 2)', 'Check the key; handle genuine gaps deliberately'],
        ['#NUM!', 'An invalid number', 'A result too large to show, such as <x>=10^400</x>; a function such as IRR that finds no answer', 'Check the inputs'],
      ],
    } },
    { p: 'One more, #SPILL!, belongs to the dynamic-array functions in the tables-and-cleaning lesson. Error values are useful because they are loud. A formula that quietly returns a wrong number is far more dangerous than one that returns #REF!.' },

    { h: 'Tracing a formula' },
    { p: 'Three tools on the Formulas tab show how a sheet is wired. <b>Show Formulas</b> switches every cell between its result and its formula (Ctrl+`, the grave-accent key, in Windows; Control+` on a Mac, as Microsoft’s <a href="https://support.microsoft.com/office/keyboard-shortcuts-in-excel-1798d9d5-842a-42b8-9c99-9b7213f0040f">keyboard shortcuts page</a> lists), which is the fastest way to spot the odd formula out in a column. <b>Trace Precedents</b> and <b>Trace Dependents</b>, in the Formula Auditing group, draw arrows from the cells a formula uses (its precedents) and to the formulas that use a cell (its dependents). The arrows are blue for cells without errors and red for cells that cause errors, and Remove Arrows clears them.' },
    { p: '<b>Evaluate Formula</b>, in the same group, works through one cell’s formula a step at a time. <a href="https://support.microsoft.com/en-us/excel/evaluate-a-nested-formula-one-step-at-a-time">Microsoft’s example</a> is <x>=IF(AVERAGE(F2:F5)>50,SUM(G2:G5),0)</x> with 55, 35, 45 and 25 in F2:F5. The first step replaces the average with 40; the next turns <x>40>50</x> into FALSE; and the formula returns 0 without ever calculating the SUM. Stepping through like this shows exactly where a long formula stops doing what you meant.' },
    { p: 'A <g>circular reference</g> is a formula that refers to its own cell, directly or through other formulas. Excel <a href="https://support.microsoft.com/en-US/excel/remove-or-allow-a-circular-reference-in-excel">warns the first time one appears</a>, and the cell may then show 0 or its last calculated value; Formulas > Error Checking > Circular References, and the status bar, show where it is. It is almost always a mistake, such as a total inside the range it adds. Excel can be told to allow it (File > Options > Formulas > Enable iterative calculation, after which it recalculates up to 100 times by default, or until values change by less than 0.001), but a model that needs that should say so in large letters.' },

    { h: 'Designing a worksheet someone else can check' },
    { list: [
      '<b>Keep inputs apart and labelled.</b> Every assumption (the price rise, the subscription discount, a fee rate) goes in its own cell, with a label, a unit and a source, such as “Price rise from 1 July, % of current price (Ana’s plan)”.',
      '<b>Don’t hard-code numbers in formulas.</b> Refer to the input cell with an absolute reference or a name. Constants that can never change, such as 12 months in a year, are the exception.',
      '<b>One formula per column, filled.</b> Consistent formulas can be checked by checking one of them.',
      '<b>Separate data, calculations and results.</b> The raw data stays untouched, as B02 insisted; calculations come next and results last, so a reader can follow the flow.',
      '<b>Build in checks.</b> A cell that should show zero when the sheet is right, such as the rebuilt line totals minus the recorded order totals, catches errors you weren’t looking for.',
      '<b>Name the key inputs</b>, so that formulas read like the business rule.',
    ] },
    { p: 'A <g>defined name</g> labels a cell or range so that formulas can use the label. Select P1, type Rise in the Name Box to the left of the formula bar and press Enter, and <x>=H2*(1+Rise)</x> reads like the rule it implements. Formulas > Name Manager lists, edits and deletes names, and Formulas > Create from Selection names cells from the labels beside them. According to <a href="https://support.microsoft.com/en-US/Excel/use-the-name-manager-in-excel">Microsoft’s Name Manager page</a>, a name can be up to 255 characters long and applies to the whole workbook unless you choose otherwise. When you define a name by selecting cells, Excel stores an absolute reference such as <x>Sheet1!$P$1</x>, so the name doesn’t move when a formula is filled.' },

    { h: 'Why it matters: spreadsheet errors are normal' },
    { p: 'Spreadsheet errors are not rare accidents. Raymond Panko’s review of the research reported that the field audits from 1997 onward found errors in at least 86% of the spreadsheets audited, and that across development experiments 51% of the spreadsheets participants built contained errors. People don’t see their own: in one experiment the developers’ median estimate of the chance that their spreadsheet held an error was 10%, yet 86% of them had made one. The only technique Panko found demonstrated to work was code inspection, a group checking a spreadsheet cell by cell, and he notes that even this catches only about 80% of errors.' },
    { p: 'The best-known case is economic. In 2010 Carmen Reinhart and Kenneth Rogoff reported that countries with public debt above 90% of GDP grew more slowly. Replicating their work in 2013, Thomas Herndon, Michael Ash and Robert Pollin found that the working spreadsheet averaged rows 30 to 44 instead of rows 30 to 49, which left Australia, Austria, Belgium, Canada and Denmark out of the calculation. With that error, and with data the paper had excluded and an unusual weighting corrected as well, average growth for the high-debt countries went from the published −0.1% to 2.2%. A range that stopped five rows short became part of a policy debate.' },
  ],

  formulas: [
    { id: 'line-total', name: 'Order line total',
      tex: String.raw`T = q \times p - d`,
      where: [
        [String.raw`T`, 'The order’s value after its discount', '$'],
        [String.raw`q`, 'Quantity: the number of items ordered', 'items'],
        [String.raw`p`, 'Unit price: the shop price of one item', '$ per item'],
        [String.raw`d`, 'Discount on the whole order', '$'],
      ],
      assumptions: 'The discount is recorded in dollars for the whole order, as in Lantern’s export.',
      note: 'In Excel, with quantity in G2, unit price in H2 and discount in I2: <x>=G2*H2-I2</x>, filled down.' },
    { id: 'price-rise', name: 'Price after a percentage rise',
      tex: String.raw`p_{\text{new}} = p \times (1 + r)`,
      where: [
        [String.raw`p_{\text{new}}`, 'The price after the rise', '$'],
        [String.raw`p`, 'The current price', '$'],
        [String.raw`r`, 'The rise as a decimal (6% is 0.06)', ''],
      ],
      assumptions: 'One rise applies to every product.',
      note: 'With the rise in an input cell P1: <x>=H2*(1+$P$1)</x>. The dollar signs keep every filled copy pointing at P1.' },
    { id: 'share-of-total', name: 'Share of a total',
      tex: String.raw`s_i = \dfrac{x_i}{\sum_j x_j}`,
      where: [
        [String.raw`s_i`, 'The share of item i', ''],
        [String.raw`x_i`, 'The value of item i, such as one month’s order value', '$'],
        [String.raw`\sum_j x_j`, 'The total of all the items', '$'],
      ],
      note: 'With values in B2:B5 and their total in B6: <x>=B2/$B$6</x>, filled down and formatted as a percentage.' },
  ],

  examples: [
    { level: 'simple', title: 'Rebuilding the first order values', fictional: true,
      setup: 'Columns G to J of Lantern’s order sheet hold the first five orders’ quantity, unit price, discount and recorded order total. Write one formula in K2 for the line total, fill it down to K6, and check it against column J.',
      table: {
        caption: 'Lantern’s first five orders (columns A to F not shown)',
        head: ['Row', 'G: quantity', 'H: unit_price', 'I: discount', 'J: order_total', 'K: line total'],
        align: ['r', 'r', 'r', 'r', 'r', 'l'],
        rows: first.map((o, i) => [String(i + 2), String(o.quantity), money(o.unit_price), money(o.discount), money(o.order_total), `<x>=G${i + 2}*H${i + 2}-I${i + 2}</x>`]),
      },
      steps: [
        `Translate the rule into references: quantity × unit price − discount is <x>=G2*H2-I2</x>. Multiplication comes before subtraction, so K2 returns <m>${first[0].quantity} \\times ${first[0].unit_price} - ${first[0].discount} = ${first[0].order_total}</m>.`,
        `Fill K2 down to K6. The references are relative, so each copy reads its own row: K3 is <x>=G3*H3-I3</x>, giving <m>${first[1].quantity} \\times ${first[1].unit_price} - ${first[1].discount} = ${first[1].order_total.toFixed(2)}</m>, and K4 to K6 give ${money(first[2].order_total)}, ${money(first[3].order_total)} and ${money(first[4].order_total)}.`,
        'Check rather than eyeball: in L2 type <x>=K2-J2</x> and fill it down. Every cell shows 0, so the rebuilt values match the recorded ones.',
        `Notice what the parentheses would change. <x>=G2*(H2-I2)</x> takes the discount off each bag: <m>${first[0].quantity} \\times (${first[0].unit_price} - ${first[0].discount}) = ${first[0].quantity * (first[0].unit_price - first[0].discount)}</m> instead of ${first[0].order_total}.`,
      ],
      answer: `K2 holds <x>=G2*H2-I2</x>; filled to K6 it returns ${first.map((o) => money(o.order_total)).join(', ')}, the same as order_total in every row.`,
      interpretation: 'The recorded totals agree with their parts. Filled down all 231 rows, the same formula and check column confirm that every order total in B02’s cleaned data equals quantity × unit price − discount, so the totals can be trusted in everything that follows.' },
    { level: 'challenging', title: 'A price-rise table with mixed references', fictional: true,
      setup: 'Ana wants a small table of new prices for four products under three possible rises. The current prices are in B3:B6 and the rises (4%, 6% and 10%) in C2:E2. Write one formula in C3 that can be filled across to E3 and down to E6.',
      table: {
        caption: 'The finished table (C3:E6 all hold the formula typed in C3, filled)',
        head: ['Row', 'A: product', 'B: price', 'C: 4%', 'D: 6%', 'E: 10%'],
        align: ['r', 'l', 'r', 'r', 'r', 'r'],
        rows: TABLE_PRODUCTS.map((p, i) => [String(i + 3), p, money(price(p)), ...RISES.map((r) => money(cellOf(p, r)))]),
      },
      steps: [
        'Decide what each cell needs. Every cell multiplies a price by one plus a rise. The price is always in column B, on the cell’s own row; the rise is always in row 2, in the cell’s own column.',
        'Fix only what must stay fixed. The price needs a fixed column and a moving row: <x>$B3</x>. The rise needs a fixed row and a moving column: <x>C$2</x>. So C3 holds <x>=$B3*(1+C$2)</x>.',
        `Check one filled copy. In D5 the formula becomes <x>=$B5*(1+D$2)</x>: the price of ${TABLE_PRODUCTS[2]}, ${money(price(TABLE_PRODUCTS[2]))}, times 1.06, which is <m>19.50 \\times 1.06 = ${cellOf(TABLE_PRODUCTS[2], 0.06).toFixed(2)}</m>.`,
        `See what the alternatives do. All relative, <x>=B3*(1+C2)</x>, filled right to D3 becomes <x>=C3*(1+D2)</x>: it raises the already-raised price again, <m>14.56 \\times 1.06 \\approx ${(cellOf(TABLE_PRODUCTS[0], 0.04) * 1.06).toFixed(2)}</m>. With <x>$B$3</x> every row would show House Blend’s prices, and with <x>$C$2</x> every column would use 4%.`,
      ],
      answer: 'The formula is <x>=$B3*(1+C$2)</x>, filled across and down; the table shows the twelve new prices.',
      interpretation: 'One formula serves the whole table, so checking one cell checks all of them, and changing a rise in row 2 updates its whole column. A 10% rise takes the House Blend 250g from $14.00 to $15.40, a figure Ana can now set against what customers have been paying.' },
    { level: 'applied', title: 'Finding the stale number in a price-rise sheet', fictional: true,
      setup: `A colleague built a sheet to show what Lantern’s first ten orders would have been worth, before discounts, after a price rise. B1 holds the rise, now 6%; rows 4 to 13 hold the orders’ quantity (C) and unit price (D); column F holds the value at new prices, and F14 their total, $447.80. Ana’s quick check is the current gross value, ${money(gross10)}, times 1.06, which is ${money(r2(gross10 * 1.06))}. The two don’t agree. Find out why and fix the sheet.`,
      steps: [
        `Measure the gap: <m>${r2(gross10 * 1.06).toFixed(2)} - 447.80 = ${r2(r2(gross10 * 1.06) - 447.80).toFixed(2)}</m>. A gap of 58 cents on a $58.00 Gift Box Trio would be 1% of its price, which hints at one row using a different rise.`,
        'Press Ctrl+` (Show Formulas). Column F reads <x>=C4*D4*(1+$B$1)</x>, <x>=C5*D5*(1+$B$1)</x> and so on, except F10, which reads <x>=C10*D10*1.05</x>: someone typed the old 5% rise into that cell, and it never followed B1 when the rise changed.',
        'Confirm with the auditing arrows. Trace Precedents on F10 draws arrows from C10 and D10 only; every other cell in the column also has an arrow from B1.',
        'Fix it by filling the formula from F4 down over F10, so the column is consistent again. F14 now shows $448.38. Then add a check: G14 holds <x>=F14-SUMPRODUCT(C4:C13,D4:D13)*(1+$B$1)</x>, which should always show 0 (SUMPRODUCT, which multiplies the two columns pair by pair and adds the products, comes two lessons on).',
      ],
      answer: `F10 held a hard-coded 1.05. With the formula restored, the ten orders’ gross value at a 6% rise is ${money(r2(gross10 * 1.06))}, ${money(r2(gross10 * 0.06))} more than the ${money(gross10)} at current prices.`,
      interpretation: 'The error was 58 cents here, but it was invisible in the values, it would have changed with every new rise, and on 231 orders a few such cells would distort the result Ana uses to decide on the rise. Consistent formulas, an input that every formula refers to, and a check cell would each have caught it.' },
  ],

  demo: [
    { widget: 'cf-lines', intro: 'Lantern’s first eight orders. Type <x>=B2*C2-D2</x> in F2 and press Enter, then select F2 and choose Fill down. Turn on Show formulas to see how the references moved. Type <x>=F2-E2</x> in G2 and fill it down: every difference should be 0. Then try <x>=B2*(C2-D2)</x> in F2 and see which rows change, and why.' },
    { widget: 'cf-table', intro: 'A two-way price table: prices in column B, rises across row 1. Type <x>=B2*(1+C1)</x> in C2, fill it down, then fill each row right, and watch the numbers go wrong. Then put the dollar signs where they belong, <x>=$B2*(1+C$1)</x>, fill again and compare. Change a rise in row 1: its whole column should update.' },
  ],

  mistakes: [
    { title: '“Copying a formula copies the same calculation.”', html: 'Copying copies the pattern, not the cells. Relative references move with the copy, which is right for row-by-row data and wrong for a shared input. Before you fill, ask of every reference which part should move, and put a $ in front of the part that shouldn’t.' },
    { title: '“<x>=-2^2</x> is −4.”', html: 'In Excel, negation comes before exponentiation, so <x>=-2^2</x> squares −2 and returns 4. Write <x>=-(2^2)</x> when you mean −4. Similarly, % applies only to the number it follows: <x>=5+10%</x> is 5.1.' },
    { title: '“If it shows 2 decimals, it is rounded.”', html: 'A number format changes the display, not the stored value, and formulas use the stored value. When the rounded figure is what is charged or paid, round it with <x>=ROUND(…,2)</x>; otherwise keep full precision and format the result.' },
    { title: '“Typing the number into the formula is fine if it is right today.”', html: 'A constant inside a formula is invisible, won’t change when the input does, and has to be found and edited in every copy. Put each assumption in a labelled input cell and refer to it, absolutely or by name.' },
    { title: '“A total at the bottom can use the whole column.”', html: '<x>=SUM(F:F)</x> placed in column F includes its own cell, which makes a circular reference. Put the total outside the column it adds, or refer to the exact range (or, later in this course, to an Excel table column).' },
    { title: '“If the formula returns a number, it is right.”', html: 'Most spreadsheet errors return plausible numbers, and their authors are confident they have none. Check against a total calculated another way, look at the formulas (Show Formulas) for the odd one out, and have someone else inspect the important cells.' },
  ],

  application: [
    { p: '<b>Ana’s order workbook.</b> Ana lays out the workbook in the order a reader needs. The first sheet holds the cleaned orders exactly as B02 delivered them; nothing is typed over. An inputs block holds the planned price rise and the subscription discount, each in its own labelled cell with its unit, its source and the date she set it, and each with a name. The calculation columns (line total, value at new prices) each hold one formula filled down.' },
    { p: 'A checks block at the top shows the rebuilt line totals minus the recorded totals, which must be 0.00, and the number of order rows, which must be 231. When she sends the workbook to Lantern’s accountant, the first thing he looks at is the checks block.' },
    { p: '<b>Before she trusts a result.</b> When the price-rise sheet says a 6% rise would have added $25.38 to the first ten orders, Ana checks it two ways: by the formula column and by the quick estimate, gross value times 0.06. She also tests the sheet with an input whose answer she knows. Set the rise to 0% and every new price must equal the old price; set it to 100% and every price must double. A formula that passes both tests and agrees with an independent estimate is not proof of correctness, but a formula that fails either one is certainly wrong.' },
    { case: 'Riverbend Cycles, a fictional bike-repair shop, prices its services from a sheet in which a mechanic’s hourly rate sits in one named input cell, Rate, and every service price is hours × Rate + parts. When the owner raised the rate from $45 to $48 an hour, she changed one cell, and 30 service prices updated. Her previous price list, inherited from the shop’s former owner, had the rate typed into each formula; the year she changed it by hand, two services kept the old rate for six months before a customer queried a bill.' },
    { p: '<b>Reviewing someone else’s sheet.</b> Analysts who check spreadsheets for a living follow a routine much like Ana’s. Turn on Show Formulas and scan each column for the odd formula out. Trace the precedents of each key result back to its inputs. Look for constants inside formulas and for totals that add ranges ending short of the data, the Reinhart–Rogoff error.' },
    { p: 'Then recalculate one or two results by hand. Panko’s research suggests that the author is the person least likely to find the errors, which is why the review is done by someone else.' },
  ],

  summary: [
    'A cell holds a value or a formula; a formula starts with = and recalculates when the cells it refers to change. Keep numbers that can change out of formulas.',
    'Excel’s order of operations puts negation before ^ and % before * and /: <x>=-2^2</x> is 4 and <x>=5+10%</x> is 5.1. Use parentheses to say what you mean.',
    'Relative references move when a formula is filled or copied; <x>$A$1</x> fixes both parts, <x>$A1</x> the column and <x>A$1</x> the row. F4 (Command+T on a Mac) cycles through them. Two-way tables need mixed references.',
    'A number format changes only the display; Excel stores 15 significant digits. Round with ROUND when the rounded value is the real one, and don’t test calculated decimals for exact equality.',
    'Error values name the problem: #DIV/0!, #VALUE!, #NAME?, #REF!, #N/A and #NUM!. Show Formulas, Trace Precedents and Dependents, and Evaluate Formula show how a sheet is wired; a circular reference is almost always a mistake.',
    'Design for checking: labelled inputs, one formula per column, separate data, calculations and results, named key inputs, and check cells that should show zero.',
    'Spreadsheet errors are normal and their authors rarely see them; an independent check is part of the work, not an insult.',
  ],

  glossary: [
    { term: 'Cell reference', def: 'The address of a cell, its column letter followed by its row number (such as F2), used in a formula to read that cell’s value.' },
    { term: 'Cell range', def: 'A rectangle of cells written as its top-left and bottom-right cells joined by a colon, such as B2:D9; a whole column is written F:F.' },
    { term: 'Formula', def: 'An entry in a spreadsheet cell that begins with an equals sign and calculates a result from values, references, operators and functions.' },
    { term: 'Relative reference', def: 'A cell reference without dollar signs, such as A1, which Excel adjusts when the formula is filled or copied, so that it keeps the same position relative to the formula’s cell.' },
    { term: 'Absolute reference', def: 'A cell reference with a dollar sign before both its column and its row, such as $A$1, which stays the same when the formula is filled or copied.' },
    { term: 'Mixed reference', def: 'A cell reference that fixes either its column ($A1) or its row (A$1), so that only the other part moves when the formula is filled or copied.' },
    { term: 'Error value', def: 'A result such as #DIV/0!, #VALUE!, #NAME?, #REF!, #N/A or #NUM! that Excel shows when a formula can’t calculate, naming the kind of problem.' },
    { term: 'Circular reference', def: 'A formula that refers to its own cell, directly or through other formulas.' },
    { term: 'Defined name', def: 'A name given to a cell, range or value, such as Rise for the cell holding a price rise, that formulas can use instead of the reference.' },
  ],

  references: [
    { text: 'Microsoft Support. <i>Excel specifications and limits</i>.', url: 'https://support.microsoft.com/en-us/excel/excel-specifications-and-limits', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>Calculation operators and precedence in Excel</i>.', url: 'https://support.microsoft.com/en-us/excel/calculation-operators-and-precedence-in-excel', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>Switch between relative, absolute, and mixed references</i> (Windows; the Excel for Mac page, <i>Switch between relative and absolute references</i>, is linked in the text).', url: 'https://support.microsoft.com/en-us/Excel/switch-between-relative-absolute-and-mixed-references', checked: '2026-10-23' },
    { text: 'Microsoft Learn. <i>Floating-point arithmetic may give inaccurate results in Excel</i>.', url: 'https://learn.microsoft.com/en-us/troubleshoot/microsoft-365-apps/excel/floating-point-arithmetic-inaccurate-result', checked: '2026-10-23' },
    { text: 'Microsoft Support. Formula auditing: <i>Display the relationships between formulas and cells</i>, with <i>Evaluate a nested formula one step at a time</i> and <i>Remove or allow a circular reference in Excel</i> (linked in the text).', url: 'https://support.microsoft.com/en-us/excel/display-the-relationships-between-formulas-and-cells', checked: '2026-10-23' },
    { text: 'Panko, R. R. (2000). Spreadsheet errors: What we know. What we think we can do. <i>Proceedings of the Spreadsheet Risk Symposium</i>, European Spreadsheet Risks Interest Group (EuSpRIG), Greenwich. arXiv:0802.3457.', url: 'https://arxiv.org/pdf/0802.3457', checked: '2026-10-23' },
    { text: 'Herndon, T., Ash, M. &amp; Pollin, R. (2013). <i>Does high public debt consistently stifle economic growth? A critique of Reinhart and Rogoff</i>. Political Economy Research Institute, University of Massachusetts Amherst, Working Paper 322.', url: 'https://peri.umass.edu/publication/does-high-public-debt-consistently-stifle-economic-growth-a-critique-of-reinhart-and-rogoff/', checked: '2026-10-23' },
  ],

  checks: [
    // case
    { what: 'Number of spring orders', value: ORDERS.length, shown: 231 },
    { what: 'Spring order value', value: sum(ORDERS.map((r) => r[col('order_total')])), shown: 9096.15 },
    { what: 'First order date is 1 March 2026 (day)', value: Number(ORDERS.map((r) => r[col('order_date')]).sort()[0].slice(8)), shown: 1 },
    { what: 'Last order date is 30 June 2026 (day)', value: Number(ORDERS.map((r) => r[col('order_date')]).sort().at(-1).slice(8)), shown: 30 },
    // grid
    { what: 'Rows per worksheet', value: 2 ** 20, shown: 1048576 },
    { what: 'Columns per worksheet', value: 2 ** 14, shown: 16384 },
    { what: 'Column XFD is column number 16,384', value: 24 * 26 * 26 + 6 * 26 + 4, shown: 16384 },
    { what: 'Cells in B2:D9', value: 3 * 8, shown: 24 },
    { what: 'Orders in rows 2 to 232', value: 232 - 2 + 1, shown: 231 },
    // LC-10001
    { what: 'LC-10001 quantity', value: first[0].quantity, shown: 2 },
    { what: 'LC-10001 unit price', value: first[0].unit_price, shown: 58 },
    { what: 'LC-10001 discount', value: first[0].discount, shown: 5 },
    { what: 'LC-10001 line total', value: first[0].quantity * first[0].unit_price - first[0].discount, shown: 111 },
    { what: 'LC-10001 with the discount taken off each bag', value: first[0].quantity * (first[0].unit_price - first[0].discount), shown: 106 },
    // operators
    { what: '=20/4*2', value: (20 / 4) * 2, shown: 10 },
    { what: '=20/(4*2) (the wrong reading)', value: 20 / (4 * 2), shown: 2.5 },
    { what: '=2^3^2 in Excel', value: (2 ** 3) ** 2, shown: 64 },
    { what: '2^(3^2)', value: 2 ** (3 ** 2), shown: 512 },
    { what: '=5+2*3', value: 5 + 2 * 3, shown: 11 },
    { what: '=(5+2)*3', value: (5 + 2) * 3, shown: 21 },
    { what: '=-2^2', value: (-2) ** 2, shown: 4 },
    { what: '=-(2^2)', value: -(2 ** 2), shown: -4 },
    { what: '=5+10%', value: 5 + 10 / 100, shown: 5.1 },
    { what: '5 + 10% of 5 (the wrong reading)', value: 5 * 1.1, shown: 5.5 },
    { what: '="1"+"2"', value: 1 + 2, shown: 3 },
    { what: '=1+"$4.00"', value: 1 + 4, shown: 5 },
    // price rise
    { what: 'Prerequisite: $14.00 after 6%', value: 14 * 1.06, shown: 14.84 },
    // display vs stored
    { what: '2.345 shown to two decimals', value: Math.round(2.345 * 100 + 1e-9) / 100, shown: 2.35 },
    { what: '100/3 shown to two decimals', value: Math.round((100 / 3) * 100) / 100, shown: 33.33 },
    { what: 'Three lines of 33.33', value: 3 * 33.33, shown: 99.99 },
    { what: 'SUM of three 100/3', value: 3 * (100 / 3), shown: 100 },
    { what: '(43.1−43.2)+1 to 15 decimals', value: Math.round(((43.1 - 43.2) + 1) * 1e15) / 1e15, shown: 0.899999999999999, tol: 1e-15 },
    { what: 'Excel 95 result for 1.333+1.225−1.333−1.225', value: 1.333 + 1.225 - 1.333 - 1.225, shown: -2.22044604925031e-16, tol: 1e-20 },
    { what: 'Microsoft Evaluate Formula example: AVERAGE(55,35,45,25)', value: (55 + 35 + 45 + 25) / 4, shown: 40 },
    { what: 'Iterative calculation default: 100 iterations', value: 100, shown: 100 },
    // Reinhart–Rogoff
    { what: 'Rows 30 to 49 minus rows 30 to 44', value: (49 - 30 + 1) - (44 - 30 + 1), shown: 5 },
    // simple example
    ...first.map((o, i) => ({ what: `Simple: line total row ${i + 2}`, value: o.quantity * o.unit_price - o.discount, shown: [111, 30.6, 14, 37, 92][i] })),
    // challenging example
    ...TABLE_PRODUCTS.flatMap((p, i) => RISES.map((r, j) => ({ what: `Challenging: ${p} at ${r * 100}%`, value: price(p) * (1 + r), shown: [[14.56, 14.84, 15.4], [17.68, 18.02, 18.7], [20.28, 20.67, 21.45], [50.96, 51.94, 53.9]][i][j] }))),
    { what: 'Challenging: 14.56 raised again by 6%', value: cellOf('House Blend 250g', 0.04) * 1.06, shown: 15.43 },
    // applied example
    { what: 'Applied: gross value of the first ten orders', value: gross10, shown: 423 },
    { what: 'Applied: at a 6% rise', value: gross10 * 1.06, shown: 448.38 },
    { what: 'Applied: with LC-10007 left at 5%', value: gross10 * 1.06 - 58 * 0.01, shown: 447.8 },
    { what: 'Applied: the gap', value: 58 * 0.01, shown: 0.58 },
    { what: 'Applied: LC-10007 is a $58 Gift Box Trio in row 10', value: ten[6].unit_price * ten[6].quantity + (ten[6].order_id === 'LC-10007' ? 0 : 1000), shown: 58 },
    { what: 'Applied: increase from the rise', value: gross10 * 0.06, shown: 25.38 },
    // application
    { what: 'Application: a 100% rise doubles a price', value: 14 * (1 + 1), shown: 28 },
  ],
};
