// assess-m2.js — M06 module 2 test: Segments and cohorts (rfm-segments, cohort-analysis). New questions on new
// scenarios, not copies of lesson exercises. No hints; solutions are shown when the student reviews the test.
// Lantern's members come from case.js (members scored on 31 October with churnTable(); the cohort triangle from
// core/customer.js cohortTable); Halvering Hair Studio and Tolhurst Pets are fictional. Formula items are marked by
// their results on changed copies; every num item's `check` recomputes its answer.
import { churnTable, VISIT_LIST, joinMap, members } from './case.js?v=25';
import * as CU from '../../../core/customer.js?v=25';

const sum = (a) => a.reduce((x, y) => x + y, 0);
const r1 = (x) => Math.round(x * 10) / 10, r2 = (x) => Math.round(x * 100) / 100;
const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));

// members scored on 31 October 2027 (joined by 31 August), and whether they came back in November–December
const OC = CU.rfm(churnTable(), { k: 5, method: 'quantile' });
const NO = OC.length, BACK = sum(OC.map((c) => c.back));
const SAMPLE = OC.filter((_, i) => i % 41 === 7);                // every 41st member, a spread across the base
const ns = SAMPLE.length, LS = ns + 1;
const octCells = { A1: 'member', B1: 'R', C1: 'F', D1: 'M', E1: 'FM', F1: 'back Nov–Dec',
  ...col('A', 2, SAMPLE.map((c) => c.id)), ...col('B', 2, SAMPLE.map((c) => c.R)), ...col('C', 2, SAMPLE.map((c) => c.F)),
  ...col('D', 2, SAMPLE.map((c) => c.M)), ...col('E', 2, SAMPLE.map((c) => c.FM)), ...col('F', 2, SAMPLE.map((c) => c.back)),
  H1: 'R at most', I1: 4, H2: 'FM at least', I2: 4, H3: 'return rate' };
const block = (rMax, fmMin) => { const g = SAMPLE.filter((c) => c.R <= rMax && c.FM >= fmMin); return { n: g.length, back: sum(g.map((c) => c.back)) }; };
const B44 = block(4, 4);
const DEC = CU.rfm(members(), { k: 5, method: 'quantile' });
const DSEG = Object.fromEntries(CU.groupBy(DEC, 'segment').map((g) => [g.key, g]));
const MEAN_ALL = sum(DEC.map((c) => c.monetary)) / DEC.length, LOY = DSEG.Loyal;

// the cohort triangle: month 3
const T = CU.cohortTable(joinMap(), VISIT_LIST);
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const triCells = { A1: 'cohort', B1: 'joined', C1: 'active in month 3',
  ...col('A', 2, T.cohorts.map((c) => `${MON[+c.label.slice(5, 7) - 1]} 2027`)), ...col('B', 2, T.cohorts.map((c) => c.size)),
  ...Object.fromEntries(T.cohorts.map((c, i) => [i, c]).filter(([i]) => T.active[i].length > 3).map(([i]) => [`C${i + 2}`, T.active[i][3]])) };
const LT = T.cohorts.length + 1;
const observed = T.cohorts.map((_, i) => i).filter((i) => T.active[i].length > 3);

// fictional
const HV = { p: 0.6, c: 5, v: 30 };                                // Halvering Hair Studio
const TP = { old: 0.25, young: 0.5, oldShare: 0.7, bYoung: 0.45 };   // Tolhurst Pets

