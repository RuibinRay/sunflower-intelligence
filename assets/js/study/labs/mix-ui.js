// mix-ui.js — the Marketing Mix Simulator's interface, shared by the lab page (learn/labs/mix/), the `mixsim`
// lesson widget and the M02 project page.
//
//   mountSimulator(el, { lock, show, plan, onChange(plan, results), baseline, baselineName, note, detail })
//     The full simulator by default (every decision, every result, the charts and the by-channel table).
//     Passing `show` gives the compact lesson view: only those results, plus the price chart when price is open.
//     lock: { tier | range | price | channels | promotion: true (DEFAULT_PLAN's value) or an explicit value }.
//     Returns { getPlan(), setPlan(plan), getResults(), el }.
//   mountCompare(el, plans, { onLoad(i), onRemove(i) })
//     Up to three plans side by side, differences marked in words and symbols. Returns { update(plans) }.
//
// Every number shown comes from the engine (assets/js/core/mixsim.js). Styles: assets/css/lab-mix.css.
import { h, s, rafThrottle, debounce, onResize } from '../../core/dom.js?v=6';
import * as F from '../../core/format.js?v=6';
import { barChart, lineChart, tableTwin, niceTicks, lin, Tooltip } from '../../core/charts.js?v=6';
import { fillRange } from '../../core/site.js?v=6';
import * as X from '../../core/mixsim.js?v=6';

const { TIERS, RANGES, CHANNELS, COMPETITORS, PROMOTION, LANTERN, DEFAULT_PLAN, PRICE, BUDGET, CATEGORY } = X;
const TIER = Object.fromEntries(TIERS.map((t) => [t.id, t]));
const RANGE = Object.fromEntries(RANGES.map((r) => [r.id, r]));
const CHANNEL = Object.fromEntries(CHANNELS.map((c) => [c.id, c]));
export const SHORT = { supermarket: 'Supermarkets', convenience: 'Convenience stores', natural: 'Natural grocers', direct: 'Cafés and online' };
export const RESULT_KEYS = ['units', 'share', 'revenue', 'margin', 'contribution', 'satisfaction', 'awareness', 'elasticity'];

// ---------------------------------------------------------------- formatting
export const fmt = {
  money: (v) => F.money(v),
  price: (v) => F.money(v, { digits: 2 }),
  int: (v) => F.int(v),
  pct: (v, d = 1) => F.pct(v, d),
  elast: (v) => F.num(v, 2),
  delta: (v, kind) => {
    if (!Number.isFinite(v)) return '';
    const a = Math.abs(v);
    const t = kind === 'money' ? F.money(a) : kind === 'price' ? F.money(a, { digits: 2 }) : kind === 'pts' ? `${F.num(a * 100, 1)} pts` : kind === 'index' ? F.num(a, 1) : F.int(a);
    if (kind === 'pts' ? a < 0.0005 : kind === 'money' || kind === 'int' ? a < 0.5 : a < 0.005) return 'same';
    return `${v > 0 ? '+' : '−'}${t}`;
  },
};
const lower1 = (t) => (/^[A-Z][a-z]/.test(t) ? t[0].toLowerCase() + t.slice(1) : t);
const listWords = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

/** The lesson pages may not load lab-mix.css; widgets call this so their styles always arrive. */
export function ensureStyles() {
  if (typeof document === 'undefined' || document.querySelector('link[data-mix-css], link[href*="lab-mix.css"]')) return;
  document.head.append(h('link', { rel: 'stylesheet', href: new URL('../../../css/lab-mix.css?v=6', import.meta.url).href, 'data-mix-css': '' }));
}

