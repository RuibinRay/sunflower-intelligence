// charts-and-conditional-formatting.ex.js — B03 · Charts and conditional formatting: widgets, practice and the
// knowledge check (answer keys live here). Lantern's data come from case.js; every other business and number is
// fictional. Formula items are marked by their results (core/sheet.js gradeFormula); num items recompute in `check`.
import { ORDERS, ORDER_COLUMNS, EVENTS, EVENT_COLUMNS, DERIVED as D, tableCells } from './case.js?v=19';

const R = D.byRegion.value;
// Pedalworks' parts sheet (fictional), used by the lesson's applied example and the cc-parts widget:
// part, on hand, reorder point, weekly use
export const PARTS = [
  ['Inner tube 700c', 14, 20, 9], ['Brake pads (pair)', 0, 10, 4], ['Chain, 11-speed', 7, 6, 2], ['Tyre 700 × 28', 22, 12, 5],
  ['Brake cable set', 3, 5, 2], ['Bar tape', 9, 4, 1], ['Disc rotor 160 mm', 2, 3, 1], ['Valve cores (pack)', 0, 8, 3],
];
const partsSheet = {
  cells: {
    A1: 'Part', B1: 'On hand', C1: 'Reorder point', D1: 'Weekly use', E1: 'Status',
    ...Object.fromEntries(PARTS.flatMap((p, i) => [[`A${i + 2}`, p[0]], [`B${i + 2}`, p[1]], [`C${i + 2}`, p[2]], [`D${i + 2}`, p[3]], [`E${i + 2}`, `=IF(B${i + 2}=0,"Out",IF(B${i + 2}<=C${i + 2},"Reorder","OK"))`]])),
  },
};
const REGIONS = ['Central', 'East', 'West', 'North', 'South'];            // sorted by spring order value
const L6 = ['order_id', 'customer_id', 'product', 'order_total', 'channel', 'subscription'];
const first15 = tableCells(ORDER_COLUMNS, ORDERS, { cols: L6, n: 15 });
const inv = EVENTS.map((r) => r[EVENT_COLUMNS.indexOf('invoice')]);
// orders per week, Monday 2 March to Sunday 28 June 2026 (17 full weeks), as in the lesson
const WEEK0 = Date.UTC(2026, 2, 2);
const WEEKLY = Array.from({ length: 17 }, (_, w) => ORDERS.filter((r) => Math.floor((Date.parse(`${r[1]}T00:00:00Z`) - WEEK0) / 864e5 / 7) === w).length);

// small sheets for the formula items
const regionSheet = {
  cells: { A1: 'Region', B1: 'Order value', C1: 'Share', ...Object.fromEntries(REGIONS.flatMap((g, i) => [[`A${i + 2}`, g], [`B${i + 2}`, R[g]]])) },
};
const ordersBlock = (cols, extra = {}) => ({ cells: { ...tableCells(ORDER_COLUMNS, ORDERS, { cols, n: 15 }).cells, ...extra } });
const appSheet = ordersBlock(['order_id', 'quantity', 'channel', 'subscription'], { E1: 'Test A', F1: 'Test B' });
const topSheet = ordersBlock(['order_id', 'product', 'order_total', 'channel'], { E1: 'Test A', F1: 'Test B' });
const clientSheet = { cells: { ...tableCells(EVENT_COLUMNS, EVENTS, { cols: ['event_id', 'client', 'guests', 'invoice'], n: 15 }).cells, E1: 'Test A', F1: 'Test B' } };
const weekSheet = { cells: { A1: 'Week', B1: 'Orders', C1: '4-week average', ...Object.fromEntries(WEEKLY.flatMap((n, i) => [[`A${i + 2}`, i + 1], [`B${i + 2}`, n]])) } };

