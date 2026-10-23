// gaap-and-ifrs.ex.js — F02 · US GAAP and IFRS: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Lantern’s figures are built from case.js; every `check` recomputes.
// The other businesses (Wildfern Tea, Orrin Kitchenware, Osterley Tiles, Saltire Conference Centre, Harlow Air,
// Aldgate Coffee, Fieldmark Robotics) are fictional.
import { FACTS as F, ADJUSTMENTS, DERIVED as D } from './case.js';

const n = (x) => Math.abs(x).toFixed(Math.abs(x - Math.round(x)) < 1e-9 ? 0 : 2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const money = (x) => `${x < -1e-9 ? '−' : ''}$${n(Math.round(x * 100) / 100)}`;
const signed = (x) => (x > 1e-9 ? `+${money(x)}` : money(x));
const r2 = (x) => Math.round(x * 100) / 100 + 0;
const e7 = ADJUSTMENTS.find((e) => e.id === 'e7').lines[0].dr;          // 400
const ip = D.interestPaid;                                               // 450

export const widgets = {
  'gi-dev': {
    type: 'formula',
    title: 'Development costs under US GAAP and IFRS',
    intro: 'A product development project. Research is expensed under both frameworks; so is development spending before the IAS 38 criteria are met. Development after that point is expensed under US GAAP but capitalised and amortised under IFRS.',
    inputs: [
      { id: 'research', label: 'Research costs (year 1)', min: 0, max: 500000, step: 10000, value: 180000, fmt: 'money' },
      { id: 'before', label: 'Development before the criteria are met (year 1)', min: 0, max: 500000, step: 10000, value: 120000, fmt: 'money' },
      { id: 'after', label: 'Development after the criteria are met (year 1)', min: 0, max: 1000000, step: 10000, value: 300000, fmt: 'money' },
      { id: 'life', label: 'Amortisation period, from year 2', min: 1, max: 10, step: 1, value: 5, fmt: 'int', unit: 'years' },
    ],
    compute: (v) => {
      const total = v.research + v.before + v.after;
      const ifrs1 = v.research + v.before;
      const amort = v.after / v.life;
      const years = Array.from({ length: v.life + 1 }, (_, i) => i + 1);
      const usCum = years.map(() => r2(total));
      const ifrsCum = years.map((y) => r2(ifrs1 + amort * (y - 1)));
      const note = v.after === 0
        ? 'With nothing spent after the criteria are met, the frameworks agree: every dollar is expensed in year 1 under both.'
        : `US GAAP expenses all ${money(total)} in year 1. IFRS expenses ${money(ifrs1)} in year 1, capitalises ${money(v.after)} as an intangible asset and amortises ${money(amort)} a year for ${v.life} year${v.life === 1 ? '' : 's'}. Year-1 profit before tax is ${money(v.after)} higher under IFRS; the cumulative lines meet at the end of year ${v.life + 1}, so the frameworks differ in timing, not in total.`;
      return {
        headline: { label: 'Year-1 profit before tax, IFRS minus US GAAP', value: signed(v.after) },
        rows: [
          ['Year-1 expense, US GAAP', money(total)],
          ['Year-1 expense, IFRS', money(ifrs1)],
          ['Intangible asset at the end of year 1 (IFRS)', money(v.after)],
          ['Amortisation a year from year 2 (IFRS)', money(amort)],
          ['Total expense over the project, either framework', money(total)],
        ],
        note,
        chart: {
          kind: 'line',
          x: { label: 'Year', values: years },
          series: [
            { name: 'US GAAP: cumulative expense', values: usCum },
            { name: 'IFRS: cumulative expense', values: ifrsCum },
          ],
          y: { label: 'Dollars' },
        },
      };
    },
  },
  'gi-nrv': {
    type: 'formula',
    title: 'Inventory write-downs and recoveries',
    intro: `The defaults are Lantern’s Holiday Blend: cost ${money(1000)}, written down to ${money(1000 - e7)} at 31 December, with a later net realisable value you can change.`,
    inputs: [
      { id: 'cost', label: 'Cost of the items', min: 100, max: 5000, step: 50, value: 1000, fmt: 'money' },
      { id: 'nrv1', label: 'Net realisable value at the year end', min: 0, max: 5000, step: 50, value: 1000 - e7, fmt: 'money' },
      { id: 'nrv2', label: 'Net realisable value later, items still held', min: 0, max: 5000, step: 50, value: 900, fmt: 'money' },
    ],
    compute: (v) => {
      const ca1 = Math.min(v.cost, v.nrv1);
      const wd = v.cost - ca1;
      const ifrs2 = Math.min(v.cost, v.nrv2);
      const us2 = Math.min(ca1, v.nrv2);
      const ifrsChange = ifrs2 - ca1;
      const usChange = us2 - ca1;
      let note;
      if (v.nrv2 > ca1 && wd > 0) note = `Net realisable value has recovered. IFRS reverses ${money(ifrsChange)} of the ${money(wd)} write-down${v.nrv2 >= v.cost ? ', the whole of it, because inventory never goes above cost' : ''}, raising profit; US GAAP keeps the items at ${money(us2)}, their new cost, and the recovery shows up only when they are sold.`;
      else if (v.nrv2 < ca1) note = `Net realisable value has fallen further, so both frameworks write the items down again, by ${money(ca1 - v.nrv2)}, to ${money(v.nrv2)}.`;
      else if (wd === 0) note = 'Net realisable value at the year end is at or above cost, so there is no write-down, and nothing to reverse later.';
      else note = 'Net realisable value is unchanged, so neither framework records anything more.';
      return {
        headline: { label: 'Later carrying amount: IFRS / US GAAP', value: `${money(ifrs2)} / ${money(us2)}` },
        rows: [
          ['Write-down at the year end (both frameworks)', money(wd)],
          ['Carrying amount after the write-down', money(ca1)],
          ['IFRS: change recognised in profit later', signed(ifrsChange)],
          ['US GAAP: change recognised in profit later', signed(usChange)],
        ],
        note,
        chart: {
          kind: 'bar',
          x: { label: 'Carrying amount', values: ['Cost', 'After the write-down', 'Later: IFRS', 'Later: US GAAP'] },
          series: [{ name: 'Dollars', values: [v.cost, ca1, ifrs2, us2].map(r2) }],
          y: { label: 'Dollars' },
        },
      };
    },
  },
  'gi-cash': {
    type: 'chart',
    kind: 'bar',
    title: 'Lantern’s 2026 cash flows by activity under two classifications',
    x: { label: 'Activity', values: ['Operating', 'Investing', 'Financing'] },
    series: [
      { name: 'US GAAP (ASC 230)', values: [D.cfo, D.cfi, D.cff] },
      { name: 'IAS 7 as amended by IFRS 18', values: [D.cfo + ip, D.cfi, D.cff - ip] },
    ],
    y: { label: 'Dollars' },
    note: `Moving ${money(ip)} of interest paid from operating to financing raises operating cash flow to ${money(D.cfo + ip)} and lowers financing to ${money(D.cff - ip)}. The total, an increase in cash of ${money(D.netCash)}, is the same. Fictional figures from the Lantern case.`,
  },
};

export const guided = [
  {
    id: 'f02-gi-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Under which framework does each rule hold?',
    items: [
      'Inventory may be costed by LIFO.',
      'Written-down inventory is written back up, as far as its cost, when its net realisable value recovers.',
      'Land and buildings may be carried at fair value.',
      'Research costs are expensed as they are incurred.',
      'Inventory may be costed by FIFO or weighted average.',
      'Significant parts of an asset with different useful lives must be depreciated separately.',
      'Interest paid must be classified as an operating cash flow.',
      'Development costs that meet specified criteria are capitalised as an intangible asset.',
    ],
    categories: ['US GAAP only', 'IFRS only', 'Both US GAAP and IFRS'],
    answer: [0, 1, 1, 2, 2, 1, 0, 1],
    hints: [
      'Two of the rules are shared. For the rest, ask which framework is the more willing to use current values and to capitalise.',
      'LIFO and the fixed operating classification of interest are US rules; reversals, revaluation, required components and capitalised development are IFRS rules.',
    ],
    feedback: {
      3: 'Research is expensed under both frameworks; only development costs are treated differently.',
      5: 'US GAAP permits the component approach but doesn’t require it; IAS 16 requires it.',
      6: 'IAS 7 has allowed operating or financing, and from 2027 most IFRS reporters must show interest paid as financing. Only US GAAP fixes it in operating.',
    },
    solution: 'US GAAP only: LIFO, and interest paid fixed as operating. IFRS only: reversing write-downs, carrying land and buildings at fair value, required component depreciation, capitalising development that meets the criteria. Both: research expensed, FIFO and weighted average permitted.',
  },
  {
    id: 'f02-gi-g2', type: 'steps', kind: 'numerical',
    prompt: 'Wildfern Tea Ltd, a fictional tea blender reporting under IFRS, holds gift tins costing $12,000 at its year end. A competitor’s launch means they can now be sold for only $9,100, less $600 of selling costs. Three months later, still unsold, the tins attract a large corporate order, and their net realisable value rises to $11,000.',
    solution: 'Net realisable value at the year end = 9,100 − 600 = 8,500, so the write-down is 12,000 − 8,500 = $3,500. Three months later IFRS measures the tins at min(11,000, 12,000) = 11,000 and reverses 11,000 − 8,500 = $2,500. Under US GAAP the $8,500 would be the tins’ new cost and they would stay at $8,500.',
    steps: [
      { id: 'f02-gi-g2-s1', type: 'num', prompt: 'What write-down is recognised at the year end?',
        answer: 3500, check: () => 12000 - (9100 - 600), unit: '$', places: 0, tol: 0.5,
        hints: ['Net realisable value is the selling price less the costs of selling.', 'Write-down = cost − (9,100 − 600).'],
        wrong: [
          { value: 2900, say: 'Deduct the $600 of selling costs: net realisable value is 8,500, not 9,100.' },
          { value: 8500, say: 'That is the new carrying amount. The write-down is the fall from cost: 12,000 − 8,500.' },
        ] },
      { id: 'f02-gi-g2-s2', type: 'num', prompt: 'Under IFRS, how much of the write-down is reversed three months later?',
        answer: 2500, check: () => Math.min(11000, 12000) - (9100 - 600), unit: '$', places: 0, tol: 0.5,
        hints: ['The tins are again measured at the lower of cost and net realisable value.', 'min(11,000, 12,000) − 8,500.'],
        wrong: [
          { value: 3500, say: 'Reverse only as far as the new net realisable value, 11,000. The tins don’t go back to cost while they are worth less than cost.' },
          { value: 0, say: 'That is the US GAAP answer. IAS 2 requires the reversal when net realisable value recovers.' },
        ] },
      { id: 'f02-gi-g2-s3', type: 'num', prompt: 'If Wildfern reported under US GAAP, what would the tins’ carrying amount be three months after the year end?',
        answer: 8500, check: () => Math.min(12000, 9100 - 600), unit: '$', places: 0, tol: 0.5,
        hints: ['Under US GAAP a write-down creates a new cost basis.', 'The recovery is not recorded until the tins are sold.'],
        wrong: [
          { value: 11000, say: 'US GAAP doesn’t write inventory back up after a year-end write-down; the $8,500 is now its cost.' },
          { value: 12000, say: 'The original cost no longer applies under US GAAP; the written-down amount replaced it.' },
        ] },
    ],
  },
  {
    id: 'f02-gi-g3', type: 'steps', kind: 'numerical',
    prompt: 'Orrin Kitchenware Ltd, a fictional manufacturer with no specified main business activity, applies IFRS 18. Its items for the year: revenue $900,000; cost of sales $540,000; selling and administrative expenses $210,000; dividends received on shares it holds in another company $12,000; interest expense on its bank loan $30,000; income tax expense $33,000.',
    solution: 'Operating: 900,000 − 540,000 − 210,000 = $150,000 operating profit. Investing: dividends of 12,000, so profit before financing and income taxes = $162,000. Financing: interest of 30,000, profit before tax 132,000. Income taxes: 33,000, profit for the year $99,000.',
    steps: [
      { id: 'f02-gi-g3-s1', type: 'num', prompt: 'What is operating profit?',
        answer: 150000, check: () => 900000 - 540000 - 210000, unit: '$', places: 0, tol: 0.5,
        hints: ['Operating holds revenue and the costs of running the business.', 'Dividends from shares belong to the investing category.'],
        wrong: [
          { value: 162000, say: 'Dividends from shares in another company are investing income, below operating profit.' },
          { value: 120000, say: 'Interest on the bank loan is in the financing category, below operating profit.' },
        ] },
      { id: 'f02-gi-g3-s2', type: 'num', prompt: 'What is profit before financing and income taxes?',
        answer: 162000, check: () => 900000 - 540000 - 210000 + 12000, unit: '$', places: 0, tol: 0.5,
        hints: ['Add the investing category to operating profit.'],
        wrong: [
          { value: 150000, say: 'Add the investing category, the $12,000 of dividends, to operating profit.' },
          { value: 132000, say: 'That deducts the interest, which comes after this subtotal.' },
        ] },
      { id: 'f02-gi-g3-s3', type: 'num', prompt: 'What is profit for the year?',
        answer: 99000, check: () => 162000 - 30000 - 33000, unit: '$', places: 0, tol: 0.5,
        hints: ['Deduct the financing and income taxes categories.'],
        wrong: [
          { value: 87000, say: 'Include the dividends: they are part of profit, in the investing category.' },
          { value: 132000, say: 'That is profit before tax. Deduct the income tax expense.' },
        ] },
    ],
  },
  {
    id: 'f02-gi-g4', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the dates and scope of the two 2024 income statement standards.',
    text: 'IFRS 18 was issued in [[0]] and applies to annual reporting periods beginning on or after [[1]]. ASU 2024-03 was issued in [[2]]; it applies to [[3]] for annual reporting periods beginning after [[4]].',
    blanks: [
      { options: ['May 2014', 'April 2024', 'November 2024', 'January 2025'], answer: 1 },
      { options: ['1 January 2026', '15 December 2026', '1 January 2027', '1 January 2028'], answer: 2 },
      { options: ['April 2024', 'November 2024', 'January 2025', 'July 2015'], answer: 1 },
      { options: ['all US companies', 'public business entities', 'private companies only', 'companies reporting under IFRS'], answer: 1 },
      { options: ['15 December 2025', '15 December 2026', '15 December 2027', '1 January 2027'], answer: 1 },
    ],
    hints: [
      'The IASB issued its standard first, in the spring of 2024; the FASB’s followed late in the year.',
      'FASB effective dates are written as periods beginning after 15 December, so a calendar-year company starts on 1 January of the next year.',
    ],
    solution: 'IFRS 18: issued April 2024, effective for annual periods beginning on or after 1 January 2027. ASU 2024-03: issued November 2024, for public business entities, effective for annual periods beginning after 15 December 2026 (and interim periods within annual periods beginning after 15 December 2027, as ASU 2025-01 clarified).',
  },
];

export const independent = [
  {
    id: 'f02-gi-i1', type: 'num', kind: 'numerical',
    prompt: 'Osterley Tiles Inc., a fictional US retailer, starts the year with 1,000 boxes of tiles costing $20 each, buys 3,000 boxes at $24 and then 2,000 boxes at $27, and sells 4,500 boxes. It uses a periodic system and its income tax is 21% of income before tax. How much lower is its income tax under LIFO than under FIFO?',
    answer: 1785, check: () => 0.21 * ((2000 * 27 + 2500 * 24) - (1000 * 20 + 3000 * 24 + 500 * 27)), unit: '$', places: 0,
    wrong: [
      { value: 8500, say: 'That is the difference in cost of goods sold. The tax saving is 21% of it.' },
      { value: -1785, say: 'Prices are rising, so LIFO’s cost of goods sold is higher and its tax lower: enter the saving as a positive number.' },
      { value: 2125, say: 'Use Osterley’s rate, 21%, not the Lantern case’s 25%.' },
    ],
    solution: 'FIFO cost of goods sold: 1,000 × 20 + 3,000 × 24 + 500 × 27 = 105,500. LIFO: 2,000 × 27 + 2,500 × 24 = 114,000. Difference 8,500; tax saving 21% × 8,500 = $1,785. Under IFRS this choice isn’t available, because IAS 2 doesn’t permit LIFO.',
  },
  {
    id: 'f02-gi-i2', type: 'num', kind: 'numerical',
    prompt: 'Saltire Conference Centre Ltd, a fictional company reporting under IFRS, uses the revaluation model for its buildings. At the start of the year a building carried at $3,200,000 (cost less accumulated depreciation) is revalued to its fair value of $3,800,000. Its remaining useful life is 25 years, with no residual value. How much higher is the year’s depreciation than it would have been without the revaluation?',
    answer: 24000, check: () => 3800000 / 25 - 3200000 / 25, unit: '$', places: 0,
    wrong: [
      { value: 600000, say: 'That is the revaluation surplus, which goes to other comprehensive income. The question asks about depreciation.' },
      { value: 152000, say: 'That is the new depreciation charge. Compare it with the charge on the old carrying amount, 3,200,000 ÷ 25.' },
    ],
    solution: 'Depreciation after revaluation: 3,800,000 ÷ 25 = 152,000. Without it: 3,200,000 ÷ 25 = 128,000. Difference $24,000 a year, which is the $600,000 surplus spread over 25 years. The surplus itself is not profit.',
  },
  {
    id: 'f02-gi-i3', type: 'num', kind: 'numerical',
    prompt: 'Harlow Air Ltd, a fictional airline reporting under IFRS, buys an aircraft for $60 million. The engines cost $12 million and will last 8 years; the cabin interior costs $6 million and will last 6 years; the airframe, the remaining $42 million, will last 21 years. (Depreciated as one unit over 20 years, the aircraft would cost $3 million a year.) Ignoring residual values, what is the first year’s straight-line depreciation under IFRS, in millions of dollars? Give one decimal place.',
    answer: 4.5, check: () => 12 / 8 + 6 / 6 + (60 - 12 - 6) / 21, unit: '$ million', places: 1, tol: 0.05,
    wrong: [
      { value: 3, say: 'That is the single-unit figure. IAS 16 requires significant parts with different lives to be depreciated separately.' },
      { value: 2, say: 'That is the airframe alone. Add the engines (12 ÷ 8) and the cabin (6 ÷ 6).' },
    ],
    solution: 'Engines 12 ÷ 8 = 1.5; cabin 6 ÷ 6 = 1.0; airframe 42 ÷ 21 = 2.0. Total $4.5 million a year, against $3 million as a single unit: the short-lived parts make depreciation faster in the early years.',
  },
  {
    id: 'f02-gi-i4', type: 'num', kind: 'applied',
    prompt: 'Aldgate Coffee plc, a fictional roaster with no specified main business activity, has classified both interest paid ($1.4 million) and dividends paid ($3.0 million) as operating cash flows, as IAS 7 allowed, and dividends received ($0.2 million) as investing. Its reported operating cash flow was $18.6 million. Applying the IFRS 18 amendments to IAS 7, what is its operating cash flow, in millions of dollars? Give one decimal place.',
    answer: 23, check: () => 18.6 + 1.4 + 3.0, unit: '$ million', places: 1, tol: 0.05,
    wrong: [
      { value: 20, say: 'Dividends paid must move to financing as well.' },
      { value: 21.6, say: 'Interest paid must move to financing as well.' },
      { value: 22.8, say: 'Dividends received are already in investing, where the amendments put them; don’t move them again.' },
    ],
    solution: 'Interest paid and dividends paid both move out of operating into financing: 18.6 + 1.4 + 3.0 = $23.0 million. Dividends received stay in investing. Total cash is unchanged; only the split between activities moves.',
  },
  {
    id: 'f02-gi-i5', type: 'mc', kind: 'conceptual',
    prompt: 'Aldgate’s managers present an “adjusted operating profit”, which excludes restructuring costs, in its results announcements. Once Aldgate applies IFRS 18, what must it do about this measure?',
    options: [
      'Disclose it in one note, with a reconciliation to operating profit showing the tax and non-controlling-interest effects.',
      'Nothing, because the measure is used only in announcements outside the financial statements.',
      'Present it on the face of the statement of profit or loss, in place of operating profit, as one of the two required subtotals.',
      'Stop using it, because IFRS 18 prohibits any performance measure that excludes restructuring costs.',
    ],
    answer: 0,
    feedback: {
      1: 'That is exactly what makes it a management-defined performance measure: a subtotal used in public communications outside the statements. IFRS 18 brings it into the notes.',
      2: 'Operating profit is a required subtotal defined by IFRS 18 and can’t be replaced; the adjusted measure is explained in a note.',
      3: 'IFRS 18 doesn’t ban such measures; it requires them to be explained and reconciled.',
    },
    solution: 'An “adjusted operating profit” used in public communications is a management-defined performance measure. IFRS 18 requires a single note explaining how it is calculated and why it is useful, a reconciliation to the most directly comparable IFRS subtotal (here operating profit) with the tax and non-controlling-interest effect of each reconciling item, and a statement that it may not be comparable with other companies’ measures.',
  },
  {
    id: 'f02-gi-i6', type: 'short', kind: 'applied',
    prompt: 'Write a short reply (four to six sentences) to the investor who told Ana that Lantern’s numbers can’t be compared with Aldgate’s IFRS statements. Say which of Lantern’s 2026 figures would change under IFRS and which differences he should look for in Aldgate’s statements.',
    rubric: [
      'States that Lantern’s 2026 net income, total assets and increase in cash would be the same under IFRS.',
      'Names the cash flow difference: $450 of interest paid would move from operating to financing (operating $40,390 instead of $39,940).',
      'Notes that Lantern uses FIFO, so the LIFO difference doesn’t arise, and that IFRS 18 would show operating profit of $37,716 as a defined subtotal.',
      'Names at least two differences to check in Aldgate’s notes, such as capitalised development costs, revalued property, inventory write-down reversals or management-defined performance measures.',
      'Concludes that the statements can be compared once the identified differences are adjusted for.',
    ],
    model: 'Under IFRS Lantern’s 2026 net income of $27,387, its total assets and its $42,940 increase in cash would all be unchanged: it uses FIFO, has no development spending or revalued property, and its one inventory write-down hasn’t recovered. The only figure that would move is operating cash flow, $40,390 instead of $39,940, because IFRS 18 puts the $450 of interest paid in financing. Its operating income of $37,716 already matches what IFRS 18 calls operating profit. In Aldgate’s statements I would check the notes for capitalised development costs, revalued property and any reversed inventory write-downs, and read its management-defined performance measures against its IFRS subtotals. Once those are adjusted for, the two companies can be compared.',
  },
];

export const check = [
  {
    id: 'f02-gi-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which difference would change Lantern’s 2026 cash from operating activities if it reported under IFRS with IFRS 18 applied?',
    options: [
      'Interest paid on the Coastline note would be classified as a financing cash flow.',
      'Its Holiday Blend write-down would be reversed, raising operating cash flow by the amount reversed.',
      'Depreciation on the van would be added back in the investing section instead of the operating section.',
      'Customer deposits would be classified as financing cash flows, because unearned revenue is a liability.',
    ],
    answer: 0,
    feedback: {
      1: 'The write-down hasn’t recovered, and a reversal would move no cash anyway: it changes inventory and cost of goods sold.',
      2: 'Depreciation is a noncash expense under both frameworks; it isn’t a cash flow in any section.',
      3: 'Deposits from customers are operating cash flows under both frameworks.',
    },
    solution: `Under IAS 7 as amended by IFRS 18, interest paid is financing for a company like Lantern. Operating cash flow would be ${money(D.cfo)} + ${money(ip)} = ${money(D.cfo + ip)}; the total change in cash is unchanged.`,
  },
  {
    id: 'f02-gi-k2', type: 'num', kind: 'numerical',
    prompt: 'Fieldmark Robotics Ltd, a fictional company reporting under IFRS, spends $150,000 on research and $400,000 on development during the year. All six IAS 38 criteria are demonstrated partway through development, after which $260,000 of the development spending is incurred. The product won’t be available for use until next year. What is the year’s total expense for the project under IFRS?',
    answer: 290000, check: () => 150000 + (400000 - 260000), unit: '$', places: 0,
    wrong: [
      { value: 150000, say: 'Development spending before the criteria were met is expensed too: add the $140,000.' },
      { value: 550000, say: 'That is the US GAAP answer. Under IAS 38 the $260,000 incurred after the criteria were met is capitalised.' },
      { value: 410000, say: 'That expenses the development after the criteria were met and capitalises the part before. It is the other way round.' },
    ],
    solution: 'Expensed: research 150,000 + development before the criteria 400,000 − 260,000 = 140,000, so $290,000. Capitalised: $260,000, amortised from next year when the product is available for use. Under US GAAP the whole $550,000 would be expensed.',
  },
  {
    id: 'f02-gi-k3', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these does ASU 2024-03 require of a US public business entity? Select all that apply.',
    options: [
      'A note showing the employee compensation in each relevant expense caption',
      'Its total selling expenses, and in annual periods how it defines them',
      'An operating profit subtotal on the face of the income statement',
      'A note reconciling its adjusted performance measures to GAAP totals',
      'The purchases of inventory included in each relevant expense caption',
      'Expenses presented by nature instead of by function on the face',
    ],
    answer: [0, 1, 4],
    feedback: {
      2: 'ASU 2024-03 changes nothing on the face of the income statement; required subtotals are an IFRS 18 feature.',
      3: 'Reconciling management’s own measures in a note is an IFRS 18 requirement. In the United States such measures stay outside the statements, under the SEC’s non-GAAP rules.',
      5: 'The face of the income statement is unchanged; the disaggregation is in a tabular note.',
    },
    solution: 'ASU 2024-03 requires a tabular note showing, for each relevant expense caption, purchases of inventory, employee compensation, depreciation, intangible asset amortisation and depletion, a qualitative description of the rest, and total selling expenses with (annually) their definition. It adds no subtotals and leaves the face of the income statement unchanged.',
  },
  {
    id: 'f02-gi-k4', type: 'num', kind: 'applied',
    prompt: `Lantern wrote Holiday Blend bags costing $1,000 down by $${n(e7)} at 31 December 2026. Suppose that in January 2027, with the bags still unsold, their net realisable value rises to $1,150. If Lantern reported under IFRS, how much of the write-down would it reverse?`,
    answer: 400, check: () => Math.min(1150, 1000) - (1000 - e7), unit: '$', places: 0,
    wrong: [
      { value: 550, say: 'Inventory is measured at the lower of cost and net realisable value, so it can’t go above its $1,000 cost: the reversal is capped at the original write-down.' },
      { value: 0, say: 'That is the US GAAP answer. IAS 2 requires the reversal.' },
    ],
    solution: `Carrying amount ${money(1000 - e7)}; new measure min(1,150, 1,000) = 1,000; reversal 1,000 − ${n(1000 - e7)} = $400, the whole original write-down and no more.`,
  },
  {
    id: 'f02-gi-k5', type: 'mc', kind: 'applied',
    prompt: 'Which statement about the framework Lantern uses is correct?',
    options: [
      'It may choose its framework as a US private company, and uses US GAAP because its lenders expect it.',
      'The SEC requires every US company, whether public or private, to prepare its financial statements under US GAAP.',
      'From 2027 Lantern must apply ASU 2024-03 and disclose employee compensation in each expense caption.',
      'Because it isn’t listed, Lantern must use the IFRS for SMEs Accounting Standard from 2027 onward.',
    ],
    answer: 0,
    feedback: {
      1: 'The SEC requires US GAAP of domestic public companies. It sets no framework for private companies such as Lantern.',
      2: 'ASU 2024-03 applies only to public business entities, and Lantern isn’t one.',
      3: 'The IFRS for SMEs Accounting Standard is one option a US private company may choose; nothing requires it.',
    },
    solution: 'A US private company can select the framework that fits the purpose of its statements unless a contract specifies one. Lantern’s bank and future investors expect US GAAP, so it uses US GAAP; as a private company that isn’t a public business entity, it is outside ASU 2024-03.',
  },
  {
    id: 'f02-gi-k6', type: 'classify', kind: 'conceptual',
    prompt: 'A coffee-roasting company with no specified main business activity applies IFRS 18. In which category of its statement of profit or loss does each item belong?',
    items: [
      'Revenue from selling roasted coffee',
      'Cost of the green coffee beans sold',
      'Interest expense on a bank loan',
      'Dividends received on shares held in another company',
      'Income tax expense',
      'Impairment loss on a roasting machine',
      'Interest on a lease liability',
      'Rental income from a building held as an investment',
    ],
    categories: ['Operating', 'Investing', 'Financing', 'Income taxes'],
    answer: [0, 0, 2, 1, 3, 0, 2, 1],
    feedback: {
      3: 'Dividends from shares in another company are a return from an asset that earns largely independently of the business: investing.',
      5: 'Operating is the default category, and it includes unusual or volatile items such as impairment losses.',
      6: 'Financing holds interest on other liabilities, such as leases, as well as on loans and bonds.',
      7: 'Rental income from an investment property earns a return largely independently of the business’s other resources: investing.',
    },
    solution: 'Operating: revenue, cost of beans, the impairment loss. Investing: dividends received and investment rental income. Financing: interest on the bank loan and on the lease liability. Income taxes: income tax expense.',
  },
];
