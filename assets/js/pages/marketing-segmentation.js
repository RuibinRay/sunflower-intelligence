// marketing-segmentation.js — market segmentation (survey-based) and RFM customer value.
import { initSite, syncRanges } from '../core/site.js?v=16';
import { $, $$, h, s, download, toCSV, onResize, debounce } from '../core/dom.js?v=16';
import * as F from '../core/format.js?v=16';
import * as S from '../core/stats.js?v=16';
import { parseTable, isNumeric } from '../core/csv.js?v=16';
import { barChart, tableTwin, Tooltip, divergingColor } from '../core/charts.js?v=16';
import { customerOrders } from '../core/rng.js?v=16';
import { chips, checkedIn, verdict, splitRows, whenNear, afterPaint } from '../core/ui.js?v=16';
import { dataSource } from '../core/datasource.js?v=16';
import { kmeans, silhouette, standardise } from '../core/classify.js?v=16';
import { shopperSurvey, indexVsAverage, segmentSizes, nameSegments, needsFit, targetScores } from '../core/market.js?v=16';
initSite();

// ================================================================ needs-based segmentation
const sv = { table: null, name: '', example: false, needs: [], spend: '', run: null, strengths: {} };
const svNum = () => sv.table.columns.filter((c) => isNumeric(c));
const svCol = (n) => sv.table.columns.find((c) => c.name === n);
const pretty = (n) => n.replace(/_/g, ' ');
const isRating = (c) => { const v = c.values.filter(Number.isFinite); const u = new Set(v); return v.length && v.every(Number.isInteger) && Math.min(...v) >= 0 && Math.max(...v) <= 10 && u.size >= 3 && u.size <= 11; };
const EXAMPLE_STRENGTHS = { price: -1, quality: 1, advice: 1 };

function svLoad({ table, name }) {
  sv.table = table; sv.name = name; sv.example = name === 'Shopper survey';
  const nums = svNum();
  const spendCol = nums.find((c) => c.type !== 'id' && /spend|revenue|sales|amount|value|basket/i.test(c.name) && !isRating(c));
  sv.spend = spendCol ? spendCol.name : '';
  const ratings = nums.filter((c) => isRating(c) && c.name !== sv.spend).map((c) => c.name);
  sv.needs = (ratings.length >= 2 ? ratings : nums.filter((c) => c.type !== 'id' && c.name !== sv.spend && !/^(age|year|income)/i.test(c.name)).map((c) => c.name)).slice(0, 8);
  sv.strengths = sv.example ? { ...EXAMPLE_STRENGTHS } : {};
  chips($('#sv-needs'), nums.filter((c) => c.type !== 'id').map((c) => c.name), sv.needs, 'svn', () => { sv.needs = checkedIn($('#sv-needs')); renderStrengths(); renderSurvey(); });
  const sel = $('#sv-spend');
  sel.replaceChildren(h('option', { value: '' }, 'None: size by respondents only'), ...nums.filter((c) => c.type !== 'id').map((c) => h('option', { value: c.name }, c.name)));
  sel.value = sv.spend;
  renderStrengths();
  renderSurvey();
}
$('#sv-spend').addEventListener('change', (e) => { sv.spend = e.target.value; renderSurvey(); });
$('#sv-k').addEventListener('input', () => renderSurvey({ reuse: true }));
$('#sv-best').addEventListener('click', () => { if (!sv.run) return; $('#sv-k').value = String(sv.run.best.k); syncRanges($('#needs')); renderSurvey({ reuse: true }); });

