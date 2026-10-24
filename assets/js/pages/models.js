// models.js — the life cycle of a model (as a flower) and the overfitting lab.
import { initSite } from '../core/site.js?v=12';
import { $, $$, h, s, onResize, debounce } from '../core/dom.js?v=12';
import * as F from '../core/format.js?v=12';
import * as S from '../core/stats.js?v=12';
import { curvePoints, mulberry32 } from '../core/rng.js?v=12';
import { scatter, lineChart, tableTwin } from '../core/charts.js?v=12';

initSite();

// ================================================================ the cycle
const STAGES = [
  {
    life: 'Seed', title: 'Frame the question',
    doing: 'I write down the decision the model will inform, the outcome it predicts, who will use it and how success is measured. Then I set a naive baseline: the average, last year’s value, the most common answer.',
    ask: 'What decision changes if this model is right?',
    risk: 'Optimising a number nobody acts on.',
    see: { text: 'The DCF in Finance makes every forecast assumption explicit before any number appears.', href: '../finance/valuation/#dcf' },
  },
  {
    life: 'Sprout', title: 'Audit the data',
    doing: 'Before analysis, I check where the data came from, its types, gaps, repeats and outliers, and score its quality. Fixes are suggested and logged, never applied silently.',
    ask: 'Would I trust this table if someone else had cleaned it?',
    risk: 'A quiet fix that changes the answer.',
    see: { text: 'The quality score and change log in Business analytics.', href: '../analytics/explore/#data' },
  },
  {
    life: 'Leaf', title: 'Explore and shape the features',
    doing: 'I plot distributions and relationships, transform skewed variables (logs turn a demand curve into a straight line), encode categories and scale where a model needs it. Each step learns from training data only.',
    ask: 'Does the shape of the data match the shape of the model?',
    risk: 'Leakage: information from the test set, or from the future, slipping into training.',
    see: { text: 'The log-log transform behind Price sensitivity in Marketing.', href: '../marketing/pricing/#elasticity' },
  },
  {
    life: 'Bloom', title: 'Train with honest validation',
    doing: 'I split the data before anything else, tune settings with k-fold cross-validation, and for anything over time train on the past and test on the future. Every model is compared with the baseline.',
    ask: 'How would this have done on data it never saw?',
    risk: 'Tuning until the test score looks good, which quietly turns the test set into training data.',
    see: { text: 'The lab below shows what held-out data catches.', href: '#lab' },
  },
  {
    life: 'Seed head', title: 'Evaluate and explain',
    doing: 'I report error on held-out data with its uncertainty, check residuals and assumptions (constant error spread, overlapping predictors) and explain the drivers in plain language, including when the model should not be used.',
    ask: 'Can I explain why it predicts what it predicts?',
    risk: 'A high R² on a model whose assumptions have failed.',
    see: { text: 'The diagnostics under Regress in Business analytics.', href: '../analytics/explore/#regress' },
  },
  {
    life: 'Wilt and reseed', title: 'Monitor, retrain, retire',
    doing: 'Conditions drift, so I re-check performance on a schedule, version the data and the model together, and retire a model once it stops earning trust. Its lessons seed the next one.',
    ask: 'Is the world it learned from still the world it predicts?',
    risk: 'A model decaying quietly while people still rely on it.',
    see: null,
  },
];

const art = $('.cycle-art'), tabs = $('#cycle-tabs'), panel = $('#cycle-panel');
const petals = [];
const golden = Math.PI * (3 - Math.sqrt(5));
STAGES.forEach((st, i) => {
  const a = -90 + i * 60;
  const p = s('path', { d: 'M0,-60 C46,-82 54,-152 0,-190 C-54,-152 -46,-82 0,-60Z', transform: `rotate(${a + 90})`, class: 'cycle-petal' });
  art.append(p); petals.push(p);
});
art.append(s('circle', { r: 64, class: 'cycle-disc' }));
for (let k = 0; k < 150; k++) { const r = 5 * Math.sqrt(k + 0.5); if (r > 60) break; art.append(s('circle', { cx: r * Math.cos(k * golden), cy: r * Math.sin(k * golden), r: 2.4, class: 'cycle-seed' })); }

