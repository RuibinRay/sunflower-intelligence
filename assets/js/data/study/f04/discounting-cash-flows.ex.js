// discounting-cash-flows.ex.js — F04 · Discounting cash flows: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// The note widget starts from COASTLINE_NOTE in case.js ($10,000 at 6%, paid quarterly; 8% market rate in March 2027);
// the NPV widget starts from Ana's fictional cold-brew estimates in discounting-cash-flows.js.
import { COASTLINE_NOTE as N } from './case.js?v=19';

const qInt = N.quarterlyInterest;   // $150

const money = (v) => {
  const c = Math.round(Math.abs(v) * 100) / 100;
  return `${v < 0 && c !== 0 ? '−' : ''}$${c.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const pct = (v, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}%`;
const r2 = (v) => Math.round(v * 100) / 100;
const npvAt = (r, cfs) => cfs.reduce((s, c, t) => s + c / (1 + r) ** t, 0);
const irrOf = (cfs) => { let lo = -0.99, hi = 5; for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (npvAt(m, cfs) > 0) lo = m; else hi = m; } return (lo + hi) / 2; };

export const widgets = {
  'note-value': {
    type: 'formula',
    title: 'What is a fixed-rate note worth?',
    intro: 'A $10,000 note that pays interest every quarter and repays the principal with the last payment, valued by discounting each remaining payment at the market rate.',
    inputs: [
      { id: 'apr', label: 'Market rate (a year, compounded quarterly)', min: 0.5, max: 15, step: 0.25, value: N.marketRateMarch2027, fmt: 'pct' },
      { id: 'coupon', label: 'The note’s own interest rate (a year, paid quarterly)', min: 0, max: 12, step: 0.25, value: N.rate, fmt: 'pct' },
      { id: 'n', label: 'Quarterly payments remaining', min: 1, max: 8, step: 1, value: 4, fmt: 'int' },
    ],
    compute: (v) => {
      const face = N.principal;
      const r = v.apr / 400;
      const c = face * v.coupon / 400;
      const qs = Array.from({ length: v.n }, (_, i) => i + 1);
      const flows = qs.map((t) => c + (t === v.n ? face : 0));
      const pvs = flows.map((f, i) => f / (1 + r) ** (i + 1));
      const value = pvs.reduce((s, x) => s + x, 0);
      const pvPrincipal = face / (1 + r) ** v.n;
      const diff = value - face;
      let note;
      if (Math.abs(v.apr - v.coupon) < 1e-9) note = `The market rate equals the note’s own rate, so the note is worth exactly its face value: the interest it pays is exactly what the market asks for waiting.`;
      else if (v.apr > v.coupon) note = `The market asks ${pct(v.apr)} but the note pays ${pct(v.coupon)}, so it is worth ${money(-diff)} less than its face value. A buyer would pay ${money(value)}; the borrower gains that ${money(-diff)} from its cheaper-than-market loan.`;
      else note = `The note pays ${pct(v.coupon)}, more than the market’s ${pct(v.apr)}, so it is worth ${money(diff)} more than its face value. A buyer would pay a premium for it.`;
      note += ` The final payment supplies ${pct(pvs[v.n - 1] / value * 100, 1)} of the value.`;
      return {
        headline: { label: 'Value of the note today', value: money(value) },
        rows: [
          ['Market rate per quarter', pct(r * 100, 4)],
          ['Interest paid each quarter', money(c)],
          ['Total still promised (undiscounted)', money(c * v.n + face)],
          ['Present value of the interest payments', money(value - pvPrincipal)],
          ['Present value of the $10,000 principal', money(pvPrincipal)],
          ['Value minus face value', `${diff >= 0 ? '+' : '−'}${money(Math.abs(diff))}`],
        ],
        note,
        chart: {
          kind: 'bar',
          x: { label: 'Quarter', values: qs },
          series: [
            { name: 'Cash flow', values: flows.map(r2) },
            { name: 'Present value today', values: pvs.map(r2) },
          ],
          y: { label: 'Dollars' },
        },
      };
    },
  },
  'npv-explorer': {
    type: 'formula',
    title: 'NPV and IRR of the cold-brew system',
    intro: 'Ana’s fictional estimates: −$24,000 now, then $6,000, $8,500, $9,000 and $9,000 at the end of years 1 to 4, plus a resale value at the end of year 4. Scale the yearly estimates up or down and change the rate.',
    inputs: [
      { id: 'rate', label: 'Discount rate (a year)', min: 0, max: 30, step: 0.5, value: 12, fmt: 'pct' },
      { id: 'cost', label: 'Cost today', min: 10000, max: 40000, step: 500, value: 24000, fmt: 'money' },
      { id: 'scale', label: 'Yearly cash as a share of Ana’s estimates', min: 50, max: 150, step: 5, value: 100, fmt: 'pct' },
      { id: 'resale', label: 'Resale value at the end of year 4', min: 0, max: 8000, step: 250, value: 2500, fmt: 'money' },
    ],
    compute: (v) => {
      const s = v.scale / 100;
      const flows = [-v.cost, 6000 * s, 8500 * s, 9000 * s, 9000 * s + v.resale];
      const r = v.rate / 100;
      const npv = npvAt(r, flows);
      const pvIn = npv + v.cost;
      const irr = irrOf(flows) * 100;
      const low = [-v.cost, ...flows.slice(1, 4).map((x) => x * 0.9), 9000 * s * 0.9 + v.resale];
      const rates = Array.from({ length: 16 }, (_, i) => i * 2);
      const verdict = npv > 0.005
        ? `Positive NPV: at ${pct(v.rate, 1)} the brewer adds ${money(npv)} of value in today’s money, and its IRR of ${pct(irr)} is above the rate. Buy, if you trust the estimates.`
        : npv < -0.005
          ? `Negative NPV: at ${pct(v.rate, 1)} the brewer is worth ${money(-npv)} less than it costs, and its IRR of ${pct(irr)} is below the rate. Lantern’s money would do better elsewhere.`
          : 'The NPV is zero: the rate equals the IRR, so the brewer earns exactly the required return.';
      return {
        headline: { label: `NPV at ${pct(v.rate, 1)}`, value: `${npv < 0 ? '−' : '+'}${money(Math.abs(npv))}` },
        rows: [
          ['Present value of the inflows', money(pvIn)],
          ['Cost today', money(v.cost)],
          ['Undiscounted total of the inflows', money(flows.slice(1).reduce((a, b) => a + b, 0))],
          ['Internal rate of return (the rate where NPV = 0)', pct(irr)],
          ['NPV if every yearly cash flow were 10% lower', `${npvAt(r, low) < 0 ? '−' : '+'}${money(Math.abs(npvAt(r, low)))}`],
        ],
        note: verdict,
        chart: {
          kind: 'line',
          x: { label: 'Discount rate (%)', values: rates },
          series: [
            { name: 'NPV', values: rates.map((p) => r2(npvAt(p / 100, flows))) },
            { name: 'Zero (break-even)', values: rates.map(() => 0) },
          ],
          y: { label: 'NPV ($)' },
        },
      };
    },
  },
};

