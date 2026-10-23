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
    prompt: 'Stonecrop Climbing Gym is weighing its monthly fee. Members run down column A and possible fees across row 4; the card and payment fees, a share of revenue, are in B1. In B5, write one formula for monthly revenue after card fees that can be filled across and down to E9.',
    sheet: { cells: {
      A1: 'Card and payment fees (share of revenue)', B1: 0.025,
      A4: 'Members ↓   monthly fee →', B4: 39, C4: 45, D4: 49, E4: 55,
      A5: 300, A6: 350, A7: 400, A8: 450, A9: 500,
    } },
    cell: 'B5', fill: 'B5:E9', view: 'A1:E9', widths: { A: 36 },
    formats: { B1: '0.0%', B4: M, C4: M, D4: M, E4: M, B: '$#,##0.00', C: '$#,##0.00', D: '$#,##0.00', E: '$#,##0.00' },
    answer: '=$A5*B$4*(1-$B$1)',
    alt: ['=B$4*$A5*(1-$B$1)', '=$A5*B$4-$A5*B$4*$B$1'],
    wrong: [
      { formula: '=A5*B4*(1-B1)', say: 'Filled right or down, every reference moves. Fix the column of the members ($A5), the row of the fees (B$4) and the whole of the fee rate ($B$1).' },
      { formula: '=$A5*B$4*(1-B1)', say: 'The members and fees are anchored, but B1 moves to C1 (empty) when filled right. Make it $B$1.' },
      { formula: '=$A5*B$4-$B$1', say: 'B1 is a share of revenue (2.5%), not a dollar amount: multiply the revenue by (1 − $B$1).' },
    ],
    solution: '<x>=$A5*B$4*(1-$B$1)</x>. B5 = 300 × 39 × 0.975 = $11,407.50; E9 = 500 × 55 × 0.975 = $26,812.50. $A5 keeps the members’ column, B$4 keeps the fees’ row and $B$1 keeps the rate as the formula is filled.',
  },
  {
    id: 'b03-m4-2', lesson: 'what-if-analysis', type: 'num', kind: 'numerical',
    prompt: 'Bellwether Flowers prices a wedding package as a $250 design fee plus a price per table, for 15 tables. Its direct costs are $38 of flowers per table and $180 for delivery and setting up. What price per table gives a contribution margin ratio of exactly 40%? This is the answer Goal Seek should return. Give it to the cent.',
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
    prompt: 'Oakhollow Joinery’s Solver model chooses how many tables and chairs to make in a week, with integer constraints. The Answer Report shows oak used 400 of 400 board feet, machine hours 52 of 60 and finishing hours 80 of 80. Select all the statements that are true.',
    options: [
      'The oak and finishing-hours constraints are binding.',
      'Machine hours have 8 hours of slack.',
      'A Sensitivity Report for this model would give the shadow price of oak.',
      'Eight more machine hours a week would raise the best contribution.',
      'Had Solver reported that the objective cell’s values do not converge, a constraint would probably be missing.',
      'If the joinery had promised more tables than its oak can make, Solver would report that it could not find a feasible solution.',
    ],
    answer: [0, 1, 4, 5],
    feedback: {
      2: 'Excel offers the Sensitivity Report only for models without integer or binary constraints.',
      3: 'Machine hours already have slack: the plan doesn’t use 8 of them, so more would add nothing until another limit changes.',
    },
    solution: 'Oak and finishing are used up (binding); machine hours have 60 − 52 = 8 hours of slack, so more of them are worth nothing to this plan. An objective that doesn’t converge means it can grow without limit, usually because a constraint is missing; a promise the resources can’t meet makes the model infeasible. With integer constraints there is no Sensitivity Report: to value more oak, change the limit and solve again.',
  },
  {
    id: 'b03-m4-6', lesson: 'what-if-analysis', type: 'formula', kind: 'applied',
    prompt: 'Oakhollow Joinery’s plan for next week is in B4:D4 (tables, chairs, benches). Rows 8 to 10 give each product’s use of oak, machine hours and finishing hours. In E8, write the formula for the oak this plan uses, so that filling it down to E10 gives the machine and finishing hours used.',
    sheet: { cells: {
      A1: 'Oakhollow Joinery: weekly plan', B3: 'Tables', C3: 'Chairs', D3: 'Benches', A4: 'Number to make', B4: 6, C4: 24, D4: 4,
      A7: 'Resource', B7: 'Per table', C7: 'Per chair', D7: 'Per bench', E7: 'Used', F7: 'Available',
      A8: 'Oak (board feet)', B8: 30, C8: 6, D8: 18, F8: 400,
      A9: 'Machine hours', B9: 4, C9: 1, D9: 3, F9: 60,
      A10: 'Finishing hours', B10: 5, C10: 1.5, D10: 4, F10: 80,
    } },
    cell: 'E8', fill: 'E8:E10', view: 'A1:F10', widths: { A: 22 },
    answer: '=SUMPRODUCT($B$4:$D$4,B8:D8)',
    alt: ['=$B$4*B8+$C$4*C8+$D$4*D8', '=SUMPRODUCT(B$4:D$4,B8:D8)'],
    wrong: [
      { formula: '=SUMPRODUCT(B4:D4,B8:D8)', say: 'Right in E8, but filled down the plan moves to rows 5 and 6, which are empty. Anchor it: $B$4:$D$4.' },
      { formula: '=SUM(B8:D8)*SUM($B$4:$D$4)', say: 'That multiplies the total use per item by the total items, as if every product used the same amount. Multiply each product’s count by its own use: SUMPRODUCT.' },
      { formula: '=B4*B8+C4*C8+D4*D8', say: 'Right in E8 only: filled down, row 4 becomes rows 5 and 6. Anchor the plan’s cells with $.' },
    ],
    solution: '<x>=SUMPRODUCT($B$4:$D$4,B8:D8)</x>: oak 6 × 30 + 24 × 6 + 4 × 18 = 396 board feet; machine hours 6 × 4 + 24 + 4 × 3 = 60; finishing 6 × 5 + 24 × 1.5 + 4 × 4 = 82, which is over the 80 available. Laid out like this, the sheet shows at once that the plan breaks a limit, and the same cells become Solver’s constraints.',
  },
  {
    id: 'b03-m4-7', lesson: 'what-if-analysis', type: 'mc', kind: 'applied',
    prompt: 'In May, Bellwether Flowers made a Scenario summary of its wedding package under three flower-cost scenarios. In June it corrected the delivery cost in the model, but the summary sheet still shows May’s contributions. Why, and what should it do?',
    options: [
      'Scenario summaries are not recalculated, so it should create the summary again.',
      'Partial calculation is switched on, which skips scenario reports until F9 is pressed.',
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
    prompt: 'Quillfeather Books’ dashboard shows the largest single sale in a chosen month and category. The month is in F1 (its first day) and the category in F2. In F3, write the formula.',
    sheet: { cells: { ...salesCells, E1: 'Month (first day)', F1: serial('2026-10-01'), E2: 'Category', F2: 'Children', E3: 'Largest sale' }, fixed: ['A2:A17', 'F1'] },
    cell: 'F3', view: 'A1:F17', widths: { A: 12, B: 11, C: 9, D: 3, E: 18, F: 11 }, formats: { A: 'date', C: M, F1: 'mmm yyyy', F3: M },
    answer: '=MAXIFS(C2:C17,B2:B17,F2,A2:A17,">="&F1,A2:A17,"<="&EOMONTH(F1,0))',
    alt: ['=MAXIFS(C2:C17,A2:A17,">="&F1,A2:A17,"<="&EOMONTH(F1,0),B2:B17,F2)', '=MAXIFS(C2:C17,B2:B17,F2,A2:A17,">="&F1,A2:A17,"<"&EDATE(F1,1))'],
    wrong: [
      { formula: '=MAXIFS(C2:C17,B2:B17,F2,A2:A17,">="&F1)', say: 'Without an end date the window runs on into November, which has a bigger children’s sale. Add "<="&EOMONTH(F1,0).' },
      { formula: '=MAXIFS(C2:C17,B2:B17,F2)', say: 'That is the largest children’s sale in all three months. Add the two date criteria for the chosen month.' },
      { formula: '=MAXIFS(C2:C17,A2:A17,">="&F1,A2:A17,"<="&EOMONTH(F1,0))', say: 'That is the largest sale of any category in October. Add the category criterion, B2:B17 = F2.' },
    ],
    solution: '<x>=MAXIFS(C2:C17,B2:B17,F2,A2:A17,">="&F1,A2:A17,"<="&EOMONTH(F1,0))</x> gives $33.00, the largest children’s sale in October. MAXIFS takes the range to search first, then pairs of criteria ranges and criteria, like SUMIFS; the date window makes the tile follow whatever month the reader picks.',
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
    sheet: { cells: { ...joinCells, E1: 'Month', E2: 'Change on previous month', F1: serial('2026-09-01'), G1: serial('2026-12-01') }, fixed: ['A2:A13', 'F1:G1'] },
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
