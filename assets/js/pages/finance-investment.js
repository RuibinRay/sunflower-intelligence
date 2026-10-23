// finance-investment.js — capital budgeting: compare projects, the NPV profile, and capital rationing.
import { initSite, syncRanges } from '../core/site.js?v=7';
import { $, $$, h, s, onResize, debounce } from '../core/dom.js?v=7';
import * as F from '../core/format.js?v=7';
import { lineChart, barChart, tableTwin } from '../core/charts.js?v=7';
import { verdict } from '../core/ui.js?v=7';
import { npv, appraise, crossover, ration } from '../core/invest.js?v=7';

initSite();

const LETTERS = ['A', 'B', 'C'];
const CLS = ['m-s1', 'm-s2', 'm-s3'];
const CASES = {
  timing: { names: ['Late payer', 'Early payer', 'Small refit'], flows: [[-1000, 100, 300, 500, 750], [-1000, 700, 400, 200, 100], [-450, 150, 150, 150, 150]] },
  scale: { names: ['Small kiosk', 'Large store', ''], flows: [[-100, 70, 70], [-1000, 600, 650], [null, null, null]] },
  mine: { names: ['Mine with clean-up', 'Quarry', ''], flows: [[-1600, 10000, -10000], [-1600, 1000, 1000], [null, null, null]] },
};
const cb = { names: [], flows: [], years: 0 };
const pctOut = (id) => { $(`#${id}-out`).textContent = F.pct(+$(`#${id}`).value / 100, 2); return +$(`#${id}`).value / 100; };

// ---------------------------------------------------------------- the cash-flow grid
function loadCase(key) {
  const c = CASES[key];
  cb.names = [...c.names];
  cb.years = Math.max(...c.flows.map((f) => f.length)) - 1;
  cb.flows = c.flows.map((f) => Array.from({ length: cb.years + 1 }, (_, t) => (f[t] == null ? null : f[t])));
  drawGrid(); update();
}
function drawGrid() {
  const grid = $('#cb-grid');
  const head = h('tr', {}, h('th', { scope: 'col' }, 'Year'), cb.names.map((n, j) => h('th', { scope: 'col' },
    h('span', { class: 'flow-key' }, h('i', { class: `legend-key ${CLS[j]}` }), `Project ${LETTERS[j]}`),
    h('input', { class: 'input input-name', type: 'text', value: n, 'aria-label': `Name of project ${LETTERS[j]}`, 'data-name': j, placeholder: 'Unused', maxlength: 28 }))));
  const rows = Array.from({ length: cb.years + 1 }, (_, t) => h('tr', {}, h('th', { scope: 'row' }, t === 0 ? 'Today' : `Year ${t}`),
    cb.flows.map((f, j) => h('td', {}, h('input', {
      class: 'input input-num', type: 'number', inputmode: 'decimal', step: 'any', value: f[t] == null ? '' : f[t],
      'aria-label': `Project ${LETTERS[j]}, ${t === 0 ? 'today' : `year ${t}`}`, 'data-p': j, 'data-t': t,
    })))));
  grid.replaceChildren(h('caption', { class: 'visually-hidden' }, 'Cash flows by project and year'), h('thead', {}, head), h('tbody', {}, rows));
  $('#cb-remove').disabled = cb.years <= 1;
  $('#cb-add').disabled = cb.years >= 15;
}
$('#cb-grid').addEventListener('input', (e) => {
  const el = e.target;
  if (el.dataset.name != null) cb.names[+el.dataset.name] = el.value;
  else if (el.dataset.p != null) { const v = parseFloat(el.value); cb.flows[+el.dataset.p][+el.dataset.t] = Number.isFinite(v) ? v : null; }
  update();
});
$('#cb-add').addEventListener('click', () => { cb.years++; cb.flows.forEach((f) => f.push(f.some((v) => v != null) ? 0 : null)); drawGrid(); update(); });
$('#cb-remove').addEventListener('click', () => { if (cb.years <= 1) return; cb.years--; cb.flows.forEach((f) => f.pop()); drawGrid(); update(); });
$$('[data-case]').forEach((b) => b.addEventListener('click', () => loadCase(b.dataset.case)));

