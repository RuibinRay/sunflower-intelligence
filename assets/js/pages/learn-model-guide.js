// learn-model-guide.js — Learn › Model guide: which valuation model fits a company, four models taken apart with
// live numbers (DCF, WACC, two-share diversification, least squares), and guided practice with hints and instant
// feedback. Everything is computed by the site's own engines; the example company is fictional unless the visitor
// switches to the project saved in their browser by the Valuation Studio or Company Intelligence.
import { initSite } from '../core/site.js?v=31';
import { $, $$, h, s, store } from '../core/dom.js?v=31';
import * as F from '../core/format.js?v=31';
import * as V from '../core/valuation.js?v=31';
import * as S from '../core/stats.js?v=31';
import { wacc as costOfCapital } from '../core/fin.js?v=31';
import { mulberry32, normalGen } from '../core/rng.js?v=31';
import { verdict } from '../core/ui.js?v=31';
import { formatter } from '../core/valuation-report.js?v=31';
import { EXAMPLE } from '../data/valuation-example.js?v=31';
import { TUTORIALS, LEVELS } from '../data/valuation-tutorials.js?v=31';
import { numInput, selectEl, field, pctSlider, numSlider, segmented, btn, stat, id } from '../valuation/ui.js?v=31';
import { inline, pi } from '../valuation/inline.js?v=31';
import { scrollersFocusable } from '../study/common.js?v=31';

initSite(); scrollersFocusable();
const fin = Number.isFinite, ROOT = '../../';
let level = store.get('si:cv:level', 'beginner');
const redraw = [];
const say = (texts) => texts[level] ?? texts.beginner;

// ---------------------------------------------------------------- level
{
  const ctl = segmented('gd-lv', LEVELS, level, (v) => { level = v; store.set('si:cv:level', v); redraw.forEach((fn) => fn()); });
  $('#gd-level').append(h('span', { class: 'field-label' }, 'Explain at this level'), ctl, h('span', { class: 'field-hint' }, 'Beginner: plain words. Intermediate: the formulas. Advanced: conventions and where they bite. The Valuation Studio remembers the same choice.'));
}

// ================================================================ 1. which model
{
  const box = $('#gd-choose');
  const saved = store.get('si:cv:project', null)?.project;
  let profile = { industry: 'general', maturity: 'mature', profitable: true, fcfPositive: true, paysDividends: false, hasPeers: true, years: 3, segments: false };
  const out = h('ul', { class: 'cv-models' });
  const check = (key, label) => { const cb = h('input', { type: 'checkbox', id: id('gc') }); cb.checked = profile[key]; cb.addEventListener('change', () => { profile[key] = cb.checked; draw(); }); return h('label', { class: 'check', for: cb.id }, cb, ` ${label}`); };
  const side = h('div', { class: 'gd-side' });
  const controls = () => side.replaceChildren(
    field('Industry', selectEl(V.INDUSTRIES, profile.industry, (v) => { profile.industry = v; draw(); })), field('Stage', selectEl(V.MATURITY, profile.maturity, (v) => { profile.maturity = v; draw(); })),
    check('profitable', 'Profitable'), check('fcfPositive', 'Free cash flow is positive'), check('paysDividends', 'Pays dividends'), check('hasPeers', 'Listed peers exist'), check('segments', 'Several different business segments'),
    saved?.history?.length ? btn(`Describe ${saved.meta?.name || 'my saved company'} instead`, () => { profile = V.profileOf(saved); controls(); draw(); }, { cls: 'btn-sm' }) : h('p', { class: 'field-hint' }, 'Import a company in Company Intelligence or the Valuation Studio and this guide can read its profile.'));
  const draw = () => {
    out.replaceChildren(...V.modelGuide(profile).map((g) => {
      const T = TUTORIALS[g.id];
      const more = h('details', {}, h('summary', {}, 'When to use it, and where it goes wrong'), ...(T ? [...(T.steps.when[level] || []), ...(T.steps.mistakes[level] || [])].map((t) => pi(t)) : []));
      return h('li', { class: 'cv-model' }, h('span', { class: `cv-fit is-${g.fit}` }, g.fit), h('div', {}, h('span', { class: 'cv-model-name' }, g.name), h('p', {}, g.why), more, h('div', { class: 'cv-model-actions' }, h('a', { class: 'btn btn-primary btn-sm', href: `${ROOT}finance/company-valuation/` }, 'Try this model'), g.id === 'dcf' ? h('a', { class: 'btn btn-secondary btn-sm', href: '#dcf' }, 'See it step by step') : null)));
    }));
  };
  controls(); draw(); redraw.push(draw);
  box.append(h('div', { class: 'gd-box' }, side, h('div', { class: 'gd-main' }, out, h('p', { class: 'field-hint' }, 'The ranking is a set of rules, not a judgement about any real company: a bank’s debt is its raw material, a start-up’s value sits in a distant exit, a property company is its assets.'))));
}

