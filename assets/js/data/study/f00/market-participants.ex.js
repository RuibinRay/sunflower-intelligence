// market-participants.ex.js — F00 · Market participants: widget, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).

const money = (v) => {
  const c = Math.round(Math.abs(v) * 100) / 100;
  const s = Number.isInteger(c) ? c.toLocaleString('en-US') : c.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${v < 0 && c !== 0 ? '−' : ''}$${s}`;
};

export const widgets = {
  'mp-dealer': {
    type: 'formula',
    title: 'A market maker’s quote',
    intro: 'Set the midpoint price, the spread the dealer quotes, the size of a typical trade and how many times a day investors buy from and sell to the dealer.',
    inputs: [
      { id: 'mid', label: 'Midpoint price', min: 5, max: 100, step: 0.5, value: 42.5, fmt: 'money' },
      { id: 'cents', label: 'Spread', min: 1, max: 100, step: 1, value: 4, fmt: 'int', unit: 'cents' },
      { id: 'shares', label: 'Shares per trade', min: 100, max: 5000, step: 100, value: 500, fmt: 'int', unit: 'shares' },
      { id: 'trips', label: 'Round trips a day (one buy and one sell)', min: 10, max: 2000, step: 10, value: 400, fmt: 'int' },
    ],
    compute: (v) => {
      const spread = v.cents / 100;
      const bid = v.mid - spread / 2;
      const ask = v.mid + spread / 2;
      const rel = (spread / v.mid) * 100;
      const perTrip = spread * v.shares;
      const perDay = perTrip * v.trips;
      const relText = rel < 0.1 ? rel.toFixed(3) : rel.toFixed(2);
      let note;
      if (rel >= 1) {
        note = `A relative spread of ${relText}% is wide: an investor who buys and soon sells loses 1% or more to the dealer before the price moves at all. Spreads this wide are typical of rarely traded securities, where the dealer may hold its inventory for days.`;
      } else if (rel >= 0.2) {
        note = `At ${relText}% the spread is moderate. Each investor round trip of ${v.shares.toLocaleString('en-US')} shares costs ${money(perTrip)}; the dealer earns that in return for standing ready to trade and carrying the risk that prices move against its inventory.`;
      } else {
        note = `At ${relText}% the spread is narrow, as for heavily traded shares. Each round trip earns the dealer only ${money(perTrip)}, so it needs many trades a day: here ${v.trips.toLocaleString('en-US')} round trips give ${money(perDay)} before its costs and any losses on inventory.`;
      }
      return {
        headline: { label: 'Relative spread', value: `${relText}%` },
        rows: [
          ['Bid (dealer buys at)', money(bid)],
          ['Ask (dealer sells at)', money(ask)],
          ['Investor’s cost of one round trip', money(perTrip)],
          ['Dealer’s gross spread income per day', money(perDay)],
        ],
        note,
      };
    },
  },
};

export const guided = [
  {
    id: 'f00-mp-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Match each description to the participant it describes.',
    items: [
      'Takes deposits, makes loans and provides payment services for households and firms',
      'Manages and sells a company’s new share issue and advises on acquisitions',
      'Invests contributions now to pay retirement income decades later',
      'Sells its shares to investors and buys them back at the NAV calculated once a day',
      'Has shares that trade on an exchange all day at market prices',
      'A private fund for wealthy investors that may use leverage and short selling',
    ],
    categories: ['Hedge fund', 'Mutual fund', 'Commercial bank', 'Exchange-traded fund', 'Investment bank', 'Pension fund'],
    answer: [2, 4, 5, 1, 3, 0],
    hints: [
      'Start with the two banks: one deals with depositors, the other with issuers of securities.',
      'The two kinds of public fund differ in how investors trade: with the fund at NAV, or with each other on an exchange.',
    ],
    feedback: {
      1: 'Underwriting new issues and advising on deals is investment banking. A commercial bank lends from deposits.',
      3: 'Trading with the fund itself at the end-of-day NAV is how a mutual fund works.',
      4: 'An ETF’s shares change hands between investors on an exchange throughout the day.',
      5: 'A private fund open only to wealthy or sophisticated investors, free to use leverage and short selling, is a hedge fund.',
    },
    solution: 'Deposits, loans and payments: commercial bank. New issues and acquisitions advice: investment bank. Retirement income decades later: pension fund. Trades with investors at the daily NAV: mutual fund. Shares traded on an exchange all day: ETF. Private, leveraged, for wealthy investors: hedge fund.',
  },
  {
    id: 'f00-mp-g2', type: 'steps', kind: 'numerical',
    prompt: 'A market maker quotes a fictional company’s shares at $18.40 bid and $18.46 ask. Work out what trading costs an investor.',
    solution: 'Spread = 18.46 − 18.40 = $0.06. Buying 1,000 shares at the ask and selling them straight back at the bid costs 1,000 × 0.06 = $60. Midpoint = (18.40 + 18.46) ÷ 2 = 18.43, so the relative spread is 0.06 ÷ 18.43 ≈ 0.33%.',
    steps: [
      { id: 'f00-mp-g2-s1', type: 'num',
        prompt: 'What is the bid-ask spread per share, in dollars?',
        answer: 0.06, check: () => 18.46 - 18.40, unit: '$', places: 2, tol: 0.001,
        hints: ['Spread = ask − bid.', '18.46 − 18.40.'],
        wrong: [{ value: -0.06, say: 'The ask (the dealer’s selling price) is the higher of the two. Subtract the bid from the ask.' }] },
      { id: 'f00-mp-g2-s2', type: 'num',
        prompt: 'An investor buys 1,000 shares at the ask and immediately sells them at the bid. How much does the round trip cost?',
        answer: 60, check: () => 1000 * (18.46 - 18.40), unit: '$', places: 0, tol: 0.5,
        hints: ['She pays the ask and receives the bid.', 'Cost = shares × spread.'],
        wrong: [{ value: 18460, say: 'That is what she pays to buy. The cost of the round trip is what she pays minus what she gets back when she sells.' }] },
      { id: 'f00-mp-g2-s3', type: 'num',
        prompt: 'What is the relative spread (spread ÷ midpoint), as a percentage to two decimal places?',
        answer: 0.33, check: () => ((18.46 - 18.40) / ((18.46 + 18.40) / 2)) * 100, unit: '%', places: 2, tol: 0.006,
        hints: ['Midpoint = (bid + ask) ÷ 2 = 18.43.', '0.06 ÷ 18.43, then × 100.'],
        wrong: [{ value: 0.0033, say: 'That is the decimal. Multiply by 100 to express it as a percentage.' }] },
    ],
  },
  {
    id: 'f00-mp-g3', type: 'steps', kind: 'applied',
    prompt: 'Marisol (fictional) has, at one FDIC-insured bank, a savings account of $150,000 and a certificate of deposit of $130,000, both in her own name, plus a joint account of $300,000 that she owns equally with her husband. Work out what is insured.',
    solution: 'Her single accounts are combined: 150,000 + 130,000 = $280,000, insured up to $250,000, leaving $30,000 uninsured. The joint account is insured up to $250,000 per co-owner; each co-owner’s share is $150,000, so all $300,000 is insured.',
    steps: [
      { id: 'f00-mp-g3-s1', type: 'num',
        prompt: 'How much of her single-ownership deposits is insured?',
        answer: 250000, check: () => Math.min(150000 + 130000, 250000), unit: '$', places: 0, tol: 0.5,
        hints: ['Accounts in the same ownership category at the same bank are added together first.', 'Combined: $280,000. Apply the $250,000 limit.'],
        wrong: [{ value: 280000, say: 'Each account is not insured separately: both are single accounts at one bank, so they share one $250,000 limit.' }] },
      { id: 'f00-mp-g3-s2', type: 'num',
        prompt: 'How much of her single-ownership deposits is uninsured?',
        answer: 30000, check: () => 150000 + 130000 - 250000, unit: '$', places: 0, tol: 0.5,
        hints: ['Uninsured = combined balance − insured amount.'],
        wrong: [{ value: 0, say: 'Combined, her single accounts hold $280,000, which is above the $250,000 limit.' }] },
      { id: 'f00-mp-g3-s3', type: 'num',
        prompt: 'How much of the $300,000 joint account is insured?',
        answer: 300000, check: () => 2 * Math.min(300000 / 2, 250000), unit: '$', places: 0, tol: 0.5,
        hints: ['Joint accounts are insured up to $250,000 per co-owner.', 'Each owns $150,000.'],
        wrong: [{ value: 250000, say: 'The joint limit is $250,000 for each co-owner’s share, not for the account. Each share is $150,000, under the limit.' }] },
    ],
  },
  {
    id: 'f00-mp-g4', type: 'mc', kind: 'conceptual',
    prompt: 'A firm sells you 100 bonds out of its own inventory at its quoted ask price and charges no commission. In this trade, what role is it playing?',
    options: ['Dealer (a principal), earning the spread', 'Broker (an agent), earning a commission', 'Underwriter, earning an underwriting spread', 'Regulator, supervising the trade'],
    answer: 0,
    hints: ['Did the bonds come from the firm’s own holdings, or did it find another investor to sell them?', 'Trading from inventory means acting as a principal.'],
    feedback: {
      1: 'A broker finds the other side for you and does not own the securities. Here the bonds came from the firm’s own inventory.',
      2: 'Underwriting means selling a new issue for an issuer. These bonds were already in the firm’s inventory, so this is secondary-market dealing.',
      3: 'Regulators such as the SEC and FINRA write and enforce rules; they do not sell bonds.',
    },
    solution: 'Selling from its own inventory at its ask price makes the firm a dealer, acting as a principal. It is paid through the gap between the price at which it buys (its bid) and the price at which it sells (its ask), not by a commission.',
  },
];

export const independent = [
  {
    id: 'f00-mp-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional bond fund holds assets worth $86.4 million and owes $0.4 million. It has 4 million shares outstanding. What is its NAV per share?',
    answer: 21.5, check: () => (86.4 - 0.4) / 4, unit: '$', places: 2, tol: 0.005,
    wrong: [
      { value: 21.6, say: 'You used assets only. Subtract the fund’s liabilities first.' },
      { value: 21.7, say: 'You added the liabilities. NAV is assets minus liabilities.' },
    ],
    solution: 'NAV per share = (assets − liabilities) ÷ shares = (86.4 − 0.4) ÷ 4 = $21.50.',
  },
  {
    id: 'f00-mp-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional software company sells 5 million new shares at $22 each, and its underwriters’ spread is 6.5%. What are the company’s net proceeds before its other costs, in millions of dollars?',
    answer: 102.85, check: () => 5 * 22 * (1 - 0.065), unit: '$ million', places: 2, tol: 0.01,
    wrong: [
      { value: 110, say: 'That is the gross proceeds, 5 million × $22. The underwriters keep 6.5% of it.' },
      { value: 7.15, say: 'That is the underwriters’ spread. Subtract it from the gross proceeds.' },
    ],
    solution: 'Net proceeds = N × P × (1 − g) = 5 × 22 × 0.935 = $102.85 million. The underwriters keep 110 × 0.065 = $7.15 million.',
  },
  {
    id: 'f00-mp-i3', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these, held at an FDIC-insured bank, are covered by FDIC deposit insurance (up to the limits)? Select all that apply.',
    options: ['A checking account', 'A certificate of deposit', 'A money market deposit account', 'Shares of a mutual fund bought through the bank', 'A Treasury bill held through the bank', 'An annuity sold by the bank'],
    answer: [0, 1, 2],
    feedback: {
      3: 'Mutual funds are investments, not deposits, and are not FDIC-insured even when sold by a bank.',
      4: 'Treasury securities are debts of the federal government, not deposits; FDIC insurance does not cover them.',
      5: 'Annuities are insurance products, not deposits, so FDIC insurance does not cover them.',
    },
    solution: 'FDIC insurance covers deposits: checking, savings, money market deposit accounts and certificates of deposit. It does not cover mutual funds, Treasury securities, annuities, shares, bonds or crypto assets, even when an insured bank sells them.',
  },
  {
    id: 'f00-mp-i4', type: 'classify', kind: 'conceptual',
    prompt: 'Which US body does each job?',
    items: [
      'Sets monetary policy through its Open Market Committee',
      'Insures bank deposits and handles failed banks',
      'Requires companies selling securities to the public to disclose the truth about their business',
      'Acts as the frontline regulator of broker-dealers, under SEC oversight',
      'Regulates futures markets and most swaps',
    ],
    categories: ['FINRA', 'CFTC', 'Federal Reserve', 'SEC', 'FDIC'],
    answer: [2, 4, 3, 0, 1],
    feedback: {
      1: 'Deposit insurance is the FDIC’s job, not the Federal Reserve’s.',
      3: 'FINRA is a self-regulatory organisation that supervises broker-dealers day to day; the SEC oversees FINRA.',
      4: 'Futures and most swaps are the CFTC’s responsibility (options on shares and security-based swaps fall under the SEC).',
    },
    solution: 'Monetary policy: Federal Reserve (FOMC). Deposit insurance and failed banks: FDIC. Disclosure by issuers: SEC. Broker-dealers day to day: FINRA, overseen by the SEC. Futures and most swaps: CFTC.',
  },
  {
    id: 'f00-mp-i5', type: 'num', kind: 'numerical',
    prompt: 'A fictional hedge fund charges a 2% management fee on the amount invested at the start of the year and a 20% performance fee on the year’s profit before fees. An investor puts in $1,000,000, and the investment grows to $1,150,000 before fees. Using this simplified fee rule, what is the investor’s profit after both fees?',
    answer: 100000, check: () => (1150000 - 1000000) - 0.02 * 1000000 - 0.2 * (1150000 - 1000000), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 150000, say: 'That is the profit before fees. Subtract the $20,000 management fee and the $30,000 performance fee.' },
      { value: 120000, say: 'You took off only the performance fee. The 2% management fee ($20,000) is charged as well.' },
      { value: 130000, say: 'You took off only the management fee. The performance fee, 20% of $150,000, is $30,000.' },
    ],
    solution: 'Profit before fees: 1,150,000 − 1,000,000 = $150,000. Management fee: 2% × 1,000,000 = $20,000. Performance fee: 20% × 150,000 = $30,000. Profit after fees: 150,000 − 20,000 − 30,000 = $100,000. The fees take a third of the gain. Real funds calculate fees in various ways; the rule here is simplified.',
  },
  {
    id: 'f00-mp-i6', type: 'mc', kind: 'applied',
    prompt: 'A fast-growing clothing brand wants to sell shares to the public for the first time. Which participant will run the sale for it?',
    options: ['An investment bank acting as underwriter', 'A commercial bank’s lending department', 'The SEC', 'A market maker in its shares'],
    answer: 0,
    feedback: {
      1: 'A commercial bank could lend to the brand, but selling new shares to the public is underwriting, an investment-banking job.',
      2: 'The brand must register the offering with the SEC, but the SEC neither sells shares nor judges whether they are a good investment.',
      3: 'Market makers quote prices once shares are trading in the secondary market; the first sale is run by the underwriters.',
    },
    solution: 'An IPO is managed and sold by investment banks acting as underwriters. They gather investors’ interest, help set the price and sell the shares, keeping the underwriting spread. The brand also files a registration statement with the SEC, and once the shares trade, market makers quote them.',
  },
];

export const check = [
  {
    id: 'f00-mp-k1', type: 'mc', kind: 'conceptual',
    prompt: 'How does buying a mutual fund differ from buying an exchange-traded fund?',
    options: [
      'Mutual fund shares are bought from the fund at the NAV calculated after the day’s close; ETF shares are bought from other investors on an exchange at market prices during the day',
      'Mutual funds are FDIC-insured and ETFs are not',
      'ETF shares can be sold back only to the fund at the end of each quarter',
      'Mutual funds may invest only in bonds, and ETFs only in shares',
    ],
    answer: 0,
    feedback: {
      1: 'Neither is FDIC-insured. Both are investments whose value can fall.',
      2: 'ETF shares trade on an exchange throughout the day, so investors can sell them whenever the exchange is open.',
      3: 'Both kinds of fund can hold shares, bonds or a mix.',
    },
    solution: 'A mutual fund sells and redeems its own shares at the NAV calculated once each business day, typically after the major exchanges close. An ETF’s shares trade on a stock exchange throughout the day at market prices, which may differ slightly from its NAV.',
  },
  {
    id: 'f00-mp-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional company, organised as a corporation, has $600,000 in its business account at one FDIC-insured bank and no other accounts there. How much of the balance is uninsured?',
    answer: 350000, check: () => 600000 - Math.min(600000, 250000), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 250000, say: 'That is the insured amount. The question asks for the part above the limit.' },
      { value: 0, say: 'A corporation’s deposits are insured up to $250,000 at each bank, so $600,000 is well above the limit.' },
    ],
    solution: 'Corporation accounts at one bank are combined and insured up to $250,000. Uninsured = 600,000 − 250,000 = $350,000.',
  },
  {
    id: 'f00-mp-k3', type: 'mc', kind: 'applied',
    prompt: 'Ana considers buying shares of an ETF through a brokerage firm that is a SIPC member. Which statement about her protection is correct?',
    options: [
      'If the brokerage firm fails and her ETF shares are missing, SIPC protection applies up to its limits; if the ETF only falls in value, no protection applies',
      'FDIC insurance covers the ETF up to $250,000, as it covers her savings account',
      'SIPC reimburses her if the ETF falls in value',
      'Because ETFs are registered with the SEC, the SEC guarantees she will not lose money',
    ],
    answer: 0,
    feedback: {
      1: 'FDIC insurance covers bank deposits only. ETFs are not insured by the FDIC or any other government agency.',
      2: 'SIPC does not protect against a decline in the value of securities; it covers missing assets when a member brokerage fails.',
      3: 'Registration requires disclosure; it is not a guarantee, and the SEC does not judge an investment’s merits.',
    },
    solution: 'SIPC protects customers of a failed member brokerage whose securities or cash are missing, up to $500,000 including $250,000 for cash. It does not cover market losses. FDIC insurance applies to deposits at banks, not to ETFs.',
  },
  {
    id: 'f00-mp-k4', type: 'num', kind: 'numerical',
    prompt: 'A dealer quotes a thinly traded share at $9.95 bid and $10.05 ask. What does an investor lose by buying 2,000 shares at the ask and selling them straight back at the bid?',
    answer: 200, check: () => 2000 * (10.05 - 9.95), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 0.1, say: 'That is the spread per share. Multiply by the 2,000 shares.' },
      { value: 100, say: 'You used half the spread. A round trip pays the ask and receives the bid, so the whole $0.10 per share is lost.' },
    ],
    solution: 'Round-trip cost = shares × (ask − bid) = 2,000 × 0.10 = $200. The relative spread is 0.10 ÷ 10.00 = 1%, wide because the share trades rarely.',
  },
  {
    id: 'f00-mp-k5', type: 'mc', kind: 'conceptual',
    prompt: 'What does a market maker do?',
    options: [
      'Stands ready to buy a security at its bid and sell it at its ask, earning the spread and providing liquidity',
      'Matches buyers and sellers without ever owning the security, earning a commission',
      'Decides which companies may list on an exchange',
      'Sets the price of a new share issue for the issuer',
    ],
    answer: 0,
    feedback: {
      1: 'That describes a broker. A market maker is a dealer that trades from its own inventory.',
      2: 'Listing decisions belong to the exchange under its rules, not to market makers.',
      3: 'Pricing a new issue is the underwriters’ job, with the issuer.',
    },
    solution: 'A market maker is a dealer that continuously quotes a bid and an ask and trades from its own inventory. Its reward is the spread; its risk is that prices move against what it holds. By always being willing to trade, it gives the market liquidity.',
  },
  {
    id: 'f00-mp-k6', type: 'mc', kind: 'conceptual',
    prompt: 'Which of these is a job of the FDIC rather than of the Federal Reserve?',
    options: [
      'Insuring deposits up to $250,000 per depositor, per insured bank, per ownership category',
      'Setting monetary policy in pursuit of maximum employment, stable prices and moderate long-term interest rates',
      'Lending to depository institutions in sound condition through the discount window',
      'Helping operate and oversee the nation’s payments systems',
    ],
    answer: 0,
    feedback: {
      1: 'Monetary policy is set by the Federal Reserve’s Open Market Committee.',
      2: 'The discount window is the Federal Reserve’s lending facility for depository institutions.',
      3: 'The payments system role belongs to the Federal Reserve.',
    },
    solution: 'The FDIC insures deposits and handles failed banks. The Federal Reserve conducts monetary policy, lends to depository institutions through the discount window, supervises banks, supports financial stability and helps run the payments system.',
  },
];
