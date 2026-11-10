# Calculation audit: Sunflower Intelligence 2.0

Date: 2026-11-10. Scope: every financial and statistical engine in `assets/js/core/`, the new workbook importer, and
the Company Intelligence exports. This file states what was checked, against what, what was wrong, what was changed,
and what has not been verified.

## Method

Reference values are produced by Python and stored as JSON fixtures; Node test files load the site's own engine modules
and compare. No engine is tested against itself.

| Fixture script | Reference libraries | Test file | Checks |
|---|---|---|---|
| `tests/make_fixtures_audit.py` | NumPy, SciPy, statsmodels, scikit-learn, numpy-financial | `tests/audit.test.mjs` | 7,201 |
| `tests/make_workbooks.py` | xlwt, openpyxl (writers); pandas, xlrd (independent totals) | `tests/workbook.test.mjs` | 1,078 |
| `tests/make_fixtures_valuation.py` | NumPy | `tests/valuation.test.mjs` | 293 |
| `tests/make_fixtures.py` | SciPy, statsmodels, numpy-financial | `tests/stats.test.mjs` | 362 |
| `tests/make_fixtures_ml.py` | scikit-learn, SciPy | `tests/ml.test.mjs` | 75 |
| `tests/make_fixtures_mkt.py` | pandas, NumPy, scikit-learn | `tests/mkt.test.mjs` | 828 |

The other suites (`ratios`, `regression`, `correlation`, `inference`, `customer`, `corpfin`, `sheet`, `accounting`,
`cleaning`, `mixsim`, `percmap`, `survey`, `csv`, `lessons`) were rerun unchanged. All 20 suites pass: run
`for t in tests/*.test.mjs; do node "$t"; done`.

### What the 7,201 audit checks cover

| Area | Engine | Reference |
|---|---|---|
| NPV, IRR (including multiple roots), MIRR, payback, discounted payback, profitability index, equivalent annuity | `invest.js` | numpy-financial, SciPy `brentq` |
| Bond price, yield, Macaulay and modified duration, convexity | `fin.js` | closed forms in NumPy, SciPy root finding |
| Black–Scholes–Merton prices, Greeks, implied volatility | `fin.js` | SciPy `norm` |
| Portfolio return, volatility, Sharpe, Sortino, drawdown, beta, alpha, tracking error | `portfolio.js` | NumPy, statsmodels OLS |
| Efficient frontier, minimum variance and maximum Sharpe, long-only | `portfolio.js` | SciPy SLSQP |
| Historical, parametric and Cornish–Fisher VaR and expected shortfall | `risk.js` | NumPy, SciPy |
| Kupiec, Christoffersen and binomial backtests, Basel traffic light | `risk.js` | SciPy `chi2`, `binom` |
| Normal, t, chi-square, F: densities, tails, quantiles, far tails | `stats.js` | SciPy |
| OLS coefficients, standard errors, t, p, intervals, R², F, HC3, Breusch–Pagan, VIF | `stats.js` | statsmodels |
| Two-proportion z test, intervals, sample size and power | `abtest.js` | statsmodels, SciPy |
| Unit economics (CAC, LTV, payback) | `saas.js` | NumPy |
| Holt–Winters additive and multiplicative | `forecast.js` | recursions written independently in NumPy |
| DCF (FCFF, FCFE), terminal values, WACC, DDM, tornado, scenarios | `valuation.js` | NumPy (valuation suite) |

## Confirmed errors and corrections

Each was reproduced against a reference value before the fix, fixed in the engine, and pinned by a regression test.

1. **Normal distribution, far tails** (`stats.js`). `normCdf` lost relative accuracy beyond about 6 standard deviations
   and `normQuantile` was asymmetric for p above 0.5. Two-sided p-values for very large z statistics therefore
   printed as 0 or as a value wrong in its leading digits. Fix: a tail-accurate complementary error function for
   `normCdf`, and the quantile computed by symmetry for p > 0.5. `abtest.js` and `classify.js` now compute
   p = 2·Φ(−|z|) instead of 2·(1 − Φ(|z|)), which cancels catastrophically. Reference: `scipy.stats.norm.cdf`,
   `norm.sf`, `norm.ppf`.
2. **Chi-square upper tail** (`stats.js`). `chi2PUpper` was computed as 1 − CDF, which underflows for large statistics
   (Kupiec and Christoffersen tests on a badly failing model). Fix: a regularised upper incomplete gamma function,
   `gammaQ`. Reference: `scipy.stats.chi2.sf`.
3. **Revenue CAGR with gap years** (`valuation.js`, `valuation-report.js`). The growth default and the report narrative
   divided by the number of rows minus one. With a missing fiscal year that overstates the annual rate. Fix: divide by
   the calendar years elapsed between first and last period.
