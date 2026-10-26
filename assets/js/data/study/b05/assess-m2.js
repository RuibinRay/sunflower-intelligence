// assess-m2.js — B05 module 2 test: Measuring and testing (rank-correlation, testing-correlation). New questions on new
// scenarios, not copies of lesson exercises. No hints; solutions are shown when the student reviews the test. Café data
// come from case.js (the corrected log); every other business, person and number is fictional. Formula items are
// marked by their results (core/sheet.js gradeFormula); every num item's `check` recomputes its answer.
import { CLEAN_ROWS, CAFE_COLUMNS } from './case.js?v=20';
import * as C from '../../../core/correlation.js?v=20';
import * as I from '../../../core/inference.js?v=20';

const at = (n) => CAFE_COLUMNS.indexOf(n);
const fx = (v, d = 3) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(d);
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const short = (iso) => `${Number(iso.slice(8))} Dec`;

// Millbrook, 1–16 December 2027: transactions and sales (corrected log)
const DEC = CLEAN_ROWS.filter((r) => r[at('cafe')] === 'Millbrook' && r[at('date')] >= '2027-12-01' && r[at('date')] <= '2027-12-16');
const dT = DEC.map((r) => r[at('transactions')]), dS = DEC.map((r) => r[at('sales')]);
const decSheet = {
  cells: {
    A1: 'Date', B1: 'Transactions', C1: 'Sales ($)', D1: 'Rank of transactions', E1: 'Rank of sales',
    ...col('A', 2, DEC.map((r) => short(r[at('date')]))), ...col('B', 2, dT), ...col('C', 2, dS),
    ...col('D', 2, DEC.map((_, i) => `=RANK.AVG(B${i + 2},$B$2:$B$17)`)),
  },
};
const decRho = C.spearman(dT, dS).rho;
// Kestrel Gyms (fictional): six branches, ties on each variable
const GX = [1, 2, 2, 3, 4, 5], GY = [2, 1, 3, 3, 6, 5];
const GK = C.kendall(GX, GY);
// test items
const tOf = (r, n) => (r * Math.sqrt(n - 2)) / Math.sqrt(1 - r * r);
const p2 = (r, n) => 2 * (1 - I.tCdf(Math.abs(tOf(r, n)), n - 2));
const critSheet = { cells: { A1: 'Pairs n', B1: 24, A2: 'α (two-sided)', B2: 0.05, A4: 'Critical |r|' }, vary: { B1: [12, 40, 75], B2: [0.01, 0.1] } };
const CMP = C.compareIndependent(0.52, 60, 0.21, 75);
const CI10 = C.fisherCI(0.62, 10);

