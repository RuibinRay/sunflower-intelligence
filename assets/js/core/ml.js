// ml.js — machine learning for the analytics room: CART decision trees, k-nearest neighbours, random forests,
// stratified k-fold cross-validation, permutation importance, Ward hierarchical clustering and principal components.
// Checked against scikit-learn, SciPy and NumPy in tests/ml.test.mjs. Outcomes are binary (0/1) throughout.
import { mulberry32 } from './rng.js?v=9';
import { logit, roc } from './classify.js?v=9';
import { mean, sd } from './stats.js?v=9';

// ================================================================ helpers
export const transpose = (rows) => rows[0].map((_, j) => rows.map((r) => r[j]));
export const range = (n) => Array.from({ length: n }, (_, i) => i);
export function shuffle(a, rand) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
/** A seeded random sample of m of the indices 0..n-1, kept in their original order (all of them when n ≤ m). */
export function sampleIndices(n, m, seed = 5) {
  if (n <= m) return range(n);
  return shuffle(range(n), mulberry32(seed)).slice(0, m).sort((a, b) => a - b);
}
/** Mean and population sd (ddof 0, as scikit-learn's StandardScaler) of each column of `rows`; apply() rescales a row. */
export function fitScaler(rows) {
  const p = rows[0].length, n = rows.length, mu = new Array(p).fill(0), s = new Array(p).fill(0);
  rows.forEach((r) => r.forEach((v, j) => { mu[j] += v / n; }));
  rows.forEach((r) => r.forEach((v, j) => { s[j] += (v - mu[j]) ** 2 / n; }));
  const sdv = s.map((v) => Math.sqrt(v) || 1);
  return { mu, sd: sdv, apply: (x) => x.map((v, j) => (v - mu[j]) / sdv[j]) };
}
const EPS = 2.220446049250313e-16;          // scikit-learn's leaf test: impurity ≤ machine epsilon
const FEATURE_THRESHOLD = 1e-7;             // values closer than this count as equal (scikit-learn's constant)
/** Columns as typed arrays, and every row index sorted by each column (shared by all the trees of a forest). */
export function presort(X) {
  const n = X.length, p = X[0].length;
  const cols = Array.from({ length: p }, (_, f) => Float64Array.from(X, (r) => r[f]));
  return { cols, sorted: cols.map((c) => Int32Array.from(range(n)).sort((a, b) => c[a] - c[b])) };
}

// ================================================================ CART decision tree (Gini)
/**
 * Classification tree grown the way scikit-learn's DecisionTreeClassifier grows one: binary splits x ≤ t with t
 * the midpoint between neighbouring values, chosen to minimise the weighted Gini impurity of the two children.
 * X: rows; y: 0/1. Options: maxDepth, minLeaf (rows per leaf), minSplit, weights (e.g. bootstrap counts; rows with
 * weight 0 are left out, and minLeaf counts distinct rows, as in scikit-learn), maxFeatures + rand (random forests:
 * look at that many non-constant features, drawn at random, at each split).
 */
