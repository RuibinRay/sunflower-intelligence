// distribution.js — the `distribution` lesson widget: a histogram of one numeric column with a choice of
// transformation and outlier rule, showing the shape, skewness, mean against median, the thresholds and the values flagged.
// config: { dataset, column } or { values: [...], label }, transforms: ['none', 'log', 'log1p', 'sqrt'],
//         rules: ['iqr', 'z', 'mad'], prepare: [cleaning steps applied to the dataset first] (optional)
import { h, s, onResize } from '../../core/dom.js?v=6';
import * as F from '../../core/format.js?v=6';
import * as S from '../../core/stats.js?v=6';
import * as C from '../../core/cleaning.js?v=6';
import { tableTwin } from '../../core/charts.js?v=6';
import { loadDataset, ensureStyles } from '../labs/cleaning-ui.js?v=6';

const TF = {
  none: { label: 'None', name: 'no transformation', f: (x) => x, inv: (y) => y, ok: () => true },
  log: { label: 'log(x)', name: 'the natural log, ln(x)', f: Math.log, inv: Math.exp, ok: (x) => x > 0, why: 'log is undefined for 0 and negative values' },
  log1p: { label: 'log(1 + x)', name: 'ln(1 + x)', f: Math.log1p, inv: Math.expm1, ok: (x) => x > -1, why: 'log(1 + x) is undefined for values of −1 or below' },
  sqrt: { label: '√x', name: 'the square root', f: Math.sqrt, inv: (y) => (y < 0 ? NaN : y * y), ok: (x) => x >= 0, why: 'the square root is undefined for negative values' },
};
const RULES = {
  iqr: { label: '1.5 × IQR', long: 'outside Q1 − 1.5 × IQR and Q3 + 1.5 × IQR (quartiles by linear interpolation)' },
  z: { label: '|z| > 3', long: 'more than 3 sample standard deviations from the mean' },
  mad: { label: 'Modified z > 3.5', long: 'a modified z-score, 0.6745 × (x − median) ÷ MAD, above 3.5 in absolute value (Iglewicz and Hoaglin)' },
};
let n = 0;
const fmt = (v) => (Number.isFinite(v) ? F.auto(v) : '—');

function thresholds(vals, rule) {
  const sd = S.sorted(vals);
  if (rule === 'iqr') {
    const q1 = S.quantileSorted(sd, 0.25), q3 = S.quantileSorted(sd, 0.75), iqr = q3 - q1;
    return { lo: q1 - 1.5 * iqr, hi: q3 + 1.5 * iqr, text: `Q1 ${fmt(q1)}, Q3 ${fmt(q3)}, IQR ${fmt(iqr)}` };
  }
  if (rule === 'z') {
    const m = S.mean(vals), s2 = S.sd(vals);
    if (!(s2 > 0)) return { error: 'Every value is the same, so z-scores can’t be calculated.' };
    return { lo: m - 3 * s2, hi: m + 3 * s2, text: `mean ${fmt(m)}, sample SD ${fmt(s2)}` };
  }
  const med = S.quantileSorted(sd, 0.5);
  const mad = S.quantileSorted(S.sorted(vals.map((v) => Math.abs(v - med))), 0.5);
  if (!(mad > 0)) return { error: 'More than half the values equal the median, so the MAD is 0 and modified z-scores can’t be calculated. Use the IQR rule.' };
  return { lo: med - (3.5 * mad) / 0.6745, hi: med + (3.5 * mad) / 0.6745, text: `median ${fmt(med)}, MAD ${fmt(mad)}` };
}

