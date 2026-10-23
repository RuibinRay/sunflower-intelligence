// long-lived-assets.ex.js — F02 · Long-lived assets: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
import { FACTS } from './case.js';

/** $1,234 or $1,234.56 (cents only when needed); a real minus sign for negatives. */
const money = (n) => {
  const v = Math.round(n * 100) / 100;
  const dp = Math.abs(v - Math.round(v)) < 1e-9 ? 0 : 2;
  const s = Math.abs(v).toFixed(dp).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (v < 0 ? '−$' : '$') + s;
};
const r2 = (x) => Math.round(x * 100) / 100;
const van = FACTS.van;

/** Straight line and declining balance by financial year, with `m` months used in the first year. */
function schedules(cost, residual, life, m, factor) {
  const base = cost - residual;
  const n = m === 12 ? life : life + 1;
  const sl = [], db = [];
  let bvS = cost, bvD = cost;
  for (let k = 1; k <= n; k++) {
    const frac = k === 1 ? m / 12 : (k === n && m < 12 ? (12 - m) / 12 : 1);
    const s = Math.min(base / life * frac, bvS - residual);
    let d = k === n ? bvD - residual : bvD * (factor / life) * (k === 1 ? m / 12 : 1);
    d = Math.max(0, Math.min(d, bvD - residual));
    bvS -= s; bvD -= d;
    sl.push([s, bvS]); db.push([d, bvD]);
  }
  return { n, sl, db };
}

