// sheetgrid.js — a spreadsheet grid for the B03 Excel lessons: column letters and row numbers, a name box and a
// formula bar, number formats, marked cells, conditional formatting, and (when editable) typing values and formulas
// into cells. Used by the `formula` exercise type and the `sheet` widget. The maths is in core/sheet.js.
//
// sheetGrid({ sheet, view: 'A1:F13', formats: { F: '$#,##0.00', A: 'date', B7: '0.0%' }, widths: { C: 16 },
//             mark: ['F2:F13'], editable: false | true | 'H1:K20', label, maxHeight, rules: [cf rule], onEdit })
// returns { el, sheet, refresh(), select(a), setShowFormulas(bool), setSheet(sheet), setRules(rules), selected() }
//
// Keyboard (the grid is one tab stop, as a spreadsheet is): arrow keys move; Home / End go to the row's ends;
// Ctrl+Home to A1; Page Up / Page Down move ten rows; Enter or F2 edits the cell (when editable), and typing starts
// editing; in the formula bar Enter saves and moves down, Tab saves and moves right, Escape cancels.
import { h } from '../core/dom.js?v=11';
import { parseRange, parseAddr, addr, indexToCol, display, isErr, criterion, shiftFormula, evaluate } from '../core/sheet.js?v=11';

let gid = 0;
const inRange = (rg, r, c) => r >= rg.r0 && r <= rg.r1 && c >= rg.c0 && c <= rg.c1;
const ranges = (list) => (Array.isArray(list) ? list : list ? [list] : []).map((x) => parseRange(x)).filter(Boolean);

/** The number format for a cell: a per-cell entry wins over its column's. */
function formatOf(formats, a) {
  if (!formats) return 'general';
  if (formats[a]) return formats[a];
  const col = a.replace(/\d+$/, '');
  return formats[col] || 'general';
}

/** Conditional formatting, as Excel applies it: `rules` are in precedence order (the first is at the top of Excel's
 *  Rules Manager). Where two rules would set the same thing (a fill, a data bar, a colour scale, an icon), the higher
 *  rule wins; rules that set different things both show. A rule with `stop: true` (Stop If True) stops the rules below
 *  it for every cell it matches. Returns Map(addr → { cls, bar, scale, icon }). */
