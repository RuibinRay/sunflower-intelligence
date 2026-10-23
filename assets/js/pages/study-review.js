// study-review.js — spaced review. Due lessons (predicted recall ≤ 50%) are reviewed with a few of their own
// questions; missed questions come back until answered right; flashcards cover the terms and formulas of the
// lessons you've opened. Review answers update mastery and reset the forgetting curve.
import { initSite } from '../core/site.js?v=7';
import { $, h } from '../core/dom.js?v=7';
import * as P from '../study/progress.js?v=7';
import { practiceCard, loadCharts } from '../study/exercises.js?v=7';
import { describe, pct, scrollersFocusable } from '../study/common.js?v=7';
import { MAP, FLASH } from '../data/study/map.js?v=7';

initSite();
scrollersFocusable();
const root = document.body.dataset.root;
const DAY = 86400000;
const when = (t) => { const d = Math.round((t - Date.now()) / DAY); return d <= 0 ? 'later today' : d === 1 ? 'tomorrow' : `in ${d} days`; };

// ---------------------------------------------------------------- finding questions
const cache = new Map();
async function lessonItems(key) {
  if (cache.has(key)) return cache.get(key);
  const [course, slug] = key.split('/');
  let items = [];
  try { const X = await import(`../data/study/${course}/${slug}.ex.js?v=7`); items = [...(X.independent || []), ...(X.check || [])]; } catch { /* lesson file missing */ }
  cache.set(key, items);
  return items;
}
async function findItem(id, lessonKey) {
  const own = (await lessonItems(lessonKey)).find((x) => x.id === id);
  if (own) return own;
  const [course] = (lessonKey || '').split('/');
  const c = MAP[course];
  if (!c) return null;
  for (const f of [...c.modules.map((m) => `assess-m${m.n}`), 'assess-final']) {
    try { const m = await import(`../data/study/${course}/${f}.js?v=7`); const it = (m.items || []).find((x) => x.id === id); if (it) return it; } catch { /* no such file */ }
  }
  return null;
}

/** Run a review session in `box`: one question at a time, then a summary. */
async function session(box, entries, { title, onEnd }) {
  const items = entries.filter((e) => e.item);
  if (!items.length) { box.replaceChildren(h('p', { class: 'review-empty' }, 'Those questions are no longer in the course.')); return; }
  const charts = await loadCharts(items.map((e) => e.item));
  let i = 0, right = 0;
  const run = h('div', { class: 'review-run' });
  box.replaceChildren(run);
  const step = () => {
    if (i >= items.length) {
      run.replaceChildren(h('div', { class: 'verdict is-good' }, h('p', {}, h('strong', {}, `${right} of ${items.length} right.`), ' Your answers have updated mastery and when each lesson comes back.')), h('div', { class: 'ex-actions' }, h('button', { type: 'button', class: 'btn btn-secondary btn-sm', onclick: onEnd }, 'Back to the list')));
      run.querySelector('.verdict').focus?.();
      return;
    }
    const { item, lesson } = items[i];
    const info = describe(lesson || '');
    const next = h('button', { type: 'button', class: 'btn btn-primary btn-sm', hidden: true }, i + 1 < items.length ? 'Next question' : 'Finish');
    const card = practiceCard(item, {
      mode: 'review', label: `${title} · ${i + 1} of ${items.length}`, charts,
      onAnswer: (it, correct, { step: isStep, rollup }) => {
        if (isStep || (it.type === 'steps' && !rollup)) return;
        P.answer(it.id, lesson, correct, 'review');
        if (correct) right++;
        next.hidden = false; next.focus();
      },
    });
    run.replaceChildren(h('div', { class: 'review-head' }, h('p', { class: 'small muted' }, info.href ? ['From ', h('a', { href: `${root}${info.href}` }, `${info.code} · ${info.title}`)] : '')), card, h('div', { class: 'ex-actions' }, next));
    next.addEventListener('click', () => { i++; step(); run.scrollIntoView({ block: 'start' }); });
    card.querySelector('input, select, textarea, button')?.focus({ preventScroll: true });
  };
  step();
}

