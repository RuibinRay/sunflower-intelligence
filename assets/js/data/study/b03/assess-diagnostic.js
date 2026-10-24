// assess-diagnostic.js — B03 course diagnostic: three items per module, each written so that it needs that module’s
// spreadsheet skill, not B01 or B02 knowledge, so that a student who already has a module’s skills gets its items right
// and one who doesn’t misses most of them. Module 1: mixed references in a filled index table, IF with OR, COUNTIFS with
// a criterion joined to a cell. Module 2: an exact-match lookup on an unsorted table, SORT with FILTER, what a
// PivotTable’s Count counts. Module 3: choosing a chart for a relationship, RSQ, reading a coefficient’s 95% limits.
// Module 4: Goal Seek’s dialog and its answer, Solver’s solving method, a dashboard visual against a target.
// New questions on businesses used nowhere else on the site, not copies of lesson exercises, module tests, the final or
// the project. No hints; solutions are shown on review. Every business, record and number is fictional; every num item’s
// `check` recomputes its answer, and every formula item is marked by its results on the sheet and on changed copies.

const MONEY = '$#,##0.00';
const sum = (a) => a.reduce((s, x) => s + x, 0);
const mean = (a) => sum(a) / a.length;
const correl = (x, y) => {
  const mx = mean(x), my = mean(y);
  const sxy = sum(x.map((v, i) => (v - mx) * (y[i] - my)));
  return sxy / Math.sqrt(sum(x.map((v) => (v - mx) ** 2)) * sum(y.map((v) => (v - my) ** 2)));
};
const money = (x) => `$${x.toFixed(2)}`;
/** Sheet cells for a header row in row 1 and records below, starting in column A. */
const grid = (head, rows) => {
  const cells = {};
  head.forEach((h, j) => { cells[`${String.fromCharCode(65 + j)}1`] = h; });
  rows.forEach((r, i) => r.forEach((v, j) => { if (v != null) cells[`${String.fromCharCode(65 + j)}${i + 2}`] = v; }));
  return cells;
};

// Pebblestone Print Studio: orders, with the delivery fee in G1 and the free-delivery threshold in G2
const PRINT = [['P-201', 45.00, 'retail'], ['P-202', 60.00, 'retail'], ['P-203', 28.50, 'trade'], ['P-204', 112.00, 'retail'],
  ['P-205', 59.99, 'retail'], ['P-206', 75.00, 'trade'], ['P-207', 18.00, 'retail'], ['P-208', 40.00, 'trade']];
const FEE = 6.5, FREE_FROM = 60;
// Cairnbrook Language School: students, level and attendance
const STUDENTS = [['S-01', 'Intermediate', 0.92], ['S-02', 'Beginner', 0.85], ['S-03', 'Intermediate', 0.80], ['S-04', 'Advanced', 0.95],
  ['S-05', 'Intermediate', 0.64], ['S-06', 'Beginner', 0.71], ['S-07', 'Intermediate', 0.88], ['S-08', 'Advanced', 0.79],
  ['S-09', 'Intermediate', 0.79], ['S-10', 'Beginner', 0.90], ['S-11', 'Intermediate', 1.00], ['S-12', 'Advanced', 0.83],
  ['S-13', 'Intermediate', 0.58], ['S-14', 'Beginner', 0.80]];
const keen = STUDENTS.filter((s) => s[1] === 'Intermediate' && s[2] >= 0.8);
// Oakmere Vet Clinic: an unsorted treatment list and eight visits
const TREATMENTS = [['VAC-01', 'Annual vaccination', 68], ['DEN-02', 'Dental scale and polish', 245], ['CON-01', 'Consultation', 52],
  ['MIC-01', 'Microchipping', 29], ['NEU-03', 'Neutering (cat)', 135], ['BLD-02', 'Blood test', 96], ['XRY-01', 'X-ray', 180]];
const VISITS = [['V-801', 'CON-01'], ['V-802', 'VAC-01'], ['V-803', 'BLD-02'], ['V-804', 'CON-01'], ['V-805', 'XRY-01'],
  ['V-806', 'MIC-01'], ['V-807', 'DEN-02'], ['V-808', 'NEU-03']];
