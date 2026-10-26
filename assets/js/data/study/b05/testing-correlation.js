// testing-correlation.js — B05 · Testing a correlation. Content only; exercises are in testing-correlation.ex.js. Uses
// the cafés' corrected log from case.js: rain and footfall at each café and pooled (DERIVED.rainFootfall,
// rainFootfallH), the day's high and footfall at each café, and eight April days at Harbourside sliced from the log
// for the small-sample example. The t test, power and Type I and II errors are B04's (hypothesis-testing); this lesson
// applies them to r. Testing many correlations at once is correlation-matrices'; slopes and prediction are B06's.
// Every figure printed is recomputed in `checks`.
import { column, CLEAN_ROWS, CAFE_COLUMNS, DERIVED as D } from './case.js?v=20';
import * as C from '../../../core/correlation.js?v=20';
import * as I from '../../../core/inference.js?v=20';

const at = (n) => CAFE_COLUMNS.indexOf(n);
const H = { cafe: 'Harbourside' }, M = { cafe: 'Millbrook' };
// ---------------------------------------------------------------- rain and footfall
const RH = D.rainFootfallH, RP = D.rainFootfall;
const RM = C.pearson(column('rain_in', M), column('footfall', M));
const RM1 = C.pearson(column('rain_in', M), column('footfall', M), { alternative: 'less' });
const RH1 = C.pearson(column('rain_in', H), column('footfall', H), { alternative: 'less' });
const zH = Math.atanh(RH.r), se306 = 1 / Math.sqrt(306 - 3), z975 = I.normInv(0.975);
const cmpRain = C.compareIndependent(RH.r, RH.n, RM.r, RM.n);
const rhoH = C.spearman(column('rain_in', H), column('footfall', H)), tauH = C.kendall(column('rain_in', H), column('footfall', H));
// ---------------------------------------------------------------- the day's high and footfall
const TH = C.pearson(column('high_f', H), column('footfall', H)), TM = C.pearson(column('high_f', M), column('footfall', M));
const cmpTemp = C.compareIndependent(TH.r, TH.n, TM.r, TM.n);
const footHM = C.pearson(column('footfall', H), column('footfall', M)).r;
// ---------------------------------------------------------------- eight April days at Harbourside
const harb = CLEAN_ROWS.filter((r) => r[at('cafe')] === 'Harbourside');
const i8 = harb.findIndex((r) => r[at('date')] === '2027-04-05');
const APR = harb.slice(i8, i8 + 8);
const aT = APR.map((r) => r[at('high_f')]), aF = APR.map((r) => r[at('footfall')]);
const A8 = C.pearson(aT, aF), A8g = C.pearson(aT, aF, { alternative: 'greater' });
const tCrit6 = I.tInv(0.975, 6), z8 = Math.atanh(A8.r), se8 = 1 / Math.sqrt(8 - 3);
// ---------------------------------------------------------------- critical r, power, sample size
const NS = [5, 8, 10, 20, 30, 50, 100, 306, 612];
const crit = NS.map((n) => C.criticalR(n));
const RHOS = [0.1, 0.2, 0.3, 0.5];
const fx = (v, d = 3) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(d);

function critFigure() {
  const L = 60, R = 610, T = 30, B = 230;
  const lx = (n) => L + ((Math.log10(n) - Math.log10(4)) / (Math.log10(1000) - Math.log10(4))) * (R - L);
  const Y = (r) => B - r * (B - T);
  const pts = []; for (let n = 4; n <= 1000; n = Math.ceil(n * 1.06)) pts.push([n, C.criticalR(n)]);
  let svg = '<svg viewBox="0 0 660 290" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">';
  svg += `<path d="M${lx(4).toFixed(1)},${Y(0).toFixed(1)} ${pts.map(([n, r]) => `L${lx(n).toFixed(1)},${Y(r).toFixed(1)}`).join(' ')} L${lx(1000).toFixed(1)},${Y(0).toFixed(1)} Z" fill="var(--series-2)" opacity="0.18"/>`;
  svg += `<path d="${pts.map(([n, r], k) => `${k ? 'L' : 'M'}${lx(n).toFixed(1)},${Y(r).toFixed(1)}`).join(' ')}" fill="none" stroke="var(--series-2)" stroke-width="2"/>`;
  svg += `<line x1="${L}" x2="${R}" y1="${B}" y2="${B}" stroke="var(--ink)"/><line x1="${L}" x2="${L}" y1="${T}" y2="${B}" stroke="var(--ink)"/>`;
  [5, 10, 20, 50, 100, 200, 500, 1000].forEach((n) => { svg += `<line x1="${lx(n).toFixed(1)}" x2="${lx(n).toFixed(1)}" y1="${B}" y2="${B + 5}" stroke="var(--ink)"/><text x="${lx(n).toFixed(1)}" y="${B + 19}" text-anchor="middle" font-size="11" fill="var(--ink-3)">${n.toLocaleString('en-US')}</text>`; });
  [0, 0.25, 0.5, 0.75, 1].forEach((r) => { svg += `<text x="${L - 8}" y="${(Y(r) + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="var(--ink-3)">${r.toFixed(2)}</text>`; });
  svg += `<circle cx="${lx(8).toFixed(1)}" cy="${Y(0.639).toFixed(1)}" r="6" fill="var(--series-1)"/><text x="${(lx(8) + 10).toFixed(1)}" y="${(Y(0.639) + 18).toFixed(1)}" font-size="11">8 April days: r = 0.64, not significant</text>`;
  svg += `<circle cx="${lx(612).toFixed(1)}" cy="${Y(0.138).toFixed(1)}" r="6" fill="var(--series-1)"/><text x="${(lx(612) - 10).toFixed(1)}" y="${(Y(0.138) - 12).toFixed(1)}" text-anchor="end" font-size="11">rain, 612 café-days: |r| = 0.14, significant</text>`;
  svg += `<text x="${lx(30).toFixed(1)}" y="${(Y(0.36) - 12).toFixed(1)}" font-size="11" fill="var(--ink-3)">critical |r| at α = 0.05 (two-sided)</text>`;
  svg += `<text x="${(L + R) / 2}" y="${B + 42}" text-anchor="middle" font-size="11" fill="var(--ink-3)">pairs, n (log scale)</text>`;
  svg += `<text x="16" y="${(T + B) / 2}" text-anchor="middle" font-size="11" fill="var(--ink-3)" transform="rotate(-90 16 ${(T + B) / 2})">|r|</text>`;
  return `${svg}</svg>`;
}

