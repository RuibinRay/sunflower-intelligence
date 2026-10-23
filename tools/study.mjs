#!/usr/bin/env node
// study.mjs — builds Learn's course platform from assets/js/data/study/:
//   learn/index.html                     the study home
//   learn/<school>/index.html            three school pages
//   learn/<school>/<course>/…            course page, one page per lesson, module tests, diagnostic, project, final
//   learn/labs/index.html, glossary/, formulas/, review/, notebook/, curriculum/
//   assets/js/data/study/map.js          the course structure for the pages' scripts (generated; don't edit)
//   assets/data/study/search.json        the search index for the study home
// Lesson maths is typeset here with KaTeX, so pages carry no maths script. Then run tools/chrome.mjs:
//   node tools/study.mjs && node tools/chrome.mjs
// Lessons that fail the content checker are skipped with a warning (run node tools/study-check.mjs).
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { ROOT, catalog, strip, slugify, glossKey, inline, tex } from './study/lib.mjs';
import { loadAll, glossary as buildGlossary, formulas as buildFormulas, sequence } from './study/course.mjs';
import { lessonPage, coursePage, assessPage, projectPage } from './study/pages-course.mjs';
import { homePage, schoolPage, labsPage, glossaryPage, formulasPage, reviewPage, notebookPage, curriculumPage } from './study/pages-hub.mjs';
import { checkLesson } from './study-check.mjs';
import katex from 'katex';

const out = (rel, html) => { const p = join(ROOT, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, html); };
const plates = Object.fromEntries((await import(join(ROOT, 'assets/js/data/lessons/meta.js'))).LESSON_META.map((m) => [m.id, m.title]));
const LAB_CSS = { accounting: 'lab-accounting', cleaning: 'lab-cleaning', mix: 'lab-mix' };

const courses = await loadAll();
// skip lessons with content errors so a half-written lesson never reaches a page
for (const c of courses) {
  for (const l of [...c.lessons]) {
    const r = await checkLesson(c.id, l.slug);
    if (r.errors.length) {
      console.warn(`skip ${c.id}/${l.slug}: ${r.errors.length} content error(s), e.g. ${r.errors[0]}`);
      c.lessons.splice(c.lessons.indexOf(l), 1);
      c.modules.forEach((m) => { const i = m.lessons.indexOf(l); if (i >= 0) m.lessons[i] = { slug: l.slug, missing: true, title: l.slug }; });
    }
  }
  c.lessons.forEach((l, i) => { l.n = i + 1; });
  c.minutes = c.lessons.reduce((s, l) => s + l.minutes, 0);
}
const ready = courses.filter((c) => c.lessons.length);
const titles = Object.fromEntries(ready.flatMap((c) => c.lessons.map((l) => [`${c.id}/${l.slug}`, l.title])));
const glossary = buildGlossary(ready);
const formulas = buildFormulas(ready);

// ---------------------------------------------------------------- course pages
let pages = 0;
for (const c of ready) {
  const ctx = { titles, plates, css: [LAB_CSS[catalog.COURSE[c.id].lab]].filter(Boolean) };
  out(`${c.href}index.html`, coursePage(c, ctx)); pages++;
  for (const l of c.lessons) { out(`${l.href}index.html`, lessonPage(c, l, ctx)); pages++; }
  for (const m of c.modules) if (m.test) { out(`${m.test.href}index.html`, assessPage(c, 'module', ctx, m)); pages++; }
  if (c.diagnostic) { out(`${c.diagnostic.href}index.html`, assessPage(c, 'diagnostic', ctx)); pages++; }
  if (c.final) { out(`${c.final.href}index.html`, assessPage(c, 'final', ctx)); pages++; }
  if (c.project) { out(`${c.project.href}index.html`, projectPage(c, ctx)); pages++; }
}

// ---------------------------------------------------------------- hub pages
const featuredIds = ['f01/debits-and-credits', 'b02/missing-values', 'm02/pricing-approaches'];
const featured = featuredIds.map((k) => { const [cid, slug] = k.split('/'); const c = ready.find((x) => x.id === cid); const l = c?.lessons.find((x) => x.slug === slug) || c?.lessons[0]; return l ? { code: c.code, n: l.n, title: l.title, blurb: l.blurb, minutes: l.minutes, href: l.href } : null; }).filter(Boolean);
const home = homePage({ courses: ready, glossary, formulas, featured })
  // links made before Learn became the study home (e.g. learn/#practice) still reach the skills check
  .replace('<main>', `<script>(function(){var k=location.hash.slice(1),m={placement:'practise/',practice:'practise/',garden:'practise/',engine:'practise/',lessons:'lessons/'};if(m[k])location.replace(m[k]+(k==='lessons'?'':'#'+k));})();</script>\n  <main>`);
out('learn/index.html', home); pages++;
for (const s of catalog.SCHOOLS) { out(`learn/${s.id}/index.html`, schoolPage(s.id, { courses: ready, plates })); pages++; }
out('learn/labs/index.html', labsPage({ courses: ready })); pages++;
out('learn/glossary/index.html', glossaryPage({ glossary })); pages++;
out('learn/formulas/index.html', formulasPage({ formulas, courses: ready })); pages++;
out('learn/review/index.html', reviewPage()); pages++;
out('learn/notebook/index.html', notebookPage()); pages++;
out('learn/curriculum/index.html', curriculumPage({ courses: ready })); pages++;

