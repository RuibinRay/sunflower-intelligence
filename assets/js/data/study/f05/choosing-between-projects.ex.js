// choosing-between-projects.ex.js — F05 · Choosing between projects: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// Lantern figures come from case.js (ROASTERS, ROASTER, PROPOSALS, BUDGET_2028, coldBrewFlows, roasterFlows); the
// kiosks, cargo bike and solar panels are valued as in net-present-value (the yearly savings are after-tax cash flows).
// Tideline Kayaks, Ravensmoor Hotel, Vellum Print Works, Penrowan Bakery, Cobbleway Laundry and the other businesses
// named here are fictional.
import { ROASTER, ROASTERS, PROPOSALS, BUDGET_2028, WORKING_RATE, TAX, coldBrewFlows, roasterFlows, DERIVED } from './case.js?v=28';
import { projectCashFlows, depreciation, eaa } from '../../../core/corpfin.js?v=28';
import { npv, irr, irrAll, crossover, profitabilityIndex, ration } from '../../../core/invest.js?v=28';

const money = (v) => `${v < -0.5 ? '−' : ''}$${Math.round(Math.abs(v)).toLocaleString('en-US')}`;
const pct = (x, d = 1) => (Number.isFinite(x) ? `${(x * 100).toFixed(d)}%` : '—');
const af = (n, k) => (1 - (1 + k) ** -n) / k;
const r = WORKING_RATE;

// ---------------------------------------------------------------- Lantern figures used below
const costFlows = (m, k = {}) => projectCashFlows({ capex: m.price, years: m.life, revenue: Array(m.life).fill(0), variable: Array(m.life).fill(0), fixed: m.operator,
  dep: depreciation(m.price, { method: 7 }).slice(0, m.life), tax: TAX, salvage: m.salvage, ...k }).fcf;
const eacOf = (m, rate) => -eaa(npv(rate, costFlows(m)), rate, m.life);
const smallFlows = (p) => [-p.outlay, ...Array(p.life).fill(p.saving)];
const FLOWS = [
  { name: 'Cold Brew', flows: coldBrewFlows().fcf },
  { name: 'In-house roaster (A)', flows: roasterFlows().fcf },
  ...PROPOSALS.slice(2).map((p) => ({ name: p.name.replace(' for the cafés', '').replace(' for deliveries', '').replace(' on the kitchen roof', ''), flows: smallFlows(p) })),
];
const projectsAt = (rate) => FLOWS.map((p) => ({ name: p.name, outlay: -p.flows[0], npv: npv(rate, p.flows) }));
const P11 = projectsAt(r);

// Ravensmoor (lesson) and Tideline (lesson)
const Q = [-50000, 36000, 20000, 6000, 2000];

