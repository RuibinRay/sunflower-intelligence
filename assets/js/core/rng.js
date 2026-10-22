// rng.js — seeded random numbers and the example datasets. Every example is synthetic and says so.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function normalGen(rand) {
  let spare = null;
  return (mu = 0, sigma = 1) => {
    if (spare != null) { const v = spare; spare = null; return mu + sigma * v; }
    let u = 0, v = 0; while (u === 0) u = rand(); while (v === 0) v = rand();
    const r = Math.sqrt(-2 * Math.log(u)), th = 2 * Math.PI * v;
    spare = r * Math.sin(th);
    return mu + sigma * r * Math.cos(th);
  };
}
const round = (v, d = 0) => { const f = 10 ** d; return Math.round(v * f) / f; };
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);
const DAY = 86400000;

/** Sunflower field trials: 120 plots, with a few deliberate blemishes for the quality check. */
export function sunflowerTrials(seed = 1888) {
  const r = mulberry32(seed), N = normalGen(r);
  const regions = ['North', 'South', 'East', 'West'];
  const head = ['plot_id', 'region', 'sunlight_hours', 'water_mm', 'nitrogen_kg_ha', 'soil_ph', 'seed_yield_t_ha'];
  const rows = [];
  for (let i = 1; i <= 120; i++) {
    const region = regions[Math.floor(r() * 4)];
    const sun = round(6 + r() * 6 + (region === 'South' ? 0.6 : 0), 1);
    const water = round(clamp(N(520, 90), 300, 760));
    const nitro = round(30 + r() * 110);
    const ph = round(clamp(N(6.8, 0.45), 5.6, 8.1), 2);
    let y = 0.35 + 0.19 * sun + 0.0016 * water + 0.0042 * nitro - 0.32 * (ph - 6.6) ** 2 + N(0, 0.12 + 0.028 * sun);
    if (i === 77) y = 0.62;                               // a hail-damaged plot: a genuine outlier
    rows.push([`P${String(i).padStart(3, '0')}`, region, sun, water, nitro, ph, round(clamp(y, 0.3, 6), 2)]);
  }
  rows[12][3] = ''; rows[58][3] = ''; rows[91][5] = '';   // three empty cells
  rows.push([...rows[40]]);                               // one repeated row
  return { name: 'Sunflower field trials', note: 'Synthetic: 121 rows generated for this demo, not real farm data.', csv: [head, ...rows].map((x) => x.join(',')).join('\n') };
}

/** A café's weekly numbers: two years, with traffic that partly echoes ad spend (collinearity on purpose). */
export function cafeWeeks(seed = 1889) {
  const r = mulberry32(seed), N = normalGen(r);
  const head = ['week', 'ad_spend', 'avg_price', 'temperature_c', 'promo', 'foot_traffic', 'sales'];
  const start = Date.UTC(2024, 9, 7);
  const rows = [];
  for (let w = 0; w < 104; w++) {
    const temp = round(14 + 10 * Math.sin((2 * Math.PI * (w - 14)) / 52) + N(0, 2.2), 1);
    const ad = round(clamp(N(780, 260), 150, 1600));
    const price = round(clamp(N(4.8, 0.28), 4.1, 5.6), 2);
    const promo = r() < 0.25 ? 1 : 0;
    const traffic = round(2600 + 1.15 * ad + 38 * temp + 420 * promo + N(0, 210));
    const sales = round(4100 + 2.05 * ad - 1650 * (price - 4.8) + 72 * temp + 690 * promo + N(0, 380));
    rows.push([iso(start + w * 7 * DAY), ad, price, temp, promo, traffic, sales]);
  }
  return { name: 'Café weekly sales', note: 'Synthetic: 104 weeks generated for this demo.', csv: [head, ...rows].map((x) => x.join(',')).join('\n') };
}

