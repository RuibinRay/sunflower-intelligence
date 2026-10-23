#!/usr/bin/env node
// study-check.mjs — checks Learn course content against assets/js/data/study/AUTHORING.md.
//   node tools/study-check.mjs f01/accounting-equation    one lesson (content + exercises)
//   node tools/study-check.mjs f01                         a whole course: lessons, assessments, project
//   node tools/study-check.mjs                             every built course
// Exit code 1 if any error. Warnings are printed but don't fail.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  catalog, BUILT, DATA, chartFor, chartSync, caseFor, lessonsOf, loadLesson, loadEx, loadModuleFile, blocks, blockWords,
  inline, tex, tagProblems, strings, words, strip, sum, glossKey,
} from './study/lib.mjs';

const VERBS = /^(Explain|Describe|Define|Identify|Distinguish|Classify|Calculate|Compute|Record|Prepare|Analyse|Apply|Interpret|Evaluate|Compare|Choose|Decide|Use|Recognise|State|Construct|Build|Post|Journalise|Find|Detect|Diagnose|Handle|Transform|Scale|Encode|Write|Document|Justify|Recommend|Estimate|Assess|Plan|Design|Set|Measure|Select|Determine|Correct|Locate|Read|Summarise|Reshape|Combine|Profile|Validate|Clean|Convert|Standardise|Normalise|Map|Draft|Price|Forecast|Test|Name|List|Contrast|Close|Adjust|Trace|Reconcile)\b/;
const KINDS = ['conceptual', 'numerical', 'applied'];
const TYPES = ['mc', 'multi', 'num', 'fill', 'classify', 'order', 'journal', 'equation', 'rows', 'short', 'steps'];
const WIDGETS = ['formula', 'chart', 'equation', 'journal', 'ledger', 'statements', 'cleaning', 'distribution', 'mixsim', 'plc'];
const DATASETS = ['lantern-orders', 'harborview-bookings', 'northfield-students'];
const CLEAN_OPS = ['dedupe', 'dedupe-key', 'trim', 'case', 'map', 'to-number', 'to-date', 'fill', 'drop-missing', 'flag-missing', 'validate', 'outliers', 'transform', 'scale', 'encode', 'derive', 'rename', 'drop-column'];
const near = (a, b, tol) => Math.abs(a - b) <= tol + 1e-9;
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);

class Report {
  constructor(name) { this.name = name; this.errors = []; this.warnings = []; this.stats = {}; }
  err(m) { this.errors.push(m); }
  warn(m) { this.warnings.push(m); }
}

function straightQuotes(s) {
  const prose = String(s).replace(/<m>[\s\S]*?<\/m>|<M>[\s\S]*?<\/M>/g, '').replace(/<[^>]+>/g, '');
  return /[A-Za-z]'[A-Za-z]|(^|\s)'[A-Za-z]|"[A-Za-z]/.test(prose);
}

// ---------------------------------------------------------------- exercises
const exIds = new Map(); // id -> where, for course-wide uniqueness

