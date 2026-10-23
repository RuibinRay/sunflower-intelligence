// progress.js — the learner's course progress, kept only in this browser (localStorage key "si:study").
//
// Completion and mastery are separate on purpose:
//   complete  a lesson: every guided problem attempted and a knowledge-check best score of at least 80%.
//             a course: every lesson complete, every module test passed (70%), the project finished, the final passed.
//   mastery   Bayesian knowledge tracing per lesson (core/learn.js), updated only by first attempts at questions
//             on your own, knowledge-check and test questions, and by review answers. It decays: half-life
//             regression predicts recall, and a lesson is due for review when predicted recall falls to 50%.
import * as L from '../core/learn.js?v=11';
import { MAP } from '../data/study/map.js?v=11';

const KEY = 'si:study';
const DAY = 86400000;
export const COMPLETE_AT = 0.8;
export const PASS_AT = 0.7;
const MASTERY_KINDS = new Set(['independent', 'check', 'test']);

const blank = () => ({ v: 1, lessons: {}, items: {}, skills: {}, tests: {}, projects: {}, missed: {}, cards: {}, notes: {}, bookmarks: {}, diag: {}, last: null });
function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const s = raw ? JSON.parse(raw) : null;
    return s && s.v === 1 ? { ...blank(), ...s } : blank();
  } catch { return blank(); }
}
let S = read();
let storageOK = true;
const listeners = new Set();

/** Save; false when the browser refuses storage (private mode, quota), so the page can say progress won't be kept. */
export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); storageOK = true; } catch { storageOK = false; }
  listeners.forEach((f) => { try { f(); } catch { /* a listener's error shouldn't stop the others */ } });
  return storageOK;
}
export const canSave = () => storageOK;
export const raw = () => S;
export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
addEventListener('storage', (e) => { if (e.key === KEY) { S = read(); listeners.forEach((f) => f()); } });

const now = () => Date.now();
const key = (course, slug) => `${course}/${slug}`;
const lessonRec = (k) => (S.lessons[k] ||= { opened: 0, guided: {}, check: null, completed: 0 });
export const lessonMeta = (course, slug) => MAP[course]?.lessons.find((l) => l.slug === slug) || null;

// ---------------------------------------------------------------- visiting
export function visit(course, slug, href, title) {
  if (slug && lessonMeta(course, slug)) { const r = lessonRec(key(course, slug)); r.opened ||= now(); }
  S.last = { course, slug, href, title, t: now() };
  save();
}

// ---------------------------------------------------------------- answering
/**
 * Record an answer. `kind`: guided | independent | check | test | review | diagnostic.
 * Returns { first } (whether this was the first ever answer to the item). Mastery moves on the first answer to
 * an independent, check or test item, and on every review answer; diagnostics never move it.
 */
export function answer(itemId, lessonKey, correct, kind) {
  const it = S.items[itemId];
  const first = !it;
  S.items[itemId] = { n: (it?.n || 0) + 1, first: it ? it.first : !!correct, last: !!correct, t: now(), lesson: lessonKey, kind: it?.kind || kind };
  if (lessonKey && ((first && MASTERY_KINDS.has(kind)) || kind === 'review')) {
    const sk = (S.skills[lessonKey] ||= { L: L.BKT.prior, nCorrect: 0, nWrong: 0, last: 0 });
    sk.L = L.bktUpdate(sk.L, !!correct);
    if (correct) sk.nCorrect++; else sk.nWrong++;
    sk.last = now();
  }
  if (kind !== 'guided' && kind !== 'diagnostic') {
    if (!correct) S.missed[itemId] = { lesson: lessonKey, t: now(), kind: S.missed[itemId]?.kind || kind };
    else delete S.missed[itemId];
  }
  if (lessonKey && kind === 'guided') lessonRec(lessonKey).guided[itemId] = now();
  if (lessonKey) evaluate(lessonKey);
  save();
  return { first };
}
/** A solution shown before any answer counts as a miss for mastery (independent items only). */
export function revealedFirst(itemId, lessonKey) {
  if (S.items[itemId]) return;
  answer(itemId, lessonKey, false, 'independent');
  S.items[itemId].revealed = true;
  save();
}
export const itemRecord = (id) => S.items[id] || null;

