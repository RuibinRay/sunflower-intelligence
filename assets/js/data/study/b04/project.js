// project.js — B04 applied project: Lantern’s evidence review. In January 2027 Ana Lim has four decisions to make and
// some evidence for each: a courier trial, the November gift-box email test, workshop satisfaction by format and a
// subscriber survey. The student tests what the evidence shows, plans the 2027 customer survey and writes Ana a memo.
// Every figure comes from case.js (COURIER_TRIAL, EMAIL_TEST, WORKSHOP_SCORES, SUBSCRIBER_SURVEY, SURVEY_PLAN, DERIVED
// .project); each `check` recomputes its answer from the raw data, and `verify` compares the figures shown with SciPy-
// checked engine results and the spreadsheet engine's Excel functions.
import { COURIER_TRIAL, EMAIL_TEST, WORKSHOP_SCORES, SUBSCRIBER_SURVEY, SURVEY_PLAN, DERIVED as D, tableCells } from './case.js?v=12';
import * as I from '../../../core/inference.js?v=12';
import { mean, sd, variance } from '../../../core/stats.js?v=12';
import { Sheet } from '../../../core/sheet.js?v=12';

const num = (id, prompt, answer, check, solution, wrong, { unit = '', places = 2, tol = 0.005, kind = 'numerical' } = {}) =>
  ({ id, type: 'num', kind, unit, places, prompt, answer, check, tol, solution, ...(wrong ? { wrong } : {}) });
const r = (x, p = 2) => Math.round(x * 10 ** p) / 10 ** p;
const pct = (x, p = 1) => `${(x * 100).toFixed(p)}%`;
const f = (x, p = 2) => x.toLocaleString('en-US', { minimumFractionDigits: p, maximumFractionDigits: p });

// ---------------------------------------------------------------- the courier trial
const SW = COURIER_TRIAL.swiftline.days, PB = COURIER_TRIAL.parcelbird.days;
const C = D.project.courier;
const welch = I.tTest2(SW, PB), pooled = I.tTest2(SW, PB, { equalVar: true });
const lateSW = SW.filter((x) => x > COURIER_TRIAL.lateAfter).length, latePB = PB.filter((x) => x > COURIER_TRIAL.lateAfter).length;
const lateTest = I.propTest2(lateSW, SW.length, latePB, PB.length);
const PARCELS = 450;                                              // Ana's planning figure for 2027, parcels a month
const extraMonthly = r((COURIER_TRIAL.parcelbird.price - COURIER_TRIAL.swiftline.price) * PARCELS);
const SIGMA = 0.93;                                               // the pooled SD of delivery times, rounded for planning
const powerHalf = I.powerMean({ delta: 0.5, sigma: SIGMA, n: 60, twoSample: true });
const nQuarter = I.sampleSizeForPower({ delta: 0.25, sigma: SIGMA, twoSample: true });
const courierSheet = { cells: { A1: 'Swiftline', B1: 'Parcelbird', ...Object.fromEntries(SW.map((x, i) => [`A${i + 2}`, x])), ...Object.fromEntries(PB.map((x, i) => [`B${i + 2}`, x])), D1: 'p-value (Welch)' } };

// ---------------------------------------------------------------- the email test
const L = EMAIL_TEST.lines, N = EMAIL_TEST.sent;
const emailChi = I.chisqIndependence([L.map((l) => l.orders), L.map((l) => N - l.orders)]);
const bVsA = I.propTest2(L[1].orders, N, L[0].orders, N);
const emailCells = {
  A1: '', B1: `Line ${L[0].id}`, C1: `Line ${L[1].id}`, D1: `Line ${L[2].id}`, E1: 'Total',
  A2: 'Ordered', B2: L[0].orders, C2: L[1].orders, D2: L[2].orders, E2: '=SUM(B2:D2)',
  A3: 'Did not order', B3: N - L[0].orders, C3: N - L[1].orders, D3: N - L[2].orders, E3: '=SUM(B3:D3)',
  A4: 'Total', B4: '=SUM(B2:B3)', C4: '=SUM(C2:C3)', D4: '=SUM(D2:D3)', E4: '=SUM(E2:E3)',
  A6: 'Expected', A7: 'Ordered', A8: 'Did not order',
};
const EXPECTED = '=B$4*$E2/$E$4';
const filled = Object.fromEntries(['B', 'C', 'D'].flatMap((c) => [7, 8].map((rr) => [`${c}${rr}`, `=${c}$4*$E${rr - 5}/$E$4`])));

// ---------------------------------------------------------------- workshops
const WN = Object.keys(WORKSHOP_SCORES), WV = Object.values(WORKSHOP_SCORES);
const aov = I.anova1(WV);
const pair = (i, j) => I.tTest2(WV[i], WV[j]);
const sds = WV.map((x) => sd(x));

// ---------------------------------------------------------------- the subscriber survey and the 2027 plan
const S = SUBSCRIBER_SURVEY, subCi = I.ciProp(S.fortnightly, S.responded);
const nonResp = S.invited - S.responded;
const nPlan = I.sampleSizeProp(SURVEY_PLAN.margin, SURVEY_PLAN.conf), invite = Math.ceil(nPlan / SURVEY_PLAN.responseRate - 1e-9);
const nHalf = I.sampleSizeProp(SURVEY_PLAN.margin / 2, SURVEY_PLAN.conf);

