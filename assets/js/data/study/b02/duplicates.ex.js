// duplicates.ex.js — B02 · Duplicate records: widgets, practice and the knowledge check (answer keys live here).
// Every order, booking, customer and number is fictional. Every number is recomputed by `check` (see ../AUTHORING.md).

/** Levenshtein distance: insertions, deletions and substitutions each cost one edit. */
const lev = (a, b) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  return d[a.length][b.length];
};
const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const whole = (x) => Math.round(x).toLocaleString('en-US');

export const widgets = {
  'dup-lab': {
    type: 'cleaning',
    dataset: 'lantern-orders',
    ops: ['dedupe', 'dedupe-key'],
    watch: ['order_total'],
    task: 'Find out how many order ids appear more than once before you change anything. Remove the exact duplicates and note how the row count and the count and mean of <code>order_total</code> change; multiply count by mean to get the total before and after. Then deduplicate on <code>order_id</code>. Before you accept that step, read the rows it would remove: if any of them disagree with the row that stays, which version should survive, and what in the rows tells you?',
  },
  'dup-impact': {
    type: 'formula',
    title: 'What duplicates do to totals and averages',
    intro: 'A month of genuine orders, plus some surplus rows left in by mistake.',
    inputs: [
      { id: 'n', label: 'Genuine orders', min: 100, max: 5000, step: 100, value: 1200, fmt: 'int', unit: 'orders' },
      { id: 'a', label: 'True average order value', min: 10, max: 100, step: 1, value: 25, fmt: 'money' },
      { id: 'k', label: 'Surplus duplicate rows', min: 0, max: 300, step: 5, value: 60, fmt: 'int', unit: 'rows' },
      { id: 'd', label: 'Average value of the duplicated orders', min: 10, max: 200, step: 1, value: 25, fmt: 'money' },
    ],
    compute: (v) => {
      const trueRev = v.n * v.a;
      const extra = v.k * v.d;
      const reported = trueRev + extra;
      const repMean = reported / (v.n + v.k);
      const bias = repMean - v.a;
      const ks = [0, 50, 100, 150, 200, 250, 300];
      let note;
      if (v.k === 0) note = 'No surplus rows: every number is right.';
      else if (v.d === v.a) note = 'The duplicated orders are typical, so the average is unbiased. Revenue and the order count are still overstated, by exactly the value and the number of the surplus rows.';
      else if (v.d > v.a) note = 'The duplicated orders are larger than a typical order, so the average is pushed up as well as the total. This is what happens when big baskets are the ones that get submitted twice.';
      else note = 'The duplicated orders are smaller than a typical order, so the average is pulled down even though revenue is overstated.';
      return {
        headline: { label: 'Reported average order value', value: money(repMean) },
        rows: [
          ['True revenue', money(trueRev)],
          ['Reported revenue', money(reported)],
          ['Revenue overstated by', `${money(extra)} (${(extra / trueRev * 100).toFixed(1)}%)`],
          ['Orders reported', `${whole(v.n + v.k)} instead of ${whole(v.n)}`],
          ['True average order value', money(v.a)],
          ['Bias in the average', `${bias < 0 ? '−' : '+'}${money(Math.abs(bias))}`],
        ],
        note,
        chart: {
          kind: 'line',
          x: { label: 'Surplus duplicate rows', values: ks },
          series: [
            { name: 'Reported average', values: ks.map((k) => +((trueRev + k * v.d) / (v.n + k)).toFixed(2)) },
            { name: 'True average', values: ks.map(() => v.a) },
          ],
          y: { label: 'Average order value ($)' },
        },
      };
    },
  },
};

const ORDERS_G1 = {
  head: ['order_id', 'order_date', 'email', 'product', 'order_total'],
  rows: [
    ['LC-30110', '2026-04-01', 'ines.alves@example.org', 'Decaf Colombia 250g', '$16.50'],
    ['LC-30111', '2026-04-01', 'sam.patel@example.com', 'House Blend 250g', '$14.00'],
    ['LC-30110', '2026-04-01', 'ines.alves@example.org', 'Decaf Colombia 250g', '$16.50'],
    ['LC-30112', '2026-04-02', 'tom.reyes@example.com', 'Cold Brew Pack', '$22.00'],
    ['LC-30113', '2026-04-03', 'sam.patel@example.com', 'House Blend 250g', '$14.00'],
    ['LC-30112', '2026-04-02', 'tom.reyes@example.com', 'Cold Brew Pack', '$19.80'],
    ['LC-30111', '2026-04-01', 'sam.patel@example.com', 'House Blend 250g', '$14.00'],
    ['LC-30114', '2026-04-03', 'j.chen@example.net', 'Espresso Roast 1kg', '$49.00'],
  ],
};

