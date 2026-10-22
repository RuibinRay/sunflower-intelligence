// Run: node tests/mkt.test.mjs   (compares assets/js/core/market.js with NumPy/pandas/scikit-learn fixtures,
// made by tests/make_fixtures_mkt.py, and checks the map data file joins up)
import { readFileSync } from 'node:fs';
import * as M from '../assets/js/core/market.js';
import { parseTable } from '../assets/js/core/csv.js';
import { kmeans, silhouette, standardise } from '../assets/js/core/classify.js';

const fx = JSON.parse(readFileSync(new URL('./fixtures-mkt.json', import.meta.url)));
const doc = JSON.parse(readFileSync(new URL('../assets/data/world-markets.json', import.meta.url)));
let fails = 0, checks = 0;
const close = (label, got, want, tol = 1e-9) => {
  checks++;
  const ok = Math.abs(got - want) <= tol * Math.max(1, Math.abs(want));
  if (!ok) { fails++; console.log(`FAIL ${label}: got ${got}, want ${want}`); }
};
const truthy = (label, ok, detail = '') => { checks++; if (!ok) { fails++; console.log(`FAIL ${label} ${detail}`); } };

// ---------------------------------------------------------------- geography and growth
for (const [a, b, km] of fx.haversine) close(`haversine ${a} → ${b}`, M.haversine(a, b), km, 1e-12);
close('reach is 100 at home', M.reachScore(0), 100, 1e-12);
close('reach is 0 on the far side', M.reachScore(M.HALF_EARTH_KM), 0, 1e-12);
for (const [e, s, y, w] of fx.cagr) close(`CAGR ${s} → ${e} over ${y}`, M.cagr(e, s, y), w, 1e-12);
truthy('CAGR refuses a non-positive start', Number.isNaN(M.cagr(10, 0, 5)));

// ---------------------------------------------------------------- rescaling
const rv = fx.rescale.values;
const cmp = (label, got, want) => want.forEach((w, i) => close(`${label}[${i}]`, got[i], w, 1e-10));
cmp('rescale capped at the 5th/95th percentiles', M.rescale(rv), fx.rescale.plain);
cmp('rescale on a log scale', M.rescale(rv, { log: true }), fx.rescale.log);
cmp('rescale, lower is better', M.rescale(rv, { higherIsBetter: false }), fx.rescale.lower);
cmp('rescale without a cap', M.rescale(rv, { cap: null }), fx.rescale.nocap);

// ---------------------------------------------------------------- attractiveness on the real data
const rows = doc.countries.filter((c) => c.gdp != null).map((c) => ({ iso: c.iso, r: c.r, ...M.measures(c) }));
truthy('countries with data', rows.length === fx.attract.n, `${rows.length} vs ${fx.attract.n}`);
for (const [iso, want] of Object.entries(fx.attract.measures)) {
  const r = rows.find((x) => x.iso === iso);
  ['gdp', 'gdppc', 'growth', 'pop', 'popGrowth'].forEach((k, j) => close(`${iso} ${k}`, r[k], want[j], 1e-12));
}
const F = (w) => [{ key: 'gdp', weight: w[0], log: true }, { key: 'gdppc', weight: w[1], log: true }, { key: 'growth', weight: w[2] }, { key: 'popGrowth', weight: w[3] }];
const scoreCheck = (label, rs, w, want) => {
  const { score } = M.attractiveness(rs, F(w));
  const got = Object.fromEntries(rs.map((r, i) => [r.iso, score[i]]).filter(([, v]) => Number.isFinite(v)));
  truthy(`${label}: same countries scored`, Object.keys(got).length === Object.keys(want).length, `${Object.keys(got).length} vs ${Object.keys(want).length}`);
  for (const [iso, v] of Object.entries(want)) close(`${label} ${iso}`, got[iso], v, 1e-10);
};
scoreCheck('attractiveness, default weights', rows, [35, 25, 25, 15], fx.attract.default);
scoreCheck('attractiveness, Europe only', rows.filter((r) => r.r === 'Europe'), [35, 25, 25, 15], fx.attract.europe);
scoreCheck('attractiveness, wealth and growth only', rows, [0, 60, 40, 0], fx.attract.alt);
{ const rk = M.rankDesc([5, NaN, 9, 5, 1]); truthy('ranks: ties share, NaN unranked', JSON.stringify(rk) === JSON.stringify([2, null, 1, 2, 4]), JSON.stringify(rk)); }

