// sampling-distributions.js — B04 · Sampling distributions. Content only; exercises are in sampling-distributions.ex.js.
// Treats the 231 spring orders (ORDER_VALUES; DERIVED.orders) as a population whose parameters are known, to show the
// sampling distribution of the mean, the standard error and the central limit theorem on a strongly skewed population;
// SUBSCRIPTION_FLAGS for a proportion; REGION_SUBSCRIPTION for a stratified sample; B01's monthly AOV (SHOP) for the
// applied example. Simulated figures use a seeded generator (core/rng.js), so the checks reproduce them exactly.
// Confidence intervals are the next lesson's; tests are Module 3's. Every figure printed is recomputed in `checks`.
import { ORDER_VALUES, SUBSCRIPTION_FLAGS, REGION_SUBSCRIPTION, SHOP, SURVEY, DERIVED as D } from './case.js?v=12';
import * as I from '../../../core/inference.js?v=12';
import { mean, sd, skewness } from '../../../core/stats.js?v=12';
import { mulberry32 } from '../../../core/rng.js?v=12';

// ---------------------------------------------------------------- the population and its parameters
const N = ORDER_VALUES.length, MU = D.orders.mean, SIGMA = D.orders.sdPop;   // the 231 orders as the population: STDEV.P
const BULK = D.orders.max, ORDINARY = ORDER_VALUES.filter((x) => x !== BULK);
const se = (n) => SIGMA / Math.sqrt(n);
const fpc = (n, Npop = N) => Math.sqrt((Npop - n) / (Npop - 1));
const G1 = D.orders.skewness, G1o = skewness(ORDINARY);
/** Excel's SKEW.P: the skewness of a whole population (third central moment ÷ σ³, dividing by N). */
const skewP = (a) => { const m = mean(a), n = a.length, m2 = a.reduce((s, x) => s + (x - m) ** 2, 0) / n, m3 = a.reduce((s, x) => s + (x - m) ** 3, 0) / n; return m3 / m2 ** 1.5; };
const G1p = skewP(ORDER_VALUES), G1op = skewP(ORDINARY);
const cochran = 25 * G1p ** 2, cochranO = 25 * G1op ** 2;
/** Means of `reps` samples of n drawn with replacement, from a seeded generator. */
function simulate(pop, n, reps, seed) {
  const r = mulberry32(seed), out = new Float64Array(reps);
  for (let k = 0; k < reps; k++) { let t = 0; for (let i = 0; i < n; i++) t += pop[Math.floor(r() * pop.length)]; out[k] = t / n; }
  return out;
}
const SIM = simulate(ORDER_VALUES, 30, 100000, 7);
/** The same without replacement (a partial shuffle for each sample). */
function simulateNoRepl(pop, n, reps, seed) {
  const r = mulberry32(seed), out = new Float64Array(reps);
  for (let k = 0; k < reps; k++) { const idx = pop.map((_, i) => i); let t = 0; for (let i = 0; i < n; i++) { const j = i + Math.floor(r() * (pop.length - i)); [idx[i], idx[j]] = [idx[j], idx[i]]; t += pop[idx[i]]; } out[k] = t / n; }
  return out;
}
const SIM_NR = simulateNoRepl(ORDER_VALUES, 30, 100000, 7);
const simOver50nr = SIM_NR.filter((x) => x > 50).length / SIM_NR.length;
/** Share of 95% t intervals from samples of n (with replacement) that contain the population mean. */
function coverT(pop, n, reps, seed) {
  const r = mulberry32(seed), mu = mean(pop); let hit = 0;
  for (let k = 0; k < reps; k++) { const xs = []; for (let i = 0; i < n; i++) xs.push(pop[Math.floor(r() * pop.length)]); const c = I.ciMean(xs); if (c.low <= mu && mu <= c.high) hit++; }
  return hit / reps;
}
const COVER_ORD30 = coverT(ORDINARY, 30, 20000, 3);
const simOver50 = SIM.filter((x) => x > 50).length / SIM.length;
const pOffice30 = 1 - ((N - 1) / N) ** 30;
const z50 = (50 - MU) / se(30), normOver50 = I.normSf(z50), normOver50fpc = I.normSf((50 - MU) / (se(30) * fpc(30)));
// the proportion
const P = D.orders.subscriptionShare, SEP50 = Math.sqrt((P * (1 - P)) / 50);
const zP30 = (0.3 - P) / SEP50;
// the tiny population for the simple example
const TINY = [12, 18, 24, 42], muT = mean(TINY), sigT = sd(TINY, 0);
const TINY_MEANS = TINY.flatMap((a) => TINY.map((b) => (a + b) / 2));
// stratified sample of 40 by region (largest-remainder rounding)
const REG = REGION_SUBSCRIPTION.rows, REG_N = REGION_SUBSCRIPTION.counts.map((r) => r[0] + r[1]);
const quota = REG_N.map((k) => (40 * k) / N), floors = quota.map(Math.floor);
const extra = 40 - floors.reduce((a, b) => a + b, 0);
const order = quota.map((q, i) => [q - Math.floor(q), i]).sort((a, b) => b[0] - a[0]).slice(0, extra).map((x) => x[1]);
const ALLOC = floors.map((f, i) => f + (order.includes(i) ? 1 : 0));
const SUBSHARE = REGION_SUBSCRIPTION.counts.map((r) => r[0] / (r[0] + r[1]));
// the applied example: B01's monthly average order value
const MONTH_ORDERS = SHOP.webOrders.map((o, i) => o + SHOP.appOrders[i]);
const SIG_ORD = sd(ORDINARY);
const AOV = SHOP.aov, seMonth = MONTH_ORDERS.map((n) => SIG_ORD / Math.sqrt(n));
const julOct = MONTH_ORDERS.slice(0, 4).reduce((s, n, i) => s + n * AOV[i], 0) / MONTH_ORDERS.slice(0, 4).reduce((a, b) => a + b, 0);
const julOctN = MONTH_ORDERS.slice(0, 4).reduce((a, b) => a + b, 0), seLevel = SIG_ORD / Math.sqrt(julOctN);
const seDiff = Math.sqrt(seMonth[4] ** 2 + seLevel ** 2), zNov = (AOV[4] - julOct) / seDiff;
const CV_ORD = SIG_ORD / mean(ORDINARY), sdScaled = CV_ORD * julOct, zNovScaled = zNov * (SIG_ORD / sdScaled);
const binom15 = I.binomCdf(15, 50, P);

// ---------------------------------------------------------------- formatting
const f1 = (x) => Math.round(x * 10) / 10;
const usd = (v, d = 2) => `$${v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`;

