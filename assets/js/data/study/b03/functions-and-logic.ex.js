// functions-and-logic.ex.js — B03 · Functions, logic, text and dates: widgets, practice and the knowledge check (answer
// keys live here). Lantern's orders come from case.js; the discount-audit typo is fictional and labelled. Formula items
// are marked by their results on the sheet and on three copies with the numbers (and dates) changed.
import { ORDERS, ORDER_COLUMNS, tableCells } from './case.js?v=13';

const MONEY = '$#,##0.00';
const pick = (idx, cols) => {
  // the chosen orders as rows 2…, with the named columns from A
  const c = ORDER_COLUMNS;
  return tableCells(c, idx.map((i) => ORDERS[i]), { cols });
};
const idOf = (i) => ORDERS[i][0];

// guided 1: a mix of subscription and other orders
const G1 = [0, 1, 3, 5, 8, 9, 10, 13];
// guided 4: order IDs that are not consecutive
const G4 = [0, 16, 43, 101, 143, 186, 202, 230];
// independent 1 and check 5: order dates spread over the four months
const SPREAD = [0, 22, 60, 100, 143, 170, 200, 230];
// independent 4: dates that include a Friday, a Saturday and Sundays
const WEEK = [0, 1, 5, 6, 7, 8, 12, 19];
// check 3: subscription orders across the months
const SUBS = ORDERS.map((r, i) => i).filter((i) => ORDERS[i][ORDER_COLUMNS.indexOf('subscription')] === 'yes');
const K3 = [SUBS[0], SUBS[10], SUBS[25], SUBS[40], SUBS[55], SUBS[70], SUBS[85], SUBS[103]];

// independent 6: eight orders pasted from an older export, one with a mistyped discount (fictional)
const audit = (() => {
  const t = pick([0, 1, 3, 5, 8, 9, 13, 15], ['order_id', 'quantity', 'unit_price', 'subscription', 'discount']);
  t.cells.E7 = 1.17;          // LC-10010's 1.65 typed as 1.17
  return { ...t.cells, F1: 'flag', G1: 'Subscription discount', H1: 0.1 };
})();

export const widgets = {
  'fl-sheet': {
    type: 'sheet',
    title: 'Functions on Lantern’s first twelve orders',
    sheet: { cells: {
      ...tableCells(ORDER_COLUMNS, ORDERS, { cols: ['order_id', 'order_date', 'quantity', 'unit_price', 'discount', 'order_total', 'subscription', 'rating'], n: 12 }).cells,
      I1: 'your formula', J1: 'Subscription discount', K1: 0.1,
    } },
    view: 'A1:K13',
    formats: { B: 'date', D: MONEY, E: MONEY, F: MONEY, K1: '0%' },
    widths: { A: 10, B: 12, I: 14, J: 20 },
    editable: true,
    mark: ['I2:I13'],
    tools: ['formulas', 'fill', 'reset'],
    note: 'Columns: A order ID, B order date, C quantity, D unit price, E discount, F order total, G subscription, H rating (blank when the customer didn’t rate the order). K1 holds the subscription discount.',
  },
};

