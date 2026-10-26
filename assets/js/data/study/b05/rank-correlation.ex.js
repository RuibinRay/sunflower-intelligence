// rank-correlation.ex.js — B05 · Rank correlation: widgets, practice and the knowledge check (answer keys live here).
// Café data come from case.js (the corrected log, or the raw log where the 14 September slip is the point); Driftwood
// Ices, Cobble Lane Hotel, Halden University, Northway Rail and the other organisations named are fictional. Formula
// items are marked by their results (core/sheet.js gradeFormula); num items recompute their answers in `check`.
import { column, CLEAN_ROWS, CAFE_ROWS, CAFE_COLUMNS } from './case.js?v=20';
import * as C from '../../../core/correlation.js?v=20';
import { ranks } from '../../../core/stats.js?v=20';

const at = (n) => CAFE_COLUMNS.indexOf(n);
const fx = (v, d = 3) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(d);
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const win = (rows, cafe, from, to) => rows.filter((r) => r[at('cafe')] === cafe && r[at('date')] >= from && r[at('date')] <= to);
const mon = { '04': 'Apr', '06': 'Jun', '09': 'Sep', '10': 'Oct' };
const label = (r) => `${r[at('weekday')]} ${Number(r[at('date')].slice(8))} ${mon[r[at('date')].slice(5, 7)]}`;
const short = (iso) => `${Number(iso.slice(8))} ${['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(iso.slice(5, 7))]}`;
const r3 = (x) => Math.round(x * 1000) / 1000;

// ---------------------------------------------------------------- widgets' data
const H = { cafe: 'Harbourside' }, M = { cafe: 'Millbrook' };
const share = (r) => r[at('iced_drinks')] / (r[at('iced_drinks')] + r[at('hot_drinks')]);
const JUNE = win(CLEAN_ROWS, 'Harbourside', '2027-06-02', '2027-06-09');
const juneSheet = {
  cells: {
    A1: 'Day', B1: 'High (°F)', C1: 'Iced share (%)', D1: 'Rank of high', E1: 'Rank of share', F1: 'd', G1: 'd²',
    ...col('A', 2, JUNE.map(label)), ...col('B', 2, JUNE.map((r) => r[at('high_f')])), ...col('C', 2, JUNE.map((r) => Math.round(share(r) * 1000) / 10)),
    ...col('D', 2, JUNE.map((_, i) => `=RANK.AVG(B${i + 2},$B$2:$B$9,1)`)), ...col('E', 2, JUNE.map((_, i) => `=RANK.AVG(C${i + 2},$C$2:$C$9,1)`)),
    ...col('F', 2, JUNE.map((_, i) => `=D${i + 2}-E${i + 2}`)), ...col('G', 2, JUNE.map((_, i) => `=F${i + 2}^2`)),
    I1: 'Spearman’s ρ: CORREL of the ranks', J1: '=CORREL(D2:D9,E2:E9)',
    I2: 'd² shortcut (no ties only)', J2: '=1-6*SUM(G2:G9)/(COUNT(B2:B9)*(COUNT(B2:B9)^2-1))',
    I3: 'Pearson’s r of the values', J3: '=CORREL(B2:B9,C2:C9)',
  },
};

// ---------------------------------------------------------------- guided 1: twelve autumn days at Harbourside
const AUT = win(CLEAN_ROWS, 'Harbourside', '2027-09-20', '2027-10-01');
const autT = AUT.map((r) => r[at('high_f')]), autI = AUT.map((r) => r[at('iced_drinks')]);
const autRho = C.spearman(autT, autI).rho, autR = C.pearson(autT, autI).r;
const autBase = { A1: 'Day', B1: 'High (°F)', C1: 'Iced drinks', D1: 'Rank of high', E1: 'Rank of iced', ...col('A', 2, AUT.map(label)), ...col('B', 2, autT), ...col('C', 2, autI) };
const autRanks = { ...col('D', 2, AUT.map((_, i) => `=RANK.AVG(B${i + 2},$B$2:$B$13,1)`)), ...col('E', 2, AUT.map((_, i) => `=RANK.AVG(C${i + 2},$C$2:$C$13,1)`)) };
const tied68 = ranks(autT)[autT.indexOf(68)];

