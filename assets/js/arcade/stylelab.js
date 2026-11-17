// stylelab.js — Style Shop: the shop's page is already written; the learner styles it with CSS. levels.js reads
// the CSS and works out each element's styles; this file paints them onto a preview as inline styles, so only
// the properties and values the reader accepted ever reach the page.
import { CSS_LEVELS, CSS_PAGE, CSS_PAGE_HTML, cssRun } from './levels.js?v=39';
import { sfx } from './pixel.js?v=39';
import { h, fill, teacher, topBar, editor, levelStrip, brief, btn, tryStars } from './ui.js?v=39';
import * as store from './store.js?v=39';

function render(nodes, styles) {
  return nodes.map((n) => {
    if (!n.tag) return document.createTextNode(n.text);
    const el = document.createElement(n.tag);
    if (n.tag === 'a') { el.setAttribute('href', '#'); el.addEventListener('click', (e) => e.preventDefault()); }
    const st = styles.get(n);
    if (st) for (const [prop, value] of Object.entries(st.own)) el.style.setProperty(prop, value);
    el.append(...render(n.children || [], styles));
    return el;
  });
}

export function start(mount, { root }) {
  const bar = topBar(mount, { title: 'Style Shop', root });
  const stars = () => store.starsOf('stylelab');
  const first = CSS_LEVELS.findIndex((l) => !stars()[l.id]);
  let n = first < 0 ? 0 : first;
  let level, checks = 0, hinted = false, solved = false;
  const page = h('div.pv-page.pv-plain');
  const status = h('p.screen-status', { 'aria-live': 'polite' });
  const out = h('div.console', { role: 'log', 'aria-live': 'polite' });
  const list = h('ul.checks', { role: 'list', 'aria-label': 'What the page needs' });
  const briefBox = h('div.brief-wrap');
  const ed = editor({ label: 'Your CSS', rows: 8, onRun: () => check(), onInput: () => live() });
  const strip = levelStrip({ levels: CSS_LEVELS, stars: stars(), current: n, onPick: (i) => load(i) });
  mount.append(strip.el,
    h('div.arc-play', {}, h('div.screen-box', {}, h('div.pv', {}, h('div.pv-bar', { 'aria-hidden': 'true' }, h('span'), h('span'), h('span'), h('b', {}, 'lantern-coffee.html + your CSS')), page), status), briefBox),
    h('div.arc-work', {}, ed.el,
      h('div.arc-buttons', {}, btn('✔ Check styles', () => check(), 'go'), btn('Reset', () => { ed.set(level.starter); live(); }, 'ghost'), btn('Hint', () => { hinted = true; fill(out, h('p.console-line.is-hint', {}, level.hint)); }, 'ghost')),
      list, out,
      h('details.page-src', {}, h('summary', {}, 'The page’s HTML (read only)'), h('pre.quiz-code', {}, h('code', {}, CSS_PAGE_HTML)))));

  function live() {
    const res = cssRun(level, ed.get());
    fill(page, render(CSS_PAGE, res.styles));
    fill(list, res.checks.map(([label, ok]) => h(`li${ok ? '.is-ok' : ''}`, {}, h('span.check-box', { 'aria-hidden': 'true' }, ok ? '✔' : '·'), h('span.visually-hidden', {}, ok ? 'Done: ' : 'To do: '), label)));
    fill(out, res.error ? h('p.console-line.is-error', {}, res.error.message) : h('p.console-line', {}, 'The CSS is well formed.'), res.error && res.error.hint ? h('p.console-line.is-hint', {}, res.error.hint) : null);
    return res;
  }
  function paintBrief() { fill(briefBox, brief(level, n + 1, CSS_LEVELS.length, h('p.brief-note', {}, 'Colours here are names such as navy, gold, red, green, brown and orange. The page’s HTML is under the editor.'))); }
  const teach = teacher({ game: 'stylelab', levels: CSS_LEVELS, briefBox, paintBrief, load: (i) => load(i), bar });
  mount.querySelector('.arc-work').append(h('div.arc-buttons.arc-tools', {}, teach.tools), teach.notes);
  function load(i) {
    n = i; level = CSS_LEVELS[n]; checks = 0; hinted = false; solved = false;
    paintBrief();
    ed.set(level.starter);
    strip.paint(n, stars());
    status.textContent = level.goal;
    live();
  }
  function check() {
    checks++;
    const res = live();
    if (!res.ok) { sfx('bad'); status.textContent = res.error ? 'The CSS has a mistake. The message below says what.' : `${res.checks.filter((c) => !c[1]).length} thing(s) on the list still to do.`; return; }
    if (solved) return;
    solved = true;
    sfx('win');
    const st = tryStars(checks, hinted);
    const reward = store.levelDone('stylelab', level.id, st);
    bar.refresh(); strip.paint(n, stars());
    status.textContent = 'Styles approved.';
    teach.solved({ n, level, stars: st, reward, lines: [st === 3 ? 'Styled without a hint.' : 'Three stars need no hint and three checks or fewer.'], lastHref: '../catcher/', lastLabel: 'Play Syntax Catcher' });
  }
  load(n);
  teach.start();
}
