# Sunflower Intelligence

Finance, business analytics and marketing tools set inside a living sunflower painting after Van Gogh. The homepage is the painting: six flowers open six rooms, keyed by a plaque in the corner like a gallery label. Each tool room is a hub with its own pages.

**Live:** https://ruibinray.github.io/sunflower-intelligence/

| Room | Flower | Pages and what they do |
|---|---|---|
| [Finance](finance/) | the golden bloom at the centre | **Valuation:** cost of capital (CAPM, WACC) feeding a DCF with a sensitivity table. **Investment decisions:** NPV, every IRR, MIRR, payback, discounted payback and PI for up to three projects, the NPV profile with crossover rates, and capital rationing solved exactly next to the PI shortcut. **Stock analysis:** return, volatility, Sharpe, Sortino, drawdown and moving averages; CAPM beta and alpha with a rolling beta; the long-only efficient frontier (exact, by subset enumeration) with a stability check. **Risk management:** VaR and Expected Shortfall three ways (historical, normal, Monte Carlo Student-t), rolling backtests with Kupiec, Christoffersen and the Basel traffic light, stress scenarios with duration and convexity, and the Altman Z-scores. **Bonds and options:** price, yield, duration, convexity; Black–Scholes–Merton, Greeks and implied volatility |
| [Business analytics](analytics/) | the dark-eyed bloom on the left | **Explore:** data-quality audit, descriptive statistics, correlations, OLS with diagnostics and HC3. **Supervised learning:** logistic regression, a CART decision tree, k-nearest neighbours and a random forest compared by stratified 5-fold cross-validation (AUC, accuracy, ROC), a readable tree, permutation importance. **Unsupervised learning:** k-means, Ward hierarchical clustering with a dendrogram, principal components with a scree chart and biplot. **Forecasting:** Holt-Winters with 95% intervals, checked on a held-back season |
| [Marketing](marketing/) | the head turned aside, on the right | **Market segmentation:** needs-based k-means on a survey, index-vs-average profiles, segment sizing and a targeting scorecard; RFM customer value. **Market map:** a world map of GDP, GDP per person, growth and population (World Bank), a weighted attractiveness score and ranking, and attractiveness against reach from a home country; add your own measures by CSV. **Pricing:** price elasticity and the profit-maximising price. **Growth and experiments:** unit economics and A/B tests with a sample-size planner |
| [How I build the models](models/) | the crown at the top | The six-stage model life cycle, and an overfitting lab (polynomial degree vs training and held-out error, plus five-fold cross-validation with the one-standard-error rule) |
| [Contact](contact/) | the seed head resting on the vase | A letter that opens in the visitor’s own email app, plus LinkedIn, GitHub and portfolio links |
| [Learn](learn/) | the open bloom right of the vase | **Lessons:** 19 short lessons (“plates”), one per skill: the idea, the formula, a worked example, a live calculator, the common mistake, and three questions that update mastery. **Check and practise:** 80 questions in 19 skills behind the tools: an adaptive placement check (3PL item response theory, EAP ability estimate, most-informative next question), practice routed by Bayesian knowledge tracing, and spaced review by half-life regression. Progress stays in the visitor’s browser. |

Old links such as `finance/#dcf` still work: each room hub forwards its old section anchors to the new page.

Each room takes one of the meanings of Van Gogh’s sunflowers as its chapter: gratitude and friendship, the cycle of life, an obsession with yellow, personal identity, (from the flower itself) the golden spiral, and (from how he taught himself to paint) learning by doing. Quotes are from the Van Gogh Letters edition and cited on each page.

## How it works

- **Static site, no build step.** Plain HTML, CSS and JavaScript modules. GitHub Pages serves the files as they are, so any page can be edited on github.com.
- **Everything runs in the browser.** Uploaded or pasted data never leaves the visitor’s device.
- **The living painting** (`assets/js/home/painting.js`) is one WebGL fragment shader:
  - paint drifts along its own brushstrokes (a flow map computed from the painting with a colour structure tensor),
  - a raking light crosses the impasto slowly on its own, once every 46 seconds (a relief map from band-passed luminance),
  - flower heads sway; a chosen doorway flower glows and swells slightly. Nothing follows the pointer.
  - clicking dives into the flower while a ring of 34 petals opens into the room’s colour; the room page continues the motion by closing that colour into its own flower.
