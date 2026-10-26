// conditional-sums-and-counts.ex.js — B03 · Conditional sums, counts and averages: widgets, practice and the knowledge
// check (answer keys live here). Every sheet holds all 231 of Lantern's spring orders from case.js (only the columns the
// question needs). Formula items are marked by their results on the sheet and on three copies with the numbers changed.
import { ORDERS, ORDER_COLUMNS, tableCells } from './case.js?v=18';

const MONEY = '$#,##0.00';
const R = 232;                                         // the last data row
// all 231 orders with the named columns from A (header in row 1); ISO dates become serial numbers
const data = (cols) => tableCells(ORDER_COLUMNS, ORDERS, { cols }).cells;
// a date's serial number in Excel's 1900 date system (valid from 1 March 1900)
const serialOf = (iso) => (Date.parse(`${iso}T00:00:00Z`) - Date.UTC(1899, 11, 30)) / 86400000;
const rows = ORDERS.map((r) => Object.fromEntries(ORDER_COLUMNS.map((c, i) => [c, r[i]])));
const r2 = (x) => Math.round(x * 100) / 100;
const total = (f) => r2(rows.filter(f).reduce((s, o) => s + o.order_total, 0));
const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const REGIONS = ['North', 'South', 'East', 'West', 'Central'];
const MONTH_STARTS = ['2026-03-01', '2026-04-01', '2026-05-01', '2026-06-01'].map((d) => serialOf(d));
const web = total((o) => o.channel === 'web'), sub = total((o) => o.subscription === 'yes');
const webSub = total((o) => o.channel === 'web' && o.subscription === 'yes');

export const widgets = {
  'cs-sheet': {
    type: 'sheet',
    title: 'Lantern’s spring orders, with a summary table to build',
    sheet: { cells: {
      ...data(['order_date', 'region', 'product', 'quantity', 'unit_price', 'order_total', 'channel', 'subscription', 'rating']),
      K1: 'month starting', L1: 'web', M1: 'app', K2: MONTH_STARTS[0], K3: MONTH_STARTS[1], K4: MONTH_STARTS[2], K5: MONTH_STARTS[3],
      K7: 'total', K9: 'check: SUM of the data', L9: '=SUM(F2:F232)', K11: 'spare cells',
    } },
    view: `A1:N${R}`,
    formats: { A: 'date', E: MONEY, F: MONEY, K2: 'mmm yyyy', K3: 'mmm yyyy', K4: 'mmm yyyy', K5: 'mmm yyyy', L: MONEY, M: MONEY, N: MONEY },
    widths: { A: 12, C: 24, K: 20, L: 12, M: 12, N: 12 },
    editable: true,
    mark: ['L2:M5'],
    maxHeight: '26rem',
    tools: ['formulas', 'fill', 'reset'],
    note: 'The same columns as the lesson: A order date, B region, C product, D quantity, E unit price, F order total, G channel, H subscription, I rating. The summary table is in K1:M5, with row 7 for its totals; L9 holds the total of the data for your check.',
  },
};

