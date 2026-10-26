#!/usr/bin/env python3
"""Generate assets/js/data/study/b05/data.js, the data B05 Correlation Analysis uses. Every value is fictional.
NumPy's PCG64 generator with fixed seeds, so the file can be rebuilt exactly; lessons, tests and the project read their
figures from case.js (which summarises this file), never from this script.

Lessons: the daily log of Lantern's two cafés, Harbourside (on the waterfront) and Millbrook (in the office district),
from their opening on 1 March 2027 to 31 December 2027: 306 days x 2 cafés = 612 rows. Relationships planted (each with
noise), so every method can be checked against what is known to be true:
  - warmer days -> a larger share of iced drinks (an S-shaped curve) and fewer hot drinks;
  - rain -> fewer people through the door (rain is zero on most days, so the relationship is skewed);
  - footfall -> transactions -> sales (a chain);
  - the manager rosters more baristas for the 7-11 a.m. peak on days she expects to be busy (weekdays at Millbrook, weekends, warm days and events
    at Harbourside), so peak barista hours go with sales without causing them, and go with longer peak waits although
    more baristas shorten the wait at a given number of customers (waiting rises steeply once peak transactions per
    barista hour pass about seven: a curve, not a line). They are rostered peak hours, not the day's paid hours;
  - average ticket rises with footfall inside each café, but Millbrook has more people and smaller tickets than
    Harbourside, so the two cafés pooled show the opposite (Simpson's paradox);
  - loyalty members (cumulative) and sales both grow through the year (two trends);
  - five harbour-festival days at Harbourside (very high footfall), and one data-entry slip: Millbrook's footfall on
    14 September recorded with an extra digit (SLIP in data.js gives both values).
Café sales are scaled so that both cafés together total exactly $236,000, F03's café sales for 2027.

Project (lessons must not use it): the online shop's 52 weeks of 2027 (week 52 runs 24-31 December, eight days):
sessions, orders, shipped order value (totalling exactly $189,400, F03's online sales), paid-social spend, emails sent,
average delivery days, average review rating, new and active subscribers, and the week's average high temperature.
Planted: spend follows the season (Ana spends more before Mother's Day and in the gift season), so spend and order
value move together far more than spend alone could explain; emails help a little; slower delivery lowers ratings;
active subscribers and order value both trend up; one outage week (orders collapse while sessions don't).

Run:  python3 tools/study/b05-data.py
"""
from pathlib import Path
import json
import datetime as dt
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'assets/js/data/study/b05/data.js'

r = np.random.default_rng(5051)

# ---------------------------------------------------------------- weather (Harbour City, fictional)
days = [dt.date(2027, 3, 1) + dt.timedelta(d) for d in range(306)]
MONTH_HIGH = {3: 46, 4: 57, 5: 67, 6: 76, 7: 82, 8: 80, 9: 73, 10: 62, 11: 51, 12: 41}   # °F, monthly mean highs
def smooth_high(d):
    # interpolate between mid-month means so the seasonal curve has no steps
    m = d.month; frac = (d.day - 15) / 30.0
    a = MONTH_HIGH[m]
    b = MONTH_HIGH.get(m + 1 if frac > 0 else m - 1, a)
    return a + (b - a) * abs(frac)
temp = np.zeros(306); e = 0.0
for i, d in enumerate(days):
    e = 0.65 * e + r.normal(0, 5.2)
    temp[i] = smooth_high(d) + e
temp = np.round(temp).astype(int)
rain_day = r.random(306) < 0.32
rain = np.where(rain_day, np.round(r.gamma(0.8, 0.32, 306), 2), 0.0)
rain = np.where(rain_day & (rain < 0.01), 0.01, rain)

dow = np.array([d.weekday() for d in days])          # 0 Monday ... 6 Sunday
weekend = dow >= 5
festival = np.zeros(306, bool)
for md in [(5, 29), (5, 30), (7, 3), (7, 4), (8, 21)]:   # Harbour Days and the Fourth of July weekend, the Regatta
    festival[(dt.date(2027, *md) - dt.date(2027, 3, 1)).days] = True
ramp = np.minimum(1.0, 0.72 + 0.28 * np.arange(306) / 120)   # new cafés build up over their first four months