// ================================================================ 2. DCF, step by step
{
  const box = $('#gd-dcf');
  const saved = store.get('si:cv:project', null)?.project;
  let P = EXAMPLE, A = V.defaultAssumptions(P), step = 1;
  A.discount = { ...A.discount, mode: 'direct', direct: V.costOfCapitalFor(P, A).wacc, ke: V.costOfCapitalFor(P, A).ke };
  const fade = (n, a, b) => Array.from({ length: n }, (_, i) => a + (b - a) * (n > 1 ? i / (n - 1) : 1));
  const chart = h('div'), talk = h('div', { class: 'gd-say' }), stats = h('dl', { class: 'stats-row cv-stats' });
  const stepBtns = h('div', { class: 'gd-steps', role: 'group', 'aria-label': 'Steps of the discounted cash flow' }, ['1 Forecast the cash', '2 Discount it', '3 Add the years after', '4 From company to shares'].map((t, i) => { const b = h('button', { type: 'button', 'aria-pressed': String(i + 1 === step) }, t); b.addEventListener('click', () => { step = i + 1; draw(); }); return b; }));
  const side = h('div', { class: 'gd-side' });
  const controls = () => side.replaceChildren(
    pctSlider({ label: 'Sales growth, first year', value: A.growth[0], min: -10, max: 30, step: 0.5, onInput: (v) => { A.growth = fade(A.horizon, v, A.terminal.growth); draw(); } }),
    pctSlider({ label: 'EBITDA margin', value: A.margin[0], min: 0, max: 50, step: 0.5, onInput: (v) => { A.margin = Array(A.horizon).fill(v); draw(); } }),
    pctSlider({ label: 'Discount rate (WACC)', value: A.discount.direct, min: 4, max: 18, step: 0.1, onInput: (v) => { A.discount.direct = v; draw(); } }),
    pctSlider({ label: 'Growth after the forecast', value: A.terminal.growth, min: 0, max: 5, step: 0.1, onInput: (v) => { const g0 = A.growth[0]; A.terminal.growth = v; A.growth = fade(A.horizon, g0, v); draw(); } }),
    saved?.history?.length && saved !== P ? btn(`Use ${saved.meta?.name || 'my saved company'}`, () => { P = saved; try { A = V.defaultAssumptions(P); const cc = V.costOfCapitalFor(P, A); A.discount = { ...A.discount, mode: 'direct', direct: cc.error ? 0.09 : cc.wacc, ke: cc.error ? 0.11 : cc.ke }; } catch { P = EXAMPLE; } controls(); draw(); }, { cls: 'btn-sm' }) : null,
    P !== EXAMPLE ? btn('Back to the example company', () => { P = EXAMPLE; A = V.defaultAssumptions(P); const cc = V.costOfCapitalFor(P, A); A.discount = { ...A.discount, mode: 'direct', direct: cc.wacc, ke: cc.ke }; controls(); draw(); }, { cls: 'btn-sm' }) : null,
    h('p', { class: 'field-hint' }, P === EXAMPLE ? 'Sunmarsh Foods is fictional.' : `${P.meta?.name || 'Your company'}: figures from the project saved in this browser.`),
    h('a', { class: 'btn btn-primary btn-sm', href: `${ROOT}finance/company-valuation/` }, 'Try this model in the studio'));
  const draw = () => {
    $$('button', stepBtns).forEach((b, i) => b.setAttribute('aria-pressed', String(i + 1 === step)));
    const d = V.dcf(P, A), f = formatter(P);
    if (!d.ok) { chart.replaceChildren(verdict('bad', 'No valuation with these settings.', d.error)); talk.replaceChildren(); stats.replaceChildren(); return; }
    const W = 640, H = 300, base = H - 46, top = 26;
    const cols = [...d.rows.map((x) => ({ label: String(x.year), fc: x.fcff, pv: x.pv, on: 1 })), { label: 'After', fc: d.tv, pv: d.pvTV, on: 3, tv: true }, { label: 'Company', tot: d.ev, on: 3 }, { label: 'Net debt', tot: -(d.debt + d.leases + d.preferred + d.minority - d.cash), on: 4, neg: true }, { label: 'Shares', tot: d.equity, on: 4 }];
    const vmax = step >= 3 ? Math.max(d.ev, d.pvTV, ...d.rows.map((x) => x.fcff)) : Math.max(...d.rows.map((x) => x.fcff), 1);
    const sc = (v) => (Math.max(0, v) / vmax) * (base - top), bw = (W - 40) / cols.length, g = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'gd-svg', role: 'img', 'aria-label': `Discounted cash flow, step ${step}: ${cols.filter((c) => c.on <= step).map((c) => `${c.label} ${F.num(c.tot ?? (step >= 2 ? c.pv : c.fc), 0)}`).join(', ')}` });
    g.append(s('line', { x1: 20, x2: W - 20, y1: base, y2: base, class: 'axis' }));
    cols.forEach((c, i) => {
      const x = 20 + i * bw + bw * 0.16, w = bw * 0.68, off = c.on > step ? ' is-off' : '';
      if (c.tot !== undefined) { const v = Math.abs(c.tot); g.append(s('rect', { x, y: base - sc(v), width: w, height: sc(v), rx: 4, class: `${c.neg ? 'neg' : 'tot'}${off}` }), s('text', { x: x + w / 2, y: base - sc(v) - 6, 'text-anchor': 'middle', class: `strong${off}` }, `${c.neg && c.tot < 0 ? '−' : ''}${F.num(v, 0)}`)); }
      else {
        const shown = step >= 2 ? c.pv : c.fc, tall = c.tv && step >= 3 ? Math.min(c.fc, vmax) : c.fc;
        if (!c.tv || step >= 3) g.append(s('rect', { x, y: base - sc(tall), width: w, height: sc(tall), rx: 4, class: `fc${off}`, opacity: step >= 2 ? 0.4 : 1 }));
        g.append(s('rect', { x, y: base - sc(shown), width: w, height: sc(shown), rx: 4, class: `${c.tv ? 'tv' : 'pv'}${step < 2 || off ? ' is-off' : ''}` }));
        g.append(s('text', { x: x + w / 2, y: base - sc(Math.min(step >= 2 ? Math.max(shown, tall) : c.fc, vmax)) - 6, 'text-anchor': 'middle', class: `strong${off}` }, F.num(shown, 0)));
      }
      g.append(s('text', { x: x + w / 2, y: base + 16, 'text-anchor': 'middle', class: off ? 'is-off' : '' }, c.label));
    });
    g.append(s('text', { x: 20, y: 14 }, `${f.cur} ${f.unitLabel}${step >= 2 ? ' · pale: the cash itself · solid: its value today' : ''}`));
    chart.replaceChildren(g);
    const r0 = d.rows[0], rN = d.rows[d.N - 1];
    const lines = {
      1: { beginner: `<b>Forecast.</b> Sales grow, a share of them becomes profit, tax and investment come out. What is left each year is free cash flow: ${f.money(r0.fcff)} in ${r0.year}, rising to ${f.money(rN.fcff)} in ${rN.year}.`, intermediate: `<b>FCFF = EBIT × (1 − t) + D&A − capex − ΔNWC.</b> In ${r0.year}: ${F.num(r0.ebit, 1)} × (1 − ${F.pct(r0.taxRate, 0)}) + ${F.num(r0.da, 1)} − ${F.num(r0.capex, 1)} − ${F.num(r0.dNwc, 1)} = <b>${F.num(r0.fcff, 1)}</b>. Each driver is a share of revenue, so the forecast scales with growth.`, advanced: `<b>Unlevered cash flow.</b> Interest is left out on purpose: FCFF belongs to lenders and shareholders alike, so financing enters only through the discount rate. Tax is charged on EBIT (no credit for losses here), and working capital is held at ${F.pct(r0.nwc / r0.revenue)} of revenue, so growth costs ${F.num(r0.dNwc, 1)} of cash in year one.` },
      2: { beginner: `<b>Discount.</b> Cash later is worth less than cash now. At ${F.pct(d.r, 1)} a year, ${f.money(rN.fcff)} arriving in ${rN.year} is worth only ${f.money(rN.pv)} today. The solid bars are today’s values; together they come to ${f.money(d.sumPv)}.`, intermediate: `<b>PV = FCFF ÷ (1 + WACC)<sup>t</sup>.</b> Year ${rN.t}: ${F.num(rN.fcff, 1)} × ${F.num(rN.df, 4)} = ${F.num(rN.pv, 1)}. Sum of the ${d.N} present values: <b>${F.num(d.sumPv, 1)}</b>. Raise the WACC slider and every solid bar shrinks.`, advanced: `<b>End-of-year discounting.</b> Cash is assumed to arrive at each year end; the mid-year convention (in the studio) discounts at t − ½ and lifts the value by √(1 + r), ${F.pct(Math.sqrt(1 + d.r) - 1, 1)} here. The rate is the opportunity cost of all capital, estimated, never observed.` },
      3: { beginner: `<b>The years after.</b> The business does not stop in ${rN.year}. Assuming cash keeps growing ${F.pct(A.terminal.growth, 1)} a year for ever, all those later years are worth ${f.money(d.pvTV)} today. That one bar is ${F.pct(d.tvShare, 0)} of the company’s value, which is why this assumption matters most.`, intermediate: `<b>Terminal value = FCFF<sub>N</sub> × (1 + g) ÷ (WACC − g)</b> = ${F.num(rN.fcff, 1)} × ${F.num(1 + A.terminal.growth, 3)} ÷ (${F.pct(d.r, 2)} − ${F.pct(A.terminal.growth, 1)}) = ${F.num(d.tv, 0)}, worth ${F.num(d.pvTV, 0)} today. Enterprise value = ${F.num(d.sumPv, 0)} + ${F.num(d.pvTV, 0)} = <b>${F.num(d.ev, 0)}</b>.`, advanced: `<b>The perpetuity carries ${F.pct(d.tvShare, 0)} of the value</b> and divides by WACC − g = ${F.num((d.r - A.terminal.growth) * 100, 1)} points, so half a point either way moves it a lot. It implies an exit at ${F.num(d.impliedMultiple, 1)}× EBITDA: check that against what peers trade at. Growth above the economy’s for ever is not defensible.` },
      4: { beginner: `<b>From company to shares.</b> The company is worth ${f.money(d.ev)}, but lenders are paid first. Take off the debt, add back the cash, and ${f.money(d.equity)} belongs to shareholders${fin(d.perShare) ? `: ${f.perShare(d.perShare)} for each share` : ''}.`, intermediate: `<b>Equity = EV − debt − other claims + cash</b> = ${F.num(d.ev, 0)} − ${F.num(d.debt, 0)} + ${F.num(d.cash, 0)} = <b>${F.num(d.equity, 0)}</b>${fin(d.perShare) ? `; ÷ ${F.num(d.shares, 1)} shares = <b>${f.perShare(d.perShare)}</b>${fin(d.price) ? ` against a price of ${f.perShare(d.price)}` : ''}` : ''}.`, advanced: `<b>The bridge is where models go quietly wrong:</b> leases, pension deficits, minority interests, preferred stock, options and non-operating assets all belong here. Cash is added in full (as if all of it were surplus), and debt is at book value unless you have market prices.` },
    };
    talk.replaceChildren(inline(say(lines[step])));
    stats.replaceChildren(stat('Company (enterprise) value', f.money(d.ev)), stat('Shareholders’ value', f.money(d.equity)), stat('Per share', fin(d.perShare) ? f.perShare(d.perShare) : '—'), stat('From the years after', F.pct(d.tvShare, 0)));
  };
  controls(); draw(); redraw.push(draw);
  box.append(h('div', { class: 'gd-box' }, side, h('div', { class: 'gd-main' }, stepBtns, chart, talk, stats)));
}

