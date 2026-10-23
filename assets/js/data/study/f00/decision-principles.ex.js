// decision-principles.ex.js — F00 · Six principles behind financial decisions: widget, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).

const pct = (v) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(1)}%`;

// Fictional returns: Brightside Sunscreen does well in sunny years, Cloudburst Umbrellas in rainy ones.
const SUN = { bright: 30, cloud: -10 };
const RAIN = { bright: -10, cloud: 30 };

export const widgets = {
  diversify: {
    type: 'formula',
    title: 'Diversification explorer: sunscreen and umbrellas',
    intro: 'Brightside Sunscreen returns +30% in a sunny year and −10% in a rainy one; Cloudburst Umbrellas does the opposite (both companies and returns are fictional). Choose how much of your money goes into Brightside (the rest goes into Cloudburst) and how likely a sunny year is.',
    inputs: [
      { id: 'w', label: 'Share of your money in Brightside', min: 0, max: 100, step: 5, value: 100, fmt: 'pct' },
      { id: 'p', label: 'Chance of a sunny year', min: 5, max: 95, step: 5, value: 50, fmt: 'pct' },
    ],
    compute: (v) => {
      const w = v.w / 100;
      const p = v.p / 100;
      const sunny = w * SUN.bright + (1 - w) * SUN.cloud;
      const rainy = w * RAIN.bright + (1 - w) * RAIN.cloud;
      const expected = p * sunny + (1 - p) * rainy;
      const spread = Math.abs(sunny - rainy);
      let note;
      if (spread < 1e-9) {
        note = `With an even split, the gains on one company exactly offset the losses on the other, so you earn ${pct(sunny)} whatever the weather. This is diversification at its most extreme: the two returns move in exactly opposite directions. Real investments are never this neat, so diversification reduces risk without removing it.`;
      } else if (w === 1 || w === 0) {
        note = `All your money is in one company, so your return depends entirely on the weather: ${pct(Math.max(sunny, rainy))} in a good year for it and ${pct(Math.min(sunny, rainy))} in a bad one, a gap of ${spread.toFixed(1)} percentage points. Move towards an even split and watch the gap close.`;
      } else {
        note = `Splitting your money narrows the gap between your best and worst year to ${spread.toFixed(1)} percentage points. ${Math.abs(p - 0.5) < 1e-9 ? 'With sunny and rainy years equally likely, the expected return stays at 10% whatever the split: diversification has cut risk at no cost in expected return.' : 'Because one kind of year is more likely, leaning towards the company that benefits raises the expected return, but only by taking on more risk: the risk–return trade-off again.'}`;
      }
      return {
        headline: { label: 'Expected return on your portfolio', value: pct(expected) },
        rows: [
          ['Your return in a sunny year', pct(sunny)],
          ['Your return in a rainy year', pct(rainy)],
          ['Gap between the two (a simple measure of risk)', `${spread.toFixed(1)} percentage points`],
          ['For comparison: all in Brightside, sunny / rainy', `${pct(SUN.bright)} / ${pct(RAIN.bright)}`],
        ],
        note,
        chart: {
          kind: 'bar',
          x: { label: 'Kind of year', values: ['Sunny', 'Rainy'] },
          series: [
            { name: 'Your portfolio (%)', values: [Math.round(sunny * 10) / 10, Math.round(rainy * 10) / 10] },
            { name: 'All in Brightside (%)', values: [SUN.bright, RAIN.bright] },
          ],
          y: { label: 'Return (%)' },
        },
      };
    },
  },
};

export const guided = [
  {
    id: 'f00-dp-g1', type: 'steps', kind: 'applied',
    prompt: 'Once Lantern is open, Ana considers renting a stall at a Saturday market (all figures fictional). The stall costs $200 a month; she expects extra sales of $1,100 a month and extra supplies of $350. On Saturdays she would otherwise teach a private class for $150 a month. She has already paid a non-refundable $80 for a trader’s permit application, and her spreadsheet charges the stall $50 a month of Lantern’s insurance, which would cost the same either way. Is the stall worth it?',
    solution: 'Incremental: sales +1,100, supplies −350, stall fee −200, forgone class income −150 (an opportunity cost). Total: 1,100 − 350 − 200 − 150 = $400 a month. The $80 permit fee is sunk and the $50 of insurance does not change, so neither counts. The stall adds about $400 a month: worth doing on these estimates.',
    steps: [
      { id: 'f00-dp-g1-s1', type: 'classify',
        prompt: 'Classify each item.',
        items: ['Extra sales of $1,100 a month', 'The $80 permit application fee already paid', 'The $150 a month from the private class she would give up', 'The $50 a month of insurance charged to the stall', 'The $200 monthly stall fee'],
        categories: ['Incremental: count it', 'Sunk: ignore it', 'Unchanged: ignore it'],
        answer: [0, 1, 0, 2, 0],
        hints: ['For each item ask: would this be different if Ana did not take the stall?', 'Money already spent is sunk. Income given up is an opportunity cost, which does count.'],
        feedback: {
          1: 'The $80 is gone whether or not she takes the stall: a sunk cost.',
          2: 'No money changes hands, but taking the stall means losing the class income. That is an opportunity cost, and it is incremental.',
          3: 'Lantern pays the same insurance with or without the stall, so the $50 is an allocation, not an extra cost.',
        } },
      { id: 'f00-dp-g1-s2', type: 'num',
        prompt: 'What is the incremental cash flow per month?',
        answer: 400, check: () => 1100 - 350 - 200 - 150, unit: '$', places: 0, tol: 0.5,
        hints: ['Add the incremental inflows and subtract the incremental outflows, including the opportunity cost.', '1,100 − 350 − 200 − 150.'],
        wrong: [
          { value: 550, say: 'You left out the opportunity cost: the $150 a month from the class she would give up.' },
          { value: 350, say: 'You subtracted the $50 of insurance, which Lantern pays anyway. It is not incremental.' },
          { value: 320, say: 'You subtracted the $80 permit fee. It is sunk, and in any case it is a one-off, not a monthly cost.' },
        ] },
    ],
  },
  {
    id: 'f00-dp-g2', type: 'steps', kind: 'numerical',
    prompt: 'A supplier offers Lantern a choice for a new grinder: pay $1,800 now, or $2,000 in two years. Any spare cash Lantern keeps could earn 4% a year in a two-year certificate of deposit. Which is cheaper?',
    solution: 'PV of paying later: 2,000 ÷ 1.04² = 2,000 ÷ 1.0816 = $1,849.11. That is more than $1,800, so paying now is cheaper by about $49.11 in today’s money. Check the other way: $1,800 deposited at 4% would grow to 1,800 × 1.0816 = $1,946.88 in two years, less than the $2,000 that would be owed.',
    steps: [
      { id: 'f00-dp-g2-s1', type: 'num',
        prompt: 'What is the present value of paying $2,000 in two years, at 4%?',
        answer: 1849.11, check: () => 2000 / 1.04 ** 2, unit: '$', places: 2, tol: 0.01,
        hints: ['PV = FV ÷ (1 + r)ⁿ.', '1.04² = 1.0816; divide 2,000 by it.'],
        wrong: [
          { value: 1923.08, say: 'That discounts for only one year. The payment is two years away.' },
          { value: 2163.2, say: 'You multiplied: that is a future value. To bring a later payment to today, divide.' },
        ] },
      { id: 'f00-dp-g2-s2', type: 'mc',
        prompt: 'Which option is cheaper for Lantern?',
        options: ['Paying $1,800 now', 'Paying $2,000 in two years', 'They cost the same'],
        answer: 0,
        hints: ['Compare $1,800 today with the present value you just found.'],
        feedback: {
          1: 'Paying later costs $1,849.11 in today’s money, more than the $1,800 it costs to pay now: the 4% Lantern could earn meanwhile does not make up the extra $200.',
          2: 'They are the same only at the rate where 2,000 ÷ (1 + r)² = 1,800, which is about 5.4% a year, not 4%.',
        } },
    ],
  },
  {
    id: 'f00-dp-g3', type: 'steps', kind: 'numerical',
    prompt: 'A safe deposit pays 5% a year, and anyone can borrow or lend at that rate. A certain promise to pay $2,100 in one year is offered for sale at $1,960.',
    solution: 'No-arbitrage price: 2,100 ÷ 1.05 = $2,000. The promise is $40 too cheap. Borrow $1,960 at 5% and buy it; in a year collect $2,100 and repay 1,960 × 1.05 = $2,058, keeping $42 with no risk and no money of your own. Buying would continue until the price rose to $2,000.',
    steps: [
      { id: 'f00-dp-g3-s1', type: 'num',
        prompt: 'What price for the promise would leave no arbitrage?',
        answer: 2000, check: () => 2100 / 1.05, unit: '$', places: 0, tol: 0.5,
        hints: ['The no-arbitrage price is the present value at the risk-free rate.', '2,100 ÷ 1.05.'],
        wrong: [{ value: 1995, say: 'You took 5% off $2,100. Discounting divides by 1.05: 2,100 ÷ 1.05.' }] },
      { id: 'f00-dp-g3-s2', type: 'num',
        prompt: 'If you borrow $1,960 at 5% to buy the promise, how much do you keep after a year, once the loan is repaid?',
        answer: 42, check: () => 2100 - 1960 * 1.05, unit: '$', places: 2, tol: 0.01,
        hints: ['In a year you receive $2,100 and must repay the loan with interest.', 'Repayment: 1,960 × 1.05 = 2,058.'],
        wrong: [
          { value: 140, say: 'That ignores the interest on the $1,960 you borrowed. Repay 1,960 × 1.05, not 1,960.' },
          { value: 40, say: 'That is the gap between the price and its present value today. In a year that gap has grown by 5%: 40 × 1.05 = 42.' },
        ] },
    ],
  },
  {
    id: 'f00-dp-g4', type: 'mc', kind: 'conceptual',
    prompt: 'An investor holds shares in one airline. Which addition would reduce the risk of her portfolio most?',
    options: [
      'Shares in an oil company, whose results tend to improve when fuel prices rise',
      'Shares in a second airline',
      'More shares in the same airline',
      'Shares in an aircraft-leasing company that depends on airlines’ business',
    ],
    answer: 0,
    hints: [
      'Diversification works best with investments that do not move in lockstep.',
      'Which of these does well in a situation that hurts airlines?',
    ],
    feedback: {
      1: 'A second airline faces the same fuel costs and travel demand, so the two tend to rise and fall together: little diversification.',
      2: 'More of the same share adds no diversification at all.',
      3: 'An aircraft lessor depends on airlines doing well, so it shares much of their risk.',
    },
    solution: 'Higher fuel prices hurt airlines and help oil producers, so their results are less closely related than two airlines’ results. Adding the oil company lets gains partly offset losses, which reduces risk. Investments in the same industry, or that depend on it, share its risks.',
  },
];

export const independent = [
  {
    id: 'f00-dp-i1', type: 'num', kind: 'numerical',
    prompt: 'In one month a fictional events business invoices customers $9,000, all due next month. It pays $5,500 of costs in cash and records $300 of depreciation. During the month it collects $2,000 from invoices sent the month before. By how much does its cash change during the month? (Enter a decrease as a negative number.)',
    answer: -3500, check: () => 2000 - 5500, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 3200, say: 'That is the month’s accounting profit (9,000 − 5,500 − 300). Cash counts only money received (2,000) and paid (5,500).' },
      { value: -3800, say: 'Depreciation is not a payment, so it does not reduce cash.' },
      { value: -5500, say: 'You left out the $2,000 collected from last month’s invoices: cash did come in.' },
    ],
    solution: 'Cash in: $2,000 collected. Cash out: $5,500. Change: 2,000 − 5,500 = −$3,500. Meanwhile accounting profit is 9,000 − 5,500 − 300 = $3,200: a profitable month in which cash fell.',
  },
  {
    id: 'f00-dp-i2', type: 'classify', kind: 'applied',
    prompt: 'A fictional hotel is deciding whether to open a rooftop bar on space it already owns. Classify each item for that decision.',
    items: [
      'A $25,000 architect’s study, already paid for',
      'Rent of $40,000 a year that a restaurant has offered to pay for the rooftop space',
      'Bar staff wages',
      'The general manager’s salary, which is the same either way',
      'Extra room bookings from guests attracted by the bar',
      'Drinks sales',
    ],
    categories: ['Incremental: count it', 'Sunk: ignore it', 'Unchanged: ignore it'],
    answer: [1, 0, 0, 2, 0, 0],
    feedback: {
      0: 'The study is paid for whatever the hotel decides: sunk.',
      1: 'If the hotel uses the space for its own bar, it gives up the restaurant’s rent. That opportunity cost is incremental.',
      3: 'The general manager is paid the same with or without the bar, so the salary is not incremental, even if the accounts allocate part of it to the bar.',
      4: 'A side effect on another part of the business still counts: those bookings happen only because of the bar.',
    },
    solution: 'Count the drinks sales, the bar staff wages, the extra room bookings (a side effect) and the $40,000 of rent given up (an opportunity cost). Ignore the architect’s study (sunk) and the general manager’s salary (unchanged).',
  },
  {
    id: 'f00-dp-i3', type: 'mc', kind: 'conceptual',
    prompt: 'Which of these is an arbitrage in the strict sense?',
    options: [
      'Buying a bond for $970 and, at the same moment, selling an identical bond for $985, with no other costs',
      'Buying shares you expect to rise after good news',
      'Buying a house in a neighbourhood where prices have been rising, to sell it next year',
      'Lending money at 6% that you borrowed at 4% to a business that might fail',
    ],
    answer: 0,
    feedback: {
      1: 'The shares might fall instead: this is a risky bet on a price change, which is speculation, not arbitrage.',
      2: 'Prices could stop rising or fall before you sell. The trade carries risk, so it is not arbitrage.',
      3: 'If the business fails you lose. The 2-point spread is payment for bearing that risk, not a riskless profit.',
    },
    solution: 'Arbitrage locks in a profit with no risk and no money of your own: buying and selling identical cash flows at the same time for different prices. Only the simultaneous bond trade fits: $15 profit, known in advance.',
  },
  {
    id: 'f00-dp-i4', type: 'num', kind: 'numerical',
    prompt: 'You put 60% of your money in fund A and 40% in fund B (both fictional). This year A returns 12% and B returns −3%. What is the return on your whole portfolio?',
    answer: 6, check: () => 0.6 * 12 + 0.4 * -3, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 4.5, say: 'That is the simple average of 12% and −3%. Weight each return by the share of money in it.' },
      { value: 8.4, say: 'Check the sign of B’s return: it lost 3%, so 0.4 × (−3) = −1.2, not +1.2.' },
    ],
    solution: 'Rₚ = 0.6 × 12 + 0.4 × (−3) = 7.2 − 1.2 = 6.0%.',
  },
  {
    id: 'f00-dp-i5', type: 'mc', kind: 'applied',
    prompt: 'A stranger offers Ana a “guaranteed” return of 15% a year with “no risk at all”, while insured bank deposits pay well under 5%. What does the principle of risk and return suggest?',
    options: [
      'Be very suspicious: a high return with no risk contradicts how markets price risk, and is a common sign of fraud or of risks not disclosed.',
      'Accept: a guaranteed 15% is clearly better than a bank deposit.',
      'Accept, but only with half of her savings, to diversify.',
      'It makes no difference, because returns and risk are unrelated.',
    ],
    answer: 0,
    feedback: {
      1: 'If a genuinely riskless 15% existed, everyone would borrow at bank rates to buy it, and the opportunity would vanish. Promises like this usually hide risk or are fraudulent.',
      2: 'Diversification spreads risk across real investments; it does not make a dubious offer safe. Half her savings could still be lost.',
      3: 'Higher expected returns come with higher risk; that link is the heart of the principle.',
    },
    solution: 'Risk and return go together, and no-arbitrage reasoning says a riskless return far above the safe rate cannot last. An offer of high returns with no risk is a warning sign, not an opportunity.',
  },
];

export const check = [
  {
    id: 'f00-dp-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A company has spent $2 million developing a product that now looks unlikely to sell. A manager argues: “We must launch it, or the $2 million will have been wasted.” What is wrong with the argument?',
    options: [
      'The $2 million is sunk: it is spent whether or not the product launches, so the decision should depend only on future cash flows from launching versus not launching.',
      'Nothing: past spending should be recovered before a project is dropped.',
      'The $2 million should be discounted to present value before deciding.',
      'The $2 million is an opportunity cost, so it should be added to the launch costs.',
    ],
    answer: 0,
    feedback: {
      1: 'That is the sunk cost fallacy. Launching cannot recover the $2 million; it only adds new costs and new revenue, which are what should be compared.',
      2: 'Discounting does not make a sunk cost relevant. It is the same under either choice, so it cancels out.',
      3: 'An opportunity cost is a benefit given up by choosing one option. Past spending is not given up by either choice; it is already gone.',
    },
    solution: 'Only incremental cash flows matter. The $2 million cannot be recovered whatever the company does, so it should not influence the choice. Launch only if the future cash from launching, in present value, exceeds the future costs of launching.',
  },
  {
    id: 'f00-dp-k2', type: 'num', kind: 'applied',
    prompt: 'A fictional manufacturer owns an empty warehouse that it could rent out for $30,000 a year. A new product line would use the warehouse and is expected to produce $45,000 a year of cash before any charge for the warehouse. What is the line’s incremental cash flow per year, after the opportunity cost of the warehouse?',
    answer: 15000, check: () => 45000 - 30000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 45000, say: 'The warehouse is not free: using it means giving up $30,000 a year of rent. That opportunity cost must be subtracted.' },
      { value: 75000, say: 'The rent is income the company gives up, not income it gains. Subtract it.' },
    ],
    solution: 'The company gives up $30,000 of rent by using the warehouse, so the incremental cash flow is 45,000 − 30,000 = $15,000 a year.',
  },
  {
    id: 'f00-dp-k3', type: 'num', kind: 'numerical',
    prompt: 'A company’s shares trade at $50.00 on one exchange and $50.40 on another at the same moment. Buying and selling costs a total of $0.10 per share. How much riskless profit could a trader make by buying 1,000 shares on the cheaper exchange and selling 1,000 on the dearer one at the same time?',
    answer: 300, check: () => (50.4 - 50.0 - 0.1) * 1000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 400, say: 'You left out the trading costs: $0.10 a share eats part of the $0.40 gap.' },
      { value: 0.3, say: 'That is the profit per share. Multiply by the 1,000 shares.' },
    ],
    solution: 'Gap per share: 50.40 − 50.00 = $0.40. After costs: 0.40 − 0.10 = $0.30 a share. On 1,000 shares: $300. Trades like this push the two prices together until the gap is no bigger than the trading costs.',
  },
  {
    id: 'f00-dp-k4', type: 'mc', kind: 'conceptual',
    prompt: 'Which risk can diversification NOT remove?',
    options: [
      'A recession that reduces sales at nearly every company',
      'A product recall at one company',
      'A lawsuit against one company',
      'The loss of one company’s largest customer',
    ],
    answer: 0,
    feedback: {
      1: 'A recall at one company is unsystematic risk: in a diversified portfolio, it is offset by the many holdings it does not affect.',
      2: 'A lawsuit against one firm is specific to that firm, so diversification largely removes it.',
      3: 'Losing a customer is a company-specific event, which diversification spreads thin.',
    },
    solution: 'A recession is systematic risk: it affects nearly all investments at once, so holding more of them does not help. Recalls, lawsuits and lost customers are unsystematic risks that diversification can largely remove.',
  },
  {
    id: 'f00-dp-k5', type: 'num', kind: 'numerical',
    prompt: 'On 1 January a fictional delivery business pays $24,000 in cash for equipment that will last four years, so it records $6,000 of depreciation a year. During the year it collects $50,000 of revenue in cash and pays $30,000 of other costs in cash. What is the change in its cash over the year? (Enter a decrease as a negative number.)',
    answer: -4000, check: () => 50000 - 30000 - 24000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 14000, say: 'That is the accounting profit (50,000 − 30,000 − 6,000). The cash for the equipment, all $24,000, left this year.' },
      { value: 20000, say: 'That leaves out the $24,000 paid for the equipment during the year.' },
      { value: -10000, say: 'You subtracted the depreciation as well as the equipment payment. Depreciation is not a payment.' },
    ],
    solution: 'Cash: 50,000 − 30,000 − 24,000 = −$4,000. Profit: 50,000 − 30,000 − 6,000 = $14,000. Profitable, yet cash fell, because the equipment was paid for at once but is expensed over four years.',
  },
  {
    id: 'f00-dp-k6', type: 'mc', kind: 'applied',
    prompt: 'From 1 March, Ana’s income and $20,000 of her savings will depend on Lantern. Which home for her remaining $6,000 diversifies her finances most?',
    options: [
      'An insured savings account at a bank',
      'Shares in Harbourline Roasters Inc., a fictional listed coffee roaster',
      'A loan to a friend’s coffee cart in the same district',
      'More shares in Lantern',
    ],
    answer: 0,
    feedback: {
      1: 'Harbourline is in Ana’s own industry: higher coffee-bean prices or a fall in coffee spending would hurt it and Lantern together. A listed company is more diversified than a café, but this choice still adds to the risk she already has.',
      2: 'The cart shares Lantern’s industry and its local economy, so a downturn in the district would hit Ana’s business, her income and this loan all at once.',
      3: 'More Lantern shares put the money in the very basket that already holds her income and $20,000 of savings: no diversification at all.',
    },
    solution: 'Diversification means holding something whose fortunes do not move with what you already hold. Ana’s income and most of her savings already depend on Lantern, a coffee business in one district. An insured savings account does not depend on Lantern, coffee or the local economy, so it diversifies her finances most. The coffee shares, the cart loan and more Lantern shares all add to the same risk.',
  },
];
