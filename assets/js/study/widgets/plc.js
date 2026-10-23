// widgets/plc.js — the `plc` lesson widget: an explorer for the product life cycle (AUTHORING.md §4).
//   { type: 'plc', stages: ['introduction', 'growth', 'maturity', 'decline'] }
// Optional: 'development' at the start of `stages` adds the pre-launch stage; select: '<stage>' picks the stage shown
// first; note: 'html'. The curves are stylised (an idealised textbook shape, not data); the student moves the stage
// boundaries (pointer or arrow keys) and reads what each stage typically involves.
import { h, s, debounce, onResize } from '../../core/dom.js?v=6';
import { tableTwin } from '../../core/charts.js?v=6';
import { ensureStyles, safeHTML } from '../labs/mix-ui.js?v=6';

// ---------------------------------------------------------------- the idealised curves (t = share of the life cycle since launch)
const L = (t) => 1 / (1 + Math.exp(-13 * (t - 0.30)));          // adoption: slow start, fast middle, saturation
const Fd = (t) => 1 / (1 + Math.exp(11 * (t - 0.80)));          // decline: tastes move on, substitutes arrive
const RAW = (t) => (t < 0 ? 0 : L(t) * Fd(t));
const T0_DEV = -0.18;
const grid = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
const SMAX = Math.max(...grid(0, 1, 2000).map(RAW));
export const sales = (t) => RAW(t) / SMAX;
/** Profit = sales × a unit margin that shrinks as competitors arrive − costs that are heaviest at launch. */
export const profit = (t) => (t < 0 ? -0.18 - 0.10 * ((t - T0_DEV) / -T0_DEV) : sales(t) * (0.62 - 0.30 * t) - (0.10 + 0.22 * Math.exp(-t / 0.10)));
const PMAX = Math.max(...grid(0, 1, 2000).map(profit));
const argmax = (f, a, b) => { let bt = a, bv = -Infinity; for (const t of grid(a, b, 2000)) { const v = f(t); if (v > bv) { bv = v; bt = t; } } return bt; };
const T_PEAK = argmax(sales, 0, 1);
const T_FAST = argmax((t) => sales(t + 0.001) - sales(t), 0, 0.9);

// ---------------------------------------------------------------- what each stage typically involves (textbook-standard, modest)
export const STAGES = {
  development: {
    name: 'Development', short: 'Dev.',
    summary: 'Before launch the product is designed and tested. There are no sales yet, only costs.',
    objective: 'Develop a product customers want and plan a launch that can pay back the investment.',
    product: 'Concept tests, prototypes and taste or usability tests; fix the design before committing to production.',
    price: 'Test what buyers would pay, estimate costs and work out the break-even volume.',
    place: 'Line up suppliers, production and the first channels that will stock it.',
    promotion: 'Plan the launch message and the budget; build anticipation where that helps.',
  },
  introduction: {
    name: 'Introduction', short: 'Intro.',
    summary: 'The product is new. Few people know it, sales start slowly, and launch costs usually outweigh the margin, so profit is negative or low.',
    objective: 'Build awareness and get people to try the product; win the distribution needed to reach early buyers.',
    product: 'A basic version of the product; fix early problems quickly.',
    price: 'Skimming (a high price for the buyers who value it most) or penetration (a low price to build volume fast), depending on costs, competition and how price-sensitive buyers are.',
    place: 'Selective: enough outlets to reach early buyers, which often means persuading retailers to stock an unproven product.',
    promotion: 'Heavy spending relative to sales: advertising and PR to build awareness, sampling and trial offers, and selling in to the trade.',
  },
  growth: {
    name: 'Growth', short: 'Growth',
    summary: 'Sales climb quickly as more buyers adopt the product and competitors arrive. Profit turns positive and rises as costs are spread over more units.',
    objective: 'Build market share while demand is growing.',
    product: 'Improve quality and add features, flavours or sizes to stay ahead of competitors’ copies.',
    price: 'Often held, or trimmed to win new buyers and meet competitors.',
    place: 'Expand distribution: more outlets and more channels.',
    promotion: 'Shift from building awareness to building preference: why this brand rather than a competitor’s.',
  },
  maturity: {
    name: 'Maturity', short: 'Mat.',
    summary: 'Sales growth slows and levels off because most potential buyers have bought. Usually the longest stage; profit is high, but competitors fight for share.',
    objective: 'Defend market share and earn as much profit as possible; look for ways to extend the stage.',
    product: 'Modify and differentiate: new versions, packaging or uses, or reach new kinds of customer.',
    price: 'Match or beat competitors’ prices while avoiding a price war.',
    place: 'Keep distribution and shelf space, often with trade promotions.',
    promotion: 'Stress what makes the brand different; more sales promotion to win brand switchers; reminder advertising.',
  },
  decline: {
    name: 'Decline', short: 'Decl.',
    summary: 'Sales fall as tastes change, new technology arrives or substitutes win. Profit shrinks and may turn into a loss.',
    objective: 'Cut costs and harvest the remaining profit, or divest (sell or discontinue); occasionally relaunch.',
    product: 'Drop weak versions and keep a core range.',
    price: 'Cut prices to clear stock, or hold them for loyal buyers who still want the product.',
    place: 'Selective again: drop outlets that no longer pay.',
    promotion: 'Cut back to the level that keeps loyal buyers.',
  },
};
const CORE = ['introduction', 'growth', 'maturity', 'decline'];
const TYPICAL = [0.17, 0.42, 0.70]; // introduction|growth, growth|maturity, maturity|decline

