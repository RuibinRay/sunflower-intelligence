// project-risk.js — F05 · Project risk. Content only; exercises are in project-risk.ex.js.
// Uses COLD_BREW and coldBrewFlows() (sensitivity, scenarios, break-even, the abandonment option, a small seeded Monte Carlo
// illustration), ROASTER and DERIVED.roasterSavingPerYear (the roaster’s break-even volume) and WORKING_RATE from case.js.
// Ana’s scenarios, probabilities, the input distributions and the fridges’ $6,000 resale after one year are assumptions made
// for this lesson (fictional). The bike-repair van is a fictional business.
import { COLD_BREW, ROASTER, WORKING_RATE, TAX, coldBrewFlows, DERIVED } from './case.js?v=28';
import { projectCashFlows, depreciation, sensitivity, breakEven, breakEvenVolumes, eaa } from '../../../core/corpfin.js?v=28';
import { npv } from '../../../core/invest.js?v=28';

const cb = COLD_BREW, r = WORKING_RATE;
/** Cold Brew’s NPV with its drivers moved: volume (% of forecast), shelf price, cost per can, promotion (% of plan), rate (%). */
const N = (v) => npv(v.rate / 100, coldBrewFlows({ cans: cb.cans.map((n) => n * v.vol / 100), netPrice: v.price * (1 - cb.tradeMargin), cogs: v.cost,
  promotion: cb.promotion.map((p) => p * v.promo / 100) }).fcf);
const base = { vol: 100, price: cb.shelfPrice, cost: cb.cogs, promo: 100, rate: 11 };
const T = sensitivity(N, base, { vol: [70, 130], price: [3.19, 3.79], cost: [0.64, 0.84], promo: [80, 120], rate: [9, 13] });
const tor = Object.fromEntries(T.map((t) => [t.name, t]));
const nBase = N(base), nWorst = N({ ...base, vol: 70, price: 3.29, cost: 0.80 }), nBest = N({ ...base, vol: 120, cost: 0.70 });
const eNpv = 0.25 * nWorst + 0.5 * nBase + 0.25 * nBest;
const beVol = breakEven(N, base, 'vol', 20, 150), bePrice = breakEven(N, base, 'price', 2, 4);
// steady state: a year at 60,000 cans, fixed costs including the café margin lost, straight-line depreciation for simplicity
const margin = cb.netPrice - cb.cogs, fixedSS = cb.promotion[4] + cb.listing + cb.brandManager + cb.cannibalised, depSS = cb.equipment / 5;
const BE = breakEvenVolumes({ price: cb.netPrice, unitCost: cb.cogs, fixed: fixedSS, dep: depSS, capex: cb.equipment, n: 5, r, tax: TAX });
const contrib = 60000 * margin, ebitSS = contrib - fixedSS - depSS, dol = contrib / ebitSS;
const eacFridge = eaa(cb.equipment, r, 5);
// the roaster’s break-even volume (kg a year)
const roNpv = (kg) => {
  const R = ROASTER, sav = kg * (R.kilnworthPerKg - R.greenPerKg / (1 - R.weightLoss) - R.runningPerKg);
  return npv(r, projectCashFlows({ capex: R.price + R.install, years: R.life, revenue: Array(R.life).fill(sav), variable: Array(R.life).fill(0),
    fixed: R.operator + R.maintenance + R.space, dep: depreciation(R.price + R.install, { method: R.macrs }).slice(0, R.life), tax: TAX, salvage: R.salvage }).fcf);
};
const roBE = breakEven((v) => roNpv(v.kg), { kg: ROASTER.kg }, 'kg', 100, 5000);
const perKg = DERIVED.roasterSavingPerYear / ROASTER.kg;
// the option to abandon: high (140%) or low (60%) volume, equally likely; in the low state stop after year 1 and sell the fridges for $6,000
const nHigh = N({ ...base, vol: 140 }), nLow = N({ ...base, vol: 60 });
const ab = projectCashFlows({ capex: cb.equipment, years: 1, revenue: [cb.cans[0] * 0.6 * cb.netPrice], variable: [cb.cans[0] * 0.6 * cb.cogs],
  fixed: [cb.promotion[0] + cb.listing + cb.brandManager], dep: [depreciation(cb.equipment, { method: 5 })[0]], tax: TAX, nwcShare: cb.nwcShare, salvage: 6000,
  upfront: cb.launch, side: [-cb.cannibalised * (1 - TAX)] });
