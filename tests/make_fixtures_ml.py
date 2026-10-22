#!/usr/bin/env python3
"""Reference values for tests/ml.test.mjs, computed with scikit-learn, SciPy and NumPy."""
import json, numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.metrics import roc_auc_score, adjusted_rand_score
from scipy.cluster.hierarchy import linkage, fcluster

rng = np.random.default_rng(2026)

# a yes/no outcome from four continuous features (no tied values, so splits and neighbours are unambiguous)
n, p = 260, 4
X = rng.normal(0, 1, (n, p)) * [1.0, 2.0, 0.5, 3.0] + [0, 5, 1, -2]
X = X.astype(np.float32).astype(np.float64)        # scikit-learn's trees work in float32; give both sides the same values
eta = 1.4 * X[:, 0] - 0.6 * (X[:, 1] - 5) + 2.0 * np.sin(2 * X[:, 2]) + 0.1 * X[:, 3]
y = (rng.uniform(size=n) < 1 / (1 + np.exp(-eta))).astype(int)
tr, te = np.arange(0, 200), np.arange(200, n)
Xtr, ytr, Xte, yte = X[tr], y[tr], X[te], y[te]

fx = {"X": X.tolist(), "y": y.tolist(), "ntrain": 200}

# CART: shallow and deep trees, and a weighted tree (bootstrap-style integer weights, some zero).
# When two features split a node equally well, scikit-learn takes whichever its random feature order reaches first,
# so a deeper tree can have several equally good forms; collect every form seen over 400 random_state values.
trees = []
for depth, leaf in [(3, 10), (4, 5), (6, 3)]:
    forms = {}
    for rs in range(400):
        t = DecisionTreeClassifier(criterion="gini", max_depth=depth, min_samples_leaf=leaf, random_state=rs).fit(Xtr, ytr)
        key = tuple(np.round(t.predict_proba(Xte)[:, 1], 12))
        forms.setdefault(key, {"proba": t.predict_proba(Xte)[:, 1].tolist(), "importance": t.feature_importances_.tolist(),
                               "leaves": int(t.get_n_leaves()), "nodes": int(t.tree_.node_count),
                               "rootFeature": int(t.tree_.feature[0]), "rootThreshold": float(t.tree_.threshold[0])})
    trees.append({"depth": depth, "minLeaf": leaf, "forms": list(forms.values())})
fx["trees"] = trees
w = rng.multinomial(200, np.ones(200) / 200).astype(float)
tw = DecisionTreeClassifier(criterion="gini", max_depth=4, min_samples_leaf=3, random_state=0).fit(Xtr, ytr, sample_weight=w)
fx["weighted"] = {"w": w.tolist(), "depth": 4, "minLeaf": 3, "proba": tw.predict_proba(Xte)[:, 1].tolist(), "importance": tw.feature_importances_.tolist()}

# AUC with tied scores (the shallow tree's probabilities)
fx["auc_ties"] = {"y": yte.tolist(), "score": trees[0]["forms"][0]["proba"], "auc": float(roc_auc_score(yte, trees[0]["forms"][0]["proba"]))}

# k-NN on features standardised with the training rows only
sc = StandardScaler().fit(Xtr)
knn = []
for k in [1, 7, 25]:
    m = KNeighborsClassifier(n_neighbors=k).fit(sc.transform(Xtr), ytr)
    knn.append({"k": k, "proba": m.predict_proba(sc.transform(Xte))[:, 1].tolist()})
fx["knn"] = knn
fx["scaler"] = {"mean": sc.mean_.tolist(), "scale": sc.scale_.tolist()}

# Ward linkage on columns standardised with sd (ddof 1), as the site does; three loose groups in four columns
centres = np.array([[0, 0, 0, 0], [4, 1, -2, 3], [-3, 4, 2, -1]])
pts = np.vstack([c + rng.normal(0, 1.3, (25, 4)) * [1, 2, 0.7, 1.5] for c in centres])
Zs = (pts - pts.mean(0)) / pts.std(0, ddof=1)
L = linkage(Zs, method="ward")
fx["ward"] = {"rows": pts.tolist(), "Z": L.tolist(), "k3": fcluster(L, 3, "maxclust").tolist(), "k5": fcluster(L, 5, "maxclust").tolist()}
# agreement between two groupings, and the between-group share of the sum of squares for the 3-group cut
ga, gb = rng.integers(0, 4, 90), rng.integers(0, 3, 90)
gb[:40] = ga[:40] % 3
lab3 = fcluster(L, 3, "maxclust") - 1
within = sum(((Zs[lab3 == g] - Zs[lab3 == g].mean(0)) ** 2).sum() for g in range(3))
fx["ari"] = {"a": ga.tolist(), "b": gb.tolist(), "ari": float(adjusted_rand_score(ga, gb)), "self": float(adjusted_rand_score(ga, ga)),
             "between3": float(1 - within / ((Zs - Zs.mean(0)) ** 2).sum())}

# PCA on the correlation matrix: five columns, two of them strongly related
m = 150
f1, f2 = rng.normal(0, 1, m), rng.normal(0, 1, m)
P = np.column_stack([10 + 2 * f1 + rng.normal(0, .5, m), 50 + 8 * f1 + 4 * f2 + rng.normal(0, 3, m), rng.normal(3, 1, m),
                     -f2 * 5 + rng.normal(0, 2, m), 0.3 * f1 + rng.normal(0, 1, m)])
pc = PCA().fit(StandardScaler().fit_transform(P))
comps = pc.components_.copy()
for c in range(comps.shape[0]):                       # the site's sign convention: largest weight positive
    if comps[c, np.argmax(np.abs(comps[c]))] < 0: comps[c] *= -1
ev = np.sort(np.linalg.eigvalsh(np.corrcoef(P.T)))[::-1]
fx["pca"] = {"cols": P.T.tolist(), "ratio": pc.explained_variance_ratio_.tolist(), "components": comps.tolist(), "eigen": ev.tolist()}

json.dump(fx, open(__file__.replace("make_fixtures_ml.py", "fixtures-ml.json"), "w"))
print("ok", [len(t["forms"]) for t in trees], round(fx["auc_ties"]["auc"], 4), [round(v, 3) for v in L[-3:, 2]], np.round(pc.explained_variance_ratio_, 3).tolist())