let current = 0;
const btns = STAGES.map((st, i) => {
  const ang = (-90 + i * 60) * (Math.PI / 180), rad = 31;    // % of the flower box
  const b = h('button', {
    class: 'cycle-tab', role: 'tab', type: 'button', id: `stage-tab-${i}`, 'aria-controls': 'cycle-panel', 'aria-selected': 'false', tabindex: '-1',
    style: { left: `${50 + rad * Math.cos(ang)}%`, top: `${50 + rad * Math.sin(ang)}%` },
  }, h('span', { class: 'cycle-n' }, String(i + 1)), h('span', { class: 'cycle-life' }, st.life));
  b.addEventListener('click', () => select(i));
  b.addEventListener('pointerenter', () => petals[i].classList.add('is-hover'));
  b.addEventListener('pointerleave', () => petals[i].classList.remove('is-hover'));
  tabs.append(b);
  return b;
});
tabs.addEventListener('keydown', (e) => {
  const map = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
  if (map[e.key]) { e.preventDefault(); select((current + map[e.key] + STAGES.length) % STAGES.length, true); }
  else if (e.key === 'Home') { e.preventDefault(); select(0, true); }
  else if (e.key === 'End') { e.preventDefault(); select(STAGES.length - 1, true); }
});
function select(i, focus = false) {
  current = i;
  btns.forEach((b, k) => { b.setAttribute('aria-selected', String(k === i)); b.tabIndex = k === i ? 0 : -1; });
  petals.forEach((p, k) => p.classList.toggle('is-active', k === i));
  if (focus) btns[i].focus();
  panel.setAttribute('aria-labelledby', `stage-tab-${i}`);
  const st = STAGES[i];
  panel.replaceChildren(
    h('p', { class: 'stage-kicker' }, `Stage ${i + 1} of 6: ${st.life}`),
    h('h3', { class: 'stage-title' }, st.title),
    h('p', {}, st.doing),
    h('dl', { class: 'stage-dl' },
      h('div', {}, h('dt', {}, 'The question I ask'), h('dd', {}, st.ask)),
      h('div', {}, h('dt', {}, 'What goes wrong'), h('dd', {}, st.risk))),
    st.see ? h('p', { class: 'stage-see' }, 'See it here: ', h('a', { href: st.see.href }, st.see.text)) : '',
  );
}
select(0);

