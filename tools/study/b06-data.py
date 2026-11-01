"""B06 Regression Analysis — the project's data: Lantern's catering quotes for events in 2027 (fictional).
Run: python3 tools/study/b06-data.py   (writes assets/js/data/study/b06/data.js)

Ana quotes every catering enquiry from B03's quote sheet as it stands from January 2027: $60 setup per event day, a
price per guest, $30 an hour for the first three hours of service and $30 an hour for each barista beyond the third
(one barista per 40 guests or part of 40), $120 for a pastry platter, $300 minimum. From 1 June 2027 she ran a price test: a coin toss
for each new quote set the price per guest at $6.50 (the sheet) or $7.00. A won event is invoiced after it happens;
invoices add bespoke changes (extra staff for big events, a late finish, a negotiated price), so they don't equal the
quote (within $150 of it, as in B03's 2026 events, except for the gala dinner). The quotes cover events held in 2027 other than the law firm's contract events (F03) and the two January events
prepaid in 2026 (F02/F03), so the won events' invoices total F03's $85,880 of 2027 catering invoiced on 30-day terms.

Planted: the chance of winning falls with the higher price (log-odds −0.55), when the client says they are comparing
quotes (−0.9) and for bigger events, and rises for repeat clients (+1.1) and with lead time (+0.25 per 10 days, up to
30 days); private and non-profit clients are a little less likely to book than companies. The invoice is the quote
plus extras whose spread grows with the event's size (heteroskedastic); one gala dinner (240 guests), quoted in May before the price test, is far larger
than any other event (high leverage, real). Event sizes follow B03's 2026 events (median about 78 guests). Lessons must not use these data.

The lessons' logistic data: the loyalty-app members who joined at the two cafés in October 2027 (one row per member;
the joins per café per day are exactly the B05 log's daily sign-ups), and whether each came back within 30 days.
Planted: living or working within a mile (+0.9 log-odds), notifications on (+0.6), a bigger first ticket (+0.25 per
dollar) and joining at Millbrook (+0.5, office regulars) raise the chance; joining at a weekend lowers it (−0.4).
"""
import json, datetime as dt
from pathlib import Path
import numpy as np

OUT = Path(__file__).resolve().parents[2] / 'assets/js/data/study/b06/data.js'
import os
r = np.random.default_rng(int(os.environ.get('B06_SEED', 6103)))
QUOTE = dict(setup=60, perHour=30, platter=120, minimum=300)
TEST_START = dt.date(2027, 6, 1)
TARGET = 85_880_00

# enquiries: more in spring and before the holidays, few in high summer
month_w = np.array([0.6, 0.8, 1.0, 1.1, 1.1, 0.9, 0.6, 0.55, 1.0, 1.1, 1.4, 1.2])
N = int(os.environ.get('B06_N', 180))
months = r.choice(np.arange(1, 13), N, p=month_w / month_w.sum())
rows = []
for k in range(N):
    m = int(months[k])
    sent = dt.date(2027, m, 1) + dt.timedelta(int(r.integers(0, 28)))
    lead = int(np.clip(np.round(r.gamma(2.2, 9)), 3, 75))
    event = sent + dt.timedelta(lead)
    if event.year > 2027 or event < dt.date(2027, 1, 15):
        event = dt.date(2027, 12, 20) - dt.timedelta(int(r.integers(0, 10))) if event.year > 2027 else dt.date(2027, 1, 20)
        lead = (event - sent).days
        if lead < 3:
            sent = event - dt.timedelta(5); lead = 5
    ctype = r.choice(['Company', 'Private', 'Non-profit'], p=[0.6, 0.25, 0.15])
    repeat = int(r.random() < (0.38 if ctype == 'Company' else 0.15))
    comparing = int(r.random() < 0.45)
    guests = int(np.clip(np.round(np.exp(r.normal(np.log(76), 0.38))), 20, 200))
    hours = int(np.clip(np.round(r.normal(2.4 + guests / 50, 1.0)), 2, 8))
    pastries = int(r.random() < 0.4)
    days = 2 if (ctype == 'Company' and r.random() < 0.03) else 1
    rate = 7.0 if (sent >= TEST_START and r.random() < 0.5) else 6.5
    rows.append(dict(sent=sent, event=event, lead=lead, client=str(ctype), repeat=repeat, comparing=comparing, guests=guests,
                     hours=hours, pastries=pastries, days=days, rate=rate))
# the gala dinner: a repeat corporate client, quoted in May (before the price test) for November
rows.append(dict(sent=dt.date(2027, 5, 18), event=dt.date(2027, 11, 6), lead=172, client='Company', repeat=1, comparing=0, guests=240,
                 hours=6, pastries=1, days=1, rate=6.5))
rows.sort(key=lambda q: (q['sent'], q['event']))

