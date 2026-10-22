#!/usr/bin/env node
// lessons.mjs — builds the lesson pages from assets/js/data/lessons/*.js:
//   learn/lessons/index.html            the library of plates
//   learn/lessons/<id>/index.html       one page per lesson, readable without JavaScript (the calculator is
//                                       rendered at its default values; the page script makes it live)
//   assets/js/data/lessons/meta.js      titles and plate numbers for the Learn page's links
// Then run `node tools/chrome.mjs` to fill in the header, footer and page menu:
//   node tools/lessons.mjs && node tools/chrome.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://ruibinray.github.io/sunflower-intelligence/';
const { ORDER } = await import(pathToFileURL(join(ROOT, 'assets/js/data/lessons/index.js')));
const { SKILLS, ITEMS } = await import(pathToFileURL(join(ROOT, 'assets/js/data/learn-items.js')));
const F = await import(pathToFileURL(join(ROOT, 'assets/js/core/format.js')));
const version = (readFileSync(join(ROOT, 'learn/index.html'), 'utf8').match(/\?v=(\d+)/) || [, '1'])[1];

const lessons = [];
for (const [i, id] of ORDER.entries()) {
  const file = join(ROOT, `assets/js/data/lessons/${id}.js`);
  if (!existsSync(file)) { console.warn(`skip ${id}: not written yet`); continue; }
  const L = (await import(pathToFileURL(file))).default;
  lessons.push({ ...L, plate: i + 1, room: SKILLS.find((s) => s.id === id).room, nQ: Math.min(3, ITEMS.filter((it) => it.skill === id).length) });
}
const TOTAL = ORDER.length;
const WORD = ['no', 'one', 'two', 'three', 'four', 'five'];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (s) => String(s).replace(/<[^>]+>/g, '');

const head = ({ title, desc, path, root }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)} · Sunflower Intelligence</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="theme-color" content="#192B49">
  <link rel="canonical" href="${SITE}${path}">
  <meta property="og:title" content="${esc(title)} · Sunflower Intelligence">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${SITE}assets/img/og-image.jpg">
  <link rel="icon" href="${root}assets/img/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="${root}assets/img/apple-touch-icon.png">
  <script>try{var p=JSON.parse(sessionStorage.getItem('si:portal')||'null');if(p&&Date.now()-p.t<6000&&p.url===location.pathname){document.documentElement.classList.add('is-arriving');document.documentElement.style.setProperty('--arrive',p.color)}}catch(e){}</script>
  <link rel="preload" href="${root}assets/fonts/bodoni-moda-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${root}assets/fonts/atkinson-next-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${root}assets/css/base.css?v=${version}">
  <link rel="stylesheet" href="${root}assets/css/rooms.css?v=${version}">
