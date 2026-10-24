// pivot-tables.ex.js — B03 · PivotTables: widgets, practice and the knowledge check (answer keys live here). Lantern's
// orders and events come from case.js; no margin figures (they belong to the project). Every num item's `check`
// recomputes its answer from the case data; every formula item is marked on the sheet and on changed copies.
import { ORDERS, ORDER_COLUMNS, EVENTS, EVENT_COLUMNS, orderRecords, eventRecords, ordersCells, eventsCells } from './case.js?v=12';
import { isoToSerial } from '../../../core/sheet.js?v=12';

const MONEY = '$#,##0.00';
const oc = (name) => ORDER_COLUMNS.indexOf(name);
const ec = (name) => EVENT_COLUMNS.indexOf(name);
const sum = (a) => a.reduce((s, x) => s + x, 0);
const r2 = (x) => Math.round(x * 100) / 100;
const merge = (...parts) => Object.assign({}, ...parts.map((p) => p.cells || p));
const MONTHS = ['Mar', 'Apr', 'May', 'Jun'];
const monthOf = (d) => MONTHS[Number(d.slice(5, 7)) - 3];
const n = (f) => ORDERS.filter(f).length;
const v = (f) => r2(sum(ORDERS.filter(f).map((r) => r[oc('order_total')])));
const is = (col, val) => (r) => r[oc(col)] === val;
const both = (f, g) => (r) => f(r) && g(r);

