// choosing-between-projects.js — F05 · Choosing between projects. Content only; exercises are in choosing-between-projects.ex.js.
// Uses ROASTERS (two mutually exclusive roasters with different lives), ROASTER (its maintenance, kitchen corner and the yearly
// saving), PROPOSALS and BUDGET_2028 (capital rationing), coldBrewFlows() and roasterFlows() and WORKING_RATE from case.js.
// The kiosks, cargo bike and solar panels are valued as in net-present-value: the case’s yearly savings are after-tax cash
// flows, with no resale value. Tideline Kayaks, Ravensmoor Hotel and Haverlock Events are fictional.
import { ROASTER, ROASTERS, PROPOSALS, BUDGET_2028, WORKING_RATE, TAX, coldBrewFlows, roasterFlows, DERIVED } from './case.js?v=30';
import { projectCashFlows, depreciation, eaa } from '../../../core/corpfin.js?v=30';
import { npv, irr, crossover, profitabilityIndex, ration } from '../../../core/invest.js?v=30';

const r = WORKING_RATE;
const af = (n, k = r) => (1 - (1 + k) ** -n) / k;
// Tideline Kayaks: scale
const S = [-50000, 20000, 20000, 20000, 20000], L = [-120000, 44000, 44000, 44000, 44000], D = L.map((x, i) => x - S[i]);
// Ravensmoor Hotel: timing
const Q = [-50000, 36000, 20000, 6000, 2000], W = [-50000, 0, 8000, 24000, 52000];
const X = crossover(W, Q)[0];
// The roasters: cost streams (the yearly saving, maintenance and kitchen corner are the same for both and left out)
const costFlows = (m) => projectCashFlows({ capex: m.price, years: m.life, revenue: Array(m.life).fill(0), variable: Array(m.life).fill(0), fixed: m.operator,
  dep: depreciation(m.price, { method: 7 }).slice(0, m.life), tax: TAX, salvage: m.salvage });
const [A, B] = ROASTERS;
const cA = costFlows(A), cB = costFlows(B);
const pvA = npv(r, cA.fcf), pvB = npv(r, cB.fcf);
const eacA = -eaa(pvA, r, A.life), eacB = -eaa(pvB, r, B.life);
const chain = (pv, n, H = 28) => { let s = 0; for (let k = 0; k < H / n; k++) s += pv / (1 + r) ** (k * n); return s; };
const fullFlows = (m) => projectCashFlows({ capex: m.price, years: m.life, revenue: Array(m.life).fill(DERIVED.roasterSavingPerYear), variable: Array(m.life).fill(0),
  fixed: m.operator + ROASTER.maintenance + ROASTER.space, dep: depreciation(m.price, { method: 7 }).slice(0, m.life), tax: TAX, salvage: m.salvage }).fcf;
const nA = npv(r, fullFlows(A)), nB = npv(r, fullFlows(B));
// Capital rationing
const small = PROPOSALS.slice(2).map((p) => ({ ...p, flows: [-p.outlay, ...Array(p.life).fill(p.saving)] }));
const cb = coldBrewFlows().fcf, ro = roasterFlows().fcf;
const P = [{ name: 'Cold Brew', flows: cb }, { name: 'Roaster', flows: ro }, ...small.map((p) => ({ name: p.name, flows: p.flows }))]
  .map((p) => ({ ...p, outlay: -p.flows[0], npv: npv(r, p.flows), pi: profitabilityIndex(r, p.flows) }));
const RA = ration(P, BUDGET_2028);
const allPos = P.filter((p) => p.npv > 0);
const sum = (a, k) => a.reduce((s, p) => s + p[k], 0);
// Haverlock Events: where the PI shortcut fails
const H = [{ name: 'X', outlay: 60000, npv: 18000 }, { name: 'Y', outlay: 50000, npv: 14000 }, { name: 'Z', outlay: 50000, npv: 13500 }];
const RH = ration(H, 100000);

