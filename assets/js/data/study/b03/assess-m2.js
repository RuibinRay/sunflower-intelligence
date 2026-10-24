// assess-m2.js — B03 module 2 test: Finding and summarising data (lookups, tables-and-cleaning, pivot-tables).
// New questions on businesses the lessons don't use (Birchwood Gym, Moorfield Books, Saltwick Inn, Hartley Animal
// Rescue), not copies of lesson exercises. No hints; solutions are shown when the student reviews the test. Every
// business, record and number is fictional; every num item's `check` recomputes its answer.

const MONEY = '$#,##0.00';
const sum = (a) => a.reduce((s, x) => s + x, 0);
const r2 = (x) => Math.round(x * 100) / 100;

// Birchwood Gym: plans with the fee to the left of the plan name
const PLANS = [[29, 'Off-peak', 0], [39, 'Standard', 20], [49, 'Premium', 20], [19, 'Student', 0]];
const MEMBERS = [['M-101', 'Standard'], ['M-102', 'Premium'], ['M-103', 'Student'], ['M-104', 'Standard'], ['M-105', 'Off-peak'], ['M-106', 'Premium'], ['M-107', 'Standard'], ['M-108', 'Student']];
const gym = { A1: 'member_id', B1: 'plan', C1: 'monthly_fee', E1: 'monthly_fee', F1: 'plan', G1: 'joining_fee' };
MEMBERS.forEach((m, i) => { gym[`A${i + 2}`] = m[0]; gym[`B${i + 2}`] = m[1]; });
PLANS.forEach((p, i) => { gym[`E${i + 2}`] = p[0]; gym[`F${i + 2}`] = p[1]; gym[`G${i + 2}`] = p[2]; });

// Saltwick Inn: a rate card by room type and season
const SEASONS = ['Low', 'Mid', 'High'];
const RATES = { Single: [85, 105, 140], Double: [110, 135, 180], Suite: [190, 230, 310] };
const rate = (room, season) => RATES[room][SEASONS.indexOf(season)];
const swapped = (room, season) => { const rooms = Object.keys(RATES); return RATES[rooms[SEASONS.indexOf(season)]][rooms.indexOf(room)]; };

// Moorfield Books: online shipping bands
const SHIP = [[0, 3.99], [25, 2.49], [50, 0]];
const ORDERS = [12.50, 25.00, 24.99, 50.00, 49.99, 73.40, 38.20, 8.75];
const ship = { A1: 'order', B1: 'order_value', C1: 'shipping', E1: 'from', F1: 'charge' };
ORDERS.forEach((v, i) => { ship[`A${i + 2}`] = `MB-${3101 + i}`; ship[`B${i + 2}`] = v; });
SHIP.forEach((b, i) => { ship[`E${i + 2}`] = b[0]; ship[`F${i + 2}`] = b[1]; });

// a supplier's dates as eight digits of text, year first (ISO 8601 basic format)
const DOTS = ['20260331', '20260401', '20260415', '20260502', '20260528', '20260609'];
const dots = { A1: 'invoice_date (text)', B1: 'invoice_date' };
DOTS.forEach((d, i) => { dots[`A${i + 2}`] = d; });

// Hartley Animal Rescue: a table of gifts
const GIFTS = [['G-201', 'individual', 25, 'no'], ['G-202', 'individual', 100, 'yes'], ['G-203', 'company', 500, 'no'], ['G-204', 'individual', 40, 'yes'], ['G-205', 'individual', 15, 'no'], ['G-206', 'trust', 1200, 'no'], ['G-207', 'individual', 60, 'yes'], ['G-208', 'individual', 35, 'no'], ['G-209', 'individual', 250, 'yes'], ['G-210', 'company', 300, 'no'], ['G-211', 'individual', 50, 'yes']];
const gifts = { A1: 'gift_id', B1: 'donor_type', C1: 'amount', D1: 'matched', F1: 'matched gifts' };
GIFTS.forEach((g, i) => { gifts[`A${i + 2}`] = g[0]; gifts[`B${i + 2}`] = g[1]; gifts[`C${i + 2}`] = g[2]; gifts[`D${i + 2}`] = g[3]; });
const matched = sum(GIFTS.filter((g) => g[3] === 'yes' && g[2] >= 50).map((g) => g[2]));

