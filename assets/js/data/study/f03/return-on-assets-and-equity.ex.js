// return-on-assets-and-equity.ex.js — F03 · Return on assets and equity: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// Lantern’s figures come from case.js and core/ratios.js; every other business is fictional and invented for the
// exercise, except Starbucks (FY2024 Form 10-K, as cited in the lesson).
import { PERIODS, FACTS } from './case.js?v=20';
import * as R from '../../../core/ratios.js?v=20';

const P26 = PERIODS[2026], P27 = PERIODS[2027];
const n = (v) => Math.round(v).toLocaleString('en-US');
const pct = (v, d = 1) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}%`;
const t = FACTS.tax.rate;
const salary10 = FACTS.wages.ana * 10 / 12;

export const widgets = {
  'roe-lantern': {
    type: 'ratios',
    title: 'Lantern’s returns, 2026 and 2027',
    periods: [{ label: '2026 (ten months)', data: P26 }, { label: '2027', data: P27 }],
    ratios: ['netMargin', 'roa', 'roe', 'debtRatio'],
    toggles: ['average', 'annualise'],
    adjust: [
      { id: 'salary', label: 'Charge 2026 with ten months of Ana’s $48,000 salary, after tax', period: 0,
        delta: { operatingIncome: -salary10, ebit: -salary10, pretax: -salary10, tax: -salary10 * t, netIncome: -salary10 * (1 - t) },
        note: 'Income before tax falls by $40,000 and tax by $10,000, so net income falls by $30,000. The balance sheet is left as reported.' },
    ],
    select: 'roe',
    note: '2026 has no opening balance sheet, so it always uses closing balances. With averages on, 2027 uses the average of 31 December 2026 and 31 December 2027. Annualising scales 2026’s ten months of flows by 12 ÷ 10; it overstates a normal year, because the ten months included the fourth-quarter gift peak.',
  },
  'roe-leverage': {
    type: 'formula',
    title: 'Leverage and return on equity',
    intro: 'ROE = ROIC + (ROIC − r(1 − t)) × D ÷ E. The starting values: ROIC 12%, debt at 8% before tax, a 25% tax rate and $1.50 of debt per dollar of equity.',
    inputs: [
      { id: 'roic', label: 'Return on invested capital, ROIC', min: -10, max: 30, step: 0.5, value: 12, fmt: 'pct' },
      { id: 'r', label: 'Interest rate on debt, r', min: 0, max: 15, step: 0.5, value: 8, fmt: 'pct' },
      { id: 't', label: 'Tax rate, t', min: 0, max: 40, step: 1, value: 25, fmt: 'pct' },
      { id: 'de', label: 'Debt to equity, D ÷ E', min: 0, max: 5, step: 0.1, value: 1.5, fmt: 'num' },
    ],
    compute: (v) => {
      const after = v.r * (1 - v.t / 100);
      const spread = v.roic - after;
      const roe = v.roic + spread * v.de;
      const xs = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
      const r2 = (x) => Math.round(x * 100) / 100;
      const note = v.de === 0
        ? `With no debt, ROE equals ROIC, ${pct(v.roic, 1)}. Add debt to see the spread at work.`
        : spread > 0
          ? `The business earns ${pct(v.roic, 1)} on its capital and pays ${pct(after, 1)} after tax for debt, a spread of ${pct(spread, 1)}. Each dollar of debt per dollar of equity adds that spread to ROE: debt raises ROE from ${pct(v.roic, 1)} to ${pct(roe, 1)}.`
          : spread < 0
            ? `The business earns ${pct(v.roic, 1)} on its capital but debt costs ${pct(after, 1)} after tax: a negative spread of ${pct(spread, 1)}. Debt drags ROE down from ${pct(v.roic, 1)} to ${pct(roe, 1)}, and the more debt, the worse.`
            : `ROIC equals the after-tax cost of debt, so debt neither helps nor hurts: ROE is ${pct(roe, 1)} at any D ÷ E.`;
      return {
        headline: { label: 'Return on equity', value: pct(roe, 1) },
        rows: [
          ['After-tax cost of debt, r(1 − t)', pct(after, 1)],
          ['Spread, ROIC − r(1 − t)', pct(spread, 1)],
          ['Added (or taken away) by leverage', pct(spread * v.de, 1)],
        ],
        note,
        chart: { kind: 'line', x: { label: 'Debt to equity', values: xs },
          series: [{ name: 'ROE', values: xs.map((x) => r2(v.roic + spread * x)) }, { name: 'ROIC', values: xs.map(() => r2(v.roic)) }],
          y: { label: 'Return (%)' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f03-roe-g1', type: 'steps', kind: 'numerical',
    prompt: 'Work out Lantern’s 2027 returns on average balances from the figures below. Enter percentages to one decimal place and the last answer to two.',
    data: { table: { head: ['Item', '31 Dec 2026 ($)', '31 Dec 2027 ($)'], rows: [
      ['Total assets', n(P26.totalAssets), n(P27.totalAssets)],
      ['Total equity', n(P26.equity), n(P27.equity)],
      ['Net income for 2027', '', n(P27.netIncome)],
    ] } },
    solution: 'Average total assets (93,676 + 327,883) ÷ 2 = 210,779.5; ROA = 22,431 ÷ 210,779.5 = 10.6%. Average equity (42,387 + 62,818) ÷ 2 = 52,602.5; ROE = 22,431 ÷ 52,602.5 = 42.6%. Assets per dollar of equity 210,779.5 ÷ 52,602.5 = 4.01; with the factors unrounded, 10.64% × 4.007 = 42.6%.',
    steps: [
      { id: 'f03-roe-g1-s1', type: 'num', prompt: 'Return on assets, on average total assets (%)',
        answer: 10.6, check: () => R.profitability(P27, P26).roa * 100, unit: '%', places: 1, tol: 0.06,
        hints: ['Average the two total-asset figures first.', 'Net income ÷ ((93,676 + 327,883) ÷ 2).'],
        wrong: [
          { value: 6.8, say: 'That divides by closing total assets. Most of 2027’s new assets arrived on 1 March, so the closing figure counts them for too long: use the average.' },
          { value: 23.9, say: 'That divides by opening total assets, which leave out the cafés that earned much of the year’s revenue. The course uses the average.' },
        ] },
      { id: 'f03-roe-g1-s2', type: 'num', prompt: 'Return on equity, on average equity (%)',
        answer: 42.6, check: () => R.profitability(P27, P26).roe * 100, unit: '%', places: 1, tol: 0.06,
        hints: ['Same method with equity.'],
        wrong: [
          { value: 35.7, say: 'That divides by closing equity. Use the average of the opening and closing figures.' },
          { value: 52.9, say: 'That divides by opening equity. Use the average of the opening and closing figures.' },
        ] },
      { id: 'f03-roe-g1-s3', type: 'num', prompt: 'Average total assets per dollar of average equity',
        answer: 4.01, check: () => R.avg(P27, P26, 'totalAssets') / R.avg(P27, P26, 'equity'), unit: '', places: 2, tol: 0.01,
        hints: ['Divide the two averages. Multiply your answer by ROA to check it gives ROE.'],
        wrong: [{ value: 5.22, say: 'That uses closing balances. Use the averages so that ROA × this figure = ROE.' }] },
    ],
  },
  {
    id: 'f03-roe-g2', type: 'num', kind: 'numerical',
    prompt: 'Fernhill Apparel, a fictional clothing brand, earned net income of $410,000 in 2027 and paid $30,000 of dividends on its preferred stock. Its total shareholders’ equity was $2,800,000 on 1 January and $3,200,000 on 31 December, each including $500,000 of preferred stock. What is its return on common equity, on average balances? Enter a percentage to one decimal place.',
    answer: 15.2, check: () => (410000 - 30000) / (((2800000 - 500000) + (3200000 - 500000)) / 2) * 100, unit: '%', places: 1, tol: 0.06,
    hints: ['Both parts of the ratio should belong to the common shareholders.', 'Numerator: net income less preferred dividends. Denominator: average equity less the preferred stock.'],
    wrong: [
      { value: 16.4, say: 'The preferred dividends belong to the preferred shareholders: subtract them from net income.' },
      { value: 12.7, say: 'Common equity excludes the $500,000 of preferred stock. Subtract it from both balances before averaging.' },
      { value: 13.7, say: 'Both corrections are missing: subtract the preferred dividends from net income and the preferred stock from equity.' },
    ],
    solution: 'Income to common = 410,000 − 30,000 = 380,000. Common equity: 2,300,000 and 2,700,000, average 2,500,000. ROE = 380,000 ÷ 2,500,000 = 15.2%.',
  },
  {
    id: 'f03-roe-g3', type: 'mc', kind: 'conceptual',
    prompt: 'From 2026 to 2027 Lantern’s return on assets fell from 29.2% to 10.6%, but its return on equity fell only from 64.6% to 42.6%. What explains the difference?',
    options: [
      'More assets per dollar of equity: liabilities financed most of the growth.',
      'Net income fell, and a fall in net income always reduces ROE by less than it reduces ROA.',
      'Equity rose faster than total assets in 2027, which pushed ROE up relative to ROA.',
      'Interest expense rose in 2027, which lowers net income but leaves ROE unchanged.',
    ],
    answer: 0,
    hints: ['ROE = ROA × average assets ÷ average equity. Which part changed?', 'Assets rose from $93,676 to $327,883; equity from $42,387 to $62,818.'],
    feedback: {
      1: 'Net income is the numerator of both ratios, so it moves them in the same proportion. The gap comes from the denominators.',
      2: 'The other way round: assets more than tripled while equity rose by about half, so assets per dollar of equity rose.',
      3: 'Interest reduces net income, which lowers ROE as well as ROA. It doesn’t explain the gap.',
    },
    solution: 'ROE = ROA × assets per dollar of equity. That multiplier rose from 2.21 (2026, closing) to 4.01 (2027, averages) because liabilities grew by $213,776, mostly the cafés’ lease liabilities. Leverage absorbed much of the fall in ROA.',
  },
  {
    id: 'f03-roe-g4', type: 'num', kind: 'numerical',
    prompt: 'A fictional regional hotel group earns a return on invested capital of 9%. Its debt costs 6% before tax, its tax rate is 25%, and it has $2 of debt for every $1 of equity. Using the leverage-spread identity, what is its return on equity? Enter a percentage to one decimal place.',
    answer: 18, check: () => 9 + (9 - 6 * (1 - 0.25)) * 2, unit: '%', places: 1, tol: 0.06,
    hints: ['First find the after-tax cost of debt, r(1 − t).', 'ROE = ROIC + (ROIC − 4.5%) × 2.'],
    wrong: [
      { value: 15, say: 'Interest is tax-deductible, so debt costs 6% × (1 − 0.25) = 4.5% after tax, not 6%.' },
      { value: 12, say: 'D ÷ E is 2 here, not D ÷ (D + E). Multiply the spread by 2.' },
      { value: 13.5, say: 'Multiply the spread by D ÷ E and add it to ROIC: 9 + 4.5 × 2.' },
    ],
    solution: 'After-tax cost of debt = 6% × 0.75 = 4.5%. Spread = 9% − 4.5% = 4.5%. ROE = 9% + 4.5% × 2 = 18.0%.',
  },
];

export const independent = [
  {
    id: 'f03-roe-i1', type: 'num', kind: 'numerical',
    prompt: 'Pennant Bike Couriers, a fictional business, was formed on 1 May 2027 when its founders bought $50,000 of stock. In its first period, the eight months to 31 December 2027, it earned net income of $36,000 and paid dividends of $6,000, so its equity at 31 December was $80,000. Following this course’s convention for a first period, what is its return on equity? Enter a percentage to one decimal place.',
    answer: 45, check: () => 36000 / (50000 + 36000 - 6000) * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: 55.4, say: 'That averages the founders’ $50,000 with the closing equity: a defensible choice, but not this course’s convention, which uses closing balances when there is no opening balance sheet.' },
      { value: 67.5, say: 'That annualises eight months of profit (× 12 ÷ 8). The question asks for the period as reported; if you annualise, say so, and beware seasonality.' },
      { value: 72, say: 'That divides by the founders’ $50,000. The convention for a first period is the closing balance, $80,000.' },
    ],
    solution: 'There is no opening balance sheet, so use closing equity: 36,000 ÷ 80,000 = 45.0% for the eight months. State that it is a first, part-year period on closing equity.',
  },
  {
    id: 'f03-roe-i2', type: 'num', kind: 'applied',
    prompt: 'A buyer is looking at Holloway Dental, a fictional practice owned and run by one dentist who takes no salary. Its income before tax is $210,000. Employing a dentist to do the owner’s work would cost $150,000 a year. The tax rate is 25% and average equity is $300,000. What is the practice’s return on equity after charging a market salary? Enter a percentage to one decimal place.',
    answer: 15, check: () => (210000 - 150000) * (1 - 0.25) / 300000 * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: 52.5, say: 'That is the reported return, before paying anyone for the owner’s work. A buyer would have to pay a dentist.' },
      { value: 2.5, say: 'You subtracted the salary from net income, ignoring the tax it saves. Charge it before tax: (210,000 − 150,000) × 0.75.' },
      { value: 20, say: 'That is income before tax over equity. ROE uses net income, after the 25% tax.' },
    ],
    solution: 'Normalised income before tax = 210,000 − 150,000 = 60,000; net income = 60,000 × 0.75 = 45,000; ROE = 45,000 ÷ 300,000 = 15.0%, against a reported 157,500 ÷ 300,000 = 52.5%.',
  },
  {
    id: 'f03-roe-i3', type: 'mc', kind: 'applied',
    prompt: 'An analyst is comparing Starbucks’ fiscal 2024 profitability with a smaller coffee chain. Starbucks earned net earnings attributable to it of $3,760.9 million; its total assets averaged $30,392.4 million over the year and its shareholders’ equity attributable to Starbucks was −$7,994.8 million and −$7,448.9 million at the two year ends. Which return should the analyst use for Starbucks?',
    options: [
      'Return on assets, about 12.4%; ROE is not meaningful with negative equity',
      'Return on equity, about −48.7%, because it is the shareholders’ return',
      'Return on equity with the minus sign removed, about 48.7%',
      'Neither: a company with negative equity is insolvent, so returns don’t apply',
    ],
    answer: 0,
    feedback: {
      1: 'Starbucks made a large profit; the minus sign comes from dividing by a negative denominator. That ratio describes nothing.',
      2: 'Removing the sign still divides by a deficit. The size of a ratio over a negative, arbitrary denominator has no meaning either.',
      3: 'Negative book equity is not insolvency: Starbucks paid its debts and was highly profitable. Its deficit comes from returning cash to shareholders.',
    },
    solution: 'ROA = 3,760.9 ÷ 30,392.4 = 12.4% is meaningful. Average equity is (−7,994.8 − 7,448.9) ÷ 2 = −7,721.85, so ROE would be −48.7% for a profitable company: report it as not meaningful and use ROA or ROIC.',
  },
  {
    id: 'f03-roe-i4', type: 'num', kind: 'numerical',
    prompt: 'Skerry Air, a fictional regional airline, reports EBIT of $18 million. Its tax rate is 25%. Its interest-bearing debt was $60 million at the start of the year and $70 million at the end; its equity was $40 million and $50 million. Calculate its return on invested capital in outline (no adjustments for cash or leases). Enter a percentage to one decimal place.',
    answer: 12.3, check: () => 18 * 0.75 / ((60 + 40 + 70 + 50) / 2) * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: 16.4, say: 'ROIC uses operating profit after tax: 18 × (1 − 0.25) = 13.5.' },
      { value: 30, say: 'ROIC divides by debt plus equity, the capital from lenders and owners, not by equity alone.' },
      { value: 11.25, say: 'That uses closing capital (120). Average the opening and closing debt plus equity: (100 + 120) ÷ 2 = 110.' },
    ],
    solution: 'NOPAT = 18 × 0.75 = 13.5. Invested capital: 100 at the start, 120 at the end, average 110. ROIC = 13.5 ÷ 110 = 12.3%.',
  },
  {
    id: 'f03-roe-i5', type: 'multi', kind: 'conceptual',
    prompt: 'In which of these situations should an analyst report return on equity as not meaningful, or warn that it is distorted by the size of equity rather than by performance? Select all that apply.',
    options: [
      'Average shareholders’ equity is negative',
      'A company made a loss and its equity is also negative, so the ratio comes out positive',
      'After years of buybacks, equity is 3% of total assets and ROE is 140%',
      'A company with healthy positive equity made a loss, so its ROE is negative',
      'A bank’s assets are twelve times its equity, normal for banks',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'A negative ROE on positive equity is meaningful: the owners’ capital lost value. Report it.',
      4: 'High leverage is normal for banks and their ROE is routinely compared; it reflects real leverage, not a tiny or negative denominator.',
    },
    solution: 'Negative equity makes ROE meaningless (and two negatives give a positive). Tiny equity makes it explode, so it describes the denominator more than the business. A loss on positive equity and a normally leveraged bank give meaningful ROEs.',
  },
  {
    id: 'f03-roe-i6', type: 'num', kind: 'applied',
    prompt: 'Lantern’s 2026 statements cover ten months with no opening balance sheet. To compare 2026 with 2027 on the same basis, what is Lantern’s 2027 return on equity on closing equity? Enter a percentage to one decimal place.',
    answer: 35.7, check: () => P27.netIncome / P27.equity * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: 42.6, say: 'That is on average equity. 2026 can only be measured on closing equity, so measure 2027 that way too.' },
      { value: 52.9, say: 'That divides 2027’s net income by 2026’s closing equity (2027’s opening). Use 31 December 2027.' },
      { value: 64.6, say: 'That is 2026’s ROE. The question asks for 2027 on the same basis.' },
    ],
    solution: 'ROE on closing equity = 22,431 ÷ 62,818 = 35.7%, the figure to set beside 2026’s 64.6% (27,387 ÷ 42,387).',
  },
];

export const check = [
  {
    id: 'f03-roe-k1', type: 'num', kind: 'numerical',
    prompt: 'Larchmont Fitness Clubs, a fictional chain of gyms, earned net income of $540,000. Its total assets were $6,200,000 at the start of the year and $6,800,000 at the end. What is its return on assets on average total assets? Enter a percentage to one decimal place.',
    answer: 8.3, check: () => 540000 / ((6200000 + 6800000) / 2) * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: 7.9, say: 'That divides by closing total assets. Use the average, (6,200,000 + 6,800,000) ÷ 2.' },
      { value: 8.7, say: 'That divides by opening total assets. Use the average.' },
    ],
    solution: 'Average total assets = (6,200,000 + 6,800,000) ÷ 2 = 6,500,000. ROA = 540,000 ÷ 6,500,000 = 8.3%.',
  },
  {
    id: 'f03-roe-k2', type: 'mc', kind: 'conceptual',
    prompt: 'Why does this course divide net income by average rather than closing total assets when an opening balance sheet exists?',
    options: [
      'Profit is earned over the year, so it should be matched with the year’s resources.',
      'Closing balances are unaudited estimates until the following year’s statements are prepared.',
      'Averages always give a higher return, which is fairer to managers who invested during the year.',
      'US GAAP requires published return ratios to be computed on average balances.',
    ],
    answer: 0,
    feedback: {
      1: 'Closing balances are audited along with the rest of the statements. The reason is the mismatch between a flow and a stock.',
      2: 'Not always: when assets shrink during the year the average is larger than the closing balance and gives a lower return.',
      3: 'Ratios are not defined by US GAAP. The basis is an analyst’s convention, which is why it must be stated.',
    },
    solution: 'Net income is a flow over the year; assets are a stock at a date. The average of opening and closing approximates the resources used during the year, which matters most when the balance sheet changes a lot, as Lantern’s did in 2027.',
  },
  {
    id: 'f03-roe-k3', type: 'num', kind: 'applied',
    prompt: 'A fictional ski resort earns a return on invested capital of 4% in a poor snow year. Its debt costs 10% before tax, its tax rate is 20% and losses earn a tax credit, and it has $3 of debt for every $1 of equity. What is its return on equity this year? Enter a percentage to one decimal place (negative if negative).',
    answer: -8, check: () => 4 + (4 - 10 * (1 - 0.2)) * 3, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: -14, say: 'Interest is tax-deductible: debt costs 10% × 0.8 = 8% after tax, not 10%.' },
      { value: 16, say: 'The spread is negative: 4% − 8% = −4%. Leverage subtracts 4% × 3 from ROIC.' },
      { value: 4, say: 'ROE equals ROIC only without debt. Here the negative spread is magnified three times.' },
    ],
    solution: 'After-tax cost of debt = 10% × 0.8 = 8%. Spread = 4% − 8% = −4%. ROE = 4% + (−4%) × 3 = −8.0%. In a poor year the resort’s debt turns a small positive return on capital into a loss for the owners.',
  },
  {
    id: 'f03-roe-k4', type: 'mc', kind: 'applied',
    prompt: 'Ana charges Lantern’s 2026 results with ten months of the $48,000 salary she began drawing in 2027. Net income becomes −$2,613. What should she conclude?',
    options: [
      'Her unpaid work flattered 2026; with her pay charged, 2027 was the better year.',
      '2026 was still the better year, because its ROE of 64.6% beats 2027’s 42.6%.',
      'The adjustment is wrong: a salary paid in 2027 has nothing to do with 2026’s results.',
      'The two years can’t be compared at all, so she should look only at revenue growth.',
    ],
    answer: 0,
    feedback: {
      1: 'The 64.6% is measured on a profit before any pay for the manager. Compare the years after charging the same costs.',
      2: 'The adjustment doesn’t change what happened in 2026; it puts the two years on the same footing. Her work had a cost in both years.',
      3: 'They can be compared once the differences (basis, period, salary) are adjusted for. Revenue growth says nothing about returns.',
    },
    solution: 'With a market salary, 2026 makes a small loss (ROE −6.2% on closing equity) while 2027, which already pays the salary, earns 35.7% on closing equity. Operationally 2027 was better; its ROE is high partly because of leverage.',
  },
  {
    id: 'f03-roe-k5', type: 'num', kind: 'numerical',
    prompt: 'A fictional grocery chain has a return on average total assets of 7.5%. Its average total assets were $4.8 million and its average equity $1.6 million. What is its return on average equity? Enter a percentage to one decimal place.',
    answer: 22.5, check: () => 7.5 * 4.8 / 1.6, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: 2.5, say: 'Multiply ROA by assets per dollar of equity (4.8 ÷ 1.6 = 3), don’t divide.' },
      { value: 15, say: 'Assets per dollar of equity is 4.8 ÷ 1.6 = 3, not the debt-to-equity ratio of 2.' },
    ],
    solution: 'ROE = ROA × average assets ÷ average equity = 7.5% × 3 = 22.5%.',
  },
  {
    id: 'f03-roe-k6', type: 'mc', kind: 'conceptual',
    prompt: 'Two fictional companies have identical operations, assets and EBIT. One has no debt; the other is half financed by debt costing less, after tax, than its return on invested capital. Which statement is true?',
    options: [
      'Their ROIC is the same; the indebted company has the higher ROE and the higher risk.',
      'Their ROE is the same, because their operations are identical.',
      'The indebted company has the higher ROA on net income, because debt makes assets more productive.',
      'The debt-free company has the higher ROIC, because it pays no interest.',
    ],
    answer: 0,
    feedback: {
      1: 'ROE depends on financing. With a positive spread, debt raises ROE.',
      2: 'Debt doesn’t change what the assets produce, and interest reduces net income, so ROA on net income is lower for the indebted company.',
      3: 'ROIC uses operating profit after tax, before interest, over all capital: financing doesn’t change it.',
    },
    solution: 'ROIC = EBIT × (1 − t) ÷ (D + E) is the same for both. With a positive spread, ROE = ROIC + spread × D ÷ E is higher for the indebted company, and its results swing more widely because interest is fixed.',
  },
];
