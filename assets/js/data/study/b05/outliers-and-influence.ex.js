// outliers-and-influence.ex.js — B05 · Outliers and influence: widgets, practice and the knowledge check (answer keys
// live here). Café data from case.js (the raw log keeps the footfall slip); Brightwater Bakery and the other small
// datasets are fictional. Formula items are marked by their results (core/sheet.js gradeFormula); num items recompute
// their answers in `check`.
import { column, CAFE_ROWS, CAFE_COLUMNS, SLIP } from './case.js?v=20';
import * as C from '../../../core/correlation.js?v=20';

const at = (name) => CAFE_COLUMNS.indexOf(name);
const fx = (v, d = 3) => (v < 0 ? '−' : '') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayLabel = (iso) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;
const rowsOf = (cafe, from, to) => CAFE_ROWS.filter((r) => r[at('cafe')] === cafe && r[at('date')] >= from && r[at('date')] <= to);

// ---------------------------------------------------------------- Millbrook, 1–20 September, as typed (row 15 = 14 Sep)
const SEP = rowsOf('Millbrook', '2027-09-01', '2027-09-20');
const sepF = SEP.map((r) => r[at('footfall')]), sepT = SEP.map((r) => r[at('transactions')]);
const sepFix = SEP.map((r) => (r[at('date')] === SLIP.date ? SLIP.actual : r[at('footfall')]));
const sepRaw = C.pearson(sepF, sepT).r, sepClean = C.pearson(sepFix, sepT).r;
const sepRho = C.spearman(sepF, sepT).rho, sepRhoClean = C.spearman(sepFix, sepT).rho;
const sepConvOk = SEP.filter((r) => r[at('date')] !== SLIP.date).map((r) => r[at('transactions')] / r[at('footfall')]);
const convLo = Math.round(Math.min(...sepConvOk) * 100), convHi = Math.round(Math.max(...sepConvOk) * 100);
const slipRow = SEP.findIndex((r) => r[at('date')] === SLIP.date) + 2;
const sepCells = { A1: 'Day', B1: 'Footfall', C1: 'Transactions', ...col('A', 2, SEP.map((r) => dayLabel(r[at('date')]))), ...col('B', 2, sepF), ...col('C', 2, sepT) };
const sepConv = Object.fromEntries(SEP.map((_, i) => [`D${i + 2}`, `=C${i + 2}/B${i + 2}`]));

// ---------------------------------------------------------------- Harbourside, July (festival days 3 and 4 July)
const JUL = rowsOf('Harbourside', '2027-07-01', '2027-07-31');
const julF = JUL.map((r) => r[at('footfall')]), julW = JUL.map((r) => r[at('peak_wait_min')]), julFest = JUL.map((r) => (r[at('festival')] ? 'yes' : 'no'));
const julAll = C.pearson(julF, julW).r;
const julNo = C.pearson(julF.filter((_, i) => julFest[i] === 'no'), julW.filter((_, i) => julFest[i] === 'no')).r;
const julCells = { A1: 'Day', B1: 'Footfall', C1: 'Peak wait (min)', D1: 'Festival', ...col('A', 2, JUL.map((r) => dayLabel(r[at('date')]))), ...col('B', 2, julF), ...col('C', 2, julW), ...col('D', 2, julFest), F1: 'r, all days', G1: '=CORREL(B2:B32,C2:C32)', F2: 'r, festival days left out' };

// ---------------------------------------------------------------- Harbourside, 10–31 August (festival: 21 August)
const AUG = rowsOf('Harbourside', '2027-08-10', '2027-08-31');
const augT = AUG.map((r) => r[at('high_f')]), augF = AUG.map((r) => r[at('footfall')]), augFest = AUG.map((r) => (r[at('festival')] ? 'yes' : 'no'));
const augAll = C.pearson(augT, augF).r;
const augNo = C.pearson(augT.filter((_, i) => augFest[i] === 'no'), augF.filter((_, i) => augFest[i] === 'no')).r;
const augCells = { A1: 'Day', B1: 'High (°F)', C1: 'Footfall', D1: 'Festival', ...col('A', 2, AUG.map((r) => dayLabel(r[at('date')]))), ...col('B', 2, augT), ...col('C', 2, augF), ...col('D', 2, augFest), F1: 'r, all days', G1: '=CORREL(B2:B23,C2:C23)', F2: 'r, festival day left out' };

