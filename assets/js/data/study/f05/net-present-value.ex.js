// net-present-value.ex.js — F05 · Net present value: widgets, practice and the knowledge check (answer keys live here).
// Every number is recomputed by `check` (see ../AUTHORING.md). The widgets start from the cargo bike in PROPOSALS and
// Ana’s 11% working rate (case.js); every other business here is fictional.
import { PROPOSALS, WORKING_RATE } from './case.js?v=28';
import { npv } from '../../../core/invest.js?v=28';
import { isoToSerial } from '../../../core/sheet.js?v=28';

const bike = PROPOSALS.find((p) => p.name === 'Electric cargo bike for deliveries');
const R = WORKING_RATE * 100;                                       // 11
const af = (r, n) => (1 - (1 + r) ** -n) / r;
const money = (v) => `${v < 0 ? '−' : ''}$${Math.round(Math.abs(v)).toLocaleString('en-US')}`;
const pct = (v, d = 1) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}%`;
const r0 = (v) => Math.round(v);
const M = '$#,##0';
const dayDiff = (a, b) => (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 864e5;

// the fictional dental practice’s scanner (XNPV item)
const SCAN = [['2028-05-01', -42000], ['2028-12-31', 6500], ['2029-12-31', 13000], ['2030-12-31', 13000], ['2031-12-31', 13000], ['2032-04-30', 9000]];
const scanXnpv = (rate) => SCAN.reduce((s, [d, v]) => s + v / (1 + rate) ** (dayDiff(SCAN[0][0], d) / 365), 0);

export const widgets = {
  'npv-level': {
    type: 'capbudget',
    title: 'NPV of a project with a level yearly cash flow',
    inputs: [
      { id: 'outlay', label: 'Outlay today', min: 1000, max: 40000, step: 500, value: bike.outlay, fmt: 'money' },
      { id: 'saving', label: 'Cash flow at the end of each year (after tax)', min: 0, max: 10000, step: 100, value: bike.saving, fmt: 'money' },
      { id: 'life', label: 'Years of cash flows', min: 1, max: 15, step: 1, value: bike.life, fmt: 'int', unit: 'years' },
      { id: 'rate', label: 'Opportunity cost of capital', min: 0, max: 25, step: 0.5, value: R, fmt: 'pct' },
    ],
    model: (v) => ({ capex: v.outlay, years: v.life, revenue: Array(v.life).fill(v.saving), variable: Array(v.life).fill(0), fixed: 0, dep: [], tax: 0 }),
    rate: 'rate',
    show: ['profile'],
    profileMax: 0.3,
    note: 'The cash flows are entered after tax, so the model’s tax rate is set to zero. The profile marks the rate you have chosen; where the curve crosses zero is the project’s internal rate of return, the subject of the next lesson.',
  },
  'spend-now-later': {
    type: 'formula',
    title: 'Spend now or later: why every owner wants a positive NPV',
    intro: 'An owner with some wealth today can invest in a one-year project and can borrow or lend at the market rate. Each line shows the most she can spend in a year for each amount she spends today. All figures are illustrative.',
    inputs: [
      { id: 'w', label: 'Owner’s wealth today', min: 0, max: 30000, step: 500, value: 10000, fmt: 'money' },
      { id: 'cost', label: 'Project cost today', min: 1000, max: 15000, step: 250, value: 5000, fmt: 'money' },
      { id: 'payoff', label: 'Project payoff in one year', min: 0, max: 25000, step: 100, value: 5800, fmt: 'money' },
      { id: 'rate', label: 'Market rate for borrowing and lending', min: 0, max: 25, step: 0.5, value: R, fmt: 'pct' },
    ],
    compute: (v) => {
      const r = v.rate / 100, value = v.payoff / (1 + r) - v.cost;
      const nowW = v.w, nowP = Math.max(0, v.w + value);
      const top = Math.max(nowW, nowP);
      const xs = Array.from({ length: 11 }, (_, i) => r0((top * i) / 10));
      const without = xs.map((c) => r0(Math.max(0, (nowW - c) * (1 + r))));
      const withP = xs.map((c) => r0(Math.max(0, (nowP - c) * (1 + r))));
      let note;
      if (value > 0.5) note = `NPV ${money(value)}: whatever she prefers, she can do better with the project. Spending everything today she gets ${money(nowP)} instead of ${money(nowW)}; spending nothing today she has ${money(nowP * (1 + r))} in a year instead of ${money(nowW * (1 + r))}. Every point on the line without the project lies under the line with it.`;
      else if (value < -0.5) note = `NPV ${money(value)}: the project returns ${pct(((v.payoff / v.cost) - 1) * 100)}, less than the ${pct(v.rate)} she can earn by lending. She does better in every case without it.${v.w + value < 0 ? ' Its loss is larger than her wealth, so with it she could not even spend nothing today and repay what she owes.' : ''}`;
      else note = 'NPV of about zero: the project earns exactly the market rate, so it neither helps nor hurts.';
      return {
        headline: { label: `NPV at ${pct(v.rate)}`, value: money(value) },
        rows: [
          ['Project’s rate of return', pct(((v.payoff / v.cost) - 1) * 100)],
          ['Most she can spend today, without / with the project', `${money(nowW)} / ${money(nowP)}`],
          ['Most she can spend in a year, without / with the project', `${money(nowW * (1 + r))} / ${money(nowP * (1 + r))}`],
        ],
        note,
        chart: { kind: 'line', x: { label: 'Spent today ($)', values: xs }, series: [{ name: 'Without the project', values: without }, { name: 'With the project', values: withP }], y: { label: 'Can spend in a year ($)' } },
      };
    },
  },
};

const bikeSheet = {
  cells: { A1: 'Discount rate', B1: WORKING_RATE, A3: 'Year', B3: 'Cash flow', A4: 0, A5: 1, A6: 2, A7: 3, A8: 4, A9: 5, B4: -bike.outlay, B5: bike.saving, B6: bike.saving, B7: bike.saving, B8: bike.saving, B9: bike.saving, A11: 'NPV' },
  fixed: ['A4:A9'],
};
const scanCells = { A1: 'Discount rate', B1: 0.08, A3: 'Date', B3: 'Cash flow', A11: 'NPV on 1 May 2028' };
SCAN.forEach(([d, v], i) => { scanCells[`A${4 + i}`] = isoToSerial(d); scanCells[`B${4 + i}`] = v; });

export const guided = [
  {
    id: 'f05-npv-g1', type: 'steps', kind: 'numerical',
    prompt: 'A fictional bakery can replace its oven for $18,000. The new oven would save $4,100 a year after tax (energy and spoiled batches) at the end of each of the next six years, with no resale value. The bakery’s opportunity cost of capital is 10% a year.',
    solution: 'Annuity factor (10%, 6 years) = (1 − 1.1⁻⁶) ÷ 0.1 = 4.355261. PV of savings = 4,100 × 4.355261 ≈ $17,857. NPV = 17,857 − 18,000 ≈ −$143. Reject on these estimates: the oven earns a little under 10% a year. The NPV is small relative to the cost, so the estimates deserve a second look before the decision is final.',
    steps: [
      { id: 'f05-npv-g1-s1', type: 'num', prompt: 'What are the six years of savings worth today? Give whole dollars.',
        answer: 17857, check: () => 4100 * af(0.10, 6), unit: '$', places: 0, tol: 1,
        hints: ['The savings are a level annuity: saving × annuity factor.', 'Annuity factor = (1 − 1.1⁻⁶) ÷ 0.1 = 4.355261.'],
        wrong: [{ value: 24600, say: 'That adds the savings without discounting. Multiply $4,100 by the annuity factor at 10% instead.' }] },
      { id: 'f05-npv-g1-s2', type: 'num', prompt: 'What is the oven’s NPV? Give whole dollars, with a minus sign if it is negative.',
        answer: -143, check: () => -18000 + 4100 * af(0.10, 6), unit: '$', places: 0, tol: 1,
        hints: ['NPV = PV of the savings − the outlay today.'],
        wrong: [{ value: 143, say: 'Check the sign: the savings are worth less than the $18,000 the oven costs.' }, { value: 6600, say: 'That is 24,600 − 18,000, which ignores the time value of money.' }] },
      { id: 'f05-npv-g1-s3', type: 'mc', prompt: 'What should the bakery conclude?',
        options: [
          'Reject: on these estimates the oven earns a little under 10%',
          'Accept: the savings add up to more than the oven’s cost',
          'Accept: an NPV this close to zero counts as breaking even',
          'Reject, because any project with an NPV below $1,000 destroys value',
        ],
        answer: 0,
        hints: ['Compare the NPV with zero, not with some other threshold.'],
        feedback: {
          1: 'Undiscounted savings ignore the 10% the money could earn elsewhere; discounted, they fall short.',
          2: 'An NPV of zero would mean earning exactly 10%. A negative NPV, however small, means earning less.',
          3: 'There is no $1,000 threshold: a positive NPV of $1 adds value. This one is negative.',
        } },
    ],
  },
  {
    id: 'f05-npv-g2', type: 'mc', kind: 'conceptual',
    prompt: 'Lantern could pay for the ordering kiosks from its line of credit, which charges 9%, or from cash that would otherwise sit in a deposit account earning 3%. Ana’s estimate of the expected return on investments as risky as the kiosks’ savings is 11%. Which rate should she use to discount the kiosks’ savings?',
    options: [
      '11%, the expected return available elsewhere at the same risk',
      '9%, because that is what the money would actually cost Lantern',
      '3%, because that is what Lantern’s cash would otherwise earn',
      'The average of 9% and 3%, because the money could come from either source',
    ],
    answer: 0,
    hints: ['The rate should match the risk of the cash flows being discounted.', 'Neither the loan nor the deposit is as risky as a café’s savings from kiosks.'],
    feedback: {
      1: 'The line of credit’s 9% prices a bank’s fairly safe claim on Lantern, not the risk of the kiosks’ savings. How a project is financed does not change its risk.',
      2: 'A deposit is almost riskless. Investing in the kiosks takes on more risk than leaving cash in the bank, so it must beat the return on investments of the same risk.',
      3: 'Averaging financing rates mixes two claims, neither of which has the kiosks’ risk.',
    },
    solution: 'The opportunity cost of capital is the expected return investors give up at the same risk: 11% on Ana’s estimate. The 9% and 3% belong to claims (a bank loan, a deposit) that are safer than the kiosks’ savings.',
  },
  {
    id: 'f05-npv-g3', type: 'formula', kind: 'applied',
    prompt: 'The sheet holds the cargo bike’s cash flows: the outlay at year 0 in B4 and the savings for years 1 to 5 in B5:B9, with Ana’s discount rate in B1. In B11, write a formula for the bike’s NPV.',
    sheet: bikeSheet, cell: 'B11', view: 'A1:B11', widths: { A: 16, B: 13 }, formats: { B1: '0.0%', B4: M, B5: M, B6: M, B7: M, B8: M, B9: M, B11: M },
    answer: '=B4+NPV(B1,B5:B9)',
    alt: ['=NPV(B1,B5:B9)+B4', '=SUM(B4,NPV(B1,B5:B9))'],
    require: ['NPV'],
    wrong: [
      { formula: '=NPV(B1,B4:B9)', say: 'Excel’s NPV() treats its first value as one period away, so this discounts the outlay, and every saving, one year too many: the answer is the true NPV ÷ 1.11. Leave B4 out of the range and add it outside.' },
      { formula: '=NPV(B1,B5:B9)', say: 'That is the present value of the savings alone. Add the outlay in B4 (it is negative) to get the NPV.' },
      { formula: '=B4+NPV(B1,B4:B9)', say: 'The outlay is counted twice: once outside the function and once (discounted) inside it. The range should start at B5.' },
    ],
    hints: ['NPV() discounts its first value by one period, so it should start with year 1.', 'Add the year-0 cash flow outside the function: =B4+NPV(…).'],
    solution: '<x>=B4+NPV(B1,B5:B9)</x> gives about $1,001. NPV() values years 1 to 5 (about $8,501), and the outlay at year 0 is added as it stands, since it is already in today’s money.',
  },
  {
    id: 'f05-npv-g4', type: 'steps', kind: 'applied',
    prompt: 'The fictional owner of a food truck can buy a coffee machine for $5,000 today that would bring in $5,800 of extra cash, after tax, in one year. She can borrow or lend at 11% a year for risks like this.',
    solution: 'NPV = 5,800 ÷ 1.11 − 5,000 ≈ $225. She could borrow 5,800 ÷ 1.11 ≈ $5,225 today against the payoff, buy the machine and spend the $225 now; the $5,800 repays the loan exactly. If she prefers to spend later, she buys the machine with her own money and is $5,800 − 5,000 × 1.11 = $250 better off in a year than if she had lent the $5,000 at 11%: the NPV of $225 grown by 11%.',
    steps: [
      { id: 'f05-npv-g4-s1', type: 'num', prompt: 'What is the project’s NPV? Give dollars and cents.',
        answer: 225.23, check: () => 5800 / 1.11 - 5000, unit: '$', places: 2, tol: 0.05,
        hints: ['Discount the $5,800 one year at 11% and subtract the cost.'],
        wrong: [{ value: 800, say: 'That ignores the 11% the $5,000 could earn elsewhere.' }] },
      { id: 'f05-npv-g4-s2', type: 'num', prompt: 'How much could she borrow today at 11% if the $5,800 must repay the loan, interest included, in one year? Give dollars and cents.',
        answer: 5225.23, check: () => 5800 / 1.11, unit: '$', places: 2, tol: 0.05,
        hints: ['A loan repaid with $5,800 in one year at 11% is worth 5,800 ÷ 1.11 today.'],
        wrong: [{ value: 5162, say: 'That subtracts 11% of $5,800. The loan is the present value: divide by 1.11.' }] },
      { id: 'f05-npv-g4-s3', type: 'num', prompt: 'Suppose instead she wants to spend nothing extra today. Compared with lending her $5,000 at 11%, how much more can she spend in one year by investing in the machine? Give whole dollars.',
        answer: 250, check: () => 5800 - 5000 * 1.11, unit: '$', places: 0, tol: 0.5,
        hints: ['Lending $5,000 at 11% gives $5,550 in a year.', 'Compare $5,800 with $5,550; equivalently, grow the NPV by 11%.'],
        wrong: [{ value: 225, say: 'That is the gain in today’s money. In a year it is worth 225.23 × 1.11.' }, { value: 800, say: 'That compares with keeping the $5,000 in a drawer. The alternative is lending it at 11%.' }] },
    ],
  },
];

export const independent = [
  {
    id: 'f05-npv-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional bookshop café can refit its seating area for $25,000 today. It expects extra cash flows after tax of $6,000, $8,000, $9,000, $9,000 and $7,000 at the end of years 1 to 5. Its opportunity cost of capital is 12%. What is the NPV? Give whole dollars, with a minus sign if it is negative.',
    answer: 2832, check: () => npv(0.12, [-25000, 6000, 8000, 9000, 9000, 7000]), unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 14000, say: 'That adds the cash flows without discounting. Discount each one at 12% for its own number of years.' },
      { value: 2529, say: 'That discounts the outlay as well (Excel’s NPV() over all six values). The outlay is paid today and is not discounted.' },
    ],
    solution: 'Discount each inflow: 6,000 ÷ 1.12 + 8,000 ÷ 1.12² + 9,000 ÷ 1.12³ + 9,000 ÷ 1.12⁴ + 7,000 ÷ 1.12⁵ = 5,357.14 + 6,377.55 + 6,406.02 + 5,719.66 + 3,971.99 ≈ $27,832. NPV ≈ 27,832 − 25,000 ≈ $2,832. Accept: the refit earns more than 12% a year.',
  },
  {
    id: 'f05-npv-i2', type: 'mc', kind: 'applied',
    prompt: 'A fictional hotel’s managers propose a “guest experience programme” with an NPV of +$9,000 at the hotel’s 10% rate. It has two parts that could be done separately: a new booking system (NPV +$12,500) and a rooftop bar (NPV −$3,500). What should the hotel do?',
    options: [
      'Approve the booking system on its own',
      'Approve the whole programme, since its NPV is positive',
      'Reject the whole programme, since one part loses value',
      'Approve the whole programme if the bar’s rate of return is above zero',
    ],
    answer: 0,
    feedback: {
      1: 'The programme is positive only because the booking system carries the bar. Value additivity says the programme without the bar is worth $12,500, more than $9,000.',
      2: 'The booking system adds $12,500 on its own; rejecting it throws that away.',
      3: 'A positive rate of return is not enough: the bar must beat the 10% available elsewhere at the same risk, and its negative NPV says it does not.',
    },
    solution: 'NPV(programme) = 12,500 − 3,500 = $9,000. Since the parts can be separated, take only the part with a positive NPV: the booking system adds $12,500, and the bar would take $3,500 of it away.',
  },
  {
    id: 'f05-npv-i3', type: 'formula', kind: 'applied',
    prompt: 'A fictional dental practice buys a scanner on 1 May 2028 and expects the cash flows in B4:B9 on the dates in A4:A9 (the last includes its resale value). Its opportunity cost of capital, an effective annual rate, is in B1. In B11, write a formula for the scanner’s NPV on 1 May 2028 that uses the actual dates.',
    sheet: { cells: scanCells }, cell: 'B11', view: 'A1:B11', widths: { A: 18, B: 13 }, formats: { A: 'date', B1: '0.0%', B4: M, B5: M, B6: M, B7: M, B8: M, B9: M, B11: M },
    answer: '=XNPV(B1,B4:B9,A4:A9)',
    require: ['XNPV'],
    wrong: [
      { formula: '=B4+NPV(B1,B5:B9)', say: 'That treats the inflows as exactly one year apart, from 1 May 2029. The first arrives after eight months and the last after four years: use XNPV with the dates.' },
      { formula: '=XNPV(B1,B5:B9,A5:A9)', say: 'That discounts to 31 December 2028 and leaves out the outlay. Include the 1 May 2028 outlay and its date, so the first date is the valuation date.' },
    ],
    solution: '<x>=XNPV(B1,B4:B9,A4:A9)</x> discounts each amount by 1.08 raised to (days since 1 May 2028 ÷ 365); the outlay on the first date is not discounted. The NPV is about $2,612: buy the scanner.',
  },
  {
    id: 'f05-npv-i4', type: 'num', kind: 'numerical',
    prompt: 'A fictional laundrette can install new machines for $30,000. They would save $8,000 a year after tax for 5 years, the savings arriving evenly through each year. At 10%, what is the NPV under the mid-year convention? Give whole dollars.',
    answer: 1806, check: () => 8000 * af(0.10, 5) * 1.1 ** 0.5 - 30000, unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 326, say: 'That treats each saving as arriving at the end of its year. Under the mid-year convention, multiply the PV of the savings by 1.1^0.5.' },
      { value: 3359, say: 'That moves the savings a whole year earlier (start of each year). The mid-year convention moves them half a year: (1.1)^0.5.' },
    ],
    solution: 'Year-end PV of the savings = 8,000 × 3.790787 = $30,326. Mid-year: 30,326 × 1.1^0.5 = 30,326 × 1.048809 ≈ $31,806. NPV ≈ 31,806 − 30,000 ≈ $1,806. The year-end convention gives only $326, so the convention matters for a project this close to zero.',
  },
  {
    id: 'f05-npv-i5', type: 'classify', kind: 'conceptual',
    prompt: 'Ana is choosing the rate to discount the cargo bike’s savings. Which of these bear on the right rate, and which do not?',
    items: [
      'The risk of the bike’s savings',
      'The interest rate Coastline Bank charges on Lantern’s line of credit',
      'The expected return on listed firms whose cash flows are as risky as the bike’s savings',
      'The 20% return Ana would like Lantern to earn on everything',
      'The rate Lantern’s cash earns in a deposit account',
    ],
    categories: ['Bears on the rate', 'Does not bear on it'],
    answer: [0, 1, 0, 1, 1],
    feedback: {
      0: 'The opportunity cost of capital depends on the risk of the cash flows being discounted.',
      1: 'How the bike is financed does not change how risky its savings are; the loan rate prices the bank’s claim.',
      2: 'This is exactly the comparison: what investors could expect elsewhere at the same risk.',
      3: 'A wish is not a market rate. Using it would reject projects that beat what investors can earn elsewhere.',
      4: 'A deposit is almost riskless, so its rate is too low for a risky project.',
    },
    solution: 'The rate is the expected return available elsewhere at the same risk, so the risk of the savings and the return on comparably risky investments bear on it. Financing rates, safe deposit rates and personal targets do not.',
  },
];

export const check = [
  {
    id: 'f05-npv-k1', type: 'mc', kind: 'conceptual',
    prompt: 'At an opportunity cost of capital of 11%, a project’s NPV is exactly zero. What does that tell you?',
    options: [
      'The project only gets its money back, with no return on it',
      'It earns exactly 11% a year on the money invested',
      'The project loses money once inflation is allowed for',
      'The project should be rejected, because it adds nothing',
    ],
    answer: 1,
    feedback: {
      0: 'A project that merely returns its cost, with no return, has a negative NPV at 11%.',
      2: 'The 11% is a nominal rate that already includes compensation for inflation; zero NPV means the project matches it.',
      3: 'It adds nothing beyond the 11% available elsewhere, but it does not lose value either: the owners are indifferent.',
    },
    solution: 'Discounting at 11% subtracts the return the money could earn elsewhere at the same risk. An NPV of zero means the project returns its cost plus exactly 11% a year: a fair deal, neither creating nor destroying value.',
  },
  {
    id: 'f05-npv-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional printing firm can buy a $40,000 machine that saves $9,500 a year after tax for six years. Its opportunity cost of capital is 12%. What is the NPV? Give whole dollars, with a minus sign if it is negative.',
    answer: -942, check: () => 9500 * af(0.12, 6) - 40000, unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 17000, say: 'That adds the savings without discounting.' },
      { value: 39058, say: 'That is the present value of the savings. Subtract the $40,000 outlay.' },
      { value: 1375, say: 'That discounts at 10%. The firm’s rate is 12%.' },
    ],
    solution: 'Annuity factor (12%, 6) = 4.111407. PV of savings = 9,500 × 4.111407 ≈ $39,058. NPV ≈ 39,058 − 40,000 ≈ −$942. Reject.',
  },
  {
    id: 'f05-npv-k3', type: 'mc', kind: 'conceptual',
    prompt: 'A company has two shareholders: one wants as much cash as possible now, the other is saving for retirement. Both can borrow and lend at the market rate. The company is considering a project with a positive NPV at that rate. What follows?',
    options: [
      'Only the saver should want it, since the impatient shareholder wants as much cash as possible right now',
      'Both should want it, since each can borrow or lend to spend the gain when they prefer',
      'The managers must ask both and choose by majority',
      'Neither can be sure until the project’s payback period and its effect on this year’s dividend are known',
    ],
    answer: 1,
    feedback: {
      0: 'The impatient shareholder can borrow against the project’s future cash, or sell shares, and spend the NPV today.',
      2: 'With borrowing and lending at the market rate, the investment decision does not depend on tastes, so there is nothing to vote on.',
      3: 'Payback ignores the time value of money and later cash flows; the NPV already says the project adds wealth.',
    },
    solution: 'A positive NPV raises each owner’s wealth today. With access to the market at the same rate, the impatient owner borrows against it and the patient one lends what she does not spend, so both are better off. That is why managers can maximise NPV without knowing their owners’ preferences.',
  },
  {
    id: 'f05-npv-k4', type: 'num', kind: 'applied',
    prompt: 'A colleague reports that a project’s NPV is $2,450, calculated as =NPV(9%,B1:B6), where B1 holds the outlay paid today and B2:B6 the inflows at the end of years 1 to 5. What is the correct NPV? Give whole dollars.',
    answer: 2671, check: () => 2450 * 1.09, unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 2450, say: 'That is the colleague’s figure, which discounts every cash flow, the outlay included, one year too many.' },
      { value: 2248, say: 'That divides by 1.09 again. Discounting one period too many divided the true NPV by 1.09, so multiply to undo it.' },
    ],
    solution: 'NPV() treats B1 as arriving in one year, so every cash flow is discounted once too often and the result is the true NPV ÷ 1.09. True NPV = 2,450 × 1.09 ≈ $2,671. The right formula is =B1+NPV(9%,B2:B6).',
  },
  {
    id: 'f05-npv-k5', type: 'mc', kind: 'applied',
    prompt: 'Ana is setting out a project in which Lantern would pay a supplier’s service fee at the start of each project year, from 1 April 2028 to 1 April 2032 (five payments), with year 0 = 1 April 2028 and other cash flows at the end of each year. Where on the timeline do the five fees go?',
    options: [
      'At years 1 to 5, since each fee belongs to one project year',
      'At years 0 to 4, since each is paid at the start of its year',
      'All at year 0, since the whole contract is signed on 1 April 2028',
      'At years 0.5 to 4.5, following the mid-year convention for cash spread through a year',
    ],
    answer: 1,
    feedback: {
      0: 'Year t’s cash flow is placed at the end of year t; a fee paid at the start of year t is paid at the end of year t − 1.',
      2: 'Only the first fee is paid on 1 April 2028; the others are paid a year, two years… later and are discounted accordingly.',
      3: 'The mid-year convention is for cash that arrives evenly through a year. These fees are paid on known dates, the first day of each year.',
    },
    solution: 'The start of year t is the end of year t − 1, so the five fees are at years 0, 1, 2, 3 and 4. Putting them at years 1 to 5 would discount each one a year too much and make the project look better than it is.',
  },
  {
    id: 'f05-npv-k6', type: 'num', kind: 'numerical',
    prompt: 'A fictional sports club will receive a single sponsorship payment of $50,000 on 1 October 2029. What is it worth on 1 April 2028 at an effective 8% a year, counting days on a 365-day year as XNPV does? Give whole dollars.',
    answer: 44544, check: () => 50000 / 1.08 ** (dayDiff('2028-04-01', '2029-10-01') / 365), unit: '$', places: 0, tol: 2,
    wrong: [
      { value: 46296, say: 'That discounts for one year only. The payment is about 1.5 years away (548 days).' },
      { value: 42867, say: 'That discounts for two years. Count the days: 548 ÷ 365 ≈ 1.5014 years.' },
    ],
    solution: '1 April 2028 to 1 October 2029 is 548 days, or 548 ÷ 365 = 1.5014 years. PV = 50,000 ÷ 1.08^1.5014 ≈ $44,544.',
  },
];

