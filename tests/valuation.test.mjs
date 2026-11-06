// Run: node tests/valuation.test.mjs   (compares assets/js/core/valuation.js with figures worked independently in
// Python, tests/make_fixtures_valuation.py, then checks the engine's edge cases, the example company and the importers)
import { readFileSync } from 'node:fs';
import * as V from '../assets/js/core/valuation.js';
import * as IO from '../assets/js/core/valuation-io.js';
import * as E from '../assets/js/core/valuation-edgar.js';
import { buildReport, reportToMarkdown } from '../assets/js/core/valuation-report.js';
import { EXAMPLE } from '../assets/js/data/valuation-example.js';
import { parseTable } from '../assets/js/core/csv.js';

const fx = JSON.parse(readFileSync(new URL('./fixtures-valuation.json', import.meta.url)));
let fails = 0, checks = 0;
const close = (label, got, want, tol = 1e-9) => {
  checks++;
  const ok = typeof got === 'number' && Number.isFinite(got) && Math.abs(got - want) <= tol * Math.max(1, Math.abs(want));
  if (!ok) { fails++; console.log(`FAIL ${label}: got ${got}, want ${want}`); }
};
const truth = (label, cond) => { checks++; if (!cond) { fails++; console.log(`FAIL ${label}`); } };

// ---------------------------------------------------------------- the fixture company
const project = { meta: { unit: 1e6, unitLabel: 'millions' }, history: fx.inputs.history, market: fx.inputs.market, peers: fx.inputs.peers, models: { dcf: true, comps: true, ddm: true, asset: true, fcfe: true } };
const A = fx.inputs.assumptions;
const L = V.latest(project).p;
for (const [k, v] of Object.entries(fx.derived)) close(`derived ${k}`, L[k], v);
const Hs = V.historical(project);
close('revenue growth 2024', Hs[1].growth.revenue, fx.history_growth.revenue[1]);
close('revenue growth 2025', Hs[2].growth.revenue, fx.history_growth.revenue[2]);

const d = V.dcf(project, A);
truth('dcf ok', d.ok);
close('wacc', d.cc.wacc, fx.dcf.base.wacc);
close('cost of equity', d.cc.ke, fx.dcf.base.ke);
close('equity weight', d.cc.we, fx.dcf.base.we);
fx.dcf.rows.forEach((row, i) => {
  for (const k of ['revenue', 'ebitda', 'da', 'ebit', 'tax', 'nopat', 'capex', 'nwc', 'dNwc', 'fcff', 'interest', 'netIncome', 'netBorrowing', 'fcfe']) close(`forecast y${i + 1} ${k}`, d.rows[i][k], row[k]);
  close(`pv y${i + 1}`, d.rows[i].pv, fx.dcf.pv[i]);
});
for (const k of ['sumPv', 'tv', 'pvTV', 'ev', 'equity', 'perShare', 'tvShare', 'impliedMultiple', 'upside']) close(`dcf ${k}`, d[k], fx.dcf.base[k]);
const dm = V.dcf(project, { ...A, midYear: true });
for (const k of ['sumPv', 'pvTV', 'ev', 'perShare']) close(`dcf mid-year ${k}`, dm[k], fx.dcf.mid[k]);
const dx = V.dcf(project, { ...A, terminal: { ...A.terminal, method: 'exit' } });
for (const k of ['tv', 'pvTV', 'ev', 'perShare', 'impliedGrowth']) close(`dcf exit ${k}`, dx[k], fx.dcf.exit[k]);
const fe = V.fcfe(project, A);
for (const k of ['ke', 'sumPv', 'tv', 'pvTV', 'equity', 'perShare']) close(`fcfe ${k}`, fe[k], fx.fcfe[k]);