export const guided = [
  {
    id: 'f04-dcf-g1', type: 'steps', kind: 'numerical',
    prompt: 'A fictional language school expects a corporate client to pay $4,000 at the end of year 1, $6,500 at the end of year 2 and $3,000 at the end of year 4 (nothing in year 3). At 8% a year, what is the stream worth today?',
    solution: '4,000 ÷ 1.08 = $3,703.70; 6,500 ÷ 1.08² = $5,572.70; 3,000 ÷ 1.08⁴ = $2,205.09. Total ≈ $11,481.50. The client promises $13,500, but it is worth less today because it arrives over four years.',
    steps: [
      { id: 'f04-dcf-g1-s1', type: 'num', prompt: 'Present value of the $4,000 at the end of year 1, to the nearest cent.',
        answer: 3703.70, check: () => 4000 / 1.08, unit: '$', places: 2, tol: 0.25,
        hints: ['One period at 8%: divide by 1.08.'],
        wrong: [{ value: 4320, say: 'You compounded forward. To bring the amount back to today, divide by 1.08.' }] },
      { id: 'f04-dcf-g1-s2', type: 'num', prompt: 'Present value of the $6,500 at the end of year 2, to the nearest cent.',
        answer: 5572.70, check: () => 6500 / 1.08 ** 2, unit: '$', places: 2, tol: 0.35,
        hints: ['Two periods: divide by 1.08².', '1.08² = 1.1664.'],
        wrong: [{ value: 6018.52, say: 'That discounts for one year only. The $6,500 arrives at the end of year 2.' }] },
      { id: 'f04-dcf-g1-s3', type: 'num', prompt: 'Present value of the $3,000 at the end of year 4, to the nearest cent.',
        answer: 2205.09, check: () => 3000 / 1.08 ** 4, unit: '$', places: 2, tol: 0.16,
        hints: ['Count the periods from the timeline, not the position in the list: it is year 4, not the third payment.', '1.08⁴ = 1.360489.'],
        wrong: [{ value: 2381.5, say: 'That discounts for three years because it is the third payment. It arrives at the end of year 4: divide by 1.08⁴.' }] },
      { id: 'f04-dcf-g1-s4', type: 'num', prompt: 'What is the whole stream worth today, to the nearest cent?',
        answer: 11481.50, check: () => 4000 / 1.08 + 6500 / 1.08 ** 2 + 3000 / 1.08 ** 4, unit: '$', places: 2, tol: 0.6,
        hints: ['All three values are now at time 0, so they can be added.'],
        wrong: [{ value: 13500, say: 'That adds the cash flows as they stand, mixing dollars from different dates. Add the present values instead.' }] },
    ],
  },
  {
    id: 'f04-dcf-g2', type: 'steps', kind: 'applied',
    prompt: 'A fictional hotel can buy a $30,000 laundry system that would save $9,000 a year at the end of years 1, 2 and 3, and $11,000 at the end of year 4 (including $2,000 from selling it). The hotel requires 10% a year on projects like this.',
    solution: 'PV of savings = 9,000 ÷ 1.1 + 9,000 ÷ 1.21 + 9,000 ÷ 1.331 + 11,000 ÷ 1.4641 = 8,181.82 + 7,438.02 + 6,761.83 + 7,513.15 = $29,894.82. NPV = 29,894.82 − 30,000 = −$105.18. Reject on these numbers: the IRR is about 9.84%, just below the 10% required. The decision is close, so small changes in the estimates could reverse it.',
    steps: [
      { id: 'f04-dcf-g2-s1', type: 'num', prompt: 'What is the present value of the four years of savings, to the nearest cent?',
        answer: 29894.82, check: () => 9000 / 1.1 + 9000 / 1.21 + 9000 / 1.331 + 11000 / 1.1 ** 4, unit: '$', places: 2, tol: 2,
        hints: ['Discount each year’s saving by 1.1ᵗ and add.', '8,181.82 + 7,438.02 + 6,761.83 + …; the year-4 amount is $11,000.'],
        wrong: [{ value: 38000, say: 'That adds the savings without discounting. Discount each year’s saving first.' }, { value: 28528.79, say: 'That leaves out the $2,000 resale in year 4. The year-4 cash flow is $11,000.' }] },
      { id: 'f04-dcf-g2-s2', type: 'num', prompt: 'What is the NPV of buying the system, to the nearest cent? Use a minus sign if it is negative.',
        answer: -105.18, check: () => -30000 + 9000 / 1.1 + 9000 / 1.21 + 9000 / 1.331 + 11000 / 1.1 ** 4, unit: '$', places: 2, tol: 2,
        hints: ['NPV = − cost today + PV of the savings.', 'The $30,000 is paid now, so it is not discounted.'],
        wrong: [{ value: 105.18, say: 'Check the sign: the savings are worth less than the cost.' }, { value: 8000, say: 'That ignores discounting (38,000 − 30,000).' }] },
      { id: 'f04-dcf-g2-s3', type: 'mc', prompt: 'What should the hotel decide on these estimates?',
        options: ['Reject: the NPV is slightly negative, so the system earns a little less than the 10% required', 'Accept: the savings ($38,000) exceed the cost ($30,000)', 'Accept: the NPV is close to zero, which is good enough', 'Reject: any project with an NPV under $1,000 should be rejected'],
        answer: 0,
        hints: ['The rule compares the NPV with zero.'],
        feedback: {
          1: 'Undiscounted savings ignore the time value of money. Discounted at 10%, they fall short of the cost.',
          2: 'A slightly negative NPV still means the money would earn more elsewhere at similar risk. It is close, so the hotel might test its estimates, but on these numbers it rejects.',
          3: 'There is no such threshold: any positive NPV adds value. This one is negative.',
        } },
    ],
  },
  {
    id: 'f04-dcf-g3', type: 'steps', kind: 'numerical',
    prompt: 'A fictional project costs $5,000 today and returns $1,500, $2,000 and $2,500 at the end of years 1, 2 and 3. Estimate its IRR by trial.',
    solution: 'NPV at 8% = −5,000 + 1,388.89 + 1,714.68 + 1,984.58 ≈ +$88.15. NPV at 12% = −5,000 + 1,339.29 + 1,594.39 + 1,779.45 ≈ −$286.88 (from unrounded values). Interpolating: 8% + 4% × 88.15 ÷ (88.15 + 286.88) = 8.94%. The exact IRR, from a spreadsheet, is 8.90%: interpolation overshoots slightly.',
    steps: [
      { id: 'f04-dcf-g3-s1', type: 'num', prompt: 'NPV at 8%, to the nearest cent.',
        answer: 88.15, check: () => -5000 + 1500 / 1.08 + 2000 / 1.08 ** 2 + 2500 / 1.08 ** 3, unit: '$', places: 2, tol: 0.5,
        hints: ['Discount each inflow at 8% and subtract the $5,000.'],
        wrong: [{ value: 1000, say: 'That ignores discounting (6,000 − 5,000).' }] },
      { id: 'f04-dcf-g3-s2', type: 'num', prompt: 'NPV at 12%, to the nearest cent. Use a minus sign if it is negative.',
        answer: -286.88, check: () => -5000 + 1500 / 1.12 + 2000 / 1.12 ** 2 + 2500 / 1.12 ** 3, unit: '$', places: 2, tol: 0.5,
        hints: ['Same method with 1.12.', 'A higher rate gives a lower NPV.'],
        wrong: [{ value: 286.88, say: 'Check the sign: at 12% the inflows are worth less than $5,000.' }] },
      { id: 'f04-dcf-g3-s3', type: 'num', prompt: 'Interpolate between the two trial rates to estimate the IRR. Give a percentage to two decimal places.',
        answer: 8.94, check: () => { const a = -5000 + 1500 / 1.08 + 2000 / 1.08 ** 2 + 2500 / 1.08 ** 3; const b = -5000 + 1500 / 1.12 + 2000 / 1.12 ** 2 + 2500 / 1.12 ** 3; return 8 + 4 * a / (a - b); }, unit: '%', places: 2, tol: 0.05,
        hints: ['IRR ≈ r_L + (r_H − r_L) × NPV_L ÷ (NPV_L − NPV_H).', '8 + 4 × 88.15 ÷ (88.15 + 286.88).'],
        wrong: [{ value: 10, say: 'That is the midpoint of 8% and 12%. The NPV is much closer to zero at 8%, so the IRR is much closer to 8%.' }, { value: 11.06, say: 'You measured the fraction from the wrong end. Start from the lower rate, where the NPV is positive.' }] },
    ],
  },
  {
    id: 'f04-dcf-g4', type: 'num', kind: 'applied',
    prompt: 'An analyst types =NPV(10%, B1:B4) into a spreadsheet, where B1 holds −20,000 (paid today) and B2:B4 hold 9,000, 9,000 and 8,000 (received at the end of years 1, 2 and 3). The cell shows 1,482.14. What is the correct NPV? Give dollars and cents.',
    answer: 1630.35, check: () => -20000 + 9000 / 1.1 + 9000 / 1.21 + 8000 / 1.331, unit: '$', places: 2, tol: 1.3,
    hints: ['Excel’s NPV treats the first value in the range as arriving one period from now.', 'Correct formula: =B1 + NPV(10%, B2:B4); or multiply the shown result by 1.10.'],
    wrong: [
      { value: 1482.14, say: 'That is the spreadsheet’s figure, which discounts the time-0 cost (and everything else) one period too many.' },
      { value: 6000, say: 'That ignores discounting altogether (26,000 − 20,000).' },
    ],
    solution: 'Correct NPV = −20,000 + 9,000 ÷ 1.1 + 9,000 ÷ 1.21 + 8,000 ÷ 1.331 = −20,000 + 8,181.82 + 7,438.02 + 6,010.52 ≈ $1,630.35. The spreadsheet’s 1,482.14 is exactly 1,630.35 ÷ 1.10. The fix is =B1 + NPV(10%, B2:B4).',
  },
];

