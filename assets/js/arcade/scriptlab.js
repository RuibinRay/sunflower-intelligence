// scriptlab.js — Script Lab: the JavaScript game. The learner's code is real JavaScript and is really run, in
// a worker: a separate thread with no access to this page, stopped after two seconds if it never finishes.
// The "page" the last levels change is a stand-in made of plain objects (levels2.js, jsCore); this file draws it.
import { JS_LEVELS, jsCore, jsCases, jsJudge, jsLint } from './levels2.js?v=40';
import { sfx } from './pixel.js?v=40';
import { h, fill, teacher, topBar, editor, levelStrip, brief, btn, tryStars } from './ui.js?v=40';
import * as store from './store.js?v=40';

const TIMEOUT = { logs: [], served: null, servedText: '', hasServed: false, page: {}, error: { name: 'Timeout', message: 'the code ran for more than two seconds and was stopped' } };
let workerUrl = null;
/** Run the source on each case in a worker. Resolves to one result per case. */
function runCases(source, cases) {
  return new Promise((resolve) => {
    let worker;
    try {
      workerUrl = workerUrl || URL.createObjectURL(new Blob([`const jsCore = ${jsCore.toString()};\nonmessage = (e) => { postMessage(e.data.cases.map((c) => jsCore(e.data.source, c.vars, c.page, c.clicks))); };`], { type: 'text/javascript' }));
      worker = new Worker(workerUrl);
    } catch { resolve(cases.map((c) => jsCore(source, c.vars, c.page, c.clicks))); return; }   // no workers here: run it directly
    const done = (results) => { clearTimeout(timer); worker.terminate(); resolve(results); };
    const timer = setTimeout(() => done(cases.map((c) => ({ ...TIMEOUT, page: c.page || {} }))), 2000);
    worker.onmessage = (e) => done(e.data);
    worker.onerror = (e) => { e.preventDefault(); done(cases.map((c) => ({ ...TIMEOUT, page: c.page || {}, error: { name: 'Error', message: e.message || 'the code could not be run' } }))); };
    worker.postMessage({ source, cases });
  });
}
const show = (v) => (typeof v === 'string' ? JSON.stringify(v) : Array.isArray(v) ? `[${v.map(show).join(', ')}]` : v && typeof v === 'object' ? `{ ${Object.entries(v).map(([k, x]) => `${k}: ${show(x)}`).join(', ')} }` : String(v));

