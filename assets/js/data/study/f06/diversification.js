// diversification.js — F06 · Diversification. Content only; exercises are in diversification.ex.js.
// Every return figure comes from case.js (SERIES, DERIVED), which reads the SIMULATED monthly history in data.js
// (tools/study/f06-data.py); the funds and companies are fictional. Corrie Peak Ski Resort and Sandhaven Hotels are
// fictional businesses invented for the scenario example. Formulas from core/investments.js.
import { SERIES, MONTHS, DERIVED, ANA, COMPANIES } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';

const st = DERIVED.stats;
const sdOf = (r) => { const m = r.reduce((a, b) => a + b, 0) / r.length; return Math.sqrt(r.reduce((s, v) => s + (v - m) ** 2, 0) / (r.length - 1)); };
const cov = (a, b) => IV.sampleCov(SERIES[a], SERIES[b]);
const MB = cov('market', 'bonds'), MI = cov('market', 'intl'), IB = cov('intl', 'bonds'), MH = cov('morrow', 'harbour');
const two = (w, a, b, corr) => IV.twoAsset({ w, ra: st[a].mean, rb: st[b].mean, sa: st[a].sd, sb: st[b].sd, corr });
const P60 = two(0.6, 'market', 'bonds', MB.corr);
const wavg60 = 0.6 * st.market.sd + 0.4 * st.bonds.sd;
const mix60 = SERIES.market.map((v, i) => 0.6 * v + 0.4 * SERIES.bonds[i]);
const wMinMB = IV.twoAssetMinVarWeight({ sa: st.market.sd, sb: st.bonds.sd, corr: MB.corr });
const wMin0 = IV.twoAssetMinVarWeight({ sa: st.market.sd, sb: st.bonds.sd, corr: 0 });
const wZero = st.bonds.sd / (st.market.sd + st.bonds.sd);
const PMH = two(0.5, 'morrow', 'harbour', MH.corr);
const wMinMH = IV.twoAssetMinVarWeight({ sa: st.morrow.sd, sb: st.harbour.sd, corr: MH.corr });
const PMHmin = two(wMinMH, 'morrow', 'harbour', MH.corr);
// equally weighted portfolios of "typical" shares like Morrow & Pike and Harbour Street
const avgVar = (st.morrow.sd ** 2 + st.harbour.sd ** 2) / 2, avgCov = MH.cov * 12;
const ew = (n) => IV.equalWeightSd(n, avgVar, avgCov);
// correlations by calendar year
const inYear = (y) => MONTHS.map((m, i) => (m.startsWith(y) ? i : -1)).filter((i) => i >= 0);
const corrIn = (y, a, b) => { const ix = inYear(y); return IV.sampleCov(ix.map((i) => SERIES[a][i]), ix.map((i) => SERIES[b][i])).corr; };
const yr = (k, y) => IV.yearly(MONTHS, SERIES[k]).find((z) => z.year === y).ret;
// the scenario example (fictional)
const SC = [{ p: 0.3, a: 0.20, b: 0.00 }, { p: 0.4, a: 0.10, b: 0.12 }, { p: 0.3, a: -0.05, b: 0.10 }];
const scC = IV.scenarioCov(SC);
const scA = IV.scenarios(SC.map((s) => ({ p: s.p, r: s.a }))), scB = IV.scenarios(SC.map((s) => ({ p: s.p, r: s.b })));
const scP = IV.scenarios(SC.map((s) => ({ p: s.p, r: 0.5 * s.a + 0.5 * s.b })));

