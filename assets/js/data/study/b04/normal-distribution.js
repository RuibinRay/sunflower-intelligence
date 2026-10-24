// normal-distribution.js — B04 · The normal distribution. Content only; exercises are in normal-distribution.ex.js.
// Uses Kilnworth's specification for its 1 kg bags (KILNWORTH_1KG) and Ana's 40 weighed bags (KG_BAGS; DERIVED.kg),
// the spring order values (ORDER_VALUES; DERIVED.orders) as the case where a normal model fails, and the subscription
// share (DERIVED.orders.subscriptionShare) for the normal approximation to the binomial. The test of whether the
// machine runs below its setting is Module 3's; this lesson stops at the model. Every figure printed is recomputed in
// `checks`. Redfern Bakery and the weekly-demand figures in the application are fictional.
import { KILNWORTH_1KG as K, KG_BAGS, ORDER_VALUES, DERIVED as D } from './case.js?v=12';
import * as I from '../../../core/inference.js?v=12';
import { mean, sd, median, skewness, kurtosis } from '../../../core/stats.js?v=12';

// ---------------------------------------------------------------- the figures the lesson quotes
const zLabel = (K.label - K.setting) / K.sd;                         // −1.333
const pUnder = I.normal.cdf(K.label, K.setting, K.sd);               // 0.0912
const pOver1010 = I.normal.sf(1010, K.setting, K.sd);
const pMid = I.normal.cdf(1008, K.setting, K.sd) - I.normal.cdf(1000, K.setting, K.sd);
const pOutside = I.normal.cdf(998, K.setting, K.sd) + I.normal.sf(1010, K.setting, K.sd);
const z99 = I.normInv(0.99);
const setting1 = K.label + z99 * K.sd;                               // 1,006.98 g
const sdFor1 = (K.setting - K.label) / z99;                          // 1.72 g
const heavy5 = I.normal.inv(0.95, K.setting, K.sd);
const dens = I.normal.pdf(K.setting, K.setting, K.sd);
const win1g = I.normal.cdf(K.setting + 0.5, K.setting, K.sd) - I.normal.cdf(K.setting - 0.5, K.setting, K.sd);
const n40 = KG_BAGS.length, m40 = mean(KG_BAGS), s40 = sd(KG_BAGS), med40 = median(KG_BAGS);
const within = (xs, m, s, k) => xs.filter((x) => Math.abs(x - m) < k * s).length;
const w1 = within(KG_BAGS, m40, s40, 1), w2 = within(KG_BAGS, m40, s40, 2), w3 = within(KG_BAGS, m40, s40, 3);
const expUnder = n40 * pUnder, pFiveOrMore = I.binomSf(4, n40, pUnder);
const pUnderSample = I.normal.cdf(K.label, m40, s40);
const O = D.orders, oW1 = within(ORDER_VALUES, O.mean, O.sd, 1), pNeg = I.normal.cdf(0, O.mean, O.sd);
const pSub = O.subscriptionShare, nB = 100, muB = nB * pSub, sdB = Math.sqrt(nB * pSub * (1 - pSub));
const exact40 = I.binomCdf(40, nB, pSub), cc40 = I.normal.cdf(40.5, muB, sdB), nocc40 = I.normal.cdf(40, muB, sdB);
const cc40typed = I.normal.cdf(40.5, 45.02, 4.975), nocc40typed = I.normal.cdf(40, 45.02, 4.975);   // as typed with rounded inputs
const DEMAND = { mean: 40, sd: 8 }, z95 = I.normInv(0.95), reorder = DEMAND.mean + z95 * DEMAND.sd;   // fictional
const giveaway = setting1 - K.setting;

