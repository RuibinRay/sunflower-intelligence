// cleaning-ui.js — the Data Cleaning Lab's interface, shared by the lab page, the B02 lesson widgets and the B02 project.
// createLab(opts) holds the state (raw table, recipe, snapshots) and renders panels into any elements you give it;
// mountLab(el, opts) stacks the panels in one element. Every number shown comes from assets/js/core/cleaning.js.
// Anything from a dataset or an upload goes into the page through textContent (h() never uses innerHTML).
import { h, s, download, store } from '../../core/dom.js?v=6';
import * as F from '../../core/format.js?v=6';
import * as C from '../../core/cleaning.js?v=6';

export const STORE_KEY = 'si:lab-cleaning';
export const datasetUrl = (name) => new URL(`../../../data/study/${name}.csv?v=6`, import.meta.url).href;
const cache = new Map();
/** Fetch and parse one of the course datasets (cached per page). */
export function loadDataset(name) {
  if (!C.DATASETS[name]) return Promise.reject(new Error(`Unknown dataset ${name}.`));
  if (!cache.has(name)) {
    cache.set(name, fetch(datasetUrl(name)).then((r) => { if (!r.ok) throw new Error(`Couldn’t load ${name} (${r.status}).`); return r.text(); }).then((t) => C.fromCSV(t)));
    cache.get(name).catch(() => cache.delete(name));
  }
  return cache.get(name);
}

