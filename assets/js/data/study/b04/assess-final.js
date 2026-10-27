// assess-final.js — B04 final assessment: 24 questions across all four modules, two or three per lesson (six for module
// 1, seven for module 2, five for module 3 and six for module 4). 70% passes.
// Mixed conceptual, numerical and applied items; nine are formula items on small worksheets using Excel’s statistical
// functions (and four more formula steps), with the inputs a formula should read (a hypothesised value, a cut-off, a
// confidence level, a category label) varied on the marking copies, so that typed results and typed inputs fail.
// Several combine skills: a lookup inside a conditional probability (b04-fn-4), a normal model inside a binomial count
// (b04-fn-7), why a normal model holds for a sample mean, then its cut-off (b04-fn-9), a t interval for one category of a table
// (b04-fn-11), checking a proportion’s conditions before choosing its interval (b04-fn-12), power read as the chance of a
// Type II error (b04-fn-15), an interval read as a test (b04-fn-16), checking conditions, then choosing, running (on
// data by team, with FILTER) and estimating with a two-sample test (b04-fn-17), a paired test rebuilt from a correlation (b04-fn-18), a Poisson model
// fitted, tested and read (b04-fn-19), expected counts built inside CHISQ.TEST (b04-fn-21) and the spread rule before an
// ANOVA (b04-fn-24).
// New questions on businesses used nowhere else on the site, not copies of lesson exercises, module tests, the
// diagnostic or the project, and nothing from the project’s data or scenarios. No hints; solutions are shown on review.
// Every business, record and number is fictional; every num item’s `check` recomputes its answer, and every formula item
// is marked by its results.
import * as I from '../../../core/inference.js?v=22';
import { mean, sd, quantile, skewness } from '../../../core/stats.js?v=22';

const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const r = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const neg = (v, d = 2) => `${v < 0 ? '−' : ''}${fx(Math.abs(v), d)}`;
const pc = (v, d = 1) => `${fx(v * 100, d)}%`;
const usd = (v, d = 0) => `$${fx(v, d)}`;
const sum = (a) => a.reduce((s, x) => s + x, 0);

// ---------------------------------------------------------------- data (all fictional)
// Thistlewood Joinery: March’s 20 invoices, the largest ($1,480) typed as $14,800
const TYPO = [620, 845, 980, 1120, 760, 1340, 905, 1015, 690, 1210, 870, 14800, 935, 1095, 780, 1260, 1050, 960, 1130, 815];
const FIXED = TYPO.map((x) => (x === 14800 ? 1480 : x));
const trim10 = (a) => mean([...a].sort((x, y) => x - y).slice(1, -1));   // TRIMMEAN(…,0.1) of 20 values drops one from each end
const iqr = (a) => quantile(a, 0.75) - quantile(a, 0.25);
const zMin = (a) => (Math.min(...a) - mean(a)) / sd(a);
// Wychwood Driving School: 24 mock theory-test scores out of 50
const SCORES = [38, 42, 45, 41, 44, 47, 39, 43, 45, 46, 42, 44, 40, 45, 48, 43, 44, 36, 45, 41, 49, 44, 43, 46];
const below = (x) => SCORES.filter((v) => v < x).length, equal = (x) => SCORES.filter((v) => v === x).length;
const prank = (x) => ((below(x) + 0.5 * equal(x)) / SCORES.length) * 100;
// Fixpoint Phone Repairs: three screen suppliers
const SUPPLY = [['P', 0.5, 0.01], ['Q', 0.3, 0.02], ['R', 0.2, 0.05]];
const pFail = sum(SUPPLY.map(([, s, f]) => s * f));
// Snowgate Ski Hire: rentals by package and insurance
const SKI = [['Day', 84, 196], ['Weekend', 72, 108], ['Week', 66, 54]];
const skiIns = sum(SKI.map((x) => x[1])), skiAll = sum(SKI.map((x) => x[1] + x[2]));
const skiP = (name) => { const x = SKI.find((s) => s[0] === name); return x[1] / (x[1] + x[2]); };
// Redshank Tiles: sample 50, accept at most 2 cracked, 3% cracked
const TILE = { p: 0.03, n: 50, c: 2 };
// Harrowfield Labels: rolls of 2,000, p = 0.0015
const ROLL = { n: 2000, p: 0.0015 };
// Heathercombe Honey: N(346, 4) g, label 340 g, 10 jars, act on 2 or more light jars
const JAR = { mean: 346, sd: 4, label: 340, n: 10, k: 2 };
const pLight = I.normal.cdf(JAR.label, JAR.mean, JAR.sd);
// Kelso Taxis: 10% under 18 minutes, 10% over 30
const TAXI = { lo: 18, hi: 30 };
const taxiSd = (TAXI.hi - TAXI.lo) / 2 / I.normInv(0.9);
// Tregarth Labs: tablets 250 mg, SD 3.2 mg, samples of 8, 2.5% warning limit
const TAB = { mean: 250, sd: 3.2, n: 8, tail: 0.025 };
const tabSe = TAB.sd / Math.sqrt(TAB.n), tabLimit = I.normal.inv(TAB.tail, TAB.mean, tabSe);
// Moorhen Fish Bar: 20 orders, type and minutes from order to collection
const ORDER_TYPE = ['eat in', 'takeaway', 'takeaway', 'eat in', 'takeaway', 'eat in', 'takeaway', 'takeaway', 'eat in', 'takeaway',
  'eat in', 'takeaway', 'takeaway', 'eat in', 'takeaway', 'eat in', 'takeaway', 'takeaway', 'eat in', 'takeaway'];
const ORDER_MIN = [14.2, 9.8, 11.5, 16.1, 10.4, 13.5, 12.2, 8.9, 15.4, 10.9, 17.2, 11.8, 9.5, 14.8, 12.6, 13.9, 10.1, 11.1, 15.9, 9.2];
const ofType = (t) => ORDER_MIN.filter((_, i) => ORDER_TYPE[i] === t);
const CI_EAT = I.ciMean(ofType('eat in')), CI_TAKE = I.ciMean(ofType('takeaway')), CI_ALL = I.ciMean(ORDER_MIN);
// Quillmere Dental: 5 of 80 patients reported pain
const PAIN = { x: 5, n: 80 };
const WALD = I.ciProp(PAIN.x, PAIN.n), WILSON = I.ciProp(PAIN.x, PAIN.n, 0.95, 'wilson');
// Yewdale Water: ±15 litres at 99%, planning SD 120 litres
const WATER = { sd: 120, E: 15 };
// Brambleton Housing Association: 120 repairs (73 on time) against a benchmark
const REPAIRS = Array.from({ length: 120 }, (_, i) => (((i * 37 + 11) % 120) < 73 ? 'on time' : 'late'));
const onTime = REPAIRS.filter((x) => x === 'on time').length;
const REP = I.propTest1(onTime, REPAIRS.length, 0.7);
const repFlip = {};
[['on time', 'late', 4], ['late', 'on time', 1]].forEach(([from, to, k]) => {
  REPAIRS.map((x, i) => [x, i]).filter(([x]) => x === from).slice(0, k).forEach(([, i]) => { repFlip[`B${i + 2}`] = [to]; });
});
// Starcross Kitchens: δ = 2 hours, σ = 6, n = 50, two-sided α = 0.05
const KIT = { delta: 2, sigma: 6, n: 50 };
const kitPower = I.powerMean({ delta: KIT.delta, sigma: KIT.sigma, n: KIT.n });
// Upwell Library: 25 loans, mean 16.4 days, SD 5.0
const LOAN = { n: 25, mean: 16.4, sd: 5.0 };
const loanT = I.tInv(0.975, LOAN.n - 1), loanSe = LOAN.sd / Math.sqrt(LOAN.n);
const loanLo = LOAN.mean - loanT * loanSe, loanHi = LOAN.mean + loanT * loanSe;
const CLAIMS = [14, 15, 18, 19, 21];
// Arncliffe Window Fitters: hours per job, North (9 jobs) and South (14 jobs)
const NORTH = [5.2, 7.9, 4.1, 9.6, 6.3, 3.8, 8.7, 5.9, 10.4];
const SOUTH = [5.1, 5.6, 4.8, 5.9, 6.2, 5.3, 4.9, 5.7, 6.0, 5.4, 5.5, 6.1, 4.7, 5.8];
const WEL = I.tTest2(NORTH, SOUTH), POOL = I.tTest2(NORTH, SOUTH, { equalVar: true });
const TEAM_ORDER = 'SNSSNSNSSNSNSSNSNSNSSNS'.split('');           // the jobs in date order: 9 North, 14 South
const teamCells = (() => {
  const c = { A1: 'Team', B1: 'Hours', D1: 'p-value' };
  let n = 0, k = 0;
  TEAM_ORDER.forEach((t, i) => { c[`A${i + 2}`] = t === 'N' ? 'North' : 'South'; c[`B${i + 2}`] = t === 'N' ? NORTH[n++] : SOUTH[k++]; });
  return c;
})();
const welLoTrunc = WEL.diff - I.tInv(0.975, Math.floor(WEL.df)) * WEL.se;
// Skelwith Supermarket: 16 cashiers before and after training (summary only)
const TILL = { n: 16, m1: 52.0, s1: 9.0, m2: 48.5, s2: 8.6, r: 0.92 };
const tillSd = Math.sqrt(TILL.s1 ** 2 + TILL.s2 ** 2 - 2 * TILL.r * TILL.s1 * TILL.s2);
const tillT = (TILL.m1 - TILL.m2) / (tillSd / Math.sqrt(TILL.n));
// Gatehouse Locksmiths: call-outs on 120 nights (8 nights had 4 call-outs and 3 had 5: 193 in all)
const NIGHTS = [27, 35, 30, 17, 11], CALLOUTS = 0 * 27 + 35 + 2 * 30 + 3 * 17 + 8 * 4 + 3 * 5, NNIGHTS = sum(NIGHTS);
const LAM = r(CALLOUTS / NNIGHTS, 4);
const EXP_N = [0, 1, 2, 3].map((k) => NNIGHTS * I.poissonPmf(k, LAM)).concat(NNIGHTS * I.poissonSf(3, LAM));
const FIT = I.chisqGof(NIGHTS, EXP_N, { ddof: 1 }), FIT_NAIVE = I.chisqGof(NIGHTS, EXP_N);
const lockCells = {
  A1: 'Call-outs', B1: 'Nights (O)', C1: 'Expected (E)', ...col('A', 2, [0, 1, 2, 3, 4]), ...col('B', 2, NIGHTS), A7: 'Total', B7: '=SUM(B2:B6)',
  E1: 'Nights', F1: '=B7', E2: 'λ (call-outs a night)', F2: LAM,
};
// Ingleby Print Works: misprints on presses A and B
const PRESS = I.propTest2(58, 1200, 41, 1300, { alternative: 'greater' }), PRESS2 = I.propTest2(58, 1200, 41, 1300);
// Calderbrook Leisure: renewals by membership type
const MEMBER = [[96, 210, 128], [64, 90, 32]];
const IND = I.chisqIndependence(MEMBER);
// Rowan Street Market: one stall’s Saturday takings by pitch
const ENTRANCE = [598, 655, 570, 701, 622, 676], AISLE = [548, 612, 575, 530, 640, 566, 599], BACK = [512, 590, 498, 571, 525];
const PITCH = I.anova1([ENTRANCE, AISLE, BACK]);
// Jessamine Paints: six pairwise p-values after a significant ANOVA
const PAIRS = [['W–X', 0.004, '0.004'], ['W–Y', 0.030, '0.030'], ['W–Z', 0.21, '0.21'], ['X–Y', 0.62, '0.62'], ['X–Z', 0.006, '0.006'], ['Y–Z', 0.12, '0.12']];
const bonf = 0.05 / PAIRS.length;
// Millbeck Garages: service hours at three branches (summary)
const GAR = [['Northgate', 8, 2.40, 0.30], ['Quarry Road', 10, 2.75, 0.35], ['Riverside', 12, 2.55, 0.32]];
const garN = sum(GAR.map((g) => g[1])), garGrand = sum(GAR.map((g) => g[1] * g[2])) / garN;
const garSsb = sum(GAR.map((g) => g[1] * (g[2] - garGrand) ** 2)), garSsw = sum(GAR.map((g) => (g[1] - 1) * g[3] ** 2));
const garF = (ssb, ssw, df1 = 2, df2 = garN - 3) => (ssb / df1) / (ssw / df2);