export const guided = [
  {
    id: 'b03-fl-g1', type: 'formula', kind: 'applied',
    prompt: 'H1 holds Lantern’s subscription discount (10%). In E2, write the discount each order should carry: quantity × unit price × the rate, rounded to the cent, if the order is a subscription (column D says yes), otherwise 0. Your formula will be filled down to E9.',
    sheet: { cells: { ...pick(G1, ['order_id', 'quantity', 'unit_price', 'subscription']).cells, E1: 'expected discount', G1: 'Subscription discount', H1: 0.1 } },
    cell: 'E2', fill: 'E2:E9', view: 'A1:H9',
    formats: { C: MONEY, E: MONEY, H1: '0%' }, widths: { E: 16, G: 20 },
    answer: '=IF(D2="yes",ROUND(B2*C2*$H$1,2),0)',
    alt: ['=IF(D2<>"yes",0,ROUND(B2*C2*$H$1,2))', '=(D2="yes")*ROUND(B2*C2*$H$1,2)', '=ROUND(IF(D2="yes",B2*C2*$H$1,0),2)'],
    wrong: [
      { formula: '=IF(D2="yes",ROUND(B2*C2*H1,2),0)', say: 'H1 moves to H2, H3 … when the formula is filled, and those are empty. The rate needs dollar signs: $H$1.' },
      { formula: '=IF(D2="yes",ROUND(B2*C2*0.1,2),0)', say: 'The rate is typed into the formula, so it won’t follow H1 if Lantern changes the discount. Refer to $H$1.' },
      { formula: '=IF(D2=yes,ROUND(B2*C2*$H$1,2),0)', say: 'Text in a formula needs double quotes: <x>D2="yes"</x>. Without them Excel looks for a name called yes and returns #NAME?.' },
      { formula: '=IF(D2="yes",B2*C2*$H$1,0)', say: 'Money is charged in whole cents: round the discount with <x>ROUND(…,2)</x>.' },
      { formula: '=ROUND(B2*C2*$H$1,2)', say: 'That gives every order the subscription discount. Only subscription orders get it: wrap it in <x>IF(D2="yes",…,0)</x>.' },
    ],
    hints: ['IF(test, value if true, value if false): the test is <x>D2="yes"</x>.', 'The value if true is <x>ROUND(B2*C2*$H$1,2)</x>, and the value if false is 0: <x>=IF(D2="yes",ROUND(B2*C2*$H$1,2),0)</x>.'],
    solution: `<x>=IF(D2="yes",ROUND(B2*C2*$H$1,2),0)</x>. ${idOf(1)} is a subscription order: 2 × 17.00 × 10% = $3.40. ${idOf(0)} isn’t, so it gets 0. The rate is referred to absolutely, not typed in, so a change of discount in H1 flows through; ROUND keeps every discount in whole cents.`,
  },
  {
    id: 'b03-fl-g2', type: 'fill', kind: 'conceptual',
    prompt: 'B2:B9 holds, in order: 4, 5, the text “none”, an empty cell, 3, a formula that returns <x>""</x>, 0, and another empty cell. Choose what each formula returns.',
    data: { table: { head: ['Cell', 'Holds'], rows: [['B2', '4'], ['B3', '5'], ['B4', 'none (text)'], ['B5', '(empty)'], ['B6', '3'], ['B7', '<x>=""</x>'], ['B8', '0'], ['B9', '(empty)']] } },
    text: '<x>=COUNT(B2:B9)</x> returns [[0]]; <x>=COUNTA(B2:B9)</x> returns [[1]]; <x>=COUNTBLANK(B2:B9)</x> returns [[2]]; <x>=AVERAGE(B2:B9)</x> returns [[3]].',
    blanks: [
      { options: ['3', '4', '5', '6'], answer: 1 },
      { options: ['4', '5', '6', '8'], answer: 2 },
      { options: ['1', '2', '3', '4'], answer: 2 },
      { options: ['2', '2.4', '3', '4'], answer: 2 },
    ],
    hints: ['COUNT counts numbers only, and 0 is a number. COUNTA counts every cell that isn’t empty, including text and a formula that returns empty text.', 'COUNTBLANK counts empty cells and formulas returning "". AVERAGE adds the numbers and divides by how many there are, zero included.'],
    solution: 'COUNT: 4, 5, 3 and 0, so 4. COUNTA: everything except the two empty cells, so 6 (the text and the <x>""</x> formula count). COUNTBLANK: B5, B7 and B9, so 3 (the zero doesn’t count). AVERAGE: (4 + 5 + 3 + 0) ÷ 4 = 3.',
  },
  {
    id: 'b03-fl-g3', type: 'formula', kind: 'applied',
    prompt: 'For the packing rota, label each order by its total in column B: “large” for $75 or more, “medium” for $25 or more, otherwise “small”. Write the formula in C2; it will be filled down to C11. Rows 10 and 11 test the boundaries, at exactly $75 and $25.',
    sheet: { cells: { ...pick([0, 1, 2, 3, 4, 5, 6, 7], ['order_id', 'order_total']).cells, C1: 'size', A10: 'boundary test', B10: 75, A11: 'boundary test', B11: 25 } },
    cell: 'C2', fill: 'C2:C11', view: 'A1:C11',
    formats: { B: MONEY }, widths: { A: 10, C: 10 },
    answer: '=IF(B2>=75,"large",IF(B2>=25,"medium","small"))',
    alt: ['=IFS(B2>=75,"large",B2>=25,"medium",TRUE,"small")', '=IF(B2<25,"small",IF(B2<75,"medium","large"))'],
    wrong: [
      { formula: '=IF(B2>=25,"medium",IF(B2>=75,"large","small"))', say: 'Excel stops at the first TRUE test, so every order of $25 or more is “medium” and nothing is ever “large”. Test the $75 threshold first.' },
      { formula: '=IFS(B2>=75,"large",B2>=25,"medium")', say: 'IFS returns #N/A when no test is TRUE, so small orders show #N/A. End with <x>TRUE,"small"</x> as a catch-all.' },
      { formula: '=IF(B2>=75,"large","medium")', say: 'That has only two outcomes. Nest a second IF in the false branch for medium and small.' },
      { formula: '=IF(B2>75,"large",IF(B2>25,"medium","small"))', say: 'The rule says “$75 or more”, so an order of exactly $75.00 is large and one of exactly $25.00 is medium: use >= at both boundaries.' },
      { formula: '=IF(B2>=75,"large",IF(B2>25,"medium","small"))', say: 'An order of exactly $25.00 is “medium” ($25 or more): the second test needs >= too.' },
    ],
    hints: ['Start with the most demanding test: <x>B2>=75</x>.', 'Put the second test in the false branch: <x>=IF(B2>=75,"large",IF(B2>=25,"medium","small"))</x>.'],
    solution: '<x>=IF(B2>=75,"large",IF(B2>=25,"medium","small"))</x>, or <x>=IFS(B2>=75,"large",B2>=25,"medium",TRUE,"small")</x>. The tests run from the highest threshold down; LC-10001 ($111.00) is large, LC-10002 ($30.60) medium and LC-10003 ($14.00) small. The boundary rows check the >= signs: $75.00 is large and $25.00 medium.',
  },
  {
    id: 'b03-fl-g4', type: 'formula', kind: 'applied',
    prompt: 'Column A holds order IDs such as LC-10001. In B2, write a formula that returns the number after “LC-” as a number (not text), so that the IDs can be sorted and compared. It will be filled down to B9.',
    sheet: { cells: { ...pick(G4, ['order_id']).cells, B1: 'order number' } },
    cell: 'B2', fill: 'B2:B9', view: 'A1:B9', widths: { A: 10, B: 14 },
    answer: '=VALUE(MID(A2,4,5))',
    alt: ['=VALUE(RIGHT(A2,5))', '=--RIGHT(A2,5)', '=RIGHT(A2,5)*1', '=VALUE(SUBSTITUTE(A2,"LC-",""))', '=VALUE(MID(A2,FIND("-",A2)+1,LEN(A2)))'],
    wrong: [
      { formula: '=MID(A2,4,5)', say: 'MID returns text: “10001” looks like a number but sorts as text and SUM skips it. Wrap it in VALUE.' },
      { formula: '=RIGHT(A2,5)', say: 'RIGHT returns text too. Wrap it in VALUE, or multiply it by 1.' },
      { formula: '=VALUE(LEFT(A2,5))', say: 'LEFT takes characters from the start: “LC-10”, which isn’t a number. The digits start at position 4.' },
    ],
    hints: ['The digits are characters 4 to 8: <x>MID(A2,4,5)</x> or <x>RIGHT(A2,5)</x>.', 'Those return text; VALUE turns text into a number.'],
    solution: '<x>=VALUE(MID(A2,4,5))</x> (or <x>=VALUE(RIGHT(A2,5))</x>). MID takes 5 characters starting at position 4, “10001”, and VALUE converts the text to the number 10001. If the prefix could vary in length, find the hyphen: <x>=VALUE(MID(A2,FIND("-",A2)+1,LEN(A2)))</x>.',
  },
];

