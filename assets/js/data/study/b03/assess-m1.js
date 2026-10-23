// assess-m1.js — B03 module 1 test: Formulas that work (cells-and-formulas, functions-and-logic,
// conditional-sums-and-counts). New questions on new businesses, not copies of lesson exercises. No hints; solutions are
// shown when the student reviews the test. Every business, record and number here is fictional. Every num item's
// `check` recomputes its answer, and every formula item is marked by its results on the sheet and on changed copies.

const MONEY = '$#,##0.00';
const DAY = 86400000;
const serial = (iso) => (Date.parse(`${iso}T00:00:00Z`) - Date.UTC(1899, 11, 30)) / DAY;
const rowsToCells = (head, rows) => {
  const cells = {};
  head.forEach((h, j) => { cells[`${String.fromCharCode(65 + j)}1`] = h; });
  rows.forEach((r, i) => r.forEach((v, j) => { if (v != null) cells[`${String.fromCharCode(65 + j)}${i + 2}`] = typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? serial(v) : v; }));
  return cells;
};

// Mosswood Garden Centre: sales by month
const MOSSWOOD = [['Jan', 18400], ['Feb', 17250], ['Mar', 24800], ['Apr', 31600], ['May', 35900], ['Jun', 29750]];
// Cartwright Kayak Hire: rental minutes
const KAYAK = [['K-301', 45], ['K-302', 70], ['K-303', 120], ['K-304', 95], ['K-305', 30], ['K-306', 180], ['K-307', 61], ['K-308', 150]];
// Sundial Yoga Studio: membership end dates
const SUNDIAL = [['Ama Boateng', '2026-08-28'], ['Leo Hart', '2026-09-01'], ['Priya Nair', '2026-09-03'], ['Tom Ruiz', '2026-09-10'], ['Hana Sato', '2026-09-15'], ['Omar Diaz', '2026-09-16'], ['Ella Byrne', '2026-09-30'], ['Kofi Mensah', '2026-10-14']];
// Bellwether Bakery: product codes
const SKUS = ['BRD-0042', 'CK-0107', 'PASTRY-0003', 'BRD-0118', 'PIE-0021', 'CK-0215', 'BUN-0009', 'PASTRY-0044'];
// Brookline Food Bank: donations
const DONATIONS = [
  ['2026-11-20', 'Winter', 'individual', 50], ['2026-11-28', 'General', 'individual', 25], ['2026-12-01', 'Winter', 'corporate', 500],
  ['2026-12-03', 'Winter', 'individual', 40], ['2026-12-05', 'Schools', 'individual', 30], ['2026-12-08', 'Winter', 'individual', 75],
  ['2026-12-10', 'General', 'corporate', 250], ['2026-12-12', 'Winter', 'individual', 20], ['2026-12-15', 'Winter', 'corporate', 1000],
  ['2026-12-18', 'Schools', 'corporate', 300], ['2026-12-20', 'Winter', 'individual', 60], ['2026-12-22', 'Winter', 'individual', 35],
  ['2026-12-24', 'General', 'individual', 100], ['2026-12-28', 'Winter', 'individual', 45], ['2026-12-31', 'Winter', 'individual', 80],
  ['2027-01-01', 'Winter', 'individual', 150], ['2027-01-01', 'Winter', 'corporate', 400], ['2027-01-04', 'Schools', 'individual', 25],
  ['2027-01-07', 'Winter', 'individual', 30], ['2027-01-10', 'General', 'individual', 60],
];
const winterDec = DONATIONS.filter((d) => d[1] === 'Winter' && d[0] >= '2026-12-01' && d[0] < '2027-01-01').reduce((s, d) => s + d[3], 0);
// Gatehouse Theatre: performances
const SHOWS = [
  ['The Tempest', 'evening', 212], ['The Tempest', 'matinee', 140], ['Our Town', 'evening', 180], ['The Tempest', 'evening', 236],
  ['Hamlet', 'evening', 250], ['Our Town', 'matinee', 95], ['The Tempest', 'matinee', 158], ['Hamlet', 'matinee', 170],
  ['The Tempest', 'evening', 198], ['Our Town', 'evening', 205], ['Hamlet', 'evening', 244], ['The Tempest', 'evening', 230],
  ['Our Town', 'matinee', 110], ['Hamlet', 'evening', 239], ['The Tempest', 'matinee', 132], ['Our Town', 'evening', 190],
];
const tempestEvening = SHOWS.filter((s) => s[0] === 'The Tempest' && s[1] === 'evening').map((s) => s[2]);
// Sparrow Lane Florist: an order table for a by-hand SUMIFS
const FLORIST = [['Rose bouquet', 3], ['Rose single', 12], ['Tulip bunch', 6], ['Rose box', 1], ['Lily bunch', 8], ['Tulip single', 20], ['Rose bouquet', 5], ['Orchid pot', 2]];