export const widgets = {
  'cbp-scale': {
    type: 'capbudget',
    title: 'Tideline Kayaks: the extra cash flows of the large fleet',
    inputs: [
      { id: 'lout', label: 'Large fleet’s cost today', min: 80000, max: 160000, step: 5000, value: 120000, fmt: 'money' },
      { id: 'lflow', label: 'Large fleet’s cash a year (years 1–4)', min: 30000, max: 60000, step: 1000, value: 44000, fmt: 'money' },
      { id: 'rate', label: 'Cost of capital', min: 0, max: 30, step: 0.5, value: 11, fmt: 'pct' },
    ],
    model: (v) => ({ capex: v.lout - 50000, years: 4, revenue: Array(4).fill(v.lflow - 20000), variable: Array(4).fill(0), fixed: 0, dep: [], tax: 0 }),
    rate: 'rate', show: ['metrics', 'profile'],
    note: 'The small fleet is fixed at −$50,000 today and +$20,000 a year. The figures above describe the <b>difference</b> (large minus small): a positive NPV, or an IRR above the cost of capital, means the large fleet is the better choice. The NPV shown is exactly the large fleet’s NPV minus the small fleet’s. All figures fictional.',
  },
  'cbp-crossover': {
    type: 'formula',
    title: 'Ravensmoor Hotel: which project at which rate?',
    intro: 'Room refurbishment: −$50,000, then $36,000, $20,000, $6,000 and $2,000. Spa: −$50,000, then $0, $8,000, $24,000 and the year-4 cash below. All figures fictional.',
    inputs: [
      { id: 'rate', label: 'Discount rate', min: 0, max: 30, step: 0.5, value: 11, fmt: 'pct' },
      { id: 'spa4', label: 'Spa’s cash in year 4', min: 30000, max: 70000, step: 1000, value: 52000, fmt: 'money' },
    ],
    compute: (v) => {
      const W = [-50000, 0, 8000, 24000, v.spa4], k = v.rate / 100;
      const nq = npv(k, Q), nw = npv(k, W), xs = crossover(W, Q).filter((x) => x > -0.5);
      const iq = irr(Q), iw = irrAll(W);
      const rates = Array.from({ length: 16 }, (_, i) => i * 2);
      const best = Math.max(nq, nw);
      const choice = best < 0 ? 'Neither: both NPVs are negative' : nw > nq ? 'The spa' : 'The refurbishment';
      const cross = xs.length ? xs.map((x) => pct(x, 2)).join(' and ') : 'none: one project is ahead at every rate';
      let note = `At ${pct(k)} the ${nw > nq ? 'spa' : 'refurbishment'} is worth ${money(Math.abs(nw - nq))} more. `;
      note += xs.length === 1 ? `The profiles cross at ${pct(xs[0], 2)}: below it the spa (more cash, later) wins; above it the refurbishment (less cash, sooner) does. ` : '';
      note += `IRR ranks the refurbishment ${iw.length === 1 && iw[0] > iq ? 'second' : 'first'} whatever the rate${iw.length === 1 && iw[0] > iq ? '; with this much spa cash it agrees with NPV below the crossover' : ''}.`;
      return {
        headline: { label: `Better choice at ${pct(k)}`, value: choice },
        rows: [
          ['Refurbishment NPV', money(nq)], ['Spa NPV', money(nw)],
          ['Refurbishment IRR', pct(iq, 2)], ['Spa IRR', iw.length === 1 ? pct(iw[0], 2) : '—'],
          ['Crossover rate', cross],
        ],
        note,
        chart: { kind: 'line', x: { label: 'Discount rate (%)', values: rates },
          series: [{ name: 'Refurbishment', values: rates.map((p) => Math.round(npv(p / 100, Q))) }, { name: 'Spa', values: rates.map((p) => Math.round(npv(p / 100, W))) }, { name: 'Zero', values: rates.map(() => 0) }],
          y: { label: 'NPV ($)' } },
      };
    },
  },
  'cbp-roasters': {
    type: 'formula',
    title: 'Lantern’s roasters: equivalent annual cost',
    intro: 'After-tax costs of owning each roaster (25% tax, 7-year MACRS, sold at the end of its life), turned into a cost a year. Costs that are the same for both machines are left out. Figures from the fictional case.',
    inputs: [
      { id: 'rate', label: 'Discount rate', min: 2, max: 20, step: 0.5, value: 11, fmt: 'pct' },
      { id: 'aPrice', label: 'Roaster A’s installed price (7 years)', min: 36000, max: 60000, step: 1000, value: ROASTERS[0].price, fmt: 'money' },
      { id: 'bOp', label: 'Roaster B’s operator cost a year (4 years)', min: 28000, max: 42000, step: 500, value: ROASTERS[1].operator, fmt: 'money' },
    ],
    compute: (v) => {
      const k = v.rate / 100, A = { ...ROASTERS[0], price: v.aPrice }, B = { ...ROASTERS[1], operator: v.bOp };
      const pvA = -npv(k, costFlows(A)), pvB = -npv(k, costFlows(B)), eA = eacOf(A, k), eB = eacOf(B, k);
      const wins = eA < eB ? 'Roaster A' : eB < eA ? 'Roaster B' : 'Either';
      return {
        headline: { label: 'Cheaper to own, per year', value: `${wins} (by ${money(Math.abs(eA - eB))} a year)` },
        rows: [
          ['Roaster A: present value of costs over 7 years', money(pvA)], ['Roaster B: present value of costs over 4 years', money(pvB)],
          ['Roaster A: equivalent annual cost', money(eA)], ['Roaster B: equivalent annual cost', money(eB)],
          ['28-year chain: A (four machines)', money(eA * af(28, k))], ['28-year chain: B (seven machines)', money(eB * af(28, k))],
        ],
        note: pvB < pvA && eA < eB
          ? 'B has the lower present value only because it covers fewer years. Per year of roasting, A is cheaper; the 28-year chains agree.'
          : `The lower equivalent annual cost and the cheaper 28-year chain both point to ${wins === 'Either' ? 'neither' : wins}.`,
        chart: { kind: 'bar', x: { label: 'Roaster', values: ['A', 'B'] }, series: [{ name: 'Equivalent annual cost', values: [Math.round(eA), Math.round(eB)] }], y: { label: 'Dollars a year' } },
      };
    },
  },
  'cbp-ration': {
    type: 'formula',
    title: 'Lantern’s 2028 proposals under a budget',
    intro: 'Cold Brew, the roaster (A), kiosks, cargo bike and solar panels, valued at the rate below. The budget covers outlays on 1 April 2028. Figures from the fictional case.',
    inputs: [
      { id: 'budget', label: 'Budget on 1 April', min: 0, max: 100000, step: 1000, value: BUDGET_2028, fmt: 'money' },
      { id: 'rate', label: 'Discount rate', min: 5, max: 20, step: 0.5, value: 11, fmt: 'pct' },
    ],
    compute: (v) => {
      const ps = projectsAt(v.rate / 100), R = ration(ps, v.budget);
      const names = (mask) => ps.filter((_, i) => mask[i]).map((p) => p.name).join(', ') || 'nothing';
      const allPos = ps.filter((p) => p.npv > 0), unl = allPos.reduce((s, p) => s + p.npv, 0);
      return {
        headline: { label: 'Best set within the budget', value: names(R.exact) },
        rows: [
          ['Total NPV of the best set', money(R.exactNpv)], ['Its outlay', money(R.exactOutlay)],
          ['PI shortcut picks', `${names(R.greedy)} (NPV ${money(R.greedyNpv)})`],
          ['If projects could be taken in part', money(R.fractionalNpv)],
          ['NPV with no budget limit', money(unl)], ['Value the budget costs', money(unl - R.exactNpv)],
          ...ps.map((p) => [`${p.name}: outlay ${money(p.outlay)}`, `NPV ${money(p.npv)}, PI ${(1 + p.npv / p.outlay).toFixed(2)}`]),
        ],
        note: Math.abs(R.greedyNpv - R.exactNpv) > 0.5
          ? `Here the PI ranking falls short by ${money(R.exactNpv - R.greedyNpv)}: taking projects in PI order leaves money idle that a different combination would use.`
          : 'Here the PI ranking finds the best set. It is not guaranteed to: with whole projects, check the combinations near the cut-off.',
      };
    },
  },
};