// ---------------------------------------------------------------- the whole log, for the widgets
const FR = column('footfall', { raw: true }), TR = column('transactions'), CAFE = column('cafe'), DATE = column('date');
const H = { cafe: 'Harbourside' };
const hF = column('footfall', H), hW = column('peak_wait_min', H), hFest = column('festival', H), hDate = column('date', H);

// ---------------------------------------------------------------- Brightwater Bakery (fictional): ten days
const BAKE = [
  ['Mon', 212, 118], ['Tue', 198, 104], ['Wed', 225, 131], ['Thu', 1840, 126], ['Fri', 260, 151],
  ['Sat', 341, 187], ['Sun', 302, 166], ['Mon', 205, 239], ['Tue', 191, 99], ['Wed', 219, 122],
];

// ---------------------------------------------------------------- the SD-inflation approximation (fictional)
const AP = { r: 0.9, sClean: 40, sRaw: 64 };

export const widgets = {
  'out-slip': {
    type: 'scatter',
    title: 'Footfall and transactions, all 612 café-days, as typed',
    x: { name: 'Footfall', values: FR, unit: 'people' },
    y: { name: 'Transactions', values: TR },
    group: { name: 'Café', values: CAFE },
    labels: DATE.map((d, i) => `${dayLabel(d)} (${CAFE[i]})`),
    show: ['pearson', 'spearman', 'ci', 'p'],
    toggles: ['ranks', 'group', 'line'],
    exclude: 3,
    note: 'With the slip, r = 0.679; leave out 14 Sep (Millbrook) and r = 0.981. The next most influential days, Harbourside’s festivals, move r by less than 0.01. In ranks the slip is just Millbrook’s busiest day, so Spearman’s ρ stays at about 0.97 throughout.',
  },
  'out-festival': {
    type: 'scatter',
    title: 'Harbourside: footfall and the average wait at the 7–11 a.m. peak, 306 days',
    x: { name: 'Footfall', values: hF, unit: 'people' },
    y: { name: 'Peak wait', values: hW, unit: 'minutes' },
    group: { name: 'Festival day', values: hFest.map((f) => (f ? 'Festival day' : 'Ordinary day')) },
    labels: hDate.map(dayLabel),
    show: ['pearson', 'spearman', 'ci'],
    toggles: ['group', 'ranks', 'line'],
    exclude: 6,
    note: 'All days: r = 0.673; without the five festival days, 0.476. The most influential ordinary day is 1 May: a 9.2-minute wait with only 195 visitors. Its roster had 4.5 barista hours for 104 transactions, so each barista hour served about 12.7 peak transactions, far above Harbourside’s average of about 7.4. It is a real day, explained by staffing, not an error.',
  },
  'out-sheet': {
    type: 'sheet',
    title: 'Millbrook, 1–20 September 2027, as typed',
    sheet: { cells: { ...sepCells, ...sepConv, D1: 'Conversion', F1: '=CORREL(B2:B21,C2:C21)', E1: 'Pearson’s r', E2: 'Spearman’s ρ', F2: '=CORREL(RANK.AVG(B2:B21,B2:B21),RANK.AVG(C2:C21,C2:C21))' } },
    view: 'A1:F21',
    editable: 'B2:C21',
    formats: { D: '0.0%', F1: '0.000', F2: '0.000' },
    widths: { E: 14 },
    tools: ['formulas', 'reset'],
    note: `Row ${slipRow} (14 Sep) converts 5.1% of its visitors; every other day converts between ${convLo}% and ${convHi}%. With 2,566 in B${slipRow}, r = ${fx(sepRaw)} and ρ = ${fx(sepRho)}; with the door counter’s 256, r = ${fx(sepClean)} and ρ = ${fx(sepRhoClean)}. In 20 rows even the rank correlation feels the slip.`,
  },
};

