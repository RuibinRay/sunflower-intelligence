// tutorial.js — the step-by-step walkthrough drawer: ten steps per model at the chosen level, with a worked example
// computed from the company in the workspace and the sources with authors and dates.
import { h } from '../core/dom.js?v=30';
import { formatter, SOURCES } from '../core/valuation-report.js?v=30';
import { TUTORIALS, STEPS, LEVELS } from '../data/valuation-tutorials.js?v=30';
import { state, setLevel, closeTutorial, on } from './state.js?v=30';
import { segmented, btn } from './ui.js?v=30';
import { inline, pi } from './inline.js?v=30';

const stepState = new Map();
export function renderTutorial(container, modelId) {
  const T = TUTORIALS[modelId];
  if (!T) { container.replaceChildren(); return; }
  container.replaceChildren();
  let step = stepState.get(modelId) || 'what';
  const body = h('div', { class: 'cv-tutorial-body' });
  const nav = h('ul', { class: 'cv-tutorial-nav', role: 'list' });
  const draw = () => {
    nav.replaceChildren(...STEPS.map(([sid, title], i) => h('li', {}, btn(`${i + 1}. ${title}`, () => { step = sid; stepState.set(modelId, sid); draw(); }, { cls: '' }))));
    nav.querySelectorAll('button').forEach((b, i) => { b.className = ''; b.setAttribute('aria-current', STEPS[i][0] === step ? 'true' : 'false'); });
    body.replaceChildren();
    const title = STEPS.find((s) => s[0] === step)[1];
    body.append(h('h4', {}, title), h('p', { class: 'cv-level-note' }, `${LEVELS.find((l) => l.id === state.level).name} level: ${LEVELS.find((l) => l.id === state.level).blurb}`));
    const content = T.steps[step]?.[state.level] || [];
    content.forEach((t) => body.append(pi(t)));
    if (step === 'manual') {
      const f = formatter(state.project);
      const items = T.worked({ project: state.project, A: state.A, results: state.results }, f);
      if (items.length) body.append(h('p', {}, h('strong', {}, `Worked on ${state.project.meta?.name || 'the company'} with the current assumptions`), ' (edit anything in the workspace and these numbers follow):'), h('ol', {}, items.map((t) => pi(t, {}, 'li'))));
      else body.append(h('p', { class: 'note' }, 'Run this model (tick it under "Choose the models" and fill in what it needs) to see the worked example on your company.'));
    }
    if (step === 'excel') body.append(h('p', { class: 'note' }, 'The Excel export in the report section writes the forecast and DCF with live formulas laid out as described here.'));
    if (step === 'formulas') body.append(h('p', { class: 'note' }, 'Every formula the engine uses is listed in the report’s technical appendix.'));
  };
  const level = segmented('cv-level-t', LEVELS, state.level, (v) => setLevel(v));
  const head = h('div', { class: 'cv-tutorial-head' }, h('h3', {}, `Tutorial: ${T.title}`), h('div', { class: 'input-actions' }, level, btn('Close', () => closeTutorial(), { cls: 'btn-sm' })));
  const srcs = h('p', { class: 'cv-tutorial-sources' }, 'Sources: ', ...T.sources.map((sid, i) => { const s = SOURCES.find((x) => x.id === sid); return [i ? '; ' : '', h('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.title), ` (${s.author}, ${s.publisher}, ${s.date})`]; }).flat(), '. Explanations are this site’s own; no affiliation with the publishers is implied.');
  container.append(h('div', { class: 'cv-tutorial', role: 'region', 'aria-label': `Tutorial: ${T.title}` }, head, nav, body, srcs));
  draw();
  const off = on((kind) => { if (!container.isConnected || state.tutorial !== modelId) { off(); return; } if (kind === 'mode') { level.set(state.level); draw(); } else if (kind === 'results' && step === 'manual') draw(); });
}
