// lab-cleaning.js — the Data Cleaning Lab page (learn/labs/cleaning/). The panels come from cleaning-ui.js; this file
// wires them to the page's sections, the dataset choice and uploads. The recipe for each course dataset is remembered
// in this browser (localStorage key si:lab-cleaning); uploaded data never leave the tab and are not stored.
import { initSite } from '../core/site.js?v=14';
import { $, $$ } from '../core/dom.js?v=14';
import * as F from '../core/format.js?v=14';
import { afterPaint } from '../core/ui.js?v=14';
import * as C from '../core/cleaning.js?v=14';
import { createLab, STORE_KEY } from '../study/labs/cleaning-ui.js?v=14';
import { scrollersFocusable } from '../study/common.js?v=14';

initSite();

const lab = createLab({ storageKey: STORE_KEY, headingLevel: 4 });
lab.mount({
  profile: $('#cl-profile'), issues: $('#cl-issues'), table: $('#cl-table'), builder: $('#cl-builder'),
  recipe: $('#cl-recipe'), consequences: $('#cl-consequences'), export: $('#cl-export'), status: $('#cl-status'),
});
const loaded = $('#cl-loaded');
const radios = $$('input[name="cl-dataset"]');

function summary(extra = '') {
  const t = lab.st.snaps[lab.st.snaps.length - 1];
  const raw = lab.st.raw;
  loaded.textContent = `${lab.st.title}: ${F.int(raw.rows.length)} rows and ${raw.columns.length} columns loaded.${lab.st.recipe.length ? ` ${lab.st.recipe.length} saved step${lab.st.recipe.length === 1 ? '' : 's'} restored (${F.int(t.rows.length)} rows now); use Start again in the recipe to clear ${lab.st.recipe.length === 1 ? 'it' : 'them'}.` : ''}${extra}`;
}

async function choose(name) {
  radios.forEach((r) => { r.checked = r.value === name; });
  loaded.textContent = `Loading ${C.DATASETS[name].title}…`;
  try {
    await lab.loadName(name);
    summary();
  } catch (e) {
    loaded.textContent = `The dataset couldn’t be loaded (${e.message}). Check your connection and choose it again.`;
  }
}
radios.forEach((r) => r.addEventListener('change', () => { if (r.checked) choose(r.value); }));

function readOwn(text, name) {
  let t;
  try { t = C.fromCSV(text); } catch (e) { loaded.textContent = `That couldn’t be read as a table: ${e.message}`; return; }
  radios.forEach((r) => { r.checked = false; });
  lab.load(t, { name: name.replace(/\.[^.]+$/, '') || 'your-data', title: name, rules: [], persist: false });
  summary(`${t.warnings.length ? ` ${t.warnings.join(' ')}` : ''} Read in this browser tab only.${t.rows.length > 5000 ? ' Large tables make each step slower.' : ''}`);
  $('#inspect').scrollIntoView({ block: 'start' });
}
$('#cl-file').addEventListener('change', async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  if (f.size > 25 * 1024 * 1024) { loaded.textContent = 'That file is over 25 MB. Try a smaller extract.'; return; }
  loaded.textContent = `Reading ${f.name}…`;
  readOwn(await f.text(), f.name);
  e.target.value = '';
});
$('#cl-read').addEventListener('click', () => {
  const text = $('#cl-paste').value;
  if (!text.trim()) { loaded.textContent = 'Paste a table first: column names in the first line, one row per line.'; $('#cl-paste').focus(); return; }
  readOwn(text, 'Pasted table');
});

// the remembered dataset (or the first one) loads once the page has painted
afterPaint().then(() => {
  const saved = lab.savedCurrent();
  choose(saved && C.DATASETS[saved] ? saved : 'lantern-orders');
});

scrollersFocusable();   // tables and charts that scroll sideways get a tab stop (WCAG 2.1.1)
