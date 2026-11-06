// payout-policy.ex.js — F05 · Payout policy: widgets, practice and the knowledge check (answer keys live here).
// Marisco Tea Company is the lesson’s fictional example; every other business here is fictional and invented for the
// exercise. Survey figures are Brav, Graham, Harvey & Michaely (2003), as cited in the lesson.
import * as CF from '../../../core/corpfin.js?v=28';

const money = (v) => `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
const money2 = (v) => `${v < 0 ? '−' : ''}$${Math.abs(v).toFixed(2)}`;
const r3 = (v) => Math.round(v * 1000) / 1000;
// a fictional firm’s earnings per share over ten years, with a bad year 4 and a dip in year 8
const EPS = [2.50, 2.80, 3.10, 2.40, 3.00, 3.40, 3.60, 3.20, 3.90, 4.20];

export const widgets = {
  'pay-compare': {
    type: 'formula',
    title: 'Dividend or buyback: Marisco Tea Company (fictional)',
    intro: '1,000,000 shares at $40 and earnings of $6,000,000 a year, part of which is the return on the cash. The buyback is at the market price.',
    inputs: [
      { id: 'cash', label: 'Cash paid out', min: 0, max: 10000000, step: 500000, value: 4000000, fmt: 'money' },
      { id: 'ret', label: 'After-tax return the cash was earning', min: 0, max: 20, step: 0.5, value: 3, fmt: 'pct' },
    ],
    compute: (v) => {
      const p = CF.payout({ shares: 1000000, price: 40, amount: v.cash, earnings: 6000000, lostIncome: v.cash * v.ret / 100 });
      const pe = (price, eps) => (eps > 0 ? (price / eps).toFixed(2) : 'not meaningful');
      return {
        headline: { label: 'Wealth per original share, dividend | buyback', value: `${money2(p.dividend.wealth)} | ${money2(p.buyback.wealth)}` },
        rows: [
          ['Dividend per share', money2(p.dividend.perShare)],
          ['Share price after the dividend', money2(p.dividend.priceAfter)],
          ['Shares bought back', Math.round(p.buyback.sharesBought).toLocaleString('en-US')],
          ['Share price after the buyback', money2(p.buyback.priceAfter)],
          ['EPS before | after dividend | after buyback', `${money2(p.epsBefore)} | ${money2(p.dividend.eps)} | ${money2(p.buyback.eps)}`],
          ['P/E before | after dividend | after buyback', `${pe(40, p.epsBefore)} | ${pe(p.dividend.priceAfter, p.dividend.eps)} | ${pe(p.buyback.priceAfter, p.buyback.eps)}`],
        ],
        note: v.cash === 0 ? 'No payout: nothing changes.'
          : `Shareholders are equally wealthy either way. ${p.buyback.eps > p.epsBefore + 1e-9 ? `The buyback raises EPS because the cash earned ${v.ret}% after tax, less than the 15% earnings yield of the shares bought; the P/E falls to match, and the price stays at $40.` : p.buyback.eps < p.epsBefore - 1e-9 ? 'The cash earned more than the shares’ 15% earnings yield, so buying shares with it lowers EPS, and still the price stays at $40.' : 'The cash earned exactly the shares’ 15% earnings yield, so the buyback leaves EPS unchanged.'}`,
        chart: { kind: 'bar', x: { label: 'Earnings per share', values: ['Before', 'Dividend', 'Buyback'] }, series: [{ name: 'EPS ($)', values: [p.epsBefore, p.dividend.eps, p.buyback.eps].map(r3) }], y: { label: 'EPS ($)' } },
      };
    },
  },
  'pay-smooth': {
    type: 'formula',
    title: 'Smoothing dividends: D_t = D_{t−1} + a(p × EPS_t − D_{t−1})',
    intro: 'A fictional firm’s EPS over ten years: $2.50, 2.80, 3.10, 2.40, 3.00, 3.40, 3.60, 3.20, 3.90, 4.20. Last year’s dividend was the starting value below.',
    inputs: [
      { id: 'p', label: 'Target payout ratio p', min: 0, max: 100, step: 5, value: 40, fmt: 'pct' },
      { id: 'a', label: 'Speed of adjustment a', min: 0, max: 1, step: 0.05, value: 0.3, fmt: 'num' },
      { id: 'd0', label: 'Dividend last year', min: 0, max: 3, step: 0.1, value: 0.9, fmt: 'money' },
    ],
    compute: (v) => {
      const p = v.p / 100;
      let d = v.d0, cuts = 0, worst = 0;
      const divs = EPS.map((e) => { const n = d + v.a * (p * e - d); if (n < d - 1e-9) { cuts += 1; worst = Math.max(worst, d - n); } d = n; return n; });
      return {
        headline: { label: 'Dividend in year 10', value: money2(divs[9]) },
        rows: [
          ['Target dividend in year 10 (p × EPS)', money2(p * EPS[9])],
          ['Years with a dividend cut', String(cuts)],
          ['Largest one-year cut', cuts ? money2(worst) : 'none'],
        ],
        note: v.a === 0 ? 'With a = 0 the dividend never changes, whatever happens to earnings.'
          : v.a === 1 ? 'With a = 1 the dividend is the target payout of each year’s earnings, so it falls whenever earnings fall.'
            : `The dividend closes ${Math.round(v.a * 100)}% of the gap to the target each year, so it lags earnings on the way up and falls by less (if at all) when earnings dip.`,
        chart: { kind: 'line', x: { label: 'Year', values: EPS.map((_, i) => i + 1) },
          series: [{ name: 'Target dividend (p × EPS)', values: EPS.map((e) => r3(p * e)) }, { name: 'Dividend paid', values: divs.map(r3) }],
          y: { label: 'Dollars a share' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f05-pay-g1', type: 'steps', kind: 'numerical',
    prompt: 'Glaston Breweries, a fictional listed company, has 2,000,000 shares at $25 and $5,000,000 of surplus cash. It earns $8,000,000 a year, including $150,000 of after-tax interest on that cash. Assume a perfect market.',
    solution: 'Dividend: $5,000,000 ÷ 2,000,000 = $2.50 a share, so the price falls to 25 − 2.50 = $22.50. Buyback: 5,000,000 ÷ 25 = 200,000 shares, leaving 1,800,000 at $25. EPS after the buyback = (8,000,000 − 150,000) ÷ 1,800,000 = $4.36, against $4.00 before; the price does not change.',
    steps: [
      { id: 'f05-pay-g1-s1', type: 'num', prompt: 'If Glaston pays the cash as a dividend, what is the share price when the shares go ex-dividend?',
        answer: 22.5, check: () => 25 - 5000000 / 2000000, unit: '$', places: 2, tol: 0.005,
        hints: ['The dividend per share is the cash divided by the shares.', 'The price falls by the dividend: 25 − 2.50.'],
        wrong: [{ value: 25, say: 'The cash leaves the company, so each share is worth less by the dividend it no longer carries.' }] },
      { id: 'f05-pay-g1-s2', type: 'num', prompt: 'If instead Glaston buys back shares at $25, how many does it buy?',
        answer: 200000, check: () => 5000000 / 25, unit: 'shares', places: 0, tol: 0.5,
        hints: ['Cash ÷ price per share.'] },
      { id: 'f05-pay-g1-s3', type: 'num', prompt: 'What is EPS after the buyback?',
        answer: 4.36, check: () => (8000000 - 150000) / (2000000 - 200000), unit: '$', places: 2, tol: 0.005,
        hints: ['Earnings lose the interest the cash was earning.', 'Divide by the 1,800,000 shares left.'],
        wrong: [
          { value: 4.44, say: 'You kept the $150,000 of interest. Once the cash is spent it earns nothing.' },
          { value: 3.93, say: 'That divides by the original 2,000,000 shares: the EPS after a dividend, not a buyback.' },
        ] },
    ],
  },
  {
    id: 'f05-pay-g2', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the description of a US cash dividend’s timetable.',
    text: 'The board announces the amount on the [[0]]. Anyone who buys the shares on or after the [[1]] does not receive the dividend. The shareholders on the register at the end of the [[2]] are the ones paid, and the cash goes to them on the [[3]].',
    blanks: [
      { options: ['declaration date', 'ex-dividend date', 'date of record', 'payment date'], answer: 0 },
      { options: ['declaration date', 'ex-dividend date', 'date of record', 'payment date'], answer: 1 },
      { options: ['declaration date', 'ex-dividend date', 'date of record', 'payment date'], answer: 2 },
      { options: ['declaration date', 'ex-dividend date', 'date of record', 'payment date'], answer: 3 },
    ],
    hints: ['The date of record decides who is paid; the ex-dividend date is the buyers’ cut-off.', 'With one-day settlement, the ex-dividend date is usually the same day as the record date.'],
    solution: 'Declaration date (announced, liability recorded); ex-dividend date (buyers from this day don’t get it); date of record (the register that day decides); payment date (the cash is paid).',
  },
  {
    id: 'f05-pay-g3', type: 'num', kind: 'numerical',
    prompt: 'A fictional firm paid a dividend of $1.00 a share last year. This year its EPS is $3.00. Its target payout ratio is 50% and it closes 40% of the gap between the target and last year’s dividend each year. What dividend does the partial-adjustment rule give this year?',
    answer: 1.2, check: () => 1.00 + 0.4 * (0.5 * 3.00 - 1.00), unit: '$', places: 2, tol: 0.005,
    hints: ['Target = p × EPS = $1.50.', 'D = 1.00 + 0.4 × (1.50 − 1.00).'],
    wrong: [
      { value: 1.5, say: 'That is the target, p × EPS. The firm moves only 40% of the way towards it.' },
      { value: 0.6, say: 'That is 40% of the target. The rule adds 40% of the gap to last year’s dividend.' },
      { value: 1.6, say: 'That adds 40% of the whole target to last year’s dividend. Add 40% of the gap: 0.4 × (1.50 − 1.00).' },
    ],
    solution: 'Target = 0.5 × 3.00 = $1.50. Gap = 1.50 − 1.00 = 0.50. D = 1.00 + 0.4 × 0.50 = $1.20.',
  },
  {
    id: 'f05-pay-g4', type: 'mc', kind: 'applied',
    prompt: 'Loxley Media (fictional) pays no dividend but has just bought back shares at their fair price of $30. A retired shareholder with 2,000 shares wanted $3,000 of income this year. In a perfect market, what can she do, and how does she end up compared with a $1.50 dividend?',
    options: [
      'Sell 100 shares for $3,000; she then has $3,000 of cash and 1,900 shares, as wealthy as with the dividend',
      'Nothing: without a dividend she must wait until the company decides to pay one',
      'Sell 100 shares for $3,000, but she ends up poorer than with the dividend, because she now owns fewer shares',
      'Borrow $3,000 against her shares, since selling shares would lose part of her investment',
    ],
    answer: 0,
    hints: ['A homemade dividend replaces the company’s.', 'With a $1.50 dividend the shares would trade at $28.50.'],
    feedback: {
      1: 'She can create her own dividend by selling shares.',
      2: 'With a dividend her 2,000 shares would be worth $28.50 each: 57,000 + 3,000 = $60,000. Selling 100 at $30 leaves 1,900 × 30 = 57,000 + 3,000 = $60,000. Fewer shares, same wealth.',
      3: 'Borrowing works but costs interest; selling shares is not a loss, because each share sold is worth its price.',
    },
    solution: 'A homemade dividend: 3,000 ÷ 30 = 100 shares sold. Wealth = 1,900 × $30 + $3,000 = $60,000, the same as 2,000 × $28.50 + $3,000 with a $1.50 dividend. In practice the difference is tax (she pays only on her gain on the 100 shares) and dealing costs.',
  },
];

export const independent = [
  {
    id: 'f05-pay-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional listed firm reports EPS of $2.25 and pays dividends of $0.90 a share. What is its retention ratio, as a percentage?',
    answer: 60, check: () => (1 - 0.90 / 2.25) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 40, say: 'That is the payout ratio, 0.90 ÷ 2.25. Retention is what is kept: 1 minus the payout ratio.' }, { value: 250, say: 'That is EPS ÷ DPS. The retention ratio is the share of earnings not paid out.' }],
    solution: 'Payout ratio = 0.90 ÷ 2.25 = 40%. Retention ratio = 1 − 0.40 = 60%.',
  },
  {
    id: 'f05-pay-i2', type: 'num', kind: 'numerical',
    prompt: 'An investor owns 500 shares of a fictional company, bought at $18 each; they now trade at $50. She pays 20% tax on both dividends and capital gains (an assumed rate). The company can pay a $2 dividend, or buy back shares at $50, in which case she would sell enough shares to raise the same $1,000. How much tax does she pay if she sells shares?',
    answer: 128, check: () => (1000 / 50) * (50 - 18) * 0.20, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 200, say: 'That is the tax on the dividend, 20% of $1,000. On a sale only the gain over what she paid is taxed.' },
      { value: 72, say: 'That is the tax she saves compared with the dividend. The question asks for the tax on the sale.' },
      { value: 640, say: 'That is the gain itself. Tax is 20% of it.' },
    ],
    solution: 'Shares sold = 1,000 ÷ 50 = 20. Gain = 20 × (50 − 18) = $640. Tax = 20% × 640 = $128, against $200 on a dividend. If she did not need the cash she would pay nothing now.',
  },
  {
    id: 'f05-pay-i3', type: 'formula', kind: 'numerical',
    prompt: 'The sheet holds a fictional company’s earnings, shares, share price, the cash it will spend on a buyback, and the after-tax return that cash now earns. In B7, calculate EPS after the buyback, assuming the shares are bought at the price in B3.',
    sheet: { cells: {
      A1: 'Earnings this year ($)', B1: 9000000,
      A2: 'Shares outstanding', B2: 3000000,
      A3: 'Share price ($)', B3: 45,
      A4: 'Cash spent on the buyback ($)', B4: 6000000,
      A5: 'After-tax return on that cash', B5: 0.03,
      A7: 'EPS after the buyback ($)',
    } },
    cell: 'B7', answer: '=(B1-B4*B5)/(B2-B4/B3)',
    alt: ['=(B1-B5*B4)/(B2-B4/B3)', '=(B1-B4*B5)/(B2-(B4/B3))'],
    view: 'A1:B7', widths: { A: 30, B: 14 }, formats: { B1: '#,##0', B2: '#,##0', B3: '$#,##0.00', B4: '#,##0', B5: '0.0%', B7: '$#,##0.00' },
    wrong: [
      { formula: '=B1/(B2-B4/B3)', say: 'The earnings fall too: once the cash is spent it no longer earns B5. Subtract B4*B5.' },
      { formula: '=(B1-B4*B5)/B2', say: 'That divides by the shares before the buyback: it is EPS after a dividend. The buyback retires B4/B3 shares.' },
      { formula: '=(B1-B4*B5)/(B2-B4*B3)', say: 'The number of shares bought is the cash divided by the price, not multiplied.' },
    ],
    solution: '<x>=(B1-B4*B5)/(B2-B4/B3)</x>: earnings 9,000,000 − 180,000 = 8,820,000; shares 3,000,000 − 133,333 = 2,866,667; EPS = $3.08, up from $3.00. The price is unchanged at a fair-price buyback, so the P/E falls from 15.0 to about 14.6.',
  },
  {
    id: 'f05-pay-i4', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional company whose shares trade at $150 announces a three-for-one stock split. Nothing else changes. Which statement is correct?',
    options: [
      'A shareholder will hold three times as many shares at about $50; wealth is unchanged',
      'The split pays shareholders $100 a share in new shares, which is taxed like a dividend',
      'The share price will stay near $150, because the company has signalled confidence by splitting',
      'Earnings per share will stay the same, since earnings are unaffected by the split',
    ],
    answer: 0,
    feedback: {
      1: 'No cash or value moves: the company is cut into more, smaller slices.',
      2: 'The price must fall to about a third: three shares at $150 would be three times the value for the same company.',
      3: 'Earnings are the same, but they are spread over three times as many shares, so EPS falls to a third.',
    },
    solution: 'A three-for-one split triples the shares and divides the price (and EPS and DPS) by three. Each shareholder keeps the same fraction of the same company.',
  },
  {
    id: 'f05-pay-i5', type: 'multi', kind: 'conceptual',
    prompt: 'A fictional mining company’s cash flows swing widely with metal prices, and this year it has a large surplus. Which are sound reasons to return the surplus by a buyback rather than by raising its regular dividend? Select all that apply.',
    options: [
      'A buyback can be slowed or stopped next year without the bad news a dividend cut would send',
      'Shareholders who do not sell pay no tax on it now',
      'The buyback will raise EPS, and so the share price',
      'Raising the regular dividend would suggest the higher cash flow is permanent',
      'A buyback commits the managers to paying out the same amount every year',
    ],
    answer: [0, 1, 3],
    feedback: {
      2: 'EPS rises mechanically, but at a fair price the P/E falls to match: the share price is unchanged.',
      4: 'That describes a regular dividend, not a buyback. A buyback’s attraction is that it does not commit the firm.',
    },
    solution: 'Flexibility, tax deferral and avoiding a misleading signal favour the buyback (or a special dividend). The EPS effect is not value, and the commitment is a property of regular dividends.',
  },
  {
    id: 'f05-pay-i6', type: 'order', kind: 'conceptual',
    prompt: 'Put these steps in a US cash dividend in time order.',
    items: [
      'The board declares the dividend and the company records a liability',
      'The last trading day on which a buyer still receives the dividend',
      'The shares start to trade without the dividend; the register at the end of this day decides who is paid',
      'The company pays the cash to the shareholders of record',
    ],
    solution: 'Declaration; last day to buy with the dividend; ex-dividend date, which with one-day settlement is usually also the record date; payment.',
  },
];

export const check = [
  {
    id: 'f05-pay-k1', type: 'mc', kind: 'conceptual',
    prompt: 'In a perfect market, a company with surplus cash can pay it as a dividend or use it to buy back shares at their fair price. Which is true?',
    options: [
      'Shareholders’ total wealth is the same either way; only the form they hold it in differs',
      'The buyback makes the remaining shareholders richer, because EPS rises',
      'The dividend makes shareholders richer, because they receive cash they did not have before',
      'The buyback makes shareholders poorer, because the company now owns fewer assets per share',
    ],
    answer: 0,
    feedback: {
      1: 'EPS rises, but the P/E falls by the same proportion, because the company has spent its safest asset.',
      2: 'The cash was already theirs inside the company; the share price falls by the dividend.',
      3: 'Assets fall, but so do the shares, in the same proportion when the price is fair.',
    },
    solution: 'The cash belongs to the shareholders whether it is inside or outside the company. After a dividend they hold cheaper shares and cash; after a buyback, those who sold hold cash and the rest hold the same-priced shares. Wealth is equal, and investors can switch between the two by selling or reinvesting.',
  },
  {
    id: 'f05-pay-k2', type: 'num', kind: 'numerical',
    prompt: 'Shares of a fictional retailer close at $54.00 on the day before they go ex-dividend for a declared dividend of $0.85. With no taxes and no other news, at what price would you expect them to open on the ex-dividend date?',
    answer: 53.15, check: () => 54.00 - 0.85, unit: '$', places: 2, tol: 0.005,
    wrong: [{ value: 54, say: 'From the ex-dividend date a buyer no longer gets the $0.85, so she pays that much less.' }, { value: 54.85, say: 'The price falls, not rises: the dividend leaves the company.' }],
    solution: 'P_ex = P_cum − DPS = 54.00 − 0.85 = $53.15. In practice taxes and the day’s news make the drop differ a little.',
  },
  {
    id: 'f05-pay-k3', type: 'num', kind: 'numerical',
    prompt: 'A fictional company has 5,000,000 shares at $32 and earnings of $20,000,000, including $240,000 of after-tax interest on $8,000,000 of surplus cash. It spends the $8,000,000 buying back shares at $32. What is EPS after the buyback?',
    answer: 4.16, check: () => (20000000 - 240000) / (5000000 - 8000000 / 32), unit: '$', places: 2, tol: 0.005,
    wrong: [
      { value: 4.21, say: 'The interest on the cash is lost once the cash is spent: earnings fall to $19,760,000.' },
      { value: 3.95, say: 'That divides by 5,000,000 shares; the buyback retires 250,000 of them.' },
    ],
    solution: 'Shares bought = 8,000,000 ÷ 32 = 250,000; left 4,750,000. Earnings = 20,000,000 − 240,000 = 19,760,000. EPS = 19,760,000 ÷ 4,750,000 = $4.16, up from $4.00, with the price unchanged at $32.',
  },
  {
    id: 'f05-pay-k4', type: 'mc', kind: 'applied',
    prompt: 'Maddox Pharmacy (fictional) pays $1.00 a share, 40% of its usual EPS of $2.50. A rival has closed and Maddox’s managers now expect EPS of about $3.50 for the foreseeable future. Managers who behave as the survey evidence describes would most likely:',
    options: [
      'raise it part of the way to $1.40 now, and further if the higher earnings last',
      'raise the dividend to $1.40 at once, because the target payout ratio is 40%',
      'keep the dividend at $1.00 and pay out the extra earnings as a special dividend every year',
      'cut the dividend to fund a buyback, because buybacks raise earnings per share',
    ],
    answer: 0,
    feedback: {
      1: 'Going straight to the target risks a cut if the earnings gain proves temporary; managers avoid that.',
      2: 'A special dividend every year would become an expected payment; a lasting rise in earnings is what regular dividends are for, gradually.',
      3: 'Managers cut dividends only as a last resort, and the EPS effect of a buyback is not value.',
    },
    solution: 'Dividends are smoothed: managers move part of the way to the target (p × EPS = 0.4 × 3.50 = $1.40) each year, so the dividend follows lasting changes in earnings with a lag and is rarely cut.',
  },
  {
    id: 'f05-pay-k5', type: 'formula', kind: 'numerical',
    prompt: 'The sheet holds last year’s dividend per share, this year’s EPS, a target payout ratio and a speed of adjustment. In B6, calculate this year’s dividend under the partial-adjustment rule.',
    sheet: { cells: {
      A1: 'Dividend last year ($)', B1: 1.6,
      A2: 'EPS this year ($)', B2: 5.2,
      A3: 'Target payout ratio', B3: 0.45,
      A4: 'Speed of adjustment', B4: 0.35,
      A6: 'Dividend this year ($)',
    } },
    cell: 'B6', answer: '=B1+B4*(B3*B2-B1)',
    alt: ['=B1+B4*(B2*B3-B1)', '=B4*B3*B2+(1-B4)*B1', '=(1-B4)*B1+B4*B3*B2'],
    view: 'A1:B6', widths: { A: 26, B: 12 }, formats: { B1: '$#,##0.00', B2: '$#,##0.00', B3: '0%', B4: '0.00', B6: '$#,##0.000' },
    wrong: [
      { formula: '=B3*B2', say: 'That is the target dividend. The rule moves only part of the way, B4, from last year’s dividend towards it.' },
      { formula: '=B1+B4*B3*B2', say: 'Add a fraction of the gap (target − last year), not of the whole target.' },
      { formula: '=B1+B3*(B4*B2-B1)', say: 'The payout ratio and the speed are swapped: the target is B3*B2, and B4 is the share of the gap closed.' },
    ],
    solution: '<x>=B1+B4*(B3*B2-B1)</x>: target 0.45 × 5.20 = 2.34; gap 0.74; dividend 1.60 + 0.35 × 0.74 = $1.859.',
  },
  {
    id: 'f05-pay-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these did Brav, Graham, Harvey and Michaely’s survey of financial executives (2003) report? Select all that apply.',
    options: [
      'Most dividend payers try to avoid cutting dividends.',
      'Most managers agreed that they pay dividends to show they can bear costly payments.',
      'The most popular reason for buybacks was buying when the shares were a good value.',
      'Personal taxes were the main factor in most firms’ dividend decisions.',
      'Most firms that paid no dividend said they never planned to start.',
    ],
    answer: [0, 2, 4],
    feedback: {
      1: 'Only 4.2% agreed with that, although about four-fifths thought dividend decisions convey information.',
      3: 'Taxes were second-order: 21.4% of dividend payers called them important.',
    },
    solution: '94% avoid cuts; 86.6% repurchase when the stock is a good value; 70% of non-payers never plan to pay. The costly-signal reason found almost no support, and taxes ranked low.',
  },
];
