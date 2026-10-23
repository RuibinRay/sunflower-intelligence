// assess-m3.js — B03 module 3 test: Showing and describing data (charts-and-conditional-formatting,
// descriptive-statistics-and-regression). New questions on new businesses, not copies of lesson exercises. No hints;
// solutions are shown when the student reviews the test. Every business, person and number is fictional. Formula items
// are marked by their results; every num item's `check` recomputes its answer.

const sum = (a) => a.reduce((s, x) => s + x, 0);
const mean = (a) => sum(a) / a.length;
const sorted = (a) => [...a].sort((x, y) => x - y);
const sdP = (a) => { const m = mean(a); return Math.sqrt(sum(a.map((x) => (x - m) ** 2)) / a.length); };
const sdS = (a) => { const m = mean(a); return Math.sqrt(sum(a.map((x) => (x - m) ** 2)) / (a.length - 1)); };
const inc = (a, p) => { const s = sorted(a), h = (s.length - 1) * p, lo = Math.floor(h); return s[lo] + (h - lo) * ((s[lo + 1] ?? s[lo]) - s[lo]); };
const exc = (a, p) => { const s = sorted(a), h = (s.length + 1) * p, lo = Math.floor(h); return s[lo - 1] + (h - lo) * ((s[lo] ?? s[lo - 1]) - s[lo - 1]); };
const fit = (xs, ys) => { const mx = mean(xs), my = mean(ys); const b = sum(xs.map((x, i) => (x - mx) * (ys[i] - my))) / sum(xs.map((x) => (x - mx) ** 2)); return { b, a: my - b * mx }; };
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));

// Cobble Lane Books: stock and weekly sales of 11 titles (codes CL-201 …)
const BOOK_STOCK = [14, 3, 8, 25, 0, 9, 30, 5, 11, 16, 2];
const BOOK_WEEKLY = [5, 4, 4, 6, 2, 6, 3, 1, 7, 8, 1];
const books = { cells: { A1: 'Title', B1: 'On hand', C1: 'Weekly sales', D1: 'Test A', E1: 'Test B', ...col('A', 2, BOOK_STOCK.map((_, i) => `CL-${201 + i}`)), ...col('B', 2, BOOK_STOCK), ...col('C', 2, BOOK_WEEKLY) } };
const lowCover = BOOK_STOCK.map((b, i) => b < 2 * BOOK_WEEKLY[i]);
// Ironbark Gym: classes taught by each of its 12 trainers this month
const TRAINERS = [18, 22, 15, 30, 26, 19, 24, 21, 17, 28, 20, 23];
const gym = { cells: { A1: 'Trainer', B1: 'Classes', D1: 'Spread', ...col('A', 2, TRAINERS.map((_, i) => `T${String(i + 1).padStart(2, '0')}`)), ...col('B', 2, TRAINERS) } };
// Quickwheel Couriers: 20 delivery times (minutes)
const TIMES = [34, 41, 28, 52, 37, 45, 39, 61, 33, 48, 36, 29, 44, 57, 40, 31, 38, 66, 42, 35];
const courier = { cells: { A1: 'Delivery', B1: 'Minutes', D1: '90th percentile', ...col('A', 2, TIMES.map((_, i) => `D-${301 + i}`)), ...col('B', 2, TIMES) } };
// Cobble Lane Books: ten weeks of advertising and sales ($)
const ADS = [200, 350, 150, 400, 300, 250, 450, 100, 500, 320];
const SALES = [3100, 3700, 2900, 4400, 3500, 3400, 4300, 2600, 4900, 3700];
const adSheet = { cells: { A1: 'Week', B1: 'Advertising', C1: 'Sales', E1: 'Intercept', ...col('A', 2, ADS.map((_, i) => i + 1)), ...col('B', 2, ADS), ...col('C', 2, SALES) } };
const AD = fit(ADS, SALES);
const STALL = [12, 15, 18, 22, 25, 27, 31, 36, 44];

