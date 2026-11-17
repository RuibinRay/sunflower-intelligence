// arena.js — Bug Battle: an endless quiz fight. Every right answer stings the bug; three stings clear a wave
// and the questions get harder. A wrong answer costs a heart and stops to explain why. Questions are made
// fresh each time by questions.js. The daily run uses the date as its seed, so it is the same for everyone today.
import { makeQuestion, TRACKS } from './questions.js?v=40';
import { mulberry32 } from '../core/rng.js?v=40';
import { PAL, stage, drawSprite, drawText, loop, sfx, calm, hash, pixelHeadings } from './pixel.js?v=40';
import { h, fill, topBar, resultCard, btn } from './ui.js?v=40';
import * as store from './store.js?v=40';

const W = 240, H = 96, DAILY_N = 12;
const BUG_TINTS = [{ r: PAL.red, d: '#8E2F22' }, { r: PAL.terracotta, d: '#8E4A22' }, { r: '#8E5BD0', d: '#5A3691' }, { r: PAL.water, d: '#27527F' }, { r: PAL.olive, d: PAL.moss }, { r: PAL.charcoal, d: '#000000' }];

export function start(mount, { root }) {
  const bar = topBar(mount, { title: 'Bug Battle', root });
  const canvas = h('canvas.screen', { role: 'img', 'aria-label': 'The bee facing a bug' });
  const ctx = stage(canvas, W, H);
  const panel = h('div.quiz');
  const overlay = h('div.result-wrap', { hidden: true });
  mount.append(h('div.arena', {}, h('div.screen-box.screen-box--short', {}, canvas, overlay), panel));

  let G = null;   // the run in progress
  const fx = { dash: 0, hurt: 0, pop: 0, t: 0 };

  function menu() {
    G = null; overlay.hidden = true;
    const best = store.state().best.arena || 0;
    const today = store.dailyToday();
    const weak = store.weakSpots(4);
    fill(panel, 
      h('h3.quiz-h', {}, 'Choose your questions'),
      h('p.quiz-lead', {}, 'Read the code, pick what it does. Three hearts. Answer fast for bonus points and keep a streak going to multiply them.'),
      h('div.track-grid', {}, Object.entries(TRACKS).map(([id, name]) => h('button.px-btn.track-btn', { type: 'button', onclick: () => begin(id, false) }, h('b', {}, name), h('span', {}, ({ python: 'What does it print?', pandas: 'What does the table code give?', sql: 'What does the query return?', sheets: 'What does the formula show?', web: 'Tags, selectors, the box model', js: 'What does it log?' })[id] || 'A bit of everything')))),
      h('div.daily', {}, h('div', {}, h('b', {}, 'Daily run'), h('span', {}, today != null ? ` Done today: ${today} points. Play again to beat it.` : ` ${DAILY_N} mixed questions, the same for everyone today. +25 XP for finishing.`)), btn(today != null ? 'Replay daily' : 'Start daily run', () => begin('mixed', true), 'go')),
      weak.length ? h('div.weak', {}, h('b', {}, 'Your weak spots'), h('ul', {}, weak.map((w) => h('li', {}, `${w.topic} (${TRACKS[w.track]}): ${w.right} of ${w.right + w.wrong} right`))), btn('Practise these', () => begin('mixed', false, weak.map((w) => w.key)), 'go')) : h('p.quiz-best', {}, 'Bug Battle remembers which topics you miss and offers practice on them here.'),
      h('p.quiz-best', {}, best ? `Your best: ${best}` : 'No best score yet.'));
  }
  function begin(track, daily, focus = null) {
    overlay.hidden = true;
    G = { track, daily, focus, rand: daily ? mulberry32(store.daySeed()) : Math.random, score: 0, hearts: 3, wave: 0, hp: 3, combo: 0, comboBest: 0, asked: 0, right: 0, missed: [], q: null, left: 0, limit: 0, locked: false };
    next();
  }
  function next() {
    if (G.hearts <= 0 || (G.daily && G.asked >= DAILY_N)) { over(); return; }
    const tier = Math.min(3, 1 + Math.floor(G.wave / 2));
    G.q = makeQuestion(G.track, tier, G.rand, G.focus);
    G.asked++;
    G.limit = G.left = Math.max(16, 32 - G.wave * 2) + (G.q.table ? 8 : 0);
    G.locked = false;
    paintQuestion();
  }
  function paintQuestion(reveal = null) {
    const q = G.q;
    const opts = q.options.map((o, i) => {
      const cls = reveal == null ? '' : i === q.answer ? '.is-right' : i === reveal ? '.is-wrong' : '.is-dim';
      return h(`button.px-btn.opt${cls}`, { type: 'button', disabled: reveal != null, onclick: () => answer(i) }, h('kbd', {}, String(i + 1)), h('span', {}, o));
    });
    fill(panel, 
      h('div.quiz-meta', {}, h('span.tag', {}, TRACKS[q.track]), h('span', {}, G.focus ? `Weak spots · question ${G.asked}` : G.daily ? `Daily run · question ${G.asked} of ${DAILY_N}` : `Wave ${G.wave + 1} · question ${G.asked}`)),
      h('div.timer', { role: 'presentation' }, h('div.timer-fill', { id: 'timer-fill' })),
      h('p.quiz-prompt', {}, q.prompt),
      q.table ? h('div.quiz-table', { tabindex: '0', role: 'region', 'aria-label': `The ${q.table.name} table` }, h('table.px-table', {}, h('caption', {}, q.table.name), h('thead', {}, h('tr', {}, q.table.columns.map((c) => h('th', { scope: 'col' }, c)))), h('tbody', {}, q.table.rows.map((r) => h('tr', {}, r.map((v) => h(`td${typeof v === 'number' ? '.is-num' : ''}`, {}, typeof v === 'number' && !Number.isInteger(v) ? v.toFixed(2) : String(v)))))))) : null,
      q.code ? h('pre.quiz-code', {}, h('code', {}, q.code)) : null,
      h('div.opts', { role: 'group', 'aria-label': 'Answers (press 1 to 4)' }, opts),
      reveal != null ? h('div.why', { role: 'status' }, h('b', {}, reveal === -1 ? 'Out of time. ' : 'Not quite. '), q.why, h('div.why-go', {}, btn(G.hearts > 0 ? 'Continue ▶' : 'See results ▶', () => next(), 'go'))) : null);
    if (reveal != null) panel.querySelector('.why .px-btn').focus();
  }
  function answer(i) {
    if (!G || G.locked) return;
    G.locked = true;
    const q = G.q;
    store.topicAnswer(`${q.track}|${q.topic}`, i === q.answer);
    if (i === q.answer) {
      G.combo++; G.comboBest = Math.max(G.comboBest, G.combo); G.right++;
      const mult = Math.min(3, 1 + Math.floor(G.combo / 3) * 0.5);
      const tier = Math.min(3, 1 + Math.floor(G.wave / 2));
      G.score += Math.round((10 * tier + Math.round((G.left / G.limit) * 10)) * mult);
      fx.dash = 0.35; sfx('ok');
      G.hp--;
      if (G.hp <= 0) { G.wave++; G.hp = 3; fx.pop = 0.6; sfx('level'); }
      panel.querySelectorAll('.opt').forEach((b, k) => { b.disabled = true; b.classList.add(k === i ? 'is-right' : 'is-dim'); });
      setTimeout(() => { if (G) next(); }, calm() ? 500 : 700);
    } else {
      G.combo = 0; G.hearts--; fx.hurt = 0.4; sfx('bad');
      G.missed.push({ q, picked: i });
      paintQuestion(i);
    }
  }
  function over() {
    const g = G; G = null;
    const done = g.daily && g.hearts > 0;
    sfx(done ? 'win' : 'over');
    const reward = store.runDone('arena', g.score, { combo: g.comboBest, daily: g.daily && g.asked >= DAILY_N });
    bar.refresh();
    fill(panel, 
      h('h3.quiz-h', {}, g.missed.length ? 'Worth another look' : 'A clean run'),
      g.missed.length ? h('ol.review', {}, g.missed.map(({ q, picked }) => h('li', {}, h('p.review-q', {}, q.prompt), q.code ? h('pre.quiz-code', {}, h('code', {}, q.code)) : null, h('p', {}, picked >= 0 ? h('span.review-bad', {}, `You chose ${q.options[picked]}. `) : h('span.review-bad', {}, 'Ran out of time. '), h('span.review-good', {}, `Answer: ${q.options[q.answer]}. `), q.why)))) : h('p.quiz-lead', {}, 'Every answer was right. Try a harder track, or come back tomorrow for a new daily run.'));
    fill(overlay, resultCard({
      title: done ? 'Daily run done!' : 'Game over', reward,
      lines: [`Score ${g.score}${reward.isBest ? ' · a new best!' : ` · best ${reward.best}`}`, `${g.right} of ${g.asked} right · longest streak ${g.comboBest} · reached wave ${g.wave + 1}`],
      actions: [btn('Play again ▶', () => begin(g.track, g.daily, g.focus), 'go'), btn('Change questions', () => menu(), 'ghost')],
    }));
    overlay.hidden = false;
    overlay.querySelector('.px-btn').focus();
  }
  document.addEventListener('keydown', (e) => {
    if (!G || G.locked || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = '1234'.indexOf(e.key);
    if (k >= 0 && k < G.q.options.length) { e.preventDefault(); answer(k); }
  });

  loop((dt, t) => {
    fx.t = t;
    for (const k of ['dash', 'hurt', 'pop']) if (fx[k] > 0) fx[k] -= dt;
    if (G && !G.locked) {
      G.left -= dt;
      const fill = document.getElementById('timer-fill');
      if (fill) { fill.style.width = `${Math.max(0, (G.left / G.limit) * 100)}%`; fill.classList.toggle('is-low', G.left < 6); }
      if (G.left <= 0) { G.locked = true; G.combo = 0; G.hearts--; fx.hurt = 0.4; sfx('bad'); G.missed.push({ q: G.q, picked: -1 }); store.topicAnswer(`${G.q.track}|${G.q.topic}`, false); paintQuestion(-1); }
    }
    // scene
    ctx.fillStyle = PAL.night; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 26; i++) { ctx.fillStyle = hash(i, 3) > 0.5 || calm() || Math.sin(t * 2 + i) > -0.3 ? PAL.dusk : PAL.foam; ctx.fillRect(Math.floor(hash(i, 1) * W), Math.floor(hash(i, 2) * 56), 1, 1); }
    ctx.fillStyle = PAL.moss; ctx.fillRect(0, 76, W, 20);
    ctx.fillStyle = PAL.olive; ctx.fillRect(0, 76, W, 2);
    for (let i = 0; i < 40; i++) { ctx.fillStyle = PAL.hedge; ctx.fillRect(Math.floor(hash(i, 7) * W), 80 + Math.floor(hash(i, 8) * 14), 2, 1); }
    const still = calm();
    const bob = still ? 0 : Math.round(Math.sin(t * 6) * 2);
    const dash = fx.dash > 0 && !still ? Math.sin((1 - fx.dash / 0.35) * Math.PI) * 96 : 0;
    const shake = fx.hurt > 0 && !still ? Math.round(Math.sin(t * 70) * 2) : 0;
    drawSprite(ctx, 'beeSide', 34 + dash + shake, 40 + bob, { scale: 2 });
    const wave = G ? G.wave : 0;
    if (!(fx.pop > 0.3)) {
      const hit = fx.dash > 0.1 && fx.dash < 0.25;
      const size = 2 + Math.min(1, Math.floor(wave / 3));
      ctx.globalAlpha = fx.pop > 0 ? 1 - fx.pop / 0.3 : 1;
      drawSprite(ctx, 'bug', 172 - (size - 2) * 10 + (hit && !still ? 4 : 0), 52 - (size - 2) * 12 + (still ? 0 : Math.round(Math.sin(t * 4 + 1))), { scale: size, tint: hit ? { r: PAL.ivory, d: PAL.ivory } : BUG_TINTS[wave % BUG_TINTS.length] });
      ctx.globalAlpha = 1;
    }
    if (G) {
      for (let i = 0; i < 3; i++) drawSprite(ctx, i < G.hearts ? 'heart' : 'heartOff', 4 + i * 9, 4);
      drawText(ctx, `SCORE ${G.score}`, W / 2, 4, { align: 'center', color: PAL.ivory });
      for (let i = 0; i < 3; i++) { ctx.fillStyle = i < G.hp ? PAL.red : '#3B4660'; ctx.fillRect(W - 34 + i * 10, 5, 8, 5); }
      if (G.combo >= 2) drawText(ctx, `${G.combo} IN A ROW  ×${Math.min(3, 1 + Math.floor(G.combo / 3) * 0.5)}`, W / 2, 16, { align: 'center', color: PAL.sun });
      if (fx.pop > 0) drawText(ctx, `WAVE ${G.wave + 1}`, W / 2, 30, { align: 'center', color: PAL.sun, scale: 2, shadow: PAL.umber });
    } else if (overlay.hidden) drawText(ctx, 'BUG BATTLE', W / 2, 14, { align: 'center', color: PAL.sun, scale: 2, shadow: PAL.umber });
  });
  pixelHeadings(mount);
  menu();
}
