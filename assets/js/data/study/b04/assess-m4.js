// assess-m4.js — B04 module 4 test: Categories and groups (proportions-and-chi-square, anova). New questions on new
// businesses, not copies of lesson exercises. No hints; solutions are shown when the student reviews the test. Every
// business, person and number is fictional. Formula items are marked by their results; every num item's `check`
// recomputes its answer.
import * as I from '../../../core/inference.js?v=18';

const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));

// Plover Car Share: bookings ending with a damage report, by member age
const LATE = I.propTest2(48, 400, 66, 900);
// Crane Street Clinic: missed appointments by weekday, against the share of appointments booked each weekday
const MISSED = [38, 22, 25, 24, 41], BOOKED = [0.22, 0.2, 0.2, 0.18, 0.2], DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const MS = I.chisqGof(MISSED, BOOKED);
const clinicSheet = {
  cells: {
    A1: 'Weekday', B1: 'Missed (O)', C1: 'Expected (E)', D1: 'Share booked', F1: 'χ²',
    ...col('A', 2, DAYS), ...col('B', 2, MISSED), ...col('D', 2, BOOKED),
    ...Object.fromEntries(DAYS.map((_, i) => [`C${i + 2}`, `=$B$7*D${i + 2}`])),
    A7: 'Total', B7: '=SUM(B2:B6)', C7: '=SUM(C2:C6)', D7: '=SUM(D2:D6)',
  },
  fixed: ['D2:D6'],
};
// a bakery chain: loyalty-card sign-ups at three shops
const LOYAL = [[64, 41, 35], [136, 159, 65]];
const LY = I.chisqIndependence(LOYAL);
const loyaltySheet = {
  cells: {
    A1: 'Observed', B1: 'Riverside', C1: 'High Street', D1: 'Station', E1: 'Total',
    A2: 'Signed up', B2: LOYAL[0][0], C2: LOYAL[0][1], D2: LOYAL[0][2], E2: '=SUM(B2:D2)',
    A3: 'Didn’t', B3: LOYAL[1][0], C3: LOYAL[1][1], D3: LOYAL[1][2], E3: '=SUM(B3:D3)',
    A4: 'Total', B4: '=SUM(B2:B3)', C4: '=SUM(C2:C3)', D4: '=SUM(D2:D3)', E4: '=SUM(E2:E3)',
    A6: 'Expected', B6: 'Riverside', C6: 'High Street', D6: 'Station', A7: 'Signed up', A8: 'Didn’t',
  },
};
// an online retailer: returns from two warehouses
const RET = I.propTest2(7320, 120000, 6960, 120000);
const RETX = I.chisqIndependence([[7320, 120000 - 7320], [6960, 120000 - 6960]]);
// a ferry operator: missed sailings by booking route
const FERRY = I.chisqIndependence([[30, 220], [20, 230]]);
// Plover Car Share: minutes to clean a car at three depots
const DEPOTS = [[24, 27, 22, 25, 29, 26, 23, 28], [31, 28, 33, 30, 29, 32], [26, 25, 29, 27, 24, 30, 28, 26, 27]];
const DP = I.anova1(DEPOTS);
const depotSheet = {
  cells: {
    A1: 'Car', B1: 'Northside', C1: 'Docklands', D1: 'Airport', F1: 'MS within',
    ...col('A', 2, Array.from({ length: 9 }, (_, i) => `C${i + 1}`)),
    ...col('B', 2, DEPOTS[0]), ...col('C', 2, DEPOTS[1]), ...col('D', 2, DEPOTS[2]),
  },
};