function checkExercise(x, where, r, { course, chart, needHints = false, inSteps = false, assessment = false, caseMod }) {
  if (!x || typeof x !== 'object') { r.err(`${where}: not an object`); return; }
  if (!x.id || typeof x.id !== 'string') r.err(`${where}: missing id`);
  else if (exIds.has(x.id)) r.err(`${where}: id ${x.id} already used at ${exIds.get(x.id)}`);
  else exIds.set(x.id, where);
  const w = `${where} (${x.id})`;
  if (!TYPES.includes(x.type)) { r.err(`${w}: unknown type ${x.type}`); return; }
  if (inSteps && x.type === 'steps') r.err(`${w}: steps can't contain steps`);
  if (!inSteps && !KINDS.includes(x.kind)) r.err(`${w}: kind must be conceptual, numerical or applied`);
  if (!x.prompt || typeof x.prompt !== 'string') r.err(`${w}: missing prompt`);
  for (const [p, s] of strings(x)) {
    for (const prob of tagProblems(s, `${w}.${p}`, { exercise: true })) r.err(prob);
    if (straightQuotes(s)) r.warn(`${w}.${p}: straight quote or apostrophe; use ’ “ ”`);
  }
  if (!inSteps && !x.solution && x.type !== 'short') r.err(`${w}: missing solution`);
  if (needHints && x.type !== 'steps' && !(Array.isArray(x.hints) && x.hints.length)) r.err(`${w}: guided items need at least one hint`);
  if (assessment && x.hints?.length) r.warn(`${w}: assessment items shouldn't have hints`);
  const nOpts = (x.options || []).length;
  switch (x.type) {
    case 'mc': {
      if (nOpts < 3) r.err(`${w}: mc needs at least 3 options`);
      if (!Number.isInteger(x.answer) || x.answer < 0 || x.answer >= nOpts) r.err(`${w}: answer must index an option`);
      const fb = x.feedback || {};
      for (const k of Object.keys(fb)) { if (+k === x.answer) r.err(`${w}: feedback given for the right answer (use why)`); if (+k >= nOpts) r.err(`${w}: feedback for missing option ${k}`); }
      if (Object.keys(fb).length < Math.min(2, nOpts - 1)) r.warn(`${w}: give feedback for the wrong options students are likely to pick`);
      if (x.options?.some((o) => /all of the above|none of the above/i.test(o))) r.warn(`${w}: avoid “all/none of the above” (options are shuffled)`);
      break;
    }
    case 'multi': {
      if (nOpts < 3) r.err(`${w}: multi needs at least 3 options`);
      if (!Array.isArray(x.answer) || !x.answer.length || x.answer.some((a) => !Number.isInteger(a) || a < 0 || a >= nOpts)) r.err(`${w}: answer must be a non-empty list of option indexes`);
      if (!/(all that apply|select all|choose all|every)/i.test(x.prompt || '')) r.warn(`${w}: say “select all that apply” in the prompt`);
      break;
    }
    case 'num': {
      if (!Number.isFinite(x.answer)) { r.err(`${w}: answer must be a number`); break; }
      if (typeof x.check !== 'function') r.err(`${w}: num items need check: () => <independent calculation>`);
      const tol = x.tol ?? Math.max(0.005, Math.abs(x.answer) * 0.005);
      if (typeof x.check === 'function') {
        let v; try { v = x.check(); } catch (e) { r.err(`${w}: check() threw ${e.message}`); }
        if (Number.isFinite(v) && !near(v, x.answer, tol)) r.err(`${w}: check() gives ${v}, answer is ${x.answer}`);
      }
      (x.wrong || []).forEach((wv, i) => { if (!Number.isFinite(wv.value) || !wv.say) r.err(`${w}: wrong[${i}] needs value and say`); else if (near(wv.value, x.answer, tol)) r.err(`${w}: wrong[${i}] value is within tolerance of the answer`); });
      if (x.unit === undefined) r.warn(`${w}: give a unit ('$', '%', 'units', '' …) so the student knows what to enter`);
      break;
    }
    case 'fill': {
      const n = (x.blanks || []).length;
      if (!n) r.err(`${w}: fill needs blanks`);
      for (let i = 0; i < n; i++) if (!String(x.text || '').includes(`[[${i}]]`)) r.err(`${w}: text has no [[${i}]]`);
      (x.blanks || []).forEach((b, i) => {
        if (b.options) { if (!Number.isInteger(b.answer) || b.answer < 0 || b.answer >= b.options.length) r.err(`${w}: blank ${i} answer must index its options`); }
        else if (!Array.isArray(b.accept) || !b.accept.length) r.err(`${w}: blank ${i} needs options+answer or accept`);
      });
      break;
    }
    case 'classify': {
      const ni = (x.items || []).length, nc = (x.categories || []).length;
      if (ni < 2 || nc < 2) r.err(`${w}: classify needs items and categories`);
      if (!Array.isArray(x.answer) || x.answer.length !== ni || x.answer.some((a) => !Number.isInteger(a) || a < 0 || a >= nc)) r.err(`${w}: answer must give a category index for every item`);
      break;
    }
    case 'order': if ((x.items || []).length < 3) r.err(`${w}: order needs at least 3 items`); break;
    case 'journal': {
      const lines = x.lines || [];
      if (lines.length < 2) r.err(`${w}: a journal entry needs at least two lines`);
      const dr = sum(lines.map((l) => l.dr || 0)), cr = sum(lines.map((l) => l.cr || 0));
      if (!near(dr, cr, 0.005)) r.err(`${w}: key does not balance (${dr} vs ${cr})`);
      const jc = x.chart && x.chart.includes('/') ? chartSync(x.chart) : chart;   // a project may use its own business's chart
      if (!jc) r.err(`${w}: journal items need a chart of accounts${x.chart ? ` (“${x.chart}” not found)` : ''}`);
      else lines.forEach((l) => { if (!jc[l.acct]) r.err(`${w}: account "${l.acct}" not in chart`); });
      if (x.accounts) { x.accounts.forEach((a) => { if (jc && !jc[a]) r.err(`${w}: accounts list has "${a}", not in chart`); }); lines.forEach((l) => { if (!x.accounts.includes(l.acct)) r.err(`${w}: key account "${l.acct}" missing from accounts list`); }); }
      break;
    }
    case 'equation': {
      const a = x.answer || {};
      if (![a.assets, a.liabilities, a.equity].every(Number.isFinite)) r.err(`${w}: answer needs assets, liabilities, equity`);
      else if (!near(a.assets, a.liabilities + a.equity, 0.005)) r.err(`${w}: answer breaks the equation (${a.assets} ≠ ${a.liabilities} + ${a.equity})`);
      break;
    }
    case 'rows': {
      const n = x.data?.table?.rows?.length || 0;
      if (!n) r.err(`${w}: rows needs data.table`);
      if (!Array.isArray(x.answer) || x.answer.some((i) => !Number.isInteger(i) || i < 0 || i >= n)) r.err(`${w}: answer must list row indexes`);
      break;
    }
    case 'short': {
      if (!Array.isArray(x.rubric) || x.rubric.length < 2) r.err(`${w}: short needs a rubric of at least 2 criteria`);
      if (!x.model) r.err(`${w}: short needs a model answer`);
      break;
    }
    case 'steps': {
      if (!Array.isArray(x.steps) || x.steps.length < 2) { r.err(`${w}: steps needs at least 2 steps`); break; }
      x.steps.forEach((s, i) => checkExercise(s, `${w}.steps[${i}]`, r, { course, chart, needHints, inSteps: true, assessment, caseMod }));
      break;
    }
    default: break;
  }
  if (x.data?.table) {
    const t = x.data.table;
    if (t.head && t.rows) t.rows.forEach((row, i) => { if (row.length !== t.head.length) r.err(`${w}: data.table row ${i} has ${row.length} cells, header has ${t.head.length}`); });
  }
}

