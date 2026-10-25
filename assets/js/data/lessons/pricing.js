// Lesson: price elasticity and the profit-maximising price.
import * as F from '../../core/format.js?v=14';

const elasticity = (q1, q2, p1, p2) => Math.log(q2 / q1) / Math.log(p2 / p1);
const bestPrice = (cost, b) => (cost * b) / (1 + b);

export default {
  id: 'pricing',
  title: 'Price elasticity and the best price',
  minutes: 6,
  hook: 'How much do sales fall when the price rises? Elasticity answers in percentages, and with the cost of a unit it points to the price that earns the most.',
  idea: [
    'The <b>price elasticity of demand</b> is the percentage change in units sold for a 1% change in price. It is almost always negative. At −2, a 1% price rise loses about 2% of units; at −0.5, only about 0.5%.',
    'Revenue is price × units, so elasticity tells you which way revenue moves. When demand is <b>inelastic</b> (between 0 and −1), units fall by a smaller percentage than price rises, and a price rise lifts revenue. When it is <b>elastic</b> (below −1), a rise cuts revenue.',
    'To estimate elasticity from sales at different prices, fit ln(units) on ln(price): the slope is the elasticity, the same at every price. With the cost of one unit, a constant elasticity also gives the profit-maximising price directly.',
  ],
  formula: {
    html: '<i>b</i> = <span class="frac"><span>% change in units</span><span>% change in price</span></span> ≈ <span class="frac"><span>ln(Q<sub>2</sub> ÷ Q<sub>1</sub>)</span><span>ln(P<sub>2</sub> ÷ P<sub>1</sub>)</span></span>,&ensp; P* = cost × <span class="frac"><span><i>b</i></span><span>1 + <i>b</i></span></span>',
    terms: [
      ['<i>b</i>', 'the elasticity: the slope of ln(units) on ln(price)'],
      ['Q, P', 'units sold and price, at two prices (or many, in a regression)'],
      ['cost', 'the extra cost of making and selling one more unit'],
      ['P*', 'the profit-maximising price, when <i>b</i> is below −1 and stays the same at every price'],
    ],
  },
  example: {
    setup: 'A bakery tests its sourdough at two prices: it sells 1,000 loaves a month at $4 and 640 at $5. Each loaf costs $2 to make.',
    steps: [
      'Elasticity from logs: ln(640 ÷ 1,000) ÷ ln(5 ÷ 4) = −0.446 ÷ 0.223 = <b>−2.0</b>. Demand is elastic.',
      'So revenue falls with the price rise: $4 × 1,000 = <b>$4,000</b>, against $5 × 640 = <b>$3,200</b>.',
      'Best price: $2 × (−2.0) ÷ (1 − 2.0) = <b>$4.00</b>.',
      'Check the profit: at $4, ($4 − $2) × 1,000 = <b>$2,000</b>; at $5, ($5 − $2) × 640 = <b>$1,920</b>.',
    ],
    result: 'Keep the price at $4. At an elasticity of −2 the best price is twice the unit cost; the less elastic the demand, the bigger the best markup.',
  },
  mistake: {
    title: 'Using simple percentage changes',
    html: 'From $4 to $5 the price rises 25% and units fall 36%, which gives −36 ÷ 25 = −1.44. Measured the other way, from $5 down to $4, units rise 56% while the price falls 20%: −2.81. Simple percentages give a different answer depending on the direction; logs give −2.0 both ways.',
  },
  remember: [
    'Elasticity is the percentage change in units for a 1% change in price. Estimate it as the slope of ln(units) on ln(price).',
    'Inelastic demand (between 0 and −1): a price rise lifts revenue. Elastic demand (below −1): it lowers revenue.',
    'With a constant elasticity <i>b</i> below −1, the profit-maximising price is cost × <i>b</i> ÷ (1 + <i>b</i>). Near −1 that price runs away, so test it before trusting it.',
  ],
  calc: {
    title: 'Price, units and profit',
    intro: 'Demand with a constant elasticity, through today’s price and sales.',
    inputs: [
      { id: 'b', label: 'Elasticity', min: -4, max: -0.3, step: 0.1, value: -2, fmt: 'num', digits: 1 },
      { id: 'cost', label: 'Cost of one unit', min: 0.5, max: 20, step: 0.5, value: 2, fmt: 'money', digits: 2 },
      { id: 'price', label: 'Today’s price', min: 1, max: 30, step: 0.5, value: 5, fmt: 'money', digits: 2 },
      { id: 'units', label: 'Units sold at today’s price', min: 100, max: 5000, step: 20, value: 640, fmt: 'int' },
    ],
    compute({ b, cost, price, units }) {
      const q = (p) => units * (p / price) ** b;
      const revUp = 1.1 ** (1 + b) - 1, now = (price - cost) * units;
      const rows = [['Revenue if you raise the price 10%', `${F.signed(revUp * 100, 1)}%`], ['Profit at today’s price', F.money(now)]];
      if (b > -1.05) {
        return {
          headline: { value: 'Raise it', label: 'demand is inelastic here, so the formula has no best price' },
          rows, note: 'With inelastic demand every price rise adds profit; in reality demand turns elastic somewhere above the prices you have tested.',
        };
      }
      const pStar = bestPrice(cost, b), best = (pStar - cost) * q(pStar);
      rows.push(['Profit at the best price', F.money(best)], ['Units at the best price', F.int(q(pStar))]);
      return {
        headline: { value: F.money(pStar, { digits: 2 }), label: 'profit-maximising price' },
        rows,
        note: Math.abs(pStar - price) / price < 0.03 ? 'Today’s price is already close to the best one.'
          : pStar > price ? `Raising the price toward ${F.money(pStar, { digits: 2 })} would earn ${F.money(best - now)} more a period, if the elasticity holds that far.` : `Cutting the price toward ${F.money(pStar, { digits: 2 })} would earn ${F.money(best - now)} more a period: the extra units outweigh the lower margin.`,
      };
    },
  },
  tool: { href: 'marketing/pricing/#elasticity', label: 'Price elasticity, in Marketing › Pricing' },
  checks: [
    { what: 'ln(640/1000)', value: Math.log(0.64), shown: -0.446, tol: 0.0005 },
    { what: 'ln(5/4)', value: Math.log(1.25), shown: 0.223, tol: 0.0005 },
    { what: 'elasticity', value: elasticity(1000, 640, 4, 5), shown: -2.0, tol: 0.05 },
    { what: 'revenue at $4', value: 4 * 1000, shown: 4000, tol: 0 },
    { what: 'revenue at $5', value: 5 * 640, shown: 3200, tol: 0 },
    { what: 'best price', value: bestPrice(2, elasticity(1000, 640, 4, 5)), shown: 4.0, tol: 0.005 },
    { what: 'profit at $4', value: 2 * 1000, shown: 2000, tol: 0 },
    { what: 'profit at $5', value: 3 * 640, shown: 1920, tol: 0 },
    { what: 'simple % up', value: (640 / 1000 - 1) * 100 / 25, shown: -1.44, tol: 0.005 },
    { what: 'simple % down', value: (1000 / 640 - 1) * 100 / -20, shown: -2.81, tol: 0.005 },
    { what: 'units rise 56%', value: (1000 / 640 - 1) * 100, shown: 56, tol: 0.5 },
  ],
};
