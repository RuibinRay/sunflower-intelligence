// tabletamer.js — Table Tamer: the pandas game. The day's orders arrive as a CSV file; a few lines of pandas
// load it, shape it and serve() the answer. levels2.js runs the program on this file and on two more that are
// not shown, so an answer typed in by hand does not pass.
import { PANDAS_LEVELS, pandasRun } from './levels2.js?v=40';
import { sfx } from './pixel.js?v=40';
import { h, fill, teacher, topBar, editor, levelStrip, brief, btn, tryStars } from './ui.js?v=40';
import * as store from './store.js?v=40';

const num = (v, float) => (v == null ? 'NaN' : typeof v === 'number' ? (float && Number.isInteger(v) ? `${v}.0` : String(Math.round(v * 1e4) / 1e4)) : v === true ? 'True' : v === false ? 'False' : String(v));
const td = (v, float) => h(`td${typeof v === 'number' || v == null ? '.is-num' : ''}${v == null ? '.is-nan' : ''}`, {}, num(v, float));
/** A plain answer from levels2.js (a table, a series or one value) as something to look at. */
export function answerView(p) {
  if (p && p.kind === 'table') return h('table.px-table', {}, h('thead', {}, h('tr', {}, h('th', { scope: 'col', 'aria-label': 'Row number' }, ''), p.columns.map((c) => h('th', { scope: 'col' }, c)))), h('tbody', {}, p.rows.map((r, i) => h('tr', {}, h('td.is-idx', {}, String(p.index ? p.index[i] : i)), r.map((v, c) => td(v, (p.float || []).includes(p.columns[c])))))));
  if (p && p.kind === 'series') return h('table.px-table', {}, h('tbody', {}, p.index.map((k, i) => h('tr', {}, h('td.is-idx', {}, String(k)), td(p.values[i], p.float)))));
  return h('p.console-line.is-print', {}, p && p.kind === 'other' ? p.text : Array.isArray(p) ? JSON.stringify(p) : num(p, false));
}

export function start(mount, { root }) {
  const bar = topBar(mount, { title: 'Table Tamer', root });
  const stars = () => store.starsOf('tabletamer');
  const first = PANDAS_LEVELS.findIndex((l) => !stars()[l.id]);
  let n = first < 0 ? 0 : first;
  let level, seed = 1, runs = 0, hinted = false;
  const files = h('div.csv-files');
  const status = h('p.screen-status', { 'aria-live': 'polite' });
  const out = h('div.console', { role: 'log', 'aria-live': 'polite' });
  const briefBox = h('div.brief-wrap');
  const ed = editor({ label: 'Your Python (with pandas)', rows: 9, onRun: () => run() });
  const strip = levelStrip({ levels: PANDAS_LEVELS, stars: stars(), current: n, onPick: (i) => load(i) });
  mount.append(strip.el,
    h('div.arc-play', {}, h('div.screen-box', {}, files, status), briefBox),
    h('div.arc-work', {}, ed.el,
      h('div.arc-buttons', {}, btn('▶ Run', () => run(), 'go'), btn('Reset code', () => { ed.set(level.starter); say('Code reset to the starting lines.'); }, 'ghost'), btn('Hint', () => { hinted = true; say(level.hint, 'hint'); }, 'ghost'), btn('Another day', () => { seed += 7; paintFiles(); say('A different day’s orders. The same code should still work.'); }, 'ghost')),
      out));

  function say(text, kind = '') { fill(out, h(`p.console-line${kind ? `.is-${kind}` : ''}`, {}, text)); }
  function paintFiles() {
    const real = pandasRun(level, 'pass', seed).files;
    fill(files, Object.entries(real).map(([name, spec]) => h('div.pv.csv', {}, h('div.pv-bar', { 'aria-hidden': 'true' }, h('span'), h('span'), h('span'), h('b', {}, name)),
      h('div.csv-body', { tabindex: '0', role: 'region', 'aria-label': `The file ${name}` }, h('table.px-table.px-table--paper', {}, h('caption.visually-hidden', {}, name), h('thead', {}, h('tr', {}, spec.columns.map((c) => h('th', { scope: 'col' }, c)))), h('tbody', {}, spec.rows.map((r) => h('tr', {}, r.map((v, c) => td(v, (spec.float || []).includes(spec.columns[c])))))))))));
  }
  function paintBrief() { fill(briefBox, brief(level, n + 1, PANDAS_LEVELS.length, h('p.brief-note', {}, 'Hand your answer over with serve(answer). Use print() to look at anything on the way. The file changes with every day.'))); }
  const teach = teacher({ game: 'tabletamer', levels: PANDAS_LEVELS, briefBox, paintBrief, load: (i) => load(i), bar });
  mount.querySelector('.arc-work').append(h('div.arc-buttons.arc-tools', {}, teach.tools), teach.notes);

  function load(i) {
    n = i; level = PANDAS_LEVELS[n]; runs = 0; hinted = false; seed = 1 + Math.floor(Math.random() * 900);
    paintBrief(); paintFiles();
    ed.set(level.starter);
    strip.paint(n, stars());
    status.textContent = level.goal;
    say('Write your code, then press Run.');
  }
  function run() {
    runs++;
    const res = pandasRun(level, ed.get(), seed);
    const lines = res.prints.map((p) => h('p.console-line.is-print.is-table', {}, p));
    if (res.got !== undefined) lines.push(h('p.console-line', {}, 'You served:'), h('div.sql-result', {}, answerView(res.got)));
    if (!res.ok) {
      const e = res.error;
      if (e.line) ed.error(e.line);
      fill(out, lines, h('p.console-line.is-error', {}, e.line ? `Line ${e.line}: ${e.message}` : e.message), e.hint ? h('p.console-line.is-hint', {}, e.hint) : null);
      sfx('bad');
      status.textContent = 'Not yet. Read the message, fix the code and run it again.';
      return;
    }
    sfx('win');
    fill(out, lines, h('p.console-line.is-ok', {}, 'Correct, and it also worked on two other days’ files.'));
    const st = tryStars(runs, hinted);
    const reward = store.levelDone('tabletamer', level.id, st);
    bar.refresh(); strip.paint(n, stars());
    status.textContent = 'Answer accepted.';
    teach.solved({ n, level, stars: st, reward, lines: [st === 3 ? 'Solved without a hint.' : 'Three stars need no hint and three runs or fewer.'], lastHref: '../cellcraft/', lastLabel: 'Next: Cell Craft' });
  }
  load(n);
  teach.start();
}