/** Projects with at least an outlay today; blank cells count as zero. */
function activeProjects() {
  return cb.flows.map((f, j) => ({ j, name: cb.names[j]?.trim() || `Project ${LETTERS[j]}`, flows: f.map((v) => v ?? 0), used: f.some((v) => v != null && v !== 0) }))
    .filter((p) => p.used);
}

// ---------------------------------------------------------------- measures and the decision
let projects = [], rate = 0.1, reinvest = 0.1;
function update() {
  rate = pctOut('cb-rate'); reinvest = pctOut('cb-re');
  projects = activeProjects().map((p) => ({ ...p, m: appraise(p.flows, { rate, financeRate: rate, reinvestRate: reinvest }) }));
  renderMeasures(); renderProfile();
}
const irrText = (m) => (m.irrs.length === 0 ? 'none' : m.irrs.length > 1 ? m.irrs.map((r) => F.pct(r, 1)).join(' and ') : F.pct(m.irr, 1));
const years = (v) => (Number.isFinite(v) ? `${F.num(v, 1)} yrs` : 'never');

function renderMeasures() {
  const table = $('#cb-table'), vbox = $('#cb-verdict');
  vbox.replaceChildren();
  if (!projects.length) { table.replaceChildren(); vbox.append(verdict('warn', 'No projects yet.', 'Type an outlay today (a negative number) and the cash each year brings.')); return; }
  const exclusive = $('#cb-excl').checked;
  const rows = [
    { label: 'Net present value', get: (m) => m.npv, fmt: (v) => F.money(v), best: 'max' },
    { label: 'Internal rate of return', get: (m) => m.irr, fmt: (v, m) => irrText(m), best: 'max' },
    { label: 'Modified IRR', get: (m) => m.mirr, fmt: (v) => F.pct(v, 1), best: 'max' },
    { label: 'Payback', get: (m) => m.payback, fmt: years, best: 'min' },
    { label: 'Discounted payback', get: (m) => m.discPayback, fmt: years, best: 'min' },
    { label: 'Profitability index', get: (m) => m.pi, fmt: (v) => F.num(v, 2), best: 'max' },
  ];
  const winner = (row) => {
    const vals = projects.map((p) => row.get(p.m)).map((v) => (Number.isFinite(v) ? v : NaN));
    if (vals.filter(Number.isFinite).length < 2) return -1;
    let k = -1; vals.forEach((v, i) => { if (Number.isFinite(v) && (k < 0 || (row.best === 'max' ? v > vals[k] : v < vals[k]))) k = i; });
    return k;
  };
  table.replaceChildren(
    h('caption', { class: 'visually-hidden' }, 'Capital budgeting measures by project'),
    h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Measure'), projects.map((p) => h('th', { scope: 'col', class: 'is-num' }, h('span', { class: 'flow-key' }, h('i', { class: `legend-key ${CLS[p.j]}` }), p.name))))),
    h('tbody', {}, rows.map((row) => {
      const w = winner(row);
      return h('tr', {}, h('th', { scope: 'row' }, row.label), projects.map((p, i) => h('td', { class: `is-num${i === w ? ' cell-hi' : ''}` }, row.fmt(row.get(p.m), p.m), i === w ? h('span', { class: 'visually-hidden' }, ' (best on this measure)') : '')));
    }),
    h('tr', { class: 'is-strong' }, h('th', { scope: 'row' }, `Decision at ${F.pct(rate, 2)}`), projects.map((p) => h('td', { class: `is-num ${p.m.npv > 0 ? 'is-pos' : 'is-neg'}` }, p.m.npv > 0 ? 'Accept' : 'Reject')))),
  );
  // the verdict
  const good = projects.filter((p) => p.m.npv > 0);
  const multi = projects.filter((p) => p.m.irrs.length > 1 || p.m.irrs.length === 0);
  if (exclusive) {
    if (!good.length) vbox.append(verdict('bad', 'Fund none of them.', `No project earns its ${F.pct(rate, 2)} cost of capital: every NPV is negative.`));
    else {
      const best = good.reduce((a, b) => (b.m.npv > a.m.npv ? b : a));
      const byIrr = projects.filter((p) => Number.isFinite(p.m.irr)).sort((a, b) => b.m.irr - a.m.irr)[0];
      const byPay = projects.filter((p) => Number.isFinite(p.m.payback)).sort((a, b) => a.m.payback - b.m.payback)[0];
      vbox.append(verdict('good', `Fund ${best.name}.`, `It adds the most value: ${F.money(best.m.npv)} in today’s money at a ${F.pct(rate, 2)} cost of capital.`));
      const dissent = [];
      if (byIrr && byIrr !== best) dissent.push(`IRR prefers ${byIrr.name} (${F.pct(byIrr.m.irr, 1)} against ${Number.isFinite(best.m.irr) ? F.pct(best.m.irr, 1) : irrText(best.m)})`);
      if (byPay && byPay !== best) dissent.push(`payback prefers ${byPay.name} (${years(byPay.m.payback)})`);
      if (dissent.length) {
        const other = byIrr && byIrr !== best ? byIrr : byPay;
        const x = crossover(best.flows, other.flows).filter((r) => r > 0 && r < 1);
        const why = best.flows[0] !== other.flows[0] && Math.abs(best.flows[0]) > Math.abs(other.flows[0])
          ? `${best.name} is the bigger project: a high percentage on a small outlay can add fewer dollars.`
          : `${other.name} brings its cash back sooner, which a percentage or a payback rewards even when the total value is lower.`;
        vbox.append(h('p', { class: 'note' }, `The measures disagree: ${dissent.join('; ')}. ${why}`,
          x.length ? ` Their NPV lines cross at ${x.map((r) => F.pct(r, 1)).join(' and ')}: below that rate ${best.name} is worth more; above it, ${other.name}.` : ''));
      }
    }
  } else {
    vbox.append(good.length
      ? verdict('good', `Fund ${good.map((p) => p.name).join(' and ')}.`, `Each has a positive NPV at ${F.pct(rate, 2)}, together ${F.money(good.reduce((a, p) => a + p.m.npv, 0))}.`)
      : verdict('bad', 'Fund none of them.', `Every NPV is negative at ${F.pct(rate, 2)}.`));
  }
  multi.forEach((p) => {
    const r = p.m.irrs;
    vbox.append(verdict('warn', `${p.name}: ${r.length ? `${r.length} IRRs` : 'no IRR'}.`, r.length
      ? `Its cash flows change sign ${p.m.signChanges} times, so NPV is zero at ${r.map((x) => F.pct(x, 1)).join(' and ')}. “IRR above the cost of capital” means nothing here; use NPV (${F.money(p.m.npv)}) or MIRR (${F.pct(p.m.mirr, 1)}).`
      : 'NPV never reaches zero at any sensible rate, so IRR is undefined. Use NPV.'));
  });
}