// ---------------------------------------------------------------- independent 1: Millbrook around the slip (raw log)
const SEPT = win(CAFE_ROWS, 'Millbrook', '2027-09-05', '2027-09-24');
const sF = SEPT.map((r) => r[at('footfall')]), sT = SEPT.map((r) => r[at('transactions')]);
const sFc = win(CLEAN_ROWS, 'Millbrook', '2027-09-05', '2027-09-24').map((r) => r[at('footfall')]);
const sept = { r: C.pearson(sF, sT).r, rho: C.spearman(sF, sT).rho, rC: C.pearson(sFc, sT).r, rhoC: C.spearman(sFc, sT).rho };
const yearM = { rho: C.spearman(column('footfall', { ...M, raw: true }), column('transactions', M)).rho, rhoC: C.spearman(column('footfall', M), column('transactions', M)).rho };
const septSheet = { cells: { A1: 'Date', B1: 'Footfall', C1: 'Transactions', ...col('A', 2, SEPT.map((r) => short(r[at('date')]))), ...col('B', 2, sF), ...col('C', 2, sT), E1: 'Spearman’s ρ' } };

// ---------------------------------------------------------------- check 3: a fortnight of rain at Harbourside
const OCT = win(CLEAN_ROWS, 'Harbourside', '2027-10-18', '2027-10-31');
const oR = OCT.map((r) => r[at('rain_in')]), oF = OCT.map((r) => r[at('footfall')]);
const oct = { r: C.pearson(oR, oF).r, rho: C.spearman(oR, oF).rho, dry: oR.filter((v) => v === 0).length };
const octSheet = { cells: { A1: 'Date', B1: 'Rain (in)', C1: 'Footfall', ...col('A', 2, OCT.map((r) => short(r[at('date')]))), ...col('B', 2, oR), ...col('C', 2, oF), E1: 'Spearman’s ρ' } };

// ---------------------------------------------------------------- small fictional sets
// Lantern's cupping: two baristas rank six coffees (no ties)
const CUP_A = [1, 2, 3, 4, 5, 6], CUP_B = [2, 1, 4, 3, 6, 5];
const cupD2 = CUP_A.reduce((s, v, i) => s + (v - CUP_B[i]) ** 2, 0);
// Driftwood Ices (fictional): five weeks' average high and kiosk sales
const ICE_T = [61, 68, 72, 75, 80], ICE_S = [140, 210, 190, 260, 300];
const ice = C.kendall(ICE_T, ICE_S);
// Halden University (fictional): two examiners rank seven theses (no ties)
const EX_A = [1, 2, 3, 4, 5, 6, 7], EX_B = [3, 1, 2, 5, 4, 7, 6];
const exD2 = EX_A.reduce((s, v, i) => s + (v - EX_B[i]) ** 2, 0), exRho = C.spearman(EX_A, EX_B).rho;
// d² shortcut sheet for the check (Northway Rail, fictional: punctuality rank and satisfaction rank of 9 routes)
const RAIL_P = [4, 1, 7, 2, 9, 3, 6, 8, 5], RAIL_S = [3, 2, 8, 1, 7, 5, 6, 9, 4];
const railSheet = { cells: { A1: 'Route', B1: 'Punctuality rank', C1: 'Satisfaction rank', ...col('A', 2, RAIL_P.map((_, i) => `R${i + 1}`)), ...col('B', 2, RAIL_P), ...col('C', 2, RAIL_S), E1: 'Spearman’s ρ (shortcut)' } };
const railRho = C.spearman(RAIL_P, RAIL_S).rho;

export const widgets = {
  'rank-iced': {
    type: 'scatter',
    title: 'Harbourside, 1 March – 31 December 2027: the day’s high and iced drinks sold',
    x: { name: 'Day’s high', values: column('high_f', H), unit: '°F' },
    y: { name: 'Iced drinks', values: column('iced_drinks', H) },
    labels: column('date', H).map(short),
    show: ['pearson', 'spearman', 'kendall'],
    toggles: ['ranks', 'line'],
    note: 'In values the points bend: few iced drinks in cold weather, a steep climb through the 60s, a levelling off on hot days. In ranks the same points lie along a band, and the least-squares line fits them far better. Pearson’s r of the ranks equals Spearman’s ρ, 0.924.',
  },
  'rank-slip': {
    type: 'scatter',
    title: 'Millbrook’s log as typed: footfall and transactions, with the 14 September slip',
    x: { name: 'Footfall', values: column('footfall', { ...M, raw: true }) },
    y: { name: 'Transactions', values: column('transactions', M) },
    labels: column('date', M).map(short),
    show: ['pearson', 'spearman', 'kendall'],
    toggles: ['ranks', 'logX'],
    exclude: 3,
    note: 'One point sits at 2,566 people. Leaving it out moves r from 0.519 to 0.985; Spearman’s ρ moves from 0.963 to 0.969. Leaving out the next most influential points barely changes either: the slip is the whole story.',
  },
  'rank-sheet': {
    type: 'sheet',
    title: 'Spearman’s ρ two ways: eight June days at Harbourside',
    sheet: juneSheet,
    view: 'A1:J9',
    editable: 'B2:C9',
    formats: { C: '0.0', D: '0.0', E: '0.0', F: '0.0', G: '0.00', J1: '0.000', J2: '0.000', J3: '0.000' },
    widths: { A: 11, I: 30 },
    tools: ['formulas', 'reset'],
    note: 'J1 is the definition (CORREL of the RANK.AVG columns) and J2 the shortcut; with no ties they agree at 0.976. Type 57.3 in C8 so that 7 and 8 June tie: both get rank 4.5, J1 stays a correct Spearman’s ρ, and J2 no longer equals it. Type a temperature of 100 in B7: r in J3 changes, the ranks don’t.',
  },
};

