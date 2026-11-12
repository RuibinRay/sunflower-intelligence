// relative-valuation.ex.js — F06 · Relative valuation: widgets, practice and the knowledge check (answer keys live
// here). Morrow & Pike Roasters and Harbour Street Foods come from case.js; Copperkettle Coffee, Lowfield Dairies,
// Penrock Software, Quarrendon Kitchens and every other business named here is fictional. Brightcup Coffee is the
// course project’s and its multiples are not used.
import { COMPANIES, MARKET } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';

const M = COMPANIES.morrow, H = COMPANIES.harbour;
const { rf, mrp } = MARKET;
const KM = IV.capm({ rf, beta: 0.9, mrp }), KH = IV.capm({ rf, beta: 1.25, mrp });
const pct = (v, d = 1) => `${v < 0 ? '−' : ''}${(Math.abs(v * 100) + 1e-9).toFixed(d)}%`;
const mil = (v) => `$${v.toFixed(1)}m`;
const x1 = (v) => `${v.toFixed(1)}×`;
const roeM = M.netIncome / M.bookEquity, payM = M.dps / M.eps, gM = (1 - payM) * roeM;

export const widgets = {
  'rel-value': {
    type: 'formula',
    title: 'Copperkettle Coffee by an EV/EBITDA multiple',
    intro: 'Copperkettle Coffee (fictional, private) made EBITDA of $9.0 million and net income of $4.2 million in 2027 and has net debt of $10 million. The peers trade at 8.0 (Harbour Street) and 10.7 (Morrow & Pike) times EBITDA, and at 12.7 and 18.0 times earnings.',
    inputs: [
      { id: 'm', label: 'EV/EBITDA multiple applied', min: 5, max: 14, step: 0.1, value: 9.3, fmt: 'num', unit: '×' },
      { id: 'ebitda', label: 'Copperkettle’s EBITDA', min: 4, max: 14, step: 0.1, value: 9.0, fmt: 'money', unit: 'm' },
      { id: 'nd', label: 'Net debt (debt − cash)', min: 0, max: 30, step: 0.5, value: 10, fmt: 'money', unit: 'm' },
      { id: 'ni', label: 'Net income', min: 1, max: 8, step: 0.1, value: 4.2, fmt: 'money', unit: 'm' },
    ],
    compute: (v) => {
      const ev = v.m * v.ebitda, eq = ev - v.nd, pe = eq / v.ni;
      const lo = H.m.evEbitda * v.ebitda - v.nd, hi = M.m.evEbitda * v.ebitda - v.nd;
      if (eq <= 0) return { error: 'At this multiple the debt is worth more than the business: the equity has no value. Raise the multiple or lower the debt.' };
      let note = `Enterprise value ${mil(ev)} less net debt ${mil(v.nd)} leaves ${mil(eq)} for the owner. `;
      if (pe < H.m.pe - 0.5) note += `That is only ${x1(pe)} earnings, below both peers’ P/Es: the debt or a thin profit after interest makes the equity cheap relative to the business.`;
      else if (pe > M.m.pe + 0.5) note += `That is ${x1(pe)} earnings, above both peers’ P/Es: check whether the EBITDA multiple is too generous for a business this size.`;
      else note += `That is ${x1(pe)} earnings, inside the peers’ range of 12.7 to 18.0, so the two kinds of multiple tell a consistent story.`;
      return {
        headline: { label: 'Equity value', value: mil(eq) },
        rows: [['Enterprise value', mil(ev)], ['Implied P/E (equity ÷ net income)', x1(pe)], ['At Harbour Street’s 8.0×', mil(lo)], ['At Morrow & Pike’s 10.7×', mil(hi)]],
        note,
        chart: { kind: 'bar', x: { label: 'Multiple used', values: ['Harbour', 'Chosen', 'Morrow'] }, series: [{ name: 'Equity value', values: [lo, eq, hi].map((x) => Math.round(x * 10) / 10) }], y: { label: 'Equity value ($m)' } },
      };
    },
  },
  'rel-justified': {
    type: 'formula',
    title: 'What a P/E and a price-to-book should be',
    intro: 'The Gordon model’s justified multiples: growth = (1 − payout) × ROE. Starting values: Morrow & Pike (fictional), payout 45%, ROE 12.0%, cost of equity 9.15%.',
    inputs: [
      { id: 'pay', label: 'Payout ratio', min: 10, max: 90, step: 0.5, value: 45, fmt: 'pct' },
      { id: 'roe', label: 'Return on equity', min: 4, max: 20, step: 0.1, value: 12, fmt: 'pct' },
      { id: 'ke', label: 'Cost of equity', min: 6, max: 14, step: 0.05, value: 9.15, fmt: 'pct', digits: 2 },
    ],
    compute: (v) => {
      const p = v.pay / 100, roe = v.roe / 100, ke = v.ke / 100, g = (1 - p) * roe;
      if (ke <= g + 0.0025) return { error: `Growth of ${pct(g, 2)} (retention × ROE) is at or too close to the cost of equity: the model has no finite answer. Pay out more, or lower the ROE.` };
      const pe = p * (1 + g) / (ke - g), pb = (roe - g) / (ke - g);
      const ps = [20, 30, 40, 50, 60, 70, 80, 90].filter((q) => (1 - q / 100) * roe < ke - 0.0025);
      return {
        headline: { label: 'Justified P/E (on this year’s earnings)', value: x1(pe) },
        rows: [['Growth = retention × ROE', pct(g, 2)], ['Justified price-to-book', pb.toFixed(2)], ['Morrow & Pike trades at', 'P/E 18.0, price-to-book 2.15'], ['Harbour Street trades at', 'P/E 12.7, price-to-book 1.31']],
        note: roe > ke ? 'ROE is above the cost of equity, so retaining earnings creates value: the justified price-to-book is above 1 and rises as the payout falls.'
          : roe < ke ? 'ROE is below the cost of equity, so every dollar retained is worth less than a dollar to shareholders: the justified price-to-book is below 1, and paying out more raises the value.'
          : 'ROE equals the cost of equity: retention neither creates nor destroys value, and the share is worth its book value whatever the payout.',
        chart: { kind: 'line', x: { label: 'Payout ratio (%)', values: ps }, series: [{ name: 'Justified P/E', values: ps.map((q) => { const gg = (1 - q / 100) * roe; return Math.round(q / 100 * (1 + gg) / (ke - gg) * 10) / 10; }) }], y: { label: 'P/E' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f06-rel-g1', type: 'steps', kind: 'numerical',
    prompt: 'Lowfield Dairies (fictional, listed) trades at $9.50 with 200 million shares. It has $640 million of debt and $40 million of cash, and earned EBITDA of $300 million and net income of $125 million last year.',
    solution: 'Market capitalisation 9.50 × 200 = $1,900 million. Enterprise value 1,900 + 640 − 40 = $2,500 million. EV/EBITDA 2,500 ÷ 300 = 8.33; P/E 1,900 ÷ 125 = 15.2.',
    steps: [
      { id: 'f06-rel-g1-s1', type: 'num', prompt: 'What is Lowfield’s enterprise value, in $ millions?',
        answer: 2500, check: () => IV.enterpriseValue({ marketCap: 9.5 * 200, debt: 640, cash: 40 }), unit: '$m', places: 0,
        hints: ['Start from market capitalisation: price × shares.', '1,900 + debt − cash.'],
        wrong: [{ value: 2580, say: 'Cash reduces enterprise value: a buyer of the whole business gets it back. Subtract it.' }, { value: 1900, say: 'That is the market capitalisation, the value of the shares only. Add the debt and take off the cash.' }] },
      { id: 'f06-rel-g1-s2', type: 'num', prompt: 'What is its EV/EBITDA? Give two decimal places.',
        answer: 8.33, check: () => 2500 / 300, unit: '×', places: 2, tol: 0.01,
        hints: ['Enterprise value ÷ EBITDA.'],
        wrong: [{ value: 6.33, say: 'That divides the market capitalisation by EBITDA, mixing an equity value with an operating figure.' }] },
      { id: 'f06-rel-g1-s3', type: 'num', prompt: 'What is its P/E? Give one decimal place.',
        answer: 15.2, check: () => 1900 / 125, unit: '×', places: 1, tol: 0.05,
        hints: ['Market capitalisation ÷ net income, or price ÷ EPS.'],
        wrong: [{ value: 20, say: 'That divides enterprise value by net income. Net income is after interest, so it belongs to shareholders: use market capitalisation.' }] },
    ],
  },
  {
    id: 'f06-rel-g2', type: 'mc', kind: 'conceptual',
    prompt: 'An analyst values a target company by multiplying its EBITDA by the peers’ average P/E. What is wrong?',
    options: ['P/E prices earnings after interest and depreciation; EBITDA is before both, and partly the lenders’', 'Nothing, provided the peers have about the same debt as the target', 'P/E should be applied to revenue, the most stable figure in the accounts', 'The peers’ P/E must first be converted to a dividend yield'],
    answer: 0,
    hints: ['Whose money is in the numerator of a P/E? Whose is EBITDA?'],
    feedback: { 1: 'Even with identical debt, EBITDA is before depreciation and interest, so a P/E applied to it overstates the equity heavily.', 2: 'A P/E pairs with net income. Revenue pairs with enterprise value (EV/revenue).', 3: 'A dividend yield is another equity measure; it doesn’t fix the mismatch.' },
    solution: 'A P/E is equity value over net income, which comes after interest and depreciation. EBITDA is before both and belongs to lenders and shareholders together. Pair EBITDA with an enterprise multiple, then bridge to equity; pair a P/E with net income.',
  },
  {
    id: 'f06-rel-g3', type: 'formula', kind: 'applied',
    prompt: 'The sheet holds a peer EV/EBITDA multiple (B1) and a listed target’s EBITDA (B2), debt (B3), cash (B4) and shares outstanding (B5), in $ millions and millions of shares. In B7, write one formula for the value per share the multiple implies.',
    sheet: { cells: { A1: 'Peer EV/EBITDA', B1: 9.3, A2: 'Target EBITDA ($m)', B2: 85, A3: 'Debt ($m)', B3: 220, A4: 'Cash ($m)', B4: 35, A5: 'Shares (m)', B5: 24, A7: 'Value per share ($)' },
      vary: { B1: [7.6, 10.4] } },
    cell: 'B7', view: 'A1:B7', widths: { A: 22, B: 10 }, formats: { B1: '0.0', B7: '$#,##0.00' },
    answer: '=(B1*B2-B3+B4)/B5',
    wrong: [
      { formula: '=B1*B2/B5', say: 'That is enterprise value per share. Lenders own the debt part: subtract debt and add cash before dividing.' },
      { formula: '=(B1*B2-B3-B4)/B5', say: 'Cash belongs to shareholders: add it.' },
      { formula: '=(B1*B2+B3-B4)/B5', say: 'That goes the wrong way across the bridge: equity is enterprise value minus net debt.' },
    ],
    hints: ['Multiple × EBITDA is an enterprise value.', 'Equity = EV − debt + cash; then divide by shares.'],
    solution: '<x>=(B1*B2-B3+B4)/B5</x>: 9.3 × 85 = $790.5 million of enterprise value, minus $220 million of debt plus $35 million of cash leaves $605.5 million, or $25.23 a share.',
  },
  {
    id: 'f06-rel-g4', type: 'steps', kind: 'numerical',
    prompt: 'Use the Gordon model to judge Harbour Street Foods’ P/E. Harbour Street (fictional) pays out 42.5% of its earnings, earns a return on equity of 10.27% and has a beta of 1.25. The risk-free rate is 4.2% and the market risk premium 5.5%. It trades at 12.7 times its 2027 earnings.',
    solution: 'Cost of equity 4.2% + 1.25 × 5.5% = 11.075%. Growth = 0.575 × 10.27% = 5.91%. Justified P/E = 0.425 × 1.0591 ÷ (11.075% − 5.91%) = 8.7. The market’s 12.7 is well above what Harbour Street’s risk and return on equity support.',
    steps: [
      { id: 'f06-rel-g4-s1', type: 'num', prompt: 'What growth rate do retention and ROE give? Give a percentage to two decimal places.',
        answer: 5.91, check: () => (1 - H.dps / H.eps) * (H.netIncome / H.bookEquity) * 100, unit: '%', places: 2, tol: 0.02,
        hints: ['g = (1 − payout) × ROE.'],
        wrong: [{ value: 4.36, say: 'That multiplies the payout by ROE. Growth comes from what is retained: 1 − 0.425.' }] },
      { id: 'f06-rel-g4-s2', type: 'num', prompt: 'What P/E (on this year’s earnings) does the Gordon model justify? Give one decimal place.',
        answer: 8.7, check: () => { const g = (1 - H.dps / H.eps) * (H.netIncome / H.bookEquity); return H.dps / H.eps * (1 + g) / (KH - g); }, unit: '×', places: 1, tol: 0.05,
        hints: ['Cost of equity first: 4.2% + 1.25 × 5.5%.', 'Payout × (1 + g) ÷ (r_E − g).'],
        wrong: [{ value: 8.2, say: 'That is the leading P/E, on next year’s earnings. On this year’s, multiply the payout by (1 + g).' }, { value: 14.5, say: 'That uses Morrow & Pike’s 9.15% cost of equity. Harbour Street’s beta is 1.25.' }] },
      { id: 'f06-rel-g4-s3', type: 'mc', prompt: 'What does the comparison with the market’s 12.7 suggest?',
        options: ['The market expects Harbour Street’s return on equity to improve, or the shares are dear', 'Harbour Street is cheap, since it trades well below Morrow & Pike', 'The model proves the market price is wrong and will fall to 8.7 times earnings', 'Harbour Street’s cost of equity must be lower than the CAPM says'],
        answer: 0,
        hints: ['Which way is the gap between the market and the model?'],
        feedback: { 1: 'It trades below Morrow & Pike, but above what its own figures justify.', 2: 'A model built on today’s ROE cannot prove the price wrong; it shows what the price must be assuming.', 3: 'That is one possible explanation, but there is no evidence for it here; the simpler reading is about future returns.' } },
    ],
  },
];

export const independent = [
  {
    id: 'f06-rel-i1', type: 'num', kind: 'numerical',
    prompt: 'Penrock Software (fictional) trades at 30 times earnings, and analysts expect its earnings per share to grow 15% a year for the next five years. What is its PEG ratio? Give two decimal places.',
    answer: 2, check: () => 30 / 15, unit: '', places: 2, tol: 0.005,
    wrong: [{ value: 200, say: 'Divide by the growth rate in percent (15), not as a decimal (0.15).' }, { value: 0.5, say: 'That is growth ÷ P/E. PEG is P/E ÷ growth.' }],
    solution: 'PEG = 30 ÷ 15 = 2.00, a little below Harbour Street’s 2.55 and Morrow & Pike’s 2.25. The comparison is crude: it ignores the software company’s different risk and how long its growth may last.',
  },
  {
    id: 'f06-rel-i2', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each measure as an equity multiple (equity value over a shareholders’ figure) or an enterprise value multiple.',
    items: ['Price ÷ earnings per share', 'Enterprise value ÷ EBITDA', 'Market capitalisation ÷ book equity', 'Enterprise value ÷ revenue', 'Price ÷ dividend per share', 'Enterprise value ÷ EBIT'],
    categories: ['Equity multiple', 'Enterprise value multiple'],
    answer: [0, 1, 0, 1, 0, 1],
    feedback: { 0: 'Earnings per share is after interest: the shareholders’ figure.', 3: 'Revenue is earned by the whole business before anyone is paid, so it pairs with enterprise value.', 4: 'Dividends go to shareholders only.' },
    solution: 'Price ÷ EPS, market capitalisation ÷ book equity and price ÷ dividend put an equity value over a shareholders’ figure. EV ÷ EBITDA, EV ÷ revenue and EV ÷ EBIT put the whole business’s value over figures earned before lenders are paid.',
  },
  {
    id: 'f06-rel-i3', type: 'num', kind: 'applied',
    prompt: 'Copperkettle Coffee (fictional, private) made EBIT of $6.5 million in 2027 and has $12 million of debt and $2 million of cash. Its peers trade at 13.67 (Morrow & Pike) and 11.34 (Harbour Street) times EBIT. Using the peers’ average EV/EBIT, what is Copperkettle’s equity worth, in $ millions to one decimal place?',
    answer: 71.3, check: () => 6.5 * (M.m.evEbit + H.m.evEbit) / 2 - 12 + 2, unit: '$m', places: 1, tol: 0.1,
    wrong: [{ value: 81.3, say: 'That is the enterprise value. Subtract net debt of $10 million.' }, { value: 91.3, say: 'That adds the debt. Equity = EV − debt + cash.' }],
    solution: 'Average EV/EBIT (13.67 + 11.34) ÷ 2 = 12.51. Enterprise value 12.51 × 6.5 = $81.3 million; equity 81.3 − 12 + 2 = $71.3 million, close to the $74.1 million from EV/EBITDA.',
  },
  {
    id: 'f06-rel-i4', type: 'num', kind: 'numerical',
    prompt: 'Morrow & Pike (fictional) trades at $28.00. Its 2027 EPS was $1.556 and analysts expect earnings to grow 8% in 2028. What is its forward P/E? Give one decimal place.',
    answer: 16.7, check: () => M.price / (M.eps * 1.08), unit: '×', places: 1, tol: 0.05,
    wrong: [{ value: 18, say: 'That is the trailing P/E, on 2027 earnings. The forward P/E uses the 2028 forecast: 1.556 × 1.08.' }],
    solution: 'Forecast EPS 1.556 × 1.08 = $1.680. Forward P/E 28.00 ÷ 1.680 = 16.7. Compare forward with forward and trailing with trailing: a growing company always looks cheaper on forward earnings.',
  },
  {
    id: 'f06-rel-i5', type: 'mc', kind: 'applied',
    prompt: 'A buyer must price Quarrendon Kitchens (fictional), a private chain of 12 cafés that made a one-off $1.5 million gain last year from selling a freehold, included in its net income of $2.7 million. Which approach is soundest?',
    options: ['Apply peer P/Es to $2.7 million, since it is the reported net income', 'Strip out the gain, then apply peer multiples to the recurring figures', 'Use the highest peer multiple, because the property sale shows the owner’s skill', 'Ignore multiples: a firm with a one-off gain can only be valued by its book value'],
    answer: 1,
    feedback: { 0: 'The freehold sale will not recur; a multiple of it prices a gain the buyer will never see again.', 2: 'A one-off property sale says nothing about how the cafés will earn in future.', 3: 'Multiples still work once the earnings are cleaned of the one-off item.' },
    solution: 'Multiples price recurring earnings. Remove the $1.5 million gain (and its tax), apply the peers’ multiples to the recurring $1.2 million or so of net income, or better to EBITDA or EBIT, which the property sale did not touch.',
  },
];

export const check = [
  {
    id: 'f06-rel-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why do acquirers comparing firms with very different amounts of debt often prefer EV/EBITDA to P/E?',
    options: ['EV/EBITDA is always lower, so it gives a more conservative price', 'P/E cannot be calculated for a company that has any debt', 'EV/EBITDA is not affected by how the firm is financed', 'P/E ignores the tax a company pays on its profits'],
    answer: 2,
    feedback: { 0: 'Being lower is not being more accurate; it is a different ratio with a different base.', 1: 'P/E works for indebted firms, but their interest cost and higher risk distort the comparison.', 3: 'P/E is after tax; EBITDA is the one before tax.' },
    solution: 'Enterprise value includes debt and EBITDA is before interest, so the ratio compares the businesses as if financed alike. P/E depends on interest costs and on how leverage changes the risk of the equity.',
  },
  {
    id: 'f06-rel-k2', type: 'num', kind: 'numerical',
    prompt: 'Morrow & Pike (fictional) earns a return on equity of 12.0% on its book equity, pays out 45% of its earnings and has a cost of equity of 9.15%. What price-to-book does the Gordon model justify? Give two decimal places.',
    answer: 2.10, check: () => (roeM - gM) / (KM - gM), unit: '×', places: 2, tol: 0.02,
    wrong: [{ value: 1.31, say: 'That is ROE ÷ r_E, the value with no growth. With growth, use (ROE − g) ÷ (r_E − g), where g = 0.55 × 12.0%.' }, { value: 2.15, say: 'That is the price-to-book the market pays (1,120 ÷ 520). The question asks what the model justifies.' }],
    solution: 'g = 0.55 × 11.97% = 6.59%. Justified price-to-book = (11.97% − 6.59%) ÷ (9.15% − 6.59%) = 2.10, close to the 2.15 it trades at: Morrow & Pike earns well above its cost of equity, so it is worth more than its book value.',
  },
  {
    id: 'f06-rel-k3', type: 'num', kind: 'numerical',
    prompt: 'Harbour Street Foods (fictional) paid $0.60 a share in dividends in 2027 and trades at $18.00. What is its dividend yield? Give a percentage to two decimal places.',
    answer: 3.33, check: () => H.dps / H.price * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [{ value: 42.48, say: 'That is the payout ratio, dividend ÷ EPS. The yield divides by the price.' }, { value: 30, say: 'That is price ÷ dividend.' }],
    solution: '0.60 ÷ 18.00 = 3.33%, higher than Morrow & Pike’s 2.50%: Harbour Street pays out a similar share of its earnings but its shares are cheaper relative to them.',
  },
  {
    id: 'f06-rel-k4', type: 'mc', kind: 'applied',
    prompt: 'An adviser is choosing listed peers to value a private chain of hotels in seaside towns. Which group is the best starting point?',
    options: ['Listed hotel groups of similar size and mix of owned and leased hotels', 'The largest listed companies in the travel sector, for the liquidity of their shares', 'Listed airlines and cruise lines, which serve the same holidaymakers', 'Every listed company in the country, for the broadest possible average'],
    answer: 0,
    feedback: { 1: 'Size and liquidity matter less than a similar business: the largest travel firms may be online agents or airlines.', 2: 'The same customers do not make the same business: airlines have very different capital needs, costs and risks.', 3: 'A market-wide average mixes software, banks and utilities: it says nothing particular about hotels.' },
    solution: 'Peers should share the business model, growth, risk and size. Hotel groups that own and lease hotels in a similar way are the natural starting point; the adviser then adjusts for the private chain’s smaller size and seaside seasonality.',
  },
  {
    id: 'f06-rel-k5', type: 'num', kind: 'applied',
    prompt: 'A fictional listed bakery chain earned net income of $18 million last year. Its closest peers trade at P/Es of 13.0, 14.5 and 21.0. Using the median, what is the bakery chain’s equity worth, in $ millions?',
    answer: 261, check: () => 14.5 * 18, unit: '$m', places: 0, tol: 0.5,
    wrong: [{ value: 291, say: 'That uses the mean, 16.2, which the 21.0 outlier pulls up. Use the median.' }],
    solution: 'The median P/E is 14.5 (the middle of 13.0, 14.5 and 21.0). Equity = 14.5 × 18 = $261 million. No bridge is needed: a P/E applied to net income values the equity directly. The mean (16.2) would give $291 million, mostly because of one peer.',
  },
  {
    id: 'f06-rel-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Select every situation in which a P/E is a poor basis for valuing a company.',
    options: ['Its earnings are negative this year', 'Last year’s profit includes a large one-off gain', 'It is at the peak of a strong cycle in its industry', 'It pays no dividend but has steady, positive earnings', 'It has the same debt level as its peers'],
    answer: [0, 1, 2],
    feedback: { 3: 'A P/E needs earnings, not dividends: steady positive earnings are fine.', 4: 'Similar debt makes P/Es more comparable, not less.' },
    solution: 'A P/E needs positive, recurring, typical earnings: negative earnings make it meaningless, a one-off gain inflates the denominator, and a cyclical peak makes the company look cheap just before earnings fall. Paying no dividend and having peer-like debt do not matter.',
  },
];
