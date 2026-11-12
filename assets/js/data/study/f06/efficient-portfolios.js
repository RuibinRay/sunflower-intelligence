// efficient-portfolios.js — F06 · Efficient portfolios. Content only; exercises are in efficient-portfolios.ex.js.
// Means and covariances come from case.js (SERIES, DERIVED): SIMULATED monthly history, fictional funds. The
// forward-looking expected returns use F05’s assumptions (MARKET: 4.2% risk-free, 5.5% premium) and each fund’s
// beta against the total-market fund from the same 2013–2027 covariances. Frontier and maximum-Sharpe portfolio from core/portfolio.js; the
// capital allocation line and the optimal risky share from core/investments.js. Ines Varga is fictional.
import { SERIES, MONTHS, DERIVED, MARKET, RISK_PROFILE, ANA } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';
import { moments } from '../../../core/portfolio.js?v=31';

const st = DERIVED.stats, rfH = st.bills.mean, A = RISK_PROFILE.aversionA;
const NAMES = ['market', 'intl', 'bonds'];
const MO = moments(NAMES.map((n) => SERIES[n]), 12), cov = MO.cov;
const sdi = (i) => Math.sqrt(cov[i][i]);
const stats = (w, mu) => ({ er: IV.portRet(w, mu), sd: Math.sqrt(IV.portVar(w, cov)) });
// history
const muH = MO.mu, gmvH = IV.minVariance(muH, cov), tanH = IV.maxSharpe(muH, cov, rfH), TH = stats(tanH, muH);
const shH = NAMES.map((n, i) => IV.sharpe(muH[i], rfH, sdi(i)));
const yH = IV.optimalRiskyShare({ rf: rfH, er: TH.er, sd: TH.sd, A });
const c60 = IV.cal({ y: 0.6, rf: rfH, er: st.market.mean, sd: st.market.sd });
// estimation error
const exM = SERIES.market.map((v, i) => v - SERIES.bills[i]);
const meanEx = exM.reduce((a, b) => a + b, 0) / exM.length;
const sdEx = Math.sqrt(exM.reduce((s, v) => s + (v - meanEx) ** 2, 0) / (exM.length - 1));
const seAnn = sdEx / Math.sqrt(exM.length) * 12, T179 = 1.9733;   // t(179) 97.5% quantile
const diff = SERIES.market.map((v, i) => v - SERIES.intl[i]); const md = diff.reduce((a, b) => a + b, 0) / 180;
const seDiff = Math.sqrt(diff.reduce((s, v) => s + (v - md) ** 2, 0) / 179) / Math.sqrt(180) * 12;
const tanShift = (i, d) => { const mu = muH.slice(); mu[i] += d; return IV.maxSharpe(mu, cov, rfH); };
// forward-looking (CAPM) expected returns, with betas from the same 2013–2027 covariance matrix (cov with market ÷ var)
const betas = NAMES.map((n, i) => cov[i][0] / cov[0][0]);
const muC = betas.map((b) => IV.capm({ rf: MARKET.rf, beta: b, mrp: MARKET.mrp }));
const tanC = IV.maxSharpe(muC, cov, MARKET.rf), TC = stats(tanC, muC), shC = IV.sharpe(TC.er, MARKET.rf, TC.sd);
const shCi = NAMES.map((n, i) => IV.sharpe(muC[i], MARKET.rf, sdi(i)));
const yC = IV.optimalRiskyShare({ rf: MARKET.rf, er: TC.er, sd: TC.sd, A });
const CC = IV.cal({ y: yC, rf: MARKET.rf, er: TC.er, sd: TC.sd });
// worst calendar years
const worstY = (r) => IV.yearly(MONTHS, r).reduce((a, b) => (b.ret < a.ret ? b : a));
const worst = (r) => worstY(r).ret;
const mixSeries = (w, y = 1) => SERIES.market.map((v, i) => y * (w[0] * v + w[1] * SERIES.intl[i] + w[2] * SERIES.bonds[i]) + (1 - y) * SERIES.bills[i]);
// Ines (A = 6)
const yI = IV.optimalRiskyShare({ rf: MARKET.rf, er: TC.er, sd: TC.sd, A: 6 }), CI = IV.cal({ y: yI, rf: MARKET.rf, er: TC.er, sd: TC.sd });
const UC = (y) => { const c = IV.cal({ y, rf: MARKET.rf, er: TC.er, sd: TC.sd }); return c.er - 0.5 * A * c.sd ** 2; };

