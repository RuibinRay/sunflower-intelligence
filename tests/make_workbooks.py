#!/usr/bin/env python3
"""Builds the sample company workbooks for Finance › Company Intelligence and the reference figures the tests compare
against. The company, Helio Foods Group, is fictional: every figure is generated from drivers so that the three
statements reconcile, the monthly records add up to the annual statements, and the order lines add up to revenue.

Writes:
  assets/data/samples/helio-foods-group.xls    genuine BIFF8 .xls (xlwt): statements + 11,520 monthly records
  assets/data/samples/helio-foods-group.xlsx   .xlsx (openpyxl): the same + 15,000 order lines + a notes sheet
  tests/fixtures-workbook.json                 row counts, column sums, annual statements and ratios worked here in
                                               Python (pandas), independently of the JavaScript engine

Run:  python3 tests/make_workbooks.py     (needs numpy, pandas, xlwt, openpyxl)
"""
import json, os, datetime as dt
import numpy as np, pandas as pd, xlwt
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'assets', 'data', 'samples')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(1888)
YEARS = [2020, 2021, 2022, 2023, 2024, 2025]
N = len(YEARS)
R = lambda x: int(round(x))

# ---------------------------------------------------------------- annual drivers (whole US dollars)
rev = [R(x * 1e6) for x in [412.0, 455.5, 498.2, 561.4, 618.9, 672.3]]
gm = [0.382, 0.371, 0.349, 0.362, 0.374, 0.381]
smp = [0.118, 0.117, 0.119, 0.116, 0.114, 0.113]; gap = [0.064, 0.063, 0.064, 0.062, 0.061, 0.060]; rdp = [0.021, 0.022, 0.022, 0.023, 0.023, 0.024]
dap = [0.036, 0.036, 0.037, 0.038, 0.038, 0.037]; capexp = [0.043, 0.048, 0.051, 0.047, 0.045, 0.044]
ar_d = [39, 40, 42, 40, 38, 37]; inv_d = [61, 63, 68, 64, 60, 58]; ap_d = [45, 44, 43, 46, 47, 47]
ocap = 0.017; oclp = 0.051
taxr = [0.238, 0.241, 0.243, 0.239, 0.236, 0.234]; kd = [0.043, 0.044, 0.049, 0.056, 0.058, 0.057]
payout = [0.32, 0.33, 0.36, 0.33, 0.34, 0.35]; buyb = [0, 0, 0, 0, R(8e6), R(14e6)]
sti = [R(x * 1e6) for x in [18, 20, 14, 12, 22, 30]]; intinc = [R(x * 1e6) for x in [0.7, 0.8, 0.9, 1.4, 2.1, 2.6]]
ltd = [R(x * 1e6) for x in [150, 150, 150, 245, 232, 214]]; curd = [R(x * 1e6) for x in [10, 10, 10, 16, 16, 16]]
leases = [R(x * 1e6) for x in [26, 27, 29, 33, 34, 35]]; oncl = [R(x * 1e6) for x in [19, 20, 21, 24, 25, 26]]; onca = [R(x * 1e6) for x in [11, 12, 12, 14, 15, 15]]
acq = [0, 0, 0, R(96e6), 0, 0]                # 2023: a brand acquisition, goodwill 62m + intangibles 34m, funded with debt
amort = [R(x * 1e6) for x in [2.2, 2.2, 2.2, 4.4, 4.4, 4.4]]
shares = [26.4, 26.3, 26.2, 26.1, 25.9, 25.6]  # millions, diluted weighted average

o = dict(cash=R(34e6), sti=R(17e6), ar=R(41e6), inv=R(40e6), oca=R(6.4e6), ppe=R(151e6), gw=R(48e6), intang=R(21e6), onca=R(10e6),
         ap=R(29e6), curd=R(10e6), ocl=R(19.5e6), ltd=R(150e6), leases=R(25e6), oncl=R(18e6))
o['ta'] = sum(o[k] for k in ['cash', 'sti', 'ar', 'inv', 'oca', 'ppe', 'gw', 'intang', 'onca'])
o['tl'] = sum(o[k] for k in ['ap', 'curd', 'ocl', 'ltd', 'leases', 'oncl'])
o['equity'] = o['ta'] - o['tl']; o['retained'] = o['equity'] - R(52e6)

