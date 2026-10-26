// competitor-research.ex.js — M04 · Competitor research: widgets, practice and the knowledge check (answer keys live
// here). Ana's shelf-price audit (PRICE_AUDIT) and Brewline's catering facts come from case.js (Brewline via M01); the
// rival juice brand is fictional. Formula items are marked by their results on the sheet and on copies with the numbers
// changed; num items recompute their answers. Not the office market or its competitors (the project's).
import { PRICE_AUDIT, COMPETITORS, tableCells } from './case.js?v=19';

const BRANDS = PRICE_AUDIT.brands;
const CH_LABEL = { supermarket: 'Supermarket', convenience: 'Convenience', natural: 'Natural grocer' };
const CHANNELS = ['Supermarket', 'Convenience', 'Natural grocer'];
/** The audit as one row per shelf price (24 rows): store, channel, brand, shelf price, promotion. */
const AUD_COLS = ['store', 'channel', 'brand', 'shelf_price', 'promotion'];
const AUD_ROWS = PRICE_AUDIT.stores.flatMap((s) => s.prices.map((p, j) => (p == null ? null : [s.id, CH_LABEL[s.channel], BRANDS[j], p, s.promo && s.promo[j] ? 'Yes' : 'No']))).filter(Boolean);
const audit = () => tableCells(AUD_COLS, AUD_ROWS).cells;            // A1:E25
const LAST = AUD_ROWS.length + 1;                                      // 25
const brandCells = (head) => ({ G1: 'Brand', H1: head, G2: BRANDS[0], G3: BRANDS[1], G4: BRANDS[2] });
const AUD_FORMATS = { D: '$0.00', H: '$0.00', I: '$0.00', J: '$0.00', K: '$0.00' };
const AUD_WIDTHS = { A: 7, B: 14, C: 16, D: 11, E: 10, G: 16, H: 14, I: 14, J: 14, K: 11, L: 9 };

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const priceOf = (store, brand) => PRICE_AUDIT.stores.find((s) => s.id === store).prices[BRANDS.indexOf(brand)];
const usual = Object.fromEntries(COMPETITORS.map((c) => [c.name, c.price]));
const summitRegOther = mean(['S1', 'S3', 'S4'].map((s) => priceOf(s, 'Summit Brew')));
const sel = (f) => AUD_ROWS.filter(f).map((r) => r[3]);
const avgBC = (b, c) => mean(sel((r) => r[2] === b && r[1] === c));
const m2 = (x) => (Math.round(x * 100 + 1e-9) / 100).toFixed(2);

export const widgets = {
  'cr-pivot': {
    type: 'pivot', title: 'Ana’s shelf-price audit, 15–19 March 2027: 24 prices of a single 250 ml can (fictional)',
    records: AUD_ROWS.map(([store, channel, brand, price, promo]) => ({ Store: store, Channel: channel, Brand: brand, Promotion: promo, 'Shelf price': price, Prices: 1 })),
    fields: ['Brand', 'Channel', 'Store', 'Promotion'],
    values: ['Shelf price', 'Prices'],
    defaults: { rows: 'Brand', cols: 'Channel', value: 'Shelf price', agg: 'average', show: 'value' },
    order: { Brand: BRANDS, Channel: CHANNELS },
    formats: { 'Shelf price': '$0.00', Prices: '#,##0' },
    note: 'Empty cells are brands a channel doesn’t stock: Daily Grind RTD isn’t in natural grocers and Arcadia Coffee isn’t in convenience stores, which is why the grand-total column mixes different channels for each brand. Prices is 1 for every observation, so its Sum counts the stores where a brand was recorded.',
  },
  'cr-sheet': {
    type: 'sheet', title: 'The audit as a worksheet, with conditional summaries',
    sheet: { cells: {
      ...audit(),
      G1: 'Brand', H1: 'Average', I1: 'Regular only', J1: 'Lowest', K1: 'Highest', L1: 'Stores',
      ...Object.fromEntries(BRANDS.flatMap((b, i) => { const r = i + 2; return [
        [`G${r}`, b],
        [`H${r}`, `=AVERAGEIFS($D$2:$D$${LAST},$C$2:$C$${LAST},G${r})`],
        [`I${r}`, `=AVERAGEIFS($D$2:$D$${LAST},$C$2:$C$${LAST},G${r},$E$2:$E$${LAST},"No")`],
        [`J${r}`, `=MINIFS($D$2:$D$${LAST},$C$2:$C$${LAST},G${r})`],
        [`K${r}`, `=MAXIFS($D$2:$D$${LAST},$C$2:$C$${LAST},G${r})`],
        [`L${r}`, `=COUNTIFS($C$2:$C$${LAST},G${r})`],
      ]; })),
      G7: 'Average by channel', H7: CHANNELS[0], I7: CHANNELS[1], J7: CHANNELS[2],
      ...Object.fromEntries(BRANDS.flatMap((b, i) => { const r = i + 8; return [[`G${r}`, b], ...['H', 'I', 'J'].map((c) => [`${c}${r}`, `=IFERROR(AVERAGEIFS($D$2:$D$${LAST},$C$2:$C$${LAST},$G${r},$B$2:$B$${LAST},${c}$7),"")`])]; })),
      G12: 'Promoted prices recorded', H12: `=COUNTIFS($E$2:$E$${LAST},"Yes")`,
    } },
    view: `A1:L${LAST}`, maxHeight: '26rem', widths: AUD_WIDTHS, formats: { ...AUD_FORMATS, L: '0', H12: '0' },
    editable: `D2:E${LAST}`, mark: ['H2:K4', 'H8:J10'],
    tools: ['formulas', 'reset'],
    note: 'H2:L4 summarise each brand across all stores; H8:J10 by brand and channel, blank where a brand isn’t stocked (IFERROR catches AVERAGEIFS’s #DIV/0!). Set E6 to “No” and watch Daily Grind’s regular-only average in I3 fall to its all-store average, or change D5 to 3.79 and see Summit’s supermarket average in H8 rise by 5 cents.',
  },
};

