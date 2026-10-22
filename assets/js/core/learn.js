// learn.js — the learning engine behind the Learn room.
//
// 1. Item response theory, three-parameter logistic model (Birnbaum 1968):
//      P(θ) = c + (1 − c) / (1 + e^(−a(θ − b)))
//    with ability estimated by expected a posteriori (EAP) over a standard-normal prior (Bock & Mislevy 1982),
//    and the next question chosen where it carries the most Fisher information, I(θ) = P′(θ)² / (P(θ)Q(θ)).
// 2. Bayesian knowledge tracing (Corbett & Anderson 1995): one hidden mastered/unmastered state per skill,
//    updated after each answer, then a chance to learn; starting mastery individualised as
//    σ(logit(skill prior) + θ̂), the compensatory form of Yudelson, Koedinger & Gordon (2013).
// 3. Half-life regression (Settles & Meeder 2016): recall p = 2^(−Δ/h), h = 2^(Θ·x), x = [1, √correct, √wrong, difficulty].
//    A skill is due for review once predicted recall falls to 50%, i.e. after one half-life.
// Item and model parameters here are set by the author, not calibrated on learner data.

const sigmoid = (x) => 1 / (1 + Math.exp(-x));
const logit = (p) => Math.log(p / (1 - p));
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// ================================================================ IRT
export function p3pl(theta, { a, b, c }) { return c + (1 - c) * sigmoid(a * (theta - b)); }
export function info3pl(theta, item) {
  const L = sigmoid(item.a * (theta - item.b));
  const P = item.c + (1 - item.c) * L, dP = item.a * (1 - item.c) * L * (1 - L);
  return (dP * dP) / (P * (1 - P));
}

const GRID = Array.from({ length: 241 }, (_, i) => -6 + i * (12 / 240));
const PRIOR = GRID.map((t) => Math.exp(-0.5 * t * t));

/** EAP ability estimate and posterior SD from responses [{item, correct}]. */
export function eap(responses) {
  const post = PRIOR.map((pr, g) => {
    let l = Math.log(pr);
    for (const { item, correct } of responses) { const P = p3pl(GRID[g], item); l += Math.log(correct ? P : 1 - P); }
    return l;
  });
  const mx = Math.max(...post), w = post.map((l) => Math.exp(l - mx)), tot = w.reduce((s, v) => s + v, 0);
  const theta = GRID.reduce((s, t, g) => s + t * w[g], 0) / tot;
  const se = Math.sqrt(GRID.reduce((s, t, g) => s + (t - theta) ** 2 * w[g], 0) / tot);
  return { theta, se };
}

/**
 * Next question for the placement check: the unused item with the most information at the current estimate,
 * among skills asked least so far (light content balancing so one topic can't dominate).
 */
export function nextPlacementItem(bank, asked, theta) {
  const used = new Set(asked.map((r) => r.item.id));
  const perSkill = {}; asked.forEach((r) => { perSkill[r.item.skill] = (perSkill[r.item.skill] || 0) + 1; });
  const pool = bank.filter((it) => !used.has(it.id));
  if (!pool.length) return null;
  const least = Math.min(...pool.map((it) => perSkill[it.skill] || 0));
  const candidates = pool.filter((it) => (perSkill[it.skill] || 0) === least);
  return candidates.reduce((best, it) => (info3pl(theta, it) > info3pl(theta, best) ? it : best), candidates[0]);
}

/** Stop the placement check once the estimate is precise enough, within a minimum and maximum length. */
export function placementDone(asked, se, { min = 6, max = 12, target = 0.55 } = {}) {
  return asked.length >= max || (asked.length >= min && se <= target);
}

// ================================================================ BKT
export const BKT = { prior: 0.25, learn: 0.15, slip: 0.08, guess: 0.2, mastered: 0.95 };

/** Starting mastery for a skill, shifted by the learner's ability (compensatory individualisation). */
export function startMastery(theta, prior = BKT.prior) { return clamp(sigmoid(logit(prior) + theta), 0.01, 0.99); }

/** One BKT step: condition on the answer, then allow for learning from the attempt. */
export function bktUpdate(L, correct, { learn, slip, guess } = BKT) {
  const post = correct
    ? (L * (1 - slip)) / (L * (1 - slip) + (1 - L) * guess)
    : (L * slip) / (L * slip + (1 - L) * (1 - guess));
  return post + (1 - post) * learn;
}
/** Chance of answering the next question on the skill correctly. */
export function bktPredict(L, { slip, guess } = BKT) { return L * (1 - slip) + (1 - L) * guess; }

// ================================================================ HLR
export const HLR = { bias: 0, correct: 1, wrong: -1, difficulty: -0.5 };   // half-life in days
export function halfLife({ nCorrect, nWrong, difficulty = 0 }, w = HLR) {
  return 2 ** (w.bias + w.correct * Math.sqrt(nCorrect) + w.wrong * Math.sqrt(nWrong) + w.difficulty * difficulty);
}
export function recall(lagDays, h) { return 2 ** (-lagDays / h); }

// ================================================================ practice scheduling
/**
 * Choose what to practise next. Reviews come first (skills whose predicted recall has fallen to 50% or less,
 * most overdue first); otherwise the unmastered skill with the lowest mastery. Within a skill, the unanswered
 * (or least recently answered) question whose difficulty is closest to the learner's ability.
 */
export function nextPractice(state, bank, skills, now = Date.now()) {
  const DAY = 86400000;
  const rows = skills.map((s) => {
    const st = state.skills[s.id];
    const h = halfLife({ nCorrect: st.nCorrect, nWrong: st.nWrong, difficulty: s.difficulty });
    const lag = st.last ? (now - st.last) / DAY : Infinity;
    return { skill: s, st, h, lag, p: st.last ? recall(lag, h) : NaN };
  });
  const due = rows.filter((r) => r.st.last && r.p <= 0.5).sort((x, y) => x.p - y.p);
  let pick = due[0], reason = 'review';
  if (!pick) {
    const open = rows.filter((r) => r.st.L < BKT.mastered).sort((x, y) => x.st.L - y.st.L);
    pick = open[0]; reason = 'learn';
  }
  if (!pick) return { done: true, next: rows.filter((r) => r.st.last).sort((x, y) => (x.h - x.lag) - (y.h - y.lag))[0] || null };
  const lastSeen = {}; state.responses.forEach((r) => { lastSeen[r.id] = r.t; });
  const items = bank.filter((it) => it.skill === pick.skill.id);
  const item = items.slice().sort((x, y) => {
    const sx = lastSeen[x.id] || 0, sy = lastSeen[y.id] || 0;
    if (sx !== sy) return sx - sy;                                   // unseen or longest-ago first
    return Math.abs(x.b - state.theta) - Math.abs(y.b - state.theta); // then the best-matched difficulty
  })[0];
  return { item, skill: pick.skill, reason, recall: pick.p, mastery: pick.st.L };
}

/** Fresh learner state. */
export function newState(skills) {
  return { version: 1, theta: 0, se: 1, placement: [], responses: [], skills: Object.fromEntries(skills.map((s) => [s.id, { L: BKT.prior, nCorrect: 0, nWrong: 0, last: 0 }])) };
}

/** Record an answer: BKT and HLR counts for the skill, and the ability estimate from every answer so far. */
export function record(state, item, correct, now = Date.now()) {
  const st = state.skills[item.skill];
  st.L = bktUpdate(st.L, correct);
  if (correct) st.nCorrect++; else st.nWrong++;
  st.last = now;
  state.responses.push({ id: item.id, skill: item.skill, correct, t: now });
  return state;
}
