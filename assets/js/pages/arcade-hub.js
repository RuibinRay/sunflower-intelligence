// arcade-hub.js — the arcade's front page: the player's rank, streak and daily run, progress on each game, badges.
import { initSite } from '../core/site.js?v=39';
import { pixelHeadings, drawSprite, PAL } from '../arcade/pixel.js?v=39';
import * as store from '../arcade/store.js?v=39';
import { h } from '../arcade/ui.js?v=39';

initSite();
const hub = document.getElementById('arcade-hub');
pixelHeadings(hub);

// the mascot and each card's picture
const mascot = document.getElementById('arc-mascot');
if (mascot) { const c = mascot.getContext('2d'); drawSprite(c, 'flower', 1, 10); drawSprite(c, 'beeSide', 14, 2); }
const ART = {
  datadiner: (c) => { c.fillStyle = PAL.midnight; c.fillRect(0, 0, 48, 16); drawSprite(c, 'beeSide', 1, 2); drawSprite(c, 'cup', 20, 3); drawSprite(c, 'person', 36, 3); c.fillStyle = PAL.brown; c.fillRect(0, 14, 48, 2); },
  stylelab: (c) => { c.fillStyle = PAL.ivory; c.fillRect(0, 0, 48, 16); c.fillStyle = PAL.sun; c.fillRect(0, 0, 48, 5); c.fillStyle = PAL.terracotta; c.fillRect(3, 7, 12, 6); c.fillStyle = PAL.water; c.fillRect(18, 7, 12, 6); c.fillStyle = PAL.olive; c.fillRect(33, 7, 12, 6); },
  pyquest: (c) => { c.fillStyle = '#74843B'; c.fillRect(0, 0, 48, 16); drawSprite(c, 'bee', 2, 2, { turn: 1 }); drawSprite(c, 'flower', 18, 2); drawSprite(c, 'flower', 34, 2); },
  sqlquest: (c) => { drawSprite(c, 'cup', 1, 3); drawSprite(c, 'tea', 13, 3); drawSprite(c, 'bake', 25, 3); drawSprite(c, 'mug', 37, 3); c.fillStyle = PAL.brown; c.fillRect(0, 14, 48, 2); },
  tagbuilder: (c) => { c.fillStyle = PAL.ivory; c.fillRect(0, 0, 48, 16); c.fillStyle = PAL.terracotta; c.fillRect(0, 0, 48, 4); c.fillStyle = PAL.midnight; c.fillRect(3, 6, 22, 2); c.fillRect(3, 10, 34, 1); c.fillRect(3, 13, 28, 1); c.fillStyle = PAL.sun; c.fillRect(38, 6, 7, 7); },
  arena: (c) => { c.fillStyle = PAL.night; c.fillRect(0, 0, 48, 16); drawSprite(c, 'beeSide', 1, 3); drawSprite(c, 'bug', 32, 3); },
  catcher: (c) => { c.fillStyle = PAL.night; c.fillRect(0, 0, 48, 16); c.fillStyle = PAL.ivory; c.fillRect(6, 1, 12, 4); c.fillRect(30, 4, 10, 4); drawSprite(c, 'basket', 16, 8); },
};
hub.querySelectorAll('[data-art]').forEach((el) => { const cv = h('canvas', { width: 48, height: 16 }); ART[el.dataset.art](cv.getContext('2d')); el.append(cv); });

function paint() {
  const S = store.state(), r = store.rank(), streak = store.streak(), today = store.dailyToday();
  document.getElementById('arc-player').replaceChildren(
    h('div.player-card', {}, h('h3', {}, 'Rank'), h('p.player-big', {}, `Lv ${r.level} ${r.name}`), h('div.xp-bar', { role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(Math.round(r.pct * 100)), 'aria-label': 'Progress to the next rank' }, h('span', { style: `width:${Math.round(r.pct * 100)}%` })), h('p.player-sub', {}, r.next ? `${S.xp} XP · ${r.span - r.into} to ${r.next}` : `${S.xp} XP · top rank`)),
    h('div.player-card', {}, h('h3', {}, 'Streak'), h('p.player-big', {}, streak ? `${streak} day${streak > 1 ? 's' : ''}` : 'Not started'), h('p.player-sub', {}, store.playedToday() ? 'Played today. Come back tomorrow to keep it going.' : streak ? 'Play any game today to keep it going.' : 'Play on two days running to start one.'), S.day.longest > 1 ? h('p.player-sub', {}, `Longest: ${S.day.longest} days`) : null),
    h('div.player-card.is-daily', {}, h('h3', {}, 'Daily run'), h('p.player-big', {}, today != null ? `${today} points` : 'Ready'), h('p.player-sub', {}, today != null ? 'Done for today. A new set of questions arrives tomorrow.' : '12 mixed questions, new every day. +25 XP.'), h('a.px-btn.px-btn--go.px-btn--sm', { href: 'arena/' }, today != null ? 'Beat your score' : 'Play today’s run')));
  for (const g of Object.keys(store.LEVEL_COUNTS)) {
    const el = hub.querySelector(`[data-progress="${g}"]`), st = store.starsOf(g), done = Object.keys(st).length, total = store.LEVEL_COUNTS[g];
    el.textContent = done ? `${done} of ${total} levels · ${Object.values(st).reduce((a, b) => a + b, 0)} of ${total * 3} stars` : `${total} levels · start at level 1`;
  }
  const weak = store.weakSpots(3);
  if (weak.length) document.getElementById('arc-player').append(h('div.player-card', {}, h('h3', {}, 'Practise next'), h('ul.weak-list', { role: 'list' }, weak.map((w) => h('li', {}, `${w.topic}: ${w.right} of ${w.right + w.wrong} right`))), h('a.px-btn.px-btn--sm', { href: 'arena/' }, 'Practise in Bug Battle')));
  for (const g of ['arena', 'catcher']) hub.querySelector(`[data-progress="${g}"]`).textContent = S.best[g] ? `Best score ${S.best[g]}` : 'Endless · no score yet';
  const won = store.BADGES.filter((b) => S.badges[b[0]]).length;
  document.getElementById('arc-badge-count').textContent = `${won} of ${store.BADGES.length} earned`;
  document.getElementById('arc-badges').replaceChildren(...store.BADGES.map((b) => h(`li${S.badges[b[0]] ? '.is-won' : ''}`, {}, h('b', {}, b[1]), b[2], S.badges[b[0]] ? h('span.visually-hidden', {}, ' (earned)') : null)));
}
paint();
document.getElementById('arc-reset').addEventListener('click', () => { if (window.confirm('Reset your arcade XP, stars, scores and badges in this browser? This cannot be undone.')) { store.reset(); paint(); } });
window.addEventListener('pageshow', paint);