// sensitivity and scenarios
[-0.01, 0, 0.01].forEach((dw, i) => [-0.005, 0, 0.005].forEach((dg, j) => close(`sensitivity ${i},${j}`, V.dcf(project, V.applyDeltas(A, { wacc: dw, gT: dg })).perShare, fx.sensitivity[i][j])));
const sc = V.runScenarios(project, A, V.DEFAULT_SCENARIOS, []);
close('bear per share', sc.scenarios.bear.result.perShare, fx.scenarios.bear);
close('bull per share', sc.scenarios.bull.result.perShare, fx.scenarios.bull);
close('weighted per share', sc.weighted, fx.scenarios.weighted);
const risk = V.newRisk('commodity', { effect: { margin: -0.015, kd: 0.01 }, applyTo: 'bear' });
close('bear with a risk effect', V.runScenarios(project, A, V.DEFAULT_SCENARIOS, [risk]).scenarios.bear.result.perShare, fx.scenarios.bearRisk);
truth('risk effects ignore WACC bumps', V.riskEffects([V.newRisk('leverage', { effect: { wacc: 0.02 }, applyTo: 'bear' })], 'bear').flags.length === 1 && Object.keys(V.riskEffects([V.newRisk('leverage', { effect: { wacc: 0.02 }, applyTo: 'bear' })], 'bear').deltas).length === 0);

// comparables
const c = V.comparables(project);
truth('comps ok', c.ok);
for (const t of c.table) {
  const want = fx.comps[t.id];
  truth(`${t.name} peer count`, t.stats.n === want.stats.n);
  for (const k of ['mean', 'median', 'min', 'max', 'q1', 'q3']) close(`${t.name} ${k}`, t.stats[k], want.stats[k]);
  for (const k of ['q1', 'median', 'mean', 'q3']) { close(`${t.name} implied ${k} equity`, t.implied[k].equity, want.implied[k].equity); close(`${t.name} implied ${k} per share`, t.implied[k].perShare, want.implied[k].perShare); }
  close(`${t.name} own multiple`, t.own, want.own);
}
truth('a loss-making peer drops out of P/E', c.table.find((t) => t.id === 'pe').values[3] === null);

// dividends, assets, earnings, venture capital
const dd = V.ddm(project, { g1: 0.06, gT: 0.025, ke: fx.ddm.ke, stages: [{ years: 5, growth: 0.06 }] });
close('dps', dd.dps, fx.ddm.dps); close('gordon', dd.gordon.value, fx.ddm.gordon); close('multi-stage', dd.multi.value, fx.ddm.multi);
const ab = V.assetBased(project, { adjustments: { ppeNet: 0.2 } });
close('book', ab.book, fx.asset.book); close('tangible book', ab.tangible, fx.asset.tangible); close('adjusted NAV', ab.adjustedNav, fx.asset.adjustedNav);
close('orderly liquidation', ab.orderly.net, fx.asset.orderly.net); close('forced liquidation', ab.forced.net, fx.asset.forced.net);
const eb = V.earningsBased(project, A, { pe: 15, growth: 0.02 });
close('capitalised earnings', eb.capitalised, fx.earnings.capitalised); close('EPV enterprise', eb.epvEv, fx.earnings.epvEv); close('EPV equity', eb.epv.equity, fx.earnings.epvEquity); close('P/E value', eb.peValue, fx.earnings.peValue);
const vc = V.vcMethod({ exitYear: 5, exitMetric: 300, exitMultiple: 9, targetReturn: 0.3, investment: 100 });
close('vc exit value', vc.exitValue, fx.vc.exitValue); close('vc post-money', vc.postMoney, fx.vc.postMoney); close('vc pre-money', vc.preMoney, fx.vc.preMoney); close('vc ownership', vc.ownership, fx.vc.ownership);
const sp = V.fcfGrowthDcf({ fcf0: 120, g1: 0.09, years: 5, path: 'fade', wacc: 0.09, gT: 0.025, mid: false, debt: 300, shares: 85 });
close('simple DCF ev', sp.ev, fx.simple.ev); close('simple DCF per share', sp.perShare, fx.simple.perShare);
close('simple DCF mid-year ev', V.fcfGrowthDcf({ fcf0: 120, g1: 0.09, years: 5, path: 'fade', wacc: 0.09, gT: 0.025, mid: true, debt: 300, shares: 85 }).ev, fx.simpleMid.ev);

