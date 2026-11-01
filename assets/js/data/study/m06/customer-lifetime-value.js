// customer-lifetime-value.js — M06 · Customer lifetime value. Content only; exercises are in customer-lifetime-value.ex.js.
// Contractual value: Quillmore Alarm Monitoring (fictional) for the timing conventions, and Fader & Hardie's (2007)
// published Regular and High End survival for heterogeneity (with a fictional $100 margin). Noncontractual value: the
// cafés' loyalty-app members (case.js), with the margin taken from F03 (cost of goods 31% of café sales, card fees
// $4,720 on $236,000). The project's subscriptions are not used. Every printed figure is recomputed in `checks`.
import { MEMBER_LIST, VISIT_LIST, joinMap, members } from './case.js?v=25';
import * as CU from '../../../core/customer.js?v=25';
import { FACTS as F03 } from '../f03/case.js?v=25';

// ---------------------------------------------------------------- the margin (F03)
const CARD = F03.cafeCardFees / F03.cafes.sales;            // 0.02
const MR = 1 - F03.cafes.cogsShare - CARD;                  // 0.67
const D_M = 0.008;                                          // 0.8% a month (10% a year is 0.797%)

// ---------------------------------------------------------------- Quillmore (fictional): m 120, r 0.75, d 0.08
const Q = { m: 120, r: 0.75, d: 0.08 };
const qStart = CU.clvConstant({ ...Q }).value, qEnd = CU.clvConstant({ ...Q, timing: 'end' }).value, qM01 = Q.m / (1 + Q.d - Q.r);
const q5 = CU.clvConstant({ ...Q, horizon: 5 }).value, q10 = CU.clvConstant({ ...Q, horizon: 10 }).value;
const q80 = CU.clvConstant({ ...Q, r: 0.8 }).value, q70 = CU.clvConstant({ ...Q, r: 0.7 }).value;

// ---------------------------------------------------------------- Fader & Hardie (2007) Table 1, years 0–7, per 1,000
const REG = [100, 63.1, 46.8, 38.2, 32.6, 28.9, 26.2, 24.1, 22.3, 20.7, 19.4, 18.3, 17.3];
const HI = [100, 86.9, 74.3, 65.3, 59.3, 55.1, 51.7, 49.1, 46.8, 44.5, 42.7, 40.9, 39.4];
const fitBoth = (P) => {
  const alive = P.map((p) => Math.round(p * 10)).slice(0, 8);
  const s = CU.sbgFit([{ alive }]);
  let renew = 0, chances = 0; for (let t = 1; t < alive.length; t++) { renew += alive[t]; chances += alive[t - 1]; }
  return { s, r: renew / chances, r1: alive[1] / alive[0] };
};
const FR = fitBoth(REG), FHE = fitBoth(HI);
const V = (f) => ({
  constNew: CU.clvConstant({ m: 100, r: f.r, d: 0.1 }).value,
  yr1New: CU.clvConstant({ m: 100, r: f.r1, d: 0.1 }).value,
  sbgNew: 100 * CU.sbgDEL(f.s.alpha, f.s.beta, 0.1),
  constOld: CU.clvConstant({ m: 100, r: f.r, d: 0.1, timing: 'end' }).value,
  sbgOld: 100 * CU.sbgDERL(f.s.alpha, f.s.beta, 0.1, 6),
});
const VR = V(FR), VH = V(FHE);

// ---------------------------------------------------------------- the cafés: March 2027 joiners, revenue per joiner by month
const CT = CU.cohortTable(joinMap(), VISIT_LIST);
const MAR = CT.revenue[0].map((v) => v / CT.cohorts[0].size), nMar = CT.cohorts[0].size;
const marSpend = MAR.reduce((s, v) => s + v, 0);
const histUndisc = marSpend * MR;
const histDisc = MAR.reduce((s, v, k) => s + v * MR / (1 + D_M) ** k, 0);
const qDecay = (MAR[9] / MAR[4]) ** (1 / 5);
const tailOf = (q, last, k0) => { let s = 0; for (let k = k0 + 1; k < k0 + 2000; k++) s += last * q ** (k - k0) * MR / (1 + D_M) ** k; return s; };
const tail = tailOf(qDecay, MAR[9], 9), total = histDisc + tail;
const qCal = (MAR[7] / MAR[2]) ** (1 / 5), pred8 = MAR[7] * qCal, pred9 = MAR[7] * qCal ** 2;
const tail80 = tailOf(0.8, MAR[9], 9), tail90 = tailOf(0.9, MAR[9], 9);
const marMonth0Share = MAR[0] / marSpend;
const ratios = MAR.slice(1).map((v, i) => v / MAR[i]);
const marRet9 = CT.retention[0][9];

// ---------------------------------------------------------------- the cafés: value by group, March–August joiners, first five months
const byId = new Map(MEMBER_LIST.map((m) => [m.id, m]));
function firstFive(filter) {
  const ids = new Set(MEMBER_LIST.filter((m) => m.joinedIso <= '2027-08-31' && filter(m)).map((m) => m.id));
  let s = 0, v = 0;
  for (const x of VISIT_LIST) { if (!ids.has(x.id)) continue; const k = CU.monthOf(x.day) - CU.monthOf(byId.get(x.id).joined); if (k <= 4) { s += x.amount; v++; } }
  return { n: ids.size, spend: s / ids.size, visits: v / ids.size, margin: s / ids.size * MR, aov: s / v };
}
const G = { all: firstFive(() => true), H: firstFive((m) => m.cafe === 'Harbourside'), M: firstFive((m) => m.cafe === 'Millbrook'),
  on: firstFive((m) => m.notifications === 1), off: firstFive((m) => m.notifications === 0), near: firstFive((m) => m.near === 1), far: firstFive((m) => m.near === 0) };
const all = members(), repeatRate = all.filter((c) => c.frequency >= 2).length / all.length;

// ---------------------------------------------------------------- figure: when the margins arrive
function timingFigure() {
  const X = (t) => 150 + 66 * t, rows = [
    { y: 62, title: 'A  Full value, first margin now', at: [0, 1, 2, 3], lab: ['m', 'mr', 'mr²', 'mr³'] },
    { y: 152, title: 'B  Full value, margins at period ends', at: [1, 2, 3, 4], lab: ['m', 'mr', 'mr²', 'mr³'] },
    { y: 242, title: 'C  Residual value, after this period', at: [1, 2, 3, 4], lab: ['mr', 'mr²', 'mr³', 'mr⁴'] },
  ];
  let s = '<svg viewBox="0 0 440 330" xmlns="http://www.w3.org/2000/svg" font-size="15" fill="currentColor">';
  for (const r of rows) {
    s += `<text x="8" y="${r.y - 22}" font-size="15">${r.title}</text>`;
    s += `<line x1="${X(0) - 10}" x2="${X(4) + 20}" y1="${r.y}" y2="${r.y}" stroke="var(--ink-3)"/>`;
    for (let t = 0; t <= 4; t++) s += `<line x1="${X(t)}" x2="${X(t)}" y1="${r.y - 5}" y2="${r.y + 5}" stroke="var(--ink-3)"/>`;
    r.at.forEach((t, i) => { s += `<circle cx="${X(t)}" cy="${r.y}" r="6" fill="var(--series-1)"/><text x="${X(t)}" y="${r.y + 26}" text-anchor="middle" font-size="15">${r.lab[i]}</text>`; });
    s += `<text x="${X(4) + 34}" y="${r.y + 5}" font-size="15">…</text>`;
  }
  s += `<line x1="${X(0)}" x2="${X(0)}" y1="20" y2="270" stroke="var(--rule-strong)" stroke-dasharray="4 3"/>`;
  for (let t = 0; t <= 4; t++) s += `<text x="${X(t)}" y="300" text-anchor="middle" font-size="15" fill="var(--ink-3)">${t}</text>`;
  s += `<text x="8" y="300" font-size="15" fill="var(--ink-3)">Period</text><text x="${X(0)}" y="322" text-anchor="middle" font-size="15" fill="var(--ink-3)">now</text>`;
  return `${s}</svg>`;
}

