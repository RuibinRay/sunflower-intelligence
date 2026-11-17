// datadiner.js — Data Diner: the first Python game. A customer hands over some data (the ticket), and a few
// lines of Python work out the answer and serve() it. levels.js runs the program on this customer and on two
// more that are not shown, so an answer typed in by hand does not pass.
import { DATA_LEVELS, dataRun, showValue } from './levels.js?v=40';
import { PAL, stage, drawSprite, drawText, loop, sfx, calm, hash } from './pixel.js?v=40';
import { h, fill, teacher, topBar, editor, levelStrip, brief, btn, tryStars } from './ui.js?v=40';
import * as store from './store.js?v=40';

const W = 200, H = 96;
const SHIRTS = [PAL.sun, PAL.terracotta, PAL.foam, PAL.leaf, PAL.pink, PAL.ivory];

export function start(mount, { root }) {
  const bar = topBar(mount, { title: 'Data Diner', root });
  const stars = () => store.starsOf('datadiner');
  const first = DATA_LEVELS.findIndex((l) => !stars()[l.id]);
  let n = first < 0 ? 0 : first;
  let level, seed = 1, runs = 0, hinted = false, mood = 'wait', moodT = 0;
  const canvas = h('canvas.screen', { role: 'img', 'aria-label': 'A customer waiting at the counter' });
  const ctx = stage(canvas, W, H);
  const ticket = h('div.ticket', { 'aria-live': 'polite' });
  const status = h('p.screen-status', { 'aria-live': 'polite' });
  const out = h('div.console', { role: 'log', 'aria-live': 'polite' });
  const briefBox = h('div.brief-wrap');
  const ed = editor({ label: 'Your Python', rows: 9, onRun: () => run() });
  const strip = levelStrip({ levels: DATA_LEVELS, stars: stars(), current: n, onPick: (i) => load(i) });
  mount.append(strip.el,
    h('div.arc-play', {}, h('div.screen-box', {}, canvas, ticket, status), briefBox),
    h('div.arc-work', {}, ed.el,
      h('div.arc-buttons', {}, btn('▶ Run', () => run(), 'go'), btn('Reset code', () => { ed.set(level.starter); say('Code reset to the starting lines.'); }, 'ghost'), btn('Hint', () => { hinted = true; say(level.hint, 'hint'); }, 'ghost'), btn('Next customer', () => { seed += 7; paintTicket(); say('A new customer, with different data. The same code should still work.'); }, 'ghost')),
      out));

  function say(text, kind = '') { fill(out, h(`p.console-line${kind ? `.is-${kind}` : ''}`, {}, text)); }
  function paintTicket() {
    const real = dataRun(level, 'pass', seed).vars;
    const rows = Object.entries(real);
    fill(ticket, h('b', {}, rows.length ? 'The ticket: variables you are given' : 'The ticket'), rows.length ? h('ul', { role: 'list' }, rows.map(([k, v]) => h('li', {}, h('code', {}, `${k} = ${showValue(v)}`)))) : h('p', {}, 'No data this time. Just follow the goal.'));
    mood = 'wait';
  }
  function paintBrief() { fill(briefBox, brief(level, n + 1, DATA_LEVELS.length, h('p.brief-note', {}, level.judge === 'print' ? 'Use print() to show your answer.' : 'Hand your answer over with serve(answer). The data changes with every customer.'))); }
  const teach = teacher({ game: 'datadiner', levels: DATA_LEVELS, briefBox, paintBrief, load: (i) => load(i), bar });
  mount.querySelector('.arc-work').append(h('div.arc-buttons.arc-tools', {}, teach.tools), teach.notes);

  function load(i) {
    n = i; level = DATA_LEVELS[n]; runs = 0; hinted = false; seed = 1 + Math.floor(Math.random() * 900);
    paintBrief(); paintTicket();
    ed.set(level.starter);
    strip.paint(n, stars());
    status.textContent = level.goal;
    say('Write your code, then press Run.');
  }
  function run() {
    runs++;
    const res = dataRun(level, ed.get(), seed);
    const lines = res.prints.map((p) => h('p.console-line.is-print', {}, p));
    if (res.shown != null && level.judge !== 'print') lines.push(h('p.console-line', {}, `You served: ${res.shown}`));
    if (!res.ok) {
      const e = res.error;
      if (e.line) ed.error(e.line);
      fill(out, lines, h('p.console-line.is-error', {}, e.line ? `Line ${e.line}: ${e.message}` : e.message), e.hint ? h('p.console-line.is-hint', {}, e.hint) : null);
      mood = 'sad'; moodT = 0.5; sfx('bad');
      status.textContent = 'Not yet. Read the message, fix the code and run it again.';
      return;
    }
    mood = 'happy'; moodT = 1; sfx('win');
    fill(out, lines, h('p.console-line.is-ok', {}, 'Correct, and it also worked for two more customers.'));
    const st = tryStars(runs, hinted);
    const reward = store.levelDone('datadiner', level.id, st);
    bar.refresh(); strip.paint(n, stars());
    status.textContent = 'Order served.';
    teach.solved({ n, level, stars: st, reward, lines: [st === 3 ? 'Solved without a hint.' : 'Three stars need no hint and three runs or fewer.'], lastHref: '../pyquest/', lastLabel: 'Next: Py Quest' });
  }

  loop((dt, t) => {
    if (moodT > 0) moodT -= dt;
    ctx.fillStyle = PAL.night; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = PAL.midnight; ctx.fillRect(0, 0, W, 58);
    for (let i = 0; i < 5; i++) { ctx.fillStyle = PAL.dusk; ctx.fillRect(12 + i * 38, 10, 26, 18); ctx.fillStyle = PAL.sun; ctx.fillRect(14 + i * 38, 12, 22, 2); drawSprite(ctx, ['cup', 'tea', 'bake', 'mug', 'cup'][i], 20 + i * 38, 16); }
    drawText(ctx, 'LANTERN COFFEE', 70, 32, { align: 'center', color: PAL.sun });
    const still = calm();
    const hop = mood === 'happy' && !still ? Math.round(Math.abs(Math.sin(t * 9)) * 4) : 0;
    const shake = mood === 'sad' && moodT > 0 && !still ? Math.round(Math.sin(t * 60) * 2) : 0;
    drawSprite(ctx, 'person', 140 + shake, 40 - hop, { scale: 3, tint: { t: SHIRTS[seed % SHIRTS.length] } });
    drawSprite(ctx, 'beeSide', 28, 40 + (still ? 0 : Math.round(Math.sin(t * 5) * 2)), { scale: 2 });
    ctx.fillStyle = PAL.brown; ctx.fillRect(0, 66, W, 8);
    ctx.fillStyle = PAL.umber; ctx.fillRect(0, 74, W, 22);
    for (let i = 0; i < 20; i++) { ctx.fillStyle = PAL.brown; ctx.fillRect(Math.floor(hash(i, 4) * W), 78 + Math.floor(hash(i, 5) * 14), 6, 1); }
    if (mood === 'happy') { drawSprite(ctx, 'cup', 96, 48, { scale: 2 }); drawText(ctx, 'THANKS!', 155, 30, { align: 'center', color: PAL.ivory, shadow: PAL.night }); }
    else drawText(ctx, mood === 'sad' ? 'HMM?' : '...', 155, 30, { align: 'center', color: mood === 'sad' ? PAL.pink : PAL.foam, shadow: PAL.night });
  });
  load(n);
  teach.start();
}
