// course.mjs — loads the built courses into one structure the page generator and the browser both use:
// modules, lessons (title, minutes, href), assessments, glossary, formulas, references.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { catalog, BUILT, DATA, loadLesson, loadEx, loadModuleFile, blockWords, words, strip, glossKey, tex } from './lib.mjs';

export const courseHref = (c) => `learn/${c.school}/${c.id}/`;
export const lessonHref = (c, slug) => `${courseHref(c)}${slug}/`;
export const TESTS = { diagnostic: 'diagnostic', final: 'final', project: 'project' };
export const moduleTestSlug = (n) => `module-${n}-test`;

/** Estimated minutes: reading at about 180 words a minute, plus time to work examples, widgets and exercises. */
export function minutesFor(L, X) {
  const prose = blockWords(L.concept) + blockWords(L.theory) + blockWords(L.application)
    + (L.examples || []).reduce((s, e) => s + words(e.setup) + (e.steps || []).reduce((a, st) => a + words(st), 0) + words(e.answer) + words(e.interpretation), 0)
    + (L.mistakes || []).reduce((s, m) => s + words(m.html), 0);
  const count = (list) => (list || []).reduce((s, x) => s + (x.type === 'steps' ? x.steps.length : 1), 0);
  const t = prose / 180 + (L.examples || []).length * 2 + (L.demo || []).length * 4
    + count(X?.guided) * 3 + count(X?.independent) * 2 + count(X?.check) * 1.5;
  return Math.max(15, Math.round(t / 5) * 5);
}

export async function loadCourse(c) {
  const course = { ...c, href: courseHref(c), modules: [], lessons: [], missing: [] };
  for (const m of c.modules) {
    const mod = { n: m.n, title: m.title, lessons: [], test: null };
    for (const slug of m.lessons) {
      const L = await loadLesson(c.id, slug);
      const X = await loadEx(c.id, slug);
      if (!L) { course.missing.push(slug); mod.lessons.push({ slug, missing: true, title: slug }); continue; }
      const item = {
        slug, title: L.title, blurb: L.blurb, minutes: minutesFor(L, X), href: lessonHref(c, slug), module: m.n,
        status: L.status, L, X,
        nGuided: (X?.guided || []).length, nIndependent: (X?.independent || []).length, nCheck: (X?.check || []).length,
      };
      mod.lessons.push(item);
      course.lessons.push(item);
    }
    const t = await loadModuleFile(c.id, `assess-m${m.n}`);
    if (t?.items?.length) mod.test = { slug: moduleTestSlug(m.n), href: `${course.href}${moduleTestSlug(m.n)}/`, title: `Module ${m.n} test`, n: t.items.length };
    course.modules.push(mod);
  }
  const d = await loadModuleFile(c.id, 'assess-diagnostic');
  course.diagnostic = d?.items?.length ? { slug: 'diagnostic', href: `${course.href}diagnostic/`, title: 'Diagnostic', n: d.items.length } : null;
  const f = await loadModuleFile(c.id, 'assess-final');
  course.final = f?.items?.length ? { slug: 'final', href: `${course.href}final/`, title: 'Final assessment', n: f.items.length } : null;
  const p = await loadModuleFile(c.id, 'project');
  const P = p?.default || p?.project;
  course.project = P ? { slug: 'project', href: `${course.href}project/`, title: P.title || c.project?.title, P } : null;
  course.lessons.forEach((l, i) => { l.n = i + 1; });
  course.minutes = course.lessons.reduce((s, l) => s + l.minutes, 0);
  return course;
}

export async function loadAll() {
  const out = [];
  for (const c of BUILT) out.push(await loadCourse(c));
  return out;
}

/** The order a student moves through a course: lessons, each module's test after its last lesson, then the project and the final. */
export function sequence(course) {
  const seq = [];
  course.modules.forEach((m) => {
    m.lessons.filter((l) => !l.missing).forEach((l) => seq.push({ kind: 'lesson', slug: l.slug, title: l.title, href: l.href, label: `Lesson ${l.n}` }));
    if (m.test) seq.push({ kind: 'test', slug: m.test.slug, title: `Module ${m.n} test`, href: m.test.href, label: `Module ${m.n}` });
  });
  if (course.project) seq.push({ kind: 'project', slug: 'project', title: course.project.title, href: course.project.href, label: 'Project' });
  if (course.final) seq.push({ kind: 'final', slug: 'final', title: 'Final assessment', href: course.final.href, label: 'Final' });
  return seq;
}

/** Glossary entries across built courses, first definition wins; later lessons that repeat a term are listed as "also in". */
export function glossary(courses) {
  const map = new Map();
  for (const c of courses) for (const l of c.lessons) for (const g of l.L.glossary || []) {
    const k = glossKey(g.term);
    if (!map.has(k)) map.set(k, { key: k, term: strip(g.term), def: g.def, course: c.id, code: c.code, lesson: l.slug, lessonTitle: l.title, href: l.href, also: [] });
    else map.get(k).also.push({ course: c.id, lesson: l.slug, href: l.href, title: l.title });
  }
  return [...map.values()].sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }));
}

export function formulas(courses) {
  const out = [];
  for (const c of courses) for (const l of c.lessons) for (const f of l.L.formulas || []) out.push({ ...f, course: c.id, code: c.code, lesson: l.slug, lessonTitle: l.title, href: l.href });
  return out;
}

export { catalog, DATA, existsSync, join, tex };
