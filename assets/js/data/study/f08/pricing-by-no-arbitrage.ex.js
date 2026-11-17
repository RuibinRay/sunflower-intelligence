// pricing-by-no-arbitrage.ex.js — F08 · Pricing by no arbitrage: widgets, practice and the knowledge check.
// Figures from case.js (EURO, COFFEE, DERIVED); every num item's `check` recomputes its answer.
import { EURO as E, COFFEE as K, DERIVED as D } from './case.js?v=40';
import { forwardPrice, fxForward, forwardValue } from '../../../core/derivatives.js?v=40';

const usd = (x, d = 0) => `${x < 0 ? '−' : ''}$${Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;

export const widgets = {
  'na-fx': {
    type: 'formula', title: 'Interest-rate parity: the euro forward',
    intro: 'Spot $1.0800 a euro; Coastline quotes $1.0920 for six months on €38,000.',
    inputs: [
      { id: 'rd', label: 'Dollar interest rate', min: 0, max: 10, step: 0.25, value: 4.5, fmt: 'pct' },
      { id: 'rf', label: 'Euro interest rate', min: 0, max: 10, step: 0.25, value: 2.5, fmt: 'pct' },
      { id: 'm', label: 'Months to delivery', min: 1, max: 24, step: 1, value: 6, fmt: 'int' },
    ],
    compute: (v) => {
      const F = fxForward({ spot: E.spot, rDomestic: v.rd / 100, rForeign: v.rf / 100, T: v.m / 12 });
      const ms = Array.from({ length: 25 }, (_, i) => i);
      return {
        headline: { label: `Forward rate for ${v.m} month${v.m === 1 ? '' : 's'}`, value: `$${F.toFixed(4)}` },
        rows: [['Forward premium (discount) on the euro', `${F >= E.spot ? '+' : '−'}${Math.abs(F - E.spot).toFixed(4)}`], ['€38,000 at the forward rate', usd(F * E.amount, 2)], ['€38,000 at today’s spot', usd(E.spot * E.amount, 2)], ['Coastline’s quote less parity (6 months only)', v.m === 6 ? usd((D.euroBank - F) * E.amount, 2) : '—']],
        note: v.rd > v.rf ? 'Dollar rates are higher, so the euro trades at a forward premium: holding euros gives up interest, and the forward rate makes up for it.' : v.rd < v.rf ? 'Euro rates are higher, so the euro trades at a forward discount.' : 'Equal rates: the forward rate equals spot.',
        chart: { kind: 'line', x: { label: 'Months to delivery', values: ms },
          series: [{ name: 'Forward rate', values: ms.map((t) => Math.round(fxForward({ spot: E.spot, rDomestic: v.rd / 100, rForeign: v.rf / 100, T: t / 12 }) * 1e4) / 1e4) }, { name: 'Spot today', values: ms.map(() => E.spot) }],
          y: { label: '$ a euro', format: 'num' } },
      };
    },
  },
  'na-carry': {
    type: 'formula', title: 'Cost of carry and arbitrage in coffee',
    intro: 'Standard-grade green coffee (fictional exchange), one contract of 5,000 kg.',
    inputs: [
      { id: 'S', label: 'Spot price ($ a kg)', min: 4, max: 9, step: 0.05, value: 6.4, fmt: 'num' },
      { id: 'U', label: 'Storage and insurance, present value ($ a kg)', min: 0, max: 0.4, step: 0.01, value: 0.08, fmt: 'num' },
      { id: 'r', label: 'Interest rate', min: 0, max: 10, step: 0.25, value: 4.5, fmt: 'pct' },
      { id: 'm', label: 'Months to delivery', min: 1, max: 18, step: 1, value: 6, fmt: 'int' },
      { id: 'F', label: 'Market forward price ($ a kg)', min: 4, max: 10, step: 0.05, value: 6.8, fmt: 'num' },
    ],
    compute: (v) => {
      const F0 = forwardPrice({ S: v.S, r: v.r / 100, T: v.m / 12, storage: v.U });
      const gap = v.F - F0, profit = gap * K.futures.size;
      return {
        headline: { label: 'No-arbitrage forward price', value: `$${F0.toFixed(4)} a kg` },
        rows: [['Market price less no-arbitrage price', `${gap >= 0 ? '+' : '−'}$${Math.abs(gap).toFixed(4)} a kg`], ['Arbitrage profit on one contract', usd(Math.abs(profit), 2)], ['Trade', Math.abs(gap) < 0.00005 ? 'None: the prices agree' : gap > 0 ? 'Cash-and-carry: borrow, buy spot, store, sell forward' : 'Reverse: sell coffee spot, invest, buy forward']],
        note: gap < 0 ? 'A reverse cash-and-carry needs someone willing to sell physical coffee and buy it back forward. Roasters who need coffee to work may not, so the price can stay below carry (convenience yield).' : 'Every trader who can borrow and store can do this trade, so a forward above carry does not last.',
      };
    },
  },
};

export const guided = [
  {
    id: 'f08-na-g1', type: 'num', kind: 'numerical',
    prompt: 'A share that pays no dividends trades at $80. The interest rate is 5% a year (annual compounding). What is its one-year forward price ($)?',
    answer: 84, check: () => forwardPrice({ S: 80, r: 0.05, T: 1 }), unit: '$', places: 2, tol: 0.01,
    hints: ['F = S(1 + r)<sup>T</sup>.', '80 × 1.05.'],
    solution: '80 × 1.05 = $84.00: the cost of buying today and carrying the share for a year.',
  },
  {
    id: 'f08-na-g2', type: 'steps', kind: 'numerical',
    prompt: 'Spot is $1.2700 a pound. The dollar rate is 4.5% and the pound rate 5.0% a year (annual). Price a one-year forward.',
    steps: [
      { id: 'f08-na-g2a', type: 'num', kind: 'numerical', prompt: 'What is the forward rate ($ a pound, 4 decimals)?', answer: 1.2640, check: () => fxForward({ spot: 1.27, rDomestic: 0.045, rForeign: 0.05, T: 1 }), unit: '', places: 4, tol: 0.0001, hints: ['F = S × (1 + r<sub>$</sub>) ÷ (1 + r<sub>£</sub>).', '1.27 × 1.045 ÷ 1.05.'] },
      { id: 'f08-na-g2b', type: 'mc', kind: 'conceptual', prompt: 'Does the pound trade at a forward premium or a discount to the dollar?', options: ['A discount: pound rates are higher', 'A premium: pound rates are higher', 'Neither: forwards always equal spot', 'A premium: the market expects the pound to rise'], answer: 0, feedback: { 1: 'Higher rates give a forward discount: the forward makes up for the extra interest the pound earns.', 2: 'Only when the rates are equal.', 3: 'Forward rates come from interest rates, not forecasts.' }, hints: ['Which currency earns more interest while held?'] },
    ],
    solution: '1.2700 × 1.045 ÷ 1.05 = $1.2640. The pound earns more interest, so its forward rate is lower than spot: a forward discount.',
  },
  {
    id: 'f08-na-g3', type: 'num', kind: 'numerical',
    prompt: 'Gold trades at $2,400 an ounce. Storage and insurance for a year cost $12 an ounce in present value. The rate is 4% a year. What is the one-year forward price ($)?',
    answer: 2508.48, check: () => forwardPrice({ S: 2400, r: 0.04, T: 1, storage: 12 }), unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: 2496, say: 'Storage is a cost of carry: add its present value to the spot price before growing it.' }],
    hints: ['F = (S + U)(1 + r)<sup>T</sup>.', '(2,400 + 12) × 1.04.'],
    solution: '(2,400 + 12) × 1.04 = $2,508.48.',
  },
  {
    id: 'f08-na-g4', type: 'mc', kind: 'applied',
    prompt: 'A share trades at $50, pays no dividend, and the rate is 4%. Its one-year forward trades at $53. What riskless trade is available?',
    options: ['Borrow $50, buy the share and sell it forward at $53', 'Sell the share short, invest $50 and buy it forward at $53', 'Buy the forward and wait for the share to rise', 'There is no arbitrage, because $53 is close to $52'],
    answer: 0,
    feedback: { 1: 'That trade profits when the forward is too low; here it is too high.', 2: 'That is a bet, not an arbitrage.', 3: 'A dollar a share is a riskless profit; arbitrageurs will take it.' },
    hints: ['The no-arbitrage price is 50 × 1.04 = 52. Is $53 too high or too low?'],
    solution: 'The forward is $1 above 52, so sell it and carry the share: borrow 50, buy, deliver at 53 and repay 52, keeping $1 a share.',
  },
];

export const independent = [
  {
    id: 'f08-na-i1', type: 'num', kind: 'numerical',
    prompt: 'A share trades at $60 and will pay a $1.50 dividend in six months. The rate is 4% a year. What is its one-year forward price ($)?',
    answer: 60.87, check: () => forwardPrice({ S: 60, r: 0.04, T: 1, income: 1.5 / 1.04 ** 0.5 }), unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: 62.4, say: 'The dividend goes to whoever holds the share, so subtract its present value before growing.' }],
    solution: 'PV of dividend: 1.50 ÷ 1.04<sup>0.5</sup> = 1.4709. (60 − 1.4709) × 1.04 = $60.87.',
  },
  {
    id: 'f08-na-i2', type: 'num', kind: 'numerical',
    prompt: 'Spot is ¥150 a dollar (yen a dollar). The yen rate is 0.5% and the dollar rate 4.5% a year. Quoting yen a dollar, what is the six-month forward rate (¥, 2 decimals)?',
    answer: 147.10, check: () => fxForward({ spot: 150, rDomestic: 0.005, rForeign: 0.045, T: 0.5 }), unit: '¥', places: 2, tol: 0.01,
    solution: 'With yen as the pricing currency: 150 × 1.005<sup>0.5</sup> ÷ 1.045<sup>0.5</sup> = ¥147.10. The dollar, with the higher rate, trades at a forward discount.',
  },
  {
    id: 'f08-na-i3', type: 'num', kind: 'numerical',
    prompt: 'Lantern holds a forward to buy €38,000 at $1.0920 on 31 March 2029. With three months left, the forward rate for 31 March is $1.0850 and the dollar rate is 4.5%. What is Lantern’s forward worth ($, negative if a liability)?',
    answer: -263.09, check: () => forwardValue({ F: 1.085, K: 1.092, r: 0.045, T: 0.25 }) * 38000, unit: '$', places: 2, tol: 0.05,
    solution: '(1.0850 − 1.0920) × 38,000 ÷ 1.045<sup>0.25</sup> = −266 ÷ 1.01106 = −$263.09. A liability: Lantern has agreed to pay more than euros now cost forward.',
  },
  {
    id: 'f08-na-i4', type: 'classify', kind: 'conceptual',
    prompt: 'Does each change raise or lower a forward price, other things equal?',
    items: ['A higher interest rate in the pricing currency', 'A larger dividend on the share before delivery', 'Higher storage costs for a commodity', 'A higher interest rate on the foreign currency'],
    categories: ['Raises it', 'Lowers it'],
    answer: [0, 1, 0, 1],
    solution: 'Interest and storage add to the cost of carry; income (dividends, foreign interest) reduces it.',
  },
  {
    id: 'f08-na-i5', type: 'mc', kind: 'conceptual',
    prompt: 'Oil for delivery in six months trades well below today’s spot price, though storage and interest are positive. What best explains it?',
    options: ['A high convenience yield when stocks are short (backwardation)', 'An arbitrage opportunity that traders have somehow not noticed for months', 'A forecast by the market that oil prices will fall', 'Storage costs that are negative for oil producers'],
    answer: 0,
    feedback: { 1: 'Reverse cash-and-carry would need holders of oil to sell it, which users who need oil will not do.', 2: 'Forward prices are set by carry, not forecasts; a shortage gives physical oil a convenience yield.', 3: 'Storage costs are positive.' },
    solution: 'When stocks are short, physical oil is worth more now (convenience yield), so forward prices can sit below spot.',
  },
];

export const check = [
  {
    id: 'f08-na-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What sets the no-arbitrage forward price of an asset that is easy to store and has no income?',
    options: ['Its spot price grown at the interest rate', 'The spot price that traders expect at delivery', 'The highest price any buyer will agree to pay', 'Today’s spot price, with no adjustment'],
    answer: 0,
    feedback: { 1: 'Expectations do not enter: buying forward must cost the same as buying now and carrying.', 2: 'Arbitrage, not the keenest buyer, sets the price.', 3: 'Holding the asset ties up money that earns interest elsewhere.' },
    solution: 'F = S(1 + r)<sup>T</sup>; any other price allows cash-and-carry or its reverse.',
  },
  {
    id: 'f08-na-k2', type: 'num', kind: 'numerical',
    prompt: 'A stock index is at 5,000 with a dividend yield of 1.5% (continuous) and a continuously compounded rate of 4%. What is the nine-month futures price?',
    answer: 5094.63, check: () => 5000 * Math.exp((0.04 - 0.015) * 0.75), unit: '', places: 2, tol: 0.05,
    solution: '5,000 × e<sup>(0.04 − 0.015) × 0.75</sup> = 5,094.63.',
  },
  {
    id: 'f08-na-k3', type: 'num', kind: 'numerical',
    prompt: 'Spot is $1.0800 a euro; the dollar rate is 4.5% and the euro rate 2.5% (annual). What is the one-year forward rate ($ a euro, 4 decimals)?',
    answer: 1.1011, check: () => fxForward({ spot: E.spot, rDomestic: E.rUsd, rForeign: E.rEur, T: 1 }), unit: '', places: 4, tol: 0.0001,
    solution: '1.0800 × 1.045 ÷ 1.025 = $1.1011.',
  },
  {
    id: 'f08-na-k4', type: 'mc', kind: 'applied',
    prompt: 'A firm treasurer says: “The euro forward is above spot, so the market expects the euro to rise; let us not hedge.” What is wrong?',
    options: ['The premium reflects the interest differential, not a forecast', 'Nothing: a forward premium is the market’s best forecast of the future rate', 'Forward rates are always below spot for the euro', 'The firm cannot hedge euros with a forward'],
    answer: 0,
    feedback: { 1: 'Parity sets the forward from rates; forwards are poor forecasts in practice.', 2: 'That depends on which currency has the higher interest rate.', 3: 'Banks sell currency forwards routinely.' },
    solution: 'Covered interest-rate parity explains the premium entirely by interest rates; the decision to hedge should rest on the exposure, not on a forecast.',
  },
  {
    id: 'f08-na-k5', type: 'num', kind: 'numerical',
    prompt: 'A trader is short a forward to deliver 1,000 barrels at $78 in four months. Today the four-month forward is $74 and the rate is 5% a year. What is the trader’s position worth ($)?',
    answer: 3935.47, check: () => forwardValue({ F: 74, K: 78, r: 0.05, T: 4 / 12, long: false }) * 1000, unit: '$', places: 2, tol: 0.05,
    solution: 'Short value = (K − F<sub>t</sub>) ÷ (1 + r)<sup>T − t</sup> × 1,000 = 4,000 ÷ 1.05<sup>1/3</sup> = $3,935.47.',
  },
  {
    id: 'f08-na-k6', type: 'num', kind: 'numerical',
    prompt: 'A company must pay £100,000 in one year. Pound rate 5%, dollar rate 4.5%, spot $1.27. Using a money-market hedge, how many dollars does it borrow today ($)?',
    answer: 120952.38, check: () => 100000 / 1.05 * 1.27, unit: '$', places: 2, tol: 0.05,
    solution: 'Deposit £100,000 ÷ 1.05 = £95,238.10 today; buying it costs 95,238.10 × 1.27 = $120,952.38, which it borrows (repaying $126,395.24, the same as a forward at $1.2640).',
  },
];
