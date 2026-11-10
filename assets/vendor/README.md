# Vendored libraries

Served as they are (the site has no build step). Nothing here is fetched from a CDN at run time.

| File | Library | Version | Licence | Used by |
|---|---|---|---|---|
| `xlsx.full.min.js` | SheetJS Community Edition (from cdn.sheetjs.com) | 0.20.3 | Apache-2.0 (`LICENSE-sheetjs.txt`) | `assets/js/core/workbook-worker.js`: reads .xls, .xlsx, .csv and .tsv inside a Web Worker. Macros are never executed (SheetJS has no macro engine; the VBA part is only detected). |
| `gsap.min.js`, `ScrollTrigger.min.js` | GSAP | 3.13.0 | GSAP standard "no charge" licence, https://gsap.com/standard-license | the homepage's scroll scenes (`assets/js/home/scenes.js`) |

To update: `npm pack` the package, copy the `dist` file here, change the version above, run `node tools/bump.mjs`.