let svCache = null, svToken = 0;
const nextTask = () => new Promise((resolve) => setTimeout(resolve, 0));
async function renderSurvey({ reuse = false } = {}) {
  const token = ++svToken;
  const err = $('#sv-error'), body = $('#sv-body');
  err.replaceChildren(); sv.run = null;
  const k = +$('#sv-k').value;
  $('#sv-k-out').textContent = String(k);
  const fail = (title, msg) => { err.append(verdict('bad', title, msg)); body.hidden = true; renderTarget(); };
  if (sv.needs.length < 2) return fail('No segments yet.', 'Choose at least two questions to segment on.');
  const needCols = sv.needs.map((n) => svCol(n).values);
  const spendVals = sv.spend ? svCol(sv.spend).values : null;
  const idx = needCols[0].map((_, i) => i).filter((i) => needCols.every((c) => Number.isFinite(c[i])) && (!spendVals || Number.isFinite(spendVals[i])));
  if (idx.length < 20) return fail('Too few complete answers.', `Segmentation needs at least 20 respondents who answered every chosen question; ${idx.length} did.`);
  const key = `${sv.name}|${sv.needs.join(',')}|${sv.spend}|${sv.table.nRows}`;
  if (!reuse || !svCache || svCache.key !== key) {
    const data = needCols.map((c) => idx.map((i) => c[i]));
    const { rows } = standardise(data);
    const sample = rows.length > 1500 ? splitRows(rows.length, 3).train.slice(0, 1500) : null;
    const silOf = (labels) => (sample ? silhouette(sample.map((i) => rows[i]), sample.map((i) => labels[i])) : silhouette(rows, labels));
    // one k per task, so the page stays responsive while six k-means runs and their silhouettes are computed
    const runs = [];
    for (const kk of [2, 3, 4, 5, 6, 7].filter((x) => x < rows.length / 5)) {
      const km = kmeans(rows, kk); runs.push({ k: kk, km, sil: silOf(km.labels) });
      await nextTask();
      if (token !== svToken) return;
    }
    svCache = { key, data, rows, runs, sample };
  }
  const { data, runs, sample } = svCache;
  const run = runs.find((r) => r.k === k) || runs[runs.length - 1];
  const best = runs.reduce((a, b) => (b.sil > a.sil ? b : a));
  body.hidden = false;
  const kk = run.k, labels = run.km.labels;
  const descNames = svNum().filter((c) => c.type !== 'id' && !sv.needs.includes(c.name)).map((c) => c.name).filter((n) => n !== sv.spend);
  const extra = [...(sv.spend ? [sv.spend] : []), ...descNames].slice(0, 4);
  const extraCols = extra.map((n) => idx.map((i) => svCol(n).values[i]));
  const okExtra = extraCols.map((c) => c.every(Number.isFinite));
  const index = indexVsAverage([...data, ...extraCols.filter((_, j) => okExtra[j])], labels, kk);
  const allNames = [...sv.needs, ...extra.filter((_, j) => okExtra[j])];
  const means = Array.from({ length: kk }, (_, g) => [...data, ...extraCols.filter((_, j) => okExtra[j])].map((c) => S.mean(c.filter((_, i) => labels[i] === g))));
  const names = nameSegments(index, sv.needs.map(pretty));
  const sizes = segmentSizes(labels, kk, sv.spend ? idx.map((i) => spendVals[i]) : null);
  sv.run = { idx, labels, k: kk, names, sizes, centres: run.km.centres, best, sil: run.sil };
  // headline numbers
  $('#sv-stats').replaceChildren(...[
    ['Respondents used', F.int(idx.length), idx.length < sv.table.nRows ? `of ${F.int(sv.table.nRows)}` : ''],
    ['Segments', String(kk), ''],
    ['Silhouette', F.num(run.sil, 2), run.sil >= 0.7 ? 'strong structure' : run.sil >= 0.5 ? 'reasonable structure' : run.sil >= 0.25 ? 'weak structure: check the groups make sense' : 'no real structure'],
    ['Best-separated', `${best.k} segments`, `(${F.num(best.sil, 2)})${sample ? ', on a 1,500-row sample' : ''}`],
  ].map(([t, v, sub]) => h('div', { class: 'stat' }, h('dt', {}, t), h('dd', { class: 'num' }, v, sub ? h('span', { class: 'stat-sub' }, ` ${sub}`) : ''))));
  barChart($('#sv-k-chart'), { categories: runs.map((r) => (r.k === kk ? `${r.k}, chosen` : `${r.k}`)), height: 200, legend: false, valueLabels: true, label: 'Silhouette width for each number of segments',
    series: [{ name: 'Silhouette', values: runs.map((r) => r.sil), cls: 'm-s1' }], format: (v) => F.num(v, 2), yLabel: 'Silhouette' });
  // profile heat table: rows are questions, columns are segments
  // half-strength tints keep the dark numbers readable on every cell (4.5:1 or better)
  const heat = (v) => divergingColor(Math.max(-1, Math.min(1, (v - 100) / 40)) * 0.5);
  const fmtMean = (n, v) => (n === sv.spend ? F.money(v) : F.num(v, 1));
  const table = h('table', { class: 'data-table seg-heat' },
    h('caption', { class: 'visually-hidden' }, 'Index against the average respondent for each segment and question; 100 is average'),
    h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Question'), names.map((nm, g) => h('th', { scope: 'col', class: 'is-num' }, nm, h('span', { class: 'rank-region' }, `${F.pct(sizes[g].share, 0)} of respondents`))), h('th', { scope: 'col', class: 'is-num' }, 'Average'))),
    h('tbody', {}, allNames.map((n, j) => h('tr', { class: j === sv.needs.length ? 'is-divider' : '' },
      h('th', { scope: 'row' }, pretty(n), j >= sv.needs.length ? h('span', { class: 'rank-region' }, 'not used for grouping') : ''),
      index.map((row, g) => { const c = heat(row[j]); return h('td', { class: 'heat', style: { background: c.fill, color: c.ink } }, h('strong', {}, F.int(row[j])), h('span', {}, fmtMean(n, means[g][j]))); }),
      h('td', { class: 'is-num muted' }, fmtMean(n, S.mean((j < data.length ? data[j] : extraCols.filter((_, q) => okExtra[q])[j - data.length])))),
    ))));
  $('#sv-profile').replaceChildren(table);
  // sizes
  const series = [{ name: 'Share of respondents', values: sizes.map((z) => z.share), cls: 'm-s1' }];
  if (sv.spend) series.push({ name: 'Share of spend', values: sizes.map((z) => z.spendShare), cls: 'm-s2' });
  $('#sv-size-title').textContent = sv.spend ? `Each segment’s share of respondents and of ${pretty(sv.spend)}` : 'Each segment’s share of respondents';
  const w = $('#sv-size').clientWidth || 600, ml = Math.min(230, Math.max(120, w * 0.42)), maxCh = Math.floor((ml - 14) / 6.8);
  const short = names.map((n) => (n.length > maxCh ? `${n.slice(0, maxCh - 1).trimEnd()}…` : n));
  barChart($('#sv-size'), { categories: short, horizontal: true, series, format: (v) => F.pct(v, 0), label: 'Share of respondents and of spend by segment', margin: { l: ml } });
  tableTwin($('#sv-size'), { caption: 'Segment sizes', columns: [{ label: 'Segment' }, { label: 'Respondents', num: true }, { label: 'Share', num: true }, ...(sv.spend ? [{ label: 'Share of spend', num: true }, { label: 'Spend per person', num: true }] : [])],
    rows: names.map((nm, g) => [nm, F.int(sizes[g].n), F.pct(sizes[g].share, 0), ...(sv.spend ? [F.pct(sizes[g].spendShare, 0), F.money(sizes[g].perHead)] : [])]) });
  renderTarget();
}
$('#sv-csv').addEventListener('click', () => {
  if (!sv.run) return;
  const idCol = sv.table.columns.find((c) => c.type === 'id');
  download('segments.csv', toCSV([idCol ? idCol.name : 'row', ...sv.needs, 'segment'], sv.run.idx.map((r, i) => [idCol ? idCol.raw[r] : r + 1, ...sv.needs.map((n) => svCol(n).values[r]), sv.run.names[sv.run.labels[i]]])));
});

