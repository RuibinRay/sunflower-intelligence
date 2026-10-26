// percmap.js — perceptual maps and segment helpers for M05 Market Segmentation and Positioning.
//
// A perceptual map here is built from mean ratings: each brand's average rating on each attribute (brands × attributes).
// The attributes are standardised across brands (mean 0, sample standard deviation 1), and the principal components of
// their correlation matrix give the map's axes: brands are placed by their component scores and each attribute is drawn
// as a vector whose coordinates are its correlations with the components (a biplot). A segment's ideal point is its
// members' average "ideal coffee" profile, standardised with the brands' means and standard deviations and projected
// with the same components, so brands and ideals share one space.
//
// Also here: the typing tool (assign a new respondent to the nearest segment centre), the elbow (k-means within-cluster
// sum of squares for each k) and a few small helpers. Pure functions; tested in tests/percmap.test.mjs against NumPy.
import { jacobiEigen } from './ml.js?v=17';
import { kmeans, silhouette } from './classify.js?v=17';

const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const mean = (xs) => sum(xs) / xs.length;
const sdev = (xs) => { const m = mean(xs); return Math.sqrt(sum(xs.map((v) => (v - m) ** 2)) / (xs.length - 1)); };

/** Mean rating of each brand on each attribute from rating records [{ brand, ratings: [a1, a2, …] }]. */
export function brandMeans(records, nBrands, nAttr) {
  const tot = Array.from({ length: nBrands }, () => new Array(nAttr).fill(0)), counts = new Array(nBrands).fill(0);
  for (const { brand, ratings } of records) { counts[brand]++; for (let a = 0; a < nAttr; a++) tot[brand][a] += ratings[a]; }
  return { means: tot.map((row, b) => row.map((v) => (counts[b] ? v / counts[b] : NaN))), counts };
}

/**
 * Principal components of the attributes across brands. `means` is brands × attributes. Returns the standardisation
 * (mu, sd per attribute), the eigenvalues and their shares, the component vectors (attribute × component), the
 * loadings (each attribute's correlation with each component), the brands' scores, and `project(profile)`, which places
 * any profile on the same scale (an ideal point, a brand you are planning). Each component's sign is fixed so that its
 * largest-magnitude element is positive, as in ml.js's pca.
 */
export function perceptualMap(means) {
  const B = means.length, p = means[0].length;
  if (B < 3) return { error: 'A map needs at least three brands.' };
  const mu = Array.from({ length: p }, (_, a) => mean(means.map((r) => r[a])));
  const sd = Array.from({ length: p }, (_, a) => sdev(means.map((r) => r[a])));
  if (sd.some((v) => !(v > 0))) return { error: 'An attribute is rated the same for every brand, so it can’t be standardised.' };
  const Z = means.map((r) => r.map((v, a) => (v - mu[a]) / sd[a]));
  const R = Array.from({ length: p }, (_, i) => Array.from({ length: p }, (_, j) => sum(Z.map((z) => z[i] * z[j])) / (B - 1)));
  const eig = jacobiEigen(R);
  const order = Array.from({ length: p }, (_, c) => c).sort((x, y) => eig.values[y] - eig.values[x]);
  const values = order.map((c) => Math.max(0, eig.values[c]));
  const vectors = Array.from({ length: p }, (_, a) => order.map((c) => eig.vectors[a][c]));
  for (let c = 0; c < p; c++) {
    let big = 0; for (let a = 0; a < p; a++) if (Math.abs(vectors[a][c]) > Math.abs(vectors[big][c])) big = a;
    if (vectors[big][c] < 0) for (let a = 0; a < p; a++) vectors[a][c] = -vectors[a][c];
  }
  const total = sum(values), ratio = values.map((v) => v / total);
  let run = 0; const cumulative = ratio.map((r) => (run += r));
  const loadings = vectors.map((row) => row.map((v, c) => v * Math.sqrt(values[c])));
  const place = (z) => order.map((_, c) => sum(z.map((v, a) => v * vectors[a][c])));
  const scores = Z.map(place);
  const project = (profile) => place(profile.map((v, a) => (v - mu[a]) / sd[a]));
  return { B, p, mu, sd, Z, R, values, ratio, cumulative, vectors, loadings, scores, project };
}

/** Euclidean distance between two points in the first `dims` dimensions. */
export const distance = (a, b, dims = 2) => Math.sqrt(sum(Array.from({ length: dims }, (_, c) => (a[c] - b[c]) ** 2)));

/** Distance from every brand to every ideal point on the map: rows = ideals, columns = brands. */
export function idealDistances(map, ideals, dims = 2) {
  const pts = ideals.map((p) => map.project(p));
  return pts.map((q) => map.scores.map((s) => distance(s, q, dims)));
}

/** The typing tool: the index of the nearest centre (squared Euclidean distance) for each row. */
export function nearestCentroid(centres, rows) {
  return rows.map((r) => {
    let best = 0, bd = Infinity;
    centres.forEach((c, g) => { let d = 0; for (let j = 0; j < r.length; j++) d += (r[j] - c[j]) ** 2; if (d < bd) { bd = d; best = g; } });
    return best;
  });
}

/** The share of rows a classifier assigns to the same group as the reference labels (accuracy). */
export const agreement = (a, b) => a.filter((v, i) => v === b[i]).length / a.length;

/** k-means for each k: within-cluster sum of squares (the elbow) and, optionally, the mean silhouette. */
export function elbow(rows, ks, { seed = 1888, restarts = 12, withSilhouette = true } = {}) {
  return ks.map((k) => {
    const km = kmeans(rows, k, { seed, restarts });
    return { k, inertia: km.inertia, sizes: km.sizes, silhouette: withSilhouette && k > 1 ? silhouette(rows, km.labels) : NaN, km };
  });
}

/** Weighted attractiveness score of each segment: Σ w_f × s_f ÷ Σ w_f, where each factor's scores are 0–100. */
export function weightedScore(factorScores, weights) {
  const W = sum(weights);
  return factorScores[0].map((_, g) => sum(factorScores.map((f, k) => weights[k] * f[g])) / W);
}
