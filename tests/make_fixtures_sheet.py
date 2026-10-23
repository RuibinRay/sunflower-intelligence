#!/usr/bin/env python3
"""Reference values for tests/sheet.test.mjs: every formula below is written into a workbook with openpyxl,
recalculated by LibreOffice Calc (headless), and the results are saved to tests/fixtures-sheet.json.

Run:  python3 tests/make_fixtures_sheet.py [path/to/recalc.py]
Needs LibreOffice (soffice) and openpyxl. The recalculation uses a small LibreOffice Basic macro (calculateAll, then
store), the same approach as the xlsx skill's recalc.py; pass that script's path to use it instead.

Functions new in Excel 365 (XLOOKUP, XMATCH, FILTER, SORT, SORTBY, UNIQUE, SEQUENCE, TEXTBEFORE, TEXTAFTER) are not
in LibreOffice 24.2, so tests/sheet.test.mjs checks them against Microsoft's documented examples instead. Where
LibreOffice and Excel are documented to differ, the case is listed in EXCEL_DIFFERS and the test uses Excel's value.
"""
import datetime as dt, json, os, shutil, subprocess, sys, tempfile
from pathlib import Path
from openpyxl import Workbook, load_workbook

HERE = Path(__file__).resolve().parent
serial = lambda y, m, d: (dt.date(y, m, d) - dt.date(1899, 12, 30)).days

ORDERS = [  # date, channel, product, qty, price
    ((2026, 3, 2), 'Online', 'House Blend', 2, 14),
    ((2026, 3, 3), 'Café', 'Flat White', 3, 4.2),
    ((2026, 3, 5), 'Online', 'Decaf Blend', 1, 15),
    ((2026, 3, 9), 'Wholesale', 'House Blend', 20, 9.5),
    ((2026, 3, 12), 'Café', 'Pastry', 4, 3.25),
    ((2026, 3, 14), 'Online', 'House Blend', 3, 14),
    ((2026, 3, 15), 'Café', 'Flat White', 2, 4.2),
    ((2026, 3, 18), 'Wholesale', 'Single Origin', 10, 12),
    ((2026, 3, 21), 'Online', 'Single Origin', 1, 18),
    ((2026, 3, 25), 'Café', 'Pastry', 6, 3.25),
    ((2026, 3, 28), 'Online', 'Decaf Blend', 2, 15),
    ((2026, 3, 31), 'Wholesale', 'House Blend', 15, 9.5),
]
CELLS = {'A1': 'Date', 'B1': 'Channel', 'C1': 'Product', 'D1': 'Qty', 'E1': 'Price', 'F1': 'Revenue'}
for i, (d, ch, pr, q, p) in enumerate(ORDERS, start=2):
    CELLS.update({f'A{i}': serial(*d), f'B{i}': ch, f'C{i}': pr, f'D{i}': q, f'E{i}': p, f'F{i}': round(q * p, 2)})
# mixed types for coercion rules (H4 is left empty)
CELLS.update({'H1': 10, 'H2': '5', 'H3': True, 'H5': 'abc', 'H6': -3.5, 'H7': '  Lantern   coffee ', 'H8': 0})
# an approximate-match rate table, a quarterly row, a descending list, a list with tied modes
CELLS.update({'J1': 'Spend', 'K1': 'Discount', 'J2': 0, 'K2': 0, 'J3': 100, 'K3': 0.02, 'J4': 250, 'K4': 0.05, 'J5': 500, 'K5': 0.08})
CELLS.update({'M1': 'Q1', 'N1': 'Q2', 'O1': 'Q3', 'P1': 'Q4', 'M2': 120, 'N2': 135, 'O2': 150, 'P2': 160})
CELLS.update({'R1': 100, 'R2': 75, 'R3': 50, 'R4': 25})
CELLS.update({f'S{i}': v for i, v in enumerate([3, 5, 5, 7, 3, 9, 2, 1], start=1)})

