// sheet.js — the "sheet" lesson widget: a small working spreadsheet (B03). Students type values and formulas into the
// editable cells and see everything recalculate; optional tools are the ones a lesson teaches:
//   { type: 'sheet', title, sheet: { cells, tables, names }, view: 'A1:F13', formats, widths, editable: true | 'H2:H13',
//     mark, rules: [conditional-format rules], note,
//     tools: ['formulas', 'fill', 'goalseek', 'datatable', 'solver', 'cf', 'reset'], controls: [{ cell, label, options }],
//     goalseek: { target, goal, changing },
//     datatable: { target, input, values: [..], input2?, values2?: [..], format? },
//     solver: { objective, sense: 'max' | 'min' | 'value', target?, changing: ['C3:C5'], integer: [..],
//               constraints: [{ cell, op, rhs, label }], nonNegative: true } }
import { h } from '../../core/dom.js?v=20';
import { xl } from '../xl.js?v=20';
import * as X from '../../core/sheet.js?v=20';
import { sheetGrid } from '../sheetgrid.js?v=20';

// numbers in messages: 10 significant figures, and a solver's leftover (under a millionth) shown as 0
const fmtNum = (v) => (typeof v === 'number' ? X.display(Math.abs(v) < 1e-6 ? 0 : Number(v.toPrecision(10))) : X.display(v));
function field(id, label, input) { input.id = id; return h('div', { class: 'field' }, h('label', { for: id }, label), input); }
const text = (value, extra = {}) => h('input', { class: 'input', type: 'text', value: value ?? '', autocomplete: 'off', spellcheck: 'false', ...extra });

