#!/usr/bin/env node
// study-datasets.mjs — builds the three fictional B02 teaching datasets.
//
// Each dataset starts as a clean "truth" table. Documented defects are then injected with a fixed seed, so every run
// produces byte-identical files:
//   assets/data/study/<name>.csv              the raw export students download and clean
//   assets/data/study/<name>.manifest.json    every injected defect: kind, 1-based data rows, column, original, corrupted
//   tests/fixtures-study/<name>.truth.csv     the clean truth (tests compare the raw file with it)
//   assets/data/study/README.md               data dictionary (no row numbers)
//
//   node tools/study-datasets.mjs            write the files
//   node tools/study-datasets.mjs --check    exit 1 if the files on disk differ from a fresh build
//
// All people, businesses, e-mail addresses and figures are fictional (addresses use the reserved example.* domains).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mulberry32, normalGen } from '../assets/js/core/rng.js?v=6';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DAY = 86400000;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ---------------------------------------------------------------- small helpers
function makeRng(seed) {
  const r = mulberry32(seed);
  const normal = normalGen(r);
  return {
    next: r,
    normal,
    int: (lo, hi) => lo + Math.floor(r() * (hi - lo + 1)),
    pick: (arr) => arr[Math.floor(r() * arr.length)],
    chance: (p) => r() < p,
    weighted(pairs) {
      const total = pairs.reduce((a, p) => a + p[1], 0);
      let u = r() * total;
      for (const [v, w] of pairs) { u -= w; if (u < 0) return v; }
      return pairs[pairs.length - 1][0];
    },
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      return a;
    },
  };
}
const D = (y, m, d) => Date.UTC(y, m - 1, d);
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);
const ymd = (ms) => { const t = new Date(ms); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }; };
const pad = (n) => String(n).padStart(2, '0');
const round2 = (v) => Math.round(v * 100 + 1e-9) / 100;
const fixed2 = (v) => round2(v).toFixed(2);
const grouped = (v) => { const [i, f] = round2(v).toFixed(2).split('.'); return `${i.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${f}`; };
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
// date formats used for the defects
const fmtDMY = (ms) => { const { y, m, d } = ymd(ms); return `${pad(d)}/${pad(m)}/${y}`; };
const fmtMDY2 = (ms) => { const { y, m, d } = ymd(ms); return `${m}/${d}/${String(y).slice(2)}`; };
const fmtWritten = (ms) => { const { y, m, d } = ymd(ms); return `${MONTHS[m - 1]} ${d}, ${y}`; };
const fmtSerial = (ms) => String(Math.round((ms - Date.UTC(1899, 11, 30)) / DAY));   // Excel 1900 date system