A = []          # annual rows
prev = o
ppe, gw, intang, equity, retained = o['ppe'], o['gw'], o['intang'], o['equity'], o['retained']
for i, y in enumerate(YEARS):
    cogs = R(rev[i] * (1 - gm[i])); sm = R(rev[i] * smp[i]); ga = R(rev[i] * gap[i]); rd = R(rev[i] * rdp[i]); da = R(rev[i] * dap[i])
    gp = rev[i] - cogs; ebitda = gp - sm - ga - rd; ebit = ebitda - da
    debt_open = prev['ltd'] + prev['curd']
    interest = R(kd[i] * (debt_open + ltd[i] + curd[i]) / 2)
    pretax = ebit - interest + intinc[i]; tax = R(pretax * taxr[i]); ni = pretax - tax
    div = R(ni * payout[i]); bb = buyb[i]
    ar = R(rev[i] * ar_d[i] / 365); inv = R(cogs * inv_d[i] / 365); ap = R(cogs * ap_d[i] / 365); oca = R(rev[i] * ocap); ocl = R(rev[i] * oclp)
    capex = R(rev[i] * capexp[i])
    ppe = ppe + capex - (da - amort[i])
    if acq[i]: gw += R(62e6); intang += R(34e6)
    intang -= amort[i]
    equity = equity + ni - div - bb; retained = retained + ni - div
    tl = ap + curd[i] + ocl + ltd[i] + leases[i] + oncl[i]
    noncash = sti[i] + ar + inv + oca + ppe + gw + intang + onca[i]
    cash = tl + equity - noncash
    nwc = ar + inv + oca - ap - ocl; pnwc = prev['ar'] + prev['inv'] + prev['oca'] - prev['ap'] - prev['ocl']
    cfo = ni + da - (nwc - pnwc) + (oncl[i] - prev['oncl']) - (onca[i] - prev['onca'])
    cfi = -capex - acq[i] - (sti[i] - prev['sti'])
    cff = (ltd[i] + curd[i] - debt_open) + (leases[i] - prev['leases']) - div - bb
    assert cfo + cfi + cff == cash - prev['cash'], (y, cfo + cfi + cff, cash - prev['cash'])
    row = dict(year=y, revenue=rev[i], cogs=cogs, grossProfit=gp, sm=sm, ga=ga, rd=rd, opex=sm + ga + rd, ebitda=ebitda, da=da, ebit=ebit, interestExpense=interest,
               interestIncome=intinc[i], pretax=pretax, tax=tax, netIncome=ni, shares=shares[i],
               cash=cash, sti=sti[i], ar=ar, inv=inv, oca=oca, currentAssets=cash + sti[i] + ar + inv + oca, ppe=ppe, gw=gw, intang=intang, onca=onca[i], ta=noncash + cash,
               ap=ap, curd=curd[i], ocl=ocl, currentLiabilities=ap + curd[i] + ocl, ltd=ltd[i], leases=leases[i], oncl=oncl[i], tl=tl, equity=equity, retained=retained,
               cfo=cfo, capex=capex, acq=acq[i], cfi=cfi, cff=cff, dividends=div, buybacks=bb, nwcChange=-(nwc - pnwc))
    assert row['ta'] == row['tl'] + row['equity']
    A.append(row); prev = row
assert all(r['cash'] > 0 for r in A), [r['cash'] for r in A]

# ---------------------------------------------------------------- the three statement sheets (USD thousands)
IS_ROWS = [('Revenue', 'revenue', 1), ('Cost of goods sold', 'cogs', 1), ('Gross profit', 'grossProfit', 1), ('Selling and marketing', 'sm', 1),
           ('General and administrative', 'ga', 1), ('Research and development', 'rd', 1), ('Depreciation and amortization', 'da', 1),
           ('Operating income', 'ebit', 1), ('Interest expense', 'interestExpense', 1), ('Interest and other income', 'interestIncome', 1),
           ('Income before income taxes', 'pretax', 1), ('Provision for income taxes', 'tax', 1), ('Net income', 'netIncome', 1)]