// ---------------------------------------------------------------- formatting
const f1 = (x) => Math.round(x * 10) / 10;
const g = (v, d = 0) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`;

// ---------------------------------------------------------------- figures
/** N(1004, 3) with the area below the 1,000 g label shaded, a grams axis and a z axis. */
function curveFigure() {
  const L = 50, R = 610, T = 24, B = 176, lo = 992, hi = 1016;
  const x = (v) => L + ((v - lo) / (hi - lo)) * (R - L), y = (d) => B - (d / dens) * (B - T - 16);
  const pts = []; for (let v = lo; v <= hi + 1e-9; v += 0.1) pts.push(`${f1(x(v))},${f1(y(I.normal.pdf(v, K.setting, K.sd)))}`);
  const shade = [`${f1(x(lo))},${B}`]; for (let v = lo; v <= K.label + 1e-9; v += 0.1) shade.push(`${f1(x(v))},${f1(y(I.normal.pdf(v, K.setting, K.sd)))}`); shade.push(`${f1(x(K.label))},${B}`);
  let s = '<svg viewBox="0 0 660 262" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">';
  s += `<polygon points="${shade.join(' ')}" fill="var(--series-2)" opacity="0.35"/>`;
  s += `<polyline points="${pts.join(' ')}" fill="none" stroke="var(--series-1)" stroke-width="2.4"/>`;
  s += `<line x1="${L}" x2="${R}" y1="${B}" y2="${B}" stroke="var(--ink)" stroke-width="1.2"/>`;
  for (let k = -4; k <= 4; k++) {
    const v = K.setting + k * K.sd, xv = f1(x(v));
    s += `<line x1="${xv}" x2="${xv}" y1="${B}" y2="${B + 6}" stroke="var(--ink)" stroke-width="1.2"/>`;
    s += `<text x="${xv}" y="${B + 20}" text-anchor="middle" font-size="11">${g(v)}</text>`;
    s += `<text x="${xv}" y="${B + 50}" text-anchor="middle" font-size="11" fill="var(--ink-3)">${k < 0 ? '−' : ''}${Math.abs(k)}</text>`;
  }
  s += `<line x1="${L}" x2="${R}" y1="${B + 36}" y2="${B + 36}" stroke="var(--rule-strong)" stroke-width="1"/>`;
  s += `<text x="${R + 30}" y="${B + 20}" font-size="11">g</text><text x="${R + 30}" y="${B + 50}" font-size="11" fill="var(--ink-3)">z</text>`;
  s += `<line x1="${f1(x(K.label))}" x2="${f1(x(K.label))}" y1="${T + 10}" y2="${B + 36}" stroke="var(--ink)" stroke-width="1.2" stroke-dasharray="4 3"/>`;
  s += `<text x="${f1(x(K.label)) - 6}" y="${T + 20}" text-anchor="end" font-size="11">label 1,000 g, z = −1.33</text>`;
  s += `<text x="${f1(x(998.6))}" y="${B - 6}" text-anchor="middle" font-size="11">${pc(pUnder)}</text>`;
  s += `<text x="${f1(x(K.setting))}" y="${T + 4}" text-anchor="middle" font-size="11" fill="var(--ink-3)">setting 1,004 g</text>`;
  s += `<text x="330" y="${B + 72}" text-anchor="middle" font-size="11" fill="var(--ink-3)">Bag weight (g) and its z-score, (weight − 1,004) ÷ 3</text>`;
  return `${s}</svg>`;
}
/** Normal probability plots: the 40 bags (straight) and the 231 orders (curved). */
function probPlotFigure() {
  const panel = (vals, ox, title, ymin, ymax, yticks, yfmt) => {
    const n = vals.length, srt = [...vals].sort((a, b) => a - b), m = mean(vals), s0 = sd(vals);
    const W = 270, H = 200, L = ox + 46, R = ox + 46 + W - 56, T = 34, B = T + H - 40;
    const x = (z) => L + ((z + 3) / 6) * (R - L), y = (v) => B - ((v - ymin) / (ymax - ymin)) * (B - T);
    let p = `<text x="${(L + R) / 2}" y="16" text-anchor="middle" font-size="12">${title}</text>`;
    yticks.forEach((t) => { p += `<line x1="${L}" x2="${R}" y1="${f1(y(t))}" y2="${f1(y(t))}" stroke="var(--rule-strong)" stroke-width="0.5" stroke-dasharray="3 3"/><text x="${L - 5}" y="${f1(y(t)) + 4}" text-anchor="end" font-size="10" fill="var(--ink-3)">${yfmt(t)}</text>`; });
    [-2, 0, 2].forEach((t) => { p += `<text x="${f1(x(t))}" y="${B + 15}" text-anchor="middle" font-size="10" fill="var(--ink-3)">${t < 0 ? '−' : ''}${Math.abs(t)}</text>`; });
    p += `<line x1="${L}" x2="${R}" y1="${B}" y2="${B}" stroke="var(--ink)" stroke-width="1"/><line x1="${L}" x2="${L}" y1="${T}" y2="${B}" stroke="var(--ink)" stroke-width="1"/>`;
    const za = -2.9, zb = 2.9, ya = Math.max(ymin, m + za * s0), yb = Math.min(ymax, m + zb * s0);
    const zA = (ya - m) / s0, zB = (yb - m) / s0;
    p += `<line x1="${f1(x(zA))}" y1="${f1(y(ya))}" x2="${f1(x(zB))}" y2="${f1(y(yb))}" stroke="var(--series-1)" stroke-width="1.8"/>`;
    srt.forEach((v, i) => { const z = I.normInv((i + 0.5) / n); p += `<circle cx="${f1(x(z))}" cy="${f1(y(v))}" r="2.4" fill="var(--ink)" opacity="0.7"/>`; });
    p += `<text x="${(L + R) / 2}" y="${B + 30}" text-anchor="middle" font-size="10" fill="var(--ink-3)">normal score, NORM.S.INV((i − 0.5) ÷ n)</text>`;
    return p;
  };
  let s = '<svg viewBox="0 0 600 236" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">';
  s += panel(KG_BAGS, 0, 'Ana’s 40 bags (g)', 996, 1010, [998, 1002, 1006, 1010], (t) => g(t));
  s += panel(ORDER_VALUES, 300, 'The 231 spring orders ($)', -300, 1600, [0, 500, 1000, 1500], (t) => `$${g(t)}`);
  return `${s}</svg>`;
}

export default {
  slug: 'normal-distribution',
  title: 'The normal distribution',
  blurb: 'Model a measurement with the normal curve: turn values into z-scores, find the share of bags under a label weight and the machine setting that keeps it below 1%, with NORM.DIST and NORM.INV and by hand. Then check whether the model fits, and see where it fails.',
  status: 'draft',
  objectives: [
    'Explain how a probability density curve gives probabilities as areas, and why the probability of one exact value of a continuous variable is 0.',
    'Calculate z-scores and normal probabilities below, above, between and outside given values, by hand from z and with NORM.DIST, NORM.S.DIST and STANDARDIZE.',
    'Find the value that cuts off a given probability with NORM.INV and NORM.S.INV, and use it to set a target such as a machine setting or a stock level.',
    'Assess whether a normal model is reasonable for a dataset with a histogram, the mean and median, the empirical-rule counts, SKEW and KURT, and a normal probability plot.',
    'Recognise data, such as right-skewed order values, for which a normal model gives wrong answers.',
    'Use the normal approximation to the binomial with a continuity correction, and state when it is adequate.',
  ],
  prerequisites: [
    { lesson: 'b04/describing-distributions', why: 'Population notation (μ, σ), z-scores as positions and the empirical rule are introduced there.' },
    { lesson: 'b04/discrete-distributions', why: 'The binomial distribution, BINOM.DIST and the idea of a probability distribution come first there.' },
    { lesson: 'b02/scaling', why: 'Standardising a value, (x − mean) ÷ SD, is the same step that turns any normal distribution into the standard one.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Lantern buys its 1 kg bags of House Blend from Kilnworth Roasting. Kilnworth’s specification says its filling machine is set to 1,004 g with a standard deviation of 3 g, so that few bags fall below the 1,000 g printed on the label. In October Ana weighed 40 bags on the shop’s scale: their mean was 1,002.75 g, and five weighed less than 1,000 g. She has two questions: if the machine runs as specified, what share of bags should be under the label, and what would the setting have to be for almost none of them to be?' },

    { h: 'From bars to a curve' },
    { p: 'A bag’s weight is a <g>continuous variable</g>: it can be 1,002.7 g, or 1,002.71 g, or anything in between. Asking how many bags weigh exactly 1,002.7 g makes little sense, because with a fine enough scale no two bags weigh the same. The sensible question is what share of bags falls in an interval, such as under 1,000 g. A histogram answers it for the bags you have: each bar’s area is the share of bags in that bin.' },
    { p: 'Now imagine weighing tens of thousands of bags and narrowing the bins. The bars’ tops smooth into a curve, and the curve describes the machine rather than one batch. Such a curve is a <g>probability density function</g>: the area under it between two weights is the probability that a bag falls between them, and the total area under it is 1. Its height is not a probability. A single exact weight has no width, so it has probability 0, and for a continuous variable “under 1,000 g” and “at most 1,000 g” are the same event.' },

    { h: 'The normal curve' },
    { p: String.raw`The <g>normal distribution</g> is the bell-shaped density curve that Kilnworth’s specification assumes. It is symmetric about its mean <m>\mu</m>, which is also its median and mode, and its standard deviation <m>\sigma</m> sets how wide it is. One normal distribution is fixed by those two numbers, written <m>X \sim N(\mu, \sigma)</m>: Kilnworth’s bags are <m>N(1{,}004, 3)</m>. Some books put the variance <m>\sigma^2</m> second instead of <m>\sigma</m>, so check which convention a source uses.` },
    { p: 'Fill weights from a machine running steadily are a classic case for this model: each bag misses the setting by a small amount, as often over as under, with large misses rare. For any normal distribution the <g>empirical rule</g> holds: about 68% of values lie within one standard deviation of the mean, 95% within two and 99.7% within three. For Kilnworth’s bags those bands are 1,001 to 1,007 g, 998 to 1,010 g and 995 to 1,013 g.' },
    { figure: {
      svg: curveFigure(),
      caption: `Kilnworth’s specification as a normal curve, N(1,004, 3). The shaded area to the left of the 1,000 g label, ${pc(pUnder)} of the total, is the share of bags that would weigh less than the label. Each gram value on the upper axis has its z-score beneath it.`,
      alt: `A bell-shaped curve centred on 1,004 g, drawn over a horizontal axis from 992 to 1,016 g with tick marks every 3 g at 992, 995, 998, 1,001, 1,004, 1,007, 1,010, 1,013 and 1,016. A second axis beneath gives the z-scores −4 to 4 for the same ticks. A dashed vertical line at 1,000 g is labelled “label 1,000 g, z = −1.33”. The area under the curve to the left of that line is shaded and labelled ${pc(pUnder)}.`,
    } },

    { h: 'How many bags fall short?' },
    { p: String.raw`To find the shaded area, first measure how far the label is from the setting in standard deviations: the <g>z-score</g> <m>z = (1{,}000 - 1{,}004) \div 3 = -1.33</m>. Re-expressed this way, every normal distribution becomes the same one, the <g>standard normal distribution</g> with mean 0 and standard deviation 1. So one table, or one Excel function, answers questions about bags, loaves or bottles alike.` },
    { p: `In Excel, <x>=NORM.DIST(1000,1004,3,TRUE)</x> returns ${pUnder.toFixed(4)}, the area to the left of 1,000 g; <x>=NORM.S.DIST(-4/3,TRUE)</x> gives the same from the z-score. If the machine runs as specified, ${pc(pUnder)} of bags, about one in eleven, weigh less than the label says. That is a lot of short bags for a specification that sounds generous.` },

    { h: 'Working backwards: what setting?' },
    { p: String.raw`Ana would like no more than 1% of bags under the label. Now the probability is given and a weight is wanted. <x>=NORM.S.INV(0.99)</x> returns ${z99.toFixed(3)}: 99% of a standard normal distribution lies below 2.326. For only 1% of bags to fall short, the label must sit 2.326 standard deviations below the setting, so the setting must be <m>1{,}000 + 2.326 \times 3 = ${setting1.toFixed(2)}</m> g. In Excel that is <x>=1000+NORM.S.INV(0.99)*3</x>.` },
    { p: `Raising the setting to about 1,007 g puts almost 3 g more coffee in every bag. The other route is a steadier machine: at the 1,004 g setting, the standard deviation would have to fall from 3 g to ${sdFor1.toFixed(2)} g. The normal model turns “almost no short bags” into numbers that Kilnworth can price.` },

    { h: 'What Ana found' },
    { p: `Under the specification, ${pc(pUnder)} of 40 bags is ${expUnder.toFixed(1)} bags expected under 1,000 g; Ana found 5. That alone is not surprising: the binomial distribution with n = 40 and p = ${pUnder.toFixed(4)} gives about a ${Math.round(pFiveOrMore * 100)}% chance of five or more. Her sample’s mean, 1,002.75 g, is a better clue, 1.25 g below the setting. Whether a gap that size could be chance is the first question Module 3 answers. This lesson asks the question before it: is a normal model reasonable for these bags at all?` },
  ],

  theory: [
    { h: 'Density, area and probability' },
    { p: String.raw`A continuous <g>random variable</g> is described by a density curve <m>f(x)</m> that is never negative and encloses a total area of 1. The probability that the variable falls between a and b is the area under the curve from a to b. That is why <m>P(X = a) = 0</m> for any single value, and why <m>P(X < a)</m> and <m>P(X \le a)</m> are equal; for the counts of Module 1’s discrete distributions they are not.` },
    { p: String.raw`The height of the curve is a probability per unit of x. Kilnworth’s curve is ${dens.toFixed(3)} per gram high at 1,004 g, which is <x>=NORM.DIST(1004,1004,3,FALSE)</x>. Over a narrow window, height × width approximates the area: about <m>${dens.toFixed(3)} \times 1 = ${dens.toFixed(3)}</m> of bags weigh within half a gram of 1,004 g, against an exact ${win1g.toFixed(4)}. A height can exceed 1 when the curve is narrow enough, which a probability never can.` },

    { h: 'The normal family' },
    { list: [
      String.raw`<b>Two parameters.</b> Changing <m>\mu</m> slides the curve along the axis without changing its shape; changing <m>\sigma</m> stretches it wider and flatter or squeezes it narrower and taller, keeping the area at 1.`,
      String.raw`<b>Symmetry.</b> The mean, median and mode are all <m>\mu</m>, and the area below <m>\mu - d</m> equals the area above <m>\mu + d</m> for any distance <m>d</m>.`,
      String.raw`<b>Shape.</b> The curve changes curvature, at its points of inflection, at <m>\mu \pm \sigma</m>, one standard deviation either side of the mean. Its tails never reach zero height, but beyond four standard deviations they hold only ${(2 * I.normSf(4) * 100).toFixed(4)}% of the area.`,
      String.raw`<b>The empirical rule, exactly.</b> The areas within one, two and three standard deviations are ${pc(I.normCdf(1) - I.normCdf(-1), 2)}, ${pc(I.normCdf(2) - I.normCdf(-2), 2)} and ${pc(I.normCdf(3) - I.normCdf(-3), 2)}. Exactly 95% lies within 1.96 standard deviations, a number the next two lessons use constantly.`,
    ] },

    { h: 'The standard normal distribution and z' },
    { p: String.raw`If <m>X \sim N(\mu, \sigma)</m>, then <m>Z = (X - \mu) \div \sigma</m> follows <m>N(0, 1)</m>. Standardising keeps areas: the share of bags below 1,000 g is the share of the standard normal below <m>z = -1.33</m>. Going the other way, <m>x = \mu + z\sigma</m> turns a z back into the units of the data. B02 used the same z-score to rescale a column; here it locates a value on a known curve.` },
    { table: {
      caption: 'Standard normal values used often (NORM.S.INV gives each z from the area below it)',
      head: ['Area below z', 'z', 'In words'],
      align: ['r', 'r', 'l'],
      rows: [
        ['0.90', I.normInv(0.9).toFixed(3), 'The top 10% lies above it'],
        ['0.95', z95.toFixed(3), 'The top 5% lies above it'],
        ['0.975', I.normInv(0.975).toFixed(3), '2.5% in each tail beyond ±1.960: the middle 95%'],
        ['0.99', z99.toFixed(3), 'The top 1% lies above it'],
        ['0.995', I.normInv(0.995).toFixed(3), '0.5% in each tail beyond ±2.576: the middle 99%'],
      ],
    } },
    { p: String.raw`Symmetry halves the work: <m>P(Z > 1.33) = P(Z < -1.33)</m>, and <m>P(Z < -z) = 1 - P(Z < z)</m>. A printed z table lists areas for z to two decimals, so a hand calculation that rounds z to −1.33 gets 0.0918 rather than Excel’s ${pUnder.toFixed(4)}. Both are fine for a decision; quote Excel’s value when you have it.` },

    { h: 'Four kinds of question' },
    { p: 'Sketch the curve and shade the area the question asks for before you calculate. The shading tells you whether you need the area below a value, its complement, a difference of two areas, or two tails.' },
    { table: {
      caption: 'Kilnworth’s bags, N(1,004, 3): each kind of question and the Excel formula that answers it',
      head: ['Question', 'Area', 'Excel', 'Result'],
      align: ['l', 'l', 'l', 'r'],
      rows: [
        ['Under 1,000 g', 'Below a', '<x>=NORM.DIST(1000,1004,3,TRUE)</x>', pUnder.toFixed(4)],
        ['Over 1,010 g', 'Above a: 1 − below', '<x>=1-NORM.DIST(1010,1004,3,TRUE)</x>', pOver1010.toFixed(4)],
        ['Between 1,000 and 1,008 g', 'Below b − below a', '<x>=NORM.DIST(1008,1004,3,TRUE)-NORM.DIST(1000,1004,3,TRUE)</x>', pMid.toFixed(4)],
        ['Under 998 g or over 1,010 g', 'Two tails', '<x>=NORM.DIST(998,1004,3,TRUE)+1-NORM.DIST(1010,1004,3,TRUE)</x>', pOutside.toFixed(4)],
      ],
    } },

    { h: 'Cut-offs from probabilities' },
    { p: String.raw`NORM.INV(probability, mean, standard_dev) returns the value with that probability <i>below</i> it; Microsoft describes it as the x for which NORM.DIST(x, mean, standard_dev, TRUE) equals the probability. The heaviest 5% of Kilnworth’s bags weigh more than <x>=NORM.INV(0.95,1004,3)</x> = ${heavy5.toFixed(2)} g: to find an upper cut-off, give the area below it, 0.95, not 0.05. NORM.S.INV does the same for the standard normal, and <m>x = \mu + z\sigma</m> gets you back to grams.` },

    { h: 'Excel’s normal functions' },
    { table: {
      caption: 'The functions, as Microsoft documents them',
      head: ['Function', 'Returns', 'Example', 'Result'],
      align: ['l', 'l', 'l', 'r'],
      rows: [
        ['NORM.DIST(x, mean, standard_dev, cumulative)', 'TRUE: the area below x. FALSE: the height of the curve at x', '<x>=NORM.DIST(1000,1004,3,TRUE)</x>', pUnder.toFixed(4)],
        ['NORM.S.DIST(z, cumulative)', 'The same for the standard normal', '<x>=NORM.S.DIST(-1.333333,TRUE)</x>', I.normCdf(-1.333333).toFixed(4)],
        ['NORM.INV(probability, mean, standard_dev)', 'The value with that area below it', '<x>=NORM.INV(0.01,1004,3)</x>', I.normal.inv(0.01, K.setting, K.sd).toFixed(2)],
        ['NORM.S.INV(probability)', 'The z with that area below it', '<x>=NORM.S.INV(0.99)</x>', z99.toFixed(4)],
        ['STANDARDIZE(x, mean, standard_dev)', 'The z-score, (x − mean) ÷ standard_dev', '<x>=STANDARDIZE(1000,1004,3)</x>', zLabel.toFixed(4)],
      ],
    } },
    { p: 'Three details matter. A standard_dev of 0 or less returns #NUM!, and so does a probability of 0 or 1 or beyond in NORM.INV or NORM.S.INV. With cumulative set to FALSE, NORM.DIST and NORM.S.DIST return the curve’s height, not a probability; Microsoft’s NORM.S.DIST page calls this the “probability mass function”, a term for discrete distributions, but for the normal it is the density. And the older NORMDIST and NORMSDIST still work for backward compatibility: Microsoft has replaced them with NORM.DIST and NORM.S.DIST and says they may not be available in future versions.' },

    { h: 'Checking whether a normal model fits' },
    { p: `Kilnworth’s 9.1% assumes the weights follow a normal curve. Before relying on it, check Ana’s 40 bags four ways. None of these checks proves the data are normal; together they can show that they clearly are not.` },
    { ol: [
      'The histogram (the Explore widget of Ana’s 40 bag weights): one peak, roughly symmetric, no long tail and no gap.',
      `Mean and median: ${m40.toFixed(2)} g and ${med40.toFixed(2)} g, 0.2 g apart, as a symmetric distribution’s should be.`,
      `The empirical-rule counts: ${w1} of 40 bags (${pc(w1 / n40)}) lie within one standard deviation of the mean, ${w2} (${pc(w2 / n40)}) within two and all ${w3} within three, against 68%, 95% and 99.7%.`,
      `Shape statistics: <x>=SKEW(A2:A41)</x> is ${skewness(KG_BAGS).toFixed(2)} and <x>=KURT(A2:A41)</x>, Excel’s excess <g>kurtosis</g>, ${kurtosis(KG_BAGS).toFixed(2)}, both near 0.`,
    ] },
    { p: 'The fourth tool is a <g>normal probability plot</g>, the graphical check the NIST/SEMATECH handbook describes for this question. Sort the data, give the i-th smallest of n values the normal score <x>=NORM.S.INV((i-0.5)/n)</x>, and draw a scatter chart of the sorted values against the scores. If the data are close to normal, the points lie close to a straight line; curvature shows skew, and points bending away at the ends show tails heavier or lighter than normal. (NIST’s handbook uses a slightly different formula for the scores; the picture is the same.)' },
    { figure: {
      svg: probPlotFigure(),
      caption: 'Normal probability plots. Each dot is one value, plotted against the normal score for its position; the line shows where the values would lie if they were exactly normal with the data’s mean and standard deviation. The bags follow the line; the orders bend sharply away from it.',
      alt: `Two scatter charts side by side, each with normal scores from −3 to 3 across. Left: Ana’s 40 bag weights, 997 to 1,008 g, rising along a straight reference line with only small wiggles. Right: the 231 spring order values. The reference line runs from below −$250 up to about $330, but almost all the dots lie in a flat band between $12.60 and about $100, well above the line on the left and below it in the middle; at the far right a few dots jump upwards, and one sits alone at $1,512, far above the line.`,
    } },
    { p: 'Forty bags are enough to rule out a badly skewed or lumpy distribution, not to confirm the far tails, and the share under 1,000 g lives in a tail. A model can pass every check and still misjudge a 1-in-100 event. That is a reason to keep weighing bags, not to abandon the model.' },

    { h: 'When the normal model fails' },
    { p: `The spring orders show what goes wrong when the model doesn’t fit. Their mean is $${O.mean.toFixed(2)} and their standard deviation $${O.sd.toFixed(2)}. A normal curve with those parameters puts ${pc(pNeg)} of its area below $0, <x>=NORM.DIST(0,39.38,100.9,TRUE)</x>, so it predicts that about a third of orders have negative values. And where the empirical rule expects 68% within one standard deviation, ${oW1} of the 231 orders (${pc(oW1 / O.n)}) are.` },
    { p: 'Order values, waiting times, delivery delays and incomes are bounded below by zero and have long right tails, so for them the normal model gives wrong shares and wrong cut-offs. Describe them with the data themselves (percentiles, B03’s PERCENTILE.INC), or transform them first, as B02’s skewed-data lesson does. The next lesson shows that the <i>mean</i> of a sample of such values can still be close to normal, given a large enough sample.' },

    { h: 'The normal approximation to the binomial (in outline)' },
    { p: String.raw`A count with a <g>binomial distribution</g>, n trials and success probability p, has mean <m>np</m> and standard deviation <m>\sqrt{np(1-p)}</m>. When both np and n(1 − p) are large, its bars follow a normal curve with that mean and standard deviation. OpenStax’s business text asks for both to be greater than 5, and many texts ask for at least 10. Because each whole number k stands for the interval from k − 0.5 to k + 0.5, the approximation uses a <g>continuity correction</g>: <m>P(X \le k) \approx P(Y < k + 0.5)</m>, where Y is the normal variable.` },
    { p: String.raw`Take the next 100 orders, each a subscription with probability <m>104 \div 231 = ${pSub.toFixed(4)}</m>. The count has mean ${muB.toFixed(2)} and standard deviation ${sdB.toFixed(3)}. Exactly, <x>=BINOM.DIST(40,100,104/231,TRUE)</x> gives P(at most 40) = ${exact40.toFixed(4)}; the normal curve with the correction, <x>=NORM.DIST(40.5,45.02,4.975,TRUE)</x>, gives ${cc40typed.toFixed(4)}; without it, <x>=NORM.DIST(40,45.02,4.975,TRUE)</x> gives ${nocc40typed.toFixed(4)}. Excel computes binomial probabilities exactly, so the approximation is rarely needed for a number. It matters for the idea: the next lesson’s sampling distribution of a proportion rests on it.` },
  ],

  formulas: [
    { id: 'nd-pdf', name: 'Normal density',
      tex: String.raw`f(x) = \dfrac{1}{\sigma\sqrt{2\pi}} \, e^{-\frac{(x - \mu)^2}{2\sigma^2}}`,
      where: [[String.raw`x`, 'A value of the variable', 'units of x'], [String.raw`\mu`, 'The mean of the distribution', 'units of x'], [String.raw`\sigma`, 'The standard deviation of the distribution', 'units of x'], [String.raw`f(x)`, 'The height of the curve at x (not a probability)', 'probability per unit of x'], [String.raw`e,\ \pi`, 'The constants 2.71828… and 3.14159…', '']],
      assumptions: 'Areas under the curve, not heights, are probabilities; the total area is 1.',
      note: 'NORM.DIST(x, μ, σ, FALSE) returns f(x); with TRUE it returns the area to the left of x.' },
    { id: 'nd-z', name: 'Standardising: the z-score',
      tex: String.raw`z = \dfrac{x - \mu}{\sigma}`,
      where: [[String.raw`x`, 'A value of a normal variable', 'units of x'], [String.raw`\mu`, 'Its mean', 'units of x'], [String.raw`\sigma`, 'Its standard deviation', 'units of x'], [String.raw`z`, 'How many standard deviations x lies above (+) or below (−) the mean', '']],
      assumptions: 'If x comes from N(μ, σ), z comes from the standard normal N(0, 1).',
      note: 'Excel: STANDARDIZE(x, mean, standard_dev). NORM.S.DIST(z, TRUE) gives the area below z.' },
    { id: 'nd-inverse', name: 'From a probability back to a value',
      tex: String.raw`x = \mu + z\sigma, \qquad z = \Phi^{-1}(p)`,
      where: [[String.raw`p`, 'The area wanted below the value', ''], [String.raw`\Phi^{-1}(p)`, 'The z with area p below it (NORM.S.INV(p))', ''], [String.raw`z`, 'That z-score', ''], [String.raw`\mu`, 'Mean', 'units of x'], [String.raw`\sigma`, 'Standard deviation', 'units of x'], [String.raw`x`, 'The cut-off in the data’s units', 'units of x']],
      note: 'NORM.INV(p, μ, σ) does both steps. For an upper cut-off with area q above it, use p = 1 − q.' },
    { id: 'nd-binom', name: 'Normal approximation to the binomial, with a continuity correction',
      tex: String.raw`\mu = np, \quad \sigma = \sqrt{np(1 - p)}, \quad P(X \le k) \approx P(Y < k + 0.5)`,
      where: [[String.raw`X`, 'The binomial count', 'successes'], [String.raw`n`, 'Number of trials', ''], [String.raw`p`, 'Probability of success on each trial', ''], [String.raw`k`, 'A whole-number count', 'successes'], [String.raw`Y`, 'A normal variable with mean μ and standard deviation σ', 'successes'], [String.raw`P`, 'Probability', ''], [String.raw`\mu,\ \sigma`, 'Mean and standard deviation of the count', 'successes']],
      assumptions: 'np and n(1 − p) both large: more than 5 in OpenStax’s rule of thumb, at least 10 in many texts.',
      note: 'For P(X ≥ k) use P(Y > k − 0.5); for P(X = k), the area from k − 0.5 to k + 0.5.' },
  ],

  examples: [
    { level: 'simple', title: 'Short, heavy and in between', fictional: true,
      setup: 'Kilnworth’s 1 kg bags are N(1,004, 3) if the machine runs as specified. What share of bags weighs under 1,000 g, over 1,010 g, and between 1,000 and 1,008 g? Work each from z, then check it in Excel.',
      steps: [
        String.raw`Under 1,000 g: <m>z = (1{,}000 - 1{,}004) \div 3 = -1.33</m>. The area below it is ${pUnder.toFixed(4)} (<x>=NORM.DIST(1000,1004,3,TRUE)</x>), or 0.0918 from a two-decimal z table.`,
        String.raw`Over 1,010 g: <m>z = (1{,}010 - 1{,}004) \div 3 = 2</m>. The area below 2 is ${(1 - pOver1010).toFixed(4)}, so the area above is <m>1 - ${(1 - pOver1010).toFixed(4)} = ${pOver1010.toFixed(4)}</m> (<x>=1-NORM.DIST(1010,1004,3,TRUE)</x>).`,
        String.raw`Between 1,000 and 1,008 g: the z-scores are −1.33 and +1.33. The area below +1.33 is ${(1 - pUnder).toFixed(4)} and below −1.33 is ${pUnder.toFixed(4)}, so the area between is <m>${(1 - pUnder).toFixed(4)} - ${pUnder.toFixed(4)} = ${pMid.toFixed(4)}</m>.`,
        'Check by symmetry: 1,000 and 1,008 g are the same distance either side of 1,004 g, so the two tails outside them are equal, each 0.0912, and 1 − 2 × 0.0912 = 0.8176.',
      ],
      answer: `${pc(pUnder)} of bags under 1,000 g, ${pc(pOver1010, 2)} over 1,010 g, ${pc(pMid)} between 1,000 and 1,008 g.`,
      interpretation: 'Roughly one bag in eleven would be short of the label and one in 44 more than 10 g over. A specification that sounds generous, 4 g above the label, leaves many short bags because 4 g is only 1.33 standard deviations.' },
    { level: 'challenging', title: 'Setting the machine so that only 1% are short', fictional: true,
      setup: 'Ana asks Kilnworth to keep short bags to 1% at most. Compare the two ways of getting there: raising the setting with the standard deviation at 3 g, or keeping the 1,004 g setting and making the machine steadier. How much extra coffee does the first route cost per 1,000 bags?',
      steps: [
        String.raw`Find the z with 1% below it: <x>=NORM.S.INV(0.01)</x> returns <m>-${z99.toFixed(3)}</m>. For 1% of bags to be short, the label must sit 2.326 standard deviations below the mean.`,
        String.raw`Route 1, raise the setting: <m>\mu = 1{,}000 + 2.326 \times 3 = ${setting1.toFixed(2)}</m> g, or <x>=1000+NORM.S.INV(0.99)*3</x>. Check: <x>=NORM.DIST(1000,1006.98,3,TRUE)</x> returns 0.0100.`,
        String.raw`Route 2, reduce the spread: with <m>\mu = 1{,}004</m>, solve <m>(1{,}000 - 1{,}004) \div \sigma = -2.326</m>, so <m>\sigma = 4 \div 2.326 = ${sdFor1.toFixed(2)}</m> g, a 43% cut in the standard deviation.`,
        String.raw`Cost of route 1: <m>${setting1.toFixed(2)} - 1{,}004 = ${giveaway.toFixed(2)}</m> g more per bag on average, or about <m>${giveaway.toFixed(2)} \times 1{,}000 \div 1{,}000 = ${giveaway.toFixed(2)}</m> kg per 1,000 bags: three bags’ worth of coffee given away in every thousand.`,
      ],
      answer: `A setting of about ${setting1.toFixed(1)} g (with SD 3 g), or a standard deviation of ${sdFor1.toFixed(2)} g at 1,004 g. Route 1 gives away about ${giveaway.toFixed(1)} kg of coffee per 1,000 bags.`,
      interpretation: 'The model turns a quality target into a price. Raising the setting is quick but costs coffee on every bag; a steadier machine costs maintenance once. Both rest on the normal model’s left tail, so Kilnworth should confirm the change by weighing bags afterwards.' },
    { level: 'applied', title: 'Is the normal model right for Ana’s 40 bags?', fictional: true,
      setup: 'Before writing to Kilnworth, Ana checks whether her 40 bags look normal, and compares three answers to “what share of bags is under 1,000 g?”: the specification’s, her sample’s, and her sample’s normal model.',
      steps: [
        `Shape: the histogram has one peak and no long tail; the mean (${m40.toFixed(2)} g) and median (${med40.toFixed(2)} g) almost agree; SKEW ${skewness(KG_BAGS).toFixed(2)} and KURT ${kurtosis(KG_BAGS).toFixed(2)} are near 0.`,
        `Empirical rule: ${w1}, ${w2} and ${w3} of the 40 bags lie within one, two and three standard deviations (${pc(w1 / n40)}, ${pc(w2 / n40)}, ${pc(w3 / n40)}), close to 68%, 95% and 99.7%. The normal probability plot is close to a straight line. A normal model is reasonable.`,
        String.raw`Three answers: the specification, <m>N(1{,}004, 3)</m>, gives ${pc(pUnder)}; the sample shows <m>5 \div 40 = 12.5\%</m>; a normal model with the sample’s mean and standard deviation, <x>=NORM.DIST(1000,AVERAGE(A2:A41),STDEV.S(A2:A41),TRUE)</x> on the 40 weights in A2:A41, gives ${pc(pUnderSample)}.`,
        String.raw`The sample’s spread (${s40.toFixed(2)} g) is a little smaller than the specified 3 g, but its mean is 1.25 g lower, and the lower mean more than offsets the smaller spread: <m>z = (1{,}000 - 1{,}002.75) \div ${s40.toFixed(2)} = ${((K.label - m40) / s40).toFixed(2)}</m>, against −1.33.`,
      ],
      answer: `The normal model fits the bags reasonably. If the machine is running at the sample’s mean and spread, about ${pc(pUnderSample, 0)} of bags are under the label, not ${pc(pUnder)}.`,
      interpretation: 'The case for raising the issue with Kilnworth rests on the mean, not on the count of five short bags. Forty bags estimate the mean only within a margin, which the confidence-intervals lesson calculates; Module 3 tests whether 1,002.75 g is far enough below 1,004 g to rule out chance.' },
  ],

  demo: [
    { widget: 'nd-kiln', intro: 'Kilnworth’s specification as a normal curve. Choose a question, move a and b, and read the probability and the Excel formula. Then change the mean and standard deviation: find the setting that leaves 1% under 1,000 g with σ = 3, and the σ that does it at 1,004 g.' },
    { widget: 'nd-bags', intro: 'Ana’s 40 bag weights as a histogram. Is there one peak, a long tail, a gap? Switch the outlier rule and see whether any bag is flagged.' },
    { widget: 'nd-sheet', intro: 'The 40 bags with the normality checks as live formulas, and Kilnworth’s specification in G2:G4. Change the setting in G3 or the standard deviation in G4 and watch the share under the label (G5) and the 1% setting (G7) recalculate. Turn on Show formulas to see each one.' },
    { widget: 'nd-z', intro: 'The standard normal distribution. Find the z with 97.5% below it, the area outside ±1.96, and the area below −1.33. Every question about a normal variable can be turned into one of these.' },
  ],

  mistakes: [
    { title: '“NORM.DIST(1000,1004,3,FALSE) is the probability of a bag weighing 1,000 g.”', html: 'With cumulative set to FALSE, NORM.DIST returns the height of the density curve, here 0.0547 per gram, not a probability. For a continuous variable, probabilities are areas: set cumulative to TRUE for the area below a value.' },
    { title: '“The share over 1,010 g is NORM.DIST(1010,1004,3,TRUE).”', html: 'NORM.DIST with TRUE always gives the area <i>below</i> x, here 0.9772. For the area above, subtract it from 1: <x>=1-NORM.DIST(1010,1004,3,TRUE)</x> = 0.0228. Sketch the curve and shade the area first.' },
    { title: '“The heaviest 5% start at NORM.INV(0.05,1004,3).”', html: 'NORM.INV takes the area below the cut-off. NORM.INV(0.05, …) is the value with 5% below it, 999.07 g: the lightest 5%. The heaviest 5% start at <x>=NORM.INV(0.95,1004,3)</x> = 1,008.93 g.' },
    { title: '“z = −1.33 means 1.33% of bags are short.”', html: 'A z-score is a distance in standard deviations, not a percentage. Turn it into an area with NORM.S.DIST(−1.33, TRUE) = 0.0918, or 0.0912 from the exact z of −4/3.' },
    { title: '“Almost anything is roughly normal, so the model is safe.”', html: 'Lantern’s order values are not: a normal curve with their mean and standard deviation puts 35% of orders below $0. Check the histogram, the mean against the median, the empirical-rule counts and a normal probability plot before using the model, and use percentiles for skewed data.' },
  ],

  application: [
    { p: 'Anyone who fills packs by weight or volume, of coffee, flour, cereal or paint, faces Kilnworth’s trade-off. Set the target too close to the label and too many packs are short; set it too high and you give product away on every pack. The normal model turns the trade-off into numbers: the share short at a given setting is one NORM.DIST, and the setting for a given share is one NORM.INV. The same arithmetic sets tolerances in manufacturing and service levels in stock control.' },
    { p: String.raw`Stock control is the second classic use. Suppose (a fictional figure) Lantern sells a mean of 40 bags of House Blend 1 kg a week with a standard deviation of 8, roughly normal, and tops up its stock once a week. To meet a whole week’s demand from stock in 95% of weeks, the level it tops up to (the order-up-to level) must be the 95th percentile of weekly demand: <x>=NORM.INV(0.95,40,8)</x> = <m>40 + 1.645 \times 8 = ${reorder.toFixed(1)}</m>, so 54 bags. The extra 14 bags above the average are the safety stock, the price of the 95%.` },
    { case: `Ana writes to Kilnworth: “If your machine runs at 1,004 g with a standard deviation of 3 g, about 9% of bags will be under 1,000 g. To keep short bags below 1%, the setting would need to be about 1,007 g, or the standard deviation below 1.7 g. In October our 40 bags averaged 1,002.75 g, and 5 were short.” She keeps the claim to what the model says, and leaves the question of whether the machine has drifted for a formal test.` },
    { p: 'The model is only as good as its fit, and its weakest point is the tail where these decisions live. Check the shape on real data before quoting a normal probability, keep checking after a process changes, and say when you have used a model rather than counted. For skewed measures, such as order values or waiting times, describe the data directly rather than through a normal curve.' },
  ],

  summary: [
    'For a continuous variable, probabilities are areas under a density curve whose total area is 1; a single exact value has probability 0, and the curve’s height is not a probability.',
    'A normal distribution N(μ, σ) is symmetric about μ (also its median and mode); about 68%, 95% and 99.7% of values lie within one, two and three standard deviations, and exactly 95% within 1.96.',
    'z = (x − μ) ÷ σ turns any normal question into one about the standard normal; x = μ + zσ turns a z back into data units.',
    'NORM.DIST(x, μ, σ, TRUE) is the area below x; use 1 − for above and a difference for between. FALSE gives the height, not a probability.',
    'NORM.INV(p, μ, σ) and NORM.S.INV(p) give the value with area p below it: for an upper cut-off use p = 1 − the upper share.',
    'Check the fit with a histogram, mean against median, the empirical-rule counts, SKEW and KURT, and a normal probability plot; right-skewed data such as order values are not normal.',
    'A binomial count is close to N(np, √(np(1 − p))) when np and n(1 − p) are large; use a continuity correction of ±0.5.',
  ],

  glossary: [
    { term: 'Probability density function', def: 'A curve that describes a continuous random variable: the area under it between two values is the probability that the variable falls between them, and the total area under it is 1. Its height is not a probability.' },
    { term: 'Normal distribution', def: 'The symmetric, bell-shaped continuous distribution fixed by its mean μ and standard deviation σ, written N(μ, σ). About 68%, 95% and 99.7% of its values lie within one, two and three standard deviations of the mean.' },
    { term: 'Standard normal distribution', def: 'The normal distribution with mean 0 and standard deviation 1, which the z-scores of any normal variable follow. Excel’s NORM.S.DIST and NORM.S.INV use it.' },
    { term: 'Normal probability plot', def: 'A scatter chart of a sample’s sorted values against the normal scores for their positions. The points lie close to a straight line when the data are close to normal; curvature shows skew or tails unlike a normal distribution’s.' },
    { term: 'Continuity correction', def: 'Moving a whole-number cut-off by half a unit (to k + 0.5 or k − 0.5) when a continuous distribution, such as the normal, is used to approximate a discrete one, such as the binomial.' },
  ],

  references: [
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Business Statistics 2e</i>, sections 6.1 “The Standard Normal Distribution” and 6.3 “Estimating the Binomial with the Normal Distribution”. OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/6-1-the-standard-normal-distribution', checked: '2026-10-24' },
    { text: 'NIST/SEMATECH. <i>e-Handbook of Statistical Methods</i>, section 1.3.6.6.1, “Normal Distribution”.', url: 'https://itl.nist.gov/div898/handbook/eda/section3/eda3661.htm', checked: '2026-10-24' },
    { text: 'NIST/SEMATECH. <i>e-Handbook of Statistical Methods</i>, section 1.3.3.21, “Normal Probability Plot”.', url: 'https://itl.nist.gov/div898/handbook/eda/section3/normprpl.htm', checked: '2026-10-24' },
    { text: 'Microsoft Support. “NORM.DIST function”, with the pages for NORM.S.DIST, NORM.INV, NORM.S.INV and STANDARDIZE.', url: 'https://support.microsoft.com/en-US/Excel/functions/norm-dist-function', checked: '2026-10-24' },
    { text: 'Microsoft Support. “NORMDIST function” and “NORMSDIST function” (replaced by NORM.DIST and NORM.S.DIST; kept for backward compatibility).', url: 'https://support.microsoft.com/en-US/excel/functions/normdist-function', checked: '2026-10-24' },
  ],

  checks: [
    // the case
    { what: 'Label weight', value: K.label, shown: 1000 },
    { what: 'Machine setting', value: K.setting, shown: 1004 },
    { what: 'Specified SD', value: K.sd, shown: 3 },
    { what: 'Bags weighed', value: n40, shown: 40 },
    { what: 'Sample mean', value: m40, shown: 1002.75 },
    { what: 'Bags under 1,000 g', value: D.kg.underLabel, shown: 5 },
    { what: 'Empirical bands: 1 SD', value: K.setting - K.sd, shown: 1001 },
    { what: 'Empirical bands: 2 SD upper', value: K.setting + 2 * K.sd, shown: 1010 },
    { what: 'Empirical bands: 3 SD lower', value: K.setting - 3 * K.sd, shown: 995 },
    { what: 'Empirical bands: 3 SD upper', value: K.setting + 3 * K.sd, shown: 1013 },
    { what: 'z of the label', value: zLabel, shown: -1.33 },
    { what: 'P(bag < 1,000 g)', value: pUnder, shown: 0.0912, tol: 0.00005 },
    { what: 'Same as case DERIVED', value: D.kg.pUnderSpec, shown: pUnder, tol: 1e-12 },
    { what: 'P under, as %', value: pUnder * 100, shown: 9.1, tol: 0.05 },
    { what: 'About one in eleven', value: 1 / pUnder, shown: 11, tol: 0.05 },
    { what: 'z table at −1.33', value: I.normCdf(-1.33), shown: 0.0918, tol: 0.00005 },
    { what: 'NORM.S.INV(0.99)', value: z99, shown: 2.326, tol: 0.0005 },
    { what: '1% setting', value: setting1, shown: 1006.98 },
    { what: '1% setting about 1,007', value: setting1, shown: 1007, tol: 0.05 },
    { what: 'Almost 3 g more', value: giveaway, shown: 2.98 },
    { what: 'SD for 1% at 1,004', value: sdFor1, shown: 1.72 },
    { what: 'SD below 1.7 g', value: sdFor1, shown: 1.7, tol: 0.05 },
    { what: 'SD cut', value: (1 - sdFor1 / K.sd) * 100, shown: 43, tol: 0.5 },
    { what: 'Check: P under at 1,006.98', value: I.normal.cdf(1000, 1006.98, 3), shown: 0.0100, tol: 0.00005 },
    { what: 'Expected short of 40', value: expUnder, shown: 3.6, tol: 0.05 },
    { what: 'P(5 or more short)', value: pFiveOrMore * 100, shown: 30, tol: 0.5 },
    { what: 'Sample mean below setting', value: K.setting - m40, shown: 1.25 },
    { what: 'Density at 1,004', value: dens, shown: 0.133, tol: 0.0005 },
    { what: 'Half-gram window', value: win1g, shown: 0.1324, tol: 0.00005 },
    { what: 'Beyond 4 SD %', value: 2 * I.normSf(4) * 100, shown: 0.0063, tol: 0.00005 },
    { what: 'Empirical 1 SD exact %', value: (I.normCdf(1) - I.normCdf(-1)) * 100, shown: 68.27 },
    { what: 'Empirical 2 SD exact %', value: (I.normCdf(2) - I.normCdf(-2)) * 100, shown: 95.45 },
    { what: 'Empirical 3 SD exact %', value: (I.normCdf(3) - I.normCdf(-3)) * 100, shown: 99.73 },
    { what: 'z 0.975', value: I.normInv(0.975), shown: 1.96, tol: 0.0005 },
    { what: 'z 0.90', value: I.normInv(0.9), shown: 1.282, tol: 0.0005 },
    { what: 'z 0.95', value: z95, shown: 1.645, tol: 0.0005 },
    { what: 'z 0.995', value: I.normInv(0.995), shown: 2.576, tol: 0.0005 },
    { what: 'P over 1,010', value: pOver1010, shown: 0.0228, tol: 0.00005 },
    { what: 'P over 1,010 as %', value: pOver1010 * 100, shown: 2.28, tol: 0.005 },
    { what: 'One in 44 over 1,010', value: 1 / pOver1010, shown: 44, tol: 0.5 },
    { what: 'Area below z = 2', value: 1 - pOver1010, shown: 0.9772, tol: 0.00005 },
    { what: 'P between 1,000 and 1,008', value: pMid, shown: 0.8176, tol: 0.00005 },
    { what: 'Between by symmetry', value: 1 - 2 * 0.0912, shown: 0.8176, tol: 0.00005 },
    { what: 'Area below +1.33 (exact z)', value: 1 - pUnder, shown: 0.9088, tol: 0.00005 },
    { what: 'P outside 998 / 1,010', value: pOutside, shown: 0.0455, tol: 0.00005 },
    { what: 'Heaviest 5% start', value: heavy5, shown: 1008.93 },
    { what: 'Lightest 5% end', value: I.normal.inv(0.05, K.setting, K.sd), shown: 999.07 },
    { what: 'NORM.INV(0.01,1004,3)', value: I.normal.inv(0.01, K.setting, K.sd), shown: 997.02 },
    { what: 'NORM.S.DIST(−1.333333)', value: I.normCdf(-1.333333), shown: 0.0912, tol: 0.00005 },
    { what: 'STANDARDIZE(1000,1004,3)', value: zLabel, shown: -1.3333, tol: 0.00005 },
    { what: 'NORM.S.INV(0.99) to 4 dp', value: z99, shown: 2.3263, tol: 0.00005 },
    { what: 'Density at 1,000 (mistakes)', value: I.normal.pdf(1000, K.setting, K.sd), shown: 0.0547, tol: 0.00005 },
    { what: 'Sample median', value: med40, shown: 1002.55 },
    { what: 'Mean and median 0.2 g apart', value: m40 - med40, shown: 0.2, tol: 0.005 },
    { what: 'Within 1 SD', value: w1, shown: 29 },
    { what: 'Within 2 SD', value: w2, shown: 38 },
    { what: 'Within 3 SD', value: w3, shown: 40 },
    { what: 'Within 1 SD %', value: w1 / n40 * 100, shown: 72.5 },
    { what: 'Within 2 SD %', value: w2 / n40 * 100, shown: 95.0 },
    { what: 'SKEW', value: skewness(KG_BAGS), shown: -0.23 },
    { what: 'KURT', value: kurtosis(KG_BAGS), shown: -0.34 },
    { what: 'Sample SD', value: s40, shown: 2.66 },
    { what: 'Sample min', value: Math.min(...KG_BAGS), shown: 997 },
    { what: 'Sample max (about 1,008)', value: Math.max(...KG_BAGS), shown: 1008, tol: 0.15 },
    { what: 'Sample normal model P under', value: pUnderSample * 100, shown: 15.0, tol: 0.05 },
    { what: 'Sample normal model P under (rounded)', value: pUnderSample * 100, shown: 15, tol: 0.5 },
    { what: 'Sample z of label', value: (K.label - m40) / s40, shown: -1.04 },
    { what: 'Five of forty', value: 5 / 40 * 100, shown: 12.5 },
    // orders
    { what: 'Orders mean', value: O.mean, shown: 39.38 },
    { what: 'Orders SD', value: O.sd, shown: 100.90 },
    { what: 'Normal model: orders below $0', value: pNeg * 100, shown: 34.8, tol: 0.05 },
    { what: 'About a third', value: pNeg, shown: 1 / 3, tol: 0.02 },
    { what: '35% in mistakes', value: pNeg * 100, shown: 35, tol: 0.5 },
    { what: 'Orders within 1 SD', value: oW1, shown: 229 },
    { what: 'Orders within 1 SD %', value: oW1 / O.n * 100, shown: 99.1, tol: 0.05 },
    { what: 'Smallest order (plot alt)', value: O.min, shown: 12.60 },
    { what: 'Largest order (plot alt)', value: O.max, shown: 1512 },
    // binomial approximation
    { what: 'Subscription share', value: pSub, shown: 0.4502, tol: 0.00005 },
    { what: 'Binomial mean', value: muB, shown: 45.02 },
    { what: 'Binomial SD', value: sdB, shown: 4.975, tol: 0.0005 },
    { what: 'Exact P(X ≤ 40)', value: exact40, shown: 0.1819, tol: 0.00005 },
    { what: 'Normal with CC (exact inputs)', value: cc40, shown: 0.1817, tol: 0.00005 },
    { what: 'Normal with CC as typed', value: cc40typed, shown: 0.1818, tol: 0.00005 },
    { what: 'Normal without CC as typed', value: nocc40typed, shown: 0.1565, tol: 0.00005 },
    { what: 'Typed inputs match the rounded mean and SD', value: Math.abs(muB - 45.02) + Math.abs(sdB - 4.975), shown: 0, tol: 0.006 },
    // application (fictional demand)
    { what: 'Order-up-to level', value: reorder, shown: 53.2, tol: 0.05 },
    { what: 'Order-up-to level, whole bags', value: Math.ceil(reorder), shown: 54 },
    { what: 'Safety stock', value: Math.ceil(reorder) - DEMAND.mean, shown: 14 },
    { what: 'Ana’s letter: about 9%', value: pUnder * 100, shown: 9, tol: 0.5 },
    { what: 'Giveaway per 1,000 bags, kg (1 dp)', value: giveaway, shown: 3.0, tol: 0.05 },
  ],
};