export const guided = [
  {
    id: 'b05-rank-g1', type: 'steps', kind: 'numerical',
    prompt: 'Twelve Harbourside days from 20 September to 1 October 2027: the day’s high in B2:B13 and iced drinks sold in C2:C13. Rank both columns and calculate Spearman’s ρ.',
    solution: `RANK.AVG ranks each high among all twelve, smallest first; the two days at 68°F share rank ${tied68} and the two at 69°F share rank 4.5. Pearson’s r of the rank columns, <x>=CORREL(D2:D13,E2:E13)</x>, is Spearman’s ρ = ${fx(autRho)}, against r = ${fx(autR)} on the values: the hot 26 September (85°F, 108 iced drinks) stretches the values but is simply rank 12 on both.`,
    steps: [
      {
        id: 'b05-rank-g1-s1', type: 'formula',
        prompt: 'In D2, rank the high in B2 among B2:B13 from smallest to largest, giving ties their average rank, so that the formula can be filled down to D13.',
        sheet: { cells: autBase },
        cell: 'D2', fill: 'D2:D13', answer: '=RANK.AVG(B2,$B$2:$B$13,1)',
        alt: ['=RANK.AVG(B2,B$2:B$13,1)'],
        require: ['RANK.AVG'],
        view: 'A1:E13', widths: { A: 11 }, formats: { D: '0.0' },
        wrong: [
          { formula: '=RANK.AVG(B2,B2:B13,1)', say: 'Without $ signs the range slides down as you fill: in D13 it would be B13:B24. Anchor it: $B$2:$B$13.' },
          { formula: '=RANK.AVG(B2,$B$2:$B$13)', say: 'With the order argument left out, RANK.AVG gives the largest value rank 1. Rank from smallest to largest here with order 1 (either works for ρ if both columns match, but this sheet ranks iced drinks smallest first).' },
          { formula: '=RANK.EQ(B2,$B$2:$B$13,1)', say: 'RANK.EQ gives tied values the top rank of their group (both 68°F days get 2), which shifts the ranks. Spearman’s ρ uses the average rank: RANK.AVG.' },
        ],
        hints: ['RANK.AVG(number, ref, order): order 1 ranks the smallest value as 1.', '<x>=RANK.AVG(B2,$B$2:$B$13,1)</x>, with the range anchored by $ signs.'],
      },
      {
        id: 'b05-rank-g1-s2', type: 'formula',
        prompt: 'Both rank columns are now filled (D for the high, E for iced drinks). In G1, calculate Spearman’s ρ.',
        sheet: { cells: { ...autBase, ...autRanks, F1: 'Spearman’s ρ' } },
        cell: 'G1', answer: '=CORREL(D2:D13,E2:E13)',
        alt: ['=PEARSON(D2:D13,E2:E13)', '=CORREL(E2:E13,D2:D13)'],
        view: 'A1:G13', widths: { A: 11, F: 13 }, formats: { D: '0.0', E: '0.0', G1: '0.000' },
        wrong: [
          { formula: '=CORREL(B2:B13,C2:C13)', say: 'That is Pearson’s r of the values. Spearman’s ρ is the same calculation on the ranks: CORREL(D2:D13,E2:E13).' },
          { formula: '=RSQ(D2:D13,E2:E13)', say: 'RSQ squares the correlation. Spearman’s ρ is the correlation itself: CORREL.' },
        ],
        hints: ['Spearman’s ρ is Pearson’s r calculated on the ranks.', '<x>=CORREL(D2:D13,E2:E13)</x>'],
      },
      {
        id: 'b05-rank-g1-s3', type: 'mc',
        prompt: `Over these twelve days Spearman’s ρ = ${fx(autRho)} and Pearson’s r = ${fx(autR)}. What does the gap tell Ana?`,
        options: [
          'The order agrees almost perfectly, but the values don’t lie along a straight line.',
          'Spearman’s ρ is the more accurate of the two measures, so r should be discarded from her report as wrong.',
          'The relationship is weaker than r suggests, because ranks throw away information.',
          'The two are on different scales, so the gap carries no information about the data.',
        ],
        answer: 0,
        hints: ['ρ measures how consistently the order agrees; r measures how closely the points follow a line.'],
        feedback: {
          1: 'Neither is wrong: they answer different questions. r describes the straight-line fit, ρ the consistency of the order.',
          2: 'ρ is larger here, not smaller: the order agrees more closely than a straight line fits the values.',
          3: 'Spearman’s ρ is on the same scale as r (it is r, calculated on ranks), so the two can be compared. It is Kendall’s τ that runs on a different scale.',
        },
      },
    ],
  },
  {
    id: 'b05-rank-g2', type: 'num', kind: 'numerical',
    prompt: 'At a cupping, two of Lantern’s baristas each rank six new coffees from best (1) to worst (6), with no ties. Barista A’s ranks for coffees 1 to 6 are 1, 2, 3, 4, 5, 6; barista B’s are 2, 1, 4, 3, 6, 5. Calculate Spearman’s ρ with the d² shortcut, to three decimal places.',
    answer: r3(1 - (6 * cupD2) / (6 * 35)), check: () => C.spearman(CUP_A, CUP_B).rho, unit: '', places: 3, tol: 0.0005,
    wrong: [
      { value: r3(1 - cupD2 / (6 * 35)), say: 'You left out the 6 in the numerator: ρ = 1 − 6Σd² ÷ (n(n² − 1)).' },
      { value: 0, say: 'n(n² − 1) is 6 × 35 = 210, not 6² = 36. Check the denominator.' },
      { value: r3(1 - (6 * 0) / 210), say: 'The d values add to 0, but their squares don’t: square each difference before adding.' },
    ],
    hints: ['d for each coffee is A’s rank minus B’s rank: −1, 1, −1, 1, −1, 1.', 'Σd² = 6, n = 6, so ρ = 1 − 6 × 6 ÷ (6 × 35).'],
    solution: `d = −1, 1, −1, 1, −1, 1, so Σd² = ${cupD2}. With no ties, ρ = 1 − 6 × ${cupD2} ÷ (6 × (36 − 1)) = 1 − 36 ÷ 210 = ${fx(1 - (6 * cupD2) / 210)}. The baristas agree closely: they swap neighbouring coffees but never disagree by more than one place.`,
  },
  {
    id: 'b05-rank-g3', type: 'steps', kind: 'numerical',
    prompt: 'Driftwood Ices (fictional) runs a beach kiosk. For five weeks it logged the average high and sales: 61°F and $140; 68°F and $210; 72°F and $190; 75°F and $260; 80°F and $300.',
    solution: `Sorted by temperature, sales run 140, 210, 190, 260, 300. Of the 10 pairs only (68°F, $210) and (72°F, $190) is discordant, so n_c = ${ice.concordant}, n_d = ${ice.discordant} and τ = (9 − 1) ÷ 10 = ${ice.tau.toFixed(1)}. No ties, so τ-a and τ-b agree. Spearman’s ρ for the same data is ${C.spearman(ICE_T, ICE_S).rho.toFixed(1)}: τ is usually the smaller of the two.`,
    steps: [
      {
        id: 'b05-rank-g3-s1', type: 'num',
        prompt: 'Five weeks make 10 pairs of weeks. How many pairs are concordant?',
        answer: ice.concordant, check: () => C.kendall(ICE_T, ICE_S).concordant, unit: 'pairs', places: 0, tol: 0,
        wrong: [{ value: 1, say: 'That is the number of discordant pairs: the one pair where the warmer week sold less.' }, { value: 10, say: 'One pair goes the wrong way: 72°F sold less than 68°F.' }],
        hints: ['List the weeks in order of temperature; then for each pair ask whether the warmer week also sold more.', 'Sales in temperature order: 140, 210, 190, 260, 300. Only one pair is out of order.'],
      },
      {
        id: 'b05-rank-g3-s2', type: 'num',
        prompt: 'Calculate Kendall’s τ for the five weeks, to one decimal place.',
        answer: r3(ice.tau), check: () => C.kendall(ICE_T, ICE_S).tau, unit: '', places: 1, tol: 0.005,
        wrong: [{ value: 0.9, say: 'That is the share of pairs that are concordant. τ subtracts the discordant share: (9 − 1) ÷ 10.' }],
        hints: ['τ = (n_c − n_d) ÷ number of pairs.'],
      },
    ],
  },
  {
    id: 'b05-rank-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Halden University (fictional) asks 40 students to rate a module from 1 (poor) to 5 (excellent) on “clarity of teaching” and on “overall satisfaction”. Most answers are 3 or 4. Which measure of association suits these data best?',
    options: [
      'Kendall’s τ-b, or Spearman’s ρ with average ranks: the ratings are ordinal and heavily tied.',
      'Pearson’s r, because the ratings are numbers from 1 to 5 and the sample of 40 is large enough.',
      'Spearman’s ρ by the d² shortcut, because it is the quickest method by hand with 40 students.',
      'No correlation can be calculated, because ratings are categories rather than measurements.',
    ],
    answer: 0,
    hints: ['Is the gap between 1 and 2 on this scale guaranteed to equal the gap between 4 and 5?', 'With five possible values and 40 students, how many ties will there be?'],
    feedback: {
      1: 'Pearson’s r treats the ratings as measurements with equal gaps, which an ordinal scale doesn’t promise. The sample size doesn’t change what the numbers mean.',
      2: 'The d² shortcut is exact only without ties, and with five possible ratings and 40 students nearly every value is tied.',
      3: 'Ordinal categories have an order, and rank correlations use exactly that order.',
    },
    solution: 'Ratings are ordinal: ordered, without fixed distances. Rank correlations use only the order. With five possible values almost every answer is tied, so use Kendall’s τ-b (whose tie correction is part of its definition) or Spearman’s ρ calculated as r of the average ranks, never the d² shortcut.',
  },
];

