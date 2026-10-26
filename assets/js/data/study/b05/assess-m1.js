// assess-m1.js — B05 module 1 test: Seeing relationships (scatterplots, covariance-and-pearson). New questions, not
// copies of lesson exercises. No hints; solutions are shown when the student reviews the test. Café figures come from
// case.js; Ravensworth Garden Centre, Cobble Lane Bakery, Wayfarer Couriers, Stonebridge Cinema, Kingfisher Airways,
// Thornbury Dairy and Marlow Gym are fictional. Formula items are marked by their results (core/sheet.js
// gradeFormula); every num item's `check` recomputes its answer.
import { CLEAN_ROWS, CAFE_COLUMNS } from './case.js?v=20';
import * as C from '../../../core/correlation.js?v=20';

const at = (n) => CAFE_COLUMNS.indexOf(n);
const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const sg = (v, d = 2) => `${v < 0 ? '−' : ''}${fx(Math.abs(v), d)}`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayLabel = (iso) => `${Number(iso.slice(8))} ${MON[Number(iso.slice(5, 7)) - 1]}`;
const round = (x, d) => Math.round(x * 10 ** d) / 10 ** d;

// Cobble Lane Bakery: loaves baked and loaves sold on 12 days; day 7's sales were typed with an extra zero
const BAKED = [140, 120, 160, 150, 130, 180, 145, 125, 170, 155, 135, 165];
const SOLD = [131, 112, 149, 143, 118, 171, 1360, 117, 158, 146, 129, 154];
const BAKE_DAYS = ['Mon 4', 'Tue 5', 'Wed 6', 'Thu 7', 'Fri 8', 'Sat 9', 'Mon 11', 'Tue 12', 'Wed 13', 'Thu 14', 'Fri 15', 'Sat 16'];
// Harbourside, 1–20 October: the day’s high and hot drinks
const OCT = CLEAN_ROWS.filter((r) => r[at('cafe')] === 'Harbourside' && r[at('date')] >= '2027-10-01' && r[at('date')] <= '2027-10-20');
const nx = OCT.map((r) => r[at('high_f')]), ny = OCT.map((r) => r[at('hot_drinks')]);
const novSheet = { cells: { A1: 'Date', B1: 'High (°F)', C1: 'Hot drinks', ...col('A', 2, OCT.map((r) => dayLabel(r[at('date')]))), ...col('B', 2, nx), ...col('C', 2, ny), E1: 'r' } };
// Kingfisher Airways: route length (km) and fare ($)
const KA = { cov: 23040, sx: 450, sy: 64 };
// Thornbury Dairy: litres of milk delivered and revenue ($)
const TD = { cov: 840 };
// Marlow Gym: sum of products of z-scores over 21 days
const MG = { n: 21, sum: 12.4 };