// ================================================================ the lab
let seed = 8;
let data = curvePoints(seed);
const deg = $('#deg');
function errors(pts) {
  const tr = pts.filter((p) => p.train), va = pts.filter((p) => !p.train);
  return Array.from({ length: 12 }, (_, k) => {
    const f = S.polyfit(tr.map((p) => p.x), tr.map((p) => p.y), k + 1);
    if (!f) return { d: k + 1, train: NaN, val: NaN, f: null };
    return { d: k + 1, f, train: S.rmse(tr.map((p) => f(p.x)), tr.map((p) => p.y)), val: S.rmse(va.map((p) => f(p.x)), va.map((p) => p.y)) };
  });
}
let errs = errors(data.pts);
/** k-fold cross-validation over all points: mean RMSE and its standard error for each degree. */
function cvErrors(pts, k = 5) {
  const r = mulberry32(seed * 31 + 7), idx = pts.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  const fold = new Array(pts.length); idx.forEach((p, i) => { fold[p] = i % k; });
  return Array.from({ length: 12 }, (_, dd) => {
    const scores = [];
    for (let f = 0; f < k; f++) {
      const tr = pts.filter((_, i) => fold[i] !== f), te = pts.filter((_, i) => fold[i] === f);
      const fit = S.polyfit(tr.map((p) => p.x), tr.map((p) => p.y), dd + 1);
      scores.push(fit ? S.rmse(te.map((p) => fit(p.x)), te.map((p) => p.y)) : NaN);
    }
    const m = S.mean(scores), se = S.sd(scores) / Math.sqrt(k);
    return { d: dd + 1, mean: m, se };
  });
}
let cv = cvErrors(data.pts);
function cvChoice() {
  const best = cv.reduce((a, b) => (b.mean < a.mean ? b : a));
  const pick = cv.find((c) => c.mean <= best.mean + best.se);
  return { best, pick };
}
function renderLab() {
  const d = +deg.value;
  $('#deg-out').textContent = String(d);
  deg.style.setProperty('--fill', `${((d - 1) / 11) * 100}%`);
  const e = errs[d - 1];
  const best = errs.reduce((a, b) => (b.val < a.val ? b : a));
  $('#lab-train').textContent = F.num(e.train, 3);
  $('#lab-val').textContent = F.num(e.val, 3);
  $('#lab-best').textContent = String(best.d);
  let story;
  if (d === best.d) story = `Degree ${d} is the sweet spot for this sample: held-out error is at its lowest (${F.num(e.val, 3)}). The curve has learned the pattern rather than the noise.`;
  else if (d < best.d && e.val > best.val * 1.15) story = `Degree ${d} underfits: too stiff to follow the curve, so both errors stay high (${F.num(e.train, 3)} and ${F.num(e.val, 3)}).`;
  else if (d > best.d && e.val > best.val * 1.3) story = `Degree ${d} overfits: it threads through the training points (error ${F.num(e.train, 3)}) but misses the held-out ones (error ${F.num(e.val, 3)}, ${F.num(e.val / e.train, 1)}× worse). Without held-out data this model would look like the best.`;
  else story = `Degree ${d} is close to the best (degree ${best.d}). The simpler of two similar models is usually the safer choice.`;
  $('#lab-story').textContent = story;
  const ys = data.pts.map((p) => p.y), lo = Math.min(...ys), hi = Math.max(...ys), pad = (hi - lo) * 0.25;
  const curves = [];
  if ($('#truth').checked) curves.push({ fn: data.truth, cls: 'm-truth' });
  if (e.f) curves.push({ fn: e.f, cls: 'm-s1' });
  scatter($('#lab-fit'), {
    points: data.pts.map((p) => ({ x: p.x, y: p.y, cls: p.train ? 'm-s2' : 'm-hollow', title: p.train ? 'Training point' : 'Held-out point' })),
    curves, height: 300, xLabel: 'x', yLabel: 'y', label: `Polynomial of degree ${d} fitted to the training points`, xDomain: [0, 6], yDomain: [lo - pad, hi + pad],
    legend: [{ name: 'Training points', cls: 'm-s2' }, { name: 'Held-out points', cls: 'm-hollow' }, { name: `Model (degree ${d})`, cls: 'm-s1', shape: 'line' }, ...($('#truth').checked ? [{ name: 'True curve', cls: 'm-truth', shape: 'line' }] : [])],
  });
  const cap = Math.max(...errs.map((x) => x.train)) * 1.0 + best.val * 2.2;
  lineChart($('#lab-curve'), {
    xs: errs.map((x) => x.d), series: [{ name: 'Held-out', values: errs.map((x) => x.val), cls: 'm-s1' }, { name: 'Training', values: errs.map((x) => x.train), cls: 'm-s2' }],
    height: 240, xLabel: 'Degree', yLabel: 'RMSE', highlightX: d, yDomain: [0, cap], xTicks: errs.map((x) => x.d), label: 'Training and held-out error for each polynomial degree', xFormat: (v) => String(v), yFormat: (v) => F.num(v, 2),
  });
  const { best: cvBest, pick } = cvChoice();
  $('#cv-best').textContent = String(pick.d);
  const capCV = Math.min(cvBest.mean * 3.2, Math.max(...cv.map((c) => c.mean + c.se).filter(Number.isFinite)));
  lineChart($('#cv-curve'), {
    xs: cv.map((c) => c.d), series: [{ name: 'Cross-validated', values: cv.map((c) => c.mean), cls: 'm-s1' }],
    band: { lo: cv.map((c) => Math.max(0, c.mean - c.se)), hi: cv.map((c) => Math.min(capCV, c.mean + c.se)), cls: 'm-s1', label: '± 1 standard error' },
    height: 220, xLabel: 'Degree', yLabel: 'RMSE', highlightX: pick.d, yDomain: [0, capCV], xTicks: cv.map((c) => c.d), endLabels: false,
    label: 'Five-fold cross-validated error for each polynomial degree', xFormat: (v) => String(v), yFormat: (v) => F.num(v, 2),
  });
  $('#cv-story').textContent = pick.d === cvBest.d
    ? `Cross-validation picks degree ${pick.d}: lowest average error across the five folds (${F.num(cvBest.mean, 3)}).`
    : `The lowest average error is at degree ${cvBest.d} (${F.num(cvBest.mean, 3)}), but degree ${pick.d} is within one standard error of it, so the one-standard-error rule takes the simpler degree ${pick.d}.`;
  $('#cv-table').replaceChildren();
  tableTwin($('#cv-table'), {
    caption: 'Cross-validated error by degree', columns: [{ label: 'Degree' }, { label: 'Mean RMSE', num: true }, { label: 'Standard error', num: true }],
    rows: cv.map((c) => [String(c.d), F.num(c.mean, 3), F.num(c.se, 3)]),
  });
  $('#lab-table').replaceChildren();
  tableTwin($('#lab-table'), {
    caption: 'Error by degree', columns: [{ label: 'Degree' }, { label: 'Training RMSE', num: true }, { label: 'Held-out RMSE', num: true }],
    rows: errs.map((x) => [String(x.d), F.num(x.train, 3), F.num(x.val, 3)]),
  });
}
deg.addEventListener('input', renderLab);
$('#truth').addEventListener('change', renderLab);
$('#resample').addEventListener('click', () => { seed += 1; data = curvePoints(seed); errs = errors(data.pts); cv = cvErrors(data.pts); renderLab(); });
renderLab();
onResize($('#lab-fit'), debounce(renderLab, 100));
