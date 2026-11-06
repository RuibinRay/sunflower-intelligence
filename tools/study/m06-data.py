#!/usr/bin/env python3
"""Generate assets/js/data/study/m06/data.js, the data M06 Customer Analytics and RFM uses. Every value is fictional.
NumPy's PCG64 generator with fixed seeds, so the file rebuilds exactly; lessons, tests and the project read their figures
from case.js (which decodes and checks this file), never from this script.

LESSONS: the cafés' loyalty-app members (noncontractual: a member can stop coming without telling anyone).
  Every member who joined at Harbourside or Millbrook from 1 March to 31 December 2027 (the joins per café per day are
  exactly B05's log: each day's rise in loyalty_members), and every visit each made with the app until 31 December.
  The October joiners are B06's 225 members, with B06's near, notifications and first ticket, and B06's 'returned' is
  true exactly when the member visited again within 30 days of joining. The first visit is the join (the app is set up
  at the till), and its spend is the first ticket.
  Planted (the behaviour is a BG/NBD-style process: while 'alive' a member visits at their own rate, scaled by the
  café's daily footfall; after each visit they may drop out for good):
    - visit rate per week: gamma (shape 1.4) with mean 0.62 at Millbrook and 0.42 at Harbourside, ×1.6 if near,
      ×1.15 with notifications on, ×0.8 for weekend joiners, ×exp(0.04 × (first ticket − café mean));
    - drop-out chance after each visit: beta(1.3, 9) (mean 0.126), beta(1.3, 12) with notifications on;
    - 6% of a member's visits are at the other café; spend per visit varies around the member's own mean (lognormal,
      sd 0.22), which varies around the café's average ticket (Harbourside $5.47, Millbrook $3.32, from B05);
    - every visit fits the café's day: a visit that would take members past 60% of the day's transactions or sales
      isn't made (joins always are), so members are at most 65% of any day's transactions and sales.
  Lessons use calibration data to 31 October 2027 and the holdout of November–December for churn prediction.

PROJECT (lessons must not use it): the online shop's coffee subscriptions (contractual: a subscriber cancels).
  Every subscription since Lantern opened (1 March 2026) to 31 December 2027. The 27 spring 2026 subscribers are B03's
  (same customer IDs, start dates, products, quantities and prices); billing and delivery are monthly on the start
  day's date (capped at the 28th), at 90% of list price (B03); the 2026 relaunch offer (1 July – 30 September 2026)
  halved the first month. Active subscribers number exactly 120 on 31 December 2026 (B04's December survey invited
  all 120) and follow B05's weekly series through 2027: each week's joins and cancellations are B05's.
  Planted: each subscriber's monthly cancellation chance θ is fixed and drawn from a beta distribution that depends on
  how they joined (sBG truth): relaunch offer beta(0.5, 2.2) (mean 18.5% in the first month); shop beta(0.35, 9)
  (3.7%); referral beta(0.3, 11) (2.7%); café, from March 2027, beta(0.4, 9) (4.3%). Joins: 40, 30 and 25 on the
  relaunch offer in July–September 2026, 14 and 12 from the shop in October and November, and in December as many as
  bring 31 December to 120. In 2026 a subscriber cancels before each renewal with probability θ. In 2027 the weekly
  cancellations are drawn from the subscribers due to renew that week, in proportion to θ, so B05's counts hold
  exactly; the planted θ would expect about 65 cancellation requests in 2027, and B05's 52 cancellations plus the
  saves come to about that, so the matching barely bends the planted model.
  The save-offer test (from 1 March 2027): when a subscriber asked to cancel, the shop randomly (50/50) either
  cancelled or offered to skip the next month instead; 45% of those offered accepted (planted), skipped one delivery
  and stayed on with the same θ.

Run:  python3 tools/study/m06-data.py
"""
from pathlib import Path
import json, subprocess, datetime as dt
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'assets/js/data/study/m06/data.js'
STUDY = ROOT / 'assets/js/data/study'

def node_json(expr):
    js = f"Promise.all([import('./b03/case.js'), import('./b05/case.js'), import('./b06/case.js')]).then(([B3, B5, B6]) => console.log(JSON.stringify({expr})))"
    return json.loads(subprocess.run(['node', '-e', js], cwd=STUDY, capture_output=True, text=True, check=True).stdout)

