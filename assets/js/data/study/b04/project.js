// project.js — B04 applied project: Lantern’s evidence review. In January 2027 Ana Lim has four decisions to make and
// some evidence for each: a courier trial, the November gift-box email test, workshop satisfaction by format and a
// subscriber survey. The student tests what the evidence shows, plans the 2027 customer survey and writes Ana a memo.
// Every figure comes from case.js (COURIER_TRIAL, EMAIL_TEST, WORKSHOP_SCORES, SUBSCRIBER_SURVEY, SURVEY_PLAN, DERIVED
// .project); each `check` recomputes its answer from the raw data, and `verify` compares the figures shown with SciPy-
// checked engine results and the spreadsheet engine's Excel functions.
import { COURIER_TRIAL, EMAIL_TEST, MAILING_LIST, WORKSHOP_SCORES, SUBSCRIBER_SURVEY, SURVEY_PLAN, DERIVED as D } from './case.js?v=14';
import * as I from '../../../core/inference.js?v=14';
import { mean, sd, variance } from '../../../core/stats.js?v=14';
import { Sheet } from '../../../core/sheet.js?v=14';

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
const PARCELS = COURIER_TRIAL.parcelsPerMonth;                    // Ana's planning figure for 2027, parcels a month
const extraMonthly = r((COURIER_TRIAL.parcelbird.price - COURIER_TRIAL.swiftline.price) * PARCELS);
const [lateMonthSW, lateMonthPB] = C.lateMonthly;                 // late parcels a month at the trial's late rates
const SIGMA = COURIER_TRIAL.planningSD;                            // the pooled SD of delivery times, rounded for planning
const powerHalf = C.powerHalfDay, nQuarter = C.nForQuarterDay;
const swEnd = SW.length + 1, pbEnd = PB.length + 1;
const courierCells = { A1: 'Swiftline', B1: 'Parcelbird', ...Object.fromEntries(SW.map((x, i) => [`A${i + 2}`, x])), ...Object.fromEntries(PB.map((x, i) => [`B${i + 2}`, x])) };
const LATE_SHARE = `=COUNTIF(A2:A${swEnd},">"&E1)/COUNT(A2:A${swEnd})`;
// the 2 × 2 late table's other readings, quoted in b04-pj-4 (Fisher's exact test as SciPy computes it; Yates's correction)
const lateTable = [[lateSW, SW.length - lateSW], [latePB, PB.length - latePB]];
const fisherP = (([[a, b], [c, d]]) => {
  const r1 = a + b, c1 = a + c, n = a + b + c + d, pmf = (k) => (I.combin(c1, k) * I.combin(n - c1, r1 - k)) / I.combin(n, r1), p0 = pmf(a);
  let t = 0; for (let k = Math.max(0, r1 + c1 - n); k <= Math.min(r1, c1); k++) { const q = pmf(k); if (q <= p0 * (1 + 1e-7)) t += q; }
  return t;
})(lateTable);
const yatesP = (() => {
  const n = SW.length + PB.length, colT = [lateSW + latePB, n - lateSW - latePB], rowT = [SW.length, PB.length];
  let x2 = 0; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const e = (rowT[i] * colT[j]) / n; x2 += (Math.abs(lateTable[i][j] - e) - 0.5) ** 2 / e; }
  return I.chi2Sf(x2, 1);
})();

// ---------------------------------------------------------------- the email test (lines in rows, as a sheet)
const L = EMAIL_TEST.lines, N = EMAIL_TEST.sent, clicks = L.reduce((t, l) => t + l.clicks, 0);
const emailChi = D.project.email.chi, bVsA = D.project.email.bVsA;
const emailCells = {
  A1: '', B1: 'Clicked', C1: 'Did not click', D1: 'Total',
  ...Object.fromEntries(L.flatMap((l, i) => [[`A${i + 2}`, `Line ${l.id}`], [`B${i + 2}`, l.clicks], [`C${i + 2}`, N - l.clicks], [`D${i + 2}`, `=SUM(B${i + 2}:C${i + 2})`]])),
  A5: 'Total', B5: '=SUM(B2:B4)', C5: '=SUM(C2:C4)', D5: '=SUM(D2:D4)',
  A7: 'Expected', B7: 'Clicked', C7: 'Did not click', A8: 'Line A', A9: 'Line B', A10: 'Line C', A12: 'χ²', A13: 'p-value',
};
const EXPECTED = '=$D2*B$5/$D$5';
const expectedCells = Object.fromEntries(['B', 'C'].flatMap((c) => [8, 9, 10].map((rr) => [`${c}${rr}`, `=$D${rr - 6}*${c}$5/$D$5`])));
const CHI_STAT = '=SUMPRODUCT((B2:C4-B8:C10)^2/B8:C10)';
const emailFormats = { B8: '0.00', C8: '0.00', B9: '0.00', C9: '0.00', B10: '0.00', C10: '0.00', B12: '0.000', B13: '0.0000' };
// power of a two-sided two-proportion z test for a 1-point gap between two lines of 1,500 (normal approximation)
const gapPower = (() => { const p1 = L[0].clicks / N, p2 = p1 + 0.01, se = Math.sqrt((p1 * (1 - p1) + p2 * (1 - p2)) / N), z = 0.01 / se, zc = I.normInv(0.975); return I.normCdf(z - zc) + I.normCdf(-z - zc); })();

// ---------------------------------------------------------------- workshops (in person in A, online in B, hybrid in C)
const WN = Object.keys(WORKSHOP_SCORES), WV = Object.values(WORKSHOP_SCORES);
const aov = I.anova1(WV), W = D.project.workshops;
const pair = (i, j) => I.tTest2(WV[i], WV[j]);
const sds = WV.map((x) => sd(x)), means = WV.map(mean);
const col = (c, xs) => Object.fromEntries(xs.map((x, i) => [`${c}${i + 2}`, x]));
const wEnd = WV.map((x) => x.length + 1), wLast = Math.max(...wEnd);
const workshopCells = { A1: WN[0], B1: WN[1], C1: WN[2], ...col('A', WV[0]), ...col('B', WV[1]), ...col('C', WV[2]), E2: 'F (format)', E4: 'Welch p: online v hybrid' };
const within = `DEVSQ(A2:A${wEnd[0]})+DEVSQ(B2:B${wEnd[1]})+DEVSQ(C2:C${wEnd[2]})`;
const ETA2 = `=1-(${within})/DEVSQ(A2:C${wLast})`;
const F_ONE = `=((DEVSQ(A2:C${wLast})-(${within}))/(3-1))/((${within})/(COUNT(A2:C${wLast})-3))`;
const FOLLOW = `=T.TEST(B2:B${wEnd[1]},C2:C${wEnd[2]},2,3)`;
// Holm's step-down adjustment of the three pairwise p-values, quoted beside Tukey's HSD (statsmodels: 0.048 for in person v online)
const pairPs = [pair(0, 1).p, pair(0, 2).p, pair(1, 2).p];
const holm = (() => { const o = pairPs.map((p, i) => [p, i]).sort((a, b) => a[0] - b[0]); const out = []; let run = 0; o.forEach(([p, i], k) => { run = Math.max(run, Math.min(1, (o.length - k) * p)); out[i] = run; }); return out; })();

