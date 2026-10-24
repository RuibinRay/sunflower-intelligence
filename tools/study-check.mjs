#!/usr/bin/env node
// study-check.mjs — checks Learn course content against assets/js/data/study/AUTHORING.md.
//   node tools/study-check.mjs f01/accounting-equation    one lesson (content + exercises)
//   node tools/study-check.mjs f01                         a whole course: lessons, assessments, project
//   node tools/study-check.mjs                             every built course
// Exit code 1 if any error. Warnings are printed but don't fail.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import * as SH from '../assets/js/core/sheet.js';
import { ols } from '../assets/js/core/stats.js';
import {
  catalog, BUILT, DATA, chartFor, chartSync, caseFor, lessonsOf, loadLesson, loadEx, loadModuleFile, blocks, blockWords,
  inline, tex, tagProblems, strings, words, strip, sum, glossKey,
} from './study/lib.mjs';

const VERBS = /^(Explain|Describe|Define|Identify|Distinguish|Classify|Calculate|Compute|Record|Prepare|Analyse|Apply|Interpret|Evaluate|Compare|Choose|Decide|Use|Recognise|State|Construct|Build|Post|Journalise|Find|Detect|Diagnose|Handle|Transform|Scale|Encode|Write|Document|Justify|Recommend|Estimate|Assess|Plan|Design|Set|Measure|Select|Determine|Correct|Locate|Read|Summarise|Reshape|Combine|Profile|Validate|Clean|Convert|Standardise|Normalise|Map|Draft|Price|Forecast|Test|Name|List|Contrast|Close|Adjust|Trace|Reconcile)\b/;
const KINDS = ['conceptual', 'numerical', 'applied'];
const TYPES = ['mc', 'multi', 'num', 'fill', 'classify', 'order', 'journal', 'equation', 'rows', 'short', 'formula', 'steps'];
const WIDGETS = ['formula', 'chart', 'equation', 'journal', 'ledger', 'statements', 'cleaning', 'distribution', 'mixsim', 'plc', 'sheet', 'pivot', 'regression'];
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
  const prose = String(s).replace(/<m>[\s\S]*?<\/m>|<M>[\s\S]*?<\/M>|<x>[\s\S]*?<\/x>/g, '').replace(/<[^>]+>/g, '');
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
      // the default drop-down leaves out summary accounts (Income Summary), so an item whose key uses one must list its accounts
      else if (jc) lines.forEach((l) => { if (jc[l.acct]?.type === 'summary') r.err(`${w}: key uses "${l.acct}", which the default account list leaves out: give the item an accounts list`); });
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
    case 'formula': checkFormulaItem(x, w, r); break;
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