- **Fallback ladder:** full shader → lighter shader at lower resolution (slow GPU) → still painting with CSS halos (no WebGL, software rendering, or too slow) → plain links (no JavaScript). Reduced-motion users get a calm painting (slow drift, no sway, no dive) and a crossfade instead of the portal. The pause button stops all ambient motion and is remembered.
- **Diagnostics:** add `?why` to the homepage address for a status line (tier, renderer, resolution, fps). `?gl=force` keeps WebGL on software renderers (testing only).

## Project layout

```
index.html                 the painting (homepage)
finance/ analytics/ marketing/ models/ contact/ learn/   one folder per room (index.html); the first three are hubs
finance/valuation/ …       a room's pages, one folder each (listed in assets/js/data/subpages.json)
learn/lessons/<id>/        one page per lesson, generated by tools/lessons.mjs
404.html
assets/css/base.css        fonts, colour and type tokens, controls, header, footer, portal
assets/css/home.css        homepage
assets/css/rooms.css       room layout, tools, charts, tables
assets/js/core/            stats.js (numerics), fin.js (WACC, bonds, options), invest.js (capital budgeting), portfolio.js (returns, CAPM, frontier),
                           risk.js (VaR, ES, backtests, stress), finsim.js (simulated prices), classify.js (logistic regression, k-means),
                           ml.js + ml-worker.js + ml-charts.js (trees, forests, k-NN, cross-validation, Ward, PCA), market.js (segmentation,
                           attractiveness scores), abtest.js, forecast.js (Holt-Winters), saas.js (unit economics), learn.js (IRT, BKT, HLR),
                           csv.js (parsing + quality audit), datasource.js (shared dataset picker), ui.js, charts.js (SVG charts),
                           portal.js, site.js, dom.js, format.js, rng.js (seeded example data)
assets/js/home/            home.js (framing, doorways, render loop), painting.js (WebGL)
assets/js/pages/           one module per page (finance-risk.js, analytics-supervised.js, …)
assets/js/data/rooms.js    the six rooms: names, chapters, colours, one-line descriptions
assets/js/data/subpages.json  each room's pages: the hub cards and the page menus are generated from it
assets/data/               world-markets.json (map outlines + World Bank data), sp500-monthly.json (Shiller)
assets/js/data/learn-items.js  the Learn room's skills and questions (with author-set item parameters)
assets/js/data/lessons/    one file per lesson (text, worked example, calculator, number checks); meta.js is generated
assets/painting/           the painting at four widths, flow map, relief map, meta.js (flower positions)
assets/img/                room flowers, social image, icons, canvas texture
assets/fonts/              Bodoni Moda and Atkinson Hyperlegible Next (self-hosted, SIL OFL)
tools/                     asset pipeline and maintenance scripts (not served to visitors’ pages)
tests/                     statistics tests against SciPy and statsmodels
```

## Common edits

- **Room text:** edit the room’s `index.html` directly.
- **Header, footer, page menus, hub cards, contents lists:** edit `tools/chrome.mjs` or `assets/js/data/subpages.json`, then run `node tools/chrome.mjs`. It rewrites only the marked blocks in each page.
- **Room names or one-liners on the homepage:** `assets/js/data/rooms.js`, plus the doorway names, plaque list and “Why sunflowers?” notes in `index.html`.
- **Data files:** `python3 tools/build_sp500.py` and `node tools/build_map.mjs` (instructions at the top of each) rebuild `assets/data/`.
- **Lessons:** edit `assets/js/data/lessons/<id>.js`, run `node tests/lessons.test.mjs` (every number printed in a worked example must match its `checks`), then `node tools/lessons.mjs && node tools/chrome.mjs`.
- **Contact address:** `assets/js/pages/contact.js` (`ADDRESS`) and the links in `contact/index.html`.
- **After changing any CSS or JS:** run `node tools/bump.mjs` so browsers fetch the new files (GitHub Pages caches for 10 minutes).

## Run locally

```
python3 -m http.server 8000
# open http://localhost:8000/
```

(Opening the HTML files directly from disk won’t work: browsers block JavaScript modules on `file://`.) Every link is relative except in `404.html`, which only GitHub Pages serves.

## Publishing and renaming

