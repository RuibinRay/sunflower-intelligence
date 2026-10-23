// learn-lessons.js — the lesson library: what you've read, your mastery of each skill, and what to read next.
import { initSite } from '../core/site.js?v=7';
import { $, $$ } from '../core/dom.js?v=7';
import * as F from '../core/format.js?v=7';
import * as L from '../core/learn.js?v=7';
import { LESSON_META } from '../data/lessons/meta.js?v=7';
import { loadState, nextLesson } from './learn-common.js?v=7';

initSite();

function render() {
  const state = loadState();
  const answered = (id) => state.skills[id] && state.skills[id].nCorrect + state.skills[id].nWrong > 0;
  let read = 0, mastered = 0;
  LESSON_META.forEach((m) => {
    const st = state.skills[m.id], el = $(`[data-status="${m.id}"]`), card = $(`.plate-card[data-lesson="${m.id}"]`);
    if (!el) return;
    const isRead = !!state.read[m.id], isMastered = st && st.L >= L.BKT.mastered;
    if (isRead) read++; if (isMastered) mastered++;
    el.textContent = isMastered ? 'mastered' : isRead ? (answered(m.id) ? `read · ${F.pct(st.L, 0)} mastered` : 'read') : answered(m.id) ? `not read yet · ${F.pct(st.L, 0)} mastered` : 'not read yet';
    card.classList.toggle('is-read', isRead);
    card.classList.toggle('is-mastered', !!isMastered);
  });
  const nx = nextLesson(state, LESSON_META);
  const started = read > 0 || state.placed;
  $('#next-kicker').textContent = started ? 'Next for you' : 'Start here';
  $('#next-link').textContent = `Plate ${nx.plate}: ${nx.title}`;
  $('#next-link').href = `${nx.id}/`;
  $('#next-why').textContent = !started ? 'The lessons build on each other within a room, so the first plate is a good place to begin. Or take the short check on the Learn page first, and this will point you to your weakest skill.'
    : read === LESSON_META.length ? `You’ve read every lesson. ${nx.title} is your least-mastered skill (${F.pct(state.skills[nx.id].L, 0)}), so it’s the one to revisit.`
      : `Chosen because it covers your least-mastered skill among the lessons you haven’t read (${F.pct(state.skills[nx.id].L, 0)} mastered). About ${nx.minutes} minutes.`;
  $('#lessons-progress').textContent = `${read} of ${LESSON_META.length} read · ${mastered} skill${mastered === 1 ? '' : 's'} mastered · kept in this browser`;
}
render();
addEventListener('storage', (e) => { if (e.key === 'si:learn') render(); });
addEventListener('pageshow', (e) => { if (e.persisted) render(); });
