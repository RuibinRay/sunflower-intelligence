#!/usr/bin/env python3
"""Reference values for tests/percmap.test.mjs, computed with NumPy and scikit-learn.

A perceptual map from mean ratings (brands x attributes): standardise each attribute across brands (sample SD), take the
eigenvectors of the attributes' correlation matrix (via the SVD of the standardised matrix), fix each component's sign
so its largest-magnitude element is positive, and report shares, scores (Z V), loadings (V sqrt(lambda)) and the
projection of extra profiles. Also k-means inertia (the best of many scikit-learn starts) for the elbow."""
import json, numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

rng = np.random.default_rng(55)

def pmap(M, extra):
    M = np.asarray(M, float); B, p = M.shape
    mu = M.mean(0); sd = M.std(0, ddof=1)
    Z = (M - mu) / sd
    U, s, Vt = np.linalg.svd(Z, full_matrices=True)
    lam = np.zeros(p); lam[:len(s)] = s ** 2 / (B - 1)
    V = Vt.T.copy()
    for c in range(p):
        big = np.argmax(np.abs(V[:, c]))
        if V[big, c] < 0: V[:, c] = -V[:, c]
    keep = min(B - 1, p)                     # components beyond rank B − 1 are arbitrary; compare the real ones
    scores = Z @ V
    load = V * np.sqrt(lam)
    proj = ((np.asarray(extra, float) - mu) / sd) @ V
    return dict(M=M.tolist(), extra=np.asarray(extra, float).tolist(), keep=int(keep), mu=mu.tolist(), sd=sd.tolist(),
                values=lam[:keep].tolist(), ratio=(lam / lam.sum())[:keep].tolist(),
                scores=scores[:, :keep].tolist(), loadings=load[:, :keep].tolist(), project=proj[:, :keep].tolist())

cases = []
# the M05 brand means are built from data at test time; here, two synthetic matrices of the same shape and a taller one
for B, p in [(6, 8), (6, 8), (9, 5)]:
    M = rng.uniform(1.5, 6.5, (B, p)).round(2)
    extra = rng.uniform(1, 7, (3, p)).round(2)
    cases.append(pmap(M, extra))

# k-means: inertia for k = 2..6 on standardised blobs (best of 50 starts), so ours should match or come very close
X = np.vstack([rng.normal(m, 0.7, (60, 4)) for m in ([0, 0, 0, 0], [3, 0, 1, 0], [0, 3, 0, 1], [2, 2, 3, 2])])
Z = (X - X.mean(0)) / X.std(0, ddof=1)
km = []
for k in range(2, 7):
    m = KMeans(k, n_init=50, random_state=0).fit(Z)
    km.append(dict(k=k, inertia=float(m.inertia_), silhouette=float(silhouette_score(Z, m.labels_))))
fx = dict(cases=cases, kmeansRows=Z.tolist(), kmeans=km)
json.dump(fx, open('tests/fixtures-percmap.json', 'w'))
print('wrote tests/fixtures-percmap.json:', len(cases), 'maps,', len(km), 'k-means fits')
