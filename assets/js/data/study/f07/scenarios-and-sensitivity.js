// scenarios-and-sensitivity.js — F07 · Scenarios and sensitivity. Content only; exercises are in
// scenarios-and-sensitivity.ex.js. Every figure comes from case.js: scenario() runs the whole linked model (and its DCF)
// on changed assumptions; SCENARIO_RESULTS holds the scenarios the lesson compares; MODEL and VALUATION the base case.
import { scenario, SCENARIO_RESULTS as S, SCENARIOS, MODEL as M, VALUATION as V, dcf, FINANCE } from './case.js?v=38';

const n = (x) => (Math.round(x) + 0).toLocaleString('en-US');
const pc = (x, d = 1) => `${(x * 100).toFixed(d)}%`;
const base = S.base;
const minLoan = (set) => { let lo = 60000, hi = 400000; for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (scenario({ ...set, termAmount: mid }).passes) hi = mid; else lo = mid; } return hi; };
const needBase = minLoan({}), needSlow = minLoan(SCENARIOS.slow.set);
const b80 = scenario({ termAmount: 80000 }), s80 = scenario({ ...SCENARIOS.slow.set, termAmount: 80000 });
const TORNADO = [
  ['Cold Brew cans: 25% fewer / 25% more', { cans: 0.75 }, { cans: 1.25 }],
  ['Online growth: halved / half as much again', { online: 0.5 }, { online: 1.5 }],
  ['Café growth: 2% / 6% a year', { cafeGrowth: 0.02 }, { cafeGrowth: 0.06 }],
  ['Kitchen opens 1 July / 1 April', { opensMonth: 7 }, {}],
].map(([name, lo, hi]) => { const a = scenario(lo), b = scenario(hi); return { name, lo: a.ratios[0], hi: b.ratios[0], eLo: a.equity, eHi: b.equity }; });
const W = [0.0916, 0.1016, V.wacc, 0.1216, 0.1316], G = [0.015, 0.02, 0.025, 0.03, 0.035];
const grid = W.map((w) => G.map((g) => dcf(M, { ...V, wacc: w, terminalGrowth: g }).equity));
const Y = M.years.map((y) => `${y}`);
const rat = (x) => x.toFixed(2);

