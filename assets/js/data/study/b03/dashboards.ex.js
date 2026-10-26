// dashboards.ex.js — B03 · Dashboards: widgets, practice and the knowledge check (answer keys live here).
// Built from EVENTS (case.js): Lantern's 2026 catering. Ana's monthly revenue plan (PLAN) is fictional and introduced in
// this lesson; the lesson file imports it for its checks. The shop dashboard belongs to the project and is not used.
// Every num item's `check` recomputes its answer.
import { EVENTS, EVENT_COLUMNS, tableCells, eventRecords } from './case.js?v=16';

/** Ana's 2026 catering revenue plan by month (fictional): $60,000 from March to December. */
export const MONTHS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const PLAN = [3000, 4000, 4500, 5000, 5000, 4000, 6500, 8000, 9000, 11000];
const ev = (n) => EVENTS.map((r) => r[EVENT_COLUMNS.indexOf(n)]);
const dates = ev('event_date'), inv = ev('invoice'), types = ev('event_type'), clients = ev('client');
/** Revenue and events by month, March (index 0) to December (index 9). */
export const BY_MONTH = MONTHS.map((_, i) => {
  const mm = String(i + 3).padStart(2, '0');
  const idx = dates.map((d, k) => (d.slice(5, 7) === mm ? k : -1)).filter((k) => k >= 0);
  return { revenue: idx.reduce((t, k) => t + inv[k], 0), events: idx.length };
});
const sum = (a) => a.reduce((t, x) => t + x, 0);
const total = sum(inv);
const byClient = {}; clients.forEach((c, k) => { byClient[c] = (byClient[c] || 0) + inv[k]; });
const ranked = Object.values(byClient).sort((a, b) => b - a);

// Q4 events as a sheet: dates in A, client in B, type in C, invoice in D (A1:D35)
const Q4 = EVENTS.filter((r) => r[1] >= '2026-10-01');
const q4 = tableCells(EVENT_COLUMNS, Q4, { cols: ['event_date', 'client', 'event_type', 'invoice'] });
const serial = (iso) => (Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) - Date.UTC(1899, 11, 30)) / 86400000;
const Q4F = { A: 'date', D: '$#,##0', F: '$#,##0.00' };
const W = { A: 12, B: 22, C: 11, D: 9, E: 24 };
const inMonth = (iso, mm) => iso.slice(5, 7) === mm;

