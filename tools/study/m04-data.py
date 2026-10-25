#!/usr/bin/env python3
"""Generate assets/js/data/study/m04/data.js, the data M04 Market Research uses. Every value is fictional. NumPy's PCG64
generator with fixed seeds, so the file can be rebuilt exactly; lessons, tests and the project read their figures from
case.js (which decodes and summarises this file), never from this script.

The lessons' data is Lantern's mailing list on 1 February 2027 (6,000 people, B04's figure) and the customer survey Ana
ran on it that month, the one B04's project planned: a proportional stratified sample of 2,004 invitations. Because the
whole list is generated, the "truth" a survey estimates is known, which lets the sampler widget and the lessons show
bias and sampling error against it. Each person is one character in each of several strings (codes below), so the file
stays small.

The project's data is separate (lessons must not use it): a survey of office managers in Lantern's district about an
office-coffee subscription.

Run:  python3 tools/study/m04-data.py
"""
from pathlib import Path
import json
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'assets/js/data/study/m04/data.js'
ALPHA = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx'   # 60 symbols, base-60 digits

# ---------------------------------------------------------------- the mailing list (lessons)
SIZES = [520, 1000, 150, 4330]          # subscribers, other shop customers, workshop participants, newsletter only
N = sum(SIZES)
r = np.random.default_rng(2027)
stratum = np.repeat(np.arange(4), SIZES)
r.shuffle(stratum)                       # people in sign-up order: the strata are interleaved through time
batch = (np.arange(N) * 60) // N         # 60 sign-up batches of 100 in order (clusters)
batch_effect = r.normal(0, 0.55, 60)     # some batches signed up at events that went well, some at ones that didn't

P_GROUP = {0: (0.66, 0.25), 1: (0.48, 0.34), 2: (0.52, 0.33), 3: (0.28, 0.42)}   # (promoters, passives) by stratum
def nps_group(h, b):
    pp, pa = P_GROUP[h]
    pd = 1 - pp - pa
    lp = np.log(pp / pd) + batch_effect[b]                  # shift promoters against detractors by the batch effect
    pp2 = np.exp(lp) / (np.exp(lp) + 1) * (pp + pd)
    pd2 = (pp + pd) - pp2
    u = r.random()
    return 2 if u < pp2 else (1 if u < pp2 + pa else 0)     # 2 promoter, 1 passive, 0 detractor
group = np.array([nps_group(h, b) for h, b in zip(stratum, batch)])
def score(g):
    if g == 2: return 10 if r.random() < 0.42 else 9
    if g == 1: return 8 if r.random() < 0.5 else 7
    return int(r.choice(np.arange(7), p=np.array([1, 1, 2, 3, 5, 7, 9]) / 28))
nps = np.array([score(g) for g in group])

INTENT = {0: [0.24, 0.33, 0.22, 0.13, 0.08], 1: [0.18, 0.30, 0.26, 0.16, 0.10], 2: [0.20, 0.30, 0.25, 0.15, 0.10], 3: [0.10, 0.24, 0.30, 0.21, 0.15]}
SHIFT = {2: [1.35, 1.2, 1.0, 0.75, 0.6], 1: [1, 1, 1, 1, 1], 0: [0.55, 0.75, 1.0, 1.3, 1.5]}
def intent(h, g):
    p = np.array(INTENT[h]) * np.array(SHIFT[g]); p /= p.sum()
    return int(r.choice(5, p=p)) + 1                         # 1 = definitely would buy … 5 = definitely would not
coldbrew = np.array([intent(h, g) for h, g in zip(stratum, group)])

AGE = {0: [0.30, 0.48, 0.22], 1: [0.36, 0.44, 0.20], 2: [0.50, 0.38, 0.12], 3: [0.42, 0.38, 0.20]}
age = np.array([int(r.choice(3, p=AGE[h])) for h in stratum])
HEARD = {0: [0.34, 0.22, 0.04, 0.24, 0.16], 1: [0.30, 0.20, 0.04, 0.28, 0.18], 2: [0.18, 0.10, 0.60, 0.07, 0.05], 3: [0.12, 0.46, 0.06, 0.26, 0.10]}
heard = np.array([int(r.choice(5, p=HEARD[h])) for h in stratum])
CUPS_MEAN = {0: 3.6, 1: 4.2, 2: 4.6, 3: 4.0}
cups = np.array([min(20, int(r.negative_binomial(2, 2 / (2 + CUPS_MEAN[h])))) for h in stratum])

# response propensity if invited: the stratum's rate, higher for promoters and lower for detractors
BASE = {0: 0.56, 1: 0.34, 2: 0.40, 3: 0.22}
MULT = {2: 1.2, 1: 1.0, 0: 0.75}
prop = np.array([BASE[h] * MULT[g] for h, g in zip(stratum, group)])
for h in range(4):                                           # rescale so each stratum's mean propensity is its base rate
    m = stratum == h
    prop[m] *= BASE[h] / prop[m].mean()

# ---------------------------------------------------------------- the February 2027 survey: proportional stratified sample
def proportional(sizes, n):
    raw = [n * k / sum(sizes) for k in sizes]; base = [int(np.floor(v)) for v in raw]
    left = n - sum(base)
    for i in sorted(range(len(raw)), key=lambda i: (-(raw[i] - base[i]), i))[:left]: base[i] += 1
    return base