// ---------------------------------------------------------------- NPV profile
function renderProfile() {
  const box = $('#pf-chart'), tbox = $('#pf-table'), vbox = $('#pf-verdict');
  tbox.replaceChildren(); vbox.replaceChildren();
  if (!projects.length) { box.replaceChildren(); $('#pf-sub').textContent = ''; return; }
  const irrs = projects.flatMap((p) => p.m.irrs).filter((r) => r > 0);
  const top = Math.min(1, Math.max(0.3, ...irrs.filter((r) => r < 1).map((r) => r * 1.3)));
  const step = top > 0.5 ? 0.01 : 0.005;
  const xs = []; for (let r = 0; r <= top + 1e-9; r += step) xs.push(+r.toFixed(4));
  const series = projects.map((p) => ({ name: p.name, values: xs.map((r) => npv(r, p.flows)), cls: CLS[p.j] }));
  const fr = lineChart(box, { xs, series, height: 300, xLabel: 'Discount rate', yLabel: 'NPV', xFormat: (v) => F.pct(v, 0), yFormat: (v) => F.money(v, { compact: Math.abs(v) >= 1e4 }), highlightX: rate, label: 'NPV of each project against the discount rate', endLabels: false });
  // IRRs and crossovers marked on the zero line
  const marks = [];
  projects.forEach((p) => p.m.irrs.filter((r) => r >= 0 && r <= top).forEach((r) => marks.push({ x: r, y: 0, cls: CLS[p.j], label: `IRR ${F.pct(r, 1)}` })));
  for (let a = 0; a < projects.length; a++) for (let b = a + 1; b < projects.length; b++) {
    crossover(projects[a].flows, projects[b].flows).filter((r) => r > 0 && r <= top).forEach((r) => marks.push({ x: r, y: npv(r, projects[a].flows), cls: 'm-cross', label: `${projects[a].name} and ${projects[b].name} at ${F.pct(r, 1)}` }));
  }
  marks.forEach((mk) => {
    const cx = fr.x(mk.x), cy = fr.y(mk.y);
    if (cy < 0 || cy > fr.ih) return;
    fr.g.append(s('circle', { cx, cy, r: mk.cls === 'm-cross' ? 5 : 5.5, class: `dot ${mk.cls === 'm-cross' ? 'dot-cross' : mk.cls}` }));
  });
  $('#pf-sub').textContent = `The vertical line is your ${F.pct(rate, 2)} discount rate. Dots on the zero line are IRRs${marks.some((m) => m.cls === 'm-cross') ? '; hollow dots are crossover rates' : ''}.${projects.some((p) => p.m.irrs.some((r) => r > top)) ? ` Off the chart: ${projects.flatMap((p) => p.m.irrs.filter((r) => r > top).map((r) => `${p.name} has another IRR at ${F.pct(r, 0)}`)).join('; ')}.` : ''}`;
  const pick = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3].filter((r) => r <= top + 1e-9);
  if (!pick.includes(rate)) pick.push(rate);
  pick.sort((a, b) => a - b);
  tableTwin(tbox, {
    caption: 'NPV by discount rate',
    columns: [{ label: 'Discount rate' }, ...projects.map((p) => ({ label: p.name, num: true }))],
    rows: pick.map((r) => [F.pct(r, 2), ...projects.map((p) => F.money(npv(r, p.flows)))]),
  });
  const notes = marks.filter((m) => m.cls === 'm-cross');
  if (notes.length) vbox.append(h('p', { class: 'note' }, `Lines cross, and the ranking flips, for ${notes.map((m) => m.label).join('; ')}. That is why IRR and NPV can disagree about alternatives even when both projects are sound.`));
}