export const items = [
  {
    id: 'm06-m2-1', lesson: 'rfm-segments', type: 'formula', kind: 'numerical',
    prompt: `The sheet holds ${ns} of the ${NO.toLocaleString('en-US')} Lantern members scored on 31 October 2027 (every 41st member), with 1 in column F if they visited in November–December. Ana is weighing a message to the high-value members who were not among the most recent visitors: R at most I1 and FM at least I2. In I3, calculate the share of the members in that block who came back with no message at all.`,
    sheet: { cells: octCells, vary: { I1: [5, 3], I2: [3, 2] } }, cell: 'I3',
    answer: `=AVERAGEIFS(F2:F${LS},B2:B${LS},"<="&I1,E2:E${LS},">="&I2)`,
    alt: [`=SUMIFS(F2:F${LS},B2:B${LS},"<="&I1,E2:E${LS},">="&I2)/COUNTIFS(B2:B${LS},"<="&I1,E2:E${LS},">="&I2)`],
    view: `A1:I${LS}`, formats: { I3: '0.0%' }, widths: { A: 8, B: 4, C: 4, D: 4, E: 5, F: 13, H: 12, I: 10 },
    wrong: [
      { formula: `=AVERAGEIFS(F2:F${LS},B2:B${LS},">="&I1,E2:E${LS},">="&I2)`, say: 'The block is R at most I1: members whose last visit was longer ago. Use "<="&I1 for R.' },
      { formula: `=SUMIFS(F2:F${LS},B2:B${LS},"<="&I1,E2:E${LS},">="&I2)`, say: 'That counts the block’s returners. A return rate divides by the members in the block, which AVERAGEIFS does for a 0/1 column.' },
      { formula: `=SUMIFS(F2:F${LS},B2:B${LS},"<="&I1,E2:E${LS},">="&I2)/SUM(F2:F${LS})`, say: 'That is the block’s share of all returners in the sheet, not its return rate.' },
    ],
    solution: `<x>=AVERAGEIFS(F2:F${LS},B2:B${LS},"<="&I1,E2:E${LS},">="&I2)</x>: the mean of a 0/1 column is the share of 1s. In the sample, ${B44.back} of the ${B44.n} members with R ≤ 4 and FM ≥ 4 came back (${pc(B44.back / B44.n)}): the baseline any message to them would have to beat. ${ns} members make this rough; the same formula on all ${NO.toLocaleString('en-US')} gives the rate to plan with.`,
  },
  {
    id: 'm06-m2-2', lesson: 'rfm-segments', type: 'mc', kind: 'applied',
    prompt: 'Lantern scores all members from both cafés against each other. Harbourside’s average ticket is about $5.50 and Millbrook’s about $3.30. The Millbrook manager complains that her most regular members rarely reach M = 5. What is the best fix?',
    options: [
      'Score each café’s members against each other',
      'Drop the M score and segment on recency alone, since recency predicts returns best of the three',
      'Give Millbrook members an extra point on M so that the two cafés have the same number of M = 5 members',
      'Leave it: a higher M at Harbourside shows its members are more valuable customers, whatever the café’s prices',
    ],
    answer: 0,
    feedback: {
      1: 'Recency does predict returns best, but spend still matters for value; the problem is the comparison base, not the measure.',
      2: 'An arbitrary point changes the scores without fixing what they compare: members scored against members with very different prices.',
      3: 'M ranks spend, and spend reflects each café’s prices; within a café, M then compares like with like.',
    },
    solution: 'Scores are relative to the base they are computed on. Scoring within each café ranks Millbrook members against Millbrook members, so a regular there can reach M = 5.',
  },
  {
    id: 'm06-m2-3', lesson: 'rfm-segments', type: 'num', kind: 'applied',
    prompt: `Halvering Hair Studio (fictional) plans a $${HV.c} discount on the next appointment for its Champions. ${HV.p * 100}% of them book again within two months anyway, every one who books will use the discount, and a booking brings $${HV.v} of margin. How many percentage points of extra bookings does the discount need to cause to break even?`,
    answer: r1(HV.p * HV.c / (HV.v - HV.c) * 100), check: () => (0.6 * 5) / (30 - 5) * 100, unit: 'points', places: 1, tol: 0.05,
    wrong: [
      { value: r1(HV.c / HV.v * 100), say: 'That ignores the clients who would book anyway, who use the discount too: the subsidy is p × c per client.' },
      { value: r1(HV.p * HV.c / HV.v * 100), say: 'Each extra booking also uses the discount, so nets $25, not $30.' },
    ],
    solution: `Subsidy per Champion: 0.6 × $5 = $3. Each extra booking nets $30 − $5 = $25. Break-even uplift = 3 ÷ 25 = 0.12, or 12 points: the discount must turn 12 of every 100 Champions who wouldn’t have booked into bookings. Only 40 in 100 were not going to book, so it must win over nearly a third of them.`,
  },
  {
    id: 'm06-m2-4', lesson: 'rfm-segments', type: 'classify', kind: 'conceptual',
    prompt: 'Lantern has its members’ visits and scores, but has never run a controlled test. Which statements do the data alone support, and which would need a randomised test?',
    items: [
      'Members scored Champions on 31 October came back in November–December at a higher rate than members scored At risk.',
      'Sending At risk members a pastry offer would raise their return rate.',
      'Notifications are switched on by a larger share of Champions than of Lost members.',
      'Switching on notifications for Lost members would make them visit more.',
      'Among members quiet for 61–90 days, those with fewer past visits came back more often.',
      'A win-back email would have brought back the Lost members who returned in November–December.',
    ],
    categories: ['Supported by the data', 'Needs a randomised test'],
    answer: [0, 1, 0, 1, 0, 1],
    feedback: {
      1: 'No offer was sent, so the data show what members did without one; only a test with a holdout shows what an offer changes.',
      3: 'Members chose notifications themselves; the link with being a Champion is an association.',
      5: 'They came back with nothing sent: no campaign can take credit for returns that happened without it, and a future campaign needs a holdout to show its effect.',
    },
    solution: 'Descriptions of what members did, and differences between groups, are supported (as associations). Claims about what an action would change need a randomised comparison.',
  },
  {
    id: 'm06-m2-5', lesson: 'rfm-segments', type: 'num', kind: 'numerical',
    prompt: `On 31 December 2027 Lantern’s ${LOY.n} Loyal members had spent $${LOY.meanSpend.toFixed(2)} each on average since joining, against $${MEAN_ALL.toFixed(2)} for all ${DEC.length.toLocaleString('en-US')} members. The segment is ${(LOY.share * 100).toFixed(1)}% of members. What share of all member spend does it hold? Give a percentage to one decimal place.`,
    answer: r1(LOY.share * LOY.meanSpend / MEAN_ALL * 100), check: () => (LOY.n / DEC.length) * (LOY.meanSpend / MEAN_ALL) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: r1(LOY.meanSpend / MEAN_ALL), say: 'That is the concentration ratio, mean spend ÷ the overall mean. Multiply it by the segment’s share of members to get its share of spend.' },
      { value: r1(LOY.share * 100), say: 'That is the share of members; Loyal members spend more than average, so their share of spend is larger.' },
    ],
    solution: `Share of spend = share of members × (segment mean ÷ overall mean) = ${(LOY.share * 100).toFixed(1)}% × (${LOY.meanSpend.toFixed(2)} ÷ ${MEAN_ALL.toFixed(2)}) = ${(LOY.share * 100).toFixed(1)}% × ${r2(LOY.meanSpend / MEAN_ALL)} ≈ ${r1(LOY.share * LOY.meanSpend / MEAN_ALL * 100)}%. The concentration ratio, ${r2(LOY.meanSpend / MEAN_ALL)}, links the two shares.`,
  },
  {
    id: 'm06-m2-6', lesson: 'cohort-analysis', type: 'num', kind: 'numerical',
    prompt: 'A member joined on 30 November 2027 and made a purchase on 2 February 2028. In a cohort table by calendar month, in which month since joining does that purchase fall?',
    answer: 3, check: () => (2028 - 2027) * 12 + (2 - 11), unit: 'months', places: 0, tol: 0,
    wrong: [
      { value: 2, say: 'Two complete months have passed (DATEDIF would say 2), but cohort tables count calendar months: November is month 0, December 1, January 2, February 3.' },
    ],
    solution: '(2028 − 2027) × 12 + (2 − 11) = 12 − 9 = 3. November 2027 is month 0, so February 2028 is month 3.',
  },
  {
    id: 'm06-m2-7', lesson: 'cohort-analysis', type: 'formula', kind: 'numerical',
    prompt: `Column B holds the size of each of Lantern’s 2027 cohorts and column C the members active in month 3 since joining; it is blank for cohorts that haven’t reached month 3 by 31 December. In E2, calculate the pooled share active in month 3.`,
    sheet: { cells: { ...triCells, E1: 'pooled, month 3' } }, cell: 'E2',
    answer: `=SUM(C2:C${LT})/SUMIFS(B2:B${LT},C2:C${LT},"<>")`,
    alt: [`=SUM(C2:C${LT})/SUMPRODUCT(B2:B${LT}*(C2:C${LT}<>""))`, `=SUM(C2:C${observed.length + 1})/SUM(B2:B${observed.length + 1})`],
    view: `A1:E${LT}`, formats: { E2: '0.0%' }, widths: { A: 9, B: 7, C: 16, E: 15 },
    wrong: [
      { formula: `=SUM(C2:C${LT})/SUM(B2:B${LT})`, say: 'That divides by every cohort’s size, including the cohorts not yet observed in month 3. The pooled curve divides by the joiners of the cohorts observed that long.' },
      { formula: `=SUMPRODUCT(C2:C${observed.length + 1}/B2:B${observed.length + 1})/${observed.length}`, say: 'That is the plain mean of the cohorts’ shares. The pooled figure weights each cohort by its size: total active ÷ total joiners.' },
    ],
    solution: `<x>=SUM(C2:C${LT})/SUMIFS(B2:B${LT},C2:C${LT},"<>")</x>: ${sum(observed.map((i) => T.active[i][3]))} active of ${sum(observed.map((i) => T.cohorts[i].size))} joiners in the ${observed.length} cohorts observed for three months, ${pc(T.pooled[3].rate)}.`,
  },
  {
    id: 'm06-m2-8', lesson: 'cohort-analysis', type: 'mc', kind: 'applied',
    prompt: 'Tolhurst Pets (fictional) has two shops. Shop A opened two years before shop B. Last month 32.5% of shop A’s app members were active and 45% of shop B’s, and the regional manager wants shop A to copy shop B’s service. What should be checked first?',
    options: [
      'Shop A’s members at the same age as shop B’s, since A’s are mostly older',
      'Whether the 12.5-point gap is statistically significant, with a two-proportion z test on last month’s members',
      'Whether shop B’s members spend more per visit, because revenue matters more to the business than activity',
      'Whether shop A sends fewer app messages than shop B, since reminders are what keep members active',
    ],
    answer: 0,
    feedback: {
      1: 'A significant gap can still be entirely a mix effect: test the like-for-like comparison, not the pooled one.',
      2: 'Spend is a separate question; the activity comparison itself is confounded by age.',
      3: 'That assumes a cause before checking whether the gap survives a comparison at the same age.',
    },
    solution: 'A’s base is older, and share active falls with age, so the whole-base comparison mixes ages. Compare cohorts at the same age (or standardise to a common age mix) before looking for causes.',
  },
  {
    id: 'm06-m2-9', lesson: 'cohort-analysis', type: 'num', kind: 'applied',
    prompt: `At Tolhurst Pets’ shop A, ${TP.oldShare * 100}% of app members joined in the first year (${TP.old * 100}% of them active last month) and the rest in the second year (${TP.young * 100}% active). Shop B opened a year ago; ${TP.bYoung * 100}% of its members were active. At the same age, the second-year members, by how many percentage points does shop A lead shop B (negative if it trails)?`,
    answer: r1((TP.young - TP.bYoung) * 100), check: () => (0.5 - 0.45) * 100, unit: 'points', places: 1, tol: 0.05,
    wrong: [
      { value: r1((TP.oldShare * TP.old + (1 - TP.oldShare) * TP.young - TP.bYoung) * 100), say: 'That compares A’s whole base (32.5%), mostly older members, with B’s new members. Compare the same age: A’s second-year members with B’s.' },
    ],
    solution: `A overall: 0.7 × 25% + 0.3 × 50% = 32.5%, behind B’s 45%. At the same age A’s second-year members are 50% active against B’s 45%: A leads by 5 points. The whole-base gap is a mix effect of A’s older members.`,
  },
  {
    id: 'm06-m2-10', lesson: 'cohort-analysis', type: 'mc', kind: 'conceptual',
    prompt: 'In a café’s left-aligned cohort table, every cohort’s share active drops sharply in month 2 and recovers a little in month 3, whatever month it joined in. What is the most likely kind of cause?',
    options: [
      'Something tied to members’ age, like a welcome offer that ends',
      'A season: every cohort was affected in the same calendar month of the year',
      'A weak cohort that keeps fewer of its members than the cohorts before it',
      'A change in the mix of members who joined, such as more from one café',
    ],
    answer: 0,
    feedback: {
      1: 'A season hits every cohort in the same calendar month, which lies on a diagonal; this pattern is in one column, the same age.',
      2: 'One weak cohort would show along its own row, not in the same column for every cohort.',
      3: 'A change in who joined would affect particular cohorts, not every cohort at the same age.',
    },
    solution: 'A column pattern, the same age for every cohort, points to something in members’ life cycle: an introductory offer ending, a reminder schedule, a card that expires.',
  },
  {
    id: 'm06-m2-11', lesson: 'cohort-analysis', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about a pooled cohort curve are true? Select all that apply.',
    options: [
      'Each point weights the cohorts observed that long by their size',
      'Its later points rest on fewer, older cohorts than its early points',
      'It is the plain mean of the cohorts’ shares active at each age',
      'It can rise from one month to the next in a noncontractual business',
    ],
    answer: [0, 1, 3],
    feedback: { 2: 'Pooled = total active ÷ total joiners over the cohorts observed: bigger cohorts count more than in a plain mean.' },
    solution: 'Size-weighted; later points from fewer and older cohorts; and, because members can skip a month and return, a pooled point can rise (it is activity, not survival).',
  },
];