// Saltwick Inn: room revenue by channel and month
const HB = { Direct: [12400, 15800, 9600], Agency: [8200, 11300, 6100], Website: [14900, 18700, 12300] };
const hbCol = (j) => sum(Object.values(HB).map((r) => r[j]));
const hbAll = sum(Object.values(HB).flat());

// Moorfield Books: sales records
const SALES = [['S-01', 'Fiction', 12.99], ['S-02', 'Children', 7.50], ['S-03', 'Fiction', 9.99], ['S-04', 'Travel', 18.00], ['S-05', 'Fiction', 14.50], ['S-06', 'Children', 6.99], ['S-07', 'History', 22.00], ['S-08', 'Fiction', 8.99], ['S-09', 'Travel', 24.50], ['S-10', 'Fiction', 16.00], ['S-11', 'History', 19.99], ['S-12', 'Children', 11.25], ['S-13', 'Fiction', 10.49], ['S-14', 'Travel', 15.00], ['S-15', 'Children', 5.99], ['S-16', 'Fiction', 13.75]];
const sales = { A1: 'sale_id', B1: 'category', C1: 'amount', E1: 'average fiction sale' };
SALES.forEach((s, i) => { sales[`A${i + 2}`] = s[0]; sales[`B${i + 2}`] = s[1]; sales[`C${i + 2}`] = s[2]; });
const fiction = SALES.filter((s) => s[1] === 'Fiction').map((s) => s[2]);

