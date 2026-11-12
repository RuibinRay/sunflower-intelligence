// measuring-risk.js — F06 · Measuring risk. Content only; exercises are in measuring-risk.ex.js.
// The market history is SIMULATED (case.js SERIES, from tools/study/f06-data.py: the market’s monthly excess returns
// were drawn from a Student t distribution with 5 degrees of freedom, plus a planted March 2020 crash, a weak 2022 for
// shares and a planted 13% fall for bonds in 2022). Ana’s plans come from case.js (F04, F00). Real-market figures are
// quoted from Damodaran’s historical returns page and Fama (1965); the time-horizon advice from Investor.gov.
import { MONTHS, SERIES, ANA, RISK_PROFILE, DERIVED } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';
import { normCdf } from '../../../core/inference.js?v=31';

const st = DERIVED.stats;
const mean = (r) => r.reduce((a, b) => a + b, 0) / r.length;
const sdS = (r) => { const m = mean(r); return Math.sqrt(r.reduce((s, v) => s + (v - m) ** 2, 0) / (r.length - 1)); };
const kurt = (r) => { const n = r.length, m = mean(r), s = sdS(r); const s4 = r.reduce((a, v) => a + ((v - m) / s) ** 4, 0); return n * (n + 1) / ((n - 1) * (n - 2) * (n - 3)) * s4 - 3 * (n - 1) ** 2 / ((n - 2) * (n - 3)); };
const M = SERIES.market, mM = mean(M), sM = sdS(M);
const iMar20 = MONTHS.indexOf('2020-03'), iApr15 = MONTHS.indexOf('2015-04');
const zMar20 = (M[iMar20] - mM) / sM;
const beyond3 = M.filter((v) => Math.abs(v - mM) > 3 * sM).length;
const yearsM = IV.yearly(MONTHS, M).map((y) => y.ret);
const roll = (k, n) => { const o = []; for (let i = 0; i + n <= SERIES[k].length; i++) o.push(SERIES[k].slice(i, i + n).reduce((p, v) => p * (1 + v), 1) - 1); return o; };
const annRoll = (k, n) => roll(k, n).map((v) => (1 + v) ** (12 / n) - 1).sort((a, b) => a - b);
const H = [12, 36, 60, 120].map((n) => { const a = annRoll('market', n), c = roll('market', n); return { n, worst: a[0], median: a[(a.length - 1) / 2], best: a.at(-1), count: a.length, losses: c.filter((v) => v < 0).length }; });
const r48 = roll('market', 48), worst48 = Math.min(...r48), i48 = r48.indexOf(worst48);
const ddM = IV.maxDrawdown(M), ddB = IV.maxDrawdown(SERIES.bonds);
const underwater = (r) => { const w = IV.wealth(r); let pk = w[0], cur = 0, best = 0; w.forEach((v) => { pk = Math.max(pk, v); if (v < pk) { cur += 1; best = Math.max(best, cur); } else cur = 0; }); return best; };
const wM = IV.wealth(M);
const i19 = MONTHS.indexOf('2019-12') + 1, i20 = iMar20 + 1;
const SCEN = IV.scenarios([{ p: 0.25, r: 0.30 }, { p: 0.50, r: 0.10 }, { p: 0.25, r: -0.15 }]);
const A = st.market;
const num = (s) => parseFloat(String(s).replace('−', '-').replace(/[%$,]/g, ''));
const pct = (v, d = 1) => `${v < 0 ? '−' : ''}${Math.abs(v * 100).toFixed(d)}%`;

const TRADE = [
  ['bills', 'One-month bills', '2.03%', '0.56%', '0.1%', '0.0%'],
  ['bonds', 'Aggregate Bond Index Fund', '4.31%', '4.14%', '−13.0%', '−13.4%'],
  ['market', 'Total Market Index Fund', '10.43%', '16.00%', '−26.9%', '−39.1%'],
  ['intl', 'International Index Fund', '10.27%', '17.50%', '−35.6%', '−48.3%'],
  ['morrow', 'Morrow &amp; Pike (one share)', '9.59%', '25.25%', '−30.7%', '−67.9%'],
  ['harbour', 'Harbour Street (one share)', '12.53%', '32.03%', '−33.6%', '−50.6%'],
];
const HROWS = [
  ['1 year', '−39.1%', '10.7%', '73.9%', '42 of 169'],
  ['3 years', '−12.1%', '9.6%', '29.3%', '36 of 145'],
  ['5 years', '−6.5%', '4.8%', '24.2%', '34 of 121'],
  ['10 years', '3.3%', '6.1%', '10.3%', '0 of 61'],
];

