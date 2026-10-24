// project.js — F04 applied project: Ana's home plan. She saves a deposit for five years, then chooses a mortgage.
// Every fact comes from case.js (ANA_PLAN); every number is computed below and checked by `verify` and the checker.
import { ANA_PLAN as A, DERIVED as D } from './case.js?v=12';

const pmt = (pv, r, n) => pv * r / (1 - (1 + r) ** -n);
const fvAnn = (c, r, n) => c * ((1 + r) ** n - 1) / r;
const bal = (pv, r, n, k) => pv * (1 + r) ** k - pmt(pv, r, n) * ((1 + r) ** k - 1) / r;
const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const cents = (x) => Math.round(x * 100) / 100;

const price = A.home.price, deposit = price * A.home.depositShare, loan = price - deposit;   // 300,000; 60,000; 240,000
const rs = A.saving.rate / 100 / 12;                                       // 0.003 a month
const save60 = deposit * rs / ((1 + rs) ** 60 - 1);                        // 914.19
const interestSaved = deposit - save60 * 60;                               // 5,148.37
const save48 = deposit * rs / ((1 + rs) ** 48 - 1);                        // 1,164.03
const saveDue = save60 / (1 + rs);                                         // 911.46
const r30 = A.mortgage30.rate / 100 / 12, r15 = A.mortgage15.rate / 100 / 12;
const p30 = pmt(loan, r30, 360), p15 = pmt(loan, r15, 180);                // 1,438.92; 1,948.29
const int30 = p30 * 360 - loan, int15 = p15 * 180 - loan;                 // 278,011.65; 110,691.81
const monthlyPay = A.salaryFromLantern / 12;                               // 4,000
const pointCost = loan * A.points.cost;                                    // 2,400
const rP = (A.mortgage30.rate - A.points.rateCut) / 100 / 12;
const pP = pmt(loan, rP, 360);                                             // 1,400.57
const saving = p30 - pP;                                                   // 38.35 a month
const simpleBE = pointCost / saving;                                       // 62.6 months
const balDiff60 = bal(loan, r30, 360, 60) - bal(loan, rP, 360, 60);        // 701.21
const pointNet60 = saving * (1 - (1 + r30) ** -60) / r30 + balDiff60 / (1 + r30) ** 60 - pointCost;   // +103.35
const bal30 = bal(loan, r30, 360, 60), bal15 = bal(loan, r15, 180, 60);    // 223,330.46; 180,344.52
const interest5y = p30 * 60 - (loan - bal30);                              // 69,665.73
const ear30 = ((1 + r30) ** 12 - 1) * 100;                                 // 6.1678 %
const real30 = ((1 + r30) ** 12 / (1 + A.inflation / 100) - 1) * 100;      // 3.2761 %
const lastReal = p30 / (1 + A.inflation / 100) ** 30;                      // 628.41 in April 2032 prices (the loan starts then)
const pointNet36 = saving * (1 - (1 + r30) ** -36) / r30 + (bal(loan, r30, 360, 36) - bal(loan, rP, 360, 36)) / (1 + r30) ** 36 - pointCost;   // −787.17
const pv15at6 = p15 * (1 - (1 + r30) ** -180) / r30;                       // 230,879: the 15-year payments valued at 6%

const OFFERS = {
  table: {
    caption: 'What Ana knows in April 2027 (all fictional)',
    head: ['Item', 'Figure'],
    rows: [
      ['Flat she hopes to buy in April 2032', '$300,000'],
      ['Deposit she wants to put down', '20% of the price'],
      ['Savings account for the deposit', '3.6% a year, compounded monthly (variable)'],
      ['30-year fixed-rate mortgage', '6.0% a year, monthly payments'],
      ['15-year fixed-rate mortgage', '5.4% a year, monthly payments'],
      ['Discount point on the 30-year loan', 'pay 1% of the loan up front to cut the rate by 0.25 percentage points'],
      ['Her pay from Lantern', '$48,000 a year'],
      ['Inflation she assumes', '2.8% a year'],
    ],
    align: ['l', 'l'],
  },
};

const num = (id, prompt, answer, check, tol, solution, wrong, unit = '$', places = 2) =>
  ({ id, type: 'num', kind: 'numerical', unit, places, prompt, answer, check, tol, solution, ...(wrong ? { wrong } : {}) });

