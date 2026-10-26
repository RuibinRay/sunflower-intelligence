// discrete-distributions.js — B04 · Discrete distributions. Content only; exercises are in
// discrete-distributions.ex.js. Uses the spring orders' subscription share (DERIVED.orders) for the binomial, the orders
// per day (ORDERS_PER_DAY, DERIVED.perDay) for the Poisson and the exponential, and B03's Gift Box Trio price and cost
// (PRODUCTS) for the stock decision. The Christmas market stall, Ana's demand probabilities and the January markdown are
// fictional and labelled. The formal goodness-of-fit test of the Poisson model is module 4's. Every printed figure is
// recomputed in `checks`.
import { ORDERS_PER_DAY, CHANNEL_SUBSCRIPTION as CS, DERIVED as D } from './case.js?v=19';
import { PRODUCTS } from '../b03/case.js?v=19';
import { binomPmf, binomCdf, binomSf, binomInv, poissonPmf, poissonCdf, poissonSf, exponCdf, combin } from '../../../core/inference.js?v=19';
import { mean, variance } from '../../../core/stats.js?v=19';

const f = (v, d = 3) => v.toFixed(d);
const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const usd = (v, d = 0) => `$${v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const sum = (a) => a.reduce((s, x) => s + x, 0);

// ---------------------------------------------------------------- orders per day as a random variable
const DAYS = ORDERS_PER_DAY.length, CNT = D.perDay.counts, K = CNT.map((_, k) => k);
const PX = CNT.map((c) => c / DAYS);
const EX = sum(K.map((k) => k * PX[k])), VX = sum(K.map((k) => (k - EX) ** 2 * PX[k])), SX = Math.sqrt(VX);
const LAM = D.perDay.lambda;
const EXP = D.perDay.expected;
const pFivePlus = poissonSf(4, LAM);

// ---------------------------------------------------------------- binomial: subscriptions in the next 20 orders
const P = D.orders.subscriptionShare, NB = 20;
const muB = NB * P, sdB = Math.sqrt(NB * P * (1 - P));
const p9 = binomPmf(9, NB, P), p12up = binomSf(11, NB, P), p6to12 = binomCdf(12, NB, P) - binomCdf(5, NB, P);
const lo2 = Math.ceil(muB - 2 * sdB), hi2 = Math.floor(muB + 2 * sdB), pWithin2 = binomCdf(hi2, NB, P) - binomCdf(lo2 - 1, NB, P);
const [[WSUB, WONE], [ASUB, AONE]] = CS.counts;                         // web and app: subscription, one-off
const PAPP = ASUB / (ASUB + AONE), PWEB = WSUB / (WSUB + WONE), p12upApp = binomSf(11, NB, PAPP);
const inv95 = binomInv(0.95, NB, P);
const three = [0, 1, 2, 3].map((k) => binomPmf(k, 3, P));

// ---------------------------------------------------------------- Poisson approximation and exponential
const approxBin = binomCdf(2, 200, 0.02), approxPois = poissonCdf(2, 4);
const gapMeanDays = 1 / LAM, gapOver1 = Math.exp(-LAM), gapUnderQuarter = exponCdf(0.25, LAM);

// ---------------------------------------------------------------- gift boxes at the Christmas market (fictional)
const GIFT = PRODUCTS.find((r) => r[0] === 'Gift Box Trio');
const PRICE = GIFT[3], COST = GIFT[4], MARKDOWN = 12;
const DEMAND = [[10, 0.2], [20, 0.4], [30, 0.3], [40, 0.1]];
const profit = (q, d, salvage = MARKDOWN) => PRICE * Math.min(q, d) + salvage * Math.max(0, q - d) - COST * q;
const PLAN = [10, 20, 30, 40].map((q) => {
  const vals = DEMAND.map(([d]) => profit(q, d)), e = sum(DEMAND.map(([d, p]) => profit(q, d) * p));
  return { q, vals, e, sd: Math.sqrt(sum(DEMAND.map(([d, p]) => (profit(q, d) - e) ** 2 * p))), worst: Math.min(...vals) };
});
const ED = sum(DEMAND.map(([d, p]) => d * p));
const best = PLAN.reduce((a, b) => (b.e > a.e ? b : a));

// ---------------------------------------------------------------- figure: where the binomial formula comes from (n = 3)
function pathsFigure() {
  const groups = [['FFF'], ['SFF', 'FSF', 'FFS'], ['SSF', 'SFS', 'FSS'], ['SSS']];
  const W = 640, H = 220, colW = 150, x0 = 20;
  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">`;
  groups.forEach((g, k) => {
    const x = x0 + k * colW;
    s += `<text x="${x + colW / 2 - 10}" y="18" text-anchor="middle" font-size="12">${k} subscription${k === 1 ? '' : 's'}</text>`;
    g.forEach((o, i) => {
      const y = 32 + i * 34;
      s += `<rect x="${x + 18}" y="${y}" width="${colW - 56}" height="26" rx="5" fill="var(--series-1)" fill-opacity="${0.08 + 0.1 * k}" stroke="var(--series-1)" stroke-width="1.1"/>`;
      s += `<text x="${x + colW / 2 - 10}" y="${y + 17}" text-anchor="middle" font-size="13" letter-spacing="2">${o}</text>`;
    });
    s += `<text x="${x + colW / 2 - 10}" y="150" text-anchor="middle" font-size="11" fill="var(--ink-3)">${g.length} way${g.length === 1 ? '' : 's'} × p${k ? `^${k}` : '⁰'}</text>`;
    s += `<text x="${x + colW / 2 - 10}" y="168" text-anchor="middle" font-size="11" fill="var(--ink-3)">× (1 − p)^${3 - k}</text>`;
    s += `<text x="${x + colW / 2 - 10}" y="192" text-anchor="middle" font-size="12">= ${f(three[k], 4)}</text>`;
  });
  s += `<text x="${W / 2}" y="${H - 6}" text-anchor="middle" font-size="11" fill="var(--ink-3)">S = subscription, F = one-off; p = ${f(P, 3)}. The ways are C(3, k): ${groups.map((g) => g.length).join(', ')}.</text>`;
  return `${s}</svg>`.replace(/\^(\d)/g, (_, d) => '⁰¹²³'[d]);
}

