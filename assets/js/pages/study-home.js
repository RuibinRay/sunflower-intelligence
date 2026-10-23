// study-home.js — the Learn home: search across lessons, terms, formulas and the catalogue; where you left off;
// progress in each course; the learning-path tabs (with a recommendation from the skills check, if taken).
import { initSite } from '../core/site.js?v=11';
import { $, $$, h, debounce } from '../core/dom.js?v=11';
import * as P from '../study/progress.js?v=11';
import { pct } from '../study/common.js?v=11';
import { MAP } from '../data/study/map.js?v=11';

initSite();
const root = document.body.dataset.root;

// ---------------------------------------------------------------- search
const input = $('#search-input'), list = $('#search-results'), count = $('#search-count');
let index = null;
async function loadIndex() {
  if (index) return index;
  try { index = await (await fetch(`${root}assets/data/study/search.json?v=11`)).json(); } catch { index = []; }
  index.forEach((e) => { e._t = e.t.toLowerCase(); e._s = `${e.s} ${e.x}`.toLowerCase(); });
  return index;
}
const KIND_RANK = { Lesson: 0, Course: 1, Term: 2, Formula: 3, Lab: 4, Plate: 5, 'Planned course': 6 };
function highlight(text, words) {
  const out = h('span');
  if (!words.length) { out.textContent = text; return out; }
  const re = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  text.split(re).forEach((part, i) => out.append(i % 2 ? h('mark', {}, part) : part));
  return out;
}
async function search() {
  const q = input.value.trim().toLowerCase();
  if (q.length < 2) { list.hidden = true; list.replaceChildren(); count.textContent = ''; return; }
  const idx = await loadIndex();
  const words = q.split(/\s+/).filter((w) => w.length > 1);
  const scored = [];
  for (const e of idx) {
    let sc = 0, all = true;
    for (const w of words) {
      const inT = e._t.indexOf(w), inS = e._s.indexOf(w);
      if (inT < 0 && inS < 0) { all = false; break; }
      sc += inT === 0 ? 6 : inT > 0 ? (/\W/.test(e._t[inT - 1]) ? 4 : 2) : 1;
    }
    if (all) { if (e._t === q) sc += 10; scored.push([sc - (KIND_RANK[e.k] ?? 7) * 0.3, e]); }
  }
  scored.sort((a, b) => b[0] - a[0]);
  const top = scored.slice(0, 14);
  count.textContent = scored.length ? `${scored.length} result${scored.length === 1 ? '' : 's'}` : 'No results';
  list.replaceChildren(...(top.length ? top.map(([, e]) => h('li', {}, h('a', { href: `${root}${e.h}` },
    h('span', { class: 'sr-kind' }, e.k), h('span', { class: 'sr-title' }, highlight(e.t, words)), h('span', { class: 'sr-sub' }, highlight(e.s, words)))))
    : [h('li', { class: 'search-empty' }, 'Nothing matches. Try a shorter or different word; the glossary and formula library are searchable too.')]));
  list.hidden = false;
}
if (input) {
  input.addEventListener('input', debounce(search, 120));
  input.addEventListener('focus', loadIndex, { once: true });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { const a = list.querySelector('a'); if (a) { e.preventDefault(); a.focus(); } }
    if (e.key === 'Escape') { input.value = ''; search(); }
  });
  list.addEventListener('keydown', (e) => {
    const links = $$('a', list), i = links.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' && i >= 0) { e.preventDefault(); links[Math.min(links.length - 1, i + 1)].focus(); }
    if (e.key === 'ArrowUp' && i >= 0) { e.preventDefault(); (i === 0 ? input : links[i - 1]).focus(); }
    if (e.key === 'Escape') { input.focus(); input.value = ''; search(); }
  });
  const qs = new URLSearchParams(location.search).get('q');
  if (qs) { input.value = qs; search(); }
}