/** Allowed inline HTML in author notes (AUTHORING.md §2): rebuilt node by node, so nothing else gets through. */
export function safeHTML(html) {
  const frag = document.createDocumentFragment();
  if (!html) return frag;
  const tpl = document.createElement('template');
  tpl.innerHTML = String(html);
  const ok = new Set(['B', 'STRONG', 'I', 'EM', 'SUB', 'SUP', 'BR', 'CODE', 'ABBR', 'A']);
  const walk = (from, to) => from.childNodes.forEach((n) => {
    if (n.nodeType === 3) to.append(n.textContent);
    else if (n.nodeType === 1 && ok.has(n.tagName)) {
      const el = document.createElement(n.tagName.toLowerCase());
      if (n.tagName === 'A' && /^(https?:|\.|\/|#)/.test(n.getAttribute('href') || '')) el.setAttribute('href', n.getAttribute('href'));
      if (n.hasAttribute('title') && (n.tagName === 'ABBR' || n.tagName === 'A')) el.setAttribute('title', n.getAttribute('title'));
      walk(n, el); to.append(el);
    } else if (n.nodeType === 1) walk(n, to);
  });
  walk(tpl.content, frag);
  return frag;
}

let seq = 0;
const icon = (kind) => {
  const d = { info: 'M10 9v5M10 6.2v.3', warn: 'M10 5.5v5.2M10 14.2v.3', bad: 'M6.5 6.5l7 7M13.5 6.5l-7 7', good: 'M5 10.5l3.2 3.2L15 7' }[kind];
  return s('svg', { viewBox: '0 0 20 20', 'aria-hidden': 'true', class: 'mix-icon' }, s('circle', { cx: 10, cy: 10, r: 8.6, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6 }), s('path', { d, fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
};
/** The standing reminder that results are simulated. */
export function caveatNote(text = 'Simulated, not a forecast. These numbers come from a teaching model of a fictional market: use them to reason about trade-offs, not as predictions of real sales.') {
  const [first, ...rest] = text.split('. ');
  return h('p', { class: 'mix-caveat' }, icon('info'), h('span', {}, h('strong', {}, `${first}.`), ' ', rest.join('. ')));
}

// ---------------------------------------------------------------- plans in words
export function planWords(p) {
  const promo = X.PROMO_KEYS.reduce((a, k) => a + (p.promotion?.[k] || 0), 0);
  return {
    tier: TIER[p.tier]?.name || '—',
    range: RANGE[p.range]?.name || '—',
    price: Number.isFinite(p.price) ? fmt.price(p.price) : '—',
    channels: (p.channels || []).length ? p.channels.map((c) => SHORT[c] || c).join(', ') : 'none',
    promotion: `${fmt.money(promo)} a year`,
  };
}
const DECISION_NAMES = { tier: 'Product', range: 'Range', price: 'Price', channels: 'Channels', promotion: 'Promotion' };

function lockedPlan(lock = {}, start) {
  const plan = X.clonePlan(start);
  const locked = [];
  for (const k of X.DECISIONS) {
    const v = lock?.[k];
    if (v === undefined || v === false || v === null) continue;
    locked.push(k);
    if (v === true) plan[k] = k === 'channels' ? [...DEFAULT_PLAN.channels] : k === 'promotion' ? { ...DEFAULT_PLAN.promotion } : DEFAULT_PLAN[k];
    else if (k === 'promotion') plan.promotion = { ...DEFAULT_PLAN.promotion, ...v };
    else if (k === 'channels') plan.channels = [...v];
    else plan[k] = v;
  }
  return { plan, locked };
}
const snap = (v, lo, hi, step) => Math.min(hi, Math.max(lo, Math.round((v - lo) / step) * step + lo));
const snapPrice = (p) => Math.round(snap(p, PRICE.min, PRICE.max, PRICE.step) * 100) / 100;

// ================================================================ the simulator
export function mountSimulator(el, opts = {}) {
  const id = `mx${++seq}`;
  const detail = opts.detail ?? !opts.show;
  const show = new Set(opts.show && opts.show.length ? opts.show.filter((k) => RESULT_KEYS.includes(k)) : RESULT_KEYS);
  const start = { ...X.defaultPlan(), ...(opts.plan ? X.clonePlan({ ...X.defaultPlan(), ...opts.plan, promotion: { ...DEFAULT_PLAN.promotion, ...(opts.plan.promotion || {}) } }) : {}) };
  const { plan: initial, locked } = lockedPlan(opts.lock, start);
  const isOpen = (k) => !locked.includes(k);
  if (isOpen('price')) initial.price = snapPrice(+initial.price || DEFAULT_PLAN.price);
  if (isOpen('promotion')) for (const k of X.PROMO_KEYS) initial.promotion[k] = snap(+initial.promotion[k] || 0, BUDGET.min, BUDGET.max, BUDGET.step);
  let plan = X.clonePlan(initial);
  const baseline = X.simulate(opts.baseline || initial);
  const baselineName = opts.baselineName || (opts.baseline ? 'the default plan' : 'the starting plan');
  let res = null;

  el.replaceChildren();
  el.classList.add('mix');
  el.dataset.mode = detail ? 'full' : 'compact';
  const live = h('div', { class: 'visually-hidden', 'aria-live': 'polite', 'aria-atomic': 'true' });

  // ------------------------------------------------ decisions
  const form = h('form', { class: 'mix-form', novalidate: true, 'aria-label': 'Plan decisions', onsubmit: (e) => e.preventDefault() });
  const refs = {};
  const radioCards = (key, legend, items, hint) => {
    const fs = h('fieldset', { class: 'mix-field' }, h('legend', {}, legend));
    const wrap = h('div', { class: 'mix-cards' });
    refs[key] = items.map((it) => {
      const input = h('input', { type: 'radio', name: `${id}-${key}`, value: it.id, id: `${id}-${key}-${it.id}` });
      input.checked = plan[key] === it.id;
      input.addEventListener('change', () => { if (input.checked) { plan[key] = it.id; changed(); } });
      wrap.append(h('label', { class: 'mix-card', for: input.id }, input, h('span', { class: 'mix-card-body' }, h('strong', {}, it.name), h('span', { class: 'mix-card-meta' }, it.meta), it.detail ? h('span', { class: 'mix-card-detail' }, it.detail) : '')));
      return input;
    });
    fs.append(wrap);
    if (hint) fs.append(h('p', { class: 'field-hint' }, hint));
    return fs;
  };
  if (isOpen('tier')) form.append(radioCards('tier', 'Product: the cold brew', TIERS.map((t) => ({ id: t.id, name: t.name, meta: `Quality ${t.quality} out of 10 · ${fmt.price(t.cogs)} a can to make`, detail: t.detail })), 'Quality is a fictional taste-panel score; cost of goods covers the liquid, can, co-packer and freight.'));
  if (isOpen('range')) form.append(radioCards('range', 'Product: the range', RANGES.map((r) => ({ id: r.id, name: r.name, meta: r.skus === 1 ? '1 SKU · no extra fixed cost' : `${r.skus} SKUs · ${fmt.money(r.fixed)} a year for extra runs and labels`, detail: r.flavours.join(', ') })), 'Each flavour is a separate SKU, so retail listing fees are paid per flavour.'));

  let buildup = null;
  if (isOpen('price')) {
    const fs = h('fieldset', { class: 'mix-field' }, h('legend', {}, 'Price'));
    const out = h('output', { for: `${id}-price`, class: 'mix-out' });
    const input = h('input', { type: 'range', id: `${id}-price`, min: PRICE.min, max: PRICE.max, step: PRICE.step, value: plan.price.toFixed(2), 'aria-describedby': `${id}-ladder-text` });
    input.addEventListener('input', () => { plan.price = snapPrice(+input.value); changed(); });
    refs.price = { input, out };
    const ladder = h('div', { class: 'mix-ladder', 'aria-hidden': 'true' }, COMPETITORS.slice().sort((a, b) => a.price - b.price).map((k) => {
      const at = ((k.price - PRICE.min) / (PRICE.max - PRICE.min)) * 100;
      return h('span', { class: 'mix-ladder-mark', style: { left: `${at}%` } }, h('i'), h('span', {}, k.name.split(' ')[0]), h('span', {}, fmt.price(k.price)));
    }));
    fs.append(h('div', { class: 'slider-field' }, h('div', { class: 'slider-top' }, h('label', { for: input.id }, 'Shelf price per can'), out), input, ladder,
      h('p', { class: 'visually-hidden', id: `${id}-ladder-text` }, `Competitors’ usual shelf prices: ${COMPETITORS.map((k) => `${k.name} ${fmt.price(k.price)}`).join(', ')}.`)));
    if (detail || show.has('margin')) { buildup = h('div', { class: 'mix-buildup' }); fs.append(buildup); }
    form.append(fs);
  }

  if (isOpen('channels')) {
    const fs = h('fieldset', { class: 'mix-field' }, h('legend', {}, 'Place: where the cans are sold'));
    const wrap = h('div', { class: 'mix-cards' });
    refs.channels = CHANNELS.map((c) => {
      const input = h('input', { type: 'checkbox', value: c.id, id: `${id}-ch-${c.id}` });
      input.checked = plan.channels.includes(c.id);
      input.addEventListener('change', () => { plan.channels = CHANNELS.map((x) => x.id).filter((x) => (x === c.id ? input.checked : plan.channels.includes(x))); changed(); });
      const meta = h('span', { class: 'mix-card-meta' });
      const stocks = COMPETITORS.filter((k) => k.in.includes(c.id)).map((k) => k.name);
      wrap.append(h('label', { class: 'mix-card mix-card--check', for: input.id }, input, h('span', { class: 'mix-card-body' }, h('strong', {}, c.name), meta,
        h('span', { class: 'mix-card-detail' }, `${c.note} ${stocks.length ? `Rivals here: ${listWords(stocks)}.` : 'No rival brands: the alternative is not buying a can here.'}`))));
      return { input, meta, c };
    });
    fs.append(wrap);
    form.append(fs);
  }

  let promoTotal = null;
  if (isOpen('promotion')) {
    const fs = h('fieldset', { class: 'mix-field' }, h('legend', {}, 'Promotion: yearly budget'));
    refs.promotion = PROMOTION.map((v) => {
      const out = h('output', { for: `${id}-pr-${v.id}`, class: 'mix-out' });
      const input = h('input', { type: 'range', id: `${id}-pr-${v.id}`, min: BUDGET.min, max: BUDGET.max, step: BUDGET.step, value: plan.promotion[v.id], 'aria-describedby': `${id}-pr-${v.id}-hint` });
      input.addEventListener('input', () => { plan.promotion[v.id] = +input.value; changed(); });
      fs.append(h('div', { class: 'slider-field' }, h('div', { class: 'slider-top' }, h('label', { for: input.id }, v.name), out), input, h('p', { class: 'field-hint', id: `${id}-pr-${v.id}-hint` }, v.does)));
      return { input, out, v };
    });
    promoTotal = h('p', { class: 'mix-total' });
    fs.append(promoTotal);
    form.append(fs);
  }

  const fixedBox = locked.length ? h('div', { class: 'mix-fixed' }, h('p', { class: 'mix-fixed-title' }, isOpenAny() ? 'Fixed for this exercise' : 'This plan'), h('dl', {})) : null;
  function isOpenAny() { return X.DECISIONS.some(isOpen); }

  // ------------------------------------------------ results
  const results = h('div', { class: 'mix-results' });
  const errorBox = h('div', { class: 'mix-error', role: 'alert' });
  const body = h('div', { class: 'mix-body' });
  results.append(caveatNote(), errorBox, body);
  if (opts.note) results.prepend(h('p', { class: 'mix-note' }, safeHTML(opts.note)));

  const tiles = [];
  const tile = (key, label, value, delta, sub = null) => { const t = { key, label, value, delta, sub, dd: h('dd', { class: 'mix-tile-value' }), dsub: h('dd', { class: 'mix-tile-sub' }) }; tiles.push(t); return h('div', { class: 'mix-tile' }, h('dt', {}, label), t.dd, t.dsub); };
  const tileDefs = {
    units: () => tile('units', 'Cans sold in year 1', (r) => fmt.int(r.year.units), (r, b) => fmt.delta(r.year.units - b.year.units, 'int')),
    share: () => tile('share', 'Share of category cans', (r) => fmt.pct(r.year.share), (r, b) => fmt.delta(r.year.share - b.year.share, 'pts'), () => `of ${F.compact(CATEGORY.cansPerYear)} cans a year`),
    revenue: () => tile('revenue', 'Revenue to Lantern', (r) => fmt.money(r.year.revenue), (r, b) => fmt.delta(r.year.revenue - b.year.revenue, 'money'), () => 'after trade margins and direct fulfilment'),
    margin: () => tile('margin', 'Gross profit', (r) => fmt.money(r.year.grossProfit), (r, b) => fmt.delta(r.year.grossProfit - b.year.grossProfit, 'money'), (r) => `${fmt.pct(r.year.grossMargin)} of revenue`),
    contribution: () => tile('contribution', 'Contribution', (r) => fmt.money(r.year.contribution), (r, b) => fmt.delta(r.year.contribution - b.year.contribution, 'money'), () => 'before the launch overhead'),
    profit: () => tile('profit', `Profit after ${fmt.money(LANTERN.overhead)} overhead`, (r) => fmt.money(r.year.profit), (r, b) => fmt.delta(r.year.profit - b.year.profit, 'money')),
    breakeven: () => tile('breakeven', 'Break-even cans', (r) => (r.year.breakEvenUnits == null ? 'Not reachable' : fmt.int(r.year.breakEvenUnits)), (r, b) => (r.year.breakEvenUnits == null || b.year.breakEvenUnits == null ? '' : fmt.delta(r.year.breakEvenUnits - b.year.breakEvenUnits, 'int')), (r) => `at ${fmt.price(r.year.contributionPerCan)} contribution per can`),
    satisfaction: () => tile('satisfaction', 'Satisfaction index (simulated)', (r) => `${F.num(r.year.satisfaction, 0)} of 100`, (r, b) => fmt.delta(r.year.satisfaction - b.year.satisfaction, 'index'), () => '50 = competitors’ value for money'),
    awareness: () => tile('awareness', 'Awareness at year end', (r) => fmt.pct(r.year.awarenessEnd, 0), (r, b) => fmt.delta(r.year.awarenessEnd - b.year.awarenessEnd, 'pts'), () => `from ${fmt.pct(LANTERN.awareness, 0)} at launch`),
  };
  const tileKeys = detail
    ? ['units', 'share', 'breakeven', 'awareness', 'satisfaction', 'profit']
    : [...show].flatMap((k) => (k === 'contribution' ? ['contribution', 'profit', 'breakeven'] : k === 'elasticity' ? [] : [k]));
  if (tileKeys.length) body.append(h('dl', { class: 'mix-tiles' }, tileKeys.map((k) => tileDefs[k]())));

  // the money, as a small income statement (full view)
  let stmt = null;
  if (detail) {
    const rows = [
      ['revenue', 'Revenue to Lantern', 'after trade margins and direct fulfilment', 1, 'line'],
      ['cogs', 'Cost of goods', '', -1, 'line'],
      ['grossProfit', 'Gross profit', '', 1, 'sub'],
      ['tradeCost', 'Trade promotions', 'discounts Lantern pays in promoted weeks', -1, 'line'],
      ['marketing', 'Marketing', 'ads, sampling and PR', -1, 'line'],
      ['fixedCosts', 'Fixed costs', 'listing fees, range and direct-channel costs', -1, 'line'],
      ['contribution', 'Contribution', '', 1, 'sub'],
      ['overhead', 'Launch overhead', 'launch team and brand work', -1, 'line'],
      ['profit', 'Profit after overhead', '', 1, 'total'],
    ];
    stmt = { rows: rows.map(([key, label, note, sign, kind]) => ({ key, sign, td: h('td', { class: 'is-num' }), dt: h('td', { class: 'is-num mix-delta' }), tr: null, label, note, kind })) };
    const tbody = h('tbody', {}, stmt.rows.map((r) => (r.tr = h('tr', { class: r.kind === 'line' ? '' : `is-${r.kind}` }, h('th', { scope: 'row' }, r.sign < 0 ? `Less ${lower1(r.label)}` : r.label, r.note ? h('span', { class: 'mix-row-note' }, r.note) : ''), r.td, r.dt))));
    body.append(h('figure', { class: 'mix-figure' }, h('figcaption', { class: 'figure-title' }, 'The money in year 1'),
      h('div', { class: 'table-scroll' }, h('table', { class: 'data-table mix-statement' }, h('caption', { class: 'visually-hidden' }, 'Simulated year-1 income for this plan'),
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Simulated year 1'), h('th', { scope: 'col', class: 'is-num' }, 'This plan'), h('th', { scope: 'col', class: 'is-num' }, `Change vs ${baselineName}`))), tbody))));
  }

  const notesBox = h('div', { class: 'mix-notes' });
  body.append(notesBox);

  let qBox = null, chBox = null, priceBox = null, elBox = null;
  if (detail) {
    qBox = h('figure', { class: 'mix-figure' }, h('figcaption', { class: 'figure-title' }, 'Quarter by quarter'), h('p', { class: 'figure-sub' }, 'Cans sold follow the season (summer is Q3) and grow as awareness builds. Two charts, because cans and awareness are measured on different scales.'));
    qBox.append(h('div', { class: 'mix-pair' }, h('div', {}, h('p', { class: 'mix-chart-title' }, 'Cans sold'), h('div', { class: 'chart', id: `${id}-qunits` })), h('div', {}, h('p', { class: 'mix-chart-title' }, 'Awareness of Lantern'), h('div', { class: 'chart', id: `${id}-qaw` }))), h('div', { class: 'mix-twin' }));
    body.append(qBox);
  }
  if (detail || show.has('elasticity')) {
    chBox = h('figure', { class: 'mix-figure' }, h('figcaption', { class: 'figure-title' }, detail ? 'By channel' : 'Price elasticity by channel'), h('div', { class: 'mix-chtable' }));
    body.append(chBox);
  }
  if (isOpen('price')) {
    priceBox = h('figure', { class: 'mix-figure' }, h('figcaption', { class: 'figure-title' }, 'Profit and cans at every price'),
      h('p', { class: 'figure-sub' }, 'Everything else in the plan stays as it is. The vertical line is your price.'),
      h('div', { class: 'chart mix-price-chart' }), h('div', { class: 'mix-twin' }));
    body.append(priceBox);
  }

  // ------------------------------------------------ layout
  const grid = h('div', { class: `mix-grid${isOpenAny() ? '' : ' is-locked'}` });
  const side = h('div', { class: 'mix-side' });
  if (fixedBox) side.append(fixedBox);
  if (isOpenAny()) side.append(form);
  const pulse = h('div', { class: 'mix-pulse', 'aria-hidden': 'true' });
  if (isOpenAny()) side.append(pulse);
  grid.append(side, results);
  el.append(grid, live);

  // ------------------------------------------------ rendering
  let sweepKey = '', sweepRows = null, bestP = null, first = true;
  const say = debounce((text) => { live.textContent = text; }, 800);
  const announce = (text) => { if (first) return; say(text); }; // not on load: a lesson may hold several widgets

  function renderControls() {
    if (refs.price) { refs.price.out.textContent = fmt.price(plan.price); refs.price.input.setAttribute('aria-valuetext', `${fmt.price(plan.price)} a can`); fillRange(refs.price.input); }
    if (refs.promotion) {
      refs.promotion.forEach(({ input, out, v }) => { out.textContent = fmt.money(plan.promotion[v.id]); input.setAttribute('aria-valuetext', `${fmt.money(plan.promotion[v.id])} a year`); fillRange(input); });
      const tot = X.PROMO_KEYS.reduce((a, k) => a + plan.promotion[k], 0);
      promoTotal.replaceChildren('Total ', h('strong', {}, fmt.money(tot)), ` a year, of which ${fmt.money(plan.promotion.digital + plan.promotion.sampling + plan.promotion.pr)} is marketing and ${fmt.money(plan.promotion.trade)} funds trade promotions.`);
    }
    if (refs.channels) {
      const skus = RANGE[plan.range]?.skus || 1;
      refs.channels.forEach(({ meta, c }) => {
        meta.textContent = c.id === 'direct'
          ? `${fmt.pct(c.volume, 0)} of category cans · no trade margin · ${fmt.price(c.fulfil)} a can to pack and deliver · ${fmt.money(c.fixed)} a year`
          : `${fmt.pct(c.volume, 0)} of category cans · trade margin ${fmt.pct(c.margin, 0)} · listing ${fmt.money(c.listing)} per flavour a year${skus > 1 ? ` (${fmt.money(c.listing * skus)} for ${skus})` : ''}`;
      });
    }
    if (fixedBox) {
      const w = planWords(plan);
      fixedBox.querySelector('dl').replaceChildren(...locked.flatMap((k) => [h('dt', {}, DECISION_NAMES[k]), h('dd', {}, k === 'tier' ? `${w.tier} (quality ${TIER[plan.tier]?.quality}, ${fmt.price(TIER[plan.tier]?.cogs ?? NaN)} a can)` : k === 'promotion' ? PROMOTION.map((v, i) => `${i ? lower1(v.name) : v.name} ${fmt.money(plan.promotion[v.id] || 0)}`).join('; ') : w[k])]));
    }
  }

  function renderBuildup() {
    if (!buildup) return;
    const chosen = CHANNELS.filter((c) => plan.channels.includes(c.id));
    if (!chosen.length) { buildup.replaceChildren(h('p', { class: 'field-hint' }, 'Choose a channel to see how the shelf price splits up.')); return; }
    const tier = TIER[plan.tier], P = plan.price;
    buildup.replaceChildren(
      h('p', { class: 'mix-sub' }, `Where ${fmt.price(P)} goes, per can`),
      h('ul', { class: 'mix-key', 'aria-hidden': 'true', role: 'list' }, h('li', {}, h('i', { class: 'bu-goods' }), 'Cost of goods'), h('li', {}, h('i', { class: 'bu-margin' }), 'Lantern’s gross margin'), h('li', {}, h('i', { class: 'bu-trade' }), 'Trade margin or fulfilment')),
      h('ul', { class: 'mix-bu-list', role: 'list' }, chosen.map((c) => {
        const cut = c.id === 'direct' ? c.fulfil : P * c.margin;
        const net = P - cut, gm = net - tier.cogs;
        const w = (v) => `${Math.max(0, (v / P) * 100).toFixed(2)}%`;
        return h('li', { class: 'mix-bu' }, h('span', { class: 'mix-bu-name' }, c.name),
          h('span', { class: 'mix-bu-bar', 'aria-hidden': 'true' }, h('i', { class: 'bu-goods', style: { width: w(tier.cogs) } }), h('i', { class: 'bu-margin', style: { width: w(gm) } }), h('i', { class: 'bu-trade', style: { width: w(cut) } })),
          h('span', { class: 'mix-bu-text' }, `${fmt.price(P)} − ${fmt.price(cut)} ${c.id === 'direct' ? 'fulfilment' : `trade margin (${fmt.pct(c.margin, 0)})`} = `, h('strong', {}, fmt.price(net)), ' to Lantern − ', `${fmt.price(tier.cogs)} goods = `, h('strong', {}, fmt.price(gm)), ' gross margin'));
      })));
  }

  function renderPulse() {
    if (!res?.ok) { pulse.replaceChildren(h('span', {}, res?.error || '')); return; }
    pulse.replaceChildren(h('span', {}, h('strong', {}, fmt.int(res.year.units)), ' cans'), h('span', {}, h('strong', {}, fmt.money(res.year.contribution)), ' contribution'), h('span', {}, h('strong', {}, fmt.money(res.year.profit)), ' profit'));
  }

  function renderTiles() {
    tiles.forEach((t) => {
      t.dd.textContent = t.value(res);
      const d = baseline.ok ? t.delta(res, baseline) : '';
      const sub = t.sub ? t.sub(res) : '';
      t.dsub.textContent = [sub, d ? `${d === 'same' ? 'same as' : `${d} vs`} ${baselineName}` : ''].filter(Boolean).join(' · ');
    });
    if (stmt) {
      const y = res.year, b = baseline.ok ? baseline.year : null;
      stmt.rows.forEach((r) => {
        const v = y[r.key];
        r.td.textContent = r.sign < 0 ? (v ? `(${fmt.money(v)})` : fmt.money(0)) : fmt.money(v);
        if (r.key === 'grossProfit') r.td.append(h('span', { class: 'mix-row-note' }, `${fmt.pct(y.grossMargin)} of revenue`));
        const d = b ? fmt.delta(v - b[r.key], 'money') : '';
        r.dt.textContent = d === 'same' ? '—' : d;
      });
    }
  }

  function renderNotes() {
    notesBox.replaceChildren(...res.notes.map((n) => h('p', { class: 'mix-notice' }, icon('warn'), h('span', {}, n))));
  }

  function renderQuarters() {
    if (!qBox) return;
    const qs = res.quarters;
    const cu = qBox.querySelector(`#${id}-qunits`), ca = qBox.querySelector(`#${id}-qaw`);
    barChart(cu, { categories: qs.map((q) => `Q${q.q}`), series: [{ name: 'Cans sold', values: qs.map((q) => q.units), cls: 'm-s1' }], height: 210, format: (v) => F.compact(v), label: `Cans sold by quarter: ${qs.map((q) => `Q${q.q} ${fmt.int(q.units)}`).join(', ')}`, margin: { l: 46 } });
    const aw = [LANTERN.awareness, ...qs.map((q) => q.awareness)];
    const labels = ['Launch', 'Q1', 'Q2', 'Q3', 'Q4'];
    lineChart(ca, { xs: [0, 1, 2, 3, 4], xTicks: [0, 1, 2, 3, 4], xFormat: (i) => labels[Math.round(i)] ?? '', series: [{ name: 'Awareness', values: aw, cls: 'm-s2' }], height: 210, endLabels: false, yDomain: [0, Math.max(0.4, ...aw)], yFormat: (v) => F.pct(v, 0), label: `Awareness of Lantern: ${aw.map((v, i) => `${labels[i]} ${F.pct(v, 0)}`).join(', ')}` });
    ca.querySelector('.legend')?.remove();
    const twin = qBox.querySelector('.mix-twin');
    const wasOpen = twin.querySelector('details')?.open;
    twin.replaceChildren();
    tableTwin(twin, {
      caption: 'Simulated results by quarter', open: wasOpen,
      columns: [{ label: 'Quarter' }, { label: 'Cans sold', num: true }, { label: 'Share of category', num: true }, { label: 'Awareness', num: true }, { label: 'Weeks on promotion', num: true }],
      rows: qs.map((q) => [`Q${q.q}`, fmt.int(q.units), fmt.pct(q.share), F.pct(q.awareness, 1), F.pct(q.promoShare, 0)]),
    });
  }

  function renderChannels() {
    if (!chBox) return;
    const box = chBox.querySelector('.mix-chtable');
    if (!detail) {
      box.replaceChildren(h('div', { class: 'table-scroll' }, h('table', { class: 'data-table' }, h('caption', { class: 'visually-hidden' }, 'Own-price elasticity of Lantern’s cans in each channel'),
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Channel'), h('th', { scope: 'col', class: 'is-num' }, 'Elasticity'), h('th', { scope: 'col', class: 'is-num' }, 'Lantern’s share'), h('th', { scope: 'col' }, 'Reading'))),
        h('tbody', {}, res.byChannel.map((c) => h('tr', {}, h('th', { scope: 'row' }, SHORT[c.id]), h('td', { class: 'is-num' }, fmt.elast(c.elasticity)), h('td', { class: 'is-num' }, fmt.pct(c.share)), h('td', { class: 'mix-read' }, `1% higher price → about ${F.num(Math.abs(c.elasticity), 1)}% fewer cans (${c.elasticity < -1 ? 'elastic' : 'inelastic'})`)))))),
      h('p', { class: 'field-hint' }, 'Elasticity holds promotion activity fixed. Below −1 (elastic), a small price rise loses revenue; between −1 and 0 (inelastic), it gains revenue.'));
      return;
    }
    const tot = res.year;
    const wasOpen = box.querySelector('details')?.open;
    box.replaceChildren(
      h('div', { class: 'table-scroll' }, h('table', { class: 'data-table mix-ch' }, h('caption', { class: 'visually-hidden' }, 'Simulated results by channel'),
        h('thead', {}, h('tr', {}, ['Channel', 'Cans', 'Share of channel', 'Net price', 'Contribution', 'Elasticity'].map((t, i) => h('th', { scope: 'col', class: i ? 'is-num' : '' }, t)))),
        h('tbody', {}, res.byChannel.map((c) => h('tr', {}, h('th', { scope: 'row' }, SHORT[c.id]), h('td', { class: 'is-num' }, fmt.int(c.units)), h('td', { class: 'is-num' }, fmt.pct(c.share)), h('td', { class: 'is-num' }, fmt.price(c.netPrice)), h('td', { class: 'is-num' }, fmt.money(c.contribution)), h('td', { class: 'is-num' }, fmt.elast(c.elasticity))))),
        h('tfoot', {}, h('tr', { class: 'is-total' }, h('th', { scope: 'row' }, 'All channels'), h('td', { class: 'is-num' }, fmt.int(tot.units)), h('td', { class: 'is-num' }, `${fmt.pct(tot.share)} of category`), h('td', { class: 'is-num' }, '—'), h('td', { class: 'is-num' }, fmt.money(res.byChannel.reduce((a, c) => a + c.contribution, 0))), h('td', { class: 'is-num' }, fmt.elast(tot.elasticity)))))),
      h('p', { class: 'field-hint' }, 'Channel contribution = gross profit − trade discounts − the channel’s listing fees (or the direct channel’s fixed cost), before shared costs: ads, sampling, PR and the range’s fixed cost. Elasticity: the % change in cans for a 1% higher price, holding promotion fixed.'),
    );
    const det = h('details', { class: 'table-twin' }, h('summary', {}, 'Show brand shares in each channel'),
      h('div', { class: 'table-scroll' }, h('table', { class: 'data-table' }, h('caption', { class: 'visually-hidden' }, 'Simulated share of each channel’s cans by brand'),
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Channel'), h('th', { scope: 'col' }, 'Brand'), h('th', { scope: 'col', class: 'is-num' }, 'Share of the channel’s cans'))),
        h('tbody', {}, res.byChannel.flatMap((c) => c.brands.map((b, i) => h('tr', { class: i === 0 ? 'mix-first' : '' }, i === 0 ? h('th', { scope: 'rowgroup', rowspan: c.brands.length }, SHORT[c.id]) : null, h('td', {}, b.name), h('td', { class: 'is-num' }, fmt.pct(b.share)))))))));
    if (wasOpen) det.open = true;
    box.append(det);
  }

  function renderPrice() {
    if (!priceBox) return;
    const key = JSON.stringify({ ...plan, price: 0 });
    if (key !== sweepKey) { sweepKey = key; sweepRows = X.sweep(plan, 'price', X.priceGrid()); bestP = X.bestPrice(plan); }
    const chart = priceBox.querySelector('.mix-price-chart');
    priceChart(chart, { rows: sweepRows, price: plan.price, units: res.year.units, profit: res.year.profit, best: bestP });
    const twin = priceBox.querySelector('.mix-twin');
    const wasOpen = twin.querySelector('details')?.open;
    twin.replaceChildren();
    tableTwin(twin, {
      caption: 'Simulated cans and profit after overhead at each shelf price', open: wasOpen,
      columns: [{ label: 'Shelf price' }, { label: 'Cans sold', num: true }, { label: 'Profit after overhead', num: true }],
      rows: sweepRows.filter((r) => r.ok).map((r) => [`${fmt.price(r.value)}${Math.abs(r.value - plan.price) < 0.001 ? ' (your price)' : ''}`, fmt.int(r.units), fmt.money(r.profit)]),
    });
    twin.append(h('p', { class: 'field-hint' }, bestP ? `Most profitable shelf price for this plan: ${fmt.price(bestP.price)} (profit ${fmt.money(bestP.profit)}), searched to the cent. A flat top means nearby prices earn almost as much.` : ''));
  }

  function render() {
    res = X.simulate(plan);
    renderControls();
    renderBuildup();
    if (!res.ok) {
      errorBox.replaceChildren(h('p', { class: 'mix-notice is-bad' }, icon('bad'), h('span', {}, h('strong', {}, res.error), ' The results return as soon as the plan is complete.')));
      body.hidden = true;
      renderPulse();
      announce(res.error);
      return;
    }
    errorBox.replaceChildren();
    body.hidden = false;
    renderTiles(); renderNotes(); renderQuarters(); renderChannels(); renderPrice(); renderPulse();
    const y = res.year;
    const said = detail || show.has('contribution') ? `profit after overhead ${fmt.money(y.profit)}` : show.has('revenue') ? `revenue ${fmt.money(y.revenue)}` : show.has('satisfaction') ? `satisfaction index ${F.num(y.satisfaction, 0)}` : `awareness ${fmt.pct(y.awarenessEnd, 0)}`;
    announce(`Simulated: ${fmt.int(y.units)} cans, ${fmt.pct(y.share)} share, ${said}.`);
  }

  const onChange = typeof opts.onChange === 'function' ? opts.onChange : null;
  const notify = debounce(() => onChange && onChange(X.clonePlan(plan), res), 150);
  const changed = rafThrottle(() => { render(); notify(); });

  function syncInputs() {
    refs.tier?.forEach((i) => { i.checked = i.value === plan.tier; });
    refs.range?.forEach((i) => { i.checked = i.value === plan.range; });
    if (refs.price) refs.price.input.value = plan.price.toFixed(2);
    refs.channels?.forEach(({ input, c }) => { input.checked = plan.channels.includes(c.id); });
    refs.promotion?.forEach(({ input, v }) => { input.value = plan.promotion[v.id]; });
  }

  render();
  first = false;
  if (onChange) onChange(X.clonePlan(plan), res);
  onResize(results, () => { if (res?.ok) { renderQuarters(); renderPrice(); } });

  return {
    el,
    getPlan: () => X.clonePlan(plan),
    getResults: () => res,
    /** Replace the plan (locked decisions stay locked). */
    setPlan(next) {
      const merged = lockedPlan(opts.lock, { ...X.defaultPlan(), ...X.clonePlan({ ...X.defaultPlan(), ...next, promotion: { ...DEFAULT_PLAN.promotion, ...(next?.promotion || {}) } }) }).plan;
      if (isOpen('price')) merged.price = snapPrice(+merged.price);
      if (isOpen('promotion')) for (const k of X.PROMO_KEYS) merged.promotion[k] = snap(+merged.promotion[k] || 0, BUDGET.min, BUDGET.max, BUDGET.step);
      plan = merged; syncInputs(); render(); notify();
    },
  };
}

// ================================================================ the price chart: two panels, one shared price axis
/** Profit after overhead (top) and cans sold (bottom) against shelf price, with the current price marked. */
export function priceChart(container, { rows, price, units, profit, best, height }) {
  container.replaceChildren();
  const ok = rows.filter((r) => r.ok);
  const width = Math.max(260, Math.floor(container.clientWidth || 600));
  const narrow = width < 420;
  const same = best && Math.abs(best.price - price) < 0.005;
  const x0 = lin(PRICE.min, PRICE.max, 0, width - (narrow ? 52 : 64) - 14);
  const near = best && !same && Math.abs(x0(best.price) - x0(price)) < 120; // too close for separate labels
  const m = { l: narrow ? 52 : 64, r: 14, t: near ? 62 : 48 };
  const ph = narrow ? 112 : 128, gap = 44, bottom = 40;
  const H = height || m.t + ph + gap + ph + bottom;
  const iw = width - m.l - m.r;
  const svg = s('svg', { width, height: H, viewBox: `0 0 ${width} ${H}`, class: 'chart-svg', role: 'img', tabindex: 0, 'aria-label': `Profit after overhead and cans sold at each shelf price from ${fmt.price(PRICE.min)} to ${fmt.price(PRICE.max)}. Your price ${fmt.price(price)}: ${fmt.int(units)} cans, profit ${fmt.money(profit)}.${best ? ` The most profitable price is ${fmt.price(best.price)}.` : ''} Use the arrow keys to read each price.` });
  container.append(svg);
  const tip = new Tooltip(container);
  const x = lin(PRICE.min, PRICE.max, 0, iw);
  const g = s('g', { transform: `translate(${m.l},0)` });
  svg.append(g);
  const panel = (top, values, cls, title, fmtY, withZero) => {
    const lo = Math.min(...values, withZero ? 0 : Infinity), hi = Math.max(...values, 0);
    const nt = niceTicks(withZero ? lo : 0, hi, 3);
    const y = lin(nt.min, nt.max, top + ph, top);
    nt.ticks.forEach((t) => {
      g.append(s('line', { x1: 0, x2: iw, y1: y(t), y2: y(t), class: t === 0 ? 'grid zero' : 'grid' }));
      g.append(s('text', { x: -8, y: y(t) + 4, 'text-anchor': 'end', class: 'tick' }, fmtY(t)));
    });
    g.append(s('text', { x: -m.l + 4, y: top - 12, class: 'axis-label' }, title));
    g.append(s('path', { d: ok.map((r, i) => `${i ? 'L' : 'M'}${x(r.value).toFixed(1)},${y(cls === 'm-s1' ? r.profit : r.units).toFixed(1)}`).join(''), class: `curve ${cls}` }));
    return y;
  };
  const yP = panel(m.t, ok.map((r) => r.profit), 'm-s1', 'Profit after overhead ($)', (v) => F.tick(v, 1).replace(/^(−?)(\d)/, '$1$$$2'), true);
  const yU = panel(m.t + ph + gap, ok.map((r) => r.units), 'm-s2', 'Cans sold', (v) => F.tick(v, 1), false);
  // x axis
  const yAxis = m.t + ph + gap + ph;
  g.append(s('line', { x1: 0, x2: iw, y1: yAxis, y2: yAxis, class: 'axis-line' }));
  const ticks = [1.99, 2.49, 2.99, 3.49, 3.99, 4.49, 4.99].filter((_, i) => !narrow || i % 2 === 0 || i === 6);
  ticks.forEach((t) => g.append(s('text', { x: x(t), y: yAxis + 18, 'text-anchor': 'middle', class: 'tick' }, fmt.price(t))));
  g.append(s('text', { x: iw, y: yAxis + 34, 'text-anchor': 'end', class: 'axis-label' }, 'Shelf price per can'));
  // the best price (a small diamond on the profit curve) and your price (a line through both panels)
  if (best) {
    const bx = x(best.price), by = yP(best.profit);
    g.append(s('path', { d: `M${bx},${by - 7}L${bx + 6},${by}L${bx},${by + 7}L${bx - 6},${by}Z`, class: 'mix-best-mark' }));
  }
  const cx = x(price);
  g.append(s('line', { x1: cx, x2: cx, y1: (near ? 2 : 1) * 15 + 2, y2: yAxis, class: 'ref-line is-strong' }));
  g.append(s('circle', { cx, cy: yP(profit), r: 5, class: 'dot m-s1' }));
  g.append(s('circle', { cx, cy: yU(units), r: 5, class: 'dot m-s2' }));
  // labels above the plot: your price, and the most profitable price on a second line when the two are close
  const lines = [same ? `Your price ${fmt.price(price)} (most profitable)` : `Your price ${fmt.price(price)}`];
  if (near) lines.push(`◆ most profitable ${fmt.price(best.price)}`);
  const estW = Math.max(...lines.map((t) => t.length * 6.6));
  const right = cx < iw * 0.55;
  const lx = right ? Math.min(cx + 6, iw + m.r - 2 - estW) : Math.max(cx - 6, -m.l + 2 + estW);
  lines.forEach((t, k) => g.append(s('text', { x: lx, y: 13 + k * 15, 'text-anchor': right ? 'start' : 'end', class: `pt-label${k ? ' is-muted' : ''}` }, t)));
  if (best && !same && !near) {
    const bx = x(best.price), up = yP(best.profit) - 12;
    const anchorRight = best.price > price ? 'start' : 'end';
    g.append(s('text', { x: bx + (anchorRight === 'start' ? 8 : -8), y: Math.max(m.t + 18, up), 'text-anchor': anchorRight, class: 'pt-label is-muted' }, `◆ most profitable ${fmt.price(best.price)}`));
  }
  // hover and keyboard: nearest grid price
  const cross = s('line', { y1: m.t - 4, y2: yAxis, class: 'crosshair' }); cross.style.display = 'none';
  const d1 = s('circle', { r: 4.5, class: 'dot m-s1' }), d2 = s('circle', { r: 4.5, class: 'dot m-s2' });
  d1.style.display = d2.style.display = 'none';
  g.append(cross, d1, d2);
  const at = (i) => {
    if (i < 0) { cross.style.display = d1.style.display = d2.style.display = 'none'; tip.hide(); return; }
    const r = ok[i], xx = x(r.value);
    cross.setAttribute('x1', xx); cross.setAttribute('x2', xx); cross.style.display = '';
    d1.setAttribute('cx', xx); d1.setAttribute('cy', yP(r.profit)); d2.setAttribute('cx', xx); d2.setAttribute('cy', yU(r.units));
    d1.style.display = d2.style.display = '';
    tip.show(m.l + xx, m.t + 6, `Shelf price ${fmt.price(r.value)}`, [{ value: fmt.money(r.profit), label: 'profit after overhead', key: 'm-s1' }, { value: fmt.int(r.units), label: 'cans sold', key: 'm-s2' }]);
  };
  const hit = s('rect', { x: 0, y: m.t - 10, width: iw, height: yAxis - m.t + 10, class: 'hit' });
  hit.addEventListener('pointermove', (e) => {
    const rect = svg.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (width / rect.width) - m.l;
    let bi = 0; ok.forEach((r, i) => { if (Math.abs(x(r.value) - px) < Math.abs(x(ok[bi].value) - px)) bi = i; });
    at(bi);
  });
  hit.addEventListener('pointerleave', () => at(-1));
  g.append(hit);
  let idx = -1;
  svg.addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Escape'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === 'Escape') { idx = -1; at(-1); return; }
    if (idx < 0) idx = ok.findIndex((r) => Math.abs(r.value - price) < 0.051);
    if (e.key === 'Home') idx = 0; else if (e.key === 'End') idx = ok.length - 1;
    else idx = Math.max(0, Math.min(ok.length - 1, idx + (e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : -1)));
    at(idx);
  });
  svg.addEventListener('blur', () => { idx = -1; at(-1); });
  container.append(h('ul', { class: 'legend', role: 'list' },
    h('li', {}, h('i', { class: 'legend-key is-line m-s1' }), 'Profit after overhead'), h('li', {}, h('i', { class: 'legend-key is-line m-s2' }), 'Cans sold'),
    h('li', {}, h('i', { class: 'legend-key mix-legend-line' }), 'Your price'), best ? h('li', {}, h('i', { class: 'legend-key mix-legend-best' }), 'Most profitable price') : null));
}

// ================================================================ comparing plans
const CMP_DECISIONS = [
  ['Product', (p) => TIER[p.tier]?.name],
  ['Range', (p) => RANGE[p.range]?.name],
  ['Shelf price', (p) => fmt.price(p.price)],
  ['Channels', (p) => p.channels.map((c) => SHORT[c]).join(', ')],
  ...PROMOTION.map((v) => [v.name, (p) => fmt.money(p.promotion[v.id] || 0)]),
];
const CMP_RESULTS = [
  ['Cans sold', (r) => r.year.units, fmt.int, 1, 'int'],
  ['Share of category cans', (r) => r.year.share, (v) => fmt.pct(v), 1, 'pts'],
  ['Revenue to Lantern', (r) => r.year.revenue, fmt.money, 1, 'money'],
  ['Gross profit', (r) => r.year.grossProfit, fmt.money, 1, 'money'],
  ['Trade promotions', (r) => r.year.tradeCost, fmt.money, 0, 'money'],
  ['Marketing', (r) => r.year.marketing, fmt.money, 0, 'money'],
  ['Fixed costs', (r) => r.year.fixedCosts, fmt.money, 0, 'money'],
  ['Contribution', (r) => r.year.contribution, fmt.money, 1, 'money'],
  ['Profit after overhead', (r) => r.year.profit, fmt.money, 1, 'money'],
  ['Break-even cans', (r) => r.year.breakEvenUnits, (v) => (v == null ? 'Not reachable' : fmt.int(v)), -1, 'int'],
  ['Contribution per can', (r) => r.year.contributionPerCan, fmt.price, 1, 'price'],
  ['Satisfaction index (simulated)', (r) => r.year.satisfaction, (v) => F.num(v, 0), 1, 'index'],
  ['Awareness at year end', (r) => r.year.awarenessEnd, (v) => fmt.pct(v, 0), 1, 'pts'],
];

/**
 * Plans side by side. plans: [{ name, plan }] (or bare plans). The first plan is the reference: other plans' cells that
 * differ are marked "◆ differs" (decisions) or show the change (results); the best value of each result where more
 * (or fewer) is clearly better is marked "★ best". Returns { update(plans) }.
 */
export function mountCompare(el, plans = [], opts = {}) {
  el.classList.add('mix-compare');
  function update(list) {
    const items = (list || []).map((p, i) => (p && p.plan ? { name: p.name || `Plan ${'ABC'[i]}`, plan: p.plan } : { name: `Plan ${'ABC'[i] || i + 1}`, plan: p })).slice(0, 3);
    if (!items.length) { el.replaceChildren(h('p', { class: 'mix-empty' }, 'No saved plans yet. Save the plan above, change it, and save again: up to three plans appear here side by side.')); return; }
    const runs = items.map((it) => X.simulate(it.plan));
    const ref = items[0].name;
    const head = h('tr', {}, h('th', { scope: 'col' }, h('span', { class: 'visually-hidden' }, 'Decision or result')), items.map((it, i) => h('th', { scope: 'col', class: 'mix-cmp-plan' },
      h('span', { class: 'mix-cmp-name' }, it.name),
      h('span', { class: 'mix-cmp-actions' },
        opts.onLoad ? h('button', { type: 'button', class: 'mix-link-btn', onclick: () => opts.onLoad(i), 'aria-label': `Load ${it.name} into the simulator` }, 'Load') : null,
        opts.onRemove ? h('button', { type: 'button', class: 'mix-link-btn', onclick: () => opts.onRemove(i), 'aria-label': `Remove ${it.name}` }, 'Remove') : null))));
    const rows = [];
    rows.push(h('tr', { class: 'mix-cmp-group' }, h('th', { scope: 'rowgroup', colspan: items.length + 1 }, 'Decisions')));
    for (const [label, get] of CMP_DECISIONS) {
      const vals = items.map((it) => get(it.plan));
      const differs = vals.some((v) => v !== vals[0]);
      rows.push(h('tr', { class: differs ? 'is-diff' : '' }, h('th', { scope: 'row' }, label, differs ? h('span', { class: 'mix-flag' }, ' · differs') : null),
        vals.map((v, i) => h('td', { class: i && v !== vals[0] ? 'mix-cell-diff' : '' }, i && v !== vals[0] ? h('span', { class: 'mix-mark', 'aria-hidden': 'true' }, '◆ ') : null, v, i && v !== vals[0] ? h('span', { class: 'visually-hidden' }, ` (differs from ${ref})`) : null))));
    }
    rows.push(h('tr', { class: 'mix-cmp-group' }, h('th', { scope: 'rowgroup', colspan: items.length + 1 }, 'Simulated year 1')));
    for (const [label, get, show, dir, kind] of CMP_RESULTS) {
      const vals = runs.map((r) => (r.ok ? get(r) : NaN));
      const finite = vals.filter((v) => v != null && Number.isFinite(v));
      const bestV = dir && items.length > 1 && finite.length > 1 && new Set(finite).size > 1 ? (dir > 0 ? Math.max(...finite) : Math.min(...finite)) : null;
      rows.push(h('tr', {}, h('th', { scope: 'row' }, label), vals.map((v, i) => {
        if (!runs[i].ok) return h('td', {}, runs[i].error);
        const isBest = bestV != null && v === bestV;
        const d = i && v != null && vals[0] != null ? fmt.delta(v - vals[0], kind) : '';
        return h('td', { class: `is-num${isBest ? ' mix-cell-best' : ''}` }, isBest ? h('span', { class: 'mix-best' }, '★ best ') : null, show(v), d && d !== 'same' ? h('span', { class: 'mix-cmp-delta' }, `${d} vs ${ref}`) : null);
      })));
    }
    el.replaceChildren(
      h('div', { class: 'table-scroll' }, h('table', { class: 'data-table mix-cmp' }, h('caption', { class: 'visually-hidden' }, `Saved plans compared; differences are measured against ${ref}`), h('thead', {}, head), h('tbody', {}, rows))),
      h('p', { class: 'field-hint' }, `◆ marks a decision that differs from ${ref}; changes in results are measured against ${ref}; ★ marks the best value where more (or, for break-even, fewer) is better. All results are simulated.`),
    );
  }
  update(plans);
  return { update };
}