FORMULAS = [
    # operators and precedence
    '=-2^2', '=2^3^2', '=10-2-3', '=2*3%', '=50%*20', '=-3^-2', '=(1+2)*3', '=1+2*3-4/2', '="3"+4', '="abc"+1',
    '=TRUE+TRUE', '=1/0', '=0.1+0.2=0.3', '=1=1', '="a"="A"', '="a"<"b"', '=1<"a"', '=TRUE>"z"', '=H4=0', '=H4=""',
    '="a"&TRUE', '=1&2', '="Total: "&F2', '=H2*2', '=H5*1', '=-H2', '="5"*"2"', '=H3*3', '=2.5&""',
    # aggregates and the rule that references skip text and logicals
    '=SUM(F2:F13)', '=SUM(F:F)', '=SUM(H1:H8)', '=SUM(H2)', '=SUM("5",TRUE)', '=SUM(H1:H8)+H2', '=AVERAGE(H1:H8)',
    '=COUNT(H1:H8)', '=COUNTA(H1:H8)', '=COUNTBLANK(H1:H8)', '=MAX(F2:F13)', '=MIN(F2:F13)', '=MEDIAN(F2:F13)',
    '=AVERAGE(F2:F13)', '=STDEV.S(F2:F13)', '=STDEV.P(F2:F13)', '=VAR.S(F2:F13)', '=VAR.P(F2:F13)', '=STDEV(D2:D13)',
    '=PERCENTILE.INC(F2:F13,0.9)', '=QUARTILE.INC(F2:F13,1)', '=QUARTILE.INC(F2:F13,3)', '=LARGE(F2:F13,2)',
    '=SMALL(F2:F13,3)', '=RANK.EQ(F5,F2:F13)', '=RANK.EQ(F5,F2:F13,1)', '=MODE.SNGL(S1:S8)', '=PRODUCT(D2:D4)',
    '=AVERAGEA(H1:H8)', '=MAX(H1:H8)', '=MIN(H1:H8)', '=AVERAGE(H4)',
    '=CORREL(D2:D13,F2:F13)', '=RSQ(F2:F13,D2:D13)', '=SLOPE(F2:F13,D2:D13)', '=INTERCEPT(F2:F13,D2:D13)',
    '=FORECAST.LINEAR(12,F2:F13,D2:D13)', '=STEYX(F2:F13,D2:D13)', '=COVARIANCE.S(D2:D13,F2:F13)',
    '=COVARIANCE.P(D2:D13,F2:F13)', '=INDEX(LINEST(F2:F13,D2:D13),1)', '=INDEX(LINEST(F2:F13,D2:D13),2)',
    '=INDEX(LINEST(F2:F13,D2:D13,TRUE,TRUE),2,1)', '=INDEX(LINEST(F2:F13,D2:D13,TRUE,TRUE),3,1)',
    '=INDEX(LINEST(F2:F13,D2:D13,TRUE,TRUE),4,1)', '=INDEX(LINEST(F2:F13,D2:D13,TRUE,TRUE),5,2)',
    # conditional sums and counts, criteria and wildcards
    '=SUMIF(B2:B13,"Online",F2:F13)', '=SUMIF(B2:B13,"<>Online",F2:F13)', '=SUMIF(D2:D13,">=3",F2:F13)',
    '=SUMIF(C2:C13,"*Blend",F2:F13)', '=SUMIF(C2:C13,"?ouse*",F2:F13)', '=SUMIF(F2:F13,">20")',
    '=COUNTIF(B2:B13,"online")', '=COUNTIF(D2:D13,3)', '=COUNTIF(D2:D13,"3")', '=COUNTIF(D2:D13,"<"&D3)',
    '=COUNTIF(H1:H8,"")', '=COUNTIF(H1:H8,"<>")', '=COUNTIF(H1:H8,">5")', '=COUNTIF(H1:H8,TRUE)',
    '=COUNTIF(H1:H8,"*")', '=COUNTIF(A2:A13,">="&DATE(2026,3,15))', '=COUNTIF(C2:C13,"*a*")',
    '=SUMIFS(F2:F13,B2:B13,"Online",C2:C13,"House Blend")', '=SUMIFS(F2:F13,A2:A13,">="&DATE(2026,3,10),A2:A13,"<"&DATE(2026,3,20))',
    '=COUNTIFS(B2:B13,"Café",D2:D13,">2")', '=AVERAGEIF(B2:B13,"Wholesale",F2:F13)', '=AVERAGEIFS(F2:F13,B2:B13,"Online",D2:D13,">1")',
    '=MAXIFS(F2:F13,B2:B13,"Café")', '=MINIFS(F2:F13,B2:B13,"Online")', '=AVERAGEIF(B2:B13,"Retail",F2:F13)',
    '=SUMPRODUCT(D2:D13,E2:E13)', '=SUMPRODUCT((B2:B13="Online")*F2:F13)', '=SUMPRODUCT(--(B2:B13="Café"))',
    '=SUMIF(B2:B13,"Café",D2:D13)/COUNTIF(B2:B13,"Café")',
    # logic
    '=IF(F2>20,"Large","Small")', '=IF(F5>100,"High",IF(F5>20,"Mid","Low"))', '=IF(H4,"yes","no")', '=IF(FALSE,1)',
    '=IFS(D2>10,"bulk",D2>1,"multi",TRUE,"single")', '=SWITCH(B3,"Online","web","Café","shop","other")',
    '=SWITCH(B5,"Online","web","Café","shop")', '=AND(D2>1,E2>10)', '=OR(D3>5,E3>5)', '=NOT(D2>1)', '=AND(H1:H8)',
    '=IFERROR(1/0,"none")', '=IFERROR(F2/D2,0)', '=IFNA(VLOOKUP("Tea",C2:F13,4,FALSE),0)', '=ISBLANK(H4)', '=ISBLANK(H8)',
    '=ISNUMBER(H2)', '=ISTEXT(H2)', '=ISERROR(H5*1)', '=ISNA(NA())', '=IF(H2=5,"same","different")', '=H2="5"',
    # maths
    '=ROUND(2.345,2)', '=ROUND(-1.5,0)', '=ROUND(1234.5,-2)', '=ROUND(1.005,2)', '=ROUND(F3,0)', '=ROUNDUP(1.21,1)',
    '=ROUNDDOWN(-1.29,1)', '=ROUNDUP(-1.21,1)', '=INT(-2.5)', '=TRUNC(-2.5)', '=TRUNC(3.789,2)', '=MOD(-7,3)', '=MOD(7,-3)',
    '=MOD(10,4)', '=ABS(-4)', '=SQRT(-1)', '=SQRT(16)', '=POWER(2,10)', '=CEILING(4.2,0.5)', '=FLOOR(4.7,0.5)',
    '=ROUND(F2/3,2)*3', '=SIGN(-0.2)', '=EXP(1)', '=LN(10)', '=LOG10(1000)',
    # finance (the F04 functions)
    '=PMT(0.05/12,60,20000)', '=PMT(0,12,1200)', '=FV(0.04,10,-1000)', '=FV(0.04/12,24,-100,-500,1)', '=PV(0.06,5,-2000)',
    '=NPV(0.08,-1000,300,400,500)', '=PMT(0.06,4,-20000,0)',
    # text
    '=LEN(C2)', '=UPPER(C2)', '=LOWER(B3)', '=PROPER("lantern COFFEE co.")', '=TRIM(H7)', '=LEN(TRIM(H7))',
    '=LEFT(C2,5)', '=RIGHT(C2,5)', '=MID(C2,7,3)', '=LEFT(C2)', '=CONCAT(B2," – ",C2)', '=CONCATENATE(B2,"/",D2)',
    '=TEXTJOIN(", ",TRUE,J1,K1,H4,M1)', '=TEXTJOIN("-",FALSE,H3,H4,H8)', '=SUBSTITUTE(C2,"Blend","Roast")',
    '=SUBSTITUTE("a-b-c","-","+",2)', '=FIND("B",C2)', '=FIND("b",C2)', '=SEARCH("b",C2)', '=SEARCH("?lend",C2)',
    '=EXACT("Online",B2)', '=EXACT("online",B2)', '=VALUE("12.5")', '=VALUE(H2)+1', '=VALUE("abc")',
    '=TEXT(1234.567,"#,##0.00")', '=TEXT(0.256,"0.0%")', '=TEXT(A2,"mmm yyyy")', '=TEXT(A2,"dddd")',
    '=TEXT(A2,"d mmmm yyyy")', '=TEXT(-1234.5,"#,##0")', '=TEXT(7,"000")', '=REPT("*",3)', '=LEFT(F2,1)', '=LEN(F3)',
    # dates
    '=DATE(2026,3,14)', '=DATE(2026,13,1)', '=DATE(2026,3,0)', '=YEAR(A2)', '=MONTH(A13)', '=DAY(A13)',
    '=EOMONTH(A2,0)', '=EOMONTH(A2,-1)', '=EDATE(DATE(2026,1,31),1)', '=WEEKDAY(A2)', '=WEEKDAY(A2,2)',
    '=DAYS(A13,A2)', '=A13-A2', '=DATEVALUE("2026-03-14")', '=DATE(2024,2,29)+365', '=MONTH(EOMONTH(A2,11))',
    '=DATE(1900,3,1)', '=DATE(1900,1,1)', '=YEAR(60)', '=DAY(60)',
    # lookup and reference
    '=VLOOKUP("Pastry",C2:F13,4,FALSE)', '=VLOOKUP("Tea",C2:F13,4,FALSE)', '=VLOOKUP("Pastry",C2:F13,5,FALSE)',
    '=VLOOKUP(180,J2:K5,2,TRUE)', '=VLOOKUP(500,J2:K5,2)', '=VLOOKUP(-5,J2:K5,2,TRUE)', '=VLOOKUP(99.99,J2:K5,2,TRUE)',
    '=VLOOKUP("Dec*",C2:F13,3,FALSE)', '=VLOOKUP("house blend",C2:F13,2,FALSE)', '=HLOOKUP("Q3",M1:P2,2,FALSE)',
    '=MATCH("Pastry",C2:C13,0)', '=MATCH(260,J2:J5,1)', '=MATCH(60,R1:R4,-1)', '=MATCH("Tea",C2:C13,0)',
    '=INDEX(F2:F13,MATCH("Single Origin",C2:C13,0))', '=INDEX(A1:F13,4,3)', '=INDEX(M2:P2,3)', '=INDEX(J2:K5,3,2)',
    '=CHOOSE(2,"a","b","c")', '=ROW(C5)', '=COLUMN(C5)', '=ROWS(A2:F13)', '=COLUMNS(A2:F13)',
    '=SUM(INDEX(F2:F13,1):INDEX(F2:F13,3))', '=INDEX(F2:F13,MATCH(MAX(F2:F13),F2:F13,0))',
    '=VLOOKUP(INDEX(C2:C13,5),C2:D13,2,FALSE)',
]
# Functions written with Excel's "_xlfn." prefix in the file format (introduced after Excel 2007)
XLFN = ['STDEV.S', 'STDEV.P', 'VAR.S', 'VAR.P', 'PERCENTILE.INC', 'QUARTILE.INC', 'RANK.EQ', 'MODE.SNGL', 'FORECAST.LINEAR',
        'COVARIANCE.S', 'COVARIANCE.P', 'MAXIFS', 'MINIFS', 'IFS', 'SWITCH', 'IFNA', 'CONCAT', 'TEXTJOIN', 'DAYS']
