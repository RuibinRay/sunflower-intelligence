// loan-amortisation.ex.js — F04 · Loan amortisation: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// Mortgage-scale examples are left to the mortgages lesson; Ana’s own mortgage is the F04 project’s.

const money = (v) => `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (v, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}%`;
const cents = (v) => Math.round(v * 100) / 100;
const a = (n, r) => (r === 0 ? n : (1 - (1 + r) ** -n) / r);
const s = (n, r) => (r === 0 ? n : ((1 + r) ** n - 1) / r);
const pmt = (pv, r, n) => (r === 0 ? pv / n : pv * r / (1 - (1 + r) ** -n));
const irr = (pv, c, n) => { let lo = 1e-9, hi = 1; for (let i = 0; i < 300; i++) { const m = (lo + hi) / 2; if (c * a(n, m) > pv) lo = m; else hi = m; } return lo; };

/** The lender’s schedule for the brewer loan: $24,000 at 0.6% a month, 48 payments of $576.94, last payment adjusted. */
const BREWER_ROWS = (() => {
  let b = 24000; const rows = [];
  for (let k = 1; k <= 48; k++) { const i = cents(b * 0.006); const pay = k === 48 ? cents(b + i) : 576.94; const p = cents(pay - i); b = cents(b - p); rows.push({ k, i, p }); }
  return rows;
})();

