// assess-m1.js — F06 module 1 test: Securities and markets (shares-and-markets, bond-prices-and-yields).
// No hints. Each item has a full solution, shown when the student reviews the test. New questions, not copies of the
// lesson exercises. Morrow & Pike, Harbour Street and the four bonds come from case.js (fictional); prices, durations
// and enterprise values from core/investments.js. Every other business, quote and figure is fictional.
import { COMPANIES, BONDS } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';

const MP = COMPANIES.morrow, HS = COMPANIES.harbour;
const [G5, , HB] = BONDS;
const at = (b, y) => IV.bondAtYield({ face: 100, ...b }, y);
// a share issue used to repay debt (item 1)
const NEW = { shares: 10, price: HS.price };
const raised = NEW.shares * NEW.price;
// the five-year note's payments for the duration sheet (item 7)
const T = Array.from({ length: 10 }, (_, i) => (i + 1) / 2);
const durCells = { A1: 'Time (years)', B1: 'Payment', C1: 'PV', E1: 'Yield (annual)', F1: G5.ytm };
T.forEach((t, i) => { const r = i + 2; durCells[`A${r}`] = t; durCells[`B${r}`] = i === 9 ? 102 : 2; durCells[`C${r}`] = `=B${r}/(1+$F$1/2)^(A${r}*2)`; });
durCells.A13 = 'Macaulay duration';