export const independent = [
  {
    id: 'f04-dcf-i1', type: 'num', kind: 'numerical',
    prompt: 'You deposit $2,000 today, $3,000 in one year and $1,500 in three years in an account paying 5% a year, compounded annually. What is the balance at the end of year 4? Give dollars and cents.',
    answer: 7478.89, check: () => 2000 * 1.05 ** 4 + 3000 * 1.05 ** 3 + 1500 * 1.05, unit: '$', places: 2, tol: 0.4,
    wrong: [
      { value: 6500, say: 'That adds the deposits without interest. Compound each one forward to year 4.' },
      { value: 7403.89, say: 'You left the last deposit uncompounded. It is made at year 3, so it earns one year of interest before year 4.' },
    ],
    solution: 'Comparison date: year 4. 2,000 × 1.05⁴ = $2,431.01; 3,000 × 1.05³ = $3,472.88; 1,500 × 1.05 = $1,575.00. Balance = $7,478.89.',
  },
  {
    id: 'f04-dcf-i2', type: 'num', kind: 'applied',
    prompt: 'Suppose that in March 2027 similar loans cost 5% a year compounded quarterly instead of 8%. What would Lantern’s Coastline note (four quarterly payments of $150, the last one with the $10,000 principal) be worth? Give dollars and cents.',
    answer: 10096.95, check: () => qInt / 1.0125 + qInt / 1.0125 ** 2 + qInt / 1.0125 ** 3 + (qInt + N.principal) / 1.0125 ** 4, unit: '$', places: 2, tol: 0.5,
    wrong: [
      { value: 9809.61, say: 'That is the value at 8%. Use 5% ÷ 4 = 1.25% a quarter.' },
      { value: 10000, say: 'That is the value at the note’s own 6%. At 5% the note pays more than the market asks, so it is worth more than face value.' },
      { value: 8758.92, say: 'That discounts at 5% per quarter. A rate of 5% a year compounded quarterly is 1.25% per quarter.' },
    ],
    solution: 'r = 5% ÷ 4 = 1.25% a quarter. Value = 150 ÷ 1.0125 + 150 ÷ 1.0125² + 150 ÷ 1.0125³ + 10,150 ÷ 1.0125⁴ = 148.15 + 146.32 + 144.51 + 9,657.97 ≈ $10,096.95: above face value, because the note’s 6% beats the market’s 5%.',
  },
  {
    id: 'f04-dcf-i3', type: 'mc', kind: 'conceptual',
    prompt: 'In March 2027 Lantern’s note, which pays 6% a year, is worth $9,809.61 when similar loans cost 8%. Why is it worth less than its $10,000 face value?',
    options: [
      'Its payments are fixed at 6%, below the 8% the market now pays for waiting, so they are worth less when discounted at 8%',
      'Lantern has become more likely to default',
      'Part of the principal has already been repaid',
      'Interest payments are never counted in a note’s value',
    ],
    answer: 0,
    feedback: {
      1: 'The value fell because the market rate rose. Nothing in the case says Lantern is riskier; the same note would be worth $10,000 at 6%.',
      2: 'The note is interest-only: the full $10,000 is still owed until 1 March 2028.',
      3: 'The interest payments are part of the value: here $571.16 of it.',
    },
    solution: 'Discounting the remaining payments at the 8% market rate gives $9,809.61. A buyer who can earn 8% elsewhere would pay no more. The note is worth less than face value because its fixed rate is below the market rate; at 6% it would be worth exactly $10,000.',
  },
  {
    id: 'f04-dcf-i4', type: 'num', kind: 'numerical',
    prompt: 'A fictional client will pay $5,000 in 3 months, $5,000 in 6 months and $10,000 in 12 months. At an effective rate of 10% a year, what are the payments worth today? Give dollars and cents.',
    answer: 18740.49, check: () => 5000 / 1.1 ** 0.25 + 5000 / 1.1 ** 0.5 + 10000 / 1.1, unit: '$', places: 2, tol: 0.6,
    wrong: [
      { value: 18696.63, say: 'That uses 2.5% a quarter, which treats 10% as a rate compounded quarterly. An effective 10% a year is about 2.41% a quarter: (1.1)^(1/4) − 1.' },
      { value: 20000, say: 'That adds the payments without discounting.' },
    ],
    solution: 'With t in years and the effective rate: 5,000 ÷ 1.1^0.25 + 5,000 ÷ 1.1^0.5 + 10,000 ÷ 1.1 = 4,882.27 + 4,767.31 + 9,090.91 ≈ $18,740.49. Equivalently, use the quarterly rate 1.1^(1/4) − 1 = 2.4114% for 1, 2 and 4 quarters.',
  },
  {
    id: 'f04-dcf-i5', type: 'classify', kind: 'applied',
    prompt: 'A fictional company requires 11% a year on projects of normal risk. Each project below has conventional cash flows (a cost now, then inflows). Accept or reject each?',
    items: [
      'Project W: NPV at 11% is +$2,300',
      'Project X: IRR is 9%',
      'Project Y: IRR is 14%',
      'Project Z: NPV at 11% is −$150',
    ],
    categories: ['Accept', 'Reject'],
    answer: [0, 1, 0, 1],
    feedback: {
      0: 'A positive NPV at the required rate means the project adds value.',
      1: 'An IRR below the required 11% means a negative NPV at 11%.',
      2: 'An IRR above 11% means the NPV at 11% is positive, for a conventional project.',
      3: 'A negative NPV, however small, means the money earns more elsewhere at similar risk.',
    },
    solution: 'Accept W and Y; reject X and Z. For conventional projects, “NPV > 0 at the required rate” and “IRR > the required rate” are the same test.',
  },
  {
    id: 'f04-dcf-i6', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional retailer can use one site for only one of two projects. Project A has an NPV of $12,000 and an IRR of 18%; project B has an NPV of $15,000 and an IRR of 14%. Both are discounted at its 10% required return. Which should it choose?',
    options: [
      'B, because it adds more value: its NPV is higher',
      'A, because its IRR is higher',
      'A, because a higher IRR always means a higher NPV',
      'Either: both clear the 10% hurdle, so they are equally good',
    ],
    answer: 0,
    feedback: {
      1: 'IRR measures the rate of return, not the amount of value created. B is larger and adds $3,000 more in today’s money.',
      2: 'Not when projects differ in size or timing: here the lower-IRR project has the higher NPV.',
      3: 'Both are acceptable on their own, but only one can be chosen, and B adds $3,000 more.',
    },
    solution: 'When options exclude each other, choose the higher NPV: B. The NPV is the value added in dollars at the required return; the IRR is a rate, which can favour small projects with high percentage returns.',
  },
];

