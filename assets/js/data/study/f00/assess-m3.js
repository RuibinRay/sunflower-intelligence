// assess-m3.js — F00 module 3 test: Markets and the people in them (financial-markets, market-participants, governance-and-agency).
// No hints. Each item has a full solution, shown when the student reviews the test. Companies and people are fictional
// unless they are real institutions (SEC, FDIC, Federal Reserve, FINRA), about which only verified facts are stated.

export const items = [
  {
    id: 'f00-m3-1', lesson: 'financial-markets', type: 'mc', kind: 'conceptual',
    prompt: 'Harbourline Roasters receives no money when its existing shares change hands on a stock exchange. Why does the company still care how easily and at what price its shares trade there?',
    options: [
      'Because investors accept a lower return on securities they can sell easily, and secondary-market prices set the terms of Harbourline’s next share issue',
      'Because Harbourline receives a small commission on every secondary-market trade',
      'Because secondary-market prices fix the interest rate on Harbourline’s bank loans by law',
      'It does not: only the primary market matters to an issuer',
    ],
    answer: 0,
    feedback: {
      1: 'Commissions go to brokers, not to the company whose shares are traded.',
      2: 'No law ties loan rates to the share price. The link is indirect: prices tell the company what investors demand.',
      3: 'The secondary market raises no money directly, but liquidity and prices there affect what new securities cost the issuer.',
    },
    solution: 'Liquidity in the secondary market makes investors willing to pay more for new securities, and the prices there show what investors think the company is worth and what return they demand. Both set the cost of Harbourline’s next primary-market issue.',
  },
  {
    id: 'f00-m3-2', lesson: 'financial-markets', type: 'num', kind: 'numerical',
    prompt: 'A fictional US coffee caterer buys a roasting machine from Japan priced at ¥1,470,000. Its bank quotes the exchange rate as ¥147 per US dollar. What does the machine cost in dollars?',
    answer: 10000, check: () => 1470000 / 147, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 216090000, say: 'You multiplied. This rate is quoted as yen per dollar, the other way round from dollars per yen, so divide the yen amount by it.' },
      { value: 1470000, say: 'That is the price in yen. Convert it at ¥147 per dollar.' },
    ],
    solution: 'The rate is yen per dollar, so dollars = yen ÷ rate = 1,470,000 ÷ 147 = $10,000. (Equivalently, the rate is 1 ÷ 147 ≈ $0.0068 per yen, and 1,470,000 × 1 ÷ 147 = $10,000.)',
  },
  {
    id: 'f00-m3-3', lesson: 'financial-markets', type: 'classify', kind: 'applied',
    prompt: 'Match each need to the market that suits it, following the rule of matching the life of the money to the life of the use.',
    items: [
      'A hospital needs money for a new wing it will use for 30 years',
      'A large retailer needs cash for six weeks to stock up before the holidays',
      'A city has spare tax receipts it will spend in two months',
      'A manufacturer is building a factory it expects to run for 15 years',
    ],
    categories: ['Money market', 'Capital market'],
    answer: [1, 0, 0, 1],
    feedback: {
      0: 'A 30-year building needs long-term money: bonds or long-term loans in the capital market.',
      1: 'Six weeks is short-term, so commercial paper or a short-term loan in the money market fits.',
      2: 'Money that will be spent in two months belongs in short-term, liquid instruments such as Treasury bills.',
      3: 'A 15-year factory needs long-term funding, such as bonds or equity.',
    },
    solution: 'Long-lived assets (the hospital wing, the factory) need capital-market funding: bonds, long-term loans or equity. Short-term needs and short-term surpluses (holiday stock, spare receipts) belong in the money market.',
  },
  {
    id: 'f00-m3-4', lesson: 'market-participants', type: 'num', kind: 'numerical',
    prompt: 'A fictional business owner has $310,000 in a savings account in her own name at Bank A and $120,000 in her own name at Bank B. Her company, a corporation, has $200,000 in its business account at Bank A. Both banks are FDIC-insured, and there are no other accounts. How much of the $630,000 in total is uninsured?',
    answer: 60000, check: () => (310000 - Math.min(310000, 250000)) + (120000 - Math.min(120000, 250000)) + (200000 - Math.min(200000, 250000)), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 180000, say: 'You added her two personal balances (430,000) and applied one limit. The limit applies separately at each insured bank.' },
      { value: 260000, say: 'You combined her personal savings with the company’s account at Bank A. A corporation’s deposits are insured separately from its owner’s.' },
      { value: 0, say: 'Her $310,000 at Bank A is in one ownership category at one bank, and it is above the $250,000 limit.' },
    ],
    solution: 'Apply the limit per depositor, per bank, per ownership category. Her single account at Bank A: 310,000 − 250,000 = $60,000 uninsured. Her single account at Bank B: $120,000, all insured. The company’s account at Bank A: $200,000, all insured, separately from her own. Total uninsured: $60,000.',
  },
  {
    id: 'f00-m3-5', lesson: 'market-participants', type: 'mc', kind: 'conceptual',
    prompt: 'A firm finds a seller for your order of 500 shares on an exchange, never owns the shares itself, and charges you a $5 fee. Which role is it playing, and which body is the frontline regulator of firms like it?',
    options: [
      'Broker, acting as your agent; FINRA, under SEC oversight',
      'Dealer, acting as a principal; the FDIC',
      'Market maker; the Federal Reserve',
      'Underwriter; the CFTC',
    ],
    answer: 0,
    feedback: {
      1: 'A dealer trades from its own inventory; this firm never owned the shares. The FDIC insures bank deposits and does not regulate broker-dealers.',
      2: 'A market maker is a dealer quoting its own bid and ask. The Federal Reserve conducts monetary policy and supervises banks.',
      3: 'Underwriters sell new issues for issuers. The CFTC regulates derivatives markets.',
    },
    solution: 'Finding the other side of a client’s trade without owning the securities, for a fee, is broking: the firm is your agent. Broker-dealers are regulated by the SEC and supervised day to day by FINRA, a self-regulatory organisation that the SEC oversees.',
  },
  {
    id: 'f00-m3-6', lesson: 'market-participants', type: 'num', kind: 'numerical',
    prompt: 'A fictional medical-devices company needs $94 million of net proceeds from its IPO, before its other costs. The shares will be offered at $20 each, and the underwriting spread is 6% of the offer price. How many shares must it sell?',
    answer: 5000000, check: () => 94000000 / (20 * (1 - 0.06)), unit: 'shares', places: 0, tol: 500,
    wrong: [
      { value: 4700000, say: 'That ignores the spread: at $20 a share, 4.7 million shares raise $94 million gross, but the underwriters keep 6%. Each share brings the company only 20 × 0.94 = $18.80.' },
      { value: 4982000, say: 'You grossed the share count up by 6% (4.7 million × 1.06). The spread is a fraction of each share’s price, not of the number of shares: divide the $94 million by the $18.80 the company keeps per share.' },
    ],
    solution: 'Net proceeds = N × P × (1 − g), so N = 94,000,000 ÷ (20 × 0.94) = 94,000,000 ÷ 18.80 = 5,000,000 shares. Check: 5,000,000 × 20 = $100 million gross, of which the underwriters keep $6 million.',
  },
  {
    id: 'f00-m3-7', lesson: 'market-participants', type: 'mc', kind: 'applied',
    prompt: 'A retired teacher has $20,000 she may need at short notice next month. Which of these is least suitable for that money?',
    options: [
      'A hedge fund that allows withdrawals only once a quarter after a one-year lock-up',
      'An FDIC-insured savings account',
      'Treasury bills maturing in four weeks',
      'A money market deposit account at an insured bank',
    ],
    answer: 0,
    feedback: {
      1: 'An insured savings account is liquid and protected up to the limit, which suits money needed soon.',
      2: 'Four-week Treasury bills mature when she may need the money and can be sold before then.',
      3: 'A money market deposit account is an insured deposit she can draw on.',
    },
    solution: 'Hedge funds commonly restrict withdrawals to a few times a year and impose lock-ups of a year or more; they are also generally open only to accredited investors or qualified purchasers. Money needed next month belongs in liquid, low-risk places.',
  },
  {
    id: 'f00-m3-8', lesson: 'governance-and-agency', type: 'num', kind: 'numerical',
    prompt: 'A fictional company owes its bank $40,000 in total at year end. Under a safe plan it will be worth $50,000 then. Under a risky plan it will be worth $90,000 with probability 40% or $10,000 with probability 60%. By how much does switching to the risky plan reduce the bank’s expected payoff?',
    answer: 18000, check: () => Math.min(50000, 40000) - (0.4 * Math.min(90000, 40000) + 0.6 * Math.min(10000, 40000)), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 22000, say: 'That is the bank’s expected payoff under the risky plan. The question asks how much lower it is than under the safe plan, where the bank is paid $40,000 in full.' },
      { value: 8000, say: 'That is the fall in the whole company’s expected value (50,000 − 42,000). The bank loses more than that, because shareholders gain.' },
    ],
    solution: 'Safe plan: the bank receives min(50,000, 40,000) = $40,000. Risky plan: 0.4 × min(90,000, 40,000) + 0.6 × min(10,000, 40,000) = 16,000 + 6,000 = $22,000. The bank’s expected payoff falls by 40,000 − 22,000 = $18,000, while shareholders’ expected payoff rises from $10,000 to 0.4 × 50,000 = $20,000 and the company’s expected value falls from $50,000 to $42,000: risk shifting.',
  },
  {
    id: 'f00-m3-9', lesson: 'governance-and-agency', type: 'mc', kind: 'conceptual',
    prompt: 'Why do lenders write covenants into loan agreements?',
    options: [
      'Because once a loan is made, shareholders can gain at the lender’s expense, for example through riskier projects, large dividends or extra borrowing, and covenants restrict those actions',
      'Because covenants guarantee the borrower will make a profit',
      'Because covenants transfer ownership of the company to the lender',
      'Because the law requires every loan to include a minimum current ratio',
    ],
    answer: 0,
    feedback: {
      1: 'No contract can guarantee profit; covenants limit what the borrower may do and require information.',
      2: 'Lenders remain lenders. Covenants give them rights, such as demanding early repayment if a covenant is broken, not ownership.',
      3: 'Covenants are negotiated between borrower and lender; their content varies from loan to loan.',
    },
    solution: 'Shareholders keep the upside above the debt and pass much of the downside to lenders, so after borrowing they may favour risk, pay out cash or borrow more. Covenants (ratio minimums, limits on dividends and new debt, reporting duties) restrict those moves; they are an agency cost of debt.',
  },
  {
    id: 'f00-m3-10', lesson: 'governance-and-agency', type: 'mc', kind: 'applied',
    prompt: 'A board finds that its chief executive, paid a bonus on one year’s net income, delayed maintenance to hit the target. Which change to her pay best addresses the problem?',
    options: [
      'Pay more of it in shares that vest over four years, with targets measured over three years and on several measures',
      'Double the one-year profit bonus so she has an even stronger reason to perform',
      'Replace the bonus with stock options that pay only if the share price rises within six months',
      'Pay a fixed salary with no link to results at all',
    ],
    answer: 0,
    feedback: {
      1: 'A bigger one-year bonus strengthens the very incentive to shift profit between years.',
      2: 'Short-dated options reward short-term share-price moves and risk-taking, a side effect of their own.',
      3: 'A fixed salary removes the short-term bias but also any reason to work for the owners: too little effort and too little risk.',
    },
    solution: 'The side effect comes from a short horizon and a single measure. Shares vesting over several years, multi-year targets and several measures (including ones that timing cannot move) lengthen the chief executive’s horizon and raise her stake, while a clawback policy covers results that are later restated.',
  },
];
