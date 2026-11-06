// state.js — the studio's single source of truth: the project (data, models, risks, scenarios), the assumptions, and
// the results recomputed from them. Panels subscribe and re-render; every input change ends in recompute().
import * as V from '../core/valuation.js?v=26';
import { store, debounce } from '../core/dom.js?v=26';
import { EXAMPLE } from '../data/valuation-example.js?v=26';

export const SAVE_KEY = 'si:cv:project';
export const state = {
  project: null, A: null,
  results: {}, scenarios: null, football: [], validation: [], historical: [], guide: [], mc: null,
  errors: [],
  mode: store.get('si:cv:mode', 'guided'), level: store.get('si:cv:level', 'beginner'), step: 1,
  tutorial: null, report: null, compsStat: 'median',
};
const listeners = new Set();
/** kinds: 'structure' (re-render inputs), 'results' (re-render outputs), 'mode' (guided/advanced, level, step), 'tutorial', 'report' */
export function on(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function emit(kind, detail = null) { listeners.forEach((fn) => { try { fn(kind, detail); } catch (e) { console.error(e); } }); }

export const clone = (o) => JSON.parse(JSON.stringify(o));
export const fin = V.fin;

export function loadProject(project, A = null) {
  state.project = clone(project);
  state.project.models ||= { dcf: true, comps: false, ddm: false, asset: false, fcfe: false, sotp: false, earnings: false, vc: false };
  state.project.history ||= [];
  state.project.market ||= {};
  state.project.peers ||= [];
  state.project.risks ||= [];
  state.project.scenarios ||= clone(V.DEFAULT_SCENARIOS);
  state.project.meta ||= { name: 'New company', currency: 'USD', unit: 1e6, unitLabel: 'millions', industry: 'general', maturity: 'mature', valuationDate: new Date().toISOString().slice(0, 10) };
  state.A = A ? clone(A) : safeDefaults();
  state.mc = null; state.report = null;
  recompute();
  emit('structure');
}
export function loadExample() { loadProject(EXAMPLE); }
export function newProject() {
  loadProject({ version: 1, meta: { name: '', ticker: '', industry: 'general', maturity: 'mature', country: '', currency: 'USD', unit: 1e6, unitLabel: 'millions', fiscalYearEnd: 'December', valuationDate: new Date().toISOString().slice(0, 10), title: '', analyst: '', comments: '' }, source: { kind: 'manual', note: 'Entered by hand.', document: '', retrieved: '' }, history: [{ year: new Date().getFullYear() - 1 }], market: {}, models: { dcf: true, comps: false, ddm: false, asset: true, fcfe: false, sotp: false, earnings: false, vc: false }, peers: [], risks: [], segments: [], scenarios: clone(V.DEFAULT_SCENARIOS) });
}
function safeDefaults() {
  try { return V.defaultAssumptions(state.project); } catch { return V.defaultAssumptions({ history: [{ year: 2025, revenue: 100 }], market: {} }); }
}
export function resetAssumptions() { state.A = safeDefaults(); recompute(); emit('structure'); }

/** Recomputes everything from the project and assumptions. Cheap enough to run on every keystroke (debounced). */
export function recompute() {
  const P = state.project, A = state.A;
  state.validation = V.validate(P);
  state.errors = state.validation.filter((w) => w.level === 'error');
  try { state.historical = P.history.length ? V.historical(P) : []; } catch (e) { state.historical = []; console.error(e); }
  state.guide = V.modelGuide(V.profileOf(P));
  if (!state.errors.length && P.history.length) {
    try {
      const all = V.valueAll(P, A, { comps: { stat: state.compsStat } });
      state.results = all.results; state.scenarios = all.scenarios; state.football = all.football;
    } catch (e) { console.error(e); state.results = { dcf: { error: `The engine hit an error: ${e.message}` } }; state.scenarios = null; state.football = []; }
  } else { state.results = {}; state.scenarios = null; state.football = []; }
  state.report = null;
  autosave();
  emit('results');
}
export const scheduleRecompute = debounce(recompute, 70);

export function setMode(mode) { state.mode = mode; store.set('si:cv:mode', mode); emit('mode'); }
export function setLevel(level) { state.level = level; store.set('si:cv:level', level); emit('mode'); }
export function setStep(step) { state.step = Math.max(1, Math.min(6, step)); emit('mode'); }
export function openTutorial(model) { state.tutorial = model; emit('tutorial'); }
export function closeTutorial() { state.tutorial = null; emit('tutorial'); }

// ---------------------------------------------------------------- local persistence (convenience only)
let saveTimer = null;
export function autosave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { try { store.set(SAVE_KEY, { project: state.project, A: state.A, savedAt: new Date().toISOString() }); } catch { /* storage unavailable */ } }, 400);
}
export function loadSaved() { return store.get(SAVE_KEY, null); }
export function clearSaved() { try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ } }

/** Updates one history cell; blank clears it. */
export function setHistory(yearIndex, field, value) {
  const h = state.project.history[yearIndex]; if (!h) return;
  if (value === '' || value == null || Number.isNaN(value)) delete h[field]; else h[field] = value;
  scheduleRecompute();
}
export function addYear(year) {
  const ys = state.project.history.map((h) => h.year).filter(Number.isInteger);
  const y = Number.isInteger(year) ? year : (ys.length ? Math.max(...ys) + 1 : new Date().getFullYear() - 1);
  state.project.history.push({ year: y });
  state.project.history.sort((a, b) => (a.year || 0) - (b.year || 0));
  recompute(); emit('structure');
}
export function removeYear(i) { state.project.history.splice(i, 1); recompute(); emit('structure'); }
export function setYear(i, year) { state.project.history[i].year = year; state.project.history.sort((a, b) => (a.year || 0) - (b.year || 0)); recompute(); emit('structure'); }
export function toggleModel(id, on) { state.project.models[id] = on; if (on && id === 'asset' && !state.project.assetOpts) state.project.assetOpts = { adjustments: {} }; recompute(); emit('structure'); }
