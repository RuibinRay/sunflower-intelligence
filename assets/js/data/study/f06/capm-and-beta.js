// capm-and-beta.js — F06 · The CAPM and beta. Content only; exercises are in capm-and-beta.ex.js.
// Betas by regression of SIMULATED monthly excess returns (case.js SERIES, LAST60) with core/investments.js regressBeta;
// the data were generated so that Morrow & Pike’s and Harbour Street’s 2023–2027 betas equal F05’s (0.90 and 1.25) with
// zero alpha (tools/study/f06-data.py). F05’s assumptions (MARKET) for required returns. Fama & French (2004) is quoted
// from its abstract only. Ridgeway Outdoor is a fictional company invented for an example.
import { SERIES, LAST60, DERIVED, MARKET, COMPANIES } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';
import { tInv } from '../../../core/inference.js?v=31';
import { PEERS } from '../f05/case.js?v=31';

const { rf, mrp } = MARKET;
const L = (k) => SERIES[k].slice(LAST60.from);
const ex = (k) => L(k).map((v, i) => v - L('bills')[i]);
const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1)); };
const RM = IV.regressBeta(L('morrow'), L('market'), L('bills')), RH = IV.regressBeta(L('harbour'), L('market'), L('bills'));
const t58 = tInv(0.975, 58);
const smEx = sd(ex('market')) * Math.sqrt(12);
const totM = sd(ex('morrow')) * Math.sqrt(12), sysM = RM.beta * smEx, specM = Math.sqrt(totM ** 2 - sysM ** 2);
const full = (k) => IV.regressBeta(SERIES[k], SERIES.market, SERIES.bills);
const sub = (k, a, b) => IV.regressBeta(SERIES[k].slice(a, b), SERIES.market.slice(a, b), SERIES.bills.slice(a, b));
const rf60 = mean(L('bills')) * 12, mex60 = mean(ex('market')) * 12;
const reqM = IV.capm({ rf, beta: 0.9, mrp }), reqH = IV.capm({ rf, beta: 1.25, mrp });
// Ridgeway Outdoor (fictional): analyst forecast 12%, beta 1.10
const reqR = IV.capm({ rf, beta: 1.1, mrp });
// the international fund over 15 years
const st = DERIVED.stats, rfH = st.bills.mean, RI = full('intl'), RB = full('bonds'), RA = full('active');
const jI = IV.jensenAlpha(st.intl.mean, rfH, RI.beta, st.market.mean);
const trI = IV.treynor(st.intl.mean, rfH, RI.beta), trM = IV.treynor(st.market.mean, rfH, 1);
const shI = IV.sharpe(st.intl.mean, rfH, st.intl.sd), shM = IV.sharpe(st.market.mean, rfH, st.market.sd);
const peer = (n) => PEERS.find((p) => p.name.startsWith(n));

