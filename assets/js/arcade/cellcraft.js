// cellcraft.js — Cell Craft: the spreadsheet-formula game. A small sheet of orders, one cell to fill, and a
// formula bar. The formula is worked out by the site's own spreadsheet engine (core/sheet.js) as you type, and
// checked on this sheet and on three more with different data, so a typed-in number does not pass.
import { SHEET_LEVELS, sheetRun } from './levels2.js?v=40';
import { display, isErr, indexToCol, parseAddr } from '../core/sheet.js?v=40';
import { sfx } from './pixel.js?v=40';
import { h, fill, teacher, topBar, levelStrip, brief, btn, tryStars } from './ui.js?v=40';
import * as store from './store.js?v=40';

export function start(mount, { root }) {
  const bar = topBar(mount, { title: 'Cell Craft', root });
  const stars = () => store.starsOf('cellcraft');
  const first = SHEET_LEVELS.findIndex((l) => !stars()[l.id]);
  let n = first < 0 ? 0 : first;
  let level, seed = 1, checks = 0, hinted = false, solved = false;
  const grid = h('div.sheet-wrap', { tabindex: '0', role: 'region', 'aria-label': 'The spreadsheet' });
  const status = h('p.screen-status', { 'aria-live': 'polite' });
  const out = h('div.console', { role: 'log', 'aria-live': 'polite' });
  const briefBox = h('div.brief-wrap');
  const cellName = h('span.fx-cell');
  const input = h('input.fx-input', { type: 'text', id: 'fx-input', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', autocorrect: 'off', 'aria-describedby': 'fx-help' });
  input.addEventListener('input', () => live());
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
  const fx = h('div.fx', {}, h('label.ed-label', { for: 'fx-input' }, 'Your formula', h('span.ed-keys', { id: 'fx-help' }, 'Enter checks · click a cell to add its address')), h('div.fx-bar', {}, cellName, h('span.fx-sign', { 'aria-hidden': 'true' }, 'fx'), input));
  const strip = levelStrip({ levels: SHEET_LEVELS, stars: stars(), current: n, onPick: (i) => load(i) });
  mount.append(strip.el,
    h('div.arc-play', {}, h('div.screen-box', {}, grid, status), briefBox),
    h('div.arc-work', {}, fx,
      h('div.arc-buttons', {}, btn('✔ Check formula', () => check(), 'go'), btn('Reset', () => { input.value = level.starter; live(); }, 'ghost'), btn('Hint', () => { hinted = true; fill(out, h('p.console-line.is-hint', {}, level.hint)); }, 'ghost'), btn('New numbers', () => { seed += 7; solved = false; live(); status.textContent = 'Different numbers on the sheet. A good formula still works.'; }, 'ghost')),
      out));

  function insert(a) {
    const s = input.selectionStart ?? input.value.length, e = input.selectionEnd ?? s;
    input.setRangeText(a, s, e, 'end');
    input.focus();
    live();
  }
  function paintGrid(res, marks = null) {
    const ext = res.sheet.extent(), target = parseAddr(level.cell);
    const cols = Math.max(ext.cols, target.c + 1, 5), rows = Math.max(ext.rows, target.r + 1, 8);
    const filled = new Map(res.targets.map((t) => [t.cell, t.formula]));
    const mark = new Map((marks || []).map((m) => [m.cell, m.ok]));
    const body = [];
    for (let r = 0; r < rows; r++) {
      const tds = [h('th', { scope: 'row' }, String(r + 1))];
      for (let c = 0; c < cols; c++) {
        const a = `${indexToCol(c)}${r + 1}`, v = res.sheet.get(a), isTarget = a === level.cell, isFill = filled.has(a) || isTarget;
        const cls = `${typeof v === 'number' ? '.is-num' : ''}${r === 0 ? '.is-head' : ''}${isTarget ? '.is-target' : isFill ? '.is-fill' : ''}${isErr(v) ? '.is-err' : ''}${mark.has(a) ? (mark.get(a) ? '.is-right' : '.is-wrong') : ''}`;
        tds.push(h(`td${cls}`, { title: filled.has(a) ? `${a}: ${filled.get(a)}` : a, 'data-a': a, onclick: () => insert(a) }, isTarget && !filled.has(a) ? '?' : display(v)));
      }
      body.push(h('tr', {}, tds));
    }
    fill(grid, h('table.sheet', {}, h('caption.visually-hidden', {}, `Lantern Coffee orders. Your formula goes in ${level.cell}.`), h('thead', {}, h('tr', {}, h('th.sheet-corner', {}, ''), Array.from({ length: cols }, (_, c) => h('th', { scope: 'col' }, indexToCol(c))))), h('tbody', {}, body)));
  }
  function live(marks = false) {
    const res = sheetRun(level, input.value, seed);
    paintGrid(res, marks ? res.results : null);
    const shown = res.targets.length ? display(res.sheet.get(level.cell)) : '';
    fill(out, !input.value.trim() ? h('p.console-line', {}, 'Type a formula. It starts with an equals sign.') : res.targets.length ? h('p.console-line', {}, `${level.cell} shows ${shown === '' ? 'nothing' : shown}${level.fill ? `, and the formula is filled down to ${level.fill.split(':')[1]}` : ''}.`) : h('p.console-line.is-error', {}, res.message));
    return res;
  }
  function paintBrief() { fill(briefBox, brief(level, n + 1, SHEET_LEVELS.length, h('p.brief-note', {}, `Your formula goes in ${level.cell}, the yellow cell. These formulas work the same in Excel and Google Sheets.`))); }
  const teach = teacher({ game: 'cellcraft', levels: SHEET_LEVELS, briefBox, paintBrief, load: (i) => load(i), bar });
  mount.querySelector('.arc-work').append(h('div.arc-buttons.arc-tools', {}, teach.tools), teach.notes);

  function load(i) {
    n = i; level = SHEET_LEVELS[n]; checks = 0; hinted = false; solved = false; seed = 1 + Math.floor(Math.random() * 900);
    paintBrief();
    input.value = level.starter;
    cellName.textContent = level.cell;
    strip.paint(n, stars());
    status.textContent = level.goal;
    live();
  }
  function check() {
    checks++;
    const res = live(true);
    if (!res.ok) {
      sfx('bad');
      fill(out, h('p.console-line.is-error', {}, res.message), res.hint ? h('p.console-line.is-hint', {}, res.hint) : null);
      status.textContent = 'Not yet. Read the message, change the formula and check again.';
      return;
    }
    fill(out, h('p.console-line.is-ok', {}, `${res.message} It also holds on three sheets with different numbers.`));
    if (solved) return;
    solved = true;
    sfx('win');
    const st = tryStars(checks, hinted);
    const reward = store.levelDone('cellcraft', level.id, st);
    bar.refresh(); strip.paint(n, stars());
    status.textContent = 'Formula accepted.';
    teach.solved({ n, level, stars: st, reward, lines: [st === 3 ? 'Solved without a hint.' : 'Three stars need no hint and three checks or fewer.'], lastHref: '../scriptlab/', lastLabel: 'Next: Script Lab' });
  }
  load(n);
  teach.start();
}
