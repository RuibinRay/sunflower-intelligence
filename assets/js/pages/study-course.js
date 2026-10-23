// study-course.js — a course's overview page: where you are, what's next, and each lesson's and test's status.
import { initSite } from '../core/site.js?v=9';
import { $, $$, h } from '../core/dom.js?v=9';
import * as P from '../study/progress.js?v=9';
import { initOutline, paintOutline, pct, scrollersFocusable } from '../study/common.js?v=9';
import { MAP } from '../data/study/map.js?v=9';

initSite();
scrollersFocusable();
initOutline();
const course = document.body.dataset.course;
const root = document.body.dataset.root;
const c = MAP[course];

const LABEL = { new: 'not started', started: 'in progress', done: 'complete', mastered: 'complete and mastered' };
function paint() {
  paintOutline(course);
  const cs = P.courseStatus(course);
  $$('.lesson-row[data-lesson]').forEach((row) => {
    const [, slug] = row.dataset.lesson.split('/');
    const st = P.lessonStatus(course, slug);
    row.classList.remove('is-started', 'is-done', 'is-mastered');
    if (st.state !== 'new') row.classList.add(`is-${st.state}`);
    row.querySelector('.lr-status').textContent = LABEL[st.state] + (st.mastery != null && !st.mastered ? ` · mastery ${pct(st.mastery)}` : '');
  });
  $$('.lesson-row[data-test]').forEach((row) => {
    const [, slug] = row.dataset.test.split('/');
    const out = row.querySelector('.lr-status');
    row.classList.remove('is-passed', 'is-started');
    if (slug === 'project') {
      const p = P.projectRecord(course);
      const n = Object.values(p.stages).filter((x) => x.done).length;
      if (p.completed) { row.classList.add('is-passed'); out.textContent = 'finished'; } else if (n) { row.classList.add('is-started'); out.textContent = `${n} stage${n === 1 ? '' : 's'} done`; }
      return;
    }
    const t = P.testRecord(course, slug);
    if (!t) return;
    if (t.passed) row.classList.add('is-passed'); else row.classList.add('is-started');
    out.textContent = `${t.passed ? 'passed' : 'not passed yet'} · best ${pct(t.best)}`;
  });

  // where you are
  const box = $('#course-progress');
  if (cs.started) {
    const stat = (label, value, frac, cls = '') => h('div', { class: 'cp-stat' }, h('dt', {}, label), h('dd', {}, value), frac != null ? h('div', { class: `cp-bar ${cls}`, 'aria-hidden': 'true' }, h('i', { style: { width: `${Math.round(frac * 100)}%` } })) : null);
    box.replaceChildren(h('dl', { style: { display: 'contents' } },
      stat('Lessons complete', `${cs.done} of ${cs.total}`, cs.done / cs.total),
      stat('Average mastery', pct(cs.masteryAvg), cs.masteryAvg, 'is-mastery'),
      stat('Module tests passed', `${cs.testsPassed} of ${cs.tests.length}`, cs.tests.length ? cs.testsPassed / cs.tests.length : null),
      stat('Course', cs.complete ? 'Complete' : 'In progress', null)));
    const next = P.nextStep(course);
    const cta = $('#course-cta');
    if (next) cta.replaceChildren(h('a', { class: 'btn btn-primary', href: `${root}${next.href}` }, `Continue: ${next.kind === 'lesson' ? `lesson ${c.lessons.find((l) => l.slug === next.slug)?.n} · ` : ''}${next.title}`));
    else cta.replaceChildren(h('p', {}, h('strong', {}, 'You have finished this course.'), ' Lessons come back in ', h('a', { href: `${root}learn/review/` }, 'Review'), ' when they are due.'));
  }
  const d = P.diag(course), dr = $('#diag-result');
  if (d && dr) {
    const m = c.modules.find((x) => x.n === d.suggest);
    dr.replaceChildren(`Your diagnostic (${pct(d.score)}) suggests starting at module ${d.suggest}${m ? `, ${m.title}` : ''}. `, m?.lessons[0] ? h('a', { href: `${root}${c.lessons.find((l) => l.slug === m.lessons[0]).href}` }, 'Go to its first lesson') : '');
  }
}
P.onChange(paint);
paint();