export const items = [
  // ---------------------------------------------------------------- charts-and-conditional-formatting
  {
    id: 'b03-m3-1', lesson: 'charts-and-conditional-formatting', type: 'mc', kind: 'conceptual',
    prompt: 'Ironbark Gym (fictional) wants two charts for its annual report: how its membership changed month by month over two years, and how this month’s members split across its three plans. Which pair is best?',
    options: [
      'A line chart for membership over time, and one 100% stacked bar or a three-slice pie for the plans.',
      'A pie chart for membership over time, with one slice per month, and a line chart for the three plans.',
      'A scatter chart for membership over time and a histogram showing how members spread across plans.',
      'A stacked column chart for membership over time and a scatter chart for the split across plans.',
    ],
    answer: 0,
    feedback: {
      1: 'Twenty-four months are not parts of one whole, and a line can’t show a split at one moment. The pairing is the wrong way round.',
      2: 'A scatter chart shows a relationship between two numeric variables, and a histogram the distribution of one; neither answers these questions.',
      3: 'There is one membership figure per month, so there is nothing to stack, and plan shares are a composition, not a relationship.',
    },
    solution: 'Membership month by month is change over time at equal intervals: a line chart. Three plans that make up this month’s members are a composition of one whole: a 100% stacked bar, or a pie, which suits one series with few parts.',
  },
  {
    id: 'b03-m3-2', lesson: 'charts-and-conditional-formatting', type: 'formula', kind: 'applied',
    prompt: 'Cobble Lane Books (fictional) lists 11 titles with stock on hand (B) and weekly sales (C). The owner wants a conditional format on A2:C12 that shades the whole row of any title with less than two weeks of stock: on hand below twice the weekly sales. Test the rule as written for A2 by typing it in D2 and filling it to D2:E12.',
    sheet: books,
    cell: 'D2', fill: 'D2:E12', answer: '=$B2<2*$C2',
    alt: ['=$B2/$C2<2', '=2*$C2>$B2'],
    view: 'A1:E12',
    wrong: [
      { formula: '=B2<2*C2', say: 'In column E the references have moved to C and D. Lock the columns with <code>$</code>, leaving the rows free: <x>=$B2<2*$C2</x>.' },
      { formula: '=$B$2<2*$C$2', say: 'With the rows locked as well, every row tests row 2. Use <code>$B2</code> and <code>$C2</code>.' },
      { formula: '=$B2<=2*$C2', say: '“Less than two weeks” excludes exactly two weeks: CL-203 has 8 on hand and sells 4 a week. Use &lt;, not &lt;=.' },
    ],
    solution: `<x>=$B2<2*$C2</x>: the columns are locked so every cell of a row tests that row’s B and C, and the row is free so each row tests itself. ${lowCover.filter(Boolean).length} titles are shaded: ${BOOK_STOCK.map((_, i) => `CL-${201 + i}`).filter((_, i) => lowCover[i]).join(', ')}. CL-203, CL-210 and CL-211 have exactly two weeks of stock and are not.`,
  },
  {
    id: 'b03-m3-3', lesson: 'charts-and-conditional-formatting', type: 'num', kind: 'numerical',
    prompt: 'Ironbark Gym has 210 members on monthly plans, 84 on annual plans and 56 on student plans. In a 100% stacked bar of the three plans, what percentage does the annual segment show? Give a whole number.',
    answer: 24, check: () => 84 / (210 + 84 + 56) * 100, unit: '%', places: 0, tol: 0.5,
    wrong: [
      { value: 40, say: 'That is annual members as a share of monthly members (84 ÷ 210). A 100% bar shows each plan’s share of all members.' },
      { value: 33, say: 'Each plan is not a third: weight by the number of members. 84 ÷ 350 × 100.' },
    ],
    solution: 'Share = part ÷ whole × 100 = 84 ÷ (210 + 84 + 56) × 100 = 84 ÷ 350 × 100 = 24%. Monthly plans are 60% and student plans 16%.',
  },
  {
    id: 'b03-m3-4', lesson: 'charts-and-conditional-formatting', type: 'mc', kind: 'applied',
    prompt: 'Ironbark’s member list has two rules on A2:F400. Top of Manage Rules: <x>=$E2>0</x> (a balance is owed), red fill, Stop If True ticked. Below it: <x>=$F2=0</x> (no classes attended this month), yellow fill and italic text. How does the row of a member who owes money and attended no classes look?',
    options: ['Red fill only.', 'Red fill and italic text.', 'Yellow fill and italic text.', 'Yellow fill only.'],
    answer: 0,
    feedback: {
      1: 'Italic wouldn’t conflict with a red fill, so without Stop If True it would apply. Stop If True on the first rule stops Excel from evaluating the second at all.',
      2: 'The first rule is higher in the list, so even without Stop If True its red fill would win the conflict over yellow.',
      3: 'The yellow rule is never evaluated for this member, because the rule above it is true and has Stop If True ticked.',
    },
    solution: 'The first rule is true and has Stop If True ticked, so Excel stops evaluating rules for these cells: red fill, no italic. Without Stop If True, the two fills would conflict (red wins, being higher) and the italic would also apply.',
  },
  {
    id: 'b03-m3-5', lesson: 'charts-and-conditional-formatting', type: 'multi', kind: 'conceptual',
    prompt: 'A line chart shows three branches’ weekly sales. Select all the changes that stop it relying on colour alone.',
    options: [
      'Label each line with the branch name at its right-hand end.',
      'Give each line a different marker shape or dash pattern.',
      'Put the figures in a data table below the chart.',
      'Use three shades of green so the lines look related.',
      'Keep the colour legend and add a note that the colours match the branches’ logos.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Three shades of one hue are even harder to tell apart, and still distinguish the lines only by colour.',
      4: 'A colour legend still asks the reader to match colours; the note adds nothing a colour-blind reader can use.',
    },
    solution: 'Direct labels, distinct markers or dash patterns, and a data table all carry the information without colour, as WCAG 1.4.1 asks. Shades of one colour and a colour-matched legend do not.',
  },
  // ---------------------------------------------------------------- descriptive-statistics-and-regression
  {
    id: 'b03-m3-6', lesson: 'descriptive-statistics-and-regression', type: 'formula', kind: 'numerical',
    prompt: 'Ironbark’s manager wants to report how much the number of classes taught this month varies across the gym’s 12 trainers, all of whom are listed in B2:B13. The figure describes these 12 trainers only, with no wider conclusion. In D2, calculate the standard deviation with the right function.',
    sheet: gym,
    cell: 'D2', answer: '=STDEV.P(B2:B13)',
    alt: ['=STDEVP(B2:B13)', '=SQRT(VAR.P(B2:B13))'],
    view: 'A1:D13',
    formats: { D: '0.00' },
    wrong: [
      { formula: '=STDEV.S(B2:B13)', say: 'STDEV.S treats the data as a sample of something larger. These are all 12 trainers and the manager describes only them: the whole population, STDEV.P.' },
      { formula: '=VAR.P(B2:B13)', say: 'VAR.P is the variance, in classes squared. The standard deviation is its square root: STDEV.P.' },
    ],
    solution: `<x>=STDEV.P(B2:B13)</x> ≈ ${sdP(TRAINERS).toFixed(2)} classes. The 12 trainers are the entire group and nothing is generalised, so dividing by n is right; STDEV.S would give ${sdS(TRAINERS).toFixed(2)}.`,
  },
  {
    id: 'b03-m3-7', lesson: 'descriptive-statistics-and-regression', type: 'formula', kind: 'applied',
    prompt: 'Quickwheel Couriers (fictional) promises customers a delivery time that 90% of deliveries meet. From the 20 delivery times in B2:B21, calculate in D2 the 90th percentile with Excel’s inclusive method.',
    sheet: courier,
    cell: 'D2', answer: '=PERCENTILE.INC(B2:B21,0.9)',
    alt: ['=PERCENTILE(B2:B21,0.9)', '=PERCENTILE.INC(B2:B21,90%)'],
    view: 'A1:D21',
    formats: { D: '0.0' },
    widths: { D: 15 },
    wrong: [
      { formula: '=PERCENTILE.EXC(B2:B21,0.9)', say: 'That is the exclusive method, position (n + 1)p. The question asks for the inclusive one, PERCENTILE.INC.' },
      { formula: '=PERCENTILE.INC(B2:B21,90)', say: 'k must be between 0 and 1: 0.9, not 90. With 90 Excel returns #NUM!.' },
      { formula: '=QUARTILE.INC(B2:B21,3)', say: 'That is the 75th percentile. The promise is about 90% of deliveries.' },
    ],
    solution: `<x>=PERCENTILE.INC(B2:B21,0.9)</x> = ${inc(TIMES, 0.9).toFixed(1)} minutes: position 1 + 19 × 0.9 = 18.1 in the sorted times, a tenth of the way from 57 to 61. The exclusive method gives ${exc(TIMES, 0.9).toFixed(1)}. A promise of about an hour would be met by roughly 90% of these deliveries.`,
  },
  {
    id: 'b03-m3-8', lesson: 'descriptive-statistics-and-regression', type: 'num', kind: 'numerical',
    prompt: 'A market stall (fictional) sold 12, 15, 18, 22, 25, 27, 31, 36 and 44 units on nine days (sorted). What does <x>=QUARTILE.EXC(range,1)</x> return? Give one decimal place.',
    answer: 16.5, check: () => exc(STALL, 0.25), unit: 'units', places: 1, tol: 0.05,
    wrong: [
      { value: 18, say: 'That is QUARTILE.INC, position 1 + (n − 1) × 0.25 = 3. QUARTILE.EXC uses position (n + 1) × 0.25 = 2.5.' },
      { value: 15, say: 'Position 2.5 is halfway between the 2nd and 3rd values, not the 2nd value itself.' },
    ],
    solution: 'QUARTILE.EXC places Q1 at position (n + 1) × 0.25 = 10 × 0.25 = 2.5: halfway between the 2nd value (15) and the 3rd (18), so 15 + 0.5 × 3 = 16.5. QUARTILE.INC would use position 3 and return 18.',
  },
  {
    id: 'b03-m3-9', lesson: 'descriptive-statistics-and-regression', type: 'num', kind: 'applied',
    prompt: 'Saltwind Hotel (fictional) regressed breakfast covers on occupied rooms over 90 days, with occupied rooms between 40 and 120. The output shows Intercept 6.2 and rooms 1.38 (Standard Error of the regression 7.4). How many covers should the kitchen plan for on a night with 90 occupied rooms? Give one decimal place.',
    answer: 130.4, check: () => 6.2 + 1.38 * 90, unit: 'covers', places: 1, tol: 0.05,
    wrong: [
      { value: 124.2, say: 'You left out the intercept: covers = 6.2 + 1.38 × rooms.' },
      { value: 559.8, say: 'You multiplied the intercept by 90. Only the rooms are multiplied by the slope.' },
    ],
    solution: 'Predicted covers = 6.2 + 1.38 × 90 = 6.2 + 124.2 = 130.4. Ninety rooms lies inside the 40–120 the model was fitted on. With a standard error of 7.4 covers, the kitchen should expect actual numbers within several covers either side, so it may prepare for a few more than 130.',
  },
  {
    id: 'b03-m3-10', lesson: 'descriptive-statistics-and-regression', type: 'mc', kind: 'conceptual',
    prompt: 'Saltwind’s regression of restaurant revenue on hotel guests has R Square 0.62. Which statement is correct?',
    options: [
      '62% of the variation in daily restaurant revenue around its mean lines up with the number of guests.',
      'Predictions of a day’s restaurant revenue made from the number of hotel guests will be about 62% accurate.',
      'Each hotel guest causes about 62% of the restaurant revenue taken on the day they stay.',
      'The correlation coefficient between hotel guests and restaurant revenue is 0.62, a moderate one.',
    ],
    answer: 0,
    feedback: {
      1: 'R² is not a measure of prediction accuracy; the Standard Error gives the size of a typical miss.',
      2: 'R² describes association, not causation, and it is not a share of each day’s revenue.',
      3: 'With one X, R² is the square of the correlation: r = √0.62 ≈ 0.79 (positive here).',
    },
    solution: 'R Square is the share of the variation in y around its mean that the regression accounts for: 62%. It says nothing directly about the accuracy of future predictions or about causes; the correlation is its square root, about 0.79.',
  },
  {
    id: 'b03-m3-11', lesson: 'descriptive-statistics-and-regression', type: 'formula', kind: 'numerical',
    prompt: 'Cobble Lane Books recorded ten weeks of advertising spend (B2:B11) and sales (C2:C11). In E2, calculate the intercept of the least-squares line of sales on advertising.',
    sheet: adSheet,
    cell: 'E2', answer: '=INTERCEPT(C2:C11,B2:B11)',
    alt: ['=AVERAGE(C2:C11)-SLOPE(C2:C11,B2:B11)*AVERAGE(B2:B11)', '=FORECAST.LINEAR(0,C2:C11,B2:B11)'],
    view: 'A1:E11',
    formats: { B: '$#,##0', C: '$#,##0', E: '$#,##0.00' },
    widths: { B: 12 },
    wrong: [
      { formula: '=INTERCEPT(B2:B11,C2:C11)', say: 'INTERCEPT takes known_y’s first. Sales are the y’s: <x>=INTERCEPT(C2:C11,B2:B11)</x>.' },
      { formula: '=SLOPE(C2:C11,B2:B11)', say: 'That is the slope, the extra sales per dollar of advertising. The intercept is the predicted sales at zero advertising.' },
    ],
    solution: `<x>=INTERCEPT(C2:C11,B2:B11)</x> ≈ $${AD.a.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}: the predicted sales in a week with no advertising. No week had less than $100 of advertising, so this is an extrapolation; the slope, about $${AD.b.toFixed(2)} of sales per advertising dollar, is the more useful number, and it shows association, not that advertising caused the sales.`,
  },
  {
    id: 'b03-m3-12', lesson: 'descriptive-statistics-and-regression', type: 'classify', kind: 'conceptual',
    prompt: 'A column of 500 order values contains one order a hundred times larger than any other. You remove it. How does each statistic respond?',
    items: ['Mean', 'Median', 'Standard deviation', 'Interquartile range', 'Maximum', 'Skewness'],
    categories: ['Changes a lot', 'Barely changes'],
    answer: [0, 1, 0, 1, 0, 0],
    feedback: {
      1: 'The median depends on the order of the values; removing the largest shifts the middle by half a place among similar values.',
      3: 'The quartiles also depend on position, so the middle half hardly moves.',
      5: 'Skewness cubes each value’s distance from the mean, so one extreme value dominates it.',
    },
    solution: 'The mean, standard deviation, maximum and skewness use the size of every value, and one huge value dominates them. The median and IQR depend on positions in the sorted list, so removing one value at the top barely moves them.',
  },
];
