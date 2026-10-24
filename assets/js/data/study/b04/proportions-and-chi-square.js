// proportions-and-chi-square.js — B04 · Proportions and chi-square tests. Content only; exercises are in
// proportions-and-chi-square.ex.js. Uses B01's August and September web conversion (CONVERSION, DERIVED.conversion.test)
// and app figures (SHOP), the spring orders by weekday (WEEKDAYS, DERIVED.weekdays), orders per day and the Poisson fit
// (ORDERS_PER_DAY, DERIVED.perDay; the test is DERIVED.perDay.gof, with a "5 or more" category and one df lost for λ), and the channel,
// rating and region tables (DERIVED.channelSubscription, ratingByChannel, regionSubscription). The bakery and the hotel
// are fictional. Every printed figure is recomputed in `checks`.
import { CONVERSION, SHOP, WEEKDAYS, CHANNEL_SUBSCRIPTION, RATING_BY_CHANNEL, REGION_SUBSCRIPTION, MONTHS, DERIVED as D } from './case.js?v=12';
import * as I from '../../../core/inference.js?v=12';

// ---------------------------------------------------------------- the figures this lesson quotes
const CT = D.conversion.test;                                     // August against September, web
const APP = I.propTest2(SHOP.appOrders[1], SHOP.appVisits[1], SHOP.appOrders[2], SHOP.appVisits[2]);
const WK = D.weekdays;
const CS = D.channelSubscription, RB = D.ratingByChannel, RG = D.regionSubscription;
const cs = CHANNEL_SUBSCRIPTION.counts, rb = RATING_BY_CHANNEL.counts;
const CSZ = I.propTest2(cs[1][0], cs[1][0] + cs[1][1], cs[0][0], cs[0][0] + cs[0][1]);   // app minus web, subscription share
const RBZ = I.propTest2(rb[1][0], rb[1][0] + rb[1][1], rb[0][0], rb[0][0] + rb[0][1]);   // app minus web, five-star share
const regionShare = REGION_SUBSCRIPTION.counts.map((r) => r[0] / (r[0] + r[1]));
// the Poisson fit: categories 0, 1, 2, 3, 4 and "5 or more"; λ estimated from the same days
const LAM = D.perDay.lambda, NDAYS = D.perDay.counts.reduce((a, b) => a + b, 0);
const OBS = D.perDay.counts;                                      // 0..5; no day had more than 5
const PF = D.perDay.gof;                                          // 0, 1, 2, 3, 4 and "5 or more"; df = 6 − 1 − 1
const EXP = PF.expected;
const PK = EXP.slice(0, 5).map((e) => e / NDAYS);
const P5UP = EXP[5] / NDAYS;
const SIXUP = NDAYS * (1 - [0, 1, 2, 3, 4, 5].reduce((s, k) => s + I.poissonPmf(k, LAM), 0));
// the bakery and the hotel (fictional)
const BAKE_O = [92, 54, 38, 16], BAKE_P = [0.4, 0.3, 0.2, 0.1];
const BK = I.chisqGof(BAKE_O, BAKE_P);
const HOTEL = [[18, 66, 12], [162, 234, 108]];                    // cancelled, not cancelled × direct, agency, corporate
const HT = I.chisqIndependence(HOTEL);
const autumnPerDay = SHOP.webOrders.map((w, i) => (w + SHOP.appOrders[i]) / [31, 31, 30, 31, 30, 31][i]);

// ---------------------------------------------------------------- figures
const f1 = (x) => Math.round(x * 10) / 10;
const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (v, d = 1) => `${(v * 100).toFixed(d)}%`;