export function applyRules(sheet, rules = []) {
  const out = new Map();
  const stopped = new Set();
  for (const rule of rules) {
    const rg = parseRange(rule.range);
    if (!rg) continue;
    const cells = [];
    for (let r = rg.r0; r <= rg.r1; r++) for (let c = rg.c0; c <= rg.c1; c++) { const a = addr(r, c); cells.push({ a, r, c, v: sheet.get(a) }); }
    const nums = cells.map((x) => x.v).filter((v) => typeof v === 'number');
    const hits = [];
    const set = (a, patch) => {
      if (stopped.has(a)) return;
      hits.push(a);
      const cur = out.get(a) || {};
      const add = Object.fromEntries(Object.entries(patch).filter(([k]) => cur[k] === undefined && !(k === 'scaleKind' && cur.scale !== undefined)));
      out.set(a, { ...cur, ...add });
    };
    const lo = Math.min(...nums), hi = Math.max(...nums);
    switch (rule.type) {
      case 'greater': case 'less': case 'between': case 'equal': case 'text': {
        cells.forEach(({ a, v }) => {
          let hit = false;
          if (rule.type === 'greater') hit = typeof v === 'number' && v > rule.value;
          if (rule.type === 'less') hit = typeof v === 'number' && v < rule.value;
          if (rule.type === 'between') hit = typeof v === 'number' && v >= rule.value && v <= rule.value2;
          if (rule.type === 'equal') hit = criterion(rule.value)(v);
          if (rule.type === 'text') hit = typeof v === 'string' && v.toLowerCase().includes(String(rule.value).toLowerCase());
          if (hit) set(a, { cls: `cf-${rule.style || 'bad'}` });
        });
        break;
      }
      case 'top': case 'bottom': {
        const n = rule.percent ? Math.max(1, Math.floor(nums.length * rule.value / 100)) : rule.value;
        const sorted = [...nums].sort((x, y) => (rule.type === 'top' ? y - x : x - y));
        const cut = sorted[Math.min(n, sorted.length) - 1];
        cells.forEach(({ a, v }) => { if (typeof v === 'number' && (rule.type === 'top' ? v >= cut : v <= cut)) set(a, { cls: `cf-${rule.style || 'good'}` }); });
        break;
      }
      case 'above': case 'below': {
        const m = nums.reduce((s, x) => s + x, 0) / nums.length;
        cells.forEach(({ a, v }) => { if (typeof v === 'number' && (rule.type === 'above' ? v > m : v < m)) set(a, { cls: `cf-${rule.style || 'good'}` }); });
        break;
      }
      case 'duplicate': {
        const key = (v) => (typeof v === 'string' ? v.toLowerCase() : String(v));
        const count = new Map(); cells.forEach(({ v }) => { if (v != null && v !== '') count.set(key(v), (count.get(key(v)) || 0) + 1); });
        cells.forEach(({ a, v }) => { if (v != null && v !== '' && count.get(key(v)) > 1) set(a, { cls: `cf-${rule.style || 'warn'}` }); });
        break;
      }
      case 'bar': {
        // data bars: length in proportion to the value, from zero (or the minimum if every value is negative)
        const top = Math.max(hi, 0), bottom = Math.min(lo, 0), span = top - bottom || 1;
        cells.forEach(({ a, v }) => { if (typeof v === 'number') set(a, { bar: { from: (0 - bottom) / span, to: (v - bottom) / span } }); });
        break;
      }
      case 'scale': {
        // a two-colour scale from low (rule.low, default the light end) to high
        cells.forEach(({ a, v }) => { if (typeof v === 'number') set(a, { scale: hi === lo ? 0.5 : (v - lo) / (hi - lo), scaleKind: rule.reverse ? 'rev' : 'fwd' }); });
        break;
      }
      case 'icons': {
        // three arrows by default thresholds: up from 67% of the way from the lowest to the highest value, sideways
        // from 33%, down below (Excel's default "Percent" thresholds for a three-icon set)
        const p = rule.thresholds || [67, 33];
        cells.forEach(({ a, v }) => {
          if (typeof v !== 'number') return;
          const at = hi === lo ? 100 : ((v - lo) / (hi - lo)) * 100;
          set(a, { icon: at >= p[0] ? 'up' : at >= p[1] ? 'side' : 'down' });
        });
        break;
      }
      case 'formula': {
        // a rule written as a formula for the top-left cell, moved to every other cell as Excel does
        cells.forEach(({ a, r, c }) => {
          let res = null;
          try { res = evaluate(shiftFormula(rule.formula, r - rg.r0, c - rg.c0), sheet, { at: a }); } catch { res = null; }
          if (res === true || (typeof res === 'number' && res !== 0)) set(a, { cls: `cf-${rule.style || 'good'}` });
        });
        break;
      }
      default: break;
    }
    if (rule.stop) hits.forEach((a) => stopped.add(a));
  }
  return out;
}
const ICON = { up: ['▲', 'upper third'], side: ['▶', 'middle third'], down: ['▼', 'lower third'] };