export const items = [
  // ---------------------------------------------------------------- scatterplots
  {
    id: 'b05-m1-1', lesson: 'scatterplots', type: 'mc', kind: 'conceptual',
    prompt: 'Ravensworth Garden Centre (fictional) wants to see whether sunnier weeks sell more bags of compost. It has each week’s hours of sunshine and bags sold. How should it draw the scatterplot, and what happens to r if it draws it the other way round?',
    options: [
      'Sunshine on x and bags on y; r is the same either way.',
      'Bags on x and sunshine on y, since sales are what the centre controls; r is the same either way.',
      'Sunshine on x and bags on y; with the axes swapped r would change sign.',
      'Either way, but r must be calculated with sunshine first or CORREL returns the wrong value.',
    ],
    answer: 0,
    feedback: {
      1: 'Sunshine is known first and is the candidate explanation, so it goes on x. The centre doesn’t control the weather or, directly, its sales.',
      2: 'Swapping axes never changes r, not even its sign: correlation is symmetric.',
      3: 'CORREL gives the same r whichever range comes first.',
    },
    solution: 'The explanatory variable (sunshine, known first) goes on x and the response (bags sold) on y. Pearson’s r is symmetric: r(x, y) = r(y, x), so the layout changes how the plot reads, never r.',
  },
  {
    id: 'b05-m1-2', lesson: 'scatterplots', type: 'rows', kind: 'applied',
    prompt: 'Cobble Lane Bakery (fictional) records loaves baked and loaves sold each day. Select the day whose point would break the pattern of a scatterplot of sold (y) against baked (x).',
    data: { table: { head: ['Day', 'Baked', 'Sold'], rows: BAKED.map((b, i) => [BAKE_DAYS[i], String(b), String(SOLD[i])]), align: ['l', 'r', 'r'], index: { col: 0 } } },
    answer: [6],
    solution: `Mon 11: 1,360 loaves sold from 145 baked, which is impossible; an extra digit, most likely for 136. Every other day sells a little under what was baked and lies on one straight band. With the slip r = ${fx(C.pearson(BAKED, SOLD).r, 2)}; with 136 in its place r = ${fx(C.pearson(BAKED, SOLD.map((v, i) => (i === 6 ? 136 : v))).r, 3)}. Check the till record before correcting it.`,
  },
  {
    id: 'b05-m1-3', lesson: 'scatterplots', type: 'multi', kind: 'applied',
    prompt: 'Wayfarer Couriers (fictional) plots fuel used (litres, to 0.1) against distance (recorded in whole miles) for 2,000 van trips. Most trips are 5 to 40 miles, so the points form dense vertical stripes. The fleet has electric and diesel vans. Select all the steps that make the plot honest and readable.',
    options: [
      'Nudge each point left or right by up to 0.3 miles when drawing it.',
      'Draw the markers partly transparent.',
      'Plot the electric and the diesel vans on separate panels with the same axes.',
      'Calculate r from the nudged distances so it matches the picture.',
      'Round fuel to whole litres so the points line up in a neat grid.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Jitter is for drawing only; every statistic uses the recorded distances.',
      4: 'Rounding makes more points coincide, so the overplotting gets worse.',
    },
    solution: 'Jitter by less than half the step (here under 0.5 miles), transparency and one panel per vehicle type all reveal how many trips lie where without changing the data. Statistics come from the recorded values, and rounding only adds overplotting.',
  },
  {
    id: 'b05-m1-4', lesson: 'scatterplots', type: 'mc', kind: 'applied',
    prompt: 'Stonebridge Cinema (fictional) finds r = 0.85 between its weekly ticket sales and the size of its email list over two years. Both have grown steadily since it reopened. What should its analyst look at before saying anything about the list?',
    options: [
      'The scatterplot coloured by date, or each series against time.',
      'Spearman’s ρ, in case the relationship is curved rather than linear.',
      'A larger sample of weeks, so that r = 0.85 is more precise.',
      'r², because 0.85 overstates how much of the variance the list accounts for.',
    ],
    answer: 0,
    feedback: {
      1: 'A curve isn’t the main worry: two series that both grow over time can correlate strongly without any link.',
      2: 'More weeks of two trending series would give the same misleading picture with more confidence.',
      3: 'r² = 0.72 describes the same pattern; the question is whether the pattern is just two trends.',
    },
    solution: 'A scatterplot hides time order. When both variables trend with the calendar, colour the points by date or plot each against time: the correlation may be nothing more than two trends, as with Harbourside’s loyalty members and temperature. The correlation-and-causation lesson returns to such common trends.',
  },
  {
    id: 'b05-m1-5', lesson: 'scatterplots', type: 'classify', kind: 'conceptual',
    prompt: 'Each description is of a scatterplot whose correlation is 0.80. Say whether r = 0.80 is a fair summary of the relationship.',
    items: [
      'A straight, evenly scattered band rising from lower left to upper right.',
      'A smooth arch: the points rise, peak and fall again.',
      'Points stacked in one vertical column, with one point far off to the right.',
      'Two separate parallel bands, one for each of two shops.',
      'A slightly looser straight band, with no point far from the rest.',
    ],
    categories: ['Fair summary', 'Misleading'],
    answer: [0, 1, 1, 1, 0],
    feedback: {
      1: 'An arch is a strong curved relationship; r measures only the straight-line part (Anscombe’s set 2).',
      2: 'All the variation in x comes from one point; that point creates the correlation (Anscombe’s set 4).',
      3: 'Two bands mean two groups; report each shop’s own relationship.',
    },
    solution: 'r is a fair summary only of a roughly straight band with no points that break it. Curves, a single influential point and clusters all give numbers that describe the plot badly, as Anscombe’s quartet shows.',
  },
  // ---------------------------------------------------------------- covariance-and-pearson
  {
    id: 'b05-m1-6', lesson: 'covariance-and-pearson', type: 'formula', kind: 'numerical',
    prompt: 'Harbourside’s day’s high (B2:B21) and hot drinks made (C2:C21), 1–20 October. In F1, calculate r from the population covariance, COVARIANCE.P, and the matching standard deviations.',
    sheet: novSheet, cell: 'F1', answer: '=COVARIANCE.P(B2:B21,C2:C21)/(STDEV.P(B2:B21)*STDEV.P(C2:C21))',
    alt: ['=COVARIANCE.P(B2:B21,C2:C21)/STDEV.P(B2:B21)/STDEV.P(C2:C21)', '=COVARIANCE.P(C2:C21,B2:B21)/(STDEV.P(B2:B21)*STDEV.P(C2:C21))'],
    require: ['COVARIANCE.P'],
    view: 'A1:F21', maxHeight: '20rem', formats: { F1: '0.0000' }, widths: { A: 9 },
    wrong: [
      { formula: '=COVARIANCE.P(B2:B21,C2:C21)/(STDEV.S(B2:B21)*STDEV.S(C2:C21))', say: 'COVARIANCE.P divides by n; STDEV.S by n − 1. Mixed, they give r × 19 ÷ 20. Pair the population covariance with STDEV.P.' },
      { formula: '=COVARIANCE.P(B2:B21,C2:C21)', say: 'That is the covariance, in °F × drinks. Divide it by both standard deviations.' },
    ],
    solution: `<x>=COVARIANCE.P(B2:B21,C2:C21)/(STDEV.P(B2:B21)*STDEV.P(C2:C21))</x> = ${sg(C.pearson(nx, ny).r, 4)}, the same as CORREL: dividing by n in all three places cancels just as n − 1 does. Over these 20 days warmer October days went with fewer hot drinks.`,
  },
  {
    id: 'b05-m1-7', lesson: 'covariance-and-pearson', type: 'num', kind: 'numerical',
    prompt: `Kingfisher Airways (fictional) compares route length with the average fare on its routes. The covariance is ${KA.cov.toLocaleString('en-US')} km-dollars, the standard deviation of route length is ${KA.sx} km and of fares $${KA.sy}. Calculate r, to two decimal places.`,
    answer: round(KA.cov / (KA.sx * KA.sy), 2), check: () => KA.cov / (KA.sx * KA.sy), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: round((KA.cov / (KA.sx * KA.sy)) ** 2, 2), say: 'That is r². r itself is the covariance divided by the product of the standard deviations.' },
      { value: round(KA.cov / KA.sx ** 2, 2), say: 'Dividing by the variance of x gives the slope of a regression line, not r. Divide by s_x × s_y.' },
    ],
    solution: `r = ${KA.cov.toLocaleString('en-US')} ÷ (${KA.sx} × ${KA.sy}) = ${KA.cov.toLocaleString('en-US')} ÷ ${(KA.sx * KA.sy).toLocaleString('en-US')} = ${fx(KA.cov / (KA.sx * KA.sy), 2)}. Longer routes tend to have higher fares; a line in route length accounts for ${Math.round((KA.cov / (KA.sx * KA.sy)) ** 2 * 100)}% of the variance in fares.`,
  },
  {
    id: 'b05-m1-8', lesson: 'covariance-and-pearson', type: 'num', kind: 'numerical',
    prompt: `Thornbury Dairy (fictional) finds a covariance of ${TD.cov} litre-dollars between the milk delivered to a shop each week (litres) and the shop’s payment ($). Its new system records milk in millilitres. What is the covariance in millilitre-dollars?`,
    answer: TD.cov * 1000, check: () => TD.cov * 1000, unit: 'ml-dollars', places: 0, tol: 0.5,
    wrong: [
      { value: TD.cov, say: 'r is unchanged by a change of units, but the covariance carries the units: every litre deviation becomes 1,000 times larger in millilitres.' },
      { value: TD.cov / 1000, say: 'There are 1,000 millilitres in a litre, so the numbers, and their deviations, get larger, not smaller.' },
      { value: TD.cov * 1000 * 1000, say: 'Only one variable changes units, so the covariance is multiplied by 1,000 once.' },
    ],
    solution: `Every quantity in millilitres is 1,000 times its value in litres, so every deviation is too, and the covariance becomes ${TD.cov} × 1,000 = ${(TD.cov * 1000).toLocaleString('en-US')} ml-dollars. The standard deviation of the milk is also multiplied by 1,000, so r doesn’t change.`,
  },
  {
    id: 'b05-m1-9', lesson: 'covariance-and-pearson', type: 'mc', kind: 'conceptual',
    prompt: 'In a scatterplot with lines drawn through the two means, most points lie in the upper-left and lower-right quarters. What is the sign of the covariance?',
    options: ['Positive', 'Negative', 'Zero', 'It depends on the units'],
    answer: 1,
    feedback: {
      0: 'Upper-left points have x below its mean and y above: (−)(+). Lower-right: (+)(−). Both products are negative.',
      2: 'The covariance is near zero only when positive and negative products balance; here negative ones dominate.',
      3: 'Units change the covariance’s size, never its sign (unless a unit runs backwards).',
    },
    solution: 'Points upper left and lower right have one value above its mean and the other below, so each product of deviations is negative. When those points dominate, the sum, and the covariance, is negative: high values of one variable go with low values of the other.',
  },
  {
    id: 'b05-m1-10', lesson: 'covariance-and-pearson', type: 'num', kind: 'numerical',
    prompt: `Marlow Gym (fictional) standardised its daily class bookings and its smoothie sales over ${MG.n} days. The products of the paired z-scores add up to ${MG.sum}. What is Pearson’s r?`,
    answer: round(MG.sum / (MG.n - 1), 2), check: () => MG.sum / (MG.n - 1), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: round(MG.sum / MG.n, 3), say: 'With z-scores built from sample standard deviations, divide by n − 1 = 20, not by n.' },
      { value: MG.sum, say: 'That is the sum of products. r is their average, dividing by n − 1.' },
    ],
    solution: `r = Σ z_x z_y ÷ (n − 1) = ${MG.sum} ÷ ${MG.n - 1} = ${fx(MG.sum / (MG.n - 1), 2)}.`,
  },
  {
    id: 'b05-m1-11', lesson: 'covariance-and-pearson', type: 'mc', kind: 'applied',
    prompt: 'A fitness chain reports: “Members’ weekly visits and their monthly spend at the juice bar have r = 0.6, so visits explain 60% of juice-bar spending.” How should the sentence be corrected?',
    options: [
      'A line in visits accounts for about 36% of the variance in spend.',
      'Visits explain 60% of the variance in juice-bar spend.',
      'Visits cause 36% of what members spend at the juice bar.',
      'Visits explain 60% of spending, but only for members who visit weekly.',
    ],
    answer: 0,
    feedback: {
      1: 'r = 0.6 is not a share of anything. The share of variance is r² = 0.36.',
      2: 'r² is a share of variance in common, not a share of spending caused by visits.',
      3: 'The problem is reading r as a percentage, not who it applies to.',
    },
    solution: 'The share of variance is r², 0.6² = 0.36. And “accounts for … of the variance” is the safe wording: r² says how much variance the two share, not what causes spending, and it is not a share of the spending itself.',
  },
];