// ---------------------------------------------------------------- the subscriber survey and the 2027 plan
const S = SUBSCRIBER_SURVEY, subCi = I.ciProp(S.fortnightly, S.responded);
const nonResp = S.invited - S.responded;
const boundLow = S.fortnightly / S.invited, boundHigh = (S.fortnightly + nonResp) / S.invited;
const fpc = Math.sqrt(nonResp / (S.invited - 1));
const fpcLow = subCi.p - I.normInv(0.975) * subCi.se * fpc, fpcHigh = subCi.p + I.normInv(0.975) * subCi.se * fpc;
// three offers, each worth making if at least this share of all subscribers wants fortnightly delivery
const OFFERS = [
  ['Make fortnightly delivery the default for every subscriber', 0.5],
  ['Drop monthly delivery altogether', 0.8],
  ['Offer fortnightly delivery to anyone who asks for it', 0.3],
];
const offerClass = (bar) => (boundLow >= bar ? 0 : boundHigh < bar ? 2 : 1);
const n0 = (I.normInv(0.975) ** 2 * 0.25) / SURVEY_PLAN.margin ** 2;
const nPlan = I.sampleSizeProp(SURVEY_PLAN.margin, SURVEY_PLAN.conf), invite = Math.ceil(nPlan / SURVEY_PLAN.responseRate - 1e-9);
const nFpc = Math.ceil(n0 / (1 + (n0 - 1) / MAILING_LIST) - 1e-9);
const nHalf = I.sampleSizeProp(SURVEY_PLAN.margin / 2, SURVEY_PLAN.conf);

