// common.js — pieces every course page shares: the collapsible course outline with progress marks, the course
// meter, the notes drawer and the bookmark button.
import { $, $$, h, debounce } from '../core/dom.js?v=14';
import * as P from './progress.js?v=14';
import { MAP } from '../data/study/map.js?v=14';

const WIDE = matchMedia('(min-width: 961px)');
const html = document.documentElement;

// ---------------------------------------------------------------- outline: open and close
export function initOutline() {
  const btn = $('.outline-toggle');
  if (!btn) return;
  const sync = () => btn.setAttribute('aria-expanded', String(WIDE.matches ? !html.classList.contains('outline-closed') : html.classList.contains('outline-open')));
  btn.addEventListener('click', () => {
    if (WIDE.matches) {
      const closed = html.classList.toggle('outline-closed');
      try { localStorage.setItem('si:outline', closed ? 'closed' : 'open'); } catch { /* the choice just isn't remembered */ }
    } else {
      html.classList.toggle('outline-open');
    }
    sync();
  });
  WIDE.addEventListener('change', sync);
  sync();
  // keep the current page's entry in view inside the scrolling outline
  const cur = $('.outline a[aria-current="page"]');
  const canvas = $('#course-canvas');
  if (cur && canvas && WIDE.matches && !html.classList.contains('outline-closed')) {
    const top = cur.getBoundingClientRect().top - canvas.getBoundingClientRect().top;
    if (top > canvas.clientHeight * 0.6) canvas.scrollTop = top - canvas.clientHeight * 0.3;
  }
}

/** Highlight the lesson part being read in the outline's list of parts. */
export function initPartSpy() {
  const links = $$('.o-parts a');
  if (!links.length || !('IntersectionObserver' in window)) return;
  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const visible = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)));
    const first = [...byId.keys()].find((id) => visible.has(id));
    if (first) links.forEach((a) => a.classList.toggle('is-here', a === byId.get(first)));
  }, { rootMargin: '-20% 0px -60% 0px' });
  byId.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
}

// ---------------------------------------------------------------- progress marks
const STATE_WORD = { new: '', started: 'started', done: 'complete', mastered: 'complete and mastered' };
export function paintOutline(course) {
  const c = MAP[course];
  if (!c) return;
  $$('.o-item[data-lesson]').forEach((li) => {
    const [, slug] = li.dataset.lesson.split('/');
    const st = P.lessonStatus(course, slug);
    li.classList.remove('is-started', 'is-done', 'is-mastered');
    if (st.state !== 'new') li.classList.add(`is-${st.state}`);
    const s = li.querySelector('.o-status'); if (s) s.textContent = STATE_WORD[st.state] ? ` (${STATE_WORD[st.state]})` : '';
  });
  $$('.o-item[data-test]').forEach((li) => {
    const [, slug] = li.dataset.test.split('/');
    const rec = slug === 'project' ? null : P.testRecord(course, slug);
    const proj = slug === 'project' ? P.projectRecord(course) : null;
    const passed = proj ? !!proj.completed : !!rec?.passed;
    const tried = proj ? Object.keys(proj.stages).length > 0 : !!rec?.n;
    li.classList.remove('is-started', 'is-done');
    if (passed) li.classList.add('is-done'); else if (tried) li.classList.add('is-started');
    const s = li.querySelector('.o-status');
    if (s) s.textContent = passed ? (proj ? ' (finished)' : slug === 'diagnostic' ? ' (taken)' : ' (passed)') : tried ? (proj ? ' (started)' : ` (best ${Math.round((rec.best || 0) * 100)}%)`) : '';
  });
  const cs = P.courseStatus(course);
  $$(`.course-meter[data-course="${course}"]`).forEach((m) => {
    m.querySelector('.cm-bar > span')?.style.setProperty('--done', `${(cs.done / cs.total) * 100}%`);
    const t = m.querySelector('.cm-text');
    if (t) t.textContent = cs.started ? `${cs.done} of ${cs.total} lessons complete${cs.mastered ? ` · ${cs.mastered} mastered` : ''}` : `${cs.total} lessons`;
  });
}