export const independent = [
  {
    id: 'b03-fl-i1', type: 'formula', kind: 'applied',
    prompt: 'Column B holds order dates. In C2, write a formula for the last day of the order’s month (Ana groups orders by month-end date). It will be filled down to C9.',
    sheet: { cells: { ...pick(SPREAD, ['order_id', 'order_date']).cells, C1: 'month end' } },
    cell: 'C2', fill: 'C2:C9', view: 'A1:C9',
    formats: { B: 'date', C: 'date' }, widths: { A: 10, B: 13, C: 13 },
    answer: '=EOMONTH(B2,0)',
    alt: ['=DATE(YEAR(B2),MONTH(B2)+1,0)', '=EOMONTH(B2,1)-DAY(EOMONTH(B2,1))'],
    wrong: [
      { formula: '=EOMONTH(B2,1)', say: 'The second argument counts months ahead: 1 gives the end of next month. Use 0 for this month.' },
      { formula: '=EDATE(B2,1)', say: 'EDATE gives the same day next month, not the end of this month.' },
      { formula: '=B2+30', say: 'Adding 30 days doesn’t land on a month’s end. <x>EOMONTH(B2,0)</x> does, whatever the month’s length.' },
    ],
    solution: '<x>=EOMONTH(B2,0)</x>: the last day of the month 0 months after the date, formatted as a date. LC-10001 (1 March 2026) gives 31 March 2026. <x>=DATE(YEAR(B2),MONTH(B2)+1,0)</x> also works: day 0 of next month is the last day of this one.',
  },
  {
    id: 'b03-fl-i2', type: 'num', kind: 'applied',
    prompt: 'A breakfast for 50 guests needs one pastry box for every 12 guests, and boxes can’t be split. How many boxes does <x>=ROUNDUP(50/12,0)</x> say to order?',
    answer: 5, check: () => Math.ceil(50 / 12), unit: 'boxes', places: 0, tol: 0,
    wrong: [{ value: 4, say: '50 ÷ 12 = 4.17. Rounding to the nearest (ROUND) or down (INT) gives 4 boxes, which feed only 48 guests. ROUNDUP goes up to the next whole box.' }],
    solution: '50 ÷ 12 ≈ 4.17, and ROUNDUP(…,0) rounds away from zero to 5. Four boxes would cover only 48 guests.',
  },
  {
    id: 'b03-fl-i3', type: 'mc', kind: 'conceptual',
    prompt: 'B2 holds a channel’s order value and C2 its number of orders, which can be 0. Which formula for the average order value is safest?',
    options: [
      '<x>=IF(C2=0,"",B2/C2)</x>',
      '<x>=IFERROR(B2/C2,0)</x>',
      '<x>=B2/C2</x>',
      '<x>=IFNA(B2/C2,"")</x>',
    ],
    answer: 0,
    feedback: {
      1: 'IFERROR also turns a #REF! or #NAME? from a broken formula into 0, which looks like a real average. Test for the one case you expect.',
      2: 'A channel with no orders would show #DIV/0!, which is honest but untidy; the IF version handles that case on purpose.',
      3: 'IFNA catches only #N/A. Dividing by zero gives #DIV/0!, which IFNA lets through.',
    },
    solution: '<x>=IF(C2=0,"",B2/C2)</x> handles the one case you expect, a channel with no orders, and still lets any other error show. IFERROR would hide a broken reference behind a plausible 0.',
  },
  {
    id: 'b03-fl-i4', type: 'formula', kind: 'applied',
    prompt: 'Column B holds order dates. In C2, write a formula that returns TRUE if the order was placed on a Saturday or a Sunday and FALSE otherwise. It will be filled down to C9.',
    sheet: { cells: { ...pick(WEEK, ['order_id', 'order_date']).cells, C1: 'weekend?' } },
    cell: 'C2', fill: 'C2:C9', view: 'A1:C9',
    formats: { B: 'date' }, widths: { A: 10, B: 13, C: 10 },
    answer: '=WEEKDAY(B2,2)>5',
    alt: ['=WEEKDAY(B2,2)>=6', '=OR(WEEKDAY(B2)=1,WEEKDAY(B2)=7)', '=OR(WEEKDAY(B2,2)=6,WEEKDAY(B2,2)=7)'],
    wrong: [
      { formula: '=WEEKDAY(B2)>5', say: 'With the default return type, Sunday is 1 and Friday is 6, so this flags Fridays and Saturdays. Use return type 2 (Monday = 1 … Sunday = 7).' },
      { formula: '=WEEKDAY(B2,2)>=5', say: 'With return type 2, 5 is Friday. Saturday and Sunday are 6 and 7.' },
    ],
    solution: '<x>=WEEKDAY(B2,2)>5</x>. With return type 2, Monday is 1 and Sunday is 7, so Saturday (6) and Sunday (7) are the values above 5. 1 March 2026 was a Sunday, so LC-10001 shows TRUE.',
  },
  {
    id: 'b03-fl-i5', type: 'fill', kind: 'numerical',
    prompt: 'A2 holds the order ID LC-10144 and A3 the product name Cold Brew. Choose what each formula returns.',
    text: '<x>=LEN(A2)</x> returns [[0]]; <x>=FIND("-",A2)</x> returns [[1]]; <x>=SEARCH("b",A3)</x> returns [[2]]; <x>=FIND("b",A3)</x> returns [[3]].',
    blanks: [
      { options: ['3', '6', '8', '#VALUE!'], answer: 2 },
      { options: ['3', '6', '8', '#VALUE!'], answer: 0 },
      { options: ['3', '6', '8', '#VALUE!'], answer: 1 },
      { options: ['3', '6', '8', '#VALUE!'], answer: 3 },
    ],
    solution: 'LC-10144 has 8 characters, and its hyphen is the 3rd. In “Cold Brew” the B is the 6th character (the space counts). SEARCH ignores case, so it finds the capital B at 6; FIND is case-sensitive, finds no lowercase b, and returns #VALUE!.',
  },
  {
    id: 'b03-fl-i6', type: 'formula', kind: 'applied',
    prompt: 'Eight orders pasted from an older export (fictional: one discount was mistyped). In F2, write a flag that shows “check” for a subscription order (D is yes) whose discount in E differs from quantity × price × the rate in H1, rounded to the cent, and “ok” for every other order. It will be filled down to F9.',
    sheet: { cells: audit, fixed: ['B2:C9', 'E2:E9'] },
    cell: 'F2', fill: 'F2:F9', view: 'A1:H9',
    formats: { C: MONEY, E: MONEY, H1: '0%' }, widths: { A: 10, G: 20 },
    answer: '=IF(AND(D2="yes",E2<>ROUND(B2*C2*$H$1,2)),"check","ok")',
    alt: ['=IF(D2<>"yes","ok",IF(E2=ROUND(B2*C2*$H$1,2),"ok","check"))', '=IF(OR(D2<>"yes",E2=ROUND(B2*C2*$H$1,2)),"ok","check")'],
    wrong: [
      { formula: '=IF(E2<>ROUND(B2*C2*$H$1,2),"check","ok")', say: 'That flags every order whose discount isn’t 10%, including the promotion-code orders, which aren’t subscriptions. Add the subscription test with AND.' },
      { formula: '=IF(OR(D2="yes",E2<>ROUND(B2*C2*$H$1,2)),"check","ok")', say: 'OR flags an order if either test is TRUE, so every subscription order is flagged. Both must be TRUE: use AND.' },
      { formula: '=IF(AND(D2="yes",E2<>ROUND(B2*C2*0.1,2)),"check","ok")', say: 'The rate is typed into the formula, so the flag ignores H1 if the discount ever changes. Refer to $H$1.' },
    ],
    solution: `<x>=IF(AND(D2="yes",E2<>ROUND(B2*C2*$H$1,2)),"check","ok")</x>. Only ${ORDERS[9][0]} is flagged: a subscription order whose 10% discount should be $1.65 but was typed as $1.17. ${ORDERS[0][0]} and ${ORDERS[3][0]} carry $5.00 promotion discounts, but they aren’t subscriptions, so the AND keeps them out.`,
  },
];

