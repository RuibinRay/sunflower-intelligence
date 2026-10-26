// functions-and-logic.js — B03 · Functions, logic, text and dates. Content only; exercises are in
// functions-and-logic.ex.js. Lantern's orders and its catering quote rule come from case.js (ORDERS, QUOTE, DERIVED);
// the three quote requests and Oakridge Fitness are fictional and labelled. Excel's behaviour is cited in `references`.
import { ORDERS, ORDER_COLUMNS, QUOTE, quote, DERIVED as D } from './case.js?v=16';

const col = (name) => ORDER_COLUMNS.indexOf(name);
const order = (i) => Object.fromEntries(ORDER_COLUMNS.map((c, k) => [c, ORDERS[i][k]]));
const first = Array.from({ length: 8 }, (_, i) => order(i));
const bulk = order(ORDERS.findIndex((r) => r[0] === 'LC-10144'));
const DAY = 86400000;
const serial = (y, m, d) => (Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / DAY;
const weekday = (y, m, d) => new Date(Date.UTC(y, m - 1, d)).getUTCDay();          // 0 = Sunday
const workdays = (a, b) => { let n = 0; for (let t = a; t <= b; t += DAY) { const w = new Date(t).getUTCDay(); if (w > 0 && w < 6) n++; } return n; };
const money = (x) => `$${x.toFixed(2)}`;
const rated = ORDERS.map((r) => r[col('rating')]).filter((v) => v != null);
const ratingSum = rated.reduce((s, x) => s + x, 0);
const subs = ORDERS.filter((r) => r[col('subscription')] === 'yes');
const label = (t) => (t >= 75 ? 'large' : t >= 25 ? 'medium' : 'small');
const REQUESTS = [                                   // fictional quote requests for September 2026
  { client: 'Wrenmere Insurance', guests: 40, hours: 3, pastries: 'yes', date: [2026, 9, 15] },
  { client: 'Tansymoor Books', guests: 18, hours: 2, pastries: 'no', date: [2026, 9, 18] },
  { client: 'Corrandale Clinic', guests: 120, hours: 5, pastries: 'yes', date: [2026, 9, 26] },
];
const raw = (q) => QUOTE.setup + QUOTE.perGuest * q.guests + QUOTE.perHour * q.hours + (q.pastries === 'yes' ? QUOTE.platter : 0);

export default {
  slug: 'functions-and-logic',
  title: 'Functions, logic, text and dates',
  blurb: 'Excel’s built-in functions do the heavy lifting: counting exactly what you mean, rounding by a business rule, making decisions with IF, taking text apart and joining it, and calculating with dates. Learn how each one works, where each one trips people up, and how to handle errors without hiding them.',
  status: 'reviewed',
  objectives: [
    'Write functions with the right syntax, arguments and nesting, and choose between SUM, AVERAGE, MIN, MAX, COUNT, COUNTA and COUNTBLANK by exactly what each counts.',
    'Choose between ROUND, ROUNDUP, ROUNDDOWN, INT and MROUND to round by a business rule, and explain the choice.',
    'Build decisions with IF, nested IF, IFS, AND, OR and NOT, putting the conditions in the right order.',
    'Use IFERROR and IFNA to handle the errors you expect without hiding the ones you don’t.',
    'Use LEFT, RIGHT, MID, LEN, FIND, SEARCH, TRIM, SUBSTITUTE, TEXT and the <x>&</x> operator to split, clean and join text.',
    'Calculate with dates using DATE, YEAR, MONTH, DAY, EOMONTH, EDATE, WEEKDAY and NETWORKDAYS.',
  ],
  prerequisites: [
    { lesson: 'b03/cells-and-formulas', why: 'Functions sit inside formulas, take references as arguments and are filled down like any formula; you need relative and absolute references.' },
    { lesson: 'b02/types-and-formats', why: 'Dates are serial numbers and numbers can arrive as text; the date and text functions here work on those types.' },
    { lesson: 'b02/text-and-categories', why: 'Stray spaces, letter case and inconsistent spellings are why TRIM, PROPER and SUBSTITUTE exist.' },
  ],
  case: 'lantern',

  concept: [
    { case: `Ana’s next questions about the spring orders are small but exact. Does every subscription order carry exactly the 10% discount Lantern promises? How many orders were rated, and what was the average rating? Which month, and which day of the week, was each order placed on? And can she sort the orders by the number inside their IDs, such as the 10144 in LC-10144?` },
    { p: `Each question needs a function: one of Excel’s built-in calculations, called by name.` },

    { h: 'What a function is' },
    { p: 'A <g>function</g> is a named calculation that Excel already knows. You call it inside a formula by its name followed by parentheses holding its <g>argument</g>s, the values it works on, separated by commas: <x>=SUM(J2:J232)</x> adds 231 cells, and <x>=ROUND(J2,0)</x> rounds J2 to a whole number. Microsoft writes each function’s syntax with the optional arguments in square brackets, as in <x>WEEKDAY(serial_number,[return_type])</x>, so you can leave the second one out. An argument can be a value, a reference, a range or another function.' },
    { p: 'Putting one function inside another is nesting: in <x>=ROUND(AVERAGE(M2:M232),2)</x> the average is calculated first and then rounded. Microsoft’s limits are 255 arguments to a function and 64 levels of nesting, far more than a readable formula should use. To find a function, start typing its name after an equals sign, or use Insert Function (Shift+F3); AutoSum (Alt+= in Windows, Shift+Command+T on a Mac) inserts a SUM formula for you to check and confirm.' },

    { h: 'Counting exactly what you mean' },
    { p: 'SUM, AVERAGE, MIN and MAX work on the numbers in a range. The three counting functions differ in exactly what they count, and the difference matters whenever a column has gaps or text in it.' },
    { table: {
      caption: 'What each counting function counts when the cell is in a range (Microsoft’s function pages)',
      head: ['A cell holding …', 'COUNT', 'COUNTA', 'COUNTBLANK'],
      rows: [
        ['A number or a date', 'Yes', 'Yes', 'No'],
        ['Zero', 'Yes', 'Yes', 'No'],
        ['Text', 'No', 'Yes', 'No'],
        ['TRUE or FALSE', 'No', 'Yes', 'No'],
        ['An error value', 'No', 'Yes', 'No'],
        ['A formula that returns <x>""</x> (empty text)', 'No', 'Yes', 'Yes'],
        ['Nothing at all', 'No', 'No', 'Yes'],
      ],
    } },
    { p: `Lantern’s <code>rating</code> column (M) is a good test. Customers rated ${rated.length} of the ${D.orders} orders, and the other ${D.orders - rated.length} cells are empty. <x>=COUNT(M2:M232)</x> returns ${rated.length}, <x>=COUNTBLANK(M2:M232)</x> returns ${D.orders - rated.length}, and <x>=COUNTA(A2:A232)</x>, on the order IDs, returns ${D.orders}. AVERAGE skips empty cells, text and logical values in a range but includes zeros, so <x>=AVERAGE(M2:M232)</x> is <m>${ratingSum} \\div ${rated.length} \\approx ${(ratingSum / rated.length).toFixed(2)}</m>, the average of the ratings actually given. Had someone typed 0 into the unrated cells, the same formula would return <m>${ratingSum} \\div ${D.orders} \\approx ${(ratingSum / D.orders).toFixed(2)}</m>: a blank means “no answer”, a 0 is an answer.` },

    { h: 'Rounding by a rule' },
    { p: 'The previous lesson separated formatting, which changes the display, from rounding, which changes the stored value. Excel has a rounding function for each business rule:' },
    { table: {
      caption: 'Rounding functions (the ROUND, INT and MROUND examples are Microsoft’s)',
      head: ['Function', 'Rule', 'Examples'],
      rows: [
        ['<x>ROUND(number,num_digits)</x>', 'To the nearest, halves away from zero; negative digits round to the left of the point', '<x>=ROUND(2.15,1)</x> is 2.2; <x>=ROUND(-1.475,2)</x> is −1.48; <x>=ROUND(21.5,-1)</x> is 20'],
        ['<x>ROUNDUP(number,num_digits)</x>', 'Always away from zero', '<x>=ROUNDUP(3.2,0)</x> is 4'],
        ['<x>ROUNDDOWN(number,num_digits)</x>', 'Always towards zero', '<x>=ROUNDDOWN(3.2,0)</x> is 3'],
        ['<x>INT(number)</x>', 'Down to the next whole number, so negatives move away from zero', '<x>=INT(8.9)</x> is 8; <x>=INT(-8.9)</x> is −9'],
        ['<x>MROUND(number,multiple)</x>', 'To the nearest multiple; both arguments must have the same sign', '<x>=MROUND(10,3)</x> is 9; <x>=MROUND(1.3,0.2)</x> is 1.4; <x>=MROUND(5,-2)</x> is #NUM!'],
      ],
    } },
    { p: 'Choose by asking what happens in the business. Money that changes hands is rounded to the cent with ROUND. Things that come in whole units are rounded up if you need enough of them: a breakfast for 45 guests with one pastry box per 12 guests needs <x>=ROUNDUP(45/12,0)</x>, 4 boxes, because 3.75 boxes can’t be bought, and ROUND would also give 4 here only by luck (50 guests need 5, while ROUND gives 4). Whole units you can make from stock are rounded down with ROUNDDOWN or INT. Prices set to the nearest 5 cents use MROUND: a 6% rise takes $15.50 to $16.43, and <x>=MROUND(16.43,0.05)</x> gives $16.45.' },
  ],

  theory: [
    { h: 'Logical tests and IF' },
    { p: 'A comparison such as <x>=J2>=50</x> returns a <g>logical value</g>, TRUE or FALSE. IF turns that into a decision: <x>IF(logical_test,value_if_true,value_if_false)</x> returns its second argument when the test is TRUE and its third when it is FALSE. Text arguments go in double quotation marks; without them Excel looks for a name and returns #NAME?. Numbers go without quotes.' },
    { p: `Lantern promises subscribers 10% off. With the rate in an input cell P1 (10%), the discount a subscription order should carry is <x>=IF(L2="yes",ROUND(G2*H2*$P$1,2),0)</x>: if the subscription column says yes, 10% of quantity times price, rounded to the cent; otherwise nothing. Comparing that with the recorded discount in column I tests the promise row by row, and the simple example does it.` },
    { p: 'AND, OR and NOT combine tests. <x>AND(test1,test2,…)</x> is TRUE only when every test is TRUE; <x>OR(…)</x> is TRUE when at least one is; <x>NOT(test)</x> reverses a test. Microsoft allows up to 255 conditions, and notes that AND ignores text and empty cells inside a range argument and returns #VALUE! if it finds no logical values at all. A flag for orders that need checking is then <x>=IF(AND(L2="yes",I2<>N2),"check","ok")</x>: a subscription order whose recorded discount differs from the expected one in N2.' },
    { p: 'Comparisons with = ignore letter case: <x>="Yes"="yes"</x> returns TRUE (try it). Microsoft describes <a href="https://support.microsoft.com/en-us/excel/exact-function">EXACT</a> as the case-sensitive test, for when case matters. Lantern’s <code>subscription</code> column is all lower case, so the question doesn’t arise, but data typed by people often isn’t.' },
    { p: 'Comparisons don’t convert text, either: <x>="10"=10</x> is FALSE, and an order total stored as the text “$58.00” passes <x>=J2>=75</x>, because Excel ranks text above numbers in a comparison. Convert such values to numbers first, as B02 showed, before a formula makes decisions with them.' },
    { h: 'Several outcomes: nested IF and IFS' },
    { p: 'For more than two outcomes, put an IF in the false branch of another. For the packing rota, Ana flags orders of $75 or more “large”, $25 or more “medium”, and the rest “small” (packing labels, not the $20, $40 and $100 order-size bands she reports with, which Module 2 looks up from a table): <x>=IF(J2>=75,"large",IF(J2>=25,"medium","small"))</x>. Excel stops at the first test that is TRUE, so the order of the tests is part of the logic. Test the $25 threshold first and a $111 order is labelled “medium”, because 111 ≥ 25 is TRUE before the $75 test is ever reached. Microsoft makes the same point with a commission example, and warns that, although Excel allows 64 nested IFs, such formulas are hard to get right and harder to maintain.' },
    { p: 'IFS lists the tests and their results in pairs: <x>=IFS(J2>=75,"large",J2>=25,"medium",TRUE,"small")</x>. It is available in Excel 2019, 2021 and 2024 and in Microsoft 365, and takes up to 127 conditions. If no test is TRUE, IFS returns #N/A, so the last test is usually <x>TRUE</x>, a catch-all. Two habits help with either form: put the thresholds in input cells rather than in the formula, and when the bands multiply, use a lookup table, which Module 2 builds with an approximate-match lookup.' },

    { h: 'Errors you expect and errors you don’t' },
    { p: '<x>IFERROR(value,value_if_error)</x> returns the value unless it is an error, in which case it returns the second argument. It catches every error type: #N/A, #VALUE!, #REF!, #DIV/0!, #NUM!, #NAME? and #NULL!. <x>IFNA(value,value_if_na)</x> catches only #N/A, the error a lookup returns when a key is missing; IFNA was added in Excel 2013.' },
    { p: 'That breadth is the danger. Suppose a cell works out each channel’s average order value as <x>=IFERROR(B2/C2,0)</x>, so that a channel with no orders shows 0 rather than #DIV/0!. If someone later deletes a column the formula used, or mistypes a reference, the #REF! or #NAME? that should have shouted is also turned into 0, and 0 looks like a real result. Microsoft’s <a href="https://support.microsoft.com/en-us/excel/how-to-correct-a-div-0-error">page on #DIV/0! errors</a> makes the same point: IFERROR suppresses every error, so check that a formula works before you add error handling. Test for the case you expect instead, <x>=IF(C2=0,"",B2/C2)</x>, and keep IFNA for lookups, where #N/A is the expected error.' },

    { h: 'Taking text apart' },
    { p: 'A piece of text in a cell is a <g>text string</g>, and its characters are numbered from 1. LEFT and RIGHT take characters from either end, MID takes them from a given position, and LEN counts them. For LC-10001 in A2, <x>=LEFT(A2,2)</x> is “LC”, <x>=MID(A2,4,5)</x> is “10001” and <x>=LEN(A2)</x> is 8.' },
    { figure: {
      svg: '<svg viewBox="0 0 560 190" xmlns="http://www.w3.org/2000/svg" font-size="13" fill="currentColor"><g stroke="var(--rule-strong)" fill="none"><rect x="80" y="60" width="44" height="40"/><rect x="124" y="60" width="44" height="40"/><rect x="168" y="60" width="44" height="40"/><rect x="212" y="60" width="44" height="40"/><rect x="256" y="60" width="44" height="40"/><rect x="300" y="60" width="44" height="40"/><rect x="344" y="60" width="44" height="40"/><rect x="388" y="60" width="44" height="40"/></g><g font-family="ui-monospace, Menlo, Consolas, monospace" font-size="18" text-anchor="middle"><text x="102" y="87">L</text><text x="146" y="87">C</text><text x="190" y="87">-</text><text x="234" y="87">1</text><text x="278" y="87">0</text><text x="322" y="87">0</text><text x="366" y="87">0</text><text x="410" y="87">1</text></g><g fill="var(--ink-3)" text-anchor="middle" font-size="12"><text x="102" y="118">1</text><text x="146" y="118">2</text><text x="190" y="118">3</text><text x="234" y="118">4</text><text x="278" y="118">5</text><text x="322" y="118">6</text><text x="366" y="118">7</text><text x="410" y="118">8</text></g><text x="20" y="118" fill="var(--ink-3)" font-size="12">position</text><path d="M82 50 V42 H166 V50" stroke="var(--series-1)" stroke-width="2" fill="none"/><text x="124" y="34" text-anchor="middle" fill="var(--series-1)" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="12">LEFT(A2,2)</text><path d="M214 50 V42 H430 V50" stroke="var(--series-2)" stroke-width="2" fill="none"/><text x="322" y="34" text-anchor="middle" fill="var(--series-2)" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="12">MID(A2,4,5) or RIGHT(A2,5)</text><path d="M190 158 V128" stroke="var(--ink)" stroke-width="1.5" fill="none"/><text x="190" y="174" text-anchor="middle" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="12">FIND("-",A2) = 3</text><path d="M80 140 H432" stroke="var(--ink-3)" stroke-width="1" stroke-dasharray="4 3" fill="none"/><text x="470" y="144" text-anchor="middle" fill="var(--ink-3)" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="12">LEN(A2) = 8</text></svg>',
      caption: 'The order ID LC-10001 as a text string. Characters are numbered from 1; LEFT, MID and RIGHT take characters by position, FIND returns the position of the first hyphen, and LEN counts all eight characters.',
      alt: 'The text LC-10001 drawn as eight boxes, one character each, with positions 1 to 8 beneath them. A bracket over the first two boxes, L and C, is labelled LEFT(A2,2). A bracket over boxes 4 to 8, the digits 10001, is labelled MID(A2,4,5) or RIGHT(A2,5). An arrow points up to box 3, the hyphen, labelled FIND("-",A2) = 3. A dashed line under all eight boxes is labelled LEN(A2) = 8.',
    } },
    { p: 'FIND and SEARCH return the position of one string inside another, which lets a formula cope with text of different lengths: <x>=MID(A2,FIND("-",A2)+1,LEN(A2))</x> returns everything after the first hyphen, however long the prefix. The two differ in a way that matters. FIND is case-sensitive and doesn’t allow wildcards; SEARCH ignores case and allows them (the next lesson explains wildcards). Microsoft’s example: in “Miriam McGovern”, <x>=FIND("M",A2)</x> is 1 but <x>=FIND("m",A2)</x> is 6. If the text isn’t found, both return #VALUE!.' },
    { p: 'The results of LEFT, MID and RIGHT are text, even when they look like numbers. “10001” sorts as text and SUM skips it. <x>=VALUE(MID(A2,4,5))</x> converts it to the number 10001; Microsoft’s VALUE accepts any number, date or time format Excel recognises, so <x>=VALUE("$1,000")</x> is 1000. An arithmetic operator converts too, which is why <x>=--RIGHT(A2,5)</x> (minus minus) also works.' },
    { h: 'Cleaning and joining text' },
    { p: 'UPPER, LOWER and PROPER change letter case: <x>=PROPER("hOUSE bLEND")</x> is “House Blend”. TRIM removes spaces from the ends of a string and reduces runs of spaces inside it to one, but Microsoft warns that it removes only the ordinary space character (code 32), not the non-breaking space (code 160) that web pages and exports often contain; B02’s lesson on text showed how to find those. <x>SUBSTITUTE(text,old_text,new_text)</x> replaces one string with another: <x>=SUBSTITUTE(A2,"LC-","")</x> leaves “10001”. The full cleaning workflow, on Lantern’s raw export, is in the next module.' },
    { p: 'The <x>&</x> operator joins text: <x>=A2&" ("&L2&")"</x> gives “LC-10001 (no)” for the first order. Joining is called <g>concatenation</g>. CONCAT does the same for a list of values or ranges, and replaces the older CONCATENATE, which stays for compatibility. TEXTJOIN adds a delimiter between the pieces and can skip empty cells: <x>=TEXTJOIN(", ",TRUE,D2:D6)</x>. Both are available in Excel 2019 and later and in Microsoft 365, and both return #VALUE! if the result would exceed a cell’s 32,767 characters.' },
    { p: 'TEXT formats a number as text: <x>=TEXT(J2,"$#,##0.00")</x> gives “$111.00” and <x>=TEXT(B2,"mmmm")</x> gives “March”. The result is text, which is exactly what you want in a label and exactly what you don’t want in a calculation. Microsoft’s advice is to keep the original value in one cell and use TEXT in another.' },

    { h: 'Dates are numbers' },
    { p: `As B02 showed, Excel stores a date as a <g>serial date</g>: in the default 1900 date system, 1 January 1900 is 1, and Lantern’s first order day, 1 March 2026, is ${serial(2026, 3, 1)}. Because dates are numbers, subtracting one from another gives a number of days, and adding 7 gives the same weekday a week later. Excel <a href="https://support.microsoft.com/kb/214326">treats 1900 as a leap year</a>, which it wasn’t, for compatibility with Lotus 1-2-3; the only consequence Microsoft lists is that WEEKDAY is wrong for dates before 1 March 1900.` },
    { table: {
      caption: 'Date functions, applied to LC-10001’s order date (1 March 2026) in B2',
      head: ['Formula', 'Returns', 'What it does'],
      rows: [
        ['<x>=DATE(2026,3,1)</x>', String(serial(2026, 3, 1)), 'Builds a date from a year, month and day; months above 12 and days past the month’s end roll forward'],
        ['<x>=YEAR(B2)</x>, <x>=MONTH(B2)</x>, <x>=DAY(B2)</x>', '2026, 3, 1', 'Take a date apart'],
        ['<x>=TEXT(B2,"mmmm")</x>', 'March', 'A month name, as text (“mmm” gives Mar)'],
        ['<x>=EOMONTH(B2,0)</x>', `${serial(2026, 3, 31)} (31 March 2026)`, 'The last day of the month, 0 months on; <x>=EOMONTH(B2,-1)+1</x> is the first day of the month'],
        ['<x>=EDATE(B2,1)</x>', `${serial(2026, 4, 1)} (1 April 2026)`, 'The same day of the month, one month later'],
        ['<x>=WEEKDAY(B2)</x>', String(weekday(2026, 3, 1) + 1), 'Day of the week, 1 (Sunday) to 7 (Saturday); 1 March 2026 was a Sunday'],
        ['<x>=WEEKDAY(B2,2)</x>', '7', 'With return type 2, 1 (Monday) to 7 (Sunday)'],
        ['<x>=NETWORKDAYS(B2,EOMONTH(B2,0))</x>', String(workdays(Date.UTC(2026, 2, 1), Date.UTC(2026, 2, 31))), 'Whole working days (Monday to Friday) from the order to the month’s end, both dates counted'],
      ],
    } },
    { p: 'DATE rolls over in Microsoft’s documented way: <x>=DATE(2008,14,2)</x> is 2 February 2009 and <x>=DATE(2008,1,35)</x> is 4 February 2008, which makes month arithmetic safe. Microsoft also advises four-digit years, because DATE adds 1900 to a year from 0 to 1899. NETWORKDAYS takes an optional list of holidays as a third argument, and NETWORKDAYS.INTL handles weekends other than Saturday and Sunday. A month is not 30 days: <x>=B2+30</x> lands on 31 March, while <x>=EDATE(B2,1)</x> lands on 1 April, which is the date a monthly subscription actually renews. A date stored as text in a format Excel recognises (“March 2, 2026” is one with US settings) is turned into a serial number with <a href="https://support.microsoft.com/en-us/excel/datevalue-function">DATEVALUE</a>; the next module uses it, with the day-and-month caution from B02, on Lantern’s raw export.' },
    { p: 'You may meet DATEDIF, which counts complete years, months or days between two dates: <x>=DATEDIF(B2,C2,"M")</x>. Microsoft keeps it to support old Lotus 1-2-3 workbooks, warns that it “may calculate incorrect results under certain scenarios”, advises against its “MD” unit, and notes that it returns #NUM! when the start date is after the end date. For days, subtract the dates; for months, prefer a formula you can check.' },
  ],

  formulas: [
    { id: 'subscription-discount', name: 'Expected subscription discount',
      tex: String.raw`d = \operatorname{round}(r \times q \times p,\ 2) \text{ if a subscription order, otherwise } 0`,
      where: [
        [String.raw`d`, 'The discount the order should carry', '$'],
        [String.raw`r`, 'The subscription discount rate (10% at Lantern)', ''],
        [String.raw`q`, 'Quantity', 'items'],
        [String.raw`p`, 'Unit price', '$ per item'],
      ],
      note: 'In Excel: <x>=IF(L2="yes",ROUND(G2*H2*$P$1,2),0)</x>, with the rate in P1.' },
    { id: 'units-needed', name: 'Whole units needed',
      tex: String.raw`n = \left\lceil \dfrac{g}{k} \right\rceil`,
      where: [
        [String.raw`n`, 'Units to buy, rounded up to a whole number', 'units'],
        [String.raw`g`, 'What has to be covered, such as guests', 'guests'],
        [String.raw`k`, 'How much one unit covers, such as guests per pastry box', 'guests per unit'],
      ],
      note: 'The brackets ⌈ ⌉ mean “round up”. In Excel: <x>=ROUNDUP(B2/12,0)</x>.' },
    { id: 'catering-quote', name: 'Lantern’s catering quote (one-day event)',
      tex: String.raw`Q = \max\left(M,\ S + a\,g + b\,h + P\,x\right)`,
      where: [
        [String.raw`Q`, 'The quoted price', '$'],
        [String.raw`M`, 'The minimum invoice', '$'],
        [String.raw`S`, 'The setup charge for the day', '$'],
        [String.raw`a`, 'The price per guest', '$ per guest'],
        [String.raw`g`, 'Number of guests', 'guests'],
        [String.raw`b`, 'The charge per hour of service', '$ per hour'],
        [String.raw`h`, 'Hours of service', 'hours'],
        [String.raw`P`, 'The pastry platter charge', '$'],
        [String.raw`x`, '1 if the client wants pastries, 0 if not', ''],
      ],
      assumptions: 'Ana’s quote sheet (fictional). Invoices can differ from the quote by bespoke changes.',
      note: 'In Excel, with the five inputs in B1:B5: <x>=MAX($B$5,$B$1+$B$2*B9+$B$3*C9+IF(D9="yes",$B$4,0))</x>.' },
  ],

  examples: [
    { level: 'simple', title: 'Checking the subscription discounts', fictional: true,
      setup: 'Lantern promises subscribers 10% off. P1 holds 10%. For the first six orders, work out in column N the discount each order should carry, and flag in column O any subscription order whose recorded discount (column I) differs.',
      table: {
        caption: 'The first six orders (G quantity, H unit price, I discount, L subscription)',
        head: ['Order', 'G', 'H', 'I', 'L', 'N: expected'],
        align: ['l', 'r', 'r', 'r', 'l', 'r'],
        rows: first.slice(0, 6).map((o) => [o.order_id, String(o.quantity), money(o.unit_price), money(o.discount), o.subscription, money(o.subscription === 'yes' ? Math.round(o.quantity * o.unit_price * 10) / 100 : 0)]),
      },
      steps: [
        'Write the rule as a decision: if the order is a subscription, 10% of quantity × price, rounded to the cent; otherwise 0. In N2: <x>=IF(L2="yes",ROUND(G2*H2*$P$1,2),0)</x>. The rate reference is absolute so that it survives being filled down.',
        `Fill down. LC-10002 is a subscription: <m>2 \\times 17 \\times 0.10 = 3.40</m>, which equals its recorded discount. LC-10006: <m>1 \\times 14 \\times 0.10 = 1.40</m>, also equal. The other four are not subscriptions, so N shows $0.00.`,
        'Flag only what matters. In O2: <x>=IF(AND(L2="yes",I2<>N2),"check","ok")</x>. LC-10001 and LC-10004 carry a $5.00 discount that N doesn’t expect, but they aren’t subscriptions: their discount is a promotion code, so the AND keeps them out of the flag.',
        'Count the flags with the next lesson’s COUNTIF, or for now look down the column: every row shows “ok”.',
      ],
      answer: 'N2 holds <x>=IF(L2="yes",ROUND(G2*H2*$P$1,2),0)</x> and O2 <x>=IF(AND(L2="yes",I2<>N2),"check","ok")</x>; for these six orders every flag reads “ok”.',
      interpretation: `Filled down all ${D.orders} rows, the flag finds no subscription order with the wrong discount: all ${subs.length} carry exactly 10%. Without the AND, every promotion-code order would be flagged and the real exceptions, had there been any, would be lost among them.` },
    { level: 'simple', title: 'Taking an order apart: its ID and its date', fictional: true,
      setup: `The bulk office order is ${bulk.order_id} (A2), placed on 14 May 2026 (B2). Ana wants its number as a number, its month name, its day of the week, and the working days left in the month after it arrived.`,
      steps: [
        `The number: <x>=MID(A2,4,5)</x> returns the text “10144”, which won’t sort with numbers; <x>=VALUE(MID(A2,4,5))</x> returns the number 10144. If prefixes vary in length, find the hyphen first: <x>=VALUE(MID(A2,FIND("-",A2)+1,LEN(A2)))</x>.`,
        `The month: B2 holds the serial number ${serial(2026, 5, 14)}. <x>=MONTH(B2)</x> is 5 and <x>=TEXT(B2,"mmmm")</x> is “May”.`,
        `The day of the week: <x>=WEEKDAY(B2)</x> is ${weekday(2026, 5, 14) + 1} (counting from Sunday = 1), so the order came on a Thursday; <x>=WEEKDAY(B2,2)</x> is ${weekday(2026, 5, 14)} (Monday = 1).`,
        `The working days: <x>=EOMONTH(B2,0)</x> is 31 May 2026, and <x>=NETWORKDAYS(B2,EOMONTH(B2,0))</x> counts Monday to Friday from 14 to 31 May, both ends included: ${workdays(Date.UTC(2026, 4, 14), Date.UTC(2026, 4, 31))}. A list of holiday dates as a third argument would remove any that fall in the period.`,
      ],
      answer: `Order number 10144 (a number), month “May”, a Thursday (WEEKDAY 5, or 4 with return type 2), and ${workdays(Date.UTC(2026, 4, 14), Date.UTC(2026, 4, 31))} working days to the end of May.`,
      interpretation: 'Each answer came from a function that reads the cell, so the same four formulas, filled down, describe all 231 orders. The order number can now be sorted and compared, and the weekday and month are ready to be counted and summed by the conditional functions in the next lesson.' },
    { level: 'challenging', title: 'Labelling order sizes: why the order of the tests matters', fictional: true,
      setup: 'For the packing rota (these are not her reporting bands), Ana flags each order “large” ($75 or more), “medium” ($25 or more) or “small”. Write the label for the first eight orders with a nested IF and with IFS, and explain what goes wrong if the tests are reversed or a boundary is mis-stated.',
      table: {
        caption: 'The first eight order totals and their labels',
        head: ['Order', 'J: order_total', 'N: label'],
        align: ['l', 'r', 'l'],
        rows: first.map((o) => [o.order_id, money(o.order_total), label(o.order_total)]),
      },
      steps: [
        'Order the tests from the most demanding: a total that passes the $75 test is large and must never reach the $25 test. Nested IF: <x>=IF(J2>=75,"large",IF(J2>=25,"medium","small"))</x>. IFS: <x>=IFS(J2>=75,"large",J2>=25,"medium",TRUE,"small")</x>; without the final <x>TRUE,"small"</x>, small orders would show #N/A.',
        `Fill down. LC-10001 ($111.00) and LC-10005 ($92.00) are large; LC-10002, LC-10004 and LC-10007 (${money(first[1].order_total)}, ${money(first[3].order_total)}, ${money(first[6].order_total)}) are medium; the other three are small.`,
        'Reverse the tests and see it fail: <x>=IF(J2>=25,"medium",IF(J2>=75,"large","small"))</x> labels LC-10001 “medium”, because 111 ≥ 25 is TRUE and Excel stops at the first TRUE test. The large label can never be reached.',
        'Check the boundaries. The rule says “$75 or more”, so the test is <x>>=75</x>; with <x>>75</x> an order of exactly $75.00 would be labelled medium. None of these eight sits on a boundary, which is exactly why boundary errors survive casual checking: test the formula with 75 and 25 typed into a spare cell.',
        'Make the thresholds inputs: with 75 in Q1 and 25 in Q2, <x>=IF(J2>=$Q$1,"large",IF(J2>=$Q$2,"medium","small"))</x> lets Ana change a band without editing 231 formulas.',
      ],
      answer: 'Large: LC-10001 and LC-10005; medium: LC-10002, LC-10004 and LC-10007; small: LC-10003, LC-10006 and LC-10008. The tests must run from the highest threshold down, with <x>>=</x> at each boundary.',
      interpretation: 'A nested IF is a sequence of questions, and the sequence is part of the rule. Two or three bands are fine in IF or IFS; for more, a sorted table of thresholds and an approximate-match lookup (Module 2) is easier to read and to change.' },
    { level: 'applied', title: 'Ana’s catering quote', fictional: true,
      setup: `Ana prices catering from a quote sheet: a setup charge of $${QUOTE.setup} for the day, $${QUOTE.perGuest.toFixed(2)} per guest, $${QUOTE.perHour} per hour of service, $${QUOTE.platter} for a pastry platter if wanted, and a minimum invoice of $${QUOTE.minimum}. The five figures sit in B1:B5. Three requests for September have arrived (rows 9 to 11: guests in B, hours in C, pastries yes or no in D, event date in E). Build the quote in F and the day of the week in G.`,
      table: {
        caption: 'The three requests (fictional)',
        head: ['Row', 'Client', 'B: guests', 'C: hours', 'D: pastries', 'E: date'],
        align: ['r', 'l', 'r', 'r', 'l', 'l'],
        rows: REQUESTS.map((q, i) => [String(i + 9), q.client, String(q.guests), String(q.hours), q.pastries, `${q.date[2]} September 2026`]),
      },
      steps: [
        'Build the price from its parts: <x>$B$1+$B$2*B9+$B$3*C9+IF(D9="yes",$B$4,0)</x>. The IF adds the platter only when it was asked for; every input reference is absolute because all three rows share the inputs.',
        'Apply the minimum with MAX, which returns the larger of its arguments: <x>=MAX($B$5,$B$1+$B$2*B9+$B$3*C9+IF(D9="yes",$B$4,0))</x>. Using MAX for a floor is shorter and clearer than an IF that repeats the whole calculation.',
        `Fill down. ${REQUESTS[0].client}: <m>60 + 6.5 \\times 40 + 30 \\times 3 + 120 = ${raw(REQUESTS[0])}</m>. ${REQUESTS[1].client}: <m>60 + 6.5 \\times 18 + 30 \\times 2 = ${raw(REQUESTS[1])}</m>, below the minimum, so the quote is $${QUOTE.minimum}. ${REQUESTS[2].client}: <m>60 + 6.5 \\times 120 + 30 \\times 5 + 120 = ${raw(REQUESTS[2]).toLocaleString('en-US')}</m>.`,
        'The day of the week, for the staffing rota: <x>=TEXT(E9,"dddd")</x> gives Tuesday, Friday and Saturday for the three dates.',
      ],
      answer: `Quotes of $${quote(40, 3, true)}, $${quote(18, 2, false)} and $${quote(120, 5, true).toLocaleString('en-US')}; the events fall on a Tuesday, a Friday and a Saturday.`,
      interpretation: `The minimum earns its keep on the small meeting: the formula would otherwise quote $${raw(REQUESTS[1])} for a job that still needs the van, a barista and setting up. Because every price is a formula on five labelled inputs, Ana can change the price per guest once and requote all three. Her invoices then add bespoke changes, so they don’t always equal the quote.` },
  ],

  demo: [
    { widget: 'fl-sheet', intro: 'Lantern’s first twelve orders. Try, in turn, in I2 and filled down: <x>=IF(G2="yes",ROUND(C2*D2*$K$1,2),0)</x> (the expected subscription discount), <x>=VALUE(MID(A2,4,5))</x>, <x>=TEXT(B2,"mmm")</x>, <x>=WEEKDAY(B2,2)</x> and <x>=EDATE(B2,1)</x>. Then, in a spare cell, compare <x>=COUNT(H2:H13)</x>, <x>=COUNTA(H2:H13)</x>, <x>=COUNTBLANK(H2:H13)</x> and <x>=AVERAGE(H2:H13)</x> on the ratings. Show formulas reveals what each cell holds.' },
  ],

  mistakes: [
    { title: '“COUNT counts the entries in a column.”', html: 'COUNT counts numbers (and dates) only. COUNTA counts every cell that isn’t empty, text and errors included, and COUNTBLANK counts empty cells and formulas that return <x>""</x>. Choose by what the column holds: COUNTA for IDs, COUNT for ratings stored as numbers.' },
    { title: '“The tests in a nested IF can go in any order.”', html: 'Excel stops at the first TRUE test. Test $25 before $75 and nothing is ever “large”. Order the tests from the most demanding to the least, and check each boundary (≥ or >) against the business rule.' },
    { title: '“IFERROR makes a sheet safer.”', html: 'IFERROR turns every error into the value you give it, including the #REF! and #NAME? that signal a broken formula. Test for the case you expect, such as a zero divisor with IF, and use IFNA where #N/A is the only expected error.' },
    { title: '“LEFT, MID and RIGHT of a number give a number.”', html: 'They return text: “10001”, not 10001. Text sorts differently, and SUM skips it. Wrap the result in VALUE, or use an arithmetic operator, when you need the number.' },
    { title: '“A month is 30 days.”', html: '<x>=B2+30</x> lands on different days of the month as month lengths change. Use EDATE for “the same day next month” and EOMONTH for “the end of the month”.' },
    { title: '“TEXT is just a way to format a number.”', html: 'TEXT returns text, which looks right in a label but no longer behaves as a number or a date. Keep the value in its own cell and use TEXT only where you need words.' },
  ],

  application: [
    { p: `<b>Auditing a promise.</b> With the expected discount and the flag filled down all ${D.orders} rows, Ana can tell Lantern’s owner that every one of the ${subs.length} subscription orders carried exactly 10% off, and that the other discounts are the $5 promotion code and the bulk order’s negotiated 10%. The check takes two formulas and will run again unchanged on July’s orders. If Lantern ever changes the rate, the input cell changes and every expected discount follows.` },
    { p: `<b>What the ratings say.</b> ${rated.length} of ${D.orders} orders were rated, a response rate of ${(rated.length / D.orders * 100).toFixed(1)}%, and the average rating given was ${(ratingSum / rated.length).toFixed(2)}. Ana reports both numbers together, using COUNT for the rated orders and AVERAGE for the mean, because an average of ratings means little without the share of customers who gave one. She notes that the unrated orders are blanks, not zeros, so they don’t drag the average down.` },
    { case: 'Oakridge Fitness, a fictional gym, keeps member records with a member ID such as OKF-2291-M, a joining date and a monthly plan. Its manager uses EDATE to show each member’s next payment date, <x>=IF(AND(D2="active",E2<=$H$1+7),"remind","")</x> to list active members whose payment falls within a week of the report date in H1, and <x>=RIGHT(A2,1)</x> to read the plan letter at the end of the ID. When the gym added a plan with a two-letter code, the RIGHT formula silently started returning half of it; the manager replaced it with a formula that reads everything after the last hyphen, and added a check that counts IDs whose plan code isn’t on the list of plans.' },
    { p: '<b>Error handling.</b> A sensible house rule: allow IFERROR only where a specific error is expected and documented, with a note beside it saying which. The reason is the one in this lesson: a hidden #REF! is worse than a visible one, because the number that replaces it looks like an answer.' },
  ],

  summary: [
    'A function is called by name with its arguments in parentheses; optional arguments are shown in square brackets, and functions can be nested.',
    'COUNT counts numbers, COUNTA counts every non-empty cell, COUNTBLANK counts empty cells and empty text; AVERAGE skips blanks and text but includes zeros, so a blank and a 0 mean different things.',
    'Round by the business rule: ROUND for money, ROUNDUP for whole units you must have enough of, ROUNDDOWN or INT for what you can make, MROUND to a multiple.',
    'IF makes a decision; AND, OR and NOT combine tests. In nested IF and IFS the first TRUE test wins, so order tests from the most demanding and check each boundary; IFS needs a final TRUE as a catch-all.',
    'IFERROR hides every error, including the ones that mean the formula is broken; test for the case you expect, and keep IFNA for lookups.',
    'LEFT, RIGHT, MID, LEN, FIND and SEARCH take text apart (FIND is case-sensitive, SEARCH isn’t); their results are text until VALUE converts them. TRIM, PROPER and SUBSTITUTE clean; &, CONCAT and TEXTJOIN join; TEXT formats as text.',
    'Dates are serial numbers: DATE builds them, YEAR, MONTH and DAY take them apart, EOMONTH and EDATE move by months, WEEKDAY and NETWORKDAYS handle days of the week. DATEDIF is kept for compatibility and can be wrong.',
  ],

  glossary: [
    { term: 'Function', def: 'A named calculation built into a spreadsheet, such as SUM or IF, called in a formula with its arguments in parentheses.' },
    { term: 'Argument', def: 'A value, reference, range or expression given to a function inside its parentheses, such as the range in SUM(J2:J232).' },
    { term: 'Logical value', def: 'TRUE or FALSE: the result of a comparison such as J2>=50, and what IF, AND, OR and NOT work with.' },
    { term: 'Nested function', def: 'A function used as an argument of another function, as in ROUND(AVERAGE(M2:M232),2); the inner one is calculated first.' },
    { term: 'Text string', def: 'A piece of text in a cell or a formula, whose characters are numbered from 1; in a formula it is written in double quotation marks.' },
    { term: 'Concatenation', def: 'Joining pieces of text into one, with the & operator or a function such as CONCAT or TEXTJOIN.' },
  ],

  references: [
    { text: 'Microsoft Support. <i>COUNT function</i> (with the COUNTA and COUNTBLANK pages).', url: 'https://support.microsoft.com/en-us/excel/count-function', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>IF function – nested formulas and avoiding pitfalls</i>.', url: 'https://support.microsoft.com/en-US/Excel/if-function-nested-formulas-and-avoiding-pitfalls', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>IFS function</i>.', url: 'https://support.microsoft.com/en-us/excel/ifs-function', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>IFERROR function</i>.', url: 'https://support.microsoft.com/en-us/office/iferror-function-c526fd07-caeb-47b8-8bb6-63f3e417f611', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>FIND, FINDB functions</i>.', url: 'https://support.microsoft.com/en-gb/office/find-findb-functions-c7912941-af2a-4bdf-a553-d0d89b0a0628', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>DATE function</i>.', url: 'https://support.microsoft.com/en-us/excel/date-function', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>DATEDIF function</i>.', url: 'https://support.microsoft.com/en-us/excel/datedif-function', checked: '2026-10-23' },
  ],

  checks: [
    // concept: ratings
    { what: 'Orders', value: ORDERS.length, shown: 231 },
    { what: 'Rated orders (COUNT)', value: rated.length, shown: 154 },
    { what: 'Unrated orders (COUNTBLANK)', value: ORDERS.length - rated.length, shown: 77 },
    { what: 'Sum of ratings', value: ratingSum, shown: 632 },
    { what: 'Average rating given', value: ratingSum / rated.length, shown: 4.10 },
    { what: 'Average if blanks were zeros', value: ratingSum / ORDERS.length, shown: 2.74 },
    { what: 'Arguments per function', value: 255, shown: 255 },
    { what: 'Nesting levels', value: 64, shown: 64 },
    // rounding table
    { what: 'ROUND(2.15,1)', value: Math.round(2.15 * 10 + 1e-9) / 10, shown: 2.2 },
    { what: 'ROUND(-1.475,2)', value: -Math.round(1.475 * 100 + 1e-9) / 100, shown: -1.48 },
    { what: 'ROUND(21.5,-1)', value: Math.round(21.5 / 10 - 1e-9) * 10, shown: 20 },
    { what: 'ROUNDUP(3.2,0)', value: Math.ceil(3.2), shown: 4 },
    { what: 'ROUNDDOWN(3.2,0)', value: Math.floor(3.2), shown: 3 },
    { what: 'INT(8.9)', value: Math.floor(8.9), shown: 8 },
    { what: 'INT(-8.9)', value: Math.floor(-8.9), shown: -9 },
    { what: 'MROUND(10,3)', value: Math.round(10 / 3) * 3, shown: 9 },
    { what: 'MROUND(1.3,0.2)', value: Math.round(1.3 / 0.2) * 0.2, shown: 1.4 },
    { what: '45 guests ÷ 12 per box', value: 45 / 12, shown: 3.75 },
    { what: 'Boxes for 45 guests', value: Math.ceil(45 / 12), shown: 4 },
    { what: 'Boxes for 50 guests (ROUNDUP)', value: Math.ceil(50 / 12), shown: 5 },
    { what: 'Boxes for 50 guests (ROUND)', value: Math.round(50 / 12), shown: 4 },
    { what: '$15.50 after 6%', value: 15.5 * 1.06, shown: 16.43 },
    { what: 'MROUND(16.43,0.05)', value: Math.round(16.43 / 0.05) * 0.05, shown: 16.45 },
    // logic
    { what: 'Subscription rate (%)', value: 10, shown: 10 },
    { what: 'Label thresholds', value: 75 - 25, shown: 50 },
    { what: 'IFS maximum conditions', value: 127, shown: 127 },
    // text
    { what: 'LEN("LC-10001")', value: 'LC-10001'.length, shown: 8 },
    { what: 'FIND("M","Miriam McGovern")', value: 'Miriam McGovern'.indexOf('M') + 1, shown: 1 },
    { what: 'FIND("m","Miriam McGovern")', value: 'Miriam McGovern'.indexOf('m') + 1, shown: 6 },
    { what: 'VALUE("$1,000")', value: 1000, shown: 1000 },
    { what: 'Characters per cell', value: 2 ** 15 - 1, shown: 32767 },
    { what: 'Non-breaking space code', value: 0xa0, shown: 160 },
    // dates
    { what: 'Serial of 1 March 2026', value: serial(2026, 3, 1), shown: 46082 },
    { what: 'Serial of 31 March 2026', value: serial(2026, 3, 31), shown: 46112 },
    { what: 'Serial of 1 April 2026', value: serial(2026, 4, 1), shown: 46113 },
    { what: '1 March 2026 is a Sunday (WEEKDAY type 1)', value: weekday(2026, 3, 1) + 1, shown: 1 },
    { what: 'WEEKDAY type 2 for a Sunday', value: ((weekday(2026, 3, 1) + 6) % 7) + 1, shown: 7 },
    { what: 'Working days 1–31 March 2026', value: workdays(Date.UTC(2026, 2, 1), Date.UTC(2026, 2, 31)), shown: 22 },
    { what: 'DATE(2008,14,2) is 2 February 2009 (day)', value: new Date(Date.UTC(2008, 13, 2)).getUTCDate() + new Date(Date.UTC(2008, 13, 2)).getUTCFullYear() - 2009, shown: 2 },
    { what: 'DATE(2008,1,35) is 4 February 2008 (day)', value: new Date(Date.UTC(2008, 0, 35)).getUTCDate(), shown: 4 },
    { what: '1 March + 30 days is 31 March (day)', value: new Date(Date.UTC(2026, 2, 1) + 30 * DAY).getUTCDate(), shown: 31 },
    // example: discounts
    { what: 'Simple: LC-10002 expected discount', value: first[1].quantity * first[1].unit_price * 0.10, shown: 3.40 },
    { what: 'Simple: LC-10006 expected discount', value: first[5].quantity * first[5].unit_price * 0.10, shown: 1.40 },
    { what: 'Simple: LC-10001 promotion discount', value: first[0].discount, shown: 5 },
    { what: 'Simple: LC-10004 promotion discount', value: first[3].discount, shown: 5 },
    { what: 'Subscription orders', value: subs.length, shown: 104 },
    { what: 'Subscription orders with exactly 10% off', value: subs.filter((r) => Math.abs(r[col('discount')] - Math.round(r[col('quantity')] * r[col('unit_price')] * 10) / 100) < 0.005).length, shown: 104 },
    // example: ID and date
    { what: 'Bulk order number', value: Number(bulk.order_id.slice(3)), shown: 10144 },
    { what: 'Bulk order date is 14 May 2026 (serial)', value: serial(2026, 5, 14) + (bulk.order_date === '2026-05-14' ? 0 : 1000), shown: 46156 },
    { what: '14 May 2026 WEEKDAY type 1 (Thursday)', value: weekday(2026, 5, 14) + 1, shown: 5 },
    { what: '14 May 2026 WEEKDAY type 2', value: weekday(2026, 5, 14), shown: 4 },
    { what: 'Working days 14–31 May 2026', value: workdays(Date.UTC(2026, 4, 14), Date.UTC(2026, 4, 31)), shown: 12 },
    // example: labels
    ...first.map((o, i) => ({ what: `Labels: ${o.order_id} total`, value: o.order_total, shown: [111, 30.6, 14, 37, 92, 12.6, 53, 19.5][i] })),
    // example: quote
    { what: 'Quote: setup', value: QUOTE.setup, shown: 60 },
    { what: 'Quote: per guest', value: QUOTE.perGuest, shown: 6.5 },
    { what: 'Quote: per hour', value: QUOTE.perHour, shown: 30 },
    { what: 'Quote: platter', value: QUOTE.platter, shown: 120 },
    { what: 'Quote: minimum', value: QUOTE.minimum, shown: 300 },
    { what: 'Quote 1 (40 guests, 3 h, pastries)', value: raw(REQUESTS[0]), shown: 530 },
    { what: 'Quote 2 before the minimum', value: raw(REQUESTS[1]), shown: 237 },
    { what: 'Quote 2 after the minimum', value: quote(18, 2, false), shown: 300 },
    { what: 'Quote 3 (120 guests, 5 h, pastries)', value: raw(REQUESTS[2]), shown: 1110 },
    { what: '15 September 2026 is a Tuesday', value: weekday(2026, 9, 15), shown: 2 },
    { what: '18 September 2026 is a Friday', value: weekday(2026, 9, 18), shown: 5 },
    { what: '26 September 2026 is a Saturday', value: weekday(2026, 9, 26), shown: 6 },
    // application
    { what: 'Rating response rate (%)', value: rated.length / ORDERS.length * 100, shown: 66.7, tol: 0.05 },
  ],
};
