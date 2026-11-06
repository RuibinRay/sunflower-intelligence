// logistic-regression.js — B06 · Logistic regression. Content only; exercises are in logistic-regression.ex.js.
// Uses the 225 loyalty-app members who joined in October 2027 (case.js `member`) and whether each came back within
// 30 days. Observational: members chose notifications themselves. The project's quotes are not used. Every figure
// printed is recomputed in `checks`.
import { member, DERIVED as D } from './case.js?v=26';
import * as R from '../../../core/regression.js?v=26';
import { confusion } from '../../../core/classify.js?v=26';
import { mean } from '../../../core/stats.js?v=26';

const y = member('returned'), near = member('near'), notif = member('notifications'), ticket = member('first_ticket');
const mill = member('millbrook'), wkend = member('weekend');
const M = D.returnModel;
const c = (name) => M.coefs.find((k) => k.name === name);
const n = y.length, nRet = y.reduce((s, v) => s + v, 0), base = nRet / n;
const LPM = R.fit(y, { Near: near, Notifications: notif, 'First ticket ($)': ticket, Millbrook: mill, Weekend: wkend });
const lpmFit = Array.from(LPM.fitted);
const ONE = R.logistic(y, { 'First ticket ($)': ticket });
const NO_NOTIF = R.logistic(y, { Near: near, 'First ticket ($)': ticket, Millbrook: mill, Weekend: wkend });
const lrNotif = R.lrTest(M, NO_NOTIF);
const p = (v) => M.predictCI(v);
const hi = p([1, 1, 6, 1, 0]), lo = p([0, 0, 5, 0, 1]);
const hFar0 = p([0, 0, 5, 0, 0]).p, hFar1 = p([0, 1, 5, 0, 0]).p, mFar0 = p([0, 0, 5, 1, 0]).p, mFar1 = p([0, 1, 5, 1, 0]).p;
const top0 = p([1, 0, 8, 1, 0]).p, top1 = p([1, 1, 8, 1, 0]).p;
const T5 = confusion(y, M.prob, 0.5), T4 = confusion(y, M.prob, 0.4), T6 = confusion(y, M.prob, 0.6);
const tkH = mean(ticket.filter((_, i) => !mill[i])), tkM = mean(ticket.filter((_, i) => mill[i]));
const retH = mean(y.filter((_, i) => !mill[i])), retM = mean(y.filter((_, i) => mill[i]));
const retN = mean(y.filter((_, i) => notif[i])), retNo = mean(y.filter((_, i) => !notif[i]));
const sig = (e) => 1 / (1 + Math.exp(-e));
const etaEx = c('Intercept').estimate + c('Near').estimate * 0 + c('Notifications').estimate * 1 + c('First ticket ($)').estimate * 4.5 + c('Millbrook').estimate * 1 + c('Weekend').estimate * 0;

// ---------------------------------------------------------------- figure: a line against the logistic curve (fictional shape)
const f1 = (x) => Math.round(x * 10) / 10;
function curveFigure() {
  const x0 = 60, x1 = 420, y0 = 270, y1 = 40;
  const X = (v) => x0 + v / 10 * (x1 - x0), Y = (v) => y0 - (v + 0.2) / 1.4 * (y0 - y1);
  let svg = '<svg viewBox="0 0 440 360" xmlns="http://www.w3.org/2000/svg" font-size="16" fill="currentColor">';
  svg += `<line x1="${x0}" x2="${x1}" y1="${f1(Y(0))}" y2="${f1(Y(0))}" stroke="var(--rule-strong)" stroke-dasharray="4 3"/><line x1="${x0}" x2="${x1}" y1="${f1(Y(1))}" y2="${f1(Y(1))}" stroke="var(--rule-strong)" stroke-dasharray="4 3"/>`;
  svg += `<line x1="${x0}" x2="${x0}" y1="${y1 - 10}" y2="${y0}" stroke="var(--ink-3)"/><line x1="${x0}" x2="${x1}" y1="${y0}" y2="${y0}" stroke="var(--ink-3)"/>`;
  [0, 0.5, 1].forEach((v) => { svg += `<text x="${x0 - 8}" y="${f1(Y(v)) + 5}" text-anchor="end" font-size="15" fill="var(--ink-3)">${v}</text>`; });
  svg += `<text x="${(x0 + x1) / 2}" y="${y0 + 24}" text-anchor="middle" font-size="15">x (for example, first ticket)</text>`;
  svg += `<text x="18" y="${(y0 + y1) / 2}" text-anchor="middle" font-size="15" transform="rotate(-90 18 ${(y0 + y1) / 2})">Probability of yes</text>`;
  let dl = '', dc = '';
  for (let v = 0; v <= 10.001; v += 0.25) { dl += `${dl ? 'L' : 'M'}${f1(X(v))},${f1(Y(-0.15 + 0.13 * v))}`; dc += `${dc ? 'L' : 'M'}${f1(X(v))},${f1(Y(sig(-4 + 0.8 * v)))}`; }
  svg += `<path d="${dl}" fill="none" stroke="var(--series-2)" stroke-width="2.6" stroke-dasharray="7 5"/><path d="${dc}" fill="none" stroke="var(--series-1)" stroke-width="2.8"/>`;
  svg += `<line x1="70" x2="100" y1="322" y2="322" stroke="var(--series-2)" stroke-width="2.6" stroke-dasharray="7 5"/><text x="106" y="327" font-size="15">straight line</text>`;
  svg += `<line x1="235" x2="265" y1="322" y2="322" stroke="var(--series-1)" stroke-width="2.8"/><text x="271" y="327" font-size="15">logistic curve</text>`;
  return `${svg}</svg>`;
}

