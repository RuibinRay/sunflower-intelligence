// transforming-data.ex.js — B02 · Transforming and reshaping data: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// All tables are small fictional extracts, laid out like the course datasets but not taken from them.

const DAY = 86400000;
const nightsBetween = (y1, m1, d1, y2, m2, d2) => (Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / DAY;
const money = (x) => `${x < 0 ? '−' : ''}$${Math.abs(x).toFixed(2)}`;

export const widgets = {
  'tr-derive': {
    type: 'cleaning',
    dataset: 'harborview-bookings',
    ops: ['derive'],
    watch: ['check_in', 'check_out', 'nights', 'rate', 'total'],
    task: 'Derive <code>nights_calc</code> = check_out − check_in and <code>total_calc</code> = nights × rate, and compare each with the stored <code>nights</code> and <code>total</code>. List the bookings where they disagree. For each one, use the third column as evidence: which value is wrong, and what should it be? Record your rule before changing anything.',
  },
  'tr-join': {
    type: 'formula',
    title: 'How repeated keys inflate a join',
    intro: 'An orders table is joined to a product-cost table on <code>product</code>. Some products have more than one cost row; some have none.',
    inputs: [
      { id: 'orders', label: 'Orders in the left table', min: 10, max: 1000, step: 10, value: 200, fmt: 'int', unit: 'rows' },
      { id: 'dup', label: 'Orders for products with repeated cost rows', min: 0, max: 100, step: 1, value: 30, fmt: 'pct' },
      { id: 'copies', label: 'Cost rows for each repeated product', min: 2, max: 5, step: 1, value: 2, fmt: 'int', unit: 'rows' },
      { id: 'miss', label: 'Orders for products with no cost row', min: 0, max: 50, step: 1, value: 5, fmt: 'pct' },
    ],
    compute: (v) => {
      if (v.dup + v.miss > 100) return { error: 'The two shares of orders can’t add up to more than 100%.' };
      const dupRows = Math.round((v.orders * v.dup) / 100);
      const missRows = Math.round((v.orders * v.miss) / 100);
      const once = v.orders - dupRows - missRows;
      const inner = once + dupRows * v.copies;
      const left = inner + missRows;
      const extra = left - v.orders;
      let note;
      if (!dupRows && !missRows) note = 'Every order matches exactly one cost row, so the inner and left joins both return one row per order. This is the lookup you want.';
      else {
        note = dupRows
          ? `The left join keeps all ${v.orders} orders but repeats each of the ${dupRows} orders for repeated products ${v.copies} times, adding ${extra} rows that nothing flags. Summing revenue from it double-counts those orders. `
          : `No product has repeated cost rows, so the left join returns one row per order. `;
        if (missRows) note += `An inner join would also drop the ${missRows} orders that have no cost row, without any warning. `;
        note += 'Make the cost table’s key unique (or add the cost period to the key) and compare row counts before and after.';
      }
      return {
        headline: { label: 'Rows after a left join', value: `${left} (the orders table has ${v.orders})` },
        rows: [
          ['Rows after an inner join', `${inner}`],
          ['Extra rows created by repeated keys', `${extra}`],
          ['Orders an inner join would drop', `${missRows}`],
          ['Revenue overstated by (if those orders are of typical size)', `${((100 * extra) / v.orders).toFixed(1)}%`],
        ],
        note,
        chart: { kind: 'bar', x: { label: 'Table', values: ['Orders', 'Inner join', 'Left join'] }, series: [{ name: 'Rows', values: [v.orders, inner, left] }], y: { label: 'Rows' } },
      };
    },
  },
  'tr-averages': {
    type: 'formula',
    title: 'The overall average and the average of averages',
    intro: 'Two groups of orders: many regular orders and a few bulk orders.',
    inputs: [
      { id: 'nA', label: 'Regular orders', min: 1, max: 500, step: 1, value: 300, fmt: 'int', unit: 'orders' },
      { id: 'mA', label: 'Average regular order', min: 5, max: 150, step: 0.5, value: 25, fmt: 'money' },
      { id: 'nB', label: 'Bulk orders', min: 1, max: 500, step: 1, value: 20, fmt: 'int', unit: 'orders' },
      { id: 'mB', label: 'Average bulk order', min: 5, max: 150, step: 0.5, value: 120, fmt: 'money' },
    ],
    compute: (v) => {
      const n = v.nA + v.nB;
      const revenue = v.nA * v.mA + v.nB * v.mB;
      const overall = revenue / n;
      const plain = (v.mA + v.mB) / 2;
      const gap = plain - overall;
      const bigger = v.nA >= v.nB ? 'regular' : 'bulk';
      const share = (100 * Math.max(v.nA, v.nB)) / n;
      const note = Math.abs(gap) < 0.005
        ? 'Here the two agree, because the groups are the same size or have the same average. Change either and they separate.'
        : `The overall average is pulled towards the larger group (${bigger} orders, ${share.toFixed(1)}% of all orders). The plain average of the two averages weights both groups equally, as if each were half of all orders, so it is ${gap > 0 ? 'higher' : 'lower'} by ${money(Math.abs(gap))}. Report the overall figure for “average order value”.`;
      return {
        headline: { label: 'Overall average order value (revenue ÷ orders)', value: money(overall) },
        rows: [
          ['Plain average of the two group averages', money(plain)],
          ['Gap (plain − overall)', money(gap)],
          ['Bulk orders as a share of all orders', `${((100 * v.nB) / n).toFixed(1)}%`],
          ['Total revenue', money(revenue)],
        ],
        note,
        chart: { kind: 'bar', x: { label: 'Average', values: ['Regular', 'Bulk', 'Overall', 'Plain average'] }, series: [{ name: 'Dollars per order', values: [v.mA, v.mB, Math.round(overall * 100) / 100, Math.round(plain * 100) / 100] }], y: { label: 'Dollars per order' } },
      };
    },
  },
};

const LANTERN_SIX = {
  head: ['Order', 'Product', 'Qty', 'Unit price ($)', 'Discount ($)', 'Stored total ($)'],
  rows: [
    ['1', 'Colombia Huila 250g', '2', '17.00', '3.40', '30.60'],
    ['2', 'Espresso Roast 1kg', '1', '49.00', '5.00', '49.00'],
    ['3', 'Decaf Colombia 250g', '3', '16.50', '0.00', '49.50'],
    ['4', 'Cold Brew Pack', '2', '22.00', '0.00', '50.50'],
    ['5', 'Sumatra Mandheling 250g', '1', '18.00', '1.80', '16.20'],
    ['6', 'House Blend 1kg', '1', '46.00', '0.00', '64.00'],
  ],
};
const TEN_VALUES = [14, 17, 22, 28, 31, 39, 46, 58, 92, 116];

export const guided = [
  {
    id: 'b02-tr-g1', type: 'steps', kind: 'applied',
    prompt: 'Six orders from a fictional extract laid out like <code>lantern-orders</code>. Each <code>order_total</code> should equal quantity × unit_price − discount. Lantern records its $6.50 shipping charge in a separate column.',
    solution: 'Derived totals: order 1, 2 × 17.00 − 3.40 = 30.60 (agrees); order 2, 49.00 − 5.00 = 44.00 (stored 49.00); order 3, 3 × 16.50 = 49.50 (agrees); order 4, 2 × 22.00 = 44.00 (stored 50.50); order 5, 18.00 − 1.80 = 16.20 (agrees); order 6, 46.00 (stored 64.00). The size of each gap points to its cause: order 2’s equals its discount, order 4’s is the $6.50 shipping charge, and order 6’s is $18.00, a multiple of 9, with 46 written as 64.',
    steps: [
      { id: 'b02-tr-g1-s1', type: 'rows',
        prompt: 'Select every order whose stored total disagrees with quantity × unit_price − discount.',
        data: { table: LANTERN_SIX },
        answer: [1, 3, 5],
        hints: ['Work row by row: multiply quantity by unit price, subtract the discount, and compare with the last column.', 'Three orders disagree. Order 1, for example, gives 2 × 17.00 − 3.40 = 30.60, which agrees.'] },
      { id: 'b02-tr-g1-s2', type: 'num',
        prompt: 'By how many dollars does order 6’s stored total exceed its derived total?',
        answer: 18, check: () => 64.00 - (1 * 46.00 - 0.00), unit: '$', places: 2, tol: 0.005,
        hints: ['The derived total is 1 × 46.00 − 0.00.', 'Subtract the derived total from the stored total.'],
        wrong: [
          { value: -18, say: 'Subtract the derived total from the stored total; the stored value is the larger one.' },
          { value: 46, say: 'That is the derived total itself. The question asks for the gap between stored and derived.' },
        ] },
      { id: 'b02-tr-g1-s3', type: 'classify',
        prompt: 'Match each disagreeing order to its most likely cause.',
        items: ['Order 2', 'Order 4', 'Order 6'],
        categories: ['Discount not subtracted', 'Shipping charge included', 'Two digits swapped'],
        answer: [0, 1, 2],
        hints: ['Compare each gap with the order’s discount, with $6.50, and with multiples of 9.', 'Order 2’s gap is $5.00, the same as its discount.'],
        feedback: {
          0: 'Order 2’s stored $49.00 is the value before its $5.00 discount: the gap equals the discount.',
          1: 'Order 4’s gap is exactly $6.50, the shipping charge, which belongs in its own column.',
          2: 'Order 6’s gap of $18.00 divides exactly by 9, and 64 is 46 with its digits reversed.',
        } },
    ],
  },
  {
    id: 'b02-tr-g2', type: 'num', kind: 'numerical',
    prompt: 'A Harborview Hotel guest checks in on 27 February 2026 and checks out on 3 March 2026. How many nights should the booking record?',
    answer: 4, check: () => nightsBetween(2026, 2, 27, 2026, 3, 3), unit: 'nights', places: 0, tol: 0,
    hints: ['Count the nights one by one: the night of 27 February, the night of 28 February, …', 'February 2026 is not a leap year, so it ends on the 28th. The check-out day is not a night.'],
    wrong: [
      { value: 5, say: 'You either counted the dates from 27 February to 3 March inclusive or gave February 29 days. Nights stop before the check-out day, and February 2026 has 28 days.' },
      { value: 6, say: 'February 2026 has 28 days, not 30. Count the nights of 27 and 28 February, then 1 and 2 March.' },
      { value: -24, say: 'You subtracted the day numbers (3 − 27). Subtract the dates instead, counting across the month end.' },
    ],
    solution: 'Nights run from the check-in date up to, but not including, the check-out date: 27 and 28 February, then 1 and 2 March, so 4 nights. In any tool, convert both columns to dates and subtract: 3 March 2026 − 27 February 2026 = 4 days.',
  },
  {
    id: 'b02-tr-g3', type: 'steps', kind: 'numerical',
    prompt: 'Ten fictional Lantern order values, before discount: $14, $17, $22, $28, $31, $39, $46, $58, $92 and $116.',
    solution: 'Width = (116 − 14) ÷ 4 = 25.5, so the edges are 14, 39.5, 65, 90.5 and 116. The bins hold 6, 2, 0 and 2 orders: the third is empty because two large orders stretch the range. Four orders ($46, $58, $92, $116) reach the $40 promotion threshold.',
    steps: [
      { id: 'b02-tr-g3-s1', type: 'num',
        prompt: 'What is the width of each bin if you split these values into 4 equal-width bins?',
        answer: 25.5, check: () => (Math.max(...TEN_VALUES) - Math.min(...TEN_VALUES)) / 4, unit: '$', places: 2, tol: 0.005,
        hints: ['Width = (maximum − minimum) ÷ number of bins.', '(116 − 14) ÷ 4.'],
        wrong: [
          { value: 29, say: 'You divided the maximum by 4. Divide the range, maximum minus minimum, by the number of bins.' },
          { value: 10.2, say: 'You divided the range by the number of values. Divide it by the number of bins.' },
        ] },
      { id: 'b02-tr-g3-s2', type: 'num',
        prompt: 'How many orders fall in the first bin, from $14 up to and including $39.50?',
        answer: 6, check: () => TEN_VALUES.filter((x) => x <= 14 + 25.5).length, unit: 'orders', places: 0, tol: 0,
        hints: ['The first edge above the minimum is 14 + 25.5 = 39.5.', 'Count the values from $14 to $39.50.'],
        wrong: [{ value: 5, say: 'Include the $39 order: it is below the edge of $39.50.' }] },
      { id: 'b02-tr-g3-s3', type: 'num',
        prompt: 'Lantern’s $5 promotion code needs an order value of $40 or more. How many of the ten orders qualify?',
        answer: 4, check: () => TEN_VALUES.filter((x) => x >= 40).length, unit: 'orders', places: 0, tol: 0,
        hints: ['This is a business-defined band with its edge at $40, including $40 itself.'],
        wrong: [{ value: 6, say: 'That is the size of the first equal-width bin. Here the edge is the business threshold of $40.' }] },
      { id: 'b02-tr-g3-s4', type: 'mc',
        prompt: 'Which statement about the four equal-width bins is true?',
        options: [
          'The third bin (over $65 up to $90.50) is empty, because the two largest orders stretch the range.',
          'Every bin holds two or three orders.',
          'Removing the $116 order would leave every bin edge unchanged.',
          'Equal-width bins always hold the same number of orders.',
        ],
        answer: 0,
        hints: ['List the edges: 14, 39.5, 65, 90.5 and 116, then count the orders in each bin.'],
        feedback: {
          1: 'Count again: the first bin holds six orders and the third none.',
          2: 'The edges depend on the maximum. Without $116 the range shrinks and every edge moves.',
          3: 'That describes equal-frequency bins. Equal-width bins have equal widths, so their counts follow the shape of the data.',
        } },
    ],
  },
  {
    id: 'b02-tr-g4', type: 'steps', kind: 'numerical',
    prompt: 'Harborview left-joins 8 bookings to a rate card on <code>room_type</code>. The rate card lists Deluxe twice (a weekday and a weekend rate), and its Family row was typed with a trailing space, “Family ”, so it no longer matches “Family”. The table counts the rows for each key as it is stored.',
    data: { table: {
      head: ['Key as stored', 'Rows in bookings', 'Rows in rate card'],
      rows: [['Standard', '2', '1'], ['Deluxe', '4', '2'], ['Family', '1', '0'], ['“Family ” (trailing space)', '0', '1'], ['Suite', '1', '1']],
    } },
    solution: 'Inner join: 2 × 1 + 4 × 2 + 1 × 0 + 1 × 1 = 11 rows. Left join: 11 + the unmatched Family booking = 12. Full join: 12 + the unmatched “Family ” rate row = 13. Two fixes are needed: trim the keys so that Family matches, and give the rate card one row per key (for example by adding the day type to the key). A left join then returns exactly 8 rows.',
    steps: [
      { id: 'b02-tr-g4-s1', type: 'num', prompt: 'How many rows does an inner join return?',
        answer: 11, check: () => 2 * 1 + 4 * 2 + 1 * 0 + 0 * 1 + 1 * 1, unit: 'rows', places: 0, tol: 0,
        hints: ['For each key, multiply the rows in bookings by the rows in the rate card, then add.', 'Standard 2 × 1, Deluxe 4 × 2, Family 1 × 0, Suite 1 × 1.'],
        wrong: [
          { value: 8, say: 'That is the number of bookings. Each Deluxe booking matches two rate rows, and the Family booking matches none.' },
          { value: 12, say: 'That is the left join, which also keeps the unmatched Family booking. An inner join drops it.' },
          { value: 7, say: 'You dropped the Family booking but forgot that each Deluxe booking matches two rows: 2 + 4 × 2 + 1.' },
        ] },
      { id: 'b02-tr-g4-s2', type: 'num', prompt: 'How many rows does a left join (bookings on the left) return?',
        answer: 12, check: () => 2 * 1 + 4 * 2 + 1 * Math.max(0, 1) + 1 * 1, unit: 'rows', places: 0, tol: 0,
        hints: ['Left join = inner join + left rows that found no match.', 'Which booking found no match?'],
        wrong: [
          { value: 8, say: 'A left join keeps every booking at least once, but each of the four Deluxe bookings appears twice.' },
          { value: 11, say: 'That is the inner join. The left join also keeps the Family booking, with the rate missing.' },
        ] },
      { id: 'b02-tr-g4-s3', type: 'num', prompt: 'How many rows does a full outer join return?',
        answer: 13, check: () => 11 + 1 + 1, unit: 'rows', places: 0, tol: 0,
        hints: ['Full join = inner join + unmatched left rows + unmatched right rows.'],
        wrong: [{ value: 12, say: 'That is the left join. A full join also keeps the rate-card row “Family ”, which matched no booking.' }] },
      { id: 'b02-tr-g4-s4', type: 'mc', prompt: 'What should be fixed before this join is used to price bookings?',
        options: [
          'Trim spaces in both key columns, and add the day type to the join key (or keep one Deluxe rate per booking) so that each booking matches exactly one rate row.',
          'Nothing: the left join kept every booking, so it worked.',
          'Switch to an inner join so that unmatched bookings disappear.',
          'Remove the Deluxe bookings from the analysis.',
        ],
        answer: 0,
        hints: ['Two separate problems change the row count: one adds rows and one leaves a booking unmatched.'],
        feedback: {
          1: 'It kept every booking, but four of them twice, and the Family booking has no rate. The row counts reveal both problems.',
          2: 'An inner join hides the Family problem by dropping the booking, and it still doubles the Deluxe rows.',
          3: 'The bookings are fine; the rate card is at the wrong granularity for a join on room type alone.',
        } },
    ],
  },
];

export const independent = [
  {
    id: 'b02-tr-i1', type: 'num', kind: 'numerical',
    prompt: 'Skylark Air, a fictional regional airline, reports one week’s average departure delay by route: Route A, 120 flights averaging 8 minutes; Route B, 30 flights averaging 26 minutes; Route C, 50 flights averaging 14 minutes. What is the average delay per flight across all three routes?',
    answer: 12.2, check: () => (120 * 8 + 30 * 26 + 50 * 14) / (120 + 30 + 50), unit: 'minutes', places: 1, tol: 0.05,
    wrong: [{ value: 16, say: 'That is the plain average of the three route averages, which treats Route B’s 30 flights as a third of all flights. Weight each average by its number of flights.' }],
    solution: 'Total delay = 120 × 8 + 30 × 26 + 50 × 14 = 960 + 780 + 700 = 2,440 minutes over 200 flights, so 2,440 ÷ 200 = 12.2 minutes per flight. The plain average of the route averages, (8 + 26 + 14) ÷ 3 = 16, overstates it because the most delayed route has the fewest flights.',
  },
  {
    id: 'b02-tr-i2', type: 'mc', kind: 'applied',
    prompt: 'Lantern wants every order listed with the customer’s sign-up date from its customer table. Some orders come from guest checkouts and have no customer record. No order may be lost, and customers who never ordered should not appear. Which join should the analyst use?',
    options: ['A left join with the orders table on the left', 'An inner join', 'A left join with the customer table on the left', 'A full outer join'],
    answer: 0,
    feedback: {
      1: 'An inner join drops the guest orders, because their keys have no match in the customer table.',
      2: 'This keeps every customer, including those who never ordered, and drops the guest orders.',
      3: 'A full join keeps every order, but it also adds a row for every customer who never ordered, which the request rules out.',
    },
    solution: 'The orders table must stay whole, so it goes on the left of a left join; guest orders keep their row with the sign-up date missing. Afterwards, check that the joined table has exactly as many rows as the orders table. If it has more, the customer table holds repeated customer ids.',
  },
  {
    id: 'b02-tr-i3', type: 'order', kind: 'applied',
    prompt: 'Put these steps for producing Lantern’s monthly revenue report by region in the order they must run.',
    items: [
      'Make a working copy of the raw export and leave the original untouched.',
      'Convert order dates and prices to proper date and number types.',
      'Derive each order’s month and expected total, and resolve disagreements with <code>order_total</code>.',
      'Group by region and month, sum revenue, and check the sums against the overall total.',
      'Pivot the months into columns for the board report.',
    ],
    solution: 'Each step needs the one before it. The raw file is protected first. Dates and prices must be real dates and numbers before you can derive a month or multiply quantity by price. Totals must be checked before they are summed, because a sum hides the bad rows. The pivot is the last step because it is for people to read; analysis continues from the long, aggregated table.',
  },
  {
    id: 'b02-tr-i4', type: 'num', kind: 'numerical',
    prompt: 'Two tables are joined on a key. The table shows how many rows each key value has on each side. How many rows does a full outer join return?',
    data: { table: { head: ['Key', 'Rows in left table', 'Rows in right table'], rows: [['A', '3', '1'], ['B', '2', '2'], ['C', '1', '0'], ['D', '0', '2'], ['E', '4', '1']] } },
    answer: 14, check: () => (3 * 1 + 2 * 2 + 1 * 0 + 0 * 2 + 4 * 1) + 1 + 2, unit: 'rows', places: 0, tol: 0,
    wrong: [
      { value: 11, say: 'That is the inner join. A full join also keeps the unmatched left row (key C) and the two unmatched right rows (key D).' },
      { value: 12, say: 'That is the left join. Add the two right rows with key D, which match nothing on the left.' },
      { value: 16, say: 'You added the two tables’ row counts (10 + 6). Matched keys multiply: key B gives 2 × 2 = 4 rows.' },
    ],
    solution: 'Inner join: A 3 × 1 = 3, B 2 × 2 = 4, E 4 × 1 = 4, a total of 11. Unmatched rows: key C has 1 left row with no right match, and key D has 2 right rows with no left match. Full join = 11 + 1 + 2 = 14 rows.',
  },
  {
    id: 'b02-tr-i5', type: 'rows', kind: 'applied',
    prompt: 'Before pivoting this long table to one column per month, select every row whose product–month pair also appears in another row.',
    data: { table: {
      head: ['Product', 'Month', 'Revenue ($)'],
      rows: [
        ['House Blend 250g', 'Mar', '1,246'],
        ['House Blend 250g', 'Apr', '1,302'],
        ['Decaf Colombia 250g', 'Mar', '396'],
        ['House Blend 250g', 'Mar', '1,246'],
        ['Decaf Colombia 250g', 'Apr', '410'],
        ['Cold Brew Pack', 'Apr', '528'],
        ['Decaf Colombia 250g', 'Apr', '388'],
        ['Cold Brew Pack', 'May', '572'],
      ],
    } },
    answer: [0, 3, 4, 6],
    solution: 'House Blend 250g in March appears twice with the same value: an exact duplicate, so drop one copy. Decaf Colombia 250g in April appears twice with different values, $410 and $388: find out which is right, or whether they are two parts of the month that should be added. pandas’ pivot would stop with an error; a pivot table would silently average them to $399 (or sum them to $798), hiding the problem.',
  },
  {
    id: 'b02-tr-i6', type: 'mc', kind: 'applied',
    prompt: 'Harborview’s marketing team wants to split last year’s guests into three groups of the same size by total spend, to test a different offer on each. Total spend is right-skewed. Which binning method fits?',
    options: ['Equal-frequency bins (tertiles of total spend)', 'Equal-width bins on total spend', 'Business-defined bands at $500 and $1,000', 'One group for each distinct value of total spend'],
    answer: 0,
    feedback: {
      1: 'With right-skewed spend, equal-width bins put most guests in the lowest bin and very few in the top one.',
      2: 'Fixed thresholds can suit a policy, but nothing makes the three groups the same size, which this test needs.',
      3: 'That gives nearly one group per guest: far too many for a three-offer test.',
    },
    solution: 'The requirement is equal group sizes, which is what equal-frequency (quantile) bins deliver: the 33rd and 67th percentiles of total spend become the edges. Ties at an edge can make the groups slightly unequal, so state how tied values are assigned.',
  },
];

export const check = [
  {
    id: 'b02-tr-k1', type: 'mc', kind: 'conceptual',
    prompt: 'An analyst left-joins 1,200 orders to a product table and gets 1,350 rows. What is the most likely explanation?',
    options: [
      'Some products appear more than once in the product table, so their orders are repeated.',
      'Some orders had no matching product, and the join added an extra row with blank product columns for each.',
      'The left join added the products that had no orders.',
      'The orders table must contain 150 exact duplicates.',
    ],
    answer: 0,
    feedback: {
      1: 'Unmatched left rows are kept once each, with the product columns missing; they don’t add rows beyond the 1,200.',
      2: 'That is what a full outer join does. A left join never adds right rows that match nothing.',
      3: 'Duplicates in the orders table would already be among the 1,200 rows. Extra rows come from repeated keys in the table being joined in.',
    },
    solution: 'A left join returns at least one row per left row, and more only when a key matches several right rows. 150 extra rows means repeated product keys in the product table: count rows per key to find them, fix the table’s granularity, and rejoin until the result has 1,200 rows.',
  },
  {
    id: 'b02-tr-k2', type: 'num', kind: 'numerical',
    prompt: 'Orders are left-joined to a cost table on <code>product</code>. The table shows the rows for each product on each side. How many rows does the left join return?',
    data: { table: { head: ['Product', 'Orders (left)', 'Cost rows (right)'], rows: [['Espresso Roast 250g', '3', '2'], ['Ethiopia Yirgacheffe 250g', '4', '1'], ['Gift Box Trio', '2', '0'], ['Colombia Huila 250g', '0', '1']] } },
    answer: 12, check: () => [[3, 2], [4, 1], [2, 0], [0, 1]].reduce((s, [a, b]) => s + a * Math.max(b, 1), 0), unit: 'rows', places: 0, tol: 0,
    wrong: [
      { value: 9, say: 'That is the number of orders. Each Espresso Roast order matches two cost rows, so it appears twice.' },
      { value: 10, say: 'That is the inner join. A left join also keeps the two Gift Box orders that have no cost row.' },
      { value: 13, say: 'That is the full join. A left join doesn’t add the Huila cost row, which matches no order.' },
    ],
    solution: 'Espresso Roast: 3 × 2 = 6 rows. Ethiopia: 4 × 1 = 4. Gift Box has no cost row, so its 2 orders are kept once each with the cost missing. Huila has no orders, so its cost row is not included. Total 6 + 4 + 2 = 12 rows.',
  },
  {
    id: 'b02-tr-k3', type: 'num', kind: 'numerical',
    prompt: 'Harborview’s summary by booking channel for one month (fictional figures): Direct, 300 room nights at an average of $180 per night; OTA, 500 room nights at $165; Corporate, 200 room nights at $150. What is the average rate per room night across all three channels?',
    answer: 166.5, check: () => (300 * 180 + 500 * 165 + 200 * 150) / (300 + 500 + 200), unit: '$', places: 2, tol: 0.005,
    wrong: [{ value: 165, say: 'That is the plain average of the three channel averages. Weight each by its room nights: OTA sold half of all the nights.' }],
    solution: 'Room revenue = 300 × 180 + 500 × 165 + 200 × 150 = 54,000 + 82,500 + 30,000 = $166,500 over 1,000 room nights, so $166.50 per night.',
  },
  {
    id: 'b02-tr-k4', type: 'mc', kind: 'conceptual',
    prompt: 'You pivot a long revenue table (product, month, revenue) to one column per month, and the tool stops with “Index contains duplicate entries, cannot reshape”. What does it mean?',
    options: [
      'At least one product–month pair appears in more than one row, so one cell would need two values.',
      'Some revenue values are missing, and a pivot can’t build a cell from a blank, so they must be filled first.',
      'The months must be sorted before pivoting.',
      'The table is already in wide format.',
    ],
    answer: 0,
    feedback: {
      1: 'Missing values pivot without complaint: they become blank cells.',
      2: 'Sort order doesn’t matter to a pivot.',
      3: 'A wide table has no month column to pivot on. The message is about repeated label pairs.',
    },
    solution: 'A pivot puts each value in the cell for its row label and column label, so every pair must be unique. Find the repeated pairs: remove exact duplicates, and investigate pairs with different values before deciding whether to keep one or to aggregate them deliberately.',
  },
  {
    id: 'b02-tr-k5', type: 'rows', kind: 'applied',
    prompt: 'Select every booking whose stored nights disagree with its dates (nights = check-out − check-in).',
    data: { table: {
      head: ['Booking', 'Check-in', 'Check-out', 'Nights'],
      rows: [
        ['B1', '2026-01-30', '2026-02-02', '3'],
        ['B2', '2026-02-26', '2026-03-01', '4'],
        ['B3', '2026-03-10', '2026-03-14', '4'],
        ['B4', '2026-04-22', '2026-03-25', '3'],
        ['B5', '2026-05-05', '2026-05-06', '1'],
        ['B6', '2026-03-29', '2026-04-02', '5'],
        ['B7', '2025-12-30', '2026-01-02', '3'],
      ],
    } },
    answer: [1, 3, 5],
    solution: 'Derived nights: B1 3, B2 3, B3 4, B4 −28, B5 1, B6 4, B7 3. B2 and B6 store one night too many (days counted instead of nights), and B4’s check-out comes before its check-in. B1 and B7 cross a month or a year end and are correct: subtract dates, not day numbers.',
  },
  {
    id: 'b02-tr-k6', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s order table has one row per order. Ana asks: “On average, how much does a customer spend with us over the period?” Which calculation answers her?',
    options: [
      'Total revenue ÷ number of distinct customers',
      'The mean of the <code>order_total</code> column',
      'The average of each customer’s mean order value',
      'Number of orders ÷ number of distinct customers',
    ],
    answer: 0,
    feedback: {
      1: 'That is average order value, revenue per order. A customer who orders four times spends about four orders’ worth.',
      2: 'That is the typical customer’s usual order size, not their total spending over the period.',
      3: 'That is orders per customer: a useful companion figure, but not spending.',
    },
    solution: 'The question is about customers, so divide total revenue by the number of distinct <code>customer_id</code> values (or aggregate to one row per customer with the sum of <code>order_total</code>, then average). Average spend per customer = average order value × orders per customer.',
  },
];
