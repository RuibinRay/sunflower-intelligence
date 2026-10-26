// comparing-means.ex.js — B04 · Comparing two means: widgets, practice and the knowledge check (answer keys live
// here). The workshop scores and the spring orders come from case.js; Moreno Hardware, Beacon Fitness, Fairweather
// Bikes, Clearwater Contact Centre and Kinfolk Trust are fictional. Formula items are marked by their results
// (core/sheet.js gradeFormula); num items recompute their answers in `check`.
import { LATTE_PRE as PRE, LATTE_POST as POST, ORDERS, ORDER_COLUMNS } from './case.js?v=16';
import * as I from '../../../core/inference.js?v=16';
import { mean, sd } from '../../../core/stats.js?v=16';

const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const neg = (v, d = 2) => `${v < 0 ? '−' : ''}${fx(Math.abs(v), d)}`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const sig = (v, k = 6) => String(Number(v.toPrecision(k)));

// ---------------------------------------------------------------- data
const SA = [9.8, 6.1, 12.4, 8.0, 5.9, 11.7, 7.3, 10.2];
const SB = [7.1, 6.4, 8.9, 5.8, 7.6, 6.9, 7.3, 8.2, 5.2, 6.6, 7.8, 7.0, 6.1, 8.5, 6.8, 7.4, 5.9, 7.7, 6.3, 7.5];
// Moreno Hardware (fictional): weekly sales ($ thousands) in the week before and the week after new shelf labels
const MB = [42.1, 38.6, 55.3, 47.9, 61.2, 35.4, 50.8, 44.0, 58.7, 39.5];
const MA = [43.8, 39.1, 57.9, 48.2, 63.5, 36.9, 51.0, 46.1, 59.4, 41.6];
const MP = I.tTestPaired(MA, MB), MU = I.tTest2(MA, MB);
const storeCells = { A1: 'Store', B1: 'Before ($000)', C1: 'After ($000)', D1: 'Change', ...col('A', 2, MB.map((_, i) => i + 1)), ...col('B', 2, MB), ...col('C', 2, MA) };
const storeDiffs = Object.fromEntries(MB.map((_, i) => [`D${i + 2}`, `=C${i + 2}-B${i + 2}`]));
// Lantern: subscription against one-off order values
const c = (name) => ORDER_COLUMNS.indexOf(name);
const SUBV = ORDERS.filter((r) => r[c('subscription')] === 'yes').map((r) => r[c('order_total')]);
const ONEV = ORDERS.filter((r) => r[c('subscription')] === 'no').map((r) => r[c('order_total')]);
const SO = I.tTest2(SUBV, ONEV);
const subSheet = { cells: { A1: 'Subscription orders ($)', B1: 'One-off orders ($)', ...col('A', 2, SUBV), ...col('B', 2, ONEV), D1: 'Welch p-value (two-sided)' } };
// Beacon Fitness (fictional): session length (minutes) by membership plan, summaries only
const BA = { n: 15, mean: 42.0, sd: 6.0 }, BB = { n: 20, mean: 37.5, sd: 4.0 };
const BW = I.tTest2(BA, BB), BPo = I.tTest2(BA, BB, { equalVar: true });
const BWrongSE = (BA.mean - BB.mean) / Math.sqrt(BA.sd / BA.n + BB.sd / BB.n);
const TPB = I.tTest2(BB, BA), tpDf = Math.round(TPB.df), tpOne = I.tSf(Math.abs(TPB.t), tpDf);
// Fairweather Bikes (fictional): hire lengths of e-bikes and standard bikes; repair times at two workshops
const EB = [72, 85, 64, 90, 78, 69, 95, 81, 74], ST = [61, 70, 55, 66, 74, 58, 63, 69, 52, 77, 60, 65, 71, 57];
const ES = I.tTest2(EB, ST);
const bikeSheet = { cells: { A1: 'E-bike (minutes)', B1: 'Standard (minutes)', ...col('A', 2, EB), ...col('B', 2, ST), D1: 'p-value (H₁: e-bike hires longer)' } };
const R1 = [48, 55, 62, 41, 58, 66, 52, 47], R2 = [39, 44, 51, 36, 47, 42, 49, 40, 45, 38, 43];
const RW = I.tTest2(R1, R2), rUpperXl = RW.diff + I.tInv(0.975, Math.trunc(RW.df)) * RW.se;
const repairSheet = {
  cells: {
    A1: 'Quay workshop (minutes)', B1: 'Hill workshop (minutes)', ...col('A', 2, R1), ...col('B', 2, R2),
    D1: 'Standard error', E1: '=SQRT(VAR.S(A2:A9)/COUNT(A2:A9)+VAR.S(B2:B12)/COUNT(B2:B12))',
    D2: 'Welch df', E2: '=(VAR.S(A2:A9)/COUNT(A2:A9)+VAR.S(B2:B12)/COUNT(B2:B12))^2/((VAR.S(A2:A9)/COUNT(A2:A9))^2/(COUNT(A2:A9)-1)+(VAR.S(B2:B12)/COUNT(B2:B12))^2/(COUNT(B2:B12)-1))',
    D3: 'Upper 95% limit',
  },
};
// the demo worksheet: the workshop scores
const latteSheet = {
  cells: {
    A1: 'Trainee', B1: 'Before', C1: 'After', D1: 'Difference', ...col('A', 2, PRE.map((_, i) => i + 1)), ...col('B', 2, PRE), ...col('C', 2, POST),
    ...Object.fromEntries(PRE.map((_, i) => [`D${i + 2}`, `=C${i + 2}-B${i + 2}`])),
    F1: 'Mean difference', G1: '=AVERAGE(D2:D13)',
    F2: 'SD of differences', G2: '=STDEV.S(D2:D13)',
    F3: 'Paired t', G3: '=G1/(G2/SQRT(COUNT(D2:D13)))',
    F4: 'T.TEST type 1 (paired)', G4: '=T.TEST(C2:C13,B2:B13,2,1)',
    F5: 'T.TEST type 3 (Welch)', G5: '=T.TEST(C2:C13,B2:B13,2,3)',
    F6: 'T.TEST type 2 (pooled)', G6: '=T.TEST(C2:C13,B2:B13,2,2)',
    F7: '95% interval half-width', G7: '=CONFIDENCE.T(0.05,G2,COUNT(D2:D13))',
    F8: '95% interval, lower', G8: '=G1-G7',
    F9: '95% interval, upper', G9: '=G1+G7',
    F10: 'Correlation r', G10: '=CORREL(B2:B13,C2:C13)',
  },
};

