// assess-m3.js — F04 module 3 test: Streams of cash (annuities, perpetuities-and-growth, loan-amortisation).
// No hints. Each item has a full solution, shown when the student reviews the test. The questions are new: each puts a
// lesson’s method to work in a different situation from the lesson exercises. Every business and person named here is
// fictional; the Lantern figures are not reused.

const a = (n, r) => (1 - (1 + r) ** -n) / r;
const s = (n, r) => ((1 + r) ** n - 1) / r;
const pmt = (pv, r, n) => pv * r / (1 - (1 + r) ** -n);
const ga = (c, r, g, n) => c / (r - g) * (1 - ((1 + g) / (1 + r)) ** n);
const rate = (pv, c, n) => { let lo = 1e-9, hi = 1; for (let i = 0; i < 300; i++) { const m = (lo + hi) / 2; if (c * a(n, m) > pv) lo = m; else hi = m; } return lo; };

export const items = [
  {
    id: 'f04-m3-1', lesson: 'annuities', type: 'num', kind: 'numerical',
    prompt: 'A fictional student deposits $150 at the start of every month for four years in a savings account paying 4.8% a year compounded monthly. How much will the account hold at the end of the four years? Give dollars and cents.',
    answer: 7951.93, check: () => 150 * s(48, 0.004) * 1.004, unit: '$', places: 2, tol: 0.5,
    wrong: [
      { value: 7920.25, say: 'That treats the deposits as made at the end of each month. Deposits at the start earn one more month’s interest: multiply by 1.004.' },
      { value: 7200, say: 'That is the deposits alone, with no interest.' },
      { value: 675.54, say: 'You used four annual periods at 4.8%. There are 48 monthly deposits at 0.4%.' },
    ],
    solution: 'Monthly rate = 4.8% ÷ 12 = 0.4%; n = 48. FV of an ordinary annuity = 150 × (1.004⁴⁸ − 1) ÷ 0.004 ≈ $7,920.25. The deposits are made at the start of each month (annuity due), so × 1.004: ≈ $7,951.93.',
  },
  {
    id: 'f04-m3-2', lesson: 'annuities', type: 'mc', kind: 'conceptual',
    prompt: 'Which change, on its own, increases the present value of an ordinary annuity?',
    options: [
      'Lowering the discount rate',
      'Raising the discount rate',
      'Moving every payment one period later',
      'Cutting the number of payments',
    ],
    answer: 0,
    feedback: {
      1: 'A higher rate discounts every payment more heavily, so the present value falls.',
      2: 'Later payments are worth less today: this divides the present value by (1 + r).',
      3: 'Fewer payments of the same size are worth less.',
    },
    solution: 'Each payment is worth C ÷ (1 + r)^t today. A lower r raises every term, so the present value rises. Moving payments earlier (an annuity due) or adding payments would also raise it.',
  },
  {
    id: 'f04-m3-3', lesson: 'annuities', type: 'num', kind: 'applied',
    prompt: 'A fictional clinic must choose a five-year equipment-service contract, paid at the end of each year. Contract A costs $12,000 a year. Contract B costs $11,000 in the first year, rising by 4% a year. At 6% a year, how much less, in present value, does the cheaper contract cost? Keep at least six decimal places in every factor and round only the final answer. Give dollars and cents.',
    answer: 582.97, check: () => 12000 * a(5, 0.06) - ga(11000, 0.06, 0.04, 5), unit: '$', places: 2, tol: 2,
    wrong: [
      { value: 420.45, say: 'That compares the payments without discounting (60,000 − 59,579.55). Later payments, where B is dearer, are worth less today, so B’s advantage is larger in present value.' },
      { value: 1000, say: 'That compares only the first year. B rises by 4% a year: value both streams in full.' },
    ],
    solution: 'A: 12,000 × (1 − 1.06^−5) ÷ 0.06 ≈ $50,548.37. B is a growing annuity: 11,000 ÷ (0.06 − 0.04) × [1 − (1.04 ÷ 1.06)⁵] ≈ $49,965.40. B is cheaper by about $582.97 in present value, although its payments add up to $59,579.55 against $60,000: its higher payments come late, when they are worth less.',
  },
  {
    id: 'f04-m3-4', lesson: 'annuities', type: 'num', kind: 'applied',
    prompt: 'A fictional appliance store sells a range cooker for $2,400 cash, or for 18 monthly payments of $145, the first on the day of purchase. What APR (monthly rate × 12) does the payment plan charge? Give a percentage to one decimal place.',
    answer: 12.1, check: () => { let lo = 1e-9, hi = 1; for (let i = 0; i < 300; i++) { const m = (lo + hi) / 2; if (145 * a(18, m) * (1 + m) > 2400) lo = m; else hi = m; } return lo * 1200; }, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: 10.8, say: 'You treated the first payment as a month away. It is paid on the day of purchase, so the payments form an annuity due: the buyer really borrows only $2,255 for the first month.' },
      { value: 8.75, say: 'That is the extra $210 as a share of $2,400. The balance is repaid gradually, so find the rate at which the 18 payments are worth $2,400.' },
      { value: 12.8, say: 'That is the effective annual rate. The APR is the monthly rate × 12.' },
      { value: 1, say: 'That is roughly the monthly rate. Multiply by 12.' },
    ],
    solution: 'The payments start today, so they form an annuity due: find r with 145 × (1 − (1 + r)^−18) ÷ r × (1 + r) = 2,400, i.e. =RATE(18, -145, 2400, 0, 1). r ≈ 1.008% a month, so the APR ≈ 12.1% (EAR ≈ 12.79%). Treating the payments as starting a month later would give about 10.8%: paying on the day of purchase raises the true rate.',
  },
  {
    id: 'f04-m3-5', lesson: 'perpetuities-and-growth', type: 'num', kind: 'numerical',
    prompt: 'A fictional city leases land to a stadium for ever. The rent is $250,000 a year, paid at the start of each year with the first payment today, and rises by 2% a year. At 7% a year, what is the lease worth to the city today? Give dollars.',
    answer: 5350000, check: () => 250000 + 250000 * 1.02 / (0.07 - 0.02), unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 5000000, say: 'That is 250,000 ÷ (0.07 − 0.02): a growing perpetuity whose first payment is a year away. Here the first payment is today, and next year’s is $255,000.' },
      { value: 5100000, say: 'That values the payments from next year on (255,000 ÷ 0.05) but leaves out today’s $250,000.' },
      { value: 3571428.57, say: 'That ignores the 2% growth. The rent rises every year.' },
    ],
    solution: 'Today’s payment plus a growing perpetuity starting next year: 250,000 + 255,000 ÷ (0.07 − 0.02) = 250,000 + 5,100,000 = $5,350,000.',
  },
  {
    id: 'f04-m3-6', lesson: 'perpetuities-and-growth', type: 'mc', kind: 'conceptual',
    prompt: 'A growing perpetuity has a first payment of $500. If the discount rate and the growth rate both rise by one percentage point, what happens to its value?',
    options: [
      'Nothing: the value depends only on r − g, which is unchanged',
      'It falls, because a higher discount rate always lowers the present value of future payments',
      'It rises, because the growth rate is higher',
      'It cannot be known without the old rates',
    ],
    answer: 0,
    feedback: {
      1: 'The higher discount rate is exactly offset by the faster growth.',
      2: 'The faster growth is exactly offset by the higher discount rate.',
      3: 'The value is 500 ÷ (r − g), and r − g has not changed.',
    },
    solution: 'PV = C₁ ÷ (r − g). Adding one point to both r and g leaves r − g, and so the value, unchanged. This is why analysts who expect higher inflation raise both their discount rate and their growth rate.',
  },
  {
    id: 'f04-m3-7', lesson: 'perpetuities-and-growth', type: 'num', kind: 'applied',
    prompt: 'A fictional donor wants to endow a professorship that pays $150,000 a year, the first payment a year from now, rising by 3% a year for ever. The university expects the fund to earn 7.5% a year. How large must the gift be? Give dollars and cents.',
    answer: 3333333.33, check: () => 150000 / (0.075 - 0.03), unit: '$', places: 2, tol: 1,
    wrong: [
      { value: 2000000, say: 'That is a level perpetuity (150,000 ÷ 0.075). The payment grows by 3% a year, so divide by r − g.' },
      { value: 3433333.33, say: 'You grew the first payment. $150,000 is already the payment a year from now (C₁).' },
    ],
    solution: 'Gift = C₁ ÷ (r − g) = 150,000 ÷ (0.075 − 0.03) = 150,000 ÷ 0.045 ≈ $3,333,333.33. Each year the fund earns 7.5%, pays out 4.5% and reinvests 3%, so the professorship and the fund grow together.',
  },
  {
    id: 'f04-m3-8', lesson: 'loan-amortisation', type: 'num', kind: 'numerical',
    prompt: 'A fictional café owner borrows $18,000 at 8.4% a year compounded monthly, repaid in 48 equal monthly payments. After making 18 payments, she decides to pay the loan off in full with her 19th payment. How much must that payment be? Give dollars and cents.',
    answer: 12028.53, check: () => pmt(18000, 0.007, 48) * a(30, 0.007) * 1.007, unit: '$', places: 2, tol: 2.6,
    wrong: [
      { value: 11944.92, say: 'That is the balance just after the 18th payment. A month passes before the 19th, so add the month’s interest on it.' },
      { value: 12387.74, say: 'That adds a whole scheduled payment to the balance. Only the month’s interest is due on top of the balance, not a full payment.' },
    ],
    solution: 'r = 0.7%; C = 18,000 × 0.007 ÷ (1 − 1.007^−48) ≈ $442.82. Balance after 18 payments (prospective, 30 remain): 442.82 × (1 − 1.007^−30) ÷ 0.007 ≈ $11,944.92. A month later she owes that plus a month’s interest: 11,944.92 × 1.007 ≈ $12,028.53. Check: that is the 19th scheduled payment ($442.82) plus the balance just after it.',
  },
  {
    id: 'f04-m3-9', lesson: 'loan-amortisation', type: 'num', kind: 'numerical',
    prompt: 'A fictional $36,000 loan at 6% a year compounded monthly is repaid over 36 months. How much interest is paid in the first 12 payments? Keep at least six decimal places in every factor and round only the final answer. Give dollars and cents.',
    answer: 1852.90, check: () => { const c = pmt(36000, 0.005, 36); return 12 * c - (36000 - c * a(24, 0.005)); }, unit: '$', places: 2, tol: 5,
    wrong: [
      { value: 2160, say: 'That is 6% of the full $36,000. The balance falls every month, so the interest is less.' },
    ],
    solution: 'C = 36,000 × 0.005 ÷ (1 − 1.005^−36) ≈ $1,095.19. Balance after 12 payments = 1,095.19 × (1 − 1.005^−24) ÷ 0.005 ≈ $24,710.62. Interest = payments − fall in balance = 12 × 1,095.19 − (36,000 − 24,710.62) ≈ 13,142.28 − 11,289.38 = $1,852.90.',
  },
  {
    id: 'f04-m3-10', lesson: 'loan-amortisation', type: 'mc', kind: 'applied',
    prompt: 'A fictional dealership sells a $36,000 SUV with either 0% finance over 60 months ($600 a month, the first a month after purchase) or $3,000 off for cash. The buyer can borrow from her credit union at 6.6% a year compounded monthly. Which should she choose?',
    options: [
      'The 0% finance: its payments are worth about $30,592 at 6.6%, about $2,408 less than the $33,000 cash price',
      'Pay cash: $33,000 is less than the $36,000 the payments add up to',
      'Either: a 0% offer and a cash discount always cost the same',
      'Pay cash, because finance always costs more than paying cash',
    ],
    answer: 0,
    feedback: {
      1: 'Adding up payments ignores the time value of money. Discount them at the rate she would pay to borrow the cash.',
      2: 'They differ: the value of 0% finance depends on the discount offered and on her borrowing rate.',
      3: 'Here the finance is cheaper: its implied rate, measured against the $33,000 cash price, is below her 6.6%.',
    },
    solution: 'PV of 60 × $600 at 0.55% a month = 600 × (1 − 1.0055^−60) ÷ 0.0055 ≈ $30,591.92. Paying cash means borrowing $33,000 at 6.6%. The 0% finance is worth about $2,408.08 more to her. A larger cash discount, or a lower borrowing rate, could reverse the answer.',
  },
  {
    id: 'f04-m3-11', lesson: 'loan-amortisation', type: 'classify', kind: 'conceptual',
    prompt: 'Does each statement describe an interest-only loan, an amortising loan, or both?',
    items: [
      'The balance just before the final payment equals the amount borrowed',
      'Each period’s interest is the rate times the balance outstanding',
      'The interest part of the payment falls over time',
      'The final payment is much larger than the others',
      'At the loan’s rate, the payments are worth exactly the amount borrowed',
    ],
    categories: ['Interest-only loan', 'Amortising loan', 'Both'],
    answer: [0, 2, 1, 0, 2],
    feedback: {
      1: 'Interest is always charged on what is owed, whatever the repayment pattern.',
      2: 'Only when principal is being repaid does the balance, and so the interest, fall.',
      4: 'Both are fair at the loan rate: the present value of either set of payments is the amount lent.',
    },
    solution: 'Interest-only: the balance stays at the amount borrowed and a balloon repays it at the end. Amortising: the balance and so the interest part fall over time. Both: interest is charged on the balance outstanding, and the payments are worth the amount lent at the loan rate.',
  },
];