export function cart(X, y, { maxDepth = Infinity, minLeaf = 1, minSplit = 2, weights = null, maxFeatures = null, rand = null, prep = null } = {}) {
  const n = X.length, p = X[0].length;
  const w = weights || new Float64Array(n).fill(1);
  const nodes = [], gain = new Float64Array(p);
  const mtry = maxFeatures ? Math.min(p, maxFeatures) : p;
  // rows sorted once by every feature; each split partitions those lists, so no node ever sorts again
  const { cols, sorted: allSorted } = prep || presort(X);
  const mark = new Uint8Array(n);

  const grow = (lists, depth) => {
    const idx = lists[0], m = idx.length;
    let w0 = 0, w1 = 0;
    for (let q = 0; q < m; q++) { const i = idx[q]; if (y[i]) w1 += w[i]; else w0 += w[i]; }
    const W = w0 + w1, impurity = 1 - (w0 / W) ** 2 - (w1 / W) ** 2;
    const node = { id: nodes.length, depth, n: m, w: W, counts: [w0, w1], p1: w1 / W, impurity, leaf: true };
    nodes.push(node);
    if (depth >= maxDepth || m < minSplit || m < 2 * minLeaf || impurity <= EPS) return node;

    let bf = -1, bk = 0, bt = 0, bestProxy = -Infinity;
    const order = rand && mtry < p ? shuffle(range(p), rand) : range(p);
    let visited = 0;
    for (const f of order) {
      if (visited >= mtry) break;
      const sorted = lists[f], v = cols[f];
      if (v[sorted[m - 1]] <= v[sorted[0]] + FEATURE_THRESHOLD) continue;   // constant here: doesn't count as a look
      visited++;
      let l0 = 0, l1 = 0;
      for (let k = 1; k < m; k++) {
        const i = sorted[k - 1];
        if (y[i]) l1 += w[i]; else l0 += w[i];
        const lo = v[i], hi = v[sorted[k]];
        if (hi <= lo + FEATURE_THRESHOLD) continue;                     // can't split between equal values
        if (k < minLeaf || m - k < minLeaf) continue;
        const r0 = w0 - l0, r1 = w1 - l1;
        const proxy = (l0 * l0 + l1 * l1) / (l0 + l1) + (r0 * r0 + r1 * r1) / (r0 + r1);   // larger = purer children
        if (proxy > bestProxy) {
          bestProxy = proxy; bf = f; bk = k;
          bt = lo / 2 + hi / 2;
          if (bt === hi || !Number.isFinite(bt)) bt = lo;
        }
      }
    }
    if (bf < 0) return node;
    const split = lists[bf];
    for (let q = 0; q < bk; q++) mark[split[q]] = 1;
    const left = [], right = [];
    for (let f = 0; f < p; f++) {
      const src = lists[f], L = new Int32Array(bk), R = new Int32Array(m - bk);
      let a = 0, b = 0;
      for (let q = 0; q < m; q++) { const i = src[q]; if (mark[i]) L[a++] = i; else R[b++] = i; }
      left.push(L); right.push(R);
    }
    for (let q = 0; q < bk; q++) mark[split[q]] = 0;
    node.leaf = false; node.feature = bf; node.threshold = bt;
    node.left = grow(left, depth + 1);
    node.right = grow(right, depth + 1);
    gain[bf] += W * impurity - node.left.w * node.left.impurity - node.right.w * node.right.impurity;
    return node;
  };
  const root = grow(allSorted.map((lst) => lst.filter((i) => w[i] > 0)), 0);
  const tot = gain.reduce((a, v) => a + v, 0);
  const importance = Array.from(gain, (v) => (tot > 0 ? v / tot : 0));
  const leafOf = (x) => { let nd = root; while (!nd.leaf) nd = x[nd.feature] <= nd.threshold ? nd.left : nd.right; return nd; };
  return {
    root, nodes, importance, weights: w,
    depth: nodes.reduce((a, nd) => Math.max(a, nd.depth), 0),
    leaves: nodes.filter((nd) => nd.leaf).length,
    leafOf,
    predict: (x) => leafOf(x).p1,
  };
}

/** The decision rules down to every leaf, e.g. ['tenure ≤ 14.5', 'support_calls > 2.5']. */
export function leafRules(tree, names, fmt = (v) => String(+v.toPrecision(4))) {
  const out = [];
  const walk = (nd, path) => {
    if (nd.leaf) { out.push({ node: nd, path }); return; }
    walk(nd.left, [...path, `${names[nd.feature]} ≤ ${fmt(nd.threshold)}`]);
    walk(nd.right, [...path, `${names[nd.feature]} > ${fmt(nd.threshold)}`]);
  };
  walk(tree.root, []);
  return out;
}

// ================================================================ random forest
/**
 * Breiman's random forest: each tree is a CART tree grown on a bootstrap sample (n rows drawn with replacement,
 * passed as row weights) looking at a random √p of the features at each split. Probability = the trees' average.
 */
export function forest(X, y, { trees = 100, maxFeatures = 'sqrt', minLeaf = 1, maxDepth = Infinity, seed = 1888 } = {}) {
  const n = X.length, p = X[0].length, rand = mulberry32(seed);
  const mtry = maxFeatures === 'sqrt' ? Math.max(1, Math.floor(Math.sqrt(p))) : Math.min(p, maxFeatures || p);
  const list = [], prep = presort(X);
  for (let t = 0; t < trees; t++) {
    const wts = new Float64Array(n);
    for (let k = 0; k < n; k++) wts[Math.floor(rand() * n)] += 1;
    list.push(cart(X, y, { weights: wts, maxFeatures: mtry, rand, minLeaf, maxDepth, prep }));
  }
  const importance = new Array(p).fill(0);
  list.forEach((tr) => tr.importance.forEach((v, j) => { importance[j] += v / trees; }));
  return { trees: list, mtry, importance, predict: (x) => { let s = 0; for (const tr of list) s += tr.predict(x); return s / list.length; } };
}

