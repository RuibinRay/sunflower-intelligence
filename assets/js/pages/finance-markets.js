// finance-markets.js — bonds and options.
import { initSite, syncRanges } from '../core/site.js?v=18';
import { $, $$, h, s, download, toCSV, onResize, debounce } from '../core/dom.js?v=18';
import * as F from '../core/format.js?v=18';
import { barChart, tableTwin, lineChart, scatter } from '../core/charts.js?v=18';
import { verdict } from '../core/ui.js?v=18';
import { bond, blackScholes, impliedVol } from '../core/fin.js?v=18';
initSite();

const ccVal = (id) => parseFloat($(`#${id}`).value);

// ================================================================ bonds
let bdMode = 'yield';
function renderBond() {
  bdMode = $('input[name="bd-mode"]:checked').value;
  $('#bd-yield-box').hidden = bdMode !== 'yield'; $('#bd-price-box').hidden = bdMode !== 'price';
  const spec = { face: ccVal('bd-face'), couponRate: ccVal('bd-coupon') / 100, years: ccVal('bd-years'), freq: +$('input[name="bd-freq"]:checked').value };
  const r = bond({ ...spec, mode: bdMode, ytm: ccVal('bd-ytm') / 100, price: ccVal('bd-price') });
  const err = $('#bd-error'), body = $('#bd-body'); err.replaceChildren();
  if (r.error) { err.append(verdict('bad', 'No answer yet.', r.error)); body.hidden = true; return; }
  body.hidden = false;
  const money = (v) => F.money(v, { digits: 2 });
  if (bdMode === 'yield') { $('#bd-hero').textContent = money(r.price); $('#bd-hero-label').textContent = 'price'; }
  else { $('#bd-hero').textContent = F.pct(r.ytm, 3); $('#bd-hero-label').textContent = 'yield to maturity'; }
  const prem = r.price - spec.face;
  $('#bd-line').textContent = `${bdMode === 'yield' ? `At a ${F.pct(r.ytm, 2)} yield` : `At ${money(r.price)}`}, the bond trades at a ${Math.abs(prem) < 0.005 ? 'price equal to face value (par)' : prem > 0 ? `premium of ${money(prem)}, because its coupon pays more than the market yield` : `discount of ${money(-prem)}, because its coupon pays less than the market yield`}.`;
  $('#bd-cy').textContent = F.pct(r.currentYield, 2);
  $('#bd-mac').textContent = `${F.num(r.macaulay, 2)} yrs`;
  $('#bd-mod').textContent = F.num(r.modified, 2);
  $('#bd-conv').textContent = F.num(r.convexity, 1);
  // price-yield curve and the duration line through today's point
  const ys = Array.from({ length: 41 }, (_, i) => Math.max(0.0005, r.ytm - 0.03 + i * 0.0015));
  const exact = ys.map((y) => bond({ ...spec, mode: 'yield', ytm: y }).price);
  const line = ys.map((y) => r.price * (1 - r.modified * (y - r.ytm)));
  const xs = ys.map((y) => y * 100);
  lineChart($('#bd-chart'), {
    xs, series: [{ name: 'Price', values: exact, cls: 'm-s1' }, { name: 'Duration estimate', values: line, cls: 'm-s2' }], highlightX: r.ytm * 100,
    height: 260, xLabel: 'Yield (%)', xFormat: (v) => `${F.num(v, 2)}%`, yFormat: (v) => F.money(v), label: 'Bond price against yield, with the straight-line duration estimate', endLabels: false,
  });
  const rows = [-0.02, -0.01, -0.005, 0.005, 0.01, 0.02].map((dy) => r.shock(dy));
  $('#bd-shocks').replaceChildren(h('table', { class: 'data-table' },
    h('caption', { class: 'visually-hidden' }, 'Price change for parallel yield moves'),
    h('thead', {}, h('tr', {}, ['Yield move', 'Exact change', 'Duration only', 'Duration + convexity'].map((c, i) => h('th', { scope: 'col', class: i ? 'is-num' : '' }, c)))),
    h('tbody', {}, rows.map((x) => h('tr', {}, h('th', { scope: 'row' }, `${x.dy > 0 ? '+' : '−'}${F.num(Math.abs(x.dy) * 100, 1)} pts`),
      ...[x.exact, x.duration, x.withConvexity].map((v) => h('td', { class: 'is-num' }, `${v >= 0 ? '+' : '−'}${money(Math.abs(v))}`)))))));
}
$('#bd-form').addEventListener('input', renderBond);
$('#bd-form').addEventListener('change', renderBond);
renderBond();


