// describing-distributions.js — B04 · Describing distributions. Content only; exercises are in
// describing-distributions.ex.js. Uses the spring order values (ORDER_VALUES, DERIVED.orders), the catering events'
// invoice per guest-day by type (PER_GUEST_BY_TYPE, EVENTS), the 154 star ratings (RATINGS) and, for a change of units
// only, Kilnworth's 1 kg bags (DERIVED.kg: their normal model and tests are later lessons'). The three-value population
// in the n − 1 demonstration and the $5.20 delivery charge are illustrations, labelled. Every printed figure is
// recomputed in `checks`.
import { ORDER_VALUES, RATINGS, PER_GUEST_BY_TYPE, EVENT_TYPES, EVENTS, EVENT_COLUMNS, ORDERS, ORDER_COLUMNS, SUBSCRIPTION_FLAGS, DERIVED as D } from './case.js?v=22';
import { mean, sd, variance, median, quantile, skewness, kurtosis } from '../../../core/stats.js?v=22';
import { normCdf } from '../../../core/inference.js?v=22';
import { QUOTE } from '../b03/case.js?v=22';

// ---------------------------------------------------------------- helpers
const sum = (a) => a.reduce((s, x) => s + x, 0);
const devsq = (a) => { const m = mean(a); return sum(a.map((x) => (x - m) ** 2)); };
const within = (a, k) => { const m = mean(a), s = sd(a); return a.filter((x) => Math.abs(x - m) <= k * s).length; };
const below = (a, x) => a.filter((v) => v < x).length;
const equal = (a, x) => a.filter((v) => v === x).length;
/** Excel's TRIMMEAN: exclude floor(n × percent) rounded down to an even number, half from each end. */
const trimmean = (a, pct) => { const s = [...a].sort((x, y) => x - y); let k = Math.floor(a.length * pct); k -= k % 2; const h = k / 2; return mean(s.slice(h, s.length - h)); };
const f = (v, d = 2) => v.toFixed(d);
const usd = (v, d = 2) => `$${v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const tx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/,/g, '{,}');

// ---------------------------------------------------------------- the spring orders
const O = ORDER_VALUES, n = O.length;
const NB = O.filter((x) => x !== D.orders.max);                       // without LC-10144
const kShares = [1, 2, 3].map((k) => within(O, k) / n);
const kSharesNB = [1, 2, 3].map((k) => within(NB, k) / NB.length);
const empirical = [1, 2, 3].map((k) => 2 * normCdf(k) - 1);
const cheb = (k) => 1 - 1 / (k * k);
const zBulk = D.orders.bulkZ;
const trim10 = trimmean(O, 0.1);
const trimK = (() => { let k = Math.floor(n * 0.1); k -= k % 2; return k; })();

// ---------------------------------------------------------------- catering: invoice per guest-day by event type
const T = EVENT_TYPES;                                                  // Conference, Meeting, Breakfast, Launch, Team day
const G = PER_GUEST_BY_TYPE;
const stat = (a) => {
  const q1 = quantile(a, 0.25), q3 = quantile(a, 0.75), iqr = q3 - q1, lo = q1 - 1.5 * iqr, hi = q3 + 1.5 * iqr;
  return { n: a.length, mean: mean(a), median: median(a), sd: sd(a), cv: sd(a) / mean(a), q1, q3, iqr, min: Math.min(...a), max: Math.max(...a),
    wlo: Math.min(...a.filter((x) => x >= lo)), whi: Math.max(...a.filter((x) => x <= hi)), out: a.filter((x) => x < lo || x > hi), skew: skewness(a) };
};
const ST = Object.fromEntries(T.map((t) => [t, stat(G[t])]));
const L = G.Launch, LS = ST.Launch;
const M = G.Meeting, MS = ST.Meeting, TD = ST['Team day'];
const evCol = (name) => EVENT_COLUMNS.indexOf(name);
const smallMeeting = EVENTS.find((r) => r[evCol('event_type')] === 'Meeting' && Math.round(r[evCol('invoice')] / r[evCol('guests')] * 100) / 100 === MS.max);
const smallTeam = EVENTS.find((r) => r[evCol('event_type')] === 'Team day' && Math.round(r[evCol('invoice')] / r[evCol('guests')] * 100) / 100 === TD.max);
const zMeet = (MS.max - MS.mean) / MS.sd, zTeam = (TD.max - TD.mean) / TD.sd;
const PLURAL = { Conference: 'conferences', Meeting: 'meetings', Breakfast: 'breakfasts', Launch: 'launches', 'Team day': 'team days' };
const byIqr = [...T].sort((a, b) => ST[a].iqr / ST[a].median - ST[b].iqr / ST[b].median);
const minMeetingGuests = Math.min(...EVENTS.filter((r) => r[evCol('event_type')] === 'Meeting').map((r) => r[evCol('guests')]));

// ---------------------------------------------------------------- ratings and other categories
const R = RATINGS, rc = [1, 2, 3, 4, 5].map((k) => equal(R, k));
const chan = ORDERS.map((r) => r[ORDER_COLUMNS.indexOf('channel')]);
const web = chan.filter((c) => c === 'web').length, app = chan.filter((c) => c === 'app').length;
const cumBelow4 = rc[0] + rc[1] + rc[2];

// ---------------------------------------------------------------- the n − 1 demonstration: population {2, 4, 9}
const POP = [2, 4, 9], mu = mean(POP), sig2 = variance(POP, 0);
const PAIRS = POP.flatMap((a) => POP.map((b) => [a, b]));
const byN = PAIRS.map(([a, b]) => variance([a, b], 0)), byN1 = PAIRS.map(([a, b]) => variance([a, b], 1));

// ---------------------------------------------------------------- Kilnworth's bags in other units (illustration)
const kgMean = D.kg.mean, kgSd = D.kg.sd;

// ---------------------------------------------------------------- figure: box plots of invoice per guest-day by type
function boxFigure() {
  const X0 = 150, X1 = 620, lo = 6, hi = 18, x = (v) => X0 + ((v - lo) / (hi - lo)) * (X1 - X0), r1 = (v) => Math.round(v * 10) / 10;
  const top = 26, row = 40;
  let s = `<svg viewBox="0 0 640 ${top + row * T.length + 44}" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">`;
  for (let v = lo; v <= hi; v += 2) s += `<line x1="${r1(x(v))}" x2="${r1(x(v))}" y1="${top - 8}" y2="${top + row * T.length}" stroke="var(--rule-strong)" stroke-width="0.5" stroke-dasharray="3 3"/><text x="${r1(x(v))}" y="${top + row * T.length + 16}" text-anchor="middle" font-size="11" fill="var(--ink-3)">$${v}</text>`;
  T.forEach((t, i) => {
    const b = ST[t], yc = top + row * i + row / 2;
    s += `<text x="${X0 - 12}" y="${yc + 4}" text-anchor="end" font-size="12">${t} (${b.n})</text>`;
    s += `<line x1="${r1(x(b.wlo))}" x2="${r1(x(b.q1))}" y1="${yc}" y2="${yc}" stroke="var(--ink)" stroke-width="1.3"/><line x1="${r1(x(b.q3))}" x2="${r1(x(b.whi))}" y1="${yc}" y2="${yc}" stroke="var(--ink)" stroke-width="1.3"/>`;
    s += `<line x1="${r1(x(b.wlo))}" x2="${r1(x(b.wlo))}" y1="${yc - 7}" y2="${yc + 7}" stroke="var(--ink)" stroke-width="1.3"/><line x1="${r1(x(b.whi))}" x2="${r1(x(b.whi))}" y1="${yc - 7}" y2="${yc + 7}" stroke="var(--ink)" stroke-width="1.3"/>`;
    s += `<rect x="${r1(x(b.q1))}" y="${yc - 12}" width="${r1(x(b.q3) - x(b.q1))}" height="24" fill="var(--series-1)" fill-opacity="0.18" stroke="var(--series-1)" stroke-width="1.5"/>`;
    s += `<line x1="${r1(x(b.median))}" x2="${r1(x(b.median))}" y1="${yc - 12}" y2="${yc + 12}" stroke="var(--ink)" stroke-width="2.6"/>`;
    s += `<path d="M${r1(x(b.mean)) - 4} ${yc - 4} l8 8 M${r1(x(b.mean)) - 4} ${yc + 4} l8 -8" stroke="var(--series-2)" stroke-width="1.8"/>`;
    b.out.forEach((v) => { s += `<circle cx="${r1(x(v))}" cy="${yc}" r="3.6" fill="none" stroke="var(--ink)" stroke-width="1.4"/>`; });
  });
  s += `<text x="${(X0 + X1) / 2}" y="${top + row * T.length + 36}" text-anchor="middle" font-size="11" fill="var(--ink-3)">Invoice per guest-day</text>`;
  return `${s}</svg>`;
}
const outText = T.filter((t) => ST[t].out.length).map((t) => `${t} ${ST[t].out.map((v) => usd(v)).join(' and ')}`).join('; ');