// ---------------------------------------------------------------- practice
const V = { s: [-40000, 18000, 18000, 18000], l: [-70000, 30000, 30000, 30000] };
const vd = V.l.map((x, i) => x - V.s[i]);
const st = { X: [9000, 3, 1500], Y: [14000, 5, 1800] };
const eacSimple = ([p, n, c], k) => p / af(n, k) + c;
const LAB = [{ name: 'P1', outlay: 40000, npv: 10000 }, { name: 'P2', outlay: 30000, npv: 8400 }, { name: 'P3', outlay: 30000, npv: 8100 }, { name: 'P4', outlay: 20000, npv: 3000 }];
const LR = ration(LAB, 70000);
const pmtSheet = { cells: { A1: 'Discount rate', B1: 0.11, A2: 'Life (years)', B2: 7, A3: 'Present value of costs', B3: 142700, A5: 'Equivalent annual cost' }, vary: { B1: [0.08, 0.14, 0.06], B2: [4, 10, 5] } };
const ovenSheet = {
  cells: { A1: 'Year', B1: 'Standard oven', C1: 'Deck oven', A2: 0, A3: 1, A4: 2, A5: 3, B2: -30000, B3: 14000, B4: 14000, B5: 14000, C2: -55000, C3: 24000, C4: 24000, C5: 24000, E1: 'Incremental IRR' },
  fixed: ['A2:A5'],
  vary: { B2: [-28000, -32000, -26000], B3: [13000, 15000, 12500], B4: [13000, 15000, 12500], B5: [13000, 15000, 12500], C2: [-52000, -60000, -50000], C3: [23000, 26000, 22000], C4: [23000, 26000, 22000], C5: [23000, 26000, 22000] },
};
const B50 = ration(P11, 50000);
const e8 = { A: eacOf(ROASTERS[0], 0.08), B: eacOf(ROASTERS[1], 0.08) };

