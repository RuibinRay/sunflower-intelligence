// pages-hub.mjs — Learn's study home, the three school pages, the labs hub, the toolkit pages (glossary, formulas,
// review, notebook) and the curriculum checklist.
import { tex, inline, esc, strip, slugify, catalog } from './lib.mjs';
import { head, open, close, breadcrumb, roomCanvas, schoolCanvas, schoolOf, SCHOOL_ROOM, statusChip, levelName } from './shell.mjs';

const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const C = catalog.COURSE;
const builtIds = (courses) => new Set(courses.map((c) => c.id));

// ---------------------------------------------------------------- prerequisite map (static SVG)
export function prereqMap(schoolId, { root, courses }) {
  const built = builtIds(courses);
  const own = catalog.COURSES.filter((c) => c.school === schoolId);
  const ids = new Set(own.map((c) => c.id));
  const ext = new Set();
  own.forEach((c) => [...c.requires, ...c.recommends].forEach((p) => { if (!ids.has(p)) ext.add(p); }));
  const all = [...[...ext].map((id) => C[id]), ...own];
  const layer = {};
  const depth = (id, seen = new Set()) => {
    if (layer[id] != null) return layer[id];
    if (seen.has(id)) return 0;
    seen.add(id);
    const c = C[id];
    const ps = [...c.requires, ...c.recommends].filter((p) => all.some((x) => x.id === p));
    layer[id] = ps.length ? 1 + Math.max(...ps.map((p) => depth(p, seen))) : 0;
    return layer[id];
  };
  all.forEach((c) => depth(c.id));
  ext.forEach((id) => { layer[id] = 0; });
  const cols = Math.max(...Object.values(layer)) + 1;
  const byCol = Array.from({ length: cols }, (_, i) => all.filter((c) => layer[c.id] === i).sort((a, b) => catalog.ORDER.indexOf(a.id) - catalog.ORDER.indexOf(b.id)));
  const W = 150, H = 46, GX = 54, GY = 14, P = 8;
  const rows = Math.max(...byCol.map((c) => c.length));
  const width = P * 2 + cols * W + (cols - 1) * GX, height = P * 2 + rows * H + (rows - 1) * GY;
  const pos = {};
  byCol.forEach((list, ci) => { const off = (rows - list.length) * (H + GY) / 2; list.forEach((c, ri) => { pos[c.id] = { x: P + ci * (W + GX), y: P + off + ri * (H + GY) }; }); });
  const edges = [];
  all.forEach((c) => { if (ext.has(c.id)) return; [...c.requires.map((p) => [p, false]), ...c.recommends.map((p) => [p, true])].forEach(([p, soft]) => {
    if (!pos[p]) return;
    const a = pos[p], b = pos[c.id];
    const x1 = a.x + W, y1 = a.y + H / 2, x2 = b.x - 6, y2 = b.y + H / 2, mx = (x1 + x2) / 2;
    edges.push(`<path aria-hidden="true" class="pm-edge${soft ? ' is-soft' : ''}" d="M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}" marker-end="url(#pm-arrow-${schoolId})"/>`);
  }); });
  const nodes = all.map((c) => {
    const p = pos[c.id], isBuilt = built.has(c.id), isExt = ext.has(c.id);
    const label = c.title.length > 22 ? `${c.title.slice(0, 21).replace(/\s+\S*$/, '')}…` : c.title;
    const box = `<rect class="pm-node${isBuilt ? ' is-built' : ''}${isExt ? ' is-ext' : ''}" x="${p.x}" y="${p.y}" width="${W}" height="${H}" rx="8"/><text class="pm-code" x="${p.x + 10}" y="${p.y + 18}">${c.code}${isBuilt ? ' · open' : ''}</text><text class="pm-title" x="${p.x + 10}" y="${p.y + 35}">${esc(label)}</text>`;
    return isBuilt ? `<a href="${root}learn/${c.school}/${c.id}/" aria-label="${c.code} ${esc(c.title)}: open the course">${box}</a>` : `<g aria-hidden="true">${box}</g>`;
  }).join('');
  const sentences = all.filter((c) => !ext.has(c.id)).map((c) => {
    const req = c.requires.map((p) => C[p].code), rec = c.recommends.map((p) => C[p].code);
    return `<li>${c.code} ${esc(c.title)}: ${req.length ? `requires ${req.join(' and ')}` : 'no required courses'}${rec.length ? `; ${rec.join(' and ')} recommended` : ''}.</li>`;
  }).join('');
  return `<figure class="prereq-map">
          <div class="pm-scroll" tabindex="0" role="region" aria-label="Prerequisite map, scrolls sideways">
            <svg class="pm-svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="group" aria-label="Prerequisite map: the list below gives the same information">
              <defs><marker id="pm-arrow-${schoolId}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="pm-arrowhead" aria-hidden="true"/></marker></defs>
              ${edges.join('')}${nodes}
            </svg>
          </div>
          <figcaption>Arrows run from a course to the courses that build on it; dashed arrows are recommended rather than required. Filled boxes are courses open to study${ext.size ? '; outlined grey boxes are courses from other schools' : ''}.</figcaption>
          <details class="table-twin"><summary>The map as a list</summary><ul class="pm-list">${sentences}</ul></details>
        </figure>`;
}