// ---------------------------------------------------------------- edge cases
truth('WACC below terminal growth is refused', !!V.dcf(project, { ...A, terminal: { ...A.terminal, growth: 0.09 } }).error);
truth('cost of equity below growth is refused in the DDM', !!V.gordon({ d0: 1, g: 0.1, ke: 0.08 }).error);
{
  const loss = { ...project, history: project.history.map((h) => ({ ...h, opex: h.opex + 400 })) };
  const Al = V.defaultAssumptions(loss);
  const r = V.dcf(loss, Al);
  truth('negative earnings: no tax is charged on losses', r.ok && r.rows.every((x) => x.tax === 0));
  truth('negative free cash flow in the final year warns', r.warnings.some((w) => w.title.includes('negative free cash flow')));
  truth('negative earnings flags earnings-based values', V.earningsBased(loss, Al).warnings.some((w) => w.kind === 'bad'));
  truth('the guide turns cautious on losses', V.modelGuide(V.profileOf(loss)).find((g) => g.id === 'earnings').fit === 'unsuitable');
}
truth('no dividends: DDM says so', !!V.ddm({ ...project, history: project.history.map((h) => ({ ...h, dividends: 0 })) }, { g1: 0.05, gT: 0.02, ke: 0.09 }).error);
truth('a bank is steered away from FCFF', V.modelGuide({ industry: 'bank', paysDividends: true }).find((g) => g.id === 'dcf').fit === 'unsuitable');
truth('a start-up is steered to the VC method', V.modelGuide({ maturity: 'startup', fcfPositive: false, profitable: false }).find((g) => g.id === 'vc').fit === 'recommended');
{
  const bad = { meta: { unit: 1e6, unitLabel: 'millions' }, history: [{ year: 2024, revenue: 100, cogs: 60, grossProfit: 50, totalAssets: 500, totalLiabilities: 300, equity: 150 }, { year: 2024, revenue: 110 }] };
  const w = V.validate(bad);
  truth('duplicate years are errors', w.some((x) => x.level === 'error' && /Duplicate/.test(x.text)));
  truth('gross profit mismatch is warned', w.some((x) => x.where === 'grossProfit'));
  truth('balance sheet mismatch is warned', w.some((x) => x.where === 'totalAssets'));
  truth('missing inputs are listed per model', V.missingFor(bad, 'dcf').missing.includes('ebit'));
}
truth('capex entered negative is used by size and disclosed', V.derive({ capex: -40, cfo: 100 }).p.fcf === 60 && !!V.derive({ capex: -40 }).how.capex);
{
  const mc = V.monteCarlo(project, A, { n: 400, seed: 3 });
  truth('Monte Carlo percentiles are ordered', mc.ok && mc.p5 <= mc.p25 && mc.p25 <= mc.p50 && mc.p50 <= mc.p75 && mc.p75 <= mc.p95);
  truth('Monte Carlo is reproducible', V.monteCarlo(project, A, { n: 400, seed: 3 }).p50 === mc.p50);
  truth('Monte Carlo centres near the base case', Math.abs(mc.p50 / d.perShare - 1) < 0.15);
}