def quoted(q):
    baristas = -(-q['guests'] // 40)
    service = QUOTE['perHour'] * min(q['hours'], 3) + QUOTE['perHour'] * baristas * max(q['hours'] - 3, 0)
    return max(QUOTE['minimum'], q['days'] * (QUOTE['setup'] + q['rate'] * q['guests'] + service + (QUOTE['platter'] if q['pastries'] else 0)))

for q in rows:
    q['quoted'] = round(quoted(q), 2)
    eta = (0.55 - 0.55 * (q['rate'] == 7.0) - 0.9 * q['comparing'] + 1.1 * q['repeat'] + 0.25 * min(q['lead'], 30) / 10
           - 0.5 * (q['guests'] - 75) / 75 - 0.3 * (q['client'] == 'Private') - 0.45 * (q['client'] == 'Non-profit'))
    q['won'] = int(r.random() < 1 / (1 + np.exp(-eta)))
rows[[i for i, q in enumerate(rows) if q['guests'] == 240][0]]['won'] = 1   # the gala went ahead

# invoices: the quote plus extras whose spread grows with size; big events need extra staff
won = [q for q in rows if q['won']]
raw = []
for q in won:
    late = 45 if r.random() < 0.15 else 0               # a late finish
    noise = r.normal(0, 6 + 0.55 * q['guests'])        # bespoke changes, more for bigger events
    extra = late + noise
    if q['guests'] < 200:
        extra = float(np.clip(extra, -140, 140))
    else:
        extra = 260.0                                   # the gala: extra staff and a late finish
    raw.append(max(QUOTE['minimum'], q['quoted'] + extra))
raw = np.array(raw)
print('unscaled invoices', round(raw.sum(), 2), 'scale', round(TARGET / 100 / raw.sum(), 4))
assert 0.985 < TARGET / 100 / raw.sum() < 1.015, 'the invoices need more than a 1.5% adjustment to reach F03’s total; change N'
cents = np.round(raw * 100)
scaled = cents * TARGET / cents.sum()
fl = np.floor(scaled).astype(np.int64)
fl[np.argsort(-(scaled - fl))[:TARGET - fl.sum()]] += 1
assert fl.sum() == TARGET
for q, c in zip(won, fl):
    q['invoice'] = int(c) / 100
for q in rows:
    q.setdefault('invoice', None)

# ---------------------------------------------------------------- lessons: October 2027 loyalty joiners
import re
b05 = (Path(__file__).resolve().parents[2] / 'assets/js/data/study/b05/data.js').read_text()
CC = json.loads(re.search(r'CAFE_COLUMNS = (\[.*?\]);', b05).group(1)); CR = json.loads(re.search(r'CAFE_ROWS = (\[.*?\]);\n', b05, re.S).group(1))
ci = {c: i for i, c in enumerate(CC)}
rm = np.random.default_rng(6063)
members = []
for cafe, ticket0 in [('Harbourside', 5.35), ('Millbrook', 3.27)]:
    log = [row for row in CR if row[ci['cafe']] == cafe]
    prev = {row[ci['date']]: row[ci['loyalty_members']] for row in log}
    dates = [row[ci['date']] for row in log]
    for j, row in enumerate(log):
        d = row[ci['date']]
        if not d.startswith('2027-10'):
            continue
        joins = row[ci['loyalty_members']] - log[j - 1][ci['loyalty_members']]
        wkend = dt.date.fromisoformat(d).weekday() >= 5
        for _ in range(joins):
            near = int(rm.random() < (0.45 if cafe == 'Millbrook' else 0.3))
            notif = int(rm.random() < 0.55)
            ticket = round(float(np.clip(rm.normal(ticket0 + 0.8, 1.3), 2.5, 14)) * 20) / 20
            eta = -0.9 + 0.9 * near + 0.6 * notif + 0.25 * (ticket - 5) + 0.5 * (cafe == 'Millbrook') - 0.4 * wkend
            members.append([cafe, d, near, notif, ticket, int(rm.random() < 1 / (1 + np.exp(-eta)))])
members.sort(key=lambda m: (m[1], m[0]))
MEMBER_COLUMNS = ['member', 'cafe', 'joined', 'near', 'notifications', 'first_ticket', 'returned']
member_rows = [[f'M27-{k + 1:03d}', *m] for k, m in enumerate(members)]

COLUMNS = ['quote', 'sent', 'event', 'client', 'repeat', 'comparing', 'guests', 'hours', 'pastries', 'days', 'rate', 'quoted', 'won', 'invoice']
data = [[f'Q27-{k + 1:03d}', q['sent'].isoformat(), q['event'].isoformat(), q['client'], q['repeat'], q['comparing'], q['guests'], q['hours'],
         q['pastries'], q['days'], q['rate'], q['quoted'], q['won'], q['invoice']] for k, q in enumerate(rows)]
OUT.parent.mkdir(parents=True, exist_ok=True)
js = lambda name, v: f'export const {name} = {json.dumps(v, separators=(",", ":"))};\n'
OUT.write_text('// data.js — generated by tools/study/b06-data.py (do not edit by hand). Fictional data for B06 Regression Analysis;\n'
               '// case.js describes it and computes every figure from it.\n\n'
               "/** Project: Lantern's catering quotes for events in 2027 (lessons must not use these). */\n"
               + js('QUOTE_COLUMNS', COLUMNS) + js('QUOTES', data) + js('PRICE_TEST_START', TEST_START.isoformat())
               + "\n/** Lessons: the loyalty-app members who joined in October 2027, and whether each came back within 30 days. */\n"
               + js('MEMBER_COLUMNS', MEMBER_COLUMNS) + js('MEMBERS', member_rows))
print('members', len(member_rows), 'returned', sum(m[-1] for m in member_rows))
w = [q for q in rows if q['won']]
print('quotes', len(rows), 'won', len(w), 'win rate', round(len(w) / len(rows), 3), 'mean invoice', round(TARGET / 100 / len(w), 2),
      'test quotes', sum(q['sent'] >= TEST_START for q in rows), 'at 7.00', sum(q['rate'] == 7.0 for q in rows))
