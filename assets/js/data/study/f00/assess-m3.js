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
    prompt: 'A fictional US café chain buys a Japanese coffee roaster priced at ¥1,500,000. The exchange rate is $0.0068 per yen. What does the roaster cost in dollars?',
    answer: 10200, check: () => 1500000 * 0.0068, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 220588235.29, say: 'You divided by the rate. It is quoted in dollars per yen, so multiply the yen amount by it.' },
      { value: 1500000, say: 'That is the price in yen. Convert it at $0.0068 per yen.' },
    ],
    solution: 'A<sub>$</sub> = A<sub>F</sub> × S = 1,500,000 × 0.0068 = $10,200.',
  },
  {
    id: 'f00-m3-3', lesson: 'financial-markets', type: 'classify', kind: 'applied',
    prompt: 'Match each financing need to the market that suits it, following the rule of matching the life of the money to the life of the use.',
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
    prompt: 'At one FDIC-insured bank, a fictional company organised as a corporation has $380,000 in its business account, and its owner has $90,000 in a savings account in her own name. She has no other accounts there. How much of the $470,000 in total is uninsured?',
    answer: 130000, check: () => (380000 - Math.min(380000, 250000)) + (90000 - Math.min(90000, 250000)), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 220000, say: 'You applied one $250,000 limit to the total. A corporation’s deposits are insured separately from its owner’s personal deposits.' },
      { value: 0, say: 'The company’s $380,000 is above its own $250,000 limit.' },
    ],
    solution: 'The company and the owner are in different ownership categories, insured separately. Company: 380,000 − 250,000 = $130,000 uninsured. Owner: $90,000, all insured. Total uninsured: $130,000.',
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
    id: 'f00-m3-6', lesson: 'market-participants', type: 'num', kind: 'applied',
    prompt: 'A fictional medical-devices company sells 12 million new shares in its IPO at $25 each, with an underwriting spread of 5.5%. What are its net proceeds before its other costs, in millions of dollars?',
    answer: 283.5, check: () => 12 * 25 * (1 - 0.055), unit: '$ million', places: 1, tol: 0.05,
    wrong: [
      { value: 300, say: 'That is the gross proceeds. The underwriters keep 5.5% of it.' },
      { value: 16.5, say: 'That is the underwriters’ spread. The company receives the rest.' },
    ],
    solution: 'Net proceeds = N × P × (1 − g) = 12 × 25 × 0.945 = $283.5 million. The underwriters keep 300 × 0.055 = $16.5 million.',
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
    prompt: 'A fictional company owes its bank $40,000 at year end. A risky plan will leave it worth $90,000 with probability 40% or $10,000 with probability 60%. What is the shareholders’ expected payoff under the risky plan?',
    answer: 20000, check: () => 0.4 * Math.max(90000 - 40000, 0) + 0.6 * Math.max(10000 - 40000, 0), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 2000, say: 'You let the shareholders’ payoff go negative in the bad outcome. With limited liability it is max(V − D, 0) = 0 there.' },
      { value: 42000, say: 'That is the company’s expected value, 0.4 × 90,000 + 0.6 × 10,000. Shareholders get only what is left after the $40,000 debt.' },
    ],
    solution: 'Good outcome: max(90,000 − 40,000, 0) = 50,000. Bad outcome: max(10,000 − 40,000, 0) = 0. Expected: 0.4 × 50,000 + 0.6 × 0 = $20,000. The bank expects 0.4 × 40,000 + 0.6 × 10,000 = $22,000, and the two add up to the company’s expected value of $42,000.',
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