const nAb = npv(r, ab.fcf);
const withOpt = 0.5 * nHigh + 0.5 * Math.max(nLow, nAb), noOpt = 0.5 * nHigh + 0.5 * nLow;
// a small Monte Carlo illustration (seeded, 2,000 draws): volume ~ N(100%, 20 points), floored at 30%; shelf price ~ N($3.49, $0.15)
function rng(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function simulate(corr) {
  const u = rng(2028), out = [];
  for (let i = 0; i < 2000; i++) {
    const z1 = Math.sqrt(-2 * Math.log(1 - u())) * Math.cos(2 * Math.PI * u()), z2 = Math.sqrt(-2 * Math.log(1 - u())) * Math.cos(2 * Math.PI * u());
    const vol = Math.max(30, 100 + 20 * z1), zp = corr ? 0.8 * z1 + 0.6 * z2 : z2;
    out.push(N({ ...base, vol, price: 3.49 + 0.15 * zp }));
  }
  out.sort((a, b) => a - b);
  return { mean: out.reduce((a, b) => a + b, 0) / out.length, pNeg: out.filter((x) => x < 0).length / out.length, p5: out[99], p95: out[1899] };
}
const MC0 = simulate(false), MC1 = simulate(true);
// the bike-repair van (fictional)
const van = breakEvenVolumes({ price: 60, unitCost: 24, fixed: 54000, dep: 6000, capex: 30000, n: 5, r: 0.10, tax: 0.25 });

export default {
  slug: 'project-risk',
  title: 'Project risk',
  blurb: 'An NPV is only as good as the forecasts behind it. Learn to find the assumptions that matter with sensitivity analysis and a tornado chart, to test combinations with scenarios, to calculate accounting, cash and financial break-even volumes, and to see what simulation and real options add, and where they mislead.',
  status: 'draft',
  objectives: [
    'Calculate a project’s NPV with each input moved in turn (sensitivity analysis), and interpret the result as a tornado chart.',
    'Build pessimistic, base and optimistic scenarios and calculate an expected NPV, explaining what scenarios add to sensitivity analysis.',
    'Calculate the accounting, cash and financial (NPV) break-even volumes of a project, and the degree of operating leverage, and interpret them.',
    'Explain what Monte Carlo simulation adds to scenario analysis and the dangers of false precision and ignored correlations.',
    'Identify options to expand, abandon and wait in a project, and value a simple option to abandon.',
    'Explain why raising the discount rate for every worry double-counts risk, and where each kind of risk belongs.',
  ],
  prerequisites: [
    { lesson: 'f05/project-cash-flows', why: 'Every test in this lesson reruns Cold Brew’s free-cash-flow model built there.' },
    { lesson: 'f05/net-present-value', why: 'You need the NPV rule and the idea that the discount rate is the return investors could earn elsewhere at the same risk.' },
    { lesson: 'f00/decision-principles', why: 'The difference between systematic risk, which the rate prices, and risk that diversification removes is introduced there.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Cold Brew’s NPV at 11% is $25,737. Ana built it from forecasts: 30,000 cans in the first year rising to 60,000, a $3.49 shelf price, $0.74 a can from the co-packer, $93,000 of promotion over five years. None of these is known. The grocers might take fewer cans, a rival might force a price cut, the co-packer might raise its fee. Before she commits, Ana wants to know which of her assumptions the decision rests on, how bad things could get, and what she could do if they went badly.' },
    { p: 'A project’s NPV is a forecast of value, and the forecasts behind it are uncertain in two ways. There is <b>forecasting risk</b>: Ana’s numbers may simply be wrong, perhaps biased by her enthusiasm. And there is genuine uncertainty about the future: even a careful forecast is an average of outcomes, some good and some bad. Neither shows up in a single NPV figure.' },
    { p: 'This lesson gives you a toolkit for looking behind the figure:' },
    { list: [
      '<b><g>Sensitivity analysis</g></b> moves one input at a time and shows how far the NPV moves: which assumptions matter most. A <g>tornado chart</g> draws the result.',
      '<b><g>Scenario analysis</g></b> moves several inputs together, into consistent stories of a bad, a normal and a good future.',
      '<b>Break-even analysis</b> turns the question round: how low can volume (or price) go before the project stops paying its way?',
      '<b><g>Monte Carlo simulation</g></b> draws thousands of combinations of inputs from probability distributions and shows the whole range of NPVs.',
      '<b><g>Real options</g></b> recognise that managers can react as the future unfolds: expand if things go well, abandon if they go badly, or wait to learn more.',
    ] },
    { p: 'None of these tools changes the decision rule. A project is worth doing if its NPV, from expected cash flows discounted at a rate that reflects its systematic risk, is positive. The tools help you get the expected cash flows right, see how fragile the answer is, and design the project so that bad news costs less.' },
    { callout: 'key', title: 'Where risk goes', html: 'Risk that investors can’t diversify away (<g>systematic risk</g>, such as a recession hitting every business) belongs in the discount rate. Everything else (a bad launch, a lost listing, a forecast that is too rosy) belongs in the expected cash flows. Adding points to the rate for every worry double-counts, and penalises distant cash flows far more than near ones.' },
  ],

  theory: [
    { h: 'Sensitivity analysis and the tornado chart' },
    { p: 'Take the model, hold every input at its base value except one, move that one to a plausible low and high value, and record the NPV each time. Repeat for each input. Sorting the inputs by the width of the swing and drawing each as a horizontal bar of the change in NPV from the base, widest at the top, gives a chart shaped like a tornado.' },
    { table: {
      caption: 'Cold Brew: NPV at 11% with one input moved at a time (base NPV $25,737; fictional figures)',
      head: ['Input', 'Low', 'High', 'NPV at low', 'NPV at high', 'Swing'],
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      rows: [
        ['Volume (% of forecast)', '70%', '130%', '−$29,657', '$81,131', '$110,789'],
        ['Shelf price', '$3.19', '$3.79', '$1,330', '$50,144', '$48,814'],
        ['Cost per can', '$0.64', '$0.84', '$39,154', '$12,320', '$26,834'],
        ['Promotion (% of plan)', '80%', '120%', '$36,445', '$15,029', '$21,416'],
        ['Discount rate', '9%', '13%', '$30,547', '$21,382', '$9,166'],
      ],
      note: 'Volume moves every year’s cans by the same percentage. A lower cost or less promotion raises the NPV, so for those inputs the low value gives the higher NPV.',
    } },
    { p: 'Volume dominates: a 30% shortfall turns a $25,737 NPV into a loss of $29,657. The shelf price comes next, because every 10 cents of shelf price is 6.2 cents of net price on every can. The discount rate, so often argued over, matters least of the five over these ranges. That tells Ana where to spend her effort: on evidence about how many cans grocers will sell, not on refining the rate.' },
    { p: 'Two cautions. The ranges are judgements, and a tornado is only as fair as they are: an input given a narrow range will look unimportant. And one-at-a-time changes ignore the fact that inputs move together; if volume disappoints, Ana might also cut the price or spend more on promotion.' },

    { h: 'Scenario analysis' },
    { p: 'A scenario changes several inputs at once to tell a consistent story. Ana’s pessimistic case is that grocers take only 70% of the forecast, she cuts the shelf price to $3.29 to keep her space, and the co-packer’s fee rises to $0.80 a can. Her optimistic case is 120% of the forecast volume at $0.70 a can.' },
    { table: {
      caption: 'Cold Brew scenarios at 11% (Ana’s judgements; fictional)',
      head: ['Scenario', 'Volume', 'Shelf price', 'Cost per can', 'Probability', 'NPV'],
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      rows: [
        ['Pessimistic', '70%', '$3.29', '$0.80', '25%', '−$46,683'],
        ['Base', '100%', '$3.49', '$0.74', '50%', '$25,737'],
        ['Optimistic', '120%', '$3.49', '$0.70', '25%', '$69,107'],
      ],
      foot: [['Expected NPV', '', '', '', '', '$18,474']],
    } },
    { p: 'The expected NPV, weighting each scenario by its probability, is <m>0.25 \\times (-46{,}683) + 0.5 \\times 25{,}737 + 0.25 \\times 69{,}107 = 18{,}474</m> dollars. It is lower than the base case because Ana’s bad case is worse than her good case is good: the base case is the most likely outcome, not the average one. When the downside is lopsided, an NPV from the most likely values overstates the project. And the pessimistic case is a loss of $46,683: Lantern must be able to survive it.' },
    { p: 'Scenario analysis is only as good as the scenarios. Three are a crude summary of a continuous range, the probabilities are judgements, and the “worst case” is rarely the worst that could happen.' },

    { h: 'Break-even analysis' },
    { p: 'Break-even analysis asks how far a key input can fall before the project stops paying its way, and “paying its way” can mean three things. For a project selling a constant quantity <m>Q</m> a year at net price <m>P</m>, with variable cost <m>v</m> a unit, fixed cash costs <m>F</m> a year and depreciation <m>D</m>:' },
    { define: [
      ['<g>Accounting break-even</g>', 'The volume at which accounting profit (EBIT, and so net income) is zero: <m>Q_A = (F + D) \\div (P - v)</m>.'],
      ['<g>Cash break-even</g>', 'The volume at which revenue just covers variable and fixed cash costs, so operating cash flow before tax is zero: <m>Q_C = F \\div (P - v)</m>. Below it the project drains cash every year.'],
      ['<g>Financial break-even</g>', 'The volume at which NPV is zero: operating cash flow just repays the investment with the required return. Each year it must equal the investment’s equivalent annual cost.'],
    ] },
    { p: 'Take a steady year of Cold Brew at the forecast’s eventual 60,000 cans. Each can brings in $2.16 (the $3.49 shelf price less the trade’s 38%) and costs $0.74, a contribution of $1.42. Fixed costs are $49,000 a year: $15,000 of promotion, the $2,000 listing fee, the $24,000 brand manager and the $8,000 of café margin lost. Depreciation, simplified to straight line, is $1,800 on the $9,000 of fridges. Then:' },
    { list: [
      'Accounting break-even: <m>(49{,}000 + 1{,}800) \\div 1.4238 = 35{,}679</m> cans a year.',
      'Cash break-even: <m>49{,}000 \\div 1.4238 = 34{,}415</m> cans a year.',
      String.raw`Financial break-even: the fridges’ equivalent annual cost over five years at 11% is <m>9{,}000 \div 3.6959 = 2{,}435</m> dollars; operating cash flow must cover it, after allowing for the depreciation tax shield, so <m>Q_F = [49{,}000 + (2{,}435 - 0.25 \times 1{,}800) \div 0.75] \div 1.4238 = 36{,}274</m> cans a year.`,
    ] },
    { p: 'A steady year needs only about 36,000 cans against a forecast of 60,000, which looks comfortable. It isn’t, and the reason is instructive. Cold Brew’s costs are front-loaded: $30,000 of promotion in year 1, the $6,000 launch, and working capital to build. Running the full five-year model instead, the NPV is zero when every year’s volume is <b>86.1% of the forecast</b>, a margin of less than 14%. Break-even formulas for a steady state are a quick screen; for a project whose early years differ from its later ones, find the break-even on the full model (in a spreadsheet, Goal Seek does this: set the NPV cell to 0 by changing the volume cell). The same search gives a break-even shelf price of $3.17, only 32 cents below Ana’s $3.49.' },
    { p: 'The roaster is a cost-saving project with steady years, so its break-even is easier to read. It saves $21.53 on every kilogram roasted instead of bought, against fixed costs of an operator, maintenance and a kitchen corner. Its NPV is zero at about 2,158 kg a year, 90% of the 2,400 kg Lantern needs: a 10% fall in Lantern’s coffee sales would wipe out its value.' },

    { h: 'Operating leverage' },
    { p: 'Why is Cold Brew so sensitive to volume? Because most of its costs are fixed. <g>Operating leverage</g> is the degree to which a project’s costs are fixed rather than variable: high fixed costs mean that a change in volume produces a larger percentage change in profit. The <g>degree of operating leverage</g> (DOL) measures it at a given volume:' },
    { math: String.raw`\text{DOL} = \dfrac{\%\ \text{change in EBIT}}{\%\ \text{change in volume}} = \dfrac{Q\,(P - v)}{\text{EBIT}}` },
    { p: 'In Cold Brew’s steady year, contribution is <m>60{,}000 \\times 1.4238 = 85{,}428</m> dollars and EBIT, counting the lost café margin, is <m>85{,}428 - 49{,}000 - 1{,}800 = 34{,}628</m> dollars, so DOL is <m>85{,}428 \\div 34{,}628 = 2.47</m>: a 10% fall in volume cuts EBIT by about 25%. DOL rises as volume approaches break-even, where EBIT is close to zero. Choices that swap variable costs for fixed ones (an in-house roaster instead of bought beans, a salaried sales team instead of commission) raise operating leverage, and with it the risk that a shortfall hurts.' },

    { h: 'Monte Carlo simulation, in outline' },
    { p: 'Simulation takes the next step: describe each uncertain input by a probability distribution, draw a value for each input at random, compute the NPV, and repeat thousands of times. The result is a distribution of NPVs: its average, its spread, and the chance of a loss. As an illustration, suppose Cold Brew’s volume is normally distributed around the forecast with a standard deviation of 20 percentage points (floored at 30%), and its shelf price around $3.49 with a standard deviation of 15 cents.' },
    { table: {
      caption: 'Cold Brew: 2,000 simulated NPVs at 11% (assumed distributions; fictional)',
      head: ['Volume and price', 'Mean NPV', 'Chance NPV < 0', '5th percentile', '95th percentile'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: [
        ['Independent', '$25,484', '26.2%', '−$39,957', '$90,897'],
        ['Correlated (0.8): low volume comes with low prices', '$27,374', '29.0%', '−$50,825', '$109,274'],
      ],
      note: 'Each row uses the same 2,000 seeded random draws, so the difference comes from the correlation alone. The correlated mean is higher because revenue is volume × price: when the two move together, the expected value of their product rises, and the same effect stretches the good tail.',
    } },
    { p: 'Two lessons stand out. First, the correlation matters: if a weak launch also forces discounting, the bad outcomes are worse (a 5th percentile of −$50,825 instead of −$39,957). Simulations that draw every input independently understate the tails when inputs that push NPV the same way move together. Second, the output looks precise (“29.0% chance of a loss”) but rests entirely on the assumed distributions and correlations, which for a new product are guesses. Garbage in, garbage out, with decimals. And each draw’s NPV is computed at the risk-adjusted rate, which already prices systematic risk; rejecting a project for a wide spread of NPVs on top of that counts the risk twice.' },

    { h: 'Real options' },
    { p: 'A forecast model treats the project as a fixed plan. Real managers react: they expand what works, cut what doesn’t, and wait when waiting teaches them something. The right to make such a decision later, after learning more, is a <g>real option</g>, and it has value because it lets the firm keep the upside while cutting off part of the downside.' },
    { list: [
      'The <b>option to expand</b>: start small and grow if demand proves strong. Launching Cold Brew with a few natural grocers first, before a wider roll-out, is in effect a pilot that buys this option.',
      'The <b>option to abandon</b>: stop and recover what you can (sell the fridges, release the working capital) if demand proves weak.',
      'The <b>option to wait</b>: delay, at the cost of a year’s cash flows, to learn more first. Valuable when the investment can’t be reversed and the uncertainty will resolve.',
    ] },
    { p: 'Such options are not free money. They have value only if the firm will really be able to act (a lease or contract may prevent abandonment), and an option to expand is worth something only if competitors can’t take the opportunity first. Exaggerated option values have been used to justify poor investments; the discipline is to model the decision, not to assert that “strategic value” makes up the shortfall.' },

    { h: 'Why not just raise the rate?' },
    { p: 'A common shortcut is to add a few points to the discount rate for a risky project: 16% instead of 11% for Cold Brew, which cuts its NPV from $25,737 to $15,595. The trouble is that the extra five points compound. A year-1 cash flow loses 4.3% of its value (<m>1.11 \\div 1.16 = 0.957</m>), but a year-5 cash flow loses 19.8% (<m>(1.11 \\div 1.16)^5 = 0.802</m>). That is right only if the risk grows steadily with time. Cold Brew’s main risk, that grocers won’t sell enough cans, is resolved in the first year or two, and it is largely specific to Lantern, not systematic. It belongs in the expected cash flows (scenarios weighted by probability), with the abandonment option modelled, and the rate left to price the risk investors can’t diversify.' },
  ],

  formulas: [
    { id: 'risk-accounting-be', name: 'Accounting break-even volume',
      tex: String.raw`Q_A = \dfrac{F + D}{P - v}`,
      where: [[String.raw`Q_A`, 'Volume a year at which EBIT is zero', 'units a year'], [String.raw`F`, 'Fixed cash costs a year', '$ a year'],
              [String.raw`D`, 'Depreciation a year', '$ a year'], [String.raw`P`, 'Net price received per unit', '$ per unit'], [String.raw`v`, 'Variable cost per unit', '$ per unit']],
      assumptions: 'Constant price, unit cost, fixed costs and depreciation every year.',
      note: 'Zero accounting profit still means a negative NPV: the investment earns no return.' },
    { id: 'risk-cash-be', name: 'Cash break-even volume',
      tex: String.raw`Q_C = \dfrac{F}{P - v}`,
      where: [[String.raw`Q_C`, 'Volume a year at which operating cash flow before tax is zero', 'units a year'], [String.raw`F`, 'Fixed cash costs a year', '$ a year'],
              [String.raw`P`, 'Net price received per unit', '$ per unit'], [String.raw`v`, 'Variable cost per unit', '$ per unit']],
      assumptions: 'As for the accounting break-even. Depreciation is not a cash cost, so it is left out.',
      note: 'Below this volume the project drains cash each year; the investment is never recovered.' },
    { id: 'risk-financial-be', name: 'Financial (NPV) break-even volume',
      tex: String.raw`Q_F = \dfrac{F + \dfrac{\text{EAC} - T D}{1 - T}}{P - v}, \qquad \text{EAC} = I \times \dfrac{r}{1 - (1 + r)^{-n}}`,
      where: [[String.raw`Q_F`, 'Volume a year at which NPV is zero', 'units a year'], [String.raw`F`, 'Fixed cash costs a year', '$ a year'],
              [String.raw`\text{EAC}`, 'Equivalent annual cost of the investment', '$ a year'], [String.raw`I`, 'Investment at year 0', '$'],
              [String.raw`T`, 'Tax rate', ''], [String.raw`D`, 'Depreciation a year', '$ a year'], [String.raw`r`, 'Discount rate', '% a year'], [String.raw`n`, 'Life', 'years'],
              [String.raw`P`, 'Net price received per unit', '$ per unit'], [String.raw`v`, 'Variable cost per unit', '$ per unit']],
      assumptions: 'A constant volume every year, straight-line depreciation over the life, no working capital and no salvage; tax losses save tax elsewhere in the firm.',
      note: 'Derived by setting the operating cash flow, (Q(P − v) − F − D)(1 − T) + D, equal to the EAC. For projects with uneven years, find the NPV break-even on the full model instead.' },
    { id: 'risk-dol', name: 'Degree of operating leverage',
      tex: String.raw`\text{DOL} = \dfrac{Q\,(P - v)}{\text{EBIT}} = 1 + \dfrac{F + D}{\text{EBIT}}`,
      where: [[String.raw`Q`, 'Volume a year', 'units a year'], [String.raw`P - v`, 'Contribution per unit', '$ per unit'], [String.raw`\text{EBIT}`, 'Earnings before interest and tax at volume Q', '$ a year'],
              [String.raw`F + D`, 'Fixed costs including depreciation', '$ a year']],
      assumptions: 'Price, unit cost and fixed costs don’t change with volume; EBIT is positive.',
      note: 'A 1% change in volume changes EBIT by about DOL %. DOL grows without limit as volume approaches the accounting break-even.' },
    { id: 'risk-expected-npv', name: 'Expected NPV across scenarios',
      tex: String.raw`\text{Expected NPV} = \sum_{s} p_s \, \text{NPV}_s`,
      where: [[String.raw`p_s`, 'Probability of scenario s (they add to 1)', ''], [String.raw`\text{NPV}_s`, 'NPV if scenario s happens', '$']],
      assumptions: 'The scenarios cover the range of outcomes and the probabilities are reasonable judgements; each NPV uses the same risk-adjusted rate.',
      note: 'With a decision to be made later (an option), use the NPV of the best decision in each scenario.' },
  ],

  examples: [
    { level: 'simple', title: 'Three break-evens for a repair van', fictional: true,
      setup: 'A fictional bike-repair business is thinking of buying a $30,000 van for mobile repairs. Each job brings in $60 and costs $24 in parts; fixed costs (driver, insurance, fuel) are $54,000 a year. The van is depreciated straight line over five years to zero, tax is 25% and the required return 10%. How many jobs a year must the van do to break even on each measure?',
      steps: [
        'Contribution per job: 60 − 24 = $36. Depreciation: 30,000 ÷ 5 = $6,000 a year.',
        String.raw`Accounting break-even: <m>(54{,}000 + 6{,}000) \div 36 = 1{,}667</m> jobs (1,666.7). Cash break-even: <m>54{,}000 \div 36 = 1{,}500</m> jobs.`,
        String.raw`Financial break-even: the van’s equivalent annual cost is <m>30{,}000 \times 0.10 \div (1 - 1.1^{-5}) = 7{,}914</m> dollars. Then <m>Q_F = [54{,}000 + (7{,}914 - 0.25 \times 6{,}000) \div 0.75] \div 36 = 1{,}738</m> jobs (1,737.6).`,
        'Check: at 1,737.6 jobs, EBIT = 1,737.6 × 36 − 54,000 − 6,000 = $2,552; operating cash flow = 2,552 × 0.75 + 6,000 = $7,914, exactly the van’s cost a year.',
      ],
      answer: 'About 1,500 jobs a year to cover cash costs, 1,667 to show an accounting profit, and 1,738 to earn the 10% required return.',
      interpretation: 'The financial break-even is the one that matters for the investment decision: at 1,667 jobs the van shows no loss, but it earns nothing on the $30,000 tied up in it. If the business expects 2,000 jobs, it has a margin of about 13% before the van destroys value.' },
    { level: 'challenging', title: 'Cold Brew’s option to abandon', fictional: true,
      setup: 'Suppose Cold Brew’s first year reveals demand: either 140% of the forecast every year or 60%, equally likely (so the forecast is still the average). If demand is low, Ana could stop at the end of year 1: sell the fridges for an assumed $6,000, recover the working capital and stop spending. How much is that option worth today, at 11%?',
      steps: [
        'Without the option, NPV is linear in volume, so the expected NPV is the NPV at the average volume: 0.5 × $99,596 (high) + 0.5 × (−$48,122) (low, carrying on) = $25,737, the base NPV.',
        'With the option, value the low branch if Ana stops after year 1: year 0 as before (−$19,342 at 60% volume; for simplicity, year 0’s working capital is set as if the state were already known, and both low branches share it, so the option value is unaffected), and year 1’s operating cash flow plus the working capital recovered and the fridges’ after-tax sale, −$16,186. The fridges’ remaining tax value is $7,200, so selling for $6,000 creates a tax-deductible loss. NPV of stopping: −$33,925.',
        'Stopping (−$33,925) beats carrying on (−$48,122) by $14,198, so in the low state Ana would stop.',
        'Expected NPV with the option: 0.5 × 99,596 + 0.5 × (−33,925) = $32,836. The option is worth 32,836 − 25,737 = $7,099 today: the probability of the low state times what stopping saves.',
      ],
      answer: 'The option to abandon after year 1 adds about $7,099, raising Cold Brew’s expected NPV from $25,737 to $32,836.',
      interpretation: 'The option is valuable because the bad news arrives early and Lantern can act on it. It is worth something only if Ana really can stop: a long contract with the co-packer or the brand manager would kill it. Designing the launch to keep that flexibility (short contracts, fridges that can be resold) is a way to manage risk that a single NPV can’t show.' },
    { level: 'applied', title: 'Should Ana launch Cold Brew?', fictional: true,
      setup: 'Bring the analysis together. Cold Brew’s base NPV at 11% is $25,737. What do the sensitivity, scenario and break-even results say, and what should Ana do?',
      steps: [
        'The tornado shows volume dominating (a swing of $110,789 between 70% and 130% of forecast), then shelf price ($48,814). The discount rate matters least of the five.',
        'The NPV break-even is 86.1% of forecast volume and a $3.17 shelf price: the project has a thin margin on its two most important inputs.',
        'Ana’s scenarios give an expected NPV of $18,474, lower than the base case, and a pessimistic loss of $46,683.',
        'The option to abandon after a weak first year is worth about $7,099 if contracts allow it.',
      ],
      answer: 'Cold Brew is worth launching on Ana’s figures (expected NPV $18,474 at 11%), but its value rests on selling at least about 86% of the forecast cans at close to $3.49. The best response is to keep the option to stop: short contracts with the co-packer and brand manager, and evidence on sell-through from the first grocers before committing to year 2’s promotion.',
      interpretation: 'Risk analysis rarely turns a yes into a no on its own. It tells the manager what to watch (cans sold per store per week), what to negotiate (exit terms), and how much loss the business must be able to absorb. Lantern should launch Cold Brew only if it could survive the pessimistic case.' },
  ],

  demo: [
    { widget: 'risk-tornado', intro: 'Cold Brew’s model with its five main drivers. Move a slider to see the NPV respond; the tornado redraws around wherever the sliders are. Try lowering the volume to 90% and see how the bars shift.' },
    { widget: 'risk-breakeven', intro: 'The three break-even volumes and the degree of operating leverage for a steady year of a product like Cold Brew. Raise the fixed costs or lower the price and watch all three break-evens move away from the expected volume.' },
  ],

  mistakes: [
    { title: 'Treating the base case as the expected case', html: 'The base case is usually built from the most likely value of each input. When the downside is larger than the upside, as with Cold Brew, the probability-weighted NPV is lower than the base-case NPV. Decisions should rest on expected cash flows.' },
    { title: 'Reading a tornado as a ranking of risks', html: 'A tornado shows how far the NPV moves over the ranges you chose. An input given a narrow range looks unimportant whether or not it is. Use ranges that are equally plausible (say, a 1-in-10 chance of being beyond each end) for every input.' },
    { title: 'Using the accounting break-even for an investment decision', html: 'Zero accounting profit means the investment earns no return at all. The break-even that matters for value is the financial (NPV) break-even, which is always higher for a project with an up-front investment and a positive required return (with straight-line depreciation and no salvage).' },
    { title: 'Trusting a simulation’s decimals', html: 'A simulation’s probability of loss is only as good as the distributions and correlations fed into it. Independent draws for inputs that move together understate the tails. Report ranges, and say which assumptions drive them.' },
    { title: 'Adding a premium to the rate for project-specific worries', html: 'Raising the rate penalises later cash flows more and more, whatever the shape of the risk. Put risks that diversification removes into the expected cash flows, and keep the rate for systematic risk.' },
    { title: 'Claiming an option the firm can’t exercise', html: 'An option to abandon is worthless if a contract locks the firm in; an option to expand is worth little if a competitor will take the market first. Model who decides what, when, with what information, before adding an option value.' },
  ],

  application: [
    { p: 'In practice, risk analysis is part of how a proposal is written, not an afterthought. A good capital request shows the base NPV, a tornado of the five or so drivers that matter, two or three scenarios with the assumptions behind each, the break-even volume or price, and the plan for what management would do if the early evidence disappointed. Reviewers then argue about the inputs that move the answer rather than about every line of the model.' },
    { p: 'For a small firm like Lantern, the pessimistic case has a second use: it shows whether the business could survive the loss. A large, diversified company can take a project with a 30% chance of losing money if the expected NPV is positive, because one project’s failure is absorbed by the others. A two-café business with one big launch can’t diversify in the same way, which is why Ana should design Cold Brew as a series of smaller commitments: list with a few grocers, measure sell-through, and keep the right to stop. That is the option to abandon and the option to expand, put to work.' },
    { p: 'Large firms use simulation for projects whose risks interact: a mine whose output, metal price and costs are all uncertain, or a new plant whose demand depends on the economy. Its most useful output is often not the probability of loss but the conversation it forces about which inputs move together and why.' },
  ],

  summary: [
    'An NPV is a forecast. Risk analysis finds which assumptions it rests on, how bad things could get and what management could do about it.',
    'Sensitivity analysis moves one input at a time; a tornado chart ranks the inputs by the swing in NPV. For Cold Brew, volume dominates and the rate matters least.',
    'Scenario analysis moves inputs together into consistent stories; weighting them by probability gives the expected NPV, which can be below the base case when the downside is lopsided.',
    'Break-even volumes: accounting (EBIT = 0), cash (operating cash flow before tax = 0) and financial (NPV = 0). The financial break-even is the one that matters for value; for uneven projects, find it on the full model.',
    'Operating leverage (high fixed costs) magnifies the effect of volume on profit: DOL = contribution ÷ EBIT.',
    'Monte Carlo simulation gives a distribution of NPVs, but its precision is borrowed from assumed distributions; ignoring correlation understates the tails.',
    'Real options (to expand, abandon or wait) add value when the firm can act on new information; value them by modelling the decision.',
    'Systematic risk belongs in the discount rate; everything else belongs in the expected cash flows. Raising the rate for every worry double-counts.',
  ],

  glossary: [
    { term: 'Sensitivity analysis', def: 'Measuring how much a model’s output changes when an input changes, usually one input at a time, to find the assumptions that matter most.' },
    { term: 'Forecasting risk', def: 'The risk that a decision is wrong because the cash-flow forecasts behind it are wrong, through error, bias or optimism.' },
    { term: 'Tornado chart', def: 'A bar chart of a sensitivity analysis: one horizontal bar per input, showing the output (such as NPV) at the input’s low and high values, sorted with the widest swing at the top.' },
    { term: 'Scenario analysis', def: 'Measuring an outcome such as NPV under a few consistent sets of assumptions (for example pessimistic, base and optimistic), often weighted by probabilities to give an expected value.' },
    { term: 'Accounting break-even', def: 'The sales volume at which a project’s accounting profit (EBIT) is zero: (fixed costs + depreciation) ÷ contribution per unit.' },
    { term: 'Cash break-even', def: 'The sales volume at which revenue just covers variable and fixed cash costs, so operating cash flow before tax is zero: fixed cash costs ÷ contribution per unit.' },
    { term: 'Financial break-even', def: 'The sales volume (or other input) at which a project’s NPV is zero, so that it just earns its required return.' },
    { term: 'Operating leverage', def: 'The extent to which a business’s or project’s costs are fixed rather than variable; high operating leverage makes profit more sensitive to volume.' },
    { term: 'Degree of operating leverage', def: 'The percentage change in EBIT for a 1% change in volume: contribution ÷ EBIT at the current volume.' },
    { term: 'Monte Carlo simulation', def: 'Repeatedly drawing random values of a model’s uncertain inputs from probability distributions and recording the output each time, to estimate the distribution of the output.' },
    { term: 'Real option', def: 'A right, but not an obligation, to change a real investment later (expand, abandon, delay or switch) after learning more; it has value because it lets the firm avoid bad outcomes while keeping good ones.' },
  ],

  references: [
    { text: 'Damodaran, A. (2012). <i>Investment Valuation</i>, 3rd ed., chapter 33, “Probabilistic Approaches in Valuation: Scenario Analysis, Decision Trees, and Simulations”. Wiley. Author’s chapter PDF.', url: 'https://pages.stern.nyu.edu/~adamodar/pdfiles/val3ed/c33.pdf', checked: '2026-11-05' },
    { text: 'Damodaran, A. (2005). <i>The Promise and Peril of Real Options</i>. NYU Stern working paper S-DRP-05-02.', url: 'https://archive.nyu.edu/handle/2451/26802', checked: '2026-11-05' },
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 16.5, “Choosing between Projects” (projected cash flows are estimates, and a positive-NPV project can turn out badly if the future differs). OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/16-5-choosing-between-projects', checked: '2026-11-05' },
    { text: 'Microsoft. <i>Use Goal Seek to find the result you want by adjusting an input value</i> (Excel help).', url: 'https://support.microsoft.com/office/use-goal-seek-to-find-the-result-you-want-by-adjusting-an-input-value-320cb99e-f4a4-417f-b1c3-4f369d6e66c7', checked: '2026-11-05' },
  ],

  checks: [
    { what: 'Base NPV', value: nBase, shown: 25737, tol: 0.5 },
    { what: 'Base NPV equals the case', value: npv(r, coldBrewFlows().fcf), shown: 25737, tol: 0.5 },
    { what: 'Year-1 cans', value: cb.cans[0], shown: 30000 },
    { what: 'Promotion total', value: cb.promotion.reduce((a, b) => a + b, 0), shown: 93000 },
    { what: 'Tornado order: vol, price, cost, promo, rate (1 = yes)', value: T.map((t) => t.name).join() === 'vol,price,cost,promo,rate' ? 1 : 0, shown: 1 },
    { what: 'Vol low', value: tor.vol.lowNpv, shown: -29657, tol: 0.5 },
    { what: 'Vol high', value: tor.vol.highNpv, shown: 81131, tol: 0.5 },
    { what: 'Vol swing', value: tor.vol.swing, shown: 110789, tol: 0.5 },
    { what: 'Price low', value: tor.price.lowNpv, shown: 1330, tol: 0.5 },
    { what: 'Price high', value: tor.price.highNpv, shown: 50144, tol: 0.5 },
    { what: 'Price swing', value: tor.price.swing, shown: 48814, tol: 0.5 },
    { what: 'Cost low', value: tor.cost.lowNpv, shown: 39154, tol: 0.5 },
    { what: 'Cost high', value: tor.cost.highNpv, shown: 12320, tol: 0.5 },
    { what: 'Cost swing', value: tor.cost.swing, shown: 26834, tol: 0.5 },
    { what: 'Promo low', value: tor.promo.lowNpv, shown: 36445, tol: 0.5 },
    { what: 'Promo high', value: tor.promo.highNpv, shown: 15029, tol: 0.5 },
    { what: 'Promo swing', value: tor.promo.swing, shown: 21416, tol: 0.5 },
    { what: 'Rate low', value: tor.rate.lowNpv, shown: 30547, tol: 0.5 },
    { what: 'Rate high', value: tor.rate.highNpv, shown: 21382, tol: 0.5 },
    { what: 'Rate swing', value: tor.rate.swing, shown: 9166, tol: 0.5 },
    { what: '10 cents of shelf price in net cents', value: 10 * (1 - cb.tradeMargin), shown: 6.2 },
    { what: 'Pessimistic NPV', value: nWorst, shown: -46683, tol: 0.5 },
    { what: 'Optimistic NPV', value: nBest, shown: 69107, tol: 0.5 },
    { what: 'Expected NPV', value: eNpv, shown: 18474, tol: 0.5 },
    { what: 'Expected below base (1 = yes)', value: eNpv < nBase ? 1 : 0, shown: 1 },
    { what: 'Net price per can', value: cb.netPrice, shown: 2.16, tol: 0.005 },
    { what: 'Contribution per can', value: margin, shown: 1.4238, tol: 0.00005 },
    { what: 'Contribution per can (2 dp)', value: margin, shown: 1.42, tol: 0.005 },
    { what: 'Steady fixed costs', value: fixedSS, shown: 49000 },
    { what: 'Steady depreciation', value: depSS, shown: 1800 },
    { what: 'Accounting BE', value: BE.accounting, shown: 35679, tol: 0.5 },
    { what: 'Cash BE', value: BE.cash, shown: 34415, tol: 0.5 },
    { what: 'Fridge EAC', value: eacFridge, shown: 2435, tol: 0.5 },
    { what: '5-year annuity factor at 11%', value: (1 - 1.11 ** -5) / 0.11, shown: 3.6959, tol: 0.00005 },
    { what: 'Financial BE', value: BE.financial, shown: 36274, tol: 0.5 },
    { what: 'Financial BE by formula', value: (49000 + (2435 - 0.25 * 1800) / 0.75) / 1.4238, shown: 36274, tol: 1 },
    { what: 'Financial BE about 36,000 against 60,000 (ratio below 0.61)', value: BE.financial / 60000 < 0.61 ? 1 : 0, shown: 1 },
    { what: 'NPV break-even volume (% of forecast)', value: beVol, shown: 86.1, tol: 0.05 },
    { what: 'Margin of safety on volume below 14% (1 = yes)', value: 100 - beVol < 14 ? 1 : 0, shown: 1 },
    { what: 'Break-even shelf price', value: bePrice, shown: 3.17, tol: 0.005 },
    { what: 'Price margin (cents)', value: (cb.shelfPrice - 3.17) * 100, shown: 32, tol: 0.01 },
    { what: 'Roaster saving per kg', value: perKg, shown: 21.53, tol: 0.005 },
    { what: 'Roaster BE kg', value: roBE, shown: 2158, tol: 0.5 },
    { what: 'Roaster BE share of need (%)', value: roBE / ROASTER.kg * 100, shown: 90, tol: 0.5 },
    { what: 'Roaster need', value: ROASTER.kg, shown: 2400 },
    { what: 'Contribution at 60,000 cans', value: contrib, shown: 85428, tol: 0.5 },
    { what: 'Steady EBIT', value: ebitSS, shown: 34628, tol: 0.5 },
    { what: 'DOL', value: dol, shown: 2.47, tol: 0.005 },
    { what: '10% volume fall → EBIT fall (%)', value: dol * 10, shown: 25, tol: 0.5 },
    { what: 'MC independent mean', value: MC0.mean, shown: 25484, tol: 0.5 },
    { what: 'MC independent P(loss) %', value: MC0.pNeg * 100, shown: 26.2, tol: 0.05 },
    { what: 'MC independent p5', value: MC0.p5, shown: -39957, tol: 0.5 },
    { what: 'MC independent p95', value: MC0.p95, shown: 90897, tol: 0.5 },
    { what: 'MC correlated mean', value: MC1.mean, shown: 27374, tol: 0.5 },
    { what: 'MC correlated P(loss) %', value: MC1.pNeg * 100, shown: 29.0, tol: 0.05 },
    { what: 'MC correlated p5', value: MC1.p5, shown: -50825, tol: 0.5 },
    { what: 'MC correlated p95', value: MC1.p95, shown: 109274, tol: 0.5 },
    { what: 'High state NPV', value: nHigh, shown: 99596, tol: 0.5 },
    { what: 'Low state NPV (carry on)', value: nLow, shown: -48122, tol: 0.5 },
    { what: 'Expected without option = base', value: noOpt, shown: 25737, tol: 0.5 },
    { what: 'Abandon y0 flow', value: ab.fcf[0], shown: -19342, tol: 0.5 },
    { what: 'Abandon y1 flow', value: ab.fcf[1], shown: -16186, tol: 0.5 },
    { what: 'Fridges’ tax value after a year', value: ab.book, shown: 7200 },
    { what: 'NPV of stopping', value: nAb, shown: -33925, tol: 0.5 },
    { what: 'Stopping saves', value: nAb - nLow, shown: 14198, tol: 0.5 },
    { what: 'Expected with option', value: withOpt, shown: 32836, tol: 0.5 },
    { what: 'Option value', value: withOpt - noOpt, shown: 7099, tol: 0.5 },
    { what: 'NPV at 16%', value: N({ ...base, rate: 16 }), shown: 15595, tol: 0.5 },
    { what: '1.11 ÷ 1.16', value: 1.11 / 1.16, shown: 0.957, tol: 0.0005 },
    { what: 'Year-1 loss (%)', value: (1 - 1.11 / 1.16) * 100, shown: 4.3, tol: 0.05 },
    { what: '(1.11 ÷ 1.16)^5', value: (1.11 / 1.16) ** 5, shown: 0.802, tol: 0.0005 },
    { what: 'Year-5 loss (%)', value: (1 - (1.11 / 1.16) ** 5) * 100, shown: 19.8, tol: 0.05 },
    { what: 'Van depreciation', value: 30000 / 5, shown: 6000 },
    { what: 'Van accounting BE', value: van.accounting, shown: 1666.7, tol: 0.05 },
    { what: 'Van accounting BE (rounded)', value: van.accounting, shown: 1667, tol: 0.5 },
    { what: 'Van cash BE', value: van.cash, shown: 1500 },
    { what: 'Van EAC', value: eaa(30000, 0.10, 5), shown: 7914, tol: 0.5 },
    { what: 'Van financial BE', value: van.financial, shown: 1737.6, tol: 0.05 },
    { what: 'Van financial BE (rounded)', value: van.financial, shown: 1738, tol: 0.5 },
    { what: 'Van check EBIT', value: van.financial * 36 - 54000 - 6000, shown: 2552, tol: 0.5 },
    { what: 'Van check OCF', value: (van.financial * 36 - 54000 - 6000) * 0.75 + 6000, shown: 7914, tol: 0.5 },
    { what: 'Van margin vs 2,000 jobs (%)', value: (2000 - van.financial) / 2000 * 100, shown: 13, tol: 0.5 },
  ],
};