export default {
  title: 'Lantern’s evidence review',
  brief: [
    { case: 'It is January 2027. Ana Lim has four decisions to make for Lantern Coffee Co. and some evidence behind each: whether to move the shop’s parcels to a faster, dearer courier; which subject line to use for gift-box emails; whether to keep running all three workshop formats; and whether to offer fortnightly deliveries to subscribers. She also wants to plan a proper customer survey for 2027. She asks you to say what the evidence shows, how sure she can be, and what it can’t tell her. Lantern, Ana and every figure are fictional.' },
    { p: 'What you have:' },
    { list: [
      `<b>The courier trial</b> (16 November – 18 December 2026): each order was sent with Swiftline, Lantern’s current courier, or Parcelbird, chosen at random, and Ana tracked a random sample of the parcels: business days to delivery for ${SW.length} Swiftline and ${PB.length} Parcelbird parcels. A parcel is late if it takes more than ${COURIER_TRIAL.lateAfter} business days. Swiftline charges $${f(COURIER_TRIAL.swiftline.price)} a parcel; Parcelbird $${f(COURIER_TRIAL.parcelbird.price)}. Ana plans for about ${PARCELS} parcels a month in 2027.`,
      `<b>The gift-box email</b> (12 November 2026): three subject lines, each sent to ${N.toLocaleString('en-US')} people chosen at random from Lantern’s mailing list of about ${MAILING_LIST.toLocaleString('en-US')} (newsletter sign-ups as well as customers); the number in each group who clicked through to the gift-box page within a week. All three emails offered free delivery on gift boxes; only line C’s subject line said so.`,
      `<b>Workshop satisfaction</b> (2026): scores out of 10 from participants in Lantern’s barista workshops, by format (in person, online, hybrid). Participants chose their own format.`,
      `<b>The subscriber survey</b> (December 2026): all ${S.invited} subscribers were asked whether they would rather receive their coffee every two weeks instead of monthly; ${S.responded} replied.`,
    ] },
  ],
  deliverables: [
    'A comparison of the two couriers: the late shares, the difference in average delivery time with its 95% confidence interval and test, whether the trial was big enough, and what the faster service would cost and save.',
    'A reading of the email test that doesn’t over-claim, including what testing pairs after the fact would do.',
    'A one-way ANOVA of workshop satisfaction by format, with its conditions, effect size, follow-up comparisons and limits.',
    'An interval for the subscribers who prefer fortnightly delivery, the bounds that non-response leaves, and which decisions those bounds can settle.',
    'A sample size for the 2027 customer survey and the number to invite.',
    'A memo to Ana recommending what to do on each question, what each mistake would cost, and what to measure next.',
  ],
  stages: [
    {
      id: 'courier', title: 'Compare the couriers',
      html: `<p>The output below is Excel’s Analysis ToolPak on the trial’s delivery times (Swiftline as Variable 1, Parcelbird as Variable 2). Choose the tool that suits the data, then answer Ana’s questions. Each parcel’s courier was chosen at random, so the two samples are independent and neither courier got the easier parcels by design.</p>`,
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
          solution: `Welch’s test (t-Test: Two-Sample Assuming Unequal Variances, or T.TEST with type 3) doesn’t assume the two couriers’ times vary equally, and here one variance is ${f(variance(SW) / variance(PB), 2)} times the other. With ${SW.length} and ${PB.length} parcels, the means are close to normally distributed even though delivery days are whole numbers. The ToolPak’s Welch output gives p = ${welch.p.toFixed(4)} (two-tailed).` },
        { id: 'b04-pj-2', type: 'formula', kind: 'applied',
          prompt: `Swiftline’s delivery days are in A2:A${swEnd} and Parcelbird’s in B2:B${pbEnd}. A parcel is late if it takes more than the number of business days in E1 (Ana’s cut-off, ${COURIER_TRIAL.lateAfter}). In E2, return the share of Swiftline’s parcels that were late, with a formula that uses E1, so that it still works if Ana moves the cut-off.`,
          sheet: { cells: { ...courierCells, D1: 'Late if more than (days)', E1: COURIER_TRIAL.lateAfter, D2: 'Swiftline late share' }, vary: { E1: [2, 4] } },
          cell: 'E2', view: `A1:E${swEnd}`, maxHeight: '20rem', widths: { A: 11, B: 11, D: 22, E: 9 }, formats: { E2: '0.0%' },
          answer: LATE_SHARE, alt: [`=COUNTIF(A2:A${swEnd},">"&$E$1)/COUNT(A2:A${swEnd})`, `=SUMPRODUCT(--(A2:A${swEnd}>E1))/COUNT(A2:A${swEnd})`],
          wrong: [
            { formula: `=COUNTIF(A2:A${swEnd},">="&E1)/COUNT(A2:A${swEnd})`, say: 'That counts parcels that took E1 days or more. Late means more than E1 days: use ">"&E1.' },
            { formula: `=COUNTIF(A2:A${swEnd},">"&E1)`, say: 'That is the number of late parcels. Divide by the number of parcels, COUNT(A2:A65), to get the share.' },
            { formula: `=COUNTIF(A2:A${swEnd},">E1")/COUNT(A2:A${swEnd})`, say: 'Inside the quotation marks E1 is text, not the cell. Join the operator to the cell: ">"&E1.' },
          ],
          solution: `<x>${LATE_SHARE}</x> gives ${lateSW} ÷ ${SW.length} = ${pct(lateSW / SW.length)}; the same formula on B2:B${pbEnd} gives Parcelbird’s ${latePB} ÷ ${PB.length} = ${pct(latePB / PB.length)}. Joining ">" to E1 with & builds the criterion ">${COURIER_TRIAL.lateAfter}", so the share follows the cut-off: at 2 days Swiftline’s share would be ${pct(SW.filter((x) => x > 2).length / SW.length)}, at 4 days ${pct(SW.filter((x) => x > 4).length / SW.length)}.` },
        { id: 'b04-pj-3', type: 'steps', kind: 'numerical',
          prompt: 'Give the 95% confidence interval for how much longer Swiftline takes than Parcelbird on average (Swiftline minus Parcelbird), from Welch’s method. Use the t critical value for Welch’s degrees of freedom; give each limit in days to two decimal places.',
          steps: [
            num('b04-pj-3-1', 'Difference in sample means (Swiftline − Parcelbird), in days', r(welch.diff, 2), () => mean(SW) - mean(PB), '', [{ value: r(mean(PB) - mean(SW), 2), say: 'That is Parcelbird minus Swiftline. The question asks for Swiftline minus Parcelbird.' }], { unit: 'days', tol: 0.006 }),
            num('b04-pj-3-2', 'Standard error of the difference, √(s₁²/n₁ + s₂²/n₂), to four decimal places', r(welch.se, 4), () => Math.sqrt(variance(SW) / SW.length + variance(PB) / PB.length), '', [{ value: r(pooled.se, 4), say: 'That is the pooled standard error. Welch’s method adds the two variances divided by their own sample sizes.' }], { unit: 'days', places: 4, tol: 0.00006 }),
            num('b04-pj-3-3', 'Lower limit', r(welch.low, 2), () => welch.diff - I.tInv(0.975, welch.df) * welch.se, '', [{ value: r(welch.diff - 1.645 * welch.se, 2), say: 'That uses 1.645, the critical value for 90%. A 95% interval needs about 1.98 for these degrees of freedom.' }], { unit: 'days', tol: 0.011 }),
            num('b04-pj-3-4', 'Upper limit', r(welch.high, 2), () => welch.diff + I.tInv(0.975, welch.df) * welch.se, '', null, { unit: 'days', tol: 0.011 }),
          ],
          solution: `Difference ${f(welch.diff, 3)} days; standard error √(${f(variance(SW), 4)}/${SW.length} + ${f(variance(PB), 4)}/${PB.length}) = ${f(welch.se, 4)}; t critical (${welch.df.toFixed(1)} df) = ${f(I.tInv(0.975, welch.df), 3)}. Interval: ${f(welch.diff, 3)} ± ${f(I.tInv(0.975, welch.df) * welch.se, 3)} = ${f(welch.low, 2)} to ${f(welch.high, 2)} days. It excludes 0, which agrees with the two-sided test’s p = ${welch.p.toFixed(3)}; and it says the speed-up could be as small as a tenth of a day or as large as three-quarters of one.` },
        num('b04-pj-4', `${lateSW} of Swiftline’s ${SW.length} parcels and ${latePB} of Parcelbird’s ${PB.length} were late. What is the two-sided p-value of the two-proportion z test (pooled standard error) that the couriers’ late rates are equal? Give four decimal places.`, r(lateTest.pValue, 4),
          () => I.propTest2(lateSW, SW.length, latePB, PB.length).pValue,
          `Late shares ${pct(lateSW / SW.length)} and ${pct(latePB / PB.length)}; pooled proportion ${lateSW + latePB}/${SW.length + PB.length} = ${f(lateTest.pool, 4)}; standard error √(p̂(1 − p̂)(1/${SW.length} + 1/${PB.length})) = ${f(lateTest.sePool, 4)}; z = ${f(lateTest.z, 3)}; p = ${lateTest.pValue.toFixed(4)}. Parcelbird had only ${latePB} late parcels, below this course’s condition of at least 10 successes and 10 failures in each sample, so the p-value is approximate (the expected late counts under H₀ are ${f(lateTest.pool * SW.length, 1)} and ${f(lateTest.pool * PB.length, 1)}). Fisher’s exact test, in statistical software, gives p ≈ ${fisherP.toFixed(3)}; with a continuity correction p ≈ ${yatesP.toFixed(3)}: borderline evidence.`,
          [{ value: r(lateTest.pValue / 2, 4), say: 'That is the one-sided p-value. Ana asked whether the late rates differ, in either direction: double the tail.' }],
          { places: 4, tol: 0.0006 }),
        { id: 'b04-pj-5', type: 'multi', kind: 'conceptual',
          prompt: 'Select every statement the courier results support.',
          options: [
            `A gap of ${f(welch.diff, 2)} days would be unusual if the couriers were really equally fast.`,
            `There is a ${(100 - welch.p * 100).toFixed(1)}% chance that Parcelbird is faster than Swiftline on average, given these results.`,
            'The 95% interval puts the real speed-up between about a tenth and three-quarters of a day.',
            'Because the test is significant at the 5% level, the speed-up is large enough to matter to Lantern’s customers.',
            'Fewer Parcelbird parcels were late, but with so few late parcels that comparison is rougher than the one for mean days.',
          ],
          answer: [0, 2, 4],
          feedback: {
            1: 'A p-value is not the probability that a hypothesis is true. It is how often a difference this large would arise by chance if the couriers were equally fast.',
            3: 'Significance says the difference is unlikely to be chance alone. Whether half a day matters is a business judgement: weigh it against the extra cost.',
          },
          solution: `The test and the interval agree that Parcelbird is faster on average, by somewhere around 0.1 to 0.76 days. Neither says how likely a hypothesis is, nor whether the gain is worth paying for. The late-parcel comparison rests on ${lateSW + latePB} late parcels in all, so it is less precise.` },
        num('b04-pj-6', `How much more a month would Parcelbird cost Ana at ${PARCELS} parcels a month? Give dollars to the cent.`, extraMonthly,
          () => (COURIER_TRIAL.parcelbird.price - COURIER_TRIAL.swiftline.price) * PARCELS,
          `($${f(COURIER_TRIAL.parcelbird.price)} − $${f(COURIER_TRIAL.swiftline.price)}) × ${PARCELS} = $${f(extraMonthly)} a month, about $${(extraMonthly * 12).toLocaleString('en-US', { maximumFractionDigits: 0 })} a year, for parcels that arrive about ${f(welch.diff, 1)} days sooner on average.`,
          [{ value: r(COURIER_TRIAL.parcelbird.price * PARCELS), say: 'That is Parcelbird’s whole bill. The question asks how much more it costs than Swiftline.' }],
          { unit: '$', tol: 0.005, kind: 'applied' }),
        { id: 'b04-pj-7', type: 'steps', kind: 'applied',
          prompt: `If each courier’s late rate in the trial held in 2027, how many late parcels a month would it mean at ${PARCELS} parcels a month? The expected number of late parcels in a month is n × p, the mean of a binomial count. Give each to one decimal place.`,
          steps: [
            num('b04-pj-7-1', 'Swiftline', r(lateMonthSW, 1), () => (PARCELS * lateSW) / SW.length, '', [{ value: r((lateSW / SW.length) * 100, 1), say: 'That is the late share as a percentage. Multiply the share by the 450 parcels a month.' }], { unit: 'parcels', places: 1, tol: 0.06 }),
            num('b04-pj-7-2', 'Parcelbird', r(lateMonthPB, 1), () => (PARCELS * latePB) / PB.length, '', null, { unit: 'parcels', places: 1, tol: 0.06 }),
          ],
          solution: `${PARCELS} × ${lateSW}/${SW.length} = ${f(lateMonthSW, 1)} and ${PARCELS} × ${latePB}/${PB.length} = ${f(lateMonthPB, 1)}: about ${Math.round(lateMonthSW - lateMonthPB)} fewer late parcels a month with Parcelbird, for $${f(extraMonthly)} more. These are estimates from small counts (Parcelbird’s rests on ${latePB} late parcels), so the true gap could be well above or below ${Math.round(lateMonthSW - lateMonthPB)}: the 95% interval for the difference in late rates (unpooled) runs from ${f(lateTest.low * 100, 1)} to ${f(lateTest.high * 100, 1)} points, or about ${Math.round(lateTest.low * PARCELS)} to ${Math.round(lateTest.high * PARCELS)} fewer late parcels a month.` },
        { id: 'b04-pj-8', type: 'steps', kind: 'numerical',
          prompt: `Was the trial big enough? Treat the SD of delivery times as ${SIGMA} days for both couriers (the pooled SD, ${f(C.pooledSD, 3)}, rounded) and use the normal approximation for a two-sided test at α = 0.05. For two groups of n with the same σ, the standard error of the difference is √(σ²/n + σ²/n) = σ√(2/n), so the n per group for a given power is 2 × ((z₀.₉₇₅ + z₀.₈₀) × σ ÷ δ)². The trial had ${SW.length} and ${PB.length} parcels; use 60 for each.`,
          steps: [
            num('b04-pj-8-1', 'With 60 parcels per courier, what was the power to detect a true difference of half a day? Give a percentage to one decimal place.', r(powerHalf * 100, 1),
              () => I.powerMean({ delta: 0.5, sigma: SIGMA, n: 60, twoSample: true }) * 100, '',
              [{ value: r(I.powerMean({ delta: 0.5, sigma: SIGMA, n: 60 }) * 100, 1), say: 'That treats it as a one-sample test. A difference of two means has standard error σ√(2/n).' }],
              { unit: '%', places: 1, tol: 0.06 }),
            num('b04-pj-8-2', 'How many parcels per courier would give 80% power to detect a difference of a quarter of a day? Round up.', nQuarter,
              () => I.sampleSizeForPower({ delta: 0.25, sigma: SIGMA, twoSample: true }), '',
              [{ value: I.sampleSizeForPower({ delta: 0.25, sigma: SIGMA }), say: 'That is the one-sample formula. For two groups, n per group = 2 × ((z₀.₉₇₅ + z₀.₈₀) × σ ÷ δ)².' }],
              { unit: 'parcels', places: 0, tol: 0.5 }),
          ],
          solution: `Standard error of the difference: ${SIGMA} × √(2/60) = ${f(SIGMA * Math.sqrt(2 / 60), 4)}. Power = P(Z > 1.96 − 0.5/${f(SIGMA * Math.sqrt(2 / 60), 4)}) + P(Z < −1.96 − 0.5/${f(SIGMA * Math.sqrt(2 / 60), 4)}) = ${pct(powerHalf)}: the trial was big enough to catch half a day most of the time. For a quarter of a day, n = 2 × ((1.960 + 0.842) × ${SIGMA} ÷ 0.25)² = ${f(2 * ((I.normInv(0.975) + I.normInv(0.8)) * SIGMA / 0.25) ** 2, 1)}, so ${nQuarter} parcels per courier.` },
      ],
    },
    {
      id: 'email', title: 'Read the email test',
      html: '<p>Each subject line went to its own random group from the mailing list, so the groups differ only by chance and by the subject line. The worksheet holds the counts, one row per line. Build the expected counts, then test whether the click-through rate depends on the subject line. Type your χ² into the chart’s a box to see where it falls.</p>',
      tool: { kind: 'widget', widget: { type: 'curve', title: 'Chi-square distribution with 2 degrees of freedom', dist: 'chisq', params: { df: 2 }, asks: ['above'], a: 5.99, critical: { alpha: 0.05, tails: 'upper' }, xLabel: 'χ²', note: 'The shaded tail beyond 5.99 is the 5% rejection region. Type your χ² as a to see its p-value.' } },
      items: [
        { id: 'b04-pj-9', type: 'formula', kind: 'applied',
          prompt: 'Rows 2 to 4 are the observed counts, one row per subject line, with their totals in column D and row 5. In B8, write the expected number of clicks for line A if the click-through rate didn’t depend on the subject line, in a formula that can be filled to B8:C10.',
          sheet: { cells: emailCells }, cell: 'B8', fill: 'B8:C10', view: 'A1:D10', widths: { A: 10, B: 9, C: 13 },
          answer: EXPECTED, alt: ['=B$5*$D2/$D$5', '=$D2*(B$5/$D$5)'],
          wrong: [
            { formula: '=D2*B5/D5', say: 'Right in B8, but filled across and down the references move: the column total must keep its row (B$5), the row total its column ($D2) and the grand total both ($D$5).' },
            { formula: '=B2', say: 'That copies the observed count. The expected count is what independence would predict: row total × column total ÷ grand total.' },
            { formula: '=$D$5/6', say: 'That spreads the grand total equally over six cells. Clicks are far rarer than non-clicks: use row total × column total ÷ grand total.' },
            { formula: '=$D$2*B$5/$D$5', say: 'With $D$2 every row uses line A’s total. They are all 1,500 here, but lock only the column ($D2) so each row uses its own total.' },
            { formula: '=B$5/3', say: 'That works only because every line went to 1,500 people. Row total × column total ÷ grand total holds whatever the group sizes.' },
          ],
          solution: `<x>${EXPECTED}</x> filled to C10. Each line went to ${N.toLocaleString('en-US')} people and ${clicks} clicked in all, so each expected click count is ${N.toLocaleString('en-US')} × ${clicks} ÷ ${(3 * N).toLocaleString('en-US')} = ${f(emailChi.expected[0][0], 2)}; every expected count is well above 5.` },
        { id: 'b04-pj-10', type: 'steps', kind: 'applied',
          prompt: 'With the expected counts in B8:C10, test whether the click-through rate depends on the subject line.',
          steps: [
            { id: 'b04-pj-10-1', type: 'formula',
              prompt: 'In B12, calculate the chi-square statistic from the observed and expected counts, Σ (O − E)² ÷ E, in one formula.',
              sheet: { cells: { ...emailCells, ...expectedCells } }, cell: 'B12', view: 'A1:D13', widths: { A: 10, B: 9, C: 13 }, formats: emailFormats,
              answer: CHI_STAT, alt: ['=SUM((B2:C4-B8:C10)^2/B8:C10)'],
              wrong: [
                { formula: '=SUMPRODUCT((B2:C4-B8:C10)^2/B2:C4)', say: 'That divides by the observed counts. Each term divides by its expected count E.' },
                { formula: '=SUMPRODUCT((B2:C4-B8:C10)/B8:C10)', say: 'Without squaring, the positive and negative deviations cancel. Square each O − E first.' },
                { formula: '=SUMPRODUCT((B2:C4-B8:C10)^2)', say: 'Each squared deviation must be divided by its own expected count before adding.' },
                { formula: '=SUMPRODUCT((B2:B4-B8:B10)^2/B8:B10)', say: 'That adds only the clicked column. χ² adds over all six cells, including those who didn’t click.' },
              ],
              solution: `<x>${CHI_STAT}</x> = ${f(emailChi.stat, 3)}. SUMPRODUCT works through the six cells: (O − E)² ÷ E for each, then the sum.` },
            { id: 'b04-pj-10-2', type: 'formula',
              prompt: 'In B13, calculate the p-value from the χ² in B12.',
              sheet: { cells: { ...emailCells, ...expectedCells, B12: CHI_STAT } }, cell: 'B13', view: 'A1:D13', widths: { A: 10, B: 9, C: 13 }, formats: emailFormats,
              answer: '=CHISQ.DIST.RT(B12,2)', alt: ['=1-CHISQ.DIST(B12,2,TRUE)', '=CHISQ.TEST(B2:C4,B8:C10)'],
              wrong: [
                { formula: '=CHISQ.DIST(B12,2,TRUE)', say: 'That is the area to the left of χ². Large values are the evidence against independence: use the right tail, CHISQ.DIST.RT.' },
                { formula: '=CHISQ.DIST.RT(B12,5)', say: 'The degrees of freedom are (rows − 1) × (columns − 1) = (3 − 1) × (2 − 1) = 2, not the number of cells minus 1.' },
                { formula: '=CHISQ.DIST.RT(B12,6)', say: 'The degrees of freedom are (rows − 1) × (columns − 1) = 2, not the number of cells.' },
              ],
              solution: `<x>=CHISQ.DIST.RT(B12,2)</x> = ${emailChi.p.toFixed(4)}, with (3 − 1)(2 − 1) = 2 degrees of freedom; <x>=CHISQ.TEST(B2:C4,B8:C10)</x> gives the same p-value in one step.` },
          ],
          solution: `χ² = ${f(emailChi.stat, 3)} on 2 degrees of freedom, p = ${emailChi.p.toFixed(3)}: differences in click-through as large as these would arise by chance about one time in five if the subject line made no difference.` },
        { id: 'b04-pj-11', type: 'mc', kind: 'conceptual',
          prompt: `Line B had the highest click-through rate (${pct(L[1].clicks / N)}) and line A the lowest (${pct(L[0].clicks / N)}). A colleague tests B against A alone and gets p = ${bVsA.pValue.toFixed(3)}. What should Ana conclude?`,
          options: [
            'No clear evidence the lines differ; testing the top pair after seeing the results overstates it',
            'Line B is the best subject line, because it had the most clicks of the three lines in the test',
            'The subject lines make no difference at all to whether people click through to the gift boxes',
            'Line B wins at the 10% level, so Ana should use it for every future gift-box email she sends out',
          ],
          answer: 0,
          feedback: {
            1: 'B had the most clicks in this sample, but the overall test says differences this size arise by chance about one time in five.',
            2: `Not significant is not “no difference”: the test may not have been big enough to detect a difference of about one percentage point (its power to detect a 1-point gap between two lines of ${N.toLocaleString('en-US')} is only about ${Math.round(gapPower * 100)}%).`,
            3: 'Choosing the pair to test after seeing which was highest and lowest makes a small p-value more likely by chance; with three possible pairs, Bonferroni would ask each for p below 0.05 ÷ 3 ≈ 0.017, and 0.08 is not convincing even before that.',
          },
          solution: `The overall χ² test (p = ${emailChi.p.toFixed(3)}) finds no clear evidence that the click-through rate depends on the subject line. Testing the best line against the worst after seeing the results is one of three possible comparisons, chosen because it looked largest, so its p-value of ${bVsA.pValue.toFixed(3)} understates how easily chance produces such a gap. Clicks are not orders either. Ana can use any of the lines, or run a larger test of the two she likes best.` },
      ],
    },
    {
      id: 'workshops', title: 'Compare the workshop formats',
      html: `<p>The ToolPak output below is a one-way ANOVA of the 2026 satisfaction scores by format. Participants chose their own format, and each person is counted once. The worksheets hold the scores: ${WN[0].toLowerCase()} in A, ${WN[1].toLowerCase()} in B and ${WN[2].toLowerCase()} in C.</p>`,
      tool: { kind: 'widget', widget: { type: 'toolpak', title: 'Workshop satisfaction (0–10) by format, 2026', tool: 'anova', groups: WN.map((n, i) => ({ name: n, values: WV[i] })), alpha: 0.05 } },
      items: [
        { id: 'b04-pj-12', type: 'formula', kind: 'applied',
          prompt: `In F2, calculate the F statistic for format in one formula from the scores themselves, rather than reading it from the ToolPak’s output, so that it would update if a score were corrected.`,
          sheet: { cells: workshopCells }, cell: 'F2', view: `A1:F${wLast}`, maxHeight: '20rem', widths: { A: 10, B: 9, C: 9, E: 22, F: 9 }, formats: { F2: '0.000' },
          answer: F_ONE, alt: [`=((DEVSQ(A2:C${wLast})-(${within}))/2)/((${within})/(COUNT(A2:A${wEnd[0]})+COUNT(B2:B${wEnd[1]})+COUNT(C2:C${wEnd[2]})-3))`],
          wrong: [
            { formula: `=(DEVSQ(A2:C${wLast})-(${within}))/(${within})`, say: 'That divides the sums of squares. F divides the mean squares: each sum of squares ÷ its degrees of freedom (k − 1 = 2 between, N − k = 52 within).' },
            { formula: `=((DEVSQ(A2:C${wLast})-(${within}))/(3-1))/((${within})/(COUNT(A2:C${wLast})-1))`, say: 'N − 1 is the total degrees of freedom. Within groups they are N − k: 55 − 3 = 52.' },
            { formula: `=((${within})/(COUNT(A2:C${wLast})-3))/((DEVSQ(A2:C${wLast})-(${within}))/(3-1))`, say: 'That is upside down. F puts the between-groups mean square on top.' },
          ],
          solution: `SS total is <x>=DEVSQ(A2:C${wLast})</x> = ${f(aov.sst, 3)} (DEVSQ skips the empty cells), SS within is the sum of each format’s DEVSQ, ${f(aov.ssw, 3)}, and SS between is the difference, ${f(aov.ssb, 3)}. With k − 1 = ${aov.dfb} and N − k = ${aov.dfw} degrees of freedom, F = (${f(aov.ssb, 3)} ÷ ${aov.dfb}) ÷ (${f(aov.ssw, 3)} ÷ ${aov.dfw}) = ${f(aov.F, 3)}, as the ToolPak shows. The same sums of squares give the effect size: η² = ${f(aov.ssb, 3)} ÷ ${f(aov.sst, 3)} = ${f(aov.eta2, 3)}, so format goes with about a sixth of the variation in scores.` },
        { id: 'b04-pj-13', type: 'multi', kind: 'conceptual',
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
            4: 'Three tests at 5% each give about a 14% chance of at least one false positive if the tests were independent (at most 15%). That is why ANOVA, or adjusted follow-ups, are used.',
          },
          solution: `The variances are close enough, the scores are independent and roughly normal, and the result is significant (F = ${f(aov.F, 2)} on ${aov.dfb} and ${aov.dfw} df, p = ${aov.p.toFixed(4)}). Format accounts for η² = ${pct(aov.eta2)} of the variation; most of it is between people within a format. Welch’s ANOVA (p ≈ ${W.welch.p.toFixed(3)}) and Kruskal–Wallis (p ≈ ${W.kw.p.toFixed(3)}), which relax the equal-variance and normality conditions, agree, so the conclusion doesn’t hang on them. But a significant F only says the means are not all equal, and because people chose their format (online participants may differ in experience or motivation), the difference can’t be put down to the format alone.` },
        { id: 'b04-pj-14', type: 'formula', kind: 'applied',
          prompt: 'Ana follows up the ANOVA with Welch’s t test for each pair of formats. In F4, return the two-tailed p-value of Welch’s test comparing the online scores with the hybrid ones, using T.TEST.',
          sheet: { cells: workshopCells }, cell: 'F4', view: `A1:F${wLast}`, maxHeight: '20rem', widths: { A: 10, B: 9, C: 9, E: 22, F: 9 }, formats: { F4: '0.0000' },
          answer: FOLLOW, require: ['T.TEST'], alt: [`=T.TEST(C2:C${wEnd[2]},B2:B${wEnd[1]},2,3)`, `=2*T.TEST(B2:B${wEnd[1]},C2:C${wEnd[2]},1,3)`],
          wrong: [
            { formula: `=T.TEST(B2:B${wEnd[1]},C2:C${wEnd[2]},2,2)`, say: 'Type 2 is the pooled test. Ana’s follow-ups use Welch’s test, type 3, which doesn’t assume equal variances.' },
            { formula: `=T.TEST(B2:B${wEnd[1]},C2:C${wEnd[2]},1,3)`, say: 'tails = 1 gives the one-tailed p-value. The follow-up asks whether the two formats differ in either direction: tails = 2.' },
            { formula: `=T.TEST(A2:A${wEnd[0]},B2:B${wEnd[1]},2,3)`, say: 'That compares in person (column A) with online. The question asks for online (B) against hybrid (C).' },
          ],
          solution: `<x>${FOLLOW}</x> = ${pair(1, 2).p.toFixed(4)}: online (mean ${f(means[1], 2)}) against hybrid (mean ${f(means[2], 2)}). The other two pairs, from the same function, are in the next task.` },
        { id: 'b04-pj-15', type: 'classify', kind: 'applied',
          prompt: 'Ana follows up with Welch’s t test for each pair of formats, using the Bonferroni level 0.05 ÷ 3. Classify each comparison.',
          items: WN.flatMap((a, i) => WN.slice(i + 1).map((b) => `${a} against ${b}: p = ${pair(i, WN.indexOf(b)).p.toFixed(4)}`)),
          categories: ['Significant at the Bonferroni level', 'Not significant at the Bonferroni level'],
          answer: WN.flatMap((a, i) => WN.slice(i + 1).map((b) => (pair(i, WN.indexOf(b)).p < 0.05 / 3 ? 0 : 1))),
          feedback: { 0: `p = ${pair(0, 1).p.toFixed(3)} is below 0.05 but above 0.0167, the Bonferroni level for three comparisons.` },
          solution: `Only online against hybrid (p = ${pair(1, 2).p.toFixed(4)}) clears 0.0167. In person against online (p = ${pair(0, 1).p.toFixed(4)}) would pass at 0.05 on its own, but not once the three comparisons are allowed for; in person against hybrid (p = ${pair(0, 2).p.toFixed(4)}) gives no evidence of a difference (means ${f(means[0], 2)} and ${f(means[2], 2)}). Bonferroni is conservative: Tukey’s HSD, run in statistical software, gives an adjusted p ≈ 0.048 for in person against online, and Holm’s method (Bonferroni step by step: the smallest p against 0.05 ÷ 3, the next against 0.05 ÷ 2, the last against 0.05) gives ${holm[0].toFixed(3)}, so that pair is borderline rather than clearly no different. The evidence points to online workshops scoring lower than hybrid ones, and probably lower than in-person ones.` },
      ],
    },
    {
      id: 'survey', title: 'Read the subscriber survey',
      html: `<p>${S.responded} of Lantern’s ${S.invited} subscribers answered the December question, and ${S.fortnightly} said they would rather receive their coffee every two weeks.</p>`,
      items: [
        { id: 'b04-pj-16', type: 'steps', kind: 'numerical',
          prompt: `Give the 95% confidence interval for the share of subscribers like those who replied who would prefer fortnightly delivery (Wald interval, without the finite population correction: the ${S.responded} chose to reply, so treat them as a sample of subscribers like them). Give percentages to one decimal place.`,
          steps: [
            num('b04-pj-16-1', 'Lower limit', r(subCi.low * 100, 1), () => I.ciProp(S.fortnightly, S.responded).low * 100, '', [
              { value: r(I.ciProp(S.fortnightly, S.invited).low * 100, 1), say: `That divides by all ${S.invited} subscribers. The sample is the ${S.responded} who replied.` },
              { value: r(fpcLow * 100, 1), say: `That applies the finite population correction, which is for a random sample from a known population. The ${S.responded} chose to reply: treat them as a sample of subscribers like them.` },
            ], { unit: '%', places: 1, tol: 0.06 }),
            num('b04-pj-16-2', 'Upper limit', r(subCi.high * 100, 1), () => I.ciProp(S.fortnightly, S.responded).high * 100, '', [
              { value: r(fpcHigh * 100, 1), say: `That applies the finite population correction, which is for a random sample from a known population. The ${S.responded} chose to reply: treat them as a sample of subscribers like them.` },
            ], { unit: '%', places: 1, tol: 0.06 }),
          ],
          solution: `p̂ = ${S.fortnightly}/${S.responded} = ${pct(subCi.p)}; standard error √(p̂(1 − p̂)/${S.responded}) = ${f(subCi.se, 4)}; margin 1.96 × ${f(subCi.se, 4)} = ${pct(subCi.margin)}. Interval ${pct(subCi.low)} to ${pct(subCi.high)}. Both counts (${S.fortnightly} and ${S.responded - S.fortnightly}) are well above 10, so the normal approximation is fine. Had the ${S.responded} been a random sample of the ${S.invited}, the finite population correction √(${nonResp}/${S.invited - 1}) = ${f(fpc, 3)} would narrow this to ${pct(fpcLow)} to ${pct(fpcHigh)}; they chose to reply, so the bigger uncertainty is non-response.` },
        { id: 'b04-pj-17', type: 'steps', kind: 'numerical',
          prompt: `${nonResp} subscribers didn’t reply. What share of all ${S.invited} subscribers prefer fortnightly delivery if…`,
          steps: [
            num('b04-pj-17-1', '…none of the non-respondents prefers it? Give a percentage to one decimal place.', r(boundLow * 100, 1), () => (S.fortnightly / S.invited) * 100, '', null, { unit: '%', places: 1, tol: 0.06 }),
            num('b04-pj-17-2', '…all of the non-respondents prefer it? Give a percentage to one decimal place.', r(boundHigh * 100, 1), () => ((S.fortnightly + nonResp) / S.invited) * 100, '', null, { unit: '%', places: 1, tol: 0.06 }),
          ],
          solution: `${S.fortnightly}/${S.invited} = ${pct(boundLow)} and (${S.fortnightly} + ${nonResp})/${S.invited} = ${pct(boundHigh)}. The confidence interval allows for sampling error among those who replied; it can’t allow for who chose not to reply. If replying was linked to wanting a change, the true share could be anywhere between these bounds, which are much wider than the interval.` },
        { id: 'b04-pj-18', type: 'classify', kind: 'applied',
          prompt: `Ana is weighing three changes. Each is worth making only if at least the stated share of all ${S.invited} subscribers wants fortnightly delivery. Using the non-response bounds, classify each.`,
          items: OFFERS.map(([what, bar]) => `${what} (worth it at ${bar * 100}% or more)`),
          categories: ['Worth it whatever the non-respondents think', 'Depends on what the non-respondents think', 'Not worth it whatever the non-respondents think'],
          answer: OFFERS.map(([, bar]) => offerClass(bar)),
          feedback: {
            0: `The bounds run from ${pct(boundLow)} to ${pct(boundHigh)}, either side of 50%: the decision turns on the ${nonResp} who didn’t reply. The interval from the replies (${pct(subCi.low)} to ${pct(subCi.high)}) can’t settle it, because it says nothing about non-response.`,
            1: `Even if every non-respondent wanted fortnightly delivery, only ${pct(boundHigh)} of subscribers would: short of 80%.`,
            2: `Even if no non-respondent wanted it, ${pct(boundLow)} of all subscribers do, above 30%.`,
          },
          solution: `The bounds (${pct(boundLow)} to ${pct(boundHigh)}) settle two of the three decisions without any assumption about the ${nonResp} who didn’t reply: an option for those who ask clears 30% even in the worst case, and dropping monthly delivery falls short of 80% even in the best. Only making fortnightly the default needs more evidence; a follow-up of a random handful of non-respondents would show whether they lean the same way as those who replied.` },
      ],
    },
    {
      id: 'plan', title: 'Plan the 2027 customer survey',
      html: `<p>Ana wants to estimate a proportion among the people on her mailing list (for example, the share who would recommend Lantern to a friend) to within ±${SURVEY_PLAN.margin * 100} percentage points at ${SURVEY_PLAN.conf * 100}% confidence. She will invite people from the mailing list (about ${MAILING_LIST.toLocaleString('en-US')}), and from past surveys she expects about ${SURVEY_PLAN.responseRate * 100}% of those invited to reply.</p>`,
      tool: { kind: 'widget', widget: { type: 'curve', title: 'The standard normal distribution: the 95% critical value', dist: 'normal', params: { mean: 0, sd: 1 }, asks: ['inverse', 'outside'], prob: 0.975, a: 1.96, xLabel: 'z' } },
      items: [
        num('b04-pj-19', 'How many completed replies does she need? Use p = 0.5 and round up.', nPlan, () => Math.ceil((I.normInv(0.975) ** 2 * 0.25) / 0.04 ** 2 - 1e-9),
          `n = z² × p(1 − p) ÷ E² = 1.960² × 0.25 ÷ 0.04² = ${f(n0, 2)}, so ${nPlan} replies. p = 0.5 gives the largest p(1 − p), so the margin will be at most ±4 points whatever the true share. The formula assumes a population much larger than the sample; with about ${MAILING_LIST.toLocaleString('en-US')} on the list, the finite population correction would lower the need a little (to about ${nFpc} replies), so ${nPlan} is on the safe side.`,
          [{ value: Math.ceil((1.645 ** 2 * 0.25) / 0.0016), say: 'That uses 1.645, the critical value for 90% confidence. 95% needs 1.96.' }, { value: Math.ceil((1.96 * 0.5) / 0.04), say: 'Square the whole ratio: n = (z/E)² × p(1 − p).' }],
          { unit: 'replies', places: 0, tol: 0.5 }),
        num('b04-pj-20', 'How many people on the mailing list should she invite? Round up.', invite, () => Math.ceil(nPlan / SURVEY_PLAN.responseRate - 1e-9),
          `${nPlan} ÷ ${SURVEY_PLAN.responseRate} = ${f(nPlan / SURVEY_PLAN.responseRate, 1)}, so ${invite.toLocaleString('en-US')} invitations, about a third of the list. This buys precision, not representativeness: the 70% who don’t reply may differ from those who do. The list includes people who have never bought from Lantern; for a question about customers only, she would screen the others out, and the sample size would then apply to customers’ replies.`,
          [{ value: Math.ceil(nPlan * SURVEY_PLAN.responseRate), say: `That multiplies by the response rate. To end up with ${nPlan} replies when 30% reply, divide by 0.3.` }],
          { unit: 'people', places: 0, tol: 0.5, kind: 'applied' }),
        { id: 'b04-pj-21', type: 'mc', kind: 'conceptual',
          prompt: `If Ana wanted ±${SURVEY_PLAN.margin * 50} points instead of ±${SURVEY_PLAN.margin * 100}, how many replies would she need?`,
          options: [`About four times as many: ${nHalf.toLocaleString('en-US')}`, `About twice as many: ${(2 * nPlan).toLocaleString('en-US')}`, `About half as many: ${Math.ceil(nPlan / 2)}`, `The same ${nPlan}: the confidence level is unchanged`],
          answer: 0,
          feedback: { 1: 'The margin shrinks with √n, so halving it needs four times the sample, not twice.', 2: 'A smaller margin needs more replies, not fewer.', 3: 'The margin E appears squared in n = z² p(1 − p) / E².' },
          solution: `n is proportional to 1/E², so halving the margin multiplies n by four: 1.96² × 0.25 ÷ 0.02² = ${nHalf.toLocaleString('en-US')}, which would mean inviting about ${Math.ceil(nHalf / SURVEY_PLAN.responseRate - 1e-9).toLocaleString('en-US')} people, more than the whole list at a 30% response rate.` },
      ],
    },
    {
      id: 'memo', title: 'Write Ana’s memo',
      html: '<p>Bring the four questions together for Ana: what to do, how sure she can be, what each mistake would cost, and what the data can’t tell her.</p>',
      items: [
        { id: 'b04-pj-22', type: 'short', kind: 'applied',
          prompt: 'Write Ana a memo of 250–350 words with a recommendation on each of the four questions (courier, subject lines, workshop formats, fortnightly deliveries) and the survey plan. For each, give the key figure with its uncertainty (an interval or a p-value), say whether the difference is large enough to matter, and name one thing the evidence can’t show. For the courier, say what each kind of mistake would cost.',
          rubric: [
            `Courier: the speed-up with its interval (about 0.10 to 0.76 days) and test; the cost (about $200 a month); what each mistake would cost (paying about $${Math.round(extraMonthly * 12).toLocaleString('en-US')} a year for nothing if Parcelbird is no faster, against slower parcels and, at the trial’s late rates, about ${Math.round(lateMonthSW - lateMonthPB)} more late parcels a month if Parcelbird really is better and Ana stays); a recommendation that weighs them; notes the trial’s power, the small number of late parcels and that the trial ran in the Christmas peak.`,
            'Email: no clear evidence the subject lines differ in click-through (p ≈ 0.21); doesn’t crown line B on a post-hoc comparison; notes that clicks are not orders; suggests a larger test if the choice matters.',
            'Workshops: a significant ANOVA (p ≈ 0.008, η² ≈ 17%), confirmed by Welch’s ANOVA or Kruskal–Wallis, with follow-ups showing online below hybrid (and probably below in person), and the self-selection caveat (it doesn’t show the format causes the scores).',
            'Survey: the interval for fortnightly delivery (about 54.5% to 65.4% of respondents) with the non-response bounds (36.0% to 76.0% of all subscribers), and a decision the bounds support (an option, not a new default); the 2027 plan of 601 replies and about 2,004 invitations.',
            'Distinguishes statistical from practical significance throughout and never treats a p-value as the probability a hypothesis is true.',
          ],
          model: `<b>To:</b> Ana · <b>From:</b> analyst · <b>Re:</b> what the evidence shows<br><br><b>Courier.</b> Parcelbird delivered ${f(welch.diff, 2)} business days faster on average (95% interval ${f(welch.low, 2)} to ${f(welch.high, 2)} days; Welch’s test p = ${welch.p.toFixed(3)}) and had fewer late parcels (${latePB} of ${PB.length} against ${lateSW} of ${SW.length}: at ${PARCELS} parcels a month, about ${Math.round(lateMonthPB)} late against ${Math.round(lateMonthSW)}), though so few late parcels make that comparison rough. It would cost $${f(extraMonthly)} a month more. The two mistakes cost different things: switching when Parcelbird is no faster wastes about $${Math.round(extraMonthly * 12).toLocaleString('en-US')} a year; staying when it is faster leaves about ${Math.round(lateMonthSW - lateMonthPB)} extra late parcels a month. The trial had about ${pct(powerHalf, 0)} power to detect half a day. I recommend switching, then checking late deliveries and repeat orders for the first quarter: the trial ran through the Christmas peak, and ordinary weeks may differ.<br><br><b>Subject lines.</b> The test gives no clear evidence that any line draws more clicks (p = ${emailChi.p.toFixed(2)}). Line B’s lead could be chance, and clicks are not orders. Choose freely, or test B against C with larger groups next season.<br><br><b>Workshops.</b> Satisfaction differs by format (p = ${aov.p.toFixed(3)}, confirmed by Welch’s ANOVA; format accounts for about ${pct(aov.eta2, 0)} of the variation): online workshops score lower than hybrid ones, and probably than in-person ones. People chose their format, so this may reflect who books online rather than the format itself. Before dropping online, ask its participants what would improve it.<br><br><b>Fortnightly delivery.</b> ${pct(subCi.p)} of the subscribers who replied prefer it (95% interval ${pct(subCi.low)} to ${pct(subCi.high)}), but 40% didn’t reply; across all subscribers the share could be anywhere from ${pct(boundLow)} to ${pct(boundHigh)}. That is enough to offer it as an option, not to make it the default.<br><br><b>2027 survey.</b> To estimate a share within ±4 points at 95% confidence we need ${nPlan} replies; at a 30% response rate, invite about ${invite.toLocaleString('en-US')} people from the mailing list, and follow up a sample of non-respondents.` },
      ],
    },
  ],
  rubric: [
    'Each method fits the data: Welch’s test for two independent samples with unequal variances, a chi-square test for counts in a table, one-way ANOVA for several group means, a proportion interval for a survey share.',
    'Every result is reported with its uncertainty (an interval or a p-value) and its conditions are checked (sample sizes, expected counts, equal variances, independence).',
    'Statistical significance is kept apart from practical importance, and decisions weigh what each kind of mistake would cost: the courier’s speed-up and fewer late parcels are weighed against its price.',
    'Nothing is over-claimed: no p-value read as the probability a hypothesis is true, no “accepting” H₀, no post-hoc pair crowned, no causal claim from self-selected groups, non-response stated as a separate risk from sampling error.',
    'The memo gives Ana a clear recommendation on each question and says what to measure next.',
  ],
  verify() {
    const sh = new Sheet({ cells: { ...courierCells, E1: COURIER_TRIAL.lateAfter, E2: LATE_SHARE, D2: `=T.TEST(A2:A${swEnd},B2:B${pbEnd},2,3)`, D3: `=T.TEST(A2:A${swEnd},B2:B${pbEnd},2,2)` } });
    const em = new Sheet({ cells: { ...emailCells, ...expectedCells, B12: CHI_STAT, B13: '=CHISQ.DIST.RT(B12,2)', B14: '=CHISQ.TEST(B2:C4,B8:C10)' } });
    const wk = new Sheet({ cells: { ...workshopCells, F2: F_ONE, F3: ETA2, F4: FOLLOW } });
    const vBelow = (x) => (typeof x === 'number' ? x : NaN);
    return [
      ['Welch p (T.TEST type 3)', sh.get('D2'), welch.p, 1e-9], ['pooled p (T.TEST type 2)', sh.get('D3'), pooled.p, 1e-9], ['Welch p = case', welch.p, C.welch.p, 1e-12],
      ['Welch p', welch.p, 0.0113, 0.00005], ['difference', welch.diff, 0.4305, 0.00005], ['interval low', welch.low, 0.10, 0.005], ['interval high', welch.high, 0.76, 0.005],
      ['late share (COUNTIF)', vBelow(sh.get('E2')), lateSW / SW.length, 1e-12], ['late share', lateSW / SW.length, 0.2031, 0.00005],
      ['late p', lateTest.pValue, 0.0326, 0.00005], ['late counts', lateSW * 100 + latePB, 1304], ['Fisher exact p (SciPy 0.0383)', fisherP, 0.0383, 0.00005], ['Yates p (SciPy 0.0608)', yatesP, 0.0608, 0.00005],
      ['expected late under H0', lateTest.pool * SW.length, 8.92, 0.005], ['extra a month', extraMonthly, 202.5], ['late a month, Swiftline', lateMonthSW, 91.41, 0.005], ['late a month, Parcelbird', lateMonthPB, 31.03, 0.005],
      ['power, half a day', powerHalf, 0.838, 0.0005], ['parcels for a quarter day', nQuarter, 218], ['pooled SD (ToolPak pooled variance 0.8728)', C.pooledSD, 0.934, 0.0005], ['pooled variance', C.pooledSD ** 2, pooled.se ** 2 / (1 / SW.length + 1 / PB.length), 1e-9],
      ['email χ² (SUMPRODUCT)', em.get('B12'), emailChi.stat, 1e-9], ['email χ²', emailChi.stat, 3.157, 0.0005], ['email p (CHISQ.DIST.RT)', em.get('B13'), emailChi.p, 1e-9], ['email p (CHISQ.TEST)', em.get('B14'), emailChi.p, 1e-9],
      ['email p', emailChi.p, 0.2063, 0.00005], ['B vs A p', bVsA.pValue, 0.0823, 0.00005], ['expected clicks per line', emailChi.expected[0][0], 48.67, 0.005], ['power for a 1-point gap', gapPower, 0.34, 0.01],
      ['workshop F', aov.F, 5.31, 0.005], ['workshop p', aov.p, 0.0080, 0.00005], ['F in one formula', wk.get('F2'), aov.F, 1e-9], ['η² (DEVSQ)', wk.get('F3'), aov.eta2, 1e-12], ['late-rate interval (points)', r(lateTest.low * 100, 1) * 1000 + r(lateTest.high * 100, 1), 1600 + 25.2, 1e-9], ['η²', aov.eta2, 0.1696, 0.00005], ['F = case', aov.F, W.anova.F, 1e-12],
      ['Welch ANOVA p (statsmodels 0.0167)', W.welch.p, 0.0167, 0.00005], ['Kruskal–Wallis p (SciPy 0.0135)', W.kw.p, 0.0135, 0.00005],
      ['in person v online p', pair(0, 1).p, 0.0190, 0.00005], ['in person v hybrid p', pair(0, 2).p, 0.4599, 0.00005], ['online v hybrid p', pair(1, 2).p, 0.0062, 0.00005], ['online v hybrid (T.TEST)', wk.get('F4'), pair(1, 2).p, 1e-9],
      ['Holm in person v online (statsmodels 0.0379)', holm[0], 0.0379, 0.00005], ['means in person, hybrid', r(means[0], 2) * 100 + r(means[2], 2), 822 + 8.53, 1e-9],
      ['SD ratio under 2', Math.max(...sds) / Math.min(...sds) < 2 ? 1 : 0, 1],
      ['survey interval low %', subCi.low * 100, 54.5, 0.05], ['survey interval high %', subCi.high * 100, 65.4, 0.05], ['non-response bounds', boundLow * 100, 36.0, 0.05], ['FPC interval', r(fpcLow * 100, 1) * 1000 + r(fpcHigh * 100, 1), 56500 + 63.4, 1e-9],
      ['offers classified', OFFERS.map(([, bar]) => offerClass(bar)).join(''), '120'],
      ['replies needed', nPlan, 601], ['invitations', invite, 2004], ['replies for ±2 points', nHalf, 2401], ['survey plan = case', nPlan, D.project.surveyPlan.n], ['with the FPC, N = 6,000', nFpc, 546],
    ];
  },
};