// ================================================================ k-nearest neighbours
/** k-NN probability = share of the k closest training rows (Euclidean) that are 1. Ties in distance keep the earlier row. */
export function knn(rows, y, k) {
  const n = rows.length, kk = Math.max(1, Math.min(k, n));
  return {
    k: kk,
    predict(x) {
      const bd = new Float64Array(kk).fill(Infinity), by = new Uint8Array(kk);
      for (let i = 0; i < n; i++) {
        const r = rows[i]; let d = 0;
        for (let j = 0; j < r.length; j++) { const t = r[j] - x[j]; d += t * t; }
        if (d < bd[kk - 1]) {
          let pos = kk - 1;
          while (pos > 0 && bd[pos - 1] > d) { bd[pos] = bd[pos - 1]; by[pos] = by[pos - 1]; pos--; }
          bd[pos] = d; by[pos] = y[i];
        }
      }
      let s = 0; for (let q = 0; q < kk; q++) s += by[q];
      return s / kk;
    },
  };
}

// ================================================================ the four models, as fit(Xtrain, ytrain) -> { predict }
export function makeModel(key, opts = {}) {
  if (key === 'logistic') return { key, fit: (X, y) => { const f = logit(transpose(X), y); return f.error ? { error: f.error } : { predict: (x) => f.predict(x), fit: f }; } };
  if (key === 'tree') return { key, fit: (X, y) => cart(X, y, { maxDepth: opts.maxDepth ?? 3, minLeaf: opts.minLeaf ?? 10 }) };
  if (key === 'knn') {
    return { key, fit: (X, y) => {                    // standardised with the training rows' own means and sds only
      const sc = fitScaler(X), m = knn(X.map(sc.apply), y, opts.k ?? 15);
      return { predict: (x) => m.predict(sc.apply(x)), k: m.k };
    } };
  }
  if (key === 'forest') return { key, fit: (X, y) => forest(X, y, { trees: opts.trees ?? 100, seed: opts.seed ?? 1888 }) };
  throw new Error(`unknown model ${key}`);
}

// ================================================================ cross-validation
/** Stratified k folds: each class is shuffled (seeded) and dealt round the folds, so every fold keeps the class balance. */
export function stratifiedFolds(y, k = 5, seed = 7) {
  const rand = mulberry32(seed), folds = Array.from({ length: k }, () => []);
  let deal = 0;
  [0, 1].forEach((cls) => {
    const idx = shuffle(range(y.length).filter((i) => y[i] === cls), rand);
    idx.forEach((i) => { folds[deal % k].push(i); deal++; });
  });
  return folds.map((f) => f.sort((a, b) => a - b));
}

/**
 * Fit on k−1 folds, score the held-out fold, k times. Returns accuracy (at 50%) and AUC per fold, their mean and sd,
 * the out-of-fold probability for every row (each from a model that never saw that row) and the fitted fold models.
 */
export function crossValidate(X, y, model, folds) {
  const n = y.length, oof = new Float64Array(n), perFold = [], fitted = [];
  for (const test of folds) {
    const inTest = new Uint8Array(n); test.forEach((i) => { inTest[i] = 1; });
    const train = []; for (let i = 0; i < n; i++) if (!inTest[i]) train.push(i);
    const m = model.fit(train.map((i) => X[i]), train.map((i) => y[i]));
    if (m.error) return { error: m.error };
    const yt = test.map((i) => y[i]), pt = test.map((i) => m.predict(X[i]));
    test.forEach((i, q) => { oof[i] = pt[q]; });
    let hit = 0; yt.forEach((v, q) => { if ((pt[q] >= 0.5 ? 1 : 0) === v) hit++; });
    perFold.push({ acc: hit / yt.length, auc: roc(yt, pt).auc });
    fitted.push({ model: m, test });
  }
  const accs = perFold.map((f) => f.acc), aucs = perFold.map((f) => f.auc);
  return { perFold, fitted, oof, acc: mean(accs), accSd: sd(accs), auc: mean(aucs), aucSd: sd(aucs), pooled: roc(y, Array.from(oof)) };
}