export const widgets = {
  'cc-region': {
    type: 'chart', kind: 'bar',
    title: 'Spring order value by region, March–June 2026: Central leads only because of one office order',
    x: { label: 'Region', values: REGIONS },
    series: [
      { name: 'All orders', values: REGIONS.map((g) => R[g]) },
      { name: 'Without the $1,512 office order', values: REGIONS.map((g) => (g === 'Central' ? Math.round((R[g] - D.bulk.value) * 100) / 100 : R[g])) },
    ],
    y: { label: 'Order value ($)', format: 'money' },
    note: 'Sorted by all orders, Central comes first with $2,125.90. Take out LC-10144, one $1,512 order from an office in the Central region, and Central falls to $613.90, the smallest of the five. A chart of these five bars needs a title that says which version it shows. Fictional figures from the B03 case.',
  },
  'cc-weekly': {
    type: 'chart', kind: 'line',
    title: 'Lantern’s orders per week, 2 March to 28 June 2026: steady between 9 and 16',
    x: { label: 'Week (1 = week starting 2 March)', values: WEEKLY.map((_, i) => i + 1) },
    series: [{ name: 'Orders', values: WEEKLY }],
    y: { label: 'Orders per week', format: 'int' },
    note: 'The value axis is zoomed to the data rather than starting at zero. For a line that is acceptable, because you read its position and slope; the same zoom on a column chart would exaggerate every difference. Week 13 (25–31 May) had 9 orders, the fewest; weeks 6 and 17 had 16, the most. The 1 March order and the three orders on 29–30 June fall outside these 17 full weeks.',
  },
  'cc-cf': {
    type: 'sheet',
    title: 'Lantern’s first 15 spring orders, with a whole-row rule for subscription orders',
    sheet: { cells: first15.cells },
    view: 'A1:F16',
    formats: { D: '$#,##0.00' },
    widths: { C: 24 },
    rules: [{ range: 'A2:F16', type: 'formula', formula: '=$F2="yes"', style: 'good' }],
    cf: { range: 'D2:D16' },
    tools: ['cf', 'formulas', 'reset'],
    note: 'The rule <x>=$F2="yes"</x> is written for A2 and moved to every cell of A2:F16, so each row tests its own column F. A rule you add goes to the top of the list, as a new rule does in Excel’s Manage Rules, so where two rules set a fill the newer one wins; use Move up and Move down to change that, tick Stop If True, or delete a rule. Try data bars on D2:D16, Top 3 items on D2:D16, an icon set on D2:D16, Duplicate values on B2:B16 (customer C0034 ordered twice), or a formula rule on A2:F16.',
  },
  'cc-invoices': {
    type: 'distribution',
    values: inv,
    label: 'Catering invoice, 2026 ($)',
    transforms: ['none', 'log'],
    rules: ['iqr'],
    closed: 'right',
  },
  'cc-parts': {
    type: 'sheet',
    title: 'Pedalworks’ parts sheet (fictional): out of stock, at the reorder point, and stock at a glance',
    sheet: partsSheet,
    view: 'A1:E9',
    widths: { A: 20, C: 13, D: 11 },
    rules: [
      { range: 'A2:E9', type: 'formula', formula: '=$B2=0', style: 'bad', stop: true },
      { range: 'A2:E9', type: 'formula', formula: '=$B2<=$C2', style: 'warn' },
      { range: 'B2:B9', type: 'icons' },
    ],
    cf: { range: 'A2:E9' },
    tools: ['cf', 'formulas', 'reset'],
    note: 'Rule 1 (red, Stop If True) is at the top, so it wins the conflicting fill on the two out-of-stock rows and stops the rules below it there: those rows have no arrow. The arrows split the on-hand counts into three equal bands between the lowest (0) and the highest (22). Column E repeats each colour in words, so nothing depends on colour alone.',
  },
};