</head>`;
const chrome = (name) => `<!-- chrome:${name} --><!-- /chrome:${name} -->`;
const canvasRoom = (root, up) => `<a class="canvas-room" href="${up}"><img src="${root}assets/img/flower-learn-160.webp" alt="" width="56" height="56"><span>Learn</span></a>`;

// ---------------------------------------------------------------- the calculator, rendered at its defaults
function fmtInput(inp, v) {
  const d = inp.digits ?? (inp.step < 1 ? Math.min(3, Math.ceil(-Math.log10(inp.step))) : 0);
  if (inp.fmt === 'pct') return `${F.num(v, d)}%`;
  if (inp.fmt === 'money') return `${F.money(v, { digits: d })}${inp.unit || ''}`;
  if (inp.fmt === 'int') return `${F.int(v)}${inp.unit ? ` ${inp.unit}` : ''}`;
  return `${F.num(v, d)}${inp.unit ? ` ${inp.unit}` : ''}`;
}
function calcHTML(L) {
  const v = Object.fromEntries(L.calc.inputs.map((i) => [i.id, i.value]));
  const r = L.calc.compute({ ...v });
  const inputs = L.calc.inputs.map((i) => `
              <div class="slider-field">
                <div class="slider-top"><label for="c-${i.id}">${i.label}</label><output for="c-${i.id}" id="c-${i.id}-out">${fmtInput(i, i.value)}</output></div>
                <input type="range" id="c-${i.id}" name="${i.id}" min="${i.min}" max="${i.max}" step="${i.step}" value="${i.value}">
              </div>`).join('');
  const rows = r.rows.map(([k, val]) => `<div class="stat"><dt>${k}</dt><dd class="num">${val}</dd></div>`).join('');
  return `
          <div class="bench lesson-calc" id="calc">
            <form class="bench-inputs" id="calc-form" novalidate>
              <p class="calc-intro">${L.calc.intro}</p>${inputs}
            </form>
            <div class="bench-results" aria-live="polite" id="calc-out">
              <p class="figure-title">${L.calc.title}</p>
              <div class="figure-hero"><span class="hero-value" id="calc-hero">${r.headline.value}</span><span class="hero-label" id="calc-hero-label">${r.headline.label}</span></div>
              <dl class="stats-row stats-dense" id="calc-rows">${rows}</dl>
              <p class="note" id="calc-note">${r.note || ''}</p>
            </div>
          </div>`;
}

// ---------------------------------------------------------------- one lesson page
const PARTS = [['idea', 'The idea'], ['formula', 'The formula'], ['example', 'A worked example'], ['try', 'Try it'], ['mistake', 'The common mistake'], ['remember', 'Remember'], ['check', 'Check yourself'], ['use', 'Use it on real numbers']];
function lessonPage(L, prev, next) {
  const root = '../../../', path = `learn/lessons/${L.id}/`;
  const part = (id, inner) => `
        <section class="lesson-part" id="${id}" aria-labelledby="${id}-h">
          <h2 id="${id}-h">${PARTS.find((p) => p[0] === id)[1]}</h2>${inner}
        </section>`;
  const mistakeIcon = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 5.5v5.2M10 14.2v.3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  return `${head({ title: `${strip(L.title)} · Lessons`, desc: strip(L.hook), path, root })}
<body class="room room--learn room--sub room--lesson">
  <a class="skip-link" href="#ledger">Skip to the lesson</a>
  ${chrome('header')}

  <main>
    <header class="canvas canvas--sub" aria-labelledby="room-title">
      ${canvasRoom(root, '../../')}
      <p class="plate-no">Plate ${L.plate} of ${TOTAL} · ${L.room}</p>
      <h1 id="room-title" class="display is-long">${L.title}</h1>
      <p class="chapter-note">About ${L.minutes} minutes to read, then ${WORD[L.nQ]} questions that count toward your mastery.</p>
      ${chrome('subnav')}
      <nav aria-label="In this lesson"><ul class="toc" role="list">${PARTS.map(([id, name]) => `<li><a href="#${id}">${name}</a></li>`).join('')}</ul></nav>
    </header>

    <div class="ledger" id="ledger">
      <nav class="breadcrumb" aria-label="Breadcrumb"><ol><li><a href="${root}">The painting</a></li><li><a href="../../">Learn</a></li><li><a href="../">Lessons</a></li><li aria-current="page">${strip(L.title)}</li></ol></nav>
      <div class="ledger-intro">
        <p class="lead">${L.hook}</p>
        <p class="lesson-status" id="lesson-status" aria-live="polite"></p>
      </div>

      <article class="lesson" data-lesson="${L.id}" data-plate="${L.plate}">${part('idea', L.idea.map((p) => `\n          <p>${p}</p>`).join(''))}${part('formula', `
          <div class="formula-box">
            <p class="lesson-formula">${L.formula.html.split(/,\s*&ensp;\s*/).map((f) => `<span class="f-part">${f}</span>`).join('<span class="f-sep">, </span>')}</p>
            <dl class="terms">${L.formula.terms.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>${L.formula.note ? `\n            <p class="note">${L.formula.note}</p>` : ''}
          </div>`)}${part('example', `
          <figure class="plate">
            <figcaption class="plate-cap">Plate ${L.plate}</figcaption>
            <p class="plate-setup">${L.example.setup}</p>
            <ol class="plate-steps">${L.example.steps.map((s) => `\n              <li><span>${s}</span></li>`).join('')}
            </ol>
            <p class="plate-result">${L.example.result}</p>
          </figure>`)}${part('try', calcHTML(L))}${part('mistake', `
          <div class="mistake">${mistakeIcon}<div><h3>${L.mistake.title}</h3><p>${L.mistake.html}</p></div></div>`)}${part('remember', `
          <ul class="remember" role="list">${L.remember.map((r) => `\n            <li>${r}</li>`).join('')}
          </ul>`)}${part('check', `
          <p>${cap(WORD[L.nQ])} questions from the Learn room’s bank. Your answers update your mastery of this skill, the same as in Practise.</p>
          <div class="bench learn-bench lesson-check">
            <div class="quiz" id="lesson-quiz"><noscript><p class="note">The questions need JavaScript.</p></noscript></div>
            <div class="bench-results" id="lesson-mastery" aria-live="polite"></div>
          </div>`)}${part('use', `
          <p>Open <a href="${root}${L.tool.href}">${L.tool.label}</a> and try the idea on your own numbers.</p>`)}
      </article>

      <nav class="lesson-pager" aria-label="More lessons">
        ${prev ? `<a class="pager-prev" href="../${prev.id}/" rel="prev"><span>Plate ${prev.plate}</span>${prev.title}</a>` : '<span></span>'}
        <a class="pager-all" href="../">All lessons</a>
        ${next ? `<a class="pager-next" href="../${next.id}/" rel="next"><span>Plate ${next.plate}</span>${next.title}</a>` : '<span></span>'}
      </nav>${L.sources && L.sources.length ? `

      <section class="sources" aria-labelledby="sources-title">
        <h2 id="sources-title">Sources</h2>
        <ol>${L.sources.map((s) => `\n          <li>${s}</li>`).join('')}
        </ol>
      </section>` : ''}
    </div>
  </main>

  ${chrome('footer')}
  <script type="module" src="${root}assets/js/pages/learn-lesson.js?v=${version}"></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------- the library
