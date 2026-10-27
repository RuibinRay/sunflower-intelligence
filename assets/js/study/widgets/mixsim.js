// widgets/mixsim.js — the `mixsim` lesson widget: the Marketing Mix Simulator cut down to the decisions a lesson
// is about (AUTHORING.md §4).
//   { type: 'mixsim', lock: { tier: true, range: 'one', … }, show: ['units', 'share', …], note: 'html' }
// lock: a decision set to true is fixed at DEFAULT_PLAN's value; any other value fixes it at that value
//       (promotion: an object, merged over DEFAULT_PLAN.promotion). Unlocked decisions get controls.
// show: the results to show (units, share, revenue, margin, contribution, satisfaction, awareness, elasticity);
//       all of them when omitted. The profit-and-cans-against-price chart appears whenever price is open.
// Extra, optional: plan (a starting plan for the open decisions), full: true (the lab's full results view).
import { mountSimulator, ensureStyles, RESULT_KEYS } from '../labs/mix-ui.js?v=22';
import { debounce } from '../../core/dom.js?v=22';

export async function mount(el, config = {}, ctx = {}) {
  ensureStyles();
  const report = typeof ctx?.report === 'function' ? ctx.report : () => {};
  const show = Array.isArray(config.show) && config.show.length ? config.show.filter((k) => RESULT_KEYS.includes(k)) : RESULT_KEYS;
  let touched = false;
  const sendChange = debounce((plan, r) => report('change', { plan, ok: r.ok, units: r.ok ? Math.round(r.year.units) : null, profit: r.ok ? Math.round(r.year.profit) : null, error: r.ok ? null : r.error }), 900);
  const api = mountSimulator(el, {
    lock: config.lock || {},
    show: config.full ? undefined : show,
    detail: !!config.full,
    plan: config.plan,
    note: config.note,
    onChange: (plan, r) => {
      if (!touched) { touched = true; return; } // the first call is the initial render, not an interaction
      sendChange(plan, r);
    },
  });
  el.classList.add('mix-widget');
  if (ctx?.id) el.dataset.widget = ctx.id;
  report('ready', { type: 'mixsim' });
  return api;
}
