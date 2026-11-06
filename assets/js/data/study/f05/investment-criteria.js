// investment-criteria.js — F05 · Investment criteria. Content only; exercises are in investment-criteria.ex.js.
// Uses coldBrewFlows() as given (project-cash-flows derives it), the kiosks from PROPOSALS and WORKING_RATE from
// case.js. Ana’s three-year payback rule of thumb, the quarry, the events company and the two lamp projects are
// fictional and new to this lesson. The survey evidence is Graham & Harvey (2001), reported only as far as its abstract,
// the part opened.
import { coldBrewFlows, PROPOSALS, WORKING_RATE } from './case.js?v=28';
import { npv, irr, irrAll, mirr, payback, profitabilityIndex } from '../../../core/invest.js?v=28';
import { projectCashFlows } from '../../../core/corpfin.js?v=28';
import { widgets } from './investment-criteria.ex.js?v=28';

const r = WORKING_RATE;
const cb = coldBrewFlows().fcf;
const kiosk = PROPOSALS.find((p) => p.name === 'Ordering kiosks for the cafés');
const kf = [-kiosk.outlay, ...Array(kiosk.life).fill(kiosk.saving)];
const quarry = [-40000, 100000, -62400];
const noIrr = [5000, -12000, 8000];
const events = [10000, -11500];
const lampS = [-1000, 1500], lampL = [-20000, 25000];
const cum = (f, rate = 0) => f.reduce((a, x, t) => [...a, (a.length ? a[a.length - 1] : 0) + x / (1 + rate) ** t], []);
const cbCum = cum(cb), cbDcum = cum(cb, r);
const pvOut = -cb[0] - cb[1] / (1 + r);                                       // PV of all outflows (years 0 and 1)
const pvNeg = cb.reduce((a, x, t) => (x < 0 ? a + x / (1 + r) ** t : a), 0);
const fvPos = cb.reduce((a, x, t) => (x > 0 ? a + x * (1 + r) ** (cb.length - 1 - t) : a), 0);
const qNeg = -40000 - 62400 / (1 + r) ** 2, qPos = 100000 * (1 + r);
const wModel = projectCashFlows(widgets['cold-brew-criteria'].model(Object.fromEntries(widgets['cold-brew-criteria'].inputs.map((i) => [i.id, i.value])))).fcf;