export default {
  slug: 'diversification',
  title: 'Diversification',
  blurb: 'Measure how two investments move together with covariance and correlation, work out the risk of a portfolio, and see how much risk spreading money removes, how much it can’t, and when it lets you down.',
  status: 'draft',
  objectives: [
    'Calculate the covariance and correlation of two assets’ returns, from scenarios and from history, and interpret them.',
    'Calculate the expected return and standard deviation of a two-asset portfolio and find the mix with the least risk.',
    'Explain why a portfolio’s standard deviation is below the weighted average of its parts unless the correlation is 1.',
    'Distinguish systematic from unsystematic risk and estimate how a portfolio’s risk falls as holdings are added.',
    'Evaluate how well diversification held up in the simulated crashes of 2020 and 2022, and what correlation can and can’t promise.',
  ],
  prerequisites: [
    { lesson: 'f06/measuring-risk', why: 'Standard deviation of returns from history and scenarios, and annualising it with √12.' },
    { lesson: 'f06/measuring-returns', why: 'Expected return, arithmetic means and the risk premium over bills.' },
    { lesson: 'f00/decision-principles', why: 'Diversification, systematic and unsystematic risk were introduced there in words.' },
    { text: 'Covariance and Pearson’s correlation are taught in depth in B05; this lesson explains what it needs.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'June 2028. Ana Lim has opened a retirement account: $5,000 from her parents on 1 July and $400 a month after that, for about 30 years. Her provider offers three Harbourline index funds (total market, international and bonds) and an actively managed fund. Her first instinct is to put everything in the total-market fund, which earned the most over the last fifteen years. Her second is to ask why anyone holds a bond fund that earned less than half as much. This lesson answers the second question, and in doing so explains why the total-market fund itself is a good idea.' },
    { p: 'A <g>portfolio</g> is the set of investments someone holds. Each holding’s <g>portfolio weight</g> is its share of the total value: $6,000 in shares and $4,000 in bonds is a 60% weight in shares and 40% in bonds. The weights add up to 1. A portfolio’s return in any period is simply the weighted average of its holdings’ returns. If shares return 10% and bonds 4%, the 60/40 portfolio returns <m>0.6 \\times 10\\% + 0.4 \\times 4\\% = 7.6\\%</m>. Expected return works the same way.' },
    { p: 'Risk does not. The standard deviation of a portfolio is usually <i>less</i> than the weighted average of its holdings’ standard deviations, because when one holding has a bad month the others often don’t, and the losses are partly offset. That is <g>diversification</g>: spreading money across investments that don’t move in lockstep. How much it helps depends on one thing only, beyond the holdings’ own risks: how closely they move together. This lesson measures that with <g>covariance</g> and the <g>correlation coefficient</g>.' },
    { p: 'The figures in this course’s market history are <b>simulated for teaching</b>: monthly total returns for January 2013 to December 2027, generated to look broadly like real markets, for fictional funds and companies. They are not real history. For real long-run returns, check a source such as Aswath Damodaran’s annually updated table of US stock, bond and bill returns since 1928 (see the references).' },
    { table: {
      caption: 'The Harbourline funds, January 2013 – December 2027 (simulated monthly returns, annualised)',
      head: ['Fund', 'Mean return a year', 'Standard deviation a year', 'Correlation with the total-market fund'],
      align: ['l', 'r', 'r', 'r'],
      rows: [
        ['Total Market Index Fund', '10.43%', '16.00%', '1.00'],
        ['International Index Fund', '10.27%', '17.50%', '0.78'],
        ['Aggregate Bond Index Fund', '4.31%', '4.14%', '0.32'],
        ['One-month bills', '2.03%', '0.56%', '—'],
      ],
      note: 'Means are 12 × the monthly mean; standard deviations are √12 × the monthly sample standard deviation. Every fund is fictional and every return simulated.',
    } },
    { p: 'The bond fund’s correlation with the share market is low, 0.32, so in many months when shares fell the bond fund held its value or rose. That is what makes it worth holding alongside shares even though its own return is lower. The international fund is a different case: its correlation with the home market is 0.78, so it moves with home shares much of the time and diversifies less.' },
    { callout: 'key', title: 'Return averages; risk doesn’t', html: 'A portfolio’s expected return is the weighted average of its holdings’ expected returns. Its standard deviation is below the weighted average of their standard deviations whenever their correlation is less than 1. The gap is the free lunch of diversification: less risk for the same expected return.' },
  ],

  theory: [
    { h: 'Covariance and correlation' },
    { p: 'Covariance measures whether two returns tend to be above their means at the same time. For each period, multiply the two assets’ deviations from their own means; the covariance is the average of those products (dividing by <m>n - 1</m> for a sample, as Excel’s COVARIANCE.S does). If both tend to be above average together and below average together, most products are positive and so is the covariance. If one tends to be up when the other is down, it is negative.' },
    { p: 'Covariance is hard to read on its own because its units are the product of the two returns’ units (per cent squared, per month squared). Dividing it by the two standard deviations gives the correlation coefficient, <m>\\rho</m> (rho), a pure number from −1 to +1: +1 when the two always move in exact proportion in the same direction, −1 when they always move in exact proportion in opposite directions, and 0 when there is no straight-line relation at all. Correlation describes co-movement; it does not say that one asset causes the other’s moves.' },
    { p: 'For the simulated history, the total-market fund’s monthly standard deviation is 4.62% and the bond fund’s 1.19%. Their monthly covariance is 0.000177, so their correlation is <m>0.000177 \\div (0.0462 \\times 0.0119) = 0.32</m>. Annualised, the covariance is <m>12 \\times 0.000177 = 0.00213</m>; the correlation is the same in monthly and annual units, because the factor of 12 multiplies the covariance and the product of the two standard deviations alike.' },
    { p: 'With <b>scenarios</b> instead of history, use probabilities in place of the equal weights: the covariance is <m>\\sum_s p_s (r_{A,s} - E[r_A])(r_{B,s} - E[r_B])</m>, with no <m>n - 1</m>. The worked examples do one.' },

    { h: 'The risk of a two-asset portfolio' },
    { p: 'With a weight <m>w</m> in asset A and <m>1 - w</m> in asset B, the portfolio’s variance is' },
    { math: String.raw`\sigma_P^2 = w^2\sigma_A^2 + (1-w)^2\sigma_B^2 + 2\,w(1-w)\,\rho_{AB}\,\sigma_A\sigma_B` },
    { p: 'The first two terms are each asset’s own risk, scaled by the square of its weight. The third is the interaction, and it is where diversification lives: it carries the correlation (<m>\\rho_{AB}\\sigma_A\\sigma_B</m> is just the covariance). The lower the correlation, the smaller the third term, and below zero it subtracts.' },
    { p: 'For Ana’s two candidate funds, a mix of 60% total market and 40% bonds has an expected return of <m>0.6 \\times 10.43\\% + 0.4 \\times 4.31\\% = 7.98\\%</m> a year and a standard deviation of <m>\\sqrt{0.36 \\times 0.1600^2 + 0.16 \\times 0.0414^2 + 2 \\times 0.24 \\times 0.32 \\times 0.1600 \\times 0.0414} = 10.25\\%</m>. The weighted average of the two standard deviations is <m>0.6 \\times 16.00\\% + 0.4 \\times 4.14\\% = 11.25\\%</m>, so diversification removes 1.00 point of risk without costing any expected return. The formula is exact for the sample: the actual month-by-month returns of a 60/40 mix, rebalanced every month, have the same 10.25%.' },
    { table: {
      caption: 'Mixes of the total-market and bond funds (simulated 2013–2027, correlation 0.32)',
      head: ['Weight in shares', 'Expected return', 'Standard deviation', 'Weighted average of the two SDs'],
      align: ['r', 'r', 'r', 'r'],
      rows: [
        ['0%', '4.31%', '4.14%', '4.14%'],
        ['20%', '5.54%', '5.29%', '6.51%'],
        ['40%', '6.76%', '7.57%', '8.88%'],
        ['60%', '7.98%', '10.25%', '11.25%'],
        ['80%', '9.21%', '13.09%', '13.63%'],
        ['100%', '10.43%', '16.00%', '16.00%'],
      ],
    } },

    { h: 'What correlation does' },
    { p: 'Three cases mark out the possibilities. When <m>\\rho = +1</m>, the formula collapses to <m>\\sigma_P = w\\sigma_A + (1-w)\\sigma_B</m>: the standard deviation is the weighted average and diversification achieves nothing. When <m>\\rho = -1</m>, the two always move against each other and there is a mix with no risk at all, <m>w = \\sigma_B \\div (\\sigma_A + \\sigma_B)</m>: for these two funds, 20.5% in shares. Real assets sit between. Every correlation below 1 gives some reduction, and the lower the correlation, the larger it is. The Explore widget lets you drag the correlation and watch the curve of mixes bend.' },
    { h: 'The minimum-variance mix' },
    { p: 'Setting the derivative of the variance to zero gives the weight in A with the least risk:' },
    { math: String.raw`w^{*} = \dfrac{\sigma_B^2 - \rho_{AB}\sigma_A\sigma_B}{\sigma_A^2 + \sigma_B^2 - 2\rho_{AB}\sigma_A\sigma_B}` },
    { p: 'For the total-market and bond funds it gives <m>w^{*} = -1.8\\%</m>: the least risky mix would sell shares short. Without short selling, the least risky portfolio is 100% bonds. That happens whenever the correlation is above the ratio of the smaller standard deviation to the larger (here <m>0.0414 \\div 0.1600 = 0.26</m>): adding a little of a much riskier asset that moves partly with the safe one adds more risk than it removes. Had the correlation been 0, the least risky mix would have held 6.3% in shares. So a little of a risky asset can reduce risk, but only if it is not too correlated with what you already hold.' },
    { p: 'Two shares of similar risk give a more interesting answer. Morrow &amp; Pike Roasters and Harbour Street Foods, two of the course’s fictional listed companies, have standard deviations of 25.25% and 32.03% a year in the simulated history and a correlation of 0.35. Half in each has an expected return of 11.06% and a standard deviation of 23.61%, well below the 28.64% average of the two. The least risky mix holds 67.7% in Morrow &amp; Pike, with a standard deviation of 22.88%. Notice that every one of these two-share portfolios is still far riskier than the total-market fund (16.00%), which earned about the same.' },

    { h: 'Many assets: the risk that diversification can’t remove' },
    { p: 'Add more holdings and the pattern continues, up to a limit. For an <g>equally weighted portfolio</g> of <m>n</m> assets, each with the same average variance and the same average covariance with the others, the portfolio variance is' },
    { math: String.raw`\sigma_P^2 = \dfrac{1}{n}\,\overline{\sigma^2} + \left(1 - \dfrac{1}{n}\right)\overline{\text{cov}}` },
    { p: 'As <m>n</m> grows, the first term, each holding’s own risk, shrinks towards zero: that is <g>unsystematic risk</g>, the part specific to each company, being diversified away. The second term tends to the average covariance and stays. That is <g>systematic risk</g>, the part every share shares because they all respond to the same economy. No amount of spreading within shares removes it.' },
    { p: 'Suppose typical shares are like Morrow &amp; Pike and Harbour Street: an average variance of 0.0832 a year (a standard deviation of 28.84%) and an average covariance of 0.0283. The table shows what equal weighting does. Most of the reduction comes from the first ten or so holdings, and the floor, <m>\\sqrt{0.0283} = 16.83\\%</m>, is close to the total-market fund’s own 16.00%: the market fund has already diversified away almost all the specific risk. OpenStax’s <i>Principles of Finance</i> (section 15.2) makes the same point with real shares: risk falls quickly at first and then slowly, and a portfolio of around a dozen shares already removes much of the firm-specific risk.' },
    { table: {
      caption: 'Standard deviation of an equally weighted portfolio of n typical shares (average variance 0.0832, average covariance 0.0283; simulated)',
      head: ['Number of shares', 'Standard deviation a year'],
      align: ['r', 'r'],
      rows: [['1', '28.84%'], ['2', '23.61%'], ['5', '19.83%'], ['10', '18.39%'], ['30', '17.37%'], ['100', '17.00%'], ['Very many', '16.83%']],
      note: 'From the formula above with the two companies’ simulated variances and covariance; real shares differ in their risks and correlations.',
    } },
    { p: 'This is why the market pays no premium for unsystematic risk: anyone can get rid of it cheaply. In the simulated history Morrow &amp; Pike’s standard deviation (25.25%) was far above the market fund’s (16.00%) but its mean return was lower (9.59% against 10.43%). The CAPM lesson turns this into a rule: expected return depends only on the systematic part of risk, measured by <g>beta</g>. To remove systematic risk you have to hold something outside the share market, such as bonds or bills, and accept a lower expected return.' },

    { h: 'When diversification lets you down' },
    { p: 'Correlations are not fixed. A common observation in real markets is that shares in different countries and industries fall together in a crash, just when diversification is wanted most. The simulated data show the same pattern for shares, and show why. Measured within single calendar years, the home and international funds’ correlation was 0.90 in 2020 and 0.85 in 2022, against 0.78 over the fifteen years; for Morrow &amp; Pike and Harbour Street it was 0.78 in 2020 and 0.49 in 2022, against 0.35. In March 2020 one shock, a 17% fall in the market, hit every share at once, and a common shock that large dominates the year’s movements.' },
    { table: {
      caption: 'Correlations of monthly returns within a calendar year (simulated)',
      head: ['Pair', '2013–2027', '2020', '2022'],
      align: ['l', 'r', 'r', 'r'],
      rows: [
        ['Total market and international', '0.78', '0.90', '0.85'],
        ['Morrow &amp; Pike and Harbour Street', '0.35', '0.78', '0.49'],
        ['Total market and bonds', '0.32', '0.13', '0.15'],
      ],
      note: 'A correlation from 12 months is a noisy estimate: treat differences of a few tenths with caution.',
    } },
    { p: 'Bonds behaved differently. Their monthly correlation with shares was <i>lower</i> in 2020 and 2022 than over the whole period. Yet in 2022 the total-market fund lost 26.9% and the bond fund 13.0%: both had a bad year at once. Low correlation means the two didn’t move together month by month; it says nothing about whether both drift down over the same year. In 2022, rising interest rates pushed bond prices down steadily while shares fell for their own reasons. Correlation measures co-movement around each asset’s own average, not whether the averages themselves are positive.' },
    { callout: 'warn', title: 'Diversification reduces risk; it doesn’t guarantee anything', html: 'A 60/40 mix of the two funds still lost 21.3% in 2022 in the simulated history. Diversification makes bad outcomes less likely and less severe on average. It does not make shares safe for money needed soon, which is why Ana’s flat deposit, due in April 2032, stays in her savings account.' },
  ],

  formulas: [
    { id: 'div-covariance', name: 'Sample covariance of two return series',
      tex: String.raw`\text{cov}(r_A, r_B) = \dfrac{1}{n-1}\sum_{t=1}^{n}(r_{A,t} - \bar r_A)(r_{B,t} - \bar r_B)`,
      where: [[String.raw`r_{A,t},\ r_{B,t}`, 'The two assets’ returns in period t', 'decimal'], [String.raw`\bar r_A,\ \bar r_B`, 'Their mean returns over the sample', 'decimal'], [String.raw`n`, 'Number of periods', '']],
      assumptions: 'Both series cover the same periods. With scenarios, weight each product by its probability and drop the n − 1.',
      note: 'Excel: COVARIANCE.S. Monthly covariance × 12 is the annual covariance.' },
    { id: 'div-correlation', name: 'Correlation coefficient',
      tex: String.raw`\rho_{AB} = \dfrac{\text{cov}(r_A, r_B)}{\sigma_A\,\sigma_B}`,
      where: [[String.raw`\rho_{AB}`, 'Correlation between A’s and B’s returns, from −1 to +1', ''], [String.raw`\text{cov}(r_A, r_B)`, 'Their covariance', 'decimal²'], [String.raw`\sigma_A,\ \sigma_B`, 'Their standard deviations, in the same periods as the covariance', 'decimal']],
      assumptions: 'Measures straight-line co-movement only.',
      note: 'Excel: CORREL. The same in monthly and annual units.' },
    { id: 'div-port-return', name: 'Expected return of a portfolio',
      tex: String.raw`E[r_P] = \sum_{i} w_i\,E[r_i] \qquad \text{two assets: } E[r_P] = w\,E[r_A] + (1-w)\,E[r_B]`,
      where: [[String.raw`w_i`, 'Weight of holding i: its value ÷ the portfolio’s value; the weights sum to 1', ''], [String.raw`E[r_i]`, 'Expected return of holding i', '% per year']],
      assumptions: 'Weights at the start of the period.' },
    { id: 'div-port-sd', name: 'Standard deviation of a two-asset portfolio',
      tex: String.raw`\sigma_P = \sqrt{w^2\sigma_A^2 + (1-w)^2\sigma_B^2 + 2\,w(1-w)\,\rho_{AB}\,\sigma_A\sigma_B}`,
      where: [[String.raw`w`, 'Weight in asset A (1 − w in B)', ''], [String.raw`\sigma_A,\ \sigma_B`, 'The assets’ standard deviations', '% per year'], [String.raw`\rho_{AB}`, 'Their correlation', '']],
      assumptions: 'Weights held constant (rebalanced each period).',
      note: 'ρσ_Aσ_B is the covariance, so the last term can be written 2w(1 − w)cov(r_A, r_B).' },
    { id: 'div-min-var', name: 'Minimum-variance weight for two assets',
      tex: String.raw`w^{*} = \dfrac{\sigma_B^2 - \rho_{AB}\sigma_A\sigma_B}{\sigma_A^2 + \sigma_B^2 - 2\rho_{AB}\sigma_A\sigma_B}`,
      where: [[String.raw`w^{*}`, 'Weight in A that gives the lowest portfolio variance', ''], [String.raw`\sigma_A,\ \sigma_B,\ \rho_{AB}`, 'As above', '']],
      assumptions: 'Short selling allowed. If w* is below 0 or above 1 and short selling is not allowed, the least risky portfolio holds only the less risky asset.' },
    { id: 'div-equal-weight', name: 'Risk of an equally weighted portfolio of n assets',
      tex: String.raw`\sigma_P = \sqrt{\dfrac{1}{n}\,\overline{\sigma^2} + \left(1 - \dfrac{1}{n}\right)\overline{\text{cov}}}`,
      where: [[String.raw`n`, 'Number of holdings, each with weight 1/n', ''], [String.raw`\overline{\sigma^2}`, 'Average variance of the holdings', 'decimal² per year'], [String.raw`\overline{\text{cov}}`, 'Average covariance between pairs of holdings', 'decimal² per year']],
      assumptions: 'Uses averages; real holdings differ.',
      note: 'As n grows, σ_P falls towards √(average covariance): the systematic risk that remains.' },
  ],

  examples: [
    { level: 'simple', title: 'A ski resort and a beach hotel', fictional: true,
      setup: 'Corrie Peak Ski Resort and Sandhaven Hotels are fictional listed companies. Analysts see three equally plausible kinds of season for next year, with these returns on the shares:',
      table: { head: ['Season', 'Probability', 'Corrie Peak', 'Sandhaven'], align: ['l', 'r', 'r', 'r'], rows: [['Cold, snowy winter', '0.3', '20%', '0%'], ['Normal year', '0.4', '10%', '12%'], ['Mild, wet winter', '0.3', '−5%', '10%']] },
      steps: [
        String.raw`Expected returns: Corrie Peak <m>0.3 \times 20 + 0.4 \times 10 + 0.3 \times (-5) = 8.5\%</m>; Sandhaven <m>0.3 \times 0 + 0.4 \times 12 + 0.3 \times 10 = 7.8\%</m>. Their standard deviations (square root of the probability-weighted squared deviations) are 9.76% and 5.17%.`,
        String.raw`Deviations from the means, in percentage points: Corrie Peak 11.5, 1.5, −13.5; Sandhaven −7.8, 4.2, 2.2. Products: −89.7, 6.3, −29.7. Covariance <m>= 0.3(-89.7) + 0.4(6.3) + 0.3(-29.7) = -33.3</m> (%²), or −0.00333 in decimals.`,
        String.raw`Correlation: <m>-0.00333 \div (0.0976 \times 0.0517) = -0.66</m>. The two tend to do well in different seasons.`,
        String.raw`Half in each: the portfolio returns 10%, 11% and 2.5% in the three seasons. Expected return <m>0.3 \times 10 + 0.4 \times 11 + 0.3 \times 2.5 = 8.15\%</m>; standard deviation 3.72%, against an average of the two standard deviations of 7.47%.`,
      ],
      answer: 'Covariance −0.00333, correlation −0.66; the 50/50 portfolio expects 8.15% with a standard deviation of 3.72%.',
      interpretation: 'The portfolio’s expected return is exactly halfway between the two, but its risk is half the average: negative correlation lets each holding cushion the other’s bad season. The two-asset formula with ρ = −0.66 gives the same 3.72%.' },
    { level: 'challenging', title: 'Shares and bonds for Ana: how much risk does a bond fund remove?', fictional: true,
      setup: 'From the simulated 2013–2027 history: the total-market fund has a mean of 10.43% and a standard deviation of 16.00% a year; the bond fund 4.31% and 4.14%; their correlation is 0.32. Find the expected return and standard deviation of a 60/40 mix, the risk saved by diversification, and the least risky mix with and without short selling.',
      steps: [
        String.raw`Expected return: <m>0.6 \times 10.43\% + 0.4 \times 4.31\% = 7.98\%</m>.`,
        String.raw`Variance: <m>0.36 \times 0.1600^2 + 0.16 \times 0.0414^2 + 2 \times 0.6 \times 0.4 \times 0.32 \times 0.1600 \times 0.0414 = 0.0105</m>; standard deviation <m>\sqrt{0.0105} = 10.25\%</m>.`,
        String.raw`Without diversification (ρ = 1) the standard deviation would be <m>0.6 \times 16.00\% + 0.4 \times 4.14\% = 11.25\%</m>; the saving is 1.00 point.`,
        String.raw`Minimum variance: <m>w^{*} = (0.0414^2 - 0.32 \times 0.1600 \times 0.0414) \div (0.1600^2 + 0.0414^2 - 2 \times 0.32 \times 0.1600 \times 0.0414) = -1.8\%</m>. Negative, because the correlation (0.32) is above <m>0.0414 \div 0.1600 = 0.26</m>.`,
        'Without short selling, the least risky portfolio is 100% bonds, with a standard deviation of 4.14%.',
      ],
      answer: '60/40: expected return 7.98%, standard deviation 10.25% (1.00 point below the 11.25% weighted average). The least risky long-only mix is all bonds.',
      interpretation: 'Adding bonds to shares cuts risk faster than it cuts return: moving from 100% to 60% shares gives up 2.45 points of expected return and removes 5.75 points of standard deviation. Which mix suits Ana depends on how much risk she can bear, which the next lesson takes up. The figures are from simulated data.' },
    { level: 'applied', title: 'Two shares or one index fund?', fictional: true,
      setup: 'Owen Marsh (fictional), a coffee wholesaler, wants to invest $20,000 in “businesses he understands”: half in Morrow &amp; Pike Roasters and half in Harbour Street Foods. His adviser compares that with the total-market index fund, using the simulated 2013–2027 history (Morrow &amp; Pike: 9.59% mean, 25.25% SD; Harbour Street: 12.53%, 32.03%; correlation 0.35; the fund: 10.43%, 16.00%).',
      steps: [
        String.raw`Two-share portfolio, expected return: <m>0.5 \times 9.59\% + 0.5 \times 12.53\% = 11.06\%</m>.`,
        String.raw`Standard deviation: <m>\sqrt{0.25 \times 0.2525^2 + 0.25 \times 0.3203^2 + 2 \times 0.25 \times 0.35 \times 0.2525 \times 0.3203} = 23.61\%</m>, below the 28.64% average of the two because the correlation is only 0.35.`,
        'Compare with the fund: 0.63 points more mean return for 7.61 points more standard deviation. Fifteen years of simulated data cannot tell a mean difference that small from luck.',
        'Most of the extra risk is unsystematic: the formula for many holdings puts the floor for typical shares near 16.8%, so the extra 6.8 points or so comes from holding only two companies.',
      ],
      answer: 'The two shares carry a standard deviation of about 23.6% a year against the fund’s 16.0%, for a mean return only 0.6 points higher in this sample.',
      interpretation: 'The adviser’s point is not that the two companies are bad investments but that holding only two leaves risk the market does not pay for. If Owen likes them, a small holding on top of a diversified fund keeps most of the diversification.' },
  ],

  demo: [
    { widget: 'div-two-funds', intro: 'Ana’s two funds, with the simulated means and standard deviations. Move the weight in shares and watch the expected return change in a straight line while the risk bends. Then drag the correlation: at 1 the curve becomes a straight line between the two funds; at −1 it touches zero risk. The slider starts at 0.30, the nearest step to the data’s 0.32.' },
    { widget: 'div-two-shares', intro: 'Two shares of similar risk, Morrow &amp; Pike and Harbour Street. Find the least risky mix, then lower the correlation and see how much further the risk falls.' },
    { widget: 'div-n-shares', intro: 'How the risk of an equally weighted portfolio falls with the number of shares, and the floor it can’t pass.' },
  ],

  mistakes: [
    { title: 'Averaging standard deviations', html: 'A 60/40 portfolio’s standard deviation is not 60% of one plus 40% of the other unless the correlation is exactly 1. Use the two-asset formula; with Ana’s funds it gives 10.25%, not 11.25%. Expected returns, by contrast, do average.' },
    { title: 'Thinking more holdings always means much less risk', html: 'Adding holdings removes unsystematic risk only. Beyond a few dozen shares the gain is small, and the systematic risk that all shares share remains. Thirty shares in one industry diversify less than a broad index fund, because they share industry risk too.' },
    { title: 'Reading low correlation as protection in a bad year', html: 'Correlation measures how two returns move around their own averages. Two assets with low correlation can both lose money over the same year, as the simulated shares and bonds did in 2022 (−26.9% and −13.0%).' },
    { title: 'Treating a correlation as a constant', html: 'Correlations estimated from history change with the period and are noisy over short windows. Shares tend to become more correlated in crashes. Use a long sample, check how it varies, and don’t rely on a precise value.' },
    { title: 'Confusing covariance and correlation', html: 'Covariance has units (per cent squared) and depends on how volatile the assets are, so its size says little by itself. Correlation divides by both standard deviations and lies between −1 and 1. Use covariance in the variance formula, correlation to judge how closely two assets move.' },
  ],

  application: [
    { p: '<b>Ana’s fund choice.</b> Ana’s first plan, everything in the total-market fund, is already diversified across the whole home share market: its 16.00% standard deviation is close to the floor for shares. What it can’t diversify is the market itself. Adding the bond fund, with its 0.32 correlation, is the cheapest way to lower risk, and the international fund adds a little more diversification across economies. How much of each she should hold depends on her horizon and on how large a fall she could live with: that is the subject of the next lesson.' },
    { p: '<b>A pension committee’s review.</b> The trustees of a fictional company pension plan review their asset mix every year. Their consultant reports each asset class’s expected return and standard deviation and the correlations between them, then the portfolio’s standard deviation from the full covariance matrix (the many-asset version of the formula above). She also shows the correlations measured over the worst months, because the trustees care most about whether the mix holds up in a crash.' },
    { p: '<b>Employees and their employer’s shares.</b> A fictional battery-storage installer offers staff shares at a discount. An employee who puts most of her savings into them doubles up on one company’s risk: if the firm struggles she could lose her job and her savings together, so her savings and her income are highly correlated. A financial planner would suggest keeping that holding small and spreading the rest across broad funds.' },
  ],

  summary: [
    'A portfolio’s expected return is the weighted average of its holdings’ expected returns; its standard deviation is below the weighted average whenever the correlation is below 1.',
    'Covariance is the average product of deviations from the means; correlation divides it by both standard deviations and runs from −1 to +1.',
    'Two assets: σ_P² = w²σ_A² + (1 − w)²σ_B² + 2w(1 − w)ρσ_Aσ_B. Ana’s 60/40 mix of the simulated funds: 7.98% expected return, 10.25% standard deviation.',
    'The minimum-variance weight can be negative; without short selling the least risky portfolio may hold only the safer asset, as with Ana’s shares and bonds.',
    'Adding holdings removes unsystematic risk; systematic risk, the average covariance, remains. Most of the gain comes from the first ten or so shares.',
    'Correlations change: in the simulated crashes shares moved together more. Low correlation doesn’t stop two assets both losing over a year, as shares and bonds did in 2022.',
  ],
  glossary: [
    { term: 'Portfolio', def: 'The set of investments a person or institution holds, described by what each holding is and its weight.' },
    { term: 'Portfolio weight', def: 'A holding’s value divided by the value of the whole portfolio. The weights add up to 1; a negative weight means the asset has been sold short.' },
    { term: 'Covariance', def: 'The average product of two variables’ deviations from their means (dividing by n − 1 for a sample, by n for a population): positive when they tend to move together, negative when they move in opposite directions. Its units are the product of the two variables’ units.' },
    { term: 'Correlation coefficient', def: 'Pearson’s r: a number from −1 to +1 that measures how closely two numeric variables follow a straight line, positive when they rise together. Excel’s CORREL.' },
    { term: 'Minimum-variance portfolio', def: 'The mix of a given set of assets with the lowest possible variance (and so standard deviation) of return, with or without short selling allowed.' },
    { term: 'Equally weighted portfolio', def: 'A portfolio that puts the same amount in each of its n holdings, so that each has a weight of 1/n.' },
  ],
  references: [
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 15.2, “Risk and Return to Multiple Assets”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/15-2-risk-and-return-to-multiple-assets', checked: '2026-11-11' },
    { text: 'Damodaran, A. <i>Historical Returns on Stocks, Bonds and Bills: 1928–2024</i> (data page, updated 5 January 2026). NYU Stern.', url: 'https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html', checked: '2026-11-11' },
    { text: 'Microsoft. <i>COVARIANCE.S function</i>. Microsoft Support.', url: 'https://support.microsoft.com/en-us/office/covariance-s-function-0a539b74-7371-42aa-a18f-1f5320314977', checked: '2026-11-11' },
  ],
  checks: [
    { what: 'Ana lump sum', value: ANA.retirement.lump, shown: 5000 },
    { what: 'Ana monthly', value: ANA.retirement.monthly, shown: 400 },
    { what: '60/40 illustration in concept', value: (0.6 * 10 + 0.4 * 4), shown: 7.6 },
    { what: 'Market mean', value: st.market.mean * 100, shown: 10.43 },
    { what: 'Market SD', value: st.market.sd * 100, shown: 16.00 },
    { what: 'Intl mean', value: st.intl.mean * 100, shown: 10.27 },
    { what: 'Intl SD', value: st.intl.sd * 100, shown: 17.50 },
    { what: 'Bonds mean', value: st.bonds.mean * 100, shown: 4.31 },
    { what: 'Bonds SD', value: st.bonds.sd * 100, shown: 4.14 },
    { what: 'Bills mean', value: st.bills.mean * 100, shown: 2.03 },
    { what: 'Bills SD', value: st.bills.sd * 100, shown: 0.56 },
    { what: 'Bond fund earned less than half the market', value: st.bonds.mean < st.market.mean / 2 ? 1 : 0, shown: 1 },
    { what: 'Total market earned the most of the funds', value: st.market.mean === Math.max(st.market.mean, st.intl.mean, st.bonds.mean, st.active.mean) ? 1 : 0, shown: 1 },
    { what: 'Corr market–intl', value: MI.corr, shown: 0.78 },
    { what: 'Corr market–bonds', value: MB.corr, shown: 0.32 },
    { what: 'Monthly SD market', value: sdOf(SERIES.market) * 100, shown: 4.62 },
    { what: 'Monthly SD bonds', value: sdOf(SERIES.bonds) * 100, shown: 1.19 },
    { what: 'Monthly covariance market–bonds', value: MB.cov, shown: 0.000177, tol: 0.0000005 },
    { what: 'Corr from rounded inputs', value: 0.000177 / (0.0462 * 0.0119), shown: 0.32 },
    { what: 'Annual covariance', value: MB.cov * 12, shown: 0.00213, tol: 0.000005 },
    { what: '60/40 expected return', value: P60.er * 100, shown: 7.98 },
    { what: '60/40 SD', value: P60.sd * 100, shown: 10.25 },
    { what: '60/40 SD from the rounded inputs', value: Math.sqrt(0.36 * 0.16 ** 2 + 0.16 * 0.0414 ** 2 + 2 * 0.24 * 0.32 * 0.16 * 0.0414) * 100, shown: 10.25, tol: 0.05 },
    { what: '60/40 variance', value: P60.sd ** 2, shown: 0.0105, tol: 0.00005 },
    { what: 'Weighted average SD 60/40', value: wavg60 * 100, shown: 11.25 },
    { what: 'Diversification saving 60/40', value: (wavg60 - P60.sd) * 100, shown: 1.00 },
    { what: 'Actual 60/40 series SD', value: sdOf(mix60) * Math.sqrt(12) * 100, shown: 10.25 },
    ...[0, 0.2, 0.4, 0.6, 0.8, 1].flatMap((w) => { const q = two(w, 'market', 'bonds', MB.corr); const sh = { 0: [4.31, 4.14, 4.14], 0.2: [5.54, 5.29, 6.51], 0.4: [6.76, 7.57, 8.88], 0.6: [7.98, 10.25, 11.25], 0.8: [9.21, 13.09, 13.63], 1: [10.43, 16.00, 16.00] }[w];
      return [{ what: `mix ${w} er`, value: q.er * 100, shown: sh[0] }, { what: `mix ${w} sd`, value: q.sd * 100, shown: sh[1] }, { what: `mix ${w} wavg`, value: (w * st.market.sd + (1 - w) * st.bonds.sd) * 100, shown: sh[2] }]; }),
    { what: 'Zero-risk weight at ρ = −1', value: wZero * 100, shown: 20.5, tol: 0.05 },
    { what: 'Min-variance weight market/bonds', value: wMinMB * 100, shown: -1.8, tol: 0.05 },
    { what: 'Ratio of SDs', value: st.bonds.sd / st.market.sd, shown: 0.26 },
    { what: 'Corr above ratio (so w* < 0)', value: MB.corr > st.bonds.sd / st.market.sd && wMinMB < 0 ? 1 : 0, shown: 1 },
    { what: 'Min-variance weight at ρ = 0', value: wMin0 * 100, shown: 6.3, tol: 0.05 },
    { what: 'Morrow SD', value: st.morrow.sd * 100, shown: 25.25 },
    { what: 'Harbour SD', value: st.harbour.sd * 100, shown: 32.03 },
    { what: 'Morrow mean', value: st.morrow.mean * 100, shown: 9.59 },
    { what: 'Harbour mean', value: st.harbour.mean * 100, shown: 12.53 },
    { what: 'Corr Morrow–Harbour', value: MH.corr, shown: 0.35 },
    { what: 'MH 50/50 er', value: PMH.er * 100, shown: 11.06 },
    { what: 'MH 50/50 sd', value: PMH.sd * 100, shown: 23.61 },
    { what: 'MH average SD', value: (st.morrow.sd + st.harbour.sd) / 2 * 100, shown: 28.64 },
    { what: 'MH min-var weight', value: wMinMH * 100, shown: 67.7, tol: 0.05 },
    { what: 'MH min-var SD', value: PMHmin.sd * 100, shown: 22.88 },
    { what: 'Average variance', value: avgVar, shown: 0.0832, tol: 0.00005 },
    { what: 'Average covariance', value: avgCov, shown: 0.0283, tol: 0.00005 },
    { what: 'SD of typical share', value: Math.sqrt(avgVar) * 100, shown: 28.84 },
    { what: 'ew 1', value: ew(1) * 100, shown: 28.84 },
    { what: 'ew 2', value: ew(2) * 100, shown: 23.61 },
    { what: 'ew 5', value: ew(5) * 100, shown: 19.83 },
    { what: 'ew 10', value: ew(10) * 100, shown: 18.39 },
    { what: 'ew 30', value: ew(30) * 100, shown: 17.37 },
    { what: 'ew 100', value: ew(100) * 100, shown: 17.00 },
    { what: 'ew floor', value: Math.sqrt(avgCov) * 100, shown: 16.83 },
    { what: 'ew 10 removes most of the reduction (> 75%)', value: (ew(1) - ew(10)) / (ew(1) - Math.sqrt(avgCov)) > 0.75 ? 1 : 0, shown: 1 },
    { what: 'Morrow riskier but lower mean than market', value: st.morrow.sd > st.market.sd && st.morrow.mean < st.market.mean ? 1 : 0, shown: 1 },
    { what: 'corr mkt–intl 2020', value: corrIn('2020', 'market', 'intl'), shown: 0.90 },
    { what: 'corr mkt–intl 2022', value: corrIn('2022', 'market', 'intl'), shown: 0.85 },
    { what: 'corr MH 2020', value: corrIn('2020', 'morrow', 'harbour'), shown: 0.78 },
    { what: 'corr MH 2022', value: corrIn('2022', 'morrow', 'harbour'), shown: 0.49 },
    { what: 'corr mkt–bonds 2020', value: corrIn('2020', 'market', 'bonds'), shown: 0.13 },
    { what: 'corr mkt–bonds 2022', value: corrIn('2022', 'market', 'bonds'), shown: 0.15 },
    { what: 'Bond correlations lower in 2020 and 2022 than overall', value: corrIn('2020', 'market', 'bonds') < MB.corr && corrIn('2022', 'market', 'bonds') < MB.corr ? 1 : 0, shown: 1 },
    { what: 'Share correlations higher in 2020 and 2022 than overall', value: [['market', 'intl', MI.corr], ['morrow', 'harbour', MH.corr]].every(([a, b, c]) => corrIn('2020', a, b) > c && corrIn('2022', a, b) > c) ? 1 : 0, shown: 1 },
    { what: 'March 2020 market return (about −17%)', value: SERIES.market[MONTHS.indexOf('2020-03')] * 100, shown: -17, tol: 0.5 },
    { what: 'Market 2022', value: yr('market', '2022') * 100, shown: -26.9, tol: 0.05 },
    { what: 'Bonds 2022', value: yr('bonds', '2022') * 100, shown: -13.0, tol: 0.05 },
    { what: '60/40 in 2022', value: IV.yearly(MONTHS, mix60).find((z) => z.year === '2022').ret * 100, shown: -21.3, tol: 0.05 },
    { what: 'Scenario: Corrie mean', value: scA.er * 100, shown: 8.5 },
    { what: 'Scenario: Sandhaven mean', value: scB.er * 100, shown: 7.8 },
    { what: 'Scenario: Corrie SD', value: scA.sd * 100, shown: 9.76 },
    { what: 'Scenario: Sandhaven SD', value: scB.sd * 100, shown: 5.17 },
    { what: 'Scenario products', value: (0.20 - scA.er) * (0.00 - scB.er) * 1e4, shown: -89.7 },
    { what: 'Scenario products 2', value: (0.10 - scA.er) * (0.12 - scB.er) * 1e4, shown: 6.3 },
    { what: 'Scenario products 3', value: (-0.05 - scA.er) * (0.10 - scB.er) * 1e4, shown: -29.7 },
    { what: 'Scenario covariance %²', value: scC.cov * 1e4, shown: -33.3 },
    { what: 'Scenario covariance', value: scC.cov, shown: -0.00333, tol: 0.000005 },
    { what: 'Scenario correlation', value: scC.corr, shown: -0.66 },
    { what: 'Scenario 50/50 er', value: scP.er * 100, shown: 8.15 },
    { what: 'Scenario 50/50 sd', value: scP.sd * 100, shown: 3.72 },
    { what: 'Scenario 50/50 sd by formula', value: IV.twoAsset({ w: 0.5, ra: scA.er, rb: scB.er, sa: scA.sd, sb: scB.sd, corr: scC.corr }).sd * 100, shown: 3.72 },
    { what: 'Scenario average SD', value: (scA.sd + scB.sd) / 2 * 100, shown: 7.47 },
    { what: 'Scenario 50/50 returns', value: (0.5 * 0.2 + 0.5 * 0) * 100 + (0.5 * 0.1 + 0.5 * 0.12) * 100 + (0.5 * -0.05 + 0.5 * 0.1) * 100, shown: 10 + 11 + 2.5 },
    { what: 'Return given up 100→60', value: (st.market.mean - P60.er) * 100, shown: 2.45, tol: 0.006 },
    { what: 'Risk removed 100→60', value: (st.market.sd - P60.sd) * 100, shown: 5.75, tol: 0.006 },
    { what: 'Owen: mean gap', value: (PMH.er - st.market.mean) * 100, shown: 0.63 },
    { what: 'Owen: SD gap', value: (PMH.sd - st.market.sd) * 100, shown: 7.61, tol: 0.01 },
    { what: 'Owen: floor', value: Math.sqrt(avgCov) * 100, shown: 16.8, tol: 0.05 },
    { what: 'Owen: extra over floor', value: (PMH.sd - Math.sqrt(avgCov)) * 100, shown: 6.8, tol: 0.05 },
    { what: 'Deposit due April 2032', value: ANA.deposit.needed === 'April 2032' ? 1 : 0, shown: 1 },
    { what: 'Morrow & Pike is a company in the case', value: COMPANIES.morrow.name === 'Morrow & Pike Roasters' ? 1 : 0, shown: 1 },
  ],
};
