// conditional-sums-and-counts.js — B03 · Conditional sums, counts and averages. Content only; exercises are in
// conditional-sums-and-counts.ex.js. Every Lantern figure is computed from case.js (ORDERS, DERIVED). Quillbrook Food
// Share is fictional. No product costs or margins appear here (those are the course project), and no count of orders at
// or below the $35 delivery threshold. Excel's behaviour is cited in `references`.
import { ORDERS, ORDER_COLUMNS, DERIVED as D } from './case.js?v=18';

const col = (name) => ORDER_COLUMNS.indexOf(name);
const rows = ORDERS.map((r) => Object.fromEntries(ORDER_COLUMNS.map((c, i) => [c, r[i]])));
const r2 = (x) => Math.round(x * 100) / 100;
const sum = (a) => a.reduce((s, x) => s + x, 0);
const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const where = (f) => rows.filter(f);
const value = (f) => r2(sum(where(f).map((o) => o.order_total)));
const count = (f) => where(f).length;
const inMonth = (m) => (o) => Number(o.order_date.slice(5, 7)) === m;
const MONTHS = [[3, 'March'], [4, 'April'], [5, 'May'], [6, 'June']];
const CH = ['web', 'app'];
const REGIONS = ['North', 'South', 'East', 'West', 'Central'];
const avgRating = (g) => { const x = where((o) => o.region === g && o.rating != null).map((o) => o.rating); return sum(x) / x.length; };
const rated = (g) => count((o) => o.region === g && o.rating != null);
const web = value((o) => o.channel === 'web'), app = value((o) => o.channel === 'app');
const nWeb = count((o) => o.channel === 'web'), nApp = count((o) => o.channel === 'app');
const bulk = rows.find((o) => o.quantity === 120);
const gross = r2(sum(rows.map((o) => o.quantity * o.unit_price)));
const units = sum(rows.map((o) => o.quantity));
const simpleAvgPrice = sum(rows.map((o) => o.unit_price)) / rows.length;
const subVal = value((o) => o.subscription === 'yes');
const webSub = value((o) => o.channel === 'web' && o.subscription === 'yes');
const webOrSub = value((o) => o.channel === 'web' || o.subscription === 'yes');
const hb = where((o) => o.product.startsWith('House Blend'));
const kg = where((o) => o.product.endsWith('1kg'));
const may1 = count((o) => o.order_date === '2026-05-01');

