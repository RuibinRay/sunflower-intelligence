#!/usr/bin/env python3
"""Generate assets/js/data/study/m05/data.js, the data M05 Market Segmentation and Positioning uses. Every value is
fictional. NumPy's PCG64 generator with fixed seeds, so the file can be rebuilt exactly; lessons, tests and the project
read their figures from case.js (which decodes and summarises this file), never from this script.

Lessons: the Harbour City coffee-drinker needs study Ana commissioned in May 2027. 640 adults who drink coffee at least
once a week answered an online panel survey with quotas on age band (a non-probability sample: M04's caveats
apply). Each rated how much eight things matter when they choose coffee (1 not at all, 7 essential), their "ideal
coffee" and three of six brands on the same eight attributes, a three-item local-loyalty scale, cups a week, monthly
spend, where they mostly get coffee, demographics, awareness of Lantern and intent to buy Lantern Cold Brew.
Five kinds of coffee drinker are planted with noise and a personal scale-use offset, so k-means finds real but
overlapping structure, and the true type is kept (lessons may use it only to show how well a method recovers it, as
something Ana could never see).

Project (lessons must not use it): a survey about Lantern's barista workshops: 210 past attendees and newsletter
readers, six workshop needs, four planted kinds, ideal and provider ratings for four workshop options.

Run:  python3 tools/study/m05-data.py
"""
from pathlib import Path
import json
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'assets/js/data/study/m05/data.js'
ALPHA = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx'   # 60 symbols, base-60 digits

def clip_round(x, lo, hi):
    return np.clip(np.rint(x), lo, hi).astype(int)

def digits(a):
    return ''.join(str(int(v)) for v in a)

def b60(a):
    return ''.join(ALPHA[int(v)] for v in a)

# ---------------------------------------------------------------- the needs study (lessons)
r = np.random.default_rng(5205)
N = 640
NEEDS = ['taste', 'price', 'convenience', 'sustainability', 'energy', 'health', 'local', 'novelty']
# five kinds of coffee drinker: importance means (1–7), shares, and what goes with them
TYPES = [
    # 0 Connoisseurs: taste and local, not price
    dict(share=0.18, m=[6.5, 2.9, 3.4, 4.6, 3.3, 3.6, 6.1, 4.9], cups=9, spend=72,
         age=[0.10, 0.38, 0.38, 0.14], inc=[0.06, 0.24, 0.38, 0.32], hh=[0.30, 0.40, 0.20, 0.10],
         src=[0.62, 0.30, 0.04, 0.04], area=[0.10, 0.12, 0.14, 0.18, 0.46], aware=0.30, bought=0.55,
         intent=[0.15, 0.30, 0.27, 0.16, 0.12]),
    # 1 Budget routine: price first, home and supermarket
    dict(share=0.26, m=[3.6, 6.4, 4.8, 2.7, 3.9, 3.1, 2.4, 2.3], cups=12, spend=24,
         age=[0.24, 0.22, 0.26, 0.28], inc=[0.40, 0.38, 0.16, 0.06], hh=[0.34, 0.22, 0.30, 0.14],
         src=[0.08, 0.52, 0.34, 0.06], area=[0.26, 0.24, 0.22, 0.18, 0.10], aware=0.05, bought=0.20,
         intent=[0.02, 0.08, 0.24, 0.32, 0.34]),
    # 2 On-the-go energy: caffeine and convenience, many cups, offices and RTD
    dict(share=0.22, m=[4.1, 4.4, 6.4, 2.9, 6.3, 2.8, 2.6, 3.5], cups=16, spend=58,
         age=[0.36, 0.44, 0.16, 0.04], inc=[0.18, 0.40, 0.30, 0.12], hh=[0.42, 0.30, 0.16, 0.12],
         src=[0.28, 0.10, 0.34, 0.28], area=[0.16, 0.14, 0.24, 0.16, 0.30], aware=0.10, bought=0.30,
         intent=[0.08, 0.22, 0.30, 0.22, 0.18]),
    # 3 Mindful: health and sustainability
    dict(share=0.16, m=[4.9, 4.0, 3.6, 6.3, 2.7, 6.2, 4.4, 3.4], cups=6, spend=40,
         age=[0.12, 0.40, 0.34, 0.14], inc=[0.10, 0.34, 0.36, 0.20], hh=[0.18, 0.36, 0.38, 0.08],
         src=[0.32, 0.46, 0.14, 0.08], area=[0.22, 0.24, 0.18, 0.22, 0.14], aware=0.15, bought=0.40,
         intent=[0.07, 0.21, 0.32, 0.22, 0.18]),
    # 4 Explorers: novelty and variety, young, cafés and RTD trial
    dict(share=0.18, m=[5.0, 3.9, 4.2, 3.8, 4.3, 3.4, 4.0, 6.5], cups=8, spend=46,
         age=[0.58, 0.30, 0.09, 0.03], inc=[0.32, 0.40, 0.20, 0.08], hh=[0.40, 0.24, 0.08, 0.28],
         src=[0.46, 0.12, 0.36, 0.06], area=[0.14, 0.16, 0.18, 0.16, 0.36], aware=0.14, bought=0.35,
         intent=[0.10, 0.25, 0.31, 0.20, 0.14]),
]
assert abs(sum(t['share'] for t in TYPES) - 1) < 1e-9
seg = r.choice(5, size=N, p=[t['share'] for t in TYPES])

