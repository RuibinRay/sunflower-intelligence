# Sunflower Intelligence

Finance, business analytics and marketing tools set inside a living sunflower painting after Van Gogh. The homepage is the painting: five numbered flowers open five rooms, keyed by a plaque in the corner like a gallery label.

**Live:** https://ruibinray.github.io/sunflower-intelligence/

| Room | Flower | What it does |
|---|---|---|
| [Finance](finance/) | 1, the golden bloom at the centre | Discounted cash flow valuation with a sensitivity table; Altman Z, Z′ and Z″ distress screens |
| [Business analytics](analytics/) | 2, the dark-eyed bloom on the left | Data-quality audit with a reversible change log, descriptive statistics, Pearson/Spearman correlation matrix, OLS regression with Breusch–Pagan, VIF, optional HC3 robust standard errors and prediction intervals; Holt-Winters forecasting with 95% intervals, checked on a held-back season against repeating last season |
| [Marketing](marketing/) | 3, the head turned aside, on the right | RFM customer segmentation drawn as a sunflower seed head; price elasticity from a log-log regression with a what-if and an optional profit-maximising price; subscription unit economics (LTV:CAC, CAC payback with and without churn, magic number, net and gross revenue retention) |
| [How I build the models](models/) | 4, the crown at the top | The six-stage model life cycle, and an overfitting lab (polynomial degree vs training and held-out error) |
| [Contact](contact/) | 5, the seed head resting on the vase | A letter that opens in the visitor’s own email app, plus LinkedIn, GitHub and portfolio links |

Each room takes one of the meanings of Van Gogh’s sunflowers as its chapter: gratitude and friendship, the cycle of life, an obsession with yellow, personal identity, and (from the flower itself) the golden spiral. Quotes are from the Van Gogh Letters edition and cited on each page.

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
finance/ analytics/ marketing/ models/ contact/   one folder per room (index.html)
404.html
assets/css/base.css        fonts, colour and type tokens, controls, header, footer, portal
assets/css/home.css        homepage
assets/css/rooms.css       room layout, tools, charts, tables
assets/js/core/            stats.js (numerics), forecast.js (Holt-Winters), saas.js (unit economics), csv.js (parsing + quality audit), charts.js (SVG charts),
                           portal.js, site.js, dom.js, format.js, rng.js (seeded example data)
assets/js/home/            home.js (framing, doorways, render loop), painting.js (WebGL)
assets/js/pages/           one module per room
assets/js/data/rooms.js    the five rooms: names, chapters, colours, one-line descriptions
assets/painting/           the painting at four widths, flow map, relief map, meta.js (flower positions)
assets/img/                room flowers, social image, icons, canvas texture
assets/fonts/              Bodoni Moda and Atkinson Hyperlegible Next (self-hosted, SIL OFL)
tools/                     asset pipeline and maintenance scripts (not served to visitors’ pages)
tests/                     statistics tests against SciPy and statsmodels
```

## Common edits

- **Room text:** edit the room’s `index.html` directly.
- **Header and footer:** edit the templates in `tools/chrome.mjs`, then run `node tools/chrome.mjs`. It rewrites only the marked header and footer blocks in each room.
- **Room names or one-liners on the homepage:** `assets/js/data/rooms.js`, plus the numbered markers, plaque list and “Why sunflowers?” notes in `index.html`. Marker positions on each flower: `MARK_ANGLE` in `assets/js/home/home.js`.
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
pip install numpy pandas scipy statsmodels   # only needed to regenerate fixtures
python3 tests/make_fixtures.py               # reference values from SciPy / statsmodels
node tests/stats.test.mjs                    # 148 checks: distributions, descriptives, correlation, OLS, BP, VIF, HC3, Holt-Winters, unit economics
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
- Lighthouse lab runs (local server without compression, so real numbers on GitHub Pages should be a little better): accessibility 100 on every page; homepage desktop performance 99 (LCP 0.9 s, CLS 0); rooms on simulated mobile 86–94.

## Credits

- Painting: after Vincent van Gogh’s *Sunflowers* (1888–89); source image supplied by the site owner and retouched for this site.
- Letters: [vangoghletters.org](https://vangoghletters.org) (letters 666, 741, 752, 853).
- Fonts: Bodoni Moda (The Bodoni Moda Project Authors, indestructible type*) and Atkinson Hyperlegible Next (The Atkinson Hyperlegible Next Project Authors, for the Braille Institute), both SIL Open Font License; licences in `assets/fonts/`.

## Roadmap

From the original brief, not yet built: clustering and PCA, a machine-learning lab running scikit-learn in the browser via Pyodide, financial statements and ratio analysis, portfolio analysis, saved datasets and PDF reports.