// ---------------------------------------------------------------- targeting
function renderStrengths() {
  const box = $('#tg-strengths');
  box.replaceChildren(...sv.needs.map((n, j) => {
    const v = sv.strengths[n] || 0;
    const opts = [[-1, 'Weak'], [0, 'Average'], [1, 'Strong']];
    const group = h('div', { class: 'segmented', role: 'radiogroup', 'aria-label': `Your ${pretty(n)}` }, opts.map(([val, lab]) => [
      Object.assign(h('input', { type: 'radio', id: `tg-${j}-${val + 1}`, name: `tg-${j}`, value: String(val) }), { checked: val === v }),
      h('label', { for: `tg-${j}-${val + 1}` }, lab)]).flat());
    $$('input', group).forEach((r) => r.addEventListener('change', () => { sv.strengths[n] = +r.value; renderTarget(); }));
    return h('div', { class: 'strength-row' }, h('span', {}, pretty(n)), group);
  }));
}
['size', 'spend', 'fit'].forEach((k) => $(`#tg-w-${k}`).addEventListener('input', (e) => { $(`#tg-w-${k}-out`).textContent = e.target.value; renderTarget(); }));
function renderTarget() {
  const out = $('#tg-verdict'), box = $('#tg-table');
  out.replaceChildren();
  if (!sv.run) { box.replaceChildren(h('p', { class: 'note' }, 'Segment the survey above first.')); return; }
  const { names, sizes, centres } = sv.run;
  const strengths = sv.needs.map((n) => sv.strengths[n] || 0);
  const fit = needsFit(centres, strengths);
  const w = { size: +$('#tg-w-size').value, spend: sv.spend ? +$('#tg-w-spend').value : 0, fitW: strengths.some((v) => v) ? +$('#tg-w-fit').value : 0 };
  const sc = targetScores({ share: sizes.map((z) => z.share), perHead: sizes.map((z) => z.perHead), fit }, w);
  const order = names.map((_, g) => g).filter((g) => Number.isFinite(sc.total[g])).sort((a, b) => sc.total[b] - sc.total[a]);
  if (!order.length) { out.append(verdict('bad', 'Nothing to score.', 'Give at least one of size, spend or fit a weight above zero.')); box.replaceChildren(); return; }
  const [first, second] = order;
  const why = [];
  if (!sv.spend) why.push('there is no spend column, so spend per person is left out');
  if (!strengths.some((v) => v)) why.push('no strengths or weaknesses are marked, so fit is left out');
  out.append(verdict('good', `Target ${names[first]}.`, `It scores ${F.num(sc.total[first], 0)}${second != null ? `, ahead of ${names[second]} at ${F.num(sc.total[second], 0)}` : ''}.${why.length ? ` Note: ${why.join('; ')}.` : ''}${second != null && sc.total[first] - sc.total[second] < 5 ? ' The two are close: a small change in the weights could swap them.' : ''}`));
  const cell = (v) => (Number.isFinite(v) ? F.num(v, 0) : '—');
  const sub = (t) => h('span', { class: 'rank-region' }, t);
  box.replaceChildren(h('table', { class: 'data-table target-table' },
    h('caption', { class: 'visually-hidden' }, 'Targeting scores by segment'),
    h('thead', {}, h('tr', {}, ['Segment', 'Size', 'Spend', 'Fit', 'Total'].map((c, i) => h('th', { scope: 'col', class: i ? 'is-num' : '' }, c)))),
    h('tbody', {}, order.map((g) => h('tr', { class: g === first ? 'is-pick' : '' },
      h('th', { scope: 'row' }, names[g]),
      h('td', { class: 'is-num' }, cell(sc.sizeS[g]), sub(`${F.pct(sizes[g].share, 0)} of people`)),
      h('td', { class: 'is-num' }, sv.spend ? [cell(sc.spendS[g]), sub(`${F.money(sizes[g].perHead)} each`)] : '—'),
      h('td', { class: 'is-num' }, w.fitW ? [cell(sc.fitS[g]), sub(fit[g] > 0.05 ? 'matches' : fit[g] < -0.05 ? 'clashes' : 'neutral')] : '—'),
      h('td', { class: 'is-num is-total' }, h('span', { class: 'score-cell' }, h('span', { class: 'score-bar', 'aria-hidden': 'true' }, h('i', { style: { width: `${Math.max(1, sc.total[g]).toFixed(1)}%` } })), h('strong', {}, cell(sc.total[g])))))))));
}

