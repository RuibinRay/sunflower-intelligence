// correlation-matrices.ex.js — B05 · Correlation matrices: widgets, practice and the knowledge check (answer keys
// live here). The cafés’ log comes from case.js (Harbourside’s 30 June days for the worksheets); Brightside Gym,
// Northgate Books and Harbour Light Ferries are fictional. Formula items are marked by their results
// (core/sheet.js gradeFormula); num items recompute their answers in `check`.
import { MATRIX, MATRIX_COLUMNS, column } from './case.js?v=20';
import * as C from '../../../core/correlation.js?v=20';

const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const neg = (v, d = 2) => `${v < 0 ? '−' : ''}${fx(Math.abs(v), d)}`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));

const LABEL = { high_f: 'High (°F)', rain_in: 'Rain (in)', footfall: 'Footfall', transactions: 'Transactions', sales: 'Sales ($)', iced_share: 'Iced share', peak_staff_hours: 'Peak barista hours', peak_wait_min: 'Peak wait (min)' };
const named = (idx) => Object.fromEntries(MATRIX_COLUMNS.map((n) => [LABEL[n], idx ? idx.map((i) => column(n)[i]) : column(n)]));

// ---------------------------------------------------------------- Harbourside, June 2027 (30 days)
const DATES = column('date'), CAFES = column('cafe');
const JI = DATES.map((d, i) => i).filter((i) => DATES[i].slice(5, 7) === '06' && CAFES[i] === 'Harbourside');
const J = (n) => JI.map((i) => column(n)[i]);
const dayLabel = (iso) => `${Number(iso.slice(8, 10))} Jun`;
const juneCells = { A1: 'Day', B1: 'High (°F)', C1: 'Rain (in)', D1: 'Transactions', E1: 'Peak wait (min)', ...col('A', 2, JI.map((i) => dayLabel(DATES[i]))), ...col('B', 2, J('high_f')), ...col('C', 2, J('rain_in')), ...col('D', 2, J('transactions')), ...col('E', 2, J('peak_wait_min')) };
const rT = ['high_f', 'rain_in', 'transactions', 'peak_wait_min'].map((n) => C.pearson(J('transactions'), J(n)).r);
const rW = ['high_f', 'rain_in', 'transactions'].map((n) => C.pearson(J(n), J('peak_wait_min')));
// the 28 June p-values in matrix order (unsorted)
const JM = C.matrix(Object.fromEntries(MATRIX_COLUMNS.map((n) => [n, J(n)])));
const JPAIRS = [];
for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) JPAIRS.push({ name: `${LABEL[MATRIX_COLUMNS[i]]} – ${LABEL[MATRIX_COLUMNS[j]]}`, p: JM.p[i][j], r: JM.r[i][j] });
const pCells = { A1: 'Pair', B1: 'p-value', ...col('A', 2, JPAIRS.map((x) => x.name)), ...col('B', 2, JPAIRS.map((x) => x.p)) };
const bonfCount = JPAIRS.filter((x) => x.p < 0.05 / 28).length;
const pSorted = JPAIRS.map((x) => x.p).sort((a, b) => a - b);

// ---------------------------------------------------------------- Brightside Gym (fictional): six p-values
const GYM = [0.003, 0.009, 0.011, 0.020, 0.21, 0.48];
const gH = C.adjust(GYM, 'holm').filter((p) => p < 0.05).length, gB = C.adjust(GYM, 'bonferroni').filter((p) => p < 0.05).length, gF = C.adjust(GYM, 'fdr_bh').filter((p) => p < 0.05).length;

// the year’s weather–wait cells, unadjusted and Holm-adjusted
const yi = (n) => MATRIX.names.indexOf(n);
const YW = ['high_f', 'iced_share'].map((n) => ({ r: MATRIX.r[yi(n)][yi('peak_wait_min')], p: MATRIX.p[yi(n)][yi('peak_wait_min')], h: MATRIX.pAdj[yi(n)][yi('peak_wait_min')] }));

// the bound on a third correlation
const bound = (a, b) => { const s = Math.sqrt((1 - a * a) * (1 - b * b)); return [a * b - s, a * b + s]; };

