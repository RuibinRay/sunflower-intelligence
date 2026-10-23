// pages-course.mjs — course pages, lesson pages, assessment pages and the project page.
// The course outline sits in the page's canvas column (the room's coloured side), collapsible on wide screens.
import { blocks, inline, tex, esc, strip, slugify, glossKey } from './lib.mjs';
import { head, open, close, breadcrumb, schoolOf, SCHOOL_ROOM, levelName, v } from './shell.mjs';
import { sequence, moduleTestSlug } from './course.mjs';
import { catalog } from './lib.mjs';

const WORD = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const hours = (m) => (m < 90 ? `about ${m} minutes` : `about ${Math.round(m / 30) / 2} hours`);
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

// ---------------------------------------------------------------- the course outline (canvas)
const PART_NAMES = [['start', 'Before you start'], ['idea', 'The idea'], ['depth', 'In depth'], ['formulas', 'Formulas'], ['examples', 'Worked examples'], ['explore', 'Explore'], ['mistakes', 'Common mistakes'], ['guided', 'Guided practice'], ['own', 'On your own'], ['practice', 'In practice'], ['check', 'Knowledge check'], ['summary', 'Summary']];

export function outline(course, root, here, parts = []) {
  const s = schoolOf(course.school);
  const li = (item, label) => {
    const cur = item.slug === here;
    return `<li class="o-item o-${item.kind}"${item.kind === 'lesson' ? ` data-lesson="${course.id}/${item.slug}"` : ` data-test="${course.id}/${item.slug}"`}><a href="${root}${item.href}"${cur ? ' aria-current="page"' : ''}><span class="o-mark" aria-hidden="true"></span><span class="o-text">${label}</span><span class="o-status visually-hidden"></span></a>${cur && parts.length ? `<ul class="o-parts" role="list">${parts.map(([id, name]) => `<li><a href="#${id}">${name}</a></li>`).join('')}</ul>` : ''}</li>`;
  };
  const mods = course.modules.map((m) => {
    const lessons = m.lessons.filter((l) => !l.missing);
    const items = lessons.map((l) => li({ kind: 'lesson', slug: l.slug, href: l.href }, `<span class="o-n">${l.n}</span> ${l.title}`)).join('');
    const test = m.test ? li({ kind: 'test', slug: m.test.slug, href: m.test.href }, `Module ${m.n} test`) : '';
    const holds = m.lessons.some((l) => l.slug === here) || m.test?.slug === here;
    return `<li class="o-module"><details${holds || here === 'overview' ? ' open' : ''}><summary><span class="o-mod-n">Module ${m.n}</span> ${m.title}</summary><ol role="list">${items}${test}</ol></details></li>`;
  }).join('');
  const ends = [
    course.diagnostic ? li({ kind: 'test', slug: 'diagnostic', href: course.diagnostic.href }, 'Diagnostic') : '',
    course.project ? li({ kind: 'test', slug: 'project', href: course.project.href }, 'Project') : '',
    course.final ? li({ kind: 'test', slug: 'final', href: course.final.href }, 'Final assessment') : '',
  ];
  return `
    <header class="canvas canvas--sub canvas--course" id="course-canvas" aria-label="Course outline">
      <div class="canvas-top">
        <a class="canvas-room" href="${root}learn/${s.id}/"><img src="${root}assets/img/flower-${SCHOOL_ROOM[s.id]}-160.webp" alt="" width="56" height="56"><span>${s.name}</span></a>
        <button class="outline-toggle" type="button" aria-expanded="true" aria-controls="course-outline"><span class="ot-open">Hide outline</span><span class="ot-closed">Show outline</span></button>
      </div>
      <p class="course-code">${course.code} · ${levelName(course.level)}</p>
      <p class="course-name"><a href="${root}${course.href}"${here === 'overview' ? ' aria-current="page"' : ''}>${course.title}</a></p>
      <div class="course-meter" data-course="${course.id}"><span class="cm-bar" aria-hidden="true"><span></span></span><span class="cm-text">${plural(course.lessons.length, 'lesson')}</span></div>
      <nav class="outline" id="course-outline" aria-label="${course.code} lessons">
        <ol class="o-list" role="list">
          ${ends[0]}
          ${mods}
          ${ends[1]}${ends[2]}
        </ol>
      </nav>
    </header>`;
}

