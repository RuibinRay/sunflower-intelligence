# Finance school: where the source documents go

Ray supplied three documents to fold into the Finance & Accounting school:

- `comprehensive_finance_and_accounting_report.md` (four chapters).
- `Complete_Finance_Master_Report.docx`, the same text as the report with formula images.
- `Finance_Master_Textbook.docx`, 13 parts of about 12,000 words, with practice problems and four company case studies.

Everything in them is mapped below to the course that will teach it, in the suggested study order (see `ORDER` in `catalog.js`).

Nothing is copied across as-is. Every explanation is rewritten to the lesson standard in `AUTHORING.md`. Every number is recomputed in `checks`. Every practice problem is re-derived before it is used, and the errors below are corrected. Real-company facts in the case studies are used only after being confirmed against the company's filings, and are cited with a date. Anything that cannot be confirmed is left out.

## Coverage map

| Source | Content | Course | Notes |
|---|---|---|---|
| Report ch. 1; Textbook 1.1–1.6 | What finance is; time and risk; finance vs accounting vs economics; personal, corporate and investment finance; decision principles | **F00 Foundations of Finance**, module 1 | Rearview mirror and windshield framing is kept. "Six principles" become one lesson each, briefly. |
| Report ch. 1 | Financial vs managerial accounting | **F00**, module 1; F01 lesson 1 already covers users of accounting | Managerial accounting is not otherwise in the catalogue: flagged as a gap (a future course). |
| Textbook Part 2 | Essential vocabulary: capital, liquidity, valuation, market cap, EV, EBITDA, working capital … | **F00**, module 2, and the glossary | Each term is defined in the lesson where it is first used, so the glossary links back to it. |
| Textbook Part 8; report ch. 4 intro | Types of financial markets; market participants | **F00**, module 3 | |
| Report ch. 3 (governance); Textbook 5.x on agency | Agency problem, boards, incentives | **F00**, module 3 (intro) and **F05** (depth) | |
| Report ch. 2; Textbook 3.1–3.4 | The three statements and how they connect | **F01** lesson 10 (built), then **F02** | The report's sample balance sheet and income statement are reused only as worked-example *shapes*, with Lantern figures. |
| Textbook 3.5, Part 10 | How investors analyse statements; growth, profitability, liquidity, solvency, efficiency ratios | **F03** | |
| Textbook 4.1 | Time value of money: FV, PV, annuities, perpetuities, growing perpetuities | **F04 Mathematics of Finance** | Problems 19 and 20 are corrected (below). |
| Textbook 4.2; report ch. 3 | NPV, IRR, payback, WACC, FCF | **F05 Corporate Finance** | IRR trial corrected (below). |
| Textbook 4.3–4.4, 6.1–6.4, Part 9 | Risk and return, CAPM, beta, Sharpe; stocks, bonds, funds, MPT | **F06 Investment Analysis** | Bond example corrected (below). |
| Textbook Part 7 | DCF and relative valuation | **F06** (valuation basics) and **F07** (building the model) | DCF example rounding corrected (below). |
| Textbook 5.1–5.4 | Debt vs equity, capital structure, dividends vs buybacks, M&A | **F05**; M&A in **F08** | |
| Report ch. 4; Textbook 9.1–9.4 | Derivatives, options, futures, swaps, margin, short selling, hedging | **F08 Advanced Financial Decision-Making** | |
| Textbook Part 11 | Cases: Apple, Tesla, Amazon, Enron | **F03** (Amazon, Enron), **F06** (Apple, Tesla) | Facts and figures must come from the companies' 10-K filings (SEC EDGAR) or, for Enron, the Powers Report and court record, cited with dates. The textbook's figures are not used unverified. |
| Textbook Part 12 | Cumulative review problems | Final assessments of F04, F05 and F06 | Each problem re-derived and checked by `check` functions. |
| Textbook Part 13 | Modelling practice, reading a 10-K, research process, valuation model, company framework | **F07 Financial Modelling** | |

## Errors found in the textbook (corrected wherever the material is reused)

All recomputed by script on 2026-10-22.

| Where | Textbook says | Correct | Cause |
|---|---|---|---|
| Problem 19 | $12,005.86 | **$12,005.84** | Rounding of intermediate values |
| Problem 20 | $11,583.36 | **$11,582.75** | Rounding of intermediate values |
| Bond pricing example | face PV $839.92, price $973.57 | **$839.62 and $973.27** | Discount factor rounded too early |
| IRR worked trial at 22% | total PV 99,433.88 | **99,422.42; NPV −577.58** | Arithmetic slip in one year's discounting |
| DCF example | EV = $460.06M + $1,434.85M = $1,894.91M | **$1,894.92M** (the two parts, unrounded, add to 1,894.92) | Rounding of the parts before adding |

## Structure of F00 (built and reviewed, 2026-10-23) and F04 (planned)

**F00 Foundations of Finance** (introductory; no prerequisites; recommended before F01 and F04). Built as planned below, with the lab replaced by a formula explorer in each lesson; its case is `f00/case.js`.

1. *What finance is.*
   - Lessons: finance-time-and-risk; finance-accounting-economics; decision-principles.
2. *The language of finance.*
   - Lessons: capital-and-liquidity; value-and-valuation-words (market cap, EV, EBITDA, working capital); interest-and-inflation.
3. *Markets and the people in them.*
   - Lessons: financial-markets; market-participants; governance-and-agency.
4. *Lab:* a time-and-risk explorer (formula widgets).
5. *Project:* compare two savings and investment choices, and explain them in plain language.

**F04 Mathematics of Finance** (introductory; F00 recommended)

1. *Interest:* simple-and-compound-interest; effective-annual-rates.
2. *Present and future value:* present-and-future-value; discounting-cash-flows.
3. *Streams of cash:* annuities; perpetuities-and-growth; loan-amortisation.
4. *Real versus nominal:* inflation-and-real-returns; mortgages.
5. *Project:* a loan and savings plan.

F04 lessons are written in this order next.
