// assess-m3.js — M04 module 3 test: Markets and competitors (market-sizing, competitor-research). New questions on
// new businesses and new angles, not copies of lesson exercises: market definitions that differ, a software firm's
// top-down revenue, a bus route's bottom-up revenue, the listings a target needs, a festival's sensitivity table, a
// gap between routes, the codes on mystery shopping, a hotel's rate check, per-day pass prices, weighing evidence about
// a gym chain, and a like-for-like service comparison. Fenwright Software, Brackenmoor Buses and Saltinghall Festival
// are fictional, as are the other businesses described. No hints; solutions are shown when the student reviews the test.
// Formula items are marked by their results; every num item's `check` recomputes its answer.

// Brackenmoor Buses (fictional): a weekend route
const BUS = { departures: [12, 8], load: [0.55, 0.4], seats: 70, weekends: 50, fare: 4.2 };
const busPassengers = (BUS.departures[0] * BUS.load[0] + BUS.departures[1] * BUS.load[1]) * BUS.seats * BUS.weekends;
// Saltinghall Festival (fictional): one-at-a-time sensitivity of a ticket estimate (central 18,000)
const FEST = [
  ['Share of last year’s visitors who return (55%–75%)', 15200, 20800],
  ['New visitors from advertising (3,000–6,000)', 16500, 19500],
  ['Weather on the main day (wet to dry)', 16000, 19000],
  ['Group bookings (800–1,400)', 17700, 18300],
];
// a city hotel (fictional): rivals' published Saturday rates and whether breakfast is included
const RIVALS = [[129, 'Yes'], [145, 'Yes'], [152, 'No'], [160, 'Yes'], [138, 'No'], [171, 'Yes'], [149, 'No'], [155, 'Yes'], [119, 'Yes'], [189, 'Yes'], [142, 'Yes'], [165, 'No']];
const OWN_RATE = 145;
const rateCells = {
  A1: 'Rival hotel', B1: 'Published rate', C1: 'Breakfast included',
  ...Object.fromEntries(RIVALS.flatMap(([r, b], i) => [[`A${i + 2}`, `Hotel ${String.fromCharCode(65 + i)}`], [`B${i + 2}`, r], [`C${i + 2}`, b]])),
  E1: 'Our rate', F1: OWN_RATE, E3: 'Rivals dearer than us, with breakfast',
};
const fmt = (x) => Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const items = [
  // ---------------------------------------------------------------- market-sizing
  {
    id: 'm04-m3-1', lesson: 'market-sizing', type: 'mc', kind: 'conceptual',
    prompt: 'Two consultancies’ recent reports on the same country’s market for home fitness equipment put its size at $40 million and $120 million a year. Both firms are reputable. What is the most likely explanation, and what should be checked first?',
    options: [
      'They define the market differently (which products, channels or buyers count); compare the definitions first.',
      'One report must contain a calculation error, because a market has only one true size; recalculate both reports first.',
      'The smaller figure is a SOM and the larger a TAM, so the gap is the share of the market that no firm could ever win.',
      'One firm sized it top-down and the other bottom-up, and bottom-up figures always come out about three times smaller.',
    ],
    answer: 0,
    feedback: {
      1: 'Two careful reports can both be right about different markets: with or without commercial gyms, used equipment, online sales or smart devices.',
      2: 'Consultancies’ market sizes describe the whole market, not one firm’s obtainable share; and a SOM is a firm’s estimate, not a gap no one can win.',
      3: 'Neither route is biased in a fixed direction. A gap points to the assumption or definition that differs.',
    },
    solution: 'A market size has four parts: products, customers, place and period, at a stated price level. Reports that disagree by a factor of three usually count different things (equipment for homes only or for gyms too, new or used, retail or producer prices). Read both definitions before using either figure.',
  },
  {
    id: 'm04-m3-2', lesson: 'market-sizing', type: 'num', kind: 'numerical',
    prompt: 'Fenwright Software (fictional) sells appointment software to veterinary practices at $1,200 a year per practice. Its region has 1,400 practices; the software suits only practices with three or more vets, which a trade directory says are 60% of them. Fenwright expects to win 8% of the practices it could serve in its first year. What first-year revenue does that give? Whole dollars.',
    answer: 80640, check: () => 1400 * 0.6 * 0.08 * 1200, unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 1400 * 0.08 * 1200, say: 'That applies the 8% to every practice in the region, the TAM. Fenwright can serve only the 60% with three or more vets: narrow to the SAM first.' },
      { value: 1400 * 0.6 * 1200, say: 'That is the whole serviceable market’s revenue. Fenwright expects to win 8% of it.' },
      { value: 1400 * 0.6 * 0.08, say: 'That is the number of practices Fenwright expects to win. Multiply by the $1,200 a year each pays.' },
    ],
    solution: 'SAM: 1,400 × 0.60 = 840 practices. SOM: 840 × 0.08 = 67.2 practices. Revenue: 67.2 × $1,200 = $80,640. The 8% is the input to test, for instance against how many practices sign up after a demonstration.',
  },
  {
    id: 'm04-m3-3', lesson: 'market-sizing', type: 'formula', kind: 'applied',
    prompt: 'Brackenmoor Buses (fictional) is sizing a weekend route. B2:B3 hold the departures on Saturday and Sunday and C2:C3 the share of seats it expects to fill on each day; B5 holds the seats per bus, B6 the weekends a year and B7 the average fare. In B9, calculate the route’s fare revenue a year.',
    sheet: { cells: {
      A1: 'Day', B1: 'Departures', C1: 'Share of seats filled',
      A2: 'Saturday', B2: BUS.departures[0], C2: BUS.load[0], A3: 'Sunday', B3: BUS.departures[1], C3: BUS.load[1],
      A5: 'Seats per bus', B5: BUS.seats, A6: 'Weekends a year', B6: BUS.weekends, A7: 'Average fare', B7: BUS.fare,
      A9: 'Fare revenue a year',
    } },
    cell: 'B9', answer: '=SUMPRODUCT(B2:B3,C2:C3)*B5*B6*B7',
    alt: ['=(B2*C2+B3*C3)*B5*B6*B7', '=SUMPRODUCT(B2:B3*C2:C3)*B5*B6*B7', '=B5*B6*B7*SUMPRODUCT(B2:B3,C2:C3)'],
    view: 'A1:C9', widths: { A: 18, B: 12, C: 20 }, formats: { C: '0%', B7: '$0.00', B9: '$#,##0' },
    wrong: [
      { formula: '=SUM(B2:B3)*AVERAGE(C2:C3)*B5*B6*B7', say: 'Averaging the two days’ shares gives Sunday’s 8 departures the same weight as Saturday’s 12. Multiply each day’s departures by its own share, then add: SUMPRODUCT.' },
      { formula: '=SUMPRODUCT(B2:B3,C2:C3)*B5*B6', say: 'That is passengers a year. Multiply by the average fare in B7 for revenue.' },
      { formula: '=SUM(B2:B3)*B5*B6*B7', say: 'That assumes every seat on every bus is filled. Use the expected shares in C2:C3.' },
    ],
    solution: `Seat-loads a weekend: 12 × 0.55 + 8 × 0.40 = 9.8; × 70 seats = 686 passengers; × 50 weekends = ${fmt(busPassengers)} passengers a year; × $4.20 = $${fmt(busPassengers * BUS.fare)}. <x>=SUMPRODUCT(B2:B3,C2:C3)*B5*B6*B7</x>.`,
  },
  {
    id: 'm04-m3-4', lesson: 'market-sizing', type: 'num', kind: 'numerical',
    prompt: 'A snack company (fictional) has set a first-year target of 60,000 bars for a new oat-bar flavour. Its distributor expects each store that lists the bar to sell 9 a week, and the bar will be on shelves for 50 weeks of the year. How many stores must list it to reach the target? Round up to a whole store.',
    answer: 134, check: () => Math.ceil(60000 / (9 * 50)), unit: 'stores', places: 0, tol: 0.5,
    wrong: [
      { value: 133, say: '60,000 ÷ 450 = 133.3, and 133 stores would sell only 59,850 bars. A target needs rounding up.' },
      { value: Math.ceil(60000 / (9 * 52)), say: 'The bar is on shelves for 50 weeks, not 52.' },
      { value: Math.ceil(60000 / 9), say: 'That divides by the weekly rate only. Each store sells 9 × 50 = 450 bars a year.' },
    ],
    solution: 'Each listing store sells 9 × 50 = 450 bars a year, so the target needs 60,000 ÷ 450 = 133.3, rounded up to 134 stores. Whether the distributor can deliver 134 listings is the question to ask next.',
  },
  {
    id: 'm04-m3-5', lesson: 'market-sizing', type: 'multi', kind: 'conceptual',
    prompt: 'Saltinghall Festival (fictional) estimates next year’s attendance at 18,000 tickets. The table shows the estimate with each assumption at its low and its high value, the others held at their central values. Select all the conclusions the table supports.',
    data: { table: { head: ['Assumption (low–high)', 'Tickets at low', 'Tickets at high'], rows: FEST.map(([a, l, h]) => [a, fmt(l), fmt(h)]) } },
    options: [
      'The share of returning visitors is the assumption to research first: it moves the estimate most.',
      'Group bookings barely move the estimate, so a rough figure for them is good enough.',
      'With any one assumption off, the estimate stays between about 15,000 and 21,000 tickets.',
      'The festival should plan for 20,800 tickets, the highest value in the table, to be safe.',
      'The swings add up to 12,200 tickets, so attendance is uncertain by 12,200 tickets either way.',
      'The ranking of the assumptions would be the same whatever low and high values were chosen.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'The highest one-at-a-time value is not a safe plan; plan on the central figure and prepare for the range.',
      4: 'Swings are not added: each is the effect of one assumption with the others at their central values.',
      5: 'The ranking depends on the ranges: an assumption given a wider range gets a longer swing. The ranges must be honest.',
    },
    solution: 'The returning-visitor share has the largest swing (5,600 tickets) and group bookings the smallest (600). One assumption at a time, the estimate runs from 15,200 to 20,800. Adding the swings, planning on the highest value, or treating the ranking as independent of the chosen ranges all misread a sensitivity table.',
  },
  {
    id: 'm04-m3-6', lesson: 'market-sizing', type: 'mc', kind: 'applied',
    prompt: 'A language-learning app (fictional) has two first-year estimates. Top-down: 1% of the country’s 5 million adults learning a language, so 50,000 subscribers. Bottom-up: its $400,000 marketing budget at the $50 its pilot campaign spent to win each subscriber, so 8,000. What should it do next?',
    options: [
      'Find the input behind the gap, here the assumed 1% share, and test it against the pilot’s cost per subscriber.',
      'Plan on 29,000 subscribers, the average of the two estimates, since it gives equal weight to both of the methods used.',
      'Plan on 50,000, because the top-down estimate starts from national statistics and is therefore the more objective one.',
      'Plan on 8,000, because a bottom-up estimate is always more accurate than a top-down one, whatever its inputs are.',
    ],
    answer: 0,
    feedback: {
      1: 'Averaging hides the disagreement. The two routes can’t both be right, and the gap says which assumption to test.',
      2: 'The 5 million may be well sourced, but the 1% share isn’t: nothing measured it. A top-down estimate is only as good as its weakest share.',
      3: 'Bottom-up estimates are often more reliable because their inputs can be checked, but not always; this one rests on a pilot’s cost per subscriber, which may rise as the app reaches beyond early enthusiasts.',
    },
    solution: 'The 1% share of 5 million is an assumption; the $50 cost per subscriber is a measurement from a pilot. To reach 50,000 subscribers with $400,000 the app would have to win each for $8, about a sixth of what the pilot cost. That is what would have to be true, and it is unlikely, so the bottom-up figure deserves more weight until a larger test says otherwise.',
  },

  // ---------------------------------------------------------------- competitor-research
  {
    id: 'm04-m3-7', lesson: 'competitor-research', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement about the professional codes on mystery shopping and competitor interviews is accurate?',
    options: [
      'MRS’s guidelines allow mystery shopping of competitors, but their staff mustn’t be identified or recorded.',
      'MRS and ESOMAR ban mystery shopping of competitors, so only a company’s own outlets may ever be shopped.',
      'A competitor’s staff may be recorded on a visit if the recording is deleted once the report has been written.',
      'SCIP’s code lets members hide who they are in interviews, as long as no law is broken in the process.',
    ],
    answer: 0,
    feedback: {
      1: 'Both allow competitor mystery shopping with conditions: minimal time, no detriment to staff, results in aggregate.',
      2: 'MRS’s guidelines say a competitor’s staff must not be recorded in any way; the MRS Code allows recording only in a company’s own mystery shopping, with staff told in advance.',
      3: 'SCIP’s code requires members to disclose their identity and organisation before all interviews.',
    },
    solution: 'MRS’s mystery-shopping guidelines allow competitor shopping with safeguards: staff not identified or recorded, time kept as short as a normal enquiry, results in aggregate. ESOMAR’s guideline similarly requires minimal demands and no substantial disadvantage. SCIP requires identity to be disclosed before every interview.',
  },
  {
    id: 'm04-m3-8', lesson: 'competitor-research', type: 'formula', kind: 'numerical',
    prompt: 'A city hotel (fictional) has recorded its rivals’ published rates for the same Saturday night from their public websites (B2:B13), and whether breakfast is included (C2:C13). Its own rate, with breakfast, is in F1. In F3, count the rivals that include breakfast and charge more than the hotel’s own rate.',
    sheet: { cells: rateCells, vary: { F1: [129, 159] } },
    cell: 'F3', answer: '=COUNTIFS(B2:B13,">"&F1,C2:C13,"Yes")',
    alt: ['=COUNTIFS(C2:C13,"Yes",B2:B13,">"&F1)', '=SUMPRODUCT((B2:B13>F1)*(C2:C13="Yes"))'],
    view: 'A1:F13', widths: { A: 12, B: 14, C: 18, E: 34, F: 8 }, formats: { B: '$0', F1: '$0' },
    wrong: [
      { formula: '=COUNTIF(B2:B13,">"&F1)', say: 'That counts every dearer rival, with or without breakfast. Compare like with like: add the condition that breakfast is included.' },
      { formula: '=COUNTIFS(B2:B13,">="&F1,C2:C13,"Yes")', say: '">=" also counts a rival charging exactly the hotel’s rate, which isn’t dearer. Use ">".' },
      { formula: '=COUNTIFS(B2:B13,">F1",C2:C13,"Yes")', say: 'Inside quotation marks F1 is text, not a cell. Join the operator to the cell: ">"&F1.' },
    ],
    solution: '<x>=COUNTIFS(B2:B13,">"&F1,C2:C13,"Yes")</x> counts 4 rivals (Hotels D, F, H and J) that include breakfast and charge more than $145. Hotel B charges exactly $145 and isn’t counted; three dearer rivals don’t include breakfast, so their rates aren’t comparable.',
  },
  {
    id: 'm04-m3-9', lesson: 'competitor-research', type: 'num', kind: 'numerical',
    prompt: 'A three-day music festival (fictional) sells a pass for $189. A rival festival’s two-day pass costs $139. Per festival day, by what percentage is the first festival cheaper than its rival? Measure against the rival’s price per day and give one decimal place.',
    answer: 9.4, check: () => (139 / 2 - 189 / 3) / (139 / 2) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: (189 - 139) / 139 * 100, say: 'That compares the pass prices, and on that basis the first festival looks 36% dearer. The passes cover different numbers of days: compare the price per day.' },
      { value: (139 / 2 - 189 / 3) / (189 / 3) * 100, say: 'That measures the gap against the first festival’s price per day. The question measures it against the rival’s.' },
      { value: 139 / 2 - 189 / 3, say: 'That is the gap in dollars per day. Divide by the rival’s $69.50 for a percentage.' },
    ],
    solution: 'Per day: $189 ÷ 3 = $63.00 and $139 ÷ 2 = $69.50. The first festival is ($69.50 − $63.00) ÷ $69.50 ≈ 9.4% cheaper per day, although its pass costs $50 more.',
  },
  {
    id: 'm04-m3-10', lesson: 'competitor-research', type: 'classify', kind: 'applied',
    prompt: 'A gym chain (fictional) has collected these items about a rival opening in its town. How much weight can each bear?',
    items: [
      'The rival’s membership prices on its website, checked on 1 April',
      'One job advertisement for a manager at a site in the town',
      'Twelve angry online reviews of overcrowding at peak times',
      'A copy of the rival’s expansion plan, sent by one of its employees in return for a fee',
      'The rival’s class timetable, noted from the noticeboard in its public reception',
      'A supplier’s remark that the rival plans to cut its prices in May',
      'The rival’s member list, brought by a new instructor who used to work there',
    ],
    categories: ['Reliable evidence of the rival’s offer', 'A signal to follow up, not yet evidence', 'Not usable: obtained improperly'],
    answer: [0, 1, 1, 2, 0, 1, 2],
    feedback: {
      1: 'One advertisement suggests a plan; several, or a planning application, would make it evidence.',
      2: 'Reviewers select themselves: the reviews show that overcrowding happens, not how often or how many members mind.',
      3: 'Paying an employee for a confidential plan is bribery to obtain a trade secret: improper means in law, and unusable.',
      5: 'Hearsay from a supplier is worth checking against the rival’s published prices in May, not acting on.',
      6: 'A former employee bringing the member list is very likely breaking a duty of confidence, and the list is personal data too: it can’t be used.',
    },
    solution: 'Published prices and a public timetable describe the offer reliably. A single job advertisement, self-selected reviews and a supplier’s remark are signals to check. A plan bought from an employee and a member list brought by a former employee were obtained improperly and must not be used.',
  },
  {
    id: 'm04-m3-11', lesson: 'competitor-research', type: 'mc', kind: 'applied',
    prompt: 'A bike shop (fictional) charges $60 for a standard service, including brake pads and a chain when needed. A rival advertises a service for $45, with parts charged extra; the shop’s mechanics say a typical service needs about $18 of parts. What should the shop conclude?',
    options: [
      'Like for like, the rival charges about $63 for a typical service, so the shop should show customers what its $60 includes.',
      'The rival is $15 cheaper, so the shop must cut its price to $45 or lose its service customers to the rival within a season.',
      'The rival’s advertising is misleading, so the shop should report it to the authorities rather than change its own offer.',
      'Customers compare headline prices only, so the shop should copy the rival and charge for parts separately from now on.',
    ],
    answer: 0,
    feedback: {
      1: 'The $15 gap compares unlike offers. With $18 of parts the rival’s typical service costs $63, $3 more than the shop’s.',
      2: 'A lower headline price with parts extra is a common, legitimate way to price; nothing here shows it is misleading.',
      3: 'Some customers may compare headline prices, which is a reason to make the inclusive price visible, not evidence that copying the rival is better.',
    },
    solution: 'Benchmark like with like: $45 + $18 of parts ≈ $63 for a typical service, against the shop’s inclusive $60. The implication is for the shop’s communication: make the all-inclusive price and what it covers obvious, because a headline comparison would wrongly make it look dearer.',
  },
];
