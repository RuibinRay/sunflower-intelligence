// shell.mjs — the HTML every generated Learn page shares: head, canvas (room column or course outline), ledger
// and footer. Header, footer and the Learn page menu are left as chrome markers; tools/chrome.mjs fills them.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, esc, strip, catalog } from './lib.mjs';

export const SITE = 'https://ruibinray.github.io/sunflower-intelligence/';
export const VERSION = (readFileSync(join(ROOT, 'learn/lessons/index.html'), 'utf8').match(/\?v=(\d+)/) || [, '6'])[1];
export const v = (p) => `${p}?v=${VERSION}`;
const chrome = (name) => `<!-- chrome:${name} --><!-- /chrome:${name} -->`;

/** Where each school's canvas takes its colours and flower from: the matching room. */
export const SCHOOL_ROOM = { finance: 'finance', analytics: 'analytics', marketing: 'marketing' };
export const schoolOf = (id) => catalog.SCHOOLS.find((s) => s.id === id);

export function head({ title, desc, path, root, css = [], math = false, preload = [] }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(strip(title))} · Sunflower Intelligence</title>
  <meta name="description" content="${esc(strip(desc))}">
  <meta name="theme-color" content="#192B49">
  <link rel="canonical" href="${SITE}${path}">
  <meta property="og:title" content="${esc(strip(title))} · Sunflower Intelligence">
  <meta property="og:description" content="${esc(strip(desc))}">
  <meta property="og:image" content="${SITE}assets/img/og-image.jpg">
  <link rel="icon" href="${root}assets/img/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="${root}assets/img/apple-touch-icon.png">
  <script>try{var p=JSON.parse(sessionStorage.getItem('si:portal')||'null');if(p&&Date.now()-p.t<6000&&p.url===location.pathname){document.documentElement.classList.add('is-arriving');document.documentElement.style.setProperty('--arrive',p.color)}}catch(e){}try{if(localStorage.getItem('si:outline')==='closed')document.documentElement.classList.add('outline-closed')}catch(e){}</script>
  <link rel="preload" href="${root}assets/fonts/bodoni-moda-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${root}assets/fonts/atkinson-next-latin.woff2" as="font" type="font/woff2" crossorigin>${preload.map((p) => `\n  <link rel="modulepreload" href="${v(root + p)}">`).join('')}
  <link rel="stylesheet" href="${v(`${root}assets/css/base.css`)}">
  <link rel="stylesheet" href="${v(`${root}assets/css/rooms.css`)}">
  <link rel="stylesheet" href="${v(`${root}assets/css/study.css`)}">${math ? `\n  <link rel="stylesheet" href="${v(`${root}assets/vendor/katex/katex.min.css`)}">` : ''}${css.map((c) => `\n  <link rel="stylesheet" href="${v(`${root}assets/css/${c}.css`)}">`).join('')}
</head>`;
}

/** body + header chrome + main open. `bodyClass` adds to "room room--learn room--sub room--study". */
export function open({ root, bodyClass = '', skip = 'Skip to the content', data = {} }) {
  const attrs = Object.entries({ root, ...data }).map(([k, val]) => ` data-${k}="${esc(val)}"`).join('');
  return `
<body class="room room--learn room--sub room--study ${bodyClass}"${attrs}>
  <a class="skip-link" href="#ledger">${skip}</a>
  ${chrome('header')}

  <main>`;
}

export function close({ root, script, extra = '' }) {
  return `
  </main>

  ${chrome('footer')}${extra}
  <script type="module" src="${v(`${root}assets/js/pages/${script}.js`)}"></script>
</body>
</html>
`;
}

/** The room column used by Learn's own pages (home, toolkit, labs hub, curriculum). */
export function roomCanvas({ root, title, kicker = '', note = '', toc = [], long = true, home = false }) {
  return `
    <header class="canvas canvas--sub" aria-labelledby="room-title">
      ${home ? '' : `<a class="canvas-room" href="${root}learn/"><img src="${root}assets/img/flower-learn-160.webp" alt="" width="56" height="56"><span>Learn</span></a>`}
      ${kicker ? `<p class="plate-no">${kicker}</p>` : ''}
      <h1 id="room-title" class="display ${long ? 'is-long' : 'is-short'}">${title}</h1>
      ${note ? `<p class="chapter-note">${note}</p>` : ''}
      ${chrome('subnav')}
      ${toc.length ? `<nav aria-label="On this page"><ul class="toc" role="list">${toc.map(([id, name]) => `<li><a href="#${id}">${name}</a></li>`).join('')}</ul></nav>` : ''}
    </header>`;
}

/** A school's column: its room flower and colours. */
export function schoolCanvas({ root, school, title, kicker = '', note = '', toc = [] }) {
  const s = schoolOf(school);
  return `
    <header class="canvas canvas--sub" aria-labelledby="room-title">
      <a class="canvas-room" href="${root}learn/"><img src="${root}assets/img/flower-learn-160.webp" alt="" width="56" height="56"><span>Learn</span></a>
      <div class="school-mark"><img src="${root}assets/img/flower-${SCHOOL_ROOM[s.id]}-160.webp" alt="" width="72" height="72"></div>
      ${kicker ? `<p class="plate-no">${kicker}</p>` : ''}
      <h1 id="room-title" class="display is-long">${title}</h1>
      ${note ? `<p class="chapter-note">${note}</p>` : ''}
      ${chrome('subnav')}
      ${toc.length ? `<nav aria-label="On this page"><ul class="toc" role="list">${toc.map(([id, name]) => `<li><a href="#${id}">${name}</a></li>`).join('')}</ul></nav>` : ''}
    </header>`;
}

export function breadcrumb(items) {
  return `<nav class="breadcrumb" aria-label="Breadcrumb"><ol>${items.map(([label, href]) => (href ? `<li><a href="${href}">${label}</a></li>` : `<li aria-current="page">${label}</li>`)).join('')}</ol></nav>`;
}

/** Status chip for the curriculum checklist. */
export const STATUS = {
  complete: ['Complete', 'is-complete'], reviewed: ['Reviewed', 'is-reviewed'], 'in-progress': ['In progress', 'is-progress'], planned: ['Planned', 'is-planned'],
};
export const statusChip = (s) => `<span class="status-chip ${STATUS[s][1]}">${STATUS[s][0]}</span>`;
export const levelName = (l) => catalog.LEVELS[l];