export const guided = [
  {
    id: 'm04-cr-g1', type: 'formula', kind: 'numerical',
    prompt: 'Ana’s audit, one row per shelf price: brands in C2:C25 and prices in D2:D25. In H2, calculate the average shelf price of the brand in G2 across all the stores audited, so that the formula can be filled down to H4 for the other two brands.',
    sheet: { cells: { ...audit(), ...brandCells('Average shelf price') } },
    cell: 'H2', fill: 'H2:H4', answer: '=AVERAGEIFS($D$2:$D$25,$C$2:$C$25,G2)',
    alt: ['=AVERAGEIF($C$2:$C$25,G2,$D$2:$D$25)', '=AVERAGEIFS(D:D,C:C,G2)', '=AVERAGEIF(C:C,G2,D:D)', '=AVERAGEIFS($D$2:$D$25,$C$2:$C$25,$G2)'],
    view: 'A1:H25', widths: AUD_WIDTHS, formats: AUD_FORMATS,
    wrong: [
      { formula: '=AVERAGEIFS($D$2:$D$25,$C$2:$C$25,"Summit Brew")', say: 'The brand is typed into the formula, so every row of H2:H4 shows Summit Brew’s average. Refer to G2 instead.' },
      { formula: '=AVERAGE($D$2:$D$25)', say: 'That averages all 24 prices, every brand together. Add the condition: only the rows whose brand matches G2.' },
      { formula: '=AVERAGEIFS($D$2:$D$25,$B$2:$B$25,G2)', say: 'Column B holds the channel, not the brand: the criteria range is C2:C25.' },
    ],
    hints: ['AVERAGEIFS(average_range, criteria_range, criteria): average D where C equals the brand in G2.', '<x>=AVERAGEIFS($D$2:$D$25,$C$2:$C$25,G2)</x>, with the ranges anchored for the fill.'],
    solution: `<x>=AVERAGEIFS($D$2:$D$25,$C$2:$C$25,G2)</x> gives $${m2(mean(sel((r) => r[2] === BRANDS[0])))} for Summit Brew (10 prices), $${m2(mean(sel((r) => r[2] === BRANDS[1])))} for Daily Grind RTD (7) and $${m2(mean(sel((r) => r[2] === BRANDS[2])))} for Arcadia Coffee (7). The ranges are anchored so that only G2 moves as the formula is filled down.`,
  },
  {
    id: 'm04-cr-g2', type: 'steps', kind: 'applied',
    prompt: 'In the audited supermarkets Arcadia Coffee averaged $2.89 and Summit Brew $3.715 (including one promoted price). Lantern Cold Brew is planned at $3.49. Place it against the two rivals.',
    solution: 'Premium over Arcadia: (3.49 − 2.89) ÷ 2.89 = 20.8%. Below Summit: (3.715 − 3.49) ÷ 3.715 = 6.1%. Lantern sits between the mid-priced and the premium brand, much nearer the premium one.',
    steps: [
      {
        id: 'm04-cr-g2-s1', type: 'num',
        prompt: 'What is Lantern’s price premium over Arcadia Coffee in supermarkets, as a percentage of Arcadia’s price? One decimal place.',
        answer: 20.8, check: () => (3.49 / 2.89 - 1) * 100, unit: '%', places: 1, tol: 0.1,
        wrong: [
          { value: (3.49 - 2.89) / 3.49 * 100, say: 'That measures the $0.60 gap against Lantern’s price. A premium over a rival is measured against the rival’s price, $2.89.' },
          { value: 60, say: 'That is the gap in cents. Divide it by Arcadia’s price for a percentage.' },
        ],
        hints: ['Premium = (own price − rival’s price) ÷ rival’s price × 100.', '(3.49 − 2.89) ÷ 2.89 × 100'],
        solution: '(3.49 − 2.89) ÷ 2.89 × 100 = 0.60 ÷ 2.89 × 100 ≈ 20.8%.',
      },
      {
        id: 'm04-cr-g2-s2', type: 'num',
        prompt: 'By what percentage of Summit Brew’s supermarket average is $3.49 below it? Give the percentage as a positive number, one decimal place.',
        answer: 6.1, check: () => (3.715 - 3.49) / 3.715 * 100, unit: '%', places: 1, tol: 0.05,
        wrong: [
          { value: (3.715 - 3.49) / 3.49 * 100, say: 'That measures the gap against Lantern’s price. Measure it against Summit’s, $3.715.' },
          { value: (3.79 - 3.49) / 3.79 * 100, say: 'That uses Summit’s usual price in M02, $3.79. The audit’s supermarket average, $3.715, is what shoppers met that week.' },
        ],
        hints: ['(Summit’s price − Lantern’s) ÷ Summit’s price × 100.', '(3.715 − 3.49) ÷ 3.715 × 100'],
        solution: '(3.715 − 3.49) ÷ 3.715 × 100 = 0.225 ÷ 3.715 × 100 ≈ 6.1% below Summit.',
      },
      {
        id: 'm04-cr-g2-s3', type: 'mc',
        prompt: 'What do the two figures say about where $3.49 sits in supermarkets?',
        options: [
          'Between the mid-priced brand and the premium brand, much nearer the premium one: a price that claims quality.',
          'Above both rivals’ supermarket prices, so the audit suggests that Lantern would be the dearest can on the shelf.',
          'Close to the value brand, Daily Grind, so Lantern would be seen as a cheap alternative to the established brands.',
          'Exactly halfway between Arcadia and Summit, which is the safest position for a brand that is new to the shelf.',
        ],
        answer: 0,
        feedback: {
          1: 'Summit averaged $3.715 in supermarkets, above $3.49. Lantern would be the second-dearest of the four.',
          2: 'Daily Grind averaged $2.19 in supermarkets, $1.30 below Lantern.',
          3: 'Halfway would be about $3.30. Lantern is 60 cents above Arcadia and about 22 cents below Summit.',
        },
        hints: ['Which rival is $3.49 closer to?'],
      },
    ],
  },
  {
    id: 'm04-cr-g3', type: 'classify', kind: 'conceptual',
    prompt: 'Match each source of competitor information to what it shows best.',
    items: [
      'A rival’s job advertisements for van drivers and a regional sales manager',
      'A rival’s price list on its website',
      'Online reviews of a rival’s service',
      'A listed rival’s annual report',
      'Calls with prospects who chose a rival over you',
      'A shelf-price audit in twelve stores',
    ],
    categories: ['Plans and expansion', 'Published prices', 'Prices and promotions actually charged', 'Customers’ experience, from a self-selected sample', 'Resources and performance', 'Why buyers chose the rival'],
    answer: [0, 1, 3, 4, 5, 2],
    feedback: {
      0: 'Hiring drivers and a regional manager signals expansion before any announcement.',
      2: 'Reviews show what customers liked or disliked, but the reviewers chose themselves, so they aren’t a sample of all customers.',
      5: 'An audit records what is on the shelf, promotions included, not the list price.',
    },
    hints: ['Ask what each source sees: the rival’s plans, its claims, its shelves, its customers or its accounts.'],
    solution: 'Job advertisements: plans. Price list: published prices. Reviews: customers’ experience, from a self-selected sample. Annual report: resources and performance. Win–loss calls: why buyers chose the rival. Shelf-price audit: prices and promotions actually charged.',
  },
  {
    id: 'm04-cr-g4', type: 'mc', kind: 'applied',
    prompt: 'Ana’s audit marked two prices as promotions but recorded only the promoted price. On her next audit, what should she record when a can is on promotion?',
    options: [
      'The promoted price and the regular price on the shelf label, so that the depth of each promotion can be measured.',
      'Only the regular price from the brand’s own website, so that the promotions don’t distort the averages she reports.',
      'Nothing for that brand, because a promoted price isn’t typical and would push that store’s average price upwards.',
      'The promoted price only, then a second visit to that store the following week to note the regular price it returns to.',
    ],
    answer: 0,
    feedback: {
      1: 'A website price may not be the shelf price, and dropping the promoted price loses the promotion itself, which is evidence of the rival’s strategy.',
      2: 'A promotion pulls the price down, not up, and leaving it out loses the evidence of how deeply and how often the rival promotes.',
      3: 'The promotion may run longer than a week, and the regular price can change in the meantime. Record both on the same visit.',
    },
    hints: ['What would she need to work out the promotion depth?'],
    solution: 'Record both prices on the same visit: the promoted price shoppers pay and the regular price on the label. Then the audit gives regular averages, promoted prices, and the depth of each promotion, (regular − promoted) ÷ regular.',
  },
];