export const guided = [
  {
    id: 'b05-out-g1', type: 'steps', kind: 'applied',
    prompt: 'B2:C21 hold Millbrook’s footfall and transactions for 1–20 September 2027, exactly as typed into the log. Ana expects the two to move almost in step. Investigate.',
    solution: `CORREL gives only ${fx(sepRaw)}. The conversion column shows why: 14 September converts 130 ÷ 2,566 = 5.1% of its visitors, against ${convLo}–${convHi}% on every other day, so the footfall is implausible. The door counter’s export says 256, and with that value r = ${fx(sepClean)}. Correct the value, note the change in the cleaning log, and recompute.`,
    steps: [
      {
        id: 'b05-out-g1-s1', type: 'formula',
        prompt: 'In F1, calculate Pearson’s r between footfall and transactions.',
        sheet: { cells: { ...sepCells, E1: 'Pearson’s r' } },
        cell: 'F1', answer: '=CORREL(B2:B21,C2:C21)',
        alt: ['=CORREL(C2:C21,B2:B21)', '=PEARSON(B2:B21,C2:C21)', '=PEARSON(C2:C21,B2:B21)'],
        view: 'A1:F21',
        formats: { F1: '0.000' }, widths: { E: 14 },
        wrong: [
          { formula: '=RSQ(B2:B21,C2:C21)', say: 'RSQ returns r², the square of the correlation. The question asks for r itself: CORREL or PEARSON.' },
          { formula: '=COVARIANCE.S(B2:B21,C2:C21)', say: 'That is the covariance, in people × transactions. r divides it by both standard deviations: CORREL does this for you.' },
        ],
        hints: ['Excel’s correlation function takes the two ranges.', '<x>=CORREL(B2:B21,C2:C21)</x>'],
      },
      {
        id: 'b05-out-g1-s2', type: 'formula',
        prompt: 'In D2, calculate 1 September’s conversion (transactions as a share of footfall), and fill it down to D21.',
        sheet: { cells: { ...sepCells, D1: 'Conversion', E1: 'Pearson’s r', F1: '=CORREL(B2:B21,C2:C21)' } },
        cell: 'D2', fill: 'D2:D21', answer: '=C2/B2',
        view: 'A1:F21',
        formats: { D: '0.0%', F1: '0.000' }, widths: { E: 14 },
        wrong: [
          { formula: '=B2/C2', say: 'That is footfall per transaction. Conversion is the share of visitors who buy: transactions ÷ footfall, <x>=C2/B2</x>.' },
          { formula: '=C$2/B$2', say: 'With the rows locked, every day gets 1 September’s conversion. Leave the references relative.' },
        ],
        hints: ['Conversion = transactions ÷ footfall, on the same row.', '<x>=C2/B2</x>, filled down.'],
      },
      {
        id: 'b05-out-g1-s3', type: 'mc',
        prompt: `14 September converts 5.1% of its visitors; every other day converts between ${convLo}% and ${convHi}%. The door counter’s own export for 14 September says 256. What should Ana do?`,
        options: [
          'Correct it to 256, log the fix and its source, and recompute r.',
          'Delete the 14 September row, since a point that lowers r this much can’t be trusted.',
          'Keep 2,566 and report r as it is, because changing data after seeing a result is never allowed.',
          'Switch to Spearman’s ρ, which is robust to outliers, and leave the footfall as typed.',
        ],
        answer: 0,
        hints: ['Is the value wrong, and is the right value known?'],
        feedback: {
          1: 'Deleting loses a real day whose correct value is known. Correct it from the source instead.',
          2: 'Correcting a value from its source is not changing data to suit a result; it fixes a recording error, whichever way it moves r.',
          3: 'Ranks limit the damage but still treat the error as an observation (ρ is 0.810 with it and 0.941 without, in these 20 days). Fix the error.',
        },
      },
    ],
  },
  {
    id: 'b05-out-g2', type: 'classify', kind: 'conceptual',
    prompt: 'Ana plots footfall (x) against transactions (y) for the café-days below. On most days about half of the visitors buy something. Classify each day by where it sits relative to the pattern.',
    items: [
      'A Harbourside festival day: 620 visitors and 293 transactions.',
      'Millbrook on 14 September as typed: 2,566 visitors and 130 transactions.',
      'A day with 190 visitors and 290 transactions, both typed from the till by hand.',
      'A day with 300 visitors and 30 transactions: a common footfall, and a number of transactions seen on quiet days.',
    ],
    categories: ['Far out in x and y, on the trend', 'Far out in x, off the trend', 'Far out in y only', 'Ordinary on each variable, unusual together'],
    answer: [0, 1, 2, 3],
    fixed: true,
    hints: ['Compare each value with the usual range of its own variable first, then ask whether the pair follows the “about half buy” pattern.', 'Footfall above 500 is extreme; transactions near 290 are extreme. 300 visitors and 30 transactions are each ordinary.'],
    feedback: {
      0: 'Both values are extreme, but 293 of 620 is about half: the point continues the pattern and raises r.',
      1: '2,566 is extreme, 130 is ordinary: far out in x and off the pattern, the most damaging kind.',
      2: '190 visitors is ordinary; 290 transactions is near the top of the range, and more transactions than visitors is impossible.',
      3: 'Neither value is unusual alone, but a 10% conversion is: only a plot or a plausibility check will find this point.',
    },
    solution: 'The festival day is extreme on both and on the trend (it raises r). The slip is far out in x and off the trend (it lowers r sharply). 190 visitors with 290 transactions is far out in y only, and impossible. 300 visitors with 30 transactions is ordinary on each variable but unusual together: z-scores of each variable miss it; a plot or a conversion check finds it.',
  },
  {
    id: 'b05-out-g3', type: 'formula', kind: 'numerical',
    prompt: 'Harbourside, July 2027: B2:B32 hold footfall, C2:C32 the average wait at the morning peak, and D2:D32 say whether the day was a festival day. G1 gives r for all 31 days. In G2, calculate r with the festival days left out, using FILTER.',
    sheet: { cells: julCells },
    cell: 'G2', answer: '=CORREL(FILTER(B2:B32,D2:D32="no"),FILTER(C2:C32,D2:D32="no"))',
    alt: ['=CORREL(FILTER(B2:B32,D2:D32<>"yes"),FILTER(C2:C32,D2:D32<>"yes"))', '=PEARSON(FILTER(B2:B32,D2:D32="no"),FILTER(C2:C32,D2:D32="no"))', '=CORREL(FILTER(C2:C32,D2:D32="no"),FILTER(B2:B32,D2:D32="no"))'],
    require: ['FILTER'],
    view: 'A1:G32', maxHeight: '22rem',
    formats: { G1: '0.000', G2: '0.000' }, widths: { C: 14, F: 22 },
    wrong: [
      { formula: '=CORREL(B2:B32,C2:C32)', say: 'That is r for all 31 days, as in G1. Keep only the rows where D says “no” with FILTER.' },
      { formula: '=CORREL(FILTER(B2:B32,D2:D32="yes"),FILTER(C2:C32,D2:D32="yes"))', say: 'That keeps only the festival days. Filter on “no”.' },
      { formula: '=CORREL(FILTER(B2:B32,D2:D32="no"),C2:C32)', say: 'Both ranges must be filtered the same way, or the pairs no longer line up (CORREL returns #N/A for different lengths).' },
    ],
    hints: ['<x>FILTER(B2:B32,D2:D32="no")</x> keeps the footfall of ordinary days. Do the same for the waits.', 'Put the two filtered ranges inside CORREL.'],
    solution: `<x>=CORREL(FILTER(B2:B32,D2:D32="no"),FILTER(C2:C32,D2:D32="no"))</x> = ${fx(julNo)}, against ${fx(julAll)} for all 31 days. The festival days (3 and 4 July) sit far out on footfall with long waits, on the trend, so they raise r. Both figures are honest; report both, with the reason they differ.`,
  },
  {
    id: 'b05-out-g4', type: 'mc', kind: 'applied',
    prompt: 'Across Harbourside’s 306 days, footfall and the peak wait have r = 0.67; without the five festival days, which are confirmed by the till and rostered separately, r = 0.48. Ana is writing the rule for ordinary days’ rosters. Which report is best?',
    options: [
      'Use 0.48 for the ordinary-day rule and give 0.67 for all days beside it, saying the festivals account for the difference.',
      'Use 0.67 alone, because the festival days are genuine, and genuine data must never be set aside or reported separately for any purpose.',
      'Use 0.48 and leave the festival days out of the report, since they would only confuse readers of the rule.',
      'Use the average of the two, 0.58, which balances the festival days against the ordinary ones.',
    ],
    answer: 0,
    hints: ['Which question is the roster rule about, and should a reader be able to see both results?'],
    feedback: {
      1: 'Genuine days stay in the data, but the ordinary-day rule is about ordinary days. Report both and say which answers the question.',
      2: 'Dropping them silently hides a choice that changes r a lot. Report both.',
      3: 'Averaging two correlations answers neither question.',
    },
    solution: 'The festival days are real, so they stay in the log, but the rule is for ordinary days, for which r = 0.48. Report both figures and the reason they differ, so a reader can see how much five days matter.',
  },
];