export const items = [
  // ---------------------------------------------------------------- rank-correlation
  {
    id: 'b05-m2-1', lesson: 'rank-correlation', type: 'mc', kind: 'conceptual',
    prompt: 'For 15 days, y falls every time x rises, but along a curve that flattens out rather than a straight line. Which set of values is correct?',
    options: [
      'Spearman’s ρ = −1 and Kendall’s τ = −1, while Pearson’s r is above −1.',
      'Pearson’s r = −1, while Spearman’s ρ and Kendall’s τ are both above −1.',
      'All three are −1, because the relationship is perfect in every sense.',
      'Spearman’s ρ = −1 and Pearson’s r = −1, while Kendall’s τ is about −0.7.',
    ],
    answer: 0,
    feedback: {
      1: 'It is the other way round: r = −1 needs a straight line; rank measures need only a perfect order.',
      2: 'The order is perfect, so both rank measures are −1; the curve keeps r above −1.',
      3: 'With no ties and a perfect order every pair is discordant, so τ = −1 too. τ is smaller in size than ρ only when the order is imperfect.',
    },
    solution: 'y falls whenever x rises, so the ranks are exactly reversed: Spearman’s ρ = −1, and every pair is discordant, so τ = −1. The points curve rather than lying on a line, so Pearson’s r is above −1 (closer to 0).',
  },
  {
    id: 'b05-m2-2', lesson: 'rank-correlation', type: 'num', kind: 'numerical',
    prompt: 'Kestrel Gyms (fictional) compares six branches on staff-training score (1, 2, 2, 3, 4, 5) and member-retention score (2, 1, 3, 3, 6, 5), listed branch by branch. Of the 15 pairs of branches, 11 are concordant and 2 discordant; one pair is tied on training and a different pair is tied on retention. Calculate Kendall’s τ-b, to three decimal places.',
    answer: rnd(GK.tau, 3), check: () => (11 - 2) / Math.sqrt((15 - 1) * (15 - 1)), unit: '', places: 3, tol: 0.0005,
    wrong: [
      { value: rnd(9 / 15, 3), say: 'That is τ-a, which divides by all 15 pairs. τ-b removes each variable’s tied pairs from the denominator: √((15 − 1)(15 − 1)) = 14.' },
      { value: rnd(9 / 13, 3), say: 'Dividing by concordant plus discordant pairs drops the ties completely. τ-b’s denominator is √((n₀ − n₁)(n₀ − n₂)).' },
    ],
    solution: `τ-b = (11 − 2) ÷ √((15 − 1)(15 − 1)) = 9 ÷ 14 = ${fx(GK.tau)}. τ-a would be 9 ÷ 15 = 0.600.`,
  },
  {
    id: 'b05-m2-3', lesson: 'rank-correlation', type: 'formula', kind: 'numerical',
    prompt: 'Millbrook, 1–16 December 2027: transactions in B2:B17 and sales in C2:C17. Column D already ranks transactions with <x>=RANK.AVG(B2,$B$2:$B$17)</x>, largest first. In E2, rank the sales in C2 so that CORREL of columns D and E gives Spearman’s ρ; the formula will be filled down to E17.',
    sheet: decSheet,
    cell: 'E2', fill: 'E2:E17', answer: '=RANK.AVG(C2,$C$2:$C$17)',
    alt: ['=RANK.AVG(C2,$C$2:$C$17,0)', '=RANK.AVG(C2,C$2:C$17)'],
    require: ['RANK.AVG'],
    view: 'A1:E17', widths: { D: 19, E: 14 }, formats: { C: '#,##0.00', D: '0.0', E: '0.0' },
    wrong: [
      { formula: '=RANK.AVG(C2,$C$2:$C$17,1)', say: 'Column D ranks largest first; ranking sales smallest first reverses them and flips the sign of ρ. Match D’s order: leave the third argument out (or use 0).' },
      { formula: '=RANK.AVG(C2,C2:C17)', say: 'Without $ signs the range slides as the formula is filled down. Anchor it: $C$2:$C$17.' },
      { formula: '=RANK.EQ(C2,$C$2:$C$17)', say: 'RANK.EQ gives tied values the top rank of their group; Spearman’s ρ uses average ranks, RANK.AVG.' },
    ],
    solution: `<x>=RANK.AVG(C2,$C$2:$C$17)</x>, filled to E17, ranks sales largest first, as D ranks transactions. <x>=CORREL(D2:D17,E2:E17)</x> then gives Spearman’s ρ = ${fx(decRho)}. Either direction gives the same ρ, provided both columns use it.`,
  },
  {
    id: 'b05-m2-4', lesson: 'rank-correlation', type: 'multi', kind: 'applied',
    prompt: 'In which of these datasets would you expect Spearman’s ρ and Pearson’s r to differ noticeably? Select all that apply.',
    options: [
      'Advertising spend and website visits, where visits rise quickly at first and then level off as spend grows.',
      'Floor area and monthly rent of 50 flats, close to a straight line, with one rent mistyped as $95,000 instead of $950.',
      'Daily high temperature in °C and the same temperature converted to °F.',
      'Hours worked and pay for 30 hourly staff who are all paid the same hourly rate.',
      'Customers’ ages and spending, in a perfectly symmetric U shape.',
    ],
    answer: [0, 1],
    feedback: {
      2: 'A linear change of units leaves r at 1, and the order is identical, so ρ is 1 as well.',
      3: 'Pay is an exact straight-line function of hours: r = 1 and ρ = 1.',
      4: 'A symmetric U can make both r and ρ close to 0: neither measure captures a relationship that turns back.',
    },
    solution: 'A curve that keeps rising (visits levelling off) gives ρ above r. A single mistyped extreme value drags r down while moving one rank. Unit conversions and exact straight lines give r = ρ = 1. A symmetric U gives both near 0: they agree, and both miss the pattern.',
  },
  {
    id: 'b05-m2-5', lesson: 'rank-correlation', type: 'mc', kind: 'applied',
    prompt: 'A student analyst at a hotel group (fictional) has 1–5 ratings of breakfast and of overall stay from 80 guests. She ranks each column with RANK.AVG and then uses ρ = 1 − 6Σd² ÷ (n(n² − 1)) to report Spearman’s ρ. What, if anything, is wrong?',
    options: [
      'Nothing is wrong: RANK.AVG has already dealt with the ties, so the shortcut formula works for any ranked data at all.',
      'The d² shortcut is wrong with ties, and five-point ratings tie heavily: she should take CORREL of the ranks.',
      'She should have used RANK.EQ, which handles tied ratings correctly for the shortcut.',
      'Spearman’s ρ can’t be used for ratings; she should report Pearson’s r instead.',
    ],
    answer: 1,
    feedback: {
      0: 'RANK.AVG gives ties the right ranks, but the d² shortcut is exact only when the ranks are exactly 1 to n, which ties break.',
      2: 'RANK.EQ makes things worse: it gives ties the top rank of their group, so the ranks are wrong for any formula.',
      3: 'Rank correlations suit ordinal ratings well; Pearson’s r treats the ratings as equally spaced measurements.',
    },
    solution: 'The d² formula is a shortcut for Pearson’s r of the ranks that holds only without ties. Five-point ratings from 80 guests tie on nearly every value, so the shortcut gives a wrong number. Use <x>=CORREL(rank column 1, rank column 2)</x> on the RANK.AVG columns, or report Kendall’s τ-b.',
  },
  // ---------------------------------------------------------------- testing-correlation
  {
    id: 'b05-m2-6', lesson: 'testing-correlation', type: 'num', kind: 'numerical',
    prompt: 'A coworking space (fictional) finds r = −0.35 between members’ commute time and the days a month they come in, across 30 members. Calculate the two-sided p-value for H₀: ρ = 0, to three decimal places.',
    answer: rnd(p2(-0.35, 30), 3), check: () => p2(-0.35, 30), unit: '', places: 3, tol: 0.0015,
    wrong: [
      { value: rnd(p2(-0.35, 30) / 2, 3), say: 'That is one tail. The test is two-sided: double it, or use T.DIST.2T.' },
      { value: rnd(2 * (1 - I.normCdf(Math.abs(tOf(-0.35, 30)))), 3), say: 'That uses the normal curve. The statistic follows the t distribution with 28 degrees of freedom.' },
    ],
    solution: `t = −0.35 × √28 ÷ √(1 − 0.1225) = ${fx(tOf(-0.35, 30))} with 28 df; <x>=T.DIST.2T(${Math.abs(tOf(-0.35, 30)).toFixed(3)},28)</x> = ${p2(-0.35, 30).toFixed(3)}. At α = 0.05 the association is not significant: 30 members can’t distinguish r = −0.35 from chance (the critical |r| is ${C.criticalR(30).toFixed(3)}).`,
  },
  {
    id: 'b05-m2-7', lesson: 'testing-correlation', type: 'formula', kind: 'numerical',
    prompt: 'B1 holds the number of pairs and B2 the significance level of a two-sided test. In B4, calculate the critical value of |r|.',
    sheet: critSheet,
    cell: 'B4', answer: '=T.INV.2T(B2,B1-2)/SQRT(B1-2+T.INV.2T(B2,B1-2)^2)',
    alt: ['=T.INV(1-B2/2,B1-2)/SQRT(B1-2+T.INV(1-B2/2,B1-2)^2)', '=SQRT(T.INV.2T(B2,B1-2)^2/(B1-2+T.INV.2T(B2,B1-2)^2))'],
    view: 'A1:B4', widths: { A: 16 }, formats: { B4: '0.000' },
    wrong: [
      { formula: '=T.INV.2T(B2,B1-2)', say: 'That is the critical t. Convert it to r: t ÷ √(n − 2 + t²).' },
      { formula: '=T.INV.2T(B2,B1-1)/SQRT(B1-1+T.INV.2T(B2,B1-1)^2)', say: 'A correlation test has n − 2 degrees of freedom, not n − 1.' },
      { formula: '=T.INV(1-B2,B1-2)/SQRT(B1-2+T.INV(1-B2,B1-2)^2)', say: 'That puts all of α in one tail: the one-sided critical value. The test here is two-sided.' },
    ],
    solution: `t_crit = <x>=T.INV.2T(B2,B1-2)</x>, then r_crit = t_crit ÷ √(n − 2 + t_crit²). For 24 pairs at α = 0.05: ${I.tInv(0.975, 22).toFixed(3)} ÷ √(22 + ${I.tInv(0.975, 22).toFixed(3)}²) = ${C.criticalR(24).toFixed(3)}.`,
  },
  {
    id: 'b05-m2-8', lesson: 'testing-correlation', type: 'num', kind: 'applied',
    prompt: 'A transport authority (fictional) wants a 90% chance of detecting a correlation of 0.15 between a bus route’s punctuality and its weekly ridership, with a two-sided test at α = 0.05. How many routes would it need? Give a whole number, rounded up.',
    answer: C.sampleSize(0.15, { power: 0.9 }), check: () => Math.ceil(((I.normInv(0.975) + I.normInv(0.9)) / Math.atanh(0.15)) ** 2 + 3), unit: 'routes', places: 0, tol: 0.5,
    wrong: [
      { value: C.sampleSize(0.15), say: 'That is the number for 80% power. For 90% power use z₀.₉₀ = 1.282 in place of 0.842.' },
      { value: Math.ceil(((I.normInv(0.975) + I.normInv(0.9)) / Math.atanh(0.15)) ** 2), say: 'Add 3: Fisher’s standard error is 1 ÷ √(n − 3).' },
    ],
    solution: `n = ((1.960 + 1.282) ÷ atanh 0.15)² + 3 = (3.242 ÷ ${Math.atanh(0.15).toFixed(4)})² + 3 ≈ ${(((I.normInv(0.975) + I.normInv(0.9)) / Math.atanh(0.15)) ** 2 + 3).toFixed(1)}, so ${C.sampleSize(0.15, { power: 0.9 })} routes. Few authorities run that many: the realistic options are to accept less power, look for a larger effect, or pool several years.`,
  },
  {
    id: 'b05-m2-9', lesson: 'testing-correlation', type: 'num', kind: 'numerical',
    prompt: 'A franchise (fictional) correlates local unemployment with store sales: r = 0.52 across 60 stores in one country and r = 0.21 across 75 stores in another. Test whether the two correlations differ (two-sided). What is the p-value? Give three decimal places.',
    answer: rnd(CMP.p, 3), check: () => 2 * (1 - I.normCdf(Math.abs((Math.atanh(0.52) - Math.atanh(0.21)) / Math.sqrt(1 / 57 + 1 / 72)))), unit: '', places: 3, tol: 0.0015,
    wrong: [
      { value: rnd(CMP.p / 2, 3), say: 'That is one tail. The question asks whether the correlations differ in either direction: double it.' },
      { value: rnd(2 * (1 - I.normCdf(Math.abs((0.52 - 0.21) / Math.sqrt(1 / 57 + 1 / 72)))), 3), say: 'Transform each r with Fisher’s z (atanh) before subtracting.' },
    ],
    solution: `z = (atanh 0.52 − atanh 0.21) ÷ √(1/57 + 1/72) = (${Math.atanh(0.52).toFixed(4)} − ${Math.atanh(0.21).toFixed(4)}) ÷ ${CMP.se.toFixed(4)} = ${CMP.z.toFixed(3)}; p = ${CMP.p.toFixed(3)}. At α = 0.05 the correlations differ. The stores in the two countries are separate samples, so the independence the formula needs is plausible here.`,
  },
  {
    id: 'b05-m2-10', lesson: 'testing-correlation', type: 'mc', kind: 'applied',
    prompt: `A boutique hotel group (fictional) finds r = 0.62 between room price and guest rating across its 10 properties. The 95% Fisher-z interval for ρ runs from ${fx(CI10[0], 2)} to ${fx(CI10[1], 2)}. What should the analyst tell the owners?`,
    options: [
      'The data fit anything from no association to a very strong one; ten properties can’t pin it down.',
      'A correlation of 0.62 is strong, so raising prices should raise guest ratings across the group.',
      'The interval includes 0, so price and rating are unrelated and pricing can be set without regard to ratings.',
      'The interval is centred on 0.62, so the best estimate is that 62% of rating differences come from price.',
    ],
    answer: 0,
    feedback: {
      1: 'With 10 properties r = 0.62 is not even significant, and a correlation wouldn’t show that higher prices cause better ratings.',
      2: 'An interval that includes 0 means the data are compatible with no association, not that there is none: it reaches 0.90 too.',
      3: 'The interval isn’t centred on r (Fisher’s back-transformation makes it lopsided), and r is not a percentage; r² = 0.38 is the shared variance.',
    },
    solution: `With n = 10 the interval for ρ runs from ${fx(CI10[0], 2)} to ${fx(CI10[1], 2)}: everything from essentially no association to a very strong one. The honest message is that ten properties can’t tell; more data, or a different design, is needed before acting on it.`,
  },
  {
    id: 'b05-m2-11', lesson: 'testing-correlation', type: 'classify', kind: 'conceptual',
    prompt: 'Could the Fisher-z test for two independent correlations be used as it stands to compare each pair of correlations below?',
    items: [
      'Sales and temperature at a long-established café one year, against the same café the next year.',
      'Sales and temperature at two cafés on the same days of 2027.',
      'Satisfaction and price among one hotel’s guests, against satisfaction and value-for-money among the same guests.',
      'Training hours and output at 40 factories in one country, against 55 factories in another.',
    ],
    categories: ['Yes: independent samples', 'No: the samples are linked'],
    answer: [0, 1, 1, 0],
    feedback: {
      0: 'Different years mean different days: the samples are separate, though a strong trend or seasonality can still link them a little.',
      1: 'The same days and the same weather appear in both samples, so they are not independent.',
      2: 'The same guests supply both correlations, which share the satisfaction variable: a test for dependent correlations is needed.',
      3: 'Different factories in different countries: independent samples.',
    },
    solution: 'The formula assumes the two correlations come from unconnected samples. Different years at one café or different factories qualify. The same days at two cafés, or two correlations from the same guests sharing a variable, are linked: they need a test for dependent correlations (such as Steiger’s), not the simple formula.',
  },
];