// ---------------------------------------------------------------- spreadsheet items and widgets (B03)
/** Every formula in a sheet spec parses, uses known functions and evaluates; returns the Sheet. */
function checkSheetSpec(spec, w, r, { allowErrors = [] } = {}) {
  if (!spec?.cells || typeof spec.cells !== 'object') { r.err(`${w}: needs sheet.cells`); return null; }
  let sh;
  try { sh = new SH.Sheet(spec); } catch (e) { r.err(`${w}: sheet could not be built: ${e.message}`); return null; }
  for (const [a, v] of Object.entries(spec.cells)) {
    if (!SH.parseAddr(a)) r.err(`${w}: "${a}" is not a cell address`);
    if (typeof v === 'string' && v.startsWith('=')) {
      try { SH.parse(v); } catch (e) { r.err(`${w}: ${a} ${v} doesn’t parse: ${e.message}`); continue; }
      const unknown = [...SH.functionsUsed(v)].filter((n) => !SH.FUNCTIONS.includes(n));
      if (unknown.length) r.err(`${w}: ${a} uses ${unknown.join(', ')}, which the sheet engine doesn’t have`);
      const val = sh.get(a);
      if (SH.isErr(val) && !allowErrors.includes(a)) r.err(`${w}: ${a} ${v} gives ${val.code} (list it in allowErrors if that is the point)`);
    }
  }
  for (const [n, t] of Object.entries(spec.tables || {})) if (!SH.parseRange(t)) r.err(`${w}: table ${n} range ${t} is not a range`);
  for (const [a, vals] of Object.entries(spec.vary || {})) {
    if (!(a in spec.cells)) r.err(`${w}: vary names ${a}, which has no value in cells`);
    else if (!Array.isArray(vals) || !vals.length) r.err(`${w}: vary.${a} must be a list of values`);
    else if (vals.some((v) => v === spec.cells[a])) r.err(`${w}: vary.${a} repeats the cell’s own value, so a copy wouldn’t differ`);
  }
  return sh;
}
function checkFormulaItem(x, w, r) {
  const sh = checkSheetSpec(x.sheet, `${w}.sheet`, r, { allowErrors: x.allowErrors || [] });
  if (!sh) return;
  const at = SH.parseAddr(x.cell || '');
  if (!at) { r.err(`${w}: cell must be an address like F2`); return; }
  if (x.fill) { const rg = SH.parseRange(x.fill); if (!rg || rg.r0 !== at.r || rg.c0 !== at.c) r.err(`${w}: fill ${x.fill} must start at the cell ${x.cell}`); }
  const view = SH.parseRange(x.view || '');
  if (!view) r.err(`${w}: needs view (the range shown, like A1:F13)`);
  else { const t = SH.parseRange(x.fill || x.cell); if (t && (t.r0 < view.r0 || t.c0 < view.c0 || t.r1 > view.r1 || t.c1 > view.c1)) r.err(`${w}: view ${x.view} doesn’t show ${x.fill || x.cell}`); }
  if (x.sheet.cells[x.cell] != null) r.err(`${w}: ${x.cell} already holds something in the sheet; the student's formula goes there`);
  if (typeof x.answer !== 'string' || !x.answer.startsWith('=')) { r.err(`${w}: answer must be a formula starting with =`); return; }
  try { SH.parse(x.answer); } catch (e) { r.err(`${w}: answer doesn’t parse: ${e.message}`); return; }
  const unknown = [...SH.functionsUsed(x.answer)].filter((n) => !SH.FUNCTIONS.includes(n));
  if (unknown.length) { r.err(`${w}: answer uses ${unknown.join(', ')}, which the sheet engine doesn’t have`); return; }
  (x.require || []).forEach((n) => { if (!SH.functionsUsed(x.answer).has(n.toUpperCase())) r.err(`${w}: require lists ${n} but the answer doesn’t use it`); });
  const g = (formula) => SH.gradeFormula(x.sheet, { cell: x.cell, fill: x.fill, formula, answer: x.answer, require: x.require || [], variants: x.variants ?? 3 });
  const self = g(x.answer);
  if (!self.ok) r.err(`${w}: the answer doesn’t pass its own marking: ${self.message}`);
  self.results.forEach((res) => { if (SH.isErr(res.want) && !(x.allowErrors || []).includes(res.cell)) r.err(`${w}: the answer gives ${res.want.code} in ${res.cell}`); });
  if (!x.fill) {
    const v = self.results[0]?.want;
    const lit = typeof v === 'number' ? `=${v}` : typeof v === 'string' ? `="${v.replace(/"/g, '""')}"` : typeof v === 'boolean' ? `=${v ? 'TRUE' : 'FALSE'}` : null;
    if (lit && g(lit).ok) r.err(`${w}: typing the result (${lit}) would pass; the changed-data copies don’t change it (check fixed, or that the answer depends on numbers)`);
  }
  (x.wrong || []).forEach((wf, i) => {
    if (!wf?.formula || !wf.say) { r.err(`${w}: wrong[${i}] needs formula and say`); return; }
    try { SH.parse(wf.formula); } catch (e) { r.err(`${w}: wrong[${i}] doesn’t parse: ${e.message}`); return; }
    if (g(wf.formula).ok) r.err(`${w}: wrong[${i}] ${wf.formula} is marked right, so it isn’t a wrong answer`);
  });
  // the page picks the slip whose results match the student's; between slips with the same results it prefers the one
  // typed exactly, then the one with the same functions. Two slips with the same results and the same functions are
  // told apart only when typed exactly as written, so any other spelling of either gets the first one's feedback.
  const slips = (x.wrong || []).filter((wf) => { try { SH.parse(wf?.formula || ''); return true; } catch { return false; } });
  const fns = (f) => [...SH.functionsUsed(f)].sort().join();
  slips.forEach((b, j) => slips.slice(0, j).forEach((a) => {
    if (fns(a.formula) !== fns(b.formula)) return;
    const same = SH.gradeFormula(x.sheet, { cell: x.cell, fill: x.fill, formula: b.formula, answer: a.formula, variants: x.variants ?? 3 }).ok;
    if (same) r.warn(`${w}: wrong ${b.formula} gives the same results as ${a.formula} with the same functions; the page tells them apart only when typed exactly, so make the first feedback fit both or merge them`);
  }));
  (x.alt || []).forEach((a, i) => { const res = g(a); if (!res.ok) r.err(`${w}: alt[${i}] ${a} should be accepted but isn’t: ${res.message}`); });
}
/** Cells a prompt tells the student to change (“Change D10 to 60”) that no sheet widget lets them edit. */
function lockedChanges(texts, widgets) {
  const sheets = widgets.filter((wd) => wd?.type === 'sheet');
  if (!sheets.length) return [];
  const editable = (wd, a) => {
    const p = SH.parseAddr(a); const inR = (rg) => rg && p.r >= rg.r0 && p.r <= rg.r1 && p.c >= rg.c0 && p.c <= rg.c1;
    const list = wd.editable === undefined || wd.editable === true ? [wd.view] : wd.editable ? (Array.isArray(wd.editable) ? wd.editable : [wd.editable]) : [];
    return list.some((x) => inR(SH.parseRange(x || '')));
  };
  const out = [];
  for (const t of texts) for (const m of String(t || '').matchAll(/\bchange\s+(?:cell\s+)?\$?([A-Z]{1,3})\$?(\d{1,7})\b/gi)) {
    const a = `${m[1].toUpperCase()}${m[2]}`;
    if (!sheets.some((wd) => editable(wd, a))) out.push(a);
  }
  return [...new Set(out)];
}
function checkSheetWidget(wd, w, r) {
  const sh = checkSheetSpec(wd.sheet, `${w}.sheet`, r, { allowErrors: wd.allowErrors || [] });
  if (!sh) return;
  if (!SH.parseRange(wd.view || '')) r.err(`${w}: needs view`);
  const TOOLS = ['formulas', 'fill', 'goalseek', 'datatable', 'solver', 'cf', 'reset'];
  (wd.tools || []).forEach((t) => { if (!TOOLS.includes(t)) r.err(`${w}: unknown tool ${t}`); });
  const tools = wd.tools || [];
  if (tools.includes('goalseek') && wd.goalseek) {
    const gs = wd.goalseek;
    if (!sh.isFormula(gs.target)) r.err(`${w}: goalseek.target ${gs.target} must hold a formula`);
    if (sh.isFormula(gs.changing)) r.err(`${w}: goalseek.changing ${gs.changing} must hold a value`);
    else if (!SH.goalSeek(sh, gs).ok) r.err(`${w}: Goal Seek doesn’t converge for the default settings`);
  }
  if (tools.includes('datatable') && wd.datatable) {
    const dt = wd.datatable;
    if (!sh.isFormula(dt.target)) r.err(`${w}: datatable.target must hold a formula`);
    if (!(dt.values || []).length) r.err(`${w}: datatable needs values`);
  }
  if (tools.includes('solver')) {
    const sv = wd.solver;
    if (!sv?.objective || !sv.changing?.length) r.err(`${w}: solver needs objective and changing`);
    else {
      const res = SH.solveSheet(sh, sv);
      if (!res.ok && (sv.expect || 'optimal') === 'optimal') r.err(`${w}: Solver finds no optimum for the default model (${res.status})`);
    }
  }
  (wd.rules || []).forEach((ru, i) => { if (!SH.parseRange(ru.range || '')) r.err(`${w}: rules[${i}] needs a range`); });
  (wd.controls || []).forEach((c, i) => {
    if (!SH.parseAddr(c.cell || '')) r.err(`${w}: controls[${i}] needs a cell`);
    if (!Array.isArray(c.options) || c.options.length < 2) r.err(`${w}: controls[${i}] needs at least two options`);
    if (sh.isFormula(c.cell)) r.err(`${w}: controls[${i}] sets ${c.cell}, which holds a formula`);
  });
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
  } else if (wd.type === 'sheet') {
    checkSheetWidget(wd, w, r);
  } else if (wd.type === 'pivot') {
    const recs = wd.records || [];
    if (!recs.length) r.err(`${w}: pivot needs records`);
    const keys = new Set(recs.flatMap((x) => Object.keys(x)));
    [...(wd.fields || []), ...(wd.values || [])].forEach((f) => { if (!keys.has(f)) r.err(`${w}: field ${f} isn’t in the records`); });
    if (!(wd.fields || []).length || !(wd.values || []).length) r.err(`${w}: pivot needs fields and values`);
  } else if (wd.type === 'regression') {
    const n = wd.y?.values?.length;
    if (!n) r.err(`${w}: regression needs y.values`);
    (wd.xs || []).forEach((x) => { if (x.values?.length !== n) r.err(`${w}: x ${x.name} length ≠ y length`); });
    const fit = ols((wd.xs || []).map((x) => x.values), wd.y?.values || [], {});
    if (fit.error) r.err(`${w}: regression with every X fails: ${fit.error}`);
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
    else {
      // single-letter symbols used in the formula should each be defined in `where` (words in \text{} don't count)
      // skips words in \text{}, commands, subscripts and summation indices (_i, _{i=1}, ^{n}), and e as the constant (e^)
      const letters = (t) => new Set((String(t).replace(/\\(?:text|mathrm|operatorname)\{[^}]*\}/g, ' ').replace(/\be(?=\s*\^)/g, ' ').replace(/[_^]\{[^}]*\}|[_^][A-Za-z0-9]/g, ' ').replace(/\\[a-zA-Z]+/g, ' ').match(/(?<![A-Za-z])[A-Za-z](?![A-Za-z])/g) || []));
      const defined = new Set(f.where.flatMap((row) => [...letters(row[0])]));
      const undefinedSyms = [...letters(f.tex)].filter((x) => !defined.has(x));
      if (undefinedSyms.length) r.warn(`${w}: symbol${undefinedSyms.length > 1 ? 's' : ''} ${undefinedSyms.join(', ')} used but not defined in where`);
    }
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
    const lessonSheets = Object.values(X.widgets || {});
    for (const [name] of sets) (X[name] || []).forEach((x, i) => {
      for (const a of lockedChanges([x.prompt, ...(x.steps || []).map((y) => y.prompt)], lessonSheets)) r.warn(`ex.${name}[${i}] (${x.id}): the prompt asks to change ${a}, which no worksheet widget in this lesson lets the student edit`);
    });
    const kinds = new Set((X.check || []).map((x) => x.kind));
    for (const k of KINDS) if (!kinds.has(k)) r.err(`ex.check: needs at least one ${k} question`);
    if ((X.check || []).some((x) => x.type === 'short')) r.err('ex.check: short (self-marked) items can’t be in the knowledge check');
    r.stats.exercises = (X.guided?.length || 0) + (X.independent?.length || 0) + (X.check?.length || 0);
  }
  // glossary links
  for (const t of ctx.terms) {
    const k = glossKey(t.term);
    if (!gl.has(k) && !(courseTerms && courseTerms.has(k))) r.warn(`${t.where}: <g>${t.term}</g> has no glossary entry in this or an earlier lesson (or an earlier course)`);
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
  // a case may export IDENTITIES: [[what, true|false]] that must all hold (F02: the statements balance and agree)
  for (const [what, okk] of caseMod?.IDENTITIES || []) if (!okk) r.err(`case.js: ${what} does not hold`);
  const pj = await loadModuleFile(course, 'project');
  if (!pj) r.warn('project.js missing');
  else {
    const P = pj.default || pj.project;
    for (const st of P?.stages || []) for (const x of [...(st.items || []), ...(st.items || []).flatMap((y) => y.steps || [])]) if (x.chart?.includes('/')) await chartFor(x.chart);
    if (P?.verify) { try { for (const [what, value, shown, tol = 0.005] of P.verify()) if (Math.abs(value - shown) > tol) r.err(`project: ${what}: computed ${value}, shown ${shown}`); } catch (e) { r.err(`project.verify threw: ${e.message}`); } }
    if (!P?.title || !P?.brief || !Array.isArray(P?.stages) || !P.stages.length) r.err('project: needs title, brief and stages');
    (P?.stages || []).forEach((s, i) => (s.items || []).forEach((x, j) => checkExercise(x, `project.stages[${i}].items[${j}]`, r, { course, chart, caseMod })));
    (P?.stages || []).forEach((s, i) => {
      const tools = s.tool?.kind === 'widget' ? [s.tool.widget] : [];
      for (const x of [...(s.items || []), ...(s.items || []).flatMap((y) => y.steps || [])]) for (const a of lockedChanges([x.prompt, x.solution], tools)) r.err(`project.stages[${i}] ${x.id}: tells the student to change ${a}, which the stage's worksheet locks (add it to editable)`);
    });
    (P?.stages || []).forEach((s, i) => { if (s.tool?.kind === 'widget') checkWidget(`project.stages[${i}].tool`, s.tool.widget, r, { chart, caseMod }); else if (s.tool && !['recorder', 'cleaning', 'mix'].includes(s.tool.kind)) r.err(`project.stages[${i}]: unknown tool kind ${s.tool.kind}`); });
    if (!Array.isArray(P?.rubric) || P.rubric.length < 3) r.warn('project: give a rubric of at least 3 criteria');
  }
  return r;
}

