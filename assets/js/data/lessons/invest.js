// Lesson: investment decisions (NPV, IRR, payback, profitability index).
// `checks` recompute every number printed in the worked example; tests/lessons.test.mjs compares them.
import * as F from '../../core/format.js?v=11';
import { npv, appraise, crossover, irrAll } from '../../core/invest.js?v=11';

const A = [-1000, 100, 350, 1000], B = [-1000, 900, 250, 100], RATE = 0.1;
const pv = (cf, t) => cf / (1 + RATE) ** t;

export default {
  id: 'invest',
  title: 'Choosing between projects',
  minutes: 7,
  hook: 'NPV, IRR, payback and the profitability index often agree. When they don’t, NPV is the one to trust, and knowing why is most of capital budgeting.',
  idea: [
    'The <b>net present value</b> of a project is every cash flow discounted at the cost of capital, outlay included. A positive NPV is the value the project adds in today’s dollars, so fund it; between alternatives, fund the one with the highest NPV.',
    'The <b>internal rate of return</b> is the discount rate at which NPV is exactly zero. For one ordinary project it gives the same yes or no as NPV. Between alternatives it can mislead: a percentage ignores size and rewards early cash. And when cash-flow signs change more than once, as with a mine that needs cleaning up, there can be several IRRs.',
    'The <b>payback period</b> counts years until the outlay comes back and ignores everything after. The <b>profitability index</b>, the present value per dollar invested, helps when the budget is short, but with projects that can’t be split, ranking by it can miss the best combination.',
  ],
  formula: {
    html: 'NPV = CF<sub>0</sub> + <span class="frac"><span>CF<sub>1</sub></span><span>(1 + r)</span></span> + … + <span class="frac"><span>CF<sub>N</sub></span><span>(1 + r)<sup>N</sup></span></span>,&ensp; PI = <span class="frac"><span>NPV + outlay</span><span>outlay</span></span>',
    terms: [
      ['CF<sub>0</sub>', 'the outlay today, a negative number'],
      ['CF<sub>t</sub>', 'cash flow at the end of year <i>t</i>'],
      ['r', 'the cost of capital for projects of this risk'],
      ['IRR', 'the discount rate r at which NPV is exactly zero'],
      ['PI', 'profitability index: present value of the inflows per dollar of outlay'],
      ['crossover rate', 'the rate at which two projects have the same NPV: the IRR of the difference between their cash flows'],
    ],
  },
  example: {
    setup: 'You can fund one of two projects, each costing $1,000k, at a 10% cost of capital. A pays $100k, $350k and $1,000k over three years; B pays $900k, $250k and $100k.',
    steps: [
      'NPV of A: −1,000 + 100 ÷ 1.1 + 350 ÷ 1.1² + 1,000 ÷ 1.1³ = −1,000 + 90.9 + 289.3 + 751.3 = <b>$131.5k</b>.',
      'NPV of B: −1,000 + 818.2 + 206.6 + 75.1 = <b>$99.9k</b>. Both add value, but A adds $31.6k more.',
      'IRR ranks them the other way: <b>18.3%</b> for B against <b>15.4%</b> for A. B also pays back sooner, in 1.4 years against 2.55.',
      'The difference between them (A minus B) has an IRR of <b>12.5%</b>: the crossover rate. Below it A is worth more, above it B. At 10% you are below it.',
    ],
    result: 'Fund <b>A</b>. B’s higher IRR and quicker payback reward early cash, but at your 10% cost of capital A’s larger later payments are worth more in today’s money.',
  },
  mistake: {
    title: 'Ranking alternatives by IRR',
    html: 'Choosing B because 18.3% beats 15.4% gives up $31.6k of value. IRR answers “what rate would make this break even?”, not “which project adds the most?”. Use it to accept or reject a single ordinary project; use NPV to choose.',
  },
  remember: [
    'Fund positive-NPV projects; between alternatives, the highest NPV.',
    'IRR and payback favour early cash and small projects. Where two NPV lines cross, the ranking flips.',
    'More than one sign change can mean more than one IRR: use NPV, or MIRR. With a fixed budget and whole projects, check combinations rather than ranking by PI.',
  ],
  calc: {
    title: 'Early cash or late cash?',
    intro: 'Projects A and B from the example. Move the cost of capital past the crossover rate, or change one cash flow, and watch the choice.',
    inputs: [
      { id: 'r', label: 'Cost of capital', min: 0, max: 25, step: 0.5, value: 10, fmt: 'pct' },
      { id: 'a3', label: 'A’s cash in year 3', min: 500, max: 1500, step: 50, value: 1000, fmt: 'money', unit: 'k' },
      { id: 'b1', label: 'B’s cash in year 1', min: 500, max: 1200, step: 50, value: 900, fmt: 'money', unit: 'k' },
    ],
    compute({ r, a3, b1 }) {
      const a = [-1000, 100, 350, a3], b = [-1000, b1, 250, 100], rate = r / 100;
      const pa = appraise(a, { rate }), pb = appraise(b, { rate });
      const irr = (p) => (p.irrs.length === 1 ? F.pct(p.irr, 1) : p.irrs.length ? p.irrs.map((x) => F.pct(x, 1)).join(' and ') : 'none');
      const x = crossover(a, b).filter((v) => v > 0 && v < 1);
      const best = pa.npv >= pb.npv ? 'A' : 'B';
      const byIrr = Number.isFinite(pa.irr) && Number.isFinite(pb.irr) ? (pa.irr >= pb.irr ? 'A' : 'B') : null;
      const fund = Math.max(pa.npv, pb.npv) > 0 ? `Fund ${best}` : 'Fund neither';
      return {
        headline: { value: fund, label: `at a ${F.pct(rate, 1)} cost of capital` },
        rows: [['NPV of A', F.money(pa.npv, { unit: 'k' })], ['NPV of B', F.money(pb.npv, { unit: 'k' })], ['IRR of A, B', `${irr(pa)}, ${irr(pb)}`], ['Crossover rate', x.length ? x.map((v) => F.pct(v, 1)).join(', ') : 'none between 0% and 100%']],
        note: Math.max(pa.npv, pb.npv) <= 0
          ? 'Neither project earns its cost of capital, so both NPVs are negative.'
          : byIrr && byIrr !== best
            ? `IRR would pick ${byIrr} and give up ${F.money(Math.abs(pa.npv - pb.npv), { unit: 'k' })} of value.`
            : 'Here IRR and NPV agree on the choice.',
      };
    },
  },
  tool: { href: 'finance/investment/#compare', label: 'Compare projects, in Finance › Investment decisions' },
  checks: (() => {
    const pa = appraise(A, { rate: RATE }), pb = appraise(B, { rate: RATE }), x = crossover(A, B);
    return [
      { what: 'A year 1', value: pv(100, 1), shown: 90.9, tol: 0.05 }, { what: 'A year 2', value: pv(350, 2), shown: 289.3, tol: 0.05 }, { what: 'A year 3', value: pv(1000, 3), shown: 751.3, tol: 0.05 },
      { what: 'NPV A', value: npv(RATE, A), shown: 131.5, tol: 0.05 },
      { what: 'B year 1', value: pv(900, 1), shown: 818.2, tol: 0.05 }, { what: 'B year 2', value: pv(250, 2), shown: 206.6, tol: 0.05 }, { what: 'B year 3', value: pv(100, 3), shown: 75.1, tol: 0.05 },
      { what: 'NPV B', value: npv(RATE, B), shown: 99.9, tol: 0.05 },
      { what: 'A adds more', value: npv(RATE, A) - npv(RATE, B), shown: 31.6, tol: 0.05 },
      { what: 'IRR B', value: pb.irr * 100, shown: 18.3, tol: 0.05 }, { what: 'IRR A', value: pa.irr * 100, shown: 15.4, tol: 0.05 },
      { what: 'payback B', value: pb.payback, shown: 1.4, tol: 0.05 }, { what: 'payback A', value: pa.payback, shown: 2.55, tol: 0.005 },
      { what: 'one crossover', value: x.length, shown: 1, tol: 0 }, { what: 'crossover rate', value: x[0] * 100, shown: 12.5, tol: 0.005 },
      { what: 'mine has two IRRs (questions)', value: irrAll([-1.6, 10, -10]).length, shown: 2, tol: 0 },
    ];
  })(),
};
