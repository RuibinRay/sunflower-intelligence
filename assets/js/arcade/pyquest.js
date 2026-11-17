// pyquest.js — Py Quest: steer a bee round a garden by writing Python. The program is run first by
// levels.js (pyRun), which returns every step; this file draws the garden and plays the steps back.
import { PY_LEVELS, pyRun } from './levels.js?v=37';
import { PAL, stage, drawSprite, drawText, hash, loop, sfx, calm } from './pixel.js?v=37';
import { h, fill, topBar, editor, levelStrip, brief, resultCard, btn } from './ui.js?v=37';
import * as store from './store.js?v=37';

const T = 16, W = 10, H = 7;
const TURN = { N: 0, E: 1, S: 2, W: 3 };

export function start(mount, { root }) {
  const bar = topBar(mount, { title: 'Py Quest', root });
  const stars = () => store.starsOf('pyquest');
  const first = PY_LEVELS.findIndex((l) => !stars()[l.id]);
  let n = first < 0 ? 0 : first;
  let level, variant = 0, hinted = false;
  let anim = null;          // { res, i, t } while a run is playing
  let view = null;          // what is drawn: { x, y, d, gone:Set, shake }
  const canvas = h('canvas.screen', { role: 'img', 'aria-label': 'The garden' });
  const ctx = stage(canvas, W * T, H * T);
  const status = h('p.screen-status', { 'aria-live': 'polite' });
  const out = h('div.console', { role: 'log', 'aria-live': 'polite' });
  const briefBox = h('div.brief-wrap');
  const ed = editor({ label: 'Your Python', rows: 11, onRun: () => run() });
  const fast = h('input', { type: 'checkbox', id: 'pq-fast' });
  const runBtn = btn('▶ Run', () => run(), 'go');
  const strip = levelStrip({ levels: PY_LEVELS, stars: stars(), current: n, onPick: (i) => load(i) });
  const overlay = h('div.result-wrap', { hidden: true });
  mount.append(strip.el,
    h('div.arc-play', {}, h('div.screen-box', {}, canvas, status, overlay), briefBox),
    h('div.arc-work', {}, ed.el,
      h('div.arc-buttons', {}, runBtn, btn('Reset code', () => { ed.set(level.starter); say('Code reset to the starting lines.'); }, 'ghost'), btn('Hint', () => { hinted = true; say(level.hint, 'hint'); }, 'ghost'), h('label.px-check', { for: 'pq-fast' }, fast, ' Fast')),
      out));

  function say(text, kind = '') { fill(out, h(`p.console-line${kind ? `.is-${kind}` : ''}`, {}, text)); }
  function mapOf(v) { return level.maps[v % level.maps.length]; }
  function startOf(v) { return level.starts ? level.starts[v % level.starts.length] : level.start; }
  function resetView() { const [x, y, d] = startOf(variant); view = { x, y, d, gone: new Set(), shake: 0 }; }

  function load(i) {
    n = i; level = PY_LEVELS[n]; hinted = false; anim = null;
    variant = Math.floor(Math.random() * level.maps.length);
    resetView();
    overlay.hidden = true; fill(overlay, );
    fill(briefBox, brief(level, n + 1, PY_LEVELS.length, level.maps.length > 1 ? h('p.brief-note', {}, 'The garden is different every time you press Run.') : null));
    ed.set(level.starter);
    strip.paint(n, stars());
    status.textContent = level.goal;
    say(`Par: ${level.par} lines for three stars.`);
    runBtn.disabled = false;
  }

  function run() {
    if (anim) return;
    overlay.hidden = true;
    if (level.maps.length > 1) variant = (variant + 1 + Math.floor(Math.random() * (level.maps.length - 1))) % level.maps.length;
    resetView();
    const res = pyRun(level, ed.get(), variant);
    if (res.frames.length <= 1 && res.error) { fail(res); return; }   // nothing ran: a syntax error
    say('Running…');
    runBtn.disabled = true;
    anim = { res, i: 0, t: 0 };
  }
  function fail(res) {
    const e = res.error;
    if (e.line) ed.error(e.line);
    fill(out, h('p.console-line.is-error', {}, e.line ? `Line ${e.line}: ${e.message}` : e.message), e.hint ? h('p.console-line.is-hint', {}, e.hint) : null);
    view.shake = 0.35;
    sfx('bad');
    status.textContent = 'Not yet. Read the message, fix the code and run it again.';
  }
  function finish(res) {
    anim = null; runBtn.disabled = false; ed.mark(0);
    if (!res.ok) { fail(res); return; }
    sfx('win');
    const reward = store.levelDone('pyquest', level.id, res.stars);
    bar.refresh(); strip.paint(n, stars());
    const last = n === PY_LEVELS.length - 1;
    say(`Solved in ${res.lines} line${res.lines > 1 ? 's' : ''}.`, 'ok');
    status.textContent = 'Level complete.';
    const next = btn(last ? 'Play Bug Battle' : 'Next level ▶', () => { if (last) location.href = '../arena/'; else load(n + 1); }, 'go');
    fill(overlay, resultCard({
      title: last ? 'Garden cleared!' : 'Level clear!', stars: res.stars, reward,
      lines: [res.stars === 3 ? `Solved in ${res.lines} lines (par ${level.par}).` : `Solved in ${res.lines} lines. Three stars need ${level.par} or fewer.`, last ? 'You have written loops, tests, variables and a function. Keep them sharp in the endless games.' : `You used: ${level.concept.toLowerCase()}.`],
      actions: [next, btn('Try again', () => { overlay.hidden = true; resetView(); }, 'ghost')],
    }));
    overlay.hidden = false;
    next.focus();
  }

  function draw(t) {
    const map = mapOf(variant);
    const ox = view.shake > 0 && !calm() ? Math.round(Math.sin(t * 60) * 2) : 0;
    ctx.setTransform(1, 0, 0, 1, ox, 0);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const c = map[y][x], px = x * T, py = y * T;
      if (c === '#') {
        ctx.fillStyle = PAL.hedge; ctx.fillRect(px, py, T, T);
        ctx.fillStyle = PAL.moss;
        for (let k = 0; k < 6; k++) ctx.fillRect(px + Math.floor(hash(x, y, k) * 14), py + Math.floor(hash(y, x, k + 9) * 14), 2, 2);
        ctx.fillStyle = PAL.olive;
        for (let k = 0; k < 3; k++) ctx.fillRect(px + Math.floor(hash(x, y, k + 20) * 15), py + Math.floor(hash(y, x, k + 30) * 15), 1, 1);
      } else if (c === '~') {
        ctx.fillStyle = PAL.water; ctx.fillRect(px, py, T, T);
        ctx.fillStyle = PAL.foam;
        const s = calm() ? 0 : Math.floor(t * 2 + hash(x, y) * 4) % 4;
        ctx.fillRect(px + 2 + s * 2, py + 4, 4, 1); ctx.fillRect(px + 9 - s, py + 11, 3, 1);
      } else {
        ctx.fillStyle = (x + y) % 2 ? '#7C8C40' : '#74843B'; ctx.fillRect(px, py, T, T);
        ctx.fillStyle = PAL.leaf;
        for (let k = 0; k < 2; k++) ctx.fillRect(px + Math.floor(hash(x, y, k + 3) * 15), py + Math.floor(hash(y, x, k + 5) * 15), 1, 2);
        if (c === 'F') drawSprite(ctx, view.gone.has(`${x},${y}`) ? 'picked' : 'flower', px + 2, py + 2);
        if (c === 'H') drawSprite(ctx, 'hive', px + 2, py + 2);
      }
    }
    const bob = calm() ? 0 : Math.round(Math.sin(t * 9));
    ctx.fillStyle = 'rgba(16,27,48,.28)'; ctx.fillRect(Math.round(view.x * T) + 4, Math.round(view.y * T) + 12, 8, 2);
    drawSprite(ctx, 'bee', view.x * T + 2, view.y * T + 1 + bob, { turn: TURN[view.d] });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (anim) drawText(ctx, `LINE ${anim.res.frames[Math.min(anim.i, anim.res.frames.length - 1)].line || 1}`, 3, 3, { color: PAL.ivory, shadow: PAL.night });
  }

  loop((dt, t) => {
    if (view.shake > 0) view.shake -= dt;
    if (anim) {
      const { res } = anim;
      const step = (fast.checked ? 0.05 : 0.2) * (calm() ? 1.4 : 1);
      anim.t += dt;
      const cur = res.frames[anim.i], nxt = res.frames[anim.i + 1];
      if (!nxt) { finish(res); }
      else {
        const k = Math.min(1, anim.t / step);
        if (nxt.ev === 'move' && !calm()) { view.x = cur.x + (nxt.x - cur.x) * k; view.y = cur.y + (nxt.y - cur.y) * k; }
        if (k >= 1) {
          anim.i++; anim.t = 0;
          view.x = nxt.x; view.y = nxt.y; view.d = nxt.d;
          ed.mark(nxt.line);
          if (nxt.ev === 'collect') { view.gone.add(nxt.at); sfx('pick'); }
          else if (nxt.ev === 'move') sfx('step');
          else if (nxt.ev === 'turn') sfx('turn');
          else if (nxt.ev === 'set') status.textContent = `${nxt.name} = ${nxt.value}`;
          else if (nxt.ev === 'bump' || nxt.ev === 'miss') view.shake = 0.3;
        }
      }
    }
    draw(t);
  });
  load(n);
}
