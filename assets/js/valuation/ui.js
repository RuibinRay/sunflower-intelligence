// ui.js (valuation) — small controls the studio's panels share: number inputs, sliders, fields, blocks, help links.
import { h, $$ } from '../core/dom.js?v=28';
import * as F from '../core/format.js?v=28';
import { fillRange } from '../core/site.js?v=28';
import { LEARN_LINKS } from '../data/valuation-tutorials.js?v=28';
import { inline } from './inline.js?v=28';

const fin = Number.isFinite;
export const ROOT = '../../';
let uid = 0;
export const id = (p = 'cv') => `${p}-${++uid}`;

/** A numeric input that reports a number (or NaN when blank). `scale` converts between the shown value and the stored one (100 for percentages). */
export function numInput({ value, step = 'any', min, max, placeholder = '', cls = '', scale = 1, digits = null, onInput, ariaLabel, derived = false, title = '' } = {}) {
  const el = h('input', { class: `input ${cls}${derived ? ' is-derived' : ''}`, type: 'text', inputmode: 'decimal', autocomplete: 'off', placeholder, 'aria-label': ariaLabel, title });
  const show = (v) => (fin(v) ? (digits != null ? (v * scale).toFixed(digits) : String(Math.round(v * scale * 1e6) / 1e6)) : '');
  el.value = show(value);
  if (min != null) el.dataset.min = min; if (max != null) el.dataset.max = max;
  el.addEventListener('input', () => {
    const t = el.value.trim().replace(/,/g, '').replace(/^\((.*)\)$/, '-$1').replace(/[−–]/g, '-').replace(/%$/, '');
    let v = t === '' ? NaN : Number(t);
    if (fin(v)) { v /= scale; if (min != null && v < min) v = min; if (max != null && v > max) v = max; }
    el.setAttribute('aria-invalid', t !== '' && !fin(v) ? 'true' : 'false');
    onInput && onInput(v, el);
  });
  el.addEventListener('blur', () => { const t = el.value.trim(); if (t !== '' && !/^[-−(]?[\d,.]+%?\)?$/.test(t)) return; const v = Number(t.replace(/,/g, '').replace(/^\((.*)\)$/, '-$1').replace(/[−–]/g, '-').replace(/%$/, '')); if (fin(v) && digits != null) el.value = v.toFixed(digits); });
  el.set = (v) => { el.value = show(v); };
  return el;
}
export function textInput({ value = '', placeholder = '', onInput, ariaLabel, cls = '' } = {}) {
  const el = h('input', { class: `input ${cls}`, type: 'text', placeholder, 'aria-label': ariaLabel, autocomplete: 'off' });
  el.value = value ?? '';
  el.addEventListener('input', () => onInput && onInput(el.value, el));
  return el;
}
export function selectEl(options, value, onChange, { cls = '', ariaLabel } = {}) {
  const el = h('select', { class: `select ${cls}`, 'aria-label': ariaLabel }, options.map((o) => h('option', { value: o.value ?? o.id }, o.label ?? o.name)));
  el.value = String(value);
  el.addEventListener('change', () => onChange && onChange(el.value, el));
  return el;
}
export function field(labelText, control, { hint = '', help = null, inlineLabel = false } = {}) {
  const fid = control.id || id('f'); control.id = fid;
  return h('div', { class: 'field' }, h('label', { for: fid }, labelText, help ? helpLink(help) : null), control, hint ? h('p', { class: 'field-hint' }, inline(hint)) : null);
}
/** A slider for a fraction shown in percent: {value: 0.08} shows 8.0%. */
export function pctSlider({ label, value, min = 0, max = 30, step = 0.5, digits = 1, onInput, help = null, suffix = '%' } = {}) {
  const sid = id('sl');
  const out = h('output', { for: sid });
  const input = h('input', { type: 'range', id: sid, min, max, step });
  const fmt = (v) => `${F.num(v, digits)}${suffix}`;
  input.value = String(Math.max(min, Math.min(max, Math.round((value * 100) / step) * step)));
  out.textContent = fmt(+input.value);
  input.addEventListener('input', () => { out.textContent = fmt(+input.value); fillRange(input); onInput && onInput(+input.value / 100); });
  const el = h('div', { class: 'slider-field' }, h('div', { class: 'slider-top' }, h('label', { for: sid }, label, help ? helpLink(help) : null), out), input);
  el.set = (v) => { input.value = String(Math.max(min, Math.min(max, v * 100))); out.textContent = fmt(+input.value); fillRange(input); };
  requestAnimationFrame(() => fillRange(input));
  return el;
}
export function numSlider({ label, value, min, max, step, digits = 1, suffix = '', onInput, help = null } = {}) {
  const sid = id('sl');
  const out = h('output', { for: sid });
  const input = h('input', { type: 'range', id: sid, min, max, step });
  const fmt = (v) => `${F.num(v, digits)}${suffix}`;
  input.value = String(Math.max(min, Math.min(max, value)));
  out.textContent = fmt(+input.value);
  input.addEventListener('input', () => { out.textContent = fmt(+input.value); fillRange(input); onInput && onInput(+input.value); });
  const el = h('div', { class: 'slider-field' }, h('div', { class: 'slider-top' }, h('label', { for: sid }, label, help ? helpLink(help) : null), out), input);
  el.set = (v) => { input.value = String(v); out.textContent = fmt(+input.value); fillRange(input); };
  requestAnimationFrame(() => fillRange(input));
  return el;
}
/** A "?" link to the Learn platform (key from LEARN_LINKS) or an absolute href. */
export function helpLink(key) {
  const l = LEARN_LINKS[key] || { href: key, label: 'Learn more' };
  return h('a', { class: 'cv-help', href: l.href.startsWith('http') ? l.href : ROOT + l.href, title: l.label, 'aria-label': `${l.label} (opens the Learn page)` }, '?');
}
export function segmented(name, options, value, onChange, { stack = false } = {}) {
  const box = h('div', { class: `segmented${stack ? ' segmented-stack' : ''}`, role: 'radiogroup' });
  options.forEach((o) => {
    const rid = id('seg');
    const r = h('input', { type: 'radio', id: rid, name, value: o.id });
    r.checked = o.id === value;
    r.addEventListener('change', () => r.checked && onChange(o.id));
    box.append(r, h('label', { for: rid }, o.name));
  });
  box.set = (v) => { $$('input', box).forEach((r) => { r.checked = r.value === v; }); };
  return box;
}
/** A collapsible block with a step tag; `adv` hides it in guided mode. */
export function block({ title, step, sub = '', adv = false, children = [], actions = null, cls = '' }) {
  const body = h('div', { class: 'cv-block-body' });
  const el = h('section', { class: `cv-block ${adv ? 'is-adv-only' : ''} ${cls}`, 'data-step': step });
  const fold = h('button', { type: 'button', class: 'cv-fold', 'aria-expanded': 'true', 'aria-label': `Collapse ${title}` }, svgChevron());
  fold.addEventListener('click', () => { const c = el.classList.toggle('is-collapsed'); fold.setAttribute('aria-expanded', String(!c)); fold.setAttribute('aria-label', `${c ? 'Expand' : 'Collapse'} ${title}`); });
  el.append(h('div', { class: 'cv-block-head' }, h('h3', {}, title), h('div', { class: 'cv-block-actions' }, actions, step ? h('span', { class: 'cv-step-tag' }, `Step ${step}`) : null, fold)));
  if (sub) el.append(h('p', { class: 'cv-sub' }, inline(sub)));
  el.append(body);
  body.append(...children.flat().filter(Boolean));
  el.body = body;
  return el;
}
function svgChevron() { const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 16 16'); svg.setAttribute('aria-hidden', 'true'); const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', 'M3 6l5 5 5-5'); p.setAttribute('fill', 'none'); p.setAttribute('stroke', 'currentColor'); p.setAttribute('stroke-width', '2'); p.setAttribute('stroke-linecap', 'round'); svg.append(p); return svg; }
export const btn = (text, onClick, { kind = 'secondary', cls = '', title = '', disabled = false } = {}) => { const b = h('button', { type: 'button', class: `btn btn-${kind} ${cls}`, title }, text); b.disabled = disabled; b.addEventListener('click', onClick); return b; };
export const stat = (label, value, subText = '') => h('div', { class: 'stat' }, h('dt', {}, label), h('dd', { class: 'num' }, value), subText ? h('div', { class: 'field-hint' }, subText) : null);
export const dataTable = (columns, rows, caption = '') => h('div', { class: 'table-scroll' }, h('table', { class: 'data-table' }, caption ? h('caption', { class: 'visually-hidden' }, caption) : null, h('thead', {}, h('tr', {}, columns.map((c) => h('th', { scope: 'col', class: c.num ? 'is-num' : '' }, c.label)))), h('tbody', {}, rows.map((r) => h('tr', { class: r.strong ? 'is-strong' : '' }, (r.cells || r).map((v, k) => (k === 0 ? h('th', { scope: 'row' }, v) : h('td', { class: columns[k]?.num ? 'is-num' : '' }, v))))))));