// ---------------------------------------------------------------- notes and bookmarks
/** `k` is the lesson key; `meta` = { title, href, course } is stored with the note or bookmark for the Notebook. */
export function initNoteTools(k, meta) {
  const bm = $('#bookmark-btn');
  if (bm) {
    const paint = () => { const on = P.bookmarked(k); bm.setAttribute('aria-pressed', String(on)); bm.querySelector('span').textContent = on ? 'Bookmarked' : 'Bookmark'; };
    bm.addEventListener('click', () => { P.toggleBookmark(k, meta); paint(); });
    paint();
  }
  const btn = $('#notes-btn'), panel = $('#notes-panel');
  if (!btn || !panel) return;
  const ta = $('#notes-text'), status = $('#notes-status');
  ta.value = P.note(k);
  const label = () => { btn.querySelector('span').textContent = P.note(k) ? 'Notes ✓' : 'Notes'; };
  label();
  const open = (on) => {
    panel.hidden = !on; btn.setAttribute('aria-expanded', String(on));
    if (on) ta.focus(); else btn.focus();
  };
  btn.addEventListener('click', () => open(panel.hidden));
  panel.querySelector('.notes-close').addEventListener('click', () => open(false));
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); open(false); } });
  const saveNow = debounce(() => {
    const ok = P.setNote(k, ta.value, meta);
    status.textContent = ok ? (ta.value.trim() ? 'Saved in this browser.' : 'Empty: nothing saved.') : 'This browser is blocking storage, so notes can’t be saved here. Copy them somewhere safe.';
    label();
  }, 400);
  ta.addEventListener('input', () => { status.textContent = 'Saving…'; saveNow(); });
}

/** "Lesson 3 · Title" style labels and site-relative links for things the store refers to by key. */
export function describe(key) {
  const [course, slug] = key.split('/');
  const c = MAP[course];
  const l = c?.lessons.find((x) => x.slug === slug);
  if (!c || !l) return { course, code: course.toUpperCase(), title: slug, href: null };
  return { course, code: c.code, title: l.title, href: l.href, n: l.n, module: l.module, courseTitle: c.title };
}
export const pct = (v) => `${Math.round((v || 0) * 100)}%`;
export const rel = (root, href) => `${root}${href}`;
export function storageWarning(container) {
  if (P.canSave()) return;
  container.prepend(h('p', { class: 'verdict is-warn' }, h('strong', {}, 'Progress isn’t being saved.'), ' This browser is blocking storage for the site (a private window does this), so your answers will be forgotten when you leave.'));
}

/** Maths and tables that scroll sideways must be reachable by keyboard: give the overflowing ones a tab stop and a name. */
export function scrollersFocusable(scope = document) {
  const run = () => scope.querySelectorAll('.math-block, .table-scroll, .pm-scroll').forEach((el) => {
    const over = el.scrollWidth > el.clientWidth;   // even 1px: axe (and keyboard users) treat any scrollable box as needing focus
    if (over && !el.hasAttribute('tabindex')) { el.tabIndex = 0; el.setAttribute('role', 'region'); if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', el.classList.contains('math-block') ? 'Equation, scrolls sideways' : 'Table, scrolls sideways'); el.dataset.madeFocusable = '1'; }
    else if (!over && el.dataset.madeFocusable) { el.removeAttribute('tabindex'); el.removeAttribute('role'); el.removeAttribute('aria-label'); delete el.dataset.madeFocusable; }
  });
  run();
  // re-check when the layout can change: resizes, late-loading fonts (KaTeX), and content the page builds later (labs)
  let t; const later = () => { clearTimeout(t); t = setTimeout(run, 200); };
  addEventListener('resize', later);
  addEventListener('load', later);
  document.fonts?.ready.then(later);
  if ('MutationObserver' in window) new MutationObserver(later).observe(scope === document ? document.body : scope, { childList: true, subtree: true });
  return run;
}