export default {
  title: 'Ana’s home plan',
  brief: [
    { case: 'It is April 2027. Lantern Coffee has finished its first year, and Ana Lim now pays herself $48,000 a year from it. Her emergency fund stays where it is. She wants to buy a $300,000 flat in five years, putting down 20%, and has asked you two questions: how much she must save each month to get there, and which mortgage to take when she does. Ana, the flat, the accounts and every rate are fictional.' },
    OFFERS,
    { p: 'You will plan the saving, compare the two mortgages, decide whether the discount point is worth paying, see where the loan stands after five years and put the payments into the prices of April 2032, when the loan starts. Then you will write Ana a short recommendation. Assume each rate stays fixed at the figure shown, payments and deposits are made at the end of each month unless a question says otherwise, and taxes, insurance and fees beyond the point are left out. Keep at least six decimal places in every factor and round only the final answer.' },
    { callout: 'warn', title: 'Principal and interest only', html: 'A real mortgage payment usually also covers property taxes and insurance, often through an escrow account, and the loan comes with closing costs. This project looks only at principal and interest, so its payments understate what Ana would actually pay each month.' },
  ],
  deliverables: [
    'The monthly saving that builds the $60,000 deposit in five years, and how much of the deposit is interest.',
    'The monthly payment and total interest of each mortgage, and the payment as a share of Ana’s monthly pay.',
    'A decision on the discount point, with its simple break-even and its value if Ana sells after five years.',
    'The balance owed after five years, and the mortgage’s real cost and real burden under 2.8% inflation.',
    'A recommendation to Ana of about 200–300 words.',
  ],
  stages: [
    {
      id: 'save', title: 'Save the deposit',
      html: '<p>The deposit is 20% of $300,000. Ana saves the same amount at the end of every month for 60 months, in an account paying 3.6% a year compounded monthly (0.3% a month). The question is the payment of an ordinary annuity whose future value is the deposit.</p>',
      items: [
        num('f04-pj-1', 'How much must Ana save at the end of each month to have the deposit after 60 months? Give the answer to the cent.',
          cents(save60), () => 60000 * 0.003 / (1.003 ** 60 - 1), 0.05,
          `Deposit = 0.20 × 300,000 = $60,000. Monthly rate 0.036 ÷ 12 = 0.003. Payment = 60,000 × 0.003 ÷ (1.003⁶⁰ − 1) = 180 ÷ ${((1 + rs) ** 60 - 1).toFixed(6)} ≈ ${money(save60)}.`,
          [{ value: 1000, say: 'That is $60,000 ÷ 60, ignoring the interest the account pays. Each deposit earns interest until month 60, so less is needed.' }, { value: 1094.19, say: 'That uses the present-value annuity formula. The $60,000 is needed at the end, so use the future-value formula: payment = FV × r ÷ ((1 + r)ⁿ − 1).' }]),
        num('f04-pj-2', 'Of the $60,000, how much will be interest rather than Ana’s own deposits?',
          cents(interestSaved), () => 60000 - 60 * (60000 * 0.003 / (1.003 ** 60 - 1)), 0.5,
          `She deposits 60 × ${money(save60)} = ${money(save60 * 60)}; the other ${money(interestSaved)} is interest.`),
        num('f04-pj-3', 'If Ana started a year later and saved for 48 months instead, how much would she need to save each month?',
          cents(save48), () => 60000 * 0.003 / (1.003 ** 48 - 1), 0.3,
          `Payment = 60,000 × 0.003 ÷ (1.003⁴⁸ − 1) ≈ ${money(save48)}: ${money(save48 - save60)} a month more, because she has fewer deposits and less time for interest.`,
          [{ value: 1250, say: 'That is 60,000 ÷ 48 with no interest. Use the future-value annuity formula with n = 48.' }]),
        num('f04-pj-4', 'If instead she saved at the start of each month for 60 months (an annuity due), what monthly amount would reach $60,000?',
          cents(saveDue), () => 60000 * 0.003 / (1.003 ** 60 - 1) / 1.003, 0.05,
          `Each deposit earns one more month of interest, so the future value of an annuity due is the ordinary one × (1 + r). Payment = ${money(save60)} ÷ 1.003 ≈ ${money(saveDue)}.`,
          [{ value: 916.94, say: 'That multiplies by 1.003. Saving earlier means each deposit grows more, so the deposit needed is smaller: divide by 1.003.' }]),
      ],
    },
    {
      id: 'choose', title: 'Compare the two mortgages',
      html: '<p>With $60,000 down, Ana borrows $240,000. Each mortgage is an ordinary annuity: the loan is the present value of the monthly payments at the monthly rate (the annual rate ÷ 12).</p>',
      items: [
        num('f04-pj-5', 'What is the monthly payment on the 30-year mortgage at 6.0%?',
          cents(p30), () => 240000 * 0.005 / (1 - 1.005 ** -360), 0.1,
          `r = 0.06 ÷ 12 = 0.005, n = 360. Payment = 240,000 × 0.005 ÷ (1 − 1.005⁻³⁶⁰) ≈ ${money(p30)}.`,
          [{ value: 17435.74, say: 'That is an annual payment at 6% for 30 years. The mortgage is paid monthly: use 0.005 and 360.' }, { value: 1200, say: 'That is interest only (240,000 × 0.005). The payment must also repay the loan.' }]),
        num('f04-pj-6', 'What is the monthly payment on the 15-year mortgage at 5.4%?',
          cents(p15), () => 240000 * 0.0045 / (1 - 1.0045 ** -180), 0.15,
          `r = 0.054 ÷ 12 = 0.0045, n = 180. Payment = 240,000 × 0.0045 ÷ (1 − 1.0045⁻¹⁸⁰) ≈ ${money(p15)}.`),
        num('f04-pj-7', 'How much interest does Ana pay over the whole 30-year loan if she keeps it to the end? (Round the payment to the cent first.)',
          cents(cents(p30) * 360 - loan), () => Math.round(240000 * 0.005 / (1 - 1.005 ** -360) * 100) / 100 * 360 - 240000, 30,
          `360 × ${money(p30)} − 240,000 ≈ ${money(cents(p30) * 360 - loan)}: more than the amount borrowed.`),
        num('f04-pj-8', 'And over the whole 15-year loan? (Round the payment to the cent first.)',
          cents(cents(p15) * 180 - loan), () => Math.round(240000 * 0.0045 / (1 - 1.0045 ** -180) * 100) / 100 * 180 - 240000, 25,
          `180 × ${money(p15)} − 240,000 ≈ ${money(cents(p15) * 180 - loan)}.`),
        num('f04-pj-9', 'What share of Ana’s monthly pay from Lantern ($48,000 ÷ 12) would the 30-year payment take? Give a percentage to one decimal place.',
          Math.round(p30 / monthlyPay * 1000) / 10, () => 240000 * 0.005 / (1 - 1.005 ** -360) / 4000 * 100, 0.1,
          `${money(p30)} ÷ $4,000 ≈ ${(p30 / monthlyPay * 100).toFixed(1)}%. The 15-year payment would take ${(p15 / monthlyPay * 100).toFixed(1)}%.`, null, '%', 1),
        { id: 'f04-pj-10', type: 'mc', kind: 'applied',
          prompt: 'Which statement compares the two mortgages correctly?',
          options: [
            'The 15-year loan costs about $509 a month more, but about $167,000 less in total interest',
            'The 30-year loan is more expensive in every sense, so Ana should take the 15-year loan if a lender will approve her',
            'The two are equally expensive, because each loan’s payments are worth exactly $240,000 at its own interest rate',
          ],
          answer: 0,
          feedback: { 1: 'It costs more interest in total, but it asks for a much smaller payment each month and leaves Ana free to repay faster if she can. Lower required payments are worth something when income is uncertain.', 2: `Each is worth $240,000 only at its own rate. Valued at one rate, say 6%, the 15-year payments are worth about ${money(pv15at6)}: its lower rate saves about ${money(loan - pv15at6)} today, far less than the $167,000 interest gap suggests.` },
          solution: `Total interest: ${money(int30)} against ${money(int15)}, a difference of about ${money(int30 - int15)}. Monthly payment: ${money(p30)} against ${money(p15)}, ${money(p15 - p30)} more for the 15-year loan. Much of the interest gap is the result of repaying in half the time; valued at 6%, the 15-year loan’s lower rate is worth about ${money(loan - pv15at6)} today. The shorter loan is cheaper; the longer one asks for less each month, which matters for someone whose income depends on a young business.` },
      ],
    },
    {
      id: 'points', title: 'Is the discount point worth it?',
      html: '<p>The lender offers to cut the 30-year rate from 6.0% to 5.75% if Ana pays one point: 1% of the loan, up front. Paying it is an investment: $2,400 now in exchange for lower payments for as long as she keeps the loan. Many people sell or refinance well before 30 years, so the answer depends on how long she keeps it.</p>',
      items: [
        num('f04-pj-11', 'What is the monthly payment at 5.75%?',
          cents(pP), () => 240000 * (0.0575 / 12) / (1 - (1 + 0.0575 / 12) ** -360), 0.05,
          `r = 0.0575 ÷ 12 ≈ 0.00479167. Payment = 240,000 × r ÷ (1 − (1 + r)⁻³⁶⁰) ≈ ${money(pP)}, which is ${money(saving)} a month less.`),
        num('f04-pj-12', 'Ignoring interest on the savings, after how many months do the lower payments repay the $2,400? Give months to one decimal place.',
          Math.round(simpleBE * 10) / 10, () => 2400 / (240000 * 0.005 / (1 - 1.005 ** -360) - 240000 * (0.0575 / 12) / (1 - (1 + 0.0575 / 12) ** -360)), 0.2,
          `2,400 ÷ ${saving.toFixed(4)} ≈ ${simpleBE.toFixed(1)} months, a little over five years. This is the simple break-even lenders and websites usually quote.`, null, 'months', 1),
        { id: 'f04-pj-13', type: 'steps', kind: 'applied',
          prompt: 'Suppose Ana sells the flat and repays the loan after exactly five years. Value the point properly: discount everything at the mortgage’s own monthly rate of 0.5%.',
          solution: `PV of 60 monthly savings: ${saving.toFixed(4)} × (1 − 1.005⁻⁶⁰) ÷ 0.005 ≈ ${money(saving * (1 - 1.005 ** -60) / 0.005)}. The lower rate also leaves a smaller balance to repay: ${money(bal30)} against ${money(bal(loan, rP, 360, 60))}, ${money(balDiff60)} less, worth ${money(balDiff60 / 1.005 ** 60)} today. Total ${money(saving * (1 - 1.005 ** -60) / 0.005 + balDiff60 / 1.005 ** 60)}, against $2,400 paid: the point is worth about ${money(pointNet60)} if she stays five years. Over three years it would lose about ${money(-pointNet36)}.`,
          steps: [
            num('f04-pj-13a', 'What is the present value, at 0.5% a month, of 60 monthly savings of the payment difference?',
              cents(saving * (1 - 1.005 ** -60) / 0.005), () => (240000 * 0.005 / (1 - 1.005 ** -360) - 240000 * (0.0575 / 12) / (1 - (1 + 0.0575 / 12) ** -360)) * (1 - 1.005 ** -60) / 0.005, 0.5,
              `${saving.toFixed(4)} × (1 − 1.005⁻⁶⁰) ÷ 0.005 = ${saving.toFixed(4)} × ${((1 - 1.005 ** -60) / 0.005).toFixed(4)} ≈ ${money(saving * (1 - 1.005 ** -60) / 0.005)}.`,
              [{ value: 2300.78, say: 'That is 60 × the monthly saving, with no discounting. Savings that come later are worth less today.' }]),
            num('f04-pj-13b', 'After 60 payments, how much smaller is the balance on the 5.75% loan than on the 6.0% loan?',
              cents(balDiff60), () => { const b = (r) => 240000 * (1 + r) ** 60 - 240000 * r / (1 - (1 + r) ** -360) * ((1 + r) ** 60 - 1) / r; return b(0.005) - b(0.0575 / 12); }, 1,
              `Balance after 60 payments = PV(1 + r)⁶⁰ − payment × ((1 + r)⁶⁰ − 1) ÷ r. At 6.0%: ${money(bal30)}; at 5.75%: ${money(bal(loan, rP, 360, 60))}. Difference ${money(balDiff60)}.`),
            num('f04-pj-13c', 'Net value of paying the point if she sells after five years: present value of both benefits minus $2,400.',
              cents(pointNet60), () => { const s = 240000 * 0.005 / (1 - 1.005 ** -360) - 240000 * (0.0575 / 12) / (1 - (1 + 0.0575 / 12) ** -360); const b = (r) => 240000 * (1 + r) ** 60 - 240000 * r / (1 - (1 + r) ** -360) * ((1 + r) ** 60 - 1) / r; return s * (1 - 1.005 ** -60) / 0.005 + (b(0.005) - b(0.0575 / 12)) / 1.005 ** 60 - 2400; }, 1.5,
              `${money(saving * (1 - 1.005 ** -60) / 0.005)} + ${money(balDiff60 / 1.005 ** 60)} − $2,400 ≈ ${money(pointNet60)}. Slightly positive: the point pays if she is confident she will keep the loan five years or more.`,
              [{ value: -416.51, say: 'That leaves out the smaller balance she repays when she sells. A lower rate repays the loan slightly faster, and that is worth something too.' }]),
          ] },
      ],
    },
    {
      id: 'later', title: 'Five years on',
      html: '<p>Most of a long mortgage’s early payments are interest. Find what Ana would still owe after five years of each loan (60 payments) and how much of the 30-year loan’s first five years of payments went to interest.</p>',
      items: [
        num('f04-pj-14', 'What is the balance on the 30-year loan (at 6.0%) after 60 payments? Use the unrounded payment.',
          cents(bal30), () => 240000 * 1.005 ** 60 - 240000 * 0.005 / (1 - 1.005 ** -360) * (1.005 ** 60 - 1) / 0.005, 3,
          `Retrospective: 240,000 × 1.005⁶⁰ − payment × (1.005⁶⁰ − 1) ÷ 0.005 ≈ ${money(bal30)}. Prospective check: the PV of the remaining 300 payments, payment × (1 − 1.005⁻³⁰⁰) ÷ 0.005, gives the same.`,
          [{ value: 153664.72, say: 'That subtracts 60 payments from $240,000 as if all of each payment repaid the loan. Most of an early payment is interest.' }]),
        num('f04-pj-15', 'How much of the 30-year loan’s first 60 payments was interest?',
          cents(interest5y), () => { const p = 240000 * 0.005 / (1 - 1.005 ** -360); const b = 240000 * 1.005 ** 60 - p * (1.005 ** 60 - 1) / 0.005; return 60 * p - (240000 - b); }, 3,
          `She pays 60 × ${money(p30)} = ${money(60 * p30)}, of which ${money(loan - bal30)} reduced the loan; the remaining ${money(interest5y)} was interest (about ${(interest5y / (60 * p30) * 100).toFixed(0)}%).`),
        num('f04-pj-16', 'And the balance on the 15-year loan (at 5.4%) after 60 payments?',
          cents(bal15), () => 240000 * 1.0045 ** 60 - 240000 * 0.0045 / (1 - 1.0045 ** -180) * (1.0045 ** 60 - 1) / 0.0045, 8,
          `240,000 × 1.0045⁶⁰ − payment × (1.0045⁶⁰ − 1) ÷ 0.0045 ≈ ${money(bal15)}: about ${money(bal30 - bal15)} less than on the 30-year loan.`,
          [{ value: 123102.73, say: 'That subtracts 60 whole payments from $240,000. Part of each payment is interest, so the balance falls more slowly.' }]),
      ],
    },
    {
      id: 'real', title: 'In real terms',
      html: '<p>Ana’s payment is fixed in dollars for 30 years, but if prices rise by 2.8% a year, each dollar buys less. Find the mortgage’s real annual rate, and what the very last payment is worth in the prices of April 2032, when the loan starts.</p>',
      items: [
        num('f04-pj-17', 'What is the 30-year mortgage’s real annual rate if inflation is 2.8% a year? Work from its effective annual rate (6.0% compounded monthly) and use the exact formula. Two decimal places.',
          Math.round(real30 * 100) / 100, () => (1.005 ** 12 / 1.028 - 1) * 100, 0.01,
          `Effective annual rate = 1.005¹² − 1 ≈ ${ear30.toFixed(4)}%. Real rate = 1.061678 ÷ 1.028 − 1 ≈ ${real30.toFixed(2)}%.`, [{ value: 3.11, say: '1.06 ÷ 1.028 − 1 uses the quoted 6.0%. Convert to the effective rate first.' }, { value: 3.37, say: 'That subtracts 2.8 from the effective rate. The exact real rate divides: 1.061678 ÷ 1.028 − 1.' }, { value: 3.2, say: 'That subtracts inflation from the nominal 6.0%, and uses the approximation. Use the effective rate and divide.' }], '%', 2),
        num('f04-pj-18', 'The last payment is made 30 years after the loan starts in April 2032. What is it worth in April 2032 prices, at 2.8% inflation a year?',
          cents(lastReal), () => 240000 * 0.005 / (1 - 1.005 ** -360) / 1.028 ** 30, 0.5,
          `${money(p30)} ÷ 1.028³⁰ ≈ ${money(lastReal)}. A fixed payment gets lighter every year if prices and pay rise.`,
          [{ value: 547.37, say: 'That discounts 35 years, to April 2027 prices. The question asks for prices when the loan starts, 30 years before the last payment.' }]),
      ],
    },
    {
      id: 'recommend', title: 'Recommend',
      html: '<p>Write Ana a recommendation she can act on. Use your numbers but explain them in plain words. More than one answer is defensible; what matters is that it follows from her situation and the evidence.</p>',
      items: [
        { id: 'f04-pj-19', type: 'short', kind: 'applied',
          prompt: 'Write your recommendation to Ana (about 200–300 words): how much to save each month, which mortgage to take, and whether to pay the point.',
          rubric: [
            'States the monthly saving and says it assumes the 3.6% rate holds.',
            'Chooses a mortgage and justifies it with the monthly payment, the cost (total interest, noting that a longer term inflates it, or present value) and Ana’s income risk.',
            'Decides on the point using how long she expects to keep the loan, not only the simple break-even.',
            'Uses the five-year balance or the real burden of the payment to make a point Ana can use.',
            'Notes that taxes, insurance and closing costs are extra, and says what would change the advice.',
            'Is written for Ana: short sentences, terms explained.',
          ],
          model: `Save ${money(save60)} at the end of every month from now until April 2032. If the account keeps paying 3.6%, that grows to the $60,000 deposit, ${money(interestSaved)} of it interest. If the rate falls, raise the amount.<br><br>When you buy, I suggest the 30-year mortgage. Its payment, ${money(p30)} a month, is about ${(p30 / monthlyPay * 100).toFixed(0)}% of your current pay from Lantern; the 15-year loan would take ${(p15 / monthlyPay * 100).toFixed(0)}%. The 15-year loan charges far less interest (about $${Math.round(int15).toLocaleString('en-US')} in total against $${Math.round(int30).toLocaleString('en-US')}), though much of that gap is just paying the loan off in half the time; valued at 6%, its lower rate is worth about $${(Math.round((loan - pv15at6) / 100) * 100).toLocaleString('en-US')} today. But your income depends on a young business, and the lower required payment protects you in a bad year. You can still pay extra in good years and shorten the loan yourself.<br><br>Pay the point only if you expect to keep the loan for at least five years. It lowers the payment by ${money(saving)} a month; counting the smaller balance it leaves, it is worth about ${money(pointNet60)} more than it costs over five years, but over three years it would lose about ${money(-pointNet36)}.<br><br>Expect the early years to be mostly interest: after five years you would still owe about ${money(bal30)}. On the other hand, at 2.8% inflation the fixed payment gets lighter; the last one is worth about ${money(lastReal)} in 2032 prices.<br><br>These figures cover principal and interest only. Property taxes, insurance and closing costs come on top, so check the full monthly cost before you commit.`,
          solution: 'Compare your answer with the model and the rubric. Choosing the 15-year loan can also earn full marks if you explain why Ana can carry the higher payment safely.' },
      ],
    },
  ],
  rubric: [
    'Every figure is correct to the precision asked, each labelled with what it is.',
    'Saving uses the future value of an annuity; mortgage payments and balances use the present value of an annuity at the monthly rate.',
    'The point is judged by present value over the time Ana expects to keep the loan.',
    'Fictional facts are presented as the case, and the recommendation says what is left out.',
  ],
  verify() {
    return [
      ['deposit', deposit, D.deposit], ['loan', loan, D.loan],
      ['monthly saving', save60, D.monthlySavingForDeposit, 1e-9],
      ['30-year payment', p30, D.payment30, 1e-9], ['15-year payment', p15, D.payment15, 1e-9],
      ['30-year interest', int30, D.totalInterest30, 1e-6], ['15-year interest', int15, D.totalInterest15, 1e-6],
      ['payment with point', pP, D.payment30WithPoint, 1e-9], ['balance after 5 years', bal30, D.balance30after5y, 1e-6],
      ['saving 48 months', save48, 1164.03, 0.005], ['annuity due saving', saveDue, 911.46, 0.005],
      ['interest in deposit', interestSaved, 5148.37, 0.005], ['simple break-even', simpleBE, 62.59, 0.005],
      ['point net 5 years', pointNet60, 103.35, 0.005], ['15-year balance', bal15, 180344.52, 0.005],
      ['interest 5 years', interest5y, 69665.73, 0.005], ['point net 3 years', pointNet36, -787.17, 0.005], ['15-year payments at 6%', pv15at6, 230879, 1], ['EAR', ear30, 6.1678, 0.0001], ['real rate', real30, 3.2761, 0.0001],
      ['last payment real', lastReal, 628.41, 0.005], ['balance difference', balDiff60, 701.21, 0.005],
    ];
  },
};