export default {
  slug: 'logistic-regression',
  title: 'Logistic regression',
  blurb: 'When the outcome is yes or no, a straight line predicts impossible probabilities. Model the log-odds instead: fit and read a logistic regression, turn its coefficients into odds ratios and probabilities, test them, and judge a classification against the base rate.',
  status: 'reviewed',
  objectives: [
    'Explain why a straight-line model is unsuitable for a yes/no outcome, and convert between probability, odds and log-odds.',
    'Interpret logistic regression coefficients as changes in log-odds and as odds ratios, holding the other predictors fixed.',
    'Calculate a predicted probability from fitted coefficients, in a worksheet and by hand.',
    'Test coefficients with the Wald z test and nested models with the likelihood-ratio test.',
    'Evaluate a classification at a chosen threshold against the base rate, with sensitivity and specificity.',
    'State what an odds ratio from observational data can and can’t say about the effect of an action.',
  ],
  prerequisites: [
    { lesson: 'b06/multiple-regression', why: 'Several predictors, each slope with the others held fixed.' },
    { lesson: 'b06/categorical-predictors-and-interactions', why: 'Dummy variables and reference levels, used here for the café, the weekend and notifications.' },
    { lesson: 'b06/transformations-and-influence', why: 'Logs and exponentials, and reading a coefficient on a log scale as a multiplication.' },
    { lesson: 'b04/probability', why: 'Probability, the base rate and the complement rule.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'In October 2027, 225 people joined Lantern’s loyalty app at the two cafés, and 121 of them came back within 30 days. Ana wants to know who comes back: members who live or work nearby, members who turn on the app’s notifications, members whose first purchase was larger, members who joined at Millbrook or at a weekend. She also wants a way to pick out, soon after they join, the members least likely to return, so the cafés can try to win them back.' },

    { h: 'A yes/no outcome' },
    { p: 'Whether a member returned is a binary outcome: 1 for yes, 0 for no. Its average is the share who returned, 121 ÷ 225 = 53.8%, the <g>base rate</g>. What Ana wants to model is the probability of a 1 for members with given characteristics.' },
    { p: 'An ordinary regression of the 0/1 outcome on the five predictors, a linear probability model, is easy to fit and easy to read: each slope is a change in the probability. It also fails in two ways. Its fitted “probabilities” run from 0.118 to 1.025, and one member (a Millbrook member with notifications on and an $8.50 first ticket) gets a value above 1, which no probability can be. And its slopes are the same everywhere: a dollar more on the first ticket adds 0.09 to the probability whether a member’s chance was 0.2 or 0.95. Real probabilities can’t keep rising by the same step; near 0 and 1 they have to flatten.' },
    { figure: {
      svg: curveFigure(),
      caption: 'A straight line through yes/no data runs below 0 and above 1; the logistic curve stays between them and flattens at both ends (schematic).',
      alt: 'A chart with the probability of yes from about −0.2 to 1.2 on the vertical axis and x on the horizontal axis, with dashed reference lines at 0 and 1. A dashed straight line rises steadily from below 0 at the left to above 1 at the right. A solid S-shaped curve starts near 0 at the left, rises steeply in the middle and levels off near 1 at the right, never crossing either reference line.',
    } },

    { h: 'Odds and log-odds' },
    { p: String.raw`Logistic regression models the probability through two changes of scale. The <g>odds</g> of an event are its probability divided by the probability that it doesn’t happen, <m>p/(1 - p)</m>: the odds of returning are 121 ÷ 104 = 1.16, “about 7 to 6 on”. Odds run from 0 to infinity. Their natural log, the <g>log-odds</g> or logit, runs from minus to plus infinity, with 0 for a probability of one half; here <m>\ln 1.16 = 0.15</m>. A quantity that can take any value is one a linear model can fit without predicting the impossible.` },
    { p: String.raw`So the model is <m>\ln\big(p/(1-p)\big) = \beta_0 + \beta_1 x_1 + \dots + \beta_k x_k</m>, and to get back to a probability you invert the two steps: <m>p = 1 / (1 + e^{-(\beta_0 + \beta_1 x_1 + \dots)})</m>, the logistic curve. However large or small the right-hand side, p stays between 0 and 1, and it changes fastest when p is near one half.` },

    { h: 'Ana’s model' },
    { table: {
      caption: 'Logistic regression of returning within 30 days (225 October joiners)',
      head: ['Term', 'Coefficient', 'SE', 'z', 'p-value', 'Odds ratio (95% CI)'],
      rows: [
        ['Intercept', '−2.842', '0.845', '−3.36', '0.001', ''],
        ['Lives or works within a mile', '0.339', '0.297', '1.14', '0.253', '1.40 (0.78 to 2.51)'],
        ['Notifications on', '0.926', '0.291', '3.18', '0.001', '2.52 (1.43 to 4.47)'],
        ['First ticket (per $)', '0.401', '0.127', '3.15', '0.002', '1.49 (1.16 to 1.92)'],
        ['Joined at Millbrook', '0.847', '0.388', '2.18', '0.029', '2.33 (1.09 to 4.98)'],
        ['Joined at a weekend', '−0.489', '0.327', '−1.50', '0.135', '0.61 (0.32 to 1.16)'],
      ],
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      note: 'Likelihood-ratio test against the model with no predictors: 23.3 on 5 df, p below 0.001. McFadden’s pseudo-R²: 0.075.',
    } },
    { p: String.raw`Each coefficient is a change in log-odds for a one-unit change in its predictor, holding the others fixed. That is hard to picture, so exponentiate it: <m>e^{b}</m> is the <g>odds ratio</g>, the factor by which the odds are multiplied. Members with notifications on had <m>e^{0.926} = 2.52</m> times the odds of returning of otherwise similar members with them off. Each extra dollar on the first ticket multiplied the odds by 1.49. Members who joined at Millbrook had 2.33 times the odds of those who joined at Harbourside with the same ticket, notifications and the rest.` },
    { p: 'An odds ratio is not a ratio of probabilities, and its effect on the probability depends on where you start. For a Harbourside member who lives further away, joined on a weekday with a $5 first ticket, turning notifications on in the model takes the predicted probability from 0.30 to 0.52, 22 points. For a nearby Millbrook member with an $8 ticket it takes it from 0.83 to 0.92, 10 points, with the same odds ratio of 2.52. Report odds ratios for the model and probabilities for the people.' },

    { h: 'Notifications: an association, not an effect' },
    { p: 'Members chose whether to turn notifications on. Those who did may be keener on the café in the first place, and keenness, not the notifications, could be why they came back. Raw, 62% of members with notifications on returned, against 43% with them off. The log can’t separate keenness from the notifications, so the odds ratio of 2.52 says that members with notifications on returned more, holding the other four predictors fixed. It does not say that switching a member’s notifications on would multiply their odds by 2.52. To learn that, Ana would need to turn notifications on for a random half of new members and compare.' },
  ],

  theory: [
    { h: 'Fitting by maximum likelihood' },
    { p: String.raw`There are no residuals to square: each member either returned or didn’t. Instead, for any set of coefficients the model gives every member a probability, and the <g>likelihood</g> is the probability the model assigns to what actually happened: <m>\prod p_i^{y_i}(1 - p_i)^{1 - y_i}</m>, p for each member who returned and 1 − p for each who didn’t. Maximum likelihood chooses the coefficients that make this as large as possible, or equivalently its log, <m>\ell = \sum [y_i \ln p_i + (1 - y_i)\ln(1 - p_i)]</m>. There is no formula; software searches iteratively (iteratively reweighted least squares) until the coefficients stop changing. Ana’s model reaches <m>\ell = -143.67</m>; a model with only an intercept, which gives every member the base rate, has <m>\ell_0 = -155.32</m>.` },

    { h: 'Testing a coefficient: the Wald z' },
    { p: 'Each coefficient comes with a standard error, and z = b ÷ SE is compared with the standard normal distribution (not t: the theory is large-sample). For notifications, z = 0.926 ÷ 0.291 = 3.18, p = 0.001. The 95% interval for the coefficient is b ± 1.96 SE, and exponentiating its ends gives the odds ratio’s interval, 1.43 to 4.47; it is not symmetric about 2.52.' },
    { p: String.raw`The coefficient for living nearby, 0.339, has p = 0.25 and an odds ratio interval from 0.78 to 2.51. That is not evidence that distance doesn’t matter: the fictional data were in fact built with a log-odds effect of 0.9 for living nearby (an odds ratio of 2.46), inside the interval. With 225 members the estimate is too imprecise to tell an odds ratio of 1 from one of 2.5. A non-significant coefficient means the data can’t pin it down.` },

    { h: 'Testing models: the likelihood-ratio test' },
    { p: String.raw`To compare a model with a simpler one nested inside it, use twice the gain in log-likelihood: <m>G = 2(\ell_{\text{full}} - \ell_{\text{reduced}})</m>, compared with a chi-square distribution whose degrees of freedom are the number of coefficients dropped. Against the intercept-only model, <m>G = 2(-143.67 + 155.32) = 23.3</m> on 5 df, p below 0.001: the five predictors together say something. Dropping notifications alone gives G = 10.46 on 1 df, p = 0.001, close to the Wald test’s verdict. When the two disagree, prefer the likelihood-ratio test, which behaves better when coefficients are large or samples small. It is the logistic counterpart of the <g>nested F test</g>.` },
    { p: String.raw`<b>McFadden’s pseudo-R²</b>, <m>1 - \ell/\ell_0</m>, is 0.075 here. It is not a share of variance, and values that look small are usual for individual yes/no outcomes; it is most useful for comparing models fitted to the same data.` },

    { h: 'Confounding shows up here too' },
    { p: 'Fitted on its own, the first ticket has an odds ratio of 1.21 per dollar (p = 0.049); with the café and the other predictors held fixed it is 1.49. Millbrook members spend less on a first visit ($4.23 on average, against $6.03 at Harbourside) yet returned more often (55% against 51%). Pooled, the low-spending, often-returning Millbrook members dilute the link between spending and returning. This is the same omitted-variable logic as in least squares.' },

    { h: 'From probabilities to decisions: a threshold' },
    { p: 'To classify members as likely or unlikely to return, choose a threshold: predict “returns” when the fitted probability is at least that value. Each choice gives a classification table of four counts: true positives (predicted to return and did), false positives, true negatives and false negatives.' },
    { table: {
      caption: 'Classification of the 225 October joiners at three thresholds (the model’s own data)',
      head: ['Threshold', 'Accuracy', 'Sensitivity', 'Specificity', 'Predicted to return'],
      rows: [
        ['0.4', '61.8%', '86.0%', '33.7%', '173'],
        ['0.5', '63.6%', '72.7%', '52.9%', '137'],
        ['0.6', '60.4%', '49.6%', '73.1%', '88'],
      ],
      align: ['l', 'r', 'r', 'r', 'r'],
      note: 'Sensitivity: the share of those who returned that the model flags. Specificity: the share of those who didn’t that it clears.',
    } },
    { p: '<g>Classification accuracy</g> needs a benchmark. Predicting that every member returns is right 53.8% of the time, the base rate, without any model. At a threshold of 0.5 the model is right 63.6% of the time: better, but by 10 points, not 64. Raising the threshold trades <g>sensitivity</g> (catching those who return) for <g>specificity</g> (correctly clearing those who don’t), and the right balance depends on what each kind of error costs, not on maximising accuracy.' },
    { callout: 'warn', title: 'In-sample tables flatter the model', html: 'These tables score the model on the same 225 members it was fitted to, so they overstate how well it would classify November’s joiners. A fair estimate comes from members not used in fitting: a hold-out month, or cross-validation (B08, Machine Learning for Business, covers both).' },

    { h: 'Assumptions and cautions' },
    { list: [
      '<b>Linearity in the log-odds.</b> Each numerical predictor’s effect on the log-odds is a straight line. Check by banding the predictor and comparing the observed log-odds in each band with the model’s, or by adding a squared term or a hinge as in the previous lesson.',
      '<b>Independent cases.</b> Each member is one row. Members who joined together, or repeated rows for the same person, break this, as they would in least squares.',
      '<b>Enough of each outcome.</b> Coefficients become unstable when a predictor almost perfectly separates the 0s from the 1s, or when there are few events per predictor; a common rule of thumb asks for at least 10 of the rarer outcome per predictor (here 104 non-returners for 5 predictors, about 21 each). It is a convention, not a law.',
      '<b>No error variance to check.</b> The variance of a 0/1 outcome is set by its probability, p(1 − p), so there is no σ, no residual standard error and no equal-variance condition.',
    ] },
  ],

  formulas: [
    { id: 'b06-odds', name: 'Odds and log-odds',
      tex: String.raw`\text{odds} = \dfrac{p}{1 - p}, \qquad \operatorname{logit}(p) = \ln\dfrac{p}{1 - p}, \qquad p = \dfrac{\text{odds}}{1 + \text{odds}}`,
      where: [[String.raw`p`, 'Probability of the event', ''], [String.raw`\text{odds}`, 'Odds of the event, from 0 to infinity', ''], [String.raw`\operatorname{logit}(p)`, 'Log-odds, from minus to plus infinity', '']],
      note: 'In Excel: <x>=B2/(1-B2)</x> for the odds, <x>=LN(B2/(1-B2))</x> for the log-odds.' },
    { id: 'b06-logistic-model', name: 'The logistic regression model',
      tex: String.raw`\ln\dfrac{p}{1 - p} = \beta_0 + \beta_1 x_1 + \dots + \beta_k x_k, \qquad p = \dfrac{1}{1 + e^{-(\beta_0 + \beta_1 x_1 + \dots + \beta_k x_k)}}`,
      where: [[String.raw`p`, 'Probability that y = 1 for a case with these predictor values', ''], [String.raw`\beta_0`, 'Intercept: the log-odds when every predictor is 0', ''], [String.raw`\beta_j`, 'Change in log-odds for a one-unit rise in xⱼ, holding the others fixed', 'per unit of xⱼ'], [String.raw`x_j`, 'Predictor j', 'its own units'], [String.raw`k`, 'Number of predictors', '']],
      assumptions: 'Independent cases; each predictor’s effect is linear on the log-odds scale.',
      note: 'Predicted probability in Excel: <x>=1/(1+EXP(-(b0+b1*x1+b2*x2)))</x>.' },
    { id: 'b06-odds-ratio', name: 'Odds ratio and its interval',
      tex: String.raw`\text{OR} = e^{b}, \qquad e^{\,b \pm 1.96\,\text{SE}(b)}`,
      where: [[String.raw`b`, 'A fitted coefficient', 'log-odds per unit of x'], [String.raw`\text{SE}(b)`, 'Its standard error', 'log-odds per unit of x'], [String.raw`\text{OR}`, 'Factor by which the odds are multiplied for a one-unit rise in x', '']],
      note: 'For a change of d units the odds ratio is e^(d·b). An OR of 1 means no association.' },
    { id: 'b06-wald-z', name: 'Wald test of a coefficient',
      tex: String.raw`z = \dfrac{b}{\text{SE}(b)}`,
      where: [[String.raw`b`, 'A fitted coefficient', 'log-odds per unit of x'], [String.raw`\text{SE}(b)`, 'Its standard error', 'log-odds per unit of x'], [String.raw`z`, 'Compared with the standard normal distribution', '']],
      note: 'Two-sided p-value: <x>=2*(1-NORM.S.DIST(ABS(z),TRUE))</x>.' },
    { id: 'b06-lr-test', name: 'Likelihood-ratio test',
      tex: String.raw`G = 2\,(\ell_{\text{full}} - \ell_{\text{reduced}}), \qquad \text{df} = p_{\text{full}} - p_{\text{reduced}}`,
      where: [[String.raw`\ell`, 'Maximised log-likelihood of each model', ''], [String.raw`p`, 'Number of coefficients in each model, counting the intercept', ''], [String.raw`G`, 'Test statistic, compared with the chi-square distribution on df degrees of freedom', '']],
      assumptions: 'The reduced model is nested in the full one and both are fitted to the same rows.',
      note: 'p-value: <x>=CHISQ.DIST.RT(G,df)</x>. McFadden’s pseudo-R² is 1 − ℓ ÷ ℓ₀, with ℓ₀ the intercept-only model’s.' },
    { id: 'b06-classification', name: 'Classification measures at a threshold',
      tex: String.raw`\text{accuracy} = \dfrac{TP + TN}{n}, \quad \text{sensitivity} = \dfrac{TP}{TP + FN}, \quad \text{specificity} = \dfrac{TN}{TN + FP}`,
      where: [[String.raw`TP, FN`, 'Cases with y = 1 predicted 1 (true positives) and predicted 0 (false negatives)', ''], [String.raw`TN, FP`, 'Cases with y = 0 predicted 0 (true negatives) and predicted 1 (false positives)', ''], [String.raw`n`, 'Number of cases', '']],
      note: 'Compare accuracy with the base rate of the commoner outcome, what always guessing it would score.' },
  ],

  examples: [
    { level: 'simple', title: 'From coefficients to a probability', fictional: true,
      setup: 'Using Ana’s fitted model, find the predicted probability that a Millbrook member who doesn’t live nearby, joined on a weekday, turned notifications on and spent $4.50 on their first visit returns within 30 days.',
      steps: [
        String.raw`Log-odds: <m>-2.842 + 0.339(0) + 0.926(1) + 0.401(4.50) + 0.847(1) - 0.489(0) = 0.736</m>, using the unrounded coefficients.`,
        String.raw`Odds: <m>e^{0.736} = 2.09</m>.`,
        String.raw`Probability: <m>2.09 / (1 + 2.09) = 0.676</m>, the same as <m>1/(1 + e^{-0.736})</m>.`,
      ],
      answer: 'About 0.68: roughly two chances in three of returning within 30 days.',
      interpretation: 'Each step undoes one change of scale: the model adds up log-odds, the exponential turns them into odds, and odds ÷ (1 + odds) turns them into a probability. The same member with notifications off would have log-odds 0.736 − 0.926 = −0.190 and a probability of 0.45.' },

    { level: 'challenging', title: 'Testing notifications two ways, and what the result means', fictional: true,
      setup: 'Is the association between notifications and returning statistically clear once the other four predictors are held fixed? Use the Wald test and the likelihood-ratio test (the model without notifications has ℓ = −148.90), give the odds ratio with its interval, and translate it into probabilities for a typical member.',
      steps: [
        'Wald: z = 0.926 ÷ 0.291 = 3.18; p = 2 × (1 − Φ(3.18)) = 0.0015.',
        String.raw`Likelihood ratio: <m>G = 2(-143.67 - (-148.90)) = 10.46</m> on 1 df; <x>=CHISQ.DIST.RT(10.46,1)</x> = 0.0012. The two tests agree.`,
        String.raw`Odds ratio: <m>e^{0.926} = 2.52</m>; interval <m>e^{0.926 \pm 1.96 \times 0.291}</m> = 1.43 to 4.47.`,
        'Probabilities: for a Harbourside member further away, joining on a weekday with a $5 ticket, the predicted probability is 0.30 with notifications off and 0.52 with them on; for the same member at Millbrook, 0.50 and 0.72.',
      ],
      answer: 'Yes: z = 3.18 (p = 0.0015) and G = 10.46 (p = 0.0012). Odds ratio 2.52 (95% CI 1.43 to 4.47); about 22 points of probability for a member starting near 0.3 or 0.5.',
      interpretation: 'The association is clear and large. What it isn’t is a measured effect of switching notifications on: members chose the setting, and whatever made them choose it may also make them return. The finding is a reason to test, by turning notifications on by default for a random half of November’s joiners, not a forecast of what doing so would achieve.' },

    { level: 'applied', title: 'Choosing whom to win back', fictional: true,
      setup: 'Ana wants the cafés’ staff to greet, by name, new members the model flags as unlikely to return, starting with those whose predicted probability is below a threshold. A threshold of 0.4 flags 52 of the 225 October joiners. How good is that list, compared with picking members at random?',
      steps: [
        'Among the 52 members with predicted probability below 0.4, 35 did not return: 67%.',
        'Among all 225, 104 did not return: 46%, the share a random list of 52 would catch on average (about 24 members).',
        'So the list is about 1.5 times as rich in non-returners as a random one. It still misses most of them: 104 − 35 = 69 non-returners had predicted probabilities of 0.4 or more.',
        'Raising the threshold to 0.5 flags 88 members, of whom 55 (63%) did not return: more non-returners caught, a less concentrated list.',
      ],
      answer: 'At 0.4 the list has 52 members, 67% of them non-returners against 46% at random; at 0.5, 88 members, 63% non-returners.',
      interpretation: 'The model ranks members usefully but not sharply: a McFadden R² of 0.075 is typical of models of individual choices. Which threshold to use depends on how many members the staff can greet well, not on accuracy. And these figures are on the model’s own data; Ana should check them on November’s joiners before relying on them.' },
  ],

  demo: [
    { widget: 'logit-curve', intro: 'Set an intercept and a slope and see the logistic curve they define, with the probability, odds and log-odds at the x you choose. Make the slope negative, then larger: the curve steepens but never leaves 0 to 1.' },
    { widget: 'logit-members', intro: 'Ana’s model of returning. The curve shows the predicted probability against the first ticket, with the other predictors held at the values you set: switch notifications on and off, or move a member to Millbrook, and watch the whole curve shift. Then move the threshold and read the classification table against always guessing “returns”.' },
  ],

  mistakes: [
    { title: 'Fitting a straight line to a 0/1 outcome', html: 'A linear probability model can predict probabilities below 0 or above 1 (one October member gets 1.025) and assumes each predictor moves the probability by the same amount everywhere. Use logistic regression; if a linear model is used for a quick look, check its fitted range.' },
    { title: 'Reading an odds ratio as a ratio of probabilities', html: 'An odds ratio of 2.52 does not mean “2.52 times as likely”. With a starting probability of 0.30 it gives 0.52, 1.7 times as likely; with 0.83 it gives 0.92. Convert to probabilities for a stated kind of member.' },
    { title: 'Reading the coefficient as a change in probability', html: 'b is a change in log-odds. 0.926 for notifications is not 92.6 percentage points, nor 0.926 of anything a manager would recognise. Exponentiate it for the odds ratio, or work through the probabilities.' },
    { title: 'Judging the model by its accuracy alone', html: '63.6% sounds modest and 90% would sound good, but neither means anything without the base rate. With 53.8% of members returning, always guessing “returns” scores 53.8%. Compare with that, and look at sensitivity and specificity.' },
    { title: '“Notifications double the odds of returning, so turn them on for everyone.”', html: 'Members chose notifications themselves, so the odds ratio describes members who chose them, holding four other things fixed. It is not the effect of switching them on. Randomise to find that.' },
    { title: 'Treating a non-significant odds ratio as “no effect”', html: 'Living nearby has p = 0.25, but its interval runs from 0.78 to 2.51. With 225 members the data can’t distinguish no association from a strong one.' },
  ],

  application: [
    { case: 'Ana’s note to the café managers: “Of October’s 225 new members, 121 (54%) came back within 30 days. Holding the café, distance, first ticket and weekend fixed, members with notifications on had 2.5 times the odds of returning (95% CI 1.4 to 4.5), and each extra dollar on the first visit went with 1.5 times the odds. These are associations: members chose notifications, so we don’t yet know whether turning them on would help. In November, new members at both cafés will be offered notifications on by default on alternate days, so we can measure it. Meanwhile, staff will greet by name the members the model gives under a 40% chance of returning.”' },
    { p: 'Logistic regression is one of the most used models in business analytics because so many business outcomes are yes or no: a customer renews or cancels, an applicant repays or defaults, a visitor buys or leaves, an invoice is paid on time or late. In each case the work splits as Ana’s did. One use is explanation, which predictors go with the outcome and by how much, reported as odds ratios with intervals and translated into probabilities for recognisable kinds of customer. The other is ranking: a predicted probability for every customer, a threshold, and a list.' },
    { p: 'The two uses need different checks. For explanation, the questions are those of every observational regression: what was left out, what was chosen by the customers themselves, which comparisons are fair. For ranking, the questions are about new data: does the model rank next month’s customers as well as it ranked the ones it was fitted to, and is the list better than the simple rule it replaces? A model can be good for one use and poor for the other, and saying which is part of reporting it.' },
    { p: 'The most valuable step in Ana’s note is the last but one. An observational odds ratio cannot settle whether an action works, but it can point to the action worth testing, and a small randomised trial then answers the question directly. Turning a model’s association into a test is often worth more than refining the model.' },
  ],

  summary: [
    'For a yes/no outcome, model the log-odds, ln(p ÷ (1 − p)), as a linear function of the predictors; the probability, 1 ÷ (1 + e^(−linear part)), then stays between 0 and 1. A straight line doesn’t (one October member gets 1.025).',
    'A coefficient is a change in log-odds per unit of x, holding the others fixed; e^b is the odds ratio (notifications: 2.52, 95% CI 1.43 to 4.47). Its effect on the probability depends on the starting probability.',
    'The model is fitted by maximum likelihood. Test a coefficient with the Wald z = b ÷ SE, and nested models with the likelihood-ratio G = 2(ℓ_full − ℓ_reduced) on a chi-square distribution (all five predictors: G = 23.3 on 5 df).',
    'A non-significant coefficient with a wide interval means the data can’t pin the effect down, not that it is zero.',
    'Classify with a threshold and judge the table against the base rate (63.6% accuracy at 0.5 against 53.8% for always guessing “returns”); choose the threshold from what each error costs, and check on new data.',
    'From observational data an odds ratio is an association: notifications were self-selected, so randomise to learn the effect of turning them on.',
  ],

  glossary: [
    { term: 'Odds', def: 'The probability that an event happens divided by the probability that it doesn’t, p ÷ (1 − p); odds of 3 mean the event is three times as likely to happen as not.' },
    { term: 'Log-odds', def: 'The natural logarithm of the odds, ln(p ÷ (1 − p)), also called the logit. It is 0 when p = 0.5 and can take any value, which is why logistic regression models it as a linear function of the predictors.' },
    { term: 'Odds ratio', def: 'The factor by which the odds of an outcome are multiplied between two groups, or for a one-unit rise in a predictor; in logistic regression, e raised to the coefficient. An odds ratio of 1 means no association.' },
    { term: 'Likelihood', def: 'The probability a model with given parameter values assigns to the data actually observed. Maximum likelihood estimation chooses the values that make it largest.' },
    { term: 'Classification accuracy', def: 'The share of cases a classification rule gets right: true positives plus true negatives over all cases. It should be compared with the base rate of the commoner outcome.' },
    { term: 'Sensitivity', def: 'The share of actual positive cases that a classification rule flags as positive, TP ÷ (TP + FN); also called recall or the true positive rate.' },
    { term: 'Specificity', def: 'The share of actual negative cases that a classification rule correctly classes as negative, TN ÷ (TN + FP).' },
  ],

  references: [
    { text: 'Penn State Eberly College of Science. <i>STAT 462: Applied Regression Analysis</i>, notes on binary logistic regression (the model, likelihood, Wald and likelihood-ratio tests, odds ratios).', url: 'https://online.stat.psu.edu/stat462/node/207/', checked: '2026-11-01' },
    { text: 'Penn State Eberly College of Science. <i>STAT 501: Regression Methods</i>, 15.3, “Further Logistic Regression Examples”.', url: 'https://online.stat.psu.edu/stat501/book/export/html/1015', checked: '2026-11-01' },
    { text: 'Microsoft Support. “LN function”.', url: 'https://support.microsoft.com/en-us/Excel/functions/ln-function', checked: '2026-11-01' },
  ],

  checks: [
    { what: 'Members', value: n, shown: 225 },
    { what: 'Returned', value: nRet, shown: 121 },
    { what: 'Did not return', value: n - nRet, shown: 104 },
    { what: 'Base rate %', value: base * 100, shown: 53.8, tol: 0.05 },
    { what: 'LPM fitted min', value: Math.min(...lpmFit), shown: 0.118, tol: 0.0005 },
    { what: 'LPM fitted max', value: Math.max(...lpmFit), shown: 1.025, tol: 0.0005 },
    { what: 'One member above 1', value: lpmFit.filter((v) => v > 1).length, shown: 1 },
    { what: 'That member: Millbrook, notifications on, $8.50', value: Number((() => { const i = lpmFit.indexOf(Math.max(...lpmFit)); return mill[i] === 1 && notif[i] === 1 && ticket[i] === 8.5; })()), shown: 1 },
    { what: 'LPM ticket slope', value: LPM.coefs.find((k) => k.name === 'First ticket ($)').estimate, shown: 0.09, tol: 0.005 },
    { what: 'Odds of returning', value: nRet / (n - nRet), shown: 1.16, tol: 0.005 },
    { what: '7 to 6', value: 7 / 6, shown: 1.16, tol: 0.01 },
    { what: 'Log-odds', value: Math.log(nRet / (n - nRet)), shown: 0.15, tol: 0.005 },
    { what: 'Intercept', value: c('Intercept').estimate, shown: -2.842, tol: 0.0005 },
    { what: 'Intercept SE', value: c('Intercept').se, shown: 0.845, tol: 0.0005 },
    { what: 'Intercept z', value: c('Intercept').z, shown: -3.36, tol: 0.005 },
    { what: 'Intercept p', value: c('Intercept').p, shown: 0.001, tol: 0.0005 },
    { what: 'Near b', value: c('Near').estimate, shown: 0.339, tol: 0.0005 },
    { what: 'Near SE', value: c('Near').se, shown: 0.297, tol: 0.0005 },
    { what: 'Near z', value: c('Near').z, shown: 1.14, tol: 0.005 },
    { what: 'Near p', value: c('Near').p, shown: 0.253, tol: 0.0005 },
    { what: 'Near OR', value: c('Near').or, shown: 1.40, tol: 0.005 },
    { what: 'Near OR low', value: c('Near').orLow, shown: 0.78, tol: 0.005 },
    { what: 'Near OR high', value: c('Near').orHigh, shown: 2.51, tol: 0.005 },
    { what: 'Near p (2 dp)', value: c('Near').p, shown: 0.25, tol: 0.005 },
    { what: 'Notif b', value: c('Notifications').estimate, shown: 0.926, tol: 0.0005 },
    { what: 'Notif SE', value: c('Notifications').se, shown: 0.291, tol: 0.0005 },
    { what: 'Notif z', value: c('Notifications').z, shown: 3.18, tol: 0.005 },
    { what: 'Notif p', value: c('Notifications').p, shown: 0.001, tol: 0.0006 },
    { what: 'Notif p (4 dp)', value: c('Notifications').p, shown: 0.0015, tol: 0.00005 },
    { what: 'Notif OR', value: c('Notifications').or, shown: 2.52, tol: 0.005 },
    { what: 'Notif OR low', value: c('Notifications').orLow, shown: 1.43, tol: 0.005 },
    { what: 'Notif OR high', value: c('Notifications').orHigh, shown: 4.47, tol: 0.005 },
    { what: 'Ticket b', value: c('First ticket ($)').estimate, shown: 0.401, tol: 0.0005 },
    { what: 'Ticket SE', value: c('First ticket ($)').se, shown: 0.127, tol: 0.0005 },
    { what: 'Ticket z', value: c('First ticket ($)').z, shown: 3.15, tol: 0.005 },
    { what: 'Ticket p', value: c('First ticket ($)').p, shown: 0.002, tol: 0.0005 },
    { what: 'Ticket OR', value: c('First ticket ($)').or, shown: 1.49, tol: 0.005 },
    { what: 'Ticket OR low', value: c('First ticket ($)').orLow, shown: 1.16, tol: 0.005 },
    { what: 'Ticket OR high', value: c('First ticket ($)').orHigh, shown: 1.92, tol: 0.005 },
    { what: 'Millbrook b', value: c('Millbrook').estimate, shown: 0.847, tol: 0.0005 },
    { what: 'Millbrook SE', value: c('Millbrook').se, shown: 0.388, tol: 0.0005 },
    { what: 'Millbrook z', value: c('Millbrook').z, shown: 2.18, tol: 0.005 },
    { what: 'Millbrook p', value: c('Millbrook').p, shown: 0.029, tol: 0.0005 },
    { what: 'Millbrook OR', value: c('Millbrook').or, shown: 2.33, tol: 0.005 },
    { what: 'Millbrook OR low', value: c('Millbrook').orLow, shown: 1.09, tol: 0.005 },
    { what: 'Millbrook OR high', value: c('Millbrook').orHigh, shown: 4.98, tol: 0.005 },
    { what: 'Weekend b', value: c('Weekend').estimate, shown: -0.489, tol: 0.0005 },
    { what: 'Weekend SE', value: c('Weekend').se, shown: 0.327, tol: 0.0005 },
    { what: 'Weekend z', value: c('Weekend').z, shown: -1.50, tol: 0.005 },
    { what: 'Weekend p', value: c('Weekend').p, shown: 0.135, tol: 0.0005 },
    { what: 'Weekend OR', value: c('Weekend').or, shown: 0.61, tol: 0.005 },
    { what: 'Weekend OR low', value: c('Weekend').orLow, shown: 0.32, tol: 0.005 },
    { what: 'Weekend OR high', value: c('Weekend').orHigh, shown: 1.16, tol: 0.005 },
    { what: 'LR overall', value: M.lr, shown: 23.3, tol: 0.05 },
    { what: 'LR df', value: M.lrDf, shown: 5 },
    { what: 'LR p < 0.001', value: Number(M.lrP < 0.001), shown: 1 },
    { what: 'McFadden', value: M.mcfadden, shown: 0.075, tol: 0.0005 },
    { what: 'e^0.926', value: Math.exp(0.926), shown: 2.52, tol: 0.005 },
    { what: 'Harbourside far $5 weekday, off', value: hFar0, shown: 0.30, tol: 0.005 },
    { what: 'Harbourside far $5 weekday, on', value: hFar1, shown: 0.52, tol: 0.005 },
    { what: '22 points', value: (hFar1 - hFar0) * 100, shown: 22, tol: 0.5 },
    { what: 'Millbrook far $5 weekday, off', value: mFar0, shown: 0.50, tol: 0.005 },
    { what: 'Millbrook far $5 weekday, on', value: mFar1, shown: 0.72, tol: 0.005 },
    { what: 'Millbrook gain about 22 points too', value: (mFar1 - mFar0) * 100, shown: 22, tol: 0.5 },
    { what: 'Near Millbrook $8, off', value: top0, shown: 0.83, tol: 0.005 },
    { what: 'Near Millbrook $8, on', value: top1, shown: 0.92, tol: 0.005 },
    { what: '10 points', value: (top1 - top0) * 100, shown: 10, tol: 0.5 },
    { what: '0.52 ÷ 0.30 = 1.7 times', value: hFar1 / hFar0, shown: 1.7, tol: 0.05 },
    { what: 'log-likelihood', value: M.ll, shown: -143.67, tol: 0.005 },
    { what: 'null log-likelihood', value: M.ll0, shown: -155.32, tol: 0.005 },
    { what: 'G from rounded ℓs', value: 2 * (-143.67 + 155.32), shown: 23.3, tol: 0.05 },
    { what: 'z from rounded', value: 0.926 / 0.291, shown: 3.18, tol: 0.005 },
    { what: 'ℓ without notifications', value: NO_NOTIF.ll, shown: -148.90, tol: 0.005 },
    { what: 'LR notifications', value: lrNotif.stat, shown: 10.46, tol: 0.005 },
    { what: 'LR notifications from rounded', value: 2 * (-143.67 + 148.90), shown: 10.46, tol: 0.005 },
    { what: 'LR notifications p', value: lrNotif.p, shown: 0.0012, tol: 0.00005 },
    { what: 'LR notif p (3 dp)', value: lrNotif.p, shown: 0.001, tol: 0.0005 },
    { what: 'Planted near 0.9 → OR 2.46', value: Math.exp(0.9), shown: 2.46, tol: 0.005 },
    { what: 'Planted near inside CI', value: Number(Math.exp(0.9) > c('Near').orLow && Math.exp(0.9) < c('Near').orHigh), shown: 1 },
    { what: 'Ticket alone OR', value: ONE.coefs[1].or, shown: 1.21, tol: 0.005 },
    { what: 'Ticket alone p', value: ONE.coefs[1].p, shown: 0.049, tol: 0.0005 },
    { what: 'Mean ticket Millbrook', value: tkM, shown: 4.23, tol: 0.005 },
    { what: 'Mean ticket Harbourside', value: tkH, shown: 6.03, tol: 0.005 },
    { what: 'Return Millbrook %', value: retM * 100, shown: 55, tol: 0.5 },
    { what: 'Return Harbourside %', value: retH * 100, shown: 51, tol: 0.5 },
    // thresholds
    { what: 'Accuracy 0.4', value: T4.accuracy * 100, shown: 61.8, tol: 0.05 },
    { what: 'Sensitivity 0.4', value: T4.recall * 100, shown: 86.0, tol: 0.05 },
    { what: 'Specificity 0.4', value: T4.specificity * 100, shown: 33.7, tol: 0.05 },
    { what: 'Predicted to return 0.4', value: T4.tp + T4.fp, shown: 173 },
    { what: 'Accuracy 0.5', value: T5.accuracy * 100, shown: 63.6, tol: 0.05 },
    { what: 'Sensitivity 0.5', value: T5.recall * 100, shown: 72.7, tol: 0.05 },
    { what: 'Specificity 0.5', value: T5.specificity * 100, shown: 52.9, tol: 0.05 },
    { what: 'Predicted to return 0.5', value: T5.tp + T5.fp, shown: 137 },
    { what: 'Accuracy 0.6', value: T6.accuracy * 100, shown: 60.4, tol: 0.05 },
    { what: 'Sensitivity 0.6', value: T6.recall * 100, shown: 49.6, tol: 0.05 },
    { what: 'Specificity 0.6', value: T6.specificity * 100, shown: 73.1, tol: 0.05 },
    { what: 'Predicted to return 0.6', value: T6.tp + T6.fp, shown: 88 },
    { what: 'Better by 10 points', value: (T5.accuracy - base) * 100, shown: 10, tol: 0.5 },
    { what: '10 events per predictor satisfied', value: Number((n - nRet) / 5 >= 10), shown: 1 },
    { what: 'About 21 per predictor', value: (n - nRet) / 5, shown: 21, tol: 0.5 },
    // simple example
    { what: 'Example log-odds', value: etaEx, shown: 0.736, tol: 0.0005 },
    { what: 'Example odds', value: Math.exp(etaEx), shown: 2.09, tol: 0.005 },
    { what: 'Example probability', value: sig(etaEx), shown: 0.676, tol: 0.0005 },
    { what: 'Example probability from rounded odds', value: 2.09 / 3.09, shown: 0.676, tol: 0.0005 },
    { what: 'About 0.68', value: sig(etaEx), shown: 0.68, tol: 0.005 },
    { what: 'Without notifications: log-odds', value: etaEx - c('Notifications').estimate, shown: -0.190, tol: 0.0005 },
    { what: 'Without notifications: probability', value: sig(etaEx - c('Notifications').estimate), shown: 0.45, tol: 0.005 },
    { what: 'Example log-odds from rounded coefficients', value: -2.842 + 0.926 + 0.401 * 4.5 + 0.847, shown: 0.736, tol: 0.003 },
    // applied example
    { what: 'Flagged below 0.4', value: T4.tn + T4.fn, shown: 52 },
    { what: 'Of them did not return', value: T4.tn, shown: 35 },
    { what: 'Share of non-returners in list %', value: T4.tn / (T4.tn + T4.fn) * 100, shown: 67, tol: 0.5 },
    { what: 'Non-returners overall %', value: (n - nRet) / n * 100, shown: 46, tol: 0.5 },
    { what: 'Random list of 52 catches about 24', value: 52 * (n - nRet) / n, shown: 24, tol: 0.5 },
    { what: 'List 1.5 times as rich', value: (T4.tn / (T4.tn + T4.fn)) / ((n - nRet) / n), shown: 1.5, tol: 0.05 },
    { what: 'Missed non-returners', value: (n - nRet) - T4.tn, shown: 69 },
    { what: 'Flagged below 0.5', value: T5.tn + T5.fn, shown: 88 },
    { what: 'Of them did not return', value: T5.tn, shown: 55 },
    { what: 'Share at 0.5 %', value: T5.tn / (T5.tn + T5.fn) * 100, shown: 63, tol: 0.5 },
    { what: 'Note: 54% returned', value: base * 100, shown: 54, tol: 0.5 },
    { what: 'Note: OR 2.5 (1.4 to 4.5)', value: c('Notifications').orLow, shown: 1.4, tol: 0.05 },
    { what: 'Note: 4.5', value: c('Notifications').orHigh, shown: 4.5, tol: 0.05 },
    { what: 'Note: ticket 1.5', value: c('First ticket ($)').or, shown: 1.5, tol: 0.05 },
    { what: 'Returned with notifications on', value: retN * 100, shown: 62, tol: 0.5 },
    { what: 'Returned with them off', value: retNo * 100, shown: 43, tol: 0.5 },
  ],
};