ALLOC = proportional(SIZES, 2004)                           # 174, 334, 50, 1446
rs = np.random.default_rng(14)
status = np.zeros(N, dtype=int)                              # 0 not invited
for h in range(4):
    idx = np.flatnonzero(stratum == h)
    for i in rs.choice(idx, ALLOC[h], replace=False):
        u = rs.random()
        if u < 0.03: status[i] = 5                           # e-mail bounced (non-contact)
        else:
            v = rs.random()
            if v < prop[i]: status[i] = 2                    # complete
            elif v < prop[i] + 0.025: status[i] = 3          # partial: started, stopped before the last question
            elif v < prop[i] + 0.04: status[i] = 4           # refused (replied to say no, or unsubscribed)
            else: status[i] = 1                              # no reply
THEME = {0: [0.30, 0.10, 0.16, 0.18, 0.12, 0.08, 0.06], 1: [0.30, 0.16, 0.14, 0.14, 0.10, 0.10, 0.06], 2: [0.34, 0.12, 0.08, 0.20, 0.10, 0.10, 0.06], 3: [0.40, 0.14, 0.08, 0.16, 0.08, 0.08, 0.06]}
theme = np.array([int(rs.choice(7, p=THEME[h])) if s == 2 else 0 for h, s in zip(stratum, status)])

def code(a, alphabet='0123456789'): return ''.join(alphabet[int(x)] for x in a)

# ---------------------------------------------------------------- project: office managers in Lantern's district
ro = np.random.default_rng(31)
BANDS = ['10–49', '50–249', '250 or more']
DIRECTORY = [410, 150, 40]                                   # offices with 10+ staff in Lantern's district (fictional)
INVITED = [80, 60, 40]                                       # disproportionate: every large office, more of the mid band
RESP_RATE = [0.30, 0.42, 0.55]
ARR = ['None', 'Pod machines', 'Bean-to-cup machine', 'Filter or urn', 'Catered']
ARR_P = [[0.20, 0.38, 0.14, 0.24, 0.04], [0.06, 0.30, 0.32, 0.24, 0.08], [0.00, 0.12, 0.48, 0.20, 0.20]]
STAFF = [(10, 49, 22), (50, 249, 95), (250, 900, 380)]
INT_P = [[0.06, 0.18, 0.30, 0.26, 0.20], [0.12, 0.26, 0.30, 0.18, 0.14], [0.10, 0.30, 0.28, 0.20, 0.12]]
office = []
for b in range(3):
    k = int(ro.binomial(INVITED[b], RESP_RATE[b]))
    for _ in range(k):
        lo, hi, med = STAFF[b]
        staff = int(np.clip(round(ro.lognormal(np.log(med), 0.45)), lo, hi))
        arr = int(ro.choice(5, p=ARR_P[b]))
        spend = 0 if arr == 0 else int(round(staff * ro.lognormal(np.log({1: 9, 2: 11, 3: 6, 4: 16}[arr]), 0.35)))   # $ a month
        it = int(ro.choice(5, p=INT_P[b])) + 1
        office.append([b, staff, arr, spend, it])

js = f"""// data.js — generated by tools/study/m04-data.py (do not edit by hand). Fictional data for M04 Market Research;
// case.js decodes it, describes each field and computes every figure from it.

/** Lessons: Lantern's mailing list on 1 February 2027, one character per person in sign-up order.
 *  stratum: 0 subscriber, 1 other shop customer, 2 workshop participant (not a shop customer), 3 newsletter only.
 *  nps: the 0–10 answer each person would give to "How likely are you to recommend Lantern to a friend?" (a–k = 0–10).
 *  coldbrew: 1 definitely would buy Lantern Cold Brew … 5 definitely would not. age: 0 18–34, 1 35–54, 2 55+.
 *  heard: how they first heard of Lantern, 0 friend or family, 1 an event or catering, 2 a workshop, 3 social media,
 *  4 search or other. cups: cups of coffee bought away from home last week (base 60). batch: sign-up batch of 100 (base 60).
 *  status in the February survey: 0 not invited, 1 invited and no reply, 2 complete, 3 partial, 4 refused, 5 bounced.
 *  theme: the coded answer to "What one thing could Lantern do better?" (completes only): 0 nothing or blank, 1 price,
 *  2 delivery speed, 3 range, 4 packaging and waste, 5 website or app, 6 other.
 *  Each person's chance of completing the survey if invited (their response propensity) is not stored: case.js
 *  recomputes it from the stratum and the NPS group, as this script does (BASE × MULT, rescaled to the stratum's BASE). */
export const LIST = {{
  stratum: '{code(stratum)}',
  nps: '{code(nps, 'abcdefghijk')}',
  coldbrew: '{code(coldbrew)}',
  age: '{code(age)}',
  heard: '{code(heard)}',
  cups: '{code(cups, ALPHA)}',
  batch: '{code(batch, ALPHA)}',
  status: '{code(status)}',
  theme: '{code(theme)}',
}};

/** Project: the office-coffee survey of office managers in Lantern's district (March 2027). One row per responding office:
 *  [size band (0 10–49 staff, 1 50–249, 2 250 or more), staff, current arrangement (0 none, 1 pod machines, 2 bean-to-cup
 *  machine, 3 filter or urn, 4 catered), monthly coffee spend ($), interest in a subscription at the quoted price
 *  (1 definitely would sign up … 5 definitely would not)]. */
export const OFFICE_SURVEY = {json.dumps(office)};
"""
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(js)
print(f'wrote {OUT.relative_to(ROOT)}: list {N}, invited {int((status > 0).sum())}, completes {int((status == 2).sum())}, offices {len(office)}')
print('alloc', ALLOC, 'completes by stratum', [int(((stratum == h) & (status == 2)).sum()) for h in range(4)])
print('true promoter share', round(float((group == 2).mean()), 4), 'true NPS', round(float(100 * ((group == 2).mean() - (group == 0).mean())), 2))
print('office responses by band', [sum(1 for o in office if o[0] == b) for b in range(3)])
