// what-if-analysis.js — B03 · What-if analysis. Content only; exercises are in what-if-analysis.ex.js.
// Uses QUOTE and EVENTS from case.js, F02's event wages and M01's contribution margin and competitor (for checking the
// model), and the costing model, Ana's cost estimates and her December plan from what-if-analysis.ex.js (fictional,
// introduced here). The shop model and the July stock plan belong to the project and are not used.
import { QUOTE, EVENTS, EVENT_COLUMNS, DERIVED as D } from './case.js';
import { FACTS as F02 } from '../f02/case.js';
import { BUSINESS as M01, COMPETITOR } from '../m01/case.js';
import { Sheet, goalSeek, dataTable, solveSheet } from '../../../core/sheet.js';
import { COSTS as K, TEAM_DAY, BREAKFAST, costingCells, PLAN_CELLS, PLAN_SOLVER } from './what-if-analysis.ex.js';

// ---------------------------------------------------------------- the costing model, recomputed for the checks
const sheetFor = (ev, edits = {}) => { const s = new Sheet({ cells: costingCells(ev) }); Object.entries(edits).forEach(([c, x]) => s.set(c, x)); return s; };
const team = sheetFor(TEAM_DAY), bk = sheetFor(BREAKFAST);
const g = (s, c) => s.get(c);
const bk10 = (cell) => sheetFor(BREAKFAST, { [cell]: g(bk, cell) * 1.1 });          // one input up 10%
const scen = (ev, wage, cup, van) => sheetFor(ev, { B13: wage, B16: cup, B18: van });
const GUESTS = [40, 80, 120, 160], HOURS = [2, 3, 4, 5, 6];
const grid = dataTable(team, { target: 'B27', rowInput: 'B3', rowValues: GUESTS, colInput: 'B4', colValues: HOURS });
const ONE = [20, 40, 41, 60, 80, 81, 100, 120, 121, 160];
const three = sheetFor({ guests: 45, hours: 3, pastry: 0 });
const oneVar = dataTable(three, { target: 'B27', rowInput: 'B3', rowValues: ONE });
const gsTeam = goalSeek(team, { target: 'B28', goal: 0.45, changing: 'B8' }).value;
const small = sheetFor({ guests: 20, hours: 2, pastry: 0 });
// the December plan: Solver (Simplex LP) and brute force
const plan = new Sheet({ cells: PLAN_CELLS });
const solve = (edits = {}, opts = {}) => { const s = plan.clone(); Object.entries(edits).forEach(([c, x]) => s.set(c, x)); return solveSheet(s, { ...PLAN_SOLVER, ...opts }); };
const sInt = solve(), sLP = solve({}, { integer: [] });
const plans = [];
for (let E = 8; E <= 15; E++) for (let W = 0; W <= 3; W++) plans.push({ E, W, ok: 4 * E + 16 * W <= 90 && 3 * E + 3 * W <= 45, z: 350 * E + 950 * W });
const feas = plans.filter((p) => p.ok).sort((a, b) => b.z - a.z);
// back-test on the year's events: paid barista hours, wages and contribution at Ana's costs
const col = (n) => EVENTS.map((r) => r[EVENT_COLUMNS.indexOf(n)]);
const eg = col('guests'), eh = col('hours'), ep = col('pastries').map((p) => (p === 'yes' ? 1 : 0)), ed = col('days'), eb = col('baristas'), ei = col('invoice');
const paidHours = eb.reduce((t, b, i) => t + ed[i] * b * (eh[i] + K.setupHours), 0);
const yearCost = eg.reduce((t, x, i) => t + ed[i] * (Math.ceil(x / K.guestsPerBarista) * (eh[i] + K.setupHours) * K.wage + x * K.cup + ep[i] * K.platterCost + K.van), 0);
const yearInv = ei.reduce((t, x) => t + x, 0);