const pct = (v) => `${Math.round(v * 100)}%`;
let seq = 0;

export async function mount(el, config = {}, ctx = {}) {
  ensureStyles();
  const report = typeof ctx?.report === 'function' ? ctx.report : () => {};
  const id = `plc${++seq}`;
  const dev = Array.isArray(config.stages) && config.stages.includes('development');
  const stages = dev ? ['development', ...CORE] : [...CORE];
  const t0 = dev ? T0_DEV : 0;
  let b = [...TYPICAL];                                    // movable boundaries
  const bounds = () => (dev ? [t0, 0, ...b, 1] : [0, ...b, 1]); // edges of every stage
  let sel = stages.includes(config.select) ? config.select : 'introduction';
  let GAP = 0.04; // the closest two boundaries may come; widened on narrow charts so the handles never overlap
  let touched = false;

  el.replaceChildren();
  el.classList.add('plc');

  // ------------------------------------------------ stage picker
  const pick = h('div', { class: 'segmented plc-pick', role: 'radiogroup', 'aria-labelledby': `${id}-pick` });
  const radios = stages.map((st) => {
    const input = h('input', { type: 'radio', name: `${id}-stage`, id: `${id}-r-${st}`, value: st });
    input.checked = st === sel;
    input.addEventListener('change', () => { if (input.checked) select(st); });
    pick.append(input, h('label', { for: input.id }, STAGES[st].name));
    return input;
  });

  // ------------------------------------------------ chart, handles
  const wrap = h('div', { class: 'plc-wrap' });
  const chart = h('div', { class: 'chart plc-chart' });
  wrap.append(chart);
  const handles = b.map((_, i) => {
    const left = stages[stages.length - 4 + i], right = stages[stages.length - 3 + i];
    const hd = h('div', { class: 'plc-handle', role: 'slider', tabindex: '0', 'aria-label': `Boundary between ${STAGES[left].name.toLowerCase()} and ${STAGES[right].name.toLowerCase()}`, 'aria-orientation': 'horizontal' }, h('span', { class: 'plc-grip', 'aria-hidden': 'true' }));
    hd.addEventListener('keydown', (e) => {
      const step = e.shiftKey || e.key === 'PageUp' || e.key === 'PageDown' ? 0.05 : 0.01;
      const [lo, hi] = limits(i);
      let v = b[i];
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'PageDown') v -= step;
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'PageUp') v += step;
      else if (e.key === 'Home') v = lo; else if (e.key === 'End') v = hi;
      else return;
      e.preventDefault();
      move(i, v);
    });
    hd.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      hd.setPointerCapture(e.pointerId);
      hd.focus();
      hd.classList.add('is-dragging');
      const onMove = (ev) => move(i, toT(ev.clientX));
      const end = () => { hd.classList.remove('is-dragging'); hd.removeEventListener('pointermove', onMove); hd.removeEventListener('pointerup', end); hd.removeEventListener('pointercancel', end); };
      hd.addEventListener('pointermove', onMove);
      hd.addEventListener('pointerup', end);
      hd.addEventListener('pointercancel', end);
    });
    wrap.append(hd);
    return hd;
  });
  const limits = (i) => [i === 0 ? GAP : b[i - 1] + GAP, i === b.length - 1 ? 1 - GAP : b[i + 1] - GAP];

  // ------------------------------------------------ readouts
  const readout = h('div', { class: 'plc-readout' });
  const live = h('div', { class: 'visually-hidden', 'aria-live': 'polite', 'aria-atomic': 'true' });
  const card = h('div', { class: 'plc-card' });
  const twin = h('div', { class: 'plc-twin' });
  const reset = h('button', { type: 'button', class: 'btn btn-secondary plc-reset', onclick: () => { b = [...TYPICAL]; draw(); say(`Boundaries back at the typical positions: ${b.map(pct).join(', ')}.`); } }, 'Reset the boundaries');

  el.append(
    h('p', { class: 'plc-pick-label', id: `${id}-pick` }, 'Stage'),
    pick,
    wrap,
    h('ul', { class: 'legend', role: 'list' }, h('li', {}, h('i', { class: 'legend-key is-line m-s1' }), 'Sales'), h('li', {}, h('i', { class: 'legend-key is-line m-s2' }), 'Profit'), h('li', {}, h('i', { class: 'legend-key plc-key-typical' }), 'Typical boundary')),
    h('p', { class: 'field-hint plc-hint' }, 'Drag the round handles under the chart, or focus one and use the arrow keys (Shift for bigger steps), to move where one stage ends and the next begins. Select a stage above or click it in the chart.'),
    readout, card,
    h('div', { class: 'plc-actions' }, reset),
    twin,
    h('p', { class: 'mix-caveat plc-caveat' }, h('span', {}, h('strong', {}, 'An idealised curve.'), ' Real products often don’t follow it: some never take off and go straight from introduction to decline, fads rise and fall quickly, maturity can last decades, and some products are revived. Where one stage ends is a judgement, not a rule.')),
    config.note ? h('p', { class: 'mix-note' }, safeHTML(config.note)) : '',
    h('p', { class: 'plc-source' }, 'Stage descriptions follow standard textbook treatments, for example OpenStax, ', h('i', {}, 'Principles of Marketing'), ', sections ', h('a', { href: 'https://openstax.org/books/principles-marketing/pages/9-3-the-product-life-cycle' }, '9.3'), ' and ', h('a', { href: 'https://openstax.org/books/principles-marketing/pages/9-4-marketing-strategies-at-each-stage-of-the-product-life-cycle' }, '9.4'), '.'),
    live,
  );

  let geo = null; // chart geometry for pointer maths
  function toT(clientX) {
    const r = chart.querySelector('svg').getBoundingClientRect();
    const px = (clientX - r.left) * (geo.width / r.width) - geo.m.l;
    return t0 + (px / geo.iw) * (1 - t0);
  }
  const say = debounce((text) => { live.textContent = text; }, 450);
  function move(i, v) {
    const [lo, hi] = limits(i);
    const nv = Math.round(Math.min(hi, Math.max(lo, v)) * 100) / 100;
    if (nv === b[i]) return;
    b[i] = nv;
    draw();
    const left = stages[stages.length - 4 + i], right = stages[stages.length - 3 + i];
    say(`${STAGES[left].name} ends and ${STAGES[right].name.toLowerCase()} begins ${pct(nv)} of the way through the life cycle.`);
    if (!touched) { touched = true; report('interact', { what: 'boundary' }); }
  }
  function select(st) {
    sel = st;
    radios.forEach((r) => { r.checked = r.value === st; });
    draw();
    say(`${STAGES[st].name} selected.`);
    if (!touched) { touched = true; report('interact', { what: 'stage' }); }
  }

  function stageOf(t) { const e = bounds(); for (let i = 0; i < stages.length; i++) if (t < e[i + 1] || i === stages.length - 1) return stages[i]; return stages[stages.length - 1]; }

  function draw() {
    const width = Math.max(280, Math.floor(chart.clientWidth || 640));
    const narrow = width < 460;
    const m = { l: 18, r: 16, t: 40, b: 72 };
    const H = narrow ? 270 : 310;
    const iw = width - m.l - m.r, ih = H - m.t - m.b;
    geo = { width, m, iw };
    GAP = Math.max(0.04, Math.ceil((38 / iw) * (1 - t0) * 100) / 100);
    const x = (t) => ((t - t0) / (1 - t0)) * iw;
    const y = (v) => ih - ((v + 0.38) / 1.46) * ih; // −0.38 … 1.08 in "share of peak sales"
    chart.replaceChildren();
    const svg = s('svg', { width, height: H, viewBox: `0 0 ${width} ${H}`, class: 'chart-svg', role: 'img', 'aria-label': `Idealised product life cycle: sales rise slowly, then quickly, level off and fall; profit starts negative, turns positive during growth, peaks around the start of maturity and shrinks in decline. Stage boundaries at ${b.map(pct).join(', ')} of the life cycle. ${STAGES[sel].name} selected.` });
    const g = s('g', { transform: `translate(${m.l},${m.t})` });
    svg.append(g);
    const e = bounds();
    stages.forEach((st, i) => {
      const xa = x(e[i]), xb = x(e[i + 1]), w = xb - xa;
      const band = s('rect', { x: xa, y: -26, width: w, height: ih + 26, class: `plc-band${i % 2 ? ' is-alt' : ''}${st === sel ? ' is-selected' : ''}` });
      band.addEventListener('click', () => select(st));
      g.append(band);
      const name = w > 92 ? STAGES[st].name : w > 44 ? STAGES[st].short : '';
      if (name) g.append(s('text', { x: xa + w / 2, y: -10, 'text-anchor': 'middle', class: `plc-stage-label${st === sel ? ' is-selected' : ''}` }, name));
    });
    // zero line, curves
    g.append(s('line', { x1: 0, x2: iw, y1: y(0), y2: y(0), class: 'grid zero' }));
    g.append(s('text', { x: iw - 2, y: y(0) - 6, 'text-anchor': 'end', class: 'tick' }, 'zero profit'));
    const pts = grid(t0, 1, 240);
    g.append(s('path', { d: pts.map((t, k) => `${k ? 'L' : 'M'}${x(t).toFixed(1)},${y(sales(t)).toFixed(1)}`).join(''), class: 'curve m-s1' }));
    g.append(s('path', { d: pts.map((t, k) => `${k ? 'L' : 'M'}${x(t).toFixed(1)},${y(profit(t) / PMAX * 0.42).toFixed(1)}`).join(''), class: 'curve m-s2' }));
    // landmarks on the sales curve
    for (const [t, label, anchor, dy] of [[T_FAST, 'fastest growth', 'end', -10], [T_PEAK, 'peak sales', 'middle', 20]]) {
      g.append(s('circle', { cx: x(t), cy: y(sales(t)), r: 4.5, class: 'dot m-s1' }));
      g.append(s('text', { x: x(t) + (anchor === 'end' ? -8 : 0), y: y(sales(t)) + dy, 'text-anchor': anchor, class: 'pt-label is-muted' }, label));
    }
    // axes
    g.append(s('line', { x1: 0, x2: iw, y1: ih, y2: ih, class: 'axis-line' }));
    if (dev) g.append(s('line', { x1: x(0), x2: x(0), y1: -26, y2: ih, class: 'ref-line' }), s('text', { x: x(0) + 4, y: 10, class: 'tick' }, 'launch'));
    TYPICAL.forEach((t) => g.append(s('path', { d: `M${x(t)},-27l-4,-7h8z`, class: 'plc-typical' })));
    b.forEach((t) => g.append(s('line', { x1: x(t), x2: x(t), y1: -26, y2: ih + 8, class: 'plc-boundary' })));
    g.append(s('text', { x: 0, y: ih + 58, class: 'axis-label' }, 'Time since launch →'));
    g.append(s('text', { x: iw, y: ih + 58, 'text-anchor': 'end', class: 'axis-label' }, 'stylised: no units'));
    chart.append(svg);
    handles.forEach((hd, i) => {
      const [lo, hi] = limits(i);
      hd.style.left = `${m.l + x(b[i])}px`;
      hd.style.top = `${m.t + ih + 4}px`;
      hd.setAttribute('aria-valuemin', String(Math.round(lo * 100)));
      hd.setAttribute('aria-valuemax', String(Math.round(hi * 100)));
      hd.setAttribute('aria-valuenow', String(Math.round(b[i] * 100)));
      const left = stages[stages.length - 4 + i], right = stages[stages.length - 3 + i];
      hd.setAttribute('aria-valuetext', `${STAGES[left].name} ends, ${STAGES[right].name.toLowerCase()} begins, ${pct(b[i])} of the way through the life cycle`);
    });
    renderReadout(e);
    renderCard();
    renderTwin();
  }

  function renderReadout(e) {
    const i = stages.indexOf(sel), a = e[i], z = e[i + 1];
    const items = [];
    if (sel === 'development') items.push(['When', 'Before launch'], ['Sales', 'None yet'], ['Profit', 'A loss: development costs with no revenue']);
    else {
      items.push(['When', `${pct(a)} to ${pct(z)} of the way through the life cycle (${pct(z - a)} of it)`]);
      const sa = sales(a), sz = sales(z), peakIn = T_PEAK > a && T_PEAK < z;
      items.push(['Sales', peakIn ? `Rise from ${pct(sa)} to the peak, then ${sz < 0.97 ? `fall to ${pct(sz)}` : 'level off'} (share of peak sales)` : sz >= sa ? `Rise from ${pct(sa)} to ${pct(sz)} of peak sales` : `Fall from ${pct(sa)} to ${pct(sz)} of peak sales`]);
      const ts = grid(a, z, 200), ps = ts.map(profit);
      const lo = Math.min(...ps), hi = Math.max(...ps);
      const cross = (from, to) => { for (let k = 1; k < ts.length; k++) if ((ps[k - 1] < 0) !== (ps[k] < 0)) return ts[k]; return null; };
      let ptxt;
      if (hi < 0) ptxt = 'A loss throughout';
      else if (ps[0] < 0 && ps[ps.length - 1] >= 0) ptxt = `Turns from a loss to a profit about ${pct(cross())} of the way through`;
      else if (lo >= 0) ptxt = `Positive, between ${pct(lo / PMAX)} and ${pct(hi / PMAX)} of peak profit${argmax(profit, 0, 1) > a && argmax(profit, 0, 1) < z ? '; profit peaks here' : ''}`;
      else ptxt = `Falls and turns into a loss about ${pct(cross())} of the way through`;
      items.push(['Profit', ptxt]);
      const area = (u, v) => grid(u, v, 400).reduce((acc, t) => acc + sales(t), 0) * (v - u) / 401;
      items.push(['Share of lifetime sales', pct(area(Math.max(0, a), z) / area(0, 1))]);
    }
    readout.replaceChildren(h('dl', { class: 'plc-facts' }, items.flatMap(([k, v]) => [h('div', {}, h('dt', {}, k), h('dd', {}, v))])));
  }

  function renderCard() {
    const st = STAGES[sel];
    card.replaceChildren(
      h('p', { class: 'plc-kicker' }, `Stage ${stages.indexOf(sel) + 1} of ${stages.length}`),
      h('h4', { class: 'plc-title' }, st.name),
      h('p', {}, st.summary),
      h('p', { class: 'plc-objective' }, h('strong', {}, 'Typical objective: '), st.objective),
      h('dl', { class: 'plc-4p' }, [['Product', st.product], ['Price', st.price], ['Place', st.place], ['Promotion', st.promotion]].map(([k, v]) => h('div', {}, h('dt', {}, k), h('dd', {}, v)))),
    );
  }

  function renderTwin() {
    const wasOpen = twin.querySelector('details')?.open;
    twin.replaceChildren();
    const ts = grid(dev ? -0.15 : 0, 1, dev ? 23 : 20).map((t) => Math.round(t * 100) / 100);
    tableTwin(twin, {
      caption: 'Idealised sales and profit through the life cycle, with your stage boundaries', open: wasOpen,
      columns: [{ label: 'Time since launch' }, { label: 'Stage' }, { label: 'Sales (% of peak)', num: true }, { label: 'Profit (% of peak)', num: true }],
      rows: ts.map((t) => [t < 0 ? 'before launch' : pct(t), STAGES[stageOf(t)].name, pct(sales(t)), pct(profit(t) / PMAX).replace('-', '−')]),
    });
  }

  draw();
  onResize(chart, draw);
  report('ready', { type: 'plc' });
  return { select, setBoundaries: (arr) => { b = arr.slice(0, 3); draw(); }, getBoundaries: () => [...b] };
}
