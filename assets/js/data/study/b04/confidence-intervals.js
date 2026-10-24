// confidence-intervals.js — B04 · Confidence intervals. Content only; exercises are in confidence-intervals.ex.js.
// Uses the 24 catering set-up times (SETUP_MINUTES; DERIVED.setup), Ana's 40 bags with Kilnworth's specified SD
// (KG_BAGS, KILNWORTH_1KG; DERIVED.kg.ci) and B01's September survey (SURVEY; DERIVED.survey). Sample sizes are planned
// for set-up times and for a fictional gym survey, not for the 2027 customer survey, which is the project's. Tests, and
// the link between a two-sided test and an interval, are Module 3's. Every figure printed is recomputed in `checks`.
import { SETUP_MINUTES, KG_BAGS, KILNWORTH_1KG as K, SURVEY, ORDER_VALUES, DERIVED as D } from './case.js?v=12';
import * as I from '../../../core/inference.js?v=12';
import { mean, median, skewness } from '../../../core/stats.js?v=12';
import { mulberry32 } from '../../../core/rng.js?v=12';

// ---------------------------------------------------------------- the figures the lesson quotes
const S = D.setup;                                    // t interval for the set-up times
const tCrit = (conf, df) => I.tInv(1 - (1 - conf) / 2, df);
const z975 = I.normInv(0.975);
const KZ = I.ciMeanZ(KG_BAGS, K.sd), KT = D.kg.ci;   // z interval with σ = 3 g; t interval with s
const R = D.survey.recommend, W = I.ciProp(SURVEY.wouldRecommend.yes, SURVEY.responses, 0.95, 'wilson');
const yes = SURVEY.wouldRecommend.yes, no = SURVEY.responses - yes;
const m90 = I.ciMean(SETUP_MINUTES, 0.9), m99 = I.ciMean(SETUP_MINUTES, 0.99);
const n2 = I.sampleSizeMean(S.sd, 2), n2raw = ((z975 * S.sd) / 2) ** 2, n3 = I.sampleSizeMean(S.sd, 3), n1 = I.sampleSizeMean(S.sd, 1);
const pTail23 = 2 * I.tSf(z975, 23);
const FEW = I.ciProp(3, 40), FEWW = I.ciProp(3, 40, 0.95, 'wilson');        // fictional: 3 complaints in 40 orders
const GYM = { E: 0.05, p0: 0.5, guess: 0.3 };                                 // fictional cinema-chain survey
const nGym = I.sampleSizeProp(GYM.E), nGymRaw = (z975 ** 2 * 0.25) / GYM.E ** 2, nGym30 = I.sampleSizeProp(GYM.E, 0.95, GYM.guess);
const DF = [5, 10, 23, 39, 100, 1000];
/** Coverage of 95% t intervals for the mean order value from samples of 30: 20,000 seeded samples. */
const COVER30 = (() => {
  const r = mulberry32(3), mu = D.orders.mean; let hit = 0;
  for (let k = 0; k < 20000; k++) { const xs = []; for (let i = 0; i < 30; i++) xs.push(ORDER_VALUES[Math.floor(r() * ORDER_VALUES.length)]); const c = I.ciMean(xs); if (c.low <= mu && mu <= c.high) hit++; }
  return (hit / 20000) * 100;
})();
const ORDINARY_MEAN = mean(ORDER_VALUES.filter((x) => x !== D.orders.max));