export const guided = [
  {
    id: 'b02-dup-g1', type: 'rows', kind: 'applied',
    prompt: 'Eight rows from Lantern’s April order export (fictional). Select every row that is an exact copy of an <i>earlier</i> row, so that removing the selected rows leaves one copy of each. Rows are numbered from 0.',
    data: { table: ORDERS_G1 },
    answer: [2, 6],
    hints: [
      'Compare every column, not only <code>order_id</code>. A row that differs in any single cell is not an exact copy.',
      'Two order ids appear twice with identical values in every column. Select the later occurrence of each.',
    ],
    solution: 'Row 2 repeats row 0 in every column, and row 6 repeats row 1, so rows 2 and 6 are the exact copies. Row 5 shares order LC-30112 with row 3 but has a different total ($19.80 against $22.00): a conflicting version, not a copy. Row 4 is Sam Patel’s second order, two days later with a different order number: a genuine repeat that stays.',
    why: 'Exact duplicates agree on every column; conflicting versions and genuine repeats need other treatment.',
  },
  {
    id: 'b02-dup-g2', type: 'steps', kind: 'applied',
    prompt: 'The export also records when each version of an order was last updated. Here are the two rows for order LC-30112 (fictional).',
    data: { table: {
      head: ['order_id', 'updated_at', 'subscription', 'order_total'],
      rows: [
        ['LC-30112', '2026-04-02 08:14', 'no', '$22.00'],
        ['LC-30112', '2026-04-02 08:16', 'yes', '$19.80'],
      ],
    } },
    solution: 'The rows share a business key but disagree on the total, so they are a repeated key with conflicting values. Two minutes after ordering, the customer turned the order into a subscription delivery, which carries a 10% discount (22.00 × 0.90 = 19.80). The 08:16 row is the later update and shows what the customer paid, so it survives. Keeping both rows would count the order twice and overstate revenue by the whole surplus row, $22.00.',
    steps: [
      { id: 'b02-dup-g2-s1', type: 'mc',
        prompt: 'What kind of duplicate is this?',
        options: ['A repeated key with conflicting values', 'An exact duplicate, one row copied into another', 'A near duplicate, like one customer typed two ways', 'Two genuine orders from the same customer'],
        answer: 0,
        hints: ['Compare the key column with the other columns.', 'Same <code>order_id</code>, different <code>order_total</code>.'],
        feedback: {
          1: 'Exact duplicates agree on every column; these rows have different totals and update times.',
          2: 'Near duplicates are about records of the same entity with slightly different values, such as a name typed two ways. Here the key itself is shared.',
          3: 'The shop issues one order number per order, so a shared number means one order recorded twice, not two orders.',
        } },
      { id: 'b02-dup-g2-s2', type: 'mc',
        prompt: 'Which row should survive?',
        options: [
          'The 08:16 row: it is the later update and reflects the discount the customer actually paid.',
          'The 08:14 row: keep the first occurrence, because it records the order as the customer originally placed it.',
          'Neither: delete both rows because they conflict.',
          'Both: they have different totals and update times, so they can’t be duplicates of one order.',
        ],
        answer: 0,
        hints: ['Think about how two versions of one order arise: the order was changed after it was first saved.', 'A later update supersedes an earlier one.'],
        feedback: {
          1: '“Keep first” suits copies of an original, such as double clicks. Here the second row is a correction, so the first is out of date.',
          2: 'Deleting both removes a real order. The conflict is resolved by the update time, not by deletion.',
          3: 'Different values don’t make different orders: one order number means one order, recorded in two versions.',
        } },
      { id: 'b02-dup-g2-s3', type: 'num',
        prompt: 'If both rows were left in, by how much would revenue be overstated?',
        answer: 22, check: () => (22.00 + 19.80) - 19.80, unit: '$', places: 2, tol: 0.005,
        hints: ['The true revenue for this order is the surviving total.', 'Overstatement = what the two rows add up to − the true total.'],
        wrong: [{ value: 2.2, say: 'That is the difference between the two versions. Keeping both counts the order twice, so the overstatement is the whole surplus row, $22.00.' }] },
    ],
  },
  {
    id: 'b02-dup-g3', type: 'num', kind: 'numerical',
    prompt: 'Lantern’s April export should hold 2,400 orders, which average $24.50. A retried upload appended the last 150 orders a second time; those 150 orders average $31.20. By how much does the export overstate April revenue?',
    answer: 4680, check: () => 150 * 31.20, unit: '$', places: 2, tol: 0.5,
    hints: [
      'Only the surplus rows add to the total. How many surplus rows are there, and what are they worth on average?',
      'Overstatement = number of surplus rows × their average value. The $24.50 average of all orders is a distractor.',
    ],
    wrong: [
      { value: 3675, say: 'You used the average of all orders. The copies are the last 150 orders, whose average is $31.20.' },
      { value: 9360, say: 'You counted both copies of each order. One copy of each is genuine; only the second is surplus.' },
    ],
    solution: 'The surplus rows are the 150 repeated orders, worth 150 × $31.20 = $4,680 in total. That is exactly how much the sum of <code>order_total</code> exceeds true revenue: 2,400 × 24.50 = $58,800 true, $63,480 reported.',
  },
  {
    id: 'b02-dup-g4', type: 'steps', kind: 'numerical',
    prompt: 'Product names in a supplier list contain typing errors. Work out some edit distances by hand.',
    solution: '“Lantern” → “Lanturn” needs one substitution (e → u): distance 1. “Huila” → “Hulia” swaps two neighbouring letters, which costs two single-character edits: distance 2. The similarity is 1 − 2 ÷ 5 = 0.60.',
    steps: [
      { id: 'b02-dup-g4-s1', type: 'num',
        prompt: 'What is the edit distance between “Lantern” and “Lanturn”?',
        answer: 1, check: () => lev('Lantern', 'Lanturn'), unit: 'edits', places: 0, tol: 0,
        hints: ['Line the words up letter by letter and find where they differ.', 'Only one letter is different, and the lengths are equal.'] },
      { id: 'b02-dup-g4-s2', type: 'num',
        prompt: 'What is the edit distance between “Huila” and “Hulia”?',
        answer: 2, check: () => lev('Huila', 'Hulia'), unit: 'edits', places: 0, tol: 0,
        hints: ['Compare H-u-i-l-a with H-u-l-i-a. Which positions differ?', 'Edit distance allows only insertions, deletions and substitutions of single characters, so swapping two neighbouring letters takes two edits.'],
        wrong: [{ value: 1, say: 'A swap feels like one mistake, but Levenshtein distance has no swap operation. Turning “il” into “li” takes two substitutions (or a deletion and an insertion).' }] },
      { id: 'b02-dup-g4-s3', type: 'num',
        prompt: 'Turn the “Huila” and “Hulia” distance into a normalised similarity, 1 − distance ÷ length of the longer string. Give two decimal places.',
        answer: 0.6, check: () => 1 - lev('Huila', 'Hulia') / Math.max('Huila'.length, 'Hulia'.length), unit: '', places: 2, tol: 0.005,
        hints: ['Both strings have five letters.', '1 − 2 ÷ 5.'],
        wrong: [{ value: 0.4, say: 'That is distance ÷ length, a dissimilarity. Similarity is 1 minus that.' }] },
    ],
  },
];

