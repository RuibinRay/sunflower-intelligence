// interest-and-inflation.ex.js — F00 · Interest and inflation: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// The F00 project's figures (4.0% CD, 3.2% monthly savings) are deliberately not used here.

const money = (v) => `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (v, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}%`;
const range = (n) => Array.from({ length: n + 1 }, (_, k) => k);
const r2 = (v) => Math.round(v * 100) / 100;

export const widgets = {
  growth: {
    type: 'formula',
    title: 'Simple and compound interest',
    intro: 'The same principal, rate and period under simple interest and under compound interest.',
    inputs: [
      { id: 'p', label: 'Principal', min: 100, max: 50000, step: 100, value: 10000, fmt: 'money' },
      { id: 'r', label: 'Annual interest rate', min: 0.5, max: 15, step: 0.1, value: 5, fmt: 'pct' },
      { id: 'n', label: 'Years', min: 1, max: 40, step: 1, value: 10, fmt: 'int', unit: 'years' },
      { id: 'm', label: 'Compounding periods a year (1 = annual, 4 = quarterly, 12 = monthly)', min: 1, max: 12, step: 1, value: 1, fmt: 'int' },
    ],
    compute: (v) => {
      const r = v.r / 100;
      const simple = (t) => v.p * (1 + r * t);
      const comp = (t) => v.p * (1 + r / v.m) ** (v.m * t);
      const ear = ((1 + r / v.m) ** v.m - 1) * 100;
      const extra = comp(v.n) - simple(v.n);
      return {
        headline: { label: `Compound balance after ${v.n} year${v.n === 1 ? '' : 's'}`, value: money(comp(v.n)) },
        rows: [
          ['Simple-interest balance', money(simple(v.n))],
          ['Interest on interest (compound − simple)', money(extra)],
          ['Effective annual rate', pct(ear, 3)],
          ['Compound growth over the period', pct((comp(v.n) / v.p - 1) * 100, 1)],
        ],
        note: v.n === 1 && v.m === 1
          ? 'Over a single year with annual compounding the two methods agree: interest on interest needs at least two periods. Lengthen the period to see them separate.'
          : `Compounding adds ${money(extra)} over ${v.n} year${v.n === 1 ? '' : 's'}, ${pct((extra / (simple(v.n) - v.p)) * 100, 1)} more interest than simple interest pays.${v.m > 1 ? ` Changing the compounding frequency moves the effective rate only from ${pct(v.r, 1)} to ${pct(ear, 3)}; the rate and the number of years matter far more.` : ' Try raising the compounding frequency: it changes the result far less than the rate or the number of years.'}`,
        chart: { kind: 'line', x: { label: 'Year', values: range(v.n) },
          series: [{ name: 'Compound', values: range(v.n).map((t) => r2(comp(t))) }, { name: 'Simple', values: range(v.n).map((t) => r2(simple(t))) }],
          y: { label: 'Balance ($)' } },
      };
    },
  },
  'real-return': {
    type: 'formula',
    title: 'Nominal balance and purchasing power',
    intro: 'Savings earning a fixed annual rate, compounded once a year, while prices rise at a fixed rate. The starting values are Ana’s.',
    inputs: [
      { id: 'a', label: 'Amount saved today', min: 1000, max: 50000, step: 500, value: 26000, fmt: 'money' },
      { id: 'nom', label: 'Nominal interest rate', min: 0, max: 50, step: 0.1, value: 1.5, fmt: 'pct' },
      { id: 'inf', label: 'Inflation rate', min: 0, max: 40, step: 0.1, value: 2.8, fmt: 'pct' },
      { id: 'n', label: 'Years', min: 1, max: 30, step: 1, value: 10, fmt: 'int', unit: 'years' },
    ],
    compute: (v) => {
      const nom = v.nom / 100, inf = v.inf / 100;
      const fv = (t) => v.a * (1 + nom) ** t;
      const real = (t) => fv(t) / (1 + inf) ** t;
      const exact = ((1 + nom) / (1 + inf) - 1) * 100;
      const approx = v.nom - v.inf;
      const err = approx - exact;
      let note;
      if (Math.abs(exact) < 0.0005) note = 'The interest rate exactly matches inflation: the balance grows in dollars but its purchasing power stays the same.';
      else if (exact < 0) note = `The balance grows to ${money(fv(v.n))}, but because inflation (${pct(v.inf, 1)}) is above the interest rate (${pct(v.nom, 1)}), it buys only what ${money(real(v.n))} buys today: a real loss of ${money(v.a - real(v.n))}.`;
      else note = `The balance grows to ${money(fv(v.n))} and buys what ${money(real(v.n))} buys today: a real gain of ${money(real(v.n) - v.a)}.`;
      note += ` The shortcut (nominal − inflation) is off by ${Math.abs(err).toFixed(2)} percentage points${Math.abs(err) >= 0.5 ? ', too much to ignore: use the exact formula' : ''}.`;
      return {
        headline: { label: 'Real return per year (exact)', value: pct(exact) },
        rows: [
          ['Approximation: nominal − inflation', pct(approx)],
          [`Balance after ${v.n} year${v.n === 1 ? '' : 's'} (dollars)`, money(fv(v.n))],
          ['Its purchasing power in today’s dollars', money(real(v.n))],
        ],
        note,
        chart: { kind: 'line', x: { label: 'Year', values: range(v.n) },
          series: [{ name: 'Balance in dollars', values: range(v.n).map((t) => r2(fv(t))) }, { name: 'Purchasing power (today’s dollars)', values: range(v.n).map((t) => r2(real(t))) }],
          y: { label: '$' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f00-ii-g1', type: 'steps', kind: 'numerical',
    prompt: 'You deposit $8,000 for four years at 5% a year. Compare simple and compound interest.',
    solution: 'Simple: 8,000 × 0.05 × 4 = $1,600 of interest. Compound: 8,000 × 1.05⁴ ≈ $9,724.05, so $1,724.05 of interest. Compounding adds $124.05, the interest earned on earlier interest.',
    steps: [
      { id: 'f00-ii-g1-s1', type: 'num', prompt: 'Total simple interest over the four years.',
        answer: 1600, check: () => 8000 * 0.05 * 4, unit: '$', places: 2, tol: 0.01,
        hints: ['Simple interest = principal × rate × years.', '8,000 × 0.05 = 400 a year.'],
        wrong: [{ value: 9600, say: 'That is the final balance with simple interest. The question asks for the interest alone.' }] },
      { id: 'f00-ii-g1-s2', type: 'num', prompt: 'Balance after four years with interest compounded annually.',
        answer: 9724.05, check: () => 8000 * 1.05 ** 4, unit: '$', places: 2, tol: 0.01,
        hints: ['FV = P(1 + r)ⁿ.', '8,000 × 1.05⁴; 1.05⁴ ≈ 1.215506.'],
        wrong: [{ value: 9600, say: 'That is simple interest. With compounding each year’s interest is earned on a larger balance.' }, { value: 8400, say: 'That is one year’s growth. Raise 1.05 to the power 4.' }] },
      { id: 'f00-ii-g1-s3', type: 'num', prompt: 'How much more does compounding pay than simple interest?',
        answer: 124.05, check: () => 8000 * 1.05 ** 4 - (8000 + 8000 * 0.05 * 4), unit: '$', places: 2, tol: 0.01,
        hints: ['Compound balance minus simple balance (8,000 + 1,600).'] },
    ],
  },
  {
    id: 'f00-ii-g2', type: 'num', kind: 'numerical',
    prompt: 'A store card charges 12% a year compounded monthly. What is its effective annual rate? Give your answer as a percentage to two decimal places.',
    answer: 12.68, check: () => ((1 + 0.12 / 12) ** 12 - 1) * 100, unit: '%', places: 2, tol: 0.01,
    hints: ['Monthly rate = 12% ÷ 12 = 1% = 0.01.', 'EAR = (1.01)¹² − 1.'],
    wrong: [
      { value: 12, say: 'That is the quoted rate. The effective rate includes the interest charged on interest each month.' },
      { value: 1, say: 'That is the monthly rate. Compound it over twelve months.' },
    ],
    solution: 'EAR = (1 + 0.12 ÷ 12)¹² − 1 = 1.01¹² − 1 ≈ 0.1268, or 12.68%. A balance left unpaid for a year grows by 12.68%, not 12%.',
  },
  {
    id: 'f00-ii-g3', type: 'steps', kind: 'numerical',
    prompt: 'A fictional country’s consumer price index rises from 250.0 to 262.5 over a year.',
    solution: 'Inflation = (262.5 − 250.0) ÷ 250.0 = 5%. A $1,000 payment due in a year is worth 1,000 ÷ 1.05 ≈ $952.38 in today’s purchasing power.',
    steps: [
      { id: 'f00-ii-g3-s1', type: 'num', prompt: 'What was the inflation rate, in percent?',
        answer: 5, check: () => (262.5 - 250) / 250 * 100, unit: '%', places: 1, tol: 0.05,
        hints: ['Inflation is the percentage change in the index, not the change in points.', '(262.5 − 250.0) ÷ 250.0.'],
        wrong: [{ value: 12.5, say: 'That is the rise in index points. Divide it by the starting index.' }] },
      { id: 'f00-ii-g3-s2', type: 'num', prompt: 'If prices keep rising at that rate, what will $1,000 received a year from now buy, in today’s dollars?',
        answer: 952.38, check: () => 1000 / (1 + (262.5 - 250) / 250), unit: '$', places: 2, tol: 0.01,
        hints: ['Divide by (1 + inflation).', '1,000 ÷ 1.05.'],
        wrong: [{ value: 950, say: 'Subtracting 5% is close but not exact. Purchasing power divides by 1.05.' }, { value: 1050, say: 'That is what $1,000 grows to at 5%. Inflation reduces what money buys: divide.' }] },
    ],
  },
  {
    id: 'f00-ii-g4', type: 'num', kind: 'applied',
    prompt: 'A fictional pension fund earned a nominal return of 4.5% last year, while inflation was 3.5%. What was its real return, exactly? Give a percentage to two decimal places.',
    answer: 0.97, check: () => (1.045 / 1.035 - 1) * 100, unit: '%', places: 2, tol: 0.01,
    hints: ['Real return = (1 + nominal) ÷ (1 + inflation) − 1.', '1.045 ÷ 1.035 − 1.'],
    wrong: [
      { value: 1, say: 'That is the approximation (4.5 − 3.5). The question asks for the exact real return.' },
      { value: 8, say: 'You added inflation. The real return removes it.' },
    ],
    solution: '1.045 ÷ 1.035 − 1 ≈ 0.00966, or about 0.97%. The approximation gives 1.00%; with rates this small the difference is only 0.03 percentage points, but the exact formula is the correct one.',
  },
];

export const independent = [
  {
    id: 'f00-ii-i1', type: 'mc', kind: 'conceptual',
    prompt: 'In which situation is simple interest the right model?',
    options: [
      'A loan whose interest is paid to the lender every quarter, so the balance stays the same',
      'A savings account that adds interest to the balance every month, where it stays until withdrawn',
      'An unpaid credit-card balance on which the card company charges interest at the end of every month',
      'An investment fund whose dividends and interest are reinvested in the fund every year',
    ],
    answer: 0,
    feedback: {
      1: 'Interest added to the balance earns interest next month: compound interest.',
      2: 'Unpaid card interest is added to the balance and charged interest itself: compound interest.',
      3: 'Reinvested income earns its own return: compound growth.',
    },
    solution: 'Simple interest fits when interest is paid out as it falls due, so it never joins the balance and never earns interest itself. Lantern’s loan, with $150 paid every quarter, is an example.',
  },
  {
    id: 'f00-ii-i2', type: 'num', kind: 'numerical',
    prompt: 'You deposit $2,500 for two years at 3% a year compounded quarterly. What is the balance at the end? Give dollars and cents.',
    answer: 2654.00, check: () => 2500 * (1 + 0.03 / 4) ** (4 * 2), unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 2652.25, say: 'That is annual compounding. Use the quarterly rate (0.75%) for eight quarters.' },
      { value: 2650, say: 'That is simple interest. Interest is added to the balance every quarter.' },
      { value: 2537.64, say: 'You used the quarterly rate for only two periods (one per year). Two years have eight quarters.' },
    ],
    solution: 'Quarterly rate = 3% ÷ 4 = 0.75%; periods = 4 × 2 = 8. Balance = 2,500 × 1.0075⁸ ≈ $2,654.00.',
  },
  {
    id: 'f00-ii-i3', type: 'mc', kind: 'applied',
    prompt: 'A saver can choose between a fictional account paying 5.9% a year compounded monthly and another paying 6.0% a year compounded annually. Ignoring everything except the rate, which pays more over a year?',
    options: [
      'The 5.9% monthly account: its effective annual rate is about 6.06%',
      'The 6.0% annual account, because a quoted rate of 6.0% is higher than 5.9%',
      'They pay exactly the same',
      'It cannot be decided without knowing how much the saver will deposit',
    ],
    answer: 0,
    feedback: {
      1: 'Quoted rates with different compounding cannot be compared directly. Convert both to effective annual rates.',
      2: 'They differ: (1 + 0.059 ÷ 12)¹² − 1 ≈ 6.06% against 6.00%.',
      3: 'Effective rates are percentages, so the comparison is the same for any deposit.',
    },
    solution: 'EAR of the monthly account = (1 + 0.059 ÷ 12)¹² − 1 ≈ 6.06%. The annual account’s EAR is its quoted 6.00%. The monthly account pays slightly more despite its lower quoted rate.',
  },
  {
    id: 'f00-ii-i4', type: 'num', kind: 'numerical',
    prompt: 'Assume prices rise by 3% a year for five years. What will $50,000 received in five years buy, in today’s dollars? Give dollars and cents.',
    answer: 43130.44, check: () => 50000 / 1.03 ** 5, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 42500, say: 'You subtracted 3% five times from the original amount (simple). Inflation compounds: divide by 1.03⁵.' },
      { value: 57963.7, say: 'That is what $50,000 grows to at 3%. To find today’s purchasing power, divide by 1.03⁵.' },
    ],
    solution: 'Real value = 50,000 ÷ 1.03⁵ = 50,000 ÷ 1.159274 ≈ $43,130.44. Five years of 3% inflation take about 14% off what the money can buy.',
  },
  {
    id: 'f00-ii-i5', type: 'mc', kind: 'conceptual',
    prompt: 'When does the shortcut “real return ≈ nominal return − inflation” give a poor answer?',
    options: [
      'When interest and inflation rates are high, because it ignores the product of the two rates',
      'Whenever inflation is above 1%',
      'When the nominal return is negative',
      'Never: it is an exact identity',
    ],
    answer: 0,
    feedback: {
      1: 'At 1–3% inflation and similar interest rates the error is a few hundredths of a percentage point. It grows with the size of the rates.',
      2: 'The sign of the return is not the issue; the size of the rates is.',
      3: 'The exact relation is (1 + nominal) = (1 + real)(1 + inflation). The shortcut drops real × inflation.',
    },
    solution: 'Multiplying out (1 + nominal) = (1 + real)(1 + inflation) gives nominal = real + inflation + real × inflation. The shortcut drops the last term, which is tiny for small rates and large for big ones: at 40% and 30% it gives 10% instead of 7.69%.',
  },
  {
    id: 'f00-ii-i6', type: 'classify', kind: 'conceptual',
    prompt: 'Does each figure ignore compounding within the year (a nominal, quoted rate) or include it (an effective annual rate)?',
    items: [
      'A credit card’s 18% APR, charged as 1.5% a month',
      'The annual percentage yield a US bank discloses on a savings account',
      'The 19.56% that a balance on that 18% card grows by if left unpaid for a year',
      'A mortgage rate of 6% a year, compounded monthly',
    ],
    categories: ['Nominal (ignores compounding)', 'Effective (includes compounding)'],
    answer: [0, 1, 1, 0],
    feedback: {
      0: 'An APR in this sense is the monthly rate × 12. It does not include interest on interest.',
      1: 'An APY reflects the total interest paid including compounding, so it is an effective annual rate.',
      2: '1.015¹² − 1 ≈ 19.56% includes the monthly compounding.',
    },
    solution: 'Nominal: the card’s 18% APR and the 6% mortgage rate compounded monthly. Effective: the bank’s APY and the 19.56% the card balance actually grows by.',
  },
];