export default {
  slug: 'capm-and-beta',
  title: 'The CAPM and beta',
  blurb: 'Estimate a share’s beta by regressing its excess returns on the market’s, say how precise the estimate is, use the capital asset pricing model for a required return, and judge funds by alpha, Treynor and Sharpe ratios.',
  status: 'draft',
  objectives: [
    'Explain why, if investors diversify, only systematic risk should earn a premium, and state the CAPM and the security market line.',
    'Estimate beta by regressing a share’s monthly excess returns on the market’s, and interpret the slope, intercept and R².',
    'Calculate a confidence interval for beta from its standard error, and explain why betas differ by period and source.',
    'Calculate a required return with the CAPM and judge whether a forecast return plots above or below the security market line.',
    'Calculate and compare Jensen’s alpha, the Treynor ratio and the Sharpe ratio, and summarise the evidence on the CAPM.',
  ],
  prerequisites: [
    { lesson: 'f06/efficient-portfolios', why: 'The maximum-Sharpe portfolio and the capital allocation line, which the CAPM builds on.' },
    { lesson: 'f06/diversification', why: 'Systematic and unsystematic risk, covariance and correlation.' },
    { lesson: 'f05/cost-of-debt-and-equity', why: 'The CAPM used as a tool for a cost of equity, with Ana’s 4.2% risk-free rate and 5.5% premium.' },
    { lesson: 'b06/least-squares-line', why: 'Fitting a line by least squares: slope, intercept and R² (useful but not essential).' },
  ],
  case: 'lantern',

  concept: [
    { case: 'In F05 Ana used betas of 0.90 for Morrow &amp; Pike Roasters and 1.25 for Harbour Street Foods, two of Lantern’s fictional listed peers, to estimate Lantern’s cost of equity. She took them as given. Now she wants to know where such numbers come from, how much to trust them, and why a share’s beta, rather than its total risk, should set the return investors require. The returns in this lesson are simulated for teaching, and they were built so that the betas over 2023–2027 come out at exactly F05’s figures; for real long-run market returns see Damodaran’s historical returns page.' },
    { p: 'The diversification lesson showed that part of every share’s risk, its unsystematic risk, disappears in a broad portfolio, while the systematic part, the risk every share shares with the market, remains. If investors hold diversified portfolios, they will not pay for bearing risk they could remove for free. So the extra return a share must offer should depend only on how much of the market’s risk it carries. <g>Beta</g> measures exactly that: how much the share’s return tends to move when the market moves by one percentage point.' },
    { p: 'The efficient-portfolios lesson gives the other half of the argument. If every investor agrees on the inputs and can borrow and lend at the <g>risk-free rate</g>, every one of them holds the same risky portfolio, the maximum-Sharpe one, mixed with more or less of the safe asset. Since everyone holds it and every share must be held by someone, that portfolio must be the whole market, every asset in proportion to its value: the <g>market portfolio</g>. A share’s risk to such an investor is its contribution to the market portfolio’s risk, which is its beta.' },
    { p: 'The result is the <g>capital asset pricing model</g> (CAPM), developed by William Sharpe and others in the 1960s. It says every asset’s expected return lies on a straight line against beta, the <g>security market line</g> (SML):' },
    { math: String.raw`E[r_i] = r_f + \beta_i\,(E[r_M] - r_f)` },
    { p: 'At a beta of 0 an asset earns the risk-free rate; at a beta of 1 it earns the market’s expected return; at 1.5 it earns the risk-free rate plus one and a half times the <g>market risk premium</g>. With F05’s assumptions (4.2% and 5.5%), Morrow &amp; Pike’s required return is <m>4.2\\% + 0.90 \\times 5.5\\% = 9.15\\%</m> and Harbour Street’s <m>4.2\\% + 1.25 \\times 5.5\\% = 11.08\\%</m>.' },
    { callout: 'key', title: 'Total risk versus market risk', html: 'In the simulated history Morrow &amp; Pike’s returns had a standard deviation of 25.25% a year, much more than the market fund’s 16.00%, yet its beta is below 1 and its required return below the market’s. Most of its risk is specific to the company, and the CAPM says the market pays nothing for that.' },
  ],

  theory: [
    { h: 'Beta by regression' },
    { p: 'Beta is estimated from history by regressing the share’s <g>excess return</g> (its return minus the bill return in the same month) on the market’s excess return:' },
    { math: String.raw`r_{i,t} - r_{f,t} = \alpha_i + \beta_i\,(r_{M,t} - r_{f,t}) + e_{i,t}` },
    { p: 'The slope is beta; it equals the covariance of the two excess returns divided by the variance of the market’s, <m>\\beta_i = \\text{cov}(r_i, r_M) \\div \\sigma_M^2</m>. The intercept, alpha, is the average excess return left over after allowing for the market: the CAPM predicts it is zero. The residual <m>e_{i,t}</m> is the company-specific part of each month’s return. This fitted line is sometimes called the share’s characteristic line. Analysts often use five years of monthly returns, sixty points, as here; OpenStax’s section 15.3 fits the same kind of line to Delta Air Lines’ monthly returns against the S&amp;P 500.' },
    { p: 'For Morrow &amp; Pike over January 2023 – December 2027 (simulated), the regression gives <m>\\hat\\beta = 0.90</m>, an intercept of 0.000% a month and an R² of 0.270. For Harbour Street it gives 1.25, 0.000% and 0.363. These are exactly F05’s betas with zero alpha because the generator built the data that way; real regressions never come out so neatly. The Explore widget shows Morrow &amp; Pike’s regression as Excel’s Analysis ToolPak would print it.' },
    { h: 'R²: how much of the risk is systematic' },
    { p: 'R² is the share of the variance of the share’s excess return that the market accounts for. Since the share’s variance splits into a market part and a specific part,' },
    { math: String.raw`\sigma_i^2 = \beta_i^2\,\sigma_M^2 + \sigma_e^2, \qquad R^2 = \dfrac{\beta_i^2\,\sigma_M^2}{\sigma_i^2}` },
    { p: 'Morrow &amp; Pike’s excess returns over 2023–2027 had a standard deviation of 23.09% a year and the market’s 13.32%. The systematic part is <m>0.90 \\times 13.32\\% = 11.99\\%</m>; the specific part is <m>\\sqrt{23.09^2 - 11.99^2} = 19.73\\%</m>. Only 27% of the variance is market risk; 73% would vanish in a diversified portfolio. An R² of 0.27 to 0.36 is typical of single shares; a broad fund has an R² near 1 against its own market (the simulated Northgate active fund’s is 0.95). A low R² does not make beta wrong, but it does make it less precise.' },
    { h: 'How precise is a beta?' },
    { p: 'The slope of a regression is an estimate with a standard error, and Excel’s regression output reports it. Morrow &amp; Pike’s is 0.195. With 58 degrees of freedom the 95% critical t-value is 2.0017, so a 95% confidence interval for its beta is <m>0.90 \\pm 2.0017 \\times 0.195</m>, from 0.51 to 1.29. Harbour Street’s, with a standard error of 0.217, runs from 0.81 to 1.69. Five years of monthly data can’t tell whether Morrow &amp; Pike is a defensive share or an average one.' },
    { p: 'The estimate also moves with the window. Over the full fifteen simulated years Morrow &amp; Pike’s beta is 0.94 and Harbour Street’s 1.31; over 2013–2017 they are 0.91 and 1.34. OpenStax notes that published betas differ between data services because of the period, the frequency of the data and the market index used. Analysts respond by averaging peers’ betas (as F05 did for Lantern), by using longer windows, or by shrinking an estimate part of the way towards 1, the average beta.' },
    { table: {
      caption: 'Beta by regression of monthly excess returns (simulated data)',
      head: ['Company', 'Beta 2023–2027', 'Standard error', '95% interval', 'R²', 'Beta 2013–2027'],
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      rows: [
        ['Morrow &amp; Pike', '0.90', '0.195', '0.51 to 1.29', '0.27', '0.94'],
        ['Harbour Street', '1.25', '0.217', '0.81 to 1.69', '0.36', '1.31'],
      ],
      note: 'The 2023–2027 betas equal F05’s by construction. Brightcup Coffee, the third peer, is left for the course project.',
    } },
    { h: 'Using the CAPM for a required return' },
    { p: 'A required return is the expected return that compensates an investor for an asset’s systematic risk: the SML value at its beta. It is what F05 used as the cost of equity, and what a share must be expected to earn to be worth its price. If an analyst forecasts a higher return than the SML gives, the share looks underpriced (it plots above the line); a lower forecast means it looks overpriced. The gap is the forecast <g>Jensen’s alpha</g>.' },
    { p: 'The SML also holds after the fact for the simulated shares, again by construction. Over 2023–2027 bills averaged 4.56% a year and the market’s excess return 7.56%. The SML at Morrow &amp; Pike’s beta gives <m>4.56\\% + 0.90 \\times 7.56\\% = 11.37\\%</m>, exactly its average return over the period, and Harbour Street’s 14.01% sits exactly on the line at 1.25. Both have zero alpha.' },
    { h: 'Judging performance: Jensen’s alpha, Treynor and Sharpe' },
    { p: 'Three ratios adjust a return for risk, and OpenStax’s section 15.4 presents all three. <b>Jensen’s alpha</b> is the average return minus the CAPM return at the portfolio’s beta: <m>\\alpha = \\bar r_P - [r_f + \\beta_P(\\bar r_M - r_f)]</m>. The <g>Treynor ratio</g> divides the excess return by beta, <m>(\\bar r_P - r_f) \\div \\beta_P</m>: excess return per unit of market risk. The Sharpe ratio, from the previous lesson, divides by standard deviation, total risk.' },
    { p: 'Take the simulated international fund over 2013–2027, against the home market fund as the market. Its beta is 0.85 (0.849 before rounding) and its average return 10.27%, with bills at 2.03% and the market at 10.43%. Jensen’s alpha is <m>10.27\\% - [2.03\\% + 0.849 \\times 8.40\\%] = 1.11\\%</m> a year; its Treynor ratio is <m>8.24\\% \\div 0.849 = 9.70\\%</m>, against 8.40% for the market. Yet its Sharpe ratio, 0.471, is below the market fund’s 0.525. The measures disagree because the fund has a lot of risk that the home market doesn’t explain (its R² is 0.60). Which to use depends on the question. For a whole portfolio, use the Sharpe ratio: total risk is what the investor bears. For one holding among many, where its specific risk will be diversified, Treynor and alpha are the relevant measures.' },
    { p: 'And the alpha needs a standard error too. The regression’s monthly alpha for the international fund is 0.092% with a standard error of 0.241%: a t-statistic of 0.38, nowhere near significant. The Northgate active fund’s is −0.079% a month (about −0.95% a year), t = −0.98; the funds lesson takes up what that means. An alpha that fifteen years of data can’t distinguish from zero is not evidence of skill, or of its absence.' },
    { h: 'The evidence on the CAPM' },
    { p: 'The CAPM rests on strong assumptions: investors care only about mean and variance, agree on expected returns, can borrow and lend at one risk-free rate, and face no taxes or trading costs. Its predictions have been tested for decades. Fama and French (2004), reviewing that work, put it plainly: “the empirical record of the model is poor.” They note that part of the difficulty is that tests use stock indexes as poor proxies for the true market portfolio of all invested wealth, but argue that if that problem invalidates the tests, it also invalidates most applications. The simulated bond fund illustrates the proxy problem: measured against a share index, it shows a beta of 0.08 and an alpha of 1.58% a year, which says more about the index than about the bonds.' },
    { p: 'Why use the model at all, then? Because it gives a disciplined starting point that ties the required return to market risk, the inputs can be argued over in the open, and the alternatives (multi-factor models, which add other sources of systematic risk such as size and value) need more estimates, not fewer. Practitioners use it with its limits in view: as a range, with beta from peers or long windows, and cross-checked against other methods, as F05 did.' },
    { callout: 'warn', title: 'Beta is a slope, not a measure of total risk', html: 'A low-beta share can still be very volatile: Morrow &amp; Pike’s standard deviation is half again the market’s. Beta measures only the part of risk a diversified investor bears. For someone holding just one or two shares, total risk matters too.' },
  ],

  formulas: [
    { id: 'capm-sml', name: 'Capital asset pricing model (security market line)',
      tex: String.raw`E[r_i] = r_f + \beta_i\,(E[r_M] - r_f)`,
      where: [[String.raw`E[r_i]`, 'Expected (required) return on asset i', '% per year'], [String.raw`r_f`, 'Risk-free rate', '% per year'], [String.raw`\beta_i`, 'Beta of asset i', ''], [String.raw`E[r_M] - r_f`, 'Market risk premium', '% per year']],
      assumptions: 'Investors diversify, agree on inputs, borrow and lend at r_f; only systematic risk is priced.',
      note: 'F05 used the same formula as r_E = r_f + β_E × MRP for a cost of equity.' },
    { id: 'capm-beta-regression', name: 'Beta by regression on excess returns',
      tex: String.raw`r_{i,t} - r_{f,t} = \alpha_i + \beta_i\,(r_{M,t} - r_{f,t}) + e_{i,t}, \qquad \beta_i = \dfrac{\text{cov}(r_i - r_f,\ r_M - r_f)}{\text{var}(r_M - r_f)}`,
      where: [[String.raw`r_{i,t},\ r_{M,t},\ r_{f,t}`, 'Asset, market and bill returns in month t', 'decimal'], [String.raw`\alpha_i`, 'Intercept: average excess return not explained by the market', 'decimal per month'], [String.raw`\beta_i`, 'Slope: beta', ''], [String.raw`e_{i,t}`, 'Residual: the specific part of the month’s return', 'decimal']],
      assumptions: 'Beta constant over the window; usually 60 monthly returns.',
      note: 'Excel: =SLOPE(asset excess returns, market excess returns); the ToolPak Regression tool also gives the standard error and R².' },
    { id: 'capm-variance-split', name: 'Systematic and specific variance',
      tex: String.raw`\sigma_i^2 = \beta_i^2\sigma_M^2 + \sigma_e^2, \qquad R^2 = \dfrac{\beta_i^2\sigma_M^2}{\sigma_i^2}`,
      where: [[String.raw`\sigma_i^2`, 'Variance of the asset’s excess return', 'decimal² per year'], [String.raw`\sigma_M^2`, 'Variance of the market’s excess return', 'decimal² per year'], [String.raw`\sigma_e^2`, 'Residual (specific) variance', 'decimal² per year'], [String.raw`\beta_i`, 'Beta', ''], [String.raw`R^2`, 'Share of variance explained by the market', '']],
      assumptions: 'Least-squares regression with an intercept, so the residuals are uncorrelated with the market.' },
    { id: 'capm-beta-ci', name: 'Confidence interval for beta',
      tex: String.raw`\hat\beta \pm t_{0.975,\,n-2} \times SE(\hat\beta)`,
      where: [[String.raw`\hat\beta`, 'Estimated beta', ''], [String.raw`SE(\hat\beta)`, 'Its standard error from the regression output', ''], [String.raw`t_{0.975,\,n-2}`, 'Critical t-value for 95% with n − 2 degrees of freedom (2.0017 for 60 months)', ''], [String.raw`n`, 'Number of months', '']],
      assumptions: 'The regression’s usual assumptions (independent residuals with constant variance).' },
    { id: 'capm-jensen', name: 'Jensen’s alpha',
      tex: String.raw`\alpha_P = \bar r_P - \left[r_f + \beta_P(\bar r_M - r_f)\right]`,
      where: [[String.raw`\bar r_P,\ \bar r_M`, 'Average returns of the portfolio and the market', '% per year'], [String.raw`r_f`, 'Average risk-free rate over the period', '% per year'], [String.raw`\beta_P`, 'Portfolio beta', '']],
      assumptions: 'The CAPM gives the right benchmark return.' },
    { id: 'capm-treynor', name: 'Treynor ratio',
      tex: String.raw`T_P = \dfrac{\bar r_P - r_f}{\beta_P}`,
      where: [[String.raw`T_P`, 'Excess return per unit of beta', '% per year'], [String.raw`\bar r_P`, 'Average return of the portfolio', '% per year'], [String.raw`r_f`, 'Risk-free rate', '% per year'], [String.raw`\beta_P`, 'Portfolio beta', '']],
      assumptions: 'Suits a holding that will be part of a diversified portfolio; misleading for low-beta assets.' },
  ],

  examples: [
    { level: 'simple', title: 'Required returns on the security market line', fictional: true,
      setup: 'With a 4.2% risk-free rate and a 5.5% market risk premium (F05’s assumptions), find the CAPM required returns for Morrow &amp; Pike (beta 0.90) and Harbour Street (1.25). An analyst forecasts that Ridgeway Outdoor, a fictional listed retailer with a beta of 1.10, will return 12% next year. Is it above or below the SML?',
      steps: [
        String.raw`Morrow &amp; Pike: <m>4.2\% + 0.90 \times 5.5\% = 4.2\% + 4.95\% = 9.15\%</m>.`,
        String.raw`Harbour Street: <m>4.2\% + 1.25 \times 5.5\% = 4.2\% + 6.875\% = 11.08\%</m>.`,
        String.raw`Ridgeway: required <m>4.2\% + 1.10 \times 5.5\% = 10.25\%</m>; forecast 12%, so the forecast alpha is <m>12\% - 10.25\% = 1.75\%</m>.`,
      ],
      answer: 'Required returns 9.15% (Morrow &amp; Pike) and 11.08% (Harbour Street); Ridgeway plots 1.75 points above the SML.',
      interpretation: 'If the analyst’s forecast is right, Ridgeway’s price is too low for its risk: buyers would push it up until its expected return fell to 10.25%. Whether the forecast is right is the real question; the next module looks at how such forecasts are made.' },
    { level: 'challenging', title: 'How sure is Morrow &amp; Pike’s beta?', fictional: true,
      setup: 'Regressing Morrow &amp; Pike’s 60 monthly excess returns for 2023–2027 on the market’s gives a slope of 0.90 with a standard error of 0.195 and an R² of 0.270 (simulated data). The market’s excess returns had a standard deviation of 13.32% a year. Find a 95% confidence interval for beta, the systematic and specific parts of its risk, and the range of required returns the interval implies.',
      steps: [
        String.raw`Interval: <m>t_{0.975,58} = 2.0017</m>, so <m>0.90 \pm 2.0017 \times 0.195 = 0.90 \pm 0.39</m>: from 0.51 to 1.29.`,
        String.raw`Systematic risk: <m>0.90 \times 13.32\% = 11.99\%</m> a year. Total risk of its excess return: 23.09%. Specific: <m>\sqrt{0.2309^2 - 0.1199^2} = 19.73\%</m>.`,
        String.raw`Check with R²: <m>0.1199^2 \div 0.2309^2 = 0.270</m>.`,
        String.raw`Required return at the ends of the interval: <m>4.2\% + 0.51 \times 5.5\% = 7.01\%</m> and <m>4.2\% + 1.29 \times 5.5\% = 11.29\%</m>.`,
      ],
      answer: 'Beta 0.90, 95% interval 0.51 to 1.29; systematic risk 11.99% and specific 19.73% a year; required return anywhere from about 7.0% to 11.3%.',
      interpretation: 'One company’s five-year regression leaves the required return uncertain by more than four points. That is why F05 averaged three peers’ betas for Lantern, and why a cost of equity should be reported as a range.' },
    { level: 'applied', title: 'Is the international fund worth its place?', fictional: true,
      setup: 'A fictional pension trustee reviews the Harbourline International fund over 2013–2027 (simulated): average return 10.27%, standard deviation 17.50%, beta against the home market 0.849, regression alpha 0.092% a month with a standard error of 0.241%. Bills averaged 2.03% and the home market fund 10.43% with a standard deviation of 16.00%.',
      steps: [
        String.raw`Jensen’s alpha: <m>10.27\% - [2.03\% + 0.849 \times (10.43\% - 2.03\%)] = 1.11\%</m> a year.`,
        String.raw`Treynor: fund <m>8.24\% \div 0.849 = 9.70\%</m>; market <m>8.40\% \div 1 = 8.40\%</m>.`,
        String.raw`Sharpe: fund <m>8.24\% \div 17.50\% = 0.471</m>; market 0.525.`,
        String.raw`Significance: <m>t = 0.092 \div 0.241 = 0.38</m>. The alpha is well within the range chance alone would produce.`,
      ],
      answer: 'Alpha +1.11% a year and a higher Treynor ratio, but a lower Sharpe ratio, and the alpha is not statistically significant (t = 0.38).',
      interpretation: 'Held alone, the fund was worse than the home market per unit of total risk. As one part of a portfolio its specific risk is partly diversified, and Treynor and alpha flatter it. The trustee’s case for holding it rests on diversification across economies, not on evidence of extra return.' },
  ],

  demo: [
    { widget: 'capm-regression', intro: 'Morrow &amp; Pike’s monthly excess returns against the market’s, 2023–2027, in Excel’s regression output. Find beta (the X coefficient), its standard error and 95% limits, the intercept (alpha) and R². The scatter shows how loosely the points sit around the line: most of each month’s move is specific to the company.' },
    { widget: 'capm-sml', intro: 'The security market line. Set a beta and see the required return; enter an analyst’s forecast and see whether the share plots above the line (positive alpha) or below it.' },
  ],

  mistakes: [
    { title: 'Regressing raw returns, or putting the market on the wrong axis', html: 'Beta is the slope of the share’s excess return (y) on the market’s excess return (x). Swapping the axes gives a different number, and using raw returns makes the intercept mix alpha with the bill rate. For beta itself the difference from raw returns is usually small; for alpha it matters.' },
    { title: 'Treating an estimated beta as exact', html: 'Single-company betas from five years of monthly data have standard errors around 0.2. Morrow &amp; Pike’s 95% interval runs from 0.51 to 1.29. Report a range, use peers, and don’t read much into a difference of 0.1 between two estimates.' },
    { title: 'Confusing beta with volatility', html: 'Beta measures co-movement with the market, scaled by the market’s risk; standard deviation measures total risk. A share can have a high standard deviation and a low beta if most of its risk is specific.' },
    { title: 'Reading any positive alpha as skill', html: 'An alpha is an average with a standard error. The international fund’s 1.11% a year has a t-statistic of 0.38. Ask how many years of data there are and how large the alpha is relative to its standard error before concluding anything.' },
    { title: 'Using the Treynor ratio for a whole portfolio or a low-beta asset', html: 'Treynor ignores specific risk, which is right only if it will be diversified away. For a whole portfolio use Sharpe. For an asset with a beta near zero the ratio explodes: the simulated bond fund’s Treynor ratio is over 27%, which is meaningless.' },
  ],

  application: [
    { p: '<b>A valuation analyst’s cost of equity.</b> An analyst valuing a listed company pulls its beta from two data services and runs her own regression on five years of monthly returns. The three disagree by 0.2. She reports the average, notes the range, and checks it against the average beta of five peers, unlevered and relevered at the company’s debt-to-equity ratio as in F05. The CAPM then gives a cost of equity that enters the WACC used in the discounted cash flow lesson.' },
    { p: '<b>A fund selector’s review.</b> A fictional university endowment’s investment officer screens funds by their alpha against a suitable benchmark, the alpha’s t-statistic, R² (to check that the benchmark fits) and the Sharpe ratio. She is wary of any fund whose alpha comes from a few good years, and of benchmarks that make a fund look better than it is: a bond fund judged against a share index, for example.' },
    { p: '<b>Ana and her peers’ betas.</b> Ana now sees why F05 averaged three peers: each regression beta could easily be 0.4 away from the truth. She also notes that she herself holds a very undiversified portfolio, Lantern, for which total risk, not beta, is what she bears. The CAPM tells her what a diversified investor would require of Lantern; her own required return may reasonably be higher.' },
  ],

  summary: [
    'Diversified investors bear only systematic risk, so the CAPM prices assets by beta: E[r_i] = r_f + β_i(E[r_M] − r_f), the security market line.',
    'Beta is the slope of a regression of the asset’s monthly excess returns on the market’s: cov ÷ var. The intercept is alpha; R² is the share of variance that is systematic.',
    'Morrow &amp; Pike’s simulated 2023–2027 beta is 0.90 (standard error 0.195, 95% interval 0.51 to 1.29, R² 0.27); Harbour Street’s 1.25. The data were built to match F05.',
    'Betas are noisy and change with the window, frequency and index: use ranges, peers and long samples.',
    'Required return from the CAPM: Morrow &amp; Pike 9.15%, Harbour Street 11.08% with F05’s assumptions. A forecast above the SML means a positive forecast alpha.',
    'Jensen’s alpha, Treynor (per unit of beta) and Sharpe (per unit of total risk) can disagree; use Sharpe for a whole portfolio, and test any alpha against its standard error.',
    'The CAPM’s empirical record is poor (Fama and French, 2004), partly because the true market portfolio can’t be observed; it remains a disciplined starting point.',
  ],
  glossary: [
    { term: 'Market portfolio', def: 'A portfolio holding every risky asset in proportion to its market value. In practice it is represented by a broad, value-weighted index.' },
    { term: 'Security market line', def: 'The straight line of expected return against beta given by the CAPM, starting at the risk-free rate (beta 0) and passing through the market’s expected return (beta 1). Abbreviated SML.' },
    { term: 'Jensen’s alpha', def: 'A portfolio’s average return minus the return the CAPM predicts for its beta: r_P − [r_f + β_P(r_M − r_f)]. Positive alpha means it beat the security market line.' },
    { term: 'Treynor ratio', def: 'A portfolio’s average return above the risk-free rate divided by its beta: excess return per unit of systematic risk.' },
    { term: 'Characteristic line', def: 'The regression line of an asset’s excess returns on the market’s excess returns; its slope is the asset’s beta and its intercept its alpha.' },
  ],
  references: [
    { text: 'Fama, E. F. &amp; French, K. R. (2004). The capital asset pricing model: Theory and evidence. <i>Journal of Economic Perspectives</i>, 18(3), 25–46.', url: 'https://www.aeaweb.org/articles?id=10.1257/0895330042162430', checked: '2026-11-11' },
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 15.3, “The Capital Asset Pricing Model (CAPM)”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/15-3-the-capital-asset-pricing-model-capm', checked: '2026-11-11' },
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 15.4, “Applications in Performance Measurement”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/15-4-applications-in-performance-measurement', checked: '2026-11-11' },
    { text: 'Damodaran, A. <i>Historical Returns on Stocks, Bonds and Bills: 1928–2024</i> (data page, updated 5 January 2026). NYU Stern.', url: 'https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html', checked: '2026-11-11' },
  ],
  checks: [
    { what: 'F05 beta Morrow', value: peer('Morrow').beta, shown: 0.90 },
    { what: 'F05 beta Harbour', value: peer('Harbour').beta, shown: 1.25 },
    { what: 'rf', value: rf * 100, shown: 4.2 },
    { what: 'mrp', value: mrp * 100, shown: 5.5 },
    { what: 'Req Morrow', value: reqM * 100, shown: 9.15 },
    { what: 'Req Harbour', value: reqH * 100, shown: 11.08 },
    { what: 'Req Harbour exact', value: reqH * 100, shown: 11.075, tol: 0.0005 },
    { what: 'β×MRP Morrow', value: 0.9 * mrp * 100, shown: 4.95 },
    { what: 'β×MRP Harbour', value: 1.25 * mrp * 100, shown: 6.875 },
    { what: 'Morrow SD 15y', value: st.morrow.sd * 100, shown: 25.25 },
    { what: 'Market SD 15y', value: st.market.sd * 100, shown: 16.00 },
    { what: 'Morrow SD about 1.5 × market', value: st.morrow.sd / st.market.sd, shown: 1.5, tol: 0.1 },
    { what: 'Morrow beta 60', value: RM.beta, shown: 0.90 },
    { what: 'Morrow alpha 60 (% a month)', value: RM.alpha * 100, shown: 0.000, tol: 0.0005 },
    { what: 'Morrow R2', value: RM.r2, shown: 0.270, tol: 0.0005 },
    { what: 'Morrow R2 2dp', value: RM.r2, shown: 0.27 },
    { what: 'Harbour beta 60', value: RH.beta, shown: 1.25 },
    { what: 'Harbour alpha 60', value: RH.alpha * 100, shown: 0.000, tol: 0.0005 },
    { what: 'Harbour R2', value: RH.r2, shown: 0.363, tol: 0.0005 },
    { what: 'Harbour R2 2dp', value: RH.r2, shown: 0.36 },
    { what: 'betas equal F05 by construction', value: Math.abs(RM.beta - peer('Morrow').beta) < 1e-5 && Math.abs(RH.beta - peer('Harbour').beta) < 1e-5 ? 1 : 0, shown: 1 },
    { what: 'beta = cov/var', value: IV.betaCov(IV.sampleCov(ex('morrow'), ex('market')).cov, IV.sampleCov(ex('market'), ex('market')).cov), shown: 0.90 },
    { what: '60 months', value: RM.n, shown: 60 },
    { what: 'Morrow total SD excess', value: totM * 100, shown: 23.09 },
    { what: 'Market SD excess 60', value: smEx * 100, shown: 13.32 },
    { what: 'Morrow systematic', value: sysM * 100, shown: 11.99 },
    { what: 'Morrow specific', value: specM * 100, shown: 19.73 },
    { what: 'R2 from split', value: sysM ** 2 / totM ** 2, shown: 0.270, tol: 0.0005 },
    { what: 'Specific share of variance', value: (1 - RM.r2) * 100, shown: 73, tol: 0.5 },
    { what: 'Northgate R2 (15 years)', value: RA.r2, shown: 0.95 },
    { what: 'SE beta Morrow', value: RM.seBeta, shown: 0.195, tol: 0.0005 },
    { what: 'SE beta Harbour', value: RH.seBeta, shown: 0.217, tol: 0.0005 },
    { what: 't 58', value: t58, shown: 2.0017, tol: 0.00005 },
    { what: 'half-width Morrow', value: t58 * RM.seBeta, shown: 0.39 },
    { what: 'CI Morrow low', value: RM.beta - t58 * RM.seBeta, shown: 0.51 },
    { what: 'CI Morrow high', value: RM.beta + t58 * RM.seBeta, shown: 1.29 },
    { what: 'CI Harbour low', value: RH.beta - t58 * RH.seBeta, shown: 0.81 },
    { what: 'CI Harbour high', value: RH.beta + t58 * RH.seBeta, shown: 1.69 },
    { what: 'CI includes 1', value: RM.beta + t58 * RM.seBeta > 1 ? 1 : 0, shown: 1 },
    { what: 'Morrow 15y beta', value: full('morrow').beta, shown: 0.94 },
    { what: 'Harbour 15y beta', value: full('harbour').beta, shown: 1.31 },
    { what: 'Morrow 2013–17', value: sub('morrow', 0, 60).beta, shown: 0.91 },
    { what: 'Harbour 2013–17', value: sub('harbour', 0, 60).beta, shown: 1.34 },
    { what: 'Ridgeway required', value: reqR * 100, shown: 10.25 },
    { what: 'Ridgeway alpha', value: (0.12 - reqR) * 100, shown: 1.75 },
    { what: 'Bills 60', value: rf60 * 100, shown: 4.56 },
    { what: 'Market excess 60', value: mex60 * 100, shown: 7.56 },
    { what: 'Ex-post SML Morrow', value: (rf60 + RM.beta * mex60) * 100, shown: 11.37 },
    { what: 'Morrow mean 60', value: mean(L('morrow')) * 1200, shown: 11.37 },
    { what: 'Harbour mean 60', value: mean(L('harbour')) * 1200, shown: 14.01 },
    { what: 'Ex-post SML Harbour', value: (rf60 + RH.beta * mex60) * 100, shown: 14.01 },
    { what: 'Intl beta 15y', value: RI.beta, shown: 0.85 },
    { what: 'Intl beta 15y 3dp', value: RI.beta, shown: 0.849, tol: 0.0005 },
    { what: 'Intl mean', value: st.intl.mean * 100, shown: 10.27 },
    { what: 'Bills mean', value: rfH * 100, shown: 2.03 },
    { what: 'Market mean', value: st.market.mean * 100, shown: 10.43 },
    { what: 'Market excess 15y', value: (st.market.mean - rfH) * 100, shown: 8.40 },
    { what: 'Intl excess', value: (st.intl.mean - rfH) * 100, shown: 8.24 },
    { what: 'Intl CAPM return', value: (rfH + RI.beta * (st.market.mean - rfH)) * 100, shown: 9.17 },
    { what: 'Jensen intl', value: jI * 100, shown: 1.11 },
    { what: 'Treynor intl', value: trI * 100, shown: 9.70 },
    { what: 'Treynor market', value: trM * 100, shown: 8.40 },
    { what: 'Sharpe intl', value: shI, shown: 0.471, tol: 0.0005 },
    { what: 'Sharpe market', value: shM, shown: 0.525, tol: 0.0005 },
    { what: 'Intl SD', value: st.intl.sd * 100, shown: 17.50 },
    { what: 'Intl R2', value: RI.r2, shown: 0.60 },
    { what: 'Intl alpha monthly', value: RI.alpha * 100, shown: 0.092, tol: 0.0005 },
    { what: 'Intl alpha SE', value: RI.seAlpha * 100, shown: 0.241, tol: 0.0005 },
    { what: 'Intl t', value: RI.alpha / RI.seAlpha, shown: 0.38 },
    { what: 'Active alpha monthly', value: RA.alpha * 100, shown: -0.079, tol: 0.0005 },
    { what: 'Active alpha annual', value: RA.alpha * 1200, shown: -0.95 },
    { what: 'Active t', value: RA.alpha / RA.seAlpha, shown: -0.98 },
    { what: 'Bond beta 15y', value: RB.beta, shown: 0.08 },
    { what: 'Bond Jensen alpha', value: IV.jensenAlpha(st.bonds.mean, rfH, RB.beta, st.market.mean) * 100, shown: 1.58 },
    { what: 'Bond Treynor over 27%', value: IV.treynor(st.bonds.mean, rfH, RB.beta) * 100 > 27 ? 1 : 0, shown: 1 },
    { what: 'Morrow ex-ante CI ends', value: (rf + 0.51 * mrp) * 100, shown: 7.01, tol: 0.006 },
    { what: 'Morrow ex-ante CI high', value: (rf + 1.29 * mrp) * 100, shown: 11.29, tol: 0.006 },
    { what: 'Range > 4 points', value: (1.29 - 0.51) * mrp * 100 > 4 ? 1 : 0, shown: 1 },
    { what: 'Morrow beta below 1 and below-market required return', value: RM.beta < 1 && reqM < rf + mrp ? 1 : 0, shown: 1 },
    { what: 'Brightcup is a company in the case', value: COMPANIES.brightcup.name === 'Brightcup Coffee' ? 1 : 0, shown: 1 },
  ],
};