// ---------------------------------------------------------------- continue and progress
function paintProgress() {
  const last = P.raw().last;
  const started = Object.keys(MAP).filter((id) => P.courseStatus(id)?.started);
  if (last && MAP[last.course]) {
    $('#continue-h').textContent = 'Pick up where you left off';
    const c = MAP[last.course];
    const next = P.nextStep(last.course);
    const lastLesson = last.slug ? c.lessons.find((l) => l.slug === last.slug) : null;
    const lastDone = lastLesson ? P.lessonStatus(last.course, last.slug).complete : true;
    const target = !lastDone && lastLesson ? { title: lastLesson.title, href: lastLesson.href, label: `${c.code} · lesson ${lastLesson.n}`, why: 'You were last here and haven’t completed it yet.' }
      : next ? { title: next.title, href: next.href, label: `${c.code} · next up`, why: 'The next step you haven’t finished in this course.' } : null;
    $('#continue-box').replaceChildren(target
      ? h('div', { class: 'continue-card' },
        h('div', {}, h('p', { class: 'cc-kick' }, target.label), h('h3', {}, target.title), h('p', {}, target.why)),
        h('a', { class: 'btn btn-primary', href: `${root}${target.href}` }, 'Continue'))
      : h('p', {}, `You have finished ${c.code}. Lessons come back in `, h('a', { href: 'review/' }, 'Review'), ' when they’re due.'));
  }
  const due = P.dueLessons();
  const board = $('#progress-board');
  board.replaceChildren(...started.map((id) => {
    const c = MAP[id], cs = P.courseStatus(id);
    return h('div', { class: 'pb-course' },
      h('a', { href: `${root}${c.href}` }, `${c.code} ${c.title}`),
      h('div', { class: 'cp-bar', 'aria-hidden': 'true' }, h('i', { style: { width: `${(cs.done / cs.total) * 100}%` } })),
      h('p', { class: 'pb-line' }, h('span', {}, `${cs.done} of ${cs.total} lessons complete`), h('span', {}, `mastery ${pct(cs.masteryAvg)}`)));
  }), ...(due.length ? [h('p', { class: 'pb-review' }, h('strong', {}, `${due.length} lesson${due.length === 1 ? ' is' : 's are'} due for review. `), h('a', { href: 'review/' }, 'Review now'), ' (a few minutes).')] : []));
  const tk = $('.tk-review');
  if (tk && due.length) { tk.textContent = `${due.length} lesson${due.length === 1 ? '' : 's'} due for review now.`; tk.classList.add('is-due'); }
  $$('.path-list li[data-course]').forEach((li) => {
    const cs = MAP[li.dataset.course] ? P.courseStatus(li.dataset.course) : null;
    li.classList.toggle('is-done', !!cs?.complete);
    const st = li.querySelector('.pl-status');
    if (st && cs) st.textContent = cs.complete ? 'Complete' : cs.started ? `${cs.done} of ${cs.total} lessons` : '';
  });
}
P.onChange(paintProgress);
paintProgress();

// ---------------------------------------------------------------- learning-path tabs
const tabs = $$('.path-tab');
function select(tab, focus = true) {
  tabs.forEach((t) => { const on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; document.getElementById(t.getAttribute('aria-controls')).hidden = !on; });
  if (focus) tab.focus();
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => select(t, false));
  t.addEventListener('keydown', (e) => {
    const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length]); }
    if (e.key === 'Home') { e.preventDefault(); select(tabs[0]); }
    if (e.key === 'End') { e.preventDefault(); select(tabs[tabs.length - 1]); }
  });
});
// a recommendation from the skills check's ability estimate, if the placement has been taken
try {
  const learn = JSON.parse(localStorage.getItem('si:learn') || 'null');
  if (learn?.placement?.length >= 6 && Number.isFinite(learn.theta)) {
    const id = learn.theta < -0.4 ? 'beginner' : learn.theta < 0.8 ? 'intermediate' : 'advanced';
    const tab = tabs.find((t) => t.id === `path-tab-${id}`);
    if (tab) {
      select(tab, false);
      $('#path-rec').textContent = `Your skills check suggests the ${tab.textContent} path. It’s a starting point, not a rule: each course lists what it requires.`;
    }
  }
} catch { /* no skills check taken */ }