export default {
  slug: 'discrete-distributions',
  title: 'Discrete distributions',
  blurb: 'Many business questions are about counts: subscriptions among the next orders, orders on a day, boxes sold at a market. Learn to describe a count with a probability distribution, its expected value and its standard deviation, to recognise the binomial and Poisson distributions and check their conditions, and to calculate their probabilities by hand and with BINOM.DIST and POISSON.DIST.',
  status: 'reviewed',
  objectives: [
    'Describe a discrete random variable with a probability distribution, and calculate its expected value, variance and standard deviation.',
    'Identify when a count follows a binomial distribution, and calculate binomial probabilities, the mean np and the standard deviation √(np(1 − p)) by hand and with BINOM.DIST and BINOM.DIST.RANGE.',
    'Identify when a count follows a Poisson distribution, calculate its probabilities with POISSON.DIST, and compare observed counts with a Poisson model.',
    'Explain when the Poisson approximates the binomial, and how the exponential distribution describes the time between Poisson events.',
    'Use expected values and standard deviations to compare decisions under uncertainty.',
  ],
  prerequisites: [
    { lesson: 'b04/probability', why: 'Independence, the multiplication rule, complements and COMBIN are the building blocks of the binomial.' },
    { lesson: 'b04/describing-distributions', why: 'The mean, variance and standard deviation of data, which this lesson extends to random variables.' },
    { lesson: 'f00/finance-time-and-risk', why: 'Expected value as a probability-weighted average of outcomes.' },
  ],
  case: 'lantern',

  concept: [
    { case: `Ana is planning for the busy months. ${pc(P)} of the spring orders were subscriptions: how many subscriptions should she expect among the next 20 orders, and how far might that number swing? The shop averaged ${f(LAM, 2)} orders a day: how often will a day bring none, or five or more? And how many gift boxes should she take to a Saturday Christmas market, when she can only guess how many will sell? Each question is about a count that can’t be known in advance.` },

    { h: 'Random variables and their distributions' },
    { p: `A <g>random variable</g> is a number determined by the outcome of an experiment: the number of orders on a day, the number of subscriptions in 20 orders, the number of boxes sold. A <b>discrete</b> random variable takes separate values, usually counts 0, 1, 2, …; a continuous one, such as a weight, can take any value in a range, and is the next module’s subject. Random variables are written with capitals, <m>X</m>, and the values they take with lower case, <m>x</m>.` },
    { p: `The <g>probability distribution</g> of a discrete random variable lists every value it can take with its probability. Each probability is between 0 and 1, and they add to 1. For a spring day drawn at random, the number of shop orders <m>X</m> has the distribution below, from the counts of the ${DAYS} days.` },
    { table: {
      caption: `Orders per day on the ${DAYS} days of 1 March – 30 June 2026`,
      head: ['Orders on the day, x', ...K.map(String), 'Total'],
      align: ['l', ...K.map(() => 'r'), 'r'],
      rows: [['Days', ...CNT.map(String), String(DAYS)], ['P(X = x)', ...PX.map((p) => f(p)), '1.000']],
    } },

    { h: 'Expected value and standard deviation' },
    { p: String.raw`The <g>expected value</g> of a random variable, <m>E(X)</m> or <m>\mu</m>, is the probability-weighted average of its values, <m>\sum x\,P(x)</m>: the long-run average if the experiment were repeated many times. For orders per day it is <m>0 \times ${f(PX[0])} + 1 \times ${f(PX[1])} + \dots + 5 \times ${f(PX[5])} \approx ${f(EX)}</m>, which is exactly ${D.orders.n} orders ÷ ${DAYS} days. An expected value needn’t be a possible value: no day has 1.89 orders.` },
    { p: String.raw`The variance of a random variable weights each squared distance from <m>\mu</m> by its probability, <m>\sigma^2 = \sum (x - \mu)^2 P(x)</m>, and the standard deviation <m>\sigma</m> is its square root. For orders per day, <m>\sigma^2 \approx ${f(VX)}</m> and <m>\sigma \approx ${f(SX, 2)}</m> orders. There is no <m>n - 1</m> here: the probabilities describe the distribution itself, like a population.` },

    { h: 'The binomial distribution' },
    { p: `The number of subscriptions among Ana’s next 20 orders is a count of “successes” in a fixed number of tries. The <g>binomial distribution</g> describes such counts when four conditions hold: a fixed number of trials <m>n</m>; two outcomes on each trial, success or failure; the same probability of success <m>p</m> on every trial; and trials that are independent of each other. Then the number of successes <m>X</m> can be anything from 0 to <m>n</m>.` },
    { p: String.raw`Where does its formula come from? Take three orders, each a subscription (S) with probability <m>p</m> or one-off (F) with probability <m>1 - p</m>. By the multiplication rule for independent trials, any particular sequence with two subscriptions, such as SSF, has probability <m>p^2(1 - p)</m>. There are <m>\binom{3}{2} = 3</m> such sequences, so <m>P(X = 2) = 3p^2(1 - p)</m>. In general:` },
    { math: String.raw`P(X = k) = \binom{n}{k} p^k (1 - p)^{n - k}, \qquad k = 0, 1, \dots, n` },
    { figure: {
      svg: pathsFigure(),
      caption: `The eight possible sequences of three orders, grouped by the number of subscriptions. Every sequence with k subscriptions has the same probability, so P(X = k) is the number of sequences, C(3, k), times that probability. With p = ${f(P)} the four probabilities are ${three.map((v) => f(v, 4)).join(', ')}.`,
      alt: `Four columns of sequences of three letters, S for subscription and F for one-off. The first column, 0 subscriptions, holds FFF; the second, 1 subscription, holds SFF, FSF and FFS; the third, 2 subscriptions, holds SSF, SFS and FSS; the fourth, 3 subscriptions, holds SSS. Under each column the probability is written as the number of sequences times p to the power k times (1 − p) to the power 3 − k: ${three.map((v, k) => `${k} subscription${k === 1 ? '' : 's'} ${f(v, 4)}`).join(', ')}.`,
    } },
    { p: `For the next 20 orders, with <m>p = ${D.orders.subscriptions} \\div ${D.orders.n} \\approx ${f(P)}</m> from the spring, the chance of exactly 9 subscriptions is <m>\\binom{20}{9} (${f(P)})^9 (${f(1 - P)})^{11} \\approx ${f(p9, 4)}</m>, or <x>=BINOM.DIST(9,20,104/231,FALSE)</x>. A binomial count has mean <m>np = ${f(muB, 2)}</m> and standard deviation <m>\\sqrt{np(1 - p)} \\approx ${f(sdB, 2)}</m>: Ana should expect about 9 subscriptions, give or take about 2.` },

    { h: 'The Poisson distribution' },
    { p: `Orders per day are a different kind of count: there is no fixed number of trials, only orders arriving over time. The <g>Poisson distribution</g> describes the number of events in a fixed interval of time or space when they happen independently of each other, at a constant average rate <m>\\lambda</m> (“lambda”), and never two at exactly the same moment. Its one parameter, <m>\\lambda</m>, is both its mean and its variance. The mean scales with the interval: if a day averages <m>\\lambda</m> orders, half a day averages <m>\\lambda \\div 2</m> and a week <m>7\\lambda</m>, and the count in each is Poisson with that mean.` },
    { math: String.raw`P(X = k) = \frac{e^{-\lambda} \lambda^k}{k!}, \qquad k = 0, 1, 2, \dots` },
    { p: String.raw`With <m>\lambda = ${D.orders.n} \div ${DAYS} \approx ${f(LAM)}</m> orders a day, the chance of a day with no orders is <m>e^{-${f(LAM)}} \approx ${f(poissonPmf(0, LAM), 4)}</m>, or <x>=POISSON.DIST(0,231/122,FALSE)</x>. Multiplying each probability by ${DAYS} days gives the number of days the model expects with each count, set against what happened:` },
    { table: {
      caption: `Spring days by number of orders: observed, and expected from a Poisson distribution with λ = ${f(LAM)}`,
      head: ['Orders on the day', 'Observed days', 'Poisson probability', 'Expected days'],
      align: ['l', 'r', 'r', 'r'],
      rows: [
        ...[0, 1, 2, 3, 4].map((k) => [String(k), String(CNT[k]), f(poissonPmf(k, LAM), 4), f(EXP[k], 1)]),
        ['5 or more', String(CNT[5]), f(pFivePlus, 4), f(DAYS * pFivePlus, 1)],
      ],
      foot: [['Total', String(DAYS), '1.0000', f(DAYS, 1)]],
    } },
    { p: `The model fits closely: ${CNT[0]} days without an order against ${f(EXP[0], 1)} expected, ${CNT[1]} with one against ${f(EXP[1], 1)}. The largest gap is at 4 orders, ${CNT[4]} days against ${f(EXP[4], 1)}. A second check uses the Poisson’s mean = variance property: the days’ sample variance is ${f(variance(ORDERS_PER_DAY))}, close to their mean of ${f(mean(ORDERS_PER_DAY))}. Whether the gaps are larger than chance would produce is a goodness-of-fit question, which module 4’s chi-square test answers.` },
  ],

  theory: [
    { h: 'Binomial probabilities in Excel' },
    { p: `<x>=BINOM.DIST(number_s,trials,probability_s,cumulative)</x> returns the probability of exactly <m>k</m> successes when cumulative is FALSE, and of at most <m>k</m> when it is TRUE. Other questions are built from these. “At least 12” is the complement of “at most 11”: <x>=1-BINOM.DIST(11,20,104/231,TRUE)</x> = ${f(p12up, 4)}. <x>=BINOM.DIST.RANGE(trials,probability_s,number_s,[number_s2])</x> gives the probability of a range, both ends included: <x>=BINOM.DIST.RANGE(20,104/231,6,12)</x> = ${f(p6to12, 4)}. Microsoft lists it for Excel 2016 and later.` },
    { p: `Two slips cause most wrong answers. For “at least <m>k</m>” the cumulative probability to subtract stops at <m>k - 1</m>, because <m>P(X \\geq 12) = 1 - P(X \\leq 11)</m>; subtracting <m>P(X \\leq 12)</m> gives <m>P(X > 12)</m>, ${f(binomSf(12, NB, P), 4)}. And FALSE and TRUE answer different questions: FALSE is a single bar of the distribution, TRUE everything up to and including it. BINOM.INV goes the other way: <x>=BINOM.INV(20,104/231,0.95)</x> = ${inv95} is the smallest count with at least a 95% chance of not being exceeded.` },

    { h: 'Are the binomial conditions met?' },
    { p: `The binomial is a model, and its conditions should be checked against how the orders really arrive. <b>Two outcomes</b> and a <b>fixed n</b> are clear. <b>Constant p</b> is doubtful: app orders were subscriptions ${pc(PAPP)} of the time and web orders ${pc(PWEB)}, so if the next 20 orders were all app orders the right <m>p</m> would be ${f(PAPP)}, and <m>P(X \\geq 12)</m> would be ${f(p12upApp, 3)} rather than ${f(p12up, 3)}. <b>Independence</b> fails if one customer places several of the 20 orders, because a subscriber’s orders are all subscriptions.` },
    { p: 'Sampling without replacement breaks independence slightly, as the probability lesson showed. When the number drawn is less than about 10% of the population, the binomial is still a good model; for larger shares the hypergeometric distribution, which counts without replacement, is the exact one. A binomial probability is only as good as these conditions, so state the p you used and where it came from.' },

    { h: 'Mean and spread of a binomial count' },
    { p: String.raw`For a binomial count, <m>\mu = np</m> and <m>\sigma = \sqrt{np(1 - p)}</m>. The spread is largest when <m>p = 0.5</m> and shrinks towards 0 as <m>p</m> nears 0 or 1, when almost every trial goes the same way. Two standard deviations either side of the mean, ${f(muB - 2 * sdB, 1)} to ${f(muB + 2 * sdB, 1)}, cover the counts ${lo2} to ${hi2}, which have probability ${f(pWithin2, 3)} together: close to the empirical rule’s 95%, because a binomial with <m>np</m> and <m>n(1 - p)</m> both above 5 is roughly bell-shaped.` },

    { h: 'Poisson probabilities and conditions' },
    { p: `<x>=POISSON.DIST(x,mean,cumulative)</x> works like BINOM.DIST: FALSE for exactly <m>x</m> events, TRUE for at most <m>x</m>. The chance of a busy day with 5 or more orders is <x>=1-POISSON.DIST(4,231/122,TRUE)</x> = ${f(pFivePlus, 4)}, about ${f(DAYS * pFivePlus, 1)} days in a spring of ${DAYS}; ${CNT[5]} happened. Microsoft’s example of a Poisson count is cars arriving at a toll plaza in one minute.` },
    { p: 'The Poisson conditions are worth testing against what you know. Orders come from many separate customers, which supports independence. A constant rate is less certain: orders may cluster after a marketing email or on certain weekdays, and either would make busy and quiet days more common than the model says, so the variance would exceed the mean. A variance well above the mean, called overdispersion, is the usual sign that a Poisson model is too simple.' },

    { h: 'The Poisson as an approximation to the binomial' },
    { p: `When <m>n</m> is large and <m>p</m> small, a binomial count is close to a Poisson count with <m>\\lambda = np</m>. For 200 visits converting at 2% (fictional), the binomial chance of at most 2 orders is ${f(approxBin, 4)} and the Poisson chance with <m>\\lambda = 4</m> is ${f(approxPois, 4)}. OpenStax notes that there is no single accepted rule for when the approximation is good; one example it gives is <m>n</m> greater than 20 with <m>p</m> less than 0.05. With Excel’s BINOM.DIST at hand, the approximation matters mainly as a reason why rare events in large populations look Poisson.` },

    { h: 'Choosing a model for a count' },
    { list: [
      'Is there a fixed number of trials, each a success or a failure? Then start from the binomial, and ask whether p is the same for every trial and the trials are independent.',
      'Are events counted over an interval of time or space, with no upper limit set by a number of trials? Then start from the Poisson, and ask whether the rate is steady and the events independent.',
      'Is the quantity measured rather than counted, such as a weight, a time or an amount of money? Then it is continuous: the normal distribution (next module) and the exponential are models for such quantities.',
      'Whatever the model, compare it with data before relying on it: observed against expected counts, the mean against the variance, and the conditions against what you know about how the data arise.',
    ] },

    { h: 'Time between events: the exponential distribution' },
    { p: String.raw`If events follow a Poisson process at rate <m>\lambda</m>, the time between one event and the next follows an <g>exponential distribution</g> with mean <m>1 \div \lambda</m>. Its probability of a gap longer than <m>t</m> is <m>e^{-\lambda t}</m>, and Excel’s <x>=EXPON.DIST(x,lambda,TRUE)</x> gives the chance of a gap of at most <m>x</m>. With ${f(LAM)} orders a day, the average gap is ${f(gapMeanDays)} days, about ${f(gapMeanDays * 24, 1)} hours, and a gap of more than a day has probability <m>e^{-${f(LAM)}} \approx ${f(gapOver1, 4)}</m>: the same as a day with no orders, as it must be.` },
    { p: `The exponential is continuous, a preview of the next module, and it is memoryless: however long it has been since the last order, the wait for the next one has the same distribution. That is realistic for many separate customers and unrealistic for anything that wears out or follows a schedule. Real orders also arrive unevenly through the day, so a model with a constant rate is a simplification; <x>=EXPON.DIST(0.25,231/122,TRUE)</x> = ${f(gapUnderQuarter, 3)} is the chance of an order within six hours only if the rate really is constant around the clock.` },
  ],

  formulas: [
    { id: 'dv-expected', name: 'Expected value, variance and standard deviation of a discrete random variable',
      tex: String.raw`\mu = E(X) = \sum x\,P(x), \qquad \sigma^2 = \sum (x - \mu)^2 P(x), \qquad \sigma = \sqrt{\sigma^2}`,
      where: [[String.raw`X`, 'The random variable', 'its units'], [String.raw`E(X)`, 'Its expected value', 'its units'], [String.raw`x`, 'A value it can take', 'its units'], [String.raw`P(x)`, 'The probability that X = x', ''], [String.raw`\mu`, 'Expected value (mean)', 'its units'], [String.raw`\sigma`, 'Standard deviation', 'its units']],
      assumptions: 'The probabilities cover every value and add to 1.',
      note: 'In Excel, with values in A2:A7 and probabilities in B2:B7: <x>=SUMPRODUCT(A2:A7,B2:B7)</x>.' },
    { id: 'dv-binomial', name: 'Binomial distribution (BINOM.DIST)',
      tex: String.raw`P(X = k) = \binom{n}{k} p^k (1 - p)^{n - k}, \qquad \mu = np, \qquad \sigma = \sqrt{np(1 - p)}`,
      where: [[String.raw`P(X = k)`, 'Probability of exactly k successes', ''], [String.raw`n`, 'Number of independent trials', ''], [String.raw`p`, 'Probability of success on each trial', ''], [String.raw`k`, 'Number of successes, 0 to n', ''], [String.raw`\binom{n}{k}`, 'Number of ways to place k successes among n trials: COMBIN(n,k)', ''], [String.raw`X`, 'The number of successes', '']],
      assumptions: 'Fixed n, two outcomes, constant p, independent trials.',
      note: '<x>=BINOM.DIST(k,n,p,FALSE)</x> for exactly k, TRUE for at most k; <x>=BINOM.DIST.RANGE(n,p,k1,k2)</x> for k1 to k2 inclusive.' },
    { id: 'dv-poisson', name: 'Poisson distribution (POISSON.DIST)',
      tex: String.raw`P(X = k) = \dfrac{e^{-\lambda} \lambda^k}{k!}, \qquad \mu = \lambda, \qquad \sigma^2 = \lambda`,
      where: [[String.raw`P(X = k)`, 'Probability of exactly k events', ''], [String.raw`\lambda`, 'Average number of events in the interval', 'events per interval'], [String.raw`k`, 'Number of events, 0, 1, 2, …', ''], [String.raw`X`, 'The number of events in the interval', ''], [String.raw`k!`, 'k factorial', '']],
      assumptions: 'Events occur independently, at a constant average rate, one at a time.',
      note: '<x>=POISSON.DIST(k,lambda,FALSE)</x> for exactly k, TRUE for at most k.' },
    { id: 'dv-exponential', name: 'Exponential distribution (EXPON.DIST)',
      tex: String.raw`P(T \leq t) = 1 - e^{-\lambda t}, \qquad E(T) = \dfrac{1}{\lambda}`,
      where: [[String.raw`P(T \leq t)`, 'Probability that the gap is at most t', ''], [String.raw`E(T)`, 'Expected (mean) gap', 'time'], [String.raw`T`, 'Time between consecutive events', 'time'], [String.raw`t`, 'A length of time', 'time'], [String.raw`\lambda`, 'Event rate per unit of time', 'events per unit time']],
      assumptions: 'Events follow a Poisson process with a constant rate.',
      note: '<x>=EXPON.DIST(t,lambda,TRUE)</x>; the standard deviation is also 1 ÷ λ.' },
  ],

  examples: [
    { level: 'simple', title: 'Orders on a spring day: expected value and standard deviation', fictional: true,
      setup: `Using the distribution of orders per day above (${CNT.join(', ')} days with 0 to 5 orders, out of ${DAYS}), calculate the expected number of orders on a spring day and its standard deviation, by hand and in Excel.`,
      steps: [
        String.raw`Probabilities: divide each count of days by ${DAYS}, giving ${PX.map((p) => f(p)).join(', ')}. They add to 1.`,
        String.raw`Expected value: <m>\sum x\,P(x) = (0 \times ${CNT[0]} + 1 \times ${CNT[1]} + 2 \times ${CNT[2]} + 3 \times ${CNT[3]} + 4 \times ${CNT[4]} + 5 \times ${CNT[5]}) \div ${DAYS} = ${sum(K.map((k) => k * CNT[k]))} \div ${DAYS} \approx ${f(EX)}</m> orders. With values in A2:A7 and probabilities in B2:B7, <x>=SUMPRODUCT(A2:A7,B2:B7)</x>.`,
        String.raw`Variance: <m>\sum (x - \mu)^2 P(x)</m>. The shortcut <m>\sum x^2 P(x) - \mu^2 = ${sum(K.map((k) => k * k * CNT[k]))} \div ${DAYS} - ${f(EX)}^2 \approx ${f(sum(K.map((k) => k * k * PX[k])))} - ${f(EX ** 2)} = ${f(VX)}</m> gives the same answer. In Excel, <x>=SUMPRODUCT((A2:A7-E2)^2,B2:B7)</x> with the mean in E2.`,
        String.raw`Standard deviation: <m>\sqrt{${f(VX)}} \approx ${f(SX)}</m> orders.`,
      ],
      answer: `E(X) ≈ ${f(EX)} orders a day, standard deviation ≈ ${f(SX, 2)} orders.`,
      interpretation: `A typical spring day brought about two orders, give or take one or two. The expected value equals the spring’s ${D.orders.n} orders spread over ${DAYS} days, and the variance (${f(VX, 2)}) is close to the mean (${f(EX, 2)}): the first sign that a Poisson model might fit.` },

    { level: 'challenging', title: 'Subscriptions among the next 20 orders', fictional: true,
      setup: `Ana treats each of the next 20 orders as a subscription with probability ${D.orders.subscriptions} ÷ ${D.orders.n} ≈ ${f(P)}. Find the probability of exactly 9 subscriptions, of at least 12, and of 6 to 12, and the mean and standard deviation. Then say how the answer changes if the next 20 orders all come through the app.`,
      steps: [
        String.raw`Check the conditions: 20 orders (fixed <m>n</m>), subscription or not (two outcomes), the spring share as a constant <m>p</m>, and independence, which assumes different customers place the 20 orders.`,
        String.raw`Exactly 9: <m>\binom{20}{9} (${f(P)})^9 (${f(1 - P)})^{11} = ${combin(20, 9).toLocaleString('en-US').replace(',', '{,}')} \times ${f(P ** 9, 6)} \times ${f((1 - P) ** 11, 6)} \approx ${f(p9, 4)}</m>; <x>=BINOM.DIST(9,20,104/231,FALSE)</x>.`,
        String.raw`At least 12: <m>1 - P(X \leq 11) = 1 - ${f(binomCdf(11, NB, P), 4)} = ${f(p12up, 4)}</m>; <x>=1-BINOM.DIST(11,20,104/231,TRUE)</x>. From 6 to 12: <x>=BINOM.DIST.RANGE(20,104/231,6,12)</x> = ${f(p6to12, 4)}.`,
        String.raw`Mean and spread: <m>np = 20 \times ${f(P)} = ${f(muB, 2)}</m> and <m>\sqrt{20 \times ${f(P)} \times ${f(1 - P)}} \approx ${f(sdB, 2)}</m>.`,
        String.raw`All app orders: with <m>p = ${ASUB} \div ${ASUB + AONE} \approx ${f(PAPP)}</m>, the mean rises to ${f(NB * PAPP, 2)} and <m>P(X \geq 12)</m> to ${f(p12upApp, 3)}.`,
      ],
      answer: `P(X = 9) ≈ ${f(p9, 3)}, P(X ≥ 12) ≈ ${f(p12up, 3)}, P(6 ≤ X ≤ 12) ≈ ${f(p6to12, 3)}; mean ${f(muB, 1)}, SD ${f(sdB, 2)}. For 20 app orders, P(X ≥ 12) ≈ ${f(p12upApp, 2)}.`,
      interpretation: 'Even the single most likely count, 9, happens less than one time in five: a binomial count varies a good deal at n = 20. Twelve or more subscriptions would happen about one time in eight with the spring’s mix of orders, but about half the time for app orders, so the answer depends on which p is right. That choice is a business judgement, made before any calculation.' },

    { level: 'applied', title: 'How many gift boxes to take to the Christmas market?', fictional: true,
      setup: `Lantern has a stall at a Saturday Christmas market (fictional). Gift Box Trios sell at ${usd(PRICE)} and cost ${usd(COST)} each to make up (B03’s price list); any left over are sold in January at ${usd(MARKDOWN)}, below cost. Boxes come in cartons of 10. Ana’s subjective probabilities for the day’s demand: 10 boxes 0.2, 20 boxes 0.4, 30 boxes 0.3, 40 boxes 0.1. How many should she take?`,
      table: {
        caption: 'Profit for each stock level and each level of demand ($)',
        head: ['Stock', 'Demand 10 (0.2)', 'Demand 20 (0.4)', 'Demand 30 (0.3)', 'Demand 40 (0.1)', 'Expected profit', 'SD'],
        align: ['r', 'r', 'r', 'r', 'r', 'r', 'r'],
        rows: PLAN.map((x) => [String(x.q), ...x.vals.map((v) => usd(v)), usd(x.e), usd(x.sd)]),
      },
      steps: [
        String.raw`Profit for stock <m>q</m> and demand <m>d</m>: <m>${PRICE} \times \min(q, d) + ${MARKDOWN} \times (\text{boxes left over}) - ${COST} \times q</m>. For 30 boxes and a demand of 20: <m>${PRICE} \times 20 + ${MARKDOWN} \times 10 - ${COST} \times 30 = ${profit(30, 20)}</m> dollars. The table repeats this for every pair.`,
        String.raw`Expected profit of each stock level, weighting by Ana’s probabilities. For 30: <m>0.2 \times ${profit(30, 10)} + 0.4 \times ${profit(30, 20)} + 0.3 \times ${profit(30, 30)} + 0.1 \times ${profit(30, 40)} = ${PLAN[2].e}</m> dollars. Taking 30 boxes gives the highest expected profit.`,
        String.raw`Risk: the standard deviation of profit grows with the stock, from $0 for 10 boxes to ${usd(PLAN[3].sd)} for 40, and the worst case falls from ${usd(PLAN[0].worst)} to ${usd(PLAN[3].worst)}. With 30 boxes the worst case is ${usd(PLAN[2].worst)}; with 20 it is ${usd(PLAN[1].worst)}.`,
        String.raw`Don’t plan for the expected demand alone: it is <m>${ED}</m> boxes, but a box left over costs ${usd(COST - MARKDOWN)} while a sale missed loses ${usd(PRICE - COST)} of profit, so it pays to carry more than the expected demand.`,
      ],
      answer: `Take 30 boxes: expected profit ${usd(best.e)} (SD ${usd(best.sd)}), against ${usd(PLAN[1].e)} for 20 and ${usd(PLAN[3].e)} for 40.`,
      interpretation: `Thirty boxes is the best bet on average, and its worst case (${usd(PLAN[2].worst)}) is still a profit. Ana might take 20 if she can’t afford a disappointing day, accepting ${usd(PLAN[2].e - PLAN[1].e)} less on average for a smaller spread. The answer rests on her subjective probabilities, so it is worth asking how much they would have to change before 20 or 40 became the better choice.` },
  ],

  demo: [
    { widget: 'dv-binomial', intro: 'Subscriptions among the next 20 orders, with p from the spring. The default shows P(X ≥ 12). Switch to “P(X = k)” to see single bars, or change p to 0.58 (about the app share) and watch the whole distribution move right; set n = 100 and it becomes almost bell-shaped.' },
    { widget: 'dv-poisson', intro: 'Orders per day as a Poisson distribution with λ = 1.893. Compare each bar, multiplied by 122 days, with the observed days in the chart below; then raise λ to see how a busier shop’s days would spread out.' },
    { widget: 'dv-fit', intro: 'Observed spring days by number of orders against the days the Poisson model expects. The bars almost match; the biggest gap is at four orders.' },
  ],

  mistakes: [
    { title: '“P(at least 12) is 1 − BINOM.DIST(12, …, TRUE).”', html: 'That subtracts P(X ≤ 12) and leaves P(X > 12), which drops the 12 itself. “At least k” is 1 − P(X ≤ k − 1): <x>=1-BINOM.DIST(11,20,p,TRUE)</x>, or <x>=BINOM.DIST.RANGE(20,p,12,20)</x>.' },
    { title: '“Any count of yes/no outcomes is binomial.”', html: 'Only with a fixed number of independent trials and the same p on each. Twenty orders from a mix of app and web customers, or several from one customer, break the constant-p or independence condition. State the p you assume and check whether it holds.' },
    { title: '“Plan for the expected value.”', html: 'The expected demand for gift boxes is 23, but the stock with the highest expected profit is 30, because unsold and unmet boxes cost different amounts. In general the expected value of a profit is not the profit at the expected demand.' },
    { title: '“Any count per period is Poisson.”', html: 'The Poisson needs independent events at a constant rate. Orders that bunch after a promotion, or a weekly pattern, make the variance larger than the mean. Compare the mean and the variance, and the observed and expected counts, before relying on the model.' },
    { title: '“An expected value is the most likely value.”', html: 'It is a long-run average and needn’t be possible: 1.89 orders a day. For subscriptions in 20 orders the most likely count is 9, with a probability of only 0.177.' },
  ],

  application: [
    { p: 'Counts drive many operational decisions, and the binomial and the Poisson are the first models a planner reaches for. A call centre sizes its shifts from the Poisson distribution of calls per half hour; an airline that sells more tickets than seats uses the binomial distribution of no-shows; a quality team sets an acceptance rule for a delivery from the binomial distribution of defective items in a sample. In each case the model turns an average into the probability of the bad day the business must plan for.' },
    { p: 'Expected values are how such decisions are compared, but rarely the whole story. Two plans with similar expected profits can carry very different risks, which the standard deviation and the worst case show; and the probabilities behind an expected value are often judgements, as Ana’s are. Good practice is to show the expected value, the spread and the worst case side by side, and to test how far the inputs can move before the decision changes.' },
    { case: `Ana takes 30 gift boxes to the market and writes her stock rule for the shop: over a spring like this one, the Poisson model expects about ${f(EXP[0], 0)} of ${DAYS} days with no orders and about ${f(DAYS * pFivePlus, 0)} with five or more, so she will keep enough packed stock for a five-order day. For subscriptions she quotes the binomial range, “about 9 in the next 20, usually between ${lo2} and ${hi2}”, and notes that the figure assumes the spring’s mix of web and app orders.` },
  ],

  summary: [
    'A discrete random variable takes separate values; its probability distribution lists each value with a probability, and the probabilities add to 1.',
    'E(X) = Σ x P(x) is the long-run average; σ² = Σ (x − μ)² P(x) and σ is its square root. In Excel, SUMPRODUCT does both.',
    'The binomial counts successes in n independent trials with the same p: P(X = k) = C(n, k) pᵏ(1 − p)ⁿ⁻ᵏ, mean np, SD √(np(1 − p)).',
    'BINOM.DIST(k, n, p, FALSE) is exactly k, TRUE at most k; “at least k” is 1 − BINOM.DIST(k − 1, n, p, TRUE); BINOM.DIST.RANGE gives a range.',
    'The Poisson counts independent events at a constant rate λ: P(X = k) = e^(−λ) λᵏ ÷ k!, with mean and variance both λ; POISSON.DIST in Excel.',
    'Check a model against the data: observed against expected counts, and the variance against the mean for a Poisson.',
    'For large n and small p the binomial is close to a Poisson with λ = np; the time between Poisson events is exponential with mean 1/λ (EXPON.DIST).',
    'Compare decisions under uncertainty by their expected values and their spread; the expected value of a profit isn’t the profit at the expected demand.',
  ],

  glossary: [
    { term: 'Random variable', def: 'A number determined by the outcome of an experiment, such as the number of orders on a day. It is discrete if it takes separate values (usually counts) and continuous if it can take any value in a range.' },
    { term: 'Probability distribution', def: 'For a discrete random variable, a list or formula giving every value it can take and its probability, with the probabilities adding to 1; for a continuous variable, a density curve whose area over a range is the probability of that range.' },
    { term: 'Binomial distribution', def: 'The distribution of the number of successes in n independent trials, each with the same probability p of success; its mean is np and its standard deviation √(np(1 − p)).' },
    { term: 'Poisson distribution', def: 'The distribution of the number of events in a fixed interval when events occur independently at a constant average rate λ; its mean and variance both equal λ.' },
    { term: 'Exponential distribution', def: 'A continuous distribution of the time between events in a Poisson process with rate λ; its mean is 1/λ and P(T ≤ t) = 1 − e^(−λt).' },
  ],

  references: [
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Business Statistics 2e</i>, section 4.2, “Binomial Distribution”. OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/4-2-binomial-distribution', checked: '2026-10-24' },
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Business Statistics 2e</i>, section 4.4, “Poisson Distribution” (conditions, and approximating the binomial). OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/4-4-poisson-distribution', checked: '2026-10-24' },
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Business Statistics 2e</i>, section 5.3, “The Exponential Distribution”. OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/5-3-the-exponential-distribution', checked: '2026-10-24' },
    { text: 'Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Statistics 2e</i>, section 4.2, “Mean or Expected Value and Standard Deviation”. OpenStax.', url: 'https://openstax.org/books/introductory-statistics-2e/pages/4-2-mean-or-expected-value-and-standard-deviation', checked: '2026-10-24' },
    { text: 'Microsoft Support. “BINOM.DIST function”, with the pages for BINOM.DIST.RANGE, POISSON.DIST and EXPON.DIST.', url: 'https://support.microsoft.com/en-us/excel/functions/binom-dist-function', checked: '2026-10-24' },
    { text: 'NIST/SEMATECH. <i>e-Handbook of Statistical Methods</i>, sections 1.3.6.6.18, “Binomial Distribution”, and 1.3.6.6.19, “Poisson Distribution”.', url: 'https://www.itl.nist.gov/div898/handbook/eda/section3/eda366j.htm', checked: '2026-10-24' },
  ],

  checks: [
    // orders per day
    { what: 'Spring days', value: DAYS, shown: 122 },
    { what: 'Days with 0 orders', value: CNT[0], shown: 18 },
    { what: 'Days with 1 order', value: CNT[1], shown: 35 },
    { what: 'Days with 2 orders', value: CNT[2], shown: 33 },
    { what: 'Days with 3 orders', value: CNT[3], shown: 18 },
    { what: 'Days with 4 orders', value: CNT[4], shown: 14 },
    { what: 'Days with 5 orders', value: CNT[5], shown: 4 },
    { what: 'No day had more than 5', value: Math.max(...ORDERS_PER_DAY), shown: 5 },
    { what: 'P(X=0)', value: PX[0], shown: 0.148, tol: 0.0005 },
    { what: 'P(X=1)', value: PX[1], shown: 0.287, tol: 0.0005 },
    { what: 'P(X=5)', value: PX[5], shown: 0.033, tol: 0.0005 },
    { what: 'E(X)', value: EX, shown: 1.893, tol: 0.0005 },
    { what: 'E(X) two decimals', value: EX, shown: 1.89 },
    { what: 'E(X) = orders / days', value: D.orders.n / DAYS, shown: EX, tol: 1e-12 },
    { what: 'Sum k × days', value: sum(K.map((k) => k * CNT[k])), shown: 231 },
    { what: 'Sum k² × days', value: sum(K.map((k) => k * k * CNT[k])), shown: 653 },
    { what: 'E(X²)', value: sum(K.map((k) => k * k * PX[k])), shown: 5.352, tol: 0.0005 },
    { what: 'E(X) squared', value: EX ** 2, shown: 3.585, tol: 0.0005 },
    { what: 'Var(X)', value: VX, shown: 1.767, tol: 0.0005 },
    { what: 'Var(X) two decimals', value: VX, shown: 1.77 },
    { what: 'SD(X)', value: SX, shown: 1.329, tol: 0.0005 },
    { what: 'SD(X) two decimals', value: SX, shown: 1.33 },
    { what: 'Sample variance of days', value: variance(ORDERS_PER_DAY), shown: 1.782, tol: 0.0005 },
    { what: 'Mean of days', value: mean(ORDERS_PER_DAY), shown: 1.893, tol: 0.0005 },
    { what: 'Lambda', value: LAM, shown: 1.893, tol: 0.0005 },
    { what: 'Lambda two decimals', value: LAM, shown: 1.89 },
    { what: 'Lambda in formulas', value: LAM, shown: 1.893, tol: 0.0005 },
    { what: 'Subscription share %', value: P * 100, shown: 45.0, tol: 0.05 },
    // Poisson table
    { what: 'P0 Poisson', value: poissonPmf(0, LAM), shown: 0.1506, tol: 0.00005 },
    { what: 'P1 Poisson', value: poissonPmf(1, LAM), shown: 0.2851, tol: 0.00005 },
    { what: 'P2 Poisson', value: poissonPmf(2, LAM), shown: 0.2699, tol: 0.00005 },
    { what: 'P3 Poisson', value: poissonPmf(3, LAM), shown: 0.1703, tol: 0.00005 },
    { what: 'P4 Poisson', value: poissonPmf(4, LAM), shown: 0.0806, tol: 0.00005 },
    { what: 'P5+ Poisson', value: pFivePlus, shown: 0.0436, tol: 0.00005 },
    { what: 'Expected 0', value: EXP[0], shown: 18.4, tol: 0.05 },
    { what: 'Expected 0 rounded', value: EXP[0], shown: 18, tol: 0.5 },
    { what: 'Expected 1', value: EXP[1], shown: 34.8, tol: 0.05 },
    { what: 'Expected 2', value: EXP[2], shown: 32.9, tol: 0.05 },
    { what: 'Expected 3', value: EXP[3], shown: 20.8, tol: 0.05 },
    { what: 'Expected 4', value: EXP[4], shown: 9.8, tol: 0.05 },
    { what: 'Expected 5+', value: DAYS * pFivePlus, shown: 5.3, tol: 0.05 },
    { what: 'Expected 5+ rounded', value: DAYS * pFivePlus, shown: 5, tol: 0.5 },
    { what: 'Expected days total', value: sum([0, 1, 2, 3, 4].map((k) => EXP[k])) + DAYS * pFivePlus, shown: 122, tol: 1e-9 },
    { what: 'Poisson probabilities total', value: sum([0, 1, 2, 3, 4].map((k) => poissonPmf(k, LAM))) + pFivePlus, shown: 1, tol: 1e-12 },
    // binomial
    { what: 'n', value: NB, shown: 20 },
    { what: 'p', value: P, shown: 0.450, tol: 0.0005 },
    { what: '1 − p', value: 1 - P, shown: 0.550, tol: 0.0005 },
    { what: 'np', value: muB, shown: 9.00, tol: 0.005 },
    { what: 'np one decimal', value: muB, shown: 9.0, tol: 0.05 },
    { what: 'sd binomial', value: sdB, shown: 2.22, tol: 0.006 },
    { what: 'sd binomial about 2', value: sdB, shown: 2, tol: 0.25 },
    { what: 'P(X=9)', value: p9, shown: 0.1771, tol: 0.00005 },
    { what: 'P(X=9) 3dp', value: p9, shown: 0.177, tol: 0.0005 },
    { what: 'P(X=9) less than one in five', value: Number(p9 < 0.2), shown: 1 },
    { what: 'Most likely count is 9', value: [...Array(21).keys()].reduce((a, k) => (binomPmf(k, NB, P) > binomPmf(a, NB, P) ? k : a), 0), shown: 9 },
    { what: 'C(20,9)', value: combin(20, 9), shown: 167960 },
    { what: 'p^9', value: P ** 9, shown: 0.000760, tol: 0.0000005 },
    { what: '(1−p)^11', value: (1 - P) ** 11, shown: 0.001387, tol: 0.0000005 },
    { what: 'P(X<=11)', value: binomCdf(11, NB, P), shown: 0.8688, tol: 0.00005 },
    { what: 'P(X>=12)', value: p12up, shown: 0.1312, tol: 0.00005 },
    { what: 'P(X>=12) 3dp', value: p12up, shown: 0.131, tol: 0.0005 },
    { what: 'P(X>12)', value: binomSf(12, NB, P), shown: 0.0583, tol: 0.00005 },
    { what: 'P(6..12)', value: p6to12, shown: 0.8866, tol: 0.00005 },
    { what: 'P(6..12) 3dp', value: p6to12, shown: 0.887, tol: 0.0005 },
    { what: 'BINOM.INV 95%', value: inv95, shown: 13 },
    { what: 'mean − 2sd', value: muB - 2 * sdB, shown: 4.6, tol: 0.05 },
    { what: 'mean + 2sd', value: muB + 2 * sdB, shown: 13.5, tol: 0.05 },
    { what: 'lower count', value: lo2, shown: 5 },
    { what: 'upper count', value: hi2, shown: 13 },
    { what: 'P(5..13)', value: pWithin2, shown: 0.960, tol: 0.0005 },
    { what: 'App p', value: PAPP, shown: 0.576, tol: 0.0005 },
    { what: 'App p %', value: PAPP * 100, shown: 57.6, tol: 0.05 },
    { what: 'Web p %', value: PWEB * 100, shown: 35.6, tol: 0.05 },
    { what: 'App subscriptions', value: ASUB, shown: 57 },
    { what: 'App orders', value: ASUB + AONE, shown: 99 },
    { what: 'P(X>=12) about one time in eight', value: 1 / p12up, shown: 8, tol: 0.5 },
    { what: 'App P(X>=12) about half', value: p12upApp, shown: 0.5, tol: 0.01 },
    { what: 'App mean', value: NB * PAPP, shown: 11.52, tol: 0.005 },
    { what: 'P(X>=12) app', value: p12upApp, shown: 0.507, tol: 0.0005 },
    { what: 'P(X>=12) app 2dp', value: p12upApp, shown: 0.51, tol: 0.005 },
    { what: 'n=3 probabilities', value: three[0], shown: 0.1662, tol: 0.00005 },
    { what: 'n=3 k=1', value: three[1], shown: 0.4082, tol: 0.00005 },
    { what: 'n=3 k=2', value: three[2], shown: 0.3343, tol: 0.00005 },
    { what: 'n=3 k=3', value: three[3], shown: 0.0913, tol: 0.00005 },
    { what: 'C(3,2)', value: combin(3, 2), shown: 3 },
    // approximation and exponential
    { what: 'Binomial(200, 0.02) P(X<=2)', value: approxBin, shown: 0.2351, tol: 0.00005 },
    { what: 'Poisson(4) P(X<=2)', value: approxPois, shown: 0.2381, tol: 0.00005 },
    { what: 'np = 4', value: 200 * 0.02, shown: 4, tol: 1e-12 },
    { what: 'Mean gap (days)', value: gapMeanDays, shown: 0.528, tol: 0.0005 },
    { what: 'Mean gap (hours)', value: gapMeanDays * 24, shown: 12.7, tol: 0.05 },
    { what: 'P(gap > 1 day)', value: gapOver1, shown: 0.1506, tol: 0.00005 },
    { what: 'P(gap > 1 day) = P(X=0)', value: gapOver1, shown: poissonPmf(0, LAM), tol: 1e-12 },
    { what: 'P(gap < 6 hours)', value: gapUnderQuarter, shown: 0.377, tol: 0.0005 },
    // gift boxes
    { what: 'Gift box price (B03)', value: PRICE, shown: 58 },
    { what: 'Gift box cost (B03)', value: COST, shown: 20 },
    { what: 'Markdown price', value: MARKDOWN, shown: 12 },
    { what: 'Profit 30 stock, 20 demand', value: profit(30, 20), shown: 680 },
    { what: 'Profit 30 stock, 10 demand', value: profit(30, 10), shown: 220 },
    { what: 'Profit 30 stock, 30 demand', value: profit(30, 30), shown: 1140 },
    { what: 'Profit 30 stock, 40 demand', value: profit(30, 40), shown: 1140 },
    { what: 'Expected profit 10', value: PLAN[0].e, shown: 380 },
    { what: 'Expected profit 20', value: PLAN[1].e, shown: 668 },
    { what: 'Expected profit 30', value: PLAN[2].e, shown: 772 },
    { what: 'Expected profit 40', value: PLAN[3].e, shown: 738 },
    { what: 'SD profit 10', value: PLAN[0].sd, shown: 0 },
    { what: 'SD profit 20', value: PLAN[1].sd, shown: 184 },
    { what: 'SD profit 30', value: PLAN[2].sd, shown: 344, tol: 0.5 },
    { what: 'SD profit 40', value: PLAN[3].sd, shown: 414 },
    { what: 'Worst case 10', value: PLAN[0].worst, shown: 380 },
    { what: 'Worst case 20', value: PLAN[1].worst, shown: 300 },
    { what: 'Worst case 30', value: PLAN[2].worst, shown: 220 },
    { what: 'Worst case 40', value: PLAN[3].worst, shown: 140 },
    { what: 'Best stock', value: best.q, shown: 30 },
    { what: 'Expected demand', value: ED, shown: 23 },
    { what: 'Leftover cost', value: COST - MARKDOWN, shown: 8 },
    { what: 'Missed sale', value: PRICE - COST, shown: 38 },
    { what: 'Gap 30 vs 20', value: PLAN[2].e - PLAN[1].e, shown: 104 },
    { what: 'Demand probabilities add to 1', value: sum(DEMAND.map((x) => x[1])), shown: 1, tol: 1e-12 },
  ],
};
