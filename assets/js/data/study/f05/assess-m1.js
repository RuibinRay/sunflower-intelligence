// assess-m1.js — F05 module 1 test: Investment decisions (net-present-value, investment-criteria, project-cash-flows).
// No hints. Each item has a full solution, shown when the student reviews the test. New scenarios, not copies of the
// lesson exercises; every business and figure is fictional. Item 11 uses the roaster’s seven-year life from case.js.
import { ROASTER, TAX } from './case.js?v=28';
import { npv, irr, mirr } from '../../../core/invest.js?v=28';

const af = (r, n) => (1 - (1 + r) ** -n) / r;
const M = '$#,##0';

export const items = [
  {
    id: 'f05-m1-1', lesson: 'net-present-value', type: 'num', kind: 'numerical',
    prompt: 'A fictional veterinary clinic can buy an X-ray unit for $36,000. It expects extra after-tax cash flows of $9,000, $11,000, $12,000 and $12,000 at the end of years 1 to 4, and nothing after. Its opportunity cost of capital is 10%. What is the NPV? Give whole dollars, with a minus sign if negative.',
    answer: -1515, check: () => npv(0.10, [-36000, 9000, 11000, 12000, 12000]), unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 8000, say: 'That adds the cash flows without discounting (44,000 − 36,000).' },
      { value: -1378, say: 'That discounts the outlay as well, as Excel’s NPV() does with all five values in its range. The outlay is paid today.' },
    ],
    solution: 'PV of inflows = 9,000 ÷ 1.1 + 11,000 ÷ 1.21 + 12,000 ÷ 1.331 + 12,000 ÷ 1.4641 = 8,181.82 + 9,090.91 + 9,015.78 + 8,196.16 ≈ $34,485. NPV ≈ 34,485 − 36,000 ≈ −$1,515. Reject: the unit earns less than 10% a year, although its cash flows add up to more than its cost.',
  },
  {
    id: 'f05-m1-2', lesson: 'net-present-value', type: 'mc', kind: 'conceptual',
    prompt: 'The argument that every owner of a firm wants it to accept all positive-NPV projects, whatever their own preference for spending now or later, depends on an assumption. In which situation is the argument weakest?',
    options: [
      'The firm is large and its shares trade every day on a stock exchange',
      'The owners can lend cheaply but can borrow only at a much higher rate',
      'The project’s cash flows are spread over many years',
      'The owners disagree with one another about when they want to spend their money',
    ],
    answer: 1,
    feedback: {
      0: 'Shareholders of a listed firm can sell or buy shares and borrow or lend at close to market rates, which is when the argument is strongest.',
      2: 'A long project is fine: its NPV still measures what owners could spend today by borrowing against it, if borrowing is available at the market rate.',
      3: 'Disagreement about timing is exactly what borrowing and lending resolve; it is not the assumption that fails.',
    },
    solution: 'The separation of investment from owners’ tastes needs owners to borrow and lend at (about) the same market rate. If borrowing is much dearer than lending, as for many owners of small private firms, an impatient owner cannot cheaply turn a positive NPV into cash today, and her preference for early cash can reasonably affect the firm’s choices.',
  },
  {
    id: 'f05-m1-3', lesson: 'net-present-value', type: 'formula', kind: 'applied',
    prompt: 'A fictional festival organiser lays its cash flows out across a row: year 0 in B3 and years 1 to 5 in C3:G3, with the discount rate in B1. In B5, write a formula for the NPV.',
    sheet: { cells: { A1: 'Discount rate', B1: 0.12, A2: 'Year', B2: 0, C2: 1, D2: 2, E2: 3, F2: 4, G2: 5, A3: 'Cash flow', B3: -48000, C3: 9000, D3: 14000, E3: 16000, F3: 16000, G3: 12000, A5: 'NPV' }, fixed: ['B2:G2'] },
    cell: 'B5', view: 'A1:G5', widths: { A: 14 }, formats: { B1: '0.0%', B3: M, C3: M, D3: M, E3: M, F3: M, G3: M, B5: M },
    answer: '=B3+NPV(B1,C3:G3)',
    alt: ['=NPV(B1,C3:G3)+B3', '=SUM(B3,NPV(B1,C3:G3))'],
    require: ['NPV'],
    wrong: [
      { formula: '=NPV(B1,B3:G3)', say: 'NPV() discounts its first value by a year, so the year-0 outlay would be discounted. Add B3 outside the function.' },
      { formula: '=NPV(B1,C3:G3)', say: 'That is the present value of years 1 to 5 only; add the year-0 outlay in B3.' },
    ],
    solution: '<x>=B3+NPV(B1,C3:G3)</x> ≈ −$438, so the festival should not go ahead on these figures. A row works exactly like a column: NPV() takes years 1 to 5 in order, and the year-0 flow is added as it stands.',
  },
  {
    id: 'f05-m1-4', lesson: 'net-present-value', type: 'num', kind: 'applied',
    prompt: 'The fictional owner of a cycle-repair shop can buy a wheel-truing machine for $12,000 that will bring in $3,400 a year after tax for five years. She can borrow at 8% a year against cash flows like these. If she borrows the most the machine’s cash flows can repay and buys the machine with the loan, how much cash is left for her to spend today? Give whole dollars.',
    answer: 1575, check: () => 3400 * af(0.08, 5) - 12000, unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 13575, say: 'That is the loan the cash flows can repay. She spends $12,000 of it on the machine.' },
      { value: 5000, say: 'That ignores interest on the loan (5 × 3,400 − 12,000).' },
    ],
    solution: 'The most she can borrow is the present value of $3,400 a year for five years at 8%: 3,400 × 3.992710 ≈ $13,575. After paying $12,000 for the machine she keeps about $1,575: the machine’s NPV, available to spend today.',
  },
  {
    id: 'f05-m1-5', lesson: 'investment-criteria', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional software firm sells a three-year support contract: the client pays $30,000 today and serving the contract costs the firm $12,000 at the end of each of the next three years. The cash flows’ IRR is 9.7% and the firm’s opportunity cost of capital is 10%. Should the firm sign?',
    options: [
      'No: the IRR of 9.7% is below the 10% opportunity cost',
      'Yes: cash comes in first, so 9.7% is a cost of funds below 10%',
      'No: a contract whose costs ($36,000) exceed its price ($30,000) always loses value',
      'It cannot be decided, because these cash flows have no IRR',
    ],
    answer: 1,
    feedback: {
      0: 'For investing-type flows (out first) that would be right. Here money comes in first, so the rule reverses.',
      2: 'The costs come later and are discounted; at 10% they are worth $29,842 today, less than the $30,000 received.',
      3: 'There is exactly one sign change (+, −, −, −), so there is one IRR, 9.7%.',
    },
    solution: 'This is a borrowing-type stream: the client in effect lends the firm $30,000 at 9.7%, cheaper than the 10% the firm’s money costs. NPV at 10% = 30,000 − 12,000 × 2.486852 ≈ +$158: sign.',
  },
  {
    id: 'f05-m1-6', lesson: 'investment-criteria', type: 'num', kind: 'numerical',
    prompt: 'A fictional project costs $20,000 today and returns $8,000, $9,000 and $10,000 at the end of years 1 to 3. The firm borrows at 8% and can reinvest cash at 6%. What is the project’s MIRR? Give a percentage to two decimal places.',
    answer: 12.57, check: () => mirr([-20000, 8000, 9000, 10000], 0.08, 0.06) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 15.98, say: 'That is the IRR. The MIRR compounds the inflows at the 6% reinvestment rate.' },
      { value: 13.25, say: 'The rates are swapped: inflows are compounded at the reinvestment rate (6%), outflows discounted at the finance rate (8%).' },
    ],
    solution: 'The only outflow is at year 0, so its present value is $20,000. Inflows compounded to year 3 at 6%: 8,000 × 1.1236 + 9,000 × 1.06 + 10,000 = 8,988.80 + 9,540 + 10,000 = $28,528.80. MIRR = (28,528.80 ÷ 20,000)^(1/3) − 1 ≈ 12.57%.',
  },
  {
    id: 'f05-m1-7', lesson: 'investment-criteria', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the statements about investment criteria.',
    text: 'The payback rule ignores [[0]]. A project’s profitability index is above 1 exactly when [[1]]. When a project’s cash flows have two IRRs, Excel’s IRR() returns [[2]].',
    blanks: [
      { options: ['the size of the initial outlay', 'every cash flow after the cutoff', 'the cash flows in the first year'], answer: 1 },
      { options: ['its NPV is positive', 'its IRR is above 100%', 'its payback is under one year'], answer: 0 },
      { options: ['both IRRs, as a list', 'an error, always', 'one root, which depends on the guess'], answer: 2 },
    ],
    solution: 'Payback stops counting at the cutoff, so later cash flows never matter. PI = 1 + NPV ÷ outlay, so PI > 1 exactly when NPV > 0. IRR() searches from a guess and returns the first root it reaches, without saying another exists.',
  },
  {
    id: 'f05-m1-8', lesson: 'project-cash-flows', type: 'num', kind: 'numerical',
    prompt: 'In the final year (year 4) of a fictional e-bike rental project: revenue $80,000; cash operating costs $50,000; depreciation $3,000; tax 25%. The $8,000 of working capital held is recovered, and the bikes are sold for $6,000 against a tax book value of $2,000. What is year 4’s free cash flow?',
    answer: 36250, check: () => (80000 - 50000 - 3000) * (1 - TAX) + 3000 + 8000 + (6000 - TAX * (6000 - 2000)), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 37250, say: 'That adds the whole $6,000 sale price. The $4,000 gain over book value is taxed: after-tax salvage is $5,000.' },
      { value: 28250, say: 'That leaves out the $8,000 of working capital recovered at the end.' },
      { value: 33250, say: 'Depreciation must be added back after tax; it is not a cash cost.' },
    ],
    solution: 'EBIT = 80,000 − 50,000 − 3,000 = $27,000; OCF = 27,000 × 0.75 + 3,000 = $23,250. Working capital recovered: +$8,000. After-tax salvage = 6,000 − 0.25 × (6,000 − 2,000) = $5,000. FCF = 23,250 + 8,000 + 5,000 = $36,250.',
  },
  {
    id: 'f05-m1-9', lesson: 'project-cash-flows', type: 'multi', kind: 'applied',
    prompt: 'A fictional hotel is appraising a rooftop spa. Select all the items that belong in the spa’s incremental cash flows.',
    options: [
      'Rent the hotel would forgo by not letting the roof to a mobile-phone company',
      'Spending by spa guests in the hotel restaurant who would not otherwise have eaten there',
      'A share of the general manager’s salary, which is unchanged by the spa',
      'The $40,000 design study commissioned and paid for last year',
      'Interest on the loan the hotel plans to take out for the build',
      'Depreciation of the spa’s equipment, as an expense to be deducted from cash',
    ],
    answer: [0, 1],
    feedback: {
      2: 'An allocation of a cost that does not change is not incremental.',
      3: 'Already paid and unrecoverable: a sunk cost.',
      4: 'Financing costs are reflected in the discount rate, not the cash flows.',
      5: 'Depreciation is not a cash outflow. It matters only through the tax it saves, the depreciation tax shield.',
    },
    solution: 'Include the roof rent forgone (an opportunity cost) and the extra restaurant spending (a positive side effect, at its after-tax margin). Leave out the unchanged salary allocation, the sunk study and the interest; depreciation enters only through its tax shield, not as a cash cost.',
  },
  {
    id: 'f05-m1-10', lesson: 'project-cash-flows', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional furniture maker forecasts a new range’s sales and costs at today’s prices, with no allowance for inflation, and discounts them at its nominal opportunity cost of capital. Inflation is expected to be about 3% a year. What does that do to the NPV?',
    options: [
      'Nothing, because inflation affects revenue and costs equally',
      'It overstates the NPV, because the nominal rate is too low for real cash flows',
      'It understates it: the rate includes inflation that the cash flows leave out',
      'It understates the NPV, but only if the project holds working capital that grows with sales',
    ],
    answer: 2,
    feedback: {
      0: 'Even if prices and costs rise together, the net cash flows rise with them; the forecast leaves that out while the rate puts inflation in.',
      1: 'The nominal rate is higher than the real rate, not lower, so the mismatch pushes the NPV down.',
      3: 'The mismatch affects every future cash flow, not only working capital.',
    },
    solution: 'Real cash flows must be discounted at the real rate, or inflated and discounted at the nominal rate. Discounting real cash flows at a nominal rate penalises them for inflation they do not include, so the NPV is understated.',
  },
  {
    id: 'f05-m1-11', lesson: 'project-cash-flows', type: 'num', kind: 'applied',
    prompt: 'Lantern’s roaster is depreciated by 7-year MACRS, and Ana’s accountant points out that she could instead use straight-line depreciation over the roaster’s seven-year life. The roaster’s depreciable basis is $48,000, tax is 25% and the rate 11%. Ignore the salvage value. In present value, how much larger are the depreciation tax shields over years 1 to 7 under MACRS than under straight line? Give whole dollars.',
    answer: 98, check: () => {
      const basis = ROASTER.price + ROASTER.install, n = ROASTER.life;
      const pv = (d) => d.reduce((s, x, t) => s + x * TAX / 1.11 ** (t + 1), 0);
      const macrs = [14.29, 24.49, 17.49, 12.49, 8.93, 8.92, 8.93].map((p) => basis * p / 100);
      return pv(macrs) - pv(Array(n).fill(basis / n));
    }, unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 0, say: 'Over seven years MACRS deducts less than the full cost (4.46% is left for year 8), but it deducts more of it early, and early tax savings are worth more.' },
    ],
    solution: 'Straight line deducts 48,000 ÷ 7 ≈ $6,857 a year: shields of $1,714 a year, worth 1,714.29 × 4.712196 ≈ $8,078. MACRS deducts 14.29%, 24.49%, 17.49%, 12.49%, 8.93%, 8.92% and 8.93% of $48,000 in years 1 to 7; 25% of those, discounted at 11%, is worth about $8,176. MACRS adds about $98 in present value, even though it leaves 4.46% of the cost for year 8 (which the lesson’s full analysis recovers through a smaller taxable gain on sale).',
  },
];