export const items = [
  // ---------------------------------------------------------------- lookups
  {
    id: 'b03-m2-1', lesson: 'lookups', type: 'formula', kind: 'applied',
    prompt: 'Birchwood Gym, a fictional gym, keeps its plans in E1:G5 with the monthly fee in column E, to the left of the plan name in column F. In C2, return each member’s monthly fee for the plan in B2, and fill it down to C9.',
    sheet: { cells: gym }, cell: 'C2', fill: 'C2:C9', answer: '=INDEX($E$2:$E$5,MATCH(B2,$F$2:$F$5,0))',
    view: 'A1:G9', formats: { C: MONEY, E: MONEY, G: MONEY }, widths: { C: 12, E: 12, G: 12 },
    alt: ['=XLOOKUP(B2,$F$2:$F$5,$E$2:$E$5)', '=INDEX($E$2:$E$5,XMATCH(B2,$F$2:$F$5))', '=INDEX($E$2:$G$5,MATCH(B2,$F$2:$F$5,0),1)'],
    wrong: [
      { formula: '=VLOOKUP(B2,$E$2:$G$5,1,FALSE)', say: 'VLOOKUP searches the first column of its range, the fees, for a plan name, so every row shows #N/A. The fee is to the left of the key: use INDEX and MATCH, or XLOOKUP.' },
      { formula: '=INDEX($E$2:$E$5,MATCH(B2,$F$2:$F$5))', say: 'MATCH without 0 is an approximate match, which assumes a sorted list; this one isn’t sorted. Add 0.' },
      { formula: '=INDEX($G$2:$G$5,MATCH(B2,$F$2:$F$5,0))', say: 'Column G is the joining fee. The monthly fee is in column E.' },
      { formula: '=INDEX(E2:E5,MATCH(B2,F2:F5,0))', say: 'Without $ the ranges slide down as the formula is filled, and the lower rows lose the plans at the top. Lock both ranges.' },
    ],
    solution: '<x>=INDEX($E$2:$E$5,MATCH(B2,$F$2:$F$5,0))</x>, filled to C9: MATCH finds the plan’s position in F2:F5 (exact, with 0) and INDEX returns the fee in that position of E2:E5. M-101 (Standard) pays $39.00. <x>=XLOOKUP(B2,$F$2:$F$5,$E$2:$E$5)</x> works too; VLOOKUP can’t, because the fee is left of the key.',
  },
  {
    id: 'b03-m2-2', lesson: 'lookups', type: 'mc', kind: 'conceptual',
    prompt: 'Moorfield Books, a fictional bookshop, gives loyalty discounts by yearly spend. Someone has sorted its band table from the largest band down: from $500, 15%; from $200, 10%; from $0, 0%. Each customer’s discount is found with <x>=VLOOKUP(B2,$E$2:$F$4,2,TRUE)</x>. What should the manager expect?',
    options: [
      'Wrong discounts or #N/A for many customers, and no warning about the order',
      'Correct discounts, because VLOOKUP notices that the table is sorted largest first and searches it upwards',
      'Discounts only for spends of exactly $0, $200 or $500, and #N/A for every other customer',
      'Correct discounts for every customer, as long as the fourth argument is changed from TRUE to FALSE',
    ],
    answer: 0,
    feedback: {
      1: 'VLOOKUP has no descending mode. Its approximate match assumes ascending order; on a table sorted the other way its answers can’t be trusted.',
      2: 'That is what an exact match would do. With TRUE on a reversed table some spends get #N/A and others the wrong band.',
      3: 'FALSE makes the lookup exact: only spends equal to a lower bound would be found. Bands need an approximate match on an ascending table.',
    },
    solution: 'VLOOKUP’s approximate match (and MATCH with match_type 1) assumes the first column is sorted from smallest to largest. On this reversed table the search goes wrong: spends under $200 come back #N/A and larger spends get the wrong band, and Excel gives no warning that the table is in the wrong order. Sort the band table ascending (0, 200, 500) and test a value on and either side of each boundary.',
  },
  {
    id: 'b03-m2-3', lesson: 'lookups', type: 'num', kind: 'numerical',
    prompt: 'Saltwick Inn, a fictional hotel, prices rooms per night from a rate card with room types down the side and seasons across the top: Single $85 (Low), $105 (Mid), $140 (High); Double $110, $135, $180; Suite $190, $230, $310. The rate card is in A1:D4 and its booking sheet finds each rate, for the room type in G2 and the season in H2, with <x>=INDEX($B$2:$D$4,MATCH(G2,$A$2:$A$4,0),MATCH(H2,$B$1:$D$1,0))</x>. A guest books 3 nights in a Double in the High season and 2 nights in a Suite in the Low season. What is the total charge?',
    answer: 3 * rate('Double', 'High') + 2 * rate('Suite', 'Low'), check: () => 3 * RATES.Double[2] + 2 * RATES.Suite[0], unit: '$', places: 2, tol: 0.005,
    wrong: [
      { value: 3 * swapped('Double', 'High') + 2 * swapped('Suite', 'Low'), say: 'You read the rate card with the row and column swapped. INDEX takes the row (room type) first and the column (season) second.' },
      { value: 3 * rate('Double', 'High') + 2 * rate('Suite', 'High'), say: 'The suite nights are in the Low season: $190 a night, not $310.' },
    ],
    solution: `The first MATCH finds the room’s row and the second the season’s column. Double in High is $${rate('Double', 'High')} and Suite in Low $${rate('Suite', 'Low')}: 3 × $${rate('Double', 'High')} + 2 × $${rate('Suite', 'Low')} = $${3 * rate('Double', 'High')} + $${2 * rate('Suite', 'Low')} = $${(3 * rate('Double', 'High') + 2 * rate('Suite', 'Low')).toFixed(2)}.`,
  },
  {
    id: 'b03-m2-4', lesson: 'lookups', type: 'formula', kind: 'applied',
    prompt: 'Moorfield Books charges online orders $3.99 shipping, $2.49 from $25.00, and nothing from $50.00 up. E1:F4 holds the bands. In C2, return the shipping charge for the order value in B2, and fill it down to C9.',
    sheet: { cells: ship, fixed: ['E2:E4'] }, cell: 'C2', fill: 'C2:C9', answer: '=VLOOKUP(B2,$E$2:$F$4,2,TRUE)',
    view: 'A1:F9', formats: { B: MONEY, C: MONEY, E: MONEY, F: MONEY }, widths: { B: 12, C: 10 },
    alt: ['=XLOOKUP(B2,$E$2:$E$4,$F$2:$F$4,,-1)', '=INDEX($F$2:$F$4,MATCH(B2,$E$2:$E$4,1))', '=VLOOKUP(B2,$E$2:$F$4,2)'],
    wrong: [
      { formula: '=VLOOKUP(B2,$E$2:$F$4,2,FALSE)', say: 'FALSE asks for an exact match: only order values equal to 0, 25 or 50 are found and the rest show #N/A. Bands need TRUE.' },
      { formula: '=XLOOKUP(B2,$E$2:$E$4,$F$2:$F$4)', say: 'XLOOKUP matches exactly by default. Add match_mode −1 (exact or next smaller) for bands.' },
      { formula: '=XLOOKUP(B2,$E$2:$E$4,$F$2:$F$4,,1)', say: 'Match mode 1 takes the next larger band: a $12.50 order would get the $25 rate. Use −1.' },
    ],
    solution: '<x>=VLOOKUP(B2,$E$2:$F$4,2,TRUE)</x> (or XLOOKUP with match_mode −1), filled to C9. A value equal to a lower bound belongs to that band, so $24.99 pays $3.99, $25.00 pays $2.49, $49.99 still pays $2.49 and $50.00 ships free. “From $50” starts the free band at 50; a rule of “over $50” would start it at 50.01.',
  },
  // ---------------------------------------------------------------- tables-and-cleaning
  {
    id: 'b03-m2-5', lesson: 'tables-and-cleaning', type: 'formula', kind: 'applied',
    prompt: 'A fictional European equipment supplier exports its invoice dates as eight digits of text, year first: 20260331 is 31 March 2026. In B2, turn A2 into a true date, and fill it down to B7.',
    sheet: { cells: dots }, cell: 'B2', fill: 'B2:B7', answer: '=DATE(LEFT(A2,4),MID(A2,5,2),RIGHT(A2,2))',
    view: 'A1:B7', formats: { B: 'date' }, widths: { A: 20, B: 14 },
    alt: ['=DATE(VALUE(LEFT(A2,4)),VALUE(MID(A2,5,2)),VALUE(RIGHT(A2,2)))', '=DATE(MID(A2,1,4),MID(A2,5,2),MID(A2,7,2))'],
    wrong: [
      { formula: '=VALUE(A2)', say: 'VALUE turns the text into the number 20,260,331, not a date: as a date serial it would be thousands of years away. Take the year, month and day apart and rebuild the date with DATE.' },
      { formula: '=DATEVALUE(A2)', say: 'Eight digits without separators aren’t a date format DATEVALUE recognises, so it returns #VALUE!. Build the date from its parts.' },
      { formula: '=DATE(LEFT(A2,4),RIGHT(A2,2),MID(A2,5,2))', say: 'DATE takes year, month, day: the month is the middle pair, <x>MID(A2,5,2)</x>, and the day the last two characters.' },
    ],
    solution: '<x>=DATE(LEFT(A2,4),MID(A2,5,2),RIGHT(A2,2))</x>, filled to B7: the year from the first four characters, the month from characters 5 and 6, the day from the last two. B2 shows 31 Mar 2026. DATE turns the text digits into numbers by itself.',
  },
  {
    id: 'b03-m2-6', lesson: 'tables-and-cleaning', type: 'formula', kind: 'numerical',
    prompt: 'Hartley Animal Rescue, a fictional charity, keeps its gifts in the table <code>Gifts</code> (A1:D12). Donors’ employers match gifts of $50 or more (matched = yes). In F2, use structured references to total the gifts that will be matched and are $50 or more.',
    sheet: { cells: gifts, tables: { Gifts: 'A1:D12' } }, cell: 'F2', answer: '=SUMIFS(Gifts[amount],Gifts[matched],"yes",Gifts[amount],">=50")',
    view: 'A1:F12', formats: { C: MONEY, F: MONEY }, widths: { B: 12, F: 14 },
    alt: ['=SUMIFS(Gifts[amount],Gifts[amount],">=50",Gifts[matched],"yes")', '=SUMIFS(C2:C12,D2:D12,"yes",C2:C12,">=50")', '=SUM(FILTER(Gifts[amount],(Gifts[matched]="yes")*(Gifts[amount]>=50)))'],
    wrong: [
      { formula: '=SUMIFS(Gifts[amount],Gifts[matched],"yes")', say: 'That includes the matched gifts under $50. Add a second condition on the amount column: <x>">=50"</x>.' },
      { formula: '=SUMIFS(Gifts[amount],Gifts[matched],"yes",Gifts[amount],">50")', say: '<x>">50"</x> leaves out a gift of exactly $50, which the employer does match. Use <x>">=50"</x>.' },
      { formula: '=SUMIFS(Gifts[amount],Gifts[amount],">=50")', say: 'That totals every gift of $50 or more, matched or not. Add the condition <x>"yes"</x> on the matched column.' },
    ],
    solution: `<x>=SUMIFS(Gifts[amount],Gifts[matched],"yes",Gifts[amount],">=50")</x> returns $${matched.toFixed(2)}: gifts G-202, G-207, G-209 and G-211 (G-204, $40.00, is matched but under $50). A plain-range version such as <x>=SUMIFS(C2:C12,D2:D12,"yes",C2:C12,">=50")</x> gives the same result and is marked right, but the table’s names stay right as gifts are added.`,
  },
  {
    id: 'b03-m2-7', lesson: 'tables-and-cleaning', type: 'mc', kind: 'conceptual',
    prompt: 'Hartley’s treasurer hides two rows of the Gifts table by hand (gifts still being checked) and filters out the test gifts the payment system created. Which formula totals only the gifts that are still visible?',
    options: [
      '<x>=SUBTOTAL(109,Gifts[amount])</x>',
      '<x>=SUBTOTAL(9,Gifts[amount])</x>',
      '<x>=SUM(Gifts[amount])</x>',
      '<x>=SUMIFS(Gifts[amount],Gifts[amount],">0")</x>',
    ],
    answer: 0,
    feedback: {
      1: 'Function number 9 leaves out rows hidden by a filter but includes rows hidden by hand, so the two gifts being checked would be counted.',
      2: 'SUM counts every row, hidden or not.',
      3: 'The condition tests the amount, not whether a row is visible: every positive gift is included.',
    },
    solution: 'SUBTOTAL with 101–111 excludes rows hidden by hand, and every SUBTOTAL excludes rows hidden by a filter. So <x>=SUBTOTAL(109,Gifts[amount])</x> sums exactly the visible gifts; it is also what a table’s total row uses for a sum.',
  },
  {
    id: 'b03-m2-8', lesson: 'tables-and-cleaning', type: 'classify', kind: 'conceptual',
    prompt: 'Which error does each formula return (Excel for Microsoft 365, US date settings)?',
    items: [
      '<x>=FILTER(Gifts[gift_id],Gifts[amount]>10000)</x>, when no gift is that large',
      '<x>=UNIQUE(Gifts[donor_type])</x>, typed in a cell with a note two cells below it',
      '<x>=XLOOKUP("G-999",Gifts[gift_id],Gifts[amount])</x>, for an id that isn’t in the table',
      '<x>=DATEVALUE("31.03.2026")</x>',
    ],
    categories: ['#CALC!', '#SPILL!', '#N/A', '#VALUE!'],
    answer: [0, 1, 2, 3],
    feedback: {
      0: 'FILTER returns #CALC! when nothing qualifies and no if_empty value is given, because Excel has no empty array.',
      1: 'UNIQUE returns three donor types, which must spill into the cells below; the note blocks them.',
      2: 'A lookup that finds no match returns #N/A unless if_not_found gives something else.',
      3: 'With US settings Excel doesn’t recognise day.month.year text as a date, so DATEVALUE returns #VALUE!.',
    },
    solution: 'FILTER with no matches and no if_empty: #CALC!. A spill range that isn’t empty: #SPILL!. A key that isn’t found: #N/A. Date text the computer’s settings don’t recognise: #VALUE!.',
  },
  // ---------------------------------------------------------------- pivot-tables
  {
    id: 'b03-m2-9', lesson: 'pivot-tables', type: 'num', kind: 'numerical',
    prompt: `Saltwick Inn’s PivotTable of room revenue has booking channel in Rows and months in Columns. July, August, September: Direct $${HB.Direct.map((x) => x.toLocaleString('en-US')).join(', $')}; Agency $${HB.Agency.map((x) => x.toLocaleString('en-US')).join(', $')}; Website $${HB.Website.map((x) => x.toLocaleString('en-US')).join(', $')}. Shown as % of Column Total, what does the Agency / August cell show? One decimal place.`,
    answer: r2(HB.Agency[1] / hbCol(1) * 1000) / 10, check: () => HB.Agency[1] / hbCol(1) * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: r2(HB.Agency[1] / sum(HB.Agency) * 1000) / 10, say: 'You divided by the Agency row’s total: that is % of Row Total. With months in Columns, % of Column Total divides by August’s total.' },
      { value: r2(HB.Agency[1] / hbAll * 1000) / 10, say: 'That is % of Grand Total, divided by all three months’ revenue.' },
    ],
    solution: `August’s column totals $${HB.Direct[1].toLocaleString('en-US')} + $${HB.Agency[1].toLocaleString('en-US')} + $${HB.Website[1].toLocaleString('en-US')} = $${hbCol(1).toLocaleString('en-US')}. Agency’s share: $${HB.Agency[1].toLocaleString('en-US')} ÷ $${hbCol(1).toLocaleString('en-US')} = ${(HB.Agency[1] / hbCol(1) * 100).toFixed(1)}% of August’s room revenue.`,
  },
  {
    id: 'b03-m2-10', lesson: 'pivot-tables', type: 'formula', kind: 'numerical',
    prompt: 'A1:C17 lists sixteen sales at Moorfield Books. A PivotTable with category in Rows shows Average of amount for Fiction. In E2, reproduce that figure with a formula so you can check it.',
    sheet: { cells: sales }, cell: 'E2', answer: '=AVERAGEIFS(C2:C17,B2:B17,"Fiction")',
    view: 'A1:E17', formats: { C: MONEY, E: MONEY }, widths: { B: 10, E: 20 },
    alt: ['=AVERAGEIF(B2:B17,"Fiction",C2:C17)', '=SUMIFS(C2:C17,B2:B17,"Fiction")/COUNTIFS(B2:B17,"Fiction")'],
    wrong: [
      { formula: '=AVERAGE(C2:C17)', say: 'That is the average of every sale. The PivotTable cell averages the Fiction sales only.' },
      { formula: '=SUMIFS(C2:C17,B2:B17,"Fiction")', say: 'That is the Fiction total, what Sum would show. Average divides it by the number of Fiction sales.' },
      { formula: '=SUMIFS(C2:C17,B2:B17,"Fiction")/16', say: 'You divided by all 16 sales, with a typed-in count. Divide by the number of Fiction sales, counted with COUNTIFS, or use AVERAGEIFS.' },
    ],
    solution: `<x>=AVERAGEIFS(C2:C17,B2:B17,"Fiction")</x> returns $${(sum(fiction) / fiction.length).toFixed(2)}: the ${fiction.length} Fiction sales total $${sum(fiction).toFixed(2)}, and $${sum(fiction).toFixed(2)} ÷ ${fiction.length} = $${(sum(fiction) / fiction.length).toFixed(2)}. It should equal the PivotTable’s cell.`,
  },
  {
    id: 'b03-m2-11', lesson: 'pivot-tables', type: 'mc', kind: 'applied',
    prompt: 'Saltwick Inn’s night manager builds a PivotTable on a bookings sheet that a colleague prepared. Its grand total of room revenue is exactly twice the revenue the booking system reports for the quarter, although every individual booking is correct. What is the most likely cause?',
    options: [
      'Subtotal rows typed among the bookings, which the PivotTable sums as if they were bookings',
      'The PivotTable has not been refreshed since the bookings were entered, so it is showing an old cache',
      'Revenue is summarised with Count instead of Sum, which doubles the figure for two-night stays',
      'A Filters field is hiding half of the bookings, and the hidden ones are added back into the total',
    ],
    answer: 0,
    feedback: {
      1: 'A stale cache would show the old figures, but it wouldn’t produce exactly twice the correct total.',
      2: 'Count would show how many bookings there are, a number unrelated to the revenue, not twice the revenue.',
      3: 'A filter removes records from the total; it never adds them back.',
    },
    solution: 'If the source holds subtotal rows, the PivotTable treats them as records and adds them to the bookings they summarise, so the total doubles. Source data should contain records only: delete the subtotal rows, refresh, and reconcile the grand total with the booking system again.',
  },
];