function curvePath(pdf, a, b, X, Y, steps = 160) {
  const out = [];
  for (let i = 0; i <= steps; i++) { const x = a + ((b - a) * i) / steps; out.push(`${f1(X(x))},${f1(Y(pdf(x)))}`); }
  return out;
}
function weekdayFigure() {
  const L = 56, R = 620, T = 28, B = 210, xMax = 22, yMax = 0.15;
  const X = (v) => L + (v / xMax) * (R - L), Y = (v) => B - (Math.min(v, yMax) / yMax) * (B - T);
  const pdf = (x) => I.chi2Pdf(x, 6);
  const crit = I.chi2InvSf(0.05, 6), stat = WK.stat;
  let s = '<svg viewBox="0 0 640 260" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">';
  s += `<polygon points="${f1(X(stat))},${B} ${curvePath(pdf, stat, xMax, X, Y).join(' ')} ${f1(X(xMax))},${B}" fill="var(--series-1)" opacity="0.22"/>`;
  s += `<polygon points="${f1(X(crit))},${B} ${curvePath(pdf, crit, xMax, X, Y, 60).join(' ')} ${f1(X(xMax))},${B}" fill="var(--series-2)" opacity="0.55"/>`;
  s += `<polyline points="${curvePath(pdf, 0, xMax, X, Y).join(' ')}" fill="none" stroke="var(--ink)" stroke-width="2"/>`;
  s += `<line x1="${L}" x2="${R}" y1="${B}" y2="${B}" stroke="var(--ink)" stroke-width="1.2"/>`;
  for (let v = 0; v <= xMax; v += 2) s += `<line x1="${f1(X(v))}" x2="${f1(X(v))}" y1="${B}" y2="${B + 5}" stroke="var(--ink)"/><text x="${f1(X(v))}" y="${B + 19}" text-anchor="middle" font-size="11" fill="var(--ink-3)">${v}</text>`;
  s += `<line x1="${f1(X(stat))}" x2="${f1(X(stat))}" y1="${T + 6}" y2="${B}" stroke="var(--series-1)" stroke-width="2"/>`;
  s += `<text x="${f1(X(stat)) + 6}" y="${T + 16}" font-size="12">observed χ² = ${stat.toFixed(2)}</text>`;
  s += `<text x="${f1(X(stat)) + 6}" y="${T + 32}" font-size="11" fill="var(--ink-3)">area to the right = p = ${WK.p.toFixed(2)}</text>`;
  s += `<line x1="${f1(X(crit))}" x2="${f1(X(crit))}" y1="${T + 70}" y2="${B}" stroke="var(--series-2)" stroke-width="1.6" stroke-dasharray="5 4"/>`;
  s += `<text x="${f1(X(crit)) + 6}" y="${T + 82}" font-size="12">5% critical value ${crit.toFixed(2)}</text>`;
  s += `<text x="${f1(X(crit)) + 6}" y="${T + 98}" font-size="11" fill="var(--ink-3)">rejection region: area 0.05</text>`;
  s += `<text x="${(L + R) / 2}" y="${B + 40}" text-anchor="middle" font-size="11" fill="var(--ink-3)">χ² with 6 degrees of freedom</text>`;
  return `${s}</svg>`;
}
function shapesFigure() {
  const L = 40, R = 620, T = 20, B = 200, xMax = 26, yMax = 0.26;
  const X = (v) => L + (v / xMax) * (R - L), Y = (v) => B - (Math.min(v, yMax) / yMax) * (B - T);
  let s = '<svg viewBox="0 0 640 240" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">';
  const curves = [[1, 'var(--series-1)', '', 0.15], [4, 'var(--series-2)', '6 3', 4], [10, 'var(--series-3)', '2 3', 10]];
  for (const [k, col, dash] of curves) {
    const start = k === 1 ? 0.95 : 0;
    s += `<polyline points="${curvePath((x) => I.chi2Pdf(x, k), start, xMax, X, Y, 220).join(' ')}" fill="none" stroke="${col}" stroke-width="2.2"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
  }
  s += `<text x="${f1(X(1.6))}" y="${f1(Y(I.chi2Pdf(1.6, 1))) - 6}" font-size="12">1 df</text>`;
  s += `<text x="${f1(X(3.2))}" y="${f1(Y(I.chi2Pdf(2, 4))) - 8}" font-size="12">4 df</text>`;
  s += `<text x="${f1(X(10.6))}" y="${f1(Y(I.chi2Pdf(8, 10))) - 8}" font-size="12">10 df</text>`;
  s += `<line x1="${L}" x2="${R}" y1="${B}" y2="${B}" stroke="var(--ink)" stroke-width="1.2"/>`;
  for (let v = 0; v <= 25; v += 5) s += `<line x1="${f1(X(v))}" x2="${f1(X(v))}" y1="${B}" y2="${B + 5}" stroke="var(--ink)"/><text x="${f1(X(v))}" y="${B + 19}" text-anchor="middle" font-size="11" fill="var(--ink-3)">${v}</text>`;
  for (const k of [4, 10]) s += `<line x1="${f1(X(k))}" x2="${f1(X(k))}" y1="${B - 8}" y2="${B}" stroke="var(--ink)" stroke-width="2"/>`;
  s += `<text x="${f1(X(17))}" y="${T + 30}" font-size="11" fill="var(--ink-3)">ticks on the axis mark the means, 4 and 10:</text>`;
  s += `<text x="${f1(X(17))}" y="${T + 46}" font-size="11" fill="var(--ink-3)">the mean equals the degrees of freedom</text>`;
  return `${s}</svg>`;
}

export default {
  slug: 'proportions-and-chi-square',
  title: 'Proportions and chi-square tests',
  blurb: 'Compare two proportions with a z test and a confidence interval, then use the chi-square distribution to test whether counts fit a model and whether two categorical variables are related. Calculate each test by hand and in Excel with CHISQ.TEST, CHISQ.DIST.RT and CHISQ.INV.RT, check its conditions, and say what a result does and doesn’t show.',
  status: 'reviewed',
  objectives: [
    'Calculate a two-proportion z test with the pooled standard error and a confidence interval for the difference in two proportions, and check their conditions.',
    'Describe the chi-square distribution and explain why chi-square tests use the right tail and how their degrees of freedom are counted.',
    'Test whether counts fit a stated model with a chi-square goodness-of-fit test, including a model whose parameter is estimated from the data, merging categories whose expected counts are too small.',
    'Test for independence in a contingency table: expected counts, the chi-square statistic, degrees of freedom, the p-value and the expected-count condition.',
    'Calculate chi-square tests in Excel with CHISQ.TEST, CHISQ.DIST.RT and CHISQ.INV.RT, and recognise when CHISQ.TEST uses the wrong degrees of freedom.',
    'Interpret a result with percentages, an interval or Cramér’s V, without treating a non-significant result as no difference or an association as a cause.',
  ],
  prerequisites: [
    { lesson: 'b04/hypothesis-testing', why: 'Null and alternative hypotheses, test statistics, p-values, α and the one-proportion z test are the starting point for every test here.' },
    { lesson: 'b04/confidence-intervals', why: 'The interval for one proportion, and its condition of at least 10 successes and 10 failures, extend to the difference between two.' },
    { lesson: 'b04/probability', why: 'Contingency tables and independence, P(A and B) = P(A) × P(B), give the expected counts in a test of independence.' },
    { lesson: 'b04/discrete-distributions', why: 'The Poisson model of Lantern’s orders per day, which this lesson tests formally.' },
    { lesson: 'b01/interpreting-results', why: 'B01’s comparison group for the September dip, and why association isn’t causation.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'In October Ana has three questions, all about counts. Web conversion fell from 2.91% in August to 1.80% in September, the month the redesigned checkout went live: a real fall, or the kind of wobble any month shows? Her spring orders seem to arrive unevenly across the week: are some weekdays really busier? And 57.6% of the spring’s app orders were subscriptions against 35.6% of web orders: does the app go with subscribing, or could a gap like that arise by chance?' },
    { p: 'Each question is about a <g>categorical variable</g>: a visit converts or doesn’t, an order falls on a weekday, a customer orders through the web or the app and subscribes or doesn’t. The data are counts, and each question asks whether the counts differ from what a null hypothesis predicts by more than chance would explain. The logic is the one in <i>Hypothesis testing</i>: state the <g>null hypothesis</g>, measure how far the data sit from it with a <g>test statistic</g>, and turn that distance into a <g>p-value</g>. This lesson adds two test statistics, one for comparing two proportions and one for comparing counts with a model.' },

    { h: 'Two proportions: was September’s fall real?' },
    { p: String.raw`In August 224 of the 7,700 web visits ended in an order, a sample <g>proportion</g> of 2.91%. In September 158 of 8,800 did: 1.80%. The fall is 1.11 <g>percentage points</g>. The null hypothesis says the two months had the same underlying conversion rate, <m>p_1 = p_2</m>, and the gap is chance: which visitors happened to arrive and which of them happened to buy.` },
    { p: String.raw`If the null hypothesis is true there is one conversion rate, and the best estimate of it pools both months: 224 + 158 = 382 orders in 7,700 + 8,800 = 16,500 visits, so <m>\bar{p} = 382 \div 16{,}500 \approx 0.023152</m>. The <g>standard error</g> of the difference between two sample proportions is worked out from that pooled rate. With <m>\bar{p}(1 - \bar{p}) \approx 0.02262</m> and <m>1/7{,}700 + 1/8{,}800 \approx 0.0002435</m>, it is <m>\sqrt{0.02262 \times 0.0002435} \approx 0.002347</m>, or 0.2347 percentage points. The observed gap of 1.114 points is <m>z = 1.114 \div 0.2347 \approx 4.75</m> standard errors.` },
    { p: 'If the null hypothesis were true, z would follow the standard normal distribution approximately, and a value 4.75 or more from 0 in either direction has a probability of about 0.000002, two in a million. This is the <g>two-proportion z test</g>. A gap this large is far beyond the month-to-month wobble of a steady 2.3% rate: the evidence that conversion really fell is overwhelming. A 95% confidence interval for the fall, worked out in the In depth section, runs from 0.65 to 1.58 percentage points, and at September’s 8,800 visits a fall of 1.11 points is about 98 orders.' },
    { p: 'The test says the fall is very unlikely to be chance; it doesn’t say why. B01’s comparison group helps: app buyers never saw the new website checkout, and app conversion was 3.68% in August and 3.58% in September. The same test on the app gives z = 0.20 and p = 0.84, no evidence of any change. A fall confined to the channel that got the new checkout supports the checkout as the cause, but it doesn’t prove <g>causation</g>: anything else that changed only on the website in September could produce the same pattern.' },

    { h: 'Counts against a model: the chi-square statistic' },
    { p: 'Ana’s second question involves seven categories at once. Over the 122 spring days the shop took 231 orders. If the weekday made no difference, every day would have the same expected number of orders, 231 ÷ 122 ≈ 1.89, and each weekday’s <g>expected count</g> would be that rate times the number of such days. The spring had 18 Mondays, Tuesdays and Sundays but 17 of each other weekday, so the expected counts are not 231 ÷ 7 = 33 each: Monday’s is 231 × 18 ÷ 122 ≈ 34.08.' },
    { table: {
      caption: 'Lantern’s 231 spring orders by weekday, with the counts expected if every day had the same order rate',
      head: ['Weekday', 'Days', 'Orders (O)', 'Expected (E)', '(O − E)² ÷ E'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: WEEKDAYS.names.map((d, i) => [d, String(WEEKDAYS.days[i]), String(WEEKDAYS.orders[i]), fx(WK.expected[i]), fx(WK.contrib[i], 3)]),
      foot: [['Total', '122', '231', fx(WK.expected.reduce((a, b) => a + b, 0)), fx(WK.stat, 3)]],
    } },
    { p: String.raw`The <g>chi-square statistic</g> adds up, over the categories, each squared gap between an observed count and its expected count divided by the expected count: <m>\chi^2 = \sum (O - E)^2 \div E</m>. Squaring makes every gap count as positive, and dividing by E scales it, because a gap of 5 matters more when 10 were expected than when 1,000 were. Sunday contributes most: 26 orders where 34.08 were expected, <m>(26 - 34.08)^2 \div 34.08 \approx 1.92</m>. In all, <m>\chi^2 \approx 5.82</m>.` },
    { p: 'When the null hypothesis is true and the expected counts are large enough, χ² follows approximately a <g>chi-square distribution</g>, a family of right-skewed distributions indexed by their <g>degrees of freedom</g>. Here there are 7 − 1 = 6: once six of the observed counts are known, the seventh is fixed by the total of 231. The p-value is the area to the right of 5.82 under that curve, <x>=CHISQ.DIST.RT(5.82,6)</x> ≈ 0.44.' },
    { figure: {
      svg: weekdayFigure(),
      caption: 'The chi-square distribution with 6 degrees of freedom. The p-value of the weekday test is the area to the right of the observed χ² of 5.82, about 0.44; the 5% rejection region starts at 12.59, far to the right.',
      alt: `A right-skewed curve rising from 0, peaking at 4 and falling away towards 22, drawn over a horizontal axis marked from 0 to 22 in steps of 2. A solid vertical line at 5.82 is labelled “observed χ² = 5.82, area to the right = p = 0.44”, and the region under the curve to its right is lightly shaded. A dashed vertical line at 12.59 is labelled “5% critical value 12.59, rejection region: area 0.05”, and the small tail to its right is shaded more darkly.`,
    } },
    { p: 'A p-value of 0.44 says that gaps of this size between the weekdays would be common if the order rate were the same every day. So there is no evidence that some weekdays are busier: Monday’s 2.17 orders a day and Sunday’s 1.44 are within the range chance produces when each weekday has only about 33 orders. That isn’t proof that the rates are equal, only that these 231 orders can’t tell them apart.' },

    { h: 'Two categorical variables: does the app go with subscribing?' },
    { p: 'Ana’s third question crosses two variables. Each of the 231 spring orders has a channel and a subscription status, so the orders fall into a 2 × 2 <g>contingency table</g>: a table of counts with one variable in the rows and the other in the columns.' },
    { table: {
      caption: 'Lantern’s spring orders by channel and subscription status (observed counts)',
      head: ['Channel', 'Subscription', 'One-off', 'Total', 'Subscription share'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: [['Web', String(cs[0][0]), String(cs[0][1]), String(cs[0][0] + cs[0][1]), pct(CSZ.p2)], ['App', String(cs[1][0]), String(cs[1][1]), String(cs[1][0] + cs[1][1]), pct(CSZ.p1)]],
      foot: [['Total', String(CS.colTotals[0]), String(CS.colTotals[1]), String(CS.n), pct(CS.colTotals[0] / CS.n)]],
    } },
    { p: 'The null hypothesis of a <g>test of independence</g> is that the two variables are <g>independent</g>: the chance that an order is a subscription is the same whichever channel it came through. Overall 104 of the 231 orders, 45.0%, were subscriptions, so under independence 45.0% of the 132 web orders, 59.43, would be subscriptions. In general the expected count for a cell is its row total times its column total divided by the grand total.' },
    { table: {
      caption: 'Expected counts if channel and subscription were independent (row total × column total ÷ 231)',
      head: ['Channel', 'Subscription', 'One-off', 'Total'],
      align: ['l', 'r', 'r', 'r'],
      rows: [['Web', fx(CS.expected[0][0]), fx(CS.expected[0][1]), '132'], ['App', fx(CS.expected[1][0]), fx(CS.expected[1][1]), '99']],
      foot: [['Total', '104', '127', '231']],
    } },
    { p: String.raw`The web had 12.43 fewer subscriptions than independence predicts, and the app 12.43 more. Summing <m>(O - E)^2 \div E</m> over the four cells gives <m>\chi^2 \approx 11.03</m> with <m>(2 - 1)(2 - 1) = 1</m> degree of freedom, and <x>=CHISQ.DIST.RT(11.03,1)</x> ≈ 0.0009. Gaps this large would arise in fewer than one sample in a thousand if channel and subscription were independent: strong evidence that they are associated. The same test on star ratings finds nothing: 44.0% of rated web orders and 44.3% of rated app orders had five stars, giving <m>\chi^2 \approx 0.0009</m> and <m>p \approx 0.98</m>.` },
    { callout: 'key', title: 'What every chi-square test does', html: 'It compares observed counts with the counts a null hypothesis predicts, adds up (O − E)² ÷ E, and asks how often a total that large would arise by chance. Large values are the evidence against the null hypothesis, so the p-value is a right-tail area, almost without exception. The expected counts must be large enough (at least 5 is the usual rule), and the data must be counts of separate individuals, not percentages or averages.' },
  ],

  theory: [
    { h: 'The two-proportion z test' },
    { p: String.raw`Two independent samples of sizes <m>n_1</m> and <m>n_2</m> contain <m>x_1</m> and <m>x_2</m> successes, giving sample proportions <m>\hat{p}_1 = x_1 \div n_1</m> and <m>\hat{p}_2 = x_2 \div n_2</m>. To test <m>H_0\colon p_1 = p_2</m>, the standard error uses the <g>pooled proportion</g> <m>\bar{p} = (x_1 + x_2) \div (n_1 + n_2)</m>, because under the null hypothesis both samples estimate the same p and the combined sample estimates it best. The test statistic divides the gap between the sample proportions by that standard error:` },
    { math: String.raw`z = \dfrac{\hat{p}_1 - \hat{p}_2}{\sqrt{\bar{p}(1 - \bar{p})\left(\dfrac{1}{n_1} + \dfrac{1}{n_2}\right)}}` },
    { p: String.raw`z is compared with the standard normal distribution: two-sided for <m>H_1\colon p_1 \neq p_2</m>, one-sided for <m>p_1 \gt p_2</m> or <m>p_1 \lt p_2</m>, a choice made before looking at the data.` },
    { p: 'Its conditions are those of the one-proportion test, applied to each sample:' },
    { list: [
      '<b>Independence.</b> The two samples are independent of each other, and the observations within each are independent: random samples, randomly assigned groups or, for a process such as Lantern’s visits, trials that don’t influence one another.',
      '<b>Large enough counts.</b> At least 10 successes and 10 failures in each sample, so that the normal approximation holds. OpenStax’s <i>Introductory Business Statistics</i> asks for at least 5; 10 is the more cautious rule and the one this course uses for intervals. Lantern’s counts (224 and 7,476 in August, 158 and 8,642 in September) pass easily.',
      '<b>A small fraction of the population.</b> When samples are drawn without replacement from a finite population, OpenStax adds that the population should be at least 10 to 20 times the size of the sample.',
    ] },
    { p: 'Lantern’s visits bend the independence condition: one person can visit several times in a month, and their visits are related. Related trials can make the formula’s standard error too small, so a borderline z would deserve caution. A z of 4.75 is not borderline.' },
    { p: 'Excel has no function for a two-proportion test, so build it from cells. With the orders in B2:C2 and the visits in B3:C3, the pooled proportion is <x>=(B2+C2)/(B3+C3)</x>; with that in B6, the standard error is <x>=SQRT(B6*(1-B6)*(1/B3+1/C3))</x>; and with z in B8, the two-sided p-value is <x>=2*(1-NORM.S.DIST(ABS(B8),TRUE))</x>. For a one-sided alternative, <x>=1-NORM.S.DIST(B8,TRUE)</x> gives P(Z &gt; z), the p-value for <m>p_1 \gt p_2</m>, and <x>=NORM.S.DIST(B8,TRUE)</x> gives P(Z &lt; z), the p-value for <m>p_1 \lt p_2</m>.' },

    { h: 'A confidence interval for the difference' },
    { p: String.raw`An interval estimates how big the difference is, not only whether it is zero. It doesn’t assume the two proportions are equal, so it uses each sample’s own proportion in an unpooled standard error:` },
    { math: String.raw`(\hat{p}_1 - \hat{p}_2) \pm z^* \sqrt{\dfrac{\hat{p}_1(1 - \hat{p}_1)}{n_1} + \dfrac{\hat{p}_2(1 - \hat{p}_2)}{n_2}}` },
    { p: String.raw`Here <m>z^* \approx 1.96</m> for 95%. For Lantern the unpooled standard error is 0.002382, the margin <m>1.96 \times 0.002382 \approx 0.00467</m>, and the interval <m>0.01114 \pm 0.00467</m>: 0.65 to 1.58 percentage points.` },
    { p: 'Because the test and the interval use slightly different standard errors, they can disagree when a result is borderline: an interval that just excludes 0 alongside a p-value just above 0.05. Far from the line, as here, they agree. Report the interval with the test: “conversion fell by 1.1 points (95% CI 0.6 to 1.6)” says both that the fall is unlikely to be chance and how large it might be. In relative terms September converted at 62% of August’s rate, a fall of 38%.' },

    { h: 'The chi-square distribution' },
    { p: 'A chi-square distribution with k degrees of freedom is the distribution of the sum of the squares of k independent standard normal variables. It is never negative and it is skewed to the right; its mean equals its degrees of freedom and its standard deviation is √(2k). As the degrees of freedom grow, it moves right, spreads out and becomes more symmetric.' },
    { figure: {
      svg: shapesFigure(),
      caption: 'Chi-square distributions with 1, 4 and 10 degrees of freedom. Each is right-skewed and starts at 0; the mean equals the degrees of freedom, so the curves move right and spread out as the degrees of freedom grow.',
      alt: 'Three curves over a horizontal axis from 0 to 25. The curve for 1 degree of freedom starts very high near 0 and falls steeply. The curve for 4 degrees of freedom rises from 0 to a peak near 2 and has a long right tail. The curve for 10 degrees of freedom is lower, wider and less skewed, peaking near 8. Short ticks on the axis at 4 and 10 mark the means of the second and third curves, and a note says the mean equals the degrees of freedom.',
    } },
    { p: String.raw`Why does the χ² statistic follow it? When counts are large, each standardised gap <m>(O - E) \div \sqrt{E}</m> behaves roughly like a standard normal value, so their squares add up like a chi-square variable. The gaps are not all free, though: they must add to 0, because the observed and expected counts share a total, and every quantity estimated from the data adds another constraint. Each constraint removes one degree of freedom. The approximation is poor when expected counts are small, which is where the rule of at least 5 comes from.` },
    { p: 'Excel’s functions: <x>=CHISQ.DIST.RT(x,deg_freedom)</x> returns the right-tail probability P(χ² &gt; x), the p-value of a chi-square test; Microsoft’s example, <x>=CHISQ.DIST.RT(18.307,10)</x>, returns 0.0500006. <x>=CHISQ.INV.RT(probability,deg_freedom)</x> goes the other way and returns the <g>critical value</g>: <x>=CHISQ.INV.RT(0.05,6)</x> ≈ 12.59 for the weekday test. <x>=CHISQ.DIST(x,deg_freedom,TRUE)</x> returns the left-tail probability, the wrong one for a p-value. Both right-tail functions truncate a deg_freedom that isn’t a whole number.' },

    { h: 'Goodness-of-fit tests' },
    { p: 'A <g>goodness-of-fit test</g> asks whether one categorical variable follows a stated distribution: a planned product mix, equal rates per day, a Poisson model. The steps:' },
    { ol: [
      'State the model as a probability for each of the k categories. The probabilities come from the null hypothesis, not from the counts being tested.',
      String.raw`Multiply by the sample size to get the expected counts, <m>E_i = n p_i</m>. They needn’t be whole numbers.`,
      'Check that every expected count is at least 5. If one isn’t, merge it with a neighbouring category, and make sure the categories between them cover every possible value.',
      String.raw`Calculate χ² and its degrees of freedom, <m>k - 1 - m</m>, where m is the number of the model’s parameters estimated from the same data.`,
      'Find the right-tail p-value with CHISQ.DIST.RT, and state the conclusion in context.',
    ] },
    { p: 'The rule of 5 is a convention. OpenStax states it, and Microsoft’s CHISQ.TEST page says that some statisticians suggest it; NIST’s e-Handbook asks only for a sufficient sample size and warns that the result depends on how the data are binned. OpenStax calls the goodness-of-fit test “almost always right-tailed”: large values of χ² are the evidence against the model. The rare exception is a χ² far below its degrees of freedom, which can mean data that fit too well, for example because they were tidied.' },
    { p: 'Estimated parameters cost degrees of freedom. To test whether orders per day follow a Poisson distribution, Ana must estimate λ from the same 122 days, and a model fitted to the data matches them better than a model fixed in advance. To allow for that, the statistic is compared with a chi-square distribution with one degree of freedom fewer. NIST’s handbook gives the general rule: k − c degrees of freedom, where c is the number of estimated parameters plus 1.' },
    { p: 'In Excel, <x>=CHISQ.TEST(actual_range,expected_range)</x> returns the p-value directly from two ranges of the same size. For a single column of k categories it uses k − 1 degrees of freedom, which is right only when no parameter was estimated. Otherwise calculate χ² yourself, for example <x>=SUMPRODUCT((B2:B7-D2:D7)^2/D2:D7)</x> with the observed counts in B and the expected counts in D, and take <x>=CHISQ.DIST.RT</x> with the correct degrees of freedom.' },

    { h: 'The test of independence' },
    { p: String.raw`For a table with r rows and c columns, the null hypothesis is that the row variable and the column variable are independent, and the alternative is that they are associated. Independence means P(row i and column j) = P(row i) × P(column j), as in <i>Probability</i>. Estimating each probability by its share of the grand total n and multiplying by n gives the expected count <m>E_{ij} = R_i C_j \div n</m>: the row total times the column total over the grand total.` },
    { p: String.raw`The degrees of freedom are <m>(r - 1)(c - 1)</m>: with the row and column totals fixed, once <m>(r - 1)(c - 1)</m> cells are filled in, the rest are determined. Lantern’s five regions by subscription status, a 5 × 2 table, have 4. The conditions:` },
    { list: [
      'The table counts individuals (orders, customers, bookings), each in exactly one cell. Percentages and averages can’t go into a chi-square test.',
      'The observations are independent. Several orders from one customer bend this condition, as repeat visits did for conversion.',
      'Every expected count is at least 5. OpenStax: “The expected value inside each cell needs to be at least five in order for you to use this test.” If one isn’t, merge categories that belong together or collect more data.',
    ] },
    { p: 'In Excel, build the expected table first. With the observed counts in B2:C3, the row totals in D2:D3, the column totals in B4:C4 and the grand total in D4, type <x>=$D2*B$4/$D$4</x> in the top-left expected cell and fill it across and down. <x>=CHISQ.TEST(B2:C3,B7:C8)</x> then returns the p-value with (r − 1)(c − 1) degrees of freedom, or #N/A if the two ranges hold different numbers of values. It doesn’t return χ² itself; for a report, calculate it with SUMPRODUCT.' },
    { p: 'When each row is a separate sample, for example a survey of 200 web customers and 200 app customers, the same calculation is called a test of homogeneity: are the column proportions the same in every row? The arithmetic and the conditions don’t change.' },

    { h: 'Two-by-two tables: χ² = z²' },
    { p: String.raw`A 2 × 2 table holds two proportions, so the chi-square test and the two-proportion z test can be run on the same counts. They agree exactly. For Lantern’s channels the z test of the app’s subscription share against the web’s gives <m>z = (0.5758 - 0.3561) \div 0.0661 \approx 3.32</m>, and <m>3.32^2 \approx 11.03 = \chi^2</m>, with the same p-value, 0.0009. The chi-square test is the two-sided z test; use the z test when you want a one-sided alternative or an interval, here a gap of 22.0 points with a 95% interval of 9.3 to 34.7 points.` },
    { p: 'Some textbooks and some software apply a continuity correction to 2 × 2 tables, which makes χ² a little smaller. Excel’s CHISQ.TEST works from the formula above without one, and so does this lesson, which is why its results match the z test.' },

    { h: 'How strong, and what it doesn’t show' },
    { p: String.raw`A p-value measures evidence, not size. With thousands of observations a trivial association is <g>statistically significant</g>; with a few dozen a large one may not be. Report an <g>effect size</g> alongside: the percentages being compared and, for a larger table, <g>Cramér’s V</g>, <m>V = \sqrt{\chi^2 \div (n \times \min(r - 1, c - 1))}</m>, which runs from 0 (counts that match independence exactly) to 1 (complete association). Lantern’s channel and subscription give V ≈ 0.22, its ratings by channel V ≈ 0.002, and its regions by subscription V ≈ 0.34, driven by the East’s 75% subscription share against 32% to 44% elsewhere.` },
    { p: 'A non-significant result is not evidence of no difference. The rated orders’ five-star shares differ by only 0.2 points, but the 95% interval for the difference runs from −15.5 to +16.0 points: 154 ratings can’t rule out a sizeable gap either way.' },
    { p: 'And association is not causation. App orders were subscriptions more often, but customers chose their channel: committed regulars may be the ones who install an app and the ones who subscribe, a <g>confounding variable</g> that a chi-square test can’t see. The test says the pattern is unlikely to be chance; whether the app causes subscriptions needs a comparison in which customers don’t choose, such as a randomised trial. Finally, every test carries its α risk: run chi-square tests on twenty cross-tabulations of the same orders and about one will be significant at the 5% level by chance alone, the <g>multiple testing</g> problem from <i>Hypothesis testing</i>.' },
  ],

  formulas: [
    { id: 'pc-two-prop-z', name: 'Two-proportion z test (pooled standard error)',
      tex: String.raw`\bar{p} = \dfrac{x_1 + x_2}{n_1 + n_2}, \qquad z = \dfrac{\hat{p}_1 - \hat{p}_2}{\sqrt{\bar{p}(1 - \bar{p})\left(\dfrac{1}{n_1} + \dfrac{1}{n_2}\right)}}`,
      where: [[String.raw`x_1, x_2`, 'Successes in samples 1 and 2', 'counts'], [String.raw`n_1, n_2`, 'Sample sizes', 'counts'], [String.raw`\hat{p}_1, \hat{p}_2`, 'Sample proportions, x ÷ n', ''], [String.raw`\bar{p}`, 'Pooled proportion: all successes over all observations', ''], [String.raw`z`, 'Test statistic, compared with the standard normal distribution', '']],
      assumptions: 'Independent samples (or independent trials); at least 10 successes and 10 failures in each sample.',
      note: 'Tests H₀: p₁ = p₂. The p-value is 2 × (1 − NORM.S.DIST(|z|, TRUE)) for a two-sided alternative.' },
    { id: 'pc-diff-ci', name: 'Confidence interval for a difference in two proportions',
      tex: String.raw`(\hat{p}_1 - \hat{p}_2) \pm z^* \sqrt{\dfrac{\hat{p}_1(1 - \hat{p}_1)}{n_1} + \dfrac{\hat{p}_2(1 - \hat{p}_2)}{n_2}}`,
      where: [[String.raw`\hat{p}_1, \hat{p}_2`, 'Sample proportions', ''], [String.raw`n_1, n_2`, 'Sample sizes', 'counts'], [String.raw`z^*`, 'Standard normal critical value: NORM.S.INV(0.975) ≈ 1.96 for 95%', '']],
      assumptions: 'As for the test, with at least 10 successes and 10 failures in each sample.',
      note: 'The interval uses each sample’s own proportion (unpooled), because it doesn’t assume p₁ = p₂.' },
    { id: 'pc-chisq', name: 'Chi-square statistic',
      tex: String.raw`\chi^2 = \sum \dfrac{(O - E)^2}{E}`,
      where: [[String.raw`O`, 'Observed count in a category or cell', 'count'], [String.raw`E`, 'Expected count under the null hypothesis', 'count'], [String.raw`\chi^2`, 'Chi-square statistic, summed over every category or cell', '']],
      assumptions: 'Counts of independent individuals; every expected count at least 5.',
      note: 'The p-value is the right-tail area, CHISQ.DIST.RT(χ², df).' },
    { id: 'pc-gof', name: 'Goodness of fit: expected counts and degrees of freedom',
      tex: String.raw`E_i = n\,p_i, \qquad \text{df} = k - 1 - m`,
      where: [[String.raw`n`, 'Total number of observations', 'count'], [String.raw`p_i`, 'Probability of category i under the null hypothesis', ''], [String.raw`k`, 'Number of categories (after any merging)', ''], [String.raw`m`, 'Number of the model’s parameters estimated from the same data', ''], [String.raw`E_i`, 'Expected count in category i', 'count']],
      note: 'CHISQ.TEST on one column uses k − 1 degrees of freedom, so it is wrong when m > 0.' },
    { id: 'pc-independence', name: 'Test of independence: expected counts and degrees of freedom',
      tex: String.raw`E_{ij} = \dfrac{R_i \, C_j}{n}, \qquad \text{df} = (r - 1)(c - 1)`,
      where: [[String.raw`R_i`, 'Total of row i', 'count'], [String.raw`C_j`, 'Total of column j', 'count'], [String.raw`n`, 'Grand total', 'count'], [String.raw`r, c`, 'Numbers of rows and columns', ''], [String.raw`E_{ij}`, 'Expected count in row i, column j, if the variables are independent', 'count']],
      note: 'In Excel: <x>=$D2*B$4/$D$4</x> filled across the expected table, then <x>=CHISQ.TEST(observed,expected)</x>.' },
    { id: 'pc-cramers-v', name: 'Cramér’s V',
      tex: String.raw`V = \sqrt{\dfrac{\chi^2}{n \times \min(r - 1,\; c - 1)}}`,
      where: [[String.raw`\chi^2`, 'Chi-square statistic of the test of independence', ''], [String.raw`n`, 'Grand total', 'count'], [String.raw`r, c`, 'Numbers of rows and columns', ''], [String.raw`V`, 'Strength of association, from 0 (none) to 1 (complete)', '']],
      note: 'For a 2 × 2 table, V equals the absolute value of the phi coefficient.' },
  ],

  examples: [
    { level: 'simple', title: 'Does Saturday’s bread fit the plan?', fictional: true,
      setup: 'Millstone Bakery plans its Saturday bake on a mix of 40% sourdough, 30% white, 20% rye and 10% spelt. Last Saturday it sold 200 loaves: 92 sourdough, 54 white, 38 rye and 16 spelt. Do the sales fit the planned mix, at the 5% level?',
      table: {
        caption: 'Millstone Bakery’s Saturday sales against its planned mix',
        head: ['Loaf', 'Planned share', 'Sold (O)', 'Expected (E)', '(O − E)² ÷ E'],
        align: ['l', 'r', 'r', 'r', 'r'],
        rows: ['Sourdough', 'White', 'Rye', 'Spelt'].map((n, i) => [n, `${Math.round(BAKE_P[i] * 100)}%`, String(BAKE_O[i]), String(BK.expected[i]), fx(BK.contrib[i], 1)]),
        foot: [['Total', '100%', '200', '200', fx(BK.stat, 1)]],
      },
      steps: [
        'Hypotheses: H₀, customers buy in the planned proportions 0.4, 0.3, 0.2 and 0.1; H₁, at least one proportion differs.',
        String.raw`Expected counts, <m>E = n \times p</m>: <m>200 \times 0.4 = 80</m>, <m>200 \times 0.3 = 60</m>, <m>200 \times 0.2 = 40</m> and <m>200 \times 0.1 = 20</m>. All are at least 5, so the chi-square approximation is reasonable.`,
        String.raw`Contributions: <m>(92 - 80)^2 \div 80 = 1.8</m>, <m>(54 - 60)^2 \div 60 = 0.6</m>, <m>(38 - 40)^2 \div 40 = 0.1</m> and <m>(16 - 20)^2 \div 20 = 0.8</m>, so <m>\chi^2 = 3.3</m>.`,
        'Degrees of freedom: 4 − 1 = 3, since no parameter was estimated. <x>=CHISQ.DIST.RT(3.3,3)</x> ≈ 0.35, and the 5% critical value <x>=CHISQ.INV.RT(0.05,3)</x> ≈ 7.81 is well above 3.3. With the sales in C2:C5 and the expected counts in D2:D5, <x>=CHISQ.TEST(C2:C5,D2:D5)</x> returns the same p-value in one step.',
      ],
      answer: 'χ² = 3.3 with 3 degrees of freedom, p ≈ 0.35: no evidence at the 5% level that Saturday’s sales differ from the planned mix.',
      interpretation: 'Sourdough sold 12 loaves more than planned, but a gap of that size is common by chance in 200 sales. One Saturday is a small test, and loaves bought together by one customer aren’t independent sales, so the bakery should keep the plan and keep counting: several weeks of data would show a real shift in demand that one day can’t.' },
    { level: 'challenging', title: 'Cancellations by booking channel', fictional: true,
      setup: 'Hollybank Hotel took 600 bookings for July to September: 180 direct, 300 through online travel agencies and 120 corporate. Of these, 18, 66 and 12 were cancelled. Is cancellation associated with the booking channel? If so, how strongly, and where is the difference?',
      table: {
        caption: 'Hollybank Hotel’s July–September bookings by channel and outcome',
        head: ['Channel', 'Cancelled', 'Not cancelled', 'Total', 'Cancelled share'],
        align: ['l', 'r', 'r', 'r', 'r'],
        rows: ['Direct', 'Travel agency', 'Corporate'].map((n, j) => [n, String(HOTEL[0][j]), String(HOTEL[1][j]), String(HT.colTotals[j]), pct(HOTEL[0][j] / HT.colTotals[j], 0)]),
        foot: [['Total', String(HT.rowTotals[0]), String(HT.rowTotals[1]), String(HT.n), pct(HT.rowTotals[0] / HT.n, 0)]],
      },
      steps: [
        'Expected counts under independence: 96 of the 600 bookings, 16%, were cancelled, so each channel’s expected cancellations are 16% of its bookings: 28.8 direct, 48.0 travel agency and 19.2 corporate, leaving 151.2, 252.0 and 100.8 not cancelled. The smallest expected count is 19.2, so the condition holds.',
        String.raw`Contributions <m>(O - E)^2 \div E</m>: direct 4.05 and 0.77, travel agency 6.75 and 1.29, corporate 2.70 and 0.51. The total is <m>\chi^2 \approx 16.07</m>.`,
        String.raw`Degrees of freedom: <m>(3 - 1)(2 - 1) = 2</m>. <x>=CHISQ.DIST.RT(16.07,2)</x> ≈ 0.0003, and the 5% critical value <x>=CHISQ.INV.RT(0.05,2)</x> ≈ 5.99, so the result is significant well beyond the 5% level.`,
        String.raw`Size: <m>V = \sqrt{16.07 \div (600 \times 1)} \approx 0.16</m>. Where: the largest contributions come from the travel-agency cancellations (66 against 48.0 expected) and the direct ones (18 against 28.8). Travel-agency bookings cancelled at 22%, the other two channels at 10%.`,
      ],
      answer: 'χ² ≈ 16.07 with 2 degrees of freedom, p ≈ 0.0003, V ≈ 0.16: cancellation is associated with booking channel, travel-agency bookings cancelling at 22% against 10% for direct and corporate bookings.',
      interpretation: 'The test establishes a pattern, not its cause. Travel-agency bookings may differ in other ways: many come with free cancellation, are made further ahead, or are made by guests holding rooms at several hotels. The hotel might ask for a deposit or overbook agency rooms slightly, but it should try such a change on part of its bookings and measure it before relying on it. The test treats the channels as unordered categories, so listing them in another order gives the same χ².' },
    { level: 'challenging', title: 'Do Lantern’s orders per day fit a Poisson model?', fictional: true,
      setup: `<i>Discrete distributions</i> compared Lantern’s spring orders per day with a Poisson distribution with λ = 231 ÷ 122 ≈ 1.89. Test the fit formally. Ana’s frequency table of the 122 days: 18 days with no orders, 35 with one, 33 with two, 18 with three, 14 with four and 4 with five; no day had more.`,
      table: {
        caption: 'Orders per day, spring 2026, against a Poisson distribution with λ estimated from the same days',
        head: ['Orders in a day', 'Days (O)', 'Poisson probability', 'Expected (E)', '(O − E)² ÷ E'],
        align: ['l', 'r', 'r', 'r', 'r'],
        rows: ['0', '1', '2', '3', '4', '5 or more'].map((k, i) => [k, String(OBS[i]), fx([...PK, P5UP][i], 4), fx(EXP[i]), fx(PF.contrib[i], 3)]),
        foot: [['Total', String(NDAYS), '1.0000', fx(EXP.reduce((a, b) => a + b, 0)), fx(PF.stat, 3)]],
      },
      steps: [
        'The categories must cover every possible count, so the last one is “5 or more”, not “5”: its probability is <x>=1-POISSON.DIST(4,231/122,TRUE)</x> ≈ 0.0436, and its expected count 122 × 0.0436 ≈ 5.31. Splitting it into “5” (3.73 expected) and “6 or more” (1.59) would leave two expected counts below 5, so they stay merged.',
        'The other expected counts are 122 × <x>=POISSON.DIST(k,231/122,FALSE)</x> for k = 0 to 4: 18.37, 34.78, 32.92, 20.78 and 9.84. All six expected counts are at least 5.',
        String.raw`<m>\chi^2 \approx 0.007 + 0.001 + 0.000 + 0.372 + 1.762 + 0.325 \approx 2.47</m>. The largest contribution is the 14 days with four orders, where 9.84 were expected.`,
        'Degrees of freedom: 6 categories − 1 − 1 estimated parameter (λ) = 4, and <x>=CHISQ.DIST.RT(2.47,4)</x> ≈ 0.65. With the days in B2:B7 and the expected counts in D2:D7, <x>=CHISQ.TEST(B2:B7,D2:D7)</x> would use 5 degrees of freedom and report 0.78, because it can’t know that λ came from the same data. Strictly, because λ was estimated from the ungrouped daily counts rather than from this grouped table, the exact p-value lies between the 4-df and 5-df values (0.65 and 0.78); the conclusion is the same either way.',
      ],
      answer: 'χ² ≈ 2.47 with 4 degrees of freedom, p ≈ 0.65: no evidence against a Poisson model for orders per day.',
      interpretation: 'The Poisson model is a reasonable working description of spring demand, so Ana can use it for planning, for example the 4% chance of a day with five or more orders. A good fit doesn’t prove the model: with 122 days the test can detect only fairly large departures. And the rate itself changed after the July relaunch, when the shop took between 8 and 19 orders a day, so a model fitted to the spring says nothing about the autumn.' },
    { level: 'applied', title: 'Should Ana promote the app to raise subscriptions?', fictional: true,
      setup: 'Ana is considering spending $1,500 on promoting the app to web customers, on the reasoning that app customers subscribe more. Using the 231 spring orders, how strong is the evidence that the subscription share differs by channel, how big is the difference, and does it support the spending?',
      steps: [
        'Describe: 57 of 99 app orders (57.6%) and 47 of 132 web orders (35.6%) were subscriptions, a gap of 22.0 percentage points.',
        'Check: the data are counts of orders in a 2 × 2 table, each order in one cell, and the smallest expected count is 44.57, far above 5. Some customers ordered more than once, a mild breach of independence worth stating.',
        String.raw`Test: <m>\chi^2 \approx 11.03</m> with 1 degree of freedom, p ≈ 0.0009 (<x>=CHISQ.TEST(B2:C3,B7:C8)</x> on the observed and expected tables); the two-proportion test gives <m>z \approx 3.32</m> and the same p-value. Strong evidence of an association.`,
        'Size: the 95% interval for the gap runs from 9.3 to 34.7 points, and V ≈ 0.22. The interval is wide because 99 and 132 orders are not many.',
        'Cause: customers chose their channel. Regular customers may be more likely both to install the app and to subscribe, so the gap may reflect who uses the app rather than what the app does.',
      ],
      answer: 'The subscription share is associated with channel: 22.0 points higher for app orders (95% CI 9.3 to 34.7 points; p ≈ 0.0009). The data can’t show that moving a customer to the app would make them subscribe.',
      interpretation: 'The evidence justifies a closer look, not spending on the assumption that the app causes subscriptions. Ana could ask app subscribers why they subscribed or follow customers who switch to the app, but only a randomised comparison would settle the causal question. The spring orders also predate the July relaunch, so she should check the pattern in the autumn’s orders before acting.' },
  ],

  demo: [
    { widget: 'pc-weekdays', intro: 'Observed and expected orders for each weekday. The bars differ by a few orders each; the chi-square statistic adds those gaps up, scaled by the expected counts, to see whether they are larger than chance.' },
    { widget: 'pc-curve', intro: 'The weekday test’s χ² of 5.82 on the chi-square distribution with 6 degrees of freedom, and the 5% rejection region. Change the degrees of freedom to see the critical value move (1 df for a 2 × 2 table, 4 for the Poisson fit), and switch to “Value for a probability” to find a critical value with CHISQ.INV.'},
    { widget: 'pc-sheet', intro: 'The channel × subscription table as a worksheet: expected counts, χ², CHISQ.TEST, Cramér’s V and the two-proportion z test. Change the observed counts in B2:C3 and watch χ² and z² stay equal. Try making the app row small (say 3 subscriptions and 5 one-off orders) to see the smallest expected count fall below 5.' },
  ],

  mistakes: [
    { title: '“CHISQ.TEST wants the expected proportions.”', html: 'It wants expected <i>counts</i>, with the same total as the observed counts. Given proportions such as 0.4 and 0.3, it compares 92 loaves with 0.4 of a loaf and returns a p-value of essentially 0. Multiply the proportions by n first.' },
    { title: '“Equal categories mean equal expected counts.”', html: 'Only if the categories are equally likely under the null hypothesis. Lantern’s spring had 18 Mondays and 17 Thursdays, so equal daily rates predict more Monday orders. Build the expected counts from the model, not from k equal shares.' },
    { title: '“CHISQ.TEST always uses the right degrees of freedom.”', html: 'It uses k − 1 for one column and (r − 1)(c − 1) for a table. When a parameter such as λ was estimated from the data, the correct df is smaller: calculate χ² with SUMPRODUCT and use CHISQ.DIST.RT with k − 1 − m.' },
    { title: '“Pool the proportions for the interval too.”', html: 'The test pools because it assumes p₁ = p₂. The interval estimates the difference, so it uses each sample’s own proportion. Use the pooled standard error for z and the unpooled one for the interval.' },
    { title: '“p = 0.98, so web and app customers rate Lantern the same.”', html: 'A large p-value means no evidence of a difference, not evidence of none. The five-star shares could differ by up to 16 points either way on these 154 ratings: fail to reject is not accept.' },
    { title: '“The chi-square test shows the app causes subscriptions.”', html: 'A significant chi-square says two variables are associated beyond chance. Customers chose their channel, so a confounder such as loyalty can produce the association. Causal claims need a design in which the groups don’t choose themselves.' },
  ],

  application: [
    { p: 'Cross-tabulations are among the commonest tables in business reporting: complaints by product, churn by plan, defects by production line, survey answers by customer segment. A chi-square test is the check that a pattern in such a table is larger than chance before anyone acts on it, and a two-proportion test with its interval is the standard way to compare two rates, such as a defect rate before and after a change of supplier. Survey researchers run the same tests on questionnaire data, with the sampling caveats that M04 Market Research covers.' },
    { case: 'Ana writes three lines for her October review. “Web conversion fell from 2.91% in August to 1.80% in September (z = 4.75, p &lt; 0.0001): a fall of 1.1 points (95% CI 0.6 to 1.6), about 98 orders a month. App conversion didn’t change (p = 0.84), which points at the new website checkout.” “Spring orders show no weekday pattern (χ² = 5.82, 6 df, p = 0.44), so packing and staffing stay the same every day.” “App orders were subscriptions far more often than web orders (57.6% against 35.6%; χ² = 11.0, p = 0.0009, V = 0.22), but customers choose their channel, so this doesn’t show that moving customers to the app would raise subscriptions.”' },
    { p: 'The habit to take from her review is a reporting standard: the counts and percentages, the test and its p-value, an interval or an effect size, and the conditions that might weaken the conclusion, followed by what the result does and doesn’t license. A p-value on its own answers none of the questions a manager asks next: how big, how sure, and why.' },
  ],

  summary: [
    'The two-proportion z test compares two rates: z = (p̂₁ − p̂₂) ÷ √(p̄(1 − p̄)(1/n₁ + 1/n₂)), with the pooled proportion p̄. The interval for p₁ − p₂ uses the unpooled standard error.',
    'Conditions for both: independent samples or trials, and at least 10 successes and 10 failures in each sample.',
    'χ² = Σ(O − E)² ÷ E compares observed with expected counts; under the null hypothesis it follows a chi-square distribution, right-skewed with mean equal to its degrees of freedom. The p-value is, almost always, the right tail: CHISQ.DIST.RT.',
    'Goodness of fit: E = n × p from the model, df = k − 1 − m (m parameters estimated from the data). Merge categories until every expected count is at least 5.',
    'Independence: E = row total × column total ÷ n, df = (r − 1)(c − 1). CHISQ.TEST(observed, expected) returns the p-value; it needs expected counts, not proportions, and it can’t allow for estimated parameters.',
    'For a 2 × 2 table χ² = z²: the chi-square test is the two-sided two-proportion test.',
    'Report size as well as significance (percentages, an interval, Cramér’s V). A non-significant result is not proof of no difference, and an association is not a cause.',
  ],

  glossary: [
    { term: 'Two-proportion z test', def: 'A test of whether two population proportions are equal, using z = (p̂₁ − p̂₂) divided by the standard error worked out from the pooled proportion, compared with the standard normal distribution.' },
    { term: 'Pooled proportion', def: 'The proportion of successes in two samples combined, (x₁ + x₂) ÷ (n₁ + n₂): the estimate of a common proportion used in the standard error of a two-proportion z test.' },
    { term: 'Expected count', def: 'The number of observations a category or cell would be expected to hold if the null hypothesis were true: n × p for a goodness-of-fit test, row total × column total ÷ n for a test of independence.' },
    { term: 'Chi-square statistic', def: 'χ² = Σ(O − E)² ÷ E, the sum over categories or cells of the squared difference between the observed and expected counts divided by the expected count. It is 0 when every count matches its expectation.' },
    { term: 'Chi-square distribution', def: 'The distribution of the sum of the squares of k independent standard normal variables, k being its degrees of freedom. It is never negative and is skewed to the right, with mean k; chi-square tests use its right tail.' },
    { term: 'Goodness-of-fit test', def: 'A chi-square test of whether the counts of one categorical variable follow a stated distribution, with k − 1 − m degrees of freedom for k categories and m parameters estimated from the data.' },
    { term: 'Test of independence', def: 'A chi-square test of whether two categorical variables are related, comparing a contingency table’s counts with the counts expected if they were independent; (r − 1)(c − 1) degrees of freedom.' },
    { term: 'Cramér’s V', def: 'A measure of the strength of association in a contingency table, √(χ² ÷ (n × min(r − 1, c − 1))), from 0 for no association to 1 for complete association.' },
  ],

  references: [
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2017). <i>Introductory Business Statistics</i>, section 10.4, “Comparing Two Independent Population Proportions”. OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics/pages/10-4-comparing-two-independent-population-proportions', checked: '2026-10-24' },
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2017). <i>Introductory Business Statistics</i>, section 11.3, “Goodness-of-Fit Test”, and section 11.4, “Test of Independence”. OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics/pages/11-4-test-of-independence', checked: '2026-10-24' },
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2017). <i>Introductory Business Statistics</i>, chapter 11, “Formula Review” (the chi-square distribution’s mean and standard deviation). OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics/pages/11-formula-review', checked: '2026-10-24' },
    { text: 'NIST/SEMATECH. <i>e-Handbook of Statistical Methods</i>, section 1.3.5.15, “Chi-Square Goodness-of-Fit Test”.', url: 'https://itl.nist.gov/div898/handbook/eda/section3/eda35f.htm', checked: '2026-10-24' },
    { text: 'Microsoft Support. “CHISQ.TEST function”, with the pages for CHISQ.DIST.RT and CHISQ.INV.RT.', url: 'https://support.microsoft.com/en-us/excel/chisq-test-function', checked: '2026-10-24' },
    { text: 'Weisstein, E. W. “Cramér’s V”. <i>MathWorld</i>, a Wolfram Resource.', url: 'https://mathworld.wolfram.com/CramersV.html', checked: '2026-10-24' },
  ],

  checks: [
    // conversion: August against September (web)
    { what: 'August web conversion %', value: CT.p1 * 100, shown: 2.91 },
    { what: 'September web conversion %', value: CT.p2 * 100, shown: 1.80 },
    { what: 'August orders', value: CONVERSION.aug.orders, shown: 224 },
    { what: 'August visits', value: CONVERSION.aug.visits, shown: 7700 },
    { what: 'September orders', value: CONVERSION.sep.orders, shown: 158 },
    { what: 'September visits', value: CONVERSION.sep.visits, shown: 8800 },
    { what: 'Fall in points', value: CT.diff * 100, shown: 1.11 },
    { what: 'Fall as a proportion', value: CT.diff, shown: 0.01114, tol: 0.000005 },
    { what: 'Pooled successes', value: CONVERSION.aug.orders + CONVERSION.sep.orders, shown: 382 },
    { what: 'Pooled trials', value: CONVERSION.aug.visits + CONVERSION.sep.visits, shown: 16500 },
    { what: 'Pooled proportion', value: CT.pool, shown: 0.023152, tol: 0.0000005 },
    { what: 'p̄(1 − p̄)', value: CT.pool * (1 - CT.pool), shown: 0.02262, tol: 0.000005 },
    { what: '1/7,700 + 1/8,800', value: 1 / 7700 + 1 / 8800, shown: 0.0002435, tol: 0.00000005 },
    { what: 'SE from the rounded pieces', value: Math.sqrt(0.02262 * 0.0002435), shown: 0.002347, tol: 0.0000005 },
    { what: 'Pooled proportion %', value: CT.pool * 100, shown: 2.3, tol: 0.05 },
    { what: 'Pooled SE', value: CT.sePool, shown: 0.002347, tol: 0.0000005 },
    { what: 'Pooled SE in points', value: CT.sePool * 100, shown: 0.2347, tol: 0.00005 },
    { what: 'Gap in points (3 dp)', value: CT.diff * 100, shown: 1.114, tol: 0.0005 },
    { what: 'z', value: CT.z, shown: 4.75 },
    { what: 'z from the rounded figures', value: 1.114 / 0.2347, shown: 4.75 },
    { what: 'Two-sided p (× 1e6)', value: CT.pValue * 1e6, shown: 2, tol: 0.1 },
    { what: 'Two-sided p below 0.0001', value: Number(CT.pValue < 0.0001), shown: 1 },
    { what: 'CI low (points)', value: CT.low * 100, shown: 0.65 },
    { what: 'CI high (points)', value: CT.high * 100, shown: 1.58 },
    { what: 'CI low rounded (points)', value: CT.low * 100, shown: 0.6, tol: 0.05 },
    { what: 'CI high rounded (points)', value: CT.high * 100, shown: 1.6, tol: 0.05 },
    { what: 'Fall rounded (points)', value: CT.diff * 100, shown: 1.1, tol: 0.05 },
    { what: 'Unpooled SE', value: CT.se, shown: 0.002382, tol: 0.0000005 },
    { what: 'z* for 95%', value: I.normInv(0.975), shown: 1.96 },
    { what: 'Margin', value: I.normInv(0.975) * CT.se, shown: 0.00467, tol: 0.000005 },
    { what: 'Margin from rounded figures', value: 1.96 * 0.002382, shown: 0.00467, tol: 0.000005 },
    { what: 'Interval from rounded figures, low', value: (0.01114 - 0.00467) * 100, shown: 0.65 },
    { what: 'Interval from rounded figures, high', value: (0.01114 + 0.00467) * 100, shown: 1.58 },
    { what: 'Orders lost at September visits', value: CT.diff * CONVERSION.sep.visits, shown: 98, tol: 0.5 },
    { what: 'September as % of August rate', value: (CT.p2 / CT.p1) * 100, shown: 62, tol: 0.5 },
    { what: 'Relative fall %', value: (1 - CT.p2 / CT.p1) * 100, shown: 38, tol: 0.5 },
    { what: 'August failures', value: CONVERSION.aug.visits - CONVERSION.aug.orders, shown: 7476 },
    { what: 'September failures', value: CONVERSION.sep.visits - CONVERSION.sep.orders, shown: 8642 },
    // app comparison group
    { what: 'App conversion August %', value: APP.p1 * 100, shown: 3.68 },
    { what: 'App conversion September %', value: APP.p2 * 100, shown: 3.58 },
    { what: 'App z', value: APP.z, shown: 0.20 },
    { what: 'App p', value: APP.pValue, shown: 0.84 },
    // weekdays
    { what: 'Spring days', value: WEEKDAYS.days.reduce((a, b) => a + b, 0), shown: 122 },
    { what: 'Spring orders', value: WEEKDAYS.orders.reduce((a, b) => a + b, 0), shown: 231 },
    { what: 'Orders per day', value: 231 / 122, shown: 1.89 },
    { what: 'Mondays', value: WEEKDAYS.days[0], shown: 18 },
    { what: 'Tuesdays', value: WEEKDAYS.days[1], shown: 18 },
    { what: 'Sundays', value: WEEKDAYS.days[6], shown: 18 },
    { what: 'Other weekdays have 17', value: Number([2, 3, 4, 5].every((i) => WEEKDAYS.days[i] === 17)), shown: 1 },
    { what: '231 ÷ 7', value: 231 / 7, shown: 33 },
    { what: 'Monday expected', value: WK.expected[0], shown: 34.08 },
    { what: 'Sunday orders', value: WEEKDAYS.orders[6], shown: 26 },
    { what: 'Sunday expected', value: WK.expected[6], shown: 34.08 },
    { what: 'Sunday contribution', value: WK.contrib[6], shown: 1.92 },
    { what: 'Sunday contribution is the largest', value: Number(WK.contrib[6] === Math.max(...WK.contrib)), shown: 1 },
    { what: 'Weekday chi-square', value: WK.stat, shown: 5.82 },
    { what: 'Weekday chi-square (3 dp)', value: WK.stat, shown: 5.822, tol: 0.0005 },
    { what: 'Weekday df', value: WK.df, shown: 6 },
    { what: 'Weekday p', value: WK.p, shown: 0.44 },
    { what: 'CHISQ.DIST.RT(5.82,6)', value: I.chi2Sf(5.82, 6), shown: 0.44 },
    { what: 'Weekday 5% critical value', value: I.chi2InvSf(0.05, 6), shown: 12.59 },
    { what: 'Monday orders per day', value: WEEKDAYS.orders[0] / WEEKDAYS.days[0], shown: 2.17 },
    { what: 'Sunday orders per day', value: WEEKDAYS.orders[6] / WEEKDAYS.days[6], shown: 1.44 },
    { what: 'About 33 orders per weekday', value: 231 / 7, shown: 33, tol: 0.5 },
    { what: 'Weekday expected, 17-day weekdays', value: WK.expected[2], shown: 32.19 },
    ...[0.710, 0.489, 0.719, 0.836, 1.049, 0.102, 1.917].map((v, i) => ({ what: `Weekday contribution ${WEEKDAYS.names[i]}`, value: WK.contrib[i], shown: v, tol: 0.0005 })),
    // channel × subscription
    { what: 'Web subscriptions', value: cs[0][0], shown: 47 },
    { what: 'App subscriptions', value: cs[1][0], shown: 57 },
    { what: 'Web orders', value: cs[0][0] + cs[0][1], shown: 132 },
    { what: 'App orders', value: cs[1][0] + cs[1][1], shown: 99 },
    { what: 'All subscriptions', value: CS.colTotals[0], shown: 104 },
    { what: 'All one-off', value: CS.colTotals[1], shown: 127 },
    { what: 'Web subscription share %', value: CSZ.p2 * 100, shown: 35.6, tol: 0.05 },
    { what: 'App subscription share %', value: CSZ.p1 * 100, shown: 57.6, tol: 0.05 },
    { what: 'Overall subscription share %', value: (CS.colTotals[0] / CS.n) * 100, shown: 45.0, tol: 0.05 },
    { what: 'Expected web subscriptions', value: CS.expected[0][0], shown: 59.43 },
    { what: 'Expected web one-off', value: CS.expected[0][1], shown: 72.57 },
    { what: 'Expected app subscriptions', value: CS.expected[1][0], shown: 44.57 },
    { what: 'Expected app one-off', value: CS.expected[1][1], shown: 54.43 },
    { what: 'Web shortfall', value: CS.expected[0][0] - cs[0][0], shown: 12.43 },
    { what: 'App excess', value: cs[1][0] - CS.expected[1][0], shown: 12.43 },
    { what: 'Channel chi-square', value: CS.stat, shown: 11.03 },
    { what: 'Channel chi-square, 1 dp', value: CS.stat, shown: 11.0, tol: 0.05 },
    { what: 'Channel df', value: CS.df, shown: 1 },
    { what: 'Channel p', value: CS.p, shown: 0.0009, tol: 0.00005 },
    { what: 'CHISQ.DIST.RT(11.03,1)', value: I.chi2Sf(11.03, 1), shown: 0.0009, tol: 0.00005 },
    { what: 'Channel p below 1 in 1,000', value: Number(CS.p < 0.001), shown: 1 },
    { what: 'Smallest expected (channel)', value: CS.minExpected, shown: 44.57 },
    { what: 'Two-proportion z, app minus web', value: CSZ.z, shown: 3.32 },
    { what: 'App share (4 dp)', value: CSZ.p1, shown: 0.5758, tol: 0.00005 },
    { what: 'Web share (4 dp)', value: CSZ.p2, shown: 0.3561, tol: 0.00005 },
    { what: 'Pooled SE (channel)', value: CSZ.sePool, shown: 0.0661, tol: 0.00005 },
    { what: 'z squared equals chi-square', value: CSZ.z ** 2, shown: CS.stat, tol: 1e-9 },
    { what: '3.32² ≈ 11.03', value: 3.32 ** 2, shown: 11.03, tol: 0.01 },
    { what: 'Same p-value', value: CSZ.pValue, shown: CS.p, tol: 1e-12 },
    { what: 'Gap in points', value: CSZ.diff * 100, shown: 22.0, tol: 0.05 },
    { what: 'Gap CI low', value: CSZ.low * 100, shown: 9.3, tol: 0.05 },
    { what: 'Gap CI high', value: CSZ.high * 100, shown: 34.7, tol: 0.05 },
    { what: 'Cramér’s V (channel)', value: CS.cramersV, shown: 0.22 },
    { what: 'V by formula (channel)', value: Math.sqrt(CS.stat / (CS.n * 1)), shown: CS.cramersV, tol: 1e-12 },
    // ratings
    { what: 'Web five-star share %', value: RBZ.p2 * 100, shown: 44.0, tol: 0.05 },
    { what: 'App five-star share %', value: RBZ.p1 * 100, shown: 44.3, tol: 0.05 },
    { what: 'Ratings chi-square', value: RB.stat, shown: 0.0009, tol: 0.00005 },
    { what: 'Ratings p', value: RB.p, shown: 0.98 },
    { what: 'Ratings V', value: RB.cramersV, shown: 0.002, tol: 0.0005 },
    { what: 'Five-star gap (points)', value: RBZ.diff * 100, shown: 0.2, tol: 0.05 },
    { what: 'Five-star gap CI low', value: RBZ.low * 100, shown: -15.5, tol: 0.05 },
    { what: 'Five-star gap CI high', value: RBZ.high * 100, shown: 16.0, tol: 0.05 },
    { what: 'Rated orders', value: rb.flat().reduce((a, b) => a + b, 0), shown: 154 },
    // regions
    { what: 'Region table df', value: RG.df, shown: 4 },
    { what: 'Region V', value: RG.cramersV, shown: 0.34 },
    { what: 'East subscription share %', value: regionShare[2] * 100, shown: 75, tol: 0.05 },
    { what: 'Lowest other region share %', value: Math.min(...regionShare.filter((_, i) => i !== 2)) * 100, shown: 32, tol: 0.5 },
    { what: 'Highest other region share %', value: Math.max(...regionShare.filter((_, i) => i !== 2)) * 100, shown: 44, tol: 0.05 },
    // Excel examples quoted from Microsoft
    { what: 'Microsoft: CHISQ.DIST.RT(18.307,10)', value: I.chi2Sf(18.307, 10), shown: 0.0500006, tol: 0.0000005 },
    // bakery
    { what: 'Bakery loaves', value: BAKE_O.reduce((a, b) => a + b, 0), shown: 200 },
    { what: 'Bakery expected sourdough', value: BK.expected[0], shown: 80 },
    { what: 'Bakery expected white', value: BK.expected[1], shown: 60 },
    { what: 'Bakery expected rye', value: BK.expected[2], shown: 40 },
    { what: 'Bakery expected spelt', value: BK.expected[3], shown: 20 },
    { what: 'Bakery contribution sourdough', value: BK.contrib[0], shown: 1.8 },
    { what: 'Bakery contribution white', value: BK.contrib[1], shown: 0.6 },
    { what: 'Bakery contribution rye', value: BK.contrib[2], shown: 0.1 },
    { what: 'Bakery contribution spelt', value: BK.contrib[3], shown: 0.8 },
    { what: 'Bakery chi-square', value: BK.stat, shown: 3.3 },
    { what: 'Bakery p', value: BK.p, shown: 0.35 },
    { what: 'Bakery critical value', value: I.chi2InvSf(0.05, 3), shown: 7.81 },
    { what: 'Sourdough extra loaves', value: BAKE_O[0] - BK.expected[0], shown: 12 },
    // hotel
    { what: 'Hotel bookings', value: HT.n, shown: 600 },
    { what: 'Hotel cancellations', value: HT.rowTotals[0], shown: 96 },
    { what: 'Hotel cancellation share %', value: (HT.rowTotals[0] / HT.n) * 100, shown: 16 },
    { what: 'Hotel expected direct cancelled', value: HT.expected[0][0], shown: 28.8 },
    { what: 'Hotel expected agency cancelled', value: HT.expected[0][1], shown: 48.0 },
    { what: 'Hotel expected corporate cancelled', value: HT.expected[0][2], shown: 19.2 },
    { what: 'Hotel expected direct kept', value: HT.expected[1][0], shown: 151.2 },
    { what: 'Hotel expected agency kept', value: HT.expected[1][1], shown: 252.0 },
    { what: 'Hotel expected corporate kept', value: HT.expected[1][2], shown: 100.8 },
    { what: 'Hotel smallest expected', value: HT.minExpected, shown: 19.2 },
    { what: 'Hotel contribution direct cancelled', value: HT.contrib[0][0], shown: 4.05 },
    { what: 'Hotel contribution direct kept', value: HT.contrib[1][0], shown: 0.77 },
    { what: 'Hotel contribution agency cancelled', value: HT.contrib[0][1], shown: 6.75 },
    { what: 'Hotel contribution agency kept', value: HT.contrib[1][1], shown: 1.29 },
    { what: 'Hotel contribution corporate cancelled', value: HT.contrib[0][2], shown: 2.70 },
    { what: 'Hotel contribution corporate kept', value: HT.contrib[1][2], shown: 0.51 },
    { what: 'Hotel chi-square', value: HT.stat, shown: 16.07 },
    { what: 'Hotel df', value: HT.df, shown: 2 },
    { what: 'Hotel p', value: HT.p, shown: 0.0003, tol: 0.00005 },
    { what: 'Hotel critical value', value: I.chi2InvSf(0.05, 2), shown: 5.99 },
    { what: 'Hotel V', value: HT.cramersV, shown: 0.16 },
    { what: 'Agency cancellation %', value: (HOTEL[0][1] / HT.colTotals[1]) * 100, shown: 22 },
    { what: 'Direct cancellation %', value: (HOTEL[0][0] / HT.colTotals[0]) * 100, shown: 10 },
    { what: 'Corporate cancellation %', value: (HOTEL[0][2] / HT.colTotals[2]) * 100, shown: 10 },
    // Poisson fit
    { what: 'Days with 0 orders', value: OBS[0], shown: 18 },
    { what: 'Days with 1 order', value: OBS[1], shown: 35 },
    { what: 'Days with 2 orders', value: OBS[2], shown: 33 },
    { what: 'Days with 3 orders', value: OBS[3], shown: 18 },
    { what: 'Days with 4 orders', value: OBS[4], shown: 14 },
    { what: 'Days with 5 orders', value: OBS[5], shown: 4 },
    { what: 'No day above 5', value: Number(D.perDay.counts.length === 6), shown: 1 },
    { what: 'λ', value: LAM, shown: 1.89 },
    { what: 'λ = 231/122 (used in formulas)', value: LAM, shown: 231 / 122, tol: 1e-12 },
    { what: 'P(5 or more)', value: P5UP, shown: 0.0436, tol: 0.00005 },
    ...[0.1506, 0.2851, 0.2699, 0.1703, 0.0806].map((v, k) => ({ what: `Poisson probability of ${k}`, value: PK[k], shown: v, tol: 0.00005 })),
    { what: 'Expected 5 or more', value: EXP[5], shown: 5.31 },
    { what: 'Expected exactly 5', value: NDAYS * I.poissonPmf(5, LAM), shown: 3.73 },
    { what: 'Expected 6 or more', value: SIXUP, shown: 1.59 },
    { what: 'Expected 0', value: EXP[0], shown: 18.37 },
    { what: 'Expected 1', value: EXP[1], shown: 34.78 },
    { what: 'Expected 2', value: EXP[2], shown: 32.92 },
    { what: 'Expected 3', value: EXP[3], shown: 20.78 },
    { what: 'Expected 4', value: EXP[4], shown: 9.84 },
    { what: 'Poisson contribution 0', value: PF.contrib[0], shown: 0.007, tol: 0.0005 },
    { what: 'Poisson contribution 1', value: PF.contrib[1], shown: 0.001, tol: 0.0005 },
    { what: 'Poisson contribution 2', value: PF.contrib[2], shown: 0.000, tol: 0.0005 },
    { what: 'Poisson contribution 3', value: PF.contrib[3], shown: 0.372, tol: 0.0005 },
    { what: 'Poisson contribution 4', value: PF.contrib[4], shown: 1.762, tol: 0.0005 },
    { what: 'Poisson contribution 5+', value: PF.contrib[5], shown: 0.325, tol: 0.0005 },
    { what: 'Poisson chi-square', value: PF.stat, shown: 2.47 },
    { what: 'Poisson df', value: PF.df, shown: 4 },
    { what: 'Poisson p', value: PF.p, shown: 0.65 },
    { what: 'CHISQ.DIST.RT(2.47,4)', value: I.chi2Sf(2.47, 4), shown: 0.65 },
    { what: 'CHISQ.TEST with 5 df', value: I.chi2Sf(PF.stat, 5), shown: 0.78 },
    { what: 'Chance of 5 or more orders, %', value: P5UP * 100, shown: 4, tol: 0.5 },
    { what: 'Autumn orders per day, lowest', value: Math.min(...autumnPerDay), shown: 8, tol: 0.5 },
    { what: 'Autumn orders per day, highest', value: Math.max(...autumnPerDay), shown: 19, tol: 0.5 },
    { what: 'Autumn months are July to December', value: Number(MONTHS[0] === 'Jul 2026' && MONTHS[5] === 'Dec 2026'), shown: 1 },
    // applied example
    { what: 'Promotion budget (fictional)', value: 1500, shown: 1500 },
    // twenty tables, about one false positive
    { what: 'Expected false positives in 20 tests at 5%', value: 20 * 0.05, shown: 1 },
  ],
};