# Cases where LibreOffice gives a different answer from Excel: the test uses Excel's value, with the reason.
# (a) LibreOffice has no logical type: TRUE is the number 1, so it sums, counts and joins as 1. Excel's COUNT/SUM
#     help: "Logical values ... typed directly into the list of arguments are counted"; in a reference "only numbers
#     ... are counted. Empty cells, logical values, text, or error values in the array or reference are not counted";
#     =SUM("5", 15, TRUE) is 21. Excel orders numbers < text < FALSE < TRUE when comparing, and TRUE joins as "TRUE".
# (b) Excel's COUNTIF help: =COUNTIF(A2:A5,"*") "Counts the number of cells containing any text".
# (c) Excel's SQRT help: "If number is negative, SQRT returns the #NUM! error value."
# (d) Excel's VLOOKUP help: "If col_index_num is greater than the number of columns in table-array, you'll get the
#     #REF! error value."
# (e) Excel treats 1900 as a leap year (Microsoft: "Excel incorrectly assumes that the year 1900 is a leap year"), so
#     1 January 1900 is serial 1 and serial 60 is 29 February 1900; LibreOffice counts from 30 December 1899.
EXCEL_DIFFERS = {
    '=TRUE>"z"': True, '="a"&TRUE': 'aTRUE', '=SUM(H1:H8)': 6.5, '=SUM("5",TRUE)': 6, '=SUM(H1:H8)+H2': 11.5,
    '=AVERAGE(H1:H8)': 6.5 / 3, '=COUNT(H1:H8)': 3, '=TEXTJOIN("-",FALSE,H3,H4,H8)': 'TRUE--0',      # (a)
    '=COUNTIF(H1:H8,"*")': 3,                                                                            # (b)
    '=SQRT(-1)': {'error': '#NUM!'},                                                                     # (c)
    '=VLOOKUP("Pastry",C2:F13,5,FALSE)': {'error': '#REF!'},                                             # (d)
    '=DATE(1900,1,1)': 1, '=DAY(60)': 29,                                                                # (e)
}

