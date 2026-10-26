// assess-m2.js — F04 module 2 test: Present and future value (present-and-future-value, discounting-cash-flows).
// No hints. Each item has a full solution, shown when the student reviews the test. New questions, not copies of the
// lesson exercises. All businesses and people are fictional; item 11 uses COASTLINE_NOTE from case.js (a $10,000 note
// at 6% paid quarterly, valued at the 8% market rate) at a later date than the lessons do.
import { COASTLINE_NOTE as N } from './case.js?v=19';

const q = N.marketRateMarch2027 / 100 / 4;   // 2% a quarter

export const items = [
  {
    id: 'f04-m2-1', lesson: 'present-and-future-value', type: 'num', kind: 'numerical',
    prompt: 'A fictional picture-framing shop is owed $16,000 by a hotel client, due in 27 months. A finance company offers to buy the debt today, at a price that earns it 6% a year compounded monthly. How much less than $16,000 would the shop receive by selling the debt now? Give dollars and cents.',
    answer: 2015.84, check: () => 16000 - 16000 * (1 + 0.06 / 12) ** -27, unit: '$', places: 2, tol: 1,
    wrong: [
      { value: 13984.16, say: 'That is the price the finance company would pay, the present value of the debt. The question asks how much less than $16,000 that is.' },
      { value: 1965.99, say: 'That treats 6% as an effective annual rate (16,000 − 16,000 ÷ 1.06^2.25). With monthly compounding use 0.5% a month for 27 months.' },
      { value: 2160, say: 'That is simple interest on $16,000 for 27 months (16,000 × 0.06 × 27 ÷ 12). The price is the present value, 16,000 ÷ 1.005²⁷, and the shop gives up $16,000 minus that price.' },
    ],
    solution: 'r = 6% ÷ 12 = 0.5% a month; n = 27 months. Discount factor = 1.005⁻²⁷ ≈ 0.874010. Price = 16,000 × 0.874010 ≈ $13,984.16, so the shop gives up 16,000 − 13,984.16 ≈ $2,015.84 to be paid now: the interest the finance company earns over the 27 months.',
  },
  {
    id: 'f04-m2-2', lesson: 'present-and-future-value', type: 'mc', kind: 'conceptual',
    prompt: 'At a rate of 6% a year, compounded annually, offer P is worth $500 more than offer Q when both are valued today. If both are valued at the end of year 5 instead, which statement is true?',
    options: [
      'P is worth about $669.11 more than Q at year 5',
      'P is worth exactly $500 more than Q at year 5',
      'Q may now be worth more than P, depending on when each pays',
      'They cannot be compared at year 5 unless both pay at year 5',
    ],
    answer: 0,
    feedback: {
      1: 'Moving every amount to year 5 multiplies every value, and so the gap, by 1.06⁵.',
      2: 'With one rate throughout, the ranking never depends on the comparison date: every value is multiplied by the same factor.',
      3: 'Any amount can be moved to any date by compounding or discounting; that is what a comparison date is for.',
    },
    solution: 'Moving from year 0 to year 5 multiplies every value by 1.06⁵ = 1.338226. The gap becomes 500 × 1.338226 ≈ $669.11, and P stays ahead: the comparison date changes the amounts, not the ranking.',
  },
  {
    id: 'f04-m2-3', lesson: 'present-and-future-value', type: 'num', kind: 'applied',
    prompt: 'A fictional graduate has $12,000 in an account paying 4.2% a year compounded monthly, and needs $15,000 for a course. If she adds nothing, how many years until the balance reaches $15,000? Allow a fractional number of periods, as n = ln(FV ÷ PV) ÷ ln(1 + r) does. Give two decimal places.',
    answer: 5.32, check: () => Math.log(15000 / 12000) / Math.log(1 + 0.042 / 12) / 12, unit: 'years', places: 2, tol: 0.02,
    wrong: [
      { value: 5.95, say: 'That uses simple interest ($504 a year). Interest is compounded monthly: n = ln(1.25) ÷ ln(1.0035) months.' },
      { value: 5.42, say: 'That compounds annually at 4.2%. The account compounds monthly at 0.35% a month.' },
      { value: 63.87, say: 'That is the number of months. The question asks for years: divide by 12.' },
    ],
    solution: 'Monthly rate = 0.35%. n = ln(15,000 ÷ 12,000) ÷ ln(1.0035) = 0.223144 ÷ 0.003494 ≈ 63.87 months, or 63.87 ÷ 12 ≈ 5.32 years.',
  },
  {
    id: 'f04-m2-4', lesson: 'present-and-future-value', type: 'num', kind: 'numerical',
    prompt: 'A debt of $10,000 due in two years is to be replaced by two equal payments, one at the end of year 1 and one at the end of year 3, at 7% a year compounded annually. How large is each payment? Give dollars and cents.',
    answer: 4988.58, check: () => (10000 / 1.07 ** 2) / (1 / 1.07 + 1 / 1.07 ** 3), unit: '$', places: 2, tol: 1,
    wrong: [
      { value: 5000, say: 'Halving the debt ignores timing. Moved to year 2, a payment a year early is worth X × 1.07 and one a year late only X ÷ 1.07. Since 1.07 + 1 ÷ 1.07 = 2.004579 is more than 2, two payments of $5,000 would be worth $10,022.90 at year 2, slightly too much.' },
      { value: 5711.42, say: 'You set the payments equal to $10,000 at time 0 without discounting the debt: 10,000 ÷ 1.07² = 8,734.39.' },
    ],
    solution: 'Equation of value at time 0: X ÷ 1.07 + X ÷ 1.07³ = 10,000 ÷ 1.07². The left side is X × (0.934579 + 0.816298) = 1.750877X; the right side is $8,734.39. X = 8,734.39 ÷ 1.750877 ≈ $4,988.58. Each payment is slightly less than $5,000 because, at year 2, the early payment gains a full year’s interest (× 1.07) while the late one loses a little less (÷ 1.07).',
  },
  {
    id: 'f04-m2-5', lesson: 'present-and-future-value', type: 'mc', kind: 'applied',
    prompt: 'A fictional charity must pay a $50,000 bill in exactly two years and wants to set the money aside today. A two-year deposit pays 4.5% a year, compounded annually. Alternatively, a one-year deposit pays 4.0% now, and the treasurer expects one-year deposits to pay 5.2% next year. Which statement is right?',
    options: [
      'Rolling over one-year deposits needs about $86 less today if next year’s rate is 5.2%, but leaves the charity about $570 short if it stays at 4.0%; the two-year deposit fixes the amount',
      'Rolling over is better for certain, because its average rate (4.6%) is above 4.5%',
      'The two-year deposit needs less money today',
      'Both need exactly the same amount today, because both average about 4.5% a year',
    ],
    answer: 0,
    feedback: {
      1: 'Averaging rates is not the test, and nothing about next year’s rate is certain. Compare the products of the growth factors, and ask what happens if the forecast is wrong.',
      2: 'The two-year deposit needs $45,786.50 against $45,700.50 for rolling over at the expected rates: slightly more.',
      3: 'The growth factors differ: 1.045² = 1.092025 against 1.04 × 1.052 = 1.09408.',
    },
    solution: 'Two-year deposit: 50,000 ÷ 1.045² ≈ $45,786.50. Rolling over at the expected rates: 50,000 ÷ (1.04 × 1.052) ≈ $45,700.50, about $86 less. But if next year’s rate stays at 4.0%, $45,700.50 grows to only 45,700.50 × 1.04² ≈ $49,429.66, about $570 short. The choice is a small expected saving against the risk of a shortfall.',
  },
  {
    id: 'f04-m2-6', lesson: 'discounting-cash-flows', type: 'num', kind: 'numerical',
    prompt: 'A fictional contract pays $1,000 at the end of quarter 1, $2,000 at the end of quarter 3 and $3,000 at the end of quarter 4. At 6% a year compounded quarterly, what is it worth today? Give dollars and cents.',
    answer: 5724.41, check: () => 1000 / 1.015 + 2000 / 1.015 ** 3 + 3000 / 1.015 ** 4, unit: '$', places: 2, tol: 0.3,
    wrong: [
      { value: 5730.21, say: 'That discounts at an effective 6% a year. A rate of 6% compounded quarterly is 1.5% a quarter, an effective 6.14% a year.' },
      { value: 6000, say: 'That adds the payments without discounting.' },
      { value: 5795.50, say: 'You discounted by position (1, 2, 3 quarters). The payments fall at quarters 1, 3 and 4.' },
    ],
    solution: 'r = 1.5% a quarter. 1,000 ÷ 1.015 = $985.22; 2,000 ÷ 1.015³ = $1,912.63; 3,000 ÷ 1.015⁴ = $2,826.55. Total ≈ $5,724.41. The empty quarter 2 still counts as a period.',
  },
  {
    id: 'f04-m2-7', lesson: 'discounting-cash-flows', type: 'num', kind: 'applied',
    prompt: 'A fictional bakery is offered a new oven. It expects the oven to bring in extra net cash of $5,000, $6,000, $7,000 and $4,000 at the end of years 1 to 4, and it requires 11% a year. What is the most it should pay for the oven today? Give dollars and cents.',
    answer: 17127.50, check: () => 5000 / 1.11 + 6000 / 1.11 ** 2 + 7000 / 1.11 ** 3 + 4000 / 1.11 ** 4, unit: '$', places: 2, tol: 1.2,
    wrong: [
      { value: 22000, say: 'That adds the cash flows without discounting. Paying that much would leave the bakery earning nothing on its money.' },
      { value: 19011.53, say: 'That discounts each cash flow one period too few. The first $5,000 arrives at the end of year 1: divide it by 1.11.' },
    ],
    solution: 'The most it should pay is the present value of the inflows, the price at which the NPV is zero: 5,000 ÷ 1.11 + 6,000 ÷ 1.11² + 7,000 ÷ 1.11³ + 4,000 ÷ 1.11⁴ = 4,504.50 + 4,869.73 + 5,118.34 + 2,634.92 ≈ $17,127.50 (from unrounded values). At a price of $18,000, for example, the NPV would be −$872.50 and the oven would earn only about 8.7% a year.',
  },
  {
    id: 'f04-m2-8', lesson: 'discounting-cash-flows', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional company holds a note that pays 5% a year on $50,000, with interest paid quarterly and the principal at maturity in two years. Market rates for similar notes fall to 4%. What happens to the note’s value?',
    options: [
      'It rises above $50,000, because its fixed payments are now discounted at a lower rate',
      'It falls below $50,000, because investors can now earn only 4% elsewhere, so the market pays less',
      'It stays at $50,000, because the note’s interest payments and its face value are fixed and have not changed',
      'It rises only if the borrower also becomes safer, because a note’s value reflects its credit risk',
    ],
    answer: 0,
    feedback: {
      1: 'Lower rates make fixed future payments worth more today, not less.',
      2: 'The cash flows are unchanged, but their present value depends on the rate used to discount them.',
      3: 'A change in the borrower’s risk would also move the value, but a fall in market rates alone is enough to raise it.',
    },
    solution: 'A note’s value is the present value of its fixed payments at the market rate. When the market rate falls below the note’s own rate, the note pays more than the market asks for waiting, so it is worth more than its face value.',
  },
  {
    id: 'f04-m2-9', lesson: 'discounting-cash-flows', type: 'num', kind: 'numerical',
    prompt: 'A fictional sign-maker borrows $8,000 from an equipment dealer to buy a vinyl cutter, and repays $2,500, $3,000 and $3,800 at the end of years 1, 2 and 3. There are no fees. What annual rate is the sign-maker paying for the loan? Treat it as the IRR of the loan’s cash flows, find it by trial and give a percentage to two decimal places.',
    answer: 7.37, check: () => { const f = (r) => -8000 + 2500 / (1 + r) + 3000 / (1 + r) ** 2 + 3800 / (1 + r) ** 3; let lo = 0, hi = 1; for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; } return lo * 100; }, unit: '%', places: 2, tol: 0.05,
    wrong: [
      { value: 5.42, say: 'That spreads the $1,300 of interest evenly over three years as simple interest on the full $8,000, but the balance falls as payments are made. The loan’s rate is its IRR: the rate at which the repayments are worth exactly $8,000 today.' },
      { value: 16.25, say: 'That is the total interest as a share of the loan (1,300 ÷ 8,000), not an annual rate.' },
    ],
    solution: 'The sign-maker receives $8,000 now and pays $2,500, $3,000 and $3,800; the dealer’s cash flows are the mirror image, with the same IRR. From the dealer’s side, NPV at 7% = −8,000 + 2,336.45 + 2,620.32 + 3,101.93 ≈ +$58.70; at 8% = −8,000 + 2,314.81 + 2,572.02 + 3,016.56 ≈ −$96.61. Interpolating: 7% + 1% × 58.70 ÷ (58.70 + 96.61) ≈ 7.38%. Checking nearby rates (or a spreadsheet’s IRR) gives 7.37%: the loan costs about 7.37% a year, and interpolation overshoots slightly.',
  },
  {
    id: 'f04-m2-10', lesson: 'discounting-cash-flows', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about the internal rate of return are true? Select all that apply.',
    options: [
      'It is the discount rate at which a set of cash flows has an NPV of zero',
      'For a project with a cost now followed by inflows, an IRR above the required return means a positive NPV at that return',
      'When cash flows change sign more than once, there may be more than one IRR',
      'Of two projects that exclude each other, the one with the higher IRR always adds more value',
      'For any number of periods it can be found with a simple formula, like the present value of a single amount',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'A small project with a high IRR can have a lower NPV than a large one with a lower IRR. Choose the higher NPV.',
      4: 'Beyond two periods there is no simple formula; the IRR is found by trial, interpolation or a spreadsheet.',
    },
    solution: 'True: the definition (NPV = 0); the agreement of IRR and NPV for conventional projects; and the possibility of several IRRs when cash flows change sign more than once. False: the IRR does not rank exclusive projects reliably, and it has no simple closed-form formula.',
  },
  {
    id: 'f04-m2-11', lesson: 'discounting-cash-flows', type: 'num', kind: 'applied',
    prompt: 'Value Lantern’s Coastline note on 1 September 2027, just after that day’s $150 interest payment, assuming similar loans still cost 8% a year compounded quarterly. Two payments remain: $150 on 1 December 2027 and $150 plus the $10,000 principal on 1 March 2028. Give dollars and cents.',
    answer: 9902.92, check: () => N.quarterlyInterest / (1 + q) + (N.quarterlyInterest + N.principal) / (1 + q) ** 2, unit: '$', places: 2, tol: 0.6,
    wrong: [
      { value: 9809.61, say: 'That is the note’s value in March 2027, with four payments left. In September only two remain.' },
      { value: 10000, say: 'That is the face value. At 8% the note’s 6% payments are worth less than face value.' },
      { value: 9755.86, say: 'That counts only the final payment. Add the $150 due on 1 December.' },
    ],
    solution: 'r = 2% a quarter. Value = 150 ÷ 1.02 + 10,150 ÷ 1.02² = 147.06 + 9,755.86 ≈ $9,902.92. It is closer to $10,000 than in March ($9,809.61): as maturity nears, fewer below-market payments remain, so the value moves towards face value.',
  },
];