/** Orders for RFM: 400 customers with different habits, Apr 2025 – Sep 2026. */
export function customerOrders(seed = 1890) {
  const r = mulberry32(seed), N = normalGen(r);
  const end = Date.UTC(2026, 8, 30), begin = Date.UTC(2025, 3, 1), span = (end - begin) / DAY;
  const types = [
    { share: 0.12, perYear: 11, lastWithin: 25, aov: 92, since: 1 },
    { share: 0.18, perYear: 6, lastWithin: 70, aov: 70, since: 1 },
    { share: 0.14, perYear: 2, lastWithin: 45, aov: 55, since: 0.12, onlyRecent: true },
    { share: 0.20, perYear: 3, lastWithin: 150, aov: 48, since: 0.8 },
    { share: 0.16, perYear: 7, lastWithin: 270, aov: 80, since: 1, stopped: 160 },
    { share: 0.20, perYear: 1.2, lastWithin: 520, aov: 38, since: 1, stopped: 260 },
  ];
  const pick = () => { let u = r(), acc = 0; for (const t of types) { acc += t.share; if (u <= acc) return t; } return types[types.length - 1]; };
  const head = ['customer_id', 'order_date', 'amount'];
  const rows = [];
  for (let c = 1; c <= 400; c++) {
    const t = pick();
    const id = `C${String(c).padStart(4, '0')}`;
    const lastDay = span - (t.stopped ? t.stopped + r() * (t.lastWithin - t.stopped) : r() * t.lastWithin);
    const firstDay = t.onlyRecent ? Math.max(0, lastDay - 60 * r()) : Math.max(0, lastDay - span * t.since * (0.6 + 0.4 * r()));
    const years = Math.max(0.08, (lastDay - firstDay) / 365);
    const count = Math.max(1, Math.round(t.perYear * years * (0.7 + 0.6 * r())));
    const days = [lastDay, ...Array.from({ length: count - 1 }, () => firstDay + r() * (lastDay - firstDay))].sort((a, b) => a - b);
    for (const d of days) rows.push([id, iso(begin + Math.round(d) * DAY), round(Math.exp(N(Math.log(t.aov), 0.35)), 2)]);
  }
  rows.sort((a, b) => (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0));
  return { name: 'Online shop orders', note: `Synthetic: ${rows.length.toLocaleString('en-US')} orders from 400 customers, generated for this demo.`, csv: [head, ...rows].map((x) => x.join(',')).join('\n') };
}

/** Weekly price tests for two products with different price sensitivity. */
export function priceTests(kind = 'seeds', seed = 1891) {
  const r = mulberry32(seed + (kind === 'oil' ? 7 : 0)), N = normalGen(r);
  const spec = kind === 'oil'
    ? { name: 'Sunflower oil, 1 L', lo: 2.2, hi: 4.8, a: 2600, b: -0.58, noise: 0.045 }
    : { name: 'Seed-mix gift box', lo: 3.5, hi: 6.5, a: 9400, b: -1.46, noise: 0.08 };
  const rows = [];
  for (let w = 0; w < 30; w++) {
    const p = round(spec.lo + r() * (spec.hi - spec.lo), 2);
    rows.push([w + 1, p, Math.max(1, Math.round(spec.a * p ** spec.b * Math.exp(N(0, spec.noise))))]);
  }
  return { name: spec.name, note: 'Synthetic: 30 weeks of price tests generated for this demo.', csv: [['week', 'price', 'units_sold'], ...rows].map((x) => x.join(',')).join('\n') };
}

/** Noisy points from a smooth curve, for the overfitting lab. */
export function curvePoints(seed, n = 32, sigma = 0.32) {
  const r = mulberry32(seed), N = normalGen(r);
  const truth = (x) => 0.9 * Math.sin(1.05 * x - 0.4) + 0.12 * x;
  const pts = Array.from({ length: n }, () => { const x = 0.15 + r() * 5.7; return { x, y: truth(x) + N(0, sigma) }; });
  // a stable 70 / 30 split, decided before any fitting
  const order = pts.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const cut = Math.round(n * 0.7);
  order.forEach((idx, k) => { pts[idx].train = k < cut; });
  return { pts, truth };
}
