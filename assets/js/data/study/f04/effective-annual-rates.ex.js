// effective-annual-rates.ex.js — F04 · Effective annual rates: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// Uses BREWER and COASTLINE_NOTE from case.js; every other business and figure is fictional.
import { BREWER as B, COASTLINE_NOTE as N } from './case.js?v=22';

const pct = (v, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}%`;
const money = (v) => `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const ear = (apr, m) => (1 + apr / m) ** m - 1;
const freq = (m) => ({ 1: 'annually', 2: 'semi-annually', 4: 'quarterly', 12: 'monthly', 52: 'weekly', 365: 'daily' }[m] || `${m} times a year`);
const r4 = (v) => Math.round(v * 10000) / 10000;

export const widgets = {
  'ear-explorer': {
    type: 'formula',
    title: 'From a quoted rate to its effective annual rate',
    intro: 'A nominal annual rate (APR) and how often it is compounded.',
    inputs: [
      { id: 'apr', label: 'Nominal annual rate (APR)', min: 0.5, max: 36, step: 0.1, value: B.loan.apr, fmt: 'pct' },
      { id: 'm', label: 'Compounding periods a year (1 annual, 4 quarterly, 12 monthly, 365 daily)', min: 1, max: 365, step: 1, value: 12, fmt: 'int' },
    ],
    compute: (v) => {
      const a = v.apr / 100;
      const e = ear(a, v.m) * 100;
      const cont = (Math.exp(a) - 1) * 100;
      const ms = [1, 2, 4, 12, 52, 365];
      return {
        headline: { label: `EAR of ${pct(v.apr, 1)} compounded ${freq(v.m)}`, value: pct(e, 4) },
        rows: [
          ['Periodic rate (APR ÷ m)', pct(v.apr / v.m, 4)],
          ['EAR − APR', `${(e - v.apr).toFixed(4)} points`],
          ['EAR with continuous compounding', pct(cont, 4)],
          ['$1,000 after one year', money(1000 * (1 + e / 100))],
        ],
        note: `Compounded ${freq(v.m)}, ${pct(v.apr, 1)} grows a balance by ${pct(e, 4)} in a year, ${(e - v.apr).toFixed(4)} percentage points more than the quoted rate. Even continuous compounding adds only ${(cont - e).toFixed(4)} points more. ${v.apr >= 15 ? 'At high rates the gap between APR and EAR becomes large: compare EARs, never APRs.' : 'Raise the rate and watch the gap widen faster than the rate itself.'}`,
        chart: { kind: 'bar', x: { label: 'Compounding', values: ['Annual', 'Semi-annual', 'Quarterly', 'Monthly', 'Weekly', 'Daily', 'Continuous'] },
          series: [{ name: 'EAR (%)', values: [...ms.map((m) => r4(ear(a, m) * 100)), r4(cont)] }],
          y: { label: 'EAR (%)', format: 'num' } },
      };
    },
  },
  'ear-convert': {
    type: 'formula',
    title: 'Equivalent rate at another compounding frequency',
    intro: 'Turn a rate quoted with one compounding frequency into the rate with another that gives the same growth.',
    inputs: [
      { id: 'apr', label: 'Quoted nominal annual rate', min: 0.5, max: 30, step: 0.1, value: N.marketRateMarch2027, fmt: 'pct' },
      { id: 'm1', label: 'Compounding periods a year, as quoted', min: 1, max: 365, step: 1, value: 4, fmt: 'int' },
      { id: 'm2', label: 'Compounding periods a year, wanted', min: 1, max: 365, step: 1, value: 12, fmt: 'int' },
    ],
    compute: (v) => {
      const a = v.apr / 100;
      const e = ear(a, v.m1);
      const r2 = (1 + e) ** (1 / v.m2) - 1;
      const apr2 = v.m2 * r2 * 100;
      return {
        headline: { label: `Equivalent rate compounded ${freq(v.m2)}`, value: pct(apr2, 4) },
        rows: [
          ['Shared EAR', pct(e * 100, 4)],
          [`Periodic rate, as quoted (÷ ${v.m1})`, pct(v.apr / v.m1, 4)],
          [`Periodic rate, wanted (${v.m2} a year)`, pct(r2 * 100, 4)],
          ['Continuously compounded equivalent: ln(1 + EAR)', pct(Math.log(1 + e) * 100, 4)],
        ],
        note: v.m1 === v.m2
          ? 'Same frequency, same rate. Choose a different frequency to convert.'
          : `${pct(v.apr, 2)} compounded ${freq(v.m1)} and ${pct(apr2, 4)} compounded ${freq(v.m2)} both grow money by ${pct(e * 100, 4)} a year, so they are equivalent. ${v.m2 > v.m1 ? 'The more frequent compounding needs a slightly lower nominal rate.' : 'The less frequent compounding needs a slightly higher nominal rate.'}`,
      };
    },
  },
  'ear-discount': {
    type: 'formula',
    title: 'The annual cost of skipping an early-payment discount',
    intro: 'Terms such as 2/10, net 30, and the rate at which you could borrow instead.',
    inputs: [
      { id: 'd', label: 'Discount', min: 0.5, max: 5, step: 0.5, value: 2, fmt: 'pct' },
      { id: 'dd', label: 'Days to pay and take the discount', min: 0, max: 30, step: 1, value: 10, fmt: 'int', unit: 'days' },
      { id: 'net', label: 'Days to pay in full', min: 15, max: 90, step: 1, value: 30, fmt: 'int', unit: 'days' },
      { id: 'borrow', label: 'Your borrowing rate (EAR)', min: 1, max: 30, step: 0.1, value: 7.4, fmt: 'pct' },
    ],
    compute: (v) => {
      const gap = v.net - v.dd;
      if (gap <= 0) return { headline: { label: 'Annual cost', value: '—' }, rows: [], note: '', error: 'The full amount must be due later than the discount date. Lengthen the time to pay in full.' };
      const d = v.d / 100;
      const per = d / (1 - d);
      const m = 365 / gap;
      const eff = ((1 + per) ** m - 1) * 100;
      const nom = per * m * 100;
      return {
        headline: { label: `EAR of skipping ${v.d}/${v.dd}, net ${v.net}`, value: pct(eff) },
        rows: [
          [`Rate for the ${gap} extra days`, pct(per * 100, 4)],
          ['Periods of that length in a year', (m).toFixed(2)],
          ['Nominal annual rate', pct(nom)],
          ['On a $3,000 invoice: discount', money(3000 * d)],
        ],
        note: eff > v.borrow
          ? `Skipping the discount costs about ${pct(eff)} a year, more than your ${pct(v.borrow, 1)} borrowing rate: take the discount, borrowing if necessary.`
          : `Skipping the discount costs about ${pct(eff)} a year, less than your ${pct(v.borrow, 1)} borrowing rate: paying in full on day ${v.net} is the cheaper source of credit.`,
      };
    },
  },
};