export const guided = [
  {
    id: 'b03-cc-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Ana has seven questions for her spring review. Choose the chart that answers each one best.',
    items: [
      'Which of the five regions brought in the most order value?',
      'How did the number of orders move week by week from March to June?',
      'What share of spring order value came from subscription orders?',
      'How are the 76 catering invoices spread: where is a typical one, and are there extremes?',
      'Do catering events with more guests bring larger invoices?',
      'How did each of the 11 products sell week by week, shown beside each product’s row in a table?',
      'Which ten customers spent the most this spring?',
    ],
    categories: ['Sorted bar chart', 'Line chart', '100% stacked bar or pie', 'Histogram or box and whisker', 'Scatter chart', 'Sparklines'],
    answer: [0, 1, 2, 3, 4, 5, 0],
    hints: [
      'First name the kind of question: comparison, change over time, composition, distribution or relationship.',
      'A ranking is a comparison; a trend in every row of a table needs a chart small enough to fit in a cell.',
    ],
    feedback: {
      2: 'A share of one whole, with two parts (subscription and not), is composition: one 100% stacked bar or a two-slice pie.',
      3: 'The spread of one numeric variable is a distribution: bins and counts (histogram) or quartiles (box and whisker).',
      4: 'Two numeric variables for the same events: plot each event as a point at (guests, invoice).',
      5: 'Sparklines are tiny line or column charts in a cell, one per row.',
      6: 'A top ten is a ranking, which a sorted bar chart shows best; bars also leave room for long customer names.',
    },
    solution: 'Regions and the top ten customers are comparisons (rankings): sorted bars from zero. Weekly orders are change over time: a line. The subscription share is composition: a 100% stacked bar or a two-slice pie. The spread of invoices is a distribution: a histogram or a box and whisker chart. Guests against invoice is a relationship between two numeric variables: a scatter chart. A trend for each of 11 rows of a table: sparklines.',
  },
  {
    id: 'b03-cc-g2', type: 'formula', kind: 'numerical',
    prompt: 'Before drawing a 100% stacked bar of spring order value by region, Ana wants each region’s share of the total. Type a formula in C2 that divides the region’s value by the total of B2:B6, and fill it down to C6. (The column is formatted as a percentage.)',
    sheet: regionSheet,
    cell: 'C2', fill: 'C2:C6', answer: '=B2/SUM($B$2:$B$6)',
    alt: ['=B2/SUM(B$2:B$6)', '=B2/SUM($B$2:$B$6)*1'],
    view: 'A1:C6',
    formats: { B: '$#,##0.00', C: '0.0%' },
    widths: { A: 12, B: 14 },
    wrong: [
      { formula: '=B2/SUM(B2:B6)', say: 'Without <code>$</code> the total’s range moves down as you fill: C6 divides by SUM(B6:B10), just South’s own value, and shows 100%. Lock the total, <x>=B2/SUM($B$2:$B$6)</x>.' },
      { formula: '=B2/9096.15', say: 'Typing the total as a number works only until a value changes. Point at the cells: <x>=B2/SUM($B$2:$B$6)</x>.' },
      { formula: '=SUM($B$2:$B$6)/B2', say: 'That is the total divided by the part, upside down. A share is part ÷ whole.' },
    ],
    hints: [
      'Share = this region’s value ÷ the total of all five. The value moves down with the fill; the total must not.',
      'Write the total as SUM($B$2:$B$6).',
    ],
    solution: '<x>=B2/SUM($B$2:$B$6)</x> filled to C6 gives Central 23.4%, East 21.1%, West 20.4%, North 18.4% and South 16.7%, which add to 100%. The mixed form <x>=B2/SUM(B$2:B$6)</x> also works, because filling down never changes the column.',
  },
  {
    id: 'b03-cc-g3', type: 'formula', kind: 'applied',
    prompt: 'Ana wants a conditional format on A2:D16 that shades the whole row of every <b>app</b> order of <b>two or more bags</b> (quantity in column B). Excel moves a rule from A2 to every other cell exactly as Fill does, so test it first: type the rule as you would write it for A2 into E2, and fill it to E2:F16. E and F stand in for two columns of the range; both should say TRUE in exactly the rows to shade.',
    sheet: appSheet,
    cell: 'E2', fill: 'E2:F16', answer: '=AND($C2="app",$B2>=2)',
    alt: ['=AND($B2>=2,$C2="app")', '=($C2="app")*($B2>=2)=1', '=AND($C2="app",$B2>1)'],
    view: 'A1:F16',
    wrong: [
      { formula: '=AND(C2="app",B2>=2)', say: 'Column E is right, but in column F your references have moved to D and C, so the test fails there. Lock the columns with <code>$</code>: <x>=AND($C2="app",$B2>=2)</x>.' },
      { formula: '=AND($C$2="app",$B$2>=2)', say: 'With the rows locked too, every row tests row 2 (an app order of two bags), so every row would be shaded. Leave the row number free: <code>$C2</code>.' },
      { formula: '=OR($C2="app",$B2>=2)', say: 'OR shades a row when either condition holds, including every one-bag app order and every web order of two bags. The rule needs both: AND.' },
      { formula: '=AND($C2="app",$B2>2)', say: '“Two or more” includes 2: use &gt;=.' },
    ],
    hints: [
      'Two conditions must both hold: channel (column C) equals <x>"app"</x>, and quantity (column B) is at least 2. Combine them with AND.',
      'Every cell of a row must look at the same columns, C and B, so put <code>$</code> before the column letters and not before the row numbers.',
    ],
    solution: '<x>=AND($C2="app",$B2>=2)</x>. The <code>$</code> before C and B locks the columns, so F2 still tests C2 and B2; the free row number lets row 5 test C5 and B5. Rows 2, 3, 5 and 16 (LC-10001, LC-10002, LC-10004 and LC-10015) are TRUE in both columns. Applied to A2:D16 the rule shades those four rows end to end.',
  },
  {
    id: 'b03-cc-g4', type: 'num', kind: 'numerical',
    prompt: 'A fictional community theatre’s annual report shows ticket sales for two seasons as bars: $48,000 and $40,000. The value axis starts at $36,000. How many times longer does the first bar look than the second? Give the ratio to one decimal place.',
    answer: 3, check: () => (48000 - 36000) / (40000 - 36000), unit: 'times', places: 1, tol: 0.05,
    wrong: [
      { value: 1.2, say: 'That is the true ratio, 48,000 ÷ 40,000. On a truncated axis each bar’s length starts at the axis minimum, $36,000.' },
      { value: 0.33, say: 'That is the second bar against the first. The question asks how much longer the first looks.' },
    ],
    hints: [
      'Each bar’s visible length is its value minus the axis minimum.',
      'The lengths are 48,000 − 36,000 and 40,000 − 36,000.',
    ],
    solution: 'Visible lengths: 48,000 − 36,000 = 12,000 and 40,000 − 36,000 = 4,000, so the first bar looks 12,000 ÷ 4,000 = 3.0 times as long. The true ratio is 48,000 ÷ 40,000 = 1.2: sales were 20% higher, not three times. Starting the axis at zero fixes it.',
  },
];