export default {
  title: 'Lantern’s evidence review',
  brief: [
    { case: 'It is January 2027. Ana Lim has four decisions to make for Lantern Coffee Co. and some evidence behind each: whether to move the shop’s parcels to a faster, dearer courier; which subject line to use for gift-box emails; whether to keep running all three workshop formats; and whether to offer fortnightly deliveries to subscribers. She also wants to plan a proper customer survey for 2027. She asks you to say what the evidence shows, how sure she can be, and what it can’t tell her. Lantern, Ana and every figure are fictional.' },
    { p: 'What you have:' },
    { list: [
      `<b>The courier trial</b> (16 November – 18 December 2026): parcels were given to the two couriers in turn, in the order the orders arrived. Business days to delivery for ${SW.length} Swiftline parcels and ${PB.length} Parcelbird parcels. A parcel is late if it takes more than ${COURIER_TRIAL.lateAfter} business days. Swiftline charges $${f(COURIER_TRIAL.swiftline.price)} a parcel; Parcelbird $${f(COURIER_TRIAL.parcelbird.price)}. Ana plans for about ${PARCELS} parcels a month in 2027.`,
      `<b>The gift-box email</b> (12 November 2026): three subject lines, each sent to ${N.toLocaleString('en-US')} customers chosen at random from the mailing list; the number in each group who ordered a gift box within a week.`,
      `<b>Workshop satisfaction</b> (2026): scores out of 10 from participants in Lantern’s barista workshops, by format (in person, online, hybrid). Participants chose their own format.`,
      `<b>The subscriber survey</b> (December 2026): all ${S.invited} subscribers were asked whether they would rather receive their coffee every two weeks instead of monthly; ${S.responded} replied.`,
    ] },
  ],
  deliverables: [
    'A comparison of the two couriers: the difference in average delivery time with its 95% confidence interval and test, the late shares compared, whether the trial was big enough, and what the faster service would cost.',
    'A reading of the email test that doesn’t over-claim, including what testing pairs after the fact would do.',
    'A one-way ANOVA of workshop satisfaction by format, with its conditions, effect size, follow-up comparisons and limits.',
    'An interval for the subscribers who prefer fortnightly delivery, with the bounds that non-response leaves.',
    'A sample size for the 2027 customer survey and the number to invite.',
    'A memo to Ana recommending what to do on each question and what to measure next.',
  ],
  stages: [
    {
      id: 'courier', title: 'Compare the couriers',
      html: `<p>The output below is Excel’s Analysis ToolPak on the trial’s delivery times (Swiftline as Variable 1, Parcelbird as Variable 2). Choose the tool that suits the data, then answer Ana’s questions. Parcels went to the couriers in turn as orders arrived, so the two samples are independent and neither courier got the easier parcels by design.</p>`,
      tool: { kind: 'widget', widget: { type: 'toolpak', title: 'Courier trial: business days to delivery', tools: ['ttest-unequal', 'ttest-equal'], groups: [{ name: 'Swiftline', values: SW }, { name: 'Parcelbird', values: PB }], alpha: 0.05, hypothesized: 0 } },
      items: [
        { id: 'b04-pj-1', type: 'mc', kind: 'conceptual',
          prompt: `Swiftline’s delivery times have a sample variance of ${f(variance(SW), 3)} and Parcelbird’s ${f(variance(PB), 3)}. Which test should Ana use to compare the mean delivery times, and why?`,
          options: [
            'Welch’s test, which doesn’t assume the two variances are equal',
            'The pooled test, because both samples have more than 30 parcels each',
            'A paired test, because both couriers delivered in the same five weeks',
            'No test at all: the sample means differ, so the couriers must differ',
          ],
          answer: 0,
          feedback: {
            1: 'Large samples make the sampling distribution close to normal; they don’t make the variances equal. The pooled test assumes equal population variances.',
            2: 'Pairs need a natural match (the same parcel delivered twice). These are different parcels: two independent samples.',
            3: 'Sample means always differ a little. The question is whether the difference is bigger than chance would produce.',
          },
          solution: `Welch’s test (t-Test: Two-Sample Assuming Unequal Variances, or T.TEST with type 3) doesn’t assume the two couriers’ times vary equally, and here one variance is ${f(variance(SW) / variance(PB), 2)} times the other. With ${SW.length} and ${PB.length} parcels, the means are close to normally distributed even though delivery days are whole numbers.` },
        { id: 'b04-pj-2', type: 'formula', kind: 'applied',
          prompt: `Swiftline’s delivery days are in A2:A${SW.length + 1} and Parcelbird’s in B2:B${PB.length + 1}. In D2, return the two-tailed p-value of Welch’s test for a difference in mean delivery time.`,
          sheet: courierSheet, cell: 'D2', view: `A1:D${SW.length + 1}`, maxHeight: '20rem', widths: { A: 11, B: 11, D: 16 }, formats: { D2: '0.0000' },
          answer: `=T.TEST(A2:A${SW.length + 1},B2:B${PB.length + 1},2,3)`, require: ['T.TEST'],
          alt: [`=T.TEST(B2:B${PB.length + 1},A2:A${SW.length + 1},2,3)`, `=T.TEST(A2:A${SW.length + 1},B2:B${PB.length + 1},2.5,3)`],
          wrong: [
            { formula: `=T.TEST(A2:A${SW.length + 1},B2:B${PB.length + 1},1,3)`, say: 'tails = 1 gives the one-tailed p-value, half the two-tailed one. Ana’s question is whether the couriers differ in either direction: tails = 2.' },
            { formula: `=T.TEST(A2:A${SW.length + 1},B2:B${PB.length + 1},2,2)`, say: 'Type 2 is the pooled test, which assumes equal variances. Welch’s test is type 3.' },
            { formula: `=T.TEST(A2:A${SW.length + 1},B2:B${PB.length + 1},2,1)`, say: 'Type 1 is the paired test, for matched pairs. These are two independent samples: type 3.' },
          ],
          solution: `<x>=T.TEST(A2:A${SW.length + 1},B2:B${PB.length + 1},2,3)</x> gives ${welch.p.toFixed(4)}. T.TEST works with Welch’s unrounded degrees of freedom (${welch.df.toFixed(1)}); the ToolPak rounds them to ${Math.round(welch.df)}, which moves the p-value only in the sixth decimal place here.` },
        { id: 'b04-pj-3', type: 'steps', kind: 'numerical',
          prompt: 'Give the 95% confidence interval for how much longer Swiftline takes than Parcelbird on average (Swiftline minus Parcelbird), from Welch’s method. Use the t critical value for Welch’s degrees of freedom; give each limit in days to two decimal places.',
          steps: [
            num('b04-pj-3-1', 'Difference in sample means (Swiftline − Parcelbird), in days', r(welch.diff, 2), () => mean(SW) - mean(PB), '', [{ value: r(mean(PB) - mean(SW), 2), say: 'That is Parcelbird minus Swiftline. The question asks for Swiftline minus Parcelbird.' }], { unit: 'days', tol: 0.006 }),
            num('b04-pj-3-2', 'Standard error of the difference, √(s₁²/n₁ + s₂²/n₂)', r(welch.se, 4), () => Math.sqrt(variance(SW) / SW.length + variance(PB) / PB.length), '', [{ value: r(pooled.se, 4), say: 'That is the pooled standard error. Welch’s method adds the two variances divided by their own sample sizes.' }], { unit: 'days', places: 4, tol: 0.00006 }),
            num('b04-pj-3-3', 'Lower limit', r(welch.low, 2), () => welch.diff - I.tInv(0.975, welch.df) * welch.se, '', [{ value: r(welch.diff - 1.645 * welch.se, 2), say: 'That uses 1.645, the critical value for 90%. A 95% interval needs about 1.98 for these degrees of freedom.' }], { unit: 'days', tol: 0.011 }),
            num('b04-pj-3-4', 'Upper limit', r(welch.high, 2), () => welch.diff + I.tInv(0.975, welch.df) * welch.se, '', null, { unit: 'days', tol: 0.011 }),
          ],
          solution: `Difference ${f(welch.diff, 3)} days; standard error √(${f(variance(SW), 4)}/${SW.length} + ${f(variance(PB), 4)}/${PB.length}) = ${f(welch.se, 4)}; t critical (${welch.df.toFixed(1)} df) = ${f(I.tInv(0.975, welch.df), 3)}. Interval: ${f(welch.diff, 3)} ± ${f(I.tInv(0.975, welch.df) * welch.se, 3)} = ${f(welch.low, 2)} to ${f(welch.high, 2)} days. It excludes 0, which agrees with the two-sided test’s p = ${welch.p.toFixed(3)}; and it says the speed-up could be as small as a tenth of a day or as large as three-quarters of one.` },
        num('b04-pj-4', `${lateSW} of Swiftline’s ${SW.length} parcels and ${latePB} of Parcelbird’s ${PB.length} were late. What is the two-sided p-value of the two-proportion z test (pooled standard error) that the couriers’ late rates are equal? Give four decimal places.`, r(lateTest.pValue, 4),
          () => I.propTest2(lateSW, SW.length, latePB, PB.length).pValue,
          `Late shares ${pct(lateSW / SW.length)} and ${pct(latePB / PB.length)}; pooled proportion ${(lateSW + latePB)}/${SW.length + PB.length} = ${f(lateTest.pool, 4)}; standard error √(p̂(1 − p̂)(1/${SW.length} + 1/${PB.length})) = ${f(lateTest.sePool, 4)}; z = ${f(lateTest.z, 3)}; p = ${lateTest.pValue.toFixed(4)}. Parcelbird has ${latePB} late parcels, so the expected counts are small (about ${f(lateTest.pool * PB.length, 1)} late parcels in each group under H₀, below the usual 10): treat this p-value as approximate.`,
          [{ value: r(lateTest.pValue / 2, 4), say: 'That is the one-sided p-value. Ana asked whether the late rates differ, in either direction: double the tail.' }],
          { places: 4, tol: 0.0006 }),
        { id: 'b04-pj-5', type: 'multi', kind: 'conceptual',
          prompt: 'Select every statement the courier results support.',
          options: [
            `A gap of ${f(welch.diff, 2)} days would be unusual if the couriers were really equally fast.`,
            `There is a ${(100 - welch.p * 100).toFixed(1)}% chance that Parcelbird is faster than Swiftline on average, given these results.`,
            'The interval says the real speed-up is somewhere between about a tenth of a day and three-quarters of a day.',
            'Because the test is significant at the 5% level, the speed-up is large enough to matter to Lantern’s customers.',
            'Fewer Parcelbird parcels were late, but with so few late parcels that comparison is rougher than the one for mean days.',
          ],
          answer: [0, 2, 4],
          feedback: {
            1: 'A p-value is not the probability that a hypothesis is true. It is how often a difference this large would arise by chance if the couriers were equally fast.',
            3: 'Significance says the difference is unlikely to be chance alone. Whether half a day matters is a business judgement: weigh it against the extra cost.',
          },
          solution: 'The test and the interval agree that Parcelbird is faster on average, by somewhere around 0.1 to 0.76 days. Neither says how likely a hypothesis is, nor whether the gain is worth paying for. The late-parcel comparison rests on 17 late parcels in all, so it is less precise.' },
        num('b04-pj-6', `How much more a month would Parcelbird cost Ana at ${PARCELS} parcels a month? Give dollars to the cent.`, extraMonthly,
          () => (COURIER_TRIAL.parcelbird.price - COURIER_TRIAL.swiftline.price) * PARCELS,
          `($${f(COURIER_TRIAL.parcelbird.price)} − $${f(COURIER_TRIAL.swiftline.price)}) × ${PARCELS} = $${f(extraMonthly)} a month, about $${(extraMonthly * 12).toLocaleString('en-US', { maximumFractionDigits: 0 })} a year, for parcels that arrive about ${f(welch.diff, 1)} days sooner on average.`,
          [{ value: r(COURIER_TRIAL.parcelbird.price * PARCELS), say: 'That is Parcelbird’s whole bill. The question asks how much more it costs than Swiftline.' }],
          { unit: '$', tol: 0.005, kind: 'applied' }),
        { id: 'b04-pj-7', type: 'steps', kind: 'numerical',
          prompt: `Was the trial big enough? Treat the SD of delivery times as ${SIGMA} days for both couriers and use the normal approximation for a two-sided test at α = 0.05.`,
          steps: [
            num('b04-pj-7-1', 'With 60 parcels per courier, what was the power to detect a true difference of half a day? Give a percentage to one decimal place.', r(powerHalf * 100, 1),
              () => I.powerMean({ delta: 0.5, sigma: SIGMA, n: 60, twoSample: true }) * 100, '',
              [{ value: r(I.powerMean({ delta: 0.5, sigma: SIGMA, n: 60 }) * 100, 1), say: 'That treats it as a one-sample test. A difference of two means has standard error σ√(2/n).' }],
              { unit: '%', places: 1, tol: 0.06 }),
            num('b04-pj-7-2', 'How many parcels per courier would give 80% power to detect a difference of a quarter of a day? Round up.', nQuarter,
              () => I.sampleSizeForPower({ delta: 0.25, sigma: SIGMA, twoSample: true }), '',
              [{ value: I.sampleSizeForPower({ delta: 0.25, sigma: SIGMA }), say: 'That is the one-sample formula. For two groups, n per group = 2 × ((z₀.₉₇₅ + z₀.₈₀) × σ / δ)².' }],
              { unit: 'parcels', places: 0, tol: 0.5 }),
          ],
          solution: `Standard error of the difference: ${SIGMA} × √(2/60) = ${f(SIGMA * Math.sqrt(2 / 60), 4)}. Power = P(Z > 1.96 − 0.5/${f(SIGMA * Math.sqrt(2 / 60), 4)}) + P(Z < −1.96 − 0.5/${f(SIGMA * Math.sqrt(2 / 60), 4)}) = ${pct(powerHalf)}: the trial was big enough to catch half a day most of the time. For a quarter of a day, n = 2 × ((1.960 + 0.842) × ${SIGMA} / 0.25)² = ${f(2 * ((I.normInv(0.975) + I.normInv(0.8)) * SIGMA / 0.25) ** 2, 1)}, so ${nQuarter} parcels per courier.` },
      ],
    },
    {
      id: 'email', title: 'Read the email test',
      html: '<p>Each subject line went to its own random group of customers, so the groups differ only by chance and by the subject line. The worksheet holds the counts. Build the expected counts, then test whether the order rate depends on the subject line.</p>',
      tool: { kind: 'widget', widget: { type: 'curve', title: 'Chi-square distribution with 2 degrees of freedom', dist: 'chisq', params: { df: 2 }, asks: ['above'], a: r(emailChi.stat, 2), critical: { alpha: 0.05, tails: 'upper' }, stat: { value: emailChi.stat, label: 'χ²' }, xLabel: 'χ²' } },
      items: [
        { id: 'b04-pj-8', type: 'formula', kind: 'applied',
          prompt: 'Rows 2 and 3 are the observed counts, with their totals in column E and row 4. In B7, write the expected count of orders for line A if the order rate didn’t depend on the subject line, in a formula that can be filled to B7:D8.',
          sheet: { cells: emailCells }, cell: 'B7', fill: 'B7:D8', view: 'A1:E8', widths: { A: 14 },
          answer: EXPECTED, alt: ['=$E2*B$4/$E$4', '=B$4*($E2/$E$4)'],
          wrong: [
            { formula: '=B4*E2/E4', say: 'Right in B7, but filled across and down the references move: the column total must keep its row ($4), the row total its column ($E) and the grand total both ($E$4).' },
            { formula: '=B2', say: 'That copies the observed count. The expected count is what independence would predict: row total × column total ÷ grand total.' },
            { formula: '=$E$4/6', say: 'That spreads the grand total equally over six cells. Orders are far rarer than non-orders: use row total × column total ÷ grand total.' },
          ],
          solution: `<x>${EXPECTED}</x> filled to D8. Each line has ${N.toLocaleString('en-US')} customers and ${L.reduce((s, l) => s + l.orders, 0)} orders came in all, so each expected order count is ${N.toLocaleString('en-US')} × ${L.reduce((s, l) => s + l.orders, 0)} ÷ ${(3 * N).toLocaleString('en-US')} = ${f(emailChi.expected[0][0], 2)}; every expected count is well above 5.` },
        { id: 'b04-pj-9', type: 'formula', kind: 'applied',
          prompt: 'With the expected counts in B7:D8, write in B10 the p-value of the chi-square test of independence.',
          sheet: { cells: { ...emailCells, ...filled, A10: 'p-value' } }, cell: 'B10', view: 'A1:E10', widths: { A: 14 }, formats: { B10: '0.0000', B7: '0.00', C7: '0.00', D7: '0.00', B8: '0.00', C8: '0.00', D8: '0.00' },
          answer: '=CHISQ.TEST(B2:D3,B7:D8)', require: ['CHISQ.TEST'],
          wrong: [
            { formula: '=CHISQ.TEST(B7:D8,B2:D3)', say: 'CHISQ.TEST takes the observed range first and the expected range second.' },
            { formula: '=CHISQ.TEST(B2:D2,B7:D7)', say: 'That uses only the “ordered” row, which tests a 1 × 3 table with 2 degrees of freedom but leaves out the customers who didn’t order. Use the whole 2 × 3 table, B2:D3 against B7:D8.' },
          ],
          solution: `<x>=CHISQ.TEST(B2:D3,B7:D8)</x> = ${emailChi.p.toFixed(4)}: χ² = ${f(emailChi.stat, 3)} with (2 − 1)(3 − 1) = 2 degrees of freedom, as <x>=CHISQ.DIST.RT(${f(emailChi.stat, 3)},2)</x> confirms.` },
        { id: 'b04-pj-10', type: 'mc', kind: 'conceptual',
          prompt: `Line B had the highest order rate (${pct(L[1].orders / N)}) and line A the lowest (${pct(L[0].orders / N)}). A colleague tests B against A alone and gets p = ${bVsA.pValue.toFixed(3)}. What should Ana conclude?`,
          options: [
            'No clear evidence the lines differ; testing the top pair after seeing the results overstates it',
            'Line B is the best subject line, because it had the most orders of the three lines in the test',
            'The subject lines make no difference at all to whether customers order a gift box from Lantern',
            'Line B wins at the 10% level, so Ana should use it for every future gift-box email she sends out',
          ],
          answer: 0,
          feedback: {
            1: 'B had the most orders in this sample, but the overall test says differences this size arise by chance about one time in five.',
            2: 'Not significant is not “no difference”: the test may simply not have been big enough to detect a difference of about one percentage point.',
            3: 'Choosing the pair to test after seeing which was highest and lowest makes a small p-value more likely by chance; and 0.08 is not convincing even before that.',
          },
          solution: `The overall χ² test (p = ${emailChi.p.toFixed(3)}) finds no clear evidence that the order rate depends on the subject line. Testing the best line against the worst after seeing the results is one of three possible comparisons chosen because it looked largest, so its p-value of ${bVsA.pValue.toFixed(3)} understates how easily chance produces such a gap. Ana can use any of the lines, or run a larger test of the two she likes best.` },
        num('b04-pj-11', 'If Ana compared all three pairs of subject lines and wanted the chance of any false positive to stay at 5%, what significance level should each comparison use under the Bonferroni adjustment? Give four decimal places.', r(0.05 / 3, 4),
          () => 0.05 / 3, 'Bonferroni divides the overall level by the number of comparisons: 0.05 ÷ 3 = 0.0167. Even B against A (p = 0.082) is far from that.',
          [{ value: 0.05, say: 'At 0.05 per comparison, three comparisons give up to about a 14% chance of at least one false positive. Divide by the number of comparisons.' }],
          { places: 4, tol: 0.00006 }),
      ],
    },
    {
      id: 'workshops', title: 'Compare the workshop formats',
      html: '<p>The ToolPak output below is a one-way ANOVA of the 2026 satisfaction scores by format. Participants chose their own format, and each person is counted once.</p>',
      tool: { kind: 'widget', widget: { type: 'toolpak', title: 'Workshop satisfaction (0–10) by format, 2026', tool: 'anova', groups: WN.map((n, i) => ({ name: n, values: WV[i] })), alpha: 0.05 } },
      items: [
        num('b04-pj-12', 'What is the F statistic for format? Give two decimal places.', r(aov.F, 2), () => I.anova1(Object.values(WORKSHOP_SCORES)).F,
          `F = MS between ÷ MS within = ${f(aov.msb, 4)} ÷ ${f(aov.msw, 4)} = ${f(aov.F, 3)}, with ${aov.dfb} and ${aov.dfw} degrees of freedom; p = ${aov.p.toFixed(4)}, below 0.05, and F is above the critical value ${f(aov.fCrit, 3)}.`,
          [{ value: r(aov.msw / aov.msb, 2), say: 'That is within ÷ between, upside down. F puts the between-groups mean square on top.' }, { value: r(aov.ssb / aov.ssw, 2), say: 'That divides the sums of squares. F divides the mean squares, each sum of squares ÷ its degrees of freedom.' }]),
        num('b04-pj-13', 'What share of the variation in scores does format account for (η² = SS between ÷ SS total)? Give a percentage to one decimal place.', r(aov.eta2 * 100, 1),
          () => (aov.ssb / aov.sst) * 100, `η² = ${f(aov.ssb, 3)} ÷ ${f(aov.sst, 3)} = ${pct(aov.eta2)}: format goes with about a sixth of the variation in scores; most of it is between people within a format.`,
          [{ value: r((aov.ssb / aov.ssw) * 100, 1), say: 'That divides by SS within. η² divides SS between by SS total (between + within).' }], { unit: '%', places: 1, tol: 0.06 }),
        { id: 'b04-pj-14', type: 'multi', kind: 'conceptual',
          prompt: 'Select every statement that is true of this ANOVA.',
          options: [
            `The largest standard deviation (${f(Math.max(...sds), 2)}) is less than twice the smallest (${f(Math.min(...sds), 2)}), so the equal-variance condition is reasonable.`,
            'A significant F shows that every format’s mean score differs from every other format’s mean score, pair by pair.',
            'Because participants chose their own format, the ANOVA can’t show that the format itself causes the differences.',
            'Scores are whole numbers from 0 to 10, so normality is only approximate; with groups this size that is usually acceptable.',
            'Running three separate t tests at the 5% level instead of the ANOVA would have kept the chance of a false positive at 5%.',
          ],
          answer: [0, 2, 3],
          feedback: {
            1: 'F tests whether all the means are equal. A significant F says at least one differs; follow-up comparisons say which.',
            4: 'Three tests at 5% each give up to about a 14% chance of at least one false positive. That is why ANOVA, or adjusted follow-ups, are used.',
          },
          solution: 'The variances are close enough, the scores are independent and roughly normal, and the result is significant. But a significant F only says the means are not all equal, and because people chose their format (online participants may differ in experience or motivation), the difference can’t be put down to the format alone.' },
        { id: 'b04-pj-15', type: 'classify', kind: 'applied',
          prompt: 'Ana follows up with Welch’s t test for each pair of formats, using the Bonferroni level 0.05 ÷ 3. Classify each comparison.',
          items: WN.flatMap((a, i) => WN.slice(i + 1).map((b) => `${a} against ${b}: p = ${pair(i, WN.indexOf(b)).p.toFixed(4)}`)),
          categories: ['Significant at the Bonferroni level', 'Not significant at the Bonferroni level'],
          answer: WN.flatMap((a, i) => WN.slice(i + 1).map((b) => (pair(i, WN.indexOf(b)).p < 0.05 / 3 ? 0 : 1))),
          feedback: { 0: 'p = 0.019 is below 0.05 but above 0.0167, the Bonferroni level for three comparisons.' },
          solution: `Only online against hybrid (p = ${pair(1, 2).p.toFixed(4)}) clears 0.0167. In person against online (p = ${pair(0, 1).p.toFixed(4)}) would pass at 0.05 on its own, but not once the three comparisons are allowed for; in person against hybrid (p = ${pair(0, 2).p.toFixed(4)}) shows no difference. The evidence points to online workshops scoring lower than hybrid ones.` },
      ],
    },
    {
      id: 'survey', title: 'Read the subscriber survey',
      html: `<p>${S.responded} of Lantern’s ${S.invited} subscribers answered the December question, and ${S.fortnightly} said they would rather receive their coffee every two weeks.</p>`,
      items: [
        { id: 'b04-pj-16', type: 'steps', kind: 'numerical',
          prompt: 'Give the 95% confidence interval for the share of subscribers like those who replied who would prefer fortnightly delivery (Wald interval; percentages to one decimal place).',
          steps: [
            num('b04-pj-16-1', 'Lower limit', r(subCi.low * 100, 1), () => I.ciProp(S.fortnightly, S.responded).low * 100, '', [{ value: r(I.ciProp(S.fortnightly, S.invited).low * 100, 1), say: 'That divides by all 520 subscribers. The sample is the 312 who replied.' }], { unit: '%', places: 1, tol: 0.06 }),
            num('b04-pj-16-2', 'Upper limit', r(subCi.high * 100, 1), () => I.ciProp(S.fortnightly, S.responded).high * 100, '', null, { unit: '%', places: 1, tol: 0.06 }),
          ],
          solution: `p̂ = ${S.fortnightly}/${S.responded} = ${pct(subCi.p)}; standard error √(p̂(1 − p̂)/${S.responded}) = ${f(subCi.se, 4)}; margin 1.96 × ${f(subCi.se, 4)} = ${pct(subCi.margin)}. Interval ${pct(subCi.low)} to ${pct(subCi.high)}. Both counts (${S.fortnightly} and ${S.responded - S.fortnightly}) are well above 10, so the normal approximation is fine.` },
        { id: 'b04-pj-17', type: 'steps', kind: 'numerical',
          prompt: `${nonResp} subscribers didn’t reply. What share of all ${S.invited} subscribers prefer fortnightly delivery if…`,
          steps: [
            num('b04-pj-17-1', '…none of the non-respondents prefers it? Give a percentage to one decimal place.', r((S.fortnightly / S.invited) * 100, 1), () => (S.fortnightly / S.invited) * 100, '', null, { unit: '%', places: 1, tol: 0.06 }),
            num('b04-pj-17-2', '…all of the non-respondents prefer it? Give a percentage to one decimal place.', r(((S.fortnightly + nonResp) / S.invited) * 100, 1), () => ((S.fortnightly + nonResp) / S.invited) * 100, '', null, { unit: '%', places: 1, tol: 0.06 }),
          ],
          solution: `${S.fortnightly}/${S.invited} = ${pct(S.fortnightly / S.invited)} and (${S.fortnightly} + ${nonResp})/${S.invited} = ${pct((S.fortnightly + nonResp) / S.invited)}. The confidence interval allows for sampling error among those who replied; it can’t allow for who chose not to reply. If replying was linked to wanting a change, the true share could be anywhere between these bounds, which are much wider than the interval.` },
        { id: 'b04-pj-18', type: 'mc', kind: 'conceptual',
          prompt: 'What does the 95% interval from the replies tell Ana about all her subscribers?',
          options: [
            'It allows for sampling error among people like those who replied, not for non-response',
            'There is a 95% probability that the share of all 520 subscribers preferring fortnightly lies inside it',
            'It is exact for all 520 subscribers, because everyone was invited and so there was no sampling at all',
            'It is useless, because a survey with only a 60% response rate can’t say anything about subscribers',
          ],
          answer: 0,
          feedback: {
            1: 'Once computed, an interval either contains the true value or it doesn’t. “95%” describes how often the method captures the value; and it says nothing about non-response.',
            2: 'Inviting everyone removes sampling from the invitation, but 208 people didn’t reply. Those who did are a self-selected sample.',
            3: 'It says a lot about the 60% who replied and, with care, about subscribers like them. Report it with the non-response bounds.',
          },
          solution: 'The interval is a statement about the method’s sampling error, for a population of people like the respondents. Non-response is a separate risk, which the bounds in the last task show. Ana could follow up a random handful of non-respondents to check whether they differ.' },
      ],
    },
    {
      id: 'plan', title: 'Plan the 2027 customer survey',
      html: `<p>Ana wants to estimate a proportion (for example, the share of customers who would recommend Lantern) to within ±${SURVEY_PLAN.margin * 100} percentage points at ${SURVEY_PLAN.conf * 100}% confidence. From past surveys she expects about ${SURVEY_PLAN.responseRate * 100}% of those invited to reply.</p>`,
      tool: { kind: 'widget', widget: { type: 'curve', title: 'The standard normal distribution: the 95% critical value', dist: 'normal', params: { mean: 0, sd: 1 }, asks: ['inverse', 'outside'], prob: 0.975, a: 1.96, xLabel: 'z' } },
      items: [
        num('b04-pj-19', 'How many completed replies does she need? Use p = 0.5 and round up.', nPlan, () => Math.ceil((I.normInv(0.975) ** 2 * 0.25) / 0.04 ** 2 - 1e-9),
          `n = z² × p(1 − p) ÷ E² = 1.960² × 0.25 ÷ 0.04² = ${f((I.normInv(0.975) ** 2 * 0.25) / 0.04 ** 2, 2)}, so ${nPlan} replies. p = 0.5 gives the largest p(1 − p), so the margin will be at most ±4 points whatever the true share.`,
          [{ value: Math.ceil((1.645 ** 2 * 0.25) / 0.0016), say: 'That uses 1.645, the critical value for 90% confidence. 95% needs 1.96.' }, { value: Math.ceil((1.96 * 0.5) / 0.04), say: 'Square the whole ratio: n = (z/E)² × p(1 − p).' }],
          { unit: 'replies', places: 0, tol: 0.5 }),
        num('b04-pj-20', 'How many customers should she invite? Round up.', invite, () => Math.ceil(nPlan / SURVEY_PLAN.responseRate - 1e-9),
          `${nPlan} ÷ ${SURVEY_PLAN.responseRate} = ${f(nPlan / SURVEY_PLAN.responseRate, 1)}, so ${invite.toLocaleString('en-US')} invitations. This buys precision, not representativeness: the 70% who don’t reply may differ from those who do.`,
          [{ value: Math.ceil(nPlan * SURVEY_PLAN.responseRate), say: 'That multiplies by the response rate. To end up with 601 replies when 30% reply, divide by 0.3.' }],
          { unit: 'customers', places: 0, tol: 0.5, kind: 'applied' }),
        { id: 'b04-pj-21', type: 'mc', kind: 'conceptual',
          prompt: `If Ana wanted ±${SURVEY_PLAN.margin * 50} points instead of ±${SURVEY_PLAN.margin * 100}, how many replies would she need?`,
          options: [`About four times as many: ${nHalf.toLocaleString('en-US')}`, `About twice as many: ${(2 * nPlan).toLocaleString('en-US')}`, `About half as many: ${Math.ceil(nPlan / 2)}`, `The same ${nPlan}: the confidence level is unchanged`],
          answer: 0,
          feedback: { 1: 'The margin shrinks with √n, so halving it needs four times the sample, not twice.', 2: 'A smaller margin needs more replies, not fewer.', 3: 'The margin E appears squared in n = z² p(1 − p) / E².' },
          solution: `n is proportional to 1/E², so halving the margin multiplies n by four: 1.96² × 0.25 ÷ 0.02² = ${nHalf.toLocaleString('en-US')}, which would mean inviting about ${Math.ceil(nHalf / SURVEY_PLAN.responseRate - 1e-9).toLocaleString('en-US')} customers.` },
      ],
    },
    {
      id: 'memo', title: 'Write Ana’s memo',
      html: '<p>Bring the four questions together for Ana: what to do, how sure she can be, and what the data can’t tell her.</p>',
      items: [
        { id: 'b04-pj-22', type: 'short', kind: 'applied',
          prompt: 'Write Ana a memo of 250–350 words with a recommendation on each of the four questions (courier, subject lines, workshop formats, fortnightly deliveries) and the survey plan. For each, give the key figure with its uncertainty (an interval or a p-value), say whether the difference is large enough to matter, and name one thing the evidence can’t show.',
          rubric: [
            'Courier: the speed-up with its interval (about 0.10 to 0.76 days), the test, the cost (about $200 a month), and a recommendation that weighs the two; notes the trial’s power and the small number of late parcels.',
            'Email: no clear evidence the subject lines differ (p ≈ 0.21); doesn’t crown line B on a post-hoc comparison; suggests a larger test if the choice matters.',
            'Workshops: a significant ANOVA (p ≈ 0.008, η² ≈ 17%) with follow-ups showing online below hybrid, and the self-selection caveat (it doesn’t show the format causes the scores).',
            'Survey: the interval for fortnightly delivery (about 54% to 65% of respondents) with the non-response bounds (36% to 76% of all subscribers); the 2027 plan of 601 replies and about 2,004 invitations.',
            'Distinguishes statistical from practical significance throughout and never treats a p-value as the probability a hypothesis is true.',
          ],
          model: `<b>To:</b> Ana · <b>From:</b> analyst · <b>Re:</b> what the evidence shows<br><br><b>Courier.</b> Parcelbird delivered ${f(welch.diff, 2)} business days faster on average (95% interval ${f(welch.low, 2)} to ${f(welch.high, 2)} days; Welch’s test p = ${welch.p.toFixed(3)}) and had fewer late parcels (${latePB} of ${PB.length} against ${lateSW} of ${SW.length}), though so few late parcels make that comparison rough. It would cost about $${f(extraMonthly, 0)} a month more. The trial was large enough to detect half a day with about ${pct(powerHalf, 0)} power. I recommend switching if faster delivery is a selling point you will advertise; otherwise the gain may be too small for customers to notice. Check repeat purchases after the switch.<br><br><b>Subject lines.</b> The test gives no clear evidence that any line sells more gift boxes (p = ${emailChi.p.toFixed(2)}). Line B’s lead could be chance; choose freely, or test B against C on a larger list next season.<br><br><b>Workshops.</b> Satisfaction differs by format (p = ${aov.p.toFixed(3)}; format accounts for about ${pct(aov.eta2, 0)} of the variation): online workshops score lower than hybrid ones. People chose their format, so this may reflect who books online rather than the format itself. Before dropping online, ask online participants what would improve it.<br><br><b>Fortnightly delivery.</b> ${pct(subCi.p)} of the subscribers who replied prefer it (95% interval ${pct(subCi.low)} to ${pct(subCi.high)}), but 40% didn’t reply; across all subscribers the share could be anywhere from ${pct(S.fortnightly / S.invited)} to ${pct((S.fortnightly + nonResp) / S.invited)}. Offer it as an option rather than a change for everyone.<br><br><b>2027 survey.</b> To estimate a share within ±4 points at 95% confidence we need ${nPlan} replies; at a 30% response rate, invite about ${invite.toLocaleString('en-US')} customers, and follow up a sample of non-respondents.` },
      ],
    },
  ],
  rubric: [
    'Each method fits the data: Welch’s test for two independent samples with unequal variances, a chi-square test for counts in a table, one-way ANOVA for several group means, a proportion interval for a survey share.',
    'Every result is reported with its uncertainty (an interval or a p-value) and its conditions are checked (sample sizes, expected counts, equal variances, independence).',
    'Statistical significance is kept apart from practical importance: the courier’s speed-up is weighed against its cost.',
    'Nothing is over-claimed: no p-value read as the probability a hypothesis is true, no “accepting” H₀, no post-hoc pair crowned, no causal claim from self-selected groups, non-response stated as a separate risk from sampling error.',
    'The memo gives Ana a clear recommendation on each question and says what to measure next.',
  ],
  verify() {
    const sh = new Sheet({ cells: { ...courierSheet.cells, D2: `=T.TEST(A2:A${SW.length + 1},B2:B${PB.length + 1},2,3)`, D3: `=T.TEST(A2:A${SW.length + 1},B2:B${PB.length + 1},2,2)` } });
    const em = new Sheet({ cells: { ...emailCells, ...filled, B10: '=CHISQ.TEST(B2:D3,B7:D8)', B11: `=CHISQ.DIST.RT(${emailChi.stat},2)` } });
    return [
      ['Welch p (T.TEST type 3)', sh.get('D2'), welch.p, 1e-9], ['pooled p (T.TEST type 2)', sh.get('D3'), pooled.p, 1e-9], ['Welch p = case', welch.p, C.welch.p, 1e-12],
      ['Welch p', welch.p, 0.0113, 0.00005], ['difference', welch.diff, 0.4305, 0.00005], ['interval low', welch.low, 0.10, 0.005], ['interval high', welch.high, 0.76, 0.005],
      ['late p', lateTest.pValue, 0.0326, 0.00005], ['late counts', lateSW * 100 + latePB, 1304], ['extra a month', extraMonthly, 202.5],
      ['power, half a day', powerHalf, 0.838, 0.0005], ['parcels for a quarter day', nQuarter, 218],
      ['email χ² (sheet)', em.get('B10'), emailChi.p, 1e-9], ['email χ² = CHISQ.DIST.RT', em.get('B11'), emailChi.p, 1e-9], ['email p', emailChi.p, 0.2063, 0.00005], ['B vs A p', bVsA.pValue, 0.0823, 0.00005],
      ['expected orders per line', emailChi.expected[0][0], 48.67, 0.005],
      ['workshop F', aov.F, 5.31, 0.005], ['workshop p', aov.p, 0.0080, 0.00005], ['η²', aov.eta2, 0.1696, 0.00005], ['F = case', aov.F, D.project.workshops.anova.F, 1e-12],
      ['in person v online p', pair(0, 1).p, 0.0190, 0.00005], ['in person v hybrid p', pair(0, 2).p, 0.4599, 0.00005], ['online v hybrid p', pair(1, 2).p, 0.0062, 0.00005],
      ['SD ratio under 2', Math.max(...sds) / Math.min(...sds) < 2 ? 1 : 0, 1],
      ['survey interval low %', subCi.low * 100, 54.5, 0.05], ['survey interval high %', subCi.high * 100, 65.4, 0.05], ['non-response bounds', (S.fortnightly / S.invited) * 100, 36.0, 0.05],
      ['replies needed', nPlan, 601], ['invitations', invite, 2004], ['replies for ±2 points', nHalf, 2401], ['survey plan = case', nPlan, D.project.surveyPlan.n],
    ];
  },
};