export const widgets = {
  'mat-year': {
    type: 'corrmatrix',
    title: 'The cafés’ daily measures, 1 March – 31 December 2027 (both cafés, 612 days)',
    columns: named(null),
    method: 'pearson', adjust: 'none', alpha: 0.05, choose: true,
    note: 'Every cell uses all 612 days, so any correlation larger than 0.08 in size is significant at 5%. The pooled cells mix two cafés: footfall and sales are 0.89 here but 0.98 and 0.97 inside each café.',
  },
  'mat-june': {
    type: 'corrmatrix',
    title: 'Harbourside, June 2027 (30 days)',
    columns: named(JI),
    method: 'pearson', adjust: 'none', alpha: 0.05, choose: true,
    note: 'With 30 days a correlation must be at least 0.36 in size to be significant unadjusted, and about 0.55 to survive Bonferroni. Rain fell on only some June days, so look at the rain cells’ scatterplots before reading their r.',
  },
  'mat-bound': {
    type: 'formula',
    title: 'Which values can the third correlation take?',
    intro: 'Set r(x, y) and r(y, z). The correlation of x with z must lie between the two limits.',
    inputs: [
      { id: 'a', label: 'r(x, y)', min: -1, max: 1, step: 0.05, value: 0.9, fmt: 'num' },
      { id: 'b', label: 'r(y, z)', min: -1, max: 1, step: 0.05, value: 0.9, fmt: 'num' },
    ],
    compute: (v) => {
      const [lo, hi] = bound(v.a, v.b);
      const f = (x) => neg(Math.max(-1, Math.min(1, x)), 2);
      return {
        headline: { label: 'r(x, z) must lie between', value: `${f(lo)} and ${f(hi)}` },
        rows: [['r(x, y) × r(y, z)', neg(v.a * v.b, 3)], ['√((1 − r(x, y)²)(1 − r(y, z)²))', fx(Math.sqrt((1 - v.a * v.a) * (1 - v.b * v.b)), 3)], ['Width of the range', fx(hi - lo, 3)]],
        note: hi - lo < 0.5
          ? 'Two strong correlations leave little room: the third is pinned close to their product. A matrix that shows a value outside this range was built from different rows or sources.'
          : 'With moderate correlations the third can be almost anything; the bound only rules out the extremes.',
      };
    },
  },
};