CAFES = ['Harbourside', 'Millbrook']
rows = []
for c, name in enumerate(CAFES):
    if c == 0:   # waterfront: weekends, warm and dry days, festivals
        base = np.where(weekend, 196, 122).astype(float)
        warm = 1 + 0.011 * (temp - 60)
        wet = 1 - 0.62 * np.minimum(rain, 1.0)
        fest = np.where(festival, 2.3, 1.0)
        ticket0, ticket_slope = 6.45, 0.0040
    else:        # offices: weekdays, weather matters less
        base = np.where(weekend, 118, 292).astype(float)
        warm = 1 + 0.002 * (temp - 60)
        wet = 1 - 0.30 * np.minimum(rain, 1.0)
        fest = np.ones(306)
        ticket0, ticket_slope = 3.95, 0.0022
    expected = base * warm * fest * ramp                    # what the manager expects (she sees the forecast)
    footfall = np.rint(expected * wet * np.exp(r.normal(0, 0.09, 306))).astype(int)
    conv = 0.47 if c == 0 else 0.55
    trans = r.binomial(footfall, conv)
    # average ticket rises with how busy the day is inside each café (groups, add-ons), plus noise
    ticket = ticket0 + ticket_slope * (footfall - footfall.mean()) + r.normal(0, 0.28, 306)
    sales = trans * ticket
    drinks = np.rint(trans * r.normal(1.15, 0.05, 306)).astype(int)
    iced_p = 0.06 + 0.78 / (1 + np.exp(-(temp - 69) / 6.0))
    iced = r.binomial(drinks, np.clip(iced_p + r.normal(0, 0.03, 306), 0.01, 0.97))
    hot = drinks - iced
    # the 7–11 a.m. peak roster (barista hours): two hours of cover plus about one hour per 14 expected peak
    # transactions (55% of the day's), in half hours; the peak wait depends on peak transactions per barista hour
    staff = np.round((2 + expected * conv * 0.55 / 14 + r.normal(0, 0.45, 306)) * 2) / 2
    load = trans * 0.55 / staff
    wait = np.round(np.clip(1.5 + 0.22 * np.maximum(0, load - 7) ** 2 + 0.2 * load / 10 + r.normal(0, 0.4, 306), 0.5, None), 1)
    rows.append(dict(cafe=c, footfall=footfall, trans=trans, sales=sales, drinks=drinks, iced=iced, hot=hot,
                     staff=staff, wait=wait))

# scale sales so both cafés total exactly $236,000 (F03), in cents
TARGET = 236_000_00
cents = [np.rint(x['sales'] * 100) for x in rows]
tot = sum(c.sum() for c in cents)
scaled = [c * TARGET / tot for c in cents]
flat = np.concatenate(scaled)
fl = np.floor(flat).astype(np.int64)
short = TARGET - fl.sum()
order = np.argsort(-(flat - fl))
fl[order[:short]] += 1
salesc = [fl[:306], fl[306:]]
assert salesc[0].sum() + salesc[1].sum() == TARGET

# loyalty members (cumulative sign-ups per café): about 4% of transactions sign up, early more than late
members = []
for c in range(2):
    signups = r.binomial(rows[c]['trans'], 0.045 * (1.25 - 0.5 * np.arange(306) / 306))
    members.append(np.cumsum(signups))

# the data-entry slip
slip_day = (dt.date(2027, 9, 14) - dt.date(2027, 3, 1)).days
true_slip = int(rows[1]['footfall'][slip_day])
rows[1]['footfall'][slip_day] = int(str(true_slip)[:2] + '6' + str(true_slip)[2:]) if true_slip >= 100 else true_slip * 10

CAFE_COLUMNS = ['date', 'cafe', 'weekday', 'high_f', 'rain_in', 'festival', 'footfall', 'transactions', 'sales', 'hot_drinks',
                'iced_drinks', 'peak_staff_hours', 'peak_wait_min', 'loyalty_members']
WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
cafe_rows = []
for i, d in enumerate(days):
    for c in range(2):
        x = rows[c]
        cafe_rows.append([d.isoformat(), CAFES[c], WD[dow[i]], int(temp[i]), float(rain[i]), int(festival[i] and c == 0),
                          int(x['footfall'][i]), int(x['trans'][i]), round(int(salesc[c][i]) / 100, 2), int(x['hot'][i]),
                          int(x['iced'][i]), float(x['staff'][i]), float(x['wait'][i]), int(members[c][i])])

# ---------------------------------------------------------------- the project: the online shop's 2027 by week
r2 = np.random.default_rng(5052)
W = 52
wk_start = [dt.date(2027, 1, 1) + dt.timedelta(7 * k) for k in range(W)]
wk_days = np.array([7] * 51 + [8])
mid = [s + dt.timedelta(3) for s in wk_start]
def high_for(d):
    table = {1: 37, 2: 40, 3: 46, 4: 57, 5: 67, 6: 76, 7: 82, 8: 80, 9: 73, 10: 62, 11: 51, 12: 41}
    return table[d.month]