export default {
  slug: 'testing-correlation',
  title: 'Testing a correlation',
  blurb: 'Decide whether a sample correlation is evidence of a real association, put a confidence interval round it with Fisher’s z, and plan how many pairs a study needs. Test rain against footfall at both cafés, see why r = 0.14 is significant with 612 pairs while r = 0.64 is not with 8, and compare the two cafés’ correlations without confusing significance with size.',
  status: 'draft',
  objectives: [
    'State the null and alternative hypotheses for a correlation, and calculate the t statistic r√(n − 2) ÷ √(1 − r²) and its p-value, one- or two-sided, by hand and in Excel.',
    'Calculate the critical value of r for a given n and α, and explain why the same r can be significant with many pairs and not with few.',
    'Construct a confidence interval for a population correlation with Fisher’s z transformation, using FISHER and FISHERINV.',
    'Calculate the power of a correlation test and the number of pairs needed to detect a given correlation.',
    'Compare correlations from two independent samples, and judge whether a significant correlation is large enough to matter.',
  ],
  prerequisites: [
    { lesson: 'b04/hypothesis-testing', why: 'Null and alternative hypotheses, p-values, one- and two-sided tests, α, power and Type I and II errors are used here without re-teaching.' },
    { lesson: 'b04/confidence-intervals', why: 'An interval as estimate ± critical value × standard error, and what 95% confidence means.' },
    { lesson: 'b05/rank-correlation', why: 'Spearman’s ρ and Kendall’s τ-b, whose tests are mentioned here.' },
    { lesson: 'b05/covariance-and-pearson', why: 'Pearson’s r and r², the statistic this lesson tests.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Ana suspects rain keeps customers away. At Harbourside, the waterfront café, the daily log for 1 March to 31 December 2027 gives a correlation of −0.23 between the day’s rain and the number of people through the door. At Millbrook, in the office district, the same 306 days give −0.10. Both are negative, both are small. Is either more than the scatter that 306 days of chance could produce if rain made no difference at all?' },

    { h: 'The question a test answers' },
    { p: String.raw`Ana’s log is a sample: 306 days of one year, from all the days the cafés might trade under similar conditions. The correlation in that population is written <m>\rho</m> (rho); the sample’s <m>r</m> estimates it. Even if <m>\rho</m> were exactly 0, a sample of days would almost never give r = 0 exactly: random variation pushes it a little above or below. The test asks whether Ana’s r is further from 0 than that variation would plausibly take it.` },
    { p: 'In the language of the hypothesis-testing lesson (B04):' },
    { math: String.raw`H_0: \rho = 0 \qquad H_1: \rho \ne 0` },
    { p: 'The null hypothesis says there is no linear association in the population; the two-sided alternative says there is one, in either direction. This is the test OpenStax’s statistics texts give for the “significance of the correlation coefficient”, and the one software reports beside r.' },

    { h: 'The t statistic' },
    { p: String.raw`If <m>H_0</m> is true and the conditions below hold, the statistic` },
    { math: String.raw`t = \dfrac{r\sqrt{n - 2}}{\sqrt{1 - r^2}}` },
    { p: String.raw`follows the t distribution with <m>n - 2</m> <g>degrees of freedom</g>. Two degrees of freedom are used up because a correlation is measured round two estimated means. For Harbourside, <m>t = -0.2276 \times \sqrt{304} \div \sqrt{1 - 0.2276^2} = -4.08</m> with 304 degrees of freedom, and the two-sided p-value, <x>=T.DIST.2T(ABS(-4.075),304)</x>, is below 0.001. If rain made no difference to Harbourside’s footfall, a correlation as far from 0 as −0.23 would turn up in fewer than 1 sample of 306 days in 1,000. Ana rejects <m>H_0</m>: rainier days go with fewer people at Harbourside.` },
    { p: String.raw`At Millbrook, r = −0.102 gives t = −1.79 and a two-sided p-value of 0.074. At α = 0.05 Ana fails to reject <m>H_0</m>: the log is compatible with no linear association between rain and footfall at Millbrook, though, as B04 stressed, that is not evidence that there is none.` },

    { h: 'Why n matters so much' },
    { p: String.raw`The formula rewards sample size. Turned round, it gives the smallest |r| that is significant for a given n, the <g>critical value of r</g>. At α = 0.05, two-sided, it is 0.707 for 8 pairs, 0.361 for 30, 0.197 for 100 and 0.079 for 612.` },
    { figure: {
      svg: critFigure(),
      caption: 'The critical value of |r| at α = 0.05 (two-sided) against the number of pairs, on a log scale. Correlations above the curve are significant. Eight April days at Harbourside give r = 0.64 for temperature and footfall, below the curve; the 612 café-days give |r| = 0.14 for rain and footfall, above it.',
      alt: 'A falling curve over a horizontal axis of the number of pairs from 4 to 1,000 on a log scale, with |r| from 0 to 1 on the vertical axis. The curve starts near 0.95 at 4 pairs, passes 0.71 at 8 and about 0.36 at 30, and falls below 0.1 by about 500 pairs. The area under the curve is shaded. One point at 8 pairs and r = 0.64 sits under the curve, labelled 8 April days: r = 0.64, not significant. Another at 612 pairs and |r| = 0.14 sits above the curve, labelled rain, 612 café-days: |r| = 0.14, significant.',
    } },
    { p: 'Two consequences follow. With 612 café-days, rain’s pooled correlation with footfall, r = −0.14, is significant (p = 0.001) although r² = 0.019: rain accounts for under 2% of the day-to-day variation in footfall. And eight days in April, 5–12 April at Harbourside, give r = 0.64 between the day’s high and footfall, which looks strong, but p = 0.088: with 8 pairs a correlation that size is well within what chance produces. A <g>p-value</g> answers “could this be chance?”, not “is this large?”.' },
    { callout: 'key', title: 'What the test does and doesn’t say', html: 'Rejecting H₀: ρ = 0 says the sample correlation is unlikely to have arisen by chance if the population correlation were 0. It doesn’t say the association is strong, that it is linear, that one variable causes the other, or that it holds outside the period sampled. Report r with its confidence interval, not the p-value alone.' },
  ],

  theory: [
    { h: 'Conditions' },
    { p: 'The t test of r rests on assumptions. OpenStax lists them in regression terms: a linear relationship; for each x, y values roughly normal around the line with the same spread; independent errors; and data from a random sample or a randomised experiment. In practice: plot the data first (a curve or a slip can make r, and its test, misleading), and ask whether the pairs are independent.' },
    { p: 'Independence is the condition most often broken by business data. Ana’s days come in sequence, and neighbouring days are alike: a wet spell lasts several days, and footfall drifts with the season. Days that resemble their neighbours carry less independent information than their number suggests, so the test treats 306 days as more evidence than they are and its p-values come out too small. Pooling the cafés adds a second problem: each day’s rain appears twice, once for each café, so the 612 rows hold only 306 different weather days. Treat a p-value from a time series as a rough guide, and be most cautious when it is near α.' },

    { h: 'One-sided and two-sided tests' },
    { p: String.raw`If the question, fixed before looking at the data, is whether rain goes with <i>fewer</i> customers, the alternative is one-sided, <m>H_1: \rho < 0</m>, and the p-value is the lower tail, <x>=T.DIST(t,n-2,TRUE)</x>. For Millbrook that is 0.037, half the two-sided 0.074, and below 0.05. This is exactly the temptation the hypothesis-testing lesson warned about: switching to one-sided after seeing the two-sided p-value doubles the real false-alarm rate. Ana’s question when she started the log was “does rain make any difference?”, so she keeps the two-sided test.` },

    { h: 'Critical values of r' },
    { p: String.raw`Solving <m>t = r\sqrt{n-2}/\sqrt{1-r^2}</m> for r at the critical t gives the critical value of r directly:` },
    { math: String.raw`r_{\text{crit}} = \dfrac{t_{\text{crit}}}{\sqrt{n - 2 + t_{\text{crit}}^2}}, \qquad t_{\text{crit}} = \texttt{T.INV.2T}(\alpha,\, n-2)` },
    { table: {
      caption: 'Smallest |r| significant at α = 0.05, two-sided',
      head: ['Pairs (n)', '5', '8', '10', '20', '30', '50', '100', '306', '612'],
      rows: [['Critical |r|', ...crit.map((v) => v.toFixed(3))]],
      align: ['l', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r'],
    } },
    { p: 'OpenStax’s Method 2 uses a printed table like this one instead of a p-value. The table makes the trade-off plain: with a handful of pairs only very strong correlations can be told apart from chance, and with hundreds almost any correlation can.' },

    { h: 'A confidence interval for ρ' },
    { p: String.raw`A confidence interval says how large the population correlation plausibly is, which a p-value doesn’t. The sampling distribution of r is skewed when <m>\rho</m> is far from 0 (r can’t go above 1), so the usual estimate ± margin doesn’t work. <g>Fisher’s z transformation</g> fixes this: <m>z = \operatorname{atanh}(r) = \tfrac{1}{2}\ln\frac{1+r}{1-r}</m> is close to normal with standard error <m>1/\sqrt{n-3}</m>, whatever <m>\rho</m> is. Build the interval for z, then transform its ends back with <m>\tanh</m>.` },
    { p: String.raw`For Harbourside’s rain: <m>z = \operatorname{atanh}(-0.2276) = -0.2316</m>, <m>SE = 1/\sqrt{303} = 0.0574</m>, so the 95% interval for z is <m>-0.2316 \pm 1.96 \times 0.0574</m>, from −0.3442 to −0.1190. Back-transformed, the interval for <m>\rho</m> runs from −0.331 to −0.118. In Excel: <x>=FISHERINV(FISHER(B1)-NORM.S.INV(0.975)/SQRT(B2-3))</x> and <x>=FISHERINV(FISHER(B1)+NORM.S.INV(0.975)/SQRT(B2-3))</x>, with r in B1 and n in B2.` },
    { p: 'The interval is not symmetric about r: it stretches further on the side away from ±1. It also agrees with the test: it excludes 0, as a two-sided test at 5% that rejects ρ = 0 requires (approximately, since the test uses t and the interval Fisher’s z). Millbrook’s interval, −0.212 to 0.010, includes 0. For the eight April days it runs from −0.120 to 0.926: anything from a weak negative association to a near-perfect positive one. That width is the honest summary of what eight days can say.' },

    { h: 'Testing a value other than 0' },
    { p: String.raw`Sometimes the question is not whether <m>\rho</m> is 0 but whether it exceeds some value that matters, such as 0.3. The t test above works only for <m>\rho_0 = 0</m>; Fisher’s z handles any value: <m>z = (\operatorname{atanh} r - \operatorname{atanh}\rho_0)\sqrt{n-3}</m>, compared with the standard normal. For Harbourside’s day’s high and footfall, r = 0.436 over 306 days; against <m>\rho_0 = 0.3</m>, z = 2.75 and the two-sided p-value is 0.006.` },

    { h: 'Tests of rank correlations' },
    { p: 'Spearman’s ρ is usually tested with the same t statistic, applied to the ranks, and Kendall’s τ with a normal approximation to its distribution. Both are approximations, good for moderate samples; for small samples without ties, exact tables or permutation tests are better. For rain and footfall at Harbourside, Spearman’s ρ = −0.226 and τ-b = −0.173, both with p below 0.001: the same conclusion as r, without relying on normality.' },

    { h: 'Power and sample size' },
    { p: String.raw`Power, from the hypothesis-testing lesson, is the chance of rejecting <m>H_0</m> when a particular alternative is true. Fisher’s z gives a simple approximation: with true correlation <m>\rho</m> and n pairs, the test of <m>\rho = 0</m> rejects (two-sided, α = 0.05) with probability about <m>\Phi(\operatorname{atanh}|\rho|\sqrt{n-3} - 1.96)</m>. Turned round, the pairs needed for power <m>1 - \beta</m> are` },
    { math: String.raw`n = \left(\dfrac{z_{1-\alpha/2} + z_{1-\beta}}{\operatorname{atanh}\rho}\right)^{2} + 3` },
    { table: {
      caption: 'Pairs needed for 80% power, two-sided test at α = 0.05',
      head: ['True correlation ρ', '0.1', '0.2', '0.3', '0.5'],
      rows: [['Pairs needed', ...RHOS.map((r) => String(C.sampleSize(r)))]],
      align: ['l', 'r', 'r', 'r', 'r'],
    } },
    { p: 'Halving the correlation to detect roughly quadruples the pairs needed. Millbrook’s 306 days had about a 42% chance of detecting a true correlation of −0.1 between rain and footfall: its non-significant result is weak evidence of anything. And eight days had only an 18% chance of detecting a correlation as large as the year’s 0.44 between Harbourside’s high and its footfall.' },

    { h: 'Comparing two correlations' },
    { p: String.raw`Harbourside’s rain correlation is significant and Millbrook’s is not. It is tempting to conclude that rain matters more at the waterfront, but “significant here, not significant there” is not a test of a difference. Compare the correlations directly. For two independent samples, transform each with Fisher’s z and use` },
    { math: String.raw`z = \dfrac{\operatorname{atanh} r_1 - \operatorname{atanh} r_2}{\sqrt{\dfrac{1}{n_1 - 3} + \dfrac{1}{n_2 - 3}}}` },
    { p: 'For rain and footfall, −0.228 at Harbourside against −0.102 at Millbrook gives z = −1.59 and a two-sided p-value of 0.11: no convincing evidence that the two correlations differ. For the day’s high and footfall the picture is different: 0.436 at Harbourside against 0.157 at Millbrook gives z = 3.81, p below 0.001. Warm weather goes with more customers at the waterfront than in the office district, which fits what each café is.' },
    { p: 'One caution. This formula assumes the samples are independent, and the cafés’ logs are not quite: they cover the same 306 days, share the same rain and temperatures, and their daily footfalls are themselves correlated (−0.39: weekends are busy at Harbourside and quiet at Millbrook). Tests that allow for overlapping samples exist but are beyond this course; treat the z here as approximate.' },

    { h: 'Statistical and practical significance' },
    { p: 'A significant correlation can be too small to matter, and an important one can fail to reach significance in a small sample. Judge size by r, its interval and r², in the context of the decision. Rain’s pooled r of −0.14 is significant but explains under 2% of the variation in footfall; Ana would not reschedule staff on rain forecasts on that evidence. How many customers an inch of rain costs is a slope, a question for regression in B06, not for r.' },
    { p: 'Finally, every test here is one test. Ana could test all 28 pairs of eight columns in her log, and at α = 0.05 more than one would be significant by chance even if nothing were related. The correlation-matrices lesson shows how to adjust for that.' },
  ],

  formulas: [
    { id: 'test-r-t', name: 't test of a correlation (H₀: ρ = 0)',
      tex: String.raw`t = \dfrac{r\sqrt{n - 2}}{\sqrt{1 - r^2}}, \qquad \text{df} = n - 2`,
      where: [[String.raw`r`, 'Sample Pearson correlation (CORREL)', ''], [String.raw`n`, 'Number of pairs', ''], [String.raw`t`, 'Test statistic, compared with the t distribution', ''], [String.raw`\text{df}`, 'Degrees of freedom', '']],
      assumptions: 'Independent pairs from a random sample; a linear relationship; y roughly normal around the line with constant spread.',
      note: 'Two-sided p-value: <x>=T.DIST.2T(ABS(t),n-2)</x>; lower tail <x>=T.DIST(t,n-2,TRUE)</x>; upper tail <x>=T.DIST.RT(t,n-2)</x>.' },
    { id: 'test-r-crit', name: 'Critical value of r',
      tex: String.raw`r_{\text{crit}} = \dfrac{t_{\text{crit}}}{\sqrt{n - 2 + t_{\text{crit}}^2}}`,
      where: [[String.raw`r_{\text{crit}}`, 'Smallest |r| significant at level α', ''], [String.raw`t_{\text{crit}}`, 'Critical t with n − 2 degrees of freedom: T.INV.2T(α, n − 2) for a two-sided test', ''], [String.raw`n`, 'Number of pairs', '']],
      note: 'For a one-sided test use T.INV(1 − α, n − 2).' },
    { id: 'test-fisher-ci', name: 'Confidence interval for ρ by Fisher’s z',
      tex: String.raw`\tanh\!\left(\operatorname{atanh} r \pm \dfrac{z^*}{\sqrt{n - 3}}\right)`,
      where: [[String.raw`\operatorname{atanh} r`, 'Fisher’s z of the sample correlation, ½ ln((1 + r) ÷ (1 − r)); Excel’s FISHER', ''], [String.raw`z^*`, 'Standard normal critical value (1.96 for 95%)', ''], [String.raw`n`, 'Number of pairs', ''], [String.raw`\tanh`, 'The inverse transformation; Excel’s FISHERINV', '']],
      assumptions: 'Independent pairs; the two variables roughly bivariate normal.',
      note: 'The interval is not symmetric about r.' },
    { id: 'test-fisher-rho0', name: 'Test of H₀: ρ = ρ₀ by Fisher’s z',
      tex: String.raw`z = \left(\operatorname{atanh} r - \operatorname{atanh}\rho_0\right)\sqrt{n - 3}`,
      where: [[String.raw`\rho_0`, 'The population correlation under the null hypothesis', ''], [String.raw`r`, 'Sample correlation', ''], [String.raw`n`, 'Number of pairs', ''], [String.raw`z`, 'Test statistic, compared with the standard normal', '']],
      note: 'For ρ₀ = 0 it gives nearly the same answer as the t test, which is the usual choice.' },
    { id: 'test-compare', name: 'Comparing two independent correlations',
      tex: String.raw`z = \dfrac{\operatorname{atanh} r_1 - \operatorname{atanh} r_2}{\sqrt{\dfrac{1}{n_1 - 3} + \dfrac{1}{n_2 - 3}}}`,
      where: [[String.raw`r_1, r_2`, 'The two sample correlations', ''], [String.raw`n_1, n_2`, 'Their numbers of pairs', ''], [String.raw`z`, 'Test statistic, compared with the standard normal', '']],
      assumptions: 'The two samples are independent of each other.',
      note: 'Two-sided p-value: <x>=2*(1-NORM.S.DIST(ABS(z),TRUE))</x>.' },
    { id: 'test-n-pairs', name: 'Pairs needed to detect a correlation',
      tex: String.raw`n = \left(\dfrac{z_{1-\alpha/2} + z_{1-\beta}}{\operatorname{atanh}\rho}\right)^{2} + 3`,
      where: [[String.raw`n`, 'Pairs needed, rounded up', ''], [String.raw`z_{1-\alpha/2}`, 'Standard normal value for a two-sided test at α (1.96 for 0.05)', ''], [String.raw`z_{1-\beta}`, 'Standard normal value for the power (0.842 for 80%)', ''], [String.raw`\rho`, 'The smallest true correlation worth detecting', '']],
      note: 'Power at a given n: Φ(atanh|ρ| √(n − 3) − z₁₋α/₂), ignoring the tiny chance of rejecting in the wrong direction.' },
  ],

  examples: [
    { level: 'simple', title: 'Rain and footfall at Harbourside', fictional: true,
      setup: 'Across Harbourside’s 306 days, the correlation between the day’s rain (inches) and footfall is r = −0.2276. Test H₀: ρ = 0 against H₁: ρ ≠ 0 at α = 0.05.',
      steps: [
        'Hypotheses, chosen before looking: H₀: ρ = 0 (no linear association between rain and footfall), H₁: ρ ≠ 0. Two-sided, because Ana’s question was whether rain makes any difference.',
        String.raw`Statistic: <m>t = -0.2276 \times \sqrt{304} \div \sqrt{1 - 0.0518} = -3.968 \div 0.9738 = -4.08</m>, with n − 2 = 304 degrees of freedom.`,
        'P-value: <x>=T.DIST.2T(ABS(-4.075),304)</x> = 0.00006, below 0.001. Equivalently, |r| = 0.228 exceeds the critical value for 306 pairs, 0.112.',
        'Decision: p is below 0.05, so reject H₀.',
        'Interval: the Fisher-z 95% interval for ρ runs from −0.331 to −0.118.',
      ],
      answer: 't = −4.08 with 304 degrees of freedom, p below 0.001: reject H₀. 95% interval for ρ: −0.331 to −0.118.',
      interpretation: 'Rainier days go with fewer people through Harbourside’s door, and the association is unlikely to be chance. It is modest: even the interval’s far end, −0.33, means rain accounts for at most about a tenth of the variation in footfall. Rain is zero on two days in three, so the result largely contrasts wet days with dry ones; and since neighbouring days are alike, the p-value is somewhat smaller than it should be, though not by enough to change the decision.' },
    { level: 'challenging', title: 'Eight days in April against a whole year', fictional: true,
      setup: 'In her first weeks Ana noted Harbourside’s high and footfall for 5–12 April 2027 and found r = 0.639 over the 8 days. Is that significant at α = 0.05 (two-sided)? What does the confidence interval say, how much power did 8 days have to detect the correlation the whole year turned out to show (0.436), and how many days would 80% power need?',
      table: { head: ['Day', 'High (°F)', 'Footfall'], rows: APR.map((r, k) => [`${r[at('weekday')]} ${Number(r[at('date')].slice(8))} Apr`, String(aT[k]), String(aF[k])]), align: ['l', 'r', 'r'] },
      steps: [
        String.raw`Test: <m>t = 0.639 \times \sqrt{6} \div \sqrt{1 - 0.639^2} = 1.565 \div 0.769 = 2.03</m> with 6 degrees of freedom; <x>=T.DIST.2T(2.033,6)</x> = 0.088. The critical value for 8 pairs is 0.707, and 0.639 is below it. Fail to reject H₀.`,
        String.raw`Interval: <m>\operatorname{atanh}(0.639) = 0.756</m>, SE <m>= 1/\sqrt{5} = 0.447</m>, so z runs from <m>0.756 - 1.96 \times 0.447 = -0.121</m> to 1.632; back-transformed, ρ is between −0.120 and 0.926.`,
        String.raw`Power for ρ = 0.436 with 8 pairs: <m>\operatorname{atanh}(0.436) \times \sqrt{5} - 1.96</m> is about −0.92, and <m>\Phi(-0.92) \approx 0.18</m>. Eight days would detect a correlation of that size less than one time in five.`,
        String.raw`Pairs for 80% power: <m>n = ((1.960 + 0.842) \div \operatorname{atanh}(0.436))^2 + 3 \approx 38.9</m>, so 39 days.`,
        'Compare with the year: over all 306 days r = 0.436, t = 8.45, p below 0.001.',
      ],
      answer: 'Not significant: t = 2.03, 6 df, p = 0.088; 95% interval −0.120 to 0.926. Eight days had about 18% power for ρ = 0.436; 80% power needs 39 days.',
      interpretation: 'A large r from a small sample is weak evidence: the interval covers almost everything from a slight negative link to a near-perfect positive one, and the test had little chance of succeeding. Failing to reject was not evidence that temperature doesn’t matter; the full year shows it does. A one-sided test would have given p = 0.044, but choosing it after seeing the direction would be p-hacking. The useful habit is to plan the number of days from the smallest correlation worth detecting before collecting the data.' },
    { level: 'applied', title: 'Does rain matter more at the waterfront?', fictional: true,
      setup: 'Ana is deciding whether to put a rain-day promotion (a free pastry with a coffee on wet days) at Harbourside only. Her evidence: rain and footfall correlate at r = −0.228 at Harbourside (p below 0.001) and r = −0.102 at Millbrook (p = 0.074), 306 days each. Does the log show that rain’s association with footfall differs between the cafés, and how large is it?',
      steps: [
        'Don’t compare the p-values. “Significant at Harbourside, not at Millbrook” doesn’t show a difference: Millbrook’s test had only about 42% power for a correlation of −0.1.',
        String.raw`Compare the correlations: <m>\operatorname{atanh}(-0.228) = -0.232</m> and <m>\operatorname{atanh}(-0.102) = -0.103</m>; <m>SE = \sqrt{1/303 + 1/303} = 0.0812</m>; <m>z = (-0.232 + 0.103) \div 0.0812 = -1.59</m>; two-sided p = 0.11.`,
        'Check the assumption: the samples share the same 306 days and the same weather, and the cafés’ daily footfalls correlate at −0.39, so the formula’s independence assumption holds only roughly. The p-value is an approximation.',
        'Judge the size: r² is 0.052 at Harbourside and 0.010 at Millbrook. Even at Harbourside rain accounts for about 5% of the day-to-day variation in footfall.',
      ],
      answer: 'No convincing evidence of a difference: z = −1.59, p = 0.11. Both associations are small (r² of 5% and 1%).',
      interpretation: 'The log supports “rainy days are a little quieter at Harbourside”, not “rain matters at Harbourside and not at Millbrook”. If Ana wants to know whether a rain-day promotion pays, the correlation can’t tell her: she could run it on some wet days and not others and compare (the correlation-and-causation lesson discusses why that is stronger evidence). Temperature is a different story: its correlation with footfall is 0.436 at Harbourside against 0.157 at Millbrook, a difference with p below 0.001.' },
  ],

  demo: [
    { widget: 'test-rain', intro: 'All 612 café-days: rain against footfall. Pooled, r = −0.138 with p = 0.001. Tick “Colour by café” to see each café’s own r: −0.228 at Harbourside, −0.102 at Millbrook. Note how narrow the 95% interval is with 612 pairs.' },
    { widget: 'test-explorer', intro: 'Set r and n and read t, the p-value, the critical value of r and the Fisher-z interval. Try r = 0.64 with n = 8, then with n = 30; then r = 0.14 with n = 612 and with n = 50. The chart shows how the critical value falls as n grows.' },
    { widget: 'test-power', intro: 'How many pairs does a study need? Set the smallest correlation worth detecting and the power you want; the panel shows the pairs needed and the power of Ana’s 306 days. Halve ρ and watch n roughly quadruple.' },
    { widget: 'test-sheet', intro: 'The eight April days with the whole test as formulas: CORREL, the t statistic, T.DIST.2T, the critical r and the Fisher-z interval with FISHER and FISHERINV. Change a footfall figure, or the confidence level in E9, and watch every result update.' },
  ],

  mistakes: [
    { title: '“p is below 0.001, so the correlation is strong.”', html: 'The p-value measures how surprising r would be if ρ were 0; with hundreds of pairs even a trivial r passes. Rain’s pooled r = −0.14 is significant with 612 pairs and explains under 2% of the variation in footfall. Report r, its interval and r².' },
    { title: '“r = 0.64 isn’t significant, so temperature and footfall are unrelated.”', html: 'With 8 pairs the critical value is 0.707 and the test had about 18% power for the true correlation. Failing to reject is a lack of evidence, not evidence of no link; the interval, −0.12 to 0.93, shows how little 8 days can say.' },
    { title: '“Harbourside is significant and Millbrook isn’t, so rain matters more at Harbourside.”', html: 'A difference in significance is not a significant difference. Test the difference directly with Fisher’s z: for rain, z = −1.59 and p = 0.11. Here too the two samples share their days, so even that test is approximate.' },
    { title: 'Building the interval as r ± 1.96 × SE', html: 'The sampling distribution of r is skewed and bounded by ±1, so a symmetric interval can be wrong or even run past 1. Transform with FISHER, add and subtract 1.96 ÷ √(n − 3), and transform back with FISHERINV.' },
    { title: 'Treating 612 rows as 612 independent observations', html: 'Pooling the cafés repeats each day’s rain twice, and neighbouring days are alike. The test assumes independent pairs; when that fails its p-values are too small. Analyse each café separately and treat p-values from daily series as approximate.' },
    { title: 'Choosing the one-sided test after seeing the result', html: 'Millbrook’s two-sided p = 0.074 becomes 0.037 one-sided. Unless the one-sided question was fixed before the data were seen, halving the p-value doubles the real chance of a false alarm.' },
  ],

  application: [
    { case: 'Ana’s note on weather for the year-end review reads: “Rain: at Harbourside, r = −0.23 between rain and footfall (306 days; 95% CI −0.33 to −0.12; p &lt; 0.001); at Millbrook r = −0.10 (CI −0.21 to 0.01; p = 0.07). The difference between the cafés is not significant (p = 0.11). Rain accounts for about 5% of the day-to-day variation in footfall at Harbourside and 1% at Millbrook. Temperature matters more at the waterfront: r = 0.44 at Harbourside against 0.16 at Millbrook (difference p &lt; 0.001). Days are not independent, so treat p-values as approximate.”' },
    { p: 'The note gives every correlation with its interval and its n, says which test was used, and separates three questions that are easily blurred: is there an association (the test), how large is it (r, r² and the interval), and does it differ between groups (the comparison). It also states the limitation that matters most for daily data. A manager reading it can see that the rain effect is real but small, and that temperature, not rain, is the weather variable worth planning around at Harbourside.' },
    { p: 'The same pattern appears wherever correlations are reported. A retailer with millions of loyalty-card transactions will find significant correlations everywhere, and must ask which are large enough to act on. A hotel testing whether guest satisfaction tracks room price at its 12 properties can’t expect significance for anything but a very strong link, and should plan more data (or report the interval) rather than conclude “no relationship”. A battery-storage installer comparing the correlation between site temperature and system efficiency in two regions needs the Fisher-z comparison, not two separate p-values.' },
    { p: 'Two habits carry over. Plan the sample from the smallest correlation that would change a decision: 85 pairs for ρ = 0.3 at 80% power, 783 for ρ = 0.1. And when a correlation is significant, remember it is still only an association: whether warm days bring customers to the waterfront or something else drives both is the correlation-and-causation lesson’s question.' },
  ],

  summary: [
    'Test H₀: ρ = 0 with t = r√(n − 2) ÷ √(1 − r²) and n − 2 degrees of freedom: <x>=T.DIST.2T(ABS(t),n-2)</x> two-sided. Choose one- or two-sided before seeing the data.',
    'The critical |r| falls fast with n: 0.707 for 8 pairs, 0.197 for 100, 0.079 for 612. Large samples make small correlations significant; small samples leave large ones unproven.',
    'A confidence interval for ρ uses Fisher’s z: atanh(r) ± 1.96 ÷ √(n − 3), transformed back with tanh (FISHER and FISHERINV). It is not symmetric about r.',
    'Pairs needed for 80% power, two-sided at 5%: about 783 for ρ = 0.1, 194 for 0.2, 85 for 0.3 and 30 for 0.5.',
    'Compare two independent correlations with Fisher’s z, not by their separate p-values; samples that share days are not independent.',
    'Significance is not size: report r, its interval and r², and judge whether the association matters for the decision.',
    'The test assumes independent pairs and a linear relationship: plot first, and treat p-values from daily time series as approximate.',
  ],

  glossary: [
    { term: 'Population correlation', def: 'The correlation between two variables across the whole population the sample comes from, written ρ (rho). A sample correlation r estimates it.' },
    { term: 'Critical value of r', def: 'The smallest absolute value of a sample correlation that is statistically significant at a chosen level for a given number of pairs: t_crit ÷ √(n − 2 + t_crit²).' },
    { term: 'Fisher’s z transformation', def: 'z = atanh(r) = ½ ln((1 + r) ÷ (1 − r)), which turns a correlation into a quantity that is close to normally distributed with standard error 1 ÷ √(n − 3). Used for confidence intervals for ρ and for comparing correlations. Excel’s FISHER; FISHERINV reverses it.' },
    { term: 'Independent samples', def: 'Samples in which the observations in one have no connection with the observations in the other, such as different customers or different stores. Measurements of the same days, people or items are not independent samples.' },
  ],

  references: [
    { text: 'Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Statistics 2e</i>, section 12.4, “Testing the Significance of the Correlation Coefficient”. OpenStax.', url: 'https://openstax.org/books/introductory-statistics-2e/pages/12-4-testing-the-significance-of-the-correlation-coefficient', checked: '2026-10-26' },
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Business Statistics 2e</i>, section 13.2, “Testing the Significance of the Correlation Coefficient”. OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/13-2-testing-the-significance-of-the-correlation-coefficient', checked: '2026-10-26' },
    { text: 'Microsoft Support. “FISHER function”.', url: 'https://support.microsoft.com/en-US/excel/functions/fisher-function', checked: '2026-10-26' },
    { text: 'Microsoft Support. “FISHERINV function”.', url: 'https://support.microsoft.com/en-US/excel/functions/fisherinv-function', checked: '2026-10-26' },
  ],

  checks: [
    // the opening: rain at each café
    { what: 'Harbourside rain r (2 dp)', value: RH.r, shown: -0.23 },
    { what: 'Harbourside rain r (4 dp)', value: RH.r, shown: -0.2276, tol: 0.00005 },
    { what: 'Harbourside rain r (3 dp)', value: RH.r, shown: -0.228, tol: 0.0005 },
    { what: 'Millbrook rain r (2 dp)', value: RM.r, shown: -0.10 },
    { what: 'Millbrook rain r (3 dp)', value: RM.r, shown: -0.102, tol: 0.0005 },
    { what: 'Days per café', value: RH.n, shown: 306 },
    { what: 'Harbourside df', value: RH.df, shown: 304 },
    { what: 'Harbourside t', value: RH.t, shown: -4.08 },
    { what: 'Harbourside t (3 dp)', value: RH.t, shown: -4.075, tol: 0.0005 },
    { what: 'Harbourside p below 0.001', value: Number(RH.p < 0.001), shown: 1 },
    { what: 'Harbourside p (5 dp)', value: RH.p, shown: 0.00006, tol: 0.000005 },
    { what: 'T.DIST.2T(4.075,304)', value: 2 * (1 - I.tCdf(4.075, 304)), shown: 0.00006, tol: 0.000005 },
    { what: 'Fewer than 1 in 1,000', value: Number(RH.p < 1 / 1000), shown: 1 },
    { what: 'r² at Harbourside', value: RH.r ** 2, shown: 0.0518, tol: 0.00005 },
    { what: 'r√304 (3 dp)', value: RH.r * Math.sqrt(304), shown: -3.968, tol: 0.0005 },
    { what: '√(1 − r²) (4 dp)', value: Math.sqrt(1 - RH.r ** 2), shown: 0.9738, tol: 0.00005 },
    { what: 'Millbrook t', value: RM.t, shown: -1.79 },
    { what: 'Millbrook p', value: RM.p, shown: 0.074, tol: 0.0005 },
    { what: 'Millbrook p (2 dp)', value: RM.p, shown: 0.07 },
    { what: 'Millbrook one-sided p', value: RM1.p, shown: 0.037, tol: 0.0005 },
    { what: 'One-sided p is half', value: RM.p / RM1.p, shown: 2, tol: 1e-9 },
    { what: 'Harbourside one-sided p also tiny', value: Number(RH1.p < 0.001), shown: 1 },
    // critical values
    { what: 'Critical r, 8 pairs', value: C.criticalR(8), shown: 0.707, tol: 0.0005 },
    { what: 'Critical r, 30 pairs', value: C.criticalR(30), shown: 0.361, tol: 0.0005 },
    { what: 'Critical r, 100 pairs', value: C.criticalR(100), shown: 0.197, tol: 0.0005 },
    { what: 'Critical r, 306 pairs', value: C.criticalR(306), shown: 0.112, tol: 0.0005 },
    { what: 'Critical r, 612 pairs', value: C.criticalR(612), shown: 0.079, tol: 0.0005 },
    { what: 'Critical r formula agrees (8)', value: tCrit6 / Math.sqrt(6 + tCrit6 ** 2), shown: C.criticalR(8), tol: 1e-12 },
    { what: 'Figure: critical r at 4 pairs near 0.95', value: C.criticalR(4), shown: 0.95, tol: 0.005 },
    { what: 'Figure: critical r below 0.1 by about 500', value: Number(C.criticalR(500) < 0.1 && C.criticalR(380) > 0.1), shown: 1 },
    // pooled rain
    { what: 'Pooled rows', value: RP.n, shown: 612 },
    { what: 'Pooled rain r', value: RP.r, shown: -0.14 },
    { what: 'Pooled rain r (3 dp)', value: RP.r, shown: -0.138, tol: 0.0005 },
    { what: 'Pooled rain p', value: RP.p, shown: 0.001, tol: 0.0005 },
    { what: 'Pooled rain r²', value: RP.r2, shown: 0.019, tol: 0.0005 },
    { what: 'Under 2%', value: Number(RP.r2 < 0.02), shown: 1 },
    // eight April days
    { what: 'April days', value: APR.length, shown: 8 },
    { what: 'April window starts 5 April', value: Number(APR[0][at('date')] === '2027-04-05' && APR[7][at('date')] === '2027-04-12'), shown: 1 },
    { what: 'April r', value: A8.r, shown: 0.639, tol: 0.0005 },
    { what: 'April r (2 dp)', value: A8.r, shown: 0.64 },
    { what: 'April t', value: A8.t, shown: 2.03 },
    { what: 'April t (3 dp)', value: A8.t, shown: 2.033, tol: 0.0005 },
    { what: 'April df', value: A8.df, shown: 6 },
    { what: 'April p', value: A8.p, shown: 0.088, tol: 0.0005 },
    { what: 'April one-sided p', value: A8g.p, shown: 0.044, tol: 0.0005 },
    { what: '0.639 × √6', value: 0.639 * Math.sqrt(6), shown: 1.565, tol: 0.0005 },
    { what: '√(1 − 0.639²)', value: Math.sqrt(1 - 0.639 ** 2), shown: 0.769, tol: 0.0005 },
    { what: 'April atanh', value: z8, shown: 0.756, tol: 0.0005 },
    { what: '1/√5', value: se8, shown: 0.447, tol: 0.0005 },
    { what: 'April z lower', value: z8 - z975 * se8, shown: -0.121, tol: 0.0005 },
    { what: 'April z upper', value: z8 + z975 * se8, shown: 1.632, tol: 0.0005 },
    { what: 'April CI lower', value: A8.ci[0], shown: -0.120, tol: 0.0005 },
    { what: 'April CI upper', value: A8.ci[1], shown: 0.926, tol: 0.0005 },
    { what: 'April CI lower (2 dp)', value: A8.ci[0], shown: -0.12 },
    { what: 'April CI upper (2 dp)', value: A8.ci[1], shown: 0.93 },
    { what: 'Year r high–footfall Harbourside', value: TH.r, shown: 0.436, tol: 0.0005 },
    { what: 'Year r high–footfall Harbourside (2 dp)', value: TH.r, shown: 0.44 },
    { what: 'Year t', value: TH.t, shown: 8.45 },
    { what: 'Year p below 0.001', value: Number(TH.p < 0.001), shown: 1 },
    { what: 'Power of 8 days for 0.436', value: C.power(0.436, 8), shown: 0.18 },
    { what: 'Power argument', value: Math.atanh(0.436) * Math.sqrt(5) - 1.96, shown: -0.92, tol: 0.005 },
    { what: 'Φ(−0.92)', value: I.normCdf(-0.92), shown: 0.18 },
    { what: 'Pairs raw for 0.436', value: ((z975 + I.normInv(0.8)) / Math.atanh(0.436)) ** 2 + 3, shown: 38.9, tol: 0.05 },
    { what: 'Pairs for 0.436', value: C.sampleSize(0.436), shown: 39 },
    { what: 'Less than one time in five', value: Number(C.power(0.436, 8) < 0.2), shown: 1 },
    // CI for Harbourside rain
    { what: 'atanh(−0.2276)', value: zH, shown: -0.2316, tol: 0.00005 },
    { what: '1/√303', value: se306, shown: 0.0574, tol: 0.00005 },
    { what: 'z lower', value: zH - z975 * se306, shown: -0.3442, tol: 0.00005 },
    { what: 'z upper', value: zH + z975 * se306, shown: -0.1190, tol: 0.00005 },
    { what: 'CI lower', value: RH.ci[0], shown: -0.331, tol: 0.0005 },
    { what: 'CI upper', value: RH.ci[1], shown: -0.118, tol: 0.0005 },
    { what: 'CI lower (2 dp)', value: RH.ci[0], shown: -0.33 },
    { what: 'CI upper (2 dp)', value: RH.ci[1], shown: -0.12 },
    { what: 'CI from tanh', value: Math.tanh(zH - z975 * se306), shown: RH.ci[0], tol: 1e-12 },
    { what: 'Far end r² about a tenth', value: RH.ci[0] ** 2, shown: 0.1, tol: 0.015 },
    { what: 'Millbrook CI lower', value: RM.ci[0], shown: -0.212, tol: 0.0005 },
    { what: 'Millbrook CI upper', value: RM.ci[1], shown: 0.010, tol: 0.0005 },
    { what: 'Millbrook CI lower (2 dp)', value: RM.ci[0], shown: -0.21 },
    { what: 'Millbrook CI upper (2 dp)', value: RM.ci[1], shown: 0.01 },
    { what: '1.96', value: z975, shown: 1.96 },
    // rho0 test
    { what: 'Fisher test vs 0.3: z', value: C.fisherTest(TH.r, TH.n, 0.3).z, shown: 2.75, tol: 0.005 },
    { what: 'Fisher test vs 0.3: p', value: C.fisherTest(TH.r, TH.n, 0.3).p, shown: 0.006, tol: 0.0005 },
    // ranks
    { what: 'Spearman rain Harbourside', value: rhoH.rho, shown: -0.226, tol: 0.0005 },
    { what: 'Kendall rain Harbourside', value: tauH.tau, shown: -0.173, tol: 0.0005 },
    { what: 'Spearman p below 0.001', value: Number(rhoH.p < 0.001), shown: 1 },
    { what: 'Kendall p below 0.001', value: Number(tauH.p < 0.001), shown: 1 },
    // power and sample size
    { what: 'n for 0.1', value: C.sampleSize(0.1), shown: 783 },
    { what: 'n for 0.2', value: C.sampleSize(0.2), shown: 194 },
    { what: 'n for 0.3', value: C.sampleSize(0.3), shown: 85 },
    { what: 'n for 0.5', value: C.sampleSize(0.5), shown: 30 },
    { what: 'Halving roughly quadruples', value: C.sampleSize(0.1) / C.sampleSize(0.2), shown: 4, tol: 0.1 },
    { what: 'Millbrook power for −0.1 (%)', value: C.power(-0.1, 306) * 100, shown: 42, tol: 0.5 },
    { what: 'z for 80% power', value: I.normInv(0.8), shown: 0.842, tol: 0.0005 },
    // comparing
    { what: 'Compare rain z', value: cmpRain.z, shown: -1.59 },
    { what: 'Compare rain p', value: cmpRain.p, shown: 0.11 },
    { what: 'atanh(−0.228)', value: Math.atanh(RH.r), shown: -0.232, tol: 0.0005 },
    { what: 'atanh(−0.102)', value: Math.atanh(RM.r), shown: -0.103, tol: 0.0005 },
    { what: 'Compare SE', value: cmpRain.se, shown: 0.0812, tol: 0.00005 },
    { what: 'Compare z from printed', value: (-0.232 + 0.103) / 0.0812, shown: -1.59 },
    { what: 'Millbrook r (2 dp) in prose', value: TM.r, shown: 0.16 },
    { what: 'Millbrook high–footfall r', value: TM.r, shown: 0.157, tol: 0.0005 },
    { what: 'Compare temp z', value: cmpTemp.z, shown: 3.81 },
    { what: 'Compare temp p below 0.001', value: Number(cmpTemp.p < 0.001), shown: 1 },
    { what: 'Cafés’ daily footfalls correlated', value: footHM, shown: -0.39 },
    { what: 'Harbourside r² (3 dp)', value: RH.r2, shown: 0.052, tol: 0.0005 },
    { what: 'Millbrook r² (3 dp)', value: RM.r2, shown: 0.010, tol: 0.0005 },
    { what: 'About 5%', value: RH.r2 * 100, shown: 5, tol: 0.5 },
    { what: 'About 1%', value: RM.r2 * 100, shown: 1, tol: 0.5 },
    { what: 'Two days in three dry', value: column('rain_in', H).filter((v) => v === 0).length / 306, shown: 0.67, tol: 0.02 },
    // many tests
    { what: 'Pairs of 8 columns', value: (8 * 7) / 2, shown: 28 },
    { what: 'Expected false alarms above one', value: Number(28 * 0.05 > 1), shown: 1 },
  ],
};
