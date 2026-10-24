// describing-distributions.ex.js — B04 · Describing distributions: widgets, practice and the knowledge check (answer
// keys live here). Lantern's orders, ratings and catering events come from case.js; the bakery, the bike-hire firm and
// their numbers are fictional. Formula items are marked by their results (core/sheet.js gradeFormula); num items
// recompute their answers in `check`.
import { ORDER_VALUES, PER_GUEST_BY_TYPE as G, EVENTS, EVENT_COLUMNS, DERIVED as D } from './case.js?v=12';

const sum = (a) => a.reduce((s, x) => s + x, 0);
const mean = (a) => sum(a) / a.length;
const sdS = (a) => { const m = mean(a); return Math.sqrt(sum(a.map((x) => (x - m) ** 2)) / (a.length - 1)); };
const sdP = (a) => { const m = mean(a); return Math.sqrt(sum(a.map((x) => (x - m) ** 2)) / a.length); };
const devsq = (a) => { const m = mean(a); return sum(a.map((x) => (x - m) ** 2)); };
const trimmean = (a, pct) => { const s = [...a].sort((x, y) => x - y); let k = Math.floor(a.length * pct); k -= k % 2; const h = k / 2; return mean(s.slice(h, s.length - h)); };
const usd = (v, d = 2) => `$${v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const ids = (type) => EVENTS.filter((r) => r[EVENT_COLUMNS.indexOf('event_type')] === type).map((r) => r[0]);
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
/** Event ids in A and invoice per guest-day in B, from row 2. */
const typeSheet = (type, extra = {}) => ({ cells: { A1: 'Event', B1: 'Per guest-day', ...col('A', 2, ids(type)), ...col('B', 2, G[type]), ...extra } });

const L = G.Launch, M = G.Meeting, TDY = G['Team day'], CONF = G.Conference;
const CONF_MAX = Math.max(...CONF);
const LOCATE = 10.14;                                  // EV-021's invoice per guest-day, one of the meetings
// Crowfoot Bakery (fictional): 20 Saturday takings ($)
const TAKINGS = [1240, 1380, 980, 1510, 1420, 1190, 2650, 1330, 1270, 1460, 1120, 1350, 1290, 1580, 1410, 760, 1300, 1440, 1360, 1230];

// ---------------------------------------------------------------- widgets
const statRows = [
  ['Count', '=COUNT(B2:B29)', 'general'], ['Mean', '=AVERAGE(B2:B29)'], ['Median', '=MEDIAN(B2:B29)'], ['Trimmed mean (20%)', '=TRIMMEAN(B2:B29,0.2)'],
  ['Sum of squares', '=DEVSQ(B2:B29)', '0.0000'], ['Variance (sample)', '=VAR.S(B2:B29)', '0.0000'], ['SD (sample)', '=STDEV.S(B2:B29)'], ['SD (population)', '=STDEV.P(B2:B29)'],
  ['Coefficient of variation', '=E8/E3', '0.0%'], ['Minimum', '=MIN(B2:B29)'], ['Q1 (.INC)', '=QUARTILE.INC(B2:B29,1)'], ['Q3 (.INC)', '=QUARTILE.INC(B2:B29,3)'],
  ['Maximum', '=MAX(B2:B29)'], ['Skewness', '=SKEW(B2:B29)', '0.00'], ['Kurtosis', '=KURT(B2:B29)', '0.00'],
];
const statFormats = Object.fromEntries(statRows.map((x, i) => [`E${i + 2}`, x[2]]).filter((x) => x[1]));

export const widgets = {
  'dd-orders': {
    type: 'distribution',
    values: ORDER_VALUES,
    label: 'Order value, spring 2026 ($)',
    transforms: ['none', 'log'],
    rules: ['z', 'iqr', 'mad'],
    closed: 'right',
    edges: [20, 40, 60, 80, 100],
  },
  'dd-sheet': {
    type: 'sheet',
    title: 'Ana’s 28 meetings of 2026: invoice per guest-day with live summaries',
    sheet: typeSheet('Meeting', {
      D1: 'Statistic', E1: 'Value',
      ...Object.fromEntries(statRows.flatMap(([l, f], i) => [[`D${i + 2}`, l], [`E${i + 2}`, f]])),
      D18: 'Value to locate', E18: 17.14, D19: 'z-score', E19: '=STANDARDIZE(E18,E3,E8)', D20: 'Share of the others below', E20: '=COUNTIF(B2:B29,"<"&E18)/(E2-1)',
    }),
    view: 'A1:E29',
    maxHeight: '24rem',
    editable: ['B2:B29', 'E18:E18'],
    formats: { B: '$#,##0.00', E: '$#,##0.00', ...statFormats, E19: '0.00', E20: '0.0%' },
    widths: { D: 22 },
    tools: ['formulas', 'reset'],
    note: 'Change B23 (EV-047, $17.14) to 10: the mean falls by about 25 cents, the standard deviations and the CV by about a quarter, and SKEW and KURT by about a third, while the median, the quartiles and the trimmed mean barely move. E20 is the fraction Excel’s PERCENTRANK.INC returns: the values below E18 divided by n − 1.',
  },
};

// ---------------------------------------------------------------- guided practice
export const guided = [
  {
    id: 'b04-dd-g1', type: 'steps', kind: 'numerical',
    prompt: 'Ana’s 11 launch events of 2026 earned the invoices per guest-day in B2:B12. Measure their spread, by function and by hand.',
    solution: `<x>=DEVSQ(B2:B12)</x> = ${devsq(L).toFixed(4)}; the sample variance is ${devsq(L).toFixed(4)} ÷ (11 − 1) = ${(devsq(L) / 10).toFixed(4)}; and the coefficient of variation is <x>=STDEV.S(B2:B12)/AVERAGE(B2:B12)</x> = ${usd(sdS(L), 4)} ÷ $9.00 ≈ ${(sdS(L) / mean(L) * 100).toFixed(1)}%. A typical launch is within about 7.5% of the average launch’s invoice per guest.`,
    steps: [
      {
        id: 'b04-dd-g1-s1', type: 'formula',
        prompt: 'In E2, calculate the sum of squares: the total of the squared deviations of the values from their mean.',
        sheet: typeSheet('Launch', { D2: 'Sum of squares', D3: 'Sample variance', D4: 'CV' }),
        cell: 'E2', answer: '=DEVSQ(B2:B12)',
        alt: ['=SUMPRODUCT((B2:B12-AVERAGE(B2:B12))^2)', '=VAR.S(B2:B12)*(COUNT(B2:B12)-1)'],
        view: 'A1:E12', formats: { B: '$#,##0.00', E: '0.0000' }, widths: { D: 16 },
        wrong: [
          { formula: '=SUMSQ(B2:B12)', say: 'SUMSQ squares the values themselves and adds them. The sum of squares measures distances from the mean: DEVSQ.' },
          { formula: '=VAR.S(B2:B12)', say: 'VAR.S has already divided the sum of squares by n − 1. Use DEVSQ, which stops before the division.' },
          { formula: '=DEVSQ(B2:B11)', say: 'The range stops at B11 and leaves out the last launch. Use B2:B12.' },
        ],
        hints: ['Excel has one function for the sum of squared deviations from the sample mean.', '<x>=DEVSQ(B2:B12)</x>'],
      },
      {
        id: 'b04-dd-g1-s2', type: 'num',
        prompt: `E2 shows ${devsq(L).toFixed(4)}. What is the sample variance of the 11 launches? Give four decimal places.`,
        answer: Number((devsq(L) / 10).toFixed(4)), check: () => devsq(L) / (L.length - 1), unit: '', places: 4, tol: 0.0005,
        wrong: [
          { value: Number((devsq(L) / 11).toFixed(4)), say: 'You divided by n = 11. A sample variance divides by n − 1 = 10, the degrees of freedom.' },
          { value: Number(sdS(L).toFixed(4)), say: 'That is the standard deviation, the square root of the variance. The variance is the sum of squares ÷ (n − 1).' },
        ],
        hints: ['A sample variance divides the sum of squares by the degrees of freedom.', `${devsq(L).toFixed(4)} ÷ (11 − 1).`],
      },
      {
        id: 'b04-dd-g1-s3', type: 'formula',
        prompt: 'In E4, calculate the coefficient of variation of the launches from the data in B2:B12 (E4 is formatted as a percentage).',
        sheet: typeSheet('Launch', { D2: 'Sum of squares', D3: 'Sample variance', D4: 'CV', E2: '=DEVSQ(B2:B12)', E3: '=E2/(COUNT(B2:B12)-1)' }),
        cell: 'E4', answer: '=STDEV.S(B2:B12)/AVERAGE(B2:B12)',
        alt: ['=SQRT(E3)/AVERAGE(B2:B12)', '=SQRT(VAR.S(B2:B12))/AVERAGE(B2:B12)'],
        view: 'A1:E12', formats: { B: '$#,##0.00', E2: '0.0000', E3: '0.0000', E4: '0.0%' }, widths: { D: 16 },
        wrong: [
          { formula: '=STDEV.P(B2:B12)/AVERAGE(B2:B12)', say: 'STDEV.P divides by n. The 11 launches are a sample of Ana’s launch catering, so use STDEV.S.' },
          { formula: '=AVERAGE(B2:B12)/STDEV.S(B2:B12)', say: 'That is upside down. The CV is the standard deviation as a share of the mean: STDEV.S ÷ AVERAGE.' },
          { formula: '=VAR.S(B2:B12)/AVERAGE(B2:B12)', say: 'The variance is in dollars squared, so dividing it by a mean in dollars gives no meaningful ratio. Use the standard deviation.' },
        ],
        hints: ['CV = standard deviation ÷ mean.', '<x>=STDEV.S(B2:B12)/AVERAGE(B2:B12)</x>'],
      },
    ],
  },
  {
    id: 'b04-dd-g2', type: 'num', kind: 'numerical',
    prompt: `Ana’s most expensive conference charged ${usd(CONF_MAX)} per guest-day. Her 13 conferences averaged $10.32 per guest-day with a standard deviation of $1.67. What is its z-score within the conferences? Give two decimal places.`,
    answer: Number(((CONF_MAX - 10.32) / 1.67).toFixed(2)), check: () => (CONF_MAX - mean(CONF)) / sdS(CONF), unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: Number((CONF_MAX - 10.32).toFixed(2)), say: 'That is the distance in dollars. A z-score divides it by the standard deviation to give the distance in standard deviations.' },
      { value: Number(((10.32 - CONF_MAX) / 1.67).toFixed(2)), say: 'The sign is reversed: z = (value − mean) ÷ SD, which is positive for a value above the mean.' },
      { value: Number(((CONF_MAX - 10.32) / 1.67 ** 2).toFixed(2)), say: 'You divided by the variance (1.67²). Divide by the standard deviation itself.' },
    ],
    hints: ['z = (value − mean) ÷ standard deviation.', `(${CONF_MAX} − 10.32) ÷ 1.67.`],
    solution: `z = (${CONF_MAX} − 10.32) ÷ 1.67 = ${(CONF_MAX - 10.32).toFixed(2)} ÷ 1.67 ≈ ${((CONF_MAX - 10.32) / 1.67).toFixed(2)}. The conference lies about two standard deviations above the average conference: high, but much less unusual within its type than the $17.14 meeting (z ≈ 3.49). In Excel, <x>=STANDARDIZE(${CONF_MAX},10.32,1.67)</x>.`,
  },
  {
    id: 'b04-dd-g3', type: 'classify', kind: 'conceptual',
    prompt: 'Ana records catering set-up times in minutes. She converts every time to hours by dividing it by 60. What happens to each statistic?',
    items: ['The mean', 'The median', 'The standard deviation', 'The interquartile range', 'The variance', 'Each event’s z-score', 'The skewness (SKEW)', 'The coefficient of variation'],
    categories: ['Divided by 60', 'Divided by 3,600', 'Unchanged'],
    answer: [0, 0, 0, 0, 1, 2, 2, 2],
    feedback: {
      4: 'The variance is in squared units, so it scales by b² = (1/60)² = 1/3,600.',
      5: 'Both the distance from the mean and the standard deviation are divided by 60, so their ratio, z, is unchanged.',
      7: 'The standard deviation and the mean are both divided by 60, so their ratio stays the same.',
    },
    hints: ['Multiplying every value by b multiplies the centre and the spread by b.', 'Squared units scale by b²; ratios of two things that both scale by b don’t change.'],
    solution: 'With y = x ÷ 60 (b = 1/60, a = 0): the mean, median, SD and IQR are divided by 60; the variance by 60² = 3,600; z-scores, skewness and the CV are ratios or standardised measures, so they don’t change.',
  },
  {
    id: 'b04-dd-g4', type: 'mc', kind: 'applied',
    prompt: 'A bike-hire firm (fictional) records 600 hire lengths: mean 48 minutes, standard deviation 30 minutes, with a long right tail of all-day hires. What can it say for certain about the share of hires that lasted less than 108 minutes, the mean plus two standard deviations?',
    options: [
      'At least 75% of hires, by Chebyshev’s inequality, whatever the shape.',
      'About 95% of hires, by the empirical rule for two standard deviations.',
      'About 97.5%, because only the upper tail beyond two SDs is excluded.',
      'Nothing at all, because no rule applies to a skewed distribution.',
    ],
    answer: 0,
    feedback: {
      1: 'The empirical rule needs bell-shaped data, and these hires have a long right tail.',
      2: 'That splits the normal distribution’s 5% into two tails, which again assumes a bell shape.',
      3: 'Chebyshev’s inequality holds for any distribution: at least 75% lie within two SDs of the mean.',
    },
    hints: ['Which rule needs a bell shape, and which needs nothing?', 'No hire is shorter than 0 minutes, so the mean − 2 SD side (−12 minutes) excludes nothing.'],
    solution: 'The interval mean ± 2 SD runs from −12 to 108 minutes; since no hire is shorter than 0, “within two SDs” means “less than 108 minutes”. For skewed data only Chebyshev’s inequality is guaranteed: at least 1 − 1/2² = 75% of hires. The real share may well be higher, but the empirical rule’s 95% can’t be assumed.',
  },
];

// ---------------------------------------------------------------- on your own
export const independent = [
  {
    id: 'b04-dd-i1', type: 'formula', kind: 'numerical',
    prompt: 'Ana’s 11 team days are in A2:B12. In C2, calculate the z-score of the first team day’s invoice per guest-day within the 11 team days, with STANDARDIZE, so that the formula can be filled down to C12.',
    sheet: typeSheet('Team day', { C1: 'z-score' }),
    cell: 'C2', fill: 'C2:C12', answer: '=STANDARDIZE(B2,AVERAGE($B$2:$B$12),STDEV.S($B$2:$B$12))',
    require: ['STANDARDIZE'],
    alt: ['=STANDARDIZE(B2,AVERAGE(B$2:B$12),STDEV.S(B$2:B$12))'],
    view: 'A1:C12', formats: { B: '$#,##0.00', C: '0.00' },
    wrong: [
      { formula: '=STANDARDIZE(B2,AVERAGE(B2:B12),STDEV.S(B2:B12))', say: 'Without <code>$</code> the ranges slide down as you fill, so lower rows compare each value with fewer and fewer team days. Lock them: <code>$B$2:$B$12</code>.' },
      { formula: '=STANDARDIZE(B2,AVERAGE($B$2:$B$12),STDEV.P($B$2:$B$12))', say: 'STDEV.P divides by n. The 11 team days are a sample of Ana’s team-day catering: use STDEV.S.' },
      { formula: '=STANDARDIZE(AVERAGE($B$2:$B$12),B2,STDEV.S($B$2:$B$12))', say: 'The arguments are STANDARDIZE(x, mean, standard_dev): the value comes first, so your signs are reversed.' },
    ],
    solution: `<x>=STANDARDIZE(B2,AVERAGE($B$2:$B$12),STDEV.S($B$2:$B$12))</x>, filled down. The z-scores run from −${Math.abs((Math.min(...TDY) - mean(TDY)) / sdS(TDY)).toFixed(2)} to ${((Math.max(...TDY) - mean(TDY)) / sdS(TDY)).toFixed(2)} (EV-023, the 36-guest team day at $16.11). The same values come from <x>=(B2-AVERAGE($B$2:$B$12))/STDEV.S($B$2:$B$12)</x>; the exercise asks for STANDARDIZE.`,
  },
  {
    id: 'b04-dd-i2', type: 'formula', kind: 'numerical',
    prompt: 'The 28 meetings are in A2:B29, and E2 holds the invoice per guest-day of one of them. In F2, calculate the fraction Excel’s PERCENTRANK.INC would return for it (this worksheet doesn’t have that function): the number of meetings below E2 divided by n − 1.',
    sheet: { ...typeSheet('Meeting', { D2: 'Value', E2: LOCATE, F1: 'Rank (fraction)' }), vary: { E2: [8.13, 9.46, 11.36] } },
    cell: 'F2', answer: '=COUNTIF(B2:B29,"<"&E2)/(COUNT(B2:B29)-1)',
    alt: ['=COUNTIF($B$2:$B$29,"<"&$E$2)/(COUNT($B$2:$B$29)-1)', '=COUNTIFS(B2:B29,"<"&E2)/(COUNTA(B2:B29)-1)'],
    view: 'A1:F29', maxHeight: '20rem', formats: { B: '$#,##0.00', E: '$#,##0.00', F: '0.000' }, widths: { F: 15 },
    wrong: [
      { formula: '=COUNTIF(B2:B29,"<"&E2)/COUNT(B2:B29)', say: 'PERCENTRANK.INC divides by n − 1, the number of other values, not by n. Use (COUNT(B2:B29)-1).' },
      { formula: '=COUNTIF(B2:B29,"<="&E2)/(COUNT(B2:B29)-1)', say: '"<=" counts the meeting itself (and any equal to it). The rank counts only the values below: "<"&E2.' },
      { formula: '=COUNTIF(B2:B29,"<E2")/(COUNT(B2:B29)-1)', say: 'Inside the quotes, E2 is just text, so Excel compares the numbers with the letters “E2” and counts none. Join the operator to the cell: "<"&E2.' },
    ],
    solution: `<x>=COUNTIF(B2:B29,"<"&E2)/(COUNT(B2:B29)-1)</x>. For ${usd(LOCATE)}, ${M.filter((v) => v < LOCATE).length} of the 28 meetings are lower, so the rank is ${M.filter((v) => v < LOCATE).length} ÷ 27 ≈ ${(M.filter((v) => v < LOCATE).length / 27).toFixed(3)}: about ${Math.round(M.filter((v) => v < LOCATE).length / 27 * 100)}% of the other meetings charged less per guest-day. In Excel, <x>=PERCENTRANK.INC(B2:B29,E2)</x> gives ${(Math.floor(M.filter((v) => v < LOCATE).length / 27 * 1000) / 1000).toFixed(3)}, truncated to three digits.`,
  },
  {
    id: 'b04-dd-i3', type: 'num', kind: 'numerical',
    prompt: 'Whatever the shape of a distribution, at least what percentage of its values lie within 2.5 standard deviations of the mean? Give a whole number.',
    answer: 84, check: () => (1 - 1 / 2.5 ** 2) * 100, unit: '%', places: 0, tol: 0.5,
    wrong: [
      { value: 99, say: 'About 98.8% is the share for a normal distribution. “Whatever the shape” calls for Chebyshev’s inequality, which is weaker.' },
      { value: 60, say: 'You used 1 − 1/k. Chebyshev’s inequality squares k: 1 − 1/2.5².' },
      { value: 16, say: 'That is 1/k², the most that can lie outside 2.5 SDs. The share within is 1 − 1/k².' },
    ],
    solution: 'Chebyshev’s inequality: at least 1 − 1/k² = 1 − 1/6.25 = 0.84, so at least 84% of the values lie within 2.5 standard deviations of the mean, for any data set.',
  },
  {
    id: 'b04-dd-i4', type: 'mc', kind: 'applied',
    prompt: `Ana writes one line on meetings in her 2027 price note. The 28 meetings’ invoice per guest-day has mean ${usd(mean(M))}, SD ${usd(sdS(M))}, median ${usd(9.215)} and IQR from $8.14 to $10.04; one 35-guest meeting charged $17.14. Which pair should the line use?`,
    options: [
      'The median and the IQR, because one small, costly meeting pulls up the mean and SD.',
      'The mean and the standard deviation, because they make use of every meeting’s invoice.',
      'The mode and the range, because they show the most common price and both extremes.',
      'The mean and the CV, because dividing by the mean removes the effect of the outlier.',
    ],
    answer: 0,
    feedback: {
      1: 'Using every value is exactly why one extreme meeting moves them: the SD of $2.15 is inflated by one event.',
      2: 'Per-guest invoices hardly repeat, so the mode means little, and the range is set by the single $17.14 meeting.',
      3: 'The CV uses the mean and SD, so the outlier inflates it too.',
    },
    solution: 'The meetings are right-skewed, with one small event far above the rest. The median ($9.22) and the middle half ($8.14 to $10.04) describe a typical meeting and barely move if that event is left out; the mean and SD would both change noticeably. Ana can mention the small-event effect separately.',
  },
  {
    id: 'b04-dd-i5', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the true statements about dividing the sum of squares by n − 1 in a sample variance.',
    options: [
      'Deviations from a sample’s own mean are smaller, on average, than deviations from the population mean.',
      'Averaged over all possible samples, the sum of squares divided by n − 1 equals the population variance.',
      'Only n − 1 deviations from the sample mean are free to vary, because all n of them must add to 0.',
      'Dividing by n − 1 instead of n makes the standard deviation resistant to outliers such as the office order.',
      'The correction matters most for large samples, where more squared deviations are added together.',
      'STDEV.P divides by n − 1, because a population always has one more value than a sample drawn from it.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Changing the divisor scales the variance by the same factor whatever the data; it does nothing about one extreme value.',
      4: 'The ratio (n − 1)/n is close to 1 for large n, so the correction matters most for small samples.',
      5: 'STDEV.P divides by n, for data that are the whole population; STDEV.S divides by n − 1.',
    },
    solution: 'True: a sample’s deviations are measured from its own mean, which sits in its middle, so they are smaller on average; dividing by n − 1 makes the variance right on average (unbiased); and n − 1 is the degrees of freedom, because the deviations must add to 0. Dividing by n − 1 doesn’t make anything robust, matters least for large samples, and is what STDEV.S (not STDEV.P) does.',
  },
  {
    id: 'b04-dd-i6', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the notation.',
    text: 'Ana treats her 231 spring orders as the whole population of spring 2026, so their mean, $39.38, is [[0]] and their STDEV.P is [[1]]. The 40 bags she weighed are a sample of Kilnworth’s output: their mean, 1,002.75 g, is [[2]], their STDEV.S is [[3]] and the number of bags is [[4]].',
    blanks: [
      { options: ['μ', 'σ', 'x̄', 's', 'n', 'N'], answer: 0 },
      { options: ['μ', 'σ', 'x̄', 's', 'n', 'N'], answer: 1 },
      { options: ['μ', 'σ', 'x̄', 's', 'n', 'N'], answer: 2 },
      { options: ['μ', 'σ', 'x̄', 's', 'n', 'N'], answer: 3 },
      { options: ['μ', 'σ', 'x̄', 's', 'n', 'N'], answer: 4 },
    ],
    solution: 'Population summaries are parameters with Greek letters: the mean μ and the standard deviation σ (STDEV.P), with N values. Sample summaries are statistics with Latin letters: the mean x̄, the standard deviation s (STDEV.S) and the size n = 40.',
  },
];

// ---------------------------------------------------------------- knowledge check
export const check = [
  {
    id: 'b04-dd-k1', type: 'mc', kind: 'conceptual',
    prompt: `Excel’s KURT returns ${D.orders.kurtosis.toFixed(1)} for Lantern’s 231 spring order values. What does that tell Ana?`,
    options: [
      'At least one order lies extremely far from the others: the tails are extreme.',
      'Most orders cluster in a very sharp, narrow peak close to the median order value.',
      'The orders are about 200 times more spread out than a normal distribution would be.',
      'The orders have a long tail to the left, with a few orders far below the mean.',
    ],
    answer: 0,
    feedback: {
      1: 'Microsoft’s page speaks of peakedness, but kurtosis is driven by the tails (Westfall, 2014): here, by the $1,512 office order.',
      2: 'KURT is scaled by the standard deviation, so it says nothing about the size of the spread.',
      3: 'Direction is skewness’s job, and SKEW is +13.66: the long tail is on the right.',
    },
    solution: 'KURT is excess kurtosis, about 0 for normal data. Fourth powers of z-scores make it extremely sensitive to values far from the mean, so 199.5 says the data contain at least one extreme value, LC-10144, 14.6 standard deviations above the mean. It is not a measure of the peak.',
  },
  {
    id: 'b04-dd-k2', type: 'formula', kind: 'numerical',
    prompt: 'Crowfoot Bakery (fictional) recorded its takings on 20 Saturdays in B2:B21. In D2, calculate the mean of the takings after leaving out the highest 10% and the lowest 10% of the Saturdays.',
    sheet: { cells: { A1: 'Saturday', B1: 'Takings', D1: 'Trimmed mean', ...col('A', 2, TAKINGS.map((_, i) => i + 1)), ...col('B', 2, TAKINGS) } },
    cell: 'D2', answer: '=TRIMMEAN(B2:B21,0.2)',
    alt: ['=(SUM(B2:B21)-LARGE(B2:B21,1)-LARGE(B2:B21,2)-SMALL(B2:B21,1)-SMALL(B2:B21,2))/16', '=TRIMMEAN(B2:B21,20%)'],
    view: 'A1:D21', formats: { B: '$#,##0', D: '$#,##0.00' }, widths: { D: 14 },
    wrong: [
      { formula: '=TRIMMEAN(B2:B21,0.1)', say: 'TRIMMEAN’s percent is the share left out in total, split between the two ends. 0.1 leaves out one Saturday at each end (5% each); for 10% at each end use 0.2.' },
      { formula: '=AVERAGE(B2:B21)', say: 'That is the ordinary mean of all 20 Saturdays, including the busiest and quietest. TRIMMEAN leaves out a share at each end.' },
      { formula: '=TRIMMEAN(B2:B21,10)', say: 'Percent is a fraction between 0 and 1; with 10 Excel returns #NUM!. Use 0.2 for 10% at each end.' },
    ],
    allowErrors: [],
    solution: `<x>=TRIMMEAN(B2:B21,0.2)</x>: 20 × 0.2 = 4 Saturdays are left out, two at each end ($760 and $980 at the bottom, $1,580 and $2,650 at the top), and the other 16 average ${usd(trimmean(TAKINGS, 0.2))}. The ordinary mean is ${usd(mean(TAKINGS))}, raised by one $2,650 Saturday.`,
  },
  {
    id: 'b04-dd-k3', type: 'num', kind: 'numerical',
    prompt: `For 2027 Ana sets every launch price at 1.08 times this year’s invoice per guest-day plus a $0.50 surcharge. This year’s launches had a standard deviation of ${usd(sdS(L))} per guest-day. If the same events were invoiced at the new prices, what would the standard deviation be? Give dollars to the cent.`,
    answer: Number((1.08 * sdS(L)).toFixed(2)), check: () => 1.08 * sdS(L), unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: Number((1.08 * sdS(L) + 0.5).toFixed(2)), say: 'Adding a constant shifts every value, and the mean, by the same amount: the spread doesn’t change. Only the multiplier affects the SD.' },
      { value: Number(sdS(L).toFixed(2)), say: 'Multiplying every value by 1.08 stretches the distances between them, so the SD is multiplied by 1.08 too.' },
      { value: Number((1.08 ** 2 * sdS(L)).toFixed(2)), say: 'Squaring the multiplier is right for the variance, not for the standard deviation: s_y = |b| s_x.' },
    ],
    solution: `With y = 0.50 + 1.08x, the SD becomes |1.08| × ${usd(sdS(L))} ≈ ${usd(1.08 * sdS(L))}. The $0.50 moves every invoice, and the mean, up by the same amount, so it doesn’t change the spread. The mean becomes 0.50 + 1.08 × $9.00 = $10.22.`,
  },
  {
    id: 'b04-dd-k4', type: 'num', kind: 'applied',
    prompt: 'Whatever the shape of the data, at most how many of Lantern’s 231 spring orders can lie 5 or more standard deviations from their mean? Give a whole number of orders.',
    answer: 9, check: () => Math.floor(231 / 5 ** 2), unit: 'orders', places: 0, tol: 0.5,
    wrong: [
      { value: 46, say: 'You used 1/k. Chebyshev’s bound is 1/k² = 1/25 of the values.' },
      { value: 0, say: 'For normal data almost none would lie that far out, but the orders are skewed. Chebyshev’s bound holds for any shape: 1/k² of the values.' },
      { value: 222, say: 'That is roughly the share that must lie within 5 SDs. The question asks how many can lie outside: at most 231 ÷ 25.' },
    ],
    solution: 'By Chebyshev’s inequality at most 1/k² of the values lie k or more standard deviations from the mean. With k = 5 that is 1/25 of 231 = 9.24, so at most 9 orders. In fact only one, the $1,512 office order (z ≈ 14.6), lies that far out.',
  },
  {
    id: 'b04-dd-k5', type: 'classify', kind: 'conceptual',
    prompt: 'For each Lantern variable, choose the summary of centre that describes it best.',
    items: ['The channel of each order (web or app)', 'Customers’ star ratings, from 1 to 5', 'Order values, with a long right tail', 'The weights of Kilnworth’s 1 kg bags, roughly symmetric', 'The region each order was sent to', 'Meetings’ invoice per guest-day, with one extreme small event'],
    categories: ['Mode and proportions', 'Median', 'Mean'],
    answer: [0, 1, 1, 2, 0, 1],
    feedback: {
      1: 'Ratings are ordinal: the median uses their order without assuming equal steps between stars.',
      3: 'For symmetric data without outliers the mean and median agree, and the mean uses all the information.',
      5: 'One small, expensive meeting pulls the mean up; the median resists it.',
    },
    solution: 'Nominal categories (channel, region): counts, proportions and the mode. Ordinal ratings: the median. Skewed numbers or numbers with an extreme value (order values, meetings): the median, with the mean reported beside it when totals matter. Roughly symmetric measurements (bag weights): the mean.',
  },
  {
    id: 'b04-dd-k6', type: 'mc', kind: 'applied',
    prompt: 'Ana’s assistant writes: “99.6% of spring orders lie within two standard deviations of the mean, so the orders follow the empirical rule closely.” What is the best reply?',
    options: [
      'It is far above 95% because one order inflates the SD; the data are skewed, so only Chebyshev applies.',
      'Agreed: 99.6% is close enough to 95% to treat the order values as bell-shaped for the rest of the review.',
      'The figure must be wrong, because Chebyshev’s inequality caps the share within two SDs at 75% of the data.',
      'The empirical rule only applies to samples, and the 231 orders here are a population, so it can’t be used.',
    ],
    answer: 0,
    feedback: {
      1: 'Being above 95% is not a sign of a bell shape: the office order’s deviation inflates the SD, so nearly everything is within two of them. Without it, only 91.7% are.',
      2: 'Chebyshev gives a minimum (at least 75%), not a maximum.',
      3: 'The empirical rule is about shape, not about samples and populations.',
    },
    solution: 'The orders are strongly right-skewed (SKEW 13.66). One order inflates the SD to $100.90, so 99.6% lie within two SDs; without it, 91.7% do. The empirical rule fails in both directions. Chebyshev’s minimum of 75% is all that can be relied on.',
  },
];