export const widgets = {
  'lla-methods': {
    type: 'formula',
    title: 'Straight line against declining balance, year by year',
    intro: 'Cost, residual value, useful life, the months used in the first financial year, and the declining-balance factor (2 for double-declining, 1.5 for 150%).',
    inputs: [
      { id: 'cost', label: 'Cost', min: 1000, max: 100000, step: 500, value: van.cost, fmt: 'money' },
      { id: 'residual', label: 'Residual value', min: 0, max: 20000, step: 500, value: van.residual, fmt: 'money' },
      { id: 'life', label: 'Useful life', min: 2, max: 15, step: 1, value: van.life, fmt: 'int', unit: 'years' },
      { id: 'months', label: 'Months used in the first financial year', min: 1, max: 12, step: 1, value: van.months, fmt: 'int', unit: 'months' },
      { id: 'factor', label: 'Declining-balance factor', min: 1.5, max: 2, step: 0.5, value: 2, fmt: 'num' },
    ],
    compute: (v) => {
      if (v.residual >= v.cost) return { error: 'The residual value must be less than the cost; otherwise there is nothing to depreciate.' };
      const { n, sl, db } = schedules(v.cost, v.residual, v.life, v.months, v.factor);
      const reach = db.findIndex((x) => x[1] <= v.residual + 0.005);
      const plug = db[n - 1][0];
      const rate = v.factor / v.life * 100;
      const reachText = reach >= 0 && reach < n - 1 ? `year ${reach + 1}, after which it charges nothing` : `the final year, which takes the ${money(plug)} still above the residual value`;
      return {
        headline: { label: 'First-year depreciation: straight line vs declining balance', value: `${money(sl[0][0])} vs ${money(db[0][0])}` },
        rows: [
          ['Depreciable amount (same for both)', money(v.cost - v.residual)],
          ['Declining-balance rate', `${rate.toFixed(1)}% of book value`],
          ['Book value after year 1, straight line', money(sl[0][1])],
          ['Book value after year 1, declining balance', money(db[0][1])],
          ['Financial years with depreciation', String(n)],
          ['Declining balance reaches the residual value in', reachText],
        ],
        note: `Both methods charge ${money(v.cost - v.residual)} in total and end at the residual value of ${money(v.residual)}; they differ only in timing. The declining-balance method applies ${rate.toFixed(1)}% to the falling book value, so its charge is largest in the first full year and shrinks after that. The first year bears ${v.months} month${v.months === 1 ? '' : 's'} under both methods.`,
        chart: {
          kind: 'line',
          x: { label: 'End of financial year', values: Array.from({ length: n + 1 }, (_, i) => i) },
          series: [
            { name: 'Book value, straight line', values: [v.cost, ...sl.map((x) => r2(x[1]))] },
            { name: 'Book value, declining balance', values: [v.cost, ...db.map((x) => r2(x[1]))] },
          ],
          y: { label: 'Dollars' },
        },
      };
    },
  },
  'lla-disposal': {
    type: 'formula',
    title: 'Selling an asset: gain or loss',
    intro: 'Straight-line depreciation up to the date of sale, then proceeds minus book value.',
    inputs: [
      { id: 'cost', label: 'Cost', min: 1000, max: 100000, step: 500, value: 48000, fmt: 'money' },
      { id: 'residual', label: 'Residual value', min: 0, max: 20000, step: 500, value: 6000, fmt: 'money' },
      { id: 'life', label: 'Useful life', min: 1, max: 15, step: 1, value: 6, fmt: 'int', unit: 'years' },
      { id: 'held', label: 'Months held before the sale', min: 1, max: 180, step: 1, value: 45, fmt: 'int', unit: 'months' },
      { id: 'proceeds', label: 'Sale proceeds', min: 0, max: 60000, step: 250, value: 20500, fmt: 'money' },
    ],
    compute: (v) => {
      if (v.residual >= v.cost) return { error: 'The residual value must be less than the cost.' };
      const perYear = (v.cost - v.residual) / v.life;
      const accum = Math.min(v.cost - v.residual, perYear / 12 * v.held);
      const bv = v.cost - accum;
      const g = v.proceeds - bv;
      const entry = `Debit Cash ${money(v.proceeds)} and Accumulated Depreciation ${money(accum)}${g < 0 ? ` and Loss on Sale ${money(-g)}` : ''}; credit the asset ${money(v.cost)}${g > 0 ? ` and Gain on Sale ${money(g)}` : ''}`;
      return {
        headline: { label: g > 0 ? 'Gain on sale' : g < 0 ? 'Loss on sale' : 'No gain or loss', value: money(Math.abs(g)) },
        rows: [
          ['Depreciation per year', money(perYear)],
          ['Accumulated depreciation at the sale', money(accum)],
          ['Book value at the sale', money(bv)],
          ['Entry', entry],
        ],
        note: g === 0
          ? 'The proceeds equal the book value exactly: the depreciation charged so far matched the asset’s decline.'
          : `The proceeds are ${money(Math.abs(g))} ${g > 0 ? 'above' : 'below'} book value. In hindsight, depreciation was ${g > 0 ? 'faster' : 'slower'} than the asset’s real decline; the ${g > 0 ? 'gain' : 'loss'} corrects that in the year of sale. Over the asset’s life the total charge to profit is always cost minus proceeds: ${money(v.cost - v.proceeds)}.`,
        chart: { kind: 'bar', x: { label: 'At the date of sale', values: ['Book value', 'Proceeds'] }, series: [{ name: 'Dollars', values: [r2(bv), v.proceeds] }], y: { label: 'Dollars' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f02-lla-g1', type: 'steps', kind: 'applied',
    prompt: 'A fictional dental practice buys an X-ray machine on 1 March 2026. The list price is $42,000, less a 5% trade discount. It pays non-refundable sales tax of 6% on the discounted price, $600 for delivery and $1,800 for installation and calibration. It also pays $750 to train its staff and $1,200 for a one-year service contract. The machine should last seven years and be worth $2,694 at the end; the practice uses the straight-line method with a full month in the month of purchase, and its year ends on 31 December.',
    solution: 'Discounted price 42,000 × 0.95 = 39,900; tax 39,900 × 0.06 = 2,394; cost = 39,900 + 2,394 + 600 + 1,800 = $44,694. Training is an expense; the service contract is a prepaid expense used up over the year. Depreciation = (44,694 − 2,694) ÷ 7 = 6,000 a year; March–December is ten months, so $5,000 for 2026.',
    steps: [
      { id: 'f02-lla-g1-s1', type: 'classify',
        prompt: 'Is each amount part of the machine’s cost?',
        items: ['Price after the trade discount', 'Sales tax that can’t be recovered', 'Delivery', 'Installation and calibration', 'Staff training', 'One-year service contract'],
        categories: ['Part of the machine’s cost', 'Not part of the cost (expense or prepayment)'],
        answer: [0, 0, 0, 0, 1, 1],
        feedback: {
          1: 'Tax the practice can’t reclaim is a cost of getting the machine.',
          4: 'Training improves the staff, not the machine; it would be needed for any new machine.',
          5: 'The contract buys servicing for a year: a prepaid expense, used up over the year.',
        },
        hints: ['Ask: was this needed to get the machine to the surgery and working?'] },
      { id: 'f02-lla-g1-s2', type: 'num',
        prompt: 'What is the machine’s cost? Round to the nearest dollar.',
        answer: 44694, check: () => 42000 * 0.95 + 42000 * 0.95 * 0.06 + 600 + 1800, unit: '$', places: 0, tol: 0.5,
        hints: ['Apply the discount first, then the tax on the discounted price.', '39,900 + 2,394 + 600 + 1,800.'],
        wrong: [
          { value: 46644, say: 'You included the training and the service contract. Neither is needed to get the machine ready for use.' },
          { value: 46920, say: 'You left out the trade discount: the price is 42,000 × 0.95, and the tax is on that.' },
          { value: 42300, say: 'Add the sales tax: it can’t be recovered, so it is part of the cost.' },
        ] },
      { id: 'f02-lla-g1-s3', type: 'num',
        prompt: 'What is depreciation for 2026? Round to the nearest dollar.',
        answer: 5000, check: () => (42000 * 0.95 * 1.06 + 600 + 1800 - 2694) / 7 * 10 / 12, unit: '$', places: 0, tol: 0.5,
        hints: ['Depreciable amount = cost − residual value.', '(44,694 − 2,694) ÷ 7 × 10/12.'],
        wrong: [
          { value: 6000, say: 'That is a full year. March to December is ten months.' },
          { value: 5320.71, say: 'You didn’t subtract the residual value from the cost.' },
          { value: 4500, say: 'That is nine months. With a full month in the month of purchase, March counts.' },
        ] },
    ],
  },
  {
    id: 'f02-lla-g2', type: 'steps', kind: 'numerical',
    prompt: 'A fictional courier company buys cargo e-bikes for $18,000 on 1 January 2026. It expects to use them for four years and sell them for $1,500. It uses the double-declining-balance method; its year ends on 31 December.',
    solution: 'Rate = 2 ÷ 4 = 50%. 2026: 18,000 × 0.5 = 9,000 (book value 9,000). 2027: 9,000 × 0.5 = 4,500 (4,500). 2028: 4,500 × 0.5 = 2,250 (2,250). 2029: 50% would be 1,125, but book value can’t fall below 1,500, so only 750 is charged. Total 16,500 = 18,000 − 1,500.',
    steps: [
      { id: 'f02-lla-g2-s1', type: 'num',
        prompt: 'What is the double-declining-balance rate? Enter a percentage. Give a whole-number percentage.',
        answer: 50, check: () => 2 / 4 * 100, unit: '%', places: 0, tol: 0.5,
        hints: ['The straight-line rate is 1 ÷ 4 = 25% a year.', 'Double it.'],
        wrong: [{ value: 25, say: 'That is the straight-line rate. Double-declining balance uses twice it.' }] },
      { id: 'f02-lla-g2-s2', type: 'num',
        prompt: 'What is depreciation for 2026? Round to the nearest dollar.',
        answer: 9000, check: () => 18000 * 0.5, unit: '$', places: 0, tol: 0.5,
        hints: ['Apply the rate to book value at the start of the year, which is the cost.', 'Residual value is not subtracted from the base.'],
        wrong: [
          { value: 8250, say: 'Under declining balance the rate applies to the full book value; residual value is only a floor.' },
          { value: 4125, say: 'That is straight line: (18,000 − 1,500) ÷ 4. Declining balance applies 50% to the book value.' },
        ] },
      { id: 'f02-lla-g2-s3', type: 'num',
        prompt: 'What is depreciation for 2027? Round to the nearest dollar.',
        answer: 4500, check: () => (18000 - 9000) * 0.5, unit: '$', places: 0, tol: 0.5,
        hints: ['Book value at 1 January 2027 = 18,000 − 9,000.'],
        wrong: [{ value: 9000, say: 'The rate applies to the falling book value, 9,000 at the start of 2027, not to the cost.' }] },
      { id: 'f02-lla-g2-s4', type: 'num',
        prompt: 'What is depreciation for 2029, the last year? Round to the nearest dollar.',
        answer: 750, check: () => 18000 * 0.5 ** 3 - 1500, unit: '$', places: 0, tol: 0.5,
        hints: ['Book value at 1 January 2029 is 2,250.', 'Book value may not fall below the $1,500 residual value.'],
        wrong: [{ value: 1125, say: '50% of 2,250 would take book value to 1,125, below the $1,500 residual value. Charge only enough to reach it.' }] },
    ],
  },
  {
    id: 'f02-lla-g3', type: 'steps', kind: 'applied',
    prompt: 'A fictional landscaping company bought a ride-on mower on 1 July 2023 for $26,000, expecting five years of use and a residual value of $2,000. It uses the straight-line method with a full month in the month of purchase; its year ends on 31 December. On 31 March 2027 it sells the mower for $11,500 in cash.',
    solution: 'Depreciation = (26,000 − 2,000) ÷ 5 = 4,800 a year, 400 a month. For January–March 2027, record 3 × 400 = 1,200. Accumulated depreciation July 2023–March 2027 = 45 months × 400 = 18,000; book value 8,000; gain 11,500 − 8,000 = $3,500. Entry: debit Cash 11,500 and Accumulated Depreciation—Equipment 18,000; credit Equipment 26,000 and Gain on Sale of Equipment 3,500.',
    steps: [
      { id: 'f02-lla-g3-s1', type: 'num',
        prompt: 'How much depreciation must be recorded for 2027 before the sale? Round to the nearest dollar.',
        answer: 1200, check: () => (26000 - 2000) / 5 / 12 * 3, unit: '$', places: 0, tol: 0.5,
        hints: ['Per month: (26,000 − 2,000) ÷ 5 ÷ 12.', 'January to March is three months.'],
        wrong: [{ value: 4800, say: 'That is a full year. The mower is sold at the end of March.' }] },
      { id: 'f02-lla-g3-s2', type: 'num',
        prompt: 'What is the mower’s book value on 31 March 2027? Round to the nearest dollar.',
        answer: 8000, check: () => 26000 - 400 * (6 + 12 + 12 + 12 + 3), unit: '$', places: 0, tol: 0.5,
        hints: ['Count the months from July 2023 to March 2027: 6 + 12 + 12 + 12 + 3.', 'Book value = cost − 45 × 400.'],
        wrong: [
          { value: 9200, say: 'That leaves out the 2027 depreciation. Update depreciation to the date of sale first.' },
          { value: 6000, say: 'That counts 50 months. July–December 2023 is six months, then three full years, then three months of 2027.' },
        ] },
      { id: 'f02-lla-g3-s3', type: 'num',
        prompt: 'What is the gain or loss on the sale? Enter a loss as a negative number. Round to the nearest dollar.',
        answer: 3500, check: () => 11500 - (26000 - 400 * 45), unit: '$', places: 0, tol: 0.5,
        hints: ['Gain (loss) = proceeds − book value.'],
        wrong: [
          { value: -3500, say: 'The proceeds (11,500) are more than the book value (8,000): that is a gain.' },
          { value: 2300, say: 'That uses the book value before the 2027 depreciation. Update it first.' },
        ] },
      { id: 'f02-lla-g3-s4', type: 'journal', chart: 'f02', date: '2027-03-31',
        prompt: 'Record the sale (after the 2027 depreciation has been recorded).',
        accounts: ['Cash', 'Equipment', 'Accumulated Depreciation—Equipment', 'Gain on Sale of Equipment', 'Loss on Sale of Equipment', 'Depreciation Expense', 'Catering Revenue'],
        lines: [{ acct: 'Cash', dr: 11500 }, { acct: 'Accumulated Depreciation—Equipment', dr: 18000 }, { acct: 'Equipment', cr: 26000 }, { acct: 'Gain on Sale of Equipment', cr: 3500 }],
        hints: ['Remove the asset at its cost (credit) and its accumulated depreciation (debit).', 'The difference between the debits and the credits is the gain.'] },
    ],
  },
  {
    id: 'f02-lla-g4', type: 'steps', kind: 'numerical',
    prompt: 'A fictional university bought laboratory equipment on 1 January 2023 for $90,000, with a ten-year life and a residual value of $10,000, depreciated on a straight line. On 1 January 2026 it decides the equipment will last only four more years and be worth $6,000 at the end.',
    solution: 'Old depreciation = (90,000 − 10,000) ÷ 10 = 8,000 a year. Book value at 1 January 2026 = 90,000 − 3 × 8,000 = 66,000. New depreciation = (66,000 − 6,000) ÷ 4 = $15,000 a year from 2026. The 2023–2025 figures are not restated.',
    steps: [
      { id: 'f02-lla-g4-s1', type: 'num',
        prompt: 'What is the book value on 1 January 2026? Round to the nearest dollar.',
        answer: 66000, check: () => 90000 - 3 * (90000 - 10000) / 10, unit: '$', places: 0, tol: 0.5,
        hints: ['Three years of the original depreciation have been charged.'],
        wrong: [{ value: 63000, say: 'That uses 9,000 a year, ignoring the residual value. The original charge was (90,000 − 10,000) ÷ 10.' }] },
      { id: 'f02-lla-g4-s2', type: 'num',
        prompt: 'What is depreciation for 2026? Round to the nearest dollar.',
        answer: 15000, check: () => (66000 - 6000) / 4, unit: '$', places: 0, tol: 0.5,
        hints: ['Spread the remaining book value, less the new residual value, over the remaining life.'],
        wrong: [
          { value: 16500, say: 'Subtract the new residual value before dividing: (66,000 − 6,000) ÷ 4.' },
          { value: 21000, say: 'That restarts from cost over seven years and adds a catch-up. A change in estimate uses the current book value and the remaining life only.' },
        ] },
      { id: 'f02-lla-g4-s3', type: 'mc',
        prompt: 'What happens to the depreciation recorded for 2023–2025?',
        options: [
          'Nothing: the change applies from 2026 onward',
          'It is restated using the new seven-year life',
          'The difference is recorded as a loss in 2026',
          'It is reversed and the equipment is revalued to fair value',
        ],
        answer: 0,
        feedback: {
          1: 'Restatement is for errors. A new estimate based on new information is applied prospectively.',
          2: 'There is no catch-up charge: the higher depreciation in the remaining years absorbs the change.',
          3: 'Revaluation is an IFRS policy choice for whole classes of assets, not a way to handle a change in useful life.',
        },
        hints: ['Was the original estimate an error, or the best information at the time?'] },
    ],
  },
];

export const independent = [
  {
    id: 'f02-lla-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional airline buys an engine for $2,400,000. It expects 20,000 flight hours from it, after which it can be sold for $200,000. In 2026 the engine flies 2,600 hours. What is depreciation for 2026 under the units-of-production method? Round to the nearest dollar.',
    answer: 286000, check: () => (2400000 - 200000) / 20000 * 2600, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 312000, say: 'Subtract the residual value first: (2,400,000 − 200,000) ÷ 20,000 = 110 an hour.' },
      { value: 110, say: 'That is the rate per flight hour. Multiply by the 2,600 hours flown.' },
    ],
    solution: 'Rate = (2,400,000 − 200,000) ÷ 20,000 = $110 per flight hour. Depreciation = 2,600 × 110 = $286,000.',
  },
  {
    id: 'f02-lla-i2', type: 'journal', kind: 'applied', chart: 'f02', date: '2026-12-31',
    prompt: 'On 1 January 2026 a fictional clothing brand pays $56,000 for a patent on a waterproof fabric. The patent has 14 years of legal life left, but the brand expects the fabric to be overtaken by newer ones in eight years. Record the amortisation for 2026.',
    accounts: ['Amortisation Expense', 'Accumulated Amortisation—Patents', 'Patents', 'Depreciation Expense', 'Accumulated Depreciation—Equipment', 'Cash'],
    lines: [{ acct: 'Amortisation Expense', dr: 7000 }, { acct: 'Accumulated Amortisation—Patents', cr: 7000 }],
    solution: 'Amortise over the shorter of the legal life (14 years) and the useful life (8 years): 56,000 ÷ 8 = $7,000. Debit Amortisation Expense 7,000; credit Accumulated Amortisation—Patents 7,000.',
  },
  {
    id: 'f02-lla-i3', type: 'num', kind: 'numerical',
    prompt: 'A fictional hotel buys kitchen equipment for $40,000 on 1 September 2026, with an eight-year life. It uses double-declining balance with a full month in the month of purchase; its year ends on 31 December. What is depreciation for 2027? Give dollars and cents.',
    answer: 9166.67, check: () => (40000 - 40000 * 0.25 * 4 / 12) * 0.25, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 10000, say: 'That applies 25% to the cost. In 2027 the base is the book value after 2026’s four months, 36,666.67.' },
      { value: 7500, say: 'That is 25% of book value after a full first year. 2026 had only four months: September to December.' },
      { value: 5000, say: 'That is the straight-line charge, 40,000 ÷ 8. Double-declining balance applies 25% to book value.' },
    ],
    solution: 'Rate = 2 ÷ 8 = 25%. 2026: 40,000 × 0.25 × 4/12 = 3,333.33; book value 36,666.67. 2027: 36,666.67 × 0.25 = $9,166.67.',
  },
  {
    id: 'f02-lla-i4', type: 'mc', kind: 'conceptual',
    prompt: 'A US private company that reports under US GAAP buys another business and records $300,000 of goodwill. Which statement is correct?',
    options: [
      'It may elect to amortise the goodwill on a straight-line basis over ten years or less.',
      'It must amortise the goodwill over 40 years and may never test it for impairment.',
      'It may not record goodwill at all, because only public companies can recognise it.',
      'It must test the goodwill for impairment each year and may never amortise it, like an IFRS company.',
    ],
    answer: 0,
    feedback: {
      1: 'Forty-year amortisation is an old rule, long replaced. Under the private-company alternative the life is ten years or less, and impairment is still tested when an event suggests it.',
      2: 'Any acquirer recognises goodwill bought in an acquisition; what differs is the later accounting.',
      3: 'That is the default for public companies (and the IFRS rule), but a private company may elect the alternative.',
    },
    solution: 'Under the accounting alternative introduced by ASU 2014-02, a private company (or not-for-profit) may amortise goodwill on a straight-line basis over ten years, or less if another life is more appropriate, and test it for impairment only when a triggering event occurs. Public companies don’t amortise goodwill; they test it at least annually.',
  },
  {
    id: 'f02-lla-i5', type: 'classify', kind: 'conceptual',
    prompt: 'For each practice, say whether it is allowed under US GAAP, under IFRS, under both or under neither.',
    items: [
      'Carrying a class of buildings at fair value, with increases taken to other comprehensive income',
      'Reversing an impairment loss on equipment when conditions improve',
      'Depreciating a delivery fleet by miles driven',
      'Writing equipment up above its cost because its market price has risen, with the increase taken to net income',
      'Depreciating a building’s roof separately from its structure',
      'A public company amortising goodwill over ten years',
    ],
    categories: ['Both', 'IFRS only', 'US GAAP only', 'Neither'],
    answer: [1, 1, 0, 3, 0, 3],
    feedback: {
      0: 'The revaluation model is an IAS 16 option; US GAAP permits only the cost model.',
      1: 'IAS 36 reverses impairment losses on assets other than goodwill; US GAAP never reverses them.',
      3: 'US GAAP doesn’t allow revaluation at all, and under IFRS a revaluation increase goes to other comprehensive income, not net income (unless it reverses an earlier decrease).',
      4: 'IAS 16 requires component depreciation; US GAAP permits it without requiring it.',
      5: 'Public companies test goodwill for impairment instead; only US private companies and not-for-profits may elect to amortise it.',
    },
    solution: 'Revaluation and impairment reversals: IFRS only. Units of production and component depreciation: both (components required under IFRS, permitted under US GAAP). A write-up taken to net income, and goodwill amortisation by a public company: neither.',
  },
  {
    id: 'f02-lla-i6', type: 'journal', kind: 'applied', chart: 'f02', date: '2026-11-30',
    prompt: 'A fictional café scraps a coffee roaster that cost $15,000. After depreciation has been brought up to date, its accumulated depreciation is $12,600. Nobody will buy it, and the scrap dealer takes it away for nothing. Record the disposal.',
    accounts: ['Equipment', 'Accumulated Depreciation—Equipment', 'Loss on Sale of Equipment', 'Gain on Sale of Equipment', 'Depreciation Expense', 'Cash'],
    lines: [{ acct: 'Accumulated Depreciation—Equipment', dr: 12600 }, { acct: 'Loss on Sale of Equipment', dr: 2400 }, { acct: 'Equipment', cr: 15000 }],
    solution: 'Book value = 15,000 − 12,600 = 2,400, and nothing is received, so the loss is $2,400. Debit Accumulated Depreciation—Equipment 12,600 and Loss on Sale of Equipment 2,400; credit Equipment 15,000.',
  },
];