export const items = [
  // ================================================================ Module 1: describing data and chance
  {
    id: 'b04-fn-1', lesson: 'describing-distributions', type: 'classify', kind: 'conceptual',
    prompt: 'Thistlewood Joinery (fictional) summarised its 20 invoices for March before anyone noticed that the largest, $1,480, had been typed as $14,800. When the typo is corrected ($1,480 is still the largest invoice), what happens to each statistic?',
    items: [
      'The mean',
      'The median',
      'The standard deviation',
      'The interquartile range',
      'The range',
      'The 10% trimmed mean (TRIMMEAN with 0.1)',
      'The coefficient of variation',
      'How many standard deviations the smallest invoice lies below the mean',
      'The skewness (Excel’s SKEW)',
    ],
    categories: ['Falls', 'Stays the same', 'Rises'],
    answer: [0, 1, 0, 1, 0, 1, 0, 2, 0],
    feedback: {
      1: 'The median depends only on the middle of the sorted values. The typo was in the largest value, which stays the largest.',
      3: 'Q1 and Q3 are the 25th and 75th percentiles of the sorted invoices; the largest invoice affects neither, before or after the correction.',
      5: 'With 20 invoices, TRIMMEAN(…,0.1) leaves out 2 values, one from each end. The largest invoice is left out either way, so the trimmed mean doesn’t change.',
      6: `Both the mean and the standard deviation fall, but the standard deviation far more, so the CV falls from ${pc(sd(TYPO) / mean(TYPO), 0)} to ${pc(sd(FIXED) / mean(FIXED), 0)}.`,
      7: `The typo inflated the standard deviation so much that the smallest invoice looked ordinary (z ≈ ${neg(zMin(TYPO))}). Corrected, it lies ${fx(-zMin(FIXED))} standard deviations below the mean.`,
      8: `One huge value made the invoices look extremely right-skewed (SKEW ${fx(skewness(TYPO), 2)}); corrected, SKEW is ${fx(skewness(FIXED), 2)}, a mild right skew.`,
    },
    solution: `With the typo and corrected: mean ${usd(mean(TYPO))} → ${usd(mean(FIXED))}; standard deviation ${usd(sd(TYPO))} → ${usd(sd(FIXED))}; range ${usd(Math.max(...TYPO) - Math.min(...TYPO))} → ${usd(Math.max(...FIXED) - Math.min(...FIXED))}; CV ${pc(sd(TYPO) / mean(TYPO), 0)} → ${pc(sd(FIXED) / mean(FIXED), 0)}; SKEW ${fx(skewness(TYPO), 2)} → ${fx(skewness(FIXED), 2)}. The median (${usd(quantile(FIXED, 0.5))}), the IQR (${usd(iqr(FIXED))}) and the 10% trimmed mean (${usd(trim10(FIXED), 2)}) don’t move, because they never used the largest value’s size. The smallest invoice goes from ${fx(-zMin(TYPO))} to ${fx(-zMin(FIXED))} standard deviations below the mean: one extreme value can hide how unusual the others are. That is why resistant summaries are the safer description when an outlier is suspected, and why the typo should be fixed at source.`,
  },
  {
    id: 'b04-fn-2', lesson: 'describing-distributions', type: 'formula', kind: 'numerical',
    prompt: 'Wychwood Driving School (fictional) has its 24 learners’ mock theory-test scores (out of 50) in B2:B25, and E1 holds one learner’s score. In E2, calculate that score’s percentile rank by OpenStax’s formula: the number of scores below it plus half the number equal to it, divided by the number of scores, times 100.',
    sheet: {
      cells: { A1: 'Learner', B1: 'Score', D1: 'Score', E1: 44, D2: 'Percentile rank', ...col('A', 2, SCORES.map((_, i) => `L${String(i + 1).padStart(2, '0')}`)), ...col('B', 2, SCORES) },
      vary: { E1: [41, 43, 45] },
    },
    cell: 'E2', view: 'A1:E25', maxHeight: '20rem', formats: { E2: '0.0' }, widths: { D: 15 },
    answer: '=(COUNTIF(B2:B25,"<"&E1)+0.5*COUNTIF(B2:B25,E1))/COUNT(B2:B25)*100',
    alt: [
      '=(COUNTIF(B2:B25,"<"&E1)+COUNTIF(B2:B25,E1)/2)/COUNT(B2:B25)*100',
      '=100*(COUNTIF(B2:B25,"<"&E1)+0.5*COUNTIF(B2:B25,"="&E1))/COUNT(B2:B25)',
      '=(SUMPRODUCT(--(B2:B25<E1))+0.5*SUMPRODUCT(--(B2:B25=E1)))/COUNT(B2:B25)*100',
      '=(COUNTIF(B2:B25,"<"&E1)+0.5*COUNTIF(B2:B25,E1))/24*100',
    ],
    wrong: [
      { formula: '=PERCENTRANK.INC(B2:B25,E1)*100', say: 'PERCENTRANK.INC is Excel’s measure: for a score in the data, the number of scores below it divided by n − 1, cut to three digits, with no half-credit for ties. The question asks for OpenStax’s (B + 0.5E) ÷ n × 100.' },
      { formula: '=COUNTIF(B2:B25,"<"&E1)/COUNT(B2:B25)*100', say: 'That counts only the scores below. OpenStax’s formula adds half the scores equal to E1, which matters here because four learners scored 44.' },
      { formula: '=COUNTIF(B2:B25,"<="&E1)/COUNT(B2:B25)*100', say: 'That counts every tied score in full. The formula counts half of them: + 0.5 × COUNTIF(B2:B25,E1).' },
      { formula: '=(COUNTIF(B2:B25,"<"&E1)+0.5*COUNTIF(B2:B25,E1))/COUNT(B2:B25)', say: 'That is the fraction. The question asks for the percentile rank, times 100.' },
    ],
    solution: `<x>=(COUNTIF(B2:B25,"<"&E1)+0.5*COUNTIF(B2:B25,E1))/COUNT(B2:B25)*100</x>. For a score of 44: ${below(44)} scores are below it and ${equal(44)} equal it, so (${below(44)} + 0.5 × ${equal(44)}) ÷ 24 × 100 = ${fx(prank(44), 1)}: the learner sits at about the 54th percentile. Excel’s PERCENTRANK.INC would give ${below(44)} ÷ 23 = ${fx(below(44) / 23, 3)}, because it divides by n − 1 and ignores the ties; with scores this tied, say which definition you used.`,
  },
  {
    id: 'b04-fn-3', lesson: 'probability', type: 'num', kind: 'applied',
    prompt: 'Fixpoint Phone Repairs (fictional) buys replacement screens from three suppliers: 50% from supplier P, 30% from supplier Q and 20% from supplier R. Within a month of fitting, 1% of P’s screens fail, 2% of Q’s and 5% of R’s. A customer brings back a screen that failed within a month. What is the probability that it came from supplier R? Give three decimal places.',
    answer: r((0.2 * 0.05) / pFail, 3),
    check: () => (0.2 * 0.05) / (0.5 * 0.01 + 0.3 * 0.02 + 0.2 * 0.05),
    unit: '', places: 3, tol: 0.0015,
    wrong: [
      { value: 0.05, say: 'That is P(fail | R), the share of R’s screens that fail. The question asks the reverse, P(R | fail), which depends on how many screens each supplier provides.' },
      { value: 0.2, say: 'That is R’s share of all screens, before you know the screen failed. The failure is evidence: R’s screens fail more often, so its share of failed screens is larger.' },
      { value: 0.01, say: 'That is the joint probability that a screen is from R and fails, 0.2 × 0.05. Divide it by the probability that any screen fails.' },
      { value: r(pFail, 3), say: 'That is the probability that a screen fails, from all three suppliers together. It is the denominator of Bayes’ rule.' },
      { value: r(0.05 / (0.01 + 0.02 + 0.05), 3), say: 'That compares the three failure rates without weighting each by its supplier’s share of the screens. Weight first: 0.5 × 0.01, 0.3 × 0.02 and 0.2 × 0.05.' },
    ],
    solution: `By the law of total probability, P(fail) = 0.5 × 0.01 + 0.3 × 0.02 + 0.2 × 0.05 = ${fx(pFail, 3)}. Bayes’ rule: P(R | fail) = 0.2 × 0.05 ÷ ${fx(pFail, 3)} = ${fx((0.2 * 0.05) / pFail, 3)}. In natural frequencies, of 1,000 screens 500 come from P and 5 fail, 300 from Q and 6 fail, 200 from R and 10 fail: 10 of the 21 failures are R’s. Supplier R provides a fifth of the screens but almost half of the failures.`,
  },
  {
    id: 'b04-fn-4', lesson: 'probability', type: 'formula', kind: 'applied',
    prompt: 'Snowgate Ski Hire (fictional) counted last season’s rentals by package and by whether the customer bought insurance: the counts are in B2:C4, with totals in column D and row 5. G1 holds a package. In G2, calculate the probability that a rental of that package was insured, P(insured | package), in a formula that still works when G1 names another package.',
    sheet: {
      cells: {
        A1: 'Package', B1: 'Insured', C1: 'Not insured', D1: 'Total',
        ...col('A', 2, SKI.map((s) => s[0])), ...col('B', 2, SKI.map((s) => s[1])), ...col('C', 2, SKI.map((s) => s[2])),
        D2: '=B2+C2', D3: '=B3+C3', D4: '=B4+C4', A5: 'Total', B5: '=SUM(B2:B4)', C5: '=SUM(C2:C4)', D5: '=SUM(D2:D4)',
        F1: 'Package', G1: 'Weekend', F2: 'P(insured | package)',
      },
      vary: { G1: ['Day', 'Week'] },
    },
    cell: 'G2', view: 'A1:G5', formats: { G2: '0.000' }, widths: { C: 12, F: 20, G: 10 },
    answer: '=XLOOKUP(G1,A2:A4,B2:B4)/XLOOKUP(G1,A2:A4,D2:D4)',
    alt: [
      '=INDEX(B2:B4,MATCH(G1,A2:A4,0))/INDEX(D2:D4,MATCH(G1,A2:A4,0))',
      '=SUMIFS(B2:B4,A2:A4,G1)/SUMIFS(D2:D4,A2:A4,G1)',
      '=SUMIF(A2:A4,G1,B2:B4)/SUMIF(A2:A4,G1,D2:D4)',
      '=VLOOKUP(G1,A2:D4,2,FALSE)/VLOOKUP(G1,A2:D4,4,FALSE)',
      '=XLOOKUP(G1,A2:A4,B2:B4)/(XLOOKUP(G1,A2:A4,B2:B4)+XLOOKUP(G1,A2:A4,C2:C4))',
    ],
    wrong: [
      { formula: '=XLOOKUP(G1,A2:A4,B2:B4)/D5', say: 'Dividing by all rentals gives the joint probability, P(insured and package). The condition “given the package” keeps only that package’s rentals: divide by its row total.' },
      { formula: '=XLOOKUP(G1,A2:A4,B2:B4)/B5', say: 'That divides by all insured rentals: it is P(package | insured), the package’s share of insured rentals. The question conditions on the package.' },
      { formula: '=B5/D5', say: 'That is P(insured) over all rentals, whatever the package. The question asks for the share within the package named in G1.' },
      { formula: '=B3/D3', say: 'That is the Weekend row only, so it stops being right when G1 names another package. Look the package up from G1.' },
    ],
    solution: `<x>=XLOOKUP(G1,A2:A4,B2:B4)/XLOOKUP(G1,A2:A4,D2:D4)</x>: the insured rentals of the package divided by all rentals of that package. Weekend: 72 ÷ 180 = ${fx(skiP('Weekend'), 3)}; Day ${fx(skiP('Day'), 3)}; Week ${fx(skiP('Week'), 3)}; all rentals ${skiIns} ÷ ${skiAll} = ${fx(skiIns / skiAll, 3)}. Because P(insured | package) changes with the package, insurance and package are not independent in these rentals: week-long renters insure most. That is an association in last season’s counts; whether it is more than chance is a chi-square test’s question, and it doesn’t show that the package causes the choice.`,
  },
  {
    id: 'b04-fn-5', lesson: 'discrete-distributions', type: 'formula', kind: 'applied',
    prompt: 'Redshank Tiles (fictional) accepts a delivery from its supplier if a random sample of B2 tiles contains no more than B3 cracked ones. The supplier says the share of cracked tiles in its deliveries is the figure in B1. In B5, calculate the probability that a delivery with that share of cracked tiles is accepted.',
    sheet: { cells: { A1: 'Share of tiles cracked', B1: TILE.p, A2: 'Tiles sampled', B2: TILE.n, A3: 'Most cracked tiles accepted', B3: TILE.c, A5: 'P(delivery accepted)' }, vary: { B1: [0.02, 0.05, 0.08], B3: [1, 3] } },
    cell: 'B5', view: 'A1:B5', formats: { B1: '0.00', B5: '0.0000' }, widths: { A: 26 },
    answer: '=BINOM.DIST(B3,B2,B1,TRUE)',
    alt: ['=BINOM.DIST.RANGE(B2,B1,0,B3)', '=1-BINOM.DIST.RANGE(B2,B1,B3+1,B2)', '=BINOM.DIST(B3,B2,B1,1)'],
    wrong: [
      { formula: '=BINOM.DIST(B3,B2,B1,FALSE)', say: 'FALSE gives the probability of exactly B3 cracked tiles. “No more than B3” includes 0, 1 and 2 as well: TRUE.' },
      { formula: '=1-BINOM.DIST(B3,B2,B1,TRUE)', say: 'That is the probability of more than B3 cracked tiles, so of rejecting the delivery. BINOM.DIST with TRUE is already the chance of B3 or fewer.' },
      { formula: '=BINOM.DIST(B3-1,B2,B1,TRUE)', say: 'That is the probability of fewer than B3 cracked tiles. “No more than B3” includes B3 itself.' },
      { formula: '=BINOM.DIST(B3,B2,1-B1,TRUE)', say: 'B1 is the share cracked, and cracked tiles are what the count counts. Use B1 as probability_s, not 1 − B1.' },
    ],
    solution: `The number of cracked tiles in the sample is binomial with n = ${TILE.n} and p = ${TILE.p}: the tiles are drawn at random from a large delivery, so they are close to independent. <x>=BINOM.DIST(B3,B2,B1,TRUE)</x> = P(X ≤ 2) = ${fx(I.binomCdf(TILE.c, TILE.n, TILE.p), 4)}. A delivery at the stated 3% is accepted about four times in five. If the true share were 8%, the same plan would accept it with probability ${fx(I.binomCdf(TILE.c, TILE.n, 0.08), 3)}: it catches a bad delivery about three times in four.`,
  },
  {
    id: 'b04-fn-6', lesson: 'discrete-distributions', type: 'multi', kind: 'conceptual',
    prompt: 'Harrowfield Labels (fictional) prints barcode labels in rolls of 2,000. Each label is unreadable with probability 0.0015, and the firm wants a model for the number of unreadable labels on a roll. Select all the statements that are true.',
    options: [
      'If labels fail independently, the count on a roll is binomial with n = 2,000 and p = 0.0015.',
      'A Poisson distribution with mean 3 approximates that binomial closely, as n is large and p small.',
      'If a worn print head makes bad labels come in runs, both models understate the risk of a bad roll.',
      'The Poisson distribution can be used only when its mean is at least 5, so it doesn’t suit a mean of 3.',
      'A normal curve with mean 3 fits the count well, because each roll holds as many as 2,000 labels.',
      'The standard deviation of the count is 2,000 × 0.0015 = 3 unreadable labels on a typical roll.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'The Poisson distribution has no minimum mean. It approximates the binomial well when n is large and p is small, as here.',
      4: 'np = 3 is far below the 5 or 10 that the normal approximation needs: the count is right-skewed and can’t fall below 0.',
      5: 'np = 3 is the mean (and, very nearly, the variance). The standard deviation is √(np(1 − p)) = √2.9955 ≈ 1.73.',
    },
    solution: `A fixed number of labels, each readable or not with the same p, independently: binomial(2,000, 0.0015), with mean np = 3 and standard deviation √(np(1 − p)) ≈ ${fx(Math.sqrt(ROLL.n * ROLL.p * (1 - ROLL.p)), 2)}. With n large and p small it is close to a Poisson with λ = np = 3: P(3 or more unreadable labels) is ${fx(I.binomSf(2, ROLL.n, ROLL.p), 4)} by the binomial and ${fx(I.poissonSf(2, 3), 4)} by the Poisson. Both models assume independence: a fault that spoils labels in runs makes rolls with many bad labels more common than either predicts, the overdispersion a variance above the mean would show.`,
  },

  // ================================================================ Module 2: from samples to populations
  {
    id: 'b04-fn-7', lesson: 'normal-distribution', type: 'formula', kind: 'applied',
    prompt: 'Heathercombe Honey (fictional) fills jars labelled with the weight in B3. Fill weights are roughly normal, with the mean and standard deviation in B1 and B2 (grams). An inspector from its largest retail customer weighs B4 jars chosen at random and acts if at least B5 of them weigh less than the label weight. In B7, calculate the probability that the inspector acts.',
    sheet: {
      cells: { A1: 'Mean fill (g)', B1: JAR.mean, A2: 'SD of fill (g)', B2: JAR.sd, A3: 'Label weight (g)', B3: JAR.label, A4: 'Jars weighed', B4: JAR.n, A5: 'Light jars that trigger action', B5: JAR.k, A7: 'P(inspector acts)' },
      vary: { B1: [344, 348], B3: [338, 341], B5: [1, 3] },
    },
    cell: 'B7', view: 'A1:B7', formats: { B7: '0.0000' }, widths: { A: 30 },
    answer: '=1-BINOM.DIST(B5-1,B4,NORM.DIST(B3,B1,B2,TRUE),TRUE)',
    alt: ['=BINOM.DIST.RANGE(B4,NORM.DIST(B3,B1,B2,TRUE),B5,B4)', '=1-BINOM.DIST(B5-1,B4,NORM.S.DIST((B3-B1)/B2,TRUE),TRUE)'],
    wrong: [
      { formula: '=1-BINOM.DIST(B5,B4,NORM.DIST(B3,B1,B2,TRUE),TRUE)', say: 'That is the probability of more than B5 light jars. “At least B5” includes B5 itself: subtract P(at most B5 − 1).' },
      { formula: '=1-BINOM.DIST(B5-1,B4,NORM.DIST(B3,B1,B2,FALSE),TRUE)', say: 'NORM.DIST with FALSE gives the height of the density curve, not the share of jars under the label. Use TRUE for the area below B3.' },
      { formula: '=1-BINOM.DIST(B5-1,B4,1-NORM.DIST(B3,B1,B2,TRUE),TRUE)', say: '1 − NORM.DIST(B3, …, TRUE) is the share of jars above the label. A light jar weighs less than B3: the area below.' },
      { formula: '=NORM.DIST(B3,B1,B2,TRUE)', say: 'That is the chance that one jar is light. The inspector acts on the number of light jars among B4: a binomial count with that probability.' },
    ],
    solution: `Two models in turn. First the normal model for one jar: p = P(jar under 340 g) = <x>=NORM.DIST(B3,B1,B2,TRUE)</x>, z = (340 − 346) ÷ 4 = −1.5, p = ${fx(pLight, 4)}. Then the number of light jars among 10 chosen at random is binomial(10, ${fx(pLight, 4)}), and P(at least 2) = 1 − P(at most 1): <x>=1-BINOM.DIST(B5-1,B4,NORM.DIST(B3,B1,B2,TRUE),TRUE)</x> = ${fx(I.binomSf(JAR.k - 1, JAR.n, pLight), 4)}. Even with the mean 6 g above the label, about one inspection in seven finds two or more light jars, a reason to raise the mean or reduce the spread. The answer leans on the normal model’s lower tail, so it is only as good as the fit there.`,
  },
  {
    id: 'b04-fn-8', lesson: 'normal-distribution', type: 'num', kind: 'numerical',
    prompt: 'Kelso Taxis (fictional) finds that its journeys from the station to the airport take roughly normal times: 10% take less than 18 minutes and 10% take more than 30 minutes. What is the standard deviation of the journey time? Give minutes to two decimal places.',
    answer: r(taxiSd, 2),
    check: () => 6 / I.normInv(0.9),
    unit: 'minutes', places: 2, tol: 0.011,
    wrong: [
      { value: 6, say: '6 minutes is the distance from the mean (24) to the 90th percentile (30). That distance is 1.28 standard deviations, not one: divide by NORM.S.INV(0.9).' },
      { value: r(6 / I.normInv(0.975), 2), say: '1.96 leaves 2.5% in each tail. Here each tail holds 10%, so the z is NORM.S.INV(0.9) = 1.28.' },
      { value: r(6 / I.normInv(0.95), 2), say: '1.645 leaves 5% in each tail. Here each tail holds 10%: z = 1.28.' },
      { value: r(12 / I.normInv(0.9), 2), say: 'The 12 minutes from 18 to 30 span 1.28 standard deviations on each side of the mean, 2.56 in all. Divide 6, not 12, by 1.28.' },
    ],
    solution: `The two cut-offs are equally far into the tails, so the mean is halfway between them: 24 minutes. 30 minutes is the 90th percentile, so 30 = 24 + z × σ with z = <x>=NORM.S.INV(0.9)</x> = ${fx(I.normInv(0.9), 4)}, and σ = 6 ÷ ${fx(I.normInv(0.9), 4)} = ${fx(taxiSd, 2)} minutes. Check: <x>=NORM.DIST(18,24,4.68,TRUE)</x> ≈ 0.10.`,
  },
  {
    id: 'b04-fn-9', lesson: 'sampling-distributions', type: 'steps', kind: 'applied',
    prompt: `Tregarth Labs (fictional) presses tablets whose weights are roughly normal, with a mean of ${TAB.mean} mg and a standard deviation of ${TAB.sd} mg when the press is set correctly. Every hour it weighs a random sample of ${TAB.n} tablets and checks their mean.`,
    steps: [
      {
        id: 'b04-fn-9-s1', type: 'mc',
        prompt: 'Why can the normal model be used for the mean of 8 tablets?',
        options: [
          'Tablet weights are roughly normal, so the mean of any number of tablets is normal too',
          'The central limit theorem makes the mean of 8 tablets normal whatever the weights’ shape',
          'Knowing the standard deviation of one tablet makes the distribution of the mean normal',
          'A correctly set press centres the hourly means on 250 mg, so their distribution is normal',
        ],
        answer: 0,
        feedback: {
          1: 'The central limit theorem says the mean gets closer to normal as n grows; 8 values are far too few to rely on it for a skewed shape. The model works here because the weights themselves are roughly normal.',
          2: 'The standard deviation sets the standard error, σ ÷ √n, but says nothing about shape: the mean of 8 values from a skewed distribution is still skewed.',
          3: 'Centring says where the means lie, not what shape their distribution has. The shape comes from the weights being roughly normal.',
        },
        solution: 'When the population is normal, the sample mean is exactly normal for any sample size. Eight tablets are too few for the central limit theorem to rescue a skewed shape, so the model rests on the weights being roughly normal, which the lab should check.',
      },
      {
        id: 'b04-fn-9-s2', type: 'formula',
        prompt: 'B1 to B3 hold the mean and standard deviation of one tablet’s weight and the number of tablets in a sample. In B6, calculate the lower warning limit: the sample mean below which a correctly set press would fall only with the probability in B4.',
        sheet: { cells: { A1: 'Mean tablet weight (mg)', B1: TAB.mean, A2: 'SD of one tablet (mg)', B2: TAB.sd, A3: 'Tablets in a sample', B3: TAB.n, A4: 'Probability below the limit', B4: TAB.tail, A6: 'Lower warning limit (mg)' }, vary: { B4: [0.01, 0.005, 0.05] } },
        cell: 'B6', view: 'A1:B6', formats: { B4: '0.000', B6: '0.00' }, widths: { A: 26 },
        answer: '=NORM.INV(B4,B1,B2/SQRT(B3))',
        alt: ['=B1+NORM.S.INV(B4)*B2/SQRT(B3)', '=B1-NORM.S.INV(1-B4)*B2/SQRT(B3)', '=NORM.INV(B4,B1,B2/B3^0.5)'],
        wrong: [
          { formula: '=NORM.INV(B4,B1,B2)', say: 'That is the limit for a single tablet. The mean of B3 tablets varies much less, with the standard error B2 ÷ √B3.' },
          { formula: '=NORM.INV(B4,B1,B2/B3)', say: 'The standard error of a mean divides σ by √n, not by n.' },
          { formula: '=NORM.INV(1-B4,B1,B2/SQRT(B3))', say: 'That is the upper warning limit, with B4 of the area above it. NORM.INV takes the area below the value: B4 for a lower limit.' },
          { formula: '=NORM.DIST(B4,B1,B2/SQRT(B3),TRUE)', say: 'NORM.DIST goes from a value to a probability. Here the probability is given and the value is wanted: NORM.INV.' },
        ],
        solution: `The mean of 8 tablets has standard error 3.2 ÷ √8 = ${fx(tabSe, 3)} mg. <x>=NORM.INV(B4,B1,B2/SQRT(B3))</x> = 250 − 1.96 × ${fx(tabSe, 3)} = ${fx(tabLimit, 2)} mg.`,
      },
    ],
    solution: `Because tablet weights are roughly normal, the mean of 8 is normal with standard error 3.2 ÷ √8 = ${fx(tabSe, 3)} mg, and the warning limit is <x>=NORM.INV(B4,B1,B2/SQRT(B3))</x> = ${fx(tabLimit, 2)} mg. A single tablet lighter than that is common (about ${pc(I.normal.cdf(tabLimit, TAB.mean, TAB.sd), 0)} of tablets), so the limit is for hourly means only. With a 2.5% limit, a correctly set press gives a false warning about once in 40 hours.`,
  },
  {
    id: 'b04-fn-10', lesson: 'sampling-distributions', type: 'mc', kind: 'conceptual',
    prompt: 'Mapplewell Hotel (fictional) wants to estimate its average occupancy over the last two years by sampling nights from its booking system. The plan: pick a night at random in the first week, then take every 7th night after it, about 104 nights in all. What is the main risk in this plan?',
    options: [
      'Every sampled night falls on the same weekday, so the weekly pattern biases the estimate.',
      'About 104 nights is too few, being only one night in seven over the two years.',
      'A systematic sample always needs the finite population correction, or its standard error is wrong.',
      'Nights close together resemble each other, so the sample loses information, as a cluster sample does.',
    ],
    answer: 0,
    feedback: {
      1: '104 nights would be plenty if they represented the two years: the standard error depends on the number of nights. The trouble is which nights are chosen.',
      2: 'The correction depends on the share of the population sampled (about 14% here) and adjusts the standard error. It can’t remove a bias in which nights were chosen.',
      3: 'That describes a cluster sample, such as two whole weeks. A systematic sample spreads its nights out; its danger is a cycle in the list with the same period as the sampling.',
    },
    solution: 'Occupancy has a weekly cycle: Saturdays are fuller than Tuesdays. With a period of 7, every sampled night is the same weekday, so the estimate is the occupancy of Saturdays, or of Tuesdays, depending on the random start, and no number of nights fixes that. Choose a period that doesn’t match the cycle, stratify by weekday, or draw a simple random sample of nights.',
  },
  {
    id: 'b04-fn-11', lesson: 'confidence-intervals', type: 'formula', kind: 'applied',
    prompt: 'Moorhen Fish Bar (fictional) timed 20 orders chosen at random, from ordering to collection: column B gives each order’s type (eat in or takeaway) and column C the minutes. F1 holds an order type. In F2, calculate the upper limit of the 95% t interval for the mean time of orders of that type, in one formula that still works when F1 names the other type.',
    sheet: {
      cells: { A1: 'Order', B1: 'Type', C1: 'Minutes', E1: 'Order type', F1: 'eat in', E2: 'Upper 95% limit', ...col('A', 2, ORDER_MIN.map((_, i) => `F-${101 + i}`)), ...col('B', 2, ORDER_TYPE), ...col('C', 2, ORDER_MIN) },
      vary: { F1: ['takeaway'] },
    },
    cell: 'F2', view: 'A1:F21', maxHeight: '20rem', formats: { C: '0.0', F2: '0.00' }, widths: { B: 10, E: 16, F: 10 },
    answer: '=AVERAGEIF(B2:B21,F1,C2:C21)+CONFIDENCE.T(0.05,STDEV.S(FILTER(C2:C21,B2:B21=F1)),COUNTIF(B2:B21,F1))',
    alt: [
      '=AVERAGE(FILTER(C2:C21,B2:B21=F1))+CONFIDENCE.T(0.05,STDEV.S(FILTER(C2:C21,B2:B21=F1)),COUNT(FILTER(C2:C21,B2:B21=F1)))',
      '=AVERAGE(FILTER(C2:C21,B2:B21=F1))+T.INV.2T(0.05,COUNTIF(B2:B21,F1)-1)*STDEV.S(FILTER(C2:C21,B2:B21=F1))/SQRT(COUNTIF(B2:B21,F1))',
      '=AVERAGEIFS(C2:C21,B2:B21,F1)+CONFIDENCE.T(0.05,STDEV.S(IF(B2:B21=F1,C2:C21)),COUNTIFS(B2:B21,F1))',
    ],
    wrong: [
      { formula: '=AVERAGEIF(B2:B21,F1,C2:C21)+CONFIDENCE.T(0.05,STDEV.S(C2:C21),COUNTIF(B2:B21,F1))', say: 'STDEV.S of all 20 orders mixes the two types, whose times differ, so the spread is far too large. Use the standard deviation of that type’s orders only, for example STDEV.S(FILTER(C2:C21,B2:B21=F1)).' },
      { formula: '=AVERAGE(C2:C21)+CONFIDENCE.T(0.05,STDEV.S(C2:C21),COUNT(C2:C21))', say: 'That is the interval for all orders together. The question asks about the type named in F1: its mean, its spread and its count.' },
      { formula: '=AVERAGEIF(B2:B21,F1,C2:C21)+CONFIDENCE.NORM(0.05,STDEV.S(FILTER(C2:C21,B2:B21=F1)),COUNTIF(B2:B21,F1))', say: 'CONFIDENCE.NORM uses z, for a known σ. Here the spread is estimated from a handful of orders, so the multiplier comes from t: CONFIDENCE.T.' },
      { formula: '=AVERAGEIF(B2:B21,F1,C2:C21)+CONFIDENCE.T(0.95,STDEV.S(FILTER(C2:C21,B2:B21=F1)),COUNTIF(B2:B21,F1))', say: 'CONFIDENCE.T takes alpha, 1 − the confidence level: 0.05 for a 95% interval. With 0.95 the margin is tiny.' },
      { formula: '=AVERAGEIF(B2:B21,F1,C2:C21)+1.96*STDEV.S(FILTER(C2:C21,B2:B21=F1))', say: 'That adds 1.96 standard deviations of single orders: a range for individual orders. An interval for the mean uses the standard error, s ÷ √n, and the t multiplier.' },
    ],
    solution: `<x>=AVERAGEIF(B2:B21,F1,C2:C21)+CONFIDENCE.T(0.05,STDEV.S(FILTER(C2:C21,B2:B21=F1)),COUNTIF(B2:B21,F1))</x>. Excel has no STDEV.S that takes a condition, so FILTER (Excel for Microsoft 365, 2021 or 2024) keeps the type’s minutes; STDEV.S(IF(…)) does the same. Eat in: ${CI_EAT.n} orders, mean ${fx(CI_EAT.mean, 2)}, s = ${fx(CI_EAT.sd, 2)}, t with ${CI_EAT.df} df = ${fx(CI_EAT.crit, 3)}, margin ${fx(CI_EAT.margin, 2)}: ${fx(CI_EAT.low, 2)} to ${fx(CI_EAT.high, 2)} minutes; takeaway: ${CI_TAKE.n} orders, ${fx(CI_TAKE.low, 2)} to ${fx(CI_TAKE.high, 2)}. Pooling both types (${fx(CI_ALL.low, 2)} to ${fx(CI_ALL.high, 2)}) describes neither. With 8 and 12 orders the t interval needs roughly symmetric times without outliers, which these have.`,
  },
  {
    id: 'b04-fn-12', lesson: 'confidence-intervals', type: 'mc', kind: 'conceptual',
    prompt: `Quillmere Dental (fictional) asked 80 patients chosen at random whether they had any pain after a new numbing gel; 5 said yes. A colleague has calculated the 95% Wald interval for the share of all patients with pain: ${pc(WALD.low)} to ${pc(WALD.high)}. What should the practice report?`,
    options: [
      `The Wilson interval, about ${pc(WILSON.low)} to ${pc(WILSON.high)}, since only 5 of the patients had pain`,
      `The Wald interval as it stands, since its lower limit, ${pc(WALD.low)}, is above zero`,
      'A 99% Wald interval instead, to allow for the small number of patients with pain',
      'No interval: with only 5 patients reporting pain, no interval can be calculated',
    ],
    answer: 0,
    feedback: {
      1: 'A lower limit above zero doesn’t make the Wald interval trustworthy. It rests on a normal model for p̂ that needs at least 10 of each answer, and with 5 its coverage is poor.',
      2: 'A wider Wald interval still rests on the same poor normal approximation. The condition, not the confidence level, is the problem.',
      3: 'An interval can be calculated; the Wilson interval works well even with few successes, and stays between 0 and 1.',
    },
    solution: `The Wald interval p̂ ± z√(p̂(1 − p̂) ÷ n) needs at least 10 successes and 10 failures; here there are only 5 patients with pain. The course’s rule is to report the Wilson interval then: centred at ${pc(WILSON.centre)}, pulled towards 0.5 from p̂ = ${pc(PAIN.x / PAIN.n)}, it runs from ${pc(WILSON.low)} to ${pc(WILSON.high)}. The practice can report that 5 of 80 randomly chosen patients (6%) had pain, with a 95% interval of roughly 3% to 14% for the share among patients like these.`,
  },
  {
    id: 'b04-fn-13', lesson: 'confidence-intervals', type: 'num', kind: 'applied',
    prompt: 'Yewdale Water (fictional) wants to estimate the mean daily water use of its customers’ households to within ±15 litres at 99% confidence. A pilot sample suggests a standard deviation of about 120 litres. How many households should it meter? Take the multiplier from NORM.S.INV and give a whole number.',
    answer: I.sampleSizeMean(WATER.sd, WATER.E, 0.99),
    check: () => Math.ceil((I.normInv(0.995) * 120 / 15) ** 2),
    unit: 'households', places: 0, tol: 0.5,
    wrong: [
      { value: I.sampleSizeMean(WATER.sd, WATER.E, 0.95), say: 'That uses 1.96, the multiplier for 95% confidence. A 99% margin needs NORM.S.INV(0.995) = 2.576.' },
      { value: Math.floor((I.normInv(0.995) * WATER.sd / WATER.E) ** 2), say: 'A sample size is always rounded up: 424.6 households must become 425, or the margin ends up slightly wider than ±15 litres.' },
      { value: Math.ceil(I.normInv(0.995) * WATER.sd / WATER.E), say: 'n = (zσ ÷ E)²: square the bracket before rounding up.' },
      { value: Math.ceil((I.normInv(0.99) * WATER.sd / WATER.E) ** 2), say: '2.326 leaves 1% in one tail. A two-sided 99% margin leaves 0.5% in each: z = 2.576.' },
    ],
    solution: `n = (z × σ ÷ E)² = (2.576 × 120 ÷ 15)² = ${fx((I.normInv(0.995) * WATER.sd / WATER.E) ** 2, 1)}, rounded up to ${I.sampleSizeMean(WATER.sd, WATER.E, 0.99)} households. At 95% confidence ${I.sampleSizeMean(WATER.sd, WATER.E, 0.95)} would do: the extra confidence costs about 180 more households. The ±15 litres holds only if the pilot’s standard deviation is about right and the households are chosen at random.`,
  },

  // ================================================================ Module 3: testing hypotheses
  {
    id: 'b04-fn-14', lesson: 'hypothesis-testing', type: 'formula', kind: 'numerical',
    prompt: 'Brambleton Housing Association (fictional) compares the share of its repairs done on time with the national benchmark in E1. Column B records whether each of 120 repairs chosen at random was “on time” or “late”. In E2, calculate the two-sided p-value of the one-proportion z test of H₀: p = E1, where p is the share of all its repairs done on time.',
    sheet: {
      cells: { A1: 'Repair', B1: 'Outcome', D1: 'Benchmark p₀', E1: 0.7, D2: 'p-value, two-sided', ...col('A', 2, REPAIRS.map((_, i) => `R${String(i + 1).padStart(3, '0')}`)), ...col('B', 2, REPAIRS) },
      vary: { E1: [0.6, 0.65, 0.75], ...repFlip },
    },
    cell: 'E2', view: 'A1:E121', maxHeight: '20rem', formats: { E1: '0.00', E2: '0.0000' }, widths: { D: 18 },
    answer: '=2*(1-NORM.S.DIST(ABS((COUNTIF(B2:B121,"on time")/COUNTA(B2:B121)-E1)/SQRT(E1*(1-E1)/COUNTA(B2:B121))),TRUE))',
    alt: [
      '=2*NORM.S.DIST(-ABS((COUNTIF(B2:B121,"on time")/COUNTA(B2:B121)-E1)/SQRT(E1*(1-E1)/COUNTA(B2:B121))),TRUE)',
      '=2*(1-NORM.S.DIST(ABS((COUNTIF(B2:B121,"on time")/120-E1)/SQRT(E1*(1-E1)/120)),TRUE))',
      '=2*(1-NORM.S.DIST(ABS((COUNTIF(B2:B121,"on time")/ROWS(B2:B121)-E1)/SQRT(E1*(1-E1)/ROWS(B2:B121))),TRUE))',
      '=2*MIN(NORM.DIST(COUNTIF(B2:B121,"on time")/120,E1,SQRT(E1*(1-E1)/120),TRUE),1-NORM.DIST(COUNTIF(B2:B121,"on time")/120,E1,SQRT(E1*(1-E1)/120),TRUE))',
    ],
    wrong: [
      { formula: '=2*(1-NORM.S.DIST(ABS((COUNTIF(B2:B121,"on time")/120-E1)/SQRT(COUNTIF(B2:B121,"on time")/120*(1-COUNTIF(B2:B121,"on time")/120)/120)),TRUE))', say: 'That builds the standard error from p̂. The test works out how p̂ would vary if H₀ were true, so it uses p₀: √(E1 × (1 − E1) ÷ n).' },
      { formula: '=NORM.S.DIST((COUNTIF(B2:B121,"on time")/COUNTA(B2:B121)-E1)/SQRT(E1*(1-E1)/COUNTA(B2:B121)),TRUE)', say: 'That is the one-sided p-value for H₁: p < E1. The test is two-sided: double the tail beyond |z|.' },
      { formula: '=2*(1-NORM.S.DIST((COUNTIF(B2:B121,"on time")/COUNTA(B2:B121)-E1)/SQRT(E1*(1-E1)/COUNTA(B2:B121)),TRUE))', say: 'z is negative here, so 1 − NORM.S.DIST(z, TRUE) is the larger tail and doubling it gives more than 1. Use ABS(z).' },
      { formula: '=2*(1-NORM.S.DIST(ABS((COUNTIF(B2:B121,"on time")/COUNTA(B2:B121)-0.7)/SQRT(0.7*(1-0.7)/COUNTA(B2:B121))),TRUE))', say: 'The benchmark 0.7 is typed into the formula, so it stops being right when E1 changes. Refer to E1.' },
    ],
    solution: `${onTime} of 120 repairs were on time: p̂ = ${fx(REP.p, 4)}. Under H₀ the standard error is √(0.7 × 0.3 ÷ 120) = ${fx(REP.se0, 4)}, so z = (${fx(REP.p, 4)} − 0.7) ÷ ${fx(REP.se0, 4)} = ${neg(REP.z)} and the two-sided p-value is ${fx(REP.pValue, 4)}. At the 5% level there is evidence that the association’s on-time rate differs from the benchmark: it appears lower, by about 9 percentage points (95% interval ${pc(REP.low)} to ${pc(REP.high)}). The conditions hold: np₀ = 84 and n(1 − p₀) = 36 are both at least 10, and the repairs were chosen at random.`,
  },
  {
    id: 'b04-fn-15', lesson: 'hypothesis-testing', type: 'steps', kind: 'numerical',
    prompt: 'Starcross Kitchens (fictional) is planning a study of its kitchen-fitting times. It wants to detect a change of 2 hours in the mean, in either direction, with a two-sided z test at α = 0.05, taking σ = 6 hours, and it can time 50 fittings.',
    steps: [
      {
        id: 'b04-fn-15-s1', type: 'num',
        prompt: 'What is the power of the test against a true change of 2 hours? Give a percentage to one decimal place.',
        answer: r(kitPower * 100, 1),
        check: () => { const shift = 2 / (6 / Math.sqrt(50)), z = I.normInv(0.975); return (I.normCdf(shift - z) + I.normCdf(-z - shift)) * 100; },
        unit: '%', places: 1, tol: 0.1,
        wrong: [
          { value: r(I.powerMean({ delta: KIT.delta, sigma: KIT.sigma, n: KIT.n, alternative: 'greater' }) * 100, 1), say: 'That uses 1.645, the one-sided critical value. A two-sided test at 5% rejects beyond ±1.96.' },
          { value: r((1 - kitPower) * 100, 1), say: 'That is β, the chance of missing the change. Power is 1 − β.' },
          { value: r(I.normCdf(KIT.delta / KIT.sigma - I.normInv(0.975)) * 100, 1), say: 'That divides the change by σ, the spread of single fittings. The test works on the mean of 50, whose standard error is σ ÷ √50.' },
        ],
        solution: `SE = 6 ÷ √50 = ${fx(KIT.sigma / Math.sqrt(KIT.n), 4)} hours, so a true change of 2 hours sits ${fx(KIT.delta / (KIT.sigma / Math.sqrt(KIT.n)), 3)} standard errors from the null value. Power ≈ Φ(${fx(KIT.delta / (KIT.sigma / Math.sqrt(KIT.n)), 3)} − 1.960) = <x>=NORM.S.DIST(2.357-1.96,TRUE)</x> ≈ ${pc(kitPower)} (the chance of rejecting in the wrong tail is negligible).`,
      },
      {
        id: 'b04-fn-15-s2', type: 'mc',
        prompt: 'Suppose the mean really has changed by 2 hours, but the study fails to reject H₀. What has happened, and how likely was it beforehand?',
        options: [
          'A Type II error, whose probability was 1 − the power found above',
          'A Type I error, which had a probability of 5%, the significance level',
          'A Type II error, which had a probability of 5%, the significance level',
          'No error: failing to reject shows the change was too small to matter',
        ],
        answer: 0,
        feedback: {
          1: 'A Type I error rejects a true H₀. Here H₀ is false (the mean has changed) and it wasn’t rejected.',
          2: 'α is the chance of a Type I error when H₀ is true. Missing a real change is a Type II error, with probability β = 1 − power.',
          3: 'Failing to reject is not evidence of no change: here the change was real and the study missed it.',
        },
        solution: `Failing to reject a false H₀ is a Type II error. Its probability, β, is 1 − power = ${pc(1 - kitPower)} for a true change of 2 hours.`,
      },
    ],
    solution: `With 50 fittings the test has a power of ${pc(kitPower)} against a 2-hour change: about one study in three would miss a change of that size, a Type II error. A larger sample raises the power: with σ = 6, 80% power needs ${I.sampleSizeForPower({ delta: KIT.delta, sigma: KIT.sigma })} fittings, n = ((1.96 + 0.84) × 6 ÷ 2)² rounded up. If the study does fail to reject, the report should say the data can’t rule out a change of this size, not that there was none.`,
  },
  {
    id: 'b04-fn-16', lesson: 'hypothesis-testing', type: 'steps', kind: 'conceptual',
    prompt: 'Upwell Library (fictional) recorded the length of 25 loans chosen at random: mean 16.4 days, standard deviation 5.0 days, no outliers.',
    steps: [
      {
        id: 'b04-fn-16-s1', type: 'num',
        prompt: 'Calculate the lower limit of the 95% t interval for the mean loan length. Give days to two decimal places.',
        answer: r(loanLo, 2),
        check: () => 16.4 - I.tInv(0.975, 24) * 5 / Math.sqrt(25),
        unit: 'days', places: 2, tol: 0.006,
        wrong: [
          { value: r(LOAN.mean - I.normInv(0.975) * loanSe, 2), say: 'That uses z = 1.96. With s estimated from 25 loans, the multiplier is t with 24 degrees of freedom: 2.064.' },
          { value: r(LOAN.mean - I.tInv(0.95, LOAN.n - 1) * loanSe, 2), say: 'That uses 1.711, which leaves 5% in one tail. A two-sided 95% interval leaves 2.5% in each: T.INV.2T(0.05,24) = 2.064.' },
          { value: r(LOAN.mean - loanT * LOAN.sd, 2), say: 'The margin multiplies the standard error, s ÷ √n = 5.0 ÷ 5 = 1.0, not the standard deviation of single loans.' },
        ],
        solution: `SE = 5.0 ÷ √25 = 1.00 day; t = <x>=T.INV.2T(0.05,24)</x> = ${fx(loanT, 3)}; interval 16.4 ± ${fx(loanT * loanSe, 2)}: ${fx(loanLo, 2)} to ${fx(loanHi, 2)} days.`,
      },
      {
        id: 'b04-fn-16-s2', type: 'classify',
        prompt: 'Using only your 95% interval from the first part, decide for each claimed mean loan length whether a two-sided t test at the 5% level would reject it.',
        items: CLAIMS.map((c) => (c === 21 ? '21 days (the figure in the library’s budget)' : `${c} days`)),
        categories: ['Rejected at the 5% level', 'Not rejected'],
        answer: CLAIMS.map((c) => (c < loanLo || c > loanHi ? 0 : 1)),
        feedback: {
          0: `14 days lies below the interval’s lower limit, ${fx(loanLo, 2)}: a two-sided test at 5% rejects it.`,
          2: '18 days lies inside the interval, so it isn’t rejected. That doesn’t make it the true mean: every value inside the interval is compatible with the data.',
        },
        solution: 'A two-sided t test at the 5% level rejects H₀: μ = μ₀ exactly when μ₀ lies outside the 95% t interval. 14, 19 and 21 days lie outside it; 15 and 18 days lie inside.',
      },
    ],
    solution: `The 95% interval, ${fx(loanLo, 2)} to ${fx(loanHi, 2)} days, is the set of hypothesised means that a two-sided t test at 5% would not reject. So 14, 19 and the budget’s 21 days are rejected, and 15 and 18 days are not. Not rejecting 15 or 18 days doesn’t confirm either: both, and everything between, are compatible with the data. The budget’s 21 days is far above anything these loans support.`,
  },
  {
    id: 'b04-fn-17', lesson: 'comparing-means', type: 'steps', kind: 'applied',
    prompt: `Arncliffe Window Fitters (fictional) allocated jobs at random to its North and South teams and recorded the hours each job took: column A gives each job’s team and column B its hours (9 North jobs, 14 South). The North team’s times vary far more (standard deviation ${fx(sd(NORTH), 2)} hours, against ${fx(sd(SOUTH), 2)}).`,
    steps: [
      {
        id: 'b04-fn-17-s1', type: 'mc',
        prompt: 'Which test should compare the two teams’ mean times?',
        options: [
          'Welch’s t test, because the teams are separate groups whose spreads differ greatly',
          'The pooled two-sample t test, because the jobs were allocated to the teams at random',
          'A paired t test: all the jobs were done by the same firm and timed the same way',
          'Run F.TEST first, and use the pooled test if it finds no difference in the spreads',
        ],
        answer: 0,
        feedback: {
          1: 'Random allocation makes the groups comparable, but it doesn’t make their variances equal. With a small, noisy group and a larger steady one, pooling understates the standard error.',
          2: 'Pairing needs each value in one group to belong with one in the other, such as the same job measured twice. These are different jobs, 9 and 14 of them.',
          3: 'A preliminary variance test is a poor gate: it is sensitive to non-normal data and misses real differences in small samples. Welch’s test is the safer default whatever F.TEST says.',
        },
        solution: 'Two independent groups with very different spreads and sizes: Welch’s two-sample t test, which doesn’t assume equal variances.',
      },
      {
        id: 'b04-fn-17-s2', type: 'formula',
        prompt: 'In E1, calculate the two-sided p-value of that test with T.TEST.',
        sheet: { cells: teamCells },
        cell: 'E1', view: 'A1:E24', maxHeight: '20rem', formats: { B: '0.0', E1: '0.0000' }, widths: { A: 8, B: 8 },
        require: ['T.TEST'],
        answer: '=T.TEST(FILTER(B2:B24,A2:A24="North"),FILTER(B2:B24,A2:A24="South"),2,3)',
        alt: [
          '=T.TEST(FILTER(B2:B24,A2:A24="South"),FILTER(B2:B24,A2:A24="North"),2,3)',
          '=2*T.TEST(FILTER(B2:B24,A2:A24="North"),FILTER(B2:B24,A2:A24="South"),1,3)',
          '=T.TEST(IF(A2:A24="North",B2:B24),IF(A2:A24="South",B2:B24),2,3)',
        ],
        wrong: [
          { formula: '=T.TEST(FILTER(B2:B24,A2:A24="North"),FILTER(B2:B24,A2:A24="South"),2,2)', say: 'Type 2 is the pooled test, which assumes equal variances. Welch’s test is type 3.' },
          { formula: '=T.TEST(FILTER(B2:B24,A2:A24="North"),FILTER(B2:B24,A2:A24="South"),1,3)', say: 'tails = 1 gives the one-tailed p-value. The comparison is two-sided: tails = 2.' },
          { formula: '=T.TEST(FILTER(B2:B24,A2:A24="North"),FILTER(B2:B24,A2:A24="South"),2,1)', say: 'Type 1 is the paired test, which needs the same number of values in each group (here it returns #N/A). These are independent groups: type 3.' },
        ],
        solution: `FILTER picks out each team’s hours (Excel for Microsoft 365, 2021 or 2024; IF inside T.TEST does the same): <x>=T.TEST(FILTER(B2:B24,A2:A24="North"),FILTER(B2:B24,A2:A24="South"),2,3)</x> = ${fx(WEL.p, 4)}, Welch’s t = ${fx(WEL.t, 2)} with about ${fx(WEL.df, 1)} degrees of freedom.`,
      },
      {
        id: 'b04-fn-17-s3', type: 'num',
        prompt: 'Calculate the lower limit of the 95% confidence interval for the difference in mean hours (North minus South) that goes with the test you chose, using its standard error and degrees of freedom. Give hours to two decimal places (it may be negative).',
        answer: r(WEL.low, 2),
        check: () => { const v1 = sd(NORTH) ** 2 / 9, v2 = sd(SOUTH) ** 2 / 14, se = Math.sqrt(v1 + v2), df = (v1 + v2) ** 2 / (v1 ** 2 / 8 + v2 ** 2 / 13); return mean(NORTH) - mean(SOUTH) - I.tInv(0.975, df) * se; },
        unit: 'hours', places: 2, tol: 0.025,
        wrong: [
          { value: r(WEL.diff - I.normInv(0.975) * WEL.se, 2), say: 'That uses z = 1.96. With two estimated variances and small samples, the multiplier is t with Welch’s degrees of freedom, about 8.4.' },
          { value: r(POOL.low, 2), say: 'That is the pooled interval, which assumes equal variances. Welch’s standard error is √(s₁²/n₁ + s₂²/n₂), with Welch’s degrees of freedom.' },
          { value: r(WEL.diff - I.tInv(0.975, NORTH.length + SOUTH.length - 2) * WEL.se, 2), say: 'Welch’s standard error, but the pooled test’s degrees of freedom, n₁ + n₂ − 2 = 21. Welch’s are far fewer here, about 8.4, because the small North sample is the noisy one.' },
        ],
        solution: `Difference ${fx(WEL.diff, 2)} hours; SE = √(${fx(sd(NORTH) ** 2, 3)}/9 + ${fx(sd(SOUTH) ** 2, 3)}/14) = ${fx(WEL.se, 4)}; t for ${fx(WEL.df, 2)} df ≈ ${fx(I.tInv(0.975, WEL.df), 3)}; interval ${neg(WEL.low, 2)} to ${fx(WEL.high, 2)} hours. (T.INV.2T truncates the df to 8, giving ${neg(welLoTrunc, 2)}.)`,
      },
    ],
    solution: `The teams are independent groups with very different spreads, so Welch’s test: t = ${fx(WEL.t, 2)}, df ≈ ${fx(WEL.df, 1)}, p = ${fx(WEL.p, 3)}. There is no evidence at the 5% level that the teams’ mean times differ; the 95% interval for North minus South, ${neg(WEL.low, 2)} to ${fx(WEL.high, 2)} hours, includes 0, as a two-sided test that doesn’t reject must. The pooled test would give p = ${fx(POOL.p, 3)} and a “significant” difference, because pooling lets the 14 steady South jobs understate the North team’s noise. The North team’s mean is ${fx(WEL.diff, 1)} hours higher in these jobs, but 9 noisy jobs can’t pin the difference down.`,
  },
  {
    id: 'b04-fn-18', lesson: 'comparing-means', type: 'num', kind: 'numerical',
    prompt: 'Skelwith Supermarket (fictional) timed the same 16 cashiers serving a standard basket before and after a training session. A report gives only: before, mean 52.0 seconds, standard deviation 9.0; after, mean 48.5 seconds, standard deviation 8.6; the correlation between each cashier’s two times is 0.92. Calculate the paired t statistic for the mean saving (before minus after). Give two decimal places.',
    answer: r(tillT, 2),
    check: () => 3.5 / (Math.sqrt(9 ** 2 + 8.6 ** 2 - 2 * 0.92 * 9 * 8.6) / 4),
    unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: r((TILL.m1 - TILL.m2) / Math.sqrt(TILL.s1 ** 2 / TILL.n + TILL.s2 ** 2 / TILL.n), 2), say: 'That is the two-sample t statistic, which treats the before and after times as separate groups. The same cashiers were timed twice: use the standard deviation of the differences.' },
      { value: r((TILL.m1 - TILL.m2) / tillSd, 2), say: 'You divided by the standard deviation of the differences. The t statistic divides by its standard error, s_d ÷ √16.' },
      { value: r((TILL.m1 - TILL.m2) / (Math.sqrt(TILL.s1 ** 2 + TILL.s2 ** 2 + 2 * TILL.r * TILL.s1 * TILL.s2) / Math.sqrt(TILL.n)), 2), say: 'The correlation term is subtracted: s_d² = s₁² + s₂² − 2r s₁ s₂. Strongly correlated times make the differences less variable, not more.' },
    ],
    solution: `The standard deviation of the differences comes from the two standard deviations and their correlation: s_d² = 9.0² + 8.6² − 2 × 0.92 × 9.0 × 8.6 = ${fx(tillSd ** 2, 2)}, so s_d = ${fx(tillSd, 2)} seconds. t = 3.5 ÷ (${fx(tillSd, 2)} ÷ √16) = ${fx(tillT, 2)} with 15 degrees of freedom, a two-sided p-value of ${fx(2 * I.tSf(tillT, TILL.n - 1), 4)}. Treated as two groups the same data give t = ${fx((TILL.m1 - TILL.m2) / Math.sqrt(TILL.s1 ** 2 / TILL.n + TILL.s2 ** 2 / TILL.n), 2)}: fast cashiers stay fast, and pairing removes that. The times fell by more than chance would produce; without untrained cashiers timed twice, practice or a quieter week could explain part of the fall.`,
  },

  // ================================================================ Module 4: categories and groups
  {
    id: 'b04-fn-19', lesson: 'proportions-and-chi-square', type: 'steps', kind: 'applied',
    prompt: `Gatehouse Locksmiths (fictional) logged its emergency call-outs on each of 120 nights: A2:A6 hold the counts 0 to 3 and 4 (meaning 4 or more), and B2:B6 the number of nights with each. There were ${CALLOUTS} call-outs in all, so F2 holds λ = ${CALLOUTS} ÷ 120 ≈ ${fx(LAM, 4)}, the mean per night estimated from the same log, and F1 the number of nights. The firm wants to test whether call-outs per night follow a Poisson distribution.`,
    steps: [
      {
        id: 'b04-fn-19-s1', type: 'formula',
        prompt: 'In C2, calculate the number of nights that a Poisson distribution with mean F2 expects to have the number of call-outs in A2, and fill it down to C5.',
        sheet: { cells: lockCells, fixed: ['A2:A6'] },
        cell: 'C2', fill: 'C2:C5', view: 'A1:F7', formats: { C: '0.00', F2: '0.0000' }, widths: { B: 11, C: 13, E: 20 },
        answer: '=$F$1*POISSON.DIST(A2,$F$2,FALSE)',
        alt: ['=POISSON.DIST(A2,$F$2,FALSE)*$F$1', '=$F$1*EXP(-$F$2)*$F$2^A2/FACT(A2)', '=$B$7*POISSON.DIST(A2,$F$2,FALSE)', '=F$1*POISSON.DIST(A2,F$2,FALSE)'],
        wrong: [
          { formula: '=$F$1*POISSON.DIST(A2,$F$2,TRUE)', say: 'TRUE gives the probability of at most A2 call-outs. Each row needs exactly A2: FALSE.' },
          { formula: '=F1*POISSON.DIST(A2,F2,FALSE)', say: 'Filled down, F1 and F2 move to F2, F3 …, so the lower rows use the wrong inputs. Fix both with $.' },
          { formula: '=POISSON.DIST(A2,$F$2,FALSE)', say: 'That is the probability of a night with A2 call-outs. The expected count is that probability times the number of nights, F1.' },
        ],
        solution: `<x>=$F$1*POISSON.DIST(A2,$F$2,FALSE)</x>, filled to C5: ${EXP_N.slice(0, 4).map((e) => fx(e, 2)).join(', ')} nights for 0 to 3 call-outs.`,
      },
      {
        id: 'b04-fn-19-s2', type: 'formula',
        prompt: 'In C6, calculate the number of nights a Poisson distribution with mean F2 expects to have 4 or more call-outs, so that the expected counts in column C add up to the number of nights.',
        sheet: { cells: lockCells, fixed: ['A2:A6'] },
        cell: 'C6', view: 'A1:F7', formats: { C: '0.00', F2: '0.0000' }, widths: { B: 11, C: 13, E: 20 },
        answer: '=$F$1*(1-POISSON.DIST(A6-1,$F$2,TRUE))',
        alt: ['=F1*(1-POISSON.DIST(3,F2,TRUE))', '=F1*(1-POISSON.DIST(A5,F2,TRUE))', '=F1*(1-SUM(POISSON.DIST({0,1,2,3},F2,FALSE)))'],
        wrong: [
          { formula: '=F1*(1-POISSON.DIST(A6,F2,TRUE))', say: 'That is the expected number of nights with 5 or more call-outs. “4 or more” is 1 − P(at most 3).' },
          { formula: '=F1*POISSON.DIST(A6,F2,FALSE)', say: 'That is nights with exactly 4. The last category must take in every count from 4 up, or the expected counts won’t add to the number of nights.' },
          { formula: '=F1*(1-POISSON.DIST(A6-1,F2,FALSE))', say: 'With FALSE you subtract only P(exactly 3). Subtract P(at most 3), with TRUE.' },
        ],
        solution: `<x>=$F$1*(1-POISSON.DIST(A6-1,$F$2,TRUE))</x> = ${fx(EXP_N[4], 2)} nights: 1 − P(at most 3), times the number of nights. Once C2:C5 are filled, <x>=F1-SUM(C2:C5)</x> gives the same.`,
      },
      {
        id: 'b04-fn-19-s3', type: 'num',
        prompt: 'Every expected count is at least 5. With these five categories and λ estimated from the same log, how many degrees of freedom does the goodness-of-fit test have?',
        answer: 3, check: () => 5 - 1 - 1, unit: 'degrees of freedom', places: 0, tol: 0,
        wrong: [
          { value: 4, say: 'k − 1 = 4 would be right for a model fixed in advance. λ was estimated from the same nights, which costs one more: k − 1 − 1 = 3. CHISQ.TEST on one column would wrongly use 4.' },
          { value: 5, say: 'The degrees of freedom are not the number of categories: one is lost to the total, and one to the estimated λ.' },
        ],
        solution: 'df = k − 1 − m = 5 − 1 − 1 = 3: one degree of freedom is lost because the expected counts must add to 120, and one because λ was estimated from the same data.',
      },
      {
        id: 'b04-fn-19-s4', type: 'mc',
        prompt: `The goodness-of-fit test gives a p-value of about ${fx(FIT.p, 1)}. What should the firm conclude?`,
        options: [
          'No evidence against a Poisson model, so it can be used to plan night cover',
          `Call-outs per night are shown to follow a Poisson distribution with λ ≈ ${fx(LAM, 2)}`,
          'A Poisson model is rejected, because the p-value is far above 0.05',
          'No conclusion: the test is invalid because one category combines 4 and 5 call-outs',
        ],
        answer: 0,
        feedback: {
          1: 'A large p-value means the counts are compatible with a Poisson model, not that they are shown to follow one: failing to reject is not proof.',
          2: 'A p-value above 0.05 means the data are not surprising if the model is right. Small p-values count against the model, large ones don’t.',
          3: 'Merging the tail into “4 or more” is what keeps every expected count at least 5 and makes the expected counts add to 120. It is part of a valid test.',
        },
        solution: `p ≈ ${fx(FIT.p, 2)} is far above 0.05: the counts are what a Poisson model would often produce, so there is no evidence against it. That doesn’t prove the model right, but it makes it a reasonable basis for planning night cover.`,
      },
    ],
    solution: `Expected nights: ${EXP_N.map((e) => fx(e, 1)).join(', ')}, all above 5. χ² = Σ(O − E)² ÷ E = ${fx(FIT.stat, 2)} on 3 degrees of freedom, and <x>=CHISQ.DIST.RT(0.96,3)</x> ≈ ${fx(FIT.p, 2)}: no evidence that call-outs per night depart from a Poisson distribution. That doesn’t prove the model right, but it makes a Poisson model a reasonable basis for planning night cover, while the firm watches for nights that bunch. CHISQ.TEST on the observed and expected columns would use 4 degrees of freedom and give ${fx(FIT_NAIVE.p, 2)}.`,
  },
  {
    id: 'b04-fn-20', lesson: 'proportions-and-chi-square', type: 'formula', kind: 'applied',
    prompt: 'Ingleby Print Works (fictional) suspects that its older press, A, misprints more often than press B, and set the alternative H₁: p_A > p_B before checking. B2:C3 hold the misprinted sheets and the sheets checked, chosen at random, for each press; row 4 holds their shares and B5 the pooled proportion. In B7, calculate the p-value of the two-proportion z test.',
    sheet: { cells: { B1: 'Press A', C1: 'Press B', A2: 'Misprinted sheets', B2: 58, C2: 41, A3: 'Sheets checked', B3: 1200, C3: 1300, A4: 'Share misprinted', B4: '=B2/B3', C4: '=C2/C3', A5: 'Pooled proportion', B5: '=(B2+C2)/(B3+C3)', A7: 'p-value (H₁: p_A > p_B)' } },
    cell: 'B7', view: 'A1:C7', formats: { B3: '#,##0', C3: '#,##0', B4: '0.00%', C4: '0.00%', B5: '0.00%', B7: '0.0000' }, widths: { A: 22, B: 10, C: 10 },
    answer: '=1-NORM.S.DIST((B4-C4)/SQRT(B5*(1-B5)*(1/B3+1/C3)),TRUE)',
    alt: [
      '=NORM.S.DIST((C4-B4)/SQRT(B5*(1-B5)*(1/B3+1/C3)),TRUE)',
      '=1-NORM.S.DIST((B2/B3-C2/C3)/SQRT(B5*(1-B5)*(1/B3+1/C3)),TRUE)',
      '=1-NORM.DIST(B4-C4,0,SQRT(B5*(1-B5)*(1/B3+1/C3)),TRUE)',
      '=1-NORM.S.DIST((B4-C4)/SQRT(B5*(1-B5)/B3+B5*(1-B5)/C3),TRUE)',
    ],
    wrong: [
      { formula: '=2*(1-NORM.S.DIST(ABS((B4-C4)/SQRT(B5*(1-B5)*(1/B3+1/C3))),TRUE))', say: 'That is the two-sided p-value. The alternative, set before checking, is one-sided, p_A > p_B: the upper tail only.' },
      { formula: '=NORM.S.DIST((B4-C4)/SQRT(B5*(1-B5)*(1/B3+1/C3)),TRUE)', say: 'That is the lower tail, the p-value for H₁: p_A < p_B. The alternative is p_A > p_B: 1 − NORM.S.DIST(z, TRUE).' },
      { formula: '=1-NORM.S.DIST((B4-C4)/SQRT(B4*(1-B4)/B3+C4*(1-C4)/C3),TRUE)', say: 'That is the unpooled standard error of a confidence interval. The test assumes p_A = p_B, so it uses the pooled proportion in B5.' },
      { formula: '=1-NORM.S.DIST((B4-C4)/SQRT(B5*(1-B5)),TRUE)', say: 'The standard error of a difference in proportions needs the sample sizes: √(p̄(1 − p̄)(1/n₁ + 1/n₂)).' },
    ],
    solution: `Press A misprinted ${pc(PRESS.p1, 2)} of sheets and press B ${pc(PRESS.p2, 2)}. Pooled p̄ = 99 ÷ 2,500 = ${pc(PRESS.pool, 2)}; SE = √(p̄(1 − p̄)(1/1,200 + 1/1,300)) = ${fx(PRESS.sePool, 5)}; z = ${fx(PRESS.diff, 5)} ÷ ${fx(PRESS.sePool, 5)} = ${fx(PRESS.z, 2)}; one-sided p = ${fx(PRESS.pValue, 4)}. At the 5% level there is evidence that press A misprints more often, by about 1.7 percentage points (two-sided 95% interval ${fx(PRESS2.low * 100, 2)} to ${fx(PRESS2.high * 100, 2)} points). Both samples have well over 10 misprints and 10 good sheets. The test shows the gap is unlikely to be chance, not that the press’s age causes it: if press A runs harder jobs or cheaper paper, that could explain it too.`,
  },
  {
    id: 'b04-fn-21', lesson: 'proportions-and-chi-square', type: 'formula', kind: 'numerical',
    prompt: 'Calderbrook Leisure (fictional) cross-tabulated last year’s members by membership type and by whether they renewed: B2:D3 hold the counts, column E the row totals and row 4 the column totals. In B6, calculate in one formula the p-value of the chi-square test of whether renewing is independent of membership type. (In Excel, a column times a row, such as E2:E3*B4:D4, gives a 2 × 3 array: each row’s value times each column’s.)',
    sheet: {
      cells: {
        B1: 'Off-peak', C1: 'Standard', D1: 'Family', E1: 'Total', A2: 'Renewed', A3: 'Didn’t renew', A4: 'Total',
        B2: MEMBER[0][0], C2: MEMBER[0][1], D2: MEMBER[0][2], B3: MEMBER[1][0], C3: MEMBER[1][1], D3: MEMBER[1][2],
        E2: '=SUM(B2:D2)', E3: '=SUM(B3:D3)', B4: '=SUM(B2:B3)', C4: '=SUM(C2:C3)', D4: '=SUM(D2:D3)', E4: '=SUM(E2:E3)',
        A6: 'p-value',
      },
    },
    cell: 'B6', view: 'A1:E6', formats: { B6: '0.000000' }, widths: { A: 13 },
    answer: '=CHISQ.TEST(B2:D3,E2:E3*B4:D4/E4)',
    alt: [
      '=CHISQ.TEST(B2:D3,B4:D4*E2:E3/E4)',
      '=CHISQ.TEST(B2:D3,E2:E3*B4:D4/SUM(B2:D3))',
      '=CHISQ.DIST.RT(SUMPRODUCT((B2:D3-E2:E3*B4:D4/E4)^2/(E2:E3*B4:D4/E4)),2)',
      '=CHISQ.DIST.RT(SUMPRODUCT((B2:D3-E2:E3*B4:D4/E4)^2/(E2:E3*B4:D4/E4)),(ROWS(B2:D3)-1)*(COLUMNS(B2:D3)-1))',
    ],
    wrong: [
      { formula: '=CHISQ.TEST(B2:D3,B2:D3)', say: 'The second range must hold the expected counts under independence, not the observed counts again (which always gives p = 1). Each expected count is row total × column total ÷ grand total.' },
      { formula: '=CHISQ.TEST(B2:D3,E2:E3/E4*B4:D4/E4)', say: 'That gives the expected shares of the grand total, not counts. Multiply by the grand total once more: row total × column total ÷ grand total.' },
      { formula: '=CHISQ.DIST.RT(SUMPRODUCT((B2:D3-E2:E3*B4:D4/E4)^2/(E2:E3*B4:D4/E4)),5)', say: 'Six cells minus one is not the test’s degrees of freedom. A test of independence has (r − 1)(c − 1) = 1 × 2 = 2.' },
    ],
    solution: `The expected counts under independence are row total × column total ÷ grand total: <x>E2:E3*B4:D4/E4</x> makes the whole 2 × 3 table at once (${IND.expected[0].join(', ')} renewals; ${IND.expected[1].join(', ')} not; <x>MMULT(E2:E3,B4:D4)/E4</x> does the same), and <x>=CHISQ.TEST(B2:D3,E2:E3*B4:D4/E4)</x> returns ${IND.p.toFixed(6)}. χ² = ${fx(IND.stat, 2)} on (2 − 1)(3 − 1) = 2 degrees of freedom; the smallest expected count is ${IND.minExpected}. There is strong evidence that renewal is associated with membership type: ${pc(96 / 160, 0)} of off-peak members renewed, ${pc(210 / 300, 0)} of standard and ${pc(128 / 160, 0)} of family members. Cramér’s V = ${fx(IND.cramersV, 2)}, a modest association, and members chose their type, so it doesn’t show that moving members to family plans would raise renewals.`,
  },
  {
    id: 'b04-fn-22', lesson: 'anova', type: 'formula', kind: 'numerical',
    prompt: 'Rowan Street Market (fictional) recorded one stall’s Saturday takings ($) at three pitches over 18 Saturdays: by the entrance (A2:A7), in the middle aisle (B2:B8) and at the back (C2:C6). In F1, calculate in one formula η² for a one-way ANOVA of takings by pitch: the share of the total variation that lies between the pitches.',
    sheet: { cells: { A1: 'Entrance', B1: 'Middle aisle', C1: 'Back', E1: 'η²', ...col('A', 2, ENTRANCE), ...col('B', 2, AISLE), ...col('C', 2, BACK) } },
    cell: 'F1', view: 'A1:F8', formats: { F1: '0.000' }, widths: { A: 10, B: 12, C: 8 },
    answer: '=1-(DEVSQ(A2:A7)+DEVSQ(B2:B8)+DEVSQ(C2:C6))/DEVSQ(A2:C8)',
    alt: [
      '=(DEVSQ(A2:C8)-DEVSQ(A2:A7)-DEVSQ(B2:B8)-DEVSQ(C2:C6))/DEVSQ(A2:C8)',
      '=(DEVSQ(A2:C8)-(DEVSQ(A2:A7)+DEVSQ(B2:B8)+DEVSQ(C2:C6)))/DEVSQ(A2:C8)',
      '=1-(DEVSQ(A2:A8)+DEVSQ(B2:B8)+DEVSQ(C2:C8))/DEVSQ(A2:C8)',
      '=(COUNT(A2:A7)*(AVERAGE(A2:A7)-AVERAGE(A2:C8))^2+COUNT(B2:B8)*(AVERAGE(B2:B8)-AVERAGE(A2:C8))^2+COUNT(C2:C6)*(AVERAGE(C2:C6)-AVERAGE(A2:C8))^2)/DEVSQ(A2:C8)',
    ],
    wrong: [
      { formula: '=(DEVSQ(A2:A7)+DEVSQ(B2:B8)+DEVSQ(C2:C6))/DEVSQ(A2:C8)', say: 'That is SS within ÷ SS total, the share of the variation inside the pitches: 1 − η². η² is the between-pitches share.' },
      { formula: '=(DEVSQ(A2:C8)-(DEVSQ(A2:A7)+DEVSQ(B2:B8)+DEVSQ(C2:C6)))/(DEVSQ(A2:A7)+DEVSQ(B2:B8)+DEVSQ(C2:C6))', say: 'That divides SS between by SS within. η² divides it by SS total, so that it is a share between 0 and 1.' },
      { formula: '=1-(VAR.S(A2:A7)+VAR.S(B2:B8)+VAR.S(C2:C6))/VAR.S(A2:C8)', say: 'Variances divide each sum of squares by its own degrees of freedom, so they don’t add up the way sums of squares do. Use DEVSQ.' },
    ],
    solution: `DEVSQ of all 18 Saturdays is SS total, ${fx(PITCH.sst, 1)}; adding each pitch’s DEVSQ gives SS within, ${fx(PITCH.ssw, 1)}; SS between is the rest, ${fx(PITCH.ssb, 1)}. η² = ${fx(PITCH.ssb, 1)} ÷ ${fx(PITCH.sst, 1)} = ${fx(PITCH.eta2, 3)}: about half of the Saturday-to-Saturday variation in takings goes with the pitch. F = ${fx(PITCH.F, 2)} on 2 and 15 degrees of freedom, p ≈ ${fx(PITCH.p, 4)}; the largest standard deviation is ${fx(Math.max(sd(ENTRANCE), sd(AISLE), sd(BACK)) / Math.min(sd(ENTRANCE), sd(AISLE), sd(BACK)), 2)} times the smallest. The stall chose its pitch on different Saturdays, so weather and season could share the credit.`,
  },
  {
    id: 'b04-fn-23', lesson: 'anova', type: 'mc', kind: 'conceptual',
    prompt: `Jessamine Paints (fictional) tested four paint formulas, W, X, Y and Z, on 8 panels each, measuring drying time. A one-way ANOVA gives F = 5.9 and p = ${fx(I.fSf(5.9, 3, 28), 3)}, and the formulas’ standard deviations are similar. Welch t tests on the six pairs give these p-values: ${PAIRS.map(([k, , t]) => `${k} ${t}`).join(', ')}. Keeping the family-wise error rate at 5% with a Bonferroni correction, which conclusion is justified?`,
    options: [
      'W–X and X–Z differ clearly; the other four pairs show no clear difference.',
      'W–X, W–Y and X–Z differ, since each of those p-values is below 0.05.',
      'All four formulas differ from one another, because the ANOVA’s F test was significant.',
      'No pair can be singled out without Tukey’s HSD, which Excel can’t calculate.',
    ],
    answer: 0,
    feedback: {
      1: `Six tests at 0.05 each would give about a ${Math.round((1 - 0.95 ** 6) * 100)}% chance of at least one false alarm if they were independent (1 − 0.95⁶). Bonferroni tests each at 0.05 ÷ 6 ≈ ${fx(bonf, 4)}, and W–Y’s 0.030 doesn’t pass.`,
      2: 'A significant F says the means are not all equal; one formula out of line is enough. Pairwise comparisons, adjusted for multiple testing, say which differ.',
      3: 'Tukey’s HSD is the usual choice for all pairs, but the Bonferroni correction is a valid alternative that works with Excel’s T.TEST.',
    },
    solution: `With six comparisons, Bonferroni tests each at 0.05 ÷ 6 ≈ ${fx(bonf, 4)}. Only ${PAIRS.filter(([, p]) => p < bonf).map(([k, , t]) => `${k} (${t})`).join(' and ')} fall below it, so X’s drying time differs from W’s and from Z’s; W–Y (0.030) would look significant tested alone but doesn’t survive the adjustment. Not finding a difference for the other pairs isn’t evidence that they dry equally fast: with 8 panels each, moderate differences could be missed.`,
  },
  {
    id: 'b04-fn-24', lesson: 'anova', type: 'steps', kind: 'numerical',
    prompt: `Millbeck Garages (fictional) timed a standard service at three branches, choosing services at random (hours): ${GAR.map(([name, n, m, s]) => `${name}, ${n} services, mean ${fx(m, 2)}, standard deviation ${fx(s, 2)}`).join('; ')}.`,
    steps: [
      {
        id: 'b04-fn-24-s1', type: 'mc',
        prompt: 'Before running a one-way ANOVA, what does the usual rule of thumb say about the spreads?',
        options: [
          'Equal variances are reasonable: the largest SD is less than 1.2 times the smallest.',
          'Equal variances fail: the three SDs differ, so Welch’s ANOVA is needed instead.',
          'The rule can’t be applied, because the branches timed different numbers of services.',
          'Equal variances fail: the largest variance is more than 1.3 times the smallest one.',
        ],
        answer: 0,
        feedback: {
          1: 'Sample standard deviations always differ a little. The rule asks whether the largest is more than about twice the smallest; 0.35 ÷ 0.30 ≈ 1.17 is well within it.',
          2: 'Unequal group sizes make unequal variances matter more, but the rule still applies, and here it is met.',
          3: 'The rule compares standard deviations: the largest should be no more than about twice the smallest. A variance ratio of 1.36 is no cause for concern.',
        },
        solution: 'The largest standard deviation, 0.35, is 1.17 times the smallest, 0.30: well under the rule of thumb’s limit of about 2, so equal variances are a reasonable assumption.',
      },
      {
        id: 'b04-fn-24-s2', type: 'num',
        prompt: 'Calculate the F statistic of the one-way ANOVA. Give two decimal places.',
        answer: r(garF(garSsb, garSsw), 2),
        check: () => {
          const g = (8 * 2.4 + 10 * 2.75 + 12 * 2.55) / 30;
          const ssb = 8 * (2.4 - g) ** 2 + 10 * (2.75 - g) ** 2 + 12 * (2.55 - g) ** 2, ssw = 7 * 0.3 ** 2 + 9 * 0.35 ** 2 + 11 * 0.32 ** 2;
          return (ssb / 2) / (ssw / 27);
        },
        unit: '', places: 2, tol: 0.01,
        wrong: [
          { value: r(garF(garSsb, sum(GAR.map((g) => (g[1] - 1) * g[3]))), 2), say: 'SS within adds (nᵢ − 1) × sᵢ²: square each standard deviation first.' },
          { value: r(garF(garSsb, sum(GAR.map((g) => g[1] * g[3] ** 2))), 2), say: 'Each branch’s sum of squares is (nᵢ − 1) × sᵢ², because the sample variance divides by nᵢ − 1.' },
          { value: r(garF(garSsb, garSsw, 3), 2), say: 'The between-groups degrees of freedom are k − 1 = 2, not k = 3.' },
          { value: r(garF(garSsb, garSsw, 2, garN - 1), 2), say: 'The within-groups degrees of freedom are N − k = 27; N − 1 = 29 is the total.' },
        ],
        solution: `Grand mean = (8 × 2.40 + 10 × 2.75 + 12 × 2.55) ÷ 30 = ${fx(garGrand, 4)}. SS between = Σ nᵢ(x̄ᵢ − x̄)² = ${fx(garSsb, 4)}; SS within = Σ (nᵢ − 1)sᵢ² = ${fx(garSsw, 4)}. MS between = ${fx(garSsb, 4)} ÷ 2 = ${fx(garSsb / 2, 4)}; MS within = ${fx(garSsw, 4)} ÷ 27 = ${fx(garSsw / 27, 4)}; F = ${fx(garF(garSsb, garSsw), 2)}.`,
      },
    ],
    solution: `The spreads pass the rule of thumb, so the ordinary one-way ANOVA is reasonable. F = ${fx(garF(garSsb, garSsw), 2)} on 2 and 27 degrees of freedom, and <x>=F.DIST.RT(2.64,2,27)</x> ≈ ${fx(I.fSf(garF(garSsb, garSsw), 2, 27), 3)}: no evidence at the 5% level that the branches’ mean service times differ. η² = ${fx(garSsb / (garSsb + garSsw), 2)}, and with 8 to 12 services a branch a real gap of 0.35 hours could be missed: report the means with that caution, not as proof that the branches are equally quick.`,
  },
];