export const independent = [
  {
    id: 'b05-rank-i1', type: 'formula', kind: 'numerical',
    prompt: 'Millbrook’s log as typed, 5–24 September 2027: footfall in B2:B21 and transactions in C2:C21. The 14 September slip is still in it. In F1, calculate Spearman’s ρ in a single formula.',
    sheet: septSheet,
    cell: 'F1', answer: '=CORREL(RANK.AVG(B2:B21,B2:B21,1),RANK.AVG(C2:C21,C2:C21,1))',
    alt: ['=CORREL(RANK.AVG(B2:B21,B2:B21),RANK.AVG(C2:C21,C2:C21))', '=PEARSON(RANK.AVG(B2:B21,B2:B21,1),RANK.AVG(C2:C21,C2:C21,1))'],
    require: ['RANK.AVG'],
    view: 'A1:F21', widths: { E: 14 }, formats: { F1: '0.000' },
    wrong: [
      { formula: '=CORREL(B2:B21,C2:C21)', say: 'That is Pearson’s r of the values, which the slip drags down. Spearman’s ρ correlates the ranks: wrap each range in RANK.AVG(range,range,1).' },
      { formula: '=CORREL(RANK.AVG(B2:B21,B2:B21),RANK.AVG(C2:C21,C2:C21,1))', say: 'One column is ranked largest first and the other smallest first, which flips the sign of ρ. Give both the same order.' },
      { formula: '=CORREL(RANK.EQ(B2:B21,B2:B21,1),RANK.EQ(C2:C21,C2:C21,1))', say: 'RANK.EQ gives tied values the top rank of the group rather than the average. Spearman’s ρ uses average ranks: RANK.AVG.' },
    ],
    solution: `<x>=CORREL(RANK.AVG(B2:B21,B2:B21,1),RANK.AVG(C2:C21,C2:C21,1))</x> = ${fx(sept.rho)}, against Pearson’s r = ${fx(sept.r)}. With the slip corrected the figures are ρ = ${fx(sept.rhoC)} and r = ${fx(sept.rC)}. The slip moves ρ more here than across the whole year (${fx(yearM.rhoC)} to ${fx(yearM.rho)}), because in 20 days one day’s rank can jump further relative to the rest; but r collapses either way.`,
  },
  {
    id: 'b05-rank-i2', type: 'num', kind: 'numerical',
    prompt: 'A fortnight’s rainfall at a garden centre (fictional) has 0 inches on 9 of the 14 days and a different, positive amount on each of the other 5. Ranking from smallest to largest with RANK.AVG, what rank does each dry day receive?',
    answer: 5, check: () => ranks([0, 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.2, 0.3, 0.4, 0.5])[0], unit: '', places: 1, tol: 0.01,
    wrong: [
      { value: 1, say: 'That is RANK.EQ’s answer: the top of the tied group. RANK.AVG gives the average of positions 1 to 9.' },
      { value: 9, say: 'Position 9 is the last of the tied group. The average rank is the mean of positions 1 to 9.' },
      { value: 4.5, say: 'Nine dry days occupy positions 1 to 9, whose average is (1 + 9) ÷ 2 = 5.' },
    ],
    solution: 'The nine dry days occupy positions 1 to 9 in the sorted list and share their average, (1 + 9) ÷ 2 = 5. The smallest wet day takes rank 10. The ranks still add to 14 × 15 ÷ 2 = 105, as they would without ties (9 × 5 + 10 + 11 + 12 + 13 + 14 = 105).',
  },
  {
    id: 'b05-rank-i3', type: 'num', kind: 'numerical',
    prompt: 'A survey of 10 shoppers (fictional) records two 1–5 ratings each. Of the 45 pairs of shoppers, 25 are concordant and 8 discordant; 7 pairs are tied on the first rating and 4 on the second (and 1 on both, counted in each). Calculate Kendall’s τ-b to three decimal places.',
    answer: r3((25 - 8) / Math.sqrt((45 - 7) * (45 - 4))), check: () => (25 - 8) / Math.sqrt((45 - 7) * (45 - 4)), unit: '', places: 3, tol: 0.0005,
    wrong: [
      { value: r3((25 - 8) / 45), say: 'That is τ-a, which divides by all 45 pairs. τ-b removes the tied pairs of each variable from the denominator: √((45 − 7)(45 − 4)).' },
      { value: r3((25 - 8) / (25 + 8)), say: 'Dividing by concordant plus discordant pairs ignores the ties entirely. τ-b uses √((n₀ − n₁)(n₀ − n₂)).' },
    ],
    solution: `τ-b = (25 − 8) ÷ √((45 − 7)(45 − 4)) = 17 ÷ √(38 × 41) = 17 ÷ ${Math.sqrt(38 * 41).toFixed(2)} = ${fx((25 - 8) / Math.sqrt(38 * 41))}. τ-a would be 17 ÷ 45 = ${fx(17 / 45)}, pulled towards 0 because tied pairs can be neither concordant nor discordant.`,
  },
  {
    id: 'b05-rank-i4', type: 'classify', kind: 'applied',
    prompt: 'For each situation, choose the measure you would report first.',
    items: [
      'Daily footfall and transactions at a café, after checking the log: the scatterplot is a tight straight band.',
      'Two wine judges each rank twelve wines from 1 to 12.',
      'A hotel’s 1–5 cleanliness and overall ratings from 200 guests.',
      'Temperature and an ice-cream kiosk’s sales over a summer: sales rise ever more steeply on hot days.',
      'Hours of sleep and test scores, where scores are low after very little or a great deal of sleep and highest in between.',
    ],
    categories: ['Pearson’s r', 'Spearman’s ρ or Kendall’s τ-b', 'No single coefficient: describe the curve from the plot'],
    answer: [0, 1, 1, 1, 2],
    feedback: {
      0: 'Numeric, straight and checked: r uses all the information and links to regression.',
      1: 'The data are ranks already; Spearman’s ρ (or τ) is the natural measure.',
      2: 'Ordinal ratings with heavy ties: τ-b or ρ with average ranks.',
      3: 'Monotonic but curved: r understates the consistency of the link; ρ or τ measures it.',
      4: 'An inverted U is not monotonic: r and ρ could both be near 0 though sleep matters a great deal. Describe the shape.',
    },
    solution: 'Pearson’s r for straight, well-behaved numeric data; Spearman’s ρ or Kendall’s τ-b for ranks, ordinal ratings and curves that keep going one way; neither for a relationship that rises and then falls, where any single correlation can hide a strong link.',
  },
  {
    id: 'b05-rank-i5', type: 'mc', kind: 'conceptual',
    prompt: 'In a set of 50 days, the largest footfall value is accidentally typed with an extra zero, so it becomes ten times larger. It was already the largest value. What happens to Spearman’s ρ between footfall and transactions?',
    options: [
      'Nothing: the day was already ranked 50th, so no rank changes.',
      'It falls sharply, in the same way as Pearson’s r does.',
      'It rises, because the extreme value now dominates the ranks.',
      'It becomes impossible to calculate until the slip is removed.',
    ],
    answer: 0,
    feedback: {
      1: 'Pearson’s r uses distances from the mean, so it can move a lot. Ranks only record order, and the order hasn’t changed.',
      2: 'A rank can’t exceed n: the largest value is rank 50 however large it is.',
      3: 'Ranks can be calculated for any numbers; an extreme value just takes the top rank.',
    },
    solution: 'Ranks depend only on order. The value was the largest and still is, so every rank, and hence ρ, is unchanged; Pearson’s r, which uses the distances, can change a great deal. Had the slip turned a middling value into the largest, one rank would move and ρ would change a little. Either way, the record still needs correcting.',
  },
  {
    id: 'b05-rank-i6', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements that are true.',
    options: [
      'Spearman’s ρ equals Pearson’s r calculated on average ranks.',
      'Kendall’s τ-b equals τ-a when neither variable has ties.',
      'A Spearman’s ρ of 1 means the points lie on a straight line.',
      'The d² shortcut gives Spearman’s ρ exactly whatever the ties.',
      'Ranking one column largest first and the other smallest first flips the sign of ρ.',
      'Kendall’s τ and Pearson’s r for the same data are on the same scale and can be compared directly.',
    ],
    answer: [0, 1, 4],
    feedback: {
      2: 'ρ = 1 whenever the order agrees perfectly, which a rising curve also achieves.',
      3: 'The shortcut assumes ranks exactly 1 to n; ties break that, and its answer drifts from the true ρ.',
      5: 'τ is usually smaller in size than r or ρ for the same data; compare τ only with τ.',
    },
    solution: 'True: ρ is r of the (average) ranks; τ-b = τ-a without ties, because no pairs are removed from the denominator; mixing rank directions reverses one variable and flips the sign. False: ρ = 1 for any perfectly increasing curve; the shortcut is exact only without ties; τ runs on its own scale.',
  },
];

