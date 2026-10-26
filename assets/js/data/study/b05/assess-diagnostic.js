// assess-diagnostic.js — B05 course diagnostic: three items per module, each written so that it needs that module’s own
// method, not what B04 already teaches (descriptive statistics, t and chi-square tests, ANOVA, power for means), so that
// a student who knows only the prerequisites misses a module’s items and one who already has its methods gets them right.
// Module 1: reading clusters in a scatterplot that r = 0.98 hides (scatterplots); r = cov ÷ (s_x s_y) with one standard
// deviation in other units, which only works once the units match (covariance-and-pearson); judging strength by r, not
// by the size of a covariance (covariance-and-pearson). Module 2: Spearman’s ρ as Pearson’s r of average ranks, in one
// formula, on tied data (rank-correlation); Fisher’s z test of H₀: ρ = 0.6 (testing-correlation); the power of a
// correlation test, and the pairs needed, behind a non-significant r (testing-correlation). Module 3: a far point on the
// line raising r (outliers-and-influence); the range-restriction formula from a restricted to the full range
// (nonlinear-and-restricted); which correlation answers a within-group question when pooling reverses the sign
// (groups-and-simpsons-paradox). Module 4: counting Holm rejections (correlation-matrices); the first-order partial
// correlation from three café correlations (partial-correlation); which design shows cause (correlation-and-causation).
// Modules 1–3 use only mc, num and formula items, which score 0 or 1, so that the route can’t be passed on part marks;
// module 4 is not used for routing. New questions, not copies of lesson exercises, module tests, the final or the
// project, and nothing from the project’s data or question. Café figures come from case.js (the corrected log);
// Lindale Stationers, Gorseway Hotels, Pelling Bakeries, Sedgemoor Garden Centre, Tollbridge Insurance, Cordwain Hotels,
// Halsway Leisure and Orlebar Bakeries are fictional. Every num item’s `check` recomputes its answer, and the formula
// item is marked by its results on the sheet and on changed copies.
import { CLEAN_ROWS, CAFE_COLUMNS, column, DERIVED } from './case.js?v=20';
import * as C from '../../../core/correlation.js?v=20';
import { sd } from '../../../core/stats.js?v=20';
import { normCdf } from '../../../core/inference.js?v=20';