BS_ROWS = [('Cash and cash equivalents', 'cash'), ('Short-term investments', 'sti'), ('Accounts receivable, net', 'ar'), ('Inventories', 'inv'), ('Other current assets', 'oca'),
           ('Total current assets', 'currentAssets'), ('Property, plant and equipment, net', 'ppe'), ('Goodwill', 'gw'), ('Intangible assets, net', 'intang'),
           ('Other non-current assets', 'onca'), ('Total assets', 'ta'), ('Accounts payable', 'ap'), ('Current portion of long-term debt', 'curd'),
           ('Other current liabilities', 'ocl'), ('Total current liabilities', 'currentLiabilities'), ('Long-term debt', 'ltd'), ('Lease liabilities', 'leases'),
           ('Other non-current liabilities', 'oncl'), ('Total liabilities', 'tl'), ("Total shareholders' equity", 'equity'), ('Retained earnings', 'retained')]
CF_ROWS = [('Net cash provided by operating activities', 'cfo', 1), ('Changes in working capital', 'nwcChange', 1), ('Purchases of property and equipment', 'capex', -1),
           ('Net cash used in investing activities', 'cfi', 1), ('Dividends paid', 'dividends', -1), ('Repurchases of common stock', 'buybacks', -1),
           ('Net cash provided by (used in) financing activities', 'cff', 1)]
def k(v): return v / 1000.0
def statement_rows(title, rows, with_shares=False):
    out = [[f'Helio Foods Group, Inc. (fictional): {title}'], ['(in thousands of US dollars, except share data)'], [],
           ['Fiscal year ended December 31'] + [f'FY{y}' for y in YEARS]]
    for r in rows:
        sign = r[2] if len(r) > 2 else 1
        out.append([r[0]] + [sign * k(a[r[1]]) for a in A])
    if with_shares: out.append(['Diluted weighted average shares (thousands)'] + [a['shares'] * 1000 for a in A])
    return out
SHEETS = [('Income Statement', statement_rows('Consolidated statements of income', IS_ROWS, True)),
          ('Balance Sheet', statement_rows('Consolidated balance sheets', BS_ROWS)),
          ('Cash Flow', statement_rows('Consolidated statements of cash flows', CF_ROWS))]

# ---------------------------------------------------------------- monthly records: 32 accounts x 72 months x 5 entities
ENT = [('Helio Foods North America', 0.46), ('Helio Foods Europe', 0.27), ('Helio Foods Asia Pacific', 0.13), ('Helio Foods Latin America', 0.09), ('Helio Foods Middle East & Africa', 0.05)]
SEASON = np.array([0.074, 0.071, 0.080, 0.079, 0.083, 0.086, 0.085, 0.084, 0.082, 0.087, 0.091, 0.098])
def split_int(total, weights):
    """Integers that sum exactly to total, in proportion to weights (largest-remainder)."""
    w = np.asarray(weights, float); raw = total * w / w.sum(); base = np.floor(raw).astype(np.int64)
    rem = int(total - base.sum()); order = np.argsort(-(raw - base))
    for j in order[:abs(rem)]: base[j] += 1 if rem > 0 else -1
    return base
FLOW_ACCTS = [('4000 Product revenue', 'Income statement', 'revenue', 1), ('5000 Cost of goods sold', 'Income statement', 'cogs', 1), ('6100 Selling and marketing', 'Income statement', 'sm', 1),
              ('6200 General and administrative', 'Income statement', 'ga', 1), ('6300 Research and development', 'Income statement', 'rd', 1),
              ('6900 Depreciation and amortization', 'Income statement', 'da', 1), ('7100 Interest expense', 'Income statement', 'interestExpense', 1),
              ('7200 Interest and other income', 'Income statement', 'interestIncome', 1), ('8000 Income tax expense', 'Income statement', 'tax', 1),
              ('9100 Net cash provided by operating activities', 'Cash flow', 'cfo', 1), ('9200 Purchases of property and equipment', 'Cash flow', 'capex', 1),
              ('9300 Net cash used in investing activities', 'Cash flow', 'cfi', 1), ('9400 Dividends paid', 'Cash flow', 'dividends', 1),
              ('9500 Repurchases of common stock', 'Cash flow', 'buybacks', 1), ('9600 Net cash from financing activities', 'Cash flow', 'cff', 1)]
