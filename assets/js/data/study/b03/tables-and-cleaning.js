// tables-and-cleaning.js — B03 · Excel tables and cleaning data. Content only; exercises are in tables-and-cleaning.ex.js.
// Lantern's orders and raw export come from case.js; Spokewise Cycles' workshop jobs are invented here. Excel behaviour
// checked on Microsoft's pages on 23 October 2026 (see references).
import { ORDERS, ORDER_COLUMNS, RAW, RAW_COLUMNS, DERIVED as D } from './case.js?v=11';

const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const oc = (name) => ORDER_COLUMNS.indexOf(name);
const rc = (name) => RAW_COLUMNS.indexOf(name);
const num = (t) => Number(String(t).replace(/[$,]/g, ''));
const sum = (a) => a.reduce((s, x) => s + x, 0);
const r2 = (x) => Math.round(x * 100) / 100;

// the simple example: the first eight orders as a table
const EIGHT = ORDERS.slice(0, 8);
const eightTotal = sum(EIGHT.map((r) => r[oc('order_total')]));
const appTotal = sum(EIGHT.filter((r) => r[oc('channel')] === 'app').map((r) => r[oc('order_total')]));
const appCount = EIGHT.filter((r) => r[oc('channel')] === 'app').length;

// the raw export (B02): profile facts
const rawDates = RAW.map((r) => r[rc('order_date')]);
const iso = rawDates.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).length;
const written = rawDates.filter((d) => /^[A-Za-z]/.test(d)).length;
const slash = rawDates.filter((d) => /^\d{2}\/\d{2}\/\d{4}$/.test(d)).length;
const priceWithDollar = RAW.filter((r) => r[rc('unit_price')].startsWith('$')).length;
const blankRatings = RAW.filter((r) => r[rc('rating')] === '').length;
const idCount = (id) => RAW.filter((r) => r[0] === id).length;
const mismatch = RAW.filter((r) => Math.abs(num(r[rc('order_total')]) - (num(r[rc('quantity')]) * num(r[rc('unit_price')]) - num(r[rc('discount')]))) > 0.005);
// the challenging example: six raw rows
const PICK = ['LC-10002', 'LC-10003', 'LC-10006', 'LC-10007', 'LC-10003', 'LC-10016'].map((id, k) => RAW.filter((r) => r[0] === id)[k === 4 ? 1 : 0]);
const RAW16 = RAW.find((r) => r[0] === 'LC-10016');
const gap = (r) => r2(num(r[rc('order_total')]) - (num(r[rc('quantity')]) * num(r[rc('unit_price')]) - num(r[rc('discount')])));
const clean16 = ORDERS.find((r) => r[0] === 'LC-10016')[oc('order_total')];

// the applied example: Spokewise Cycles' workshop jobs (fictional)
const JOBS = [
  ['J-301', 'Luis', 'open', '6 Jul', 2.5], ['J-302', 'Mei', 'done', '3 Jul', 1.0], ['J-303', 'Luis', 'open', '7 Jul', 3.0],
  ['J-304', 'Dana', 'open', '6 Jul', 1.5], ['J-305', 'Luis', 'waiting for parts', '9 Jul', 2.0], ['J-306', 'Mei', 'open', '8 Jul', 1.0],
  ['J-307', 'Luis', 'open', '8 Jul', 2.0], ['J-308', 'Dana', 'open', '10 Jul', 2.5], ['J-309', 'Luis', 'open', '10 Jul', 2.0],
];
const openHours = (m) => sum(JOBS.filter((j) => j[1] === m && j[2] === 'open').map((j) => j[4]));
const openJobs = (m) => JOBS.filter((j) => j[1] === m && j[2] === 'open').length;
const CAPACITY = 8;