function pager(course, root, here) {
  const seq = sequence(course);
  const i = seq.findIndex((x) => x.slug === here);
  const prev = i > 0 ? seq[i - 1] : null, next = i >= 0 && i < seq.length - 1 ? seq[i + 1] : null;
  return `
      <nav class="lesson-pager" aria-label="Previous and next">
        ${prev ? `<a class="pager-prev" href="${root}${prev.href}" rel="prev"><span>Previous · ${prev.label}</span>${prev.title}</a>` : '<span></span>'}
        <a class="pager-all" href="${root}${course.href}">${course.code} overview</a>
        ${next ? `<a class="pager-next" href="${root}${next.href}" rel="next"><span>Next · ${next.label}</span>${next.title}</a>` : '<span></span>'}
      </nav>`;
}

// ---------------------------------------------------------------- lesson page
function formulaCard(f, ctx) {
  const where = (f.where || []).map(([sym, meaning, unit]) => `<div><dt>${tex(sym)}</dt><dd>${inline(meaning, ctx)}${unit ? `<span class="unit">${esc(unit)}</span>` : ''}</dd></div>`).join('');
  return `<article class="formula-card" id="f-${esc(f.id)}" aria-labelledby="f-${esc(f.id)}-h">
            <h3 id="f-${esc(f.id)}-h">${inline(f.name, ctx)}</h3>
            <div class="math-block">${tex(f.tex, true)}</div>
            <dl class="where">${where}</dl>${f.assumptions ? `\n            <p class="assume"><b>Assumes.</b> ${inline(f.assumptions, ctx)}</p>` : ''}${f.note ? `\n            <p class="note">${inline(f.note, ctx)}</p>` : ''}
          </article>`;
}
const LEVEL = { simple: 'A first example', challenging: 'A harder example', applied: 'Applied: a business decision' };
function exampleHTML(e, i, ctx) {
  const extra = [e.journal ? blocks([{ journal: e.journal }], ctx, 'ex') : '', e.table ? blocks([{ table: e.table }], ctx, 'ex') : '', e.statement ? blocks([{ statement: e.statement }], ctx, 'ex') : ''].join('');
  return `<figure class="plate worked worked--${e.level}" id="example-${i + 1}" aria-labelledby="example-${i + 1}-h">
            <figcaption class="plate-cap" id="example-${i + 1}-h">${LEVEL[e.level]}: ${inline(e.title, ctx)}</figcaption>
            ${e.fictional ? '<p class="fiction-tag">Fictional figures</p>' : ''}
            <p class="plate-setup">${inline(e.setup, ctx)}</p>${extra}
            <ol class="plate-steps">${e.steps.map((st) => `\n              <li><span>${inline(st, ctx)}</span></li>`).join('')}
            </ol>
            <p class="plate-result"><b>Answer.</b> ${inline(e.answer, ctx)}</p>
            <p class="worked-meaning"><b>What it means.</b> ${inline(e.interpretation, ctx)}</p>
          </figure>`;
}
function widgetHTML(d, X, ctx) {
  const w = X?.widgets?.[d.widget];
  return `<div class="widget-wrap">
            ${d.intro ? `<p class="widget-intro">${inline(d.intro, ctx)}</p>` : ''}
            <div class="widget" id="w-${esc(d.widget)}" data-widget="${esc(d.widget)}" data-type="${esc(w?.type || '')}"><p class="widget-loading">Loading the interactive…</p><noscript><p class="note">This interactive needs JavaScript.</p></noscript></div>
          </div>`;
}
const setHTML = (set, n, label) => `<div class="ex-set" id="set-${set}" data-set="${set}" data-count="${n}" aria-label="${label}"><p class="ex-loading">Loading ${WORD[n] || n} ${n === 1 ? 'question' : 'questions'}…</p><noscript><p class="note">The practice questions need JavaScript.</p></noscript></div>`;
function refsHTML(refs, ctx) {
  return `<ol class="ref-list">${refs.map((r) => `\n            <li>${inline(r.text, ctx)}${r.url ? ` <a href="${esc(r.url)}">${esc(r.url.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, '').slice(0, 60))}${r.url.replace(/^https:\/\/(www\.)?/, '').length > 60 ? '…' : ''}</a>` : ''}${r.checked ? '' : ' <span class="unverified">(not yet verified)</span>'}</li>`).join('')}
          </ol>`;
}

