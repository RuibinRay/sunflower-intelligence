// financial-markets.ex.js — F00 · Financial markets: widget, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).

const money = (v) => {
  const c = Math.round(Math.abs(v) * 100) / 100;
  const s = Number.isInteger(c) ? c.toLocaleString('en-US') : c.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${v < 0 && c !== 0 ? '−' : ''}$${s}`;
};
const pts = (x) => `${(Math.round(x * 100) / 100).toFixed(2)} percentage points`;

export const widgets = {
  'fm-intermediation': {
    type: 'formula',
    title: 'Indirect finance: where the spread goes',
    intro: 'A bank takes deposits at one rate and lends them at another. Change the amount, the two rates and the share of loans that go unpaid.',
    inputs: [
      { id: 'amount', label: 'Amount lent for one year', min: 1000, max: 100000, step: 1000, value: 10000, fmt: 'money' },
      { id: 'rd', label: 'Rate paid to savers', min: 0, max: 10, step: 0.1, value: 1.5, fmt: 'pct' },
      { id: 'rl', label: 'Rate charged to the borrower', min: 0, max: 20, step: 0.1, value: 6, fmt: 'pct' },
      { id: 'loss', label: 'Share of the loan expected to go unpaid', min: 0, max: 10, step: 0.1, value: 1, fmt: 'pct' },
    ],
    compute: (v) => {
      const saver = v.amount * v.rd / 100;
      const borrower = v.amount * v.rl / 100;
      const spread = v.rl - v.rd;
      const margin = borrower - saver;
      const losses = v.amount * v.loss / 100;
      const left = margin - losses;
      let note;
      if (spread < 0) {
        note = 'The bank is paying savers more than it charges the borrower. It loses money on every dollar lent before any costs; no bank can do this for long.';
      } else if (left < 0) {
        note = `The spread of ${pts(spread)} does not even cover the expected bad loans, so the bank expects to lose ${money(-left)} on this loan before paying any staff. A riskier borrower needs a higher rate, or no loan at all.`;
      } else if (spread === 0) {
        note = 'With no spread the bank earns nothing for choosing, watching and bearing the risk of the borrower.';
      } else {
        note = `Of the ${pts(spread)} spread, ${money(losses)} is expected to go on bad loans, leaving ${money(left)} a year to pay the bank’s staff and systems and to give its own shareholders a return. The spread is the price of the intermediary’s services, not pure profit.`;
      }
      return {
        headline: { label: 'Left for the bank’s costs and profit, per year', value: money(left) },
        rows: [
          ['Interest the borrower pays', money(borrower)],
          ['Interest the savers receive', money(saver)],
          ['Spread', pts(spread)],
          ['Gross interest margin', money(margin)],
          ['Expected unpaid loans', money(losses)],
        ],
        note,
        chart: { kind: 'bar', x: { label: 'Item', values: ['Borrower pays', 'Savers receive', 'Expected losses', 'Left for bank'] },
          series: [{ name: 'Dollars per year', values: [borrower, saver, losses, left] }], y: { label: 'Dollars per year' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f00-fm-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Does each transaction take place in the primary market or the secondary market?',
    items: [
      'Harbourline Roasters sells 2 million new shares to investors through an investment bank.',
      'A retired teacher sells her 200 Harbourline shares on a stock exchange.',
      'The US Treasury auctions new bills to banks and funds.',
      'A pension fund buys a ten-year government bond, issued three years ago, from an insurance company.',
      'A battery-storage installer sells shares to the public for the first time.',
    ],
    categories: ['Primary market', 'Secondary market'],
    answer: [0, 1, 0, 1, 0],
    hints: [
      'Ask who receives the money: the issuer, or another investor?',
      'New securities sold for the first time, with money going to the issuer, are primary; everything else is resale.',
    ],
    feedback: {
      1: 'The teacher already owns the shares; her buyer pays her, not Harbourline. That is resale: the secondary market.',
      3: 'The bond was issued three years ago. The insurer receives the money, so this is a secondary-market trade.',
      4: 'A first sale of shares to the public is an initial public offering, the classic primary-market transaction.',
    },
    solution: 'Primary: Harbourline’s new shares, the Treasury’s new bills and the installer’s IPO, because in each the issuer receives the money. Secondary: the teacher’s sale and the pension fund’s purchase of an existing bond, because the money passes between investors.',
  },
  {
    id: 'f00-fm-g2', type: 'classify', kind: 'conceptual',
    prompt: 'Does each instrument belong to the money market or the capital market?',
    items: [
      'A Treasury bill maturing in 13 weeks',
      'Common stock of a listed company',
      'Commercial paper maturing in 60 days',
      'A corporate bond maturing in 12 years',
      'A Treasury note maturing in 5 years',
      'An overnight loan from one bank to another',
    ],
    categories: ['Money market', 'Capital market'],
    answer: [0, 1, 0, 1, 1, 0],
    hints: [
      'The dividing line is one year.',
      'Shares never mature, so they belong with the long-term claims.',
    ],
    feedback: {
      1: 'Shares have no maturity date at all, which makes them the longest-lived claim of the lot: capital market.',
      4: 'A five-year note is still longer than one year. Treasury notes run from 2 to 10 years, so they are capital-market instruments even though the issuer is the same as for bills.',
    },
    solution: 'Money market (under a year): the 13-week bill, the 60-day commercial paper and the overnight interbank loan. Capital market: common stock (no maturity), the 12-year corporate bond and the 5-year Treasury note.',
  },
  {
    id: 'f00-fm-g3', type: 'steps', kind: 'numerical',
    prompt: 'Coastline Bank pays Ana 1.5% a year on her savings and charges Lantern 6% a year on its $10,000 loan. Work out what the bank earns from the spread on $10,000 for one year.',
    solution: 'Spread: 6 − 1.5 = 4.5 percentage points. Lantern pays 10,000 × 6% = $600 a year. Paying savers 1.5% on $10,000 of deposits costs 10,000 × 1.5% = $150. Gross margin: 600 − 150 = $450, which equals 10,000 × 4.5%. It must cover the bank’s costs and bad loans before any profit.',
    steps: [
      { id: 'f00-fm-g3-s1', type: 'num',
        prompt: 'What is the spread, in percentage points?',
        answer: 4.5, check: () => 6 - 1.5, unit: 'percentage points', places: 1, tol: 0.01,
        hints: ['Use s = r<sub>L</sub> − r<sub>D</sub>.', 'Lending rate minus deposit rate.'],
        wrong: [{ value: 7.5, say: 'You added the two rates. The spread is the gap between them: subtract the deposit rate from the lending rate.' }, { value: 4, say: 'Check the subtraction: 6 − 1.5 = 4.5.' }] },
      { id: 'f00-fm-g3-s2', type: 'num',
        prompt: 'How much interest does Lantern pay Coastline in a year?',
        answer: 600, check: () => 10000 * 0.06, unit: '$', places: 0, tol: 0.5,
        hints: ['Interest for a year = amount × annual rate.', '10,000 × 0.06.'],
        wrong: [{ value: 150, say: 'That is one quarter’s payment. Lantern pays $150 every three months, which is $600 a year.' }] },
      { id: 'f00-fm-g3-s3', type: 'num',
        prompt: 'If the bank funds the loan with $10,000 of deposits paying 1.5%, what is its gross interest margin for the year?',
        answer: 450, check: () => 10000 * 0.06 - 10000 * 0.015, unit: '$', places: 0, tol: 0.5,
        hints: ['Interest received minus interest paid.', 'Savers receive 10,000 × 1.5% = $150.'],
        wrong: [{ value: 600, say: 'That is the interest received. Subtract what the bank pays its savers.' }, { value: 750, say: 'You added the savers’ interest. The bank pays it out, so subtract it.' }] },
    ],
  },
  {
    id: 'f00-fm-g4', type: 'mc', kind: 'conceptual',
    prompt: 'A manufacturer wants to protect itself against a rise in the euro over the next 90 days by fixing an exchange rate with its bank, for an amount and date that match one particular invoice. Where is this contract most likely to be agreed, and why?',
    options: [
      'Over the counter with its bank, because the amount and date are tailored to one invoice',
      'On a stock exchange, because exchanges list currencies like shares',
      'In the primary market, because the manufacturer is raising new money',
      'In the money market, because the contract is shorter than one year',
    ],
    answer: 0,
    hints: [
      'Exchanges trade standardised products; is this one standard?',
      'A forward contract fitted to one firm’s invoice is negotiated between two parties.',
    ],
    feedback: {
      1: 'Stock exchanges list shares, not currency forwards. Foreign exchange trades almost entirely over the counter.',
      2: 'No money is raised: the forward moves currency risk from the manufacturer to the bank. Primary and secondary describe securities being issued or resold.',
      3: 'The money market is for short-term borrowing and lending. A currency forward is a derivative used for hedging, whatever its length.',
    },
    solution: 'A currency forward for one invoice’s amount and date is a tailored derivative, so it is negotiated over the counter with a bank. It raises no money; it fixes the dollar cost and so hedges the manufacturer’s currency risk.',
  },
];

export const independent = [
  {
    id: 'f00-fm-i1', type: 'mc', kind: 'applied',
    prompt: 'A wheat farmer wants to fix today the price at which she will sell her harvest in five months, without selling the wheat now. Which market is she most likely to use?',
    options: ['The derivatives market, by selling wheat futures', 'The equity market, by buying shares in a flour mill', 'The money market, by buying Treasury bills', 'The primary bond market, by issuing a bond'],
    answer: 0,
    feedback: {
      1: 'Shares in a mill might rise or fall for many reasons; they do not fix the price of her wheat.',
      2: 'Treasury bills give her a safe place for cash. They do nothing about the price of wheat.',
      3: 'Issuing a bond raises money. Her problem is price risk, not a shortage of money.',
    },
    solution: 'A futures contract fixes a price today for delivery later. By selling wheat futures, the farmer locks in her selling price: if wheat falls, the gain on the futures offsets the lower price of her crop. That is hedging in the derivatives market.',
  },
  {
    id: 'f00-fm-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional US online retailer receives £25,000 from a British customer and converts it to dollars at $1.27 per pound. How many dollars does it receive?',
    answer: 31750, check: () => 25000 * 1.27, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 19685.04, say: 'You divided. The rate is in dollars per pound, so multiply the pounds by the rate.' },
      { value: 25000, say: 'That is the amount in pounds. Convert it with dollars = pounds × dollars per pound.' },
    ],
    solution: 'Use A<sub>$</sub> = A<sub>F</sub> × S, with S in dollars per pound: 25,000 × 1.27 = $31,750.',
  },
  {
    id: 'f00-fm-i3', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these are jobs that financial markets do? Select all that apply.',
    options: [
      'Channel savings to people and firms who can invest them',
      'Produce prices that reflect what many investors know and expect',
      'Let investors turn their claims into cash before the borrower repays',
      'Let risk pass to those most willing to bear it',
      'Guarantee that every investor earns a positive return',
      'Remove risk from the economy altogether',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'Markets price risk; they do not remove it. Investors can and do lose money.',
      5: 'Risk is moved and spread, not destroyed. A hedger’s risk goes to whoever takes the other side.',
    },
    solution: 'The four jobs are moving savings to investment, price discovery, liquidity and risk sharing. Markets guarantee no one a return, and they move risk rather than eliminating it.',
  },
  {
    id: 'f00-fm-i4', type: 'mc', kind: 'applied',
    prompt: 'Harbourline Roasters needs $8 million for six months, every autumn, to buy green coffee before its busy winter season, and repays it from winter sales. Which source of money fits this need best?',
    options: [
      'Short-term borrowing, such as commercial paper or a short-term bank loan',
      'A 30-year bond',
      'Issuing new shares',
      'Selling some of its existing shares held by investors in the secondary market',
    ],
    answer: 0,
    feedback: {
      1: 'A 30-year bond would leave Harbourline paying interest for decades on money it needs for six months.',
      2: 'New shares are a permanent claim on the company, a costly way to fund a need that reverses every spring.',
      3: 'Harbourline does not own the shares investors hold, and a secondary-market trade raises no money for the company.',
    },
    solution: 'Match the life of the money to the life of the need. A six-month, self-repaying need fits short-term borrowing: commercial paper in the money market if Harbourline is large and highly rated, or a short-term bank loan.',
  },
  {
    id: 'f00-fm-i5', type: 'num', kind: 'numerical',
    prompt: 'An investor buys 300 Harbourline shares at $42.50 each from another investor on a stock exchange. How many dollars does Harbourline Roasters receive from this trade?',
    answer: 0, check: () => 300 * 42.5 * 0, unit: '$', places: 0, tol: 0.5,
    wrong: [{ value: 12750, say: 'That is what the buyer pays: 300 × $42.50. It goes to the selling investor. Harbourline is paid only when it issues new shares.' }],
    solution: 'Nothing. This is a secondary-market trade: the buyer’s $12,750 (300 × 42.50) goes to the seller. Harbourline receives money only in the primary market.',
  },
];

export const check = [
  {
    id: 'f00-fm-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What distinguishes indirect finance from direct finance?',
    options: [
      'In indirect finance the saver holds a claim on an intermediary, which in turn holds the claim on the borrower',
      'In indirect finance the saver never earns interest',
      'Indirect finance takes place only in the money market',
      'In indirect finance the borrower sells its own securities to savers through an exchange',
    ],
    answer: 0,
    feedback: {
      1: 'Depositors and fund investors do earn a return; it is paid by the intermediary, not by the borrower.',
      2: 'Banks make loans of every length, from overnight to many years.',
      3: 'That describes direct finance: savers holding the borrower’s own securities.',
    },
    solution: 'In direct finance the saver buys the borrower’s own security. In indirect finance an intermediary (bank, insurer, fund) takes the saver’s money, provides it to borrowers, and gives the saver a different claim (a deposit, a policy, a fund share).',
  },
  {
    id: 'f00-fm-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional credit union pays 2% a year on deposits and lends $200,000 to local businesses at 7.5% a year, funded by $200,000 of deposits. What is its gross interest margin for one year, in dollars?',
    answer: 11000, check: () => 200000 * (0.075 - 0.02), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 15000, say: 'That is the interest received. Subtract the $4,000 paid to depositors.' },
      { value: 19000, say: 'You added the two interest amounts. The margin is interest received minus interest paid.' },
      { value: 5.5, say: 'That is the spread in percentage points. Multiply it by the $200,000 to get dollars.' },
    ],
    solution: 'Spread = 7.5 − 2 = 5.5 percentage points. Margin = 200,000 × 5.5% = $11,000 (or 15,000 received − 4,000 paid).',
  },
  {
    id: 'f00-fm-k3', type: 'mc', kind: 'applied',
    prompt: 'A university’s treasurer has $5 million that will be needed in seven weeks to pay salaries. Which choice fits best?',
    options: [
      'Treasury bills maturing before the salaries are due',
      'Shares in a stock-market index fund',
      'A ten-year corporate bond',
      'Coffee futures',
    ],
    answer: 0,
    feedback: {
      1: 'Share prices can fall sharply in seven weeks, and the money must be there in full.',
      2: 'A ten-year bond would have to be sold before maturity, at whatever price the market offers then.',
      3: 'Futures move commodity price risk; they are not a place to keep cash.',
    },
    solution: 'Money needed soon belongs in the money market: Treasury bills are short-term, liquid and carry almost no default risk, and they can mature just before the salaries are due.',
  },
  {
    id: 'f00-fm-k4', type: 'classify', kind: 'conceptual',
    prompt: 'Which market does each activity belong to?',
    items: [
      'A tourist changes dollars into yen',
      'An airline agrees a contract fixing the price of next year’s jet fuel',
      'A city sells bonds to pay for a new bridge',
      'A pension fund buys shares in a listed roaster',
      'A chocolate maker buys cocoa beans for delivery this week',
    ],
    categories: ['Equity market', 'Bond market', 'Foreign-exchange market', 'Commodity market (spot)', 'Derivatives market'],
    answer: [2, 4, 1, 0, 3],
    feedback: {
      1: 'A contract that fixes a future price is a derivative (a forward or future), even though the underlying is a commodity.',
      2: 'Bonds are debt: the city borrows from the investors who buy them.',
      4: 'Buying the beans themselves for immediate delivery is a spot purchase in the commodity market, not a derivative.',
    },
    solution: 'Dollars into yen: foreign exchange. Fixing next year’s fuel price: derivatives. The city’s bonds: bond market. Shares in a roaster: equity market. Cocoa for delivery this week: the commodity spot market.',
  },
  {
    id: 'f00-fm-k5', type: 'num', kind: 'numerical',
    prompt: 'Kestrel Storage (fictional) owes a supplier €12,000. The exchange rate is $1.08 per euro. What does the invoice cost in dollars?',
    answer: 12960, check: () => 12000 * 1.08, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 11111.11, say: 'You divided. The rate is dollars per euro, so dollars = euros × rate.' },
      { value: 12000, say: 'That is the amount in euros. Convert it at $1.08 per euro.' },
    ],
    solution: 'A<sub>$</sub> = A<sub>F</sub> × S = 12,000 × 1.08 = $12,960.',
  },
  {
    id: 'f00-fm-k6', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement about over-the-counter (OTC) markets is correct?',
    options: [
      'Trades are negotiated between two parties, usually with a dealer, and suit products too varied for an exchange, such as many bonds and currency forwards',
      'OTC trading is illegal in the United States',
      'OTC markets trade only standardised contracts with prices visible to everyone',
      'Every OTC trade raises new money for the issuer',
    ],
    answer: 0,
    feedback: {
      1: 'OTC trading is legal and regulated; broker-dealers that trade securities are supervised. OTC describes how trades are made, not their legality.',
      2: 'That describes an exchange. OTC markets are where non-standard products trade, and prices are often known only to the two parties.',
      3: 'Most OTC trades are resales or derivatives; neither raises money for an issuer.',
    },
    solution: 'In an OTC market there is no central marketplace: trades are negotiated between two parties, usually with a dealer quoting prices. It suits instruments that are varied or tailored, such as bonds and currency forwards; most foreign exchange trades this way.',
  },
];