// ---------------------------------------------------------------- figure: the population and two sampling distributions
function cltFigure() {
  const SIMa = simulate(ORDER_VALUES, 30, 20000, 3), SIMb = simulate(ORDINARY, 30, 20000, 3);
  const panel = (vals, ox, title, lo, hi, step, curve, tickStep) => {
    const L = ox + 10, W = 180, B = 170, T = 40;
    const edges = []; for (let e = lo + step; e < hi - 1e-9; e += step) edges.push(e);
    const counts = new Array(edges.length + 1).fill(0); let off = 0;
    for (const v of vals) { if (v >= hi) { off++; continue; } const k = Math.min(edges.length, Math.max(0, Math.floor((v - lo) / step))); counts[k]++; }
    const peak = curve ? (vals.length * step) * I.normal.pdf(curve[0], curve[0], curve[1]) : 0;
    const x = (v) => L + ((v - lo) / (hi - lo)) * W, top = Math.max(...counts, peak), y = (c) => B - (c / top) * (B - T);
    let s = `<text x="${L + W / 2}" y="16" text-anchor="middle" font-size="12">${title}</text>`;
    counts.forEach((c, i) => { if (c) s += `<rect x="${f1(x(lo + i * step)) + 0.5}" y="${f1(y(c))}" width="${f1(Math.max(1, x(lo + (i + 1) * step) - x(lo + i * step) - 1))}" height="${f1(B - y(c))}" fill="var(--series-1)" opacity="0.75"/>`; });
    if (curve) {
      const pts = []; for (let k = 0; k <= 120; k++) { const v = lo + ((hi - lo) * k) / 120; pts.push(`${f1(x(v))},${f1(y((vals.length * step) * I.normal.pdf(v, curve[0], curve[1])))}`); }
      s += `<polyline points="${pts.join(' ')}" fill="none" stroke="var(--series-2)" stroke-width="1.8" stroke-dasharray="5 3"/>`;
    }
    s += `<line x1="${L}" x2="${L + W}" y1="${B}" y2="${B}" stroke="var(--ink)" stroke-width="1"/>`;
    for (let t = lo; t < hi - tickStep / 2; t += tickStep) s += `<text x="${f1(x(t))}" y="${B + 14}" text-anchor="middle" font-size="10" fill="var(--ink-3)">$${t}</text>`;
    return { s, off };
  };
  const a = panel(ORDER_VALUES, 0, 'A. The 231 orders', 0, 200, 10, null, 50);
  const b = panel(SIMa, 212, 'B. Means of 30, all orders', 0, 120, 4, [MU, se(30)], 40);
  const c = panel(SIMb, 424, 'C. Means of 30, without LC-10144', 0, 120, 4, [mean(ORDINARY), sd(ORDINARY, 0) / Math.sqrt(30)], 40);
  let s = '<svg viewBox="0 0 624 210" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">';
  s += a.s + b.s + c.s;
  s += `<text x="100" y="198" text-anchor="middle" font-size="10" fill="var(--ink-3)">off the scale: ${a.off === 1 ? 'one order' : `${a.off} orders`}, $1,512</text>`;
  s += `<text x="424" y="198" text-anchor="middle" font-size="10" fill="var(--ink-3)">B and C, dashed: the normal curve the central limit theorem predicts</text>`;
  return `${s}</svg>`;
}

