// tagbuilder.js — Tag Builder: build the shop's web page one idea at a time. The preview is drawn from the
// tree that levels.js scans out of the learner's text, never from the text itself, so nothing typed here can run.
import { HTML_LEVELS, htmlRun } from './levels.js?v=39';
import { spriteUrl, sfx } from './pixel.js?v=39';
import { h, fill, teacher, topBar, editor, levelStrip, brief, resultCard, btn, tryStars } from './ui.js?v=39';
import * as store from './store.js?v=39';

const PICS = { 'bee.png': 'bee', 'sunflower.png': 'flower', 'cup.png': 'cup' };

function render(nodes) {
  return nodes.map((n) => {
    if (n.tag === '#text') return document.createTextNode(n.text);
    if (n.tag === 'img') {
      const pic = PICS[n.attrs.src];
      if (pic) return h('img.pv-img', { src: spriteUrl(pic, 6), alt: n.attrs.alt || '', title: n.attrs.alt ? `alt: ${n.attrs.alt}` : 'This image has no alt text' });
      return h('span.pv-broken', { title: 'The file was not found, so the browser shows the alt text' }, n.attrs.alt ? n.attrs.alt : 'broken image, and no alt text');
    }
    const el = document.createElement(n.tag);
    if (n.tag === 'a') { el.setAttribute('href', '#'); el.title = n.attrs.href ? `goes to ${n.attrs.href}` : 'This link has no href'; el.addEventListener('click', (e) => e.preventDefault()); }
    if (n.tag === 'button') el.type = 'button';
    el.append(...render(n.children));
    return el;
  });
}

export function start(mount, { root }) {
  const bar = topBar(mount, { title: 'Tag Builder', root });
  const stars = () => store.starsOf('tagbuilder');
  const first = HTML_LEVELS.findIndex((l) => !stars()[l.id]);
  let n = first < 0 ? 0 : first;
  let level, checks = 0, hinted = false, solved = false;
  const page = h('div.pv-page');
  const status = h('p.screen-status', { 'aria-live': 'polite' });
  const out = h('div.console', { role: 'log', 'aria-live': 'polite' });
  const list = h('ul.checks', { role: 'list', 'aria-label': 'What the page needs' });
  const briefBox = h('div.brief-wrap');
  const overlay = h('div.result-wrap', { hidden: true });
  const ed = editor({ label: 'Your HTML', rows: 9, onRun: () => check(), onInput: () => live() });
  const strip = levelStrip({ levels: HTML_LEVELS, stars: stars(), current: n, onPick: (i) => load(i) });
  mount.append(strip.el,
    h('div.arc-play', {}, h('div.screen-box', {}, h('div.pv', {}, h('div.pv-bar', { 'aria-hidden': 'true' }, h('span'), h('span'), h('span'), h('b', {}, 'lantern-coffee.html')), page), status, overlay), briefBox),
    h('div.arc-work', {}, ed.el,
      h('div.arc-buttons', {}, btn('✔ Check page', () => check(), 'go'), btn('Reset', () => { ed.set(level.starter); live(); }, 'ghost'), btn('Hint', () => { hinted = true; fill(out, h('p.console-line.is-hint', {}, level.hint)); }, 'ghost')),
      list, out));

  function live() {
    const res = htmlRun(level, ed.get());
    fill(page, ...render(res.nodes));
    if (!res.nodes.length) page.append(h('p.pv-empty', {}, 'The page is empty. Your HTML shows here as you type.'));
    fill(list, ...res.checks.map(([label, ok]) => h(`li${ok ? '.is-ok' : ''}`, {}, h('span.check-box', { 'aria-hidden': 'true' }, ok ? '✔' : '·'), h('span.visually-hidden', {}, ok ? 'Done: ' : 'To do: '), label)));
    fill(out, res.error ? h('p.console-line.is-error', {}, res.error.message) : h('p.console-line', {}, 'The tags are well formed.'), res.error && res.error.hint ? h('p.console-line.is-hint', {}, res.error.hint) : null);
    return res;
  }
  function paintBrief() { fill(briefBox, brief(level, n + 1, HTML_LEVELS.length)); }
  const teach = teacher({ game: 'tagbuilder', levels: HTML_LEVELS, briefBox, paintBrief, load: (i) => load(i), bar });
  mount.querySelector('.arc-work').append(h('div.arc-buttons.arc-tools', {}, teach.tools), teach.notes);
  function load(i) {
    n = i; level = HTML_LEVELS[n]; checks = 0; hinted = false; solved = false;
    overlay.hidden = true; fill(overlay, );
    paintBrief();
    ed.set(level.starter);
    strip.paint(n, stars());
    status.textContent = level.goal;
    live();
  }
  function check() {
    checks++;
    const res = live();
    if (!res.ok) { sfx('bad'); status.textContent = res.error ? 'The page has a mistake in its tags. The message below says where.' : `${res.checks.filter((c) => !c[1]).length} thing(s) on the list still to do.`; return; }
    if (solved) return;
    solved = true;
    sfx('win');
    const st = tryStars(checks, hinted);
    const reward = store.levelDone('tagbuilder', level.id, st);
    bar.refresh(); strip.paint(n, stars());
    status.textContent = 'Page approved.';
    teach.solved({ n, level, stars: st, reward, lines: [st === 3 ? 'Built without a hint.' : 'Three stars need no hint and three checks or fewer.'], lastHref: '../stylelab/', lastLabel: 'Style it in Style Shop' });
  }
  load(n);
  teach.start();
}