export default {
  slug: 'efficient-portfolios',
  title: 'Efficient portfolios',
  blurb: 'Find the mixes of funds that give the most expected return for each level of risk, combine the best of them with a safe asset, and choose how much risk to take, while allowing for how little fifteen years of returns really tell you.',
  status: 'draft',
  objectives: [
    'Identify the efficient frontier of a set of assets and explain why portfolios below it are never worth holding.',
    'Calculate the Sharpe ratio and points on the capital allocation line for a mix of a risky portfolio and a risk-free asset.',
    'Explain why the maximum-Sharpe (tangency) portfolio is the best risky portfolio to combine with a risk-free asset.',
    'Calculate the optimal share in the risky portfolio for a given risk aversion, and check it against a worst-year limit and the investor’s horizon.',
    'Evaluate how estimation error in expected returns makes optimised weights unstable, and judge what to do about it.',
  ],
  prerequisites: [
    { lesson: 'f06/diversification', why: 'The two-asset portfolio, covariance and the minimum-variance mix.' },
    { lesson: 'f06/measuring-risk', why: 'Standard deviation, worst years, and how risk depends on the horizon.' },
    { lesson: 'f06/measuring-returns', why: 'Expected returns and the risk premium over bills.' },
    { lesson: 'f00/finance-time-and-risk', why: 'Risk aversion and the risk premium in words.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Ana now knows that holding bonds alongside shares lowers risk faster than it lowers expected return. But there are three funds, not two, and she could also leave some money in a safe account. Which mixes are worth considering at all, and how should she choose among them? She has answered a risk questionnaire from her provider: she says she could live with a worst year of about −25%. All the funds are fictional and their 2013–2027 returns are simulated for teaching; for real long-run figures see Damodaran’s historical returns page (references).' },
    { p: 'Picture every possible mix of the three funds as a point on a chart, with standard deviation (risk) across and expected return up. Some mixes are plainly worse than others: if one mix has a higher expected return <i>and</i> a lower standard deviation than another, nobody who prefers more return and less risk would hold the second. The mixes that are not beaten in this way, the best expected return available at each level of risk, form a curve along the upper-left edge of the cloud of points. That curve is the <g>efficient frontier</g>, and the mixes on it are <g>efficient portfolios</g>.' },
    { p: 'Now add a <b>risk-free asset</b>: one-month bills, or a savings account, whose return is known in advance. Mixing any risky portfolio with it gives a straight line on the chart, the <g>capital allocation line</g>: put a share <m>y</m> in the risky portfolio and <m>1 - y</m> in bills, and both the expected excess return and the standard deviation scale by <m>y</m>. The steepest such line, the one with the most extra return per unit of risk, is the best. Its slope is the <g>Sharpe ratio</g>, and the risky portfolio that gives the steepest line is the <g>maximum-Sharpe portfolio</g>, also called the tangency portfolio because the line just touches the frontier there.' },
    { p: 'That gives a two-step recipe, often called separation. First find the risky portfolio with the highest Sharpe ratio; this step is the same for every investor who agrees on the inputs. Then decide how much to put in it and how much in the safe asset; this step depends on the person: how much risk they can bear, for how long, and what the money is for.' },
    { callout: 'key', title: 'Two decisions, not one', html: 'Which risky portfolio? The one with the highest Sharpe ratio. How much risk? Move along the capital allocation line by changing the share in it. A more cautious investor holds the same risky mix, just less of it.' },
  ],

  theory: [
    { h: 'The frontier of Ana’s three funds' },
    { p: 'From the simulated monthly returns, the annualised means are 10.43% (total market), 10.27% (international) and 4.31% (bonds), with standard deviations of 16.00%, 17.50% and 4.14%. The Explore widget draws the long-only frontier: no fund can have a negative weight, because her account doesn’t allow short selling. The least risky portfolio is 100% bonds, as the diversification lesson found; the frontier then rises to the right until it reaches 100% in the total-market fund. The international fund sits just inside the frontier: it had a slightly lower mean and a higher standard deviation than the home fund and moved closely with it (correlation 0.78), so the frontier holds little of it.' },
    { h: 'The Sharpe ratio and the capital allocation line' },
    { p: 'The Sharpe ratio of a portfolio is its expected <g>excess return</g> (its expected return above the risk-free rate) divided by its standard deviation: <m>S = (E[r_P] - r_f) \\div \\sigma_P</m>. Sharpe (1994) describes it as the expected differential return per unit of risk. Measured against the bills’ fifteen-year average return of 2.03% (the risk-free return earned over the same years), the funds’ historical Sharpe ratios are 0.525 (total market), 0.471 (international) and 0.551 (bonds).' },
    { p: 'Combining a risky portfolio P with bills, a share <m>y</m> in P gives' },
    { math: String.raw`E[r_C] = r_f + y\,(E[r_P] - r_f), \qquad \sigma_C = y\,\sigma_P, \qquad\text{so}\qquad E[r_C] = r_f + S_P\,\sigma_C` },
    { p: 'For example, 60% in the total-market fund and 40% in bills would have had an expected return of <m>2.03\\% + 0.6 \\times 8.40\\% = 7.07\\%</m> and a standard deviation of <m>0.6 \\times 16.00\\% = 9.60\\%</m>, the same Sharpe ratio of 0.525. Mixing with bills slides along a line; it can’t change the slope. With <m>y</m> above 1 the investor borrows at the risk-free rate to hold more than 100% in P, which extends the line beyond P (few individuals can actually borrow that cheaply).' },
    { p: 'The best line is the one through the portfolio with the highest Sharpe ratio. With the historical means, that portfolio holds 14.6% in the total-market fund, 5.3% international and 80.1% bonds, with an expected return of 5.52%, a standard deviation of 5.24% and a Sharpe ratio of 0.667, higher than any single fund’s. Its line lies above every other combination of the funds and bills.' },
    { h: 'Choosing how much risk' },
    { p: 'The usual way to formalise risk tolerance is a <g>mean–variance utility</g>, <m>U = E[r] - \\tfrac{1}{2}A\\sigma^2</m>, where <m>A</m> is the <g>risk-aversion coefficient</g>: how many units of expected return the investor gives up per unit of variance. Maximising U along the capital allocation line gives' },
    { math: String.raw`y^{*} = \dfrac{E[r_P] - r_f}{A\,\sigma_P^2}` },
    { p: 'Ana’s provider scores her questionnaire as <m>A = 3</m>, a moderate value. Applied to the historical tangency portfolio, it gives <m>y^{*} = (5.52\\% - 2.03\\%) \\div (3 \\times 0.0524^2) = 4.24</m>: hold 424% of her money in a bond-heavy portfolio, borrowing 324% at the bill rate. That answer is a warning, not advice. The simulation gives the bond fund a high return per unit of risk (its returns were generated with an expected Sharpe ratio a little above the market’s), and levering such a low-risk portfolio at the bill rate until its risk suits a moderate investor takes 424%. It also assumes she can borrow at the bill rate, which she can’t. Treating fifteen years of estimates as if they were known makes things worse, as the next section shows.' },
    { h: 'Estimation error: why optimisers chase noise' },
    { p: 'An average return from a sample is an estimate with a standard error. The market’s monthly excess return over bills averaged 0.70% with a monthly standard deviation of 4.62%, so the standard error of the mean is <m>4.62\\% \\div \\sqrt{180} = 0.344\\%</m> a month, or 4.13% a year on the annualised mean of 8.40%. A 95% confidence interval for the annual premium runs from 0.24% to 16.56%. Fifteen years of data can’t pin down the expected return of shares to better than several percentage points, and the difference between the home and international funds’ means (0.16% a year, with a standard error of 2.91%) is pure noise.' },
    { p: 'An optimiser, though, treats the estimates as exact and leans hardest on whichever looks best. The table shows what small changes, well within the standard errors, do to the maximum-Sharpe weights.' },
    { table: {
      caption: 'Maximum-Sharpe weights with small changes to one historical mean (simulated data, risk-free 2.03%)',
      head: ['Change', 'Total market', 'International', 'Bonds'],
      align: ['l', 'r', 'r', 'r'],
      rows: [
        ['None', '14.6%', '5.3%', '80.1%'],
        ['International mean +1 point', '9.2%', '11.8%', '79.0%'],
        ['International mean +2 points', '3.8%', '18.3%', '77.9%'],
        ['Bond mean −1 point', '33.8%', '12.2%', '54.0%'],
        ['Total-market mean +2 points', '26.3%', '0.0%', '73.7%'],
      ],
      note: 'Each change is a fraction of the standard error of the mean it alters (about 4.5, 1.1 and 4.1 points a year for international, bonds and total market).',
    } },
    { p: 'The bond fund dominates because its historical Sharpe ratio was the highest of the three. Over 2013–2027 the simulated bond fund earned 2.28 points a year above bills, with a standard error of 1.07 points, and one point less cuts its weight from 80% to 54%. Three remedies are common. Use expected returns from a model rather than raw averages (the CAPM, in the next lesson, gives each fund a return in line with its market risk). Constrain the weights, for example by setting limits on each asset class. And prefer simple, robust mixes to finely optimised ones.' },
    { h: 'A forward-looking version' },
    { p: 'Suppose instead that Ana uses F05’s assumptions, a 4.2% risk-free rate and a 5.5% market risk premium, and gives each fund the CAPM expected return for its beta against the total-market fund (the CAPM lesson explains beta). To keep the inputs consistent, the betas come from the same 2013–2027 covariances as the risks: international 0.85, bonds 0.08. The expected returns become 9.70%, 8.87% and 4.66%. The optimiser’s answer is now striking: the maximum-Sharpe portfolio is <b>100% in the total-market fund</b>, with a Sharpe ratio of 0.344, against 0.267 for international and 0.111 for bonds. The second widget shows it.' },
    { p: 'That is not a coincidence but the CAPM’s own logic: if every asset’s expected return is set by its beta against a portfolio, that portfolio is the efficient one, so the optimiser hands it back. It also shows the model’s weak point. In the CAPM the “market” is all risky assets, home and foreign shares and bonds alike; using the home share fund as the market builds in the answer that only home shares are worth holding. The capm-and-beta lesson returns to this market-proxy problem. In practice it means the forward-looking inputs need judgement too, for example a market proxy that includes international shares and bonds.' },
    { p: 'With the total-market fund as the risky portfolio, the choice is between it and bills. At <m>A = 3</m>, <m>y^{*} = (9.70\\% - 4.2\\%) \\div (3 \\times 0.1600^2) = 0.716</m>: 71.6% in the fund and 28.4% in bills, with an expected return of 8.14% and a standard deviation of 11.46%.' },
    { h: 'Checking the answer against a worst year and the horizon' },
    { p: 'A utility formula is one view of risk tolerance; Ana’s own answer, that she could live with a worst year of about −25%, is another, and easier to feel. In the simulated history the total-market fund’s worst calendar year was −26.9% (2022), just outside her limit. The 71.6/28.4 mix of the fund and bills lost 19.2% that year; mixes of shares and bonds lost 21.3% at 60/40 and 24.1% at 80/20. These checks bracket a range of reasonable mixes rather than pick one: which she chooses within it is Ana’s decision. And a fifteen-year sample’s worst year is not the worst that can happen: real share markets have had worse years than any in this simulation (Damodaran’s table lists every year since 1928), and a worst-year limit should allow for that.' },
    { p: 'The <g>time horizon</g> matters too. This account is for retirement in about 30 years, and she keeps adding $400 a month, so she can wait for a fall to be recovered and even buy more cheaply in it. Her flat deposit, due in April 2032, is a different matter: money needed within a few years can’t wait, so it stays in her savings account, and her $6,000 emergency fund stays in cash. The measuring-risk lesson shows why: over one year the range of outcomes for shares is wide, and a bad year near the date the money is needed can’t be undone. None of this settles Ana’s mix; it shows how the pieces fit together.' },
    { callout: 'warn', title: 'Optimisation amplifies the inputs', html: 'An efficient frontier is only as good as the expected returns, standard deviations and correlations fed into it, and expected returns are the hardest to estimate. Treat optimised weights as a starting point to be checked against common sense, constraints and a worst-case view, not as a precise answer.' },
  ],

  formulas: [
    { id: 'eff-sharpe', name: 'Sharpe ratio',
      tex: String.raw`S_P = \dfrac{E[r_P] - r_f}{\sigma_P}`,
      where: [[String.raw`S_P`, 'Sharpe ratio of portfolio P', ''], [String.raw`E[r_P]`, 'Expected (or average) return of the portfolio', '% per year'], [String.raw`r_f`, 'Risk-free rate over the same period', '% per year'], [String.raw`\sigma_P`, 'Standard deviation of the portfolio’s return', '% per year']],
      assumptions: 'Standard deviation captures the risk that matters, which suits a whole portfolio rather than one holding within it.',
      note: 'Annualise mean and standard deviation before dividing; a monthly Sharpe ratio × √12 is the annual one.' },
    { id: 'eff-cal', name: 'The capital allocation line',
      tex: String.raw`E[r_C] = r_f + y\,(E[r_P] - r_f), \qquad \sigma_C = y\,\sigma_P`,
      where: [[String.raw`y`, 'Share of the money in the risky portfolio P (above 1 means borrowing)', ''], [String.raw`E[r_C],\ \sigma_C`, 'Expected return and standard deviation of the complete portfolio', '% per year'], [String.raw`r_f`, 'Risk-free rate', '% per year'], [String.raw`E[r_P],\ \sigma_P`, 'Expected return and standard deviation of P', '% per year']],
      assumptions: 'The risk-free asset has no risk; borrowing is at the same rate as lending.' },
    { id: 'eff-utility', name: 'Mean–variance utility',
      tex: String.raw`U = E[r] - \tfrac{1}{2}\,A\,\sigma^2`,
      where: [[String.raw`U`, 'Utility: a certainty-equivalent return', 'decimal per year'], [String.raw`E[r]`, 'Expected return', 'decimal per year'], [String.raw`A`, 'Risk-aversion coefficient', ''], [String.raw`\sigma`, 'Standard deviation of return', 'decimal per year']],
      assumptions: 'Investors care only about mean and variance. Use decimals: 0.10 and 0.16, not 10 and 16.' },
    { id: 'eff-optimal-y', name: 'Optimal share in the risky portfolio',
      tex: String.raw`y^{*} = \dfrac{E[r_P] - r_f}{A\,\sigma_P^2}`,
      where: [[String.raw`y^{*}`, 'The share of wealth in P that maximises U', ''], [String.raw`E[r_P] - r_f`, 'Expected excess return of P', 'decimal per year'], [String.raw`A`, 'Risk-aversion coefficient', ''], [String.raw`\sigma_P`, 'Standard deviation of P', 'decimal per year']],
      assumptions: 'Borrowing and lending at r_f. If y* is above 1 and borrowing is not possible, hold all the money in risky assets and move up the frontier instead.' },
  ],

  examples: [
    { level: 'simple', title: 'Sharpe ratios and a mix with bills', fictional: true,
      setup: 'Using the simulated 2013–2027 history (bills averaged 2.03% a year), compare the Sharpe ratios of the total-market fund (mean 10.43%, SD 16.00%) and the bond fund (4.31%, 4.14%), and find the expected return and standard deviation of 60% in the total-market fund and 40% in bills.',
      steps: [
        String.raw`Total market: <m>(10.43\% - 2.03\%) \div 16.00\% = 0.525</m>.`,
        String.raw`Bonds: <m>(4.31\% - 2.03\%) \div 4.14\% = 0.551</m>.`,
        String.raw`60% market, 40% bills: <m>E = 2.03\% + 0.6 \times 8.40\% = 7.07\%</m>; <m>\sigma = 0.6 \times 16.00\% = 9.60\%</m>.`,
        String.raw`Check the slope: <m>(7.07\% - 2.03\%) \div 9.60\% = 0.525</m>, the market fund’s own Sharpe ratio.`,
      ],
      answer: 'Sharpe ratios 0.525 (total market) and 0.551 (bonds); the 60/40 mix with bills expects 7.07% with a standard deviation of 9.60%.',
      interpretation: 'On these historical figures the bond fund gave slightly more excess return per unit of risk, which is why the historical optimiser loads up on it. Mixing a fund with bills changes its risk, never its Sharpe ratio.' },
    { level: 'challenging', title: 'Forward-looking inputs and Ana’s share at A = 3', fictional: true,
      setup: 'Ana gives each fund a CAPM expected return with a 4.2% risk-free rate, a 5.5% market risk premium and betas against the total-market fund from the 2013–2027 covariances (international 0.85, bonds 0.08). The total-market fund’s standard deviation is 16.00%. Find the expected returns, the best risky portfolio, and her share in it at A = 3.',
      steps: [
        String.raw`Expected returns: total market <m>4.2\% + 1 \times 5.5\% = 9.70\%</m>; international <m>4.2\% + 0.85 \times 5.5\% = 8.87\%</m>; bonds <m>4.2\% + 0.08 \times 5.5\% = 4.66\%</m>.`,
        'Sharpe ratios: 0.344 (total market), 0.267 (international), 0.111 (bonds). The maximum-Sharpe portfolio is 100% total market: with returns set by beta against it, nothing improves on it.',
        String.raw`Optimal share: <m>y^{*} = 0.055 \div (3 \times 0.1600^2) = 0.055 \div 0.0768 = 0.716</m>.`,
        String.raw`Mix: <m>E = 4.2\% + 0.716 \times 5.5\% = 8.14\%</m>, <m>\sigma = 0.716 \times 16.00\% = 11.46\%</m>.`,
      ],
      answer: 'The optimiser returns the total-market fund itself; at A = 3 she would hold 71.6% in it and 28.4% in bills (expected 8.14%, standard deviation 11.46%).',
      interpretation: 'The answer follows from treating the home share fund as “the market”. A wider market proxy, with international shares and bonds in it, would give those funds a place. In the simulated history the 71.6/28.4 mix lost 19.2% in its worst year (2022).' },
    { level: 'applied', title: 'A cautious investor near retirement', fictional: true,
      setup: 'Ines Varga (fictional), 61, plans to start drawing on her savings in four years. Her adviser scores her risk aversion at A = 6 and uses the same forward-looking inputs: the total-market fund with an expected return of 9.70% and a standard deviation of 16.00%, and a 4.2% risk-free rate. How should she split her money, and what would the mix have lost in the worst simulated year?',
      steps: [
        String.raw`<m>y^{*} = 0.055 \div (6 \times 0.1600^2) = 0.358</m>: 35.8% in the fund, 64.2% in a risk-free account.`,
        String.raw`Expected return <m>4.2\% + 0.358 \times 5.5\% = 6.17\%</m>; standard deviation <m>0.358 \times 16.00\% = 5.73\%</m>.`,
        'Run the mix through the simulated monthly history (with the bills’ actual returns for the safe part): its worst calendar year, 2022, was −8.9%.',
        'Doubling risk aversion halved the share in the risky portfolio, but the risky portfolio itself did not change: she holds the same fund as Ana, just less of it.',
      ],
      answer: 'About 36% in the fund and 64% in the safe asset: expected return 6.17%, standard deviation 5.73%, worst simulated year −8.9%.',
      interpretation: 'The adviser would also match the safe part to the money Ines needs in the next few years, so that a bad year for shares doesn’t force her to sell them at a loss.' },
  ],

  demo: [
    { widget: 'eff-history', intro: 'The long-only frontier of Ana’s three funds from the simulated history, with bills at their fifteen-year average of 2.03%. The maximum-Sharpe portfolio is mostly bonds. Move the share in it and watch your mix slide along the line; the slider stops at 150%, far short of the 424% that A = 3 would ask for.' },
    { widget: 'eff-forward', intro: 'The same covariances with CAPM expected returns and a 4.2% risk-free rate. Compare the maximum-Sharpe weights in the table under the chart with the first chart’s: the optimiser now hands back the total-market fund alone.' },
    { widget: 'eff-choose', intro: 'Utility along the capital allocation line. Raise the risk-aversion coefficient and watch the best share in the risky portfolio fall; raise the risky portfolio’s standard deviation and it falls with the square.' },
  ],

  mistakes: [
    { title: 'Picking the highest-return fund as the best', html: 'The best risky portfolio is the one with the most expected excess return per unit of risk, not the most return. An investor who wants more return than the maximum-Sharpe portfolio offers can get it more efficiently by holding more of that portfolio (or by moving up the frontier) than by holding the highest-return asset alone.' },
    { title: 'Treating optimiser output as exact', html: 'Optimised weights swing with small changes in expected returns that are well within their standard errors. A historical optimiser told Ana to hold 80% bonds and borrow; a CAPM-based one, only the home share fund. Use model-based inputs, constraints and judgement.' },
    { title: 'Mixing a risk-free rate from one period with returns from another', html: 'Historical means over 2013–2027 include a period of near-zero bill rates. Comparing them with today’s 4% bill rate understates their Sharpe ratios. Compare like with like: historical means with the bills’ historical average, forward-looking expected returns with today’s risk-free rate.' },
    { title: 'Forgetting that the utility formula needs decimals', html: 'In U = E[r] − ½Aσ², use 0.10 and 0.16, not 10 and 16: with percentages the variance term is 100 times too big. The same holds for y* = (E[r_P] − r_f) ÷ (Aσ²).' },
    { title: 'Ignoring the horizon and the purpose of the money', html: 'The frontier says nothing about when the money is needed. Money due within a few years, like Ana’s deposit, belongs in safe assets whatever the efficient frontier shows.' },
  ],

  application: [
    { p: '<b>A robo-adviser’s questionnaire.</b> Online investment services ask about age, goals, horizon and how the client would react to a fall, turn the answers into a risk score, and map the score to a point along a line of model portfolios from cautious to adventurous. The model portfolios themselves are usually set by the provider’s investment team, with constraints on each asset class, rather than by an unconstrained optimiser run on history: precisely because of the instability shown in this lesson.' },
    { p: '<b>A charity’s investment policy.</b> The finance committee of a fictional charity needs its endowment to pay out about 4% a year for ever. Its consultant presents three or four efficient mixes with their expected returns, standard deviations and a stress-test loss in a 2022-type year, and the committee chooses the one whose worst-case loss it could explain to its trustees. The choice is recorded in an investment policy statement with ranges around each weight.' },
    { p: '<b>Ana’s note to herself.</b> Ana writes down her inputs (historical and CAPM-based expected returns, risks from the simulated history, and the market-proxy caveat), the answers they give, and the two checks she trusts more than the formula: the worst simulated year of her chosen mix and the fact that she won’t need the money for 30 years. She plans to review the mix once a year rather than re-optimise it every time a number changes.' },
  ],

  summary: [
    'The efficient frontier is the set of mixes with the highest expected return for each standard deviation; nothing below it is worth holding.',
    'Mixing a risky portfolio with a risk-free asset gives a straight line, the capital allocation line, with slope equal to the portfolio’s Sharpe ratio (E[r_P] − r_f) ÷ σ_P.',
    'The best risky portfolio is the one with the highest Sharpe ratio, where the line touches the frontier; investors differ only in how much they hold of it.',
    'With mean–variance utility U = E[r] − ½Aσ², the best share in the risky portfolio is y* = (E[r_P] − r_f) ÷ (Aσ²). If y* > 1 and borrowing is not possible, move up the frontier instead.',
    'Fifteen years of returns leave the market’s expected premium uncertain by about ±8 points (95%); optimisers lean on that noise, so use model-based inputs, constraints and judgement.',
    'Check any answer against a worst-year limit and the horizon: long-term money can bear risk that money needed soon cannot.',
  ],
  glossary: [
    { term: 'Efficient frontier', def: 'The set of portfolios that give the highest expected return for each level of standard deviation (equivalently, the lowest standard deviation for each expected return) from a given set of assets.' },
    { term: 'Efficient portfolio', def: 'A portfolio on the efficient frontier: no other mix of the same assets has a higher expected return with no more risk.' },
    { term: 'Capital allocation line', def: 'The straight line of expected return against standard deviation traced by mixing a risky portfolio with a risk-free asset in different proportions. Its slope is the risky portfolio’s Sharpe ratio.' },
    { term: 'Sharpe ratio', def: 'A portfolio’s expected (or average) return above the risk-free rate, divided by the standard deviation of its return: excess return per unit of total risk.' },
    { term: 'Maximum-Sharpe portfolio', def: 'The mix of risky assets with the highest Sharpe ratio, where the capital allocation line touches the efficient frontier. Also called the tangency portfolio or optimal risky portfolio.' },
    { term: 'Mean–variance utility', def: 'A score for a risky investment equal to its expected return minus half the risk-aversion coefficient times its variance, U = E[r] − ½Aσ²: the certain return the investor would accept instead.' },
    { term: 'Risk-aversion coefficient', def: 'The parameter A in mean–variance utility: how much expected return an investor requires per unit of variance. Higher A means a more cautious investor.' },
  ],
  references: [
    { text: 'Sharpe, W. F. (1994). The Sharpe ratio. <i>The Journal of Portfolio Management</i>, 21(1). Author’s copy, Stanford University.', url: 'https://web.stanford.edu/~wfsharpe/art/sr/sr.htm', checked: '2026-11-11' },
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 15.4, “Applications in Performance Measurement”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/15-4-applications-in-performance-measurement', checked: '2026-11-11' },
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 15.2, “Risk and Return to Multiple Assets”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/15-2-risk-and-return-to-multiple-assets', checked: '2026-11-11' },
    { text: 'Damodaran, A. <i>Historical Returns on Stocks, Bonds and Bills: 1928–2024</i> (data page, updated 5 January 2026). NYU Stern.', url: 'https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html', checked: '2026-11-11' },
  ],
  checks: [
    { what: 'Worst-year answer', value: RISK_PROFILE.worstYearShe * 100, shown: -25 },
    { what: 'A', value: A, shown: 3 },
    { what: 'Means', value: muH[0] * 100 + muH[1] * 100 + muH[2] * 100, shown: 10.43 + 10.27 + 4.31, tol: 0.015 },
    { what: 'Market mean', value: muH[0] * 100, shown: 10.43 },
    { what: 'Intl mean', value: muH[1] * 100, shown: 10.27 },
    { what: 'Bonds mean', value: muH[2] * 100, shown: 4.31 },
    { what: 'SDs', value: sdi(0) * 100, shown: 16.00 },
    { what: 'SD intl', value: sdi(1) * 100, shown: 17.50 },
    { what: 'SD bonds', value: sdi(2) * 100, shown: 4.14 },
    { what: 'GMV is all bonds', value: gmvH[2], shown: 1, tol: 1e-6 },
    { what: 'Intl inside frontier: lower mean, higher SD than market', value: muH[1] < muH[0] && sdi(1) > sdi(0) ? 1 : 0, shown: 1 },
    { what: 'Corr market–intl', value: DERIVED.corr.marketIntl, shown: 0.78 },
    { what: 'Bills average', value: rfH * 100, shown: 2.03 },
    { what: 'Sharpe market', value: shH[0], shown: 0.525, tol: 0.0005 },
    { what: 'Sharpe intl', value: shH[1], shown: 0.471, tol: 0.0005 },
    { what: 'Sharpe bonds (from rounded means)', value: (4.31 - 2.03) / 4.14, shown: 0.551, tol: 0.0005 },
    { what: 'Sharpe bonds unrounded', value: shH[2], shown: 0.551, tol: 0.0005 },
    { what: 'Market excess', value: (muH[0] - rfH) * 100, shown: 8.40 },
    { what: '60/40 with bills er', value: c60.er * 100, shown: 7.07 },
    { what: '60/40 with bills sd', value: c60.sd * 100, shown: 9.60 },
    { what: '60/40 with bills Sharpe', value: (c60.er - rfH) / c60.sd, shown: 0.525, tol: 0.0005 },
    { what: 'Tangency market', value: tanH[0] * 100, shown: 14.6, tol: 0.05 },
    { what: 'Tangency intl', value: tanH[1] * 100, shown: 5.3, tol: 0.05 },
    { what: 'Tangency bonds', value: tanH[2] * 100, shown: 80.1, tol: 0.05 },
    { what: 'Tangency er', value: TH.er * 100, shown: 5.52 },
    { what: 'Tangency sd', value: TH.sd * 100, shown: 5.24 },
    { what: 'Tangency Sharpe', value: IV.sharpe(TH.er, rfH, TH.sd), shown: 0.667, tol: 0.0005 },
    { what: 'Tangency beats every fund', value: shH.every((s) => IV.sharpe(TH.er, rfH, TH.sd) > s) ? 1 : 0, shown: 1 },
    { what: 'y* history', value: yH, shown: 4.24 },
    { what: 'y* history %', value: yH * 100, shown: 424, tol: 0.5 },
    { what: 'borrowing %', value: (yH - 1) * 100, shown: 324, tol: 0.5 },
    { what: 'Monthly mean excess', value: meanEx * 100, shown: 0.70 },
    { what: 'Monthly SD excess', value: sdEx * 100, shown: 4.62 },
    { what: 'SE monthly', value: sdEx / Math.sqrt(180) * 100, shown: 0.344, tol: 0.0005 },
    { what: 'SE annual', value: seAnn * 100, shown: 4.13 },
    { what: 'Annual mean excess', value: meanEx * 1200, shown: 8.40 },
    { what: 'CI low', value: (meanEx * 12 - T179 * seAnn) * 100, shown: 0.24 },
    { what: 'CI high', value: (meanEx * 12 + T179 * seAnn) * 100, shown: 16.56 },
    { what: 't(179) 97.5%', value: T179, shown: 1.9733, tol: 0.0001 },
    { what: '±8 points (half-width)', value: T179 * seAnn * 100, shown: 8, tol: 0.2 },
    { what: 'Market − intl mean', value: md * 1200, shown: 0.16 },
    { what: 'SE of difference', value: seDiff * 100, shown: 2.91 },
    ...[[1, 0.01, [9.2, 11.8, 79.0]], [1, 0.02, [3.8, 18.3, 77.9]], [2, -0.01, [33.8, 12.2, 54.0]], [0, 0.02, [26.3, 0.0, 73.7]]].flatMap(([i, d, sh]) => tanShift(i, d).map((w, k) => ({ what: `shift ${i} ${d} w${k}`, value: w * 100, shown: sh[k], tol: 0.05 }))),
    ...[1, 2, 0].map((i, k) => { const ex = SERIES[NAMES[i]].map((v, j) => v - SERIES.bills[j]); const m = ex.reduce((a, b) => a + b, 0) / 180; const s = Math.sqrt(ex.reduce((q, v) => q + (v - m) ** 2, 0) / 179); return { what: `SE ${NAMES[i]}`, value: s / Math.sqrt(180) * 1200, shown: [4.5, 1.1, 4.1][k], tol: 0.05 }; }),
    { what: 'Bond excess return', value: (st.bonds.mean - rfH) * 100, shown: 2.28 },
    { what: 'Bond SE', value: (() => { const ex = SERIES.bonds.map((v, j) => v - SERIES.bills[j]); const m = ex.reduce((a, b) => a + b, 0) / 180; return Math.sqrt(ex.reduce((q, v) => q + (v - m) ** 2, 0) / 179) / Math.sqrt(180) * 1200; })(), shown: 1.07 },
    { what: 'Bond weight 80% → 54%', value: tanShift(2, -0.01)[2] * 100, shown: 54, tol: 0.05 },
    { what: 'Bond weight 80%', value: tanH[2] * 100, shown: 80, tol: 0.15 },
    { what: 'F05 rf', value: MARKET.rf * 100, shown: 4.2 },
    { what: 'F05 MRP', value: MARKET.mrp * 100, shown: 5.5 },
    { what: 'Intl beta', value: betas[1], shown: 0.85 },
    { what: 'Bonds beta', value: betas[2], shown: 0.08 },
    { what: 'CAPM market', value: muC[0] * 100, shown: 9.70 },
    { what: 'CAPM intl', value: muC[1] * 100, shown: 8.87 },
    { what: 'CAPM intl from rounded beta', value: (0.042 + 0.85 * 0.055) * 100, shown: 8.88, tol: 0.006 },
    { what: 'CAPM bonds', value: muC[2] * 100, shown: 4.66 },
    { what: 'CAPM tangency is 100% market', value: tanC[0], shown: 1, tol: 1e-6 },
    { what: 'Sharpe market CAPM', value: shCi[0], shown: 0.344, tol: 0.0005 },
    { what: 'Sharpe intl CAPM', value: shCi[1], shown: 0.267, tol: 0.0005 },
    { what: 'Sharpe bonds CAPM', value: shCi[2], shown: 0.111, tol: 0.0005 },
    { what: 'Tangency Sharpe CAPM', value: shC, shown: 0.344, tol: 0.0005 },
    { what: 'y* CAPM', value: yC, shown: 0.716, tol: 0.0005 },
    { what: 'y* CAPM %', value: yC * 100, shown: 71.6, tol: 0.05 },
    { what: 'bills share', value: (1 - yC) * 100, shown: 28.4, tol: 0.05 },
    { what: 'A σ²', value: 3 * TC.sd ** 2, shown: 0.0768, tol: 0.00005 },
    { what: 'CAPM mix er', value: CC.er * 100, shown: 8.14 },
    { what: 'CAPM mix sd', value: CC.sd * 100, shown: 11.46 },
    { what: 'Market SD', value: TC.sd * 100, shown: 16.00 },
    { what: 'Market worst year', value: DERIVED.worstYear.market * 100, shown: -26.9, tol: 0.05 },
    { what: 'Market worst year is 2022', value: Number(worstY(SERIES.market).year), shown: 2022 },
    { what: '71.6/28.4 worst year', value: worst(mixSeries([1, 0, 0], yC)) * 100, shown: -19.2, tol: 0.05 },
    { what: '71.6/28.4 worst is 2022', value: Number(worstY(mixSeries([1, 0, 0], yC)).year), shown: 2022 },
    { what: '60/40 worst year', value: worst(mixSeries([0.6, 0, 0.4])) * 100, shown: -21.3, tol: 0.05 },
    { what: '80/20 worst year', value: worst(mixSeries([0.8, 0, 0.2])) * 100, shown: -24.1, tol: 0.05 },
    { what: 'Ana monthly', value: ANA.retirement.monthly, shown: 400 },
    { what: 'Emergency fund', value: ANA.emergency, shown: 6000 },
    { what: 'Ines y', value: yI, shown: 0.358, tol: 0.0005 },
    { what: 'Ines y %', value: yI * 100, shown: 35.8, tol: 0.05 },
    { what: 'Ines y about 36%', value: yI * 100, shown: 36, tol: 0.5 },
    { what: 'Ines safe', value: (1 - yI) * 100, shown: 64.2, tol: 0.05 },
    { what: 'Ines er', value: CI.er * 100, shown: 6.17 },
    { what: 'Ines sd', value: CI.sd * 100, shown: 5.73 },
    { what: 'Ines worst', value: worst(mixSeries([1, 0, 0], yI)) * 100, shown: -8.9, tol: 0.05 },
    { what: 'Ines worst is 2022', value: Number(worstY(mixSeries([1, 0, 0], yI)).year), shown: 2022 },
    { what: 'Doubling A halves y', value: yC / yI, shown: 2, tol: 1e-9 },
    { what: 'Utility peaks at y* along CAL', value: UC(yC) > UC(yC - 0.05) && UC(yC) > UC(yC + 0.05) ? 1 : 0, shown: 1 },
    { what: 'Charity payout', value: 4, shown: 4 },
  ],
};