export const independent = [
  {
    id: 'b02-dup-i1', type: 'rows', kind: 'applied',
    prompt: 'Part of Harborview Hotel’s booking feed (fictional). Before choosing a survivorship rule, a reviewer needs to see every row of every repeated booking. Select every row whose <code>booking_id</code> appears more than once, <i>including</i> the first occurrence. Rows are numbered from 0.',
    data: { table: {
      head: ['booking_id', 'received_at', 'check_in', 'nights', 'status', 'total'],
      rows: [
        ['HB-26201', '2026-10-01 10:02', '2026-11-18', '2', 'Confirmed', '$380'],
        ['HB-26202', '2026-10-01 11:47', '2026-11-19', '3', 'Confirmed', '$570'],
        ['HB-26203', '2026-10-02 09:30', '2026-11-18', '1', 'Confirmed', '$190'],
        ['HB-26201', '2026-10-04 15:20', '2026-11-18', '3', 'Confirmed', '$570'],
        ['HB-26204', '2026-10-05 08:05', '2026-11-20', '2', 'Confirmed', '$380'],
        ['HB-26202', '2026-10-06 12:10', '2026-11-19', '3', 'Cancelled', '$0'],
        ['HB-26205', '2026-10-06 18:44', '2026-11-21', '4', 'Confirmed', '$760'],
      ],
    } },
    answer: [0, 1, 3, 5],
    solution: 'HB-26201 appears in rows 0 and 3 (the stay was extended from 2 to 3 nights) and HB-26202 in rows 1 and 5 (the booking was cancelled). All four rows go to review. This is what <code>duplicated(subset=[&#39;booking_id&#39;], keep=False)</code> or a <code>GROUP BY booking_id HAVING COUNT(*) > 1</code> query finds. Under a latest-update rule, rows 3 and 5 would survive.',
  },
  {
    id: 'b02-dup-i2', type: 'mc', kind: 'applied',
    prompt: 'Lantern merges its online-shop customers with the customer list from the loyalty app in its cafés. For the 300 people in both, the shop record has a verified email address but no phone number; the loyalty record has a phone number and a postal address updated last month, but an email address that was never verified. Which survivorship rule fits best?',
    options: [
      'Merge field by field: email from the shop, phone and address from the loyalty app, noting each value’s source.',
      'Keep the most complete record, the one with the most fields filled in.',
      'Keep the first record, from the shop, because it is older.',
      'Keep the latest record, from the loyalty app, because it was updated last month and so holds the newest details.',
    ],
    answer: 0,
    feedback: {
      1: 'Both records are incomplete in different ways, so “most complete” would throw away a verified email or a current address, whichever record lost.',
      2: 'Age is not quality here: the shop record lacks a phone number and may have an old address.',
      3: 'The loyalty record’s address is newer, but its email was never verified. Taking the whole record discards the better email.',
    },
    solution: 'Each source is best for different fields, which is the situation merging is for. Take the verified email from the shop and the phone and recent address from the loyalty app, and record where each value came from so it can be checked later.',
  },
  {
    id: 'b02-dup-i3', type: 'num', kind: 'numerical',
    prompt: 'A month has 1,000 genuine orders averaging $24.00. A checkout bug submitted 50 of the largest orders twice; those 50 orders average $60.00. What average order value does the raw export report? Give two decimal places.',
    answer: 25.71, check: () => (1000 * 24 + 50 * 60) / (1000 + 50), unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 24, say: 'That is the true average. The export also contains the 50 surplus rows, each worth $60.00 on average.' },
      { value: 27, say: 'You divided the inflated revenue by 1,000. The export has 1,050 rows, and the reported average divides by all of them.' },
      { value: 42, say: 'That averages the two averages. Weight each by its number of rows: (1,000 × 24 + 50 × 60) ÷ 1,050.' },
    ],
    solution: 'Reported revenue = 1,000 × 24 + 50 × 60 = 24,000 + 3,000 = $27,000 over 1,050 rows, so the reported average is 27,000 ÷ 1,050 ≈ $25.71. It is biased upward because the duplicated orders are larger than typical.',
  },
  {
    id: 'b02-dup-i4', type: 'num', kind: 'numerical',
    prompt: 'A booking site lists the hotel as “Harbourveiw” instead of “Harborview”. What is the edit distance between “Harborview” and “Harbourveiw”?',
    answer: 3, check: () => lev('Harborview', 'Harbourveiw'), unit: 'edits', places: 0, tol: 0,
    wrong: [
      { value: 2, say: 'You probably counted the swapped “ie” as one edit. In Levenshtein distance a swap of neighbouring letters costs two, plus one for the extra “u”.' },
      { value: 1, say: 'Inserting the “u” is one edit, but “view” and “veiw” still differ: the swapped letters cost two more.' },
    ],
    solution: 'Insert a “u” (Harborview → Harbourview): one edit. Then “view” → “veiw” swaps two neighbouring letters, which takes two substitutions. Total: 3 edits.',
  },
  {
    id: 'b02-dup-i5', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each pair of records.',
    items: [
      'Two rows for order LC-40211, identical in every column',
      'Two rows for booking HB-27104: one confirmed, one cancelled',
      'Customers “Maya Okafor” and “maya okafor” with the same email address and postcode',
      'Two orders by one customer for the same product, five hours apart, paid with two separate settled payments',
      'Two rows “2026-03-14, Flat white, $3.80” in a café till export that has no transaction number',
      'A customer recorded as j.chen@example.net and as jchen.work@example.com, with the same name, phone number and address',
    ],
    categories: ['Exact duplicate', 'Same key, conflicting values', 'Near duplicate', 'Separate records (not duplicates)'],
    answer: [0, 1, 2, 3, 3, 2],
    feedback: {
      3: 'Hours apart and two settled payments are evidence of two genuine orders. Similar content is not enough to call them duplicates.',
      4: 'With no transaction number, nothing in these rows should be unique, so identical rows are exactly what two separate sales of the same drink look like.',
      5: 'Different emails, but the name, phone and address match: the same person under two addresses, a near duplicate.',
    },
    solution: 'Order LC-40211: exact duplicate. Booking HB-27104: same key, conflicting values (keep the latest version). The two Maya Okafor records: near duplicate (case only). The two orders five hours apart with separate payments: separate records. The two flat whites: separate records, because the export has no unique column. J. Chen under two emails: near duplicate.',
  },
  {
    id: 'b02-dup-i6', type: 'multi', kind: 'applied',
    prompt: 'A customer has two orders for the same basket of beans on the same day. Which observations suggest a double submission rather than two genuine orders? Select all that apply.',
    options: [
      'The two orders were placed 12 seconds apart.',
      'The payment provider shows a single charge.',
      'One of the orders has the status “voided”.',
      'The orders are addressed to two different people.',
      'The orders have different order numbers.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Different recipients suggest a gift or an order on someone else’s behalf: evidence of a genuine second order.',
      4: 'Not decisive: many shops issue a new order number for every submission, so a double click also produces two numbers.',
    },
    solution: 'Seconds apart, a single charge and a voided order all point to one purchase submitted twice. Different recipients point the other way, and different order numbers prove nothing because each submission can generate a number.',
  },
];