export function lessonPage(course, l, ctx) {
  const root = '../../../../';
  const { L, X } = l;
  const s = schoolOf(course.school);
  const mod = course.modules.find((m) => m.n === l.module);
  const lessonInModule = mod.lessons.filter((x) => !x.missing).findIndex((x) => x.slug === l.slug) + 1;
  ctx = { ...ctx, glossaryHref: `${root}learn/glossary/` };
  const parts = PART_NAMES.filter(([id]) => (id !== 'formulas' || L.formulas?.length) && (id !== 'explore' || L.demo?.length));
  const part = (id, inner, lead = '') => `
        <section class="lesson-part part-${id}" id="${id}" aria-labelledby="${id}-h">
          <h2 id="${id}-h">${PART_NAMES.find((p) => p[0] === id)[1]}</h2>${lead ? `\n          <p class="part-lead">${lead}</p>` : ''}
          ${inner}
        </section>`;
  const prereq = (L.prerequisites || []).map((p) => {
    if (p.lesson) { const [c, sl] = p.lesson.split('/'); const cc = catalog.COURSE[c]; const href = `${root}learn/${cc.school}/${c}/${sl}/`; const t = ctx.titles?.[p.lesson] || sl; return `<li><a href="${href}">${t}</a>${p.why ? ` — ${inline(p.why, ctx)}` : ''}</li>`; }
    if (p.plate) return `<li><a href="${root}learn/lessons/${p.plate}/">${ctx.plates?.[p.plate] || p.plate}</a> (a short plate)${p.why ? ` — ${inline(p.why, ctx)}` : ''}</li>`;
    return `<li>${inline(p.text, ctx)}</li>`;
  }).join('');
  const caseLine = L.case ? `<p class="case-line"><span class="fiction-tag">Fictional case</span> ${esc(catalog.CASES[L.case].line)}</p>` : '';
  const nG = l.nGuided, nI = l.nIndependent, nK = l.nCheck;
  const summary = `
          <ul class="summary-list">${L.summary.map((x) => `\n            <li>${inline(x, ctx)}</li>`).join('')}
          </ul>${L.formulas?.length ? `
          <h3>Key formulas</h3>
          <ul class="key-formulas">${L.formulas.map((f) => `<li><a href="#f-${esc(f.id)}">${inline(f.name, ctx)}</a></li>`).join('')}</ul>` : ''}
          <h3>Terms introduced</h3>
          <dl class="define glossary-mini">${L.glossary.map((g) => `<div id="term-${slugify(glossKey(g.term))}"><dt>${inline(g.term, ctx)}</dt><dd>${inline(g.def, ctx)}</dd></div>`).join('')}</dl>
          <h3 id="references">Sources</h3>
          ${refsHTML(L.references, ctx)}`;
  const body = [
    part('start', `
          <div class="start-grid">
            <div class="start-objectives">
              <h3>You will be able to</h3>
              <ul class="objectives">${L.objectives.map((o) => `<li>${inline(o, ctx)}</li>`).join('')}</ul>
            </div>
            <div class="start-prereq">
              <h3>Review first</h3>
              ${prereq ? `<ul class="prereq-list">${prereq}</ul>` : '<p>Nothing: this lesson starts from scratch.</p>'}
              ${caseLine}
            </div>
          </div>
          <aside class="complete-card" id="complete-card" aria-labelledby="complete-h">
            <h3 id="complete-h">To complete this lesson</h3>
            <ul class="complete-list" role="list">
              <li data-req="guided"><span class="req-mark" aria-hidden="true"></span>Work all ${WORD[nG] || nG} guided problems <span class="req-state">(not started)</span></li>
              <li data-req="check"><span class="req-mark" aria-hidden="true"></span>Score at least 80% on the knowledge check <span class="req-state">(not taken)</span></li>
            </ul>
            <p class="mastery-line" id="mastery-line">Mastery is tracked separately, from your first answers to the questions on your own, the knowledge check and the tests, and from spaced review.</p>
          </aside>`),
    part('idea', blocks(L.concept, ctx, 'concept')),
    part('depth', blocks(L.theory, ctx, 'theory')),
    L.formulas?.length ? part('formulas', `<div class="formula-grid">${L.formulas.map((f) => formulaCard(f, ctx)).join('\n          ')}</div>`) : '',
    part('examples', L.examples.map((e, i) => exampleHTML(e, i, ctx)).join('\n          ')),
    L.demo?.length ? part('explore', L.demo.map((d) => widgetHTML(d, X, ctx)).join('\n          ')) : '',
    part('mistakes', `<ul class="mistake-list" role="list">${L.mistakes.map((m) => `\n            <li class="mistake"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 5.5v5.2M10 14.2v.3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><div><h3>${inline(m.title, ctx)}</h3><p>${inline(m.html, ctx)}</p></div></li>`).join('')}
          </ul>`),
    part('guided', setHTML('guided', nG, 'Guided practice'), 'Work through these with hints when you need them. Every hint and every worked solution is there to be used.'),
    part('own', setHTML('independent', nI, 'Practice on your own'), 'No hints this time. Answer, check, and read the feedback; the solution appears once you have answered or if you ask for it. Your first answers count toward mastery.'),
    part('practice', blocks(L.application, ctx, 'application')),
    part('check', setHTML('check', nK, 'Knowledge check'), `${cap(WORD[nK] || String(nK))} questions, one attempt each, no hints. Score 80% or more to complete the lesson; you can take it again at any time.`),
    part('summary', summary),
  ].join('');
  const title = strip(L.title);
  return `${head({ title: `${title} · ${course.code}`, desc: L.blurb, path: l.href, root, math: true, css: ctx.css })}${open({ root, bodyClass: `school--${s.id} page--lesson`, skip: 'Skip to the lesson', data: { course: course.id, lesson: l.slug, module: l.module } })}
    ${outline(course, root, l.slug, parts)}

    <div class="ledger" id="ledger">
      ${breadcrumb([['The painting', root], ['Learn', `${root}learn/`], [s.short, `${root}learn/${s.id}/`], [course.code, `${root}${course.href}`], [title]])}
      <header class="lesson-head">
        <p class="lesson-kicker">${course.code} · Module ${l.module}, lesson ${lessonInModule} · Lesson ${l.n} of ${course.lessons.length}</p>
        <h1 class="lesson-title">${L.title}</h1>
        <p class="lead">${inline(L.blurb, ctx)}</p>
        <div class="lesson-meta">
          <span class="lm-time">About ${l.minutes} minutes</span>
          <span class="lm-status" id="lesson-status" aria-live="polite"></span>
          <span class="lesson-tools">
            <button class="tool-btn" type="button" id="bookmark-btn" aria-pressed="false"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5.5 3h9v14l-4.5-3.4L5.5 17z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg><span>Bookmark</span></button>
            <button class="tool-btn" type="button" id="notes-btn" aria-expanded="false" aria-controls="notes-panel"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 3.5h12v13H4zM7 7.5h6M7 10.5h6M7 13.5h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><span>Notes</span></button>
          </span>
        </div>
      </header>

      <article class="lesson study-lesson" data-lesson="${course.id}/${l.slug}">${body}
      </article>
${pager(course, root, l.slug)}
    </div>

    <aside class="notes-panel" id="notes-panel" aria-labelledby="notes-title" hidden>
      <div class="notes-head"><h2 id="notes-title">Your notes</h2><button class="icon-btn icon-btn-sm notes-close" type="button" aria-label="Close notes"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5.5 5.5l9 9M14.5 5.5l-9 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button></div>
      <label class="field-label" for="notes-text">Notes on “${esc(title)}”</label>
      <textarea class="textarea notes-text" id="notes-text" rows="12" placeholder="What do you want to remember? Questions to come back to?"></textarea>
      <p class="field-hint" id="notes-status">Saved in this browser as you type.</p>
      <p class="notes-more"><a href="${root}learn/notebook/">All your notes and bookmarks</a></p>
    </aside>${close({ root, script: 'study-lesson' })}`;
}