export default {
  slug: 'choosing-between-projects',
  title: 'Choosing between projects',
  blurb: 'When projects compete for the same slot, the same money or the same years, the NPV rule needs care. Learn to choose between mutually exclusive projects of different size, timing and life, to compare machines with the equivalent annual cost, and to pick the best set of projects when the budget is fixed.',
  status: 'draft',
  objectives: [
    'Distinguish independent from mutually exclusive projects, and explain why the higher IRR can point to the wrong one.',
    'Calculate the incremental IRR of two projects of different scale and the crossover rate of two projects with different timing, and use them to choose.',
    'Compare projects with unequal lives by the replacement-chain method and by the equivalent annual annuity or cost, and state the assumptions both need.',
    'Decide when to replace an existing asset by comparing the cost of keeping it one more year with the equivalent annual cost of a new one.',
    'Select the best set of projects within a fixed budget, explain when ranking by profitability index fails, and distinguish soft from hard capital rationing.',
  ],
  prerequisites: [
    { lesson: 'f05/investment-criteria', why: 'You need the IRR, the NPV profile and the profitability index, and the warning there that IRR can mislead for mutually exclusive projects.' },
    { lesson: 'f05/project-cash-flows', why: 'The roasters’ and Cold Brew’s free cash flows are built there: tax, MACRS depreciation, working capital and after-tax salvage.' },
    { lesson: 'f04/annuities', why: 'The equivalent annual annuity is an annuity payment worked backwards from a present value.' },
    { lesson: 'f04/inflation-and-real-returns', why: 'Comparing machines over repeated replacements is done in real terms: real cash flows with a real rate.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'February 2028. Ana Lim has more good ideas than money. Cold Brew and an in-house roaster both have positive NPVs at her working rate of 11%, and so do ordering kiosks for the cafés and an electric cargo bike. But she can spend only $40,000 at the start of April without new financing, and if she does buy a roaster, she must choose between two machines: a 15 kg-batch roaster that lasts seven years and a cheaper 5 kg-batch one that lasts four. The NPV rule says “accept every project with a positive NPV”. It does not say what to do when accepting one project rules out another.' },
    { p: 'Most projects are <g>independent projects</g>: taking one has no effect on whether you can take another, so each is judged on its own and every positive-NPV project is accepted. <g>Mutually exclusive projects</g> are different: taking one rules out the others. Two roasters for one kitchen corner, two designs for the same building, or doing a refit now rather than next year are mutually exclusive. So, in effect, are independent projects that compete for a fixed budget.' },
    { p: 'For mutually exclusive projects the rule becomes: <b>choose the one with the highest NPV</b>, provided its NPV is positive and the projects are compared over the same period and at a rate that fits their risk. NPV measures the value each project adds in today’s dollars, and the owners want the most value, not the highest percentage return or the quickest payback.' },
    { p: 'This lesson is about the three ways that simple rule gets misapplied, and the tools that fix each one:' },
    { list: [
      '<b>Scale.</b> A small project can have the higher IRR and the lower NPV. The fix is to look at the extra cash flows of the bigger one: its incremental IRR.',
      '<b>Timing.</b> A project that pays back early can have the higher IRR at the same time as one that pays later has the higher NPV. The ranking depends on the rate, and the crossover rate shows where it flips.',
      '<b>Unequal lives.</b> A machine that lasts four years can’t be compared with one that lasts seven by their NPVs alone. Convert each to an equivalent annual figure, or line them up over a common period.',
    ] },
    { p: 'Then comes a fixed budget, <g>capital rationing</g>: the task is no longer to judge projects one by one but to choose the set that adds the most value within the money available. A ratio, the profitability index, usually finds it, but not always.' },
    { callout: 'key', title: 'One rule underneath', html: 'Every method in this lesson is the NPV rule applied with care: compare like with like (same period, same risk, same budget), and pick the choice that adds the most present value. IRR, the profitability index and annual equivalents are shortcuts that agree with NPV only under conditions you must check.' },
  ],

  theory: [
    { h: 'Scale: when the bigger project has the lower IRR' },
    { p: 'Tideline Kayaks, a fictional rental business, has room on its jetty for one fleet. A small fleet costs $50,000 and returns $20,000 a year for four years; a large one costs $120,000 and returns $44,000 a year. At its 11% cost of capital (the same rate Lantern uses, by coincidence) the small fleet has an NPV of $12,049 and an IRR of 21.9%; the large one has an NPV of $16,508 and an IRR of 17.3%. Ranked by IRR the small fleet wins; ranked by NPV the large one does.' },
    { p: 'IRR is a rate per dollar invested; NPV is dollars of value. The large fleet earns a lower rate, but on $70,000 more capital, and the question is whether that extra $70,000 earns enough. Subtract the small fleet’s cash flows from the large fleet’s, year by year: the difference is a project in its own right, costing $70,000 today and returning $24,000 a year for four years. Its IRR, the <g>incremental IRR</g>, is 14.0%, above the 11% the money costs, and its NPV is $4,459, exactly the gap between the two NPVs. Taking the large fleet is the same as taking the small one plus this extra project, and the extra project is worth doing.' },
    { callout: 'note', title: 'Subtract in the order that makes the difference look like an investment', html: 'Take the larger (or later-paying) project minus the smaller one, so the difference starts with an outflow. Then the usual reading applies: accept the extra if its IRR exceeds the cost of capital. If the difference starts with an inflow, its IRR has the borrowing reading from investment-criteria (accept if the IRR is <i>below</i> the rate), which is an easy place to slip.' },

    { h: 'Timing: the crossover rate' },
    { p: 'Ravensmoor Hotel, also fictional, can spend $50,000 on one of two projects. Refurbishing the rooms pays $36,000, $20,000, $6,000 and $2,000 over four years: quick but short-lived. A small spa pays nothing in year 1 and then $8,000, $24,000 and $52,000. The refurbishment’s IRR is 17.3% and the spa’s 16.0%, but at 11% the spa’s NPV is $8,296 against $4,369 for the refurbishment.' },
    { p: 'The two NPV profiles cross. At a 0% rate the spa is worth far more ($34,000 of undiscounted net cash against $14,000), because it pays more in total. As the rate rises, the spa’s distant cash loses value faster than the refurbishment’s near cash, and above a certain rate the refurbishment comes out ahead. That rate, the <g>crossover rate</g> (also called Fisher’s rate of intersection), is the IRR of the difference between the two projects: here (spa − refurbishment) = 0, −36,000, −12,000, +18,000, +50,000, whose IRR is 15.05%.' },
    { list: [
      'Below 15.05%, the spa has the higher NPV. At Ravensmoor’s 11% it is the better choice, by $3,926.',
      'Above 15.05% (but below both IRRs), the refurbishment has the higher NPV.',
      'IRR ranks the projects as if the rate were above the crossover, whatever the actual cost of capital. That is why IRR alone can’t choose between mutually exclusive projects.',
    ] },
    { p: 'The crossover rate is also a measure of how robust the choice is. Ravensmoor’s cost of capital would have to be more than four points higher than 11% before the ranking changed, so a modest error in the rate doesn’t matter here. When the crossover sits close to the cost of capital, the choice is fragile, and effort spent estimating the rate (module 3) pays off.' },

    { h: 'Unequal lives: the replacement chain' },
    { p: 'Now Lantern’s two roasters. Both would roast the 2,400 kg a year Lantern needs, so the saving against Kilnworth’s beans is the same whichever Ana buys, and so are the green beans, the gas and bags, the maintenance and the kitchen corner (assumptions made for this comparison). What differs is the price, the life, the resale value and the operator: the 5 kg roaster needs more batches, so more paid hours.' },
    { table: {
      caption: 'Lantern’s two roasters (fictional figures from the case)',
      head: ['', 'Roaster A (15 kg batch)', 'Roaster B (5 kg batch)'],
      align: ['l', 'r', 'r'],
      rows: [
        ['Price, installed', '$48,000', '$22,000'],
        ['Life', '7 years', '4 years'],
        ['Operator, a year', '$30,000', '$36,000'],
        ['Resale value at the end of its life', '$8,000', '$3,000'],
        ['Present value of its costs after tax at 11%', '$142,700', '$100,195'],
      ],
      note: 'Both are 7-year MACRS property, taxed at 25%; each is sold at the end of its life and the gain over its remaining tax value is taxed. As in the case’s cash-flow model, each machine takes the full Table A-1 percentage in its year of sale: the half-year rule for the year of disposal (project-cash-flows) is ignored here, a small difference that is mostly timing. The costs exclude everything that is the same for both machines.',
    } },
    { p: 'B’s costs have the lower present value, $100,195 against $142,700, so B looks cheaper. But that compares four years of roasting with seven. One fair comparison is a <g>replacement chain</g>: assume each roaster is replaced by an identical one when it wears out, and compare the chains over a period both fit into, the least common multiple of the lives. For 4 and 7 years that is 28 years: seven B roasters in a row against four As. Discounting each machine’s present value back from the date it is bought, A’s chain costs $260,485 and B’s $277,793 in today’s money. A is cheaper by $17,309.' },

    { h: 'Unequal lives: the equivalent annual annuity and cost' },
    { p: 'Chains get long (lives of 7 and 9 need 63 years), so a shortcut is used. The <g>equivalent annual annuity</g> (EAA) of a project is the level yearly amount, over its life, with the same present value as the project. For a cost-only comparison the same idea is called the <g>equivalent annual cost</g> (EAC). It is the annuity payment from F04 worked backwards from a present value:' },
    { math: String.raw`\text{EAA} = \text{NPV} \times \dfrac{r}{1 - (1 + r)^{-n}}` },
    { p: 'For roaster A, <m>142{,}700 \\times 0.11 \\div (1 - 1.11^{-7}) = 142{,}700 \\div 4.7122 = 30{,}283</m> dollars a year; for B, <m>100{,}195 \\div 3.1024 = 32{,}295</m> dollars a year. Owning A costs about $2,012 a year less, every year, for as long as Lantern roasts. The chain gives the same answer because each chain is just its EAC paid for 28 years: <m>30{,}283 \\times 8.6016 = 260{,}485</m>.' },
    { p: 'The things left out don’t change the ranking. With the yearly saving (Kilnworth’s price less beans and running costs), the maintenance and the kitchen corner included, roaster A has an NPV of $18,386 over seven years, an EAA of $3,902; roaster B has an NPV of $5,862 over four years, an EAA of $1,890. The gap is the same $2,012 a year: the items common to both add the same yearly amount to each.' },
    { callout: 'warn', title: 'What the annual equivalents assume', html: 'Both methods assume the choice will be <b>repeated</b>: that Lantern will keep roasting after the first machine wears out and can buy a like-for-like replacement at the same real cost. If the need ends in four years (say Ana expects to sell the business), compare the two over four years instead, with A sold early. If technology is expected to change, model the actual replacements rather than identical copies. And the chain repeats identical present values, which assumes no inflation: if prices rise, a like-for-like replacement costs more in nominal dollars each time. So work in real terms (real cash flows and a real rate, as in F04’s inflation and real returns), and read the EAC as a constant real cost a year.' },
    { p: 'In Excel, the EAA is <x>=PMT(rate, life, -NPV)</x>: <x>=PMT(11%,7,-142700)</x> returns about 30,283. PMT treats the NPV as a loan, so the minus sign makes the annual amount positive.' },

    { h: 'Replacement decisions' },
    { p: 'A related choice is when to replace an asset that still works. Keeping the old machine one more year has a cost: the resale value you could have had today (plus a year’s interest on it), minus the lower resale value a year from now, plus a year’s operating and repair costs, all after tax. Compare that one-year cost with the EAC of a new machine. While keeping the old one for another year is cheaper than the new one’s equivalent annual cost, keep it; when it becomes dearer, replace it. Because an old machine’s costs usually rise each year, the comparison is repeated each year. The same assumption as above sits underneath: the new machine will be replaced by more of the same.' },

    { h: 'Capital rationing' },
    { p: 'In a market where a firm can raise money for any project that earns more than its cost of capital, there is no need to choose among positive-NPV projects: take them all. Capital rationing means the firm has a cap on what it will spend. Two kinds are usually distinguished:' },
    { define: [
      ['<g>Soft rationing</g>', 'A limit the firm sets itself: a budget for each division, a reluctance to borrow or to sell shares, or a cap that forces managers to put their best proposals forward. It can be lifted by a decision inside the firm.'],
      ['<g>Hard rationing</g>', 'A limit imposed from outside: no lender or investor will provide more on acceptable terms, perhaps because the firm is small, young or already heavily borrowed, or because a loan agreement forbids it. Common for small private firms; for large listed firms, it usually signals a deeper problem.'],
    ] },
    { p: 'Within a single-period budget, the goal is the set of projects with the largest total NPV whose outlays fit. The <g>profitability index</g> (PI: the present value of the cash flows after today per dollar invested today, from investment-criteria) is the usual shortcut: rank the positive-NPV projects by PI and take them in order until the money runs out. Every dollar of a budget can then go where it adds the most NPV per dollar.' },
    { p: 'The shortcut is exact only when projects can be taken in part. With indivisible projects it can fail, because the last project that fits may leave money idle. Haverlock Events (fictional) has $100,000 and three projects: X costs $60,000 for an NPV of $18,000 (PI 1.30), Y costs $50,000 for $14,000 (PI 1.28) and Z costs $50,000 for $13,500 (PI 1.27). Ranked by PI, Haverlock takes X and then can’t afford either of the others: total NPV $18,000. Y and Z together use the whole budget and add $27,500. With only a few projects, check every combination that fits; with many, a spreadsheet’s Solver (integer programming) does the search.' },
    { p: 'The PI also fails when the budget binds in more than one period, because a project that needs money next year competes with next year’s projects as well. And it says nothing about mutually exclusive pairs inside the list (both roasters can’t be taken), which must be handled by allowing at most one of them.' },
  ],

  formulas: [
    { id: 'cbp-incremental-irr', name: 'Incremental IRR (and the crossover rate)',
      tex: String.raw`\sum_{t=0}^{n} \dfrac{C_{B,t} - C_{A,t}}{(1 + \text{IRR}_{\Delta})^{t}} = 0`,
      where: [[String.raw`C_{B,t}`, 'Cash flow in year t of the larger (or later-paying) project, B', '$'],
              [String.raw`C_{A,t}`, 'Cash flow in year t of the other project, A', '$'],
              [String.raw`\text{IRR}_{\Delta}`, 'The incremental IRR: the rate at which the two projects have equal NPV', '% a year'],
              [String.raw`t, n`, 'Year (0 = today) and the last year of the longer project', 'years']],
      assumptions: 'The difference starts with an outflow and changes sign once, so it has one IRR. If B − A starts with an inflow, accept B when the incremental IRR is below the cost of capital.',
      note: 'The same rate is the crossover (Fisher’s) rate where the two NPV profiles cross. Prefer B when the incremental IRR exceeds the cost of capital; the incremental NPV is NPV_B − NPV_A.' },
    { id: 'cbp-eaa', name: 'Equivalent annual annuity (EAA)',
      tex: String.raw`\text{EAA} = \text{NPV} \times \dfrac{r}{1 - (1 + r)^{-n}}`,
      where: [[String.raw`\text{NPV}`, 'The project’s net present value over one life', '$'],
              [String.raw`r`, 'The discount rate a year', '% a year'],
              [String.raw`n`, 'The project’s life', 'years']],
      assumptions: 'The project can be repeated on the same terms when it ends, and every repetition has the same NPV in its own year 0.',
      note: 'Choose the mutually exclusive project with the highest EAA. Excel: =PMT(r, n, −NPV).' },
    { id: 'cbp-eac', name: 'Equivalent annual cost (EAC)',
      tex: String.raw`\text{EAC} = \text{PV of costs} \times \dfrac{r}{1 - (1 + r)^{-n}}`,
      where: [[String.raw`\text{PV of costs}`, 'Present value of owning the asset over its life: price, after-tax running costs less tax shields, less after-tax resale value', '$'],
              [String.raw`r`, 'The discount rate a year', '% a year'],
              [String.raw`n`, 'The asset’s life', 'years']],
      assumptions: 'The machines do the same job, so their benefits are equal and only costs differ; each will be replaced by an identical machine.',
      note: 'Choose the lowest EAC. It is the EAA of a project whose cash flows are all costs, with the sign turned round.' },
    { id: 'cbp-chain', name: 'Value of an infinite replacement chain',
      tex: String.raw`\text{NPV}_{\infty} = \text{NPV} \times \dfrac{(1 + r)^{n}}{(1 + r)^{n} - 1} = \dfrac{\text{EAA}}{r}`,
      where: [[String.raw`\text{NPV}`, 'NPV of one cycle of the project', '$'],
              [String.raw`r`, 'The discount rate a year', '% a year'],
              [String.raw`n`, 'Length of one cycle', 'years'],
              [String.raw`\text{EAA}`, 'The equivalent annual annuity of one cycle', '$ a year']],
      assumptions: 'The project is repeated identically for ever.',
      note: 'Ranking by NPV∞ and ranking by EAA always agree, because NPV∞ is EAA ÷ r and r is the same for both projects.' },
  ],

  examples: [
    { level: 'simple', title: 'One fleet or the other', fictional: true,
      setup: 'Tideline Kayaks can buy a small fleet (−$50,000 today, +$20,000 a year for four years) or a large fleet (−$120,000, +$44,000 a year), not both. Its cost of capital is 11%. Which should it buy?',
      steps: [
        String.raw`NPVs with the 4-year annuity factor at 11%, <m>(1 - 1.11^{-4}) \div 0.11 = 3.1024</m>: small <m>20{,}000 \times 3.1024 - 50{,}000 = 12{,}049</m>; large <m>44{,}000 \times 3.1024 - 120{,}000 = 16{,}508</m>.`,
        'IRRs (by a spreadsheet’s IRR): small 21.9%, large 17.3%. The two rules disagree, as they can for mutually exclusive projects of different size.',
        String.raw`Incremental project, large − small: <m>-70{,}000</m> today and <m>+24{,}000</m> a year for four years. Its IRR solves <m>24{,}000 \times \text{annuity factor} = 70{,}000</m>, an annuity factor of 2.9167, which gives 14.0%. Its NPV is <m>24{,}000 \times 3.1024 - 70{,}000 = 4{,}459</m>, the gap between the two NPVs.`,
      ],
      answer: 'Buy the large fleet: NPV $16,508 against $12,049. The extra $70,000 earns 14.0%, more than the 11% it costs.',
      interpretation: 'The small fleet’s higher IRR describes a better return on less money. Tideline’s owners are richer by the larger amount of value, so they should accept the lower rate on more capital, as long as the extra capital earns more than its cost. If Tideline couldn’t raise the extra $70,000 (capital rationing), the answer could change.' },
    { level: 'challenging', title: 'Lantern’s two roasters', fictional: true,
      setup: 'Roaster A costs $48,000 installed, lasts seven years, needs a $30,000-a-year operator and sells for $8,000 at the end. Roaster B costs $22,000, lasts four years, needs $36,000 a year of operator time and sells for $3,000. Both are 7-year MACRS property; tax is 25%; the rate is 11%. Everything else is the same for both. Which should Ana buy?',
      steps: [
        'Build each machine’s after-tax cost flows (project-cash-flows’ method with no revenue): the operator costs 75% of its wage after tax, depreciation saves 25% of each year’s MACRS amount, and the resale value is taxed on the gain over the remaining tax value. For A: −$48,000 today, then −$20,785, −$19,561, −$20,401, −$21,001, −$21,428, −$21,430 and, in year 7 with the resale, −$14,893. For B: −$22,000, then −$26,214, −$25,653, −$26,038 and −$22,345.',
        'Present values at 11%: A $142,700 of costs over seven years; B $100,195 over four. These can’t be compared directly.',
        String.raw`Equivalent annual costs: A <m>142{,}700 \div 4.7122 = 30{,}283</m> dollars a year; B <m>100{,}195 \div 3.1024 = 32{,}295</m> dollars a year.`,
        'Check with a 28-year replacement chain: four As cost $260,485 and seven Bs $277,793 in present value, and 260,485 ÷ 8.6016 = $30,283 a year, as before.',
      ],
      answer: 'Buy roaster A: it costs about $2,012 a year less to own ($30,283 against $32,295), although its costs over one life have the higher present value.',
      interpretation: 'A’s higher price buys three more years of roasting and a lower wage bill. The answer assumes Lantern keeps roasting for the foreseeable future and can replace like with like; if Ana planned to stop roasting within four years, she should compare the two over four years, with A sold early at whatever it would then fetch. A is the better choice at every rate from 5% to 20%, so the ranking does not hang on the 11% working rate.' },
    { level: 'applied', title: 'Spending Lantern’s $40,000', fictional: true,
      setup: 'Ana has $40,000 to invest on 1 April 2028 without new financing. The candidates are below, valued at 11%. Cold Brew and the roaster use the free cash flows from project-cash-flows; the kiosks, cargo bike and solar panels use the outlays, lives and after-tax yearly savings from net-present-value. Which projects should she fund?',
      table: {
        caption: 'Lantern’s 2028 proposals at 11% (fictional figures)',
        head: ['Project', 'Outlay on 1 April', 'NPV', 'PI'],
        align: ['l', 'r', 'r', 'r'],
        rows: [
          ['Cold Brew launch', '$23,237', '$25,737', '2.11'],
          ['In-house roaster (A)', '$48,000', '$18,386', '1.38'],
          ['Ordering kiosks', '$14,000', '$2,133', '1.15'],
          ['Electric cargo bike', '$7,500', '$1,001', '1.13'],
          ['Solar panels', '$19,000', '−$743', '0.96'],
        ],
      },
      steps: [
        'Drop the solar panels: a negative NPV is rejected with or without a budget.',
        'The roaster’s $48,000 is more than the whole budget, so it can’t be taken on its own money, however good it is.',
        'Rank the rest by PI: Cold Brew (2.11), kiosks (1.15), bike (1.13). Cold Brew and the kiosks use $37,237; the bike’s $7,500 doesn’t fit in the $2,763 left. Checking every combination that fits confirms it: Cold Brew and kiosks give the largest total NPV, $27,870.',
        'Without the cap Ana would take all four positive-NPV projects, $92,737 of outlays for a total NPV of $47,256 (the rounded figures in the table add to $47,257). The budget costs her $19,387 of value, almost all of it the roaster.',
        'Cold Brew also needs $20,383 more during its first year (working capital and first-year losses). A budget that binds next year as well would have to cover that too.',
      ],
      answer: 'Within $40,000: Cold Brew and the kiosks, total NPV $27,870, with $2,763 unspent. The roaster, worth $18,386, is left out only for lack of money.',
      interpretation: 'If the $40,000 is a limit Ana sets herself (soft rationing), the NPVs argue for lifting it: financing the roaster adds $18,386 as long as the money costs no more than the 11% used to value it. If no lender or investor will provide it (hard rationing), the best set is Cold Brew and the kiosks. How Lantern could raise more, and what it would cost, is the subject of modules 3 and 4.' },
  ],

  demo: [
    { widget: 'cbp-scale', intro: 'The incremental project Tideline buys by choosing the large fleet over the small one: the extra outlay and the extra cash each year. Push the large fleet’s yearly cash down until the incremental IRR falls below the rate, and see the incremental NPV turn negative at the same point.' },
    { widget: 'cbp-crossover', intro: 'Ravensmoor’s two NPV profiles. Move the discount rate across the crossover and watch the choice flip; change the spa’s last-year cash to move the crossover.' },
    { widget: 'cbp-roasters', intro: 'Lantern’s two roasters by equivalent annual cost. Try other rates, or make roaster B’s operator cheaper, to find when B would win.' },
    { widget: 'cbp-ration', intro: 'Lantern’s 2028 proposals under a budget. Move the budget and the rate: the best set found by checking every combination, the PI shortcut and the value the budget costs.' },
  ],

  mistakes: [
    { title: 'Choosing the project with the higher IRR', html: 'For independent projects with conventional cash flows, IRR and NPV give the same accept-or-reject answer. For mutually exclusive projects they can rank differently, because IRR ignores scale and assumes the rate is above the crossover. Choose by NPV, or by the incremental IRR, which is the NPV rule in rate form.' },
    { title: 'Comparing the NPVs of projects with different lives', html: 'Roaster B’s costs have a lower present value than A’s because they cover four years, not seven. Put the projects on the same footing: an equivalent annual cost, an equivalent annual annuity or a chain over a common period.' },
    { title: 'Using the EAA when the choice won’t be repeated', html: 'The annual equivalents assume each asset is replaced by an identical one indefinitely. If the need ends at a known date, or technology will change, value the actual sequence of decisions over the actual horizon.' },
    { title: 'Ranking by PI when projects are lumpy', html: 'The PI ranking maximises NPV only if projects can be taken in part, or the budget happens to be used up exactly. With whole projects, check the combinations that fit; the best set may skip the top-ranked project.' },
    { title: 'Treating a self-imposed budget as a fact', html: 'Soft rationing is a choice. A firm that turns down positive-NPV projects because of an internal cap gives up value; the cap is worth keeping only if it guards against something real, such as over-optimistic forecasts or a lack of people to run the projects.' },
    { title: 'Raising the rate to break ties', html: 'Some analysts add a few points to the rate for the project they distrust. That penalises distant cash flows most and can flip a ranking for no good reason. Model the doubt in the cash flows and test it (project-risk shows how).' },
  ],

  application: [
    { p: 'Equipment choices like Lantern’s roasters are where annual equivalents earn their keep: fleets of vehicles, ovens, servers and machine tools, where one option costs more now and less later or lasts longer. Operations managers often think in cost per year; the EAC gives them that figure with the time value of money and tax built in. When an investment would be repeated, it is the honest way to compare.' },
    { p: 'In a growing small firm, budgets are often the binding constraint. A useful discipline is to rank proposals by PI and then check the combinations near the cut-off by hand, as Ana did, and, just as important, to price the constraint: the NPV given up by the budget. Lantern’s $40,000 cap costs $19,387 of value. That figure is the case for raising money, set against what the new money would cost and the control or risk it brings with it (modules 3 and 4).' },
    { p: 'Most rationing in practice is soft: divisions get a capital allowance, and the board asks for the best projects within it. That can be sensible when forecasts are biased upwards (every manager’s pet project has a high NPV) or when the firm lacks people to run everything at once. But the cap should be revisited when good projects are left out, rather than treated as a law of nature.' },
    { callout: 'note', title: 'Before you rank', html: 'Check that the projects being compared were valued on the same basis: the same tax treatment, the same timing convention, the same rate for the same risk, and nominal flows with a nominal rate. A ranking can only be as consistent as the valuations behind it.' },
  ],

  summary: [
    'Independent projects: accept every one with a positive NPV. Mutually exclusive projects: choose the one with the highest positive NPV, compared over the same period at a rate that fits their risk.',
    'Scale: a smaller project can have the higher IRR and the lower NPV. The incremental IRR (larger minus smaller) tells you whether the extra capital earns its cost.',
    'Timing: when one project pays earlier, the NPV profiles cross at the crossover rate, the IRR of the difference. Below it the later-paying project wins; IRR ranks as if the rate were above it.',
    'Unequal lives: compare by a replacement chain over a common period or, equivalently, by the equivalent annual annuity (EAA) or cost (EAC), assuming like-for-like replacement.',
    'Replacement: keep an old asset while one more year of it costs less than the EAC of a new one.',
    'Capital rationing: choose the set of projects with the largest total NPV that fits the budget. Ranking by PI works for divisible projects; with lumpy projects or budgets in several periods, check the combinations.',
    'Soft rationing is self-imposed; hard rationing is imposed by the capital markets. A firm with positive-NPV projects and access to fairly priced capital should raise money rather than ration.',
  ],

  glossary: [
    { term: 'Incremental IRR', def: 'The IRR of the difference between two projects’ cash flows (the larger or later-paying minus the other): the return earned on the extra investment. Prefer the larger project when it exceeds the cost of capital.' },
    { term: 'Crossover rate', def: 'The discount rate at which two projects have the same NPV, where their NPV profiles cross; the IRR of the difference in their cash flows. Also called Fisher’s rate of intersection.' },
    { term: 'Replacement chain', def: 'A way to compare projects with unequal lives: each is assumed to be repeated identically until both chains end on the same date (the least common multiple of the lives), and the chains’ NPVs are compared.' },
    { term: 'Equivalent annual annuity', def: 'The level amount a year, over a project’s life, with the same present value as the project’s NPV: NPV × r ÷ (1 − (1 + r)^−n). Used to compare projects with unequal lives that will be repeated.' },
    { term: 'Equivalent annual cost', def: 'The level cost a year, over an asset’s life, with the same present value as the cost of owning it (price and after-tax running costs, less after-tax resale value); the cheapest asset per year is preferred.' },
    { term: 'Capital rationing', def: 'A limit on the total a firm will invest in a period, so that it can’t accept every positive-NPV project and must choose the set that adds the most value within the limit.' },
    { term: 'Soft rationing', def: 'Capital rationing imposed by the firm on itself, such as divisional budgets or a reluctance to raise outside money; it can be lifted by an internal decision.' },
    { term: 'Hard rationing', def: 'Capital rationing imposed from outside: the firm can’t raise more money on acceptable terms from lenders or investors.' },
  ],

  references: [
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 16.5, “Choosing between Projects” (mutually exclusive projects, the replacement chain and equal annuity approaches, ranking by profitability index under limited resources). OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/16-5-choosing-between-projects', checked: '2026-11-05' },
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 16.4, “Alternative Methods” (the profitability index, discounted payback and MIRR). OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/16-4-alternative-methods', checked: '2026-11-05' },
    { text: 'Microsoft. <i>IRR function</i> (Excel help: values must include at least one positive and one negative cash flow; the guess argument).', url: 'https://support.microsoft.com/office/64925eaa-9988-495b-b290-3ad0c163c1bc', checked: '2026-11-05' },
    { text: 'Microsoft. <i>PMT function</i> (Excel help: the level payment for a present value, rate and number of periods).', url: 'https://support.microsoft.com/office/pmt-function-0214da64-9a63-4996-bc20-214433fa6441', checked: '2026-11-05' },
  ],

  checks: [
    { what: 'Small fleet NPV', value: npv(r, S), shown: 12049, tol: 0.5 },
    { what: 'Small fleet IRR (%)', value: irr(S) * 100, shown: 21.9, tol: 0.05 },
    { what: 'Large fleet NPV', value: npv(r, L), shown: 16508, tol: 0.5 },
    { what: 'Large fleet IRR (%)', value: irr(L) * 100, shown: 17.3, tol: 0.05 },
    { what: 'Incremental outlay', value: -D[0], shown: 70000 },
    { what: 'Incremental yearly cash', value: D[1], shown: 24000 },
    { what: 'Incremental IRR (%)', value: irr(D) * 100, shown: 14.0, tol: 0.05 },
    { what: 'Incremental NPV', value: npv(r, D), shown: 4459, tol: 0.5 },
    { what: 'Incremental NPV = gap between NPVs', value: npv(r, L) - npv(r, S), shown: 4459, tol: 0.5 },
    { what: 'Small fleet has the higher IRR (1 = yes)', value: irr(S) > irr(L) ? 1 : 0, shown: 1 },
    { what: '4-year annuity factor at 11%', value: af(4), shown: 3.1024, tol: 0.00005 },
    { what: 'Annuity factor 70,000 ÷ 24,000', value: 70000 / 24000, shown: 2.9167, tol: 0.00005 },
    { what: 'Small fleet NPV via factor', value: 20000 * 3.1024 - 50000, shown: 12048, tol: 1 },
    { what: 'Large fleet NPV via factor', value: 44000 * 3.1024 - 120000, shown: 16506, tol: 3 },
    { what: 'Incremental NPV via factor', value: 24000 * 3.1024 - 70000, shown: 4458, tol: 2 },
    { what: 'Refurbishment IRR (%)', value: irr(Q) * 100, shown: 17.3, tol: 0.05 },
    { what: 'Spa IRR (%)', value: irr(W) * 100, shown: 16.0, tol: 0.05 },
    { what: 'Refurbishment NPV at 11%', value: npv(r, Q), shown: 4369, tol: 0.5 },
    { what: 'Spa NPV at 11%', value: npv(r, W), shown: 8296, tol: 0.5 },
    { what: 'Spa undiscounted net cash', value: W.reduce((a, b) => a + b, 0), shown: 34000 },
    { what: 'Refurbishment undiscounted net cash', value: Q.reduce((a, b) => a + b, 0), shown: 14000 },
    { what: 'Difference year 1', value: W[1] - Q[1], shown: -36000 },
    { what: 'Difference year 2', value: W[2] - Q[2], shown: -12000 },
    { what: 'Difference year 3', value: W[3] - Q[3], shown: 18000 },
    { what: 'Difference year 4', value: W[4] - Q[4], shown: 50000 },
    { what: 'Crossover rate (%)', value: X * 100, shown: 15.05, tol: 0.005 },
    { what: 'Only one crossover', value: crossover(W, Q).length, shown: 1 },
    { what: 'Spa ahead at 11%', value: npv(r, W) - npv(r, Q), shown: 3926, tol: 0.5 },
    { what: 'Refurbishment ahead at 15.5% (1 = yes)', value: npv(0.155, Q) > npv(0.155, W) ? 1 : 0, shown: 1 },
    { what: 'Crossover is below both IRRs (1 = yes)', value: X < irr(W) && X < irr(Q) ? 1 : 0, shown: 1 },
    { what: 'Crossover more than four points above 11% (1 = yes)', value: X - r > 0.04 ? 1 : 0, shown: 1 },
    { what: 'Roaster A price', value: A.price, shown: 48000 },
    { what: 'Roaster B price', value: B.price, shown: 22000 },
    { what: 'Roaster A PV of costs', value: -pvA, shown: 142700, tol: 0.5 },
    { what: 'Roaster B PV of costs', value: -pvB, shown: 100195, tol: 0.5 },
    { what: 'A cost flows y1', value: cA.fcf[1], shown: -20785, tol: 0.5 },
    { what: 'A cost flows y2', value: cA.fcf[2], shown: -19561, tol: 0.5 },
    { what: 'A cost flows y3', value: cA.fcf[3], shown: -20401, tol: 0.5 },
    { what: 'A cost flows y4', value: cA.fcf[4], shown: -21001, tol: 0.5 },
    { what: 'A cost flows y5', value: cA.fcf[5], shown: -21428, tol: 0.5 },
    { what: 'A cost flows y6', value: cA.fcf[6], shown: -21430, tol: 0.5 },
    { what: 'A cost flows y7', value: cA.fcf[7], shown: -14893, tol: 0.5 },
    { what: 'B cost flows y1', value: cB.fcf[1], shown: -26214, tol: 0.5 },
    { what: 'B cost flows y2', value: cB.fcf[2], shown: -25653, tol: 0.5 },
    { what: 'B cost flows y3', value: cB.fcf[3], shown: -26038, tol: 0.5 },
    { what: 'B cost flows y4', value: cB.fcf[4], shown: -22345, tol: 0.5 },
    { what: 'A chain over 28 years', value: -chain(pvA, 7), shown: 260485, tol: 0.5 },
    { what: 'B chain over 28 years', value: -chain(pvB, 4), shown: 277793, tol: 0.5 },
    { what: 'Chain gap', value: chain(pvA, 7) - chain(pvB, 4), shown: 17309, tol: 0.5 },
    { what: '7-year annuity factor at 11%', value: af(7), shown: 4.7122, tol: 0.00005 },
    { what: '28-year annuity factor at 11%', value: af(28), shown: 8.6016, tol: 0.00005 },
    { what: 'EAC A', value: eacA, shown: 30283, tol: 0.5 },
    { what: 'EAC A by division', value: 142700 / 4.7122, shown: 30283, tol: 1 },
    { what: 'EAC B', value: eacB, shown: 32295, tol: 0.5 },
    { what: 'EAC B by division', value: 100195 / 3.1024, shown: 32296, tol: 1.5 },
    { what: 'EAC gap', value: eacB - eacA, shown: 2012, tol: 0.5 },
    { what: 'Chain = EAC × factor', value: eacA * af(28), shown: 260485, tol: 0.5 },
    { what: 'Chain ÷ factor', value: 260485 / 8.6016, shown: 30283, tol: 1 },
    { what: 'A NPV with savings', value: nA, shown: 18386, tol: 0.5 },
    { what: 'A NPV with savings equals roasterFlows NPV', value: npv(r, ro), shown: 18386, tol: 0.5 },
    { what: 'A EAA', value: eaa(nA, r, 7), shown: 3902, tol: 0.5 },
    { what: 'B NPV with savings', value: nB, shown: 5862, tol: 0.5 },
    { what: 'B EAA', value: eaa(nB, r, 4), shown: 1890, tol: 0.5 },
    { what: 'EAA gap equals EAC gap', value: eaa(nA, r, 7) - eaa(nB, r, 4), shown: 2012, tol: 0.5 },
    { what: 'A cheaper per year at every rate 5%–20% (1 = yes)', value: [0.05, 0.08, 0.11, 0.14, 0.17, 0.2].every((k) => eaa(-npv(k, cA.fcf), k, 7) < eaa(-npv(k, cB.fcf), k, 4)) ? 1 : 0, shown: 1 },
    { what: 'PMT check', value: 142700 * r / (1 - (1 + r) ** -7), shown: 30283, tol: 1 },
    { what: 'Tideline small PI', value: profitabilityIndex(r, S), shown: 1.24, tol: 0.005 },
    { what: 'Cold Brew outlay', value: P[0].outlay, shown: 23237, tol: 0.5 },
    { what: 'Cold Brew NPV', value: P[0].npv, shown: 25737, tol: 0.5 },
    { what: 'Cold Brew PI', value: P[0].pi, shown: 2.11, tol: 0.005 },
    { what: 'Roaster outlay', value: P[1].outlay, shown: 48000 },
    { what: 'Roaster NPV', value: P[1].npv, shown: 18386, tol: 0.5 },
    { what: 'Roaster PI', value: P[1].pi, shown: 1.38, tol: 0.005 },
    { what: 'Kiosks outlay', value: P[2].outlay, shown: 14000 },
    { what: 'Kiosks NPV', value: P[2].npv, shown: 2133, tol: 0.5 },
    { what: 'Kiosks PI', value: P[2].pi, shown: 1.15, tol: 0.005 },
    { what: 'Bike outlay', value: P[3].outlay, shown: 7500 },
    { what: 'Bike NPV', value: P[3].npv, shown: 1001, tol: 0.5 },
    { what: 'Bike PI', value: P[3].pi, shown: 1.13, tol: 0.005 },
    { what: 'Solar outlay', value: P[4].outlay, shown: 19000 },
    { what: 'Solar NPV', value: P[4].npv, shown: -743, tol: 0.5 },
    { what: 'Solar PI', value: P[4].pi, shown: 0.96, tol: 0.005 },
    { what: 'Budget', value: BUDGET_2028, shown: 40000 },
    { what: 'Roaster outlay exceeds the budget (1 = yes)', value: P[1].outlay > BUDGET_2028 ? 1 : 0, shown: 1 },
    { what: 'Best set: Cold Brew and kiosks only (1 = yes)', value: RA.exact.join() === 'true,false,true,false,false' ? 1 : 0, shown: 1 },
    { what: 'PI shortcut agrees here (1 = yes)', value: RA.greedy.join() === RA.exact.join() ? 1 : 0, shown: 1 },
    { what: 'Best set outlay', value: RA.exactOutlay, shown: 37237, tol: 0.5 },
    { what: 'Best set NPV', value: RA.exactNpv, shown: 27870, tol: 0.5 },
    { what: 'Unspent', value: BUDGET_2028 - RA.exactOutlay, shown: 2763, tol: 0.5 },
    { what: 'Unlimited outlay', value: sum(allPos, 'outlay'), shown: 92737, tol: 0.5 },
    { what: 'Unlimited NPV', value: sum(allPos, 'npv'), shown: 47256, tol: 0.5 },
    { what: 'Unlimited NPV from the rounded table', value: 25737 + 18386 + 2133 + 1001, shown: 47257 },
    { what: 'Value the budget costs', value: sum(allPos, 'npv') - RA.exactNpv, shown: 19387, tol: 0.5 },
    { what: 'Unlimited set has four projects', value: allPos.length, shown: 4 },
    { what: 'Cold Brew year-1 outflow', value: -cb[1], shown: 20383, tol: 0.5 },
    { what: 'Haverlock X PI', value: (18000 + 60000) / 60000, shown: 1.30 },
    { what: 'Haverlock Y PI', value: (14000 + 50000) / 50000, shown: 1.28 },
    { what: 'Haverlock Z PI', value: (13500 + 50000) / 50000, shown: 1.27 },
    { what: 'Haverlock PI shortcut NPV', value: RH.greedyNpv, shown: 18000 },
    { what: 'Haverlock best NPV', value: RH.exactNpv, shown: 27500 },
    { what: 'Chain years: lcm(7, 9)', value: 63, shown: 7 * 9 },
  ],
};
