// Run: node tests/ml.test.mjs   (compares assets/js/core/ml.js with scikit-learn, SciPy and NumPy fixtures)
import { readFileSync } from 'node:fs';
import * as ML from '../assets/js/core/ml.js';
import { roc, standardise } from '../assets/js/core/classify.js';

const fx = JSON.parse(readFileSync(new URL('./fixtures-ml.json', import.meta.url)));
let fails = 0, checks = 0;
const close = (label, got, want, tol = 1e-6) => {
  checks++;
  const ok = Math.abs(got - want) <= tol * Math.max(1, Math.abs(want));
  if (!ok) { fails++; console.log(`FAIL ${label}: got ${got}, want ${want}`); }
};
const truth = (label, cond, detail = '') => { checks++; if (!cond) { fails++; console.log(`FAIL ${label} ${detail}`); } };
const allClose = (label, got, want, tol = 1e-9) => {
  checks++;
  const bad = want.findIndex((w, i) => !(Math.abs(got[i] - w) <= tol * Math.max(1, Math.abs(w))));
  if (got.length !== want.length || bad >= 0) { fails++; console.log(`FAIL ${label}: at ${bad}, got ${got[bad]}, want ${want[bad]}`); }
};

const X = fx.X, y = fx.y, nt = fx.ntrain;
const Xtr = X.slice(0, nt), ytr = y.slice(0, nt), Xte = X.slice(nt);

// ---------------------------------------------------------------- CART against DecisionTreeClassifier
for (const t of fx.trees) {
  // scikit-learn breaks exact ties between features in a random order, so a tree may legitimately take any of the
  // equally good forms it produced over 400 random_state values; ours must be one of them, in every detail
  const tree = ML.cart(Xtr, ytr, { maxDepth: t.depth, minLeaf: t.minLeaf });
  const got = Xte.map(tree.predict);
  const form = t.forms.find((f) => f.proba.every((v, i) => Math.abs(v - got[i]) < 1e-12));
  truth(`tree depth ${t.depth}, leaf ${t.minLeaf}: predict_proba equals one of scikit-learn's ${t.forms.length} equally good form(s)`, !!form);
  if (!form) continue;
  allClose(`tree depth ${t.depth}, leaf ${t.minLeaf}: feature_importances_`, tree.importance, form.importance, 1e-10);
  close(`tree depth ${t.depth}: leaves`, tree.leaves, form.leaves, 0);
  close(`tree depth ${t.depth}: nodes`, tree.nodes.length, form.nodes, 0);
  close(`tree depth ${t.depth}: root feature`, tree.root.feature, form.rootFeature, 0);
  close(`tree depth ${t.depth}: root threshold`, tree.root.threshold, form.rootThreshold, 1e-12);
}
{
  const wt = fx.weighted, tree = ML.cart(Xtr, ytr, { maxDepth: wt.depth, minLeaf: wt.minLeaf, weights: wt.w });
  allClose('weighted tree (sample_weight): predict_proba', Xte.map(tree.predict), wt.proba, 1e-12);
  allClose('weighted tree (sample_weight): feature_importances_', tree.importance, wt.importance, 1e-10);
}

// ---------------------------------------------------------------- AUC with ties against roc_auc_score
close('AUC with tied scores', roc(fx.auc_ties.y, fx.auc_ties.score).auc, fx.auc_ties.auc, 1e-12);

// ---------------------------------------------------------------- k-NN against StandardScaler + KNeighborsClassifier
const sc = ML.fitScaler(Xtr);
allClose('scaler means (ddof 0)', sc.mu, fx.scaler.mean, 1e-12);
allClose('scaler sds (ddof 0)', sc.sd, fx.scaler.scale, 1e-12);
for (const k of fx.knn) {
  const m = ML.makeModel('knn', { k: k.k }).fit(Xtr, ytr);
  allClose(`k-NN k = ${k.k}: predict_proba`, Xte.map(m.predict), k.proba, 1e-12);
}

// ---------------------------------------------------------------- random forest: seeded, and each tree is CART on its bootstrap
{
  const a = ML.forest(Xtr, ytr, { trees: 20, seed: 5 }), b = ML.forest(Xtr, ytr, { trees: 20, seed: 5 }), c = ML.forest(Xtr, ytr, { trees: 20, seed: 6 });
  allClose('forest: same seed, same probabilities', Xte.map(a.predict), Xte.map(b.predict), 0);
  truth('forest: another seed, different probabilities', Xte.some((x) => a.predict(x) !== c.predict(x)));
  close('forest: √p features per split', a.mtry, 2, 0);
  allClose('forest probability = mean of its trees', Xte.map(a.predict), Xte.map((x) => a.trees.reduce((s, t) => s + t.predict(x), 0) / 20), 1e-14);
  const full = ML.forest(Xtr, ytr, { trees: 8, seed: 9, maxFeatures: 4, minLeaf: 2 });
  full.trees.forEach((t, i) => {
    const ref = ML.cart(Xtr, ytr, { weights: t.weights, minLeaf: 2 });
    allClose(`forest tree ${i + 1} (all features) = CART on its bootstrap weights`, X.map(t.predict), X.map(ref.predict), 0);
    close(`forest tree ${i + 1}: bootstrap draws n rows`, t.weights.reduce((s, v) => s + v, 0), nt, 0);
  });
  close('forest importances sum to 1', a.importance.reduce((s, v) => s + v, 0), 1, 1e-12);
}