export const guided = [
  {
    id: 'f04-ear-g1', type: 'num', kind: 'numerical',
    prompt: 'A fictional personal loan is quoted at 9% a year compounded monthly. What is its effective annual rate? Give a percentage to two decimal places.',
    answer: 9.38, check: () => ear(0.09, 12) * 100, unit: '%', places: 2, tol: 0.01,
    hints: ['Periodic rate = 9% ÷ 12 = 0.75% = 0.0075.', 'EAR = 1.0075¹² − 1.'],
    wrong: [
      { value: 9, say: 'That is the nominal rate. The EAR includes interest on interest each month.' },
      { value: 0.75, say: 'That is the monthly rate. Compound it over twelve months.' },
    ],
    solution: 'EAR = (1 + 0.09 ÷ 12)¹² − 1 = 1.0075¹² − 1 ≈ 0.0938, or 9.38%.',
  },
  {
    id: 'f04-ear-g2', type: 'steps', kind: 'numerical',
    prompt: 'An investor requires an effective return of 10% a year. What nominal annual rate, compounded monthly, gives exactly that?',
    solution: 'Monthly rate = 1.10^(1/12) − 1 ≈ 0.7974%. Nominal annual rate = 12 × 0.7974% ≈ 9.57%. Dividing 10% by 12 (0.8333% a month) would compound to about 10.47%, too much.',
    steps: [
      { id: 'f04-ear-g2-s1', type: 'num', prompt: 'What monthly rate compounds to 10% over twelve months? Give a percentage to four decimal places.',
        answer: 0.7974, check: () => (1.1 ** (1 / 12) - 1) * 100, unit: '%', places: 4, tol: 0.0002,
        hints: ['(1 + monthly rate)¹² = 1.10.', 'Monthly rate = 1.10^(1/12) − 1.'],
        wrong: [{ value: 0.8333, say: 'That is 10% ÷ 12. Dividing an effective rate overstates the monthly rate, because the twelve months compound.' }] },
      { id: 'f04-ear-g2-s2', type: 'num', prompt: 'What is the nominal annual rate (12 × the monthly rate)? Two decimal places.',
        answer: 9.57, check: () => 12 * (1.1 ** (1 / 12) - 1) * 100, unit: '%', places: 2, tol: 0.01,
        hints: ['Multiply the monthly rate by 12.'],
        wrong: [{ value: 10, say: 'A nominal 10% compounded monthly would give more than 10% effective. The nominal rate must be lower.' }] },
    ],
  },
  {
    id: 'f04-ear-g3', type: 'num', kind: 'numerical',
    prompt: 'A rate of 10% a year is compounded continuously. What is its effective annual rate? Give a percentage to two decimal places.',
    answer: 10.52, check: () => (Math.exp(0.1) - 1) * 100, unit: '%', places: 2, tol: 0.01,
    hints: ['EAR = e^APR − 1.', 'e^0.10 ≈ 1.105171.'],
    wrong: [
      { value: 10, say: 'That is the nominal rate. Continuous compounding adds interest on interest at every instant.' },
      { value: 10.47, say: 'That is monthly compounding (1.008333¹² − 1). Continuous compounding is the limit: e^0.10 − 1.' },
    ],
    solution: 'EAR = e^0.10 − 1 ≈ 1.105171 − 1 ≈ 10.52%. Monthly compounding would give 10.47% and daily 10.52% (10.5156%): daily is already very close to the continuous limit.',
  },
  {
    id: 'f04-ear-g4', type: 'steps', kind: 'applied',
    prompt: 'A fictional US bank offers a 182-day certificate of deposit. On a $10,000 deposit it pays $200 of interest at maturity. What APY must it disclose under Regulation DD?',
    solution: 'Return over the term = 200 ÷ 10,000 = 2%. APY = 100 × [(1.02)^(365/182) − 1] ≈ 4.05%. Doubling 2% (4.00%) or scaling it by 365 ÷ 182 (4.01%) leaves out the compounding the formula requires.',
    steps: [
      { id: 'f04-ear-g4-s1', type: 'num', prompt: 'What is the return over the 182-day term, as a percentage?',
        answer: 2, check: () => 200 / 10000 * 100, unit: '%', places: 2, tol: 0.005,
        hints: ['Interest ÷ principal.'] },
      { id: 'f04-ear-g4-s2', type: 'num', prompt: 'What is the APY, as a percentage to two decimal places?',
        answer: 4.05, check: () => 100 * ((1 + 200 / 10000) ** (365 / 182) - 1), unit: '%', places: 2, tol: 0.01,
        hints: ['APY = 100 × [(1 + Interest ÷ Principal)^(365 ÷ Days in term) − 1].', '365 ÷ 182 ≈ 2.005495, so 1.02^2.005495 ≈ 1.040513.'],
        wrong: [
          { value: 4.01, say: 'That scales 2% by 365 ÷ 182 without compounding. The APY formula raises 1.02 to the power 365 ÷ 182.' },
          { value: 4, say: 'Doubling the six-month return ignores both compounding and the fact that 182 days is slightly less than half a year.' },
        ] },
    ],
  },
];