function csvCell(v) {
  const t = v == null ? '' : String(v);
  return /[",\r\n]|^\s|\s$/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
}
const toCSV = (columns, rows) => `${[columns.map(csvCell).join(','), ...rows.map((r) => r.map(csvCell).join(','))].join('\n')}\n`;

/**
 * Bookkeeping shared by the three datasets: the truth rows (objects of strings), their raw copies, the cell defects,
 * the rows inserted into the raw file, and notable (genuine) values.
 */
class Builder {
  constructor(name, columns, truth) {
    this.name = name; this.columns = columns; this.truth = truth;
    this.raw = truth.map((o) => ({ ...o }));
    this.cells = [];            // { t, column, original, corrupted, kind, ...extra }
    this.extras = [];           // { after: truthIndex (−1 = before the first row), before?: truthIndex, row: {}, ...meta }
    this.notable = [];
    this.notes = [];
    this.used = new Set();      // `${t}|${column}`
    this.reserved = new Set();  // truth rows kept free of cell defects
  }
  free(t, column) { return !this.reserved.has(t) && !this.used.has(`${t}|${column}`); }
  corrupt(t, column, value, kind, extra = {}) {
    if (!this.free(t, column)) throw new Error(`${this.name}: cell ${t}/${column} already used`);
    if (String(value) === String(this.truth[t][column])) throw new Error(`${this.name}: defect at ${t}/${column} changes nothing`);
    this.used.add(`${t}|${column}`);
    this.cells.push({ t, column, original: this.truth[t][column], corrupted: String(value), kind, ...extra });
    this.raw[t][column] = String(value);
  }
  /** Rows (truth indexes) matching pred whose column is still free, in random order. */
  candidates(R, column, pred = () => true) {
    return R.shuffle(this.truth.map((_, i) => i).filter((i) => this.free(i, column) && pred(this.truth[i], i)));
  }
  take(R, n, column, pred) {
    const c = this.candidates(R, column, pred);
    if (c.length < n) throw new Error(`${this.name}: only ${c.length} candidates for ${n} defects in ${column}`);
    return c.slice(0, n);
  }
  /** Assemble the raw file: truth order with the extra rows inserted; returns the manifest. */
  finish(meta) {
    const n = this.truth.length;
    const before = new Map(), after = new Map();
    for (const x of this.extras) {
      const map = x.before != null ? before : after;
      const k = x.before != null ? x.before : Math.min(n - 1, x.after);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(x);
    }
    const out = [];
    const rowOf = new Array(n);
    for (let t = 0; t < n; t++) {
      for (const x of before.get(t) || []) { out.push(x.row); x.rowNumber = out.length; }
      out.push(this.raw[t]); rowOf[t] = out.length;
      for (const x of after.get(t) || []) { out.push(x.row); x.rowNumber = out.length; }
    }
    const defects = [];
    for (const x of this.extras) {
      const src = rowOf[x.source];
      if (x.kind === 'exact-duplicate') {
        defects.push({ kind: 'exact-duplicate', rows: [src, x.rowNumber].sort((a, b) => a - b), extraRow: x.rowNumber, duplicateOf: src, note: x.note });
      } else {
        const diffs = this.columns.filter((c) => String(x.row[c]) !== String(this.raw[x.source][c])).map((c) => ({ column: c, kept: this.raw[x.source][c], extra: x.row[c] }));
        defects.push({
          kind: x.kind, rows: [src, x.rowNumber].sort((a, b) => a - b), extraRow: x.rowNumber, keepRow: src,
          column: diffs[0]?.column ?? null, original: diffs[0]?.kept ?? null, corrupted: diffs[0]?.extra ?? null, differences: diffs, note: x.note,
        });
      }
    }
    for (const c of this.cells) {
      const { t, kind, column, original, corrupted, ...extra } = c;
      defects.push({ kind, rows: [rowOf[t]], column, original, corrupted, ...extra });
    }
    defects.sort((a, b) => a.rows[0] - b.rows[0] || (a.column || '').localeCompare(b.column || '') || a.kind.localeCompare(b.kind));
    defects.forEach((d, i) => { d.id = i + 1; });
    const counts = {};
    defects.forEach((d) => { counts[d.kind] = (counts[d.kind] || 0) + 1; });
    const touched = new Set(defects.flatMap((d) => (d.kind === 'exact-duplicate' || d.kind === 'duplicate-key' || d.kind === 'near-duplicate' ? [d.extraRow] : d.rows)));
    const manifest = {
      dataset: this.name,
      ...meta,
      fictional: true,
      generator: 'tools/study-datasets.mjs (fixed seed; rerun to regenerate identical files)',
      rowNumbers: '1-based data rows of the raw CSV; the header line is not counted.',
      rows: out.length,
      truthRows: n,
      truthFile: `tests/fixtures-study/${this.name}.truth.csv`,
      alignment: 'Delete the extraRow of every exact-duplicate, duplicate-key and near-duplicate entry from the raw file and the remaining rows line up one-to-one with the truth file. Cells then differ only where a defect is listed (numbers compared as numbers, so "$18.00" and "18.00" count as equal).',
      columns: this.columns,
      counts,
      rowsWithDefects: touched.size,
      defects,
      notable: this.notable.map((x) => ({ ...x, rows: [rowOf[x.t]], t: undefined })).map(({ t, ...rest }) => rest),
      notes: this.notes,
    };
    return {
      csv: toCSV(this.columns, out.map((o) => this.columns.map((c) => o[c]))),
      truth: toCSV(this.columns, this.truth.map((o) => this.columns.map((c) => o[c]))),
      manifest,
    };
  }
}

// ---------------------------------------------------------------- fictional people
const FIRST = ['amara', 'ben', 'carlos', 'dana', 'elif', 'farah', 'gabe', 'hana', 'ivan', 'jade', 'kofi', 'lena', 'mateo', 'nadia', 'omar', 'priya', 'quinn', 'rosa', 'sam', 'tariq', 'uma', 'vera', 'wei', 'yusuf', 'zoe', 'aiden', 'bea', 'cyrus', 'dev', 'emma', 'felix', 'grace', 'hugo', 'iris', 'jonah', 'kira', 'liam', 'maya', 'noor', 'oscar', 'pia', 'ravi', 'sofia', 'theo', 'una', 'victor', 'wren', 'yara', 'zane', 'alba'];
const LAST = ['adler', 'baker', 'chen', 'diaz', 'evans', 'fischer', 'garcia', 'haddad', 'ito', 'jensen', 'kowalski', 'lopez', 'mensah', 'novak', 'okafor', 'patel', 'quist', 'rossi', 'silva', 'tanaka', 'usman', 'varga', 'walsh', 'xu', 'young', 'zimmer', 'ahmed', 'brooks', 'costa', 'dubois'];
const DOMAINS = ['example.com', 'example.org', 'example.net'];

// ================================================================ Lantern Coffee: online-shop orders
const LANTERN_COLUMNS = ['order_id', 'order_date', 'customer_id', 'email', 'region', 'product', 'size_g', 'quantity', 'unit_price', 'discount', 'order_total', 'channel', 'subscription', 'rating'];
const PRODUCTS = [
  // name, size_g, price, popularity, sold on subscription
  ['House Blend 250g', 250, 14.00, 20, true],
  ['House Blend 1kg', 1000, 46.00, 7, true],
  ['Espresso Roast 250g', 250, 15.50, 14, true],
  ['Espresso Roast 1kg', 1000, 49.00, 5, true],
  ['Ethiopia Yirgacheffe 250g', 250, 19.50, 12, true],
  ['Colombia Huila 250g', 250, 17.00, 11, true],
  ['Sumatra Mandheling 250g', 250, 18.00, 7, true],
  ['Decaf Colombia 250g', 250, 16.50, 8, true],
  ['Decaf Colombia 1kg', 1000, 54.00, 3, true],
  ['Cold Brew Pack', 480, 22.00, 8, false],
  ['Gift Box Trio', 750, 58.00, 5, false],
];
const PRODUCT = Object.fromEntries(PRODUCTS.map((p) => [p[0], { name: p[0], size: p[1], price: p[2] }]));
export const LANTERN_REGIONS = ['North', 'South', 'East', 'West', 'Central'];

function lantern() {
  const R = makeRng(20260301);
  const START = D(2026, 3, 1), LAST_DAY = 121;   // 1 March … 30 June 2026
  const TARGET = 231;
  const emails = new Set();
  const customers = [];
  const newCustomer = (sub) => {
    const first = R.pick(FIRST), last = R.pick(LAST), dom = R.pick(DOMAINS);
    let email = `${first}.${last}@${dom}`, k = 2;
    while (emails.has(email)) email = `${first}.${last}${k++}@${dom}`;
    emails.add(email);
    const c = {
      id: `C${String(customers.length + 1).padStart(4, '0')}`, email, sub,
      region: R.weighted([['North', 24], ['South', 20], ['East', 18], ['West', 22], ['Central', 16]]),
      channel: R.chance(sub ? 0.5 : 0.32) ? 'app' : 'web',
      fav: R.weighted(PRODUCTS.filter((p) => p[4]).map((p) => [p[0], p[3]])),
    };
    customers.push(c);
    return c;
  };
  const rating = (sub) => {
    if (!R.chance(sub ? 0.86 : 0.5)) return '';
    return String(sub ? R.weighted([[5, 55], [4, 33], [3, 10], [2, 2]]) : R.weighted([[5, 30], [4, 34], [3, 20], [2, 10], [1, 6]]));
  };
  const orders = [];
  // subscribers: a delivery roughly every 30 days from their start date
  for (let i = 0; i < 27; i++) {
    const c = newCustomer(true);
    const qty = R.chance(0.3) ? 2 : 1;
    for (let day = R.int(0, 44); day <= LAST_DAY; day += R.int(28, 32)) {
      const p = PRODUCT[c.fav];
      const disc = round2(0.10 * qty * p.price);
      orders.push({ day, c, product: p.name, qty, disc, channel: R.chance(0.85) ? c.channel : (c.channel === 'app' ? 'web' : 'app'), sub: 'yes', rating: rating(true) });
    }
  }
  // one-off and occasional buyers
  while (orders.length < TARGET - 1) {
    const c = newCustomer(false);
    const k = R.weighted([[1, 72], [2, 20], [3, 8]]);
    for (let j = 0; j < k && orders.length < TARGET - 1; j++) {
      const p = PRODUCT[R.weighted(PRODUCTS.map((x) => [x[0], x[3]]))];
      const qty = R.weighted([[1, 55], [2, 28], [3, 10], [4, 4], [5, 2], [6, 1]]);
      const disc = qty * p.price >= 40 && R.chance(0.3) ? 5 : 0;
      orders.push({ day: R.int(0, LAST_DAY), c, product: p.name, qty, disc, channel: R.chance(0.85) ? c.channel : (c.channel === 'app' ? 'web' : 'app'), sub: 'no', rating: rating(false) });
    }
  }
  // the genuine bulk order: an office buying a quarter's supply
  const office = newCustomer(false);
  emails.delete(office.email);
  office.email = 'purchasing@example.org'; office.region = 'Central'; office.channel = 'web';
  orders.push({ day: 74, c: office, product: 'House Blend 250g', qty: 120, disc: 168, channel: 'web', sub: 'no', rating: '5', bulk: true });
  orders.sort((a, b) => a.day - b.day || a.c.id.localeCompare(b.c.id));
  const truth = orders.map((o, i) => {
    const p = PRODUCT[o.product];
    return {
      order_id: `LC-${10001 + i}`, order_date: iso(START + o.day * DAY), customer_id: o.c.id, email: o.c.email,
      region: o.c.region, product: p.name, size_g: String(p.size), quantity: String(o.qty), unit_price: fixed2(p.price),
      discount: fixed2(o.disc), order_total: fixed2(o.qty * p.price - o.disc), channel: o.channel, subscription: o.sub, rating: o.rating,
      _bulk: !!o.bulk,
    };
  });
  const B = new Builder('lantern-orders', LANTERN_COLUMNS, truth);
  const bulk = truth.findIndex((o) => o._bulk);
  truth.forEach((o) => { delete o._bulk; });
  B.raw.forEach((o) => { delete o._bulk; });
  B.reserved.add(bulk);
  B.notable.push({ t: bulk, kind: 'genuine-outlier', column: 'quantity', value: '120', note: 'A real office order of 120 bags (order_total agrees with quantity × unit_price − discount, after a 10% bulk discount). Extreme but genuine: removing it would understate revenue.' });

  // money stored as text: most unit prices carry a $ sign, some don't; every order total has one
  truth.forEach((o, t) => {
    B.raw[t].unit_price = R.chance(0.72) ? `$${grouped(+o.unit_price)}` : grouped(+o.unit_price);
    B.raw[t].order_total = `$${grouped(+o.order_total)}`;
  });

  // the typing-error outlier: a unit price typed without its decimal point
  const typo = B.take(R, 1, 'unit_price', (o) => o.product === 'Sumatra Mandheling 250g' && o.subscription === 'no')[0];
  B.corrupt(typo, 'unit_price', '$1,800.00', 'outlier-error', { note: 'Typing error: 18.00 entered without the decimal point. order_total still matches the real price of $18.00, which is the evidence it is an error.' });
  B.reserved.add(typo);

  // repeated order ids with an edited value (sources kept free of other defects)
  const keyPick = (pred) => { const t = B.candidates(R, 'email', (o, i) => !B.reserved.has(i) && pred(o))[0]; B.reserved.add(t); return t; };
  const kA = keyPick((o) => o.rating !== '');
  const kB = keyPick((o) => o.region === 'North');
  const kC = keyPick((o) => o.subscription === 'no' && o.quantity === '2' && o.discount === '0.00' && o.unit_price === '14.00');
  B.extras.push({ kind: 'duplicate-key', source: kA, before: kA, row: { ...B.raw[kA], email: '' }, note: 'The same order exported twice; the earlier copy lost its e-mail address. Keeping the most complete copy keeps the right one; keeping the first copy keeps the incomplete one.' });
  B.extras.push({ kind: 'duplicate-key', source: kB, after: kB + R.int(2, 8), row: { ...B.raw[kB], region: 'north ' }, note: 'A re-export with the region typed as "north " (lower case, trailing space). After trimming and standardising the region it becomes an exact duplicate.' });
  const qtyC = 3, priceC = +truth[kC].unit_price;
  B.extras.push({ kind: 'duplicate-key', source: kC, after: kC + R.int(2, 8), row: { ...B.raw[kC], quantity: String(qtyC), order_total: `$${grouped(qtyC * priceC)}` }, note: 'An edited re-export: quantity 3 instead of 2, with the total recomputed, so both copies look internally consistent. The shop system confirms the first copy (quantity 2) is right.' });

  // exact duplicate rows (an export that repeated some lines)
  const dupSources = R.shuffle(truth.map((_, i) => i).filter((i) => !B.reserved.has(i))).slice(0, 6);
  dupSources.forEach((t) => { B.reserved.add(t); });

  // dates: ISO by default; a manual import wrote DD/MM/YYYY, the app wrote M/D/YY, a few were typed out, some became serials
  const day = (o) => +o.order_date.slice(8, 10);
  const mon = (o) => +o.order_date.slice(5, 7);
  B.take(R, 4, 'order_date', (o) => o.channel === 'web' && day(o) >= 3 && day(o) <= 6 && day(o) !== mon(o))
    .forEach((t) => B.corrupt(t, 'order_date', fmtDMY(Date.parse(truth[t].order_date)), 'date-format', { format: 'DD/MM/YYYY', ambiguous: true, note: 'Day first; could also be read month first, and both readings fall inside March–June 2026.' }));
  B.take(R, 5, 'order_date', (o) => o.channel === 'web' && day(o) > 12)
    .forEach((t) => B.corrupt(t, 'order_date', fmtDMY(Date.parse(truth[t].order_date)), 'date-format', { format: 'DD/MM/YYYY', ambiguous: false }));
  B.take(R, 5, 'order_date', (o) => o.channel === 'app' && day(o) > 12)
    .forEach((t) => B.corrupt(t, 'order_date', fmtMDY2(Date.parse(truth[t].order_date)), 'date-format', { format: 'M/D/YY', ambiguous: false }));
  B.take(R, 4, 'order_date').forEach((t) => B.corrupt(t, 'order_date', fmtWritten(Date.parse(truth[t].order_date)), 'date-format', { format: 'written', ambiguous: false }));
  B.take(R, 4, 'order_date').forEach((t) => B.corrupt(t, 'order_date', fmtSerial(Date.parse(truth[t].order_date)), 'date-format', { format: 'serial', ambiguous: false, note: 'A spreadsheet serial number (days since 30 December 1899, the Excel 1900 date system).' }));

  // one unit price with a decimal comma
  const dc = B.take(R, 1, 'unit_price', (o) => o.unit_price === '16.50')[0];
  B.corrupt(dc, 'unit_price', '16,50', 'decimal-comma', { note: 'Decimal comma (European style). Read with a decimal point it would become 1,650.' });

  // impossible quantities; the order total still reflects the real quantity
  const q2 = B.take(R, 1, 'quantity', (o) => o.quantity === '2')[0];
  B.corrupt(q2, 'quantity', '-2', 'out-of-range', { note: 'Negative: keyed like a refund. order_total matches a quantity of 2.' });
  B.take(R, 2, 'quantity', (o) => o.quantity === '1').forEach((t) => B.corrupt(t, 'quantity', '0', 'out-of-range', { note: 'Zero: an order of nothing. order_total matches a quantity of 1.' }));
  const q999 = B.take(R, 1, 'quantity', (o) => o.quantity === '1')[0];
  B.corrupt(q999, 'quantity', '999', 'out-of-range', { note: 'Impossible: 999 is a placeholder. order_total matches a quantity of 1.' });

  // order totals that don't equal quantity × unit_price − discount
  B.take(R, 2, 'order_total', (o) => +o.discount > 0 && +o.quantity < 10).forEach((t) => {
    const o = truth[t]; B.corrupt(t, 'order_total', `$${grouped(+o.quantity * +o.unit_price)}`, 'rule-violation', { rule: 'order_total = quantity × unit_price − discount', note: 'Discount not subtracted.' });
  });
  B.take(R, 2, 'order_total', (o) => { const s = o.order_total; return +s >= 10 && +s < 100 && s[0] !== s[1]; }).forEach((t) => {
    const s = truth[t].order_total; B.corrupt(t, 'order_total', `$${s[1]}${s[0]}${s.slice(2)}`, 'rule-violation', { rule: 'order_total = quantity × unit_price − discount', note: 'Two digits swapped.' });
  });
  B.take(R, 1, 'order_total', (o) => +o.quantity < 10).forEach((t) => {
    B.corrupt(t, 'order_total', `$${grouped(+truth[t].order_total + 6.5)}`, 'rule-violation', { rule: 'order_total = quantity × unit_price − discount', note: 'Includes a $6.50 shipping charge that belongs in another column.' });
  });

  // region spelled several ways
  const regionVariants = [
    ['North', 'north ', 'whitespace'], ['North', 'north', 'case'], ['North', 'N.', 'abbreviation'], ['North', 'Nrth', 'typo'],
    ['South', 'SOUTH', 'case'], ['South', 'S.', 'abbreviation'], ['South', 'Soth', 'typo'],
    ['East', 'east', 'case'], ['East', 'E.', 'abbreviation'],
    ['West', 'West ', 'whitespace'], ['West', 'Wset', 'typo'],
    ['Central', 'central', 'case'],
  ];
  regionVariants.forEach(([region, v, variant]) => {
    const t = B.take(R, 1, 'region', (o) => o.region === region)[0];
    B.corrupt(t, 'region', v, 'inconsistent-category', { variant });
  });

  // product names with stray spaces and inconsistent case
  const productVariants = [
    ['House Blend 250g', ' House Blend 250g', 'whitespace'], ['House Blend 250g', 'house blend 250g', 'case'], ['House Blend 250g', 'HOUSE BLEND 250G', 'case'],
    ['Espresso Roast 250g', 'Espresso Roast 250g ', 'whitespace'], ['Ethiopia Yirgacheffe 250g', 'Ethiopia  Yirgacheffe 250g', 'whitespace'],
    ['Colombia Huila 250g', 'COLOMBIA HUILA 250G', 'case'], ['Decaf Colombia 1kg', 'decaf colombia 1kg', 'case'], ['Cold Brew Pack', 'Cold brew pack', 'case'],
  ];
  productVariants.forEach(([p, v, variant]) => {
    const t = B.take(R, 1, 'product', (o) => o.product === p)[0];
    B.corrupt(t, 'product', v, 'inconsistent-category', { variant });
  });

  // e-mail: missing (some recoverable from the same customer's other orders) and case or whitespace variants
  const ordersOf = new Map();
  truth.forEach((o) => ordersOf.set(o.customer_id, (ordersOf.get(o.customer_id) || 0) + 1));
  B.take(R, 4, 'email', (o) => ordersOf.get(o.customer_id) > 1).forEach((t) => B.corrupt(t, 'email', '', 'missing', { note: 'Recoverable: the same customer_id has the address on another order.' }));
  B.take(R, 3, 'email', (o) => ordersOf.get(o.customer_id) === 1).forEach((t) => B.corrupt(t, 'email', '', 'missing', { note: 'Not recoverable from this file: the customer has no other order.' }));
  const cap = (e) => e.replace(/(^|[.@])([a-z])/g, (_, a, b) => a + b.toUpperCase());
  const emailVariants = [(e) => ` ${e}`, (e) => `${e} `, cap, cap, (e) => e.toUpperCase(), (e) => ` ${cap(e)}`];
  const emailKinds = ['whitespace', 'whitespace', 'case', 'case', 'case', 'whitespace'];
  B.take(R, emailVariants.length, 'email').forEach((t, i) => B.corrupt(t, 'email', emailVariants[i](truth[t].email), emailKinds[i]));

  // exact duplicates are copies of the (already messy) raw rows, a few lines further down
  dupSources.forEach((t) => B.extras.push({ kind: 'exact-duplicate', source: t, after: t + R.int(1, 10), row: { ...B.raw[t] }, note: 'Repeats an earlier row exactly.' }));

  B.notes.push(
    'rating is blank where the customer left no rating; the truth file is blank there too. One-off buyers rate far less often than subscribers, so the missingness depends on subscription (missing at random given subscription), and subscribers who rate give higher ratings.',
    'unit_price is stored as text: most values carry a $ sign, some do not. order_total is stored as text with a $ sign and thousands separators. These formats are not listed as defects because the numbers are right once read as numbers.',
    'The DD/MM/YYYY dates come from web orders and the M/D/YY dates from app orders. Every unambiguous four-digit-year slash date is day first and every two-digit-year date is month first, which is the evidence for reading the ambiguous ones day first.',
  );
  return B.finish({ title: 'Lantern Coffee Co. online-shop orders, 1 March – 30 June 2026', seed: 20260301, unit: 'one row per order', key: 'order_id' });
}

// ================================================================ Harborview Hotel: bookings
const HARBOR_COLUMNS = ['booking_id', 'booked_on', 'check_in', 'check_out', 'nights', 'room_type', 'adults', 'children', 'rate', 'channel', 'country', 'status', 'total'];

function harborview() {
  const R = makeRng(20250601);
  const TARGET = 176;
  const monthW = [[6, 11], [7, 13], [8, 13], [9, 9], [10, 8], [11, 6], [12, 7], [1, 5], [2, 5], [3, 7], [4, 8], [5, 9]];
  const season = (m) => (m >= 6 && m <= 8 ? 1.25 : m === 9 || m === 10 || m === 12 ? 1.05 : m >= 11 || m <= 3 ? 0.85 : 1.0);
  const ROOMS = { Standard: 149, Deluxe: 199, Family: 229, Suite: 349 };
  const rows = [];
  for (let i = 0; i < TARGET; i++) {
    const m = R.weighted(monthW);
    const y = m >= 6 ? 2025 : 2026;
    const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const checkIn = D(y, m, R.int(1, dim));
    const nights = R.weighted([[1, 22], [2, 30], [3, 20], [4, 11], [5, 6], [6, 4], [7, 3], [9, 1.5], [11, 1.2], [14, 1]]);
    const lead = Math.min(300, Math.round(-Math.log(1 - R.next()) * 38));
    const room = R.weighted([['Standard', 45], ['Deluxe', 30], ['Family', 15], ['Suite', 10]]);
    const adults = room === 'Family' ? 2 : R.weighted([[1, 25], [2, 62], [3, room === 'Standard' ? 6 : 8], [4, room === 'Standard' ? 0 : 5]]);
    const children = room === 'Family' ? R.weighted([[1, 35], [2, 45], [3, 20]]) : room === 'Deluxe' && R.chance(0.12) ? 1 : 0;
    const rate = Math.round(ROOMS[room] * season(m) * (0.92 + 0.16 * R.next()));
    rows.push({
      bookedMs: checkIn - lead * DAY, checkIn, nights, room, adults, children, rate,
      channel: R.weighted([['Direct', 30], ['OTA', 40], ['Phone', 10], ['Corporate', 12], ['Travel agent', 8]]),
      country: R.weighted([['United States', 55], ['Canada', 12], ['United Kingdom', 8], ['Mexico', 5], ['Germany', 6], ['France', 4], ['Japan', 4], ['Australia', 3], ['Ireland', 3]]),
      status: R.weighted([['Completed', 80], ['Cancelled', 14], ['No-show', 6]]),
    });
  }
  rows.sort((a, b) => a.bookedMs - b.bookedMs || a.checkIn - b.checkIn);
  const truth = rows.map((r, i) => ({
    booking_id: `HB-${25001 + i}`, booked_on: iso(r.bookedMs), check_in: iso(r.checkIn), check_out: iso(r.checkIn + r.nights * DAY),
    nights: String(r.nights), room_type: r.room, adults: String(r.adults), children: String(r.children), rate: String(r.rate),
    channel: r.channel, country: r.country, status: r.status, total: String(r.nights * r.rate),
  }));
  const B = new Builder('harborview-bookings', HARBOR_COLUMNS, truth);

  // the right-skewed total: note the largest genuine stay
  const big = truth.reduce((bi, o, i) => (+o.total > +truth[bi].total ? i : bi), 0);
  B.reserved.add(big);
  B.notable.push({ t: big, kind: 'genuine-outlier', column: 'total', value: truth[big].total, note: `A genuine long stay (${truth[big].nights} nights in a ${truth[big].room_type} room). total is right-skewed: a few long or suite stays sit far above the median.` });

  // duplicate bookings from a channel-manager sync: same booking, new id (sources kept clean)
  const syncSources = B.candidates(R, 'booking_id', (o, i) => o.channel === 'OTA' && !B.reserved.has(i)).slice(0, 4).sort((a, b) => a - b);
  syncSources.forEach((t, k) => B.reserved.add(t));

  // check-out typed with the previous month: before check-in
  B.take(R, 3, 'check_out', (o) => +o.check_out.slice(8, 10) <= 28 && o.check_out.slice(5, 7) !== '01' && o.check_out.slice(5, 7) === o.check_in.slice(5, 7)).forEach((t) => {
    const co = truth[t].check_out; const m = +co.slice(5, 7) - 1;
    B.corrupt(t, 'check_out', `${co.slice(0, 5)}${pad(m)}${co.slice(7)}`, 'date-order', { rule: 'check_out after check_in', note: 'Month typed one too low, so check-out falls before check-in. nights and total are right.' });
  });
  // nights that don't match the dates (days counted instead of nights)
  B.take(R, 4, 'nights', (o, i) => B.free(i, 'check_out')).forEach((t) => B.corrupt(t, 'nights', String(+truth[t].nights + 1), 'rule-violation', { rule: 'nights = days between check_in and check_out', note: 'Counted days instead of nights. total ÷ rate gives the right number.' }));
  // placeholder rates; total is still right
  B.take(R, 3, 'rate').forEach((t) => B.corrupt(t, 'rate', '0', 'out-of-range', { note: 'Placeholder 0 from the channel manager. total ÷ nights recovers the rate.' }));
  B.take(R, 2, 'rate').forEach((t) => B.corrupt(t, 'rate', '9999', 'out-of-range', { note: 'Placeholder 9999. total ÷ nights recovers the rate.' }));
  // country as codes and names (the channel manager writes codes)
  const countryVariants = [['United States', 'US'], ['United States', 'US'], ['United States', 'US'], ['United States', 'US'], ['United States', 'USA'], ['United States', 'USA'], ['United States', 'USA'], ['United States', 'us'], ['United States', 'us'], ['United States', 'U.S.'],
    ['Canada', 'CA'], ['Canada', 'CA'], ['United Kingdom', 'UK'], ['United Kingdom', 'UK'], ['United Kingdom', 'GB'], ['Germany', 'DE'], ['Mexico', 'MX'], ['United States', 'United States ']];
  countryVariants.forEach(([c, v]) => {
    const t = B.candidates(R, 'country', (o) => o.country === c && o.channel === 'OTA')[0] ?? B.take(R, 1, 'country', (o) => o.country === c)[0];
    B.corrupt(t, 'country', v, 'inconsistent-category', { variant: /\s$/.test(v) ? 'whitespace' : 'code' });
  });
  // blank children meaning 0: the OTA feed left zeros blank until October 2025
  B.take(R, 20, 'children', (o) => o.channel === 'OTA' && o.children === '0' && o.booked_on < '2025-10-01').forEach((t) => B.corrupt(t, 'children', '', 'missing', { note: 'Blank means 0: the OTA feed left zero children blank until October 2025.' }));

  syncSources.forEach((t, k) => B.extras.push({ kind: 'near-duplicate', source: t, after: t + R.int(0, 2), row: { ...B.raw[t], booking_id: `HB-${26101 + k}` }, note: 'The same booking created again by a channel-manager sync: every column matches except booking_id.' }));

  B.notes.push(
    'total is the booked room charge (nights × rate) for every booking, including cancellations and no-shows.',
    'Blank children appear only on OTA bookings made before October 2025; they mean 0, not unknown. The README says so, as a data dictionary should.',
  );
  return B.finish({ title: 'Harborview Hotel bookings, stays from June 2025 to May 2026', seed: 20250601, unit: 'one row per booking', key: 'booking_id' });
}

// ================================================================ Northfield University: student records
const NORTH_COLUMNS = ['student_id', 'programme', 'year', 'gpa', 'credits', 'attendance_pct', 'study_hours', 'scholarship', 'entry_score', 'residence'];

function northfield() {
  const R = makeRng(20240901);
  const N = R.normal;
  const PROGRAMMES = [['Business Administration', 28], ['Computer Science', 24], ['Economics', 14], ['Nursing', 16], ['Psychology', 12], ['Mechanical Engineering', 6]];
  const truth = [];
  for (let i = 0; i < 150; i++) {
    const year = R.weighted([[1, 30], [2, 26], [3, 24], [4, 20]]);
    const gpa = round2(clamp(N(3.02, 0.48), 1.2, 4));
    const credits = Math.round((year - 1) * 30 + clamp(N(24, 5), 6, 33));
    const attendance = Math.round(clamp(N(86, 8.5), 52, 100));
    const hours = Math.round(Math.exp(N(Math.log([9, 11, 13, 15][year - 1]), 0.5)) * 10) / 10;
    const missingHours = R.chance([0.05, 0.10, 0.25, 0.40][year - 1]);
    const scholarship = R.chance(clamp(0.1 + 0.25 * (gpa - 2.4), 0.05, 0.6)) ? 'yes' : 'no';
    const entry = Math.round(clamp(N(72, 8.5), 50, 94) * 10) / 10;
    const residence = R.weighted(year === 1 ? [['On campus', 62], ['Off campus', 24], ['Family home', 14]] : [['On campus', 26], ['Off campus', 56], ['Family home', 18]]);
    truth.push({
      student_id: '', programme: R.weighted(PROGRAMMES), year: String(year), gpa: gpa.toFixed(2), credits: String(credits),
      attendance_pct: String(attendance), study_hours: missingHours ? '' : hours.toFixed(1), scholarship, entry_score: entry.toFixed(1), residence,
    });
  }
  truth.sort((a, b) => +a.year - +b.year);
  truth.forEach((o, i) => { o.student_id = `NU-${String(i + 1001)}`; });
  const B = new Builder('northfield-students', NORTH_COLUMNS, truth);

  // genuine extreme entry scores
  const ext = R.shuffle(truth.map((_, i) => i)).slice(0, 3);
  [['98.6', 'An exceptional applicant: extreme but genuine.'], ['97.9', 'An exceptional applicant: extreme but genuine.'], ['38.5', 'Admitted through a foundation year: low but genuine.']].forEach(([v, note], k) => {
    truth[ext[k]].entry_score = v; B.raw[ext[k]].entry_score = v; B.reserved.add(ext[k]);
    B.notable.push({ t: ext[k], kind: 'genuine-outlier', column: 'entry_score', value: v, note });
  });
  // one data-entry error: decimal point lost
  const err = B.take(R, 1, 'entry_score', (o) => /^\d\d\.[1-9]$/.test(o.entry_score) && +o.entry_score > 60)[0];
  B.corrupt(err, 'entry_score', truth[err].entry_score.replace('.', ''), 'outlier-error', { note: 'Data-entry error: the decimal point was lost. Scores run from 0 to 100.' });

  // GPA on a 0–100 scale for transfer records (Northfield's conversion: 0–100 value = 25 × GPA)
  B.take(R, 8, 'gpa', (o) => +o.year >= 2).forEach((t) => {
    const v = Math.round(+truth[t].gpa * 25 * 10) / 10;
    B.corrupt(t, 'gpa', Number.isInteger(v) ? String(v) : v.toFixed(1), 'scale-mix', { note: 'Transfer record on a 0–100 scale. Northfield converts with GPA = value ÷ 25.' });
  });
  // attendance above 100%
  B.take(R, 3, 'attendance_pct', (o) => +o.attendance_pct >= 90 && +o.attendance_pct < 100).forEach((t) => {
    B.corrupt(t, 'attendance_pct', String(101 + R.int(0, 11)), 'out-of-range', { note: 'Above 100%: make-up sessions were counted as extra attended sessions.' });
  });
  // programme spelled several ways
  const progVariants = [
    ['Business Administration', 'business administration', 'case'], ['Business Administration', 'Bus. Admin.', 'abbreviation'], ['Business Administration', 'Bus. Admin.', 'abbreviation'], ['Business Administration', 'Business Admin', 'abbreviation'],
    ['Computer Science', 'Comp. Sci.', 'abbreviation'], ['Computer Science', 'Comp. Sci.', 'abbreviation'], ['Computer Science', 'Computer science', 'case'], ['Computer Science', 'CS', 'acronym'],
    ['Economics', 'Econ.', 'abbreviation'], ['Economics', 'Econ.', 'abbreviation'], ['Economics', 'Economics ', 'whitespace'],
    ['Nursing', 'Nursing ', 'whitespace'], ['Nursing', 'NURSING', 'case'],
    ['Psychology', 'Psych', 'abbreviation'], ['Psychology', 'Pyschology', 'typo'],
    ['Mechanical Engineering', 'Mech. Eng.', 'abbreviation'], ['Mechanical Engineering', 'Mechanical engineering', 'case'],
  ];
  progVariants.forEach(([p, v, variant]) => {
    const t = B.take(R, 1, 'programme', (o) => o.programme === p)[0];
    B.corrupt(t, 'programme', v, 'inconsistent-category', { variant });
  });
  B.notes.push(
    'study_hours (self-reported hours of study per week, from a survey) is blank where the student did not answer; the truth file is blank there too. Response falls with year of study (about 5% missing in year 1, 40% in year 4) and later years study more, so the missingness depends on year (missing at random given year).',
    'study_hours is right-skewed: most students report 5–20 hours, a few report 30 or more.',
  );
  return B.finish({ title: 'Northfield University student records, 2025–26', seed: 20240901, unit: 'one row per student', key: 'student_id' });
}

// ================================================================ README (data dictionary)
const DICT = {
  'lantern-orders': {
    heading: 'lantern-orders.csv — Lantern Coffee Co. online-shop orders',
    about: 'The order export from the online shop of Lantern Coffee Co., a fictional coffee roaster, for 1 March – 30 June 2026. Customers buy bags of beans, a cold-brew pack and a gift box, either as one-off orders or as a monthly subscription delivery. One row per order; `order_id` should identify each order once.',
    columns: [
      ['order_id', 'Order number', 'identifier', '', '`LC-` followed by five digits; unique'],
      ['order_date', 'Date the order was placed', 'date', '', '1 March – 30 June 2026'],
      ['customer_id', 'Customer number (a customer can have several orders)', 'identifier', '', '`C` followed by four digits'],
      ['email', 'Customer e-mail address', 'text', '', 'lower case, no spaces; addresses use the reserved example.com, example.org and example.net domains'],
      ['region', 'Delivery region', 'category', '', 'North, South, East, West, Central'],
      ['product', 'Product name', 'category', '', '11 products, e.g. House Blend 250g, Ethiopia Yirgacheffe 250g, Decaf Colombia 1kg, Cold Brew Pack, Gift Box Trio'],
      ['size_g', 'Pack size', 'number (integer)', 'grams', '250, 480, 750 or 1000'],
      ['quantity', 'Number of packs ordered', 'number (integer)', 'packs', '1 to 200'],
      ['unit_price', 'Price of one pack', 'number', 'US dollars', '$14.00 to $58.00 (the list prices)'],
      ['discount', 'Discount on the whole order (10% for subscribers and bulk orders; $5 promotion codes)', 'number', 'US dollars', '0 or more'],
      ['order_total', 'Amount charged', 'number', 'US dollars', 'quantity × unit_price − discount, to the cent'],
      ['channel', 'Where the order was placed', 'category', '', 'web, app'],
      ['subscription', 'Whether the order is a subscription delivery', 'yes/no', '', 'yes, no'],
      ['rating', 'Customer’s rating of the order', 'number (integer)', 'stars', '1 to 5, or blank if the customer gave no rating'],
    ],
    defects: [
      'Exact duplicate rows (the export repeated some lines).',
      'Order ids that appear twice with a value changed between the copies.',
      'Dates in several formats: ISO (2026-03-04), day/month/year (04/03/2026), month/day/two-digit year (3/14/26), written out (March 5, 2026) and spreadsheet serial numbers (46085). Some slash dates can be read either way.',
      'Prices stored as text, with `$` signs and thousands separators, and one price written with a decimal comma.',
      'Negative, zero and impossible quantities.',
      'Region spelled several ways (case, stray spaces, abbreviations, typing errors).',
      'Product names with stray spaces and inconsistent capitals.',
      'Missing e-mail addresses, and addresses with capitals or stray spaces.',
      'Order totals that don’t equal quantity × unit_price − discount.',
      'One genuine bulk order and one typing-error outlier: extreme values that need different decisions.',
      'Missing ratings. Not every customer rates an order, and whether a rating is missing depends on another column.',
    ],
  },
  'harborview-bookings': {
    heading: 'harborview-bookings.csv — Harborview Hotel bookings',
    about: 'Bookings at the Harborview Hotel, a fictional 80-room hotel, for stays from June 2025 to May 2026. One row per booking; `booking_id` should identify each booking once.',
    columns: [
      ['booking_id', 'Booking reference', 'identifier', '', '`HB-` followed by five digits; unique'],
      ['booked_on', 'Date the booking was made', 'date', '', 'on or before check_in'],
      ['check_in', 'Arrival date', 'date', '', '1 June 2025 – 31 May 2026'],
      ['check_out', 'Departure date', 'date', '', 'after check_in'],
      ['nights', 'Nights booked', 'number (integer)', 'nights', '1 to 14; equals the days between check_in and check_out'],
      ['room_type', 'Room booked', 'category', '', 'Standard, Deluxe, Family, Suite'],
      ['adults', 'Adults in the room', 'number (integer)', 'people', '1 to 4'],
      ['children', 'Children in the room', 'number (integer)', 'people', '0 to 3'],
      ['rate', 'Nightly room rate', 'number', 'US dollars', '$100 to $500'],
      ['channel', 'How the booking was made', 'category', '', 'Direct, OTA (online travel agency), Phone, Corporate, Travel agent'],
      ['country', 'Guest’s country of residence', 'category', '', 'full English country names, e.g. United States, Canada, United Kingdom'],
      ['status', 'Outcome of the booking', 'category', '', 'Completed, Cancelled, No-show'],
      ['total', 'Booked room charge', 'number', 'US dollars', 'nights × rate, for every booking including cancellations'],
    ],
    defects: [
      'Check-out dates before check-in.',
      'Nights that don’t match the dates.',
      'Placeholder rates (0 and 9999).',
      'Country written as codes and as names (US, USA, us, United States …).',
      'Blank `children` that means 0 (the online-travel-agency feed left zeros blank for part of the year).',
      'Duplicate bookings from a channel-manager sync: the same booking twice with different booking ids.',
      'A right-skewed `total`: a few long or suite stays are far above the median, and they are genuine.',
    ],
  },
  'northfield-students': {
    heading: 'northfield-students.csv — Northfield University student records',
    about: 'Records of 150 students at Northfield University, a fictional university, for the 2025–26 academic year. One row per student; `student_id` should identify each student once.',
    columns: [
      ['student_id', 'Student number', 'identifier', '', '`NU-` followed by four digits; unique'],
      ['programme', 'Degree programme', 'category', '', 'Business Administration, Computer Science, Economics, Nursing, Psychology, Mechanical Engineering'],
      ['year', 'Year of study', 'number (integer, ordered)', '', '1, 2, 3, 4'],
      ['gpa', 'Grade point average', 'number', 'points', '0.00 to 4.00'],
      ['credits', 'Credits earned so far', 'number (integer)', 'credits', '0 to 130'],
      ['attendance_pct', 'Share of scheduled sessions attended', 'number', 'percent', '0 to 100'],
      ['study_hours', 'Self-reported hours of study per week (survey)', 'number', 'hours per week', '0 or more, or blank if the student did not answer'],
      ['scholarship', 'Whether the student holds a scholarship', 'yes/no', '', 'yes, no'],
      ['entry_score', 'Score on the entry assessment', 'number', 'points', '0 to 100'],
      ['residence', 'Where the student lives during term', 'category', '', 'On campus, Off campus, Family home'],
    ],
    defects: [
      'GPA on two scales: most records use 0–4, transfer records use 0–100 (Northfield converts with GPA = value ÷ 25).',
      'Attendance above 100%.',
      'Study hours missing more often in some years of study than others.',
      'Programme names spelled several ways (case, stray spaces, abbreviations, an acronym and a typing error).',
      'Right-skewed study hours.',
      'A few extreme entry scores: some genuine, one a data-entry error.',
    ],
  },
};

function readme(results) {
  const L = [];
  L.push('# B02 datasets: data dictionary', '');
  L.push('All data are fictional, generated for teaching. Every business, person, e-mail address and number here is invented; the e-mail addresses use the reserved example.com, example.org and example.net domains.', '');
  L.push('The three files are deliberately messy. Each was generated as a clean table and then given known defects, so the course and the Data Cleaning Lab can check your work. This page describes what each column should contain and which kinds of problem to look for; it does not say where they are.', '');
  L.push('- Encoding: UTF-8, comma-separated, with a header row. Text containing commas is in double quotes.');
  L.push('- Regenerate with `node tools/study-datasets.mjs` (fixed seeds, so the files come out identical).', '');
  for (const [name, d] of Object.entries(DICT)) {
    const m = results[name].manifest;
    L.push(`## ${d.heading}`, '');
    L.push(d.about, '');
    L.push(`${m.rows} rows, ${m.columns.length} columns. ${m.unit[0].toUpperCase()}${m.unit.slice(1)}.`, '');
    L.push('| Column | Meaning | Type | Unit | Valid values |', '|---|---|---|---|---|');
    d.columns.forEach(([c, mean, type, unit, valid]) => L.push(`| \`${c}\` | ${mean} | ${type} | ${unit || '—'} | ${valid} |`));
    L.push('', '**Problems you will find**', '');
    d.defects.forEach((x) => L.push(`- ${x}`));
    L.push('');
  }
  L.push('## For course authors', '');
  L.push('Each dataset has a manifest (`<name>.manifest.json`) listing every injected defect with its row number, column, original and corrupted value, plus the genuine extreme values. Row numbers count data rows from 1 (the header is not counted). The clean truth used by the tests is in `tests/fixtures-study/`.', '');
  return L.join('\n');
}

// ================================================================ build and write
export function buildAll() {
  const results = { 'lantern-orders': lantern(), 'harborview-bookings': harborview(), 'northfield-students': northfield() };
  const files = {};
  for (const [name, r] of Object.entries(results)) {
    files[`assets/data/study/${name}.csv`] = r.csv;
    files[`assets/data/study/${name}.manifest.json`] = `${JSON.stringify(r.manifest, null, 2)}\n`;
    files[`tests/fixtures-study/${name}.truth.csv`] = r.truth;
  }
  files['assets/data/study/README.md'] = readme(results);
  return files;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const files = buildAll();
  const check = process.argv.includes('--check');
  let differ = 0;
  for (const [rel, text] of Object.entries(files)) {
    const p = join(ROOT, rel);
    if (check) {
      const same = existsSync(p) && readFileSync(p, 'utf8') === text;
      if (!same) { differ++; console.log(`differs: ${rel}`); }
    } else {
      mkdirSync(dirname(p), { recursive: true });
      writeFileSync(p, text);
      console.log(`wrote ${rel} (${text.length.toLocaleString('en-US')} bytes)`);
    }
  }
  if (check) { console.log(differ ? `${differ} file(s) differ` : 'all files match a fresh build'); process.exit(differ ? 1 : 0); }
}
