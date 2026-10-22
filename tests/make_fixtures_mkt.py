#!/usr/bin/env python3
"""Reference values for tests/mkt.test.mjs (market map and segmentation), from NumPy, pandas and scikit-learn.
Run from the repository root:  python3 tests/make_fixtures_mkt.py   (needs node on the PATH for the survey)."""
import json, subprocess, pathlib, numpy as np, pandas as pd
from sklearn.metrics.pairwise import haversine_distances
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

ROOT = pathlib.Path(__file__).resolve().parent.parent
R = 6371.0088
fx = {}

# ---------------------------------------------------------------- great-circle distance (scikit-learn's haversine)
pairs = [((51.5072, -0.1276), (40.7128, -74.0060)),   # London – New York
         ((-33.8688, 151.2093), (-33.4489, -70.6693)), # Sydney – Santiago
         ((35.6762, 139.6503), (35.6762, 139.6503)),    # same place
         ((0.0, 0.0), (0.0, 179.9)),                    # nearly antipodal on the equator
         ((64.1466, -21.9426), (-41.2866, 174.7756))]   # Reykjavík – Wellington
fx["haversine"] = [[list(a), list(b), float(haversine_distances(np.radians([a, b]))[0, 1] * R)] for a, b in pairs]

# ---------------------------------------------------------------- growth
fx["cagr"] = [[e, s, y, (e / s) ** (1 / y) - 1] for e, s, y in [(150.0, 100.0, 5), (80.0, 100.0, 5), (2.7e13, 2.06e13, 5), (1.0, 1.0, 3)]]

# ---------------------------------------------------------------- rescaling: optional log, cap at the 5th/95th percentile, min–max to 0–100
rng = np.random.default_rng(7)
raw = np.concatenate([rng.lognormal(3, 1.2, 60), [5000.0, 0.01]])
def rescale(v, log=False, cap=(0.05, 0.95), higher=True):
    t = np.log(v) if log else np.asarray(v, float)
    lo, hi = (np.percentile(t, [cap[0] * 100, cap[1] * 100]) if cap else (t.min(), t.max()))
    x = (np.clip(t, lo, hi) - lo) / (hi - lo) * 100
    return (x if higher else 100 - x).tolist()
fx["rescale"] = {"values": raw.tolist(), "plain": rescale(raw), "log": rescale(raw, log=True), "lower": rescale(raw, higher=False), "nocap": rescale(raw, cap=None)}

# ---------------------------------------------------------------- attractiveness on the real map data
doc = json.load(open(ROOT / "assets/data/world-markets.json"))
df = pd.DataFrame([c for c in doc["countries"] if c.get("gdp") is not None])
df["gdppc"] = df.gdp / df["pop"]
df["growth"] = (df.gdp / df.gdp0) ** (1 / 5) - 1
df["popGrowth"] = (df["pop"] / df.pop0) ** (1 / 5) - 1
def score(d, w):
    keys = [k for k in w if w[k][0] > 0]
    d = d.dropna(subset=keys)
    tot = sum(w[k][0] for k in keys)
    s = sum(w[k][0] / tot * np.array(rescale(d[k].values, log=w[k][1])) for k in keys)
    return dict(zip(d.iso, s.tolist()))
default = {"gdp": (35, True), "gdppc": (25, True), "growth": (25, False), "popGrowth": (15, False)}
alt = {"gdp": (0, True), "gdppc": (60, True), "growth": (40, False), "popGrowth": (0, False)}
fx["attract"] = {"default": score(df, default), "europe": score(df[df.r == "Europe"], default), "alt": score(df, alt),
                 "measures": {r.iso: [r.gdp, r.gdppc, r.growth, r["pop"], r.popGrowth] for _, r in df.head(12).iterrows()},
                 "n": int(len(df))}

# ---------------------------------------------------------------- segment profiles: index vs average, sizes, spend shares
X = rng.integers(1, 8, size=(90, 4)).astype(float)
spend = rng.lognormal(5, 0.5, 90).round(0)
lab = rng.integers(0, 3, 90)
d = pd.DataFrame(X, columns=list("abcd")); d["lab"] = lab; d["spend"] = spend
idx = (d.groupby("lab")[list("abcd")].mean() / d[list("abcd")].mean() * 100)
g = d.groupby("lab")
fx["profile"] = {"X": X.T.tolist(), "spend": spend.tolist(), "labels": lab.tolist(), "index": idx.values.tolist(),
                 "n": g.size().tolist(), "spendShare": (g.spend.sum() / spend.sum()).tolist(), "perHead": g.spend.mean().tolist()}

# needs fit and targeting score, written straight from their definitions
cent = rng.normal(0, 0.8, (4, 6)); strengths = np.array([-1, 1, 0, 0, 0, 1])
fit = cent @ strengths / np.abs(strengths).sum()
share = np.array([0.3, 0.25, 0.25, 0.2]); head = np.array([120.0, 300.0, 210.0, 160.0])
sizeS = share / share.max() * 100; spendS = head / head.max() * 100; fitS = 50 + 50 * fit / np.abs(fit).max()
w = np.array([30, 30, 40]) / 100
fx["target"] = {"centres": cent.tolist(), "strengths": strengths.tolist(), "fit": fit.tolist(), "share": share.tolist(), "perHead": head.tolist(),
                "total": (w[0] * sizeS + w[1] * spendS + w[2] * fitS).tolist()}

# ---------------------------------------------------------------- k-means on the example survey (scikit-learn, many restarts)
csv = subprocess.run(["node", "--input-type=module", "-e",
                      "import { shopperSurvey } from './assets/js/core/market.js'; process.stdout.write(shopperSurvey().csv);"],
                     cwd=ROOT, capture_output=True, text=True, check=True).stdout
sv = pd.read_csv(pd.io.common.StringIO(csv))
needs = ["price", "quality", "convenience", "sustainability", "brand", "advice"]
Z = ((sv[needs] - sv[needs].mean()) / sv[needs].std(ddof=1)).values      # the site standardises with the sample SD
km = {}
for k in (3, 5):
    m = KMeans(n_clusters=k, n_init=100, random_state=0).fit(Z)
    km[str(k)] = {"inertia": float(m.inertia_), "silhouette": float(silhouette_score(Z, m.labels_))}
fx["survey"] = {"rows": int(len(sv)), "kmeans": km, "means": sv[needs].mean().tolist()}

json.dump(fx, open(ROOT / "tests/fixtures-mkt.json", "w"), indent=1)
print("ok", len(fx["attract"]["default"]), "countries scored;", {k: round(v["inertia"], 2) for k, v in km.items()})
