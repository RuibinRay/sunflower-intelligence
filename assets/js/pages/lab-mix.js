// lab-mix.js — the Marketing Mix Simulator page (learn/labs/mix/): the launch brief's tables, the full simulator,
// saved plans compared side by side, and every assumption the model makes. Saved plans stay in this browser only
// (localStorage 'si:lab-mix').
import { initSite } from '../core/site.js?v=18';
import { $, h, debounce, copyText } from '../core/dom.js?v=18';
import * as F from '../core/format.js?v=18';
import * as X from '../core/mixsim.js?v=18';
import { mountSimulator, mountCompare, fmt, SHORT } from '../study/labs/mix-ui.js?v=18';
import { scrollersFocusable } from '../study/common.js?v=18';

initSite();

const KEY = 'si:lab-mix';
const MAX = 3;
const load = () => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (v && v.v === 1) return { current: v.current && X.validatePlan(v.current).ok ? v.current : null, saved: Array.isArray(v.saved) ? v.saved.filter((p) => p && p.plan && X.validatePlan(p.plan).ok).slice(0, MAX) : [] };
  } catch { /* storage blocked or corrupt: start fresh */ }
  return { current: null, saved: [] };
};
const state = load();
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify({ v: 1, current: state.current, saved: state.saved })); } catch { /* storage unavailable: plans last for this visit */ } };

const table = (caption, head, rows, { align = [], foot } = {}) => h('div', { class: 'table-scroll' }, h('table', { class: 'data-table mix-ref' },
  h('caption', {}, caption),
  h('thead', {}, h('tr', {}, head.map((t, i) => h('th', { scope: 'col', class: align[i] === 'r' ? 'is-num' : '' }, t)))),
  h('tbody', {}, rows.map((r) => h('tr', {}, r.map((v, i) => (i === 0 ? h('th', { scope: 'row' }, v) : h('td', { class: align[i] === 'r' ? 'is-num' : 'is-wrap' }, v)))))),
  foot ? h('tfoot', {}, foot.map((r) => h('tr', { class: 'is-total' }, r.map((v, i) => (i === 0 ? h('th', { scope: 'row' }, v) : h('td', { class: align[i] === 'r' ? 'is-num' : '' }, v)))))) : null));

// ================================================================ 1. the launch: rivals and channels at a glance
$('#mix-rivals').replaceChildren(table('The three competitors (fictional)', ['Brand', 'Position', 'Shelf price', 'Quality (0–10)', 'Awareness', 'Sold in'],
  X.COMPETITORS.map((k) => [k.name, k.position, fmt.price(k.price), F.num(k.quality, 1), fmt.pct(k.awareness, 0), k.in.map((c) => SHORT[c].toLowerCase()).join(', ')]), { align: ['l', 'l', 'r', 'r', 'r', 'l'] }));

// ================================================================ 2. the simulator
const status = $('#mix-status');
const tell = (text) => { status.textContent = ''; requestAnimationFrame(() => { status.textContent = text; }); };
const summary = $('#mix-summary-text');
const showSummary = debounce((plan) => { summary.value = X.describe(plan); }, 250);

let compare = null;
const sim = mountSimulator($('#mix-sim'), {
  plan: state.current || X.defaultPlan(),
  baseline: X.defaultPlan(),
  baselineName: 'the default plan',
  onChange: debounce((plan) => { state.current = plan; persist(); showSummary(plan); updateSave(); }, 200),
});
showSummary(sim.getPlan());

const nameInput = $('#mix-save-name');
const saveBtn = $('#mix-save');
function updateSave() {
  const full = state.saved.length >= MAX;
  saveBtn.disabled = full;
  $('#mix-save-hint').textContent = full ? 'Three plans saved: remove one below to save another.' : `${state.saved.length} of ${MAX} plans saved.`;
}
saveBtn.addEventListener('click', () => {
  const plan = sim.getPlan();
  const r = X.simulate(plan);
  if (!r.ok) { tell(`Not saved: ${r.error}`); return; }
  if (state.saved.length >= MAX) { tell('Three plans are saved already: remove one to save this plan.'); return; }
  const used = new Set(state.saved.map((p) => p.name));
  const letters = ['A', 'B', 'C'];
  const auto = [...letters.slice(state.saved.length), ...letters].map((l) => `Plan ${l}`).find((n) => !used.has(n)) || `Plan ${state.saved.length + 1}`;
  const name = (nameInput.value.trim().slice(0, 40)) || auto;
  state.saved.push({ name, plan, savedAt: Date.now() });
  persist(); compare.update(state.saved); updateSave();
  nameInput.value = '';
  tell(`Saved as “${name}”. ${state.saved.length === 1 ? 'Change the plan and save again to compare.' : `${state.saved.length} plans are compared below.`}`);
});
$('#mix-reset').addEventListener('click', () => { sim.setPlan(X.defaultPlan()); tell('Back to the default plan.'); });
$('#mix-copy').addEventListener('click', async () => {
  const ok = await copyText(X.describe(sim.getPlan()));
  tell(ok ? 'Summary copied: paste it into your written recommendation.' : 'Copying isn’t available here: open “Show the summary text” and copy it from there.');
});

// ================================================================ 3. compare
compare = mountCompare($('#mix-compare'), state.saved, {
  onLoad: (i) => {
    const p = state.saved[i];
    sim.setPlan(p.plan);
    tell(`“${p.name}” is loaded into the simulator.`);
    document.getElementById('plan')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('motion-paused') ? 'auto' : 'smooth', block: 'start' });
    document.getElementById('plan-title')?.focus({ preventScroll: true });
  },
  onRemove: (i) => {
    const [gone] = state.saved.splice(i, 1);
    persist(); compare.update(state.saved); updateSave();
    tell(`“${gone.name}” removed.`);
    ($('#mix-compare').querySelector('button') || saveBtn).focus();
  },
});
updateSave();

