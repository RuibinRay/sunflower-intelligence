// exercises.js — renders and marks every exercise type in the course files (see data/study/AUTHORING.md §3):
//   mc, multi, num, fill, classify, order, journal, equation, rows, short, formula (B03), and steps (a multi-step problem).
// Two ways to present them:
//   renderPractice  one card per question with its own Check button. mode 'guided' adds hints and an open
//                   solution; 'independent' has no hints and records the first answer; 'review' asks once.
//   renderQuiz      a form: answer everything, submit once, then marks, feedback, solutions and a score
//                   (knowledge checks, module tests, the diagnostic and the final).
// Prompts, options, feedback and solutions are authored HTML from the course files (trusted, never user input).
import { h, s } from '../core/dom.js?v=14';
import { verdict } from '../core/ui.js?v=14';
import { mulberry32 } from '../core/rng.js?v=14';
import { xl } from './xl.js?v=14';

const LETTERS = 'ABCDEFGHIJ';
const KIND = { conceptual: 'Concept', numerical: 'Calculation', applied: 'Application' };
let counter = 0;
const uid = (p = 'ex') => `${p}-${++counter}`;

// ---------------------------------------------------------------- small helpers
const html = (tag, cls, str) => { const el = h(tag, cls ? { class: cls } : {}); el.innerHTML = xl(str); return el; };
function hashStr(str) { let x = 2166136261; for (let i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
function shuffle(list, seed) {
  const r = mulberry32(seed), a = list.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export const norm = (v) => String(v ?? '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9.]/g, '').replace(/\.$/, '');

/** Parse what a student typed as a number: accepts $, %, thousands commas, spaces, a typographic minus and
 *  accounting parentheses. Returns null when blank, NaN when it can't be read. */
export function parseNum(str) {
  let t = String(str ?? '').trim();
  if (!t) return null;
  let neg = false;
  if (/^\(.*\)$/.test(t)) { neg = true; t = t.slice(1, -1).trim(); }
  t = t.replace(/[−‒–—]/g, '-').replace(/[$€£%\s ]/g, '').replace(/[a-z]+$/i, '');
  if (t.includes(',')) {
    if (!/^[-+]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) return NaN;   // a comma that isn't a thousands separator
    t = t.replace(/,/g, '');
  }
  if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(t)) return NaN;
  const v = parseFloat(t);
  return neg ? -v : v;
}
export function fmtNum(v, places = null) {
  const p = places ?? (Math.abs(v - Math.round(v)) < 1e-9 ? 0 : 2);
  const t = Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: p, maximumFractionDigits: p });
  return v < 0 && Math.abs(v) >= 0.5 * 10 ** -p ? `−${t}` : t;
}
function fmtAnswer(v, item) {
  const n = fmtNum(v, item.places ?? null);
  if (item.unit === '$') return n.startsWith('−') ? `−$${n.slice(1)}` : `$${n}`;
  if (item.unit === '%') return `${n}%`;
  return item.unit ? `${n} ${item.unit}` : n;
}
const money = (v) => fmtNum(v, Math.abs(v - Math.round(v)) < 1e-9 ? 0 : 2);
function tableEl(t, { pick = false, name = '' } = {}) {
  const head = t.head ? h('thead', {}, h('tr', {}, pick ? h('th', { scope: 'col' }, h('span', { class: 'visually-hidden' }, 'Select')) : null, t.head.map((c) => html('th', '', c)))) : null;
  if (head) head.querySelectorAll('th').forEach((th) => th.setAttribute('scope', 'col'));
  const rows = (t.rows || []).map((r, i) => {
    const tr = h('tr', { 'data-row': i });
    if (pick) {
      const id = `${name}-r${i}`;
      tr.append(h('td', {}, h('input', { type: 'checkbox', id, value: i, 'aria-label': `Row ${i + 1}${t.head ? `: ${r.map((c, k) => `${String(t.head[k] ?? '').replace(/<[^>]+>/g, '')} ${String(c).replace(/<[^>]+>/g, '')}`).join(', ')}` : ''}` })));
    }
    r.forEach((c) => { const td = html('td', typeof c === 'number' ? 'is-num' : '', typeof c === 'number' ? fmtNum(c) : String(c ?? '')); tr.append(td); });
    return tr;
  });
  return h('div', { class: 'table-scroll' }, h('table', { class: 'data-table study-table' }, t.caption ? html('caption', '', t.caption) : null, head, h('tbody', {}, rows)));
}
function setMark(el, cls, text) {
  el.classList.remove('is-right', 'is-wrong', 'is-missed');
  el.querySelector(':scope > .option-mark')?.remove();
  if (cls) { el.classList.add(cls); if (text) el.append(h('span', { class: 'option-mark' }, text)); }
}

// ---------------------------------------------------------------- the types
// Each builder returns { body, read(), isEmpty(r), invalid?(r), grade(r) → { correct, score, notes[], mark() },
//                        reveal(), clear(), lock(bool), answerNode() }.
const T = {};

T.mc = (item, c) => {
  const order = shuffle(item.options.map((_, i) => i), c.seed);
  const opts = order.map((oi, k) => {
    const id = `${c.uid}-o${k}`;
    const input = h('input', { type: 'radio', name: c.uid, value: oi, id });
    const lab = h('label', { class: 'option', for: id }, input, h('span', { class: 'option-key', 'aria-hidden': 'true' }, LETTERS[k]), html('span', 'option-text', item.options[oi]));
    return { oi, lab, input };
  });
  return {
    body: h('fieldset', {}, h('legend', { class: 'visually-hidden' }, 'Choose one answer'), h('div', { class: 'options' }, opts.map((o) => o.lab))),
    read: () => opts.find((o) => o.input.checked)?.oi ?? null,
    isEmpty: (r) => r == null,
    grade(r) {
      const correct = r === item.answer;
      return { correct, score: correct ? 1 : 0, notes: !correct && item.feedback?.[r] ? [item.feedback[r]] : [],
        mark: () => opts.forEach((o) => setMark(o.lab, o.oi === r ? (correct ? 'is-right' : 'is-wrong') : null, o.oi === r ? (correct ? 'Right' : 'Your answer') : '')) };
    },
    reveal: () => opts.forEach((o) => { if (o.oi === item.answer && !o.lab.classList.contains('is-right')) setMark(o.lab, 'is-right', 'Correct answer'); }),
    clear: () => opts.forEach((o) => setMark(o.lab, null)),
    lock: (b) => opts.forEach((o) => { o.input.disabled = b; }),
    answerNode: () => html('p', '', item.options[item.answer]),
  };
};

T.multi = (item, c) => {
  const order = shuffle(item.options.map((_, i) => i), c.seed);
  const ans = new Set(item.answer);
  const opts = order.map((oi, k) => {
    const id = `${c.uid}-o${k}`;
    const input = h('input', { type: 'checkbox', value: oi, id });
    const lab = h('label', { class: 'option', for: id }, input, h('span', { class: 'option-key', 'aria-hidden': 'true' }, LETTERS[k]), html('span', 'option-text', item.options[oi]));
    return { oi, lab, input };
  });
  return {
    body: h('fieldset', { class: 'multi' }, h('legend', {}, 'Select all that apply'), h('div', { class: 'options' }, opts.map((o) => o.lab))),
    read: () => opts.filter((o) => o.input.checked).map((o) => o.oi),
    isEmpty: (r) => !r.length,
    grade(r) {
      const sel = new Set(r);
      const right = item.options.filter((_, i) => sel.has(i) === ans.has(i)).length;
      const correct = right === item.options.length;
      const notes = [];
      if (!correct) {
        r.filter((i) => !ans.has(i)).forEach((i) => { if (item.feedback?.[i]) notes.push(item.feedback[i]); });
        item.answer.filter((i) => !sel.has(i)).forEach((i) => { if (item.feedback?.[i]) notes.push(item.feedback[i]); });
        const wrongPicks = r.filter((i) => !ans.has(i)).length, missedN = item.answer.filter((i) => !sel.has(i)).length;
        if (!notes.length) notes.push([wrongPicks ? `${wrongPicks} of your choices ${wrongPicks === 1 ? 'is' : 'are'} not correct.` : '', missedN ? `You missed ${missedN} correct option${missedN === 1 ? '' : 's'}.` : ''].filter(Boolean).join(' '));
      }
      return { correct, score: right / item.options.length, notes,
        mark: () => opts.forEach((o) => setMark(o.lab, sel.has(o.oi) ? (ans.has(o.oi) ? 'is-right' : 'is-wrong') : null, sel.has(o.oi) ? (ans.has(o.oi) ? 'Right' : 'Not this one') : '')) };
    },
    reveal: () => opts.forEach((o) => { if (ans.has(o.oi) && !o.input.checked) setMark(o.lab, 'is-missed', 'Also correct'); }),
    clear: () => opts.forEach((o) => setMark(o.lab, null)),
    lock: (b) => opts.forEach((o) => { o.input.disabled = b; }),
    answerNode: () => h('ul', {}, item.answer.map((i) => html('li', '', item.options[i]))),
  };
};

T.num = (item, c) => {
  const id = `${c.uid}-n`;
  const input = h('input', { class: 'input', id, type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false' });
  const unit = item.unit;
  const box = unit === '$' ? h('div', { class: 'affix' }, h('span', { class: 'affix-pre', 'aria-hidden': 'true' }, '$'), input)
    : unit ? h('div', { class: 'affix' }, input, h('span', { class: 'affix-post', 'aria-hidden': 'true' }, unit)) : input;
  const label = h('label', { for: id }, 'Your answer', unit ? h('span', { class: 'visually-hidden' }, unit === '$' ? ' in dollars' : unit === '%' ? ' as a percentage' : ` in ${unit}`) : null);
  const tol = item.tol ?? Math.max(Math.abs(item.answer) * 0.005, 0.005);
  const near = (v, a, t = tol) => Math.abs(v - a) <= t + 1e-9;
  return {
    body: h('div', { class: 'num-answer' }, h('div', { class: 'field' }, label, box)),
    read: () => parseNum(input.value),
    isEmpty: (r) => r == null,
    invalid: (r) => (Number.isNaN(r) ? 'That doesn’t read as a number. Type digits only, like 1250 or 12.5: a $ sign, % sign and commas between thousands are fine, but use a point for decimals.' : ''),
    grade(v) {
      const a = item.answer;
      const correct = near(v, a);
      const notes = [];
      if (!correct) {
        const w = (item.wrong || []).find((x) => near(v, x.value, x.tol ?? tol));
        if (w) notes.push(w.say);
        else if (a !== 0 && near(-v, a)) notes.push('You have the right size but the wrong sign. Check whether this is an increase or a decrease.');
        else if (unit === '%' && near(v * 100, a)) notes.push('Enter percentages as percentages: 6 means 6%, so type the number before the % sign, not the decimal.');
        else if (a !== 0 && (near(v / 100, a) || near(v * 100, a))) notes.push('Your answer is out by a factor of 100. Check where the decimal point goes, and whether a rate should be a percentage or a decimal.');
        else if (a !== 0 && (near(v / 1000, a) || near(v * 1000, a))) notes.push('Your answer is out by a factor of 1,000. Check the units (thousands or not).');
        else if (a !== 0 && Math.abs(v - a) / Math.abs(a) < 0.02) notes.push(`Close, but outside the rounding allowed. Carry full precision through the working and round only at the end${item.places != null ? ` (to ${item.places} decimal place${item.places === 1 ? '' : 's'})` : ''}.`);
      }
      return { correct, score: correct ? 1 : 0, notes, mark: () => { input.classList.toggle('is-right', correct); input.classList.toggle('is-wrong', !correct); input.setAttribute('aria-invalid', correct ? 'false' : 'true'); } };
    },
    reveal: () => {},
    clear: () => { input.classList.remove('is-right', 'is-wrong'); input.removeAttribute('aria-invalid'); },
    lock: (b) => { input.readOnly = b; },
    answerNode: () => h('p', {}, h('strong', {}, fmtAnswer(item.answer, item))),
  };
};

T.fill = (item, c) => {
  const parts = String(item.text).split(/\[\[(\d+)\]\]/);
  const blanks = [];
  // A word bank (every blank offers the same non-numeric list) is shown in one seeded order, so the answers don't run
  // down the list in the order the blanks appear. Other lists keep the authored order (higher / lower, $10 / $20 …).
  // An option's value stays its index in the data, so grading is unchanged. `fixed: true` keeps the authored order.
  const isNum = (o) => { const v = parseNum(String(o).replace(/<[^>]*>/g, '')); return v != null && !Number.isNaN(v); };
  const lists = item.blanks.filter((b) => b.options).map((b) => JSON.stringify(b.options));
  const bank = !item.fixed && lists.length >= 2 && lists.length === item.blanks.length && lists.every((l) => l === lists[0])
    && !item.blanks[0].options.every(isNum);
  const optOrder = bank ? shuffle(item.blanks[0].options.map((_, k) => k), c.seed) : null;
  const wrap = h('p', { class: 'fill-text' });
  parts.forEach((p, i) => {
    if (i % 2 === 0) { if (p) { const t = h('span'); t.innerHTML = xl(p); wrap.append(t); } return; }
    const n = +p, b = item.blanks[n];
    const id = `${c.uid}-b${n}`;
    let el;
    if (b.options) {
      el = h('select', { class: 'select', id, 'aria-label': `Blank ${n + 1}` }, h('option', { value: '' }, 'Choose…'), (optOrder || b.options.map((_, k) => k)).map((k) => h('option', { value: k }, b.options[k])));
    } else {
      el = h('input', { class: 'input', id, type: 'text', autocomplete: 'off', spellcheck: 'false', 'aria-label': `Blank ${n + 1}`, size: Math.max(10, ...b.accept.map((x) => x.length)) });
    }
    blanks[n] = { b, el };
    wrap.append(el);
  });
  const ok = (bl, v) => (bl.b.options ? v !== '' && +v === bl.b.answer : bl.b.accept.some((x) => norm(x) === norm(v)));
  return {
    body: wrap,
    read: () => blanks.map((bl) => bl.el.value),
    isEmpty: (r) => r.some((v) => String(v).trim() === ''),
    grade(r) {
      const res = blanks.map((bl, i) => ok(bl, r[i]));
      const right = res.filter(Boolean).length;
      const correct = right === blanks.length;
      const notes = correct ? [] : [`${blanks.length - right} of the ${blanks.length} blanks ${blanks.length - right === 1 ? 'is' : 'are'} not right yet.`];
      res.forEach((good, i) => { if (!good && blanks[i].b.feedback) notes.push(blanks[i].b.feedback); });
      return { correct, score: right / blanks.length, notes, mark: () => blanks.forEach((bl, i) => { bl.el.classList.toggle('is-right', res[i]); bl.el.classList.toggle('is-wrong', !res[i]); }) };
    },
    reveal: () => {},
    clear: () => blanks.forEach((bl) => bl.el.classList.remove('is-right', 'is-wrong')),
    lock: (b) => blanks.forEach((bl) => { bl.el.disabled = b; }),
    answerNode: () => {
      const p = h('p');
      p.innerHTML = xl(String(item.text)).replace(/\[\[(\d+)\]\]/g, (_, n) => { const b = item.blanks[+n]; return `<strong>${b.options ? b.options[b.answer] : b.accept[0]}</strong>`; });
      return p;
    },
  };
};

T.classify = (item, c) => {
  // `rows` stays in data order (read and grade use it); the rows are shown in a seeded order so the answers don't
  // follow the order the author wrote them in. `fixed: true` keeps the authored order.
  const rows = item.items.map((txt, i) => {
    const id = `${c.uid}-c${i}`;
    const sel = h('select', { class: 'select', id }, h('option', { value: '' }, 'Choose…'), item.categories.map((cat, k) => h('option', { value: k }, cat)));
    const note = h('p', { class: 'ex-note', hidden: true });
    const lab = h('label', { for: id }); lab.innerHTML = xl(txt);
    return { i, sel, note, row: h('div', { class: 'classify-row' }, lab, sel, note) };
  });
  const shown = item.fixed ? item.items.map((_, i) => i) : shuffle(item.items.map((_, i) => i), c.seed);
  return {
    body: h('div', { class: 'classify-list', role: 'group', 'aria-label': 'Classify each item' }, shown.map((i) => rows[i].row)),
    read: () => rows.map((r) => (r.sel.value === '' ? -1 : +r.sel.value)),
    isEmpty: (r) => r.some((v) => v < 0),
    grade(r) {
      const res = r.map((v, i) => v === item.answer[i]);
      const right = res.filter(Boolean).length, correct = right === rows.length;
      return { correct, score: right / rows.length, notes: correct ? [] : [`${rows.length - right} of the ${rows.length} are not right yet: see the notes beside them.`],
        mark: () => rows.forEach((row, i) => {
          row.sel.classList.toggle('is-right', res[i]); row.sel.classList.toggle('is-wrong', !res[i]);
          row.note.hidden = res[i]; row.note.innerHTML = res[i] ? '' : xl(item.feedback?.[i] || 'Not this category. Think about what this item is, not what it is used for.');
        }) };
    },
    reveal: () => rows.forEach((row, i) => { if (row.sel.classList.contains('is-wrong')) { row.note.hidden = false; row.note.innerHTML = xl(`${item.feedback?.[i] ? `${item.feedback[i]} ` : ''}<strong>Answer: ${item.categories[item.answer[i]]}.</strong>`); } }),
    clear: () => rows.forEach((row) => { row.sel.classList.remove('is-right', 'is-wrong'); row.note.hidden = true; }),
    lock: (b) => rows.forEach((row) => { row.sel.disabled = b; }),
    answerNode: () => h('ul', {}, shown.map((i) => { const li = h('li'); li.innerHTML = xl(`${item.items[i]}: <strong>${item.categories[item.answer[i]]}</strong>`); return li; })),
  };
};

T.order = (item, c) => {
  let order = shuffle(item.items.map((_, i) => i), c.seed);
  if (order.length > 1 && order.every((v, i) => v === i)) order = order.slice(1).concat(order[0]);
  const list = h('ol', { class: 'order-list', role: 'list' });
  const live = h('p', { class: 'visually-hidden', 'aria-live': 'polite' });
  const arrow = (d) => s('svg', { viewBox: '0 0 14 14', 'aria-hidden': 'true' }, s('path', { d: d === 'up' ? 'M3 9l4-4 4 4' : 'M3 5l4 4 4-4', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  let locked = false;
  const plain = (i) => String(item.items[i]).replace(/<[^>]+>/g, '');
  function draw(focus) {
    list.replaceChildren(...order.map((oi, k) => {
      const up = h('button', { type: 'button', class: 'move-btn', 'aria-label': `Move “${plain(oi)}” up`, disabled: locked || k === 0, onclick: () => move(k, -1, 'up') }, arrow('up'));
      const down = h('button', { type: 'button', class: 'move-btn', 'aria-label': `Move “${plain(oi)}” down`, disabled: locked || k === order.length - 1, onclick: () => move(k, 1, 'down') }, arrow('down'));
      return h('li', { class: 'order-row', 'data-i': oi }, html('span', '', item.items[oi]), h('span', { class: 'order-moves' }, up, down));
    }));
    if (focus) { const row = list.children[focus.k]; const btn = row?.querySelector(focus.dir === 'up' ? '.move-btn:first-child' : '.move-btn:last-child'); (btn && !btn.disabled ? btn : row?.querySelector('.move-btn:not([disabled])'))?.focus(); }
  }
  function move(k, d, dir) {
    const j = k + d; if (j < 0 || j >= order.length) return;
    [order[k], order[j]] = [order[j], order[k]];
    draw({ k: j, dir });
    live.textContent = `“${plain(order[j])}” is now number ${j + 1} of ${order.length}.`;
  }
  draw();
  return {
    body: h('div', {}, h('p', { class: 'field-hint' }, 'Put these in order, first at the top. Use the arrow buttons to move an item.'), list, live),
    read: () => order.slice(),
    isEmpty: () => false,
    grade(r) {
      const right = r.filter((v, i) => v === i).length, correct = right === r.length;
      return { correct, score: right / r.length, notes: correct ? [] : [`${r.length - right} of the ${r.length} are in the wrong place.`],
        mark: () => [...list.children].forEach((li, k) => { li.classList.toggle('is-right', r[k] === k); li.classList.toggle('is-wrong', r[k] !== k); }) };
    },
    reveal: () => {},
    clear: () => [...list.children].forEach((li) => li.classList.remove('is-right', 'is-wrong')),
    lock: (b) => { locked = b; draw(); },
    answerNode: () => h('ol', {}, item.items.map((t) => html('li', '', t))),
  };
};

const NORMAL = { asset: 'debit', expense: 'debit', dividends: 'debit', 'contra-asset': 'credit', liability: 'credit', equity: 'credit', revenue: 'credit', summary: 'either' };
T.journal = (item, c) => {
  const chart = c.charts?.[item.chart] || [];
  const byName = Object.fromEntries(chart.map((a) => [a.name, a]));
  const names = item.accounts || chart.filter((a) => a.type !== 'summary').map((a) => a.name);
  const lines = h('div', { class: 'je-lines' });
  const totDr = h('span', {}, '0'), totCr = h('span', {}, '0'), bal = h('span', { class: 'je-bal', 'aria-live': 'polite' });
  let locked = false;
  const rows = [];
  function addLine(focus = false) {
    const k = uid('jl');
    const sel = h('select', { class: 'select', id: `${k}-a`, 'aria-label': `Line ${rows.length + 1}: account` }, h('option', { value: '' }, 'Choose an account…'), names.map((n) => h('option', { value: n }, n)));
    const dr = h('input', { class: 'input', id: `${k}-d`, type: 'text', inputmode: 'decimal', autocomplete: 'off', placeholder: 'Debit', 'aria-label': `Line ${rows.length + 1}: debit amount` });
    const cr = h('input', { class: 'input', id: `${k}-c`, type: 'text', inputmode: 'decimal', autocomplete: 'off', placeholder: 'Credit', 'aria-label': `Line ${rows.length + 1}: credit amount` });
    const rm = h('button', { type: 'button', class: 'je-remove', 'aria-label': `Remove line ${rows.length + 1}` }, s('svg', { viewBox: '0 0 14 14', 'aria-hidden': 'true' }, s('path', { d: 'M3 3l8 8M11 3l-8 8', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round' })));
    const el = h('div', { class: 'je-line' }, sel, dr, cr, rm);
    const row = { el, sel, dr, cr, rm };
    rm.addEventListener('click', () => { if (locked || rows.length <= 2) return; rows.splice(rows.indexOf(row), 1); el.remove(); relabel(); totals(); rows[Math.max(0, rows.length - 1)]?.sel.focus(); });
    [dr, cr].forEach((inp) => inp.addEventListener('input', totals));
    lines.append(el); rows.push(row); relabel();
    if (focus) sel.focus();
  }
  function relabel() {
    rows.forEach((r, i) => {
      r.sel.setAttribute('aria-label', `Line ${i + 1}: account`); r.dr.setAttribute('aria-label', `Line ${i + 1}: debit amount`); r.cr.setAttribute('aria-label', `Line ${i + 1}: credit amount`); r.rm.setAttribute('aria-label', `Remove line ${i + 1}`);
      r.rm.disabled = locked || rows.length <= 2;
    });
  }
  function totals() {
    let d = 0, cc = 0;
    rows.forEach((r) => { const a = parseNum(r.dr.value), b = parseNum(r.cr.value); if (Number.isFinite(a)) d += a; if (Number.isFinite(b)) cc += b; r.el.classList.toggle('is-credit', !r.dr.value.trim() && !!r.cr.value.trim()); });
    totDr.textContent = money(d); totCr.textContent = money(cc);
    const off = Math.abs(d - cc) > 0.005;
    bal.textContent = d || cc ? (off ? `Debits and credits differ by ${money(Math.abs(d - cc))}` : 'Balanced') : '';
    bal.classList.toggle('is-off', off);
  }
  const n0 = Math.max(2, Math.min(4, (item.lines || []).length));
  for (let i = 0; i < n0; i++) addLine();
  const add = h('button', { type: 'button', class: 'btn btn-secondary btn-sm je-add', onclick: () => { if (!locked) addLine(true); } }, '+ Add a line');
  const keyOf = (l) => `${l.acct}|${l.dr != null ? 'dr' : 'cr'}|${Math.round((l.dr ?? l.cr) * 100)}`;
  const sideWord = (side) => (side === 'dr' ? 'debited' : 'credited');
  function why(acct, side) {
    const t = byName[acct]?.type; if (!t || NORMAL[t] === 'either') return '';
    const up = (NORMAL[t] === 'debit') === (side === 'dr');
    return ` ${acct} is ${t === 'asset' || t === 'expense' ? 'an' : 'a'} ${t.replace('-', ' ')} account (normal ${NORMAL[t]} balance), so ${side === 'dr' ? 'a debit' : 'a credit'} ${up ? 'increases' : 'decreases'} it.`;
  }
  return {
    body: h('div', { class: 'je' },
      item.date ? h('p', { class: 'je-date' }, `Entry dated ${new Date(`${item.date}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`) : null,
      h('div', { class: 'je-head', 'aria-hidden': 'true' }, h('span', {}, 'Account'), h('span', {}, 'Debit ($)'), h('span', {}, 'Credit ($)'), h('span')),
      lines, h('div', { class: 'je-foot' }, bal, totDr, totCr, h('span')), add),
    read() {
      const out = [], problems = [];
      rows.forEach((r, i) => {
        const a = r.sel.value, d = parseNum(r.dr.value), cc = parseNum(r.cr.value);
        if (!a && d == null && cc == null) return;
        if (!a) problems.push(`Line ${i + 1} has an amount but no account.`);
        else if (d == null && cc == null) problems.push(`Line ${i + 1} (${a}) has no amount.`);
        else if (d != null && cc != null) problems.push(`Line ${i + 1} (${a}) has both a debit and a credit: use one line for each.`);
        else if (Number.isNaN(d) || Number.isNaN(cc)) problems.push(`Line ${i + 1}: the amount doesn’t read as a number.`);
        else if ((d ?? cc) <= 0) problems.push(`Line ${i + 1}: amounts are positive; the column says whether it is a debit or a credit.`);
        else out.push(d != null ? { acct: a, dr: d } : { acct: a, cr: cc });
      });
      return { lines: out, problems };
    },
    isEmpty: (r) => !r.lines.length && !r.problems.length,
    invalid: (r) => r.problems.join(' '),
    grade(r) {
      const want = (item.lines || []).map(keyOf), got = r.lines.map(keyOf);
      const pool = want.slice(); let matched = 0;
      got.forEach((k) => { const j = pool.indexOf(k); if (j >= 0) { pool.splice(j, 1); matched++; } });
      const correct = matched === want.length && got.length === want.length;
      const notes = [];
      if (!correct) {
        const d = r.lines.reduce((a, l) => a + (l.dr || 0), 0), cc = r.lines.reduce((a, l) => a + (l.cr || 0), 0);
        if (Math.abs(d - cc) > 0.005) notes.push(`Your debits (${money(d)}) don’t equal your credits (${money(cc)}). Every entry must balance.`);
        const wantA = new Map(), gotA = new Map();
        (item.lines || []).forEach((l) => wantA.set(l.acct, l)); r.lines.forEach((l) => gotA.set(l.acct, l));
        wantA.forEach((l, a) => {
          const side = l.dr != null ? 'dr' : 'cr';
          const g = gotA.get(a);
          if (!g) notes.push(`The entry needs a line for ${a}.`);
          else if ((g.dr != null ? 'dr' : 'cr') !== side) notes.push(`${a} should be ${sideWord(side)}, not ${sideWord(side === 'dr' ? 'cr' : 'dr')}.${why(a, side)}`);
          else if (Math.abs((g.dr ?? g.cr) - (l.dr ?? l.cr)) > 0.005) notes.push(`Check the amount on the ${a} line.`);
        });
        gotA.forEach((_, a) => { if (!wantA.has(a)) notes.push(`${a} isn’t affected by this transaction.`); });
      }
      return { correct, score: want.length ? matched / Math.max(want.length, got.length) : 0, notes,
        mark: () => rows.forEach((row) => {
          const a = row.sel.value; if (!a) return;
          const d = parseNum(row.dr.value), cc = parseNum(row.cr.value);
          const ok = Number.isFinite(d ?? cc) && want.includes(keyOf(d != null ? { acct: a, dr: d } : { acct: a, cr: cc }));
          row.sel.classList.toggle('is-right', ok); row.sel.classList.toggle('is-wrong', !ok);
        }) };
    },
    reveal: () => {},
    clear: () => rows.forEach((row) => row.sel.classList.remove('is-right', 'is-wrong')),
    lock: (b) => { locked = b; rows.forEach((r) => { r.sel.disabled = b; r.dr.readOnly = b; r.cr.readOnly = b; }); add.disabled = b; relabel(); },
    answerNode: () => entryTable(item.lines || [], item.date),
  };
};
export function entryTable(lines, date) {
  const ordered = [...lines.filter((l) => l.dr != null), ...lines.filter((l) => l.cr != null)];
  return h('div', { class: 'table-scroll sol-entry' }, h('table', { class: 'data-table journal' },
    h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Account'), h('th', { scope: 'col', class: 'is-num' }, 'Debit ($)'), h('th', { scope: 'col', class: 'is-num' }, 'Credit ($)'))),
    h('tbody', {}, ordered.map((l, k) => h('tr', { class: k === 0 ? 'j-first' : '' }, h('td', { class: l.cr != null ? 'j-cr' : 'j-dr' }, l.acct), h('td', { class: 'is-num' }, l.dr != null ? money(l.dr) : ''), h('td', { class: 'is-num' }, l.cr != null ? money(l.cr) : ''))))));
}

T.equation = (item, c) => {
  const sides = [['assets', 'Assets'], ['liabilities', 'Liabilities'], ['equity', 'Equity']];
  const inputs = {};
  const field = ([k, label]) => { const id = `${c.uid}-${k}`; inputs[k] = h('input', { class: 'input', id, type: 'text', inputmode: 'decimal', autocomplete: 'off', placeholder: '0' }); return h('div', { class: 'field' }, h('label', { for: id }, `Change in ${label.toLowerCase()}`), h('div', { class: 'affix' }, h('span', { class: 'affix-pre', 'aria-hidden': 'true' }, '$'), inputs[k])); };
  const tol = item.tol ?? 0.5;
  return {
    body: h('div', {}, h('p', { class: 'field-hint' }, 'Use a minus sign for a decrease and 0 for no change.'),
      h('div', { class: 'eq-answer' }, field(sides[0]), h('span', { class: 'eq-sign', 'aria-hidden': 'true' }, '='), field(sides[1]), h('span', { class: 'eq-sign', 'aria-hidden': 'true' }, '+'), field(sides[2]))),
    read: () => Object.fromEntries(sides.map(([k]) => [k, inputs[k].value.trim() === '' ? 0 : parseNum(inputs[k].value)])),
    isEmpty: () => sides.every(([k]) => inputs[k].value.trim() === ''),
    invalid: (r) => (sides.some(([k]) => Number.isNaN(r[k])) ? 'One of the changes doesn’t read as a number. Type digits with a minus sign for a decrease, like -500.' : ''),
    grade(r) {
      const res = Object.fromEntries(sides.map(([k]) => [k, Math.abs(r[k] - item.answer[k]) <= tol]));
      const right = sides.filter(([k]) => res[k]).length, correct = right === 3;
      const notes = [];
      if (!correct) {
        if (Math.abs(r.assets - (r.liabilities + r.equity)) > tol) notes.push(`Your changes don’t balance: assets change by ${fmtNum(r.assets)} but liabilities plus equity change by ${fmtNum(r.liabilities + r.equity)}. Every transaction keeps the equation in balance.`);
        sides.forEach(([k, label]) => { if (!res[k]) notes.push(item.answer[k] !== 0 && Math.abs(-r[k] - item.answer[k]) <= tol ? `${label}: right amount, wrong direction.` : `Check the change in ${label.toLowerCase()}.`); });
      }
      return { correct, score: right / 3, notes, mark: () => sides.forEach(([k]) => { inputs[k].classList.toggle('is-right', res[k]); inputs[k].classList.toggle('is-wrong', !res[k]); }) };
    },
    reveal: () => {},
    clear: () => sides.forEach(([k]) => inputs[k].classList.remove('is-right', 'is-wrong')),
    lock: (b) => sides.forEach(([k]) => { inputs[k].readOnly = b; }),
    answerNode: () => h('p', {}, sides.map(([k, label], i) => [i ? (i === 1 ? ' = ' : ' + ') : '', h('strong', {}, `${label} ${item.answer[k] > 0 ? '+' : ''}${item.answer[k] === 0 ? '0' : fmtNum(item.answer[k])}`)])),
  };
};

T.rows = (item, c) => {
  const t = item.data?.table || { rows: [] };
  const wrap = h('div', { class: 'rows-pick' }, tableEl(t, { pick: true, name: c.uid }));
  const boxes = [...wrap.querySelectorAll('input[type="checkbox"]')];
  boxes.forEach((b) => b.addEventListener('change', () => b.closest('tr').classList.toggle('is-picked', b.checked)));
  const ans = new Set(item.answer);
  return {
    body: h('div', {}, h('p', { class: 'field-hint' }, 'Tick every row that applies.'), wrap),
    read: () => boxes.filter((b) => b.checked).map((b) => +b.value),
    isEmpty: (r) => !r.length,
    grade(r) {
      const sel = new Set(r);
      const right = t.rows.filter((_, i) => sel.has(i) === ans.has(i)).length, correct = right === t.rows.length;
      const wrongPicks = r.filter((i) => !ans.has(i)), missedRows = item.answer.filter((i) => !sel.has(i));
      const notes = correct ? [] : [[wrongPicks.length ? `${wrongPicks.length} of the rows you ticked ${wrongPicks.length === 1 ? 'doesn’t' : 'don’t'} apply.` : '', missedRows.length ? `You missed ${missedRows.length} row${missedRows.length === 1 ? '' : 's'}.` : ''].filter(Boolean).join(' ')];
      if (!correct) [...wrongPicks, ...missedRows].forEach((i) => { if (item.feedback?.[i]) notes.push(`Row ${i + 1}: ${item.feedback[i]}`); });
      return { correct, score: right / t.rows.length, notes, mark: () => boxes.forEach((b) => { const i = +b.value, tr = b.closest('tr'); tr.classList.toggle('is-right', sel.has(i) && ans.has(i)); tr.classList.toggle('is-wrong', sel.has(i) && !ans.has(i)); }) };
    },
    reveal: () => boxes.forEach((b) => { if (ans.has(+b.value) && !b.checked) b.closest('tr').classList.add('is-missed'); }),
    clear: () => boxes.forEach((b) => b.closest('tr').classList.remove('is-right', 'is-wrong', 'is-missed')),
    lock: (b) => boxes.forEach((x) => { x.disabled = b; }),
    answerNode: () => h('p', {}, `Rows ${item.answer.map((i) => i + 1).join(', ')}.`),
  };
};

T.short = (item, c) => {
  const id = `${c.uid}-t`;
  const ta = h('textarea', { class: 'textarea', id, rows: 6 });
  const rubric = h('div', { class: 'short-review', hidden: true },
    item.model ? h('div', { class: 'model-answer' }, h('h4', {}, 'A model answer'), html('div', '', item.model)) : null,
    item.rubric?.length ? h('div', {}, h('p', { class: 'rubric-h' }, 'Check your answer against these'), h('ul', { class: 'rubric', role: 'list' }, item.rubric.map((r, k) => { const rid = `${id}-r${k}`; return h('li', {}, h('label', { for: rid }, h('input', { type: 'checkbox', id: rid }), html('span', '', r))); }))) : null);
  return {
    body: h('div', { class: 'short-answer field' }, h('label', { for: id }, 'Your answer'), ta, rubric),
    read: () => ta.value,
    isEmpty: (r) => r.trim().length < 3,
    grade: () => ({ correct: null, selfMarked: true, score: null, notes: [], mark: () => { rubric.hidden = false; } }),
    reveal: () => { rubric.hidden = false; },
    clear: () => {},
    lock: (b) => { ta.readOnly = b; },
    answerNode: () => null,
    rubricDone: () => { const all = [...rubric.querySelectorAll('input')]; return all.length ? all.filter((x) => x.checked).length / all.length : null; },
  };
};

// A formula typed into a spreadsheet (B03). The item gives the sheet, the cell (and a range to fill, as Excel's fill
// handle does) and a model formula; the student's formula is marked by its results, on this data and on copies with
// the numbers changed, so a typed-in answer or a reference that only works by luck is caught (core/sheet.js
// gradeFormula). `wrong: [{ formula, say }]` names likely slips: a formula giving the same results as one of them gets
// its feedback. The grid shows the student's results as they type, as Excel does.
let SHEET = null;   // { X: core/sheet.js, grid: study/sheetgrid.js }, loaded by loadCharts when a page has formula items
T.formula = (item, c) => {
  const { X, grid } = SHEET;
  const spec = item.sheet;
  const base = new X.Sheet(spec);
  const target = item.fill || item.cell;
  const g = grid.sheetGrid({ sheet: base.clone(), view: item.view, formats: item.formats, widths: item.widths, mark: [target], label: `Worksheet for this question; your formula goes in ${target}`, maxHeight: item.maxHeight || '22rem', select: item.cell });
  const id = `${c.uid}-f`;
  const input = h('input', { class: 'input sg-input', id, type: 'text', autocomplete: 'off', spellcheck: 'false', autocapitalize: 'off', placeholder: '=' });
  const what = item.fill ? `Formula for ${item.cell}, filled to ${item.fill.split(':')[1]}` : `Formula for ${item.cell}`;
  const preview = h('p', { class: 'sg-preview', 'aria-live': 'polite' });
  const at = X.parseAddr(item.cell);
  const targets = [];
  if (item.fill) { const rg = X.parseRange(item.fill); for (let r = rg.r0; r <= rg.r1; r++) for (let k = rg.c0; k <= rg.c1; k++) targets.push({ a: X.addr(r, k), dr: r - at.r, dc: k - at.c }); }
  else targets.push({ a: item.cell, dr: 0, dc: 0 });
  const problem = (f) => {
    if (!f) return '';
    if (!f.startsWith('=')) return 'Start the formula with an equals sign (=).';
    try { X.parse(f); } catch (e) { return `Excel couldn’t read that formula: ${e.message}.`; }
    const unknown = [...X.functionsUsed(f)].filter((n) => !X.FUNCTIONS.includes(n));
    return unknown.length ? `${unknown[0]} isn’t available in this worksheet. Check the spelling; if it is an Excel function this worksheet lacks, get the result another way.` : '';
  };
  let timer = 0;
  function show() {
    const f = input.value.trim();
    const sh = base.clone();
    const bad = problem(f);
    if (f && !bad) for (const t of targets) sh.set(t.a, X.shiftFormula(f, t.dr, t.dc));
    g.setSheet(sh);
    if (!f) { preview.textContent = ''; return; }
    if (bad) { preview.textContent = bad; preview.classList.add('is-bad'); return; }
    preview.classList.remove('is-bad');
    const fmt = (a) => X.display(sh.get(a), (item.formats || {})[a] || (item.formats || {})[a.replace(/\d+$/, '')] || 'general') || 'blank';
    const first = targets[0].a, last = targets[targets.length - 1].a;
    preview.textContent = targets.length > 1 ? `${first} shows ${fmt(first)}; filled to ${last}, which shows ${fmt(last)}.` : `${first} shows ${fmt(first)}.`;
  }
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(show, 180); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); clearTimeout(timer); show(); } });
  const wrongs = item.wrong || [];
  return {
    body: h('div', { class: 'sg-ex' }, g.el, h('div', { class: 'field' }, h('label', { for: id }, what), input), preview),
    read: () => input.value.trim(),
    isEmpty: (r) => !r,
    invalid: (r) => problem(r),
    grade(r) {
      const res = X.gradeFormula(spec, { cell: item.cell, fill: item.fill, formula: r, answer: item.answer, require: item.require || [], variants: item.variants ?? 3 });
      const notes = [];
      if (!res.ok) {
        // the named slips whose results match; when several do, prefer the one typed exactly (spaces and case aside),
        // then the one using the same functions as the student's formula
        const hits = wrongs.length ? X.matchFormulas(spec, { cell: item.cell, fill: item.fill, formula: r, candidates: wrongs.map((w) => w.formula), variants: item.variants ?? 3 }) : [];
        const same = wrongs.filter((_, i) => hits[i]);
        const norm = (f) => String(f).replace(/\s+/g, '').toUpperCase(), fns = (f) => [...X.functionsUsed(f)].sort().join();
        const slip = same.find((w) => norm(w.formula) === norm(r)) || same.find((w) => fns(w.formula) === fns(r)) || same[0];
        notes.push(slip ? slip.say : res.message.replace(/&/g, '&amp;').replace(/</g, '&lt;'));
      }
      return { correct: res.ok, score: res.ok ? 1 : 0, notes, mark: () => { clearTimeout(timer); show(); input.classList.toggle('is-right', res.ok); input.classList.toggle('is-wrong', !res.ok); input.setAttribute('aria-invalid', res.ok ? 'false' : 'true'); } };
    },
    reveal: () => {},
    clear: () => { input.classList.remove('is-right', 'is-wrong'); input.removeAttribute('aria-invalid'); },
    lock: (b) => { input.readOnly = b; },
    answerNode: () => h('p', {}, h('code', { class: 'sg-code' }, item.answer), item.fill ? ` in ${item.cell}, filled to ${item.fill.split(':')[1]}` : ` in ${item.cell}`),
  };
};

// ---------------------------------------------------------------- shared pieces of a card
export async function loadCharts(items) {
  const need = new Set();
  let formulas = false;
  const walk = (x) => { if (x.type === 'journal' && x.chart) need.add(x.chart); if (x.type === 'formula') formulas = true; (x.steps || []).forEach(walk); };
  items.forEach(walk);
  if (formulas && !SHEET) {
    const [X, grid] = await Promise.all([import('../core/sheet.js?v=14'), import('./sheetgrid.js?v=14')]);
    SHEET = { X, grid };
  }
  const out = {};
  for (const ch of need) {
    try { out[ch] = (await import(`../data/study/${ch.includes('/') ? ch : `${ch}/case`}.js?v=14`)).CHART; } catch { out[ch] = []; }   // 'f01' → f01/case.js; 'f01/brightwater' → that file
  }
  return out;
}
function buildType(item, ctx) {
  const make = T[item.type];
  if (!make) return { body: h('p', { class: 'note' }, `Unknown question type “${item.type}”.`), read: () => null, isEmpty: () => true, grade: () => ({ correct: false, score: 0, notes: [], mark() {} }), reveal() {}, clear() {}, lock() {}, answerNode: () => null };
  const t = make(item, { uid: uid(item.type), seed: hashStr(`${item.id}:${ctx.nonce || 0}`), charts: ctx.charts });
  t.body = h('div', { class: 'ex-body' }, t.body);
  return t;
}
function feedbackNode(g, item, { mode, more = '' }) {
  if (g.selfMarked) return null;
  if (g.correct) return verdict('good', 'Right.', '');
  const v = verdict(mode === 'quiz' && g.score > 0 && g.score < 1 ? 'warn' : 'bad', g.score > 0 && g.score < 1 ? 'Partly right.' : 'Not quite.', '');
  return v;
}
function fillFeedback(box, g, item, { mode, after = '' }) {
  box.replaceChildren();
  if (g.selfMarked) return;
  const v = feedbackNode(g, item, { mode });
  const p = v.querySelector('p');
  const extra = h('span');
  if (g.correct && item.why) extra.innerHTML = ` ${xl(item.why)}`;
  if (!g.correct && g.notes.length === 1) extra.innerHTML = ` ${xl(g.notes[0])}`;
  p.append(extra);
  box.append(v);
  if (!g.correct && g.notes.length > 1) box.append(h('ul', {}, g.notes.map((n) => html('li', '', n))));
  if (after) box.append(html('p', 'muted small', after));
}
function solutionBox(item, unitObj) {
  const det = h('details', { class: 'ex-solution', hidden: true });
  const body = h('div', { class: 'sol-body' });
  const ans = unitObj?.answerNode?.();
  if (ans && item.type !== 'short') body.append(h('p', {}, h('strong', {}, 'Answer')), ans);
  if (item.solution) { const sol = h('div'); sol.innerHTML = xl(item.solution); if (ans) body.append(h('p', {}, h('strong', {}, 'How to get there'))); body.append(sol); }
  det.append(h('summary', {}, 'Worked solution'), body);
  return det;
}
function head(item, label, state) {
  return h('header', { class: 'ex-head' },
    h('span', { class: 'ex-no' }, label),
    item.kind ? h('span', { class: 'ex-kind' }, KIND[item.kind] || item.kind) : null,
    state);
}
function promptEl(item, id) {
  const p = html('div', 'ex-prompt', item.prompt);
  if (id) p.id = id;
  return p;
}
function dataEl(item) { return item.data?.table && item.type !== 'rows' ? h('div', { class: 'ex-data' }, tableEl(item.data.table)) : null; }

// ---------------------------------------------------------------- practice cards
/**
 * One question as a card with its own controls.
 * opts: { mode: 'guided'|'independent'|'review', label, charts, prior: {text, cls}|null,
 *         onAnswer(item, correct, { first, step, parent }), onWorked(item), onReveal(item), onDone(item, correct) }
 */
export function practiceCard(item, opts) {
  const mode = opts.mode;
  const pid = uid('p');
  const state = h('span', { class: `ex-state ${opts.prior?.cls || ''}` }, opts.prior?.text || '');
  const card = h('article', { class: 'ex-card', id: `ex-${item.id}`, 'aria-labelledby': pid, 'data-item': item.id });
  card.append(...[head(item, opts.label, state), promptEl(item, pid), dataEl(item)].filter(Boolean));
  const setState = (text, cls) => { state.className = `ex-state ${cls || ''}`; state.textContent = text; card.classList.toggle('is-right', cls === 'is-right'); card.classList.toggle('is-wrong', cls === 'is-wrong'); };
  const isSteps = item.type === 'steps';
  let revealedAll = false;

  // one answerable unit: a whole question, or a step of a multi-step problem
  function unit(x, { container, stepIndex = null, onChecked, onShown }) {
    const t = buildType(x, opts);
    const fb = h('div', { class: 'ex-feedback', 'aria-live': 'polite' });
    const hints = h('ol', { class: 'hints', 'aria-label': 'Hints', role: 'list' });
    let attempts = 0, hintN = 0, solved = false, shown = false;
    const check = h('button', { type: 'button', class: 'btn btn-primary btn-sm' }, 'Check');
    const actions = h('div', { class: 'ex-actions' }, check);
    let hintBtn = null;
    if (mode === 'guided' && x.hints?.length) {
      hintBtn = h('button', { type: 'button', class: 'btn-text' }, 'Show a hint');
      hintBtn.addEventListener('click', () => {
        if (hintN >= x.hints.length) return;
        const li = html('li', '', x.hints[hintN]); li.dataset.n = hintN + 1; hints.append(li); hintN++;
        const left = x.hints.length - hintN;
        hintBtn.textContent = left ? `Show another hint (${left} left)` : 'No more hints';
        hintBtn.disabled = !left;
      });
      actions.append(hintBtn);
    }
    let showBtn = null;
    if (stepIndex != null) {
      showBtn = h('button', { type: 'button', class: 'btn-text' }, mode === 'guided' ? 'Show the answer to this step' : 'Show the answer (counts as a miss)');
      showBtn.addEventListener('click', () => {
        if (shown) return;
        shown = true; t.reveal();
        const ans = t.answerNode();
        fb.replaceChildren(h('div', { class: 'sol-body' }, h('p', {}, h('strong', {}, 'The answer')), ans || ''));
        if (!attempts) onChecked(false, true, { revealed: true });
        showBtn.hidden = true; if (hintBtn) hintBtn.hidden = true; t.lock(true); check.disabled = true;
        onShown?.();
      });
      actions.append(showBtn);
    }
    check.addEventListener('click', () => {
      const r = t.read();
      const bad = t.invalid?.(r);
      if (t.isEmpty(r) || bad) {
        fb.replaceChildren(verdict('warn', t.isEmpty(r) ? 'Answer first.' : 'Can’t read that.', bad || (x.type === 'short' ? 'Write your answer, then compare it with the model.' : 'Give an answer, then check it.')));
        return;
      }
      attempts++;
      const g = t.grade(r);
      t.clear(); g.mark();
      if (g.selfMarked) {
        fb.replaceChildren(verdict('good', 'Compare your answer.', 'Read the model answer and tick each point your answer covers. Written answers are marked by you, so they count as done but never toward mastery.'));
        solved = true; check.textContent = 'Compared';
        check.disabled = true;
        onChecked(null, attempts === 1, { selfMarked: true });
        return;
      }
      const after = g.correct ? '' : mode === 'guided' || opts.unscored ? (hintBtn && !hintBtn.disabled ? 'Try again, or take a hint.' : 'Try again, or read the worked solution.') : mode === 'review' ? '' : attempts === 1 ? 'Try again if you like: only your first answer counts toward mastery.' : '';
      fillFeedback(fb, g, x, { mode, after });
      if (g.correct) { solved = true; check.textContent = 'Checked'; if (stepIndex != null || mode === 'guided') { t.lock(true); check.disabled = true; if (hintBtn) hintBtn.hidden = true; if (showBtn) showBtn.hidden = true; } }
      else check.textContent = 'Check again';
      if (mode === 'review') { solved = true; t.lock(true); check.disabled = true; check.textContent = 'Checked'; if (!g.correct) t.reveal(); }
      onChecked(g.correct, attempts === 1, g);
    });
    container.append(t.body, hints, actions, fb);
    return { t, isSolved: () => solved || shown, attempts: () => attempts, lock: (b) => { t.lock(b); check.disabled = b; if (hintBtn) hintBtn.disabled = b || hintN >= (x.hints?.length || 0); if (showBtn) showBtn.disabled = b || shown; } };
  }

  let sol;
  if (!isSteps) {
    const u = unit(item, {
      container: card,
      onChecked(correct, first, g) {
        if (g?.selfMarked) { setState('Done', 'is-right'); opts.onWorked?.(item); opts.onDone?.(item, null); return; }
        setState(correct ? 'Right' : 'Not yet', correct ? 'is-right' : 'is-wrong');
        opts.onAnswer?.(item, correct, { first });
        if (mode === 'guided') opts.onWorked?.(item);
        if (first || correct) sol.hidden = false;
        if (mode === 'review') { sol.hidden = false; opts.onDone?.(item, correct); }
      },
    });
    sol = solutionBox(item, u.t);
  } else {
    const ol = h('ol', { class: 'ex-steps', role: 'list' });
    const firsts = [];
    const units = [];
    item.steps.forEach((st, k) => {
      const li = h('li', { class: `ex-step${k ? ' is-locked' : ''}`, 'data-step': st.id });
      li.append(...[promptEl(st), dataEl(st)].filter(Boolean));
      ol.append(li);
      const next = () => { li.classList.add('is-right'); const nx = ol.children[k + 1]; if (nx && nx.classList.contains('is-locked')) { nx.classList.remove('is-locked'); nx.querySelector('select, input, textarea, button')?.focus({ preventScroll: false }); } finish(); };
      units.push(unit(st, {
        container: li, stepIndex: k,
        onChecked(correct, first, g) {
          if (first) firsts[k] = !!correct || !!g?.selfMarked;
          opts.onAnswer?.(st, !!correct, { first, step: true, parent: item });
          if (correct || g?.selfMarked || mode === 'review') next();
        },
        onShown: next,
      }));
    });
    let finished = false;
    function finish() {
      if (finished || !units.every((u) => u.isSolved())) return;
      finished = true;
      const allFirst = item.steps.every((_, k) => firsts[k]);
      setState(allFirst ? 'Right first time' : 'Worked', allFirst ? 'is-right' : '');
      if (mode !== 'guided') opts.onAnswer?.(item, allFirst, { first: true, parent: null, rollup: true });
      opts.onWorked?.(item);
      opts.onDone?.(item, allFirst);
      sol.hidden = false;
    }
    card.append(ol);
    sol = solutionBox(item, null);
  }
  card.append(sol);

  // the worked solution: open in guided practice; in independent practice, asking before answering counts as a miss
  if (mode !== 'review') {
    const btn = h('button', { type: 'button', class: 'btn-text ex-show-sol' }, mode === 'guided' || opts.unscored ? 'Show the worked solution' : 'Show the solution (counts as a miss)');
    btn.addEventListener('click', () => {
      if (mode === 'independent' && sol.hidden && !isSteps) opts.onReveal?.(item);
      if (mode === 'independent' && isSteps && !revealedAll) opts.onReveal?.(item);
      revealedAll = true;
      sol.hidden = false; sol.open = true; sol.querySelector('summary').focus();
      btn.remove();
    });
    card.insertBefore(h('div', { class: 'ex-actions ex-sol-actions' }, btn), sol);
    const obs = new MutationObserver(() => { if (!sol.hidden && btn.isConnected) { btn.parentElement.remove(); obs.disconnect(); } });
    obs.observe(sol, { attributes: true, attributeFilter: ['hidden'] });
  }
  return card;
}

/** A set of practice cards. Returns the cards. */
export async function renderPractice(container, items, opts) {
  const charts = await loadCharts(items);
  const label = opts.label || (opts.mode === 'guided' ? 'Problem' : 'Question');
  const cards = items.map((it, i) => practiceCard(it, { ...opts, charts, label: `${label} ${i + 1} of ${items.length}`, prior: opts.prior?.(it) || null }));
  container.replaceChildren(...cards);
  return cards;
}

// ---------------------------------------------------------------- quizzes: answer all, submit once
/**
 * opts: { kind: 'check'|'test'|'diagnostic', label, submitLabel, nonce,
 *         onSubmit(results) → { title, text, pass, actions?: [Element] } ,  results: [{ item, correct, score, counted }] }
 */
export async function renderQuiz(container, items, opts) {
  const charts = await loadCharts(items);
  const nonce = opts.nonce || 0;
  const form = h('form', { class: 'ex-form', novalidate: true, id: uid('quiz') });
  const cards = items.map((item, i) => {
    const pid = uid('q');
    const card = h('article', { class: 'ex-card', id: `q-${item.id}`, 'aria-labelledby': pid, 'data-item': item.id });
    card.append(...[head(item, `${opts.label || 'Question'} ${i + 1} of ${items.length}`, h('span', { class: 'ex-state' })), promptEl(item, pid), dataEl(item)].filter(Boolean));
    const units = [];
    if (item.type === 'steps') {
      const ol = h('ol', { class: 'ex-steps', role: 'list' });
      item.steps.forEach((st) => { const li = h('li', { class: 'ex-step' }, ...[promptEl(st), dataEl(st)].filter(Boolean)); const t = buildType(st, { charts, nonce }); const fb = h('div', { class: 'ex-feedback' }); li.append(t.body, fb); ol.append(li); units.push({ x: st, t, fb, li }); });
      card.append(ol);
    } else {
      const t = buildType(item, { charts, nonce }); const fb = h('div', { class: 'ex-feedback' });
      card.append(t.body, fb); units.push({ x: item, t, fb });
    }
    const sol = solutionBox(item, item.type === 'steps' ? null : units[0].t);
    card.append(sol);
    return { item, card, units, sol };
  });
  form.append(...cards.map((c) => c.card));
  const progress = h('p', { class: 'ex-progress', 'aria-live': 'polite' });
  const submit = h('button', { type: 'submit', class: 'btn btn-primary' }, opts.submitLabel || 'Submit answers');
  const warnBox = h('div', { class: 'ex-actions', hidden: true });
  const bar = h('div', { class: 'ex-submit' }, progress, warnBox, submit);
  form.append(bar);
  const answered = (c) => c.units.every((u) => { const r = u.t.read(); return !u.t.isEmpty(r) && !u.t.invalid?.(r); });
  const update = () => { const n = cards.filter(answered).length; progress.textContent = `${n} of ${cards.length} answered`; };
  form.addEventListener('input', update); form.addEventListener('change', update); form.addEventListener('click', (e) => { if (e.target.closest('.move-btn')) setTimeout(update); });
  update();
  let confirmed = false;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const invalid = cards.find((c) => c.units.some((u) => u.t.invalid?.(u.t.read())));
    if (invalid) {
      const u = invalid.units.find((x) => x.t.invalid?.(x.t.read()));
      u.fb.replaceChildren(verdict('warn', 'Can’t read that.', u.t.invalid(u.t.read())));
      invalid.card.scrollIntoView({ block: 'center' }); invalid.card.querySelector('input, select, textarea')?.focus({ preventScroll: true });
      return;
    }
    const open = cards.filter((c) => !answered(c));
    if (open.length && !confirmed) {
      warnBox.hidden = false;
      warnBox.replaceChildren(h('span', { class: 'small' }, `${open.length} unanswered: ${open.length === 1 ? 'it' : 'they'} will be marked wrong.`),
        h('button', { type: 'button', class: 'btn-text', onclick: () => { warnBox.hidden = true; open[0].card.scrollIntoView({ block: 'center' }); open[0].card.querySelector('input, select, textarea, button')?.focus({ preventScroll: true }); } }, 'Go to the first one'));
      submit.textContent = 'Submit anyway';
      confirmed = true;
      return;
    }
    grade();
  });

  function grade() {
    const results = cards.map((c) => {
      let correct = true, score = 0, counted = true, selfMarked = false;
      const scores = [];
      c.units.forEach((u) => {
        const r = u.t.read();
        u.t.lock(true);
        if (u.t.isEmpty(r)) {
          if (u.x.type === 'short') { counted = c.units.length > 1; selfMarked = true; u.t.reveal(); return; }
          correct = false; scores.push(0); u.fb.replaceChildren(verdict('bad', 'Not answered.', '')); u.t.reveal(); return;
        }
        const g = u.t.grade(r);
        u.t.clear(); g.mark(); u.t.reveal();
        if (g.selfMarked) { selfMarked = true; if (c.units.length === 1) counted = false; return; }
        if (!g.correct) correct = false;
        scores.push(g.score);
        fillFeedback(u.fb, g, u.x, { mode: 'quiz' });
      });
      score = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      if (!scores.length) counted = false;
      const st = c.card.querySelector('.ex-state');
      if (counted) { st.textContent = correct ? 'Right' : score > 0 ? `Partly right (${Math.round(score * 100)}%)` : 'Wrong'; st.className = `ex-state ${correct ? 'is-right' : 'is-wrong'}`; c.card.classList.add(correct ? 'is-right' : 'is-wrong'); }
      else if (selfMarked) { st.textContent = 'Self-marked'; st.className = 'ex-state'; }
      c.sol.hidden = false;
      return { item: c.item, correct: counted ? correct : null, score: counted ? score : null, counted };
    });
    bar.remove();
    const summary = opts.onSubmit(results);
    const counted = results.filter((r) => r.counted);
    const pct = counted.length ? counted.reduce((a, r) => a + r.score, 0) / counted.length : 0;
    const box = h('section', { class: `ex-score ${summary.pass === true ? 'is-pass' : summary.pass === false ? 'is-fail' : ''}`, tabindex: '-1', 'aria-labelledby': `${form.id}-score-h` },
      h('p', { class: 'score-big' }, `${Math.round(pct * 100)}%`),
      h('div', { class: 'score-text' }, h('strong', { id: `${form.id}-score-h` }, summary.title), ...(summary.text || []).map((t) => html('p', '', t))),
      summary.breakdown ? h('ul', { class: 'score-breakdown', role: 'list' }, summary.breakdown.map(([k, v]) => h('li', {}, h('span', {}, k), h('b', {}, v)))) : null,
      h('div', { class: 'ex-actions' },
        results.some((r) => r.counted && !r.correct) ? h('button', { type: 'button', class: 'btn btn-secondary btn-sm', onclick: () => { const c = cards.find((x, i) => results[i].counted && !results[i].correct); c.card.scrollIntoView({ block: 'start' }); c.card.focus?.(); } }, 'See what you missed') : null,
        h('button', { type: 'button', class: 'btn btn-primary btn-sm', onclick: () => { renderQuiz(container, items, { ...opts, nonce: nonce + 1 }).then(() => container.scrollIntoView({ block: 'start' })); } }, opts.againLabel || 'Take it again'),
        ...(summary.actions || [])));
    container.prepend(box);
    box.focus({ preventScroll: true });
    box.scrollIntoView({ block: 'start' });
  }
  container.replaceChildren(form);
  return { form };
}
