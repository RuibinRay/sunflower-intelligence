// Lesson: return, risk, beta and diversification.
// `checks` recompute every number printed in the worked example; tests/lessons.test.mjs compares them.
import * as F from '../../core/format.js?v=14';
import { portRet, portVar, maxSharpe } from '../../core/portfolio.js?v=14';

const covOf = (sa, sb, rho) => [[sa * sa, rho * sa * sb], [rho * sa * sb, sb * sb]];
const MU = [0.10, 0.06], COV = covOf(0.20, 0.12, 0.2), RF = 0.04;

export default {
  id: 'stocks',
  title: 'Return, risk and diversification',
  minutes: 7,
  hook: 'A share is judged by the return it earns for the risk it carries. Combining shares that don’t move together cuts risk faster than it cuts return.',
  idea: [
    'Risk here means how much returns swing: <b>volatility</b>, the standard deviation of returns, quoted per year (daily volatility × √252). The <b>Sharpe ratio</b> divides the return above the risk-free rate by volatility, so shares of different riskiness can be compared. The Sortino ratio does the same but counts only the downside swings.',
    '<b>Beta</b> is the slope of a share’s excess returns against the market’s: a beta of 1.5 means the share tends to move 1.5% when the market moves 1%. The intercept of that regression, <b>alpha</b>, is return the market doesn’t explain. Daily returns are noisy, so an alpha needs a low p-value before it means skill rather than luck.',
    'A portfolio’s return is the weighted average of its shares’ returns, but its volatility is not, because the shares’ bad days don’t all coincide. The lower the <b>correlation</b>, the more the swings cancel. The <b>efficient frontier</b> traces the best mixes, though the weights it suggests move a lot when the noisy average returns are re-estimated.',
  ],
  formula: {
    html: 'Sharpe = <span class="frac"><span>R − r<sub>f</sub></span><span>σ</span></span>,&ensp; σ<sub>P</sub><sup>2</sup> = w<sub>A</sub><sup>2</sup>σ<sub>A</sub><sup>2</sup> + w<sub>B</sub><sup>2</sup>σ<sub>B</sub><sup>2</sup> + 2 w<sub>A</sub>w<sub>B</sub> ρ σ<sub>A</sub>σ<sub>B</sub>',
    terms: [
      ['R', 'expected (or average) return per year'],
      ['r<sub>f</sub>', 'risk-free rate per year'],
      ['σ', 'volatility: the standard deviation of returns per year'],
      ['w', 'the share of the money in each holding; the weights add up to 1'],
      ['ρ', 'correlation between the two shares’ returns, from −1 to +1'],
    ],
  },
  example: {
    setup: 'Share A is expected to return 10% a year with 20% volatility; share B 6% with 12%. Their correlation is 0.2 and the risk-free rate is 4%. Is a 50:50 mix better than either?',
    steps: [
      'Sharpe ratios alone: A (10% − 4%) ÷ 20% = <b>0.30</b>; B (6% − 4%) ÷ 12% = <b>0.17</b>.',
      'The mix returns 0.5 × 10% + 0.5 × 6% = <b>8%</b>.',
      'Its variance is 0.25 × 0.20² + 0.25 × 0.12² + 2 × 0.25 × 0.2 × 0.20 × 0.12 = 0.0100 + 0.0036 + 0.0024 = 0.0160, so its volatility is √0.0160 = <b>12.6%</b>.',
      'Its Sharpe ratio is (8% − 4%) ÷ 12.6% = <b>0.32</b>.',
    ],
    result: 'The mix beats both shares on return per unit of risk. Its volatility, 12.6%, is barely above B’s alone and well below the 16% average of the two: that gap is the gain from diversification.',
  },
  mistake: {
    title: 'Averaging the volatilities',
    html: 'Taking 0.5 × 20% + 0.5 × 12% = 16% as the mix’s risk assumes the shares always move together (a correlation of 1). It understates the Sharpe ratio, 4% ÷ 16% = 0.25 instead of 0.32, and hides the reason to diversify.',
  },
  remember: [
    'Sharpe ratio = (return − risk-free rate) ÷ volatility. Forgetting to subtract the risk-free rate flatters every share.',
    'Beta scales the market’s move: beta 1.5 and a 2% market day means about 3%. Alpha needs a small p-value to mean anything.',
    'Portfolio return averages; portfolio risk doesn’t. Low correlation is what makes diversification pay.',
  ],
  calc: {
    title: 'Mix two shares',
    intro: 'Shares A and B from the example: 10% return and 20% volatility, against 6% and 12%.',
    inputs: [
      { id: 'w', label: 'Money in share A', min: 0, max: 100, step: 5, value: 50, fmt: 'pct' },
      { id: 'rho', label: 'Correlation between A and B', min: -1, max: 1, step: 0.1, value: 0.2, fmt: 'num', digits: 1 },
      { id: 'rf', label: 'Risk-free rate', min: 0, max: 6, step: 0.25, value: 4, fmt: 'pct' },
    ],
    compute({ w, rho, rf }) {
      const wt = [w / 100, 1 - w / 100], cov = covOf(0.20, 0.12, rho), r0 = rf / 100;
      const ret = portRet(wt, MU), vol = Math.sqrt(Math.max(0, portVar(wt, cov)));
      const sharpe = vol > 1e-9 ? (ret - r0) / vol : NaN;
      const single = Math.max((MU[0] - r0) / 0.20, (MU[1] - r0) / 0.12);
      const best = maxSharpe(MU, cov, r0);
      const avgVol = wt[0] * 0.20 + wt[1] * 0.12;
      return {
        headline: { value: Number.isFinite(sharpe) ? F.num(sharpe, 2) : 'no risk', label: 'Sharpe ratio of the mix' },
        rows: [['Expected return', F.pct(ret, 1)], ['Volatility', F.pct(vol, 1)], ['Risk saved against the average volatility', `${F.num((avgVol - vol) * 100, 1)} points`], ['Best Sharpe ratio of either share alone', F.num(single, 2)]],
        note: rho <= -0.999
          ? 'With a correlation of exactly −1, 37.5% in A cancels every swing and still earns 7.5%: risk-free money above the risk-free rate, which a real market would not leave lying around. Real correlations are never quite −1.'
          : best
            ? `${sharpe > single + 0.005 ? 'This mix beats both shares on return per unit of risk.' : 'This mix does no better than the best single share.'} The best mix here puts about ${F.pct(best[0], 0)} in A.`
            : 'Neither share beats the risk-free rate, so no mix earns a positive Sharpe ratio.',
      };
    },
  },
  tool: { href: 'finance/stocks/#returns', label: 'Return and risk, in Finance › Stock analysis' },
  checks: (() => {
    const wt = [0.5, 0.5], ret = portRet(wt, MU), v = portVar(wt, COV), vol = Math.sqrt(v);
    return [
      { what: 'Sharpe A', value: (MU[0] - RF) / 0.20, shown: 0.30, tol: 0.005 }, { what: 'Sharpe B', value: (MU[1] - RF) / 0.12, shown: 0.17, tol: 0.005 },
      { what: 'mix return', value: ret * 100, shown: 8, tol: 1e-9 },
      { what: 'A term', value: 0.25 * 0.04, shown: 0.0100, tol: 1e-9 }, { what: 'B term', value: 0.25 * 0.0144, shown: 0.0036, tol: 1e-9 },
      { what: 'covariance term', value: 2 * 0.25 * COV[0][1], shown: 0.0024, tol: 1e-9 },
      { what: 'variance', value: v, shown: 0.0160, tol: 1e-9 }, { what: 'volatility', value: vol * 100, shown: 12.6, tol: 0.05 },
      { what: 'mix Sharpe', value: (ret - RF) / vol, shown: 0.32, tol: 0.005 },
      { what: 'average volatility', value: 100 * (0.5 * 0.20 + 0.5 * 0.12), shown: 16, tol: 1e-9 },
      { what: 'mistake Sharpe', value: (ret - RF) / 0.16, shown: 0.25, tol: 1e-9 },
      { what: 'beta 1.5 × 2%', value: 1.5 * 2, shown: 3, tol: 1e-9 },
    ];
  })(),
};