export default {
  slug: 'describing-distributions',
  title: 'Describing distributions',
  blurb: 'Before you infer anything from data, describe it exactly: its centre, its spread, where a value sits within it and its shape. Learn the notation that separates a population from a sample, why the sample variance divides by n − 1, what z-scores, percentile ranks and the coefficient of variation say, and when the empirical rule or only Chebyshev’s inequality applies.',
  status: 'reviewed',
  objectives: [
    'Distinguish a population parameter (μ, σ, N) from a sample statistic (x̄, s, n), and explain why the sample variance divides by n − 1.',
    'Calculate the mean, median, trimmed mean, variance, standard deviation and coefficient of variation by hand and in Excel, and predict how adding a constant or changing units moves each of them.',
    'Locate a value within its group with a z-score and a percentile rank, using STANDARDIZE, PERCENTRANK.INC and COUNTIF.',
    'Decide whether the empirical rule or Chebyshev’s inequality applies to a distribution, and apply it.',
    'Describe a distribution’s shape with the five-number summary, a box plot, SKEW and KURT, and a categorical variable with counts, proportions and the mode.',
    'Compare several groups side by side with summaries that suit their shape.',
  ],
  prerequisites: [
    { lesson: 'b01/summarising-data', why: 'The mean, median, mode, quartiles and standard deviation are calculated by hand there.' },
    { lesson: 'b02/outliers', why: 'z-scores, Tukey fences and masking, and why Lantern’s $1,512 office order was kept.' },
    { lesson: 'b02/skewed-data', why: 'What skewness is, and why a long right tail pulls the mean above the median.' },
    { lesson: 'b03/descriptive-statistics-and-regression', why: 'Excel’s AVERAGE, MEDIAN, STDEV.S, QUARTILE.INC, SKEW and KURT, and the ToolPak’s Descriptive Statistics.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'At the end of 2026 Ana has B03’s spring review of her online shop and a full year of catering invoices, and wants to know which of them she can lean on. Two questions start the course: how unusual was LC-10144, the office order of $1,512, compared with everything else she sold, and which kind of catering event brings in most per guest, and how consistently? Both are questions about describing data exactly, which is where inference starts.' },
    { p: 'This lesson builds the vocabulary that the rest of the course uses. A <b>distribution</b> is the pattern of values a variable takes: which values occur and how often. Four questions describe one: where its centre is, how spread out it is, where a particular value sits within it, and what shape it has (symmetric, or with a long tail on one side).' },

    { h: 'Populations, samples and their symbols' },
    { p: 'B01 defined a <g>population</g> as everything a question is about, and a <g>sample</g> as the part you actually observe. Statistics gives their summaries different names and symbols. A number that describes a population is a <g>parameter</g>; the same summary calculated from a sample is a <g>statistic</g>. A parameter is usually unknown and fixed, and a statistic is known but would change if you drew another sample. Most of this course is about using statistics to learn about parameters.' },
    { table: {
      caption: 'Population parameters and sample statistics',
      head: ['Summary', 'Population (parameter)', 'Sample (statistic)', 'Excel'],
      align: ['l', 'l', 'l', 'l'],
      rows: [
        ['Number of values', '<m>N</m>', '<m>n</m>', 'COUNT'],
        ['Mean', '<m>\\mu</m> (“mu”)', '<m>\\bar{x}</m> (“x-bar”)', 'AVERAGE'],
        ['Variance', '<m>\\sigma^2</m>', '<m>s^2</m>', 'VAR.P, VAR.S'],
        ['Standard deviation', '<m>\\sigma</m> (“sigma”)', '<m>s</m>', 'STDEV.P, STDEV.S'],
        ['Proportion', '<m>p</m>', '<m>\\hat{p}</m> (“p-hat”)', 'COUNTIF ÷ COUNT'],
      ],
    } },
    { p: String.raw`Formulas use the capital Greek sigma, <m>\Sigma</m>, for “add up”. <m>\sum_{i=1}^{n} x_i</m> means <m>x_1 + x_2 + \dots + x_n</m>: the sum of the values from the first to the <m>n</m>-th. So the sample mean is <m>\bar{x} = \sum x_i \div n</m>, and the population mean is <m>\mu = \sum x_i \div N</m>: the same arithmetic with different names, because they answer different questions.` },
    { p: `Whether a set of numbers is a population or a sample depends on the question, not on the numbers. Lantern’s ${n} spring orders are the whole population if Ana asks “what did spring 2026 look like?”. They are a sample if she treats them as evidence about her orders in general, which is how B03 used them and how most of this course will. The calculation of the mean is the same, ${usd(D.orders.mean)}; the standard deviation is not, as the next sections show.` },

    { h: 'Centre: the balance point and the middle' },
    { p: String.raw`The <g>mean</g> is the balance point of the data. Each value’s <b>deviation</b> from the mean, <m>x_i - \bar{x}</m>, is positive above it and negative below, and the deviations always add to exactly 0. Picture the values as equal weights on a plank: the mean is where a support would balance it. That is why one value far out on the plank, like the $1,512 order, moves the mean a long way: it has the longest lever.` },
    { p: `The <g>median</g> is the middle value, so it depends only on the order of the values. For the spring orders it is ${usd(D.orders.median)} against a mean of ${usd(D.orders.mean)}. A compromise between the two is the <g>trimmed mean</g>: sort the values, drop a fixed share from each end, and average the rest. Excel’s <x>=TRIMMEAN(J2:J232,0.1)</x> drops 10% of the ${n} orders in total, rounded down to an even number: ${trimK} orders, ${trimK / 2} from each end. The mean of the rest is ${usd(trim10)}: the large orders still count, but the most extreme ones no longer dominate.` },

    { h: 'Spread: deviations, squares and n − 1' },
    { p: String.raw`Spread measures how far values typically lie from the centre. The <g>standard deviation</g> squares each deviation (so negatives don’t cancel positives), adds the squares, averages them and takes the square root. The total of the squared deviations, <m>\sum (x_i - \bar{x})^2</m>, is called the <g>sum of squares</g>; Excel’s DEVSQ returns it. Dividing it by <m>n</m> gives the population <g>variance</g> <m>\sigma^2</m> (VAR.P); dividing by <m>n - 1</m> gives the sample variance <m>s^2</m> (VAR.S).` },
    { p: String.raw`Why <m>n - 1</m>? A sample’s deviations are measured from its own mean, <m>\bar{x}</m>, which sits in the middle of that sample. They are therefore a little smaller, on average, than the deviations from the population mean <m>\mu</m> would be, and dividing by <m>n</m> would underestimate the population’s variance. Dividing by <m>n - 1</m> corrects this exactly, on average over all possible samples. The In depth section shows it on a population small enough to list every possible sample.` },

    { h: 'Position: z-scores and percentile ranks' },
    { p: `A <g>z-score</g> says how many standard deviations a value lies above (positive) or below (negative) the mean. The office order scores <m>(1{,}512 - ${tx(D.orders.mean)}) \\div ${tx(D.orders.sd)} \\approx ${f(zBulk, 1)}</m>: it lies ${f(zBulk, 1)} standard deviations above the mean, a position few data sets ever contain. In Excel, <x>=STANDARDIZE(1512,AVERAGE(J2:J232),STDEV.S(J2:J232))</x> gives the same number.` },
    { p: 'z-scores also compare values from groups with different centres and spreads. A <g>percentile rank</g> answers a related question without using the standard deviation at all: what percentage of the group lies below this value? Both are positions within a group, not judgements: a value can be unusual and perfectly genuine.' },

    { h: 'Shape: two rules about standard deviations' },
    { p: 'Two rules link the standard deviation to the share of data near the mean. The <g>empirical rule</g> says that for bell-shaped, symmetric data about 68% of values lie within one standard deviation of the mean, about 95% within two and about 99.7% within three. <g>Chebyshev’s inequality</g> makes a weaker promise that holds for every data set, whatever its shape: at least 75% of values lie within two standard deviations and at least 88.9% within three.' },
    { table: {
      caption: 'Share of values within k standard deviations of the mean',
      head: ['Within', 'Empirical rule (bell-shaped data)', 'Chebyshev (any data)', `Lantern’s ${n} orders`, 'The 230 without LC-10144'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: [1, 2, 3].map((k, i) => [`${k} SD`, `about ${pc(empirical[i], i === 2 ? 1 : 0)}`, k === 1 ? 'no guarantee' : `at least ${pc(cheb(k))}`, pc(kShares[i]), pc(kSharesNB[i])]),
    } },
    { p: `Lantern’s orders break the empirical rule in both directions. With the office order included, its huge deviation inflates the standard deviation to ${usd(D.orders.sd)}, so ${pc(kShares[0])} of orders lie within one standard deviation, not 68%. Without it, ${pc(kSharesNB[1])} lie within two standard deviations, short of 95%, because the long right tail of gift boxes and 1 kg bags stretches further than a bell curve would. Chebyshev’s minimums hold in every column, as they must. The rule to remember: use the empirical rule only after you have seen that the data are roughly bell-shaped, and fall back on Chebyshev when they are not.` },
  ],

  theory: [
    { h: 'Why the sample variance divides by n − 1' },
    { p: String.raw`Take a population of just three values, 2, 4 and 9 (an illustration, not Lantern data). Its mean is <m>\mu = ${f(mu, 0)}</m> and its variance, dividing by <m>N = 3</m>, is <m>\sigma^2 = (9 + 1 + 16) \div 3 \approx ${f(sig2)}</m>. Draw a sample of two values at random, one after the other, putting the first back before the second is drawn. There are nine equally likely samples. For each, the table calculates the variance both ways.` },
    { table: {
      caption: 'Every sample of two from the population {2, 4, 9}, drawn with replacement',
      head: ['Sample', 'Sample mean', 'Divide by n = 2', 'Divide by n − 1 = 1'],
      align: ['l', 'r', 'r', 'r'],
      rows: PAIRS.map(([a, b], i) => [`${a}, ${b}`, f(mean([a, b]), 1), f(byN[i], 2), f(byN1[i], 2)]),
      foot: [['Average of the nine', f(mean(PAIRS.map(mean)), 1), f(mean(byN), 2), f(mean(byN1), 2)]],
    } },
    { p: String.raw`Averaged over all possible samples, dividing by <m>n - 1</m> gives <m>${f(mean(byN1))}</m>, exactly the population variance; dividing by <m>n</m> gives <m>${f(mean(byN))}</m>, only half of it. In general the divide-by-<m>n</m> version averages <m>(n - 1) \div n</m> of <m>\sigma^2</m>: a large error for tiny samples and a negligible one for large samples, which is why STDEV.S and STDEV.P give $${f(D.orders.sd)} and $${f(D.orders.sdPop)} for the ${n} orders but differ by ${pc(1 - Math.sqrt(10 / 11))} for 11 launch events. An estimate that is right on average is called <i>unbiased</i>, so <m>s^2</m> is an unbiased estimate of <m>\sigma^2</m>. (The square root spoils this slightly: <m>s</m> is still a little low on average, but much less so than the divide-by-<m>n</m> version.)` },
    { p: String.raw`Another way to say it uses <g>degrees of freedom</g>. The <m>n</m> deviations from the sample mean must add to 0, so once you know <m>n - 1</m> of them the last is fixed: only <m>n - 1</m> are free to vary. The sample variance averages the squared deviations over those <m>n - 1</m> degrees of freedom. The same idea returns in the t, chi-square and F distributions later in the course.` },

    { h: 'Adding a constant and changing units' },
    { p: String.raw`Suppose every value is transformed as <m>y = a + bx</m>: <m>a</m> is added and <m>b</m> multiplies. Measures of centre and position follow the transformation: <m>\bar{y} = a + b\bar{x}</m>, and the median and quartiles move the same way. Measures of spread ignore <m>a</m> and scale by <m>|b|</m>: <m>s_y = |b| s_x</m>, and the <g>interquartile range</g> (IQR) likewise, while the variance scales by <m>b^2</m>. z-scores, skewness and kurtosis don’t change at all when <m>b</m> is positive, because they are measured in standard deviations.` },
    { p: `Two Lantern illustrations. If Ana had added a flat $5.20 delivery charge to every spring order (a hypothetical), the mean would rise from ${usd(D.orders.mean)} to ${usd(D.orders.mean + 5.2)} and the median from ${usd(D.orders.median)} to ${usd(D.orders.median + 5.2)}, but the standard deviation and the IQR would stay at ${usd(D.orders.sd)} and ${usd(D.orders.q3 - D.orders.q1)}. And the ${D.kg.n} Kilnworth bags she weighed in October average ${kgMean.toLocaleString('en-US', { minimumFractionDigits: 2 })} g with a standard deviation of ${f(kgSd)} g: in kilograms (<m>b = 1 \\div 1{,}000</m>) that is ${f(kgMean / 1000, 5)} kg and ${f(kgSd / 1000, 5)} kg, and as overfill above the label (<m>y = x - 1{,}000</m>) it is ${f(kgMean - 1000)} g and still ${f(kgSd)} g.` },

    { h: 'The coefficient of variation' },
    { p: String.raw`A standard deviation is in the data’s units, so it can’t compare the spread of groups with very different means, or of variables in different units. The <g>coefficient of variation</g> (CV) divides the standard deviation by the mean: <m>\text{CV} = s \div \bar{x}</m>, usually written as a percentage. It measures spread relative to the size of the values. For Ana’s catering, launches vary by ${pc(LS.cv)} of their mean per guest-day and meetings by ${pc(MS.cv)}: meetings are three times as variable, relative to what they charge.` },
    { p: `The CV only makes sense for a variable measured from a true zero (a ratio scale, in B01’s terms) with a positive mean, such as money, weight or time. Kilnworth’s bag weights have a CV of ${pc(kgSd / kgMean, 2)}: they vary little relative to their size. The same bags’ overfill above 1,000 g has a CV of ${pc(kgSd / (kgMean - 1000), 0)}, although nothing about the bags has changed. Overfill has no true zero and can be negative (${D.kg.underLabel} of the ${D.kg.n} bags were under 1,000 g); moving the zero changed the mean but not the standard deviation, so the ratio means little. Don’t compute a CV for temperatures in °C, z-scores, profits that can be negative, or ratings.` },

    { h: 'Percentiles and percentile ranks' },
    { p: String.raw`A <g>percentile</g> (B03) goes from a percentage to a value: the 90th percentile of order values is the value with 90% of orders at or below it. A percentile rank goes the other way, from a value to a percentage. OpenStax’s <i>Introductory Business Statistics</i> uses <m>(B + 0.5E) \div n \times 100</m>, where <m>B</m> is the number of values below the one you are ranking and <m>E</m> the number equal to it. Excel’s <x>=PERCENTRANK.INC(array,x)</x> returns a fraction instead: for a value in the data, it is the number of values below it divided by <m>n - 1</m>. Without ties, that is the share of the <i>other</i> values that lie below it.` },
    { p: `Excel cuts PERCENTRANK.INC off at three digits unless you ask for more, rather than rounding: Microsoft’s own example returns 0.555 for 5 ÷ 9. Counting gives the same fraction without the truncation: <x>=COUNTIF(B2:B29,"<"&E2)/(COUNT(B2:B29)-1)</x>. For a value that isn’t in the data, PERCENTRANK.INC interpolates between its neighbours, which counting doesn’t. Microsoft’s page doesn’t say how ties are treated; the worksheets on this site count only the values strictly below, as in the definition above.` },
    { p: `With many ties the two definitions of a percentile rank can disagree badly. ${cumBelow4} of the ${R.length} star ratings are below 4 and ${rc[3]} equal 4, so a 4-star rating sits at the ${f((cumBelow4 + 0.5 * rc[3]) / R.length * 100, 0)}th percentile by OpenStax’s formula and at ${f(Math.floor(cumBelow4 / (R.length - 1) * 1000) / 1000, 3)} by PERCENTRANK.INC (${cumBelow4} ÷ ${R.length - 1} = ${f(cumBelow4 / (R.length - 1), 4)}, cut to three digits). State the method whenever ties are common.` },

    { h: 'The five-number summary and box plots' },
    { p: 'The <g>five-number summary</g> is the minimum, the first quartile, the median, the third quartile and the maximum. It shows the centre, the spread of the middle half and the reach of both tails, and it is what a box plot draws, as B03’s <g>box and whisker chart</g> did. The table and the figure compare Ana’s five kinds of catering event by invoice per guest-day (a two-day event counts its guests on both days).' },
    { table: {
      caption: 'Invoice per guest-day by event type, Lantern’s 76 catering events of 2026 (quartiles by QUARTILE.INC)',
      head: ['Type', 'Events', 'Mean', 'SD', 'CV', 'Min', 'Q1', 'Median', 'Q3', 'Max'],
      align: ['l', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r'],
      rows: T.map((t) => { const b = ST[t]; return [t, String(b.n), usd(b.mean), usd(b.sd), pc(b.cv), usd(b.min), usd(b.q1), usd(b.median), usd(b.q3), usd(b.max)]; }),
    } },
    { figure: {
      svg: boxFigure(),
      caption: `Box plots of invoice per guest-day by event type. Each box runs from Q1 to Q3 with a thick line at the median; the cross marks the mean; whiskers reach the furthest values inside the 1.5 × IQR fences, and circles are values beyond them (${outText}).`,
      alt: `Five horizontal box plots on a shared axis from $6 to $18 per guest-day. ${T.map((t) => { const b = ST[t]; return `${t} (${b.n} events): box from ${usd(b.q1)} to ${usd(b.q3)}, median ${usd(b.median)}, mean ${usd(b.mean)}, whiskers from ${usd(b.wlo)} to ${usd(b.whi)}${b.out.length ? `, with ${['no values', 'one value', 'two values', 'three values'][b.out.length]} drawn separately at ${b.out.map((v) => usd(v)).join(' and ')}` : ''}.`; }).join(' ')} Team days sit highest; launches have the narrowest box and whiskers.`,
    } },
    { p: `Read the picture before the table. Team days charge most per guest (median ${usd(TD.median)}) and launches least and most consistently (median ${usd(LS.median)}, the narrowest box). Meetings have a modest median, ${usd(MS.median)}, but a long right whisker and two <g>outlier</g>s: their mean, ${usd(MS.mean)}, sits well above it. Every outlier lies on the high side, and the next section explains why.` },

    { h: 'Skewness and kurtosis' },
    { p: `Excel’s SKEW measures <g>skewness</g>. It cubes each value’s z-score, so values far out on one side dominate it: positive for a long right tail, negative for a long left one, near 0 for symmetric data (B02, B03). The meetings’ SKEW is ${f(MS.skew)}, and their mean is above their median, the usual sign of a right tail. The tail has a business cause: invoices include a fixed set-up charge and a minimum, so the smallest events pay most per guest. ${smallMeeting[evCol('event_id')]}, the meeting at ${usd(MS.max)} per guest, had ${smallMeeting[evCol('guests')]} guests, the fewest of any meeting.` },
    { p: `KURT, Excel’s excess <g>kurtosis</g>, uses fourth powers and is about 0 for normally distributed data. Microsoft’s page describes it as the “relative peakedness or flatness” of a distribution, but Westfall (2014) showed that kurtosis says almost nothing about the peak: it measures how extreme the tails are, that is, how prone the data are to outliers. Lantern’s orders have a KURT of ${f(D.orders.kurtosis, 1)} because of one order, not because of a sharp peak. Read a large KURT as “check the extremes”.` },

    { h: 'Describing a categorical variable' },
    { p: `For a <g>categorical variable</g> the summaries are counts, proportions and the <g>mode</g>. Of the ${n} spring orders, ${web} came through the web shop and ${app} through the app, proportions of ${f(web / n, 3)} and ${f(app / n, 3)}; the mode is web. A 0/1 variable is a special case: the mean of Lantern’s subscription flags, 1 for a subscription order and 0 otherwise, is ${f(mean(SUBSCRIPTION_FLAGS), 3)}, the proportion of subscription orders (${D.orders.subscriptions} of ${n}). That is why later lessons treat a proportion as the mean of a 0/1 variable.` },
    { table: {
      caption: `Star ratings of the ${R.length} rated spring orders`,
      head: ['Stars', '1', '2', '3', '4', '5', 'Total'],
      align: ['l', 'r', 'r', 'r', 'r', 'r', 'r'],
      rows: [['Ratings', ...rc.map(String), String(R.length)], ['Proportion', ...rc.map((c) => f(c / R.length, 3)), '1.000']],
    } },
    { p: `Ratings are ordinal, so the median and percentiles are meaningful while the mean, ${f(D.orders.meanRating)}, is a convenience that assumes equal steps between stars (B01). The mode is 5 stars, and the median is 4: the 77th and 78th of the ${R.length} sorted ratings both fall among the 4s, which run from position ${cumBelow4 + 1} to ${cumBelow4 + rc[3]}. The table tells more than any one number: ${pc((rc[3] + rc[4]) / R.length, 0)} of rated orders got 4 or 5 stars, and ${pc((rc[0] + rc[1]) / R.length, 0)} got 1 or 2.` },

    { h: 'Comparing groups side by side' },
    { list: [
      'Use the same summaries, the same quartile method and the same scale for every group, and show each group’s size: a mean of 13 events and a mean of 28 don’t carry the same weight.',
      'Match the summary to the shape. For roughly symmetric groups the mean and standard deviation describe them; for skewed groups, or groups with outliers, add the median and IQR.',
      'Use relative measures to compare spread across groups of different size or units: the CV, the IQR as a share of the median for skewed groups, or z-scores within each group.',
      'Describing a difference is not testing it. Whether team days really earn more per guest than launches, or only did in these 76 events, is the question of ANOVA in module 4.',
    ] },
  ],

  formulas: [
    { id: 'dd-means', name: 'Population mean and sample mean',
      tex: String.raw`\mu = \dfrac{\sum_{i=1}^{N} x_i}{N}, \qquad \bar{x} = \dfrac{\sum_{i=1}^{n} x_i}{n}`,
      where: [[String.raw`x_i`, 'The i-th value', 'units of x'], [String.raw`N`, 'Number of values in the population', ''], [String.raw`n`, 'Number of values in the sample', ''], [String.raw`\mu`, 'Population mean (a parameter)', 'units of x'], [String.raw`\bar{x}`, 'Sample mean (a statistic): AVERAGE', 'units of x']],
      note: 'The arithmetic is the same; the symbol says whether the values are the whole population or a sample from it.' },
    { id: 'dd-variance', name: 'Population and sample variance and standard deviation',
      tex: String.raw`\sigma^2 = \dfrac{\sum (x_i - \mu)^2}{N}, \qquad s^2 = \dfrac{\sum (x_i - \bar{x})^2}{n - 1}, \qquad s = \sqrt{s^2}`,
      where: [[String.raw`x_i`, 'The i-th value', 'units of x'], [String.raw`\mu, \bar{x}`, 'Population and sample means', 'units of x'], [String.raw`N, n`, 'Population and sample sizes', ''], [String.raw`\sigma^2, s^2`, 'Population variance (VAR.P) and sample variance (VAR.S)', 'units of x squared'], [String.raw`s`, 'Sample standard deviation (STDEV.S); σ is STDEV.P', 'units of x']],
      assumptions: 'The numerator is the sum of squares, DEVSQ in Excel.',
      note: 'Dividing by n − 1, the degrees of freedom, makes s² an unbiased estimate of σ².' },
    { id: 'dd-cv', name: 'Coefficient of variation',
      tex: String.raw`\text{CV} = \dfrac{s}{\bar{x}} \times 100\%`,
      where: [[String.raw`s`, 'Sample standard deviation', 'units of x'], [String.raw`\bar{x}`, 'Sample mean (must be positive)', 'units of x'], [String.raw`\text{CV}`, 'Spread relative to the mean', '%']],
      assumptions: 'A ratio-scale variable (a true zero) with a positive mean.',
      note: 'In Excel: <x>=STDEV.S(range)/AVERAGE(range)</x>, formatted as a percentage.' },
    { id: 'dd-z', name: 'z-score',
      tex: String.raw`z = \dfrac{x - \bar{x}}{s} \quad \text{(sample)}, \qquad z = \dfrac{x - \mu}{\sigma} \quad \text{(population)}`,
      where: [[String.raw`x`, 'The value being located', 'units of x'], [String.raw`\bar{x}, s`, 'Sample mean and standard deviation', 'units of x'], [String.raw`\mu, \sigma`, 'Population mean and standard deviation', 'units of x'], [String.raw`z`, 'Standard deviations above (+) or below (−) the mean', '']],
      note: 'In Excel: <x>=STANDARDIZE(x,mean,standard_dev)</x>.' },
    { id: 'dd-linear', name: 'Adding a constant and multiplying',
      tex: String.raw`y = a + bx \;\Rightarrow\; \bar{y} = a + b\bar{x}, \qquad s_y = |b|\, s_x, \qquad s_y^2 = b^2 s_x^2`,
      where: [[String.raw`x`, 'The original values', 'units of x'], [String.raw`y`, 'The transformed values', 'units of y'], [String.raw`a`, 'The constant added', 'units of y'], [String.raw`b`, 'The multiplier (a change of units)', 'units of y per unit of x'], [String.raw`s_x, s_y`, 'Standard deviations before and after', 'their units']],
      note: 'The median and quartiles transform like the mean; the IQR like the standard deviation. z-scores, SKEW and KURT are unchanged when b > 0.' },
    { id: 'dd-chebyshev', name: 'Chebyshev’s inequality',
      tex: String.raw`\text{share within } k \text{ SDs of the mean} \;\geq\; 1 - \dfrac{1}{k^2}, \qquad k > 1`,
      where: [[String.raw`k`, 'Distance from the mean in standard deviations', '']],
      assumptions: 'None about shape: it holds for every data set and every distribution.',
      note: 'k = 2 gives at least 75%, k = 3 at least 88.9%. Equivalently, at most 1 ÷ k² of the values lie k or more SDs from the mean.' },
    { id: 'dd-prank', name: 'Percentile rank',
      tex: String.raw`\text{percentile rank} = \dfrac{B + 0.5E}{n} \times 100, \qquad \text{PERCENTRANK.INC} = \dfrac{B}{n - 1}`,
      where: [[String.raw`B`, 'Number of values below the one being ranked', ''], [String.raw`E`, 'Number of values equal to it (itself included)', ''], [String.raw`n`, 'Number of values', '']],
      note: 'The first is OpenStax’s formula; the second is Excel’s PERCENTRANK.INC for a value that appears in the data, which Excel cuts to three digits (not rounded) unless you give a third argument. They differ most when there are many ties.' },
  ],

  examples: [
    { level: 'simple', title: 'Spread of the launch events, by hand and in Excel', fictional: true,
      setup: `Ana’s ${L.length} product launches of 2026 earned these invoices per guest-day, in B2:B12: ${L.map((v) => usd(v)).join(', ')}. Calculate the mean, the sum of squares, the sample variance, the standard deviation and the coefficient of variation.`,
      steps: [
        String.raw`Mean: <m>\bar{x} = ${tx(sum(L))} \div ${L.length} = ${tx(LS.mean)}</m> dollars, or <x>=AVERAGE(B2:B12)</x>.`,
        String.raw`Deviations from 9.00: ${L.map((v) => (v - 9 < 0 ? '−' : '+') + f(Math.abs(v - 9))).join(', ')}. They add to 0, as deviations from a mean always do. Squared and added, they give the sum of squares <m>${f(devsq(L), 4)}</m>, which is <x>=DEVSQ(B2:B12)</x>.`,
        String.raw`Sample variance: <m>s^2 = ${f(devsq(L), 4)} \div (${L.length} - 1) = ${f(devsq(L) / 10, 5)}</m> dollars squared (<x>=VAR.S(B2:B12)</x>). Standard deviation: <m>s = \sqrt{${f(devsq(L) / 10, 5)}} \approx ${f(LS.sd, 4)}</m> dollars (<x>=STDEV.S(B2:B12)</x>).`,
        String.raw`Coefficient of variation: <m>${f(LS.sd, 4)} \div ${tx(LS.mean)} \approx ${f(LS.cv, 4)}</m>, or ${pc(LS.cv)}: <x>=STDEV.S(B2:B12)/AVERAGE(B2:B12)</x>.`,
      ],
      answer: `Mean ${usd(LS.mean)}, sum of squares ${f(devsq(L), 4)}, sample variance ${f(devsq(L) / 10, 4)}, standard deviation ${usd(LS.sd)}, CV ${pc(LS.cv)}.`,
      interpretation: `A typical launch was within about 68 cents of $9.00 per guest-day: launches are Ana’s most predictable events per guest. The 11 launches stand for her launch catering in general, so the sample formulas (n − 1) are the right ones; dividing by 11 would give a standard deviation of ${usd(Math.sqrt(devsq(L) / 11))}.` },

    { level: 'challenging', title: 'Which high invoice is more unusual?', fictional: true,
      setup: `Two events stand out in Ana’s 2026 catering: a meeting at ${usd(MS.max)} per guest-day and a team day at ${usd(TD.max)}. Meetings averaged ${usd(MS.mean)} (SD ${usd(MS.sd)}, ${MS.n} events) and team days ${usd(TD.mean)} (SD ${usd(TD.sd)}, ${TD.n} events). Which value is more unusual within its own type, and what explains both?`,
      steps: [
        String.raw`z for the meeting: <m>(${tx(MS.max)} - ${tx(MS.mean)}) \div ${tx(MS.sd)} \approx ${f(zMeet)}</m>. z for the team day: <m>(${tx(TD.max)} - ${tx(TD.mean)}) \div ${tx(TD.sd)} \approx ${f(zTeam)}</m>. In Excel, <x>=STANDARDIZE(17.14,AVERAGE(B2:B29),STDEV.S(B2:B29))</x> for the meetings in B2:B29.`,
        `Compare positions, not dollars. The team day is $${f(TD.max - TD.mean)} above its mean and the meeting $${f(MS.max - MS.mean)} above its own, but the meeting is ${f(zMeet, 1)} standard deviations out against the team day’s ${f(zTeam, 1)}. Within its type the meeting is the more unusual value.`,
        `Check with ranks, which don’t depend on the standard deviation: each is the highest of its type, so both have a PERCENTRANK.INC of 1. Ranks can’t separate them here; z-scores can, because they also measure how far beyond the rest each one lies.`,
        `Check for masking (B02). The meeting’s own value inflates the meetings’ standard deviation: without it, the other ${MS.n - 1} meetings have mean ${usd(mean(M.filter((v) => v !== MS.max)))} and SD ${usd(sd(M.filter((v) => v !== MS.max)))}, and ${usd(MS.max)} would be ${f((MS.max - mean(M.filter((v) => v !== MS.max))) / sd(M.filter((v) => v !== MS.max)), 1)} standard deviations above them.`,
        `Explain before judging. ${smallMeeting[evCol('event_id')]} had ${smallMeeting[evCol('guests')]} guests and ${smallTeam[evCol('event_id')]} had ${smallTeam[evCol('guests')]}, the smallest of their types. Ana’s quotes include a fixed set-up charge and a minimum invoice, so a small event pays more per guest.`,
      ],
      answer: `The meeting (z ≈ ${f(zMeet)}) is more unusual within its type than the team day (z ≈ ${f(zTeam)}). Both are genuine: they are the smallest events of their types.`,
      interpretation: 'A z-score locates a value; it doesn’t say whether the value is wrong or what caused it. Here the cause is a fixed charge spread over few guests, which also explains why every outlier in the box plots is on the high side. For pricing, Ana should describe per-guest invoices by event size as well as by type.' },

    { level: 'applied', title: 'How to quote a per-guest guide for each event type', fictional: true,
      setup: 'Ana wants a one-line guide per event type for her 2027 price note (“meetings typically run about $X per guest-day, usually between $Y and $Z”). Using the summary table above, which centre and range should she quote for each type, and for which types should she add a caution?',
      steps: [
        `Look at shape first. Launches and breakfasts have medians close to their means (${usd(LS.median)} against ${usd(LS.mean)}; ${usd(ST.Breakfast.median)} against ${usd(ST.Breakfast.mean)}) and no outliers, so mean or median serves. Meetings, team days and conferences have means above their medians and high outliers.`,
        `Quote the median and the middle half (Q1 to Q3) for every type, so that the note uses one method throughout: for meetings, ${usd(MS.median)}, usually between ${usd(MS.q1)} and ${usd(MS.q3)}; for team days, ${usd(TD.median)}, between ${usd(TD.q1)} and ${usd(TD.q3)}; for launches, ${usd(LS.median)}, between ${usd(LS.q1)} and ${usd(LS.q3)}.`,
        `Measure how tight each guide is with a spread that ignores the outliers the guide leaves out: the IQR as a share of the median: ${byIqr.map((t) => `${PLURAL[t]} ${pc(ST[t].iqr / ST[t].median)}`).join(', ')}. The CV answers a different question, since the outliers inflate it: where a quote far outside the range is most likely. Meetings (${pc(MS.cv)}, one event in 28 at ${usd(MS.max)}) and team days (${pc(TD.cv)}) lead on that measure.`,
        `Add the cause as a caution: small events cost more per guest because of the fixed set-up charge and minimum. No meeting had fewer than ${minMeetingGuests} guests; under the $${QUOTE.minimum} minimum invoice a 20-guest meeting would pay at least ${usd(QUOTE.minimum / 20)} per guest, far above the quoted range.`,
      ],
      answer: `Quote the median and Q1–Q3 for each type (meetings ${usd(MS.median)}, ${usd(MS.q1)}–${usd(MS.q3)}). Launches and conferences have the tightest ranges; breakfasts the widest typical range (IQR ${pc(ST.Breakfast.iqr / ST.Breakfast.median)} of the median); meetings and team days the most extreme exceptions, all from small events.`,
      interpretation: 'The medians and quartiles resist the few small, expensive events. The IQR relative to the median says how tight each typical range is, and the CV, which the outliers inflate, says where an exception is most likely. These are descriptions of 76 past events: whether team days really earn more per guest than launches, rather than by chance in this year’s mix, is a question for ANOVA in module 4.' },
  ],

  demo: [
    { widget: 'dd-orders', intro: 'The 231 spring order values. Choose the |z| > 3 rule and compare it with the 1.5 × IQR rule: the z rule flags only the $1,512 office order, whose own size inflates the standard deviation used to judge it, while the quartile rule flags every order above its upper fence. Switch to a log scale and the right tail shrinks.' },
    { widget: 'dd-sheet', intro: 'Ana’s 28 meetings with live summaries. B23 holds EV-047, the 35-guest meeting at $17.14 per guest-day. Change it to 10 and watch which statistics move (the mean a little; the standard deviations, CV, skewness and kurtosis by a quarter to a third) and which barely move (the median, the quartiles and the trimmed mean). E18 is a value to locate: change it to see its z-score, the share of the other meetings below it (E20, by counting) and Excel’s PERCENTRANK.INC (E21), which agrees, cut to three digits, when E18 is one of the meetings and interpolates otherwise.' },
  ],

  mistakes: [
    { title: '“Dividing by n or by n − 1 makes no real difference.”', html: 'For 231 orders the two standard deviations differ by about 0.2%; for 11 launches, by almost 5%. More important, dividing by n underestimates σ² on average over all samples, because a sample’s deviations are measured from its own mean. Use STDEV.S and VAR.S for samples, and the .P versions only when the values are the whole population you describe.' },
    { title: '“About 95% of any data lie within two standard deviations of the mean.”', html: 'That is the empirical rule, and it holds only for roughly bell-shaped data. Lantern’s skewed orders have 99.6% within two standard deviations with the office order and 91.7% without it. For data of unknown or skewed shape, only Chebyshev’s guarantee holds: at least 75%.' },
    { title: '“A z-score above 3 means the value is an error.”', html: 'A z-score measures position. The meeting at $17.14 per guest-day (z ≈ 3.5) is genuine: a small event paying a fixed set-up charge. Investigate a flagged value before deciding what it is, as B02 did with the office order.' },
    { title: '“Kurtosis measures how peaked a distribution is.”', html: 'Microsoft’s description says so, but kurtosis is driven almost entirely by the tails (Westfall, 2014). A large KURT says the data contain, or are prone to, extreme values.' },
    { title: '“The coefficient of variation compares the spread of any two variables.”', html: 'Only for ratio-scale variables with a positive mean. Kilnworth’s bags have a CV of 0.26% as weights but 97% as overfill above 1,000 g: shifting the zero changed the mean and so the ratio, and overfill can be negative (5 of the 40 bags were under 1,000 g), so it has no true zero. Don’t compute a CV for ratings, temperatures in °C or values that can be negative.' },
  ],

  application: [
    { p: 'Every inference in this course starts from a description, and professionals describe before they test. A revenue manager comparing hotels, a quality engineer checking a filling line, a charity comparing donation sizes by channel: each first reports the size of each group, a centre and a spread that suit its shape, and anything extreme, and only then asks whether a difference is real. Skipping the description is how analysts end up testing a mean that one record dominates.' },
    { p: 'Service promises are often stated as percentiles rather than means, because customers experience the tail: “90% of orders dispatched within 24 hours” is a statement about the 90th percentile. For the same reason a z-score or a percentile rank is a better way to tell a manager how unusual a week was than the raw number: “the second-busiest week of the year” or “2.4 standard deviations above a typical week”.' },
    { case: `Ana’s price note for 2027 gives each event type a median per guest-day and its middle half, with a line on reliability: “Launches and conferences fall in tight ranges; breakfasts vary most from one to the next; meetings and team days have the most extreme exceptions (CV ${pc(MS.cv, 0)} and ${pc(TD.cv, 0)}), because small events cost more per guest.” For the shop she reports the median order (${usd(D.orders.median)}) beside the mean, and notes that LC-10144 lies ${f(zBulk, 1)} standard deviations above the mean: by Chebyshev, no more than one of the ${n} orders could be that far out.` },
    { p: 'Two habits make these descriptions trustworthy. Say what each number includes (all events or one-day events, with or without the office order, which quartile method), and give the size of every group. A summary that can’t be reproduced, or that hides a group of three behind a percentage, invites the wrong decision.' },
  ],

  summary: [
    'A parameter describes a population (μ, σ, N, p); a statistic describes a sample (x̄, s, n, p̂). Whether data are a population or a sample depends on the question.',
    'The sample variance divides the sum of squares (DEVSQ) by n − 1, the degrees of freedom, which makes it unbiased; STDEV.S and VAR.S do this, STDEV.P and VAR.P divide by n.',
    'The mean is the balance point and sensitive to extremes; the median and the trimmed mean (TRIMMEAN, whose percent is the total excluded) resist them.',
    'Adding a constant moves the centre but not the spread; multiplying by b scales the centre by b and the spread by |b|. z-scores, SKEW and KURT don’t change when b > 0.',
    'The coefficient of variation, s ÷ x̄, compares relative spread, but only on ratio scales with a positive mean.',
    'z-scores (STANDARDIZE) and percentile ranks (PERCENTRANK.INC, or COUNTIF ÷ (n − 1)) locate a value within its group; neither says whether the value is wrong.',
    'The empirical rule (68%, 95%, 99.7%) needs bell-shaped data; Chebyshev’s inequality (at least 1 − 1/k²) holds for any data.',
    'Describe shape with the five-number summary, box plots, SKEW and KURT (tails, not peakedness); describe categories with counts, proportions and the mode.',
  ],

  glossary: [
    { term: 'Parameter', def: 'A number that describes a population, such as its mean μ, standard deviation σ or proportion p. It is usually unknown and is estimated from a sample.' },
    { term: 'Statistic', def: 'A number calculated from a sample, such as its mean x̄, standard deviation s or proportion p̂, often used to estimate a parameter. It varies from one sample to another.' },
    { term: 'Sum of squares', def: 'The total of the squared deviations of values from their mean, Σ(x − x̄)²; Excel’s DEVSQ. Dividing it by n − 1 gives the sample variance.' },
    { term: 'Degrees of freedom', def: 'The number of values in a calculation that are free to vary. For a sample variance it is n − 1, because the deviations from the sample mean must add to 0.' },
    { term: 'Trimmed mean', def: 'The mean of the values left after a fixed share is removed from each end of the sorted data. Excel’s TRIMMEAN(array, percent) removes percent of the values in total (rounded down to an even number of values), half from each end.' },
    { term: 'Coefficient of variation', def: 'The standard deviation divided by the mean, usually as a percentage: spread relative to the size of the values. Meaningful only for ratio-scale variables with a positive mean.' },
    { term: 'Percentile rank', def: 'The percentage of values in a data set that lie below a given value (with a stated rule for ties). Excel’s PERCENTRANK.INC gives a related fraction: the values below it ÷ (n − 1), cut to three digits.' },
    { term: 'Empirical rule', def: 'For bell-shaped, symmetric data, about 68% of values lie within one standard deviation of the mean, about 95% within two and about 99.7% within three.' },
    { term: 'Chebyshev’s inequality', def: 'For any data set or distribution, at least 1 − 1/k² of the values lie within k standard deviations of the mean (k > 1): at least 75% within two and 88.9% within three.' },
    { term: 'Five-number summary', def: 'The minimum, first quartile, median, third quartile and maximum of a data set: the values a box plot draws.' },
  ],

  references: [
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Business Statistics 2e</i>, section 2.7, “Measures of the Spread of the Data” (n − 1, Chebyshev’s rule, the empirical rule, the coefficient of variation, z-scores). OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/2-7-measures-of-the-spread-of-the-data', checked: '2026-10-24' },
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Business Statistics 2e</i>, section 2.2, “Measures of the Location of the Data” (percentiles and the percentile of a value). OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/2-2-measures-of-the-location-of-the-data', checked: '2026-10-24' },
    { text: 'Microsoft Support. “TRIMMEAN function”, with the pages for DEVSQ and STANDARDIZE.', url: 'https://support.microsoft.com/en-us/office/trimmean-function-d90c9878-a119-4746-88fa-63d988f511d3', checked: '2026-10-24' },
    { text: 'Microsoft Support. “PERCENTRANK.INC function”.', url: 'https://support.microsoft.com/en-us/office/percentrank-inc-function-149592c9-00c0-49ba-86c1-c1f45b80463a', checked: '2026-10-24' },
    { text: 'Microsoft Support. “KURT function”, with the page for SKEW.', url: 'https://support.microsoft.com/en-us/office/kurt-function-bc3a265c-5da4-4dcb-b7fd-c237789095ab', checked: '2026-10-24' },
    { text: 'Westfall, P. H. (2014). “Kurtosis as Peakedness, 1905–2014. R.I.P.” <i>The American Statistician</i>, 68(3), 191–195. doi:10.1080/00031305.2014.917055.', url: 'https://ideas.repec.org/a/taf/amstat/v68y2014i3p191-195.html', checked: '2026-10-24' },
  ],

  checks: [
    { what: 'TRIMMEAN 10% drops (even)', value: trimK, shown: 22 },
    { what: 'TRIMMEAN drops from each end', value: trimK / 2, shown: 11 },
    { what: 'Bags under 1,000 g', value: D.kg.underLabel, shown: 5 },
    { what: 'IQR/median launches %', value: LS.iqr / LS.median * 100, shown: 9.5, tol: 0.05 },
    { what: 'IQR/median conferences %', value: ST.Conference.iqr / ST.Conference.median * 100, shown: 12.5, tol: 0.05 },
    { what: 'IQR/median meetings %', value: MS.iqr / MS.median * 100, shown: 20.6, tol: 0.05 },
    { what: 'IQR/median team days %', value: TD.iqr / TD.median * 100, shown: 20.7, tol: 0.05 },
    { what: 'IQR/median breakfasts %', value: ST.Breakfast.iqr / ST.Breakfast.median * 100, shown: 25.8, tol: 0.05 },
    { what: 'Breakfasts widest IQR/median', value: byIqr[byIqr.length - 1] === 'Breakfast' ? 1 : 0, shown: 1 },
    { what: 'Launches tightest IQR/median', value: byIqr[0] === 'Launch' ? 1 : 0, shown: 1 },
    { what: 'Conferences second tightest', value: byIqr[1] === 'Conference' ? 1 : 0, shown: 1 },
    { what: 'Two meeting outliers', value: MS.out.length, shown: 2 },
    // orders
    { what: 'Orders', value: n, shown: 231 },
    { what: 'Mean order', value: D.orders.mean, shown: 39.38 },
    { what: 'Median order', value: D.orders.median, shown: 19.50 },
    { what: 'SD of orders (sample)', value: D.orders.sd, shown: 100.90 },
    { what: 'SD of orders (population)', value: D.orders.sdPop, shown: 100.68 },
    { what: 'Office order', value: D.orders.max, shown: 1512 },
    { what: 'TRIMMEAN 10%', value: trim10, shown: 30.03 },
    { what: 'TRIMMEAN matches the case data (209 values kept)', value: (() => { let k = Math.floor(n * 0.1); k -= k % 2; return n - k; })(), shown: 209 },
    { what: 'z of the office order', value: zBulk, shown: 14.6, tol: 0.05 },
    { what: 'z of the office order from rounded figures', value: (1512 - 39.38) / 100.9, shown: 14.6, tol: 0.05 },
    { what: 'Empirical rule 1 SD', value: empirical[0] * 100, shown: 68, tol: 0.5 },
    { what: 'Empirical rule 2 SD', value: empirical[1] * 100, shown: 95, tol: 0.5 },
    { what: 'Empirical rule 3 SD', value: empirical[2] * 100, shown: 99.7, tol: 0.05 },
    { what: 'Chebyshev 2 SD', value: cheb(2) * 100, shown: 75 },
    { what: 'Chebyshev 3 SD', value: cheb(3) * 100, shown: 88.9, tol: 0.05 },
    { what: 'Orders within 1 SD', value: kShares[0] * 100, shown: 99.1, tol: 0.05 },
    { what: 'Orders within 2 SD', value: kShares[1] * 100, shown: 99.6, tol: 0.05 },
    { what: 'Orders within 3 SD', value: kShares[2] * 100, shown: 99.6, tol: 0.05 },
    { what: 'Without bulk within 1 SD', value: kSharesNB[0] * 100, shown: 87.8, tol: 0.05 },
    { what: 'Without bulk within 2 SD', value: kSharesNB[1] * 100, shown: 91.7, tol: 0.05 },
    { what: 'Without bulk within 3 SD', value: kSharesNB[2] * 100, shown: 98.7, tol: 0.05 },
    { what: 'Without bulk: 230 orders', value: NB.length, shown: 230 },
    { what: 'Chebyshev: at most one order 14.6 SDs out', value: Math.floor(n / zBulk ** 2), shown: 1 },
    { what: 'Order IQR', value: D.orders.q3 - D.orders.q1, shown: 23.60 },
    { what: 'Mean with $5.20 charge', value: D.orders.mean + 5.2, shown: 44.58 },
    { what: 'Median with $5.20 charge', value: D.orders.median + 5.2, shown: 24.70 },
    { what: 'Order SD within 0.2%', value: (D.orders.sd / D.orders.sdPop - 1) * 100, shown: 0.2, tol: 0.05 },
    // n − 1 demonstration
    { what: 'Demo population mean', value: mu, shown: 5 },
    { what: 'Demo population variance', value: sig2, shown: 8.67 },
    { what: 'Demo sum of squared deviations', value: 9 + 1 + 16, shown: devsq(POP) },
    { what: 'Demo average divide-by-n', value: mean(byN), shown: 4.33 },
    { what: 'Demo average divide-by-(n − 1)', value: mean(byN1), shown: 8.67 },
    { what: 'Demo divide-by-(n − 1) equals sigma²', value: mean(byN1), shown: sig2, tol: 1e-12 },
    { what: 'Demo divide-by-n is half', value: mean(byN) / sig2, shown: 0.5, tol: 1e-12 },
    { what: 'Demo average of sample means', value: mean(PAIRS.map(mean)), shown: 5 },
    { what: 'Demo samples', value: PAIRS.length, shown: 9 },
    { what: 'SD gap for 11 launches (%)', value: (1 - Math.sqrt(10 / 11)) * 100, shown: 4.7, tol: 0.05 },
    { what: 'SD gap: almost 5%', value: (1 - Math.sqrt(10 / 11)) * 100, shown: 5, tol: 0.5 },
    // Kilnworth
    { what: 'Bags weighed', value: D.kg.n, shown: 40 },
    { what: 'Bag mean (g)', value: kgMean, shown: 1002.75 },
    { what: 'Bag SD (g)', value: kgSd, shown: 2.66 },
    { what: 'Bag mean (kg)', value: kgMean / 1000, shown: 1.00275, tol: 0.000005 },
    { what: 'Bag SD (kg)', value: kgSd / 1000, shown: 0.00266, tol: 0.000005 },
    { what: 'Overfill mean (g)', value: kgMean - 1000, shown: 2.75 },
    { what: 'Bag CV (%)', value: kgSd / kgMean * 100, shown: 0.26, tol: 0.006 },
    { what: 'Overfill CV (%)', value: kgSd / (kgMean - 1000) * 100, shown: 97, tol: 0.5 },
    // event types
    { what: 'Event types', value: T.length, shown: 5 },
    { what: 'Events', value: sum(T.map((t) => ST[t].n)), shown: 76 },
    { what: 'Launches', value: LS.n, shown: 11 },
    { what: 'Meetings', value: MS.n, shown: 28 },
    { what: 'Team days', value: TD.n, shown: 11 },
    { what: 'Launch mean', value: LS.mean, shown: 9.00 },
    { what: 'Launch total', value: sum(L), shown: 99.00 },
    { what: 'Launch deviations add to 0', value: sum(L.map((v) => v - LS.mean)), shown: 0, tol: 1e-9 },
    { what: 'Launch DEVSQ', value: devsq(L), shown: 4.5996, tol: 0.00005 },
    { what: 'Launch variance (5 dp)', value: devsq(L) / 10, shown: 0.45996, tol: 0.000005 },
    { what: 'Launch variance (4 dp)', value: variance(L), shown: 0.4600, tol: 0.00005 },
    { what: 'Launch SD', value: LS.sd, shown: 0.6782, tol: 0.00005 },
    { what: 'Launch SD $', value: LS.sd, shown: 0.68 },
    { what: 'Launch CV', value: LS.cv, shown: 0.0754, tol: 0.00005 },
    { what: 'Launch CV %', value: LS.cv * 100, shown: 7.5, tol: 0.05 },
    { what: 'Launch SD dividing by 11', value: Math.sqrt(devsq(L) / 11), shown: 0.65 },
    { what: 'Launch median', value: LS.median, shown: 9.08 },
    { what: 'Launch Q1', value: LS.q1, shown: 8.58 },
    { what: 'Launch Q3', value: LS.q3, shown: 9.45, tol: 0.006 },
    { what: 'Meeting mean', value: MS.mean, shown: 9.63 },
    { what: 'Meeting median', value: MS.median, shown: 9.22, tol: 0.006 },
    { what: 'Meeting SD', value: MS.sd, shown: 2.15 },
    { what: 'Meeting CV %', value: MS.cv * 100, shown: 22.3, tol: 0.05 },
    { what: 'Meeting CV % rounded', value: MS.cv * 100, shown: 22, tol: 0.5 },
    { what: 'Meetings about three times as variable', value: MS.cv / LS.cv, shown: 3, tol: 0.05 },
    { what: 'Meeting Q1', value: MS.q1, shown: 8.14, tol: 0.006 },
    { what: 'Meeting Q3', value: MS.q3, shown: 10.04, tol: 0.006 },
    { what: 'Meeting max', value: MS.max, shown: 17.14 },
    { what: 'Meeting skewness', value: MS.skew, shown: 2.05, tol: 0.006 },
    { what: 'z meeting', value: zMeet, shown: 3.49 },
    { what: 'z meeting (one decimal)', value: zMeet, shown: 3.5, tol: 0.05 },
    { what: 'Meeting above its mean', value: MS.max - MS.mean, shown: 7.51 },
    { what: 'Team day mean', value: TD.mean, shown: 11.25 },
    { what: 'Team day median', value: TD.median, shown: 11.19 },
    { what: 'Team day SD', value: TD.sd, shown: 1.99 },
    { what: 'Team day CV %', value: TD.cv * 100, shown: 17.7, tol: 0.05 },
    { what: 'Team day CV % rounded', value: TD.cv * 100, shown: 18, tol: 0.5 },
    { what: 'Team day Q1', value: TD.q1, shown: 9.63, tol: 0.006 },
    { what: 'Team day Q3', value: TD.q3, shown: 11.95, tol: 0.006 },
    { what: 'Team day max', value: TD.max, shown: 16.11 },
    { what: 'z team day', value: zTeam, shown: 2.44, tol: 0.006 },
    { what: 'z team day (one decimal)', value: zTeam, shown: 2.4, tol: 0.051 },
    { what: 'Team day above its mean', value: TD.max - TD.mean, shown: 4.86 },
    { what: 'Meetings without the outlier', value: MS.n - 1, shown: 27 },
    { what: 'Meeting mean without outlier', value: mean(M.filter((v) => v !== MS.max)), shown: 9.35 },
    { what: 'Meeting SD without outlier', value: sd(M.filter((v) => v !== MS.max)), shown: 1.60 },
    { what: 'z without outlier', value: (MS.max - mean(M.filter((v) => v !== MS.max))) / sd(M.filter((v) => v !== MS.max)), shown: 4.9, tol: 0.05 },
    { what: 'Minimum invoice (B03 quote sheet)', value: QUOTE.minimum, shown: 300 },
    { what: '20-guest meeting at the minimum', value: QUOTE.minimum / 20, shown: 15 },
    { what: 'Set-up charge exists (B03)', value: QUOTE.setup, shown: 60 },
    { what: 'Smallest meeting guests', value: smallMeeting[evCol('guests')], shown: 35 },
    { what: 'Smallest meeting is the fewest guests', value: minMeetingGuests, shown: 35 },
    { what: 'Smallest team day guests', value: smallTeam[evCol('guests')], shown: 36 },
    { what: 'Smallest team day is the fewest', value: Math.min(...EVENTS.filter((r) => r[evCol('event_type')] === 'Team day').map((r) => r[evCol('guests')])), shown: 36 },
    { what: 'Breakfast mean', value: ST.Breakfast.mean, shown: 9.47 },
    { what: 'Breakfast median', value: ST.Breakfast.median, shown: 9.42 },
    { what: 'Breakfast CV %', value: ST.Breakfast.cv * 100, shown: 16.2, tol: 0.05 },
    { what: 'Conference CV %', value: ST.Conference.cv * 100, shown: 16.2, tol: 0.05 },
    { what: 'Launch has no outliers', value: LS.out.length, shown: 0 },
    { what: 'Breakfast has no outliers', value: ST.Breakfast.out.length, shown: 0 },
    { what: 'All outliers on the high side', value: T.flatMap((t) => ST[t].out.map((v) => Number(v > ST[t].median))).every(Boolean) ? 1 : 0, shown: 1 },
    { what: 'Meeting rows (B2:B29)', value: MS.n + 1, shown: 29 },
    { what: 'EV-047 row in the meeting sheet', value: M.indexOf(MS.max) + 2, shown: 23 },
    { what: 'Launch has the lowest CV', value: Number(T.every((t) => ST[t].cv >= LS.cv)), shown: 1 },
    { what: 'Meeting has the highest CV', value: Number(T.every((t) => ST[t].cv <= MS.cv)), shown: 1 },
    { what: 'Team days have the highest median', value: Number(T.every((t) => ST[t].median <= TD.median)), shown: 1 },
    // categories and ratings
    { what: 'Web orders', value: web, shown: 132 },
    { what: 'App orders', value: app, shown: 99 },
    { what: 'Web share', value: web / n, shown: 0.571, tol: 0.0005 },
    { what: 'App share', value: app / n, shown: 0.429, tol: 0.0005 },
    { what: 'Subscription share', value: mean(SUBSCRIPTION_FLAGS), shown: 0.450, tol: 0.0005 },
    { what: 'Subscription orders', value: D.orders.subscriptions, shown: 104 },
    { what: 'Rated orders', value: R.length, shown: 154 },
    { what: '1-star', value: rc[0], shown: 4 },
    { what: '2-star', value: rc[1], shown: 9 },
    { what: '3-star', value: rc[2], shown: 22 },
    { what: '4-star', value: rc[3], shown: 51 },
    { what: '5-star', value: rc[4], shown: 68 },
    { what: 'Mean rating', value: D.orders.meanRating, shown: 4.10 },
    { what: 'Median rating', value: median(R), shown: 4 },
    { what: 'Ratings below 4', value: cumBelow4, shown: 35 },
    { what: 'First 4-star position', value: cumBelow4 + 1, shown: 36 },
    { what: 'Last 4-star position', value: cumBelow4 + rc[3], shown: 86 },
    { what: 'Middle positions', value: (R.length + 1) / 2, shown: 77.5 },
    { what: 'Percentile of a 4 (OpenStax)', value: (cumBelow4 + 0.5 * rc[3]) / R.length * 100, shown: 39, tol: 0.5 },
    { what: 'PERCENTRANK.INC of a 4 (truncated)', value: Math.floor(cumBelow4 / (R.length - 1) * 1000) / 1000, shown: 0.228, tol: 1e-9 },
    { what: '35 ÷ 153', value: cumBelow4 / (R.length - 1), shown: 0.2288, tol: 0.00005 },
    { what: 'Ratings minus 1', value: R.length - 1, shown: 153 },
    { what: 'Microsoft PERCENTRANK example 5/9 truncated', value: Math.floor(5 / 9 * 1000) / 1000, shown: 0.555, tol: 1e-9 },
    { what: '4 or 5 stars %', value: (rc[3] + rc[4]) / R.length * 100, shown: 77, tol: 0.5 },
    { what: '1 or 2 stars %', value: (rc[0] + rc[1]) / R.length * 100, shown: 8, tol: 0.5 },
    { what: 'Order KURT', value: D.orders.kurtosis, shown: 199.5, tol: 0.05 },
    { what: 'Rating proportions add to 1', value: sum(rc) / R.length, shown: 1 },
  ],
};