export const widgets = {
  'db-month': {
    type: 'chart', kind: 'bar', title: 'Catering revenue by month against Ana’s plan, 2026',
    x: { label: 'Month', values: MONTHS },
    series: [{ name: 'Revenue', values: BY_MONTH.map((m) => m.revenue) }, { name: 'Plan (fictional)', values: PLAN }],
    y: { label: 'Dollars', format: 'money' },
    note: 'Revenue beat the plan in March, April, September and October and fell short in the other six months; December was the biggest month and still $880 below its plan. Over the year revenue was $62,320 against a plan of $60,000. On a dashboard the plan would be a marker or a thin line, so that the bars stay the main message.',
  },
  'db-pivot': {
    type: 'pivot', title: 'Lantern’s 2026 catering events',
    records: eventRecords(), fields: ['Type', 'Month', 'Client', 'Pastries'], values: ['Invoice', 'Events', 'Guests'],
    defaults: { rows: 'Type', value: 'Invoice', agg: 'sum' },
    order: { Month: MONTHS }, formats: { Invoice: '$#,##0', Guests: '#,##0' },
    note: 'This is the PivotTable behind the dashboard’s “revenue by type” chart. Use the Filter like a slicer (Month = Dec, say) and watch every number change. Put Client in Rows and sort by eye to find the top clients; switch Summarise to Average to see why the conference average needs a footnote.',
  },
  'db-sheet': {
    type: 'sheet', title: 'One month of the catering dashboard, October to December 2026',
    sheet: { cells: {
      ...q4.cells,
      E1: 'Month (drop-down)', F1: 12,
      E2: 'Month', F2: '=DATE(2026,F1,1)',
      E3: 'Revenue', F3: '=SUMIFS($D$2:$D$35,$A$2:$A$35,">="&F2,$A$2:$A$35,"<="&EOMONTH(F2,0))',
      E4: 'Events', F4: '=COUNTIFS($A$2:$A$35,">="&F2,$A$2:$A$35,"<="&EOMONTH(F2,0))',
      E5: 'Average invoice', F5: '=F3/F4',
      E6: 'Plan', F6: '=XLOOKUP(F2,G2:G4,H2:H4)',
      E7: 'Revenue less plan', F7: '=F3-F6',
      E8: 'Share of plan', F8: '=F3/F6',
      E9: 'Largest invoice', F9: '=MAXIFS($D$2:$D$35,$A$2:$A$35,">="&F2,$A$2:$A$35,"<="&EOMONTH(F2,0))',
      E10: 'Check: months add up to the data', F10: '=IF(ROUND(SUM(H7:H9)-SUM(D2:D35),2)=0,"OK","CHECK")',
      G1: 'Plan month', H1: 'Plan',
      G2: serial('2026-10-01'), H2: PLAN[7], G3: serial('2026-11-01'), H3: PLAN[8], G4: serial('2026-12-01'), H4: PLAN[9],
      G6: 'Month', H6: 'Revenue',
      ...Object.fromEntries([7, 8, 9].flatMap((r, i) => [[`G${r}`, serial(`2026-${10 + i}-01`)], [`H${r}`, `=SUMIFS($D$2:$D$35,$A$2:$A$35,">="&G${r},$A$2:$A$35,"<="&EOMONTH(G${r},0))`]])),
    } },
    view: 'A1:H35', maxHeight: '26rem', widths: { ...W, F: 11, G: 11, H: 9 },
    formats: { A: 'date', D: '$#,##0', F2: 'mmm yyyy', F3: '$#,##0', F5: '$#,##0.00', F6: '$#,##0', F7: '$#,##0', F8: '0.0%', F9: '$#,##0', G: 'mmm yyyy', H: '$#,##0' },
    editable: false, mark: ['F3:F9'], tools: ['formulas', 'reset'],
    controls: [{ cell: 'F1', label: 'Month', options: [[10, 'October'], [11, 'November'], [12, 'December']] }],
    note: 'Pick a month from the drop-down: it sets F1, as a data validation list would in Excel, and every figure follows because each formula reads the month from F2. Show formulas to see the date window: on or after the first of the month and on or before its last day, EOMONTH(F2,0). F10 is a reconciliation check: the three monthly revenues in H7:H9 must add up to the events in column D.',
  },
};