// ================================================================ 3. WACC as a blend
{
  const box = $('#gd-wacc');
  const p = { rf: 0.042, beta: 1.1, erp: 0.05, kd: 0.06, tax: 0.25, dw: 0.3 };
  const blend = h('div', { class: 'gd-blend', role: 'img' }), talk = h('div', { class: 'gd-say' }), stats = h('dl', { class: 'stats-row cv-stats' });
  const draw = () => {
    const w = costOfCapital({ rf: p.rf, beta: p.beta, erp: p.erp, kd: p.kd, tax: p.tax, equity: 1 - p.dw, debt: p.dw });
    if (w.error) { talk.replaceChildren(w.error); return; }
    blend.setAttribute('aria-label', `Capital: ${F.pct(w.we, 0)} equity costing ${F.pct(w.ke, 1)}, ${F.pct(w.wd, 0)} debt costing ${F.pct(w.kdAfter, 1)} after tax`);
    blend.replaceChildren(h('span', { class: 'e', style: { flexBasis: `${w.we * 100}%` } }, `Equity ${F.pct(w.we, 0)} at ${F.pct(w.ke, 1)}`), h('span', { class: 'd', style: { flexBasis: `${w.wd * 100}%` } }, `Debt ${F.pct(w.wd, 0)} at ${F.pct(w.kdAfter, 1)}`));
    const shield = w.wd * p.kd * p.tax;
    talk.replaceChildren(inline(say({
      beginner: `Shareholders want about <b>${F.pct(w.ke, 1)}</b> a year for the risk they take; lenders are paid first, so they accept <b>${F.pct(p.kd, 1)}</b>, and because interest is tax-deductible it really costs the company <b>${F.pct(w.kdAfter, 1)}</b>. Blend the two by how much money each put in and you get <b>${F.pct(w.wacc, 2)}</b>: the return a project must beat to be worth doing.`,
      intermediate: `<b>k<sub>e</sub> = r<sub>f</sub> + β × ERP</b> = ${F.pct(p.rf, 1)} + ${F.num(p.beta, 2)} × ${F.pct(p.erp, 1)} = ${F.pct(w.ke, 2)}. <b>WACC = E/V × k<sub>e</sub> + D/V × k<sub>d</sub> × (1 − t)</b> = ${F.pct(w.we, 0)} × ${F.pct(w.ke, 2)} + ${F.pct(w.wd, 0)} × ${F.pct(p.kd, 1)} × (1 − ${F.pct(p.tax, 0)}) = <b>${F.pct(w.wacc, 2)}</b>. The tax saving on interest lowers it by ${F.num(shield * 100, 2)} points.`,
      advanced: `Weights are <b>market values</b>, not book. Sliding debt up here lowers WACC only because beta and k<sub>d</sub> are held fixed: in reality leverage raises both (β<sub>L</sub> = β<sub>U</sub> × [1 + (1 − t) × D/E]) and the saving is largely eaten, which is the Modigliani–Miller point. Use the rate that matches the cash flow: WACC for cash flow to the firm, k<sub>e</sub> for cash flow to equity.`,
    })));
    stats.replaceChildren(stat('WACC', F.pct(w.wacc, 2)), stat('Cost of equity', F.pct(w.ke, 2)), stat('Cost of debt after tax', F.pct(w.kdAfter, 2)), stat('Saved by the tax shield', `${F.num(shield * 100, 2)} pts`));
  };
  const side = h('div', { class: 'gd-side' },
    pctSlider({ label: 'Risk-free rate', value: p.rf, min: 0, max: 10, step: 0.1, onInput: (v) => { p.rf = v; draw(); } }), numSlider({ label: 'Beta', value: p.beta, min: 0.2, max: 2.5, step: 0.05, digits: 2, onInput: (v) => { p.beta = v; draw(); } }),
    pctSlider({ label: 'Equity risk premium', value: p.erp, min: 2, max: 9, step: 0.1, onInput: (v) => { p.erp = v; draw(); } }), pctSlider({ label: 'Cost of debt before tax', value: p.kd, min: 0, max: 15, step: 0.1, onInput: (v) => { p.kd = v; draw(); } }),
    pctSlider({ label: 'Tax rate', value: p.tax, min: 0, max: 45, step: 1, digits: 0, onInput: (v) => { p.tax = v; draw(); } }), pctSlider({ label: 'Debt as a share of capital', value: p.dw, min: 0, max: 90, step: 1, digits: 0, onInput: (v) => { p.dw = v; draw(); } }),
    h('a', { class: 'btn btn-primary btn-sm', href: `${ROOT}finance/valuation/#cost-of-capital` }, 'Try this model'), h('a', { class: 'btn btn-secondary btn-sm', href: `${ROOT}learn/lessons/wacc/` }, 'Read the lesson'));
  draw(); redraw.push(draw);
  box.append(h('div', { class: 'gd-box' }, side, h('div', { class: 'gd-main' }, blend, talk, stats)));
}