// ================================================================ options
function renderOption() {
  const months = ccVal('op-t');
  $('#op-t-out').textContent = `${months} month${months === 1 ? '' : 's'}`;
  ['op-vol', 'op-r', 'op-q'].forEach((id) => { $(`#${id}-out`).textContent = `${F.num(ccVal(id), id === 'op-vol' ? 0 : 1)}%`; });
  const type = $('input[name="op-type"]:checked').value;
  const spec = { S: ccVal('op-s'), K: ccVal('op-k'), T: months / 12, r: ccVal('op-r') / 100, q: ccVal('op-q') / 100, sigma: ccVal('op-vol') / 100, type };
  const r = blackScholes(spec);
  const err = $('#op-error'), body = $('#op-body'); err.replaceChildren();
  if (r.error) { err.append(verdict('bad', 'No value yet.', r.error)); body.hidden = true; return; }
  body.hidden = false;
  const m2 = (v) => F.money(v, { digits: 2 });
  $('#op-price').textContent = m2(r.price);
  $('#op-price-label').textContent = `${type} value`;
  $('#op-line').textContent = `${m2(r.intrinsic)} of it is intrinsic value (what exercising today would pay) and ${m2(r.timeValue)} is time value.`;
  $('#op-delta').textContent = F.num(r.delta, 3);
  $('#op-gamma').textContent = F.num(r.gamma, 4);
  $('#op-vega').textContent = m2(r.vega / 100);
  $('#op-theta').textContent = `${r.theta < 0 ? '−' : ''}${m2(Math.abs(r.theta) / 365)}`;
  $('#op-rho').textContent = `${r.rho < 0 ? '−' : ''}${m2(Math.abs(r.rho) / 100)}`;
  // implied volatility from a market price
  const ivBox = $('#op-iv'); ivBox.replaceChildren();
  const mkt = ccVal('op-market');
  if (Number.isFinite(mkt) && mkt > 0) {
    const iv = impliedVol(spec, mkt);
    ivBox.append(Number.isFinite(iv)
      ? verdict('good', `Implied volatility ${F.pct(iv, 1)}.`, `A ${type} priced at ${m2(mkt)} means the market expects the share to move about ${F.pct(iv, 0)} a year, against the ${F.pct(spec.sigma, 0)} you entered.`)
      : verdict('warn', 'No volatility fits that price.', `It is below the option’s minimum value or implausibly high. A ${type} here can’t trade below about ${m2(blackScholes({ ...spec, sigma: 1e-4 }).price)}.`));
  }
  // value across share prices, with the payoff at expiry
  const lo = spec.K * 0.5, hi = spec.K * 1.5;
  const xs = Array.from({ length: 61 }, (_, i) => lo + (i * (hi - lo)) / 60);
  const value = xs.map((S) => blackScholes({ ...spec, S }).price);
  const payoff = xs.map((S) => Math.max(0, type === 'call' ? S - spec.K : spec.K - S));
  lineChart($('#op-chart'), {
    xs, series: [{ name: 'Value today', values: value, cls: 'm-s1' }, { name: 'Payoff at expiry', values: payoff, cls: 'm-s2' }], highlightX: spec.S,
    height: 260, xLabel: 'Share price', xFormat: (v) => F.money(v), yFormat: m2, label: `${type} value today and payoff at expiry across share prices`, endLabels: false,
  });
  const list = $('#op-reading'); list.replaceChildren(
    h('li', {}, `Delta ${F.num(r.delta, 2)}: if the share rises $1, the option gains about ${m2(Math.abs(r.delta))}${r.delta < 0 ? ' less (a put loses value as the share rises)' : ''}.`),
    h('li', {}, `Each day that passes costs about ${m2(Math.abs(r.theta) / 365)}, other things equal; a one-point rise in volatility adds about ${m2(r.vega / 100)}.`),
    h('li', { class: 'muted' }, `Risk-neutral chance of finishing in the money: ${F.pct(r.probITM, 0)}.`),
  );
}
$('#op-form').addEventListener('input', renderOption);
$('#op-form').addEventListener('change', renderOption);
renderOption();
