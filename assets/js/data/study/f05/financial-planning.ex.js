// financial-planning.ex.js — F05 · Financial planning: widgets, practice and the knowledge check (answer keys live here).
// Isbister Outdoor Gear and Sallowfield Garden Centre are the lesson’s fictional examples; every other business here is
// fictional and invented for the exercise.
import * as CF from '../../../core/corpfin.js?v=30';

const money = (v) => `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
const pct = (v, d = 2) => `${(v * 100).toFixed(d)}%`;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const REC = [30000, 35000, 60000, 95000, 110000, 70000], PAY = [52000, 68000, 75000, 70000, 62000, 50000];

export const widgets = {
  'plan-afn': {
    type: 'formula',
    title: 'Additional funds needed: Isbister Outdoor Gear (fictional)',
    intro: 'Sales $2,000,000; current assets $500,000; fixed assets $700,000; payables and accruals $200,000 (10% of sales); equity $600,000.',
    inputs: [
      { id: 'g', label: 'Sales growth next year', min: -10, max: 60, step: 1, value: 25, fmt: 'pct' },
      { id: 'm', label: 'Net profit margin', min: 0, max: 15, step: 0.5, value: 6, fmt: 'pct' },
      { id: 'd', label: 'Payout ratio', min: 0, max: 100, step: 5, value: 40, fmt: 'pct' },
      { id: 'u', label: 'Fixed assets’ use of capacity now', min: 50, max: 100, step: 5, value: 100, fmt: 'pct' },
    ],
    compute: (v) => {
      const S0 = 2000000, CA = 500000, FA = 700000, L = 200000, E = 600000;
      const calc = (gPct) => {
        const g = gPct / 100, S1 = S0 * (1 + g), dS = S1 - S0, full = S0 / (v.u / 100);
        const needFA = Math.max(0, FA * S1 / full - FA), needCA = CA / S0 * dS, spont = L / S0 * dS, ret = v.m / 100 * S1 * (1 - v.d / 100);
        return { S1, dS, full, needFA, needCA, spont, ret, afn: needFA + needCA - spont - ret };
      };
      const r = calc(v.g), b = 1 - v.d / 100, roa = v.m / 100 * S0 / (CA + FA), roe = v.m / 100 * S0 / E;
      const gs = Array.from({ length: 15 }, (_, i) => -10 + i * 5);
      return {
        headline: { label: r.afn >= 0 ? 'Additional funds needed' : 'Surplus (negative AFN)', value: money(Math.abs(r.afn)) },
        rows: [
          ['Sales next year', money(r.S1)],
          ['Sales the fixed assets can support now', money(r.full)],
          ['New fixed assets needed', money(r.needFA)],
          ['Extra current assets', money(r.needCA)],
          ['Less extra payables and accruals', money(r.spont)],
          ['Less earnings retained', money(r.ret)],
          ['Internal | sustainable growth rate', `${pct(CF.internalGrowth(roa, b))} | ${pct(CF.sustainableGrowth(roe, b))}`],
        ],
        note: r.afn > 0 ? `Isbister must raise ${money(r.afn)} from outside: borrow, sell shares, retain more or grow more slowly.`
          : 'Growth at this rate generates more than it needs: Isbister can repay debt, pay out more or hold cash.',
        chart: { kind: 'line', x: { label: 'Sales growth (%)', values: gs }, series: [{ name: 'AFN ($)', values: gs.map((g) => Math.round(calc(g).afn)) }], y: { label: 'Additional funds needed ($)' } },
      };
    },
  },
  'plan-cash': {
    type: 'formula',
    title: 'Cash budget: Sallowfield Garden Centre (fictional)',
    intro: 'January–June receipts $30,000, 35,000, 60,000, 95,000, 110,000, 70,000; payments $52,000, 68,000, 75,000, 70,000, 62,000, 50,000. The line of credit’s limit is $80,000 and the bank wants it repaid by 30 June.',
    inputs: [
      { id: 'short', label: 'Shortfall in March–May receipts', min: 0, max: 40, step: 5, value: 0, fmt: 'pct' },
      { id: 'min', label: 'Minimum cash balance', min: 0, max: 40000, step: 5000, value: 15000, fmt: 'money' },
      { id: 'open', label: 'Cash on 1 January', min: 0, max: 60000, step: 5000, value: 25000, fmt: 'money' },
      { id: 'rate', label: 'Interest on the line, per month', min: 0, max: 2, step: 0.25, value: 1, fmt: 'pct' },
    ],
    compute: (v) => {
      const rec = REC.map((x, i) => (i >= 2 && i <= 4 ? x * (1 - v.short / 100) : x));
      const cb = CF.cashBudget({ opening: v.open, receipts: rec, payments: PAY, minimum: v.min, rate: v.rate / 100 });
      const peakAt = cb.rows.findIndex((r) => r.debt === cb.peakDebt), interest = cb.rows.reduce((s, r) => s + r.interest, 0);
      const problems = [cb.peakDebt > 80000 ? 'the line would exceed its $80,000 limit' : null, cb.endDebt > 0.5 ? `${money(cb.endDebt)} would still be drawn at the end of June` : null].filter(Boolean);
      return {
        headline: { label: 'Peak borrowing on the line', value: cb.peakDebt > 0 ? `${money(cb.peakDebt)} (end of ${MONTHS[peakAt]})` : 'none' },
        rows: [
          ['Interest paid, January–June', money(interest)],
          ['Cash at the end of June', money(cb.endCash)],
          ['Line drawn at the end of June', money(cb.endDebt)],
          ['Months ending with the line drawn', String(cb.rows.filter((r) => r.debt > 0.5).length)],
        ],
        note: problems.length ? `The plan fails the bank’s terms: ${problems.join(' and ')}.` : 'The plan stays within the limit and the line is repaid by June.',
        chart: { kind: 'line', x: { label: 'Month (end)', values: MONTHS }, series: [{ name: 'Cash', values: cb.rows.map((r) => Math.round(r.end)) }, { name: 'Line of credit drawn', values: cb.rows.map((r) => Math.round(r.debt)) }], y: { label: 'Dollars' } },
      };
    },
  },
};

// a cash-budget sheet for the formula item (fictional: Quinta Ceramics, July–December)
const qCells = {
  A1: 'Minimum cash', B1: 10000,
  A3: 'Month', B3: 'Jul', C3: 'Aug', D3: 'Sep', E3: 'Oct', F3: 'Nov', G3: 'Dec',
  A4: 'Opening cash', B4: 18000, C4: '=B9', D4: '=C9', E4: '=D9', F4: '=E9', G4: '=F9',
  A5: 'Receipts', B5: 24000, C5: 26000, D5: 21000, E5: 33000, F5: 61000, G5: 58000,
  A6: 'Payments', B6: 29000, C6: 33000, D6: 30000, E6: 25000, F6: 32000, G6: 57000,
  A7: 'Cash before financing', B7: '=B4+B5-B6', C7: '=C4+C5-C6', D7: '=D4+D5-D6', E7: '=E4+E5-E6', F7: '=F4+F5-F6', G7: '=G4+G5-G6',
  A8: 'New borrowing',
  A9: 'Closing cash', B9: '=B7+B8', C9: '=C7+C8', D9: '=D7+D8', E9: '=E7+E8', F9: '=F7+F8', G9: '=G7+G8',
};

export const guided = [
  {
    id: 'f05-plan-g1', type: 'steps', kind: 'numerical',
    prompt: 'Harlowe Furniture, a fictional maker, had sales of $5,000,000, assets of $3,000,000 (all at full capacity, so all rise with sales), payables and accruals of $500,000, a net profit margin of 5% and a payout ratio of 30%. It forecasts 20% sales growth next year. Use the percent-of-sales method.',
    solution: 'ΔS = 1,000,000. Assets needed = 0.60 × 1,000,000 = 600,000. Spontaneous liabilities = 0.10 × 1,000,000 = 100,000. Retained = 0.05 × 6,000,000 × 0.70 = 210,000. AFN = 600,000 − 100,000 − 210,000 = $290,000.',
    steps: [
      { id: 'f05-plan-g1-s1', type: 'num', prompt: 'How much must assets increase?',
        answer: 600000, check: () => 3000000 / 5000000 * 5000000 * 0.2, unit: '$', places: 0, tol: 1,
        hints: ['Assets are 60% of sales.', 'Sales rise by $1,000,000.'],
        wrong: [{ value: 3600000, say: 'That is next year’s total assets. The question asks for the increase.' }] },
      { id: 'f05-plan-g1-s2', type: 'num', prompt: 'How much will retained earnings add next year?',
        answer: 210000, check: () => 0.05 * 5000000 * 1.2 * (1 - 0.3), unit: '$', places: 0, tol: 1,
        hints: ['Use next year’s sales, $6,000,000.', 'Net income × the retention ratio (1 − 0.30).'],
        wrong: [
          { value: 175000, say: 'That uses this year’s sales. Next year’s profit is earned on $6,000,000.' },
          { value: 90000, say: 'That is the dividend, 30% of net income. Retained earnings are the other 70%.' },
        ] },
      { id: 'f05-plan-g1-s3', type: 'num', prompt: 'What are the additional funds needed?',
        answer: 290000, check: () => 0.6 * 1000000 - 0.1 * 1000000 - 0.05 * 6000000 * 0.7, unit: '$', places: 0, tol: 1,
        hints: ['AFN = increase in assets − increase in spontaneous liabilities − retained earnings.', 'Payables and accruals are 10% of sales.'],
        wrong: [{ value: 390000, say: 'You left out the $100,000 of extra payables and accruals, which finance part of the new assets.' }] },
    ],
  },
  {
    id: 'f05-plan-g2', type: 'num', kind: 'numerical',
    prompt: 'A fictional company earns a return on assets of 9% (net income ÷ end-of-year total assets) and pays out 20% of its net income as dividends. What is its internal growth rate, as a percentage?',
    answer: 7.76, check: () => { const x = 0.09 * 0.8; return x / (1 - x) * 100; }, unit: '%', places: 2, tol: 0.01,
    hints: ['b = 1 − 0.20 = 0.80.', 'IGR = ROA × b ÷ (1 − ROA × b).'],
    wrong: [
      { value: 7.2, say: 'That is ROA × b. Divide by (1 − ROA × b), because assets at the end of the year include those bought with this year’s growth.' },
      { value: 1.83, say: 'You used the payout ratio instead of the retention ratio.' },
    ],
    solution: 'ROA × b = 0.09 × 0.80 = 0.072. IGR = 0.072 ÷ 0.928 = 7.76%.',
  },
  {
    id: 'f05-plan-g3', type: 'formula', kind: 'applied',
    prompt: 'Quinta Ceramics, a fictional pottery, keeps at least the cash in B1. Row 7 shows each month’s cash before any borrowing; row 9 adds the borrowing in row 8. In B8, write a formula for the amount Quinta must borrow that month to bring cash up to the minimum (zero if it is already there), and fill it across to G8.',
    sheet: { cells: qCells },
    cell: 'B8', fill: 'B8:G8', answer: '=MAX(0,$B$1-B7)',
    alt: ['=MAX($B$1-B7,0)', '=IF(B7<$B$1,$B$1-B7,0)'],
    view: 'A1:G9', widths: { A: 22 }, formats: { B: '#,##0', C: '#,##0', D: '#,##0', E: '#,##0', F: '#,##0', G: '#,##0' },
    hints: ['The shortfall is the minimum less the cash before financing.', 'MAX(0, …) stops a surplus showing as negative borrowing; anchor B1 with $ so it stays put when filled.'],
    wrong: [
      { formula: '=$B$1-B7', say: 'In months with a surplus that gives negative borrowing. Wrap it in MAX(0, …).' },
      { formula: '=MAX(0,B1-B7)', say: 'Filled across, B1 becomes C1, D1 … which are empty. Anchor the minimum: $B$1.' },
      { formula: '=MAX(0,B7-$B$1)', say: 'That is the surplus above the minimum, not the shortfall. Subtract the cash from the minimum.' },
    ],
    solution: '<x>=MAX(0,$B$1-B7)</x>, filled to G8. Quinta borrows nothing in July (13,000 before financing), $4,000 in August and $9,000 in September, then nothing as autumn sales arrive. This simple version does not repay the line from later surpluses; a full budget adds a repayment row.',
  },
  {
    id: 'f05-plan-g4', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional bakery’s ovens run only six hours a day, though they could run twelve. Its manager forecasts next year’s funds needed by growing every asset with sales. Which assumption of the percent-of-sales method fails, and what is the effect?',
    options: [
      'Fixed assets needn’t grow while capacity is spare, so the AFN is overstated',
      'Spontaneous liabilities do not rise with sales, so the forecast understates the funds needed',
      'The profit margin cannot stay constant, so the forecast overstates retained earnings',
      'The payout ratio must change when sales grow, so the forecast cannot be used at all',
    ],
    answer: 0,
    hints: ['What can the bakery sell more of without buying another oven?'],
    feedback: {
      1: 'Payables and accruals do still rise with sales; the issue here is the ovens.',
      2: 'With spare capacity the margin, if anything, rises, because fixed costs are spread over more sales. The ovens are the problem.',
      3: 'The payout is the board’s decision; the method holds it constant unless told otherwise.',
    },
    solution: 'The ovens could double output, so sales can grow a long way before new ovens are needed. Growing fixed assets with sales adds equipment the bakery does not need, and the AFN comes out too high.',
  },
];

export const independent = [
  {
    id: 'f05-plan-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional company’s return on equity, on end-of-year equity, is 15%, and it pays out 40% of its net income. What is its sustainable growth rate, as a percentage?',
    answer: 9.89, check: () => { const x = 0.15 * 0.6; return x / (1 - x) * 100; }, unit: '%', places: 2, tol: 0.01,
    wrong: [{ value: 9, say: 'That is ROE × b. Divide by (1 − ROE × b).' }, { value: 6.38, say: 'You used the payout ratio, 0.40, in place of the retention ratio.' }],
    solution: 'ROE × b = 0.15 × 0.60 = 0.09. SGR = 0.09 ÷ 0.91 = 9.89%.',
  },
  {
    id: 'f05-plan-i2', type: 'num', kind: 'numerical',
    prompt: 'Everleigh Bikes, a fictional business, had sales of $800,000. Its current assets are $240,000 and rise with sales; its fixed assets of $400,000 are working at 75% of capacity. Payables and accruals are $80,000 and rise with sales. Its net margin is 8% and it pays out half its profit. If sales grow 30%, what are the additional funds needed?',
    answer: 6400, check: () => { const dS = 240000, s1 = 1040000; const full = 800000 / 0.75; const fa = Math.max(0, 400000 * s1 / full - 400000); return fa + 0.3 * dS - 0.1 * dS - 0.08 * s1 * 0.5; }, unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 126400, say: 'That grows the fixed assets too. At 75% of capacity they can support $1,066,667 of sales, more than next year’s $1,040,000.' },
      { value: 30400, say: 'You left out the $24,000 rise in payables and accruals.' },
    ],
    solution: 'Next year’s sales = 1,040,000; the fixed assets can support 800,000 ÷ 0.75 = 1,066,667, so none are needed. Current assets rise by 0.30 × 240,000 = 72,000; payables by 0.10 × 240,000 = 24,000; retained earnings = 0.08 × 1,040,000 × 0.5 = 41,600. AFN = 72,000 − 24,000 − 41,600 = $6,400.',
  },
  {
    id: 'f05-plan-i3', type: 'classify', kind: 'conceptual',
    prompt: 'In a percent-of-sales forecast, which of these items rise automatically with sales, and which change only when managers decide to raise or repay finance?',
    items: ['Accounts payable to suppliers', 'A five-year bank loan', 'Accrued wages', 'Common stock', 'Income taxes payable', 'Bonds issued last year'],
    categories: ['Rises with sales (spontaneous)', 'Changes only by a financing decision'],
    answer: [0, 1, 0, 1, 0, 1],
    feedback: {
      3: 'Shares are issued or bought back by decision; growth in equity from profit comes through retained earnings, forecast separately.',
      4: 'Taxes payable rise with profit and so, roughly, with sales.',
    },
    solution: 'Payables, accrued wages and taxes payable arise from operating and grow with sales. Loans, bonds and share capital change only when the firm decides to borrow, repay, issue or buy back; that decision is what the AFN is for.',
  },
  {
    id: 'f05-plan-i4', type: 'num', kind: 'numerical',
    prompt: 'A fictional florist starts March with $12,000 of cash and $5,000 drawn on its line of credit, which charges 1% a month on the balance at the start of the month. It expects March receipts of $48,000 and payments of $61,000, and keeps at least $10,000 of cash. How much must it draw on the line at the end of March?',
    answer: 11050, check: () => 10000 - (12000 + 48000 - 61000 - 5000 * 0.01), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 11000, say: 'You left out the $50 of interest on the $5,000 already drawn.' },
      { value: 1050, say: 'That brings cash only to zero. The florist keeps a $10,000 minimum.' },
      { value: 16050, say: 'The $5,000 already drawn stays drawn; it doesn’t need to be borrowed again.' },
    ],
    solution: 'Interest = 1% × 5,000 = 50. Cash before financing = 12,000 + 48,000 − 61,000 − 50 = −1,050. Draw = 10,000 − (−1,050) = $11,050, taking the line to $16,050.',
  },
  {
    id: 'f05-plan-i5', type: 'mc', kind: 'applied',
    prompt: 'A fictional toy wholesaler’s line of credit requires the balance to be zero for 30 consecutive days each year. Its cash budget shows the line drawn in every month of the coming year, peaking before Christmas. What does this tell the owner?',
    options: [
      'The line is funding a permanent need, which calls for longer-term finance',
      'The budget must be wrong, because a line of credit is designed to be drawn all year round',
      'Nothing, provided the peak stays below the limit',
      'The business must be unprofitable, since a profitable one would repay the line from its earnings',
    ],
    answer: 0,
    feedback: {
      1: 'Lines of credit are meant for seasonal needs; the bank’s condition tests exactly that.',
      2: 'The 30-day condition is a covenant: breaking it lets the bank stop lending or demand repayment, whatever the peak.',
      3: 'Profit and cash are different: a profitable firm can need more working capital than a seasonal line provides.',
    },
    solution: 'A balance that never falls to zero means the line is funding something that does not reverse each year: more inventory or receivables than before. That calls for longer-term finance (a term loan or equity) or for releasing working capital, and for raising it with the bank before the covenant is broken.',
  },
  {
    id: 'f05-plan-i6', type: 'formula', kind: 'numerical',
    prompt: 'The sheet holds a fictional firm’s net income, dividends and equity at the end of the year. It issued no shares during the year. In B5, calculate its sustainable growth rate.',
    sheet: { cells: {
      A1: 'Net income ($)', B1: 450000,
      A2: 'Dividends ($)', B2: 150000,
      A3: 'Equity at the end of the year ($)', B3: 2800000,
      A5: 'Sustainable growth rate',
    } },
    cell: 'B5', answer: '=(B1-B2)/(B3-(B1-B2))',
    alt: ['=(B1/B3*(1-B2/B1))/(1-B1/B3*(1-B2/B1))', '=(B1-B2)/(B3-B1+B2)'],
    view: 'A1:B5', widths: { A: 32, B: 14 }, formats: { B1: '#,##0', B2: '#,##0', B3: '#,##0', B5: '0.00%' },
    wrong: [
      { formula: '=(B1-B2)/B3', say: 'That is ROE × b on end-of-year equity. Divide by (1 − ROE × b), or divide the retained earnings by equity at the start of the year.' },
      { formula: '=B1/B3', say: 'That is ROE. Growth uses only the earnings retained.' },
      { formula: '=(B1-B2)/B1', say: 'That is the retention ratio.' },
    ],
    solution: 'Retained = 300,000; equity at the start = 2,800,000 − 300,000 = 2,500,000; SGR = 300,000 ÷ 2,500,000 = 12.00%. The ROE route gives the same: ROE = 16.07%, b = 2/3, ROE × b = 10.71%, ÷ (1 − 0.1071) = 12.00%.',
  },
];

export const check = [
  {
    id: 'f05-plan-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why can a profitable, fast-growing business run short of cash?',
    options: [
      'New stock, receivables and equipment must be paid for before the extra sales are collected',
      'Profitable businesses pay more tax, and tax is always larger than the profit kept in the business',
      'Depreciation on the new equipment uses up cash each year as the equipment wears out',
      'Faster growth always lowers the profit margin, so profit falls as sales rise',
    ],
    answer: 0,
    feedback: {
      1: 'Tax is a share of profit; it cannot exceed the profit.',
      2: 'Depreciation is not a payment: the cash left when the equipment was bought.',
      3: 'Margins may rise or fall with growth; the cash squeeze happens even when they don’t change.',
    },
    solution: 'New assets must be bought before the sales they support turn into cash, and only the retained part of profit pays for them. That gap is the additional funds needed; a monthly cash budget shows when it bites.',
  },
  {
    id: 'f05-plan-k2', type: 'num', kind: 'numerical',
    prompt: 'Greystoke Print, a fictional printer working at full capacity, had sales of $1,500,000 and assets of $1,200,000. Payables and accruals are $150,000. Its net margin is 4% and it pays out a quarter of its profit. If sales grow 15%, what are the additional funds needed?',
    answer: 105750, check: () => CF.afn({ sales0: 1500000, growth: 0.15, assets: 1200000, spontaneous: 150000, margin: 0.04, payout: 0.25 }).afn, unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 112500, say: 'That uses this year’s sales for retained earnings. Next year’s profit is earned on $1,725,000.' },
      { value: 128250, say: 'You left out the $22,500 rise in payables and accruals.' },
      { value: 140250, say: 'That retains only the payout share. Retained earnings are 75% of profit.' },
    ],
    solution: 'ΔS = 225,000. Assets up 0.8 × 225,000 = 180,000; payables up 0.1 × 225,000 = 22,500; retained = 0.04 × 1,725,000 × 0.75 = 51,750. AFN = 180,000 − 22,500 − 51,750 = $105,750.',
  },
  {
    id: 'f05-plan-k3', type: 'num', kind: 'numerical',
    prompt: 'Fallowmere Farm Shop, a fictional business, has a return on end-of-year equity of 24% and pays out 25% of its profit. What is its sustainable growth rate, as a percentage?',
    answer: 21.95, check: () => CF.sustainableGrowth(0.24, 0.75) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [{ value: 18, say: 'That is ROE × b. Divide it by (1 − ROE × b).' }, { value: 6.38, say: 'You used the payout ratio instead of the retention ratio.' }],
    solution: 'ROE × b = 0.24 × 0.75 = 0.18. SGR = 0.18 ÷ 0.82 = 21.95%.',
  },
  {
    id: 'f05-plan-k4', type: 'mc', kind: 'applied',
    prompt: 'A fictional company’s sustainable growth rate is 9%, but its plan calls for 15% growth a year. The owners will not sell shares. Which change would let it finance faster growth?',
    options: [
      'Cut the dividend so that more of each year’s profit is retained',
      'Hold the debt-to-equity ratio lower than it is now',
      'Hold more cash for each dollar of sales as a safety buffer',
      'Stretch the payout ratio towards 100% to keep the owners content',
    ],
    answer: 0,
    feedback: {
      1: 'Less leverage lowers ROE and the SGR; more borrowing against equity would raise it.',
      2: 'More cash per dollar of sales is lower asset turnover, which lowers ROA and ROE, and so the SGR.',
      3: 'A higher payout lowers the retention ratio and the SGR.',
    },
    solution: 'SGR = ROE × b ÷ (1 − ROE × b). It rises with the retention ratio b, and with ROE: a higher margin, a higher asset turnover, or more leverage. Cutting the dividend raises b.',
  },
  {
    id: 'f05-plan-k5', type: 'formula', kind: 'numerical',
    prompt: 'The sheet holds a fictional firm’s forecast inputs. All its assets (B3) and its spontaneous liabilities (B4) rise in proportion to sales. In B8, calculate the additional funds needed.',
    sheet: { cells: {
      A1: 'Sales this year ($)', B1: 3200000,
      A2: 'Sales growth', B2: 0.18,
      A3: 'Assets that rise with sales ($)', B3: 2240000,
      A4: 'Spontaneous liabilities ($)', B4: 320000,
      A5: 'Net profit margin', B5: 0.05,
      A6: 'Payout ratio', B6: 0.35,
      A8: 'Additional funds needed ($)',
    } },
    cell: 'B8', answer: '=(B3-B4)*B2-B5*B1*(1+B2)*(1-B6)',
    alt: ['=B3/B1*B1*B2-B4/B1*B1*B2-B5*B1*(1+B2)*(1-B6)', '=B3*B2-B4*B2-B5*B1*(1+B2)*(1-B6)'],
    view: 'A1:B8', widths: { A: 32, B: 14 }, formats: { B1: '#,##0', B2: '0%', B3: '#,##0', B4: '#,##0', B5: '0.0%', B6: '0%', B8: '#,##0' },
    wrong: [
      { formula: '=(B3-B4)*B2-B5*B1*(1-B6)', say: 'Retained earnings come from next year’s sales: multiply B1 by (1+B2).' },
      { formula: '=B3*B2-B5*B1*(1+B2)*(1-B6)', say: 'Spontaneous liabilities rise with sales too and finance part of the new assets: subtract B4*B2.' },
      { formula: '=(B3-B4)*B2-B5*B1*(1+B2)*B6', say: 'Retained earnings are the share not paid out: (1 − B6), not B6.' },
    ],
    solution: '<x>=(B3-B4)*B2-B5*B1*(1+B2)*(1-B6)</x>: (2,240,000 − 320,000) × 0.18 = 345,600; retained 0.05 × 3,776,000 × 0.65 = 122,720; AFN = $222,880.',
  },
  {
    id: 'f05-plan-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Holding everything else constant, which of these would raise a firm’s sustainable growth rate? Select all that apply.',
    options: [
      'A higher net profit margin',
      'Collecting from customers faster, so that the same sales need fewer assets',
      'Issuing new shares to an investor',
      'Borrowing more for each dollar of equity',
      'Raising the payout ratio',
    ],
    answer: [0, 1, 3],
    feedback: {
      2: 'New shares let the firm grow faster than its SGR, but the SGR itself assumes no new shares; it is set by ROE and retention.',
      4: 'A higher payout lowers retention, and with it the SGR.',
    },
    solution: 'SGR depends on ROE (margin × asset turnover × equity multiplier) and the retention ratio. A higher margin, higher turnover and more leverage raise ROE; a higher payout lowers retention. Issuing shares is the way round the SGR, not a change to it.',
  },
];