4. **Debt derived from current debt alone** (`valuation.js`). When a balance sheet gave only the current portion of
   debt, total debt stayed blank and net debt was understated to zero. Fix: total debt is derived from whichever parts
   are present and labelled "derived".
5. **Formula cells without cached values in the `.xlsx` writer** (`valuation-io.js`). Exported workbooks carried
   formulas with no cached result, so readers that do not recalculate (including SheetJS and previewers) showed empty
   cells. Fix: every formula cell is written with its computed value.
6. **Saved projects did not save** (`intel/store.js`, found in browser testing). A new project was written with an
   undefined key and IndexedDB rejected it. Fix: the generated id is no longer overwritten.

Importer defects found while building the fixtures and fixed before release: "December 31" read as fiscal year 2031;
operating-expense lines doubled when the same statement appeared on two sheets; floating-point noise from unit scaling
(5600 × 0.001); skewed positive columns flagged as outliers on a linear scale.

One test, not an engine, was wrong: an NPV-at-IRR tolerance was absolute where it had to scale with the cash flows.

## Conventions kept on purpose

These differ from some textbooks or libraries and are correct as stated on the pages, so they were not changed.

- Sample statistics use n − 1; population versions are labelled where offered.
- Historical VaR uses the empirical quantile with linear interpolation (NumPy's default).
- Sharpe and Sortino ratios annualise by the square root of periods per year.
- DCF discounts at year end by default; mid-year discounting is a switch in the Valuation Studio.
- Ratios average opening and closing balances where a prior year exists, and say so.
- Altman Z″ and Z′ are shown without a share price; the original Z only when market value is known.
- IRR reports every real root in range when cash flows change sign more than once.

## Workbook import: what was verified

`tests/make_workbooks.py` writes two workbooks for a fictional company and records independent totals.

| File | Format | Sheets | Rows | Verified |
|---|---|---|---|---|
| `assets/data/samples/helio-foods-group.xls` | BIFF8 (xlwt) | 4 | 11,575 | every row and cell count; statements; 11,520 monthly records rolled into fiscal years |
| `assets/data/samples/helio-foods-group.xlsx` | OOXML (openpyxl) | 6 | 26,581 | as above, plus 15,001 order lines, formulas, merged cells, a notes sheet, planted blanks, a duplicate row and an outlier |

In Node: row and cell counts match pandas for every sheet; statements built from the workbook match the generator's
figures; the balance sheet balances and cash reconciles in every year; all ratios match values computed in NumPy;
units (thousands against whole units), sign conventions, negative figures, a second currency with and without a rate,
non-December fiscal year ends, part years and missing lines are each tested. Macros are never executed: the reader
only reports that a VBA project is present.

In the browser (the in-app pane, desktop and 375 px widths): both samples read in the Web Worker with all rows
(11,575 and 26,581); the dashboard builds; valuation, tornado, sensitivity grid, scenarios and Monte Carlo render;
CSV and JSON exports match the displayed figures; save, reopen, the handoff to the Valuation Studio and the homepage
file drop work; no console errors.

## Exports

The Excel export writes live formulas. `tests/workbook.test.mjs` reopens the exported file, recomputes every formula
with the site's own spreadsheet engine (`sheet.js`) and compares with the dashboard's figures. Statements and ratios
CSV and project JSON were compared with the display in the browser.

## Not verified

- Opening the exported `.xlsx` in Microsoft Excel itself. It was reopened with SheetJS and recomputed in Node only.
- Printed or PDF output of the report. The print stylesheet exists; no page was printed.
- Homepage scroll choreography timing and frame rate. The test pane reports reduced motion and does not run animation
  frames, so the zoom and scene logic were stepped by hand. Check it in a normal browser window; `?motion=force`
  overrides reduced motion for testing.
- Real phones and tablets, and browsers other than Chromium.
- `.xls` files written by Excel 95 or earlier (BIFF5), password-protected workbooks, and files larger than the 1 MB and 1.6 MB samples (the page refuses files over 150 MB).

## References

CFA Institute, *Financial Statement Analysis*. Koller, Goedhart and Wessels, *Valuation*, 7th ed. Damodaran,
*Investment Valuation*, 3rd ed. Hull, *Options, Futures, and Other Derivatives*. Jorion, *Value at Risk*. Altman (1968,
2000). Kupiec (1995). Christoffersen (1998). Basel Committee (1996), supervisory framework for backtesting. Greene,
*Econometric Analysis*. MacKinnon and White (1985) for HC3. Library documentation for NumPy, SciPy, statsmodels,
scikit-learn and numpy-financial.