// ---------------------------------------------------------------- segment profiles
const P = fx.profile;
M.indexVsAverage(P.X, P.labels, 3).forEach((row, g) => row.forEach((v, j) => close(`index vs average g${g} c${j}`, v, P.index[g][j], 1e-12)));
M.segmentSizes(P.labels, 3, P.spend).forEach((s, g) => {
  close(`segment ${g} size`, s.n, P.n[g]); close(`segment ${g} share of spend`, s.spendShare, P.spendShare[g], 1e-12); close(`segment ${g} spend per head`, s.perHead, P.perHead[g], 1e-12);
});
const T = fx.target;
const fit = M.needsFit(T.centres, T.strengths);
fit.forEach((v, g) => close(`needs fit ${g}`, v, T.fit[g], 1e-12));
M.targetScores({ share: T.share, perHead: T.perHead, fit }, { size: 30, spend: 30, fitW: 40 }).total.forEach((v, g) => close(`target score ${g}`, v, T.total[g], 1e-12));
{
  const names = M.nameSegments([[130, 112, 90], [95, 100, 104], [130, 112, 90]], ['price', 'quality', 'advice']);
  truthy('segment names', JSON.stringify(names) === JSON.stringify(['A · Price and quality', 'B · No strong lean', 'C · Price and quality (2)']), JSON.stringify(names));
}

// ---------------------------------------------------------------- k-means on the example survey: same optimum as scikit-learn
const sv = M.shopperSurvey();
const t = parseTable(sv.csv);
truthy('survey rows', t.nRows === fx.survey.rows);
const cols = sv.needs.map((n) => t.columns.find((c) => c.name === n).values);
cols.forEach((c, j) => close(`survey mean ${sv.needs[j]}`, c.reduce((a, v) => a + v, 0) / c.length, fx.survey.means[j], 1e-12));
const { rows: Z } = standardise(cols);
for (const k of [3, 5]) {
  const km = kmeans(Z, k);
  close(`survey k-means inertia, k = ${k}`, km.inertia, fx.survey.kmeans[k].inertia, 1e-8);
  close(`survey silhouette, k = ${k}`, silhouette(Z, km.labels), fx.survey.kmeans[k].silhouette, 1e-8);
}

// ---------------------------------------------------------------- the map file joins up
const withData = doc.countries.filter((c) => c.gdp != null);
const unplaced = withData.filter((c) => !c.d && !(Array.isArray(c.c) && c.c.every(Number.isFinite)));
truthy('every country with data has an outline or a dot', unplaced.length === 0, unplaced.map((c) => c.n).join(', '));
const noLoc = withData.filter((c) => !(Array.isArray(c.ll) && c.ll.every(Number.isFinite)));
truthy('every country with data has a location for distances', noLoc.length === 0, noLoc.map((c) => c.n).join(', '));
const isoDup = withData.map((c) => c.iso).filter((v, i, a) => a.indexOf(v) !== i);
truthy('no duplicate country codes', isoDup.length === 0, isoDup.join(', '));
truthy('years are recent', withData.every((c) => c.y >= 2021 && c.y <= 2025));
console.log(`map file: ${doc.countries.length} entries, ${withData.length} with data; on the map without data: ${doc.countries.filter((c) => c.gdp == null).map((c) => c.n).join(', ')}`);

console.log(fails ? `${fails} of ${checks} checks failed` : `all ${checks} checks passed`);
process.exit(fails ? 1 : 0);