export const check = [
  {
    id: 'b05-rank-k1', type: 'mc', kind: 'conceptual',
    prompt: 'For ten points with y = x³ and x = 1, 2, …, 10, which pair of values is correct?',
    options: ['r below 1, and Spearman’s ρ exactly 1', 'r = 1 and Spearman’s ρ = 1', 'r = 1 and Spearman’s ρ below 1', 'r and Spearman’s ρ both below 1'],
    answer: 0,
    feedback: {
      1: 'r = 1 needs a straight line. y = x³ curves upward, so r is a little below 1.',
      2: 'ρ can’t be below 1 here: y rises every time x rises, so the ranks agree perfectly.',
      3: 'The order agrees perfectly, so Spearman’s ρ is exactly 1; only r falls short.',
    },
    solution: `y = x³ rises every time x rises, so the ranks of x and y are identical and Spearman’s ρ = 1. The points curve upward rather than lying on a line, so r = ${fx(C.pearson([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => v ** 3)).r)}, below 1.`,
  },
  {
    id: 'b05-rank-k2', type: 'num', kind: 'numerical',
    prompt: 'Two examiners at Halden University (fictional) rank seven theses with no ties. Examiner A’s ranks for theses 1–7 are 1, 2, 3, 4, 5, 6, 7; examiner B’s are 3, 1, 2, 5, 4, 7, 6. Calculate Spearman’s ρ to three decimal places.',
    answer: r3(exRho), check: () => 1 - (6 * exD2) / (7 * 48), unit: '', places: 3, tol: 0.0005,
    wrong: [
      { value: r3(1 - exD2 / 336), say: 'The numerator is 6Σd², not Σd².' },
      { value: r3(1 - (6 * exD2) / (7 * 49)), say: 'The denominator is n(n² − 1) = 7 × 48 = 336, not n × n².' },
    ],
    solution: `d = −2, 1, 1, −1, 1, −1, 1, so Σd² = ${exD2}; ρ = 1 − 6 × ${exD2} ÷ (7 × 48) = 1 − ${6 * exD2} ÷ 336 = ${fx(exRho)}. No ties, so the shortcut equals Pearson’s r of the ranks.`,
  },
  {
    id: 'b05-rank-k3', type: 'formula', kind: 'numerical',
    prompt: 'Harbourside, 18–31 October 2027: rain (inches) in B2:B15 and footfall in C2:C15. Most days are dry, so rain has many ties. In F1, calculate Spearman’s ρ in one formula.',
    sheet: octSheet,
    cell: 'F1', answer: '=CORREL(RANK.AVG(B2:B15,B2:B15,1),RANK.AVG(C2:C15,C2:C15,1))',
    alt: ['=CORREL(RANK.AVG(B2:B15,B2:B15),RANK.AVG(C2:C15,C2:C15))', '=PEARSON(RANK.AVG(B2:B15,B2:B15,1),RANK.AVG(C2:C15,C2:C15,1))'],
    require: ['RANK.AVG'],
    view: 'A1:F15', widths: { E: 14 }, formats: { B: '0.00', F1: '0.000' },
    wrong: [
      { formula: '=CORREL(B2:B15,C2:C15)', say: 'That is Pearson’s r of the values. Correlate the ranks: RANK.AVG on each column, with the same order.' },
      { formula: '=CORREL(RANK.EQ(B2:B15,B2:B15,1),RANK.EQ(C2:C15,C2:C15,1))', say: 'RANK.EQ gives every dry day rank 1 instead of their average rank, which changes ρ when there are ties. Use RANK.AVG.' },
    ],
    solution: `<x>=CORREL(RANK.AVG(B2:B15,B2:B15,1),RANK.AVG(C2:C15,C2:C15,1))</x> = ${fx(oct.rho)}. The ${oct.dry} dry days share the average rank ${(1 + oct.dry) / 2}. Pearson’s r of the values is ${fx(oct.r)}. Fourteen days of one autumn fortnight are too few to rely on; the whole year at Harbourside gives ρ = ${fx(C.spearman(column('rain_in', H), column('footfall', H)).rho)}.`,
  },
  {
    id: 'b05-rank-k4', type: 'formula', kind: 'numerical',
    prompt: 'Northway Rail (fictional) ranks its 9 routes by punctuality (B2:B10) and by passenger satisfaction (C2:C10), with no ties. In F1, calculate Spearman’s ρ with the d² shortcut, using COUNT for n.',
    sheet: railSheet,
    cell: 'F1', answer: '=1-6*SUMPRODUCT((B2:B10-C2:C10)^2)/(COUNT(B2:B10)*(COUNT(B2:B10)^2-1))',
    alt: ['=1-6*SUMPRODUCT((C2:C10-B2:B10)^2)/(COUNT(B2:B10)*(COUNT(B2:B10)^2-1))', '=1-6*SUM((B2:B10-C2:C10)^2)/(COUNT(B2:B10)*(COUNT(B2:B10)^2-1))', '=1-6*SUMPRODUCT((B2:B10-C2:C10)^2)/(COUNT(B2:B10)^3-COUNT(B2:B10))'],
    view: 'A1:F10', widths: { B: 16, C: 17, E: 22 }, formats: { F1: '0.000' },
    wrong: [
      { formula: '=1-SUMPRODUCT((B2:B10-C2:C10)^2)/(COUNT(B2:B10)*(COUNT(B2:B10)^2-1))', say: 'The numerator is 6 × Σd²: you left out the 6.' },
      { formula: '=1-6*SUMPRODUCT(B2:B10-C2:C10)^2/(COUNT(B2:B10)*(COUNT(B2:B10)^2-1))', say: 'That squares the sum of the differences, which is always 0 for ranks. Square each difference, then add: SUMPRODUCT((B2:B10-C2:C10)^2).' },
      { formula: '=1-6*SUMPRODUCT((B2:B10-C2:C10)^2)/(COUNT(B2:B10)^2-1)', say: 'The denominator is n(n² − 1), not n² − 1.' },
    ],
    solution: `Σd² = ${RAIL_P.reduce((s, v, i) => s + (v - RAIL_S[i]) ** 2, 0)} and n = 9, so ρ = 1 − 6 × ${RAIL_P.reduce((s, v, i) => s + (v - RAIL_S[i]) ** 2, 0)} ÷ (9 × 80) = ${fx(railRho)}. Because there are no ties, <x>=CORREL(B2:B10,C2:C10)</x> gives the same value: the shortcut is just a faster route to r of the ranks.`,
  },
  {
    id: 'b05-rank-k5', type: 'num', kind: 'numerical',
    prompt: 'Six branches of a bike-repair chain (fictional) are compared on mechanics’ average experience and on repairs completed per week, with no ties on either. Of the 15 pairs of branches, 3 are discordant. Calculate Kendall’s τ.',
    answer: 0.6, check: () => (15 - 3 - 3) / 15, unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 0.8, say: 'That is the share of pairs that are concordant (12 of 15). τ subtracts the discordant pairs: (12 − 3) ÷ 15.' },
      { value: 0.2, say: 'That is the discordant share. τ = (concordant − discordant) ÷ pairs = (12 − 3) ÷ 15.' },
    ],
    solution: 'With no ties every pair is concordant or discordant, so 15 − 3 = 12 are concordant. τ = (12 − 3) ÷ 15 = 0.6. Without ties τ also reads as a difference of chances: two branches picked at random are 60 percentage points more likely to be ordered the same way on both measures than oppositely.',
  },
  {
    id: 'b05-rank-k6', type: 'mc', kind: 'applied',
    prompt: 'A logistics firm’s analyst (fictional) finds that, across 200 deliveries, Pearson’s r between parcel weight and delivery cost is 0.31 while Spearman’s ρ is 0.88. What should the analyst do next?',
    options: [
      'Plot cost against weight, check the most extreme points, then choose the measure.',
      'Report ρ = 0.88, because rank correlations are robust to extreme values and so always the better measure.',
      'Average the two coefficients and report 0.60 as a fair compromise between the two measures.',
      'Report r = 0.31, because Pearson’s r is the standard measure for numeric data.',
    ],
    answer: 0,
    feedback: {
      1: 'Robustness protects ρ from a few points; it doesn’t tell you whether those points are errors that also distort everything else.',
      2: 'Two different measures can’t be averaged into a meaningful third.',
      3: 'A gap this large means r is being driven by a few points or a curve. Find out which before reporting either.',
    },
    solution: 'A gap of nearly 0.6 between r and ρ means the order agrees closely while the values don’t follow a line: a curve, or a few extreme points (perhaps a mistyped weight). Plot it, check the extreme points against the records, correct any slips, then report the measure that fits what the plot shows, with the other beside it.',
  },
];
