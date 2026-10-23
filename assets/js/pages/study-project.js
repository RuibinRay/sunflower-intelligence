// study-project.js — a course's applied project. data/study/<course>/project.js exports (default or `project`):
//   { title, brief, deliverables, stages: [{ id, title, html, tool?, items? }], rubric: ['criterion', …] }
// A stage's `tool` mounts the course's lab:
//   { kind: 'recorder', scenario }                              Accounting Lab recorder: done when every entry is posted
//   { kind: 'cleaning', dataset, ops, watch, task, goals }      Data Cleaning Lab: done when every goal is met
//   { kind: 'mix', lock, show, plan }                           Marketing Mix Simulator: the plan is kept for the write-up
// A stage's `items` are questions (any exercise type; `short` for writing). A stage is done when its tool's goal
// is met (if it has one) and every question has been answered. The project is finished when every stage is done
// and the student has marked it against the rubric. Projects never change mastery.
import { initSite } from '../core/site.js?v=8';
import { $, h, debounce } from '../core/dom.js?v=8';
import * as P from '../study/progress.js?v=8';
import { practiceCard, loadCharts } from '../study/exercises.js?v=8';
import { initOutline, paintOutline, storageWarning } from '../study/common.js?v=8';

initSite();
initOutline();
const { course } = document.body.dataset;
paintOutline(course);
const box = $('#project-root');

let mod;
try { mod = await import(`../data/study/${course}/project.js?v=8`); } catch (e) { console.error(e); }
const PJ = mod?.default || mod?.project;
if (!PJ) {
  box.replaceChildren(h('p', { class: 'note' }, 'The project didn’t load. Reload the page to try again.'));
} else {
  const rec = () => P.projectRecord(course);
  const charts = await loadCharts(PJ.stages.flatMap((st) => st.items || []));
  const nav = h('ol', { class: 'project-steps', role: 'list', 'aria-label': 'Project stages' });
  box.replaceChildren(nav);
  storageWarning(box);
  const sections = [];
  const stageDone = (st) => !!rec().stages[st.id]?.done;
  function paintNav() {
    nav.replaceChildren(...PJ.stages.map((st, i) => h('li', {}, h('a', { href: `#stage-${st.id}`, class: stageDone(st) ? 'is-done' : '' }, `${i + 1}. ${st.title}${stageDone(st) ? ' ✓' : ''}`))));
    sections.forEach(({ st, state }) => { const d = stageDone(st); state.textContent = d ? 'Stage done' : 'Not done yet'; state.className = `stage-state${d ? ' is-done' : ''}`; });
    finishBtn.disabled = !PJ.stages.every(stageDone) || !!rec().completed;
    finishNote.textContent = rec().completed ? 'Project finished. It counts toward completing the course.' : PJ.stages.every(stageDone) ? 'Every stage is done. Mark your work against the rubric, then finish.' : 'Finish every stage first.';
    paintOutline(course);
  }

  for (const [i, st] of PJ.stages.entries()) {
    const state = h('p', { class: 'stage-state' });
    const sec = h('section', { class: 'project-stage', id: `stage-${st.id}`, 'aria-labelledby': `stage-${st.id}-h` },
      h('h2', { id: `stage-${st.id}-h` }, h('span', {}, `Stage ${i + 1} of ${PJ.stages.length}`), st.title), state);
    const intro = h('div', { class: 'stage-html' }); intro.innerHTML = st.html || ''; sec.append(intro);
    const need = { tool: !!st.tool && (st.tool.kind === 'recorder' || (st.tool.kind === 'cleaning' && !!st.tool.goals?.length)), items: new Set((st.items || []).map((x) => x.id)) };   // a lab with no goal to meet doesn't hold the stage up
    const have = { tool: !!rec().stages[st.id]?.tool, items: new Set(rec().stages[st.id]?.items || []) };
    const update = () => {
      const done = (!need.tool || have.tool) && [...need.items].every((id) => have.items.has(id));
      P.projectStage(course, st.id, { tool: have.tool, items: [...have.items], done });
      paintNav();
    };
    if (st.tool) {
      const el = h('div', { class: 'widget stage-tool' }, h('p', { class: 'widget-loading' }, 'Loading the lab…'));
      sec.append(el);
      mountTool(el, st.tool, { key: `si:project-${course}-${st.id}`, done: () => { if (!have.tool) { have.tool = true; update(); } }, plan: (plan, results) => P.projectStage(course, st.id, { plan, results: summarise(results) }) });
    }
    (st.items || []).forEach((it, k) => {
      sec.append(practiceCard(it, {
        mode: 'independent', label: `Task ${k + 1} of ${st.items.length}`, charts, unscored: true,
        prior: have.items.has(it.id) ? { text: 'Answered before', cls: '' } : null,
        onAnswer: (item, correct, { step, rollup }) => { if (step || (item.type === 'steps' && !rollup)) return; have.items.add(item.id); update(); },
        onWorked: (item) => { have.items.add(item.id); update(); },
        onDone: (item) => { have.items.add(item.id); update(); },
      }));
    });
    sections.push({ st, state });
    box.append(sec);
  }

  // finishing: self-assessment against the rubric
  const rubric = h('section', { class: 'project-stage', id: 'finish', 'aria-labelledby': 'finish-h' },
    h('h2', { id: 'finish-h' }, h('span', {}, 'Finally'), 'Check your work against the rubric'));
  const list = h('ul', { class: 'rubric', role: 'list' }, (PJ.rubric || []).map((r, k) => { const id = `rub-${k}`; const lab = h('label', { for: id }, h('input', { type: 'checkbox', id }), h('span')); lab.lastChild.innerHTML = r; return h('li', {}, lab); }));
  const finishBtn = h('button', { type: 'button', class: 'btn btn-primary' }, 'Finish the project');
  const finishNote = h('p', { class: 'field-hint', 'aria-live': 'polite' });
  finishBtn.addEventListener('click', () => { P.projectComplete(course); paintNav(); });
  rubric.append(h('p', {}, 'There is no marker: compare your work with each point honestly, and redo any stage that falls short before you finish.'), list, h('div', { class: 'ex-actions' }, finishBtn), finishNote);
  box.append(rubric);
  paintNav();
}