const svSource = dataSource($('#sv-ds'), {
  prefix: 'sv',
  examples: [{ key: 'survey', label: 'Shopper survey (fictional)', name: 'Shopper survey', make: shopperSurvey }],
  onLoad: svLoad,
});
afterPaint().then(() => svSource.select('survey'));
onResize($('#sv-size'), debounce(() => renderSurvey({ reuse: true }), 150));

const DAY = 86400000;

// ================================================================ RFM
export const SEGMENTS = [
  { name: 'Champions', act: 'Reward them; ask for reviews and referrals.' },
  { name: 'Loyal', act: 'Upsell and invite them into a loyalty programme.' },
  { name: 'Potential loyalists', act: 'Offer membership or a reason for the next order.' },
  { name: 'New customers', act: 'Welcome them well; make the second order easy.' },
  { name: 'Promising', act: 'Introduce the wider range with a small incentive.' },
  { name: 'Need attention', act: 'Send time-limited offers based on what they bought.' },
  { name: 'About to sleep', act: 'Re-engage with relevant recommendations.' },
  { name: 'At risk', act: 'Write personally; find out what changed.' },
  { name: 'Can’t lose them', act: 'Win them back with your best offer, and talk to them.' },
  { name: 'Hibernating', act: 'Low-cost reminders only.' },
  { name: 'Lost', act: 'Revive with very cheap campaigns, or let go.' },
];
export function segmentOf(r, fm) {
  if (r >= 4 && fm >= 4) return 'Champions';
  if (r === 3 && fm >= 4) return 'Loyal';
  if (r >= 4 && fm === 3) return 'Potential loyalists';
  if (r === 5) return 'New customers';
  if (r === 4) return 'Promising';
  if (r === 3 && fm === 3) return 'Need attention';
  if (r === 3) return 'About to sleep';
  if (fm === 5) return 'Can’t lose them';
  if (fm >= 3) return 'At risk';
  if (r === 2) return 'Hibernating';
  return 'Lost';
}
export function rfm(ids, dates, amounts, asOf) {
  const by = new Map();
  let skipped = 0;
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i], d = dates[i], a = amounts[i];
    if (id == null || id === '' || !Number.isFinite(d) || !Number.isFinite(a)) { skipped++; continue; }
    const c = by.get(id) || { id: String(id), last: -Infinity, n: 0, m: 0 };
    c.last = Math.max(c.last, d); c.n += 1; c.m += a;
    by.set(id, c);
  }
  const cs = [...by.values()];
  cs.forEach((c) => { c.recency = Math.max(0, Math.round((asOf - c.last) / DAY)); });
  const R = S.quintileScores(cs.map((c) => c.recency), false), Fs = S.quintileScores(cs.map((c) => c.n)), M = S.quintileScores(cs.map((c) => c.m));
  cs.forEach((c, i) => { c.R = R[i]; c.F = Fs[i]; c.M = M[i]; c.FM = Math.round((c.F + c.M) / 2); c.score = c.R + c.F + c.M; c.segment = segmentOf(c.R, c.FM); });
  return { customers: cs, skipped };
}