export function mount(el, cfg, ctx) {
  const base = `sh-${ctx.id}`;
  const original = new X.Sheet(cfg.sheet);
  let sheet = original.clone();
  const grid = sheetGrid({ sheet, view: cfg.view, formats: cfg.formats, widths: cfg.widths, mark: cfg.mark, editable: cfg.editable ?? true, rules: cfg.rules, label: cfg.title || 'Worksheet', maxHeight: cfg.maxHeight, onEdit: (a) => ctx.report?.('edit', { cell: a }) });
  const tools = cfg.tools || ['formulas', 'reset'];
  // `controls`: drop-down lists that set an input cell, as a data-validation list does in Excel:
  // [{ cell: 'B2', label: 'Month', options: [[3, 'March'], [4, 'April']] | ['North', 'South'] }]
  const ctlReset = [];
  const controls = (cfg.controls || []).map((c, i) => {
    const opts = c.options.map((o) => (Array.isArray(o) ? o : [o, String(o)]));
    const sel = h('select', { class: 'select', id: `${base}-ctl-${i}` }, opts.map(([v, l], k) => h('option', { value: k, selected: v === original.raw(c.cell) }, l)));
    sel.addEventListener('change', () => { sheet.set(c.cell, opts[+sel.value][0]); grid.refresh(); ctx.report?.('control', { cell: c.cell }); });
    ctlReset.push(() => { sel.value = String(Math.max(0, opts.findIndex(([v]) => v === original.raw(c.cell)))); });
    return h('div', { class: 'field' }, h('label', { for: sel.id }, `${c.label} (${c.cell})`), sel);
  });
  const bar = h('div', { class: 'sg-tools' });
  const panels = h('div', { class: 'sg-panels' });
  const msg = (box, kind, str) => { box.className = `sg-msg${kind ? ` is-${kind}` : ''}`; box.textContent = str; };
  const replaceSheet = (s) => { sheet = s; grid.setSheet(s); };
  const view = X.parseRange(cfg.view);

  if (tools.includes('formulas')) {
    const b = h('button', { type: 'button', class: 'tool-btn', 'aria-pressed': 'false' }, 'Show formulas');
    b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); grid.setShowFormulas(on); });
    bar.append(b);
  }
  if (tools.includes('fill')) {
    // Fill down: copy the selected cell's formula to the rows below, as far as the data next to it goes (as a double
    // click on Excel's fill handle does). Fill right: across to the last column with a heading in the view's top row.
    const status = h('p', { class: 'visually-hidden', 'aria-live': 'polite' });
    const fill = (dir) => {
      const a = grid.selected(), p = X.parseAddr(a), f = sheet.raw(a);
      if (typeof f !== 'string' || !f.startsWith('=')) { status.textContent = `${a} has no formula to fill.`; return; }
      let n = 0;
      if (dir === 'down') {
        const hasData = (r) => [p.c - 1, p.c + 1].some((c) => c >= view.c0 && c <= view.c1 && sheet.raw(X.addr(r, c)) != null);
        for (let r = p.r + 1; r <= view.r1 && hasData(r); r++) { sheet.set(X.addr(r, p.c), X.shiftFormula(f, r - p.r, 0)); n++; }
      } else {
        for (let c = p.c + 1; c <= view.c1 && sheet.raw(X.addr(view.r0, c)) != null; c++) { sheet.set(X.addr(p.r, c), X.shiftFormula(f, 0, c - p.c)); n++; }
      }
      grid.refresh();
      status.textContent = n ? `Filled ${a} ${dir} into ${n} cell${n === 1 ? '' : 's'}.` : `Nothing to fill ${dir} into: Fill ${dir} stops where the data next to it ends.`;
    };
    bar.append(h('button', { type: 'button', class: 'tool-btn', onclick: () => fill('down') }, 'Fill down'),
      h('button', { type: 'button', class: 'tool-btn', onclick: () => fill('right') }, 'Fill right'), status);
  }
  const toggles = [];
  const panel = (key, label, build) => {
    if (!tools.includes(key)) return;
    const box = h('section', { class: 'sg-panel', id: `${base}-${key}`, hidden: true, 'aria-label': label });
    build(box);
    const b = h('button', { type: 'button', class: 'tool-btn', 'aria-expanded': 'false', 'aria-controls': box.id }, label);
    b.addEventListener('click', () => { const open = box.hidden; toggles.forEach(([x, y]) => { x.hidden = true; y.setAttribute('aria-expanded', 'false'); }); box.hidden = !open; b.setAttribute('aria-expanded', String(open)); if (open) box.querySelector('input, select, button')?.focus(); });
    toggles.push([box, b]);
    bar.append(b); panels.append(box);
  };

  panel('goalseek', 'Goal Seek', (box) => {
    const gs = cfg.goalseek || {};
    const set = text(gs.target), to = text(gs.goal ?? 0, { inputmode: 'decimal' }), by = text(gs.changing);
    const out = h('p', { class: 'sg-msg', 'aria-live': 'polite' });
    let before = null;
    const undo = h('button', { type: 'button', class: 'btn btn-secondary btn-sm', hidden: true }, 'Put the old value back');
    const run = h('button', { type: 'button', class: 'btn btn-primary btn-sm' }, 'OK');
    run.addEventListener('click', () => {
      const t = set.value.trim().toUpperCase(), c = by.value.trim().toUpperCase(), goal = Number(to.value);
      if (!X.parseAddr(t) || !X.parseAddr(c)) return msg(out, 'bad', 'Give a single cell for “Set cell” and “By changing cell”, like B8.');
      if (!Number.isFinite(goal)) return msg(out, 'bad', '“To value” must be a number.');
      if (!sheet.isFormula(t)) return msg(out, 'bad', `“Set cell” must contain a formula: ${t} doesn’t.`);
      if (sheet.isFormula(c)) return msg(out, 'bad', `“By changing cell” must contain a value, not a formula: ${c} has a formula.`);
      before = { cell: c, value: sheet.raw(c) };
      const r = X.goalSeek(sheet, { target: t, goal, changing: c });
      if (!r.ok) { msg(out, 'bad', `Goal Seek may not have found a solution: no value of ${c} it tried made ${t} equal ${fmtNum(goal)}.`); before = null; return; }
      sheet.set(c, Number(r.value.toPrecision(12))); grid.refresh();
      msg(out, 'good', `Goal Seek found a solution: ${c} = ${fmtNum(r.value)}, which makes ${t} = ${fmtNum(sheet.get(t))}.`);
      undo.hidden = false; ctx.report?.('goalseek', { t, c });
    });
    undo.addEventListener('click', () => { if (before) { sheet.set(before.cell, before.value); grid.refresh(); msg(out, '', `${before.cell} is back to ${fmtNum(before.value)}.`); } undo.hidden = true; });
    box.append(h('h4', {}, 'Goal Seek'), h('div', { class: 'sg-fields' }, field(`${base}-gs-set`, 'Set cell', set), field(`${base}-gs-to`, 'To value', to), field(`${base}-gs-by`, 'By changing cell', by)), h('div', { class: 'sg-tools' }, run, undo), out);
  });

  panel('datatable', 'Data table', (box) => {
    const dt = cfg.datatable || {};
    const tgt = text(dt.target), inp = text(dt.input), vals = text((dt.values || []).join(', '));
    const inp2 = dt.input2 ? text(dt.input2) : null, vals2 = dt.input2 ? text((dt.values2 || []).join(', ')) : null;
    const out = h('div', { class: 'table-scroll' });
    const note = h('p', { class: 'sg-msg', 'aria-live': 'polite' });
    const go = h('button', { type: 'button', class: 'btn btn-primary btn-sm' }, 'Make the table');
    const nums = (s) => s.split(/[,;\s]+/).filter(Boolean).map(Number);
    go.addEventListener('click', () => {
      const t = tgt.value.trim().toUpperCase(), a = inp.value.trim().toUpperCase(), xs = nums(vals.value);
      if (!X.parseAddr(t) || !X.parseAddr(a) || !xs.length || xs.some((v) => !Number.isFinite(v))) return msg(note, 'bad', 'Give the output cell, the input cell and a list of numbers for the input.');
      const show = (v) => X.display(v, dt.format || 'general');
      if (!inp2) {
        const res = X.dataTable(sheet, { target: t, rowInput: a, rowValues: xs });
        out.replaceChildren(h('table', { class: 'data-table study-table' }, h('caption', {}, `${t} for each value of ${a}`),
          h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, a), h('th', { scope: 'col' }, t))),
          h('tbody', {}, xs.map((x, i) => h('tr', {}, h('th', { scope: 'row' }, fmtNum(x)), h('td', { class: 'is-num' }, show(res[i])))))));
      } else {
        const b = inp2.value.trim().toUpperCase(), ys = nums(vals2.value);
        if (!X.parseAddr(b) || !ys.length || ys.some((v) => !Number.isFinite(v))) return msg(note, 'bad', 'Give the second input cell and its list of numbers.');
        const res = X.dataTable(sheet, { target: t, rowInput: a, rowValues: xs, colInput: b, colValues: ys });
        out.replaceChildren(h('table', { class: 'data-table study-table' }, h('caption', {}, `${t}: ${a} down the side, ${b} across the top`),
          h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, `${a} \\ ${b}`), ys.map((y) => h('th', { scope: 'col' }, fmtNum(y))))),
          h('tbody', {}, xs.map((x, i) => h('tr', {}, h('th', { scope: 'row' }, fmtNum(x)), ys.map((_, j) => h('td', { class: 'is-num' }, show(res[i][j]))))))));
      }
      msg(note, '', 'The sheet itself is unchanged: a data table recalculates the model once for each input value.');
      ctx.report?.('datatable', {});
    });
    box.append(h('h4', {}, 'Data table'), h('div', { class: 'sg-fields' }, field(`${base}-dt-t`, 'Formula (output) cell', tgt), field(`${base}-dt-a`, 'Column input cell', inp), field(`${base}-dt-v`, 'Values down the side', vals),
      inp2 ? field(`${base}-dt-b`, 'Row input cell', inp2) : null, vals2 ? field(`${base}-dt-w`, 'Values across the top', vals2) : null), h('div', { class: 'sg-tools' }, go), note, out);
  });

  panel('solver', 'Solver', (box) => {
    const sv = cfg.solver || {};
    const cons = (sv.constraints || []).map((k, i) => {
      const cb = h('input', { type: 'checkbox', checked: true, id: `${base}-sv-c${i}` });
      return { k, cb, row: h('label', { for: cb.id }, cb, h('span', {}, `${k.cell} ${k.op === '<=' ? '≤' : k.op === '>=' ? '≥' : '='} ${k.rhs}${k.label ? `  (${k.label})` : ''}`)) };
    });
    const nonneg = h('input', { type: 'checkbox', checked: sv.nonNegative !== false, id: `${base}-sv-nn` });
    const integer = (sv.integer || []).length ? h('input', { type: 'checkbox', checked: true, id: `${base}-sv-int` }) : null;
    const out = h('p', { class: 'sg-msg', 'aria-live': 'polite' });
    let before = null;
    const undo = h('button', { type: 'button', class: 'btn btn-secondary btn-sm', hidden: true }, 'Restore the original values');
    const report = h('div', { class: 'table-scroll' });
    const go = h('button', { type: 'button', class: 'btn btn-primary btn-sm' }, 'Solve');
    go.addEventListener('click', () => {
      const vars = sv.changing.flatMap((rg) => { const q = X.parseRange(rg); const o = []; for (let r = q.r0; r <= q.r1; r++) for (let c = q.c0; c <= q.c1; c++) o.push(X.addr(r, c)); return o; });
      if (!before) before = Object.fromEntries(vars.map((v) => [v, sheet.raw(v)]));
      const r = X.solveSheet(sheet, { objective: sv.objective, sense: sv.sense || 'max', target: sv.target, changing: sv.changing,
        constraints: cons.filter((c) => c.cb.checked).map((c) => c.k), integer: integer?.checked ? sv.integer : [], nonNegative: nonneg.checked });
      if (!r.ok) {
        const why = { infeasible: 'Solver could not find a feasible solution: no values satisfy all the constraints at once.', unbounded: `The objective cell's values do not converge: ${sv.objective} can grow without limit, so a constraint is missing.`, nonlinear: 'The linearity conditions required by this LP Solver are not satisfied: the model is not linear in the changing cells.' };
        report.replaceChildren();
        return msg(out, 'bad', why[r.status] || 'Solver stopped without a solution.');
      }
      replaceSheet(r.sheet);
      msg(out, 'good', `Solver found a solution. ${Object.entries(r.values).map(([k, v]) => `${k} = ${fmtNum(v)}`).join(', ')}; ${sv.objective} = ${fmtNum(r.objective)}.`);
      // a short Answer Report: each active constraint's value, limit, slack and status
      const active = cons.filter((c) => c.cb.checked).map((c) => c.k);
      const rhsVal = (k) => (typeof k.rhs === 'number' ? k.rhs : sheet.get(k.rhs));
      report.replaceChildren(h('table', { class: 'data-table study-table sg-report' }, h('caption', {}, 'Answer report: constraints'),
        h('thead', {}, h('tr', {}, ['Constraint', 'Cell value', 'Limit', 'Slack', 'Status'].map((t) => h('th', { scope: 'col' }, t)))),
        h('tbody', {}, active.map((k) => {
          const v = sheet.get(k.cell), lim = rhsVal(k), slack = Math.abs(lim - v);
          return h('tr', {}, h('th', { scope: 'row' }, `${k.cell} ${k.op === '<=' ? '≤' : k.op === '>=' ? '≥' : '='} ${k.rhs}${k.label ? ` (${k.label})` : ''}`), h('td', { class: 'is-num' }, fmtNum(v)), h('td', { class: 'is-num' }, fmtNum(lim)), h('td', { class: 'is-num' }, fmtNum(slack)), h('td', {}, slack < 1e-6 ? 'Binding' : 'Not binding'));
        }))));
      undo.hidden = false; ctx.report?.('solver', {});
    });
    undo.addEventListener('click', () => { if (before) { Object.entries(before).forEach(([k, v]) => sheet.set(k, v)); grid.refresh(); before = null; report.replaceChildren(); msg(out, '', 'The changing cells are back to their starting values.'); } undo.hidden = true; });
    const senseText = sv.sense === 'min' ? 'Min' : sv.sense === 'value' ? `Value of ${sv.target}` : 'Max';
    box.append(h('h4', {}, 'Solver'),
      h('p', { class: 'small' }, h('strong', {}, 'Set objective: '), h('code', { class: 'sg-code' }, sv.objective), ` · To: ${senseText} · `, h('strong', {}, 'By changing: '), h('code', { class: 'sg-code' }, sv.changing.join(', '))),
      h('div', { class: 'sg-cons', role: 'group', 'aria-label': 'Subject to the constraints' }, h('strong', {}, 'Subject to the constraints'), cons.map((c) => c.row)),
      h('div', { class: 'sg-cons' }, h('label', { for: nonneg.id }, nonneg, h('span', {}, 'Make unconstrained variables non-negative')),
        integer ? h('label', { for: integer.id }, integer, h('span', {}, `${sv.integer.join(', ')} = integer`)) : null),
      h('p', { class: 'small muted' }, 'Solving method: Simplex LP.'),
      h('div', { class: 'sg-tools' }, go, undo), out, report);
  });

  panel('cf', 'Conditional formatting', (box) => {
    const rules = [...(cfg.rules || [])];
    const range = text(cfg.cf?.range || cfg.mark || '');
    const kind = h('select', { class: 'select' }, [['greater', 'Greater than'], ['less', 'Less than'], ['between', 'Between'], ['top', 'Top N items'], ['bottom', 'Bottom N items'], ['above', 'Above average'], ['below', 'Below average'], ['duplicate', 'Duplicate values'], ['bar', 'Data bars'], ['scale', 'Colour scale'], ['icons', 'Icon set (3 arrows)'], ['formula', 'Use a formula']].map(([v, l]) => h('option', { value: v }, l)));
    const v1 = text('', { inputmode: 'decimal' }), v2 = text('', { inputmode: 'decimal' });
    const style = h('select', { class: 'select' }, [['good', 'Green fill'], ['bad', 'Red fill'], ['warn', 'Yellow fill']].map(([v, l]) => h('option', { value: v }, l)));
    const f1 = field(`${base}-cf-v1`, 'Value', v1), f2 = field(`${base}-cf-v2`, 'and', v2), fs = field(`${base}-cf-s`, 'Format with', style);
    const sync = () => {
      const k = kind.value;
      f1.hidden = ['above', 'below', 'duplicate', 'bar', 'scale', 'icons'].includes(k); f2.hidden = k !== 'between'; fs.hidden = ['bar', 'scale', 'icons'].includes(k);
      f1.querySelector('label').textContent = k === 'formula' ? 'Formula for the first cell' : ['top', 'bottom'].includes(k) ? 'How many' : 'Value';
    };
    kind.addEventListener('change', sync); sync();
    const out = h('p', { class: 'sg-msg', 'aria-live': 'polite' });
    const list = h('ol', { class: 'sg-rules', 'aria-label': 'Rules, highest precedence first' });
    const KIND = Object.fromEntries([...kind.options].map((o) => [o.value, o.textContent]));
    const describe = (ru) => `${ru.range}: ${KIND[ru.type] || ru.type}${ru.type === 'formula' ? ` ${ru.formula}` : ru.value != null ? ` ${ru.value}${ru.value2 != null ? ` and ${ru.value2}` : ''}` : ''}${ru.style && !['bar', 'scale', 'icons'].includes(ru.type) ? ` (${{ good: 'green', bad: 'red', warn: 'yellow' }[ru.style]} fill)` : ''}`;
    function drawList() {
      list.replaceChildren(...rules.map((ru, i) => {
        const stopId = `${base}-cf-stop-${i}`;
        const stop = h('input', { type: 'checkbox', id: stopId, checked: !!ru.stop });
        stop.addEventListener('change', () => { ru.stop = stop.checked; grid.setRules(rules); });
        const mv = (d, label) => h('button', { type: 'button', class: 'btn-text', disabled: i + d < 0 || i + d >= rules.length, 'aria-label': `${label}: ${describe(ru)}`, onclick: () => { [rules[i], rules[i + d]] = [rules[i + d], rules[i]]; grid.setRules(rules); drawList(); msg(out, '', `Moved ${label === 'Move up' ? 'up' : 'down'}: it is now rule ${i + d + 1} of ${rules.length}.`); } }, label);
        return h('li', {}, h('span', { class: 'sg-rule-text' }, `${i + 1}. ${describe(ru)}`), h('label', { for: stopId }, stop, 'Stop If True'), mv(-1, 'Move up'), mv(1, 'Move down'),
          h('button', { type: 'button', class: 'btn-text', 'aria-label': `Delete rule: ${describe(ru)}`, onclick: () => { rules.splice(i, 1); grid.setRules(rules); drawList(); msg(out, '', 'Rule deleted.'); } }, 'Delete'));
      }));
      list.hidden = !rules.length;
    }
    const add = h('button', { type: 'button', class: 'btn btn-primary btn-sm' }, 'Apply');
    const clear = h('button', { type: 'button', class: 'btn btn-secondary btn-sm' }, 'Clear rules');
    add.addEventListener('click', () => {
      const rg = range.value.trim().toUpperCase();
      if (!X.parseRange(rg)) return msg(out, 'bad', 'Give the range to format, like F2:F13.');
      const k = kind.value, rule = { range: rg, type: k, style: style.value };
      if (k === 'formula') { if (!v1.value.trim().startsWith('=')) return msg(out, 'bad', 'Write the rule as a formula for the first cell of the range, starting with =.'); rule.formula = v1.value.trim(); }
      else if (!f1.hidden) { rule.value = Number(v1.value); if (!Number.isFinite(rule.value)) return msg(out, 'bad', 'The value must be a number.'); }
      if (k === 'between') { rule.value2 = Number(v2.value); if (!Number.isFinite(rule.value2)) return msg(out, 'bad', 'Give both ends of the range.'); }
      rules.unshift(rule); grid.setRules(rules); drawList();
      msg(out, 'good', `Rule added to ${rg}, at the top of the list. As in Excel, a new rule takes precedence: where two rules set the same fill, the higher one wins.`);
      ctx.report?.('cf', { type: k });
    });
    clear.addEventListener('click', () => { rules.length = 0; grid.setRules(rules); drawList(); msg(out, '', 'All rules cleared.'); });
    drawList();
    box.append(h('h4', {}, 'Conditional formatting'), h('div', { class: 'sg-fields' }, field(`${base}-cf-r`, 'Apply to range', range), field(`${base}-cf-k`, 'Rule', kind), f1, f2, fs), h('div', { class: 'sg-tools' }, add, clear), out,
      h('p', { class: 'small' }, h('strong', {}, 'Rules on this sheet'), ' (the first takes precedence)'), list);
  });

  if (tools.includes('reset')) {
    bar.append(h('button', { type: 'button', class: 'btn-text', onclick: () => { replaceSheet(original.clone()); ctlReset.forEach((f) => f()); } }, 'Reset the sheet'));
  }
  el.append(...[
    cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null,
    controls.length ? h('div', { class: 'sg-controls' }, controls) : null,
    grid.el,
    bar.childNodes.length ? bar : null,
    panels.childNodes.length ? panels : null,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null,
  ].filter(Boolean));
}