export const guided = [
  {
    id: 'b03-cs-g1', type: 'formula', kind: 'applied',
    prompt: 'All 231 spring orders: channel in column B, order total in C. E2 and E3 hold the channels web and app. In F2, write a formula for the web orders’ total value that can be filled down to F3 for the app.',
    sheet: { cells: { ...data(['order_id', 'channel', 'order_total']), E1: 'channel', F1: 'order value', E2: 'web', E3: 'app' } },
    cell: 'F2', fill: 'F2:F3', view: `A1:F${R}`,
    formats: { C: MONEY, F: MONEY }, widths: { A: 10, F: 13 },
    answer: `=SUMIF($B$2:$B$${R},E2,$C$2:$C$${R})`,
    alt: [`=SUMIFS($C$2:$C$${R},$B$2:$B$${R},E2)`, '=SUMIF($B:$B,E2,$C:$C)', `=SUMPRODUCT(($B$2:$B$${R}=E2)*$C$2:$C$${R})`],
    wrong: [
      { formula: `=SUMIF(B2:B${R},E2,C2:C${R})`, say: 'Without dollar signs the ranges slide down when the formula is filled, so F3 starts at row 3 and misses the first order (an app order). Fix the ranges: $B$2:$B$232 and $C$2:$C$232.' },
      { formula: `=SUMIF($B$2:$B$${R},"web",$C$2:$C$${R})`, say: 'With <x>"web"</x> typed in, F3 also adds the web orders. Refer to the channel in column E so that the filled formula picks up app.' },
      { formula: `=SUMIF($C$2:$C$${R},E2,$B$2:$B$${R})`, say: 'The ranges are swapped: SUMIF tests the first range and adds the third. Test the channels (B), add the totals (C).' },
    ],
    hints: ['SUMIF(range to test, criterion, range to add): test column B against E2, add column C.', 'Make both ranges absolute so they don’t move when filled: <x>=SUMIF($B$2:$B$232,E2,$C$2:$C$232)</x>.'],
    solution: `<x>=SUMIF($B$2:$B$232,E2,$C$2:$C$232)</x>: web ${money(web)}, app ${money(total((o) => o.channel === 'app'))}. The ranges are absolute, the criterion E2 is relative, so the filled copy tests against E3. <x>=SUMIFS($C$2:$C$232,$B$2:$B$232,E2)</x> is the same with the sum range first.`,
  },
  {
    id: 'b03-cs-g2', type: 'formula', kind: 'applied',
    prompt: 'Order dates are in column B. Row 2 describes April: E2 holds 1 April 2026 (from) and F2 holds 1 May 2026 (before); row 3 does the same for May. In G2, count the orders placed on or after the date in E2 and before the date in F2, referring to those cells, in a formula that can be filled down to G3.',
    sheet: { cells: { ...data(['order_id', 'order_date', 'order_total']), E1: 'from', F1: 'before', G1: 'orders', E2: serialOf('2026-04-01'), F2: serialOf('2026-05-01'), E3: serialOf('2026-05-01'), F3: serialOf('2026-06-01') } },
    cell: 'G2', fill: 'G2:G3', view: `A1:G${R}`,
    formats: { B: 'date', C: MONEY, E: 'date', F: 'date' }, widths: { A: 10, B: 12, E: 13, F: 13 },
    answer: `=COUNTIFS($B$2:$B$${R},">="&E2,$B$2:$B$${R},"<"&F2)`,
    alt: [`=COUNTIFS($B$2:$B$${R},">="&E2,$B$2:$B$${R},"<="&F2-1)`, `=COUNTIF($B$2:$B$${R},">="&E2)-COUNTIF($B$2:$B$${R},">="&F2)`, `=SUMPRODUCT(($B$2:$B$${R}>=E2)*($B$2:$B$${R}<F2))`],
    wrong: [
      { formula: `=COUNTIFS($B$2:$B$${R},">=E2",$B$2:$B$${R},"<F2")`, say: 'Inside the quotes, E2 is just the letter E and the digit 2: the criterion is the text “>=E2”, which no date matches. Join the operator to the cell with &: <x>">="&E2</x>.' },
      { formula: `=COUNTIFS($B$2:$B$${R},">="&E2,$B$2:$B$${R},"<="&F2)`, say: '“On or before 1 May” lets in the orders placed on 1 May. The window should stop before the next month starts: <x>"<"&F2</x>.' },
      { formula: `=COUNTIF($B$2:$B$${R},">="&E2)`, say: 'That counts every order from the start date onwards, later months included. Add the second criterion with COUNTIFS.' },
      { formula: `=COUNTIFS($B$2:$B$${R},">="&DATE(2026,4,1),$B$2:$B$${R},"<"&DATE(2026,5,1))`, say: 'The dates are typed into the formula, so filled down it still counts April. Refer to the cells: <x>">="&E2</x> and <x>"<"&F2</x>.' },
    ],
    hints: ['Two criteria on the same column: <x>COUNTIFS(B2:B232,criterion1,B2:B232,criterion2)</x>, with the range made absolute so it doesn’t slide when filled.', 'Join each operator to its cell with &: <x>">="&E2</x> and <x>"<"&F2</x>.'],
    solution: `<x>=COUNTIFS($B$2:$B$232,">="&E2,$B$2:$B$232,"<"&F2)</x> returns ${rows.filter((o) => o.order_date.startsWith('2026-04')).length} for April and ${rows.filter((o) => o.order_date.startsWith('2026-05')).length} for May. The & joins the operator to the date in the cell; the window runs from the start up to, but not including, the next month’s first day, so the ${rows.filter((o) => o.order_date === '2026-05-01').length} orders of 1 May count in May, not April.`,
  },
  {
    id: 'b03-cs-g3', type: 'formula', kind: 'applied',
    prompt: 'Build a table of order value by month and channel. E2:E5 hold the first day of each month (March to June 2026) and F1:G1 the channels. In F2, write one formula, using SUMIFS and EDATE for the end of the window, that can be filled across to G2 and down to G5. Dates are in A, channels in B, order totals in C.',
    sheet: { cells: { ...data(['order_date', 'channel', 'order_total']), E1: 'month starting', F1: 'web', G1: 'app', E2: MONTH_STARTS[0], E3: MONTH_STARTS[1], E4: MONTH_STARTS[2], E5: MONTH_STARTS[3] } },
    cell: 'F2', fill: 'F2:G5', view: `A1:G${R}`,
    formats: { A: 'date', C: MONEY, E: 'mmm yyyy', F: MONEY, G: MONEY }, widths: { A: 12, E: 14, F: 12, G: 12 },
    answer: `=SUMIFS($C$2:$C$${R},$A$2:$A$${R},">="&$E2,$A$2:$A$${R},"<"&EDATE($E2,1),$B$2:$B$${R},F$1)`,
    alt: [
      `=SUMIFS($C$2:$C$${R},$B$2:$B$${R},F$1,$A$2:$A$${R},">="&$E2,$A$2:$A$${R},"<="&EOMONTH($E2,0))`,
      `=SUMIFS($C$2:$C$${R},$A$2:$A$${R},">="&$E2,$A$2:$A$${R},"<"&EOMONTH($E2,0)+1,$B$2:$B$${R},F$1)`,
    ],
    wrong: [
      { formula: `=SUMIFS(C2:C${R},A2:A${R},">="&E2,A2:A${R},"<"&EDATE(E2,1),B2:B${R},F1)`, say: 'With no dollar signs everything moves: the data ranges slide down and across, and the month and channel references leave column E and row 1. Fix the data ranges completely, the month’s column ($E2) and the channel’s row (F$1).' },
      { formula: `=SUMIFS($C$2:$C$${R},$A$2:$A$${R},">="&$E$2,$A$2:$A$${R},"<"&EDATE($E$2,1),$B$2:$B$${R},F$1)`, say: '$E$2 fixes the row as well, so every row of the table shows March. Fix only the column: $E2.' },
      { formula: `=SUMIFS($C$2:$C$${R},$A$2:$A$${R},">="&$E2,$A$2:$A$${R},"<="&EDATE($E2,1),$B$2:$B$${R},F$1)`, say: '“On or before” the first of next month includes that day’s orders in this month too. Use <x>"<"&EDATE($E2,1)</x>.' },
    ],
    hints: [
      'Three criteria: date on or after $E2, date before <x>EDATE($E2,1)</x>, channel equal to F$1. The sum range comes first in SUMIFS.',
      'Data ranges fully absolute ($C$2:$C$232 and so on); the month reference fixes only its column ($E2); the channel reference fixes only its row (F$1).',
    ],
    solution: `<x>=SUMIFS($C$2:$C$232,$A$2:$A$232,">="&$E2,$A$2:$A$232,"<"&EDATE($E2,1),$B$2:$B$232,F$1)</x>. March web is ${money(total((o) => o.order_date.startsWith('2026-03') && o.channel === 'web'))} and June app ${money(total((o) => o.order_date.startsWith('2026-06') && o.channel === 'app'))}; the eight cells add up to $9,096.15, which is the check that every order landed in exactly one cell.`,
  },
  {
    id: 'b03-cs-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Order totals are in F2:F232. Which formula counts the orders of $50 or more?',
    options: ['<x>=COUNTIF(F2:F232,">=50")</x>', '<x>=COUNTIF(F2:F232,>=50)</x>', '<x>=COUNTIF(F2:F232,"=>50")</x>', '<x>=COUNTIF(">=50",F2:F232)</x>'],
    answer: 0,
    hints: ['A criterion with an operator is text, so it goes in quotation marks.', 'The operator is written as it is read: greater than or equal, <x>>=</x>.'],
    feedback: {
      1: 'A criterion with an operator must be in quotation marks; without them Excel can’t read the formula.',
      2: '“=>” is not an operator. Excel reads it as “equal to the text >50”, which no number matches.',
      3: 'COUNTIF takes the range first and the criterion second.',
    },
    solution: `<x>=COUNTIF(F2:F232,">=50")</x>: the range first, then the criterion as text with the operator inside the quotes. It returns ${rows.filter((o) => o.order_total >= 50).length}.`,
  },
];

