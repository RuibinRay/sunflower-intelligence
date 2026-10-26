// hypothesis-testing.js — B04 · Hypothesis testing. Content only; exercises are in hypothesis-testing.ex.js. Uses
// Kilnworth's 1 kg bags (KG_BAGS, KILNWORTH_1KG; DERIVED.kg) for the z and t tests, power and the link with intervals,
// and B01's shop conversion, web and app together (CONVERSION.shop; DERIVED.conversion.sepVsTarget, octVsTarget), for
// the one-proportion test against the 3.0% target. Oakhaven Hotel is fictional. The two-proportion test of the website's
// August against its September is module 4's (proportions-and-chi-square).
// Every figure printed is recomputed in `checks`.
import { KG_BAGS, KILNWORTH_1KG, CONVERSION, SHOP, TARGETS, DERIVED as D } from './case.js?v=20';
import * as I from '../../../core/inference.js?v=20';
import { mean, sd, median } from '../../../core/stats.js?v=20';

// ---------------------------------------------------------------- the bags
const K = KILNWORTH_1KG, KG = D.kg;
const n = KG_BAGS.length, xbar = mean(KG_BAGS), s = sd(KG_BAGS), se = s / Math.sqrt(n);
const T = KG.vsSetting, TL = KG.vsLabel;                                      // one-sided t tests (case)
const T2 = I.tTest1(KG_BAGS, K.setting), TL2 = I.tTest1(KG_BAGS, K.label);    // two-sided versions
const Z = I.zTest1(KG_BAGS, K.setting, K.sd, { alternative: 'less' });        // σ = 3 g taken from the specification
const zTestXl = 1 - I.normCdf((xbar - K.setting) / (K.sd / Math.sqrt(n)));     // Excel's Z.TEST(array, 1004, 3)
const tCritLow = I.tInv(0.05, n - 1), tCrit2 = I.tInv(0.975, n - 1);
const z95 = I.normInv(0.95), z975 = I.normInv(0.975), z80 = I.normInv(0.8);
const CI = KG.ci, oneSidedUpper = T.high;
// power for a 1 g underfill (true mean 1,003 g), one-sided, σ = 3 g
const seZ = K.sd / Math.sqrt(n);
const pw = (delta, nn = n, alt = 'less') => I.powerMean({ delta, sigma: K.sd, n: nn, alpha: 0.05, alternative: alt });
const nFor = (delta, alt = 'less', power = 0.8) => I.sampleSizeForPower({ delta, sigma: K.sd, alpha: 0.05, power, alternative: alt });
const nRaw1 = ((z95 + z80) * K.sd / 1) ** 2, nRaw2 = ((z975 + z80) * K.sd / 1) ** 2, nRawHalf = ((z95 + z80) * K.sd / 0.5) ** 2;
const nT = ((I.tInv(0.95, nFor(1) - 1) + I.tInv(0.8, nFor(1) - 1)) * K.sd / 1) ** 2;      // NIST: one iteration with t
// practical significance
const bigZ = (1003.9 - K.setting) / (K.sd / Math.sqrt(4000));
const underIfLight = I.normal.cdf(K.label, xbar, K.sd);

// ---------------------------------------------------------------- conversion
const SEP = D.conversion.sepVsTarget, OCT = D.conversion.octVsTarget, SH = CONVERSION.shop;
const se0 = (nn) => Math.sqrt((CONVERSION.target * (1 - CONVERSION.target)) / nn);

// ---------------------------------------------------------------- Oakhaven Hotel (fictional)
const HOTEL = [27, 32, 25, 29, 24, 31, 28, 34, 27, 25, 29, 30];
const H = I.tTest1(HOTEL, 30), H1 = I.tTest1(HOTEL, 30, { alternative: 'less' });
const hCrit = I.tInv(0.975, HOTEL.length - 1);

// ---------------------------------------------------------------- figures
const f1 = (x) => Math.round(x * 10) / 10;
function tFigure() {
  const L = 40, R = 600, B = 222, top = 52, df = n - 1;
  const X = (v) => L + ((v + 4) / 8) * (R - L);
  const ymax = I.tPdf(0, df), Y = (d) => B - (d / ymax) * (B - top);
  const grid = (a, b) => { const out = []; const k = Math.max(2, Math.ceil((b - a) / 0.04)); for (let i = 0; i <= k; i++) out.push(a + ((b - a) * i) / k); return out; };
  const curve = grid(-4, 4).map((v, i) => `${i ? 'L' : 'M'}${f1(X(v))},${f1(Y(I.tPdf(v, df)))}`).join(' ');
  const area = (a, b) => `M${f1(X(a))},${B} ${grid(a, b).map((v) => `L${f1(X(v))},${f1(Y(I.tPdf(v, df)))}`).join(' ')} L${f1(X(b))},${B} Z`;
  const tc = tCritLow, tv = T.t;
  let svg = '<svg viewBox="0 0 640 270" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">';
  svg += `<path d="${area(-4, tc)}" fill="var(--series-2)" opacity="0.28"/>`;
  svg += `<path d="${area(-4, tv)}" fill="var(--series-1)" opacity="0.75"/>`;
  svg += `<path d="${curve}" fill="none" stroke="var(--ink)" stroke-width="1.8"/>`;
  svg += `<line x1="${L}" x2="${R}" y1="${B}" y2="${B}" stroke="var(--ink)" stroke-width="1.2"/>`;
  [-3, -2, -1, 0, 1, 2, 3].forEach((v) => { svg += `<line x1="${f1(X(v))}" x2="${f1(X(v))}" y1="${B}" y2="${B + 5}" stroke="var(--ink)"/><text x="${f1(X(v))}" y="${B + 19}" text-anchor="middle" font-size="11" fill="var(--ink-3)">${v < 0 ? '−' : ''}${Math.abs(v)}</text>`; });
  svg += `<line x1="${f1(X(tc))}" x2="${f1(X(tc))}" y1="${B}" y2="${top - 6}" stroke="var(--series-2)" stroke-width="1.6" stroke-dasharray="5 4"/>`;
  svg += `<text x="${f1(X(tc)) + 6}" y="${top + 2}" font-size="11">critical value −1.685</text>`;
  svg += `<line x1="${f1(X(tv))}" x2="${f1(X(tv))}" y1="${B}" y2="${top + 22}" stroke="var(--series-1)" stroke-width="2.2"/>`;
  svg += `<text x="${f1(X(tv)) - 6}" y="${top + 20}" text-anchor="end" font-size="11">Ana’s t = −2.98</text>`;
  svg += `<text x="${f1(X(-3.3))}" y="${B - 38}" text-anchor="middle" font-size="11">p = 0.0025</text>`;
  svg += `<line x1="${f1(X(-3.3))}" x2="${f1(X(-3.15))}" y1="${B - 33}" y2="${B - 6}" stroke="var(--ink-3)" stroke-width="1"/>`;
  svg += `<text x="${f1(X(-2.35))}" y="${B - 70}" text-anchor="middle" font-size="11" fill="var(--ink-3)">rejection region:</text><text x="${f1(X(-2.35))}" y="${B - 56}" text-anchor="middle" font-size="11" fill="var(--ink-3)">5% of the area</text>`;
  svg += `<text x="${f1(X(1.9))}" y="${top + 40}" text-anchor="middle" font-size="11" fill="var(--ink-3)">t distribution, 39 df:</text><text x="${f1(X(1.9))}" y="${top + 54}" text-anchor="middle" font-size="11" fill="var(--ink-3)">what t looks like if H₀ is true</text>`;
  svg += `<text x="320" y="20" text-anchor="middle" font-size="12">One-sided test of H₀: μ = 1,004 g against H₁: μ &lt; 1,004 g</text>`;
  svg += `<text x="320" y="${B + 40}" text-anchor="middle" font-size="11" fill="var(--ink-3)">t = (x̄ − 1,004) ÷ (s ÷ √40)</text>`;
  return `${svg}</svg>`;
}
function ciFigure() {
  const L = 50, R = 610, y = 92;
  const X = (v) => L + ((v - 999.5) / 5) * (R - L);
  let svg = '<svg viewBox="0 0 660 170" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">';
  svg += `<line x1="${L}" x2="${R}" y1="${y + 30}" y2="${y + 30}" stroke="var(--ink)" stroke-width="1.2"/>`;
  [1000, 1001, 1002, 1003, 1004].forEach((v) => { svg += `<line x1="${f1(X(v))}" x2="${f1(X(v))}" y1="${y + 25}" y2="${y + 35}" stroke="var(--ink)"/><text x="${f1(X(v))}" y="${y + 52}" text-anchor="middle" font-size="11" fill="var(--ink-3)">${v.toLocaleString('en-US')} g</text>`; });
  svg += `<line x1="${f1(X(CI.low))}" x2="${f1(X(CI.high))}" y1="${y}" y2="${y}" stroke="var(--series-1)" stroke-width="6" stroke-linecap="butt"/>`;
  svg += `<circle cx="${f1(X(xbar))}" cy="${y}" r="6" fill="var(--ink)"/>`;
  svg += `<text x="${f1(X(xbar))}" y="${y - 16}" text-anchor="middle" font-size="11">95% interval 1,001.90 to 1,003.60 g; mean 1,002.75 g</text>`;
  const mark = (v, label, label2, dash) => `<line x1="${f1(X(v))}" x2="${f1(X(v))}" y1="${y - 40}" y2="${y + 30}" stroke="var(--series-2)" stroke-width="1.6"${dash ? ' stroke-dasharray="4 3"' : ''}/><text x="${f1(X(v))}" y="${y - 58}" text-anchor="middle" font-size="11">${label}</text><text x="${f1(X(v))}" y="${y - 45}" text-anchor="middle" font-size="11" fill="var(--ink-3)">${label2}</text>`;
  svg += mark(1000, 'label 1,000 g', 'outside: rejected', false);
  svg += mark(1003, '1,003 g', 'inside: not rejected', true);
  svg += mark(1004, 'setting 1,004 g', 'outside: rejected', false);
  return `${svg}</svg>`;
}

