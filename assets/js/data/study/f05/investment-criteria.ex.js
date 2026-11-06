// investment-criteria.ex.js — F05 · Investment criteria: widgets, practice and the knowledge check (answer keys live here).
// Every number is recomputed by `check` (see ../AUTHORING.md). The Cold Brew widget rebuilds coldBrewFlows() from
// COLD_BREW and TAX in case.js (investment-criteria.js checks that the two agree at the defaults); the quarry and every
// other business here are fictional.
import { COLD_BREW as C, TAX, WORKING_RATE, coldBrewFlows } from './case.js?v=28';
import { depreciation } from '../../../core/corpfin.js?v=28';
import { npv, irr, irrAll, mirr, payback, profitabilityIndex } from '../../../core/invest.js?v=28';

const R = WORKING_RATE * 100;
const money = (v) => `${v < 0 ? '−' : ''}$${Math.round(Math.abs(v)).toLocaleString('en-US')}`;
const pct = (v, d = 1) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}%`;
const M = '$#,##0';
const cb = coldBrewFlows().fcf.map((x) => Math.round(x));      // whole dollars, as the lesson’s table prints them

export const widgets = {
  'cold-brew-criteria': {
    type: 'capbudget',
    title: 'Cold Brew: every criterion at once',
    inputs: [
      { id: 'rate', label: 'Discount rate', min: 0, max: 40, step: 0.5, value: R, fmt: 'pct' },
      { id: 'volume', label: 'Cans sold, as a share of Ana’s forecast', min: 50, max: 150, step: 5, value: 100, fmt: 'pct' },
      { id: 'price', label: 'Shelf price a can (grocers keep 38%)', min: 2.49, max: 4.49, step: 0.05, value: C.shelfPrice, fmt: 'money' },
      { id: 'cogs', label: 'Cost a can (liquid, can, co-packer, freight)', min: 0.5, max: 1.2, step: 0.01, value: C.cogs, fmt: 'money' },
    ],
    model: (v) => {
      const cans = C.cans.map((n) => n * v.volume / 100), net = v.price * (1 - C.tradeMargin);
      return {
        capex: C.equipment, years: C.years, revenue: cans.map((n) => n * net), variable: cans.map((n) => n * v.cogs),
        fixed: C.promotion.map((p) => p + C.listing + C.brandManager), dep: depreciation(C.equipment, { method: 5 }).slice(0, C.years),
        tax: TAX, nwcShare: C.nwcShare, salvage: C.salvage, upfront: C.launch, side: Array(C.years).fill(-C.cannibalised * (1 - TAX)),
      };
    },
    rate: 'rate',
    show: ['metrics', 'profile'],
    profileMax: 0.4,
    note: 'At the defaults these are the case’s figures: NPV about $25,737 at 11%, IRR 27.1%. The MIRR uses the chosen rate as both the finance and the reinvestment rate; the PI divides by the year-0 outlay.',
  },
  'quarry-irr': {
    type: 'formula',
    title: 'One IRR, two or none: the quarry',
    intro: 'A fictional quarry: −$40,000 now and +$100,000 in a year, then a restoration cost at the end of year 2. The chart is the NPV profile.',
    inputs: [
      { id: 'restore', label: 'Restoration cost in year 2', min: 0, max: 80000, step: 400, value: 62400, fmt: 'money' },
      { id: 'rate', label: 'Opportunity cost of capital', min: 0, max: 60, step: 0.5, value: R, fmt: 'pct' },
    ],
    compute: (v) => {
      const f = [-40000, 100000, -v.restore], r = v.rate / 100, roots = irrAll(f), value = npv(r, f);
      const xs = Array.from({ length: 41 }, (_, i) => i * 2);
      const irrText = roots.length === 0 ? 'none: the NPV never reaches zero' : roots.map((x) => pct(x * 100)).join(' and ');
      let note;
      if (roots.length === 0) note = `With a restoration cost above $62,500 the NPV is negative at every rate, so there is no IRR. At ${pct(v.rate)} the NPV is ${money(value)}: reject.`;
      else if (roots.length === 1) note = `One IRR (${irrText}). The NPV at ${pct(v.rate)} is ${money(value)}, so ${value > 0 ? 'accept' : 'reject'}; with one sign change, the IRR rule agrees.`;
      else note = `Two IRRs (${irrText}): the cash flows change sign twice. The NPV is positive only between them; at ${pct(v.rate)} it is ${money(value)}, so ${value > 0 ? 'accept' : 'reject'}, whatever either IRR says.`;
      return {
        headline: { label: `NPV at ${pct(v.rate)}`, value: money(value) },
        rows: [['IRR(s)', irrText], ['MIRR at the same rate', Number.isFinite(mirr(f, r, r)) ? pct(mirr(f, r, r) * 100) : '—'], ['Sign changes', v.restore > 0 ? '2' : '1']],
        note,
        chart: { kind: 'line', x: { label: 'Discount rate (%)', values: xs }, series: [{ name: 'NPV', values: xs.map((x) => Math.round(npv(x / 100, f))) }, { name: 'Zero', values: xs.map(() => 0) }], y: { label: 'NPV ($)' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f05-crit-g1', type: 'steps', kind: 'numerical',
    prompt: 'A fictional print shop can buy a large-format printer for $12,000. It expects after-tax cash flows of $4,000, $5,000, $6,000 and $3,000 at the end of years 1 to 4. Its opportunity cost of capital is 10%.',
    solution: 'Cumulative cash: −8,000, −3,000, +3,000, so payback = 2 + 3,000 ÷ 6,000 = 2.5 years. Discounted: PVs 3,636.36, 4,132.23, 4,507.89, 2,049.04; cumulative −8,363.64, −4,231.40, +276.48, so discounted payback = 2 + 4,231.40 ÷ 4,507.89 ≈ 2.94 years. Neither looks at year 4 once the cutoff has passed, and undiscounted payback treats year-3 dollars as worth as much as today’s.',
    steps: [
      { id: 'f05-crit-g1-s1', type: 'num', prompt: 'What is the payback period, in years? Assume cash arrives evenly within each year. Give two decimal places.',
        answer: 2.5, check: () => payback([-12000, 4000, 5000, 6000, 3000]), unit: 'years', places: 2, tol: 0.005,
        hints: ['Add up the cash flows year by year until the total turns positive.', 'After year 2 the cumulative total is −$3,000; year 3 brings $6,000.'],
        wrong: [{ value: 3, say: 'Payback falls during year 3, not at its end: 2 + 3,000 ÷ 6,000.' }] },
      { id: 'f05-crit-g1-s2', type: 'num', prompt: 'What is the discounted payback period at 10%, in years? Give two decimal places.',
        answer: 2.94, check: () => payback([-12000, 4000, 5000, 6000, 3000], 0.10), unit: 'years', places: 2, tol: 0.005,
        hints: ['Discount each year’s cash flow first: 4,000 ÷ 1.1, 5,000 ÷ 1.1², …', 'Cumulative PV after year 2 is −$4,231.40; year 3’s PV is $4,507.89.'],
        wrong: [{ value: 2.5, say: 'That is the undiscounted payback. Discount each cash flow before adding.' }] },
      { id: 'f05-crit-g1-s3', type: 'mc', prompt: 'Which statement about these two payback measures is true?',
        options: [
          'Both ignore the $3,000 that arrives in year 4',
          'Discounted payback includes every cash flow, so it equals the NPV rule',
          'Undiscounted payback is the more cautious of the two, because it is shorter',
          'Both measure the value the printer adds, in years',
        ],
        answer: 0,
        hints: ['What happens to cash flows after the payback date?'],
        feedback: {
          1: 'Discounted payback still stops counting at the payback date, so later cash flows never affect it.',
          2: 'A shorter payback is less cautious: it counts future dollars at full value and so recovers the outlay sooner on paper.',
          3: 'Payback measures time, not value. A project can pay back quickly and add little, or slowly and add a lot.',
        } },
    ],
  },
  {
    id: 'f05-crit-g2', type: 'formula', kind: 'applied',
    prompt: 'B4:B9 hold Cold Brew’s free cash flows for years 0 to 5, rounded to the dollar. In B11, write a formula for its internal rate of return.',
    sheet: {
      cells: { A1: 'Discount rate', B1: WORKING_RATE, A3: 'Year', B3: 'Free cash flow', A4: 0, A5: 1, A6: 2, A7: 3, A8: 4, A9: 5, B4: cb[0], B5: cb[1], B6: cb[2], B7: cb[3], B8: cb[4], B9: cb[5], A11: 'IRR' },
      fixed: ['A4:A9'], vary: { B9: [45000, 52000] },
    },
    cell: 'B11', view: 'A1:B11', widths: { A: 16, B: 15 }, formats: { B1: '0.0%', B4: M, B5: M, B6: M, B7: M, B8: M, B9: M, B11: '0.0%' },
    answer: '=IRR(B4:B9)',
    alt: ['=IRR(B4:B9,B1)', '=IRR(B4:B9,0.1)'],
    require: ['IRR'],
    wrong: [
      { formula: '=IRR(B5:B9)', say: 'Unlike NPV(), IRR() needs the whole stream including year 0. Without the outlay the flows are not those of the project.' },
      { formula: '=B4+NPV(B1,B5:B9)', say: 'That is the NPV at the rate in B1, a dollar amount. The IRR is the rate at which that NPV would be zero: IRR(B4:B9).' },
    ],
    hints: ['IRR() takes the cash flows in time order, year 0 first.', 'There is one sign change here (−, −, +, +, +, +), so one IRR: =IRR(B4:B9).'],
    solution: '<x>=IRR(B4:B9)</x> gives about 27.1%. IRR() includes the year-0 outlay in its range, unlike NPV(). With a single sign change there is one IRR, so the default guess is fine.',
  },
  {
    id: 'f05-crit-g3', type: 'steps', kind: 'applied',
    prompt: 'A fictional events company is offered a $10,000 deposit today for a festival it will deliver next year at a cost of $11,500. Its opportunity cost of capital is 11%.',
    solution: 'The flows are +10,000, −11,500: IRR = 11,500 ÷ 10,000 − 1 = 15%. NPV at 11% = 10,000 − 11,500 ÷ 1.11 ≈ −$360. This is like borrowing at 15% when money costs 11% elsewhere, so the deal loses value. For borrowing-type flows, accept only if the IRR is below the opportunity cost.',
    steps: [
      { id: 'f05-crit-g3-s1', type: 'num', prompt: 'What is the IRR of these cash flows? Give a percentage.',
        answer: 15, check: () => irr([10000, -11500]) * 100, unit: '%', places: 1, tol: 0.05,
        hints: ['Find r with 10,000 = 11,500 ÷ (1 + r).'],
        wrong: [{ value: -15, say: 'The IRR is the r in 10,000 − 11,500 ÷ (1 + r) = 0, which is +15%.' }] },
      { id: 'f05-crit-g3-s2', type: 'num', prompt: 'What is the NPV at 11%? Give whole dollars, with a minus sign if negative.',
        answer: -360, check: () => npv(0.11, [10000, -11500]), unit: '$', places: 0, tol: 1,
        hints: ['10,000 now, minus 11,500 discounted one year at 11%.'],
        wrong: [{ value: 360, say: 'Check the sign: the $11,500 paid next year is worth $10,360 today, more than the deposit.' }] },
      { id: 'f05-crit-g3-s3', type: 'mc', prompt: 'Should the company take the deal?',
        options: [
          'No: it amounts to borrowing at 15% when money costs 11% elsewhere',
          'Yes: its IRR of 15% is above the 11% opportunity cost of capital',
          'Yes: it receives cash before it has to spend any, which is always attractive',
          'It cannot be decided, because the IRR rule fails for these flows',
        ],
        answer: 0,
        hints: ['Which way does the cash flow: in first, or out first?'],
        feedback: {
          1: 'For borrowing-type flows (cash in first) the IRR is a cost, so a higher IRR is worse. The rule reverses: accept if IRR < r.',
          2: 'Receiving cash first is attractive only if the later outflow is not too large; here it costs 15% a year in effect.',
          3: 'The IRR rule needs care, but the NPV decides without difficulty: −$360, so no.',
        } },
    ],
  },
  {
    id: 'f05-crit-g4', type: 'num', kind: 'numerical',
    prompt: 'A fictional project costs $10,000 today and returns $3,000, $4,000 and $6,000 at the end of years 1 to 3. Find its MIRR with both the finance rate and the reinvestment rate at 10%. Give a percentage to two decimal places.',
    answer: 11.95, check: () => mirr([-10000, 3000, 4000, 6000], 0.10, 0.10) * 100, unit: '%', places: 2, tol: 0.01,
    hints: ['Compound each inflow to year 3 at 10%: 3,000 × 1.1², 4,000 × 1.1, 6,000.', 'MIRR = (future value of inflows ÷ 10,000)^(1/3) − 1.'],
    wrong: [
      { value: 12.71, say: 'That is the IRR. The MIRR compounds the inflows at 10%, not at the IRR, which gives a lower rate.' },
      { value: 13.3, say: 'That spreads the total gain over three years without compounding. Take the cube root of the growth factor.' },
    ],
    solution: 'Future value of inflows at year 3 = 3,000 × 1.21 + 4,000 × 1.1 + 6,000 = 3,630 + 4,400 + 6,000 = $14,030. MIRR = (14,030 ÷ 10,000)^(1/3) − 1 ≈ 11.95%. Above 10%, so the NPV at 10% is positive.',
  },
];

export const independent = [
  {
    id: 'f05-crit-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional laboratory can buy a $50,000 analyser that brings in $15,000 a year after tax for five years. At 12%, what is its profitability index? Give three decimal places.',
    answer: 1.081, check: () => profitabilityIndex(0.12, [-50000, 15000, 15000, 15000, 15000, 15000]), unit: '', places: 3, tol: 0.0015,
    wrong: [
      { value: 1.5, say: 'That divides the undiscounted inflows ($75,000) by the outlay. Discount them at 12% first.' },
      { value: 0.081, say: 'That is NPV ÷ outlay. The PI is PV of the inflows ÷ outlay, which is 1 more.' },
    ],
    solution: 'PV of inflows = 15,000 × annuity factor (12%, 5) = 15,000 × 3.604776 ≈ $54,072. PI = 54,072 ÷ 50,000 ≈ 1.081. Above 1, so the NPV (about $4,072) is positive.',
  },
  {
    id: 'f05-crit-i2', type: 'mc', kind: 'applied',
    prompt: 'A fictional brewery can use one site for one of two projects. Project P costs $5,000 and returns $8,000 in one year; project Q costs $60,000 and returns $75,000 in one year. Its opportunity cost of capital is 10%. Which should it choose, and why?',
    options: [
      'P, because its IRR (60%) is much higher than Q’s (25%)',
      'Q, because its NPV ($8,182) is higher than P’s ($2,273)',
      'P, because it needs less capital and so is the less risky choice',
      'Either, since both IRRs exceed the 10% opportunity cost of capital',
    ],
    answer: 1,
    feedback: {
      0: 'A higher rate of return on a much smaller sum can add less value. Between exclusive projects, compare NPVs.',
      2: 'Nothing in the question says P is less risky; both are discounted at the same 10%. Size alone is not risk.',
      3: 'Both are acceptable on their own, but only one can be chosen, and Q adds about $5,909 more.',
    },
    solution: 'NPV(P) = 8,000 ÷ 1.1 − 5,000 ≈ $2,273; NPV(Q) = 75,000 ÷ 1.1 − 60,000 ≈ $8,182. Q adds more value despite its lower IRR, a scale effect. Choose Q.',
  },
  {
    id: 'f05-crit-i3', type: 'formula', kind: 'applied',
    prompt: 'A fictional ski-hire shop’s project has the cash flows in B5:B10 (years 0 to 5; year 3 includes a mid-life refit). Its finance rate is in B1 and the rate at which it can reinvest cash is in B2. In B12, write a formula for the project’s MIRR.',
    sheet: {
      cells: { A1: 'Finance rate', B1: 0.09, A2: 'Reinvestment rate', B2: 0.07, A4: 'Year', B4: 'Cash flow', A5: 0, A6: 1, A7: 2, A8: 3, A9: 4, A10: 5, B5: -30000, B6: 11000, B7: 12000, B8: -6000, B9: 13000, B10: 14000, A12: 'MIRR' },
      fixed: ['A5:A10'],
    },
    cell: 'B12', view: 'A1:B12', widths: { A: 18, B: 13 }, formats: { B1: '0.0%', B2: '0.0%', B5: M, B6: M, B7: M, B8: M, B9: M, B10: M, B12: '0.00%' },
    answer: '=MIRR(B5:B10,B1,B2)',
    require: ['MIRR'],
    wrong: [
      { formula: '=MIRR(B5:B10,B2,B1)', say: 'The rates are the wrong way round: MIRR(values, finance_rate, reinvest_rate). The finance rate in B1 comes first.' },
      { formula: '=IRR(B5:B10)', say: 'That is the IRR, whose cash flows here change sign three times (−, +, +, −, +, +), so it need not be unique, and it says nothing explicit about reinvestment. The MIRR takes the two rates.' },
      { formula: '=MIRR(B6:B10,B1,B2)', say: 'The year-0 outlay must be in the range: MIRR, like IRR, takes the whole stream.' },
    ],
    solution: '<x>=MIRR(B5:B10,B1,B2)</x> ≈ 10.49%. It discounts the outflows (years 0 and 3) at 9% and compounds the inflows to year 5 at 7%. Because the stream changes sign three times, the MIRR’s single answer is easier to use than IRR.',
  },
  {
    id: 'f05-crit-i4', type: 'classify', kind: 'conceptual',
    prompt: 'For each pattern of cash-flow signs (year 0 first), what does the IRR rule need?',
    items: [
      'Year 0 negative, then only positives',
      'Year 0 positive, then only negatives',
      'Negative, then positive, then a large negative at the end',
      'Two negatives (years 0 and 1), then only positives',
    ],
    categories: ['The usual rule works: accept if IRR > r', 'The rule reverses: accept if IRR < r', 'There may be several IRRs or none: use the NPV'],
    answer: [0, 1, 2, 0],
    feedback: {
      0: 'One sign change from − to +: a conventional project with one IRR.',
      1: 'Cash in first, out later: a borrowing-type project, so a high IRR is a high cost.',
      2: 'Two sign changes, as in the quarry: there can be two IRRs, or none.',
      3: 'Still one sign change (−, −, +, +…), like Cold Brew, so one IRR and the usual rule.',
    },
    solution: 'Count sign changes. One change from outflows to inflows: usual rule. One change from inflows to outflows: reversed rule. Two or more changes: the IRR may not be unique or may not exist, so rely on the NPV (or the MIRR at r).',
  },
  {
    id: 'f05-crit-i5', type: 'num', kind: 'numerical',
    prompt: 'A fictional gym can buy rowing machines for $30,000 that bring in $9,000 a year after tax for five years. What is the discounted payback period at 12%? Give two decimal places.',
    answer: 4.52, check: () => payback([-30000, 9000, 9000, 9000, 9000, 9000], 0.12), unit: 'years', places: 2, tol: 0.005,
    wrong: [
      { value: 3.33, say: 'That is the undiscounted payback (30,000 ÷ 9,000). Discount each year’s cash flow at 12% first.' },
      { value: 5, say: 'Payback happens during year 5, not at its end: interpolate within the year.' },
    ],
    solution: 'PVs at 12%: 8,035.71, 7,174.74, 6,406.02, 5,719.66, 5,106.84. Cumulative after year 4: −30,000 + 27,336.14 = −2,663.86. Year 5 adds 5,106.84, so discounted payback = 4 + 2,663.86 ÷ 5,106.84 ≈ 4.52 years.',
  },
];

export const check = [
  {
    id: 'f05-crit-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why do the IRR rule and the NPV rule always agree on accepting or rejecting a single project with conventional cash flows?',
    options: [
      'Because the IRR and the NPV are calculated from different cash flows that happen to give the same answer',
      'Because the NPV profile falls as the rate rises and crosses zero once, at the IRR',
      'Because both ignore cash flows after the payback date',
      'Because the IRR assumes reinvestment at the opportunity cost of capital',
    ],
    answer: 1,
    feedback: {
      0: 'Both use exactly the same cash flows: the IRR is the rate at which their NPV is zero.',
      2: 'Neither NPV nor IRR ignores later cash flows; that is payback’s weakness.',
      3: 'Whatever view you take of reinvestment, it is the shape of the profile, not an assumption, that makes the rules agree.',
    },
    solution: 'With one sign change from outflows to inflows, NPV decreases as the rate rises and crosses zero exactly once. So NPV at r is positive exactly when r is below the IRR, and the two rules give the same verdict.',
  },
  {
    id: 'f05-crit-k2', type: 'num', kind: 'numerical',
    prompt: 'A project costs $8,000 today and returns $3,000 at the end of year 1 and $7,000 at the end of year 2. What is its IRR? Give a percentage to two decimal places.',
    answer: 14.15, check: () => irr([-8000, 3000, 7000]) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 12.5, say: 'That spreads the $2,000 gain over two years as simple interest. Solve 8,000 = 3,000 ÷ (1 + r) + 7,000 ÷ (1 + r)².' },
      { value: 25, say: 'That is the total gain over two years. The IRR is a rate per year.' },
    ],
    solution: 'Set x = 1 + r: 8,000x² − 3,000x − 7,000 = 0, so x = (3,000 + √(9,000,000 + 224,000,000)) ÷ 16,000 = (3,000 + 15,264.34) ÷ 16,000 ≈ 1.1415. IRR ≈ 14.15%.',
  },
  {
    id: 'f05-crit-k3', type: 'mc', kind: 'applied',
    prompt: 'A fictional hotel uses a strict two-year payback rule. Project A costs $20,000 and returns $10,000 a year for two years and nothing after. Project B costs $20,000 and returns $8,000 a year for eight years. Both are independent, and the hotel’s rate is 10%. What does the rule do, and is it right?',
    options: [
      'It accepts both, and that is right because both pay back',
      'It accepts A and rejects B; the NPVs say the opposite',
      'It rejects both, which the NPVs confirm',
      'It rejects A and accepts B, as the NPVs do',
    ],
    answer: 1,
    feedback: {
      0: 'B takes 2.5 years to pay back, so a two-year rule rejects it.',
      2: 'A pays back in exactly two years, so the rule accepts it; and B has a large positive NPV.',
      3: 'The rule looks only at the first two years, which favour A.',
    },
    solution: 'A pays back in 2 years (accepted), B in 2.5 (rejected). But NPV(A) = 10,000 × 1.735537 − 20,000 ≈ −$2,645, and NPV(B) = 8,000 × 5.334926 − 20,000 ≈ +$22,679. The rule accepts the value-losing project and rejects the valuable one, because it ignores time value and everything after year 2.',
  },
  {
    id: 'f05-crit-k4', type: 'mc', kind: 'conceptual',
    prompt: 'According to the abstract of Graham and Harvey’s (2001) survey of 392 chief financial officers, which statement describes capital budgeting practice?',
    options: [
      'Almost no firm uses present-value techniques; payback dominates at firms of every size and in every industry',
      'Large firms rely heavily on present-value techniques; small firms are relatively likely to use payback',
      'Small firms rely more on present-value techniques than large firms do',
      'Firms of every size evaluate each project at a discount rate set for that particular project’s own risk',
    ],
    answer: 1,
    feedback: {
      0: 'The abstract reports heavy reliance on present-value techniques among large firms.',
      2: 'It is the other way round: small firms are relatively likely to use payback.',
      3: 'The abstract reports that many firms use the risk of the whole firm rather than of the project.',
    },
    solution: 'The abstract reports that large firms rely heavily on present-value techniques and the CAPM, that small firms are relatively likely to use payback, and that many firms evaluate projects with firm-wide rather than project-specific risk.',
  },
  {
    id: 'f05-crit-k5', type: 'num', kind: 'applied',
    prompt: 'A fictional quarry project has cash flows −$40,000 now, +$100,000 in one year and −$62,400 in two years. Its opportunity cost of capital is 25%. What is its NPV at 25%? Give whole dollars.',
    answer: 64, check: () => npv(0.25, [-40000, 100000, -62400]), unit: '$', places: 0, tol: 1,
    wrong: [
      { value: -555, say: 'That is the NPV at 11%. At 25% the restoration cost is discounted more heavily.' },
      { value: -2400, say: 'That adds the cash flows without discounting.' },
    ],
    solution: 'NPV = −40,000 + 100,000 ÷ 1.25 − 62,400 ÷ 1.5625 = −40,000 + 80,000 − 39,936 = $64. Positive, because 25% lies between the two IRRs (20% and 30%). For this project a higher discount rate makes it more attractive, which is why the IRR rule cannot be applied in the usual way.',
  },
  {
    id: 'f05-crit-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements about the MIRR that are true.',
    options: [
      'It gives a single answer whenever the cash flows include at least one outflow and one inflow',
      'With the finance and reinvestment rates both equal to r, it exceeds r exactly when the NPV at r is positive',
      'Because it is a rate, it still cannot rank mutually exclusive projects of different size',
      'It is always higher than the IRR',
      'It ignores cash flows after the payback date',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'For a conventional project with an IRR above the reinvestment rate, the MIRR is lower than the IRR (Cold Brew: 22.2% against 27.1%).',
      4: 'The MIRR compounds every inflow to the final year; nothing is ignored.',
    },
    solution: 'The MIRR always has one answer when there is an outflow and an inflow; at r for both rates it agrees with the NPV on accept or reject; but as a rate it shares the IRR’s scale problem. It is not always above the IRR, and it uses every cash flow.',
  },
];