wtemp = np.array([high_for(d) for d in mid]) + np.round(r2.normal(0, 2.5, W))
# season: Valentine's (wk 6), Mother's Day (wk 18-19), Father's Day (wk 24), the gift season (wk 46-52)
season = np.ones(W)
for k, m in {5: 1.15, 6: 1.2, 17: 1.25, 18: 1.35, 23: 1.15, 45: 1.3, 46: 1.5, 47: 1.7, 48: 1.85, 49: 2.0, 50: 2.1, 51: 1.6}.items():
    season[k] = m
summer_dip = np.array([0.85 if 26 <= k <= 33 else 1.0 for k in range(W)])
trend = 1 + 0.25 * np.arange(W) / (W - 1)
# Ana raises paid-social spend before the seasons she expects (her own plan), with a small learned bump
spend = np.round((420 * season ** 1.6 * (0.9 + 0.2 * r2.random(W))) / 10) * 10
emails = r2.choice([1, 1, 2, 2, 2, 3], W) + (season > 1.2)
sessions = np.rint(2600 * season * summer_dip * trend * (1 + 0.00012 * (spend - 400)) * np.exp(r2.normal(0, 0.06, W)) * wk_days / 7).astype(int)
conv = 0.028 * (1 + 0.04 * (emails - 2)) * np.exp(r2.normal(0, 0.05, W))
orders = np.rint(sessions * conv).astype(int)
outage = 32                                                    # week 33 (9-15 August): checkout down for four days
orders[outage] = int(orders[outage] * 0.38)
aov = 40 + 6 * (season - 1) + r2.normal(0, 1.2, W)
value = orders * aov
WTARGET = 189_400_00
vc = np.rint(value * 100); vc = vc * WTARGET / vc.sum()
vf = np.floor(vc).astype(np.int64); vf[np.argsort(-(vc - vf))[:WTARGET - vf.sum()]] += 1
assert vf.sum() == WTARGET
delivery = np.round(np.clip(2.4 + 0.9 * (season - 1) + r2.normal(0, 0.35, W), 1.6, None), 1)
rating = np.round(np.clip(4.85 - 0.32 * (delivery - 2.4) + r2.normal(0, 0.08, W), 3.5, 5.0), 2)
new_subs = r2.binomial(orders, 0.022)
active = 520 + np.cumsum(new_subs) - np.cumsum(r2.binomial(np.full(W, 6), 0.15))
SHOP_COLUMNS = ['week', 'starts', 'days', 'sessions', 'orders', 'order_value', 'social_spend', 'emails', 'delivery_days',
                'rating', 'new_subscribers', 'active_subscribers', 'avg_high_f']
shop_rows = [[k + 1, wk_start[k].isoformat(), int(wk_days[k]), int(sessions[k]), int(orders[k]), round(int(vf[k]) / 100, 2),
              int(spend[k]), int(emails[k]), float(delivery[k]), float(rating[k]), int(new_subs[k]), int(active[k]),
              int(wtemp[k])] for k in range(W)]

# ---------------------------------------------------------------- write
def js(name, value):
    return f'export const {name} = {json.dumps(value, separators=(",", ":"))};\n'
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(
    '// data.js — generated by tools/study/b05-data.py (do not edit by hand). Fictional data for B05 Correlation Analysis;\n'
    '// case.js describes each set and computes every figure from it.\n\n'
    "/** Lessons: the two cafés' daily log, 1 March – 31 December 2027 (612 rows, one per café per day). */\n"
    + js('CAFE_COLUMNS', CAFE_COLUMNS) + js('CAFE_ROWS', cafe_rows)
    + f'/** The data-entry slip: Millbrook\'s footfall on 14 September 2027 should read {true_slip}. */\n'
    + js('SLIP', {'date': '2027-09-14', 'cafe': 'Millbrook', 'column': 'footfall', 'recorded': int(rows[1]['footfall'][slip_day]), 'actual': true_slip})
    + '\n/** Project: the online shop by week, 2027 (week 52 runs 24–31 December). Lessons must not use it. */\n'
    + js('SHOP_COLUMNS', SHOP_COLUMNS) + js('SHOP_WEEKS', shop_rows) + js('OUTAGE_WEEK', outage + 1)
)
print('wrote', OUT, len(cafe_rows), 'café rows,', len(shop_rows), 'weeks; slip', true_slip, '->', rows[1]['footfall'][slip_day])