// ---------------------------------------------------------------- small helpers
let uid = 0;
const nextId = () => `cl${++uid}`;
const ALLOWED = { B: [], STRONG: [], I: [], EM: [], SUB: [], SUP: [], BR: [], CODE: [], ABBR: ['title'], A: ['href'] };
/** Lesson-config HTML (author content) reduced to the inline tags AUTHORING.md allows; everything else becomes text. */
export function sanitize(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = String(html ?? '');
  const walk = (node, into) => {
    node.childNodes.forEach((n) => {
      if (n.nodeType === 3) into.append(n.textContent);
      else if (n.nodeType === 1) {
        const keep = ALLOWED[n.tagName];
        if (!keep) { walk(n, into); return; }
        const el = document.createElement(n.tagName.toLowerCase());
        keep.forEach((a) => { const v = n.getAttribute(a); if (v != null && !(a === 'href' && /^\s*javascript:/i.test(v))) el.setAttribute(a, v); });
        walk(n, el);
        into.append(el);
      }
    });
  };
  const frag = document.createDocumentFragment();
  walk(tpl.content, frag);
  return frag;
}
const num = (v) => (Number.isFinite(v) ? F.auto(v) : '—');
const pct = (v, d = 1) => (Number.isFinite(v) ? `${(v * 100).toFixed(d)}%` : '—');
const plural = (n, one, many = `${one}s`) => `${F.int(n)} ${n === 1 ? one : many}`;
const ICON = {
  error: 'M10 5.5v5.2M10 14.2v.3', warning: 'M10 5.5v5.2M10 14.2v.3', info: 'M10 9v5M10 6v.3',
  ok: 'M5.5 10.5l3 3L14.5 7', todo: '', flag: 'M10 4.5l6.5 11.5h-13z',
};
function icon(kind, cls = '') {
  const sv = s('svg', { viewBox: '0 0 20 20', class: `cl-icon ${cls}`, 'aria-hidden': 'true', focusable: 'false' });
  if (kind === 'flag') sv.append(s('path', { d: 'M10 3.2l7.6 13.3H2.4z', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linejoin': 'round' }), s('path', { d: 'M10 8v4M10 14.4v.2', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round' }));
  else {
    sv.append(s('circle', { cx: 10, cy: 10, r: 8.4, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6 }));
    if (ICON[kind]) sv.append(s('path', { d: ICON[kind], fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  }
  return sv;
}
const heading = (level, text, attrs = {}) => h(`h${Math.min(6, Math.max(2, level))}`, { class: 'cl-h', ...attrs }, text);
/** A cell's value with invisible spaces made visible (· for each stray space). */
function cellNodes(v) {
  if (v == null || (typeof v === 'string' && v === '')) return [h('span', { class: 'cl-empty' }, 'empty')];
  if (typeof v === 'number') return [Number.isFinite(v) ? String(+v.toPrecision(8)) : '—'];
  const t = String(v);
  const out = [];
  const m = t.match(/^(\s*)([\s\S]*?)(\s*)$/);
  const ws = (str) => h('span', { class: 'cl-ws', 'aria-hidden': 'true' }, str.replace(/[\s ]/g, '·'));
  if (m[1]) out.push(ws(m[1]));
  m[2].split(/(\s{2,}|[   ])/).forEach((part, i) => { if (!part) return; out.push(i % 2 ? ws(part) : part); });
  if (m[3]) out.push(ws(m[3]));
  if (!m[2] && !out.length) out.push(h('span', { class: 'cl-empty' }, 'empty'));
  return out;
}
const TYPE_LABEL = { number: 'number', date: 'date', category: 'category', text: 'text', id: 'identifier', boolean: 'yes/no' };
const segmented = (name, options, value, onChange, labelId) => {
  const box = h('div', { class: 'segmented cl-seg', role: 'radiogroup', 'aria-labelledby': labelId });
  options.forEach(([v, label]) => {
    const id = nextId();
    const inp = h('input', { type: 'radio', id, name, value: v });
    inp.checked = String(v) === String(value);
    inp.addEventListener('change', () => { if (inp.checked) onChange(v); });
    box.append(inp, h('label', { for: id }, label));
  });
  return box;
};

// ---------------------------------------------------------------- what each kind of step can do to conclusions
export function consequenceText(st) {
  if (!st) return '';
  switch (st.op) {
    case 'dedupe': return 'Removing exact duplicates stops one record counting twice: counts and totals fall, and averages change only if the repeated rows differed from the rest. The risk is two genuinely identical records (two people buying the same thing on the same day), so confirm with a key column when you can.';
    case 'dedupe-key': return 'Keeping one row per key makes each record count once, but which copy you keep is an assumption: first, last and most complete can keep different values, and totals follow your choice. Read the columns where the copies disagreed.';
    case 'trim': case 'case': case 'map': return 'Standardising text merges groups that were split by spelling. Counts and shares per group change, but no number changes. A wrong mapping quietly merges categories that are really different, so read the mapping before applying it.';
    case 'to-number': return 'Converting text to numbers makes sums, averages and outlier checks possible. Values that can’t be converted stay as text and are left out of calculations until you deal with them. Reading a decimal comma as a thousands separator would multiply a value by 100, which is why the lab never guesses the decimal mark.';
    case 'to-date': return 'Converting to ISO dates makes dates sortable and lets you calculate gaps between them. A date read the wrong way round moves by weeks or months and can shift monthly totals, so ambiguous dates are left alone until you choose an order.';
    case 'fill':
      if (st.method === 'constant') return 'A constant is right only when a blank really means that value, such as a blank count of children meaning 0. If a blank means “unknown”, a constant creates false data and biases every statistic toward it.';
      if (st.method === 'mode') return st.by ? `Filling with the most common value among rows that share ${st.by} can recover the true value when that column determines this one (one e-mail address per customer). Where it doesn’t, it inflates the most common category.` : 'Filling with the most common value inflates that value’s share and hides the fact that the data were missing.';
      return `Imputing keeps every row but invents values: the spread (SD) shrinks, relationships with other columns (correlations) weaken, and later confidence intervals come out too narrow because filled values carry no uncertainty.${st.method === 'mean' ? ' Mean imputation leaves the mean unchanged.' : ' Median imputation pulls the mean toward the median.'}${st.by || st.method === 'group-median' ? ` Using each ${st.by} group’s value keeps differences between groups, which is the better choice when values are missing at random given ${st.by} (MAR).` : ' If missingness depends on another column (MAR), one overall value is biased; fill within groups of that column instead.'}`;
    case 'drop-missing': return 'Deleting incomplete rows (listwise deletion) is unbiased only if the values are missing completely at random (MCAR). If whether a value is missing depends on another column, the rows that remain over-represent some groups and every statistic leans toward them. It also shrinks the sample and the precision of every estimate.';
    case 'flag-missing': return 'A missingness flag changes no values. It keeps the fact that a value was missing, so you can test whether missingness is related to other columns or to the outcome you study.';
    case 'validate': return st.action === 'drop' ? 'Deleting rows that break a rule removes the errors and every other value on those rows; if the errors are concentrated in one group, that group shrinks.' : st.action === 'set-missing' ? 'Setting impossible values to missing removes errors from the statistics, but they become missing values that still need a decision (and you lose the chance to correct them from another source).' : 'Flagging changes no values: it records which rows break the rule so you can decide later or analyse with and without them.';
    case 'outliers': return st.action === 'cap' ? 'Capping (winsorising) pulls extreme values to the fence: the mean and SD fall, the median stays where it is, and a genuine extreme loses its true size.' : st.action === 'drop' ? 'Deleting outliers moves the mean, shrinks the sample, and removes genuine extremes too (a real bulk order disappears from revenue). Correct errors; keep genuine values or analyse with and without them.' : 'Flagging changes no values. It records which values lie beyond the rule’s thresholds so you can investigate them one by one.';
    case 'transform': return st.fn === 'rescale' ? 'Rescaling puts values recorded in another unit on the right scale. It is correct only if the conversion rule fits every value it touches, so check the threshold and the rule.' : 'A log or square root compresses large values, reducing right skew and the pull of extremes. Differences become relative (a difference in logs is a ratio), and the mean of logged values back-transforms to the geometric mean, not the arithmetic mean.';
    case 'scale': return 'Scaling changes the units, not the shape: the order of values and their correlations with other columns stay the same. Learning the parameters from all rows lets test rows influence them (leakage); learn them from the training rows and apply the same parameters to the rest.';
    case 'encode': return st.method === 'ordinal' ? 'Ordinal codes impose an order and equal steps between levels. Use them only for categories with a genuine order, such as year of study.' : 'One-hot encoding turns each category into a 0/1 column a model can use. In a regression with an intercept, keep one column fewer than there are categories, or the columns are perfectly collinear.';
    case 'derive': return 'A derived column is only as good as its inputs: errors in either input carry into it, and a zero divisor gives a missing value.';
    case 'rename': return 'Renaming has no statistical effect; it makes the column easier to understand.';
    case 'drop-column': return 'Deleting a column loses its information for every later analysis. Do it when the column is constant, redundant or not needed, and say so in the report.';
    default: return '';
  }
}

// ---------------------------------------------------------------- the lab
/**
 * opts: { dataset (name | { columns, rows } | table), ops (allowed op ids; [] = inspect only), watch, task (html),
 *         goals, onProgress(met, total), report(event, detail), storageKey, headingLevel, name, title, rules, prepare }
 */
export function createLab(opts = {}) {
  const ops = Array.isArray(opts.ops) ? opts.ops.filter((o) => C.OPS.includes(o)) : C.OPS.slice();
  const H = opts.headingLevel || 3;
  const st = {
    name: '', title: '', raw: null, recipe: [], snaps: [], changes: [], issues: [], prof: [], rules: [], persist: false,
    watch: [], cat: '', compareTo: 'step', onlyIssues: false, page: 0, builder: null, preview: null, confirmReset: false, status: '', goals: [],
  };
  const slots = {};
  const lab = { st, ops, slots };
  const report = (ev, detail) => { try { opts.report?.(ev, detail); } catch { /* the host's report hook must never break the lab */ } };
  const cur = () => st.snaps[st.snaps.length - 1];
  const prev = () => st.snaps[Math.max(0, st.snaps.length - 2)];

  // ---- persistence
  const saved = () => store.get(opts.storageKey, null) || { version: 1, recipes: {} };
  function persist() {
    if (!opts.storageKey) return;
    const data = saved();
    if (st.persist) { data.recipes[st.name] = st.recipe; data.current = st.name; }
    store.set(opts.storageKey, data);
  }
  lab.savedRecipe = (name) => (opts.storageKey ? saved().recipes?.[name] || null : null);
  lab.savedCurrent = () => (opts.storageKey ? saved().current || null : null);

  // ---- loading
  lab.load = function load(table, { name, title, rules = [], persist = false, recipe = [] } = {}) {
    st.raw = table; st.name = name; st.title = title || name; st.rules = rules; st.persist = persist;
    st.recipe = []; st.snaps = [table]; st.changes = []; st.page = 0; st.preview = null; st.builder = null; st.confirmReset = false;
    const names = table.columns.map((c) => c.name);
    const meta = C.DATASETS[name];
    const prof0 = C.profile(table);
    const want = (opts.watch && opts.watch.length ? opts.watch : meta?.watch) || prof0.filter((p) => p.type === 'number').slice(0, 3).map((p) => p.name);
    st.watch = want.filter((w) => names.includes(w));
    st.cat = (meta?.category && names.includes(meta.category)) ? meta.category : (prof0.find((p) => p.type === 'category' || p.type === 'boolean')?.name || '');
    for (const step of recipe) { const r = C.apply(cur(), step); if (!r.change.error) { st.recipe.push(step); st.changes.push(r.change); st.snaps.push(r.table); } }
    refresh(false);
  };
  lab.loadName = async function loadName(name) {
    const t = await loadDataset(name);
    const meta = C.DATASETS[name];
    let table = t;
    if (opts.prepare?.length) table = C.run(t, opts.prepare).table;
    lab.load(table, { name, title: meta.title, rules: meta.rules, persist: !!opts.storageKey && !opts.prepare, recipe: lab.savedRecipe(name) || [] });
  };

  // ---- recipe
  lab.applyStep = (step) => {
    const r = C.apply(cur(), step);
    if (r.change.error) return r.change;
    st.recipe.push(step); st.changes.push(r.change); st.snaps.push(r.table);
    st.preview = null; st.compareTo = 'step'; st.confirmReset = false;
    report('step', { op: step.op, steps: st.recipe.length });
    refresh(true);
    return r.change;
  };
  lab.replay = (recipe) => {
    st.snaps = [st.raw]; st.changes = []; st.recipe = [];
    const skipped = [];
    recipe.forEach((step, i) => { const r = C.apply(cur(), step); if (r.change.error) skipped.push(`step ${i + 1}: ${r.change.error}`); else { st.recipe.push(step); st.changes.push(r.change); st.snaps.push(r.table); } });
    st.preview = null; st.confirmReset = false;
    refresh(true);
    return skipped;
  };
  lab.removeStep = (i) => lab.replay(st.recipe.filter((_, k) => k !== i));
  lab.undo = () => { if (!st.recipe.length) return; st.recipe.pop(); st.changes.pop(); st.snaps.pop(); st.preview = null; refresh(true); };
  lab.reset = () => { lab.replay([]); };

  // ---- recompute and render
  function refresh(changed) {
    const t = cur();
    st.prof = C.profile(t);
    st.issues = C.detectIssues(t, { rules: st.rules });
    if (opts.goals?.length) {
      st.goals = C.checkGoals(t, opts.goals);
      const met = st.goals.filter((g) => g.met).length;
      try { opts.onProgress?.(met, st.goals.length); } catch { /* host callback */ }
      report('goals', { met, total: st.goals.length });
      if (met === st.goals.length && changed) report('complete', { goals: st.goals.length });
    }
    if (st.page * 50 >= rowsForTable().length) st.page = 0;
    if (changed) persist();
    render();
  }
  lab.refresh = () => refresh(false);
  function render() { Object.keys(RENDER).forEach((k) => { if (slots[k]) RENDER[k](slots[k]); }); }
  lab.mount = (s0) => { Object.assign(slots, s0); if (st.raw) render(); };
  lab.say = (msg) => { st.status = msg; if (slots.status) slots.status.textContent = msg; };

  // ================================================================ panels
  const RENDER = {};

  // ---- goals and task
  RENDER.goals = (el) => {
    el.replaceChildren();
    if (opts.task) el.append(h('div', { class: 'cl-task' }, h('p', { class: 'cl-kicker' }, 'Your task'), h('p', {}, sanitize(opts.task))));
    if (!st.goals.length) return;
    const met = st.goals.filter((g) => g.met).length;
    el.append(
      h('p', { class: 'cl-goal-sum', role: 'status' }, h('strong', {}, `${met} of ${st.goals.length}`), ` goal${st.goals.length === 1 ? '' : 's'} met`),
      h('ul', { class: 'cl-goals', role: 'list' }, st.goals.map((g) => h('li', { class: g.met ? 'is-met' : '' },
        icon(g.met ? 'ok' : 'todo', g.met ? 'is-good' : ''),
        h('span', {}, h('span', { class: 'cl-goal-state' }, g.met ? 'Met: ' : 'Not yet: '), g.text, h('span', { class: 'cl-goal-detail' }, ` ${g.detail}.`))))));
  };

  // ---- column profiles
  RENDER.profile = (el) => {
    const rows = st.prof.map((p) => {
      let summary;
      if (p.type === 'number') summary = p.n ? `${num(p.min)} · ${num(p.median)} · ${num(p.max)} (min · median · max); mean ${num(p.mean)}, SD ${num(p.sd)}` : 'no readable numbers';
      else if (p.type === 'date') summary = p.min ? `${p.min} to ${p.max}${p.ambiguous ? `; ${p.ambiguous} ambiguous` : ''}` : 'no readable dates';
      else summary = p.top.slice(0, 3).map(([v, n]) => `${v.trim() === '' ? '(spaces)' : v} (${n})`).join(', ') + (p.unique > 3 ? `, … ${p.unique} values` : '');
      const stor = p.type === 'number' && p.storage === 'text' && p.formatted ? ' (some as text)' : p.type === 'date' && p.storage === 'text' ? ' (as text)' : '';
      return h('tr', {},
        h('th', { scope: 'row' }, p.name),
        h('td', {}, `${TYPE_LABEL[p.type] || p.type}${stor}`),
        h('td', { class: 'is-num' }, F.int(p.missing)),
        h('td', { class: 'is-num' }, p.invalid ? F.int(p.invalid) : '0'),
        h('td', { class: 'is-num' }, F.int(p.unique)),
        h('td', { class: 'cl-summary' }, summary));
    });
    el.replaceChildren(
      h('div', { class: 'table-scroll cl-scroll' }, h('table', { class: 'data-table cl-profile' },
        h('caption', { class: 'visually-hidden' }, `Column profiles of ${st.title}`),
        h('thead', {}, h('tr', {}, ['Column', 'Type', 'Missing', 'Invalid', 'Distinct', 'Summary'].map((c, i) => h('th', { scope: 'col', class: i >= 2 && i <= 4 ? 'is-num' : '' }, c)))),
        h('tbody', {}, rows))),
      h('p', { class: 'cl-note' }, 'Type is inferred from the values. “Invalid” counts values that don’t fit the type (text in a number column, unreadable dates). SD is the sample standard deviation (n − 1).'));
  };

  // ---- issues
  const canSuggest = (x) => x.suggestion && ops.includes(x.suggestion.op) && slots.builder;
  RENDER.issues = (el) => {
    el.replaceChildren();
    const t = cur();
    if (!st.issues.length) { el.append(h('p', { class: 'cl-ok' }, icon('ok', 'is-good'), h('span', {}, 'No issues detected. That doesn’t prove the data are right: a value can be wrong without breaking any rule.'))); return; }
    const main = ops.length && ops.length < C.OPS.length ? st.issues.filter((x) => x.suggestion && ops.includes(x.suggestion.op)) : st.issues;
    const rest = st.issues.filter((x) => !main.includes(x));
    const item = (x) => {
      const head = h('p', { class: 'cl-issue-head' },
        icon(x.severity === 'info' ? 'info' : 'error', `is-${x.severity}`),
        h('span', { class: 'cl-sev' }, { error: 'Problem', warning: 'Check', info: 'Note' }[x.severity] + ': '),
        h('strong', {}, x.title), x.column ? h('span', { class: 'cl-col' }, ` · ${x.column}`) : '', h('span', { class: 'cl-count' }, ` · ${plural(x.count, x.kind === 'skewed' ? 'value' : x.kind.includes('duplicate') ? 'row' : 'value')}`));
      const li = h('li', { class: `cl-issue is-${x.severity}` }, head, h('p', { class: 'cl-issue-msg' }, x.message));
      if (x.detail) li.append(h('p', { class: 'cl-issue-detail' }, x.detail));
      li.append(h('details', { class: 'cl-why' }, h('summary', {}, 'Why it matters'), h('p', {}, x.why)));
      if (canSuggest(x)) {
        const b = h('button', { class: 'btn btn-secondary cl-btn-sm', type: 'button' }, `Set up: ${C.describeStep(x.suggestion)}`);
        b.addEventListener('click', () => { lab.setBuilder(x.suggestion, x); slots.builder.querySelector('select, input, button')?.focus(); slots.builder.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('motion-paused') ? 'auto' : 'smooth' }); });
        li.append(h('p', { class: 'cl-issue-act' }, b));
      } else if (x.suggestion && ops.length) li.append(h('p', { class: 'cl-issue-detail' }, `Suggested step: ${C.describeStep(x.suggestion)} (not available here).`));
      return li;
    };
    el.append(h('p', { class: 'cl-note', role: 'status' }, `${plural(st.issues.length, 'issue')} in ${F.int(t.rows.length)} rows: ${st.issues.filter((x) => x.severity === 'error').length} problems, ${st.issues.filter((x) => x.severity === 'warning').length} to check, ${st.issues.filter((x) => x.severity === 'info').length} notes.`));
    el.append(h('ul', { class: 'cl-issues', role: 'list' }, main.map(item)));
    if (rest.length) el.append(h('details', { class: 'cl-more' }, h('summary', {}, `${plural(rest.length, 'other issue')} not covered by the steps available here`), h('ul', { class: 'cl-issues', role: 'list' }, rest.map(item))));
  };

  // ---- the data table with problem cells marked
  function flagMap() {
    const t = cur(), names = t.columns.map((c) => c.name);
    const cells = new Map(), rowsF = new Map();
    const put = (m, k, label) => { if (!m.has(k)) m.set(k, []); if (!m.get(k).includes(label)) m.get(k).push(label); };
    for (const x of st.issues) {
      if (x.kind === 'skewed' || x.kind === 'constant') continue;
      const label = x.title;
      if (x.kind === 'exact-duplicate' || x.kind === 'near-duplicate') x.rows.forEach((i) => put(rowsF, i, label));
      const cols = x.kind === 'rule' && x.rule ? [x.rule.column] : x.column ? [x.column] : [];
      cols.forEach((c) => { const j = names.indexOf(c); if (j >= 0) x.rows.forEach((i) => put(cells, `${i}|${j}`, label)); });
    }
    return { cells, rowsF };
  }
  function rowsForTable() {
    const t = cur();
    if (!st.onlyIssues) return t.rows.map((_, i) => i);
    const { cells, rowsF } = flagMap();
    const set = new Set([...rowsF.keys(), ...[...cells.keys()].map((k) => +k.split('|')[0])]);
    return t.rows.map((_, i) => i).filter((i) => set.has(i));
  }
  RENDER.table = (el) => {
    const t = cur();
    const { cells, rowsF } = flagMap();
    const list = rowsForTable();
    const pages = Math.max(1, Math.ceil(list.length / 50));
    const show = list.slice(st.page * 50, st.page * 50 + 50);
    const id = el.dataset.clid || (el.dataset.clid = nextId());
    const only = h('input', { type: 'checkbox', id: `${id}-only` });
    only.checked = st.onlyIssues;
    only.addEventListener('change', () => { st.onlyIssues = only.checked; st.page = 0; RENDER.table(el); el.querySelector(`#${id}-only`)?.focus(); });
    const pager = (d, label) => { const b = h('button', { class: 'btn btn-secondary cl-btn-sm', type: 'button', disabled: d < 0 ? st.page === 0 : st.page >= pages - 1 }, label); b.addEventListener('click', () => { st.page += d; RENDER.table(el); el.querySelector('.cl-pager .btn:not([disabled])')?.focus(); }); return b; };
    const prof = st.prof;
    const table = h('table', { class: 'data-table cl-data' },
      h('caption', { class: 'visually-hidden' }, `${st.title}: rows ${show.length ? `${st.page * 50 + 1} to ${st.page * 50 + show.length}` : 'none'}${st.onlyIssues ? ' with issues' : ''}. Cells with an issue are outlined and marked with a warning sign.`),
      h('thead', {}, h('tr', {}, h('th', { scope: 'col', class: 'is-num cl-rowh' }, 'Row'), t.columns.map((c, j) => h('th', { scope: 'col', class: prof[j]?.type === 'number' ? 'is-num' : '' }, h('span', { class: 'cl-colname' }, c.name), h('span', { class: 'cl-coltype' }, TYPE_LABEL[prof[j]?.type] || ''))))),
      h('tbody', {}, show.map((i) => {
        const r = t.rows[i];
        const rf = rowsF.get(i);
        const tr = h('tr', { class: rf ? 'is-flag-row' : '' },
          h('th', { scope: 'row', class: `is-num cl-rowh${rf ? ' is-flag' : ''}`, tabindex: rf ? '-1' : null }, String(t.ids?.[i] ?? i + 1), rf ? [icon('flag', 'cl-flag-icon'), h('span', { class: 'cl-flag-text' }, rf.join('; '))] : ''));
        r.forEach((v, j) => {
          const f = cells.get(`${i}|${j}`);
          const td = h('td', { class: `${typeof v === 'number' ? 'is-num' : ''}${f ? ' is-flag' : ''}`, tabindex: f ? '-1' : null }, cellNodes(v));
          if (f) td.append(icon('flag', 'cl-flag-icon'), h('span', { class: 'cl-flag-text' }, f.join('; ')));
          tr.append(td);
        });
        return tr;
      })));
    // one tab stop; arrow keys move between marked cells
    const marked = () => [...table.querySelectorAll('.is-flag')];
    const first = table.querySelector('.is-flag');
    if (first) first.tabIndex = 0;
    table.addEventListener('keydown', (e) => {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key) || !e.target.classList?.contains('is-flag')) return;
      const all = marked(); const k = all.indexOf(e.target);
      const next = e.key === 'Home' ? 0 : e.key === 'End' ? all.length - 1 : Math.max(0, Math.min(all.length - 1, k + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1)));
      e.preventDefault();
      all.forEach((c) => { c.tabIndex = -1; }); all[next].tabIndex = 0; all[next].focus();
      all[next].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
    el.replaceChildren(
      h('div', { class: 'cl-table-tools' },
        h('label', { class: 'check', for: `${id}-only` }, only, 'Show only rows with issues'),
        h('p', { class: 'cl-note', role: 'status' }, list.length ? `Rows ${F.int(st.page * 50 + 1)}–${F.int(st.page * 50 + show.length)} of ${F.int(list.length)}${st.onlyIssues ? ` with issues (${F.int(t.rows.length)} in all)` : ''}` : 'No rows to show.'),
        pages > 1 ? h('div', { class: 'cl-pager' }, pager(-1, 'Previous 50'), pager(1, 'Next 50')) : ''),
      h('div', { class: 'table-scroll cl-scroll cl-data-wrap', role: 'region', 'aria-label': `${st.title} data`, tabindex: first ? null : '0' }, table),
      h('p', { class: 'cl-note cl-legend' }, icon('flag', 'cl-flag-icon'), ' marks a cell or row with an issue (focus it, or move with the arrow keys, to read which). · shows a stray space. Numbers stored as numbers are right-aligned; text is left-aligned.'));
  };

  // ---- the operation builder
  const colNames = () => cur().columns.map((c) => c.name);
  const colsOfType = (...types) => st.prof.filter((p) => types.includes(p.type)).map((p) => p.name);
  function defaults(op) {
    const names = colNames(), nums = colsOfType('number'), text = colsOfType('category', 'text', 'boolean', 'id');
    const firstOf = (list) => list[0] || names[0];
    const iss = (kind) => st.issues.find((x) => x.kind === kind && x.suggestion?.op === op)?.suggestion;
    const fromIssue = st.issues.find((x) => x.suggestion?.op === op)?.suggestion;
    switch (op) {
      case 'dedupe': return { op };
      case 'dedupe-key': return iss('duplicate-key') || { op, columns: [firstOf(colsOfType('id'))], keep: 'first' };
      case 'trim': return fromIssue || { op, column: firstOf(text), all: false };
      case 'case': return fromIssue || { op, column: firstOf(text), to: 'lower' };
      case 'map': return fromIssue || { op, column: firstOf(colsOfType('category')), mapping: {} };
      case 'to-number': return fromIssue || { op, column: firstOf(nums), decimal: '.' };
      case 'to-date': return fromIssue || { op, column: firstOf(colsOfType('date')), order: 'auto', serial: false };
      case 'fill': return fromIssue || { op, column: firstOf(st.prof.filter((p) => p.missing).map((p) => p.name)), method: 'median' };
      case 'drop-missing': return { op, columns: [firstOf(st.prof.filter((p) => p.missing).map((p) => p.name))] };
      case 'flag-missing': return { op, column: firstOf(st.prof.filter((p) => p.missing).map((p) => p.name)) };
      case 'validate': return fromIssue || { op, column: firstOf(nums), rule: { min: 0 }, action: 'flag' };
      case 'outliers': return fromIssue || { op, column: firstOf(nums), method: 'iqr', k: 1.5, action: 'flag' };
      case 'transform': return fromIssue || { op, column: firstOf(nums), fn: 'log', as: `log_${firstOf(nums)}` };
      case 'scale': return { op, column: firstOf(nums.filter((n) => n !== opts.split)), method: 'zscore', fit: (Array.isArray(opts.fit) && opts.fit[0]) || 'train', ...(opts.split ? { split: opts.split } : { seed: 7 }) };
      case 'encode': return { op, column: firstOf(colsOfType('category', 'boolean').filter((n) => n !== opts.split)), method: 'onehot', dropFirst: false };
      case 'derive': return { op, as: 'new_column', fn: 'divide', from: [nums[0] || names[0], nums[1] || names[1] || names[0]] };
      case 'rename': return { op, from: names[0], to: '' };
      case 'drop-column': return { op, column: names[names.length - 1] };
      default: return { op };
    }
  }
  lab.setBuilder = (step, issue) => { st.builder = JSON.parse(JSON.stringify(step)); st.builder.fromIssue = issue ? issue.title : null; st.preview = null; if (slots.builder) RENDER.builder(slots.builder); };
  RENDER.builder = (el) => {
    if (!ops.length) { el.replaceChildren(); return; }
    if (!st.builder || !ops.includes(st.builder.op)) st.builder = defaults(ops[0]);
    const b = st.builder;
    const id = el.dataset.clid || (el.dataset.clid = nextId());
    const names = colNames();
    const field = (label, control, hint) => { const fid = control.id || (control.id = nextId()); return h('div', { class: 'field' }, h('label', { for: fid }, label), control, hint ? h('p', { class: 'field-hint' }, hint) : ''); };
    const group = (label, control, hint) => { const lid = nextId(); control.setAttribute('aria-labelledby', lid); return h('div', { class: 'field' }, h('span', { class: 'field-label', id: lid }, label), control, hint ? h('p', { class: 'field-hint' }, hint) : ''); };
    const select = (value, options, onChange) => {
      const sel = h('select', { class: 'select' }, options.map(([v, l]) => h('option', { value: v }, l)));
      sel.value = value ?? ''; sel.addEventListener('change', () => onChange(sel.value)); return sel;
    };
    const colSelect = (key, list = names, opt = false) => select(b[key], [...(opt ? [['', 'None']] : []), ...list.map((n) => [n, n])], (v) => { b[key] = v || undefined; afterColumnChange(key); });
    const text = (value, onInput, attrs = {}) => { const inp = h('input', { class: 'input', type: 'text', ...attrs }); inp.value = value ?? ''; inp.addEventListener('input', () => onInput(inp.value)); return inp; };
    const number = (value, onInput, attrs = {}) => { const inp = h('input', { class: 'input', type: 'number', step: 'any', ...attrs }); inp.value = value ?? ''; inp.addEventListener('input', () => onInput(inp.value === '' ? undefined : +inp.value)); return inp; };
    const check = (value, label, onChange) => { const cid = nextId(); const cb = h('input', { type: 'checkbox', id: cid }); cb.checked = !!value; cb.addEventListener('change', () => onChange(cb.checked)); return h('label', { class: 'check', for: cid }, cb, label); };
    const chipsOf = (key, list) => {
      const box = h('div', { class: 'chips cl-chips' });
      list.forEach((n) => { const cid = nextId(); const cb = h('input', { type: 'checkbox', id: cid, value: n }); cb.checked = (b[key] || []).includes(n); cb.addEventListener('change', () => { b[key] = [...box.querySelectorAll('input:checked')].map((x) => x.value); }); box.append(h('label', { class: 'chip', for: cid }, cb, h('span', {}, n))); });
      return box;
    };
    const rerender = () => { RENDER.builder(el); };
    const fitChoices = () => {
      const all = [['train', opts.split ? `Training rows only (${opts.split} = train)` : '70% training subset'], ['all', 'All rows']];
      const allow = Array.isArray(opts.fit) && opts.fit.length ? opts.fit : ['train', 'all'];
      return allow.map((v) => all.find((a) => a[0] === v)).filter(Boolean);
    };
    const fitGroup = (label, hint) => group(label, segmented(`${id}-fit`, fitChoices(), b.fit || fitChoices()[0][0], (v) => { b.fit = v; if (opts.split) b.split = opts.split; rerender(); }), hint);
    const afterColumnChange = (key) => {
      if (b.op === 'map' && key === 'column') b.mapping = {};
      if (b.op === 'transform' && key === 'column' && b.fn !== 'rescale') b.as = `${b.fn === 'sqrt' ? 'sqrt' : b.fn}_${b.column}`;
      rerender();
    };
    const opSel = select(b.op, ops.map((o) => [o, C.OP_LABELS[o]]), (v) => { st.builder = defaults(v); st.preview = null; rerender(); el.querySelector(`#${id}-op`)?.focus(); });
    opSel.id = `${id}-op`;
    const fields = [];
    const nums = colsOfType('number');
    switch (b.op) {
      case 'dedupe': fields.push(h('p', { class: 'cl-note' }, 'Removes every row that repeats an earlier row in every column. The first copy stays.')); break;
      case 'dedupe-key':
        fields.push(group('Key columns', chipsOf('columns', names), 'Rows with the same values in all of these columns count as one record.'));
        fields.push(group('Keep', segmented(`${id}-keep`, [['first', 'First'], ['last', 'Last'], ['most-complete', 'Most complete']], b.keep || 'first', (v) => { b.keep = v; }), 'Most complete keeps the row with the fewest missing cells (ties: the first).'));
        break;
      case 'trim':
        fields.push(check(b.all, 'Every text column', (v) => { b.all = v; rerender(); }));
        if (!b.all) fields.push(field('Column', colSelect('column')));
        fields.push(h('p', { class: 'field-hint' }, 'Removes leading and trailing spaces and turns runs of spaces into one, like a spreadsheet’s TRIM.'));
        break;
      case 'case':
        fields.push(field('Column', colSelect('column')));
        fields.push(group('Change to', segmented(`${id}-to`, [['lower', 'lower case'], ['upper', 'UPPER CASE'], ['title', 'Title Case']], b.to || 'lower', (v) => { b.to = v; })));
        break;
      case 'map': {
        fields.push(field('Column', colSelect('column')));
        const rows = Object.entries(b.mapping || {});
        const list = h('div', { class: 'cl-maplist' });
        const sync = () => { const m = {}; list.querySelectorAll('.cl-maprow').forEach((r) => { const [f, t2] = r.querySelectorAll('input'); if (f.value !== '') m[f.value] = t2.value; }); b.mapping = m; };
        const addRow = (from = '', to = '') => {
          const f = h('input', { class: 'input', type: 'text', 'aria-label': 'Value as it appears' }); f.value = from;
          const t2 = h('input', { class: 'input', type: 'text', 'aria-label': `Replace “${from}” with` }); t2.value = to;
          f.addEventListener('input', () => { t2.setAttribute('aria-label', `Replace “${f.value}” with`); sync(); }); t2.addEventListener('input', sync);
          const rm = h('button', { class: 'icon-btn icon-btn-sm', type: 'button', 'aria-label': `Remove the mapping for “${from}”` }, s('svg', { viewBox: '0 0 20 20', 'aria-hidden': 'true' }, s('path', { d: 'M6 6l8 8M14 6l-8 8', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round' })));
          const row = h('div', { class: 'cl-maprow' }, f, h('span', { class: 'cl-arrow', 'aria-hidden': 'true' }, '→'), t2, rm);
          rm.addEventListener('click', () => { const nextFocus = row.nextElementSibling?.querySelector('input') || addBtn; row.remove(); sync(); nextFocus.focus(); });
          list.append(row);
        };
        rows.forEach(([f, t2]) => addRow(f, t2));
        const sugBtn = h('button', { class: 'btn btn-secondary cl-btn-sm', type: 'button' }, 'Suggest a mapping');
        sugBtn.addEventListener('click', () => {
          const j = names.indexOf(b.column); if (j < 0) return;
          const targets = st.rules.find((r) => r.rule === 'in-set' && r.column === b.column)?.values;
          b.mapping = C.suggestMapping(cur().rows.map((r) => r[j]), { targets });
          rerender();
          const n = Object.keys(b.mapping).length;
          lab.say(n ? `Suggested ${plural(n, 'mapping')} for ${b.column}. Check each one before applying.` : `No spelling variants found in ${b.column}.`);
          el.querySelector('.cl-maprow input')?.focus();
        });
        const addBtn = h('button', { class: 'btn btn-secondary cl-btn-sm', type: 'button' }, 'Add a row');
        addBtn.addEventListener('click', () => { addRow(); list.lastElementChild.querySelector('input').focus(); });
        const j = names.indexOf(b.column);
        const distinct = j >= 0 ? [...new Map(cur().rows.filter((r) => !C.isMissing(r[j])).map((r) => [C.cellText(r[j]), 0])).keys()] : [];
        fields.push(h('div', { class: 'field' }, h('span', { class: 'field-label' }, `Mapping (${plural(rows.length, 'value')} to change)`), list, h('div', { class: 'input-actions' }, sugBtn, addBtn),
          h('p', { class: 'field-hint' }, `Exact matches only, spaces included. ${plural(distinct.length, 'different value')} in this column now.`)));
        break;
      }
      case 'to-number':
        fields.push(field('Column', colSelect('column')));
        fields.push(group('Decimal mark', segmented(`${id}-dec`, [['.', 'Point (1,234.50)'], [',', 'Comma (1.234,50)']], b.decimal || '.', (v) => { b.decimal = v; }), 'Values that don’t read with this mark are left as text and listed.'));
        break;
      case 'to-date':
        fields.push(field('Column', colSelect('column')));
        fields.push(field('Order of slash dates', select(b.order || 'auto', [['auto', 'Automatic: leave ambiguous dates alone'], ['DMY', 'Day first (DD/MM/YYYY)'], ['MDY', 'Month first (MM/DD/YYYY)'], ['YMD', 'Year first (YY/MM/DD)']], (v) => { b.order = v; }), 'With a fixed order, dates that can’t be read that way are left as text and listed.'));
        fields.push(check(b.serial, 'Read whole numbers as spreadsheet serial dates (1900 date system)', (v) => { b.serial = v; }));
        break;
      case 'fill':
        fields.push(field('Column', colSelect('column', st.prof.filter((p) => p.missing).map((p) => p.name).concat(names.filter((n) => !st.prof.find((p) => p.name === n)?.missing)))));
        fields.push(field('Fill with', select(b.method || 'median', [['mean', 'Mean'], ['median', 'Median'], ['mode', 'Most common value (mode)'], ['constant', 'A constant'], ['group-median', 'Median of each group']], (v) => { b.method = v; rerender(); })));
        if (b.method === 'constant') fields.push(field('Value', text(b.value, (v) => { b.value = v; })));
        if (b.method !== 'constant') fields.push(field(b.method === 'group-median' ? 'Groups defined by' : 'Within groups of (optional)', colSelect('by', names.filter((n) => n !== b.column), b.method !== 'group-median')));
        if (b.method !== 'constant') fields.push(fitGroup('Learn the value from', 'For modelling, learn it from the training rows only, so test rows don’t leak into it.'));
        break;
      case 'drop-missing': fields.push(group('Delete rows missing a value in', chipsOf('columns', names))); break;
      case 'flag-missing': fields.push(field('Column', colSelect('column'))); break;
      case 'validate': {
        const r = b.rule || (b.rule = {});
        fields.push(field('Column', colSelect('column')));
        fields.push(h('div', { class: 'field-row' }, field('Minimum', text(r.min, (v) => { r.min = v === '' ? undefined : v; }, { inputmode: 'decimal' })), field('Maximum', text(r.max, (v) => { r.max = v === '' ? undefined : v; }, { inputmode: 'decimal' }))));
        fields.push(check(r.integer, 'Whole numbers only', (v) => { r.integer = v; }));
        const ta = h('textarea', { class: 'textarea cl-textarea', rows: 3 }); ta.value = (r.in || []).join('\n'); ta.addEventListener('input', () => { const v = ta.value.split('\n').map((x) => x.trim()).filter(Boolean); r.in = v.length ? v : undefined; });
        fields.push(field('Allowed values (one per line, optional)', ta));
        fields.push(field('Pattern (regular expression, optional)', text(r.pattern, (v) => { r.pattern = v || undefined; }, { spellcheck: 'false' }), 'For an e-mail address: ^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$ . Dates as YYYY-MM-DD work as a minimum and maximum.'));
        fields.push(h('div', { class: 'field-row' },
          field('Compare with column (optional)', select(r.other || '', [['', 'None'], ...names.filter((n) => n !== b.column).map((n) => [n, n])], (v) => { r.other = v || undefined; if (v && !r.op) r.op = '>'; rerender(); })),
          field('Must be', select(r.op || '>', [['>', 'after / greater than'], ['>=', 'on or after / at least'], ['<', 'before / less than'], ['<=', 'on or before / at most'], ['!=', 'different from']], (v) => { r.op = v; }))));
        fields.push(field('Must equal this formula (optional)', text(r.expr, (v) => { r.expr = v.trim() || undefined; }, { spellcheck: 'false', placeholder: 'e.g. quantity * unit_price - discount' }), 'Use column names with + − * / and brackets; days_between(start, end) counts days between two date columns.'));
        fields.push(group('Values that break the rule', segmented(`${id}-act`, [['flag', 'Flag them'], ['set-missing', 'Set to missing'], ['drop', 'Delete the row']], b.action || 'flag', (v) => { b.action = v; })));
        break;
      }
      case 'outliers':
        fields.push(field('Column', colSelect('column', nums.length ? nums : names)));
        fields.push(group('Rule', segmented(`${id}-m`, [['iqr', 'IQR fences'], ['z', 'z-score'], ['mad', 'Modified z']], b.method || 'iqr', (v) => { b.method = v; b.k = v === 'iqr' ? 1.5 : v === 'z' ? 3 : 3.5; rerender(); })));
        fields.push(field(b.method === 'iqr' || !b.method ? 'k (fences at Q1 − k × IQR and Q3 + k × IQR)' : b.method === 'z' ? 'Threshold for |z|' : 'Threshold for |modified z|', number(b.k, (v) => { b.k = v; }, { min: 0.1, step: 0.1 }), { iqr: '1.5 is the usual inner fence; 3 the outer fence.', z: '3 is the usual threshold. The mean and SD include the outliers themselves.', mad: '3.5 is the threshold Iglewicz and Hoaglin recommend.' }[b.method || 'iqr']));
        fields.push(group('Then', segmented(`${id}-a`, [['flag', 'Flag'], ['cap', 'Cap at the threshold'], ['drop', 'Delete the row']], b.action || 'flag', (v) => { b.action = v; })));
        break;
      case 'transform':
        fields.push(field('Column', colSelect('column', nums.length ? nums : names)));
        fields.push(group('Function', segmented(`${id}-fn`, [['log', 'ln(x)'], ['log1p', 'ln(1 + x)'], ['sqrt', '√x'], ['rescale', 'Rescale']], b.fn || 'log', (v) => { b.fn = v; b.as = v === 'rescale' ? '' : `${v === 'sqrt' ? 'sqrt' : v}_${b.column}`; rerender(); })));
        if (b.fn === 'rescale') fields.push(h('div', { class: 'field-row' }, field('Multiply by', number(b.factor, (v) => { b.factor = v; })), field('Only values above (optional)', number(b.above, (v) => { b.above = v; }))));
        fields.push(field('New column name (leave empty to replace the values)', text(b.as, (v) => { b.as = v.trim() || undefined; }, { spellcheck: 'false' })));
        break;
      case 'scale':
        fields.push(field('Column', colSelect('column', nums.length ? nums : names)));
        fields.push(group('Method', segmented(`${id}-sm`, [['zscore', 'z-score'], ['minmax', 'Min-max'], ['robust', 'Robust']], b.method || 'zscore', (v) => { b.method = v; })));
        fields.push(fitGroup('Learn the parameters from', 'Learning from all rows leaks test-set information into the parameters.'));
        if (b.fit === 'train' && !opts.split) fields.push(field('Random seed for the split', number(b.seed ?? 7, (v) => { b.seed = v; }, { step: 1, min: 1 })));
        fields.push(field('New column name (leave empty to replace the values)', text(b.as, (v) => { b.as = v.trim() || undefined; }, { spellcheck: 'false' })));
        break;
      case 'encode': {
        fields.push(field('Column', colSelect('column')));
        const targets = nums.filter((n) => n !== b.column);
        const methods = [['onehot', 'One-hot (0/1 columns)'], ['ordinal', 'Ordinal or label codes'], ...(targets.length ? [['target', 'Target mean']] : [])];
        fields.push(group('Method', segmented(`${id}-em`, methods, b.method || 'onehot', (v) => { b.method = v; if (v === 'target') { b.target = b.target || (targets.includes(opts.target) ? opts.target : targets[0]); b.fit = b.fit || fitChoices()[0][0]; if (opts.split) b.split = opts.split; } rerender(); })));
        if ((b.method || 'onehot') === 'onehot') fields.push(check(b.dropFirst, 'Drop the first level (dummy coding: it becomes the reference category)', (v) => { b.dropFirst = v; }));
        else if (b.method === 'target') {
          fields.push(field('Target (the outcome to average)', colSelect('target', targets)));
          fields.push(fitGroup('Learn the means from', 'Means learned from all rows use each row’s own outcome: target leakage.'));
          fields.push(h('p', { class: 'field-hint' }, `Adds ${b.column}_target next to ${b.column}; values not seen in the fitting rows get the overall mean.`));
        } else {
          const j = names.indexOf(b.column);
          const levels = j >= 0 ? [...new Set(cur().rows.filter((r) => !C.isMissing(r[j])).map((r) => C.cellText(r[j])))].sort((a, c) => a.localeCompare(c, 'en', { numeric: true })) : [];
          if (!b.order) b.order = levels;
          const ta = h('textarea', { class: 'textarea cl-textarea', rows: Math.min(8, Math.max(3, levels.length)) }); ta.value = b.order.join('\n');
          ta.addEventListener('input', () => { b.order = ta.value.split('\n').filter((x) => x !== ''); });
          fields.push(field('Order, lowest first (one value per line)', ta, 'The first value gets code 0, the next 1, and so on.'));
        }
        break;
      }
      case 'derive': {
        const two = ['multiply', 'divide', 'add', 'subtract', 'days-between'].includes(b.fn);
        fields.push(field('New column name', text(b.as, (v) => { b.as = v.trim(); }, { spellcheck: 'false' })));
        fields.push(field('Calculation', select(b.fn, [['divide', 'A ÷ B'], ['multiply', 'A × B'], ['add', 'A + B'], ['subtract', 'A − B'], ['days-between', 'Days from date A to date B'], ['year', 'Year of a date'], ['month', 'Month of a date (1–12)'], ['weekday', 'Weekday of a date']], (v) => { b.fn = v; rerender(); })));
        const from = b.from || (b.from = [names[0], names[1]]);
        const fsel = (k, label) => field(label, select(from[k], names.map((n) => [n, n]), (v) => { from[k] = v; }));
        fields.push(two ? h('div', { class: 'field-row' }, fsel(0, 'A'), fsel(1, 'B')) : fsel(0, 'Date column'));
        break;
      }
      case 'rename':
        fields.push(field('Column', colSelect('from')));
        fields.push(field('New name', text(b.to, (v) => { b.to = v; }, { spellcheck: 'false' })));
        break;
      case 'drop-column': fields.push(field('Column', colSelect('column'))); break;
      default: break;
    }
    const why = h('textarea', { class: 'textarea cl-textarea', rows: 2, id: `${id}-why`, placeholder: 'For example: the shop system confirms day-first dates for web orders.' });
    why.value = b.why || '';
    why.addEventListener('input', () => { b.why = why.value; });
    const out = h('div', { class: 'cl-preview', 'aria-live': 'polite' });
    const stepNow = () => { const { fromIssue, ...stp } = b; if (!stp.why) delete stp.why; return JSON.parse(JSON.stringify(stp)); };
    const previewBtn = h('button', { class: 'btn btn-secondary', type: 'button' }, 'Preview');
    const applyBtn = h('button', { class: 'btn btn-primary', type: 'button' }, 'Apply');
    previewBtn.addEventListener('click', () => { const r = C.apply(cur(), stepNow()); st.preview = { step: stepNow(), change: r.change }; showPreview(out, r.change, cur(), true); });
    applyBtn.addEventListener('click', () => {
      const stp = stepNow();
      const ch = lab.applyStep(stp);
      if (ch.error) { showPreview(out, ch, cur(), false); return; }
      lab.say(`Applied step ${st.recipe.length}: ${C.describeStep(stp)}. ${ch.note}`);
      st.builder = defaults(stp.op);
      RENDER.builder(el);
      const o2 = el.querySelector('.cl-preview');
      if (o2) o2.replaceChildren(h('p', { class: 'cl-applied' }, icon('ok', 'is-good'), h('span', {}, h('strong', {}, `Applied as step ${st.recipe.length}. `), ch.note)));
      el.querySelector(`#${id}-op`)?.focus();
    });
    el.replaceChildren(
      b.fromIssue ? h('p', { class: 'cl-from' }, `Set up from the issue “${b.fromIssue}”. Check the settings, preview, then apply.`) : '',
      field('Operation', opSel),
      h('div', { class: 'cl-fields' }, fields),
      h('div', { class: 'field' }, h('label', { for: `${id}-why` }, 'Why this step? (optional; goes into the report)'), why),
      h('div', { class: 'input-actions' }, previewBtn, applyBtn),
      out);
    if (st.preview && st.preview.step.op === b.op) showPreview(out, st.preview.change, cur(), true);
  };
  function showPreview(out, ch, table, isPreview) {
    out.replaceChildren();
    if (ch.error) { out.append(h('div', { class: 'verdict is-bad cl-verdict', role: 'alert' }, icon('error'), h('p', {}, h('strong', {}, 'This step can’t be applied. '), ch.error))); return; }
    out.append(h('p', { class: 'cl-preview-note' }, h('strong', {}, isPreview ? 'Preview (nothing has changed yet): ' : ''), ch.note));
    out.append(h('p', { class: 'cl-note' }, `Rows ${F.int(ch.rowsBefore)} → ${F.int(ch.rowsAfter)} · ${plural(ch.cellsChanged, 'cell')} changed${ch.columnsAdded.length ? ` · new column${ch.columnsAdded.length > 1 ? 's' : ''}: ${ch.columnsAdded.join(', ')}` : ''}${ch.columnsRemoved.length ? ` · removed: ${ch.columnsRemoved.join(', ')}` : ''}`));
    if (ch.samples.length) out.append(h('div', { class: 'table-scroll cl-scroll' }, h('table', { class: 'data-table cl-samples' },
      h('caption', { class: 'visually-hidden' }, 'Examples of changed cells'),
      h('thead', {}, h('tr', {}, ['Row', 'Column', 'Before', 'After'].map((c) => h('th', { scope: 'col' }, c)))),
      h('tbody', {}, ch.samples.map(([i, c, bv, av]) => h('tr', {}, h('th', { scope: 'row' }, String(table.ids?.[i] ?? i + 1)), h('td', {}, c), h('td', {}, cellNodes(bv)), h('td', {}, cellNodes(av))))))));
    if (ch.removedRows.length) out.append(h('p', { class: 'cl-note' }, `Rows removed: ${ch.removedRows.slice(0, 20).map((i) => table.ids?.[i] ?? i + 1).join(', ')}${ch.removedRows.length > 20 ? ', …' : ''}`));
  }

  // ---- the recipe
  RENDER.recipe = (el) => {
    el.replaceChildren();
    if (!st.recipe.length) { el.append(h('p', { class: 'cl-note' }, ops.length ? 'No steps yet. Apply a step and it appears here; the table is always rebuilt from the raw data by replaying these steps in order.' : 'This view is for inspecting only.')); return; }
    const ol = h('ol', { class: 'cl-recipe' });
    st.recipe.forEach((stp, i) => {
      const ch = st.changes[i];
      const rm = h('button', { class: 'btn btn-ghost cl-btn-sm', type: 'button', 'aria-label': `Remove step ${i + 1}: ${C.describeStep(stp)}` }, 'Remove');
      rm.addEventListener('click', () => {
        const skipped = lab.removeStep(i);
        lab.say(`Removed step ${i + 1}; the table was rebuilt from the raw data.${skipped.length ? ` ${plural(skipped.length, 'later step')} no longer applied and ${skipped.length === 1 ? 'was' : 'were'} dropped: ${skipped.join('; ')}` : ''}`);
        (el.querySelector('.cl-recipe button') || el.querySelector('button'))?.focus();
      });
      ol.append(h('li', {}, h('div', { class: 'cl-step' }, h('p', { class: 'cl-step-title' }, C.describeStep(stp)), h('p', { class: 'cl-step-effect' }, `Rows ${F.int(ch.rowsBefore)} → ${F.int(ch.rowsAfter)} · ${plural(ch.cellsChanged, 'cell')} changed${ch.columnsAdded.length ? ` · +${ch.columnsAdded.length} column${ch.columnsAdded.length > 1 ? 's' : ''}` : ''}${ch.unresolved?.length ? ` · ${ch.unresolved.length} left unchanged` : ''}`), stp.why ? h('p', { class: 'cl-step-why' }, `Why: ${stp.why}`) : ''), rm));
    });
    const undo = h('button', { class: 'btn btn-secondary cl-btn-sm', type: 'button' }, 'Undo last step');
    undo.addEventListener('click', () => { const d = C.describeStep(st.recipe[st.recipe.length - 1]); lab.undo(); lab.say(`Undid: ${d}.`); (el.querySelector('.cl-recipe-actions .btn') || el.querySelector('button'))?.focus(); });
    const actions = h('div', { class: 'input-actions cl-recipe-actions' }, undo);
    if (!st.confirmReset) {
      const again = h('button', { class: 'btn btn-ghost cl-btn-sm', type: 'button' }, 'Start again');
      again.addEventListener('click', () => { st.confirmReset = true; RENDER.recipe(el); el.querySelector('.cl-confirm .btn')?.focus(); });
      actions.append(again);
    } else {
      const yes = h('button', { class: 'btn btn-primary cl-btn-sm', type: 'button' }, `Remove all ${plural(st.recipe.length, 'step')}`);
      const no = h('button', { class: 'btn btn-secondary cl-btn-sm', type: 'button' }, 'Keep them');
      yes.addEventListener('click', () => { lab.reset(); lab.say('Started again from the raw data.'); el.querySelector('button')?.focus(); });
      no.addEventListener('click', () => { st.confirmReset = false; RENDER.recipe(el); el.querySelector('.cl-recipe-actions .btn')?.focus(); });
      actions.append(h('span', { class: 'cl-confirm', role: 'group', 'aria-label': 'Confirm starting again' }, yes, no));
    }
    el.append(ol, actions);
  };

  // ---- consequences
  RENDER.consequences = (el) => {
    el.replaceChildren();
    const after = cur();
    const hasStep = st.recipe.length > 0;
    const base = st.compareTo === 'raw' || !hasStep ? st.raw : prev();
    const id = el.dataset.clid || (el.dataset.clid = nextId());
    const last = st.recipe[st.recipe.length - 1], lastCh = st.changes[st.changes.length - 1];
    if (hasStep) {
      el.append(h('p', { class: 'cl-last' }, h('strong', {}, `Step ${st.recipe.length}: ${C.describeStep(last)}. `), `Rows ${F.int(lastCh.rowsBefore)} → ${F.int(lastCh.rowsAfter)}; ${plural(lastCh.cellsChanged, 'cell')} changed.`));
      const lid = `${id}-cmp`;
      el.append(h('div', { class: 'field cl-inline' }, h('span', { class: 'field-label', id: lid }, 'Compare'), segmented(`${id}-cmpr`, [['step', 'Before and after the last step'], ['raw', 'Raw data and now']], st.compareTo, (v) => { st.compareTo = v; RENDER.consequences(el); el.querySelector(`input[value="${v}"]`)?.focus(); }, lid)));
    } else el.append(h('p', { class: 'cl-note' }, 'Apply a step to see what it changes. Until then, “before” and “after” are the same.'));
    // watched columns
    const names = [...new Set([...st.raw.columns.map((c) => c.name), ...after.columns.map((c) => c.name)])];
    const chipBox = h('div', { class: 'chips cl-chips' });
    names.forEach((n) => { const cid = nextId(); const cb = h('input', { type: 'checkbox', id: cid, value: n }); cb.checked = st.watch.includes(n); cb.addEventListener('change', () => { st.watch = [...chipBox.querySelectorAll('input:checked')].map((x) => x.value); RENDER.consequences(el); el.querySelector(`input[value="${CSS.escape(n)}"]`)?.focus(); }); chipBox.append(h('label', { class: 'chip', for: cid }, cb, h('span', {}, n))); });
    const wl = nextId();
    el.append(h('details', { class: 'cl-watchpick' }, h('summary', {}, `Watched columns (${st.watch.length})`), h('fieldset', { class: 'cl-fieldset' }, h('legend', { class: 'visually-hidden', id: wl }, 'Columns to watch'), chipBox)));
    const cmp = C.compare(base, after, { watch: st.watch });
    const nums = cmp.filter((x) => x.kind === 'number');
    const label = (x) => (x === 'raw' ? 'Raw' : 'Before');
    if (nums.length) {
      const stats = [['Values', 'count', (v) => F.int(v)], ['Missing', 'missing', (v) => F.int(v)], ['Mean', 'mean', num], ['Median', 'median', num], ['SD', 'sd', num], ['Min', 'min', num], ['Max', 'max', num]];
      el.append(h('div', { class: 'table-scroll cl-scroll' }, h('table', { class: 'data-table cl-stats' },
        h('caption', { class: 'cl-cap' }, 'Watched numbers'),
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Column'), h('th', { scope: 'col' }, 'Statistic'), h('th', { scope: 'col', class: 'is-num' }, label(st.compareTo === 'raw' || !hasStep ? 'raw' : 'step')), h('th', { scope: 'col', class: 'is-num' }, 'After'), h('th', { scope: 'col', class: 'is-num' }, 'Change'))),
        h('tbody', {}, nums.flatMap((x) => stats.map(([lab2, k, f], si) => {
          const bv = x.before?.[k], av = x.after?.[k];
          const d = Number.isFinite(bv) && Number.isFinite(av) ? av - bv : NaN;
          const changed = Number.isFinite(d) && Math.abs(d) > 1e-9 * Math.max(1, Math.abs(bv));
          return h('tr', { class: `${si === 0 ? 'cl-first' : ''}${changed ? ' is-changed' : ''}` },
            si === 0 ? h('th', { scope: 'rowgroup', rowspan: stats.length }, x.column) : '',
            h('th', { scope: 'row', class: 'cl-stat' }, lab2),
            h('td', { class: 'is-num' }, x.before ? f(bv) : 'not there'), h('td', { class: 'is-num' }, x.after ? f(av) : 'removed'),
            h('td', { class: 'is-num' }, changed ? `${d > 0 ? '+' : '−'}${f(Math.abs(d))}` : 'no change'));
        }))))));
    }
    cmp.filter((x) => x.kind === 'category').forEach((x) => el.append(shareTable(x, `Watched categories: ${x.column}`)));
    // shares of a chosen category
    const catOpts = st.prof.filter((p) => (p.type === 'category' || p.type === 'boolean') && p.unique <= 30).map((p) => p.name);
    if (catOpts.length) {
      if (!catOpts.includes(st.cat)) st.cat = catOpts[0];
      const sel = h('select', { class: 'select', id: `${id}-cat` }, catOpts.map((n) => h('option', { value: n }, n)));
      sel.value = st.cat;
      sel.addEventListener('change', () => { st.cat = sel.value; RENDER.consequences(el); el.querySelector(`#${id}-cat`)?.focus(); });
      el.append(h('div', { class: 'field cl-inline' }, h('label', { for: `${id}-cat` }, 'Shares of'), sel));
      const c = C.compare(base, after, { watch: [st.cat] })[0];
      if (c.kind === 'category') el.append(shareTable(c, `Share of each ${st.cat} value`));
    }
    if (hasStep) el.append(h('div', { class: 'cl-explain' }, h('p', { class: 'cl-kicker' }, 'What this kind of step can do to conclusions'), h('p', {}, consequenceText(last))));
  };
  function shareTable(x, caption) {
    const lv = new Map();
    (x.before?.levels || []).forEach(([v, n, sh]) => lv.set(v, { v, b: sh, bn: n, a: 0, an: 0 }));
    (x.after?.levels || []).forEach(([v, n, sh]) => { const e = lv.get(v) || { v, b: 0, bn: 0 }; e.a = sh; e.an = n; lv.set(v, e); });
    const list = [...lv.values()].sort((p, q) => (q.an || q.bn) - (p.an || p.bn)).slice(0, 12);
    const bar = (v) => h('span', { class: 'cl-bar', 'aria-hidden': 'true' }, h('i', { style: { width: `${Math.round((v || 0) * 100)}%` } }));
    return h('div', { class: 'table-scroll cl-scroll' }, h('table', { class: 'data-table cl-shares' },
      h('caption', { class: 'cl-cap' }, caption),
      h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Value'), h('th', { scope: 'col', class: 'is-num' }, st.compareTo === 'raw' || !st.recipe.length ? 'Raw' : 'Before'), h('th', { scope: 'col', class: 'is-num' }, 'After'), h('th', { scope: 'col', class: 'is-num' }, 'Change'))),
      h('tbody', {}, list.map((e) => h('tr', {},
        h('th', { scope: 'row' }, cellNodes(e.v)),
        h('td', { class: 'is-num' }, h('span', { class: 'cl-sharecell' }, bar(e.b), `${pct(e.b)} (${F.int(e.bn)})`)),
        h('td', { class: 'is-num' }, h('span', { class: 'cl-sharecell' }, bar(e.a), `${pct(e.a)} (${F.int(e.an)})`)),
        h('td', { class: 'is-num' }, Math.abs(e.a - e.b) < 1e-12 ? 'no change' : `${e.a > e.b ? '+' : '−'}${(Math.abs(e.a - e.b) * 100).toFixed(1)} pts`)))),
      h('tfoot', {}, h('tr', {}, h('th', { scope: 'row' }, 'Missing'), h('td', { class: 'is-num' }, F.int(x.before?.missing ?? 0)), h('td', { class: 'is-num' }, F.int(x.after?.missing ?? 0)), h('td', {}, ''))),
    ), h('p', { class: 'cl-note' }, 'Shares are of the rows that have a value.'));
  }

  // ---- export
  RENDER.export = (el) => {
    const t = cur();
    const base = (st.name || 'data').replace(/[^\w-]+/g, '-');
    const reportText = () => C.qualityReport(st.raw, t, st.recipe, { name: st.title, rules: st.rules, watch: st.watch });
    const btn = (label, fn) => { const b = h('button', { class: 'btn btn-secondary', type: 'button' }, label); b.addEventListener('click', fn); return b; };
    const pre = h('pre', { class: 'cl-report' });
    const det = h('details', { class: 'cl-reportbox' }, h('summary', {}, 'Read the data quality report here'), pre);
    det.addEventListener('toggle', () => { if (det.open) pre.textContent = reportText(); });
    const file = h('input', { type: 'file', accept: '.json,application/json', class: 'visually-hidden', id: `${el.dataset.clid || (el.dataset.clid = nextId())}-recipe` });
    file.addEventListener('change', async () => {
      const f = file.files[0]; if (!f) return;
      try {
        const steps = JSON.parse(await f.text());
        if (!Array.isArray(steps) || steps.some((x) => !x || !C.OPS.includes(x.op))) throw new Error('The file is not a recipe: it must be a list of steps with known operations.');
        const notAllowed = steps.filter((x) => !ops.includes(x.op));
        if (notAllowed.length) throw new Error(`The recipe uses operations not available here: ${[...new Set(notAllowed.map((x) => x.op))].join(', ')}.`);
        const skipped = lab.replay(steps);
        lab.say(`Replayed ${plural(st.recipe.length, 'step')} from ${f.name}.${skipped.length ? ` Skipped: ${skipped.join('; ')}` : ''}`);
      } catch (e) { lab.say(`Couldn’t use that recipe: ${e.message}`); }
      file.value = '';
    });
    el.replaceChildren(
      h('div', { class: 'input-actions' },
        btn('Download cleaned CSV', () => { download(`${base}-clean.csv`, C.toCSV(t)); lab.say(`Downloaded ${base}-clean.csv (${plural(t.rows.length, 'row')}).`); }),
        btn('Download recipe (JSON)', () => { download(`${base}-recipe.json`, `${JSON.stringify(st.recipe, null, 2)}\n`, 'application/json'); lab.say(`Downloaded ${base}-recipe.json (${plural(st.recipe.length, 'step')}).`); }),
        btn('Download data quality report (Markdown)', () => { download(`${base}-quality-report.md`, reportText(), 'text/markdown;charset=utf-8'); lab.say(`Downloaded ${base}-quality-report.md.`); }),
        h('label', { class: 'btn btn-ghost file-btn', for: file.id }, 'Replay a recipe file', file)),
      st.recipe.length ? h('ol', { class: 'cl-readable' }, st.recipe.map((x) => h('li', {}, C.describeStep(x), x.why ? h('span', { class: 'cl-step-why' }, ` (why: ${x.why})`) : ''))) : h('p', { class: 'cl-note' }, 'The recipe is empty, so the cleaned CSV is the raw data.'),
      det);
  };

  RENDER.status = (el) => { el.textContent = st.status; };
  return lab;
}

/**
 * The lab in one element, panels stacked (used by the lesson widget and the B02 project page).
 * opts as createLab, plus export (show the export panel; default true when ops are given).
 */
export async function mountLab(el, opts = {}) {
  const lab = createLab(opts);
  const H = opts.headingLevel || 3;
  const inspectOnly = !lab.ops.length;
  const part = (cls, title, body, intro) => { const id = nextId(); return h('section', { class: `cl-part ${cls}`, 'aria-labelledby': id }, heading(H, title, { id }), intro ? h('p', { class: 'cl-intro' }, intro) : '', body); };
  const box = () => h('div');
  const s0 = { goals: box(), profile: box(), issues: box(), table: box(), status: h('p', { class: 'cl-status', role: 'status', 'aria-live': 'polite' }) };
  if (!inspectOnly) Object.assign(s0, { builder: box(), recipe: box(), consequences: box() });
  if (!inspectOnly && opts.export !== false) s0.export = box();
  el.classList.add('cl-lab', inspectOnly ? 'is-inspect' : 'is-full');
  el.replaceChildren(h('p', { class: 'cl-loading' }, 'Loading the data…'));
  try {
    if (typeof opts.dataset === 'string') await lab.loadName(opts.dataset);
    else if (opts.dataset && opts.dataset.rows) {
      const t = opts.dataset.ids ? opts.dataset : C.tableFrom(opts.dataset);
      lab.load(opts.prepare?.length ? C.run(t, opts.prepare).table : t, { name: opts.name || 'table', title: opts.title || 'The table', rules: opts.rules || [] });
    } else throw new Error('No dataset given.');
  } catch (e) {
    el.replaceChildren(h('p', { class: 'error-text', role: 'alert' }, `The data couldn’t be loaded: ${e.message}`));
    return lab;
  }
  const profDet = h('details', { class: 'cl-profilebox' }, h('summary', {}, 'Column profiles'), s0.profile);
  if (inspectOnly) profDet.open = true;
  el.replaceChildren(
    opts.task || opts.goals?.length ? h('div', { class: 'cl-part cl-goalsbox' }, s0.goals) : '',
    part('cl-inspect', 'Inspect', h('div', {}, profDet, s0.issues), inspectOnly ? 'Read the profile and the issues, then look at the marked cells in the table.' : null),
    part('cl-tablepart', 'The data', s0.table),
    inspectOnly ? '' : part('cl-clean', 'Clean', h('div', { class: 'cl-cleangrid' }, h('div', { class: 'cl-builder' }, s0.builder), h('div', { class: 'cl-recipebox' }, heading(H + 1, 'Recipe'), s0.recipe))),
    s0.status,
    inspectOnly ? '' : part('cl-cons', 'What changed', s0.consequences),
    s0.export ? part('cl-export', 'Export', s0.export, 'Everything is generated in this browser; nothing is uploaded.') : '');
  lab.mount(s0);
  return lab;
}