// ---------------------------------------------------------------- run
/** Glossary keys defined by built courses that come before `course` in the study order: the site glossary is shared,
 *  so a later course may link (<g>) to a term an earlier course defines. */
async function earlierTerms(course) {
  const terms = new Set();
  for (const id of catalog.ORDER) {
    if (id === course) break;
    if (!BUILT.some((b) => b.id === id)) continue;
    for (const { slug } of lessonsOf(id)) if (existsSync(join(DATA, id, `${slug}.js`))) ((await loadLesson(id, slug))?.glossary || []).forEach((g) => terms.add(glossKey(g.term)));
  }
  return terms;
}

export async function checkCourse(course, { strict = false } = {}) {
  exIds.clear();
  const reports = [];
  const terms = await earlierTerms(course);
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

/** The site keeps one glossary: the first course in study order to define a term owns it, and every later course's
 *  <g> links to that term show the first definition. So a term defined in two courses must be defined identically
 *  (or renamed: "CPA" meant cost per acquisition in M02 until F00 defined it as certified public accountant). */
export async function checkGlossary() {
  const r = new Report('glossary (all courses)');
  const first = new Map();
  for (const c of catalog.COURSES.filter((x) => BUILT.some((b) => b.id === x.id))) {
    for (const { slug } of lessonsOf(c.id)) {
      const L = existsSync(join(DATA, c.id, `${slug}.js`)) ? await loadLesson(c.id, slug) : null;
      for (const g of L?.glossary || []) {
        const k = glossKey(g.term), f = first.get(k);
        if (!f) first.set(k, { where: `${c.id}/${slug}`, course: c.id, def: g.def });
        else if (f.course !== c.id && f.def !== g.def) r.warn(`"${g.term}" is defined in ${f.where} and differently in ${c.id}/${slug}; the site glossary (and ${c.id}'s links) show the first. Make them identical, or rename one if the meanings differ.`);
      }
    }
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
    const terms = await earlierTerms(course);
    for (const l of lessonsOf(course)) { if (l.slug === slug) break; const E = await loadLesson(course, l.slug); (E?.glossary || []).forEach((g) => terms.add(glossKey(g.term))); }
    reports = [await checkLesson(course, slug, { courseTerms: terms })];
  } else {
    if (!arg) reports.push(checkCatalog(), await checkGlossary());
    for (const c of arg ? [arg] : BUILT.map((x) => x.id)) reports.push(...await checkCourse(c));
  }
  process.exit(print(reports) ? 1 : 0);
}