$('#cb-form').addEventListener('input', update);
$('#cb-form').addEventListener('change', update);

// ---------------------------------------------------------------- capital rationing
const RATION_EXAMPLE = [['Packaging line', 400, 120], ['Solar roof', 250, 90], ['Warehouse robots', 300, 85], ['Staff training', 150, 60], ['Second shop', 500, 140], ['Website rebuild', 200, 30], ['Delivery vans', 350, 110]];
let rp = [];
function resetRation() { rp = RATION_EXAMPLE.map(([name, outlay, v]) => ({ name, outlay, npv: v })); $('#cr-budget').value = 1000; drawRationGrid(); renderRation(); }
function drawRationGrid() {
  const grid = $('#cr-grid');
  grid.replaceChildren(
    h('caption', { class: 'visually-hidden' }, 'Projects competing for the budget'),
    h('thead', {}, h('tr', {}, ['Project', 'Outlay', 'NPV', 'PI', 'Best set', 'PI shortcut', ''].map((c, i) => h('th', { scope: 'col', class: i && i < 6 ? 'is-num' : '' }, c ? c : h('span', { class: 'visually-hidden' }, 'Remove'))))),
    h('tbody', {}, rp.map((p, i) => h('tr', {},
      h('td', {}, h('input', { class: 'input input-name', type: 'text', value: p.name, 'aria-label': `Project ${i + 1} name`, 'data-i': i, 'data-k': 'name', maxlength: 28 })),
      h('td', {}, h('input', { class: 'input input-num', type: 'number', inputmode: 'decimal', step: 'any', min: 0, value: p.outlay, 'aria-label': `${p.name} outlay`, 'data-i': i, 'data-k': 'outlay' })),
      h('td', {}, h('input', { class: 'input input-num', type: 'number', inputmode: 'decimal', step: 'any', value: p.npv, 'aria-label': `${p.name} NPV`, 'data-i': i, 'data-k': 'npv' })),
      h('td', { class: 'is-num', 'data-pi': i }), h('td', { class: 'is-num', 'data-x': i }), h('td', { class: 'is-num', 'data-g': i }),
      h('td', {}, h('button', { class: 'icon-btn icon-btn-sm', type: 'button', 'aria-label': `Remove ${p.name}`, 'data-rm': i, disabled: rp.length <= 2 }, s('svg', { viewBox: '0 0 20 20', 'aria-hidden': 'true' }, s('path', { d: 'M6 6l8 8M14 6l-8 8', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round' }))))))));
  $('#cr-add').disabled = rp.length >= 12;
}
$('#cr-grid').addEventListener('input', (e) => {
  const el = e.target, i = +el.dataset.i, k = el.dataset.k;
  if (!k) return;
  rp[i][k] = k === 'name' ? el.value : parseFloat(el.value);
  renderRation();
});
$('#cr-grid').addEventListener('click', (e) => {
  const b = e.target.closest('[data-rm]'); if (!b) return;
  rp.splice(+b.dataset.rm, 1); drawRationGrid(); renderRation();
  $('#cr-add').focus();
});
$('#cr-add').addEventListener('click', () => { rp.push({ name: `Project ${rp.length + 1}`, outlay: 100, npv: 10 }); drawRationGrid(); renderRation(); $$('#cr-grid input.input-name').at(-1).focus(); });
$('#cr-reset').addEventListener('click', resetRation);
$('#cr-form').addEventListener('input', renderRation);
$('#cr-form').addEventListener('change', renderRation);

function renderRation() {
  const budget = parseFloat($('#cr-budget').value);
  const vbox = $('#cr-verdict'); vbox.replaceChildren();
  const valid = rp.every((p) => Number.isFinite(p.outlay) && p.outlay > 0 && Number.isFinite(p.npv));
  if (!valid || !(budget >= 0)) {
    $('#cr-npv').textContent = '—'; $('#cr-chart').replaceChildren(); $('#cr-table').replaceChildren();
    vbox.append(verdict('warn', 'Waiting for numbers.', 'Every project needs an outlay above zero and an NPV, and the budget can’t be negative.'));
    return;
  }
  const items = rp.map((p, i) => ({ ...p, name: p.name.trim() || `Project ${i + 1}` }));
  const r = ration(items, budget);
  const part = $('#cr-part').checked;
  const pis = items.map((p) => (p.npv + p.outlay) / p.outlay);
  const tick = (on, frac) => (frac != null ? (frac > 0.999 ? '✓' : frac > 0 ? F.pct(frac, 0) : '–') : on ? '✓' : '–');
  items.forEach((p, i) => {
    $(`[data-pi="${i}"]`).textContent = F.num(pis[i], 2);
    $(`[data-x="${i}"]`).textContent = part ? tick(false, r.fractions[i]) : tick(r.exact[i]);
    $(`[data-g="${i}"]`).textContent = tick(part ? r.fractions[i] > 0 : r.greedy[i]);
  });
  $$('#cr-grid thead th')[4].textContent = part ? 'Share taken' : 'Best set';
  const chosenNpv = part ? r.fractionalNpv : r.exactNpv;
  const used = part ? items.reduce((a, p, i) => a + r.fractions[i] * p.outlay, 0) : r.exactOutlay;
  $('#cr-npv').textContent = F.money(chosenNpv);
  $('#cr-hero-label').textContent = `total NPV, using ${F.money(used)} of ${F.money(budget)}`;
  const names = (mask) => items.filter((_, i) => mask[i]).map((p) => p.name);
  if (part) {
    vbox.append(verdict('good', 'Rank by profitability index.', 'When projects can be scaled down, filling the budget in PI order is the best you can do: the last project is taken only in part.'));
    vbox.append(h('p', { class: 'note' }, `Taking whole projects only, the best set would earn ${F.money(r.exactNpv)}. The difference, ${F.money(r.fractionalNpv - r.exactNpv)}, is the price of indivisibility.`));
  } else if (r.greedyNpv < r.exactNpv - 1e-9) {
    vbox.append(verdict('warn', `The PI shortcut leaves ${F.money(r.exactNpv - r.greedyNpv)} on the table.`, `It picks ${names(r.greedy).join(', ')} for ${F.money(r.greedyNpv)}; the best combination is ${names(r.exact).join(', ')} for ${F.money(r.exactNpv)}. Whole projects leave budget unspent, and the shortcut can’t trade a high-PI small project for a better use of the money.`));
  } else {
    vbox.append(verdict('good', `Fund ${names(r.exact).join(', ') || 'nothing'}.`, `Here the PI shortcut finds the best combination too: ${F.money(r.exactNpv)} of NPV.`));
  }
  const unspent = budget - (part ? used : r.exactOutlay);
  if (unspent > 1e-9 && !part) vbox.append(h('p', { class: 'note' }, `${F.money(unspent)} of the budget stays unspent because no remaining project fits.`));
  const order = items.map((_, i) => i).sort((a, b) => pis[b] - pis[a]);
  barChart($('#cr-chart'), {
    categories: order.map((i) => items[i].name), horizontal: true, legend: false, valueLabels: true, height: 200,
    series: [{ name: 'NPV per dollar invested', values: order.map((i) => pis[i] - 1), cls: 'm-s1' }], format: (v) => F.num(v, 2),
    label: 'NPV per dollar invested, by project', margin: { l: 150, r: 56 },
  });
  $$('#cr-chart path.mark').forEach((p, k) => { const i = order[k]; const inSet = part ? r.fractions[i] > 0 : r.exact[i]; p.classList.toggle('m-s1', !!inSet); p.classList.toggle('m-muted', !inSet); });
  $('#cr-table').replaceChildren();
  tableTwin($('#cr-table'), {
    caption: 'Capital rationing',
    columns: [{ label: 'Project' }, { label: 'Outlay', num: true }, { label: 'NPV', num: true }, { label: 'PI', num: true }, { label: part ? 'Share taken' : 'Best set', num: true }, { label: 'PI shortcut', num: true }],
    rows: order.map((i) => [items[i].name, F.money(items[i].outlay), F.money(items[i].npv), F.num(pis[i], 2), part ? tick(false, r.fractions[i]) : tick(r.exact[i]), tick(r.greedy[i])]),
  });
}

loadCase('timing');
resetRation();
syncRanges();
onResize($('#pf-chart'), debounce(renderProfile, 120));
onResize($('#cr-chart'), debounce(renderRation, 120));
