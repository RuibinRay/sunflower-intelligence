// studio.js — assembles the Company Valuation Studio: the toolbar (guided or advanced mode, learning level, the six
// steps, project actions), the three panels, and the saved-project handling.
import { h, $, $$, download } from '../core/dom.js?v=30';
import * as IO from '../core/valuation-io.js?v=30';
import { verdict } from '../core/ui.js?v=30';
import { state, on, loadProject, loadExample, newProject, loadSaved, clearSaved, setMode, setLevel, setStep, resetAssumptions } from './state.js?v=30';
import { segmented, btn } from './ui.js?v=30';
import { LEVELS } from '../data/valuation-tutorials.js?v=30';
import { renderDataPanel } from './panel-data.js?v=30';
import { renderModelPanel } from './panel-model.js?v=30';
import { renderInsightsPanel } from './panel-insights.js?v=30';

const STEPS = ['Company and data', 'Choose models', 'Assumptions and results', 'Risks', 'Scenarios', 'Report'];

export function initStudio(root) {
  // which project to open
  const saved = loadSaved();
  const notice = h('div');
  let handed = null;
  try { handed = JSON.parse(localStorage.getItem('si:cv:handoff') || 'null'); localStorage.removeItem('si:cv:handoff'); } catch { handed = null; }
  if (handed?.project?.history?.length) {
    loadProject(handed.project, handed.A || null);
    notice.append(verdict('good', `Opened ${handed.project.meta?.name || 'the company'} from Company Intelligence.`, 'Its statements, their sources and the assumptions you set there came with it. Add peers, risks and the remaining models here, then generate the full valuation report.'));
  } else if (saved?.project?.history?.length) {
    loadProject(saved.project, saved.A);
    notice.append(verdict('good', `Resumed your saved project${saved.project.meta?.name ? `: ${saved.project.meta.name}` : ''}.`, `Saved in this browser on ${String(saved.savedAt || '').slice(0, 10)}. `), h('div', { class: 'input-actions' }, btn('Open the example instead', () => { loadExample(); notice.replaceChildren(); }, { cls: 'btn-sm' }), btn('Forget the saved copy', () => { clearSaved(); loadExample(); notice.replaceChildren(); }, { cls: 'btn-sm' })));
  } else loadExample();

  const modeCtl = segmented('cv-mode', [{ id: 'guided', name: 'Guided' }, { id: 'advanced', name: 'Advanced' }], state.mode, (v) => setMode(v));
  const levelCtl = segmented('cv-level', LEVELS, state.level, (v) => setLevel(v));
  const steps = h('ol', { class: 'cv-steps', 'aria-label': 'Steps' }, STEPS.map((name, i) => h('li', {}, btn(name, () => setStep(i + 1), { cls: '' }))));
  const actions = h('div', { class: 'cv-actions' },
    h('a', { class: 'btn btn-secondary btn-sm', href: '../company-intelligence/' }, 'Import a workbook'),
    btn('Example', () => loadExample(), { cls: 'btn-sm' }),
    btn('New', () => newProject(), { cls: 'btn-sm' }),
    btn('Save (JSON)', () => download(`${(state.project.meta?.name || 'company').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-valuation-project.json`, IO.serializeProject(state.project, state.A), 'application/json'), { cls: 'btn-sm', kind: 'primary' }),
    btn('Reset assumptions', () => resetAssumptions(), { cls: 'btn-sm' }));
  const toolbar = h('div', { class: 'cv-toolbar' },
    h('div', { class: 'cv-toolbar-row' }, h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Mode'), modeCtl), h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Learning level'), levelCtl), actions),
    h('div', { class: 'cv-toolbar-row' }, steps),
    h('p', { class: 'cv-storage-note' }, 'Your project is kept in this browser’s local storage as you work (a convenience, not a secure or multi-device store) and can be saved as a JSON file to reload anywhere. Nothing is uploaded.'),
    notice);
  const grid = h('div', { class: `cv-studio${state.mode === 'advanced' ? ' is-advanced' : ''}` });
  root.replaceChildren(toolbar, grid);
  renderDataPanel(grid); renderModelPanel(grid); renderInsightsPanel(grid);

  const applyMode = () => {
    grid.classList.toggle('is-advanced', state.mode === 'advanced');
    modeCtl.set(state.mode); levelCtl.set(state.level);
    $$('button', steps).forEach((b, i) => { b.setAttribute('aria-current', i + 1 === state.step ? 'step' : 'false'); b.classList.toggle('is-done', i + 1 < state.step); });
    $$('.cv-block[data-step]', grid).forEach((bl) => {
      const s = +bl.dataset.step;
      const collapse = state.mode === 'guided' && s !== state.step && !(state.step === 3 && s === 3);
      bl.classList.toggle('is-collapsed', collapse);
      const fold = $('.cv-fold', bl); if (fold) fold.setAttribute('aria-expanded', String(!collapse));
    });
  };
  applyMode();
  on((kind) => { if (kind === 'mode' || kind === 'structure') applyMode(); });
}