/** Keep the simulator's results for the write-up: a plain copy (numbers, strings, nested objects), rounded, size-capped. */
function summarise(results) {
  if (!results || typeof results !== 'object') return null;
  try {
    const text = JSON.stringify(results, (k, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : typeof v === 'function' ? undefined : v));
    return text.length <= 40000 ? JSON.parse(text) : { note: 'Results too large to keep; the plan is saved.' };
  } catch { return null; }
}

async function mountTool(el, tool, cb) {
  try {
    if (tool.kind === 'recorder') {
      const { mountRecorder } = await import('../study/labs/accounting-ui.js?v=8');
      el.replaceChildren();
      mountRecorder(el, tool.scenario, { onProgress: ({ done, total }) => { if (total && done >= total) cb.done(); }, store: { load: () => { try { return JSON.parse(localStorage.getItem(cb.key) || 'null'); } catch { return null; } }, save: (v) => { try { localStorage.setItem(cb.key, JSON.stringify(v)); } catch { /* not kept */ } } } });
    } else if (tool.kind === 'cleaning') {
      const { mountLab } = await import('../study/labs/cleaning-ui.js?v=8');
      el.replaceChildren();
      const { kind, ...opts } = tool;
      mountLab(el, { ...opts, storageKey: cb.key, onProgress: (met, total) => { if (total && met >= total) cb.done(); } });
    } else if (tool.kind === 'mix') {
      const { mountSimulator } = await import('../study/labs/mix-ui.js?v=8');
      el.replaceChildren();
      const { kind, ...opts } = tool;
      const keep = debounce((plan, results) => cb.plan(plan, results), 600);   // saving on every slider step would be wasteful
      mountSimulator(el, { ...opts, onChange: (plan, results) => keep(plan, results) });
    } else throw new Error(`unknown tool ${tool.kind}`);
  } catch (e) {
    console.error(e);
    el.classList.add('is-error');
    el.replaceChildren(h('p', { class: 'note' }, 'The lab didn’t load. Reload the page to try again.'));
  }
}