STOCK_ACCTS = [('1000 Cash and cash equivalents', 'cash'), ('1100 Short-term investments', 'sti'), ('1200 Accounts receivable, net', 'ar'), ('1300 Inventories', 'inv'),
               ('1400 Other current assets', 'oca'), ('1500 Property, plant and equipment, net', 'ppe'), ('1600 Goodwill', 'gw'), ('1700 Intangible assets, net', 'intang'),
               ('1800 Other non-current assets', 'onca'), ('2000 Accounts payable', 'ap'), ('2100 Current portion of long-term debt', 'curd'), ('2200 Other current liabilities', 'ocl'),
               ('2500 Long-term debt', 'ltd'), ('2600 Lease liabilities', 'leases'), ('2700 Other non-current liabilities', 'oncl'), ("3000 Total shareholders' equity", 'equity'),
               ('3100 Retained earnings', 'retained')]
OPEN = dict(cash=o['cash'], sti=o['sti'], ar=o['ar'], inv=o['inv'], oca=o['oca'], ppe=o['ppe'], gw=o['gw'], intang=o['intang'], onca=o['onca'], ap=o['ap'], curd=o['curd'], ocl=o['ocl'],
            ltd=o['ltd'], leases=o['leases'], oncl=o['oncl'], equity=o['equity'], retained=o['retained'])
ew = [e[1] for e in ENT]
records = []      # (date, entity, statement, account, amount)
rev_month_entity = {}
for i, a in enumerate(A):
    y = a['year']
    for name, stmt, key, sign in FLOW_ACCTS:
        by_month = split_int(a[key], SEASON * (1 + rng.normal(0, 0.02, 12)))
        for m in range(12):
            by_ent = split_int(int(by_month[m]), np.array(ew) * (1 + rng.normal(0, 0.03, 5)))
            end = (dt.date(y, m + 2, 1) if m < 11 else dt.date(y + 1, 1, 1)) - dt.timedelta(days=1)
            for e in range(5):
                records.append((end, ENT[e][0], stmt, name, int(by_ent[e])))
                if key == 'revenue': rev_month_entity[(y, m, e)] = int(by_ent[e])
    for name, key in STOCK_ACCTS:
        start = OPEN[key] if i == 0 else A[i - 1][key]
        for m in range(12):
            bal = a[key] if m == 11 else R(start + (a[key] - start) * (m + 1) / 12 * (1 + rng.normal(0, 0.01)))
            by_ent = split_int(bal, ew)
            end = (dt.date(y, m + 2, 1) if m < 11 else dt.date(y + 1, 1, 1)) - dt.timedelta(days=1)
            for e in range(5): records.append((end, ENT[e][0], 'Balance sheet', name, int(by_ent[e])))
records.sort(key=lambda r: (r[0], r[1], r[3]))
REC_HEAD = ['Period end', 'Entity', 'Statement', 'Account', 'Amount (USD)']
assert len(records) == 32 * 72 * 5 == 11520

# ---------------------------------------------------------------- order lines: 15,000 rows that add up to revenue by month and region
PRODUCTS = [('Oat clusters', 4.2), ('Sunflower butter', 6.8), ('Seed crackers', 3.6), ('Cold-pressed oil', 9.5), ('Trail mix', 5.1), ('Granola bars', 2.9), ('Nut milk', 3.9), ('Protein bites', 7.4)]
CHANNELS = ['Grocery', 'Club', 'Online', 'Food service', 'Convenience']
N_ORD = 15000
cells = sorted(rev_month_entity.keys())
wcell = np.array([rev_month_entity[c] for c in cells], float)
per_cell = split_int(N_ORD, wcell)
per_cell = np.maximum(per_cell, 1)
while per_cell.sum() > N_ORD: per_cell[np.argmax(per_cell)] -= 1
while per_cell.sum() < N_ORD: per_cell[np.argmax(wcell)] += 1
orders = []; oid = 100000
for (y, m, e), n in zip(cells, per_cell):
    amounts = split_int(rev_month_entity[(y, m, e)], rng.lognormal(0, 0.6, int(n)))
    days = (dt.date(y, m + 2, 1) if m < 11 else dt.date(y + 1, 1, 1)) - dt.date(y, m + 1, 1)
    for amt in amounts:
        p = int(rng.integers(0, len(PRODUCTS))); price = round(PRODUCTS[p][1] * float(rng.uniform(0.9, 1.1)), 2)
        oid += 1
        orders.append((dt.date(y, m + 1, 1) + dt.timedelta(days=int(rng.integers(0, days.days))), f'SO-{oid}', ENT[e][0].replace('Helio Foods ', ''), CHANNELS[int(rng.integers(0, 5))],
                       PRODUCTS[p][0], R(amt / price), price, int(amt), R(amt * (1 - gm[YEARS.index(y)]) * float(rng.uniform(0.94, 1.06)))))