export const independent = [
  {
    id: 'b05-out-i1', type: 'formula', kind: 'numerical',
    prompt: 'The 20 Millbrook days are as typed, with 2,566 in B15. In F2, calculate Spearman’s ρ as Pearson’s r of the ranks, using RANK.AVG inside CORREL.',
    sheet: { cells: { ...sepCells, E1: 'Pearson’s r', F1: '=CORREL(B2:B21,C2:C21)', E2: 'Spearman’s ρ' } },
    cell: 'F2', answer: '=CORREL(RANK.AVG(B2:B21,B2:B21),RANK.AVG(C2:C21,C2:C21))',
    alt: ['=CORREL(RANK.AVG(B2:B21,B2:B21,1),RANK.AVG(C2:C21,C2:C21,1))', '=CORREL(RANK.AVG(C2:C21,C2:C21),RANK.AVG(B2:B21,B2:B21))', '=PEARSON(RANK.AVG(B2:B21,B2:B21),RANK.AVG(C2:C21,C2:C21))'],
    require: ['RANK.AVG'],
    view: 'A1:F21',
    formats: { F1: '0.000', F2: '0.000' }, widths: { E: 14 },
    wrong: [
      { formula: '=CORREL(RANK.EQ(B2:B21,B2:B21),RANK.EQ(C2:C21,C2:C21))', say: 'RANK.EQ gives tied values the same top rank; Spearman’s ρ needs the average rank for ties (two days had 148 transactions). Use RANK.AVG.' },
      { formula: '=CORREL(RANK.AVG(B2:B21,B2:B21),RANK.AVG(C2:C21,C2:C21,1))', say: 'One column is ranked in descending order and the other ascending, which flips the sign. Rank both the same way.' },
      { formula: '=CORREL(B2:B21,C2:C21)', say: 'That is Pearson’s r of the values. Rank both columns first.' },
    ],
    solution: `<x>=CORREL(RANK.AVG(B2:B21,B2:B21),RANK.AVG(C2:C21,C2:C21))</x> = ${fx(sepRho)}, against Pearson’s ${fx(sepRaw)}. The slip becomes the top rank instead of a value nine times too large, so ρ suffers far less; but in only 20 days it still falls from ${fx(sepRhoClean)} (corrected) to ${fx(sepRho)}. Ranks are a check, not a substitute for correcting the error.`,
  },
  {
    id: 'b05-out-i2', type: 'num', kind: 'numerical',
    prompt: 'A manager screens a sample of 8 days with the rule “flag any value with |z| > 3”, using the sample mean and standard deviation. What is the largest |z| any value in a sample of 8 can have? Give two decimal places.',
    answer: 2.47, check: () => 7 / Math.sqrt(8), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 3, say: '3 is the manager’s threshold, not the limit. The limit is (n − 1) ÷ √n.' },
      { value: 2.83, say: '√8 = 2.83 is part of the formula. The limit is (n − 1) ÷ √n = 7 ÷ √8.' },
    ],
    solution: '|z| ≤ (n − 1) ÷ √n = 7 ÷ √8 ≈ 2.47. With 8 values the rule |z| > 3 can never flag anything, however wild a value is, because an extreme value inflates the standard deviation it is measured by. Plot small samples and check plausibility instead.',
  },
  {
    id: 'b05-out-i3', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements about outliers and a correlation coefficient that are true.',
    options: [
      'A point far out in x that continues the pattern of the others tends to raise r.',
      'A point far out in x but at an ordinary y lowers r mainly by inflating the standard deviation of x.',
      'Removing the point that changes r most shows which point is a data error.',
      'A point can be ordinary on each variable and still sit far from the pattern of the pairs.',
      'Spearman’s ρ is unaffected by data-entry errors, so errors need not be corrected when ρ is reported.',
      'Leave-one-out changes in r should be computed only when r is lower than expected.',
    ],
    answer: [0, 1, 3],
    feedback: {
      2: 'Influence measures how much a point matters, not whether it is wrong: genuine extremes can be the most influential points.',
      4: 'Ranks limit how far an error can pull, but an error still counts as an observation and can move ρ, especially in small samples.',
      5: 'Apply the same checks whichever way the result goes; checking only disappointing results is a form of choosing the answer.',
    },
    solution: 'True: a point far out in both and on the trend raises r; a point far out in x at an ordinary y inflates s_x and lowers r; a pair can be unusual only in combination (a 10% conversion from ordinary values). False: influence is not error; ranks reduce but don’t remove an error’s effect; and influence checks belong in every analysis, not only disappointing ones.',
  },
  {
    id: 'b05-out-i4', type: 'mc', kind: 'conceptual',
    prompt: 'Ten fictional points rise together with r = 0.96. An eleventh point is added far to the right of the others, at exactly the height the pattern would lead you to expect. What happens to r?',
    options: [
      'It rises, because the new point adds a large positive product of z-scores and stretches the pattern.',
      'It falls, because any outlier inflates a standard deviation, and that always weakens the correlation.',
      'It stays the same, because a point lying exactly on the pattern of the other ten points adds nothing new.',
      'It becomes negative, because the point is more than three standard deviations from the mean.',
    ],
    answer: 0,
    feedback: {
      1: 'It inflates both standard deviations, but its own product z_x z_y is large and positive, which more than makes up for it.',
      2: 'A point on the pattern still changes the means, the spreads and the sum of products. With the ten points in the lesson’s figure, r rises from 0.964 to 0.989.',
      3: 'Distance from the mean doesn’t set the sign. A point far out in the direction of the trend reinforces it.',
    },
    solution: 'A point far out in x and y, on the trend, adds a large positive z_x z_y and makes the cloud look more like a line, so r rises (0.964 to 0.989 in the lesson’s figure). Such points can make a weak relationship look strong, so check how much r depends on them.',
  },
  {
    id: 'b05-out-i5', type: 'rows', kind: 'applied',
    prompt: 'Brightwater Bakery (fictional) logs its visitors and transactions. Select every row that fails a plausibility check and should be checked against the source before any correlation is computed.',
    data: { table: { head: ['Day', 'Visitors', 'Transactions'], rows: BAKE.map((r) => [r[0], r[1].toLocaleString('en-US'), String(r[2])]), index: 1 } },
    answer: [3, 7],
    solution: 'Row 4 (Thursday) has 1,840 visitors but only 126 transactions, a conversion of about 7% when the other days convert about 52–58%: probably a mistyped 184. Row 8 (Monday) has 239 transactions from 205 visitors, more sales than people, which is impossible unless people bought twice: probably a mistyped 139 or similar. Saturday’s 341 visitors and 187 transactions is the busiest day but converts like the others, so it is genuine-looking and stays.',
  },
  {
    id: 'b05-out-i6', type: 'mc', kind: 'applied',
    prompt: 'A regional manager proposes a rule for the cafés’ monthly reports: “Before computing any correlation, automatically delete every row with |z| > 3 on either variable.” What is the main problem with the rule?',
    options: [
      'It deletes genuine extremes such as festival days, misses errors that are ordinary on each variable, and can’t flag anything in small samples.',
      'It is too lenient: the threshold should be |z| > 2, so that more of the unusual rows are caught before each report.',
      'It is fine for errors but should also delete rows where the two variables move against the overall pattern.',
      'It changes the number of rows, so the correlations will no longer be comparable from month to month.',
    ],
    answer: 0,
    feedback: {
      1: 'A lower threshold deletes even more genuine days. The problem is automatic deletion, not the number.',
      2: 'Deleting points that go against the pattern is choosing the answer.',
      3: 'Changing n is a minor issue next to deleting genuine data and missing real errors.',
    },
    solution: 'Automatic deletion treats “extreme” as “wrong”. It removes real days (Harbourside’s festivals have z above 5), misses errors that are unusual only in combination (a 10% conversion from ordinary values), and in samples of 10 or fewer can’t flag anything because |z| ≤ (n − 1) ÷ √n. Flag, check the source, correct or keep, and report.',
  },
];