// ---------------------------------------------------------------- school page
export function schoolPage(schoolId, { courses, plates }) {
  const root = '../../';
  const s = schoolOf(schoolId);
  const own = catalog.COURSES.filter((c) => c.school === schoolId);
  const built = builtIds(courses);
  const nReady = own.filter((c) => built.has(c.id)).length;
  const levels = ['intro', 'intermediate', 'advanced'];
  const card = (c) => {
    const ready = built.has(c.id);
    const loaded = courses.find((x) => x.id === c.id);
    const req = c.requires.map((p) => `<a href="${root}learn/${C[p].school}/${built.has(p) ? p + '/' : `#${p}`}">${C[p].code}</a>`);
    const rec = c.recommends.map((p) => C[p].code);
    const related = (c.related || []).map((r) => (r.plate ? `<li><a href="${root}learn/lessons/${r.plate}/">Plate: ${plates[r.plate] || r.plate}</a></li>` : `<li><a href="${root}${r.tool}">${r.label}</a></li>`)).join('');
    return `<li class="course-card${ready ? ' is-ready' : ''}" id="${c.id}" data-course="${c.id}">
            <div class="cc-top"><span class="cc-code">${c.code}</span>${statusChip(c.status)}</div>
            <h3 class="cc-title">${ready ? `<a href="${root}learn/${s.id}/${c.id}/">${esc(c.title)}</a>` : esc(c.title)}</h3>
            <p class="cc-blurb">${esc(c.blurb)}</p>
            <p class="cc-meta">${levelName(c.level)}${ready ? ` · ${plural(loaded.lessons.length, 'lesson')} · about ${Math.round(loaded.minutes / 30) / 2} hours` : ''}${req.length ? ` · requires ${req.join(', ')}` : ''}${rec.length ? ` · ${rec.join(', ')} recommended` : ''}</p>
            ${ready ? `<div class="cc-progress" data-progress="${c.id}" aria-live="polite"></div><p><a class="btn btn-primary btn-sm" href="${root}learn/${s.id}/${c.id}/">Open the course</a></p>` : `<details class="cc-plan"><summary>What it will cover</summary><ul class="topic-list">${(c.topics || []).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>${related ? `<p class="cc-related-h">Already on this site</p><ul class="cc-related">${related}</ul>` : ''}</details>`}
          </li>`;
  };
  const firstReady = own.findIndex((c) => built.has(c.id));
  const route = `
      <section class="course-group route-section" id="order" aria-labelledby="order-h">
        <h2 id="order-h">Suggested order</h2>
        <p class="section-lead">If you are starting out, take the courses in this order: each comes after everything it requires, and the general before the specialised. ${firstReady >= 0 ? `Step ${firstReady + 1}, ${C[own[firstReady].id].code}, is open now and starts from scratch${firstReady > 0 ? '; the steps before it are planned, and it teaches what it needs from them' : ''}.` : 'No course in this school is ready yet.'}</p>
        <ol class="route" role="list">${own.map((c, i) => `<li class="${built.has(c.id) ? 'is-ready' : 'is-planned'}${i === firstReady ? ' is-start' : ''}" data-course="${c.id}"><span class="rt-n" aria-hidden="true">${i + 1}</span><span class="rt-body">${built.has(c.id) ? `<a href="${root}learn/${s.id}/${c.id}/"><b>${c.code}</b> ${esc(c.title)}</a>` : `<a href="#${c.id}"><b>${c.code}</b> ${esc(c.title)}</a>`}<span class="rt-meta">${levelName(c.level)}${i === firstReady ? ' · <strong>start here</strong>' : built.has(c.id) ? ' · open' : ' · planned'}</span></span></li>`).join('')}</ol>
      </section>`;
  const groups = levels.map((lv) => {
    const list = own.filter((c) => c.level === lv);
    if (!list.length) return '';
    return `
      <section class="course-group" id="level-${lv}" aria-labelledby="level-${lv}-h">
        <h2 id="level-${lv}-h">${levelName(lv)}</h2>
        <ul class="course-cards" role="list">${list.map(card).join('')}
        </ul>
      </section>`;
  }).join('');
  return `${head({ title: `${s.name} · Learn`, desc: s.blurb, path: `learn/${s.id}/`, root })}${open({ root, bodyClass: `school--${s.id} page--school`, skip: 'Skip to the courses', data: { school: s.id } })}
    ${schoolCanvas({ root, school: s.id, title: s.name, kicker: 'School', note: `${s.blurb} ${nReady} of ${own.length} courses are open; the rest are planned and listed with what they will cover.`, toc: [['order', 'Suggested order'], ['level-intro', 'Introductory'], ['level-intermediate', 'Intermediate'], ['level-advanced', 'Advanced'], ['map', 'Prerequisite map']] })}

    <div class="ledger" id="ledger">
      ${breadcrumb([['The painting', root], ['Learn', `${root}learn/`], [s.name]])}
      <div class="ledger-intro">
        <p class="lead">${esc(s.blurb)} Courses are listed in the order to take them, from introductory to advanced; each lists what it requires. Courses marked <i>Planned</i> are not written yet, but their syllabus is here and some link to plates and tools that already cover part of the ground.</p>
      </div>
${route}${groups}
      <section class="course-group" id="map" aria-labelledby="map-h">
        <h2 id="map-h">Prerequisite map</h2>
        ${prereqMap(s.id, { root, courses })}
      </section>
    </div>${close({ root, script: 'study-school' })}`;
}

// ---------------------------------------------------------------- study home
export function homePage({ courses, glossary, formulas, featured }) {
  const root = '../';
  const built = builtIds(courses);
  const schoolCards = catalog.SCHOOLS.map((s) => {
    const own = catalog.COURSES.filter((c) => c.school === s.id);
    const ready = own.filter((c) => built.has(c.id));
    return `<li class="school-card school-card--${s.id}">
            <a class="sc-link" href="${s.id}/"><img src="${root}assets/img/flower-${SCHOOL_ROOM[s.id]}-160.webp" alt="" width="80" height="80" loading="lazy" decoding="async"><span class="sc-name">${s.name}</span></a>
            <p class="sc-blurb">${esc(s.blurb)}</p>
            <p class="sc-count">${ready.length} of ${own.length} courses open</p>
            <ul class="sc-ready" role="list">${ready.map((c) => `<li><a href="${s.id}/${c.id}/"><b>${c.code}</b> ${esc(c.title)}</a></li>`).join('')}</ul>
          </li>`;
  }).join('');
  const paths = catalog.PATHS.map((p, i) => {
    const start = p.courses.findIndex((id) => built.has(id));
    return `
          <div class="path-panel" id="path-${p.id}" data-path="${p.id}" role="tabpanel" aria-labelledby="path-tab-${p.id}"${i ? ' hidden' : ''}>
            <p class="path-blurb">${esc(p.blurb)}${start >= 0 ? ` Start with step ${start + 1}, <a href="${C[p.courses[start]].school}/${p.courses[start]}/">${C[p.courses[start]].code} ${esc(C[p.courses[start]].title)}</a>: it is open${start > 0 ? ', and it teaches what it needs from the planned steps before it' : ''}.` : ''}</p>
            <ol class="path-list" role="list">${p.courses.map((id, k) => { const c = C[id]; const ready = built.has(id); return `<li class="${ready ? 'is-ready' : 'is-planned'}${k === start ? ' is-start' : ''}" data-course="${id}"><span class="pl-n" aria-hidden="true">${k + 1}</span>${ready ? `<a href="${c.school}/${id}/"><b>${c.code}</b> ${esc(c.title)}</a> ${k === start ? '<span class="start-tag">Start here</span> ' : ''}<span class="pl-status"></span>` : `<span><b>${c.code}</b> ${esc(c.title)}</span> <span class="status-chip is-planned">Planned</span>`}</li>`; }).join('')}</ol>
          </div>`;
  }).join('');
  const labs = catalog.LABS.map((l) => `<li class="lab-card"><a href="labs/${l.id}/"><span class="lab-name">${l.name}</span><span class="lab-blurb">${esc(l.blurb)}</span><span class="lab-course">${C[l.course].code} ${esc(C[l.course].title)}</span></a></li>`).join('');
  const feat = featured.map((f) => `<li class="feat-card"><a href="${f.href.replace(/^learn\//, '')}"><span class="feat-code">${f.code} · lesson ${f.n}</span><span class="feat-title">${f.title}</span><span class="feat-blurb">${inline(f.blurb, {})}</span><span class="feat-meta">${f.minutes} min</span></a></li>`).join('');
  return `${head({ title: 'Learn', desc: 'Free university-level courses in financial accounting, data cleaning and the marketing mix, with labs, practice that tracks mastery, and spaced review. Progress stays in your browser.', path: 'learn/', root })}${open({ root, bodyClass: 'page--home', skip: 'Skip to the courses' })}
    <header class="canvas" aria-labelledby="room-title">
      <div class="canvas-flower"><img src="${root}assets/img/flower-learn.webp" width="720" height="720" alt="The open bloom to the right of the vase in the painting, petals spread wide."></div>
      <h1 id="room-title" class="display is-short">Learn</h1>
      <p class="chapter">Learning by doing</p>
      <p class="chapter-note">Van Gogh was largely self-taught. He worked through drawing courses page by page and copied the painters he admired, long before the sunflowers. Practice that is a little beyond you, repeated before you forget it, is still how skills grow.</p>
      <blockquote class="quote">“I keep on making what I can’t do yet in order to learn to be able to do it.”<cite class="quote-cite">Vincent van Gogh to Anthon van Rappard, Nuenen, about 18 August 1885</cite></blockquote>
      <!-- chrome:subnav --><!-- /chrome:subnav -->
      <nav aria-label="On this page"><ul class="toc" role="list"><li><a href="#continue">Start here</a></li><li><a href="#schools">Schools</a></li><li><a href="#paths">Learning paths</a></li><li><a href="#labs">Labs</a></li><li><a href="#how">How it works</a></li></ul></nav>
    </header>

    <div class="ledger" id="ledger">
      ${breadcrumb([['The painting', root], ['Learn']])}
      <div class="ledger-intro home-intro">
        <p class="lead">Free courses in finance and accounting, business analytics and marketing, written to a university standard. Each lesson teaches from first principles, works examples step by step and gives you practice with feedback; each course has labs, tests and a project. ${(() => { const done = catalog.COURSES.filter((c) => c.status === 'complete').length; const open = courses.length - courses.filter((c) => catalog.COURSE[c.id].status === 'complete').length; return `${done ? `${done} course${done === 1 ? ' is' : 's are'} complete. ` : ''}${open ? `${open === 3 ? 'Three' : open} foundation course${open === 1 ? ' is' : 's are'} open and being finished; a course is marked complete only after independent review and testing. ` : ''}The other ${catalog.COURSES.length - courses.length} are planned, and marked as such.`; })()}</p>
        <form class="study-search" role="search" id="study-search" action="#" onsubmit="return false">
          <label class="field-label" for="search-input">Search lessons, terms and formulas</label>
          <div class="search-row"><input class="input" id="search-input" type="search" autocomplete="off" placeholder="e.g. accrual, outliers, break-even" aria-describedby="search-hint" aria-controls="search-results"><span class="search-count" id="search-count" aria-live="polite"></span></div>
          <p class="field-hint" id="search-hint">${courses.reduce((s, c) => s + c.lessons.length, 0)} lessons, ${glossary.length} glossary terms and ${formulas.length} formulas, plus every course in the catalogue.</p>
          <ul class="search-results" id="search-results" role="list" hidden></ul>
        </form>
      </div>

      <section class="home-section" id="continue" aria-labelledby="continue-h">
        <h2 id="continue-h">Start here</h2>
        <div class="continue-box" id="continue-box">
          <p>New to all of this? Each of these courses is open and starts from scratch, so pick the subject you most want to learn. The <a href="#paths">Beginner path</a> shows what to take after it.</p>
          <ul class="start-list" role="list">${catalog.SCHOOLS.map((s) => courses.find((c) => c.school === s.id)).filter(Boolean).map((c) => `<li><a class="btn btn-secondary" href="${c.school}/${c.id}/"><span>${c.code} ${esc(c.title)}</span></a></li>`).join('')}</ul>
        </div>
        <div class="progress-board" id="progress-board" aria-live="polite"></div>
      </section>

      <section class="home-section" id="schools" aria-labelledby="schools-h">
        <h2 id="schools-h">Three schools</h2>
        <ul class="school-cards" role="list">${schoolCards}</ul>
      </section>

      <section class="home-section" id="paths" aria-labelledby="paths-h">
        <h2 id="paths-h">Learning paths</h2>
        <p class="section-lead">Three suggested routes through the catalogue. Not sure which fits? The <a href="practise/#placement">skills check</a> estimates your level in a few minutes and this section will recommend a path from it.</p>
        <div class="path-tabs segmented" role="tablist" aria-label="Learning paths">${catalog.PATHS.map((p, i) => `<button type="button" role="tab" class="path-tab" id="path-tab-${p.id}" aria-controls="path-${p.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${p.name}</button>`).join('')}</div>
        <p class="path-rec" id="path-rec" aria-live="polite"></p>${paths}
      </section>

      <section class="home-section" id="labs" aria-labelledby="labs-h">
        <h2 id="labs-h">Labs</h2>
        <p class="section-lead">Workbenches where you do the work rather than read about it. Each belongs to a course but can be used on its own.</p>
        <ul class="lab-cards" role="list">${labs}</ul>
      </section>

      <section class="home-section" id="featured" aria-labelledby="featured-h">
        <h2 id="featured-h">A lesson from each course</h2>
        <ul class="feat-cards" role="list">${feat}</ul>
      </section>

      <section class="home-section" id="toolkit" aria-labelledby="toolkit-h">
        <h2 id="toolkit-h">Your toolkit</h2>
        <ul class="toolkit" role="list">
          <li><a href="glossary/"><b>Glossary</b><span>${glossary.length} terms, searchable, each linked to the lesson that teaches it.</span></a></li>
          <li><a href="formulas/"><b>Formulas</b><span>${formulas.length} formulas with every symbol and unit defined.</span></a></li>
          <li><a href="review/"><b>Review</b><span class="tk-review">Flashcards and the questions you missed, brought back when they’re due.</span></a></li>
          <li><a href="notebook/"><b>Notebook</b><span>Your notes and bookmarks, and moving your progress to another browser.</span></a></li>
          <li><a href="lessons/"><b>Plates</b><span>Nineteen short lessons on the ideas behind the site’s tools.</span></a></li>
          <li><a href="practise/"><b>Skills check</b><span>An adaptive placement check and practice across those nineteen skills.</span></a></li>
          <li><a href="curriculum/"><b>Curriculum</b><span>All ${catalog.COURSES.length} courses, their prerequisites and what is built.</span></a></li>
        </ul>
      </section>

      <section class="home-section" id="how" aria-labelledby="how-h">
        <h2 id="how-h">How the courses work</h2>
        <div class="method-grid">
          <div><h3>Complete is not the same as mastered</h3><p>A lesson is complete when you have worked its guided problems and scored 80% on its knowledge check, not when you open it. Mastery is estimated separately from your first answers, using Bayesian knowledge tracing, and decays unless you review.</p></div>
          <div><h3>Worked examples, then practice</h3><p>Beginners learn faster from studied examples than from solving problems cold (Sweller and Cooper, 1985), and answering questions strengthens memory more than rereading (Roediger and Karpicke, 2006). Every lesson does both, with hints first and feedback that explains the mistake.</p></div>
          <div><h3>Spaced review</h3><p>Each lesson comes back for review when you are predicted to be about to forget it, using half-life regression (Settles and Meeder, 2016). Questions you got wrong come back too, and the glossary doubles as flashcards.</p></div>
          <div><h3>Checked, and honest about it</h3><p>Every number printed in a lesson is recomputed by a test; journal entries must balance and statements must add up. Each lesson was reviewed for accuracy by a second reader. Sources are listed in every lesson, and anything not yet verified says so.</p></div>
          <div><h3>Your progress stays with you</h3><p>Progress, notes and bookmarks are kept in this browser only: no account, nothing sent anywhere. Clearing your browser’s site data deletes them, so the Notebook lets you download a copy and load it elsewhere.</p></div>
          <div><h3>What it can’t do</h3><p>There is no teacher marking your work: written answers are marked by you against a model answer and a rubric. Answer keys are in the page’s code, as on any static site. The labs’ data and the companies in them are fictional.</p></div>
        </div>
      </section>

      <section class="sources" aria-labelledby="sources-title">
        <h2 id="sources-title">Sources</h2>
        <ol>
          <li>Van Gogh to Anthon van Rappard, Nuenen, on or about 18 August 1885, <a href="https://vangoghletters.org/vg/letters/let528/letter.html">letter 528</a>.</li>
          <li>Sweller, J. &amp; Cooper, G. A. (1985). The use of worked examples as a substitute for problem solving in learning algebra. <i>Cognition and Instruction</i>, 2(1), 59–89.</li>
          <li>Roediger, H. L. &amp; Karpicke, J. D. (2006). Test-enhanced learning: taking memory tests improves long-term retention. <i>Psychological Science</i>, 17(3), 249–255.</li>
          <li>Corbett, A. T. &amp; Anderson, J. R. (1995). Knowledge tracing: modeling the acquisition of procedural knowledge. <i>User Modeling and User-Adapted Interaction</i>, 4, 253–278.</li>
          <li>Settles, B. &amp; Meeder, B. (2016). <a href="https://research.duolingo.com/papers/settles.acl16.pdf">A trainable spaced repetition model for language learning</a>. <i>Proceedings of ACL</i>.</li>
        </ol>
      </section>
    </div>${close({ root, script: 'study-home' })}`;
}

// ---------------------------------------------------------------- labs hub
export function labsPage({ courses }) {
  const root = '../../';
  const cards = catalog.LABS.map((l) => `<li class="lab-card"><a href="${l.id}/"><span class="lab-name">${l.name}</span><span class="lab-blurb">${esc(l.blurb)}</span><span class="lab-course">${C[l.course].code} ${esc(C[l.course].title)}</span></a></li>`).join('');
  return `${head({ title: 'Labs · Learn', desc: 'Interactive workbenches: an accounting lab, a data cleaning lab and a marketing mix simulator.', path: 'learn/labs/', root })}${open({ root, bodyClass: 'page--labs', skip: 'Skip to the labs' })}
    ${roomCanvas({ root, title: 'Labs', note: 'Where you do the work: record transactions, clean a dataset, plan a product launch. Every lab is free and runs in your browser.' })}

    <div class="ledger" id="ledger">
      ${breadcrumb([['The painting', root], ['Learn', `${root}learn/`], ['Labs']])}
      <div class="ledger-intro"><p class="lead">Each lab is built for one course and used inside its lessons, cut down to the step being taught. Here you get the whole instrument. The businesses, data and markets in them are fictional, made up so that every mistake a lab shows you is one it was designed to contain.</p></div>
      <ul class="lab-cards lab-cards--big" role="list">${cards}</ul>
    </div>${close({ root, script: 'study-hub' })}`;
}

// ---------------------------------------------------------------- glossary
export function glossaryPage({ glossary }) {
  const root = '../../';
  const letters = [...new Set(glossary.map((g) => g.term[0].toUpperCase()))].sort();
  const groups = letters.map((L) => `
        <section class="g-group" id="letter-${L}" aria-labelledby="letter-${L}-h">
          <h2 id="letter-${L}-h">${L}</h2>
          <dl class="g-list">${glossary.filter((g) => g.term[0].toUpperCase() === L).map((g) => `
            <div class="g-entry" id="g-${slugify(g.key)}" data-course="${g.course}" data-text="${esc(`${g.term} ${strip(g.def)}`.toLowerCase())}">
              <dt>${esc(g.term)}</dt>
              <dd><p>${inline(g.def, {})}</p><p class="g-src">${g.code} · <a href="${root}${g.href}#term-${slugify(g.key)}">${esc(strip(g.lessonTitle))}</a></p></dd>
            </div>`).join('')}
          </dl>
        </section>`).join('');
  return `${head({ title: 'Glossary · Learn', desc: `${glossary.length} terms from the Learn courses, each with a plain-language definition and a link to the lesson that teaches it.`, path: 'learn/glossary/', root })}${open({ root, bodyClass: 'page--glossary', skip: 'Skip to the glossary' })}
    ${roomCanvas({ root, title: 'Glossary', note: `${glossary.length} terms from the courses, each defined where it is first taught.` })}

    <div class="ledger" id="ledger">
      ${breadcrumb([['The painting', root], ['Learn', `${root}learn/`], ['Glossary']])}
      <div class="ledger-intro">
        <p class="lead">Every term the courses define, in plain language, with a link to the lesson that teaches it. The glossary also feeds the flashcards in Review.</p>
        <div class="filter-bar" role="search">
          <div class="field"><label for="g-search">Find a term</label><input class="input" id="g-search" type="search" autocomplete="off" placeholder="e.g. accrual"></div>
          <div class="field"><label for="g-course">Course</label><select class="select" id="g-course"><option value="">All courses</option>${catalog.COURSES.filter((c) => c.modules).map((c) => `<option value="${c.id}">${c.code} ${esc(c.title)}</option>`).join('')}</select></div>
          <p class="filter-count" id="g-count" aria-live="polite">${glossary.length} terms</p>
        </div>
        <nav class="alpha" aria-label="Jump to a letter"><ul role="list">${letters.map((L) => `<li><a href="#letter-${L}">${L}</a></li>`).join('')}</ul></nav>
      </div>
${groups}
      <p class="empty-note" id="g-empty" hidden>No term matches. Try a shorter word, or <a href="../">search all of Learn</a>.</p>
    </div>${close({ root, script: 'study-glossary' })}`;
}

// ---------------------------------------------------------------- formulas
export function formulasPage({ formulas, courses }) {
  const root = '../../';
  const byCourse = courses.map((c) => {
    const fs = formulas.filter((f) => f.course === c.id);
    if (!fs.length) return '';
    const byLesson = c.lessons.filter((l) => fs.some((f) => f.lesson === l.slug)).map((l) => `
          <div class="fl-lesson">
            <h3><a href="${root}${l.href}#formulas">${l.n}. ${l.title}</a></h3>
            <div class="formula-grid">${fs.filter((f) => f.lesson === l.slug).map((f) => `
              <article class="formula-card" id="f-${c.id}-${esc(f.id)}" data-course="${c.id}" data-text="${esc(`${strip(f.name)} ${(f.where || []).map((w) => strip(w[1])).join(' ')}`.toLowerCase())}">
                <h4>${inline(f.name, {})}</h4>
                <div class="math-block">${tex(f.tex, true)}</div>
                <dl class="where">${(f.where || []).map(([s, m, u]) => `<div><dt>${tex(s)}</dt><dd>${inline(m, {})}${u ? `<span class="unit">${esc(u)}</span>` : ''}</dd></div>`).join('')}</dl>${f.assumptions ? `<p class="assume"><b>Assumes.</b> ${inline(f.assumptions, {})}</p>` : ''}
              </article>`).join('')}
            </div>
          </div>`).join('');
    return `
        <section class="fl-course" id="${c.id}" data-course="${c.id}" aria-labelledby="${c.id}-h">
          <h2 id="${c.id}-h">${c.code} ${esc(c.title)}</h2>${byLesson}
        </section>`;
  }).join('');
  return `${head({ title: 'Formulas · Learn', desc: `${formulas.length} formulas from the Learn courses with every symbol, unit and assumption defined.`, path: 'learn/formulas/', root, math: true })}${open({ root, bodyClass: 'page--formulas', skip: 'Skip to the formulas' })}
    ${roomCanvas({ root, title: 'Formulas', note: 'Every formula from the courses, with what each symbol means, its units and its assumptions.', toc: courses.filter((c) => formulas.some((f) => f.course === c.id)).map((c) => [c.id, c.code]) })}

    <div class="ledger" id="ledger">
      ${breadcrumb([['The painting', root], ['Learn', `${root}learn/`], ['Formulas']])}
      <div class="ledger-intro">
        <p class="lead">A formula is only useful if you know what goes into it. Each one here defines every symbol with its unit and states what it assumes; follow the link to see it worked in its lesson.</p>
        <div class="filter-bar" role="search">
          <div class="field"><label for="f-search">Find a formula</label><input class="input" id="f-search" type="search" autocomplete="off" placeholder="e.g. depreciation"></div>
          <p class="filter-count" id="f-count" aria-live="polite">${formulas.length} formulas</p>
        </div>
      </div>
${byCourse}
      <p class="empty-note" id="f-empty" hidden>No formula matches.</p>
    </div>${close({ root, script: 'study-formulas' })}`;
}

// ---------------------------------------------------------------- review and notebook (rendered mostly in the browser)
export function reviewPage() {
  const root = '../../';
  return `${head({ title: 'Review · Learn', desc: 'Spaced review: lessons due for a refresher, the questions you missed, and flashcards from the glossary and formula library.', path: 'learn/review/', root, math: true })}${open({ root, bodyClass: 'page--review', skip: 'Skip to your review' })}
    ${roomCanvas({ root, title: 'Review', note: 'What you have learned comes back here just before you are likely to forget it.', toc: [['due', 'Due now'], ['missed', 'Questions you missed'], ['cards', 'Flashcards']] })}

    <div class="ledger" id="ledger">
      ${breadcrumb([['The painting', root], ['Learn', `${root}learn/`], ['Review']])}
      <div class="ledger-intro"><p class="lead">Ten minutes here beats an hour of rereading. Lessons come back when the model predicts your recall has fallen to about half; missed questions come back until you get them right; flashcards cover the terms and formulas of the lessons you have studied.</p></div>
      <section class="home-section" id="due" aria-labelledby="due-h"><h2 id="due-h">Due now</h2><div id="due-root" aria-live="polite"><p class="ex-loading">Loading…</p></div></section>
      <section class="home-section" id="missed" aria-labelledby="missed-h"><h2 id="missed-h">Questions you missed</h2><div id="missed-root" aria-live="polite"><p class="ex-loading">Loading…</p></div></section>
      <section class="home-section" id="cards" aria-labelledby="cards-h"><h2 id="cards-h">Flashcards</h2><div id="cards-root"><p class="ex-loading">Loading…</p></div></section>
    </div>${close({ root, script: 'study-review' })}`;
}

export function notebookPage() {
  const root = '../../';
  return `${head({ title: 'Notebook · Learn', desc: 'Your notes and bookmarks from the Learn courses, and a way to move your progress between browsers.', path: 'learn/notebook/', root })}${open({ root, bodyClass: 'page--notebook', skip: 'Skip to your notebook' })}
    ${roomCanvas({ root, title: 'Notebook', note: 'Your bookmarks and notes, kept in this browser. Download them to keep a copy.', toc: [['bookmarks', 'Bookmarks'], ['notes', 'Notes'], ['backup', 'Back up and move']] })}

    <div class="ledger" id="ledger">
      ${breadcrumb([['The painting', root], ['Learn', `${root}learn/`], ['Notebook']])}
      <div class="ledger-intro"><p class="lead">Everything here lives in this browser’s storage on this device. Nothing is sent anywhere, which also means nothing is backed up unless you download it.</p></div>
      <section class="home-section" id="bookmarks" aria-labelledby="bm-h"><h2 id="bm-h">Bookmarks</h2><div id="bm-root" aria-live="polite"><p class="ex-loading">Loading…</p></div></section>
      <section class="home-section" id="notes" aria-labelledby="notes-h"><h2 id="notes-h">Notes</h2><div id="notes-root"><p class="ex-loading">Loading…</p></div></section>
      <section class="home-section" id="backup" aria-labelledby="backup-h">
        <h2 id="backup-h">Back up and move</h2>
        <p>Download your progress (lessons, answers, mastery, notes and bookmarks) as a file, and load it in another browser to carry on there. Loading a file replaces the progress in this browser.</p>
        <div class="input-actions">
          <button class="btn btn-secondary" type="button" id="export-progress">Download my progress</button>
          <button class="btn btn-secondary" type="button" id="export-notes">Download my notes (Markdown)</button>
          <label class="btn btn-secondary file-btn" for="import-progress">Load progress from a file</label>
          <input class="visually-hidden" type="file" id="import-progress" accept="application/json,.json">
          <button class="btn btn-secondary" type="button" id="clear-progress">Clear everything…</button>
        </div>
        <p class="field-hint" id="backup-status" aria-live="polite"></p>
        <dialog class="confirm-dialog" id="clear-dialog" aria-labelledby="clear-h">
          <form method="dialog">
            <h3 id="clear-h">Clear all your course progress?</h3>
            <p>This deletes your lesson progress, answers, mastery, notes and bookmarks from this browser. It can’t be undone unless you have downloaded a copy.</p>
            <div class="input-actions"><button class="btn btn-primary" value="clear">Clear everything</button><button class="btn btn-secondary" value="cancel" autofocus>Keep it</button></div>
          </form>
        </dialog>
      </section>
    </div>${close({ root, script: 'study-notebook' })}`;
}

// ---------------------------------------------------------------- curriculum checklist
export function curriculumPage({ courses }) {
  const root = '../../';
  const built = new Map(courses.map((c) => [c.id, c]));
  const schools = catalog.SCHOOLS.map((s) => {
    const own = catalog.COURSES.filter((c) => c.school === s.id);
    const rows = own.map((c) => {
      const b = built.get(c.id);
      const lessonCount = b ? `${b.lessons.length} of ${c.modules.reduce((n, m) => n + m.lessons.length, 0)} written` : (c.topics ? `${c.topics.length} topics outlined` : '');
      return `<tr><th scope="row">${b ? `<a href="${root}learn/${s.id}/${c.id}/">${c.code}</a>` : c.code}</th><td>${esc(c.title)}</td><td>${levelName(c.level)}</td><td>${c.requires.map((p) => C[p].code).join(', ') || '—'}</td><td>${statusChip(c.status)}</td><td>${lessonCount}</td></tr>`;
    }).join('');
    return `
      <section class="home-section" id="cur-${s.id}" aria-labelledby="cur-${s.id}-h">
        <h2 id="cur-${s.id}-h">${s.name}</h2>
        <div class="table-scroll"><table class="data-table cur-table"><caption class="visually-hidden">${s.name} courses</caption><thead><tr><th scope="col">Code</th><th scope="col">Course</th><th scope="col">Level</th><th scope="col">Requires</th><th scope="col">Status</th><th scope="col">Lessons</th></tr></thead><tbody>${rows}</tbody></table></div>
        ${prereqMap(s.id, { root, courses })}
      </section>`;
  }).join('');
  const detail = courses.map((c) => `
      <section class="home-section" id="detail-${c.id}" aria-labelledby="detail-${c.id}-h">
        <h2 id="detail-${c.id}-h">${c.code} ${esc(c.title)}: lesson by lesson</h2>
        <div class="table-scroll"><table class="data-table cur-table"><thead><tr><th scope="col">Lesson</th><th scope="col">Module</th><th scope="col">Status</th><th scope="col" class="is-num">Minutes</th><th scope="col" class="is-num">Exercises</th></tr></thead><tbody>${c.modules.map((m) => m.lessons.map((l) => `<tr><th scope="row">${l.missing ? esc(l.slug) : `<a href="${root}${l.href}">${l.n}. ${l.title}</a>`}</th><td>${m.n}</td><td>${l.missing ? statusChip('planned') : statusChip(l.status === 'reviewed' ? (c.status === 'complete' ? 'complete' : 'reviewed') : 'in-progress')}</td><td class="is-num">${l.minutes || ''}</td><td class="is-num">${l.missing ? '' : l.nGuided + l.nIndependent + l.nCheck}</td></tr>`).join('')).join('')}
        <tr><th scope="row">Module tests</th><td>1–${c.modules.length}</td><td>${c.modules.every((m) => m.test) ? statusChip(c.status === 'complete' ? 'complete' : 'reviewed') : statusChip('in-progress')}</td><td></td><td class="is-num">${c.modules.reduce((n, m) => n + (m.test?.n || 0), 0)}</td></tr>
        <tr><th scope="row">Diagnostic, project and final</th><td>—</td><td>${c.diagnostic && c.project && c.final ? statusChip(c.status === 'complete' ? 'complete' : 'reviewed') : statusChip('in-progress')}</td><td></td><td class="is-num">${(c.diagnostic?.n || 0) + (c.final?.n || 0)}</td></tr></tbody></table></div>
      </section>`).join('');
  return `${head({ title: 'Curriculum · Learn', desc: `All ${catalog.COURSES.length} courses in the three schools, their prerequisites, and which are built, reviewed or planned.`, path: 'learn/curriculum/', root })}${open({ root, bodyClass: 'page--curriculum', skip: 'Skip to the curriculum' })}
    ${roomCanvas({ root, title: 'Curriculum', note: `${catalog.COURSES.length} courses in three schools, and an honest account of what is built.`, toc: [...catalog.SCHOOLS.map((s) => [`cur-${s.id}`, s.short]), ['statuses', 'What the statuses mean']] })}

    <div class="ledger" id="ledger">
      ${breadcrumb([['The painting', root], ['Learn', `${root}learn/`], ['Curriculum']])}
      <div class="ledger-intro"><p class="lead">The full plan, school by school, with each course’s level, prerequisites and status. Courses are written one at a time in prerequisite order, and a course is marked complete only when every lesson, test and project is written, independently reviewed for accuracy and tested.</p></div>
      <section class="home-section" id="statuses" aria-labelledby="statuses-h">
        <h2 id="statuses-h">What the statuses mean</h2>
        <dl class="define">
          <div><dt>${statusChip('complete')}</dt><dd>Every lesson, module test, the project and the final are written, independently reviewed for accuracy, tested (numbers, answer keys, interactions) and live.</dd></div>
          <div><dt>${statusChip('reviewed')}</dt><dd>Written and reviewed for accuracy; final testing still in progress.</dd></div>
          <div><dt>${statusChip('in-progress')}</dt><dd>Being written or checked. Lessons may be readable but are not yet complete.</dd></div>
          <div><dt>${statusChip('planned')}</dt><dd>An outline only. Nothing is written yet; the syllabus shows what it will cover.</dd></div>
        </dl>
      </section>
${schools}${detail}
    </div>${close({ root, script: 'study-hub' })}`;
}
