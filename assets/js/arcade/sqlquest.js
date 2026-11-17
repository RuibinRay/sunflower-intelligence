// sqlquest.js — Query Quest: answer the shop's questions with SQL. Each row of the table is a sprite on the
// stockroom shelf; the rows a query keeps light up, and the result appears as a table underneath.
import { SQL_LEVELS, SQL_DB, sqlRun } from './levels.js?v=33';
import { PAL, stage, drawSprite, drawText, loop, sfx, calm } from './pixel.js?v=33';
import { h, fill, teacher, topBar, editor, levelStrip, brief, resultCard, btn, tryStars } from './ui.js?v=33';
import * as store from './store.js?v=33';

const CW = 40, CH = 46, COLS = 6;
const ICON = { Coffee: 'cup', Tea: 'tea', Bakery: 'bake', Other: 'mug' };
const SHIRT = { Leeds: PAL.sun, York: PAL.terracotta, Hull: PAL.foam };
const fmt = (v) => (v === null ? 'NULL' : typeof v === 'number' && !Number.isInteger(v) ? v.toFixed(2) : String(v));

export function start(mount, { root }) {
  const bar = topBar(mount, { title: 'Query Quest', root });
  const stars = () => store.starsOf('sqlquest');
  const first = SQL_LEVELS.findIndex((l) => !stars()[l.id]);
  let n = first < 0 ? 0 : first;
  let level, runs = 0, hinted = false, picked = null, flash = 0;
  const canvas = h('canvas.screen', { role: 'img', 'aria-label': 'The stockroom shelf: one sprite for each row of the table' });
  const ctx = stage(canvas, COLS * CW, 2 * CH + 14);
  const status = h('p.screen-status', { 'aria-live': 'polite' });
  const out = h('div.console', { role: 'log', 'aria-live': 'polite' });
  const result = h('div.sql-result', { tabindex: '0', role: 'region', 'aria-label': 'Query result' });
  const briefBox = h('div.brief-wrap');
  const overlay = h('div.result-wrap', { hidden: true });
  const ed = editor({ label: 'Your SQL', rows: 5, onRun: () => run() });
  const strip = levelStrip({ levels: SQL_LEVELS, stars: stars(), current: n, onPick: (i) => load(i) });
  mount.append(strip.el,
    h('div.arc-play', {}, h('div.screen-box', {}, canvas, status, overlay), briefBox),
    h('div.arc-work', {}, ed.el,
      h('div.arc-buttons', {}, btn('▶ Run query', () => run(), 'go'), btn('Reset', () => { ed.set(level.starter); say('Query reset to the starting words.'); }, 'ghost'), btn('Hint', () => { hinted = true; say(level.hint, 'hint'); }, 'ghost')),
      out, result));

  function say(text, kind = '') { fill(out, h(`p.console-line${kind ? `.is-${kind}` : ''}`, {}, text)); }
  function schema() {
    return h('div.schema', {}, Object.entries(SQL_DB).map(([name, t]) => h('p', {}, h('b', {}, name), ` (${t.rows.length} rows): `, h('code', {}, t.columns.join(', ')))));
  }
  function table(res) {
    if (!res.rows.length) return h('p.sql-empty', {}, 'The query ran and returned no rows.');
    return h('table.px-table', {}, h('thead', {}, h('tr', {}, res.columns.map((c) => h('th', { scope: 'col' }, c)))), h('tbody', {}, res.rows.slice(0, 40).map((r) => h('tr', {}, r.map((v) => h(`td${typeof v === 'number' ? '.is-num' : ''}`, {}, fmt(v)))))));
  }
  function paintBrief() { fill(briefBox, brief(level, n + 1, SQL_LEVELS.length, schema())); }
  const teach = teacher({ game: 'sqlquest', levels: SQL_LEVELS, briefBox, paintBrief, load: (i) => load(i), bar });
  mount.querySelector('.arc-work').append(h('div.arc-buttons.arc-tools', {}, teach.tools), teach.notes);
  function load(i) {
    n = i; level = SQL_LEVELS[n]; runs = 0; hinted = false; picked = null;
    overlay.hidden = true; fill(overlay, );
    paintBrief();
    ed.set(level.starter);
    strip.paint(n, stars());
    status.textContent = level.goal;
    say('Type the query, then press Run.');
    fill(result, h('p.sql-empty', {}, 'Your result will appear here.'));
  }
  function run() {
    overlay.hidden = true;
    runs++;
    const res = sqlRun(level, ed.get());
    if (res.error) {
      picked = null; sfx('bad');
      fill(out, h('p.console-line.is-error', {}, res.error.message), res.error.hint ? h('p.console-line.is-hint', {}, res.error.hint) : null);
      fill(result, h('p.sql-empty', {}, 'No result: the query did not run.'));
      return;
    }
    picked = res.result.picked && /from\s+(\w+)/i.exec(ed.get())?.[1].toLowerCase() === level.table ? new Set(res.result.picked) : null;
    flash = 0.6;
    fill(result, h('p.sql-count', {}, `${res.result.rows.length} row${res.result.rows.length === 1 ? '' : 's'}, ${res.result.columns.length} column${res.result.columns.length === 1 ? '' : 's'}`), table(res.result));
    if (!res.ok) { sfx('hit'); say(`The query ran, but it is not the answer yet. ${res.why}`, 'error'); status.textContent = level.goal; return; }
    sfx('win');
    const st = tryStars(runs, hinted);
    const reward = store.levelDone('sqlquest', level.id, st);
    bar.refresh(); strip.paint(n, stars());
    say('That is the answer.', 'ok');
    teach.solved({ n, level, stars: st, reward, lines: [st === 3 ? 'Solved without a hint.' : 'Three stars need no hint and three runs or fewer.'], lastHref: '../arena/', lastLabel: 'Play Bug Battle' });
  }

  loop((dt, t) => {
    if (flash > 0) flash -= dt;
    const tb = SQL_DB[level.table];
    ctx.fillStyle = PAL.night; ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawText(ctx, `TABLE: ${level.table}`, 4, 3, { color: PAL.sun });
    drawText(ctx, picked ? `${picked.size} OF ${tb.rows.length} ROWS KEPT` : `${tb.rows.length} ROWS`, canvas.width - 4, 3, { color: PAL.foam, align: 'right' });
    for (let r = 0; r < 2; r++) { ctx.fillStyle = PAL.brown; ctx.fillRect(0, 14 + r * CH + CH - 6, canvas.width, 4); ctx.fillStyle = PAL.umber; ctx.fillRect(0, 14 + r * CH + CH - 2, canvas.width, 2); }
    const per = Math.ceil(tb.rows.length / 2);
    const cw = canvas.width / per;
    tb.rows.forEach((row, i) => {
      const cx = (i % per) * cw + cw / 2, cy = 14 + Math.floor(i / per) * CH;
      const on = !picked || picked.has(i);
      const lift = on && picked && !calm() ? Math.round(Math.abs(Math.sin(t * 5 + i)) * 2) : 0;
      ctx.globalAlpha = on ? 1 : 0.22;
      if (on && picked) { ctx.fillStyle = flash > 0 ? PAL.ivory : PAL.sun; ctx.fillRect(cx - 13, cy + 1 - lift, 26, 1); ctx.fillRect(cx - 13, cy + 26 - lift, 26, 1); ctx.fillRect(cx - 13, cy + 1 - lift, 1, 26); ctx.fillRect(cx + 12, cy + 1 - lift, 1, 26); }
      if (level.table === 'menu') drawSprite(ctx, ICON[row[2]], cx - 10, cy + 4 - lift, { scale: 2 });
      else drawSprite(ctx, 'person', cx - 10, cy + 4 - lift, { scale: 2, tint: { t: SHIRT[row[2]] } });
      const name = String(row[1]).replace(/ /g, '').slice(0, Math.floor(cw / 6));
      drawText(ctx, name, cx, cy + 29, { align: 'center', color: on ? PAL.ivory : PAL.grey });
      ctx.globalAlpha = 1;
    });
  });
  load(n);
  teach.start();
}