// ---------------------------------------------------------------- due lessons
function paintDue() {
  const box = $('#due-root');
  const due = P.dueLessons();
  if (!due.length) {
    const nd = P.nextDue();
    box.replaceChildren(h('p', { class: 'review-empty' }, Object.keys(P.raw().skills).length
      ? ['Nothing is due. ', nd ? `The next lesson to come back is ${describe(nd.key).title}, ${when(nd.at)}.` : '']
      : ['Nothing yet. Lessons appear here once you have answered their questions on your own or taken their knowledge check, and come back when you are likely to be forgetting them.']));
    return;
  }
  box.replaceChildren(h('ul', { class: 'due-list', role: 'list' }, due.map((d) => {
    const info = describe(d.key);
    const btn = h('button', { type: 'button', class: 'btn btn-primary btn-sm' }, 'Review');
    btn.addEventListener('click', async () => {
      const pool = await lessonItems(d.key);
      const seen = (it) => P.itemRecord(it.id);
      const pick = pool.filter((x) => x.type !== 'short').sort((a, b) => ((seen(a)?.last ? 1 : 0) - (seen(b)?.last ? 1 : 0)) || ((seen(a)?.t || 0) - (seen(b)?.t || 0))).slice(0, 4);
      session(box, pick.map((item) => ({ item, lesson: d.key })), { title: 'Review', onEnd: paintDue });
    });
    return h('li', { class: 'due-item' },
      h('div', {}, h('h3', {}, info.href ? h('a', { href: `${root}${info.href}` }, info.title) : info.title), h('p', {}, `${info.code} · predicted recall ${pct(d.recall)}`)),
      btn,
      h('div', { class: 'recall-bar', 'aria-hidden': 'true' }, h('i', { style: { width: pct(d.recall) } })));
  })));
}

// ---------------------------------------------------------------- missed questions
async function paintMissed() {
  const box = $('#missed-root');
  const list = P.missed();
  if (!list.length) { box.replaceChildren(h('p', { class: 'review-empty' }, 'None. Questions you get wrong on your own, in a knowledge check or in a test are collected here until you answer them right.')); return; }
  const byLesson = new Map();
  list.forEach((m) => { const k = m.lesson || 'other'; byLesson.set(k, [...(byLesson.get(k) || []), m]); });
  const start = h('button', { type: 'button', class: 'btn btn-primary btn-sm' }, `Retry ${Math.min(10, list.length)} question${list.length === 1 ? '' : 's'}`);
  start.addEventListener('click', async () => {
    start.disabled = true;
    const entries = [];
    for (const m of list.slice(0, 10)) entries.push({ item: await findItem(m.id, m.lesson), lesson: m.lesson });
    session(box, entries, { title: 'Missed', onEnd: paintMissed });
  });
  box.replaceChildren(
    h('ul', { class: 'nb-list', role: 'list' }, [...byLesson.entries()].map(([k, ms]) => { const info = describe(k); return h('li', { class: 'nb-item' }, info.href ? h('a', { href: `${root}${info.href}` }, `${info.code} · ${info.title}`) : h('span', {}, k), h('span', { class: 'nb-sub' }, `${ms.length} question${ms.length === 1 ? '' : 's'} to retry`)); })),
    h('div', { class: 'ex-actions', style: { marginTop: '16px' } }, start));
}