export const guided = [
  {
    id: 'b05-mat-g1', type: 'num', kind: 'numerical',
    prompt: 'Northgate Books (fictional) tracks 12 weekly measures for each of its shops and wants a correlation matrix of all of them. How many distinct pairs, and so how many tests of H₀: ρ = 0, does the matrix hold?',
    answer: 66, check: () => (12 * 11) / 2, unit: 'pairs', places: 0, tol: 0,
    wrong: [
      { value: 132, say: 'That is 12 × 11, which counts every pair twice: the matrix is symmetric, so the cell for (sales, footfall) is the cell for (footfall, sales). Divide by 2.' },
      { value: 144, say: 'That is 12 × 12, every cell including the diagonal of 1s and both halves. The distinct pairs are m(m − 1) ÷ 2.' },
      { value: 78, say: 'That is 12 × 13 ÷ 2, which includes the 12 diagonal cells. A variable’s correlation with itself is always 1 and is not tested.' },
    ],
    hints: ['Each variable pairs with each of the other 11; then remember the matrix is symmetric.', 'm(m − 1) ÷ 2 with m = 12.'],
    solution: 'm(m − 1) ÷ 2 = 12 × 11 ÷ 2 = 66 pairs. At α = 0.05, if none of the 66 correlations were real, about 66 × 0.05 = 3.3 cells would still be “significant” on average.',
  },
  {
    id: 'b05-mat-g2', type: 'formula', kind: 'numerical',
    prompt: 'The worksheet holds Harbourside’s 30 June days. Row 2 of the grid on the right should hold the correlation of transactions (column D) with each measure named in G1:J1. In G2, write a CORREL formula that can be filled right to J2 so that each cell correlates transactions with the column above it in the data.',
    sheet: { cells: { ...juneCells, F1: 'With:', G1: 'High (°F)', H1: 'Rain (in)', I1: 'Transactions', J1: 'Peak wait (min)', F2: 'Transactions' } },
    cell: 'G2', fill: 'G2:J2', answer: '=CORREL($D$2:$D$31,B$2:B$31)',
    alt: ['=CORREL($D$2:$D$31,B2:B31)', '=CORREL(B$2:B$31,$D$2:$D$31)', '=CORREL(B2:B31,$D$2:$D$31)', '=PEARSON($D$2:$D$31,B$2:B$31)', '=PEARSON($D$2:$D$31,B2:B31)'],
    require: [],
    view: 'A1:J31', maxHeight: '20rem',
    formats: { C: '0.00', G2: '0.000', H2: '0.000', I2: '0.000', J2: '0.000' }, widths: { A: 8, E: 14, F: 13, G: 10, H: 10, I: 12, J: 14 },
    wrong: [
      { formula: '=CORREL(D2:D31,B2:B31)', say: 'Without dollar signs the transactions range moves too as you fill right (to E2:E31, then F2:F31). Fix it with $D$2:$D$31 and let only the other range move.' },
      { formula: '=CORREL($D$2:$D$31,$B$2:$B$31)', say: 'With both ranges fixed every cell repeats the high temperature’s correlation. Leave the second range’s column relative so it moves as you fill right.' },
    ],
    hints: ['One range must stay on column D in every cell; the other must move one column each time you fill right.', 'Fix D with dollar signs on the column: <x>=CORREL($D$2:$D$31,B$2:B$31)</x>.'],
    solution: `<x>=CORREL($D$2:$D$31,B$2:B$31)</x> filled right gives ${rT.map((r) => neg(r, 3)).join(', ')}: transactions with the high, the rain, themselves (exactly 1, the diagonal) and the peak wait. The dollar signs before D fix the transactions range; B moves to C, D and E. The same pattern with the roles of rows and columns swapped fills a whole matrix.`,
  },
  {
    id: 'b05-mat-g3', type: 'steps', kind: 'numerical',
    prompt: 'Brightside Gym (fictional) correlated four monthly measures at its branches, six pairs, and got these p-values, sorted: 0.003, 0.009, 0.011, 0.020, 0.21 and 0.48. Work through the adjustments at 0.05.',
    solution: `Bonferroni tests each at 0.05 ÷ 6 = 0.0083: only 0.003 passes (${gB} pair). Holm compares 0.003 with 0.05 ÷ 6 = 0.0083, 0.009 with 0.05 ÷ 5 = 0.0100, 0.011 with 0.05 ÷ 4 = 0.0125 (all rejected), then 0.020 with 0.05 ÷ 3 = 0.0167 and stops: ${gH} pairs. Benjamini–Hochberg compares the k-th with k × 0.05 ÷ 6: rank 4’s 0.020 is below 0.0333, and ranks 5 and 6 are above 0.0417 and 0.05, so ${gF} pairs are discoveries.`,
    steps: [
      {
        id: 'b05-mat-g3-s1', type: 'num',
        prompt: 'What threshold does the Bonferroni correction use for each of the six tests? Give four decimal places.',
        answer: 0.0083, check: () => 0.05 / 6, unit: '', places: 4, tol: 0.00005,
        wrong: [{ value: 0.3, say: 'That is 6 × 0.05. Bonferroni divides α by the number of tests.' }, { value: 0.0125, say: 'That is 0.05 ÷ 4, dividing by the number of measures. The tests are the six pairs.' }],
        hints: ['α ÷ m, with m the number of tests.', '0.05 ÷ 6.'],
      },
      {
        id: 'b05-mat-g3-s2', type: 'num',
        prompt: 'How many pairs does Holm’s method reject?',
        answer: gH, check: () => { let k = 0; while (k < 6 && GYM[k] < 0.05 / (6 - k)) k++; return k; }, unit: 'pairs', places: 0, tol: 0,
        wrong: [{ value: 1, say: 'That is Bonferroni’s count. Holm’s thresholds rise after each rejection: α ÷ 6, α ÷ 5, α ÷ 4, …' }, { value: 4, say: 'The fourth p-value, 0.020, is compared with 0.05 ÷ 3 = 0.0167 and is above it, so Holm stops at three.' }],
        hints: ['Compare the smallest with 0.05 ÷ 6, the next with 0.05 ÷ 5, the next with 0.05 ÷ 4, and stop at the first failure.', '0.003, 0.009 and 0.011 pass; check 0.020 against 0.05 ÷ 3.'],
      },
      {
        id: 'b05-mat-g3-s3', type: 'num',
        prompt: 'How many pairs does the Benjamini–Hochberg procedure reject at q = 0.05?',
        answer: gF, check: () => { let k = 0; GYM.forEach((p, i) => { if (p <= ((i + 1) * 0.05) / 6) k = i + 1; }); return k; }, unit: 'pairs', places: 0, tol: 0,
        wrong: [{ value: 3, say: 'That is Holm’s count. Benjamini–Hochberg’s threshold for rank 4 is 4 × 0.05 ÷ 6 = 0.0333, and 0.020 is below it.' }, { value: 6, say: 'Ranks 5 and 6 (0.21 and 0.48) are far above their thresholds, 0.0417 and 0.05.' }],
        hints: ['The k-th smallest p-value is compared with k × 0.05 ÷ 6. Find the largest k that passes.', 'Rank 4: 0.020 against 0.0333.'],
      },
    ],
  },
  {
    id: 'b05-mat-g4', type: 'mc', kind: 'conceptual',
    prompt: 'A coffee chain builds a matrix of 20 store measures (190 pairs) to find leads for next year’s research, and every lead will be checked again on new data before anyone acts on it. Which way of handling the 190 tests fits that purpose best?',
    options: [
      'Benjamini–Hochberg at q = 0.05, accepting that about one lead in twenty may be false',
      'Bonferroni at 0.05 ÷ 190, so that there is at most a 5% chance of even one false lead',
      'No adjustment, because the leads will be checked again later on data from next year',
      'Holm’s method, choosing it after seeing that it keeps more pairs than Bonferroni does',
    ],
    answer: 0,
    hints: ['Is the cost of one false lead high here, given that every lead is rechecked?', 'Screening for leads suits controlling the share of false discoveries, not the chance of any.'],
    feedback: {
      1: 'Bonferroni protects against even one false alarm, which matters when each finding is acted on. For a screen, its threshold (0.00026) would discard many real leads.',
      2: 'Rechecking helps, but with 190 tests about 9.5 false leads would be expected if nothing were real, which wastes next year’s research. Some control is still sensible.',
      3: 'Holm is a fine way to control the family-wise error rate, but choosing a procedure because of the results it gives is a form of p-hacking, and family-wise control is stricter than a screen needs.',
    },
    solution: 'The matrix is a screen: false leads cost a recheck, not a wrong decision. Controlling the false discovery rate with Benjamini–Hochberg keeps the expected share of false leads near 5% while keeping far more real ones than Bonferroni’s 0.05 ÷ 190 ≈ 0.00026. Decide this before looking at the p-values.',
  },
];