// ---------------------------------------------------------------- widgets
export const widgets = {
  'pv-orders': {
    type: 'pivot', title: 'Lantern’s spring orders (231 orders, March to June 2026)',
    records: orderRecords(),
    fields: ['Month', 'Region', 'Channel', 'Product', 'Subscription'],
    values: ['Order value', 'Orders', 'Quantity'],
    defaults: { rows: 'Month', cols: 'Channel', value: 'Order value', agg: 'sum', show: 'value' },
    order: { Month: MONTHS },
    formats: { 'Order value': MONEY, Quantity: '#,##0', Orders: '#,##0' },
    note: 'Orders is 1 for every order, so its Sum counts orders. Check the grand total of Order value before reading anything else: it should be $9,096.15.',
  },
  'pv-events': {
    type: 'pivot', title: 'Lantern’s catering events in 2026 (76 events)',
    records: eventRecords(),
    fields: ['Month', 'Type', 'Client', 'Pastries'],
    values: ['Invoice', 'Events', 'Guests'],
    defaults: { rows: 'Month', value: 'Invoice', agg: 'sum', show: 'value' },
    order: { Month: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
    formats: { Invoice: MONEY, Guests: '#,##0', Events: '#,##0' },
    note: 'Events is 1 for every event, so its Sum counts events. The grand total of Invoice is $62,320.00, the figure in Lantern’s books.',
  },
};

// ---------------------------------------------------------------- guided practice
const subApp = n(both(is('channel', 'app'), is('subscription', 'yes'))), subWeb = n(both(is('channel', 'web'), is('subscription', 'yes')));
const offApp = n(both(is('channel', 'app'), is('subscription', 'no'))), offWeb = n(both(is('channel', 'web'), is('subscription', 'no')));
const g3o = ordersCells({ cols: ['order_id', 'region', 'channel', 'order_total'], n: 30 });
const REGIONS = ['Central', 'East', 'North', 'South', 'West'];
const g3 = merge(g3o, { F2: 'region', G2: 'app', H2: 'web' });
REGIONS.forEach((g, i) => { g3[`F${i + 3}`] = g; });
const TYPES = ['Breakfast', 'Conference', 'Launch', 'Meeting', 'Team day'];
const evV = (t) => sum(EVENTS.filter((r) => r[ec('event_type')] === t).map((r) => r[ec('invoice')]));
const evAll = sum(EVENTS.map((r) => r[ec('invoice')]));
const evN = (t) => EVENTS.filter((r) => r[ec('event_type')] === t).length;

export const guided = [
  {
    id: 'b03-pv-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Ana wants a PivotTable of order value with regions down the side and months across the top, counting subscription orders only. Where does each field go?',
    items: ['region', 'order_date, grouped by Months', 'order_total', 'subscription', 'product'],
    categories: ['Rows', 'Columns', 'Values', 'Filters', 'Not needed'],
    answer: [0, 1, 2, 3, 4],
    hints: ['Down the side is Rows; across the top is Columns.', 'A field that only decides which records count, without appearing as a row or column, is a filter.'],
    feedback: {
      2: 'order_total is what is added up, so it goes in Values (as Sum).',
      3: 'Subscription = yes limits the records; it goes in Filters (or a slicer), not in the layout.',
      4: 'Product isn’t part of the question; adding it would split every cell by product.',
    },
    solution: 'region in Rows, order_date (grouped by Months) in Columns, order_total in Values as a Sum, subscription in Filters set to yes. Product isn’t needed.',
  },
  {
    id: 'b03-pv-g2', type: 'steps', kind: 'numerical',
    prompt: `A PivotTable counts Lantern’s spring orders with channel in Rows and subscription in Columns: app ${subApp} yes and ${offApp} no (${subApp + offApp} in all); web ${subWeb} yes and ${offWeb} no (${subWeb + offWeb}); subscription yes ${subApp + subWeb} in all, no ${offApp + offWeb}, grand total ${ORDERS.length}.`,
    solution: `% of Row Total divides by the channel’s total: app yes ${subApp} ÷ ${subApp + offApp} = ${(subApp / (subApp + offApp) * 100).toFixed(1)}%, web yes ${subWeb} ÷ ${subWeb + offWeb} = ${(subWeb / (subWeb + offWeb) * 100).toFixed(1)}%. % of Column Total divides by the subscription column’s total: app yes ${subApp} ÷ ${subApp + subWeb} = ${(subApp / (subApp + subWeb) * 100).toFixed(1)}%. Whether app customers are more likely to subscribe is a question about each channel’s orders, so % of Row Total answers it: ${(subApp / (subApp + offApp) * 100).toFixed(1)}% against ${(subWeb / (subWeb + offWeb) * 100).toFixed(1)}%.`,
    steps: [
      { id: 'b03-pv-g2-s1', type: 'num',
        prompt: 'Shown as % of Row Total, what does the app / yes cell show? Give a percentage to one decimal place.',
        answer: r2(subApp / (subApp + offApp) * 1000) / 10, check: () => subApp / (subApp + offApp) * 100, unit: '%', places: 1, tol: 0.06,
        hints: ['% of Row Total divides each cell by the total of its row.', `The app row’s total is ${subApp + offApp}.`],
        wrong: [{ value: r2(subApp / (subApp + subWeb) * 1000) / 10, say: 'You divided by the yes column’s total. % of Row Total divides by the row’s (the app channel’s) total.' }, { value: r2(subApp / ORDERS.length * 1000) / 10, say: 'That is % of Grand Total: divided by all 231 orders.' }] },
      { id: 'b03-pv-g2-s2', type: 'num',
        prompt: 'Shown as % of Column Total, what does the same cell show? One decimal place.',
        answer: r2(subApp / (subApp + subWeb) * 1000) / 10, check: () => subApp / (subApp + subWeb) * 100, unit: '%', places: 1, tol: 0.06,
        hints: ['% of Column Total divides each cell by the total of its column.', `The yes column’s total is ${subApp + subWeb}.`],
        wrong: [{ value: r2(subApp / (subApp + offApp) * 1000) / 10, say: 'That is the row percentage. Divide by the yes column’s total instead.' }] },
      { id: 'b03-pv-g2-s3', type: 'mc',
        prompt: 'Ana asks: “Are app customers more likely to subscribe than web customers?” Which display answers that question?',
        options: ['% of Row Total, comparing the yes share within each channel', '% of Column Total, comparing the app and web shares of subscriptions', '% of Grand Total, comparing the four cells with each other', 'The counts themselves, since the app has more subscription orders than the web shop'],
        answer: 0,
        hints: ['“More likely” is a rate within each channel.', 'Which total is the base: each channel’s orders, or each subscription status’s orders?'],
        feedback: {
          1: 'That tells you which channel most subscription orders come through, partly because of how big each channel is. It doesn’t compare the subscription rate of the two channels.',
          2: 'Shares of the grand total mix the size of each channel with its subscription rate.',
          3: 'Counts depend on how many orders each channel has; the web shop has more orders overall, so compare rates, not counts.',
        } },
    ],
  },
  {
    id: 'b03-pv-g3', type: 'formula', kind: 'applied',
    prompt: 'A1:D31 holds the first 30 spring orders. Build the PivotTable’s body by formula: in G3, sum order_total for the region in F3 and the channel in G2, written so that it can be filled across and down to H7.',
    sheet: { cells: g3 }, cell: 'G3', fill: 'G3:H7', answer: '=SUMIFS($D$2:$D$31,$B$2:$B$31,$F3,$C$2:$C$31,G$2)',
    view: 'A1:H31', formats: { D: MONEY, G: MONEY, H: MONEY }, widths: { F: 10, G: 11, H: 11 }, maxHeight: '24rem',
    alt: ['=SUMPRODUCT(($B$2:$B$31=$F3)*($C$2:$C$31=G$2)*$D$2:$D$31)', '=SUMIFS($D$2:$D$31,$C$2:$C$31,G$2,$B$2:$B$31,$F3)'],
    wrong: [
      { formula: '=SUMIFS(D2:D31,B2:B31,F3,C2:C31,G2)', say: 'Parts without $ move as you fill: unanchored data ranges slide (filled to H7 they read rows 6 to 35), and unanchored criteria drift to G3, H2 and on. Lock the data ranges, the region column ($F3) and the channel row (G$2).' },
      { formula: '=SUMIFS($D$2:$D$31,$B$2:$B$31,$F$3,$C$2:$C$31,$G$2)', say: 'Locking both criteria fully gives every cell Central’s app value. The region needs a fixed column only ($F3), the channel a fixed row F3 and G$2.' },
    ],
    hints: ['Each cell needs two criteria: the region from column F and the channel from row 2.', 'Mixed references: <x>$F3</x> keeps column F when filled across; <x>G$2</x> keeps row 2 when filled down. <x>=SUMIFS($D$2:$D$31,$B$2:$B$31,$F3,$C$2:$C$31,G$2)</x>'],
    solution: '<x>=SUMIFS($D$2:$D$31,$B$2:$B$31,$F3,$C$2:$C$31,G$2)</x>, filled to H7. This is the PivotTable with region in Rows, channel in Columns and Sum of order_total, built by hand. One difference: South has no web orders among these 30, so H6 shows $0.00 where a PivotTable would leave the cell blank.',
  },
  {
    id: 'b03-pv-g4', type: 'num', kind: 'numerical',
    prompt: `A PivotTable of Lantern’s 2026 catering events has event type in Rows and Sum of invoice in Values: ${TYPES.map((t) => `${t} $${evV(t).toLocaleString('en-US')}`).join(', ')}; grand total $${evAll.toLocaleString('en-US')}. Shown as % of Grand Total, what does the Breakfast row show? One decimal place.`,
    answer: r2(evV('Breakfast') / evAll * 1000) / 10, check: () => evV('Breakfast') / evAll * 100, unit: '%', places: 1, tol: 0.06,
    hints: ['% of Grand Total divides each value by the grand total.', `${evV('Breakfast').toLocaleString('en-US')} ÷ ${evAll.toLocaleString('en-US')}.`],
    wrong: [{ value: r2(evN('Breakfast') / EVENTS.length * 1000) / 10, say: `That is the share of events (${evN('Breakfast')} of ${EVENTS.length}), not of invoice value. The Values field here is the sum of invoices.` }],
    solution: `$${evV('Breakfast').toLocaleString('en-US')} ÷ $${evAll.toLocaleString('en-US')} = ${(evV('Breakfast') / evAll * 100).toFixed(1)}%. Breakfasts were ${evN('Breakfast')} of the ${EVENTS.length} events (${(evN('Breakfast') / EVENTS.length * 100).toFixed(1)}%) but brought in a larger share of the value, because their average invoice, $${(evV('Breakfast') / evN('Breakfast')).toFixed(2)}, is above the overall average of $${(evAll / EVENTS.length).toFixed(2)}.`,
  },
];

// ---------------------------------------------------------------- on your own
const i1 = { A1: 'month', B1: 'app', C1: 'web', A6: 'Total', B6: '=SUM(B2:B5)', C6: '=SUM(C2:C5)', E1: 'app %', F1: 'web %' };
MONTHS.forEach((m, i) => { i1[`A${i + 2}`] = m; i1[`B${i + 2}`] = v(both((r) => monthOf(r[oc('order_date')]) === m, is('channel', 'app'))); i1[`C${i + 2}`] = v(both((r) => monthOf(r[oc('order_date')]) === m, is('channel', 'web'))); });
const subN = n(is('subscription', 'yes')), subV = v(is('subscription', 'yes')), offN = n(is('subscription', 'no')), offV = v(is('subscription', 'no'));
const customers = new Set(ORDERS.map((r) => r[oc('customer_id')])).size;
const EVERY3 = ORDERS.filter((_, i) => i % 3 === 0);
const i6o = { A1: 'order_id', B1: 'order_date', C1: 'order_total', E1: 'May order value' };
EVERY3.forEach((r, i) => { const k = i + 2; i6o[`A${k}`] = r[0]; i6o[`B${k}`] = isoToSerial(r[oc('order_date')]); i6o[`C${k}`] = r[oc('order_total')]; });
const last6 = EVERY3.length + 1;
const mayEvery3 = r2(sum(EVERY3.filter((r) => r[oc('order_date')].slice(5, 7) === '05').map((r) => r[oc('order_total')])));

export const independent = [
  {
    id: 'b03-pv-i1', type: 'formula', kind: 'applied',
    prompt: 'A1:C6 shows order value by month and channel, with column totals in row 6. In E2, show the app’s March value as a share of the app’s spring total (what a PivotTable would call % of Column Total), written so that it fills across to F2 and down to F5.',
    sheet: { cells: i1 }, cell: 'E2', fill: 'E2:F5', answer: '=B2/B$6',
    view: 'A1:F6', formats: { B: MONEY, C: MONEY, E: '0.0%', F: '0.0%' }, widths: { B: 11, C: 11 },
    alt: ['=B2/SUM(B$2:B$5)'],
    wrong: [
      { formula: '=B2/B6', say: 'Without $ the total’s row moves as you fill down: E3 divides by B7, an empty cell, and shows #DIV/0!. Lock the row: B$6.' },
      { formula: '=B2/$B$6', say: 'Locking the column too means the web column is divided by the app total. Lock only the row: B$6.' },
      { formula: '=B2/($B$6+$C$6)', say: 'That divides by the grand total, % of Grand Total. The question asks for each month’s share of its channel’s total.' },
    ],
    solution: '<x>=B2/B$6</x>, filled to F5. B$6 keeps row 6 when the formula is filled down and lets the column move from B to C when it is filled across. Each column then adds up to 100%: March was ' + (i1.B2 / sum([i1.B2, i1.B3, i1.B4, i1.B5]) * 100).toFixed(1) + '% of the app’s spring value.',
  },
  {
    id: 'b03-pv-i2', type: 'num', kind: 'numerical',
    prompt: `A PivotTable with subscription in Rows shows Count of order_id and Sum of order_total: yes ${subN} orders, $${subV.toLocaleString('en-US', { minimumFractionDigits: 2 })}; no ${offN} orders, $${offV.toLocaleString('en-US', { minimumFractionDigits: 2 })}. What is the average order value of subscription orders, to the cent?`,
    answer: r2(subV / subN), check: () => subV / subN, unit: '$', places: 2, tol: 0.006,
    wrong: [
      { value: r2(offV / offN), say: 'That is the one-off orders’ average. Subscription orders are the yes row.' },
      { value: r2(subV / ORDERS.length), say: 'You divided by all 231 orders. Average order value divides the subscription orders’ value by the number of subscription orders.' },
    ],
    solution: `$${subV.toLocaleString('en-US', { minimumFractionDigits: 2 })} ÷ ${subN} = $${(subV / subN).toFixed(2)}. Setting a second copy of order_total to Average would show the same. Subscription orders are smaller (one-off orders average $${(offV / offN).toFixed(2)}), partly because the one-off group includes the $1,512.00 office order.`,
  },
  {
    id: 'b03-pv-i3', type: 'mc', kind: 'applied',
    prompt: 'Ana’s PivotTable was built in June on the range A1:M180 of her order sheet. She pastes the rest of June’s orders into rows 181 to 232 and clicks Refresh, but the grand total doesn’t change. Why, and what is the lasting fix?',
    options: [
      'Its source stops at row 180: make the data a table and use Change Data Source to point at it',
      'Refresh takes effect only after the workbook is saved, closed and opened again, so reopen it',
      'PivotTables can’t take in new rows, so she must build a new PivotTable every month',
      'New rows are filtered out by default until the filter on order_date is cleared',
    ],
    answer: 0,
    feedback: {
      1: 'Refresh rereads the source range at once; reopening adds nothing, because the range still ends at row 180.',
      2: 'They can, as long as the new rows are inside the source. A table grows to include pasted rows, so the PivotTable sees them at the next refresh.',
      3: 'There is no such default. A filter would show in the Filters area or on a label button.',
    },
    solution: 'Refresh rereads the source, but the source is A1:M180, so rows 181 to 232 are outside it. Make the data an Excel table and use Change Data Source to point the PivotTable at the table: from then on, rows added to the table are included at every refresh.',
  },
  {
    id: 'b03-pv-i4', type: 'multi', kind: 'conceptual',
    prompt: 'In which situations are SUMIFS and COUNTIFS formulas a better choice than a PivotTable? Select all that apply.',
    options: [
      'A monthly report must list all five regions, showing $0.00 for a region with no orders that month.',
      'The figures must update the moment a value in the source is corrected, without anyone clicking Refresh.',
      'A one-page dashboard needs the figures in a fixed layout with its own labels and formatting.',
      'An analyst wants to try ten different breakdowns of the orders in the next quarter of an hour.',
      'New product names will appear in the data and should show up in the summary without editing it.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Quick exploration is what a PivotTable is for: drag a field and the next breakdown appears.',
      4: 'A PivotTable picks up new categories at the next refresh; formulas need a new row added by hand.',
    },
    solution: 'Formulas suit fixed reports: they can show categories with no records as 0, update instantly, and sit in any layout. A PivotTable suits exploration and summaries whose categories change, because it rebuilds itself at each refresh.',
  },
  {
    id: 'b03-pv-i5', type: 'num', kind: 'numerical',
    prompt: `A PivotTable built with “Add this data to the Data Model” shows Count of order_id ${ORDERS.length} and Distinct Count of customer_id ${customers} for the spring. On average, how many orders did each customer place? Two decimal places.`,
    answer: r2(ORDERS.length / customers), check: () => ORDERS.length / customers, unit: 'orders', places: 2, tol: 0.006,
    wrong: [{ value: r2(customers / ORDERS.length), say: 'That is customers per order. Divide the orders by the customers.' }, { value: 1, say: 'Count of customer_id without the Data Model counts orders, which would give 231 ÷ 231. Distinct Count counts each customer once.' }],
    solution: `${ORDERS.length} orders ÷ ${customers} customers = ${(ORDERS.length / customers).toFixed(2)} orders per customer. Without the Data Model, Count of customer_id would show ${ORDERS.length} (it counts non-empty values), and the repeat buying would disappear.`,
  },
  {
    id: 'b03-pv-i6', type: 'formula', kind: 'applied',
    prompt: `A1:C${last6} holds every third spring order (77 orders). A PivotTable grouped by month shows a value for May. In E2, calculate the same figure with SUMIFS and a date window, so that you can reconcile it.`,
    sheet: { cells: i6o, fixed: [`B2:B${last6}`] }, cell: 'E2', answer: `=SUMIFS(C2:C${last6},B2:B${last6},">="&DATE(2026,5,1),B2:B${last6},"<"&DATE(2026,6,1))`,
    view: `A1:E${last6}`, formats: { B: 'date', C: MONEY, E: MONEY }, widths: { B: 12, E: 16 }, maxHeight: '24rem',
    alt: [`=SUMIFS(C2:C${last6},B2:B${last6},">="&DATE(2026,5,1),B2:B${last6},"<="&DATE(2026,5,31))`, `=SUMIFS(C2:C${last6},B2:B${last6},">=5/1/2026",B2:B${last6},"<6/1/2026")`, `=SUMPRODUCT((MONTH(B2:B${last6})=5)*C2:C${last6})`],
    wrong: [
      { formula: `=SUMIFS(C2:C${last6},B2:B${last6},">="&DATE(2026,5,1))`, say: 'That includes June too. Add the upper end of the window: before 1 June.' },
      { formula: `=SUMIFS(C2:C${last6},B2:B${last6},">="&DATE(2026,5,1),B2:B${last6},"<="&DATE(2026,6,1))`, say: 'An order placed on 1 June would be included. Use <x>"<"&DATE(2026,6,1)</x>, or <x>"<="&DATE(2026,5,31)</x>.' },
      { formula: `=SUMIFS(C2:C${last6},B2:B${last6},">=DATE(2026,5,1)",B2:B${last6},"<DATE(2026,6,1)")`, say: 'Inside quotes, <x>DATE(2026,5,1)</x> is just text, not a date. Join the operator to the date with &: <x>">="&DATE(2026,5,1)</x>.' },
    ],
    solution: `<x>=SUMIFS(C2:C${last6},B2:B${last6},">="&DATE(2026,5,1),B2:B${last6},"<"&DATE(2026,6,1))</x> returns $${mayEvery3.toFixed(2)}, which should equal the PivotTable’s May cell. A window from the first of the month up to, but not including, the first of the next month catches every May date and nothing else.`,
  },
];

// ---------------------------------------------------------------- knowledge check
const conf = EVENTS.filter((r) => r[ec('event_type')] === 'Conference');
const confYes = conf.filter((r) => r[ec('pastries')] === 'yes').length;
const k3 = merge(eventsCells({ cols: ['event_id', 'event_type', 'pastries', 'invoice'], n: EVENTS.length }), { F1: 'meetings with pastries' });
const meetPastry = sum(EVENTS.filter((r) => r[ec('event_type')] === 'Meeting' && r[ec('pastries')] === 'yes').map((r) => r[ec('invoice')]));

export const check = [
  {
    id: 'b03-pv-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Ana corrects a mistyped order total in the Orders table, from $1,140.00 to $114.00. Her PivotTable on that table still shows the old figure in its grand total. What is happening?',
    options: [
      'The PivotTable summarises its cache, a copy of the data, which is updated only when she refreshes',
      'The PivotTable reads only the first version of each order and ignores later edits',
      'The correction broke the table, so the PivotTable is now reading an empty range',
      'PivotTables round their totals to the nearest hundred until the grand total is recalculated with F9',
    ],
    answer: 0,
    feedback: {
      1: 'A refresh reads every row as it is now; there is no notion of a first version.',
      2: 'Editing a value inside a table doesn’t change the table’s range.',
      3: 'PivotTables don’t round like that, and F9 recalculates formulas, not PivotTables.',
    },
    solution: 'A PivotTable summarises its pivot cache, not the cells directly. After a change to the source, right-click and Refresh (Alt+F5) or use Refresh All; then the grand total drops by $1,026.00.',
  },
  {
    id: 'b03-pv-k2', type: 'num', kind: 'numerical',
    prompt: `A PivotTable of Lantern’s events has type in Rows, pastries (yes/no) in Columns and Count of event_id, shown as % of Row Total. Lantern ran ${conf.length} conferences, ${confYes} of them with pastries. What does the Conference / yes cell show? One decimal place.`,
    answer: r2(confYes / conf.length * 1000) / 10, check: () => confYes / conf.length * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [{ value: r2(confYes / EVENTS.filter((r) => r[ec('pastries')] === 'yes').length * 1000) / 10, say: 'You divided by all events with pastries: that is % of Column Total. % of Row Total divides by the conference row’s total.' }, { value: r2(confYes / EVENTS.length * 1000) / 10, say: 'That is % of Grand Total, divided by all 76 events.' }],
    solution: `% of Row Total divides by the row’s total, the ${conf.length} conferences: ${confYes} ÷ ${conf.length} = ${(confYes / conf.length * 100).toFixed(1)}% of conferences included pastries.`,
  },
  {
    id: 'b03-pv-k3', type: 'formula', kind: 'applied',
    prompt: 'A1:D77 lists Lantern’s 76 catering events of 2026. A PivotTable with event_type in Rows, pastries in Columns and Sum of invoice shows a figure for Meeting / yes. In F2, reproduce that figure with a formula so you can check it.',
    sheet: { cells: k3 }, cell: 'F2', answer: '=SUMIFS(D2:D77,B2:B77,"Meeting",C2:C77,"yes")',
    view: 'A1:F77', formats: { D: MONEY, F: MONEY }, widths: { B: 12, F: 22 }, maxHeight: '24rem',
    alt: ['=SUMIFS($D$2:$D$77,$B$2:$B$77,"Meeting",$C$2:$C$77,"yes")', '=SUMPRODUCT((B2:B77="Meeting")*(C2:C77="yes")*D2:D77)', '=SUMIFS(D:D,B:B,"Meeting",C:C,"yes")'],
    wrong: [
      { formula: '=SUMIF(B2:B77,"Meeting",D2:D77)', say: 'That is every meeting, with or without pastries. The cell needs both conditions: SUMIFS with type and pastries.' },
      { formula: '=COUNTIFS(B2:B77,"Meeting",C2:C77,"yes")', say: 'That counts the meetings with pastries. The PivotTable cell sums their invoices.' },
    ],
    solution: `<x>=SUMIFS(D2:D77,B2:B77,"Meeting",C2:C77,"yes")</x> returns $${meetPastry.toLocaleString('en-US', { minimumFractionDigits: 2 })}, the Meeting / yes cell. If the two disagree, look for a stale cache, a filter, or a source range that stops short.`,
  },
  {
    id: 'b03-pv-k4', type: 'classify', kind: 'conceptual',
    prompt: 'The PivotTable has region in Rows, months in Columns and Sum of order_total. Which Show Values As option answers each question?',
    items: [
      'What share of the whole spring’s order value came from the North in April?',
      'What share of May’s order value came from each region?',
      'How was the North’s spring order value spread across the four months?',
      'By how many dollars did each month’s value differ from the month before?',
    ],
    categories: ['% of Grand Total', '% of Column Total', '% of Row Total', 'Difference From (previous month)'],
    answer: [0, 1, 2, 3],
    feedback: {
      1: 'May is a column here, so a share of May’s total is % of Column Total.',
      2: 'The North is a row, so a share of the North’s total is % of Row Total.',
      3: 'Difference From, with the base item set to the previous month, shows each month minus the one before.',
    },
    solution: 'A share of everything: % of Grand Total. A share of a month (a column): % of Column Total. A share of a region (a row): % of Row Total. A change from the previous month: Difference From with the previous item as the base.',
  },
  {
    id: 'b03-pv-k5', type: 'mc', kind: 'conceptual',
    prompt: 'A colleague’s PivotTable shows “Count of order_total” where she expected a Sum, and changing it to Sum gives a total far too small. What is the most likely cause?',
    options: [
      'The totals are stored as text, so Count is the default and Sum treats the text as 0',
      'PivotTables use Count for any field whose name ends in “total”, to avoid double counting',
      'The PivotTable is built on an Excel table, and a table’s columns can only be counted',
      'The order totals contain cents, and PivotTables can only sum whole numbers',
    ],
    answer: 0,
    feedback: {
      1: 'Field names don’t matter; the values do. Microsoft’s rule is that blanks or non-numeric values in the field make Count the default.',
      2: 'Tables are the recommended source, and their numeric columns sum normally.',
      3: 'PivotTables sum decimals like any other numbers.',
    },
    solution: 'If a field contains blanks or non-numeric values (text, dates or Booleans) when it is placed in Values, the PivotTable uses Count; after switching to Sum, those values count as 0. Convert the text totals with VALUE in the source, refresh, and the Sum is right.',
  },
  {
    id: 'b03-pv-k6', type: 'multi', kind: 'applied',
    prompt: 'A regional manager sends a sheet to summarise with a PivotTable. Select all the problems to fix in the source before building it.',
    options: [
      'Row 1 says “Spring sales” in a merged cell and the real headings are in row 2',
      'Each month’s sales are in its own column (Mar, Apr, May, Jun) instead of in rows',
      'A “Subtotal North” row sits after the North’s records',
      'Some amounts were typed as text, such as “$45.00”',
      'The rows are sorted by date rather than grouped together by region',
      'The data are formatted as an Excel table with banded rows and filter buttons',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'Order doesn’t matter: the PivotTable groups the records itself.',
      5: 'A table is the recommended source: it grows with the data.',
    },
    solution: 'Fix: a single header row of unique labels (remove the title row); records in rows, so reshape the month columns into rows of month and amount; delete the subtotal row, which would be counted twice; convert text amounts to numbers. Sort order is irrelevant, and an Excel table is the best source.',
  },
];