const rs = { table: null, name: '', note: '' };
function guessCols(t) {
  const cols = t.columns;
  const find = (re, ok) => cols.find((c) => re.test(c.name) && ok(c));
  const date = cols.find((c) => c.type === 'date');
  const amt = find(/amount|revenue|sales|total|value|spend|price/i, isNumeric) || [...cols].reverse().find(isNumeric);
  const id = find(/customer|client|user|buyer|account|id/i, (c) => c !== amt && c !== date) || cols.find((c) => c !== amt && c !== date);
  return { id: id?.name, date: date?.name, amt: amt?.name };
}
function setRFMTable(t, name, note) {
  rs.table = t; rs.name = name; rs.note = note;
  $('#rfm-note').textContent = note;
  const g = guessCols(t);
  const all = t.columns.map((c) => c.name);
  const fill = (sel, names, v) => { sel.replaceChildren(...names.map((n) => h('option', { value: n }, n))); if (v) sel.value = v; };
  fill($('#rfm-id'), all, g.id);
  fill($('#rfm-date'), t.columns.filter((c) => c.type === 'date').map((c) => c.name), g.date);
  fill($('#rfm-amt'), t.columns.filter(isNumeric).map((c) => c.name), g.amt);
  const dateCol = t.columns.find((c) => c.name === $('#rfm-date').value);
  const max = dateCol ? Math.max(...dateCol.values.filter(Number.isFinite)) : NaN;
  $('#rfm-asof').value = Number.isFinite(max) ? F.date(max + DAY) : '';
  renderRFM();
}
function loadRFMExample() { const ex = customerOrders(); setRFMTable(parseTable(ex.csv), ex.name, ex.note); }
function readRFM(text) {
  const t = parseTable(text);
  const err = $('#rfm-error');
  if (t.error) { err.textContent = t.error; return; }
  if (!t.columns.some((c) => c.type === 'date')) { err.textContent = 'No date column found. Dates like 2026-03-14 or 3/14/2026 work.'; return; }
  if (!t.columns.some(isNumeric)) { err.textContent = 'No amount column found: one column needs to hold numbers.'; return; }
  err.textContent = '';
  setRFMTable(t, 'your orders', `Your orders: ${F.int(t.nRows)} rows, read in this browser tab.`);
}
$$('input[name="rfmsrc"]').forEach((r) => r.addEventListener('change', () => {
  $('#rfm-own-box').hidden = r.value !== 'own';
  if (r.value === 'example') loadRFMExample(); else $('#rfm-paste').focus();
}));
$('#rfm-read').addEventListener('click', () => readRFM($('#rfm-paste').value));
$('#rfm-file').addEventListener('change', async (e) => { const f = e.target.files[0]; if (f) readRFM(await f.text()); });
['#rfm-id', '#rfm-date', '#rfm-amt', '#rfm-asof'].forEach((id) => $(id).addEventListener('change', renderRFM));