// ---------------------------------------------------------------- the example company
{
  const w = V.validate(EXAMPLE);
  truth('example: no errors or warnings in its statements', !w.some((x) => x.level !== 'info'));
  const Ae = V.defaultAssumptions(EXAMPLE);
  const all = V.valueAll(EXAMPLE, Ae);
  truth('example: every enabled model runs', ['dcf', 'comps', 'ddm', 'asset'].every((k) => all.results[k]?.ok));
  truth('example: per-share value is sensible', all.results.dcf.perShare > 15 && all.results.dcf.perShare < 80);
  truth('example: football field has bars', all.football.length >= 5);
  const H = V.history(EXAMPLE);
  truth('example: balance sheets balance', H.every(({ p }) => Math.abs(p.totalAssets - p.totalLiabilities - p.equity) < 0.2));
  for (let i = 1; i < H.length; i++) truth(`example: ${H[i].year} cash flows explain cash`, Math.abs(H[i].p.cfo + H[i].p.investingCF + H[i].p.financingCF - (H[i].p.cash - H[i - 1].p.cash)) < 0.2);
  const rep = buildReport(EXAMPLE, Ae, all, { validation: w, historical: V.historical(EXAMPLE), guide: V.modelGuide(V.profileOf(EXAMPLE)) });
  truth('report has the twelve sections', rep.sections.length === 12);
  const md = reportToMarkdown(rep);
  truth('report numbers match the workspace', md.includes(rep.format.money(all.results.dcf.ev)) && md.includes(rep.format.perShare(all.results.dcf.perShare)));
  truth('report labels evidence kinds', rep.sections.some((s) => s.blocks.some((b) => b.tag === 'assumption')) && rep.sections.some((s) => s.blocks.some((b) => b.tag === 'verified')));
  truth('report never issues a buy or sell call', !/\b(buy|sell) (recommendation|rating)\b/i.test(md) && !/\bwe recommend (buying|selling)\b/i.test(md));
  // save and reload
  const json = IO.serializeProject(EXAMPLE, Ae);
  const back = IO.parseProject(json);
  truth('project round-trips through JSON', !back.error && back.project.history.length === 5 && back.assumptions.horizon === Ae.horizon);
  truth('project JSON refuses junk', !!IO.parseProject('{"hello": 1}').error && !!IO.parseProject('not json').error);
}

// ---------------------------------------------------------------- importers: a statement table with years in columns
{
  const csv = ['Line item,FY2023,FY2024,FY2025', 'Total revenue,"900,000","990,000","1,080,000"', 'Cost of sales,540000,590000,640000', 'SG&A,220000,240000,258000', 'Depreciation & amortization,36000,40000,43000', 'Interest expense,14000,15000,15000', 'Provision for income taxes,22000,26000,31000', 'Cash and cash equivalents,70000,85000,104000', 'Accounts receivable net,100000,110000,118000', 'Inventories,80000,86000,92000', 'Property plant and equipment net,360000,372000,382000', 'Total assets,"695,000","738,000","783,000"', 'Accounts payable,60000,66000,72000', 'Long-term debt,280000,280000,280000', 'Total liabilities,"445,000","471,000","497,000"', 'Total stockholders equity,245000,262000,281000', 'Net cash provided by operating activities,100000,118000,132000', 'Purchases of property and equipment,"(45,000)","(50,000)","(52,000)"'].join('\n');
  const t = parseTable(csv);
  const m = IO.mapStatementTable(t);
  truth('importer finds years in the columns', m.orientation === 'years-in-columns' && m.years.join() === '2023,2024,2025');
  const f = (label) => m.rows.find((r) => r.label === label)?.field;
  truth('importer maps revenue', f('Total revenue') === 'revenue');
  truth('importer maps cost of sales', f('Cost of sales') === 'cogs');
  truth('importer maps SG&A to operating expenses', f('SG&A') === 'opex');
  truth('importer maps D&A', f('Depreciation & amortization') === 'da');
  truth('importer maps capex and keeps the sign for review', f('Purchases of property and equipment') === 'capex' && m.rows.find((r) => r.field === 'capex').values[0] === -45000);
  truth('importer guesses thousands', m.unitGuess.unit === 1e3);
  const h = IO.applyMapping(m, m.rows, { unit: 1e3, targetUnit: 1e6 });
  truth('applied mapping converts units and years', h.history.length === 3 && h.history[2].year === 2025 && Math.abs(h.history[2].revenue - 1080) < 1e-9 && h.history[2].capex === 52);
  const dupes = IO.mapStatementTable(parseTable('Line item,2024,2024\nRevenue,1,2'));
  truth('importer flags duplicate periods', dupes.warnings.some((w) => /duplicate/i.test(w)));
  const rowsT = IO.mapStatementTable(parseTable('Year,Revenue,Net income,Total assets\n2023,900,60,695\n2024,990,70,738'));
  truth('importer handles years in rows', rowsT.orientation === 'years-in-rows' && rowsT.rows.find((r) => r.field === 'netIncome')?.values[1] === 70);
}