export const guided = [
  {
    id: 'f05-cbp-g1', type: 'steps', kind: 'numerical',
    prompt: 'Vellum Print Works (fictional) can install one of two presses. Small: −$40,000 today, then +$18,000 a year for three years. Large: −$70,000, then +$30,000 a year for three years. Its cost of capital is 9%. The small press has the higher IRR (about 16.6% against 13.7%).',
    solution: 'Large − small = −$30,000 today and +$12,000 a year for three years. Its IRR solves 12,000 × annuity factor = 30,000: a factor of 2.5, which gives about 9.7%. That is above the 9% cost of capital, so the extra $30,000 earns its keep: choose the large press. Check: NPVs at 9% (3-year factor 2.5313) are 18,000 × 2.5313 − 40,000 = $5,563 for the small press and 30,000 × 2.5313 − 70,000 = $5,939 for the large one.',
    steps: [
      { id: 'f05-cbp-g1-s1', type: 'num', prompt: 'What is the incremental cash flow (large minus small) in each of years 1 to 3?',
        answer: 12000, check: () => vd[1], unit: '$', places: 0, tol: 0.5,
        hints: ['Subtract year by year: large’s year-1 cash minus small’s year-1 cash.'],
        wrong: [{ value: -12000, say: 'Subtract the other way round (large − small), so the difference starts with an outflow and looks like an investment.' }, { value: 30000, say: 'That is the difference in the cost today. The question asks for the difference in each later year.' }] },
      { id: 'f05-cbp-g1-s2', type: 'num', prompt: 'What is the incremental IRR, in % to one decimal place?',
        answer: 9.7, check: () => irr(vd) * 100, unit: '%', places: 1, tol: 0.06,
        hints: ['The incremental project costs $30,000 and returns $12,000 a year for three years: find the rate whose 3-year annuity factor is 30,000 ÷ 12,000 = 2.5.', 'At 9% the factor is 2.5313; at 10%, 2.4869. The rate is a little below 10%.'],
        wrong: [{ value: 16.6, say: 'That is the small press’s own IRR. The incremental IRR is the IRR of the difference in cash flows.' }, { value: 13.7, say: 'That is the large press’s own IRR. Use the difference: −30,000, then +12,000 a year.' }] },
      { id: 'f05-cbp-g1-s3', type: 'mc', prompt: 'Which press should Vellum install?',
        options: ['The large press: the extra investment earns more than 9%', 'The small press: it has the higher IRR', 'The small press: it costs less', 'Neither: the incremental IRR is too close to 9% to decide'],
        answer: 0,
        feedback: { 1: 'IRR is a rate per dollar; the large press adds more dollars of value. The incremental IRR (9.7% > 9%) shows the extra capital is worth investing.', 2: 'A lower cost is not a reason by itself: the question is whether the extra $30,000 adds value, and at 9% it does.', 3: 'Close calls deserve a sensitivity test, but on these estimates the large press adds more value ($5,939 against $5,563).' },
        hints: ['Compare the incremental IRR with the cost of capital.'] },
    ],
  },
  {
    id: 'f05-cbp-g2', type: 'steps', kind: 'numerical',
    prompt: 'A fictional dental clinic, a charity that pays no tax, needs a steriliser for the foreseeable future. Model X costs $9,000, lasts three years and costs $1,500 a year to run. Model Y costs $14,000, lasts five years and costs $1,800 a year to run. Neither has a resale value. Running costs are paid at the end of each year; the clinic uses 9%.',
    solution: 'X: 3-year annuity factor at 9% = 2.5313; EAC = 9,000 ÷ 2.5313 + 1,500 = 3,555.49 + 1,500 = $5,055.49. Y: 5-year factor = 3.8897; EAC = 14,000 ÷ 3.8897 + 1,800 = 3,599.29 + 1,800 = $5,399.29. X costs about $344 a year less, so buy X and replace it every three years. (The running cost is already a level yearly amount, so its EAC is itself; only the price needs spreading.)',
    steps: [
      { id: 'f05-cbp-g2-s1', type: 'num', prompt: 'What is model X’s equivalent annual cost, to the nearest cent?',
        answer: 5055.49, check: () => eacSimple(st.X, 0.09), unit: '$', places: 2, tol: 0.6,
        hints: ['Spread the price over three years as an annuity at 9%: price ÷ (1 − 1.09⁻³) ÷ 0.09, then add the yearly running cost.', 'The 3-year annuity factor at 9% is 2.5313.'],
        wrong: [{ value: 4500, say: 'That spreads the price evenly (9,000 ÷ 3) and ignores the time value of money. Divide by the annuity factor, 2.5313.' }, { value: 3555.49, say: 'That is only the price spread over three years. Add the $1,500 running cost a year.' }] },
      { id: 'f05-cbp-g2-s2', type: 'num', prompt: 'What is model Y’s equivalent annual cost, to the nearest cent?',
        answer: 5399.29, check: () => eacSimple(st.Y, 0.09), unit: '$', places: 2, tol: 0.6,
        hints: ['The 5-year annuity factor at 9% is 3.8897.'],
        wrong: [{ value: 4600, say: 'That is 14,000 ÷ 5 + 1,800, with no discounting. Divide the price by the 5-year annuity factor.' }] },
      { id: 'f05-cbp-g2-s3', type: 'mc', prompt: 'Which model should the clinic buy?',
        options: ['X: it has the lower cost per year', 'Y: it lasts longer', 'Y: its price per year of life ($2,800) is lower than X’s ($3,000)', 'X: its price is lower'],
        answer: 0,
        feedback: { 1: 'A longer life is worth something, but Y’s extra price outweighs it: per year, Y costs $344 more.', 2: 'Dividing the price by the life ignores the time value of money and leaves out the running costs, which are higher for Y. On equivalent annual cost, X is cheaper.', 3: 'The lower price is part of it, but the reason to choose X is its lower cost per year once price, running costs and life are all counted.' },
        hints: ['Lower equivalent annual cost wins, provided the steriliser will keep being replaced.'] },
    ],
  },
  {
    id: 'f05-cbp-g3', type: 'steps', kind: 'applied',
    prompt: 'A fictional university research lab has $70,000 this year for equipment and four independent proposals: P1 costs $40,000 (NPV $10,000), P2 $30,000 (NPV $8,400), P3 $30,000 (NPV $8,100) and P4 $20,000 (NPV $3,000). Projects can’t be split.',
    solution: 'PIs: P1 (40,000 + 10,000) ÷ 40,000 = 1.25; P2 1.28; P3 1.27; P4 1.15. Ranked by PI the lab takes P2 and P3 ($60,000, NPV $16,500), and P1 no longer fits. But P1 and P2 together cost exactly $70,000 and add $18,400. The PI ranking fails because the projects are lumpy: the top two by PI leave $10,000 idle. Check every combination that fits: P1 + P2 is the best.',
    steps: [
      { id: 'f05-cbp-g3-s1', type: 'num', prompt: 'What is P1’s profitability index (to two decimal places)?',
        answer: 1.25, check: () => (40000 + 10000) / 40000, unit: '', places: 2, tol: 0.005,
        hints: ['PI = present value of the cash flows after today ÷ outlay = (NPV + outlay) ÷ outlay.'],
        wrong: [{ value: 0.25, say: 'That is NPV ÷ outlay. The PI is (NPV + outlay) ÷ outlay, so 1 + 0.25.' }] },
      { id: 'f05-cbp-g3-s2', type: 'multi', prompt: 'Which projects should the lab fund? Select all that apply.',
        options: ['P1', 'P2', 'P3', 'P4'], answer: [0, 1],
        feedback: { 2: 'P3 has a higher PI than P1, but taking P2 and P3 leaves $10,000 unspent and P1 out. P1 + P2 uses the full $70,000 for more NPV.', 3: 'P4 has the lowest PI, and no set that includes it beats P1 + P2.' },
        hints: ['List the combinations that fit within $70,000 and add their NPVs.', 'P2 + P3 = $16,500; P1 + P2 = ?'] },
      { id: 'f05-cbp-g3-s3', type: 'num', prompt: 'What total NPV does the best set add?',
        answer: 18400, check: () => LR.exactNpv, unit: '$', places: 0, tol: 0.5,
        hints: ['Add the NPVs of the projects you chose.'],
        wrong: [{ value: 16500, say: 'That is the PI ranking’s set, P2 + P3, which leaves $10,000 idle. P1 + P2 uses the whole budget.' }, { value: 29500, say: 'That is all four projects, which would cost $120,000. Stay within $70,000.' }] },
    ],
  },
  {
    id: 'f05-cbp-g4', type: 'formula', kind: 'numerical',
    prompt: 'B1 holds a discount rate, B2 an asset’s life and B3 the present value of the costs of owning it (a positive number). In B5, calculate its equivalent annual cost as a positive number, using PMT.',
    sheet: pmtSheet,
    cell: 'B5', answer: '=PMT(B1,B2,-B3)', require: ['PMT'],
    alt: ['=-PMT(B1,B2,B3)', '=PMT(B1,B2,B3)*-1', '=ABS(PMT(B1,B2,B3))'],
    view: 'A1:B5', formats: { B1: '0.0%', B3: '$#,##0', B5: '$#,##0.00' }, widths: { A: 24 },
    hints: ['PMT(rate, nper, pv) gives the level payment over nper periods with the same present value as pv.', 'PMT returns a negative number for a positive pv (money paid out against money received). Put a minus sign before B3.'],
    wrong: [
      { formula: '=PMT(B1,B2,B3)', say: 'That gives the right size with a minus sign, because PMT treats B3 as money received. Write −B3 (or put a minus sign before PMT).' },
      { formula: '=B3/B2', say: 'That spreads the cost evenly and ignores the time value of money. Use PMT, which divides by the annuity factor.' },
      { formula: '=PMT(B1,B2,-B3,0,1)', say: 'Type 1 puts the payments at the start of each year. Costs here are spread over the ends of the years, the usual convention: leave type out.' },
    ],
    solution: '<x>=PMT(B1,B2,-B3)</x> returns about $30,283 for Lantern’s roaster A: 142,700 × 0.11 ÷ (1 − 1.11⁻⁷). Equivalently <x>=B3*B1/(1-(1+B1)^-B2)</x>. The minus sign is Excel’s sign convention: a positive present value received is matched by negative payments.',
  },
];