let rfmResult = null, highlight = null;
function renderRFM() {
  const t = rs.table; if (!t) return;
  const col = (n) => t.columns.find((c) => c.name === n);
  const idC = col($('#rfm-id').value), dC = col($('#rfm-date').value), aC = col($('#rfm-amt').value);
  const box = $('#rfm-error-box');
  box.replaceChildren();
  if (!idC || !dC || !aC) { box.append(h('div', { class: 'verdict is-bad' }, h('p', {}, h('strong', {}, 'Choose the columns. '), 'RFM needs a customer, a date and an amount.'))); return; }
  const asOf = Date.parse(`${$('#rfm-asof').value}T00:00:00Z`);
  const lastOrder = Math.max(...dC.values.filter(Number.isFinite));
  const ref = Number.isFinite(asOf) ? asOf : lastOrder + DAY;
  const r = rfm(idC.raw, dC.values, aC.values, ref);
  if (r.customers.length < 10) { box.append(h('div', { class: 'verdict is-bad' }, h('p', {}, h('strong', {}, 'Too few customers. '), 'Quintile scores need at least 10 customers.'))); return; }
  rfmResult = r;
  const cs = r.customers;
  const revenue = cs.reduce((a, c) => a + c.m, 0), orders = cs.reduce((a, c) => a + c.n, 0);
  const champs = cs.filter((c) => c.segment === 'Champions');
  const champRev = champs.reduce((a, c) => a + c.m, 0);
  $('#rfm-stats').replaceChildren(...[
    ['Customers', F.int(cs.length)], ['Orders', F.int(orders)], ['Revenue', F.money(revenue, { compact: revenue >= 1e5 })],
    ['Median days since last order', F.int(S.median(cs.map((c) => c.recency)))], [`Revenue from Champions, who are ${F.pct(champs.length / cs.length, 0)} of customers`, F.pct(champRev / revenue, 0)],
  ].map(([k, v]) => h('div', { class: 'stat' }, h('dt', {}, k), h('dd', { class: 'num' }, v))));
  if (r.skipped) box.append(h('div', { class: 'verdict is-warn' }, h('p', {}, h('strong', {}, `${F.int(r.skipped)} rows skipped `), 'because the customer, date or amount was empty or unreadable.')));
  if (asOf < lastOrder) box.append(h('div', { class: 'verdict is-warn' }, h('p', {}, h('strong', {}, 'Recency date is before the last order. '), 'Orders after it count as zero days ago.')));
  // segment summary
  const segs = SEGMENTS.map((sg) => {
    const g = cs.filter((c) => c.segment === sg.name);
    const rev = g.reduce((a, c) => a + c.m, 0);
    return { ...sg, n: g.length, rev, share: g.length / cs.length, revShare: rev / revenue, rec: g.length ? S.mean(g.map((c) => c.recency)) : NaN, freq: g.length ? S.mean(g.map((c) => c.n)) : NaN, spend: g.length ? S.mean(g.map((c) => c.m)) : NaN };
  }).filter((g) => g.n);
  renderSegTable(segs);
  renderGrid(cs);
  barChart($('#rfm-bars'), {
    categories: segs.map((g) => g.name), horizontal: true, label: 'Share of customers and share of revenue by segment',
    series: [{ name: 'Share of customers', values: segs.map((g) => g.share), cls: 'm-s1' }, { name: 'Share of revenue', values: segs.map((g) => g.revShare), cls: 'm-s2' }],
    format: (v) => F.pct(v, 0), margin: { l: 150 },
  });
  drawSeedhead();
}

