// Lesson: classification with logistic regression — odds ratios, thresholds, the confusion matrix and AUC —
// and why clustering needs columns on a common scale.
// `checks` recompute every number printed in the worked example; tests/lessons.test.mjs compares them.
import * as F from '../../core/format.js?v=6';
import { normQuantile } from '../../core/stats.js?v=6';
import { confusion, roc } from '../../core/classify.js?v=6';

const sigmoid = (z) => 1 / (1 + Math.exp(-z));
const B0 = -2.0, B1 = 0.405;                       // invented churn model: log-odds = −2.0 + 0.405 × support calls
const rates = ({ tp, fp, fn, tn }) => ({ precision: tp / (tp + fp), recall: tp / (tp + fn), accuracy: (tp + tn) / (tp + fp + fn + tn), flagged: tp + fp });
const AT50 = { tp: 120, fp: 80, fn: 80, tn: 720 }, AT20 = { tp: 170, fp: 230, fn: 30, tn: 570 };

// Calculator data: 300 customers who stay and 100 who churn. Scores on a latent scale are evenly spaced normal
// quantiles; churners sit `d` standard deviations higher. Probabilities are the Bayes-calibrated chance of churn.
const QS = (n) => Array.from({ length: n }, (_, i) => normQuantile((i + 0.5) / n));
const STAY = QS(300), GO = QS(100);

