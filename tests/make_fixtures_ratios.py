# Fixtures for tests/ratios.test.mjs: ratios computed independently in Python from random statements.
# Run: python3 tests/make_fixtures_ratios.py
import json, random
random.seed(20271231)
def period(months=12):
    rev = random.uniform(1e5, 1e7); cogs = rev * random.uniform(0.3, 0.8)
    op = rev * random.uniform(-0.05, 0.25); da = rev * random.uniform(0.01, 0.08)
    interest = rev * random.uniform(0.001, 0.03); pretax = op - interest
    tax = max(pretax, 0) * 0.25; ni = pretax - tax
    ta = rev * random.uniform(0.4, 2.0); ca = ta * random.uniform(0.15, 0.6)
    cash = ca * random.uniform(0.05, 0.5); rec = ca * random.uniform(0.1, 0.4); inv = ca * random.uniform(0.0, 0.4)
    cl = ca * random.uniform(0.4, 2.5); tl = cl + ta * random.uniform(0.05, 0.5)
    eq = ta - tl
    return dict(months=months, revenue=rev, cogs=cogs, grossProfit=rev-cogs, operatingIncome=op, ebit=op, interestExpense=interest,
                pretax=pretax, tax=tax, netIncome=ni, da=da, cash=cash, shortTermInvestments=ca*random.uniform(0, .05), receivables=rec, inventory=inv,
                currentAssets=ca, ppeNet=ta*random.uniform(.2,.6), totalAssets=ta, payables=cl*random.uniform(.2,.6), currentLiabilities=cl,
                totalLiabilities=tl, debt=tl*random.uniform(.1,.7), leaseLiabilities=tl*random.uniform(0,.3), equity=eq,
                retainedEarnings=eq*random.uniform(-.5,.9), marketEquity=abs(eq)*random.uniform(.5,4),
                cfo=ni+da+rev*random.uniform(-.05,.05), capex=rev*random.uniform(.01,.1), dividends=max(ni,0)*random.uniform(0,.6))
cases = []
for k in range(12):
    prev = period(12 if k % 3 else 10); cur = period(12)
    d = 365 * cur['months'] / 12
    av = lambda key: (cur[key] + prev[key]) / 2
    ebitda = cur['ebit'] + cur['da']
    debtL = cur['debt'] + cur['leaseLiabilities']
    rt = cur['revenue'] / av('receivables'); it = cur['cogs'] / av('inventory'); pt = cur['cogs'] / av('payables')
    exp = dict(
        current=cur['currentAssets']/cur['currentLiabilities'],
        quick=(cur['cash']+cur['shortTermInvestments']+cur['receivables'])/cur['currentLiabilities'],
        cashRatio=(cur['cash']+cur['shortTermInvestments'])/cur['currentLiabilities'],
        ocf=cur['cfo']/cur['currentLiabilities'],
        debtRatio=cur['totalLiabilities']/cur['totalAssets'], de=cur['debt']/cur['equity'], deL=debtL/cur['equity'],
        dcap=cur['debt']/(cur['debt']+cur['equity']), em=cur['totalAssets']/cur['equity'],
        cover=cur['ebit']/cur['interestExpense'], ebitdaCover=ebitda/cur['interestExpense'],
        netDebtEbitda=(cur['debt']-cur['cash'])/ebitda,
        assetTurnover=cur['revenue']/av('totalAssets'), dso=d/rt, dio=d/it, dpo=d/pt, ccc=d/rt+d/it-d/pt,
        grossMargin=(cur['revenue']-cur['cogs'])/cur['revenue'], netMargin=cur['netIncome']/cur['revenue'],
        roa=cur['netIncome']/av('totalAssets'), roe=cur['netIncome']/av('equity'),
        emAvg=av('totalAssets')/av('equity'),
        taxBurden=cur['netIncome']/cur['pretax'], interestBurden=cur['pretax']/cur['ebit'],
        cfoToNi=cur['cfo']/cur['netIncome'], accrualsRatio=(cur['netIncome']-cur['cfo'])/av('totalAssets'),
        fcf=cur['cfo']-cur['capex'],
        zdouble=6.56*(cur['currentAssets']-cur['currentLiabilities'])/cur['totalAssets'] + 3.26*cur['retainedEarnings']/cur['totalAssets']
               + 6.72*cur['ebit']/cur['totalAssets'] + 1.05*cur['equity']/cur['totalLiabilities'],
        z=1.2*(cur['currentAssets']-cur['currentLiabilities'])/cur['totalAssets'] + 1.4*cur['retainedEarnings']/cur['totalAssets']
          + 3.3*cur['ebit']/cur['totalAssets'] + 0.6*cur['marketEquity']/cur['totalLiabilities'] + 1.0*cur['revenue']/cur['totalAssets'],
        zprime=0.717*(cur['currentAssets']-cur['currentLiabilities'])/cur['totalAssets'] + 0.847*cur['retainedEarnings']/cur['totalAssets']
          + 3.107*cur['ebit']/cur['totalAssets'] + 0.42*cur['equity']/cur['totalLiabilities'] + 0.998*cur['revenue']/cur['totalAssets'],
        growthAnnualised=(cur['revenue'] - prev['revenue']*12/prev['months'])/(prev['revenue']*12/prev['months']),
    )
    cases.append(dict(cur=cur, prev=prev, exp=exp))
json.dump(dict(cases=cases), open('fixtures-ratios.json', 'w'))
print(len(cases), 'cases')