export const check = [
  {
    id: 'b03-fl-k1', type: 'mc', kind: 'conceptual',
    prompt: 'In another shop’s export the rating column holds numbers 1 to 5, with the text “n/a” typed into unrated orders. Which formula counts the rated orders?',
    options: ['<x>=COUNT(M2:M232)</x>', '<x>=COUNTA(M2:M232)</x>', '<x>=COUNTBLANK(M2:M232)</x>', '<x>=ROWS(M2:M232)</x>'],
    answer: 0,
    feedback: {
      1: 'COUNTA counts every cell that isn’t empty, so the “n/a” cells are counted too.',
      2: 'There are no empty cells: the unrated orders hold the text “n/a”. COUNTBLANK would return 0.',
      3: 'ROWS counts every row in the range, rated or not.',
    },
    solution: 'COUNT counts only numbers, so it counts the ratings and skips the “n/a” text. COUNTA would count every order, and COUNTBLANK would find no empty cells.',
  },
  {
    id: 'b03-fl-k2', type: 'num', kind: 'numerical',
    prompt: 'A catering quote works out at $1,234.56. Ana rounds it up to the next $10 with <x>=ROUNDUP(B2,-1)</x>. What does the formula return?',
    answer: 1240, check: () => Math.ceil(1234.56 / 10) * 10, unit: '$', places: 0, tol: 0,
    wrong: [
      { value: 1230, say: 'That is ROUNDDOWN (or ROUND, which goes to the nearer 10). ROUNDUP always goes away from zero.' },
      { value: 1234.6, say: 'A num_digits of −1 rounds to the left of the decimal point, to tens, not to one decimal place.' },
    ],
    solution: 'A negative num_digits rounds to the left of the decimal point: −1 means to the nearest ten, and ROUNDUP always goes up (away from zero), so $1,234.56 becomes $1,240.',
  },
  {
    id: 'b03-fl-k3', type: 'formula', kind: 'applied',
    prompt: 'Column B holds the dates of subscription orders. A subscription renews on the same day of the next month. In C2, write the renewal date; it will be filled down to C9.',
    sheet: { cells: { ...pick(K3, ['order_id', 'order_date']).cells, C1: 'renews on' } },
    cell: 'C2', fill: 'C2:C9', view: 'A1:C9',
    formats: { B: 'date', C: 'date' }, widths: { A: 10, B: 13, C: 13 },
    answer: '=EDATE(B2,1)',
    wrong: [
      { formula: '=B2+30', say: 'Months have 28 to 31 days, so adding 30 lands on the wrong day for most months. <x>EDATE(B2,1)</x> gives the same day next month.' },
      { formula: '=EOMONTH(B2,1)', say: 'EOMONTH gives the last day of next month, not the same day.' },
      { formula: '=EOMONTH(B2,0)+1', say: 'That is the first day of next month, which is the renewal date only for orders placed on the 1st.' },
    ],
    solution: '<x>=EDATE(B2,1)</x>, formatted as a date: the same day of the month, one month later. An order on 2 March 2026 renews on 2 April; adding 30 days would give 1 April.',
  },
  {
    id: 'b03-fl-k4', type: 'classify', kind: 'conceptual',
    prompt: 'Choose the function that does each job.',
    items: [
      'Count the orders that have a rating, when ratings are numbers and unrated cells are empty',
      'Count the rows that have an order ID',
      'Count the orders with no rating',
      'Round a quoted price up to the next whole dollar',
      'Round a price to the nearest 5 cents',
      'Find the position of the hyphen in an order ID',
    ],
    categories: ['COUNT', 'COUNTA', 'COUNTBLANK', 'ROUNDUP', 'MROUND', 'FIND'],
    answer: [0, 1, 2, 3, 4, 5],
    feedback: {
      1: 'Order IDs are text, which COUNT ignores; COUNTA counts every non-empty cell.',
      3: 'ROUND would go down as well as up; <x>ROUNDUP(B2,0)</x> always goes up.',
      4: '<x>MROUND(B2,0.05)</x> rounds to the nearest multiple of 0.05.',
    },
    solution: 'COUNT counts numbers (the ratings), COUNTA counts non-empty cells (the text IDs), COUNTBLANK counts empty cells (unrated orders), ROUNDUP(…,0) always rounds up to a whole number, MROUND(…,0.05) rounds to a multiple of 5 cents, and FIND returns a character’s position.',
  },
  {
    id: 'b03-fl-k5', type: 'formula', kind: 'applied',
    prompt: 'Build a label such as “LC-10001 (Mar)” from the order ID in A2 and the order date in B2: the ID, a space, and the three-letter month name in parentheses. Write it in C2; it will be filled down to C9.',
    sheet: { cells: { ...pick(SPREAD, ['order_id', 'order_date']).cells, C1: 'label' } },
    cell: 'C2', fill: 'C2:C9', view: 'A1:C9',
    formats: { B: 'date' }, widths: { A: 10, B: 13, C: 18 },
    answer: '=A2&" ("&TEXT(B2,"mmm")&")"',
    alt: ['=CONCAT(A2," (",TEXT(B2,"mmm"),")")', '=A2&" ("&LEFT(TEXT(B2,"mmmm"),3)&")"'],
    wrong: [
      { formula: '=A2&" ("&B2&")"', say: 'Joined to text, a date shows its serial number, “LC-10001 (46082)”. Convert it with <x>TEXT(B2,"mmm")</x>.' },
      { formula: '=A2&"("&TEXT(B2,"mmm")&")"', say: 'The label needs a space before the parenthesis: <x>" ("</x>.' },
      { formula: '=A2&" ("&MONTH(B2)&")"', say: 'MONTH gives the month number, 3, not its name. <x>TEXT(B2,"mmm")</x> gives “Mar”.' },
    ],
    solution: '<x>=A2&" ("&TEXT(B2,"mmm")&")"</x>. <x>&</x> joins the pieces; <x>TEXT(B2,"mmm")</x> turns the date into “Mar”. Without TEXT the date would appear as its serial number.',
  },
  {
    id: 'b03-fl-k6', type: 'mc', kind: 'conceptual',
    prompt: 'Which formula labels an order total in F2 “large” if it is $100 or more, “medium” if it is $40 or more, and “small” otherwise?',
    options: [
      '<x>=IFS(F2>=100,"large",F2>=40,"medium",TRUE,"small")</x>',
      '<x>=IFS(F2>=40,"medium",F2>=100,"large",TRUE,"small")</x>',
      '<x>=IFS(F2>=100,"large",F2>=40,"medium")</x>',
      '<x>=IF(F2>=100,"large",IF(F2>=40,"medium"))</x>',
    ],
    answer: 0,
    feedback: {
      1: 'IFS returns the first TRUE result, so every order of $40 or more, including the $100 ones, is labelled “medium”.',
      2: 'With no catch-all, an order under $40 matches no test and IFS returns #N/A.',
      3: 'The inner IF has no value_if_false, so orders under $40 show FALSE instead of “small”.',
    },
    solution: 'Tests run from the highest threshold down, and IFS needs a final TRUE as a catch-all; the first option does both. The nested IF also needs its last argument, <x>"small"</x>.',
  },
];
