// assess-m4.js — B05 module 4 test: Many variables and causation (correlation-matrices, partial-correlation,
// correlation-and-causation). New questions on new businesses, not copies of lesson exercises. No hints; solutions
// are shown when the student reviews the test. Every business, person and number is fictional. Formula items are
// marked by their results (core/sheet.js gradeFormula); every num item's `check` recomputes its answer.
import * as C from '../../../core/correlation.js?v=20';

const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const neg = (v, d = 2) => `${v < 0 ? '−' : ''}${fx(Math.abs(v), d)}`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));

// Rowan Hotels: 15 p-values from a matrix of six measures (in matrix order)
const LARK = [0.034, 0.0002, 0.27, 0.0094, 0.63, 0.0011, 0.088, 0.013, 0.92, 0.0035, 0.15, 0.047, 0.021, 0.41, 0.0060];
const larkPairs = ['Occupancy – room rate', 'Occupancy – review score', 'Occupancy – spa bookings', 'Occupancy – staff on shift', 'Occupancy – cancellations', 'Room rate – review score', 'Room rate – spa bookings', 'Room rate – staff on shift', 'Room rate – cancellations', 'Review score – spa bookings', 'Review score – staff on shift', 'Review score – cancellations', 'Spa bookings – staff on shift', 'Spa bookings – cancellations', 'Staff on shift – cancellations'];
const larkB = C.adjust(LARK, 'bonferroni'), larkH = C.adjust(LARK, 'holm'), larkF = C.adjust(LARK, 'fdr_bh');
const nSig = (a) => a.filter((p) => p < 0.05).length;

// Oakridge Garden Centre: 18 months of visitors and the running total of newsletter subscribers
const VISITORS = [3200, 3500, 4800, 6200, 7400, 6900, 6100, 5200, 4300, 3600, 3300, 3900, 3400, 3700, 5100, 6600, 7800, 7200];
const ADDED = [60, 72, 95, 118, 150, 131, 125, 98, 90, 70, 64, 85, 66, 80, 99, 130, 161, 140];
const TOTAL = ADDED.reduce((acc, a) => [...acc, (acc.at(-1) ?? 1140) + a], []);
const oakLevels = C.pearson(TOTAL, VISITORS).r, oakChanges = C.pearson(TOTAL.slice(1).map((v, i) => v - TOTAL[i]), VISITORS.slice(1)).r;
const oakSheet = { cells: { A1: 'Month', B1: 'Subscribers (total)', C1: 'Visitors', ...col('A', 2, VISITORS.map((_, i) => `M${i + 1}`)), ...col('B', 2, TOTAL), ...col('C', 2, VISITORS), E1: 'r (levels)', F1: '=CORREL(B2:B19,C2:C19)', E2: 'r (monthly additions, visitors)' } };

// Mallory Freight: drivers on shift, late deliveries and parcels, 45 days
const MF = { xy: 0.48, xz: 0.88, yz: 0.66, n: 45 };
const fwP = C.partialFromR(MF.xy, MF.xz, MF.yz);