const at = (n) => CAFE_COLUMNS.indexOf(n);
const fx = (v, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const pc = (v, d = 0) => `${fx(v * 100, d)}%`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayLabel = (iso) => `${Number(iso.slice(8))} ${MON[Number(iso.slice(5, 7)) - 1]}`;
const H = { cafe: 'Harbourside' };

// Lindale Stationers (fictional): five high-street shops and five retail-park shops
const AREA = [95, 430, 120, 85, 460, 105, 445, 410, 110, 480];
const SALES = [6.4, 21.8, 6.9, 7.8, 20.6, 8.6, 18.9, 19.5, 7.1, 19.7];
const small = AREA.map((a, i) => i).filter((i) => AREA[i] < 200), large = AREA.map((a, i) => i).filter((i) => AREA[i] >= 200);
const shopR = C.pearson(AREA, SALES).r;
const smallR = C.pearson(small.map((i) => AREA[i]), small.map((i) => SALES[i])).r, largeR = C.pearson(large.map((i) => AREA[i]), large.map((i) => SALES[i])).r;

// Harbourside: the day’s high (°F) and iced drinks; the high’s SD quoted in °C
const hHigh = column('high_f', H), hIced = column('iced_drinks', H);
const D2 = { cov: rnd(C.covariance(hHigh, hIced), 1), sdIced: rnd(sd(hIced), 1), sdC: rnd(sd(hHigh) / 1.8, 2) };
const d2r = (cov, sdC, sdI) => cov / (sdC * 9 / 5 * sdI);

// both cafés, 612 days: transactions–sales against the high–iced share
const T = column('transactions'), S = column('sales'), HI = column('high_f'), SH = column('iced_share');
const D3 = { covTS: rnd(C.covariance(T, S), 1), sT: rnd(sd(T), 1), sS: rnd(sd(S), 1), covHI: rnd(C.covariance(HI, SH), 2), sH: rnd(sd(HI), 1), sI: rnd(sd(SH), 3) };
const rTS = D3.covTS / (D3.sT * D3.sS), rHI = D3.covHI / (D3.sH * D3.sI);

// Millbrook, 11–24 October: peak barista hours (half-hours, many ties) and transactions
const OCT = CLEAN_ROWS.filter((r) => r[at('cafe')] === 'Millbrook' && r[at('date')] >= '2027-10-11' && r[at('date')] <= '2027-10-24');
const oH = OCT.map((r) => r[at('peak_staff_hours')]), oT = OCT.map((r) => r[at('transactions')]);
const oRho = C.spearman(oH, oT).rho, oR = C.pearson(oH, oT).r;
const oLast = OCT.length + 1;

// Gorseway Hotels (fictional): H0: ρ = 0.60, r = 0.41 over 60 guests
const GH = { r: 0.41, n: 60, rho0: 0.6 };
const ghTest = C.fisherTest(GH.r, GH.n, GH.rho0);
const twoSidedZ = (z) => 2 * normCdf(-Math.abs(z));

// Pelling Bakeries (fictional): 25 branches, r = 0.20
const PB = { n: 25, rho: 0.2 };
const pbPower = C.power(PB.rho, PB.n), pbN = C.sampleSize(PB.rho);

// Sedgemoor Garden Centre (fictional): leaflets delivered (thousands) and weekend visitors (hundreds), nine weekends,
// then a tenth weekend far to the right, on the nine weekends’ least-squares line
const LEAF = [3, 4, 5, 6, 7, 8, 9, 10, 11], VIS = [14, 9, 15, 11, 17, 12, 18, 16, 13];
const lm = (a) => a.reduce((s, v) => s + v, 0) / a.length;
const slope9 = C.covariance(LEAF, VIS) / C.covariance(LEAF, LEAF);
const vis10 = rnd(lm(VIS) + slope9 * (30 - lm(LEAF)), 1);
const r9 = C.pearson(LEAF, VIS).r, r10 = C.pearson([...LEAF, 30], [...VIS, vis10]).r;

// Tollbridge Insurance (fictional): restricted SD 6, full SD 15, r among hires 0.28
const TI = { s: 6, S: 15, r: 0.28 };
const rangeUp = (r, k) => (k * r) / Math.sqrt(1 - r * r + k * k * r * r);

// Halsway Leisure (fictional): 8 p-values from a matrix screen
const BL = [0.001, 0.004, 0.0065, 0.009, 0.03, 0.041, 0.2, 0.62];
const nBelow = (a, q = 0.05) => a.filter((p) => p < q).length;
const blHolm = nBelow(C.adjust(BL, 'holm')), blBonf = nBelow(C.adjust(BL, 'bonferroni')), blBH = nBelow(C.adjust(BL, 'fdr_bh')), blRaw = nBelow(BL);

// café correlations for the partial (612 days)
const R3 = { hs: rnd(DERIVED.staffSales.r, 3), ht: rnd(C.pearson(column('peak_staff_hours'), T).r, 3), ts: rnd(DERIVED.transSales.r, 3) };
const hsGivenT = C.partialFromR(R3.hs, R3.ht, R3.ts);

export const items = [
  // ================================================================ Module 1: seeing relationships
  {
    id: 'b05-dg-1', lesson: 'scatterplots', type: 'mc', kind: 'conceptual',
    prompt: `Lindale Stationers (fictional) has ten shops. The table gives each shop’s floor area and weekly sales; across the ten, r = ${fx(shopR)}. What would a scatterplot of sales (y) against floor area (x) show, and what does it mean for that r?`,
    data: { table: { head: ['Shop', 'Floor area (m²)', 'Weekly sales ($000)'], rows: AREA.map((a, i) => [`L${i + 1}`, String(a), SALES[i].toFixed(1)]), align: ['l', 'r', 'r'] } },
    options: [
      'Two separate clusters, small shops and large shops, with no clear trend inside either; r mostly measures the gap between them.',
      `One tight rising band: with r = ${fx(shopR)}, each extra square metre goes with about the same extra sales in every shop.`,
      'A curve that flattens among the large shops, which is why r falls short of 1 and a rank correlation would summarise the shops better.',
      `Nothing that r doesn’t already say, since a correlation as high as ${fx(shopR)} leaves almost no scatter for a plot to reveal.`,
    ],
    answer: 0,
    feedback: {
      1: `Inside each group of five shops the points don’t rise at all (r = ${fx(smallR)} for the small shops and ${fx(largeR)} for the large). The high r comes from the two groups sitting at opposite corners.`,
      2: 'There is no curve: the points fall into two clumps with an empty middle. A rank correlation would be just as high, and just as misleading.',
      3: 'A single number can’t show form. Two clusters, a curve or one far point can all give r near 1; only the plot tells them apart.',
    },
    solution: `Plot first. The floor areas fall into two groups, 85–120 m² and 410–480 m², and so do the sales. Inside the small shops r = ${fx(smallR)}, inside the large ones ${fx(largeR)}: no trend in either. The r of ${fx(shopR)} measures how far apart the two clusters sit, which says that big shops sell more than small ones, not that adding floor space to a shop adds sales in proportion. Describe the clusters, and compare like with like.`,
  },
  {
    id: 'b05-dg-2', lesson: 'covariance-and-pearson', type: 'num', kind: 'numerical',
    prompt: `Over Harbourside’s 306 days in 2027, the sample covariance of the day’s high (in °F) and the iced drinks made is ${fx(D2.cov, 1)} (°F × drinks). The standard deviation of iced drinks is ${fx(D2.sdIced, 1)} drinks. A colleague’s summary gives the standard deviation of the day’s high in °C: ${fx(D2.sdC, 2)} °C. What is Pearson’s r between the high and iced drinks? Give two decimal places.`,
    answer: rnd(d2r(D2.cov, D2.sdC, D2.sdIced), 2),
    check: () => D2.cov / ((D2.sdC * 1.8) * D2.sdIced),
    unit: '', places: 2, tol: 0.006,
    wrong: [
      { value: rnd(D2.cov / (D2.sdC * D2.sdIced), 2), say: 'r can’t be above 1. The covariance is in °F × drinks, so both standard deviations must be in the same units: the high’s spread in °F is 1.8 times its spread in °C.' },
      { value: rnd(D2.cov / ((D2.sdC * 1.8 + 32) * D2.sdIced), 2), say: 'Adding 32 converts a temperature, not a spread. A standard deviation measures distances between values, so only the factor 1.8 applies.' },
      { value: rnd(D2.cov / ((D2.sdC / 1.8) * D2.sdIced), 2), say: 'A degree Fahrenheit is smaller than a degree Celsius, so the same spread is a larger number in °F: multiply by 1.8, don’t divide.' },
    ],
    solution: `r = cov ÷ (s_x s_y), with every quantity in the same units. In °F the high’s standard deviation is ${fx(D2.sdC, 2)} × 1.8 = ${fx(D2.sdC * 1.8, 2)} °F (a spread changes by the factor only; the +32 cancels). r = ${fx(D2.cov, 1)} ÷ (${fx(D2.sdC * 1.8, 2)} × ${fx(D2.sdIced, 1)}) = ${fx(d2r(D2.cov, D2.sdC, D2.sdIced), 3)}, which agrees with CORREL on the log (${fx(C.pearson(hHigh, hIced).r, 3)}). Warmer days went with more iced drinks. Mixing °C and °F gives ${fx(D2.cov / (D2.sdC * D2.sdIced), 2)}, an impossible value that is the clue something is wrong.`,
  },
  {
    id: 'b05-dg-3', lesson: 'covariance-and-pearson', type: 'mc', kind: 'applied',
    prompt: `Ana compares two pairs of measures over the 612 café-days. Transactions and sales: covariance ${fx(D3.covTS, 1)} (transactions × $); standard deviations ${fx(D3.sT, 1)} transactions and $${fx(D3.sS, 1)}. The day’s high and the iced share (the share of drinks served iced): covariance ${fx(D3.covHI, 2)} (°F × share); standard deviations ${fx(D3.sH, 1)} °F and ${fx(D3.sI, 3)}. Which pair has the stronger straight-line relationship?`,
    options: [
      `The high and the iced share: r is about ${fx(rHI)}, against about ${fx(rTS)} for transactions and sales.`,
      `Transactions and sales: their covariance is about ${Math.round(D3.covTS / D3.covHI).toLocaleString('en-US')} times as large as the other pair’s.`,
      'Neither can be judged: covariances measured in different units can’t be compared with each other.',
      'They are equally strong as far as the figures show, because both covariances are positive.',
    ],
    answer: 0,
    feedback: {
      1: 'A covariance’s size depends on the units: sales in dollars and transactions in the hundreds make a big number whatever the strength. Divide by both standard deviations to get r.',
      2: 'True of the covariances, but you have the standard deviations too: r = cov ÷ (s_x s_y) has no units and can be compared.',
      3: 'The sign gives the direction only. Strength needs r.',
    },
    solution: `r = cov ÷ (s_x s_y). Transactions and sales: ${fx(D3.covTS, 1)} ÷ (${fx(D3.sT, 1)} × ${fx(D3.sS, 1)}) = ${fx(rTS, 3)}. High and iced share: ${fx(D3.covHI, 2)} ÷ (${fx(D3.sH, 1)} × ${fx(D3.sI, 3)}) = ${fx(rHI, 3)}. The pair with the tiny covariance is the more closely related one: a covariance’s size reflects its units, and only r puts the two pairs on the same scale.`,
  },

  // ================================================================ Module 2: measuring and testing
  {
    id: 'b05-dg-4', lesson: 'rank-correlation', type: 'formula', kind: 'numerical',
    prompt: `Millbrook, 11–24 October 2027: B holds the barista hours rostered for the morning peak (in half-hours, so many days tie) and C the day’s transactions. In F1, calculate Spearman’s rank correlation between them, in one formula.`,
    sheet: { cells: { A1: 'Day', B1: 'Peak barista hours', C1: 'Transactions', E1: 'Spearman’s ρ', ...col('A', 2, OCT.map((r) => dayLabel(r[at('date')]))), ...col('B', 2, oH), ...col('C', 2, oT) } },
    cell: 'F1', view: `A1:F${oLast}`, formats: { B: '0.0', F1: '0.000' }, widths: { B: 18, C: 13, E: 13 },
    answer: `=CORREL(RANK.AVG(B2:B${oLast},B2:B${oLast}),RANK.AVG(C2:C${oLast},C2:C${oLast}))`,
    alt: [
      `=CORREL(RANK.AVG(B2:B${oLast},B2:B${oLast},1),RANK.AVG(C2:C${oLast},C2:C${oLast},1))`,
      `=PEARSON(RANK.AVG(B2:B${oLast},B2:B${oLast}),RANK.AVG(C2:C${oLast},C2:C${oLast}))`,
      `=CORREL(RANK.AVG(C2:C${oLast},C2:C${oLast}),RANK.AVG(B2:B${oLast},B2:B${oLast}))`,
    ],
    require: ['RANK.AVG'],
    wrong: [
      { formula: `=CORREL(B2:B${oLast},C2:C${oLast})`, say: 'That is Pearson’s r of the values. Spearman’s ρ is Pearson’s r of the ranks: rank each column with RANK.AVG inside CORREL.' },
      { formula: `=CORREL(RANK.EQ(B2:B${oLast},B2:B${oLast}),RANK.EQ(C2:C${oLast},C2:C${oLast}))`, say: 'RANK.EQ gives every tied day the top rank of its group. Spearman’s ρ gives tied values the average of the ranks they share: RANK.AVG.' },
      { formula: `=CORREL(RANK.AVG(B2:B${oLast},B2:B${oLast}),RANK.AVG(C2:C${oLast},C2:C${oLast},1))`, say: 'One column is ranked largest first and the other smallest first, which flips the sign. Rank both the same way.' },
    ],
    solution: `<x>=CORREL(RANK.AVG(B2:B15,B2:B15),RANK.AVG(C2:C15,C2:C15))</x> = ${fx(oRho, 3)}. RANK.AVG gives each group of tied hours the average of the ranks it spans, and Pearson’s r of the two rank columns is Spearman’s ρ (the d² shortcut is wrong here, because of the ties). Pearson’s r on the values is ${fx(oR, 3)}: the four weekend days, with few hours and little trade, sit far from the weekdays and lift r, while ρ counts them only by their order.`,
  },
  {
    id: 'b05-dg-5', lesson: 'testing-correlation', type: 'num', kind: 'numerical',
    prompt: `Gorseway Hotels (fictional) uses a booking-intent score that its supplier says correlates ${fx(GH.rho0)} with whether a guest returns within a year. Across ${GH.n} guests chosen at random, Gorseway finds r = ${fx(GH.r)}. Test H₀: ρ = ${fx(GH.rho0)} against a two-sided alternative. What is the p-value? Give three decimal places.`,
    answer: rnd(ghTest.p, 3),
    check: () => { const z = (Math.atanh(0.41) - Math.atanh(0.6)) * Math.sqrt(60 - 3); return twoSidedZ(z); },
    unit: '', places: 3, tol: 0.0015,
    wrong: [
      { value: rnd(ghTest.p / 2, 3), say: 'That is one tail. The alternative is two-sided: the score could correlate more or less than the supplier says.' },
      { value: rnd(twoSidedZ((GH.r - GH.rho0) * Math.sqrt(GH.n - 3)), 3), say: 'The sampling distribution of r is lopsided near 0.6. Transform both r and ρ₀ with Fisher’s z (atanh) before subtracting.' },
      { value: rnd(C.rTest(GH.r, GH.n).p, 3), say: 'That is the t test of H₀: ρ = 0. The supplier’s claim is ρ = 0.60, which needs Fisher’s z test.' },
    ],
    solution: `Fisher’s z test of H₀: ρ = ρ₀: z = (atanh ${fx(GH.r)} − atanh ${fx(GH.rho0)}) × √(${GH.n} − 3) = (${fx(Math.atanh(GH.r), 4)} − ${fx(Math.atanh(GH.rho0), 4)}) × ${fx(Math.sqrt(GH.n - 3), 3)} = ${fx(ghTest.z, 3)}, two-sided p = ${fx(ghTest.p, 3)}. At α = 0.05 the data don’t quite contradict the supplier’s 0.60, though they point lower; the 95% interval for ρ, ${fx(C.fisherCI(GH.r, GH.n)[0])} to ${fx(C.fisherCI(GH.r, GH.n)[1])}, shows how loosely 60 guests pin it down. The t test of ρ = 0 answers a different question.`,
  },
  {
    id: 'b05-dg-6', lesson: 'testing-correlation', type: 'mc', kind: 'applied',
    prompt: `Pelling Bakeries (fictional) correlated staff turnover with customer complaints across its ${PB.n} branches: r = ${fx(PB.rho)}, two-sided p = ${fx(C.rTest(PB.rho, PB.n).p)}. The area manager writes: “No relationship: turnover and complaints are unrelated.” Which reply is right?`,
    options: [
      `The test can’t say: with ${PB.n} branches it had only about a ${pc(pbPower)} chance of detecting a true ρ of 0.2, and about ${pbN} branches would give 80% power.`,
      `The manager is right: p = ${fx(C.rTest(PB.rho, PB.n).p)} means a ${pc(1 - C.rTest(PB.rho, PB.n).p)} chance that turnover and complaints are unrelated.`,
      `The test can’t say, but only because it was two-sided: a one-sided test gives p = ${fx(C.rTest(PB.rho, PB.n).p / 2)}, which would settle the question in favour of turnover raising complaints.`,
      'The manager is right to treat r = 0.20 as zero, since by the usual verbal scale any correlation below 0.3 counts as negligible.',
    ],
    answer: 0,
    feedback: {
      1: 'A p-value is not the probability that H₀ is true. It is the chance of an r this far from 0 if ρ were 0, and here such an r is common.',
      2: 'A one-sided test must be chosen before seeing the data, and 0.17 would not reject H₀ anyway. Nor could any correlation show that turnover raises complaints.',
      3: 'Verbal labels for r are conventions that vary between textbooks, and a correlation of 0.2 can matter. The problem is that 25 branches can’t detect it.',
    },
    solution: `Not rejecting H₀ is not evidence of no relationship when the test had little power. The power of a two-sided test at α = 0.05 for ρ = 0.2 with 25 pairs, by Fisher’s z, is Φ(atanh 0.2 × √22 − 1.96) ≈ ${fx(pbPower, 2)}; the pairs needed for 80% power are ((1.960 + 0.842) ÷ atanh 0.2)² + 3, rounded up: ${pbN}. Pelling has 25. The honest summary: r = 0.20 (95% interval ${fx(C.fisherCI(PB.rho, PB.n)[0])} to ${fx(C.fisherCI(PB.rho, PB.n)[1])}), compatible with no link and with a moderate one.`,
  },

  // ================================================================ Module 3: when correlations mislead
  {
    id: 'b05-dg-7', lesson: 'outliers-and-influence', type: 'mc', kind: 'conceptual',
    prompt: `Sedgemoor Garden Centre (fictional) delivered between 3,000 and 11,000 leaflets before each of nine weekends; leaflets and weekend visitors correlate at r = ${fx(r9)}. Before a tenth weekend it delivers 30,000, and the visitors land exactly on the straight line that the nine weekends suggest. What happens to r when the tenth weekend is added?`,
    options: [
      `It rises to about ${fx(r10)}: far out and on the line, the point adds a large positive product of z-scores.`,
      'It falls, because the tenth weekend is an outlier in leaflets, and an outlier on either variable always weakens a correlation.',
      'It barely changes, because one weekend out of ten contributes only about a tenth of the products that make up r.',
      'It rises to exactly 1: a point placed exactly on the nine weekends’ line pulls the whole fit onto that line.',
    ],
    answer: 0,
    feedback: {
      1: 'Whether an unusual point weakens or strengthens r depends on where it lies. Far out in x and on the line, it adds a large positive z_x × z_y and makes the other points’ scatter look small.',
      2: 'Points don’t carry equal weight in r: one far from the means contributes a product of z-scores many times the others’.',
      3: 'The other nine points still scatter around the line, so r stays below 1; the new point only makes that scatter look small against the stretched range.',
    },
    solution: `Before: r = ${fx(r9, 3)}. The tenth weekend (30 thousand leaflets, ${fx(vis10 * 100, 0)} visitors, on the nine weekends’ least-squares line) has z-scores of about ${fx((30 - lm([...LEAF, 30])) / sd([...LEAF, 30]))} and ${fx((vis10 - lm([...VIS, vis10])) / sd([...VIS, vis10]))}, so it adds a large positive product, and r becomes ${fx(r10, 3)}. One point now decides most of r: report r with and without it, and note that a link seen across 3,000–11,000 leaflets is being extended to 30,000 on the strength of one weekend.`,
  },
  {
    id: 'b05-dg-8', lesson: 'nonlinear-and-restricted', type: 'num', kind: 'numerical',
    prompt: `Tollbridge Insurance (fictional) hires claims handlers on a typing-accuracy score. The standard deviation of the score is ${TI.S} points among all applicants but only ${TI.s} among those hired. Among the hired, the score and claims settled per week correlate at r = ${fx(TI.r)}. Assuming a straight-line relationship with even scatter and selection on the score alone, estimate the correlation among all applicants. Give two decimal places.`,
    answer: rnd(rangeUp(TI.r, TI.S / TI.s), 2),
    check: () => { const k = 15 / 6, r = 0.28; return (k * r) / Math.sqrt(1 - r ** 2 + k ** 2 * r ** 2); },
    unit: '', places: 2, tol: 0.006,
    wrong: [
      { value: rnd(TI.r * TI.S / TI.s, 2), say: 'r doesn’t grow in proportion to the spread; multiplying by k ignores the scatter around the line. Use k r ÷ √(1 − r² + k² r²).' },
      { value: rnd(rangeUp(TI.r, TI.s / TI.S), 2), say: 'With k = 6 ÷ 15 the formula goes the other way, from the full range to a restricted one. Here k = S ÷ s = 15 ÷ 6.' },
      { value: TI.r, say: 'Restricting the range shrinks r, so the correlation among all applicants is larger than among the hired.' },
    ],
    solution: `k = S ÷ s = ${TI.S} ÷ ${TI.s} = ${fx(TI.S / TI.s, 1)}. r_u = k r ÷ √(1 − r² + k² r²) = ${fx(TI.S / TI.s * TI.r, 2)} ÷ √(1 − ${fx(TI.r ** 2, 4)} + ${fx((TI.S / TI.s) ** 2 * TI.r ** 2, 4)}) = ${fx(rangeUp(TI.r, TI.S / TI.s), 3)}. Among hires the score looks weak because they all scored high; across applicants it separates them much better. The estimate is only as good as the straight-line, even-scatter assumption.`,
  },
  {
    id: 'b05-dg-9', lesson: 'groups-and-simpsons-paradox', type: 'mc', kind: 'applied',
    prompt: 'Cordwain Hotels (fictional) has a city hotel and a resort. Over a year, nights with higher occupancy had lower guest ratings at the city hotel (r = −0.35) and at the resort (r = −0.28). With both hotels’ nights pooled, r = +0.30: the resort is both fuller and better rated. The manager asks: “At our hotels, do busier nights go with lower ratings?” Which figures answer her?',
    options: [
      'The two hotels’ own correlations, −0.35 and −0.28: within each hotel, busier nights went with lower ratings.',
      'The pooled r = +0.30, because it uses every night at both hotels together and so rests on twice as much data as either hotel.',
      'The average of the three figures, about −0.11, which balances the hotels against the pooled view.',
      'None of them: once pooling reverses a sign, no correlation from these data can be trusted.',
    ],
    answer: 0,
    feedback: {
      1: 'Pooling mixes the difference between the hotels (the resort is fuller and better rated) with what happens from night to night. More rows don’t fix that.',
      2: 'Averaging correlations that answer different questions gives a number that answers none.',
      3: 'Each figure is accurate; they answer different questions. The within-hotel ones answer the manager’s.',
    },
    solution: 'Her question is about nights at a given hotel, so the within-hotel correlations answer it: busier nights went with lower ratings at both. The pooled +0.30 is driven by the gap between the hotels: the resort sits higher on both occupancy and rating. Report both hotels’ figures, and say why pooling reverses the sign.',
  },

  // ================================================================ Module 4: many variables and causation
  {
    id: 'b05-dg-10', lesson: 'correlation-matrices', type: 'num', kind: 'numerical',
    prompt: `Halsway Leisure (fictional) screened a correlation matrix and tested ${BL.length} pairs. The p-values, sorted, are ${BL.join(', ')}. How many pairs does Holm’s method reject with a family-wise error rate of 0.05?`,
    answer: blHolm,
    check: () => { let k = 0; const s = [...BL].sort((a, b) => a - b); while (k < s.length && s[k] <= 0.05 / (s.length - k)) k++; return k; },
    unit: 'pairs', places: 0, tol: 0.5,
    wrong: [
      { value: blRaw, say: 'That counts the p-values below 0.05 with no adjustment. With 8 tests the chance of at least one false alarm is far above 5%.' },
      { value: blBonf, say: 'That is Bonferroni: every p-value against 0.05 ÷ 8. Holm compares the k-th smallest with 0.05 ÷ (8 − k + 1), which is less strict after the first.' },
      { value: blBH, say: 'That is Benjamini–Hochberg, which controls the false discovery rate. Holm controls the chance of any false rejection, with thresholds 0.05 ÷ 8, 0.05 ÷ 7, …' },
    ],
    solution: `Holm’s thresholds for the sorted p-values are 0.05 ÷ 8 = 0.00625, ÷ 7 = 0.00714, ÷ 6 = 0.00833, ÷ 5 = 0.0100, ÷ 4 = 0.0125, … 0.001, 0.004, 0.0065 and 0.009 are each below their threshold; 0.03 is above 0.0125, so the procedure stops: ${blHolm} rejections. Bonferroni would reject ${blBonf}, Benjamini–Hochberg ${blBH}, and no adjustment ${blRaw}.`,
  },
  {
    id: 'b05-dg-11', lesson: 'partial-correlation', type: 'num', kind: 'numerical',
    prompt: `Across the 612 café-days, peak barista hours and sales correlate at ${fx(R3.hs, 3)}, peak barista hours and transactions at ${fx(R3.ht, 3)}, and transactions and sales at ${fx(R3.ts, 3)}. What is the correlation between peak barista hours and sales holding transactions fixed? Give two decimal places.`,
    answer: rnd(hsGivenT, 2),
    check: () => (R3.hs - R3.ht * R3.ts) / Math.sqrt((1 - R3.ht ** 2) * (1 - R3.ts ** 2)),
    unit: '', places: 2, tol: 0.006,
    wrong: [
      { value: rnd(R3.hs - R3.ht * R3.ts, 2), say: 'That is the numerator. Divide by √((1 − r_hT²)(1 − r_TS²)).' },
      { value: rnd((R3.hs - R3.ht * R3.ts) / ((1 - R3.ht ** 2) * (1 - R3.ts ** 2)), 2), say: 'The denominator is the square root of (1 − r_hT²)(1 − r_TS²).' },
      { value: R3.hs, say: `${fx(R3.hs, 3)} is the simple correlation. Holding transactions fixed removes the part of it that comes from busy days having both more baristas and more sales.` },
    ],
    solution: `(r_hS − r_hT r_TS) ÷ √((1 − r_hT²)(1 − r_TS²)) = (${fx(R3.hs, 3)} − ${fx(R3.ht, 3)} × ${fx(R3.ts, 3)}) ÷ √((1 − ${fx(R3.ht ** 2, 4)})(1 − ${fx(R3.ts ** 2, 4)})) = ${fx(R3.hs - R3.ht * R3.ts, 4)} ÷ ${fx(Math.sqrt((1 - R3.ht ** 2) * (1 - R3.ts ** 2)), 4)} ≈ ${fx(hsGivenT, 2)}. On days with the same number of transactions, more barista hours went with slightly lower sales, not higher: the ${fx(R3.hs, 2)} came from the manager rostering more baristas on busy days. (Pooling the cafés is fine for this description; the case’s planted relationship is that busy days bring both.)`,
  },
  {
    id: 'b05-dg-12', lesson: 'correlation-and-causation', type: 'mc', kind: 'applied',
    prompt: 'Orlebar Bakeries (fictional) finds that its branches which play music have higher sales per customer (r = 0.38 across 60 branches). Which further evidence would most directly show that music raises sales per customer?',
    options: [
      'In each branch, play music on days chosen by lot and compare sales per customer on music and silent days.',
      'Collect a year’s data from 600 branches, so that the correlation of 0.38 is estimated much more precisely.',
      'Hold branch size fixed in a partial correlation; if the link survives, music must be what raises the spend.',
      'Show that the correlation is far stronger than 0.38 in the branches whose managers chose the loudest music.',
    ],
    answer: 0,
    feedback: {
      1: 'More branches make the estimate more precise, but every confounder (location, décor, the kind of customer) is still there.',
      2: 'Holding one variable fixed removes one alternative. Others (the managers who choose music may also run better branches) remain.',
      3: 'Managers chose the volume, so the loudest branches may differ in other ways too; a gradient helps but can’t rule out confounding.',
    },
    solution: 'Assigning music by lot, day by day within each branch, means nothing else differs systematically between music and silent days, so a difference in sales per customer can be put down to the music (or chance, which a test handles). Larger samples, partial correlations and gradients in observational data strengthen a case but leave confounders standing.',
  },
];

// The score for each entry is over all the items of the modules before it, and the highest entry passed wins. Modules
// 1–3 score each item 0 or 1, and every entry asks for all the earlier items right: a student who misses any item of
// modules 1–3 starts no later than that item’s module.
export const route = [{ module: 2, ifAtLeast: 1 }, { module: 3, ifAtLeast: 1 }, { module: 4, ifAtLeast: 1 }];