/** A guided item counts as worked once it has been answered (any step of a multi-step problem counts when all are). */
export function guidedWorked(lessonKey, itemId) { lessonRec(lessonKey).guided[itemId] ||= now(); evaluate(lessonKey); save(); }

export function checkScore(lessonKey, score) {
  const r = lessonRec(lessonKey);
  r.check = { best: Math.max(r.check?.best ?? 0, score), last: score, n: (r.check?.n || 0) + 1, t: now() };
  evaluate(lessonKey); save();
  return r.check;
}

function evaluate(lessonKey) {
  const [course, slug] = lessonKey.split('/');
  const m = lessonMeta(course, slug);
  if (!m) return;
  const r = lessonRec(lessonKey);
  const guidedOK = m.guided.every((id) => r.guided[id]);
  const checkOK = (r.check?.best ?? 0) >= COMPLETE_AT;
  if (guidedOK && checkOK && !r.completed) r.completed = now();
}

// ---------------------------------------------------------------- status
export function skill(lessonKey) { return S.skills[lessonKey] || null; }
/** Predicted recall now (0–1), from half-life regression; null with no evidence yet. */
export function recallOf(lessonKey, t = now()) {
  const sk = S.skills[lessonKey];
  if (!sk || !sk.last) return null;
  return L.recall((t - sk.last) / DAY, L.halfLife({ nCorrect: sk.nCorrect, nWrong: sk.nWrong }));
}
export function lessonStatus(course, slug) {
  const k = key(course, slug), m = lessonMeta(course, slug), r = S.lessons[k], sk = S.skills[k];
  const guidedDone = m ? m.guided.filter((id) => r?.guided[id]).length : 0;
  const mastery = sk ? sk.L : null;
  const status = {
    key: k, opened: !!r?.opened, guidedDone, guidedTotal: m?.guided.length || 0,
    checkBest: r?.check?.best ?? null, checkTries: r?.check?.n || 0,
    complete: !!r?.completed, completedAt: r?.completed || 0,
    mastery, mastered: mastery != null && mastery >= L.BKT.mastered, evidence: sk ? sk.nCorrect + sk.nWrong : 0,
    recall: recallOf(k),
  };
  status.started = status.opened || guidedDone > 0 || status.checkTries > 0 || status.evidence > 0;
  status.state = status.mastered && status.complete ? 'mastered' : status.complete ? 'done' : status.started ? 'started' : 'new';
  return status;
}

// ---------------------------------------------------------------- tests, projects, diagnostics
export function testRecord(course, slug) { return S.tests[key(course, slug)] || null; }
export function testScore(course, slug, score, { counts = true } = {}) {
  const k = key(course, slug), t = S.tests[k];
  S.tests[k] = { best: Math.max(t?.best ?? 0, score), last: score, n: (t?.n || 0) + 1, t: now(), passed: !!t?.passed || (counts && score >= PASS_AT) };
  save();
  return S.tests[k];
}
export function projectRecord(course) { return S.projects[course] || { stages: {}, completed: 0 }; }
export function projectStage(course, stageId, data) {
  const p = (S.projects[course] ||= { stages: {}, completed: 0 });
  p.stages[stageId] = { ...(p.stages[stageId] || {}), ...data, t: now() };
  save();
  return p;
}
export function projectComplete(course) { const p = (S.projects[course] ||= { stages: {}, completed: 0 }); p.completed ||= now(); save(); }
export function setDiag(course, result) { S.diag[course] = { ...result, t: now() }; save(); }
export const diag = (course) => S.diag[course] || null;

export function courseStatus(course) {
  const c = MAP[course];
  if (!c) return null;
  const lessons = c.lessons.map((l) => lessonStatus(course, l.slug));
  const tests = c.modules.filter((m) => m.test).map((m) => ({ module: m.n, ...(testRecord(course, m.test.slug) || {}) }));
  const project = projectRecord(course);
  const final = c.final ? testRecord(course, 'final') : null;
  const mastered = lessons.filter((l) => l.mastered).length;
  const masteryAvg = lessons.length ? lessons.reduce((a, l) => a + (l.mastery ?? 0), 0) / lessons.length : 0;
  const done = lessons.filter((l) => l.complete).length;
  const complete = done === lessons.length && tests.every((t) => t.passed) && (!c.project || !!project.completed) && (!c.final || !!final?.passed);
  return { course, lessons, done, total: lessons.length, mastered, masteryAvg, tests, testsPassed: tests.filter((t) => t.passed).length, project, final, complete, started: lessons.some((l) => l.started) || tests.some((t) => t.n) };
}