export const independent = [
  {
    id: 'b05-mat-i1', type: 'formula', kind: 'numerical',
    prompt: 'G2:I2 hold the correlations of the peak wait (column E) with the high, the rain and transactions over Harbourside’s 30 June days, and G5 holds n. In G3, calculate the two-sided p-value of the t test of H₀: ρ = 0 for the correlation in G2, so that it fills right to I3.',
    sheet: { cells: { ...juneCells, F1: 'Peak wait with:', G1: 'High (°F)', H1: 'Rain (in)', I1: 'Transactions', F2: 'r', G2: '=CORREL(B2:B31,$E$2:$E$31)', H2: '=CORREL(C2:C31,$E$2:$E$31)', I2: '=CORREL(D2:D31,$E$2:$E$31)', F3: 'p-value', F5: 'n', G5: '=COUNT(E2:E31)' } },
    cell: 'G3', fill: 'G3:I3', answer: '=T.DIST.2T(ABS(G2)*SQRT($G$5-2)/SQRT(1-G2^2),$G$5-2)',
    alt: ['=T.DIST.2T(ABS(G2*SQRT(($G$5-2)/(1-G2^2))),$G$5-2)', '=2*T.DIST.RT(ABS(G2)*SQRT($G$5-2)/SQRT(1-G2^2),$G$5-2)', '=T.DIST.2T(ABS(G2)*SQRT(28)/SQRT(1-G2^2),28)'],
    view: 'A1:I31', maxHeight: '20rem',
    formats: { C: '0.00', G2: '0.000', H2: '0.000', I2: '0.000', G3: '0.0000', H3: '0.0000', I3: '0.0000' }, widths: { A: 8, E: 14, F: 15, G: 10, H: 10, I: 12 },
    wrong: [
      { formula: '=T.DIST.2T(ABS(G2)*SQRT(G5-2)/SQRT(1-G2^2),G5-2)', say: 'Without dollar signs, filling right moves G5 to H5 and I5, which are empty. Fix n with $G$5.' },
      { formula: '=T.DIST.2T(ABS(G2)*SQRT($G$5-2)/SQRT(1-G2^2),$G$5-1)', say: 'The test of a correlation has n − 2 degrees of freedom, not n − 1: two quantities (both means) are estimated before r.' },
      { formula: '=T.DIST.RT(ABS(G2)*SQRT($G$5-2)/SQRT(1-G2^2),$G$5-2)', say: 'T.DIST.RT gives one tail. The test is two-sided: use T.DIST.2T, or double the right tail.' },
    ],
    solution: `t = r√(n − 2) ÷ √(1 − r²) with n − 2 = 28 df, and <x>=T.DIST.2T(ABS(G2)*SQRT($G$5-2)/SQRT(1-G2^2),$G$5-2)</x> gives ${rW.map((x) => (x.p < 0.0001 ? 'below 0.0001' : fx(x.p, 4))).join(', ')} for the high, the rain and transactions. Only the transactions cell would survive any adjustment for the 28 pairs of the full matrix.`,
  },
  {
    id: 'b05-mat-i2', type: 'formula', kind: 'numerical',
    prompt: 'B2:B29 hold the p-values of all 28 pairs in Harbourside’s June matrix, in matrix order, and E1 holds the family-wise error rate α. In E2, count the pairs that are significant after a Bonferroni correction, using the number of p-values in the list rather than typing 28.',
    sheet: { cells: { ...pCells, D1: 'α', E1: 0.05, D2: 'Significant after Bonferroni' }, vary: { E1: [0.01, 0.1] }, fixed: ['B2:B29'] },
    cell: 'E2', answer: '=COUNTIF(B2:B29,"<"&E1/COUNT(B2:B29))',
    alt: ['=SUMPRODUCT(--(B2:B29<E1/COUNT(B2:B29)))', '=SUMPRODUCT((B2:B29<E1/COUNT(B2:B29))*1)', '=SUM(--(B2:B29<E1/COUNT(B2:B29)))', '=COUNTIF(B2:B29,"<"&E1/ROWS(B2:B29))', '=SUMPRODUCT(--(B2:B29*COUNT(B2:B29)<E1))'],
    require: [],
    view: 'A1:E29', maxHeight: '20rem',
    formats: { B: '0.00000', E1: '0.00' }, widths: { A: 34, D: 26 },
    wrong: [
      { formula: '=COUNTIF(B2:B29,"<"&E1)', say: 'That counts the unadjusted significant pairs. Bonferroni compares each p-value with α ÷ m, here α ÷ 28.' },
      { formula: '=COUNTIF(B2:B29,"<"&E1/8)', say: 'Eight is the number of measures; the tests are the 28 pairs. Divide α by COUNT(B2:B29).' },
    ],
    solution: `<x>=COUNTIF(B2:B29,"<"&E1/COUNT(B2:B29))</x> compares each p-value with 0.05 ÷ 28 = 0.00179 and counts ${bonfCount}. The & joins the comparison sign to the threshold, as in B03’s criteria. Change E1 to 0.1 and the count rises; with 0.01 it falls.`,
  },
  {
    id: 'b05-mat-i3', type: 'formula', kind: 'applied',
    prompt: 'The same 28 June p-values are in B2:B29, unsorted, with α in E1. In C2, calculate the Holm threshold for the p-value in B2, α ÷ (m − k + 1), where k is its rank among the 28 (1 for the smallest), so that the formula fills down to C29.',
    sheet: { cells: { ...pCells, C1: 'Holm threshold', D1: 'α', E1: 0.05 }, vary: { E1: [0.01, 0.1] } },
    cell: 'C2', fill: 'C2:C29', answer: '=$E$1/(COUNT($B$2:$B$29)-RANK.EQ(B2,$B$2:$B$29,1)+1)',
    alt: ['=$E$1/(28-RANK.EQ(B2,$B$2:$B$29,1)+1)', '=$E$1/(COUNT($B$2:$B$29)+1-RANK.EQ(B2,$B$2:$B$29,1))'],
    require: ['RANK.EQ'],
    view: 'A1:E29', maxHeight: '20rem',
    formats: { B: '0.00000', C: '0.00000', E1: '0.00' }, widths: { A: 34, C: 15 },
    wrong: [
      { formula: '=$E$1/(COUNT($B$2:$B$29)-RANK.EQ(B2,$B$2:$B$29)+1)', say: 'Without the third argument RANK.EQ ranks in descending order, so the largest p-value gets rank 1. Holm ranks from the smallest: add ,1.' },
      { formula: '=$E$1/RANK.EQ(B2,$B$2:$B$29,1)', say: 'That gives the smallest p-value the loosest threshold (α ÷ 1). Holm gives it the strictest, α ÷ m, and relaxes the threshold as k rises: α ÷ (m − k + 1).' },
      { formula: '=$E$1/(COUNT(B2:B29)-RANK.EQ(B2,B2:B29,1)+1)', say: 'Without dollar signs the ranges shrink as you fill down, so the ranks are wrong. Fix $B$2:$B$29.' },
    ],
    solution: `<x>=$E$1/(COUNT($B$2:$B$29)-RANK.EQ(B2,$B$2:$B$29,1)+1)</x>: the smallest p-value gets 0.05 ÷ 28, the next 0.05 ÷ 27, and so on. Reading down the sorted list, Holm rejects until the first p-value that is not below its threshold: the 14th smallest, ${fx(pSorted[13], 4)}, against 0.05 ÷ 15 = 0.0033, so 13 pairs survive. Ties among the tiniest p-values share a rank, which doesn’t change the decision for them.`,
  },
  {
    id: 'b05-mat-i4', type: 'mc', kind: 'applied',
    prompt: 'In Ana’s year matrix, footfall and sales correlate at 0.89 over both cafés pooled, but at 0.98 inside Harbourside and 0.97 inside Millbrook. What is the best explanation?',
    options: [
      'Millbrook has more customers but smaller tickets, so pooling blurs two tight lines into one looser cloud.',
      'The pooled correlation uses all 612 days, so its estimate is more precise than either café’s 306-day estimate.',
      'Footfall counts customers while sales are in dollars, so the units bring the pooled r down a little.',
      'A correlation worked out over more rows is always pulled closer to zero, whatever the data happen to show.',
    ],
    answer: 0,
    feedback: {
      1: 'Precision is about the width of the interval, not about why the pooled value is lower. Each café’s r rests on 306 days, which is plenty.',
      2: 'Correlation has no units: changing dollars to cents or counting in hundreds changes nothing.',
      3: 'Adding rows doesn’t pull r towards zero in general; pooling two groups with different levels does, as here, or can even strengthen or flip it.',
    },
    solution: 'Inside each café, sales track footfall almost perfectly. But Millbrook’s line sits lower for its footfall (smaller average tickets), so the two cafés’ points form two offset lines, and one line through both fits less well. Compute a pooled matrix within each group too before reading it.',
  },
  {
    id: 'b05-mat-i5', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements about correlation matrices that are true.',
    options: [
      'With m variables a matrix holds m(m − 1) ÷ 2 distinct correlations.',
      'If two variables both correlate with a third at 0.9, they must correlate with each other at 0.62 or more.',
      'With pairwise deletion each cell may rest on a different number of rows.',
      'A cell near zero shows that the two variables are unrelated.',
      'Two measures that correlate at 0.98 give two independent pieces of evidence about a third.',
      'Bonferroni’s correction is only valid when the tests are independent.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'A cell holds linear (or monotonic) association. A U-shape, a variable that is zero on most days or two groups pulling apart can all give a cell near zero.',
      4: 'They carry nearly the same information, so their links with a third variable are nearly identical: one piece of evidence counted twice.',
      5: 'Bonferroni, and Holm’s method too, need no assumption about dependence, which is why they suit a matrix.',
    },
    solution: 'True: the pair count, the bound (0.9 × 0.9 − √(0.19 × 0.19) = 0.62) and the varying n under pairwise deletion. False: a near-zero cell can hide a curve or groups; redundant measures double-count evidence; Bonferroni holds whatever the dependence.',
  },
  {
    id: 'b05-mat-i6', type: 'num', kind: 'numerical',
    prompt: 'In a report, x correlates with y at 0.8 and y with z at 0.7, all over the same rows. What is the smallest value the correlation of x with z can take? Give two decimal places.',
    answer: Math.round(bound(0.8, 0.7)[0] * 100) / 100, check: () => 0.56 - Math.sqrt(0.36 * 0.51), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 0.56, say: 'That is r(x, y) × r(y, z), the middle of the possible range. Subtract √((1 − 0.8²)(1 − 0.7²)).' },
      { value: 0.99, say: 'That is the upper limit, the product plus the square root. The question asks for the smallest value.' },
    ],
    solution: `0.8 × 0.7 − √((1 − 0.64)(1 − 0.49)) = 0.56 − √(0.36 × 0.51) = 0.56 − ${fx(Math.sqrt(0.36 * 0.51), 3)} ≈ ${fx(bound(0.8, 0.7)[0], 2)}. So x and z must correlate positively, at ${fx(bound(0.8, 0.7)[0], 2)} or more (and at most ${fx(bound(0.8, 0.7)[1], 2)}). A table showing −0.2 for that cell would have been built from different rows.`,
  },
];

