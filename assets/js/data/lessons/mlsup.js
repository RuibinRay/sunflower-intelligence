// Lesson: supervised learning — fair comparison by cross-validation, trees, forests, k-NN and permutation importance.
// `checks` recompute every number printed in the worked example; tests/lessons.test.mjs compares them.
import * as F from '../../core/format.js?v=22';

/** Gini impurity of a node with `pos` of `n` rows in the positive class. */
const gini = (pos, n) => { const p = pos / n; return 1 - p * p - (1 - p) * (1 - p); };
/** Weighted impurity of a split into (posL of nL) and (posR of nR). */
const split = (posL, nL, posR, nR) => (nL * gini(posL, nL) + nR * gini(posR, nR)) / (nL + nR);
/** Spread of an average of B predictions, each with spread 1 and pairwise correlation ρ (as a share of one tree's). */
const forestSpread = (B, rho) => Math.sqrt(rho + (1 - rho) / B);

export default {
  id: 'mlsup',
  title: 'Supervised learning: comparing models fairly',
  minutes: 7,
  hook: 'Four models can answer the same yes-or-no question. The fair way to pick one is to score each only on rows it never trained on, and to know what each model is doing.',
  idea: [
    'Judge a model only on data it didn’t learn from. In <b>k-fold cross-validation</b> the rows are dealt into k folds; each fold is held out once while the others train the model, so every row is predicted exactly once, by a model that never saw it. Score with <b>AUC</b>, the chance a random “yes” scores above a random “no” (0.5 is a coin flip), which accuracy can’t match when one class is rare.',
    'A <b>decision tree</b> asks one question at a time, choosing the split that leaves the two sides purest. Grown deep, it memorises noise: a big gap between training and held-out scores is <b>overfitting</b>. A <b>random forest</b> grows many deep trees, each on a bootstrap sample and shown a random few columns at each split, then averages them. <b>k-nearest neighbours</b> predicts from the most similar rows, so columns must be standardised first.',
    '<b>Permutation importance</b> shuffles one column among the held-out rows and measures how far AUC falls. It shows what the model uses, not what matters in the world: two correlated columns share the credit.',
  ],
  formula: {
    html: 'G = 1 − Σ<sub>k</sub> p<sub>k</sub><sup>2</sup>,&ensp; ΔG = G<sub>parent</sub> − <span class="frac"><span>n<sub>L</sub></span><span>n</span></span>G<sub>L</sub> − <span class="frac"><span>n<sub>R</sub></span><span>n</span></span>G<sub>R</sub>,&ensp; Var(forest) = ρσ<sup>2</sup> + <span class="frac"><span>(1 − ρ)σ<sup>2</sup></span><span>B</span></span>',
    terms: [
      ['G', 'Gini impurity of a node: 0 when every row is the same class, 0.5 at most for two classes'],
      ['p<sub>k</sub>', 'share of the node’s rows in class k'],
      ['ΔG', 'how much a split lowers impurity; the tree takes the split with the largest'],
      ['B, ρ, σ', 'number of trees, correlation between their predictions, and one tree’s spread; averaging only removes the (1 − ρ) part'],
    ],
  },
  example: {
    setup: 'A tree is choosing its first question for 100 customers, 30 of whom churned. It can split on tenure ≤ 12 months (40 customers, 20 churned; and 60 with 10 churned) or on fee ≤ $30 (50 with 18 churned; 50 with 12).',
    steps: [
      'Impurity before splitting: 1 − 0.30² − 0.70² = <b>0.420</b>.',
      'Tenure split: left 1 − 0.5² − 0.5² = <b>0.500</b>; right 1 − (1/6)² − (5/6)² = <b>0.278</b>. Weighted: 0.4 × 0.500 + 0.6 × 0.278 = <b>0.367</b>, a fall of <b>0.053</b>.',
      'Fee split: left 1 − 0.36² − 0.64² = <b>0.461</b>; right 1 − 0.24² − 0.76² = <b>0.365</b>. Weighted: <b>0.413</b>, a fall of only <b>0.007</b>.',
      'The tree splits on tenure, then repeats the search inside each side until it reaches its depth limit or its minimum leaf size.',
    ],
    result: 'Tenure separates churners about <b>7 times</b> as well as fee here. The same greedy search, run to full depth, is why a single tree overfits and why forests average many of them.',
  },
  mistake: {
    title: 'Choosing a model by its score on its own training rows',
    html: 'A deep tree can score an AUC of 0.95 on the rows it was grown on and 0.68 on held-out folds, while a logistic regression scores 0.76 held out. Picking the tree because of its 0.95 picks the worse model: the 0.27 gap is noise it memorised. Compare models only on held-out scores, and shrink an overfitting tree’s depth or raise its minimum leaf size.',
  },
  remember: [
    'Cross-validation predicts every row once, from a model that never saw it. Compare models on those held-out scores.',
    'Forests beat single trees by averaging trees made different by bootstrap samples and random columns. k-NN needs standardised columns.',
    'Permutation importance shows what a model leans on; correlated columns share the credit.',
  ],
  calc: {
    title: 'Why a forest averages different trees',
    intro: 'Each tree’s prediction wobbles around the truth. Averaging cancels the part of the wobble the trees don’t share.',
    inputs: [
      { id: 'B', label: 'Number of trees', min: 1, max: 500, step: 1, value: 100, fmt: 'int' },
      { id: 'rho', label: 'Correlation between trees’ predictions', min: 0, max: 1, step: 0.05, value: 0.3, fmt: 'num', digits: 2 },
    ],
    compute({ B, rho }) {
      const s = forestSpread(B, rho), floor = Math.sqrt(rho);
      const need = rho > 0 && rho < 1 ? Math.ceil((1 - rho) / (0.1025 * rho)) : null;   // spread within 5% of the floor
      const note = rho >= 0.95 ? 'Trees this alike make the same mistakes, so averaging barely helps. Random columns at each split exist to make trees disagree.'
        : rho <= 0.05 ? 'Nearly independent trees: every extra tree keeps shrinking the error, roughly as 1 ÷ √trees.'
          : B >= (need || 0) ? `With ${F.int(B)} trees the forest is already near its floor; more trees cost time and buy little. Lowering the correlation would help more.`
            : `More trees still help: about ${F.int(need)} get within 5% of the floor.`;
      return {
        headline: { value: F.pct(s, 0), label: 'of one tree’s spread, for the forest' },
        rows: [['With unlimited trees (the floor)', F.pct(floor, 0)], ['Trees to get within 5% of the floor', need ? F.int(need) : rho >= 1 ? 'never: no gain' : 'no floor: keeps falling']],
        note,
      };
    },
  },
  tool: { href: 'analytics/supervised/#compare', label: 'Compare models, in Business analytics › Supervised learning' },
  checks: (() => {
    const g0 = gini(30, 100), gT = split(20, 40, 10, 60), gF = split(18, 50, 12, 50);
    return [
      { what: 'parent impurity', value: g0, shown: 0.42, tol: 1e-9 },
      { what: 'tenure left', value: gini(20, 40), shown: 0.5, tol: 1e-9 }, { what: 'tenure right', value: gini(10, 60), shown: 0.278, tol: 0.0005 },
      { what: 'tenure weighted', value: gT, shown: 0.367, tol: 0.0005 }, { what: 'tenure fall', value: g0 - gT, shown: 0.053, tol: 0.0005 },
      { what: 'fee left', value: gini(18, 50), shown: 0.461, tol: 0.0005 }, { what: 'fee right', value: gini(12, 50), shown: 0.365, tol: 0.0005 },
      { what: 'fee weighted', value: gF, shown: 0.413, tol: 0.0005 }, { what: 'fee fall', value: g0 - gF, shown: 0.007, tol: 0.0005 },
      { what: 'tenure vs fee', value: (g0 - gT) / (g0 - gF), shown: 7, tol: 0.5 },
      { what: 'train–held-out gap', value: 0.95 - 0.68, shown: 0.27, tol: 1e-9 },
    ];
  })(),
};