// ---------------------------------------------------------------- cross-validation and permutation importance
{
  const folds = ML.stratifiedFolds(y, 5, 7), all = folds.flat().sort((p, q) => p - q);
  truth('stratified folds cover every row exactly once', all.length === y.length && all.every((v, i) => v === i));
  const pos = y.reduce((s, v) => s + v, 0);
  truth('each fold keeps the class balance (within one row)', folds.every((f) => Math.abs(f.filter((i) => y[i]).length - pos / 5) <= 1));
  const cv = ML.crossValidate(X, y, ML.makeModel('logistic'), folds);
  truth('cross-validation runs', !cv.error, cv.error);
  // out-of-fold probabilities really come from models that never saw the row
  const f0 = folds[0], trainIdx = y.map((_, i) => i).filter((i) => !f0.includes(i));
  const m0 = ML.makeModel('logistic').fit(trainIdx.map((i) => X[i]), trainIdx.map((i) => y[i]));
  allClose('out-of-fold probability = model fitted without that fold', f0.map((i) => cv.oof[i]), f0.map((i) => m0.predict(X[i])), 1e-12);
  close('fold AUCs average to the reported AUC', cv.perFold.reduce((s, f) => s + f.auc, 0) / 5, cv.auc, 1e-14);
  // a column of pure noise should matter far less than the strongest predictor
  const Xn = X.map((r, i) => [...r, Math.sin(i * 12.9898) * 43758.5453 % 1]);
  const cvn = ML.crossValidate(Xn, y, ML.makeModel('logistic'), folds);
  const imp = ML.permutationImportance(Xn, y, cvn, { repeats: 4 });
  truth('permutation importance: real predictor beats noise', imp[0].mean > 0.05 && Math.abs(imp[4].mean) < 0.03, JSON.stringify(imp.map((d) => d.mean)));
}

// ---------------------------------------------------------------- Ward against scipy.cluster.hierarchy.linkage
{
  const { rows } = standardise(ML.transpose(fx.ward.rows));
  const link = ML.ward(rows);
  allClose('Ward merge heights', link.merges.map((m) => m.height), fx.ward.Z.map((z) => z[2]), 1e-10);
  truth('Ward merge pairs and sizes', link.merges.every((m, i) => m.a === fx.ward.Z[i][0] && m.b === fx.ward.Z[i][1] && m.size === fx.ward.Z[i][3]));
  for (const [k, want] of [[3, fx.ward.k3], [5, fx.ward.k5]]) {
    const { labels } = ML.cutTree(link, k);
    const map = new Map(); let ok = true;           // same partition up to relabelling
    labels.forEach((l, i) => { if (!map.has(l)) map.set(l, want[i]); else if (map.get(l) !== want[i]) ok = false; });
    truth(`Ward cut into ${k} groups = fcluster(maxclust)`, ok && new Set(map.values()).size === k);
  }
  close('adjusted Rand index = adjusted_rand_score', ML.adjustedRand(fx.ari.a, fx.ari.b), fx.ari.ari, 1e-12);
  close('adjusted Rand index of a grouping with itself', ML.adjustedRand(fx.ari.a, fx.ari.a), 1, 1e-12);
  close('between-group share of the sum of squares (3 groups)', ML.betweenShare(rows, ML.cutTree(link, 3).labels), fx.ari.between3, 1e-10);
  const order = ML.leafOrder(link);
  truth('dendrogram leaf order is a permutation', order.length === rows.length && new Set(order).size === rows.length);
}

// ---------------------------------------------------------------- PCA against NumPy and scikit-learn
{
  const res = ML.pca(fx.pca.cols);
  allClose('PCA eigenvalues of the correlation matrix', res.values, fx.pca.eigen, 1e-10);
  allClose('PCA explained variance ratio', res.ratio, fx.pca.ratio, 1e-10);
  fx.pca.components.forEach((comp, c) => allClose(`PCA component ${c + 1} weights`, res.vectors.map((row) => row[c]), comp, 1e-8));
  // eigen-decomposition really holds: R v = λ v
  const R = res.R, p = res.p;
  for (let c = 0; c < p; c++) {
    const v = res.vectors.map((row) => row[c]), Rv = R.map((r) => r.reduce((s, x, j) => s + x * v[j], 0));
    allClose(`R v = λ v for component ${c + 1}`, Rv, v.map((x) => x * res.values[c]), 1e-10);
  }
  // loadings are the correlations between each column and each component's scores
  const corr = (a, b) => { const ma = a.reduce((s, v) => s + v, 0) / a.length, mb = b.reduce((s, v) => s + v, 0) / b.length; let sab = 0, saa = 0, sbb = 0; a.forEach((v, i) => { sab += (v - ma) * (b[i] - mb); saa += (v - ma) ** 2; sbb += (b[i] - mb) ** 2; }); return sab / Math.sqrt(saa * sbb); };
  close('loading = corr(column, component scores)', res.loadings[1][0], corr(fx.pca.cols[1], res.scores.map((s) => s[0])), 1e-10);
  close('component scores have variance λ', res.scores.reduce((s, r) => s + r[0] ** 2, 0) / (res.n - 1), res.values[0], 1e-10);
}

console.log(fails ? `${fails} of ${checks} checks failed` : `all ${checks} checks passed`);
process.exit(fails ? 1 : 0);
