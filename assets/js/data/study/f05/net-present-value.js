// net-present-value.js — F05 · Net present value. Content only; exercises are in net-present-value.ex.js.
// Uses PROPOSALS (kiosks, cargo bike, solar panels), BUDGET_2028, WORKING_RATE and the 9% line of credit (DEBT) from
// case.js. The proposals’ yearly savings are read as after-tax cash flows (Ana’s estimates). The ferry operator and
// every other non-Lantern business here are fictional and new to this lesson. Cold Brew and the roaster are only
// named: investment-criteria and project-cash-flows analyse them.
import { PROPOSALS, BUDGET_2028, WORKING_RATE, DEBT, TODAY } from './case.js?v=30';
import { npv } from '../../../core/invest.js?v=30';

const r = WORKING_RATE;                                                      // 0.11
const P = Object.fromEntries(PROPOSALS.filter((p) => p.outlay).map((p) => [p.name, p]));
const kiosk = P['Ordering kiosks for the cafés'], bike = P['Electric cargo bike for deliveries'], solar = P['Solar panels on the kitchen roof'];
const flowsOf = (p) => [-p.outlay, ...Array(p.life).fill(p.saving)];
const af = (rate, n) => (1 - (1 + rate) ** -n) / rate;
const npvK = npv(r, flowsOf(kiosk)), npvB = npv(r, flowsOf(bike)), npvS = npv(r, flowsOf(solar));
const pvB = bike.saving * af(r, bike.life);
const solarMid = solar.saving * af(r, solar.life) * (1 + r) ** 0.5 - solar.outlay;
const solarIrr = (() => { let lo = 0.05, hi = 0.15; for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (npv(m, flowsOf(solar)) > 0) lo = m; else hi = m; } return lo; })();
// the fictional ferry operator’s shelter (XNPV): dates and amounts
const day = (iso) => Date.parse(`${iso}T00:00:00Z`) / 864e5;
const ferry = [['2028-06-01', -60000], ['2028-09-15', 15000], ['2028-12-31', 14000], ['2029-12-31', 22000], ['2030-12-31', 22000], ['2031-12-31', 18000]];
const ferryT = ferry.map(([d]) => (day(d) - day(ferry[0][0])) / 365);
const ferryPv = ferry.map(([, v], i) => v / 1.09 ** ferryT[i]);
const ferryNpv = ferryPv.reduce((a, b) => a + b, 0);