def pick(p):
    return int(r.choice(len(p), p=np.array(p) / np.sum(p)))

area = np.array([pick(TYPES[s]['area']) for s in seg])       # North, South, East, West, Central
age = np.array([pick(TYPES[s]['age']) for s in seg])         # 18–29, 30–44, 45–59, 60+
household = np.array([pick(TYPES[s]['hh']) for s in seg])    # single, couple, family with children, sharing
income = np.array([pick(TYPES[s]['inc']) for s in seg])      # under $40k, $40–80k, $80–120k, over $120k
source = np.array([pick(TYPES[s]['src']) for s in seg])      # café, home-brewed, supermarket or RTD, office or vending

offset = r.normal(0, 0.35, N)                                # personal scale use: some rate everything higher
needs = np.zeros((N, 8), dtype=int)
for i, s in enumerate(seg):
    needs[i] = clip_round(np.array(TYPES[s]['m']) + offset[i] + r.normal(0, 0.75, 8), 1, 7)

cups = np.array([min(40, max(1, int(r.negative_binomial(3, 3 / (3 + TYPES[s]['cups']))))) for s in seg])
spend = np.array([int(round(np.exp(r.normal(np.log(TYPES[s]['spend']), 0.42)))) for s in seg])   # $ a month
spend = np.clip(spend, 2, 400)

# the local-loyalty scale (1–5): three items driven by one trait, higher for connoisseurs
LOYAL_MEAN = [4.0, 2.4, 2.6, 3.4, 3.1]
trait = np.array([r.normal(LOYAL_MEAN[s], 0.7) for s in seg])
loyal = np.stack([clip_round(trait + r.normal(0, 0.55, N), 1, 5) for _ in range(3)], axis=1)

aware = np.array([int(r.random() < TYPES[s]['aware']) for s in seg])
bought = np.array([int(aware[i] and r.random() < TYPES[s]['bought']) for i, s in enumerate(seg)])   # of those aware, bought in the last year
coldbrew = np.array([pick(TYPES[s]['intent']) + 1 for s in seg])   # 1 definitely would buy … 5 definitely would not

# brand perceptions on the same eight attributes (1–7): the brand's true position plus the rater's noise and offset
BRANDS = ['Lantern', 'Summit Brew', 'Daily Grind RTD', 'Arcadia Coffee', 'Harbour Basics', 'Corner Cup']
POS = np.array([
    [6.1, 3.4, 3.0, 5.6, 4.0, 4.6, 6.5, 5.2],   # Lantern: craft, local, ethical; hard to find, dear
    [5.3, 3.3, 5.4, 4.0, 4.9, 3.7, 2.2, 4.4],   # Summit Brew: premium national RTD
    [3.5, 5.9, 6.2, 2.7, 5.5, 2.5, 1.7, 2.9],   # Daily Grind RTD: cheap, everywhere
    [4.7, 3.8, 4.0, 6.1, 3.5, 6.1, 3.1, 4.0],   # Arcadia Coffee: organic, low sugar
    [3.1, 6.4, 6.0, 3.0, 3.8, 3.2, 2.3, 2.2],   # Harbour Basics: a supermarket own label
    [4.6, 4.2, 6.3, 3.3, 5.0, 3.1, 2.6, 4.6],   # Corner Cup: a café chain on every corner
])
AWARE_OF = np.array([0.0, 0.60, 0.75, 0.50, 0.85, 0.90])     # chance of knowing each brand (M02's awareness; Lantern uses `aware`)
rated = np.zeros((N, 3), dtype=int)
ratings = np.zeros((N, 3, 8), dtype=int)
for i in range(N):
    known = [b for b in range(6) if (aware[i] if b == 0 else r.random() < AWARE_OF[b])]
    while len(known) < 3:                                       # everyone rates three brands they know
        b = int(r.integers(1, 6))
        if b not in known: known.append(b)
    pickb = r.choice(known, size=3, replace=False)
    pickb.sort()
    rated[i] = pickb
    for k, b in enumerate(pickb):
        ratings[i, k] = clip_round(POS[b] + 0.6 * offset[i] + r.normal(0, 0.9, 8), 1, 7)

# the respondent's ideal coffee on the eight attributes: what matters most, pulled towards the middle of the scale
ideal = clip_round(4 + 0.75 * (needs - 4) + r.normal(0, 0.6, (N, 8)), 1, 7)