function renderSegTable(segs) {
  const tbl = h('table', { class: 'data-table seg-table' },
    h('thead', {}, h('tr', {}, ['Segment', 'Customers', 'Revenue', 'Days since order', 'Orders', 'Spend', 'What to do'].map((c, i) => h('th', { scope: 'col', class: i && i < 6 ? 'is-num' : '' }, c)))),
    h('tbody', {}, segs.map((g) => {
      const btn = h('button', { class: 'seg-btn', type: 'button', 'aria-pressed': String(highlight === g.name) }, g.name);
      btn.addEventListener('click', () => { highlight = highlight === g.name ? null : g.name; $$('.seg-btn').forEach((b) => b.setAttribute('aria-pressed', String(b.textContent === highlight))); drawSeedhead(); });
      return h('tr', {}, h('th', { scope: 'row' }, btn), h('td', { class: 'is-num' }, `${F.int(g.n)} (${F.pct(g.share, 0)})`), h('td', { class: 'is-num' }, F.pct(g.revShare, 0)),
        h('td', { class: 'is-num' }, F.int(g.rec)), h('td', { class: 'is-num' }, F.num(g.freq, 1)), h('td', { class: 'is-num' }, F.money(g.spend)), h('td', { class: 'seg-act' }, g.act));
    })));
  $('#rfm-table').replaceChildren(tbl);
}

function renderGrid(cs) {
  const counts = {}; cs.forEach((c) => { const k = `${c.R}-${c.FM}`; counts[k] = (counts[k] || 0) + 1; });
  const max = Math.max(...Object.values(counts));
  const tbl = h('table', { class: 'data-table rfm-grid' },
    h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Recency ↓ / F+M →'), [1, 2, 3, 4, 5].map((fm) => h('th', { scope: 'col', class: 'is-num' }, String(fm))))),
    h('tbody', {}, [5, 4, 3, 2, 1].map((r) => h('tr', {}, h('th', { scope: 'row' }, String(r)), [1, 2, 3, 4, 5].map((fm) => {
      const n = counts[`${r}-${fm}`] || 0;
      const t = n / max;
      return h('td', { class: 'grid-cell', style: { background: `rgba(201, 146, 22, ${(0.08 + 0.5 * t).toFixed(3)})` } }, h('span', { class: 'grid-seg' }, segmentOf(r, fm)), h('span', { class: 'grid-n num' }, F.int(n)));
    })))));
  $('#rfm-grid').replaceChildren(tbl);
}