export const widgets = {
  'cm-latte': {
    type: 'toolpak',
    title: 'The ToolPak’s t-tests on the latte-art scores (after as Variable 1)',
    tools: ['ttest-paired', 'ttest-unequal', 'ttest-equal'],
    groups: [{ name: 'After', values: POST }, { name: 'Before', values: PRE }],
    alpha: 0.05, hypothesized: 0,
    note: 'Only the paired tool is right for these data: the same 12 trainees were scored twice. Its t Stat, 3.644, divides the 1.583-point mean difference by 0.4345; the two independent-samples tools divide the same difference by 1.593 and get 0.994. With equal group sizes the equal- and unequal-variances tools give the same t Stat and differ only in df (22 against 21).',
  },
  'cm-calls': {
    type: 'toolpak',
    title: 'Clearwater Contact Centre: handling times with two scripts (minutes)',
    tools: ['ttest-unequal', 'ttest-equal'],
    groups: [{ name: 'Script A', values: SA }, { name: 'Script B', values: SB }],
    alpha: 0.05, hypothesized: 0,
    note: 'Script A’s variance (6.11) is almost seven times Script B’s (0.90), and A has only 8 calls. The equal-variances tool pools them and reports p = 0.0066; the unequal-variances tool, the right choice, reports p = 0.0706 with df rounded to 8. T.TEST type 3, with df 7.83, gives 0.0713.',
  },
  'cm-sheet': {
    type: 'sheet',
    title: 'Paired and unpaired tests on the workshop scores',
    sheet: latteSheet,
    view: 'A1:G13',
    editable: 'B2:C13',
    formats: { G1: '0.000', G2: '0.000', G3: '0.000', G4: '0.0000', G5: '0.0000', G6: '0.0000', G7: '0.000', G8: '0.00', G9: '0.00', G10: '0.000' },
    widths: { F: 24 },
    tools: ['formulas', 'reset'],
    note: 'G4 is the paired test, T.TEST type 1; G5 and G6 treat the columns as independent groups. Swapping two after scores (16 in C2, 10 in C4) leaves both columns with the same numbers, so G5 and G6 can’t change, while the differences in D2 and D4 become 8 and −6 and the paired p-value in G4 rises to about 0.13. The paired test uses the pairing; the others ignore it.',
  },
};