export const items = [
  // ---------------------------------------------------------------- proportions-and-chi-square
  {
    id: 'b04-m4-1', lesson: 'proportions-and-chi-square', type: 'num', kind: 'numerical',
    prompt: 'Plover Car Share (fictional) finds that 48 of 400 bookings by members under 25 ended with a damage report, against 66 of 900 bookings by members aged 25 and over. Calculate the two-proportion z statistic for under-25s minus older members, as used to test H₀: p₁ = p₂. Give two decimal places.',
    answer: Math.round(LATE.z * 100) / 100, check: () => { const p = (48 + 66) / 1300; return (48 / 400 - 66 / 900) / Math.sqrt(p * (1 - p) * (1 / 400 + 1 / 900)); }, unit: '', places: 2, tol: 0.02,
    wrong: [
      { value: Math.round((LATE.diff / LATE.se) * 100) / 100, say: 'That uses the unpooled standard error, the one for a confidence interval. The test assumes p₁ = p₂, so it pools: p̄ = 114 ÷ 1,300.' },
      { value: Math.round((LATE.diff / Math.sqrt((LATE.pool * (1 - LATE.pool)) / 1300)) * 100) / 100, say: 'That standard error treats the 1,300 bookings as one sample. The difference between two samples needs 1/n₁ + 1/n₂.' },
    ],
    solution: `p̂₁ = 48 ÷ 400 = 0.120 and p̂₂ = 66 ÷ 900 ≈ 0.0733. Pooled p̄ = 114 ÷ 1,300 ≈ ${LATE.pool.toFixed(4)}; SE = √(p̄(1 − p̄)(1/400 + 1/900)) ≈ ${LATE.sePool.toFixed(4)}; z = 0.0467 ÷ ${LATE.sePool.toFixed(4)} ≈ ${LATE.z.toFixed(2)}, a two-sided p-value of about ${LATE.pValue.toFixed(3)}. Bookings by under-25s ended with a damage report more often (12.0% against 7.3%).`,
  },
  {
    id: 'b04-m4-2', lesson: 'proportions-and-chi-square', type: 'formula', kind: 'numerical',
    prompt: 'Crane Street Clinic (fictional) had 150 missed appointments in a month. Column C holds the number expected on each weekday if missing were unrelated to the day (the total times each weekday’s share of bookings). In F2, calculate the goodness-of-fit statistic χ² in one formula.',
    sheet: clinicSheet, cell: 'F2', answer: '=SUMPRODUCT((B2:B6-C2:C6)^2/C2:C6)',
    alt: ['=SUMPRODUCT((B2:B6-C2:C6)^2,1/C2:C6)', '=SUMPRODUCT((B2:B6-C2:C6)*(B2:B6-C2:C6)/C2:C6)'],
    view: 'A1:F7', formats: { C: '0.00', D: '0%', F2: '0.000' }, widths: { A: 11, B: 11, C: 13, D: 13 },
    wrong: [
      { formula: '=SUMPRODUCT((B2:B6-C2:C6)^2)', say: 'Each squared gap must be divided by its expected count before adding: (O − E)² ÷ E.' },
      { formula: '=SUMPRODUCT((B2:B6-C2:C6)^2/B2:B6)', say: 'Divide by the expected counts in C, not the observed counts in B.' },
      { formula: '=CHISQ.TEST(B2:B6,C2:C6)', say: 'CHISQ.TEST returns the p-value, not the statistic. χ² is Σ(O − E)² ÷ E, which SUMPRODUCT adds up.' },
    ],
    solution: `<x>=SUMPRODUCT((B2:B6-C2:C6)^2/C2:C6)</x> ≈ ${MS.stat.toFixed(3)}: Friday (41 against 30 expected) and Tuesday (22 against 30) contribute most. With 5 − 1 = 4 degrees of freedom, <x>=CHISQ.DIST.RT(F2,4)</x> ≈ ${MS.p.toFixed(3)}: not significant at the 5% level, though the Friday pattern may be worth watching.`,
  },
  {
    id: 'b04-m4-3', lesson: 'proportions-and-chi-square', type: 'mc', kind: 'conceptual',
    prompt: 'A survey cross-tabulates customers’ preferred contact method (four methods) against age band (three bands). Three cells’ expected counts are 3.1, 2.6 and 0.8; every other expected count is above 8. What is the best response?',
    options: [
      'Merge that category with a neighbouring one that makes sense, or collect more data, and then test.',
      'Delete the row that contains the small cell and run the test of independence on the rest of the table.',
      'Convert every count in the table to a percentage of its row, so that no cell is smaller than 5.',
      'Run the test anyway: CHISQ.TEST returns an error when an expected count is too small for it.',
    ],
    answer: 0,
    feedback: {
      1: 'Deleting a row throws away real customers and changes the question. Merging keeps them while making the expected counts large enough.',
      2: 'A chi-square test needs counts. Percentages change the scale of χ² and make the test meaningless.',
      3: 'CHISQ.TEST doesn’t check the expected counts; it returns a p-value whose chi-square approximation may be poor.',
    },
    solution: 'The chi-square approximation needs the expected counts to be large: three of the 12 cells are below 5 and one is below 1, so even the looser rule some texts allow (no more than a fifth of cells below 5, none below 1) fails. Merge the sparse category with a similar one (two age bands, say, or two contact methods) or collect more responses, then rerun the test on counts. Excel won’t warn you.',
  },
  {
    id: 'b04-m4-4', lesson: 'proportions-and-chi-square', type: 'formula', kind: 'applied',
    prompt: 'A bakery chain (fictional) counts loyalty-card sign-ups at three shops (B2:D3, totals in row 4 and column E). In B7, calculate the count expected for Riverside sign-ups if signing up were independent of the shop, written so that it fills across and down to D8.',
    sheet: loyaltySheet, cell: 'B7', fill: 'B7:D8', answer: '=$E2*B$4/$E$4',
    alt: ['=B$4*$E2/$E$4', '=$E2/$E$4*B$4'],
    view: 'A1:E8', formats: { B7: '0.0', C7: '0.0', D7: '0.0', B8: '0.0', C8: '0.0', D8: '0.0' }, widths: { A: 10, C: 12 },
    wrong: [
      { formula: '=E2*B4/E4', say: 'Without $ the references move as you fill, away from the totals. Lock the row-total column ($E2), the column-total row (B$4) and the grand total ($E$4).' },
      { formula: '=$E$2*B$4/$E$4', say: 'With $E$2 every row uses the sign-up total, so row 8 is wrong. Lock only the column: $E2.' },
      { formula: '=$E2*$B$4/$E$4', say: 'With $B$4 every column uses Riverside’s total. Lock only the row: B$4.' },
    ],
    solution: `<x>=$E2*B$4/$E$4</x>, filled to D8: row total × column total ÷ grand total, giving 56, 56 and 28 expected sign-ups and 144, 144 and 72 non-sign-ups. Then <x>=CHISQ.TEST(B2:D3,B7:D8)</x> ≈ ${LY.p.toFixed(4)} (χ² ≈ ${LY.stat.toFixed(2)}, 2 df): sign-up rates differ between the shops, High Street’s 20.5% being lowest.`,
  },
  {
    id: 'b04-m4-5', lesson: 'proportions-and-chi-square', type: 'multi', kind: 'applied',
    prompt: 'An online retailer (fictional) compares returns from two warehouses: 7,320 of 120,000 orders (6.1%) from one and 6,960 of 120,000 (5.8%) from the other. The two-proportion test gives z ≈ 3.11 and p ≈ 0.002. Select all the statements that are justified.',
    options: [
      'The difference is statistically significant at the 5% level.',
      'The gap of 0.3 percentage points is small; whether it matters is a business judgement.',
      'Cramér’s V for the 2 × 2 table would be close to 0.',
      'Because p is so small, the two warehouses’ return rates differ by a large amount.',
      'The p-value is the probability that the two warehouses have the same return rate.',
      'The first warehouse’s handling causes the extra returns.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'With 240,000 orders even a tiny difference is detected. The p-value measures evidence, not size: the gap is 0.3 points.',
      4: 'A p-value is computed assuming the rates are equal; it isn’t the probability that they are.',
      5: 'The warehouses may ship different products to different customers. The test shows a difference, not its cause.',
    },
    solution: `z ≈ ${RET.z.toFixed(2)}, p ≈ ${RET.pValue.toFixed(3)}: significant. But the gap is 0.3 points (95% CI ${(RET.low * 100).toFixed(2)} to ${(RET.high * 100).toFixed(2)} points), and V = √(χ² ÷ n) ≈ √(${RETX.stat.toFixed(2)} ÷ 240,000) ≈ ${RETX.cramersV.toFixed(4)}: a very weak association made significant by a huge sample. Whether 0.3 points is worth acting on depends on the cost of returns, and the cause needs investigating separately.`,
  },
  {
    id: 'b04-m4-6', lesson: 'proportions-and-chi-square', type: 'num', kind: 'numerical',
    prompt: 'A ferry operator (fictional) finds that 30 of 250 passengers who booked online missed their sailing, against 20 of 250 who booked at the port. Calculate χ² for the test of independence on this 2 × 2 table (no continuity correction). Give two decimal places.',
    answer: Math.round(FERRY.stat * 100) / 100, check: () => { const E = [[25, 225], [25, 225]], O = [[30, 220], [20, 230]]; return O.flat().reduce((s, o, i) => s + (o - E.flat()[i]) ** 2 / E.flat()[i], 0); }, unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: 2, say: 'You included only the two “missed” cells. The test adds (O − E)² ÷ E over all four cells, including the passengers who sailed.' },
      { value: Math.round(Math.sqrt(FERRY.stat) * 100) / 100, say: 'That is |z| from the two-proportion test. For a 2 × 2 table χ² = z².' },
      { value: Math.round(2 * FERRY.stat * 100) / 100, say: 'Each cell’s contribution counts once: 1 + 1 + 0.111 + 0.111.' },
    ],
    solution: `Overall 50 of 500 (10%) missed their sailing, so each route expects 25 missed and 225 sailed. χ² = (30 − 25)² ÷ 25 + (20 − 25)² ÷ 25 + (220 − 225)² ÷ 225 + (230 − 225)² ÷ 225 = 1 + 1 + 0.111 + 0.111 ≈ ${FERRY.stat.toFixed(2)}, with 1 df and p ≈ ${FERRY.p.toFixed(2)}: no evidence that booking route is related to missing a sailing.`,
  },
  // ---------------------------------------------------------------- anova
  {
    id: 'b04-m4-7', lesson: 'anova', type: 'num', kind: 'applied',
    prompt: 'A bank (fictional) tests three redesigned loan-application forms, comparing each with its current form on completion time: three planned comparisons, not every pair. It wants a family-wise error rate of at most 0.05. With a Bonferroni correction, at what level should each comparison be tested? Give four decimal places.',
    answer: Math.round((0.05 / 3) * 10000) / 10000, check: () => 0.05 / 3, unit: '', places: 4, tol: 0.0001,
    wrong: [
      { value: Math.round((0.05 / 6) * 10000) / 10000, say: 'That divides by all six pairs of the four forms. The bank makes only three comparisons, each new form against the current one.' },
      { value: 0.0125, say: 'That divides by the number of forms, 4. Bonferroni divides α by the number of comparisons made, 3.' },
      { value: 0.05, say: 'At 0.05 each, three comparisons give up to about a 14% chance of at least one false alarm. Divide α by 3.' },
    ],
    solution: 'Bonferroni divides the family-wise α by the number of comparisons actually made: 0.05 ÷ 3 ≈ 0.0167. Planning three comparisons with the current form, rather than testing all six pairs, lets each test use a less strict level.',
  },
  {
    id: 'b04-m4-8', lesson: 'anova', type: 'formula', kind: 'numerical',
    prompt: 'Plover Car Share (fictional) timed car cleaning (minutes) at three depots, in B2:B9, C2:C7 and D2:D10. In F2, calculate the mean square within groups for a one-way ANOVA in one formula.',
    sheet: depotSheet, cell: 'F2', answer: '=(DEVSQ(B2:B9)+DEVSQ(C2:C7)+DEVSQ(D2:D10))/(COUNT(B2:D10)-3)',
    alt: ['=(DEVSQ(B2:B9)+DEVSQ(C2:C7)+DEVSQ(D2:D10))/(COUNT(B2:D10)-COLUMNS(B2:D10))', '=((COUNT(B2:B9)-1)*VAR.S(B2:B9)+(COUNT(C2:C7)-1)*VAR.S(C2:C7)+(COUNT(D2:D10)-1)*VAR.S(D2:D10))/(COUNT(B2:D10)-3)'],
    view: 'A1:F10', formats: { F2: '0.000' }, widths: { B: 11, C: 11, F: 11 },
    wrong: [
      { formula: '=(DEVSQ(B2:B9)+DEVSQ(C2:C7)+DEVSQ(D2:D10))/(COUNT(B2:D10)-1)', say: 'N − 1 is the total df. The within-groups df is N − k = 23 − 3 = 20.' },
      { formula: '=DEVSQ(B2:D10)/(COUNT(B2:D10)-3)', say: 'DEVSQ of all the times measures them from the grand mean: the total SS. Within groups, take each depot’s DEVSQ and add them.' },
      { formula: '=(VAR.S(B2:B9)+VAR.S(C2:C7)+VAR.S(D2:D10))/3', say: 'The plain average of the variances is MS within only when the groups are the same size. Here they aren’t: weight each by nᵢ − 1, which adding the DEVSQs does.' },
    ],
    solution: `SS within = DEVSQ of each depot, added: ${DP.ssw.toFixed(3)}. df within = 23 − 3 = 20, so MS within ≈ ${DP.msw.toFixed(3)}. With SS between ${DP.ssb.toFixed(3)} on 2 df, F ≈ ${DP.F.toFixed(2)} and p ≈ ${DP.p.toFixed(4)}: the depots’ mean cleaning times differ, Docklands being slowest.`,
  },
  {
    id: 'b04-m4-9', lesson: 'anova', type: 'mc', kind: 'conceptual',
    prompt: 'A garden centre (fictional) trials four fertiliser blends on 32 tomato plants, eight per blend. A one-way ANOVA of yield gives F = 1.6 and p = 0.21. What can it conclude?',
    options: [
      'No evidence that mean yield differs between the blends, though real differences may have been missed.',
      'The four blends produce the same mean yield, so the cheapest blend is as good as any of the other three.',
      'There is a 21% probability that the four blends really produce the same mean yield as one another.',
      'It should run t tests on all six pairs of blends instead, because pairwise tests are more sensitive.',
    ],
    answer: 0,
    feedback: {
      1: 'Not rejecting H₀ isn’t accepting it. With eight plants per blend, moderate differences could easily go undetected.',
      2: 'A p-value is the probability of an F this large if the means were equal, not the probability that they are equal.',
      3: 'Six unadjusted t tests inflate the family-wise error rate; testing until something is significant is the multiple-testing trap.',
    },
    solution: 'p = 0.21 is above any usual α, so there is no evidence of a difference in mean yield. That isn’t evidence that the blends are equal: 32 plants give little power, so the centre should report the means with intervals and, if the decision matters, run a larger trial.',
  },
  {
    id: 'b04-m4-10', lesson: 'anova', type: 'mc', kind: 'applied',
    prompt: 'An analyst (fictional) compares mean repair time across four service centres. Anova: Single Factor gives F = 3.12 on 3 and 93 df, P-value 0.03. Its SUMMARY shows Counts of 30, 28, 8 and 31 and Variances of 4.4, 5.8, 39.7 and 4.8 (hours squared). Welch’s ANOVA on the same data gives p = 0.2. Which result should the analyst report, and why?',
    options: [
      'Welch’s p of 0.2: the smallest centre has by far the largest variance, which makes the ordinary F find differences too often.',
      'The ordinary p of 0.03, because Anova: Single Factor is the standard method and Welch’s ANOVA is only an approximation of it.',
      'Whichever p is the smaller, since a test that detects a difference is more powerful than a test that fails to detect one.',
      'Neither: with variances this unequal no test can compare the means, so the analyst should only describe the four centres.',
    ],
    answer: 0,
    feedback: {
      1: 'The ordinary F assumes equal variances. Here they run from 4.4 to 39.7, and the largest belongs to the smallest group, the case in which the ordinary F raises false alarms. Welch’s ANOVA is built for unequal variances.',
      2: 'Picking whichever p-value looks better after running both is p-hacking. Choose the test the data’s conditions call for, ideally before seeing the results.',
      3: 'Welch’s ANOVA compares means without assuming equal variances; that is what it is for.',
    },
    solution: 'The variances differ ninefold (39.7 ÷ 4.4; the SDs about 6.3 against 2.1 hours), far beyond the rule of thumb, and the largest variance belongs to the smallest centre (8 repairs). That pairing makes the ordinary F liberal: it finds differences too often. Report Welch’s p = 0.2, no evidence that mean repair times differ, and say why the ordinary F = 3.12 (p = 0.03) was set aside.',
  },
  {
    id: 'b04-m4-11', lesson: 'anova', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each statement about the output of Excel’s Anova: Single Factor as true or false.',
    items: [
      'If F is above F crit, the P-value is below Alpha.',
      'SS for Between Groups divided by SS for Total is the share of variation between the groups.',
      'MS for Within Groups estimates the common variance whether or not the group means differ.',
      'A larger F always means larger differences between the group means.',
      'Changing Alpha in the dialog changes F and its P-value.',
      'The df for Total is N − k.',
    ],
    categories: ['True', 'False'],
    answer: [0, 0, 0, 1, 1, 1],
    feedback: {
      3: 'F also grows with sample size. Judge the size of the differences from the means and η².',
      4: 'Alpha changes only F crit. F and the P-value depend on the data alone.',
      5: 'Total df is N − 1; Within Groups df is N − k.',
    },
    solution: 'True: F > F crit and P-value < Alpha are the same decision; SSB ÷ SST is η²; MS within is a pooled variance that doesn’t depend on the means. False: F depends on sample size as well as on the gaps; Alpha affects only F crit; the total df is N − 1.',
  },
];