// ---------------------------------------------------------------- course page
export function coursePage(course, ctx) {
  const root = '../../../';
  const s = schoolOf(course.school);
  const c = catalog.COURSE[course.id];
  const prereqs = [...c.requires.map((id) => [id, 'required']), ...c.recommends.map((id) => [id, 'recommended'])];
  const prereqHTML = prereqs.length ? `<ul class="prereq-list">${prereqs.map(([id, kind]) => { const p = catalog.COURSE[id]; return `<li>${p.modules ? `<a href="${root}learn/${p.school}/${p.id}/">${p.code} ${p.title}</a>` : `${p.code} ${p.title} <span class="status-chip is-planned">Planned</span>`} — ${kind}${!p.modules ? '. Until it is written, this course teaches what it needs from it.' : ''}</li>`; }).join('')}</ul>` : '<p>None. The course starts from scratch.</p>';
  const lessonRow = (l) => `<li class="lesson-row" data-lesson="${course.id}/${l.slug}"><a href="${root}${l.href}"><span class="lr-n" aria-hidden="true">${l.n}</span><span class="lr-body"><span class="lr-title">${l.title}</span><span class="lr-blurb">${inline(l.blurb, ctx)}</span><span class="lr-meta">${l.minutes} min · <span class="lr-status">not started</span></span></span></a></li>`;
  const testRow = (t, label, blurb) => `<li class="lesson-row is-test" data-test="${course.id}/${t.slug}"><a href="${root}${t.href}"><span class="lr-n" aria-hidden="true">✓</span><span class="lr-body"><span class="lr-title">${label}</span><span class="lr-blurb">${blurb}</span><span class="lr-meta"><span class="lr-status">not taken</span></span></span></a></li>`;
  const modules = course.modules.map((m) => `
        <section class="course-module" id="module-${m.n}" aria-labelledby="module-${m.n}-h">
          <h3 id="module-${m.n}-h"><span class="cm-n">Module ${m.n}</span> ${m.title}</h3>
          <ol class="lesson-rows" role="list">${m.lessons.filter((l) => !l.missing).map(lessonRow).join('')}${m.test ? testRow(m.test, `Module ${m.n} test`, `${m.test.n} questions on this module. 70% passes.`) : ''}</ol>
        </section>`).join('');
  const lab = catalog.LABS.find((x) => x.id === c.lab);
  const refs = new Map();
  course.lessons.forEach((l) => (l.L.references || []).forEach((r) => { const k = strip(r.text).slice(0, 80); if (!refs.has(k)) refs.set(k, r); }));
  const related = (c.related || []).map((r) => (r.plate ? `<li><a href="${root}learn/lessons/${r.plate}/">Plate: ${ctx.plates?.[r.plate] || r.plate}</a></li>` : `<li><a href="${root}${r.tool}">${r.label}</a> (tool)</li>`)).join('');
  const caseBlock = c.case ? `<div class="case-block"><p class="case-tag">Fictional case</p><p><b>${catalog.CASES[c.case].name}.</b> ${esc(catalog.CASES[c.case].line)} Every name and figure in it is invented for teaching.</p></div>` : '';
  return `${head({ title: `${course.code} ${course.title}`, desc: course.blurb, path: course.href, root, css: [] })}${open({ root, bodyClass: `school--${s.id} page--course`, skip: 'Skip to the course', data: { course: course.id } })}
    ${outline(course, root, 'overview')}

    <div class="ledger" id="ledger">
      ${breadcrumb([['The painting', root], ['Learn', `${root}learn/`], [s.short, `${root}learn/${s.id}/`], [course.code]])}
      <header class="lesson-head course-head">
        <p class="lesson-kicker">${course.code} · ${levelName(course.level)} · ${plural(course.lessons.length, 'lesson')} in ${WORD[course.modules.length]} modules · ${hours(course.minutes)}</p>
        <h1 class="lesson-title">${course.title}</h1>
        <p class="lead">${esc(course.blurb)}</p>
        <div class="course-cta" id="course-cta"><a class="btn btn-primary" href="${root}${course.lessons[0]?.href || course.href}">Start with lesson 1</a>${course.diagnostic ? ` <a class="btn btn-secondary" href="${root}${course.diagnostic.href}">Take the diagnostic first</a>` : ''}</div>
        <div class="course-progress" id="course-progress" aria-live="polite"></div>
      </header>

      <section class="course-section" id="about" aria-labelledby="about-h">
        <h2 id="about-h">What you will learn</h2>
        <ul class="objectives">${c.outcomes.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>
        <div class="course-facts">
          <div><h3>Prerequisites</h3>${prereqHTML}</div>
          <div><h3>How it works</h3><p>Each lesson teaches the idea from first principles, works examples step by step, lets you explore it in an interactive, then has you practise with feedback. A lesson is complete when you have worked its guided problems and scored 80% on its knowledge check. Mastery is tracked separately and comes back for review before you are likely to forget. Each module ends with a test; the course ends with a project and a final assessment.</p></div>
        </div>
        ${caseBlock}
      </section>
${course.diagnostic ? `
      <section class="course-section" id="diagnostic-card" aria-labelledby="diag-h">
        <h2 id="diag-h">Not sure where to start?</h2>
        <p>The diagnostic has ${course.diagnostic.n} questions across the course. It doesn’t count toward anything; it suggests the module to start from. <a href="${root}${course.diagnostic.href}">Take the diagnostic</a>.</p>
        <p class="diag-result" id="diag-result" aria-live="polite"></p>
      </section>` : ''}
      <section class="course-section" id="modules" aria-labelledby="modules-h">
        <h2 id="modules-h">Modules and lessons</h2>${modules}
      </section>

      <section class="course-section" id="finish" aria-labelledby="finish-h">
        <h2 id="finish-h">Project and final assessment</h2>
        <ol class="lesson-rows" role="list">${course.project ? testRow(course.project, `Project: ${course.project.title}`, esc(c.project?.blurb || '')) : ''}${course.final ? testRow(course.final, 'Final assessment', `${course.final.n} questions across the whole course. 70% passes.`) : ''}</ol>
        <p class="note">The course is complete when every lesson is complete, every module test is passed, the project is finished and the final assessment is passed.</p>
      </section>

      <section class="course-section" id="resources" aria-labelledby="res-h">
        <h2 id="res-h">Resources</h2>
        <ul class="resource-list">
          ${lab ? `<li><a href="${root}learn/labs/${lab.id}/"><b>${lab.name}</b></a>: ${esc(lab.blurb)}</li>` : ''}
          <li><a href="${root}learn/glossary/?course=${course.id}"><b>Glossary</b></a>: every term this course defines.</li>
          <li><a href="${root}learn/formulas/?course=${course.id}"><b>Formulas</b></a>: every formula with its symbols and units.</li>
          <li><a href="${root}learn/review/"><b>Review</b></a>: flashcards and the questions you missed, when they are due.</li>
        </ul>
        ${related ? `<h3>Elsewhere on this site</h3><ul class="resource-list">${related}</ul>` : ''}
        <h3>Sources used in this course</h3>
        ${refsHTML([...refs.values()], ctx)}
      </section>
    </div>${close({ root, script: 'study-course' })}`;
}