export const independent = [
  {
    id: 'm04-cr-i1', type: 'formula', kind: 'numerical',
    prompt: 'The audit again, with promotions marked “Yes” or “No” in E2:E25. In H2, calculate the average regular (not promoted) shelf price of the brand in G2, so that the formula can be filled down to H4.',
    sheet: { cells: { ...audit(), ...brandCells('Average regular price') } },
    cell: 'H2', fill: 'H2:H4', answer: '=AVERAGEIFS($D$2:$D$25,$C$2:$C$25,G2,$E$2:$E$25,"No")',
    alt: ['=AVERAGEIFS($D$2:$D$25,$E$2:$E$25,"No",$C$2:$C$25,G2)', '=AVERAGEIFS(D:D,C:C,G2,E:E,"No")', '=AVERAGEIFS($D$2:$D$25,$C$2:$C$25,G2,$E$2:$E$25,"<>Yes")'],
    view: 'A1:H25', widths: AUD_WIDTHS, formats: AUD_FORMATS,
    wrong: [
      { formula: '=AVERAGEIFS($D$2:$D$25,$C$2:$C$25,G2)', say: 'That includes the two promoted prices. Add a second condition: promotion is “No”.' },
      { formula: '=AVERAGEIFS($D$2:$D$25,$C$2:$C$25,G2,$E$2:$E$25,"Yes")', say: 'That averages the promoted prices only. Regular prices are the rows marked “No”.' },
      { formula: '=AVERAGEIFS($D$2:$D$25,$E$2:$E$25,"No")', say: 'That is the regular average of all three brands together. Keep the brand condition too.' },
    ],
    solution: `<x>=AVERAGEIFS($D$2:$D$25,$C$2:$C$25,G2,$E$2:$E$25,"No")</x>: Summit Brew $${m2(mean(sel((r) => r[2] === BRANDS[0] && r[4] === 'No')))} (9 regular prices), Daily Grind RTD $${m2(mean(sel((r) => r[2] === BRANDS[1] && r[4] === 'No')))} (6), Arcadia Coffee $${m2(mean(sel((r) => r[2] === BRANDS[2] && r[4] === 'No')))} (no promotions, so unchanged).`,
  },
  {
    id: 'm04-cr-i2', type: 'formula', kind: 'numerical',
    prompt: 'In H2, calculate the range of the brand in G2’s shelf prices across the audit (its highest price minus its lowest), so that the formula can be filled down to H4.',
    sheet: { cells: { ...audit(), ...brandCells('Price range') } },
    cell: 'H2', fill: 'H2:H4', answer: '=MAXIFS($D$2:$D$25,$C$2:$C$25,G2)-MINIFS($D$2:$D$25,$C$2:$C$25,G2)',
    alt: ['=MAXIFS(D:D,C:C,G2)-MINIFS(D:D,C:C,G2)', '=-(MINIFS($D$2:$D$25,$C$2:$C$25,G2)-MAXIFS($D$2:$D$25,$C$2:$C$25,G2))'],
    view: 'A1:H25', widths: AUD_WIDTHS, formats: AUD_FORMATS,
    wrong: [
      { formula: '=MAX($D$2:$D$25)-MIN($D$2:$D$25)', say: 'That is the range of all 24 prices, every brand together. Use MAXIFS and MINIFS with the brand in G2.' },
      { formula: '=MAXIFS($D$2:$D$25,$C$2:$C$25,G2)', say: 'That is the brand’s highest price. The range subtracts its lowest, MINIFS.' },
      { formula: '=MINIFS($D$2:$D$25,$C$2:$C$25,G2)-MAXIFS($D$2:$D$25,$C$2:$C$25,G2)', say: 'The subtraction is the wrong way round: highest minus lowest, so the range is positive.' },
    ],
    solution: '<x>=MAXIFS($D$2:$D$25,$C$2:$C$25,G2)-MINIFS($D$2:$D$25,$C$2:$C$25,G2)</x>: Summit Brew $4.19 − $3.59 = $0.60, Daily Grind RTD $2.59 − $1.99 = $0.60, Arcadia Coffee $3.09 − $2.79 = $0.30. Two of the extremes are promotions and two are convenience-store prices, so a range mixes channels and promotions just as an average does.',
  },
  {
    id: 'm04-cr-i3', type: 'num', kind: 'numerical',
    prompt: 'A rival juice brand (fictional) sells the same juice in a 330 ml bottle at $2.79 and a 1-litre carton at $5.49. Per 100 ml, how much cheaper is the carton than the bottle, in cents? Give one decimal place.',
    answer: 29.6, check: () => (2.79 / 330 * 100 - 5.49 / 1000 * 100) * 100, unit: 'cents per 100 ml', places: 1, tol: 0.1,
    wrong: [
      { value: (5.49 - 2.79) * 100, say: 'That compares the pack prices: the carton costs $2.70 more, but it holds three times as much. Convert both to a price per 100 ml first.' },
      { value: (2.79 / 330 - 5.49 / 1000) * 100, say: 'That is the difference per millilitre, in cents. Multiply by 100 for the difference per 100 ml.' },
      { value: (1 - (5.49 / 1000) / (2.79 / 330)) * 100, say: 'That is the carton’s discount as a percentage of the bottle’s unit price. The question asks for the difference in cents.' },
    ],
    solution: 'Bottle: $2.79 ÷ 330 × 100 ≈ $0.845 per 100 ml. Carton: $5.49 ÷ 1,000 × 100 = $0.549 per 100 ml. The carton is about 29.6 cents cheaper per 100 ml, roughly 35% less.',
  },
  {
    id: 'm04-cr-i4', type: 'classify', kind: 'applied',
    prompt: 'Under the MRS and ESOMAR guidance, SCIP’s code and the law on trade secrets, is each of these ways of researching competitors acceptable?',
    items: [
      'Buying a rival’s canned coffee in several stores and testing its taste and caffeine content',
      'Visiting a rival café as an ordinary customer, buying a drink and noting the price and the wait, without recording the staff',
      'Phoning a rival caterer as a fictitious event organiser to get a detailed quote for an event that will never happen',
      'Secretly filming a rival’s staff during a mystery visit, to review their service afterwards',
      'Asking a new employee who used to work for a rival to bring a copy of its client list',
      'Reading a rival’s job advertisements and its published annual report',
      'Interviewing a rival’s sales manager at a trade show after giving your name and your employer',
    ],
    categories: ['Acceptable', 'Not acceptable'],
    answer: [0, 0, 1, 1, 1, 0, 0],
    feedback: {
      0: 'Observing, studying or testing a product made available to the public is lawful acquisition, and no one is misled.',
      1: 'Mystery shopping of competitors is allowed with conditions: a normal customer visit, no identifying or recording the staff, results in aggregate.',
      2: 'A detailed quote makes a rival’s staff do real work for a sale that will never happen, more than a normal enquiry, and it is sought under a false identity, which SCIP’s code forbids.',
      3: 'MRS’s guidelines say a competitor’s staff must not be recorded in any way.',
      4: 'Inducing someone to break a duty of confidence to obtain a trade secret is improper means in law.',
      6: 'SCIP’s code requires you to disclose your identity and organisation before an interview; done openly, it is ordinary trade-show conversation.',
    },
    solution: 'Acceptable: testing a product bought on the open market, an ordinary customer visit without recording staff, reading public job advertisements and reports, and an interview in which you say who you are. Not acceptable: a fictitious enquiry that makes a rival prepare a detailed quote for a sale that will never happen, covert recording of a rival’s staff, and inducing a former employee to bring confidential documents.',
  },
  {
    id: 'm04-cr-i5', type: 'multi', kind: 'applied',
    prompt: 'Lantern’s benchmark against Brewline Catering: $9.00 a head against $7.50; baristas against self-serve urns and pod machines; smaller against larger; five bids lost to Brewline in 2026, all on price; Brewline adding a second van to serve Lantern’s district. Select all the implications that follow from this evidence.',
    options: [
      'Lantern won’t win buyers who choose mainly on price unless it cuts its price or its costs.',
      'The baristas are a difference only if clients see and value them, so proposals should show what they add.',
      'Brewline’s second van is a threat to watch in Lantern’s district, through its job advertisements and its bids.',
      'Lantern should match Brewline’s $7.50, because five lost bids prove that most clients choose mainly on price.',
      'Brewline must be less profitable than Lantern, because it charges $1.50 a head less for its catering.',
      'The benchmark proves Brewline’s service is worse than Lantern’s, because it sends no baristas to events.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Five lost bids show that some buyers choose on price; Lantern’s current clients chose it for quality. Matching the price would give up the difference without evidence that it is needed.',
      4: 'Price isn’t profit. Brewline’s costs are unknown, and urns and pods without baristas may cost much less to run.',
      5: 'Different isn’t worse. Clients who chose Brewline judged its offer good value; only buyers can say which they prefer.',
    },
    solution: 'The evidence supports three implications: price-led buyers are hard to win at $9.00, the barista difference must be made visible to count, and Brewline’s expansion is a threat to monitor. It doesn’t show that most clients choose on price, that Brewline is less profitable, or that its service is worse.',
  },
  {
    id: 'm04-cr-i6', type: 'order', kind: 'conceptual',
    prompt: 'Put the steps of a shelf-price audit in order.',
    items: [
      'Decide what the audit is for, and which brands, pack sizes and channels it must cover.',
      'Choose the stores in each channel and the week of the visits, and note how the stores were chosen.',
      'Prepare a recording form: shelf price, regular price if on promotion, pack size, facings, out-of-stocks.',
      'Visit every store in the same week and record the prices as shoppers see them.',
      'Check and enter the data, one row per price, with promotions flagged.',
      'Summarise by brand within each channel, with regular and promoted prices kept apart.',
      'Draw the implications for your own price and plan the next audit.',
    ],
    solution: 'Purpose first, because it decides what to record; then the stores and the week; the form; the visits; clean data in long format; summaries within channels with promotions separated; and finally the implications, including when to repeat the audit.',
  },
];