/**
 * Permutation importance (Breiman 2001; Fisher, Rudin & Dominici 2019): shuffle one column among a fold's held-out
 * rows and see how far that fold's AUC falls. Averaged over `repeats` shuffles per fold; mean and sd across folds.
 */
export function permutationImportance(X, y, cv, { repeats = 3, seed = 11 } = {}) {
  const p = X[0].length, rand = mulberry32(seed), drops = Array.from({ length: p }, () => []);
  for (const { model, test } of cv.fitted) {
    const yt = test.map((i) => y[i]), rows = test.map((i) => X[i]);
    const base = roc(yt, rows.map((r) => model.predict(r))).auc;
    for (let j = 0; j < p; j++) {
      let total = 0;
      for (let r = 0; r < repeats; r++) {
        const perm = shuffle(range(rows.length), rand);
        const scores = rows.map((row, q) => { const c = row.slice(); c[j] = rows[perm[q]][j]; return model.predict(c); });
        total += base - roc(yt, scores).auc;
      }
      drops[j].push(total / repeats);
    }
  }
  return drops.map((d) => ({ mean: mean(d), sd: d.length > 1 ? sd(d) : 0, folds: d }));
}

/**
 * The comparison the supervised page asks for: cross-validate each model (refitting only what changed since the last
 * call, per model), and permutation importance for one of them. Pure data in and out, so it can run in a worker.
 * cache: an object kept between calls. req: { version, X, y, k, models: [{key, opts}], importance: key | null }.
 */
export function compareModels(cache, { version, X, y, k = 5, models, importance = null }) {
  if (cache.version !== version) Object.assign(cache, { version, cv: new Map(), imp: new Map(), folds: stratifiedFolds(y, k, 7) });
  const run = (key, opts = {}) => {
    const id = JSON.stringify(opts), hit = cache.cv.get(key);
    if (hit && hit.id === id) return hit.cv;
    const cv = crossValidate(X, y, makeModel(key, opts), cache.folds);
    cache.cv.set(key, { id, cv });                      // keep only the latest settings per model
    cache.imp.delete(key);
    return cv;
  };
  const results = {};
  for (const { key, opts } of models) {
    const cv = run(key, opts);
    results[key] = cv.error ? { error: cv.error } : {
      auc: cv.auc, aucSd: cv.aucSd, acc: cv.acc, accSd: cv.accSd, perFold: cv.perFold,
      roc: cv.pooled.pts.map((q) => [q.fpr, q.tpr]), pooledAuc: cv.pooled.auc, oof: Array.from(cv.oof),
    };
  }
  let imp = null;
  if (importance === 'best') {                         // the model with the highest mean AUC
    importance = null;
    for (const { key } of models) if (!results[key].error && (!importance || results[key].auc > results[importance].auc)) importance = key;
  }
  if (importance) {
    const spec = models.find((m) => m.key === importance), cv = run(importance, spec ? spec.opts : {});
    if (!cv.error) {
      if (!cache.imp.has(importance)) cache.imp.set(importance, permutationImportance(X, y, cv, { repeats: 3, seed: 11 }));
      imp = { key: importance, values: cache.imp.get(importance) };
    }
  }
  return { version, results, importance: imp, folds: cache.folds.length };
}

// ================================================================ Ward hierarchical clustering
/**
 * Agglomerative clustering with Ward's criterion: start with every row alone and repeatedly merge the two clusters
 * whose merger adds least to the within-cluster sum of squares. Distances are updated with the Lance–Williams formula
 * d(i∪j, k)² = [(nᵢ+nₖ)d(i,k)² + (nⱼ+nₖ)d(j,k)² − nₖ d(i,j)²] / (nᵢ+nⱼ+nₖ), the same heights as SciPy's linkage(…, 'ward').
 * Returns merges in SciPy's form: {a, b, height, size}, singletons numbered 0…n−1 and merge s creating cluster n+s.
 */
