// sampler.js — the `sampler` lesson widget (M04): draw repeated samples from a known list of people by one of several
// designs, with or without non-response and with or without weighting to the list's strata, and see what each design
// does to the estimate: the spread of the estimates (sampling error) and how far their average sits from the truth
// (bias). The list is the lesson's, so the truth is known.
//   { type: 'sampler', title, strata: [codes 0…H−1], strataNames: [...], value: [0/1 per person], valueLabel: 'promoters',
//     propensity: [0–1 per person] (the chance a person completes if invited; needed for non-response and opt-in),
//     cluster: [codes] (needed for 'cluster'), clusterLabel: 'sign-up batches',
//     methods: ['srs', 'stratified', 'cluster', 'optin'], method: 'srs', sizes: [100, 300, 600], n: 300,
//     nonresponse: false (start state of the toggle; omit `propensity` to hide it), weight: false, seed: 1, note }
//   n is the number of completed responses wanted. With non-response on, the design invites n ÷ (the list's average
//   propensity) people and keeps those who respond; 'optin' always keeps whoever chooses to answer an open link.
import { h, s, onResize } from '../../core/dom.js?v=15';
import { xl } from '../xl.js?v=15';
import { frame, lin, niceTicks, axisX } from '../../core/charts.js?v=15';
import { mulberry32 } from '../../core/rng.js?v=15';
import { proportionalAllocation } from '../../core/survey.js?v=15';
import { segmented } from '../dist-draw.js?v=15';

const NAMES = {
  srs: 'Simple random sample', stratified: 'Stratified (proportional)', cluster: 'Cluster sample', optin: 'Open link (opt-in)',
};
const pct = (v, d = 1) => `${(v * 100).toFixed(d)}%`;

