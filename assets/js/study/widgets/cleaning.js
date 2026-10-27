// cleaning.js — the `cleaning` lesson widget: the Data Cleaning Lab cut down to the steps a lesson teaches.
// config: { dataset: 'lantern-orders' | { columns, rows }, ops: [...] ([] or omitted = inspect only: profile, issues and
//           the marked table), watch: [...], task: 'html', goals: [rules],
//           split: column holding 'train'/'test' (scaling, imputation and target encoding can fit on the train rows),
//           fit: ['train', 'all'] (the fitting choices offered, first = default), target: outcome column for target encoding,
//           prepare: [steps applied before the student starts], export: true to show the export panel,
//           advice: false to hide each issue's detail line and “Why it matters” panel (they hint at fixes) }
// ctx: { id, report(event, detail) } — events: 'step' { op, steps }, 'goals' { met, total }, 'complete' { goals }.
import { mountLab } from '../labs/cleaning-ui.js?v=22';

export async function mount(el, config = {}, ctx = {}) {
  el.classList.add('cl-widget');
  return mountLab(el, {
    dataset: config.dataset,
    ops: Array.isArray(config.ops) ? config.ops : [],
    watch: config.watch,
    task: config.task,
    goals: config.goals,
    split: config.split,
    fit: Array.isArray(config.fit) ? config.fit : typeof config.fit === 'string' ? [config.fit] : undefined,
    target: config.target,
    prepare: config.prepare,
    rules: config.rules,
    export: config.export === true,
    advice: config.advice !== false,
    headingLevel: config.headingLevel || 4,
    name: ctx.id || 'table',
    title: typeof config.dataset === 'string' ? undefined : (config.title || 'The table'),
    report: (event, detail) => ctx.report?.(event, detail),
  });
}
