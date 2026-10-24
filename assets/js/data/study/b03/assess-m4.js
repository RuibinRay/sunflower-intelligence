// assess-m4.js — B03 module 4 test: Deciding with a spreadsheet (what-if-analysis, dashboards).
// New businesses and angles, not copies of lesson exercises. No hints; solutions are shown when the student reviews
// the test. Every business, person and number is fictional. Every num item's `check` recomputes its answer.

const serial = (iso) => (Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) - Date.UTC(1899, 11, 30)) / 86400000;
const M = '$#,##0.00';

// Pennywhistle Bakery: trays of sourdough (S) and croissants (C), by brute force over whole trays
const bakery = () => {
  let best = null;
  for (let S = 0; S <= 40; S++) for (let C = 0; C <= 12; C++) {
    if (S + 1.5 * C <= 30 && 2 * S + C <= 39) { const z = 22 * S + 32 * C; if (!best || z > best.z) best = { S, C, z }; }
  }
  return best;
};

// Quillfeather Books: sales in September to November 2026
const SALES = [
  ['2026-09-03', 'Fiction', 24.5], ['2026-09-07', 'Children', 18], ['2026-09-12', 'Travel', 32], ['2026-09-18', 'Children', 41.5],
  ['2026-09-25', 'Fiction', 16], ['2026-09-29', 'Children', 22.5], ['2026-10-02', 'Fiction', 38], ['2026-10-04', 'Children', 27.5],
  ['2026-10-09', 'Travel', 45], ['2026-10-11', 'Children', 33], ['2026-10-16', 'Fiction', 19.5], ['2026-10-21', 'Children', 12],
  ['2026-10-24', 'Travel', 28], ['2026-10-28', 'Children', 30.5], ['2026-10-31', 'Fiction', 52], ['2026-11-02', 'Children', 47],
];
const salesCells = Object.fromEntries([['A1', 'Date'], ['B1', 'Category'], ['C1', 'Amount'],
  ...SALES.flatMap(([d, c, a], i) => [[`A${i + 2}`, serial(d)], [`B${i + 2}`, c], [`C${i + 2}`, a]])]);

// Stonecrop Climbing Gym: new members by month, 2026
const JOINERS = [42, 38, 51, 47, 44, 39, 35, 33, 58, 61, 49, 40];
const joinCells = Object.fromEntries([['A1', 'Month'], ['B1', 'New members'],
  ...JOINERS.flatMap((n, i) => [[`A${i + 2}`, serial(`2026-${String(i + 1).padStart(2, '0')}-01`)], [`B${i + 2}`, n]])]);

