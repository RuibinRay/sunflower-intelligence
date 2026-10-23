// study-lesson.js — a course lesson page: progress marks in the outline, notes and bookmarks, the interactives,
// guided practice, practice on your own, the knowledge check, and the lesson's completion and mastery status.
import { initSite } from '../core/site.js?v=7';
import { $, h } from '../core/dom.js?v=7';
import * as P from '../study/progress.js?v=7';
import { renderPractice, renderQuiz } from '../study/exercises.js?v=7';
import { mountWidgets } from '../study/widgets.js?v=7';
import { initOutline, initPartSpy, paintOutline, initNoteTools, pct, storageWarning, scrollersFocusable } from '../study/common.js?v=7';
import { MAP } from '../data/study/map.js?v=7';

initSite();
const refocus = scrollersFocusable();
const { course, lesson: slug } = document.body.dataset;
const lk = `${course}/${slug}`;
const meta = P.lessonMeta(course, slug);
const title = $('.lesson-title')?.textContent.trim() || slug;
const href = meta?.href || '';
P.visit(course, slug, href, title);
initOutline();
initPartSpy();
initNoteTools(lk, { title, href, course, code: MAP[course]?.code });

// ---------------------------------------------------------------- status: the lesson line, completion card, mastery
function paint() {
  const st = P.lessonStatus(course, slug);
  const line = $('#lesson-status');
  line.className = `lm-status${st.state !== 'new' ? ` is-${st.state}` : ''}`;
  line.textContent = { new: '', started: 'In progress', done: 'Complete', mastered: 'Complete and mastered' }[st.state];
  const g = $('#complete-card li[data-req="guided"]'), k = $('#complete-card li[data-req="check"]');
  if (g) {
    g.classList.toggle('is-done', st.guidedDone === st.guidedTotal && st.guidedTotal > 0);
    g.classList.toggle('is-part', st.guidedDone > 0 && st.guidedDone < st.guidedTotal);
    g.querySelector('.req-state').textContent = st.guidedDone === st.guidedTotal ? '(done)' : st.guidedDone ? `(${st.guidedDone} of ${st.guidedTotal} worked)` : '(not started)';
  }
  if (k) {
    const ok = (st.checkBest ?? 0) >= P.COMPLETE_AT;
    k.classList.toggle('is-done', ok);
    k.querySelector('.req-state').textContent = st.checkBest == null ? '(not taken)' : ok ? `(best ${pct(st.checkBest)}: done)` : `(best so far ${pct(st.checkBest)})`;
  }
  const ml = $('#mastery-line');
  if (ml && st.evidence) {
    ml.replaceChildren(
      h('strong', {}, `Mastery ${pct(st.mastery)}`),
      h('span', { class: 'ml-bar', 'aria-hidden': 'true' }, h('i', { style: { width: pct(st.mastery) } })),
      ` from ${st.evidence} answer${st.evidence === 1 ? '' : 's'} that count. `,
      st.mastered ? 'Mastered (95% or more). ' : 'Mastered at 95%. ',
      st.recall != null ? `Predicted recall now ${pct(st.recall)}; this lesson comes back for review when it falls to 50%.` : '');
  }
  paintOutline(course);
}
P.onChange(paint);
paint();
storageWarning($('#complete-card'));

// ---------------------------------------------------------------- the exercise file: widgets and practice
let X;
try {
  X = await import(`../data/study/${course}/${slug}.ex.js?v=7`);
} catch (e) {
  console.error(e);
  document.querySelectorAll('.ex-set, .widget').forEach((el) => el.replaceChildren(h('p', { class: 'note' }, 'The questions for this lesson didn’t load. Reload the page to try again.')));
}
if (X) {
  mountWidgets($('.study-lesson'), X.widgets || {}, { report: () => {} });

  const prior = (item) => {
    const rec = P.itemRecord(item.id);
    const worked = P.raw().lessons[lk]?.guided?.[item.id];
    if (worked) return { text: 'Worked before', cls: '' };
    if (rec) return { text: rec.first ? 'Right first time before' : 'Answered before', cls: '' };
    return null;
  };
  renderPractice($('#set-guided'), X.guided || [], {
    mode: 'guided', label: 'Problem', prior,
    onAnswer: (item, correct, { first, step }) => { if (!step && first) P.answer(item.id, lk, correct, 'guided'); },
    onWorked: (item) => P.guidedWorked(lk, item.id),
  });
  renderPractice($('#set-independent'), X.independent || [], {
    mode: 'independent', label: 'Question', prior,
    // only first answers are recorded: retries on the same page aren't evidence of remembering
    onAnswer: (item, correct, { first, step, rollup }) => {
      if (step) return;
      if (item.type === 'steps' && !rollup) return;
      if (first) P.answer(item.id, lk, correct, 'independent');
    },
    onReveal: (item) => P.revealedFirst(item.id, lk),
  });
  renderQuiz($('#set-check'), X.check || [], {
    kind: 'check', label: 'Question', submitLabel: 'Submit the check',
    onSubmit(results) {
      results.forEach((r) => { if (r.counted) P.answer(r.item.id, lk, r.correct, 'check'); });
      const counted = results.filter((r) => r.counted);
      const score = counted.length ? counted.reduce((a, r) => a + r.score, 0) / counted.length : 0;
      const rec = P.checkScore(lk, score);
      const st = P.lessonStatus(course, slug);
      const passed = score >= P.COMPLETE_AT;
      const text = [];
      text.push(`${counted.filter((r) => r.correct).length} of ${counted.length} right${counted.some((r) => r.score > 0 && r.score < 1) ? ', with part marks for partly right answers' : ''}. Best score: ${pct(rec.best)} (${rec.n} attempt${rec.n === 1 ? '' : 's'}).`);
      if (st.complete) text.push('<strong>Lesson complete.</strong> It will come back for review before you are likely to forget it.');
      else if (passed) text.push(`To complete the lesson, also work the guided problems (${st.guidedDone} of ${st.guidedTotal} done).`);
      else text.push(`You need 80% to complete the lesson. Read the feedback on the questions you missed, look back at the part of the lesson they test, and take the check again.`);
      const next = MAP[course]?.sequence;
      const i = next ? next.findIndex((x) => x.slug === slug) : -1;
      const nx = i >= 0 ? next[i + 1] : null;
      return {
        title: passed ? `Passed: ${pct(score)}` : `Not yet: ${pct(score)}`,
        text, pass: passed,
        actions: st.complete && nx ? [h('a', { class: 'btn btn-secondary btn-sm', href: `${document.body.dataset.root}${nx.href}` }, `Next: ${nx.title}`)] : [],
      };
    },
  });
}

setTimeout(refocus, 600);

// a link to a formula card, e.g. from the formula library, highlights it
if (location.hash.startsWith('#f-')) document.getElementById(location.hash.slice(1))?.classList.add('is-target');
