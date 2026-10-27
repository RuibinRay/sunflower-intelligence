// datasource.js — the table an analytics page works on: a built-in example, the table loaded under Explore
// (kept for this browser tab in sessionStorage), or one pasted or uploaded here. Nothing is sent anywhere.
import { $, $$, h } from './dom.js?v=22';
import { parseTable, applyTransforms, isNumeric } from './csv.js?v=22';

const KEY = 'si:table';
export function saveShared(entry) {
  try { if (entry.csv && entry.csv.length < 4e6) sessionStorage.setItem(KEY, JSON.stringify(entry)); } catch { /* storage full or blocked */ }
}
export function loadShared() { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch { return null; } }

/**
 * Render a dataset picker into `box`. examples: [{ key, label, make() -> { name, note, csv } }].
 * Calls onLoad({ table, name, note }) whenever a table is chosen; returns { select(key) }.
 */
export function dataSource(box, { examples, onLoad, prefix = 'ds' }) {
  const shared = loadShared();
  const opts = examples.map((e) => ({ key: e.key, label: e.label }));
  if (shared && !examples.some((e) => e.name === shared.name)) opts.push({ key: 'shared', label: `Your table from Explore (${shared.name})` });
  opts.push({ key: 'own', label: 'Paste or upload a table' });
  const radios = opts.map((o, i) => [
    Object.assign(h('input', { type: 'radio', id: `${prefix}-${o.key}`, name: `${prefix}-src`, value: o.key }), { checked: i === 0 }),
    h('label', { for: `${prefix}-${o.key}` }, o.label),
  ]).flat();
  const paste = h('textarea', { class: 'textarea', id: `${prefix}-paste`, spellcheck: 'false', placeholder: 'column_a,column_b,outcome\n1.2,30,0\n0.8,42,1' });
  const err = h('p', { class: 'error-text', role: 'alert' });
  const file = h('input', { type: 'file', class: 'visually-hidden', accept: '.csv,.tsv,.txt,text/csv,text/plain' });
  const read = h('button', { class: 'btn btn-primary', type: 'button' }, 'Read the table');
  const own = h('div', { class: 'own-data', hidden: true },
    h('div', { class: 'field' }, h('label', { for: `${prefix}-paste` }, 'Paste a table, with column names in the first row'), paste),
    h('div', { class: 'input-actions' }, read, h('label', { class: 'btn btn-secondary file-btn' }, 'Upload a CSV', file)),
    h('p', { class: 'field-hint' }, 'Comma, semicolon or tab separated. Read in this browser tab and never uploaded.'), err);
  const note = h('p', { class: 'dataset-note' });
  box.replaceChildren(h('div', { class: 'field' }, h('span', { class: 'field-label', id: `${prefix}-label` }, 'Dataset'),
    h('div', { class: 'segmented segmented-stack', role: 'radiogroup', 'aria-labelledby': `${prefix}-label` }, radios)), own, note);

  const deliver = (text, name, noteText, dropDup = false) => {
    const t = parseTable(text);
    if (t.error) { err.textContent = t.error; return false; }
    if (!t.columns.some(isNumeric)) { err.textContent = 'No numeric columns found. These tools need at least one column of numbers.'; return false; }
    err.textContent = '';
    const table = dropDup ? applyTransforms(t, { dropDuplicates: true }) : t;
    note.textContent = `${noteText} ${table.nRows} rows, ${table.columns.length} columns.`;
    onLoad({ table, name, note: noteText });
    return true;
  };
  const select = (key) => {
    own.hidden = key !== 'own';
    if (key === 'own') { paste.focus(); return; }
    if (key === 'shared') { deliver(shared.csv, shared.name, shared.note || 'The table you loaded under Explore.', shared.dropDup); return; }
    const ex = examples.find((e) => e.key === key).make();
    deliver(ex.csv, ex.name, ex.note);
  };
  $$('input', box).filter((i) => i.name === `${prefix}-src`).forEach((r) => r.addEventListener('change', () => select(r.value)));
  read.addEventListener('click', () => deliver(paste.value, 'your pasted table', 'Your table, read in this browser tab.'));
  file.addEventListener('change', async () => {
    const f = file.files[0]; if (!f) return;
    if (f.size > 25 * 1024 * 1024) { err.textContent = 'That file is over 25 MB. Try a smaller extract.'; return; }
    deliver(await f.text(), f.name, `${f.name}, read in this browser tab.`);
  });
  return { select };
}