export const guided = [
  {
    id: 'b04-cm-g1', type: 'steps', kind: 'numerical',
    prompt: 'Moreno Hardware (fictional) put new shelf labels in its 10 stores. B2:B11 hold each store’s sales ($ thousands) in the week before, and C2:C11 in the week after, store by store. Did sales change?',
    solution: `The changes average ${fx(MP.meanDiff, 2)} thousand dollars a store with an SD of ${fx(MP.sdDiff, 3)}, so t = ${fx(MP.meanDiff, 2)} ÷ (${fx(MP.sdDiff, 3)} ÷ √10) ≈ ${fx(MP.t, 2)} with 9 df, and the paired p-value is ${fx(MP.p, 4)}: strong evidence that sales rose, by $${fx(MP.low, 2)} to $${fx(MP.high, 2)} thousand a store (95% interval). A two-sample test on the same columns gives p ≈ ${fx(MU.p, 2)}, because store sizes vary far more than the change. Whether the labels caused the rise is another matter: a week-to-week change across all stores, such as the weather or pay day, would look the same without a comparison group of stores.`,
    steps: [
      {
        id: 'b04-cm-g1-s1', type: 'formula',
        prompt: 'In D2, calculate store 1’s change (after minus before), and fill it down to D11.',
        sheet: { cells: { ...storeCells, F1: 'Paired p-value' } },
        cell: 'D2', fill: 'D2:D11', answer: '=C2-B2',
        alt: ['=-B2+C2', '=-(B2-C2)'],
        view: 'A1:G11',
        formats: { B: '0.0', C: '0.0', D: '0.0' }, widths: { B: 13, C: 13, F: 15 },
        wrong: [
          { formula: '=B2-C2', say: 'That is before minus after, so a rise shows as negative. The question asks for after minus before: <x>=C2-B2</x>.' },
          { formula: '=C$2-B$2', say: 'With the rows locked, every store gets store 1’s change. Leave the references relative so they move down as you fill.' },
          { formula: '=C2/B2-1', say: 'That is the percentage change. A paired t test on sales uses the differences in dollars: <x>=C2-B2</x>.' },
        ],
        hints: ['Each store’s change is its after value minus its before value, on the same row.', '<x>=C2-B2</x>, filled down.'],
      },
      {
        id: 'b04-cm-g1-s2', type: 'formula',
        prompt: 'In G1, calculate the two-sided p-value of the paired t test with T.TEST.',
        sheet: { cells: { ...storeCells, ...storeDiffs, F1: 'Paired p-value' } },
        cell: 'G1', answer: '=T.TEST(C2:C11,B2:B11,2,1)',
        alt: ['=T.TEST(B2:B11,C2:C11,2,1)', '=T.DIST.2T(ABS(AVERAGE(D2:D11)/(STDEV.S(D2:D11)/SQRT(COUNT(D2:D11)))),COUNT(D2:D11)-1)'],
        require: [],
        view: 'A1:G11',
        formats: { B: '0.0', C: '0.0', D: '0.0', G1: '0.0000' }, widths: { B: 13, C: 13, F: 15 },
        wrong: [
          { formula: '=T.TEST(C2:C11,B2:B11,2,3)', say: 'Type 3 is Welch’s test for independent samples. These are the same 10 stores measured twice: type 1, paired.' },
          { formula: '=T.TEST(C2:C11,B2:B11,2,2)', say: 'Type 2 is the pooled test for independent samples. The stores are paired: type 1.' },
          { formula: '=T.TEST(C2:C11,B2:B11,1,1)', say: 'Tails = 1 gives the one-tailed p-value, half the two-tailed one. The question asks for two-sided: tails = 2.' },
        ],
        hints: ['T.TEST(array1, array2, tails, type): two tails, and the type for the same stores measured twice.', '<x>=T.TEST(C2:C11,B2:B11,2,1)</x>'],
      },
      {
        id: 'b04-cm-g1-s3', type: 'mc',
        prompt: `The paired test gives p ≈ ${fx(MP.p, 4)}; a two-sample test on the same two columns gives p ≈ ${fx(MU.p, 2)}. Why do they differ so much?`,
        options: [
          'Store sizes vary far more than the change in sales; pairing each store with itself removes that.',
          'The paired test uses twice as many values as the two-sample test, so its standard error is half as large.',
          'The two-sample test is two-sided while the paired test is one-sided, which halves the paired test’s p-value.',
          'The paired test assumes the two weeks have equal variances, which makes its test statistic much larger.',
        ],
        answer: 0,
        hints: ['Compare how much the stores differ from each other with how much each store changed.'],
        feedback: {
          1: 'Both use the same 20 numbers. The paired test works with 10 differences, and its advantage comes from what the differences cancel.',
          2: 'Both p-values here are two-sided.',
          3: 'The paired test makes no assumption about the two weeks’ variances; it works with the differences alone.',
        },
      },
    ],
  },
  {
    id: 'b04-cm-g2', type: 'num', kind: 'numerical',
    prompt: 'Beacon Fitness (fictional) compares the average session length of members on two plans. Plan A: 15 members, mean 42.0 minutes, SD 6.0. Plan B: 20 members, mean 37.5 minutes, SD 4.0. Calculate Welch’s t statistic for H₀: μ_A − μ_B = 0. Give two decimal places.',
    answer: Math.round(BW.t * 100) / 100, check: () => (42 - 37.5) / Math.sqrt(36 / 15 + 16 / 20), unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: Math.round(BPo.t * 100) / 100, say: 'That is the pooled t, which assumes equal variances. Welch’s standard error is √(s₁²/n₁ + s₂²/n₂) = √(36/15 + 16/20).' },
      { value: Math.round(BWrongSE * 100) / 100, say: 'You used the standard deviations where the variances belong. Square them: √(6.0²/15 + 4.0²/20).' },
    ],
    hints: ['Welch’s standard error is √(s₁²/n₁ + s₂²/n₂).', 'SE = √(36 ÷ 15 + 16 ÷ 20) = √3.2; t = 4.5 ÷ SE.'],
    solution: `SE = √(6.0² ÷ 15 + 4.0² ÷ 20) = √(2.4 + 0.8) = √3.2 = ${fx(BW.se, 3)}; t = (42.0 − 37.5) ÷ ${fx(BW.se, 3)} ≈ ${fx(BW.t)}. With Welch’s df of about ${fx(BW.df, 1)}, the two-sided p-value is ${fx(BW.p, 3)}. The pooled test would give t ≈ ${fx(BPo.t)}.`,
  },
  {
    id: 'b04-cm-g3', type: 'formula', kind: 'applied',
    prompt: 'Do subscription orders differ in value from one-off orders? Column A holds the 104 spring subscription order values and column B the 127 one-off order values. In E1, calculate the two-sided p-value of Welch’s t test with T.TEST.',
    sheet: subSheet,
    cell: 'E1', answer: '=T.TEST(A2:A105,B2:B128,2,3)',
    alt: ['=T.TEST(B2:B128,A2:A105,2,3)'],
    view: 'A1:E128', maxHeight: '20rem',
    formats: { A: '$#,##0.00', B: '$#,##0.00', E1: '0.0000' }, widths: { A: 22, B: 18, D: 24 },
    wrong: [
      { formula: '=T.TEST(A2:A105,B2:B128,2,2)', say: 'Type 2 pools the variances. One-off orders include the $1,512 office order and vary far more than subscription orders: Welch’s test, type 3.' },
      { formula: '=T.TEST(A2:A105,B2:B128,2,1)', say: 'Type 1 is paired, which needs equal-length ranges of linked values; Excel returns #N/A here. These are separate orders: type 3.' },
      { formula: '=T.TEST(A2:A105,B2:B128,1,3)', say: 'Tails = 1 gives half the two-sided p-value. The question is two-sided: tails = 2.' },
    ],
    hints: ['Separate orders, so independent samples; Welch is type 3.', '<x>=T.TEST(A2:A105,B2:B128,2,3)</x>'],
    solution: `<x>=T.TEST(A2:A105,B2:B128,2,3)</x> = ${fx(SO.p, 4)}: no significant difference at 5%, though one-off orders average $${fx(SO.mean2)} against $${fx(SO.mean1)}. The one-off mean includes the $1,512 office order, so, as with web against app, report the medians and the comparison without that order too.`,
  },
  {
    id: 'b04-cm-g4', type: 'classify', kind: 'conceptual',
    prompt: 'For each study, say whether the two sets of measurements are paired or independent samples.',
    items: [
      'Twelve trainees’ latte-art scores before and after a workshop.',
      'Hire lengths of randomly chosen hires at two different bike stations.',
      'Each store’s sales in the week before and the week after new shelf labels.',
      'Call times for calls randomly assigned to an old or a new script.',
      'Twenty customers each rate two coffee blends in a blind tasting.',
      'The weights of 40 bags from one supplier and 40 bags from another.',
    ],
    categories: ['Paired', 'Independent'],
    answer: [0, 1, 0, 1, 0, 1],
    hints: ['Ask: is each value in one set linked to one particular value in the other?', 'The same person, store or unit measured twice makes a pair.'],
    feedback: {
      3: 'Each call was handled with one script only, so nothing links a call in one group to a call in the other.',
      4: 'Each customer rates both blends, so the two ratings from one customer form a pair.',
    },
    solution: 'Paired: the same trainees, the same stores and the same customers measured twice. Independent: separate hires, separate calls and separate bags, where no value in one group belongs with a particular value in the other.',
  },
];