export const items = [
  {
    id: 'f06-m1-1', lesson: 'shares-and-markets', type: 'num', kind: 'numerical',
    prompt: 'Harbour Street Foods (fictional; 120 million shares at $18.00, debt $1,188 million, cash $60 million) sells 10 million new shares at $18.00 and uses all the money to repay debt. If the share price stays at $18.00, what is its new market debt-to-equity ratio (debt ÷ market capitalisation)? Give two decimal places.',
    answer: 0.43, check: () => (HS.debt - raised) / ((HS.shares + NEW.shares) * HS.price), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 0.55, say: 'That is the ratio before the issue. Debt falls by $180 million and market capitalisation rises by $180 million.' },
      { value: 0.47, say: 'That lowers the debt but keeps the market capitalisation at $2,160 million. The 10 million new shares add $180 million to it.' },
    ],
    solution: 'The issue raises 10 × $18.00 = $180 million in the primary market. Debt falls to 1,188 − 180 = $1,008 million; market capitalisation rises to 130 × 18.00 = $2,340 million. D/E = 1,008 ÷ 2,340 = 0.43. Enterprise value is unchanged at 2,340 + 1,008 − 60 = $3,288 million: the business is the same, financed differently.',
  },
  {
    id: 'f06-m1-2', lesson: 'shares-and-markets', type: 'mc', kind: 'conceptual',
    prompt: 'On a day with no news about any company, the central bank unexpectedly raises interest rates and most share prices fall, including Morrow & Pike’s. What is the best explanation of Morrow & Pike’s fall?',
    options: [
      'Investors now require a higher return, so expected dividends are worth less today',
      'Morrow & Pike must now pay higher interest on all its existing debt, cutting its dividends',
      'The company has received less money from the shares traded that day',
      'Higher rates make the price-weighted index fall, which drags every share down with it',
    ],
    answer: 0,
    feedback: {
      1: 'Its existing debt may carry fixed rates, and the fall is market-wide. The common cause is the higher required return.',
      2: 'Secondary-market trades never pay the company; its cash is unaffected by trading.',
      3: 'An index reflects its members’ prices; it does not move them.',
    },
    solution: 'A share price is the present value of expected cash flows to shareholders, discounted at the return they require. With no news about cash flows, a market-wide fall after a rate rise reflects a higher required return: the same dividends discounted at a higher rate are worth less.',
  },
  {
    id: 'f06-m1-3', lesson: 'shares-and-markets', type: 'num', kind: 'numerical',
    prompt: 'A value-weighted index holds only Morrow & Pike ($1,120 million) and Harbour Street ($2,160 million). In one month Morrow & Pike’s shares rise 10% and Harbour Street’s fall 5%, with no new shares issued. What is Morrow & Pike’s weight in the index at the end of the month? Give a percentage to one decimal place.',
    answer: 37.5, check: () => MP.marketCap * 1.1 / (MP.marketCap * 1.1 + HS.marketCap * 0.95) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: 34.1, say: 'That is the weight at the start. Weights move with prices: recompute with the new market capitalisations, 1,232 and 2,052.' },
      { value: 50, say: 'A value-weighted index does not reset to equal weights.' },
    ],
    solution: 'New market capitalisations: 1,120 × 1.10 = $1,232 million and 2,160 × 0.95 = $2,052 million. Morrow & Pike’s weight = 1,232 ÷ 3,284 = 37.5%, up from 34.1%. A fund tracking the index would hold exactly these weights without trading, because its holdings moved with the prices.',
  },
  {
    id: 'f06-m1-4', lesson: 'shares-and-markets', type: 'mc', kind: 'applied',
    prompt: 'Prices are falling fast. A fictional investor holding shares in Marrowick Bakeries, now quoted at a bid of $48.00 and an ask of $48.20, places a sell limit order at $50.00. What is the most likely outcome?',
    options: [
      'The order waits unfilled, because no buyer will pay $50.00 or more',
      'The order is filled at once at $48.00, the best bid',
      'The order is filled at $50.00, because a limit order fixes the price',
      'The order is turned into a market order once the price passes $50.00',
    ],
    answer: 0,
    feedback: {
      1: 'That is what a market order would do. A sell limit order never sells below its limit.',
      2: 'A limit sets the worst price the investor accepts, not the price a buyer must pay: it fills only if a buyer bids $50.00 or more.',
      3: 'That describes a different kind of order (a stop order), not a limit order.',
    },
    solution: 'A sell limit order executes only at the limit or better, $50.00 or more. With the best bid at $48.00 and prices falling, it is unlikely to fill. Limit orders protect the price at the cost of perhaps never trading.',
  },
  {
    id: 'f06-m1-5', lesson: 'shares-and-markets', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the statements about shares and markets.',
    text: 'When a company sells new shares to investors, the sale takes place in the [[0]] market. A preferred shareholder is paid [[1]]. A company’s enterprise value is unchanged when it [[2]].',
    blanks: [
      { options: ['secondary', 'over-the-counter', 'primary'], answer: 2 },
      { options: ['before common shareholders but after lenders', 'before lenders but after common shareholders', 'alongside common shareholders, in proportion'], answer: 0 },
      { options: ['issues new shares to repay debt, at an unchanged share price', 'buys back shares with borrowed money, after which its share price rises', 'sees its share price fall after poor results'], answer: 0 },
    ],
    solution: 'New shares are sold in the primary market. Preferred shares rank after all lenders and before common shares. Swapping debt for equity at an unchanged price moves value between lenders and shareholders without changing the business, so enterprise value stays the same; a price fall lowers market capitalisation and so enterprise value.',
  },
  {
    id: 'f06-m1-6', lesson: 'bond-prices-and-yields', type: 'num', kind: 'numerical',
    prompt: 'The Harbour Street Foods 2035 bond (fictional; seven years left, 5.5% coupon paid twice a year) yields 6.10%. After strong results its credit spread narrows by 50 basis points, with government yields unchanged. What is its new price per $100?',
    answer: 99.43, check: () => at(HB, HB.ytm - 0.005).price, unit: '$', places: 2, tol: 0.02,
    wrong: [
      { value: 96.62, say: 'That is the price at 6.10%. A narrower spread lowers the yield to 5.60%; reprice at 2.80% a half-year.' },
      { value: 93.91, say: 'That moves the yield the wrong way. A narrower spread means a lower yield and a higher price.' },
    ],
    solution: 'New yield = 6.10% − 0.50% = 5.60%, or 2.80% a half-year. Price = 2.75 × (1 − 1.028^−14) ÷ 0.028 + 100 ÷ 1.028^14 = $99.43, or =PV(5.6%/2,14,−2.75,−100). Check with duration: about 5.71 × 0.5% = 2.85% up from $96.62, which gives $99.37; the exact price is a little higher because of convexity.',
  },
  {
    id: 'f06-m1-7', lesson: 'bond-prices-and-yields', type: 'formula', kind: 'applied',
    prompt: 'The sheet lists the five-year government note’s ten half-yearly payments (column B) at their times in years (column A), with each payment’s present value at the yield in F1 in column C. In B13, write a formula for its Macaulay duration in years.',
    sheet: { cells: durCells, fixed: ['A2:A11'] },
    cell: 'B13', view: 'A1:F13', widths: { A: 18, B: 12, C: 12, E: 14, F: 10 }, formats: { A: '0.0', B: '$#,##0.00', C: '$#,##0.00', F1: '0.00%', B13: '0.00' },
    answer: '=SUMPRODUCT(A2:A11,C2:C11)/SUM(C2:C11)',
    alt: ['=SUMPRODUCT(C2:C11,A2:A11)/SUM(C2:C11)'],
    wrong: [
      { formula: '=SUMPRODUCT(A2:A11,B2:B11)/SUM(B2:B11)', say: 'That weights the times by the payments themselves. Macaulay duration weights them by their present values, column C.' },
      { formula: '=SUMPRODUCT(A2:A11,C2:C11)', say: 'That is the sum of time × present value. Divide by the price, the sum of the present values, to turn it into an average time.' },
      { formula: '=AVERAGE(A2:A11)', say: 'A simple average of the times ignores that the last payment, $102, is most of the bond’s value.' },
    ],
    solution: '<x>=SUMPRODUCT(A2:A11,C2:C11)/SUM(C2:C11)</x> gives 4.58 years: each payment’s time weighted by its share of the price (SUM(C2:C11) = $99.11). Dividing by 1 + F1/2 would give the modified duration, 4.48.',
  },
  {
    id: 'f06-m1-8', lesson: 'bond-prices-and-yields', type: 'mc', kind: 'conceptual',
    prompt: 'A rating agency cuts a fictional company’s bonds from BBB to BB, with government yields unchanged. What happens to the bonds?',
    options: [
      'Their spread widens and their price falls; they also drop below investment grade',
      'Their coupon is raised to compensate holders, so their price is unchanged',
      'Their price falls, but their yield to maturity falls with it',
      'Nothing changes until the company actually misses a payment',
    ],
    answer: 0,
    feedback: {
      1: 'The coupon is fixed in the bond’s terms. The price adjusts instead.',
      2: 'Price and yield move in opposite directions: a lower price for the same payments means a higher yield.',
      3: 'Prices respond to the risk of default, not only to default itself: the downgrade signals more risk, and the market reprices at once.',
    },
    solution: 'A downgrade raises the return investors require for the company’s credit risk, so its spread over government bonds widens, its yield rises and its price falls. BB is below BBB, the lowest investment-grade category, so holders restricted to investment-grade bonds may have to sell, which can widen the spread further.',
  },
  {
    id: 'f06-m1-9', lesson: 'bond-prices-and-yields', type: 'num', kind: 'applied',
    prompt: 'A fictional charity holds $2 million in a bond fund with a modified duration of 6 years and $1 million in a short-term bond fund with a modified duration of 2 years. Roughly what percentage of the $3 million would it lose if all yields rose by one percentage point? Give one decimal place.',
    answer: 4.7, check: () => (2 * 6 + 1 * 2) / 3, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: 4, say: 'That is the simple average of the two durations. Weight each by the money in it: (2 × 6 + 1 × 2) ÷ 3.' },
      { value: 8, say: 'Durations are averaged, not added: the portfolio’s duration is the value-weighted average of its holdings’.' },
    ],
    solution: 'Portfolio duration = (2 × 6 + 1 × 2) ÷ 3 = 4.67 years, so a one-point rise costs about 4.7%, roughly $140,000 on $3 million (ignoring income and convexity).',
  },
  {
    id: 'f06-m1-10', lesson: 'bond-prices-and-yields', type: 'num', kind: 'numerical',
    prompt: 'A fictional bond has a modified duration of 8.0 and a convexity of 80. Estimate the percentage change in its price if its yield rises by two percentage points, using both duration and convexity. Give a signed percentage to one decimal place.',
    answer: -14.4, check: () => IV.priceChangeApprox({ modified: 8, convexity: 80 }, 0.02) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: -16, say: 'That is duration alone. Add ½ × 80 × 0.02² = +1.6 points.' },
      { value: -17.6, say: 'The convexity term is added, whichever way yields move: it makes the fall smaller, not larger.' },
    ],
    solution: 'ΔP/P ≈ −8.0 × 0.02 + ½ × 80 × 0.02² = −16.0% + 1.6% = −14.4%. For a move as large as two points the convexity term matters.',
  },
];