export const check = [
  {
    id: 'f00-ii-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What does a real return measure?',
    options: [
      'The percentage change in what an investment can buy, after allowing for inflation',
      'The percentage change in the number of dollars an investment is worth',
      'The return an investor keeps after the bank’s or fund manager’s fees are deducted',
      'The return guaranteed by the government',
    ],
    answer: 0,
    feedback: {
      1: 'That is the nominal return. The real return removes inflation from it.',
      2: 'Fees reduce a return, but “real” refers to purchasing power, not fees.',
      3: 'A real return need not be guaranteed by anyone; it can be negative.',
    },
    solution: 'Real return = (1 + nominal) ÷ (1 + inflation) − 1: the growth in purchasing power. A positive nominal return can be a negative real one when inflation is higher.',
  },
  {
    id: 'f00-ii-k2', type: 'num', kind: 'numerical',
    prompt: 'You invest $3,000 at 7% a year compounded annually for six years. What is the balance at the end? Give dollars and cents.',
    answer: 4502.19, check: () => 3000 * 1.07 ** 6, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 4260, say: 'That is simple interest (3,000 + 6 × 210). With compounding, each year’s interest is earned on a growing balance.' },
      { value: 1502.19, say: 'That is the interest alone. The question asks for the balance.' },
    ],
    solution: 'FV = 3,000 × 1.07⁶ = 3,000 × 1.500730 ≈ $4,502.19.',
  },
  {
    id: 'f00-ii-k3', type: 'num', kind: 'numerical',
    prompt: 'A fictional loan is quoted at 9% a year compounded quarterly. What is its effective annual rate? Give a percentage to two decimal places.',
    answer: 9.31, check: () => ((1 + 0.09 / 4) ** 4 - 1) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 9, say: 'That is the quoted rate. The effective rate includes interest on interest each quarter.' },
      { value: 2.25, say: 'That is the quarterly rate. Compound it over four quarters.' },
    ],
    solution: 'Quarterly rate = 9% ÷ 4 = 2.25%. EAR = 1.0225⁴ − 1 ≈ 0.0931, or 9.31%.',
  },
  {
    id: 'f00-ii-k4', type: 'num', kind: 'applied',
    prompt: 'Suppose Coastline Bank raised the rate on Ana’s savings account from 1.5% to 2.0% a year, and inflation is 2.8% as she assumes. What would her real return be, exactly? Give a percentage to two decimal places (use a minus sign if it is negative).',
    answer: -0.78, check: () => (1.02 / 1.028 - 1) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: -0.8, say: 'That is the approximation (2.0 − 2.8). Use (1.020 ÷ 1.028) − 1 for the exact figure.' },
      { value: 0.78, say: 'Check the sign: the interest rate is below inflation, so the real return is negative.' },
      { value: -1.26, say: 'That is her real return at the old 1.5% rate.' },
    ],
    solution: '1.020 ÷ 1.028 − 1 ≈ −0.0078, or −0.78%. The higher rate would cut her loss of purchasing power from about 1.26% to 0.78% a year, but as long as her rate is below inflation her savings still lose purchasing power.',
  },
  {
    id: 'f00-ii-k5', type: 'mc', kind: 'applied',
    prompt: 'In a fictional economy with 20% inflation, a bank offers deposits at 25% a year. A newspaper says savers earn “a real return of 5%”. Which statement is correct?',
    options: [
      'The exact real return is about 4.17%; the shortcut the newspaper used overstates it when rates are this high',
      'The newspaper is right: 25% − 20% = 5% exactly, because a real return is always the nominal rate minus inflation',
      'The real return is 45%, because inflation raises the value of deposits and the two rates add',
      'The real return is negative, because 20% inflation wipes out more than the whole 25% of interest',
    ],
    answer: 0,
    feedback: {
      1: 'Subtraction is only an approximation. Exactly: 1.25 ÷ 1.20 − 1 ≈ 4.17%.',
      2: 'Inflation reduces a return; it does not add to it.',
      3: 'The deposit rate is above inflation, so purchasing power grows: the real return is positive.',
    },
    solution: 'Real return = 1.25 ÷ 1.20 − 1 ≈ 0.0417, or 4.17%. The shortcut gives 5%, almost a full percentage point too high, because it drops the product of the two rates, which is large when the rates are large.',
  },
  {
    id: 'f00-ii-k6', type: 'mc', kind: 'conceptual',
    prompt: 'A price index rises from 120 to 126 over a year. What was the inflation rate?',
    options: ['5%', '6%', '126%', '4.8%'],
    answer: 0,
    feedback: {
      1: 'The index rose 6 points, but inflation is the percentage change: 6 ÷ 120 = 5%.',
      2: 'That is the ratio of the new index to its base level of 100, not the change over the year.',
      3: 'About 4.8% is 6 ÷ 126, which divides by the end value. Divide by the starting value.',
    },
    solution: 'Inflation = (126 − 120) ÷ 120 = 0.05, or 5%. Always divide the change by the starting index.',
  },
];
