// shares-and-markets.ex.js — F06 · Shares and markets: widgets, practice and the knowledge check (answer keys live here).
// Morrow & Pike Roasters and Harbour Street Foods (fictional, F05's peers) come from case.js; market capitalisation and
// enterprise value from core/investments.js. Every other business, quote and price here is fictional.
import { COMPANIES } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';

const MP = COMPANIES.morrow, HS = COMPANIES.harbour;
const pct = (v, d = 2) => `${v < 0 ? '−' : ''}${(Math.abs(v * 100) + 1e-9).toFixed(d)}%`;
const m0 = (v) => `${v < 0 ? '−' : ''}$${Math.round(Math.abs(v)).toLocaleString('en-US')}m`;
// the three-company index of the worked example (fictional)
const IX = [
  { name: 'Aldwick Rail', short: 'Aldwick', p0: 120, shares: 10 },
  { name: 'Brisa Telecom', short: 'Brisa', p0: 15, shares: 300 },
  { name: 'Cobham Mills', short: 'Cobham', p0: 40, shares: 50 },
];

export const widgets = {
  'shr-ev': {
    type: 'formula',
    title: 'From market capitalisation to enterprise value',
    intro: 'Share price × shares gives the value of the equity; add debt and subtract cash for the value of the business. Starting values: Morrow & Pike Roasters (fictional), 31 December 2027, in $ millions.',
    inputs: [
      { id: 'price', label: 'Share price', min: 1, max: 100, step: 0.5, value: 28, fmt: 'money' },
      { id: 'shares', label: 'Shares outstanding (millions)', min: 1, max: 300, step: 1, value: 40, fmt: 'int' },
      { id: 'debt', label: 'Debt ($ millions)', min: 0, max: 2000, step: 1, value: 168, fmt: 'int' },
      { id: 'cash', label: 'Cash ($ millions)', min: 0, max: 500, step: 1, value: 30, fmt: 'int' },
    ],
    compute: (v) => {
      const cap = v.price * v.shares, ev = IV.enterpriseValue({ marketCap: cap, debt: v.debt, cash: v.cash }), nd = v.debt - v.cash;
      let note = `Shareholders’ claim is worth ${m0(cap)}. A buyer of the whole business would also take on ${m0(v.debt)} of debt and receive ${m0(v.cash)} of cash, so the business costs ${m0(ev)}.`;
      if (nd < 0) note += ' The company holds more cash than debt (negative net debt), so its enterprise value is below its market capitalisation.';
      else if (ev > 0) note += ` Net debt is ${pct(nd / ev, 1)} of enterprise value.`;
      if (ev <= 0) note += ' An enterprise value at or below zero would mean the market values the operating business at nothing, which is rare and usually signals a data error.';
      return {
        headline: { label: 'Enterprise value', value: m0(ev) },
        rows: [
          ['Market capitalisation (price × shares)', m0(cap)],
          ['Net debt (debt − cash)', m0(nd)],
          ['Debt ÷ market capitalisation', (v.debt / cap).toFixed(2)],
        ],
        note,
        chart: { kind: 'bar', x: { label: 'Measure', values: ['Market cap', 'Net debt', 'EV'] }, series: [{ name: '$ millions', values: [cap, nd, ev] }], y: { label: '$ millions' } },
      };
    },
  },
  'shr-index': {
    type: 'formula',
    title: 'Price weights against value weights',
    intro: 'Three fictional companies: Aldwick Rail ($120, 10 million shares), Brisa Telecom ($15, 300 million) and Cobham Mills ($40, 50 million). Set each one’s return for a day.',
    inputs: [
      { id: 'a', label: 'Aldwick Rail’s return', min: -20, max: 20, step: 1, value: 10, fmt: 'pct' },
      { id: 'b', label: 'Brisa Telecom’s return', min: -20, max: 20, step: 1, value: -2, fmt: 'pct' },
      { id: 'c', label: 'Cobham Mills’ return', min: -20, max: 20, step: 1, value: 1, fmt: 'pct' },
    ],
    compute: (v) => {
      const r = [v.a, v.b, v.c].map((x) => x / 100);
      const p0 = IX.reduce((s, c) => s + c.p0, 0), p1 = IX.reduce((s, c, i) => s + c.p0 * (1 + r[i]), 0);
      const cap0 = IX.reduce((s, c) => s + c.p0 * c.shares, 0), cap1 = IX.reduce((s, c, i) => s + c.p0 * c.shares * (1 + r[i]), 0);
      const pw = p1 / p0 - 1, vw = cap1 / cap0 - 1;
      const gap = Math.abs(pw - vw);
      return {
        headline: { label: 'Price-weighted index return', value: pct(pw) },
        rows: [
          ['Value-weighted index return', pct(vw)],
          ['Price-weighted index level (starts at 100)', (100 * p1 / p0).toFixed(2)],
          ['Weights by price (Aldwick, Brisa, Cobham)', IX.map((c) => pct(c.p0 / p0, 1)).join(', ')],
          ['Weights by value (Aldwick, Brisa, Cobham)', IX.map((c) => pct(c.p0 * c.shares / cap0, 1)).join(', ')],
        ],
        note: gap < 0.0005 ? 'The two indexes agree: the returns you set happen to give the same weighted average under both sets of weights.'
          : `The two indexes differ by ${(gap * 100).toFixed(2)} percentage points. Aldwick carries ${pct(IX[0].p0 / p0, 1)} of the price-weighted index because its share price is highest, but only ${pct(IX[0].p0 * IX[0].shares / cap0, 1)} of the market’s value; Brisa is the reverse.`,
        chart: { kind: 'bar', x: { label: 'Index', values: ['Price-weighted', 'Value-weighted'] }, series: [{ name: 'Return (%)', values: [pw * 100, vw * 100] }], y: { label: 'Return (%)' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f06-shr-g1', type: 'steps', kind: 'numerical',
    prompt: 'Harbour Street Foods (fictional) closed 2027 at $18.00 a share, with 120 million shares outstanding, $1,188 million of debt and $60 million of cash.',
    solution: 'Market capitalisation = 18.00 × 120 = $2,160 million. Enterprise value = 2,160 + 1,188 − 60 = $3,288 million. Net debt = 1,188 − 60 = $1,128 million, which is 1,128 ÷ 3,288 = 34.3% of enterprise value: about a third of the business is financed by lenders, net of cash.',
    steps: [
      { id: 'f06-shr-g1-s1', type: 'num', prompt: 'What is Harbour Street’s market capitalisation, in $ millions?',
        answer: 2160, check: () => HS.price * HS.shares, unit: '$m', places: 0, tol: 0.5,
        hints: ['Market capitalisation = share price × shares outstanding.'],
        wrong: [{ value: 3288, say: 'That is the enterprise value. Market capitalisation is the equity alone: price × shares.' }] },
      { id: 'f06-shr-g1-s2', type: 'num', prompt: 'What is its enterprise value, in $ millions?',
        answer: 3288, check: () => IV.enterpriseValue({ marketCap: HS.price * HS.shares, debt: HS.debt, cash: HS.cash }), unit: '$m', places: 0, tol: 0.5,
        hints: ['Enterprise value = market capitalisation + debt − cash.', '2,160 + 1,188 − 60.'],
        wrong: [{ value: 3408, say: 'You added the cash. A buyer receives the cash, so it is subtracted: 2,160 + 1,188 − 60.' }, { value: 3348, say: 'You left the cash out. Subtract the $60 million.' }] },
      { id: 'f06-shr-g1-s3', type: 'num', prompt: 'What share of the enterprise value is net debt? Give a percentage to one decimal place.',
        answer: 34.3, check: () => (HS.debt - HS.cash) / (HS.price * HS.shares + HS.debt - HS.cash) * 100, unit: '%', places: 1, tol: 0.1,
        hints: ['Net debt = debt − cash; divide it by enterprise value.'],
        wrong: [{ value: 36.1, say: 'That uses gross debt (1,188 ÷ 3,288). Net debt subtracts the cash first.' }, { value: 52.2, say: 'That divides net debt by market capitalisation. The question asks for its share of enterprise value.' }] },
    ],
  },
  {
    id: 'f06-shr-g2', type: 'classify', kind: 'conceptual',
    prompt: 'Which of these transactions raise money for the company whose shares are sold?',
    items: [
      'Morrow & Pike sells 2 million new shares to investors through its bankers.',
      'A pension fund sells 50,000 Harbour Street shares to an insurance company.',
      'A fictional software company lists on an exchange and sells shares to the public for the first time.',
      'Ana’s market fund buys Morrow & Pike shares with her $400 monthly contribution.',
      'An investor’s market order to buy Harbour Street shares is filled at the ask.',
    ],
    categories: ['Raises money for the company', 'Does not'],
    answer: [0, 1, 0, 1, 1],
    hints: ['Ask who receives the buyer’s money: the company, or another investor?', 'Only the primary market (new shares) pays the company.'],
    feedback: {
      1: 'Existing shares changing hands: the money goes to the pension fund, not to Harbour Street.',
      3: 'The fund buys existing shares from other investors in the secondary market.',
      4: 'A filled order is a secondary-market trade; the seller is another investor.',
    },
    solution: 'New shares (a seasoned offering, an initial public offering) are sold in the primary market and pay the company. Every other trade is in the secondary market, where the money passes between investors.',
  },
  {
    id: 'f06-shr-g3', type: 'formula', kind: 'applied',
    prompt: 'The sheet holds a company’s share price, its shares outstanding (millions), its debt and its cash ($ millions). In B6, write a formula for its enterprise value in $ millions.',
    sheet: { cells: { A1: 'Share price', B1: 28, A2: 'Shares outstanding (m)', B2: 40, A3: 'Debt ($m)', B3: 168, A4: 'Cash ($m)', B4: 30, A6: 'Enterprise value ($m)' },
      vary: { B1: [18, 35.5], B2: [120, 25], B3: [1188, 60], B4: [60, 12] } },
    cell: 'B6', view: 'A1:B6', widths: { A: 24, B: 12 }, formats: { B1: '$#,##0.00', B3: '#,##0', B4: '#,##0', B6: '#,##0' },
    answer: '=B1*B2+B3-B4',
    alt: ['=B2*B1+B3-B4', '=B1*B2-B4+B3', '=B3-B4+B1*B2', '=B1*B2+(B3-B4)'],
    wrong: [
      { formula: '=B1*B2+B3+B4', say: 'Cash is subtracted, not added: a buyer of the business receives it.' },
      { formula: '=B1*B2', say: 'That is the market capitalisation, the equity alone. Add the debt and subtract the cash.' },
      { formula: '=B1*B2-B3+B4', say: 'The signs are reversed: debt is a cost to the buyer (added), cash an offset (subtracted).' },
    ],
    hints: ['Market capitalisation is B1*B2.', 'Enterprise value = market capitalisation + debt − cash.'],
    solution: '<x>=B1*B2+B3-B4</x> gives 28 × 40 + 168 − 30 = 1,258 for Morrow & Pike. The parts are worth keeping in view: B1*B2 is the equity, B3−B4 the net debt.',
  },
  {
    id: 'f06-shr-g4', type: 'steps', kind: 'numerical',
    prompt: 'A two-company index holds Dunholm Shipping (fictional; $80.00 a share, 5 million shares) and Elver Foods (fictional; $10.00 a share, 100 million shares). One week Dunholm rises 5% and Elver falls 1%.',
    solution: 'Price-weighted: prices sum to $90.00 before and 84.00 + 9.90 = $93.90 after, a return of 93.90 ÷ 90.00 − 1 = 4.33%. Value-weighted: market capitalisations are $400 million and $1,000 million; the return is (400 × 5% − 1,000 × 1%) ÷ 1,400 = 10 ÷ 1,400 = 0.71%. Dunholm is the smaller company but has the higher price, so it dominates the price-weighted index.',
    steps: [
      { id: 'f06-shr-g4-s1', type: 'num', prompt: 'What is the return on the price-weighted index? Give a percentage to two decimal places.',
        answer: 4.33, check: () => ((80 * 1.05 + 10 * 0.99) / 90 - 1) * 100, unit: '%', places: 2, tol: 0.01,
        hints: ['Add the two prices before and after the week; the divisor cancels in the return.', 'Before: 80 + 10 = 90. After: 84.00 + 9.90.'],
        wrong: [{ value: 2, say: 'That is the simple average of the two returns (equal weights). A price-weighted index weights each by its price: 80 ÷ 90 for Dunholm.' }] },
      { id: 'f06-shr-g4-s2', type: 'num', prompt: 'What is the return on the value-weighted index? Give a percentage to two decimal places.',
        answer: 0.71, check: () => ((80 * 5 * 0.05 + 10 * 100 * -0.01) / (80 * 5 + 10 * 100)) * 100, unit: '%', places: 2, tol: 0.01,
        hints: ['Market capitalisations: 80 × 5 = 400 and 10 × 100 = 1,000 ($ millions).', 'Weight each return by market capitalisation: (400 × 5% + 1,000 × (−1%)) ÷ 1,400.'],
        wrong: [{ value: 4.33, say: 'That is the price-weighted return. Weight by market capitalisation instead.' }, { value: 2, say: 'That weights the two equally. Elver is worth 2.5 times as much as Dunholm.' }] },
      { id: 'f06-shr-g4-s3', type: 'mc', prompt: 'Which index better describes how much the market’s total value changed that week?',
        options: ['The value-weighted one: its weights are shares of total market value', 'The price-weighted index, because it is based on the prices investors actually paid', 'Neither: the two are equally valid measures of the change in total value', 'The price-weighted index, because Dunholm’s higher price shows it is the larger company'],
        answer: 0,
        hints: ['Total value = Σ price × shares. Which index tracks that sum?'],
        feedback: { 1: 'Both use actual prices. The question is what each price is multiplied by: one share, or all the shares.', 2: 'Only the value-weighted index equals the percentage change in the companies’ combined market capitalisation.', 3: 'A high price says nothing about size: Dunholm’s market capitalisation is $400 million, Elver’s $1,000 million.' } },
    ],
  },
];

export const independent = [
  {
    id: 'f06-shr-i1', type: 'num', kind: 'numerical',
    prompt: 'Harbour Street Foods (fictional) is quoted at a bid of $17.97 and an ask of $18.03. What would it cost, in dollars, to buy 500 shares with a market order and sell them straight back with another, if the quotes do not move?',
    answer: 30, check: () => 500 * (18.03 - 17.97), unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: 0.06, say: 'That is the spread per share. Multiply by the 500 shares.' }, { value: 15, say: 'That counts half the spread. Buying at the ask and selling at the bid loses the whole $0.06 on each share.' }],
    solution: 'A market order to buy fills at the ask, $18.03; a market order to sell at the bid, $17.97. The loss is 500 × $0.06 = $30.00, about 0.33% of the $9,000 traded, before any commission.',
  },
  {
    id: 'f06-shr-i2', type: 'mc', kind: 'applied',
    prompt: 'Rowan Brewing (fictional) is thinly traded: its last trade was at $12.40, and it is quoted at a bid of $12.10 and an ask of $12.70. An investor places a buy limit order at $12.40. What happens?',
    options: ['It is filled only if a seller accepts $12.40 or less; otherwise it waits unfilled', 'It is filled at once at $12.40, the last trade price', 'It is filled at once at the ask, $12.70, the best price on offer', 'It is filled at the midpoint of the quotes, $12.40, because that is the fair price'],
    answer: 0,
    feedback: {
      1: 'The last trade sets no price for the next one. Someone must be willing to sell at $12.40 or less.',
      2: 'That is what a market order would do. A limit order never pays more than its limit.',
      3: 'Orders are not filled at the midpoint by default; a buyer at $12.40 needs a seller at $12.40 or below.',
    },
    solution: 'A buy limit order executes only at the limit or better. The best seller asks $12.70, so the order waits until a seller lowers the price to $12.40 or less, and may never be filled. In return the investor avoids paying $12.70 in a wide market.',
  },
  {
    id: 'f06-shr-i3', type: 'formula', kind: 'applied',
    prompt: 'Rows 2 to 4 hold three companies’ market capitalisations at the start of a month (column B, $ millions) and their returns for the month (column C). In C6, write a formula for the month’s return on a value-weighted index of the three.',
    sheet: { cells: { A1: 'Company', B1: 'Market cap ($m)', C1: 'Return', A2: 'Morrow & Pike', B2: 1120, C2: 0.03, A3: 'Harbour Street', B3: 2160, C3: -0.01, A4: 'Cobham Mills', B4: 2000, C4: 0.02, A6: 'Index return' },
      vary: { C2: [-0.04, 0.05], C3: [0.025, -0.03], C4: [0.01, -0.02], B2: [900, 1300], B3: [2500, 1800] } },
    cell: 'C6', view: 'A1:C6', widths: { A: 18, B: 16, C: 10 }, formats: { B: '#,##0', C: '0.00%' },
    answer: '=SUMPRODUCT(B2:B4,C2:C4)/SUM(B2:B4)',
    alt: ['=SUMPRODUCT(C2:C4,B2:B4)/SUM(B2:B4)', '=(B2*C2+B3*C3+B4*C4)/SUM(B2:B4)', '=(B2*C2+B3*C3+B4*C4)/(B2+B3+B4)'],
    wrong: [
      { formula: '=AVERAGE(C2:C4)', say: 'That weights the three companies equally. A value-weighted index weights each by its market capitalisation.' },
      { formula: '=SUMPRODUCT(B2:B4,C2:C4)', say: 'That is the change in total market value in $ millions. Divide by the total market capitalisation to make it a return.' },
    ],
    solution: '<x>=SUMPRODUCT(B2:B4,C2:C4)/SUM(B2:B4)</x>: each return times its company’s market capitalisation, summed, divided by the total. For the figures shown: (1,120 × 3% − 2,160 × 1% + 2,000 × 2%) ÷ 5,280 = 52 ÷ 5,280 = 0.98%.',
  },
  {
    id: 'f06-shr-i4', type: 'classify', kind: 'conceptual',
    prompt: 'Morrow & Pike’s share price stays at $28.00. What does each event do to its market capitalisation and its enterprise value?',
    items: [
      'It borrows $50 million and keeps the money in the bank.',
      'It uses $20 million of its cash to repay part of its debt.',
      'It sells 2 million new shares at $28.00 and keeps the money as cash.',
      'It uses $20 million of cash to buy back shares at $28.00.',
    ],
    categories: ['Both unchanged', 'Market cap up, EV unchanged', 'Market cap down, EV unchanged', 'Both up'],
    answer: [0, 0, 1, 2],
    feedback: {
      0: 'Debt and cash both rise by $50 million, so net debt, and enterprise value, do not change.',
      1: 'Debt and cash both fall by $20 million: net debt and enterprise value are unchanged.',
      2: 'Shares rise to 42 million, adding $56 million of market capitalisation, and cash rises by the same $56 million, which enterprise value subtracts.',
      3: 'About 714,000 fewer shares cut market capitalisation by $20 million, and cash falls by $20 million, which enterprise value no longer subtracts.',
    },
    solution: 'Enterprise value measures the operating business, so moving money between cash, debt and equity leaves it unchanged at a fixed share price. Market capitalisation changes only when the number of shares (or the price) changes: up with a share issue, down with a buyback.',
  },
  {
    id: 'f06-shr-i5', type: 'num', kind: 'numerical',
    prompt: 'Pennard Water (fictional, listed) trades at $40.00 and has just paid a dividend of $1.80 a share. Investors require 8% a year from its shares. If dividends are expected to grow at a constant rate for ever, what growth rate does the price imply? Give a percentage to two decimal places.',
    answer: 3.35, check: () => (0.08 * 40 - 1.8) / (40 + 1.8) * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [{ value: 3.5, say: 'That subtracts the yield on the dividend just paid (1.80 ÷ 40 = 4.5%) from 8%. The Gordon model uses next year’s dividend, 1.80 × (1 + g), so solve 40 = 1.80(1 + g) ÷ (0.08 − g).' }, { value: 4.5, say: 'That is the dividend yield, not the growth rate.' }],
    solution: 'The Gordon growth model: 40 = 1.80(1 + g) ÷ (0.08 − g). Rearranging, g = (0.08 × 40 − 1.80) ÷ (40 + 1.80) = 1.40 ÷ 41.80 = 3.35%. At $40.00 investors are paying for dividends that grow about 3.3% a year for ever.',
  },
  {
    id: 'f06-shr-i6', type: 'mc', kind: 'conceptual',
    prompt: 'Tolverne Bakeries (fictional) fails. After its assets are sold, there is enough to repay its lenders in full and half of what its preferred shareholders are owed. What do its common shareholders receive?',
    options: ['Nothing: they are paid only after the preferred shareholders are paid in full', 'Half of what they paid for their shares, the same proportion as the preferred shareholders', 'Their share of whatever is left, divided equally with the preferred shareholders', 'Nothing now, but they can claim the shortfall from the directors personally'],
    answer: 0,
    feedback: {
      1: 'Claims are paid in order, not in proportion. Preferred shareholders rank ahead of common ones.',
      2: 'Preferred and common shareholders are not paid side by side: preferred comes first.',
      3: 'Limited liability works both ways: shareholders cannot be pursued for the company’s debts, and they have no claim on the directors simply because the company failed.',
    },
    solution: 'Lenders are paid first, then preferred shareholders, then common shareholders, who hold the residual claim. With the preferred shareholders only half paid, nothing is left for the common shareholders. Their loss is limited to what they paid for their shares.',
  },
];

export const check = [
  {
    id: 'f06-shr-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why does a fund that tracks a value-weighted index not need to trade when its shares’ prices change?',
    options: ['Each holding moves with its own price, so its weights track the index’s automatically', 'Value-weighted indexes are recalculated only once a year, so daily price changes do not affect them', 'Its manager is allowed to let the weights drift by up to a set margin before rebalancing', 'Price changes affect a price-weighted index but leave a value-weighted index unchanged'],
    answer: 0,
    feedback: {
      1: 'A value-weighted index changes whenever prices change. The point is that the fund’s holdings change in the same proportions without trading.',
      2: 'No tolerance is needed: holding each company’s shares in proportion to its market capitalisation keeps the fund matched automatically.',
      3: 'Both kinds of index move when prices move.',
    },
    solution: 'In a value-weighted index each company’s weight is its market capitalisation ÷ the total. A fund holding the same fraction of every company’s shares sees each holding rise or fall with that company’s price, exactly as the company’s market capitalisation does, so its weights stay equal to the index’s. It trades only when companies join or leave, or issue or buy back shares.',
  },
  {
    id: 'f06-shr-k2', type: 'num', kind: 'numerical',
    prompt: 'If Morrow & Pike’s share price fell from $28.00 to $25.00, with its 40 million shares, $168 million of debt and $30 million of cash unchanged, what would its enterprise value be, in $ millions?',
    answer: 1138, check: () => IV.enterpriseValue({ marketCap: 25 * MP.shares, debt: MP.debt, cash: MP.cash }), unit: '$m', places: 0, tol: 0.5,
    wrong: [{ value: 1000, say: 'That is the new market capitalisation (25 × 40). Add the debt and subtract the cash.' }, { value: 1198, say: 'You added the cash. Enterprise value is 1,000 + 168 − 30.' }],
    solution: 'Market capitalisation 25 × 40 = $1,000 million; enterprise value 1,000 + 168 − 30 = $1,138 million, down $120 million, exactly the fall in the equity’s value, because net debt is unchanged.',
  },
  {
    id: 'f06-shr-k3', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about common and preferred shares are true? Select all that apply.',
    options: [
      'Common shareholders usually vote to elect the board of directors.',
      'Preferred shareholders are paid their dividends before common shareholders receive any.',
      'A company that skips a preferred dividend is in default, as it would be for missed interest.',
      'Common shareholders can lose no more than they paid for their shares.',
      'Preferred shares rank ahead of the company’s bonds if it is liquidated.',
    ],
    answer: [0, 1, 3],
    feedback: { 2: 'Preferred dividends must be declared by the board; skipping one is not a default in the way missing an interest payment is.', 4: 'Lenders rank first. Preferred shares come after all debt and before common shares.' },
    solution: 'Common shares carry votes and the residual claim, with limited liability. Preferred shares get their fixed dividend first and rank ahead of common shares in a liquidation, but behind lenders, and a skipped preferred dividend is not a default.',
  },
  {
    id: 'f06-shr-k4', type: 'num', kind: 'numerical',
    prompt: 'A price-weighted index of three fictional shares priced $90.00, $30.00 and $60.00 has a divisor of 1.8, so it stands at 100. The $90.00 share then splits three for one. What must the new divisor be for the index to stay at 100? Give your answer to two decimal places.',
    answer: 1.2, check: () => (90 / 3 + 30 + 60) / ((90 + 30 + 60) / 1.8), unit: '', places: 2, tol: 0.005,
    wrong: [{ value: 0.6, say: 'That divides the old divisor by 3. Only one of the three shares split: recompute the sum of prices (30 + 30 + 60 = 120) and divide by 100.' }, { value: 1.8, say: 'Without a new divisor the index would fall to 120 ÷ 1.8 = 66.67 although nothing has changed.' }],
    solution: 'After the split the prices are $30, $30 and $60, summing to $120. For the index to stay at 100 the divisor must be 120 ÷ 100 = 1.20.',
  },
  {
    id: 'f06-shr-k5', type: 'mc', kind: 'applied',
    prompt: 'A fictional retiree must sell 2,000 shares of a small company that trades a few times a day, quoted at a bid of $9.80 and an ask of $10.40. Which order best protects her from selling far below what the shares are worth?',
    options: ['A sell limit order at a price she would accept, such as $10.00', 'A market order to sell, because it is filled at once at the midpoint of $10.10', 'A market order to buy, because it fills at the ask of $10.40', 'A sell limit order at $10.40, the ask, to be sure of a quick sale'],
    answer: 0,
    feedback: {
      1: 'A market order to sell is filled at the best bid, $9.80 or lower if the bid is for fewer than 2,000 shares, not at the midpoint.',
      2: 'She is selling, not buying.',
      3: 'A limit at the ask is the price buyers are not yet paying, so it may wait a long time: it is the slowest to fill, not the quickest.',
    },
    solution: 'In a thin market with a wide spread, a market order sells at whatever bids exist, possibly well below $9.80 for 2,000 shares. A sell limit order sets the lowest price she accepts; the cost is that it may take time to fill, or not fill at all.',
  },
  {
    id: 'f06-shr-k6', type: 'num', kind: 'applied',
    prompt: 'An index provider builds a value-weighted index of just two companies, Morrow & Pike (market capitalisation $1,120 million) and Harbour Street ($2,160 million). What weight does Morrow & Pike have? Give a percentage to one decimal place.',
    answer: 34.1, check: () => MP.marketCap / (MP.marketCap + HS.marketCap) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [{ value: 60.9, say: 'That weights by share price ($28.00 ÷ $46.00): a price-weighted index. Use market capitalisations.' }, { value: 27.7, say: 'That uses enterprise values. Index weights are market capitalisations, because the fund buys shares.' }, { value: 50, say: 'That is equal weighting.' }],
    solution: '1,120 ÷ (1,120 + 2,160) = 1,120 ÷ 3,280 = 34.1%. Harbour Street has the other 65.9%.',
  },
];