const vet = { ...grid(['Visit', 'Treatment', 'Price'], VISITS), E1: 'Code', F1: 'Treatment', G1: 'Price' };
TREATMENTS.forEach((t, i) => { vet[`E${i + 2}`] = t[0]; vet[`F${i + 2}`] = t[1]; vet[`G${i + 2}`] = t[2]; });
// Pipit Plant Nursery: plants and their type
const PLANTS = [['Rosemary', 'Herb', 4.50], ['Hosta', 'Perennial', 7.95], ['Box hedge', 'Shrub', 6.50], ['Basil', 'Herb', 3.25],
  ['Salvia', 'Perennial', 6.25], ['Thyme', 'Herb', 3.95], ['Hydrangea', 'Shrub', 14.00], ['Mint', 'Herb', 3.25],
  ['Fern', 'Perennial', 8.50], ['Chives', 'Herb', 2.95], ['Camellia', 'Shrub', 16.50], ['Oregano', 'Herb', 3.50]];
const herbs = PLANTS.filter((p) => p[1] === 'Herb').map((p) => p[0]).sort();
// Gullhaven Ice Cream Kiosk: 14 days of temperature and cones sold
const TEMPS = [18, 21, 24, 19, 27, 30, 22, 25, 17, 29, 23, 26, 20, 28];
const CONES = [140, 182, 230, 150, 260, 315, 190, 248, 128, 290, 205, 240, 175, 296];
const r = correl(TEMPS, CONES);
// Primula Music School: one month
const MUSIC = { pupils: 120, cost: 18, fixed: 4300, target: 2000 };
const fee = (MUSIC.target + MUSIC.fixed) / MUSIC.pupils + MUSIC.cost;