export const independent = [
  {
    id: 'f05-cbp-i1', type: 'formula', kind: 'numerical',
    prompt: 'Penrowan Bakery (fictional) can buy a standard oven or a deck oven, not both. Their cash flows are in B2:B5 and C2:C5 (year 0 to year 3). In E2, calculate the incremental IRR of the deck oven over the standard one in one formula, without adding a helper column.',
    sheet: ovenSheet,
    cell: 'E2', answer: '=IRR(C2:C5-B2:B5)', require: ['IRR'],
    alt: ['=IRR(B2:B5-C2:C5)'],
    view: 'A1:E5', formats: { E2: '0.00%' }, widths: { A: 8, B: 15, C: 13, E: 16 },
    wrong: [
      { formula: '=IRR(C2:C5)-IRR(B2:B5)', say: 'That subtracts the two IRRs. The incremental IRR is the IRR of the difference in cash flows: IRR(C2:C5−B2:B5).' },
      { formula: '=IRR(C2:C5)', say: 'That is the deck oven’s own IRR. Subtract the standard oven’s cash flows first.' },
      { formula: '=IRR(B2:B5)', say: 'That is the standard oven’s own IRR. The incremental IRR is the IRR of deck minus standard.' },
    ],
    solution: '<x>=IRR(C2:C5-B2:B5)</x> takes the IRR of the difference: −$25,000 today and +$10,000 a year, about 9.70%. If Penrowan’s cost of capital is below that (say 8%), the deck oven is the better choice even though its own IRR (about 14.8%) is below the standard oven’s (about 18.9%). <x>=IRR(B2:B5-C2:C5)</x> gives the same rate, since flipping every sign leaves the IRR unchanged, but then the flows look like a loan and the reading reverses.',
  },
  {
    id: 'f05-cbp-i2', type: 'mc', kind: 'conceptual',
    prompt: 'Ana compares her two roasters by equivalent annual cost. In which situation would that comparison be <b>misleading</b>?',
    options: [
      'Ana expects to sell Lantern in four years, and with it the need to roast',
      'Both roasters are 7-year MACRS property, though their lives differ',
      'The roasters’ operators are paid different wages',
      'The rate used, 11%, is Ana’s working estimate rather than a measured cost of capital',
    ],
    answer: 0,
    feedback: {
      1: 'Tax classes are handled inside each machine’s cash flows (depreciation and the tax on resale); they don’t break the annual comparison.',
      2: 'Different running costs are exactly what the EAC is built to compare.',
      3: 'Any rate is an estimate; the EAC still compares the machines fairly at that rate, and the lesson’s check shows A wins at every rate from 5% to 20%.',
    },
    solution: 'The EAC assumes each machine will be replaced by an identical one for as long as the need lasts. If the need ends in four years, A would be sold after four years, not seven, so compare the two over the actual four-year horizon, with A’s resale value at that date.',
  },
  {
    id: 'f05-cbp-i3', type: 'num', kind: 'applied',
    prompt: 'Cobbleway Laundry (fictional) has an old washer it could sell today for $3,000 or in a year for $1,800. Keeping it one more year would cost $7,200 to run and repair, paid at the end of the year. A new washer’s equivalent annual cost is $9,400. All figures are after tax, and the rate is 11%. What is the cost of keeping the old washer for one more year, measured at the end of that year?',
    answer: 8730, check: () => 3000 * 1.11 - 1800 + 7200, unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 8400, say: 'That leaves out a year’s interest on the $3,000 you give up by not selling today: it is worth 3,000 × 1.11 at the end of the year.' },
      { value: 7200, say: 'That counts only the running cost. Keeping the washer also means giving up $3,000 today in exchange for $1,800 next year.' },
      { value: 12000, say: 'The $1,800 resale a year from now is money Cobbleway gets back: subtract it, don’t add it.' },
    ],
    solution: 'Keeping the washer gives up $3,000 today (worth 3,000 × 1.11 = $3,330 a year later), recovers $1,800 in a year and costs $7,200 to run: 3,330 − 1,800 + 7,200 = $8,730. That is less than the new washer’s $9,400 a year, so keep the old one for now and repeat the comparison next year.',
  },
  {
    id: 'f05-cbp-i4', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each limit on investment as soft rationing (set by the firm itself) or hard rationing (imposed by the capital markets).',
    items: [
      'Each division may spend at most $2 million this year, set by the board.',
      'No bank will lend to a start-up with no profits and no assets to pledge.',
      'The owner refuses to borrow, although lenders would lend on reasonable terms.',
      'An existing loan agreement forbids any new borrowing until the loan is repaid.',
      'A family firm will not sell shares to outsiders, to keep control.',
    ],
    categories: ['Soft rationing', 'Hard rationing'],
    answer: [0, 1, 0, 1, 0],
    feedback: { 2: 'Lenders would lend: the limit is the owner’s choice, so it is soft.', 3: 'The firm agreed to the covenant, but once signed it is a constraint imposed by its lender, not one it can lift by an internal decision.', 4: 'Outside equity is available; the family chooses not to take it. That is soft rationing, with a reason (control) that may or may not be worth its cost.' },
    solution: 'Soft: the board’s divisional budgets, the owner’s refusal to borrow, the family’s refusal to sell shares. Hard: no bank will lend, and the loan agreement’s ban on new debt. A firm with positive-NPV projects under soft rationing is choosing to forgo value, and should weigh that against its reasons.',
  },
  {
    id: 'f05-cbp-i5', type: 'num', kind: 'applied',
    prompt: 'Suppose Ana could spend $50,000 on 1 April 2028 instead of $40,000. Using the lesson’s outlays and NPVs at 11% (Cold Brew $23,237 / $25,737; roaster $48,000 / $18,386; kiosks $14,000 / $2,133; cargo bike $7,500 / $1,001; solar panels $19,000 / −$743), what total NPV does the best set within $50,000 add?',
    answer: 28871, check: () => B50.exactNpv, unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 27870, say: 'That is the $40,000 answer. With $50,000, the cargo bike also fits alongside Cold Brew and the kiosks.' },
      { value: 44123, say: 'Cold Brew and the roaster together cost $71,237, more than $50,000.' },
      { value: 18386, say: 'The roaster alone fits, but Cold Brew, kiosks and bike together add more.' },
    ],
    solution: 'The roaster ($48,000) fits only alone (NPV $18,386); adding anything else breaks the budget. Without it, Cold Brew + kiosks + bike cost $44,737 and add 25,737 + 2,133 + 1,001 = $28,871 (from unrounded NPVs, $28,870). That beats the roaster alone, so the best set is Cold Brew, kiosks and bike. The extra $10,000 of budget is worth only the bike’s $1,001 here; the roaster still needs $71,237 alongside Cold Brew.',
  },
];

