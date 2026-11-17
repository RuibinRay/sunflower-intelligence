// catcher.js — Syntax Catcher: words fall, a rule says which ones are real, and the basket catches them.
// The rule changes every round (Python keywords, SQL clauses, HTML tags, CSS properties, …). Catching a fake
// costs a heart and says why it is wrong; the same reasons are listed again when the run ends.
import { CATCH_ROUNDS, shuffle } from './questions.js?v=32';
import { PAL, stage, drawText, loop, sfx, calm, hash, spriteUrl } from './pixel.js?v=32';
import { h, fill, topBar, resultCard, btn } from './ui.js?v=32';
import * as store from './store.js?v=32';

const ROUND_SECONDS = 24;

export function start(mount, { root }) {
  const bar = topBar(mount, { title: 'Syntax Catcher', root });
  const canvas = h('canvas.catch-bg', { 'aria-hidden': 'true' });
  const ctx = stage(canvas, 160, 120);
  const basket = h('img.catch-basket', { src: spriteUrl('basket', 5), alt: '', draggable: 'false' });
  const rule = h('p.catch-rule', { 'aria-live': 'polite' });
  const note = h('p.catch-note', { role: 'status' });
  const hud = h('p.catch-hud');
  const field = h('div.catch-field', { tabindex: '0', role: 'application', 'aria-label': 'Syntax Catcher playing field. Move the basket with the left and right arrow keys.' }, canvas, h('div.catch-top', {}, rule, hud), basket, note);
  const overlay = h('div.result-wrap', { hidden: true });
  const side = h('div.quiz');
  mount.append(h('div.arena', {}, h('div.screen-box', {}, field, overlay), side));

  let G = null;
  const keys = { left: false, right: false };

  function intro() {
    G = null; overlay.hidden = true;
    const best = store.state().best.catcher || 0;
    rule.textContent = 'Syntax Catcher'; hud.textContent = ''; note.textContent = '';
    field.querySelectorAll('.tok').forEach((t) => t.remove());
    fill(side, 
      h('h3.quiz-h', {}, 'How to play'),
      h('ul.howto', {}, h('li', {}, 'A rule appears at the top, such as “Catch the Python keywords”.'), h('li', {}, 'Move the basket with ← → (or A and D), the mouse, or a finger.'), h('li', {}, 'Catch what fits the rule. Let the fakes fall.'), h('li', {}, 'A fake in the basket costs a heart and tells you what the real word is.'), h('li', {}, `The rule changes every ${ROUND_SECONDS} seconds and the words fall faster.`)),
      h('div.arc-buttons', {}, btn('▶ Start', () => begin(), 'go')),
      h('p.quiz-best', {}, best ? `Your best: ${best}` : 'No best score yet.'));
  }
  function begin() {
    overlay.hidden = true;
    field.querySelectorAll('.tok').forEach((t) => t.remove());
    G = { score: 0, hearts: 3, combo: 0, comboBest: 0, caught: 0, round: 0, order: shuffle(Math.random, CATCH_ROUNDS.map((_, i) => i)), set: null, t: 0, spawn: 0.6, toks: [], x: 0.5, mistakes: [], pause: 0 };
    nextRound();
    fill(side, h('h3.quiz-h', {}, 'Caught by mistake'), h('p.quiz-lead', { id: 'catch-empty' }, 'Nothing yet. Fakes you catch are explained here.'), h('ul.review', { id: 'catch-log' }));
    field.focus();
  }
  function nextRound() {
    const def = CATCH_ROUNDS[G.order[G.round % G.order.length]];
    G.set = { ...def.make(Math.random), rule: def.rule, lang: def.lang };
    G.round++; G.t = 0; G.pause = 1.6;
    G.toks.forEach((k) => k.el.remove()); G.toks = [];
    rule.textContent = `Round ${G.round}: ${def.rule}`;
    note.textContent = '';
    if (G.round > 1) sfx('level');
  }
  function spawn() {
    const good = Math.random() < 0.55;
    const item = good ? G.set.good[Math.floor(Math.random() * G.set.good.length)] : G.set.bad[Math.floor(Math.random() * G.set.bad.length)];
    const text = good ? item : item.t;
    if (G.toks.some((k) => k.text === text && k.y < 0.5)) return;
    const el = h('span.tok', {}, text);
    field.append(el);
    const w = el.offsetWidth / field.clientWidth;
    G.toks.push({ el, text, good, why: good ? '' : item.why, x: 0.02 + Math.random() * Math.max(0.01, 0.96 - w), y: -0.08, w, v: (0.16 + Math.random() * 0.06) * (1 + (G.round - 1) * 0.1) });
  }
  function caught(k) {
    if (k.good) {
      G.combo++; G.comboBest = Math.max(G.comboBest, G.combo); G.caught++;
      G.score += 10 + Math.min(20, Math.floor(G.combo / 3) * 5);
      sfx('pick');
    } else {
      G.hearts--; G.combo = 0; sfx('bad');
      note.textContent = `${k.text}: ${k.why}`;
      field.classList.add('is-hurt'); setTimeout(() => field.classList.remove('is-hurt'), 300);
      if (!G.mistakes.some((m) => m.text === k.text)) {
        G.mistakes.push({ text: k.text, why: k.why, rule: G.set.rule });
        const log = document.getElementById('catch-log'), empty = document.getElementById('catch-empty');
        if (empty) empty.remove();
        if (log) log.prepend(h('li', {}, h('code', {}, k.text), ` ${k.why}`));
      }
      if (G.hearts <= 0) over();
    }
  }
  function over() {
    const g = G; G = null;
    sfx('over');
    g.toks.forEach((k) => k.el.remove());
    const reward = store.runDone('catcher', g.score, {});
    bar.refresh();
    rule.textContent = 'Game over';
    fill(overlay, resultCard({
      title: 'Game over', reward,
      lines: [`Score ${g.score}${reward.isBest ? ' · a new best!' : ` · best ${reward.best}`}`, `${g.caught} caught · best run of ${g.comboBest} · reached round ${g.round}`, g.mistakes.length ? 'The words you caught by mistake are listed beside the game, each with its correction.' : ''].filter(Boolean),
      actions: [btn('Play again ▶', () => begin(), 'go'), btn('How to play', () => intro(), 'ghost')],
    }));
    overlay.hidden = false;
    overlay.querySelector('.px-btn').focus();
  }

  const setKey = (e, down) => {
    const k = e.key.toLowerCase();
    if (k === 'arrowleft' || k === 'a') keys.left = down; else if (k === 'arrowright' || k === 'd') keys.right = down; else return;
    if (G) e.preventDefault();
  };
  field.addEventListener('keydown', (e) => setKey(e, true));
  field.addEventListener('keyup', (e) => setKey(e, false));
  field.addEventListener('blur', () => { keys.left = keys.right = false; });
  field.addEventListener('pointermove', (e) => { if (!G) return; const r = field.getBoundingClientRect(); G.x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); });
  field.addEventListener('pointerdown', (e) => { field.focus(); if (!G) return; const r = field.getBoundingClientRect(); G.x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); });

  loop((dt, t) => {
    // backdrop: night sky over the field
    ctx.fillStyle = PAL.night; ctx.fillRect(0, 0, 160, 120);
    for (let i = 0; i < 30; i++) { ctx.fillStyle = calm() || Math.sin(t * 2 + i * 1.7) > -0.4 ? PAL.dusk : PAL.foam; ctx.fillRect(Math.floor(hash(i, 11) * 160), Math.floor(hash(i, 12) * 96), 1, 1); }
    ctx.fillStyle = PAL.moss; ctx.fillRect(0, 108, 160, 12);
    ctx.fillStyle = PAL.olive; ctx.fillRect(0, 108, 160, 1);
    if (!G) { if (overlay.hidden) drawText(ctx, 'READY?', 80, 50, { align: 'center', color: PAL.sun, scale: 2, shadow: PAL.umber }); basket.style.left = '50%'; return; }
    const bw = basket.offsetWidth / field.clientWidth;
    if (keys.left) G.x -= dt * 0.9;
    if (keys.right) G.x += dt * 0.9;
    G.x = Math.min(1 - bw / 2, Math.max(bw / 2, G.x));
    basket.style.left = `${G.x * 100}%`;
    hud.textContent = `${'♥'.repeat(G.hearts)}${'♡'.repeat(3 - G.hearts)}  Score ${G.score}${G.combo >= 3 ? `  ×${G.combo}` : ''}`;
    if (G.pause > 0) { G.pause -= dt; return; }
    G.t += dt;
    if (G.t > ROUND_SECONDS) { nextRound(); return; }
    G.spawn -= dt;
    if (G.spawn <= 0) { spawn(); G.spawn = Math.max(0.45, 1.05 - G.round * 0.07) * (0.8 + Math.random() * 0.4); }
    const fh = field.clientHeight;
    const top = 1 - (basket.offsetHeight + 10) / fh;
    for (const k of [...G.toks]) {
      k.y += k.v * dt;
      k.el.style.transform = `translate(${k.x * field.clientWidth}px, ${k.y * fh}px)`;
      const bottom = k.y + k.el.offsetHeight / fh;
      const over = k.x < G.x + bw / 2 && k.x + k.w > G.x - bw / 2;
      if (bottom >= top && k.y < top + 0.06 && over) { k.el.remove(); G.toks.splice(G.toks.indexOf(k), 1); caught(k); if (!G) return; continue; }
      if (k.y > 1) { k.el.remove(); G.toks.splice(G.toks.indexOf(k), 1); if (k.good) G.combo = 0; }
    }
  });
  intro();
}