MACRO = """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE script:module PUBLIC "-//OpenOffice.org//DTD OfficeDocument 1.0//EN" "module.dtd">
<script:module xmlns:script="http://openoffice.org/2000/script" script:name="Module1" script:language="StarBasic">
  Sub RecalculateAndSave()
    ThisComponent.calculateAll()
    ThisComponent.store()
    ThisComponent.close(True)
  End Sub
</script:module>"""


def xlfn(f):
    import re
    for name in XLFN:
        f = re.sub(r'(?<![A-Za-z_.])' + re.escape(name) + r'\(', '_xlfn.' + name + '(', f)
    return f


def recalc(path):
    if len(sys.argv) > 1:
        subprocess.run([sys.executable, sys.argv[1], str(path), '60'], check=True, capture_output=True)
        return
    prof = Path(tempfile.mkdtemp())
    url = prof.as_uri()
    subprocess.run(['soffice', '--headless', '--terminate_after_init', f'-env:UserInstallation={url}'], capture_output=True, timeout=120)
    mdir = prof / 'user' / 'basic' / 'Standard'
    (mdir / 'Module1.xba').write_text(MACRO)
    subprocess.run(['soffice', '--headless', f'-env:UserInstallation={url}',
                    'vnd.sun.star.script:Standard.Module1.RecalculateAndSave?language=Basic&location=application',
                    str(path)], capture_output=True, timeout=180, check=True)
    shutil.rmtree(prof, ignore_errors=True)


