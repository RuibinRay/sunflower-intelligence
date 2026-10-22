#!/usr/bin/env python3
"""Builds assets/data/sp500-monthly.json: S&P 500 monthly total returns (price plus dividends), January 1950 to June 2023.

Source: Robert Shiller's monthly stock market data, as tidied at github.com/datasets/s-and-p-500 (ODC PDDL).
Shiller's dividends end in June 2023, so the series stops there. His prices are monthly averages of daily closes,
which smooths month-to-month swings a little. Rerun:  python3 tools/build_sp500.py
"""
import csv, io, json, urllib.request
from pathlib import Path

URL = "https://raw.githubusercontent.com/datasets/s-and-p-500/main/data/data.csv"
rows = list(csv.DictReader(io.StringIO(urllib.request.urlopen(URL, timeout=60).read().decode())))
rows = [r for r in rows if "1949-12" <= r["Date"][:7] <= "2023-06"]
months, rets = [], []
for prev, cur in zip(rows, rows[1:]):
    p0, p1, d1 = float(prev["SP500"]), float(cur["SP500"]), float(cur["Dividend"])
    months.append(cur["Date"][:7])
    rets.append(round((p1 + d1 / 12) / p0 - 1, 6))
out = {
    "name": "S&P 500 total return, monthly",
    "source": "Robert Shiller, monthly stock market data (via github.com/datasets/s-and-p-500)",
    "note": "Price plus one twelfth of the annual dividend; Shiller's prices are monthly averages of daily closes.",
    "months": months, "returns": rets,
}
dest = Path(__file__).resolve().parent.parent / "assets/data/sp500-monthly.json"
dest.write_text(json.dumps(out, separators=(",", ":")))
print(dest, len(rets), months[0], months[-1], min(rets), max(rets))