export const check = [
  {
    id: 'f04-dcf-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A conventional project (a cost now, then inflows) has an NPV of +$4,000 at a 10% discount rate. What does that mean?',
    options: [
      'It earns more than 10% a year: it is worth $4,000 more, in today’s money, than it costs',
      'It will make a profit of $4,000 over its life: its inflows, added up, exceed its cost by that amount',
      'It earns exactly 10% a year, because a positive NPV means the project just meets the discount rate',
      'Its IRR is $4,000',
    ],
    answer: 0,
    feedback: {
      1: 'NPV is not an accounting profit or an undiscounted total: it is the value added after allowing for the 10% the money could earn elsewhere.',
      2: 'A project earning exactly 10% would have an NPV of zero at 10%.',
      3: 'The IRR is a rate, not a dollar amount; it is above 10% here.',
    },
    solution: 'NPV is the present value of all the cash flows at the required return. +$4,000 means the project returns more than 10% and adds $4,000 of value in today’s dollars, so the IRR is above 10%.',
  },
  {
    id: 'f04-dcf-k2', type: 'num', kind: 'numerical',
    prompt: 'A stream pays $1,200 at the end of year 1, nothing in year 2 and $2,500 at the end of year 3. At 6% a year, what is it worth today? Give dollars and cents.',
    answer: 3231.12, check: () => 1200 / 1.06 + 2500 / 1.06 ** 3, unit: '$', places: 2, tol: 0.2,
    wrong: [
      { value: 3357.07, say: 'That discounts the $2,500 for two years because it is the second payment. It arrives at the end of year 3.' },
      { value: 3700, say: 'That adds the payments without discounting.' },
      { value: 3106.59, say: 'That discounts the whole $3,700 for three years. The $1,200 arrives after one year.' },
    ],
    solution: '1,200 ÷ 1.06 = $1,132.08; 2,500 ÷ 1.06³ = $2,099.05. PV ≈ $3,231.12. The empty year 2 still counts as a period.',
  },
  {
    id: 'f04-dcf-k3', type: 'num', kind: 'applied',
    prompt: 'A fictional food-truck business can buy a second truck for $45,000. It expects net cash inflows of $15,000, $18,000 and $20,000 at the end of years 1 to 3, and nothing after that. It requires 14% a year. What is the NPV? Give dollars and cents, with a minus sign if it is negative.',
    answer: -4492.26, check: () => -45000 + 15000 / 1.14 + 18000 / 1.14 ** 2 + 20000 / 1.14 ** 3, unit: '$', places: 2, tol: 2.7,
    wrong: [
      { value: 8000, say: 'That ignores discounting (53,000 − 45,000). Discount each inflow at 14%.' },
      { value: 40507.74, say: 'That is the present value of the inflows. Subtract the $45,000 cost.' },
      { value: -1461.31, say: 'That uses 10%. The business requires 14%.' },
    ],
    solution: 'PV of inflows = 15,000 ÷ 1.14 + 18,000 ÷ 1.14² + 20,000 ÷ 1.14³ = 13,157.89 + 13,850.42 + 13,499.43 = $40,507.74. NPV = 40,507.74 − 45,000 ≈ −$4,492.26. Reject: the inflows exceed the cost in dollars, but not once the 14% required return is allowed for (the IRR is about 8.2%).',
  },
  {
    id: 'f04-dcf-k4', type: 'mc', kind: 'applied',
    prompt: 'A fictional university’s finance office requires 9% a year on energy-saving projects. A boiler replacement costs money now and saves money each year for 15 years, and its IRR is 11%. What should the office conclude?',
    options: [
      'Accept: for a conventional project, an IRR above the required return means a positive NPV at that return',
      'Reject: an IRR of 11% means the project loses 11% a year',
      'Accept only if the IRR is above 15%, the life of the project',
      'It cannot be decided without calculating the NPV, because IRR and NPV often disagree for single projects like this',
    ],
    answer: 0,
    feedback: {
      1: 'The IRR is the return the project earns, not a loss.',
      2: 'The IRR is compared with the required return, not with the project’s life.',
      3: 'For a single conventional project (cost first, then savings) the two rules always agree. They can disagree when choosing between exclusive projects or when cash flows change sign more than once.',
    },
    solution: 'The project earns 11% a year against a required 9%, so its NPV at 9% is positive: accept. Calculating the NPV is still useful, because it says how much value the project adds.',
  },
  {
    id: 'f04-dcf-k5', type: 'num', kind: 'numerical',
    prompt: 'An investment costs $2,000 today and pays $1,100 at the end of year 1 and $1,210 at the end of year 2. What is its IRR? Give a percentage to one decimal place.',
    answer: 10, check: () => { const f = (r) => -2000 + 1100 / (1 + r) + 1210 / (1 + r) ** 2; let lo = 0, hi = 1; for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; } return lo * 100; }, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 15.5, say: 'That is the total gain over two years (310 ÷ 2,000). The IRR is a rate per year that makes the NPV zero.' },
      { value: 7.75, say: 'That spreads the $310 gain evenly over two years (simple interest). Try 10%: 1,100 ÷ 1.1 + 1,210 ÷ 1.21 = 1,000 + 1,000.' },
    ],
    solution: 'Try 10%: 1,100 ÷ 1.10 + 1,210 ÷ 1.21 = 1,000 + 1,000 = 2,000, so the NPV is exactly zero and the IRR is 10.0%.',
  },
  {
    id: 'f04-dcf-k6', type: 'mc', kind: 'conceptual',
    prompt: 'A spreadsheet holds a project’s cash flows in A1:A6, with A1 the cost paid today. Someone calculates =NPV(8%, A1:A6). Compared with the true NPV, the result is:',
    options: [
      'The true NPV divided by 1.08: every cash flow, today’s cost included, is discounted one period too many',
      'Exactly right, because NPV() includes the first value at time 0',
      'Too high by the amount of today’s cost, because NPV() skips the first value in the range and starts at A2',
      'The true NPV multiplied by 1.08, because NPV() treats every cash flow as arriving one period earlier than it does',
    ],
    answer: 0,
    feedback: {
      1: 'Excel’s NPV() treats the first value as arriving at the end of period 1, not at time 0.',
      2: 'NPV() does not skip the first value; it discounts it by one period.',
      3: 'Discounting everything one extra period divides the result by 1.08; it does not multiply it.',
    },
    solution: 'NPV() assumes value1 is one period away. Shifting every cash flow one period later divides the whole NPV by 1.08. The fix is =A1 + NPV(8%, A2:A6).',
  },
];