export const independent = [
  {
    id: 'f04-ear-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional credit card charges 18% a year, compounded daily (365 days). What is its effective annual rate? Give a percentage to two decimal places.',
    answer: 19.72, check: () => ear(0.18, 365) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 18, say: 'That is the nominal rate. Daily compounding adds interest on interest every day.' },
      { value: 19.56, say: 'That is monthly compounding (1.015¹² − 1). Use a daily rate of 0.18 ÷ 365 for 365 days.' },
    ],
    solution: 'EAR = (1 + 0.18 ÷ 365)³⁶⁵ − 1 ≈ 0.1972, or 19.72%.',
  },
  {
    id: 'f04-ear-i2', type: 'num', kind: 'numerical',
    prompt: 'A loan is quoted at 10% a year compounded quarterly. What nominal annual rate compounded monthly is equivalent? Keep the monthly rate to at least six significant figures, and give a percentage to two decimal places.',
    answer: 9.92, check: () => 12 * ((1 + 0.1 / 4) ** (4 / 12) - 1) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 10, say: 'The same nominal rate compounded more often costs more. The equivalent monthly rate must be lower.' },
      { value: 10.38, say: 'That is the EAR of the quarterly rate. Convert it to a monthly rate and multiply by 12.' },
    ],
    solution: 'Quarterly rate 2.5%. Monthly equivalent = 1.025^(1/3) − 1 ≈ 0.826484%. Nominal annual rate = 12 × 0.826484% ≈ 9.92%. Both have an EAR of about 10.38%.',
  },
  {
    id: 'f04-ear-i3', type: 'mc', kind: 'applied',
    prompt: 'A saver compares three fictional accounts: 4.40% a year compounded daily, 4.45% compounded monthly, and 4.50% compounded annually. Ignoring everything but the rate, which pays the most over a year?',
    options: [
      '4.45% compounded monthly',
      '4.50% compounded annually, because its quoted rate is highest',
      '4.40% compounded daily, because daily compounding is the most frequent',
      'All three pay the same',
    ],
    answer: 0,
    feedback: {
      1: 'Annual compounding gives an EAR equal to the quoted 4.50%, below the monthly account’s 4.54%.',
      2: 'Daily compounding of 4.40% gives an EAR of about 4.50%: frequency cannot make up for a lower rate here.',
      3: 'Their EARs are about 4.50%, 4.54% and 4.50%.',
    },
    solution: 'EARs: 4.40% daily → (1 + 0.044 ÷ 365)³⁶⁵ − 1 ≈ 4.4980%; 4.45% monthly → (1 + 0.0445 ÷ 12)¹² − 1 ≈ 4.5419%; 4.50% annually → 4.50%. The monthly account pays most.',
  },
  {
    id: 'f04-ear-i4', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each figure as a periodic rate, a nominal annual rate or an effective annual rate.',
    items: [
      'Coastline’s 0.6% a month on the brewer loan',
      'Coastline’s quoted 7.2% a year, compounded monthly',
      'The 7.44% that the brewer loan’s balance would grow by in a year if nothing were repaid',
      'A US savings account’s annual percentage yield',
      'The “interest rate” a US bank discloses beside the APY under Regulation DD',
      '2.0408% for 20 days on a skipped early-payment discount',
    ],
    categories: ['Periodic rate', 'Nominal annual rate', 'Effective annual rate'],
    answer: [0, 1, 2, 2, 1, 0],
    feedback: {
      0: 'A rate for one period (a month) is a periodic rate.',
      1: 'The monthly rate × 12, ignoring compounding: a nominal annual rate.',
      2: '1.006¹² − 1 includes compounding: an effective annual rate.',
      3: 'Regulation DD’s APY reflects compounding over a 365-day period: an effective rate.',
      4: 'Regulation DD defines the interest rate as an annual rate that does not reflect compounding: nominal.',
      5: 'A rate for a single 20-day period is a periodic rate. Annualised with compounding it becomes 44.59%.',
    },
    solution: 'Periodic: 0.6% a month and 2.0408% for 20 days. Nominal annual: the quoted 7.2% and the Regulation DD interest rate. Effective annual: the 7.44% growth and the APY.',
  },
  {
    id: 'f04-ear-i5', type: 'num', kind: 'numerical',
    prompt: 'You deposit $15,000 for three years at 4.8% a year compounded monthly. What is the balance at the end, to the nearest cent?',
    answer: 17318.29, check: () => 15000 * (1 + 0.048 / 12) ** 36, unit: '$', places: 2, tol: 1.5,
    wrong: [
      { value: 17265.34, say: 'That is annual compounding. Use the monthly rate (0.4%) for 36 months.' },
      { value: 17160, say: 'That is simple interest. Interest is added to the balance every month.' },
      { value: 15180.72, say: 'You used the monthly rate for only three periods. Three years have 36 months.' },
    ],
    solution: 'Monthly rate 4.8% ÷ 12 = 0.4%; 36 months. Balance = 15,000 × 1.004³⁶ ≈ $17,318.29. Equivalently, the EAR is 1.004¹² − 1 ≈ 4.9070%, and 15,000 × 1.049070³ gives the same balance.',
  },
  {
    id: 'f04-ear-i6', type: 'num', kind: 'applied',
    prompt: 'A fictional wholesaler offers terms of 1/10, net 30. What effective annual rate does a customer pay by skipping the discount and paying on day 30? Give a percentage to two decimal places.',
    answer: 20.13, check: () => ((1 + 0.01 / 0.99) ** (365 / 20) - 1) * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [
      { value: 18.43, say: 'That is the nominal annual rate (1.0101% × 18.25). Compound it: (1.010101)^18.25 − 1.' },
      { value: 18.25, say: 'That is 1% × 18.25 periods. The rate for 20 days is 1 ÷ 99 (the base is the discounted price), and it compounds.' },
      { value: 1.01, say: 'That is the rate for 20 days. Annualise it.' },
    ],
    solution: 'Skipping the discount means paying 1% of the invoice to keep 99% of it for 20 more days: 1 ÷ 99 ≈ 1.0101% per 20 days. Periods a year = 365 ÷ 20 = 18.25. EAR = 1.010101^18.25 − 1 ≈ 20.13%.',
  },
];

