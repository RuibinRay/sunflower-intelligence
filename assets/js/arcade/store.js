// store.js — the player's arcade record, kept only in this browser (localStorage key "si:arcade"):
// XP and rank, the daily streak, stars per level, best scores and badges.
const KEY = 'si:arcade';
const blank = () => ({ v: 1, xp: 0, stars: {}, best: {}, plays: {}, day: { last: '', streak: 0, longest: 0 }, daily: { date: '', score: 0 }, badges: {}, mute: false, streakBest: 0 });
let S = blank();
let storageOK = true;
try { const raw = localStorage.getItem(KEY); if (raw) S = { ...blank(), ...JSON.parse(raw) }; } catch { storageOK = false; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { storageOK = false; } };
export const state = () => S;
export const canSave = () => storageOK;

const pad = (n) => String(n).padStart(2, '0');
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** A number that is the same all day and different tomorrow: the seed of the daily run. */
export const daySeed = (d = new Date()) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();

export const RANKS = [['Seed', 0], ['Sprout', 100], ['Seedling', 250], ['Bud', 500], ['Bloom', 900], ['Sunflower', 1500], ['Field', 2500], ['Golden field', 4000]];
export function rank(xp = S.xp) {
  let i = 0;
  while (i + 1 < RANKS.length && xp >= RANKS[i + 1][1]) i++;
  const next = RANKS[i + 1];
  return { level: i + 1, name: RANKS[i][0], next: next ? next[0] : null, into: xp - RANKS[i][1], span: next ? next[1] - RANKS[i][1] : 1, pct: next ? (xp - RANKS[i][1]) / (next[1] - RANKS[i][1]) : 1 };
}

export const BADGES = [
  ['first', 'First bloom', 'Finish any level'],
  ['py', 'Bee keeper', 'Finish every Py Quest level'],
  ['sql', 'Stock taker', 'Finish every Query Quest level'],
  ['html', 'Sign painter', 'Finish every Tag Builder level'],
  ['stars', 'Tidy coder', 'Earn three stars on 10 levels'],
  ['combo', 'On a roll', '10 right in a row in Bug Battle'],
  ['arena', 'Exterminator', 'Score 1,000 in Bug Battle'],
  ['catch', 'Sharp eyes', 'Score 400 in Syntax Catcher'],
  ['daily', 'Regular', 'Finish a daily run'],
  ['streak3', 'Three in a row', 'Play three days running'],
  ['streak7', 'A full week', 'Play seven days running'],
  ['all', 'All-rounder', 'Play all five games'],
];
export const GAMES = ['pyquest', 'sqlquest', 'tagbuilder', 'arena', 'catcher'];
export const LEVEL_COUNTS = { pyquest: 10, sqlquest: 14, tagbuilder: 8 };

function award(newly) {
  const has = (id, cond) => { if (cond && !S.badges[id]) { S.badges[id] = dayKey(); newly.push(BADGES.find((b) => b[0] === id)); } };
  const done = (g) => Object.keys(S.stars[g] || {}).length;
  has('first', GAMES.some((g) => done(g) > 0));
  has('py', done('pyquest') >= LEVEL_COUNTS.pyquest);
  has('sql', done('sqlquest') >= LEVEL_COUNTS.sqlquest);
  has('html', done('tagbuilder') >= LEVEL_COUNTS.tagbuilder);
  has('stars', GAMES.reduce((n, g) => n + Object.values(S.stars[g] || {}).filter((s) => s >= 3).length, 0) >= 10);
  has('combo', S.streakBest >= 10);
  has('arena', (S.best.arena || 0) >= 1000);
  has('catch', (S.best.catcher || 0) >= 400);
  has('daily', S.daily.score > 0);
  has('streak3', S.day.longest >= 3);
  has('streak7', S.day.longest >= 7);
  has('all', GAMES.every((g) => S.plays[g]));
}
/** Mark today as played and keep the day streak. */
function touch() {
  const today = dayKey();
  if (S.day.last === today) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  S.day.streak = S.day.last === dayKey(y) ? S.day.streak + 1 : 1;
  S.day.longest = Math.max(S.day.longest, S.day.streak);
  S.day.last = today;
}
/** The streak as it stands today: it lapses if yesterday was missed. */
export function streak() {
  const y = new Date(); y.setDate(y.getDate() - 1);
  return S.day.last === dayKey() || S.day.last === dayKey(y) ? S.day.streak : 0;
}
export const playedToday = () => S.day.last === dayKey();

/** Record a finished level. Returns { xp, firstTime, badges, rankUp }. */
export function levelDone(game, id, stars) {
  const before = rank().level;
  const old = (S.stars[game] || {})[id] || 0;
  S.stars[game] = { ...(S.stars[game] || {}), [id]: Math.max(old, stars) };
  S.plays[game] = (S.plays[game] || 0) + 1;
  const xp = old ? Math.max(5, (stars - old) * 10) : 20 + stars * 10;
  S.xp += xp;
  touch();
  const badges = []; award(badges); save();
  return { xp, firstTime: !old, badges, rankUp: rank().level > before ? rank().name : null };
}
/** Record a finished endless run. Returns { xp, best, isBest, badges, rankUp }. */
export function runDone(game, score, { combo = 0, daily = false } = {}) {
  const before = rank().level;
  const prev = S.best[game] || 0;
  S.best[game] = Math.max(prev, score);
  S.plays[game] = (S.plays[game] || 0) + 1;
  S.streakBest = Math.max(S.streakBest || 0, combo);
  if (daily) { const today = dayKey(); S.daily = { date: today, score: S.daily.date === today ? Math.max(S.daily.score, score) : score }; }
  const xp = Math.max(score > 0 ? 5 : 0, Math.round(score / 10)) + (daily ? 25 : 0);
  S.xp += xp;
  if (score > 0) touch();
  const badges = []; award(badges); save();
  return { xp, best: S.best[game], isBest: score > prev && score > 0, badges, rankUp: rank().level > before ? rank().name : null };
}
export const starsOf = (game) => S.stars[game] || {};
export const dailyToday = () => (S.daily.date === dayKey() ? S.daily.score : null);
export function setMute(m) { S.mute = m; save(); }
export function reset() { S = blank(); save(); }