// ================================================================ 4. diversification with two shares
{
  const box = $('#gd-frontier');
  const A = { mu: 0.07, sd: 0.14 }, B = { mu: 0.13, sd: 0.28 }, p = { rho: 0.2, w: 0.4 };
  const chart = h('div'), talk = h('div', { class: 'gd-say' }), stats = h('dl', { class: 'stats-row cv-stats' });
  const mix = (w, rho) => ({ ret: (1 - w) * A.mu + w * B.mu, vol: Math.sqrt(((1 - w) * A.sd) ** 2 + (w * B.sd) ** 2 + 2 * (1 - w) * w * rho * A.sd * B.sd) });
  const draw = () => {
    const W = 640, H = 300, x = (v) => 50 + (v / 0.32) * (W - 70), y = (r) => H - 40 - ((r - 0.05) / 0.1) * (H - 70);
    const g = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'gd-svg', role: 'img', 'aria-label': 'Risk and return of every mix of two shares' });
    [0.06, 0.08, 0.1, 0.12, 0.14].forEach((r) => g.append(s('line', { x1: 50, x2: W - 20, y1: y(r), y2: y(r), class: 'gridl' }), s('text', { x: 44, y: y(r) + 4, 'text-anchor': 'end' }, F.pct(r, 0))));
    [0, 0.08, 0.16, 0.24, 0.32].forEach((v) => g.append(s('text', { x: x(v), y: H - 22, 'text-anchor': 'middle' }, F.pct(v, 0))));
    g.append(s('text', { x: W - 20, y: H - 6, 'text-anchor': 'end' }, 'risk (standard deviation of yearly return)'), s('text', { x: 50, y: 14 }, 'expected return'));
    let d = '', d1 = ''; for (let k = 0; k <= 50; k++) { const m = mix(k / 50, p.rho), m1 = mix(k / 50, 1); d += `${k ? 'L' : 'M'}${x(m.vol).toFixed(1)},${y(m.ret).toFixed(1)}`; d1 += `${k ? 'L' : 'M'}${x(m1.vol).toFixed(1)},${y(m1.ret).toFixed(1)}`; }
    const m = mix(p.w, p.rho), straight = (1 - p.w) * A.sd + p.w * B.sd;
    let wMin = 0, vMin = Infinity; for (let k = 0; k <= 1000; k++) { const t = mix(k / 1000, p.rho); if (t.vol < vMin) { vMin = t.vol; wMin = k / 1000; } }
    g.append(s('path', { d: d1, fill: 'none', stroke: 'var(--axis)', 'stroke-dasharray': '5 4', 'stroke-width': 1.5 }), s('path', { d, fill: 'none', stroke: 'var(--series-1)', 'stroke-width': 2.6 }),
      s('circle', { cx: x(A.sd), cy: y(A.mu), r: 6, fill: 'var(--series-2)' }), s('text', { x: x(A.sd) + 10, y: y(A.mu) + 16, class: 'strong' }, 'Share A'), s('circle', { cx: x(B.sd), cy: y(B.mu), r: 6, fill: 'var(--series-3)' }), s('text', { x: x(B.sd) - 10, y: y(B.mu) - 10, 'text-anchor': 'end', class: 'strong' }, 'Share B'),
      s('line', { x1: x(m.vol), x2: x(straight), y1: y(m.ret), y2: y(m.ret), stroke: 'var(--good-ink)', 'stroke-width': 3 }), s('circle', { cx: x(m.vol), cy: y(m.ret), r: 8, fill: 'var(--midnight)', stroke: 'var(--sun)', 'stroke-width': 3 }));
    chart.replaceChildren(g);
    talk.replaceChildren(inline(say({
      beginner: `With ${F.pct(p.w, 0)} in the riskier share B, the mix is expected to return <b>${F.pct(m.ret, 1)}</b>. If the two always moved together its risk would be ${F.pct(straight, 1)} (the dashed line). Because they do not, it is only <b>${F.pct(m.vol, 1)}</b>: the green bar is risk that vanished at no cost in return.`,
      intermediate: `<b>σ<sub>p</sub>² = w<sub>A</sub>²σ<sub>A</sub>² + w<sub>B</sub>²σ<sub>B</sub>² + 2 w<sub>A</sub> w<sub>B</sub> ρ σ<sub>A</sub> σ<sub>B</sub></b>. Return is the plain weighted average (${F.pct(m.ret, 1)}); risk is less than the weighted average whenever ρ < 1: ${F.pct(m.vol, 1)} against ${F.pct(straight, 1)}. The least-risk mix at this correlation holds ${F.pct(wMin, 0)} of B, with risk ${F.pct(vMin, 1)}.`,
      advanced: `Only the upper branch of the curve, from the minimum-variance mix (${F.pct(wMin, 0)} B) upward, is efficient. With ρ = −1 a riskless mix exists. The curve is only as good as its inputs: expected returns are estimated with large error, and optimisers chase that error. The Stock analysis page solves the long-only frontier exactly for up to twelve assets and tests how stable it is.`,
    })));
    stats.replaceChildren(stat('Expected return of the mix', F.pct(m.ret, 2)), stat('Risk of the mix', F.pct(m.vol, 2)), stat('Risk if they moved together', F.pct(straight, 2)), stat('Risk removed', `${F.num((straight - m.vol) * 100, 2)} pts`));
  };
  const side = h('div', { class: 'gd-side' }, numSlider({ label: 'Correlation between the two', value: p.rho, min: -1, max: 1, step: 0.05, digits: 2, onInput: (v) => { p.rho = v; draw(); } }), pctSlider({ label: 'Share of money in B', value: p.w, min: 0, max: 100, step: 1, digits: 0, onInput: (v) => { p.w = v; draw(); } }),
    h('p', { class: 'field-hint' }, 'Share A: 7% expected return, 14% risk. Share B: 13% and 28%. Invented figures.'), h('a', { class: 'btn btn-primary btn-sm', href: `${ROOT}finance/stocks/#frontier` }, 'Try this model'), h('a', { class: 'btn btn-secondary btn-sm', href: `${ROOT}learn/lessons/stocks/` }, 'Read the lesson'));
  draw(); redraw.push(draw);
  box.append(h('div', { class: 'gd-box' }, side, h('div', { class: 'gd-main' }, chart, talk, stats)));
}