export const guided = [
  {
    id: 'b03-db-g1', type: 'formula', kind: 'applied',
    prompt: 'The dashboard’s month is in F1 (1 November 2026, the first day of the month). In F2, write the formula for that month’s catering revenue from the events in A2:D35. It must still work when F1 is changed to another month.',
    sheet: { cells: { ...q4.cells, E1: 'Month (first day)', F1: serial('2026-11-01'), E2: 'Revenue' } },
    cell: 'F2', view: 'A1:F35', maxHeight: '22rem', widths: W, formats: { ...Q4F, F1: 'mmm yyyy' },
    answer: '=SUMIFS(D2:D35,A2:A35,">="&F1,A2:A35,"<="&EOMONTH(F1,0))',
    alt: ['=SUMIFS(D2:D35,A2:A35,">="&F1,A2:A35,"<"&EDATE(F1,1))', '=SUMPRODUCT((MONTH(A2:A35)=MONTH(F1))*D2:D35)'],
    wrong: [
      { formula: '=SUMIFS(D2:D35,A2:A35,">="&F1)', say: 'That adds November and every later event, December included. A month needs two criteria on the date: on or after the first, and on or before EOMONTH(F1,0).' },
      { formula: '=SUMIFS(D2:D35,A2:A35,">=F1",A2:A35,"<=EOMONTH(F1,0)")', say: 'Inside quotes, F1 is just the letters F and 1, so nothing matches. Join the operator to the cell with &: ">="&F1.' },
      { formula: '=SUM(D2:D35)', say: 'That is the whole quarter. Pick out the month with SUMIFS and a date window.' },
    ],
    hints: ['Use SUMIFS with the invoices as the sum range and two criteria on the dates in A2:A35.', 'The criteria are ">="&F1 and "<="&EOMONTH(F1,0).'],
    solution: '<x>=SUMIFS(D2:D35,A2:A35,">="&F1,A2:A35,"<="&EOMONTH(F1,0))</x> gives $8,790 for November’s 11 events. EOMONTH(F1,0) is the last day of F1’s month, so the window is the whole month whatever date F1 holds, and the formula follows when the reader picks another month.',
  },
  {
    id: 'b03-db-g2', type: 'formula', kind: 'applied',
    prompt: 'F2 now holds the month’s revenue and F3 its number of events. In F4, write a formula for the month’s average invoice.',
    sheet: { cells: { ...q4.cells, E1: 'Month (first day)', F1: serial('2026-11-01'),
      E2: 'Revenue', F2: '=SUMIFS(D2:D35,A2:A35,">="&F1,A2:A35,"<="&EOMONTH(F1,0))',
      E3: 'Events', F3: '=COUNTIFS(A2:A35,">="&F1,A2:A35,"<="&EOMONTH(F1,0))', E4: 'Average invoice' },
      fixed: ['A2:A35'], vary: { F1: [serial('2026-10-01'), serial('2026-12-01')] } },
    cell: 'F4', view: 'A1:F35', maxHeight: '22rem', widths: W, formats: { ...Q4F, F1: 'mmm yyyy', F3: '0' },
    answer: '=AVERAGEIFS(D2:D35,A2:A35,">="&F1,A2:A35,"<="&EOMONTH(F1,0))',
    alt: ['=F2/F3'],
    wrong: [
      { formula: '=AVERAGE(D2:D35)', say: 'That averages all three months. The tile is for the selected month only.' },
      { formula: '=F2/11', say: 'Right for November only: a typed count won’t follow the month. Divide by F3.' },
      { formula: '=F2/34', say: '34 is the number of events in the whole quarter, and a typed number won’t follow the month. Divide by the month’s count in F3.' },
    ],
    hints: ['An average is a total divided by a count, and both are already on the sheet.', 'Either =F2/F3, or AVERAGEIFS with the same two date criteria as F2.'],
    solution: '<x>=F2/F3</x> or <x>=AVERAGEIFS(D2:D35,A2:A35,">="&F1,A2:A35,"<="&EOMONTH(F1,0))</x>: $8,790 ÷ 11 = $799.09 for November. Dividing the month’s total by its count keeps the tile consistent with the revenue and events tiles beside it.',
  },
  {
    id: 'b03-db-g3', type: 'classify', kind: 'conceptual',
    prompt: 'Choose the display for each question on Ana’s catering dashboard.',
    items: [
      'How does this month’s revenue compare with its plan?',
      'How has revenue moved month by month since March?',
      'Which of the five event types brings in the most revenue this year?',
      'Who are the top five clients, with their revenue and number of events?',
      'Is this month’s average invoice up or down on last month’s?',
    ],
    categories: ['A single number with its comparison', 'Line or column chart over time', 'Sorted bar chart', 'Small table'],
    answer: [0, 1, 2, 3, 0],
    feedback: {
      1: 'A trend over ten months is a time series: months along the horizontal axis.',
      2: 'Comparing five categories by size: bars sorted from largest to smallest are easier to compare than slices of a pie.',
      3: 'Two values for each of five named clients read best as a small table.',
    },
    hints: ['Is the question about one number, a change over time, a ranking of categories, or a few items with several values each?', 'Single-number questions get a tile with a comparison; time gets a line or columns; categories get sorted bars; a few items with details get a table.'],
    solution: 'One number against a plan or last month: a tile showing the value and its comparison. A trend over months: a line or column chart. Five categories ranked: a sorted bar chart. Five clients with two values each: a small table. Choosing the display from the question, not from what looks impressive, is the charts lesson’s rule applied to a whole page.',
  },
  {
    id: 'b03-db-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Lantern started catering in March 2026, so at the end of the year there is no “same month last year”. Which comparison gives December’s revenue tile of $10,120 the most meaning?',
    options: [
      'December’s plan ($11,000), with November’s revenue ($8,790) as a second comparison.',
      'The average monthly revenue of other caterers in the city.',
      'December’s revenue on its own, in large type, so that nothing distracts from it.',
      'A gauge showing $10,120 on a dial from $0 to $20,000.',
    ],
    answer: 0,
    feedback: {
      1: 'Other caterers’ figures are rarely available, and when they are, they are defined differently. A business’s own plan and its own recent past are the usual comparisons.',
      2: 'A number on its own invites the question “compared to what?”. Is $10,120 good? Without a plan or last month nobody can tell.',
      3: 'A dial adds no comparison of its own: $0 and $20,000 are arbitrary ends. It takes space and still doesn’t say whether $10,120 is good.',
    },
    hints: ['What would Ana need to know to judge whether $10,120 is good?', 'The plan says what was expected; last month says which way things are moving.'],
    solution: 'A dashboard number needs a comparison: the target or plan, the previous period, or the same period last year (a <i>baseline</i>, in B01’s word). With no history from last year, December is best judged against its plan ($880 short, 92.0%) and November (up $1,330, 15.1%). Together they say: the best month so far, but behind the plan.',
  },
];