orders.sort(key=lambda r: (r[0], r[1]))
ORD_HEAD = ['Order date', 'Order ID', 'Region', 'Channel', 'Product', 'Units', 'Unit price (USD)', 'Net revenue (USD)', 'Cost of goods (USD)']
# a few deliberate blemishes for the quality checks: two blank cells, one exact duplicate row, one abnormal value
orders_x = [list(r) for r in orders]
orders_x[407][3] = None; orders_x[9120][5] = None
orders_x.append(list(orders_x[2500]))
orders_x[13333][6] = 9999.0
assert len(orders_x) == N_ORD + 1

# ---------------------------------------------------------------- write the .xls (BIFF8)
wb = xlwt.Workbook(encoding='utf-8')
bold = xlwt.easyxf('font: bold on'); datef = xlwt.easyxf(num_format_str='YYYY-MM-DD'); numf = xlwt.easyxf(num_format_str='#,##0')
for name, rows in SHEETS:
    ws = wb.add_sheet(name)
    for r, row in enumerate(rows):
        for c, v in enumerate(row): ws.write(r, c, v, bold if r in (0, 3) else (numf if isinstance(v, (int, float)) else xlwt.Style.default_style))
ws = wb.add_sheet('Monthly records')
for c, v in enumerate(REC_HEAD): ws.write(0, c, v, bold)
for r, rec in enumerate(records, 1):
    ws.write(r, 0, rec[0], datef); ws.write(r, 1, rec[1]); ws.write(r, 2, rec[2]); ws.write(r, 3, rec[3]); ws.write(r, 4, rec[4], numf)
wb.save(os.path.join(OUT, 'helio-foods-group.xls'))

# ---------------------------------------------------------------- write the .xlsx
wx = Workbook(); first = True
for name, rows in SHEETS:
    ws = wx.active if first else wx.create_sheet(); ws.title = name; first = False
    for row in rows: ws.append(row)
    ws['A1'].font = Font(bold=True); ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=1 + N)
    for cell in ws[4]: cell.font = Font(bold=True); cell.alignment = Alignment(horizontal='right')
    ws.column_dimensions['A'].width = 46
ws = wx.create_sheet('Monthly records'); ws.append(REC_HEAD)
for rec in records: ws.append(list(rec))
for row in ws.iter_rows(min_row=2, min_col=1, max_col=1):
    row[0].number_format = 'yyyy-mm-dd'
ws = wx.create_sheet('Sales orders'); ws.append(ORD_HEAD)
for rec in orders_x: ws.append(rec)
for row in ws.iter_rows(min_row=2, min_col=1, max_col=1):
    row[0].number_format = 'yyyy-mm-dd'
ws = wx.create_sheet('Notes')
for line in ['Helio Foods Group, Inc. is a fictional company. Every figure in this workbook was generated for Sunflower Intelligence.',
             'Statements are in thousands of US dollars; the monthly records and the order lines are in whole US dollars.',
             'The fiscal year ends on 31 December. In 2023 the group bought a brand for $96m (goodwill $62m, intangibles $34m), funded with debt.',
             'The order lines hold four deliberate blemishes for the data-quality checks: two blank cells, one repeated row and one abnormal unit price.']:
    ws.append([line])
wx.save(os.path.join(OUT, 'helio-foods-group.xlsx'))