export const check = [
  {
    id: 'b02-dup-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A café’s till export lists date, product and price for each sale, with no transaction number. On 14 March it contains three identical rows: “2026-03-14, Flat white, $3.80”. What should you do with them?',
    options: [
      'Keep all three unless other evidence shows a copy: with no unique column, identical rows are expected when an item sells several times.',
      'Remove two of them, because identical rows are exact duplicates.',
      'Remove all three, because repeated rows are unreliable.',
      'Keep one and record the other $7.60 as a separate adjustment.',
    ],
    answer: 0,
    feedback: {
      1: 'Identical values are evidence of a duplicate only when the columns include something that should be unique. Here nothing does, so deleting rows would delete real sales.',
      2: 'There is no reason to doubt the sales themselves; removing all three understates revenue by $11.40.',
      3: 'This still treats two genuine sales as errors. An adjustment line doesn’t fix the sales count or the product mix.',
    },
    solution: 'Whether identical rows are duplicates depends on the key. A till export without transaction numbers has no column that should be unique, so three flat whites sold on one day produce three identical rows. Check other evidence, such as the till’s own sales count for the day, before removing anything.',
  },
  {
    id: 'b02-dup-k2', type: 'rows', kind: 'applied',
    prompt: 'Select the rows to remove so that each order appears exactly once. Keep the latest version of any order that was updated; if two rows are identical, remove the later one. Rows are numbered from 0 (fictional data).',
    data: { table: {
      head: ['order_id', 'updated_at', 'email', 'product', 'order_total'],
      rows: [
        ['LC-50301', '2026-05-03 09:10', 'maya.okafor@example.com', 'House Blend 250g', '$14.00'],
        ['LC-50302', '2026-05-03 09:12', 'tom.reyes@example.com', 'Espresso Roast 1kg', '$49.00'],
        ['LC-50301', '2026-05-03 09:10', 'maya.okafor@example.com', 'House Blend 250g', '$14.00'],
        ['LC-50303', '2026-05-03 11:40', 'ines.alves@example.org', 'Cold Brew Pack', '$22.00'],
        ['LC-50302', '2026-05-03 09:31', 'tom.reyes@example.com', 'Espresso Roast 1kg', '$44.10'],
        ['LC-50304', '2026-05-03 17:05', 'maya.okafor@example.com', 'House Blend 250g', '$14.00'],
        ['LC-50303', '2026-05-03 11:40', 'ines.alves@example.org', 'Cold Brew Pack', '$22.00'],
      ],
    } },
    answer: [1, 2, 6],
    solution: 'Row 2 copies row 0 and row 6 copies row 3: remove the later copies. Order LC-50302 has two versions; the 09:31 update in row 4 (with the 10% subscriber discount, 49.00 × 0.90 = 44.10) is later, so remove row 1. Row 5 is Maya Okafor’s second order, with its own order number placed eight hours later: a genuine repeat that stays. Four rows survive, one per order.',
  },
  {
    id: 'b02-dup-k3', type: 'num', kind: 'numerical',
    prompt: 'An export of 3,200 orders contains 64 surplus rows: 40 exact copies of orders whose totals average $18.50, and 24 superseded versions of orders that were later updated, whose totals average $27.00. By how much does summing <code>order_total</code> over the whole export overstate revenue?',
    answer: 1388, check: () => 40 * 18.50 + 24 * 27.00, unit: '$', places: 2, tol: 0.5,
    wrong: [
      { value: 740, say: 'That counts only the exact copies. The superseded versions are surplus rows too: each one adds its total to the sum.' },
      { value: 648, say: 'That counts only the superseded versions. The 40 exact copies also add their totals.' },
    ],
    solution: 'Every surplus row adds its own total to the sum: 40 × 18.50 + 24 × 27.00 = 740 + 648 = $1,388.',
  },
  {
    id: 'b02-dup-k4', type: 'num', kind: 'numerical',
    prompt: 'A supplier’s system lists one of its customers as “Britewater” instead of “Brightwater”. What is the edit distance between the two names?',
    answer: 3, check: () => lev('Brightwater', 'Britewater'), unit: 'edits', places: 0, tol: 0,
    wrong: [
      { value: 2, say: 'Count again where “ght” meets “te”: two letters must change and one must go, which is three edits.' },
      { value: 1, say: 'The names differ by more than one letter: compare “Brigh-t-water” with “Brit-e-water”.' },
    ],
    solution: 'Both names start with “Bri” and end with “water”. In between, “ght” must become “te”: substitute g → t and h → e, then delete the extra t. That is 3 edits, and no shorter sequence works because the lengths differ by one and two other letters differ.',
  },
  {
    id: 'b02-dup-k5', type: 'mc', kind: 'applied',
    prompt: 'A hotel’s channel manager sends the whole booking again every time a guest changes or cancels it. The exported feed therefore has several rows per booking reference, each with a <code>received_at</code> time. Which survivorship rule should the hotel use?',
    options: [
      'Sort by received_at and keep the latest row for each booking reference.',
      'Keep the first row for each booking reference, because it is the original booking.',
      'Keep the row with the highest total, so that no revenue is lost.',
      'Remove only rows that are identical in every column.',
    ],
    answer: 0,
    feedback: {
      1: 'The first row is the booking before any change, so it would keep cancelled bookings and outdated stays.',
      2: 'The highest total is not the most accurate one: a shortened stay or a cancellation lowers the total, and those are real changes.',
      3: 'That removes only re-sends with no change. Versions that differ would all stay, so each changed booking would still be counted more than once.',
    },
    solution: 'The duplicates come from a sync that sends every change, so the latest message holds the current state of the booking, including cancellations. Sort by <code>received_at</code> and keep the last row per booking reference.',
  },
  {
    id: 'b02-dup-k6', type: 'mc', kind: 'conceptual',
    prompt: 'You want to see <i>every</i> row of every <code>order_id</code> that appears more than once, including the first occurrence, so that you can review the groups before deleting anything. Which pandas expression does that?',
    options: [
      'df[df.duplicated(subset=[&#39;order_id&#39;], keep=False)]',
      'df[df.duplicated(subset=[&#39;order_id&#39;], keep=&#39;last&#39;)]',
      'df.drop_duplicates(subset=[&#39;order_id&#39;], keep=False)',
      'df.drop_duplicates()',
    ],
    answer: 0,
    feedback: {
      1: 'With keep=&#39;last&#39;, duplicated() marks every row of a repeated order except the last, so one row of each group is missing from the review.',
      2: 'This deletes every row of every repeated order instead of showing them, so nothing is left to review.',
      3: 'This removes exact copies only, and doesn’t show you anything to review.',
    },
    solution: '<code>duplicated(subset=[&#39;order_id&#39;], keep=False)</code> marks every row whose order id occurs more than once, first occurrence included. Filtering the table with it shows each group in full, which is what you need before choosing a survivorship rule.',
  },
];