export default {
  slug: 'conditional-sums-and-counts',
  title: 'Conditional sums, counts and averages',
  blurb: 'Most business questions about a table of transactions are “how much, how many, or how good, for the rows that meet a condition”. Learn SUMIFS, COUNTIFS, AVERAGEIFS, MAXIFS and SUMPRODUCT, the criteria that make them precise (operators, cell references, wildcards, blanks and date windows), and how to build a summary table with one formula.',
  status: 'reviewed',
  objectives: [
    'Write SUMIF, SUMIFS, COUNTIF, COUNTIFS, AVERAGEIF, AVERAGEIFS, MAXIFS and MINIFS formulas that answer exactly the question asked.',
    'Construct criteria with comparison operators, cell references, wildcards and blanks, including a date window made of two criteria.',
    'Combine conditions with AND logic (several criteria) and OR logic (adding conditional sums, or SUMPRODUCT), without counting any row twice.',
    'Calculate weighted totals and averages, and conditional totals, with SUMPRODUCT.',
    'Build a two-way summary table with mixed references so that one formula fills it, and reconcile it with the data’s grand total.',
  ],
  prerequisites: [
    { lesson: 'b03/cells-and-formulas', why: 'Summary tables depend on absolute and mixed references.' },
    { lesson: 'b03/functions-and-logic', why: 'You need function syntax, logical tests and the date functions EDATE and EOMONTH.' },
    { lesson: 'b01/summarising-data', why: 'Totals, counts and averages by group, and the weighted average, are what these functions calculate.' },
  ],
  case: 'lantern',

  concept: [
    { case: `Lantern’s ${D.orders} spring orders are worth ${money(D.orderValue)}. Ana now needs that total broken down. How much came through the web shop and how much through the app? How many orders arrived in April?` },
    { p: `What did each month bring in, by channel? Which regions rate Lantern’s coffee highest? Each answer is a sum, count or average over only the rows that meet a condition, and Excel has a family of functions for exactly that. In this lesson the order sheet has nine columns: A <code>order_date</code>, B <code>region</code>, C <code>product</code>, D <code>quantity</code>, E <code>unit_price</code>, F <code>order_total</code>, G <code>channel</code>, H <code>subscription</code> and I <code>rating</code>, with the 231 orders in rows 2 to 232; the exercises keep only the columns each question needs, and say which.` },

    { h: 'Totals with conditions' },
    { p: 'A <g>conditional aggregate</g> is a sum, count, average, maximum or minimum taken over only the rows that meet one or more conditions. Each condition is a <g>criterion</g> applied to a <g>criteria range</g>: “the channel column equals web”, “the date column is on or after 1 April”. Excel checks every row, keeps the rows that pass every criterion, and aggregates the values in those rows.' },
    { p: `SUMIF takes one condition: <x>SUMIF(range,criteria,[sum_range])</x>. If Lantern’s channels are in G2:G232 and order totals in F2:F232, <x>=SUMIF(G2:G232,"web",F2:F232)</x> returns ${money(web)}, the value of the ${nWeb} web orders. If you leave out the sum range, SUMIF adds the cells in the criteria range itself, which is useful for <x>=SUMIF(F2:F232,">=100")</x>, the value of orders of $100 or more.` },
    { p: 'SUMIFS takes as many conditions as you need, up to 127 range and criteria pairs: <x>SUMIFS(sum_range,criteria_range1,criteria1,[criteria_range2,criteria2],…)</x>. Note the order. Microsoft points out that the sum range is the first argument of SUMIFS but the third of SUMIF, and swapping them is a common source of problems. Use SUMIFS even for one condition, so that the argument order is always the same; SUMIFS also refuses ranges of different sizes with #VALUE!, where SUMIF quietly accepts them (<a href="https://support.microsoft.com/en-us/excel/how-to-correct-a-value-error-in-the-sumif-sumifs-function">Microsoft</a>).' },
    { figure: {
      svg: '<svg viewBox="0 0 620 250" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor"><text x="10" y="20" font-family="ui-monospace, Menlo, Consolas, monospace">=SUMIFS(F2:F7, G2:G7, &quot;web&quot;, H2:H7, &quot;yes&quot;)</text><g fill="var(--ink-3)" text-anchor="middle"><text x="95" y="48">F: order_total</text><text x="215" y="48">G: channel</text><text x="315" y="48">H: subscription</text><text x="420" y="48">G = web?</text><text x="495" y="48">H = yes?</text><text x="570" y="48">added</text></g><g stroke="var(--rule-strong)" fill="none"><rect x="40" y="58" width="110" height="26"/><rect x="160" y="58" width="110" height="26"/><rect x="270" y="58" width="90" height="26"/><rect x="40" y="84" width="110" height="26"/><rect x="160" y="84" width="110" height="26"/><rect x="270" y="84" width="90" height="26"/><rect x="40" y="110" width="110" height="26"/><rect x="160" y="110" width="110" height="26"/><rect x="270" y="110" width="90" height="26"/><rect x="40" y="136" width="110" height="26"/><rect x="160" y="136" width="110" height="26"/><rect x="270" y="136" width="90" height="26"/><rect x="40" y="162" width="110" height="26"/><rect x="160" y="162" width="110" height="26"/><rect x="270" y="162" width="90" height="26"/><rect x="40" y="188" width="110" height="26"/><rect x="160" y="188" width="110" height="26"/><rect x="270" y="188" width="90" height="26"/></g><rect x="40" y="110" width="320" height="26" fill="var(--series-1)" fill-opacity="0.15"/><rect x="40" y="188" width="320" height="26" fill="var(--series-1)" fill-opacity="0.15"/><g text-anchor="end"><text x="142" y="76">111.00</text><text x="142" y="102">30.60</text><text x="142" y="128">15.30</text><text x="142" y="154">14.00</text><text x="142" y="180">14.85</text><text x="142" y="206">13.95</text></g><g><text x="170" y="76">app</text><text x="170" y="102">app</text><text x="170" y="128">web</text><text x="170" y="154">web</text><text x="170" y="180">app</text><text x="170" y="206">web</text><text x="280" y="76">no</text><text x="280" y="102">yes</text><text x="280" y="128">yes</text><text x="280" y="154">no</text><text x="280" y="180">yes</text><text x="280" y="206">yes</text></g><g text-anchor="middle"><text x="420" y="76">no</text><text x="420" y="102">no</text><text x="420" y="128" font-weight="600">yes</text><text x="420" y="154">yes</text><text x="420" y="180">no</text><text x="420" y="206" font-weight="600">yes</text><text x="495" y="76">no</text><text x="495" y="102">yes</text><text x="495" y="128" font-weight="600">yes</text><text x="495" y="154">no</text><text x="495" y="180">yes</text><text x="495" y="206" font-weight="600">yes</text></g><g text-anchor="end" fill="var(--series-1)" font-weight="600"><text x="590" y="128">15.30</text><text x="590" y="206">13.95</text></g><line x1="530" y1="222" x2="595" y2="222" stroke="var(--ink)" stroke-width="1.5"/><text x="590" y="240" text-anchor="end" font-weight="600">29.25</text><text x="40" y="240" fill="var(--ink-3)">Rows are added only when every criterion is met.</text></svg>',
      caption: 'How SUMIFS works on six orders. Each criterion range is tested row by row; only the rows that pass both tests (web and a subscription) contribute their order total, 15.30 + 13.95 = 29.25.',
      alt: 'A small table of six orders with columns order_total, channel and subscription, and three helper columns showing whether the channel equals web, whether the subscription equals yes, and the amount added. Rows three and six are shaded: they are web subscription orders with totals 15.30 and 13.95, and only those two amounts appear in the added column. The other rows fail at least one test. The added amounts total 29.25. The formula at the top sums F2:F7 where G2:G7 equals web and H2:H7 equals yes.',
    } },
    { p: `The rest of the family follows the same pattern. <x>COUNTIF(range,criteria)</x> and <x>COUNTIFS(criteria_range1,criteria1,…)</x> count the rows that pass: <x>=COUNTIF(G2:G232,"web")</x> is ${nWeb}. <x>AVERAGEIF</x> and <x>AVERAGEIFS</x> average the values in the rows that pass, and return #DIV/0! if no row does. <x>MAXIFS</x> and <x>MINIFS</x> return the largest and smallest value that passes, and 0 if no row does; they are available in Excel 2019 and later and in Microsoft 365. In every function with several pairs, each criteria range must be the same size and shape as the range being summed, averaged or searched, or the result is #VALUE!.` },

    { h: 'Writing criteria' },
    { p: 'A criterion can be a number, a piece of text, a cell reference or an expression with a comparison operator. Microsoft’s examples are <x>32</x>, <x>">32"</x>, <x>B4</x>, <x>"apples"</x> and <x>"32"</x>. The rules that trip people up:' },
    { list: [
      '<b>Operators go inside the quotes.</b> <x>">=50"</x> means “50 or more”; <x>"<>web"</x> means “anything but web”. A bare <x>>=50</x> is a syntax error.',
      '<b>A cell reference with an operator is joined on with &.</b> To compare with the date in K1, write <x>">="&K1</x>. Written as <x>">=K1"</x>, the criterion is the text “>=K1”, which no date matches, and the result is quietly 0.',
      '<b>Text criteria ignore case.</b> Microsoft notes that COUNTIF ignores upper and lower case, so <x>"WEB"</x>, <x>"Web"</x> and <x>"web"</x> all match the same orders. They don’t ignore stray spaces: “web ” with a trailing space doesn’t match <x>"web"</x>, which is one more reason for B02’s cleaning.',
      '<b>Wildcards match patterns in text.</b> <x>?</x> matches any single character and <x>*</x> any run of characters, so <x>"House Blend*"</x> matches both House Blend sizes and <x>"*1kg"</x> every 1 kg bag. A tilde before a wildcard makes it literal: <x>"~*"</x> matches an actual asterisk.',
      '<b>Blanks have their own criteria.</b> <x>""</x> matches empty cells and <x>"<>"</x> (not equal to nothing) matches cells that aren’t empty.',
      '<b>Numbers and text don’t mix.</b> SUMIFS adds only numbers, so an order total stored as text is skipped, and <x>">=50"</x> never matches text, even text that looks like 58.00. Convert such columns first (B02).',
      '<b>An empty criterion cell counts as 0.</b> If a criterion refers to an empty cell, <a href="https://support.microsoft.com/en-us/excel/countifs-function">Microsoft notes</a> that COUNTIFS treats it as the value 0, not as “blank”; use <x>""</x> when you mean blank.',
      '<b>Very long text fails.</b> Microsoft warns that COUNTIF and SUMIF give wrong results when matching strings longer than 255 characters.',
    ] },
    { p: `With these, Ana’s product questions are one formula each. <x>=SUMIF(C2:C232,"House Blend*",D2:D232)</x> adds the quantity column for both House Blend products: ${sum(hb.map((o) => o.quantity))} bags in ${hb.length} orders. <x>=COUNTIF(C2:C232,"*1kg")</x> counts the ${kg.length} orders of 1 kg bags. And on the ratings, <x>=COUNTIFS(G2:G232,"web",I2:I232,"<>")</x> counts the ${count((o) => o.channel === 'web' && o.rating != null)} web orders that were rated.` },
    { callout: 'key', title: 'Put the criteria in cells', html: 'Instead of typing <x>"web"</x> into the formula, type web into a cell and refer to it. The formula can then be filled across a list of channels or months, the criteria are visible on the sheet, and changing a criterion doesn’t mean editing a formula. This is the same rule as “no hard-coded numbers”, applied to conditions.' },
  ],

  theory: [
    { h: 'Date windows' },
    { p: `Dates are numbers, so a period is two criteria on the same date column: on or after the first day, and before the first day of the next period. With 1 April 2026 in K1 and 1 May 2026 in K2, April’s orders are <x>=COUNTIFS(A2:A232,">="&K1,A2:A232,"<"&K2)</x>: ${count(inMonth(4))}. Using “before the next start” rather than “on or before the last day” means the window never needs to know how long the month is, and it stays right if the data ever carries times of day as well as dates.` },
    { p: `The boundary is where windows go wrong. Write <x>"<="&K2</x> instead of <x>"<"&K2</x> and April gains the ${may1} orders placed on 1 May. Write the dates as text, <x>">=1/4/2026"</x>, and the criterion depends on the computer’s regional settings: with US settings it means 4 January. Keep the dates in cells, or build them with DATE: <x>">="&DATE(2026,4,1)</x>. To step through months in a table, put each month’s first day in a cell and let EDATE find the next: <x>"<"&EDATE(K3,1)</x>.` },

    { h: 'AND and OR' },
    { p: 'Criteria in SUMIFS, COUNTIFS and AVERAGEIFS are combined with AND: a row counts only if it passes all of them. That is usually what you want (“web orders in April”), but it means two criteria on the same column must both be true of one cell. <x>=SUMIFS(F2:F232,B2:B232,"North",B2:B232,"South")</x> asks for orders whose region is both North and South, and returns 0.' },
    { p: `For OR, add one conditional sum per alternative: <x>=SUMIFS(F2:F232,B2:B232,"North")+SUMIFS(F2:F232,B2:B232,"South")</x> is ${money(value((o) => o.region === 'North' || o.region === 'South'))}. Adding is safe only when no row can meet both conditions, as here, because an order has one region. When the conditions overlap, adding counts the overlap twice. The value of orders that came through the web or were subscriptions is not web (${money(web)}) plus subscriptions (${money(subVal)}) = ${money(r2(web + subVal))}, because the ${money(webSub)} of web subscription orders is in both; the right answer is ${money(webOrSub)}. Either subtract the overlap with a third SUMIFS, or use SUMPRODUCT.` },

    { h: 'SUMPRODUCT' },
    { p: `<x>SUMPRODUCT(array1,[array2],…)</x> multiplies its ranges element by element and adds the products. Its first use is weighted totals: <x>=SUMPRODUCT(D2:D232,E2:E232)</x> multiplies each order’s quantity by its unit price and adds the 231 products, giving Lantern’s spring sales before discounts, ${money(gross)}. Take off the ${money(D.discounts)} of discounts and you are back at ${money(D.orderValue)}, a useful reconciliation.` },
    { p: `Divided by the number of bags, the same sum is a <g>weighted average</g> price: <x>=SUMPRODUCT(D2:D232,E2:E232)/SUM(D2:D232)</x> is <m>${gross.toFixed(2)} \\div ${units} \\approx ${(gross / units).toFixed(2)}</m> dollars per bag. The plain <x>=AVERAGE(E2:E232)</x> is ${money(simpleAvgPrice)}, because it gives an order of one Gift Box Trio the same weight as the order of 120 House Blend bags. Which is right depends on the question: the average price paid per bag is the weighted one.` },
    { p: 'SUMPRODUCT also takes conditions. A comparison on a range, such as <x>(G2:G232="web")</x>, gives a list of TRUE and FALSE values; arithmetic turns them into 1s and 0s, so <x>=SUMPRODUCT((G2:G232="web")*F2:F232)</x> adds the web orders’ totals. Microsoft notes that SUMPRODUCT treats any non-numeric entry as zero, which is why the multiplication matters: <x>=SUMPRODUCT((G2:G232="web"),F2:F232)</x>, with a comma, multiplies TRUE and FALSE values that count as zero and returns 0. Two more of Microsoft’s rules: the arrays must have the same dimensions (otherwise #VALUE!), and whole-column references make SUMPRODUCT multiply every cell in the column, so give it exact ranges.' },
    { p: `OR conditions that overlap are where SUMPRODUCT earns its place. Add the tests and keep the rows where the sum is above zero: <x>=SUMPRODUCT((((G2:G232="web")+(H2:H232="yes"))>0)*F2:F232)</x> returns ${money(webOrSub)}, counting each web subscription order once.` },

    { h: 'Summary tables with one formula' },
    { p: 'A two-way summary table puts one category down the side and another across the top, and every cell is a conditional aggregate of the pair. Built with mixed references, one formula fills the whole table. For value by month and channel, put each month’s first day in K2:K5 and the channels in L1:M1. Each cell needs “this row’s month”, so the month reference fixes its column ($K2), and “this column’s channel”, so the channel reference fixes its row (L$1); the data ranges are fixed in both directions. In L2:' },
    { p: '<x>=SUMIFS($F$2:$F$232,$A$2:$A$232,">="&$K2,$A$2:$A$232,"<"&EDATE($K2,1),$G$2:$G$232,L$1)</x>' },
    { p: 'Then check the table against the data. Add a total row and a total column with SUM; the grand total must equal <x>=SUM(F2:F232)</x>, each row total must equal that month’s value, and each column total that channel’s. If the grand total falls short, a row of data is outside every cell of the table: a date outside the four months, or a channel spelled “Web ” with a space. A count table should likewise add up to the number of orders. The challenging example builds and checks the table.' },
    { p: 'A PivotTable (Module 2) produces the same table by dragging fields, and is faster to explore with. Formulas have advantages of their own: they update the moment the data changes, they can sit anywhere in a report, and each cell says exactly what it adds. The pivot-tables lesson compares the two.' },
  ],

  formulas: [
    { id: 'conditional-sum', name: 'Conditional sum (SUMIFS)',
      tex: String.raw`S = \sum_{i=1}^{n} x_i\, c_i, \qquad c_i = \begin{cases} 1 & \text{if row } i \text{ meets every criterion} \\ 0 & \text{otherwise} \end{cases}`,
      where: [
        [String.raw`S`, 'The conditional sum', 'as x'],
        [String.raw`n`, 'Number of rows in the data', 'rows'],
        [String.raw`i`, 'The row number, from 1 to n', ''],
        [String.raw`x_i`, 'The value in row i of the sum range', 'as recorded'],
        [String.raw`c_i`, 'Whether row i passes all the criteria', ''],
      ],
      note: 'COUNTIFS is the sum of c_i; AVERAGEIFS is S divided by that count (only rows whose value is a number).' },
    { id: 'weighted-average-price', name: 'Weighted average price',
      tex: String.raw`\bar{p}_w = \dfrac{\sum_i q_i\, p_i}{\sum_i q_i}`,
      where: [
        [String.raw`\bar{p}_w`, 'Average price per item, weighted by quantity', '$ per item'],
        [String.raw`q_i`, 'Quantity in order i', 'items'],
        [String.raw`p_i`, 'Unit price in order i', '$ per item'],
      ],
      note: 'In Excel: <x>=SUMPRODUCT(D2:D232,E2:E232)/SUM(D2:D232)</x>.' },
  ],

  examples: [
    { level: 'simple', title: 'Value, orders and average order value by channel', fictional: true,
      setup: 'Lantern’s channels are in G2:G232 and order totals in F2:F232. In K2 and K3 Ana has typed web and app. Find each channel’s order value, number of orders and average order value with formulas that fill down.',
      table: {
        caption: 'The channel summary (L, M and N filled down from row 2)',
        head: ['K: channel', 'L: value', 'M: orders', 'N: average order value'],
        align: ['l', 'r', 'r', 'r'],
        rows: [['web', money(web), String(nWeb), money(r2(web / nWeb))], ['app', money(app), String(nApp), money(r2(app / nApp))]],
      },
      steps: [
        'Value: <x>=SUMIFS($F$2:$F$232,$G$2:$G$232,K2)</x>. The criterion is the cell K2, so the same formula filled to row 3 picks up app; the data ranges are absolute so that they don’t slide down.',
        'Orders: <x>=COUNTIFS($G$2:$G$232,K2)</x>.',
        'Average order value: <x>=L2/M2</x>, or in one step <x>=AVERAGEIFS($F$2:$F$232,$G$2:$G$232,K2)</x>, which gives the same result.',
        `Reconcile: ${money(web)} + ${money(app)} = ${money(r2(web + app))}, the spring total, and ${nWeb} + ${nApp} = ${nWeb + nApp} orders.`,
      ],
      answer: `Web: ${money(web)} from ${nWeb} orders, ${money(r2(web / nWeb))} an order. App: ${money(app)} from ${nApp} orders, ${money(r2(app / nApp))} an order.`,
      interpretation: `The web shop brings in more, and more per order, but one order explains much of the gap: the ${money(bulk.order_total)} office order ${bulk.order_id} came through the web. Without it the web average is <m>(${web.toFixed(2)} - ${bulk.order_total}) \\div ${nWeb - 1} \\approx ${((web - bulk.order_total) / (nWeb - 1)).toFixed(2)}</m> dollars, below the app’s. A conditional average is still an average, and B02’s outlier still moves it.` },
    { level: 'challenging', title: 'A month-by-channel table, built and checked', fictional: true,
      setup: 'Build Lantern’s spring order value by month (rows) and channel (columns) with one formula, and prove that the table accounts for every order. The first day of each month is in K2:K5 (1 March to 1 June 2026) and the channels in L1:M1, as in the Explore worksheet below.',
      table: {
        caption: 'Order value by month and channel, spring 2026',
        head: ['K: month starting', 'L: web', 'M: app', 'N: total'],
        align: ['l', 'r', 'r', 'r'],
        rows: MONTHS.map(([m, name]) => [name, money(value((o) => inMonth(m)(o) && o.channel === 'web')), money(value((o) => inMonth(m)(o) && o.channel === 'app')), money(value(inMonth(m)))]),
        foot: [['Total', money(web), money(app), money(D.orderValue)]],
      },
      steps: [
        'Decide what each cell needs: orders in this row’s month and this column’s channel. The month is a window, so it takes two criteria on the date column: on or after K2, and before EDATE(K2,1), the first of the next month.',
        'Fix the right parts. The data ranges never move: $F$2:$F$232, $A$2:$A$232, $G$2:$G$232. The month is always in column K ($K2), the channel always in row 1 (L$1). In L2: <x>=SUMIFS($F$2:$F$232,$A$2:$A$232,">="&$K2,$A$2:$A$232,"<"&EDATE($K2,1),$G$2:$G$232,L$1)</x>, filled across to M2 and down to M5.',
        `Read one filled cell to check the references: M4 becomes <x>=SUMIFS($F$2:$F$232,$A$2:$A$232,">="&$K4,$A$2:$A$232,"<"&EDATE($K4,1),$G$2:$G$232,M$1)</x>, app orders in May: ${money(value((o) => inMonth(5)(o) && o.channel === 'app'))}.`,
        `Add totals with SUM and reconcile. The row totals (${MONTHS.map(([m]) => money(D.byMonth.value[['', '', '', 'Mar', 'Apr', 'May', 'Jun'][m]])).join(', ')}) match each month’s value, the column totals match each channel, and the grand total is ${money(D.orderValue)}, the same as <x>=SUM(F2:F232)</x>. Every order is in exactly one cell.`,
      ],
      answer: 'One formula, typed in L2 and filled to M5, gives the eight values in the table; the totals reconcile to the spring total of $9,096.15.',
      interpretation: `May stands out, with web sales of ${money(value((o) => inMonth(5)(o) && o.channel === 'web'))}, and the bulk office order of ${money(bulk.order_total)} on 14 May is most of the reason; without it, May’s web value would be ${money(r2(value((o) => inMonth(5)(o) && o.channel === 'web') - bulk.order_total))}. The table says where the money came from; it takes a look at the rows to say why. Because the table is formulas, July’s orders pasted below the data (with the ranges extended) and a fifth month row would fill in the same way.` },
    { level: 'applied', title: 'Where are customers least satisfied?', fictional: true,
      setup: 'Lantern’s owner asks which region Ana should look at first if she wants to improve customer satisfaction. Ratings (1 to 5) are in I2:I232, blank when the customer didn’t rate; regions are in B2:B232, and the five region names in K2:K6.',
      table: {
        caption: 'Ratings by region',
        head: ['K: region', 'L: orders', 'M: rated', 'N: average rating'],
        align: ['l', 'r', 'r', 'r'],
        rows: REGIONS.map((g) => [g, String(count((o) => o.region === g)), String(rated(g)), avgRating(g).toFixed(2)]),
      },
      steps: [
        'Orders per region: <x>=COUNTIFS($B$2:$B$232,K2)</x>.',
        'Rated orders: add a criterion on the rating column, <x>=COUNTIFS($B$2:$B$232,K2,$I$2:$I$232,"<>")</x>. The <x>"<>"</x> criterion keeps only the cells that aren’t empty.',
        'Average rating: <x>=AVERAGEIFS($I$2:$I$232,$B$2:$B$232,K2)</x>. AVERAGEIFS uses only rows whose rating is a number, so unrated orders are left out of both the sum and the count. Dividing a SUMIFS by the region’s order count instead would treat every unrated order as a zero.',
        `Read the table with its counts. North has the lowest average, ${avgRating('North').toFixed(2)}, from ${rated('North')} ratings; Central the highest, ${avgRating('Central').toFixed(2)}, but from only ${rated('Central')}. Sort or rank the averages only after checking how many ratings stand behind each.`,
      ],
      answer: `North (${avgRating('North').toFixed(2)} from ${rated('North')} ratings) is the place to start; Central (${avgRating('Central').toFixed(2)}) is highest but rests on the fewest ratings.`,
      interpretation: 'The averages differ by less than one point on a five-point scale and some rest on a few dozen ratings, so they are a reason to look, not a finding: Ana reads the North comments and checks its delivery times before drawing conclusions. Whether a gap this size is more than chance is a question for B04’s statistics, not for SUMIFS.' },
  ],

  demo: [
    { widget: 'cs-sheet', intro: 'All 231 spring orders. In K2, type <x>=SUMIFS($E$2:$E$232,$A$2:$A$232,">="&$J2,$A$2:$A$232,"<"&EDATE($J2,1),$F$2:$F$232,K$1)</x> and fill it down to row 5 and across to column L. Add totals and check that they come to $9,096.15. Then experiment in the spare cells: <x>=COUNTIF(F2:F232,"web")</x>, <x>=SUMIF(C2:C232,"*1kg",D2:D232)</x>, <x>=AVERAGEIFS(H2:H232,B2:B232,"North")</x>, <x>=COUNTIFS(H2:H232,"")</x>.' },
  ],

  mistakes: [
    { title: '“SUMIFS takes its arguments in the same order as SUMIF.”', html: 'The sum range comes first in SUMIFS and last in SUMIF. <x>=SUMIFS(G2:G232,"web",F2:F232)</x> treats “web” as a range and fails. Pick one function (SUMIFS works for one condition too) and use it consistently.' },
    { title: '“A cell reference inside the quotes works.”', html: '<x>">=K1"</x> is the text “>=K1”; no date matches it and the result is a quiet 0. Join the operator to the reference: <x>">="&K1</x>.' },
    { title: '“Two criteria on the same column give OR.”', html: 'SUMIFS criteria are combined with AND, so <x>"North"</x> and <x>"South"</x> on the region column return 0. For OR, add two SUMIFS (when the conditions can’t overlap) or use SUMPRODUCT.' },
    { title: '“Adding the subtotals is fine for OR.”', html: 'Only when no row meets both conditions. Web orders plus subscription orders counts the web subscription orders twice. Subtract the overlap, or use SUMPRODUCT with <x>(…+…)>0</x>.' },
    { title: '“A month is everything up to the last day.”', html: 'Writing <x>"<="&K2</x> with K2 the first day of the next month adds that day’s orders to this month. Use “on or after the start, before the next start”, with EDATE for the next start.' },
    { title: '“An average by group is SUMIFS divided by COUNTIF.”', html: 'Only if every row in the group has a value. With blanks (unrated orders), divide by a COUNTIFS that also requires <x>"<>"</x>, or use AVERAGEIFS, which skips non-numeric cells by itself.' },
  ],

  application: [
    { p: `<b>Ana’s monthly pack.</b> Ana’s report to Lantern’s owner opens with three small tables, all formulas on the order data: value and orders by month and channel, value by region with each region’s share of the total, and ratings by region with their counts. Each table has its check, the grand total against <x>=SUM()</x> of the data and the order count against ${D.orders}, in a cell that shows “OK” or the difference. When June’s orders arrived, Ana pasted them below May’s, extended the ranges, and the tables and their checks updated together.` },
    { p: '<b>Questions that are one formula.</b> Most of the questions a manager asks about a transaction table are conditional aggregates: sales of a product line this quarter (SUMIFS with a wildcard and a date window), how many customers ordered more than once (a COUNTIF on each customer’s ID, then a count of the ones above 1), the largest order from each region (MAXIFS), the average delivery time for app orders (AVERAGEIFS). Knowing the family well means answering in minutes, and with a formula someone can check, rather than by filtering and copying numbers by hand.' },
    { case: 'Quillbrook Food Share, a fictional charity, logs every donation with its date, campaign, donor type and amount. Its treasurer reports donations by campaign and month with one SUMIFS table, and the number of first-time donors with COUNTIFS. One year the winter campaign’s total looked a third too high: the treasurer had added “online or corporate” donations with two SUMIFS, and corporate donations made online were in both. Rebuilt with SUMPRODUCT and an OR test, the table matched the bank statements, and the treasurer added a reconciliation row that has caught two more problems since.' },
    { p: '<b>Formulas or a PivotTable?</b> For a report that is produced every month in the same shape, formula tables are easy to audit and to place exactly where they are needed. For exploring (by region, then by product, then by week), a PivotTable is faster, and Module 2 covers it. A good routine is to explore with a pivot, then build the final report from formulas that can be checked cell by cell.' },
  ],

  summary: [
    'SUMIF(range, criteria, [sum_range]) handles one condition; SUMIFS(sum_range, criteria_range1, criteria1, …) handles up to 127, with the sum range first. COUNTIF(S), AVERAGEIF(S), MAXIFS and MINIFS follow the same pattern.',
    'Criteria: operators inside quotes (<x>">=50"</x>), joined to cell references with & (<x>">="&K1</x>); text criteria ignore case; <x>*</x> and <x>?</x> are wildcards and <x>~</x> makes them literal; <x>""</x> matches blanks and <x>"<>"</x> non-blanks.',
    'A date window is two criteria on the date column: on or after the start, before the next start. Keep the dates in cells or build them with DATE and EDATE.',
    'Criteria within one SUMIFS are combined with AND. For OR, add separate SUMIFS only when the conditions can’t overlap; otherwise subtract the overlap or use SUMPRODUCT.',
    'SUMPRODUCT multiplies ranges element by element and adds: weighted totals and averages, and conditions written as <x>(range="value")*values</x>. Non-numbers count as zero, ranges must be the same size, and whole columns are slow.',
    'One formula with mixed references fills a two-way summary table; always reconcile the table’s totals with the data.',
  ],

  glossary: [
    { term: 'Conditional aggregate', def: 'A sum, count, average, maximum or minimum taken over only the rows of a table that meet one or more conditions.' },
    { term: 'Criterion', def: 'A condition used by a function such as SUMIFS or COUNTIFS to decide which rows to include, such as <x>"web"</x>, <x>">=50"</x> or <x>">="&K1</x>; plural criteria.' },
    { term: 'Criteria range', def: 'The range of cells that a criterion is tested against, row by row, in functions such as SUMIFS and COUNTIFS.' },
    { term: 'Wildcard character', def: 'A character that matches others in a text criterion: ? matches any one character and * any run of characters; a tilde (~) before either matches it literally.' },
    { term: 'Summary table', def: 'A table of aggregates for each combination of categories, such as order value by month and channel, often built with one formula filled across and down.' },
  ],

  references: [
    { text: 'Microsoft Support. <i>SUMIFS function</i>.', url: 'https://support.microsoft.com/en-us/excel/sumifs-function', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>SUMIF function</i>.', url: 'https://support.microsoft.com/en-US/Excel/sumif-function', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>COUNTIF function</i> (criteria, wildcards and case).', url: 'https://support.microsoft.com/en-us/office/countif-function-e0de10c6-f885-4e71-abb4-1f464816df34', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>COUNTIFS function</i>.', url: 'https://support.microsoft.com/en-us/excel/countifs-function', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>AVERAGEIFS function</i>.', url: 'https://support.microsoft.com/en-US/Excel/averageifs-function', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>MAXIFS function</i>.', url: 'https://support.microsoft.com/en-US/excel/functions/maxifs-function', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>SUMPRODUCT function</i>.', url: 'https://support.microsoft.com/en-US/Excel/sumproduct-function', checked: '2026-10-23' },
  ],

  checks: [
    { what: 'Orders', value: rows.length, shown: 231 },
    { what: 'Spring order value', value: r2(sum(rows.map((o) => o.order_total))), shown: 9096.15 },
    { what: 'Web value', value: web, shown: 5439.95 },
    { what: 'App value', value: app, shown: 3656.20 },
    { what: 'Web orders', value: nWeb, shown: 132 },
    { what: 'App orders', value: nApp, shown: 99 },
    { what: 'SUMIFS pairs', value: 127, shown: 127 },
    { what: 'House Blend bags', value: sum(hb.map((o) => o.quantity)), shown: 202 },
    { what: 'House Blend orders', value: hb.length, shown: 49 },
    { what: '1 kg orders', value: kg.length, shown: 29 },
    { what: 'Rated web orders', value: count((o) => o.channel === 'web' && o.rating != null), shown: 84 },
    { what: 'Criterion string limit', value: 255, shown: 255 },
    { what: 'April orders', value: count(inMonth(4)), shown: 63 },
    { what: 'Orders on 1 May', value: may1, shown: 4 },
    { what: 'North + South value', value: value((o) => o.region === 'North' || o.region === 'South'), shown: 3192.25 },
    { what: 'Subscription value', value: subVal, shown: 2977.65 },
    { what: 'Web + subscription (double-counted)', value: r2(web + subVal), shown: 8417.60 },
    { what: 'Web subscription value', value: webSub, shown: 1273.95 },
    { what: 'Web or subscription value', value: webOrSub, shown: 7143.65 },
    { what: 'Web or subscription = web + subscription − overlap', value: r2(web + subVal - webSub), shown: 7143.65 },
    { what: 'Gross value before discounts', value: gross, shown: 9685 },
    { what: 'Discounts', value: D.discounts, shown: 588.85 },
    { what: 'Gross − discounts = order value', value: r2(gross - D.discounts), shown: 9096.15 },
    { what: 'Bags sold', value: units, shown: 477 },
    { what: 'Weighted average price per bag', value: gross / units, shown: 20.30 },
    { what: 'Simple average of unit_price', value: simpleAvgPrice, shown: 22.34 },
    { what: 'Bulk order bags', value: bulk.quantity, shown: 120 },
    // simple example
    { what: 'Simple: web AOV', value: web / nWeb, shown: 41.21 },
    { what: 'Simple: app AOV', value: app / nApp, shown: 36.93 },
    { what: 'Simple: web + app', value: r2(web + app), shown: 9096.15 },
    { what: 'Simple: bulk order value', value: bulk.order_total, shown: 1512 },
    { what: 'Simple: web AOV without the bulk order', value: (web - bulk.order_total) / (nWeb - 1), shown: 29.98 },
    // challenging example
    ...MONTHS.flatMap(([m, name]) => CH.map((c) => ({ what: `Challenging: ${name} ${c}`, value: value((o) => inMonth(m)(o) && o.channel === c), shown: { 3: { web: 1065.10, app: 910.75 }, 4: { web: 1162.90, app: 1012.65 }, 5: { web: 2159.05, app: 770.70 }, 6: { web: 1052.90, app: 962.10 } }[m][c] }))),
    ...MONTHS.map(([m, name]) => ({ what: `Challenging: ${name} total`, value: value(inMonth(m)), shown: { 3: 1975.85, 4: 2175.55, 5: 2929.75, 6: 2015.00 }[m] })),
    { what: 'Challenging: May web without the bulk order', value: r2(value((o) => inMonth(5)(o) && o.channel === 'web') - bulk.order_total), shown: 647.05 },
    // applied example
    ...REGIONS.map((g) => ({ what: `Applied: ${g} orders`, value: count((o) => o.region === g), shown: { North: 58, South: 43, East: 52, West: 53, Central: 25 }[g] })),
    ...REGIONS.map((g) => ({ what: `Applied: ${g} rated`, value: rated(g), shown: { North: 35, South: 27, East: 40, West: 33, Central: 19 }[g] })),
    ...REGIONS.map((g) => ({ what: `Applied: ${g} average rating`, value: avgRating(g), shown: { North: 3.83, South: 3.96, East: 4.33, West: 3.97, Central: 4.58 }[g] })),
    // figure
    { what: 'Figure: 15.30 + 13.95', value: 15.30 + 13.95, shown: 29.25 },
  ],
};