# ---------------------------------------------------------------- the project: Lantern's barista workshops
rp = np.random.default_rng(6211)
NP = 210
WNEEDS = ['skills', 'social', 'gift', 'career', 'value', 'schedule']
WTYPES = [
    dict(share=0.35, m=[6.4, 3.6, 2.4, 2.4, 4.2, 4.6], wtp=140, past=0.52, age=[0.18, 0.40, 0.30, 0.12]),  # home enthusiasts
    dict(share=0.24, m=[3.6, 4.6, 6.5, 2.0, 4.0, 3.8], wtp=160, past=0.22, age=[0.12, 0.34, 0.36, 0.18]),  # gift buyers
    dict(share=0.15, m=[6.1, 2.8, 1.8, 6.6, 3.6, 5.5], wtp=235, past=0.40, age=[0.62, 0.30, 0.06, 0.02]), # aspiring baristas
    dict(share=0.26, m=[3.8, 6.5, 3.6, 1.9, 5.6, 5.2], wtp=90, past=0.36, age=[0.40, 0.38, 0.16, 0.06]),  # social groups
]
assert abs(sum(t['share'] for t in WTYPES) - 1) < 1e-9
wseg = rp.choice(4, size=NP, p=[t['share'] for t in WTYPES])
woff = rp.normal(0, 0.3, NP)
wneeds = np.zeros((NP, 6), dtype=int)
for i, s in enumerate(wseg):
    wneeds[i] = clip_round(np.array(WTYPES[s]['m']) + woff[i] + rp.normal(0, 0.8, 6), 1, 7)
wage = np.array([int(rp.choice(4, p=WTYPES[s]['age'])) for s in wseg])
wpast = np.array([int(rp.random() < WTYPES[s]['past']) for s in wseg])
wtp = np.array([int(5 * round(np.exp(rp.normal(np.log(WTYPES[s]['wtp']), 0.25)) / 5)) for s in wseg])
PROVIDERS = ['Lantern Workshops', 'Calder College', 'Kettle Lane Coffee Club', 'CremaClass online']
WPOS = np.array([
    [5.6, 5.2, 5.4, 3.4, 3.9, 3.6],   # Lantern: hands-on, fun, giftable; Saturdays only, $125
    [6.2, 3.0, 3.6, 6.4, 3.2, 4.4],   # Calder College (M01): six evenings, a certificate, $210
    [3.8, 6.3, 4.2, 1.8, 5.6, 5.4],   # Kettle Lane: social tasting evenings, cheap
    [3.2, 1.6, 1.4, 2.2, 6.8, 6.9],   # CremaClass (M01): online videos, $39, any time
])
wratings = np.zeros((NP, 4, 6), dtype=int)
for i in range(NP):
    for b in range(4):
        wratings[i, b] = clip_round(WPOS[b] + 0.5 * woff[i] + rp.normal(0, 0.85, 6), 1, 7)
wideal = clip_round(4 + 0.75 * (wneeds - 4) + rp.normal(0, 0.6, (NP, 6)), 1, 7)

# ---------------------------------------------------------------- write
data = {
    'needsStudy': {
        'n': N, 'needs': NEEDS, 'brands': BRANDS,
        'seg': digits(seg), 'area': digits(area), 'age': digits(age), 'household': digits(household),
        'income': digits(income), 'source': digits(source), 'aware': digits(aware), 'bought': digits(bought),
        'coldbrew': digits(coldbrew), 'cups': b60(cups), 'spend': spend.tolist(),
        'needsBy': [digits(needs[:, j]) for j in range(8)],
        'loyal': [digits(loyal[:, j]) for j in range(3)],
        'ideal': [digits(ideal[:, j]) for j in range(8)],
        'rated': [digits(rated[:, k]) for k in range(3)],
        'ratings': [[digits(ratings[:, k, j]) for j in range(8)] for k in range(3)],
    },
    'workshops': {
        'n': NP, 'needs': WNEEDS, 'providers': PROVIDERS,
        'seg': digits(wseg), 'age': digits(wage), 'past': digits(wpast), 'wtp': wtp.tolist(),
        'needsBy': [digits(wneeds[:, j]) for j in range(6)],
        'ideal': [digits(wideal[:, j]) for j in range(6)],
        'ratings': [[digits(wratings[:, b, j]) for j in range(6)] for b in range(4)],
    },
}
OUT.parent.mkdir(parents=True, exist_ok=True)
header = ('// data.js — generated by tools/study/m05-data.py (do not edit by hand). Fictional data for M05 Market Segmentation and\n'
          '// Positioning: the May 2027 coffee-drinker needs study (lessons) and the barista-workshop survey (project only).\n'
          '// Strings hold one character per respondent; case.js decodes them.\n')
OUT.write_text(header + 'export const DATA = ' + json.dumps(data, separators=(',', ':')) + ';\n')
print(f'wrote {OUT.relative_to(ROOT)}: needs study {N}, workshops {NP}')
print('segment sizes', np.bincount(seg, minlength=5).tolist(), 'workshop kinds', np.bincount(wseg, minlength=4).tolist())