export default {
  id: 'classify',
  title: 'Classification: odds, thresholds and the confusion matrix',
  minutes: 7,
  hook: 'A churn model gives each customer a probability. Turning that into a decision means choosing a threshold, and every threshold trades missed churners against false alarms.',
  idea: [
    '<b>Logistic regression</b> keeps predictions between 0 and 1 by modelling the <em>log-odds</em> as a straight line. Raise e to a coefficient and you get an <b>odds ratio</b>: the factor by which one more unit multiplies the odds of the outcome, holding the other predictors fixed. Odds ratios multiply odds, not probabilities.',
    'To act, choose a <b>threshold</b> and flag everyone above it. The confusion matrix counts the four results. <b>Precision</b> is the share of flagged customers who really churn; <b>recall</b> is the share of churners you flag. Lower the threshold and recall rises while precision falls. The ROC curve traces every threshold, and its area (<b>AUC</b>) is the chance a random churner scores above a random stayer: 0.5 is a coin flip, 1.0 perfect.',
    'Clustering has no outcome column. k-means groups rows by distance, so put the columns on a common scale first (standardise each to mean 0, standard deviation 1), or whichever column has the bigger numbers decides the groups.',
  ],
  formula: {
    html: 'log <span class="frac"><span>p</span><span>1 − p</span></span> = b<sub>0</sub> + b<sub>1</sub>x,&ensp; p = <span class="frac"><span>1</span><span>1 + e<sup>−(b<sub>0</sub> + b<sub>1</sub>x)</sup></span></span>,&ensp; odds ratio = e<sup>b<sub>1</sub></sup>,&ensp; precision = <span class="frac"><span>TP</span><span>TP + FP</span></span>,&ensp; recall = <span class="frac"><span>TP</span><span>TP + FN</span></span>',
    terms: [
      ['p', 'the predicted probability of the outcome (here, churn)'],
      ['p ÷ (1 − p)', 'the odds: 0.25 probability is odds of 1 to 3'],
      ['e<sup>b<sub>1</sub></sup>', 'the odds ratio for one more unit of x'],
      ['TP, FP, FN, TN', 'true positives (flagged churners), false positives (flagged stayers), false negatives (missed churners), true negatives'],
    ],
  },
  example: {
    setup: 'A churn model has log-odds = −2.0 + 0.405 × support calls. Of 1,000 customers, 200 churn.',
    steps: [
      'Odds ratio for a call: e<sup>0.405</sup> = <b>1.50</b>. Each extra call multiplies the odds of churning by 1.5.',
      'A customer with no calls: p = 1 ÷ (1 + e<sup>2.0</sup>) = <b>11.9%</b>. With two calls the log-odds are −2.0 + 0.81 = −1.19, so p = <b>23.3%</b>.',
      'Flag everyone at 50% or more: 120 churners caught, 80 stayers flagged by mistake, 80 churners missed. Precision = 120 ÷ 200 = <b>60%</b>; recall = 120 ÷ 200 = <b>60%</b>.',
      'Lower the threshold to 20%: 170 caught, 230 false alarms, 30 missed. Recall rises to 170 ÷ 200 = <b>85%</b>; precision falls to 170 ÷ 400 = <b>42.5%</b>.',
    ],
    result: 'Neither threshold is “right”. If a missed churner costs much more than a retention call, the 20% threshold is worth its 230 false alarms; if calls are expensive, 50% may be better.',
  },
  mistake: {
    title: 'Reading an odds ratio as a ratio of probabilities',
    html: 'An odds ratio of 1.5 does not make churn 50% more likely. Two calls multiply the odds by 1.5² = <b>2.25</b>, but the probability goes from 11.9% to 23.3%, only <b>1.96</b> times as high. The gap widens as probabilities grow: near certainty, the odds can keep multiplying while the probability barely moves.',
  },
  remember: [
    'e<sup>coefficient</sup> is an odds ratio: it multiplies the odds per unit, holding the other predictors fixed.',
    'Lowering the threshold raises recall and lowers precision. AUC summarises every threshold: 0.5 is chance.',
    'Standardise columns before k-means, or the one with the biggest numbers dominates the distances.',
  ],
  calc: {
    title: 'Move the threshold',
    intro: '400 customers, 100 of whom churn. Separation sets how much higher churners score than stayers.',
    inputs: [
      { id: 'd', label: 'How well scores separate churners', min: 0, max: 3, step: 0.1, value: 1.5, fmt: 'num', digits: 1 },
      { id: 't', label: 'Flag customers at or above', min: 5, max: 95, step: 5, value: 50, fmt: 'pct' },
    ],
    compute({ d, t }) {
      const lo = Math.log(100 / 300);
      const prob = [...STAY.map((x) => sigmoid(lo + d * x - (d * d) / 2)), ...GO.map((x) => sigmoid(lo + d * (x + d) - (d * d) / 2))];
      const y = [...STAY.map(() => 0), ...GO.map(() => 1)];
      const c = confusion(y, prob, t / 100), auc = roc(y, prob).auc;
      const flagged = c.tp + c.fp;
      const note = auc < 0.55 ? 'With no separation the scores carry no information: AUC is a coin flip, and a threshold can only flag everyone or no one.'
        : !flagged ? 'Nobody is flagged: every customer’s churn probability is below the threshold, so recall is zero.'
        : c.fp > c.tp * 1.5 ? 'Most flags are false alarms. That can still pay if a retention call is cheap next to a lost customer.'
          : c.recall < 0.4 ? 'Precise but narrow: most churners slip through. Lower the threshold to catch more.'
            : 'A middle setting: compare the cost of a false alarm with the cost of a missed churner to choose.';
      return {
        headline: { value: F.pct(c.recall, 0), label: 'of churners flagged (recall)' },
        rows: [['Precision: flagged who really churn', flagged ? F.pct(c.precision, 0) : '—'], ['Customers flagged', `${F.int(flagged)} (${F.int(c.fp)} false alarms)`], ['Accuracy', F.pct(c.accuracy, 0)], ['AUC (every threshold)', F.num(auc, 2)]],
        note,
      };
    },
  },
  tool: { href: 'analytics/supervised/#classify', label: 'Logistic regression in depth, in Business analytics › Supervised learning' },
  checks: (() => {
    const p0 = sigmoid(B0), p2 = sigmoid(B0 + 2 * B1), r50 = rates(AT50), r20 = rates(AT20);
    const odds = (p) => p / (1 - p);
    return [
      { what: 'odds ratio', value: Math.exp(B1), shown: 1.5, tol: 0.005 },
      { what: 'p at 0 calls', value: p0 * 100, shown: 11.9, tol: 0.05 }, { what: 'log-odds at 2 calls', value: B0 + 2 * B1, shown: -1.19, tol: 1e-9 },
      { what: '2 × 0.405', value: 2 * B1, shown: 0.81, tol: 1e-9 }, { what: 'p at 2 calls', value: p2 * 100, shown: 23.3, tol: 0.05 },
      { what: 'precision at 50%', value: r50.precision * 100, shown: 60, tol: 1e-9 }, { what: 'recall at 50%', value: r50.recall * 100, shown: 60, tol: 1e-9 },
      { what: 'flagged at 50%', value: r50.flagged, shown: 200, tol: 0 }, { what: 'churners', value: AT50.tp + AT50.fn, shown: 200, tol: 0 },
      { what: 'customers', value: AT50.tp + AT50.fp + AT50.fn + AT50.tn, shown: 1000, tol: 0 }, { what: 'customers at 20%', value: AT20.tp + AT20.fp + AT20.fn + AT20.tn, shown: 1000, tol: 0 },
      { what: 'recall at 20%', value: r20.recall * 100, shown: 85, tol: 1e-9 }, { what: 'flagged at 20%', value: r20.flagged, shown: 400, tol: 0 },
      { what: 'precision at 20%', value: r20.precision * 100, shown: 42.5, tol: 1e-9 },
      { what: 'odds ratio squared', value: odds(p2) / odds(p0), shown: 2.25, tol: 0.005 },
      { what: 'probability ratio', value: p2 / p0, shown: 1.96, tol: 0.005 },
    ];
  })(),
};