export function ward(rows) {
  const n = rows.length;
  if (n < 2) return { error: 'Needs at least two rows.' };
  const D = new Float64Array(n * n);
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    let d = 0; const a = rows[i], b = rows[j];
    for (let q = 0; q < a.length; q++) d += (a[q] - b[q]) ** 2;
    D[i * n + j] = D[j * n + i] = Math.sqrt(d);
  }
  const size = new Int32Array(n).fill(1), id = Int32Array.from(range(n)), active = new Uint8Array(n).fill(1), merges = [];
  for (let step = 0; step < n - 1; step++) {
    let bi = -1, bj = -1, bd = Infinity;
    for (let i = 0; i < n; i++) {
      if (!active[i]) continue;
      const off = i * n;
      for (let j = i + 1; j < n; j++) if (active[j] && D[off + j] < bd) { bd = D[off + j]; bi = i; bj = j; }
    }
    const ni = size[bi], nj = size[bj];
    for (let k = 0; k < n; k++) {
      if (!active[k] || k === bi || k === bj) continue;
      const nk = size[k], dik = D[bi * n + k], djk = D[bj * n + k];
      const v = Math.sqrt(Math.max(0, ((ni + nk) * dik * dik + (nj + nk) * djk * djk - nk * bd * bd) / (ni + nj + nk)));
      D[bi * n + k] = D[k * n + bi] = v;
    }
    merges.push({ a: Math.min(id[bi], id[bj]), b: Math.max(id[bi], id[bj]), height: bd, size: ni + nj });
    size[bi] = ni + nj; id[bi] = n + step; active[bj] = 0;
  }
  return { n, merges };
}

/** Leaves in dendrogram order, left to right (each merge draws its lower-numbered cluster on the left, as SciPy does). */
export function leafOrder({ n, merges }) {
  const out = [], stack = [2 * n - 2];
  while (stack.length) { const c = stack.pop(); if (c < n) out.push(c); else { const m = merges[c - n]; stack.push(m.b, m.a); } }
  return out;
}

/** Cut the tree into k groups (undo the last k−1 merges). Groups are numbered left to right as drawn in the dendrogram. */
export function cutTree(link, k) {
  const { n, merges } = link;
  k = Math.max(1, Math.min(n, k));
  const parent = new Int32Array(2 * n - 1).fill(-1);
  for (let s = 0; s < n - k; s++) { parent[merges[s].a] = n + s; parent[merges[s].b] = n + s; }
  const top = (c) => { while (parent[c] >= 0) c = parent[c]; return c; };
  const labels = new Array(n), seen = new Map();
  for (const leaf of leafOrder(link)) { const t = top(leaf); if (!seen.has(t)) seen.set(t, seen.size); labels[leaf] = seen.get(t); }
  const lo = n - k - 1 >= 0 ? merges[n - k - 1].height : 0, hi = n - k < merges.length ? merges[n - k].height : lo;
  return { labels, k: seen.size, cutHeight: (lo + hi) / 2, roots: [...seen.keys()] };
}

/** Share of the total sum of squares that lies between groups: 1 − within / total (rows already on a common scale). */
export function betweenShare(rows, labels) {
  const p = rows[0].length, n = rows.length, k = Math.max(...labels) + 1;
  const all = new Array(p).fill(0), sums = Array.from({ length: k }, () => new Array(p).fill(0)), cnt = new Array(k).fill(0);
  rows.forEach((r, i) => { cnt[labels[i]]++; r.forEach((v, j) => { all[j] += v / n; sums[labels[i]][j] += v; }); });
  let tot = 0, within = 0;
  rows.forEach((r, i) => r.forEach((v, j) => { tot += (v - all[j]) ** 2; within += (v - sums[labels[i]][j] / cnt[labels[i]]) ** 2; }));
  return tot > 0 ? 1 - within / tot : 0;
}