// ---------------------------------------------------------------- widgets
function resolveTransactions(list, caseMod, w, r) {
  const all = [...(caseMod?.MARCH || []), ...(caseMod?.MARCH_ADJUSTMENTS || [])];
  return (list || []).map((t, i) => {
    if (typeof t === 'string') { const f = all.find((x) => x.id === t); if (!f) r.err(`${w}: transaction "${t}" not found in case.js`); return f; }
    if (!t?.lines?.length) r.err(`${w}: transaction ${i} needs lines`);
    return t;
  }).filter(Boolean);
}
function checkWidget(id, wd, r, { chart, caseMod }) {
  const w = `widgets.${id}`;
  if (!WIDGETS.includes(wd?.type)) { r.err(`${w}: unknown widget type ${wd?.type}`); return; }
  for (const [p, s] of strings(wd)) for (const prob of tagProblems(s, `${w}.${p}`, { exercise: true })) r.err(prob);
  if (wd.type === 'formula') {
    if (!Array.isArray(wd.inputs) || !wd.inputs.length) r.err(`${w}: formula needs inputs`);
    if (typeof wd.compute !== 'function') { r.err(`${w}: formula needs compute(v)`); return; }
    (wd.inputs || []).forEach((inp) => {
      if (!(inp.min < inp.max) || inp.value < inp.min || inp.value > inp.max || !(inp.step > 0)) r.err(`${w}: input ${inp.id} needs min < value ≤ max and a positive step`);
      if (!['money', 'pct', 'int', 'num'].includes(inp.fmt)) r.err(`${w}: input ${inp.id} fmt must be money, pct, int or num`);
    });
    const base = Object.fromEntries((wd.inputs || []).map((i) => [i.id, i.value]));
    const trials = [['defaults', base]];
    (wd.inputs || []).forEach((i) => { trials.push([`${i.id}=min`, { ...base, [i.id]: i.min }]); trials.push([`${i.id}=max`, { ...base, [i.id]: i.max }]); });
    for (const [label, v] of trials) {
      let out; try { out = wd.compute({ ...v }); } catch (e) { r.err(`${w}: compute threw at ${label}: ${e.message}`); continue; }
      if (out?.error) continue;
      if (!out?.headline?.label || out.headline.value == null || !Array.isArray(out.rows)) r.err(`${w}: compute at ${label} must return { headline: {label, value}, rows, note }`);
      if (/NaN|Infinity|undefined/.test(JSON.stringify(out))) r.err(`${w}: compute at ${label} produced NaN, Infinity or undefined`);
      if (out.chart) { const n = out.chart.x?.values?.length; (out.chart.series || []).forEach((s) => { if (s.values.length !== n) r.err(`${w}: chart series ${s.name} length ≠ x length at ${label}`); }); }
    }
  } else if (wd.type === 'chart') {
    const n = wd.x?.values?.length;
    if (!n) r.err(`${w}: chart needs x.values`);
    (wd.series || []).forEach((s) => { if (s.values?.length !== n) r.err(`${w}: series ${s.name} length ≠ x length`); });
  } else if (['equation', 'journal', 'ledger', 'statements'].includes(wd.type)) {
    const txs = resolveTransactions(wd.transactions, caseMod, w, r);
    if (!txs.length) r.err(`${w}: needs transactions`);
    txs.forEach((t) => {
      const dr = sum(t.lines.map((l) => l.dr || 0)), cr = sum(t.lines.map((l) => l.cr || 0));
      if (!near(dr, cr, 0.005)) r.err(`${w}: transaction ${t.id || t.text} does not balance`);
      t.lines.forEach((l) => { if (chart && !chart[l.acct]) r.err(`${w}: account "${l.acct}" not in chart`); });
    });
  } else if (wd.type === 'cleaning') {
    if (typeof wd.dataset === 'string' && !DATASETS.includes(wd.dataset)) r.err(`${w}: unknown dataset ${wd.dataset}`);
    if (typeof wd.dataset === 'object' && !(wd.dataset.columns && wd.dataset.rows)) r.err(`${w}: inline dataset needs columns and rows`);
    (wd.ops || []).forEach((o) => { if (!CLEAN_OPS.includes(o)) r.err(`${w}: unknown op ${o}`); });
  } else if (wd.type === 'distribution') {
    if (!(wd.values?.length || (DATASETS.includes(wd.dataset) && wd.column))) r.err(`${w}: needs values, or dataset and column`);
  } else if (wd.type === 'mixsim') {
    const ok = ['tier', 'range', 'price', 'channels', 'promotion'];
    Object.keys(wd.lock || {}).forEach((k) => { if (!ok.includes(k)) r.err(`${w}: lock.${k} is not a decision`); });
  }
}