export const check = [
  {
    id: 'm04-cr-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Ana’s audit found Summit Brew averaging $3.87 across the ten stores she visited. Which statement can she make?',
    options: [
      'In the ten stores she visited that week Summit averaged $3.87; they weren’t chosen at random, so it describes them.',
      'She can be 95% confident that Summit’s average shelf price across every Harbour City store is within a few cents of $3.87.',
      'Summit’s shelf prices in Harbour City average $3.87, so Summit can afford to cut its price when Lantern launches.',
      'Summit is stocked in all ten of the stores she visited, so it must have the largest market share of the three brands.',
    ],
    answer: 0,
    feedback: {
      1: 'A confidence interval for the city needs stores drawn at random from a list of all stores. Ten stores chosen by the researcher give no such interval.',
      2: 'The audit says nothing about Summit’s costs or margins, so it can’t say what price cut Summit could afford.',
      3: 'Being stocked widely isn’t the same as selling the most. Market share needs sales volumes, which the audit doesn’t record.',
    },
    solution: 'The audit describes the stores visited in that week. Without a random sample it supports no margin of error for the whole city, and it records prices, not sales, costs or shares.',
  },
  {
    id: 'm04-cr-k2', type: 'formula', kind: 'numerical',
    prompt: 'The audit again, with channels in B2:B25. In H8, calculate the average shelf price of the brand in G8 in the channel named in H7, so that the formula can be filled across and down to J10. Where a brand isn’t stocked in a channel, the cell should be blank (<x>""</x>): test for that case with COUNTIFS, or wrap the formula in <x>IFERROR(…,"")</x>.',
    sheet: { cells: { ...audit(), G7: 'Average by channel', H7: CHANNELS[0], I7: CHANNELS[1], J7: CHANNELS[2], G8: BRANDS[0], G9: BRANDS[1], G10: BRANDS[2] } },
    cell: 'H8', fill: 'H8:J10', answer: '=IFERROR(AVERAGEIFS($D$2:$D$25,$C$2:$C$25,$G8,$B$2:$B$25,H$7),"")',
    alt: ['=IF(COUNTIFS($C$2:$C$25,$G8,$B$2:$B$25,H$7)=0,"",AVERAGEIFS($D$2:$D$25,$C$2:$C$25,$G8,$B$2:$B$25,H$7))', '=IFERROR(AVERAGEIFS($D$2:$D$25,$B$2:$B$25,H$7,$C$2:$C$25,$G8),"")', '=IFERROR(AVERAGEIFS($D:$D,$C:$C,$G8,$B:$B,H$7),"")'],
    view: 'A1:J25', widths: AUD_WIDTHS, formats: AUD_FORMATS,
    wrong: [
      { formula: '=AVERAGEIFS($D$2:$D$25,$C$2:$C$25,$G8,$B$2:$B$25,H$7)', say: 'Right where a brand is stocked, but AVERAGEIFS gives #DIV/0! where it isn’t (Daily Grind in natural grocers, Arcadia in convenience stores). Test for that case with COUNTIFS, or wrap the formula in <x>IFERROR(…,"")</x>.' },
      { formula: '=IFERROR(AVERAGEIFS(D2:D25,C2:C25,G8,B2:B25,H7),"")', say: 'Filled across and down, the relative ranges slide off the data. Anchor the ranges fully, the brand’s column ($G8) and the channel’s row (H$7).' },
      { formula: '=IFERROR(AVERAGEIFS($D$2:$D$25,$C$2:$C$25,$G8,$B$2:$B$25,$H$7),"")', say: '$H$7 keeps every column on supermarkets. Anchor only the row, H$7, so the channel changes across the grid.' },
    ],
    solution: '<x>=IFERROR(AVERAGEIFS($D$2:$D$25,$C$2:$C$25,$G8,$B$2:$B$25,H$7),"")</x>. Summit Brew: $3.72, $4.06, $3.89; Daily Grind RTD: $2.19, $2.52, blank; Arcadia Coffee: $2.89, blank, $3.02. The mixed references ($G8 and H$7) let one formula fill the whole grid. Testing for the case you expect works too, and says why a cell is blank: <x>=IF(COUNTIFS($C$2:$C$25,$G8,$B$2:$B$25,H$7)=0,"",AVERAGEIFS($D$2:$D$25,$C$2:$C$25,$G8,$B$2:$B$25,H$7))</x>.',
  },
  {
    id: 'm04-cr-k3', type: 'num', kind: 'numerical',
    prompt: 'At store S2, Summit Brew was on promotion at $3.59. Taking its regular supermarket price to be the average of its prices in the other three audited supermarkets ($3.79, $3.79 and $3.69), what was the depth of the promotion? Give the percentage to one decimal place.',
    answer: 4.4, check: () => (summitRegOther - priceOf('S2', 'Summit Brew')) / summitRegOther * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: (usual['Summit Brew'] - 3.59) / usual['Summit Brew'] * 100, say: 'That uses Summit’s usual price in M02, $3.79. The question takes the regular price as the other three supermarkets’ average, $3.757.' },
      { value: (summitRegOther - 3.59) / 3.59 * 100, say: 'That measures the cut against the promoted price. Depth is measured against the regular price.' },
      { value: (summitRegOther - 3.59) * 100, say: 'That is the cut in cents. Divide by the regular price for the depth.' },
    ],
    solution: `Regular price: (3.79 + 3.79 + 3.69) ÷ 3 = $${summitRegOther.toFixed(3)}. Depth = (${summitRegOther.toFixed(3)} − 3.59) ÷ ${summitRegOther.toFixed(3)} × 100 ≈ 4.4%. Against M02’s usual $3.79 it would be 5.3%: the depth depends on the regular price you compare with, which is why an audit should record it on the shelf.`,
  },
  {
    id: 'm04-cr-k4', type: 'mc', kind: 'applied',
    prompt: 'Ana wants to know what Brewline Catering charges its larger clients. Which approach is acceptable under the professional codes and the law?',
    options: [
      'Ask the five organisations that chose Brewline what decided it, and what they were quoted if they are free to say.',
      'Ask a friend at another firm to request a full quote from Brewline for a 200-person event that won’t happen.',
      'Offer one of Brewline’s staff a fee for a copy of its current price schedule for its larger and regular clients.',
      'Have a researcher phone Brewline’s account manager, posing as a prospective client, and ask what discounts it gives.',
    ],
    answer: 0,
    feedback: {
      1: 'A fictitious enquiry for an event that will never happen makes Brewline’s staff prepare a full quote, more than the normal enquiry MRS and ESOMAR allow, under a false pretext.',
      2: 'Paying an employee for a confidential document is bribery to obtain what may be a trade secret: improper means in law.',
      3: 'MRS’s guidelines allow a short competitor enquiry with safeguards, but questioning an account manager under a false identity breaches SCIP’s rule to disclose who you are before an interview, and if the discount terms are a trade secret, misrepresentation is improper means.',
    },
    solution: 'Win–loss calls with the buyers are honest: they choose what to tell, and what they were quoted is theirs to share unless they agreed to keep it confidential. The other three rely on a false pretext, a false identity or a payment to obtain information Brewline keeps private.',
  },
  {
    id: 'm04-cr-k5', type: 'multi', kind: 'applied',
    prompt: `Which conclusions about Lantern Cold Brew’s $3.49 does Ana’s audit support? Select all that apply. (Summit Brew averaged $${m2(avgBC('Summit Brew', 'Supermarket'))} in supermarkets, $${m2(avgBC('Summit Brew', 'Convenience'))} in convenience stores and $${m2(avgBC('Summit Brew', 'Natural grocer'))} in natural grocers; Arcadia Coffee $${m2(avgBC('Arcadia Coffee', 'Natural grocer'))} in natural grocers.)`,
    options: [
      '$3.49 is below Summit Brew’s average in every channel audited.',
      'In natural grocers, $3.49 is about 47 cents above Arcadia Coffee and 40 cents below Summit Brew.',
      'Two of the 24 prices were promotions at one supermarket, so one week can’t show how often rivals promote.',
      'Because $3.49 is cheaper than Summit, Lantern will win shoppers from Summit Brew.',
      'Daily Grind’s buyers will pay $3.49, because the gap to Daily Grind is only about a dollar.',
      'The audit shows that the city’s average shelf price for a can of ready-to-drink coffee is $3.15.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'The audit shows where prices sit, not how shoppers respond. Whether Summit’s buyers switch is a question for price-response research or a trial.',
      4: 'The gap in supermarkets is about $1.30, and one focus-group remark that a dollar more needs a reason isn’t evidence that buyers will pay it.',
      5: 'The audit’s $3.15 is a simple average of 24 prices in ten stores not chosen at random. It describes those shelves, not the city.',
    },
    solution: 'The audit supports statements about the shelves it saw: $3.49 is below Summit everywhere, between Arcadia and Summit in natural grocers, and the two promotions in one week say little about promotion frequency. It can’t predict switching, willingness to pay or a city-wide average.',
  },
  {
    id: 'm04-cr-k6', type: 'classify', kind: 'conceptual',
    prompt: 'A brand manager has gathered these facts about a rival canned-coffee brand (fictional). Classify each by what it tells her about the rival.',
    items: [
      'It now sells three flavours in 250 ml cans and a four-pack',
      'Its cans are on the shelf in every supermarket she checked',
      'It is running sampling stands in two supermarkets this month',
      'It cut its shelf price by 20 cents in one supermarket chain',
      'Its annual report shows revenue up 8% and a new production line',
      'It is advertising for a key-account manager for natural grocers',
    ],
    categories: ['Offer', 'Price', 'Distribution', 'Promotion', 'Resources and performance', 'Plans'],
    answer: [0, 2, 3, 1, 4, 5],
    feedback: {
      2: 'Sampling stands are promotion: they buy trial, as M02’s promotion mix describes.',
      3: 'A temporary cut on the shelf is a price fact, and if it is funded by the brand it is also a trade promotion; record it as price, with its depth.',
      5: 'A job advertisement says what the rival intends to do next: a push into natural grocers.',
    },
    solution: 'Range and pack: offer. Where it is stocked: distribution. Sampling: promotion. A price cut: price. Revenue and capacity: resources and performance. A key-account manager for natural grocers: plans.',
  },
];