export default {
  slug: 'measuring-risk',
  title: 'Measuring risk',
  blurb: 'Put numbers on how far returns can stray: variance and standard deviation from scenarios and history, annualised volatility, what a normal distribution would predict and where real returns break it, worst years and drawdowns, and how the time until you need the money changes what risk means.',
  status: 'draft',
  objectives: [
    'Calculate the variance and standard deviation of returns from scenarios and from a sample of past returns, and annualise a monthly standard deviation.',
    'Use the normal distribution to estimate the chance of a return below a threshold, and explain why fat tails make that estimate too low for extreme losses.',
    'Measure downside risk directly with worst periods and the maximum drawdown.',
    'Explain how the spread of outcomes changes with the holding period, and judge whether money needed by a given date belongs in shares.',
    'Compare the risk and return of bills, bonds, share funds and single shares, and describe the risk–return trade-off and where it fails.',
  ],
  prerequisites: [
    { lesson: 'f06/measuring-returns', why: 'Arithmetic and geometric means, annualising and the simulated fund history.' },
    { lesson: 'b04/describing-distributions', why: 'Variance and standard deviation, and why a sample divides by n − 1 (recommended).' },
    { lesson: 'b04/normal-distribution', why: 'z-scores and probabilities from the normal curve (recommended).' },
    { lesson: 'f00/finance-time-and-risk', why: 'Risk as outcomes that may differ from what was expected.' },
    { lesson: 'f00/capital-and-liquidity', why: 'Liquidity and the emergency fund.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Ana now knows the simulated total market fund grew 9.57% a year compounded over fifteen years. Her accountant’s first question is the right one: “And how bad did it get?” Ana also has a second pot to think about. She is saving $914.19 a month for a $60,000 flat deposit she needs in April 2032, less than four years away, and she has wondered whether that money, too, should go into the fund that earned so much more than her savings account.' },
    { p: 'In finance, <g>risk</g> is the chance that an outcome differs from what you expected. For an investment it is the spread of the returns it might earn. A fund that always returns 4% has none; one that might return +30% or −30% has a great deal, even if both expect the same on average. The most used measure of that spread is the <g>standard deviation</g> of returns, the square root of the <g>variance</g>; applied to an investment’s returns and stated for a year, it is usually called <g>volatility</g>.' },
    { p: 'A standard deviation summarises the spread in one number, but it treats a surprise gain like a surprise loss and says nothing directly about how bad the worst outcomes are. So investors also look at the worst outcomes themselves: the worst year, and the <g>drawdown</g>, the fall from a previous peak. And they ask what risk means over the time they will hold the investment, their <g>time horizon</g>, because a fall that is recovered over thirty years can ruin a plan that needs the money in four.' },
    { table: {
      caption: 'Return and risk, January 2013 – December 2027 (simulated)',
      head: ['Asset (all fictional)', 'Mean a year', 'SD a year', 'Worst year', 'Largest drawdown'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: TRADE.map((r) => r.slice(1)),
      note: 'Mean: arithmetic, mean monthly return × 12. SD: sample standard deviation of monthly returns × √12. Worst year: worst calendar-year return. Largest drawdown: the largest fall in value from a previous month-end peak. Simulated for teaching, not real market history.',
    } },
    { p: 'Read down the table and the pattern of this lesson appears. Among bills, bonds and the share funds, more volatility came with a higher mean return: the <g>risk–return trade-off</g>. But the single shares had far more volatility than the market fund without more return to match, and the market fund’s worst fall, −39.1%, was much deeper than its worst calendar year.' },
  ],

  theory: [
    { h: 'Variance and standard deviation from scenarios' },
    { p: String.raw`When the possible returns and their probabilities are set out as scenarios, the variance is the probability-weighted average squared distance from the expected return: <m>\sigma^2 = \sum_s p_s\,[r_s - E(r)]^2</m>, and the standard deviation <m>\sigma</m> is its square root, in the same units as the returns. The previous lesson’s fictional scenarios for the market fund next year (+30%, +10% and −15% with probabilities 0.25, 0.50 and 0.25) have an expected return of 8.75%. Their variance is <m>0.25(21.25)^2 + 0.50(1.25)^2 + 0.25(-23.75)^2 = 254.69</m> in squared percentage points, so <m>\sigma = 15.96\%</m>.` },

    { h: 'Variance and standard deviation from history' },
    { p: String.raw`From <m>n</m> past returns with mean <m>\bar r</m>, the sample variance is <m>s^2 = \sum_t (r_t - \bar r)^2 \div (n - 1)</m>. Dividing by <m>n - 1</m> rather than <m>n</m> corrects for measuring the distances from the sample’s own mean (B04 explains why). In a spreadsheet it is <x>=STDEV.S(range)</x>. OpenStax treats the standard deviation of historical returns in the same way, as the measure of an investment’s volatility.` },
    { p: 'The simulated market fund’s 180 monthly returns have a mean of 0.869% and a standard deviation of 4.618% a month. A month 4.6 points above or below the mean was ordinary; a month of −17% was not.' },
    { h: 'Annualising a standard deviation' },
    { p: String.raw`If monthly returns are independent and have the same distribution, the variance of a year’s total is twelve times the monthly variance, so the standard deviation grows with the square root of time: <m>\sigma_{\text{year}} = \sigma_{\text{month}}\sqrt{12}</m>. The market fund’s <m>4.618\% \times \sqrt{12} = 16.00\%</m>; the bond fund’s 1.19% a month is 4.14% a year. Means scale with time but standard deviations with its square root, which is why the course multiplies a monthly mean by 12 but a monthly SD by √12.` },
    { p: 'Bills’ standard deviation, 0.56% a year, needs care. A one-month bill’s return is known on the day you buy it, so a bill holder faces no risk of loss over the month. The figure measures how much the bill rate itself changed over fifteen years, from near zero to about 5%. For an investor the risk in bills is different: the rate may fall, and after inflation the return may be negative, as the previous lesson found.' },

    { h: 'What a normal distribution would imply' },
    { p: String.raw`If yearly returns followed a <g>normal distribution</g> with the market fund’s mean of 10.43% and SD of 16.00%, about two years in three would fall within one SD of the mean (−5.6% to 26.4%) and about 95% within two (−21.6% to 42.4%). The chance of a loss in a year would be <m>\Phi(-10.43 \div 16.00) = 25.7\%</m>, and of a year worse than Ana’s −25% limit, <m>\Phi((-25 - 10.43) \div 16.00) = 1.3\%</m>, where <m>\Phi</m> is the standard normal probability below a z-score (Excel’s <x>=NORM.DIST(-0.25,0.1043,0.16,TRUE)</x>). The fund lost money in 5 of its 15 calendar years and had one year below −25%: 2022, at −26.9%. Fifteen yearly returns are too few to test the tails; 180 monthly returns are better.` },
    { h: 'Fat tails' },
    { p: 'A normal distribution puts 0.27% of outcomes more than three standard deviations from the mean: about 0.5 of the market fund’s 180 months. The fund had three such months: −17.0% in March 2020 and gains of 21.6% in April 2015 and 14.9% in April 2025. March 2020 was 3.87 SD below the mean; under a normal distribution a month that bad has a probability of 0.0055%, about once in 18,000 months, or 1,500 years.' },
    { p: 'Distributions with more extreme outcomes than the normal have <g>fat tails</g>, and their <g>kurtosis</g> measures it: Excel’s <x>=KURT(range)</x> returns the excess kurtosis, 0 for normal data and 3.09 for these monthly returns. This is no accident of the sample: the simulation drew the market’s monthly excess returns from a t distribution with 5 degrees of freedom, whose tails are fatter than the normal’s, and added the March 2020 crash on purpose, because that is what real returns look like. Fama’s classic 1965 study of the daily price changes of the thirty Dow Jones Industrial shares found that “in every case the empirical distributions are more peaked in the center and have longer tails than the normal distribution.” The practical rule follows: a standard deviation and a normal curve describe ordinary months well and understate the chance of extreme ones, so look at the extremes directly as well.' },
    { callout: 'note', title: 'Real extremes', html: 'Damodaran’s table of US returns shows the S&amp;P 500, with dividends, returning −43.84% in 1931 and −36.55% in 2008, and in 2022 −18.04% while ten-year Treasury bonds returned −17.83%: shares and bonds fell together. The simulated history is milder than the real one’s worst years.' },

    { h: 'Worst periods and drawdowns' },
    { p: String.raw`A drawdown is the fall in an investment’s value from its highest previous value: at each date, <m>DD_t = W_t \div \max_{s \le t} W_s - 1</m>, where <m>W</m> is the wealth index. The <g>maximum drawdown</g> is the largest such fall over a period. It answers the question an investor feels: “How much could I have lost from the top?”` },
    { p: 'The simulated market fund’s maximum drawdown was −39.1%, from the end of September 2021 to the end of September 2022, deeper than any calendar year because it spans two. The fund then spent 57 months below its 2021 peak before regaining it at the end of July 2026. The March 2020 crash was sharper but shorter: −24.6% from the end of 2019 in three months, regained by the end of August 2021. The bond fund’s maximum drawdown was −13.4% (December 2021 to October 2022), the planted fall of 2022 as interest rates rose, an example of <g>interest-rate risk</g> (the bond lesson explains why rising yields lower bond prices), and it took until March 2025 to recover.' },

    { h: 'Risk and the time horizon' },
    { p: 'How risky shares are depends on how long you hold them, but in two opposite senses. Over longer periods good and bad years partly offset, so the spread of the <i>annual average</i> return narrows: with independent years it shrinks with the square root of the horizon, from 16% for one year to 8% over four and 2.9% over thirty. But the spread of the <i>ending wealth</i>, in dollars, keeps widening, because the uncertainty compounds. Both are true; which matters depends on the decision.' },
    { table: {
      caption: 'The simulated market fund over every window of a given length (annualised returns, overlapping windows)',
      head: ['Window', 'Worst', 'Median', 'Best', 'Windows with a loss'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: HROWS,
      note: 'Windows start each month from January 2013; a 10-year window starting in January 2013 ends in December 2022. Overlapping windows share most of their months, so they are far from independent evidence, and fifteen years contain only one full 15-year period. Simulated.' } },
    { p: 'In this history the worst one-year window lost 39.1%, the worst five-year window still lost 6.5% a year, and no ten-year window lost money. Do not read that last line as a law: the simulated data hold only about five years of starting months for ten-year windows, and real markets have had long stretches when shares trailed bonds. What the table does show reliably is the first column: over a few years, shares can lose a large part of their value and not recover in time.' },
    { p: 'For money needed on a known date, the risk that counts is the value on that date. Investor.gov puts it plainly: “A portfolio heavily weighted in stock or stock mutual funds, for instance, would be inappropriate for a short-term goal, such as saving for a family’s summer vacation.” The same guide notes that “investing solely in cash investments may be appropriate for short-term financial goals,” and that investors willing to ride out the volatile returns of stocks over long periods have generally been rewarded. The time horizon decides which risk measure matters.' },

    { h: 'The risk–return trade-off, and where it fails' },
    { p: 'Across bills, bonds and the share funds, investors who accepted more volatility earned more on average: the trade-off that makes investing worthwhile at all. It holds for broad classes of investment because they carry risk that no one can diversify away, <g>systematic risk</g>, and investors must be paid to bear it. It does not hold for every single investment. Morrow &amp; Pike’s shares had a volatility of 25.25% and earned less than the market fund; their price fell 67.9% at worst. Much of a single share’s risk is specific to the company and can be removed by holding many shares, so the market does not pay for it: the subject of the diversification lesson in module 3.' },
    { p: 'Ana’s answer to her questionnaire, that she could live with a worst year of about −25%, can now be checked against the data. The market fund’s worst calendar year, −26.9%, was just beyond it, and its worst twelve months, −39.1%, far beyond. A portfolio entirely in shares would have tested her limit; the efficient-portfolios lesson shows how adding bonds and bills sets the risk to fit it.' },
  ],

  formulas: [
    { id: 'risk-sd-scen', name: 'Variance and standard deviation from scenarios',
      tex: String.raw`\sigma^2 = \sum_{s=1}^{S} p_s\,[r_s - E(r)]^2, \qquad \sigma = \sqrt{\sigma^2}`,
      where: [[String.raw`\sigma^2`, 'Variance of the return', '%²'], [String.raw`\sigma`, 'Standard deviation of the return', '%'], [String.raw`p_s`, 'Probability of scenario s', ''], [String.raw`r_s`, 'Return in scenario s', '%'], [String.raw`E(r)`, 'Expected return, Σ p_s r_s', '%'], [String.raw`S`, 'Number of scenarios', '']],
      assumptions: 'The scenarios cover every outcome and their probabilities sum to 1. No n − 1: this is a whole distribution, not a sample.' },
    { id: 'risk-sd-sample', name: 'Sample variance and standard deviation of returns',
      tex: String.raw`s^2 = \dfrac{1}{n-1}\sum_{t=1}^{n} (r_t - \bar r)^2, \qquad s = \sqrt{s^2}`,
      where: [[String.raw`s^2`, 'Sample variance', '%² per period'], [String.raw`s`, 'Sample standard deviation', '% per period'], [String.raw`r_t`, 'Return in period t', '%'], [String.raw`\bar r`, 'Arithmetic mean of the returns', '%'], [String.raw`n`, 'Number of returns', '']],
      note: 'Excel: =VAR.S(range) and =STDEV.S(range).' },
    { id: 'risk-annualise-sd', name: 'Annualising a monthly standard deviation',
      tex: String.raw`\sigma_{\text{year}} = \sigma_{\text{month}} \times \sqrt{12}`,
      where: [[String.raw`\sigma_{\text{year}}`, 'Standard deviation of yearly returns (volatility)', '% per year'], [String.raw`\sigma_{\text{month}}`, 'Standard deviation of monthly returns', '% per month']],
      assumptions: 'Monthly returns are independent and identically distributed, so variances add. For T years of independent returns, the SD of the average annual return is σ ÷ √T.' },
    { id: 'risk-normal-prob', name: 'Probability of a return below a threshold, if returns were normal',
      tex: String.raw`P(r < x) = \Phi\!\left(\dfrac{x - \mu}{\sigma}\right)`,
      where: [[String.raw`P(r < x)`, 'Probability that the return r falls below x', ''], [String.raw`r`, 'The return over the period', '%'], [String.raw`x`, 'The threshold return', '%'], [String.raw`\mu`, 'Mean return', '%'], [String.raw`\sigma`, 'Standard deviation of the return', '%'], [String.raw`\Phi`, 'Standard normal cumulative probability (Excel’s NORM.S.DIST(z,TRUE))', '']],
      assumptions: 'Returns are normally distributed. Real returns have fatter tails, so this understates the chance of extreme losses.' },
    { id: 'risk-drawdown', name: 'Drawdown',
      tex: String.raw`DD_t = \dfrac{W_t}{\max_{s \le t} W_s} - 1`,
      where: [[String.raw`DD_t`, 'Drawdown at date t (zero or negative)', '%'], [String.raw`W_t`, 'Wealth index (value of $1 invested at the start) at date t', '$'], [String.raw`\max_{s \le t} W_s`, 'Highest value of the wealth index up to date t', '$']],
      note: 'The maximum drawdown is the most negative DD over the period. It depends on how often values are measured: month-ends here.' },
  ],

  examples: [
    { level: 'simple', title: 'The spread of the analyst’s scenarios', fictional: true,
      setup: 'An analyst’s fictional scenarios for the market fund next year: +30% with probability 0.25, +10% with 0.50 and −15% with 0.25. What are the expected return, the variance and the standard deviation?',
      steps: [
        'Expected return: <m>0.25 \\times 30 + 0.50 \\times 10 + 0.25 \\times (-15) = 8.75\\%</m>.',
        'Distances from it: <m>30 - 8.75 = 21.25</m>, <m>10 - 8.75 = 1.25</m>, <m>-15 - 8.75 = -23.75</m> percentage points.',
        'Variance: weight the squared distances by their probabilities, <m>0.25 \\times 451.5625 + 0.50 \\times 1.5625 + 0.25 \\times 564.0625 = 254.6875</m> (%²).',
        'Standard deviation: <m>\\sqrt{254.6875} = 15.96\\%</m>.',
      ],
      answer: 'Expected return 8.75%, variance 254.69 %² (0.0255 in decimals), standard deviation 15.96%.',
      interpretation: 'The analyst’s view implies about the same volatility as the simulated history’s 16.00%, so the scenarios are at least consistent with it. The downturn contributes most of the variance, because its distance from the mean is the largest and is squared.' },
    { level: 'challenging', title: 'How abnormal was March 2020?', fictional: true,
      setup: 'The simulated market fund’s 180 monthly returns have a mean of 0.869% and a sample standard deviation of 4.618%. In March 2020 it returned −16.98%. Annualise the standard deviation, find how many standard deviations March 2020 lay below the mean, and compare the normal distribution’s prediction of such months with the data.',
      steps: [
        'Annual volatility: <m>4.618\\% \\times \\sqrt{12} = 16.00\\%</m>.',
        'z-score of March 2020: <m>(-16.98 - 0.869) \\div 4.618 = -3.87</m>.',
        'Under a normal distribution, <m>P(z < -3.87) = 0.0055\\%</m>, so in 180 months we would expect <m>180 \\times 0.000055 = 0.01</m> such months: one in about 18,000 months.',
        'More broadly, a normal distribution puts 0.27% of months beyond ±3 SD: <m>180 \\times 0.0027 = 0.49</m> expected. The data have 3 such months, and an excess kurtosis of 3.09 against the normal’s 0.',
      ],
      answer: 'Volatility 16.00% a year; March 2020 was 3.87 SD below the mean, an event the normal distribution makes about a 1-in-18,000-month occurrence; the data have six times as many 3-SD months as the normal predicts.',
      interpretation: 'The normal model is not useless: it describes most months well. But it badly understates extremes, which is exactly where an investor is hurt. The fat tails were built into these simulated data to mimic real returns; with real data you would see the same check fail in the same way.' },
    { level: 'applied', title: 'Should Ana’s deposit savings go into the market fund?', fictional: true,
      setup: 'Ana needs $60,000 for a flat deposit in April 2032, under four years away. Her savings account pays a variable rate (3.6% in F04) and its balance cannot fall. She asks: over four-year periods, how did the simulated market fund do? Use every 48-month window from January 2013.',
      steps: [
        'There are 133 overlapping 48-month windows. In 46 of them, about one in three, the fund was worth less at the end than at the start.',
        'The worst window ran from January 2020 to December 2023: −28.0% in total. $10,000 invested at the start was worth $7,204 four years later.',
        'The bond fund lost money in none of its 48-month windows (its worst was +0.07%), and bills, by construction, never lose.',
        'Her goal is a fixed sum on a fixed date: a 28% shortfall in the last year would leave her well short, with no time to wait for a recovery like the market fund’s 57 months below its 2021 peak.',
      ],
      answer: 'No: in this history a four-year holding of the market fund lost money about one time in three, and could lose more than a quarter of its value.',
      interpretation: 'The higher average return does not help a goal that must be met on a date. Ana keeps the deposit savings in her savings account and the $6,000 emergency fund in cash, and takes risk only with the 30-year retirement money, where there is time for recoveries. The windows overlap and the history is simulated, so the counts are illustrations, but Investor.gov’s advice points the same way.' },
  ],

  demo: [
    { widget: 'risk-hist', intro: 'The simulated market fund’s 180 monthly returns. Choose the |z| > 3 rule to see which months lie more than three standard deviations from the mean: a normal distribution would expect about half a month; there are three.' },
    { widget: 'risk-normal', intro: 'A normal model of yearly returns with the market fund’s mean and volatility. The shaded area is the chance of a year worse than −25%, Ana’s limit. Raise the standard deviation, or change the threshold, and watch the probability move. Remember that real tails are fatter.' },
    { widget: 'risk-drawdown', intro: 'How far the market fund stood below its previous peak, month by month. Compare the sharp, short fall of 2020 with the longer one that began in 2021, and notice how long the fund stayed below its 2021 peak.' },
    { widget: 'risk-horizon', intro: 'The worst, median and best annualised return of the market fund over every window of 1, 3, 5 and 10 years. The range narrows as the window lengthens, but over a few years losses were common.' },
  ],

  mistakes: [
    { title: 'Annualising a standard deviation by 12', html: 'Means scale with time; standard deviations with its square root. A monthly SD of 4.6% is 16% a year, not 55%. Multiply by √12, and only when months are roughly independent.' },
    { title: 'Treating volatility as the whole of risk', html: 'A standard deviation counts surprise gains as risk too and says nothing about how deep or how long the worst falls were. Report the worst year and the maximum drawdown as well, and judge them against when the money is needed.' },
    { title: 'Trusting the normal curve in the tails', html: 'Returns have fatter tails than the normal: the simulated data had six times the 3-SD months a normal predicts, and real returns behave the same way. Use the normal for ordinary outcomes and look at the historical extremes for the bad ones.' },
    { title: '“Shares are safe in the long run”, so short-term money can go in too', html: 'The annualised spread narrows with time, but losses over three to five years were common in this history and the ending value is what a goal needs. Money for a date within a few years belongs in cash or short, high-quality bonds.' },
    { title: 'Assuming more risk always earns more', html: 'Only risk that cannot be diversified away is rewarded. Single shares carry a great deal of company-specific risk that the market does not pay for, as Morrow &amp; Pike’s lower return with 25% volatility shows.' },
    { title: 'Reading a bill’s standard deviation as risk', html: 'A one-month bill’s return is known when it is bought. Its historical SD measures how the rate changed over the years, not a risk of loss.' },
  ],

  application: [
    { p: '<b>Ana’s two pots.</b> Ana writes her decision in two lines. The deposit savings ($914.19 a month to April 2032) stay in the savings account: the goal is fixed, the date is close, and the data show four-year losses of more than a quarter. The retirement account, with a 30-year horizon, can hold share funds, but only in a mix whose bad years she can live with; module 3 builds that mix. The $6,000 emergency fund stays in cash, where it can be reached at once.' },
    { p: '<b>A fund’s risk page.</b> Before buying a fund, read its volatility, its worst calendar year and its maximum drawdown over as long a period as is shown, and compare them with a broad index fund over the same dates. A fund that reports only a high average return, or only the last three calm years, is not telling you how bad things can get.' },
    { p: '<b>A firm’s cash for a known bill.</b> A battery-storage installer (fictional) has $2 million set aside to pay for a factory extension in nine months. Its treasurer could earn more in a share fund, but a 20% fall would leave the project short. She holds the money in bills and deposits that mature before the payment date: the same horizon rule Ana uses, applied by a business.' },
  ],

  summary: [
    'Risk is the spread of possible returns. Its main measure is the standard deviation, the square root of the variance: from scenarios Σp(r − E(r))², from history Σ(r − r̄)² ÷ (n − 1).',
    'Annualise a monthly SD by √12 (means by 12). The simulated market fund: 4.618% a month, 16.00% a year.',
    'A normal distribution gives quick probabilities, but real returns have fatter tails: extreme months are far more common than it predicts.',
    'Look at the extremes directly: worst year, worst rolling periods and the maximum drawdown (−39.1% for the simulated market fund, 57 months to recover).',
    'Over longer horizons the annualised spread narrows, but losses over a few years are common and the spread of ending wealth widens.',
    'Money needed on a date within a few years belongs in cash-like savings, not shares; long-horizon money can take risk it has time to recover from.',
    'Across broad asset classes more volatility has come with higher average returns; for single shares much of the risk is unrewarded and can be diversified away.',
  ],
  glossary: [
    { term: 'Standard deviation', def: 'A measure of spread: roughly the typical distance of values from their mean, calculated as the square root of the average squared distance (dividing by n − 1 for a sample).' },
    { term: 'Variance', def: 'The average squared distance of values from their mean, dividing by n − 1 for a sample (VAR.S) or by n for a whole population (VAR.P); the square of the standard deviation.' },
    { term: 'Volatility', def: 'The standard deviation of an investment’s returns, usually stated for a year: the most common measure of how much its returns vary.' },
    { term: 'Normal distribution', def: 'The symmetric, bell-shaped continuous distribution fixed by its mean μ and standard deviation σ, written N(μ, σ). About 68%, 95% and 99.7% of its values lie within one, two and three standard deviations of the mean.' },
    { term: 'Kurtosis', def: 'A measure of how heavy a distribution’s tails are. Excel’s KURT reports excess kurtosis, which is about 0 for normally distributed data and positive for heavier tails.' },
    { term: 'Fat tails', def: 'A property of a distribution whose extreme outcomes, far from the mean, are more frequent than a normal distribution with the same mean and standard deviation predicts.' },
    { term: 'Drawdown', def: 'The fall in an investment’s value from its highest previous value, as a percentage of that peak.' },
    { term: 'Maximum drawdown', def: 'The largest drawdown over a period: the biggest percentage fall from a peak to a later low before a new peak is reached.' },
    { term: 'Time horizon', def: 'How long an investor expects to hold an investment before needing the money: the expected number of months, years or decades of investing.' },
    { term: 'Risk–return trade-off', def: 'The tendency for investments with more risk that cannot be diversified away to offer higher expected returns, as payment for bearing it.' },
  ],
  references: [
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 15.1, “Risk and Return to an Individual Asset” (Measuring Risk). OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/15-1-risk-and-return-to-an-individual-asset', checked: '2026-11-11' },
    { text: 'Fama, E. F. (1965). The behavior of stock-market prices. <i>Journal of Business</i>, 38(1), 34–105 (quotation from p. 48).', url: 'https://parisschoolofeconomics.eu/docs/ferriere-nathalie/fama1965.pdf', checked: '2026-11-11' },
    { text: 'U.S. Securities and Exchange Commission, Investor.gov. <i>Beginners’ Guide to Asset Allocation, Diversification, and Rebalancing</i>.', url: 'https://www.investor.gov/additional-resources/general-resources/publications-research/info-sheets/beginners-guide-asset', checked: '2026-11-11' },
    { text: 'Damodaran, A. <i>Historical Returns on Stocks, Bonds and Bills: 1928–2024</i> (data page, updated 5 January 2026; its table runs to 2025). NYU Stern.', url: 'https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html', checked: '2026-11-11' },
  ],
  checks: [
    // the case
    { what: 'Deposit saving a month', value: ANA.deposit.monthly, shown: 914.19 },
    { what: 'Deposit target', value: ANA.deposit.target, shown: 60000 },
    { what: 'Emergency fund', value: ANA.emergency, shown: 6000 },
    { what: 'Ana’s worst year', value: RISK_PROFILE.worstYearShe * 100, shown: -25 },
    { what: 'Market geometric growth', value: st.market.growth * 100, shown: 9.57 },
    { what: 'Months in history', value: M.length, shown: 180 },
    // trade-off table
    ...TRADE.flatMap(([k, name, mu, sd, wy, dd]) => [
      { what: `${name}: mean`, value: st[k].mean * 100, shown: num(mu) },
      { what: `${name}: SD`, value: st[k].sd * 100, shown: num(sd) },
      { what: `${name}: worst year`, value: Math.min(...IV.yearly(MONTHS, SERIES[k]).map((y) => y.ret)) * 100, shown: num(wy), tol: 0.05 },
      { what: `${name}: max drawdown`, value: IV.maxDrawdown(SERIES[k]).drawdown * 100, shown: num(dd), tol: 0.05 },
    ]),
    { what: 'Mean rises with SD across bills, bonds, market', value: st.bills.sd < st.bonds.sd && st.bonds.sd < st.market.sd && st.bills.mean < st.bonds.mean && st.bonds.mean < st.market.mean ? 1 : 0, shown: 1 },
    { what: 'Single shares more volatile than the market fund', value: Math.min(st.morrow.sd, st.harbour.sd) > st.market.sd ? 1 : 0, shown: 1 },
    { what: 'Morrow & Pike earned less than the market with more SD', value: st.morrow.mean < st.market.mean && st.morrow.sd > st.market.sd ? 1 : 0, shown: 1 },
    { what: 'Max drawdown deeper than worst year (market)', value: ddM.drawdown < DERIVED.worstYear.market ? 1 : 0, shown: 1 },
    // scenarios
    { what: 'Scenario expected return', value: SCEN.er * 100, shown: 8.75 },
    { what: 'Distance 1', value: 30 - 8.75, shown: 21.25 },
    { what: 'Distance 2', value: 10 - 8.75, shown: 1.25 },
    { what: 'Distance 3', value: -15 - 8.75, shown: -23.75 },
    { what: 'Squared 1', value: 21.25 ** 2, shown: 451.5625, tol: 1e-6 },
    { what: 'Squared 2', value: 1.25 ** 2, shown: 1.5625, tol: 1e-6 },
    { what: 'Squared 3', value: 23.75 ** 2, shown: 564.0625, tol: 1e-6 },
    { what: 'Scenario variance (%²)', value: SCEN.variance * 1e4, shown: 254.6875, tol: 1e-6 },
    { what: 'Scenario variance (%²), 2 dp', value: SCEN.variance * 1e4, shown: 254.69 },
    { what: 'Scenario variance (decimal)', value: SCEN.variance, shown: 0.0255, tol: 0.00005 },
    { what: 'Scenario SD', value: SCEN.sd * 100, shown: 15.96 },
    // monthly history
    { what: 'Monthly mean', value: mM * 100, shown: 0.869 },
    { what: 'Monthly SD', value: sM * 100, shown: 4.618 },
    { what: 'Monthly SD rounded', value: sM * 100, shown: 4.6, tol: 0.05 },
    { what: 'Annual SD', value: sM * Math.sqrt(12) * 100, shown: 16.00 },
    { what: 'Annual SD equals case', value: A.sd * 100, shown: 16.00 },
    { what: '4.6% × √12 ≈ 16%', value: 4.6 * Math.sqrt(12), shown: 16, tol: 0.1 },
    { what: '4.6% × 12 ≈ 55%', value: 4.6 * 12, shown: 55, tol: 0.5 },
    { what: 'Bonds monthly SD', value: st.bonds.sd / Math.sqrt(12) * 100, shown: 1.19 },
    { what: 'Bonds annual SD', value: st.bonds.sd * 100, shown: 4.14 },
    { what: 'Bills annual SD', value: st.bills.sd * 100, shown: 0.56 },
    { what: 'Bills rate near 0 at its lowest', value: Math.min(...SERIES.bills) * 1200, shown: 0.05, tol: 0.01 },
    { what: 'Bills rate about 5% at its highest', value: Math.max(...SERIES.bills) * 1200, shown: 5.3, tol: 0.1 },
    // normal model
    { what: 'Mean a year', value: A.mean * 100, shown: 10.43 },
    { what: '1 SD low', value: (A.mean - A.sd) * 100, shown: -5.6, tol: 0.05 },
    { what: '1 SD high', value: (A.mean + A.sd) * 100, shown: 26.4, tol: 0.05 },
    { what: '2 SD low', value: (A.mean - 2 * A.sd) * 100, shown: -21.6, tol: 0.05 },
    { what: '2 SD high', value: (A.mean + 2 * A.sd) * 100, shown: 42.4, tol: 0.05 },
    { what: 'P(loss) normal', value: normCdf(-A.mean / A.sd) * 100, shown: 25.7, tol: 0.05 },
    { what: 'P(< −25%) normal', value: normCdf((-0.25 - A.mean) / A.sd) * 100, shown: 1.3, tol: 0.05 },
    { what: 'Losing calendar years', value: yearsM.filter((v) => v < 0).length, shown: 5 },
    { what: 'Calendar years', value: yearsM.length, shown: 15 },
    { what: 'Years below −25%', value: yearsM.filter((v) => v < -0.25).length, shown: 1 },
    { what: '2022 return', value: yearsM[9] * 100, shown: -26.9, tol: 0.05 },
    // fat tails
    { what: 'Normal share beyond 3 SD', value: 2 * normCdf(-3) * 100, shown: 0.27, tol: 0.005 },
    { what: 'Expected 3-SD months', value: 180 * 2 * normCdf(-3), shown: 0.49 },
    { what: 'About half a month', value: 180 * 2 * normCdf(-3), shown: 0.5, tol: 0.02 },
    { what: 'Actual 3-SD months', value: beyond3, shown: 3 },
    { what: 'Six times as many', value: beyond3 / (180 * 2 * normCdf(-3)), shown: 6, tol: 0.2 },
    { what: 'March 2020 return', value: M[iMar20] * 100, shown: -16.98 },
    { what: 'March 2020 rounded', value: M[iMar20] * 100, shown: -17.0, tol: 0.05 },
    { what: 'April 2015 return', value: M[iApr15] * 100, shown: 21.6, tol: 0.05 },
    { what: 'April 2025 return', value: M[MONTHS.indexOf('2025-04')] * 100, shown: 14.9, tol: 0.05 },
    { what: 'April 2025 beyond 3 SD', value: (M[MONTHS.indexOf('2025-04')] - mM) / sM > 3 ? 1 : 0, shown: 1 },
    { what: 'March 2020 z', value: zMar20, shown: -3.87 },
    { what: 'March 2020 normal probability (%)', value: normCdf(zMar20) * 100, shown: 0.0055, tol: 0.00005 },
    { what: 'Expected such months in 180', value: 180 * normCdf(zMar20), shown: 0.01, tol: 0.0005 },
    { what: 'Probability as decimal', value: normCdf(zMar20), shown: 0.000055, tol: 5e-7 },
    { what: 'Once in 18,000 months', value: 1 / normCdf(zMar20), shown: 18000, tol: 200 },
    { what: '1,500 years', value: 1 / normCdf(zMar20) / 12, shown: 1500, tol: 20 },
    { what: 'Excess kurtosis', value: kurt(M), shown: 3.09 },
    { what: 'NORM.DIST inputs: mean', value: 0.1043, shown: A.mean, tol: 0.0001 },
    // drawdowns
    { what: 'Market max drawdown', value: ddM.drawdown * 100, shown: -39.1, tol: 0.05 },
    { what: 'Drawdown peak September 2021', value: MONTHS[ddM.peak - 1] === '2021-09' ? 1 : 0, shown: 1 },
    { what: 'Drawdown trough September 2022', value: MONTHS[ddM.trough - 1] === '2022-09' ? 1 : 0, shown: 1 },
    { what: 'Months below the peak', value: underwater(M), shown: 57 },
    { what: 'Regained end of July 2026', value: (() => { for (let i = ddM.trough; i < wM.length; i++) if (wM[i] >= wM[ddM.peak]) return MONTHS[i - 1] === '2026-07' ? 1 : 0; return 0; })(), shown: 1 },
    { what: '2020 fall in three months', value: (wM[i20] / wM[i19] - 1) * 100, shown: -24.6, tol: 0.05 },
    { what: 'End-2019 was the peak before the crash', value: wM[i19] >= Math.max(...wM.slice(0, i19 + 1)) ? 1 : 0, shown: 1 },
    { what: '2020 crash regained end of August 2021', value: (() => { for (let i = i20; i < wM.length; i++) if (wM[i] >= wM[i19]) return MONTHS[i - 1] === '2021-08' ? 1 : 0; return 0; })(), shown: 1 },
    { what: 'Bonds max drawdown', value: ddB.drawdown * 100, shown: -13.4, tol: 0.05 },
    { what: 'Bonds peak December 2021, trough October 2022', value: MONTHS[ddB.peak - 1] === '2021-12' && MONTHS[ddB.trough - 1] === '2022-10' ? 1 : 0, shown: 1 },
    { what: 'Bonds recovered March 2025', value: (() => { const w = IV.wealth(SERIES.bonds); for (let i = ddB.trough; i < w.length; i++) if (w[i] >= w[ddB.peak]) return MONTHS[i - 1] === '2025-03' ? 1 : 0; return 0; })(), shown: 1 },
    { what: 'Bonds 2022', value: DERIVED.worstYear.bonds * 100, shown: -13.0, tol: 0.05 },
    // horizon
    { what: 'SD of the average over 4 years', value: 16 / Math.sqrt(4), shown: 8 },
    { what: 'SD of the average over 30 years', value: 16 / Math.sqrt(30), shown: 2.9, tol: 0.05 },
    ...HROWS.flatMap(([lab, w, md, b, l], i) => [
      { what: `${lab} worst`, value: H[i].worst * 100, shown: num(w), tol: 0.05 },
      { what: `${lab} median`, value: H[i].median * 100, shown: num(md), tol: 0.05 },
      { what: `${lab} best`, value: H[i].best * 100, shown: num(b), tol: 0.05 },
      { what: `${lab} losses`, value: H[i].losses, shown: parseInt(l, 10) },
      { what: `${lab} count`, value: H[i].count, shown: parseInt(l.split(' of ')[1], 10) },
    ]),
    { what: '10-year windows: about five years of start months', value: H[3].count / 12, shown: 5.08, tol: 0.01 },
    { what: '48-month windows', value: r48.length, shown: 133 },
    { what: '48-month losses', value: r48.filter((v) => v < 0).length, shown: 46 },
    { what: 'About one in three', value: r48.filter((v) => v < 0).length / r48.length, shown: 0.35, tol: 0.02 },
    { what: 'Worst 48-month', value: worst48 * 100, shown: -28.0, tol: 0.05 },
    { what: 'Worst 48-month starts Jan 2020', value: MONTHS[i48] === '2020-01' && MONTHS[i48 + 47] === '2023-12' ? 1 : 0, shown: 1 },
    { what: '$10,000 became', value: 10000 * (1 + worst48), shown: 7204, tol: 0.5 },
    { what: 'Bonds worst 48-month', value: Math.min(...roll('bonds', 48)) * 100, shown: 0.07, tol: 0.005 },
    { what: 'Bonds 48-month losses', value: roll('bonds', 48).filter((v) => v < 0).length, shown: 0 },
    { what: 'Bills never lose a month', value: SERIES.bills.every((v) => v >= 0) ? 1 : 0, shown: 1 },
    { what: 'F04 savings rate', value: 3.6, shown: 3.6 },
    { what: 'Morrow volatility', value: st.morrow.sd * 100, shown: 25.25 },
    { what: 'Morrow worst fall', value: IV.maxDrawdown(SERIES.morrow).drawdown * 100, shown: -67.9, tol: 0.05 },
    // real figures quoted
    { what: 'S&P 500 1931', value: -43.84, shown: -43.84 },
    { what: 'S&P 500 2008', value: -36.55, shown: -36.55 },
    { what: 'S&P 500 2022', value: -18.04, shown: -18.04 },
    { what: 'T-bond 2022', value: -17.83, shown: -17.83 },
    { what: 'Fama: thirty Dow shares', value: 30, shown: 30 },
    { what: 'Battery installer cash ($m)', value: 2, shown: 2 },
    { what: 'Nine months', value: 9, shown: 9 },
    { what: '20% fall', value: 20, shown: 20 },
  ],
};