export default {
  slug: 'sampling-distributions',
  title: 'Sampling distributions',
  blurb: 'A sample’s mean or proportion changes from one sample to the next. See how much, through the standard error σ ÷ √n and the central limit theorem, on Lantern’s strongly skewed spring orders; use the normal model for a sample mean, and know when it misleads. Then compare the ways of drawing a sample and the biases that no sample size cures.',
  status: 'reviewed',
  objectives: [
    'Distinguish a parameter from a statistic, and explain what a sampling distribution is.',
    'Calculate the standard error of a sample mean and of a sample proportion, with the finite population correction when the sample is a large share of the population.',
    'Explain the central limit theorem, and judge how large a sample must be for a sample mean to be close to normal when the population is skewed.',
    'Calculate probabilities for a sample mean or proportion with the normal model, and recognise when that model is unreliable.',
    'Compare simple random, systematic, stratified and cluster samples, and identify the biases that a larger sample does not remove.',
  ],
  prerequisites: [
    { lesson: 'b04/normal-distribution', why: 'Sampling distributions are often normal: z-scores and NORM.DIST answer questions about them.' },
    { lesson: 'b01/data-collection', why: 'Populations, samples, sampling frames, simple random samples and the biases of surveys are introduced there.' },
    { lesson: 'b03/descriptive-statistics-and-regression', why: 'The ToolPak’s Standard Error line, s ÷ √n, is the estimate of the standard error this lesson explains.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Ana’s spring review used all 231 orders. Most of her questions from now on will be answered from part of the data: 79 survey replies, 40 bags weighed, one month’s orders. How far can a sample’s average stray from the truth it estimates? To find out, she treats the 231 spring orders as a population whose mean she knows, $39.38, and draws samples from it to see what the samples say.' },

    { h: 'Parameters and statistics' },
    { p: `A <g>parameter</g> describes a population and a <g>statistic</g> describes a sample. For the 231 orders taken as the population, the mean is μ = ${usd(MU)} and the standard deviation σ = ${usd(SIGMA)}, calculated with STDEV.P because these are all the values. A random sample of 30 of them has its own mean x̄ and standard deviation s, and these change from sample to sample. The difference between a statistic and its parameter is B01’s <g>sampling error</g>.` },
    { table: {
      caption: 'Population parameters and the sample statistics that estimate them',
      head: ['', 'Population (parameter)', 'Sample (statistic)'],
      align: ['l', 'l', 'l'],
      rows: [['Size', 'N', 'n'], ['Mean', 'μ', 'x̄'], ['Standard deviation', 'σ (STDEV.P)', 's (STDEV.S)'], ['Proportion', 'p', 'p̂ (“p-hat”)']],
    } },

    { h: 'The sampling distribution of the mean' },
    { p: 'Draw 30 orders at random and average them. Do it again, and again. Each sample gives a different x̄, and the distribution of x̄ over all the samples that could be drawn is its <g>sampling distribution</g>. It answers the question a single sample can’t: how far from μ is a sample mean likely to be? Three facts describe it, whatever the population looks like.' },
    { ol: [
      String.raw`<b>Centre.</b> The mean of all the possible sample means is μ. Sample means are not systematically high or low; any one of them is off by chance.`,
      String.raw`<b>Spread.</b> The standard deviation of the sample means is <m>\sigma \div \sqrt{n}</m>, the <g>standard error</g>. For samples of 30 orders it is <m>${SIGMA.toFixed(2)} \div \sqrt{30} = ${se(30).toFixed(2)}</m> dollars.`,
      String.raw`<b>Shape.</b> As n grows, the sampling distribution gets closer to a normal curve, even when the population is far from normal. This is the <g>central limit theorem</g>.`,
    ] },
    { p: String.raw`The square root matters. Four times as many orders halve the standard error: samples of 120 give <m>${SIGMA.toFixed(2)} \div \sqrt{120} = ${se(120).toFixed(2)}</m>. Precision costs more and more as you buy it. B03’s ToolPak printed a Standard Error line, <m>s \div \sqrt{n}</m>: that is this standard error, estimated with the sample’s s because σ is usually unknown.` },

    { h: 'The central limit theorem on a skewed population' },
    { p: 'Lantern’s orders are a severe test of the theorem. Most are under $40, and one, the $1,512 office order, is 14.6 standard deviations above the mean. The figure shows the population and the means of 20,000 simulated samples of 30.' },
    { figure: {
      svg: cltFigure(),
      caption: 'A: the 231 order values (cut at $200). B: the means of 20,000 random samples of 30 orders (drawn with replacement), with the normal curve the central limit theorem predicts (dashed). C: the same for samples from the 230 orders without the office order.',
      alt: `Three histograms. A, the 231 spring orders from $0 to $200: a tall peak below $40 and a long thin tail to the right, with the $1,512 office order off the scale. B, the means of 20,000 samples of 30 orders from $0 to $120: a main hump centred near $33 and a separate low hump near $80, while the dashed normal curve is centred at $39 and spreads over both. C, the means of samples of 30 from the 230 ordinary orders: a single hump near $33, slightly longer on the right, close to its dashed normal curve.`,
    } },
    { p: `Panel B is not normal. In about ${pc(pOffice30, 0)} of samples the office order is drawn, and it alone adds about $1,512 ÷ 30 ≈ $50 to the mean: those samples form the second hump. Without that one order (panel C) the means of 30 are already close to normal, though a 95% interval built from them in the next lesson’s way would still capture μ only about ${pc(COVER_ORD30, 0)} of the time. The central limit theorem is about what happens as n grows; it doesn’t promise that 30 is enough.` },

    { h: 'The sampling distribution of a proportion' },
    { p: String.raw`A proportion is a mean of 0s and 1s. Code each order 1 for a subscription and 0 for a one-off and the 231 orders have mean <m>p = 104 \div 231 = ${P.toFixed(3)}</m>. A sample’s proportion <m>\hat{p}</m> has a sampling distribution centred on p with standard error <m>\sqrt{p(1 - p) \div n}</m>: for samples of 50, <m>\sqrt{${P.toFixed(3)} \times ${(1 - P).toFixed(3)} \div 50} = ${SEP50.toFixed(4)}</m>, about 7 percentage points. By the central limit theorem it is close to normal when the sample has enough of each kind, a condition the In depth section states.` },
  ],

  theory: [
    { h: 'Why σ ÷ √n' },
    { p: String.raw`When n values are drawn independently, the variance of their total is n times the variance of one value, <m>n\sigma^2</m>. The mean is the total divided by n, so its variance is <m>n\sigma^2 \div n^2 = \sigma^2 \div n</m>, and its standard deviation <m>\sigma \div \sqrt{n}</m>. In words: in a sample, high and low values partly cancel, and the more values there are the more they cancel, but only with the square root of n. This is the <g>law of large numbers</g> made precise: the sample mean settles towards μ as n grows, and σ ÷ √n says how fast.` },
    { p: 'Notice what the formula leaves out: the size of the population. A random sample of 1,000 customers is as precise for a retailer with a million customers as for one with 50,000, provided the sample is a small part of each. Precision depends on the sample size and on how variable the population is, not on what fraction of it you see.' },

    { h: 'Sampling without replacement: the finite population correction' },
    { p: String.raw`Real samples are usually drawn without replacement: an order can’t be picked twice. When the sample is a large share of the population, each draw changes what is left, and the sample mean varies less than <m>\sigma \div \sqrt{n}</m> says. The <g>finite population correction</g> <m>\sqrt{(N - n) \div (N - 1)}</m> shrinks the standard error to match. OpenStax’s business text uses it when more than 5% of a known population is sampled.` },
    { p: String.raw`Thirty of the 231 orders is ${pc(30 / N, 0)} of the population: the correction is <m>\sqrt{201 \div 230} = ${fpc(30).toFixed(3)}</m> and the standard error falls from ${usd(se(30))} to ${usd(se(30) * fpc(30))}. Ana’s 40 bags came from thousands that Kilnworth fills, so for them the correction is almost exactly 1 and can be ignored. If the whole population is sampled, <m>n = N</m>, the correction is 0: a census has no sampling error.` },

    { h: 'How large must n be?' },
    { p: `OpenStax’s business text says the theorem needs a sample that is “large enough”, which it puts at 30 observations or more. That rule of thumb works for populations that are not badly skewed. For skewed populations a stricter guide is Cochran’s rule, as Kott and Levine (2024) state it: a 95% interval of the usual kind around a sample mean is reasonable when n is greater than 25 times the square of the population’s skewness.` },
    { p: String.raw`The rule needs the population’s skewness, which Excel’s SKEW.P calculates (SKEW adjusts for a sample). For the 231 orders as the population, SKEW.P is ${G1p.toFixed(2)}, so the rule asks for <m>25 \times ${G1p.toFixed(2)}^2 \approx ${Math.round(cochran).toLocaleString('en-US')}</m> orders. Without the office order SKEW.P is ${G1op.toFixed(2)} and the rule asks for more than <m>25 \times ${G1op.toFixed(2)}^2 \approx ${Math.round(cochranO)}</m>. Both are rules of thumb, not theorems; they say the same thing as the figure: the more skewed the population, and the more its mean depends on a few extreme values, the larger the sample it takes before x̄ behaves normally.` },

    { h: 'Estimating the standard error from one sample' },
    { p: String.raw`The formula needs σ, the population’s standard deviation, which is rarely known. In practice you put the sample’s s in its place: <m>s \div \sqrt{n}</m>, the line the ToolPak labels Standard Error. Ana’s 40 bags give <m>${D.kg.sd.toFixed(2)} \div \sqrt{40} = ${D.kg.ci.se.toFixed(2)}</m> g: her sample mean of 1,002.75 g is probably within about 1 g of the machine’s true mean. Because s is itself an estimate that varies from sample to sample, a z built from it is a little more variable than one built from σ; the next lesson’s t distribution allows for that.` },
    { p: 'Two habits follow. Report a sample mean with its standard error, so the reader can see how much it could move. And remember that the standard error estimates chance variation only if the sample was drawn at random: from 40 bags chosen because they looked underfilled, s ÷ √n would be a precise-looking answer to the wrong question.' },

    { h: 'When is a sample proportion close to normal?' },
    { p: String.raw`A proportion’s sampling distribution is a binomial count divided by n, so the previous lesson’s condition carries over: it is close to normal when the sample is expected to contain enough of each outcome. With p = 0.45 and n = 50, a sample should hold about <m>50 \times 0.45 = 22.5</m> subscriptions and 27.5 one-off orders, plenty of each. With n = 10 it would hold about 4.5 and 5.5: then <m>\hat{p}</m> can take only 11 values, 0, 0.1, …, 1, and its histogram is a set of separate bars rather than a curve. The Explore widget of sample proportions shows both.` },

    { h: 'Using the normal model for a sample mean' },
    { p: String.raw`When the sampling distribution is close to normal, standardise x̄ as you would one value, with the standard error in place of σ: <m>z = (\bar{x} - \mu) \div (\sigma \div \sqrt{n})</m>. NORM.DIST then gives probabilities for x̄, with the standard error as its standard_dev argument. The challenging example asks how often a sample of 30 orders averages more than $50, and finds that the normal model gets it badly wrong for this population.` },
    { p: String.raw`The same works for a proportion, with <m>z = (\hat{p} - p) \div \sqrt{p(1 - p) \div n}</m>. How often would a random sample of 50 orders, drawn with replacement, contain 30% subscriptions or fewer, if 45.0% of all orders are subscriptions? <m>z = (0.30 - ${P.toFixed(4)}) \div ${SEP50.toFixed(4)} = ${zP30.toFixed(2)}</m>, and <x>=NORM.S.DIST(-2.13,TRUE)</x> gives about ${pc(I.normCdf(-2.13))}. The exact binomial, <x>=BINOM.DIST(15,50,104/231,TRUE)</x>, gives ${pc(binom15)}: about once in ${Math.round(1 / binom15)} samples. The normal model is a little low this far into the tail, a reminder that it is an approximation.` },

    { h: 'How samples are drawn' },
    { p: 'The formulas above assume a <g>simple random sample</g> (B01): every set of n members of the frame equally likely. In Excel, put <x>=RAND()</x> beside each row (it returns a number from 0 up to 1, and a new one each time the sheet recalculates), copy the column and paste it back as values so it stops changing, sort by it, and take the first n rows. Three other designs are common.' },
    { table: {
      caption: 'Ways to draw about 40 of Lantern’s 231 spring orders',
      head: ['Design', 'How', 'Strength', 'Watch for'],
      align: ['l', 'l', 'l', 'l'],
      rows: [
        ['Simple random', 'RAND beside each order, sort, take the first 40', 'Every formula in this lesson applies directly', 'Can by chance under-represent a small group'],
        ['<g>Systematic sample</g>', 'A random start from 1 to 6, then every 6th order in date order (38 or 39 orders)', 'Easy to do from a list; spreads the sample over the spring', 'A cycle in the list with the same period (in a list of days, every 7th is the same weekday)'],
        ['<g>Stratified sample</g>', 'Split by region and draw at random within each, in proportion to its orders', 'Every region represented; more precise when the strata differ', 'Needs the stratum of every member before sampling'],
        ['<g>Cluster sample</g>', 'Pick some days at random and take every order on them', 'Cheap when data come in groups', 'Orders on one day are alike, so less information than 40 separate draws'],
      ],
    } },
    { p: `Stratification pays when the strata differ. Lantern’s regions do: ${pc(SUBSHARE[2], 0)} of East orders were subscriptions against ${pc(SUBSHARE[0], 0)} of North orders. A proportional stratified sample of 40 takes 40 × 58 ÷ 231 = ${quota[0].toFixed(2)} North orders, and so on; rounding by largest remainders gives ${REG.map((r, i) => `${ALLOC[i]} ${r}`).join(', ')}. The share of subscriptions it finds can’t swing because chance put too many East orders in the sample.` },

    { h: 'Biases that no sample size cures' },
    { p: 'Every formula here measures sampling error, the chance part. None measures bias, and a larger sample doesn’t reduce it. If the <g>sampling frame</g> leaves people out (a list of web customers that misses app-only buyers), if the people who answer differ from those who don’t (<g>non-response bias</g>), or if the measurement is off (a scale that reads 2 g light), every sample is wrong in the same direction, however large.' },
    { p: `B01’s September survey is the example to remember: ${SURVEY.sent} customers were invited and ${SURVEY.responses} replied, ${pc(SURVEY.responses / SURVEY.sent)}. The next lesson puts a margin of error on the 61 of 79 who would recommend Lantern, but that margin covers only the luck of which customers replied, not the possibility that happy customers were keener to reply. Survey design and response rates are M04 Market Research’s subject; this lesson’s point is that the standard error is silent about them.` },
  ],

  formulas: [
    { id: 'sd-se-mean', name: 'Standard error of the sample mean',
      tex: String.raw`\sigma_{\bar{x}} = \dfrac{\sigma}{\sqrt{n}}`,
      where: [[String.raw`\sigma_{\bar{x}}`, 'The standard deviation of the sampling distribution of x̄', 'units of x'], [String.raw`\sigma`, 'The population standard deviation', 'units of x'], [String.raw`n`, 'The sample size', '']],
      assumptions: 'Independent draws: a random sample with replacement, or a small share of a large population.',
      note: 'With σ unknown, s ÷ √n estimates it: the ToolPak’s Standard Error line, <x>=STDEV.S(A2:A31)/SQRT(COUNT(A2:A31))</x>.' },
    { id: 'sd-z-mean', name: 'z for a sample mean',
      tex: String.raw`z = \dfrac{\bar{x} - \mu}{\sigma / \sqrt{n}}`,
      where: [[String.raw`\bar{x}`, 'A sample mean', 'units of x'], [String.raw`\mu`, 'The population mean', 'units of x'], [String.raw`\sigma`, 'The population standard deviation', 'units of x'], [String.raw`n`, 'The sample size', ''], [String.raw`z`, 'How many standard errors x̄ lies from μ', '']],
      assumptions: 'The sampling distribution of x̄ is close to normal: a normal population, or n large enough for the population’s skewness.',
      note: 'In Excel, P(x̄ < a) = NORM.DIST(a, μ, σ/√n, TRUE).' },
    { id: 'sd-se-prop', name: 'Standard error of a sample proportion',
      tex: String.raw`\sigma_{\hat{p}} = \sqrt{\dfrac{p(1 - p)}{n}}, \qquad z = \dfrac{\hat{p} - p}{\sigma_{\hat{p}}}`,
      where: [[String.raw`p`, 'The population proportion', ''], [String.raw`\hat{p}`, 'A sample proportion', ''], [String.raw`n`, 'The sample size', ''], [String.raw`\sigma_{\hat{p}}`, 'The standard deviation of the sampling distribution of p̂', ''], [String.raw`z`, 'How many standard errors p̂ lies from p', '']],
      assumptions: 'Independent draws, and enough of each outcome for the normal model (at least 10 of each is the usual check).' },
    { id: 'sd-fpc', name: 'Finite population correction',
      tex: String.raw`\text{SE} = \dfrac{\sigma}{\sqrt{n}} \times \sqrt{\dfrac{N - n}{N - 1}}`,
      where: [[String.raw`N`, 'The population size', ''], [String.raw`n`, 'The sample size, drawn without replacement', ''], [String.raw`\sigma`, 'The population standard deviation', 'units of x'], [String.raw`\text{SE}`, 'The corrected standard error of the mean', 'units of x']],
      assumptions: 'Use it when the sample is more than about 5% of a known population.',
      note: 'For a proportion, multiply √(p(1 − p) ÷ n) by the same factor.' },
  ],

  examples: [
    { level: 'simple', title: 'Every sample of two from a population of four', fictional: true,
      setup: 'A population of four orders is worth $12, $18, $24 and $42. List the means of every sample of two drawn with replacement (16 ordered samples) and check the two facts about the sampling distribution: its centre is μ and its standard deviation is σ ÷ √2.',
      table: {
        caption: 'The mean of each sample of two (first draw down the side, second across the top)',
        head: ['First ↓ / second →', '$12', '$18', '$24', '$42'],
        align: ['l', 'r', 'r', 'r', 'r'],
        rows: TINY.map((a) => [`$${a}`, ...TINY.map((b) => `$${(a + b) / 2}`)]),
      },
      steps: [
        String.raw`Population: <m>\mu = (12 + 18 + 24 + 42) \div 4 = ${muT}</m>, and <m>\sigma = \sqrt{(144 + 36 + 0 + 324) \div 4} = \sqrt{126} = ${sigT.toFixed(2)}</m> dollars (STDEV.P: these four are the whole population).`,
        String.raw`Centre of the sampling distribution: the 16 means add to <m>${TINY_MEANS.reduce((a, b) => a + b, 0)}</m>, and <m>${TINY_MEANS.reduce((a, b) => a + b, 0)} \div 16 = ${mean(TINY_MEANS)}</m>, which is μ.`,
        String.raw`Spread: the population standard deviation of the 16 means is <m>${sd(TINY_MEANS, 0).toFixed(2)}</m>, and <m>\sigma \div \sqrt{2} = ${sigT.toFixed(2)} \div 1.414 = ${(sigT / Math.SQRT2).toFixed(2)}</m>: the same.`,
        'Shape: the population is lopsided ($42 is far from the rest), but the 16 means pile up in the middle; only 1 of 16 samples averages as much as $42, and 1 as little as $12.',
      ],
      answer: `The sample means average exactly $${muT} and have standard deviation $${sd(TINY_MEANS, 0).toFixed(2)} = $${sigT.toFixed(2)} ÷ √2.`,
      interpretation: 'With real populations there are far too many samples to list, but the same two facts hold, and they are what a single sample relies on: a sample mean is right on average, and its typical error shrinks with √n.' },
    { level: 'challenging', title: 'How often does a sample of 30 orders average more than $50?', fictional: true,
      setup: 'Ana draws 30 of the 231 spring orders at random. Use the normal model to find the probability that their mean is more than $50, with and without the finite population correction. Then compare it with what 100,000 simulated samples show, and explain the gap.',
      steps: [
        String.raw`Standard error: <m>${SIGMA.toFixed(2)} \div \sqrt{30} = ${se(30).toFixed(2)}</m> dollars; with the correction for drawing 30 of 231 without replacement, <m>${se(30).toFixed(2)} \times ${fpc(30).toFixed(3)} = ${(se(30) * fpc(30)).toFixed(2)}</m>.`,
        String.raw`Normal model: <m>z = (50 - ${MU.toFixed(2)}) \div ${se(30).toFixed(2)} = ${z50.toFixed(2)}</m>, and <x>=1-NORM.DIST(50,39.38,18.38,TRUE)</x> gives ${normOver50.toFixed(3)}. With the corrected standard error, ${normOver50fpc.toFixed(3)}.`,
        `Simulation: in 100,000 random samples of 30 (with replacement), ${pc(simOver50)} averaged more than $50. Drawing without replacement changes little: then 30 ÷ 231 = ${pc(30 / N)} of samples contain the office order, and ${pc(simOver50nr)} of 100,000 such samples averaged more than $50.`,
        String.raw`The gap: a sample averages over $50 almost only when it contains the $1,512 office order, which adds about <m>1{,}512 \div 30 \approx 50</m> dollars. The chance of drawing it in 30 draws is <m>1 - (230 \div 231)^{30} = ${pOffice30.toFixed(3)}</m>. Samples without it average about $33, and very few of them reach $50.`,
      ],
      answer: `The normal model says about ${pc(normOver50, 0)} (${pc(normOver50fpc, 0)} with the correction); the simulation says about ${pc(simOver50, 0)}, almost all of it the ${pc(pOffice30, 1)} of samples that include the office order.`,
      interpretation: 'The normal model more than doubles the true chance, because with one extreme value in the population the sampling distribution of a mean of 30 is still lumpy and skewed. The standard error is right; the bell shape isn’t yet. For populations like this, simulate, or use far larger samples.' },
    { level: 'applied', title: 'Is a month’s average order value a signal or noise?', fictional: true,
      setup: `B01 reported Lantern’s average order value (AOV) month by month: ${MONTH_ORDERS.slice(0, 4).map((n, i) => `${['July', 'August', 'September', 'October'][i]} ${usd(AOV[i])} on ${n} orders`).join(', ')}, then ${usd(AOV[4])} in November. Treat each month’s orders as a sample from Ana’s ordinary business, and assume ordinary orders vary as the spring’s did without the office order (standard deviation ${usd(SIG_ORD)}). How much would a month’s AOV move by chance alone?`,
      steps: [
        String.raw`Standard error of a month’s AOV: <m>${SIG_ORD.toFixed(2)} \div \sqrt{${MONTH_ORDERS[1]}} = ${seMonth[1].toFixed(2)}</m> dollars for August; the four months give ${seMonth.slice(0, 4).map((x) => usd(x)).join(', ')}. This standard deviation is a planning value: autumn orders average about $41, not $33, and if they vary in proportion (a standard deviation of about $${Math.round(sdScaled)}), every standard error is about a quarter larger. The conclusions below still hold.`,
        String.raw`About 300 orders is more than the 130 that Cochran’s rule asks for with the ordinary orders’ skewness, so the normal model is reasonable: chance alone would put about 95% of months within about 2 standard errors, <m>\pm 2 \times 1.5 \approx \pm 3</m> dollars, of the underlying average. July to October’s AOVs lie within $${(Math.max(...AOV.slice(0, 4)) - Math.min(...AOV.slice(0, 4))).toFixed(2)} of each other, around a combined ${usd(julOct)}: well inside chance variation.`,
        String.raw`November: the July–October level is itself a mean of ${julOctN.toLocaleString('en-US')} orders, with standard error <m>${SIG_ORD.toFixed(2)} \div \sqrt{${julOctN}} = ${seLevel.toFixed(2)}</m>, so the difference between November and that level has standard error <m>\sqrt{${seMonth[4].toFixed(2)}^2 + ${seLevel.toFixed(2)}^2} = ${seDiff.toFixed(2)}</m>. November sits <m>(${AOV[4].toFixed(2)} - ${julOct.toFixed(2)}) \div ${seDiff.toFixed(2)} = ${zNov.toFixed(1)}</m> standard errors above it (${zNovScaled.toFixed(1)} with the larger planning value). Chance alone very rarely does that; the likeliest cause is the gift boxes (${SHOP.giftBoxOrders[4]} gift-box orders in November against ${SHOP.giftBoxOrders[3]} in October, B01).`,
        String.raw`One order can do it too: a $1,512 office order in a month of about 300 orders adds about <m>(1{,}512 - 41) \div 300 \approx 4.90</m> dollars to that month’s AOV, more than chance variation, without any change in ordinary customers.`,
      ],
      answer: 'Month-to-month moves of under a dollar between July and October are noise; November’s rise of $6.50 is about four standard errors, far more than chance usually produces.',
      interpretation: 'The standard error is the yardstick for “is this change worth explaining?”. Before treating a dip as news, compare it with σ ÷ √n; before treating a jump as a trend, check whether one large order caused it. Module 3 turns this comparison into a formal test.' },
  ],

  demo: [
    { widget: 'sd-orders', intro: 'The 231 spring orders as the population. Draw 1,000 samples at each size and compare the histogram of the means with the dashed normal curve. At n = 30 look for the second hump made by samples that include the $1,512 order; compare the SD of the means with σ ÷ √n.' },
    { widget: 'sd-ordinary', intro: 'The same, with the office order removed (230 orders). Find the sample size at which the means already look normal, and compare it with the full population.' },
    { widget: 'sd-subs', intro: 'Subscription orders as a 0/1 population (p = 45.0%). Draw sample proportions at each size: the spread shrinks with √n and the shape becomes normal quickly, because this population isn’t skewed.' },
    { widget: 'sd-se', intro: 'The standard error and the finite population correction. Change σ, n and N: see how the standard error falls with √n, and how the correction matters only when n is a large share of N.' },
  ],

  mistakes: [
    { title: '“The standard error is the standard deviation of the data.”', html: 'The standard deviation (σ or s) measures how far individual orders vary, $100.68 here. The standard error, σ ÷ √n, measures how far sample <i>means</i> vary: $18.38 for samples of 30. It shrinks as n grows; the standard deviation doesn’t.' },
    { title: '“With n ≥ 30 the sample mean is always normal.”', html: '30 is a rule of thumb for populations that are not badly skewed. Lantern’s orders, with one extreme value, need far more: at n = 30 the sampling distribution still has a second hump. Check the skewness (Cochran’s rule) or simulate.' },
    { title: '“The central limit theorem makes the data normal.”', html: 'The theorem is about the distribution of the <i>sample mean</i>. A sample of 1,000 orders is still right-skewed; it is the means of many such samples that would be close to normal.' },
    { title: '“A bigger sample fixes a biased survey.”', html: 'A larger sample shrinks sampling error only. If the frame leaves people out, or the people who reply differ from those who don’t, a sample of 10,000 is as biased as one of 100, just more confidently.' },
    { title: '“Twice the sample, half the error.”', html: 'The standard error falls with √n: doubling n divides it by 1.41. Halving it takes four times the sample.' },
  ],

  application: [
    { p: 'Every estimate a business makes from part of its data, a customer satisfaction score, an average basket from last week, a defect rate from a batch, has a sampling distribution behind it. Analysts who know its standard error can say whether this month’s change is larger than the usual wobble. Without it, every dip gets a story and every spike a meeting.' },
    { p: 'Auditors sample invoices, quality teams sample products, and market researchers sample customers, and all of them choose a design before a sample size. Stratifying by a variable that matters (region, product line, customer type) guarantees coverage and usually buys precision; clustering saves cost and loses some. Systematic samples are convenient from a sorted list but can resonate with a cycle in it. The sample size then comes from the standard error, which the next lesson turns into a margin of error.' },
    { case: `Ana adds a line to her monthly dashboard notes: “A month of about 300 orders has a standard error of about $1.50 on its AOV (a little more if autumn orders vary more than spring’s), so moves within about $3 of the usual level are not worth explaining. One office order can move a month’s AOV by about $5: check the largest orders before reading anything into a jump.”` },
    { p: 'The limits are the ones this lesson has stressed. The standard error assumes random sampling; it says nothing about bias in who was sampled or who replied. And the normal model for a mean needs a sample that is large for the population’s skewness. With a few extreme values in the data, as in Lantern’s orders, check by simulation before trusting a normal probability.' },
  ],

  summary: [
    'A parameter (μ, σ, p) describes a population and is fixed; a statistic (x̄, s, p̂) describes a sample and varies from sample to sample. The distribution of a statistic over all possible samples is its sampling distribution.',
    'The sample mean’s sampling distribution is centred on μ with standard error σ ÷ √n; a proportion’s is centred on p with standard error √(p(1 − p) ÷ n). Four times the sample halves the standard error.',
    'Drawing without replacement more than about 5% of a population, multiply the standard error by √((N − n) ÷ (N − 1)).',
    'The central limit theorem: the sample mean is close to normal for large n, whatever the population. How large depends on skewness: 30 often suffices, but Lantern’s orders would need thousands (Cochran’s rule, n > 25 × skewness²).',
    'With a normal sampling distribution, z = (x̄ − μ) ÷ (σ ÷ √n) and NORM.DIST give probabilities for a sample mean; when the population has extreme values, simulate instead.',
    'Simple random, systematic, stratified and cluster samples trade cost against precision and coverage; stratifying on a variable that matters improves precision.',
    'Standard errors measure sampling error only. Frame, non-response and measurement biases don’t shrink with sample size.',
  ],

  glossary: [
    { term: 'Sampling distribution', def: 'The distribution of a statistic, such as a sample mean or proportion, over all the samples of a given size that could be drawn from a population.' },
    { term: 'Standard error', def: 'The standard deviation of a statistic’s sampling distribution: how far the statistic typically lies from the parameter it estimates. For a sample mean it is σ ÷ √n, estimated by s ÷ √n.' },
    { term: 'Central limit theorem', def: 'The result that the sampling distribution of the mean of n independent values gets closer to a normal distribution, with mean μ and standard deviation σ ÷ √n, as n grows, whatever the shape of the population (provided its standard deviation is finite).' },
    { term: 'Finite population correction', def: 'The factor √((N − n) ÷ (N − 1)) that reduces a standard error when a sample is drawn without replacement and is a large share of the population, usually applied above about 5%.' },
    { term: 'Systematic sample', def: 'A sample taken by choosing a random starting point in an ordered list and then every kth member after it.' },
    { term: 'Stratified sample', def: 'A sample drawn by dividing the population into groups (strata), such as regions, and drawing a random sample within each, usually in proportion to the group’s size.' },
    { term: 'Cluster sample', def: 'A sample drawn by dividing the population into groups (clusters), such as days or branches, choosing some clusters at random and including every member of each chosen cluster.' },
  ],

  references: [
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Business Statistics 2e</i>, chapter 7 “The Central Limit Theorem”, with section 7.4 “Finite Population Correction Factor”. OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/7-4-finite-population-correction-factor', checked: '2026-10-24' },
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. <i>Introductory Business Statistics</i>, section 7.1 “The Central Limit Theorem for Sample Means”. OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics/pages/7-1-the-central-limit-theorem-for-sample-means', checked: '2026-10-24' },
    { text: 'OpenStax <i>Introductory Business Statistics</i>, section 1.2 “Data, Sampling, and Variation in Data and Sampling”, on Statistics LibreTexts.', url: 'https://stats.libretexts.org/Bookshelves/Applied_Statistics/Business_Statistics_(OpenStax)/01%3A_Sampling_and_Data/1.02%3A_Data_Sampling_and_Variation_in_Data_and_Sampling', checked: '2026-10-24' },
    { text: 'Kott, P. S. &amp; Levine, B. (2024). “Exploring a skewness conjecture: Expanding Cochran’s rule to a proportion estimated from a complex sample”. <i>Survey Methodology</i> 50(2), 543–551. Statistics Canada.', url: 'https://www150.statcan.gc.ca/n1/pub/12-001-x/2024002/article/00001-eng.htm', checked: '2026-10-24' },
    { text: 'NIST/SEMATECH. <i>e-Handbook of Statistical Methods</i>, section 1.3.6.6.1, “Normal Distribution” (the central limit theorem as the basis for the normal model of a mean).', url: 'https://itl.nist.gov/div898/handbook/eda/section3/eda3661.htm', checked: '2026-10-24' },
    { text: 'Microsoft Support. “RAND function”, with the page for SKEW.P (the skewness of a whole population).', url: 'https://support.microsoft.com/excel/functions/rand-function', checked: '2026-10-24' },
  ],

  checks: [
    // population
    { what: 'Population size', value: N, shown: 231 },
    { what: 'μ', value: MU, shown: 39.38 },
    { what: 'σ (STDEV.P)', value: SIGMA, shown: 100.68 },
    { what: 'SE n = 30', value: se(30), shown: 18.38 },
    { what: 'SE n = 120', value: se(120), shown: 9.19 },
    { what: 'Quadruple halves', value: se(30) / se(120), shown: 2, tol: 1e-9 },
    { what: 'Office order z (14.6)', value: D.orders.bulkZ, shown: 14.6, tol: 0.05 },
    { what: 'Office order value', value: BULK, shown: 1512 },
    { what: 'P(office in 30 draws) %', value: pOffice30 * 100, shown: 12, tol: 0.5 },
    { what: 'P(office in 30 draws)', value: pOffice30, shown: 0.122, tol: 0.0005 },
    { what: 'P(office) 1 dp', value: pOffice30 * 100, shown: 12.2, tol: 0.05 },
    { what: 'Office adds about $50', value: BULK / 30, shown: 50, tol: 0.5 },
    { what: 'Ordinary mean about $33', value: mean(ORDINARY), shown: 33, tol: 0.05 },
    { what: 'Only the office order is above $200 (figure)', value: ORDER_VALUES.filter((x) => x >= 200).length, shown: 1 },
    { what: 'Subscriptions', value: D.orders.subscriptions, shown: 104 },
    { what: 'p', value: P, shown: 0.450, tol: 0.0005 },
    { what: '1 − p', value: 1 - P, shown: 0.550, tol: 0.0005 },
    { what: 'SE p̂ n = 50', value: SEP50, shown: 0.0704, tol: 0.00005 },
    { what: 'About 7 points', value: SEP50 * 100, shown: 7, tol: 0.05 },
    { what: 'p as 45.0%', value: P * 100, shown: 45.0, tol: 0.05 },
    // theory
    { what: 'Share sampled 30/231 %', value: 30 / N * 100, shown: 13, tol: 0.5 },
    { what: 'N − n', value: N - 30, shown: 201 },
    { what: 'N − 1', value: N - 1, shown: 230 },
    { what: 'FPC', value: fpc(30), shown: 0.935, tol: 0.0005 },
    { what: 'SE with FPC', value: se(30) * fpc(30), shown: 17.18 },
    { what: 'Skewness', value: G1, shown: 13.66 },
    { what: 'Cochran n (SKEW.P)', value: cochran, shown: 4607, tol: 0.5 },
    { what: 'SKEW.P', value: G1p, shown: 13.57 },
    { what: 'SKEW.P without office', value: G1op, shown: 2.28 },
    { what: 'SKEW.P matches Microsoft’s example', value: skewP([3, 4, 5, 2, 3, 4, 5, 6, 4, 7]), shown: 0.303193, tol: 0.0000005 },
    { what: 'Skewness without office', value: G1o, shown: 2.29 },
    { what: 'Cochran n without (SKEW.P)', value: cochranO, shown: 130, tol: 0.5 },
    { what: 'Ordinary means of 30: t-interval coverage (simulated) %', value: COVER_ORD30 * 100, shown: 92, tol: 0.5 },
    { what: 'z for p̂ = 0.30', value: zP30, shown: -2.13, tol: 0.005 },
    { what: 'NORM.S.DIST(−2.13) %', value: I.normCdf(-2.13) * 100, shown: 1.7, tol: 0.05 },
    { what: 'Exact binomial P(X ≤ 15) %', value: binom15 * 100, shown: 2.2, tol: 0.05 },
    { what: 'Once in 46', value: 1 / binom15, shown: 46, tol: 0.5 },
    { what: 'NORM.S.DIST(−2.13) close to the exact z', value: I.normCdf(-2.13), shown: I.normCdf(zP30), tol: 0.0005 },
    { what: 'East subscription share %', value: SUBSHARE[2] * 100, shown: 75, tol: 0.5 },
    { what: 'North subscription share %', value: SUBSHARE[0] * 100, shown: 33, tol: 0.5 },
    { what: 'North orders', value: REG_N[0], shown: 58 },
    { what: 'North quota', value: quota[0], shown: 10.04 },
    { what: 'Allocation North', value: ALLOC[0], shown: 10 },
    { what: 'Allocation South', value: ALLOC[1], shown: 8 },
    { what: 'Allocation East', value: ALLOC[2], shown: 9 },
    { what: 'Allocation West', value: ALLOC[3], shown: 9 },
    { what: 'Allocation Central', value: ALLOC[4], shown: 4 },
    { what: 'Allocation adds to 40', value: ALLOC.reduce((a, b) => a + b, 0), shown: 40 },
    { what: 'Systematic sample from start 1', value: Math.floor((N - 1) / 6) + 1, shown: 39 },
    { what: 'Systematic sample from start 6', value: Math.floor((N - 6) / 6) + 1, shown: 38 },
    { what: 'A month of about 300 orders exceeds Cochran’s 130', value: Number(Math.min(...MONTH_ORDERS.slice(0, 4)) > cochranO), shown: 1 },
    { what: 'Survey invited', value: SURVEY.sent, shown: 240 },
    { what: 'Survey replies', value: SURVEY.responses, shown: 79 },
    { what: 'Response rate %', value: SURVEY.responses / SURVEY.sent * 100, shown: 32.9, tol: 0.05 },
    { what: 'Would recommend', value: SURVEY.wouldRecommend.yes, shown: 61 },
    // simple example
    { what: 'Tiny μ', value: muT, shown: 24 },
    { what: 'Tiny σ²', value: sigT ** 2, shown: 126, tol: 1e-9 },
    { what: 'Tiny σ', value: sigT, shown: 11.22 },
    { what: 'Sum of squares 144+36+0+324', value: TINY.reduce((s, x) => s + (x - muT) ** 2, 0), shown: 504 },
    { what: 'Sum of 16 means', value: TINY_MEANS.reduce((a, b) => a + b, 0), shown: 384 },
    { what: 'Mean of means', value: mean(TINY_MEANS), shown: 24, tol: 1e-9 },
    { what: 'SD of means', value: sd(TINY_MEANS, 0), shown: 7.94 },
    { what: 'σ/√2', value: sigT / Math.SQRT2, shown: 7.94 },
    { what: 'One sample of 16 averages $42', value: TINY_MEANS.filter((x) => x === 42).length, shown: 1 },
    { what: 'One sample of 16 averages $12', value: TINY_MEANS.filter((x) => x === 12).length, shown: 1 },
    // challenging example
    { what: 'z for $50', value: z50, shown: 0.58, tol: 0.005 },
    { what: 'Normal P(x̄ > 50)', value: normOver50, shown: 0.282, tol: 0.0005 },
    { what: 'Normal P with FPC', value: normOver50fpc, shown: 0.268, tol: 0.0005 },
    { what: 'Normal % rounded', value: normOver50 * 100, shown: 28, tol: 0.5 },
    { what: 'Normal with FPC % rounded', value: normOver50fpc * 100, shown: 27, tol: 0.5 },
    { what: 'Simulated P(x̄ > 50) %', value: simOver50 * 100, shown: 12.3, tol: 0.05 },
    { what: 'Simulated rounded', value: simOver50 * 100, shown: 12, tol: 0.5 },
    { what: 'More than doubles', value: normOver50 / simOver50, shown: 2.3, tol: 0.05 },
    { what: 'NORM.DIST with rounded inputs', value: 1 - I.normal.cdf(50, 39.38, 18.38), shown: normOver50, tol: 0.0005 },
    { what: 'Simulation agrees with theory: mean of means', value: mean(SIM), shown: MU, tol: 0.1 },
    { what: 'Simulation agrees with theory: SD of means', value: sd(SIM), shown: se(30), tol: 0.1 },
    { what: 'Bags SD', value: D.kg.sd, shown: 2.66 },
    { what: 'Bags SE', value: D.kg.ci.se, shown: 0.42 },
    { what: 'Bags SE = s/√40', value: D.kg.sd / Math.sqrt(40), shown: D.kg.ci.se, tol: 1e-12 },
    { what: 'Two standard errors about 1 g', value: 2 * D.kg.ci.se, shown: 1, tol: 0.2 },
    { what: 'Expected subscriptions in 50', value: 50 * 0.45, shown: 22.5 },
    { what: 'Expected one-off in 50', value: 50 * 0.55, shown: 27.5 },
    { what: 'Expected subscriptions in 10', value: 10 * 0.45, shown: 4.5 },
    { what: 'Possible values of p̂ for n = 10', value: 11, shown: 10 + 1 },
    // applied example
    { what: 'Jul orders', value: MONTH_ORDERS[0], shown: 294 },
    { what: 'Aug orders', value: MONTH_ORDERS[1], shown: 316 },
    { what: 'Sep orders', value: MONTH_ORDERS[2], shown: 251 },
    { what: 'Oct orders', value: MONTH_ORDERS[3], shown: 319 },
    { what: 'Planning SD (spring without office order)', value: SIG_ORD, shown: 26.73 },
    { what: 'SE Aug', value: seMonth[1], shown: 1.50 },
    { what: 'SE Jul', value: seMonth[0], shown: 1.56 },
    { what: 'SE Sep', value: seMonth[2], shown: 1.69 },
    { what: 'SE Oct', value: seMonth[3], shown: 1.50 },
    { what: 'About $1.50', value: seMonth[1], shown: 1.5, tol: 0.05 },
    { what: '2 × 1.5', value: 2 * 1.5, shown: 3 },
    { what: 'Jul–Oct spread of AOV', value: Math.max(...AOV.slice(0, 4)) - Math.min(...AOV.slice(0, 4)), shown: 1.30 },
    { what: 'Jul–Oct combined AOV', value: julOct, shown: 41.40 },
    { what: 'Nov AOV', value: AOV[4], shown: 47.90 },
    { what: 'Nov SE', value: seMonth[4], shown: 1.28 },
    { what: 'July–October orders', value: julOctN, shown: 1180 },
    { what: 'SE of the July–October level', value: seLevel, shown: 0.78 },
    { what: 'SE of the difference', value: seDiff, shown: 1.50 },
    { what: 'Nov z', value: zNov, shown: 4.3, tol: 0.05 },
    { what: 'About four SEs', value: zNov, shown: 4, tol: 0.5 },
    { what: 'Nov z with CV-scaled SD', value: zNovScaled, shown: 3.5, tol: 0.05 },
    { what: 'Autumn orders about $41', value: julOct, shown: 41, tol: 0.5 },
    { what: 'Spring ordinary mean about $33', value: mean(ORDINARY), shown: 33, tol: 0.05 },
    { what: 'CV-scaled SD about $34', value: sdScaled, shown: 34, tol: 0.5 },
    { what: 'A quarter larger', value: sdScaled / SIG_ORD, shown: 1.25, tol: 0.01 },
    { what: 'Gift boxes Nov', value: SHOP.giftBoxOrders[4], shown: 88 },
    { what: 'Gift boxes Oct', value: SHOP.giftBoxOrders[3], shown: 9 },
    { what: 'Share of samples with the office order, without replacement %', value: 30 / N * 100, shown: 13.0, tol: 0.05 },
    { what: 'Simulated P(x̄ > 50) without replacement %', value: simOver50nr * 100, shown: 13.1, tol: 0.05 },
    { what: 'Nov rise', value: AOV[4] - julOct, shown: 6.50 },
    { what: 'Office order effect on a month of 300', value: (1512 - 41) / 300, shown: 4.90 },
    { what: 'About $5', value: (1512 - 41) / 300, shown: 5, tol: 0.15 },
    { what: 'A month of about 300 orders', value: mean(MONTH_ORDERS.slice(0, 4)), shown: 300, tol: 5 },
  ],
};
