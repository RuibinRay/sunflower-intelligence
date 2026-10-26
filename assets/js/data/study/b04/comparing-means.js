// comparing-means.js — B04 · Comparing two means. Content only; exercises are in comparing-means.ex.js. Uses the
// latte-art workshop (LATTE_PRE, LATTE_POST; DERIVED.latte) for the paired test and B03's spring orders (ORDERS) for
// web against app order values. Fairweather Bikes and Clearwater Contact Centre are fictional. Two-proportion tests,
// chi-square and ANOVA are module 4's. Every figure printed is recomputed in `checks`.
import { LATTE_PRE as PRE, LATTE_POST as POST, ORDERS, ORDER_COLUMNS, CHANNEL_SUBSCRIPTION, DERIVED as D } from './case.js?v=17';
import * as I from '../../../core/inference.js?v=17';
import { mean, sd, variance, median } from '../../../core/stats.js?v=17';

// ---------------------------------------------------------------- the workshop
const L = D.latte, P = L.paired, U = L.unpaired, DIFF = L.diffs, n = PRE.length;
const pooledL = I.tTest2(POST, PRE, { equalVar: true });
const tc11 = I.tInv(0.975, n - 1), tc11one = I.tInv(0.95, n - 1);
const spL = Math.sqrt(pooledL.pooledVar);
const sdViaR = Math.sqrt(variance(POST) + variance(PRE) - 2 * P.r * sd(POST) * sd(PRE));
const uTool = { df: Math.round(U.df) };
uTool.pTwo = 2 * I.tSf(Math.abs(U.t), uTool.df);
const sig = (v, k = 6) => String(Number(v.toPrecision(k)));

// ---------------------------------------------------------------- Fairweather Bikes (fictional)
const HARBOUR = [58, 71, 49, 66, 80, 55, 62, 74, 52, 63], PARK = [41, 52, 47, 38, 55, 60, 44, 49, 36, 51, 58, 45];
const BW = I.tTest2(HARBOUR, PARK), BP = I.tTest2(HARBOUR, PARK, { equalVar: true });
const bq1 = variance(HARBOUR) / HARBOUR.length, bq2 = variance(PARK) / PARK.length;
const bTcrit = I.tInv(0.975, BW.df), bTcritXl = I.tInv(0.975, Math.trunc(BW.df));

// ---------------------------------------------------------------- Clearwater Contact Centre (fictional)
const SA = [9.8, 6.1, 12.4, 8.0, 5.9, 11.7, 7.3, 10.2];
const SB = [7.1, 6.4, 8.9, 5.8, 7.6, 6.9, 7.3, 8.2, 5.2, 6.6, 7.8, 7.0, 6.1, 8.5, 6.8, 7.4, 5.9, 7.7, 6.3, 7.5];
const CW = I.tTest2(SA, SB), CP = I.tTest2(SA, SB, { equalVar: true });
const cq1 = variance(SA) / SA.length, cq2 = variance(SB) / SB.length;
const cTool = 2 * I.tSf(Math.abs(CW.t), Math.round(CW.df));

// ---------------------------------------------------------------- web against app (B03's orders)
const c = (name) => ORDER_COLUMNS.indexOf(name);
const WEB = ORDERS.filter((r) => r[c('channel')] === 'web').map((r) => r[c('order_total')]);
const APP = ORDERS.filter((r) => r[c('channel')] === 'app').map((r) => r[c('order_total')]);
const BULK = ORDERS.find((r) => r[c('order_total')] === Math.max(...ORDERS.map((x) => x[c('order_total')])));
const WEB_NB = WEB.filter((x) => x !== BULK[c('order_total')]);
const WA = I.tTest2(WEB, APP), WN = I.tTest2(WEB_NB, APP);
const LOG = I.tTest2(WEB.map(Math.log), APP.map(Math.log));
const geo = (a) => Math.exp(mean(a.map(Math.log)));
const CS = CHANNEL_SUBSCRIPTION.counts;

// ---------------------------------------------------------------- figure: why pairing helps
const f1 = (x) => Math.round(x * 10) / 10;
function pairFigure() {
  const Y = (v) => 230 - v * 9.5, XB = 90, XA = 250;
  let svg = '<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">';
  [0, 5, 10, 15, 20].forEach((v) => { svg += `<line x1="50" x2="290" y1="${f1(Y(v))}" y2="${f1(Y(v))}" stroke="var(--rule-strong)" stroke-width="0.5" stroke-dasharray="3 3"/><text x="44" y="${f1(Y(v)) + 4}" text-anchor="end" font-size="11" fill="var(--ink-3)">${v}</text>`; });
  PRE.forEach((b, i) => {
    const a = POST[i], up = a > b;
    svg += `<line x1="${XB}" y1="${f1(Y(b))}" x2="${XA}" y2="${f1(Y(a))}" stroke="${up ? 'var(--series-1)' : 'var(--series-2)'}" stroke-width="1.6" opacity="0.8"${a === b ? ' stroke-dasharray="4 3"' : ''}/>`;
    svg += `<circle cx="${XB}" cy="${f1(Y(b))}" r="3.5" fill="var(--ink)"/><circle cx="${XA}" cy="${f1(Y(a))}" r="3.5" fill="var(--ink)"/>`;
  });
  svg += `<text x="${XB}" y="258" text-anchor="middle">Before</text><text x="${XA}" y="258" text-anchor="middle">After</text>`;
  svg += '<text x="170" y="20" text-anchor="middle">Each line is one trainee’s two scores (out of 20)</text>';
  // right panel: the differences
  const X = (v) => 360 + (v + 2) * 33;
  svg += `<line x1="${X(-2)}" x2="${X(6)}" y1="200" y2="200" stroke="var(--ink)" stroke-width="1.2"/>`;
  [-2, -1, 0, 1, 2, 3, 4, 5, 6].forEach((v) => { svg += `<line x1="${X(v)}" x2="${X(v)}" y1="200" y2="205" stroke="var(--ink)"/><text x="${X(v)}" y="220" text-anchor="middle" font-size="11" fill="var(--ink-3)">${v < 0 ? '−' : ''}${Math.abs(v)}</text>`; });
  const seen = {};
  DIFF.forEach((d) => { seen[d] = (seen[d] || 0) + 1; svg += `<circle cx="${X(d)}" cy="${200 - 12 * seen[d]}" r="5" fill="var(--series-1)"/>`; });
  svg += `<line x1="${f1(X(P.meanDiff))}" x2="${f1(X(P.meanDiff))}" y1="90" y2="200" stroke="var(--ink)" stroke-width="1.4" stroke-dasharray="5 4"/>`;
  svg += `<text x="${f1(X(P.meanDiff)) + 6}" y="100" font-size="11">mean difference 1.583</text>`;
  svg += `<line x1="${X(0)}" x2="${X(0)}" y1="120" y2="200" stroke="var(--ink-3)" stroke-width="1"/><text x="${X(0) - 4}" y="132" text-anchor="end" font-size="11" fill="var(--ink-3)">no change</text>`;
  svg += `<text x="${X(2)}" y="244" text-anchor="middle" font-size="11" fill="var(--ink-3)">After minus before (points)</text>`;
  svg += `<text x="${X(2)}" y="20" text-anchor="middle">The 12 differences: s<tspan baseline-shift="sub" font-size="9">d</tspan> = 1.505 points</text>`;
  return `${svg}</svg>`;
}