export const check = [
  {
    id: 'f04-ear-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why should two loans be compared by their effective annual rates rather than their quoted nominal rates?',
    options: [
      'The EAR builds in compounding, so rates compounded at different frequencies are put on the same basis',
      'The EAR folds the lender’s arrangement and account fees into the rate, so it shows the full cost of each loan',
      'The EAR is always lower than the nominal rate, so it flatters neither loan',
      'Lenders are required to quote EARs, so they are more reliable',
    ],
    answer: 0,
    feedback: {
      1: 'The EAR formula uses only the rate and the compounding frequency. Fees must be checked separately.',
      2: 'With more than one compounding period a year the EAR is higher than the nominal rate, not lower.',
      3: 'US loans are disclosed with an APR, which is not an EAR. You usually have to calculate the EAR yourself.',
    },
    solution: 'A nominal rate ignores compounding, so 7.0% quarterly and 7.15% annually cannot be compared directly. Converting both to EARs (7.1859% and 7.15%) gives the growth each causes over a year on the same basis.',
  },
  {
    id: 'f04-ear-k2', type: 'num', kind: 'numerical',
    prompt: 'What is the effective annual rate of 7.2% a year compounded semi-annually? Give a percentage to two decimal places.',
    answer: 7.33, check: () => ear(0.072, 2) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 7.2, say: 'That is the nominal rate. Compound the half-year rate twice.' },
      { value: 3.6, say: 'That is the half-year rate. Compound it over two halves.' },
      { value: 7.4, say: 'That is quarterly compounding. Semi-annual: 1.036² − 1.' },
      { value: 7.44, say: 'That is monthly compounding. Semi-annual: 1.036² − 1.' },
    ],
    solution: 'Half-year rate = 7.2% ÷ 2 = 3.6%. EAR = 1.036² − 1 = 0.07329…, or 7.33%.',
  },
  {
    id: 'f04-ear-k3', type: 'num', kind: 'numerical',
    prompt: 'What continuously compounded annual rate is equivalent to an effective annual rate of 8%? Give a percentage to two decimal places.',
    answer: 7.70, check: () => Math.log(1.08) * 100, unit: '%', places: 2, tol: 0.005,
    wrong: [
      { value: 8, say: 'The continuously compounded rate must be lower than the EAR it produces.' },
      { value: 7.72, say: 'That is the equivalent nominal rate compounded monthly. Continuous: ln(1.08).' },
      { value: 8.33, say: 'That is e^0.08 − 1, the EAR of 8% compounded continuously. The question goes the other way: ln(1 + EAR).' },
    ],
    solution: 'APR = ln(1 + EAR) = ln 1.08 ≈ 0.0770, or 7.70%. Check: e^0.0770 − 1 ≈ 8.00%.',
  },
  {
    id: 'f04-ear-k4', type: 'mc', kind: 'applied',
    prompt: 'A fictional US bank advertises a savings account with an “interest rate of 4.40%” and an “APY of 4.50%”. If the rate does not change, how much will a $10,000 balance earn in a year, with nothing added or withdrawn?',
    options: [
      'About $450: the APY includes compounding and is what the balance grows by in a year',
      '$440: the interest rate is what the balance earns',
      'About $890: the interest rate and the APY add up',
      'It cannot be known without the compounding frequency',
    ],
    answer: 0,
    feedback: {
      1: 'Under Regulation DD the interest rate does not reflect compounding. The APY does.',
      2: 'They are two descriptions of the same rate, not two rates to add.',
      3: 'The APY already builds the compounding frequency in, which is why it is disclosed.',
    },
    solution: 'The APY reflects the total interest paid, including compounding, over a 365-day period: 10,000 × 4.50% ≈ $450. (4.40% compounded daily has an EAR of about 4.4980%, which rounds to the 4.50% APY.)',
  },
  {
    id: 'f04-ear-k5', type: 'num', kind: 'applied',
    prompt: 'A fictional online bank pays 4.25% a year compounded daily (365 days) on a savings account with no fixed term. What APY should it disclose? Give a percentage to two decimal places.',
    answer: 4.34, check: () => ear(0.0425, 365) * 100, unit: '%', places: 2, tol: 0.005,
    wrong: [
      { value: 4.25, say: 'That is the interest rate, which does not reflect compounding. The APY does.' },
      { value: 4.33, say: 'That is monthly compounding. The account compounds daily.' },
    ],
    solution: 'With no fixed term the APY is a 365-day year’s interest as a percentage of the principal: (1 + 0.0425 ÷ 365)³⁶⁵ − 1 ≈ 4.3413%, disclosed as 4.34%.',
  },
  {
    id: 'f04-ear-k6', type: 'num', kind: 'numerical',
    prompt: 'You invest $5,000 for four years at 6% a year compounded continuously. What is the balance at the end, to the nearest cent?',
    answer: 6356.25, check: () => 5000 * Math.exp(0.06 * 4), unit: '$', places: 2, tol: 0.3,
    wrong: [
      { value: 6352.45, say: 'That is monthly compounding. Continuous: 5,000 × e^(0.06 × 4).' },
      { value: 6312.38, say: 'That is annual compounding. Continuous: 5,000 × e^0.24.' },
      { value: 6200, say: 'That is simple interest.' },
    ],
    solution: 'FV = PV × e^(APR × t) = 5,000 × e^0.24 ≈ 5,000 × 1.271249 ≈ $6,356.25.',
  },
];