export const independent = [
  {
    id: 'b03-cc-i1', type: 'mc', kind: 'conceptual',
    prompt: 'Ana makes a line chart of invoice for her 75 one-day catering events, with the guest numbers as the horizontal axis labels. What goes wrong?',
    options: [
      'The guest numbers become evenly spaced labels on a category axis instead of values; a scatter chart is needed.',
      'Nothing goes wrong: a line chart and a scatter chart place numeric x values in exactly the same way, so either works.',
      'A line chart can show at most 50 points, so Excel silently drops the remaining 25 events from the chart.',
      'The line chart forces its value axis to start at zero, which squashes the points into a flat, unreadable band.',
    ],
    answer: 0,
    feedback: {
      1: 'They differ exactly here: a line chart treats x as categories at equal spacing; only a scatter chart treats x as numbers.',
      2: 'There is no such limit. The problem is how the horizontal axis treats numbers.',
      3: 'The value axis is not the issue. The horizontal axis places 35 guests and 207 guests as if they were neighbouring labels.',
    },
    solution: 'In a line chart the horizontal axis is a category axis: it can only be a text or date axis, so the guest numbers become text labels, spaced evenly in the order of the rows. Guest numbers are numeric and unevenly spaced, so they belong on a value axis. A scatter chart places each event at (guests, invoice), which is what a relationship needs, and lets you add a trendline (next lesson).',
  },
  {
    id: 'b03-cc-i2', type: 'formula', kind: 'applied',
    prompt: 'Ana’s first 15 catering events of 2026 are in A2:D16. She wants a rule on A2:D16 that shades the whole row of every event whose client appears more than once in the list (a returning client). Test the rule as written for A2: type it in E2 and fill it to E2:F16.',
    sheet: clientSheet,
    cell: 'E2', fill: 'E2:F16', answer: '=COUNTIF($B$2:$B$16,$B2)>1',
    alt: ['=COUNTIF($B$2:$B$16,$B2)>=2', '=NOT(COUNTIF($B$2:$B$16,$B2)=1)'],
    view: 'A1:F16',
    formats: { D: '$#,##0' },
    widths: { B: 24 },
    wrong: [
      { formula: '=COUNTIF($B$2:$B$16,B2)>1', say: 'In column F the criterion has moved to C2, the guests, which never match a client name. Lock the column of the criterion as well: <code>$B2</code>.' },
      { formula: '=COUNTIF(B2:B16,$B2)>1', say: 'The counting range moves down with each row, so the last rows only look below themselves: Pier Nine Studio in row 16 finds itself once. Lock the whole range, <code>$B$2:$B$16</code>.' },
      { formula: '=COUNTIF($B$2:$B$16,$B2)>=1', say: 'Every client appears at least once (its own row), so this shades everything. A returning client appears more than once: <code>&gt;1</code>.' },
    ],
    solution: '<x>=COUNTIF($B$2:$B$16,$B2)>1</x>: the range is locked in both directions, and the criterion <code>$B2</code> has its column locked and its row free. Harbor Tech, Meridian Partners, Pier Nine Studio and Alder &amp; Finch Architects appear more than once, so their rows are TRUE. Excel’s built-in Duplicate Values rule would mark only the client cells; the formula rule shades the whole row.',
  },
  {
    id: 'b03-cc-i3', type: 'formula', kind: 'numerical',
    prompt: 'Weekly orders bounce around. To smooth the line, Ana adds a 4-week moving average: in C5, the average of the four weeks ending with week 4. Type the formula in C5 and fill it down to C18.',
    sheet: weekSheet,
    cell: 'C5', fill: 'C5:C18', answer: '=AVERAGE(B2:B5)',
    alt: ['=SUM(B2:B5)/4', '=(B2+B3+B4+B5)/4'],
    view: 'A1:C18',
    formats: { C: '0.00' },
    wrong: [
      { formula: '=AVERAGE($B$2:B5)', say: 'With the start locked, the range grows as you fill, so C18 averages all 17 weeks: a running average, not a moving one. Leave both ends relative so the four-week window moves.' },
      { formula: '=AVERAGE(B5:B8)', say: 'That averages week 4 and the three weeks after it. A trailing moving average uses the week and the three before it: B2:B5 in C5.' },
      { formula: '=AVERAGE(B2:B4)', say: 'That is a three-week window. Four weeks ending with week 4 are B2:B5.' },
    ],
    solution: '<x>=AVERAGE(B2:B5)</x> in C5, filled down, averages each week with the three before it; both ends of the range move, so the window slides. C5 shows 13.75 (weeks 1–4: 14, 13, 13 and 15 orders, 55 ÷ 4). Plotted with the weekly orders, the moving average shows the trend without the week-to-week noise; Excel’s Moving Average trendline with a period of 4 draws the same line.',
  },
  {
    id: 'b03-cc-i4', type: 'order', kind: 'conceptual',
    prompt: 'Put the steps for adding a whole-row formula rule to Lantern’s order sheet (orders in A2:M232, subscription in L) in order.',
    items: [
      'Select A2:M232, starting the selection at A2 so the rule is written for row 2.',
      'Choose Home &gt; Conditional Formatting &gt; New Rule &gt; Use a formula to determine which cells to format.',
      'Type <x>=$L2="yes"</x>, removing any <code>$</code> Excel added before the row number.',
      'Choose a format, such as a light fill, and confirm.',
      'Open Manage Rules to check the rule’s range and its place among the other rules.',
    ],
    solution: 'Select the range from its top-left cell, because the rule is written for that cell; open New Rule and choose the formula type; type the rule with the column locked and the row free; choose the format; then check Manage Rules, where the new rule sits at the top with the highest precedence.',
  },
  {
    id: 'b03-cc-i5', type: 'num', kind: 'numerical',
    prompt: 'Ana tries a grey for her context bars. On her white background (relative luminance 1), the grey has a relative luminance of 0.184. What is the contrast ratio? Give it to two decimal places, as the number before “:1”.',
    answer: 4.49, check: () => (1 + 0.05) / (0.184 + 0.05), unit: ':1', places: 2, tol: 0.006,
    wrong: [
      { value: 5.43, say: 'You divided 1 by 0.184. The WCAG formula adds 0.05 to both luminances: (1 + 0.05) ÷ (0.184 + 0.05).' },
      { value: 0.22, say: 'That is the darker over the lighter. Put the lighter colour on top, so the ratio is at least 1.' },
    ],
    solution: 'Contrast ratio = (L₁ + 0.05) ÷ (L₂ + 0.05) = (1 + 0.05) ÷ (0.184 + 0.05) = 1.05 ÷ 0.234 ≈ 4.49, written 4.49:1. That passes the 3:1 that WCAG asks of chart bars and lines, but falls just short of the 4.5:1 for normal text, so the same grey shouldn’t be used for small labels.',
  },
  {
    id: 'b03-cc-i6', type: 'multi', kind: 'applied',
    prompt: 'Ana’s draft spring chart is a 3-D column chart of order value by month, with the value axis starting at $1,500, a legend for its single series, the title “Sales”, and the bars coloured red, amber and green by month. Select all the changes that make it more honest or easier to read.',
    options: [
      'Start the value axis at $0.',
      'Replace the title with the finding, such as “May’s order value was the highest only because of one $1,512 office order”.',
      'Delete the legend and label the bars directly.',
      'Use a flat (2-D) column chart.',
      'Keep the red, amber and green and explain them in a footnote.',
      'Switch to a pie chart, so the four months are seen as parts of the spring.',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'Colour that carries no meaning distracts, and red–green coding fails readers who can’t tell those colours apart. Use one colour, with an emphasis colour only where it means something.',
      5: 'The question is how the months compare, not what share each is of the spring: a pie asks the reader to compare angles, which are read less accurately than bar lengths.',
    },
    solution: 'Start the bars at zero (the axis at $1,500 exaggerates every difference); state the finding in the title; label the single series directly instead of a legend; drop the 3-D effect, which distorts lengths. Traffic-light colours by month carry no meaning, and a pie answers a different question.',
  },
];

