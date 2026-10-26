// pivot-tables.js — B03 · PivotTables. Content only; exercises are in pivot-tables.ex.js. Lantern's orders and catering
// events come from case.js (no margin figures here: margin by line and region belongs to the course project).
// Excel behaviour checked on Microsoft's pages on 23 October 2026 (see references).
import { ORDERS, ORDER_COLUMNS, EVENTS, EVENT_COLUMNS, DERIVED as D } from './case.js?v=19';

const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (x, d = 1) => `${(x * 100).toFixed(d)}%`;
const oc = (name) => ORDER_COLUMNS.indexOf(name);
const ec = (name) => EVENT_COLUMNS.indexOf(name);
const sum = (a) => a.reduce((s, x) => s + x, 0);
const r2 = (x) => Math.round(x * 100) / 100;
const MONTHS = ['Mar', 'Apr', 'May', 'Jun'];
const monthOf = (d) => MONTHS[Number(d.slice(5, 7)) - 3];
const val = (f) => r2(sum(ORDERS.filter(f).map((r) => r[oc('order_total')])));
const cnt = (f) => ORDERS.filter(f).length;
const mc = (m, ch) => val((r) => monthOf(r[oc('order_date')]) === m && (!ch || r[oc('channel')] === ch));
const chVal = (ch) => D.byChannel.value[ch];
const chCnt = (ch) => D.byChannel.orders[ch];
const bulk = ORDERS.find((r) => r[0] === D.bulk.id);
const customers = new Set(ORDERS.map((r) => r[oc('customer_id')])).size;
const appShare = (m) => mc(m, 'app') / mc(m);
const otherMin = Math.min(...['Mar', 'Apr', 'Jun'].map(appShare)), otherMax = Math.max(...['Mar', 'Apr', 'Jun'].map(appShare));

// catering events by type
const TYPES = ['Breakfast', 'Conference', 'Launch', 'Meeting', 'Team day'];
const evN = (t) => D.eventsByType.events[t];
const evV = (t) => D.eventsByType.value[t];
const meridian = EVENTS.find((r) => r[ec('days')] === 2);
const q4 = ['Oct', 'Nov', 'Dec'].reduce((s, m) => s + D.eventsByMonth[m], 0);

// the figure: Month in Rows, Channel in Columns, Sum of order_total in Values
const fig = (() => {
  const x0 = 360, w = [70, 80, 80, 90];
  const rows = [['Month', 'app', 'web', 'Grand Total'], ...MONTHS.map((m) => [m, mc(m, 'app'), mc(m, 'web'), mc(m)]), ['Total', chVal('app'), chVal('web'), D.orderValue]];
  let s = '';
  rows.forEach((row, i) => {
    let x = x0;
    row.forEach((c, j) => {
      s += `<rect x="${x}" y="${70 + i * 24}" width="${w[j]}" height="24" fill="none" stroke="var(--rule-strong)" stroke-width="1"/>`;
      const txt = typeof c === 'number' ? c.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : c;
      s += j === 0 ? `<text x="${x + 6}" y="${87 + i * 24}"${i === 0 || i === rows.length - 1 ? ' font-weight="700"' : ''}>${txt}</text>` : `<text x="${x + w[j] - 6}" y="${87 + i * 24}" text-anchor="end"${i === 0 || i === rows.length - 1 || j === 3 ? ' font-weight="700"' : ''}>${txt}</text>`;
      x += w[j];
    });
  });
  return s;
})();

