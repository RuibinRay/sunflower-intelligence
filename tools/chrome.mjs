#!/usr/bin/env node
// chrome.mjs — keeps the header and footer identical on every room page.
// Edit the templates below, then run:  node tools/chrome.mjs
// It rewrites only the text between <!-- chrome:header --> … <!-- /chrome:header --> (and footer) markers.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// The site's path on GitHub Pages (the repository name). Only 404.html uses it: GitHub Pages serves that page
// at any missing address, so its links can't be relative. See "Renaming the repository" in README.md.
const SITE_PATH = '/sunflower-intelligence/';
const ROOMS = [
  { id: 'finance', name: 'Finance', chapter: 'An obsession with yellow', color: '#E8B923' },
  { id: 'analytics', name: 'Business analytics', chapter: 'The golden spiral', color: '#192B49' },
  { id: 'marketing', name: 'Marketing', chapter: 'Personal identity', color: '#56632C' },
  { id: 'models', name: 'How I build the models', chapter: 'The cycle of life', color: '#252A31' },
  { id: 'contact', name: 'Contact', chapter: 'Gratitude and friendship', color: '#F6E7C1' },
];

const glyph = `<svg viewBox="-16 -16 32 32" aria-hidden="true"><defs><path id="wm-p" d="M0,-6.3C3,-8.6 2.8,-12.8 0,-15.4C-2.8,-12.8 -3,-8.6 0,-6.3Z" fill="#E8B923" stroke="#A97A0C" stroke-width=".6"/></defs>${Array.from({ length: 13 }, (_, i) => `<use href="#wm-p"${i ? ` transform="rotate(${(i * 360 / 13).toFixed(1)})"` : ''}/>`).join('')}<circle r="6.6" fill="#5B3A12"/><circle r="6.6" fill="none" stroke="#C99216" stroke-width="1.3"/><circle r="2.6" fill="#3B240B"/></svg>`;

const header = (current, root) => `
  <header class="site-header">
    <a class="wordmark" href="${root}">${glyph}<span>Sunflower Intelligence</span></a>
    <nav class="site-nav" id="site-nav" aria-label="Rooms">
      <ul role="list">
${ROOMS.map((r) => `        <li><a href="${root}${r.id}/"${r.id === current ? ' aria-current="page"' : ''}>${r.name}</a></li>`).join('\n')}
      </ul>
    </nav>
    <div class="header-tools">
      <button class="icon-btn motion-btn" type="button" aria-pressed="false" aria-label="Pause motion" title="Pause motion">
        <svg class="i-pause" viewBox="0 0 20 20" aria-hidden="true"><rect x="5" y="4" width="3.2" height="12" rx="1" fill="currentColor"/><rect x="11.8" y="4" width="3.2" height="12" rx="1" fill="currentColor"/></svg>
        <svg class="i-play" viewBox="0 0 20 20" aria-hidden="true" hidden><path d="M6 4.2v11.6c0 .7.8 1.1 1.4.7l8.6-5.8c.5-.3.5-1.1 0-1.4L7.4 3.5C6.8 3.1 6 3.5 6 4.2z" fill="currentColor"/></svg>
      </button>
      <button class="icon-btn menu-btn" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Rooms menu">
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      </button>
    </div>
  </header>
  `;

const footer = (current, root) => `
  <footer class="site-footer">
    <h2>The other rooms</h2>
    <ul class="rooms" role="list">
${ROOMS.filter((r) => r.id !== current).map((r) => `      <li><a class="room-link" href="${root}${r.id}/" data-portal="${r.color}"><img src="${root}assets/img/flower-${r.id}.webp" alt="" width="64" height="64" loading="lazy" decoding="async"><span><strong>${r.name}</strong><span>${r.chapter}</span></span></a></li>`).join('\n')}
    </ul>
    <div class="footer-meta">
      <p><a href="${root}">Back to the painting</a></p>
      <p>Painting after Vincent van Gogh’s <i>Sunflowers</i> (1888–89), retouched for this site. Letters quoted from <a href="https://vangoghletters.org">vangoghletters.org</a>.</p>
      <p>© <span data-year>2026</span> Ruibin Jin Yao</p>
    </div>
  </footer>
  `;

const pages = [...ROOMS.map((r) => ({ file: `${r.id}/index.html`, current: r.id, root: '../' })), { file: '404.html', current: '', root: SITE_PATH }];
for (const p of pages) {
  const path = join(ROOT, p.file);
  if (!existsSync(path)) continue;
  let html = readFileSync(path, 'utf8');
  html = html.replace(/<!-- chrome:header -->[\s\S]*?<!-- \/chrome:header -->/, `<!-- chrome:header -->${header(p.current, p.root)}<!-- /chrome:header -->`);
  html = html.replace(/<!-- chrome:footer -->[\s\S]*?<!-- \/chrome:footer -->/, `<!-- chrome:footer -->${footer(p.current, p.root)}<!-- /chrome:footer -->`);
  writeFileSync(path, html);
  console.log('updated', p.file);
}