export const items = [
  // ---------------------------------------------------------------- what-if analysis
  {
    id: 'b03-m4-1', lesson: 'what-if-analysis', type: 'formula', kind: 'numerical',
    prompt: 'Stonecrop Climbing Gym is weighing its monthly fee. Possible fees run down column A and numbers of members across row 5; the card and payment fees, a share of revenue, are in B1 and the fixed costs of a month (rent, staff and insurance) in B2. In B6, write one formula for the monthly profit after card fees and fixed costs that can be filled across and down to E9.',
    sheet: { cells: {
      A1: 'Card and payment fees (share of revenue)', B1: 0.025, A2: 'Fixed costs per month', B2: 9500,
      A5: 'Monthly fee ↓   members →', B5: 300, C5: 350, D5: 400, E5: 450,
      A6: 39, A7: 45, A8: 49, A9: 55,
    } },
    cell: 'B6', fill: 'B6:E9', view: 'A1:E9', widths: { A: 36 },
    formats: { B1: '0.0%', B2: M, A: M, A1: 'general', A2: 'general', A5: 'general', B6: M, C6: M, D6: M, E6: M, B7: M, C7: M, D7: M, E7: M, B8: M, C8: M, D8: M, E8: M, B9: M, C9: M, D9: M, E9: M },
    answer: '=B$5*$A6*(1-$B$1)-$B$2',
    alt: ['=$A6*B$5*(1-$B$1)-$B$2', '=$A6*B$5-$A6*B$5*$B$1-$B$2'],
    wrong: [
      { formula: '=B5*A6*(1-B1)-B2', say: 'Filled right or down, every reference moves. Fix the row of the members (B$5), the column of the fees ($A6), and the rate and the fixed costs ($B$1, $B$2).' },
      { formula: '=$B5*A$6*(1-$B$1)-$B$2', say: 'The anchors are the wrong way round: that keeps column B of the members and row 6 of the fees. Members run along row 5 (B$5); fees run down column A ($A6).' },
      { formula: '=B$5*$A6*(1-$B$1)', say: 'That is revenue after card fees. Profit also takes off the month’s fixed costs in $B$2.' },
      { formula: '=B$5*$A6*(1-$B$1-$B$2)', say: 'B2 is a dollar amount, not a share: subtract it once from the revenue after card fees, outside the brackets.' },
    ],
    solution: '<x>=B$5*$A6*(1-$B$1)-$B$2</x>. B6 = 300 × 39 × 0.975 − 9,500 = $1,907.50; E9 = 450 × 55 × 0.975 − 9,500 = $14,631.25. B$5 keeps the members’ row, $A6 keeps the fees’ column, and $B$1 and $B$2 stay put as the formula is filled.',
  },
  {
    id: 'b03-m4-2', lesson: 'what-if-analysis', type: 'num', kind: 'numerical',
    prompt: 'Primrose Flowers prices a wedding package as a $250 design fee plus a price per table, for 15 tables. Its direct costs are $38 of flowers per table and $180 for delivery and setting up. What price per table gives a contribution margin ratio of exactly 40%? This is the answer Goal Seek should return. Give it to the cent.',
    answer: 66.67, check: () => ((15 * 38 + 180) / (1 - 0.4) - 250) / 15, unit: '$', places: 2, tol: 0.005,
    wrong: [
      { value: 53.33, say: 'That marks the costs up by 40% (750 × 1.4). A 40% ratio is measured on revenue: costs must be 60% of it, so revenue = 750 ÷ 0.6.' },
      { value: 83.33, say: 'That divides the whole revenue needed by 15 tables. Take off the $250 design fee first: it doesn’t depend on the table price.' },
      { value: 108.33, say: 'That divides the costs by 0.4, which would make costs 40% of revenue. Divide by 1 − 0.4.' },
    ],
    solution: 'Direct costs = 15 × 38 + 180 = $750. For a 40% ratio, costs are 60% of revenue: revenue = 750 ÷ 0.6 = $1,250. Price per table = (1,250 − 250) ÷ 15 = $66.67. Check: revenue 250 + 15 × 66.67 = $1,250.05, contribution $500.05, a ratio of 40.0%.',
  },
  {
    id: 'b03-m4-3', lesson: 'what-if-analysis', type: 'mc', kind: 'conceptual',
    prompt: 'Pennywhistle Bakery’s profit model has the number of oven batches a day in C2 and the price of a loaf in C3. To build a two-variable data table, its manager types batches down A6:A12 and loaf prices across B5:F5, with =C15 (the profit) in A5. In the Data Table dialog, what should she enter?',
    options: [
      'Row input cell C3 and Column input cell C2.',
      'Row input cell C2 and Column input cell C3.',
      'Row input cell B5 and Column input cell A6.',
      'Only a Column input cell, C2, because data tables vary one input at a time.',
    ],
    answer: 0,
    feedback: {
      1: 'That swaps them. The values in the top row (prices) are substituted into the Row input cell, so it must be the price cell, C3; the left column’s batches go into C2.',
      2: 'Input cells are the model’s own inputs, which the values are substituted into, not the first cells of the table.',
      3: 'A two-variable data table varies two inputs at once and needs both a row and a column input cell.',
    },
    solution: 'The Row input cell takes the values across the table’s top row (loaf prices) and the Column input cell takes the values down its left column (batches). So Row input cell C3, Column input cell C2. Swapping them substitutes prices into the batches cell and gives a table that looks plausible and is wrong.',
  },
  {
    id: 'b03-m4-4', lesson: 'what-if-analysis', type: 'num', kind: 'numerical',
    prompt: 'Pennywhistle Bakery bakes trays of sourdough (S) and croissants (C) for a market day. A sourdough tray contributes $22 and needs 1 oven hour and 2 baker hours; a croissant tray contributes $32 and needs 1.5 oven hours and 1 baker hour. There are 30 oven hours and 39 baker hours, and butter for at most 12 croissant trays. Without integer constraints Solver gives 14.25 sourdough and 10.5 croissant trays, $649.50. With whole trays, what is the largest total contribution?',
    answer: 648, check: () => bakery().z, unit: '$', places: 2, tol: 0.5,
    wrong: [
      { value: 649.5, say: 'That is the answer with fractions of trays. Trays come whole: add the integer constraint (or list the whole-number plans) and solve again.' },
      { value: 660, say: 'Rounding to 14 sourdough and 11 croissant trays needs 14 + 16.5 = 30.5 oven hours, more than the 30 available. That plan is infeasible.' },
      { value: 628, say: 'Rounding both down (14 and 10) is feasible but not the best whole-number plan. Check the plans near the corner, including 12 and 12.' },
    ],
    solution: 'The best whole-number plan is 12 sourdough and 12 croissant trays: 12 × 22 + 12 × 32 = $648. It uses all 30 oven hours (12 + 18) and all the butter, with 3 baker hours spare. Rounding the fractional answer fails both ways: 14 and 11 breaks the oven limit, and 14 and 10 earns only $628. The next best plan, 13 and 11, earns $638.',
  },
  {
    id: 'b03-m4-5', lesson: 'what-if-analysis', type: 'multi', kind: 'conceptual',
    prompt: 'Oakhollow Joinery’s Solver model chooses how many tables, chairs and benches to make in a week, with integer constraints. The Answer Report shows oak used 396 of 400 board feet, machine hours 60 of 60 and finishing hours 80 of 80. Select all the statements that are true.',
    options: [
      'Machine hours and finishing hours are binding constraints.',
      'Oak has 4 board feet of slack.',
      'A Sensitivity Report for this model would give the shadow price of finishing hours.',
      'Oak is a binding constraint.',
      'Had Solver reported that the objective cell’s values do not converge, a constraint would probably be missing.',
      'If the joinery had promised more tables than its oak can make, Solver would report that it could not find a feasible solution.',
    ],
    answer: [0, 1, 4, 5],
    feedback: {
      2: 'Excel offers the Sensitivity Report only for models without integer or binary constraints.',
      3: 'It has 400 − 396 = 4 board feet of slack, so it is not binding.',
    },
    solution: 'Machine and finishing hours are used up (binding); oak has 400 − 396 = 4 board feet of slack, though in a whole-number model even a constraint with slack can hold the plan back, so value any change by solving again. An objective that doesn’t converge means it can grow without limit, usually because a constraint is missing; a promise the resources can’t meet makes the model infeasible. With integer constraints there is no Sensitivity Report: to value more finishing hours, change the limit and solve again.',
  },
  {
    id: 'b03-m4-6', lesson: 'what-if-analysis', type: 'formula', kind: 'applied',
    prompt: 'Oakhollow Joinery’s manager drafts next week’s plan in B4:D4 (tables, chairs, benches). Rows 8 to 10 give each product’s use of oak, machine hours and finishing hours, and column E what is available. In F8, write the formula for the slack in oak (available minus used), so that filling it down to F10 gives the slack in machine and finishing hours.',
    sheet: { cells: {
      A1: 'Oakhollow Joinery: draft weekly plan', B3: 'Tables', C3: 'Chairs', D3: 'Benches', A4: 'Number to make', B4: 6, C4: 24, D4: 4,
      A7: 'Resource', B7: 'Per table', C7: 'Per chair', D7: 'Per bench', E7: 'Available', F7: 'Slack',
      A8: 'Oak (board feet)', B8: 30, C8: 6, D8: 18, E8: 400,
      A9: 'Machine hours', B9: 4, C9: 1, D9: 3, E9: 60,
      A10: 'Finishing hours', B10: 5, C10: 1.5, D10: 4, E10: 80,
    } },
    cell: 'F8', fill: 'F8:F10', view: 'A1:F10', widths: { A: 22 },
    answer: '=E8-SUMPRODUCT($B$4:$D$4,B8:D8)',
    alt: ['=E8-($B$4*B8+$C$4*C8+$D$4*D8)', '=E8-SUMPRODUCT(B$4:D$4,B8:D8)'],
    wrong: [
      { formula: '=E8-SUMPRODUCT(B4:D4,B8:D8)', say: 'Right in F8, but filled down the plan moves to rows 5 and 6, which are empty. Anchor it: $B$4:$D$4.' },
      { formula: '=SUMPRODUCT($B$4:$D$4,B8:D8)-E8', say: 'That is used minus available, the opposite sign. Slack is what is left: available minus used, so a negative slack means the limit is broken.' },
      { formula: '=E8-SUM(B8:D8)', say: 'That subtracts the use of one of each product, whatever the plan. Multiply each product’s use by the number planned: SUMPRODUCT with the plan.' },
    ],
    solution: '<x>=E8-SUMPRODUCT($B$4:$D$4,B8:D8)</x>. Oak: 400 − (6 × 30 + 24 × 6 + 4 × 18) = 400 − 396 = 4. Machine hours: 60 − (24 + 24 + 12) = 0, binding. Finishing hours: 80 − (30 + 36 + 16) = −2: the draft breaks the limit by 2 hours. Negative slack is the sign of an infeasible plan; Solver would never return one.',
  },
  {
    id: 'b03-m4-7', lesson: 'what-if-analysis', type: 'mc', kind: 'applied',
    prompt: 'In May, Primrose Flowers made a Scenario summary of its wedding package under three flower-cost scenarios. In June it corrected the delivery cost in the model, but the summary sheet still shows May’s contributions. Why, and what should it do?',
    options: [
      'Scenario summaries are not recalculated, so it should create the summary again.',
      'Partial calculation is switched on, which skips scenario reports until you recalculate.',
      'The delivery cost wasn’t a changing cell, so it must first be added to every scenario.',
      'Scenario Manager keeps only the last three scenarios, so the old ones must be deleted.',
    ],
    answer: 0,
    feedback: {
      1: 'Partial calculation skips data tables, not scenario reports. A summary is a static report: no setting recalculates it.',
      2: 'Changing cells are the inputs that differ between scenarios. The delivery cost is a common input; the result cells already depend on it, but the report was made before the change.',
      3: 'There is no such limit on the number of scenarios. The limit is 32 changing cells in a scenario.',
    },
    solution: 'A Scenario summary is a snapshot written to a new sheet when it is created: Excel doesn’t recalculate it when the model changes. After correcting the model, create the summary again (and label it with the date), or the reader will compare scenarios built on an old model.',
  },

  // ---------------------------------------------------------------- dashboards
  {
    id: 'b03-m4-8', lesson: 'dashboards', type: 'formula', kind: 'applied',
    prompt: 'Quillfeather Books’ dashboard shows the largest single sale for two chosen month-and-category pairs, side by side: the months (their first days) in row 1 and the categories in row 2 of columns F and G. In F3, write the formula for the pair in column F, so that filling it right to G3 does the same for column G.',
    sheet: { cells: { ...salesCells, E1: 'Month (first day)', F1: serial('2026-10-01'), G1: serial('2026-10-01'), E2: 'Category', F2: 'Children', G2: 'Fiction', E3: 'Largest sale' } },
    cell: 'F3', fill: 'F3:G3', view: 'A1:G17', widths: { A: 12, B: 11, C: 9, D: 3, E: 18, F: 11, G: 11 }, formats: { A: 'date', C: M, F1: 'mmm yyyy', G1: 'mmm yyyy', F3: M, G3: M },
    answer: '=MAXIFS($C$2:$C$17,$B$2:$B$17,F2,$A$2:$A$17,">="&F1,$A$2:$A$17,"<="&EOMONTH(F1,0))',
    alt: ['=MAXIFS($C$2:$C$17,$A$2:$A$17,">="&F1,$A$2:$A$17,"<="&EOMONTH(F1,0),$B$2:$B$17,F2)', '=MAXIFS($C$2:$C$17,$B$2:$B$17,F2,$A$2:$A$17,">="&F1,$A$2:$A$17,"<"&EDATE(F1,1))'],
    wrong: [
      { formula: '=MAXIFS($C$2:$C$17,$B$2:$B$17,F2,$A$2:$A$17,">="&F1)', say: 'Without an end date the window runs on into November, which has a bigger children’s sale. Add "<="&EOMONTH(F1,0).' },
      { formula: '=MAXIFS($C$2:$C$17,$B$2:$B$17,F2,$A$2:$A$17,">="&F1,$A$2:$A$17,"<"&EOMONTH(F1,0))', say: 'EOMONTH gives the last day of the month itself, so "<" leaves out sales made on 31 October. Use "<=".' },
      { formula: '=MAXIFS($C$2:$C$17,$A$2:$A$17,">="&F1,$A$2:$A$17,"<="&EOMONTH(F1,0))', say: 'That is the largest sale of any category in the month. Add the category criterion, $B$2:$B$17 = F2.' },
      { formula: '=MAXIFS(C2:C17,B2:B17,F2,A2:A17,">="&F1,A2:A17,"<="&EOMONTH(F1,0))', say: 'F3 is right, but filled right the ranges move one column. Anchor them with $ and leave F1 and F2 relative.' },
      { formula: '=MAXIFS($C$2:$C$17,$B$2:$B$17,"Children",$A$2:$A$17,">="&F1,$A$2:$A$17,"<="&EOMONTH(F1,0))', say: 'The category is typed into the formula, so column G shows children’s books too. Refer to the cell in row 2.' },
    ],
    solution: '<x>=MAXIFS($C$2:$C$17,$B$2:$B$17,F2,$A$2:$A$17,">="&F1,$A$2:$A$17,"<="&EOMONTH(F1,0))</x> gives $33.00, the largest children’s sale in October, and $52.00 for fiction, a sale on 31 October that only an inclusive end date catches. MAXIFS takes the range to search first, then pairs of criteria ranges and criteria, like SUMIFS.',
  },
  {
    id: 'b03-m4-9', lesson: 'dashboards', type: 'num', kind: 'numerical',
    prompt: 'Stonecrop Climbing Gym has three walls. Last month Hillcrest had 1,200 visits with an average spend of $6.50 a visit, Old Mill 300 visits at $11.00 and the Quay wall 500 visits at $8.00. What should the dashboard show as the average spend per visit for the whole gym? Give it to the cent.',
    answer: 7.55, check: () => (1200 * 6.5 + 300 * 11 + 500 * 8) / (1200 + 300 + 500), unit: '$', places: 2, tol: 0.005,
    wrong: [
      { value: 8.5, say: 'That averages the three averages, giving Old Mill’s 300 visits as much weight as Hillcrest’s 1,200. Divide total spending by total visits.' },
      { value: 15100, say: 'That is total spending. Divide it by the 2,000 visits.' },
    ],
    solution: 'Total spending = 1,200 × 6.50 + 300 × 11.00 + 500 × 8.00 = 7,800 + 3,300 + 4,000 = $15,100 over 2,000 visits: $7.55 a visit. The average of the three averages, $8.50, overweights the small, high-spending wall.',
  },
  {
    id: 'b03-m4-10', lesson: 'dashboards', type: 'mc', kind: 'conceptual',
    prompt: 'Quillfeather’s manager built one PivotTable from the Sales table and a second from a copy of the sales pasted onto another sheet. When she opens Report Connections for her category slicer, only the first PivotTable is listed. Why?',
    options: [
      'A slicer can only be connected to PivotTables that share the same data source.',
      'A slicer can only ever control one PivotTable at a time in Excel.',
      'The second PivotTable must be refreshed before it can appear in the list.',
      'Slicers work only on Excel tables, so the second PivotTable can’t take one.',
    ],
    answer: 0,
    feedback: {
      1: 'One slicer can control several PivotTables through Report Connections, provided they share a data source.',
      2: 'Refreshing updates a PivotTable’s data but doesn’t change its source; it still won’t be listed.',
      3: 'Slicers work with both tables and PivotTables.',
    },
    solution: 'Report Connections lists only PivotTables built on the same data source as the slicer’s. Rebuild the second PivotTable from the Sales table (and delete the pasted copy, which would also go stale). One table feeding every PivotTable is what lets slicers and timelines filter a whole dashboard at once.',
  },
  {
    id: 'b03-m4-11', lesson: 'dashboards', type: 'formula', kind: 'applied',
    prompt: 'Stonecrop’s dashboard compares two chosen months (F1 and G1) with the month before each. In F2, write the percentage change in new members on the previous month for the month in F1, so that filling it right to G2 does the same for G1. (Format: percentage.)',
    sheet: { cells: { ...joinCells, E1: 'Month', E2: 'Change on previous month', F1: serial('2026-09-01'), G1: serial('2026-12-01') } },
    cell: 'F2', fill: 'F2:G2', view: 'A1:G13', widths: { A: 11, B: 13, C: 3, D: 3, E: 24, F: 11, G: 11 },
    formats: { A: 'mmm yyyy', F1: 'mmm yyyy', G1: 'mmm yyyy', F2: '0.0%', G2: '0.0%' },
    answer: '=XLOOKUP(F1,$A$2:$A$13,$B$2:$B$13)/XLOOKUP(EDATE(F1,-1),$A$2:$A$13,$B$2:$B$13)-1',
    alt: ['=(XLOOKUP(F1,$A$2:$A$13,$B$2:$B$13)-XLOOKUP(EDATE(F1,-1),$A$2:$A$13,$B$2:$B$13))/XLOOKUP(EDATE(F1,-1),$A$2:$A$13,$B$2:$B$13)', '=INDEX($B$2:$B$13,MATCH(F1,$A$2:$A$13,0))/INDEX($B$2:$B$13,MATCH(EDATE(F1,-1),$A$2:$A$13,0))-1'],
    wrong: [
      { formula: '=XLOOKUP(F1,$A$2:$A$13,$B$2:$B$13)-XLOOKUP(EDATE(F1,-1),$A$2:$A$13,$B$2:$B$13)', say: 'That is the change in members, not the percentage change. Divide by the previous month’s figure.' },
      { formula: '=XLOOKUP(F1,$A$2:$A$13,$B$2:$B$13)/XLOOKUP(F1-1,$A$2:$A$13,$B$2:$B$13)-1', say: 'F1 − 1 is the last day of the previous month, which isn’t in the list, so the lookup returns #N/A. EDATE(F1,−1) gives the first day of the previous month.' },
      { formula: '=XLOOKUP(EDATE(F1,-1),$A$2:$A$13,$B$2:$B$13)/XLOOKUP(F1,$A$2:$A$13,$B$2:$B$13)-1', say: 'That divides the previous month by this one. The change is this month ÷ previous month − 1.' },
      { formula: '=XLOOKUP(F1,A2:A13,B2:B13)/XLOOKUP(EDATE(F1,-1),A2:A13,B2:B13)-1', say: 'F2 is right, but filled right the lookup ranges move to columns B and C. Anchor them with $.' },
    ],
    solution: '<x>=XLOOKUP(F1,$A$2:$A$13,$B$2:$B$13)/XLOOKUP(EDATE(F1,-1),$A$2:$A$13,$B$2:$B$13)-1</x>. September: 58 ÷ 33 − 1 = 75.8%; December: 40 ÷ 49 − 1 = −18.4%. EDATE(F1,−1) moves back exactly one month, so the comparison is always with the month before the one chosen.',
  },
  {
    id: 'b03-m4-12', lesson: 'dashboards', type: 'mc', kind: 'applied',
    prompt: 'Quillfeather’s monthly dashboard is edited by two people who email copies to each other; the shared drive now holds “dashboard_final_v2.xlsx” and “dashboard_final_v2_REAL.xlsx”. Which practice should the shop adopt?',
    options: [
      'One master copy with one owner in OneDrive, Version history and a change log, and a PDF for readers.',
      'Email the workbook to everyone after each change, with the date in the file name, and delete older copies.',
      'Let every reader edit the master copy directly, so that mistakes are corrected where they are found.',
      'Save a new copy with “final” and the month in its name each time, and keep all of them in the folder.',
    ],
    answer: 0,
    feedback: {
      1: 'Every emailed copy becomes a separate version that someone may edit or forward; there is still no single source of truth.',
      2: 'Many editors with no owner means changes nobody can trace. Readers need a copy they can’t break.',
      3: 'A folder of “final” copies doesn’t say which one is current or what changed between them.',
    },
    solution: 'Keep a single master workbook with one owner, stored where Version history can open and restore earlier versions (OneDrive or SharePoint), record each change on a dated change-log sheet, and give readers a PDF or read-only copy. Then any number can be traced to a version and a change.',
  },
];