// ---------------------------------------------------------------- assessments and project
const KIND = {
  diagnostic: { title: 'Diagnostic', lead: (n) => `${cap(WORD[n] || String(n))} questions from across the course. Answer what you can; skip what you can’t. Nothing is recorded as mastery: the result only suggests where to start.` },
  module: { title: (m) => `Module ${m.n} test: ${m.title}`, lead: (n) => `${cap(WORD[n] || String(n))} questions on this module, without hints. Feedback comes after you submit. 70% passes; you can retake it, and your best score counts.` },
  final: { title: 'Final assessment', lead: (n) => `${n} questions across the whole course, without hints. Feedback comes after you submit. 70% passes; you can retake it, and your best score counts.` },
};

export function assessPage(course, kind, ctx, mod = null) {
  const root = '../../../../';
  const s = schoolOf(course.school);
  const slug = kind === 'module' ? moduleTestSlug(mod.n) : kind;
  const t = kind === 'module' ? mod.test : course[kind];
  const title = kind === 'module' ? KIND.module.title(mod) : KIND[kind].title;
  const file = kind === 'module' ? `assess-m${mod.n}` : `assess-${kind}`;
  return `${head({ title: `${title} · ${course.code}`, desc: `${course.code} ${course.title}: ${strip(title)}.`, path: t.href, root, css: ctx.css })}${open({ root, bodyClass: `school--${s.id} page--assess`, skip: 'Skip to the questions', data: { course: course.id, kind, file, module: mod?.n || '', slug } })}
    ${outline(course, root, slug)}

    <div class="ledger" id="ledger">
      ${breadcrumb([['The painting', root], ['Learn', `${root}learn/`], [s.short, `${root}learn/${s.id}/`], [course.code, `${root}${course.href}`], [strip(title)]])}
      <header class="lesson-head">
        <p class="lesson-kicker">${course.code} · ${kind === 'module' ? `Module ${mod.n}` : kind === 'final' ? 'End of course' : 'Before you start'}</p>
        <h1 class="lesson-title">${title}</h1>
        <p class="lead">${KIND[kind].lead(t.n)}</p>
        <p class="assess-record" id="assess-record" aria-live="polite"></p>
      </header>
      <div class="assess-root" id="assess-root"><p class="ex-loading">Loading the questions…</p><noscript><p class="note">The questions need JavaScript.</p></noscript></div>
${pager(course, root, slug)}
    </div>${close({ root, script: 'study-assess' })}`;
}