export const check = [
  {
    id: 'b05-out-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Millbrook’s mistyped footfall (2,566 for 256) lowered r for footfall and transactions across 612 café-days from 0.981 to 0.679. Its own term in Σ z_x z_y ÷ (n − 1) was only +0.021. How did it lower r so much?',
    options: [
      'It inflated the SD of footfall, shrinking every other day’s footfall z-score.',
      'It added a large negative product of z-scores, which cancelled most of the other days’ terms.',
      'It reduced the number of pairs, because CORREL skips values that are far from the mean.',
      'It changed the sign of the covariance between footfall and the number of transactions.',
    ],
    answer: 0,
    feedback: {
      1: 'Its term was positive: footfall 18.3 SDs above the mean, transactions 0.71 above.',
      2: 'CORREL skips text and empty cells, not extreme numbers; all 612 pairs were used.',
      3: 'The covariance stayed positive; r fell from 0.98 to 0.68, not below zero.',
    },
    solution: 'The slip raised the footfall SD from 87.1 to 129.9, so every other day’s z_x shrank by about a third and their terms summed to 0.658 instead of about 0.98. An outlier in x off the trend damages r mostly through the spread.',
  },
  {
    id: 'b05-out-k2', type: 'num', kind: 'numerical',
    prompt: 'In a fictional dataset, x and y have r = 0.90 and x has a standard deviation of 40. One value of x is mistyped with an extra digit at an ordinary y, which raises the SD of x to 64 and leaves everything else about the same. Ignoring the bad point’s own small term, estimate the new r. Give two decimal places.',
    answer: 0.56, check: () => AP.r * AP.sClean / AP.sRaw, unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: 1.44, say: 'The z-scores shrink, so r falls: multiply by the old SD over the new one, 40 ÷ 64, not 64 ÷ 40.' },
      { value: 0.9, say: 'The other points’ z-scores for x all shrink when s_x grows, so their products shrink too.' },
    ],
    solution: 'Every other point’s z_x = (x − x̄) ÷ s_x is divided by 64 instead of 40, so the sum of products, and r, shrink by the factor 40 ÷ 64 = 0.625: r ≈ 0.90 × 0.625 ≈ 0.56. (The means move a little too, which this rough estimate ignores.)',
  },
  {
    id: 'b05-out-k3', type: 'formula', kind: 'numerical',
    prompt: 'Harbourside, 10–31 August 2027: B2:B23 hold the day’s high (°F), C2:C23 footfall and D2:D23 whether the day was a festival day (the Regatta, 21 August). G1 shows r for all 22 days. In G2, calculate r between the high and footfall with the festival day left out.',
    sheet: { cells: augCells },
    cell: 'G2', answer: '=CORREL(FILTER(B2:B23,D2:D23="no"),FILTER(C2:C23,D2:D23="no"))',
    alt: ['=CORREL(FILTER(B2:B23,D2:D23<>"yes"),FILTER(C2:C23,D2:D23<>"yes"))', '=PEARSON(FILTER(B2:B23,D2:D23="no"),FILTER(C2:C23,D2:D23="no"))', '=CORREL(FILTER(C2:C23,D2:D23="no"),FILTER(B2:B23,D2:D23="no"))'],
    view: 'A1:G23',
    formats: { G1: '0.000', G2: '0.000' }, widths: { F: 22 },
    wrong: [
      { formula: '=CORREL(B2:B23,C2:C23)', say: 'That keeps the festival day, as G1 does. Filter on <x>D2:D23="no"</x> in both ranges.' },
      { formula: '=CORREL(FILTER(B2:B23,D2:D23="yes"),FILTER(C2:C23,D2:D23="yes"))', say: 'That keeps only the festival day (and CORREL can’t work with one pair). Filter on “no”.' },
    ],
    solution: `<x>=CORREL(FILTER(B2:B23,D2:D23="no"),FILTER(C2:C23,D2:D23="no"))</x> = ${fx(augNo)}, against ${fx(augAll)} with the Regatta. One festival day, with about twice the footfall of any other day but an ordinary temperature, is an outlier in y and hides the link between warm days and visitors. Report both, and say why they differ.`,
  },
  {
    id: 'b05-out-k4', type: 'classify', kind: 'applied',
    prompt: 'Choose the right action for each unusual value in a café log.',
    items: [
      'Footfall typed as 2,566; the door counter’s export for that day says 256.',
      'A festival day with four times the usual footfall, confirmed by the till and the roster.',
      'A wait of −3.0 minutes; the manager’s stopwatch notes for that morning were thrown away.',
      'A genuine quiet day whose removal would make the correlation Ana hoped for look stronger.',
    ],
    categories: ['Correct it from the source and log the change', 'Keep it and report r with and without it', 'Set it to missing and say so', 'Keep it as it is'],
    answer: [0, 1, 2, 3],
    feedback: {
      1: 'Real, but extreme enough to change the result: keep it and show r both ways.',
      2: 'Impossible, and the correct value can’t be recovered: set it to missing (CORREL skips blanks and text) and record why. Don’t guess a replacement.',
      3: 'A real, unremarkable day stays. Removing it because the result looks better without it is choosing the answer.',
    },
    solution: 'Errors with a known correct value are corrected from the source and logged; genuine extremes are kept and reported both ways; impossible values that can’t be recovered become missing, with a note; and genuine points are never removed because the result looks better without them.',
  },
  {
    id: 'b05-out-k5', type: 'mc', kind: 'conceptual',
    prompt: 'For footfall and transactions across all 612 café-days, Spearman’s ρ is 0.970 with the slip and 0.971 without, while Pearson’s r is 0.679 and 0.981. What does the comparison tell an analyst?',
    options: [
      'A few points, probably one, are responsible for Pearson’s low value; find them.',
      'Spearman’s ρ is the right measure for these data, so the slip can stay in the log.',
      'The relationship is monotonic but strongly curved, which is why Pearson’s r is low.',
      'Pearson’s r is wrong here and should not be reported for these two variables.',
    ],
    answer: 0,
    feedback: {
      1: 'ρ’s stability shows the slip matters less in ranks, not that the slip is acceptable. Correct the error.',
      2: 'A curve would lower r on the corrected data too; corrected, r is 0.981, a straight-line relationship.',
      3: 'Corrected, Pearson’s r is accurate and very informative (0.981).',
    },
    solution: 'When Pearson’s r and Spearman’s ρ disagree sharply, a few extreme points are usually responsible. Here one mistyped value lowered r by 0.302 and ρ by 0.001. The comparison points you to the slip; correcting it is the fix.',
  },
  {
    id: 'b05-out-k6', type: 'mc', kind: 'applied',
    prompt: 'A leave-one-out analysis of Harbourside’s footfall and peak waits shows that removing 29 May (Harbour Days, 620 visitors, a 15.3-minute wait) changes r from 0.673 to 0.595, more than any other day. A colleague says: “Then 29 May must be a recording error; drop it.” How should Ana respond?',
    options: [
      'Influence isn’t error: check 29 May against the till and roster, and if it is genuine keep it and report r both ways.',
      'Agree, since the most influential point in a leave-one-out analysis is by definition a recording error that should be removed.',
      'Agree only if r without 29 May is closer to the value she expected before looking at the data.',
      'Disagree, because points should never be removed from a dataset under any circumstances whatsoever.',
    ],
    answer: 0,
    feedback: {
      1: 'Influence measures how much a point matters. Genuine extremes are often the most influential points.',
      2: 'That is choosing the data to fit an expectation.',
      3: 'Errors with a known correct value should be corrected, and impossible values with no source can be set to missing. Some changes are right; the point is to base them on evidence.',
    },
    solution: 'A large leave-one-out change says 29 May matters, not that it is wrong. Ana checks it at the source: Harbour Days really brought 620 people, so the day stays. Because it moves r noticeably, she reports r with all days (0.67) and with the festival days set aside (0.48), saying why.',
  },
];