export const independent = [
  {
    id: 'b03-cs-i1', type: 'formula', kind: 'applied',
    prompt: 'Region is in column B and rating in C (blank when the customer didn’t rate the order). E2:E6 list the five regions. In F2, write the average rating given by North’s customers, in a formula that can be filled down to F6.',
    sheet: { cells: { ...data(['order_id', 'region', 'rating']), E1: 'region', F1: 'average rating', ...Object.fromEntries(REGIONS.map((g, i) => [`E${i + 2}`, g])) } },
    cell: 'F2', fill: 'F2:F6', view: `A1:F${R}`,
    formats: { F: '0.00' }, widths: { A: 10, F: 14 },
    answer: `=AVERAGEIFS($C$2:$C$${R},$B$2:$B$${R},E2)`,
    alt: [`=AVERAGEIF($B$2:$B$${R},E2,$C$2:$C$${R})`, `=SUMIFS($C$2:$C$${R},$B$2:$B$${R},E2)/COUNTIFS($B$2:$B$${R},E2,$C$2:$C$${R},"<>")`],
    wrong: [
      { formula: `=SUMIFS($C$2:$C$${R},$B$2:$B$${R},E2)/COUNTIF($B$2:$B$${R},E2)`, say: 'Dividing by every order in the region treats each unrated order as a 0. Divide by the rated orders only, or use AVERAGEIFS, which skips blanks.' },
      { formula: `=AVERAGEIFS(C2:C${R},B2:B${R},E2)`, say: 'The ranges slide down as the formula is filled, so lower rows lose the first orders. Make the ranges absolute.' },
    ],
    solution: `<x>=AVERAGEIFS($C$2:$C$232,$B$2:$B$232,E2)</x>. AVERAGEIFS averages only the numbers in the rows that match, so blank ratings are left out of both the total and the count. North: ${(rows.filter((o) => o.region === 'North' && o.rating != null).reduce((s, o) => s + o.rating, 0) / rows.filter((o) => o.region === 'North' && o.rating != null).length).toFixed(2)}.`,
  },
  {
    id: 'b03-cs-i2', type: 'formula', kind: 'applied',
    prompt: 'Product is in column B and quantity in C. In F2, write one SUMIF or SUMIFS formula for the number of House Blend bags sold, in both sizes (House Blend 250g and House Blend 1kg).',
    sheet: { cells: { ...data(['order_id', 'product', 'quantity']), E2: 'House Blend bags' } },
    cell: 'F2', view: `A1:F${R}`,
    widths: { A: 10, B: 26, E: 18 },
    answer: `=SUMIF(B2:B${R},"House Blend*",C2:C${R})`,
    alt: [`=SUMIFS(C2:C${R},B2:B${R},"House Blend*")`, `=SUMIF(B2:B${R},"house blend*",C2:C${R})`, `=SUMIF(B2:B${R},"House Blend 250g",C2:C${R})+SUMIF(B2:B${R},"House Blend 1kg",C2:C${R})`],
    wrong: [
      { formula: `=SUMIF(B2:B${R},"House Blend",C2:C${R})`, say: 'Without a wildcard the criterion must match the whole name, and no product is called just “House Blend”. Add * for “anything after”.' },
      { formula: `=COUNTIF(B2:B${R},"House Blend*")`, say: 'That counts the orders, not the bags. Add the quantity column with SUMIF.' },
      { formula: `=SUMIF(B2:B${R},"House Blend 250g",C2:C${R})`, say: 'That is the 250 g size only. The wildcard <x>"House Blend*"</x> covers both sizes.' },
    ],
    solution: `<x>=SUMIF(B2:B232,"House Blend*",C2:C232)</x>: the * matches any characters after “House Blend”, so both sizes are included: ${rows.filter((o) => o.product.startsWith('House Blend')).reduce((s, o) => s + o.quantity, 0)} bags. Criteria ignore case, so <x>"house blend*"</x> works too.`,
  },
  {
    id: 'b03-cs-i3', type: 'formula', kind: 'applied',
    prompt: 'Channel is in column B and order total in C. In F2, write a formula for the largest single order placed through the app.',
    sheet: { cells: { ...data(['order_id', 'channel', 'order_total']), E2: 'largest app order' } },
    cell: 'F2', view: `A1:F${R}`,
    formats: { C: MONEY, F: MONEY }, widths: { A: 10, E: 18, F: 12 },
    answer: `=MAXIFS(C2:C${R},B2:B${R},"app")`,
    alt: [`=MAXIFS(C2:C${R},B2:B${R},"<>web")`, `=MAX(IF(B2:B${R}="app",C2:C${R}))`],
    wrong: [
      { formula: `=MAX(C2:C${R})`, say: 'That is the largest order on either channel, and the largest of all, the $1,512.00 office order, came through the web. Add the condition with MAXIFS.' },
      { formula: `=MAXIFS(B2:B${R},C2:C${R},"app")`, say: 'The ranges are swapped: MAXIFS takes the range to search for the maximum first (the totals), then each criteria range and its criterion.' },
    ],
    solution: `<x>=MAXIFS(C2:C232,B2:B232,"app")</x> returns ${money(Math.max(...rows.filter((o) => o.channel === 'app').map((o) => o.order_total)))}. MAXIFS (Excel 2019 and later, and Microsoft 365) takes the range to search first and then range–criterion pairs, like SUMIFS.`,
  },
  {
    id: 'b03-cs-i4', type: 'formula', kind: 'applied',
    prompt: 'Region is in column B and order total in C. In F2, write a formula for the total value of orders from the North or the South region.',
    sheet: { cells: { ...data(['order_id', 'region', 'order_total']), E2: 'North or South' } },
    cell: 'F2', view: `A1:F${R}`,
    formats: { C: MONEY, F: MONEY }, widths: { A: 10, E: 16, F: 12 },
    answer: `=SUMIFS(C2:C${R},B2:B${R},"North")+SUMIFS(C2:C${R},B2:B${R},"South")`,
    alt: [`=SUMIF(B2:B${R},"North",C2:C${R})+SUMIF(B2:B${R},"South",C2:C${R})`, `=SUMPRODUCT(((B2:B${R}="North")+(B2:B${R}="South"))*C2:C${R})`, `=SUM(SUMIFS(C2:C${R},B2:B${R},{"North","South"}))`],
    wrong: [
      { formula: `=SUMIFS(C2:C${R},B2:B${R},"North",B2:B${R},"South")`, say: 'Criteria in one SUMIFS are combined with AND: no order is in both North and South, so the result is 0. Add two SUMIFS instead.' },
      { formula: `=SUMIFS(C2:C${R},B2:B${R},"North")`, say: 'That is the North only. Add a second SUMIFS for the South.' },
    ],
    solution: `<x>=SUMIFS(C2:C232,B2:B232,"North")+SUMIFS(C2:C232,B2:B232,"South")</x> returns ${money(total((o) => o.region === 'North' || o.region === 'South'))}. Adding is safe here because an order has only one region, so no order is counted twice.`,
  },
  {
    id: 'b03-cs-i5', type: 'formula', kind: 'applied',
    prompt: 'Channel is in column B and rating in C (blank when the order wasn’t rated). In F2, count the web orders that were rated, in a formula that can be filled down to F3 for the app.',
    sheet: { cells: { ...data(['order_id', 'channel', 'rating']), E1: 'channel', F1: 'rated orders', E2: 'web', E3: 'app' } },
    cell: 'F2', fill: 'F2:F3', view: `A1:F${R}`,
    widths: { A: 10, F: 12 },
    answer: `=COUNTIFS($B$2:$B$${R},E2,$C$2:$C$${R},"<>")`,
    alt: [`=COUNTIFS($C$2:$C$${R},"<>",$B$2:$B$${R},E2)`, `=COUNTIFS($B$2:$B$${R},E2,$C$2:$C$${R},">0")`, `=COUNTIF($B$2:$B$${R},E2)-COUNTIFS($B$2:$B$${R},E2,$C$2:$C$${R},"")`],
    wrong: [
      { formula: `=COUNTIF($B$2:$B$${R},E2)`, say: 'That counts every order on the channel, rated or not. Add a second criterion on the rating column: <x>"<>"</x> (not blank).' },
      { formula: `=COUNTIFS($B$2:$B$${R},E2,$C$2:$C$${R},"")`, say: 'The criterion <x>""</x> matches blank cells: that counts the unrated orders. Use <x>"<>"</x> for cells that aren’t blank.' },
    ],
    solution: `<x>=COUNTIFS($B$2:$B$232,E2,$C$2:$C$232,"<>")</x>: web ${rows.filter((o) => o.channel === 'web' && o.rating != null).length}, app ${rows.filter((o) => o.channel === 'app' && o.rating != null).length}. The criterion <x>"<>"</x> means “not equal to nothing”, that is, not blank.`,
  },
  {
    id: 'b03-cs-i6', type: 'classify', kind: 'conceptual',
    prompt: 'In a COUNTIF on a column of product names or amounts, what does each criterion match?',
    items: ['<x>""</x>', '<x>"<>"</x>', '<x>"House Blend*"</x>', '<x>"*1kg"</x>', '<x>"~*"</x>', '<x>">=50"</x>', '<x>"cold brew pack"</x>'],
    categories: ['Empty cells', 'Cells that aren’t empty', 'Text that starts with House Blend', 'Text that ends in 1kg', 'A cell holding just an asterisk', 'Numbers of 50 or more', 'Cold Brew Pack, whatever its capitals'],
    answer: [0, 1, 2, 3, 4, 5, 6],
    feedback: {
      1: '<x>"<>"</x> means “not equal to nothing”: every cell that isn’t empty.',
      4: 'The tilde makes the next wildcard literal, so <x>"~*"</x> matches an actual asterisk rather than any text.',
      6: 'Text criteria ignore upper and lower case.',
    },
    solution: '<x>""</x> matches blanks and <x>"<>"</x> non-blanks; <x>*</x> matches any run of characters, so <x>"House Blend*"</x> is a prefix and <x>"*1kg"</x> a suffix; <x>"~*"</x> is a literal asterisk; <x>">=50"</x> compares numbers; and text criteria ignore case.',
  },
];