export const check = [
  {
    id: 'b05-mat-k1', type: 'mc', kind: 'conceptual',
    prompt: 'An analyst reports that she controlled the false discovery rate at 5% when screening 45 correlations, and 12 were rejected. What does the 5% mean?',
    options: [
      'On average, about 5% of the correlations she reports as discoveries would be false alarms.',
      'There is at most a 5% chance that any one of the 12 reported correlations is a false alarm.',
      'Each of the 45 tests was carried out at the 0.05 ÷ 45 level to keep the error low.',
      'About 5% of the 45 correlations tested are truly zero in the population of interest.',
    ],
    answer: 0,
    feedback: {
      1: 'That is the family-wise error rate, which Bonferroni and Holm control. The false discovery rate is about the share of false alarms among the discoveries.',
      2: 'That is the Bonferroni threshold. Benjamini–Hochberg’s thresholds rise with rank, k × 0.05 ÷ 45.',
      3: 'The procedure says nothing about how many nulls are true; it bounds the expected share of false ones among those rejected.',
    },
    solution: 'The false discovery rate is the expected proportion of false alarms among the rejected hypotheses. At 5% with 12 discoveries, about 0.6 of them would be expected to be false on average, though in any one study it could be none or a few.',
  },
  {
    id: 'b05-mat-k2', type: 'num', kind: 'numerical',
    prompt: 'Harbour Light Ferries (fictional) computes a correlation matrix of 10 operating measures and wants a family-wise error rate of 5%. What significance level should each pair’s test use under the Bonferroni correction? Give five decimal places.',
    answer: Math.round((0.05 / 45) * 1e5) / 1e5, check: () => 0.05 / ((10 * 9) / 2), unit: '', places: 5, tol: 0.000005,
    wrong: [
      { value: 0.005, say: 'That divides by the 10 measures. The tests are the pairs: 10 × 9 ÷ 2 = 45.' },
      { value: 0.00056, say: 'That divides by 90, counting each pair twice. The matrix is symmetric: 45 distinct pairs.' },
    ],
    solution: '10 measures give 10 × 9 ÷ 2 = 45 pairs, so each test uses 0.05 ÷ 45 ≈ 0.00111. Holm’s method would start at the same level and relax it after each rejection.',
  },
  {
    id: 'b05-mat-k3', type: 'formula', kind: 'numerical',
    prompt: 'B2:B29 hold the 28 June p-values, unsorted, and E1 holds the false discovery rate q. In C2, calculate the Benjamini–Hochberg threshold for the p-value in B2, k × q ÷ m, with k its rank from the smallest, so that the formula fills down to C29.',
    sheet: { cells: { ...pCells, C1: 'BH threshold', D1: 'q', E1: 0.05 }, vary: { E1: [0.01, 0.1] } },
    cell: 'C2', fill: 'C2:C29', answer: '=RANK.EQ(B2,$B$2:$B$29,1)*$E$1/COUNT($B$2:$B$29)',
    alt: ['=RANK.EQ(B2,$B$2:$B$29,1)*$E$1/28', '=$E$1*RANK.EQ(B2,$B$2:$B$29,1)/COUNT($B$2:$B$29)'],
    require: ['RANK.EQ'],
    view: 'A1:E29', maxHeight: '20rem',
    formats: { B: '0.00000', C: '0.00000', E1: '0.00' }, widths: { A: 34, C: 13 },
    wrong: [
      { formula: '=RANK.EQ(B2,$B$2:$B$29)*$E$1/COUNT($B$2:$B$29)', say: 'Without the third argument RANK.EQ ranks the largest p-value first. Benjamini–Hochberg ranks from the smallest: add ,1.' },
      { formula: '=$E$1/(COUNT($B$2:$B$29)-RANK.EQ(B2,$B$2:$B$29,1)+1)', say: 'That is Holm’s threshold, α ÷ (m − k + 1). Benjamini–Hochberg’s rises in a straight line: k × q ÷ m.' },
    ],
    solution: '<x>=RANK.EQ(B2,$B$2:$B$29,1)*$E$1/COUNT($B$2:$B$29)</x>. Sorted by rank, the thresholds rise by 0.05 ÷ 28 ≈ 0.0018 per step. The largest rank whose p-value is at or below its threshold is 16, so 16 pairs are discoveries, including some (none here, as it happens) that sit above their own threshold but below a larger rank that passes.',
  },
  {
    id: 'b05-mat-k4', type: 'mc', kind: 'applied',
    prompt: `Ana’s whole-year matrix (612 days) shows the high temperature and the peak wait correlating at ${fx(YW[0].r)}, p = ${fx(YW[0].p, 3)}, and the iced share and the peak wait at ${fx(YW[1].r)}, p = ${fx(YW[1].p, 3)}. Holm’s adjustment gives ${fx(YW[0].h)} and ${fx(YW[1].h, 3)}. What should her report say about these two cells?`,
    options: [
      'Both correlations are tiny, under 0.1, so whatever their p-values they say little about waits.',
      'Iced share goes with longer waits, since its unadjusted p-value is below 0.05 and the other’s isn’t.',
      'Neither survives Holm’s adjustment, which shows that temperature has no effect at all on waits.',
      'The two cells disagree with each other, so the matrix must contain an error in one of the cells.',
    ],
    answer: 0,
    feedback: {
      1: `A p-value of ${fx(YW[1].p, 3)} on 612 days says only that r is unlikely to be exactly zero, and after the adjustment it isn’t significant either. An r of ${fx(YW[1].r)} explains about ${fx(YW[1].r ** 2 * 100, 0)}% of the variation in waits.`,
      2: 'Not surviving an adjustment is not evidence of no relationship, and a matrix can’t show effects. A curve could also hide in a small r: look at the scatterplot.',
      3: 'High temperature and iced share correlate at 0.94, so their correlations with waits are bound to be similar. Two similar small values don’t contradict each other.',
    },
    solution: 'With hundreds of days, the size of a correlation matters more than its p-value. Both are below 0.1 in size, about 1% of shared variance, and neither survives Holm. The report should say that waits show little straight-line association with the weather, and check the scatterplot for a curve before concluding more.',
  },
  {
    id: 'b05-mat-k5', type: 'classify', kind: 'conceptual',
    prompt: 'For each situation, choose the more suitable way to handle the many tests.',
    items: [
      'A bank will change its lending rules for each correlation it confirms between applicant features and default.',
      'A retailer screens 300 product-pair correlations for ideas to test in next quarter’s promotions.',
      'A hospital confirms three pre-planned links between staffing measures and waiting times for a regulator.',
      'A researcher scans 5,000 gene-expression correlations for candidates for follow-up experiments.',
    ],
    categories: ['Control the family-wise error rate (Holm)', 'Control the false discovery rate (Benjamini–Hochberg)'],
    answer: [0, 1, 0, 1],
    feedback: {
      0: 'Each confirmed correlation changes a rule, so even one false alarm is costly: control the chance of any.',
      1: 'Ideas will be tested again, so a known share of false leads is acceptable in exchange for finding more.',
      3: 'With 5,000 tests family-wise control would keep almost nothing; follow-up experiments will weed out the false leads.',
    },
    solution: 'When each finding is acted on directly (lending rules, a regulator’s report), control the chance of any false alarm, with Holm’s method. When findings are leads that will be checked again (promotion ideas, follow-up experiments), control the share of false discoveries, with Benjamini–Hochberg.',
  },
  {
    id: 'b05-mat-k6', type: 'mc', kind: 'applied',
    prompt: 'Ana wants a small dashboard of the café measures that tell her most about a day. Footfall and transactions correlate at 0.98, and each correlates with sales, peak barista hours and waits at almost the same values. What should she do?',
    options: [
      'Show one, such as transactions from the till, and keep footfall as a check on it.',
      'Show both, because two strong correlations with sales are stronger evidence than one would be.',
      'Drop both, because measures that are so highly correlated must contain an error of some kind.',
      'Show footfall only, because a door counter is always more accurate than the till’s transaction count.',
    ],
    answer: 0,
    feedback: {
      1: 'They are redundant: their correlations with sales are nearly the same piece of evidence counted twice.',
      2: 'High correlation between two measures of the same activity is expected, not a sign of error (though a sudden drop in it can flag one, as the slip in September did).',
      3: 'Neither measure is always more accurate; the door counter recorded the September slip. Choose the one closer to the question and keep the other as a check.',
    },
    solution: 'Redundant measures carry nearly the same information. Keep the one closer to the decision (transactions, for sales and staffing questions) and use the other as a data-quality check: a day on which the two disagree, like 14 September at Millbrook, is worth looking at.',
  },
];
