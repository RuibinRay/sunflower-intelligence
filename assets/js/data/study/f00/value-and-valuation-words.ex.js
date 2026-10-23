// value-and-valuation-words.ex.js — F00 · Value and valuation words: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).

const m = (v) => `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}m`;
const usd = (v) => `${v < 0 ? '−' : ''}$${Math.abs(v).toFixed(2)}`;
const H = { debt: 210, cash: 45, shares: 18, price: 42.5 };   // Harbourline (case.js)

export const widgets = {
  'ev-builder': {
    type: 'formula',
    title: 'From share price to enterprise value and multiples',
    intro: 'Amounts in $ millions except the share price. The starting values are Harbourline Roasters’ (fictional).',
    inputs: [
      { id: 'price', label: 'Share price', min: 5, max: 100, step: 0.5, value: 42.5, fmt: 'money' },
      { id: 'shares', label: 'Shares outstanding', min: 5, max: 40, step: 1, value: 18, fmt: 'num', unit: 'million' },
      { id: 'debt', label: 'Debt', min: 0, max: 500, step: 5, value: 210, fmt: 'num', unit: '$m' },
      { id: 'cash', label: 'Cash', min: 0, max: 200, step: 5, value: 45, fmt: 'num', unit: '$m' },
      { id: 'ebitda', label: 'EBITDA', min: 20, max: 200, step: 1, value: 93, fmt: 'num', unit: '$m' },
      { id: 'ni', label: 'Net income', min: 5, max: 100, step: 1, value: 38, fmt: 'num', unit: '$m' },
    ],
    compute: (v) => {
      const mc = v.price * v.shares;
      const ev = mc + v.debt - v.cash;
      const evx = ev / v.ebitda;
      const pe = mc / v.ni;
      const note = ev <= 0
        ? `Enterprise value is ${m(ev)}: the cash exceeds the market capitalisation plus the debt, so the market is putting no positive value on the operations. That is rare, and usually means investors expect losses or doubt the cash can reach shareholders.`
        : `Buying every share costs ${m(mc)}; taking on ${m(v.debt)} of debt and receiving ${m(v.cash)} of cash makes the whole business cost ${m(ev)}, or ${evx.toFixed(1)} times EBITDA. Shareholders pay ${pe.toFixed(1)} times net income. EV/EBITDA uses numbers that belong to lenders and shareholders together; P/E uses numbers that belong to shareholders only.`;
      return {
        headline: { label: 'Enterprise value', value: m(ev) },
        rows: [
          ['Market capitalisation (price × shares)', m(mc)],
          ['Net debt (debt − cash)', m(v.debt - v.cash)],
          ['EV/EBITDA', `${evx.toFixed(1)}×`],
          ['Earnings per share (net income ÷ shares)', usd(v.ni / v.shares)],
          ['P/E (market cap ÷ net income)', `${pe.toFixed(1)}×`],
        ],
        note,
        chart: { kind: 'bar', x: { label: 'Step', values: ['Market cap', 'Add debt', 'Subtract cash', 'Enterprise value'] }, series: [{ name: '$ millions', values: [mc, v.debt, -v.cash, ev] }], y: { label: '$ millions' } },
      };
    },
  },
  'multiple-valuation': {
    type: 'formula',
    title: 'Valuing Harbourline with an EV/EBITDA multiple',
    intro: 'Harbourline’s debt ($210m), cash ($45m) and 18 million shares are held fixed. Choose the multiple and the EBITDA you believe in.',
    inputs: [
      { id: 'mult', label: 'EV/EBITDA multiple', min: 4, max: 16, step: 0.5, value: 10, fmt: 'num', unit: '×' },
      { id: 'ebitda', label: 'EBITDA', min: 60, max: 130, step: 1, value: 93, fmt: 'num', unit: '$m' },
    ],
    compute: (v) => {
      const ev = v.mult * v.ebitda;
      const eq = ev - H.debt + H.cash;
      const ps = eq / H.shares;
      const gap = (ps / H.price - 1) * 100;
      const xs = [4, 6, 8, 10, 12, 14, 16];
      return {
        headline: { label: 'Implied value per share', value: usd(ps) },
        rows: [
          ['Implied enterprise value (multiple × EBITDA)', m(ev)],
          ['Implied equity value (EV − debt + cash)', m(eq)],
          ['Market price per share', usd(H.price)],
          ['Implied value compared with market price', `${gap >= 0 ? '+' : '−'}${Math.abs(gap).toFixed(1)}%`],
        ],
        note: `At ${v.mult}× an EBITDA of ${m(v.ebitda)}, each share is worth about ${usd(ps)}, ${Math.abs(gap) < 0.05 ? 'the same as' : gap > 0 ? `${Math.abs(gap).toFixed(1)}% above` : `${Math.abs(gap).toFixed(1)}% below`} the market price. Each extra turn of the multiple adds ${m(v.ebitda)} of enterprise value, about ${usd(v.ebitda / H.shares)} a share: the multiple you assume matters as much as the arithmetic.`,
        chart: { kind: 'line', x: { label: 'EV/EBITDA multiple', values: xs },
          series: [{ name: 'Implied value per share ($)', values: xs.map((x) => Math.round(((x * v.ebitda - H.debt + H.cash) / H.shares) * 100) / 100) },
                   { name: 'Market price ($)', values: xs.map(() => H.price) }],
          y: { label: '$ per share' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f00-vw-g1', type: 'steps', kind: 'numerical',
    prompt: 'A fictional listed hotel group has 50 million shares trading at $24.00, debt of $800 million and cash of $100 million. Its EBIT is $150 million and its depreciation and amortisation $90 million. Work out its value words step by step (in $ millions).',
    solution: 'Market cap = 24 × 50 = $1,200 million. EV = 1,200 + 800 − 100 = $1,900 million. EBITDA = 150 + 90 = $240 million. EV/EBITDA = 1,900 ÷ 240 ≈ 7.92.',
    steps: [
      { id: 'f00-vw-g1-s1', type: 'num', prompt: 'Market capitalisation, in $ millions.',
        answer: 1200, check: () => 24 * 50, unit: '$m', places: 0, tol: 0.5,
        hints: ['Share price × shares outstanding.'],
        wrong: [{ value: 1900, say: 'That is the enterprise value. Market capitalisation counts only the shares.' }] },
      { id: 'f00-vw-g1-s2', type: 'num', prompt: 'Enterprise value, in $ millions.',
        answer: 1900, check: () => 24 * 50 + 800 - 100, unit: '$m', places: 0, tol: 0.5,
        hints: ['Start from market capitalisation.', 'Add the debt a buyer takes on; subtract the cash the buyer receives.'],
        wrong: [
          { value: 2100, say: 'You added the cash. A buyer receives the cash, so it reduces the net cost: subtract it.' },
          { value: 300, say: 'You subtracted the debt. A buyer of the whole business takes on the debt, so add it.' },
        ] },
      { id: 'f00-vw-g1-s3', type: 'num', prompt: 'EBITDA, in $ millions.',
        answer: 240, check: () => 150 + 90, unit: '$m', places: 0, tol: 0.5,
        hints: ['EBITDA adds depreciation and amortisation back to EBIT.'],
        wrong: [{ value: 60, say: 'You subtracted D&A. EBIT is already after D&A; EBITDA adds it back.' }] },
      { id: 'f00-vw-g1-s4', type: 'num', prompt: 'EV/EBITDA, to two decimal places.',
        answer: 7.92, check: () => (24 * 50 + 800 - 100) / (150 + 90), unit: '×', places: 2, tol: 0.005,
        hints: ['Divide enterprise value by EBITDA.'],
        wrong: [{ value: 5, say: 'You divided market capitalisation by EBITDA. EBITDA belongs to lenders and shareholders, so divide enterprise value by it.' }] },
    ],
  },
  {
    id: 'f00-vw-g2', type: 'classify', kind: 'conceptual',
    prompt: 'For a fair multiple, which measure of value should each income-statement figure be compared with?',
    items: ['EBITDA', 'Net income', 'Revenue', 'EBIT', 'Earnings per share'],
    categories: ['Enterprise value', 'Market capitalisation or share price'],
    answer: [0, 1, 0, 0, 1],
    hints: [
      'Ask whether the figure is measured before or after the lenders are paid their interest.',
      'Before interest: it belongs to lenders and shareholders together, like enterprise value. After interest: it belongs to shareholders, like market cap.',
    ],
    feedback: {
      1: 'Net income is after interest: it is what is left for shareholders, so it pairs with market capitalisation (P/E).',
      2: 'Revenue comes before any costs, including interest, so it belongs with enterprise value (EV/revenue).',
      4: 'EPS is net income per share, so it pairs with the share price (P/E).',
    },
    solution: 'EBITDA, EBIT and revenue are measured before interest and belong to all capital providers: compare them with enterprise value. Net income and EPS are after interest and belong to shareholders: compare them with market capitalisation or the share price.',
  },
  {
    id: 'f00-vw-g3', type: 'mc', kind: 'conceptual',
    prompt: 'Why does enterprise value add a company’s debt to its market capitalisation?',
    options: [
      'Because someone buying the whole business takes on the debt as well as buying the shares, so the debt is part of what the business really costs',
      'Because debt is an asset of the company',
      'Because lenders own part of the shares',
      'Because debt increases the company’s profit',
    ],
    answer: 0,
    hints: ['Picture buying a house with a mortgage you must take over.', 'What does a buyer of every share still have to pay, after paying the shareholders?'],
    feedback: {
      1: 'Debt is a liability: money the company owes. It is added because a buyer of the business must still pay it.',
      2: 'Lenders own no shares; they have a separate claim. Enterprise value adds their claim to the shareholders’.',
      3: 'Debt adds interest costs, which reduce net income. It is added to EV because it is a claim on the business, not because it raises profit.',
    },
    solution: 'Enterprise value measures the net cost of the whole operating business. A buyer of every share also takes over the debt, so the debt is added; the buyer also receives the cash, so cash is subtracted.',
  },
  {
    id: 'f00-vw-g4', type: 'num', kind: 'applied',
    prompt: 'A fictional airline earned net income of $300 million and has 400 million shares outstanding. Its shares trade at $18.00. What is its P/E ratio?',
    answer: 24, check: () => 18 / (300 / 400), unit: '×', places: 1, tol: 0.05,
    hints: ['First find earnings per share: net income ÷ shares.', 'EPS = 300 ÷ 400 = $0.75. Now divide the price by EPS.'],
    wrong: [
      { value: 0.04, say: 'You divided EPS by the price. P/E puts the price on top.' },
      { value: 13.5, say: 'You multiplied the price by EPS. Divide the price by EPS.' },
    ],
    solution: 'EPS = 300 ÷ 400 = $0.75. P/E = 18.00 ÷ 0.75 = 24. Check with totals: market cap = 18 × 400 = $7,200 million; 7,200 ÷ 300 = 24. Investors pay 24 times one year’s earnings.',
  },
];

export const independent = [
  {
    id: 'f00-vw-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional clothing brand reports shareholders’ equity of $120 million. It has 10 million shares trading at $30.00. What is its market-to-book ratio?',
    answer: 2.5, check: () => (30 * 10) / 120, unit: '×', places: 2, tol: 0.005,
    wrong: [
      { value: 0.4, say: 'You divided book value by market value. Market-to-book puts the market value on top.' },
      { value: 0.25, say: 'You divided the share price by book equity in millions. Compare like with like: market cap (30 × 10 = $300 million) with book equity ($120 million).' },
    ],
    solution: 'Market cap = 30 × 10 = $300 million. Market-to-book = 300 ÷ 120 = 2.5. Investors pay $2.50 for each dollar of equity the accounts record, mainly because the brand’s value and its expected future earnings are not on the balance sheet.',
  },
  {
    id: 'f00-vw-i2', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these does EBITDA leave out, so that a business can have strong EBITDA and still run short of cash? Select all that apply.',
    options: [
      'Interest paid to lenders',
      'Income tax',
      'Spending to replace worn-out equipment',
      'Wages paid to staff',
      'The cost of raw materials',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Wages are operating costs, already subtracted before EBITDA.',
      4: 'Raw materials are operating costs, already subtracted before EBITDA.',
    },
    solution: 'EBITDA is earnings before interest, taxes, depreciation and amortisation. It leaves out interest and tax, and by adding back depreciation it ignores the spending needed to replace equipment. It also ignores cash tied up in working capital. Wages and materials are subtracted before EBITDA.',
  },
  {
    id: 'f00-vw-i3', type: 'num', kind: 'applied',
    prompt: 'A fictional online retailer has EBITDA of $50 million, debt of $120 million, cash of $30 million and 20 million shares. Similar retailers trade at 9 times EBITDA. What value per share does that multiple imply?',
    answer: 18, check: () => (9 * 50 - 120 + 30) / 20, unit: '$', places: 2, tol: 0.005,
    wrong: [
      { value: 22.5, say: 'That is the implied enterprise value per share. To reach the shareholders’ value, subtract the debt and add the cash first.' },
      { value: 27, say: 'You added the debt and subtracted the cash. Going from EV to equity reverses the EV formula: subtract debt, add cash.' },
      { value: 16.5, say: 'You subtracted the debt but forgot to add back the cash, which belongs to the shareholders.' },
    ],
    solution: 'Implied EV = 9 × 50 = $450 million. Equity value = 450 − 120 + 30 = $360 million. Per share = 360 ÷ 20 = $18.00. The result is only as good as the choice of 9× and the EBITDA figure.',
  },
  {
    id: 'f00-vw-i4', type: 'mc', kind: 'conceptual',
    prompt: 'Two companies have identical operations and the same EV/EBITDA, but one is financed largely with debt and the other has none. Which statement is most likely true?',
    options: [
      'Their P/E ratios differ, because interest reduces the indebted company’s net income and its shares are riskier',
      'Their P/E ratios must be identical, because the businesses are the same',
      'Their enterprise values must differ, because one has debt',
      'Their market capitalisations must be identical',
    ],
    answer: 0,
    feedback: {
      1: 'P/E depends on financing: interest lowers net income and debt changes the risk of the shares. That is why P/E comparisons need similarly financed companies.',
      2: 'Enterprise value is designed to be independent of financing; identical operations valued equally have the same EV.',
      3: 'With the same EV, the indebted company’s market cap is lower: part of the value belongs to its lenders.',
    },
    solution: 'EV and EBITDA do not depend on financing, so the same operations give the same EV/EBITDA. Net income and market capitalisation do, so P/E differs: compare P/E only between companies financed in similar ways.',
  },
  {
    id: 'f00-vw-i5', type: 'num', kind: 'numerical',
    prompt: 'Harbourline has an enterprise value of $930 million and EBIT of $61 million. What is its EV/EBIT multiple? Give two decimal places.',
    answer: 15.25, check: () => (42.5 * 18 + 210 - 45) / 61, unit: '×', places: 2, tol: 0.01,
    wrong: [
      { value: 10, say: 'That is EV/EBITDA. EV/EBIT divides by EBIT ($61 million), which is after depreciation and amortisation.' },
      { value: 12.54, say: 'You divided market capitalisation by EBIT. Pair EBIT with enterprise value.' },
    ],
    solution: '930 ÷ 61 ≈ 15.25. It is higher than EV/EBITDA (10.0) because EBIT is smaller: it is after the $32 million of depreciation and amortisation. Analysts sometimes prefer EV/EBIT for capital-heavy businesses because it charges something for the wear on equipment.',
  },
  {
    id: 'f00-vw-i6', type: 'mc', kind: 'applied',
    prompt: 'A fictional fitness-club chain for sale reports “adjusted EBITDA” of $25 million, after adding back $4 million of “one-off” marketing costs. Its marketing campaigns have cost about $4 million in each of the last five years. A buyer is paying 8 times EBITDA. What should the buyer do?',
    options: [
      'Use EBITDA of about $21 million, because a cost that recurs every year is not one-off; that lowers the price by about $32 million',
      'Accept the $25 million, because adjusted EBITDA is the standard measure',
      'Ignore EBITDA and pay the book value of equity instead',
      'Use $29 million, because marketing creates future sales and should be added back twice',
    ],
    answer: 0,
    feedback: {
      1: 'There is no standard definition of adjusted EBITDA; each company chooses its adjustments, so a buyer must test them.',
      2: 'Book value records mostly historical costs and leaves out much of the business’s earning power. It is not a substitute for a valuation.',
      3: 'Adding the cost back twice would overstate earnings even further. A recurring cost is part of running the business.',
    },
    solution: 'A cost that recurs every year is a normal operating cost. Removing the add-back gives 25 − 4 = $21 million of EBITDA. At 8×, the price falls by 4 × 8 = $32 million. Every add-back is worth the multiple times its size, so a buyer checks each one.',
  },
];

export const check = [
  {
    id: 'f00-vw-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What does a company’s market capitalisation measure?',
    options: [
      'The market value of its equity: share price times shares outstanding',
      'The total value of its operations, including debt',
      'Its shareholders’ equity as recorded in the balance sheet',
      'Its annual revenue',
    ],
    answer: 0,
    feedback: {
      1: 'That describes enterprise value, which adds debt and subtracts cash.',
      2: 'That is the book value of equity. Market capitalisation uses the market price of the shares.',
      3: 'Revenue is a flow of sales over a year; market capitalisation is a value at a moment.',
    },
    solution: 'Market capitalisation = share price × shares outstanding: what the stock market is paying for all of the company’s shares at that moment.',
  },
  {
    id: 'f00-vw-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional battery manufacturer has a market capitalisation of $2,400 million, debt of $600 million and cash of $350 million. What is its enterprise value, in $ millions?',
    answer: 2650, check: () => 2400 + 600 - 350, unit: '$m', places: 0, tol: 0.5,
    wrong: [
      { value: 3350, say: 'You added the cash. Cash reduces the net cost of the business: subtract it.' },
      { value: 2150, say: 'You subtracted the debt. A buyer of the business takes on the debt: add it.' },
      { value: 3000, say: 'You forgot to subtract the cash.' },
    ],
    solution: 'EV = 2,400 + 600 − 350 = $2,650 million.',
  },
  {
    id: 'f00-vw-k3', type: 'num', kind: 'numerical',
    prompt: 'Harbourline’s share price falls from $42.50 to $38.00. Its 18 million shares, $210 million of debt, $45 million of cash and $93 million of EBITDA are unchanged. What is its new EV/EBITDA? Give two decimal places.',
    answer: 9.13, check: () => (38 * 18 + 210 - 45) / 93, unit: '×', places: 2, tol: 0.005,
    wrong: [
      { value: 7.35, say: 'You divided market capitalisation by EBITDA. Add the debt and subtract the cash first.' },
      { value: 10, say: 'That is the multiple at the old price. Recalculate market capitalisation at $38.00.' },
    ],
    solution: 'Market cap = 38 × 18 = $684 million. EV = 684 + 210 − 45 = $849 million. EV/EBITDA = 849 ÷ 93 ≈ 9.13. The business has not changed; the market’s price for it has.',
  },
  {
    id: 'f00-vw-k4', type: 'mc', kind: 'applied',
    prompt: 'An analyst must compare two fictional coffee roasters: one has borrowed heavily to build new plants, the other has no debt. Which multiple gives the fairer first comparison of how the market values their businesses?',
    options: [
      'EV/EBITDA, because neither enterprise value nor EBITDA depends on how the business is financed',
      'P/E, because it is the most widely quoted multiple',
      'Market capitalisation divided by EBITDA, because it uses the share price',
      'Market-to-book, because book values are objective',
    ],
    answer: 0,
    feedback: {
      1: 'P/E is affected by interest and by the extra risk debt adds to the shares, so it is distorted when financing differs.',
      2: 'Market cap excludes the lenders’ claim while EBITDA includes earnings that will go to them, so this mismatched ratio makes the indebted roaster look cheap.',
      3: 'Book values depend on when assets were bought and leave out internally built value, and they are also affected by financing.',
    },
    solution: 'Use EV/EBITDA: enterprise value includes both lenders’ and shareholders’ claims, and EBITDA is earned before interest, so the comparison does not depend on financing. Then look at what EBITDA leaves out, such as the new plants’ spending.',
  },
  {
    id: 'f00-vw-k5', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about the book value of equity are correct? Select all that apply.',
    options: [
      'It equals total assets minus total liabilities as recorded in the balance sheet',
      'It is mostly based on what assets cost, not on what they are worth today',
      'It leaves out valuable things a business built itself, such as its brand',
      'It always equals market capitalisation for a listed company',
      'It changes every time the share price changes',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'The two usually differ: Harbourline’s book equity is $300 million and its market cap $765 million.',
      4: 'Book value changes with the accounts, not with the share price. Market capitalisation changes with the price.',
    },
    solution: 'Book value of equity is assets minus liabilities as recorded, largely at historical cost, and it leaves out internally built intangibles. It does not move with the share price and rarely equals market capitalisation.',
  },
  {
    id: 'f00-vw-k6', type: 'mc', kind: 'applied',
    prompt: 'A report says: “Using comparable companies, Harbourline is worth exactly $47.20 per share, so the shares at $42.50 are undervalued.” What is the most important weakness of this conclusion?',
    options: [
      'The value depends on which comparables and multiples were chosen; a different, reasonable choice could give a value below $42.50, so the report should state its assumptions and show a range',
      'Comparable-company valuation is never used by professionals',
      'Values per share cannot be calculated from multiples',
      'The calculation must be wrong, because market price is always the true value',
    ],
    answer: 0,
    feedback: {
      1: 'Relative valuation with multiples is used every day by analysts and bankers; its weakness is its reliance on assumptions, not that nobody uses it.',
      2: 'They can: implied EV minus debt plus cash, divided by shares, gives a value per share.',
      3: 'Market price is what the shares trade for today, not proof of their value; analysts disagree with it all the time. The issue is the false precision of “exactly”.',
    },
    solution: 'A multiple-based value is conditional on the peers, the earnings figure and the multiple chosen. With peers at 8× to 12× EBITDA, the lesson’s range ran from about $32 to $53 a share. A single precise number hides that range; a sound report states its assumptions and shows how the value changes with them.',
  },
];