def main():
    tmp = Path(tempfile.mkdtemp()) / 'sheet.xlsx'
    wb = Workbook(); ws = wb.active
    for k, v in CELLS.items(): ws[k] = v
    at = {}
    for i, f in enumerate(FORMULAS, start=1):
        a = f'Z{i}'; at[f] = a
        ws[a] = xlfn(f)
    wb.save(tmp)
    recalc(tmp)
    vals = load_workbook(tmp, data_only=True).active
    out = []
    for f in FORMULAS:
        v = vals[at[f]].value
        if isinstance(v, str) and v.startswith('#'): v = {'error': v}
        elif isinstance(v, (dt.datetime, dt.date)): v = (v.date() if isinstance(v, dt.datetime) else v) - dt.date(1899, 12, 30); v = v.days
        out.append([at[f], f, EXCEL_DIFFERS[f], {'libreoffice': v}] if f in EXCEL_DIFFERS else [at[f], f, v])
    fx = {'source': 'LibreOffice ' + subprocess.run(['soffice', '--version'], capture_output=True, text=True).stdout.split()[1],
          'cells': CELLS, 'cases': out}
    (HERE / 'fixtures-sheet.json').write_text(json.dumps(fx, ensure_ascii=False, indent=0))
    print(f'{len(out)} cases → tests/fixtures-sheet.json')


if __name__ == '__main__':
    main()