export const check = [
  {
    id: 'f02-lla-k1', type: 'num', kind: 'numerical',
    prompt: 'A fictional hotel buys laundry machines on 1 May 2026 for $64,800. They should last six years and be worth $4,800 at the end. The hotel uses the straight-line method with a full month in the month of purchase; its year ends on 31 December. What is depreciation for 2026? Give dollars and cents.',
    answer: 6666.67, check: () => (64800 - 4800) / 6 * 8 / 12, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 10000, say: 'That is a full year. May to December is eight months.' },
      { value: 7200, say: 'Subtract the residual value first: (64,800 − 4,800) ÷ 6.' },
      { value: 5833.33, say: 'That is seven months. With a full month in the month of purchase, May counts.' },
    ],
    solution: '(64,800 − 4,800) ÷ 6 = 10,000 a year. May–December is eight months: 10,000 × 8/12 = $6,666.67.',
  },
  {
    id: 'f02-lla-k2', type: 'mc', kind: 'conceptual',
    prompt: 'A machine bought two years ago was expected to last eight years. On 1 January the company decides it will last only three more years. What should it do?',
    options: [
      'Spread the current book value, less residual value, over the three years left',
      'Restate the past two years’ depreciation using the new five-year total life',
      'Record the extra depreciation for past years as a loss this year, then continue as before',
      'Keep the original schedule until the machine is sold',
    ],
    answer: 0,
    feedback: {
      1: 'Restatement is for errors. A revised estimate is applied prospectively.',
      2: 'There is no catch-up: the higher charge in the remaining years absorbs the change.',
      3: 'Estimates must be updated when new information arrives; IAS 16 requires a review at least every year-end.',
    },
    solution: 'A change in useful life is a change in accounting estimate: depreciate (book value − residual value) over the remaining three years. Earlier years are not restated.',
  },
  {
    id: 'f02-lla-k3', type: 'journal', kind: 'applied', chart: 'f02', date: '2026-10-31',
    prompt: 'A fictional battery-storage installer sells a service van that cost $42,000. Accumulated depreciation, brought up to the date of sale, is $25,200. The buyer pays $15,000 in cash. Record the sale.',
    accounts: ['Cash', 'Van', 'Accumulated Depreciation—Van', 'Loss on Sale of Equipment', 'Gain on Sale of Equipment', 'Depreciation Expense'],
    lines: [{ acct: 'Cash', dr: 15000 }, { acct: 'Accumulated Depreciation—Van', dr: 25200 }, { acct: 'Loss on Sale of Equipment', dr: 1800 }, { acct: 'Van', cr: 42000 }],
    solution: 'Book value = 42,000 − 25,200 = 16,800; proceeds 15,000; loss 1,800. Debit Cash 15,000, Accumulated Depreciation—Van 25,200 and Loss on Sale of Equipment 1,800; credit Van 42,000.',
  },
  {
    id: 'f02-lla-k4', type: 'multi', kind: 'conceptual',
    prompt: 'A fictional bakery buys a plot of land, demolishes an old shed on it and builds a new shop. Which costs are capitalised as part of an asset (land, land improvements or building) rather than expensed? Select all that apply.',
    options: [
      'Legal fees for buying the land',
      'Demolishing the old shed, less the value of materials recovered',
      'The architect’s fees for the new shop',
      'A fence and lighting around the customer car park',
      'Training staff to use the new ovens',
      'Insurance on the shop for its first year of trading',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'Training improves the staff, not an asset: it is an expense.',
      5: 'Insurance once the shop is trading is a cost of operating it (a prepaid expense, then an expense), not of building it.',
    },
    solution: 'Legal fees and demolition are part of the land’s cost; the architect’s fees are part of the building; the fence and lighting are land improvements, capitalised and depreciated. Training and first-year insurance are expenses of running the business.',
  },
  {
    id: 'f02-lla-k5', type: 'num', kind: 'applied',
    prompt: 'Lantern’s espresso equipment cost $12,000 on 3 March 2026, with a five-year life and no residual value, and Lantern charges a full month in the month of purchase. Suppose its accountant had chosen the double-declining-balance method instead of the straight line. What would depreciation for 2026 have been? Round to the nearest dollar.',
    answer: 4000, check: () => FACTS.equipment.cost * (2 / FACTS.equipment.life) * FACTS.equipment.months / 12, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 2000, say: 'That is the straight-line charge Lantern actually recorded (200 × 10).' },
      { value: 4800, say: 'That is a full year at 40%. The equipment was used for ten months of 2026.' },
      { value: 4400, say: 'That is eleven months. March to December is ten months.' },
    ],
    solution: 'Rate = 2 ÷ 5 = 40%. 2026: 12,000 × 0.40 × 10/12 = $4,000, twice the straight-line $2,000.',
  },
  {
    id: 'f02-lla-k6', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the comparison.',
    text: 'Under US GAAP a public company [[0]] goodwill and tests it for impairment at least annually. Under IFRS, property, plant and equipment may be carried at [[1]] if a whole class is revalued, and each significant part of an asset is depreciated [[2]]. An impairment loss on equipment [[3]] be reversed under US GAAP.',
    blanks: [
      { options: ['does not amortise', 'amortises over ten years', 'amortises over 40 years'], answer: 0 },
      { options: ['fair value', 'replacement cost', 'tax value'], answer: 0 },
      { options: ['separately', 'together with the rest', 'only if the auditor asks'], answer: 0 },
      { options: ['may not', 'must', 'may'], answer: 0 },
    ],
    solution: 'Public companies don’t amortise goodwill; they test it at least annually. IAS 16 allows the revaluation model (fair value) for a whole class and requires component depreciation. US GAAP never reverses impairment losses; IAS 36 reverses them except for goodwill.',
  },
];