SRC = node_json("{ oc: B3.ORDER_COLUMNS, orders: B3.ORDERS, products: B3.PRODUCTS, cc: B5.CAFE_COLUMNS, cafe: B5.CLEAN_ROWS, "
                "sc: B5.SHOP_COLUMNS, weeks: B5.SHOP_WEEKS, mc: B6.MEMBER_COLUMNS, members: B6.MEMBERS }")
D0 = dt.date(2027, 3, 1)
day = lambda iso: (dt.date.fromisoformat(iso) - D0).days          # day 0 = 1 March 2027
ci = {c: i for i, c in enumerate(SRC['cc'])}
CAFES = ['Harbourside', 'Millbrook']
LOG = {c: [r for r in SRC['cafe'] if r[ci['cafe']] == c] for c in CAFES}
NDAYS = len(LOG['Harbourside'])                                    # 306: 1 March – 31 December 2027
assert NDAYS == 306 and all(LOG[c][k][ci['date']] == LOG['Harbourside'][k][ci['date']] for c in CAFES for k in range(NDAYS))
DATES = [r[ci['date']] for r in LOG['Harbourside']]
foot = {c: np.array([r[ci['footfall']] for r in LOG[c]], float) for c in CAFES}
tx_cap = {c: np.array([r[ci['transactions']] for r in LOG[c]]) for c in CAFES}
sales_cap = {c: np.array([r[ci['sales']] for r in LOG[c]]) for c in CAFES}
ticket = {c: sales_cap[c].sum() / tx_cap[c].sum() for c in CAFES}   # $5.47 and $3.32
fidx = {c: foot[c] / foot[c].mean() for c in CAFES}

# ================================================================ lessons: loyalty-app members
b6 = {c: i for i, c in enumerate(SRC['mc'])}
oct_rows = SRC['members']
rm = np.random.default_rng(6065)
joins = []                                                         # (day, cafe) in B06's order: date, then café
for k in range(NDAYS):
    for c in CAFES:
        lm = LOG[c][k][ci['loyalty_members']] - (LOG[c][k - 1][ci['loyalty_members']] if k else 0)
        joins += [(k, c)] * lm
oct_iter = iter(oct_rows)
members = []
for k, c in joins:
    if DATES[k].startswith('2027-10'):
        r = next(oct_iter)
        assert r[b6['joined']] == DATES[k] and r[b6['cafe']] == c
        m = dict(day=k, cafe=c, near=r[b6['near']], notif=r[b6['notifications']], first=r[b6['first_ticket']], returned=r[b6['returned']], b06=r[b6['member']])
    else:
        near = int(rm.random() < (0.45 if c == 'Millbrook' else 0.3)); notif = int(rm.random() < 0.55)
        t0 = 5.35 if c == 'Harbourside' else 3.27                   # B06's first-ticket rule
        first = round(float(np.clip(rm.normal(t0 + 0.8, 1.3), 2.5, 14)) * 20) / 20
        m = dict(day=k, cafe=c, near=near, notif=notif, first=first, returned=None, b06='')
    members.append(m)
assert next(oct_iter, None) is None

CAPPED = [0]
CAP = 0.6                                                          # members are at most 60% of a day's transactions and sales
used_tx = {c: np.zeros(NDAYS, int) for c in CAFES}
used_sales = {c: np.zeros(NDAYS) for c in CAFES}
def simulate(m, rng):
    c, o = m['cafe'], ('Millbrook' if m['cafe'] == 'Harbourside' else 'Harbourside')
    wk = dt.date.fromisoformat(DATES[m['day']]).weekday() >= 5
    base = 0.62 if c == 'Millbrook' else 0.42
    lam = rng.gamma(1.4, base / 1.4) * (1.6 if m['near'] else 1) * (1.15 if m['notif'] else 1) * (0.8 if wk else 1) * np.exp(0.04 * (m['first'] - (5.35 if c == 'Harbourside' else 3.27) - 0.8))
    p = rng.beta(1.3, 12 if m['notif'] else 9)
    mu = ticket[c] * rng.lognormal(0, 0.18)
    visits = [(m['day'], c, m['first'])]
    if rng.random() < p: return visits                              # dropped out after joining
    for k in range(m['day'] + 1, NDAYS):
        here = c if rng.random() > 0.06 else o
        if rng.random() < min(0.9, lam / 7 * fidx[here][k]):
            amt = round(float(np.clip(mu * (ticket[here] / ticket[c]) ** 0.5 * rng.lognormal(0, 0.22), 1.5, 30)) * 20) / 20
            if used_tx[here][k] + 1 > CAP * tx_cap[here][k] or used_sales[here][k] + amt > CAP * sales_cap[here][k]:
                CAPPED[0] += 1; continue                            # the café's day is full: this visit isn't made
            visits.append((k, here, amt))
            if rng.random() < p: break
    return visits