export const independent = [
  {
    id: 'b03-db-i1', type: 'formula', kind: 'applied',
    prompt: 'Revenue by month is in A2:B11; Ana’s plan is in C2:D11, listed newest month first. The dashboard compares two months, chosen in F1 and G1. In F2, write a formula for the share of plan achieved in the month in F1, so that filling it right to G2 gives the same for the month in G1.',
    sheet: { cells: {
      A1: 'Month', B1: 'Revenue', C1: 'Plan month', D1: 'Plan', E1: 'Month', E2: 'Share of plan',
      ...Object.fromEntries(MONTHS.flatMap((_, i) => [[`A${i + 2}`, serial(`2026-${String(i + 3).padStart(2, '0')}-01`)], [`B${i + 2}`, BY_MONTH[i].revenue]])),
      ...Object.fromEntries(MONTHS.flatMap((_, i) => [[`C${i + 2}`, serial(`2026-${String(12 - i).padStart(2, '0')}-01`)], [`D${i + 2}`, PLAN[9 - i]]])),
      F1: serial('2026-09-01'), G1: serial('2026-12-01'),
    } },
    cell: 'F2', fill: 'F2:G2', view: 'A1:G11', widths: { A: 10, B: 10, C: 11, D: 9, E: 13, F: 10, G: 10 },
    formats: { A: 'mmm yyyy', B: '$#,##0', C: 'mmm yyyy', D: '$#,##0', F1: 'mmm yyyy', G1: 'mmm yyyy', F2: '0.0%', G2: '0.0%' },
    answer: '=XLOOKUP(F1,$A$2:$A$11,$B$2:$B$11)/XLOOKUP(F1,$C$2:$C$11,$D$2:$D$11)',
    alt: ['=INDEX($B$2:$B$11,MATCH(F1,$A$2:$A$11,0))/INDEX($D$2:$D$11,MATCH(F1,$C$2:$C$11,0))', '=VLOOKUP(F1,$A$2:$B$11,2,FALSE)/VLOOKUP(F1,$C$2:$D$11,2,FALSE)', '=SUMIFS($B$2:$B$11,$A$2:$A$11,F1)/SUMIFS($D$2:$D$11,$C$2:$C$11,F1)'],
    wrong: [
      { formula: '=VLOOKUP(F1,$A$2:$B$11,2)/VLOOKUP(F1,$C$2:$D$11,2)', say: 'Without FALSE, VLOOKUP does an approximate match, which needs the first column sorted in ascending order. The plan table is newest first, so the plan lookup returns the wrong month. Use an exact match.' },
      { formula: '=XLOOKUP(F1,A2:A11,B2:B11)/XLOOKUP(F1,C2:C11,D2:D11)', say: 'F2 is right, but filled right the lookup ranges move to columns B to E. Anchor the tables with $ and leave F1 relative.' },
      { formula: '=XLOOKUP(F1,$C$2:$C$11,$D$2:$D$11)/XLOOKUP(F1,$A$2:$A$11,$B$2:$B$11)', say: 'That is plan ÷ revenue. Share of plan is revenue ÷ plan.' },
      { formula: '=B8/D5', say: 'Right for September only, and filled right it points at the wrong cells. Look each figure up by the month in row 1, so the tile follows the reader’s choice.' },
    ],
    solution: '<x>=XLOOKUP(F1,$A$2:$A$11,$B$2:$B$11)/XLOOKUP(F1,$C$2:$C$11,$D$2:$D$11)</x>: September’s $7,650 ÷ $6,500 = 117.7% of plan, and December’s $10,120 ÷ $11,000 = 92.0%. Each table is looked up by exact match, so the order of the plan table doesn’t matter, and the tables are anchored so the formula can be filled. Approximate VLOOKUP on a table sorted newest first is the classic way to get a plausible, wrong answer.',
  },
  {
    id: 'b03-db-i2', type: 'formula', kind: 'applied',
    prompt: 'Someone pasted the quarter’s monthly totals into G2:G4 as values. In G6, write a reconciliation check: the pasted totals minus the total of the events in D2:D35. (Zero means they agree.)',
    sheet: { cells: { ...q4.cells, F1: 'Month', G1: 'Pasted total', F2: 'October', G2: 8990, F3: 'November', G3: 8790, F4: 'December', G4: 10210, F6: 'Pasted less data' } },
    cell: 'G6', view: 'A1:G35', maxHeight: '22rem', widths: { ...W, E: 3, F: 16, G: 12 }, formats: { A: 'date', D: '$#,##0', G: '$#,##0' },
    answer: '=SUM(G2:G4)-SUM(D2:D35)',
    alt: ['=G2+G3+G4-SUM(D2:D35)', '=-(SUM(D2:D35)-SUM(G2:G4))'],
    wrong: [
      { formula: '=SUM(D2:D35)-SUM(G2:G4)', say: 'That is data minus pasted, the opposite sign to the one asked for. Agree a sign convention and keep to it, so a positive difference always means the same thing.' },
      { formula: '=SUM(G2:G4)', say: 'That is the pasted total on its own. A check compares it with the source: subtract the total of D2:D35.' },
    ],
    solution: '<x>=SUM(G2:G4)-SUM(D2:D35)</x> gives $90: the pasted totals come to $27,990 against $27,900 in the data. Checking month by month finds it: December was pasted as $10,210, the true $10,120 with two digits swapped. A check cell like this, next to every hand-made figure, catches the error before a reader does.',
  },
  {
    id: 'b03-db-i3', type: 'num', kind: 'numerical',
    prompt: 'Lantern’s four largest catering clients in 2026 by revenue were Meridian Partners ($9,000), Harbor Tech ($8,130), Orchard Row Clinic ($6,210) and Pier Nine Studio ($6,080). Total catering revenue was $62,320. What share of revenue came from the top four? Give a percentage to one decimal place.',
    answer: 47.2, check: () => sum(ranked.slice(0, 4)) / total * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 14.4, say: 'That is Meridian Partners alone. Add the four clients’ revenue first.' },
      { value: 22.2, say: 'That is 4 of the 18 clients, a share of clients. The question asks for a share of revenue.' },
    ],
    solution: '(9,000 + 8,130 + 6,210 + 6,080) ÷ 62,320 = 29,420 ÷ 62,320 = 47.2%. Four of 18 clients bring in almost half the revenue; Meridian’s $9,000 includes the $4,200 two-day conference, which may not recur.',
  },
  {
    id: 'b03-db-i4', type: 'multi', kind: 'applied',
    prompt: 'The manager of a 60-room seaside hotel (fictional) drafts a weekly dashboard: a bar chart of nightly room revenue whose axis starts at $4,000; occupancy of 81% shown on its own; one chart with two vertical axes, rooms sold on the left and the average rate on the right; an average rate shown as $142.37 while every other tile shows whole dollars; a 3-D pie of revenue by room type; and a speedometer for occupancy. Select all the changes that would improve it.',
    options: [
      'Start the revenue bars at $0, so that their lengths compare honestly.',
      'Show occupancy beside its budget and the same week last year.',
      'Replace the two-axis chart with two aligned charts that share the nights along the bottom.',
      'Show the average rate in whole dollars, like the other tiles.',
      'Give the 3-D pie a stronger tilt, so that the small room types stand out more.',
      'Add a red zone below 70% to the occupancy speedometer.',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: '3-D tilts make slices at the front look bigger than equal slices at the back. Use sorted bars, or a flat pie with very few slices.',
      5: 'The speedometer still spends a large area on one number, and a red zone relies on colour. Show the number with its budget and last year’s figure, and say “below budget” in words.',
    },
    solution: 'The first four fix real faults: bars cut off at $4,000 exaggerate differences; a number needs a comparison; two vertical axes invite readers to compare lines whose scales were chosen arbitrarily; and a lone figure to the cent breaks the page’s consistency. The last two decorate a weak display instead of replacing it.',
  },
  {
    id: 'b03-db-i5', type: 'order', kind: 'conceptual',
    prompt: 'Ana has two PivotTables built from her Events table, one of revenue by month and one of revenue by type. Put the steps for making one slicer filter both in order.',
    items: [
      'Click inside the first PivotTable.',
      'On the Insert tab select Slicer, tick Client and select OK.',
      'Select the slicer, then choose Report Connections on the Slicer tab.',
      'Tick the second PivotTable (built on the same data source) and select OK.',
      'Click a client in the slicer and check that both PivotTables change.',
    ],
    solution: 'Insert the slicer from one PivotTable, then connect it to the other through Report Connections. A slicer can be connected only to PivotTables that share the same data source, which is one more reason to build every PivotTable on one table of events. Clear Filter shows all the items again.',
  },
  {
    id: 'b03-db-i6', type: 'mc', kind: 'conceptual',
    prompt: 'Ana’s events are in an Excel table with a slicer on event type. The dashboard’s revenue tile is a SUMIFS on the table’s invoice column for the selected month. She clicks Breakfast in the slicer. What happens to the tile?',
    options: [
      'Nothing: SUMIFS still adds every matching row, including the rows the slicer hides.',
      'It changes to breakfast revenue only, because SUMIFS skips any rows that a filter hides.',
      'It shows #N/A until the slicer is cleared, because the criteria range is filtered.',
      'It shows zero, because SUMIFS can’t read a table while a slicer is filtering it.',
    ],
    answer: 0,
    feedback: {
      1: 'SUMIFS knows nothing about filters. SUBTOTAL (and the table’s total row, which uses it) is the function that ignores rows a filter hides.',
      2: 'A filter doesn’t make formulas fail; they carry on adding the rows they match.',
      3: 'The filtered rows are still there: SUMIFS adds them as before.',
    },
    solution: 'A slicer on a table filters its rows, and SUBTOTAL ignores rows a filter excludes, but SUMIFS, COUNTIFS and the rest add every matching row, hidden or not. Decide how readers will interact: either a drop-down cell that the formulas read (so add the type as a criterion), or PivotTables that the slicers control. Mixing the two silently gives tiles that disagree with the charts.',
  },
];