export const independent = [
  {
    id: 'b04-cm-i1', type: 'formula', kind: 'numerical',
    prompt: 'For Moreno Hardware, D2:D11 hold each store’s change in sales (after minus before, $ thousands). In G2, calculate the lower limit of the 95% confidence interval for the mean change, using CONFIDENCE.T.',
    sheet: { cells: { ...storeCells, ...storeDiffs, F2: '95% lower limit' } },
    cell: 'G2', answer: '=AVERAGE(D2:D11)-CONFIDENCE.T(0.05,STDEV.S(D2:D11),COUNT(D2:D11))',
    require: ['CONFIDENCE.T'],
    view: 'A1:G11',
    formats: { B: '0.0', C: '0.0', D: '0.0', G2: '0.000' }, widths: { B: 13, C: 13, F: 15 },
    wrong: [
      { formula: '=AVERAGE(D2:D11)-CONFIDENCE.NORM(0.05,STDEV.S(D2:D11),COUNT(D2:D11))', say: 'CONFIDENCE.NORM uses z = 1.96. With s from 10 differences the interval needs t with 9 degrees of freedom: CONFIDENCE.T.' },
      { formula: '=AVERAGE(D2:D11)-CONFIDENCE.T(0.95,STDEV.S(D2:D11),COUNT(D2:D11))', say: 'CONFIDENCE.T’s first argument is α, 0.05 for a 95% interval, not the confidence level.' },
      { formula: '=AVERAGE(D2:D11)-CONFIDENCE.T(0.05,STDEV.P(D2:D11),COUNT(D2:D11))', say: 'Use the sample standard deviation of the differences, STDEV.S.' },
      { formula: '=AVERAGE(C2:C11)-AVERAGE(B2:B11)-CONFIDENCE.T(0.05,STDEV.S(C2:C11),COUNT(C2:C11))', say: 'The paired interval’s spread comes from the differences in column D, not from one week’s sales.' },
    ],
    solution: `<x>=AVERAGE(D2:D11)-CONFIDENCE.T(0.05,STDEV.S(D2:D11),COUNT(D2:D11))</x> = ${fx(MP.low, 3)}. The mean change is ${fx(MP.meanDiff, 2)} and the half-width ${fx(MP.meanDiff - MP.low, 3)}, so the interval runs from ${fx(MP.low, 2)} to ${fx(MP.high, 2)} thousand dollars a store; it excludes 0, as the significant paired test requires.`,
  },
  {
    id: 'b04-cm-i2', type: 'num', kind: 'numerical',
    prompt: 'For Beacon Fitness’s two plans (A: n = 15, SD 6.0; B: n = 20, SD 4.0), calculate the Welch–Satterthwaite degrees of freedom. Give one decimal place.',
    answer: Math.round(BW.df * 10) / 10, check: () => { const q1 = 36 / 15, q2 = 16 / 20; return (q1 + q2) ** 2 / (q1 ** 2 / 14 + q2 ** 2 / 19); }, unit: 'df', places: 1, tol: 0.05,
    wrong: [
      { value: 33, say: 'n₁ + n₂ − 2 = 33 is the pooled test’s df. Welch’s df come from the formula with s₁²/n₁ and s₂²/n₂.' },
      { value: 14, say: 'The smaller n − 1 is a conservative shortcut, not the Welch–Satterthwaite value.' },
    ],
    solution: `q₁ = 36 ÷ 15 = 2.4 and q₂ = 16 ÷ 20 = 0.8. df = (2.4 + 0.8)² ÷ (2.4² ÷ 14 + 0.8² ÷ 19) = 10.24 ÷ (0.4114 + 0.0337) ≈ ${fx(BW.df, 1)}. It lies between the smaller n − 1 (14) and n₁ + n₂ − 2 (33), as Welch’s df always does.`,
  },
  {
    id: 'b04-cm-i3', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements about Welch’s and the pooled two-sample t tests that are true.',
    options: [
      'With equal sample sizes the two tests give the same t statistic; only their degrees of freedom differ.',
      'When the smaller sample has the larger variance, the pooled test tends to give too many false alarms.',
      'Welch’s test loses little when the population variances are in fact equal.',
      'A non-significant F.TEST shows the variances are equal, so the pooled test is then the right choice.',
      'The pooled test is needed whenever the two samples are of different sizes.',
      'Welch’s test needs the two samples to be paired, while the pooled test does not.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Failing to find a difference doesn’t show equality, and the F test is very sensitive to non-normal data. Don’t use it as a gate.',
      4: 'Unequal sample sizes are exactly when the pooled test is most fragile if the variances differ. Welch handles them.',
      5: 'Both are tests for independent samples. Paired data need the paired t test.',
    },
    solution: 'True: with n₁ = n₂ the two standard errors are equal, so t is the same and only df differs; pooling a small, noisy sample with a large, steady one understates the standard error and inflates false alarms; and Welch’s test costs little when variances really are equal. False: a non-significant F.TEST doesn’t prove equal variances, unequal sizes are a reason to prefer Welch, and both tests are for independent samples.',
  },
  {
    id: 'b04-cm-i4', type: 'mc', kind: 'applied',
    prompt: 'Beacon Fitness ran the ToolPak’s t-Test: Two-Sample Assuming Unequal Variances with Plan B as Variable 1 and Plan A as Variable 2. The output shows the rows below. The manager’s alternative, set before collecting the data, was that Plan B members train longer than Plan A members (μ_B > μ_A). Which p-value goes with that alternative?',
    data: { table: { head: ['Row', 'Value'], rows: [['Mean (Plan B, Plan A)', '37.5, 42'], ['df', String(tpDf)], ['t Stat', sig(TPB.t)], ['P(T<=t) one-tail', sig(tpOne)], ['P(T<=t) two-tail', sig(2 * tpOne)]] } },
    options: [fx(1 - tpOne, 4), fx(tpOne, 4), fx(2 * tpOne, 4), fx(1 - 2 * tpOne, 4)],
    answer: 0,
    feedback: {
      1: 'P(T<=t) one-tail is the tail in the direction of t. Here t is negative (Plan B’s mean is lower), which is the opposite of the manager’s alternative.',
      2: 'That is the two-sided p-value. The alternative was one-sided, μ_B > μ_A.',
      3: 'That is 1 minus the two-sided value, which matches no hypothesis here.',
    },
    solution: `The data point the other way: Plan B’s mean (37.5) is below Plan A’s (42), so t Stat is negative and the one-tail row, ${fx(tpOne, 4)}, is the p-value for μ_B < μ_A. For the manager’s alternative, μ_B > μ_A, the p-value is 1 − ${fx(tpOne, 4)} = ${fx(1 - tpOne, 4)}: no evidence at all that Plan B members train longer.`,
  },
  {
    id: 'b04-cm-i5', type: 'num', kind: 'numerical',
    prompt: 'For Beacon Fitness’s plans (A: n = 15, mean 42.0, SD 6.0; B: n = 20, mean 37.5, SD 4.0), calculate Cohen’s d using the pooled standard deviation. Give two decimal places.',
    answer: Math.round((4.5 / Math.sqrt(BPo.pooledVar)) * 100) / 100, check: () => 4.5 / Math.sqrt((14 * 36 + 19 * 16) / 33), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: Math.round((4.5 / 4.0) * 100) / 100, say: 'You divided by Plan B’s SD alone. Cohen’s d uses the pooled SD, √(((n₁ − 1)s₁² + (n₂ − 1)s₂²) ÷ (n₁ + n₂ − 2)).' },
      { value: Math.round(BW.t * 100) / 100, say: 'That is the t statistic, the difference divided by its standard error. An effect size divides by the standard deviation of the data.' },
    ],
    solution: `s_p² = (14 × 36 + 19 × 16) ÷ 33 = 808 ÷ 33 = ${fx(BPo.pooledVar, 3)}, so s_p = ${fx(Math.sqrt(BPo.pooledVar), 3)} and d = 4.5 ÷ ${fx(Math.sqrt(BPo.pooledVar), 3)} ≈ ${fx(4.5 / Math.sqrt(BPo.pooledVar))}: the plans differ by about 0.9 of a standard deviation, large by Cohen’s rough labels. Whether 4.5 minutes matters to the gym is a separate, business question.`,
  },
  {
    id: 'b04-cm-i6', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the T.TEST formula for a two-sided Welch’s test comparing two separate groups in A2:A20 and B2:B31.',
    text: '=T.TEST(A2:A20,B2:B31,[[0]],[[1]]) returns [[2]].',
    blanks: [
      { options: ['1', '2', '3'], answer: 1 },
      { options: ['1', '2', '3'], answer: 2 },
      { options: ['the t statistic', 'the p-value and the degrees of freedom', 'only the p-value'], answer: 2 },
    ],
    solution: 'Tails = 2 for a two-sided test; type = 3 for two samples with unequal variances (Welch’s test). T.TEST returns only the p-value: for the t statistic and the degrees of freedom, use the formulas or the ToolPak’s unequal-variances tool.',
  },
];