export default {
  slug: 'pivot-tables',
  title: 'PivotTables',
  blurb: 'Summarise hundreds of rows by dragging fields: order value by month and channel, events by type, each item’s share of a total. Learn how a PivotTable groups and aggregates its source, how to show percentages and months, how to keep it up to date, and when SUMIFS formulas are the better choice.',
  status: 'reviewed',
  objectives: [
    'Prepare source data for a PivotTable, and explain why an Excel table is the best source.',
    'Build PivotTables with fields in the Rows, Columns, Values and Filters areas, choosing Sum, Count, Average, Max or Min.',
    'Use Show Values As to give percentages of the grand total, the column total and the row total, and interpret each correctly.',
    'Use date grouping, sorting and filtering on a PivotTable, and refresh it after its source data change.',
    'Compare a PivotTable with SUMIFS and COUNTIFS formulas, reconcile one against the other, and choose the right tool for a report.',
  ],
  prerequisites: [
    { lesson: 'b03/conditional-sums-and-counts', why: 'Every cell of a PivotTable is a conditional sum or count; SUMIFS and COUNTIFS are how you check one.' },
    { lesson: 'b03/tables-and-cleaning', why: 'A PivotTable should be built on an Excel table of clean data.' },
    { lesson: 'b02/transforming-data', why: 'Aggregation, and the reshaping B02 calls a pivot, are what a PivotTable does.' },
    { lesson: 'b01/summarising-data', why: 'Choosing a sum, a count or an average depends on the question, as B01 explains.' },
  ],
  case: 'lantern',

  concept: [
    { case: `Ana wants to know how the spring’s ${money(D.orderValue)} of online orders moved from month to month, and how much of it came through the app. With SUMIFS she would write a grid of formulas, one per month and channel, and rewrite it the moment she asked the next question: by region instead, or only for subscriptions. She needs a summary she can rearrange in seconds, built from the <code>Orders</code> table.` },
    { p: 'A <g>PivotTable</g> is Excel’s interactive summary of a list of records. It groups the records by the values of the fields you place in its rows and columns, and in each cell aggregates a field you choose: the sum of order_total, the count of orders, the average invoice. B02 used “pivot” for reshaping long data into a wide table and defined <g>aggregation</g> as combining many values into one; a PivotTable does both at once, and redoes them every time you move a field.' },
    { p: 'To build one, click a cell in the table and choose Insert › PivotTable, check the source (the table <code>Orders</code>) and choose a new worksheet. The PivotTable Fields pane lists each column header of the source as a field, and below it are four areas. Fields in Rows become row labels down the left; fields in Columns become column headings across the top; fields in Values are summarised in the body; and fields in Filters become report filters above the table. Tick a field and Excel places it for you: Microsoft notes that non-numeric fields usually go to Rows and numeric fields to Values. Drag a field to move it.' },
    { figure: {
      svg: `<svg viewBox="0 0 680 250" xmlns="http://www.w3.org/2000/svg" font-size="13" fill="currentColor"><defs><marker id="pv-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--ink-3)"/></marker></defs><text x="10" y="20" font-weight="700">PivotTable Fields</text><rect x="10" y="30" width="140" height="40" rx="6" fill="none" stroke="var(--rule-strong)" stroke-width="1.5"/><text x="18" y="46" font-size="12" fill="var(--ink-3)">Filters</text><text x="18" y="62">region (All)</text><rect x="160" y="30" width="140" height="40" rx="6" fill="none" stroke="var(--series-2)" stroke-width="2"/><text x="168" y="46" font-size="12" fill="var(--ink-3)">Columns</text><text x="168" y="62">channel</text><rect x="10" y="80" width="140" height="40" rx="6" fill="none" stroke="var(--series-1)" stroke-width="2"/><text x="18" y="96" font-size="12" fill="var(--ink-3)">Rows</text><text x="18" y="112">order_date (Months)</text><rect x="160" y="80" width="140" height="40" rx="6" fill="none" stroke="var(--ink)" stroke-width="2"/><text x="168" y="96" font-size="12" fill="var(--ink-3)">Values</text><text x="168" y="112">Sum of order_total</text><line x1="302" y1="100" x2="356" y2="100" stroke="var(--ink-3)" stroke-width="1.5" marker-end="url(#pv-arrow)"/><text x="360" y="20" font-weight="700">The PivotTable it builds</text><text x="360" y="40" font-size="12" fill="var(--ink-3)">region: (All)</text><text x="360" y="58" font-size="12" fill="var(--ink-3)">Sum of order_total</text>${fig}<text x="10" y="150" font-size="12">Each field in Rows gives a row per item,</text><text x="10" y="168" font-size="12">each field in Columns a column per item,</text><text x="10" y="186" font-size="12">and every body cell aggregates the records</text><text x="10" y="204" font-size="12">with that row’s and column’s values.</text><text x="10" y="230" font-size="12">Filters limit which records count at all.</text></svg>`,
      caption: 'The four areas of the PivotTable Fields pane and the table they produce: order value by month and channel for Lantern’s spring orders.',
      alt: `Left, four boxes standing for the areas of the PivotTable Fields pane: Filters holds region, set to All; Columns holds channel; Rows holds order_date grouped by months; Values holds Sum of order_total. An arrow leads to the PivotTable they build, headed “region: (All)” and “Sum of order_total”. Its rows are March ${money(mc('Mar', 'app'))} app, ${money(mc('Mar', 'web'))} web, ${money(mc('Mar'))} grand total; April ${money(mc('Apr', 'app'))}, ${money(mc('Apr', 'web'))}, ${money(mc('Apr'))}; May ${money(mc('May', 'app'))}, ${money(mc('May', 'web'))}, ${money(mc('May'))}; June ${money(mc('Jun', 'app'))}, ${money(mc('Jun', 'web'))}, ${money(mc('Jun'))}; and the total row ${money(chVal('app'))}, ${money(chVal('web'))} and ${money(D.orderValue)}. A note explains that each field in Rows gives a row per item, each field in Columns a column per item, every body cell aggregates the records with that row’s and column’s values, and filters limit which records count at all.`,
    } },
    { p: `Read the result as a set of <g>conditional aggregates</g>. The May and web cell, ${money(mc('May', 'web'))}, is the total of order_total over the orders placed in May through the web shop: exactly what <x>=SUMIFS(Orders[order_total],Orders[channel],"web",Orders[order_date],">="&DATE(2026,5,1),Orders[order_date],"<"&DATE(2026,6,1))</x> computes. The PivotTable writes every such cell at once, adds the row and column totals, and rebuilds them all when Ana swaps channel for region.` },
    { p: `The first view already raises a question. May has the most order value, ${money(D.byMonth.value.May)}, but the fewest orders, ${D.byMonth.orders.May}. A sum can’t say why; the records can. One web order in May, ${D.bulk.id} on 14 May, was the ${bulk[oc('quantity')]}-bag office order worth ${money(D.bulk.value)}: without it May’s value would be ${money(D.byMonth.value.May - D.bulk.value)}, the lowest of the four months. A PivotTable is the fastest way to find where a total comes from, and the start of the questions, not the end.` },
    { callout: 'key', title: 'Every value cell is a SUMIFS', html: 'Each cell in the body of a PivotTable aggregates the records whose fields match that cell’s row label, column label and filters. That is why a PivotTable and a SUMIFS or COUNTIFS formula over the same table must agree, and why checking one against the other is the standard test of both.' },
  ],

  theory: [
    { h: 'Source data a PivotTable can use' },
    { p: 'Microsoft’s advice for source data comes down to the shape B01 called <g>structured data</g>: one record per row and one field per column.' },
    { list: [
      '<b>A single header row</b> of unique, non-blank labels, one per column. Two header rows, or a blank heading, leave a field without a usable name.',
      '<b>Records in rows, fields in columns.</b> A sheet with one column per month is already a summary; reshape it into rows of month and value first (B02’s transforming-data lesson).',
      '<b>One type per value field.</b> Don’t mix text and numbers in a column you will sum.',
      '<b>No blank rows or columns.</b> Excel takes the source as the block of data around the selected cell, so a blank row or column cuts the data short.',
      '<b>No totals inside the data.</b> A subtotal row typed between the records would be summed with them and counted twice.',
      '<b>Ideally an Excel table.</b> The table grows when rows are added, so the PivotTable sees them at the next refresh.',
    ] },

    { h: 'Values: Sum, Count, Average and the rest' },
    { p: 'Right-click a value and choose Summarize Values By to pick the aggregation: Sum, Count, Average, Max, Min, Product, StdDev, StdDevp, Var or Varp (the last four belong to B04). A numeric field in Values starts as Sum. Microsoft states the rule for the exception: if the field contains blanks or non-numeric values (text, dates or Booleans) when you place it in Values, the PivotTable uses Count. So a column of order totals stored as text arrives as “Count of order_total”, and a cleaning problem shows up as a summary problem.' },
    { p: `Count counts non-empty values, as COUNTA does, not records. Lantern’s rating column is blank for orders that weren’t rated, so Count of rating gives ${D.rated}, not ${D.orders}; to count orders, count a field that is never blank, such as order_id. Average ignores blanks the same way: the average rating, ${D.meanRating.toFixed(2)}, is the average of the ${D.rated} ratings given, and says nothing about the ${D.orders - D.rated} orders without one.` },
    { p: `Several summaries can sit side by side: drag order_total into Values twice and set one to Sum and one to Average. By channel that gives ${money(chVal('app'))} and an average order of ${money(chVal('app') / chCnt('app'))} for the app, against ${money(chVal('web'))} and ${money(chVal('web') / chCnt('web'))} for the web shop, the <g>average order value</g> of each.` },
    { p: `Counting <i>different</i> things is another matter. Count of customer_id counts orders (${D.orders}), not customers. Microsoft’s Distinct Count summary counts each value once, but it works only when the PivotTable uses the Data Model (Excel for Windows): tick “Add this data to the Data Model” when you create it. For Lantern it gives ${customers} customers. Without the Data Model, <x>=ROWS(UNIQUE(Orders[customer_id]))</x> from the last lesson gives the same number.` },

    { h: 'Show Values As: shares instead of amounts' },
    { p: 'Right-click a value and choose Show Values As to replace each amount with a calculation on it. Microsoft lists, among others: % of Grand Total, % of Column Total, % of Row Total, % Of (a chosen base item), Difference From, % Difference From, Running Total In and the Rank options. The three percentage-of-total options answer different questions, and the formula cards below give each.' },
    { table: {
      caption: 'Order value by channel and month shown three ways',
      head: ['Cell: May, web', 'Divided by', 'Shows', 'Answers'],
      rows: [
        ['% of Grand Total', `the grand total, ${money(D.orderValue)}`, pct(mc('May', 'web') / D.orderValue), 'What share of the spring’s value was web orders in May?'],
        ['% of Column Total (months across)', `May’s total, ${money(mc('May'))}`, pct(mc('May', 'web') / mc('May')), 'What share of May’s value came through the web shop?'],
        ['% of Row Total (months across)', `the web total, ${money(chVal('web'))}`, pct(mc('May', 'web') / chVal('web')), 'What share of the web shop’s spring value came in May?'],
      ],
    } },
    { p: 'Which one is “% of column” depends on the layout: the same question needs % of Row Total if months run down the rows instead. Before you choose, say the question as “what share of X was Y” and check that the option divides by X. The wrong option still gives a tidy column of percentages that add up to 100% somewhere, which is why it goes unnoticed.' },

    { h: 'Grouping dates and numbers' },
    { p: 'A date field in Rows can show one row per day, which is rarely what you want. Right-click a date and choose Group, then under By choose Months (or Quarters, or another period); recent versions of Excel detect related time fields and group them for you. If the data span more than one year, select Years as well as Months, so that each row is one month of one year.' },
    { p: 'Numbers group the same way, into equal intervals: right-click an order_total row label, Group, Starting at 0, By 20, and the rows become $0–$20, $20–$40 and so on, the equal-width <g>binning</g> of B02. Bands of unequal width, such as Ana’s order-size bands, need a helper column with an approximate-match lookup (the lookups lesson), which then goes into Rows like any other field.' },

    { h: 'Sorting and filtering' },
    { p: 'Use the arrow on Row Labels or Column Labels to sort A to Z or Z to A, or right-click a cell and choose Sort, which sorts all the items at that level. To rank items by their totals, select a value in the Grand Total column and sort it. In a PivotTable, month and weekday names typed as text sort in calendar order by default, because PivotTable Options › Totals & Filters › Use Custom Lists when sorting is on, and Excel’s custom lists include the months and the days of the week. In an ordinary sort, or with that option off, they sort alphabetically (Apr, Jun, Mar, May). When a PivotTable doesn’t sort as you expect, Microsoft suggests Sort › More Sort Options, or unchecking that option.' },
    { p: 'Filters limit which records count. A field in the Filters area filters the whole PivotTable (channel = app, say), and the arrows on the labels filter rows or columns. A <g>slicer</g> does the same job with a panel of buttons that also shows what is selected: click in the PivotTable and choose Insert › Slicer. Slicers work on tables too, and one slicer can drive several PivotTables built from the same source through Report Connections.' },

    { h: 'Refresh and the pivot cache' },
    { p: 'A PivotTable doesn’t read the table cell by cell. It summarises a copy of the source data that it holds in memory, the <g>pivot cache</g>. When the source changes, the PivotTable keeps showing the old figures until it is refreshed: right-click it and choose Refresh, press Alt+F5, or use Refresh All on the PivotTable Analyze tab for every PivotTable at once. PivotTable Options › Data › “Refresh data when opening the file” refreshes on opening.' },
    { p: 'Microsoft is adding an Auto Refresh option for PivotTables on data in the same workbook, but when this lesson was checked it was available only to members of the Microsoft 365 Insider programme; don’t count on it. And refresh can only see what the source range covers. A PivotTable built on A1:M232 ignores orders pasted into row 233, refresh or not; built on the table <code>Orders</code>, it includes them, because the table grows. An old PivotTable can be pointed at a table with Change Data Source.' },

    { h: 'PivotCharts and GETPIVOTDATA' },
    { p: 'A PivotChart (Insert › PivotChart) charts a PivotTable’s summary, and the charts lesson covers which chart to choose. To use a PivotTable’s number in an ordinary formula, type = and click the value cell: Excel writes a GETPIVOTDATA formula such as <x>=GETPIVOTDATA("order_total",$A$3,"channel","web")</x>, which finds the value by its labels rather than its position, so it survives a rearranged layout. It returns only data the PivotTable shows, and #REF! if a filter hides it. You can switch the feature off with PivotTable Analyze › PivotTable › Options › Generate GetPivotData.' },

    { h: 'PivotTable or SUMIFS?' },
    { table: {
      caption: 'Choosing between a PivotTable and formulas',
      head: ['', 'PivotTable', 'SUMIFS, COUNTIFS and AVERAGEIFS'],
      rows: [
        ['Building and exploring', 'Seconds; drag to ask the next question', 'One formula per layout; slower to change'],
        ['New categories in the data', 'Appear by themselves at refresh', 'Need a new row or column of formulas'],
        ['Updating', 'Only when refreshed', 'Immediately, like any formula'],
        ['Layout and formatting', 'Excel’s layout, within limits', 'Exactly the report you design'],
        ['Shares, ranks, running totals', 'Show Values As', 'Formulas you write'],
        ['Counting different customers', 'Distinct Count, with the Data Model', 'UNIQUE (Microsoft 365, 2021, 2024)'],
        ['Categories with no records', 'Not shown (a blank)', 'Shown as 0'],
      ],
    } },
    { p: `Use a PivotTable to explore, to answer one-off questions and for summaries whose categories may change. Use a <g>summary table</g> of formulas for a fixed report or dashboard that must update the instant the data do, that must show a category even when it has no records, or whose layout matters. Whichever you use, reconcile: the PivotTable’s grand total must equal <x>=SUM(Orders[order_total])</x>, ${money(D.orderValue)} over ${D.orders} orders, and any cell you are about to quote should match a SUMIFS. A mismatch means a stale cache, a source range that stops short, or a filter you forgot.` },
  ],

  formulas: [
    { id: 'pct-grand-total', name: '% of Grand Total',
      tex: String.raw`s_{ij} = \dfrac{v_{ij}}{V}`,
      where: [[String.raw`v_{ij}`, 'The value in row i and column j of the PivotTable', 'as the data'], [String.raw`V`, 'The grand total of all the values', 'as the data'], [String.raw`s_{ij}`, 'The cell’s share of the whole table', '%']],
      assumptions: 'Every cell is divided by the same number, so all the cells add up to 100%.' },
    { id: 'pct-row-total', name: '% of Row Total',
      tex: String.raw`s_{ij} = \dfrac{v_{ij}}{R_i}`,
      where: [[String.raw`v_{ij}`, 'The value in row i and column j', 'as the data'], [String.raw`R_i`, 'The total of row i', 'as the data'], [String.raw`s_{ij}`, 'The cell’s share of its row', '%']],
      assumptions: 'Each row adds up to 100%. Use it when the question is a share of a row item.' },
    { id: 'pct-column-total', name: '% of Column Total',
      tex: String.raw`s_{ij} = \dfrac{v_{ij}}{C_j}`,
      where: [[String.raw`v_{ij}`, 'The value in row i and column j', 'as the data'], [String.raw`C_j`, 'The total of column j', 'as the data'], [String.raw`s_{ij}`, 'The cell’s share of its column', '%']],
      assumptions: 'Each column adds up to 100%. Use it when the question is a share of a column item.' },
  ],

  examples: [
    { level: 'simple', title: 'Orders and order value by channel', fictional: true,
      setup: 'Ana builds a PivotTable on Orders with channel in Rows and three value fields: Count of order_id, Sum of order_total and Average of order_total. She then shows a second copy of the sum as % of Grand Total. What does it show?',
      table: {
        caption: 'The PivotTable (channel in Rows)',
        head: ['channel', 'Count of order_id', 'Sum of order_total', 'Average of order_total', '% of Grand Total'],
        align: ['l', 'r', 'r', 'r', 'r'],
        rows: [
          ['app', String(chCnt('app')), money(chVal('app')), money(chVal('app') / chCnt('app')), pct(chVal('app') / D.orderValue)],
          ['web', String(chCnt('web')), money(chVal('web')), money(chVal('web') / chCnt('web')), pct(chVal('web') / D.orderValue)],
          ['Grand Total', String(D.orders), money(D.orderValue), money(D.orderValue / D.orders), '100.0%'],
        ],
      },
      steps: [
        'Count the orders with order_id, a field that is never blank: ' + chCnt('app') + ' app and ' + chCnt('web') + ' web orders, ' + D.orders + ' in all.',
        'Sum order_total: ' + money(chVal('app')) + ' and ' + money(chVal('web')) + ', which add up to the grand total ' + money(D.orderValue) + ': the reconciliation check passes.',
        'Average order_total gives each channel’s average order value: ' + money(chVal('app')) + ' ÷ ' + chCnt('app') + ' = ' + money(chVal('app') / chCnt('app')) + ' and ' + money(chVal('web')) + ' ÷ ' + chCnt('web') + ' = ' + money(chVal('web') / chCnt('web')) + '.',
        '% of Grand Total divides each sum by ' + money(D.orderValue) + ': ' + pct(chVal('app') / D.orderValue) + ' app and ' + pct(chVal('web') / D.orderValue) + ' web.',
      ],
      answer: 'The app took ' + chCnt('app') + ' orders worth ' + money(chVal('app')) + ' (' + pct(chVal('app') / D.orderValue) + ' of the value, average ' + money(chVal('app') / chCnt('app')) + '); the web shop ' + chCnt('web') + ' orders worth ' + money(chVal('web')) + ' (' + pct(chVal('web') / D.orderValue) + ', average ' + money(chVal('web') / chCnt('web')) + ').',
      interpretation: 'Four numbers per channel from one drag-and-drop table, and a total that matches the source. The web shop’s higher average includes the $1,512.00 office order; the challenging example shows how much one order can move a PivotTable’s figures.' },

    { level: 'challenging', title: 'What share of each month came through the app?', fictional: true,
      setup: 'Ana puts channel in Rows, order_date grouped by Months in Columns and Sum of order_total in Values, then wants each month’s split between app and web. Which Show Values As option answers that, what does it show, and how should she read May?',
      table: {
        caption: 'Sum of order_total, and the same values as % of Column Total',
        head: ['channel', ...MONTHS, 'Grand Total'],
        align: ['l', 'r', 'r', 'r', 'r', 'r'],
        rows: [
          ['app', ...MONTHS.map((m) => money(mc(m, 'app'))), money(chVal('app'))],
          ['web', ...MONTHS.map((m) => money(mc(m, 'web'))), money(chVal('web'))],
          ['app, % of column', ...MONTHS.map((m) => pct(mc(m, 'app') / mc(m))), pct(chVal('app') / D.orderValue)],
          ['web, % of column', ...MONTHS.map((m) => pct(mc(m, 'web') / mc(m))), pct(chVal('web') / D.orderValue)],
        ],
      },
      steps: [
        'Say the question as a share: “what share of each month’s value came through the app?” The base is the month’s total. Months run across, so each month is a column: % of Column Total.',
        'Each cell is divided by its month’s total: in March ' + money(mc('Mar', 'app')) + ' ÷ ' + money(mc('Mar')) + ' = ' + pct(mc('Mar', 'app') / mc('Mar')) + '; in May ' + money(mc('May', 'app')) + ' ÷ ' + money(mc('May')) + ' = ' + pct(mc('May', 'app') / mc('May')) + '. Each column adds up to 100%.',
        'May looks like a collapse of the app’s share, from about ' + pct(mc('Apr', 'app') / mc('Apr'), 0) + ' to ' + pct(mc('May', 'app') / mc('May'), 0) + '. Check the records first: the web column includes ' + D.bulk.id + ', ' + money(D.bulk.value) + '. Without it May’s web value is ' + money(mc('May', 'web') - D.bulk.value) + ' and the app’s share of May is ' + money(mc('May', 'app')) + ' ÷ ' + money(mc('May') - D.bulk.value) + ' = ' + pct(mc('May', 'app') / (mc('May') - D.bulk.value)) + ', higher than in any other month (' + Math.floor(otherMin * 100) + '–' + Math.ceil(otherMax * 100) + '%), so the app had if anything a good May.',
        'Reconcile one cell before quoting it: <x>=SUMIFS(Orders[order_total],Orders[channel],"web",Orders[order_date],">="&DATE(2026,5,1),Orders[order_date],"<"&DATE(2026,6,1))</x> returns ' + money(mc('May', 'web')) + ', the same as the PivotTable.',
      ],
      answer: '% of Column Total. The app’s share was ' + MONTHS.map((m) => `${pct(mc(m, 'app') / mc(m))} in ${m}`).join(', ') + '. May’s low figure is one office order, not a shift in how customers buy: without it the app’s May share is ' + pct(mc('May', 'app') / (mc('May') - D.bulk.value)) + ', its highest of the spring.',
      interpretation: 'The PivotTable did the arithmetic; the analyst chose the base and checked the records behind the surprise. % of Row Total would have answered a different question (how the app’s spring value was spread over the months) and looked just as tidy.' },

    { level: 'applied', title: 'Which catering events to plan for', fictional: true,
      setup: `Ana is deciding how to staff and market catering for 2027 and builds a PivotTable on her ${D.events} events of 2026: event type in Rows, with Count of event_id, Sum of invoice and Average of invoice. A second PivotTable has the event date grouped by Months. Which types matter most, and when is she busiest?`,
      table: {
        caption: 'Catering events by type, 2026',
        head: ['Type', 'Events', 'Invoices', 'Average invoice', '% of invoices'],
        align: ['l', 'r', 'r', 'r', 'r'],
        rows: [
          ...TYPES.map((t) => [t, String(evN(t)), money(evV(t)), money(evV(t) / evN(t)), pct(evV(t) / D.eventValue)]),
          ['Grand Total', String(D.events), money(D.eventValue), money(D.eventValue / D.events), '100.0%'],
        ],
      },
      steps: [
        'Reconcile: ' + D.events + ' events and ' + money(D.eventValue) + ' of invoices, the totals F02 records for the year.',
        'Meetings are the most frequent type (' + evN('Meeting') + ' events) and bring in the most, ' + money(evV('Meeting')) + ' or ' + pct(evV('Meeting') / D.eventValue) + ', but at the lowest average, ' + money(evV('Meeting') / evN('Meeting')) + '.',
        'Conferences have the highest average, ' + money(evV('Conference') / evN('Conference')) + ', but the cell includes Meridian Partners’ two-day conference at ' + money(meridian[ec('invoice')]) + '. Without it the other ' + (evN('Conference') - 1) + ' average ' + money((evV('Conference') - meridian[ec('invoice')]) / (evN('Conference') - 1)) + ', below breakfasts at ' + money(evV('Breakfast') / evN('Breakfast')) + '.',
        'By month, events build up through the year, apart from a summer dip (' + D.eventsByMonth.Jul + ' in July, ' + D.eventsByMonth.Aug + ' in August): ' + D.eventsByMonth.Mar + ' in March, ' + D.eventsByMonth.Oct + ' in October, ' + D.eventsByMonth.Nov + ' in November and ' + D.eventsByMonth.Dec + ' in December. October to December hold ' + q4 + ' of the ' + D.events + ' events (' + pct(q4 / D.events) + ').',
      ],
      answer: 'Meetings are the volume business and breakfasts the best regular earners per event once the one two-day conference is set aside; ' + pct(q4 / D.events) + ' of events fall in the last quarter, with December the busiest month (' + D.eventsByMonth.Dec + ').',
      interpretation: 'Ana books extra staff for October to December 2027 and promotes breakfasts to the clients who already order meetings. The PivotTable gave the counts and sums; the decision came from reading the averages with their outlier in mind. Whether the quotes cover their costs is a question for the what-if lesson.' },
  ],

  demo: [
    { widget: 'pv-orders', intro: 'Lantern’s 231 spring orders. Start with Month in Rows and Channel in Columns, then try the questions from this lesson: change Summarise values by to Count and Average; set Show values as to % of Column Total and then % of Row Total and say what each answers; filter Subscription to yes; put Region in Rows.' },
    { widget: 'pv-events', intro: 'Lantern’s 76 catering events in 2026. Put Month in Rows to see the year build up, then Type in Columns with Count of Events. Which month has the most conferences?' },
  ],

  mistakes: [
    { title: '“The PivotTable shows the latest data.”', html: 'It shows its cache as of the last refresh. After correcting or adding data, refresh (Alt+F5, or Refresh All), and build it on an Excel table so that new rows are inside the source range.' },
    { title: '“Count of a column counts the rows.”', html: 'Count counts non-empty values, as COUNTA does. Count of rating counts rated orders only. Count a field that is never blank, such as an id, to count records, and use Distinct Count (with the Data Model) to count different customers.' },
    { title: '“My totals show as Count, so the PivotTable is broken.”', html: 'A value field with any text or blanks in it starts as Count. Usually the numbers are stored as text: clean the column (VALUE, as in the last lesson), refresh, and switch the field to Sum.' },
    { title: '“Any percentage option will do.”', html: '% of Grand Total, % of Row Total and % of Column Total divide by different bases and answer different questions. Say the question as “what share of X is Y”, and check that the option divides by X in your layout.' },
    { title: '“A big number in a PivotTable is a trend.”', html: 'A sum can be one record. May’s high value is one office order. Check the records behind a surprising cell (filter the table, or sort by value) before you explain it.' },
    { title: '“If the PivotTable is right, I don’t need to check it.”', html: 'Reconcile its grand total with a SUM of the source and spot-check a cell with SUMIFS. Stale caches, short source ranges and forgotten filters all produce totals that look perfectly reasonable.' },
  ],

  application: [
    { p: '<b>Lantern’s monthly review.</b> Ana keeps one PivotTable sheet on the Orders table, with slicers for channel, region and subscription. At each month-end she pastes the cleaned orders into the table, clicks Refresh All, and checks that the grand total equals the SUM of order_total before she reads anything else. Questions that come up in the meeting (“what about the app in the North?”) are answered by clicking a slicer, not by writing new formulas.' },
    { p: '<b>A bookshop’s buying decisions.</b> Cobble Lane Books, a fictional bookshop, exports its till data each week. The buyer’s PivotTable puts category in Rows and weeks in Columns, with Sum of sales and % of Row Total, to see whether each category’s sales are rising through the term; categories that appear for the first time (a new author’s series) show up at the next refresh without anyone editing a formula.' },
    { p: '<b>From exploration to a fixed report.</b> Once the questions settle, an analyst often rebuilds the few figures that matter with SUMIFS on a report sheet: fixed layout, every category shown even when it is zero, instant updates. The PivotTable stays as the exploring tool and as the check: each month, the report’s SUMIFS figures must equal the PivotTable’s. The dashboards lesson builds on this.' },
    { p: '<b>Customers, not orders.</b> A coffee-subscription start-up (fictional) reports “active customers” each month. Its analyst builds the PivotTable with “Add this data to the Data Model” ticked, puts the month in Rows and the customer id in Values as a Distinct Count, and puts Count of order id beside it. The gap between the two columns is the repeat buying the founders want to see, and it would vanish if someone counted ids without the Data Model.' },
  ],

  summary: [
    'A PivotTable groups the records of its source by the fields in Rows and Columns and aggregates a field in Values; Filters limit which records count.',
    'Build it on an Excel table of clean data: one header row of unique labels, one record per row, no totals inside the data.',
    'Numeric fields start as Sum; a field with text or blanks starts as Count, which counts non-empty values, like COUNTA. Distinct Count needs the Data Model.',
    'Show Values As gives % of Grand Total, % of Row Total and % of Column Total; choose the one whose base matches the question’s “share of what”.',
    'Group dates by months (and years), group numbers into equal intervals, and sort by labels or totals.',
    'A PivotTable summarises its cache: refresh after the data change, and build it on a table so new rows are included.',
    'Every value cell is a conditional aggregate: reconcile the grand total with SUM and spot-check cells with SUMIFS; use formulas for fixed, always-live reports.',
  ],

  glossary: [
    { term: 'PivotTable', def: 'Excel’s interactive summary table: it groups the records of a source by the fields placed in its Rows and Columns areas and aggregates a field placed in its Values area, rebuilding when fields are moved.' },
    { term: 'Pivot cache', def: 'The copy of the source data that a PivotTable summarises; the PivotTable shows new or corrected data only after it is refreshed.' },
    { term: 'Slicer', def: 'An Excel panel of buttons that filters a table or PivotTable and shows which items are selected; one slicer can control several PivotTables that share the same data source.' },
    { term: 'Distinct count', def: 'The number of different values in a field, counting each value once however many records share it, such as the number of customers rather than orders.' },
  ],

  references: [
    { text: 'Microsoft Support. <i>Create a PivotTable to analyze worksheet data</i>.', url: 'https://support.microsoft.com/office/18fb0032-b01a-4c99-9a5f-7ab09edde05a', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>Use the Field List to arrange fields in a PivotTable</i>.', url: 'https://support.microsoft.com/en-us/Excel/get-started/use-the-field-list-to-arrange-fields-in-a-pivottable', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>Sum values in a PivotTable</i>. Lists the summary functions, the Count default and Distinct Count.', url: 'https://support.microsoft.com/en-us/excel/sum-values-in-a-pivottable', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>Show different calculations in PivotTable value fields</i>.', url: 'https://support.microsoft.com/en-US/Excel/show-different-calculations-in-pivottable-value-fields', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>Refresh PivotTable data</i>.', url: 'https://support.microsoft.com/office/refresh-pivottable-data-6d24cece-a038-468a-8176-8b6568ca9be2', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>GETPIVOTDATA function</i>.', url: 'https://support.microsoft.com/en-us/Excel/functions/getpivotdata-function', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>When PivotTables don’t sort as expected</i>.', url: 'https://support.microsoft.com/en-gb/office/when-pivottables-don-t-sort-as-expected-a2a96f9d-cf38-448e-a4be-333e96cb3742', checked: '2026-10-23' },
  ],

  checks: [
    // the idea
    { what: 'Order value', value: D.orderValue, shown: 9096.15 },
    { what: 'Orders', value: D.orders, shown: 231 },
    { what: 'Mar app', value: mc('Mar', 'app'), shown: 910.75 },
    { what: 'Mar web', value: mc('Mar', 'web'), shown: 1065.10 },
    { what: 'Mar total', value: mc('Mar'), shown: 1975.85 },
    { what: 'Apr app', value: mc('Apr', 'app'), shown: 1012.65 },
    { what: 'Apr web', value: mc('Apr', 'web'), shown: 1162.90 },
    { what: 'Apr total', value: mc('Apr'), shown: 2175.55 },
    { what: 'May app', value: mc('May', 'app'), shown: 770.70 },
    { what: 'May web', value: mc('May', 'web'), shown: 2159.05 },
    { what: 'May total', value: D.byMonth.value.May, shown: 2929.75 },
    { what: 'Jun app', value: mc('Jun', 'app'), shown: 962.10 },
    { what: 'Jun web', value: mc('Jun', 'web'), shown: 1052.90 },
    { what: 'Jun total', value: mc('Jun'), shown: 2015 },
    { what: 'App total', value: chVal('app'), shown: 3656.20 },
    { what: 'Web total', value: chVal('web'), shown: 5439.95 },
    { what: 'May orders', value: D.byMonth.orders.May, shown: 49 },
    { what: 'May has the fewest orders', value: Math.min(...MONTHS.map((m) => D.byMonth.orders[m])), shown: 49 },
    { what: 'Bulk order value', value: D.bulk.value, shown: 1512 },
    { what: 'Bulk order bags', value: bulk[oc('quantity')], shown: 120 },
    { what: 'Bulk order date (day of May)', value: Number(bulk[oc('order_date')].slice(8, 10)), shown: 14 },
    { what: 'Bulk order channel is web (1 = yes)', value: bulk[oc('channel')] === 'web' ? 1 : 0, shown: 1 },
    { what: 'May without the bulk order', value: D.byMonth.value.May - D.bulk.value, shown: 1417.75 },
    { what: 'May without bulk is the lowest month', value: Math.min(D.byMonth.value.May - D.bulk.value, ...['Mar', 'Apr', 'Jun'].map((m) => D.byMonth.value[m])), shown: 1417.75 },
    // values
    { what: 'Rated orders', value: D.rated, shown: 154 },
    { what: 'Unrated orders', value: D.orders - D.rated, shown: 77 },
    { what: 'Average rating', value: D.meanRating, shown: 4.10, tol: 0.005 },
    { what: 'App AOV', value: chVal('app') / chCnt('app'), shown: 36.93 },
    { what: 'Web AOV', value: chVal('web') / chCnt('web'), shown: 41.21 },
    { what: 'Customers', value: customers, shown: 112 },
    // Show Values As
    { what: 'May web % of grand total', value: mc('May', 'web') / D.orderValue * 100, shown: 23.7, tol: 0.05 },
    { what: 'May web % of May', value: mc('May', 'web') / mc('May') * 100, shown: 73.7, tol: 0.05 },
    { what: 'May web % of web', value: mc('May', 'web') / chVal('web') * 100, shown: 39.7, tol: 0.05 },
    // simple example
    { what: 'App orders', value: chCnt('app'), shown: 99 },
    { what: 'Web orders', value: chCnt('web'), shown: 132 },
    { what: 'Overall AOV', value: D.orderValue / D.orders, shown: 39.38 },
    { what: 'App share %', value: chVal('app') / D.orderValue * 100, shown: 40.2, tol: 0.05 },
    { what: 'Web share %', value: chVal('web') / D.orderValue * 100, shown: 59.8, tol: 0.05 },
    // challenging example
    { what: 'App % of Mar', value: mc('Mar', 'app') / mc('Mar') * 100, shown: 46.1, tol: 0.05 },
    { what: 'App % of Apr', value: mc('Apr', 'app') / mc('Apr') * 100, shown: 46.5, tol: 0.05 },
    { what: 'App % of May', value: mc('May', 'app') / mc('May') * 100, shown: 26.3, tol: 0.05 },
    { what: 'App % of Jun', value: mc('Jun', 'app') / mc('Jun') * 100, shown: 47.7, tol: 0.05 },
    { what: 'App % of Apr (rounded)', value: mc('Apr', 'app') / mc('Apr') * 100, shown: 47, tol: 0.5 },
    { what: 'App % of May (rounded)', value: mc('May', 'app') / mc('May') * 100, shown: 26, tol: 0.5 },
    { what: 'Web % of Mar', value: mc('Mar', 'web') / mc('Mar') * 100, shown: 53.9, tol: 0.05 },
    { what: 'May web without bulk', value: mc('May', 'web') - D.bulk.value, shown: 647.05 },
    { what: 'App share of May without bulk', value: mc('May', 'app') / (mc('May') - D.bulk.value) * 100, shown: 54.4, tol: 0.05 },
    { what: 'Lowest app share of the other months (floor %)', value: Math.floor(otherMin * 100), shown: 46 },
    { what: 'Highest app share of the other months (ceil %)', value: Math.ceil(otherMax * 100), shown: 48 },
    { what: 'May without bulk above every other month (1 = yes)', value: mc('May', 'app') / (mc('May') - D.bulk.value) > otherMax ? 1 : 0, shown: 1 },
    { what: 'July events', value: D.eventsByMonth.Jul, shown: 6 },
    { what: 'August events', value: D.eventsByMonth.Aug, shown: 5 },
    // applied example
    { what: 'Events', value: D.events, shown: 76 },
    { what: 'Invoices', value: D.eventValue, shown: 62320 },
    { what: 'Average invoice', value: D.eventValue / D.events, shown: 820 },
    { what: 'Meetings', value: evN('Meeting'), shown: 28 },
    { what: 'Meeting invoices', value: evV('Meeting'), shown: 18200 },
    { what: 'Meeting share %', value: evV('Meeting') / D.eventValue * 100, shown: 29.2, tol: 0.05 },
    { what: 'Meeting average', value: evV('Meeting') / evN('Meeting'), shown: 650 },
    { what: 'Conference average', value: evV('Conference') / evN('Conference'), shown: 1118.46 },
    { what: 'Meridian invoice', value: meridian[ec('invoice')], shown: 4200 },
    { what: 'Other conferences', value: evN('Conference') - 1, shown: 12 },
    { what: 'Other conferences average', value: (evV('Conference') - meridian[ec('invoice')]) / (evN('Conference') - 1), shown: 861.67 },
    { what: 'Breakfast average', value: evV('Breakfast') / evN('Breakfast'), shown: 927.69 },
    { what: 'March events', value: D.eventsByMonth.Mar, shown: 3 },
    { what: 'October events', value: D.eventsByMonth.Oct, shown: 10 },
    { what: 'November events', value: D.eventsByMonth.Nov, shown: 11 },
    { what: 'December events', value: D.eventsByMonth.Dec, shown: 13 },
    { what: 'Q4 events', value: q4, shown: 34 },
    { what: 'Q4 share %', value: q4 / D.events * 100, shown: 44.7, tol: 0.05 },
    { what: 'Group interval', value: 20, shown: 20 },
  ],
};