export default {
  slug: 'investment-criteria',
  title: 'Investment criteria',
  blurb: 'Managers and lenders quote a project’s internal rate of return, its payback period and its profitability index as often as its NPV. Learn what each measures, when each agrees with NPV, and the cash-flow patterns that make them mislead: borrowing-type flows, several IRRs or none, and projects of different size.',
  status: 'draft',
  objectives: [
    'Calculate a project’s internal rate of return and modified internal rate of return, by trial and with Excel’s IRR and MIRR.',
    'Explain, using the NPV profile, when the IRR rule and the NPV rule agree and when they do not.',
    'Identify cash-flow patterns that give a reversed IRR rule, several IRRs or none, and choose the right criterion for them.',
    'Calculate the payback period, the discounted payback period and the profitability index, and state what each leaves out.',
    'Evaluate a project with several criteria at once and recommend a decision when they conflict.',
  ],
  prerequisites: [
    { lesson: 'f05/net-present-value', why: 'NPV and the opportunity cost of capital are the benchmark every other criterion is judged against.' },
    { lesson: 'f04/discounting-cash-flows', why: 'It introduced the IRR, the NPV profile and estimating an IRR by interpolation.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Ana has taken Cold Brew, her biggest proposal, to two advisers. Her accountant asks how quickly it pays back: his rule of thumb, which Ana has always used, is that a small firm’s project should repay its outlay within three years. Her bank manager asks what rate of return it earns. Ana has an NPV. The three questions sound alike, but they can give different answers, and she needs to know which to trust. The cash flows below are Cold Brew’s free cash flows, built line by line in the lesson on project cash flows; here they are taken as given. All figures are fictional.' },
    { table: {
      caption: 'Cold Brew’s free cash flows (end of each April–March year; year 0 = 1 April 2028), discounted at 11%',
      head: ['Year', 'Free cash flow', 'Cumulative', 'Present value at 11%', 'Cumulative PV'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: [
        ['0', '−$23,237', '−$23,237', '−$23,237', '−$23,237'],
        ['1', '−$20,383', '−$43,620', '−$18,363', '−$41,600'],
        ['2', '$6,528', '−$37,093', '$5,298', '−$36,302'],
        ['3', '$20,791', '−$16,302', '$15,202', '−$21,100'],
        ['4', '$27,580', '$11,279', '$18,168', '−$2,932'],
        ['5', '$48,309', '$59,588', '$28,669', '$25,737'],
      ],
      note: 'Year 1 is negative because the launch year’s promotion and the build-up of working capital outweigh its sales. Year 5 includes the recovery of working capital and the sale of the display fridges. Amounts rounded to the dollar from unrounded values.',
    } },
    { p: 'At 11% Cold Brew’s NPV is <b>+$25,737</b>, the last entry in the table. The other criteria answer different questions about the same six numbers.' },

    { h: 'The internal rate of return and the NPV profile' },
    { p: String.raw`The <g>internal rate of return</g> (IRR) is the discount rate at which a project’s NPV is zero. Plotting NPV against the rate gives the <g>NPV profile</g>. For Cold Brew the NPV is $59,588 at 0% (the undiscounted total), $25,737 at 11%, $9,057 at 20% and −$2,923 at 30%: the curve falls as the rate rises and crosses zero at an IRR of <b>27.1%</b>. The IRR rule says: accept a project whose IRR is above the opportunity cost of capital. Cold Brew’s 27.1% is well above 11%, so the IRR agrees with the NPV.` },
    { p: 'The agreement is no accident. Cold Brew’s cash flows are <g>conventional cash flows</g>: one or more outflows followed only by inflows, so the signs change once. For such a project the NPV profile slopes down all the way and crosses zero once. Every rate below the IRR gives a positive NPV and every rate above it a negative one, so “IRR above r” and “NPV at r positive” are the same statement. The IRR is also a useful margin of safety: Ana’s rate could be wrong by sixteen percentage points before Cold Brew stopped adding value.' },

    { h: 'Payback: how long until the money comes back' },
    { p: 'The <g>payback rule</g> accepts a project if its cumulative cash flow turns positive within a cutoff period. Cold Brew’s cumulative cash flow is −$16,302 after three years and +$11,279 after four, so it pays back during year 4: <m>3 + 16{,}302 \\div 27{,}580 \\approx 3.59</m> years, assuming year 4’s cash arrives evenly. That fails the accountant’s three-year rule, though the NPV is strongly positive.' },
    { p: 'Payback ignores the time value of money: a dollar in year 3 counts the same as a dollar today. The <g>discounted payback period</g> fixes that by accumulating present values instead: Cold Brew’s cumulative present value is still −$2,932 after year 4 and turns positive in year 5, after about <b>4.10 years</b>. For a project with conventional cash flows (no outflows after it pays back), passing discounted payback within its life means a positive NPV; later outflows, like the quarry’s restoration cost below, can undo that. But both versions share a deeper fault: they ignore everything after the cutoff. Cold Brew’s best year, year 5, is invisible to a three-year rule.' },

    { h: 'The profitability index' },
    { p: String.raw`The <g>profitability index</g> (PI) divides the present value of a project’s future cash flows by its initial outlay: the value created per dollar invested. Cold Brew’s PI is <m>(25{,}737 + 23{,}237) \div 23{,}237 \approx 2.11</m>. A PI above 1 is the same as a positive NPV, so for a single project the PI agrees with NPV. Its real use is ranking projects when the money available is limited, which module 2 covers.` },
    { callout: 'key', title: 'Which criterion answers which question', html: 'NPV: how much richer does the project make the owners, in today’s dollars? IRR: what rate of return do the project’s own cash flows earn, and how wrong could the discount rate be before the decision flips? Payback: how long is the money at risk before it comes back? PI: how much value per dollar of outlay? Only NPV answers the question the owners care about directly; the others are useful summaries with known blind spots.' },
  ],

  theory: [
    { h: 'When the IRR rule goes wrong' },
    { p: 'The IRR is a property of the cash flows, found by solving an equation, and some cash-flow patterns make that equation behave badly. Three patterns matter for single projects, and a fourth for choosing between projects.' },
    { p: String.raw`<b>1. Borrowing-type cash flows.</b> A fictional events company is paid a $10,000 deposit today for a festival that will cost it $11,500 to deliver in a year. The cash flows are +10,000 then −11,500, and the IRR is 15%. But this is like borrowing $10,000 at 15%: a high IRR is bad here, not good. At an 11% opportunity cost the NPV is <m>10{,}000 - 11{,}500 \div 1.11 \approx -360</m> dollars. When money comes in first and goes out later, the IRR rule reverses: accept only if the IRR is <em>below</em> the opportunity cost. The NPV needs no such adjustment.` },
    { p: String.raw`<b>2. Several IRRs.</b> A fictional quarry company can extract the last of a gravel seam: it spends $40,000 now, earns $100,000 next year, and must then spend $62,400 restoring the site in year 2. The signs change twice (−, +, −), and the NPV equation has two solutions: 20% and 30%. Both are above an 11% opportunity cost, yet the NPV at 11% is <m>-40{,}000 + 100{,}000 \div 1.11 - 62{,}400 \div 1.11^2 \approx -555</m> dollars. The NPV is positive only for rates between 20% and 30%; at 11% the restoration cost, discounted lightly, outweighs the gain. Neither IRR is “the” return. The number of IRRs can be as large as the number of sign changes, and a pattern with several changes is common in projects with large clean-up, decommissioning or refit costs.` },
    { p: String.raw`<b>3. No IRR.</b> A fictional software reseller receives a $5,000 fee now, pays $12,000 to a developer next year and receives $8,000 the year after. Its NPV is positive at every rate ($1,000 at 0%, $682 at 11%) and never crosses zero, so there is no IRR at all. The project is worth taking, but the IRR cannot say so.` },
    { p: String.raw`<b>4. Mutually exclusive projects of different scale or timing.</b> A fictional lighting firm must choose one of two designs for the same factory line. The small one costs $1,000 and returns $1,500 in a year (IRR 50%); the large one costs $20,000 and returns $25,000 (IRR 25%). At 11% the small one’s NPV is $351 and the large one’s $2,523. The higher IRR picks the project that adds less value, because a rate of return ignores how much money earns it. Projects whose cash flows arrive at different times can disagree in the same way. The next module, in choosing-between-projects, treats both problems fully; the safe rule is to choose the higher NPV.` },

    { h: 'The modified IRR' },
    { p: String.raw`The <g>modified internal rate of return</g> (MIRR) replaces the IRR’s single equation with two explicit steps. Discount every outflow to year 0 at a finance rate; compound every inflow to the final year at a reinvestment rate; then find the single rate that grows the first into the second:` },
    { math: String.raw`\text{MIRR} = \left( \frac{\text{FV of inflows at the reinvestment rate}}{\text{PV of outflows at the finance rate}} \right)^{1/n} - 1` },
    { p: String.raw`For Cold Brew at 11% for both rates, the outflows in years 0 and 1 are worth $41,600 today, the inflows compound to $113,467 by year 5, and <m>\text{MIRR} = (113{,}467 \div 41{,}600)^{1/5} - 1 \approx 22.2\%</m>. For the quarry, <m>(111{,}000 \div 90{,}645)^{1/2} - 1 \approx 10.7\%</m>: one answer, below 11%, agreeing with the negative NPV. The MIRR always gives a single answer when there is at least one outflow and one inflow, and when both rates equal the opportunity cost it is above that cost exactly when the NPV is positive.` },
    { p: 'Two views of the IRR’s “reinvestment assumption” are worth knowing. Many textbooks, OpenStax’s among them, say the IRR implicitly assumes that interim cash flows are reinvested at the IRR itself, which may be unrealistic for a high-IRR project, and present the MIRR as the fix. Others reply that the IRR is just the root of an equation and assumes nothing about what happens to cash after it is received; what the MIRR really does is answer a different question, with the reinvestment rate chosen by the analyst. Both agree on the practical point: a 27.1% IRR does not mean the owners will see their money grow at 27.1% a year, and the MIRR is a more modest summary. Like the IRR, the MIRR is a rate, so it still cannot rank projects of different size.' },

    { h: 'Why firms still use payback' },
    { p: 'Payback ignores the time value of money (unless discounted), ignores cash flows after the cutoff, and has a cutoff with no basis in the opportunity cost of capital. Yet it survives, for reasons that are not all bad.' },
    { list: [
      '<b>Liquidity.</b> For a small firm that cannot easily borrow, how long cash is tied up matters in its own right. The NPV rule’s assumption that owners can borrow and lend at the market rate is weakest exactly here.',
      '<b>A rough risk screen.</b> Forecasts far in the future are the least reliable; a short payback means less depends on them.',
      '<b>Simplicity.</b> Payback is easy to calculate and explain, and it needs no discount rate.',
      '<b>Managers’ horizons.</b> Managers judged on near-term results may prefer projects that pay back quickly, an agency problem that F00’s lesson on governance and agency discusses.',
    ] },
    { p: 'Survey evidence is consistent with this. Graham and Harvey (2001) surveyed 392 chief financial officers about capital budgeting, the cost of capital and capital structure. According to their abstract, large firms rely heavily on present-value techniques and the capital asset pricing model, while small firms are relatively likely to use the payback criterion; many firms also judge new investments by the risk of the whole firm rather than of the project. Using payback as a secondary check alongside NPV is reasonable. Using it in place of NPV rejects valuable long-lived projects.' },

    { h: 'The profitability index in more depth' },
    { p: String.raw`The PI is <m>\text{PI} = \text{PV of future cash flows} \div \text{initial outlay} = 1 + \text{NPV} \div \text{initial outlay}</m>. For a project whose only outflow is at year 0, such as the kiosks, there is no ambiguity: <m>16{,}133 \div 14{,}000 \approx 1.15</m>. Cold Brew also needs cash in year 1, and that raises a definitional question. Divided by the year-0 outlay alone, as above, its PI is 2.11; some textbooks, OpenStax’s among them, divide the present value of inflows by the present value of all outflows, which for Cold Brew is $41,600 and gives a PI of about 1.62. Both are above 1 whenever the NPV is positive, so the accept-or-reject answer is the same; rankings between projects can differ, so state the definition you use.` },

    { h: 'IRR and MIRR in Excel' },
    { p: 'Excel’s <x>=IRR(values, [guess])</x> takes the whole stream including year 0, unlike NPV(). It searches from the guess (10% if omitted) and returns #NUM! if it has not found a rate within 20 tries; when there are several IRRs it returns whichever one its search reaches first, which depends on the guess. For the quarry, <x>=IRR(B2:B4)</x> gives 20% and <x>=IRR(B2:B4,0.5)</x> gives 30%: the function cannot tell you that two answers exist. <x>=MIRR(values, finance_rate, reinvest_rate)</x> takes the two rates explicitly and needs at least one negative and one positive value. Count the sign changes before trusting an IRR from a spreadsheet.' },
  ],

  formulas: [
    { id: 'crit-irr', name: 'Internal rate of return',
      tex: String.raw`0 = \sum_{t=0}^{n} \frac{C_t}{(1 + \text{IRR})^{t}}`,
      where: [
        [String.raw`\text{IRR}`, 'The discount rate at which the NPV is zero', 'per year'],
        [String.raw`C_t`, 'Cash flow at the end of year t (year 0 today)', '$'],
        [String.raw`t`, 'Year', 'years'],
        [String.raw`n`, 'Last year of cash flows', 'years'],
      ],
      assumptions: 'One IRR is guaranteed only for conventional cash flows (the signs change once).',
      note: 'Accept if IRR > r for conventional (investing-type) flows; if IRR < r for borrowing-type flows.' },
    { id: 'crit-mirr', name: 'Modified internal rate of return',
      tex: String.raw`\text{MIRR} = \left( \frac{\sum_{C_t > 0} C_t (1 + r_R)^{n - t}}{-\sum_{C_t < 0} C_t (1 + r_F)^{-t}} \right)^{1/n} - 1`,
      where: [
        [String.raw`\text{MIRR}`, 'Modified internal rate of return', 'per year'],
        [String.raw`C_t`, 'Cash flow at the end of year t', '$'],
        [String.raw`r_R`, 'Reinvestment rate for the inflows', 'per year'],
        [String.raw`r_F`, 'Finance rate for the outflows', 'per year'],
        [String.raw`n`, 'Last year of cash flows', 'years'],
        [String.raw`t`, 'Year', 'years'],
      ],
      assumptions: 'At least one outflow and one inflow.',
      note: 'Excel’s MIRR(values, finance_rate, reinvest_rate). With both rates equal to r, MIRR > r exactly when NPV > 0.' },
    { id: 'crit-payback', name: 'Payback period (interpolated)',
      tex: String.raw`\text{Payback} = k + \frac{-\sum_{t=0}^{k} C_t}{C_{k+1}}`,
      where: [
        [String.raw`k`, 'The last year in which the cumulative cash flow is still negative', 'years'],
        [String.raw`\sum_{t=0}^{k} C_t`, 'Cumulative cash flow at the end of year k (negative)', '$'],
        [String.raw`C_{k+1}`, 'Cash flow in the year the cumulative total turns positive', '$'],
        [String.raw`C_t`, 'Cash flow in year t', '$'],
      ],
      assumptions: 'Year k + 1’s cash flow arrives evenly through the year.',
      note: 'Discounted payback uses Cₜ ÷ (1 + r)ᵗ in place of each Cₜ.' },
    { id: 'crit-pi', name: 'Profitability index',
      tex: String.raw`\text{PI} = \frac{\sum_{t=1}^{n} C_t \div (1 + r)^{t}}{-C_0} = 1 + \frac{\text{NPV}}{-C_0}`,
      where: [
        [String.raw`\text{PI}`, 'Profitability index: present value per dollar of initial outlay', ''],
        [String.raw`C_0`, 'Cash flow today (the outlay, negative)', '$'],
        [String.raw`C_t`, 'Cash flow at the end of year t', '$'],
        [String.raw`r`, 'Opportunity cost of capital', 'per year'],
        [String.raw`n`, 'Last year of cash flows', 'years'],
        [String.raw`\text{NPV}`, 'Net present value at r', '$'],
      ],
      assumptions: 'One outlay at year 0; when later years also need cash, say which definition you use.',
      note: 'PI > 1 exactly when NPV > 0. Useful for ranking under capital rationing (module 2).' },
  ],

  examples: [
    { level: 'simple', title: 'Every criterion for the kiosks', fictional: true,
      setup: 'The ordering kiosks cost $14,000 on 1 April 2028 and save $5,200 a year after tax at the end of each of four years. Ana’s rate is 11%. Find the IRR, the payback and discounted payback periods and the PI, and check that they agree with the NPV of +$2,133.',
      steps: [
        'IRR by trial: the NPV is +$264.82 at 17% and −$11.68 at 18%. Interpolating, 17% + 1% × 264.82 ÷ (264.82 + 11.68) ≈ 17.96%, which Excel’s IRR confirms. It is above 11%, as the positive NPV requires.',
        'Payback: $5,200 a year repays $14,000 in 14,000 ÷ 5,200 ≈ 2.69 years.',
        'Discounted payback: the present values are $4,685, $4,220, $3,802 and $3,425. Their cumulative total is −$1,293 after year 3, so payback comes 1,293 ÷ 3,425 ≈ 0.38 of the way through year 4: about 3.38 years.',
        'PI = PV of savings ÷ outlay = 16,133 ÷ 14,000 ≈ 1.15: each dollar invested brings back $1.15 in present value.',
      ],
      answer: 'IRR ≈ 17.96%, payback ≈ 2.69 years, discounted payback ≈ 3.38 years, PI ≈ 1.15. All agree with the NPV of +$2,133: accept.',
      interpretation: 'For a conventional project of one size, judged alone, the measures agree on accept or reject. They differ in what else they say: the IRR says the 11% rate could rise to almost 18% before the kiosks stopped paying, and the payback says the money is at risk for less than three years.' },
    { level: 'challenging', title: 'A quarry with two IRRs', fictional: true,
      setup: 'A fictional quarry company can extract the last of a gravel seam: −$40,000 today, +$100,000 at the end of year 1, and −$62,400 at the end of year 2 to restore the site. Its opportunity cost of capital is 11%. A manager reports “the IRR is 20%, well above our 11% hurdle”. Is the project worth doing?',
      steps: [
        String.raw`Count sign changes: −, +, − is two, so there may be two IRRs. Writing <m>x = 1 \div (1 + r)</m>, the NPV is <m>-40{,}000 + 100{,}000x - 62{,}400x^2</m>, a quadratic with roots <m>x = 1 \div 1.2</m> and <m>x = 1 \div 1.3</m>: IRRs of 20% and 30%.`,
        String.raw`Find the NPV at 11%: <m>-40{,}000 + 90{,}090 - 50{,}645 \approx -555</m> dollars. Negative, despite both IRRs exceeding 11%.`,
        'Read the profile: the NPV is −$2,400 at 0%, rises to zero at 20%, is positive between 20% and 30% (+$64 at 25%), and falls below zero again above 30%. Only in that band does the project add value, and 11% is outside it.',
        String.raw`Check with the MIRR at 11%: outflows worth <m>40{,}000 + 62{,}400 \div 1.11^2 \approx 90{,}645</m> today; the inflow grows to <m>100{,}000 \times 1.11 = 111{,}000</m> at year 2. MIRR = <m>(111{,}000 \div 90{,}645)^{1/2} - 1 \approx 10.7\%</m>, below 11%.`,
      ],
      answer: 'Reject: the NPV at 11% is about −$555. The IRRs of 20% and 30% are both above 11% but neither means “the return”; the MIRR (10.7%) and the NPV agree.',
      interpretation: 'The restoration cost is a large, late outflow. At low discount rates it weighs heavily, which is why the project loses value at 11% but would gain at 25%. The manager’s single IRR, probably from a spreadsheet’s default guess, hid the second root and the shape of the profile. With two or more sign changes, rely on the NPV.' },
    { level: 'applied', title: 'Cold Brew against the three-year rule', fictional: true,
      setup: 'Ana must decide whether to launch Cold Brew. Its free cash flows and NPV are in the table in The idea; her accountant’s rule says a project should pay back within three years. Work out every criterion and decide what to tell the accountant.',
      steps: [
        'NPV at 11%: +$25,737. IRR: 27.1% (one sign change, so one IRR). MIRR at 11%: 22.2%. PI: 2.11 on the year-0 outlay.',
        'Payback: cumulative cash is −$16,302 after year 3 and +$11,279 after year 4: 3 + 16,302 ÷ 27,580 ≈ 3.59 years. Discounted payback: about 4.10 years. Cold Brew fails the three-year rule.',
        'Find the source of the conflict: year 1 is negative (−$20,383), because the launch promotion and the working capital built up for stockists come before the sales do; and the best year, year 5 (+$48,309), lies outside any three-year window.',
        'Weigh what the payback rule protects. If the worry is that Lantern cannot fund two years of outflows, that is a financing question: about $43,620 must be found by the end of year 1. It calls for a financing plan, not for rejecting a project that adds $25,737.',
      ],
      answer: 'NPV +$25,737, IRR 27.1%, MIRR 22.2%, PI 2.11, payback 3.59 years, discounted payback 4.10 years. Every discounted measure says accept; only the undiscounted three-year rule says no.',
      interpretation: 'Ana keeps payback as a warning light, not a verdict. It tells her Cold Brew ties up cash for over three and a half years, so she must plan to fund the launch year. It does not tell her the project is bad. She notes that the 27.1% IRR is a margin of safety, not a promise: the money will not grow at 27.1% a year, and much depends on whether the volume forecasts are right, which module 2 tests.' },
  ],

  demo: [
    { widget: 'cold-brew-criteria', intro: 'Cold Brew’s cash flows from the case. Move the discount rate across the IRR and watch the NPV, the PI and the MIRR verdicts change together. Then cut the volume to see payback stretch beyond the project’s life while the IRR falls.' },
    { widget: 'quarry-irr', intro: 'The quarry: −$40,000 now, +$100,000 in a year, then a restoration cost. Set the cost to zero and there is one IRR (150%, off the chart); raise it and the two IRRs move towards each other, entering the chart near $60,000; beyond $62,500 there is none and the NPV is negative at every rate. Move the discount rate to see where the NPV is positive.' },
  ],

  mistakes: [
    { title: 'Reading a high IRR as good whatever the signs', html: 'When cash comes in first and goes out later, the IRR is a borrowing rate: the events company’s 15% is the cost of its customer’s money. Accept only if that is below the opportunity cost, or use the NPV.' },
    { title: 'Trusting a single IRR from a spreadsheet', html: 'IRR() returns one root even when there are two, and which one depends on the guess. Count the sign changes; with more than one, draw the NPV profile or use the NPV.' },
    { title: 'Choosing between exclusive projects by IRR', html: 'A 50% return on $1,000 adds less value than a 25% return on $20,000. Between projects that rule each other out, choose the higher NPV.' },
    { title: 'Treating payback as a measure of value', html: 'Payback ignores everything after the cutoff and, undiscounted, the time value of money. Cold Brew fails a three-year rule but adds $25,737. Use payback as a liquidity and risk warning, alongside NPV.' },
    { title: 'Expecting money to grow at the IRR', html: 'Cold Brew’s 27.1% is the rate at which its own cash flows have zero NPV. Cash it releases in year 3 can be reinvested only at whatever rates are then available; the MIRR at 11% (22.2%) is a more modest summary.' },
  ],

  application: [
    { p: 'In practice firms report several criteria together, and the skill is reading them as a set. A capital-expenditure request form may, for example, ask for the NPV at the firm’s rate, the IRR and the payback period; a sensible approver looks first at the NPV, then at whether the IRR leaves a comfortable margin over the rate, and then at the payback as a check on how long the money is exposed.' },
    { p: '<b>A fictional mining contractor</b> evaluating a short-life gravel extraction with a large restoration bond has learned to distrust IRR: its cash flows change sign twice, and its spreadsheet’s IRR once reported 20% for a project that destroyed value at the firm’s rate. Its analysts now attach the NPV profile to every proposal with more than one sign change, and report the MIRR at the firm’s rate in place of the IRR.' },
    { p: '<b>A fictional chain of bakeries</b> with little access to credit uses a two-year discounted payback as a first screen: a project that cannot repay its outlay in present-value terms within two years is not considered, whatever its NPV, because the owner cannot fund longer gaps. That is a defensible policy for a cash-constrained owner, as long as it is understood as a financing limit and revisited when credit becomes available, rather than as a statement about value.' },
    { case: 'Ana writes Cold Brew up for her accountant with every criterion and a sentence on each: NPV +$25,737 (the decision), IRR 27.1% (the margin of safety), payback 3.59 years (the cash it ties up). She proposes to replace the three-year rule with “positive NPV at 11%, plus a funding plan for any project that does not pay back within three years”. Before relying on the cash flows themselves, she wants to see how they are built: that is the next lesson.' },
  ],

  summary: [
    'The IRR is the rate at which NPV = 0. For conventional cash flows (signs change once) the NPV profile falls and crosses zero once, so “IRR > r” and “NPV > 0” agree.',
    'Borrowing-type flows (inflow first) reverse the IRR rule; two or more sign changes can give several IRRs; some flows have none. In all these cases use the NPV.',
    'Between mutually exclusive projects, IRR can prefer the smaller or quicker project with less value: choose the higher NPV (module 2).',
    'The MIRR discounts outflows at a finance rate and compounds inflows at a reinvestment rate; it gives one answer and, with both rates at r, agrees with NPV on accept or reject.',
    'Payback and discounted payback measure how long money is at risk; both ignore cash after the cutoff, and undiscounted payback ignores time value. Firms, especially small ones, still use them as a check.',
    'PI = PV of future cash flows ÷ initial outlay; PI > 1 exactly when NPV > 0. State the definition when later years also need cash.',
    'In Excel, IRR() takes the whole stream and returns one root that depends on the guess; MIRR() takes the finance and reinvestment rates.',
  ],

  glossary: [
    { term: 'Conventional cash flows', def: 'A project’s cash flows in which one or more outflows are followed only by inflows, so the signs change once. Such a project has exactly one IRR.' },
    { term: 'Modified internal rate of return', def: 'The rate that grows the present value of a project’s outflows, discounted at a finance rate, into the future value of its inflows, compounded at a reinvestment rate, by the end of the project. Often shortened to MIRR.' },
    { term: 'Payback rule', def: 'A rule that accepts a project if its cumulative cash flow becomes positive within a chosen cutoff period. It ignores the time value of money and every cash flow after the cutoff.' },
    { term: 'Discounted payback period', def: 'The time until the cumulative present value of a project’s cash flows, discounted at the opportunity cost of capital, becomes positive.' },
    { term: 'Profitability index', def: 'The present value of a project’s future cash flows divided by its initial outlay; above 1 exactly when the NPV is positive. Often shortened to PI.' },
  ],

  references: [
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 16.1, “Payback Period Method”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/16-1-payback-period-method', checked: '2026-11-05' },
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 16.3, “Internal Rate of Return (IRR) Method”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/16-3-internal-rate-of-return-irr-method', checked: '2026-11-05' },
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 16.4, “Alternative Methods” (profitability index, discounted payback, MIRR). OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/16-4-alternative-methods', checked: '2026-11-05' },
    { text: 'Graham, J. R. &amp; Harvey, C. R. (2001). The theory and practice of corporate finance: evidence from the field. <i>Journal of Financial Economics</i>, 60(2–3), 187–243 (abstract).', url: 'https://casact.org/abstract/theory-and-practice-corporate-finance-evidence-field', checked: '2026-11-05' },
    { text: 'Microsoft. <i>IRR function</i> (Excel help: the guess, 20 iterations and #NUM!).', url: 'https://support.microsoft.com/office/irr-function-64925eaa-9988-495b-b290-3ad0c163c1bc', checked: '2026-11-05' },
    { text: 'Microsoft. <i>MIRR function</i> (Excel help: finance and reinvestment rates).', url: 'https://support.microsoft.com/office/mirr-function-b020f038-7492-4fb4-93c1-35c345b53524', checked: '2026-11-05' },
  ],

  checks: [
    // Cold Brew table
    ...cb.map((x, t) => ({ what: `Cold Brew FCF year ${t}`, value: x, shown: [-23237, -20383, 6528, 20791, 27580, 48309][t], tol: 0.5 })),
    ...cbCum.map((x, t) => ({ what: `Cumulative year ${t}`, value: x, shown: [-23237, -43620, -37093, -16302, 11279, 59588][t], tol: 0.5 })),
    ...cb.map((x, t) => ({ what: `PV year ${t}`, value: x / (1 + r) ** t, shown: [-23237, -18363, 5298, 15202, 18168, 28669][t], tol: 0.5 })),
    ...cbDcum.map((x, t) => ({ what: `Cumulative PV year ${t}`, value: x, shown: [-23237, -41600, -36302, -21100, -2932, 25737][t], tol: 0.5 })),
    { what: 'Widget model at its defaults reproduces coldBrewFlows (max abs difference)', value: Math.max(...wModel.map((x, i) => Math.abs(x - cb[i]))), shown: 0, tol: 1e-6 },
    { what: 'Cold Brew NPV', value: npv(r, cb), shown: 25737, tol: 0.5 },
    { what: 'NPV at 0%', value: npv(0, cb), shown: 59588, tol: 0.5 },
    { what: 'NPV at 20%', value: npv(0.20, cb), shown: 9057, tol: 0.5 },
    { what: 'NPV at 30%', value: npv(0.30, cb), shown: -2923, tol: 0.5 },
    { what: 'Profile falls: NPV decreasing over 0–60% (claim)', value: Array.from({ length: 60 }, (_, i) => npv(i / 100, cb) > npv((i + 1) / 100, cb)).every(Boolean) ? 1 : 0, shown: 1 },
    { what: 'Cold Brew IRR (%)', value: irr(cb) * 100, shown: 27.1, tol: 0.05 },
    { what: 'Cold Brew one IRR', value: irrAll(cb).length, shown: 1 },
    { what: 'Margin of safety about sixteen points', value: (irr(cb) - r) * 100, shown: 16, tol: 0.5 },
    { what: 'Cold Brew payback', value: payback(cb), shown: 3.59, tol: 0.005 },
    { what: 'Payback by hand', value: 3 + 16302 / 27580, shown: 3.59, tol: 0.005 },
    { what: 'Cold Brew discounted payback', value: payback(cb, r), shown: 4.10, tol: 0.005 },
    { what: 'Cold Brew PI', value: profitabilityIndex(r, cb), shown: 2.11, tol: 0.005 },
    { what: 'Cold Brew PI by hand', value: (25737 + 23237) / 23237, shown: 2.11, tol: 0.005 },
    { what: 'PV of all outflows', value: pvOut, shown: 41600, tol: 0.5 },
    { what: 'PV of negatives (MIRR)', value: -pvNeg, shown: 41600, tol: 0.5 },
    { what: 'FV of inflows at 11%', value: fvPos, shown: 113467, tol: 0.5 },
    { what: 'Cold Brew MIRR (%)', value: mirr(cb, r, r) * 100, shown: 22.2, tol: 0.05 },
    { what: 'Alternative PI', value: (npv(r, cb) + pvOut) / pvOut, shown: 1.62, tol: 0.005 },
    { what: 'Year-1 cash needed (cumulative)', value: -cbCum[1], shown: 43620, tol: 0.5 },
    // borrowing-type
    { what: 'Events IRR (%)', value: irr(events) * 100, shown: 15, tol: 0.005 },
    { what: 'Events NPV at 11%', value: npv(r, events), shown: -360, tol: 0.5 },
    // quarry
    { what: 'Quarry: two IRRs', value: irrAll(quarry).length, shown: 2 },
    { what: 'Quarry IRR 1 (%)', value: irrAll(quarry)[0] * 100, shown: 20, tol: 0.005 },
    { what: 'Quarry IRR 2 (%)', value: irrAll(quarry)[1] * 100, shown: 30, tol: 0.005 },
    { what: 'Quarry NPV at 11%', value: npv(r, quarry), shown: -555, tol: 0.5 },
    { what: 'Quarry 100,000 ÷ 1.11', value: 100000 / 1.11, shown: 90090, tol: 0.5 },
    { what: 'Quarry 62,400 ÷ 1.11²', value: 62400 / 1.11 ** 2, shown: 50645, tol: 0.5 },
    { what: 'Quarry NPV at 0%', value: npv(0, quarry), shown: -2400 },
    { what: 'Quarry NPV at 25%', value: npv(0.25, quarry), shown: 64, tol: 0.5 },
    { what: 'Quarry NPV positive only between 20% and 30% (claim)', value: Array.from({ length: 80 }, (_, i) => { const x = i / 100, v = npv(x, quarry); return (x > 0.2 + 1e-9 && x < 0.3 - 1e-9) ? v > 0 : v <= 1e-6; }).every(Boolean) ? 1 : 0, shown: 1 },
    { what: 'Quarry PV of outflows', value: -qNeg, shown: 90645, tol: 0.5 },
    { what: 'Quarry FV of inflow', value: qPos, shown: 111000, tol: 0.5 },
    { what: 'Quarry MIRR (%)', value: mirr(quarry, r, r) * 100, shown: 10.7, tol: 0.05 },
    { what: 'No-IRR case: no roots', value: irrAll(noIrr).length, shown: 0 },
    { what: 'No-IRR NPV at 0%', value: npv(0, noIrr), shown: 1000 },
    { what: 'No-IRR NPV at 11%', value: npv(r, noIrr), shown: 682, tol: 0.5 },
    { what: 'No-IRR positive at every rate (claim: discriminant negative)', value: 12000 ** 2 - 4 * 5000 * 8000 < 0 ? 1 : 0, shown: 1 },
    { what: 'Restoration threshold for no IRR (widget)', value: 100000 ** 2 / (4 * 40000), shown: 62500 },
    // scale
    { what: 'Small lamp IRR (%)', value: irr(lampS) * 100, shown: 50, tol: 0.005 },
    { what: 'Large lamp IRR (%)', value: irr(lampL) * 100, shown: 25, tol: 0.005 },
    { what: 'Small lamp NPV', value: npv(r, lampS), shown: 351, tol: 0.5 },
    { what: 'Large lamp NPV', value: npv(r, lampL), shown: 2523, tol: 0.5 },
    // kiosks
    { what: 'Kiosk NPV at 17%', value: npv(0.17, kf), shown: 264.82 },
    { what: 'Kiosk NPV at 18%', value: npv(0.18, kf), shown: -11.68 },
    { what: 'Kiosk interpolated IRR (%)', value: 17 + 264.82 / (264.82 + 11.68), shown: 17.96, tol: 0.005 },
    { what: 'Kiosk IRR (%)', value: irr(kf) * 100, shown: 17.96, tol: 0.005 },
    { what: 'Kiosk payback', value: payback(kf), shown: 2.69, tol: 0.005 },
    { what: 'Kiosk PV y1', value: 5200 / 1.11, shown: 4685, tol: 0.5 },
    { what: 'Kiosk PV y2', value: 5200 / 1.11 ** 2, shown: 4220, tol: 0.5 },
    { what: 'Kiosk PV y3', value: 5200 / 1.11 ** 3, shown: 3802, tol: 0.5 },
    { what: 'Kiosk PV y4', value: 5200 / 1.11 ** 4, shown: 3425, tol: 0.5 },
    { what: 'Kiosk cumulative PV after year 3', value: cum(kf, r)[3], shown: -1293, tol: 0.5 },
    { what: 'Kiosk fraction of year 4', value: -cum(kf, r)[3] / (5200 / 1.11 ** 4), shown: 0.38, tol: 0.005 },
    { what: 'Kiosk discounted payback', value: payback(kf, r), shown: 3.38, tol: 0.005 },
    { what: 'Kiosk PV of savings', value: npv(r, kf) + kiosk.outlay, shown: 16133, tol: 0.5 },
    { what: 'Kiosk PI', value: profitabilityIndex(r, kf), shown: 1.15, tol: 0.005 },
    { what: 'Kiosk NPV', value: npv(r, kf), shown: 2133, tol: 0.5 },
    { what: 'Kiosk IRR almost 18%', value: irr(kf) * 100, shown: 18, tol: 0.05 },
    { what: 'Survey size', value: 392, shown: 392 },
    { what: 'Excel IRR default guess (%)', value: 10, shown: 10 },
    { what: 'Excel IRR tries', value: 20, shown: 20 },
  ],
};