export const items = [
  // ================================================================ Module 1: formulas that work
  {
    id: 'b03-dg-1', lesson: 'cells-and-formulas', type: 'mc', kind: 'conceptual',
    prompt: 'Hedgerow Farm Shop (fictional) keeps the prices of five products in rows 2 to 6, with January in column B through to May in column F. In H2 it wants February’s price as an index of the product’s January price (January = 100), in a formula that, filled across to K2 and down to K6, gives every product’s index for February to May. Which formula should go in H2?',
    options: ['<x>=C2/$B2*100</x>', '<x>=C2/$B$2*100</x>', '<x>=C2/B$2*100</x>', '<x>=C2/B2*100</x>'],
    answer: 0,
    feedback: {
      1: '$B$2 fixes the row as well as the column, so filled down, every product would be compared with the first product’s January price.',
      2: 'B$2 fixes the row and frees the column: filled down, every product is compared with the first product, and filled across, the base moves on from January to February, March …',
      3: 'With no $ the base moves with the formula: filled across, each month is compared with the month before it, not with January.',
    },
    solution: '<x>=C2/$B2*100</x>. The base must stay in column B (January) as the formula is filled across, so the column is fixed with $; it must move to rows 3, 4 … as the formula is filled down, so the row is left free. Filled to K6, the last cell reads <x>=F6/$B6*100</x>: the fifth product’s May price against its own January price.',
  },
  {
    id: 'b03-dg-2', lesson: 'functions-and-logic', type: 'formula', kind: 'applied',
    prompt: 'Pebblestone Print Studio (fictional) charges the delivery fee in G1 on every order, except that delivery is free for trade accounts (column C says trade) and for orders worth at least the amount in G2. In D2, write the delivery charge for the first order, in a formula that will be filled down to D9.',
    sheet: { cells: { ...grid(['Order', 'Value', 'Account', 'Delivery'], PRINT), F1: 'Delivery fee', G1: FEE, F2: 'Free from', G2: FREE_FROM } },
    cell: 'D2', fill: 'D2:D9', view: 'A1:G9',
    formats: { B: MONEY, D: MONEY, G1: MONEY, G2: MONEY }, widths: { C: 10, F: 13 },
    answer: '=IF(OR(C2="trade",B2>=$G$2),0,$G$1)',
    alt: ['=IF(OR(B2>=$G$2,C2="trade"),0,$G$1)', '=IF(AND(C2<>"trade",B2<$G$2),$G$1,0)', '=IF(C2="trade",0,IF(B2>=$G$2,0,$G$1))', '=IFS(C2="trade",0,B2>=$G$2,0,TRUE,$G$1)'],
    wrong: [
      { formula: '=IF(AND(C2="trade",B2>=$G$2),0,$G$1)', say: 'AND makes delivery free only for trade orders that also reach the amount in G2. Either condition is enough, which is OR.' },
      { formula: '=IF(OR(C2="trade",B2>$G$2),0,$G$1)', say: '“At least” includes the amount itself: P-202, worth exactly $60.00, travels free. Use >=.' },
      { formula: '=IF(OR(C2="trade",B2>=G2),0,G1)', say: 'Filled down, G1 and G2 move to G2, G3 … and the lower rows read the wrong cells. Fix both inputs with $.' },
      { formula: '=IF(OR(C2="trade",B2>=60),0,6.5)', say: 'The numbers are typed into the formula, so it stops being right as soon as the fee or the threshold in G1 and G2 changes. Refer to the cells, with $.' },
    ],
    solution: `<x>=IF(OR(C2="trade",B2>=$G$2),0,$G$1)</x>. OR is TRUE when either condition holds, and then delivery is free; otherwise the order pays the fee in G1. P-202 (${money(PRINT[1][1])}, retail) travels free because “at least” includes ${money(FREE_FROM)}; P-205 (${money(PRINT[4][1])}, retail) pays ${money(FEE)}; every trade order is free, whatever its value.`,
  },
  {
    id: 'b03-dg-3', lesson: 'conditional-sums-and-counts', type: 'formula', kind: 'numerical',
    prompt: 'Cairnbrook Language School (fictional) lists its students’ level in column B and attendance in column C. F1 holds a level and F2 a minimum attendance. In F4, write a formula that counts the students at the level in F1 whose attendance is at least the figure in F2, so that the count follows whatever F1 and F2 hold.',
    sheet: { cells: { ...grid(['Student', 'Level', 'Attendance'], STUDENTS), E1: 'Level', F1: 'Intermediate', E2: 'Minimum attendance', F2: 0.8, E4: 'Students' }, vary: { F1: ['Beginner', 'Advanced'] } },
    cell: 'F4', view: 'A1:F15',
    formats: { C: '0%', F2: '0%' }, widths: { B: 13, C: 11, E: 19, F: 13 },
    answer: '=COUNTIFS(B2:B15,F1,C2:C15,">="&F2)',
    alt: ['=COUNTIFS(C2:C15,">="&F2,B2:B15,F1)', '=SUMPRODUCT((B2:B15=F1)*(C2:C15>=F2))'],
    wrong: [
      { formula: '=COUNTIFS(B2:B15,F1,C2:C15,">=F2")', say: 'Inside the quotes F2 is only text, so no attendance matches and the count is 0. Join the operator to the cell: <x>">="&F2</x>.' },
      { formula: '=COUNTIF(B2:B15,F1)', say: 'That counts every Intermediate student, whatever their attendance. Add the attendance criterion with COUNTIFS.' },
      { formula: '=COUNTIFS(B2:B15,F1,C2:C15,">"&F2)', say: '“At least 80%” includes 80% itself: S-03 counts. Use <x>">="</x>.' },
    ],
    solution: `<x>=COUNTIFS(B2:B15,F1,C2:C15,">="&F2)</x> returns ${keen.length}: ${keen.map((s) => s[0]).join(', ')}. S-03 has exactly 80% and counts. Each criteria range is paired with its criterion, and the operator in quotes is joined to the cell with &, so changing F1 or F2 changes the count.`,
  },

  // ================================================================ Module 2: finding and summarising data
  {
    id: 'b03-dg-4', lesson: 'lookups', type: 'formula', kind: 'applied',
    prompt: 'Oakmere Vet Clinic (fictional) keeps its treatment list in E1:G8, not sorted in any order. In C2, return the price of the treatment code in B2 from the list, and fill it down to C9.',
    sheet: { cells: vet }, cell: 'C2', fill: 'C2:C9', view: 'A1:G9',
    formats: { C: MONEY, G: MONEY }, widths: { B: 11, C: 10, F: 22 },
    answer: '=VLOOKUP(B2,$E$2:$G$8,3,FALSE)',
    alt: ['=VLOOKUP(B2,$E$2:$G$8,3,0)', '=XLOOKUP(B2,$E$2:$E$8,$G$2:$G$8)', '=INDEX($G$2:$G$8,MATCH(B2,$E$2:$E$8,0))'],
    wrong: [
      { formula: '=VLOOKUP(B2,$E$2:$G$8,3)', say: 'Without FALSE, VLOOKUP makes an approximate match, which assumes the codes are sorted; on this list it returns wrong prices or #N/A without warning. Add FALSE.' },
      { formula: '=VLOOKUP(B2,E2:G8,3,FALSE)', say: 'Without $ the table slides down as the formula is filled, and lower rows can’t find the codes near its top. Lock it: $E$2:$G$8.' },
      { formula: '=VLOOKUP(B2,$E$2:$G$8,2,FALSE)', say: 'Column 2 of the table is the treatment’s name; the price is in column 3.' },
    ],
    solution: `<x>=VLOOKUP(B2,$E$2:$G$8,3,FALSE)</x>, filled to C9. FALSE asks for an exact match, which works on an unsorted list; 3 returns the third column of the table; $ keeps the table fixed. V-801, a consultation, costs ${money(TREATMENTS[2][2])}. <x>=XLOOKUP(B2,$E$2:$E$8,$G$2:$G$8)</x> (exact by default) or INDEX with MATCH(…,0) work too.`,
  },
  {
    id: 'b03-dg-5', lesson: 'tables-and-cleaning', type: 'formula', kind: 'applied',
    prompt: 'Pipit Plant Nursery (fictional) lists its plants in A2:A13 and their type in B2:B13. In E2, write one formula that lists the names of the herbs, sorted A to Z, spilling down from E2. (SORT and FILTER need Excel for Microsoft 365, 2021 or 2024.)',
    sheet: { cells: { ...grid(['Plant', 'Type', 'Price'], PLANTS), E1: 'Herbs, A to Z' } },
    cell: 'E2', view: 'A1:E13',
    formats: { C: MONEY }, widths: { A: 11, B: 10, E: 14 },
    answer: '=SORT(FILTER(A2:A13,B2:B13="Herb"))',
    alt: ['=SORT(FILTER(A2:A13,B2:B13="herb"))', '=SORTBY(FILTER(A2:A13,B2:B13="Herb"),FILTER(A2:A13,B2:B13="Herb"))', '=SORT(FILTER(A2:A13,B2:B13="Herb"),1,1)'],
    wrong: [
      { formula: '=FILTER(A2:A13,B2:B13="Herb")', say: 'FILTER keeps the list’s own order (Rosemary first). Wrap it in SORT to put the herbs A to Z.' },
      { formula: '=SORT(A2:A13)', say: 'That sorts every plant. FILTER first, to keep only the rows whose type is Herb.' },
      { formula: '=SORT(FILTER(A2:A13,B2:B13="Herb"),1,-1)', say: 'A sort_order of −1 sorts Z to A. Leave it out (or use 1) for A to Z.' },
      { formula: '=SORT(FILTER(A2:B13,B2:B13="Herb"))', say: 'Filtering A2:B13 returns the type column too. Filter the names in column A only.' },
    ],
    solution: `<x>=SORT(FILTER(A2:A13,B2:B13="Herb"))</x>. FILTER returns the names whose type is Herb, and SORT puts them in ascending order, its default. The result spills into E2:E${herbs.length + 1}: ${herbs.join(', ')}. Add a herb to the list and the result grows by itself.`,
  },
  {
    id: 'b03-dg-6', lesson: 'pivot-tables', type: 'mc', kind: 'conceptual',
    prompt: 'Puffin Point Ferries (fictional) keeps 100 bookings in an Excel table. A PivotTable built on it, just refreshed, shows Count of booking_id as 100. The manager adds email to the Values area too, and Count of email shows 92. What explains the 92?',
    options: [
      'Eight bookings have a blank email, and Count counts only non-empty cells.',
      'Eight email addresses repeat, and Count counts each different value once.',
      'Count of a text field counts only the values that Excel can read as numbers.',
      'A filter in the Filters area applies to the email field but not to booking_id.',
    ],
    answer: 0,
    feedback: {
      1: 'That would be Distinct Count, which needs the Data Model. Count counts every non-empty value, repeats included.',
      2: 'That is the COUNT function (and the Count Numbers summary). A PivotTable’s Count works like COUNTA: text counts.',
      3: 'A filter in the Filters area applies to the whole PivotTable, so both counts would fall together.',
    },
    solution: 'A PivotTable’s Count works like COUNTA: it counts non-empty values, not records. booking_id is never blank, so it counts all 100 bookings; email is blank for 8 of them. To count records, count a field that is never blank, such as the ID.',
  },

  // ================================================================ Module 3: showing and describing data
  {
    id: 'b03-dg-7', lesson: 'charts-and-conditional-formatting', type: 'mc', kind: 'conceptual',
    prompt: 'Swiftpedal Couriers (fictional) wants to know whether longer deliveries take proportionally longer. For each of its last 300 deliveries it has the distance (km) and the time taken (minutes). Which chart answers the question?',
    options: [
      'A scatter chart, with each delivery’s distance on the horizontal axis and its minutes on the vertical',
      'A line chart of minutes, with the 300 deliveries along the horizontal axis in the order they were made',
      'A histogram of delivery minutes, with bins 10 minutes wide, so the spread of times shows clearly',
      'A pie chart of the total minutes in each distance band, with one slice for every 2 km band',
    ],
    answer: 0,
    feedback: {
      1: 'Joining deliveries in the order they were made shows a sequence, not how minutes depend on distance; distance isn’t on the chart at all.',
      2: 'A histogram shows the distribution of one variable. It can’t show how time changes with distance.',
      3: 'A pie shows the parts of one whole; total minutes per band mixes the number of deliveries with the time each one takes.',
    },
    solution: 'Two numeric variables measured on the same deliveries is a relationship question: a scatter chart, one point per delivery at (distance, minutes). Points that rise along a straight band suggest time grows in proportion to distance, and a trendline can then summarise it.',
  },
  {
    id: 'b03-dg-8', lesson: 'descriptive-statistics-and-regression', type: 'formula', kind: 'numerical',
    prompt: 'Gullhaven Ice Cream Kiosk (fictional) recorded the day’s top temperature (°C, column B) and cones sold (column C) on 14 days. In E2, calculate R²: the share of the variation in cones sold that a straight line on temperature accounts for.',
    sheet: { cells: { ...grid(['Day', 'Temperature', 'Cones sold'], TEMPS.map((t, i) => [i + 1, t, CONES[i]])), E1: 'R²' } },
    cell: 'E2', view: 'A1:E15',
    formats: { E2: '0.000' }, widths: { B: 12, C: 11 },
    answer: '=RSQ(C2:C15,B2:B15)',
    alt: ['=RSQ(B2:B15,C2:C15)', '=CORREL(B2:B15,C2:C15)^2', '=PEARSON(B2:B15,C2:C15)^2'],
    wrong: [
      { formula: '=CORREL(B2:B15,C2:C15)', say: 'CORREL gives r, the correlation coefficient. The share of variation is r²: square it, or use RSQ.' },
      { formula: '=SLOPE(C2:C15,B2:B15)', say: 'That is the slope, the extra cones per degree. The share of variation the line accounts for is R², which RSQ returns.' },
    ],
    solution: `<x>=RSQ(C2:C15,B2:B15)</x> ≈ ${(r * r).toFixed(3)}: about ${Math.round(r * r * 100)}% of the day-to-day variation in cones sold lines up with temperature along a straight line. It is the square of <x>=CORREL(B2:B15,C2:C15)</x> (r ≈ ${r.toFixed(3)}). R² describes these 14 days; it doesn’t show that heat causes sales, and it isn’t the accuracy of a forecast.`,
  },
  {
    id: 'b03-dg-9', lesson: 'descriptive-statistics-and-regression', type: 'mc', kind: 'conceptual',
    prompt: 'Hollowbrook Brewery (fictional) regressed weekly taproom sales on weekly advertising spend for 26 weeks. The spend row of the Analysis ToolPak’s Regression output shows Coefficients 1.8, Standard Error 1.5, t Stat 1.2, P-value 0.24, Lower 95% −1.3 and Upper 95% 4.9. Which conclusion does the output support?',
    options: [
      'The 95% limits run from −1.3 to 4.9 and include 0, so these weeks don’t show that sales rise with spend.',
      'Each extra dollar of advertising brings in $1.80 of taproom sales, so the brewery should advertise more.',
      'Advertising spend explains 24% of the week-to-week variation in taproom sales, as its P-value of 0.24 shows.',
      'There is a 76% chance that spending more on advertising really does raise the brewery’s taproom sales.',
    ],
    answer: 0,
    feedback: {
      1: 'The 1.8 is only an estimate: its 95% limits run from a fall of $1.30 to a rise of $4.90 per dollar, so these data can’t tell a positive effect from none.',
      2: 'R Square, not the P-value, is the share of variation explained. The P-value tests whether the slope could be 0.',
      3: 'A P-value isn’t the chance that the relationship is real. It is the probability of a slope estimate at least this far from 0 if the true slope were 0.',
    },
    solution: 'The estimated slope, 1.8, has a Standard Error almost as large (t Stat = 1.8 ÷ 1.5 = 1.2). The P-value of 0.24 is far above the usual 0.05, and the 95% limits include 0: the data are consistent with no linear relationship. The brewery shouldn’t plan its spending on the 1.8; it needs more weeks of data or a planned test. B04 explains the reasoning behind p-values and intervals.',
  },

  // ================================================================ Module 4: deciding with a spreadsheet
  {
    id: 'b03-dg-10', lesson: 'what-if-analysis', type: 'steps', kind: 'numerical',
    prompt: `Primula Music School (fictional) models one month: pupils in B2 (${MUSIC.pupils}), the monthly fee per pupil in B3, the cost per pupil in B4 ($${MUSIC.cost}: sheet music and a share of room hire), fixed costs in B5 ($${MUSIC.fixed.toLocaleString('en-US')}) and the profit in B7, <x>=B2*(B3-B4)-B5</x>. The owner wants the fee that gives a profit of $${MUSIC.target.toLocaleString('en-US')}.`,
    steps: [
      {
        id: 'b03-dg-10-s1', type: 'fill',
        prompt: 'Complete the Goal Seek dialog.',
        text: 'Set cell: [[0]]. To value: [[1]]. By changing cell: [[2]].',
        blanks: [
          { options: ['B7', 'B3', 'B2'], answer: 0 },
          { options: ['2000', 'B7', '0'], answer: 0 },
          { options: ['B3', 'B7', 'B2', 'B4'], answer: 0 },
        ],
        solution: 'Set cell is the formula whose result you want (the profit, B7); To value is the result wanted, typed as a number (2000); By changing cell is the input Goal Seek may change (the fee, B3). Goal Seek changes only one input.',
      },
      {
        id: 'b03-dg-10-s2', type: 'num',
        prompt: 'What fee will Goal Seek put in B3? Check it by algebra and give it to the cent.',
        answer: 70.5, check: () => (MUSIC.target + MUSIC.fixed) / MUSIC.pupils + MUSIC.cost, unit: '$', places: 2, tol: 0.005,
        wrong: [
          { value: 52.5, say: 'That is the margin per pupil the profit needs, fee − cost. Add the $18 cost per pupil to get the fee.' },
          { value: 34.67, say: 'You left out the fixed costs: profit = pupils × (fee − cost) − fixed costs.' },
          { value: 53.83, say: 'That fee makes the profit 0 (break-even). The target is a profit of $2,000.' },
        ],
        solution: `${MUSIC.pupils} × (fee − ${MUSIC.cost}) − ${MUSIC.fixed.toLocaleString('en-US')} = ${MUSIC.target.toLocaleString('en-US')}, so fee − ${MUSIC.cost} = ${(MUSIC.target + MUSIC.fixed).toLocaleString('en-US')} ÷ ${MUSIC.pupils} = ${((MUSIC.target + MUSIC.fixed) / MUSIC.pupils).toFixed(2)}, and the fee is ${money(fee)}.`,
      },
    ],
    solution: `Goal Seek sets B7 to 2000 by changing B3. It finds the fee by trial, and algebra confirms it: ${MUSIC.pupils} × (fee − ${MUSIC.cost}) − ${MUSIC.fixed.toLocaleString('en-US')} = ${MUSIC.target.toLocaleString('en-US')} gives a fee of ${money(fee)}.`,
  },
  {
    id: 'b03-dg-11', lesson: 'what-if-analysis', type: 'mc', kind: 'conceptual',
    prompt: 'Zephyr Sailing Tours (fictional) sets one price per seat for its summer trips. From past seasons it estimates bookings as 400 − 5 × price, so its objective cell holds the revenue, <x>=B2*(400-5*B2)</x>, with the price in B2 as the decision variable. Which Solver solving method fits this model?',
    options: [
      'GRG Nonlinear, because revenue is a smooth curve in the price, not a straight line',
      'Simplex LP, because the model has only one decision variable and a single formula',
      'Evolutionary, because the demand estimate is uncertain and changes from season to season',
      'Simplex LP with an integer constraint on B2, because the price is set in whole dollars',
    ],
    answer: 0,
    feedback: {
      1: 'Simplex LP is for linear models. Price × (400 − 5 × price) contains the price squared, so the model isn’t linear, however few variables it has.',
      2: 'Evolutionary is for non-smooth models, with jumps or steps, such as IF applied to a decision variable. An uncertain estimate doesn’t make the formula non-smooth.',
      3: 'An integer constraint doesn’t make the revenue formula linear: it still contains the price squared.',
    },
    solution: 'Revenue = price × (400 − 5 × price) = 400 × price − 5 × price²: a smooth, curved function of the decision variable. Microsoft’s guidance: Simplex LP for linear problems, GRG Nonlinear for smooth nonlinear ones, Evolutionary for non-smooth ones. GRG Nonlinear finds the peak at $40 a seat: 200 bookings and $8,000 of revenue.',
  },
  {
    id: 'b03-dg-12', lesson: 'dashboards', type: 'mc', kind: 'applied',
    prompt: 'The owner of Wren Street Pharmacy (fictional) wants one visual on her dashboard to answer: “Month by month this year, are sales on track against the monthly target?” Which is best?',
    options: [
      'A column chart of each month’s sales in calendar order, with the monthly target drawn as a line',
      'Twelve gauges, one for each month, each with its needle pointing at that month’s sales as a share of target',
      'A pie chart with one slice per month, so the owner can see which months contributed most to the year',
      'A 3-D column chart of sales and target side by side, with the value axis starting at the lowest month',
    ],
    answer: 0,
    feedback: {
      1: 'Each gauge takes a lot of space for one number, and twelve of them hide the month-to-month pattern that one chart shows.',
      2: 'A pie shows shares of a whole; it has no place for the target and loses the order of the months.',
      3: '3-D distorts the heights of the columns, and an axis that doesn’t start at zero exaggerates the gaps between them.',
    },
    solution: 'The question compares each month with its target, in time order: columns for actual sales, with the target as a line (a combo chart), so every month’s shortfall or excess is visible at a glance. Start the axis at zero, label it, and give the chart a title that states the finding.',
  },
];

// If the student scores at least 80% on the items for every module before the one named, suggest starting there.
export const route = [{ module: 2, ifAtLeast: 0.8 }, { module: 3, ifAtLeast: 0.8 }, { module: 4, ifAtLeast: 0.8 }];