export const check = [
  {
    id: 'b03-cc-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which of these is the best candidate for a pie chart?',
    options: [
      'One week’s sales split into bread, cakes and drinks, which together make up the week’s total.',
      'A bakery’s profit for each of its ten branches this year, two of which made a loss.',
      'A bakery’s weekly sales for each of the 52 weeks of the year, to show how sales rise before holidays.',
      'A bakery’s monthly sales and its monthly number of customers, side by side for the year.',
    ],
    answer: 0,
    feedback: {
      1: 'Ten categories are too many for a pie, and a loss is a negative value, which a pie can’t show.',
      2: 'That is change over time: a line chart.',
      3: 'Two measures in different units are not parts of one whole; a pie can show only one data series.',
    },
    solution: 'Microsoft suggests a pie only for one data series, no negative values, almost no zeros and no more than seven categories that together make up the whole. Three product groups that add up to the week’s sales fit; ten branches with losses, 52 weeks, or two different measures don’t.',
  },
  {
    id: 'b03-cc-k2', type: 'formula', kind: 'applied',
    prompt: 'Ana wants the three largest of her first 15 orders to stand out: a rule on A2:D16 that shades the whole row of any order whose total (column C) is at least the third-largest total. LARGE(range, k) returns the kth largest value of a range. Type the rule as written for A2 in E2 and fill it to E2:F16.',
    sheet: topSheet,
    cell: 'E2', fill: 'E2:F16', answer: '=$C2>=LARGE($C$2:$C$16,3)',
    alt: ['=LARGE($C$2:$C$16,3)<=$C2', '=RANK.EQ($C2,$C$2:$C$16)<=3'],
    view: 'A1:F16',
    formats: { C: '$#,##0.00' },
    widths: { B: 22 },
    wrong: [
      { formula: '=$C2>=LARGE(C2:C16,3)', say: 'The range inside LARGE moves down with each row, so lower rows compare with the third largest of a shrinking list. Lock it: <code>$C$2:$C$16</code>.' },
      { formula: '=C2>=LARGE($C$2:$C$16,3)', say: 'In column F the order total has moved to D2, the channel. Lock the column: <code>$C2</code>.' },
      { formula: '=$C2>LARGE($C$2:$C$16,3)', say: 'With &gt; the third-largest order itself is left out, so only two rows are shaded. Use &gt;=.' },
    ],
    solution: '<x>=$C2>=LARGE($C$2:$C$16,3)</x>. LARGE finds the third-largest total in the locked range ($53.00); each row compares its own total, <code>$C2</code>, with it. LC-10001 ($111.00), LC-10005 ($92.00) and LC-10007 ($53.00) are shaded. Excel’s Top 10 Items rule set to 3 would mark only the total cells; the formula shades whole rows.',
  },
  {
    id: 'b03-cc-k3', type: 'num', kind: 'numerical',
    prompt: 'A chart compares two scores, 120 and 100, as bars. At what value would the axis have to start for the first bar to look exactly three times as long as the second?',
    answer: 90, check: () => (3 * 100 - 120) / (3 - 1), unit: '', places: 0, tol: 0.5,
    wrong: [
      { value: 100, say: 'At 100 the second bar has no length at all. Solve (120 − b) ÷ (100 − b) = 3.' },
      { value: 80, say: 'With b = 80 the bars are 40 and 20 long: twice, not three times. Solve (120 − b) ÷ (100 − b) = 3.' },
    ],
    solution: 'The apparent ratio is (120 − b) ÷ (100 − b). Setting it to 3: 120 − b = 3(100 − b) = 300 − 3b, so 2b = 180 and b = 90. Check: bars of 30 and 10 look three times different, while the true ratio is 1.2.',
  },
  {
    id: 'b03-cc-k4', type: 'mc', kind: 'applied',
    prompt: 'Ana adds data bars to all 231 order totals. Almost every bar is a thin sliver, because one order (LC-10144, $1,512) sets the top of the scale. What is the best fix if she wants to compare ordinary orders?',
    options: [
      'Set the data bars’ maximum to a number, such as 200, or to a percentile, so the scale fits ordinary orders.',
      'Delete LC-10144 from the sheet, since one unusual order shouldn’t distort the picture of the others.',
      'Switch to a two-colour scale with the default lowest and highest values, which shades cells instead of drawing bars.',
      'Widen the order_total column until the shortest bars become long enough to compare by eye.',
    ],
    answer: 0,
    feedback: {
      1: 'The office order is genuine (B02 kept it). Deleting data to make a format look better changes every total that uses the sheet.',
      2: 'A colour scale with the same endpoints has the same problem: almost every cell would be the colour at the bottom of the scale.',
      3: 'Wider columns help a little, but the bars stay in proportion to $1,512, so the differences among $14 to $111 orders stay tiny.',
    },
    solution: 'By default a data bar’s length is proportional to its value, so the $1,512 order sets the longest bar and the rest are slivers. A maximum set to a number (such as 200) or a percentile keeps the comparison among ordinary orders; the office order’s bar fills the cell. Keep the data intact.',
  },
  {
    id: 'b03-cc-k5', type: 'classify', kind: 'conceptual',
    prompt: 'Choose the conditional formatting rule that does each job most directly.',
    items: [
      'Mark every product name that appears more than once in a list.',
      'Shade the five largest order totals in a column.',
      'Show the size of each order total as a bar inside its cell.',
      'Shade order totals greater than the column’s mean.',
      'Shade the whole row of every web order with a rating of 1.',
      'Shade a column of daily temperatures from cool to warm.',
    ],
    categories: ['Duplicate Values', 'Top 10 Items (set to 5)', 'Data Bars', 'Above Average', 'Formula rule', 'Color Scales'],
    answer: [0, 1, 2, 3, 4, 5],
    feedback: {
      4: 'Two columns (channel and rating) decide the format of a whole row, which only a formula rule with mixed references can do: <x>=AND($K2="web",$M2=1)</x>.',
    },
    solution: 'Duplicates: Duplicate Values. Five largest: Top 10 Items with the number changed to 5. Size as a bar: Data Bars. Above the mean: Above Average. A condition on other columns that formats a whole row: a formula rule. A gradient from low to high: Color Scales.',
  },
  {
    id: 'b03-cc-k6', type: 'mc', kind: 'conceptual',
    prompt: 'A range has two conditional formatting rules. Top of Manage Rules: totals under $15 get a red fill. Below it: subscription orders get a green fill and bold text. Stop If True is not ticked. How does LC-10006 (a subscription order, $12.60) look?',
    options: ['Red fill and bold text.', 'Green fill and bold text.', 'Red fill only.', 'Green fill only.'],
    answer: 0,
    feedback: {
      1: 'The two fills conflict, and the rule higher in the list wins the conflict: red.',
      2: 'Bold doesn’t conflict with anything in the first rule, so it still applies. Red fill only would need Stop If True on the first rule.',
      3: 'The green fill loses the conflict to the higher rule; only the bold survives from the second rule.',
    },
    solution: 'Both rules are true. Where they conflict (two fills), the rule higher in precedence wins, so the fill is red; where they don’t (bold), both apply. With Stop If True ticked on the first rule, Excel would not evaluate the second, and the cell would be red without bold.',
  },
];