// ---------------------------------------------------------------- data for the pages' scripts
const ex = (list) => (list || []).map((x) => x.id);
const map = Object.fromEntries(ready.map((c) => [c.id, {
  id: c.id, code: c.code, title: c.title, school: c.school, href: c.href, lab: catalog.COURSE[c.id].lab || null,
  modules: c.modules.map((m) => ({ n: m.n, title: m.title, lessons: m.lessons.filter((l) => !l.missing).map((l) => l.slug), test: m.test ? { slug: m.test.slug, href: m.test.href, n: m.test.n } : null })),
  lessons: c.lessons.map((l) => ({ slug: l.slug, n: l.n, module: l.module, title: strip(l.title), minutes: l.minutes, href: l.href, guided: ex(l.X?.guided), independent: ex(l.X?.independent), check: ex(l.X?.check) })),
  diagnostic: c.diagnostic ? { href: c.diagnostic.href, n: c.diagnostic.n } : null,
  final: c.final ? { href: c.final.href, n: c.final.n } : null,
  project: c.project ? { href: c.project.href, title: strip(c.project.title) } : null,
  sequence: sequence(c).map((s) => ({ kind: s.kind, slug: s.slug, title: strip(s.title), href: s.href })),
}]));
const mathmlInline = (t) => { try { return katex.renderToString(t, { output: 'mathml', throwOnError: true }); } catch { return strip(t); } };
const mathml = (t) => { try { return katex.renderToString(t, { output: 'mathml', displayMode: true, throwOnError: true }); } catch { return ''; } };
const flash = [
  ...glossary.map((g) => ({ id: `t:${g.key}`, kind: 'term', course: g.course, lesson: g.lesson, front: g.term, back: strip(g.def), href: g.href })),
  ...formulas.map((f) => ({ id: `f:${f.course}:${f.id}`, kind: 'formula', course: f.course, lesson: f.lesson, front: strip(f.name), back: mathml(f.tex), where: (f.where || []).map(([s, m, u]) => [mathmlInline(s), `${strip(m)}${u ? ` (${u})` : ''}`]), href: f.href })),
];
out('assets/js/data/study/map.js', `// map.js — generated by tools/study.mjs; do not edit. The built courses' structure, for the Learn pages' scripts.
export const MAP = ${JSON.stringify(map)};
export const FLASH = ${JSON.stringify(flash)};
`);

// search index: lessons, courses (built and planned), glossary, formulas, labs, plates
const search = [
  ...ready.flatMap((c) => c.lessons.map((l) => ({ k: 'Lesson', t: strip(l.title), s: `${c.code} · ${strip(l.blurb)}`, h: l.href, x: [...(l.L.glossary || []).map((g) => strip(g.term)), ...(l.L.objectives || []).map(strip)].join(' ') }))),
  ...catalog.COURSES.map((c) => ({ k: c.modules ? 'Course' : 'Planned course', t: `${c.code} ${c.title}`, s: c.blurb, h: c.modules && ready.some((r) => r.id === c.id) ? `learn/${c.school}/${c.id}/` : `learn/${c.school}/#${c.id}`, x: (c.topics || []).join(' ') })),
  ...glossary.map((g) => ({ k: 'Term', t: g.term, s: strip(g.def).slice(0, 140), h: `learn/glossary/#g-${slugify(g.key)}`, x: '' })),
  ...formulas.map((f) => ({ k: 'Formula', t: strip(f.name), s: `${f.code} · ${strip(f.lessonTitle)}`, h: `${f.href}#f-${f.id}`, x: (f.where || []).map((w) => strip(w[1])).join(' ') })),
  ...catalog.LABS.map((l) => ({ k: 'Lab', t: l.name, s: l.blurb, h: `learn/labs/${l.id}/`, x: '' })),
  ...Object.entries(plates).map(([id, t]) => ({ k: 'Plate', t, s: 'A short lesson on an idea behind the site’s tools.', h: `learn/lessons/${id}/`, x: '' })),
];
out('assets/data/study/search.json', JSON.stringify(search));

// ---------------------------------------------------------------- sitemap
const SITE = 'https://ruibinray.github.io/sunflower-intelligence/';
const sm = join(ROOT, 'sitemap.xml');
if (existsSync(sm)) {
  let xml = readFileSync(sm, 'utf8').replace(/\s*<url><loc>[^<]*\/learn\/(?!lessons\/)[^<]*<\/loc><\/url>/g, '');
  const urls = ['learn/', 'learn/practise/', ...catalog.SCHOOLS.map((s) => `learn/${s.id}/`), 'learn/labs/', ...catalog.LABS.map((l) => `learn/labs/${l.id}/`), 'learn/glossary/', 'learn/formulas/', 'learn/review/', 'learn/notebook/', 'learn/curriculum/',
    ...ready.flatMap((c) => [c.href, ...c.lessons.map((l) => l.href), ...c.modules.filter((m) => m.test).map((m) => m.test.href), c.diagnostic?.href, c.project?.href, c.final?.href].filter(Boolean))];
  xml = xml.replace('</urlset>', `${urls.map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')}\n</urlset>`);
  writeFileSync(sm, xml);
}
console.log(`wrote ${pages} pages for ${ready.length} courses (${ready.reduce((n, c) => n + c.lessons.length, 0)} lessons, ${glossary.length} terms, ${formulas.length} formulas)`);