export const items = [
  // ---------------------------------------------------------------- cells-and-formulas
  {
    id: 'b03-m1-1', lesson: 'cells-and-formulas', type: 'formula', kind: 'applied',
    prompt: 'Mosswood Garden Centre’s sales by month are in B2:B7, January first. In C3, write the percentage change in February’s sales compared with January, in a formula that can be filled down to C7 so that every month is compared with January.',
    sheet: { cells: { ...rowsToCells(['Month', 'Sales ($)'], MOSSWOOD), C1: 'Change on January' } },
    cell: 'C3', fill: 'C3:C7', view: 'A1:C7',
    formats: { B: '$#,##0', C: '0.0%' }, widths: { C: 18 },
    answer: '=B3/$B$2-1',
    alt: ['=(B3-$B$2)/$B$2', '=B3/B$2-1'],
    wrong: [
      { formula: '=B3/B2-1', say: 'Without a dollar sign the base moves down too, so each month is compared with the month before it, not with January. Fix the base: $B$2.' },
      { formula: '=B3/$B$2', say: 'That is the ratio to January (1.35 means 35% higher). Subtract 1 to get the change.' },
      { formula: '=(B3-$B$2)/B3', say: 'A percentage change divides by the starting value, January, not by the month being compared.' },
    ],
    solution: '<x>=B3/$B$2-1</x>, formatted as a percentage. $B$2 keeps every month pointing at January; February is 17,250 ÷ 18,400 − 1 = −6.3%, and May is 35,900 ÷ 18,400 − 1 = 95.1%.',
  },
  {
    id: 'b03-m1-2', lesson: 'cells-and-formulas', type: 'mc', kind: 'conceptual',
    prompt: 'D4 holds <x>=$B4*C$1</x>. You <b>cut</b> D4 and paste it into G10. What does G10 hold?',
    options: ['<x>=$B4*C$1</x>', '<x>=$B10*F$1</x>', '<x>=$E10*F$7</x>', '<x>#REF!</x>'],
    answer: 0,
    feedback: {
      1: 'That is what copying and pasting would give. Moving a formula (cut and paste) leaves its references exactly as they were.',
      2: 'That moves the parts the dollar signs fix, which never happens; and moving doesn’t adjust references at all.',
      3: 'Cutting a formula doesn’t break its references; #REF! comes from deleting the cells a formula refers to.',
    },
    solution: 'When you move a formula, Microsoft notes, its references stay the same whatever their type. So G10 holds <x>=$B4*C$1</x>, still reading B4 and C1. Copying and pasting would have given <x>=$B10*F$1</x>.',
  },
  {
    id: 'b03-m1-3', lesson: 'cells-and-formulas', type: 'num', kind: 'numerical',
    prompt: 'A2 holds 0.125 and is formatted as a percentage with no decimal places, so it shows 13%. What does <x>=A2*200</x> return?',
    answer: 25, check: () => 0.125 * 200, unit: '', places: 0, tol: 0.001,
    wrong: [{ value: 26, say: 'The 13% is only what the format shows. The cell stores 0.125, and 0.125 × 200 = 25.' }],
    solution: 'A number format changes only the display. The formula uses the stored value: 0.125 × 200 = 25.',
  },
  {
    id: 'b03-m1-4', lesson: 'cells-and-formulas', type: 'classify', kind: 'conceptual',
    prompt: 'You are checking a colleague’s workbook. Which Excel tool does each job best?',
    items: [
      'See every formula in a column at once, to spot the one that differs',
      'Find which cells feed into the total in F40',
      'Find which formulas would change if you edited the input in B2',
      'Watch a long nested IF calculate one step at a time',
      'Find the cell whose formula includes its own address',
    ],
    categories: ['Show Formulas', 'Trace Precedents', 'Trace Dependents', 'Evaluate Formula', 'Error Checking > Circular References'],
    answer: [0, 1, 2, 3, 4],
    feedback: {
      1: 'Precedents are the cells a formula uses; Trace Precedents draws arrows from them to F40.',
      2: 'Dependents are the formulas that use a cell; Trace Dependents draws arrows from B2 to them.',
    },
    solution: 'Show Formulas (Ctrl+`) displays formulas instead of results; Trace Precedents shows what a formula uses and Trace Dependents what uses a cell; Evaluate Formula steps through one formula; Formulas > Error Checking > Circular References lists cells in a circular reference.',
  },
  // ---------------------------------------------------------------- functions-and-logic
  {
    id: 'b03-m1-5', lesson: 'functions-and-logic', type: 'formula', kind: 'numerical',
    prompt: 'Cartwright Kayak Hire charges for every started hour: 61 minutes is charged as 2 hours. Rental minutes are in B2:B9 and the hourly rate in F1. In C2, write the charge for the first rental, in a formula that can be filled down to C9.',
    sheet: { cells: { ...rowsToCells(['Rental', 'Minutes'], KAYAK), C1: 'Charge', E1: 'Rate per hour', F1: 18 } },
    cell: 'C2', fill: 'C2:C9', view: 'A1:F9',
    formats: { C: MONEY, F1: MONEY }, widths: { C: 10, E: 14 },
    answer: '=ROUNDUP(B2/60,0)*$F$1',
    alt: ['=CEILING(B2/60,1)*$F$1', '=-INT(-B2/60)*$F$1', '=$F$1*ROUNDUP(B2/60,0)'],
    wrong: [
      { formula: '=ROUND(B2/60,0)*$F$1', say: 'ROUND goes to the nearest hour, so 70 minutes is charged as 1 hour. Every started hour is charged: round up.' },
      { formula: '=B2/60*$F$1', say: 'That charges for the exact time. The rule charges whole hours, rounded up.' },
      { formula: '=ROUNDUP(B2/60,0)*F1', say: 'F1 moves to F2, F3 … when the formula is filled down, and they are empty. Fix the rate: $F$1.' },
    ],
    solution: '<x>=ROUNDUP(B2/60,0)*$F$1</x>. Minutes ÷ 60 gives hours, ROUNDUP(…,0) charges every started hour, and $F$1 keeps the rate fixed. 70 minutes: 1.17 hours, rounded up to 2, × $18 = $36.00.',
  },
  {
    id: 'b03-m1-6', lesson: 'functions-and-logic', type: 'formula', kind: 'applied',
    prompt: 'Sundial Yoga Studio sends a reminder to every member whose membership ends on the report date in F1 or within the 14 days after it. End dates are in B2:B9. In C2, write a formula that shows “remind” for such a member and empty text (<x>""</x>) otherwise; it will be filled down to C9.',
    sheet: { cells: { ...rowsToCells(['Member', 'Ends on'], SUNDIAL), C1: 'Reminder', E1: 'Report date', F1: serial('2026-09-01') } },
    cell: 'C2', fill: 'C2:C9', view: 'A1:F9',
    formats: { B: 'date', F1: 'date' }, widths: { A: 13, B: 13, C: 10, E: 12, F: 13 },
    answer: '=IF(AND(B2>=$F$1,B2<=$F$1+14),"remind","")',
    alt: ['=IF(AND(B2-$F$1>=0,B2-$F$1<=14),"remind","")', '=IF(OR(B2<$F$1,B2>$F$1+14),"","remind")'],
    wrong: [
      { formula: '=IF(OR(B2>=$F$1,B2<=$F$1+14),"remind","")', say: 'OR is TRUE if either test is, and every date is either after the report date or before the end of the window, so everyone is reminded. Both must hold: AND.' },
      { formula: '=IF(B2<=$F$1+14,"remind","")', say: 'That also reminds members whose membership has already ended. Add the test B2>=$F$1.' },
      { formula: '=IF(AND(B2>$F$1,B2<$F$1+14),"remind","")', say: 'The rule includes the report date itself and the 14th day after it: use >= and <=.' },
      { formula: '=IF(AND(B2>=F1,B2<=F1+14),"remind","")', say: 'F1 moves down when the formula is filled. Fix the report date: $F$1.' },
    ],
    solution: '<x>=IF(AND(B2>=$F$1,B2<=$F$1+14),"remind","")</x>. With a report date of 1 September 2026 the window runs to 15 September, both ends included: Leo Hart (1 September), Priya Nair, Tom Ruiz and Hana Sato (15 September) are reminded; Ama Boateng’s membership has already ended, and the others end later.',
  },
  {
    id: 'b03-m1-7', lesson: 'functions-and-logic', type: 'formula', kind: 'applied',
    prompt: 'Bellwether Bakery’s product codes are a family code, a hyphen and a number, such as BRD-0042 or PASTRY-0003; family codes have different lengths. In B2, write a formula that returns the family code (the text before the hyphen); it will be filled down to B9.',
    sheet: { cells: { ...rowsToCells(['Code'], SKUS.map((s) => [s])), B1: 'Family' } },
    cell: 'B2', fill: 'B2:B9', view: 'A1:B9',
    widths: { A: 13, B: 10 },
    answer: '=LEFT(A2,FIND("-",A2)-1)',
    alt: ['=LEFT(A2,SEARCH("-",A2)-1)', '=MID(A2,1,FIND("-",A2)-1)', '=TEXTBEFORE(A2,"-")'],
    wrong: [
      { formula: '=LEFT(A2,3)', say: 'Family codes have different lengths: CK-0107 would give “CK-” and PASTRY-0003 “PAS”. Find the hyphen and take everything before it.' },
      { formula: '=LEFT(A2,FIND("-",A2))', say: 'FIND gives the hyphen’s position, so LEFT with that many characters includes the hyphen. Subtract 1.' },
      { formula: '=MID(A2,FIND("-",A2)+1,LEN(A2))', say: 'That is the part after the hyphen, the product number. The family is before it: LEFT.' },
    ],
    solution: '<x>=LEFT(A2,FIND("-",A2)-1)</x>. FIND returns the hyphen’s position (4 in BRD-0042, 7 in PASTRY-0003), and LEFT takes the characters before it. In Microsoft 365, <x>=TEXTBEFORE(A2,"-")</x> does the same in one function.',
  },
  {
    id: 'b03-m1-8', lesson: 'functions-and-logic', type: 'num', kind: 'numerical',
    prompt: 'Oakridge Fitness records attendance at a spin class in B2:B11: 12, 0, 9, 15, 0 and 6 for six sessions, the text “closed” for two sessions, and two empty cells for sessions not yet held. What does <x>=AVERAGE(B2:B11)</x> return?',
    answer: 7, check: () => [12, 0, 9, 15, 0, 6].reduce((s, x) => s + x, 0) / 6, unit: '', places: 1, tol: 0.01,
    wrong: [
      { value: 4.2, say: 'AVERAGE doesn’t divide by every cell: text and empty cells in the range are skipped.' },
      { value: 10.5, say: 'Zeros are numbers, and AVERAGE includes them: 42 ÷ 6, not 42 ÷ 4.' },
      { value: 5.25, say: 'The two “closed” cells are text, which AVERAGE skips; they don’t count as zeros.' },
    ],
    solution: 'AVERAGE uses the numbers in the range, zeros included, and skips text and empty cells: (12 + 0 + 9 + 15 + 0 + 6) ÷ 6 = 42 ÷ 6 = 7.',
  },
  // ---------------------------------------------------------------- conditional-sums-and-counts
  {
    id: 'b03-m1-9', lesson: 'conditional-sums-and-counts', type: 'formula', kind: 'numerical',
    prompt: 'Brookline Food Bank’s donations: date in A, campaign in B, donor type in C, amount in D. G1 holds the campaign name Winter, G2 1 December 2026 and G3 1 January 2027. In G5, write one formula for the Winter campaign’s donations received on or after the date in G2 and before the date in G3.',
    sheet: { cells: { ...rowsToCells(['Date', 'Campaign', 'Donor', 'Amount ($)'], DONATIONS), F1: 'campaign', G1: 'Winter', F2: 'from', G2: serial('2026-12-01'), F3: 'before', G3: serial('2027-01-01'), F5: 'total' }, fixed: ['G2:G3'] },
    cell: 'G5', view: 'A1:G21',
    formats: { A: 'date', D: MONEY, G2: 'date', G3: 'date', G5: MONEY }, widths: { A: 13, B: 10, C: 11, G: 13 },
    answer: '=SUMIFS(D2:D21,B2:B21,G1,A2:A21,">="&G2,A2:A21,"<"&G3)',
    alt: ['=SUMIFS(D2:D21,A2:A21,">="&G2,A2:A21,"<="&G3-1,B2:B21,G1)', '=SUMPRODUCT((B2:B21=G1)*(A2:A21>=G2)*(A2:A21<G3)*D2:D21)'],
    wrong: [
      { formula: '=SUMIFS(D2:D21,B2:B21,G1,A2:A21,">="&G2,A2:A21,"<="&G3)', say: '“On or before 1 January” includes the two donations received on New Year’s Day. Stop before the date in G3.' },
      { formula: '=SUMIF(B2:B21,G1,D2:D21)', say: 'That is every Winter donation, including November and January. Add the two date criteria with SUMIFS.' },
      { formula: '=SUMIFS(D2:D21,B2:B21,G1,A2:A21,">=G2",A2:A21,"<G3")', say: 'Inside quotes, G2 and G3 are just text, so no date matches and the result is 0. Join the operator to the cell: ">="&G2.' },
    ],
    solution: `<x>=SUMIFS(D2:D21,B2:B21,G1,A2:A21,">="&G2,A2:A21,"<"&G3)</x> returns $${winterDec.toLocaleString('en-US')}.00: the nine Winter donations dated 1 to 31 December. The window stops before 1 January, so the $550 received on New Year’s Day counts towards January.`,
  },
  {
    id: 'b03-m1-10', lesson: 'conditional-sums-and-counts', type: 'formula', kind: 'applied',
    prompt: 'Gatehouse Theatre’s performances: show in A, slot (matinee or evening) in B, seats sold in C. In F2, write a formula for the average number of seats sold at evening performances of The Tempest.',
    sheet: { cells: { ...rowsToCells(['Show', 'Slot', 'Seats sold'], SHOWS), E2: 'Tempest, evenings' } },
    cell: 'F2', view: 'A1:F17',
    formats: { F2: '0.0' }, widths: { A: 13, E: 17 },
    answer: '=AVERAGEIFS(C2:C17,A2:A17,"The Tempest",B2:B17,"evening")',
    alt: ['=SUMIFS(C2:C17,A2:A17,"The Tempest",B2:B17,"evening")/COUNTIFS(A2:A17,"The Tempest",B2:B17,"evening")', '=AVERAGEIFS(C2:C17,B2:B17,"evening",A2:A17,"the tempest")'],
    wrong: [
      { formula: '=AVERAGEIF(A2:A17,"The Tempest",C2:C17)', say: 'That averages every Tempest performance, matinees included. Add the slot as a second criterion with AVERAGEIFS.' },
      { formula: '=SUMIFS(C2:C17,A2:A17,"The Tempest",B2:B17,"evening")', say: 'That is the total seats sold at those performances. Divide by how many there were, or use AVERAGEIFS.' },
      { formula: '=AVERAGEIFS(A2:A17,C2:C17,"The Tempest",B2:B17,"evening")', say: 'The ranges are mixed up: the first argument of AVERAGEIFS is the range to average (the seats), then each criteria range with its criterion.' },
    ],
    solution: `<x>=AVERAGEIFS(C2:C17,A2:A17,"The Tempest",B2:B17,"evening")</x>. Four evening performances sold ${tempestEvening.join(', ')} seats, an average of ${tempestEvening.reduce((s, x) => s + x, 0) / tempestEvening.length}.`,
  },
  {
    id: 'b03-m1-11', lesson: 'conditional-sums-and-counts', type: 'num', kind: 'numerical',
    prompt: 'Sparrow Lane Florist’s orders have the product in A2:A9 and the quantity in B2:B9: Rose bouquet 3, Rose single 12, Tulip bunch 6, Rose box 1, Lily bunch 8, Tulip single 20, Rose bouquet 5, Orchid pot 2. What does <x>=SUMIFS(B2:B9,A2:A9,"Rose*",B2:B9,"<10")</x> return?',
    answer: 9, check: () => FLORIST.filter(([p, q]) => p.startsWith('Rose') && q < 10).reduce((s, [, q]) => s + q, 0), unit: 'items', places: 0, tol: 0,
    wrong: [
      { value: 21, say: 'That is every rose order. The second criterion keeps only quantities under 10, which drops the 12 single roses.' },
      { value: 25, say: 'That is every order under 10. Both criteria must hold: the product starts with Rose and the quantity is under 10.' },
      { value: 8, say: 'Rose bouquet appears twice (3 and 5), and both count. Check the Rose box (1) too: 3 + 1 + 5.' },
    ],
    solution: '<x>"Rose*"</x> matches every product starting with Rose; <x>"<10"</x> keeps quantities under 10. Rose bouquet 3, Rose box 1 and Rose bouquet 5 pass both tests: 3 + 1 + 5 = 9. Rose single (12) fails the second test.',
  },
  {
    id: 'b03-m1-12', lesson: 'conditional-sums-and-counts', type: 'mc', kind: 'conceptual',
    prompt: 'Channels are in B2:B9 and order totals in C2:C9. <x>=SUMPRODUCT((B2:B9="web"),C2:C9)</x> returns 0, although there are web orders. Why?',
    options: [
      'SUMPRODUCT treats non-numbers as zero, so the TRUE and FALSE values count as 0; multiply instead, <x>=SUMPRODUCT((B2:B9="web")*C2:C9)</x>.',
      'The two ranges are different sizes.',
      'SUMPRODUCT can’t take a condition; only SUMIFS can.',
      'The criterion <x>"web"</x> must be typed in a cell and referred to.',
    ],
    answer: 0,
    feedback: {
      1: 'B2:B9 and C2:C9 are both eight cells tall; ranges of different sizes would give #VALUE!, not 0.',
      2: 'SUMPRODUCT handles conditions well, as long as the TRUE/FALSE values are turned into numbers with arithmetic.',
      3: 'A criterion in a cell is good practice, but typing <x>"web"</x> in the formula works; the 0 has another cause.',
    },
    solution: 'The comparison gives TRUE and FALSE values, and Microsoft notes that SUMPRODUCT treats non-numeric entries as zeros, so every product is 0. Multiplying the comparison by the totals turns TRUE into 1 and FALSE into 0 first: <x>=SUMPRODUCT((B2:B9="web")*C2:C9)</x>.',
  },
];