export const items = [
  // ---------------------------------------------------------------- correlation-matrices
  {
    id: 'b05-m4-1', lesson: 'correlation-matrices', type: 'num', kind: 'numerical',
    prompt: 'Brookside Clinics (fictional) builds a correlation matrix of 9 weekly measures and applies Holm’s method at α = 0.05 to all the pairs. What threshold is the third-smallest p-value compared with? Give five decimal places.',
    answer: Math.round((0.05 / 34) * 1e5) / 1e5, check: () => { const m = (9 * 8) / 2; return 0.05 / (m - 3 + 1); }, unit: '', places: 5, tol: 0.000005,
    wrong: [
      { value: Math.round((0.05 / 36) * 1e5) / 1e5, say: 'That is the threshold for the smallest p-value (α ÷ m). Holm’s third comparison uses α ÷ (m − 3 + 1) = α ÷ 34.' },
      { value: Math.round((0.05 / 7) * 1e5) / 1e5, say: 'The family is the 9 × 8 ÷ 2 = 36 pairs, not the 9 measures.' },
      { value: Math.round(((3 * 0.05) / 36) * 1e5) / 1e5, say: 'That is the Benjamini–Hochberg threshold for rank 3, k × q ÷ m. Holm’s is α ÷ (m − k + 1).' },
    ],
    solution: 'Nine measures give 9 × 8 ÷ 2 = 36 pairs. Holm compares the k-th smallest p-value with α ÷ (m − k + 1): for k = 3, 0.05 ÷ 34 ≈ 0.00147, provided the two smaller p-values were already below 0.05 ÷ 36 and 0.05 ÷ 35.',
  },
  {
    id: 'b05-m4-2', lesson: 'correlation-matrices', type: 'formula', kind: 'applied',
    prompt: 'Rowan Hotels (fictional) tested all 15 pairs of six nightly measures. B2:B16 hold the p-values. In C2, calculate the Bonferroni-adjusted p-value for the pair in row 2, capped at 1, using the count of p-values in the list, so that the formula fills down to C16.',
    sheet: { cells: { A1: 'Pair', B1: 'p-value', C1: 'Bonferroni-adjusted p', ...col('A', 2, larkPairs), ...col('B', 2, LARK) } },
    cell: 'C2', fill: 'C2:C16', answer: '=MIN(1,B2*COUNT($B$2:$B$16))',
    alt: ['=MIN(B2*COUNT($B$2:$B$16),1)', '=MIN(1,COUNT($B$2:$B$16)*B2)', '=IF(B2*COUNT($B$2:$B$16)>1,1,B2*COUNT($B$2:$B$16))', '=MIN(1,B2*15)', '=MIN(1,15*B2)'],
    view: 'A1:C16', formats: { B: '0.0000', C: '0.0000' }, widths: { A: 30, C: 20 },
    wrong: [
      { formula: '=B2*COUNT($B$2:$B$16)', say: 'Without MIN(1, …) large p-values become impossible values above 1, such as 13.8. Cap the adjusted value at 1.' },
      { formula: '=MIN(1,B2*COUNT(B2:B16))', say: 'Without dollar signs the range shrinks as you fill down, so lower rows multiply by fewer tests. Fix $B$2:$B$16.' },
      { formula: '=MIN(1,B2/COUNT($B$2:$B$16))', say: 'Dividing the p-value makes it smaller. Bonferroni either divides α by m or, equivalently, multiplies each p-value by m.' },
    ],
    solution: `<x>=MIN(1,B2*COUNT($B$2:$B$16))</x>. Compared with 0.05, ${nSig(larkB)} pairs survive Bonferroni, against ${nSig(LARK)} unadjusted; Holm’s method keeps ${nSig(larkH)} and Benjamini–Hochberg ${nSig(larkF)}.`,
  },
  {
    id: 'b05-m4-3', lesson: 'correlation-matrices', type: 'mc', kind: 'conceptual',
    prompt: 'Two analysts adjust the same 45 p-values at 0.05. One uses Holm’s method, the other Benjamini–Hochberg. Which statement is correct?',
    options: [
      'Benjamini–Hochberg rejects at least as many, since it controls the share of false discoveries.',
      'Holm rejects at least as many as Benjamini–Hochberg, because its thresholds rise more steeply after the first test is rejected.',
      'The two always reject the same hypotheses, because both start by comparing the smallest p-value with 0.05 ÷ 45.',
      'Holm needs the tests to be independent, while Benjamini–Hochberg holds whatever the dependence between them.',
    ],
    answer: 0,
    feedback: {
      1: 'Holm’s thresholds rise slowly, from α ÷ m to α; Benjamini–Hochberg’s rise in a straight line, from α ÷ m to α, and are never lower.',
      2: 'They start at the same threshold but diverge after it; with moderate p-values they usually reject different numbers.',
      3: 'The reverse: Holm’s guarantee holds under any dependence, while Benjamini–Hochberg’s was proved for independent tests.',
    },
    solution: 'Benjamini–Hochberg’s k-th threshold, k × 0.05 ÷ 45, is never below Holm’s, 0.05 ÷ (46 − k), and it is a step-up procedure, so it rejects at least as many hypotheses. The price is a weaker guarantee: it controls the expected share of false discoveries, not the chance of any.',
  },
  {
    id: 'b05-m4-4', lesson: 'correlation-matrices', type: 'mc', kind: 'applied',
    prompt: 'A two-branch bakery’s matrix over both branches shows loaves baked and loaves sold correlating at 0.62. Inside each branch they correlate at 0.95. The city-centre branch bakes and sells about twice as many loaves as the suburban one, but throws more away. What should the manager take from the pooled 0.62?',
    options: [
      'Little: it mixes two branches with different waste rates; the within-branch values say more.',
      'That about 62% of the variation in sales is explained by the number of loaves baked across the two branches.',
      'That baking more loaves is much less closely tied to sales than the bakery’s managers had assumed.',
      'That the pooled figure should be preferred, because it rests on twice as many days as either branch alone.',
    ],
    answer: 0,
    feedback: {
      1: 'r² would be 0.38, not 0.62, and the pooled value mixes two branches in any case.',
      2: 'Inside each branch the link is very close (0.95). The pooled value is lower because the branches sit on different lines.',
      3: 'More rows don’t make a pooled correlation more meaningful when the groups differ in level.',
    },
    solution: 'Pooling two branches whose points lie on different lines (the city branch wastes more for a given bake) blurs two tight relationships into one looser cloud. Read the matrix within each branch, and use the pooled value only as a warning that the branches differ.',
  },
  // ---------------------------------------------------------------- partial-correlation
  {
    id: 'b05-m4-5', lesson: 'partial-correlation', type: 'num', kind: 'numerical',
    prompt: 'Mallory Freight (fictional) recorded 45 days. Drivers on shift and late deliveries correlate at 0.48; drivers and parcels handled at 0.88; late deliveries and parcels at 0.66. Calculate the partial correlation of drivers and late deliveries holding parcels fixed. Give three decimal places.',
    answer: Math.round(fwP * 1000) / 1000, check: () => (0.48 - 0.88 * 0.66) / Math.sqrt((1 - 0.88 ** 2) * (1 - 0.66 ** 2)), unit: '', places: 3, tol: 0.0015,
    wrong: [
      { value: Math.round((0.48 - 0.88 * 0.66) * 1000) / 1000, say: 'That is the numerator. Divide by √((1 − 0.88²)(1 − 0.66²)).' },
      { value: Math.round(((0.48 - 0.5808) / ((1 - 0.7744) * (1 - 0.4356))) * 1000) / 1000, say: 'The denominator is a square root: √(0.2256 × 0.5644).' },
    ],
    solution: `(0.48 − 0.88 × 0.66) ÷ √((1 − 0.7744)(1 − 0.4356)) = −0.1008 ÷ ${fx(Math.sqrt(0.2256 * 0.5644), 4)} ≈ ${neg(fwP, 3)}. On days with the same number of parcels, more drivers went with fewer late deliveries; the +0.48 came from heavy days having both.`,
  },
  {
    id: 'b05-m4-6', lesson: 'partial-correlation', type: 'mc', kind: 'applied',
    prompt: 'A bank studies applicants it has already hired and finds that, among its hires, interview scores and aptitude-test scores correlate at −0.30. The bank hires applicants whose combined score is high. Across all applicants the two scores are positively related. What explains the negative correlation among hires?',
    options: [
      'Hiring depends on both scores, so looking only at hires holds a collider fixed and pushes the two scores apart.',
      'Interview skill and aptitude genuinely work against each other, but the effect only shows among able people.',
      'The hires are fewer than all applicants, so their correlation is less precise and can take either sign by chance.',
      'Aptitude is a confounder of interview scores, so it should have been held fixed with a partial correlation.',
    ],
    answer: 0,
    feedback: {
      1: 'Nothing suggests a real trade-off; selecting on the combined score produces the pattern by itself.',
      2: 'Imprecision can’t explain a systematic reversal from a positive link to −0.30.',
      3: 'Aptitude is one of the two variables, not a third one, and the problem is the selection on their common effect.',
    },
    solution: 'Being hired is a common effect of the two scores. Among hires, someone with a modest interview must have had a strong test, and vice versa, so the scores look negatively related even though they go together in the full applicant pool. Selecting on a collider creates the link.',
  },
  {
    id: 'b05-m4-7', lesson: 'partial-correlation', type: 'classify', kind: 'conceptual',
    prompt: 'A delivery company asks whether giving drivers route-planning software goes with fewer late deliveries. For each variable, say whether it should be held fixed.',
    items: [
      'Each depot’s parcel volume, which affects both whether software was installed first and how many deliveries are late.',
      'The distance driven per delivery, which the software shortens and which affects lateness.',
      'Whether a customer filed a complaint, which both lateness and missing software make more likely.',
      'The depot’s region, which affects both the roll-out order and traffic delays.',
    ],
    categories: ['Hold it fixed (confounder)', 'Don’t hold it fixed'],
    answer: [0, 1, 1, 0],
    feedback: {
      1: 'Distance is how the software works: a mediator. Holding it fixed hides the software’s effect.',
      2: 'Complaints are a common effect of lateness and missing software: a collider.',
    },
    solution: 'Parcel volume and region drive both the roll-out and lateness: confounders to hold fixed. Distance per delivery is a mediator and complaints a collider; holding either fixed would distort the answer.',
  },
  // ---------------------------------------------------------------- correlation-and-causation
  {
    id: 'b05-m4-8', lesson: 'correlation-and-causation', type: 'formula', kind: 'numerical',
    prompt: 'Oakridge Garden Centre (fictional) has 18 months of data: the running total of newsletter subscribers (B) and the month’s visitors (C). F1 shows the correlation of the totals with visitors. In F2, calculate in one formula the correlation between each month’s addition to the subscriber total (from month 2) and that month’s visitors.',
    sheet: oakSheet,
    cell: 'F2', answer: '=CORREL(B3:B19-B2:B18,C3:C19)',
    alt: ['=CORREL(C3:C19,B3:B19-B2:B18)'],
    require: ['CORREL'],
    view: 'A1:F19', formats: { B: '#,##0', C: '#,##0', F1: '0.000', F2: '0.000' }, widths: { B: 19, E: 28 },
    wrong: [
      { formula: '=CORREL(B3:B19-B2:B18,C2:C18)', say: 'That pairs each month’s addition with the previous month’s visitors. Use the same months: C3:C19.' },
      { formula: '=CORREL(B2:B19,C2:C19)', say: 'That is the correlation of the running totals, already in F1, which mixes in the growth of the list.' },
    ],
    solution: `<x>=CORREL(B3:B19-B2:B18,C3:C19)</x> = ${fx(oakChanges, 3)}, against ${fx(oakLevels, 3)} for the running totals. The total only ever rises, so its correlation with seasonal visitors is muddied by the trend; the monthly additions track the busy months closely.`,
  },
  {
    id: 'b05-m4-9', lesson: 'correlation-and-causation', type: 'classify', kind: 'applied',
    prompt: 'Each finding comes from observational data. Choose the explanation, other than cause, that most threatens it.',
    items: [
      'Streets with more police patrols record more burglaries; patrols are sent where burglaries have been reported.',
      'A town’s smartphone ownership and its average house price both rose every year for a decade.',
      'Members who answered a gym’s satisfaction survey visit more often than members who didn’t answer.',
      'Of 120 store features screened against sales, six were significant at 5%.',
    ],
    categories: ['Reverse causation', 'Common trend', 'Selection', 'Chance'],
    answer: [0, 1, 2, 3],
    feedback: {
      0: 'Burglaries come first and bring the patrols.',
      2: 'Keen members are likelier both to answer and to visit often; the survey sample isn’t all members.',
      3: '120 × 0.05 = 6: exactly what chance alone would produce.',
    },
    solution: 'Patrols follow burglaries (reverse causation); phones and house prices share a decade-long trend; survey answerers are a selected group; six significant results out of 120 is what chance produces.',
  },
  {
    id: 'b05-m4-10', lesson: 'correlation-and-causation', type: 'mc', kind: 'conceptual',
    prompt: 'A manager reads that Bradford Hill listed nine considerations for judging causation and says: “Our link fails specificity, so it can’t be causal.” What is wrong with this reasoning?',
    options: [
      'Hill said no consideration is required or decisive; failing one weighs against a cause, no more.',
      'Specificity was removed from the list after Hill’s lecture, so it no longer counts among the considerations.',
      'Hill’s considerations apply only to medicine, so they can’t be used to judge any link in a business’s data.',
      'Specificity is the most important of the nine, so failing it does rule out a cause but only for small effects.',
    ],
    answer: 0,
    feedback: {
      1: 'Specificity is one of the nine Hill listed in 1965; nothing was removed.',
      2: 'Hill wrote about disease and environment, but the reasoning (strength, consistency, timing, gradient, mechanism, experiment) applies to any causal question.',
      3: 'Hill gave no ranking that makes any one consideration decisive.',
    },
    solution: 'Hill stressed that none of his nine viewpoints can prove or disprove a cause and none is a sine qua non. Many real causes affect several outcomes, so specificity often fails; weigh it with the rest of the evidence, and seek an experiment where possible.',
  },
  {
    id: 'b05-m4-11', lesson: 'correlation-and-causation', type: 'mc', kind: 'applied',
    prompt: 'A chain of 40 car washes wants to know whether a loyalty card raises visits per customer. Cards are offered at the till, and customers who take one already visit more. Which plan gives the strongest causal evidence?',
    options: [
      'Offer the card at 20 car washes chosen by lot, and compare visits per customer with the other 20 over the same months.',
      'Compare the visits of card holders with those of non-holders, holding fixed each customer’s visits before the card.',
      'Correlate the number of cards issued at each car wash with its visits per customer over the past year.',
      'Ask customers in a survey whether the card made them come more often, and report the share who say yes.',
    ],
    answer: 0,
    feedback: {
      1: 'Holding past visits fixed helps, but holders still chose the card, so anything that made them choose it may also raise visits.',
      2: 'Sites that issue more cards may be busier for other reasons: confounding, and only 40 points.',
      3: 'Self-reports of why people did something are weak evidence of cause, and answerers are a selected group.',
    },
    solution: 'Assigning the card to sites by lot means nothing else systematically differs between card and no-card sites, so a difference in visits per customer can be attributed to the card (or to chance, which a test of the 20 against 20 handles). Comparing customers who chose the card is confounded by who chooses it.',
  },
];