// ================================================================ 4. what the model assumes
{
  const fmtCoef = (c) => (/^\$/.test(c.unit) ? fmt.money(c.value) : c.unit === 'share of buyers' || c.unit === 'share of price' || c.unit === 'share of weeks' ? fmt.pct(c.value, 0) : F.num(c.value, 2));
  const groups = [...new Set(X.MODEL.coefficients.map((c) => c.group))];
  $('#mix-coef').replaceChildren(...groups.map((g) => table(`${g} coefficients`, ['Symbol', 'Value', 'Unit', 'What it means'],
    X.MODEL.coefficients.filter((c) => c.group === g).map((c) => [h('span', { class: 'mix-sym' }, c.symbol, c.sub ? h('sub', {}, c.sub) : ''), fmtCoef(c), c.unit || '—', c.about]), { align: ['l', 'r', 'l', 'l'] })));

  const C = X.CATEGORY, perQ = C.cansPerYear / 4;
  $('#mix-market').replaceChildren(
    table(`The category: ${C.name.replace(/^([A-Z])(?=[a-z])/, (m) => m.toLowerCase())}, ${C.region}`, ['Quarter', 'Seasonality', 'Category cans'], C.seasonality.map((sv, i) => [`Q${i + 1}`, F.num(sv, 2), fmt.int(perQ * sv)]), { align: ['l', 'r', 'r'], foot: [['Year', F.num(C.seasonality.reduce((a, b) => a + b, 0), 2), fmt.int(C.cansPerYear)]] }),
    table('Product tiers', ['Tier', 'Liquid', 'Quality (0–10)', 'Cost of goods a can'], X.TIERS.map((t) => [t.name, t.detail, F.num(t.quality, 1), fmt.price(t.cogs)]), { align: ['l', 'l', 'r', 'r'] }),
    table('Ranges', ['Range', 'Flavours', 'SKUs', 'Extra fixed cost a year'], X.RANGES.map((r) => [r.name, r.flavours.join(', '), String(r.skus), fmt.money(r.fixed)]), { align: ['l', 'l', 'r', 'r'] }),
    table('Channels', ['Channel', 'Share of category cans', 'Trade margin', 'Listing fee per SKU a year', 'Fulfilment a can', 'Other fixed cost a year'],
      X.CHANNELS.map((c) => [c.name, fmt.pct(c.volume, 0), fmt.pct(c.margin, 0), fmt.money(c.listing), fmt.price(c.fulfil), fmt.money(c.fixed || 0)]), { align: ['l', 'r', 'r', 'r', 'r', 'r'] }),
    table('Competitors', ['Brand', 'Shelf price', 'Quality (0–10)', 'Awareness', 'Channels'], X.COMPETITORS.map((k) => [k.name, fmt.price(k.price), F.num(k.quality, 1), fmt.pct(k.awareness, 0), k.in.map((c) => SHORT[c].toLowerCase()).join(', ')]), { align: ['l', 'r', 'r', 'r', 'l'] }),
    table('Promotion vehicles', ['Vehicle', 'What it does', 'How the model uses it'], X.PROMOTION.map((v) => [v.name, v.does, {
      digital: 'Adds to the ad stock that builds awareness (fades by half each quarter).',
      sampling: 'Raises Lantern’s appeal at the shelf in retail channels, spread over the retail channels chosen.',
      trade: 'Pays for 20%-off weeks in retail channels, up to 40% of weeks.',
      pr: 'Adds 0.6 of an ad dollar to the awareness stock, but fades more slowly (80% carries over).',
    }[v.id]]), { align: ['l', 'l', 'l'] }),
    table('Lantern before the launch, and the default plan', ['Item', 'Value'], [
      ['Awareness at launch', fmt.pct(X.LANTERN.awareness, 0)],
      ['Launch overhead (team and brand work)', `${fmt.money(X.LANTERN.overhead)} a year`],
      ['Default plan: product', `${X.TIERS.find((t) => t.id === X.DEFAULT_PLAN.tier).name}, ${X.RANGES.find((r) => r.id === X.DEFAULT_PLAN.range).name.toLowerCase()}`],
      ['Default plan: price', fmt.price(X.DEFAULT_PLAN.price)],
      ['Default plan: channels', X.DEFAULT_PLAN.channels.map((c) => SHORT[c].toLowerCase()).join(', ')],
      ['Default plan: promotion', X.PROMOTION.map((v) => `${v.name.replace(/^([A-Z])(?=[a-z])/, (m) => m.toLowerCase())} ${fmt.money(X.DEFAULT_PLAN.promotion[v.id])}`).join('; ')],
    ], { align: ['l', 'l'] }),
  );
  $('#mix-leaves').replaceChildren(...X.MODEL.leavesOut.map((t) => h('li', {}, t)));
  const d = X.simulate(X.defaultPlan()), best = X.bestPrice(X.defaultPlan()), sup = X.elasticity(X.defaultPlan(), 'supermarket');
  $('#mix-calibration').textContent = `With the default plan the model gives Lantern ${fmt.pct(d.year.share)} of category cans in year 1, an own-price elasticity of ${fmt.elast(sup.analytic)} in supermarkets, and a profit-maximising shelf price of ${fmt.price(best.price)} with everything else unchanged. Those are properties of the invented coefficients, chosen to behave like a plausible market; they are not measurements of any real one.`;
}

scrollersFocusable();   // tables and charts that scroll sideways get a tab stop (WCAG 2.1.1)
