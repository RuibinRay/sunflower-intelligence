// gaap-and-ifrs.ex.js — F02 · US GAAP and IFRS: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Lantern’s figures are built from case.js; every `check` recomputes.
// Items practise this lesson’s own skills (classifying and measuring differences, restating between frameworks, IFRS 18,
// ASU 2024-03, leases); the single rules are practised in Modules 1–3. Businesses here (Wildfern Tea, Brindley Lodge,
// Orrin Kitchenware, Ravensworth Outdoor, Pemberly Software, Aldgate Coffee, Fieldmark Robotics) are fictional.
import { DERIVED as D } from './case.js';

const n = (x) => Math.abs(x).toFixed(Math.abs(x - Math.round(x)) < 1e-9 ? 0 : 2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const money = (x) => `${x < -1e-9 ? '−' : ''}$${n(Math.round(x * 100) / 100)}`;
const signed = (x) => (x > 1e-9 ? `+${money(x)}` : money(x));
const r2 = (x) => Math.round(x * 100) / 100 + 0;
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
  'gi-reval': {
    type: 'formula',
    title: 'Revaluation model and cost model',
    intro: 'A building revalued once and valued again some years later. The defaults are Fairhaven Hotel’s, from the simple example; the cost-model column is what a US GAAP reporter would show.',
    inputs: [
      { id: 'ca', label: 'Carrying amount before the first revaluation', min: 500000, max: 5000000, step: 50000, value: 2000000, fmt: 'money' },
      { id: 'fv1', label: 'Fair value at the first revaluation', min: 500000, max: 5000000, step: 50000, value: 2600000, fmt: 'money' },
      { id: 'life', label: 'Remaining useful life', min: 5, max: 40, step: 1, value: 20, fmt: 'int', unit: 'years' },
      { id: 'years', label: 'Years until the next valuation', min: 1, max: 10, step: 1, value: 2, fmt: 'int', unit: 'years' },
      { id: 'fv2', label: 'Fair value at the next valuation', min: 0, max: 5000000, step: 50000, value: 1600000, fmt: 'money' },
    ],
    compute: (v) => {
      const surplus = Math.max(0, v.fv1 - v.ca);                // to OCI
      const loss1 = Math.max(0, v.ca - v.fv1);                  // to profit (no earlier surplus)
      const depRev = v.fv1 / v.life, depCost = v.ca / v.life;
      const yrs = Math.min(v.years, v.life);
      const carry2 = v.fv1 - yrs * depRev;
      const us2 = v.ca - yrs * depCost;
      const change = v.fv2 - carry2;
      let oci2, pl2;
      if (change < 0) { oci2 = -Math.min(-change, surplus); pl2 = change - oci2; }      // decrease: surplus first, then profit
      else { pl2 = Math.min(change, loss1); oci2 = change - pl2; }                       // increase: reverse an earlier loss first (simplified)
      const profitDiff = -loss1 - yrs * (depRev - depCost) + pl2;
      const note = `The first valuation puts ${surplus > 0 ? `${money(surplus)} into other comprehensive income` : `a loss of ${money(loss1)} into profit`}, and depreciation becomes ${money(depRev)} a year against ${money(depCost)} at cost. At the next valuation the building is carried at ${money(carry2)}; ${change < 0 ? `the fall of ${money(-change)} is taken first against the surplus (${money(-oci2)}) and the rest, ${money(-pl2)}, goes to profit` : change > 0 ? `the rise of ${money(change)} goes ${pl2 > 0 ? `first to profit (${money(pl2)}, reversing the earlier loss) and the rest ` : ''}to other comprehensive income` : 'nothing more is recorded'}. Over the period IFRS profit differs from US GAAP profit by ${signed(profitDiff)}. (Simplified: no transfers from the surplus to retained earnings, and no US GAAP impairment test, which a large fall in value could trigger.)`;
      return {
        headline: { label: 'Carrying amount after the next valuation: IFRS / US GAAP', value: `${money(v.fv2)} / ${money(us2)}` },
        rows: [
          ['First valuation: to other comprehensive income', money(surplus)],
          ['First valuation: loss in profit', money(loss1)],
          ['Depreciation a year: IFRS / US GAAP', `${money(depRev)} / ${money(depCost)}`],
          ['Carrying amount before the next valuation: IFRS / US GAAP', `${money(carry2)} / ${money(us2)}`],
          ['Next valuation: through other comprehensive income', signed(oci2)],
          ['Next valuation: in profit or loss', signed(pl2)],
          ['Profit over the period, IFRS minus US GAAP', signed(profitDiff)],
        ],
        note,
        chart: {
          kind: 'bar',
          x: { label: 'Point in time', values: ['Before', 'After the first valuation', 'Before the next valuation', 'After the next valuation'] },
          series: [
            { name: 'IFRS (revaluation model)', values: [v.ca, v.fv1, carry2, v.fv2].map(r2) },
            { name: 'US GAAP (cost model)', values: [v.ca, v.ca, us2, us2].map(r2) },
          ],
          y: { label: 'Carrying amount ($)' },
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
    prompt: 'For a company moving from US GAAP to IFRS, what does each difference change in the year it arises?',
    items: [
      'Using FIFO instead of LIFO while purchase prices are rising',
      'Revaluing land upward under IAS 16, with no earlier revaluation loss on it',
      'Capitalising development costs that meet the IAS 38 criteria',
      'Classifying interest paid as a financing rather than an operating cash flow',
      'Showing operating profit as a required IFRS 18 subtotal',
      'Reversing an inventory write-down when net realisable value recovers',
      'Explaining a management-defined performance measure in a note',
      'Depreciating a significant component over its own shorter life',
    ],
    categories: ['Changes profit', 'Changes assets and equity, not profit', 'Changes presentation only'],
    answer: [0, 1, 0, 2, 2, 0, 2, 0],
    hints: [
      'Ask whether the item changes an amount in profit or loss, an amount on the balance sheet only, or only where something is shown.',
      'A revaluation increase goes to other comprehensive income; classification and subtotals move nothing between profit and the balance sheet.',
    ],
    feedback: {
      1: 'An IAS 16 revaluation increase goes to other comprehensive income and a revaluation surplus in equity, not to profit. Land isn’t depreciated, so later profit isn’t affected either.',
      3: 'Total cash and profit are the same; only the split between operating and financing changes.',
      4: 'A subtotal reorganises the statement; the profit for the year is unchanged.',
      6: 'The note explains a measure the company already uses; no amount in the statements changes.',
    },
    solution: 'Profit: FIFO vs LIFO, capitalised development, reversed write-downs and component depreciation all change amounts recognised in profit or loss. Assets and equity only: the upward revaluation of land, through other comprehensive income. Presentation only: the cash-flow classification of interest, the IFRS 18 subtotal and the management-defined performance measure note.',
  },
  {
    id: 'f02-gi-g2', type: 'steps', kind: 'numerical',
    prompt: 'Brindley Lodge Ltd, a fictional country hotel reporting under IFRS, uses the revaluation model for its buildings. At the start of year 1 the main building is carried at $900,000, has 25 years of use left and no residual value, and is revalued to its fair value of $1,150,000. At the end of year 3 a valuation finds fair value of $700,000. Brindley makes no transfers from the surplus to retained earnings.',
    solution: 'Surplus 1,150,000 − 900,000 = $250,000, to other comprehensive income. Depreciation 1,150,000 ÷ 25 = 46,000 a year, so the carrying amount at the end of year 3 is 1,150,000 − 3 × 46,000 = $1,012,000. The decrease to 700,000 is 312,000: 250,000 against the surplus, through other comprehensive income, and the remaining $62,000 as a loss in profit or loss.',
    steps: [
      { id: 'f02-gi-g2-s1', type: 'num', prompt: 'What revaluation surplus arises at the start of year 1?',
        answer: 250000, check: () => 1150000 - 900000, unit: '$', places: 0, tol: 0.5,
        hints: ['Surplus = fair value − carrying amount just before the revaluation.'],
        wrong: [
          { value: 1150000, say: 'That is the new carrying amount. The surplus is the increase over the old one.' },
          { value: -250000, say: 'Fair value is above the carrying amount, so the surplus is positive.' },
        ] },
      { id: 'f02-gi-g2-s2', type: 'num', prompt: 'What is the building’s carrying amount at the end of year 3, before the new valuation?',
        answer: 1012000, check: () => 1150000 - 3 * (1150000 / 25), unit: '$', places: 0, tol: 0.5,
        hints: ['After a revaluation, depreciation is based on the revalued amount.', '1,150,000 ÷ 25 = 46,000 a year, for three years.'],
        wrong: [
          { value: 1042000, say: 'That uses the old depreciation (900,000 ÷ 25 = 36,000). After the revaluation, depreciate the revalued amount.' },
          { value: 1150000, say: 'Three years of depreciation have been charged since the revaluation.' },
          { value: 762000, say: 'That depreciates the old carrying amount, as the cost model would. Under the revaluation model start from 1,150,000.' },
        ] },
      { id: 'f02-gi-g2-s3', type: 'num', prompt: 'How much of the fall to $700,000 is recognised as a loss in profit or loss?',
        answer: 62000, check: () => (1150000 - 3 * (1150000 / 25) - 700000) - Math.min(1150000 - 3 * (1150000 / 25) - 700000, 250000), unit: '$', places: 0, tol: 0.5,
        hints: ['The decrease is first taken against the surplus on the same building.', 'Decrease 1,012,000 − 700,000 = 312,000; the surplus is 250,000.'],
        wrong: [
          { value: 312000, say: 'The first 250,000 of the decrease is taken against the revaluation surplus, through other comprehensive income.' },
          { value: 0, say: 'The surplus is only 250,000, so it can’t absorb the whole 312,000 decrease.' },
          { value: 450000, say: 'Measure the decrease from the carrying amount just before the valuation (1,012,000), not from the revalued amount.' },
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
    id: 'f02-gi-i1', type: 'journal', kind: 'applied', chart: 'f02', date: '2027-03-31',
    prompt: 'Wildfern Tea Ltd, a fictional tea blender reporting under IFRS, wrote gift tins costing $12,000 down to their net realisable value of $8,500 at its year end. Three months later, still unsold, the tins attract a large corporate order and their net realisable value rises to $11,000. Record the entry IAS 2 requires.',
    accounts: ['Inventory', 'Cost of Goods Sold', 'Online Sales Revenue', 'Accounts Receivable', 'Cash', 'Retained Earnings', 'Accounts Payable', 'Sales Returns and Allowances'],
    lines: [{ acct: 'Inventory', dr: 2500 }, { acct: 'Cost of Goods Sold', cr: 2500 }],
    solution: 'IAS 2 measures the tins at min(cost 12,000, NRV 11,000) = 11,000, so 11,000 − 8,500 = 2,500 of the write-down is reversed: debit Inventory 2,500; credit Cost of Goods Sold 2,500, which lowers the expense of the period. A US GAAP reporter would record nothing, because the $8,500 became the tins’ new cost; its profit would rise only when the tins are sold.',
  },
  {
    id: 'f02-gi-i2', type: 'num', kind: 'applied',
    prompt: 'Ravensworth Outdoor plc, a fictional retailer with no specified main business activity, leases its flagship store for ten years. This year it paid $50,000 under the lease; under IFRS 16, $38,000 of that repaid the lease liability and $12,000 was interest. An otherwise identical US company accounting for the store as an operating lease under ASC 842 reports cash from operating activities of $400,000. What is Ravensworth’s cash from operating activities under IFRS 16 and IAS 7 as amended by IFRS 18?',
    answer: 450000, check: () => 400000 + 38000 + 12000, unit: '$', places: 0,
    wrong: [
      { value: 438000, say: 'Under IAS 7 as amended by IFRS 18, interest paid also moves out of operating, to financing.' },
      { value: 412000, say: 'The principal part of a lease payment is a financing outflow under IFRS 16.' },
      { value: 400000, say: 'Under ASC 842 operating lease payments are operating; under IFRS 16 they leave the operating section.' },
    ],
    solution: 'Under ASC 842 the whole $50,000 is an operating outflow. Under IFRS 16 the $38,000 of principal is financing, and under IAS 7 as amended by IFRS 18 the $12,000 of interest paid is financing too. Operating cash flow is 400,000 + 50,000 = $450,000; financing is $50,000 lower, and total cash is the same.',
  },
  {
    id: 'f02-gi-i3', type: 'num', kind: 'numerical',
    prompt: 'Pemberly Software Inc., a fictional US public business entity, presents one caption, “Selling, general and administrative expenses”, of $9.0 million. Applying ASU 2024-03, it finds the caption includes employee compensation of $4.2 million, depreciation of $0.6 million and intangible asset amortisation of $0.3 million, and no purchases of inventory or depletion. How much of the caption is left to be described qualitatively, in millions of dollars? Give one decimal place.',
    answer: 3.9, check: () => 9.0 - (4.2 + 0.6 + 0.3), unit: '$ million', places: 1, tol: 0.05,
    wrong: [
      { value: 5.1, say: 'That is the total of the named categories, which are disclosed as amounts. The question asks for the rest.' },
      { value: 4.8, say: 'Depreciation and intangible asset amortisation are named categories too: subtract them as well.' },
      { value: 9.0, say: 'The named categories are disclosed as amounts in the tabular note; only the remainder is described in words.' },
    ],
    solution: 'Named categories in the caption: 4.2 + 0.6 + 0.3 = 5.1, each shown in the tabular note. The remaining 9.0 − 5.1 = $3.9 million is described qualitatively. Pemberly also discloses its total selling expenses and, in annual periods, how it defines them; the face of the income statement doesn’t change.',
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
      'Notes why nothing else changes for Lantern: FIFO, no development spending or revalued property, a month-by-month kitchen rent, and operating income of $37,716 that matches IFRS 18’s operating profit.',
      'Names at least two differences to check in Aldgate’s notes, such as leases, capitalised development costs, revalued property, inventory write-down reversals or management-defined performance measures.',
      'Concludes that the statements can be compared once the identified differences are adjusted for.',
    ],
    model: 'Under IFRS Lantern’s 2026 net income of $27,387, its total assets and its $42,940 increase in cash would all be unchanged: it uses FIFO, has no development spending or revalued property, rents its kitchen month by month, and its one inventory write-down hasn’t recovered. The only figure that would move is operating cash flow, $40,390 instead of $39,940, because IFRS 18 puts the $450 of interest paid in financing; its operating income of $37,716 already matches what IFRS 18 calls operating profit. In Aldgate’s statements I would check the lease note, since IFRS 16 puts lease principal in financing, and the notes on capitalised development costs, revalued property and reversed write-downs, and I would read its management-defined performance measures against its IFRS subtotals. Once those are adjusted for, the two companies can be compared.',
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
    prompt: 'An analyst wants Aldgate Coffee plc’s IFRS profit before tax of $14.5 million on a US GAAP basis. This year Aldgate capitalised $2.0 million of development costs, amortised $0.6 million of development costs capitalised in earlier years, and reversed $0.3 million of an inventory write-down after prices recovered. It uses the cost model for its property. Ignoring any other differences, what is its profit before tax on a US GAAP basis, in millions of dollars? Give one decimal place.',
    answer: 12.8, check: () => 14.5 - 2.0 + 0.6 - 0.3, unit: '$ million', places: 1, tol: 0.05,
    wrong: [
      { value: 16.2, say: 'The signs are reversed. Capitalising development and reversing write-downs raised IFRS profit, so take them off; amortisation lowered it, so add it back.' },
      { value: 12.2, say: 'Add back the amortisation: US GAAP expensed that spending when it was incurred, so there is nothing to amortise now.' },
      { value: 13.1, say: 'US GAAP doesn’t reverse inventory write-downs, so take the $0.3 million reversal off as well.' },
    ],
    solution: 'US GAAP expenses development as incurred, so subtract the 2.0 capitalised and add back the 0.6 amortised; it doesn’t reverse write-downs, so subtract the 0.3. 14.5 − 2.0 + 0.6 − 0.3 = $12.8 million. Aldgate uses the cost model, so there is no revaluation depreciation to adjust.',
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
