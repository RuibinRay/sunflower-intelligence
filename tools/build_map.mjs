#!/usr/bin/env node
// build_map.mjs — builds assets/data/world-markets.json for the Market map (marketing/map/):
// country outlines as ready-made SVG paths (Equal Earth projection) joined to World Bank GDP and population.
// The page then needs no map library and no network calls beyond this one file.
//
// To rebuild (about a minute; needs Node 18+ and curl):
//   mkdir -p /tmp/map && cd /tmp/map
//   npm i world-atlas@2 topojson-client@3 d3-geo@3
//   curl -LO https://raw.githubusercontent.com/datasets/gdp/main/data/gdp.csv
//   curl -LO https://raw.githubusercontent.com/datasets/population/main/data/population.csv
//   curl -LO https://raw.githubusercontent.com/datasets/country-codes/main/data/country-codes.csv
//   curl -LO https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_populated_places_simple.geojson
//   cd -  &&  node tools/build_map.mjs /tmp/map
//
// Sources: World Bank World Development Indicators (NY.GDP.MKTP.CD, SP.POP.TOTL; CC BY 4.0) as packaged by
// github.com/datasets; outlines and capitals from Natural Earth (public domain) via world-atlas.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = process.argv[2];
if (!SRC) { console.error('usage: node tools/build_map.mjs <folder with the downloads and node_modules>'); process.exit(1); }
const mod = (p) => import(pathToFileURL(join(SRC, 'node_modules', p)).href);
const topo = await mod('topojson-client/src/index.js');
const geo = await mod('d3-geo/src/index.js');

/** RFC 4180 CSV: quoted fields may hold commas and doubled quotes. */
function csv(text) {
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { row.push(f); f = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
    else f += ch;
  }
  if (f !== '' || row.length) { row.push(f); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.length > 1);
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}
const read = (f) => readFileSync(join(SRC, f), 'utf8');

// ---------------------------------------------------------------- countries and regions
const codes = csv(read('country-codes.csv')).filter((c) => c['ISO3166-1-Alpha-3']);
const RENAME = { USA: 'United States', GBR: 'United Kingdom', COD: 'DR Congo', COG: 'Congo', PSE: 'Palestine', MMR: 'Myanmar', CZE: 'Czechia', VAT: 'Vatican City', FSM: 'Micronesia', BIH: 'Bosnia and Herzegovina', MKD: 'North Macedonia', SXM: 'Sint Maarten', MAF: 'St. Martin', KNA: 'St. Kitts and Nevis', LCA: 'St. Lucia', VCT: 'St. Vincent and Grenadines' };
const group = (c) => (c['Region Name'] === 'Americas' ? (c['Sub-region Name'] === 'Northern America' ? 'Northern America' : 'Latin America & Caribbean') : c['Region Name']);
const meta = new Map();
for (const c of codes) {
  meta.set(c['ISO3166-1-Alpha-3'], { iso: c['ISO3166-1-Alpha-3'], num: String(+c['ISO3166-1-numeric']), a2: c['ISO3166-1-Alpha-2'], n: RENAME[c['ISO3166-1-Alpha-3']] || c['CLDR display name'] || c['official_name_en'], r: group(c), sr: c['Sub-region Name'] });
}
meta.set('XKX', { iso: 'XKX', num: '', a2: 'XK', n: 'Kosovo', r: 'Europe', sr: 'Southern Europe' });   // World Bank code; not in ISO 3166
const byNum = new Map([...meta.values()].filter((m) => m.num).map((m) => [m.num, m]));
const byA2 = new Map([...meta.values()].map((m) => [m.a2, m]));

// ---------------------------------------------------------------- World Bank series: latest year from 2021 on, and five years before it
const series = (file) => {
  const out = new Map();
  for (const r of csv(read(file))) {
    const v = +r.Value; if (!meta.has(r['Country Code']) || !Number.isFinite(v)) continue;
    if (!out.has(r['Country Code'])) out.set(r['Country Code'], new Map());
    out.get(r['Country Code']).set(+r.Year, v);
  }
  return out;
};
const GDP = series('gdp.csv'), POP = series('population.csv');
const data = new Map();
for (const [iso, g] of GDP) {
  const years = [...g.keys()].filter((y) => y >= 2021 && POP.get(iso)?.has(y)).sort((a, b) => b - a);
  if (!years.length) continue;
  const y = years[0], p = POP.get(iso);
  data.set(iso, { y, gdp: Math.round(g.get(y)), gdp0: g.has(y - 5) ? Math.round(g.get(y - 5)) : null, pop: Math.round(p.get(y)), pop0: p.has(y - 5) ? Math.round(p.get(y - 5)) : null });
}