export async function mount(el, config = {}, ctx = {}) {
  const id = `dist${++n}`;
  ensureStyles();
  el.classList.add('cl-dist');
  el.replaceChildren(h('p', { class: 'cl-loading' }, 'Loading the data…'));
  let items, label;
  try {
    if (Array.isArray(config.values)) {
      items = config.values.map((v, i) => ({ v: typeof v === 'number' ? v : C.readNumber(String(v))?.value, row: i + 1 }));
      label = config.label || 'Value';
    } else {
      let t = await loadDataset(config.dataset);
      if (config.prepare?.length) t = C.run(t, config.prepare).table;
      const j = t.columns.findIndex((c) => c.name === config.column);
      if (j < 0) throw new Error(`There is no column called ${config.column}.`);
      items = t.rows.map((r, i) => ({ v: C.isMissing(r[j]) ? undefined : typeof r[j] === 'number' ? r[j] : C.readNumber(r[j])?.value, row: t.ids?.[i] ?? i + 1, blank: C.isMissing(r[j]) }));
      label = config.label || config.column;
    }
  } catch (e) {
    el.replaceChildren(h('p', { class: 'error-text', role: 'alert' }, `The data couldn’t be loaded: ${e.message}`));
    return null;
  }
  const blanks = items.filter((x) => x.blank).length;
  const unread = items.filter((x) => !x.blank && !Number.isFinite(x.v)).length;
  const data = items.filter((x) => Number.isFinite(x.v));
  const transforms = (Array.isArray(config.transforms) && config.transforms.length ? config.transforms : ['none', 'log', 'log1p', 'sqrt']).filter((t) => TF[t]);
  const rules = (Array.isArray(config.rules) && config.rules.length ? config.rules : ['iqr', 'z', 'mad']).filter((r) => RULES[r]);
  const st = { tf: transforms[0] || 'none', rule: rules[0] || 'iqr' };
  const ctrl = h('div', { class: 'cl-dist-controls' });
  const out = h('div', { class: 'cl-dist-out', 'aria-live': 'polite' });
  const chartBox = h('div', { class: 'cl-hist' });
  const twin = h('div');
  const seg = (name, list, map, key) => {
    const lid = `${id}-${name}-l`;
    if (list.length === 1) return h('p', { class: 'cl-note' }, h('strong', {}, `${name === 'tf' ? 'Transformation' : 'Outlier rule'}: `), map[list[0]].label);
    const box = h('div', { class: 'segmented cl-seg', role: 'radiogroup', 'aria-labelledby': lid });
    list.forEach((k) => {
      const rid = `${id}-${name}-${k}`;
      const inp = h('input', { type: 'radio', name: `${id}-${name}`, id: rid, value: k });
      inp.checked = st[key] === k;
      inp.addEventListener('change', () => { if (inp.checked) { st[key] = k; draw(); ctx.report?.('interact', { [key]: k }); } });
      box.append(inp, h('label', { for: rid }, map[k].label));
    });
    return h('div', { class: 'field' }, h('span', { class: 'field-label', id: lid }, name === 'tf' ? 'Transformation' : 'Outlier rule'), box);
  };
  ctrl.append(seg('tf', transforms, TF, 'tf'), seg('rule', rules, RULES, 'rule'));
  el.replaceChildren(ctrl, h('figure', { class: 'cl-dist-fig' }, h('figcaption', { class: 'figure-title', id: `${id}-cap` }, ''), chartBox, twin), out);

  function draw() {
    const T = TF[st.tf];
    out.replaceChildren(); twin.replaceChildren(); chartBox.replaceChildren();
    const capEl = el.querySelector(`#${id}-cap`);
    const bad = data.filter((x) => !T.ok(x.v));
    if (!data.length) { out.append(h('p', { class: 'error-text', role: 'alert' }, 'There are no numbers to show.')); return; }
    if (bad.length) {
      capEl.textContent = `${label}: ${T.name}`;
      out.append(h('div', { class: 'verdict is-bad cl-verdict', role: 'alert' }, h('p', {}, h('strong', {}, `${T.label} can’t be used here. `), `${T.why}: ${bad.length} value${bad.length === 1 ? ' is' : 's are'} affected (for example ${fmt(bad[0].v)}). Choose another transformation, or deal with those values first.`)));
      return;
    }
    const vals = data.map((x) => T.f(x.v));
    const th = thresholds(vals, st.rule);
    const d = S.describe(vals);
    const raw = S.describe(data.map((x) => x.v));
    capEl.textContent = `${label}${st.tf === 'none' ? '' : `, after ${T.name}`}: ${data.length} values`;
    const flagged = th.error ? [] : data.map((x, i) => ({ ...x, t: vals[i] })).filter((x) => x.t < th.lo || x.t > th.hi).sort((a, b) => b.v - a.v);
    histogram(chartBox, vals, { lo: th.lo, hi: th.hi, mean: d.mean, median: d.median, label: `${label}${st.tf === 'none' ? '' : ` (${T.label})`}`, flagged: new Set(flagged.map((x) => x.t)) });
    const hist = S.histogram(vals);
    tableTwin(twin, { caption: `Histogram of ${label}`, columns: [{ label: 'Bin' }, { label: 'Count', num: true }, { label: 'Flagged', num: true }], rows: hist.bins.map((b, i) => [`${fmt(b.x0)} to ${fmt(b.x1)}`, F.int(b.count), F.int(flagged.filter((x) => x.t >= b.x0 && (x.t < b.x1 || (i === hist.bins.length - 1 && x.t <= b.x1))).length)]) });
    const orig = (v) => (st.tf === 'none' ? '' : ` (${fmt(T.inv(v))} in the original units)`);
    const skewWord = (g) => (!Number.isFinite(g) ? '' : Math.abs(g) < 0.5 ? 'roughly symmetric' : Math.abs(g) <= 1 ? `moderately ${g > 0 ? 'right' : 'left'}-skewed` : `strongly ${g > 0 ? 'right' : 'left'}-skewed`);
    out.append(
      h('dl', { class: 'stats-row stats-dense cl-dist-stats' },
        [['Values', F.int(d.n)], ['Mean', fmt(d.mean)], ['Median', fmt(d.median)], ['Mean − median', fmt(d.mean - d.median)], ['SD (sample)', fmt(d.sd)], ['Skewness', F.num(d.skewness, 2)], ['Flagged', th.error ? '—' : F.int(flagged.length)]]
          .map(([k, v]) => h('div', { class: 'stat' }, h('dt', {}, k), h('dd', { class: 'num' }, v)))),
      h('p', { class: 'cl-note' }, `Shape: ${skewWord(d.skewness)} (skewness ${F.num(d.skewness, 2)}${st.tf === 'none' ? '' : `; ${F.num(raw.skewness, 2)} before the transformation`}). ${d.mean > d.median ? 'The mean sits above the median: a long right tail pulls it up.' : d.mean < d.median ? 'The mean sits below the median: a long left tail pulls it down.' : 'The mean equals the median.'}`),
      th.error ? h('div', { class: 'verdict is-warn cl-verdict', role: 'status' }, h('p', {}, h('strong', {}, 'Rule unavailable. '), th.error))
        : h('p', { class: 'cl-note' }, h('strong', {}, `${RULES[st.rule].label}: `), `flags values ${RULES[st.rule].long}. Here ${th.text}, so the thresholds are ${fmt(th.lo)}${orig(th.lo)} and ${fmt(th.hi)}${orig(th.hi)}.`),
      th.error ? '' : h('div', { class: 'cl-flagged' }, h('p', { class: 'cl-kicker' }, `Flagged values (${flagged.length})`),
        flagged.length ? h('ul', { class: 'cl-flaglist', role: 'list' }, flagged.slice(0, 40).map((x) => h('li', {}, h('strong', {}, fmt(x.v)), config.values ? '' : h('span', { class: 'muted' }, ` row ${x.row}`)))) : h('p', { class: 'cl-note' }, 'No value crosses the thresholds.'),
        flagged.length > 40 ? h('p', { class: 'cl-note' }, `and ${flagged.length - 40} more`) : ''),
      h('p', { class: 'cl-note cl-formula' }, 'Skewness is the adjusted Fisher–Pearson coefficient G₁ = √(n(n − 1)) ÷ (n − 2) × m₃ ÷ m₂^(3/2), where m₂ and m₃ are the second and third central moments with n in the denominator (as Excel’s SKEW and pandas). The SD is the sample SD (n − 1). A flag is a prompt to check a value, not proof it is wrong.'),
      blanks || unread ? h('p', { class: 'cl-note' }, `${blanks ? `${blanks} blank value${blanks === 1 ? ' is' : 's are'} left out. ` : ''}${unread ? `${unread} value${unread === 1 ? '' : 's'} couldn’t be read as numbers and ${unread === 1 ? 'is' : 'are'} left out.` : ''}`) : '');
  }

  function histogram(box, vals, o) {
    const hist = S.histogram(vals);
    const bins = hist.bins;
    const W = Math.max(280, Math.floor(box.clientWidth || el.clientWidth || 600)), H = 230;
    const m = { t: 34, r: 14, b: 44, l: 44 };
    const markList = [[o.mean, 'mean', 'cl-m-mean'], [o.median, 'median', 'cl-m-median'], [o.lo, 'lower threshold', 'cl-m-fence'], [o.hi, 'upper threshold', 'cl-m-fence']].filter(([v]) => Number.isFinite(v));
    let lo = bins[0].x0, hi = bins[bins.length - 1].x1;
    const span = hi - lo;
    const offChart = [];
    for (const f of [o.lo, o.hi]) {
      if (!Number.isFinite(f)) continue;
      if (f < lo && f > lo - 0.35 * span) lo = f; else if (f > hi && f < hi + 0.35 * span) hi = f; else if (f < lo || f > hi) offChart.push(f);
    }
    // labels go in as many rows as they need so they never overlap
    const iw = W - m.l - m.r;
    const px0 = (v) => m.l + ((v - lo) / (hi - lo || 1)) * iw;
    const marks = markList.filter(([v]) => v >= lo && v <= hi).sort((a, b) => a[0] - b[0]);
    const ends = [];
    const placed = marks.map(([v, name, cls]) => {
      const wLab = name.length * 6.2 + 10, cx = px0(v);
      const left = Math.min(W - m.r - wLab, Math.max(m.l - 6, cx - wLab / 2));
      let row = ends.findIndex((e) => left > e);
      if (row < 0) { row = ends.length; ends.push(0); }
      ends[row] = left + wLab;
      return { v, name, cls, row, left, wLab };
    });
    m.t = 14 + Math.max(1, ends.length) * 13;
    const ih = H + (ends.length - 1) * 13 - m.t - m.b;
    const x = px0;
    const maxC = Math.max(...bins.map((b) => b.count));
    const y = (c) => m.t + ih - (c / maxC) * ih;
    const pid = `${id}-hatch`;
    const HH = H + (ends.length - 1) * 13;
    const svg = s('svg', { viewBox: `0 0 ${W} ${HH}`, width: W, height: HH, class: 'chart-svg cl-hist-svg', role: 'img', 'aria-label': `Histogram of ${o.label}. ${bins.length} bins from ${fmt(bins[0].x0)} to ${fmt(bins[bins.length - 1].x1)}; tallest bin ${maxC} values. Thresholds at ${fmt(o.lo)} and ${fmt(o.hi)}. The table below lists every bin.` });
    svg.append(s('defs', {}, s('pattern', { id: pid, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, s('rect', { width: 6, height: 6, class: 'cl-hatch-bg' }), s('line', { x1: 0, y1: 0, x2: 0, y2: 6, class: 'cl-hatch-line' }))));
    const g = s('g');
    [0, 0.5, 1].forEach((f) => { const c = Math.round(maxC * f); g.append(s('line', { x1: m.l, x2: W - m.r, y1: y(c), y2: y(c), class: 'cl-grid' }), s('text', { x: m.l - 6, y: y(c) + 4, 'text-anchor': 'end', class: 'cl-tick' }, String(c))); });
    // shaded zones beyond the thresholds
    if (Number.isFinite(o.lo) && o.lo > lo) g.append(s('rect', { x: m.l, y: m.t, width: Math.max(0, x(o.lo) - m.l), height: ih, class: 'cl-zone' }));
    if (Number.isFinite(o.hi) && o.hi < hi) g.append(s('rect', { x: x(o.hi), y: m.t, width: Math.max(0, W - m.r - x(o.hi)), height: ih, class: 'cl-zone' }));
    bins.forEach((b, i) => {
      const flag = [...o.flagged].some((v) => v >= b.x0 && (v < b.x1 || (i === bins.length - 1 && v <= b.x1)));
      if (!b.count) return;
      g.append(s('rect', { x: x(b.x0) + 1, y: y(b.count), width: Math.max(1, x(b.x1) - x(b.x0) - 2), height: m.t + ih - y(b.count), class: flag ? 'cl-hbar-flag' : 'cl-hbar', fill: flag ? `url(#${pid})` : null }));
    });
    g.append(s('line', { x1: m.l, x2: W - m.r, y1: m.t + ih, y2: m.t + ih, class: 'cl-axis' }));
    const ticks = [lo, (lo + hi) / 2, hi];
    ticks.forEach((t, k) => g.append(s('text', { x: x(t), y: HH - m.b + 16, 'text-anchor': k === 0 ? 'start' : k === 2 ? 'end' : 'middle', class: 'cl-tick' }, fmt(t))));
    g.append(s('text', { x: W - m.r, y: HH - 8, 'text-anchor': 'end', class: 'cl-axis-label' }, o.label));
    // markers with staggered labels
    placed.forEach(({ v, name, cls, row, left }) => {
      const px = x(v), ty = 12 + row * 13;
      g.append(s('line', { x1: px, x2: px, y1: ty + 3, y2: m.t + ih, class: cls }));
      g.append(s('text', { x: left + 5, y: ty, 'text-anchor': 'start', class: 'cl-mark-label' }, name));
    });
    svg.append(g);
    box.replaceChildren(svg, h('ul', { class: 'legend cl-dist-legend', role: 'list' },
      h('li', {}, h('i', { class: 'cl-key cl-key-bar' }), 'values'), h('li', {}, h('i', { class: 'cl-key cl-key-flag' }), 'bins with flagged values (hatched)'),
      h('li', {}, h('i', { class: 'cl-key cl-key-mean' }), 'mean (solid)'), h('li', {}, h('i', { class: 'cl-key cl-key-median' }), 'median (dotted)'), h('li', {}, h('i', { class: 'cl-key cl-key-fence' }), 'thresholds (dashed)')),
    offChart.length ? h('p', { class: 'cl-note' }, `A threshold at ${offChart.map(fmt).join(' and ')} lies far outside the data and is not drawn.`) : '');
  }
  draw();
  onResize(el, draw);
  return { redraw: draw };
}