export function sheetGrid(opts) {
  const id = `sg${++gid}`;
  let sheet = opts.sheet;
  const view = parseRange(opts.view || 'A1:F10');
  const marks = ranges(opts.mark);
  const editRanges = opts.editable === true ? [view] : ranges(opts.editable);
  const canEdit = (a) => { const p = parseAddr(a); return editRanges.some((rg) => inRange(rg, p.r, p.c)); };
  let showFormulas = false, rules = opts.rules || [];
  let sel = parseAddr(opts.select || addr(view.r0, view.c0));

  const name = h('span', { class: 'sg-name', 'aria-hidden': 'true' });
  const fxId = `${id}-fx`;
  const fx = editRanges.length
    ? h('input', { class: 'sg-fx', id: fxId, type: 'text', autocomplete: 'off', spellcheck: 'false', autocapitalize: 'off', 'aria-label': 'Formula bar' })
    : h('output', { class: 'sg-fx is-read', id: fxId, 'aria-label': 'Formula bar' });
  const bar = h('div', { class: 'sg-bar' }, name, h('span', { class: 'sg-fx-label', 'aria-hidden': 'true' }, 'fx'), fx);
  const live = h('p', { class: 'visually-hidden', 'aria-live': 'polite' });

  const cols = []; for (let c = view.c0; c <= view.c1; c++) cols.push(c);
  const tds = new Map();
  const head = h('tr', {}, h('th', { class: 'sg-corner', scope: 'col' }, h('span', { class: 'visually-hidden' }, 'Row')),
    cols.map((c) => { const L = indexToCol(c); const w = opts.widths?.[L]; return h('th', { class: 'sg-col', scope: 'col', style: w ? `min-width:${w}ch` : null }, L); }));
  const body = [];
  for (let r = view.r0; r <= view.r1; r++) {
    const tr = h('tr', {}, h('th', { class: 'sg-row', scope: 'row' }, String(r + 1)));
    for (const c of cols) {
      const a = addr(r, c);
      const td = h('td', { role: 'gridcell', tabindex: '-1', 'data-a': a, id: `${id}-${a}` });
      if (marks.some((rg) => inRange(rg, r, c))) td.classList.add('is-mark');
      tds.set(a, td); tr.append(td);
    }
    body.push(tr);
  }
  const table = h('table', { class: 'sg-grid', role: 'grid', 'aria-label': opts.label || 'Spreadsheet', 'aria-readonly': editRanges.length ? 'false' : 'true' },
    h('thead', {}, head), h('tbody', {}, body));
  const scroll = h('div', { class: 'sg-scroll', style: opts.maxHeight ? `max-height:${opts.maxHeight}` : null }, table);
  const circ = h('p', { class: 'sg-msg is-bad', role: 'status', hidden: true });
  const el = h('div', { class: 'sg' }, bar, scroll, circ, live);

  function cellText(a) {
    const raw = sheet.raw(a);
    if (showFormulas && typeof raw === 'string' && raw.startsWith('=')) return { text: raw, cls: 'is-f' };
    const v = sheet.get(a);
    const text = display(v, formatOf(opts.formats, a));
    const cls = isErr(v) ? 'is-err' : typeof v === 'number' ? 'is-num' : typeof v === 'boolean' ? 'is-bool' : '';
    return { text, cls };
  }
  function paint(a) {
    const td = tds.get(a); if (!td) return;
    const { text, cls } = cellText(a);
    td.textContent = text;
    td.classList.remove('is-num', 'is-err', 'is-bool', 'is-f', 'cf-good', 'cf-bad', 'cf-warn', 'has-bar', 'has-scale');
    td.style.removeProperty('--bar-from'); td.style.removeProperty('--bar-to'); td.style.removeProperty('--scale');
    if (cls) td.classList.add(cls);
    const raw = sheet.raw(a);
    td.classList.toggle('has-formula', typeof raw === 'string' && raw.startsWith('='));
    const cf = cfMap.get(a);
    if (cf && !showFormulas) {
      if (cf.icon) td.prepend(h('span', { class: `sg-icon sg-icon-${cf.icon}`, 'aria-hidden': 'true' }, ICON[cf.icon][0]), h('span', { class: 'visually-hidden' }, `(${ICON[cf.icon][1]}) `));
      if (cf.cls) td.classList.add(cf.cls);
      if (cf.bar) { td.classList.add('has-bar'); td.style.setProperty('--bar-from', String(Math.min(cf.bar.from, cf.bar.to))); td.style.setProperty('--bar-to', String(Math.max(cf.bar.from, cf.bar.to))); }
      if (cf.scale != null) { td.classList.add('has-scale'); td.style.setProperty('--scale', String(cf.scaleKind === 'rev' ? 1 - cf.scale : cf.scale)); }
    }
  }
  let cfMap = new Map();
  function refresh() {
    cfMap = applyRules(sheet, rules);
    for (const a of tds.keys()) paint(a);
    // a circular reference: Excel shows a warning and 0 in the cells involved, and so does this sheet
    const loop = [...(sheet.circular || [])];
    circ.hidden = !loop.length;
    circ.textContent = loop.length ? `Circular reference: ${loop.join(', ')} refers back to itself, directly or through other cells. Excel warns you and shows 0; remove the loop.` : '';
    showSel(false);
  }
  function describe(a) {
    const raw = sheet.raw(a), v = sheet.get(a);
    const shown = display(v, formatOf(opts.formats, a)) || 'empty';
    return typeof raw === 'string' && raw.startsWith('=') ? `${a}: ${shown}. Formula ${raw}` : `${a}: ${shown}`;
  }
  function showSel(focus = true, announce = false) {
    const a = addr(sel.r, sel.c);
    tds.forEach((td, k) => { const on = k === a; td.classList.toggle('is-sel', on); td.setAttribute('aria-selected', on ? 'true' : 'false'); td.tabIndex = on ? 0 : -1; });
    name.textContent = a;
    const raw = sheet.raw(a);
    const shown = raw == null ? '' : typeof raw === 'number' ? String(raw) : typeof raw === 'boolean' ? (raw ? 'TRUE' : 'FALSE') : String(raw);
    if (fx.tagName === 'INPUT') { if (document.activeElement !== fx) fx.value = shown; fx.readOnly = !canEdit(a); fx.setAttribute('aria-label', `Formula bar for ${a}${canEdit(a) ? '' : ' (this cell is locked)'}`); }
    else fx.textContent = shown;
    const td = tds.get(a);
    if (focus && td) { td.focus({ preventScroll: true }); td.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
    if (announce) live.textContent = describe(a);
    opts.onSelect?.(a);
  }
  function move(dr, dc) {
    sel = { r: Math.min(view.r1, Math.max(view.r0, sel.r + dr)), c: Math.min(view.c1, Math.max(view.c0, sel.c + dc)) };
    showSel(true, true);
  }
  let editStart = '';
  function startEdit(initial = null) {
    const a = addr(sel.r, sel.c);
    if (fx.tagName !== 'INPUT' || !canEdit(a)) { if (editRanges.length) live.textContent = `${a} is locked: it holds the data.`; return; }
    editStart = fx.value;
    if (initial != null) fx.value = initial;
    fx.focus();
    const n = fx.value.length; fx.setSelectionRange(n, n);
  }
  function commit(dr, dc) {
    const a = addr(sel.r, sel.c);
    if (!canEdit(a)) return;
    const t = fx.value.trim();
    let v = t;
    if (t === '') v = null;
    else if (!t.startsWith('=')) {
      const n = Number(t.replace(/,/g, ''));
      if (/^[-+]?(\d[\d,]*\.?\d*|\.\d+)(e[-+]?\d+)?%?$/i.test(t)) v = t.endsWith('%') ? Number(t.slice(0, -1).replace(/,/g, '')) / 100 : n;
      else if (/^(true|false)$/i.test(t)) v = /^true$/i.test(t);
    }
    sheet.set(a, v);
    opts.onEdit?.(a, v);
    refresh();
    live.textContent = describe(a);
    if (dr || dc) move(dr, dc); else showSel(true);
  }
  table.addEventListener('keydown', (e) => {
    const k = e.key;
    if (k === 'ArrowDown') { move(1, 0); e.preventDefault(); }
    else if (k === 'ArrowUp') { move(-1, 0); e.preventDefault(); }
    else if (k === 'ArrowRight') { move(0, 1); e.preventDefault(); }
    else if (k === 'ArrowLeft') { move(0, -1); e.preventDefault(); }
    else if (k === 'Home') { if (e.ctrlKey || e.metaKey) sel = { r: view.r0, c: view.c0 }; else sel = { r: sel.r, c: view.c0 }; showSel(true, true); e.preventDefault(); }
    else if (k === 'End') { if (e.ctrlKey || e.metaKey) sel = { r: view.r1, c: view.c1 }; else sel = { r: sel.r, c: view.c1 }; showSel(true, true); e.preventDefault(); }
    else if (k === 'PageDown') { move(10, 0); e.preventDefault(); }
    else if (k === 'PageUp') { move(-10, 0); e.preventDefault(); }
    else if (k === 'Enter' || k === 'F2') { if (editRanges.length) { startEdit(); e.preventDefault(); } }
    else if ((k === 'Delete' || k === 'Backspace') && fx.tagName === 'INPUT' && canEdit(addr(sel.r, sel.c))) { fx.value = ''; commit(0, 0); e.preventDefault(); }
    else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && editRanges.length) { startEdit(k); e.preventDefault(); }
  });
  table.addEventListener('click', (e) => {
    const td = e.target.closest('td[data-a]'); if (!td) return;
    sel = parseAddr(td.dataset.a); showSel(true, true);
  });
  table.addEventListener('dblclick', (e) => { if (e.target.closest('td[data-a]') && editRanges.length) startEdit(); });
  if (fx.tagName === 'INPUT') {
    fx.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); commit(e.shiftKey ? -1 : 1, 0); }
      else if (e.key === 'Tab' && fx.value !== editStart) { e.preventDefault(); commit(0, e.shiftKey ? -1 : 1); }
      else if (e.key === 'Escape') { e.preventDefault(); fx.value = editStart; showSel(true); }
    });
    fx.addEventListener('focus', () => { editStart = fx.value; });
  }
  refresh();
  return {
    el, get sheet() { return sheet; },
    refresh,
    select(a) { sel = parseAddr(a); showSel(false); },
    selected: () => addr(sel.r, sel.c),
    setShowFormulas(b) { showFormulas = b; table.classList.toggle('is-formulas', b); refresh(); },
    setSheet(s) { sheet = s; refresh(); },
    setRules(r) { rules = r || []; refresh(); },
    focus() { showSel(true); },
  };
}
