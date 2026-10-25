// study-notebook.js — bookmarks, notes, and moving progress between browsers (download, load, clear).
import { initSite } from '../core/site.js?v=13';
import { $, h, download } from '../core/dom.js?v=13';
import * as P from '../study/progress.js?v=13';
import { describe } from '../study/common.js?v=13';

initSite();
const root = document.body.dataset.root;
const date = (t) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const link = (key, meta) => { const info = describe(key); const href = meta?.href || info.href; return href ? h('a', { href: `${root}${href}` }, `${info.code} · ${meta?.title || info.title}`) : h('span', {}, meta?.title || key); };

function paint() {
  const bms = P.bookmarks();
  $('#bm-root').replaceChildren(bms.length
    ? h('ul', { class: 'nb-list', role: 'list' }, bms.map((b) => {
      const rm = h('button', { type: 'button', class: 'btn-text' }, 'Remove');
      rm.addEventListener('click', () => { P.toggleBookmark(b.key); });
      return h('li', { class: 'nb-item' }, link(b.key, b), h('span', { class: 'nb-sub' }, `Bookmarked ${date(b.t)}`), rm);
    }))
    : h('p', { class: 'review-empty' }, 'No bookmarks. Use the Bookmark button at the top of any lesson.'));
  const ns = P.notes();
  $('#notes-root').replaceChildren(...(ns.length
    ? ns.map((n) => h('article', { class: 'nb-note' }, h('div', { class: 'nb-note-head' }, link(n.key, n), h('span', { class: 'small muted' }, `Last edited ${date(n.t)}`)), h('p', { class: 'nb-note-text' }, n.text)))
    : [h('p', { class: 'review-empty' }, 'No notes yet. Every lesson has a Notes button; what you write there is saved here as you type.')]));
}
P.onChange(paint);
paint();

const status = $('#backup-status');
const stamp = () => new Date().toISOString().slice(0, 10);
$('#export-progress').addEventListener('click', () => {
  download(`learn-progress-${stamp()}.json`, P.exportJSON(), 'application/json');
  status.textContent = 'Downloaded. Load this file in another browser to carry on there.';
});
$('#export-notes').addEventListener('click', () => {
  const ns = P.notes();
  if (!ns.length) { status.textContent = 'There are no notes to download yet.'; return; }
  const md = ['# My Learn notes', '', ...ns.flatMap((n) => { const info = describe(n.key); return [`## ${info.code} · ${n.title || info.title}`, '', n.text.trim(), '', `<https://ruibinray.github.io/sunflower-intelligence/${n.href || info.href || ''}>`, '']; })].join('\n');
  download(`learn-notes-${stamp()}.md`, md, 'text/markdown;charset=utf-8');
  status.textContent = `Downloaded ${ns.length} note${ns.length === 1 ? '' : 's'} as Markdown.`;
});
$('#import-progress').addEventListener('change', async (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  try {
    if (f.size > 5e6) throw new Error('That file is too large to be a progress file.');
    const ok = P.importJSON(await f.text());
    status.textContent = ok ? 'Progress loaded. Everything on the Learn pages now reflects the file.' : 'The file was read, but this browser is blocking storage, so it can’t be kept.';
  } catch (err) {
    status.textContent = err.message;
  }
  e.target.value = '';
});
const dlg = $('#clear-dialog');
$('#clear-progress').addEventListener('click', () => { if (dlg.showModal) dlg.showModal(); else if (confirm('Clear all your course progress? This can’t be undone.')) { P.clearAll(); status.textContent = 'Cleared.'; } });
dlg.addEventListener('close', () => { if (dlg.returnValue === 'clear') { P.clearAll(); status.textContent = 'Everything was cleared from this browser.'; } });