export const check = [
  {
    id: 'b04-cm-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A paired t test on before-and-after measurements gives a much smaller p-value than a two-sample test on the same two columns. What is the main reason?',
    options: [
      'Strongly correlated pairs: the differences vary much less than the measurements themselves.',
      'A paired test uses the normal distribution instead of the t distribution, so its tails are thinner.',
      'A paired test has more degrees of freedom than a two-sample test on the same data.',
      'A paired test is always one-sided, while a two-sample test is always two-sided, so its p is halved.',
    ],
    answer: 0,
    feedback: {
      1: 'The paired test uses the t distribution with n − 1 degrees of freedom.',
      2: 'It has fewer: n − 1 for n pairs, against up to 2n − 2 for a two-sample test.',
      3: 'Either test can be one- or two-sided.',
    },
    solution: 'The variance of the differences is s₁² + s₂² − 2r s₁ s₂. When the pairs are strongly correlated (r near 1), most of the variation between units cancels, so the paired standard error is far smaller even though the paired test has fewer degrees of freedom.',
  },
  {
    id: 'b04-cm-k2', type: 'formula', kind: 'numerical',
    prompt: 'Fairweather Bikes (fictional) expects e-bike hires to last longer than standard-bike hires, and set that one-sided alternative before collecting the data. Column A holds 9 e-bike hire lengths and column B 14 standard-bike hire lengths, all in minutes. In E1, calculate the p-value of Welch’s test for that alternative with T.TEST.',
    sheet: bikeSheet,
    cell: 'E1', answer: '=T.TEST(A2:A10,B2:B15,1,3)',
    alt: ['=T.TEST(B2:B15,A2:A10,1,3)', '=T.TEST(A2:A10,B2:B15,2,3)/2'],
    view: 'A1:E15',
    formats: { E1: '0.0000' }, widths: { A: 16, B: 18, D: 30 },
    wrong: [
      { formula: '=T.TEST(A2:A10,B2:B15,2,3)', say: 'Tails = 2 is the two-sided p-value. The alternative is one-sided, and the data point its way, so tails = 1.' },
      { formula: '=T.TEST(A2:A10,B2:B15,1,2)', say: 'Type 2 pools the variances. Use Welch’s test, type 3.' },
      { formula: '=T.TEST(A2:A10,B2:B15,1,1)', say: 'Type 1 is paired. These are separate hires, and Excel returns #N/A for paired ranges of different lengths.' },
    ],
    solution: `The e-bike mean (${fx(mean(EB), 1)} minutes) is above the standard mean (${fx(mean(ST), 1)}), the direction of the alternative, so <x>=T.TEST(A2:A10,B2:B15,1,3)</x> = ${fx(ES.p / 2, 4)} is the p-value for it. Had the means pointed the other way, the p-value for this alternative would have been 1 minus T.TEST’s result.`,
  },
  {
    id: 'b04-cm-k3', type: 'num', kind: 'numerical',
    prompt: 'Kinfolk Trust (fictional) recorded how many calls each of 16 volunteers made in an hour before and after a short training session. The 16 differences (after minus before) have mean 2.4 calls and standard deviation 3.2 calls. Calculate the paired t statistic. Give two decimal places.',
    answer: 3, check: () => 2.4 / (3.2 / Math.sqrt(16)), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 0.75, say: 'You divided by the standard deviation. The paired t divides the mean difference by its standard error, s_d ÷ √n = 3.2 ÷ 4.' },
      { value: 12, say: 'You divided s_d by n instead of √n: the standard error is 3.2 ÷ √16 = 0.8.' },
    ],
    solution: 'SE = 3.2 ÷ √16 = 0.8, so t = 2.4 ÷ 0.8 = 3.00 with 15 degrees of freedom; the two-sided p-value, <x>=T.DIST.2T(3,15)</x>, is about 0.009.',
  },
  {
    id: 'b04-cm-k4', type: 'mc', kind: 'applied',
    prompt: 'An analyst compares two independent groups. The ToolPak’s unequal-variances tool reports df = 8 and P(T<=t) two-tail = 0.0706; T.TEST with type 3 on the same ranges returns 0.0713. What explains the difference?',
    options: [
      'The tool rounds the Welch df (here 7.83) to a whole number before finding its p-values; T.TEST does not.',
      'The tool pools the two variances behind the scenes, while T.TEST type 3 keeps the two variances separate.',
      'T.TEST type 3 is one-tailed by default, while the tool reports two tails, so their two results are different.',
      'One of the two results must be wrong, so the analyst should check the data ranges again before reporting.',
    ],
    answer: 0,
    feedback: {
      1: 'Pooling is the equal-variances tool. The unequal-variances tool uses Welch’s standard error, as T.TEST type 3 does.',
      2: 'T.TEST has no default: the tails argument is required, and here it was 2.',
      3: 'Both are right for what they compute. Microsoft documents that the tool rounds df and T.TEST uses the unrounded value.',
    },
    solution: 'Microsoft’s documentation of the unequal-variances tool says df “is rounded to the nearest integer” to find critical values, and that T.TEST uses the calculated df without rounding. With 7.83 df rounded to 8, the tool’s p-value is slightly smaller. Report which you used.',
  },
  {
    id: 'b04-cm-k5', type: 'classify', kind: 'applied',
    prompt: 'Choose the most suitable test for each comparison.',
    items: [
      'The same 30 customers rate two packaging designs on a 0–10 scale; the differences look roughly normal.',
      'Fuel use of 25 hire cars of one model and 18 of another, with similar spreads and no outliers.',
      'Eight sales of a niche product in each of two shops, one of which includes a single huge trade order.',
      'Average basket value for 400 randomly chosen web and 350 app orders, moderately skewed with no extreme value.',
    ],
    categories: ['Paired t test', 'Welch’s t test', 'A rank test, such as Mann–Whitney'],
    answer: [0, 1, 2, 1],
    feedback: {
      1: 'Similar spreads would allow pooling, but Welch’s test costs little and stays safe if the spreads differ more than they look.',
      2: 'With 8 values a group and one dominating value, the means are unreliable; a rank test is far less affected by the trade order.',
      3: 'With hundreds of values and no dominating outlier, the central limit theorem makes Welch’s test reasonable despite moderate skew.',
    },
    solution: 'The same customers rating both designs are paired. Separate cars and separate orders are independent samples, for which Welch’s test is the default, including with large, moderately skewed samples. Tiny samples with one dominating value suit a rank test such as Mann–Whitney (or a comparison with and without the outlier).',
  },
  {
    id: 'b04-cm-k6', type: 'formula', kind: 'applied',
    prompt: 'Fairweather Bikes times repairs at its Quay and Hill workshops (columns A and B, minutes). E1 holds Welch’s standard error of the difference and E2 Welch’s degrees of freedom. In E3, calculate the upper limit of the 95% confidence interval for mean Quay time minus mean Hill time.',
    sheet: repairSheet,
    cell: 'E3', answer: '=AVERAGE(A2:A9)-AVERAGE(B2:B12)+T.INV.2T(0.05,E2)*E1',
    alt: ['=AVERAGE(A2:A9)-AVERAGE(B2:B12)-T.INV(0.025,E2)*E1', '=AVERAGE(A2:A9)-AVERAGE(B2:B12)+T.INV(0.975,E2)*E1'],
    view: 'A1:E12',
    formats: { E1: '0.000', E2: '0.00', E3: '0.00' }, widths: { A: 22, B: 22, D: 16 },
    wrong: [
      { formula: '=AVERAGE(A2:A9)-AVERAGE(B2:B12)+NORM.S.INV(0.975)*E1', say: 'That uses z = 1.96. With the standard error estimated from small samples, use t with Welch’s df: T.INV.2T(0.05,E2).' },
      { formula: '=AVERAGE(A2:A9)-AVERAGE(B2:B12)+T.INV(0.05,E2)*E1', say: 'T.INV(0.05, df) is the negative one-tailed value, so this gives a lower bound. For a 95% two-sided interval use T.INV.2T(0.05,E2).' },
      { formula: '=AVERAGE(A2:A9)-AVERAGE(B2:B12)+T.INV.2T(0.025,E2)*E1', say: 'T.INV.2T already splits its probability between the two tails: 0.05 gives 2.5% in each.' },
    ],
    solution: `The difference is ${fx(RW.diff, 2)} minutes and the standard error ${fx(RW.se, 3)} with ${fx(RW.df, 2)} df; T.INV.2T truncates the df to ${Math.trunc(RW.df)} and returns ${fx(I.tInv(0.975, Math.trunc(RW.df)), 3)}, so the upper limit is ${fx(rUpperXl, 2)} minutes. The interval excludes 0: Quay repairs take longer on average.`,
  },
];