export default {
  slug: 'comparing-means',
  title: 'Comparing two means',
  blurb: 'Compare two means the way the data were collected: with a paired t test when the same units are measured twice, and with Welch’s t test when the groups are separate. Run both by hand, with T.TEST and with the Analysis ToolPak, put an interval and an effect size on the difference, and check the conditions before trusting any of it.',
  status: 'reviewed',
  objectives: [
    'Choose between a paired and an independent-samples test from how the data were collected, and explain why pairing can reveal a difference that a two-sample test misses.',
    'Calculate Welch’s and the pooled two-sample t statistic, degrees of freedom and p-value by hand and with T.TEST types 1 to 3, and explain why Welch’s test is the safer default.',
    'Read the Analysis ToolPak’s three t-test outputs, including the one- and two-tail rows and the rounded degrees of freedom of the unequal-variances tool.',
    'Construct and interpret a confidence interval for a difference in means and for a mean difference, and report an effect size with Cohen’s d.',
    'Assess independence, normality or sample size, and outliers before a comparison, and recognise when a rank test such as Mann–Whitney or Wilcoxon’s is worth considering.',
  ],
  prerequisites: [
    { lesson: 'b04/hypothesis-testing', why: 'Hypotheses, test statistics, p-values, one- and two-sided tests and the one-sample t test, which a paired test reuses.' },
    { lesson: 'b04/confidence-intervals', why: 'The t interval, which becomes an interval for a difference.' },
    { lesson: 'b02/skewed-data', why: 'Why right-skewed values such as order totals are often analysed on a log scale.' },
    { lesson: 'b01/interpreting-results', why: 'Correlation, causation and confounding: what a comparison of groups can and can’t show.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'In October Ana ran a two-hour latte-art workshop for 12 trainee baristas. A senior barista scored each trainee’s pour out of 20 before the workshop and again after it. The trainees averaged 10.00 points before and 11.58 after. Before she adds the workshop to Lantern’s staff training plan, Ana wants to know whether the 1.58-point rise is more than the ups and downs of a dozen pours.' },

    { h: 'Two samples, or one sample of pairs?' },
    { p: 'The scores look like two samples, a column of 12 before and a column of 12 after, and the In depth section’s two-sample test compares two columns’ means. Run on these columns it finds nothing: Welch’s t test gives t = 0.99 and p = 0.33. The trainees differ so much from one another, with standard deviations of 3.54 points before and 4.23 after, that a 1.58-point rise in the average is lost in the noise.' },
    { p: 'But the columns are not two separate groups: they are the same 12 people measured twice. Trainee 3 scored 16 both times; trainee 5 scored 4 before and 3 after. What matters is each person’s change. Subtract each trainee’s before score from the after score and the 24 numbers become 12 differences: 2, 2, 0, 5, −1, 3, 1, 1, 1, 1, 2 and 2. Ten trainees improved, one stayed the same and one slipped by a point.' },
    { figure: {
      svg: pairFigure(),
      caption: 'Left: each trainee’s before and after scores joined by a line. The scores run from 3 to 17 points, but nearly every line rises. Right: the 12 differences, after minus before, run from −1 to 5 points around their mean, 1.583, with a standard deviation, s<sub>d</sub>, of only 1.505 points.',
      alt: 'Two panels. The left panel has a vertical scale from 0 to 20 and two columns of dots, Before and After, for 12 trainees, each pair joined by a line. Scores range from 4 to 16 before and from 3 to 17 after; ten lines slope upwards, one is flat at 16 and one slopes slightly down from 4 to 3. The right panel is a dot plot of the 12 differences on an axis from −2 to 6: one dot at −1, one at 0, four at 1, four at 2, one at 3 and one at 5. A dashed line marks the mean difference, 1.583, and a thin line marks no change at 0. The title gives the standard deviation of the differences, 1.505 points.',
    } },

    { h: 'The paired t test' },
    { p: String.raw`With the differences in hand, the question becomes a one-sample question from the previous lesson: is the mean difference <m>\mu_d</m> zero? Ana tests <m>H_0: \mu_d = 0</m> against <m>H_1: \mu_d \ne 0</m>, two-sided because a workshop that confused trainees would matter too. The differences have mean <m>\bar{d} = 1.583</m> and standard deviation <m>s_d = 1.505</m>, so:` },
    { math: String.raw`t = \dfrac{\bar{d}}{s_d / \sqrt{n}} = \dfrac{1.583}{1.505 / \sqrt{12}} = \dfrac{1.583}{0.4345} \approx 3.64` },
    { p: 'with n − 1 = 11 degrees of freedom. The test needs independent pairs and roughly normal differences: the trainees were scored one at a time, and the 12 differences have no extreme value (the largest, 5, is 2.3 standard deviations above their mean). The two-sided p-value, <x>=T.DIST.2T(3.644,11)</x>, is 0.0039: strong evidence that the scores rose. Same data, same question, and p = 0.004 instead of p = 0.33.' },
    { p: 'This is the <g>paired t test</g>. In Excel it is <x>=T.TEST(C2:C13,B2:B13,2,1)</x>, with the before scores in B and the after scores in C: the last argument, type 1, means paired.' },

    { h: 'Why pairing helps' },
    { p: 'Both tests divide the same 1.58-point rise by a <g>standard error</g>; they differ in which one. The two-sample test’s standard error, 1.59 points, contains all the differences between trainees, beginners and good pourers alike. The paired test’s, 0.43 points, contains only how much the trainees’ changes vary, because subtracting a trainee’s before score from the after score cancels whatever makes that trainee good or bad.' },
    { p: String.raw`The cancelling works because before and after scores are strongly correlated: trainees who scored high before scored high after, with r = 0.94. The variance of the differences is <m>s_1^2 + s_2^2 - 2 r s_1 s_2 = 17.90 + 12.55 - 2 \times 0.9403 \times 4.231 \times 3.542 \approx 2.27</m>, so <m>s_d</m> = 1.505, against standard deviations of 4.23 and 3.54 for the scores themselves. The stronger the correlation, the more pairing gains.` },
    { callout: 'key', title: 'The design chooses the test', html: 'Use a paired test when each value in one sample belongs with one value in the other: the same customer, store, machine or trainee measured twice, or units matched in pairs before the study. Use an independent-samples test when the two groups are separate. Decide from how the data were collected, never from which test gives the smaller p-value.' },
    { p: 'What the test shows is that the scores rose by more than chance would produce. It doesn’t show that the workshop caused the rise: trainees pouring later in the day might have improved with practice anyway, and a trainee who poured unusually badly before is likely to score nearer their usual level afterwards, which is <g>regression to the mean</g>. Answering “did the workshop cause it?” needs a <g>control group</g> of trainees scored twice without the workshop, ideally assigned at random, as in an <g>A/B test</g>.' },
  ],

  theory: [
    { h: 'Independent samples and Welch’s t test' },
    { p: String.raw`When the two samples are separate groups, such as hires from two bike stations or calls handled with two scripts, they are <g>independent samples</g>, and the question is whether the population means <m>\mu_1</m> and <m>\mu_2</m> differ. The null hypothesis is <m>H_0: \mu_1 - \mu_2 = 0</m> (or a stated difference <m>\Delta_0</m>, “delta-nought”), against a one- or two-sided alternative. The estimate is the difference in sample means, and its standard error combines the two samples’ standard errors:` },
    { math: String.raw`\text{SE} = \sqrt{\dfrac{s_1^2}{n_1} + \dfrac{s_2^2}{n_2}}` },
    { p: 'A <g>two-sample t test</g> divides the difference by this standard error. <g>Welch’s t test</g> compares the result with a t distribution whose degrees of freedom come from the Welch–Satterthwaite formula in the Formulas section. Its result always lies between the smaller of n₁ − 1 and n₂ − 1 at the low end and n₁ + n₂ − 2 at the high end. It is usually not a whole number, and it falls towards the low end when one sample is much noisier or much smaller than the other. The simple example runs the test on two bike-hire stations.' },

    { h: 'The pooled test, and why Welch is the safer default' },
    { p: String.raw`The older <g>pooled t test</g>, Student’s two-sample t test, assumes the two populations have the same variance. It averages the two sample variances, weighted by their degrees of freedom, into a pooled variance <m>s_p^2</m>, uses <m>s_p\sqrt{1/n_1 + 1/n_2}</m> as the standard error, and has <m>n_1 + n_2 - 2</m> degrees of freedom. When the variances really are equal it is slightly more powerful. With equal sample sizes the two tests give the same t, and only their degrees of freedom differ.` },
    { p: 'When the variances differ and the sample sizes differ too, the pooled test can mislead. If the smaller sample has the larger variance, pooling understates the standard error and the test raises too many false alarms; if the larger sample has the larger variance, it misses real differences. The challenging example shows a pooled p-value of 0.0066 beside Welch’s 0.071 for the same calls. Delacre, Lakens and Leys (2017) show that Welch’s test controls false alarms better when variances differ and loses little when they are equal, and recommend it by default; this course follows them.' },
    { p: 'It is tempting to choose by testing the variances first. Excel’s F.TEST(array1, array2) returns the two-tailed p-value of the <g>F test for equal variances</g>, which is based on the ratio of the two sample variances. Using it as a gate is a poor idea: the F test is very sensitive to departures from normality (OpenStax), and Delacre and colleagues argue that choosing between the pooled and Welch tests by a preliminary test of equal variances often gives the wrong answer. Use F.TEST, if at all, to describe how different the spreads look.' },

    { h: 'T.TEST in Excel' },
    { p: 'T.TEST(array1, array2, tails, type) returns the p-value of a two-sample or paired t test, and only the p-value. Tails is 1 or 2, and type chooses the test:' },
    { table: {
      caption: 'T.TEST’s three types (Microsoft’s names) and the matching ToolPak tools',
      head: ['Type', 'Test performed', 'Test in this lesson', 'ToolPak tool'],
      rows: [
        ['1', 'Paired', 'Paired t test', 't-Test: Paired Two Sample for Means'],
        ['2', 'Two-sample equal variance (homoscedastic)', 'Pooled t test', 't-Test: Two-Sample Assuming Equal Variances'],
        ['3', 'Two-sample unequal variance (heteroscedastic)', 'Welch’s t test', 't-Test: Two-Sample Assuming Unequal Variances'],
      ],
    } },
    { p: 'Microsoft’s page says T.TEST works from a non-negative t statistic: with tails = 2 it returns the probability of a larger |t| if the two means are equal, and with tails = 1 half of that, the tail in whichever direction the data point. So a one-tailed T.TEST never exceeds 0.5 and never tells you the direction. If your one-sided alternative says μ₁ > μ₂ and the sample means say the opposite, the p-value for your alternative is 1 minus T.TEST’s: check the means before you read a one-tailed result.' },
    { p: 'A paired T.TEST (type 1) returns #N/A if the two ranges hold different numbers of values, and it pairs the values by position, so both columns must be in the same order. For the t statistic and the degrees of freedom, calculate them from the formulas or run the ToolPak.' },

    { h: 'The Analysis ToolPak’s t-tests' },
    { p: 'Data &gt; Data Analysis offers the three tests by the names in the table above; B03 explains loading the <g>Analysis ToolPak</g>. Each asks for a Variable 1 Range and a Variable 2 Range, a Hypothesized Mean Difference (usually 0), whether the ranges include Labels, Alpha and an output location. The output is values, not formulas, so rerun the tool when the data change. Here is the paired tool’s output for the workshop, with the after scores as Variable 1:' },
    { table: {
      caption: 't-Test: Paired Two Sample for Means (latte-art scores, after as Variable 1, Alpha 0.05)',
      head: ['', 'After', 'Before'],
      align: ['l', 'r', 'r'],
      rows: [
        ['Mean', sig(mean(POST)), sig(mean(PRE))],
        ['Variance', sig(variance(POST)), sig(variance(PRE))],
        ['Observations', String(n), String(n)],
        ['Pearson Correlation', sig(P.r), ''],
        ['Hypothesized Mean Difference', '0', ''],
        ['df', String(P.df), ''],
        ['t Stat', sig(P.t), ''],
        ['P(T&lt;=t) one-tail', sig(P.p / 2), ''],
        ['t Critical one-tail', sig(tc11one), ''],
        ['P(T&lt;=t) two-tail', sig(P.p), ''],
        ['t Critical two-tail', sig(tc11), ''],
      ],
    } },
    { p: String.raw`Read it from the top. Pearson Correlation is the r that makes pairing pay. t Stat is <m>\bar{d} \div (s_d \div \sqrt{n})</m> for Variable 1 minus Variable 2, so its sign depends on which range you enter first. “P(T&lt;=t) one-tail” is, whatever its label suggests, the one-tailed p-value in the direction of t, half the two-tail value. The two critical values, 1.796 and 2.201, are positive values at the Alpha you set: reject at 5% two-sided when |t Stat| exceeds t Critical two-tail, or equivalently when P(T&lt;=t) two-tail is below 0.05.` },
    { p: 'The equal-variances tool adds a Pooled Variance row. The unequal-variances tool calculates Welch’s degrees of freedom, and Microsoft’s page explains: “Because the result of the calculation is usually not an integer, the value of df is rounded to the nearest integer to obtain a critical value from the t table.” The tool works its p-values from that rounded df too, while T.TEST with type 3 uses the unrounded df, so the two can disagree slightly: for the calls in the challenging example, 7.83 degrees of freedom become 8 and the two-tailed p-value moves from 0.0713 to 0.0706. Neither is wrong; say which you used.' },

    { h: 'Confidence intervals for a difference' },
    { p: String.raw`Every test here has an interval to go with it. For independent samples it is <m>(\bar{x}_1 - \bar{x}_2) \pm t^{*} \times \text{SE}</m>, with <m>t^{*}</m> from the t distribution with Welch’s degrees of freedom; for paired samples it is <m>\bar{d} \pm t^{*} \times s_d \div \sqrt{n}</m> with n − 1. In Excel the paired interval’s half-width is <x>=CONFIDENCE.T(0.05,STDEV.S(D2:D13),COUNT(D2:D13))</x> on the column of differences, because a paired interval is a one-sample interval for the differences.` },
    { p: 'For two independent samples there is no single function: multiply <x>=T.INV.2T(0.05,df)</x> by the standard error. T.INV.2T truncates a fractional df to a whole number (16.69 becomes 16), which widens the interval very slightly; the simple example shows the size of the effect.' },
    { p: 'For the workshop the paired interval is 1.583 ± 2.201 × 0.4345, from 0.63 to 2.54 points: on average the trainees gained between about half a point and two and a half points. Treated wrongly as independent groups, the interval is −1.73 to 4.89 points and includes 0, matching the non-significant p of 0.33. A 95% interval for a difference excludes 0 exactly when the two-sided test at 5% rejects H₀.' },

    { h: 'Conditions' },
    { list: [
      '<b>Independence.</b> Values within each sample must be independent. For independent samples the two groups must be separate; for paired samples the pairs must be independent of one another, so that one trainee’s change doesn’t affect another’s. Random sampling lets you generalise to a population, and random assignment to the groups lets you talk about cause.',
      '<b>Normality, or large samples.</b> The t tests assume each population is roughly normal (for a paired test, the population of differences). With larger samples the <g>central limit theorem</g> makes each mean’s sampling distribution close to normal even for skewed data, and how large is large enough depends on how skewed, as the sampling-distributions lesson showed with Lantern’s order values.',
      '<b>No dominating outliers.</b> A t test compares means, and one extreme value can move a mean a long way. Look at the data first, in a box plot or a histogram, and if one value drives the result, report the test with and without it.',
    ] },
    { p: 'The applied example puts these conditions to work on Lantern’s spring orders, where web and app order values are compared and one web order of $1,512 dominates.' },

    { h: 'How big is the difference?' },
    { p: String.raw`A p-value says whether a difference is likely to be chance, not how big it is, so report an <g>effect size</g> with it. The plainest is the difference in means with its interval, in the units of the problem: 1.58 points out of 20, 95% interval 0.63 to 2.54. To compare effects measured on different scales, analysts also use <g>Cohen’s d</g>, the difference in means divided by the pooled standard deviation, <m>d = (\bar{x}_1 - \bar{x}_2) \div s_p</m>.` },
    { p: String.raw`Cohen suggested 0.2, 0.5 and 0.8 as small, medium and large, and OpenStax stresses that these labels are only indicative; what counts as large depends on the field and the decision. For the workshop, <m>s_p = \sqrt{(17.90 + 12.55) \div 2} = 3.90</m> and <m>d = 1.583 \div 3.90 \approx 0.41</m>: the average gain is about two-fifths of the spread between trainees. Some analysts divide a paired mean difference by <m>s_d</m> instead, which gives 1.05 here; the two measure different things, so say which you used.` },

    { h: 'Rank tests in outline' },
    { p: 'When samples are small and skewed, or an outlier dominates, a rank test is an alternative. The <g>Mann–Whitney U test</g>, also called the Wilcoxon rank-sum test, replaces the values of two independent samples by their ranks in the combined data and asks whether values in one group tend to be larger than in the other. The <g>Wilcoxon signed-rank test</g> does the same for paired differences, using the ranks of their sizes. Neither assumes normality, and an extreme value counts only as the largest rank.' },
    { p: 'They answer a slightly different question from a t test, whether one group tends to have larger values rather than whether the means differ. Excel has no function for either, and the ToolPak has no rank test (its Rank and Percentile tool only ranks values); statistical software runs them. For right-skewed values such as order totals, a log transformation (B02’s skewed-data lesson) is another option: a t test on the logs compares geometric means.' },
  ],

  formulas: [
    { id: 'cm-welch', name: 'Welch’s two-sample t statistic',
      tex: String.raw`t = \dfrac{(\bar{x}_1 - \bar{x}_2) - \Delta_0}{\sqrt{s_1^2/n_1 + s_2^2/n_2}}`,
      where: [[String.raw`\bar{x}_1, \bar{x}_2`, 'The two sample means', 'units of x'], [String.raw`s_1, s_2`, 'The two sample standard deviations', 'units of x'], [String.raw`n_1, n_2`, 'The two sample sizes', ''], [String.raw`\Delta_0`, 'The difference under the null hypothesis, usually 0', 'units of x'], [String.raw`t`, 'Test statistic', '']],
      assumptions: 'Two independent random samples from populations that are roughly normal, or samples large enough for the central limit theorem; the variances need not be equal.',
      note: 'Excel: T.TEST(array1, array2, tails, 3) returns its p-value.' },
    { id: 'cm-welch-df', name: 'Welch–Satterthwaite degrees of freedom',
      tex: String.raw`\text{df} = \dfrac{\left(s_1^2/n_1 + s_2^2/n_2\right)^2}{\dfrac{(s_1^2/n_1)^2}{n_1 - 1} + \dfrac{(s_2^2/n_2)^2}{n_2 - 1}}`,
      where: [[String.raw`s_1^2, s_2^2`, 'The two sample variances (VAR.S)', 'units of x squared'], [String.raw`n_1, n_2`, 'The two sample sizes', ''], [String.raw`\text{df}`, 'Degrees of freedom, usually not a whole number', '']],
      note: 'The ToolPak’s unequal-variances tool rounds this to the nearest whole number; T.TEST type 3 doesn’t.' },
    { id: 'cm-pooled', name: 'Pooled variance and the pooled t statistic',
      tex: String.raw`s_p^2 = \dfrac{(n_1 - 1)s_1^2 + (n_2 - 1)s_2^2}{n_1 + n_2 - 2}, \qquad t = \dfrac{(\bar{x}_1 - \bar{x}_2) - \Delta_0}{s_p\sqrt{1/n_1 + 1/n_2}}`,
      where: [[String.raw`s_p^2`, 'Pooled variance (the ToolPak’s Pooled Variance row)', 'units of x squared'], [String.raw`s_1^2, s_2^2`, 'The two sample variances', 'units of x squared'], [String.raw`n_1, n_2`, 'The two sample sizes', ''], [String.raw`\bar{x}_1, \bar{x}_2`, 'The two sample means', 'units of x'], [String.raw`\Delta_0`, 'The difference under the null hypothesis', 'units of x'], [String.raw`t`, 'Test statistic, with n₁ + n₂ − 2 degrees of freedom', '']],
      assumptions: 'As for Welch’s test, plus equal population variances.',
      note: 'Excel: T.TEST type 2.' },
    { id: 'cm-ci-diff', name: 'Confidence interval for a difference in means',
      tex: String.raw`(\bar{x}_1 - \bar{x}_2) \pm t^{*} \sqrt{s_1^2/n_1 + s_2^2/n_2}`,
      where: [[String.raw`\bar{x}_1 - \bar{x}_2`, 'Difference in sample means', 'units of x'], [String.raw`t^{*}`, 'The t value with α/2 in each tail and Welch’s degrees of freedom (2.11 for 95% and 16.7 df)', ''], [String.raw`s_1, s_2`, 'Sample standard deviations', 'units of x'], [String.raw`n_1, n_2`, 'Sample sizes', '']],
      note: 'It excludes 0 exactly when Welch’s two-sided test at the matching level rejects H₀.' },
    { id: 'cm-paired', name: 'Paired t test and interval',
      tex: String.raw`t = \dfrac{\bar{d} - \Delta_0}{s_d/\sqrt{n}}, \qquad \bar{d} \pm t^{*}\,\dfrac{s_d}{\sqrt{n}}`,
      where: [[String.raw`\bar{d}`, 'Mean of the differences (after minus before)', 'units of x'], [String.raw`s_d`, 'Standard deviation of the differences', 'units of x'], [String.raw`n`, 'Number of pairs', ''], [String.raw`\Delta_0`, 'Mean difference under the null hypothesis, usually 0', 'units of x'], [String.raw`t, t^{*}`, 'Test statistic, and the t value for the interval, with n − 1 degrees of freedom', '']],
      assumptions: 'Independent pairs; the differences roughly normal, or many pairs.',
      note: 'Excel: T.TEST(array1, array2, tails, 1); CONFIDENCE.T(α, STDEV.S(differences), COUNT(differences)) is the interval’s half-width.' },
    { id: 'cm-sd-diff', name: 'Why pairing helps: the variance of a difference',
      tex: String.raw`s_d^2 = s_1^2 + s_2^2 - 2\,r\,s_1 s_2`,
      where: [[String.raw`s_d^2`, 'Variance of the paired differences', 'units of x squared'], [String.raw`s_1, s_2`, 'Standard deviations of the two sets of measurements', 'units of x'], [String.raw`r`, 'Correlation between the paired measurements (the ToolPak’s Pearson Correlation)', '']],
      note: 'A strong positive correlation makes the differences far less variable than either set of measurements.' },
    { id: 'cm-cohen-d', name: 'Cohen’s d',
      tex: String.raw`d = \dfrac{\bar{x}_1 - \bar{x}_2}{s_p}`,
      where: [[String.raw`\bar{x}_1 - \bar{x}_2`, 'Difference in means', 'units of x'], [String.raw`s_p`, 'Pooled standard deviation, the square root of the pooled variance', 'units of x'], [String.raw`d`, 'Effect size in standard deviations', '']],
      note: '0.2, 0.5 and 0.8 are Cohen’s rough labels for small, medium and large effects.' },
    { id: 'cm-f', name: 'F statistic for two variances (F.TEST)',
      tex: String.raw`F = \dfrac{s_1^2}{s_2^2}`,
      where: [[String.raw`s_1^2, s_2^2`, 'The two sample variances', 'units of x squared'], [String.raw`F`, 'Ratio, compared with the F distribution with n₁ − 1 and n₂ − 1 degrees of freedom', '']],
      assumptions: 'Both populations normal: the test is very sensitive to departures from normality.',
      note: 'F.TEST returns the two-tailed p-value. Don’t use it to choose between the pooled and Welch tests.' },
  ],

  examples: [
    { level: 'simple', title: 'Welch’s test: hire lengths at two bike stations', fictional: true,
      setup: 'Fairweather Bikes hires bikes from two stations. To plan servicing, it took a random sample of September hires from each and recorded their length in minutes. Harbour station (B2:B11): 58, 71, 49, 66, 80, 55, 62, 74, 52 and 63; Park station (C2:C13): 41, 52, 47, 38, 55, 60, 44, 49, 36, 51, 58 and 45. Do the stations’ mean hire lengths differ? Use Welch’s test at α = 0.05.',
      steps: [
        String.raw`Design and hypotheses: different hires at different stations, so independent samples. <m>H_0: \mu_H - \mu_P = 0</m> against <m>H_1: \mu_H - \mu_P \ne 0</m>, two-sided because servicing plans would change either way.`,
        'Summaries: Harbour n₁ = 10, x̄₁ = 63.0, s₁ = 9.94 (variance 98.89); Park n₂ = 12, x̄₂ = 48.0, s₂ = 7.62 (variance 58.00). Neither sample has an outlier or strong skew.',
        String.raw`Standard error: <m>\sqrt{98.89 \div 10 + 58.00 \div 12} = \sqrt{9.889 + 4.833} = \sqrt{14.722} = 3.837</m>, so <m>t = (63.0 - 48.0) \div 3.837 \approx 3.91</m>.`,
        String.raw`Degrees of freedom: <m>14.722^2 \div (9.889^2 \div 9 + 4.833^2 \div 11) = 216.74 \div (10.866 + 2.124) \approx 16.69</m>.`,
        'P-value: <x>=T.TEST(B2:B11,C2:C13,2,3)</x> = 0.0012. Interval: the t value for 16.69 df is 2.113, so 15.0 ± 2.113 × 3.837 runs from 6.9 to 23.1 minutes. <x>=T.INV.2T(0.05,16.69)</x> truncates to 16 df and returns 2.120, which would move each end by 0.03 minutes.',
      ],
      answer: 'Reject H₀: Harbour hires are 15.0 minutes longer on average (t ≈ 3.91, df ≈ 16.7, p ≈ 0.0012; 95% interval 6.9 to 23.1 minutes).',
      interpretation: 'Harbour bikes are out about a quarter of an hour longer per hire, so on hire time alone they need servicing sooner. With small samples the interval is wide: the gap could be anything from about 7 to 23 minutes. Cohen’s d is 15.0 ÷ 8.74 ≈ 1.7, large by any label. The pooled test agrees here (p = 0.0007), because the variances and the sample sizes are not very different.' },
    { level: 'challenging', title: 'When pooling misleads: two call scripts', fictional: true,
      setup: 'Clearwater Contact Centre is trialling a new call script. Calls were assigned to scripts at random: 8 calls with Script A, the new one, and 20 with Script B, the current one. Handling times in minutes, A: 9.8, 6.1, 12.4, 8.0, 5.9, 11.7, 7.3, 10.2; B: 7.1, 6.4, 8.9, 5.8, 7.6, 6.9, 7.3, 8.2, 5.2, 6.6, 7.8, 7.0, 6.1, 8.5, 6.8, 7.4, 5.9, 7.7, 6.3, 7.5. A supervisor runs the pooled test and reports that Script A makes calls significantly longer. Is that right?',
      steps: [
        'Summaries: A has n₁ = 8, x̄₁ = 8.925, s₁ = 2.473 (variance 6.114); B has n₂ = 20, x̄₂ = 7.050, s₂ = 0.946 (variance 0.895). The difference is 1.875 minutes, and the smaller sample has the far larger spread: s₁ is 2.6 times s₂. Neither sample has an outlier, though 8 values are too few to judge A’s shape.',
        String.raw`Pooled test: <m>s_p^2 = (7 \times 6.114 + 19 \times 0.895) \div 26 = 2.300</m>; SE <m>= \sqrt{2.300 \times (1/8 + 1/20)} = 0.634</m>; <m>t = 1.875 \div 0.634 \approx 2.96</m> with 26 df; <x>=T.TEST(B2:B9,C2:C21,2,2)</x> = 0.0066.`,
        String.raw`Welch’s test: SE <m>= \sqrt{6.114 \div 8 + 0.895 \div 20} = \sqrt{0.7642 + 0.0448} = 0.8994</m>; <m>t = 1.875 \div 0.8994 \approx 2.08</m>; df <m>= 0.8090^2 \div (0.7642^2 \div 7 + 0.0448^2 \div 19) \approx 7.83</m>; <x>=T.TEST(B2:B9,C2:C21,2,3)</x> = 0.071.`,
        String.raw`Why they differ: pooling gives the 20 steady B calls most of the weight, so <m>s_p</m> = 1.52 understates the noise in the 8 A calls. The pooled standard error is about 30% too small (0.634 against 0.899), and its degrees of freedom too generous (26 against 7.8).`,
        'The ToolPak’s unequal-variances tool reports df = 8 (7.83 rounded) and P(T&lt;=t) two-tail = 0.0706, slightly different from T.TEST’s 0.0713. <x>=F.TEST(B2:B9,C2:C21)</x> = 0.0008 confirms the spreads differ, but Welch’s test was the right choice before looking at it.',
      ],
      answer: 'No. Welch’s test gives t ≈ 2.08 with about 7.8 degrees of freedom and p ≈ 0.071: no significant difference at 5%. The pooled p-value of 0.0066 comes from pooling a small noisy sample with a large steady one.',
      interpretation: 'Script A may lengthen calls (the 95% interval for the difference runs from −0.21 to 3.96 minutes), but 8 calls that vary this much are too few to say. Clearwater should collect more Script A calls, and find out why their times vary so much: a script that some agents follow and others don’t can produce exactly this spread.' },
    { level: 'applied', title: 'Do app customers spend more per order?', fictional: true,
      setup: 'Ana wonders whether app customers spend more per order than website customers. B03’s 231 spring orders include 132 web orders and 99 app orders. Compare the channels’ mean order values with Welch’s test, check the conditions, and say what she can report.',
      table: {
        caption: 'Order values by channel, spring 2026',
        head: ['Orders', 'n', 'Mean', 'Median', 'SD', 'Largest'],
        align: ['l', 'r', 'r', 'r', 'r', 'r'],
        rows: [
          ['Web', String(WEB.length), '$41.21', '$19.50', '$131.12', '$1,512.00'],
          ['App', String(APP.length), '$36.93', '$30.60', '$30.04', '$191.00'],
          ['Web without LC-10144', String(WEB_NB.length), '$29.98', '$19.50', '$23.60', '$133.00'],
        ],
      },
      steps: [
        String.raw`Design: different orders through different channels, so independent samples; <m>H_1: \mu_{\text{web}} \ne \mu_{\text{app}}</m>, two-sided.`,
        'Welch’s test on every order: the difference is $41.21 − $36.93 = $4.28, SE = $11.80, t ≈ 0.36 with about 149 df, p ≈ 0.72; 95% interval −$19.05 to $27.61.',
        'Conditions: both samples are large, but the web column holds LC-10144, the $1,512 office order, about 78 times the web median. That one order lifts the web mean by $11.23 and the web standard deviation from $23.60 to $131.12. A t test compares means, and this mean is largely one order.',
        'Without the office order: the web mean is $29.98 and the difference −$6.95 (app higher); Welch’s t ≈ −1.90 with about 181 df, p ≈ 0.059; 95% interval −$14.16 to $0.27. The medians, $19.50 for web and $30.60 for app, point the same way.',
        'On a log scale (B02), the geometric means are $25.23 for web and $29.02 for app, and Welch’s test on the logs gives p ≈ 0.12.',
      ],
      answer: 'With every order there is no evidence of a difference (p ≈ 0.72), and one order decides which channel’s mean is higher. Without it, app orders average $6.95 more (95% interval −$14.16 to $0.27, p ≈ 0.059): suggestive, not significant at 5%.',
      interpretation: 'Ana can report that typical app orders look larger (median $30.60 against $19.50) but that the spring data don’t establish a difference in mean order value, and that one office order decides the direction of the means. Even a clear difference wouldn’t show that the app makes people spend more: app orders are more often subscriptions (57 of 99, against 47 of 132 on the web), so the kind of order, a <g>confounding variable</g>, may drive any gap, and 231 orders from one spring are not a random sample of customers. The proportions-and-chi-square lesson tests the link between channel and subscription.' },
  ],

  demo: [
    { widget: 'cm-latte', intro: 'The ToolPak’s output for the workshop scores, with the after scores as Variable 1. Switch between the paired tool and the two independent-samples tools: the means, the variances and the 1.58-point difference are the same, but the paired P(T&lt;=t) two-tail is 0.0039 and the others about 0.33. Set Hypothesized Mean Difference to 1 to ask whether the average gain beats one point.' },
    { widget: 'cm-calls', intro: 'Clearwater’s calls in the unequal- and equal-variances tools. Compare the df rows (8 against 26) and the P(T&lt;=t) two-tail rows (0.0706 against 0.0066), and find the Pooled Variance row that only the equal-variances tool prints.' },
    { widget: 'cm-sheet', intro: 'The workshop scores with each trainee’s difference in column D and T.TEST in all three types. Swap the after scores of trainees 1 and 3 by typing 16 in C2 and 10 in C4: the columns hold the same numbers, so the two independent-samples p-values don’t move, but the paired p-value rises from 0.004 to about 0.13 because the pairs no longer match. Reset, then turn on Show formulas.' },
  ],

  mistakes: [
    { title: '“Before and after are two columns, so I used a two-sample test.”', html: 'When each value in one column belongs with one in the other, the data are pairs. A two-sample test on the workshop scores gives p = 0.33, because the trainees differ from one another by far more than the workshop changed them; the paired test removes those differences and gives p = 0.004. Use T.TEST type 1 or the paired ToolPak tool.' },
    { title: '“F.TEST found no significant difference in variances, so I pooled.”', html: 'Not finding a difference in variances doesn’t show they are equal, least of all in small samples, and the F test is very sensitive to non-normal data. Welch’s test costs little when the variances are equal and protects you when they aren’t: make it the default.' },
    { title: '“<x>=T.TEST(B2:B9,C2:C21,1,3)</x> is 0.036, so Script A shortens calls.”', html: 'A one-tailed T.TEST returns the tail in whichever direction the data point. Script A’s calls are longer on average, so 0.036 is the p-value for “A is longer”; for “A is shorter” it is 1 − 0.036 = 0.964. Compare the means before reading a one-tailed T.TEST.' },
    { title: '“The ToolPak and T.TEST disagree, so one of them is wrong.”', html: 'The unequal-variances tool rounds Welch’s degrees of freedom to a whole number (7.83 becomes 8) and works its p-value from that; T.TEST type 3 keeps 7.83. Small differences are expected. Check too that both use the same ranges, in the same order, and the same number of tails.' },
    { title: '“The paired test proves the workshop works.”', html: 'It shows the scores rose by more than chance would produce. Without a comparison group, practice and regression to the mean could explain some of the rise. A causal claim needs a control group, ideally with trainees assigned to it at random.' },
    { title: '“Order values aren’t normal, so a t test is useless.”', html: 'With 99 and 132 orders, the means’ sampling distributions are close to normal unless one value dominates. Here one does, so report the test with and without it and look at the medians, the logs or a rank test. Skew in large samples is a reason to check, not automatically a reason to abandon the t test.' },
  ],

  application: [
    { case: 'Ana’s note for the staff training plan: “Twelve trainees were scored out of 20 before and after the two-hour latte-art workshop. Their scores rose by 1.58 points on average (95% interval 0.63 to 2.54; paired t test, p = 0.004), and 10 of the 12 improved. We didn’t score a comparison group, so some of the rise may be practice rather than the workshop. Next time I will also score six trainees twice without the workshop.”' },
    { p: 'Her note follows the habits of a good comparison. She chose the test from the design, reported the size of the change with its interval as well as the p-value, gave the count of trainees who improved, and named what the design can’t show. Analysts comparing two groups work in the same order: decide paired or independent from how the data were collected; look at the data; use Welch’s test for independent samples unless there is a reason to pool; check outliers and report with and without them; and give the difference, its interval and an effect size.' },
    { p: 'A comparison is only as fair as its groups. A two-sample test on observational data, such as customers who chose the app against those who chose the website, compares people who differ in many ways besides the label, and any gap may come from a <g>confounding variable</g>. Pairing and random assignment are the two main ways to make a comparison fair; when neither is possible, the report should say so plainly.' },
  ],

  summary: [
    'The design chooses the test: paired when each value in one sample belongs with one in the other (the same unit measured twice, or matched pairs), independent when the groups are separate.',
    'A paired t test is a one-sample t test on the differences, t = d̄ ÷ (s_d ÷ √n) with n − 1 df. Pairing removes the variation between units, so it can find effects an independent test misses (p = 0.004 against 0.33 for the workshop).',
    'For independent samples, Welch’s t = (x̄₁ − x̄₂) ÷ √(s₁²/n₁ + s₂²/n₂), with Welch–Satterthwaite df, is the safer default; the pooled test assumes equal variances and misleads when variances and sample sizes both differ. Don’t choose between them with F.TEST.',
    '<x>=T.TEST(array1,array2,tails,type)</x> returns only the p-value: type 1 paired, 2 pooled, 3 Welch. A one-tailed T.TEST is the tail in the direction of the data.',
    'The ToolPak’s t-test tools print the means, variances, t Stat, one- and two-tail p-values and critical values; the unequal-variances tool rounds df to a whole number, so its p-value can differ slightly from T.TEST type 3.',
    'Report the difference with its interval, (x̄₁ − x̄₂) ± t* × SE or d̄ ± t* × s_d ÷ √n, and an effect size such as Cohen’s d. An interval that excludes 0 matches a significant two-sided test.',
    'Check independence, rough normality or large samples, and outliers. One dominating value can decide a comparison of means: report with and without it, and consider medians, logs or a rank test (Mann–Whitney, Wilcoxon signed-rank).',
  ],

  glossary: [
    { term: 'Independent samples', def: 'Two samples whose values are unrelated, such as separate groups of customers or calls, so that nothing links a value in one sample to a particular value in the other.' },
    { term: 'Paired samples', def: 'Two sets of measurements in which each value in one belongs with one value in the other, such as the same people measured before and after, or units matched in pairs.' },
    { term: 'Two-sample t test', def: 'A test of whether two population means differ, from independent samples, using the difference in sample means divided by its standard error.' },
    { term: 'Welch’s t test', def: 'The two-sample t test that doesn’t assume equal population variances: its standard error is √(s₁²/n₁ + s₂²/n₂) and its degrees of freedom come from the Welch–Satterthwaite formula. Excel’s T.TEST type 3.' },
    { term: 'Pooled t test', def: 'The two-sample t test that assumes equal population variances and combines the two sample variances into one pooled variance, with n₁ + n₂ − 2 degrees of freedom. Also called Student’s two-sample t test; Excel’s T.TEST type 2.' },
    { term: 'Paired t test', def: 'A test of whether the mean of paired differences is zero (or a stated value): a one-sample t test on the differences, with n − 1 degrees of freedom. Excel’s T.TEST type 1.' },
    { term: 'F test for equal variances', def: 'A test of whether two population variances are equal, based on the ratio of the two sample variances; Excel’s F.TEST returns its two-tailed p-value. It is very sensitive to non-normal data.' },
    { term: 'Effect size', def: 'A measure of how large an effect is, as opposed to whether it is statistically significant: a difference in means in the problem’s units, or a standardised measure such as Cohen’s d.' },
    { term: 'Cohen’s d', def: 'The difference between two means divided by the pooled standard deviation, so that it is measured in standard deviations; 0.2, 0.5 and 0.8 are often called small, medium and large.' },
    { term: 'Mann–Whitney U test', def: 'A rank-based test for two independent samples, also called the Wilcoxon rank-sum test, that asks whether values in one group tend to be larger than in the other without assuming normality.' },
    { term: 'Wilcoxon signed-rank test', def: 'A rank-based test for paired data that asks whether the differences tend to be positive or negative, using the ranks of their sizes, without assuming normality.' },
  ],

  references: [
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Business Statistics 2e</i>, chapter 10, “Hypothesis Testing with Two Samples” (sections 10.1, “Comparing Two Independent Population Means”, and 10.2, “Cohen’s Standards for Small, Medium, and Large Effect Sizes”). OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/10-2-cohens-standards-for-small-medium-and-large-effect-sizes', checked: '2026-10-24' },
    { text: 'Microsoft Support. “T.TEST function”.', url: 'https://support.microsoft.com/en-US/excel/functions/t-test-function', checked: '2026-10-24' },
    { text: 'Microsoft Support. “Use the Analysis ToolPak to perform complex data analysis” (the t-Test and F-Test Two-Sample for Variances tools).', url: 'https://support.microsoft.com/en-us/excel/use-the-analysis-toolpak-to-perform-complex-data-analysis', checked: '2026-10-24' },
    { text: 'Microsoft Support. “F.TEST function”.', url: 'https://support.microsoft.com/en-US/excel/functions/f-test-function', checked: '2026-10-24' },
    { text: 'Microsoft Support. “T.INV.2T function”.', url: 'https://support.microsoft.com/en-US/excel/functions/t-inv-2t-function', checked: '2026-10-24' },
    { text: 'NIST/SEMATECH. <i>e-Handbook of Statistical Methods</i>, section 1.3.5.3, “Two-Sample t-Test for Equal Means”.', url: 'https://itl.nist.gov/div898/handbook/eda/section3/eda353.htm', checked: '2026-10-24' },
    { text: 'Delacre, M., Lakens, D. &amp; Leys, C. (2017). “Why psychologists should by default use Welch’s t-test instead of Student’s t-test”. <i>International Review of Social Psychology</i>, 30(1), 92–101.', url: 'https://doi.org/10.5334/irsp.82', checked: '2026-10-24' },
    { text: 'Illowsky, B. &amp; Dean, S. <i>Introductory Statistics 2e</i>, section 13.4, “Test of Two Variances”. OpenStax.', url: 'https://openstax.org/books/introductory-statistics-2e/pages/13-4-test-of-two-variances', checked: '2026-10-24' },
  ],

  checks: [
    // the workshop
    { what: 'Trainees', value: n, shown: 12 },
    { what: 'Mean before', value: mean(PRE), shown: 10.00 },
    { what: 'Mean after', value: mean(POST), shown: 11.58 },
    { what: 'Mean rise', value: mean(POST) - mean(PRE), shown: 1.58 },
    { what: 'Mean rise (3 dp)', value: P.meanDiff, shown: 1.583, tol: 0.0005 },
    { what: 'SD before', value: sd(PRE), shown: 3.54 },
    { what: 'SD after', value: sd(POST), shown: 4.23 },
    { what: 'Welch t on the columns', value: U.t, shown: 0.99 },
    { what: 'Welch p on the columns', value: U.p, shown: 0.33 },
    { what: 'Trainee 3 scored 16 both times', value: Number(PRE[2] === 16 && POST[2] === 16), shown: 1 },
    { what: 'Trainee 5 before', value: PRE[4], shown: 4 },
    { what: 'Trainee 5 after', value: POST[4], shown: 3 },
    { what: 'Differences as listed', value: Number(DIFF.join(',') === '2,2,0,5,-1,3,1,1,1,1,2,2'), shown: 1 },
    { what: 'Improved', value: DIFF.filter((x) => x > 0).length, shown: 10 },
    { what: 'Unchanged', value: DIFF.filter((x) => x === 0).length, shown: 1 },
    { what: 'Worse', value: DIFF.filter((x) => x < 0).length, shown: 1 },
    { what: 'Scores range from 4 (before, lowest)', value: Math.min(...PRE), shown: 4 },
    { what: 'Highest score', value: Math.max(...PRE, ...POST), shown: 17 },
    { what: 'Lowest score', value: Math.min(...PRE, ...POST), shown: 3 },
    { what: 'Highest before', value: Math.max(...PRE), shown: 16 },
    { what: 'Differences from −1', value: Math.min(...DIFF), shown: -1 },
    { what: 'Differences to 5', value: Math.max(...DIFF), shown: 5 },
    { what: 'SD of differences', value: P.sdDiff, shown: 1.505, tol: 0.0005 },
    { what: 'SD of differences (2 dp, figure)', value: P.sdDiff, shown: 1.51 },
    { what: 'Paired SE', value: P.se, shown: 0.4345, tol: 0.00005 },
    { what: 'Paired SE (2 dp)', value: P.se, shown: 0.43 },
    { what: 'Paired t', value: P.t, shown: 3.64 },
    { what: 'Paired t (3 dp, Excel)', value: P.t, shown: 3.644, tol: 0.0005 },
    { what: 'Paired df', value: P.df, shown: 11 },
    { what: 'Largest difference in SDs above the mean', value: (Math.max(...DIFF) - P.meanDiff) / P.sdDiff, shown: 2.3, tol: 0.05 },
    { what: 'Paired two-sided p', value: P.p, shown: 0.0039, tol: 0.00005 },
    { what: 'Paired p, 3 dp', value: P.p, shown: 0.004, tol: 0.0005 },
    { what: 'T.DIST.2T(3.644,11)', value: 2 * I.tSf(3.644, 11), shown: 0.0039, tol: 0.00005 },
    { what: 'Unpaired SE', value: U.se, shown: 1.59 },
    { what: 'Pearson r', value: P.r, shown: 0.94 },
    { what: 'Variance after', value: variance(POST), shown: 17.90 },
    { what: 'Variance before', value: variance(PRE), shown: 12.55 },
    { what: 'Variance of differences via r', value: sdViaR ** 2, shown: 2.27 },
    { what: 'r (4 dp)', value: P.r, shown: 0.9403, tol: 0.00005 },
    { what: 'SD after (3 dp)', value: sd(POST), shown: 4.231, tol: 0.0005 },
    { what: 'SD before (3 dp)', value: sd(PRE), shown: 3.542, tol: 0.0005 },
    { what: 'The rounded arithmetic gives 2.27', value: 17.90 + 12.55 - 2 * 0.9403 * 4.231 * 3.542, shown: 2.27 },
    { what: 'Variance of differences direct', value: P.sdDiff ** 2, shown: sdViaR ** 2, tol: 1e-9 },
    // ToolPak table values
    { what: 'ToolPak one-tail p is half', value: P.p / 2, shown: 0.00192948, tol: 0.000000005 },
    { what: 't Critical one-tail (11 df)', value: tc11one, shown: 1.796 },
    { what: 'ToolPak Mean (after)', value: mean(POST), shown: 11.5833, tol: 0.00005 },
    { what: 'ToolPak Variance (after)', value: variance(POST), shown: 17.9015, tol: 0.00005 },
    { what: 'ToolPak Variance (before)', value: variance(PRE), shown: 12.5455, tol: 0.00005 },
    { what: 'ToolPak Pearson Correlation', value: P.r, shown: 0.940266, tol: 0.0000005 },
    { what: 'ToolPak t Stat', value: P.t, shown: 3.6443, tol: 0.00005 },
    { what: 'ToolPak two-tail p', value: P.p, shown: 0.00385896, tol: 0.000000005 },
    { what: 'ToolPak t Critical one-tail (6 sf)', value: tc11one, shown: 1.79588, tol: 0.000005 },
    { what: 'ToolPak t Critical two-tail (6 sf)', value: tc11, shown: 2.20099, tol: 0.000005 },
    { what: 't Critical two-tail (11 df)', value: tc11, shown: 2.201 },
    // pooled vs welch theory
    { what: 'Pooled t equals Welch t when n1 = n2 (latte)', value: pooledL.t, shown: U.t, tol: 1e-9 },
    { what: 'Pooled df (latte)', value: pooledL.df, shown: 22 },
    // ToolPak df rounding on the calls
    { what: 'Calls Welch df', value: CW.df, shown: 7.83 },
    { what: 'Calls ToolPak df', value: Math.round(CW.df), shown: 8 },
    { what: 'Calls T.TEST type 3 p', value: CW.p, shown: 0.0713, tol: 0.00005 },
    { what: 'Calls ToolPak p', value: cTool, shown: 0.0706, tol: 0.00005 },
    // intervals
    { what: 'Paired CI lower', value: P.low, shown: 0.63 },
    { what: 'Paired CI upper', value: P.high, shown: 2.54 },
    { what: 'Paired CI by formula', value: P.meanDiff - tc11 * P.se, shown: P.low, tol: 1e-9 },
    { what: 'Unpaired CI lower', value: U.low, shown: -1.73 },
    { what: 'Unpaired CI upper', value: U.high, shown: 4.89 },
    { what: 'T.INV.2T truncation example: 16.69 df', value: BW.df, shown: 16.69 },
    { what: 'T.INV.2T truncation example: truncated df', value: Math.trunc(BW.df), shown: 16 },
    // effect size
    { what: 'Pooled SD (latte)', value: spL, shown: 3.90 },
    { what: 'Pooled SD by the lesson formula', value: Math.sqrt((variance(POST) + variance(PRE)) / 2), shown: spL, tol: 1e-9 },
    { what: 'Cohen d (latte)', value: P.meanDiff / spL, shown: 0.41 },
    { what: 'About two-fifths', value: P.meanDiff / spL, shown: 0.4, tol: 0.02 },
    { what: 'Paired d_z (latte)', value: P.meanDiff / P.sdDiff, shown: 1.05 },
    // Fairweather
    { what: 'Harbour n', value: HARBOUR.length, shown: 10 },
    { what: 'Park n', value: PARK.length, shown: 12 },
    { what: 'Harbour mean', value: mean(HARBOUR), shown: 63.0 },
    { what: 'Park mean', value: mean(PARK), shown: 48.0 },
    { what: 'Harbour SD', value: sd(HARBOUR), shown: 9.94 },
    { what: 'Park SD', value: sd(PARK), shown: 7.62 },
    { what: 'Harbour variance', value: variance(HARBOUR), shown: 98.89 },
    { what: 'Park variance', value: variance(PARK), shown: 58.00 },
    { what: 'Harbour q', value: bq1, shown: 9.889, tol: 0.0005 },
    { what: 'Park q', value: bq2, shown: 4.833, tol: 0.0005 },
    { what: 'Sum of q', value: bq1 + bq2, shown: 14.722, tol: 0.0005 },
    { what: 'Bikes SE', value: BW.se, shown: 3.837, tol: 0.0005 },
    { what: 'Bikes difference', value: BW.diff, shown: 15.0 },
    { what: 'Bikes t', value: BW.t, shown: 3.91 },
    { what: 'Bikes df numerator', value: (bq1 + bq2) ** 2, shown: 216.74 },
    { what: 'Bikes df term 1', value: bq1 ** 2 / 9, shown: 10.866, tol: 0.0005 },
    { what: 'Bikes df term 2', value: bq2 ** 2 / 11, shown: 2.124, tol: 0.0005 },
    { what: 'Bikes df', value: BW.df, shown: 16.69 },
    { what: 'Bikes df (1 dp)', value: BW.df, shown: 16.7, tol: 0.05 },
    { what: 'Bikes p', value: BW.p, shown: 0.0012, tol: 0.00005 },
    { what: 'Bikes t value for 16.69 df', value: bTcrit, shown: 2.113 },
    { what: 'Bikes t value, Excel truncated', value: bTcritXl, shown: 2.120 },
    { what: 'Bikes CI lower', value: BW.low, shown: 6.9, tol: 0.05 },
    { what: 'Bikes CI upper', value: BW.high, shown: 23.1, tol: 0.05 },
    { what: 'Truncation moves each end by (minutes)', value: (bTcritXl - bTcrit) * BW.se, shown: 0.03, tol: 0.005 },
    { what: 'Bikes pooled p', value: BP.p, shown: 0.0007, tol: 0.00005 },
    { what: 'Bikes pooled SD', value: Math.sqrt(BP.pooledVar), shown: 8.74 },
    { what: 'Bikes Cohen d', value: BW.diff / Math.sqrt(BP.pooledVar), shown: 1.7, tol: 0.05 },
    { what: 'Hire gap about a quarter of an hour', value: BW.diff / 60, shown: 0.25, tol: 0.001 },
    // Clearwater
    { what: 'Script A calls', value: SA.length, shown: 8 },
    { what: 'Script B calls', value: SB.length, shown: 20 },
    { what: 'A mean', value: mean(SA), shown: 8.925, tol: 0.0005 },
    { what: 'B mean', value: mean(SB), shown: 7.050, tol: 0.0005 },
    { what: 'A SD', value: sd(SA), shown: 2.473, tol: 0.0005 },
    { what: 'B SD', value: sd(SB), shown: 0.946, tol: 0.0005 },
    { what: 'A variance', value: variance(SA), shown: 6.114, tol: 0.0005 },
    { what: 'B variance', value: variance(SB), shown: 0.895, tol: 0.0005 },
    { what: 'Difference', value: CW.diff, shown: 1.875, tol: 0.0005 },
    { what: 'SD ratio', value: sd(SA) / sd(SB), shown: 2.6, tol: 0.05 },
    { what: 'Pooled variance', value: CP.pooledVar, shown: 2.300, tol: 0.0005 },
    { what: 'Pooled SE', value: CP.se, shown: 0.634, tol: 0.0005 },
    { what: 'Pooled t', value: CP.t, shown: 2.96, tol: 0.005 },
    { what: 'Pooled df', value: CP.df, shown: 26 },
    { what: 'Pooled p', value: CP.p, shown: 0.0066, tol: 0.00005 },
    { what: 'Welch q1', value: cq1, shown: 0.7642, tol: 0.00005 },
    { what: 'Welch q2', value: cq2, shown: 0.0448, tol: 0.00005 },
    { what: 'Welch sum q', value: cq1 + cq2, shown: 0.8090, tol: 0.00005 },
    { what: 'Welch SE', value: CW.se, shown: 0.899, tol: 0.0005 },
    { what: 'Welch SE (4 dp)', value: CW.se, shown: 0.8994, tol: 0.00005 },
    { what: 'Welch t from printed SE', value: 1.875 / 0.8994, shown: 2.08 },
    { what: 'Welch t', value: CW.t, shown: 2.08 },
    { what: 'Welch p', value: CW.p, shown: 0.071, tol: 0.0005 },
    { what: 'Welch df (1 dp)', value: CW.df, shown: 7.8, tol: 0.05 },
    { what: 'Pooled SD', value: Math.sqrt(CP.pooledVar), shown: 1.52 },
    { what: 'Pooled SE about 30% too small', value: 1 - CP.se / CW.se, shown: 0.30, tol: 0.01 },
    { what: 'F.TEST p (calls)', value: I.fTestVar(SA, SB).p, shown: 0.0008, tol: 0.00005 },
    { what: 'Calls CI lower', value: CW.low, shown: -0.21 },
    { what: 'Calls CI upper', value: CW.high, shown: 3.96 },
    { what: 'One-tailed T.TEST (calls)', value: CW.p / 2, shown: 0.036, tol: 0.0005 },
    { what: '1 − one-tailed', value: 1 - CW.p / 2, shown: 0.964, tol: 0.0005 },
    // web vs app
    { what: 'Spring orders', value: ORDERS.length, shown: 231 },
    { what: 'Web orders', value: WEB.length, shown: 132 },
    { what: 'App orders', value: APP.length, shown: 99 },
    { what: 'Web mean', value: mean(WEB), shown: 41.21 },
    { what: 'App mean', value: mean(APP), shown: 36.93 },
    { what: 'Web median', value: median(WEB), shown: 19.50 },
    { what: 'App median', value: median(APP), shown: 30.60 },
    { what: 'Web SD', value: sd(WEB), shown: 131.12 },
    { what: 'App SD', value: sd(APP), shown: 30.04 },
    { what: 'Web largest', value: Math.max(...WEB), shown: 1512 },
    { what: 'App largest', value: Math.max(...APP), shown: 191 },
    { what: 'Bulk order is LC-10144 on the web', value: Number(BULK[0] === 'LC-10144' && BULK[c('channel')] === 'web'), shown: 1 },
    { what: 'Web without bulk n', value: WEB_NB.length, shown: 131 },
    { what: 'Web without bulk mean', value: mean(WEB_NB), shown: 29.98 },
    { what: 'Web without bulk median', value: median(WEB_NB), shown: 19.50 },
    { what: 'Web without bulk SD', value: sd(WEB_NB), shown: 23.60 },
    { what: 'Web without bulk largest', value: Math.max(...WEB_NB), shown: 133 },
    { what: 'Difference, all', value: WA.diff, shown: 4.28 },
    { what: 'SE, all', value: WA.se, shown: 11.80 },
    { what: 't, all', value: WA.t, shown: 0.36 },
    { what: 'df, all', value: WA.df, shown: 149, tol: 0.5 },
    { what: 'p, all', value: WA.p, shown: 0.72 },
    { what: 'CI lower, all', value: WA.low, shown: -19.05 },
    { what: 'CI upper, all', value: WA.high, shown: 27.61 },
    { what: 'Bulk order about 78 times the web median', value: 1512 / median(WEB), shown: 78, tol: 0.5 },
    { what: 'Bulk lifts web mean by', value: mean(WEB) - mean(WEB_NB), shown: 11.23 },
    { what: 'Difference, no bulk', value: WN.diff, shown: -6.95 },
    { what: 't, no bulk', value: WN.t, shown: -1.90 },
    { what: 'df, no bulk', value: WN.df, shown: 181, tol: 0.5 },
    { what: 'p, no bulk', value: WN.p, shown: 0.059, tol: 0.0005 },
    { what: 'CI lower, no bulk', value: WN.low, shown: -14.16 },
    { what: 'CI upper, no bulk', value: WN.high, shown: 0.27 },
    { what: 'Geometric mean web', value: geo(WEB), shown: 25.23 },
    { what: 'Geometric mean app', value: geo(APP), shown: 29.02 },
    { what: 'Log-scale p', value: LOG.p, shown: 0.12 },
    { what: 'App subscriptions', value: CS[1][0], shown: 57 },
    { what: 'App orders (table)', value: CS[1][0] + CS[1][1], shown: 99 },
    { what: 'Web subscriptions', value: CS[0][0], shown: 47 },
    { what: 'Web orders (table)', value: CS[0][0] + CS[0][1], shown: 132 },
    { what: 'Order of $1,512 is the largest', value: Math.max(...WEB, ...APP), shown: 1512 },
    // demo intros
    { what: 'Latte HMD = 1 example sensible (gain above 1 not significant)', value: Number(I.tTestPaired(POST, PRE, { delta: 1 }).p > 0.05), shown: 1 },
    { what: 'Pooled p calls in demo', value: CP.p, shown: 0.0066, tol: 0.00005 },
    { what: 'Swap trainees 1 and 3: paired p about 0.13', value: I.tTestPaired(POST.map((x, i) => (i === 0 ? POST[2] : i === 2 ? POST[0] : x)), PRE).p, shown: 0.13, tol: 0.005 },
    { what: 'Swap: trainee 1 after, trainee 3 after', value: POST[0] * 100 + POST[2], shown: 1016 },
    { what: 'Latte ToolPak unequal df', value: uTool.df, shown: 21 },
    { what: 'Latte ToolPak unequal p about 0.33', value: uTool.pTwo, shown: 0.33, tol: 0.005 },
  ],
};