// ================================================================ 5. least squares
{
  const box = $('#gd-regression');
  const p = { n: 30, noise: 6, a: 20, b: 1.0, show: false, seed: 5 };
  let data = [];
  const make = () => { const rand = mulberry32(p.seed), N = normalGen(rand); data = Array.from({ length: p.n }, () => { const x = 2 + rand() * 18; return [x, 12 + 2.2 * x + N(0, p.noise)]; }); };
  const chart = h('div'), talk = h('div', { class: 'gd-say' }), stats = h('dl', { class: 'stats-row cv-stats' });
  const draw = () => {
    const W = 640, H = 320, x = (v) => 44 + (v / 22) * (W - 64), y = (v) => H - 34 - (v / 80) * (H - 54);
    const fit = S.ols([data.map((q) => q[0])], data.map((q) => q[1]));
    const sse = (a, b) => data.reduce((t, q) => t + (q[1] - a - b * q[0]) ** 2, 0), mine = sse(p.a, p.b), best = sse(fit.beta[0], fit.beta[1]);
    const g = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'gd-svg', role: 'img', 'aria-label': `Scatter of ${p.n} points with your line${p.show ? ' and the least-squares line' : ''}` });
    [0, 20, 40, 60, 80].forEach((v) => g.append(s('line', { x1: 44, x2: W - 20, y1: y(v), y2: y(v), class: 'gridl' }), s('text', { x: 38, y: y(v) + 4, 'text-anchor': 'end' }, String(v))));
    data.forEach(([px, py]) => g.append(s('line', { x1: x(px), x2: x(px), y1: y(py), y2: y(Math.max(0, Math.min(80, p.a + p.b * px))), stroke: 'var(--neg)', 'stroke-width': 1, opacity: 0.45 })));
    data.forEach(([px, py]) => g.append(s('circle', { cx: x(px), cy: y(Math.max(0, Math.min(80, py))), r: 4, fill: 'var(--series-1)' })));
    const line = (a, b, col, dash) => s('line', { x1: x(0), x2: x(22), y1: y(a), y2: y(a + b * 22), stroke: col, 'stroke-width': 2.6, 'stroke-dasharray': dash || null });
    g.append(line(p.a, p.b, 'var(--midnight)')); if (p.show) g.append(line(fit.beta[0], fit.beta[1], 'var(--series-2)', '7 5'));
    chart.replaceChildren(g);
    const c = fit.coefs[1];
    talk.replaceChildren(inline(say({
      beginner: `Each red thread is how far your line misses a point. Square the misses and add them: yours total <b>${F.num(mine, 0)}</b>. ${p.show ? `Least squares finds the line with the smallest possible total, <b>${F.num(best, 0)}</b>${mine <= best * 1.02 ? ': you matched it' : `, ${F.pct(mine / best - 1, 0)} lower than yours`}.` : 'Move the sliders to make the total as small as you can, then ask for the least-squares line.'}`,
      intermediate: `Least squares chooses the intercept and slope that minimise Σ(y − a − b·x)². ${p.show ? `Here b = <b>${F.num(fit.beta[1], 3)}</b> and a = ${F.num(fit.beta[0], 2)}, with R² = ${F.num(fit.r2, 3)}. The slope’s standard error is ${F.num(c.se, 3)}, so a 95% interval runs from ${F.num(c.low, 2)} to ${F.num(c.high, 2)} (the data were made with a true slope of 2.2).` : `Your line’s squared error is ${F.num(mine, 0)}; show the fitted line to compare.`}`,
      advanced: `The standard error of the slope is σ ÷ √Σ(x − x̄)², so it falls with √n and with the spread of x, and rises with the noise: try 200 points, then 10. ${p.show ? `t = ${F.num(c.t, 1)}, p ${F.pValue(c.p)}. ` : ''}The interval is only honest if the errors have constant variance and are independent; the Explore page tests that (Breusch–Pagan) and offers HC3 robust errors.`,
    })));
    stats.replaceChildren(stat('Your squared error', F.num(mine, 0)), stat('Least squares', p.show ? F.num(best, 0) : 'hidden'), stat('Fitted slope', p.show ? F.num(fit.beta[1], 3) : 'hidden'), stat('95% interval for the slope', p.show ? `${F.num(c.low, 2)} to ${F.num(c.high, 2)}` : 'hidden'));
  };
  const side = h('div', { class: 'gd-side' }, numSlider({ label: 'Your slope', value: p.b, min: -1, max: 5, step: 0.05, digits: 2, onInput: (v) => { p.b = v; draw(); } }), numSlider({ label: 'Your intercept', value: p.a, min: -10, max: 50, step: 0.5, digits: 1, onInput: (v) => { p.a = v; draw(); } }),
    numSlider({ label: 'Number of points', value: p.n, min: 8, max: 200, step: 2, digits: 0, onInput: (v) => { p.n = v; make(); draw(); } }), numSlider({ label: 'Noise', value: p.noise, min: 0, max: 20, step: 0.5, digits: 1, onInput: (v) => { p.noise = v; make(); draw(); } }),
    btn('Show the least-squares line', (e) => { p.show = !p.show; e.currentTarget.textContent = p.show ? 'Hide the least-squares line' : 'Show the least-squares line'; draw(); }, { kind: 'primary', cls: 'btn-sm' }), btn('New sample', () => { p.seed += 1; make(); draw(); }, { cls: 'btn-sm' }),
    h('a', { class: 'btn btn-secondary btn-sm', href: `${ROOT}analytics/explore/#regress` }, 'Try this model on your data'), h('a', { class: 'btn btn-secondary btn-sm', href: `${ROOT}learn/lessons/regression/` }, 'Read the lesson'));
  make(); draw(); redraw.push(draw);
  box.append(h('div', { class: 'gd-box' }, side, h('div', { class: 'gd-main' }, chart, talk, stats)));
}