export default {
  slug: 'tables-and-cleaning',
  title: 'Excel tables and cleaning data',
  blurb: 'Turn a range into an Excel table, so that formulas refer to columns by name and grow with the data; sort, filter and validate it; and clean an imported export with TRIM, VALUE, DATE and the dynamic array functions, keeping the raw data untouched and every step on record.',
  status: 'reviewed',
  objectives: [
    'Build an Excel table, and write structured references, calculated columns and a total row.',
    'Use sorting, filtering, data validation and Remove Duplicates, and explain what each one does to the data.',
    'Clean imported text, numbers and dates with TRIM, CLEAN, PROPER, SUBSTITUTE, VALUE, DATEVALUE and DATE, keeping the raw data untouched and logging each step.',
    'Choose between formulas, Text to Columns, Flash Fill, Find and Replace and Power Query for a cleaning job.',
    'Use UNIQUE, SORT, SORTBY and FILTER, and explain spill ranges and the #SPILL! error.',
  ],
  prerequisites: [
    { lesson: 'b03/lookups', why: 'Lookups into tables, and the idea of a formula that spills, come from that lesson.' },
    { lesson: 'b03/functions-and-logic', why: 'TRIM, SUBSTITUTE, VALUE, DATEVALUE and DATE are introduced there as general tools; here they become a cleaning workflow.' },
    { lesson: 'b02/types-and-formats', why: 'Numbers stored as text and ambiguous slash dates, and how B02 decided Lantern’s, are explained there.' },
    { lesson: 'b02/data-quality-report', why: 'The raw data, the cleaning log and reproducibility are defined there.' },
  ],
  case: 'lantern',

  concept: [
    { case: `Ana’s order workbook holds the ${D.orders} cleaned spring orders as a plain range, A1:M${D.orders + 1}. Every month she pastes new orders underneath, and then has to stretch every formula, every SUM range and every chart to reach the new rows; twice she has forgotten one and reported a total that stopped at June’s first week. Each month’s orders also arrive as a raw export from the shop platform, with the same untidy text, prices and dates that B02 cleaned, and she cleans them again by hand.` },
    { p: 'An <g>Excel table</g> solves the first problem. It is a range that Excel manages as one object, with a name, a header row, and columns that formulas can refer to by name. To make one, click any cell in the data and choose Insert › Table, or press Ctrl+T (Ctrl+L also works; on a Mac, ⌘+T or Control+T), and confirm that the table has headers. Excel names it Table1; give it a better name in the Table Design tab (Table on a Mac) › Table Name. Ana calls hers <code>Orders</code>.' },
    { p: 'Table names have rules: they start with a letter, an underscore or a backslash, contain no spaces (use an underscore or a full stop), run to at most 255 characters, can’t look like a cell reference such as Z100, and must be unique in the workbook, ignoring capitals. Three things change as soon as the range is a table. Filter buttons appear on every header. Typing or pasting in the row directly below the table, or the column to its right, makes the table grow to include it. And formulas can name columns instead of cell ranges.' },
    { table: {
      caption: 'The same formulas written with cell references and with structured references',
      head: ['What it does', 'With cell references', 'With structured references'],
      rows: [
        ['Total order value', `<x>=SUM(J2:J${D.orders + 1})</x>`, '<x>=SUM(Orders[order_total])</x>'],
        ['Recompute this row’s total', '<x>=G2*H2-I2</x>', '<x>=[@quantity]*[@unit_price]-[@discount]</x>'],
        ['App order value', `<x>=SUMIFS(J2:J${D.orders + 1},K2:K${D.orders + 1},"app")</x>`, '<x>=SUMIFS(Orders[order_total],Orders[channel],"app")</x>'],
        ['Number of orders', `<x>=COUNTA(A2:A${D.orders + 1})</x>`, '<x>=ROWS(Orders)</x>'],
      ],
    } },
    { p: 'A <g>structured reference</g> such as <code>Orders[order_total]</code> means “the data in the <code>order_total</code> column of the <code>Orders</code> table”, however many rows that is today. When July’s orders are pasted under the table, <x>=SUM(Orders[order_total])</x> includes them, while <x>=SUM(J2:J232)</x> stops at row 232. Structured references are also easier to read: a reviewer can see what <x>=SUMIFS(Orders[order_total],Orders[channel],"app")</x> adds up without opening the columns.' },
    { p: 'The second problem, cleaning the raw export, needs a workflow rather than a feature. B02 set its rules: keep the <g>raw data</g> exactly as received, build the cleaned version from it by steps that can be repeated, and record each step in a <g>cleaning log</g>. In Excel that means a raw sheet nobody edits, a cleaning sheet whose columns are formulas pointing at it (or a Power Query that does the same), and a table of the clean result that the analysis reads.' },
    { figure: {
      svg: '<svg viewBox="0 0 680 210" xmlns="http://www.w3.org/2000/svg" font-size="13" fill="currentColor"><defs><marker id="tc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--ink-3)"/></marker></defs><rect x="10" y="30" width="170" height="86" rx="8" fill="none" stroke="var(--rule-strong)" stroke-width="2"/><text x="95" y="54" text-anchor="middle" font-weight="700">Raw sheet</text><text x="95" y="76" text-anchor="middle">the export as received:</text><text x="95" y="94" text-anchor="middle">nobody edits it</text><rect x="250" y="30" width="180" height="86" rx="8" fill="none" stroke="var(--series-1)" stroke-width="2"/><text x="340" y="54" text-anchor="middle" font-weight="700">Cleaning sheet</text><text x="340" y="76" text-anchor="middle">formulas: TRIM, VALUE,</text><text x="340" y="94" text-anchor="middle">DATE, checks and flags</text><rect x="500" y="30" width="170" height="86" rx="8" fill="none" stroke="var(--series-2)" stroke-width="2"/><text x="585" y="54" text-anchor="middle" font-weight="700">Orders table</text><text x="585" y="76" text-anchor="middle">clean values that</text><text x="585" y="94" text-anchor="middle">formulas and pivots read</text><line x1="182" y1="73" x2="248" y2="73" stroke="var(--ink-3)" stroke-width="1.5" marker-end="url(#tc-arrow)"/><line x1="432" y1="73" x2="498" y2="73" stroke="var(--ink-3)" stroke-width="1.5" marker-end="url(#tc-arrow)"/><rect x="250" y="146" width="180" height="50" rx="8" fill="none" stroke="var(--rule-strong)" stroke-width="1.5" stroke-dasharray="5 4"/><text x="340" y="168" text-anchor="middle" font-weight="700">Cleaning log</text><text x="340" y="186" text-anchor="middle">each step, rule and row count</text><line x1="340" y1="118" x2="340" y2="144" stroke="var(--ink-3)" stroke-width="1.5" marker-end="url(#tc-arrow)"/><text x="215" y="22" text-anchor="middle" font-size="12" fill="var(--ink-3)">paste next month’s export</text><text x="465" y="22" text-anchor="middle" font-size="12" fill="var(--ink-3)">values only</text></svg>',
      caption: 'A repeatable cleaning workflow in a workbook. Next month’s export goes into the raw sheet, the formulas recalculate, and the log says what each column does.',
      alt: 'A flow diagram with three boxes in a row joined by arrows. The first box, Raw sheet, says “the export as received: nobody edits it”; the label on the arrow out of it reads “paste next month’s export”. The second box, Cleaning sheet, says “formulas: TRIM, VALUE, DATE, checks and flags”. The arrow from it to the third box is labelled “values only”. The third box, Orders table, says “clean values that formulas and pivots read”. Below the Cleaning sheet, a dashed box labelled Cleaning log says “each step, rule and row count”, with an arrow from the cleaning sheet to it.',
    } },
    { callout: 'key', title: 'Never clean in place', html: 'Every edit typed over the raw data is a step nobody can see or repeat. Clean with formulas or recorded query steps that point at an untouched raw sheet, check the result, and log what each step did. Next month, paste the new export into the raw sheet and the clean version rebuilds itself.' },
  ],

  theory: [
    { h: 'Structured references' },
    { p: 'Excel writes structured references for you: start a formula, click a cell or a column of the table, and the reference appears by name. You can also type them. Inside the table, a reference to the same row needs no table name; outside it, name the table.' },
    { table: {
      caption: 'The forms you will use most (table Orders)',
      head: ['Reference', 'Means'],
      rows: [
        ['<code>Orders[order_total]</code>', 'The data rows of the order_total column'],
        ['<code>[@quantity]</code> or <code>Orders[@quantity]</code>', 'The quantity in the same row as the formula (Excel writes @ for “this row”)'],
        ['<code>Orders</code>', 'All the data rows of the table'],
        ['<code>Orders[#Headers]</code>, <code>Orders[#Totals]</code>, <code>Orders[#All]</code>', 'The header row; the total row; the whole table including both'],
      ],
    } },
    { p: 'Structured references adjust themselves: when rows are added or removed, the column references cover the new extent, and when you rename a column or the table, Excel updates every formula in the workbook that uses it. Copying a formula keeps its structured references exactly as written. Filling a fully qualified reference across, as Microsoft puts it, adjusts the column specifiers “like a series”, so <code>Orders[quantity]</code> filled one column to the right becomes <code>Orders[unit_price]</code>, the next column’s name.' },

    { h: 'Calculated columns and the total row' },
    { p: 'Type a heading in the empty column to the right of a table and the table widens to include it. Type a formula in one cell of that column, press Enter, and Excel fills it down the whole column: a <g>calculated column</g>. Rows added later receive the formula too, so the column never has a gap. Ana’s first calculated column checks every order’s arithmetic, the B02 cross-field check written as a formula: <x>=[@order_total]-([@quantity]*[@unit_price]-[@discount])</x> should be 0 in every row.' },
    { p: 'The <g>total row</g> is switched on with Table Design › Total Row. Each cell in it has a drop-down of summary functions, and the defaults use SUBTOTAL: the sum of a column is written <x>=SUBTOTAL(109,[order_total])</x>. SUBTOTAL’s first argument chooses the calculation and what to do with hidden rows: 9 sums including rows you have hidden by hand, 109 sums excluding them, and both always leave out rows hidden by a filter. SUBTOTAL also ignores other SUBTOTALs inside its range, so subtotals are never counted twice.' },
    { p: 'That makes the total row a live summary of whatever the filter shows. Filter <code>Orders</code> to the app channel and the total row shows the app orders’ value, while <x>=SUM(Orders[order_total])</x> elsewhere still shows all ' + D.orders + ' orders. Neither is wrong; they answer different questions, so label them.' },

    { h: 'Sorting and filtering' },
    { p: 'Sorting rearranges rows: Sort A to Z or Sort Largest to Smallest on a column, or several levels at once with Data › Sort and Add Level. Sort whole records, never one column on its own: sorting part of a range separates the sorted cells from the rest of their records, and when Excel notices that you have selected only part of the data it offers to expand the selection, which you should accept. A table always sorts whole rows. If the original order matters (the order the export arrived in, say), keep an id column you can sort back by.' },
    { p: 'Filtering hides the rows that don’t meet a condition; nothing is deleted. A table has filter buttons on its headers already, and a plain range gets them from Data › Filter. Each button offers text, number or date filters to suit the column, such as channel equals app, order_total greater than 35, or order_date in May. Pair a filter with SUBTOTAL, not SUM, when the total should follow what you see.' },

    { h: 'Data validation' },
    { p: '<g>Data validation</g> (Data › Data Validation) restricts what can be typed into cells. It guards new entries: B02’s <g>validation rule</g> checks data that already exist, while Excel’s data validation stops some errors at the moment of typing. Its Settings tab allows whole numbers, decimals, a list, dates, times, a text length or a custom formula, each with a condition.' },
    { table: {
      caption: 'Rules Ana sets on the columns of her manual-order sheet',
      head: ['Column', 'Allow', 'Condition'],
      rows: [
        ['channel', 'List', 'app, web (a drop-down, so “Web ” or “website” can’t be typed)'],
        ['quantity', 'Whole number', 'greater than or equal to 1'],
        ['discount', 'Decimal', 'greater than or equal to 0'],
        ['order_date', 'Date', 'between 1 July 2026 and 31 July 2026 for July’s sheet'],
      ],
    } },
    { p: 'An Input Message tab shows a hint when the cell is selected. The Error Alert tab chooses the response to a bad entry: Stop prevents it, Warning warns but lets the user keep it, and Information is the most lenient, letting the user accept or reject the value. Two limits matter. Microsoft notes that validation shows messages and blocks entries only when data are typed directly into a cell, so pasting or filling can bring invalid values in. And adding a rule to cells that already hold data doesn’t flag the bad ones; Data Validation › Circle Invalid Data marks them.' },

    { h: 'Remove Duplicates' },
    { p: 'Data › Remove Duplicates deletes rows that repeat values in the columns you tick. Microsoft lists its rules: it keeps the first occurrence and deletes the others; it compares what appears in the cells, not the underlying value; it removes whole rows even though only the ticked columns are compared; and the deletion is permanent apart from Undo. Work on a copy, and count before you delete: <x>=COUNTIF($A$2:$A$21,A2)</x> filled down counts each id’s occurrences (a <g>conditional aggregate</g>), so any count above 1 marks a repeated id.' },
    { p: 'Which columns to tick is a business decision, the one B02’s duplicates lesson calls the <g>business key</g>. Ticking every column removes only <g>exact duplicates</g>, such as order LC-10003, which appears twice in Lantern’s raw export with identical values. Ticking only order_id would also delete an updated version of an order, keeping whichever came first rather than the one that is right.' },

    { h: 'Cleaning Lantern’s raw export, step by step' },
    { p: `The first ${RAW.length} rows of B02’s raw export show the usual problems. Every price and total arrived as text, ${priceWithDollar} of the ${RAW.length} prices with a dollar sign; ${iso} dates are ISO 8601, ${written} is written out and ${slash} is a slash date; one email has a stray leading space and capitals; order LC-10003 appears twice; ${blankRatings} ratings are blank; and LC-10016’s total doesn’t equal quantity × price − discount.` },
    { table: {
      caption: 'The cleaning sheet: one formula per raw column (raw values in the columns named, row 2 shown)',
      head: ['Clean column', 'Problem in the raw data', 'Formula'],
      rows: [
        ['email', '“ Ivan.Zimmer@Example.Com”: leading space, capitals', '<x>=LOWER(TRIM(D2))</x>'],
        ['quantity, unit_price, discount, order_total', 'Numbers stored as text, some as “$58.00”', '<x>=VALUE(I2)</x> and so on'],
        ['order_date (ISO 8601 and written out)', '“2026-03-01”, “March 2, 2026”', '<x>=DATEVALUE(B2)</x>, then test it'],
        ['order_date (slash dates)', '“05/03/2026”: the web shop writes the day first', '<x>=DATE(RIGHT(B2,4),MID(B2,4,2),LEFT(B2,2))</x>'],
        ['duplicate flag', 'LC-10003 twice', '<x>=COUNTIF($A$2:$A$21,A2)>1</x>'],
        ['total check', 'LC-10016: $21.35 for one $16.50 bag less $1.65', '<x>=VALUE(K2)-(VALUE(H2)*VALUE(I2)-VALUE(J2))</x>'],
        ['rating', 'Blank: no rating given', 'Leave blank; never turn it into 0'],
      ],
    } },
    { p: 'TRIM removes every space except single spaces between words, but only the ordinary space character (code 32): the non-breaking space (code 160) that web pages use survives it, and needs <x>=TRIM(SUBSTITUTE(A2,CHAR(160)," "))</x>. CLEAN removes the non-printing control characters with codes 0 to 31. PROPER capitalises the first letter and every letter that follows a non-letter, and lowers the rest, so it turns “house blend 250g” into “House Blend 250G”: harmless for a lookup, which ignores case, but check its output before you publish it.' },
    { p: 'VALUE converts text that looks like a number, date or time in a format Excel recognises: <x>=VALUE("$1,000")</x> is 1000, and arithmetic such as <x>=I2*1</x> converts the same way. SUM does not: it skips text, as B02 showed. After converting, <x>=COUNT(L2:L21)</x> should equal the number of rows; any shortfall is a value that failed to convert and needs a look.' },
    { p: 'Dates need the most care. DATEVALUE converts date text to a serial number, and Microsoft warns that the computer’s system date setting can change its results, so the same text can give different dates on different machines. With US settings, “05/03/2026” becomes 3 May 2026, silently. B02 established that Lantern’s web shop writes the day first, so this order was placed on 5 March; <x>=DATE(RIGHT(B2,4),MID(B2,4,2),LEFT(B2,2))</x> builds the date from its parts in the order you decide, and gives the same answer everywhere. Use DATEVALUE only for unambiguous text (ISO dates, written-out months), and test a few results against the source.' },
    { p: 'Each step goes in the log, B02-style: what the column does, the rule, and the count it affected. For example: “unit_price: VALUE of the raw text; ' + RAW.length + ' of ' + RAW.length + ' converted.” “order_date: DATEVALUE for ISO and written dates (' + (iso + written) + ' rows), DATE from parts for day-first slash dates (' + slash + ' row).” “LC-10003: exact duplicate, second copy removed; ' + RAW.length + ' rows become ' + (RAW.length - 1) + '.” “LC-10016: total disagrees with its parts by ' + money(gap(RAW16)) + '; set to ' + money(clean16) + ', as B02 decided.”' },

    { h: 'Text to Columns, Flash Fill, Find and Replace and Power Query' },
    { table: {
      caption: 'Excel’s other cleaning tools',
      head: ['Tool', 'What it does', 'Watch out for', 'Rerun next month?'],
      rows: [
        ['Formulas in a cleaning sheet', 'Compute a clean column from each raw one', 'Long formulas need checking', 'Yes: paste new raw data'],
        ['Data › Text to Columns', 'Splits one column into several at a delimiter (comma, space…)', 'Overwrites the columns to its right; keep enough empty columns', 'No: repeat it by hand'],
        ['Data › Flash Fill (Ctrl+E; Control+E on a Mac)', 'Fills a column by following the pattern of examples you type', 'It infers the pattern from your examples, so check every result', 'No: repeat it by hand'],
        ['Find and Replace (Ctrl+H; Control+H on a Mac)', 'Replaces text in cells, one at a time or all at once', 'Replace All edits cells in place; use Match case and Match entire cell contents', 'No: repeat it by hand'],
        ['Power Query (Data › Get & Transform Data)', 'Imports data and records each transformation as a step', 'Learning a new editor', 'Yes: Refresh reruns every step'],
      ],
    } },
    { p: 'Power Query is the tool built for the monthly export. It connects to the data, transforms it, can combine it with other sources and loads the result to a worksheet, leaving the original source unchanged. Each transformation appears in the editor’s Applied Steps list, where steps can be renamed, deleted, edited or reordered, and when the query is refreshed each step runs again automatically: a cleaning log that executes itself. Microsoft states that it is available in every stand-alone version of Excel for Windows from Excel 2016, and on a Mac to Microsoft 365 subscribers. This lesson stays with formulas, which work everywhere and show their logic cell by cell; B07 SQL returns to the same steps as queries.' },

    { h: 'Dynamic arrays: UNIQUE, SORT, SORTBY and FILTER' },
    { p: 'The lookups lesson showed a formula that returns several values and <g>spills</g> them into neighbouring cells. Four <g>dynamic array functions</g> make that their job. Excel draws a border round the spill range while you select it, only the top-left cell can be edited, and the range grows or shrinks by itself when the source changes. Pointed at a table column, they keep up with the table.' },
    { table: {
      caption: 'Four functions that spill, on Lantern’s Orders table',
      head: ['Function', 'Example', 'Result'],
      rows: [
        ['UNIQUE(array, [by_col], [exactly_once])', '<x>=UNIQUE(Orders[region])</x>', 'The 5 regions, each once'],
        ['SORT(array, [sort_index], [sort_order], [by_col])', '<x>=SORT(UNIQUE(Orders[region]))</x>', 'The 5 regions from Central to West'],
        ['SORTBY(array, by_array1, [sort_order1], …)', '<x>=SORTBY(Orders[order_id],Orders[order_total],-1)</x>', `All ${D.orders} ids, largest order first (${D.bulk.id})`],
        ['FILTER(array, include, [if_empty])', '<x>=FILTER(Orders[order_id],Orders[order_total]>100,"none")</x>', `The ${ORDERS.filter((r) => r[oc('order_total')] > 100).length} orders over $100`],
      ],
    } },
    { p: 'FILTER’s include argument is a column of TRUE and FALSE values as tall as the array. Multiply conditions for AND and add them for OR: <x>=FILTER(Orders,(Orders[region]="Central")*(Orders[channel]="web"))</x> keeps Central’s web orders, all columns. If nothing qualifies and if_empty is left out, FILTER returns #CALC!, because Excel has no empty array. UNIQUE’s exactly_once set to TRUE keeps only values that occur once, and wrapping UNIQUE in ROWS counts the distinct values: <x>=ROWS(UNIQUE(Orders[customer_id]))</x> gives ' + new Set(ORDERS.map((r) => r[oc('customer_id')])).size + ' customers.' },
    { p: 'A spilled formula fails with #SPILL! when it can’t spill. The usual causes are these: the spill range isn’t empty (delete or move whatever is in the way), the formula is inside a table (spilled array formulas aren’t supported in tables, so put it beside the table), the result would run off the edge of the sheet, or it would spill into merged cells. To refer to a whole spill range, put # after its first cell: if D2 holds <x>=SORT(UNIQUE(Orders[region]))</x>, then <x>=COUNTA(D2#)</x> counts what it spilled, however many rows that becomes.' },
    { callout: 'standards', title: 'Which versions have dynamic arrays', html: 'UNIQUE, SORT, SORTBY and FILTER work in Excel for Microsoft 365, Excel 2024 and Excel 2021, on Windows and on Mac. The spilled range operator (#) is documented for Excel for Microsoft 365. In Excel 2019 and earlier these functions don’t exist: use filters and sorting instead, and to count distinct values either a helper column such as <x>=COUNTIF($C$2:C2,C2)=1</x> (TRUE at each value’s first appearance) counted with <x>=COUNTIF(D2:D232,TRUE)</x>, or a PivotTable’s Distinct Count.' },
  ],

  formulas: [
    { id: 'order-total-check', name: 'The order-total check (a cross-field rule)',
      tex: String.raw`\text{order\_total} = q \times p - d`,
      where: [
        [String.raw`q`, 'Quantity: the number of items in the order', 'items'],
        [String.raw`p`, 'Unit price: Lantern’s shop price per item', '$ per item'],
        [String.raw`d`, 'Discount on the whole order (10% for subscriptions, $5 for a promotion code)', '$'],
      ],
      assumptions: 'Delivery and tax are not part of order_total in Lantern’s export. A row where the two sides differ by more than a cent fails the check.',
      note: 'In a table, the calculated column <x>=[@order_total]-([@quantity]*[@unit_price]-[@discount])</x> applies the check to every row; B02 explains what to do with the rows that fail.' },
  ],

  examples: [
    { level: 'simple', title: 'A table, a calculated column and a filtered total', fictional: true,
      setup: 'Ana practises on the first eight spring orders: order_id, quantity, unit_price, discount, order_total and channel in A1:F9. Turn them into a table called Orders, add a column that checks each total, add a total row, and filter to the app channel. What do the check column and the total row show?',
      table: {
        caption: 'The eight orders as the table Orders, with the calculated column and the total row',
        head: ['', 'A: order_id', 'B: quantity', 'C: unit_price', 'D: discount', 'E: order_total', 'F: channel', 'G: check'],
        align: ['r', 'l', 'r', 'r', 'r', 'r', 'l', 'r'],
        rows: [
          ...EIGHT.map((r, i) => [String(i + 2), r[0], String(r[oc('quantity')]), money(r[oc('unit_price')]), money(r[oc('discount')]), money(r[oc('order_total')]), r[oc('channel')], i === 0 ? '<x>=[@order_total]-([@quantity]*[@unit_price]-[@discount])</x>' : '0']),
          ['10', 'Total', '', '', '', '<x>=SUBTOTAL(109,[order_total])</x>', '', ''],
        ],
      },
      steps: [
        'Click a cell in A1:F9, press Ctrl+T, confirm the headers, and rename the table Orders in Table Design › Table Name.',
        'Type <i>check</i> in G1: the table widens to column G. In G2 type <x>=[@order_total]-([@quantity]*[@unit_price]-[@discount])</x> (clicking the cells writes the references) and press Enter. Excel fills G2:G9 with the same formula, and every row shows 0: each total equals quantity × price − discount.',
        'Switch on Table Design › Total Row and choose Sum under order_total. Excel writes <x>=SUBTOTAL(109,[order_total])</x>, which shows ' + money(eightTotal) + '.',
        'Filter channel to app. ' + appCount + ' rows remain visible and the total row changes to ' + money(appTotal) + ' (' + EIGHT.filter((r) => r[oc('channel')] === 'app').map((r) => money(r[oc('order_total')])).join(' + ') + '), because SUBTOTAL leaves out rows hidden by a filter. A <x>=SUM(Orders[order_total])</x> outside the table still shows ' + money(eightTotal) + '.',
      ],
      answer: 'The check column is 0 in all eight rows. The total row shows ' + money(eightTotal) + ' unfiltered and ' + money(appTotal) + ' with the filter on app.',
      interpretation: 'The table now carries its own arithmetic check and a total that follows the filter, and both extend themselves when the next orders are pasted underneath. A check column of zeros is a result worth keeping: the day a row shows something else, the export has a problem.' },

    { level: 'challenging', title: 'Cleaning six rows of the raw export', fictional: true,
      setup: 'Six rows of B02’s raw export, as typed. Every value is text. Build the clean values with formulas, flag what needs a decision, and write the log entries.',
      table: {
        caption: 'Six raw rows in A1:G7 (text exactly as exported; row 1 holds the headings)',
        head: ['', 'A: order_id', 'B: order_date', 'C: quantity', 'D: unit_price', 'E: discount', 'F: order_total', 'G: channel'],
        rows: PICK.map((r, i) => [String(i + 2), r[0], `“${r[rc('order_date')]}”`, `“${r[rc('quantity')]}”`, `“${r[rc('unit_price')]}”`, `“${r[rc('discount')]}”`, `“${r[rc('order_total')]}”`, r[rc('channel')]]),
      },
      steps: [
        'Numbers: <x>=VALUE(…)</x> on quantity, unit_price, discount and order_total turns “$17.00” into 17, “14.00” into 14 and “$21.35” into 21.35. <x>=COUNT(…)</x> on each new column returns 6: nothing failed to convert.',
        'Dates: the ISO dates (“2026-03-02”, “2026-03-03”, “2026-03-09”) and the written-out “March 2, 2026” go through DATEVALUE. The web order’s “05/03/2026” does not: with US settings DATEVALUE would make it 3 May. Built with <x>=DATE(RIGHT(B5,4),MID(B5,4,2),LEFT(B5,2))</x> it is 5 March 2026, the day-first reading B02 established for the web shop.',
        'Duplicates: <x>=COUNTIF($A$2:$A$7,A2)</x> is 2 for both LC-10003 rows. Every field is identical, so this is an exact duplicate: keep the first, delete the second (Remove Duplicates with every column ticked does exactly that).',
        'Arithmetic: the check total − (quantity × price − discount) is 0 for every row except LC-10016: ' + money(num(RAW16[rc('order_total')])) + ' − (1 × ' + money(16.5) + ' − ' + money(1.65) + ') = ' + money(gap(RAW16)) + '. The parts agree with each other (a 10% subscription discount on one bag), so the total is the odd one out; B02 set it to ' + money(clean16) + '.',
        'Log the four decisions with their counts: 6 values converted per numeric column; 1 slash date read day first; 1 exact duplicate removed (6 rows become 5); 1 total corrected.',
      ],
      answer: 'Five clean rows: dates 2, 2, 3, 5 and 9 March 2026; all prices and totals numeric; LC-10003 once; LC-10016’s total ' + money(clean16) + ' instead of ' + money(num(RAW16[rc('order_total')])) + '. Four log entries record what changed and why.',
      interpretation: 'Each problem needed a different tool, and two of them, the slash date and the wrong total, needed a decision that no function can make. Formulas do the routine conversions repeatably; the log records the judgements, so the same choices are made next month and anyone can check them.' },

    { level: 'applied', title: 'Who is overloaded in the workshop?', fictional: true,
      setup: 'Spokewise Cycles, a fictional bike shop, keeps its repair jobs in a table called Jobs: job, mechanic, status, due (a date) and estimated hours. The manager wants each mechanic’s open jobs, soonest first, and to know whether anyone has more open work due by 10 July than the ' + CAPACITY + ' workshop hours they have before then.',
      table: {
        caption: 'The Jobs table (fictional; the due column holds dates, shown as day and month)',
        head: ['job', 'mechanic', 'status', 'due', 'hours'],
        align: ['l', 'l', 'l', 'l', 'r'],
        rows: JOBS.map((j) => [j[0], j[1], j[2], j[3], j[4].toFixed(1)]),
      },
      steps: [
        'Protect the status column first: data validation with a List of open, waiting for parts, done. Without it, a status typed as “open ” with a trailing space, or as “in progress”, would drop out of every filter on “open”.',
        'For one mechanic’s open jobs, soonest first: <x>=SORT(FILTER(Jobs,(Jobs[mechanic]="Luis")*(Jobs[status]="open")),4)</x>, placed beside the table (a spilled formula can’t go inside it). Multiplying the two conditions means both must hold. It spills Luis’s ' + openJobs('Luis') + ' open jobs: J-301, J-303, J-307 and J-309.',
        'Hours per mechanic: <x>=SUM(FILTER(Jobs[hours],(Jobs[mechanic]="Luis")*(Jobs[status]="open")))</x> gives ' + openHours('Luis').toFixed(1) + ' hours; for Dana ' + openHours('Dana').toFixed(1) + ' and for Mei ' + openHours('Mei').toFixed(1) + '. (<x>=SUMIFS(Jobs[hours],Jobs[mechanic],"Luis",Jobs[status],"open")</x> gives the same.)',
        'Compare with capacity: Luis has ' + openHours('Luis').toFixed(1) + ' hours of open work against ' + CAPACITY + ' available; moving J-309 (2.0 hours, due 10 July) to Mei leaves him ' + (openHours('Luis') - 2).toFixed(1) + ' and gives her ' + (openHours('Mei') + 2).toFixed(1) + '.',
      ],
      answer: 'Luis is overloaded by ' + (openHours('Luis') - CAPACITY).toFixed(1) + ' hours; reassigning J-309 to Mei brings everyone within ' + CAPACITY + ' hours.',
      interpretation: 'Because Jobs is a table and the formulas use FILTER on its columns, tomorrow’s new jobs appear in each mechanic’s list without anyone editing a formula. The validation rule matters as much as the formulas: a filter is only as reliable as the consistency of the values it tests.' },
  ],

  demo: [
    { widget: 'tc-table', intro: 'The first twelve spring orders as the table Orders. Type a formula with structured references in H2 (try <x>=[@quantity]*[@unit_price]-[@discount]</x>) and use Fill down; then read the formulas in J2:J4 with Show formulas.' },
    { widget: 'tc-clean', intro: 'The first 17 rows of the raw export, exactly as typed, with the cleaning formulas filled in beside them. Use Show formulas to read them, then find the three problems the checks flag: a day-first slash date, an id that occurs twice and a total that doesn’t add up. Change a raw price and watch the clean columns follow.' },
    { widget: 'tc-arrays', intro: 'UNIQUE, SORT and FILTER on twenty orders. One formula in K2 can’t spill because a note is in its way: delete the note in K4 and watch it spill. Change the threshold in M1 to see FILTER resize.' },
  ],

  mistakes: [
    { title: '“A table is just formatting.”', html: 'The banded rows are the least of it. A table has a name, grows when rows are added, fills calculated columns and lets formulas say <code>Orders[order_total]</code> instead of a range that has to be stretched by hand. Ranges that stop short are one of the commonest causes of a wrong total.' },
    { title: '“The total row and SUM give the same total.”', html: 'Only when no filter is on. The total row uses SUBTOTAL, which leaves out rows hidden by a filter; SUM counts every row. Decide which the reader needs and label it.' },
    { title: '“Data validation keeps the column clean.”', html: 'It blocks bad values typed into a cell, not values pasted or filled in, and it doesn’t flag data that were already there. Use Circle Invalid Data after adding a rule, and keep checking imported data with formulas.' },
    { title: '“DATEVALUE converts the dates.”', html: 'It converts them using the computer’s date settings, so a day-first slash date such as 05/03/2026 becomes 3 May on a US-settings machine without any error. Build ambiguous dates with DATE from their parts, in the order the source used.' },
    { title: '“I’ll fix the export in place; it’s quicker.”', html: 'Edits typed over the raw data can’t be checked, repeated or undone next month. Keep the raw sheet untouched, clean with formulas or Power Query steps, and log each step.' },
    { title: '“#SPILL! means the formula is wrong.”', html: 'It usually means the formula is fine but has nowhere to put its results: something sits in the spill range, or the formula is inside a table. Clear the range or move the formula beside the table.' },
  ],

  application: [
    { p: '<b>Lantern’s monthly refresh.</b> Ana’s workbook now has three sheets: Raw (the export pasted as text), Clean (formulas pointing at Raw, with check and flag columns), and the Orders table, which she updates from Clean with Paste Values. Her month-end routine is short: paste, read the flags, record decisions in the log, paste values, refresh. Totals and PivotTables built on <code>Orders</code> pick up the new rows because the table grows.' },
    { p: '<b>A charity’s donation file.</b> Greenway Community Pantry, a fictional food bank, receives a donations file from its payment provider every week. Its volunteer treasurer built a Power Query that removes test transactions, splits the donor name, converts amounts and dates with the locale stated, and loads a table. Each week she clicks Refresh; the Applied Steps list doubles as the documentation the trustees ask for.' },
    { p: '<b>A sign-up sheet that stays tidy.</b> A gym that takes class bookings in a shared workbook uses a table with data validation lists for class and time, so a FILTER beside it can list tomorrow’s attendees for each instructor. When bookings are pasted in from the website, the manager runs Circle Invalid Data, because pasted values skip validation.' },
    { p: '<b>Spokewise’s workshop.</b> The bike shop’s job board in the applied example is the same pattern on operational data: a validated table, FILTER and SORT beside it, and a capacity check that tells the manager who needs help before customers are kept waiting.' },
  ],

  summary: [
    'An Excel table (Ctrl+T) has a name, grows with its data, and lets formulas use structured references such as Orders[order_total] and [@quantity].',
    'A calculated column fills one formula down the whole table, including rows added later; the total row uses SUBTOTAL, which leaves out rows hidden by a filter.',
    'Sorting rearranges and filtering hides; data validation guards typed entries but not pasted ones; Remove Duplicates keeps the first occurrence and deletes the rest permanently.',
    'Clean with formulas pointing at an untouched raw sheet: TRIM, CLEAN and PROPER for text, VALUE for numbers, DATE from parts for ambiguous dates, and check columns for duplicates and arithmetic.',
    'DATEVALUE follows the computer’s date settings, so day-first slash dates can be misread silently; decide the order and build the date.',
    'Power Query records each step and reruns them all on Refresh; Text to Columns, Flash Fill and Find and Replace change cells once.',
    'UNIQUE, SORT, SORTBY and FILTER spill their results (Microsoft 365, 2021, 2024); #SPILL! means the spill range is blocked or the formula is inside a table.',
  ],

  glossary: [
    { term: 'Excel table', def: 'A range that Excel manages as one named object, with a header row, filter buttons and columns that formulas can refer to by name; it grows when rows or columns are added next to it.' },
    { term: 'Structured reference', def: 'A reference to part of an Excel table by its table and column names, such as Orders[order_total], or [@quantity] for the value in the formula’s own row.' },
    { term: 'Calculated column', def: 'A column of an Excel table filled by one formula, which Excel copies to every row, including rows added later.' },
    { term: 'Total row', def: 'An optional last row of an Excel table that summarises its columns, by default with SUBTOTAL so that rows hidden by a filter are left out.' },
    { term: 'Data validation', def: 'An Excel feature that restricts what can be typed into cells (a list, a range of numbers or dates, a text length or a formula) and shows an input message or an error alert.' },
    { term: 'Dynamic array function', def: 'A function, such as FILTER, SORT, SORTBY or UNIQUE, that returns several values which spill into the neighbouring cells; available in Excel for Microsoft 365, Excel 2021 and Excel 2024.' },
    { term: 'Power Query', def: 'Excel’s tool for importing and reshaping data (Data › Get & Transform Data), which records each transformation as a step and reruns all of them when the query is refreshed.' },
  ],

  references: [
    { text: 'Microsoft Support. <i>Using structured references with Excel tables</i>.', url: 'https://support.microsoft.com/en-us/excel/using-structured-references-with-excel-tables', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>SUBTOTAL function</i>.', url: 'https://support.microsoft.com/en-us/excel/subtotal-function', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>More on data validation</i>.', url: 'https://support.microsoft.com/en-US/Excel/more-on-data-validation', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>Filter for unique values or remove duplicate values</i>.', url: 'https://support.microsoft.com/en-US/excel/get-started/filter-for-unique-values-or-remove-duplicate-values', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>DATEVALUE function</i>.', url: 'https://support.microsoft.com/office/datevalue-function-df8b07d4-7761-4a93-bc33-b7471bbff252', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>Power Query data sources in Excel versions</i>.', url: 'https://support.microsoft.com/office/power-query-data-sources-in-excel-versions-e9332067-8e49-46fc-97ff-f2e1bfa0cb16', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>Dynamic array formulas and spilled array behavior</i>.', url: 'https://support.microsoft.com/excel/dynamic-array-formulas-and-spilled-array-behavior', checked: '2026-10-23' },
  ],

  checks: [
    // the idea
    { what: 'Orders in the workbook', value: D.orders, shown: 231 },
    { what: 'Last row of the range (header + 231)', value: D.orders + 1, shown: 232 },
    { what: 'Table names up to', value: 255, shown: 255 },
    // the raw export
    { what: 'Raw rows', value: RAW.length, shown: 20 },
    { what: 'Prices with a dollar sign', value: priceWithDollar, shown: 13 },
    { what: 'ISO dates', value: iso, shown: 18 },
    { what: 'Written-out dates', value: written, shown: 1 },
    { what: 'Slash dates', value: slash, shown: 1 },
    { what: 'Blank ratings', value: blankRatings, shown: 6 },
    { what: 'LC-10003 occurrences', value: idCount('LC-10003'), shown: 2 },
    { what: 'Rows failing the total check', value: mismatch.length, shown: 1 },
    { what: 'ISO + written dates', value: iso + written, shown: 19 },
    { what: 'Rows after removing the duplicate', value: RAW.length - 1, shown: 19 },
    { what: 'LC-10016 raw total', value: num(RAW16[rc('order_total')]), shown: 21.35 },
    { what: 'LC-10016 gap', value: gap(RAW16), shown: 6.5 },
    { what: 'LC-10016 clean total', value: clean16, shown: 14.85 },
    { what: 'LC-10016 = 1 × 16.50 − 1.65', value: 1 * 16.5 - 1.65, shown: 14.85 },
    { what: 'VALUE("$1,000")', value: num('$1,000'), shown: 1000 },
    // dynamic arrays
    { what: 'Regions', value: new Set(ORDERS.map((r) => r[oc('region')])).size, shown: 5 },
    { what: 'Orders over $100', value: ORDERS.filter((r) => r[oc('order_total')] > 100).length, shown: 6 },
    { what: 'Largest order is LC-10144', value: Number(D.bulk.id.slice(3)), shown: 10144 },
    { what: 'Distinct customers', value: new Set(ORDERS.map((r) => r[oc('customer_id')])).size, shown: 112 },
    // simple example
    { what: 'Simple: eight orders total', value: eightTotal, shown: 369.7 },
    { what: 'Simple: app orders total', value: appTotal, shown: 210.7 },
    { what: 'Simple: app orders', value: appCount, shown: 5 },
    // challenging example
    { what: 'Challenging: six rows', value: PICK.length, shown: 6 },
    { what: 'Challenging: rows after the duplicate', value: PICK.length - 1, shown: 5 },
    { what: 'Challenging: LC-10016 gap', value: gap(PICK[5]), shown: 6.5 },
    { what: 'Challenging: other rows agree', value: PICK.slice(0, 5).filter((r) => gap(r) !== 0).length, shown: 0 },
    // applied example
    { what: 'Applied: Luis open jobs', value: openJobs('Luis'), shown: 4 },
    { what: 'Applied: Luis open hours', value: openHours('Luis'), shown: 9.5 },
    { what: 'Applied: Dana open hours', value: openHours('Dana'), shown: 4 },
    { what: 'Applied: Mei open hours', value: openHours('Mei'), shown: 1 },
    { what: 'Applied: capacity', value: CAPACITY, shown: 8 },
    { what: 'Applied: Luis after the move', value: openHours('Luis') - 2, shown: 7.5 },
    { what: 'Applied: Mei after the move', value: openHours('Mei') + 2, shown: 3 },
    { what: 'Applied: overload', value: openHours('Luis') - CAPACITY, shown: 1.5 },
    // validation dates and codes
    { what: 'Non-breaking space code', value: 160, shown: 160 },
    { what: 'Ordinary space code', value: ' '.charCodeAt(0), shown: 32 },
    { what: 'CLEAN removes codes up to', value: 31, shown: 31 },
  ],
};