export default {
  slug: 'hypothesis-testing',
  title: 'Hypothesis testing',
  blurb: 'Turn a business worry into a null and an alternative hypothesis, measure how surprising the data would be if nothing were wrong, and decide with a p-value or a critical value. Test Kilnworth’s 1 kg bags with a z test and a t test and September’s conversion against its target, then weigh Type I and Type II errors, power, practical significance and the traps of running many tests.',
  status: 'reviewed',
  objectives: [
    'State a null and an alternative hypothesis, one- or two-sided, for a business question, and choose the significance level before seeing the data.',
    'Calculate a z or t statistic for a mean and a z statistic for a proportion, by hand and in Excel, and find the p-value that matches the alternative.',
    'Decide with a p-value or a critical value, and write the conclusion in context without claiming more than the test shows.',
    'Explain Type I and Type II errors and power, and calculate the power of a test and the sample size a chosen power needs.',
    'Distinguish statistical from practical significance, and use a confidence interval to read a two-sided test.',
    'Recognise p-hacking and multiple testing, and apply the American Statistical Association’s principles on p-values to a report.',
  ],
  prerequisites: [
    { lesson: 'b04/confidence-intervals', why: 'A test reuses the standard error, the t distribution and its degrees of freedom, and the interval it is paired with.' },
    { lesson: 'b04/sampling-distributions', why: 'The standard error is the yardstick a test statistic measures distance with.' },
    { lesson: 'b04/normal-distribution', why: 'Kilnworth’s specification and the standard normal areas NORM.S.DIST returns.' },
    { lesson: 'b03/descriptive-statistics-and-regression', why: 'Where t Stat and P-value first appeared, as lines in the ToolPak’s output.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'In October 2026 Ana weighed 40 of Kilnworth Roasting’s 1 kg bags of House Blend as they arrived. Kilnworth’s specification says its filling machine is set to 1,004 g with a standard deviation of 3 g; the normal-distribution lesson showed that a machine running to that specification puts about 9.1% of bags under the 1,000 g label. Ana’s 40 bags averaged 1,002.75 g, and 5 of them weighed less than 1,000 g. Before she writes to Kilnworth she wants to know whether 1,002.75 g is evidence that the machine fills light, or the kind of shortfall a sample of 40 would show by chance even if the machine were set exactly as promised.' },

    { h: 'The question a test answers' },
    { p: 'A hypothesis test turns that worry into a precise question. Start by assuming the dull explanation: the machine fills to 1,004 g on average, and Ana’s sample happens to be a little light. Then ask how surprising a sample mean of 1,002.75 g would be if that were true. If a result like hers would be rare, the dull explanation is hard to believe; if it would be common, the data give no reason to doubt it.' },
    { p: String.raw`The dull explanation is the <g>null hypothesis</g>, written <m>H_0</m> (“H-nought”). The claim you would need evidence for is the <g>alternative hypothesis</g>, <m>H_1</m>. With <m>\mu</m> (mu) standing for the mean fill of all the bags Kilnworth’s machine produces:` },
    { math: String.raw`H_0: \mu = 1{,}004 \text{ g} \qquad H_1: \mu < 1{,}004 \text{ g}` },
    { p: 'The hypotheses are about the population mean, a <g>parameter</g>, never about the sample mean, a <g>statistic</g>: Ana already knows her sample averaged 1,002.75 g. The null contains the equality, and it is the hypothesis the test assumes while it does its sums. This alternative is one-sided because Ana’s concern is underfilling; the In depth section says when the two-sided alternative, μ ≠ 1,004 g, is the right choice. In B01’s terms both are a <g>hypothesis</g>, stated precisely enough for data to contradict it.' },

    { h: 'How far is 1,002.75 g from 1,004 g?' },
    { p: String.raw`The sample mean is 1.25 g below the setting. Whether that is a lot depends on how much the means of samples of 40 bags vary, which is the <g>standard error of the mean</g> from the sampling-distributions lesson: <m>s \div \sqrt{n} = 2.6563 \div \sqrt{40} \approx 0.4200</m> g, where <m>s</m> = 2.66 g is the standard deviation of Ana’s 40 bags. The <g>test statistic</g> measures the gap in standard errors:` },
    { math: String.raw`t = \dfrac{\bar{x} - \mu_0}{s/\sqrt{n}} = \dfrac{1{,}002.75 - 1{,}004}{2.6563/\sqrt{40}} = \dfrac{-1.25}{0.4200} \approx -2.98` },
    { p: 'Ana’s sample mean sits almost three standard errors below the setting. If H₀ is true and bag weights are roughly normal, this statistic follows the <g>t distribution</g> with n − 1 = 39 <g>degrees of freedom</g>, the distribution the confidence-intervals lesson used for intervals. That tells us how often a value this far down would occur by chance alone.' },

    { h: 'The p-value' },
    { p: 'The <g>p-value</g> is the probability, calculated assuming H₀ is true, of a test statistic at least as extreme as the one observed, in the direction the alternative points. Here it is the area under the t curve with 39 degrees of freedom to the left of −2.98: <x>=T.DIST(-2.976,39,TRUE)</x> returns 0.0025. If the machine really averaged 1,004 g, only about 1 sample of 40 bags in 400 would come out this light or lighter.' },
    { figure: {
      svg: tFigure(),
      caption: 'The t distribution with 39 degrees of freedom: how the test statistic would vary from sample to sample if H₀ were true and the machine averaged 1,004 g. The lightly shaded lower tail beyond the critical value, −1.685, holds 5% of the area: the rejection region at α = 0.05. Ana’s t = −2.98 lies inside it, and the darker area to its left, 0.0025, is the p-value.',
      alt: 'A symmetric bell-shaped t curve over a horizontal axis marked from −3 to 3. A dashed vertical line at −1.685 is labelled critical value −1.685, and the region of the lower tail to its left is lightly shaded and labelled rejection region: 5% of the area. A solid vertical line further left at −2.98 is labelled Ana’s t = −2.98, and the small area to its left is shaded darker and labelled p = 0.0025. A note says the curve shows what t looks like if H₀ is true. The title reads: one-sided test of H₀: μ = 1,004 g against H₁: μ < 1,004 g.',
    } },
    { p: 'Small p-values are evidence against H₀. To decide, compare the p-value with the <g>significance level</g> α (alpha), the risk of rejecting a true null that you are prepared to run, chosen before seeing the data. The value 0.05 is a common convention, not a law. Ana chose α = 0.05; since 0.0025 ≤ 0.05 she rejects H₀: the data are evidence that the machine fills below its 1,004 g setting.' },
    { callout: 'warn', title: 'What a p-value is not', html: 'A p-value of 0.0025 is not the probability that H₀ is true, and 1 − 0.0025 is not the probability that the machine fills light. The p-value is calculated assuming H₀ is true: it measures how surprising the data would be in that world. A large p-value doesn’t show H₀ is true either; it shows the data are compatible with it, and usually with many other values too.' },

    { h: 'The steps of every test' },
    { ol: [
      'State the question, H₀, H₁ and α before looking at the results.',
      'Check the conditions the test needs: here a random sample of independent bags whose weights are roughly normal, or a sample large enough for the <g>central limit theorem</g>.',
      'Calculate the test statistic: how many standard errors the estimate lies from the null value.',
      'Find the p-value for the alternative, or compare the statistic with a critical value.',
      'Decide: reject H₀ if p ≤ α; otherwise fail to reject it.',
      'Conclude in the context of the question, with the size of the effect and an interval, not only the word “significant”.',
    ] },
    { p: 'For Ana’s bags, the normal-distribution lesson checked the shape: the 40 weights lie close to a normal curve, with no outliers. Independence needs more thought. Bags filled one after another can be alike if the machine drifts, and all 40 came from October’s deliveries, so the test describes the machine as it ran then, not for ever. If neighbouring bags are alike, s ÷ √n also understates the real standard error and the p-value comes out too small.' },
    { p: 'Step 6 matters as much as the arithmetic. Ana’s conclusion reads: “The 40 bags averaged 1,002.75 g, 1.25 g below the 1,004 g setting (95% confidence interval 1,001.90 to 1,003.60 g). A one-sided t test gives p = 0.0025, so a shortfall this large is unlikely to be chance: the machine appears to be filling light.” It doesn’t say the machine is broken, why it drifted, or that every delivery will be light.' },
  ],

  theory: [
    { h: 'Writing the hypotheses' },
    { p: 'The null hypothesis is the claim being checked, or the “no change, no difference” position: the specification, the target, last year’s average. It always contains the equality (=, ≤ or ≥), because the test needs one exact value to work out how the statistic behaves. For H₀: μ ≥ 1,004 g the test uses the boundary, 1,004 g, the case hardest to reject. The alternative is what the data would have to show, and it contains &lt;, &gt; or ≠.' },
    { table: {
      caption: 'Business questions as hypotheses',
      head: ['Question', 'H₀', 'H₁', 'Sides'],
      rows: [
        ['Are Kilnworth’s bags filled below the 1,004 g setting?', String.raw`<m>\mu = 1{,}004</m> g`, String.raw`<m>\mu < 1{,}004</m> g`, 'One (lower tail)'],
        ['Is the average bag above the 1,000 g label?', String.raw`<m>\mu = 1{,}000</m> g`, String.raw`<m>\mu > 1{,}000</m> g`, 'One (upper tail)'],
        ['Did the shop’s September conversion fall short of the 3.0% target?', String.raw`<m>p = 0.030</m>`, String.raw`<m>p < 0.030</m>`, 'One (lower tail)'],
        ['Has a hotel’s cleaning time per room changed from 30 minutes?', String.raw`<m>\mu = 30</m> min`, String.raw`<m>\mu \ne 30</m> min`, 'Two'],
      ],
    } },
    { p: 'Choose one- or two-sided from the decision, before seeing the data. A <g>one-sided test</g> fits when only one direction would change what you do and the other would be treated like no difference: Ana acts on underfilling, while slightly heavy bags cost Kilnworth, not her. When either direction matters, use a <g>two-sided test</g>: a cleaning time that rose would break a hotel’s rota, and one that fell would free staff. Picking the side after seeing which way the data went, or switching to one-sided to get under 0.05, doubles the real chance of a false alarm.' },
    { p: '“Fail to reject” is not “accept”. When p &gt; α the test has found no convincing evidence against H₀, which can mean H₀ is true or that the sample was too small or too noisy to show a real difference. Report “no evidence of a difference at the 5% level”, with the interval, never “the test proved there is no difference”.' },

    { h: 'The z test when σ is known' },
    { p: String.raw`If the population standard deviation <m>\sigma</m> (sigma) is known, the standard error is <m>\sigma \div \sqrt{n}</m> and the statistic follows the <g>standard normal distribution</g>: a <g>z test</g>. Kilnworth’s specification states <m>\sigma</m> = 3 g. Taking that at its word, <m>z = (1{,}002.75 - 1{,}004) \div (3 \div \sqrt{40}) = -1.25 \div 0.4743 \approx -2.64</m>, and the one-sided p-value is <x>=NORM.S.DIST(-2.635,TRUE)</x> = 0.0042, again below 0.05.` },
    { p: 'The z test is less significant than the t test here because Kilnworth’s σ = 3 g is larger than Ana’s s = 2.66 g: its standard error is 0.474 g against 0.420 g, so the same 1.25 g shortfall is 2.64 standard errors rather than 2.98. A known σ is rare in business, and here it is only Kilnworth’s claim: if the machine has drifted, its spread may have changed too.' },
    { p: 'The <g>one-sample t test</g> uses Ana’s s and pays for the estimate with the t distribution’s heavier tails, so it needs no claim about σ. Some textbooks, OpenStax’s among them, switch from t to z once n reaches 30, using s in place of σ. Software uses t at every n, and so does this course: at n = 40 the normal curve would give 0.0015 for Ana’s t of −2.98 instead of 0.0025, the same decision with slightly overstated certainty.' },

    { h: 'P-values and critical values in Excel' },
    { p: 'Excel has no function for a one-sample t test: T.TEST compares two samples, as the comparing-means lesson shows. Calculate t from AVERAGE, STDEV.S and COUNT, then take the p-value from the function that matches the alternative.' },
    { table: {
      caption: 'Excel functions for the p-value of a z or t statistic',
      head: ['Alternative', 'p-value of a t statistic', 'p-value of a z statistic'],
      rows: [
        [String.raw`<m>H_1: \mu < \mu_0</m> (lower tail)`, '<x>=T.DIST(t,df,TRUE)</x>', '<x>=NORM.S.DIST(z,TRUE)</x>'],
        [String.raw`<m>H_1: \mu > \mu_0</m> (upper tail)`, '<x>=T.DIST.RT(t,df)</x>', '<x>=1-NORM.S.DIST(z,TRUE)</x>'],
        [String.raw`<m>H_1: \mu \ne \mu_0</m> (both tails)`, '<x>=T.DIST.2T(ABS(t),df)</x>', '<x>=2*(1-NORM.S.DIST(ABS(z),TRUE))</x>'],
      ],
    } },
    { p: 'T.DIST is Excel’s left-tailed t distribution (with TRUE for the cumulative probability; FALSE gives the height of the curve, which is not a probability) and T.DIST.RT its right tail. T.DIST.2T returns #NUM! for a negative x, so wrap the statistic in ABS. For Ana’s bags, <x>=T.DIST.2T(ABS(-2.976),39)</x> gives the two-sided p-value 0.0050, twice the one-sided 0.0025.' },
    { p: 'The <g>critical value</g> approach reaches the same decision without a p-value. The <g>rejection region</g> is the set of statistics extreme enough to reject H₀ at level α. For a one-sided lower-tail t test with 39 degrees of freedom it is t below <x>=T.INV(0.05,39)</x> = −1.685; for a two-sided test at 5% it is |t| above <x>=T.INV.2T(0.05,39)</x> = 2.023. Ana’s −2.98 lies beyond both. For z the familiar values are 1.645 (one-sided, 5%) and 1.96 (two-sided, 5%).' },
    { p: 'A p-value says more than the decision. A t of −2.98 and a t of −1.70 both lie beyond −1.685, so both reject at 5%, but the first would happen by chance about 1 time in 400 and the second about 1 time in 20: very different strengths of evidence. Report the p-value, not only “significant” or “not significant”.' },

    { h: 'Z.TEST’s one-tailed quirk' },
    { p: 'Excel’s Z.TEST(array, x, [sigma]) returns a one-tailed p-value, and always the upper tail. Microsoft defines it as 1 − NORM.S.DIST((AVERAGE(array) − x) ÷ (sigma ÷ √n), TRUE): the probability of a sample mean above the observed one if the population mean is x. For a sample mean below x the result is above 0.5. For Ana’s bags in B2:B41, <x>=Z.TEST(B2:B41,1004,3)</x> returns 0.9958.' },
    { p: 'The p-value for her lower-tail alternative is <x>=1-Z.TEST(B2:B41,1004,3)</x> = 0.0042, the z test’s result above. For a two-sided test Microsoft gives <x>=2*MIN(Z.TEST(B2:B41,1004,3),1-Z.TEST(B2:B41,1004,3))</x>, here 0.0084. Leave out sigma and Z.TEST uses the sample standard deviation but still the normal distribution, so it is still a z test, not a t test.' },

    { h: 'Testing a proportion' },
    { p: String.raw`The same logic tests a proportion against a stated value <m>p_0</m>. Under H₀ the sample proportion <m>\hat{p}</m> (“p-hat”) has standard error <m>\sqrt{p_0(1 - p_0) \div n}</m>, built from the null’s own value because the test asks how the data would behave if H₀ were true; a confidence interval uses <m>\hat{p}</m>, because it has no null value. The <g>one-proportion z test</g> statistic is <m>z = (\hat{p} - p_0) \div \sqrt{p_0(1 - p_0) \div n}</m>, compared with the standard normal. The normal model needs <m>np_0</m> and <m>n(1 - p_0)</m> both at least 10, a common rule of thumb (OpenStax’s version asks that “the sample proportion, p′, times the sample size is greater than 5” and that “1-p′ times the sample size is also greater than 5”), and independent trials.` },
    { p: 'In September the shop, web and app together and the basis of B01’s target, took 251 orders from 11,400 visits: a <g>conversion rate</g> of 2.20% against Ana’s 3.0% target. The applied example works the test: z ≈ −5.00, with a p-value of about 2.9 × 10⁻⁷. Two cautions apply to any test on visits. Visits are not fully independent trials, because one person can visit several times; and the test only says the shortfall is too large to be chance, not what caused it. Comparing the website’s August with its September needs a two-proportion test, which the proportions-and-chi-square lesson teaches.' },

    { h: 'Two ways to be wrong' },
    { p: 'A test decides between two hypotheses from incomplete information, so it can go wrong in two ways. A <g>Type I error</g> rejects a true null: a false alarm. A <g>Type II error</g> fails to reject a false null: a missed effect. The significance level α is the probability of a Type I error when H₀ is true; β (beta) is the probability of a Type II error for a particular true value of the parameter.' },
    { table: {
      caption: 'The four outcomes of Ana’s test',
      head: ['Decision', 'H₀ true: the machine averages 1,004 g', 'H₀ false: the machine fills light'],
      rows: [
        ['Reject H₀', 'Type I error (probability α): Ana complains about a machine that is fine', 'Right decision (probability 1 − β, the power): the underfill is caught'],
        ['Fail to reject H₀', 'Right decision (probability 1 − α)', 'Type II error (probability β): customers keep getting light bags'],
      ],
    } },
    { p: 'The two errors trade off. Lowering α to 0.01 makes false alarms rarer but makes a real underfill harder to detect, raising β. Which error costs more is a business judgement: a false complaint costs some goodwill with a supplier and an engineer’s visit, while a missed underfill costs Ana’s customers coffee and, as more bags fall under the label, her reputation. Those costs, not convention, should set α.' },

    { h: 'Power, and what raises it' },
    { p: String.raw`The <g>power</g> of a test is <m>1 - \beta</m>: the probability that it rejects H₀ when a particular alternative is true. It depends on the size of the true difference <m>\delta</m> (delta), the spread <m>\sigma</m>, the sample size <m>n</m>, the significance level and whether the test is one- or two-sided. For a one-sided z test, power <m>= \Phi(|\delta| \div (\sigma \div \sqrt{n}) - z_{1-\alpha})</m>, where <m>\Phi</m> is the standard normal cumulative probability, NORM.S.DIST(…, TRUE).` },
    { p: String.raw`Suppose the machine really averages 1,003 g, 1 g below the setting. With <m>\sigma</m> = 3 g, n = 40 and α = 0.05 one-sided, the standard error is 0.474 g, so the true mean sits <m>1 \div 0.474 \approx 2.11</m> standard errors below the null value, and power <m>= \Phi(2.11 - 1.645) = \Phi(0.46) \approx 0.68</m>. Forty bags would catch a 1 g underfill about two times in three. They would catch a 0.5 g underfill only 28% of the time, and a 2 g underfill 99% of the time.` },
    { list: [
      'A larger sample: the standard error shrinks with √n.',
      'A larger true difference: big effects are easier to see than small ones.',
      'Less noise: a smaller σ, from more precise scales or more uniform conditions.',
      'A larger α: a lenient threshold rejects more often, at the price of more false alarms.',
      'A one-sided test, when the effect lies in the direction tested; it can never detect one in the other direction.',
    ] },
    { p: String.raw`Turned round, the formula gives the sample size for a chosen power: <m>n = ((z_{1-\alpha} + z_{1-\beta})\,\sigma \div \delta)^2</m>, rounded up, with <m>z_{1-\alpha/2}</m> in place of <m>z_{1-\alpha}</m> for a two-sided test. Use it before collecting data, from the smallest difference worth detecting; the challenging example plans Ana’s next check. The formula treats <m>\sigma</m> as known, and for a t test the NIST/SEMATECH handbook repeats the calculation once with t values, which adds a bag or two.` },

    { h: 'Statistical and practical significance' },
    { p: 'A result is <g>statistically significant</g> when its p-value is at or below α. That says the effect is unlikely to be chance alone; it says nothing about whether the effect is large enough to matter. The American Statistical Association’s 2016 statement on p-values makes this its fifth principle: a p-value measures neither the size of an effect nor its importance.' },
    { p: String.raw`With enough data, trivial differences become significant. If Ana weighed 4,000 bags and found a mean of 1,003.9 g, then with <m>\sigma</m> = 3 g, <m>z = -0.1 \div (3 \div \sqrt{4{,}000}) \approx -2.11</m> and p ≈ 0.018: significant at 5%, for a tenth of a gram. In the other direction, a small sample can miss an important effect. Report the estimate and its interval, and judge <g>practical significance</g> by what the difference does to the business.` },
    { p: 'For the bags, practical significance comes through the label. A machine averaging 1,002.75 g with σ = 3 g would put about 18% of bags under 1,000 g, <x>=NORM.DIST(1000,1002.75,3,TRUE)</x>, roughly twice the 9.1% of the specification. A shortfall of 1.25 g is about 0.1% of the coffee in a bag, but it doubles the share of light bags, and light bags are what customers notice.' },

    { h: 'Intervals and tests' },
    { p: 'A two-sided test at level α and a (1 − α) <g>confidence interval</g> are two views of one calculation: a two-sided t test at 5% rejects H₀: μ = μ₀ exactly when μ₀ lies outside the 95% t interval. Ana’s 95% interval for the mean fill is 1,001.90 to 1,003.60 g. Both 1,004 g and 1,000 g lie outside it, so two-sided tests reject both (p = 0.0050 and p &lt; 0.0001), while 1,003 g lies inside and would not be rejected.' },
    { figure: {
      svg: ciFigure(),
      caption: 'Ana’s 95% confidence interval for the mean fill, 1,001.90 to 1,003.60 g. A two-sided t test at 5% rejects any hypothesised mean outside the interval, such as the 1,004 g setting and the 1,000 g label, and no value inside it, such as 1,003 g.',
      alt: 'A horizontal axis from 1,000 g to 1,004 g. A thick bar runs from 1,001.90 to 1,003.60 g with a dot at the mean, 1,002.75 g, labelled 95% interval 1,001.90 to 1,003.60 g. Three vertical markers: at 1,000 g, labelled label 1,000 g, outside: rejected; at 1,003 g, a dashed marker labelled 1,003 g, inside: not rejected; and at 1,004 g, labelled setting 1,004 g, outside: rejected.',
    } },
    { p: 'The interval says more than the test. The machine’s mean is plausibly between 0.40 g and 2.10 g below its setting, which is the range Ana should keep in mind when she judges whether the shortfall matters. A one-sided test at 5% matches a one-sided 95% bound instead: here the mean is below 1,003.46 g with 95% confidence.' },

    { h: 'P-hacking and multiple testing' },
    { p: 'Every test at α = 0.05 has a 5% chance of a false alarm when H₀ is true. Run many tests and false alarms become likely: with 20 independent tests of true nulls, the chance of at least one p ≤ 0.05 is 1 − 0.95²⁰ ≈ 0.64, and one false positive is expected. This is the problem of <g>multiple testing</g>. Testing every metric on a dashboard each month, or every customer segment, will produce “significant” findings that are noise.' },
    { p: '<g>P-hacking</g> is the deliberate or careless version: trying analyses until one gives p below 0.05, and reporting that one. Its common forms are testing many outcomes or subgroups, adding data and retesting until the result crosses the line, dropping awkward values, and choosing one-sided after seeing the data. Each makes the reported p-value smaller than the real chance of a false alarm.' },
    { p: 'In 2016 the American Statistical Association published a statement on p-values (Wasserstein and Lazar) with six principles. In paraphrase, except the fifth, which is quoted:' },
    { ol: [
      'A p-value can show how incompatible the data are with a stated statistical model, such as one in which H₀ is true.',
      'P-values do not measure the probability that the studied hypothesis is true, or the probability that the data arose by chance alone.',
      'Scientific conclusions and business or policy decisions should not rest only on whether a p-value passes a threshold such as 0.05.',
      'Proper inference requires full reporting and transparency: how many hypotheses were explored, which analyses were run and every p-value calculated, not only the significant ones.',
      '“A p-value, or statistical significance, does not measure the size of an effect or the importance of a result.”',
      'By itself a p-value is not a good measure of evidence about a model or hypothesis: a p-value near 0.05 is only weak evidence against the null, and a large p-value is not evidence for it.',
    ] },
    { p: 'The defences are habits. Write down the question, the hypotheses, α and the analysis before looking at the results; report every test you ran; treat a surprising result from one of many tests as a lead to check with new data. When you must test several things at once, make each test stricter: the simplest adjustment, Bonferroni’s, tests each of k hypotheses at α ÷ k, and the anova lesson explains the family-wise error rate behind it.' },
  ],

  formulas: [
    { id: 'ht-z-mean', name: 'z test for a mean (σ known)',
      tex: String.raw`z = \dfrac{\bar{x} - \mu_0}{\sigma / \sqrt{n}}`,
      where: [[String.raw`\bar{x}`, 'Sample mean', 'units of x'], [String.raw`\mu_0`, 'The population mean under the null hypothesis', 'units of x'], [String.raw`\sigma`, 'Known population standard deviation', 'units of x'], [String.raw`n`, 'Sample size', ''], [String.raw`z`, 'Test statistic, compared with the standard normal distribution', '']],
      assumptions: 'A random sample of independent values; σ known; the population roughly normal, or n large enough for the central limit theorem.',
      note: 'Excel: Z.TEST(array, μ₀, σ) returns 1 − NORM.S.DIST(z, TRUE), the upper-tail p-value only.' },
    { id: 'ht-t-mean', name: 'One-sample t test for a mean',
      tex: String.raw`t = \dfrac{\bar{x} - \mu_0}{s / \sqrt{n}}, \qquad \text{df} = n - 1`,
      where: [[String.raw`\bar{x}`, 'Sample mean', 'units of x'], [String.raw`\mu_0`, 'The population mean under the null hypothesis', 'units of x'], [String.raw`s`, 'Sample standard deviation (STDEV.S)', 'units of x'], [String.raw`n`, 'Sample size', ''], [String.raw`t`, 'Test statistic, compared with the t distribution', ''], [String.raw`\text{df}`, 'Degrees of freedom', '']],
      assumptions: 'A random sample of independent values from a roughly normal population; for larger n, moderate skew is tolerable.',
      note: 'Excel has no one-sample T.TEST: compute t, then T.DIST, T.DIST.RT or T.DIST.2T.' },
    { id: 'ht-z-prop', name: 'One-proportion z test',
      tex: String.raw`z = \dfrac{\hat{p} - p_0}{\sqrt{p_0 (1 - p_0) / n}}`,
      where: [[String.raw`\hat{p}`, 'Sample proportion: successes ÷ trials', ''], [String.raw`p_0`, 'The proportion under the null hypothesis', ''], [String.raw`n`, 'Number of trials', ''], [String.raw`z`, 'Test statistic, compared with the standard normal distribution', '']],
      assumptions: 'Independent trials with the same probability; np₀ and n(1 − p₀) at least 10.',
      note: 'The standard error uses p₀, not p̂: the test works out how p̂ would vary if the null were true.' },
    { id: 'ht-p', name: 'The p-value for each alternative',
      tex: String.raw`\text{lower: } \Pr(T \le t), \qquad \text{upper: } \Pr(T \ge t), \qquad \text{two-sided: } 2\Pr(T \ge |t|)`,
      where: [[String.raw`T`, 'The statistic’s distribution if the null hypothesis is true (t with n − 1 df, or the standard normal)', ''], [String.raw`t`, 'The statistic calculated from the sample', '']],
      note: 'Excel: T.DIST(t, df, TRUE), T.DIST.RT(t, df) and T.DIST.2T(ABS(t), df); NORM.S.DIST(z, TRUE) for z.' },
    { id: 'ht-power', name: 'Power of a one-sided z test',
      tex: String.raw`1 - \beta = \Phi\!\left(\dfrac{|\delta|}{\sigma/\sqrt{n}} - z_{1-\alpha}\right)`,
      where: [[String.raw`1 - \beta`, 'Power: the probability of rejecting the null when the true difference is δ', ''], [String.raw`\delta`, 'True mean minus the null value', 'units of x'], [String.raw`\sigma`, 'Population standard deviation', 'units of x'], [String.raw`n`, 'Sample size', ''], [String.raw`z_{1-\alpha}`, 'Standard normal value with α above it (1.645 for α = 0.05)', ''], [String.raw`\Phi`, 'Standard normal cumulative probability, NORM.S.DIST(…, TRUE)', '']],
      assumptions: 'The effect lies in the direction tested.',
      note: 'For a two-sided test use z₁₋α/₂ (1.96 for α = 0.05); the tiny chance of rejecting in the wrong tail is ignored.' },
    { id: 'ht-n-power', name: 'Sample size for a chosen power',
      tex: String.raw`n = \left(\dfrac{(z_{1-\alpha} + z_{1-\beta})\,\sigma}{\delta}\right)^{2}`,
      where: [[String.raw`n`, 'Sample size needed, rounded up', ''], [String.raw`z_{1-\alpha}`, 'Standard normal value for the significance level (z₁₋α/₂ if two-sided)', ''], [String.raw`z_{1-\beta}`, 'Standard normal value for the power (0.842 for 80%)', ''], [String.raw`\sigma`, 'Planning value of the standard deviation', 'units of x'], [String.raw`\delta`, 'Smallest difference worth detecting', 'units of x']],
      note: 'With a t test, recalculate once with t values for n − 1 degrees of freedom (NIST/SEMATECH 7.2.2.2).' },
    { id: 'ht-fwer', name: 'Chance of at least one false alarm in k tests',
      tex: String.raw`\Pr(\text{at least one false alarm}) = 1 - (1 - \alpha)^{k}`,
      where: [[String.raw`\alpha`, 'Significance level of each test', ''], [String.raw`k`, 'Number of independent tests, each of a true null hypothesis', '']],
      note: 'Bonferroni’s adjustment tests each at α ÷ k, which keeps this chance at or below α.' },
  ],

  examples: [
    { level: 'simple', title: 'A two-sided t test: cleaning times at a hotel', fictional: true,
      setup: 'Oakhaven Hotel’s housekeeping rota allows 30 minutes to clean a room, the average with its old cleaning trolley. In a trial of a new cleaning trolley, a supervisor timed 12 rooms chosen at random over a week (minutes): 27, 32, 25, 29, 24, 31, 28, 34, 27, 25, 29 and 30, in B2:B13. Test at α = 0.05 whether the mean time with the new trolley differs from 30 minutes.',
      steps: [
        'Hypotheses, set before timing anything: H₀: μ = 30 minutes, H₁: μ ≠ 30 minutes. Two-sided, because a slower trolley would break the rota and a faster one would free staff; either would change the plan.',
        'Conditions: the rooms were chosen at random and timed separately, and the 12 times show no outlier and no strong skew (median 28.5, mean 28.42), so a t test is reasonable for this small sample.',
        String.raw`Statistic: <x>=AVERAGE(B2:B13)</x> = 28.42 and <x>=STDEV.S(B2:B13)</x> = 3.029, so SE <m>= 3.029 \div \sqrt{12} = 0.874</m> and <m>t = (28.42 - 30) \div 0.874 \approx -1.81</m>, with 11 degrees of freedom.`,
        'P-value, two-sided: <x>=T.DIST.2T(ABS(-1.811),11)</x> = 0.098. Equivalently, |t| = 1.81 is below the critical value <x>=T.INV.2T(0.05,11)</x> = 2.201.',
        String.raw`Decision: 0.098 &gt; 0.05, so fail to reject H₀. The 95% interval, <m>28.417 \pm 2.201 \times 0.874</m>, runs from 26.49 to 30.34 minutes and includes 30.`,
      ],
      answer: 'Fail to reject H₀ at the 5% level: t ≈ −1.81 with 11 df, two-sided p ≈ 0.098; 95% interval 26.49 to 30.34 minutes.',
      interpretation: 'The trial gives no convincing evidence that the trolley changes cleaning time, which is not the same as showing it has no effect: the interval allows anything from a saving of about 3.5 minutes a room to an extra 0.3 minutes. A one-sided test would have given p = 0.049, but the supervisor chose two-sided before timing anything, and switching now because the data happened to fall low would turn a 5% test into a 10% one. A larger trial would pin the effect down.' },
    { level: 'challenging', title: 'How many bags should Ana weigh?', fictional: true,
      setup: 'Kilnworth agrees to recalibrate the machine, and Ana will check the next delivery. She wants an 80% chance of detecting a 1 g underfill (a true mean of 1,003 g) with a one-sided test at α = 0.05, taking σ = 3 g from the specification. Did her 40 bags have that power? How many bags does 80% power need, how many for a two-sided test, and how many to detect a 0.5 g underfill?',
      steps: [
        String.raw`Power with 40 bags: SE <m>= 3 \div \sqrt{40} = 0.474</m> g, so the true mean is <m>1 \div 0.474 = 2.11</m> standard errors below 1,004 g, and power <m>= \Phi(2.11 - 1.645) = \Phi(0.463) \approx 0.678</m>: <x>=NORM.S.DIST(1/(3/SQRT(40))-NORM.S.INV(0.95),TRUE)</x>. So β ≈ 0.32, and about one check in three would miss a real 1 g underfill.`,
        String.raw`80% power, one-sided: <m>z_{0.95} = 1.6449</m> and <m>z_{0.80} = 0.8416</m>, so <m>n = ((1.6449 + 0.8416) \times 3 \div 1)^2 = 7.4594^2 \approx 55.64</m>, rounded up to 56 bags.`,
        String.raw`Two-sided at 5%: replace 1.6449 with 1.9600: <m>n = ((1.9600 + 0.8416) \times 3)^2 \approx 70.64</m>, so 71 bags. A two-sided test splits α between the tails, so it needs more data for the same power in one direction.`,
        String.raw`A 0.5 g underfill: halving <m>\delta</m> quadruples n, <m>((1.6449 + 0.8416) \times 3 \div 0.5)^2 \approx 222.6</m>, so 223 bags; 40 bags would catch it only 28% of the time.`,
        'With the t test Ana will actually run, the NIST handbook’s one iteration, using t values with 55 degrees of freedom (from n = 56), gives n ≈ 57.2, so 58 bags: a little more than the normal approximation.',
      ],
      answer: 'Her 40 bags had about 68% power for a 1 g underfill. 80% power needs 56 bags one-sided (58 with the t iteration), 71 two-sided, and 223 to detect 0.5 g.',
      interpretation: 'Power is planned from the smallest difference worth catching. A 1 g underfill matters to Ana because it raises the share of bags under the label from 9.1% to about 16%, so she decides to weigh 60 bags next time. Detecting 0.5 g would mean weighing more than 200 bags a delivery, more effort than that difference is worth to her. A test too small to detect the difference that matters wastes the effort spent on it, so plan n before collecting.' },
    { level: 'applied', title: 'Did September’s conversion really fall short?', fictional: true,
      setup: 'B01’s figures for the whole shop, web and app together, which is the basis of Ana’s 3.0% conversion target. In September, the month after the website’s checkout redesign of 1 September, the shop took 251 orders from 11,400 visits (2.20%). In October, when a fix for a payment-page bug on mobile browsers was released on 5 October, it took 319 orders from 11,000 visits (2.90%). For each month, test at α = 0.05 whether the shop’s conversion rate was below 3.0%, and say what the results do and don’t tell her.',
      steps: [
        'Hypotheses (the same for both months): H₀: p = 0.030 and H₁: p &lt; 0.030, where p is the month’s underlying conversion rate per visit. One-sided, because Ana’s question is whether the month fell short.',
        'Conditions: for September np₀ = 11,400 × 0.03 = 342 and n(1 − p₀) = 11,058, for October 330 and 10,670, all far above 10. Visits are treated as independent trials, which repeat visitors make only approximately true.',
        String.raw`September: <m>\hat{p} = 251 \div 11{,}400 = 0.022018</m>; the standard error under H₀ is <m>\sqrt{0.03 \times 0.97 \div 11{,}400} = 0.0015977</m>; <m>z = (0.022018 - 0.030) \div 0.0015977 \approx -5.00</m>; p = <x>=NORM.S.DIST(-4.996,TRUE)</x> ≈ 2.9 × 10⁻⁷.`,
        String.raw`October: <m>\hat{p} = 319 \div 11{,}000 = 0.0290</m>; the standard error is <m>\sqrt{0.03 \times 0.97 \div 11{,}000} = 0.0016265</m>; <m>z = (0.0290 - 0.030) \div 0.0016265 \approx -0.61</m>; p = <x>=NORM.S.DIST(-0.615,TRUE)</x> ≈ 0.27.`,
        'Decisions: reject H₀ for September; fail to reject H₀ for October.',
      ],
      answer: 'September: z ≈ −5.00 and p ≈ 2.9 × 10⁻⁷, strong evidence that the shop’s conversion rate was below 3.0%. October: z ≈ −0.61 and p ≈ 0.27, no evidence that it was below target.',
      interpretation: 'October’s 2.90% is the kind of miss a month of 11,000 visits produces by chance even when the true rate is 3.0%, so on its own it is no warning sign; the data are compatible with the shop being back on target after the fix. September’s fall is far too large for chance. The test doesn’t say why: the checkout redesign is the obvious suspect, but B01’s warning about <g>causation</g> applies, and the formal comparison of the website’s August and September is the two-proportion test in the proportions-and-chi-square lesson.' },
  ],

  demo: [
    { widget: 'ht-curve', intro: 'The t distribution with 39 degrees of freedom, with Ana’s statistic t = −2.976 and the 5% rejection region in the lower tail. Switch to “Both tails” to see the two-sided p-value, 0.0050, and compare the dashed standard normal curve, whose tails are thinner.' },
    { widget: 'ht-sheet', intro: 'Ana’s 40 bags with the whole test written as formulas. Change the hypothesised mean in E1 to 1000, then to 1003, and watch t, the three p-values and Z.TEST move while the 95% interval stays put; 1,003 g lies inside it, so no test rejects it at 5%. Turn on Show formulas to see T.DIST, T.DIST.RT, T.DIST.2T and Z.TEST.' },
    { widget: 'ht-power', intro: 'The distribution of the sample mean if the machine averages 1,004 g (H₀) and if it really averages 1,003 g, with σ = 3 g. Raise n to 56 to reach 80% power, shrink the true difference to 0.5 g, or change α and the alternative, and watch α, β and the power trade off.' },
  ],

  mistakes: [
    { title: '“p = 0.0025, so there is a 0.25% chance the machine is fine.”', html: 'The p-value is calculated assuming the machine is fine: it is the chance of data at least this extreme in that world, not the chance of that world given the data. The ASA’s second principle says exactly this. To put a probability on a hypothesis you need Bayes’ rule and prior probabilities, which a test doesn’t use.' },
    { title: '“We failed to reject H₀, so the trolley makes no difference.”', html: 'Failing to reject means the data are compatible with no difference; they may be compatible with a useful difference too. Oakhaven’s interval runs from a saving of 3.5 minutes to an extra 0.3: that is a lack of evidence, not evidence of no effect. Report the interval and, if it matters, the power.' },
    { title: '“<x>=Z.TEST(B2:B41,1004,3)</x> is 0.9958, so there is no evidence of underfilling.”', html: 'Z.TEST always returns the upper-tail p-value. For a lower-tail alternative the p-value is <x>=1-Z.TEST(B2:B41,1004,3)</x> = 0.0042; for two-sided, <x>=2*MIN(Z.TEST(…),1-Z.TEST(…))</x>. Check which tail every function reports before you read its result.' },
    { title: '“Two-sided p is 0.098, but one-sided it’s 0.049, so it’s significant.”', html: 'The side belongs to the question and must be fixed before the data are seen. Choosing it afterwards, in whichever direction the data fell, doubles the real false-alarm rate. Halving a two-sided p-value is legitimate only for a one-sided question stated in advance.' },
    { title: '“Significant, so it matters.”', html: 'With 4,000 bags a 0.1 g shortfall would be significant and meaningless. Significance says an effect is unlikely to be chance alone; its size, its interval and its consequences (here, the share of bags under the label) say whether it matters.' },
    { title: '“We tested 20 product lines and one was significant: we found something.”', html: 'With 20 tests of true nulls at 5%, one false positive is expected and the chance of at least one is about 64%. Report all 20 tests, treat the one as a lead to check with new data, or test each at a stricter level such as α ÷ 20.' },
  ],

  application: [
    { case: 'Ana writes to Kilnworth: “In October I weighed 40 of your 1 kg House Blend bags. They averaged 1,002.75 g (95% confidence interval 1,001.90 to 1,003.60 g), about 1.25 g below your stated 1,004 g setting; a one-sided t test gives p = 0.0025, so a shortfall this large is very unlikely to be chance. The average is still above 1,000 g, but 5 of the 40 bags were under the label. Could you check the machine’s setting? I will weigh 60 bags from the next delivery to confirm.” She keeps the spreadsheet, so that the next check is run the same way.' },
    { p: 'Notice what she leaves out. She doesn’t say the machine is proven faulty, or that there is a 99.75% chance it is: neither follows from a p-value. She reports the estimate, the interval and the p-value together, plans a check with enough power to confirm the finding, and asks a question rather than making an accusation. The test shows the bags are light on average; it doesn’t show why, and a test about the mean says nothing directly about individual bags, which is why she mentions the five under the label.' },
    { p: 'The same pattern runs through business uses of testing: checks against a specification, a month’s KPI against its target, before-and-after comparisons and A/B tests. Good practice is the same in each. State the hypotheses and α in advance, setting α from the costs of each error; plan the sample size from the smallest difference that matters; check the conditions; report the estimate, its interval and the p-value; and treat p-values near α as weak evidence that deserves a second look with new data.' },
    { p: 'Targets need one more caution. A target is a goal, not a fact about the world, so testing a month against it asks only whether the shortfall is larger than chance would produce. October’s conversion was 0.1 points below 3.0% with p = 0.27, which is noise; September’s was 0.8 points below with a p-value near zero, which is not. A dashboard that turns every month below target red, without asking how big a miss chance alone produces, will send Ana chasing noise.' },
  ],

  summary: [
    'A test assumes the null hypothesis H₀ (the specification, the target, no difference) and asks how surprising the data would be; the alternative H₁ is what needs evidence. Choose one- or two-sided, and α, before seeing the data.',
    't = (x̄ − μ₀) ÷ (s ÷ √n) with n − 1 degrees of freedom; a z test uses a known σ; for a proportion, z = (p̂ − p₀) ÷ √(p₀(1 − p₀) ÷ n).',
    'The p-value is the probability, if H₀ is true, of a statistic at least as extreme as the one observed: <x>=T.DIST(t,df,TRUE)</x>, <x>=T.DIST.RT(t,df)</x> or <x>=T.DIST.2T(ABS(t),df)</x>. Reject H₀ when p ≤ α, or when the statistic is beyond the critical value.',
    'Z.TEST returns the upper-tail p-value only: use 1 − Z.TEST for a lower-tail alternative and 2 × MIN(Z.TEST, 1 − Z.TEST) for two-sided.',
    'A p-value is not the probability that H₀ is true; failing to reject is not accepting; significance is not importance.',
    'A Type I error rejects a true H₀ (probability α); a Type II error misses a real effect (β). Power, 1 − β, rises with n, the true difference and α, and falls with σ: plan n from the smallest difference that matters.',
    'A two-sided test at 5% rejects μ₀ exactly when μ₀ lies outside the 95% interval; report the interval with the p-value.',
    'Many tests make false alarms likely (64% for 20 tests at 5%): fix the analysis in advance, report every test, and confirm surprises with new data.',
  ],

  glossary: [
    { term: 'Null hypothesis', def: 'In a hypothesis test, the statement assumed true while the test is calculated, usually “no difference” or “as specified”. It contains an equality (=, ≤ or ≥) and is written H₀.' },
    { term: 'Alternative hypothesis', def: 'The statement a hypothesis test looks for evidence for, contradicting the null hypothesis. It contains &lt;, &gt; or ≠ and is written H₁ (or Hₐ).' },
    { term: 'Test statistic', def: 'A number calculated from the sample that measures how far the data lie from what the null hypothesis predicts, usually in standard errors: z, t, χ² or F.' },
    { term: 'Significance level', def: 'The probability of rejecting a true null hypothesis that a test is designed to allow, chosen before the data are seen; written α, often 0.05.' },
    { term: 'Critical value', def: 'A value of a test statistic’s distribution that cuts off a chosen tail area. A test rejects the null hypothesis when the statistic lies beyond it; a confidence interval uses it as its multiplier (1.96 for a 95% z interval).' },
    { term: 'Rejection region', def: 'The values of the test statistic for which the null hypothesis is rejected at the chosen significance level: those beyond the critical value or values.' },
    { term: 'One-sided test', def: 'A hypothesis test whose alternative points in one direction (&lt; or &gt;), so the p-value comes from one tail. Also called a one-tailed test.' },
    { term: 'Two-sided test', def: 'A hypothesis test whose alternative is ≠, so values far from the null in either direction count as evidence and the p-value comes from both tails. Also called a two-tailed test.' },
    { term: 'z test', def: 'A test whose statistic follows the standard normal distribution if the null hypothesis is true: for a mean with a known population standard deviation, z = (x̄ − μ₀) ÷ (σ ÷ √n).' },
    { term: 'One-sample t test', def: 'A test of whether a population mean equals a stated value, using t = (x̄ − μ₀) ÷ (s ÷ √n) and the t distribution with n − 1 degrees of freedom.' },
    { term: 'One-proportion z test', def: 'A test of whether a population proportion equals a stated value p₀, using z = (p̂ − p₀) ÷ √(p₀(1 − p₀) ÷ n) and the standard normal distribution.' },
    { term: 'Type I error', def: 'Rejecting a null hypothesis that is true: a false alarm. Its probability, when the null is true, is the significance level α.' },
    { term: 'Type II error', def: 'Failing to reject a null hypothesis that is false: a missed effect. Its probability, β, depends on how far the truth is from the null.' },
    { term: 'Power', def: 'The probability that a test rejects the null hypothesis when a particular alternative is true, 1 − β. It rises with the sample size, the true difference and the significance level, and falls as the spread grows.' },
    { term: 'Statistically significant', def: 'Describes a result whose p-value is at or below the chosen significance level, so it is unlikely under the null hypothesis. It says nothing about whether the effect is large or important.' },
    { term: 'Practical significance', def: 'Whether an effect is large enough to matter for a decision, judged from its estimated size and interval in the units of the problem, not from its p-value.' },
    { term: 'Multiple testing', def: 'Running many hypothesis tests on the same data or question, which makes at least one false alarm likely even when every null hypothesis is true.' },
    { term: 'P-hacking', def: 'Trying analyses (outcomes, subgroups, exclusions, stopping points, one tail or two) until one gives a significant p-value and reporting that one, which makes the reported p-value misleadingly small.' },
  ],

  references: [
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Business Statistics 2e</i>, chapter 9, “Hypothesis Testing with One Sample” (sections 9.1–9.4). OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics/pages/9-2-outcomes-and-the-type-i-and-type-ii-errors', checked: '2026-10-24' },
    { text: 'Wasserstein, R. L. &amp; Lazar, N. A. (2016). “The ASA’s statement on p-values: context, process, and purpose”. <i>The American Statistician</i>, 70(2), 129–133.', url: 'https://doi.org/10.1080/00031305.2016.1154108', checked: '2026-10-24' },
    { text: 'Microsoft Support. “Z.TEST function”.', url: 'https://support.microsoft.com/en-US/excel/functions/z-test-function', checked: '2026-10-24' },
    { text: 'Microsoft Support. “T.DIST function”.', url: 'https://support.microsoft.com/en-US/excel/functions/t-dist-function', checked: '2026-10-24' },
    { text: 'Microsoft Support. “T.DIST.2T function”.', url: 'https://support.microsoft.com/en-US/excel/functions/t-dist-2t-function', checked: '2026-10-24' },
    { text: 'Microsoft Support. “T.INV.2T function”.', url: 'https://support.microsoft.com/en-US/excel/functions/t-inv-2t-function', checked: '2026-10-24' },
    { text: 'NIST/SEMATECH. <i>e-Handbook of Statistical Methods</i>, sections 7.2.2, “Are the data consistent with the assumed process mean?”, and 7.2.2.2, “Sample sizes required”.', url: 'https://itl.nist.gov/div898/handbook/prc/section2/prc222.htm', checked: '2026-10-24' },
  ],

  checks: [
    // the case and the t test
    { what: 'Bags weighed', value: n, shown: 40 },
    { what: 'Setting', value: K.setting, shown: 1004 },
    { what: 'Specification SD', value: K.sd, shown: 3 },
    { what: 'Label', value: K.label, shown: 1000 },
    { what: 'Share under label if machine runs as specified (%)', value: KG.pUnderSpec * 100, shown: 9.1, tol: 0.05 },
    { what: 'Mean of 40 bags', value: xbar, shown: 1002.75 },
    { what: 'Bags under 1,000 g', value: KG.underLabel, shown: 5 },
    { what: 'Shortfall from setting', value: K.setting - xbar, shown: 1.25 },
    { what: 'Sample SD (4 dp)', value: s, shown: 2.6563, tol: 0.00005 },
    { what: 'Sample SD (2 dp)', value: s, shown: 2.66 },
    { what: 'Standard error s/√n', value: se, shown: 0.4200, tol: 0.00005 },
    { what: 'Engine and case agree on t', value: T.t, shown: (xbar - K.setting) / se, tol: 1e-9 },
    { what: 't against the setting', value: T.t, shown: -2.98 },
    { what: 't to three decimals (Excel formula)', value: T.t, shown: -2.976, tol: 0.0005 },
    { what: 'Degrees of freedom', value: T.df, shown: 39 },
    { what: 'One-sided p-value', value: T.p, shown: 0.0025, tol: 0.00005 },
    { what: 'T.DIST(-2.976,39,TRUE)', value: I.tCdf(-2.976, 39), shown: 0.0025, tol: 0.00005 },
    { what: 'About 1 sample in 400', value: 1 / T.p, shown: 400, tol: 5 },
    { what: 'Reject at 0.05', value: Number(T.p <= 0.05), shown: 1 },
    { what: 'Two-sided p against setting', value: T2.p, shown: 0.0050, tol: 0.00005 },
    { what: 'T.DIST.2T(2.976,39)', value: 2 * I.tSf(2.976, 39), shown: 0.0050, tol: 0.00005 },
    { what: 'Two-sided p is twice one-sided', value: T2.p / T.p, shown: 2, tol: 1e-9 },
    { what: 'Normal-curve p for t = −2.98', value: I.normCdf(T.t), shown: 0.0015, tol: 0.00005 },
    { what: 'CI lower', value: CI.low, shown: 1001.90 },
    { what: 'CI upper', value: CI.high, shown: 1003.60 },
    { what: 'CI from the two-sided t test', value: T2.low, shown: CI.low, tol: 1e-9 },
    // z test
    { what: 'z standard error 3/√40', value: seZ, shown: 0.4743, tol: 0.00005 },
    { what: 'z standard error (3 dp)', value: seZ, shown: 0.474, tol: 0.0005 },
    { what: 'z statistic', value: Z.z, shown: -2.64 },
    { what: 'z statistic (3 dp, Excel)', value: Z.z, shown: -2.635, tol: 0.0005 },
    { what: 'z test p (lower)', value: Z.p, shown: 0.0042, tol: 0.00005 },
    { what: 'NORM.S.DIST(-2.635,TRUE)', value: I.normCdf(-2.635), shown: 0.0042, tol: 0.00005 },
    { what: 'Z.TEST(B2:B41,1004,3) as Microsoft defines it', value: zTestXl, shown: 0.9958, tol: 0.00005 },
    { what: '1 − Z.TEST equals the z test p', value: 1 - zTestXl, shown: Z.p, tol: 1e-9 },
    { what: 'Z.TEST two-sided', value: 2 * Math.min(zTestXl, 1 - zTestXl), shown: 0.0084, tol: 0.00005 },
    // critical values
    { what: 'T.INV(0.05,39)', value: tCritLow, shown: -1.685 },
    { what: 'T.INV.2T(0.05,39)', value: tCrit2, shown: 2.023 },
    { what: 'z one-sided 5%', value: z95, shown: 1.645 },
    { what: 'z two-sided 5%', value: z975, shown: 1.96 },
    { what: 't = −1.70 is beyond −1.685', value: Number(-1.70 < tCritLow), shown: 1 },
    { what: 't = −1.70 happens about 1 time in 20', value: 1 / I.tCdf(-1.70, 39), shown: 20, tol: 1 },
    { what: 'n − 1 from the figure', value: n - 1, shown: 39 },
    // the label test
    { what: 'Two-sided p against label below 0.0001', value: Number(TL2.p < 0.0001), shown: 1 },
    { what: 'One-sided p against label below 0.0001', value: Number(TL.p < 0.0001), shown: 1 },
    { what: '1,003 g inside the interval', value: Number(1003 > CI.low && 1003 < CI.high), shown: 1 },
    { what: '1,003 g not rejected two-sided', value: Number(I.tTest1(KG_BAGS, 1003).p > 0.05), shown: 1 },
    { what: 'Shortfall plausibly from (g)', value: K.setting - CI.high, shown: 0.40 },
    { what: 'Shortfall plausibly to (g)', value: K.setting - CI.low, shown: 2.10 },
    { what: 'One-sided 95% upper bound', value: oneSidedUpper, shown: 1003.46 },
    // conversion
    { what: 'September shop orders', value: SH.sep.orders, shown: 251 },
    { what: 'September shop visits', value: SH.sep.visits, shown: 11400 },
    { what: 'September shop conversion (%)', value: D.conversion.shop.sep * 100, shown: 2.20 },
    { what: 'Target (%)', value: CONVERSION.target * 100, shown: 3.0 },
    { what: 'Target is B01’s', value: TARGETS.conversion, shown: 3.0 },
    { what: 'Shop is web plus app (September visits)', value: SHOP.webVisits[2] + SHOP.appVisits[2], shown: SH.sep.visits, tol: 1e-9 },
    { what: 'September p-hat', value: SEP.p, shown: 0.022018, tol: 0.0000005 },
    { what: 'September SE under H0', value: SEP.se0, shown: 0.0015977, tol: 0.00000005 },
    { what: 'September SE from formula', value: se0(SH.sep.visits), shown: SEP.se0, tol: 1e-12 },
    { what: 'September z', value: SEP.z, shown: -5.00 },
    { what: 'September z (3 dp, Excel)', value: SEP.z, shown: -4.996, tol: 0.0005 },
    { what: 'September z from the printed rounded values', value: (0.022018 - 0.03) / 0.0015977, shown: -5.00 },
    { what: 'September p (× 1E7)', value: SEP.pValue * 1e7, shown: 2.9, tol: 0.05 },
    { what: 'September n p0', value: SH.sep.visits * CONVERSION.target, shown: 342 },
    { what: 'September n(1 − p0)', value: SH.sep.visits * (1 - CONVERSION.target), shown: 11058 },
    { what: 'October shop orders', value: SH.oct.orders, shown: 319 },
    { what: 'October shop visits', value: SH.oct.visits, shown: 11000 },
    { what: 'October shop conversion (%)', value: D.conversion.shop.oct * 100, shown: 2.90 },
    { what: 'October p-hat', value: OCT.p, shown: 0.0290, tol: 0.00005 },
    { what: 'October SE', value: OCT.se0, shown: 0.0016265, tol: 0.00000005 },
    { what: 'October z', value: OCT.z, shown: -0.61 },
    { what: 'October z (3 dp, Excel)', value: OCT.z, shown: -0.615, tol: 0.0005 },
    { what: 'October z from the printed rounded values', value: (0.0290 - 0.03) / 0.0016265, shown: -0.61 },
    { what: 'October p', value: OCT.pValue, shown: 0.27 },
    { what: 'October n p0', value: SH.oct.visits * CONVERSION.target, shown: 330 },
    { what: 'October n(1 − p0)', value: SH.oct.visits * (1 - CONVERSION.target), shown: 10670 },
    { what: 'October miss (percentage points)', value: (CONVERSION.target - D.conversion.shop.oct) * 100, shown: 0.1, tol: 0.005 },
    { what: 'September miss (percentage points)', value: (CONVERSION.target - D.conversion.shop.sep) * 100, shown: 0.8, tol: 0.05 },
    { what: 'September p-value near zero', value: Number(SEP.pValue < 1e-6), shown: 1 },
    // power
    { what: 'True mean in the power example', value: K.setting - 1, shown: 1003 },
    { what: 'Standard errors from the null', value: 1 / seZ, shown: 2.11 },
    { what: 'Phi argument', value: 1 / seZ - z95, shown: 0.46, tol: 0.005 },
    { what: 'Phi argument (3 dp)', value: 1 / seZ - z95, shown: 0.463, tol: 0.0005 },
    { what: 'Power, 1 g, n = 40', value: pw(-1), shown: 0.68 },
    { what: 'Power, 1 g, n = 40 (3 dp)', value: pw(-1), shown: 0.678, tol: 0.0005 },
    { what: 'Power formula agrees with engine', value: I.normCdf(1 / seZ - z95), shown: pw(-1), tol: 1e-9 },
    { what: 'Beta, 1 g', value: 1 - pw(-1), shown: 0.32 },
    { what: 'About two times in three', value: pw(-1) * 3, shown: 2, tol: 0.05 },
    { what: 'Power, 0.5 g (%)', value: pw(-0.5) * 100, shown: 28, tol: 0.5 },
    { what: 'Power, 2 g (%)', value: pw(-2) * 100, shown: 99, tol: 0.5 },
    { what: 'z 0.80', value: z80, shown: 0.842 },
    { what: '(1.645 + 0.842) × 3', value: (z95 + z80) * K.sd, shown: 7.46 },
    { what: 'n raw, one-sided 1 g', value: nRaw1, shown: 55.64, tol: 0.005 },
    { what: 'z 0.95 (4 dp)', value: z95, shown: 1.6449, tol: 0.00005 },
    { what: 'z 0.80 (4 dp)', value: z80, shown: 0.8416, tol: 0.00005 },
    { what: 'z 0.975 (4 dp)', value: z975, shown: 1.9600, tol: 0.00005 },
    { what: '(z95 + z80) × 3 (4 dp)', value: (z95 + z80) * K.sd, shown: 7.4594, tol: 0.00005 },
    { what: 'n for 80%, one-sided 1 g', value: nFor(1), shown: 56 },
    { what: 'n raw, two-sided 1 g', value: nRaw2, shown: 70.64, tol: 0.005 },
    { what: 'n for 80%, two-sided 1 g', value: nFor(1, 'two-sided'), shown: 71 },
    { what: 'n raw, 0.5 g', value: nRawHalf, shown: 222.6, tol: 0.05 },
    { what: 'n for 80%, 0.5 g', value: nFor(0.5), shown: 223 },
    { what: 'Halving delta quadruples n', value: nRawHalf / nRaw1, shown: 4, tol: 1e-9 },
    { what: 't iteration df', value: nFor(1) - 1, shown: 55 },
    { what: 't iteration n', value: nT, shown: 57.2, tol: 0.05 },
    { what: 't iteration n rounded up', value: Math.ceil(nT), shown: 58 },
    { what: 't iteration adds a bag or two', value: Math.ceil(nT) - nFor(1), shown: 2 },
    { what: 'Ana plans 60 bags (at least the t-iteration n)', value: Number(60 >= Math.ceil(nT)), shown: 1 },
    { what: 'Two-sided needs more than one-sided', value: Number(nFor(1, 'two-sided') > nFor(1)), shown: 1 },
    // practical significance
    { what: 'Big-sample z', value: bigZ, shown: -2.11 },
    { what: 'Big-sample p', value: I.normCdf(bigZ), shown: 0.018, tol: 0.0005 },
    { what: 'Under label if mean 1,002.75, sd 3 (%)', value: underIfLight * 100, shown: 18, tol: 0.5 },
    { what: 'Roughly twice the specification share', value: underIfLight / KG.pUnderSpec, shown: 2, tol: 0.05 },
    { what: 'Under label if the machine averages 1,003 g (%)', value: I.normal.cdf(1000, 1003, 3) * 100, shown: 16, tol: 0.5 },
    { what: 'z test is less significant: σ > s', value: Number(K.sd > s && Z.p > T.p), shown: 1 },
    { what: 'Shortfall in z standard errors', value: (K.setting - xbar) / seZ, shown: 2.64 },
    { what: 'Shortfall in t standard errors', value: (K.setting - xbar) / se, shown: 2.98 },
    { what: 'Shortfall share of a kilogram (%)', value: (K.setting - xbar) / 1000 * 100, shown: 0.1, tol: 0.05 },
    // multiple testing
    { what: 'FWER for 20 tests', value: 1 - 0.95 ** 20, shown: 0.64 },
    { what: 'Expected false positives in 20 tests', value: 20 * 0.05, shown: 1, tol: 1e-9 },
    // Oakhaven
    { what: 'Rooms timed', value: HOTEL.length, shown: 12 },
    { what: 'Hotel mean', value: mean(HOTEL), shown: 28.42 },
    { what: 'Hotel median', value: median(HOTEL), shown: 28.5 },
    { what: 'Hotel SD', value: sd(HOTEL), shown: 3.03 },
    { what: 'Hotel SD (3 dp)', value: sd(HOTEL), shown: 3.029, tol: 0.0005 },
    { what: 'Hotel mean (3 dp)', value: mean(HOTEL), shown: 28.417, tol: 0.0005 },
    { what: 'Hotel SE from printed SD', value: 3.029 / Math.sqrt(12), shown: 0.874, tol: 0.0005 },
    { what: 'Hotel CI lower from printed values', value: 28.417 - 2.201 * 0.874, shown: 26.49 },
    { what: 'Hotel SE', value: H.se, shown: 0.874, tol: 0.0005 },
    { what: 'Hotel t', value: H.t, shown: -1.81 },
    { what: 'Hotel t (3 dp, Excel)', value: H.t, shown: -1.811, tol: 0.0005 },
    { what: 'Hotel df', value: H.df, shown: 11 },
    { what: 'Hotel two-sided p', value: H.p, shown: 0.098, tol: 0.0005 },
    { what: 'Hotel critical value', value: hCrit, shown: 2.201 },
    { what: 'Hotel CI lower', value: H.low, shown: 26.49 },
    { what: 'Hotel CI upper', value: H.high, shown: 30.34 },
    { what: 'Hotel one-sided p', value: H1.p, shown: 0.049, tol: 0.0005 },
    { what: 'Saving up to about 3.5 minutes', value: 30 - H.low, shown: 3.5, tol: 0.05 },
    { what: 'Extra up to about 0.3 minutes', value: H.high - 30, shown: 0.3, tol: 0.05 },
  ],
};
