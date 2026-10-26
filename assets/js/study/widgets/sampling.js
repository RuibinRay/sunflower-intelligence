// sampling.js — the `sampling` lesson widget (B04): draw random samples from a population the lesson supplies and
// watch the sampling distribution of the mean (or of a proportion) build up, against the population and against the
// normal curve the central limit theorem predicts; or ('intervals' mode) draw a confidence interval from each sample and
// count how many contain the population value.
//   { type: 'sampling', title, population: [numbers] (for a proportion, 1 = has the trait, 0 = not), label, units,
//     stat: 'mean' | 'proportion', sizes: [5, 10, 30, 60], n: 30, mode: 'means' | 'intervals', conf: 0.95,
//     replace: true (sample with replacement; false draws without, and the standard error uses the finite population
//     correction), seed: 1, places, note }
import { h, s, onResize } from '../../core/dom.js?v=18';
import { xl } from '../xl.js?v=18';
import { frame, lin, niceTicks, axisX } from '../../core/charts.js?v=18';
import { mulberry32 } from '../../core/rng.js?v=18';
import * as I from '../../core/inference.js?v=18';
import { segmented, fmtX } from '../dist-draw.js?v=18';

export function mount(el, cfg, ctx) {
  const base = `sm-${ctx.id}`;
  const pop = cfg.population.filter(Number.isFinite), N = pop.length;
  const prop = cfg.stat === 'proportion';
  const mu = pop.reduce((a, b) => a + b, 0) / N;
  const sigma = Math.sqrt(pop.reduce((a, b) => a + (b - mu) ** 2, 0) / N);
  const sizes = cfg.sizes || [5, 10, 30, 60];
  const st = { n: cfg.n ?? sizes[Math.min(2, sizes.length - 1)], results: [], rand: mulberry32(cfg.seed ?? 1) };
  const mode = cfg.mode === 'intervals' ? 'intervals' : 'means';
  const conf = cfg.conf ?? 0.95;
  const places = cfg.places ?? (prop ? 3 : 2);
  const fv = (v) => (prop ? `${(v * 100).toFixed(1)}%` : fmtX(v, places));
  const replace = cfg.replace !== false;
  const seFor = (n) => (sigma / Math.sqrt(n)) * (replace || N <= 1 ? 1 : Math.sqrt((N - n) / (N - 1)));
  const draw1 = () => {
    const n = st.n, xs = [];
    if (replace) for (let i = 0; i < n; i++) xs.push(pop[Math.floor(st.rand() * N)]);
    else { const idx = pop.map((_, i) => i); for (let i = 0; i < n; i++) { const j = i + Math.floor(st.rand() * (N - i)); [idx[i], idx[j]] = [idx[j], idx[i]]; xs.push(pop[idx[i]]); } }
    const m = xs.reduce((a, b) => a + b, 0) / n;
    if (mode === 'means') return { m };
    const ci = prop ? I.ciProp(Math.round(m * n), n, conf) : I.ciMean(xs, conf);
    return { m, lo: ci.low, hi: ci.high, hit: ci.low <= mu && mu <= ci.high };
  };
  const take = (k) => { for (let i = 0; i < k; i++) st.results.push(draw1()); render(); ctx.report?.('sampling', { n: st.n, samples: st.results.length }); };
  const btn = (text, k) => { const b = h('button', { type: 'button', class: 'btn btn-secondary btn-sm' }, text); b.addEventListener('click', () => take(k)); return b; };
  const clear = h('button', { type: 'button', class: 'btn btn-ghost btn-sm' }, 'Clear');
  clear.addEventListener('click', () => { st.results = []; render(); });
  const sizeBox = segmented(`${base}-n`, 'Sample size (n)', sizes.map((k) => [String(k), String(k)]), String(st.n), (k) => { st.n = Number(k); st.results = []; render(); });
  const popBox = h('div', { class: 'chart-box sm-pop' });
  const chart = h('div', { class: 'chart-box cv-chart' });
  const out = h('div', { class: 'cv-out', 'aria-live': 'polite' });
  el.classList.add('cv-widget');
  el.append(...[cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null,
    h('p', { class: 'fx-note' }, `Population: ${N.toLocaleString('en-US')} ${cfg.label || 'values'}; ${prop ? `proportion ${fv(mu)}` : `mean ${fv(mu)}${cfg.units ? ` ${cfg.units}` : ''}, standard deviation ${fmtX(sigma, places)}`}. Samples are drawn ${replace ? 'with replacement' : 'without replacement'}.`),
    popBox, sizeBox, h('div', { class: 'sg-tools' }, btn('Draw 1 sample', 1), btn('Draw 100', 100), btn('Draw 1,000', 1000), clear), chart, out,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null].filter(Boolean));

  function popHist() {
    const lo = Math.min(...pop), hi = Math.max(...pop);
    const fr = frame(popBox, { height: 120, label: `Histogram of the population of ${N} ${cfg.label || 'values'}`, margin: { t: 10, r: 14, b: 34, l: 14 } });
    if (prop) {
      const ones = pop.filter((v) => v === 1).length, x = lin(-0.5, 1.5, 0, fr.iw), y = (c) => fr.ih - (c / N) * fr.ih;
      [[0, N - ones], [1, ones]].forEach(([k, c]) => fr.g.append(s('rect', { x: x(k) - 30, y: y(c), width: 60, height: fr.ih - y(c), class: 'sm-pop-bar' })));
      axisX(fr, x, [0, 1], { labels: ['0 (no)', '1 (yes)'] });
      return;
    }
    const B = 30, w = (hi - lo) / B || 1, counts = new Array(B).fill(0);
    for (const v of pop) counts[Math.min(B - 1, Math.floor((v - lo) / w))]++;
    const x = lin(lo, hi, 0, fr.iw), top = Math.max(...counts), y = (c) => fr.ih - (c / top) * fr.ih;
    counts.forEach((c, i) => { if (c) fr.g.append(s('rect', { x: x(lo + i * w) + 0.5, y: y(c), width: Math.max(1, x(lo + (i + 1) * w) - x(lo + i * w) - 1), height: fr.ih - y(c), class: 'sm-pop-bar' })); });
    fr.g.append(s('line', { x1: x(mu), x2: x(mu), y1: 0, y2: fr.ih, class: 'cv-mark cv-mark-null' }));
    axisX(fr, x, niceTicks(lo, hi, 5).ticks.filter((t) => t >= lo && t <= hi), { format: (v) => fmtX(v, places) });
  }

  function render() {
    const n = st.n, se = seFor(n), R = st.results, k = R.length;
    const seMin = seFor(Math.min(...sizes));
    const L = Math.max(prop ? 0 : -Infinity, mu - 4 * seMin), Hh = Math.min(prop ? 1 : Infinity, mu + 4 * seMin);
    if (mode === 'means') {
      const B = 40, w = (Hh - L) / B, counts = new Array(B).fill(0); let outside = 0;
      for (const r of R) { const i = Math.floor((r.m - L) / w); if (i >= 0 && i < B) counts[i]++; else outside++; }
      const fr = frame(chart, { height: 220, label: `Histogram of ${k} sample ${prop ? 'proportions' : 'means'} from samples of ${n}`, margin: { t: 16, r: 14, b: 44, l: 14 } });
      const x = lin(L, Hh, 0, fr.iw);
      const curvePeak = k ? (k * w) / (se * Math.sqrt(2 * Math.PI)) : 1;
      const top = Math.max(1, ...counts, curvePeak * 1.05), y = (c) => fr.ih - (c / top) * fr.ih;
      counts.forEach((c, i) => { if (c) fr.g.append(s('rect', { x: x(L + i * w) + 0.5, y: y(c), width: Math.max(1, x(L + (i + 1) * w) - x(L + i * w) - 1), height: fr.ih - y(c), class: 'cv-bar cv-in' })); });
      if (k >= 20) {
        const pts = []; for (let i = 0; i <= 160; i++) { const v = L + ((Hh - L) * i) / 160; pts.push(`${x(v).toFixed(2)},${y((k * w) * I.normal.pdf(v, mu, se)).toFixed(2)}`); }
        fr.g.append(s('path', { d: `M${pts.join('L')}`, class: 'cv-line cv-ref' }));
      }
      fr.g.append(s('line', { x1: x(mu), x2: x(mu), y1: 0, y2: fr.ih, class: 'cv-mark cv-mark-null' }));
      axisX(fr, x, niceTicks(L, Hh, 6).ticks.filter((t) => t >= L && t <= Hh), { format: (v) => fv(v), label: `Sample ${prop ? 'proportion' : 'mean'}` });
      const ms = R.map((r) => r.m), mm = k ? ms.reduce((a, b) => a + b, 0) / k : NaN, sdm = k > 1 ? Math.sqrt(ms.reduce((a, b) => a + (b - mm) ** 2, 0) / (k - 1)) : NaN;
      out.replaceChildren(
        h('dl', { class: 'stats-row stats-dense' },
          [['Samples', k.toLocaleString('en-US')], ['Last sample', k ? fv(R[k - 1].m) : '—'], [`Mean of the ${prop ? 'proportions' : 'means'}`, k ? fv(mm) : '—'],
            [`SD of the ${prop ? 'proportions' : 'means'}`, k > 1 ? fmtX(sdm, places + 1) : '—'], [replace ? 'σ ÷ √n' : 'σ ÷ √n × FPC', fmtX(se, places + 1)]]
            .map(([a, b]) => h('div', { class: 'stat' }, h('dt', {}, a), h('dd', { class: 'num' }, b)))),
        h('p', { class: 'fx-note' }, k < 20 ? `Draw more samples to see the shape. The vertical line is the population ${prop ? 'proportion' : 'mean'}, ${fv(mu)}.`
          : `The dashed curve is the normal distribution with mean ${fv(mu)} and standard deviation ${fmtX(se, places + 1)}, which the central limit theorem predicts for samples of ${n}.${outside ? ` ${outside} sample ${prop ? 'proportion' : 'mean'}${outside === 1 ? ' falls' : 's fall'} outside the chart.` : ''}`));
    } else {
      const show = R.slice(-50), rows = Math.max(10, show.length);
      const fr = frame(chart, { height: 60 + rows * 6, label: `The last ${show.length} ${Math.round(conf * 100)}% confidence intervals, with the population value ${fv(mu)}`, margin: { t: 12, r: 14, b: 44, l: 14 } });
      const lo = Math.min(L, ...show.map((r) => r.lo)), hi = Math.max(Hh, ...show.map((r) => r.hi));
      const x = lin(lo, hi, 0, fr.iw), y = (i) => 4 + i * ((fr.ih - 8) / Math.max(1, rows - 1));
      show.forEach((r, i) => { fr.g.append(s('line', { x1: x(r.lo), x2: x(r.hi), y1: y(i), y2: y(i), class: r.hit ? 'sm-ci' : 'sm-ci sm-miss' })); fr.g.append(s('circle', { cx: x(r.m), cy: y(i), r: 1.8, class: r.hit ? 'sm-dot' : 'sm-dot sm-miss' })); });
      fr.g.append(s('line', { x1: x(mu), x2: x(mu), y1: 0, y2: fr.ih, class: 'cv-mark cv-mark-null' }));
      axisX(fr, x, niceTicks(lo, hi, 6).ticks.filter((t) => t >= lo && t <= hi), { format: (v) => fv(v), label: `${Math.round(conf * 100)}% interval for the ${prop ? 'proportion' : 'mean'}` });
      const hits = R.filter((r) => r.hit).length, last = R[k - 1];
      out.replaceChildren(
        h('dl', { class: 'stats-row stats-dense' },
          [['Intervals', k.toLocaleString('en-US')], ['Contain the population value', k ? `${hits.toLocaleString('en-US')} (${((hits / k) * 100).toFixed(1)}%)` : '—'],
            ['Last interval', last ? `${fv(last.lo)} to ${fv(last.hi)}` : '—']]
            .map(([a, b]) => h('div', { class: 'stat' }, h('dt', {}, a), h('dd', { class: 'num' }, b)))),
        h('p', { class: 'fx-note' }, `Each line is one sample’s ${Math.round(conf * 100)}% interval (${prop ? 'p̂ ± z × √(p̂(1 − p̂)/n)' : 'x̄ ± t × s/√n'}); dashed lines in the darker colour miss the population value ${fv(mu)}. The last 50 are drawn.`));
    }
  }
  popHist();
  render();
  onResize(el, () => { popHist(); render(); });
}
