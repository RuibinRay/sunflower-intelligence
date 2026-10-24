// formula.js — the "formula" lesson widget, a Formula Explorer: each input has a slider and an exact-value box;
// the headline result, the working, a plain-language note and an optional chart update as they change.
//   { type: 'formula', title, intro, inputs: [{ id, label, min, max, step, value, fmt: 'money'|'pct'|'int'|'num', unit, digits }],
//     compute: (v) => ({ headline: { label, value }, rows: [[label, value]], note, chart?, error? }) }
import { h } from '../../core/dom.js?v=12';
import * as F from '../../core/format.js?v=12';
import { fillRange } from '../../core/site.js?v=12';
import { onResize } from '../../core/dom.js?v=12';
import { drawChart } from './chart.js?v=12';

function digitsOf(inp) { return inp.digits ?? (inp.step < 1 ? Math.min(3, Math.ceil(-Math.log10(inp.step) - 1e-9)) : 0); }
function show(inp, v) {
  const d = digitsOf(inp);
  if (inp.fmt === 'pct') return `${F.num(v, d)}%`;
  if (inp.fmt === 'money') return `${F.money(v, { digits: d })}${inp.unit ? ` ${inp.unit}` : ''}`;
  if (inp.fmt === 'int') return `${F.int(v)}${inp.unit ? ` ${inp.unit}` : ''}`;
  return `${F.num(v, d)}${inp.unit ? ` ${inp.unit}` : ''}`;
}

export function mount(el, cfg, ctx) {
  const base = `fx-${ctx.id}`;
  const controls = cfg.inputs.map((inp) => {
    const rid = `${base}-${inp.id}`;
    const range = h('input', { type: 'range', id: rid, min: inp.min, max: inp.max, step: inp.step, value: inp.value, 'aria-describedby': `${rid}-out` });
    const out = h('output', { id: `${rid}-out`, for: rid });
    const exact = h('input', { class: 'input fx-num', type: 'number', min: inp.min, max: inp.max, step: inp.step, value: inp.value, 'aria-label': `${inp.label}: type an exact value` });
    const field = h('div', { class: 'slider-field' },
      h('div', { class: 'slider-top' }, h('label', { for: rid }, inp.label), out),
      range, exact);
    return { inp, range, out, exact, field };
  });
  const hero = h('p', { class: 'hero-value num', 'aria-live': 'polite' });
  const heroLabel = h('p', { class: 'hero-label' });
  const stats = h('dl', { class: 'stats-row' });
  const note = h('p', { class: 'fx-note' });
  const chartBox = h('div', { class: 'fx-chart' });
  const reset = h('button', { type: 'button', class: 'btn btn-secondary btn-sm fx-reset' }, 'Reset');
  el.append(h('div', { class: 'fx' },
    cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null,
    h('div', { class: 'fx-inputs', role: 'group', 'aria-label': `${cfg.title || 'Formula'} inputs` }, controls.map((c) => c.field), reset),
    h('div', { class: 'fx-out' }, h('div', {}, heroLabel, hero), stats, note, chartBox)));

  let last = null;
  function run() {
    const v = {};
    controls.forEach((c) => { const val = +c.range.value; v[c.inp.id] = val; c.out.textContent = show(c.inp, val); fillRange(c.range); });
    let r;
    try { r = cfg.compute(v); } catch { r = { error: 'These inputs can’t be calculated.' }; }
    last = r;
    if (r.error) {
      hero.textContent = '—'; heroLabel.textContent = r.headline?.label ? '' : '';
      stats.replaceChildren(); chartBox.replaceChildren();
      note.textContent = r.error; note.classList.add('is-error');
      return;
    }
    note.classList.remove('is-error');
    heroLabel.innerHTML = r.headline?.label || '';
    hero.innerHTML = r.headline?.value ?? '';
    stats.replaceChildren(...(r.rows || []).map(([k, val]) => { const d = h('div', { class: 'stat' }, h('dt'), h('dd', { class: 'num' })); d.firstChild.innerHTML = k; d.lastChild.innerHTML = val; return d; }));
    note.innerHTML = r.note || '';
    if (r.chart) drawChart(chartBox, { title: cfg.title, ...r.chart }, { height: 240 }); else chartBox.replaceChildren();
  }
  let raf = 0;
  const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(run); };
  controls.forEach((c) => {
    c.range.addEventListener('input', () => { c.exact.value = c.range.value; schedule(); });
    c.exact.addEventListener('change', () => {
      let val = +c.exact.value;
      if (!Number.isFinite(val) || c.exact.value === '') val = +c.range.value;
      val = Math.min(+c.inp.max, Math.max(+c.inp.min, val));
      c.exact.value = val; c.range.value = val; schedule();
    });
  });
  reset.addEventListener('click', () => { controls.forEach((c) => { c.range.value = c.inp.value; c.exact.value = c.inp.value; }); run(); ctx.report?.('reset'); });
  run();
  onResize(chartBox, () => { if (last?.chart && !last.error) drawChart(chartBox, { title: cfg.title, ...last.chart }, { height: 240 }); });
}