export const widgets = {
  'brewer-split': {
    type: 'chart', kind: 'line',
    title: 'Coastline’s brewer loan: interest and principal in each payment',
    x: { label: 'Payment number', values: BREWER_ROWS.map((r) => r.k) },
    series: [
      { name: 'Interest', values: BREWER_ROWS.map((r) => r.i) },
      { name: 'Principal repaid', values: BREWER_ROWS.map((r) => r.p) },
    ],
    y: { label: 'Dollars', format: 'money' },
    note: 'Interest falls from $144.00 in the first month to $3.44 in the last, while principal rises from $432.94 to $573.49; each pair adds up to the payment of $576.94 ($576.93 for the last). Fictional figures from the Lantern case.',
  },
  loan: {
    type: 'formula',
    title: 'Loan payment, balance and prepayment',
    intro: 'A fixed-rate loan repaid monthly. The starting values are Coastline Bank’s offer for Lantern’s brewer.',
    inputs: [
      { id: 'amt', label: 'Amount borrowed', min: 1000, max: 500000, step: 1000, value: 24000, fmt: 'money' },
      { id: 'apr', label: 'Interest rate (APR, compounded monthly)', min: 0, max: 20, step: 0.1, value: 7.2, fmt: 'pct' },
      { id: 'years', label: 'Term', min: 1, max: 30, step: 1, value: 4, fmt: 'int', unit: 'years' },
      { id: 'extra', label: 'Extra payment each month', min: 0, max: 2000, step: 10, value: 0, fmt: 'money' },
    ],
    compute: (v) => {
      const r = v.apr / 1200, n = v.years * 12;
      const C = pmt(v.amt, r, n);
      const sched = (k) => (r === 0 ? v.amt - C * k : v.amt * (1 + r) ** k - C * s(k, r));
      // with the extra payment, month by month at full precision
      let b = v.amt, months = 0, interest2 = 0;
      const withExtra = [v.amt];
      while (b > 1e-6 && months < n) {
        const i = b * r; const pay = Math.min(C + v.extra, b + i);
        interest2 += i; b = b + i - pay; months += 1; withExtra.push(Math.max(0, b));
      }
      while (withExtra.length <= n) withExtra.push(0);
      const interest1 = C * n - v.amt;
      const step = v.years > 10 ? 3 : 1;
      const xs = Array.from({ length: n / step + 1 }, (_, i) => i * step);
      const half = sched(n / 2);
      const firstInt = v.amt * r;
      const note = `The first payment is ${money(firstInt)} of interest and ${money(C - firstInt)} of principal. Halfway through the term, ${money(half)} (${pct(half / v.amt * 100, 1)} of the loan) is still owed.${v.extra > 0 ? ` Paying ${money(v.extra)} more each month clears the loan in ${months} months instead of ${n}, saving ${money(interest1 - interest2)} of interest.` : ' Add an extra monthly payment to see what prepaying saves.'}`;
      return {
        headline: { label: 'Monthly payment', value: money(C) },
        rows: [
          ['Total interest over the full term', money(interest1)],
          ['Months to repay with the extra payment', `${months} of ${n}`],
          ['Total interest with the extra payment', money(interest2)],
          ['Interest saved', money(interest1 - interest2)],
        ],
        note,
        chart: { kind: 'line', x: { label: 'Month', values: xs },
          series: [
            { name: 'Balance on schedule', values: xs.map((k) => cents(Math.max(0, sched(k)))) },
            { name: 'Balance with the extra payment', values: xs.map((k) => cents(withExtra[k])) },
          ],
          y: { label: 'Balance owed', format: 'money' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f04-amort-g1', type: 'steps', kind: 'numerical',
    prompt: 'A fictional nurse borrows $15,000 to buy a car, at 6% a year compounded monthly, repaid in 60 equal monthly payments.',
    solution: 'r = 0.5% a month, n = 60. C = 15,000 × 0.005 ÷ (1 − 1.005^−60) ≈ $289.99. First month: interest 15,000 × 0.005 = $75.00; principal 289.99 − 75.00 = $214.99; balance 15,000 − 214.99 = $14,785.01.',
    steps: [
      { id: 'f04-amort-g1-s1', type: 'num', prompt: 'What is the monthly payment? Give dollars and cents.',
        answer: 289.99, check: () => pmt(15000, 0.005, 60), unit: '$', places: 2, tol: 0.04,
        hints: ['C = PV × r ÷ (1 − (1 + r)^−n), with r = 6% ÷ 12 = 0.005 and n = 60.', '1.005^−60 ≈ 0.741372, so C = 75 ÷ 0.258628.'],
        wrong: [
          { value: 250, say: 'That is 15,000 ÷ 60, which repays the principal but no interest.' },
          { value: 296.75, say: 'You found an annual payment at 6% and divided it by 12. Work in months: 0.5% a month for 60 months.' },
        ] },
      { id: 'f04-amort-g1-s2', type: 'num', prompt: 'How much of the first payment is interest? Give dollars and cents.',
        answer: 75, check: () => 15000 * 0.005, unit: '$', places: 2, tol: 0.005,
        hints: ['Interest = monthly rate × balance at the start of the month.'],
        wrong: [{ value: 900, say: 'That is a year’s interest. The first payment covers one month.' }] },
      { id: 'f04-amort-g1-s3', type: 'num', prompt: 'What is the balance after the first payment (using the payment rounded to the cent)? Give dollars and cents.',
        answer: 14785.01, check: () => 15000 - (cents(pmt(15000, 0.005, 60)) - 15000 * 0.005), unit: '$', places: 2, tol: 0.04,
        hints: ['Principal repaid = payment − interest.', 'Balance = 15,000 − (289.99 − 75.00).'],
        wrong: [{ value: 14710.01, say: 'You subtracted the whole payment. Only the principal part reduces the balance; the interest part pays for the month.' }] },
    ],
  },
  {
    id: 'f04-amort-g2', type: 'steps', kind: 'numerical',
    prompt: 'The nurse in the previous question has made 24 of the 60 payments on her $15,000 loan (0.5% a month).',
    solution: 'Prospective: 36 payments remain, so B₂₄ = 289.992 × (1 − 1.005^−36) ÷ 0.005 = 289.992 × 32.871016 ≈ $9,532.33. Interest in the 24 payments = 24 × 289.992 − (15,000 − 9,532.33) ≈ 6,959.81 − 5,467.67 = $1,492.14.',
    steps: [
      { id: 'f04-amort-g2-s1', type: 'num', prompt: 'How many payments remain?',
        answer: 36, check: () => 60 - 24, unit: 'payments', places: 0, tol: 0,
        hints: ['n − k.'] },
      { id: 'f04-amort-g2-s2', type: 'num', prompt: 'What is the balance outstanding, by the prospective method? Give dollars and cents.',
        answer: 9532.33, check: () => pmt(15000, 0.005, 60) * a(36, 0.005), unit: '$', places: 2, tol: 5,
        hints: ['The balance is the present value of the payments still to come, at the loan rate.', 'B = 289.99 × (1 − 1.005^−36) ÷ 0.005; the annuity factor is about 32.871016.'],
        wrong: [
          { value: 9000, say: 'That assumes the principal is repaid evenly (36/60 of $15,000). Early payments are mostly interest, so more is still owed.' },
          { value: 8040.19, say: 'That is 15,000 minus 24 payments, as if every dollar paid reduced the balance. Part of each payment is interest.' },
          { value: 6543.05, say: 'You discounted 24 payments. The balance is the value of the 36 payments still to come.' },
        ] },
      { id: 'f04-amort-g2-s3', type: 'num', prompt: 'How much interest has she paid so far? Give dollars and cents.',
        answer: 1492.14, check: () => 24 * pmt(15000, 0.005, 60) - (15000 - pmt(15000, 0.005, 60) * a(36, 0.005)), unit: '$', places: 2, tol: 6,
        hints: ['Interest paid = payments made − fall in the balance.', '24 × 289.99 − (15,000 − 9,532.33).'] },
    ],
  },
  {
    id: 'f04-amort-g3', type: 'num', kind: 'numerical',
    prompt: 'A fictional landscaping firm borrows $30,000 at 9% a year compounded monthly, repaid monthly over five years. How much interest will it pay over the life of the loan? Give dollars and cents.',
    answer: 7365.04, check: () => 60 * pmt(30000, 0.0075, 60) - 30000, unit: '$', places: 2, tol: 0.5,
    hints: ['First find the payment: r = 0.75%, n = 60.', 'C ≈ 622.75; total interest = 60 × C − 30,000.'],
    wrong: [
      { value: 13500, say: 'That charges 9% a year on the full $30,000 for five years. On an amortising loan interest is charged only on the balance still owed, which falls.' },
      { value: 8563.87, say: 'That uses five annual payments. The loan is repaid monthly.' },
    ],
    solution: 'C = 30,000 × 0.0075 ÷ (1 − 1.0075^−60) ≈ $622.75. Total paid = 60 × 622.7507 ≈ $37,365.04, so total interest ≈ $7,365.04.',
  },
  {
    id: 'f04-amort-g4', type: 'steps', kind: 'applied',
    prompt: 'A fictional print shop can borrow $50,000 at 8% a year for three years, with annual payments, either interest-only (principal repaid at the end) or amortising (three equal payments).',
    solution: 'Interest-only: 3 × 4,000 = $12,000 of interest and a $50,000 balloon. Amortising: C = 50,000 × 0.08 ÷ (1 − 1.08^−3) ≈ $19,401.68; total interest = 3 × 19,401.68 − 50,000 ≈ $8,205.03. Both charge 8% on whatever is owed; at 8% each set of payments is worth exactly $50,000 today.',
    steps: [
      { id: 'f04-amort-g4-s1', type: 'num', prompt: 'What is the total interest on the interest-only loan? Give dollars and cents.',
        answer: 12000, check: () => 3 * 50000 * 0.08, unit: '$', places: 2, tol: 0.5,
        hints: ['The balance stays at $50,000, so each year’s interest is the same.'] },
      { id: 'f04-amort-g4-s2', type: 'num', prompt: 'What is the annual payment on the amortising loan? Give dollars and cents.',
        answer: 19401.68, check: () => pmt(50000, 0.08, 3), unit: '$', places: 2, tol: 4,
        hints: ['C = PV × r ÷ (1 − (1 + r)^−n) with r = 0.08 and n = 3.'] },
      { id: 'f04-amort-g4-s3', type: 'num', prompt: 'What is the total interest on the amortising loan? Give dollars and cents.',
        answer: 8205.03, check: () => 3 * pmt(50000, 0.08, 3) - 50000, unit: '$', places: 2, tol: 12,
        hints: ['Total paid minus the amount borrowed.'] },
      { id: 'f04-amort-g4-s4', type: 'mc', prompt: 'Which loan is cheaper?',
        options: [
          'Neither: both charge 8% on the balance owed; the interest-only loan pays more interest because more is owed for longer',
          'The amortising loan, because its total interest is lower',
          'The interest-only loan, because its yearly payments are lower',
        ],
        answer: 0,
        feedback: {
          1: 'Lower total interest reflects repaying the money sooner, not a lower price. At 8%, both sets of payments are worth exactly $50,000.',
          2: 'Lower payments now are offset by the $50,000 balloon at the end.',
        },
        hints: ['Compare the rates, or the present value of each set of payments at 8%.'] },
    ],
  },
];

export const independent = [
  {
    id: 'f04-amort-i1', type: 'mc', kind: 'conceptual',
    prompt: 'Halfway through the term of a level-payment loan, more than half of the amount borrowed is usually still owed. Why?',
    options: [
      'Early payments go mostly to interest, because interest is charged on a balance that is still large',
      'The lender adds a penalty to the balance in the early years, and it is repaid before any of the principal',
      'The payment is smaller in the early years and rises later in the term, so less principal is repaid at first',
      'It is not true: exactly half is owed halfway through',
    ],
    answer: 0,
    feedback: {
      1: 'No penalty is needed: the interest rule alone produces this pattern.',
      2: 'The payment is the same every month; its split between interest and principal changes.',
      3: 'Only with a 0% rate is the principal repaid evenly.',
    },
    solution: 'Each payment first covers interest on the balance. While the balance is large, interest takes a large share of the payment and little principal is repaid. The principal part grows by (1 + r) each period, so most of the principal is repaid in the second half.',
  },
  {
    id: 'f04-amort-i2', type: 'num', kind: 'numerical',
    prompt: 'On Coastline’s brewer loan ($24,000 at 0.6% a month, payment $576.94, first-month principal $432.94), how much of the 13th payment repays principal? Use the fact that the principal part grows by (1 + r) each month. Give dollars and cents.',
    answer: 465.16, check: () => (24000 * 0.006 / (1 - 1.006 ** -48) - 144) * 1.006 ** 12, unit: '$', places: 2, tol: 0.02,
    wrong: [
      { value: 432.94, say: 'That is the first month’s principal. It grows by 0.6% each month: multiply by 1.006¹².' },
      { value: 422.22, say: 'You grew the interest instead of the principal. The interest part falls; the principal part rises by (1 + r).' },
      { value: 467.95, say: 'You grew it for 13 months. The 13th payment is 12 months after the first.' },
    ],
    solution: 'P₁₃ = P₁ × 1.006¹² = 432.94 × 1.074424 ≈ $465.16. The interest part is 576.94 − 465.16 = $111.78, which is 0.6% of the balance after 12 payments, $18,629.81.',
  },
  {
    id: 'f04-amort-i3', type: 'num', kind: 'numerical',
    prompt: 'A fictional teacher borrows $20,000 at 6% a year compounded monthly over five years; the scheduled payment is $386.66. If she pays $500 a month instead, how many months will it take to repay the loan? Give n to two decimal places.',
    answer: 44.74, check: () => -Math.log(1 - 20000 * 0.005 / 500) / Math.log(1.005), unit: 'months', places: 2, tol: 0.2,
    wrong: [
      { value: 40, say: 'That is 20,000 ÷ 500, which ignores interest.' },
      { value: 60, say: 'That is the original term. Paying more each month shortens it.' },
    ],
    solution: 'n = −ln(1 − 20,000 × 0.005 ÷ 500) ÷ ln(1.005) = −ln(0.8) ÷ ln(1.005) ≈ 0.223144 ÷ 0.004988 ≈ 44.74: 44 payments of $500 and a smaller 45th, more than 15 months sooner.',
  },
  {
    id: 'f04-amort-i4', type: 'num', kind: 'applied',
    prompt: 'A fictional car buyer is offered a $20,000 loan at 6% a year compounded monthly over 60 months (payment $386.66), but a $400 loan fee is deducted, so she receives $19,600. What APR does the loan really cost, including the fee? Give a percentage to two decimal places.',
    answer: 6.84, check: () => irr(19600, pmt(20000, 0.005, 60), 60) * 1200, unit: '%', places: 2, tol: 0.03,
    wrong: [
      { value: 6, say: 'That is the quoted interest rate. The fee means she receives less but repays the same, so the true rate is higher.' },
      { value: 5.18, say: 'You added the fee to the amount received. It is deducted: she receives $19,600.' },
      { value: 7.06, say: 'That is roughly the effective annual rate. The APR is the monthly rate × 12.' },
    ],
    solution: 'Find r with 386.66 × (1 − (1 + r)^−60) ÷ r = 19,600 (=RATE(60, -386.66, 19600)). r ≈ 0.570% a month, so APR ≈ 12 × 0.570% ≈ 6.84%. A $400 fee adds about 0.84 percentage points to a five-year loan of this size.',
  },
  {
    id: 'f04-amort-i5', type: 'num', kind: 'applied',
    prompt: 'A fictional dental practice owes $60,000 on an equipment loan at 9% a year compounded monthly, with 60 monthly payments left. A lender offers to refinance the $60,000 at 7.2% a year compounded monthly over the same 60 months for a $1,500 fee. What is the net gain from refinancing in present value, discounting the monthly savings at the new loan’s rate? Give dollars and cents.',
    answer: 1101.55, check: () => (pmt(60000, 0.0075, 60) - pmt(60000, 0.006, 60)) * a(60, 0.006) - 1500, unit: '$', places: 2, tol: 8,
    wrong: [
      { value: 2601.55, say: 'That is the present value of the savings before the fee. Subtract the $1,500.' },
      { value: 1605.58, say: 'You added up the 60 monthly savings without discounting them, then took off the fee. Discount the savings at the new rate.' },
    ],
    solution: 'Old payment = 60,000 × 0.0075 ÷ (1 − 1.0075^−60) ≈ $1,245.50; new = 60,000 × 0.006 ÷ (1 − 1.006^−60) ≈ $1,193.74; saving ≈ $51.76 a month. PV at 0.6% = 51.7596 × 50.262130 ≈ $2,601.55. Net = 2,601.55 − 1,500 ≈ $1,101.55: refinance (break-even in about 29 months).',
  },
  {
    id: 'f04-amort-i6', type: 'classify', kind: 'conceptual',
    prompt: 'For a new amortising loan, what does each change do to the monthly payment, everything else staying the same?',
    items: [
      'A longer term',
      'A higher interest rate',
      'Borrowing a larger amount',
      'An arrangement fee deducted from the money the borrower receives',
    ],
    categories: ['Payment rises', 'Payment falls', 'No change'],
    answer: [1, 0, 0, 2],
    feedback: {
      0: 'More payments share the repayment, so each is smaller, though total interest rises.',
      3: 'The loan amount, rate and term are unchanged, so the payment is too. The borrower receives less, so the APR rises.',
    },
    solution: 'A longer term lowers the payment (but raises total interest); a higher rate or a larger loan raises it; a deducted fee leaves the payment unchanged but raises the true cost, the APR.',
  },
];

export const check = [
  {
    id: 'f04-amort-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Loan A and loan B charge the same rate, 7% a year compounded monthly, on the same amount. Loan A has a five-year term and loan B a three-year term, and loan A’s total interest is much larger. Neither loan charges any fees. What can you conclude?',
    options: [
      'Nothing about cost: loan A’s extra interest pays for keeping the money longer, at the same price',
      'Loan A is the more expensive loan, because it charges much more interest in total, so it should be avoided',
      'Loan B has a lower APR, because the APR reflects total interest, which is much smaller on the shorter loan',
      'Loan A must include hidden fees, because the same rate on the same amount cannot produce so much more interest',
    ],
    answer: 0,
    feedback: {
      1: 'Same rate, same price per dollar per month. More interest reflects more borrowing over time.',
      2: 'With no fees, both APRs are 7%.',
      3: 'Nothing suggests fees: a longer term alone explains the larger total.',
    },
    solution: 'Total interest grows with the amount owed and how long it is owed. At the same rate, both loans’ payments are worth exactly the amount borrowed. Choose between them on cash flow (lower payment versus repaying sooner), not on total interest.',
  },
  {
    id: 'f04-amort-k2', type: 'num', kind: 'numerical',
    prompt: 'What is the monthly payment on a fictional $12,000 loan at 9% a year compounded monthly, repaid over 36 months? Give dollars and cents.',
    answer: 381.60, check: () => pmt(12000, 0.0075, 36), unit: '$', places: 2, tol: 0.1,
    wrong: [
      { value: 333.33, say: 'That is 12,000 ÷ 36, which ignores interest.' },
      { value: 423.33, say: 'That adds 9% simple interest on the full $12,000 for three years. Interest is charged only on the falling balance.' },
    ],
    solution: 'r = 0.75%, n = 36. C = 12,000 × 0.0075 ÷ (1 − 1.0075^−36) = 90 ÷ 0.235851 ≈ $381.60.',
  },
  {
    id: 'f04-amort-k3', type: 'num', kind: 'numerical',
    prompt: 'A fictional van loan of $40,000 at 6.6% a year compounded monthly is repaid in 72 monthly payments of $674.30. What is the balance after 30 payments? Give dollars and cents.',
    answer: 25226.05, check: () => { const c = pmt(40000, 0.0055, 72); return 40000 * 1.0055 ** 30 - c * s(30, 0.0055); }, unit: '$', places: 2, tol: 7,
    wrong: [
      { value: 23333.33, say: 'That assumes the principal is repaid evenly. Early payments are mostly interest, so more is still owed.' },
      { value: 18601.32, say: 'You discounted the 30 payments already made. The balance is the value of the 42 still to come.' },
      { value: 19770.90, say: 'You subtracted the 30 payments from $40,000, ignoring the interest in them.' },
    ],
    solution: 'Prospective: 42 payments remain, B = 674.30 × (1 − 1.0055^−42) ÷ 0.0055 ≈ $25,226.05. Retrospective: 40,000 × 1.0055³⁰ − 674.30 × (1.0055³⁰ − 1) ÷ 0.0055 gives the same.',
  },
  {
    id: 'f04-amort-k4', type: 'num', kind: 'applied',
    prompt: 'Suppose Lantern borrowed the $24,000 for the brewer from Coastline Bank at 7.2% a year compounded monthly (0.6% a month), but paid $1,050 a month, the same as the supplier’s plan. How many payments would it take to clear the loan? Give n to two decimal places.',
    answer: 24.66, check: () => -Math.log(1 - 24000 * 0.006 / 1050) / Math.log(1.006), unit: 'payments', places: 2, tol: 0.1,
    wrong: [
      { value: 22.86, say: 'That is 24,000 ÷ 1,050, which ignores interest.' },
      { value: 21.48, say: 'You used the savings-target formula, ln(1 + PV × r ÷ C). For a loan it is −ln(1 − PV × r ÷ C).' },
      { value: 24, say: 'That is the plan’s term. The bank charges 7.2%, more than the plan’s implied 4.73%, so the same payments take longer to clear the same $24,000.' },
    ],
    solution: 'n = −ln(1 − 24,000 × 0.006 ÷ 1,050) ÷ ln(1.006) = −ln(0.862857) ÷ ln(1.006) ≈ 0.147506 ÷ 0.005982 ≈ 24.66: 24 payments of $1,050 and a 25th of about $691.64. The supplier’s plan clears the same $24,000 price with 24 payments because its implied rate is lower than the bank’s.',
  },
  {
    id: 'f04-amort-k5', type: 'mc', kind: 'applied',
    prompt: 'A fictional borrower owes $9,000 with 18 monthly payments left at 9% a year compounded monthly. She could refinance at 7.5% over the same 18 months for a $300 fee, which would cut her payment by about $6.17 a month. What should she do?',
    options: [
      'Keep the current loan: the savings are worth only about $105 today, less than the $300 fee',
      'Refinance: a rate 1.5 points lower cuts every payment, and any lower rate is always worth having',
      'Refinance, because the fee is recovered in under two years',
      'Keep the loan, because refinancing always restarts the term and so adds interest over a longer period',
    ],
    answer: 0,
    feedback: {
      1: 'A lower rate pays only if the savings outweigh the cost of switching.',
      2: 'At about $6.17 a month, recovering the $300 fee takes about 49 months, far more than the 18 months left on the loan.',
      3: 'The new loan here has the same 18-month term; the problem is the fee, not the term.',
    },
    solution: 'Monthly saving ≈ $6.17 for 18 months: about $104.69 at the new rate’s 0.625% a month. The $300 fee would take about 49 months to recover, far longer than the 18 months left. Refinancing a small, short balance rarely pays.',
  },
  {
    id: 'f04-amort-k6', type: 'num', kind: 'numerical',
    prompt: 'A fictional battery-storage installer borrows $200,000 for equipment at 7.8% a year compounded monthly over 10 years. How much of its first monthly payment repays principal? Give dollars and cents.',
    answer: 1105.47, check: () => pmt(200000, 0.0065, 120) - 200000 * 0.0065, unit: '$', places: 2, tol: 0.25,
    wrong: [
      { value: 1300, say: 'That is the first month’s interest (0.65% of $200,000). The principal is what is left of the payment.' },
      { value: 2405.47, say: 'That is the whole payment. Take off the interest.' },
      { value: 1666.67, say: 'That is 200,000 ÷ 120, an even share of the principal. In the first month much less is repaid, because interest takes $1,300.' },
    ],
    solution: 'C = 200,000 × 0.0065 ÷ (1 − 1.0065^−120) ≈ $2,405.47. Interest = 200,000 × 0.0065 = $1,300.00. Principal = 2,405.47 − 1,300.00 = $1,105.47.',
  },
];