export function mount(el, cfg, ctx) {
  const base = `sp-${ctx.id}`;
  const strata = cfg.strata, val = cfg.value, N = val.length, H = Math.max(...strata) + 1;
  const prop = cfg.propensity || null, cl = cfg.cluster || null;
  const names = cfg.strataNames || Array.from({ length: H }, (_, k) => `Stratum ${k + 1}`);
  const byStratum = Array.from({ length: H }, (_, k) => strata.map((_, i) => i).filter((i) => strata[i] === k));
  const sizes = byStratum.map((x) => x.length);
  const truth = val.reduce((a, b) => a + b, 0) / N;
  const avgProp = prop ? prop.reduce((a, b) => a + b, 0) / N : 1;
  const clusters = cl ? [...new Set(cl)].map((c) => cl.map((_, i) => i).filter((i) => cl[i] === c)) : [];
  const methods = (cfg.methods || ['srs', 'stratified']).filter((m) => (m !== 'cluster' || cl) && (m !== 'optin' || prop));
  const nSizes = cfg.sizes || [100, 300, 600];
  const st = { method: methods.includes(cfg.method) ? cfg.method : methods[0], n: cfg.n ?? nSizes[1] ?? nSizes[0], nr: !!(cfg.nonresponse && prop), wt: !!cfg.weight, results: {}, rand: mulberry32(cfg.seed ?? 1) };
  const key = () => `${st.method}|${st.n}|${st.nr && st.method !== 'optin' ? 'nr' : 'full'}|${st.wt ? 'w' : 'u'}`;
  const R = st.rand;

  // draw k distinct indices from a list (partial Fisher–Yates)
  const pick = (list, k) => { const a = list.slice(), out = []; k = Math.min(k, a.length); for (let i = 0; i < k; i++) { const j = i + Math.floor(R() * (a.length - i)); [a[i], a[j]] = [a[j], a[i]]; out.push(a[i]); } return out; };
  const responds = (i) => R() < prop[i];
  function sample() {
    const n = st.n, nr = st.nr && prop;
    let got = [];
    if (st.method === 'srs') {
      const inv = pick(strata.map((_, i) => i), nr ? Math.round(n / avgProp) : n);
      got = nr ? inv.filter(responds) : inv;
    } else if (st.method === 'stratified') {
      const alloc = proportionalAllocation(sizes, nr ? Math.round(n / avgProp) : n);
      for (let k = 0; k < H; k++) { const inv = pick(byStratum[k], alloc[k]); got.push(...(nr ? inv.filter(responds) : inv)); }
    } else if (st.method === 'cluster') {
      const per = N / clusters.length, m = Math.max(1, Math.round((nr ? n / avgProp : n) / per));
      for (const c of pick(clusters.map((_, k) => k), m)) got.push(...(nr ? clusters[c].filter(responds) : clusters[c]));
    } else {
      // opt-in: everyone sees the link; each answers with a chance that rises steeply with how keen they are
      // (propensity squared, scaled), and the first n answers are kept
      const keen = strata.map((_, i) => i).filter((i) => R() < Math.min(1, (prop[i] ** 2) * 2.2));
      got = pick(keen, n);
    }
    if (!got.length) return null;
    if (st.wt) {
      const nh = Array(H).fill(0), xh = Array(H).fill(0);
      for (const i of got) { nh[strata[i]]++; xh[strata[i]] += val[i]; }
      let est = 0, cover = 0;
      for (let k = 0; k < H; k++) if (nh[k]) { est += (sizes[k] / N) * (xh[k] / nh[k]); cover += sizes[k] / N; }
      return { est: est / cover, m: got.length };
    }
    return { est: got.reduce((a, i) => a + val[i], 0) / got.length, m: got.length };
  }
  const take = (k) => { const list = (st.results[key()] ||= []); for (let i = 0; i < k; i++) { const r = sample(); if (r) list.push(r); } render(); ctx.report?.('sampler', { method: st.method, samples: list.length }); };
  const btn = (text, k) => { const b = h('button', { type: 'button', class: 'btn btn-secondary btn-sm' }, text); b.addEventListener('click', () => take(k)); return b; };
  const clear = h('button', { type: 'button', class: 'btn btn-ghost btn-sm' }, 'Clear');
  clear.addEventListener('click', () => { st.results = {}; render(); });
  const methodBox = segmented(`${base}-m`, 'Design', methods.map((m) => [m, NAMES[m]]), st.method, (k) => { st.method = k; render(); });
  const sizeBox = segmented(`${base}-n`, 'Completed responses wanted (n)', nSizes.map((k) => [String(k), k.toLocaleString('en-US')]), String(st.n), (k) => { st.n = Number(k); render(); });
  const toggle = (id, label, on, set) => {
    const inp = h('input', { type: 'checkbox', id, ...(on ? { checked: '' } : {}) });
    inp.addEventListener('change', () => { set(inp.checked); render(); });
    return h('div', { class: 'field sp-check' }, inp, h('label', { for: id }, label));
  };
  const toggles = h('div', { class: 'sp-toggles' }, ...[prop ? toggle(`${base}-nr`, 'Include non-response (only some of those invited reply)', st.nr, (v) => { st.nr = v; }) : null,
    toggle(`${base}-w`, 'Weight the responses to the list’s strata', st.wt, (v) => { st.wt = v; })].filter(Boolean));
  const chart = h('div', { class: 'chart-box cv-chart' });
  const out = h('div', { class: 'cv-out', 'aria-live': 'polite' });
  const table = h('div', { class: 'table-scroll sp-table', tabindex: '0', role: 'region', 'aria-label': 'Designs compared' });
  el.classList.add('cv-widget');
  el.append(...[cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null,
    h('p', { class: 'fx-note' }, `The list: ${N.toLocaleString('en-US')} people in ${H} strata (${names.map((nm, k) => `${nm} ${sizes[k].toLocaleString('en-US')}`).join(', ')}). The true share of ${cfg.valueLabel || 'ones'} is ${pct(truth)}; a real survey never knows it.`),
    methodBox, sizeBox, toggles, h('div', { class: 'sg-tools' }, btn('Draw 1 sample', 1), btn('Draw 100', 100), btn('Draw 1,000', 1000), clear), chart, out, table,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null].filter(Boolean));

  const summary = (list) => {
    const k = list.length, m = k ? list.reduce((a, r) => a + r.est, 0) / k : NaN;
    const sd = k > 1 ? Math.sqrt(list.reduce((a, r) => a + (r.est - m) ** 2, 0) / (k - 1)) : NaN;
    const rmse = k ? Math.sqrt(list.reduce((a, r) => a + (r.est - truth) ** 2, 0) / k) : NaN;
    const resp = k ? list.reduce((a, r) => a + r.m, 0) / k : NaN;
    return { k, m, sd, rmse, bias: m - truth, resp };
  };
  function render() {
    const list = st.results[key()] || [], sm = summary(list);
    const ests = list.map((r) => r.est);
    const L = Math.max(0, Math.min(truth - 0.2, ...ests)), U = Math.min(1, Math.max(truth + 0.2, ...ests)) + 1e-9, B = 40, w = (U - L) / B, counts = Array(B).fill(0);
    for (const r of list) { const i = Math.min(B - 1, Math.floor((r.est - L) / w)); if (i >= 0) counts[i]++; }
    const fr = frame(chart, { height: 210, label: `Histogram of ${sm.k} estimates of the share of ${cfg.valueLabel || 'ones'} from ${NAMES[st.method].toLowerCase()}s`, margin: { t: 16, r: 14, b: 44, l: 14 } });
    const x = lin(L, U, 0, fr.iw), top = Math.max(1, ...counts), y = (c) => fr.ih - (c / top) * fr.ih;
    counts.forEach((c, i) => { if (c) fr.g.append(s('rect', { x: x(L + i * w) + 0.5, y: y(c), width: Math.max(1, x(L + (i + 1) * w) - x(L + i * w) - 1), height: fr.ih - y(c), class: 'cv-bar cv-in' })); });
    fr.g.append(s('line', { x1: x(truth), x2: x(truth), y1: 0, y2: fr.ih, class: 'cv-mark cv-mark-null' }));
    if (sm.k) fr.g.append(s('line', { x1: x(sm.m), x2: x(sm.m), y1: 0, y2: fr.ih, class: 'cv-mark cv-mark-stat' }));
    axisX(fr, x, niceTicks(L, U, 6).ticks.filter((t) => t >= L && t <= U), { format: (v) => pct(v, 0), label: `Estimated share of ${cfg.valueLabel || 'ones'}` });
    const f = (v, d = 1) => (Number.isFinite(v) ? pct(v, d) : '—');
    const pts = (b) => (Math.abs(b * 100) < 0.05 ? '0.0' : `${b >= 0 ? '+' : '−'}${(Math.abs(b) * 100).toFixed(1)}`);
    out.replaceChildren(
      h('dl', { class: 'stats-row stats-dense' },
        [['Samples', sm.k.toLocaleString('en-US')], ['Average responses', Number.isFinite(sm.resp) ? Math.round(sm.resp).toLocaleString('en-US') : '—'], ['Average estimate', f(sm.m)],
          ['Bias (average − truth)', Number.isFinite(sm.bias) ? `${pts(sm.bias)} points` : '—'], ['Spread (SD of the estimates)', Number.isFinite(sm.sd) ? `${(sm.sd * 100).toFixed(1)} points` : '—']]
          .map(([a, b]) => h('div', { class: 'stat' }, h('dt', {}, a), h('dd', { class: 'num' }, b)))),
      h('p', { class: 'fx-note' }, sm.k < 20 ? `Draw more samples. The dashed line is the truth, ${pct(truth)}; the solid line is the average of your estimates.`
        : `${NAMES[st.method]}${st.nr && st.method !== 'optin' ? ', with non-response' : ''}${st.wt ? ', weighted' : ''}: the estimates average ${f(sm.m)} against a truth of ${pct(truth)}, and typically land ${(sm.sd * 100).toFixed(1)} points either side.${st.method === 'cluster' ? ` Each sample takes whole ${cfg.clusterLabel || 'clusters'} at random (${clusters.length} of them, about ${Math.round(N / clusters.length)} people each)${st.nr ? '; with non-response, reaching the same number of replies takes more of them, which spreads the sample and narrows the spread' : ''}.` : ''}`));
    const rows = Object.entries(st.results).filter(([, v]) => v.length >= 20).map(([k, v]) => { const [m, n, nr, wt] = k.split('|'); const q = summary(v); return [NAMES[m], Number(n).toLocaleString('en-US'), nr === 'nr' ? 'yes' : m === 'optin' ? 'self-selected' : 'no', wt === 'w' ? 'yes' : 'no', f(q.m), pts(q.bias), (q.sd * 100).toFixed(1), (q.rmse * 100).toFixed(1)]; });
    table.replaceChildren(rows.length ? h('table', { class: 'data-table' }, h('caption', {}, 'Designs you have tried (20 samples or more); bias, spread and RMSE in percentage points'),
      h('thead', {}, h('tr', {}, ...['Design', 'n', 'Non-response', 'Weighted', 'Average', 'Bias', 'Spread', 'RMSE'].map((t) => h('th', { scope: 'col' }, t)))),
      h('tbody', {}, ...rows.map((r) => h('tr', {}, ...r.map((c, i) => h(i ? 'td' : 'th', i ? { class: 'num' } : { scope: 'row' }, c)))))) : h('p', { class: 'fx-note' }, 'Draw 20 or more samples with a design to add it to the comparison table.'));
  }
  render();
  onResize(el, render);
}