export default {
  slug: 'what-if-analysis',
  title: 'What-if analysis: data tables, Goal Seek, scenarios and Solver',
  blurb: 'A well-built model answers questions. Use one to see how a catering job’s contribution responds to guests, hours and costs (data tables and scenarios), to find the price that reaches a target margin (Goal Seek), and to choose the month’s best mix of events and workshops within limited time (Solver).',
  status: 'draft',
  objectives: [
    'Build a what-if model with inputs, calculations and outputs separated, one assumption per cell and no typed-in numbers in its formulas.',
    'Use one- and two-variable data tables, sensitivity analysis and Scenario Manager to show how an output responds to its inputs.',
    'Use Goal Seek to find the input that makes a formula reach a target, and check its answer by algebra.',
    'Construct a linear programme for a decision (decision variables, objective, constraints) and solve it with Solver’s Simplex LP method, with and without integer constraints.',
    'Interpret Solver’s results: binding constraints, slack, shadow prices, and infeasible or unbounded models.',
    'Evaluate a model’s answers with independent checks before acting on them.',
  ],
  prerequisites: [
    { lesson: 'b03/cells-and-formulas', why: 'Inputs kept apart from formulas, and absolute and mixed references, are what make a model you can question.' },
    { lesson: 'b03/functions-and-logic', why: 'The costing model uses MAX and ROUNDUP.' },
    { lesson: 'b03/conditional-sums-and-counts', why: 'SUMPRODUCT adds up what a plan uses of each resource.' },
    { lesson: 'b01/four-kinds-of-analytics', why: 'Scenarios, expected value and optimisation are the predictive and prescriptive ideas this lesson puts into a spreadsheet.' },
  ],
  case: 'lantern',

  concept: [
    { case: `By the end of 2026 Lantern Coffee Co.’s catering business has ${D.clients} clients and an event most weeks. Ana Lim prices every job from her quote sheet: $${QUOTE.setup} to set up, $${QUOTE.perGuest.toFixed(2)} a guest, $${QUOTE.perHour} an hour of service, $${QUOTE.platter} for a pastry platter, and a minimum invoice of $${QUOTE.minimum}. Two questions keep coming back. Does a particular job make money once the baristas, the coffee and the van are paid for? And when December’s enquiries pile up, which jobs should she take? This lesson builds a small model for the first question and an optimisation model for the second.` },

    { h: 'A model is a machine for questions' },
    { p: 'A spreadsheet model turns assumptions into results. It has three parts: <b>inputs</b>, the numbers you are given or assume (the guests, the price per guest, a barista’s wage); <b>calculations</b>, the formulas that combine them; and <b>outputs</b>, the results you care about (the invoice, what the job earns). The cells-and-formulas lesson set out the rule that makes this work: each assumption sits in its own labelled cell, and every formula refers to that cell instead of repeating the number.' },
    { p: 'A model built that way can be questioned. <g>What-if analysis</g> is the name for those questions: change an input and see what happens to an output, or fix the output you want and work back to the input that delivers it. Excel’s three built-in what-if tools, Scenario Manager, Goal Seek and data tables, are on the <b>Data</b> tab under <b>What-If Analysis</b>. Solver, an add-in, goes further and chooses several inputs at once.' },
    { figure: {
      svg: '<svg viewBox="0 0 640 250" xmlns="http://www.w3.org/2000/svg" font-size="13" fill="currentColor"><defs><marker id="wi-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--ink-3)"/></marker></defs><rect x="10" y="14" width="180" height="96" rx="6" fill="none" stroke="var(--series-1)" stroke-width="2"/><text x="100" y="36" text-anchor="middle" font-weight="bold">Inputs</text><text x="100" y="58" text-anchor="middle">guests, hours, pastries</text><text x="100" y="76" text-anchor="middle">prices (quote sheet)</text><text x="100" y="94" text-anchor="middle">costs (wage, coffee, van)</text><rect x="230" y="14" width="180" height="96" rx="6" fill="none" stroke="var(--ink)" stroke-width="2"/><text x="320" y="36" text-anchor="middle" font-weight="bold">Calculations</text><text x="320" y="58" text-anchor="middle">baristas needed</text><text x="320" y="76" text-anchor="middle">invoice</text><text x="320" y="94" text-anchor="middle">direct costs</text><rect x="450" y="14" width="180" height="96" rx="6" fill="none" stroke="var(--series-2)" stroke-width="2"/><text x="540" y="36" text-anchor="middle" font-weight="bold">Outputs</text><text x="540" y="62" text-anchor="middle">contribution</text><text x="540" y="82" text-anchor="middle">contribution margin ratio</text><line x1="190" y1="62" x2="228" y2="62" stroke="var(--ink-3)" stroke-width="1.5" marker-end="url(#wi-arrow)"/><line x1="410" y1="62" x2="448" y2="62" stroke="var(--ink-3)" stroke-width="1.5" marker-end="url(#wi-arrow)"/><line x1="100" y1="146" x2="536" y2="146" stroke="var(--series-1)" stroke-width="2" marker-end="url(#wi-arrow)"/><text x="318" y="138" text-anchor="middle">Sensitivity, data tables, scenarios: change inputs, watch the outputs</text><line x1="540" y1="186" x2="104" y2="186" stroke="var(--series-2)" stroke-width="2" marker-end="url(#wi-arrow)"/><text x="318" y="178" text-anchor="middle">Goal Seek: set one output to a target, find one input</text><line x1="100" y1="226" x2="536" y2="226" stroke="var(--series-3)" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#wi-arrow)"/><text x="318" y="218" text-anchor="middle">Solver: choose several inputs for the best output within limits</text></svg>',
      caption: 'A what-if model: inputs flow through calculations to outputs. The tools differ in which way they run and how many inputs they change.',
      alt: 'Three boxes in a row joined by arrows: Inputs (guests, hours, pastries; prices from the quote sheet; costs such as the wage, coffee and the van), then Calculations (baristas needed, invoice, direct costs), then Outputs (contribution and contribution margin ratio). Below them, three long arrows: one from inputs to outputs labelled sensitivity, data tables and scenarios, change inputs and watch the outputs; one from outputs back to inputs labelled Goal Seek, set one output to a target and find one input; and a dashed one from inputs to outputs labelled Solver, choose several inputs for the best output within limits.',
    } },

    { h: 'Ana’s costing model' },
    { p: `The quote sheet sets the invoice. To know what a job earns, Ana also needs its direct costs, the costs that exist only because the event happens. Her estimates for 2026 are fictional: baristas earn $${K.wage} an hour, for the hours of service plus ${K.setupHours} paid hour each for setting up and packing down; she sends one barista for every ${K.guestsPerBarista} guests or part of ${K.guestsPerBarista}; coffee, milk and cups cost $${K.cup.toFixed(2)} a guest; a pastry platter costs her $${K.platterCost}; and each event day uses about $${K.van} of van fuel and wear.` },
    { p: 'What is left of the invoice after the direct costs is the event’s <g>contribution margin</g>, called the contribution for short: the money the job adds towards Lantern’s fixed costs (rent, the van’s depreciation, Ana’s own time) and then profit. The contribution divided by the invoice is the contribution margin ratio. The table shows the model as Ana lays it out, with the first event she wants to price, a team day.' },
    { table: {
      caption: 'Ana’s costing model for one event day (sheet layout; the costs are fictional)',
      head: ['', 'A', 'B'],
      align: ['r', 'l', 'l'],
      rows: [
        ['3–5', 'Guests; hours of service; pastry platter (1 = yes, 0 = no)', '45; 5; 0'],
        ['7–11', 'Setup charge; price per guest; charge per hour; platter price; minimum invoice', '$60.00; $6.50; $30.00; $120.00; $300.00'],
        ['13–18', 'Wage per hour; paid set-up hours per barista; guests per barista; coffee per guest; platter cost; van per event day', '$23.00; 1; 40; $0.80; $70.00; $25.00'],
        ['20', 'Baristas', '<x>=ROUNDUP(B3/B15,0)</x>'],
        ['21', 'Invoice', '<x>=MAX(B11,B7+B8*B3+B9*B4+B10*B5)</x>'],
        ['22', 'Barista wages', '<x>=B20*(B4+B14)*B13</x>'],
        ['23', 'Coffee, milk and cups', '<x>=B3*B16</x>'],
        ['24', 'Pastry platter', '<x>=B5*B17</x>'],
        ['25', 'Van', '<x>=B18</x>'],
        ['26', 'Direct costs', '<x>=SUM(B22:B25)</x>'],
        ['27', 'Contribution', '<x>=B21-B26</x>'],
        ['28', 'Contribution margin ratio', '<x>=B27/B21</x>'],
      ],
      note: 'Rows 3–18 are inputs, typed once; rows 20–28 are formulas and are never typed over. The working model is the first widget under Explore.',
    } },
    { p: String.raw`For the team day, 45 guests with five hours of service and no pastries, the invoice is <m>60 + 6.50 \times 45 + 30 \times 5 = 502.50</m> dollars. Forty-five guests need two baristas, paid for six hours each: <m>2 \times 6 \times 23 = 276</m> dollars. With $36 of coffee, milk and cups and $25 for the van, the direct costs are $337 and the contribution is $165.50, a ratio of 32.9%.` },
    { p: String.raw`A breakfast for 120 guests with three hours of service and a platter looks very different. The invoice is <m>60 + 6.50 \times 120 + 30 \times 3 + 120 = 1{,}050</m> dollars; three baristas paid for four hours cost $276; with $96 of coffee, the $70 platter and the van, the direct costs are $467 and the contribution is $583, a ratio of 55.5%. Same quote sheet, very different jobs: the kind of difference a model exists to show.` },
    { callout: 'key', title: 'One assumption, one cell', html: 'Type every assumption once, in its own labelled input cell, and make every formula refer to it. <x>=ROUNDUP(B3/40,0)</x> hides the staffing rule where nobody can see or change it; <x>=ROUNDUP(B3/B15,0)</x> lets a data table, Goal Seek or a colleague change it in one place.' },

    { h: 'Four kinds of question' },
    { list: [
      '<b>What if this input changes?</b> Change it and watch the output: sensitivity analysis by hand, or a <g>data table</g> for a whole list of values at once.',
      '<b>What if several inputs change together?</b> Save each combination as a named <g>scenario</g> in Scenario Manager and compare them side by side.',
      '<b>What input reaches my target?</b> <g>Goal Seek</g> changes one input until a formula equals the value you want.',
      '<b>What is the best choice within my limits?</b> <g>Solver</g> chooses several inputs to make an output as large or as small as possible while respecting constraints: <g>optimisation</g>, the prescriptive analytics of B01, in a spreadsheet.',
    ] },
  ],

  theory: [
    { h: 'Building a model you can question' },
    { p: 'Good models share a layout: inputs grouped at the top (or on their own sheet) and labelled with their units, calculations below, and outputs where the reader looks first. Ana’s sheet keeps the event in B3:B5, the quote sheet in B7:B11, her cost estimates in B13:B18 and the results in B20:B28. Nothing in the results area is typed: every cell there is a formula.' },
    { list: [
      'Label every input with its unit and its source (the quote sheet; Ana’s estimate).',
      'Mark input cells so readers can tell them from formulas: a fill colour plus a note, since colour alone is easy to miss.',
      'Keep one assumption per cell. If the wage changes in January, one edit should update every job.',
      'Test the model on a case you can work by hand, as above, and at the edges: 40 guests should need one barista and 41 should need two.',
    ] },

    { h: 'Sensitivity analysis by hand' },
    { p: '<g>Sensitivity analysis</g> asks which assumptions matter. The simplest version raises one input at a time by the same proportion, say 10%, and records how far the output moves. The table does this for the breakfast, whose contribution is $583.' },
    { table: {
      caption: 'The breakfast’s contribution when one input at a time rises by 10% (fictional costs)',
      head: ['Input raised by 10%', 'New value', 'Contribution', 'Change'],
      align: ['l', 'r', 'r', 'r'],
      rows: [
        ['Price per guest', '$7.15', '$661.00', '+$78.00 (+13.4%)'],
        ['Barista wage', '$25.30', '$555.40', '−$27.60 (−4.7%)'],
        ['Guests', '132', '$559.40', '−$23.60 (−4.0%)'],
        ['Hours of service', '3.3', '$571.30', '−$11.70 (−2.0%)'],
        ['Coffee, milk and cups per guest', '$0.88', '$573.40', '−$9.60 (−1.6%)'],
        ['Pastry platter cost', '$77.00', '$576.00', '−$7.00 (−1.2%)'],
        ['Van cost per event day', '$27.50', '$580.50', '−$2.50 (−0.4%)'],
      ],
    } },
    { p: 'Two things stand out. The price per guest matters far more than any cost, so a small discount to win a job is expensive. And more guests <i>lower</i> the contribution: 132 guests need a fourth barista, whose four paid hours ($92) cost more than the extra 12 guests bring in ($68.40 after coffee). A model with steps in it can surprise you, which is why you test changes rather than assume their direction.' },
    { p: 'One-at-a-time changes have two limits. They ignore what happens when inputs move together, and a 10% change may cross a step (like the fourth barista) that a 5% change would not. Data tables and scenarios deal with both.' },

    { h: 'Data tables' },
    { p: 'A <g>data table</g> recalculates the model for a list of values of one input, or for every combination of values of two inputs, and lays the results out as a grid. You build it on the sheet. For a one-variable table with its values down a column, put a formula that refers to the output one row above and one column to the right of the first value. For a two-variable table, put that formula in the top-left corner, one input’s values down the column below it and the other’s across the row to its right. Select the whole block and choose <b>Data</b> › <b>What-If Analysis</b> › <b>Data Table</b>.' },
    { p: 'Excel’s names for the input cells trip people up. The <b>Row input cell</b> is the cell into which the values in the table’s <i>top row</i> are substituted; the <b>Column input cell</b> takes the values in its <i>left column</i>. So a one-variable table with its values down a column uses only the Column input cell. A data table handles at most two input variables, though each can take as many values as you like.' },
    { table: {
      caption: 'One-variable data table: contribution by guests (three hours of service, no pastries)',
      head: ['Guests', 'Baristas', 'Contribution'],
      align: ['r', 'r', 'r'],
      rows: [
        ['20', '1', '$167.00'], ['40', '1', '$261.00'], ['41', '2', '$174.70'], ['60', '2', '$283.00'], ['80', '2', '$397.00'],
        ['81', '3', '$310.70'], ['100', '3', '$419.00'], ['120', '3', '$533.00'], ['121', '4', '$446.70'], ['160', '4', '$669.00'],
      ],
    } },
    { p: 'Each time the guests pass a multiple of 40, Ana sends another barista for four paid hours and the contribution drops by $86.30: 41 guests earn less than 40. (At 20 guests the quote is $280 and the $300 minimum applies.) The rule “one barista per 40 guests” is a business decision written into the model, and the table shows what it costs at the edges.' },
    { table: {
      caption: 'Two-variable data table: contribution by guests (down) and hours of service (across), no pastries',
      head: ['Guests', '2 hours', '3 hours', '4 hours', '5 hours', '6 hours'],
      align: ['r', 'r', 'r', 'r', 'r', 'r'],
      rows: [
        ['40', '$254', '$261', '$268', '$275', '$282'],
        ['80', '$413', '$397', '$381', '$365', '$349'],
        ['120', '$572', '$533', '$494', '$455', '$416'],
        ['160', '$731', '$669', '$607', '$545', '$483'],
      ],
    } },
    { p: 'Read along a row and the hourly charge shows its weakness: each extra hour adds $30 to the invoice and $23 for every barista on the job. With one barista an hour earns $7; with two it loses $16, with three $39 and with four $62. Long events with many guests are the ones Ana under-prices, a pattern the challenging example turns into a pricing rule.' },
    { p: 'A data table recalculates whenever the worksheet does, even if nothing it depends on has changed, so a workbook with several large tables can become slow. Excel can be set to recalculate everything except data tables: in current versions the option is called <b>Partial</b> (File › Options › Formulas, or Formulas › Calculation Options). The tables then update only when you select them and press F9.' },

    { h: 'Scenarios and Scenario Manager' },
    { p: 'A <g>scenario</g>, in B01’s sense, is one possible future described by the values of the uncertain inputs. Excel’s <g>Scenario Manager</g> (Data › What-If Analysis › Scenario Manager) saves named sets of values for chosen changing cells, up to 32 of them, and substitutes a set into the sheet when you show it. Its <b>Scenario summary</b> report puts every scenario’s inputs and chosen result cells side by side on a new sheet.' },
    { p: 'Ana is unsure about her 2027 costs, so she saves three scenarios for the wage, the coffee cost per guest and the van cost, and summarises the breakfast:' },
    { table: {
      caption: 'Scenario summary for the breakfast (fictional 2027 costs)',
      head: ['', 'Base', 'Best', 'Worst'],
      align: ['l', 'r', 'r', 'r'],
      rows: [
        ['Barista wage per hour (B13)', '$23.00', '$23.00', '$26.00'],
        ['Coffee, milk and cups per guest (B16)', '$0.80', '$0.70', '$1.00'],
        ['Van per event day (B18)', '$25.00', '$22.00', '$32.00'],
        ['Direct costs (B26)', '$467.00', '$452.00', '$534.00'],
        ['Contribution (B27)', '$583.00', '$598.00', '$516.00'],
        ['Contribution margin ratio (B28)', '55.5%', '57.0%', '49.1%'],
      ],
    } },
    { p: 'Even in the worst case the breakfast keeps a ratio near one half, while the team day, run through the same three scenarios, falls from 32.9% to 22.6%. Scenario Manager has limits worth knowing:' },
    { list: [
      'Showing a scenario writes its values into the changing cells, replacing what was there, so save the current values as a Base scenario first.',
      'Summary reports are not recalculated: if the model changes, create the report again.',
      'A best or worst case puts every input at its extreme at once, which is rarely likely, and scenarios carry no probabilities. For an expected value, as in B01, you supply the probabilities yourself.',
      'Scenarios kept in other workbooks or sheets can be merged in, which helps when several people each supply one.',
    ] },

    { h: 'Goal Seek' },
    { p: '<g>Goal Seek</g> works backwards. You give it a <b>Set cell</b> that contains a formula, the value you want that cell to show (<b>To value</b>), and one input cell to change (<b>By changing cell</b>), which the formula must depend on. Excel tries values of the input, iterating until the formula reaches the target, and leaves the answer in the input cell. It changes exactly one input; for more, use Solver.' },
    { p: 'Ana wants a contribution margin ratio of at least 45% on every job, and the team day falls short. Goal Seek with Set cell B28, To value 0.45 and By changing cell B8 returns a price per guest of about $8.95; the simple example checks it by algebra. Goal Seek can fail or mislead in four ways:' },
    { list: [
      '<b>The target can’t be reached.</b> For a 20-guest, two-hour meeting the quote comes to $250, which the $300 minimum lifts to $300. Asking Goal Seek for an invoice of $250 by changing the price per guest fails: up to $9 a guest the invoice stays at $300, and above $9 it rises.',
      '<b>The output doesn’t respond near the starting value.</b> The same flat stretch can stop Goal Seek even when a solution exists further away; start it from a different value.',
      '<b>There is more than one answer.</b> Goal Seek returns the one it reaches first from the current value.',
      '<b>The answer makes no sense in practice.</b> Goal Seek may return 37.6 guests or a negative price. It knows nothing about whole numbers or common sense; you do.',
    ] },
    { p: 'Its answer is also a typed value, not a formula: change the costs and the price Goal Seek found is no longer right. Always check it by putting it back into the model, and where you can, solve the same equation by hand or with a formula that stays live.' },

    { h: 'Solver and linear programmes' },
    { p: 'Some questions have many inputs and limits at once. In late November Ana has to decide how many catering events to accept for December and how many Saturday barista workshops to run. Each job earns money but uses her time and the van, and she has only so much of both. Choosing the best combination is an optimisation problem with three parts. The <g>decision variables</g> are the quantities chosen: E, the events, and W, the workshops. The <g>objective</g> is the formula to maximise or minimise: total contribution. The <g>constraints</g> are the limits every plan must respect. Ana’s figures are fictional:' },
    { list: [
      'Contribution: about $350 a catering event (her costing model’s figure for a typical December booking) and $950 a workshop (12 places at $125, less $550 for the room, materials and a second trainer).',
      'Her hours: 4 per event (quoting, planning and starting the day on site) and 16 per workshop (preparing, selling places, the three-hour session and the follow-up). She can give 90 hours in December.',
      'Van hours: 3 per event and 3 per workshop (taking the training machine to the hired room and back). The van is free for 45 hours.',
      'Demand and commitments: at most 15 events (December’s enquiries), at most 3 workshops (Saturdays 5, 12 and 19 December), and at least 8 events, which are already confirmed.',
    ] },
    { math: String.raw`\begin{aligned} \text{maximise}\quad & 350E + 950W \\ \text{subject to}\quad & 4E + 16W \le 90 \quad \text{(her hours)} \\ & 3E + 3W \le 45 \quad \text{(van hours)} \\ & 8 \le E \le 15, \quad W \le 3 \\ & E,\ W \ge 0 \text{ and whole numbers} \end{aligned}` },
    { p: 'This is a <g>linear programme</g>: the objective and every constraint are sums of decision variables multiplied by constants. Linear models are solved exactly by the simplex method, Solver’s <b>Simplex LP</b> option. The figure draws this one. Each constraint is a line, and the plans that satisfy all of them form the shaded <g>feasible region</g>. Without whole numbers, the best plan lies at a corner of the region, here where Ana’s hours and the van hours run out together: 12.5 events and 2.5 workshops, worth $6,750.' },
    { figure: {
      svg: '<svg viewBox="0 0 760 330" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor"><polygon points="316,270 540,270 460,145 396,120 316,120" fill="var(--series-1)" fill-opacity="0.15" stroke="none"/><line x1="60" y1="270" x2="580" y2="270" stroke="var(--ink)" stroke-width="1.2"/><line x1="60" y1="270" x2="60" y2="40" stroke="var(--ink)" stroke-width="1.2"/><g text-anchor="middle" fill="var(--ink-3)"><text x="60" y="287">0</text><text x="124" y="287">2</text><text x="188" y="287">4</text><text x="252" y="287">6</text><text x="316" y="287">8</text><text x="380" y="287">10</text><text x="444" y="287">12</text><text x="508" y="287">14</text><text x="572" y="287">16</text></g><g text-anchor="end" fill="var(--ink-3)"><text x="52" y="274">0</text><text x="52" y="224">1</text><text x="52" y="174">2</text><text x="52" y="124">3</text><text x="52" y="74">4</text></g><text x="320" y="312" text-anchor="middle">Catering events, E</text><text x="18" y="160" text-anchor="middle" transform="rotate(-90 18 160)">Workshops, W</text><line x1="216.8" y1="50" x2="572" y2="188.75" stroke="var(--series-1)" stroke-width="2"/><text x="576" y="186">Her hours: 4E + 16W = 90</text><line x1="399.2" y1="50" x2="540" y2="270" stroke="var(--series-2)" stroke-width="2"/><text x="404" y="44">Van hours: 3E + 3W = 45</text><line x1="60" y1="120" x2="572" y2="120" stroke="var(--ink-3)" stroke-width="1.2" stroke-dasharray="5 4"/><text x="576" y="124">W = 3 (Saturdays)</text><line x1="540" y1="270" x2="540" y2="60" stroke="var(--ink-3)" stroke-width="1.2" stroke-dasharray="5 4"/><text x="544" y="70">E = 15</text><line x1="316" y1="270" x2="316" y2="60" stroke="var(--ink-3)" stroke-width="1.2" stroke-dasharray="5 4"/><text x="252" y="70">E = 8 (confirmed)</text><line x1="295" y1="50" x2="572" y2="209.5" stroke="var(--series-3)" stroke-width="1.5" stroke-dasharray="2 4"/><text x="576" y="214">Contribution $6,750</text><g fill="var(--ink-3)"><circle cx="316" cy="270" r="2.5"/><circle cx="348" cy="270" r="2.5"/><circle cx="380" cy="270" r="2.5"/><circle cx="412" cy="270" r="2.5"/><circle cx="444" cy="270" r="2.5"/><circle cx="476" cy="270" r="2.5"/><circle cx="508" cy="270" r="2.5"/><circle cx="540" cy="270" r="2.5"/><circle cx="316" cy="220" r="2.5"/><circle cx="348" cy="220" r="2.5"/><circle cx="380" cy="220" r="2.5"/><circle cx="412" cy="220" r="2.5"/><circle cx="444" cy="220" r="2.5"/><circle cx="476" cy="220" r="2.5"/><circle cx="508" cy="220" r="2.5"/><circle cx="316" cy="170" r="2.5"/><circle cx="348" cy="170" r="2.5"/><circle cx="380" cy="170" r="2.5"/><circle cx="412" cy="170" r="2.5"/><circle cx="444" cy="170" r="2.5"/><circle cx="316" cy="120" r="2.5"/><circle cx="348" cy="120" r="2.5"/><circle cx="380" cy="120" r="2.5"/></g><circle cx="460" cy="145" r="6" fill="none" stroke="var(--ink)" stroke-width="2"/><circle cx="476" cy="170" r="5" fill="var(--ink)"/><g font-size="12"><circle cx="600" cy="252" r="5" fill="none" stroke="var(--ink)" stroke-width="2"/><text x="612" y="256">Best with fractions:</text><text x="612" y="270">12.5 and 2.5, $6,750</text><circle cx="600" cy="288" r="5" fill="var(--ink)"/><text x="612" y="292">Best whole numbers:</text><text x="612" y="306">13 and 2, $6,450</text><circle cx="600" cy="322" r="2.5" fill="var(--ink-3)"/><text x="612" y="326">Other whole-number plans</text></g></svg>',
      caption: 'Ana’s December plan. The shaded area is the feasible region; dots are the whole-number plans inside it. The dotted line joins every plan worth $6,750 and touches the region only at the corner where her hours and the van hours meet.',
      alt: 'A graph with catering events E from 0 to 16 on the horizontal axis and workshops W from 0 to 4 on the vertical axis. A line for her hours, 4E + 16W = 90, falls gently from the top left to the right edge at about W = 1.6. A steeper line for van hours, 3E + 3W = 45, runs from about E = 10.6 at the top down to E = 15 on the horizontal axis. Dashed limit lines mark W = 3, E = 8 and E = 15. The shaded feasible region is bounded by E = 8 on the left, W = 3 on top, her-hours line and the van line on the right, and the axis below; its corners are (8, 0), (15, 0), (12.5, 2.5), (10.5, 3) and (8, 3). Twenty-four dots mark the whole-number plans inside it. An open circle at (12.5, 2.5) marks the best plan with fractions, worth $6,750, where a dotted line of equal contribution touches the region. A filled circle at (13, 2) marks the best whole-number plan, worth $6,450.',
    } },
    { p: 'Half an event is not a plan. Adding the <g>integer constraint</g> that E and W are whole numbers moves the answer to 13 events and 2 workshops, worth $6,450. Rounding the fractional answer would not have found it. Rounding to the nearest gives 13 events and 3 workshops, which needs 100 of Ana’s 90 hours and 48 of the 45 van hours; rounding down gives 12 and 2, worth only $6,100.' },

    { h: 'Setting up Solver' },
    { p: 'Solver comes with desktop Excel but must be switched on once: File › Options › Add-ins, choose Excel Add-ins in the Manage box, select Go and tick Solver Add-in. It then appears on the Data tab in the Analysis group. Lay the model out first, as the second widget does: the decision variables in their own cells (B4:C4), the objective as a formula of them (<x>=SUMPRODUCT(B4:C4,B5:C5)</x> in B6), and each constraint’s left-hand side as a formula beside its limit (<x>=SUMPRODUCT($B$4:$C$4,B9:C9)</x> in D9, filled to D10).' },
    { p: 'In the Solver Parameters dialog, <b>Set Objective</b> is the objective cell (B6); <b>To</b> is Max, Min or Value Of; and <b>By Changing Variable Cells</b> lists the decision variables, up to 200 of them. Add each constraint as a cell, a relationship (<x><=</x>, <x>=</x>, <x>>=</x>, int, bin or dif) and a limit, preferably a cell such as E9 rather than a typed number. Tick <b>Make Unconstrained Variables Non-Negative</b> unless a variable may go below zero. Then choose the solving method:' },
    { list: [
      '<b>Simplex LP</b> for linear models like this one. It finds the true optimum; with integer constraints it also searches the whole-number plans.',
      '<b>GRG Nonlinear</b> for smooth nonlinear models, such as one where a higher price lowers the number of bookings.',
      '<b>Evolutionary</b> for non-smooth models, with jumps or steps in them, such as ROUNDUP or IF applied to a decision variable.',
    ] },
    { p: 'When Solver stops, choose <b>Keep Solver Solution</b> or <b>Restore Original Values</b>, and pick any reports. Its <b>Integer Optimality (%)</b> option matters for whole-number models: at its default of 1%, Solver may stop at a whole-number plan within 1% of the best possible. Set it to 0 when you need the proven optimum.' },

    { h: 'Reading Solver’s answer' },
    { p: 'A <g>binding constraint</g> holds exactly at the optimum: the resource is used up. The others have <g>slack</g>, the limit minus what the plan uses. In Ana’s whole-number plan the van is binding (45 of 45 hours), while she has 6 of her 90 hours spare, 1 Saturday free and 2 enquiries unaccepted. Solver’s <b>Answer Report</b> lists the original and final values of the objective and the decision variables, and each constraint’s final value, status (binding or not) and slack.' },
    { p: 'The <b>Sensitivity Report</b> goes further, but only for models without integer or binary constraints. For each binding constraint it gives a <g>shadow price</g>: how much the optimal objective changes per unit increase in the limit, with the range over which that holds. In Ana’s model without the integer constraint, her hours and the van hours both have a shadow price of $50: with 91 hours the best contribution rises from $6,750 to $6,800. The $50 holds for up to 6 more of her hours; after that the Saturday limit binds and more hours add nothing.' },
    { p: 'With whole numbers, value comes in lumps. One or two more van hours change nothing in the whole-number plan, because E + W still can’t exceed 15; three more allow a fourteenth event and add $350. Shadow prices describe smooth trade-offs that whole-number plans don’t have, which is why Excel offers no Sensitivity Report once integer constraints are in the model. To see what a change is worth, change the limit and solve again.' },
    { p: 'Two other outcomes need recognising. If no plan meets every constraint, Solver reports that it could not find a feasible solution: with 16 events already confirmed, Ana’s model has no answer, because only 15 enquiries exist and 45 van hours cover at most 15 jobs. If the objective can grow without limit, Solver reports that the objective cell’s values do not converge, which nearly always means a constraint is missing. Remove her hours, the van and the enquiry limit, and Solver would book events without end.' },

    { h: 'Checking a model’s answers' },
    { p: 'A model can be wrong in its formulas, its assumptions or its use, and the tools above will happily optimise a mistake. Three habits catch most problems.' },
    { ol: [
      '<b>Solve it another way.</b> Goal Seek’s price can be checked by algebra. A small linear programme can be checked by listing every plan: with E from 8 to 15 and W from 0 to 3 there are 32 plans, 24 of them feasible; the best is 13 events and 2 workshops, and the next best, 10 events and 3 workshops, earns $100 less.',
      `<b>Back-test it.</b> Run the model on cases whose answers you know. Applied to all ${D.events} events of 2026, Ana’s assumptions give 1,082 paid barista hours and $24,886 of wages, against $25,200 of event wages in Lantern’s books (F02), about 1.2% less; and they leave a contribution of 44.9% of the year’s $62,320 of invoices, in line with the 45% contribution margin used in M01. The costing model is close enough to trust for pricing.`,
      '<b>Question the inputs.</b> The plan is only as good as the $350 per event and the 4 hours per event. A data table or a scenario on those estimates shows how far the plan depends on them.',
    ] },
  ],

  formulas: [
    { id: 'wi-baristas', name: 'Baristas for an event',
      tex: String.raw`B = \left\lceil \dfrac{G}{g} \right\rceil`,
      where: [[String.raw`B`, 'Baristas sent to the event', 'people'], [String.raw`G`, 'Guests', 'guests'], [String.raw`g`, 'Guests per barista (Ana’s rule: 40)', 'guests per barista']],
      assumptions: 'The ceiling brackets mean “round up to a whole number”: a part-group of guests still needs a barista.',
      note: 'In Excel: ROUNDUP(guests/guests_per_barista, 0), or CEILING(…, 1).' },
    { id: 'wi-invoice', name: 'Invoice from the quote sheet (one event day)',
      tex: String.raw`I = \max\!\left(M,\; S + pG + hH + kP\right)`,
      where: [[String.raw`I`, 'Invoice', '$'], [String.raw`M`, 'Minimum invoice', '$'], [String.raw`S`, 'Setup charge per event day', '$'], [String.raw`p`, 'Price per guest', '$ per guest'], [String.raw`G`, 'Guests', 'guests'], [String.raw`h`, 'Charge per hour of service', '$ per hour'], [String.raw`H`, 'Hours of service', 'hours'], [String.raw`k`, 'Pastry platter price', '$'], [String.raw`P`, '1 if a platter is ordered, 0 if not', '']],
      note: 'A two-day event is quoted day by day. Actual invoices add bespoke changes, so they differ a little from the quote.' },
    { id: 'wi-contribution', name: 'Contribution and contribution margin ratio of an event',
      tex: String.raw`C = I - \left[\,B(H + u)w + cG + qP + v\,\right], \qquad r = \dfrac{C}{I}`,
      where: [[String.raw`C`, 'Contribution of the event', '$'], [String.raw`I`, 'Invoice', '$'], [String.raw`B`, 'Baristas', 'people'], [String.raw`H`, 'Hours of service', 'hours'], [String.raw`u`, 'Paid set-up hours per barista', 'hours'], [String.raw`w`, 'Barista wage', '$ per hour'], [String.raw`c`, 'Coffee, milk and cups per guest', '$ per guest'], [String.raw`G`, 'Guests', 'guests'], [String.raw`q`, 'Pastry platter cost', '$'], [String.raw`P`, '1 if a platter is ordered, 0 if not', ''], [String.raw`v`, 'Van cost per event day', '$'], [String.raw`r`, 'Contribution margin ratio', '']],
      assumptions: 'Only direct costs are subtracted; fixed costs are covered by the contributions of all jobs together.' },
    { id: 'wi-target-price', name: 'Price per guest for a target contribution margin ratio',
      tex: String.raw`p^{*} = \dfrac{\dfrac{D}{1 - r^{*}} - S - hH - kP}{G}`,
      where: [[String.raw`p^{*}`, 'Price per guest that gives the target ratio', '$ per guest'], [String.raw`D`, 'Direct costs of the event', '$'], [String.raw`r^{*}`, 'Target contribution margin ratio', ''], [String.raw`S`, 'Setup charge', '$'], [String.raw`h`, 'Charge per hour', '$ per hour'], [String.raw`H`, 'Hours of service', 'hours'], [String.raw`k`, 'Platter price', '$'], [String.raw`P`, '1 if a platter is ordered, 0 if not', ''], [String.raw`G`, 'Guests', 'guests']],
      assumptions: 'The invoice needed, D ÷ (1 − r*), is above the minimum invoice; the direct costs don’t depend on the price.',
      note: 'This is the equation Goal Seek solves by trial when you set the ratio cell by changing the price.' },
    { id: 'wi-lp', name: 'A linear programme (maximisation)',
      tex: String.raw`\max \sum_{j} c_j x_j \quad \text{subject to} \quad \sum_{j} a_{ij} x_j \le b_i \ \text{for each } i, \qquad x_j \ge 0`,
      where: [[String.raw`i,\ j`, 'Indexes: i counts the constraints (resources), j the decision variables', ''], [String.raw`x_j`, 'Decision variable j (such as the number of events)', 'units chosen'], [String.raw`c_j`, 'Contribution of one unit of variable j', '$ per unit'], [String.raw`a_{ij}`, 'Amount of resource i that one unit of variable j uses', 'resource units per unit'], [String.raw`b_i`, 'Amount of resource i available (the limit)', 'resource units']],
      assumptions: 'Proportionality and additivity: doubling a variable doubles its contribution and its use of each resource, and the effects add up. Constraints can also be ≥ or =; integer constraints are added when the variables must be whole.' },
    { id: 'wi-slack', name: 'Slack in a constraint',
      tex: String.raw`s_i = b_i - \sum_{j} a_{ij} x_j`,
      where: [[String.raw`s_i`, 'Slack in constraint i at a solution', 'resource units'], [String.raw`b_i`, 'Limit of constraint i', 'resource units'], [String.raw`a_{ij}`, 'Use of resource i per unit of variable j', 'resource units per unit'], [String.raw`x_j`, 'Value of decision variable j in the solution', 'units']],
      note: 'A constraint with zero slack is binding.' },
  ],

  examples: [
    { level: 'simple', title: 'The price that gives the team day a 45% ratio', fictional: true,
      setup: 'The team day (45 guests, five hours of service, no pastries) earns a contribution of $165.50 on an invoice of $502.50, a contribution margin ratio of 32.9%. Ana wants at least 45%. Goal Seek (Set cell B28, To value 0.45, By changing cell B8) returns 8.949494… for the price per guest. Check it by algebra and decide what to quote.',
      steps: [
        'The direct costs don’t depend on the price per guest: two baristas × 6 paid hours × $23 = $276, plus 45 × $0.80 = $36 of coffee, plus $25 for the van: $337.',
        String.raw`A ratio of 45% means the costs are the other 55% of the invoice, so the invoice must be <m>337 \div (1 - 0.45) = 337 \div 0.55 \approx 612.73</m> dollars. That is above the $300 minimum, so the minimum doesn’t interfere.`,
        String.raw`The invoice is <m>60 + 45p + 30 \times 5</m>. Setting it to 612.73 gives <m>p = (612.73 - 60 - 150) \div 45 \approx 8.95</m> dollars a guest, the price Goal Seek found.`,
        'Check by putting $8.95 back in B8: the invoice becomes 60 + 45 × 8.95 + 150 = $612.75 and the contribution $275.75, a ratio of 45.0%. Rounding the price up to the cent keeps the ratio just above 45%.',
      ],
      answer: 'A price of $8.95 a guest, an invoice of $612.75, gives the team day a contribution of $275.75, a contribution margin ratio of 45.0%.',
      interpretation: String.raw`At $8.95 a guest the team day costs the client about <m>612.75 \div 45 \approx 13.62</m> dollars a head, far above Ana’s usual “about $9 a head” (M01) and Brewline Catering’s $7.50. Long, small events are expensive to staff, and the challenging example shows that the hourly charge, not the price per guest, is the better lever.` },
    { level: 'challenging', title: 'Where the hourly charge goes wrong', fictional: true,
      setup: 'The two-variable data table of contribution by guests and hours (no pastries) is in the In depth section. Explain the pattern along its rows, find the hourly charge per barista at which an extra hour never loses money, and judge whether Ana should charge for hours per barista.',
      steps: [
        'Read the table. At 40 guests (one barista) the contribution rises by $7 for each extra hour; at 80 guests it falls by $16 an hour, at 120 by $39 and at 160 by $62.',
        String.raw`Explain it with the model. An extra hour adds the hourly charge, $30, to the invoice and adds one paid hour per barista to the wages, <m>23B</m> dollars. The change in contribution per hour is <m>30 - 23B</m>: 7, −16, −39 and −62 for 1 to 4 baristas, exactly the table’s steps.`,
        String.raw`Find the break-even charge. If Ana charged <m>h</m> dollars an hour for each barista, an extra hour would change the contribution by <m>hB - 23B = (h - 23)B</m>, which is never negative when <m>h \ge 23</m>. At $30 per barista-hour every hour earns $7 per barista.`,
        String.raw`Test it on the team day (two baristas, five hours): the hourly charges become <m>30 \times 2 \times 5 = 300</m> dollars instead of $150, the invoice $652.50 and the contribution $315.50, a ratio of 48.4%. On the breakfast (three baristas, three hours) they become $270 instead of $90, an invoice of $1,230, or $10.25 a head.`,
        'Judge. The change fixes long events but raises short, crowded ones like the breakfast well above the $7.50 a head that Brewline Catering charges, and M01 records five bids lost to Brewline on price already. A narrower rule, charging per barista only for hours beyond three, would fix the team day without touching breakfasts.',
      ],
      answer: 'Each extra hour changes the contribution by 30 − 23B dollars, so it loses money whenever an event needs two or more baristas. Charging at least $23 per barista-hour removes the loss; $30 per barista-hour lifts the team day to a 48.4% ratio, but would price the breakfast at $10.25 a head. Applying it only to hours beyond three is the better rule.',
      interpretation: 'The data table found the problem; the model’s algebra explained it; the judgement about competitors came from outside the model. That is the usual division of labour: what-if tools show consequences, and people decide which consequences matter.' },
    { level: 'applied', title: 'Ana’s December plan with Solver', fictional: true,
      setup: 'In late November Ana must decide how many December catering events to accept and how many Saturday workshops to run, using the figures and constraints in the In depth section: $350 per event and $950 per workshop; 4 and 16 of her hours (90 available); 3 van hours each (45 available); at most 15 events and 3 workshops; at least 8 events already confirmed. Solve it, check the answer and recommend a plan.',
      steps: [
        'Lay out the model (the second widget): E and W in B4:C4; total contribution in B6, <x>=SUMPRODUCT(B4:C4,B5:C5)</x>; hours and van hours used in D9:D10, each a SUMPRODUCT of the plan and the resource row; the limits in E9:E10 and B13:B15.',
        'Solve with Simplex LP, maximising B6 by changing B4:C4, with the five constraints and B4:C4 = integer. Solver returns 13 events and 2 workshops, a contribution of $6,450.',
        'Read the constraints. Van hours used: 13 × 3 + 2 × 3 = 45 of 45, binding. Her hours: 13 × 4 + 2 × 16 = 84 of 90, 6 hours of slack. One Saturday and two enquiries are left unused.',
        'Check by another route. Without the integer constraint Solver gives 12.5 and 2.5 ($6,750), which is no plan; listing all 32 whole-number plans with 8 to 15 events and 0 to 3 workshops confirms that 13 and 2 is the best, $100 ahead of 10 events and 3 workshops ($6,350).',
        'Ask what would change the answer. Three more van hours would allow a fourteenth event and $350 more; ten more of her hours would allow the third workshop (12 events, 3 workshops, $7,050). The van, not her diary, is the first limit to relax.',
      ],
      answer: 'Accept 13 catering events and run 2 workshops (5 and 12 December, say), for a contribution of $6,450. The van is the binding constraint; Ana has 6 hours, 1 Saturday and 2 enquiries to spare.',
      interpretation: 'Solver answered the question the model asked. Whether to hire a second van for a few days, or to decline the enquiries politely and keep the clients for January, are business decisions that the model informs but doesn’t make. December in fact brought 13 events, as the events data show.' },
  ],

  demo: [
    { widget: 'wi-costing', intro: 'The costing model, starting with the team day. Run Goal Seek as set to find the price per guest for a 45% ratio, then make the two-variable data table of contribution by guests and hours. Change the inputs in B3:B18 to price other events or test other costs, and use Show formulas to see the model.' },
    { widget: 'wi-plan', intro: 'Ana’s December plan, laid out for Solver. Solve it, then switch the integer constraint and each limit off and on to see which plan wins and which constraints bind. Change a limit (E9, E10 or B15) and solve again.' },
  ],

  mistakes: [
    { title: '“I’ll put the 40 straight into the formula.”', html: 'A number typed into a formula is invisible to data tables, Goal Seek and Solver, and easy to miss when it changes. Every assumption belongs in a labelled input cell that the formulas refer to.' },
    { title: '“The values go across the top, so that’s the Column input cell.”', html: 'It is the other way round. The values in a data table’s top row are substituted into the <b>Row</b> input cell; the values in its left column go into the <b>Column</b> input cell. Swapping them gives a table that looks fine and is wrong.' },
    { title: '“Goal Seek found it, so it’s the answer.”', html: 'Goal Seek finds one value of one input from where it starts. It can fail on a flat stretch (a minimum invoice), stop at one of several answers, or return 37.6 guests. Put the value back into the model, check it makes sense, and solve by hand where you can.' },
    { title: '“Solver said 12.5 events, so I’ll book 13 and 3 workshops.”', html: 'Rounding a fractional optimum can break constraints (13 and 3 needs 100 of 90 hours) or miss the best whole-number plan. If the decisions must be whole, add integer constraints and solve again.' },
    { title: '“Solver’s answer is the best plan for the business.”', html: 'It is the best plan for the model. A missing constraint, a wrong estimate or a rule left out (a client who must be served) gives a confident answer to the wrong question. Read which constraints bind and ask whether the model is complete.' },
    { title: '“The worst case is what we should expect.”', html: 'A worst-case scenario sets every input at its extreme together, which is rarely likely. Scenarios show a range; to weigh them you need probabilities, as in B01’s expected value.' },
  ],

  application: [
    { p: 'What-if tools earn their keep in decisions that come round again and again. Three fictional cases show the pattern.' },
    { p: '<b>A hotel’s room rates.</b> The revenue manager of a seaside hotel keeps a model of a weekend’s revenue from occupancy and the room rate. A two-variable data table of rates against occupancy shows where a lower rate fills enough extra rooms to pay for itself, and Goal Seek answers the owner’s question: what rate keeps revenue at last year’s level if occupancy falls?' },
    { p: '<b>A food bank’s volunteer rota.</b> A food bank schedules volunteers across six shifts a week, each needing a minimum number of people, with each volunteer offering at most two shifts. Solver, with integer constraints, finds the fewest volunteers who can cover the week, and the slack in each shift shows where extra recruits would be wasted.' },
    { p: '<b>A bike shop’s service prices.</b> Before printing next year’s price list, a repair shop saves scenarios for labour and parts costs and checks that every service package keeps its target contribution margin ratio even in the worst case.' },
    { case: 'Ana used all four tools before December. The scenarios told her that the breakfast-type jobs were safe and the long team days were not. Solver’s plan of 13 events and 2 workshops matched the enquiries she accepted, and the van was, as the model said, the tight resource. From January 2027 her quote sheet charges $30 an hour for each barista on hours of service beyond the third, the narrower rule from the challenging example, and the model, with its inputs in their own cells, took one edit to update.' },
    { p: 'Two habits from this lesson carry into the rest of the course. Build the model so that its assumptions can be changed in one place, and check every answer a tool gives you by a second route before you act on it. The dashboards lesson that follows turns from deciding to reporting: how to show the results of decisions like these to the people who need them.' },
  ],

  summary: [
    'A what-if model separates inputs, calculations and outputs, with one assumption per labelled cell and no numbers typed into formulas.',
    'Sensitivity analysis changes one input at a time; a data table shows an output for lists of one or two inputs (top-row values go in the Row input cell, left-column values in the Column input cell); Scenario Manager saves named sets of up to 32 changing cells.',
    'Goal Seek changes one input until a formula reaches a target. It can fail on flat stretches or impossible targets, and its answer is a typed value: check it by algebra.',
    'An optimisation model has decision variables, an objective and constraints. A linear programme is solved exactly by Solver’s Simplex LP; GRG Nonlinear and Evolutionary handle smooth and non-smooth nonlinear models.',
    'Whole-number decisions need integer constraints: rounding a fractional optimum can be infeasible or second-best.',
    'Binding constraints are used up; the others have slack. Shadow prices (Sensitivity Report, models without integer constraints) say what one more unit of a limit is worth, within a range.',
    'Infeasible means no plan meets every constraint; an objective that does not converge usually means a missing constraint.',
    'Check a model by a second method, back-test it on known cases, and question its inputs before acting on its answers.',
  ],

  glossary: [
    { term: 'What-if analysis', def: 'Changing the inputs of a model to see how its outputs respond, or working back from a target output to the input values that reach it.' },
    { term: 'Contribution margin', def: 'Price received minus variable cost per unit: what each unit contributes towards fixed costs and then profit. As a share of price it is the contribution margin ratio.' },
    { term: 'Sensitivity analysis', def: 'Measuring how much a model’s output changes when an input changes, usually one input at a time, to find the assumptions that matter most.' },
    { term: 'Data table', def: 'An Excel what-if tool that recalculates a formula for a list of values of one input cell, or for every combination of values of two input cells, and shows the results as a grid.' },
    { term: 'Scenario Manager', def: 'An Excel what-if tool that saves named sets of values for up to 32 changing cells, substitutes a chosen set into the sheet and summarises the scenarios’ results side by side.' },
    { term: 'Goal Seek', def: 'An Excel what-if tool that finds the value of one input cell that makes a formula cell equal a target value, by trying values in turn.' },
    { term: 'Solver', def: 'An Excel add-in that chooses the values of several decision-variable cells to maximise, minimise or set the value of an objective cell, subject to constraints.' },
    { term: 'Decision variable', def: 'A quantity the decision maker controls and an optimisation model chooses, such as the number of events to accept; in Solver, a variable cell.' },
    { term: 'Objective', def: 'In an optimisation model, the quantity to be maximised or minimised, such as total contribution; in Solver, the formula in the objective cell.' },
    { term: 'Constraint', def: 'A limit that every solution of an optimisation model must respect, written as a formula compared with a bound by ≤, = or ≥, such as hours used ≤ hours available.' },
    { term: 'Linear programme', def: 'An optimisation model whose objective and constraints are all sums of decision variables multiplied by constants, so that it can be solved exactly by the simplex method.' },
    { term: 'Feasible region', def: 'The set of all values of the decision variables that satisfy every constraint of an optimisation model.' },
    { term: 'Integer constraint', def: 'A constraint that a decision variable must take a whole-number value; int in Excel’s Solver.' },
    { term: 'Binding constraint', def: 'A constraint that holds exactly at the optimum, so that the resource it describes is used up; relaxing it could improve the objective.' },
    { term: 'Slack', def: 'The unused part of a constraint at a solution: its limit minus what the solution uses.' },
    { term: 'Shadow price', def: 'In a linear programme without integer constraints, the change in the optimal objective per unit increase in a constraint’s limit, valid over a stated range.' },
  ],

  references: [
    { text: 'Microsoft. “Introduction to What-If Analysis”. Microsoft Support.', url: 'https://support.microsoft.com/en-us/Excel/introduction-to-what-if-analysis', checked: '2026-10-23' },
    { text: 'Microsoft. “Use Goal Seek to find the result you want by adjusting an input value”. Microsoft Support.', url: 'https://support.microsoft.com/office/use-goal-seek-to-find-the-result-you-want-by-adjusting-an-input-value-320cb99e-f4a4-417f-b1c3-4f369d6e66c7', checked: '2026-10-23' },
    { text: 'Microsoft. “Calculate multiple results by using a data table”. Microsoft Support.', url: 'https://support.microsoft.com/en-us/excel/calculate-multiple-results-by-using-a-data-table', checked: '2026-10-23' },
    { text: 'Microsoft. “Change formula recalculation, iteration, or precision in Excel”. Microsoft Support.', url: 'https://support.microsoft.com/office/change-formula-recalculation-iteration-or-precision-in-excel-73fc7dac-91cf-4d36-86e8-67124f6bcce4', checked: '2026-10-23' },
    { text: 'Microsoft. “Define and solve a problem by using Solver” and “Load the Solver Add-in in Excel”. Microsoft Support.', url: 'https://support.microsoft.com/en-us/excel/define-and-solve-a-problem-by-using-solver', checked: '2026-10-23' },
    { text: 'Frontline Systems. “Excel Solver Tutorial: Step by Step Easy to use guide for Excel’s Solver”. solver.com.', url: 'https://solver.com/node/181', checked: '2026-10-23' },
    { text: 'Frontline Systems. “Module 2: Reports and Sensitivity”. solver.com.', url: 'https://www.solver.com/courses/optimization/module-2/reports-and-sensitivity', checked: '2026-10-23' },
    { text: 'Frontline Systems. “Excel Solver: How Integer, Binary and Alldifferent constraints affect solving”. solver.com.', url: 'https://solver.com/node/192', checked: '2026-10-23' },
  ],

  checks: [
    // the case and the costs
    { what: 'Catering clients (case)', value: D.clients, shown: 18 },
    { what: 'Quote: setup', value: QUOTE.setup, shown: 60 },
    { what: 'Quote: per guest', value: QUOTE.perGuest, shown: 6.5 },
    { what: 'Quote: per hour', value: QUOTE.perHour, shown: 30 },
    { what: 'Quote: platter', value: QUOTE.platter, shown: 120 },
    { what: 'Quote: minimum', value: QUOTE.minimum, shown: 300 },
    { what: 'Wage (fictional)', value: K.wage, shown: 23 },
    { what: 'Paid set-up hours', value: K.setupHours, shown: 1 },
    { what: 'Guests per barista', value: K.guestsPerBarista, shown: 40 },
    { what: 'Coffee per guest', value: K.cup, shown: 0.8 },
    { what: 'Platter cost', value: K.platterCost, shown: 70 },
    { what: 'Van per event day', value: K.van, shown: 25 },
    // team day
    { what: 'Team day: guests', value: TEAM_DAY.guests, shown: 45 },
    { what: 'Team day: hours', value: TEAM_DAY.hours, shown: 5 },
    { what: 'Team day: invoice', value: g(team, 'B21'), shown: 502.5 },
    { what: 'Team day: baristas', value: g(team, 'B20'), shown: 2 },
    { what: 'Team day: paid hours each', value: TEAM_DAY.hours + K.setupHours, shown: 6 },
    { what: 'Team day: wages', value: g(team, 'B22'), shown: 276 },
    { what: 'Team day: coffee', value: g(team, 'B23'), shown: 36 },
    { what: 'Team day: direct costs', value: g(team, 'B26'), shown: 337 },
    { what: 'Team day: contribution', value: g(team, 'B27'), shown: 165.5 },
    { what: 'Team day: ratio (%)', value: g(team, 'B28') * 100, shown: 32.9, tol: 0.05 },
    // breakfast
    { what: 'Breakfast: guests', value: BREAKFAST.guests, shown: 120 },
    { what: 'Breakfast: invoice', value: g(bk, 'B21'), shown: 1050 },
    { what: 'Breakfast: baristas', value: g(bk, 'B20'), shown: 3 },
    { what: 'Breakfast: paid hours each', value: BREAKFAST.hours + K.setupHours, shown: 4 },
    { what: 'Breakfast: wages', value: g(bk, 'B22'), shown: 276 },
    { what: 'Breakfast: coffee', value: g(bk, 'B23'), shown: 96 },
    { what: 'Breakfast: direct costs', value: g(bk, 'B26'), shown: 467 },
    { what: 'Breakfast: contribution', value: g(bk, 'B27'), shown: 583 },
    { what: 'Breakfast: ratio (%)', value: g(bk, 'B28') * 100, shown: 55.5, tol: 0.05 },
    // sensitivity (+10%)
    { what: 'Sens: price', value: g(bk, 'B8') * 1.1, shown: 7.15 },
    { what: 'Sens: price contribution', value: g(bk10('B8'), 'B27'), shown: 661 },
    { what: 'Sens: price change', value: g(bk10('B8'), 'B27') - 583, shown: 78 },
    { what: 'Sens: price change (%)', value: (g(bk10('B8'), 'B27') / 583 - 1) * 100, shown: 13.4, tol: 0.05 },
    { what: 'Sens: wage', value: K.wage * 1.1, shown: 25.3 },
    { what: 'Sens: wage contribution', value: g(bk10('B13'), 'B27'), shown: 555.4 },
    { what: 'Sens: wage change', value: g(bk10('B13'), 'B27') - 583, shown: -27.6 },
    { what: 'Sens: wage change (%)', value: (g(bk10('B13'), 'B27') / 583 - 1) * 100, shown: -4.7, tol: 0.05 },
    { what: 'Sens: guests', value: BREAKFAST.guests * 1.1, shown: 132 },
    { what: 'Sens: guests contribution', value: g(bk10('B3'), 'B27'), shown: 559.4 },
    { what: 'Sens: guests change', value: g(bk10('B3'), 'B27') - 583, shown: -23.6 },
    { what: 'Sens: guests change (%)', value: (g(bk10('B3'), 'B27') / 583 - 1) * 100, shown: -4.0, tol: 0.05 },
    { what: 'Sens: hours', value: BREAKFAST.hours * 1.1, shown: 3.3 },
    { what: 'Sens: hours contribution', value: g(bk10('B4'), 'B27'), shown: 571.3 },
    { what: 'Sens: hours change', value: g(bk10('B4'), 'B27') - 583, shown: -11.7 },
    { what: 'Sens: hours change (%)', value: (g(bk10('B4'), 'B27') / 583 - 1) * 100, shown: -2.0, tol: 0.05 },
    { what: 'Sens: coffee', value: K.cup * 1.1, shown: 0.88 },
    { what: 'Sens: coffee contribution', value: g(bk10('B16'), 'B27'), shown: 573.4 },
    { what: 'Sens: coffee change', value: g(bk10('B16'), 'B27') - 583, shown: -9.6 },
    { what: 'Sens: coffee change (%)', value: (g(bk10('B16'), 'B27') / 583 - 1) * 100, shown: -1.6, tol: 0.05 },
    { what: 'Sens: platter cost', value: K.platterCost * 1.1, shown: 77 },
    { what: 'Sens: platter contribution', value: g(bk10('B17'), 'B27'), shown: 576 },
    { what: 'Sens: platter change', value: g(bk10('B17'), 'B27') - 583, shown: -7 },
    { what: 'Sens: platter change (%)', value: (g(bk10('B17'), 'B27') / 583 - 1) * 100, shown: -1.2, tol: 0.05 },
    { what: 'Sens: van', value: K.van * 1.1, shown: 27.5 },
    { what: 'Sens: van contribution', value: g(bk10('B18'), 'B27'), shown: 580.5 },
    { what: 'Sens: van change', value: g(bk10('B18'), 'B27') - 583, shown: -2.5 },
    { what: 'Sens: van change (%)', value: (g(bk10('B18'), 'B27') / 583 - 1) * 100, shown: -0.4, tol: 0.05 },
    { what: 'Fourth barista: four paid hours', value: 1 * 4 * K.wage, shown: 92 },
    { what: 'Twelve extra guests after coffee', value: 12 * (QUOTE.perGuest - K.cup), shown: 68.4 },
    { what: 'Extra guests', value: 132 - 120, shown: 12 },
    // one-variable data table
    ...ONE.map((x, i) => ({ what: `One-variable table: ${x} guests`, value: oneVar[i], shown: { 20: 167, 40: 261, 41: 174.7, 60: 283, 80: 397, 81: 310.7, 100: 419, 120: 533, 121: 446.7, 160: 669 }[x] })),
    ...ONE.map((x) => ({ what: `One-variable table: baristas at ${x}`, value: Math.ceil(x / 40), shown: { 20: 1, 40: 1, 41: 2, 60: 2, 80: 2, 81: 3, 100: 3, 120: 3, 121: 4, 160: 4 }[x] })),
    { what: 'Drop at 41 guests', value: oneVar[1] - oneVar[2], shown: 86.3 },
    { what: '20-guest quote at 3 hours', value: 60 + 6.5 * 20 + 30 * 3, shown: 280 },
    // two-variable data table
    ...GUESTS.flatMap((x, i) => HOURS.map((h, j) => ({ what: `Two-variable table: ${x} guests, ${h} hours`, value: grid[i][j],
      shown: [[254, 261, 268, 275, 282], [413, 397, 381, 365, 349], [572, 533, 494, 455, 416], [731, 669, 607, 545, 483]][i][j] }))),
    ...[1, 2, 3, 4].map((b) => ({ what: `Per extra hour with ${b} barista(s)`, value: QUOTE.perHour - K.wage * b, shown: { 1: 7, 2: -16, 3: -39, 4: -62 }[b] })),
    { what: 'Data table max inputs', value: 2, shown: 2 },
    // scenarios
    { what: 'Scenario best: coffee', value: 0.7, shown: 0.7 },
    { what: 'Scenario base: direct costs', value: g(scen(BREAKFAST, 23, 0.8, 25), 'B26'), shown: 467 },
    { what: 'Scenario best: direct costs', value: g(scen(BREAKFAST, 23, 0.7, 22), 'B26'), shown: 452 },
    { what: 'Scenario worst: direct costs', value: g(scen(BREAKFAST, 26, 1.0, 32), 'B26'), shown: 534 },
    { what: 'Scenario best: contribution', value: g(scen(BREAKFAST, 23, 0.7, 22), 'B27'), shown: 598 },
    { what: 'Scenario worst: contribution', value: g(scen(BREAKFAST, 26, 1.0, 32), 'B27'), shown: 516 },
    { what: 'Scenario best: ratio (%)', value: g(scen(BREAKFAST, 23, 0.7, 22), 'B28') * 100, shown: 57.0, tol: 0.05 },
    { what: 'Scenario worst: ratio (%)', value: g(scen(BREAKFAST, 26, 1.0, 32), 'B28') * 100, shown: 49.1, tol: 0.05 },
    { what: 'Team day worst scenario ratio (%)', value: g(scen(TEAM_DAY, 26, 1.0, 32), 'B28') * 100, shown: 22.6, tol: 0.05 },
    { what: 'Scenario Manager: changing cells', value: 32, shown: 32 },
    // Goal Seek
    { what: 'Goal Seek: team-day price', value: gsTeam, shown: 8.95, tol: 0.005 },
    { what: 'Goal Seek: algebra agrees', value: (g(team, 'B26') / 0.55 - 60 - 150) / 45, shown: 8.949494, tol: 1e-5 },
    { what: 'Team day: invoice needed', value: g(team, 'B26') / 0.55, shown: 612.73 },
    { what: 'Team day at $8.95: invoice', value: g(sheetFor(TEAM_DAY, { B8: 8.95 }), 'B21'), shown: 612.75 },
    { what: 'Team day at $8.95: contribution', value: g(sheetFor(TEAM_DAY, { B8: 8.95 }), 'B27'), shown: 275.75 },
    { what: 'Team day at $8.95: ratio (%)', value: g(sheetFor(TEAM_DAY, { B8: 8.95 }), 'B28') * 100, shown: 45.0, tol: 0.05 },
    { what: 'Team day at $8.95: per head', value: 612.75 / 45, shown: 13.62 },
    { what: 'Lantern about $9 a head (M01)', value: M01.catering.pricePerHead, shown: 9 },
    { what: 'Brewline per head (M01)', value: COMPETITOR.pricePerHead, shown: 7.5 },
    { what: 'Bids lost to Brewline (M01)', value: 5, shown: 5 },
    { what: 'Small meeting: quote', value: 60 + 6.5 * 20 + 30 * 2, shown: 250 },
    { what: 'Small meeting: invoice', value: g(small, 'B21'), shown: 300 },
    { what: 'Small meeting: price where the minimum stops', value: (300 - 60 - 60) / 20, shown: 9 },
    // challenging example
    { what: 'Team day with $30 per barista-hour: hourly charges', value: 30 * 2 * 5, shown: 300 },
    { what: 'Team day with $30 per barista-hour: invoice', value: 60 + 6.5 * 45 + 300, shown: 652.5 },
    { what: 'Team day with $30 per barista-hour: contribution', value: 60 + 6.5 * 45 + 300 - g(team, 'B26'), shown: 315.5 },
    { what: 'Team day with $30 per barista-hour: ratio (%)', value: (60 + 6.5 * 45 + 300 - g(team, 'B26')) / (60 + 6.5 * 45 + 300) * 100, shown: 48.4, tol: 0.05 },
    { what: 'Breakfast with $30 per barista-hour: hourly charges', value: 30 * 3 * 3, shown: 270 },
    { what: 'Breakfast with $30 per barista-hour: invoice', value: g(bk, 'B21') - 90 + 270, shown: 1230 },
    { what: 'Breakfast with $30 per barista-hour: per head', value: (g(bk, 'B21') - 90 + 270) / 120, shown: 10.25 },
    // December plan
    { what: 'Plan: contribution per event', value: 350, shown: 350 },
    { what: 'Plan: contribution per workshop', value: 12 * 125 - 550, shown: 950 },
    { what: 'Workshop places × price (M01)', value: M01.workshops.avgParticipants * M01.workshops.pricePerPerson, shown: 1500 },
    { what: 'Plan: her hours available', value: PLAN_CELLS.E9, shown: 90 },
    { what: 'Plan: van hours available', value: PLAN_CELLS.E10, shown: 45 },
    { what: 'Plan: Solver (integer) events', value: sInt.values.B4, shown: 13 },
    { what: 'Plan: Solver (integer) workshops', value: sInt.values.C4, shown: 2 },
    { what: 'Plan: Solver (integer) contribution', value: sInt.objective, shown: 6450 },
    { what: 'Plan: brute force agrees', value: feas[0].z, shown: 6450 },
    { what: 'Plan: optimum is unique', value: feas.filter((p) => p.z === feas[0].z).length, shown: 1 },
    { what: 'Plan: Solver (LP) events', value: sLP.values.B4, shown: 12.5 },
    { what: 'Plan: Solver (LP) workshops', value: sLP.values.C4, shown: 2.5 },
    { what: 'Plan: Solver (LP) contribution', value: sLP.objective, shown: 6750 },
    { what: 'Rounded to 13 and 3: her hours', value: 4 * 13 + 16 * 3, shown: 100 },
    { what: 'Rounded to 13 and 3: van hours', value: 3 * 13 + 3 * 3, shown: 48 },
    { what: 'Rounded down to 12 and 2', value: 350 * 12 + 950 * 2, shown: 6100 },
    { what: 'Corner (10.5, 3) on her hours', value: (90 - 16 * 3) / 4, shown: 10.5 },
    { what: 'Plan: van used', value: 3 * 13 + 3 * 2, shown: 45 },
    { what: 'Plan: her hours used', value: 4 * 13 + 16 * 2, shown: 84 },
    { what: 'Plan: her slack', value: 90 - 84, shown: 6 },
    { what: 'Plans listed', value: plans.length, shown: 32 },
    { what: 'Feasible plans', value: feas.length, shown: 24 },
    { what: 'Second best: events', value: feas[1].E, shown: 10 },
    { what: 'Second best: workshops', value: feas[1].W, shown: 3 },
    { what: 'Second best: contribution', value: feas[1].z, shown: 6350 },
    { what: 'Second best: gap', value: feas[0].z - feas[1].z, shown: 100 },
    { what: 'Shadow price of her hour (LP, 91 hours)', value: solve({ E9: 91 }, { integer: [] }).objective - sLP.objective, shown: 50, tol: 1e-6 },
    { what: 'LP with 91 hours', value: solve({ E9: 91 }, { integer: [] }).objective, shown: 6800, tol: 1e-6 },
    { what: 'Shadow price of a van hour (LP, 46 hours)', value: solve({ E10: 46 }, { integer: [] }).objective - sLP.objective, shown: 50, tol: 1e-6 },
    { what: 'Her hours: $50 holds for 6 more (96 hours)', value: solve({ E9: 96 }, { integer: [] }).objective - sLP.objective, shown: 300, tol: 1e-6 },
    { what: 'Her hours: nothing beyond 96', value: solve({ E9: 97 }, { integer: [] }).objective - solve({ E9: 96 }, { integer: [] }).objective, shown: 0, tol: 1e-6 },
    { what: 'Integer: 46 van hours, no change', value: solve({ E10: 46 }).objective - sInt.objective, shown: 0 },
    { what: 'Integer: 48 van hours adds', value: solve({ E10: 48 }).objective - sInt.objective, shown: 350 },
    { what: 'Integer: 100 of her hours', value: solve({ E9: 100 }).objective, shown: 7050 },
    { what: 'Infeasible with 16 confirmed', value: solve({ B15: 16 }).ok ? 1 : 0, shown: 0 },
    { what: '16 events need van hours', value: 16 * 3, shown: 48 },
    { what: '45 van hours cover jobs', value: 45 / 3, shown: 15 },
    { what: 'Solver variable cells', value: 200, shown: 200 },
    { what: 'Integer optimality default (%)', value: 1, shown: 1 },
    // back-test
    { what: 'Events in 2026', value: EVENTS.length, shown: 76 },
    { what: 'Paid barista hours (model)', value: paidHours, shown: 1082 },
    { what: 'Model wages', value: paidHours * K.wage, shown: 24886 },
    { what: 'Event wages in the books (F02)', value: F02.wages.events, shown: 25200 },
    { what: 'Model wages below the books (%)', value: (1 - paidHours * K.wage / F02.wages.events) * 100, shown: 1.2, tol: 0.05 },
    { what: 'Model contribution share of invoices (%)', value: (1 - yearCost / yearInv) * 100, shown: 44.9, tol: 0.05 },
    { what: 'Invoices in 2026', value: yearInv, shown: 62320 },
    { what: 'M01 contribution margin (%)', value: M01.catering.contributionMargin * 100, shown: 45 },
    { what: 'December events in the data', value: EVENTS.filter((r) => r[1].startsWith('2026-12')).length, shown: 13 },
    { what: 'January rule: hours beyond', value: 3, shown: 3 },
  ],
};