# ---------------------------------------------------------------- reference figures, worked independently with pandas
df = pd.DataFrame(A).set_index('year')
avg = lambda s: (s + s.shift(1)) / 2
ratios = pd.DataFrame(index=df.index)
ratios['grossMargin'] = df.grossProfit / df.revenue; ratios['ebitdaMargin'] = df.ebitda / df.revenue; ratios['ebitMargin'] = df.ebit / df.revenue; ratios['netMargin'] = df.netIncome / df.revenue
ratios['roa'] = df.netIncome / avg(df.ta); ratios['roe'] = df.netIncome / avg(df.equity)
debt = df.ltd + df.curd
ic = debt + df.equity - df.cash - df.sti
ratios['roic'] = df.ebit * (1 - df.tax / df.pretax) / avg(ic)
ratios['current'] = df.currentAssets / df.currentLiabilities; ratios['quick'] = (df.cash + df.sti + df.ar) / df.currentLiabilities; ratios['cashRatio'] = (df.cash + df.sti) / df.currentLiabilities
ratios['debtToEquity'] = debt / df.equity; ratios['netDebtToEbitda'] = (debt - df.cash - df.sti) / df.ebitda; ratios['interestCoverage'] = df.ebit / df.interestExpense
ratios['assetTurnover'] = df.revenue / avg(df.ta); ratios['inventoryTurnover'] = df.cogs / avg(df.inv)
ratios['dso'] = 365 / (df.revenue / avg(df.ar)); ratios['dio'] = 365 / (df.cogs / avg(df.inv)); ratios['dpo'] = 365 / (df.cogs / avg(df.ap))
ratios['ccc'] = ratios.dso + ratios.dio - ratios.dpo
ratios['revenueGrowth'] = df.revenue.pct_change(); ratios['netIncomeGrowth'] = df.netIncome.pct_change(); ratios['cfoGrowth'] = df.cfo.pct_change()
ratios['fcf'] = (df.cfo - df.capex) / 1000.0
# Altman Z'' (non-manufacturers, book equity): 6.56 X1 + 3.26 X2 + 6.72 X3 + 1.05 X4
ratios['altmanZdouble'] = 6.56 * (df.currentAssets - df.currentLiabilities) / df.ta + 3.26 * df.retained / df.ta + 6.72 * df.ebit / df.ta + 1.05 * df.equity / df.tl
rec = pd.DataFrame(records, columns=['date', 'entity', 'statement', 'account', 'amount'])
ordf = pd.DataFrame(orders_x, columns=['date', 'id', 'region', 'channel', 'product', 'units', 'price', 'revenue', 'cost'])
ordf['year'] = pd.to_datetime(ordf.date).dt.year
clean = lambda d: {str(k2): (None if (isinstance(v, float) and np.isnan(v)) else (float(v) if isinstance(v, (np.floating, float)) else int(v))) for k2, v in d.items()}
fx = dict(
    years=YEARS,
    sheets=dict(xls={'Income Statement': len(SHEETS[0][1]), 'Balance Sheet': len(SHEETS[1][1]), 'Cash Flow': len(SHEETS[2][1]), 'Monthly records': len(records) + 1},
                xlsx={'Income Statement': len(SHEETS[0][1]), 'Balance Sheet': len(SHEETS[1][1]), 'Cash Flow': len(SHEETS[2][1]), 'Monthly records': len(records) + 1, 'Sales orders': len(orders_x) + 1, 'Notes': 4}),
    recordsSum=int(rec.amount.sum()), ordersRevenueSum=int(ordf.revenue.sum()), ordersUnitsSum=int(ordf.units.sum()), ordersMissing=int(ordf.isna().sum().sum()), ordersDuplicates=int(ordf.duplicated().sum()),
    ordersRevenueByYear=clean(ordf.groupby('year').revenue.sum().to_dict()), ordersRevenueByRegion=clean(ordf.groupby('region').revenue.sum().to_dict()),
    annual={str(a['year']): {k2: (v / 1000.0 if k2 not in ('year', 'shares') else v) for k2, v in a.items()} for a in A},
    ratios={c: clean(ratios[c].to_dict()) for c in ratios.columns},
    revenueCagr=float((df.revenue.iloc[-1] / df.revenue.iloc[0]) ** (1 / (N - 1)) - 1),
)
with open(os.path.join(ROOT, 'tests', 'fixtures-workbook.json'), 'w') as f: json.dump(fx, f, indent=1)
print('rows: records', len(records), 'orders', len(orders_x), '| revenue', [a['revenue'] // 1000 for a in A], '| cash', [a['cash'] // 1000 for a in A], '| ni', [a['netIncome'] // 1000 for a in A])
for fn in ['helio-foods-group.xls', 'helio-foods-group.xlsx']: print(fn, os.path.getsize(os.path.join(OUT, fn)), 'bytes')