export const check = [
  {
    id: 'b03-db-k1', type: 'formula', kind: 'applied',
    prompt: 'The dashboard compares two choices side by side: a month in row 1 and an event type in row 2 of columns F and G. In F3, write the formula for the revenue of the type in F2 in the month in F1, so that filling it right to G3 does the same for column G.',
    sheet: { cells: { ...q4.cells, E1: 'Month (first day)', F1: serial('2026-11-01'), G1: serial('2026-12-01'), E2: 'Event type', F2: 'Launch', G2: 'Breakfast', E3: 'Revenue' } },
    cell: 'F3', fill: 'F3:G3', view: 'A1:G35', maxHeight: '22rem', widths: { ...W, F: 11, G: 11 }, formats: { ...Q4F, F1: 'mmm yyyy', G1: 'mmm yyyy', G: '$#,##0.00' },
    answer: '=SUMIFS($D$2:$D$35,$C$2:$C$35,F2,$A$2:$A$35,">="&F1,$A$2:$A$35,"<="&EOMONTH(F1,0))',
    alt: ['=SUMIFS($D$2:$D$35,$A$2:$A$35,">="&F1,$A$2:$A$35,"<="&EOMONTH(F1,0),$C$2:$C$35,F2)'],
    wrong: [
      { formula: '=SUMIFS(D2:D35,C2:C35,F2,A2:A35,">="&F1,A2:A35,"<="&EOMONTH(F1,0))', say: 'F3 is right, but filled right the data ranges move to columns B to E. Anchor them with $ and leave F1 and F2 relative.' },
      { formula: '=SUMIF($C$2:$C$35,F2,$D$2:$D$35)', say: 'That is the type’s revenue for the whole quarter. Add the two date criteria for the month.' },
      { formula: '=SUMIFS($D$2:$D$35,$C$2:$C$35,"F2",$A$2:$A$35,">="&F1,$A$2:$A$35,"<="&EOMONTH(F1,0))', say: 'In quotes, <x>"F2"</x> is the text F2, not the cell. Give the criterion as F2 without quotes.' },
      { formula: '=SUMIFS($D$2:$D$35,$C$2:$C$35,"Launch",$A$2:$A$35,">="&F1,$A$2:$A$35,"<="&EOMONTH(F1,0))', say: 'Right for launches only: the type is typed into the formula, so column G still shows launches. Refer to the cell in row 2.' },
      { formula: '=COUNTIFS($C$2:$C$35,F2,$A$2:$A$35,">="&F1,$A$2:$A$35,"<="&EOMONTH(F1,0))', say: 'COUNTIFS counts the events; the tile shows revenue. Use SUMIFS with the invoices as the sum range.' },
    ],
    solution: '<x>=SUMIFS($D$2:$D$35,$C$2:$C$35,F2,$A$2:$A$35,">="&F1,$A$2:$A$35,"<="&EOMONTH(F1,0))</x>: November’s four launches came to $3,160 and December’s three breakfasts to $2,420. Every criterion reads a cell the reader can change, and the data ranges are anchored, so the same formula serves every month and type.',
  },
  {
    id: 'b03-db-k2', type: 'mc', kind: 'conceptual',
    prompt: 'A draft dashboard shows the year’s average invoice as the average of the ten monthly average invoices: $872.23. Total revenue was $62,320 from 76 events. Why is $872.23 the wrong figure?',
    options: [
      'March’s 3 events, one of them the $4,200 conference, weigh as much as December’s 13.',
      'Nothing is wrong: an average of averages always equals the overall average invoice.',
      'It should use the median of the monthly averages, which outliers never affect at all.',
      'It counts the two-day conference twice, once for each of the two days it ran.',
    ],
    answer: 0,
    feedback: {
      1: 'Only when every month has the same number of events. Here they range from 3 to 13.',
      2: 'A median of monthly figures still weights small and large months equally. The fix is to divide total revenue by total events.',
      3: 'The conference is one event in the data. The issue is the weighting of months.',
    },
    solution: 'An average of averages weights each month equally, whatever its number of events. March, with 3 events and an average of $1,866.67, counts as much as December’s 13. The year’s average invoice is total revenue ÷ total events = $62,320 ÷ 76 = $820. Compute rates and averages from totals, not by averaging them.',
  },
  {
    id: 'b03-db-k3', type: 'num', kind: 'numerical',
    prompt: 'December’s catering revenue was $10,120 against a plan of $11,000. What share of plan was achieved? Give a percentage to one decimal place.',
    answer: 92, check: () => BY_MONTH[9].revenue / PLAN[9] * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 108.7, say: 'That is plan ÷ revenue. Share of plan is revenue ÷ plan.' },
      { value: -8, say: 'That is the shortfall as a percentage of plan (92.0% − 100%). The question asks for the share achieved.' },
      { value: 115.1, say: 'That compares December with November, not with its plan.' },
    ],
    solution: '10,120 ÷ 11,000 = 92.0% of plan, a gap of −$880. The tile should show both, with a word (“below plan”) as well as any colour.',
  },
  {
    id: 'b03-db-k4', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the steps that make an Excel dashboard more accessible.',
    options: [
      'Add alt text to each chart that states what it shows and its main message.',
      'Give each worksheet a short, descriptive name and remove blank sheets.',
      'Mark results above or below plan with words or symbols as well as colour.',
      'Merge cells so that titles sit neatly across the tiles.',
      'Run Review › Check Accessibility before sharing the file.',
      'Use pale grey text on white so that the numbers look less crowded.',
    ],
    answer: [0, 1, 2, 4],
    feedback: {
      3: 'Merged and split cells make a sheet harder to navigate with a screen reader. Put each title in a single cell instead.',
      5: 'Low contrast makes text hard to read for many people. Keep a high contrast between text and background.',
    },
    solution: 'Alt text, descriptive sheet names, meaning that doesn’t rest on colour alone, and the Accessibility Checker all help. Merged cells and low-contrast text make the page harder to use. Dashboards rarely meet every accessibility need, so publish the underlying table too.',
  },
  {
    id: 'b03-db-k5', type: 'mc', kind: 'applied',
    prompt: 'In March 2027 Ana opens her catering dashboard. The tiles show December 2026, and nothing on the page says when the data were last refreshed. What is the best fix?',
    options: [
      'Show the period covered and a typed refresh date, and refresh at each review.',
      'Put =TODAY() in the corner so the page always shows the current date to readers.',
      'Remove the month from the tiles, so that the figures never look out of date.',
      'Shade the whole page grey once it is more than a month old, as a warning.',
    ],
    answer: 0,
    feedback: {
      1: 'TODAY() shows the date the file is opened, which tells the reader nothing about how old the data are and makes stale figures look current.',
      2: 'Readers need to know which period a number covers; hiding it makes stale data harder to spot, not easier.',
      3: 'Colour alone carries no explanation, and nothing on the page would say what the grey means or how old the data are.',
    },
    solution: 'State the dates the dashboard covers and when its data were last refreshed, and make refreshing part of the routine. Stale figures shown as if current are one of the commonest dashboard failures.',
  },
  {
    id: 'b03-db-k6', type: 'classify', kind: 'applied',
    prompt: 'Classify each item on Ana’s catering dashboard page.',
    items: [
      'Revenue is the sum of invoices for events held in the month; a two-day event counts in the month it starts.',
      'Monthly revenue from the PivotTable equals the total of the Events table: OK.',
      'December revenue is $880 below its plan of $11,000.',
      'Source: the Events table, 76 events, 12 March to 24 December 2026.',
      'The by-type revenue adds up to $62,320, the catering revenue in Lantern’s books: OK.',
    ],
    categories: ['Documentation (definition or source)', 'Reconciliation check', 'Comparison'],
    answer: [0, 1, 2, 0, 1],
    feedback: {
      1: 'Comparing a total on the page with the same total from the source is a reconciliation check.',
      2: 'A gap against plan is a comparison, the context that gives a number its meaning.',
      4: 'Agreement between two independent totals is a check; it belongs beside the figures it protects.',
    },
    solution: 'Definitions and sources document what a number means and where it came from. Checks prove that the page agrees with its data (and with the books). Comparisons give each number its meaning. A good notes panel has the first two; the tiles and charts carry the third.',
  },
];