GitHub Pages publishes the `main` branch as it is: Settings → Pages → Build and deployment → Source: *Deploy from a branch*, Branch: `main`, folder `/ (root)`. Each push to `main` usually goes live within a couple of minutes.

The repository name appears in the address, so it is written into the canonical and social-preview URLs, `sitemap.xml`, `robots.txt`, `404.html` and `SITE_PATH` in `tools/chrome.mjs`. After renaming the repository, update them all at once (replace `NEW-NAME`; works on macOS and Linux):

```
grep -rl '/sunflower-intelligence/' --exclude-dir=.git . | xargs perl -pi -e 's#/sunflower-intelligence/#/NEW-NAME/#g'
```

## Tests

```
pip install numpy pandas scipy statsmodels scikit-learn numpy-financial   # only needed to regenerate fixtures
python3 tests/make_fixtures.py       # reference values from SciPy, statsmodels, numpy-financial
python3 tests/make_fixtures_ml.py    # from scikit-learn and SciPy
python3 tests/make_fixtures_mkt.py   # from pandas, NumPy and scikit-learn
node tests/stats.test.mjs   # 362 checks: distributions, descriptives, correlation, OLS, BP, VIF, HC3, Holt-Winters, unit economics, options, bonds,
                            # WACC, logistic regression, ROC, k-means, A/B test, IRT, BKT, HLR, NPV/IRR/MIRR/payback, rationing (MILP),
                            # portfolio moments, frontier and max Sharpe (SLSQP), CAPM, drawdown, VaR/ES, Monte Carlo, backtests, Kupiec, Christoffersen
node tests/ml.test.mjs      # 75 checks: CART vs scikit-learn, k-NN, AUC, cross-validation, random forest, Ward vs SciPy, adjusted Rand, PCA
node tests/mkt.test.mjs     # 828 checks: attractiveness scores, rescaling, CAGR, haversine, index vs average, segment sizing, targeting
node tests/lessons.test.mjs # 755 checks: every lesson's shape, worked-example numbers, tool links, and calculator at defaults and extremes
```

## Rebuilding the painting assets

```
pip install numpy opencv-contrib-python-headless pillow
python3 tools/retouch.py tools/source/painting-original.jpg tools/source/painting-master.png
python3 tools/build_assets.py tools/source/painting-master.png
```

`retouch.py` removes the duplicated “Vincent” on the vase and recolours a grey-blue artefact around one flower’s centre. `build_assets.py` writes the sized images, flow and relief maps, the room flowers, the social image and `meta.js`, and keeps the first-paint framing script in `index.html` in step. If the painting changes, re-measure the flower positions at the top of `build_assets.py`.

## Accessibility and performance

- Keyboard: every flower is a link with a visible focus ring; charts take one tab stop and arrow keys walk the data; the life-cycle flower is a tab list.
- Every chart has a table twin; chart colours were checked for colour-blind separation and contrast.
- Heavy sections lower on a page (backtests, clustering, the RFM seed head) render as they scroll near, and long calculations yield between steps; the model comparison runs in a Web Worker.
- Lighthouse lab runs (local server without compression, so real numbers on GitHub Pages should be a little better): accessibility 100 on every page tested; homepage desktop performance 99 (LCP 0.9 s, CLS 0); room pages on simulated mobile 79–93.

## Credits

- Painting: after Vincent van Gogh’s *Sunflowers* (1888–89); source image supplied by the site owner and retouched for this site.
- Letters: [vangoghletters.org](https://vangoghletters.org) (letters 666, 741, 752, 853).
- Data: World Bank World Development Indicators (GDP, population; CC BY 4.0) via github.com/datasets; Natural Earth outlines and capitals (public domain) via world-atlas; S&P 500 prices and dividends from Robert Shiller’s data via github.com/datasets/s-and-p-500. Simulated datasets (shares of invented companies, the shopper survey, the seed club) say so where they appear.
- Fonts: Bodoni Moda (The Bodoni Moda Project Authors, indestructible type*) and Atkinson Hyperlegible Next (The Atkinson Hyperlegible Next Project Authors, for the Braille Institute), both SIL Open Font License; licences in `assets/fonts/`.

## Roadmap

From the original brief, not yet built: a machine-learning lab running scikit-learn in the browser via Pyodide, financial statements and ratio analysis, saved datasets and PDF reports.