export const check = [
  {
    id: 'b03-cs-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Channels are in G2:G232 and order totals in F2:F232. Which formula returns the total value of web orders?',
    options: ['<x>=SUMIFS(F2:F232,G2:G232,"web")</x>', '<x>=SUMIFS(G2:G232,"web",F2:F232)</x>', '<x>=SUMIF(F2:F232,"web",G2:G232)</x>', '<x>=SUMIF(G2:G232,F2:F232,"web")</x>'],
    answer: 0,
    feedback: {
      1: 'That is SUMIF’s order inside SUMIFS. In SUMIFS the sum range comes first, then each criteria range with its criterion.',
      2: 'SUMIF tests its first range and adds its third: this tests the totals for “web” and adds the channel names, giving 0.',
      3: 'SUMIF’s arguments are range, criterion, sum range; here the criterion and sum range are swapped.',
    },
    solution: 'SUMIFS(sum_range, criteria_range, criterion): <x>=SUMIFS(F2:F232,G2:G232,"web")</x>. The SUMIF equivalent is <x>=SUMIF(G2:G232,"web",F2:F232)</x>, with the sum range last.',
  },
  {
    id: 'b03-cs-k2', type: 'formula', kind: 'numerical',
    prompt: 'Quantity is in column B and unit price in C. In F2, use SUMPRODUCT to calculate the average price Lantern’s customers paid per bag, before discounts, weighting each order by its quantity.',
    sheet: { cells: { ...data(['order_id', 'quantity', 'unit_price']), E2: 'average price per bag' } },
    cell: 'F2', view: `A1:F${R}`,
    formats: { C: MONEY, F: MONEY }, widths: { A: 10, E: 20, F: 12 },
    require: ['SUMPRODUCT'],
    answer: `=SUMPRODUCT(B2:B${R},C2:C${R})/SUM(B2:B${R})`,
    alt: [`=SUMPRODUCT(B2:B${R}*C2:C${R})/SUM(B2:B${R})`],
    wrong: [
      { formula: `=AVERAGE(C2:C${R})`, say: 'A plain average gives a one-bag order the same weight as the 120-bag order. Weight each price by its quantity.' },
      { formula: `=SUMPRODUCT(B2:B${R},C2:C${R})/COUNT(B2:B${R})`, say: 'Dividing by the number of orders gives the value per order, not per bag. Divide by the total quantity.' },
      { formula: `=SUMPRODUCT(B2:B${R},C2:C${R})`, say: 'That is the total value before discounts. Divide it by the number of bags, <x>SUM(B2:B232)</x>.' },
    ],
    solution: `<x>=SUMPRODUCT(B2:B232,C2:C232)/SUM(B2:B232)</x>: $${rows.reduce((s, o) => s + o.quantity * o.unit_price, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ÷ ${rows.reduce((s, o) => s + o.quantity, 0)} bags ≈ $${(rows.reduce((s, o) => s + o.quantity * o.unit_price, 0) / rows.reduce((s, o) => s + o.quantity, 0)).toFixed(2)} a bag, against a plain average of the price column of $${(rows.reduce((s, o) => s + o.unit_price, 0) / rows.length).toFixed(2)}.`,
  },
  {
    id: 'b03-cs-k3', type: 'formula', kind: 'applied',
    prompt: 'Count Lantern’s orders by region and subscription. E2:E6 list the regions and F1:G1 hold yes and no. Region is in column B and subscription in C. Write one formula in F2 that can be filled across to G2 and down to G6.',
    sheet: { cells: { ...data(['order_id', 'region', 'subscription']), E1: 'region', F1: 'yes', G1: 'no', ...Object.fromEntries(REGIONS.map((g, i) => [`E${i + 2}`, g])) } },
    cell: 'F2', fill: 'F2:G6', view: `A1:G${R}`,
    widths: { A: 10 },
    answer: `=COUNTIFS($B$2:$B$${R},$E2,$C$2:$C$${R},F$1)`,
    alt: [`=COUNTIFS($C$2:$C$${R},F$1,$B$2:$B$${R},$E2)`],
    wrong: [
      { formula: `=COUNTIFS(B2:B${R},E2,C2:C${R},F1)`, say: 'The dollar signs are missing or on the wrong parts, so the ranges or the criteria move the wrong way as the formula is filled. Fix the data ranges completely, the region’s column ($E2) and the subscription’s row (F$1).' },
      { formula: `=COUNTIFS($B$2:$B$${R},$E$2,$C$2:$C$${R},F$1)`, say: '$E$2 fixes the row too, so every row counts North. Fix only the column: $E2.' },
    ],
    solution: `<x>=COUNTIFS($B$2:$B$232,$E2,$C$2:$C$232,F$1)</x>. North: ${rows.filter((o) => o.region === 'North' && o.subscription === 'yes').length} subscription and ${rows.filter((o) => o.region === 'North' && o.subscription === 'no').length} other orders. The ten counts add up to 231, which is the check.`,
  },
  {
    id: 'b03-cs-k4', type: 'num', kind: 'numerical',
    prompt: 'A2:A9 hold channels and B2:B9 order totals: web 14.00, app 30.60, web 92.00, web 19.50, app 53.00, web 37.00, app 12.60, web 111.00. What does <x>=SUMIFS(B2:B9,A2:A9,"web",B2:B9,">=20")</x> return?',
    answer: 240, check: () => [92, 37, 111].reduce((s, x) => s + x, 0), unit: '$', places: 2, tol: 0.005,
    wrong: [
      { value: 273.5, say: 'That is every web order. The second criterion keeps only totals of $20 or more, so 14.00 and 19.50 drop out.' },
      { value: 323.6, say: 'That is every order of $20 or more on either channel. Both criteria must hold: web and at least $20.' },
    ],
    solution: 'Rows that are web and at least $20: 92.00, 37.00 and 111.00. Their sum is $240.00. Both criteria must be met because SUMIFS combines them with AND.',
  },
  {
    id: 'b03-cs-k5', type: 'mc', kind: 'applied',
    prompt: `Ana wants the value of orders that came through the web or were subscriptions. She adds two SUMIFS, the web orders (${money(web)}) and the subscription orders (${money(sub)}), and gets ${money(r2(web + sub))}. What is wrong?`,
    options: [
      'The web subscription orders are in both sums, so they are counted twice.',
      'Nothing is wrong: adding two SUMIFS is the way to write OR.',
      'SUMIFS can’t test two different columns, so one sum is wrong.',
      'Both criteria belong in one SUMIFS, which gives the right total.',
    ],
    answer: 0,
    feedback: {
      1: 'Adding works for OR only when no row can meet both conditions. A web order can also be a subscription.',
      2: 'Each SUMIFS is fine on its own; the problem is the overlap between them.',
      3: `One SUMIFS with both criteria gives web AND subscription, the overlap itself (${money(webSub)}), not web OR subscription.`,
    },
    solution: `The web subscription orders, worth ${money(webSub)}, are in both sums. Web OR subscription = web + subscription − (web AND subscription) = ${money(web)} + ${money(sub)} − ${money(webSub)} = ${money(r2(web + sub - webSub))}. SUMPRODUCT with an OR test, <x>(((G2:G232="web")+(H2:H232="yes"))>0)</x>, gives the same total in one formula.`,
  },
  {
    id: 'b03-cs-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Order dates are in A2:A232 and K1 holds 1 April 2026. Select all the formulas that count the orders in the quarter April to June 2026.',
    options: [
      '<x>=COUNTIFS(A2:A232,">="&K1,A2:A232,"<"&EDATE(K1,3))</x>',
      '<x>=COUNTIFS(A2:A232,">="&K1,A2:A232,"<="&EOMONTH(K1,2))</x>',
      '<x>=COUNTIF(A2:A232,">="&K1)-COUNTIF(A2:A232,">="&EDATE(K1,3))</x>',
      '<x>=COUNTIFS(A2:A232,">="&K1,A2:A232,"<"&EDATE(K1,2))</x>',
      '<x>=COUNTIFS(A2:A232,">="&K1,A2:A232,"<="&EOMONTH(K1,3))</x>',
      '<x>=COUNTIFS(A2:A232,">=K1",A2:A232,"<EDATE(K1,3)")</x>',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: '<x>EDATE(K1,2)</x> is 1 June, so this window covers April and May only.',
      4: '<x>EOMONTH(K1,3)</x> is 31 July: the window runs a month too long. The quarter ends on <x>EOMONTH(K1,2)</x>, 30 June.',
      5: 'Inside the quotes, K1 and <x>EDATE(K1,3)</x> are just text, so no date matches and the count is 0.',
    },
    solution: 'A quarter starting on the date in K1 runs up to, but not including, <x>EDATE(K1,3)</x> (1 July), which is the same as on or before <x>EOMONTH(K1,2)</x> (30 June). The third formula counts orders from 1 April on and subtracts those from 1 July on. Two months instead of three, an end one month late, or cell references inside the quotes all give the wrong count.',
  },
];