// ---------------------------------------------------------------- capitals (Natural Earth) for distances
const caps = new Map();
for (const f of JSON.parse(read('ne_50m_populated_places_simple.geojson')).features) {
  const p = f.properties; if (p.adm0cap !== 1) continue;
  const m = p.adm0_a3 === 'KOS' ? meta.get('XKX') : byA2.get(p.iso_a2) || meta.get(p.adm0_a3);
  if (!m) continue;
  const prev = caps.get(m.iso);
  if (!prev || (p.featurecla === 'Admin-0 capital' && p.pop_max > prev.pop)) caps.set(m.iso, { lat: +p.latitude.toFixed(3), lon: +p.longitude.toFixed(3), pop: p.pop_max });
}

// ---------------------------------------------------------------- geometry
const atlas = (f) => { const w = JSON.parse(read(`node_modules/world-atlas/${f}`)); return topo.feature(w, w.objects.countries).features; };
const isoOf = (feat) => (feat.id != null ? byNum.get(String(+feat.id))?.iso : feat.properties.name === 'Kosovo' ? 'XKX' : null);
const f110 = atlas('countries-110m.json').filter((f) => f.id !== '010');           // drop Antarctica
const f50 = atlas('countries-50m.json').filter((f) => f.id !== '010');
const W = 960;
const projection = geo.geoEqualEarth().fitWidth(W, { type: 'FeatureCollection', features: f110 });
const path = geo.geoPath(projection).digits(1);
const [[, y0], [, y1]] = path.bounds({ type: 'FeatureCollection', features: f110 });
projection.translate([projection.translate()[0], projection.translate()[1] - y0 + 4]);
const H = Math.ceil(y1 - y0 + 8);
const r1 = (v) => Math.round(v * 10) / 10;
/** Rewrites d3's absolute path (M…L…Z, 0.1 px) as relative moves on the same rounded points: a third smaller, no drift. */
function compactPath(d) {
  const fmt = (t) => (t / 10).toString().replace(/^(-?)0\./, '$1.');
  const pair = (a, b) => { const fa = fmt(a), fb = fmt(b); return fa + (fb.startsWith('-') ? '' : ',') + fb; };
  let out = '';
  for (const ring of d.split('M').filter(Boolean)) {
    const pts = ring.replace(/Z$/, '').split('L').map((p) => p.split(',').map((v) => Math.round(+v * 10)));
    const steps = [];
    for (let i = 1; i < pts.length; i++) {
      const [dx, dy] = [pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]];
      if (dx || dy) steps.push(pair(dx, dy));
    }
    if (steps.length < 2) continue;                       // a ring that rounds to a dot or a line
    out += `M${pair(pts[0][0], pts[0][1])}l${steps.map((p, i) => (i && !p.startsWith('-') ? ' ' : '') + p).join('')}${ring.endsWith('Z') ? 'z' : ''}`;
  }
  return out;
}
/** The largest polygon of a feature: its centre stands for the country (France without Guiana, the US without Alaska). */
function mainPart(feat) {
  const g = feat.geometry;
  if (g.type !== 'MultiPolygon') return feat;
  let best = null, area = -1;
  for (const coords of g.coordinates) { const f = { type: 'Feature', geometry: { type: 'Polygon', coordinates: coords } }; const a = geo.geoArea(f); if (a > area) { area = a; best = f; } }
  return best;
}