const f2 = (v) => v.toFixed(2);

export default {
  slug: 'customer-lifetime-value',
  title: 'Customer lifetime value',
  blurb: 'Put a number on what a customer is worth: historical and predictive value, margin not revenue, the constant-retention formula with its two timing conventions, a finite horizon, why one average retention rate understates value when customers differ, and a simple projection for members who never tell you they have left.',
  status: 'draft',
  objectives: [
    'Distinguish historical from predictive customer value, and build either from margin rather than revenue.',
    'Calculate lifetime value under constant retention with the first margin now or one period away, over a finite or an infinite horizon, stating the margin, period, retention, discount rate and timing.',
    'Explain why a single average retention rate understates value when customers differ, and calculate value with the shifted-beta-geometric model.',
    'Estimate what a new noncontractual member is worth from a cohort’s history, and check the projection against months it was not fitted to.',
    'Compare value across groups of customers and state what a lifetime value can and cannot support.',
  ],
  prerequisites: [
    { lesson: 'm01/customer-value', why: 'The idea of lifetime value and a first formula, which this lesson takes apart and extends.' },
    { lesson: 'f00/finance-time-and-risk', why: 'Discounting: why a dollar next year is worth less than a dollar now.' },
    { lesson: 'm06/cohort-analysis', why: 'Revenue per joiner by months since joining, read along a cohort’s row.' },
    { lesson: 'm06/survival-analysis', why: 'The shifted-beta-geometric model of contractual retention and its rising retention rate.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'January 2028. Lantern’s two cafés signed up 2,584 loyalty-app members in 2027, and Ana is planning 2028’s marketing. Before she decides what she can afford to spend winning a member, or keeping one, she needs to know what a member is worth. The members never tell Lantern when they stop coming, so she cannot simply read off how long they stay.' },

    { h: 'Value from margins, over time' },
    { p: 'A customer’s <g>customer lifetime value</g> (CLV) is the present value of the margins the customer is expected to bring in over the whole relationship. Each part of that sentence matters. <b>Margins</b>, because what a customer is worth to the business is what is left after the costs of serving them, not what they pay. <b>Expected</b>, because nobody knows how long a particular customer will stay. <b>Present value</b>, because a dollar of margin next year is worth less than a dollar now.' },
    { p: `For the cafés the margin on a dollar of sales is about 67 cents. F03’s figures for 2027 put the cost of goods (beans, milk, cups, bought-in pastries) at 31% of café sales, and card fees at $4,720 on $236,000 of sales, 2%. So the margin is 100% − 31% − 2% = 67% of what a member spends. Wages and rent are left out because they don’t change with one more member’s visits; a lesson that charged them to members would be valuing the cafés, not a customer.` },

    { h: 'Historical and predictive value' },
    { p: `Two different numbers are both called customer value. <b>Historical value</b> adds up what a customer has already brought in: Lantern’s 242 March 2027 joiners spent $${f2(marSpend)} each, on average, by 31 December, worth $${f2(histUndisc)} of margin. <b>Predictive value</b> looks forward: what a customer will bring from now on, or what a new customer will bring over their whole relationship. Historical value is a fact about the past; predictive value is a forecast, and every assumption behind it should be stated.` },
    { p: 'Most decisions need the predictive kind. What a member spent in 2027 is sunk; what matters for a 2028 budget is what next year’s new members will be worth, and what this year’s members still have to give. The rest of this lesson builds that forecast: first for customers whose departures are recorded (a contractual setting, where the retention rate is observed), then for the cafés’ members, whose departures are not.' },

    { h: 'The constant-retention formula' },
    { p: String.raw`In a contractual business a customer stays from one period to the next with probability <m>r</m>, the <g>retention rate</g>. If the margin per period is <m>m</m> and the <g>discount rate</g> per period is <m>d</m>, the expected margin <m>t</m> periods from now is <m>m\,r^t</m> and it is worth <m>m\,r^t/(1+d)^t</m> today. Adding every period gives a geometric series, and the sum depends on when the first margin arrives.` },
    { figure: {
      svg: timingFigure(),
      caption: 'Three ways to time the margins of a customer with margin m per period and retention r. Each amount is then discounted by (1 + d) for each period of waiting.',
      alt: 'Three timelines marked at periods 0 to 4, with a dashed line at period 0 labelled now. Line A has margins at periods 0, 1, 2 and 3 labelled m, mr, mr squared and mr cubed. Line B has the same four margins shifted one period later, at periods 1 to 4. Line C has margins at periods 1 to 4 labelled mr, mr squared, mr cubed and mr to the fourth: no margin now and the first one already multiplied by r.',
    } },
    { p: String.raw`Quillmore Alarm Monitoring (fictional) sells yearly monitoring contracts with a margin of $120 a year; 75% of customers renew each year, and it discounts at 8% a year. Timing A, the first margin paid now and each renewal at the start of its year, gives <m>m(1+d)/(1+d-r) = 120 \times 1.08/0.33 = 392.73</m> dollars: the value of a customer just signed. Timing C counts only what is still to come after this year’s margin has been received, <m>m\,r/(1+d-r) = 120 \times 0.75/0.33 = 272.73</m> dollars: the <g>residual lifetime value</g> of a customer already on the books. Timing B, M01’s convention (every margin at the end of its year, the first one certain), gives <m>m/(1+d-r) = 363.64</m> dollars.` },
    { callout: 'key', title: 'Say which value you mean', html: 'The three numbers answer different questions. A (or B) values a customer you are about to win, so it is the ceiling on what winning one is worth; C values a customer you already have, so it is what you stand to lose if they leave. None of them is “the” CLV, and a figure quoted without its timing can’t be compared with another.' },

    { h: 'When customers differ, one retention rate misleads' },
    { p: `The formula assumes every customer has the same chance of leaving, every year. Real customers differ: some were never going to stay long, some will stay for decades. The flighty leave first, so the survivors are increasingly the loyal ones and the retention rate of a cohort rises with tenure even though nobody’s own loyalty changes. Fader and Hardie’s (2007) published data show it: of their “Regular” customers 63.1% renewed after year 1, 74.2% of those still there renewed after year 2, and 92.0% of those still there after year 7.` },
    { p: `Fit a single retention rate to those seven years and you get ${(FR.r * 100).toFixed(1)}%; fit the shifted-beta-geometric (sBG) model, in which each customer has their own fixed churn probability drawn from a beta distribution, and you get α = ${FR.s.alpha.toFixed(3)} and β = ${FR.s.beta.toFixed(3)}, Fader and Hardie’s estimates. With a margin of $100 a year (a fictional figure; the data give only survival) and a 10% discount rate, the constant rate values a new customer at $${f2(VR.constNew)}, the sBG at $${f2(VR.sbgNew)}. For a customer who has already renewed five times the gap is far wider: $${f2(VR.constOld)} against $${f2(VR.sbgOld)}. A constant rate has no memory, so it gives a ten-year customer the same future as one who signed last month.` },

    { h: 'Members who never say goodbye' },
    { p: `The cafés’ members are a <b>noncontractual</b> setting: a member who stops coming simply stops, so there is no retention rate to put in the formula. It is tempting to use the share of members who came back at least once (${(repeatRate * 100).toFixed(1)}% of all 2,584 by 31 December), but that is a repeat-purchase rate, not a retention rate, and Fader and Hardie (2012) warn that the constant-retention formulas don’t apply to such settings at all. What the data do show, directly, is how much a cohort of joiners spends in each month after joining.` },
    { p: `The 242 March joiners spent $${f2(MAR[0])} each in March, $${f2(MAR[1])} in April and $${f2(MAR[9])} in December, the tenth month. Spend per joiner falls month by month as members drift away and the rest visit a little less often, but it hasn’t reached zero: ${(marRet9 * 100).toFixed(1)}% of them still visited in December. A simple forecast continues the fall at its recent pace. From May (month 4) to December spend per joiner fell by a factor of ${qDecay.toFixed(3)} a month on average; continuing that, and discounting at 0.8% a month, the months from January 2028 on are worth another $${f2(tail)} of margin per March joiner, on top of the $${f2(histDisc)} (discounted to the month each joined) already earned. A new member, on this evidence, is worth about $${total.toFixed(0)} of margin.` },
  ],

  theory: [
    { h: 'The general formula' },
    { p: String.raw`Every lifetime value in this course is the same sum: the expected margin in each period, discounted. If <m>S(t)</m> is the probability a customer is still a customer <m>t</m> periods after joining (with <m>S(0) = 1</m>) and the margin while active is <m>m</m>, then with margins at the start of each period (timing A)` },
    { math: String.raw`\text{CLV} = \sum_{t=0}^{H-1} \frac{m\,S(t)}{(1+d)^t}.` },
    { p: String.raw`Constant retention puts <m>S(t) = r^t</m>. Over an infinite horizon the series <m>\sum (r/(1+d))^t</m> sums to <m>(1+d)/(1+d-r)</m>, which gives timing A’s formula; moving every margin one period later divides it by <m>1+d</m> (timing B); dropping the first margin and starting the sum at <m>t = 1</m> gives timing C. With <m>d = 0</m>, timing A becomes <m>m/(1-r)</m>: the margin times the expected lifetime <m>1/(1-r)</m> periods, counting the first.` },
    { p: String.raw`Fader and Hardie (2012) list introductory textbooks that use each of the three versions and trace the differences to two choices, not to customer behaviour: whether the first margin is included, and whether each period’s margin is booked at its start or its end. Their advice is to draw the timeline of cash flows first, as in the figure, and to write the sum that matches it. M01 used timing B; the lifetime-value widget in this module uses timing A.` },

    { h: 'A finite horizon' },
    { p: String.raw`Many businesses refuse to count margins beyond some horizon <m>H</m>, because products, competitors and customers change. Stopping the sum after <m>H</m> periods multiplies the infinite value by <m>1 - (r/(1+d))^H</m>. For Quillmore, <m>r/(1+d) = 0.75/1.08 = 0.694</m>, so five years capture <m>1 - 0.694^5 = ${(q5 / qStart).toFixed(3)}</m> of the value, $${f2(q5)}, and ten years $${f2(q10)}. A horizon is a judgement about how far the assumptions can be trusted, and it should be stated with the result.` },

    { h: 'The period and its rates' },
    { p: String.raw`Margin, retention and discount rate must all refer to the same period. An annual discount rate of 10% is <m>1.10^{1/12} - 1 = 0.797\%</m> a month, not <m>10\%/12</m>; a monthly retention of 0.95 is <m>0.95^{12} = ${(0.95 ** 12 * 100).toFixed(1)}\%</m> a year, not <m>1 - 12 \times 0.05 = 40\%</m>. Converting with the compounding rule keeps the value the same whichever period you choose, apart from the timing within the year.` },

    { h: 'Sensitivity: retention matters most' },
    { p: String.raw`Lifetime value is most sensitive to retention, because <m>r</m> appears in a denominator that can be small. At Quillmore, five points of retention either way move the value from $${f2(q70)} (70%) to $${f2(q80)} (80%) around the $${f2(qStart)} at 75%: a change of about ${((q80 / qStart - 1) * 100).toFixed(0)}% upwards and ${((1 - q70 / qStart) * 100).toFixed(0)}% downwards. Report CLV with the range that plausible retention rates give, not as a single figure.` },

    { h: 'Heterogeneity and the sBG' },
    { p: String.raw`In the shifted-beta-geometric model each customer has a churn probability <m>\theta</m> that stays fixed for them, and <m>\theta</m> varies across customers following a beta distribution with parameters <m>\alpha</m> and <m>\beta</m>. Averaging over customers gives <m>S(t) = B(\alpha, \beta + t)/B(\alpha, \beta)</m>, where <m>B</m> is the beta function, and a retention rate in period <m>t</m> of <m>(\beta + t - 1)/(\alpha + \beta + t - 1)</m>, which rises towards 1. Fader and Hardie (2007) put it plainly: the rising retention rate is a sorting effect in a heterogeneous population. The lifetime value of a new customer, with margins at the start of each period, is <m>m</m> times the <b>discounted expected lifetime</b> (DEL), <m>\sum_t S(t)/(1+d)^t</m>.` },
    { table: {
      caption: 'Value per customer with a $100 margin a year and a 10% discount rate (survival from Fader and Hardie, 2007; the margin is fictional)',
      head: ['Customer', 'Constant retention', 'sBG', 'sBG ÷ constant'],
      rows: [
        ['Regular, new (timing A)', `$${f2(VR.constNew)}`, `$${f2(VR.sbgNew)}`, (VR.sbgNew / VR.constNew).toFixed(2)],
        ['Regular, after five renewals (residual)', `$${f2(VR.constOld)}`, `$${f2(VR.sbgOld)}`, (VR.sbgOld / VR.constOld).toFixed(2)],
        ['High End, new (timing A)', `$${f2(VH.constNew)}`, `$${f2(VH.sbgNew)}`, (VH.sbgNew / VH.constNew).toFixed(2)],
        ['High End, after five renewals (residual)', `$${f2(VH.constOld)}`, `$${f2(VH.sbgOld)}`, (VH.sbgOld / VH.constOld).toFixed(2)],
      ],
      align: ['l', 'r', 'r', 'r'],
      note: `Both models fitted to years 0–7 of 1,000 customers. Constant retention: Regular ${(FR.r * 100).toFixed(1)}%, High End ${(FHE.r * 100).toFixed(1)}% (renewals ÷ chances to renew). sBG: Regular α = ${FR.s.alpha.toFixed(3)}, β = ${FR.s.beta.toFixed(3)}; High End α = ${FHE.s.alpha.toFixed(3)}, β = ${FHE.s.beta.toFixed(3)}. Residual: about to make the sixth renewal, the coming renewal undiscounted (Fader and Hardie’s DERL, 2010).`,
    } },
    { p: `The constant rate’s error depends on whose value you want. For new customers it is modest (about 10% here), because the constant rate fitted to seven years already reflects some of the loyal survivors; with the year-1 rate of 63.1% instead it would be $${f2(VR.yr1New)}, far too low. For established customers it is large, because the constant rate ignores that they have already shown themselves to be the stayers. Fader and Hardie (2010) value whole customer bases with a constant retention rate and with the sBG and find the constant rate understates the base’s residual value in every case they examine, typically by roughly 25% to 50%.` },

    { h: 'Noncontractual value, kept simple' },
    { p: 'Where departures are never observed, value has to come from purchases. The approach in this lesson uses the cohort table directly: spend per joiner in each month since joining, times the margin, discounted, summed over the months observed, plus a projection of the months not yet seen. It needs a cohort old enough to show the shape of the decline, and it projects a pace that is itself an assumption.' },
    { p: `Test the projection the way any forecast is tested: fit it on early months and check it on later ones. Using only what was known on 31 October (months 2 to 7 for the March joiners), spend per joiner fell by a factor of ${qCal.toFixed(3)} a month; continuing that predicts $${f2(pred8)} for November and $${f2(pred9)} for December, against $${f2(MAR[8])} and $${f2(MAR[9])} actually spent. Two months is a short test, and the monthly ratios bounce around (from ${Math.min(...ratios).toFixed(2)} to ${Math.max(...ratios).toFixed(2)}) with the seasons and the cafés’ busy days. The pace matters: a factor of 0.80 instead of ${qDecay.toFixed(2)} makes the projected months worth $${f2(tail80)}, and 0.90 makes them $${f2(tail90)}.` },
    { callout: 'note', title: 'Models for noncontractual customers', html: 'The geometric projection treats the whole cohort as one decaying stream. Probability models built for this setting describe each customer as buying at their own rate while “alive” and dropping out unseen at some point, and estimate both from each customer’s recency and frequency. They are beyond this course; the cohort projection is a transparent first answer that any spreadsheet can reproduce.' },

    { h: 'Value by segment' },
    { p: `Customer value differs between groups, and comparing groups is often more useful than any single figure. Of the 1,664 members who joined from March to August, over their join month and the next four Harbourside’s 603 brought in $${f2(G.H.margin)} of margin each and Millbrook’s 1,061 $${f2(G.M.margin)}, although Millbrook’s members visited more often (${G.M.visits.toFixed(2)} visits against ${G.H.visits.toFixed(2)}): Harbourside’s tickets are larger ($${f2(G.H.aov)} a visit against $${f2(G.M.aov)}). Members with notifications on brought $${f2(G.on.margin)} and those with them off $${f2(G.off.margin)}; members who live or work within a mile $${f2(G.near.margin)} and the rest $${f2(G.far.margin)}.` },
    { callout: 'warn', title: 'A segment’s value is an association', html: 'Members chose notifications, and where they live; nobody assigned them. That members with notifications on are worth more says nothing about what switching a member’s notifications on would add: keener members may simply be the ones who turn them on. Only a randomised test (the last lesson in this module) measures what an action changes.' },

    { h: 'What CLV is for, and what it isn’t' },
    { list: [
      '<b>A ceiling on acquisition spending.</b> Winning a customer is worth at most their full lifetime value (timing A or B); the next lesson compares it with what winning one costs.',
      '<b>Priorities for retention.</b> Residual value says what is at stake if a group of existing customers leaves, and so how much keeping them could be worth.',
      '<b>Valuing a customer base.</b> The sum of residual values is what the existing customers are expected to bring in.',
      '<b>Not a person’s worth.</b> CLV is an average forecast for a kind of customer. It doesn’t say any one member will spend that much, and it is not a reason to treat people with low values badly.',
      '<b>Not a fact.</b> It rests on a margin, a retention or decay assumption, a discount rate, a timing and a horizon, each of which can be wrong. State them, and show how the answer moves when they change.',
    ] },
  ],

  formulas: [
    { id: 'm06-clv-sum', name: 'Lifetime value: the general sum (margins at the start of each period)',
      tex: String.raw`\text{CLV} = \sum_{t=0}^{H-1} \frac{m\,S(t)}{(1+d)^t}`,
      where: [[String.raw`\text{CLV}`, 'Expected present value of the customer’s margins', '$'], [String.raw`m`, 'Margin per period while the customer is active', '$ per period'], [String.raw`S(t)`, 'Probability the customer is still active t periods after joining; S(0) = 1', ''], [String.raw`d`, 'Discount rate per period', 'per period'], [String.raw`t`, 'Periods since joining', 'periods'], [String.raw`H`, 'Horizon: number of periods counted (may be infinite)', 'periods']],
      assumptions: 'The margin is the same in every active period; the first margin arrives now.',
      note: 'Constant retention: S(t) = rᵗ. The sBG: S(t) = B(α, β + t) ÷ B(α, β).' },
    { id: 'm06-clv-start', name: 'Lifetime value of a new customer under constant retention (first margin now)',
      tex: String.raw`\text{CLV} = \frac{m\,(1+d)}{1+d-r}`,
      where: [[String.raw`m`, 'Margin per period', '$ per period'], [String.raw`r`, 'Retention rate per period, the same for everyone and every period', ''], [String.raw`d`, 'Discount rate per period', 'per period']],
      assumptions: 'Infinite horizon; constant retention; margins at the start of each period, the first now.',
      note: 'Margins at the end of each period instead (M01’s convention) give m ÷ (1 + d − r).' },
    { id: 'm06-clv-residual', name: 'Residual lifetime value under constant retention',
      tex: String.raw`\text{RLV} = \frac{m\,r}{1+d-r}`,
      where: [[String.raw`\text{RLV}`, 'Expected present value of an existing customer’s margins after the current one', '$'], [String.raw`m`, 'Margin per period', '$ per period'], [String.raw`r`, 'Retention rate per period', ''], [String.raw`d`, 'Discount rate per period', 'per period']],
      assumptions: 'Infinite horizon; constant retention; the current period’s margin already received.',
      note: 'Under constant retention it is the same for every customer, whatever their tenure.' },
    { id: 'm06-clv-horizon', name: 'Constant-retention value over a finite horizon',
      tex: String.raw`\text{CLV}_H = \frac{m\,(1+d)}{1+d-r}\left[1 - \left(\frac{r}{1+d}\right)^{H}\right]`,
      where: [[String.raw`\text{CLV}_H`, 'Value of the first H periods’ margins', '$'], [String.raw`m`, 'Margin per period', '$ per period'], [String.raw`r`, 'Retention rate per period', ''], [String.raw`d`, 'Discount rate per period', 'per period'], [String.raw`H`, 'Number of periods counted', 'periods']],
      assumptions: 'Margins at the start of each period, the first now.' },
    { id: 'm06-sbg-del', name: 'Discounted expected lifetime under the sBG',
      tex: String.raw`\text{DEL} = \sum_{t=0}^{\infty} \frac{S(t)}{(1+d)^t}, \qquad S(t) = \frac{B(\alpha, \beta + t)}{B(\alpha, \beta)}, \qquad \text{CLV} = m \times \text{DEL}`,
      where: [[String.raw`\text{DEL}`, 'Discounted expected number of periods a new customer pays for', 'periods'], [String.raw`S(t)`, 'Share of a cohort still active after t renewals', ''], [String.raw`\alpha, \beta`, 'Parameters of the beta distribution of churn probabilities across customers', ''], [String.raw`B`, 'The beta function', ''], [String.raw`d`, 'Discount rate per period', 'per period'], [String.raw`m`, 'Margin per period', '$ per period'], [String.raw`\text{CLV}`, 'Lifetime value of a new customer', '$']],
      assumptions: 'Each customer’s churn probability is fixed; probabilities vary across customers as a beta distribution.',
      note: 'For an existing customer Fader and Hardie (2010) use the discounted expected residual lifetime (DERL), which conditions on the renewals already made.' },
    { id: 'm06-rate-convert', name: 'Converting a rate to another period',
      tex: String.raw`d_{\text{month}} = (1 + d_{\text{year}})^{1/12} - 1, \qquad r_{\text{year}} = r_{\text{month}}^{\,12}`,
      where: [[String.raw`d_{\text{month}}, d_{\text{year}}`, 'Discount rate per month and per year', ''], [String.raw`r_{\text{month}}, r_{\text{year}}`, 'Retention per month and per year', '']],
      assumptions: 'The rate is constant within the year.' },
  ],

  examples: [
    { level: 'simple', title: 'Three values for one customer', fictional: true,
      setup: 'Quillmore Alarm Monitoring (fictional) earns a margin of $120 a year on each monitoring contract. 75% of customers renew each year and Quillmore discounts at 8% a year. Find the value of a customer who signs today (first margin now), the value of an existing customer whose margin for this year has just been paid, and the value of the new customer counting only the first five years.',
      steps: [
        String.raw`New customer, first margin now (timing A): <m>120 \times 1.08 / (1.08 - 0.75) = 129.60 / 0.33 = 392.73</m> dollars.`,
        String.raw`Existing customer, this year already paid (timing C, residual): <m>120 \times 0.75 / 0.33 = 90 / 0.33 = 272.73</m> dollars. It is timing A’s value less this year’s $120, which the existing customer has already paid: <m>392.73 - 120 = 272.73</m>.`,
        String.raw`Five years only: <m>392.73 \times (1 - (0.75/1.08)^5) = 392.73 \times ${(q5 / qStart).toFixed(4)} = ${f2(q5)}</m> dollars.`,
      ],
      answer: `$392.73 for a new customer, $272.73 for an existing one, $${f2(q5)} for a new customer over five years.`,
      interpretation: 'The new customer is worth exactly one margin more than the existing one, because the existing customer’s margin for this year is already in the bank. The five-year figure keeps 84% of the value: with 75% retention and 8% discounting, distant years count for little. Which number Quillmore uses depends on the decision: the first for what a new contract is worth, the second for what losing a current customer costs.' },

    { level: 'challenging', title: 'What a single retention rate hides', fictional: true,
      setup: `Fader and Hardie (2007) publish the share of 1,000 “Regular” customers still subscribed after each of 12 years. Fitted to years 0–7, constant retention gives r = ${(FR.r * 100).toFixed(1)}% and the sBG gives α = ${FR.s.alpha.toFixed(3)}, β = ${FR.s.beta.toFixed(3)}. With a margin of $100 a year (fictional) and a 10% discount rate, value a new customer and a customer who has renewed five times, both ways, and say which to trust.`,
      steps: [
        String.raw`Constant retention, new customer (timing A): <m>100 \times 1.10/(1.10 - ${FR.r.toFixed(4)}) = ${f2(VR.constNew)}</m> dollars.`,
        `sBG, new customer: the discounted expected lifetime is Σ S(t) ÷ 1.10ᵗ = ${(VR.sbgNew / 100).toFixed(3)} years, so the value is $${f2(VR.sbgNew)}.`,
        String.raw`Constant retention, customer after five renewals (residual, about to renew): the same for every tenure, <m>100 \times ${FR.r.toFixed(4)}/(1.10 - ${FR.r.toFixed(4)}) = ${f2(VR.constOld)}</m> dollars.`,
        `sBG, the same customer: the retention rate in year 6 is (β + 5) ÷ (α + β + 5) = ${FR.s.r(6).toFixed(3)}, far above the cohort’s first-year 63.1%. The discounted expected residual lifetime is ${(VR.sbgOld / 100).toFixed(3)} years, so the value is $${f2(VR.sbgOld)}.`,
        `Check against the data the models didn’t see: the sBG fitted to years 0–7 predicts ${(FR.s.S(12) * 100).toFixed(1)}% still subscribed after 12 years, against 17.3% observed; constant retention predicts ${(FR.r ** 12 * 100).toFixed(1)}%.`,
      ],
      answer: `New customer: $${f2(VR.constNew)} (constant) against $${f2(VR.sbgNew)} (sBG). After five renewals: $${f2(VR.constOld)} against $${f2(VR.sbgOld)}, ${(VR.sbgOld / VR.constOld).toFixed(1)} times as much.`,
      interpretation: 'Trust the sBG: it fits the years it wasn’t fitted to, and constant retention doesn’t. For new customers the two disagree by about a tenth; for established customers the constant rate cuts their value by more than half, because it forgets that they have already shown they are stayers. A business that valued its customer base, or set retention budgets for long-standing customers, with one average rate would underinvest in exactly the customers most likely to stay.' },

    { level: 'applied', title: 'What is a new café member worth?', fictional: true,
      setup: `Ana wants a figure for the value of a new loyalty-app member to plan 2028. The 242 members who joined in March 2027 are the only cohort with ten months of history. The table shows their spend per joiner in each month since joining (month 0 is March). Use a 67% margin and a discount rate of 0.8% a month.`,
      table: { head: ['Month since joining', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], rows: [['Spend per joiner ($)', ...MAR.map(f2)]], align: ['l', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r'] },
      steps: [
        `Margin per joiner in each month: spend × 0.67, so $${f2(MAR[0] * MR)} in month 0 and $${f2(MAR[9] * MR)} in month 9. Undiscounted, the ten months total $${f2(histUndisc)}.`,
        `Discount each month k by 1.008ᵏ and add: $${f2(histDisc)} of margin per joiner in the first ten months, valued at the joining date.`,
        `Pace of decline: from month 4 to month 9 spend per joiner fell from $${f2(MAR[4])} to $${f2(MAR[9])}, a factor of (${f2(MAR[9])} ÷ ${f2(MAR[4])})^(1/5) = ${qDecay.toFixed(3)} a month.`,
        `Projection: continue that factor from month 10 on, with the same margin and discounting: Σ ${f2(MAR[9])} × ${qDecay.toFixed(3)}^(k − 9) × 0.67 ÷ 1.008ᵏ for k = 10, 11, … = $${f2(tail)}.`,
        `Check the method: fitted only to months 2–7, it predicted $${f2(pred8)} and $${f2(pred9)} for months 8 and 9; members actually spent $${f2(MAR[8])} and $${f2(MAR[9])}.`,
      ],
      answer: `About $${total.toFixed(0)} of margin per new member: $${f2(histDisc)} in the first ten months and $${f2(tail)} projected after them.`,
      interpretation: `Most of a member’s value comes early: the join month alone is ${(marMonth0Share * 100).toFixed(0)}% of the March joiners’ ten-month spend. So the figure is fairly robust to the projection (a decay of 0.80 or 0.90 instead of ${qDecay.toFixed(2)} moves it by a few dollars), but it rests on one cohort, joining in spring, at a time when both cafés were new. Ana should present it as “about $32, possibly $27 to $35”, and recompute it as later cohorts age.` },
  ],

  demo: [
    { widget: 'clv-regular', intro: 'Lifetime value for Fader and Hardie’s Regular customers with a margin of $100 a year. The constant-retention curve uses the retention slider; the sBG curve uses the fitted α and β and doesn’t move with it. Set retention to the year-1 rate, 63%, and see how far below the sBG it falls; then raise it until the two agree, and notice how high a single rate has to be to match a model in which customers differ. The acquisition cost line is for the next lesson.' },
    { widget: 'clv-members', intro: 'The value of a new café member: the March joiners’ ten observed months plus a projection. Change the monthly decay factor and see how much of the value depends on it; change the margin and the discount rate and see which moves the answer most.' },
  ],

  mistakes: [
    { title: 'Building value from revenue', html: 'A member who spends $40 is not worth $40: at the cafés about 33 cents of every dollar goes on goods and card fees. Revenue-based values overstate worth by the ratio of revenue to margin and justify spending too much to win customers. Use margin, and say which costs it takes off.' },
    { title: 'Quoting a CLV without its timing', html: 'With the same margin, retention and discount rate, Quillmore’s customer is worth $392.73, $363.64 or $272.73 depending on when the margins are counted. Draw the timeline and name the convention; never compare two figures built on different ones.' },
    { title: 'Using one average retention rate for everyone', html: 'Customers differ, so retention rises with tenure as the flighty leave. A constant rate understates value, slightly for new customers and heavily for established ones ($237 against $626 for Regular customers after five renewals). Fit a model that allows customers to differ, such as the sBG, and check it on later periods.' },
    { title: 'Treating a repeat-purchase rate as a retention rate', html: 'In a noncontractual business nobody is observed leaving. The 81.6% of members who came back at least once is not a retention rate, and putting it into r ÷ (1 + d − r) gives a number with no meaning. Use the cohort’s spend over time, or a model built for the setting.' },
    { title: 'Reading a segment’s value as the effect of a feature', html: 'Members with notifications on were worth more, but they chose the setting. The difference is an association; switching notifications on for others may add much less, or nothing. Test it.' },
    { title: 'Treating CLV as a fact about a person', html: 'It is a forecast for a kind of customer, with a range. Present it with its assumptions and the values plausible alternatives give, and update it as cohorts age.' },
  ],

  application: [
    { case: `Ana’s note to the café managers, January 2028: “What is a new app member worth? Our March 2027 joiners are the only group with ten months of history. Each brought in $${f2(histDisc)} of margin (after goods and card fees, valued at the date they joined) in those ten months, and if their spending keeps falling at its recent pace another $${f2(tail)} after that: about $${total.toFixed(0)} in all, probably between $27 and $35. Most of it comes in the first three months. Harbourside members are worth more than Millbrook’s ($${f2(G.H.margin)} against $${f2(G.M.margin)} in their first five months) because their tickets are bigger, though Millbrook members visit more often. Members with notifications on are worth more too, but they chose the setting, so that isn’t evidence that notifications add value. I’ll redo these figures each quarter as the later cohorts build up history.”` },
    { p: 'In practice lifetime value is a planning tool, not a valuation of people. Retailers, banks, telecoms companies and software firms use it to decide how much they can spend to win a customer through each channel, how much it is worth spending to keep different groups, and how to value the customer base when a business is bought or sold. The calculations that work are the transparent ones: the margin, the retention or decay assumption, the discount rate, the timing and the horizon written down, and the figure shown under alternatives.' },
    { p: 'The two failures are mirror images. Over-optimism comes from revenue instead of margin, retention rates from the best customers applied to all, or long horizons in a business whose products change quickly. Under-valuation comes from one average retention rate applied to customers who differ, which hides that the customers who have stayed are the ones most likely to keep staying. The first leads to overspending on acquisition; the second to under-investing in the loyal customers who carry the business.' },
    { p: 'For noncontractual businesses such as cafés, shops and restaurants, the honest starting point is a cohort’s history read along its row. It shows how much value comes early, which is where acquisition and onboarding decisions bite, and it gives a projection that can be checked month by month against what members actually do. The next lesson sets this value against the cost of winning a member.' },
  ],

  summary: [
    'Customer lifetime value is the expected present value of a customer’s margins; build it from margin (67% of café spend, after goods and card fees), not revenue.',
    'Historical value adds up the past; predictive value is a forecast, and its margin, period, retention or decay assumption, discount rate, timing and horizon must be stated.',
    'Under constant retention a new customer with the first margin now is worth m(1 + d) ÷ (1 + d − r), and an existing customer’s residual value is m r ÷ (1 + d − r): $392.73 and $272.73 for Quillmore’s fictional contracts. Fader and Hardie (2012) trace the textbook versions to these timing choices.',
    'A finite horizon of H periods multiplies the value by 1 − (r ÷ (1 + d))^H; rates must refer to the same period as the margin.',
    'When customers differ, retention rises with tenure and one average rate understates value, heavily for established customers (Regular customers after five renewals: $237 with a constant rate against $626 with the sBG).',
    'For noncontractual members, value comes from a cohort’s spend per joiner by month, projected forward and checked on later months: about $32 of margin per new café member.',
    'Value by segment (Harbourside against Millbrook, notifications on against off) describes groups; it is an association, not the effect of an action.',
  ],

  glossary: [
    { term: 'Residual lifetime value', def: 'The expected present value of the margins an existing customer will bring in from now on, excluding margins already received.' },
    { term: 'Historical customer value', def: 'The margin (or spend) a customer has already brought in over a stated window; a fact about the past, as opposed to the forecast that predictive lifetime value makes.' },
    { term: 'Discounted expected lifetime', def: 'The expected number of periods a customer will pay for, each discounted to today; multiplied by the margin per period it gives lifetime value. Abbreviated DEL.' },
  ],

  references: [
    { text: 'Fader, P. S. and Hardie, B. G. S. (2012). “Reconciling and Clarifying CLV Formulas.” Note, brucehardie.com.', url: 'https://www.brucehardie.com/notes/024/reconciling_clv_formulas.pdf', checked: '2026-11-01' },
    { text: 'Fader, P. S. and Hardie, B. G. S. (2007). “How to Project Customer Retention.” <i>Journal of Interactive Marketing</i>, 21(1), 76–90.', url: 'https://faculty.wharton.upenn.edu/wp-content/uploads/2012/04/Fader_hardie_jim_07.pdf', checked: '2026-11-01' },
    { text: 'Fader, P. S. and Hardie, B. G. S. (2010). “Customer-Base Valuation in a Contractual Setting: The Perils of Ignoring Heterogeneity.” <i>Marketing Science</i>, 29(1), 85–93.', url: 'https://www.brucehardie.com/papers/022/fader_hardie_mksc_10.pdf', checked: '2026-11-01' },
    { text: 'Microsoft Support. “AVERAGEIFS function”.', url: 'https://support.microsoft.com/en-us/excel/functions/averageifs-function', checked: '2026-11-01' },
  ],

  checks: [
    // margin
    { what: 'Card fees 2%', value: CARD * 100, shown: 2, tol: 1e-9 },
    { what: 'Cost of goods 31%', value: F03.cafes.cogsShare * 100, shown: 31, tol: 1e-9 },
    { what: 'Card fees $4,720', value: F03.cafeCardFees, shown: 4720 },
    { what: 'Café sales $236,000', value: F03.cafes.sales, shown: 236000 },
    { what: 'Margin 67%', value: MR * 100, shown: 67, tol: 1e-9 },
    { what: '67 cents', value: MR * 100, shown: 67, tol: 1e-9 },
    { what: '33 cents to goods and fees', value: (1 - MR) * 100, shown: 33, tol: 1e-9 },
    { what: 'Members 2,584', value: MEMBER_LIST.length, shown: 2584 },
    // historical
    { what: 'March joiners', value: nMar, shown: 242 },
    { what: 'March spend per joiner to 31 Dec', value: marSpend, shown: Number(f2(marSpend)) },
    { what: 'March margin per joiner undiscounted', value: histUndisc, shown: Number(f2(histUndisc)) },
    { what: 'A member who spends $40 (round figure for the March joiners)', value: marSpend, shown: 40, tol: 0.5 },
    // Quillmore
    { what: 'Quillmore timing A', value: qStart, shown: 392.73 },
    { what: 'Quillmore timing C', value: qEnd, shown: 272.73 },
    { what: 'Quillmore timing B', value: qM01, shown: 363.64 },
    { what: '129.60', value: 120 * 1.08, shown: 129.6 },
    { what: '0.33', value: 1.08 - 0.75, shown: 0.33, tol: 1e-9 },
    { what: '90', value: 120 * 0.75, shown: 90 },
    { what: 'A − 120 = C', value: qStart - 120, shown: 272.73 },
    { what: 'r/(1+d)', value: 0.75 / 1.08, shown: 0.694, tol: 0.0005 },
    { what: 'Five-year share', value: q5 / qStart, shown: Number((q5 / qStart).toFixed(3)), tol: 0.0005 },
    { what: 'Five-year share (4 dp)', value: 1 - (0.75 / 1.08) ** 5, shown: Number((q5 / qStart).toFixed(4)), tol: 0.00005 },
    { what: 'Five years keep 84%', value: q5 / qStart * 100, shown: 84, tol: 0.5 },
    { what: 'Five-year value', value: q5, shown: Number(f2(q5)) },
    { what: 'Ten-year value', value: q10, shown: Number(f2(q10)) },
    { what: 'Quillmore at 80%', value: q80, shown: Number(f2(q80)) },
    { what: 'Quillmore at 70%', value: q70, shown: Number(f2(q70)) },
    { what: 'Up %', value: (q80 / qStart - 1) * 100, shown: Number(((q80 / qStart - 1) * 100).toFixed(0)), tol: 0.5 },
    { what: 'Down %', value: (1 - q70 / qStart) * 100, shown: Number(((1 - q70 / qStart) * 100).toFixed(0)), tol: 0.5 },
    // rates
    { what: 'Monthly rate from 10% a year', value: (1.1 ** (1 / 12) - 1) * 100, shown: 0.797, tol: 0.0005 },
    { what: '0.8% a month (rounded)', value: (1.1 ** (1 / 12) - 1) * 100, shown: 0.8, tol: 0.005 },
    { what: '0.95^12', value: 0.95 ** 12 * 100, shown: Number((0.95 ** 12 * 100).toFixed(1)), tol: 0.05 },
    { what: '1 − 12 × 0.05 = 40%', value: (1 - 12 * 0.05) * 100, shown: 40, tol: 1e-9 },
    // F&H
    { what: 'Regular year-1 renewal 63.1%', value: REG[1], shown: 63.1, tol: 1e-9 },
    { what: 'Regular year-2 retention 74.2%', value: REG[2] / REG[1] * 100, shown: 74.2, tol: 0.05 },
    { what: 'Regular year-7 retention 92.0%', value: REG[7] / REG[6] * 100, shown: 92.0, tol: 0.05 },
    { what: 'Regular year-12 survival 17.3%', value: REG[12], shown: 17.3, tol: 1e-9 },
    { what: 'Regular constant r', value: FR.r * 100, shown: Number((FR.r * 100).toFixed(1)), tol: 0.05 },
    { what: 'Regular alpha (F&H 0.704)', value: FR.s.alpha, shown: 0.704, tol: 0.0005 },
    { what: 'Regular beta (F&H 1.182)', value: FR.s.beta, shown: 1.182, tol: 0.0005 },
    { what: 'High End alpha (F&H 0.668)', value: FHE.s.alpha, shown: 0.668, tol: 0.0005 },
    { what: 'High End beta (F&H 3.806)', value: FHE.s.beta, shown: 3.806, tol: 0.0005 },
    { what: 'High End constant r', value: FHE.r * 100, shown: Number((FHE.r * 100).toFixed(1)), tol: 0.05 },
    { what: 'Regular new, constant', value: VR.constNew, shown: Number(f2(VR.constNew)) },
    { what: 'Regular new, sBG', value: VR.sbgNew, shown: Number(f2(VR.sbgNew)) },
    { what: 'Regular DEL', value: VR.sbgNew / 100, shown: Number((VR.sbgNew / 100).toFixed(3)), tol: 0.0005 },
    { what: 'Regular new, year-1 rate', value: VR.yr1New, shown: Number(f2(VR.yr1New)) },
    { what: 'Regular old, constant', value: VR.constOld, shown: Number(f2(VR.constOld)) },
    { what: 'Regular old, constant ≈ $237', value: VR.constOld, shown: 237, tol: 0.5 },
    { what: 'Regular old, sBG', value: VR.sbgOld, shown: Number(f2(VR.sbgOld)) },
    { what: 'Regular old, sBG ≈ $626', value: VR.sbgOld, shown: 626, tol: 0.5 },
    { what: 'Regular DERL', value: VR.sbgOld / 100, shown: Number((VR.sbgOld / 100).toFixed(3)), tol: 0.0005 },
    { what: 'Regular year-6 sBG retention', value: FR.s.r(6), shown: Number(FR.s.r(6).toFixed(3)), tol: 0.0005 },
    { what: 'Regular sBG S(12)', value: FR.s.S(12) * 100, shown: Number((FR.s.S(12) * 100).toFixed(1)), tol: 0.05 },
    { what: 'Regular constant S(12)', value: FR.r ** 12 * 100, shown: Number((FR.r ** 12 * 100).toFixed(1)), tol: 0.05 },
    { what: 'Old ratio (1 dp)', value: VR.sbgOld / VR.constOld, shown: Number((VR.sbgOld / VR.constOld).toFixed(1)), tol: 0.05 },
    { what: 'Old more than double (constant cuts value by more than half)', value: Number(VR.sbgOld > 2 * VR.constOld), shown: 1 },
    { what: 'New gap about a tenth', value: (VR.sbgNew / VR.constNew - 1) * 100, shown: 10, tol: 0.6 },
    { what: 'Regular new ratio', value: VR.sbgNew / VR.constNew, shown: Number((VR.sbgNew / VR.constNew).toFixed(2)), tol: 0.005 },
    { what: 'Regular old ratio', value: VR.sbgOld / VR.constOld, shown: Number((VR.sbgOld / VR.constOld).toFixed(2)), tol: 0.005 },
    { what: 'High End new, constant', value: VH.constNew, shown: Number(f2(VH.constNew)) },
    { what: 'High End new, sBG', value: VH.sbgNew, shown: Number(f2(VH.sbgNew)) },
    { what: 'High End old, constant', value: VH.constOld, shown: Number(f2(VH.constOld)) },
    { what: 'High End old, sBG', value: VH.sbgOld, shown: Number(f2(VH.sbgOld)) },
    { what: 'High End new ratio', value: VH.sbgNew / VH.constNew, shown: Number((VH.sbgNew / VH.constNew).toFixed(2)), tol: 0.005 },
    { what: 'High End old ratio', value: VH.sbgOld / VH.constOld, shown: Number((VH.sbgOld / VH.constOld).toFixed(2)), tol: 0.005 },
    { what: 'sBG beats constant out of sample (closer to 17.3%)', value: Number(Math.abs(FR.s.S(12) * 100 - 17.3) < Math.abs(FR.r ** 12 * 100 - 17.3)), shown: 1 },
    { what: 'sBG retention rises', value: Number([1, 2, 3, 4, 5, 6, 7, 8].every((t) => FR.s.r(t + 1) > FR.s.r(t))), shown: 1 },
    { what: 'Every customer base undervalued by constant (both groups, new and old)', value: Number(VR.sbgNew > VR.constNew && VH.sbgNew > VH.constNew && VR.sbgOld > VR.constOld && VH.sbgOld > VH.constOld), shown: 1 },
    { what: 'F&H 2010: 25%', value: 25, shown: 25 },
    { what: 'F&H 2010: 50%', value: 50, shown: 50 },
    // noncontractual
    { what: 'Repeat rate', value: repeatRate * 100, shown: Number((repeatRate * 100).toFixed(1)), tol: 0.05 },
    { what: 'Repeat rate 81.6%', value: repeatRate * 100, shown: 81.6, tol: 0.05 },
    { what: 'March month 0', value: MAR[0], shown: Number(f2(MAR[0])) },
    { what: 'March month 1', value: MAR[1], shown: Number(f2(MAR[1])) },
    ...MAR.map((v, k) => ({ what: `March month ${k} (table)`, value: v, shown: Number(f2(v)) })),
    { what: 'March month 9', value: MAR[9], shown: Number(f2(MAR[9])) },
    { what: 'March month 4', value: MAR[4], shown: Number(f2(MAR[4])) },
    { what: 'Spend per joiner falls every month', value: Number(ratios.every((x) => x < 1)), shown: 1 },
    { what: 'December active share', value: marRet9 * 100, shown: Number((marRet9 * 100).toFixed(1)), tol: 0.05 },
    { what: 'Decay 4→9', value: qDecay, shown: Number(qDecay.toFixed(3)), tol: 0.0005 },
    { what: 'Decay 4→9 (2 dp)', value: qDecay, shown: Number(qDecay.toFixed(2)), tol: 0.005 },
    { what: 'Historical discounted', value: histDisc, shown: Number(f2(histDisc)) },
    { what: 'Tail', value: tail, shown: Number(f2(tail)) },
    { what: 'Total ≈', value: total, shown: Number(total.toFixed(0)), tol: 0.5 },
    { what: 'Summary: about $32', value: total, shown: 32, tol: 0.5 },
    { what: 'About $32, $27 to $35 brackets the total', value: Number(total > 27 && total < 35), shown: 1 },
    { what: 'Range $27–$35 covers decay 0.80–0.90', value: Number(histDisc + tail80 > 27 && histDisc + tail90 < 35), shown: 1 },
    { what: 'Decay 0.80 and 0.90 move the value by a few dollars', value: Number(Math.abs(tail90 - tail) < 6 && Math.abs(tail - tail80) < 6), shown: 1 },
    { what: 'Month 0 margin', value: MAR[0] * MR, shown: Number(f2(MAR[0] * MR)) },
    { what: 'Month 9 margin', value: MAR[9] * MR, shown: Number(f2(MAR[9] * MR)) },
    { what: 'Decay calibration', value: qCal, shown: Number(qCal.toFixed(3)), tol: 0.0005 },
    { what: 'Pred 8', value: pred8, shown: Number(f2(pred8)) },
    { what: 'Pred 9', value: pred9, shown: Number(f2(pred9)) },
    { what: 'Actual 8', value: MAR[8], shown: Number(f2(MAR[8])) },
    { what: 'Prediction within 5% of actual', value: Number(Math.abs(pred8 / MAR[8] - 1) < 0.05 && Math.abs(pred9 / MAR[9] - 1) < 0.05), shown: 1 },
    { what: 'Min monthly ratio', value: Math.min(...ratios), shown: Number(Math.min(...ratios).toFixed(2)), tol: 0.005 },
    { what: 'Max monthly ratio', value: Math.max(...ratios), shown: Number(Math.max(...ratios).toFixed(2)), tol: 0.005 },
    { what: 'Tail at 0.80', value: tail80, shown: Number(f2(tail80)) },
    { what: 'Tail at 0.90', value: tail90, shown: Number(f2(tail90)) },
    { what: 'Month 0 share', value: marMonth0Share * 100, shown: Number((marMonth0Share * 100).toFixed(0)), tol: 0.5 },
    { what: 'Most value in first three months (months 0–2 over half of ten-month spend)', value: Number(MAR.slice(0, 3).reduce((s, v) => s + v, 0) > marSpend / 2), shown: 1 },
    // segments
    { what: 'Joined Mar–Aug', value: G.all.n, shown: 1664 },
    { what: 'Harbourside n', value: G.H.n, shown: 603 },
    { what: 'Millbrook n', value: G.M.n, shown: 1061 },
    { what: 'Harbourside margin', value: G.H.margin, shown: Number(f2(G.H.margin)) },
    { what: 'Millbrook margin', value: G.M.margin, shown: Number(f2(G.M.margin)) },
    { what: 'Harbourside visits', value: G.H.visits, shown: Number(G.H.visits.toFixed(2)) },
    { what: 'Millbrook visits', value: G.M.visits, shown: Number(G.M.visits.toFixed(2)) },
    { what: 'Harbourside aov', value: G.H.aov, shown: Number(f2(G.H.aov)) },
    { what: 'Millbrook aov', value: G.M.aov, shown: Number(f2(G.M.aov)) },
    { what: 'Harbourside worth more, Millbrook visits more', value: Number(G.H.margin > G.M.margin && G.M.visits > G.H.visits), shown: 1 },
    { what: 'Notifications on margin', value: G.on.margin, shown: Number(f2(G.on.margin)) },
    { what: 'Notifications off margin', value: G.off.margin, shown: Number(f2(G.off.margin)) },
    { what: 'Near margin', value: G.near.margin, shown: Number(f2(G.near.margin)) },
    { what: 'Far margin', value: G.far.margin, shown: Number(f2(G.far.margin)) },
    { what: 'Notifications on worth more', value: Number(G.on.margin > G.off.margin), shown: 1 },
  ],
};