export function projectPage(course, ctx) {
  const root = '../../../../';
  const s = schoolOf(course.school);
  const P = course.project.P;
  const c = catalog.COURSE[course.id];
  return `${head({ title: `Project: ${P.title} · ${course.code}`, desc: c.project?.blurb || P.title, path: course.project.href, root, math: false, css: ctx.css })}${open({ root, bodyClass: `school--${s.id} page--project`, skip: 'Skip to the project', data: { course: course.id, slug: 'project' } })}
    ${outline(course, root, 'project')}

    <div class="ledger" id="ledger">
      ${breadcrumb([['The painting', root], ['Learn', `${root}learn/`], [s.short, `${root}learn/${s.id}/`], [course.code, `${root}${course.href}`], ['Project']])}
      <header class="lesson-head">
        <p class="lesson-kicker">${course.code} · Applied project</p>
        <h1 class="lesson-title">${inline(P.title, ctx)}</h1>
        <div class="lead project-brief">${blocks(Array.isArray(P.brief) ? P.brief : [{ p: P.brief }], ctx, 'project.brief')}</div>
        ${P.deliverables?.length ? `<h2 class="h-small">What you will produce</h2><ul class="objectives">${P.deliverables.map((d) => `<li>${inline(d, ctx)}</li>`).join('')}</ul>` : ''}
        <p class="assess-record" id="assess-record" aria-live="polite"></p>
      </header>
      <div class="project-root" id="project-root"><p class="ex-loading">Loading the project…</p><noscript><p class="note">The project needs JavaScript.</p></noscript></div>
${pager(course, root, 'project')}
    </div>${close({ root, script: 'study-project' })}`;
}