/** Adjusted Rand index (Hubert & Arabie 1985): agreement between two groupings, 1 = identical, about 0 = chance. */
export function adjustedRand(a, b) {
  const n = a.length, cell = new Map(), ra = new Map(), rb = new Map();
  for (let i = 0; i < n; i++) {
    const key = `${a[i]}|${b[i]}`;
    cell.set(key, (cell.get(key) || 0) + 1); ra.set(a[i], (ra.get(a[i]) || 0) + 1); rb.set(b[i], (rb.get(b[i]) || 0) + 1);
  }
  const c2 = (x) => (x * (x - 1)) / 2;
  let sIJ = 0; for (const v of cell.values()) sIJ += c2(v);
  let sA = 0; for (const v of ra.values()) sA += c2(v);
  let sB = 0; for (const v of rb.values()) sB += c2(v);
  const expected = (sA * sB) / c2(n), max = (sA + sB) / 2;
  return max === expected ? 1 : (sIJ - expected) / (max - expected);
}

// ================================================================ principal components
/** Eigenvalues and eigenvectors of a symmetric matrix by cyclic Jacobi rotations. Vectors are the columns of `vectors`. */
export function jacobiEigen(A, { maxSweeps = 100 } = {}) {
  const n = A.length, a = A.map((r) => r.slice()), V = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  let scale = 0; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) scale += a[i][j] ** 2;
  let sweeps = 0;
  for (; sweeps < maxSweeps; sweeps++) {
    let off = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += a[i][j] ** 2;
    if (off <= 1e-30 * Math.max(scale, 1e-300)) break;
    for (let p = 0; p < n - 1; p++) for (let q = p + 1; q < n; q++) {
      if (a[p][q] === 0) continue;
      const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
      const t = (theta >= 0 ? 1 : -1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
      const c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < n; k++) { const kp = a[k][p], kq = a[k][q]; a[k][p] = c * kp - s * kq; a[k][q] = s * kp + c * kq; }
      for (let k = 0; k < n; k++) { const pk = a[p][k], qk = a[q][k]; a[p][k] = c * pk - s * qk; a[q][k] = s * pk + c * qk; }
      for (let k = 0; k < n; k++) { const kp = V[k][p], kq = V[k][q]; V[k][p] = c * kp - s * kq; V[k][q] = s * kp + c * kq; }
    }
  }
  return { values: a.map((r, i) => r[i]), vectors: V, sweeps };
}

/**
 * PCA on the correlation matrix (columns standardised with sd, ddof 1). Components are sorted by variance explained and
 * signed so each one's largest weight is positive. loadings[j][c] = correlation of column j with component c.
 */
export function pca(cols) {
  const p = cols.length, n = cols[0].length;
  if (p < 2) return { error: 'Choose at least two columns.' };
  if (n < p + 1) return { error: `Needs more rows than columns: ${n} rows for ${p} columns.` };
  const mu = cols.map(mean), sds = cols.map((c) => sd(c));
  const flat = sds.map((v, j) => (v > 0 ? -1 : j)).filter((j) => j >= 0);
  if (flat.length) return { error: 'A chosen column never varies, so it can’t be put on a common scale.', flat };
  const Z = cols.map((c, j) => c.map((v) => (v - mu[j]) / sds[j]));
  const R = Array.from({ length: p }, (_, a) => Array.from({ length: p }, (_, b) => { let s = 0; for (let i = 0; i < n; i++) s += Z[a][i] * Z[b][i]; return s / (n - 1); }));
  const eig = jacobiEigen(R);
  const order = range(p).sort((a, b) => eig.values[b] - eig.values[a]);
  const values = order.map((c) => Math.max(0, eig.values[c]));
  const vectors = range(p).map((j) => order.map((c) => eig.vectors[j][c]));       // vectors[j][c]
  for (let c = 0; c < p; c++) {
    let big = 0; for (let j = 0; j < p; j++) if (Math.abs(vectors[j][c]) > Math.abs(vectors[big][c])) big = j;
    if (vectors[big][c] < 0) for (let j = 0; j < p; j++) vectors[j][c] = -vectors[j][c];
  }
  const total = values.reduce((a, v) => a + v, 0);
  const ratio = values.map((v) => v / total);
  let run = 0; const cumulative = ratio.map((r) => (run += r));
  const loadings = vectors.map((row) => row.map((v, c) => v * Math.sqrt(values[c])));
  const scores = range(n).map((i) => range(p).map((c) => { let s = 0; for (let j = 0; j < p; j++) s += Z[j][i] * vectors[j][c]; return s; }));
  return { p, n, R, values, ratio, cumulative, vectors, loadings, scores };
}
