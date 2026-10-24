// assess-final.js — B03 final assessment: 24 questions across all four modules, in proportion to their lessons (seven
// each for modules 1 and 2, five each for modules 3 and 4; two or three per lesson). 70% passes.
// Mixed conceptual, numerical and applied items; twelve ask for a formula (one as a step), the course’s characteristic
// exercise. Several combine skills: a lookup inside a conditional sum (b03-fn-9), a PivotTable filter reproduced with conditional sums
// (b03-fn-13), a PivotTable reading and a chart choice (b03-fn-14), a conditional format built on a date function
// (b03-fn-15), residuals from the least-squares line (b03-fn-18), Goal Seek on a grid built with mixed references
// (b03-fn-20) and a year-to-date dashboard tile (b03-fn-23).
// New questions on businesses used nowhere else on the site, not copies of lesson exercises, module-test items, the
// diagnostic or the project, and nothing from the project’s own questions (Lantern’s margins, delivery charges, shop
// model, stock plan or multiple regression). No hints; solutions are shown on review. Every business, record and number
// is fictional; every num item’s `check` recomputes its answer, and every formula item is marked by its results.

const MONEY = '$#,##0.00';
const DAY = 86400000;
const serial = (iso) => (Date.parse(`${iso}T00:00:00Z`) - Date.UTC(1899, 11, 30)) / DAY;
const sum = (a) => a.reduce((s, x) => s + x, 0);
const mean = (a) => sum(a) / a.length;
const r2 = (x) => Math.round(x * 100 + 1e-9) / 100;
const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dollars = (x) => `$${x.toLocaleString('en-US')}`;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dmy = (iso) => `${Number(iso.slice(8, 10))} ${MON[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;
/** Sheet cells for a header row in row 1 and records below, starting in column A; ISO dates become serial numbers. */
const grid = (head, rows) => {
  const cells = {};
  head.forEach((h, j) => { cells[`${String.fromCharCode(65 + j)}1`] = h; });
  rows.forEach((r, i) => r.forEach((v, j) => {
    if (v != null) cells[`${String.fromCharCode(65 + j)}${i + 2}`] = typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? serial(v) : v;
  }));
  return cells;
};
const weekdays = (from, to, holidays = []) => {
  let n = 0;
  for (let t = Date.parse(`${from}T00:00:00Z`); t <= Date.parse(`${to}T00:00:00Z`); t += DAY) {
    const d = new Date(t).getUTCDay();
    if (d !== 0 && d !== 6 && !holidays.includes(new Date(t).toISOString().slice(0, 10))) n++;
  }
  return n;
};

// ---------------------------------------------------------------- data (all fictional)
// Brightmoor Hardware: one invoice; sales tax rate in G1
const INVOICE = [['Hinge pair', 3, 4.29], ['Wood screws (100)', 2, 6.49], ['Paint roller', 1, 8.99], ['Masking tape', 4, 3.25],
  ['Cabinet handle', 6, 2.79], ['Wall plugs', 2, 1.99], ['Spirit level', 1, 21.50], ['Sandpaper pack', 3, 5.45]];
const TAX = 0.0625;
const lineTotals = INVOICE.map(([, q, p]) => r2(q * p));
const taxRounded = lineTotals.map((t) => r2(t * TAX));
// Jasperwood Furniture: orders, dispatch dates and three holidays
const HOLIDAYS = [['Thanksgiving', '2026-11-26'], ['Christmas Day', '2026-12-25'], ['New Year’s Day', '2027-01-01']];
const DISPATCH = [['J-501', '2026-11-23', '2026-11-30'], ['J-502', '2026-12-01', '2026-12-04'], ['J-503', '2026-12-21', '2026-12-29'],
  ['J-504', '2026-11-25', '2026-12-02'], ['J-505', '2026-12-30', '2027-01-06'], ['J-506', '2026-12-10', '2026-12-10'],
  ['J-507', '2026-12-14', '2026-12-18'], ['J-508', '2026-12-24', '2027-01-04']];
const hol = HOLIDAYS.map((h) => h[1]);
// Lowmoor Builders’ Merchant: purchase orders (received blank = still open)
const POS = [['PO-301', 'North Timber', '2026-09-08', '2026-09-07'], ['PO-302', 'Valley Bricks', '2026-09-10', '2026-09-11'],
  ['PO-303', 'North Timber', '2026-09-14', null], ['PO-304', 'Coastal Steel', '2026-09-09', null],
  ['PO-305', 'North Timber', '2026-09-21', null], ['PO-306', 'Valley Bricks', '2026-09-15', null],
  ['PO-307', 'North Timber', '2026-09-11', '2026-09-10'], ['PO-308', 'Coastal Steel', '2026-09-18', '2026-09-17'],
  ['PO-309', 'North Timber', '2026-09-17', null], ['PO-310', 'Valley Bricks', '2026-09-22', null],
  ['PO-311', 'North Timber', '2026-09-25', null], ['PO-312', 'Coastal Steel', '2026-09-24', null]];
const openNT = POS.filter((p) => p[1] === 'North Timber' && p[3] == null).sort((a, b) => (a[2] < b[2] ? -1 : 1));
const allNT = POS.filter((p) => p[1] === 'North Timber').sort((a, b) => (a[2] < b[2] ? -1 : 1));
// Lapwing Surf School: bookings
const SURF = [['L-01', 'group', 'weekend', 180], ['L-02', 'private', 'weekday', 95], ['L-03', 'private', 'weekend', 110],
  ['L-04', 'group', 'weekday', 150], ['L-05', 'group', 'weekend', 210], ['L-06', 'private', 'weekday', 85],
  ['L-07', 'group', 'weekday', 140], ['L-08', 'private', 'weekend', 120], ['L-09', 'private', 'weekday', 90],
  ['L-10', 'group', 'weekend', 195], ['L-11', 'private', 'weekday', 100], ['L-12', 'group', 'weekday', 160]];
const feeIf = (f) => sum(SURF.filter(f).map((s) => s[3]));
const surfGroup = feeIf((s) => s[1] === 'group'), surfWeekend = feeIf((s) => s[2] === 'weekend');
const surfBoth = feeIf((s) => s[1] === 'group' && s[2] === 'weekend'), surfEither = feeIf((s) => s[1] === 'group' || s[2] === 'weekend');
// Inglenook Removals: vehicles by capacity and eight jobs
const VEHICLES = [[10, 'Small van', 95], [18, 'Luton van', 140], [30, '7.5-tonne truck', 210], [45, '18-tonne truck', 290]];
const LOADS = [8, 10, 10.5, 18, 22, 29.5, 31, 44];
// Silverbirch Car Wash: sites, reopening dates after a refit, and sales
const SITES = [['Canal Street', '2026-06-15'], ['Hill Road', '2026-07-06'], ['Market Square', '2026-06-01'], ['Abbey Park', '2026-07-20']];
const WASHES = [['Hill Road', '2026-06-12', 42], ['Canal Street', '2026-06-13', 38], ['Market Square', '2026-06-20', 55], ['Hill Road', '2026-06-27', 36],
  ['Abbey Park', '2026-07-01', 48], ['Hill Road', '2026-07-06', 61], ['Canal Street', '2026-07-08', 44], ['Hill Road', '2026-07-11', 39],
  ['Market Square', '2026-07-12', 52], ['Abbey Park', '2026-07-22', 47], ['Hill Road', '2026-07-25', 58], ['Canal Street', '2026-08-01', 41],
  ['Hill Road', '2026-08-03', 46], ['Market Square', '2026-08-09', 63], ['Abbey Park', '2026-08-15', 50], ['Hill Road', '2026-08-22', 54],
  ['Canal Street', '2026-06-10', 35], ['Market Square', '2026-05-30', 40], ['Abbey Park', '2026-07-18', 45], ['Hill Road', '2026-07-05', 33],
].sort((a, b) => (a[1] < b[1] ? -1 : 1));
const reopenHR = SITES.find((s) => s[0] === 'Hill Road')[1];
const hillSince = sum(WASHES.filter((w) => w[0] === 'Hill Road' && w[1] >= reopenHR).map((w) => w[2]));
const hillAll = sum(WASHES.filter((w) => w[0] === 'Hill Road').map((w) => w[2]));
// Oxbow Seed Company: a European supplier’s weights, as text
const WEIGHTS = ['2,5 kg', '0,75 kg', '12 kg', '1,2 kg', '0,4 kg', '10,25 kg', '3 kg'];
// Cobalt Bay Dive Centre: bookings by dive and channel
const DIVES = [['CB-401', 'Reef', 'website', 65], ['CB-402', 'Wreck', 'walk-in', 90], ['CB-403', 'Night', 'hotel desk', 95], ['CB-404', 'Wreck', 'website', 85],
  ['CB-405', 'Reef', 'walk-in', 70], ['CB-406', 'Wreck', 'hotel desk', 80], ['CB-407', 'Reef', 'hotel desk', 60], ['CB-408', 'Night', 'website', 95],
  ['CB-409', 'Wreck', 'website', 85], ['CB-410', 'Reef', 'website', 65], ['CB-411', 'Wreck', 'walk-in', 90], ['CB-412', 'Night', 'walk-in', 100],
  ['CB-413', 'Wreck', 'hotel desk', 80], ['CB-414', 'Reef', 'website', 65], ['CB-415', 'Night', 'hotel desk', 95], ['CB-416', 'Wreck', 'website', 85],
  ['CB-417', 'Reef', 'walk-in', 70], ['CB-418', 'Wreck', 'website', 85], ['CB-419', 'Night', 'website', 95], ['CB-420', 'Reef', 'hotel desk', 60]];
const wreck = (f) => sum(DIVES.filter((d) => d[1] === 'Wreck' && f(d[2])).map((d) => d[3]));
// Ormond Stationers: sales by product line and quarter
const ORMOND = [['Pens', [3600, 3900, 4500, 4200]], ['Paper', [5800, 6400, 7100, 6100]], ['Art supplies', [2900, 3100, 3800, 3300]], ['Gifts', [2100, 2400, 3100, 8400]]];
const q3Total = sum(ORMOND.map((l) => l[1][2])), q4Total = sum(ORMOND.map((l) => l[1][3]));
const gifts = ORMOND.find((l) => l[0] === 'Gifts')[1];
const ormondAll = sum(ORMOND.flatMap((l) => l[1]));
// Heronsgate Pottery Studio: one week’s rota
const ROTA_DAYS = ['2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11', '2026-09-12', '2026-09-13'];
const ROTA = [['Wheel room', [7.5, 7.5, 6, 7.5, 8, 9, 5]], ['Glazing', [4, 6, 6, 4, 6, 7, 3]], ['Kiln', [2, 2.5, 2, 2.5, 3, 4, 2]], ['Shop', [8, 8, 8, 8, 8, 10, 6]]];
const rota = { A1: 'Area', A7: 'Rule test', A8: 'for row 2', A9: 'for row 3', A10: 'for row 4', A11: 'for row 5' };
const rotaFormats = {};
ROTA_DAYS.forEach((d, j) => { const c = String.fromCharCode(66 + j); rota[`${c}1`] = serial(d); rotaFormats[`${c}1`] = 'ddd d mmm'; });
ROTA.forEach(([area, hours], i) => { rota[`A${i + 2}`] = area; hours.forEach((h, j) => { rota[`${String.fromCharCode(66 + j)}${i + 2}`] = h; }); });
// Waxwing Juice Bar: twelve weeks of temperature and smoothie sales
const TEMP = [14, 17, 21, 19, 24, 27, 22, 18, 25, 29, 16, 23];
const SMOOTHIES = [410, 465, 560, 515, 640, 690, 580, 470, 655, 745, 420, 600];
const mx = mean(TEMP), my = mean(SMOOTHIES);
const slope = sum(TEMP.map((x, i) => (x - mx) * (SMOOTHIES[i] - my))) / sum(TEMP.map((x) => (x - mx) ** 2));
const intercept = my - slope * mx;
const resid1 = SMOOTHIES[0] - (intercept + slope * TEMP[0]);
// Starling Street Food: profit grid inputs
const TRUCK = { variable: 4.2, fixed: 310, prices: [8, 9, 10, 11, 12], meals: [60, 80, 100, 120, 140] };
const truckProfit = (meals, price) => meals * (price - TRUCK.variable) - TRUCK.fixed;
// Wildflower Wedding Barn: events and revenue
const BARN = [['2025-11-15', 'Wedding', 8200], ['2025-12-06', 'Party', 2400], ['2026-01-17', 'Corporate', 3100], ['2026-02-14', 'Wedding', 6900],
  ['2026-03-21', 'Party', 1850], ['2026-04-11', 'Wedding', 9400], ['2026-04-25', 'Corporate', 2750], ['2026-05-09', 'Wedding', 10200],
  ['2026-05-30', 'Party', 2100], ['2026-06-06', 'Wedding', 11500], ['2026-06-20', 'Wedding', 9800], ['2026-06-30', 'Corporate', 3300],
  ['2026-07-11', 'Wedding', 12100], ['2026-07-25', 'Party', 2600], ['2026-08-08', 'Wedding', 10900], ['2026-08-22', 'Wedding', 11200],
  ['2026-09-12', 'Wedding', 9700], ['2026-10-03', 'Corporate', 3400], ['2026-11-14', 'Party', 2300], ['2026-12-12', 'Wedding', 7600]];
const barnYTD = sum(BARN.filter((b) => b[0] >= '2026-01-01' && b[0] <= '2026-06-30').map((b) => b[2]));

export const items = [
  // ================================================================ Module 1: formulas that work
  {
    id: 'b03-fn-1', lesson: 'cells-and-formulas', type: 'fill', kind: 'conceptual',
    prompt: 'Choose what Excel returns for each formula.',
    text: '<x>=-4^2</x> returns [[0]]; <x>=10-4^2</x> returns [[1]]; <x>=2^3^2</x> returns [[2]]; <x>=(1+5%)^2*100</x> returns [[3]].',
    blanks: [
      { options: ['−16', '16', '#VALUE!'], answer: 1 },
      { options: ['36', '26', '−6'], answer: 2 },
      { options: ['64', '512', '18'], answer: 0 },
      { options: ['10.25', '110.5', '110.25'], answer: 2 },
    ],
    solution: 'Negation is applied before ^, so <x>=-4^2</x> squares −4: 16. In <x>=10-4^2</x> the minus is subtraction, which comes after ^: 10 − 16 = −6. Operators on the same level are worked from left to right, so <x>=2^3^2</x> is (2³)² = 8² = 64, not 2⁹ = 512 as in algebra. The % turns 5 into 0.05, so (1 + 5%)² = 1.05² = 1.1025, and × 100 gives 110.25. Parentheses remove the doubt: write <x>=-(4^2)</x> or <x>=2^(3^2)</x> if that is what you mean.',
  },
  {
    id: 'b03-fn-2', lesson: 'cells-and-formulas', type: 'formula', kind: 'numerical',
    prompt: 'Brightmoor Hardware (fictional) charges sales tax at the rate in G1 on each line of an invoice, rounded to the cent, because each line shows and charges whole cents. Line totals are in D2:D9. In E2, write the sales tax on the first line, in a formula that will be filled down to E9.',
    sheet: { cells: {
      ...grid(['Item', 'Qty', 'Unit price', 'Line total', 'Sales tax'], INVOICE),
      ...Object.fromEntries(INVOICE.map((_, i) => [`D${i + 2}`, `=B${i + 2}*C${i + 2}`])),
      F1: 'Tax rate', G1: TAX,
    } },
    cell: 'E2', fill: 'E2:E9', view: 'A1:G9',
    formats: { C: MONEY, D: MONEY, E: MONEY, G1: '0.00%' }, widths: { A: 17, F: 9 },
    answer: '=ROUND(D2*$G$1,2)',
    alt: ['=ROUND($G$1*D2,2)', '=ROUND(B2*C2*$G$1,2)'],
    wrong: [
      { formula: '=D2*$G$1', say: 'The money format shows two decimals, but the cell keeps 0.804375 and the invoice charges $0.80. Round the stored value: ROUND(…,2).' },
      { formula: '=ROUND(D2*G1,2)', say: 'Filled down, G1 becomes G2, G3 … which are empty, so the lower lines show $0.00. Fix the rate with $G$1.' },
      { formula: '=ROUNDUP(D2*$G$1,2)', say: 'ROUNDUP always goes up: $0.804 becomes $0.81. Tax to the nearest cent uses ROUND.' },
      { formula: '=ROUND(D2*$G$1,0)', say: 'With 0 digits ROUND goes to whole dollars. Cents need 2.' },
    ],
    solution: `<x>=ROUND(D2*$G$1,2)</x>. The hinge line: ${lineTotals[0].toFixed(2)} × 6.25% = ${(lineTotals[0] * TAX).toFixed(6)}, stored as ${money(taxRounded[0])}. Without ROUND each cell would only look rounded: the eight unrounded amounts add to ${(sum(lineTotals) * TAX).toFixed(6)}, which a money format shows as ${money(r2(sum(lineTotals) * TAX))}, while the lines the customer sees add to ${money(r2(sum(taxRounded)))}. Rounding each line with ROUND makes the invoice add up to the cents it shows.`,
  },
  {
    id: 'b03-fn-3', lesson: 'cells-and-formulas', type: 'mc', kind: 'conceptual',
    prompt: 'Cloudberry Cinema (fictional) pastes 16-digit loyalty-card numbers into a column formatted as Number with no decimal places. Card 4417123456789113 appears as 4417123456789110, and lookups by card number begin to fail. What is happening, and what is the fix?',
    options: [
      'Excel keeps 15 significant digits, so the 16th becomes 0; store the card numbers as text instead.',
      'The Number format rounds only what is displayed; widen the column and the full number appears again.',
      'Excel rounds numbers longer than 15 digits up to the next ten; divide each one by 10 and round it back.',
      'The numbers are too large for a lookup to handle; split each one into two halves of eight digits each.',
    ],
    answer: 0,
    feedback: {
      1: 'It isn’t the display: the stored number itself has lost its last digit, so no format or column width brings it back.',
      2: 'Digits after the 15th are replaced by zeros, and no arithmetic can recover a digit that was never stored.',
      3: 'Lookups handle large numbers; the trouble is that the stored numbers are no longer the card numbers. Identifiers like these should be text.',
    },
    solution: 'Excel keeps numbers to 15 significant digits, and Microsoft notes that digits after the 15th are changed to zero. A card number is an identifier, not a quantity (nobody adds card numbers), so store it as text: format the column as Text before the numbers go in (Microsoft notes that formatting afterwards doesn’t change numbers already entered), or type an apostrophe before each number. Then bring the numbers in again from the source.',
  },
  {
    id: 'b03-fn-4', lesson: 'functions-and-logic', type: 'formula', kind: 'applied',
    prompt: 'Jasperwood Furniture (fictional) measures how long each order takes to dispatch in working days: Monday to Friday, from the order date to the dispatch date with both days counted, leaving out the holidays in F2:F4. In D2, write the formula for the first order, so that it can be filled down to D9.',
    sheet: { cells: {
      ...grid(['Order', 'Ordered', 'Dispatched', 'Working days'], DISPATCH),
      E1: 'Holiday', F1: 'Date', ...Object.fromEntries(HOLIDAYS.flatMap(([name, d], i) => [[`E${i + 2}`, name], [`F${i + 2}`, serial(d)]])),
    } },
    cell: 'D2', fill: 'D2:D9', view: 'A1:F9',
    formats: { B: 'date', C: 'date', F: 'date' }, widths: { B: 12, C: 12, D: 13, E: 15, F: 12 },
    answer: '=NETWORKDAYS(B2,C2,$F$2:$F$4)',
    alt: ['=NETWORKDAYS(B2,C2,F$2:F$4)'],
    wrong: [
      { formula: '=NETWORKDAYS(B2,C2)', say: 'Without the third argument the holidays count as working days: J-501 would show 6 instead of 5, because 26 November is Thanksgiving.' },
      { formula: '=NETWORKDAYS(B2,C2,F2:F4)', say: 'Filled down, the holiday range slides to F3:F5, F4:F6 … and loses holidays: J-504 counts Thanksgiving. Lock it with $.' },
      { formula: '=C2-B2', say: 'Subtracting dates counts calendar days, weekends and holidays included, and leaves out the first day. NETWORKDAYS counts working days.' },
      { formula: '=C2-B2+1', say: 'That counts every calendar day, weekends and holidays included. NETWORKDAYS counts Monday to Friday and skips the holidays you list.' },
    ],
    solution: `<x>=NETWORKDAYS(B2,C2,$F$2:$F$4)</x>: Monday to Friday from the order date to the dispatch date, both counted, less any holiday in the list. J-504 (Wednesday 25 November to Wednesday 2 December) has ${weekdays('2026-11-25', '2026-12-02')} weekdays, one of them Thanksgiving, so ${weekdays('2026-11-25', '2026-12-02', hol)} working days; J-508 (24 December to 4 January) has ${weekdays('2026-12-24', '2027-01-04', hol)}, after Christmas Day and New Year’s Day are left out.`,
  },
  {
    id: 'b03-fn-5', lesson: 'functions-and-logic', type: 'fill', kind: 'numerical',
    prompt: 'B2 holds the date 20 May 2026. Choose what each formula returns, shown as a date.',
    text: '<x>=DATE(2026,14,1)</x> returns [[0]]; <x>=DATE(2026,3,0)</x> returns [[1]]; <x>=EOMONTH(B2,-1)+1</x> returns [[2]]; <x>=EDATE(B2,-2)</x> returns [[3]].',
    blanks: [
      { options: ['1 Feb 2026', '1 Feb 2027', '#NUM!'], answer: 1 },
      { options: ['1 Mar 2026', '#NUM!', '28 Feb 2026'], answer: 2 },
      { options: ['1 May 2026', '30 Apr 2026', '1 Jun 2026'], answer: 0 },
      { options: ['21 Mar 2026', '20 Mar 2026', '20 Jul 2026'], answer: 1 },
    ],
    solution: 'DATE rolls extra months into the next year: month 14 of 2026 is February 2027. A day of 0 is the day before the 1st, so <x>=DATE(2026,3,0)</x> is the last day of February, 28 Feb 2026. <x>=EOMONTH(B2,-1)</x> is the last day of the month before (30 April), and adding 1 gives the first day of B2’s month, 1 May 2026. EDATE moves by whole months: two months before 20 May is 20 March, while subtracting 60 days would land on 21 March, because a month is not 30 days.',
  },
  {
    id: 'b03-fn-6', lesson: 'conditional-sums-and-counts', type: 'formula', kind: 'applied',
    prompt: 'Lowmoor Builders’ Merchant (fictional) lists its purchase orders with the supplier in column B, the due date in C and the date received in D, which is empty while an order is still outstanding. In G2, write a formula for the earliest due date among the outstanding orders of the supplier named in G1.',
    sheet: { cells: { ...grid(['PO', 'Supplier', 'Due', 'Received'], POS), F1: 'Supplier', G1: 'North Timber', F2: 'Earliest open due date' }, vary: { G1: ['Valley Bricks', 'Coastal Steel'] } },
    cell: 'G2', view: 'A1:G13',
    formats: { C: 'date', D: 'date', G2: 'date' }, widths: { B: 13, C: 12, D: 12, F: 20, G: 13 },
    answer: '=MINIFS(C2:C13,B2:B13,G1,D2:D13,"")',
    alt: ['=MINIFS(C2:C13,D2:D13,"",B2:B13,G1)', '=MIN(FILTER(C2:C13,(B2:B13=G1)*(D2:D13="")))'],
    wrong: [
      { formula: '=MINIFS(C2:C13,B2:B13,G1)', say: `That includes orders already received: ${dmy(allNT[0][2])} belongs to ${allNT[0][0]}, which arrived. Add the criterion <x>""</x> on the received column.` },
      { formula: '=MINIFS(C2:C13,B2:B13,G1,D2:D13,"<>")', say: '<x>"<>"</x> keeps the rows whose received date is not empty: the orders already delivered. Outstanding ones match <x>""</x>.' },
      { formula: '=MAXIFS(C2:C13,B2:B13,G1,D2:D13,"")', say: 'MAXIFS returns the latest due date. The earliest is the smallest date: MINIFS.' },
      { formula: '=MINIFS(C2:C13,D2:D13,"")', say: 'That is the earliest outstanding order of any supplier. Add the supplier criterion, B2:B13 = G1.' },
    ],
    solution: `<x>=MINIFS(C2:C13,B2:B13,G1,D2:D13,"")</x> returns ${dmy(openNT[0][2])} (${openNT[0][0]}). MINIFS takes the range to search first, then pairs of criteria ranges and criteria; the criterion <x>""</x> keeps only rows whose received date is empty. Without it the answer would be ${dmy(allNT[0][2])}, an order already delivered. MINIFS needs Excel 2019 or later, or Microsoft 365.`,
  },
  {
    id: 'b03-fn-7', lesson: 'conditional-sums-and-counts', type: 'formula', kind: 'numerical',
    prompt: 'Lapwing Surf School (fictional) pays its instructors a bonus on the fees of bookings that are group lessons or fall on a weekend, or both. Lesson type is in column B, day in C and fee in D. In G2, write one formula for the total fees that qualify, counting each booking once.',
    sheet: { cells: { ...grid(['Booking', 'Lesson', 'Day', 'Fee'], SURF), F2: 'Group or weekend' } },
    cell: 'G2', view: 'A1:G13',
    formats: { D: MONEY, G2: MONEY }, widths: { C: 10, F: 17, G: 11 },
    answer: '=SUMIFS(D2:D13,B2:B13,"group")+SUMIFS(D2:D13,C2:C13,"weekend")-SUMIFS(D2:D13,B2:B13,"group",C2:C13,"weekend")',
    alt: [
      '=SUMPRODUCT((((B2:B13="group")+(C2:C13="weekend"))>0)*D2:D13)',
      '=SUM(D2:D13)-SUMIFS(D2:D13,B2:B13,"private",C2:C13,"weekday")',
      '=SUMIFS(D2:D13,B2:B13,"group")+SUMIFS(D2:D13,B2:B13,"private",C2:C13,"weekend")',
    ],
    wrong: [
      { formula: '=SUMIFS(D2:D13,B2:B13,"group")+SUMIFS(D2:D13,C2:C13,"weekend")', say: 'Group lessons on a weekend are in both sums, so they are counted twice. Subtract that overlap, or use SUMPRODUCT.' },
      { formula: '=SUMIFS(D2:D13,B2:B13,"group",C2:C13,"weekend")', say: 'Criteria in one SUMIFS must all hold: that is group lessons on a weekend only (AND). The bonus needs either (OR).' },
      { formula: '=SUMPRODUCT(((B2:B13="group")+(C2:C13="weekend"))*D2:D13)', say: 'Adding the two tests gives 2 for a group lesson on a weekend, so its fee counts twice. Turn the sum into 1 or 0 with >0.' },
    ],
    solution: `<x>=SUMIFS(D2:D13,B2:B13,"group")+SUMIFS(D2:D13,C2:C13,"weekend")-SUMIFS(D2:D13,B2:B13,"group",C2:C13,"weekend")</x> = ${dollars(surfGroup)} + ${dollars(surfWeekend)} − ${dollars(surfBoth)} = ${money(surfEither)}. The two conditions overlap (group lessons at weekends), so adding the sums would count ${dollars(surfBoth)} twice. Equivalent routes: everything except private weekday lessons, or SUMPRODUCT with <x>((B2:B13="group")+(C2:C13="weekend"))>0</x> as a 1-or-0 test.`,
  },

  // ================================================================ Module 2: finding and summarising data
  {
    id: 'b03-fn-8', lesson: 'lookups', type: 'formula', kind: 'applied',
    prompt: 'Inglenook Removals (fictional) sends the smallest vehicle that can carry a job’s load. Vehicles are listed in E1:G5 by capacity, smallest first, and a load equal to a capacity fits. In C2, return the vehicle for the load in B2, and fill it down to C9.',
    sheet: { cells: {
      ...grid(['Job', 'Load (m³)', 'Vehicle'], LOADS.map((l, i) => [`R-${611 + i}`, l])),
      E1: 'Capacity (m³)', F1: 'Vehicle', G1: 'Day rate',
      ...Object.fromEntries(VEHICLES.flatMap(([c, v, rate], i) => [[`E${i + 2}`, c], [`F${i + 2}`, v], [`G${i + 2}`, rate]])),
    }, fixed: ['E2:E5'] },
    cell: 'C2', fill: 'C2:C9', view: 'A1:G9',
    formats: { G: MONEY }, widths: { B: 10, C: 15, E: 13, F: 15 },
    answer: '=XLOOKUP(B2,$E$2:$E$5,$F$2:$F$5,,1)',
    alt: ['=XLOOKUP(B2,$E$2:$E$5,$F$2:$F$5,,1,1)', '=INDEX($F$2:$F$5,XMATCH(B2,$E$2:$E$5,1))'],
    wrong: [
      { formula: '=XLOOKUP(B2,$E$2:$E$5,$F$2:$F$5,,-1)', say: 'Match mode −1 returns the next smaller capacity: a 10.5 m³ load would get the 10 m³ van, which can’t take it. Use 1, exact or next larger.' },
      { formula: '=VLOOKUP(B2,$E$2:$F$5,2,TRUE)', say: 'An approximate VLOOKUP returns the band whose lower bound is not above the value: the next smaller vehicle. Here you need the next larger: XLOOKUP with match mode 1.' },
      { formula: '=XLOOKUP(B2,$E$2:$E$5,$F$2:$F$5)', say: 'XLOOKUP matches exactly by default, so only loads equal to a capacity are found and the rest show #N/A.' },
      { formula: '=XLOOKUP(B2,E2:E5,F2:F5,,1)', say: 'Without $ the vehicle table slides down as the formula is filled. Lock both ranges.' },
    ],
    solution: '<x>=XLOOKUP(B2,$E$2:$E$5,$F$2:$F$5,,1)</x>: match mode 1 returns an exact match or else the next larger capacity, which is the smallest vehicle big enough. 10 m³ fits the small van exactly; 10.5 m³ needs the Luton van. Match mode −1, like VLOOKUP’s TRUE, would pick the next smaller vehicle instead. A load over 45 m³ returns #N/A, which an if_not_found such as “two trips” could replace. XLOOKUP needs Excel for Microsoft 365, 2021 or 2024.',
  },
  {
    id: 'b03-fn-9', lesson: 'lookups', type: 'formula', kind: 'applied',
    prompt: 'Silverbirch Car Wash (fictional) refitted its four sites this summer; E1:F5 gives each site’s reopening date. Sales are in A2:C21 (site, date, amount). In F8, total the sales of the site named in F7 on or after its reopening date, in one formula that still works when F7 names another site.',
    sheet: { cells: {
      ...grid(['Site', 'Date', 'Amount'], WASHES),
      E1: 'Site', F1: 'Reopened', ...Object.fromEntries(SITES.flatMap(([s, d], i) => [[`E${i + 2}`, s], [`F${i + 2}`, serial(d)]])),
      E7: 'Site', F7: 'Hill Road', E8: 'Sales since reopening',
    }, vary: { F7: ['Canal Street', 'Market Square', 'Abbey Park'] } },
    cell: 'F8', view: 'A1:F21',
    formats: { B: 'date', C: MONEY, F2: 'date', F3: 'date', F4: 'date', F5: 'date', F8: MONEY }, widths: { A: 14, B: 12, E: 20, F: 13 },
    answer: '=SUMIFS(C2:C21,A2:A21,F7,B2:B21,">="&XLOOKUP(F7,E2:E5,F2:F5))',
    alt: [
      '=SUMIFS(C2:C21,A2:A21,F7,B2:B21,">="&INDEX(F2:F5,MATCH(F7,E2:E5,0)))',
      '=SUMIFS(C2:C21,A2:A21,F7,B2:B21,">="&VLOOKUP(F7,E2:F5,2,FALSE))',
      '=SUMPRODUCT((A2:A21=F7)*(B2:B21>=XLOOKUP(F7,E2:E5,F2:F5))*C2:C21)',
    ],
    wrong: [
      { formula: '=SUMIFS(C2:C21,A2:A21,F7)', say: 'That is all of Hill Road’s sales, including those before the refit. Add a date criterion: on or after the reopening date looked up for the site.' },
      { formula: '=SUMIFS(C2:C21,B2:B21,">="&XLOOKUP(F7,E2:E5,F2:F5))', say: 'That totals every site’s sales since Hill Road reopened. Add the site criterion, A2:A21 = F7.' },
      { formula: '=SUMIFS(C2:C21,A2:A21,F7,B2:B21,">"&XLOOKUP(F7,E2:E5,F2:F5))', say: '“On or after” includes the reopening day itself, when Hill Road took $61.00. Use <x>">="</x>.' },
      { formula: '=SUMIFS(C2:C21,A2:A21,F7,B2:B21,">="&F2)', say: 'F2 is Canal Street’s reopening date. Look up the date of the site named in F7, so the formula follows F7.' },
    ],
    solution: `<x>=SUMIFS(C2:C21,A2:A21,F7,B2:B21,">="&XLOOKUP(F7,E2:E5,F2:F5))</x> returns ${money(hillSince)}. XLOOKUP finds the reopening date of the site in F7 (${dmy(reopenHR)} for Hill Road), and the criterion <x>">="&</x> joins it to the operator, so SUMIFS adds only that site’s sales from that day on. All of Hill Road’s sales came to ${money(hillAll)}; the ${money(hillAll - hillSince)} before the refit is left out.`,
  },
  {
    id: 'b03-fn-10', lesson: 'lookups', type: 'mc', kind: 'conceptual',
    prompt: 'Fairlight Interiors (fictional) pays its sales advisers a bonus rate on monthly sales from a band table in E2:F4: from $2,000, 1%; from $5,000, 2%; from $10,000, 3%. The bonus is <x>=B2*VLOOKUP(B2,$E$2:$F$4,2,TRUE)</x>. A new adviser with $1,450 of sales gets #N/A. What is wrong, and what is the fix?',
    options: [
      'No band starts at or below $1,450; add a first band from $0 at 0% to the table.',
      'An approximate match needs the band table sorted from the largest band down.',
      '$1,450 isn’t in the first column, so the lookup needs FALSE to make an exact match.',
      'XLOOKUP with match mode −1 would return the 0% band that VLOOKUP can’t find.',
    ],
    answer: 0,
    feedback: {
      1: 'Approximate match assumes ascending order; sorting the other way gives unreliable answers, not a fix.',
      2: 'An exact match would fail for almost everyone: sales rarely equal a band’s lower bound. Bands need an approximate match.',
      3: 'There is no 0% band to find. Match mode −1 also returns #N/A when nothing in the table is as small as the lookup value.',
    },
    solution: 'With an approximate match VLOOKUP returns the band whose lower bound is the largest one not above the value, and Microsoft notes that a value smaller than the smallest in the first column returns #N/A. Add a row (0, 0%) at the top of the table so every sales figure from $0 lands in a band, then test values on and either side of each boundary.',
  },
  {
    id: 'b03-fn-11', lesson: 'tables-and-cleaning', type: 'formula', kind: 'applied',
    prompt: 'Oxbow Seed Company (fictional) receives a European supplier’s packing list in which weights are text with a decimal comma and a unit, such as “2,5 kg” for two and a half kilograms. In B2, convert A2 into the number of kilograms (2.5) so that it calculates correctly with US settings, and fill it down to B8.',
    sheet: { cells: { A1: 'Weight (as received)', B1: 'kg', ...Object.fromEntries(WEIGHTS.map((w, i) => [`A${i + 2}`, w])) } },
    cell: 'B2', fill: 'B2:B8', view: 'A1:B8',
    formats: { B: '0.00' }, widths: { A: 20, B: 8 },
    answer: '=VALUE(SUBSTITUTE(SUBSTITUTE(A2," kg",""),",","."))',
    alt: [
      '=VALUE(SUBSTITUTE(SUBSTITUTE(A2,",",".")," kg",""))',
      '=VALUE(SUBSTITUTE(LEFT(A2,LEN(A2)-3),",","."))',
      '=VALUE(SUBSTITUTE(TEXTBEFORE(A2," "),",","."))',
      '=--SUBSTITUTE(SUBSTITUTE(A2," kg",""),",",".")',
      '=NUMBERVALUE(SUBSTITUTE(A2,"kg",""),",",".")',
    ],
    wrong: [
      { formula: '=VALUE(A2)', say: 'VALUE can’t read text with a unit after the number: it returns #VALUE!. Remove “ kg” and swap the comma first.' },
      { formula: '=SUBSTITUTE(SUBSTITUTE(A2," kg",""),",",".")', say: 'That gives the text “2.5”, which looks right but is still text: SUM skips it. Wrap it in VALUE.' },
      { formula: '=VALUE(SUBSTITUTE(A2," kg",""))', say: 'With US settings the comma isn’t a decimal separator, so VALUE doesn’t return 2.5. Swap the comma for a full stop as well.' },
    ],
    solution: '<x>=VALUE(SUBSTITUTE(SUBSTITUTE(A2," kg",""),",","."))</x>: the inner SUBSTITUTE removes the unit, the outer one swaps the decimal comma for a full stop, and VALUE turns the text “2.5” into the number 2.5. Values without a comma, such as “12 kg”, pass through unchanged. In Excel 2016 and later, <x>=NUMBERVALUE(SUBSTITUTE(A2,"kg",""),",",".")</x> does the same, because NUMBERVALUE takes the decimal separator as an argument and ignores spaces. Keep the supplier’s column untouched, convert in a new one, and record the step in the cleaning log.',
  },
  {
    id: 'b03-fn-12', lesson: 'tables-and-cleaning', type: 'mc', kind: 'conceptual',
    prompt: 'Lindenhof Café (fictional) records tips in an Excel table named Tips, with the columns date, server and amount. It adds a column, share, with the calculated column <x>=[@amount]/SUM([amount])</x>. What does each row of share show?',
    options: [
      'That row’s tip as a share of the total of all the tips in the Tips table',
      '1 in every row, because both references point at that row’s amount',
      'A running share that grows as the formula goes down the table, row by row',
      '#SPILL!, because a whole column can’t be used inside a table’s formula',
    ],
    answer: 0,
    feedback: {
      1: '<x>[@amount]</x> is the amount in the same row, but <x>[amount]</x> without @ is the whole column, so the SUM is the table’s total.',
      2: 'A column reference in a table means the whole column wherever the formula sits; nothing in it moves row by row.',
      3: 'SUM turns the column into one number, so nothing spills: the formula returns one value in each row.',
    },
    solution: 'In a table, <x>[@amount]</x> is the amount in the same row and <x>[amount]</x> is the whole amount column (its data, without the header or total row). Each row divides its own tip by the total of all tips, so the shares add up to 100%, and they update when rows are added, because the column reference grows with the table.',
  },
  {
    id: 'b03-fn-13', lesson: 'pivot-tables', type: 'formula', kind: 'numerical',
    prompt: 'Cobalt Bay Dive Centre (fictional) built a PivotTable on A1:D21 with dive in Rows, Sum of price in Values, and channel in the Filters area with two of its three items ticked: website and hotel desk. In G2, reproduce the PivotTable’s figure for Wreck with a formula, so that you can reconcile it.',
    sheet: { cells: { ...grid(['Booking', 'Dive', 'Channel', 'Price'], DIVES), F2: 'Wreck (filtered)' } },
    cell: 'G2', view: 'A1:G21',
    formats: { D: MONEY, G2: MONEY }, widths: { C: 11, F: 15 },
    answer: '=SUMIFS(D2:D21,B2:B21,"Wreck",C2:C21,"website")+SUMIFS(D2:D21,B2:B21,"Wreck",C2:C21,"hotel desk")',
    alt: [
      '=SUMIFS(D2:D21,B2:B21,"Wreck",C2:C21,"<>walk-in")',
      '=SUMIFS(D2:D21,B2:B21,"Wreck")-SUMIFS(D2:D21,B2:B21,"Wreck",C2:C21,"walk-in")',
      '=SUMPRODUCT((B2:B21="Wreck")*((C2:C21="website")+(C2:C21="hotel desk"))*D2:D21)',
    ],
    wrong: [
      { formula: '=SUMIFS(D2:D21,B2:B21,"Wreck")', say: 'That is every wreck dive, walk-ins included. The filter leaves walk-in bookings out of the whole PivotTable.' },
      { formula: '=SUMIFS(D2:D21,B2:B21,"Wreck",C2:C21,"website",C2:C21,"hotel desk")', say: 'Two criteria on one column must both hold, and no booking is both website and hotel desk: 0. The ticked items are an OR: add two SUMIFS.' },
      { formula: '=COUNTIFS(B2:B21,"Wreck",C2:C21,"<>walk-in")', say: 'That counts the bookings. The PivotTable shows Sum of price.' },
    ],
    solution: `The Filters area keeps only bookings whose channel is one of the ticked items, so the Wreck cell sums wreck dives booked by website or at the hotel desk: <x>=SUMIFS(D2:D21,B2:B21,"Wreck",C2:C21,"website")+SUMIFS(D2:D21,B2:B21,"Wreck",C2:C21,"hotel desk")</x> = ${dollars(wreck((c) => c === 'website'))} + ${dollars(wreck((c) => c === 'hotel desk'))} = ${money(wreck((c) => c !== 'walk-in'))}. The two channels can’t overlap, so adding two SUMIFS is safe; <x>"<>walk-in"</x> gives the same here. If the formula and the PivotTable disagree, look for a stale cache or a filter you didn’t expect.`,
  },
  {
    id: 'b03-fn-14', lesson: 'pivot-tables', type: 'steps', kind: 'applied',
    prompt: 'Ormond Stationers’ (fictional) PivotTable has product line in Rows, quarter in Columns and Sum of sales in Values, in dollars:',
    data: { table: {
      head: ['Product line', 'Q1', 'Q2', 'Q3', 'Q4'],
      rows: ORMOND.map(([line, q]) => [line, ...q.map((v) => v.toLocaleString('en-US'))]),
    } },
    steps: [
      {
        id: 'b03-fn-14-s1', type: 'num',
        prompt: 'Shown as % of Column Total, by how many percentage points did Gifts’ share of the quarter’s sales rise from Q3 to Q4? Give one decimal place.',
        answer: 21.4, check: () => (gifts[3] / q4Total - gifts[2] / q3Total) * 100, unit: 'percentage points', places: 1, tol: 0.06,
        wrong: [
          { value: Math.round((gifts[3] / q4Total / (gifts[2] / q3Total) - 1) * 1000) / 10, say: 'That is the percentage change in the share. The question asks for the difference between the two shares, in percentage points.' },
          { value: Math.round((gifts[3] / gifts[2] - 1) * 1000) / 10, say: 'That is the growth in Gifts’ dollar sales. % of Column Total divides each cell by its quarter’s total first.' },
          { value: Math.round((gifts[3] - gifts[2]) / sum(gifts) * 1000) / 10, say: 'You divided by the Gifts row’s total, which is % of Row Total. % of Column Total divides by each quarter’s total.' },
        ],
        solution: `Q3’s column totals ${dollars(q3Total)} and Q4’s ${dollars(q4Total)}. Gifts: ${gifts[2].toLocaleString('en-US')} ÷ ${q3Total.toLocaleString('en-US')} = ${(gifts[2] / q3Total * 100).toFixed(1)}% in Q3 and ${gifts[3].toLocaleString('en-US')} ÷ ${q4Total.toLocaleString('en-US')} = ${(gifts[3] / q4Total * 100).toFixed(1)}% in Q4, a rise of ${((gifts[3] / q4Total - gifts[2] / q3Total) * 100).toFixed(1)} percentage points.`,
      },
      {
        id: 'b03-fn-14-s2', type: 'mc',
        prompt: 'The owner wants a chart of exactly these % of Column Total figures, to show how the mix of sales changed from quarter to quarter. Which chart?',
        options: [
          'A 100% stacked column chart, with one column per quarter and one segment per product line',
          'A pie chart of the Grand Total column, with one slice for each of the four product lines',
          'A clustered column chart of Sum of sales, with the value axis starting at $2,000 to show detail',
          'A line chart with one line per quarter and the four product lines along the horizontal axis',
        ],
        answer: 0,
        feedback: {
          1: 'The Grand Total column merges the four quarters, so the change from quarter to quarter disappears.',
          2: 'That shows dollars, not shares, and columns that don’t start at zero exaggerate the differences.',
          3: 'Product lines have no order, so lines joining them mean nothing; the quarters belong along the horizontal axis.',
        },
        solution: 'Each quarter’s column adds to 100%, which is what a 100% stacked column chart draws: four equal-height columns, each split by product line, so a change in the mix shows as a change in a segment’s height.',
      },
    ],
    solution: `% of Column Total divides each cell by its quarter’s total, so each quarter adds to 100%: Gifts is ${(gifts[2] / q3Total * 100).toFixed(1)}% of Q3 and ${(gifts[3] / q4Total * 100).toFixed(1)}% of Q4, up ${((gifts[3] / q4Total - gifts[2] / q3Total) * 100).toFixed(1)} percentage points. A 100% stacked column chart draws exactly those figures, one column per quarter, so the jump in Gifts’ segment stands out. Dividing by the Gifts row (% of Row Total: Q4 is ${(gifts[3] / sum(gifts) * 100).toFixed(1)}% of the year’s gifts) or by the grand total (${(gifts[3] / ormondAll * 100).toFixed(1)}%) answers different questions.`,
  },

  // ================================================================ Module 3: showing and describing data
  {
    id: 'b03-fn-15', lesson: 'charts-and-conditional-formatting', type: 'formula', kind: 'applied',
    prompt: 'Heronsgate Pottery Studio’s (fictional) weekly rota has the dates in B1:H1 and the hours of four studio areas in B2:H5. A conditional formatting rule on B2:H5 should shade every Saturday and Sunday column. Test the rule as you would write it for B2: type it in B8 and fill it to B8:H11, which stand in for B2:H5.',
    sheet: { cells: rota },
    cell: 'B8', fill: 'B8:H11', view: 'A1:H11',
    formats: rotaFormats, widths: { A: 11, B: 10, C: 10, D: 10, E: 10, F: 10, G: 10, H: 10 },
    answer: '=WEEKDAY(B$1,2)>5',
    alt: ['=WEEKDAY(B$1,2)>=6', '=OR(WEEKDAY(B$1)=1,WEEKDAY(B$1)=7)'],
    wrong: [
      { formula: '=WEEKDAY(B1,2)>5', say: 'With the row free, the rule in row 3 looks at row 2, and so on: it tests the hours as if they were dates. Lock the row: B$1.' },
      { formula: '=WEEKDAY($B$1,2)>5', say: 'Every cell would test Monday’s date in B1, so nothing is shaded. Leave the column free: B$1.' },
      { formula: '=WEEKDAY($B1,2)>5', say: 'That locks the column and frees the row, the pattern for whole rows. Here the dates run across row 1: lock the row instead, B$1.' },
      { formula: '=WEEKDAY(B$1)>5', say: 'Without return type 2, WEEKDAY numbers Sunday 1 to Saturday 7, so >5 picks Friday and Saturday. Use WEEKDAY(B$1,2), where Saturday is 6 and Sunday 7.' },
    ],
    solution: '<x>=WEEKDAY(B$1,2)>5</x>. With return type 2, Monday is 1 and Sunday is 7, so Saturday and Sunday are the values above 5. The row is locked (B$1) so every cell in a column looks at that column’s date; the column is free so each column tests its own date. This week, G and H (Saturday 12 and Sunday 13 September) are shaded, and next week’s dates in row 1 move the shading by themselves.',
  },
  {
    id: 'b03-fn-16', lesson: 'charts-and-conditional-formatting', type: 'mc', kind: 'conceptual',
    prompt: 'Whinchat Bakeries (fictional) has three branches, with each one’s monthly sales in a column of B2:D13. The largest branch sells about twice as much as each of the others. The manager selects B2:D13 and applies Top/Bottom Rules › Above Average, hoping to see each branch’s good months. Which cells are shaded?',
    options: [
      'Cells above the average of all 36 cells: mostly the largest branch’s months',
      'In each column, the months above that branch’s own twelve-month average',
      'In each row, the branches above that month’s average across the three branches',
      'Only cells more than one standard deviation above the average of their own column',
    ],
    answer: 0,
    feedback: {
      1: 'The rule compares every cell with one average, that of the whole selected range. To compare each branch with itself, apply the rule to one column at a time.',
      2: 'The rule doesn’t work row by row; it uses the average of all the cells selected.',
      3: 'Standard-deviation options exist in the rule’s dialog, but plain Above Average compares with the mean of the whole range, not of each column.',
    },
    solution: 'Microsoft’s Above Average rule formats cells above the average of all the cells in the range. Over B2:D13 that is one average of 36 numbers, and a branch twice the size of the others sits above it almost every month while the smaller ones rarely do. To show each branch’s good months, apply the rule to B2:B13, C2:C13 and D2:D13 separately, or use one formula rule on the whole range, <x>=B2>AVERAGE(B$2:B$13)</x>.',
  },
  {
    id: 'b03-fn-17', lesson: 'descriptive-statistics-and-regression', type: 'num', kind: 'numerical',
    prompt: 'Mistral Taxis (fictional) runs the Analysis ToolPak’s Descriptive Statistics on 64 fares. The report shows Mean 23.40, Standard Deviation 9.60 and Count 64. What does its Standard Error line show? Give two decimal places.',
    answer: 1.2, check: () => 9.6 / Math.sqrt(64), unit: '$', places: 2, tol: 0.005,
    wrong: [
      { value: 0.15, say: 'You divided by n. The standard error of the mean divides the standard deviation by √n.' },
      { value: 9.6, say: 'That is the standard deviation, the spread of single fares. The standard error is the spread of the mean: s ÷ √n.' },
      { value: 2.4, say: 'That is about the Confidence Level(95.0%) line, t × standard error (1.998 × 1.20). The Standard Error line is s ÷ √n.' },
    ],
    solution: 'Standard Error = standard deviation ÷ √Count = 9.60 ÷ √64 = 9.60 ÷ 8 = $1.20: how much the mean of 64 fares would typically vary from one sample of 64 fares to the next. The Confidence Level(95.0%) line multiplies it by t (about 1.998 for 63 degrees of freedom): about $2.40. B04 explains the reasoning.',
  },
  {
    id: 'b03-fn-18', lesson: 'descriptive-statistics-and-regression', type: 'formula', kind: 'numerical',
    prompt: 'Waxwing Juice Bar (fictional) recorded 12 weeks of average temperature (°C, B2:B13) and smoothie sales (C2:C13). In D2, write the residual for week 1, actual sales minus the sales the least-squares line of sales on temperature predicts, in a formula that can be filled down to D13.',
    sheet: { cells: { ...grid(['Week', 'Temperature', 'Smoothies', 'Residual'], TEMP.map((t, i) => [i + 1, t, SMOOTHIES[i]])) } },
    cell: 'D2', fill: 'D2:D13', view: 'A1:D13',
    formats: { D: '0.0' }, widths: { B: 12, C: 11, D: 10 },
    answer: '=C2-FORECAST.LINEAR(B2,$C$2:$C$13,$B$2:$B$13)',
    alt: [
      '=C2-(INTERCEPT($C$2:$C$13,$B$2:$B$13)+SLOPE($C$2:$C$13,$B$2:$B$13)*B2)',
      '=C2-FORECAST(B2,$C$2:$C$13,$B$2:$B$13)',
      '=C2-SLOPE($C$2:$C$13,$B$2:$B$13)*B2-INTERCEPT($C$2:$C$13,$B$2:$B$13)',
    ],
    wrong: [
      { formula: '=FORECAST.LINEAR(B2,$C$2:$C$13,$B$2:$B$13)-C2', say: 'That is predicted minus actual, the residual with its sign reversed. A residual is actual minus predicted.' },
      { formula: '=C2-FORECAST.LINEAR(B2,C2:C13,B2:B13)', say: 'Without $ the known ranges shrink as the formula is filled (C3:C14, C4:C15 …), so each row fits a different line. Lock them.' },
      { formula: '=C2-FORECAST.LINEAR(B2,$B$2:$B$13,$C$2:$C$13)', say: 'FORECAST.LINEAR takes x, then the known y’s (sales), then the known x’s (temperature). The ranges are swapped.' },
      { formula: '=C2-AVERAGE($C$2:$C$13)', say: 'That is each week’s distance from mean sales. A residual is the distance from the line, which allows for the temperature.' },
    ],
    solution: `<x>=C2-FORECAST.LINEAR(B2,$C$2:$C$13,$B$2:$B$13)</x>. The line is sales ≈ ${intercept.toFixed(1)} + ${slope.toFixed(2)} × temperature; week 1 (${TEMP[0]} °C) is predicted ${(intercept + slope * TEMP[0]).toFixed(1)} smoothies and sold ${SMOOTHIES[0]}, a residual of ${resid1.toFixed(1)}. The residuals of a least-squares line with an intercept add to zero, so <x>=SUM(D2:D13)</x> is a quick check; looking for patterns in them is B06’s subject.`,
  },
  {
    id: 'b03-fn-19', lesson: 'descriptive-statistics-and-regression', type: 'mc', kind: 'conceptual',
    prompt: 'Yewtree Car Rentals (fictional) regressed daily rentals at its airport desk on the number of flights landing, over 90 days with 12 to 40 flights. The output shows R Square 0.48, Standard Error 6.2, Intercept 3.1 and flights 1.35 (P-value 0.0001). Which statement does the output support?',
    options: [
      'On days like these, each extra flight goes with about 1.35 more rentals on average, and a day’s forecast can easily miss by 6',
      'With 60 flights a day under the new schedule, the line gives 3.1 + 1.35 × 60 = 84.1 rentals, a dependable forecast to staff for',
      'Because R Square is 0.48, the number of flights landing causes just under half of each day’s car rentals at the airport desk',
      'Because the P-value is 0.0001, forecasts of each day’s rentals made from the number of flights will be about 99.99% accurate',
    ],
    answer: 0,
    feedback: {
      1: 'Sixty flights lies far outside the 12 to 40 the line was fitted on; the relationship may not hold there.',
      2: 'R² is the share of the variation in rentals that lines up with flights. It says nothing about causes, or about shares of a day’s rentals.',
      3: 'The P-value tests whether the slope could be 0. Forecast accuracy is what the Standard Error describes: a typical miss of about 6 rentals.',
    },
    solution: 'The slope describes an average association within the data’s range; the Standard Error (6.2 rentals) is the typical miss, and R² of 0.48 says about half of the day-to-day variation lines up with flights, leaving much unexplained. Extrapolating to 60 flights, reading R² as a cause and reading the P-value as accuracy are the three classic over-readings.',
  },

  // ================================================================ Module 4: deciding with a spreadsheet
  {
    id: 'b03-fn-20', lesson: 'what-if-analysis', type: 'steps', kind: 'numerical',
    prompt: `Starling Street Food (fictional), a food truck, builds a grid of daily profit for possible prices (across row 4) and numbers of meals sold (down column A), from the variable cost per meal in B1 ($${TRUCK.variable.toFixed(2)}) and the fixed cost per day in B2 ($${TRUCK.fixed}: pitch fee and staff).`,
    steps: [
      {
        id: 'b03-fn-20-s1', type: 'formula',
        prompt: 'In B5, write the day’s profit for 60 meals at $8, in a formula that can be filled across and down to F9.',
        sheet: { cells: {
          A1: 'Variable cost per meal', B1: TRUCK.variable, A2: 'Fixed cost per day', B2: TRUCK.fixed, A4: 'Meals ↓   price →',
          ...Object.fromEntries(TRUCK.prices.map((p, j) => [`${String.fromCharCode(66 + j)}4`, p])),
          ...Object.fromEntries(TRUCK.meals.map((m, i) => [`A${i + 5}`, m])),
        } },
        cell: 'B5', fill: 'B5:F9', view: 'A1:F9',
        formats: { B1: MONEY, B2: MONEY, B4: MONEY, C4: MONEY, D4: MONEY, E4: MONEY, F4: MONEY, B: MONEY, C: MONEY, D: MONEY, E: MONEY, F: MONEY }, widths: { A: 22 },
        answer: '=$A5*(B$4-$B$1)-$B$2',
        alt: ['=(B$4-$B$1)*$A5-$B$2', '=$A5*B$4-$A5*$B$1-$B$2'],
        wrong: [
          { formula: '=A5*(B4-B1)-B2', say: 'Filled across and down, every reference moves. Anchor the meals’ column ($A5), the prices’ row (B$4) and both inputs ($B$1, $B$2).' },
          { formula: '=$A5*(B$4-B1)-B2', say: 'The grid’s edges are anchored, but B1 and B2 move as the formula is filled. Make them $B$1 and $B$2.' },
          { formula: '=$A5*B$4-$B$1-$B$2', say: 'The variable cost is per meal: multiply it by the meals too, $A5*(B$4−$B$1).' },
        ],
        solution: `<x>=$A5*(B$4-$B$1)-$B$2</x>: meals × (price − variable cost) − fixed cost. 100 meals at $10: 100 × ${(10 - TRUCK.variable).toFixed(2)} − ${TRUCK.fixed} = ${money(truckProfit(100, 10))}.`,
      },
      {
        id: 'b03-fn-20-s2', type: 'num',
        prompt: 'With the grid built, the owner runs Goal Seek: Set cell B7 (100 meals at the price in B4), To value 0, By changing cell B4. What price does Goal Seek put in B4? Give it to the cent.',
        answer: 7.3, check: () => TRUCK.variable + TRUCK.fixed / 100, unit: '$', places: 2, tol: 0.005,
        wrong: [
          { value: 3.1, say: 'That is the fixed cost per meal alone. Each meal must also cover its own variable cost of $4.20.' },
          { value: 4.2, say: 'At $4.20 each meal only covers its variable cost, and the $310 of fixed cost is lost.' },
          { value: 8, say: 'That is the price B4 held before Goal Seek changed it.' },
        ],
        solution: `B7 is 100 × (B4 − ${TRUCK.variable.toFixed(2)}) − ${TRUCK.fixed}, which is 0 when B4 = ${TRUCK.variable.toFixed(2)} + ${TRUCK.fixed} ÷ 100 = ${money(TRUCK.variable + TRUCK.fixed / 100)}.`,
      },
    ],
    solution: `Step 1: <x>=$A5*(B$4-$B$1)-$B$2</x>, with the meals’ column, the prices’ row and both inputs anchored, so one formula fills the grid. Step 2: B7 = 100 × (B4 − ${TRUCK.variable.toFixed(2)}) − ${TRUCK.fixed} = 0 when B4 = ${money(TRUCK.variable + TRUCK.fixed / 100)}, the break-even price for 100 meals. Because the grid refers to its inputs, Goal Seek can work on any of its cells, and a change to B1 or B2 flows through every cell.`,
  },
  {
    id: 'b03-fn-21', lesson: 'what-if-analysis', type: 'mc', kind: 'conceptual',
    prompt: 'Nettlebed Holiday Cottages (fictional) has a two-variable data table of yearly profit by occupancy and nightly rate. The owner changes the cleaning cost per stay in the model: the profit cell the table is built on changes at once, but the figures inside the data table stay the same until she selects them and presses F9. Why?',
    options: [
      'Calculation is set to Partial, so Excel recalculates every formula except the data tables',
      'Data tables are snapshots, like a Scenario summary, and must be built again after a change',
      'The cleaning cost is neither the row nor the column input cell, so the table ignores it',
      'A data table’s cells hold values, not formulas, so they never change unless pasted again',
    ],
    answer: 0,
    feedback: {
      1: 'A data table is live: it recalculates with the workbook unless calculation is set to skip it. It is the Scenario summary that is a static report.',
      2: 'The table recalculates the model for each pair of input values, and every other input, the cleaning cost included, flows through.',
      3: 'If that were so, F9 wouldn’t change them either. The table recalculates; it just isn’t being recalculated automatically.',
    },
    solution: 'Excel’s Partial calculation option recalculates every dependent formula except data tables, which saves time in big workbooks. Microsoft’s fix for a table that is out of date is to select its formulas and press F9; setting calculation back to Automatic keeps it live. Until then the table shows profits for the old cleaning cost: a stale answer that looks current.',
  },
  {
    id: 'b03-fn-22', lesson: 'what-if-analysis', type: 'num', kind: 'numerical',
    prompt: 'Underhill Candle Works (fictional) plans a week’s production of three candle types with Solver (Simplex LP, no integer constraints). The best plan earns a contribution of $4,120 and uses all 300 kg of wax. In the Sensitivity Report the wax constraint has a Shadow Price of 6.40, an Allowable Increase of 45 and an Allowable Decrease of 80. A supplier can deliver 30 kg more wax at the usual price, which is already counted in each candle’s contribution. What would the best contribution become? Give whole dollars.',
    answer: 4312, check: () => 4120 + 30 * 6.4, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 4126.4, say: 'That is one more kilogram. The shadow price is per kilogram: 30 × $6.40.' },
      { value: 4408, say: 'That uses the whole Allowable Increase of 45 kg. The supplier offers 30 kg.' },
      { value: 4120, say: 'Wax is a binding constraint (all 300 kg are used), so more of it is worth its shadow price.' },
    ],
    solution: '30 kg is within the Allowable Increase of 45 kg, so the shadow price holds: 4,120 + 30 × 6.40 = $4,312. Beyond 45 kg the best mix changes and the shadow price no longer applies: change the limit and solve again. Because the usual price is already in the contributions, $6.40 a kilogram is the most it would be worth paying above that price.',
  },
  {
    id: 'b03-fn-23', lesson: 'dashboards', type: 'formula', kind: 'applied',
    prompt: 'Wildflower Wedding Barn’s (fictional) dashboard lets the reader choose a month in F1 (its first day). In F2, write the year-to-date revenue: every event from 1 January of F1’s year to the end of F1’s month, from the events in A2:C21.',
    sheet: { cells: { ...grid(['Date', 'Event', 'Revenue'], BARN), E1: 'Month', F1: serial('2026-06-01'), E2: 'Year to date' } },
    cell: 'F2', view: 'A1:F21',
    formats: { A: 'date', C: '$#,##0', F1: 'mmm yyyy', F2: '$#,##0' }, widths: { A: 12, B: 10, E: 12, F: 11 },
    answer: '=SUMIFS(C2:C21,A2:A21,">="&DATE(YEAR(F1),1,1),A2:A21,"<="&EOMONTH(F1,0))',
    alt: [
      '=SUMIFS(C2:C21,A2:A21,">="&DATE(YEAR(F1),1,1),A2:A21,"<"&EDATE(F1,1))',
      '=SUMIFS(C2:C21,A2:A21,"<="&EOMONTH(F1,0),A2:A21,">"&DATE(YEAR(F1)-1,12,31))',
      '=SUMIFS(C2:C21,A2:A21,">="&EDATE(F1,1-MONTH(F1)),A2:A21,"<="&EOMONTH(F1,0))',
    ],
    wrong: [
      { formula: '=SUMIFS(C2:C21,A2:A21,">="&F1,A2:A21,"<="&EOMONTH(F1,0))', say: 'That is the chosen month only. Year to date starts on 1 January: DATE(YEAR(F1),1,1).' },
      { formula: '=SUMIFS(C2:C21,A2:A21,"<="&EOMONTH(F1,0))', say: 'Without a start date the total includes November and December of the year before. Add <x>">="&DATE(YEAR(F1),1,1)</x>.' },
      { formula: '=SUMIFS(C2:C21,A2:A21,">="&DATE(YEAR(F1),1,1),A2:A21,"<"&F1)', say: 'That stops before the chosen month begins. The year to date includes the month in F1.' },
      { formula: '=SUMIFS(C2:C21,A2:A21,">="&DATE(YEAR(F1),1,1),A2:A21,"<"&EOMONTH(F1,0))', say: 'That stops before the month’s last day, so the event on 30 June is missing. Use <x>"<="&EOMONTH(F1,0)</x>.' },
    ],
    solution: `<x>=SUMIFS(C2:C21,A2:A21,">="&DATE(YEAR(F1),1,1),A2:A21,"<="&EOMONTH(F1,0))</x>. DATE(YEAR(F1),1,1) is 1 January of the chosen year and EOMONTH(F1,0) the last day of the chosen month, so for June 2026 the tile runs from 1 January to 30 June: ${dollars(barnYTD)}. The window must include the 30 June event and keep out November and December 2025; change F1 and the tile follows.`,
  },
  {
    id: 'b03-fn-24', lesson: 'dashboards', type: 'mc', kind: 'applied',
    prompt: 'Cinderford Bike Hire’s (fictional) twelve monthly revenue tiles add up to $1,180 less than the total of its Hires table for the year. Each tile is <x>=SUMIFS(Hires[amount],Hires[date],">="&B1,Hires[date],"<"&EOMONTH(B1,0))</x>, with the first day of the month in B1. What is wrong?',
    options: [
      'Each window leaves out its month’s last day; the end criterion should be <x>"<="&EOMONTH(B1,0)</x>',
      'SUMIFS ignores a second criterion on a column it has already tested, so only the start date applies',
      'Formula tiles must be refreshed, like a PivotTable, before they agree with the table they summarise',
      'EOMONTH returns the first day of the next month, so each tile takes a day from the month after it',
    ],
    answer: 0,
    feedback: {
      1: 'SUMIFS applies every criterion, including two on the same column: that is how a date window works.',
      2: 'With automatic calculation, formulas recalculate by themselves; PivotTables are the ones that need refreshing.',
      3: '<x>EOMONTH(B1,0)</x> is the last day of B1’s month. If it were the next month’s first day, the tiles would add to more than the total, not less.',
    },
    solution: 'The criterion <x>"<"&EOMONTH(B1,0)</x> runs up to but not including each month’s last day, so hires on 31 January, 28 February and so on fall in no tile: $1,180 in all. Use <x>"<="&EOMONTH(B1,0)</x>, or <x>"<"&EDATE(B1,1)</x>. A reconciliation check on the dashboard (the tiles’ total minus the table’s total, which should be 0) catches this kind of gap at once.',
  },
];