// ================================================================ 6. guided practice
{
  const box = $('#gd-practice');
  const tally = store.get('si:guide:tally', { right: 0, tried: 0 });
  const score = h('p', { class: 'gd-score' });
  const showScore = () => { score.textContent = tally.tried ? `${tally.right} of ${tally.tried} answered correctly on this browser.` : 'No answers yet.'; };
  let seed = Math.floor(Math.random() * 1e6);
  const rnd = (rand, lo, hi, stepV = 1) => Math.round((lo + rand() * (hi - lo)) / stepV) * stepV;
  const MAKERS = [
    (r) => { const ebit = rnd(r, 80, 400, 5), t = rnd(r, 20, 30, 1) / 100, da = rnd(r, 10, 80, 5), cx = rnd(r, 20, 120, 5), nwc = rnd(r, -10, 30, 2); return { title: 'Free cash flow to the firm', ask: `EBIT is ${ebit}, the tax rate ${F.pct(t, 0)}, depreciation and amortisation ${da}, capital expenditure ${cx}, and net working capital rose by ${nwc}. What is FCFF?`, answer: ebit * (1 - t) + da - cx - nwc, unit: '', hints: ['FCFF = EBIT × (1 − tax rate) + D&A − capex − increase in working capital.', `Start with EBIT after tax: ${ebit} × ${F.num(1 - t, 2)} = ${F.num(ebit * (1 - t), 1)}.`], work: `${ebit} × (1 − ${F.pct(t, 0)}) + ${da} − ${cx} − ${nwc} = ${F.num(ebit * (1 - t) + da - cx - nwc, 1)}. A rise in working capital uses cash, so it is subtracted.`, learn: 'learn/model-guide/#dcf' }; },
    (r) => { const f = rnd(r, 50, 300, 5), g = rnd(r, 15, 35, 5) / 1000, w = rnd(r, 70, 110, 5) / 1000; return { title: 'Terminal value', ask: `Free cash flow in the last forecast year is ${f}. It then grows ${F.pct(g, 1)} a year for ever, and WACC is ${F.pct(w, 1)}. What is the terminal value at the end of that year?`, answer: (f * (1 + g)) / (w - g), unit: '', hints: ['Terminal value = next year’s cash flow ÷ (WACC − growth).', `Next year’s cash flow is ${f} × ${F.num(1 + g, 3)} = ${F.num(f * (1 + g), 2)}.`], work: `${F.num(f * (1 + g), 2)} ÷ (${F.pct(w, 1)} − ${F.pct(g, 1)}) = ${F.num((f * (1 + g)) / (w - g), 1)}. Using this year’s cash flow instead of next year’s is the usual slip.`, learn: 'learn/finance/f04/perpetuities-and-growth/' }; },
    (r) => { const E = rnd(r, 400, 2000, 50), D = rnd(r, 100, 900, 50), ke = rnd(r, 80, 130, 5) / 1000, kd = rnd(r, 40, 80, 5) / 1000, t = rnd(r, 20, 30, 5) / 100; const w = (E / (E + D)) * ke + (D / (E + D)) * kd * (1 - t); return { title: 'Weighted average cost of capital', ask: `Equity is worth ${E} and debt ${D}. Shareholders require ${F.pct(ke, 1)}, the debt costs ${F.pct(kd, 1)} before tax, and the tax rate is ${F.pct(t, 0)}. What is WACC, in percent?`, answer: w * 100, unit: '%', hints: ['Weight each cost by its share of total value, and multiply the cost of debt by (1 − tax rate).', `Weights: equity ${F.pct(E / (E + D), 1)}, debt ${F.pct(D / (E + D), 1)}. After-tax cost of debt: ${F.pct(kd * (1 - t), 2)}.`], work: `${F.pct(E / (E + D), 1)} × ${F.pct(ke, 1)} + ${F.pct(D / (E + D), 1)} × ${F.pct(kd, 1)} × (1 − ${F.pct(t, 0)}) = ${F.pct(w, 2)}.`, learn: 'learn/lessons/wacc/' }; },
    (r) => { const ev = rnd(r, 800, 5000, 50), d = rnd(r, 100, 900, 25), c = rnd(r, 20, 300, 10), sh = rnd(r, 20, 200, 5); return { title: 'From enterprise value to a share', ask: `A DCF gives an enterprise value of ${ev} million. The company has ${d} million of debt, ${c} million of cash and ${sh} million shares. What is the value per share?`, answer: (ev - d + c) / sh, unit: '', hints: ['Equity value = enterprise value − debt + cash.', `Equity value is ${ev} − ${d} + ${c} = ${ev - d + c} million.`], work: `(${ev} − ${d} + ${c}) ÷ ${sh} = ${F.num((ev - d + c) / sh, 2)} a share. Dividing enterprise value by the share count skips the lenders’ claim.`, learn: 'learn/model-guide/#dcf' }; },
    (r) => { const d0 = rnd(r, 10, 60, 1) / 10, g = rnd(r, 20, 50, 5) / 1000, ke = rnd(r, 75, 120, 5) / 1000; return { title: 'Gordon growth', ask: `A share has just paid a dividend of ${F.num(d0, 2)}. Dividends grow ${F.pct(g, 1)} a year for ever and shareholders require ${F.pct(ke, 1)}. What is the share worth?`, answer: (d0 * (1 + g)) / (ke - g), unit: '', hints: ['Value = next year’s dividend ÷ (required return − growth).', `Next year’s dividend is ${F.num(d0, 2)} × ${F.num(1 + g, 3)} = ${F.num(d0 * (1 + g), 3)}.`], work: `${F.num(d0 * (1 + g), 3)} ÷ (${F.pct(ke, 1)} − ${F.pct(g, 1)}) = ${F.num((d0 * (1 + g)) / (ke - g), 2)}.`, learn: 'learn/finance/f04/perpetuities-and-growth/' }; },
    (r) => { const cases = [['a bank that pays out most of its earnings', { industry: 'bank', paysDividends: true }], ['a pre-profit start-up planning a sale in five years', { maturity: 'startup', industry: 'startup', profitable: false, fcfPositive: false }], ['a property company whose buildings are appraised every year', { industry: 'reit' }], ['a mature manufacturer with steady, positive cash flow and no dividend', { industry: 'general' }]]; const [text, prof] = cases[Math.floor(r() * cases.length)]; const opts = [['dcf', 'Discounted cash flow (FCFF at WACC)'], ['ddm', 'Dividend discount model'], ['asset', 'Asset-based value (net asset value)'], ['vc', 'Venture-capital method']]; const g = V.modelGuide(prof); const best = opts.map(([k]) => k).find((k) => g.find((x) => x.id === k).fit === 'recommended'); return { title: 'Choosing the model', ask: `Which of these is the natural first model for ${text}?`, choices: opts, answer: best, work: `${opts.find((o) => o[0] === best)[1]}: ${g.find((x) => x.id === best).why}`, hints: ['Ask what the value rests on: forecastable cash flows, dividends, assets, or a future exit.'], learn: 'learn/model-guide/#choose' }; },
  ];
  const list = h('div', { class: 'gd-exs' });
  const build = () => {
    list.replaceChildren(...MAKERS.map((mk, k) => {
      const q = mk(mulberry32(seed + k * 97));
      const fb = h('div', { role: 'status', 'aria-live': 'polite' }), hintBox = h('div');
      let hints = 0, done = false, picked = null;
      const input = q.choices ? h('div', { class: 'segmented segmented-stack', role: 'radiogroup' }, q.choices.flatMap(([val, label]) => { const rid = id('ex'); const rb = h('input', { type: 'radio', name: `ex-${k}`, id: rid, value: val }); rb.addEventListener('change', () => { picked = val; }); return [rb, h('label', { for: rid }, label)]; })) : numInput({ value: NaN, placeholder: `answer${q.unit ? ` (${q.unit})` : ''}`, ariaLabel: `Answer to ${q.title}`, onInput: (v) => { picked = v; } });
      const check = btn('Check', () => {
        if (picked === null || (typeof picked === 'number' && !fin(picked))) { fb.replaceChildren(verdict('warn', 'Enter an answer first.', '')); return; }
        const ok = q.choices ? picked === q.answer : Math.abs(picked - q.answer) <= Math.max(0.005 * Math.abs(q.answer), 0.01);
        if (!done) { tally.tried++; if (ok) tally.right++; store.set('si:guide:tally', tally); showScore(); done = true; }
        fb.replaceChildren(verdict(ok ? 'good' : 'bad', ok ? 'Correct.' : q.choices ? 'Not the best first choice.' : `Not quite: the answer is ${F.num(q.answer, 2)}${q.unit}.`, q.work), h('p', {}, h('a', { href: ROOT + q.learn }, 'Learn this calculation')));
      }, { kind: 'primary', cls: 'btn-sm' });
      const hint = btn('Hint', () => { if (hints < q.hints.length) { hintBox.append(h('p', { class: 'field-hint' }, `Hint ${hints + 1}: ${q.hints[hints]}`)); hints++; } if (hints >= q.hints.length) hint.disabled = true; }, { cls: 'btn-sm' });
      return h('div', { class: 'gd-ex' }, h('h3', {}, `${k + 1}. ${q.title}`), h('p', {}, q.ask), h('div', { class: 'gd-answer' }, input, check, hint), hintBox, fb);
    }));
  };
  build(); showScore();
  box.append(list, h('div', { class: 'input-actions' }, btn('New numbers', () => { seed = Math.floor(Math.random() * 1e6); build(); }, { cls: 'btn-sm' }), score), h('p', { class: 'field-hint' }, 'Answers within 0.5% count as correct. The tally lives in this browser only. For full courses with module tests and mastery tracking, see ', h('a', { href: `${ROOT}learn/finance/` }, 'Finance & Accounting'), '.'));
}