// the seed head: Vogel's model, r = c·√i, θ = i·137.508°
const RAMP = [[244, 215, 126], [221, 162, 43], [154, 94, 23], [46, 28, 9]];
function rampColor(t) {
  const x = Math.min(0.999, Math.max(0, t)) * (RAMP.length - 1), i = Math.floor(x), f = x - i;
  const c = RAMP[i].map((v, k) => Math.round(v + (RAMP[i + 1][k] - v) * f));
  return `rgb(${c.join(',')})`;
}
let seedCanvas = null, seedTip = null, seedPts = [];
function drawSeedhead() {
  const box = $('#seedhead');
  if (!rfmResult) return;
  const cs = [...rfmResult.customers].sort((a, b) => b.score - a.score || b.m - a.m);
  const size = Math.min(box.clientWidth || 360, 460);
  if (!seedCanvas) {
    seedCanvas = h('canvas', { role: 'img' });
    box.append(seedCanvas);
    seedTip = new Tooltip(box);
    seedCanvas.addEventListener('pointermove', onSeedMove);
    seedCanvas.addEventListener('pointerleave', () => { seedTip.hide(); hoverSeed = -1; paint(); });
  }
  const dpr = Math.min(2, devicePixelRatio || 1);
  seedCanvas.width = size * dpr; seedCanvas.height = size * dpr;
  seedCanvas.style.width = `${size}px`; seedCanvas.style.height = `${size}px`;
  seedCanvas.setAttribute('aria-label', `Seed head of ${cs.length} customers ordered by RFM score, best at the centre. The segment table below lists every group.`);
  const R = size / 2 - 8, c = R / Math.sqrt(cs.length + 0.5);
  const golden = Math.PI * (3 - Math.sqrt(5));
  seedPts = cs.map((cu, i) => { const rr = c * Math.sqrt(i + 0.5), th = i * golden; return { cu, x: size / 2 + rr * Math.cos(th), y: size / 2 + rr * Math.sin(th) }; });
  seedDot = Math.max(1.4, c * 0.62);
  paint();
}
let hoverSeed = -1, seedDot = 3;
function paint() {
  const ctx = seedCanvas.getContext('2d');
  const dpr = seedCanvas.width / parseFloat(seedCanvas.style.width);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const size = parseFloat(seedCanvas.style.width);
  ctx.clearRect(0, 0, size, size);
  seedPts.forEach((p, i) => {
    ctx.globalAlpha = highlight && p.cu.segment !== highlight ? 0.14 : 1;
    ctx.beginPath(); ctx.arc(p.x, p.y, seedDot, 0, Math.PI * 2);
    ctx.fillStyle = rampColor((p.cu.score - 3) / 12); ctx.fill();
  });
  ctx.globalAlpha = 1;
  if (hoverSeed >= 0) {
    const p = seedPts[hoverSeed];
    ctx.beginPath(); ctx.arc(p.x, p.y, seedDot + 3, 0, Math.PI * 2);
    ctx.lineWidth = 2; ctx.strokeStyle = '#192B49'; ctx.stroke();
  }
}
function onSeedMove(e) {
  const r = seedCanvas.getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  let best = -1, bd = 18 * 18;
  seedPts.forEach((p, i) => { const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = i; } });
  hoverSeed = best; paint();
  if (best < 0) { seedTip.hide(); return; }
  const cu = seedPts[best].cu;
  seedTip.show(seedPts[best].x + (seedCanvas.offsetLeft || 0), seedPts[best].y, `${cu.id} · ${cu.segment}`, [
    { value: `${F.int(cu.recency)} days`, label: `since last order (R ${cu.R})` },
    { value: `${F.int(cu.n)} orders`, label: `(F ${cu.F})` },
    { value: F.money(cu.m, { digits: 2 }), label: `spent (M ${cu.M})` },
  ]);
}
$('#rfm-csv').addEventListener('click', () => {
  if (!rfmResult) return;
  download('rfm-customers.csv', toCSV(['customer', 'recency_days', 'frequency', 'monetary', 'R', 'F', 'M', 'segment'],
    rfmResult.customers.map((c) => [c.id, c.recency, c.n, c.m.toFixed(2), c.R, c.F, c.M, c.segment])));
});


// the RFM section renders when it comes near the viewport
whenNear($('#rfm'), loadRFMExample);
const redraw = debounce(() => { if (!rfmResult) return; drawSeedhead(); renderRFM(); }, 150);
onResize($('#rfm-bars'), redraw);