function libraryPage() {
  const root = '../../';
  const groups = [...new Set(lessons.map((l) => l.room))];
  const slug = (r) => r.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
  const first = lessons[0];
  return `${head({ title: 'Lessons · Learn', desc: `${TOTAL} short lessons on the ideas behind every tool here: the idea, the formula, a worked example, a calculator to try, and questions that count toward your mastery.`, path: 'learn/lessons/', root })}
<body class="room room--learn room--sub room--lessons">
  <a class="skip-link" href="#ledger">Skip to the lessons</a>
  ${chrome('header')}

  <main>
    <header class="canvas canvas--sub" aria-labelledby="room-title">
      ${canvasRoom(root, '../')}
      <h1 id="room-title" class="display is-long">Lessons</h1>
      <p class="chapter-note">One short lesson for each skill in the Learn room. Read it, try the numbers, then answer three questions that count toward your mastery.</p>
      ${chrome('subnav')}
      <nav aria-label="On this page"><ul class="toc" role="list">${groups.map((g) => `<li><a href="#${slug(g)}">${g}</a></li>`).join('')}<li><a href="#method">How the lessons work</a></li></ul></nav>
    </header>

    <div class="ledger" id="ledger">
      <nav class="breadcrumb" aria-label="Breadcrumb"><ol><li><a href="${root}">The painting</a></li><li><a href="../">Learn</a></li><li aria-current="page">Lessons</li></ol></nav>
      <div class="ledger-intro">
        <p class="lead">In 1880 Van Gogh taught himself to draw by copying the sheets of Charles Bargue’s drawing books one at a time; “now I’ve finished the 60 sheets,” he wrote to Theo that September. These lessons are plates in the same spirit: each is short, works an example step by step, and ends with you doing it yourself.</p>
      </div>

      <section class="lesson-next" id="next" aria-labelledby="next-title">
        <p class="q-kicker" id="next-kicker">Start here</p>
        <h2 id="next-title"><a id="next-link" href="${first.id}/">Plate ${first.plate}: ${first.title}</a></h2>
        <p id="next-why">${first.hook}</p>
        <p class="lesson-progress" id="lessons-progress" aria-live="polite">${lessons.length} lessons · progress is kept in this browser</p>
      </section>
${groups.map((g) => `
      <section class="lesson-group" id="${slug(g)}" aria-labelledby="${slug(g)}-h">
        <h2 id="${slug(g)}-h">${g}</h2>
        <ol class="plate-list" role="list">${lessons.filter((l) => l.room === g).map((l) => `
          <li><a class="plate-card" href="${l.id}/" data-lesson="${l.id}"><span class="plate-num" aria-hidden="true">${l.plate}</span><span class="plate-body"><span class="plate-title">${l.title}</span><span class="plate-hook">${l.hook}</span><span class="plate-meta">Plate ${l.plate} · ${l.minutes} min · <span class="plate-status" data-status="${l.id}">not read yet</span></span></span></a></li>`).join('')}
        </ol>
      </section>`).join('')}

      <section class="lesson-group lesson-method" id="method" aria-labelledby="method-h">
        <h2 id="method-h">How the lessons work</h2>
        <div class="method-grid">
          <div><h3>A worked example first</h3><p>Beginners who study worked examples before solving problems learn faster and make fewer errors on similar problems than those who start by solving (Sweller and Cooper, 1985).</p></div>
          <div><h3>Then you try</h3><p>Each lesson’s calculator lets you change the inputs and see the answer move, the step from following an example to using the idea.</p></div>
          <div><h3>Then you’re tested</h3><p>Retrieving an idea strengthens memory more than rereading it (Roediger and Karpicke, 2006), and a large review rates practice testing and spaced practice the most useful study techniques (Dunlosky et al., 2013). The questions update your mastery, and Practise brings the skill back before you forget it.</p></div>
          <div><h3>Short pieces</h3><p>Lessons are split into small labelled parts, without decoration, so working memory goes on the idea (Mayer, 2009).</p></div>
        </div>
      </section>

      <section class="sources" aria-labelledby="sources-title">
        <h2 id="sources-title">Sources</h2>
        <ol>
          <li>Van Gogh to Theo van Gogh, Cuesmes, 7 September 1880, <a href="https://vangoghletters.org/en/let157">letter 157</a>.</li>
          <li>Sweller, J. &amp; Cooper, G. A. (1985). The use of worked examples as a substitute for problem solving in learning algebra. <i>Cognition and Instruction</i>, 2(1), 59–89.</li>
          <li>Roediger, H. L. &amp; Karpicke, J. D. (2006). Test-enhanced learning: taking memory tests improves long-term retention. <i>Psychological Science</i>, 17(3), 249–255.</li>
          <li>Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J. &amp; Willingham, D. T. (2013). Improving students’ learning with effective learning techniques. <i>Psychological Science in the Public Interest</i>, 14(1), 4–58.</li>
          <li>Mayer, R. E. (2009). <i>Multimedia Learning</i> (2nd ed.). Cambridge University Press.</li>
        </ol>
      </section>
    </div>
  </main>

  ${chrome('footer')}
  <script type="module" src="${root}assets/js/pages/learn-lessons.js?v=${version}"></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------- write everything
mkdirSync(join(ROOT, 'learn/lessons'), { recursive: true });
writeFileSync(join(ROOT, 'learn/lessons/index.html'), libraryPage());
lessons.forEach((L, i) => {
  mkdirSync(join(ROOT, `learn/lessons/${L.id}`), { recursive: true });
  writeFileSync(join(ROOT, `learn/lessons/${L.id}/index.html`), lessonPage(L, lessons[i - 1], lessons[i + 1]));
});
writeFileSync(join(ROOT, 'assets/js/data/lessons/meta.js'), `// meta.js — generated by tools/lessons.mjs; do not edit. Titles and plate numbers for links from the Learn page.
export const LESSON_META = ${JSON.stringify(lessons.map((l) => ({ id: l.id, plate: l.plate, title: strip(l.title), minutes: l.minutes, room: l.room })), null, 1)};
export const LESSON_TOTAL = ${TOTAL};
`);
console.log(`wrote ${lessons.length} lessons and the library`);