// ---------------------------------------------------------------- SEC companyfacts mapping
{
  const facts = { entityName: 'Test Corp', cik: 1, facts: { 'us-gaap': {
    Revenues: { units: { USD: [
      { start: '2022-01-01', end: '2022-12-31', val: 100e6, fy: 2022, fp: 'FY', form: '10-K', filed: '2023-02-20', accn: '1', frame: 'CY2022' },
      { start: '2023-01-01', end: '2023-12-31', val: 120e6, fy: 2023, fp: 'FY', form: '10-K', filed: '2024-02-20', accn: '2', frame: 'CY2023' },
      { start: '2023-01-01', end: '2023-12-31', val: 121e6, fy: 2024, fp: 'FY', form: '10-K', filed: '2025-02-20', accn: '3' },   // restated the year after
      { start: '2023-10-01', end: '2023-12-31', val: 35e6, fy: 2023, fp: 'Q4', form: '10-K', filed: '2024-02-20', accn: '2' },   // a quarter inside a 10-K: skipped
    ] } },
    NetIncomeLoss: { units: { USD: [{ start: '2023-01-01', end: '2023-12-31', val: 9e6, fy: 2023, fp: 'FY', form: '10-K', filed: '2024-02-20', accn: '2', frame: 'CY2023' }] } },
    Assets: { units: { USD: [{ end: '2023-12-31', val: 500e6, fy: 2023, fp: 'FY', form: '10-K', filed: '2024-02-20', accn: '2', frame: 'CY2023I' }] } },
    PaymentsToAcquirePropertyPlantAndEquipment: { units: { USD: [{ start: '2023-01-01', end: '2023-12-31', val: 7e6, fy: 2023, fp: 'FY', form: '10-K', filed: '2024-02-20', accn: '2', frame: 'CY2023' }] } },
    WeightedAverageNumberOfDilutedSharesOutstanding: { units: { shares: [{ start: '2023-01-01', end: '2023-12-31', val: 10e6, fy: 2023, fp: 'FY', form: '10-K', filed: '2024-02-20', accn: '2', frame: 'CY2023' }] } },
  } } };
  const r = E.factsToHistory(facts, { unit: 1e6 });
  truth('EDGAR: one row per fiscal year, latest filing wins', r.history.length === 2 && r.history[1].year === 2023 && r.history[1].revenue === 121);
  truth('EDGAR: quarters inside a 10-K are skipped', r.history[0].revenue === 100);
  truth('EDGAR: instants and shares map', r.history[1].totalAssets === 500 && r.history[1].shares === 10 && r.history[1].capex === 7 && r.history[1].netIncome === 9);
  truth('EDGAR: the source names the tag and filing', r.source.tags.revenue === 'Revenues' && r.source.periods.find((p) => p.year === 2023).accn === '3');
  truth('EDGAR: ticker lookup', E.lookupTicker('aapl')[0].cik === 320193 && E.lookupTicker('micro').some((x) => x.ticker === 'MSFT'));
  truth('EDGAR: the companyfacts URL pads the CIK', E.factsUrl(320193).endsWith('CIK0000320193.json'));
}

console.log(`${checks - fails}/${checks} valuation checks passed`);
if (fails) process.exit(1);