const countries = new Map();
const unnamed = [];
for (const f of f110) {
  const iso = isoOf(f);
  const m = iso ? meta.get(iso) : null;
  const key = iso || `X-${f.properties.name}`;
  if (!iso) unnamed.push(f.properties.name);
  const b = path.bounds(f), c = path.centroid(mainPart(f));
  countries.set(key, { iso: iso || '', a2: m ? m.a2 : '', n: m ? m.n : f.properties.name, r: m ? m.r : '', sr: m ? m.sr : '', d: compactPath(path(f)), c: [r1(c[0]), r1(c[1])], b: b.flat().map(r1) });
}
// countries too small for the 110m outlines but with data become dots, placed from the 50m outlines (or the capital)
for (const f of f50) {
  const iso = isoOf(f);
  if (!iso || countries.has(iso) || !data.has(iso)) continue;
  const m = meta.get(iso), c = path.centroid(mainPart(f));
  countries.set(iso, { iso, a2: m.a2, n: m.n, r: m.r, sr: m.sr, d: null, c: [r1(c[0]), r1(c[1])], b: [r1(c[0]), r1(c[1]), r1(c[0]), r1(c[1])] });
}
for (const iso of data.keys()) {
  if (countries.has(iso)) continue;
  const m = meta.get(iso), cap = caps.get(iso);
  if (!cap) { console.warn('no outline or capital for', iso, m.n); continue; }
  const p = projection([cap.lon, cap.lat]);
  countries.set(iso, { iso, a2: m.a2, n: m.n, r: m.r, sr: m.sr, d: null, c: [r1(p[0]), r1(p[1])], b: [r1(p[0]), r1(p[1]), r1(p[0]), r1(p[1])] });
}
// attach data and the capital (falls back to the centre of the main landmass)
const out = [];
for (const c of countries.values()) {
  const d = data.get(c.iso);
  const cap = caps.get(c.iso);
  let ll = cap ? [cap.lat, cap.lon] : null;
  if (!ll && c.iso) { const inv = projection.invert(c.c); ll = [+inv[1].toFixed(3), +inv[0].toFixed(3)]; }
  out.push({ ...c, ll, ...(d || {}) });
}
out.sort((a, b) => a.n.localeCompare(b.n, 'en'));

// a view box per region, from a longitude/latitude window sampled along its edges
const WINDOWS = { Africa: [-20, 55, -36, 38], Asia: [25, 150, -12, 56], Europe: [-25, 60, 34, 71], 'Latin America & Caribbean': [-118, -33, -56, 33], 'Northern America': [-170, -50, 14, 76], Oceania: [110, 180, -48, 2] };
const views = {};
for (const [name, [lo0, lo1, la0, la1]] of Object.entries(WINDOWS)) {
  const pts = [];
  for (let k = 0; k <= 40; k++) { const lo = lo0 + (k / 40) * (lo1 - lo0), la = la0 + (k / 40) * (la1 - la0); pts.push([lo, la0], [lo, la1], [lo0, la], [lo1, la]); }
  const xy = pts.map((p) => projection(p));
  views[name] = [Math.min(...xy.map((p) => p[0])), Math.min(...xy.map((p) => p[1])), Math.max(...xy.map((p) => p[0])), Math.max(...xy.map((p) => p[1]))].map(r1);
}
const withData = out.filter((c) => c.gdp != null);
const missingMap = [...data.keys()].filter((iso) => !countries.has(iso));
const noData = out.filter((c) => c.gdp == null).map((c) => c.n);
const doc = {
  meta: {
    width: W, height: H, projection: 'Equal Earth', views, sphere: compactPath(path({ type: 'Sphere' })),
    built: new Date().toISOString().slice(0, 10),
    note: 'GDP in current US dollars and population, World Bank; latest year from 2021 on (2023 for most). Base year for growth is five years earlier.',
    sources: ['World Bank, World Development Indicators: NY.GDP.MKTP.CD and SP.POP.TOTL (CC BY 4.0), via github.com/datasets/gdp and github.com/datasets/population', 'Natural Earth outlines and capitals (public domain), via world-atlas'],
  },
  countries: out,
};
writeFileSync(join(ROOT, 'assets/data/world-markets.json'), JSON.stringify(doc));
const years = {}; withData.forEach((c) => { years[c.y] = (years[c.y] || 0) + 1; });
console.log(`${out.length} map entries (${out.filter((c) => c.d).length} outlines, ${out.filter((c) => !c.d).length} dots), ${withData.length} with data; years`, years);
console.log('with data but not on the map:', missingMap.length ? missingMap.join(', ') : 'none');
console.log('on the map without data:', noData.join(', '));
console.log('outlines without an ISO code:', unnamed.join(', '));
console.log('no capital (centre used):', out.filter((c) => c.iso && !caps.has(c.iso)).map((c) => c.iso).join(', ') || 'none');
console.log('size', JSON.stringify(doc).length, 'bytes; map', W, '×', H);