// ---------------------------------------------------------------- formatting
const f1 = (x) => Math.round(x * 10) / 10;
const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`;

// ---------------------------------------------------------------- figure: the set-up times and the interval for their mean
function setupFigure() {
  const L = 40, Rr = 620, lo = 20, hi = 52, x = (v) => L + ((v - lo) / (hi - lo)) * (Rr - L);
  const sorted = [...SETUP_MINUTES].sort((a, b) => a - b), seen = {};
  let s = '<svg viewBox="0 0 660 230" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">';
  s += `<text x="${L}" y="18" font-size="12">The 24 set-up times (one dot each)</text>`;
  sorted.forEach((v) => { const k = (seen[v] = (seen[v] || 0) + 1); s += `<circle cx="${f1(x(v))}" cy="${100 - (k - 1) * 13}" r="5" fill="var(--ink)" opacity="0.7"/>`; });
  s += `<line x1="${L}" x2="${Rr}" y1="110" y2="110" stroke="var(--ink)" stroke-width="1.2"/>`;
  for (let t = lo; t <= hi; t += 4) s += `<line x1="${f1(x(t))}" x2="${f1(x(t))}" y1="110" y2="116" stroke="var(--ink)"/><text x="${f1(x(t))}" y="130" text-anchor="middle" font-size="11">${t}</text>`;
  s += `<text x="${Rr + 16}" y="130" font-size="11">min</text>`;
  s += `<text x="${L}" y="160" font-size="12">95% confidence interval for the mean set-up time</text>`;
  s += `<line x1="${f1(x(S.low))}" x2="${f1(x(S.high))}" y1="186" y2="186" stroke="var(--series-1)" stroke-width="5"/>`;
  s += `<line x1="${f1(x(S.low))}" x2="${f1(x(S.low))}" y1="176" y2="196" stroke="var(--series-1)" stroke-width="2"/><line x1="${f1(x(S.high))}" x2="${f1(x(S.high))}" y1="176" y2="196" stroke="var(--series-1)" stroke-width="2"/>`;
  s += `<line x1="${f1(x(S.mean))}" x2="${f1(x(S.mean))}" y1="172" y2="200" stroke="var(--ink)" stroke-width="2.5"/>`;
  s += `<text x="${f1(x(S.low))}" y="214" text-anchor="middle" font-size="11">${S.low.toFixed(1)}</text><text x="${f1(x(S.mean))}" y="214" text-anchor="middle" font-size="11">mean ${S.mean.toFixed(1)}</text><text x="${f1(x(S.high))}" y="214" text-anchor="middle" font-size="11">${S.high.toFixed(1)}</text>`;
  s += `<text x="${f1(x(S.high)) + 14}" y="190" font-size="11" fill="var(--ink-3)">± ${S.margin.toFixed(2)} = t × s ÷ √n</text>`;
  return `${s}</svg>`;
}

export default {
  slug: 'confidence-intervals',
  title: 'Confidence intervals',
  blurb: 'Turn a sample’s mean or proportion into a range for the population’s, with a margin of error that says how far it could be off. Build z and t intervals for a mean and an interval for a proportion, by hand and with CONFIDENCE.NORM and CONFIDENCE.T; say exactly what “95% confident” means; and work out the sample a margin needs.',
  status: 'draft',
  objectives: [
    'Explain a confidence interval as an estimate plus or minus a margin of error, and interpret a 95% confidence level correctly.',
    'Calculate a z interval for a mean when σ is known and a t interval when it isn’t, by hand and with CONFIDENCE.NORM, CONFIDENCE.T and T.INV.2T.',
    'Explain why the t distribution is used when σ is estimated, and how its degrees of freedom change it.',
    'Calculate an interval for a proportion, check its conditions, and recognise when the Wilson interval is the better choice.',
    'Describe how the confidence level, the spread and the sample size change the margin of error, and calculate the sample size a margin needs for a mean or a proportion.',
    'Identify what an interval doesn’t cover: bias from non-response or from a non-random sample, and the spread of individual values.',
  ],
  prerequisites: [
    { lesson: 'b04/sampling-distributions', why: 'An interval is built from the sampling distribution and its standard error.' },
    { lesson: 'b04/normal-distribution', why: 'The z values 1.645, 1.96 and 2.576 and NORM.S.INV come from the standard normal distribution.' },
    { lesson: 'b03/descriptive-statistics-and-regression', why: 'The ToolPak’s Confidence Level line, which this lesson explains, was met there.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Clients keep asking Ana how long Lantern needs to set up before a catering event. She drew 24 of the autumn’s bookings at random and timed their set-ups: a mean of 37.9 minutes, with a standard deviation of 8.2. She also owes Kilnworth a figure for its bags, and a summary of September’s survey. Each time the question is the same: the sample gave a number, so what does it say about the whole?' },

    { h: 'An estimate and its margin' },
    { p: 'The sample mean, 37.875 minutes, is a <g>point estimate</g> of the mean set-up time of all autumn events. It is almost certainly not exactly right: another 24 events would have given another mean. A <g>confidence interval</g> adds a range that reflects that uncertainty: the estimate plus or minus a <g>margin of error</g>. The margin is a multiplier times the standard error, and the multiplier depends on the <g>confidence level</g>, the share of samples in which the method captures the true value.' },
    { math: String.raw`\text{estimate} \pm \text{multiplier} \times \text{standard error}` },
    { p: String.raw`Why it works: the previous lesson showed that 95% of sample means fall within 1.96 standard errors of μ. So for 95% of samples, μ is within 1.96 standard errors of <m>\bar{x}</m>, and the interval <m>\bar{x} \pm 1.96 \times \text{SE}</m> captures it.` },

    { h: 'When σ is known: the z interval' },
    { p: String.raw`Kilnworth’s specification gives the machine’s standard deviation, 3 g. If Ana trusts it, the standard error of her 40 bags’ mean is <m>3 \div \sqrt{40} = ${KZ.se.toFixed(3)}</m> g and the 95% margin is <m>1.96 \times ${KZ.se.toFixed(3)} = ${KZ.margin.toFixed(2)}</m> g. The interval runs from <m>1{,}002.75 - ${KZ.margin.toFixed(2)} = ${KZ.low.toFixed(2)}</m> to ${KZ.high.toFixed(2)} g. Excel gives the margin directly: <x>=CONFIDENCE.NORM(0.05,3,40)</x> returns ${KZ.margin.toFixed(4)}.` },

    { h: 'When σ is unknown: the t interval' },
    { p: String.raw`Nobody specified the spread of set-up times, so Ana must estimate it with the sample’s s = ${S.sd.toFixed(2)} minutes. That adds a second source of uncertainty: s itself varies from sample to sample, and a small sample can understate the spread. The ratio <m>(\bar{x} - \mu) \div (s \div \sqrt{n})</m> therefore varies more than z does. If the population is normal, it follows the <g>t distribution</g> with <m>n - 1</m> <g>degrees of freedom</g>, worked out by William Gosset of the Guinness brewery in Dublin and published under a pen name, which is why it is often called Student’s t.` },
    { p: String.raw`The t distribution looks like the standard normal but with heavier tails, so its multiplier is larger. With 23 degrees of freedom, <x>=T.INV.2T(0.05,23)</x> returns ${S.crit.toFixed(3)}, against 1.96 for z. Ana’s interval: standard error <m>${S.sd.toFixed(2)} \div \sqrt{24} = ${S.se.toFixed(3)}</m>, margin <m>${S.crit.toFixed(3)} \times ${S.se.toFixed(3)} = ${S.margin.toFixed(2)}</m>, interval ${S.low.toFixed(1)} to ${S.high.toFixed(1)} minutes. <x>=CONFIDENCE.T(0.05,STDEV.S(A2:A25),COUNT(A2:A25))</x> returns the same margin.` },
    { figure: {
      svg: setupFigure(),
      caption: `The 24 set-up times and the 95% confidence interval for their mean, ${S.low.toFixed(1)} to ${S.high.toFixed(1)} minutes. The interval is about the mean of all autumn set-ups; most individual set-ups lie outside it.`,
      alt: `A dot plot of the 24 set-up times on a scale from 20 to 52 minutes: the dots spread from 22 to 50 minutes, with most between 36 and 48. Below it a thick horizontal bar marks the 95% confidence interval for the mean, from ${S.low.toFixed(1)} to ${S.high.toFixed(1)} minutes, with a vertical tick at the sample mean, ${S.mean.toFixed(1)}. A label reads ± ${S.margin.toFixed(2)} = t × s ÷ √n.`,
    } },

    { h: 'What “95% confident” means' },
    { p: 'The 95% describes the method, not this interval. If Ana repeated her sampling many times, drawing 24 events and building an interval each time, about 95% of the intervals would contain the true mean set-up time; the NIST/SEMATECH handbook puts it as “in the long run”. Her one interval, 34.4 to 41.3 minutes, either contains the true mean or doesn’t, and she can’t tell which. “We are 95% confident” is shorthand for “this interval came from a method that works 95% of the time”, not a 95% probability about this particular range.' },

    { h: 'An interval for a proportion' },
    { p: String.raw`In September ${yes} of the ${SURVEY.responses} customers who replied would recommend Lantern: <m>\hat{p} = ${yes} \div ${SURVEY.responses} = ${R.p.toFixed(3)}</m>. Its standard error, <m>\sqrt{${R.p.toFixed(3)} \times ${(1 - R.p).toFixed(3)} \div ${SURVEY.responses}} = ${R.se.toFixed(4)}</m>, gives a 95% margin of <m>1.96 \times ${R.se.toFixed(4)} = ${R.margin.toFixed(3)}</m>, about 9 percentage points: ${pc(R.low)} to ${pc(R.high)}. The interval rests on the normal model for <m>\hat{p}</m>, which needs enough of each answer: ${yes} yes and ${no} no, both at least 10.` },
    { p: `That interval covers one thing only: the luck of which customers happened to reply. Only ${SURVEY.responses} of the ${SURVEY.sent} customers invited replied (${pc(D.survey.responseRate)}). If customers who like Lantern were keener to answer, the true share among all customers could lie below the whole interval, and no formula here can detect it. What Ana can say is that among customers like those who replied, 68% to 86% would recommend Lantern.` },
  ],

  theory: [
    { h: 'One recipe, three intervals' },
    { table: {
      caption: 'The three intervals of this lesson, at confidence level 1 − α',
      head: ['Parameter', 'When', 'Interval', 'Excel margin'],
      align: ['l', 'l', 'l', 'l'],
      rows: [
        ['Mean μ', 'σ known', 'x̄ ± z × σ ÷ √n', '<x>=CONFIDENCE.NORM(alpha,sigma,n)</x>'],
        ['Mean μ', 'σ unknown, estimated by s', 'x̄ ± t × s ÷ √n, df = n − 1', '<x>=CONFIDENCE.T(alpha,s,n)</x>'],
        ['Proportion p', 'At least 10 of each outcome', 'p̂ ± z × √(p̂(1 − p̂) ÷ n)', '<x>=NORM.S.INV(1-alpha/2)*SQRT(p*(1-p)/n)</x>'],
      ],
    } },
    { p: String.raw`The multiplier is the <m>z</m> or <m>t</m> value that leaves <m>\alpha \div 2</m> in each tail: 1.645, 1.96 and 2.576 for 90%, 95% and 99% with z; NORM.S.INV(1 − α/2) in Excel. Microsoft’s functions take alpha, the significance level, rather than the confidence level: for a 95% interval, alpha is 0.05.` },

    { h: 'The t distribution' },
    { p: String.raw`OpenStax lists its properties: like the standard normal it is symmetric about 0, but it has more probability in its tails, and as the degrees of freedom grow it becomes more like the standard normal. The table shows the multiplier for 95% intervals. With 23 degrees of freedom, using 1.96 instead of 2.069 would leave <x>=T.DIST.2T(1.96,23)</x> = ${pc(pTail23)} outside, not 5%: the intervals would be too narrow and capture μ less often than they claim.` },
    { table: {
      caption: 'The 95% multiplier, T.INV.2T(0.05, df), against z',
      head: ['Degrees of freedom', '5', '10', '23', '39', '100', '1,000', 'z'],
      align: ['l', 'r', 'r', 'r', 'r', 'r', 'r', 'r'],
      rows: [['Multiplier', ...DF.map((d) => tCrit(0.95, d).toFixed(3)), z975.toFixed(3)]],
    } },
    { p: 'The t interval assumes a random sample of independent values from a population that is roughly normal. It is robust to mild skew, and more so as n grows, but not to strong skew or extreme outliers. Check a dot plot or histogram first. Ana’s set-up times run from 22 to 50 minutes with no outliers; the mean (37.9) is a little below the median (40.5) and SKEW is −0.62, a mild left skew that 24 values can carry.' },
    { p: 'Lantern’s spring orders show the failure. Draw 30 orders at random from the 231 and build a 95% t interval: in a seeded simulation of 20,000 samples, only about 70% of the intervals contained the population mean of $39.38. Most samples miss the $1,512 office order, so their mean is about $33 and their s small; their intervals sit below $39.38. The second Explore widget repeats the experiment. The 95% is a property of the method under its conditions; with skewed data, check the conditions or use a far larger sample.' },

    { h: 'Excel’s interval functions' },
    { list: [
      '<b>CONFIDENCE.NORM(alpha, standard_dev, size)</b> returns the margin of a z interval, the half-width, not the interval: Microsoft’s example gives 0.692952, so a mean of 30 minutes becomes 30 ± 0.69. Add and subtract it yourself.',
      '<b>CONFIDENCE.T(alpha, standard_dev, size)</b> returns the margin of a t interval with size − 1 degrees of freedom. Microsoft’s page describes standard_dev as the population standard deviation, “assumed to be known”, but the function uses the t distribution, which is for an estimated one: pass STDEV.S of the sample. That is exactly the ToolPak’s Confidence Level line. A size of 1 returns #DIV/0!.',
      '<b>T.INV.2T(probability, deg_freedom)</b> returns the t with that probability in the two tails together: T.INV.2T(0.05, 23) = 2.069. <b>T.INV(0.975, 23)</b>, the left-tailed inverse, gives the same number. For a z multiplier use NORM.S.INV(0.975).',
      'Both CONFIDENCE functions return #NUM! for an alpha of 0 or less or of 1 or more, and truncate a size that isn’t a whole number.',
    ] },
    { p: `Kilnworth’s bags, with the sample’s own s = ${D.kg.sd.toFixed(2)} g instead of the specified 3 g: <x>=CONFIDENCE.T(0.05,STDEV.S(A2:A41),40)</x> returns ${KT.margin.toFixed(4)}, so the t interval is ${KT.low.toFixed(2)} to ${KT.high.toFixed(2)} g. Either interval lies wholly below the 1,004 g setting, a hint that the machine may be running low; Module 3 shows how an interval and a two-sided test say the same thing.` },

    { h: 'Intervals for a proportion: Wald and Wilson' },
    { p: String.raw`The interval <m>\hat{p} \pm z\sqrt{\hat{p}(1-\hat{p}) \div n}</m> is called the Wald interval. Its usual condition is at least 10 successes and 10 failures in the sample, as in OpenIntro Statistics; OpenStax accepts more than 5 of each. Agresti and Coull (2001) note that the Wald interval behaves poorly even for quite large n, and that the <g>Wilson interval</g> performs well even for small n. The Wilson interval is centred a little towards 0.5 and never strays outside 0 to 1.` },
    { p: String.raw`For the survey the two barely differ: Wilson gives ${pc(W.low)} to ${pc(W.high)}, centred on ${pc(W.centre)}, against Wald’s ${pc(R.low)} to ${pc(R.high)}. With few successes they part company. Suppose (a fictional case) 3 of 40 orders draw a complaint: Wald gives ${pc(FEW.low)} to ${pc(FEW.high)}, a lower limit below zero; Wilson gives ${pc(FEWW.low)} to ${pc(FEWW.high)}. Excel has no Wilson function; build it from NORM.S.INV with the formula card. When a sample has fewer than 10 of either outcome, report the Wilson interval.` },

    { h: 'What changes the margin of error' },
    { p: `Three things set the margin: the confidence level (through the multiplier), the spread of the data (σ or s) and the sample size (through √n). For Ana’s set-up times the margin is ±${m90.margin.toFixed(2)} minutes at 90%, ±${S.margin.toFixed(2)} at 95% and ±${m99.margin.toFixed(2)} at 99%: more confidence costs width. A sample four times as large would roughly halve each margin. The spread is the one she can’t choose, though a better-defined measurement (a stopwatch started at the same moment every time) can reduce it.` },

    { h: 'Planning the sample size' },
    { p: String.raw`Turn the margin round to find the n that gives a chosen margin E: for a mean, <m>n = (z\sigma \div E)^2</m>, with σ from a pilot sample or past data. To estimate the mean set-up time to within ±2 minutes at 95% with <m>\sigma \approx ${S.sd.toFixed(2)}</m>: <m>(1.96 \times ${S.sd.toFixed(2)} \div 2)^2 = ${n2raw.toFixed(1)}</m>, so ${n2} events. Always round up; ±3 minutes needs ${n3}, and ±1 minute ${n1}.` },
    { p: String.raw`For a proportion, <m>n = z^2 p(1 - p) \div E^2</m>. The product <m>p(1 - p)</m> is largest at p = 0.5, so 0.5 is the cautious planning value when nothing is known. A cinema chain (fictional) wanting the share of its members who would pay for reserved seats to within ±5 points at 95% needs <m>1.96^2 \times 0.25 \div 0.05^2 = ${nGymRaw.toFixed(1)}</m>, so ${nGym} replies; if it is confident the share is near 30%, ${nGym30} would do, but a wrong guess leaves the margin too wide. These are numbers of usable replies or measurements, not of invitations.` },
  ],

  formulas: [
    { id: 'ci-z', name: 'Confidence interval for a mean, σ known (z interval)',
      tex: String.raw`\bar{x} \pm z_{\alpha/2} \, \dfrac{\sigma}{\sqrt{n}}`,
      where: [[String.raw`\bar{x}`, 'The sample mean (the point estimate)', 'units of x'], [String.raw`z_{\alpha/2}`, 'The z with α ÷ 2 above it: 1.645, 1.96, 2.576 for 90%, 95%, 99%', ''], [String.raw`\sigma`, 'The known population standard deviation', 'units of x'], [String.raw`n`, 'The sample size', ''], [String.raw`\alpha`, '1 − the confidence level', '']],
      assumptions: 'A random sample; the sample mean close to normal (a normal population, or n large enough for its skew).',
      note: 'The margin is CONFIDENCE.NORM(α, σ, n).' },
    { id: 'ci-tstat', name: 'The t ratio',
      tex: String.raw`t = \dfrac{\bar{x} - \mu}{s / \sqrt{n}}, \qquad \text{df} = n - 1`,
      where: [[String.raw`\bar{x}`, 'The sample mean', 'units of x'], [String.raw`\mu`, 'The population mean', 'units of x'], [String.raw`s`, 'The sample standard deviation (STDEV.S)', 'units of x'], [String.raw`n`, 'The sample size', ''], [String.raw`t`, 'The ratio, which follows the t distribution with n − 1 degrees of freedom', ''], [String.raw`\text{df}`, 'Degrees of freedom', '']],
      assumptions: 'A random sample from a roughly normal population.',
      note: 'Module 3 uses the same ratio as a test statistic.' },
    { id: 'ci-t', name: 'Confidence interval for a mean, σ unknown (t interval)',
      tex: String.raw`\bar{x} \pm t_{\alpha/2,\,n-1} \, \dfrac{s}{\sqrt{n}}`,
      where: [[String.raw`t_{\alpha/2,\,n-1}`, 'The t with α ÷ 2 in each tail and n − 1 degrees of freedom: T.INV.2T(α, n − 1)', ''], [String.raw`s`, 'The sample standard deviation', 'units of x'], [String.raw`\bar{x}`, 'The sample mean', 'units of x'], [String.raw`n`, 'The sample size', ''], [String.raw`\alpha`, '1 − the confidence level', '']],
      assumptions: 'A random sample of independent values from a roughly normal population (robust to mild skew, more so as n grows).',
      note: 'The margin is CONFIDENCE.T(α, s, n), the ToolPak’s Confidence Level line.' },
    { id: 'ci-prop', name: 'Confidence interval for a proportion (Wald)',
      tex: String.raw`\hat{p} \pm z_{\alpha/2} \sqrt{\dfrac{\hat{p}(1 - \hat{p})}{n}}`,
      where: [[String.raw`\hat{p}`, 'The sample proportion, successes ÷ n', ''], [String.raw`n`, 'The sample size', ''], [String.raw`z_{\alpha/2}`, 'The z multiplier', ''], [String.raw`\alpha`, '1 − the confidence level', '']],
      assumptions: 'A random sample with at least 10 successes and 10 failures.' },
    { id: 'ci-wilson', name: 'Wilson interval for a proportion',
      tex: String.raw`\dfrac{\hat{p} + \dfrac{z^2}{2n} \pm z\sqrt{\dfrac{\hat{p}(1 - \hat{p})}{n} + \dfrac{z^2}{4n^2}}}{1 + \dfrac{z^2}{n}}`,
      where: [[String.raw`\hat{p}`, 'The sample proportion', ''], [String.raw`n`, 'The sample size', ''], [String.raw`z`, 'The z multiplier (1.96 for 95%)', '']],
      assumptions: 'A random sample; works well even with few successes or failures.',
      note: 'The centre, (p̂ + z²/2n) ÷ (1 + z²/n), is pulled towards 0.5; the limits stay between 0 and 1.' },
    { id: 'ci-n-mean', name: 'Sample size for a mean',
      tex: String.raw`n = \left(\dfrac{z_{\alpha/2}\,\sigma}{E}\right)^2`,
      where: [[String.raw`E`, 'The margin of error wanted', 'units of x'], [String.raw`\sigma`, 'A planning value for the standard deviation', 'units of x'], [String.raw`z_{\alpha/2}`, 'The z multiplier', ''], [String.raw`n`, 'The sample size, rounded up', '']] },
    { id: 'ci-n-prop', name: 'Sample size for a proportion',
      tex: String.raw`n = \dfrac{z_{\alpha/2}^2 \, p(1 - p)}{E^2}`,
      where: [[String.raw`E`, 'The margin of error wanted, as a proportion (0.05 for ±5 points)', ''], [String.raw`p`, 'A planning value for the proportion; 0.5 is the cautious choice', ''], [String.raw`z_{\alpha/2}`, 'The z multiplier', ''], [String.raw`n`, 'The number of usable replies, rounded up', '']] },
  ],

  examples: [
    { level: 'simple', title: 'A z interval for the bags’ mean', fictional: true,
      setup: 'Ana’s 40 bags have a mean of 1,002.75 g. Taking Kilnworth’s specified standard deviation of 3 g as known, calculate a 95% confidence interval for the mean weight of the bags Kilnworth is filling.',
      steps: [
        String.raw`Standard error: <m>\sigma \div \sqrt{n} = 3 \div \sqrt{40} = ${KZ.se.toFixed(4)}</m> g.`,
        String.raw`Multiplier for 95%: <m>z = 1.96</m> (<x>=NORM.S.INV(0.975)</x>). Margin: <m>1.96 \times ${KZ.se.toFixed(4)} = ${KZ.margin.toFixed(3)}</m> g, or <x>=CONFIDENCE.NORM(0.05,3,40)</x>.`,
        String.raw`Interval: <m>1{,}002.75 \pm ${KZ.margin.toFixed(2)}</m>, from ${KZ.low.toFixed(2)} to ${KZ.high.toFixed(2)} g.`,
      ],
      answer: `${KZ.low.toFixed(2)} g to ${KZ.high.toFixed(2)} g (95%).`,
      interpretation: 'If the 3 g is right, the method behind this interval captures the machine’s true mean in 95% of samples of 40, and this interval doesn’t reach Kilnworth’s 1,004 g setting. That is grounds to raise the question with Kilnworth, and the formal test is Module 3’s.' },
    { level: 'challenging', title: 'The mean set-up time at 90%, 95% and 99%', fictional: true,
      setup: `Ana’s 24 set-up times (minutes) are ${SETUP_MINUTES.join(', ')}. Check that a t interval is reasonable, then calculate the 90%, 95% and 99% intervals for the mean set-up time, and say which one she should quote to clients.`,
      steps: [
        `Conditions: the 24 events were drawn at random from the autumn’s bookings, so they are independent; the times run from ${Math.min(...SETUP_MINUTES)} to ${Math.max(...SETUP_MINUTES)} minutes with no outliers, mean ${S.mean.toFixed(2)} against median ${median(SETUP_MINUTES).toFixed(1)}, SKEW ${skewness(SETUP_MINUTES).toFixed(2)}: mildly left-skewed, acceptable for n = 24.`,
        String.raw`Estimates: <m>\bar{x} = ${S.mean.toFixed(3)}</m>, <m>s = ${S.sd.toFixed(3)}</m>, standard error <m>${S.sd.toFixed(3)} \div \sqrt{24} = ${S.se.toFixed(3)}</m>; σ is unknown, so use t with 23 degrees of freedom.`,
        String.raw`Multipliers: <x>=T.INV.2T(0.1,23)</x> = ${tCrit(0.9, 23).toFixed(3)}, <x>=T.INV.2T(0.05,23)</x> = ${tCrit(0.95, 23).toFixed(3)}, <x>=T.INV.2T(0.01,23)</x> = ${tCrit(0.99, 23).toFixed(3)}.`,
        String.raw`Margins and intervals: 90%: <m>${tCrit(0.9, 23).toFixed(3)} \times ${S.se.toFixed(3)} = ${m90.margin.toFixed(2)}</m>, ${m90.low.toFixed(1)} to ${m90.high.toFixed(1)}; 95%: ${S.margin.toFixed(2)}, ${S.low.toFixed(1)} to ${S.high.toFixed(1)}; 99%: ${m99.margin.toFixed(2)}, ${m99.low.toFixed(1)} to ${m99.high.toFixed(1)} minutes.`,
      ],
      answer: `90%: ${m90.low.toFixed(1)} to ${m90.high.toFixed(1)} minutes; 95%: ${S.low.toFixed(1)} to ${S.high.toFixed(1)}; 99%: ${m99.low.toFixed(1)} to ${m99.high.toFixed(1)}.`,
      interpretation: 'These intervals are for the average set-up, which is what Ana needs for planning staff hours across many events. For one client’s event they are the wrong tool: individual set-ups ranged from 22 to 50 minutes, and a single event needs a range for one value (a prediction interval, B06), far wider than any interval for the mean. She can quote “about 38 minutes on average; allow up to 50”.' },
    { level: 'applied', title: 'What can Ana say about the September survey?', fictional: true,
      setup: `In B01’s September survey, ${SURVEY.sent} customers were invited, ${SURVEY.responses} replied and ${yes} said they would recommend Lantern. Ana wants one sentence for her autumn report. Calculate the 95% Wald and Wilson intervals, check the conditions, and decide what the sentence can claim.`,
      steps: [
        String.raw`Estimate and conditions: <m>\hat{p} = ${yes} \div ${SURVEY.responses} = ${R.p.toFixed(4)}</m>; ${yes} successes and ${no} failures, both at least 10, so the normal model is reasonable.`,
        String.raw`Wald: <m>${R.p.toFixed(4)} \pm 1.96 \times \sqrt{${R.p.toFixed(4)} \times ${(1 - R.p).toFixed(4)} \div ${SURVEY.responses}} = ${R.p.toFixed(4)} \pm ${R.margin.toFixed(4)}</m>: ${pc(R.low)} to ${pc(R.high)}.`,
        String.raw`Wilson: centre <m>(${R.p.toFixed(4)} + 1.96^2 \div 158) \div (1 + 1.96^2 \div 79) = ${W.centre.toFixed(4)}</m>, half-width ${W.margin.toFixed(4)}: ${pc(W.low)} to ${pc(W.high)}.`,
        `Non-response: ${pc(D.survey.responseRate)} replied. The interval says nothing about the 161 who didn’t; if recommenders were keener to reply, the true share could be lower than the whole interval.`,
      ],
      answer: `About 77% of respondents would recommend Lantern (95% interval roughly 67% to 86%, by either method), from 79 replies to 240 invitations.`,
      interpretation: 'The sentence Ana writes: “77% of the 79 customers who replied would recommend us (95% interval 68% to 86%). Only a third of those invited replied, so the figure may flatter us.” Reporting the interval without the response rate would overstate what the survey shows.' },
    { level: 'applied', title: 'How many events to time?', fictional: true,
      setup: `Ana wants to quote the mean set-up time to within ±2 minutes at 95%, using her sample’s standard deviation of ${S.sd.toFixed(2)} minutes as the planning value. How many events should she time, and what would ±1 minute cost?`,
      steps: [
        String.raw`<m>n = (1.96 \times ${S.sd.toFixed(2)} \div 2)^2 = (${(z975 * S.sd / 2).toFixed(3)})^2 = ${n2raw.toFixed(2)}</m>, rounded up to ${n2}.`,
        String.raw`For ±1 minute the margin halves, so n roughly quadruples: <m>(1.96 \times ${S.sd.toFixed(2)} \div 1)^2</m>, rounded up to ${n1}.`,
        'Check the planning value: s came from 24 events and could be a minute or so off. A cautious plan uses a slightly larger σ, or times the 65 events and recalculates the margin with their own s and t.',
      ],
      answer: `${n2} events for ±2 minutes; ${n1} for ±1 minute.`,
      interpretation: 'Precision is expensive: halving the margin quadruples the work. ±2 minutes is plenty for staffing; Ana times every event for the next few months, which gets her past 65 without extra effort.' },
  ],

  demo: [
    { widget: 'ci-sheet', intro: 'The 24 set-up times with the interval as live formulas. Change the confidence level in D2 to 0.9 or 0.99 and watch the multiplier, the margin and the limits; compare D8 (CONFIDENCE.T) with D9 (t × SE by hand).' },
    { widget: 'ci-t', intro: 'The t distribution with 23 degrees of freedom, with the standard normal dashed. Find the t with 97.5% below it, then the area outside ±1.96 (more than 5%). Raise the degrees of freedom and watch the two curves merge.' },
    { widget: 'ci-cover-subs', intro: 'Ninety-five per cent intervals for the subscription share from random samples of the spring orders. Draw 1,000 and check how many contain the true 45.0%; try n = 20, where the Wald interval misses more often.' },
    { widget: 'ci-cover-orders', intro: 'The same experiment with t intervals for the mean order value, whose population is strongly skewed. Count how far below 95% the capture rate falls at n = 30 and at n = 100, and look at where the misses lie.' },
  ],

  mistakes: [
    { title: '“There is a 95% probability that the true mean is between 34.4 and 41.3 minutes.”', html: 'The true mean is fixed and this interval either contains it or doesn’t. The 95% is the long-run capture rate of the method: about 95% of intervals built this way contain μ. Say “we are 95% confident” and mean exactly that.' },
    { title: '“95% of events take between 34.4 and 41.3 minutes.”', html: 'A confidence interval is for the mean, not for individual values. Ana’s set-ups ranged from 22 to 50 minutes; most lie outside the interval. A range for one event is a prediction interval, much wider (B06).' },
    { title: '“With s from the sample, use 1.96.”', html: 'When σ is estimated by s, the multiplier comes from the t distribution with n − 1 degrees of freedom: 2.069 for n = 24. Using 1.96 makes the interval too narrow; it would capture μ about 94% of the time instead of 95%, and much less for very small samples.' },
    { title: '“CONFIDENCE.T(0.95, s, n) gives a 95% interval.”', html: 'The first argument is alpha, 1 − confidence: 0.05 for 95%. And the function returns the margin, not the interval: subtract it from and add it to the mean.' },
    { title: '“The margin of error covers all the error in a survey.”', html: 'It covers only sampling error, the luck of which customers ended up in the sample. Non-response, a frame that misses people and leading questions add bias that the margin doesn’t show.' },
    { title: '“Doubling the sample halves the margin.”', html: 'The margin falls with √n, so doubling n divides it by about 1.41. Halving it takes four times the sample.' },
  ],

  application: [
    { p: 'Good reports give estimates with intervals: “mean set-up 38 minutes (95% CI 34 to 41)”, “77% would recommend (68% to 86%)”. A reader can then see at once whether a difference matters: if next quarter’s survey shows 72%, that is inside this interval and not clearly a fall. Decision-makers who are shown only point estimates tend to treat every wobble as news.' },
    { p: 'Planning starts from the margin. A market researcher who needs a share to within ±3 points at 95% knows before the survey that it takes about 1,068 replies at p = 0.5, and can budget for it; a quality manager who needs a fill weight to within ±0.5 g knows how many packs to weigh. Then the plan meets the real world: response rates, non-random samples and skewed data. The interval is only as honest as the sample behind it.' },
    { case: `Ana’s note to the catering team: “Our average set-up is about 38 minutes (95% confidence interval 34 to 41 minutes, from 24 events chosen at random). Individual set-ups have ranged from 22 to 50 minutes, so for any one event allow 50. I’ll keep timing every event until we have 65, which will pin the average to within 2 minutes.”` },
    { p: 'Three questions keep an interval honest. Was the sample random, so that the standard error means something? Are the conditions met: roughly normal data or a large enough sample for a mean, enough of each outcome for a proportion? And is the question about the mean, or about individual values? Answer them before quoting the number, and quote the response rate beside any survey interval.' },
  ],

  summary: [
    'A confidence interval is a point estimate ± a margin of error; the margin is a multiplier (z or t) times the standard error.',
    '“95% confident” describes the method: about 95% of intervals built this way contain the parameter. A computed interval either contains it or doesn’t.',
    'With σ known use z (CONFIDENCE.NORM); with σ estimated by s use t with n − 1 degrees of freedom (CONFIDENCE.T, T.INV.2T). The t multiplier is larger and approaches 1.96 as n grows.',
    'Both CONFIDENCE functions take alpha (0.05 for 95%) and return the margin, not the interval; pass STDEV.S to CONFIDENCE.T.',
    'For a proportion, p̂ ± z√(p̂(1 − p̂) ÷ n) needs at least 10 of each outcome; with fewer, use the Wilson interval.',
    'Higher confidence and more spread widen the margin; a larger sample narrows it with √n. Sample sizes: n = (zσ ÷ E)² for a mean, z²p(1 − p) ÷ E² for a proportion, with p = 0.5 as the cautious value; round up.',
    'An interval covers sampling error only, assumes a random sample, and is about the mean, not about individual values.',
  ],

  glossary: [
    { term: 'Point estimate', def: 'A single number calculated from a sample to estimate a parameter, such as a sample mean for the population mean.' },
    { term: 'Confidence interval', def: 'A range calculated from sample data, estimate ± margin of error, by a method that captures the parameter in a stated share of samples (the confidence level). Any one interval either contains the parameter or doesn’t.' },
    { term: 'Confidence level', def: 'The share of samples in which the method of building a confidence interval captures the parameter, such as 95%; equal to 1 − α.' },
    { term: 'Margin of error', def: 'The half-width of a confidence interval: the multiplier (z or t) times the standard error. It measures sampling error only, not bias.' },
    { term: 't distribution', def: 'The symmetric, bell-shaped distribution of (x̄ − μ) ÷ (s ÷ √n) for samples from a normal population, with heavier tails than the standard normal; its shape depends on its degrees of freedom, n − 1, and approaches the standard normal as they grow. Also called Student’s t.' },
    { term: 'Wilson interval', def: 'A confidence interval for a proportion that is centred slightly towards 0.5 and stays between 0 and 1, more reliable than the usual p̂ ± z√(p̂(1 − p̂) ÷ n) when the sample has few successes or failures.' },
  ],

  references: [
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Business Statistics 2e</i>, section 8.1 “A Confidence Interval When the Population Standard Deviation Is Known or Large Sample Size”, with sections 8.2–8.4 in the first edition. OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/8-1-a-confidence-interval-when-the-population-standard-deviation-is-known-or-large-sample-size', checked: '2026-10-24' },
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. <i>Introductory Business Statistics</i>, section 8.2 “A Confidence Interval for a Population Standard Deviation Unknown, Small Sample Case”. OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics/pages/8-2-a-confidence-interval-for-a-population-standard-deviation-unknown-small-sample-case', checked: '2026-10-24' },
    { text: 'NIST/SEMATECH. <i>e-Handbook of Statistical Methods</i>, section 1.3.5.2, “Confidence Limits for the Mean”.', url: 'https://www.itl.nist.gov/div898/handbook/eda/section3/eda352.htm', checked: '2026-10-24' },
    { text: 'Diez, D., Barr, C. &amp; Çetinkaya-Rundel, M. <i>OpenIntro Statistics</i>, section 6.1 “Inference for a Single Proportion”, on Statistics LibreTexts.', url: 'https://stats.libretexts.org/Bookshelves/Introductory_Statistics/OpenIntro_Statistics_(Diez_et_al)./06:_Inference_for_Categorical_Data/6.01:_Inference_for_a_Single_Proportion', checked: '2026-10-24' },
    { text: 'Agresti, A. &amp; Coull, B. A. (2001). Comment on “Interval Estimation for a Binomial Proportion”. <i>Statistical Science</i> 16(2), 117–120.', url: 'https://users.stat.ufl.edu/~aa/articles/agresti_coull_2001.pdf', checked: '2026-10-24' },
    { text: 'Microsoft Support. “CONFIDENCE.T function”, with the pages for CONFIDENCE.NORM, T.INV.2T, T.INV and T.DIST.2T.', url: 'https://support.microsoft.com/en-US/Excel/functions/confidence-t-function', checked: '2026-10-24' },
  ],

  checks: [
    // concept
    { what: 'Set-up events', value: S.n, shown: 24 },
    { what: 'Set-up mean', value: S.mean, shown: 37.875, tol: 0.0005 },
    { what: 'Set-up mean 1 dp', value: S.mean, shown: 37.9, tol: 0.05 },
    { what: 'Set-up SD', value: S.sd, shown: 8.22 },
    { what: 'Set-up SD 1 dp', value: S.sd, shown: 8.2, tol: 0.05 },
    { what: 'z 0.975', value: z975, shown: 1.96, tol: 0.0005 },
    { what: 'Bags SE with σ = 3', value: KZ.se, shown: 0.474, tol: 0.0005 },
    { what: 'Bags SE 4 dp', value: KZ.se, shown: 0.4743, tol: 0.00005 },
    { what: 'Bags z margin', value: KZ.margin, shown: 0.93 },
    { what: 'Bags z margin 3 dp', value: KZ.margin, shown: 0.930, tol: 0.0005 },
    { what: 'CONFIDENCE.NORM(0.05,3,40)', value: KZ.margin, shown: 0.9297, tol: 0.00005 },
    { what: 'Bags z low', value: KZ.low, shown: 1001.82 },
    { what: 'Bags z high', value: KZ.high, shown: 1003.68 },
    { what: 'Bags mean', value: D.kg.mean, shown: 1002.75 },
    { what: 't 0.975, 23', value: S.crit, shown: 2.069, tol: 0.0005 },
    { what: 'Set-up SE', value: S.se, shown: 1.677, tol: 0.0005 },
    { what: 'Set-up margin', value: S.margin, shown: 3.47 },
    { what: 'Set-up low', value: S.low, shown: 34.4, tol: 0.05 },
    { what: 'Set-up high', value: S.high, shown: 41.3, tol: 0.05 },
    { what: 'Set-up interval rounded (34 to 41)', value: S.low + S.high, shown: 34 + 41, tol: 1 },
    { what: 'Set-up range low', value: Math.min(...SETUP_MINUTES), shown: 22 },
    { what: 'Set-up range high', value: Math.max(...SETUP_MINUTES), shown: 50 },
    { what: 'Survey yes', value: yes, shown: 61 },
    { what: 'Survey replies', value: SURVEY.responses, shown: 79 },
    { what: 'Survey no', value: no, shown: 18 },
    { what: 'Survey invited', value: SURVEY.sent, shown: 240 },
    { what: 'Did not reply', value: SURVEY.sent - SURVEY.responses, shown: 161 },
    { what: 'p̂', value: R.p, shown: 0.772, tol: 0.0005 },
    { what: 'p̂ 4 dp', value: R.p, shown: 0.7722, tol: 0.00005 },
    { what: 'About 77%', value: R.p * 100, shown: 77, tol: 0.5 },
    { what: '1 − p̂', value: 1 - R.p, shown: 0.228, tol: 0.0005 },
    { what: 'SE p̂', value: R.se, shown: 0.0472, tol: 0.00005 },
    { what: 'Margin p̂', value: R.margin, shown: 0.092, tol: 0.0005 },
    { what: 'Margin p̂ 4 dp', value: R.margin, shown: 0.0925, tol: 0.00005 },
    { what: 'About 9 points', value: R.margin * 100, shown: 9, tol: 0.5 },
    { what: 'Wald low %', value: R.low * 100, shown: 68.0, tol: 0.05 },
    { what: 'Wald high %', value: R.high * 100, shown: 86.5, tol: 0.05 },
    { what: 'Wald low 68', value: R.low * 100, shown: 68, tol: 0.5 },
    { what: 'Wald high 86', value: R.high * 100, shown: 86, tol: 0.5 },
    { what: 'Response rate', value: D.survey.responseRate * 100, shown: 32.9, tol: 0.05 },
    { what: 'A third replied', value: D.survey.responseRate, shown: 1 / 3, tol: 0.01 },
    // theory
    { what: 'z 90%', value: I.normInv(0.95), shown: 1.645, tol: 0.0005 },
    { what: 'z 99%', value: I.normInv(0.995), shown: 2.576, tol: 0.0005 },
    { what: 'P(|T23| > 1.96) %', value: pTail23 * 100, shown: 6.2, tol: 0.05 },
    { what: 'Capture with z and s, df 23', value: (1 - pTail23) * 100, shown: 94, tol: 0.5 },
    { what: 't df 5', value: tCrit(0.95, 5), shown: 2.571, tol: 0.0005 },
    { what: 't df 10', value: tCrit(0.95, 10), shown: 2.228, tol: 0.0005 },
    { what: 't df 39', value: tCrit(0.95, 39), shown: 2.023, tol: 0.0005 },
    { what: 't df 100', value: tCrit(0.95, 100), shown: 1.984, tol: 0.0005 },
    { what: 't df 1000', value: tCrit(0.95, 1000), shown: 1.962, tol: 0.0005 },
    { what: 'Set-up median', value: median(SETUP_MINUTES), shown: 40.5 },
    { what: 'Set-up SKEW', value: skewness(SETUP_MINUTES), shown: -0.62 },
    { what: 'Orders t-interval coverage at n = 30 (simulated)', value: COVER30, shown: 70, tol: 1 },
    { what: 'Population mean of orders', value: D.orders.mean, shown: 39.38 },
    { what: 'Ordinary orders average about $33', value: ORDINARY_MEAN, shown: 33, tol: 0.05 },
    { what: 'Microsoft CONFIDENCE.NORM example', value: I.ciMeanZ({ n: 50, mean: 30 }, 2.5).margin, shown: 0.692952, tol: 0.0000005 },
    { what: 'T.INV.2T(0.05,23)', value: tCrit(0.95, 23), shown: 2.069, tol: 0.0005 },
    { what: 'Bags s', value: D.kg.sd, shown: 2.66 },
    { what: 'Bags t margin', value: KT.margin, shown: 0.8495, tol: 0.00005 },
    { what: 'Bags t low', value: KT.low, shown: 1001.90 },
    { what: 'Bags t high', value: KT.high, shown: 1003.60 },
    { what: 'Both intervals below 1,004', value: Number(KZ.high < K.setting && KT.high < K.setting), shown: 1 },
    { what: 'Wilson low %', value: W.low * 100, shown: 66.8, tol: 0.05 },
    { what: 'Wilson high %', value: W.high * 100, shown: 85.1, tol: 0.05 },
    { what: 'Wilson centre %', value: W.centre * 100, shown: 76.0, tol: 0.05 },
    { what: 'Wilson centre 4 dp', value: W.centre, shown: 0.7595, tol: 0.00005 },
    { what: 'Wilson half-width', value: W.margin, shown: 0.0912, tol: 0.00005 },
    { what: 'Wilson low about 67', value: W.low * 100, shown: 67, tol: 0.5 },
    { what: 'Complaints Wald low %', value: FEW.low * 100, shown: -0.7, tol: 0.05 },
    { what: 'Complaints Wald high %', value: FEW.high * 100, shown: 15.7, tol: 0.05 },
    { what: 'Complaints Wilson low %', value: FEWW.low * 100, shown: 2.6, tol: 0.05 },
    { what: 'Complaints Wilson high %', value: FEWW.high * 100, shown: 19.9, tol: 0.05 },
    { what: 'Margin 90%', value: m90.margin, shown: 2.87 },
    { what: 'Margin 99%', value: m99.margin, shown: 4.71 },
    { what: 'n for ±2 (raw)', value: n2raw, shown: 64.8, tol: 0.05 },
    { what: 'n for ±2 (raw, 2 dp)', value: n2raw, shown: 64.83 },
    { what: 'n for ±2', value: n2, shown: 65 },
    { what: 'n for ±3', value: n3, shown: 29 },
    { what: 'n for ±1', value: n1, shown: 260 },
    { what: '1.96 × s ÷ 2', value: z975 * S.sd / 2, shown: 8.052, tol: 0.0005 },
    { what: 'Gym n raw', value: nGymRaw, shown: 384.1, tol: 0.05 },
    { what: 'Gym n', value: nGym, shown: 385 },
    { what: 'Gym n at 30%', value: nGym30, shown: 323 },
    { what: '±3 points at 95%', value: I.sampleSizeProp(0.03), shown: 1068 },
    // examples
    { what: 't 90% df 23', value: tCrit(0.9, 23), shown: 1.714, tol: 0.0005 },
    { what: 't 99% df 23', value: tCrit(0.99, 23), shown: 2.807, tol: 0.0005 },
    { what: '90% low', value: m90.low, shown: 35.0, tol: 0.05 },
    { what: '90% high', value: m90.high, shown: 40.7, tol: 0.05 },
    { what: '99% low', value: m99.low, shown: 33.2, tol: 0.05 },
    { what: '99% high', value: m99.high, shown: 42.6, tol: 0.05 },
    { what: 'Set-up SD 3 dp', value: S.sd, shown: 8.216, tol: 0.0005 },
    { what: 'About 38 minutes', value: S.mean, shown: 38, tol: 0.5 },
    { what: 'Wilson 1.96²/158', value: z975 ** 2 / (2 * SURVEY.responses), shown: z975 ** 2 / 158, tol: 1e-12 },
  ],
};