export function start(mount, { root }) {
  const bar = topBar(mount, { title: 'Script Lab', root });
  const stars = () => store.starsOf('scriptlab');
  const first = JS_LEVELS.findIndex((l) => !stars()[l.id]);
  let n = first < 0 ? 0 : first;
  let level, seed = 1, runs = 0, hinted = false, busy = false, clicks = 0, ran = false;
  const page = h('div.pv-page.js-page');
  const pv = h('div.pv', {}, h('div.pv-bar', { 'aria-hidden': 'true' }, h('span'), h('span'), h('span'), h('b', {}, 'lantern-coffee.html')), page);
  const ticket = h('div.ticket', { 'aria-live': 'polite' });
  const status = h('p.screen-status', { 'aria-live': 'polite' });
  const out = h('div.console', { role: 'log', 'aria-live': 'polite' });
  const briefBox = h('div.brief-wrap');
  const ed = editor({ label: 'Your JavaScript', rows: 9, onRun: () => run() });
  const strip = levelStrip({ levels: JS_LEVELS, stars: stars(), current: n, onPick: (i) => load(i) });
  mount.append(strip.el,
    h('div.arc-play', {}, h('div.screen-box', {}, pv, ticket, status), briefBox),
    h('div.arc-work', {}, ed.el,
      h('div.arc-buttons', {}, btn('▶ Run', () => run(), 'go'), btn('Reset code', () => { ed.set(level.starter); say('Code reset to the starting lines.'); }, 'ghost'), btn('Hint', () => { hinted = true; say(level.hint, 'hint'); }, 'ghost'), btn('Next customer', () => { seed += 7; ran = false; clicks = 0; paintScene(); say('Different values this time. The same code should still work.'); }, 'ghost')),
      out));

  function say(text, kind = '') { fill(out, h(`p.console-line${kind ? `.is-${kind}` : ''}`, {}, text)); }
  /** The stand-in page: each element with its id beside it. state = { id: text } */
  function paintPage(state) {
    const ids = Object.keys(state);
    pv.hidden = !ids.length;
    fill(page, ids.map((id) => h('div.js-el', {}, h('code.js-id', {}, `#${id}`),
      id === level.clickId ? h('button', { type: 'button', onclick: () => click() }, state[id]) : h(id === 'sign' ? 'h1' : 'p.js-text', {}, state[id]))),
    level.clickId ? h('p.js-note', {}, ran ? `Clicked ${clicks} time${clicks === 1 ? '' : 's'}. Click the button to try your code.` : 'Press Run first, then click the button.') : null);
  }
  function paintScene() {
    const c = jsCases(level, seed)[0];
    const rows = Object.entries(c.vars);
    fill(ticket, h('b', {}, rows.length ? 'The ticket: variables you are given' : 'The ticket'), rows.length ? h('ul', { role: 'list' }, rows.map(([k, v]) => h('li', {}, h('code', {}, `${k} = ${show(v)}`)))) : h('p', {}, c.page ? 'No variables this time. The page above is what you change.' : 'No data this time. Just follow the goal.'));
    paintPage(c.page || {});
  }
  function paintBrief() { fill(briefBox, brief(level, n + 1, JS_LEVELS.length, h('p.brief-note', {}, level.judge === 'log' ? 'Use console.log() to show your answer.' : level.judge === 'page' ? 'The page is above. Each element is labelled with its id.' : 'Hand your answer over with serve(answer). The values change with every customer.'))); }
  const teach = teacher({ game: 'scriptlab', levels: JS_LEVELS, briefBox, paintBrief, load: (i) => load(i), bar });
  mount.querySelector('.arc-work').append(h('div.arc-buttons.arc-tools', {}, teach.tools), teach.notes);

  function load(i) {
    n = i; level = JS_LEVELS[n]; runs = 0; hinted = false; clicks = 0; ran = false; seed = 1 + Math.floor(Math.random() * 900);
    paintBrief(); paintScene();
    ed.set(level.starter);
    strip.paint(n, stars());
    status.textContent = level.goal;
    say('Write your code, then press Run.');
  }
  /** A click on the page's button: run the code again with one more click, and show the page it leaves. */
  async function click() {
    if (busy || !ran) return;
    busy = true; clicks++;
    const c = jsCases(level, seed)[0];
    const [res] = await runCases(ed.get(), [{ ...c, clicks: { id: level.clickId, n: clicks } }]);
    busy = false;
    paintPage({ ...(c.page || {}), ...res.page });
    sfx('pick');
    const b = page.querySelector('button'); if (b) b.focus();
  }
  async function run() {
    if (busy) return;
    runs++;
    const source = ed.get();
    const lint = jsLint(source);
    if (lint) { ed.error(lint.line); fill(out, h('p.console-line.is-error', {}, `Line ${lint.line}: ${lint.message}`), h('p.console-line.is-hint', {}, lint.hint)); sfx('bad'); status.textContent = 'Not yet. Read the message, fix the code and run it again.'; return; }
    busy = true; say('Running…');
    const cases = jsCases(level, seed);
    const shownCase = level.clickId ? [{ ...cases[0], clicks: { id: level.clickId, n: 0 } }] : [];
    const results = await runCases(source, [...cases, ...shownCase]);
    busy = false; ran = true; clicks = 0;
    const res = jsJudge(level, source, cases, results.slice(0, cases.length));
    paintPage({ ...(cases[0].page || {}), ...(level.clickId ? results[cases.length].page : res.page) });
    const lines = res.logs.map((p) => h('p.console-line.is-print', {}, p));
    if (res.shown != null) lines.push(h('p.console-line', {}, `You served: ${res.shown}`));
    if (!res.ok) {
      fill(out, lines, h('p.console-line.is-error', {}, res.error.message), res.error.hint ? h('p.console-line.is-hint', {}, res.error.hint) : null);
      sfx('bad');
      status.textContent = 'Not yet. Read the message, fix the code and run it again.';
      return;
    }
    sfx('win');
    fill(out, lines, h('p.console-line.is-ok', {}, level.judge === 'log' ? 'Correct.' : level.clickId ? 'Correct: it counts 1, 3 and 5 clicks properly. Try the button yourself.' : 'Correct, and it also worked for two more customers.'));
    const st = tryStars(runs, hinted);
    const reward = store.levelDone('scriptlab', level.id, st);
    bar.refresh(); strip.paint(n, stars());
    status.textContent = 'Code accepted.';
    teach.solved({ n, level, stars: st, reward, lines: [st === 3 ? 'Solved without a hint.' : 'Three stars need no hint and three runs or fewer.'], lastHref: '../arena/', lastLabel: 'Play Bug Battle' });
  }
  load(n);
  teach.start();
}
