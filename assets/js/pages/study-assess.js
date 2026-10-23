// study-assess.js — module tests, the diagnostic and the final assessment. Questions come from
// data/study/<course>/<file>.js (`items`, each tagged with the lesson it tests; the diagnostic also exports `route`).
import { initSite } from '../core/site.js?v=11';
import { $, h } from '../core/dom.js?v=11';
import * as P from '../study/progress.js?v=11';
import { renderQuiz } from '../study/exercises.js?v=11';
import { initOutline, paintOutline, pct, storageWarning, scrollersFocusable } from '../study/common.js?v=11';
import { MAP } from '../data/study/map.js?v=11';

initSite();
initOutline();
const { course, kind, file, slug, root } = document.body.dataset;
const c = MAP[course];
const lessonOf = Object.fromEntries(c.lessons.map((l) => [l.slug, l]));
P.visit(course, null, location.pathname.replace(/^.*?(learn\/)/, '$1'), document.querySelector('.lesson-title')?.textContent.trim());
paintOutline(course);

function record() {
  const t = P.testRecord(course, slug), el = $('#assess-record');
  if (!t) { el.textContent = ''; return; }
  el.replaceChildren(h('strong', {}, kind === 'diagnostic' ? `Last result ${pct(t.last)}.` : t.passed ? `Passed. Best score ${pct(t.best)}.` : `Not passed yet. Best score ${pct(t.best)}.`), ` ${t.n} attempt${t.n === 1 ? '' : 's'}.`);
}
record();

let mod;
try { mod = await import(`../data/study/${course}/${file}.js?v=11`); } catch (e) { console.error(e); }
const root$ = $('#assess-root');
if (!mod?.items?.length) {
  root$.replaceChildren(h('p', { class: 'note' }, 'The questions didn’t load. Reload the page to try again.'));
} else {
  storageWarning(root$.parentElement);
  const counts = kind !== 'diagnostic';
  renderQuiz(root$, mod.items, {
    kind: kind === 'diagnostic' ? 'diagnostic' : 'test', label: 'Question',
    submitLabel: kind === 'diagnostic' ? 'See my result' : 'Submit the test',
    onSubmit(results) {
      results.forEach((r) => { if (r.counted) P.answer(r.item.id, r.item.lesson ? `${course}/${r.item.lesson}` : null, r.correct, counts ? 'test' : 'diagnostic'); });
      const counted = results.filter((r) => r.counted);
      const score = counted.length ? counted.reduce((a, r) => a + r.score, 0) / counted.length : 0;
      // breakdown: by lesson for a module test, by module otherwise
      const groups = new Map();
      counted.forEach((r) => {
        const l = lessonOf[r.item.lesson];
        const key = kind === 'module' ? (l ? `${l.n}. ${l.title}` : 'Other') : (l ? `Module ${l.module}` : 'Other');
        const g = groups.get(key) || { n: 0, s: 0, module: l?.module }; g.n++; g.s += r.score; groups.set(key, g);
      });
      const breakdown = [...groups.entries()].map(([k, g]) => [k, `${Math.round((g.s / g.n) * 100)}%`]);
      if (kind === 'diagnostic') {
        P.testScore(course, slug, score, { counts: false });
        // route: start at the latest module whose earlier modules were answered well enough
        const byModule = {}; groups.forEach((g) => { if (g.module) byModule[g.module] = g.s / g.n; });
        let suggest = 1;
        (mod.route || []).forEach((r) => {
          const before = counted.filter((x) => (lessonOf[x.item.lesson]?.module || 99) < r.module);
          const s = before.length ? before.reduce((a, x) => a + x.score, 0) / before.length : 0;
          if (before.length && s >= r.ifAtLeast) suggest = Math.max(suggest, r.module);
        });
        P.setDiag(course, { score, suggest, byModule });
        const m = c.modules.find((x) => x.n === suggest);
        const first = m && c.lessons.find((l) => l.slug === m.lessons[0]);
        record();
        return {
          title: `Start at module ${suggest}${m ? `: ${m.title}` : ''}`,
          text: [suggest > 1 ? `You answered the earlier modules’ questions well enough to skip ahead. You can still go back to any lesson, and the module tests will tell you if anything is missing.` : 'Start from the beginning: the first module builds what everything else uses. Lessons you already know will go quickly.', 'The diagnostic doesn’t count toward mastery or completion.'],
          pass: null, breakdown,
          actions: first ? [h('a', { class: 'btn btn-secondary btn-sm', href: `${root}${first.href}` }, `Go to lesson ${first.n}`)] : [],
        };
      }
      const t = P.testScore(course, slug, score);
      const passed = score >= P.PASS_AT;
      paintOutline(course); record();
      const seq = c.sequence, i = seq.findIndex((x) => x.slug === slug), nx = i >= 0 ? seq[i + 1] : null;
      const weak = breakdown.filter(([, v]) => parseInt(v, 10) < 70).map(([k]) => k);
      return {
        title: passed ? `Passed: ${pct(score)}` : `Not passed yet: ${pct(score)}`,
        text: [
          `${counted.filter((r) => r.correct).length} of ${counted.length} right. 70% passes; your best score counts (best so far ${pct(t.best)}).`,
          weak.length ? `Worth another look: ${weak.join('; ')}. Each question’s feedback says what it tests.` : 'No weak area: every part scored 70% or more.',
        ],
        pass: passed, breakdown,
        actions: passed && nx ? [h('a', { class: 'btn btn-secondary btn-sm', href: `${root}${nx.href}` }, `Next: ${nx.title}`)] : [],
      };
    },
  });
}

// tables wider than the screen scroll sideways; make them keyboard-reachable (re-checked as the page builds)
scrollersFocusable();