// ---------------------------------------------------------------- one lesson
export async function checkLesson(course, slug, { courseTerms } = {}) {
  const r = new Report(`${course}/${slug}`);
  const L = await loadLesson(course, slug);
  const X = await loadEx(course, slug);
  const chart = await chartFor(course);
  const caseMod = await caseFor(course);
  if (!L) { r.err('lesson file missing'); return r; }
  const ctx = { chart, errors: [], terms: [] };
  // fields
  if (L.slug !== slug) r.err(`slug "${L.slug}" ≠ file name "${slug}"`);
  for (const k of ['title', 'blurb']) if (!L[k] || typeof L[k] !== 'string') r.err(`missing ${k}`);
  if (!['draft', 'reviewed'].includes(L.status)) r.err('status must be draft or reviewed');
  if (!Array.isArray(L.objectives) || L.objectives.length < 3 || L.objectives.length > 6) r.err('objectives: 3–6 needed');
  (L.objectives || []).forEach((o, i) => { if (!VERBS.test(strip(o))) r.warn(`objectives[${i}] should start with a measurable verb: “${strip(o).slice(0, 40)}…”`); });
  (L.prerequisites || []).forEach((p, i) => {
    if (p.lesson) { const [c, s] = p.lesson.split('/'); const cc = catalog.COURSE[c]; if (!cc?.modules?.some((m) => m.lessons.includes(s))) r.err(`prerequisites[${i}]: ${p.lesson} is not a lesson in the catalog`); if (!p.why) r.warn(`prerequisites[${i}]: say why`); }
    else if (p.plate) { /* a short lesson elsewhere on the site */ }
    else if (!p.text) r.err(`prerequisites[${i}]: needs lesson, plate or text`);
  });
  if (L.case != null && !catalog.CASES[L.case]) r.err(`case "${L.case}" is not in catalog CASES`);
  // a TeX command typed in an ordinary string loses its backslash: "\times" becomes a tab and "imes", "\frac" a form feed and "rac"
  const ctrl = (obj, where) => { for (const [p, str] of strings(obj)) { const m = str.match(/[\t\f\v\b\r]/); if (m) r.err(`${where}${p ? `.${p}` : ''}: contains a control character (${JSON.stringify(m[0])}); write TeX backslashes as \\\\ or use String.raw`); for (const seg of str.match(/<m>[\s\S]*?<\/m>/gi) || []) { const lost = seg.replace(/\\text\{[^}]*\}/g, '').match(/(?<![\\a-zA-Z])(times|div|approx|cdot|frac|dfrac|sqrt|leq|geq|neq|pm|sum|tilde|bar|hat|Delta|sigma|infty|quad|left|right)(?![a-zA-Z])/); if (/\\\\[a-zA-Z]/.test(seg)) r.err(`${where}${p ? `.${p}` : ''}: a doubled backslash before a command inside <m> (a String.raw string needs single backslashes)`); if (lost) r.err(`${where}${p ? `.${p}` : ''}: “${lost[1]}” inside <m> has lost its backslash (in an ordinary string write \\\\${lost[1]})`); }
      if (/<m>[^<]*(?<!\\)%[^<]*<\/m>/i.test(str)) r.err(`${where}${p ? `.${p}` : ''}: an unescaped % inside <m> starts a TeX comment; write \\%`); } };
  ctrl(L, 'lesson');
  if (X) for (const k of ['guided', 'independent', 'check']) ctrl(X[k] || [], k);
  for (const part of ['concept', 'theory', 'application']) {
    if (!Array.isArray(L[part]) || !L[part].length) r.err(`${part}: needs blocks`);
    else blocks(L[part], ctx, part);
  }
  // formulas
  const fids = new Set();
  (L.formulas || []).forEach((f, i) => {
    const w = `formulas[${i}]`;
    if (!f.id || !f.name || !f.tex) r.err(`${w}: needs id, name, tex`);
    if (fids.has(f.id)) r.err(`${w}: duplicate id ${f.id}`); fids.add(f.id);
    try { tex(f.tex, true); } catch (e) { r.err(`${w}: TeX error: ${e.message}`); }
    if (/\\\\[a-zA-Z]/.test(f.tex || '') || /[\t\f\b\v]/.test(f.tex || '')) r.err(`${w}: tex has a doubled backslash or a control character: write it with String.raw and single backslashes`);
    if (!Array.isArray(f.where) || !f.where.length) r.err(`${w}: define every symbol in where`);
    (f.where || []).forEach((row, j) => { if (!Array.isArray(row) || row.length < 3) r.err(`${w}.where[${j}]: [symbol TeX, meaning, unit]`); else { try { tex(row[0]); } catch (e) { r.err(`${w}.where[${j}]: TeX error: ${e.message}`); } } });
    for (const k of ['assumptions', 'note']) if (f[k]) inline(f[k], ctx, `${w}.${k}`);
  });
  // examples
  const levels = (L.examples || []).map((e) => e.level);
  if (!levels.includes('simple') || !levels.includes('challenging')) r.err('examples: need at least one simple and one challenging');
  (L.examples || []).forEach((e, i) => {
    const w = `examples[${i}]`;
    if (!['simple', 'challenging', 'applied'].includes(e.level)) r.err(`${w}: level must be simple, challenging or applied`);
    if (typeof e.fictional !== 'boolean') r.err(`${w}: set fictional: true or false`);
    if (!e.title || !e.setup || !e.answer || !e.interpretation) r.err(`${w}: needs title, setup, answer, interpretation`);
    if (!Array.isArray(e.steps) || e.steps.length < 3) r.err(`${w}: at least 3 steps`);
    for (const [p, s] of strings(e)) inline(s, ctx, `${w}.${p}`);
    if (e.journal) blocks([{ journal: e.journal }], ctx, `${w}.journal`);
    if (e.table) blocks([{ table: e.table }], ctx, `${w}.table`);
    if (e.statement) blocks([{ statement: e.statement }], ctx, `${w}.statement`);
  });
  // demo
  if (!Array.isArray(L.demo)) r.err('demo: must be an array');
  else if (!L.demo.length) r.warn('demo: no interactive demonstration');
  (L.demo || []).forEach((d, i) => { if (!X?.widgets?.[d.widget]) r.err(`demo[${i}]: widget "${d.widget}" not in the .ex.js widgets`); if (d.intro) inline(d.intro, ctx, `demo[${i}].intro`); });
  // mistakes, summary, glossary, references
  if (!Array.isArray(L.mistakes) || L.mistakes.length < 3 || L.mistakes.length > 6) r.err('mistakes: 3–6 needed');
  (L.mistakes || []).forEach((m, i) => { if (!m.title || !m.html) r.err(`mistakes[${i}]: needs title and html`); else inline(m.html, ctx, `mistakes[${i}]`); });
  if (!Array.isArray(L.summary) || L.summary.length < 4 || L.summary.length > 8) r.err('summary: 4–8 points');
  (L.summary || []).forEach((s, i) => inline(s, ctx, `summary[${i}]`));
  if (!Array.isArray(L.glossary) || L.glossary.length < 3) r.err('glossary: at least 3 terms');
  const gl = new Set();
  (L.glossary || []).forEach((g, i) => { if (!g.term || !g.def) r.err(`glossary[${i}]: needs term and def`); const k = glossKey(g.term); if (gl.has(k)) r.err(`glossary: "${g.term}" twice`); gl.add(k); inline(g.def, ctx, `glossary[${i}]`); });
  if (!Array.isArray(L.references) || L.references.length < 2) r.err('references: at least 2');
  (L.references || []).forEach((ref, i) => {
    if (!ref.text) r.err(`references[${i}]: needs text`);
    if (ref.url && !/^https:\/\//.test(ref.url)) r.err(`references[${i}]: url must be https`);
    if (ref.checked == null) r.warn(`references[${i}]: not verified (checked: null) — will show as “not yet verified”`);
    else if (!isDate(ref.checked)) r.err(`references[${i}]: checked must be YYYY-MM-DD or null`);
  });
  // checks
  if (!Array.isArray(L.checks)) r.err('checks: must be an array');
  (L.checks || []).forEach((c, i) => {
    if (!Number.isFinite(c.value) || !Number.isFinite(c.shown)) { r.err(`checks[${i}] (${c.what}): value and shown must be numbers`); return; }
    if (!near(c.value, c.shown, c.tol ?? 0.005)) r.err(`checks[${i}] (${c.what}): computed ${c.value}, text shows ${c.shown}`);
  });
  // typography and tags
  for (const [p, s] of strings(L)) {
    if (/^(checks|references\[\d+\]\.url)/.test(p)) continue;
    if (straightQuotes(s)) r.warn(`${p}: straight quote or apostrophe; use ’ “ ”`);
    if (/In this lesson,? we will|Let's dive|let us dive/i.test(s)) r.warn(`${p}: filler opening`);
  }
  // words
  const nWords = blockWords(L.concept) + blockWords(L.theory) + blockWords(L.application);
  r.stats.words = nWords;
  if (nWords < 900) r.err(`only ${nWords} words in concept + theory + application (aim for 1,800–3,500)`);
  else if (nWords < 1500 || nWords > 4500) r.warn(`${nWords} words in concept + theory + application (aim for 1,800–3,500)`);
  // exercises
  if (!X) r.err('exercise file (.ex.js) missing');
  else {
    if (!X.widgets || typeof X.widgets !== 'object') r.err('ex: export const widgets = { … } (may be {})');
    for (const [id, wd] of Object.entries(X.widgets || {})) checkWidget(id, wd, r, { chart, caseMod });
    const sets = [['guided', 3, 4, true], ['independent', 4, 6, false], ['check', 5, 6, false]];
    for (const [name, lo, hi, needHints] of sets) {
      const list = X[name];
      if (!Array.isArray(list)) { r.err(`ex: export const ${name} = [ … ]`); continue; }
      if (list.length < lo || list.length > hi) r.warn(`ex.${name}: ${list.length} items (aim for ${lo}–${hi})`);
      list.forEach((x, i) => checkExercise(x, `${name}[${i}]`, r, { course, chart, needHints, caseMod }));
    }
    const kinds = new Set((X.check || []).map((x) => x.kind));
    for (const k of KINDS) if (!kinds.has(k)) r.err(`ex.check: needs at least one ${k} question`);
    if ((X.check || []).some((x) => x.type === 'short')) r.err('ex.check: short (self-marked) items can’t be in the knowledge check');
    r.stats.exercises = (X.guided?.length || 0) + (X.independent?.length || 0) + (X.check?.length || 0);
  }
  // glossary links
  for (const t of ctx.terms) {
    const k = glossKey(t.term);
    if (!gl.has(k) && !(courseTerms && courseTerms.has(k))) r.warn(`${t.where}: <g>${t.term}</g> has no glossary entry in this or an earlier lesson`);
  }
  if (courseTerms) for (const k of gl) courseTerms.add(k);
  ctx.errors.forEach((e) => r.err(e));
  r.stats.examples = (L.examples || []).length;
  r.stats.formulas = (L.formulas || []).length;
  return r;
}

// ---------------------------------------------------------------- assessments
async function checkAssessments(course) {
  const r = new Report(`${course} assessments`);
  const c = catalog.COURSE[course];
  const chart = await chartFor(course);
  const caseMod = await caseFor(course);
  const slugs = new Set(c.modules.flatMap((m) => m.lessons));
  const itemsCheck = (items, where, { lo, hi, lessonsAllowed }) => {
    if (!Array.isArray(items)) { r.err(`${where}: export const items = [ … ]`); return; }
    if (items.length < lo || items.length > hi) r.warn(`${where}: ${items.length} items (aim for ${lo}–${hi})`);
    items.forEach((x, i) => {
      checkExercise(x, `${where}[${i}]`, r, { course, chart, assessment: true, caseMod });
      if (!x.lesson || !slugs.has(x.lesson)) r.err(`${where}[${i}] (${x.id}): lesson "${x.lesson}" is not in this course`);
      else if (lessonsAllowed && !lessonsAllowed.has(x.lesson)) r.err(`${where}[${i}] (${x.id}): lesson "${x.lesson}" is not in this module`);
      if (x.type === 'short') r.err(`${where}[${i}]: self-marked items can’t be in a scored assessment`);
    });
    const kinds = new Set(items.map((x) => x.kind));
    for (const k of KINDS) if (!kinds.has(k)) r.warn(`${where}: no ${k} items`);
    return items;
  };
  for (const m of c.modules) {
    const f = await loadModuleFile(course, `assess-m${m.n}`);
    if (!f) { r.warn(`assess-m${m.n}.js missing`); continue; }
    const items = itemsCheck(f.items, `assess-m${m.n}`, { lo: 8, hi: 12, lessonsAllowed: new Set(m.lessons) });
    for (const s of m.lessons) if (items && !items.some((x) => x.lesson === s)) r.warn(`assess-m${m.n}: no item on ${s}`);
  }
  const d = await loadModuleFile(course, 'assess-diagnostic');
  if (!d) r.warn('assess-diagnostic.js missing');
  else {
    itemsCheck(d.items, 'assess-diagnostic', { lo: 8, hi: 12 });
    if (!Array.isArray(d.route) || !d.route.length) r.err('assess-diagnostic: needs route');
  }
  const fin = await loadModuleFile(course, 'assess-final');
  if (!fin) r.warn('assess-final.js missing');
  else itemsCheck(fin.items, 'assess-final', { lo: 20, hi: 25 });
  const pj = await loadModuleFile(course, 'project');
  if (!pj) r.warn('project.js missing');
  else {
    const P = pj.default || pj.project;
    for (const st of P?.stages || []) for (const x of [...(st.items || []), ...(st.items || []).flatMap((y) => y.steps || [])]) if (x.chart?.includes('/')) await chartFor(x.chart);
    if (P?.verify) { try { for (const [what, value, shown, tol = 0.005] of P.verify()) if (Math.abs(value - shown) > tol) r.err(`project: ${what}: computed ${value}, shown ${shown}`); } catch (e) { r.err(`project.verify threw: ${e.message}`); } }
    if (!P?.title || !P?.brief || !Array.isArray(P?.stages) || !P.stages.length) r.err('project: needs title, brief and stages');
    (P?.stages || []).forEach((s, i) => (s.items || []).forEach((x, j) => checkExercise(x, `project.stages[${i}].items[${j}]`, r, { course, chart, caseMod })));
    if (!Array.isArray(P?.rubric) || P.rubric.length < 3) r.warn('project: give a rubric of at least 3 criteria');
  }
  return r;
}

// ---------------------------------------------------------------- run
export async function checkCourse(course, { strict = false } = {}) {
  exIds.clear();
  const reports = [];
  const terms = new Set();
  for (const { slug } of lessonsOf(course)) {
    if (!existsSync(join(DATA, course, `${slug}.js`))) { const r = new Report(`${course}/${slug}`); (strict ? r.err.bind(r) : r.warn.bind(r))('not written yet'); reports.push(r); continue; }
    reports.push(await checkLesson(course, slug, { courseTerms: terms }));
  }
  reports.push(await checkAssessments(course));
  return reports;
}

/** The catalogue's study order and paths: a course never comes before a course it requires (or, within a school,
 *  one it recommends), and every path lists a required course before the course that needs it. */
export function checkCatalog() {
  const r = new Report('catalog');
  const pos = Object.fromEntries(catalog.ORDER.map((id, i) => [id, i]));
  for (const c of catalog.COURSES) {
    for (const p of [...c.requires, ...c.recommends]) {
      if (!catalog.COURSE[p]) { r.err(`${c.code}: prerequisite "${p}" is not a course`); continue; }
      if (catalog.COURSE[p].school === c.school && pos[p] > pos[c.id]) r.err(`${c.code} comes before ${catalog.COURSE[p].code}, which it ${c.requires.includes(p) ? 'requires' : 'recommends'}: fix ORDER`);
    }
  }
  for (const path of catalog.PATHS) {
    path.courses.forEach((id, i) => {
      const c = catalog.COURSE[id];
      if (!c) { r.err(`path ${path.id}: "${id}" is not a course`); return; }
      c.requires.forEach((p) => { const j = path.courses.indexOf(p); if (j > i) r.err(`path ${path.id}: ${c.code} is listed before ${catalog.COURSE[p].code}, which it requires`); });
    });
    if (!path.courses.some((id) => catalog.COURSE[id].modules)) r.warn(`path ${path.id}: no course in it is built yet`);
  }
  return r;
}

function print(reports) {
  let errs = 0, warns = 0;
  for (const r of reports) {
    errs += r.errors.length; warns += r.warnings.length;
    const s = r.stats.words != null ? ` · ${r.stats.words} words · ${r.stats.examples} examples · ${r.stats.exercises ?? 0} exercises` : '';
    console.log(`\n${r.errors.length ? '✗' : '✓'} ${r.name}${s}`);
    r.errors.forEach((e) => console.log(`   error   ${e}`));
    r.warnings.forEach((w) => console.log(`   warning ${w}`));
  }
  console.log(`\n${errs} error${errs === 1 ? '' : 's'}, ${warns} warning${warns === 1 ? '' : 's'}`);
  return errs;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = process.argv[2];
  let reports = [];
  if (arg && arg.includes('/')) {
    const [course, slug] = arg.split('/');
    exIds.clear();
    // seed glossary terms from earlier lessons so <g> links to them don't warn
    const terms = new Set();
    for (const l of lessonsOf(course)) { if (l.slug === slug) break; const E = await loadLesson(course, l.slug); (E?.glossary || []).forEach((g) => terms.add(glossKey(g.term))); }
    reports = [await checkLesson(course, slug, { courseTerms: terms })];
  } else {
    if (!arg) reports.push(checkCatalog());
    for (const c of arg ? [arg] : BUILT.map((x) => x.id)) reports.push(...await checkCourse(c));
  }
  process.exit(print(reports) ? 1 : 0);
}