/** The next thing to do in a course: the first lesson not complete, else the first test not passed, project, final. */
export function nextStep(course) {
  const c = MAP[course];
  if (!c) return null;
  for (const item of c.sequence) {
    if (item.kind === 'lesson') { if (!lessonStatus(course, item.slug).complete) return item; }
    else if (item.kind === 'test' || item.kind === 'final') { if (!testRecord(course, item.slug)?.passed) return item; }
    else if (item.kind === 'project') { if (!projectRecord(course).completed) return item; }
  }
  return null;
}

// ---------------------------------------------------------------- review
/** Lessons whose predicted recall has fallen to 50% or less, most forgotten first. */
export function dueLessons(t = now()) {
  return Object.keys(S.skills).map((k) => ({ key: k, recall: recallOf(k, t) })).filter((x) => x.recall != null && x.recall <= 0.5).sort((a, b) => a.recall - b.recall);
}
/** When the next lesson comes due (ms timestamp), or null. */
export function nextDue(t = now()) {
  let best = null;
  for (const [k, sk] of Object.entries(S.skills)) {
    if (!sk.last) continue;
    const at = sk.last + L.halfLife({ nCorrect: sk.nCorrect, nWrong: sk.nWrong }) * DAY;
    if (at > t && (best == null || at < best.at)) best = { key: k, at };
  }
  return best;
}
export const missed = () => Object.entries(S.missed).map(([id, m]) => ({ id, ...m })).sort((a, b) => a.t - b.t);

export function card(id) { return S.cards[id] || null; }
export function cardAnswer(id, knew) {
  const c = (S.cards[id] ||= { nCorrect: 0, nWrong: 0, last: 0 });
  if (knew) c.nCorrect++; else c.nWrong++;
  c.last = now();
  save();
}
/** A flashcard is due when unseen or when its predicted recall is 50% or less. */
export function cardDue(id, t = now()) {
  const c = S.cards[id];
  if (!c || !c.last) return true;
  return L.recall((t - c.last) / DAY, L.halfLife({ nCorrect: c.nCorrect, nWrong: c.nWrong })) <= 0.5;
}

// ---------------------------------------------------------------- notes and bookmarks
export const note = (k) => S.notes[k]?.text || '';
export function setNote(k, text, meta = {}) {
  if (text.trim()) S.notes[k] = { text, t: now(), ...meta };
  else delete S.notes[k];
  return save();
}
export const notes = () => Object.entries(S.notes).map(([k, n]) => ({ key: k, ...n })).sort((a, b) => b.t - a.t);
export const bookmarked = (k) => !!S.bookmarks[k];
export function toggleBookmark(k, meta = {}) {
  if (S.bookmarks[k]) delete S.bookmarks[k];
  else S.bookmarks[k] = { t: now(), ...meta };
  save();
  return !!S.bookmarks[k];
}
export const bookmarks = () => Object.entries(S.bookmarks).map(([k, b]) => ({ key: k, ...b })).sort((a, b) => b.t - a.t);

// ---------------------------------------------------------------- backup
export function exportJSON() { return JSON.stringify({ ...S, exported: new Date().toISOString(), app: 'Sunflower Intelligence · Learn' }, null, 1); }
/** Replace progress with a downloaded file's. Throws with a readable message when the file isn't one. */
export function importJSON(text) {
  let d;
  try { d = JSON.parse(text); } catch { throw new Error('That file isn’t valid JSON.'); }
  if (!d || d.v !== 1 || typeof d.lessons !== 'object' || typeof d.items !== 'object') throw new Error('That file isn’t a Learn progress file.');
  const { exported, app, ...rest } = d;
  S = { ...blank(), ...rest };
  return save();
}
export function clearAll() { S = blank(); return save(); }
export const hasProgress = () => Object.keys(S.lessons).length + Object.keys(S.items).length + Object.keys(S.notes).length + Object.keys(S.bookmarks).length > 0;