// ---------------------------------------------------------------- flashcards
function paintCards() {
  const box = $('#cards-root');
  const opened = new Set(Object.entries(P.raw().lessons).filter(([, r]) => r.opened).map(([k]) => k));
  const courses = [...new Set(FLASH.map((f) => f.course))];
  const sel = h('select', { class: 'select', id: 'fc-course' }, h('option', { value: '' }, 'All courses'), courses.map((c) => h('option', { value: c }, `${MAP[c]?.code || c} ${MAP[c]?.title || ''}`)));
  const scope = h('select', { class: 'select', id: 'fc-scope' }, h('option', { value: 'studied' }, 'Lessons I’ve opened'), h('option', { value: 'all' }, 'Every lesson'));
  const kind = h('select', { class: 'select', id: 'fc-kind' }, h('option', { value: '' }, 'Terms and formulas'), h('option', { value: 'term' }, 'Terms only'), h('option', { value: 'formula' }, 'Formulas only'));
  const stage = h('div');
  const field = (label, el) => h('div', { class: 'field' }, h('label', { for: el.id }, label), el);
  box.replaceChildren(h('div', { class: 'flash-controls' }, field('Course', sel), field('Cards from', scope), field('Kind', kind)), stage);
  let deck = [], i = 0, knew = 0;
  function build() {
    deck = FLASH.filter((f) => (!sel.value || f.course === sel.value) && (!kind.value || f.kind === kind.value) && (scope.value === 'all' || opened.has(`${f.course}/${f.lesson}`)));
    const due = deck.filter((f) => P.cardDue(f.id));
    deck = (due.length ? due : deck).slice().sort(() => Math.random() - 0.5).slice(0, 20);
    i = 0; knew = 0; show();
  }
  function show() {
    if (!deck.length) {
      stage.replaceChildren(h('p', { class: 'review-empty' }, scope.value === 'studied' ? 'No cards yet for the lessons you have opened. Open a lesson, or choose “Every lesson”.' : 'No cards match.'));
      return;
    }
    if (i >= deck.length) {
      stage.replaceChildren(h('div', { class: 'verdict is-good' }, h('p', {}, h('strong', {}, `${knew} of ${deck.length} known.`), ' Cards you knew come back later; the others sooner.')), h('div', { class: 'fc-actions' }, h('button', { type: 'button', class: 'btn btn-secondary btn-sm', onclick: build }, 'Another round')));
      return;
    }
    const f = deck[i];
    const back = h('div', { class: 'fc-back', hidden: true });
    if (f.kind === 'formula') {
      const m = h('div', { class: 'math-block' }); m.innerHTML = f.back; back.append(m);
      if (f.where?.length) back.append(h('ul', {}, f.where.map(([sym, text]) => { const li = h('li'); li.innerHTML = sym; li.append(`: ${text}`); return li; })));
    } else back.append(h('p', {}, f.back));
    back.append(h('p', { class: 'small' }, h('a', { href: `${root}${f.href}${f.kind === 'formula' ? `#f-${f.id.split(':').pop()}` : ''}` }, 'See it in its lesson')));
    const reveal = h('button', { type: 'button', class: 'btn btn-primary btn-sm' }, 'Show the answer');
    const yes = h('button', { type: 'button', class: 'btn btn-secondary btn-sm', hidden: true }, 'I knew it');
    const no = h('button', { type: 'button', class: 'btn btn-secondary btn-sm', hidden: true }, 'Not yet');
    reveal.addEventListener('click', () => { back.hidden = false; reveal.hidden = true; yes.hidden = false; no.hidden = false; yes.focus(); });
    const answer = (k) => { P.cardAnswer(f.id, k); if (k) knew++; i++; show(); stage.querySelector('button')?.focus(); };
    yes.addEventListener('click', () => answer(true)); no.addEventListener('click', () => answer(false));
    stage.replaceChildren(
      h('article', { class: 'flashcard', 'aria-live': 'polite' },
        h('p', { class: 'fc-meta' }, h('span', {}, f.kind === 'formula' ? 'Formula: write it and say what each symbol means' : 'Term: say what it means'), h('span', {}, `${i + 1} of ${deck.length}`)),
        h('p', { class: 'fc-front' }, f.front), back),
      h('div', { class: 'fc-actions', style: { marginTop: '12px' } }, reveal, yes, no),
      h('p', { class: 'fc-tally' }, `${MAP[f.course]?.code || ''} · from “${describe(`${f.course}/${f.lesson}`).title}”`));
  }
  [sel, scope, kind].forEach((x) => x.addEventListener('change', build));
  build();
}

paintDue();
paintMissed();
paintCards();
