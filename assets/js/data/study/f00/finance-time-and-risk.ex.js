// finance-time-and-risk.ex.js — F00 · What finance is: money, time and risk: widget, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).

const money = (v) => {
  const c = Math.round(Math.abs(v) * 100) / 100;
  const s = c.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${v < 0 && c !== 0 ? '−' : ''}$${s}`;
};

export const widgets = {
  'tvm-explorer': {
    type: 'formula',
    title: 'Future and present value explorer',
    intro: 'Choose an amount, an annual interest rate and a number of years. The explorer carries the amount forward (future value) and, separately, brings the same amount back from the future (present value).',
    inputs: [
      { id: 'amount', label: 'Amount', min: 100, max: 50000, step: 100, value: 20000, fmt: 'money' },
      { id: 'rate', label: 'Interest or discount rate per year', min: 0, max: 15, step: 0.1, value: 1.5, fmt: 'pct' },
      { id: 'years', label: 'Number of years', min: 1, max: 30, step: 1, value: 3, fmt: 'int', unit: 'years' },
    ],
    compute: (v) => {
      const r = v.rate / 100;
      const n = Math.round(v.years);
      const growth = (1 + r) ** n;
      const fv = v.amount * growth;
      const pv = v.amount / growth;
      const simple = v.amount * (1 + r * n);
      const xs = Array.from({ length: n + 1 }, (_, t) => t);
      let note;
      if (r === 0) {
        note = 'At a 0% rate money earns nothing while it waits, so an amount is worth the same today and in the future. Any positive rate breaks that tie in favour of having the money sooner.';
      } else {
        note = `At ${v.rate.toFixed(1)}% a year, ${money(v.amount)} today grows to ${money(fv)} after ${n} year${n === 1 ? '' : 's'}. Read the other way, ${money(v.amount)} that arrives in ${n} year${n === 1 ? '' : 's'} is worth only ${money(pv)} today. ${n > 1 ? `Of the interest, ${money(fv - simple)} is interest earned on earlier interest: the gap between compounding and simple interest, which widens as the years go by.` : 'With a single year there is no interest on interest yet, so compound and simple interest agree.'}`;
      }
      return {
        headline: { label: `Future value after ${n} year${n === 1 ? '' : 's'}`, value: money(fv) },
        rows: [
          ['Growth factor (1 + r)ⁿ', growth.toFixed(6)],
          ['Interest earned', money(fv - v.amount)],
          ['Simple interest for comparison: amount × (1 + r × n)', money(simple)],
          [`Present value of the same amount received in ${n} year${n === 1 ? '' : 's'}`, money(pv)],
        ],
        note,
        chart: {
          kind: 'line',
          x: { label: 'Year', values: xs },
          series: [
            { name: 'Value of the amount invested today', values: xs.map((t) => Math.round(v.amount * (1 + r) ** t * 100) / 100) },
            { name: 'Value today of the amount received in that year', values: xs.map((t) => Math.round((v.amount / (1 + r) ** t) * 100) / 100) },
          ],
          y: { label: 'Dollars' },
        },
      };
    },
  },
};

const BRANCHES = ['Personal finance', 'Corporate finance', 'Investment finance', 'Public finance'];

export const guided = [
  {
    id: 'f00-ftr-g1', type: 'steps', kind: 'numerical',
    prompt: 'Suppose Ana had left $5,000 in her Coastline Bank savings account at 1.5% a year, paid once a year, for four years. Work out what she would have.',
    solution: 'Growth factor: 1.015⁴ = 1.061364 (to six decimal places). Future value: 5,000 × 1.061364 = $5,306.82. Interest: 5,306.82 − 5,000 = $306.82. Simple interest would give 5,000 × 0.015 × 4 = $300, so $6.82 is interest earned on earlier interest.',
    steps: [
      { id: 'f00-ftr-g1-s1', type: 'num',
        prompt: 'What is the growth factor (1 + r)ⁿ? Give it to four decimal places.',
        answer: 1.0614, check: () => 1.015 ** 4, unit: '', places: 4, tol: 0.0001,
        hints: ['Write 1.5% as a decimal first: 0.015. So 1 + r = 1.015.', 'Raise 1.015 to the power 4 (or multiply 1.015 by itself four times).'],
        wrong: [
          { value: 1.06, say: 'That is 1 + 4 × 0.015: simple interest. Compounding multiplies by 1.015 four times, which gives slightly more.' },
          { value: 1.015, say: 'That is the factor for one year. Four years means multiplying by 1.015 four times.' },
        ] },
      { id: 'f00-ftr-g1-s2', type: 'num',
        prompt: 'What is the future value after four years, to the nearest cent?',
        answer: 5306.82, check: () => 5000 * 1.015 ** 4, unit: '$', places: 2, tol: 0.01,
        hints: ['FV = PV × (1 + r)ⁿ.', 'Multiply 5,000 by the growth factor from the previous step, keeping all its decimal places.'],
        wrong: [
          { value: 5300, say: 'That is simple interest: 5,000 × (1 + 0.015 × 4). Each year’s interest also earns interest, so use 5,000 × 1.015⁴.' },
          { value: 5075, say: 'That is one year’s growth. Apply the rate for all four years.' },
        ] },
      { id: 'f00-ftr-g1-s3', type: 'num',
        prompt: 'How much of the four-year interest is interest earned on earlier interest, compared with simple interest of $300? Give the answer to the nearest cent.',
        answer: 6.82, check: () => (5000 * 1.015 ** 4 - 5000) - 5000 * 0.015 * 4, unit: '$', places: 2, tol: 0.01,
        hints: ['Total interest is the future value minus $5,000.', 'Subtract the $300 that simple interest would give.'],
        wrong: [{ value: 306.82, say: 'That is the total interest. Take away the $300 of simple interest to isolate the interest on interest.' }] },
    ],
  },
  {
    id: 'f00-ftr-g2', type: 'num', kind: 'numerical',
    prompt: 'A fictional client will pay Lantern $2,000 in three years, for certain. Lantern could earn 4% a year on its cash in the meantime. What is the payment worth today, to the nearest cent?',
    answer: 1777.99, check: () => 2000 / 1.04 ** 3, unit: '$', places: 2, tol: 0.01,
    hints: ['This is a present value: PV = FV ÷ (1 + r)ⁿ.', 'Work out 1.04³ = 1.124864, then divide 2,000 by it.'],
    wrong: [
      { value: 2249.73, say: 'You multiplied by 1.04³: that is the future value of $2,000 today. A payment that arrives later is worth less today, so divide.' },
      { value: 1760, say: 'You subtracted three years of 4% simple interest (2,000 × 0.12 = 240). Discounting divides by 1.04 three times.' },
      { value: 1923.08, say: 'That discounts for only one year. The payment is three years away.' },
    ],
    solution: '1.04³ = 1.124864, so PV = 2,000 ÷ 1.124864 = $1,777.99. Check: $1,777.99 deposited at 4% grows to 1,777.99 × 1.124864 ≈ $2,000 in three years.',
  },
  {
    id: 'f00-ftr-g3', type: 'steps', kind: 'applied',
    prompt: 'A fictional investment costs $1,000 today. In one year it will pay $1,150 with probability 60% or $950 with probability 40%. A safe deposit pays 3% a year. Is the investment offering a risk premium?',
    solution: 'Expected payoff: 0.6 × 1,150 + 0.4 × 950 = 690 + 380 = $1,070. Expected return: (1,070 − 1,000) ÷ 1,000 = 7%. Risk premium: 7% − 3% = 4 percentage points. A risk-averse investor would accept the 40% chance of losing $50 only because, on average, the investment pays 4 points more than the safe deposit.',
    steps: [
      { id: 'f00-ftr-g3-s1', type: 'num',
        prompt: 'What is the expected payoff in one year?',
        answer: 1070, check: () => 0.6 * 1150 + 0.4 * 950, unit: '$', places: 0, tol: 0.5,
        hints: ['Multiply each payoff by its probability, then add.', '0.6 × 1,150 plus 0.4 × 950.'],
        wrong: [{ value: 1050, say: 'That is the simple average of the two payoffs. They are not equally likely: weight $1,150 by 0.6 and $950 by 0.4.' }] },
      { id: 'f00-ftr-g3-s2', type: 'num',
        prompt: 'What is the expected return, as a percentage of the $1,000 cost?',
        answer: 7, check: () => ((0.6 * 1150 + 0.4 * 950) - 1000) / 1000 * 100, unit: '%', places: 1, tol: 0.05,
        hints: ['Return = (expected payoff − cost) ÷ cost.', '(1,070 − 1,000) ÷ 1,000, written as a percentage.'],
        wrong: [{ value: 107, say: 'That is the payoff as a percentage of the cost. The return is the gain: subtract the $1,000 first.' }] },
      { id: 'f00-ftr-g3-s3', type: 'num',
        prompt: 'What is the risk premium, in percentage points?',
        answer: 4, check: () => 7 - 3, unit: 'percentage points', places: 1, tol: 0.05,
        hints: ['Risk premium = expected return − risk-free rate.'],
        wrong: [{ value: 10, say: 'You added the rates. The premium is how much more the risky investment is expected to earn than the safe one: subtract.' }] },
    ],
  },
  {
    id: 'f00-ftr-g4', type: 'classify', kind: 'conceptual',
    prompt: 'Match each decision to the branch of finance it belongs to.',
    items: [
      'Ana decides to keep $6,000 of her savings as an emergency fund.',
      'Lantern decides whether to borrow $10,000 from Coastline Bank or raise more money from Ana.',
      'A pension fund decides how many shares of Harbourline Roasters Inc. to buy.',
      'A city decides whether to sell bonds to pay for a new tram line.',
      'A family works out how much it can afford to spend on rent each month.',
      'A hotel group decides whether to build a second hotel.',
    ],
    categories: BRANCHES,
    answer: [0, 1, 2, 3, 0, 1],
    hints: [
      'Ask who is deciding: a household, a business, an investor managing a portfolio, or a government.',
      'A business deciding how to fund itself or what to build is corporate finance; an investor choosing which securities to hold is investment finance.',
    ],
    feedback: {
      1: 'Lantern is a business choosing how to pay for itself: a financing decision, part of corporate finance.',
      2: 'The pension fund is an investor choosing securities for a portfolio: investment finance. Harbourline itself is not making a decision here.',
      3: 'Governments raising and spending money belong to public finance.',
      5: 'Building a hotel is a business’s long-term investment decision: corporate finance (capital budgeting).',
    },
    solution: 'Emergency fund: personal. Bank loan or owner’s money: corporate (financing decision). Pension fund buying shares: investment. City bonds: public. Family rent budget: personal. Second hotel: corporate (investment decision).',
  },
];

export const independent = [
  {
    id: 'f00-ftr-i1', type: 'num', kind: 'numerical',
    prompt: 'Lantern plans to set aside $12,000 to replace its equipment one day, in a two-year certificate of deposit paying 4% a year, compounded once a year. How much will it have after two years?',
    answer: 12979.2, check: () => 12000 * 1.04 ** 2, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 12960, say: 'That is simple interest: 12,000 × (1 + 0.04 × 2). In the second year the first year’s $480 of interest earns 4% too.' },
      { value: 12480, say: 'That is one year’s growth. Multiply by 1.04 twice.' },
    ],
    solution: 'FV = 12,000 × 1.04² = 12,000 × 1.0816 = $12,979.20. Year by year: 12,000 × 1.04 = 12,480; 12,480 × 1.04 = 12,979.20.',
  },
  {
    id: 'f00-ftr-i2', type: 'num', kind: 'numerical',
    prompt: 'A safe promise pays $10,000 in five years. If you could earn 7% a year elsewhere at the same risk, what is the promise worth today?',
    answer: 7129.86, check: () => 10000 / 1.07 ** 5, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 14025.52, say: 'That is the future value of $10,000 today. The money arrives later, so it is worth less today: divide by 1.07⁵.' },
      { value: 6500, say: 'You subtracted five years of 7% simple interest. Discounting divides by 1.07 for each year of waiting.' },
    ],
    solution: '1.07⁵ = 1.402552, so PV = 10,000 ÷ 1.402552 = $7,129.86.',
  },
  {
    id: 'f00-ftr-i3', type: 'mc', kind: 'applied',
    prompt: 'A supplier offers Lantern a choice: a $1,000 rebate now or $1,050 in one year, for certain. Lantern is short of cash this year and would otherwise have to borrow at 6% a year to cover the gap, so money now is worth 6% a year to it. Which should Lantern choose, and why?',
    options: [
      'The $1,000 now: at 6% it grows to $1,060 in a year, more than $1,050.',
      'The $1,050 in a year, because it is $50 more than the rebate and both are certain.',
      'Either: both are certain, so they are worth the same whatever the date.',
      'The $1,050 in a year, because discounting it at 6% gives a present value of $1,060.',
    ],
    answer: 0,
    feedback: {
      1: 'Comparing $1,050 with $1,000 directly ignores the time value of money. Put both amounts on the same date first.',
      2: 'Being certain removes risk, not the effect of time. At 6%, $1,000 now is worth more than $1,050 in a year.',
      3: 'Present value moves a later amount back to today, so it is smaller: 1,050 ÷ 1.06 = $990.57, which is less than $1,000.',
    },
    solution: 'Money now saves Lantern borrowing at 6%, so use 6% to move both amounts to the same date. Forward: 1,000 × 1.06 = $1,060 in a year, more than $1,050. Or back: 1,050 ÷ 1.06 = $990.57 today, less than $1,000. Either way, take the $1,000 now.',
  },
  {
    id: 'f00-ftr-i4', type: 'num', kind: 'numerical',
    prompt: 'Ana is planning a series of barista workshops. She estimates the series will earn $3,000 with probability 25%, $2,000 with probability 50% and $500 with probability 25% (fictional estimates). What is the expected revenue from the series?',
    answer: 1875, check: () => 0.25 * 3000 + 0.5 * 2000 + 0.25 * 500, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 1833.33, say: 'That is the simple average of the three outcomes. They are not equally likely: weight each by its probability.' },
      { value: 2000, say: 'That is the most likely outcome, not the expected value. Weight all three outcomes by their probabilities and add.' },
    ],
    solution: '0.25 × 3,000 + 0.5 × 2,000 + 0.25 × 500 = 750 + 1,000 + 125 = $1,875. No single series will earn exactly $1,875; it is the average Ana would expect over many series run under the same conditions.',
  },
  {
    id: 'f00-ftr-i5', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement about the risk premium is correct?',
    options: [
      'It is the extra return investors expect, on average, for holding a risky investment instead of a risk-free one.',
      'It is the extra return a risky investment is guaranteed to pay each year, on top of the risk-free rate, in return for its risk.',
      'It is the fee a bank charges savers for keeping their deposits safe from the risk of loss.',
      'It is negative for most investors, because most enjoy taking risks and accept a lower return for them.',
    ],
    answer: 0,
    feedback: {
      1: 'Nothing about a risky investment is guaranteed. The premium is an expected, average reward; in some years the risky investment does worse than the safe one.',
      2: 'A risk premium is earned by whoever bears the risk, not charged for removing it.',
      3: 'Finance assumes most investors are risk averse, which is exactly why they need a positive premium to accept risk.',
    },
    solution: 'The risk premium is the expected return on a risky investment minus the risk-free rate. It exists because risk-averse investors will hold risky investments only if, on average, they expect to be paid more for doing so.',
  },
];

export const check = [
  {
    id: 'f00-ftr-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which definition of finance is the most complete?',
    options: [
      'The study of how people, businesses and governments raise, allocate and manage money over time, under uncertainty',
      'The recording, summarising and reporting of a business’s past transactions under accounting standards such as US GAAP or IFRS',
      'The study of how a whole economy produces and distributes goods and services, and why output and prices change',
      'The buying and selling of shares, bonds and other securities on stock exchanges and other markets',
    ],
    answer: 0,
    feedback: {
      1: 'That describes accounting, which finance relies on. Finance is about decisions: raising, allocating and managing money, looking forward.',
      2: 'That is closer to economics. Finance uses economic ideas but focuses on decisions about money over time and under uncertainty.',
      3: 'Trading shares is one activity within investment finance, not the whole field.',
    },
    solution: 'Finance studies how people, businesses and governments raise, allocate and manage money over time, under uncertainty. The last two phrases, time and uncertainty, are what most financial questions come down to.',
  },
  {
    id: 'f00-ftr-k2', type: 'num', kind: 'numerical',
    prompt: 'You deposit $4,000 at 5% a year, compounded once a year. How much will you have after three years?',
    answer: 4630.5, check: () => 4000 * 1.05 ** 3, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 4600, say: 'That is simple interest. Each year’s interest earns interest in later years: use 4,000 × 1.05³.' },
      { value: 3455.35, say: 'That is a present value. Money deposited today grows, so multiply by 1.05³.' },
    ],
    solution: 'FV = 4,000 × 1.05³ = 4,000 × 1.157625 = $4,630.50.',
  },
  {
    id: 'f00-ftr-k3', type: 'num', kind: 'numerical',
    prompt: 'What is the present value of $9,000 to be received in two years, at a discount rate of 8% a year?',
    answer: 7716.05, check: () => 9000 / 1.08 ** 2, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 10497.6, say: 'That is the future value of $9,000. To find what a later amount is worth today, divide by 1.08².' },
      { value: 7560, say: 'You subtracted 16% simple interest. Discount by dividing by 1.08 twice.' },
      { value: 8333.33, say: 'That discounts for only one year. The money is two years away.' },
    ],
    solution: '1.08² = 1.1664, so PV = 9,000 ÷ 1.1664 = $7,716.05.',
  },
  {
    id: 'f00-ftr-k4', type: 'mc', kind: 'applied',
    prompt: 'Two fictional customers each promise Lantern $8,000 in one year. One is a large university that always pays; the other is a new start-up. How should Lantern value the two promises today?',
    options: [
      'Discount the start-up’s promise at a higher rate, so it is worth less today.',
      'Value them equally: the amounts and the dates are the same, so their present values must be too.',
      'Discount the university’s promise at a higher rate, because large organisations pay slowly.',
      'Value the start-up’s promise more, because start-ups grow quickly and will find it easier to pay.',
    ],
    answer: 0,
    feedback: {
      1: 'Same amount and date, but not the same risk. A risk-averse lender values a less certain payment less, so it uses a higher discount rate.',
      2: 'Slow payment would change the date, but here both pay in one year. What differs is how likely the money is to arrive.',
      3: 'The start-up’s growth does not make its promise to pay more certain; if anything, a young business is more likely to fail.',
    },
    solution: 'Present value depends on the amount, the date and the risk. The amounts and dates are equal, but the start-up is less certain to pay, so its promise is discounted at a higher rate (the risk-free rate plus a larger risk premium) and is worth less today.',
  },
  {
    id: 'f00-ftr-k5', type: 'num', kind: 'numerical',
    prompt: 'A fictional catering contract will earn Lantern a profit of $500 with probability 70%, or a loss of $200 with probability 30%. What is the expected profit? (Enter a loss as a negative number.)',
    answer: 290, check: () => 0.7 * 500 + 0.3 * -200, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 410, say: 'You added the loss instead of subtracting it. A loss of $200 is −200: 0.7 × 500 + 0.3 × (−200).' },
      { value: 150, say: 'That is the simple average of +500 and −200. Weight each by its probability.' },
      { value: 350, say: 'That counts only the profitable outcome. Include the 30% chance of losing $200.' },
    ],
    solution: '0.7 × 500 + 0.3 × (−200) = 350 − 60 = $290. On average the contract adds $290, though any one contract either earns $500 or loses $200.',
  },
  {
    id: 'f00-ftr-k6', type: 'classify', kind: 'applied',
    prompt: 'Classify each decision as one of the three financial decisions a firm makes.',
    items: [
      'Lantern decides whether to buy a second espresso machine.',
      'Lantern decides to keep at least $3,000 in its bank account to pay suppliers while waiting for clients to pay.',
      'Lantern decides whether to borrow from Coastline Bank or ask Ana to invest more.',
      'An airline decides whether to buy ten new aircraft.',
      'A clothing brand decides to give department stores 60 days to pay instead of 30.',
    ],
    categories: ['Investment decision', 'Financing decision', 'Working capital management'],
    answer: [0, 2, 1, 0, 2],
    feedback: {
      1: 'Keeping cash on hand for day-to-day bills is working capital management.',
      2: 'Choosing between debt and the owner’s money is how to pay for the business: a financing decision.',
      4: 'How long customers take to pay changes day-to-day cash needs: working capital management.',
    },
    solution: 'Espresso machine and aircraft: investment decisions (capital budgeting). Cash buffer and customer payment terms: working capital management. Bank loan or owner’s money: financing decision.',
  },
];