export default {
  slug: 'scenarios-and-sensitivity',
  title: 'Scenarios and sensitivity',
  blurb: 'A forecast is one possible future. Build scenarios into the model so that a lender can see what happens when growth is slower or a kitchen opens late, find the input that just meets a covenant, rank which assumptions matter most, and use the answers to choose a financing plan that survives a bad year.',
  status: 'draft',
  objectives: [
    'Design scenarios as consistent sets of assumptions that run through the whole model, without copying the model.',
    'Calculate the value of an input that just meets a target, such as the smallest loan that keeps a covenant, with Goal Seek or a search.',
    'Construct a two-way sensitivity table and a tornado chart, and identify the assumptions that matter most.',
    'Evaluate a financing plan by stress testing it, and recommend terms that survive a realistic bad case.',
  ],
  prerequisites: [
    { lesson: 'f07/linking-the-statements', why: 'The covenant test this lesson stresses.' },
    { lesson: 'f07/dcf-model', why: 'The valuation whose sensitivity to the discount rate and growth is tabled here.' },
    { lesson: 'f05/project-risk', why: 'Scenario, sensitivity and break-even analysis applied to one project; here applied to a whole business.' },
  ],
  case: 'lantern',
  concept: [
    { case: `Ana’s model has told her that the base case breaches Coastline’s covenant at the end of 2028, with a current ratio of ${rat(base.ratios[0])}. Before she goes back to the bank she wants answers to the questions its credit committee will ask: what if sales grow more slowly? What if the kitchen opens late? How much would she need to borrow to pass, and would that still be enough in a bad year?` },
    { h: 'Three tools for “what if?”' },
    { p: 'A model answers what-if questions in three ways, and each answers a different question. <g>Scenario analysis</g> changes several assumptions together into a consistent story (slow growth: online sales, café sales and Cold Brew all weaker) and asks what the whole model says. Sensitivity analysis changes one assumption at a time to see how much an output depends on it. A <g>stress test</g> asks what has to go wrong, and how badly, before a limit is broken: a covenant, the line of credit, cash going below zero.' },
    { p: 'Scenarios must be consistent. A recession scenario in which sales fall but costs stay at boom-time levels is an error, but so is one in which everything bad happens at once with no reason. Each scenario should be a story someone could tell about the next five years, and its inputs should follow from that story.' },
    { h: 'Scenarios belong inside the model' },
    { p: 'The commonest way to build scenarios, saving a copy of the model for each, is also the worst: the copies drift apart as soon as one is corrected, and nobody can be sure the scenarios differ only in their assumptions. Instead, the model keeps one set of calculations and a small block of scenario inputs (the online growth multiplier, the café growth rate, the Cold Brew volume multiplier, the kitchen’s opening month, the loan amount), with a selector that chooses which column of inputs the model uses. Lantern’s scenarios change only those inputs; every schedule and statement recalculates.' },
    { table: {
      caption: 'Lantern’s current ratio at each year end, by scenario (covenant: at least 1.2)',
      head: ['Scenario', ...Y, 'Equity value'],
      rows: Object.values(S).map((x) => [x.name, ...x.ratios.map(rat), `$${n(x.equity)}`]),
      align: ['l', 'r', 'r', 'r', 'r', 'r', 'r'],
      note: `Slow growth: ${SCENARIOS.slow.why}. Late kitchen: ${SCENARIOS.late.why}. The $75,000 loan has F05’s terms (7.5%, five years). Equity values are DCFs at the WACC.`,
    } },
    { p: `Three things stand out. Slow growth is serious: the ratio falls to ${rat(S.slow.ratios[0])} in 2028 and ${rat(S.slow.ratios[1])} in 2029, and the line of credit is drawn to $${n(S.slow.model.rows[1].loc)} by the end of 2029. A late kitchen hardly matters, because its costs and its sales move back together. And a $15,000 larger loan nearly fixes the base case (${rat(S.loan75.ratios[0])} in 2028) but not the slow one.` },
  ],
  theory: [
    { h: 'Choosing the scenarios' },
    { p: 'Most models carry three to five scenarios. A base case is the plan the business is actually pursuing, built on its best estimates, not on hopes. A downside case asks what a realistic bad outcome looks like: not the worst imaginable, but one that would surprise nobody if it happened, such as a year of slower growth. An upside case keeps the plan honest from the other side, and shows whether success itself creates problems, such as needing more working capital or capacity sooner. Event scenarios test a single risk the business knows it faces: the kitchen opening late, a key supplier raising prices, losing the law firm’s contract.' },
    { p: 'For a lender the downside case matters most, because the lender gains nothing from the upside. For an investor the spread between downside and upside matters, because it shows how much is at stake. Lantern’s slow-growth scenario is its downside: online growth half of plan, cafés at 2% a year, and a quarter fewer Cold Brew cans, each plausible after a weak year for consumer spending.' },
    { h: 'What an annual model cannot show' },
    { p: 'Coastline tests the covenant at each quarter end, but Lantern’s model has one column a year. A business whose year-end ratio passes can still fail at the end of March or September, if cash dips during the year: before a large annual payment, say, or during a seasonal low. An annual model cannot see that. The fix for a covenant this close is a quarterly or monthly cash model for the first year or two, built from the same assumptions, with the annual model taking over after that. Ana’s proposal says so, and commits to sending Coastline a quarterly cash forecast for 2028.' },
    { h: 'Finding the input that just meets the target' },
    { p: `Often the useful question is not “what happens if?” but “what would it take?”. Excel’s Goal Seek changes one input until a formula reaches a target value. Here the target is a condition, every year’s current ratio at least 1.2, so the model searches: it tries loan amounts, keeps the half of the range in which the answer lies, and repeats until the range is a dollar wide. The base case passes in every year with a term loan of at least $${n(needBase)}; under slow growth it needs $${n(needSlow)}.` },
    { p: `A borrower should not ask for the exact break-even amount: covenants need <g>covenant headroom</g>, a margin for the forecast being wrong. With $80,000, Lantern’s base case ratios are ${b80.ratios.map(rat).join(', ')}: comfortably above 1.2 in every year. Under slow growth, $80,000 would still leave ${rat(s80.ratios[0])} in 2028 and ${rat(s80.ratios[1])} in 2029.` },
    { h: 'One assumption at a time: the tornado' },
    { p: 'A <g>tornado chart</g> ranks assumptions by their effect. Each is moved to a plausible low and high value while everything else stays at the base case, and the resulting range of the output is drawn as a bar; the longest bars go at the top, which gives the chart its shape. For Lantern’s 2028 covenant the ranking is:' },
    { table: {
      caption: 'One at a time: the 2028 current ratio and the equity value',
      head: ['Assumption (low / high)', '2028 ratio, low', '2028 ratio, high', 'Equity, low', 'Equity, high'],
      rows: TORNADO.map((t) => [t.name, rat(t.lo), rat(t.hi), `$${n(t.eLo)}`, `$${n(t.eHi)}`]),
      align: ['l', 'r', 'r', 'r', 'r'],
      note: `Base case: 2028 ratio ${rat(base.ratios[0])}, equity $${n(base.equity)}. Ranges are Ana’s judgement of plausible outcomes, not statistical bounds.`,
    } },
    { p: 'Cold Brew’s volume matters most to 2028, because the launch costs are fixed while its sales are not: every can short is margin lost against costs already committed. For the equity value the ranking is different: growth in the established lines matters more over five years, and the discount rate, below, matters more than any of them. A tornado is only as good as its ranges; giving one assumption a range twice as wide as the others will put it at the top whatever its real importance.' },
    { h: 'Two at a time: the sensitivity table' },
    { p: 'For the valuation, the two most uncertain inputs are the discount rate and long-run growth, and they interact through the terminal value. A two-way table, the spreadsheet’s Data Table, shows every combination:' },
    { table: {
      caption: 'Lantern’s equity value ($) by WACC (rows) and long-run growth (columns)',
      head: ['WACC', ...G.map((g) => pc(g))],
      rows: W.map((w, i) => [pc(w, 2), ...grid[i].map(n)]),
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      note: 'The centre cell is the base case. Each point of WACC moves the value far more than half a point of growth does.',
    } },
    { p: `The table makes the earlier argument with Hollis concrete: across reasonable WACCs and growth rates the equity value runs from $${n(grid[4][0])} to $${n(grid[0][4])}, never near his implied $${n(V.hollisPre)}. Only a much higher discount rate, his 20%, gets there.` },
    { h: 'Weighting scenarios' },
    { p: 'Some analysts go one step further and weight each scenario by a probability, to give an expected value: if Ana thought the base case 60% likely, slow growth 30% and an upside 10%, the probability-weighted equity value would be the sum of each value times its weight. Expected values are useful for an investor comparing opportunities, because they put upside and downside on one scale. They are much less useful for a lender, whose concern is the downside alone, and they hide the fact that the probabilities are guesses. A covenant either holds or it does not; an average of a pass and a breach is not a meaningful number. That is why Lantern’s proposal to Coastline shows the scenarios side by side instead of averaging them, and why the stress test, which asks how bad things can get before the plan breaks, is the more useful tool for the bank.' },
    { h: 'From stress test to recommendation' },
    { p: `Stress testing ends in a decision. Ana’s options are to borrow more, to cut or delay spending, or to negotiate the covenant. The model can show each. A $80,000 loan passes the base case in every year with headroom. Slow growth breaks the 1.2 covenant in 2028 and 2029 even then, but at ${rat(s80.ratios[0])} and ${rat(s80.ratios[1])} it would pass a covenant that starts at 0.9 for 2028, rises to 1.0 for 2029 and reaches 1.2 from 2030, a step-up that lenders often agree to for a business in its investment year.` },
    { callout: 'warn', title: 'Sensitivity is not probability', html: 'A scenario table says what happens if; it does not say how likely each scenario is. Weighting scenarios by probabilities, or running a Monte Carlo simulation, can help, but the probabilities are judgements too. The value of a stress test is that it shows the limits of a plan before reality does.' },
  ],
  formulas: [
    { id: 'sc-tornado', name: 'A tornado bar',
      tex: String.raw`\text{Swing}_i = \big|\,y(x_i^{\text{high}}) - y(x_i^{\text{low}})\,\big|`,
      where: [[String.raw`y`, 'The output (the 2028 current ratio, the equity value)', ''], [String.raw`x_i^{\text{low}}, x_i^{\text{high}}`, 'The low and high values of assumption i, all others at the base case', '']],
      assumptions: 'Assumptions are varied one at a time; interactions are ignored.' },
    { id: 'sc-headroom', name: 'Covenant headroom',
      tex: String.raw`\text{Headroom}_t = \dfrac{\text{Ratio}_t - \text{Limit}}{\text{Limit}}`,
      where: [[String.raw`\text{Ratio}_t`, 'The covenant measure in period t (here the current ratio)', ''], [String.raw`\text{Limit}`, 'The covenant’s minimum (1.2)', '']],
      assumptions: 'For a minimum covenant; for a maximum (debt to EBITDA, say) reverse the sign.' },
    { id: 'sc-search', name: 'Searching for the break-even input (bisection)',
      tex: String.raw`x_{\text{mid}} = \tfrac{1}{2}(x_{\text{lo}} + x_{\text{hi}}); \text{ keep the half in which the target is crossed}`,
      where: [[String.raw`x_{\text{lo}}, x_{\text{hi}}`, 'An input value that fails the target and one that meets it', '']],
      assumptions: 'The target is met for every input above the break-even (the output moves one way as the input rises).',
      note: 'Goal Seek does the same job for a single formula and a single target value.' },
  ],
  examples: [
    { level: 'simple', title: 'Reading the scenario table', fictional: true,
      setup: 'Use the scenario table to answer Coastline’s first two questions: does a three-month delay to the kitchen threaten the covenant, and does slow growth?',
      steps: [
        `Late kitchen: 2028 ratio ${rat(S.late.ratios[0])} against ${rat(base.ratios[0])} in the base case; 2029 ${rat(S.late.ratios[1])} against ${rat(base.ratios[1])}. Almost no change.`,
        `Why: the kitchen’s costs (fixed costs, rent, variable costs) start later along with its sales. 2028 EBITDA moves from $${n(base.ebitda2028)} to $${n(S.late.ebitda2028)}.`,
        `Slow growth: ${S.slow.ratios.map(rat).join(', ')}. The covenant fails in 2028 and 2029.`,
        `Why: 2028 EBITDA falls to $${n(S.slow.ebitda2028)}, the line of credit stays drawn ($${n(S.slow.model.rows[1].loc)} at the end of 2029), and short-term debt holds the ratio down until 2030.`,
      ],
      answer: 'A late kitchen does not threaten the covenant; slow growth does, for two years.',
      interpretation: 'The scenario that worries Ana most (the kitchen) turns out to matter least, and one she had not focused on (slower growth across the established lines) matters most. That is the point of running them.' },
    { level: 'challenging', title: 'The smallest loan that passes', fictional: true,
      setup: 'Find the smallest term loan, on F05’s terms, for which the current ratio is at least 1.2 at every year end, in the base case and under slow growth.',
      steps: [
        `Bracket the answer: $60,000 fails (2028: ${rat(base.ratios[0])}); $120,000 passes in both cases.`,
        'Halve the range: try the midpoint, keep the half in which the answer lies (the lower half if the midpoint passes, the upper if it fails), and repeat.',
        `After about twenty halvings the range is under a dollar: $${n(needBase)} for the base case and $${n(needSlow)} under slow growth.`,
        `Check: $${n(Math.ceil(needBase / 1000) * 1000)} gives ${rat(scenario({ termAmount: Math.ceil(needBase / 1000) * 1000 }).ratios[0])} in 2028; $${n(Math.floor(needBase / 1000) * 1000)} gives ${rat(scenario({ termAmount: Math.floor(needBase / 1000) * 1000 }).ratios[0])}.`,
      ],
      answer: `At least $${n(needBase)} in the base case, $${n(needSlow)} under slow growth.`,
      interpretation: 'The first-order estimate in lesson 6 (about $11,000 more cash) was too low, because a bigger loan also adds to next year’s principal, a current liability. The full model gives the right answer.' },
    { level: 'applied', title: 'Ana’s proposal to Coastline', fictional: true,
      setup: 'Draft the financing proposal the model supports: the loan amount and covenant terms, with the scenario evidence for each.',
      steps: [
        `Ask for $80,000 instead of $60,000: the base case then passes 1.2 in every year (${b80.ratios.map(rat).join(', ')}).`,
        `Show the slow-growth case honestly: with $80,000 the ratio is ${rat(s80.ratios[0])} in 2028 and ${rat(s80.ratios[1])} in 2029.`,
        'Propose a stepped covenant: at least 0.9 at the end of 2028, 1.0 in 2029 and 1.2 from 2030. Both the base and the slow-growth cases pass it.',
        `Point to coverage: even in the slow case the line of credit is repaid by 2030 and the term loan is serviced; EBITDA is $${n(S.slow.model.rows[1].ebitda)} in 2029.`,
      ],
      answer: 'An $80,000 term loan with a stepped current-ratio covenant (0.9, 1.0, then 1.2), supported by the base and slow-growth scenarios.',
      interpretation: 'A lender is far more likely to agree to terms the borrower has tested than to waive a breach later. The model turns a problem into a proposal.' },
  ],
  demo: [{ widget: 'sc-explorer', intro: 'The whole model, with the scenario inputs on sliders. Build your own bad case, then raise the loan until every year passes. Watch the line of credit and the equity value as you go.' }],
  mistakes: [
    { title: 'A copy of the model for each scenario', html: 'Copies drift apart. Keep one model and a block of scenario inputs that it reads.' },
    { title: 'Inconsistent scenarios', html: 'A downturn in sales with no change in costs, or every risk happening at once with no story, is not a scenario. Change the inputs that would change together, and only those.' },
    { title: 'Asking for exactly the break-even', html: 'A loan or a covenant set at the break-even leaves no room for the forecast being wrong. Build in headroom.' },
    { title: 'Ranges that are not comparable', html: 'A tornado ranks assumptions by the ranges you give them. Choose ranges that are equally plausible for each input, or the ranking says more about the ranges than the business.' },
    { title: 'Reading sensitivity as likelihood', html: 'A scenario table shows outcomes, not their probabilities. Say how likely you think each is, separately.' },
    { title: 'Testing only value, not survival', html: 'A plan can be valuable and still fail a covenant or run out of cash in one year. Stress the cash and the covenants as well as the valuation.' },
  ],
  application: [
    { p: 'Banks run their own downside cases on every loan above a modest size, often a standard haircut such as revenue 10% below the borrower’s plan. A borrower who arrives with a downside case already run, and terms that survive it, saves the bank work and usually gets a faster answer. Investors do the same with valuation: the sensitivity table is the first page many of them read.' },
    { p: 'Large companies formalise this as stress testing and reverse stress testing: start from a failure (a covenant breach, a credit downgrade) and work backwards to the conditions that would cause it. Lantern’s search for the smallest loan is a small reverse stress test.' },
    { case: `Ana’s proposal goes to Coastline: an $80,000 loan and a stepped covenant, with the base and slow-growth scenarios attached. The final lesson makes sure the model behind it would survive a reviewer’s scrutiny, and presents it.` },
  ],
  summary: [
    'Scenarios change several assumptions together into a consistent story; sensitivity changes one at a time; a stress test finds how badly things must go before a limit breaks.',
    'Keep one model with a block of scenario inputs; never a copy per scenario.',
    'Search for the input that just meets a target (Goal Seek or bisection), then add headroom.',
    'A tornado chart ranks assumptions by their swing; it depends on choosing comparable ranges.',
    'A two-way table shows how a value depends on two interacting inputs, such as the WACC and long-run growth.',
    'Stress the plan’s survival (cash, covenants) as well as its value, and turn the results into terms: Lantern’s $80,000 loan and stepped covenant.',
  ],
  glossary: [
    { term: 'Stress test', def: 'A test of how badly conditions must turn before a plan breaks a limit, such as a covenant, a credit line or a minimum cash balance; a reverse stress test starts from the failure and works back to its causes.' },
    { term: 'Scenario selector', def: 'An input that chooses which set of scenario assumptions a model uses, so that one set of calculations serves every scenario.' },
    { term: 'Stepped covenant', def: 'A covenant whose limit changes over time, typically looser in a borrower’s investment years and tightening as its forecast earnings arrive.' },
  ],
  references: [
    { text: 'Microsoft. “Use Goal Seek to find the result you want by adjusting an input value”. Microsoft Support.', url: 'https://support.microsoft.com/office/use-goal-seek-to-find-the-result-you-want-by-adjusting-an-input-value-320cb99e-f4a4-417f-b1c3-4f369d6e66c7', checked: '2026-10-23' },
    { text: 'Microsoft. “Calculate multiple results by using a data table”. Microsoft Support.', url: 'https://support.microsoft.com/en-us/excel/calculate-multiple-results-by-using-a-data-table', checked: '2026-10-23' },
  ],
  checks: [
    ...Object.values(S).flatMap((x) => [...x.ratios.map((r, t) => ({ what: `${x.name} ratio ${t}`, value: r, shown: Math.round(r * 100) / 100, tol: 0.005 })), { what: `${x.name} equity`, value: x.equity, shown: Math.round(x.equity), tol: 0.5 }]),
    ...TORNADO.flatMap((t) => [{ what: `${t.name} lo`, value: t.lo, shown: Math.round(t.lo * 100) / 100, tol: 0.005 }, { what: `${t.name} hi`, value: t.hi, shown: Math.round(t.hi * 100) / 100, tol: 0.005 }, { what: `${t.name} eLo`, value: t.eLo, shown: Math.round(t.eLo), tol: 0.5 }, { what: `${t.name} eHi`, value: t.eHi, shown: Math.round(t.eHi), tol: 0.5 }]),
    ...grid.flatMap((row, i) => row.map((v, j) => ({ what: `grid ${i},${j}`, value: v, shown: Math.round(v), tol: 0.5 }))),
    { what: 'Need base', value: needBase, shown: Math.round(needBase), tol: 0.5 },
    { what: 'Need slow', value: needSlow, shown: Math.round(needSlow), tol: 0.5 },
    ...b80.ratios.map((r, t) => ({ what: `b80 ${t}`, value: r, shown: Math.round(r * 100) / 100, tol: 0.005 })),
    ...s80.ratios.slice(0, 2).map((r, t) => ({ what: `s80 ${t}`, value: r, shown: Math.round(r * 100) / 100, tol: 0.005 })),
    { what: 'Slow line 2029', value: S.slow.model.rows[1].loc, shown: Math.round(S.slow.model.rows[1].loc), tol: 0.5 },
    { what: 'Slow EBITDA 2028', value: S.slow.ebitda2028, shown: Math.round(S.slow.ebitda2028), tol: 0.5 },
    { what: 'Slow EBITDA 2029', value: S.slow.model.rows[1].ebitda, shown: Math.round(S.slow.model.rows[1].ebitda), tol: 0.5 },
    { what: 'Late EBITDA 2028', value: S.late.ebitda2028, shown: Math.round(S.late.ebitda2028), tol: 0.5 },
    { what: 'Base EBITDA 2028', value: base.ebitda2028, shown: Math.round(base.ebitda2028), tol: 0.5 },
    { what: 'Bracket fails at 60k', value: scenario({ termAmount: 60000 }).passes ? 1 : 0, shown: 0 },
    { what: 'Bracket passes at 120k', value: scenario({ termAmount: 120000 }).passes && scenario({ ...SCENARIOS.slow.set, termAmount: 120000 }).passes ? 1 : 0, shown: 1 },
    { what: 'Ceil check', value: scenario({ termAmount: Math.ceil(needBase / 1000) * 1000 }).ratios[0], shown: Math.round(scenario({ termAmount: Math.ceil(needBase / 1000) * 1000 }).ratios[0] * 100) / 100, tol: 0.005 },
    { what: 'Floor check', value: scenario({ termAmount: Math.floor(needBase / 1000) * 1000 }).ratios[0], shown: Math.round(scenario({ termAmount: Math.floor(needBase / 1000) * 1000 }).ratios[0] * 100) / 100, tol: 0.005 },
    { what: 'Stepped covenant passes both', value: (b80.ratios[0] >= 0.9 && b80.ratios[1] >= 1.0 && b80.ratios.slice(2).every((r) => r >= 1.2) && s80.ratios[0] >= 0.9 && s80.ratios[1] >= 1.0 && s80.ratios.slice(2).every((r) => r >= 1.2)) ? 1 : 0, shown: 1 },
    { what: 'Hollis pre', value: V.hollisPre, shown: 175000 },
    { what: 'Extra loan', value: 75000 - 60000, shown: 15000 },
    { what: 'Min cash', value: FINANCE.minCash, shown: 15000 },
  ],
};