for m in members:                                                  # joins first: every join is a visit, whatever the cap
    used_tx[m['cafe']][m['day']] += 1; used_sales[m['cafe']][m['day']] += m['first']
rv = np.random.default_rng(6066)
for m in members:
    for attempt in range(500):
        v = simulate(m, rv)
        if m['returned'] is None or int(any(1 <= k - m['day'] <= 30 for k, _, _ in v[1:])) == m['returned']: break
    else:
        raise SystemExit(f"could not match B06 'returned' for {m['b06']}")
    m['visits'] = v
    for k, c, a in v[1:]: used_tx[c][k] += 1; used_sales[c][k] += a
share_tx = max((used_tx[c] / tx_cap[c]).max() for c in CAFES); share_sales = max((used_sales[c] / sales_cap[c]).max() for c in CAFES)
for c in CAFES:
    st, ss = used_tx[c] / tx_cap[c], used_sales[c] / sales_cap[c]
    print(c, "tx share mean %.2f max %.2f at %s; sales share mean %.2f max %.2f at %s" % (st.mean(), st.max(), DATES[st.argmax()], ss.mean(), ss.max(), DATES[ss.argmax()]), "members visits", used_tx[c].sum(), "of", tx_cap[c].sum())
assert share_tx <= 0.65 and share_sales <= 0.65, (share_tx, share_sales)   # joins come first and are never dropped

# encoding: per member, visits as 6 characters: day (2, base 36), cents ÷ 5 (3, base 36), café ('h'/'m')
B36 = '0123456789abcdefghijklmnopqrstuvwxyz'
def b36(n, w):
    s = ''
    for _ in range(w): s = B36[n % 36] + s; n //= 36
    assert n == 0; return s
MEMBER_COLUMNS = ['member', 'cafe', 'joined', 'near', 'notifications', 'b06']
member_rows, visit_codes = [], []
for i, m in enumerate(members):
    member_rows.append([f'A{i + 1:04d}', m['cafe'], DATES[m['day']], m['near'], m['notif'], m['b06']])
    visit_codes.append(''.join(b36(k, 2) + b36(int(round(a * 20)), 3) + c[0].lower() for k, c, a in m['visits']))
nv = sum(len(m['visits']) for m in members)