export default {
  slug: 'net-present-value',
  title: 'Net present value',
  blurb: 'A firm creates value by investing in projects worth more than they cost. Learn what the opportunity cost of capital is, why accepting projects with a positive net present value makes the owners richer whatever their tastes, how to set out a project’s timing, and how to calculate NPV in Excel for annual and dated cash flows.',
  status: 'draft',
  objectives: [
    'Explain capital budgeting as a decision about value, and the opportunity cost of capital as the expected return investors give up elsewhere at the same risk.',
    'Calculate the net present value of a project from its cash flows and apply the NPV rule to independent projects.',
    'Explain why accepting positive-NPV projects makes every owner better off, whether they want to spend now or later, and what that argument assumes.',
    'Use value additivity to judge projects separately, and recognise how the timing convention can change a close decision.',
    'Calculate NPV in Excel with NPV (adding the year-0 cash flow outside the function) and with XNPV for cash flows on actual dates.',
  ],
  prerequisites: [
    { lesson: 'f04/discounting-cash-flows', why: 'It introduced NPV, the NPV profile and Excel’s NPV function; this lesson builds the decision rule on them.' },
    { lesson: 'f04/annuities', why: 'Level yearly savings are annuities, valued in one step with the annuity factor.' },
    { lesson: 'f00/decision-principles', why: 'Cash flow rather than profit, and incremental thinking, decide which numbers go into an NPV.' },
    { lesson: 'f00/finance-time-and-risk', why: 'The risk premium explains why riskier cash flows are discounted at higher rates.' },
  ],
  case: 'lantern',

  concept: [
    { case: `It is ${TODAY}. Lantern Coffee Co. has finished its second year: an online shop and catering kitchen since 2026 and two cafés since March 2027. Ana Lim owns all its shares, and she is choosing what Lantern should invest in from 1 April 2028. Five proposals are on her desk: canned Cold Brew sold through grocers, an in-house coffee roaster, ordering kiosks for the cafés, an electric cargo bike for deliveries and solar panels on the kitchen roof. Without raising new money she can spend about $${BUDGET_2028.toLocaleString('en-US')} at the start of April. Every figure in the case is fictional.` },

    { h: 'Capital budgeting is a decision about value' },
    { p: 'Every proposal on Ana’s desk has the same shape: money goes out now, and more money is expected to come back over several years. <g>Capital budgeting</g> is the process of deciding which of these long-term investments to make. It is central to corporate finance, because a firm’s value comes from its assets and the cash they will produce. Long-term investments are also hard to reverse: a poor one can tie up money for years.' },
    { p: 'The question to ask of each proposal is not “will it make a profit?” or “will it pay for itself?” but “is it worth more than it costs?”. A project is worth the present value of the cash it will bring in. If that is more than the cash it needs today, the owners are richer by the difference the day they commit to it. That difference is the project’s <g>net present value</g>.' },

    { h: 'The opportunity cost of capital' },
    { p: 'To find a present value you need a <g>discount rate</g>. The right rate for a project is its <g>opportunity cost of capital</g>: the expected return that the owners could earn by investing the same money elsewhere, in an investment of the same risk. If Lantern spends $7,500 on a cargo bike, Ana gives up whatever that $7,500 would have earned in the next-best use of the same risk. The project has to beat that return to be worth doing.' },
    { p: 'Three things follow. First, the rate depends on the risk of the project’s cash flows, not on who pays for it or how: a project financed with a cheap loan is no safer than the same project paid for in cash. Second, the rate is a market rate, set by what investors in general can earn, not by what Ana would like to earn. Third, riskier projects need higher rates, because investors demand a <g>risk premium</g> for bearing risk. A bank deposit is the wrong comparison for a café investment; the shares of small food and coffee businesses are a better one.' },
    { p: 'Estimating that rate properly takes the whole of module 3. Until then Ana uses <b>11% a year</b> as her working figure for Lantern’s projects of ordinary risk: a judgement, not a measurement. (M06 Customer Analytics valued Lantern’s customers at a round 10% a year; F05 estimates the rate with more care, and module 3 will test whether 11% is about right.)' },

    { h: 'Net present value and the NPV rule' },
    { p: String.raw`Write the project’s cash flows as <m>C_0, C_1, \ldots, C_n</m>, with <m>C_0</m> today (usually negative, the outlay) and <m>C_t</m> at the end of year <m>t</m>. Then` },
    { math: String.raw`\text{NPV} = C_0 + \frac{C_1}{1 + r} + \frac{C_2}{(1 + r)^2} + \cdots + \frac{C_n}{(1 + r)^n}` },
    { p: String.raw`where <m>r</m> is the opportunity cost of capital. The <b>NPV rule</b> says: accept a project if its NPV is positive and reject it if its NPV is negative. When projects are <g>independent projects</g>, so that taking one does not rule out another, each is judged on its own NPV. When they are <g>mutually exclusive projects</g>, such as two different roasters for the same corner of the kitchen, take the one with the highest NPV, provided it is positive (module 2 deals with the complications).` },
    { p: 'An NPV of zero is not a failure. It means the project earns exactly the opportunity cost of capital: it returns the outlay plus 11% a year, no more and no less. The owners are no better and no worse off than if they had invested the money elsewhere at the same risk. A positive NPV is the value created on top of that.' },
    { case: `The cargo bike costs $${bike.outlay.toLocaleString('en-US')} and Ana expects it to save $${bike.saving.toLocaleString('en-US')} a year, after tax, in courier fees and van fuel for ${bike.life} years. The savings form a five-year annuity, so their present value at 11% is 2,300 × 3.695897 ≈ $8,501. The NPV is 8,501 − 7,500 ≈ <b>+$1,001</b>. On Ana’s estimates the bike makes her about $1,001 richer, in today’s money, the day Lantern buys it.` },
    { table: {
      caption: 'Lantern’s three small proposals at 11% (Ana’s fictional estimates; yearly savings after tax, at the end of each year)',
      head: ['Proposal', 'Outlay', 'Saving a year', 'Years', 'PV of savings', 'NPV'],
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      rows: [
        ['Ordering kiosks', '$14,000', '$5,200', '4', '$16,133', '+$2,133'],
        ['Electric cargo bike', '$7,500', '$2,300', '5', '$8,501', '+$1,001'],
        ['Solar panels', '$19,000', '$3,100', '10', '$18,257', '−$743'],
      ],
      note: 'PV of savings = saving × annuity factor at 11% (3.102446 for 4 years, 3.695897 for 5, 5.889232 for 10). NPV = PV of savings − outlay.',
    } },
    { p: 'The kiosks and the bike pass; the solar panels do not. Their savings add up to $31,000, well over the $19,000 they cost, but that sum ignores when the money arrives. Spread over ten years and discounted at 11%, the savings are worth $743 less than the panels cost. The panels earn about 10.1% a year, a little under what the same money could earn elsewhere at the same risk.' },

    { h: 'Why the NPV rule makes the owners richer' },
    { p: 'Lantern has one owner, but most firms have many, and they differ: some want cash now, others are saving for later. It may seem that a manager would need to know their tastes to choose investments. She does not, and the reason is the most important idea in this lesson.' },
    { p: 'Suppose owners can borrow and lend in the financial markets at the opportunity cost of capital. Then a positive-NPV project lets every owner spend more, now or later or both. Take the bike. Ana could borrow $8,501 today at 11% and repay the loan with exactly the bike’s savings: $2,300 a year for five years pays off a loan of $8,501 at 11%. She would spend $7,500 of the loan on the bike and have $1,001 left to spend today, with nothing left to repay. If she prefers to spend later, she can instead invest that $1,001 at 11%, which grows to about $1,686 by the end of year 5. Either way she is better off than without the bike.' },
    { callout: 'key', title: 'Investment and taste can be separated', html: 'When owners can borrow and lend at the market rate, the investment decision (which projects add value) does not depend on the owners’ preferences about when to spend (which they arrange themselves by borrowing or lending). Every owner, patient or impatient, agrees that the firm should take every positive-NPV project. The firm’s job is to maximise the present value of what it owns; the owners’ job is to decide when to consume it.' },
    { p: 'The argument rests on assumptions, and it is worth knowing where they bite. Owners must be able to borrow and lend at roughly the same rate, for that level of risk. For a large listed company whose shareholders can sell shares or buy more, that is close enough. For a small private firm it may not be: Ana can lend her savings at a bank’s deposit rate but would pay much more to borrow against an uncertain stream of savings. Then her own need for cash can reasonably affect which projects Lantern takes, and quick paybacks matter more to her than the NPV rule says they should. The next lesson returns to this when it asks why so many firms still use payback.' },
  ],

  theory: [
    { h: 'What the NPV rule assumes' },
    { p: 'An NPV is a calculation on forecasts, and five assumptions sit inside it.' },
    { ol: [
      '<b>The cash flows are unbiased forecasts.</b> Each <m>C_t</m> should be the expected cash flow, the probability-weighted average of what might happen, not the hoped-for case. Optimistic forecasts make every project look good; the lesson on project risk shows how to test them.',
      '<b>The cash flows are incremental.</b> Only cash that changes because of the decision belongs in the NPV: <g>incremental cash flows</g>, after tax, including effects on the rest of the firm. The lesson on project cash flows builds them line by line.',
      '<b>Risk is in the rate.</b> The discount rate carries the project’s risk; the cash flows are not trimmed for risk as well. One rate for every year means the risk adjustment compounds with time: a cash flow ten years away is penalised much more than one next year. That suits most projects, whose uncertainty grows with distance, but not all.',
      '<b>The rate fits this project.</b> A firm-wide rate is right only for projects as risky as the firm’s existing business. A new product line may be riskier than Lantern’s cafés; module 3 shows how to adjust.',
      '<b>Now or never, and money is available.</b> The plain rule compares investing now with never investing, and assumes the firm can raise money for every positive-NPV project. Options to wait or expand (project-risk) and limits on capital (choosing-between-projects, both in module 2) relax these.',
    ] },

    { h: 'NPVs add up' },
    { p: String.raw`Present values are measured in the same unit, today’s dollars, so they can be added. The NPV of two projects taken together is the sum of their NPVs: <m>\text{NPV}(A + B) = \text{NPV}(A) + \text{NPV}(B)</m>. This property, <g>value additivity</g>, has two uses. It lets a firm value a programme of projects by valuing each part, and it exposes a common trick. Present the kiosks and the solar panels as one “café upgrade” and the package has an NPV of about +$1,389, the kiosks’ NPV plus the panels’, so it looks acceptable. But the package is worth less than the kiosks alone. A project that cannot stand on its own should not ride on a good one; judge each separable part separately.` },
    { p: 'Additivity also means that NPV, unlike a rate of return or a ratio, measures value in dollars. Two projects with the same percentage return can add very different amounts of value if one is ten times the size of the other.' },

    { h: 'Timing conventions' },
    { p: 'The formula is only as good as the timeline behind it, so set the timeline out before typing a number. Lantern’s conventions, used throughout F05, are these.' },
    { list: [
      '<b>Year 0 is the decision date</b>, 1 April 2028 for Lantern’s 2028 projects. Outlays made then are not discounted.',
      '<b>Year t runs from April to March</b> (year 1 is April 2028 to March 2029), and its cash flow is treated as arriving at the end of the year, on 31 March. Cash that is paid at the start of a year, such as rent in advance, belongs at the end of the year before (year t − 1).',
      '<b>The rate is per year</b>, matching the spacing of the cash flows. Monthly cash flows would need a monthly rate.',
    ] },
    { p: String.raw`Treating a year’s cash as arriving on its last day is a simplification. Savings from the bike accrue week by week, so on average they arrive about half a year earlier than the model says. A common refinement, the <g>mid-year convention</g>, discounts each year’s cash flow by <m>(1 + r)^{t - 0.5}</m> instead of <m>(1 + r)^t</m>, which multiplies the present value of the yearly flows by <m>(1 + r)^{0.5}</m>. For the solar panels that turns −$743 into +$235. A close call can turn on a convention, which is a reason to state the convention and to treat an NPV near zero as “about zero”, not as a verdict.` },

    { h: 'NPV in Excel: NPV and XNPV' },
    { p: 'Excel’s <x>NPV(rate, value1, …)</x> assumes that its first value arrives one period from now, so it is really a present-value function for years 1 to n. Microsoft’s documentation says a cash flow at the start of the first period must be added to the result rather than included in the values. With the outlay in B4 and the savings in B5:B9, the NPV is <x>=B4+NPV(B1,B5:B9)</x>, where B1 holds the rate. Putting B4 inside the range divides the whole answer by 1 + r: for the bike, $901 instead of $1,001.' },
    { p: String.raw`Real cash flows rarely fall on neat anniversaries. <x>XNPV(rate, values, dates)</x> takes a date for each cash flow and discounts each one by <m>(1 + r)^{(d_i - d_0)/365}</m>, where <m>d_0</m> is the first date: the first value is not discounted, and the rate is an effective annual rate. The dates must not fall before the first one. Worked example 2 uses XNPV for a project with cash flows on six different dates.` },

    { h: 'NPV against other goals' },
    { p: 'Firms sometimes say they aim to maximise profit, sales growth or the rate of return on their investments. Each can point the wrong way. Profit in a single year ignores what happens later and what the investment cost. Growth can be bought with projects that earn less than investors could get elsewhere. A high rate of return can come from a tiny project that adds almost nothing. NPV takes account of the timing of every cash flow, of risk through the rate, and of scale, and its answer is in the unit owners care about: dollars of wealth today. The next lesson compares it with the internal rate of return, payback and the profitability index, which firms also use.' },
  ],

  formulas: [
    { id: 'npv-level-saving', name: 'NPV of a project with a level yearly cash flow',
      tex: String.raw`\text{NPV} = -I + C \times \frac{1 - (1 + r)^{-n}}{r}`,
      where: [
        [String.raw`\text{NPV}`, 'Net present value of the project', '$'],
        [String.raw`I`, 'Outlay today (year 0)', '$'],
        [String.raw`C`, 'Cash flow at the end of each year, after tax', '$ a year'],
        [String.raw`r`, 'Opportunity cost of capital, as a decimal', 'per year'],
        [String.raw`n`, 'Number of years of cash flows', 'years'],
      ],
      assumptions: 'Equal cash flows at the end of each year for n years; one rate throughout.',
      note: 'The fraction is the annuity factor from F04. Uneven cash flows are discounted one by one.' },
    { id: 'npv-additivity', name: 'Value additivity',
      tex: String.raw`\text{NPV}(A + B) = \text{NPV}(A) + \text{NPV}(B)`,
      where: [
        [String.raw`\text{NPV}(A + B)`, 'NPV of taking projects A and B together', '$'],
        [String.raw`\text{NPV}(A), \text{NPV}(B)`, 'NPV of each project on its own', '$'],
      ],
      assumptions: 'The projects’ cash flows do not affect each other; if they do, value the interaction as a cash flow of its own.',
      note: 'Judge each separable part of a package on its own NPV.' },
    { id: 'npv-mid-year', name: 'NPV with the mid-year convention',
      tex: String.raw`\text{NPV} = C_0 + \sum_{t=1}^{n} \frac{C_t}{(1 + r)^{t - 0.5}}`,
      where: [
        [String.raw`C_0`, 'Cash flow at the decision date', '$'],
        [String.raw`C_t`, 'Cash flow spread through year t', '$'],
        [String.raw`r`, 'Opportunity cost of capital, as a decimal', 'per year'],
        [String.raw`t`, 'Year', 'years'],
        [String.raw`n`, 'Last year of cash flows', 'years'],
      ],
      assumptions: 'Each year’s cash arrives evenly through the year, so on average at its middle.',
      note: 'Equal to the year-end NPV of the flows after year 0, multiplied by (1 + r)^0.5, plus C₀.' },
    { id: 'npv-xnpv', name: 'NPV with dated cash flows (XNPV)',
      tex: String.raw`\text{XNPV} = \sum_{i=0}^{m} \frac{C_i}{(1 + r)^{(d_i - d_0)/365}}`,
      where: [
        [String.raw`C_i`, 'The i-th cash flow', '$'],
        [String.raw`d_i`, 'The date of the i-th cash flow', 'days'],
        [String.raw`d_0`, 'The first date, to which every cash flow is discounted', 'days'],
        [String.raw`r`, 'Effective annual discount rate, as a decimal', 'per year'],
        [String.raw`m`, 'Index of the last cash flow', ''],
      ],
      assumptions: 'A 365-day year; no date before the first one.',
      note: 'Excel’s XNPV(rate, values, dates). The first cash flow is not discounted.' },
    { id: 'npv-separation', name: 'Spending today with a positive-NPV project',
      tex: String.raw`C_{\text{now}}^{\max} = W + \text{NPV}`,
      where: [
        [String.raw`C_{\text{now}}^{\max}`, 'The most an owner can spend today by borrowing against the project’s future cash flows', '$'],
        [String.raw`W`, 'The owner’s wealth today without the project', '$'],
        [String.raw`\text{NPV}`, 'The project’s NPV at the market rate', '$'],
      ],
      assumptions: 'The owner can borrow and lend at the rate used to discount the project.',
      note: 'An owner who prefers to spend later gains NPV × (1 + r)ᵗ at year t instead.' },
  ],

  examples: [
    { level: 'simple', title: 'The cargo bike', fictional: true,
      setup: 'Lantern can buy an electric cargo bike for $7,500 on 1 April 2028. Ana estimates it will save $2,300 a year after tax, at the end of each of the next five years, and has no resale value in mind. Her working discount rate is 11%. Should Lantern buy it, and what does the answer mean for Ana?',
      steps: [
        'Set out the timeline: −$7,500 at year 0; +$2,300 at the end of years 1 to 5.',
        String.raw`The savings are a level annuity, so use the annuity factor: <m>(1 - 1.11^{-5}) \div 0.11 = 3.695897</m>. Present value of the savings = <m>2{,}300 \times 3.695897 \approx 8{,}501</m> dollars.`,
        'NPV = present value of the savings − outlay = 8,501 − 7,500 ≈ +$1,001.',
        'Apply the NPV rule: the NPV is positive, so the bike earns more than the 11% Ana could expect elsewhere at the same risk. Accept.',
      ],
      answer: 'NPV ≈ +$1,001 at 11%: buy the bike.',
      interpretation: 'Buying the bike makes Ana about $1,001 richer in today’s money. She could borrow $8,501 at 11% against the savings, pay for the bike and spend the $1,001 now; or invest the $1,001 and have about $1,686 more at the end of year 5. The answer is only as good as the $2,300 a year estimate, which is worth checking against the courier invoices.' },
    { level: 'challenging', title: 'A shelter paid for on actual dates', fictional: true,
      setup: 'Oakum Ferries, a fictional ferry operator, will build a passenger shelter with ticket machines for $60,000, paid on 1 June 2028. A regional tourism grant of $15,000 arrives on 15 September 2028. The shelter’s extra net cash inflows, after tax, are expected on 31 December each year: $14,000 in 2028, $22,000 in 2029 and 2030, and $18,000 in 2031, when the operator plans to replace it. Its opportunity cost of capital is 9% a year. Find the NPV on 1 June 2028.',
      table: {
        caption: 'Oakum Ferries’ shelter: each cash flow discounted to 1 June 2028 at 9% (fictional)',
        head: ['Date', 'Cash flow', 'Days from 1 June 2028', 'Years (days ÷ 365)', 'Present value'],
        align: ['l', 'r', 'r', 'r', 'r'],
        rows: [
          ['1 Jun 2028', '−$60,000', '0', '0', '−$60,000'],
          ['15 Sep 2028', '$15,000', '106', '0.2904', '$14,629'],
          ['31 Dec 2028', '$14,000', '213', '0.5836', '$13,313'],
          ['31 Dec 2029', '$22,000', '578', '1.5836', '$19,194'],
          ['31 Dec 2030', '$22,000', '943', '2.5836', '$17,609'],
          ['31 Dec 2031', '$18,000', '1,308', '3.5836', '$13,218'],
        ],
        foot: [['NPV', '', '', '', '$17,963']],
      },
      steps: [
        'The dates are irregular, so measure each one in years from 1 June 2028, counting days and dividing by 365, as XNPV does. 2028 is a leap year, but XNPV still divides by 365.',
        String.raw`Discount each cash flow with the effective annual rate: for example the grant is worth <m>15{,}000 \div 1.09^{0.2904} \approx 14{,}629</m> dollars, and the 2031 inflow <m>18{,}000 \div 1.09^{3.5836} \approx 13{,}218</m>.`,
        'Add the present values, including the undiscounted outlay: NPV ≈ +$17,963 (see the table).',
        'In Excel, with the rate in B1, amounts in C4:C9 and dates in B4:B9: <x>=XNPV(B1,C4:C9,B4:B9)</x> gives the same answer. Plain NPV() would treat the six amounts as one year apart and get the timing badly wrong.',
      ],
      answer: 'NPV ≈ +$17,963 on 1 June 2028 at 9%: build the shelter.',
      interpretation: 'The grant and the first inflow arrive within seven months, which is why dated discounting matters here: forcing them onto year-end dates would push them a whole year later than they really arrive. The answer is a value on 1 June 2028; to compare it with values on another date, move it with the same 9% rate.' },
    { level: 'applied', title: 'Ana’s three small proposals', fictional: true,
      setup: 'Ana has three small proposals besides Cold Brew and the roaster (see the table in The idea): ordering kiosks ($14,000, saving $5,200 a year for 4 years), the cargo bike ($7,500, $2,300 for 5 years) and solar panels ($19,000, $3,100 for 10 years), all savings after tax at the end of each year. Her café manager suggests presenting the kiosks and panels together as one “café upgrade”. Which proposals should Lantern accept at 11%, how should she treat the package, and how firm is the verdict on the panels?',
      steps: [
        'Value each proposal on its own (annuity factors at 11%): kiosks 5,200 × 3.102446 − 14,000 ≈ +$2,133; bike +$1,001 (example 1); panels 3,100 × 5.889232 − 19,000 ≈ −$743.',
        'Apply the NPV rule to each: the three are independent (taking one does not rule out another), so accept the kiosks and the bike, and reject the panels at 11%.',
        'Check the package with value additivity: NPV(kiosks + panels) = NPV(kiosks) + NPV(panels) ≈ +$1,389 (from the unrounded values), which is less than the kiosks alone. The package hides a value-losing part; split it.',
        'Test the panels’ verdict. Their IRR is about 10.1%, so the NPV turns positive at any rate below that: at 10% it is about +$48. With the mid-year convention at 11% it is about +$235. Discounted at the 9% on Lantern’s line of credit it would be about +$895, but that is the wrong rate: it prices a bank’s claim, not the riskiness of the panels’ savings.',
      ],
      answer: 'Accept the kiosks (+$2,133) and the bike (+$1,001); reject the solar panels (−$743) at 11%, and keep them out of any package.',
      interpretation: 'Together the kiosks and the bike cost $21,500 and add about $3,133. The panels are a close call: their verdict depends on whether 11% is the right rate for savings as steady as a roof’s electricity, and module 3 may change it. Ana notes them as “revisit after estimating the cost of capital” rather than “rejected for good”. Whether the $40,000 budget can cover these alongside Cold Brew and the roaster is the capital-rationing question in module 2.' },
  ],

  demo: [
    { widget: 'npv-level', intro: 'A project with a level yearly cash flow, starting at the cargo bike. Move the discount rate and watch the NPV fall as the rate rises, crossing zero at the project’s own rate of return. Then try the solar panels ($19,000, $3,100 a year, 10 years): notice how close to zero they sit at 11%.' },
    { widget: 'spend-now-later', intro: 'Why owners agree: an owner with some wealth today, a one-year project and a market rate for borrowing and lending. The two lines show every combination of spending today and spending in a year that she can reach, with and without the project. When the NPV is positive the “with” line lies above the other everywhere, so she gains whatever she prefers. Lower the payoff until the NPV is negative and the lines swap.' },
  ],

  mistakes: [
    { title: 'Discounting at the loan rate', html: 'The rate that matters is the return given up at the project’s risk, not the interest rate on the money borrowed to pay for it. Discounted at the 9% on Lantern’s line of credit, the solar panels show about +$895; at the 11% their risk calls for, −$743. A loan’s rate prices the lender’s fairly safe claim; the project’s cash flows are riskier.' },
    { title: 'Reading an NPV of zero as “breaking even”', html: 'A project with an NPV of zero repays its cost and also earns the full 11% a year on it. It is a fair deal, not a loss. A project that merely gets its money back, with no return, has a negative NPV.' },
    { title: 'Adding undiscounted savings', html: 'The panels’ savings add up to $31,000 against a $19,000 cost, which looks like a $12,000 gain. Spread over ten years and discounted, they are worth $18,257. Undiscounted totals ignore the opportunity cost of capital.' },
    { title: 'Bundling a weak project with a strong one', html: 'A package’s NPV is the sum of its parts’ NPVs. If one part has a negative NPV and can be dropped, the package is worth more without it, even when the package as a whole is positive.' },
    { title: 'Putting the year-0 cash flow inside Excel’s NPV', html: 'Excel’s NPV() discounts its first value by one period. Add the outlay outside the function: <x>=B4+NPV(B1,B5:B9)</x>. Inside the range, every cash flow is discounted once too often and the answer is the true NPV ÷ (1 + r).' },
    { title: 'Treating the NPV as a fact', html: 'An NPV is a forecast discounted at an estimated rate. A result of a few hundred dollars on a $19,000 project is “about zero”: test the forecasts and the rate before relying on its sign.' },
  ],

  application: [
    { p: 'In most firms capital budgeting is a process as much as a calculation. Proposals come from the people who see the opportunities: a café manager asking for kiosks, a delivery driver suggesting a bike. Finance staff turn each proposal into a set of cash-flow forecasts, choose the rate for its risk, and calculate the NPV. Small projects are approved by a manager within a spending limit; large ones go to the board. A year or two later, a post-audit compares what happened with what was forecast, which shows whether the people who make forecasts tend to be optimistic, and by how much.' },
    { p: '<b>A fictional chain of climbing gyms</b> considers adding auto-belay devices to its walls. The finance lead prices them at the chain’s 10% rate for routine equipment, sets out the cash flows on the dates the supplier will be paid and the dates the extra memberships should begin, and uses XNPV because the first savings arrive within months. She values each gym’s installation separately rather than the chain-wide “upgrade”, because one small gym has too few members to cover the cost, and value additivity shows that the programme is worth more without it.' },
    { p: '<b>A fictional water utility</b> must choose between projects whose risks differ: replacing old pipes, whose savings are steady, and a new treatment plant whose revenue depends on a regulator’s decision. Its analysts discount the two at different rates and report each NPV with the assumptions behind it, so the board can see which inputs the decision rests on.' },
    { case: 'Ana does the same on a small scale. She enters the kiosks and the bike in Lantern’s plan for April: together they cost $21,500 and add about $3,133 at 11%. She asks the café manager to drop the solar panels from the “café upgrade” and to resubmit them on their own once module 3 has put a figure on Lantern’s cost of capital. Before deciding on the two big proposals, Cold Brew and the roaster, she needs two more tools: the other criteria that her bank manager and her accountant keep quoting (the next lesson), and a careful build-up of each project’s cash flows (the lesson after).' },
  ],

  summary: [
    'Capital budgeting decides which long-term investments a firm makes; the test of each is whether it is worth more than it costs.',
    'The opportunity cost of capital is the expected return investors give up elsewhere at the same risk. It depends on the project’s risk, not on how the project is financed. Ana uses 11% as a working figure until module 3 estimates it.',
    'NPV = C₀ + Σ Cₜ ÷ (1 + r)ᵗ. Accept independent projects with a positive NPV; between mutually exclusive projects, take the highest positive NPV. An NPV of zero earns exactly the opportunity cost.',
    'When owners can borrow and lend at the market rate, a positive NPV lets every owner spend more now or later, so they all agree on the rule whatever their tastes. For small private firms that assumption is weaker.',
    'NPVs add: value each separable part of a package on its own.',
    'State the timing convention: year 0 is the decision date, year-t cash flows at the end of the year; the mid-year convention is a refinement that can flip close calls.',
    'In Excel, add the year-0 flow outside NPV(); use XNPV(rate, values, dates) for cash flows on actual dates.',
  ],

  glossary: [
    { term: 'Opportunity cost of capital', def: 'The expected return that investors give up by putting money into a project instead of into the best alternative investment of the same risk. It is the discount rate for the project’s cash flows, and it depends on the project’s risk, not on how the project is financed.' },
    { term: 'Independent projects', def: 'Projects whose acceptance or rejection does not affect each other, so each is accepted if its own NPV is positive.' },
    { term: 'Mutually exclusive projects', def: 'Projects of which at most one can be chosen, such as two machines for the same job; the one with the highest positive NPV is preferred.' },
    { term: 'Value additivity', def: 'The property that the NPV of several projects taken together equals the sum of their separate NPVs, because all are measured in today’s dollars.' },
    { term: 'Mid-year convention', def: 'A timing assumption that treats each year’s cash flow as arriving in the middle of the year, discounting it by (1 + r)^(t − 0.5) instead of (1 + r)^t.' },
  ],

  references: [
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 16.2, “Net Present Value (NPV) Method”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/16-2-net-present-value-npv-method', checked: '2026-11-05' },
    { text: 'Microsoft. <i>NPV function</i> (Excel help: values at the end of each period; a first cash flow at the start of the first period is added to the result).', url: 'https://support.microsoft.com/office/npv-function-8672cb67-2576-4d07-b67b-ac28acf2a568', checked: '2026-11-05' },
    { text: 'Microsoft. <i>XNPV function</i> (Excel help: payments discounted on a 365-day year from the first date).', url: 'https://support.microsoft.com/office/xnpv-function-1b42bbf6-370f-4532-a0eb-d67c16b664b7', checked: '2026-11-05' },
  ],

  checks: [
    { what: 'Working rate (%)', value: r * 100, shown: 11 },
    { what: 'Budget', value: BUDGET_2028, shown: 40000 },
    { what: 'Bike outlay', value: bike.outlay, shown: 7500 },
    { what: 'Bike saving', value: bike.saving, shown: 2300 },
    { what: 'Bike life', value: bike.life, shown: 5 },
    { what: 'Annuity factor 5 years at 11%', value: af(r, 5), shown: 3.695897, tol: 0.0000005 },
    { what: 'Annuity factor 4 years at 11%', value: af(r, 4), shown: 3.102446, tol: 0.0000005 },
    { what: 'Annuity factor 10 years at 11%', value: af(r, 10), shown: 5.889232, tol: 0.0000005 },
    { what: 'PV of bike savings', value: pvB, shown: 8501, tol: 0.5 },
    { what: 'Bike NPV', value: npvB, shown: 1001, tol: 0.5 },
    { what: 'Bike NPV by annuity', value: pvB - bike.outlay, shown: 1001, tol: 0.5 },
    { what: 'Kiosk outlay', value: kiosk.outlay, shown: 14000 },
    { what: 'Kiosk saving', value: kiosk.saving, shown: 5200 },
    { what: 'Kiosk life', value: kiosk.life, shown: 4 },
    { what: 'Kiosk PV of savings', value: kiosk.saving * af(r, 4), shown: 16133, tol: 0.5 },
    { what: 'Kiosk NPV', value: npvK, shown: 2133, tol: 0.5 },
    { what: 'Solar outlay', value: solar.outlay, shown: 19000 },
    { what: 'Solar saving', value: solar.saving, shown: 3100 },
    { what: 'Solar life', value: solar.life, shown: 10 },
    { what: 'Solar PV of savings', value: solar.saving * af(r, 10), shown: 18257, tol: 0.5 },
    { what: 'Solar NPV', value: npvS, shown: -743, tol: 0.5 },
    { what: 'Solar undiscounted savings', value: solar.saving * solar.life, shown: 31000 },
    { what: 'Solar undiscounted gain', value: solar.saving * solar.life - solar.outlay, shown: 12000 },
    { what: 'Solar IRR about 10.1%', value: solarIrr * 100, shown: 10.1, tol: 0.05 },
    { what: 'Solar IRR below 11% (claim: rejected at 11%, NPV positive below IRR)', value: solarIrr < r && npvS < 0 && npv(0.10, flowsOf(solar)) > 0 ? 1 : 0, shown: 1 },
    { what: 'Solar NPV at 10%', value: npv(0.10, flowsOf(solar)), shown: 48, tol: 0.5 },
    { what: 'Solar mid-year NPV', value: solarMid, shown: 235, tol: 0.5 },
    { what: 'Line of credit rate (%)', value: DEBT.lineOfCredit.rate * 100, shown: 9 },
    { what: 'Solar NPV at 9%', value: npv(DEBT.lineOfCredit.rate, flowsOf(solar)), shown: 895, tol: 0.5 },
    { what: 'Package NPV (kiosks + solar)', value: npv(r, flowsOf(solar).map((x, i) => x + (flowsOf(kiosk)[i] ?? 0))), shown: 1389, tol: 0.5 },
    { what: 'Package NPV by additivity', value: npvK + npvS, shown: 1389, tol: 0.5 },
    { what: 'Package worth less than kiosks alone', value: npvK + npvS < npvK ? 1 : 0, shown: 1 },
    { what: 'Kiosks + bike outlay', value: kiosk.outlay + bike.outlay, shown: 21500 },
    { what: 'Kiosks + bike NPV', value: npvK + npvB, shown: 3133, tol: 0.5 },
    { what: 'Bike: loan of PV repaid by savings (balance after 5 years)', value: (() => { let b = pvB; for (let t = 0; t < 5; t++) b = b * (1 + r) - bike.saving; return b; })(), shown: 0, tol: 0.001 },
    { what: 'Bike: NPV invested to year 5', value: npvB * (1 + r) ** 5, shown: 1686, tol: 0.5 },
    { what: 'Excel slip for the bike', value: npvB / (1 + r), shown: 901, tol: 0.5 },
    // ferry
    { what: 'Ferry outlay', value: -ferry[0][1], shown: 60000 },
    { what: 'Ferry days to 15 Sep', value: day('2028-09-15') - day('2028-06-01'), shown: 106 },
    { what: 'Ferry days to 31 Dec 2028', value: day('2028-12-31') - day('2028-06-01'), shown: 213 },
    { what: 'Ferry days to 31 Dec 2029', value: day('2029-12-31') - day('2028-06-01'), shown: 578 },
    { what: 'Ferry days to 31 Dec 2030', value: day('2030-12-31') - day('2028-06-01'), shown: 943 },
    { what: 'Ferry days to 31 Dec 2031', value: day('2031-12-31') - day('2028-06-01'), shown: 1308 },
    { what: 'Ferry years 1', value: ferryT[1], shown: 0.2904, tol: 0.00005 },
    { what: 'Ferry years 2', value: ferryT[2], shown: 0.5836, tol: 0.00005 },
    { what: 'Ferry years 3', value: ferryT[3], shown: 1.5836, tol: 0.00005 },
    { what: 'Ferry years 4', value: ferryT[4], shown: 2.5836, tol: 0.00005 },
    { what: 'Ferry years 5', value: ferryT[5], shown: 3.5836, tol: 0.00005 },
    { what: 'Ferry PV grant', value: ferryPv[1], shown: 14629, tol: 0.5 },
    { what: 'Ferry PV 2028', value: ferryPv[2], shown: 13313, tol: 0.5 },
    { what: 'Ferry PV 2029', value: ferryPv[3], shown: 19194, tol: 0.5 },
    { what: 'Ferry PV 2030', value: ferryPv[4], shown: 17609, tol: 0.5 },
    { what: 'Ferry PV 2031', value: ferryPv[5], shown: 13218, tol: 0.5 },
    { what: 'Ferry NPV', value: ferryNpv, shown: 17963, tol: 0.5 },
    { what: 'Ferry: within seven months', value: (day('2028-12-31') - day('2028-06-01')) / 30.4 < 7.1 ? 1 : 0, shown: 1 },
  ],
};