export const check = [
  {
    id: 'f05-cbp-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Two mutually exclusive projects: A has an IRR of 24% and an NPV of $30,000; B has an IRR of 18% and an NPV of $45,000, both at the firm’s 10% cost of capital and of the same risk. What should the firm do?',
    options: ['Choose B, because it adds more value at the cost of capital', 'Choose A, because it earns the higher rate of return on each dollar invested', 'Choose both, because both have positive NPVs at the 10% cost of capital', 'Choose A if it is smaller, because it ties up less of the firm’s capital'],
    answer: 0,
    feedback: { 1: 'IRR is a rate, not an amount of value; it can favour a smaller project or one that pays earlier. The firm’s owners are better off by $15,000 more with B.', 2: 'They are mutually exclusive: only one can be taken.', 3: 'Capital has a cost, already charged in the NPV at 10%. Unless capital is rationed, the smaller outlay is not an advantage in itself.' },
    solution: 'For mutually exclusive projects, choose the higher NPV: B. A’s higher IRR could come from a smaller scale or earlier cash flows; the incremental IRR of B over A must be above 10%, since B’s NPV is higher at 10%.',
  },
  {
    id: 'f05-cbp-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional events company can run a small festival (−$10,000 today, +$12,000 in one year) or a large one (−$25,000 today, +$28,500 in one year), not both. What is the incremental IRR of the large festival over the small one, in %?',
    answer: 10, check: () => irr([-15000, 16500]) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 20, say: 'That is the small festival’s own IRR (12,000 ÷ 10,000 − 1).' },
      { value: 14, say: 'That is the large festival’s own IRR (28,500 ÷ 25,000 − 1).' },
      { value: -6, say: 'That subtracts the IRRs. Take the IRR of the difference in cash flows instead.' },
    ],
    solution: 'Difference (large − small): −$15,000 today, +$16,500 in a year. IRR = 16,500 ÷ 15,000 − 1 = 10%. If the cost of capital is below 10%, choose the large festival; above it, the small one.',
  },
  {
    id: 'f05-cbp-k3', type: 'mc', kind: 'conceptual',
    prompt: 'The present value of roaster B’s costs ($100,195) is lower than roaster A’s ($142,700), yet the lesson recommends A. Why?',
    options: ['The totals cover four years against seven; per year of roasting, A is cheaper', 'A’s larger depreciation tax shield is left out of its present value, which overstates its cost', 'B’s cash flows should be discounted at a higher rate, since a cheaper machine is a riskier one', 'A’s higher resale value is added after the comparison, which turns the ranking round'],
    answer: 0,
    feedback: { 1: 'Both present values already include the depreciation tax shields.', 2: 'The rate depends on risk, not on price; the two machines do the same job with the same risk.', 3: 'Each machine’s resale value is already in its present value, after tax.' },
    solution: 'The present values cover different lengths of service. Converting each to an equivalent annual cost (A $30,283, B $32,295) or extending both to a 28-year chain compares them over the same period, and A is cheaper.',
  },
  {
    id: 'f05-cbp-k4', type: 'num', kind: 'applied',
    prompt: 'Suppose Lantern’s cost of capital turns out to be 8% rather than 11%. Recompute both roasters’ equivalent annual costs at 8% (same cash flows: A −$48,000 then 7 years; B −$22,000 then 4 years; see the lesson). By how much a year is the cheaper roaster cheaper, to the nearest dollar?',
    answer: Math.round(e8.B - e8.A), check: () => e8.B - e8.A, unit: '$', places: 0, tol: 1.5,
    wrong: [
      { value: 2012, say: 'That is the gap at 11%. At 8% the present values and the annuity factors both change.' },
      { value: 47066, say: 'That is the gap in the present values at 8%, which compares seven years with four. Convert each to a cost a year first.' },
    ],
    solution: `At 8%: A’s costs have a present value of ${money(-npv(0.08, costFlows(ROASTERS[0])))}, an EAC of ${money(e8.A)} a year; B’s ${money(-npv(0.08, costFlows(ROASTERS[1])))}, an EAC of ${money(e8.B)} a year. A is cheaper by about ${money(e8.B - e8.A)} a year, a little more than at 11%: a lower rate makes A’s up-front price matter less.`,
  },
  {
    id: 'f05-cbp-k5', type: 'multi', kind: 'conceptual',
    prompt: 'Ranking projects by profitability index and taking them in order until the budget runs out may <b>fail</b> to find the set with the highest total NPV when… (Select all that apply.)',
    options: [
      'projects can’t be split, so the budget may not be used up exactly',
      'the budget limits spending next year as well as this year',
      'two projects on the list are mutually exclusive',
      'every project can be taken in part',
      'the budget is soft rationing rather than hard',
    ],
    answer: [0, 1, 2],
    feedback: { 3: 'With divisible projects the PI ranking is exactly right: each dollar goes where it adds most NPV.', 4: 'Within a given budget, how the limit arose doesn’t change which set is best; it changes whether the limit should be there at all.' },
    solution: 'The PI shortcut is exact only for divisible projects and a single-period budget. Lumpy projects can leave money idle (Haverlock’s X against Y + Z), a budget in several periods needs a project’s later outlays counted too, and mutually exclusive pairs must be restricted to at most one.',
  },
  {
    id: 'f05-cbp-k6', type: 'mc', kind: 'applied',
    prompt: 'With $40,000, Ana funds Cold Brew and the kiosks and leaves out the roaster (NPV $18,386 at 11%, outlay $48,000). What is the soundest advice?',
    options: ['Raise the $48,000 if it costs no more than the roaster’s required return: the cap costs about $19,387', 'Drop Cold Brew and buy the roaster instead, because the roaster is the larger value that the budget rules out', 'Leave the roaster out: a positive-NPV project that doesn’t fit within the budget is not a real opportunity', 'Buy a roaster jointly with another café so that Lantern’s share of the cost fits within the $40,000'],
    answer: 0,
    feedback: { 1: 'The roaster alone costs more than $40,000, and Cold Brew’s NPV is higher. Dropping Cold Brew loses value.', 2: 'The budget is a constraint to be priced, not a fact about the project. If finance is available at a fair cost, the project is a real opportunity.', 3: 'Sharing a roaster is a different project, with its own costs and control problems; the roaster valued in the lesson is indivisible.' },
    solution: 'Unless the $40,000 is a hard limit, the NPV given up ($47,256 − $27,870 = $19,387 from unrounded NPVs, almost all the roaster) is the case for raising money. How to raise it and what it costs come in modules 3 and 4; the roaster’s value depends on 11% being the right rate for it.',
  },
];