# ================================================================ project: the shop's subscriptions
oc = {c: i for i, c in enumerate(SRC['oc'])}
PROD = {p[0]: dict(price=p[3], cost=p[4]) for p in SRC['products']}
rs = np.random.default_rng(6067)
S0 = dt.date(2026, 3, 1)
END = dt.date(2027, 12, 31)
def add_month(d, dom):
    y, mth = (d.year + (d.month // 12), d.month % 12 + 1)
    return dt.date(y, mth, min(dom, 28))
BETA = {'relaunch offer': (0.5, 2.2), 'shop': (0.35, 9.0), 'referral': (0.3, 11.0), 'café': (0.4, 9.0)}
subs = []
spring = {}
for r in SRC['orders']:
    if r[oc['subscription']] != 'yes': continue
    s = spring.setdefault(r[oc['customer_id']], dict(id=r[oc['customer_id']], start=dt.date.fromisoformat(r[oc['order_date']]), product=r[oc['product']], qty=r[oc['quantity']], price=r[oc['order_total']]))
    s['start'] = min(s['start'], dt.date.fromisoformat(r[oc['order_date']]))
plans = [(s['product'], s['qty']) for s in spring.values()]
for s in sorted(spring.values(), key=lambda s: (s['start'], s['id'])):
    s.update(channel='shop', theta=rs.beta(*BETA['shop']), protect=dt.date(2026, 7, 1))     # all 27 still subscribed in June (B03)
    subs.append(s)
n_new = 0
def new_sub(start, channel):
    global n_new
    n_new += 1
    prod, qty = plans[rs.integers(len(plans))]
    return dict(id=f'S{n_new:04d}', start=start, product=prod, qty=qty, price=round(0.9 * PROD[prod]['price'] * qty, 2), channel=channel,
                theta=rs.beta(*BETA[channel]), protect=start)
MONTH_JOINS = {7: 40, 8: 30, 9: 25, 10: 14, 11: 12}                # July–November 2026 (December's below)

def renew_2026(pool, rr):
    """Renewals through 2026: before each renewal a subscriber cancels with probability θ."""
    for s in pool:
        s['deliveries'] = []; s['end'] = None; s['skips'] = []
        d = s['start']; dom = s['start'].day
        while True:
            s['deliveries'].append(d)
            nxt = add_month(d, dom)
            if nxt > dt.date(2026, 12, 31): s['next'] = nxt; break
            if nxt > s['protect'] and rr.random() < s['theta']:
                s['end'] = nxt - dt.timedelta(days=int(rr.integers(1, 8))); break
            d = nxt
rr = np.random.default_rng(6068)
pool = [dict(s) for s in subs]
for mth, n in MONTH_JOINS.items():
    for _ in range(n):
        pool.append(new_sub(dt.date(2026, mth, int(rr.integers(1, 29))), 'relaunch offer' if mth <= 9 else 'shop'))
renew_2026(pool, rr)
# December joiners start between the 1st and the 28th, so none renews (or can cancel) before 1 January: add exactly
# as many as bring 31 December to B04's 120.
DEC_JOINS = 120 - sum(1 for s in pool if s['end'] is None)
assert 0 <= DEC_JOINS <= 40, DEC_JOINS
dec = [new_sub(dt.date(2026, 12, int(rr.integers(1, 29))), 'shop') for _ in range(DEC_JOINS)]
renew_2026(dec, rr); pool += dec
assert sum(1 for s in pool if s['end'] is None) == 120

# 2027: B05's weekly joins and cancellations, exactly
sc = {c: i for i, c in enumerate(SRC['sc'])}
weeks = SRC['weeks']
rw = np.random.default_rng(6069)
TEST_START = dt.date(2027, 3, 1)
SAVE_RATE = 0.45
requests = []                                                      # (id, date, arm, outcome)
EXPECT = [0.0]; EXPECT_BY = {}
print('active 31 Dec 2026 by channel', {ch: sum(1 for s in pool if s['end'] is None and s['channel'] == ch) for ch in BETA}, 'joined 2026', {ch: sum(1 for s in pool if s['channel'] == ch) for ch in BETA})
CH27 = ['shop', 'referral', 'café']
for w in weeks:
    ws = dt.date.fromisoformat(w[sc['starts']]); we = ws + dt.timedelta(days=w[sc['days']] - 1)
    for _ in range(w[sc['new_subscribers']]):
        d = ws + dt.timedelta(days=int(rw.integers(w[sc['days']])))
        ch = rw.choice(CH27, p=[0.6, 0.25, 0.15]) if d >= dt.date(2027, 3, 1) else rw.choice(['shop', 'referral'], p=[0.7, 0.3])
        s = new_sub(d, str(ch)); s.update(deliveries=[], end=None, skips=[], next=d); pool.append(s)
    target = w[sc['active_subscribers']]
    # deliveries due this week; cancellation requests are drawn from subscribers whose renewal falls this week
    due = [s for s in pool if s['end'] is None and ws <= s['next'] <= we]
    active_before = sum(1 for s in pool if s['end'] is None)
    c_k = active_before - target
    assert c_k >= 0, (w, c_k)
    cand = [s for s in due if s['next'] > s['start']]               # not a brand-new subscriber's first delivery
    EXPECT[0] += sum(s['theta'] for s in cand)
    for s in cand: EXPECT_BY[s['channel']] = EXPECT_BY.get(s['channel'], 0) + s['theta']
    cancelled = 0
    while cancelled < c_k:
        assert cand, f'no candidates in week {w[0]}'
        wts = np.array([s['theta'] for s in cand]); j = int(rw.choice(len(cand), p=wts / wts.sum())); s = cand.pop(j)
        req = s['next'] - dt.timedelta(days=int(rw.integers(0, max(1, (s['next'] - ws).days + 1))))
        req = max(req, ws)
        if req >= TEST_START:
            arm = int(rw.random() < 0.5)
            if arm and rw.random() < SAVE_RATE:
                requests.append((s['id'], req.isoformat(), 1, 'skipped a month')); s['skips'].append(s['next']); s['next'] = add_month(s['next'], s['start'].day); continue
            requests.append((s['id'], req.isoformat(), arm, 'cancelled'))
        s['end'] = req; cancelled += 1
    # remaining due subscribers take their delivery
    for s in pool:
        while s['end'] is None and s['next'] <= we:
            s['deliveries'].append(s['next']); s['next'] = add_month(s['next'], s['start'].day)
    assert sum(1 for s in pool if s['end'] is None) == target, w
for s in pool: assert all(d <= END for d in s['deliveries'])

SUB_COLUMNS = ['subscriber', 'start', 'channel', 'product', 'quantity', 'price', 'cancelled', 'skipped']
sub_rows = [[s['id'], s['start'].isoformat(), s['channel'], s['product'], s['qty'], s['price'], s['end'].isoformat() if s['end'] else '',
             ' '.join(d.isoformat() for d in s['skips'])] for s in sorted(pool, key=lambda s: (s['start'], s['id']))]
REQUEST_COLUMNS = ['subscriber', 'requested', 'offered_skip', 'outcome']

def js(name, v): return f'export const {name} = {json.dumps(v, ensure_ascii=False, separators=(",", ":"))};\n'
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(f"""// data.js — generated by tools/study/m06-data.py (do not edit by hand). Fictional data for M06 Customer Analytics and RFM;
// case.js decodes it, describes each field and checks it against B03, B04, B05 and B06.

/** Lessons: every loyalty-app member who joined at the two cafés in 2027 (b06 = the member's B06 id, October joiners only). */
{js('MEMBER_COLUMNS', MEMBER_COLUMNS)}{js('MEMBERS', member_rows)}
/** Lessons: each member's visits with the app, 6 characters a visit: day since 1 March 2027 (2, base 36), spend in
 *  5-cent units (3, base 36), café (h Harbourside, m Millbrook). The first visit is the join. */
{js('VISITS', visit_codes)}
/** The project's data (lessons, exercises and module tests must not use it): every coffee subscription from 1 March 2026
 *  to 31 December 2027 (cancelled = the date the subscriber asked to cancel; skipped = deliveries skipped after the save
 *  offer), and the save-offer test's cancellation requests from 1 March 2027 (offered_skip 1 = shown the offer). */
{js('SUB_COLUMNS', SUB_COLUMNS)}{js('SUBSCRIPTIONS', sub_rows)}
{js('REQUEST_COLUMNS', REQUEST_COLUMNS)}{js('REQUESTS', [list(r) for r in requests])}
{js('SAVE_TEST_START', TEST_START.isoformat())}""")
n_sub = len(sub_rows); n_can = sum(1 for r in sub_rows if r[6])
print(f'members {len(members)}, visits {nv} ({CAPPED[0]} not made at the cap, all attempts), peak member share of transactions {share_tx:.2f}, of sales {share_sales:.2f}')
print(f'subscriptions {n_sub} (December 2026 joins {DEC_JOINS}), cancelled {n_can}, requests {len(requests)}, skips {sum(1 for r in requests if r[3] != "cancelled")}')
print(f'2027: B05 cancellations {sum(1 for r in sub_rows if r[6] >= "2027")}, the planted θ would expect about {EXPECT[0]:.0f} before saves')
print('expected 2027 cancellations by channel', {k: round(v, 1) for k, v in EXPECT_BY.items()})
print(f'wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)')
