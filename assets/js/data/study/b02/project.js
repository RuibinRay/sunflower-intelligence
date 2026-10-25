// project.js — B02 applied project: clean Lantern Coffee Co.’s online-shop order export (fictional) in the Data
// Cleaning Lab and write its data quality report. Every business, person, address and value is fictional.
// The questions check the student’s results against the defects planted in assets/data/study/lantern-orders.csv,
// recorded in lantern-orders.manifest.json (rows counted from 1, header not counted). The constants below restate
// that record; every num item's `check` and `verify()` recompute the figures from them.

// ---------------------------------------------------------------- what the manifest records (fictional data)
const RAW_ROWS = 240;
const EXACT_COPIES = [9, 50, 126, 161, 212, 229];          // extra rows of the 6 exact duplicates
const KEY_COPIES = [46, 79, 157];                          // extra rows of the 3 repeated order ids (LC-10042, LC-10076, LC-10146)
const KEPT = RAW_ROWS - EXACT_COPIES.length - KEY_COPIES.length;   // 231 orders, the shop system’s count
const FLAGGED_BY_RULE = { quantity: 4, region: 13, email: 6, order_date: 22 };   // raw values failing V1–V4
const EMAIL_BLANK_RAW = [31, 68, 79, 96, 135, 148, 156, 201];
const EMAIL_RECOVERABLE = [31, 96, 148, 201];               // same customer_id has the address on another order
const EMAIL_UNRECOVERABLE = [68, 135, 156];                 // customers with no other order
const EMAIL_BLANK_KEPT = EMAIL_BLANK_RAW.filter((r) => !KEY_COPIES.includes(r)).length;   // 7
// ratings in the 231 kept orders, by subscription: orders, rated orders, sum of the ratings given
const RATINGS = { yes: { orders: 104, rated: 88, stars: 387 }, no: { orders: 127, rated: 66, stars: 245 } };
// quantities after the four impossible values are corrected: value → number of orders
const QUANTITIES = { 1: 139, 2: 71, 3: 10, 4: 5, 5: 4, 6: 1, 120: 1 };
// order totals: stored sum of all 240 rows, the totals of the 9 surplus rows, and the 5 kept orders that don’t reconcile
const RAW_TOTALS_SUM = 9399.45;
const SURPLUS_TOTALS = [14.00, 14.00, 25.20, 39.00, 66.00, 14.00, 42.00, 58.50, 17.55];
const UNRECONCILED = [
  { id: 'LC-10016', q: 1, p: 16.50, d: 1.65, stored: 21.35 },   // includes a $6.50 shipping charge
  { id: 'LC-10107', q: 1, p: 15.50, d: 1.55, stored: 15.50 },   // discount not subtracted
  { id: 'LC-10112', q: 1, p: 46.00, d: 0.00, stored: 64.00 },   // digits swapped
  { id: 'LC-10191', q: 2, p: 54.00, d: 10.80, stored: 79.20 },  // digits swapped
  { id: 'LC-10198', q: 3, p: 46.00, d: 5.00, stored: 138.00 },  // discount not subtracted
];
const BULK = { q: 120, p: 14.00, d: 168.00 };               // LC-10144, the genuine office order (Central)
const CENTRAL = { orders: 25, revenue: 2125.90 };

const sum = (a) => a.reduce((s, v) => s + v, 0);
const round2 = (v) => Math.round(v * 100) / 100;
const quantile = (a, p) => { const s = [...a].sort((x, y) => x - y); const h = (s.length - 1) * p; const lo = Math.floor(h); return s[lo] + (h - lo) * (s[Math.ceil(h)] - s[lo]); };
const expand = (freq) => Object.entries(freq).flatMap(([v, n]) => Array(n).fill(+v));
const recomputed = (o) => round2(o.q * o.p - o.d);
const storedKeptSum = () => RAW_TOTALS_SUM - sum(SURPLUS_TOTALS);
const revenueClean = () => storedKeptSum() - sum(UNRECONCILED.map((o) => o.stored - recomputed(o)));
const observedRating = () => (RATINGS.yes.stars + RATINGS.no.stars) / (RATINGS.yes.rated + RATINGS.no.rated);
const marRating = () => sum(Object.values(RATINGS).map((g) => g.orders * g.stars / g.rated)) / KEPT;
const iqrFlagged = () => { const a = expand(QUANTITIES); const q1 = quantile(a, 0.25), q3 = quantile(a, 0.75), k = 1.5 * (q3 - q1); return a.filter((v) => v < q1 - k || v > q3 + k).length; };

// ---------------------------------------------------------------- the lab set-ups
const REGIONS = ['North', 'South', 'East', 'West', 'Central'];
const PRODUCTS = ['Cold Brew Pack', 'Colombia Huila 250g', 'Decaf Colombia 1kg', 'Decaf Colombia 250g', 'Espresso Roast 1kg', 'Espresso Roast 250g', 'Ethiopia Yirgacheffe 250g', 'Gift Box Trio', 'House Blend 1kg', 'House Blend 250g', 'Sumatra Mandheling 250g'];
const EMAIL_PATTERN = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$';
const ALL_ORDERS = { id: 'rows', rule: 'rows-between', min: 231, max: 231, text: 'All 231 orders are there, one row each (the shop system’s count)' };

/** Stage 2’s standard steps: the starting point of stages 3 and 4, so that everyone works on the same table. */
const STANDARD_RECORDS = [
  { op: 'dedupe', why: 'The export repeated some lines exactly.' },
  { op: 'trim', all: true, why: 'Stray spaces split categories and break the e-mail rule.' },
  { op: 'case', column: 'region', to: 'title' },
  { op: 'map', column: 'region', mapping: { 'N.': 'North', Nrth: 'North', 'S.': 'South', Soth: 'South', 'E.': 'East', Wset: 'West' }, why: 'Abbreviations and typing errors, mapped to the five delivery regions.' },
  { op: 'case', column: 'product', to: 'title' },
  { op: 'case', column: 'email', to: 'lower' },
  { op: 'dedupe-key', columns: ['order_id'], keep: 'most-complete', why: 'Keeps the copy with the e-mail address for LC-10076; the shop system confirms the first copy of LC-10042.' },
  { op: 'to-date', column: 'order_date', order: 'auto', serial: true },
  { op: 'to-date', column: 'order_date', order: 'DMY', why: 'The four ambiguous dates are web orders, and every unambiguous web slash date is day first.' },
  { op: 'to-number', column: 'unit_price', decimal: '.' },
  { op: 'to-number', column: 'unit_price', decimal: ',', why: '16,50 was typed with a decimal comma: $16.50, the list price.' },
  { op: 'to-number', column: 'order_total', decimal: '.' },
];
/** Stage 3’s standard steps: the starting point of stage 4. */
const STANDARD_VALUES = [
  { op: 'map', column: 'quantity', mapping: { '-2': '2', 999: '1', 0: '1' }, why: 'Each order_total matches the corrected quantity.' },
  { op: 'map', column: 'unit_price', mapping: { 1800: '18' }, why: 'order_total matches $18.00, the list price; the decimal point was lost.' },
  { op: 'flag-missing', column: 'rating', why: 'Ratings are optional and missing far more often for one-off buyers.' },
];

export default {
  title: 'Clean Lantern’s order export',
  brief: [
    { p: 'Ana Lim is preparing Lantern Coffee Co.’s first review of its online shop for 1 March – 30 June 2026: revenue by region, how subscribers’ orders compare with one-off orders, and the average customer rating. Her analyst has downloaded the order export, <code>lantern-orders.csv</code>, straight from the shop platform: 240 rows and 14 columns. You will take it from raw to analysis-ready in the Data Cleaning Lab, then write the data quality report that lets Ana, and anyone who checks her figures, trust the numbers.' },
    { p: 'Two facts from outside the file are available as evidence: the shop system counts 231 orders in the period, and it confirms that order LC-10042 was for 2 bags. The data dictionary in the dataset’s README describes what each column should hold; the lab knows its rules.' },
    { p: 'Lantern, Ana, the customers and every value in the file are fictional; the e-mail addresses use reserved example domains. The file was generated with known defects, so each stage’s questions check your results against what was planted. Stages 1 to 4 each have their own lab: stages 3 and 4 start from the table produced by the standard steps of the stages before, so that everyone’s answers can be checked.' },
  ],
  deliverables: [
    'A profile of the raw export and four validation rules written in the lab, with the number of values each one flags.',
    'An export with one row per order (231 rows), ISO dates, numeric prices and totals, and standard regions, products and e-mail addresses.',
    'A decision, with evidence, for every impossible or extreme value and for the missing ratings and e-mail addresses.',
    'An analysis-ready table: reconciled order totals with a record of the ones corrected, region encoded, e-mail addresses removed.',
    'A data quality report of 300–500 words.',
  ],
  stages: [
    // ---------------------------------------------------------------- 1
    {
      id: 'profile', title: 'Profile the export and write validation rules',
      html: `<p>Profile the export before you change anything. Open <strong>Column profiles</strong> and read the issue list: for each column note its type, its blanks, its distinct values and its range. Then turn four lines of the data dictionary into validation rules with <strong>Validate values</strong>, choosing “Flag them”, so that each rule adds a 0/1 column and changes nothing else:</p>
<ul>
<li>V1: <code>quantity</code> is a whole number from 1 to 200.</li>
<li>V2: <code>region</code> is one of North, South, East, West or Central (one per line in the allowed values).</li>
<li>V3: <code>email</code> matches the pattern <code>${EMAIL_PATTERN}</code>: lower case, no spaces.</li>
<li>V4: <code>order_date</code> is a date from 2026-03-01 to 2026-06-30 (enter them as the minimum and maximum; a date not written as YYYY-MM-DD fails too).</li>
</ul>
<p>Each rule’s note says how many values broke it. A fifth rule, V5: order_total = quantity × unit_price − discount, can’t be tested yet because the prices are stored as text; it returns in stage 4.</p>`,
      tool: {
        kind: 'cleaning', dataset: 'lantern-orders', ops: ['validate'], watch: ['quantity', 'rating'],
        task: 'Profile the raw export, then write rules V1 to V4 with <b>Validate values</b> and “Flag them”. Change nothing else.',
        goals: [
          { id: 'v1', rule: 'range', column: 'quantity_invalid', min: 0, max: 1, integer: true, text: 'V1 written: quantity is checked against whole numbers from 1 to 200 and the failures flagged in quantity_invalid' },
          { id: 'v2', rule: 'range', column: 'region_invalid', min: 0, max: 1, integer: true, text: 'V2 written: region is checked against the five regions and the failures flagged in region_invalid' },
          { id: 'v3', rule: 'range', column: 'email_invalid', min: 0, max: 1, integer: true, text: 'V3 written: email is checked against the pattern and the failures flagged in email_invalid' },
          { id: 'v4', rule: 'range', column: 'order_date_invalid', min: 0, max: 1, integer: true, text: 'V4 written: order_date is checked against 2026-03-01 to 2026-06-30 and the failures flagged in order_date_invalid' },
        ],
      },
      items: [
        {
          id: 'b02-pj-p1', type: 'num', kind: 'numerical',
          prompt: 'The export has 240 rows. How many distinct values does <code>order_id</code> have?',
          answer: 231, check: () => KEPT, unit: 'order ids', places: 0, tol: 0,
          wrong: [
            { value: 240, say: 'That is the number of rows. The profile’s “Distinct” column counts each order id once, however often it repeats.' },
            { value: 234, say: 'That is the row count after removing only the exact copies. Three more order ids appear twice with different values.' },
          ],
          solution: 'The profile shows 231 distinct order ids in 240 rows, so 9 rows repeat an order id that appears elsewhere: 6 exact copies and 3 repeated ids whose copies differ. 231 matches the shop system’s count of orders, which is the evidence that each order id should survive exactly once.',
        },
        {
          id: 'b02-pj-p2', type: 'num', kind: 'numerical',
          prompt: 'How many rows repeat an earlier row exactly, in every column?',
          answer: 6, check: () => EXACT_COPIES.length, unit: 'rows', places: 0, tol: 0,
          wrong: [
            { value: 9, say: 'That counts every repeated order id. Three of them differ between their copies (a quantity, a blank e-mail, a region typed differently), so they aren’t exact duplicates.' },
            { value: 12, say: 'That counts both copies of each pair. Only the later copy of each pair is surplus.' },
          ],
          solution: 'The issue list reports 6 exact duplicate rows: the later copies of LC-10003, LC-10043, LC-10117, LC-10152, LC-10196 and LC-10217. The other 3 repeated ids (LC-10042, LC-10076, LC-10146) have copies that disagree and need a survivorship decision.',
        },
        {
          id: 'b02-pj-p3', type: 'num', kind: 'numerical',
          prompt: 'What percentage of the 240 raw rows have no e-mail address? (2 decimal places)',
          answer: 3.33, check: () => EMAIL_BLANK_RAW.length / RAW_ROWS * 100, unit: '%', places: 2, tol: 0.01,
          wrong: [
            { value: 3.46, say: 'That divides by 231 orders. The question asks about the raw file, so the denominator is its 240 rows.' },
            { value: 8, say: 'That is the count. A share needs its denominator: 8 of 240 rows.' },
          ],
          solution: 'The profile shows 8 blank e-mail addresses in 240 rows: 8 ÷ 240 × 100 = 3.33%. State the denominator whenever you report the share, because removing duplicates will change it.',
        },
        {
          id: 'b02-pj-p4', type: 'fill', kind: 'applied',
          prompt: 'How many values did each rule flag in the raw export?',
          text: 'V1 (quantity): [[0]] values. V2 (region): [[1]] values. V3 (email): [[2]] values. V4 (order_date): [[3]] values.',
          blanks: [
            { options: ['2', '4', '5', '13'], answer: 1 },
            { options: ['6', '12', '13', '17'], answer: 2 },
            { options: ['3', '4', '6', '8'], answer: 2 },
            { options: ['4', '9', '18', '22'], answer: 3 },
          ],
          solution: 'V1 flags 4 quantities (−2, 999, 0 and 0). V2 flags 13 region values: abbreviations (N., S., E.), typing errors (Wset, Soth, Nrth), other capitals (north, SOUTH, east, central) and trailing spaces (“north␣” twice, “West␣”). V3 flags 6 addresses with capitals or stray spaces; blank addresses aren’t tested by a pattern rule. V4 flags all 22 dates not written as YYYY-MM-DD (day-first and month-first slash dates, written-out dates and spreadsheet serials), none of which is outside the period once read.',
        },
        {
          id: 'b02-pj-p5', type: 'classify', kind: 'applied',
          prompt: 'Lantern’s rule set gives each rule a severity. Classify each rule.',
          items: [
            'quantity is a whole number from 1 to 200',
            'order_id appears only once',
            'order_total = quantity × unit_price − discount, to the cent',
            'quantity is at most 6 packs',
            'order_total lies inside the 1.5 × IQR fences',
            'region is one of the five delivery regions',
          ],
          categories: ['Hard: a failure is an error', 'Soft: a failure is a value to check'],
          answer: [0, 0, 0, 1, 1, 0],
          feedback: {
            3: 'Household orders are usually small, but genuine office orders exist (one is for 120 bags). A failure means “look at this order”, not “this is wrong”.',
            4: 'An outlier rule flags unusual values, and unusual values can be genuine, so it is soft.',
          },
          solution: 'Hard rules describe what can’t be true: impossible quantities, a repeated key, a total that doesn’t follow from its parts, a region that doesn’t exist. Soft rules describe what is unusual and needs a look: large quantities and extreme totals.',
        },
        {
          id: 'b02-pj-p6', type: 'mc', kind: 'conceptual',
          prompt: '80 of the 240 raw rows have no rating. Should Lantern’s rule set include “rating has no missing values”?',
          options: [
            'No: rating is optional, so blanks are allowed; check the given ratings against 1 to 5, and investigate separately whether the blanks depend on another column',
            'Yes, as a hard rule, and delete the rows that fail it',
            'Yes, as a soft rule, so that the blanks are filled with the average rating',
            'No, and the blank ratings can be ignored from now on',
          ],
          answer: 0,
          feedback: {
            1: 'A customer who didn’t rate an order still placed it: deleting 80 orders would remove a third of the orders and their revenue.',
            2: 'A rule finds problems; it doesn’t decide how to treat them, and filling invents ratings no customer gave.',
            3: 'Blanks that depend on another column bias the average rating. The issue list already shows ratings missing for about 48% of one-off orders but 15% of subscription orders.',
          },
          solution: 'A completeness rule applies only to required fields. Rating is optional, so its rule is “a whole number from 1 to 5 or blank”. The pattern of the blanks matters for the analysis, though: they are far more common for one-off buyers, which stage 3 deals with.',
        },
      ],
    },
    // ---------------------------------------------------------------- 2
    {
      id: 'records', title: 'Fix records and formats',
      html: `<p>Fix the records and the formats in an order that doesn’t create new problems. The lab replays your steps from the raw file every time, so you can remove a step and try again.</p>
<ul>
<li>Remove the exact duplicates, then resolve the repeated order ids. Before you accept a step, read which rows it removes and how they differ from the rows that stay.</li>
<li>Trim spaces and standardise case in <code>region</code>, <code>product</code> and <code>email</code>; map region abbreviations and typing errors to the five regions.</li>
<li>Convert <code>order_date</code> to ISO dates, reading spreadsheet serials (1900 date system). Leave the ambiguous slash dates alone at first, decide their order from the evidence in the file, then convert them in a second step.</li>
<li>Convert <code>unit_price</code> and <code>order_total</code> to numbers, and deal with any value the conversion can’t read.</li>
</ul>
<p>Write a one-line reason for each step in “Why this step?”: it goes into the cleaning log you need in stage 5.</p>`,
      tool: {
        kind: 'cleaning', dataset: 'lantern-orders', ops: ['dedupe', 'dedupe-key', 'trim', 'case', 'map', 'to-number', 'to-date'], watch: ['order_total', 'unit_price'],
        task: 'Take the raw export to one row per order with clean formats. Meet every goal below, and read each step’s note before you move on.',
        goals: [
          ALL_ORDERS,
          { id: 'key', rule: 'unique', column: 'order_id', text: 'Each order_id appears once' },
          { id: 'date', rule: 'type', column: 'order_date', type: 'date', text: 'order_date is stored as ISO dates (YYYY-MM-DD)' },
          { id: 'period', rule: 'range', column: 'order_date', min: '2026-03-01', max: '2026-06-30', text: 'Every order_date falls in 1 March – 30 June 2026' },
          { id: 'region', rule: 'in-set', column: 'region', values: REGIONS, text: 'region is one of North, South, East, West, Central' },
          { id: 'product', rule: 'in-set', column: 'product', values: PRODUCTS, text: 'product is one of the 11 products on the price list' },
          { id: 'price', rule: 'type', column: 'unit_price', type: 'number', text: 'unit_price is stored as numbers' },
          { id: 'total', rule: 'type', column: 'order_total', type: 'number', text: 'order_total is stored as numbers' },
          { id: 'email', rule: 'pattern', column: 'email', pattern: EMAIL_PATTERN, text: 'Every e-mail address is lower case with no spaces' },
        ],
      },
      items: [
        {
          id: 'b02-pj-f1', type: 'rows', kind: 'applied',
          prompt: 'These are the three order ids that appear twice with different values (raw row numbers in the first column; ␣ marks a space). The shop system confirms that LC-10042 was for 2 bags. Select the rows to remove. Rows are numbered from 0.',
          data: { table: {
            head: ['raw row', 'order_id', 'quantity', 'region', 'email', 'order_total'],
            rows: [
              ['43', 'LC-10042', '2', 'West', 'dana.mensah@example.net', '$28.00'],
              ['46', 'LC-10042', '3', 'West', 'dana.mensah@example.net', '$42.00'],
              ['79', 'LC-10076', '3', 'West', '', '$58.50'],
              ['80', 'LC-10076', '3', 'West', 'dana.tanaka@example.net', '$58.50'],
              ['151', 'LC-10146', '1', 'North', 'theo.silva@example.com', '$17.55'],
              ['157', 'LC-10146', '1', 'north␣', 'theo.silva@example.com', '$17.55'],
            ],
          } },
          answer: [1, 2, 5],
          solution: 'LC-10042: both copies are internally consistent (2 × $14 = $28, 3 × $14 = $42), so only the shop system can decide; it confirms 2 bags, so remove row 46. LC-10076: the copies differ only by a blank e-mail, so keep the most complete copy (row 80) and remove row 79. LC-10146: “north␣” becomes North after trimming and case, so the copies are identical; remove the later one, row 157. In the lab, “Remove repeated keys” with “Most complete” keeps exactly rows 43, 80 and 151 (ties go to the first copy); “First” would keep the incomplete row 79, and “Last” would keep the wrong quantity.',
        },
        {
          id: 'b02-pj-f2', type: 'mc', kind: 'applied',
          prompt: 'Four dates, 05/03/2026, 03/04/2026 and 04/05/2026 (twice), read as valid dates in the period either way round. How should they be read, and why?',
          options: [
            'Day first: all four are web orders, every unambiguous four-digit-year slash date in the file (29/03/2026, 31/03/2026, 16/04/2026, 23/04/2026, 15/05/2026) is day first and from a web order, and the month-first dates are app orders with two-digit years',
            'Month first, because the business is in the United States',
            'Whichever reading puts the order closer to its neighbours in the file',
            'Delete them, because an ambiguous date can’t be used',
          ],
          answer: 0,
          feedback: {
            1: 'The file itself shows that its web source writes day first. A guess about the country’s convention is weaker evidence than the source’s own unambiguous dates.',
            2: 'Row order in an export isn’t guaranteed to follow the date, and a month either way can still look plausible.',
            3: 'The orders happened. Deleting them would drop real revenue when the evidence settles the reading.',
          },
          solution: 'Resolve ambiguous dates from the source’s convention, shown by its unambiguous values. In this file every four-digit-year slash date that can be read only one way is day first and comes from the web shop; the M/D/YY dates come from the app. So 05/03/2026 is 5 March, 03/04/2026 is 3 April and 04/05/2026 is 4 May. Record the assumption in the report.',
        },
        {
          id: 'b02-pj-f3', type: 'fill', kind: 'numerical',
          prompt: 'Two order dates are spreadsheet serial numbers in Excel’s 1900 date system, where 46082 is 1 March 2026. Choose the ISO date of each.',
          text: '46176 is [[0]]. 46186 is [[1]].',
          blanks: [
            { options: ['2026-06-02', '2026-06-03', '2026-06-04', '2026-05-03'], answer: 1 },
            { options: ['2026-06-13', '2026-06-12', '2026-06-14', '2026-05-13'], answer: 0 },
          ],
          solution: '46176 − 46082 = 94 days after 1 March. 1 April is 31 days after 1 March, 1 May 61 days and 1 June 92 days, so 94 days after 1 March is 3 June 2026 (2026-06-03). 46186 is 10 days later: 13 June 2026 (2026-06-13).',
        },
        {
          id: 'b02-pj-f4', type: 'num', kind: 'numerical',
          prompt: 'The raw <code>region</code> column has 17 different values. How many remain after trimming spaces and converting to Title Case, before any mapping?',
          answer: 11, check: () => new Set(['North', 'West', 'Central', 'East', 'South', 'N.', 'S.', 'north', 'Wset', 'SOUTH', 'east', 'Soth', 'north ', 'Nrth', 'E.', 'West ', 'central'].map((v) => v.trim().toLowerCase().replace(/(^|\s)(\S)/g, (m, a, b) => a + b.toUpperCase()))).size,
          unit: 'values', places: 0, tol: 0,
          wrong: [
            { value: 15, say: 'That is the count after trimming alone. Title Case then merges north, SOUTH, east and central with their standard spellings.' },
            { value: 5, say: 'Trimming and case don’t touch abbreviations or typing errors: N., S., E., Wset, Soth and Nrth remain until a mapping merges them.' },
          ],
          solution: 'Trimming merges “north␣” and “West␣” with north and West (17 → 15). Title Case merges north, SOUTH, east and central with North, South, East and Central (15 → 11). The 6 values left over (N., S., E., Wset, Soth, Nrth) need a reviewed mapping to reach the five regions.',
        },
        {
          id: 'b02-pj-f5', type: 'mc', kind: 'conceptual',
          prompt: 'Converting <code>unit_price</code> with a decimal point leaves one value as text: 16,50, on a Decaf Colombia 250g order. What should you do with it?',
          options: [
            'Read it with a decimal comma as $16.50, which matches the product’s list price and the order’s total, and record why',
            'Remove the comma and read it as $1,650',
            'Set it to missing and flag the order, because a price the conversion couldn’t read can’t be trusted until the shop confirms it',
            'Delete the order',
          ],
          answer: 0,
          feedback: {
            1: 'A comma before two digits is a decimal comma, not a thousands separator, which needs three digits after it. $1,650 for a bag would be a new error.',
            2: 'The evidence (the list price and the total) settles the value; setting it to missing throws away information you have.',
            3: 'The order is genuine: only the format of one value is wrong.',
          },
          solution: 'A value that fails conversion is a format problem until shown otherwise. 16,50 is European notation for 16.50; the list price of Decaf Colombia 250g is $16.50 and the order total agrees. Convert it in a second step with a decimal comma, so that the first step’s note still lists it.',
        },
      ],
    },
    // ---------------------------------------------------------------- 3
    {
      id: 'values', title: 'Handle missing values and outliers',
      html: `<p>This lab starts from the export after stage 2’s standard steps (231 rows, formats fixed), so that everyone works on the same table.</p>
<ul>
<li>Find the impossible quantities and the implausible price with <strong>Validate values</strong> or <strong>Treat outliers</strong>. For each one, read the rest of the row: does <code>order_total</code> show what the value should be? Correct a value only with evidence. <strong>Map values</strong> replaces one exact value with another everywhere in a column, so first check that the value you replace occurs only where it is wrong; for the price, <strong>Transform</strong> with Rescale also works. Don’t delete orders that happened.</li>
<li>Run an outlier check on <code>quantity</code> and decide, order by order, what each flag means. One large order is a genuine office order and must stay as it is.</li>
<li>Ratings: compare how often they are missing for subscribers and for one-off buyers (the issue list reports it). Record the gap with <strong>Flag missing values</strong> rather than inventing ratings.</li>
<li>E-mail addresses: count how many blanks could be recovered from the same customer’s other orders (look up the <code>customer_id</code> in the table). If you recover them in the lab, use <strong>Fill missing values</strong> with the most common value <em>within groups of</em> <code>customer_id</code>: it copies each customer’s own address and leaves a customer with no other order blank, because any address placed there would be someone else’s. A fill without the grouping would give every blank the same stranger’s address.</li>
</ul>`,
      tool: {
        kind: 'cleaning', dataset: 'lantern-orders', prepare: STANDARD_RECORDS,
        ops: ['validate', 'outliers', 'map', 'transform', 'flag-missing', 'fill', 'drop-missing'], watch: ['quantity', 'unit_price', 'rating'],
        task: 'Correct the impossible values from the evidence in each row, keep the genuine extreme order, and record the missing ratings without inventing any.',
        goals: [
          ALL_ORDERS,
          { id: 'qty', rule: 'range', column: 'quantity', min: 1, max: 200, integer: true, text: 'Every quantity is a whole number from 1 to 200' },
          { id: 'price', rule: 'range', column: 'unit_price', min: 10, max: 100, text: 'Every unit_price lies between $10 and $100 (the list prices run from $14 to $58)' },
          { id: 'flag', rule: 'range', column: 'rating_missing', min: 0, max: 1, integer: true, text: 'A missing-value indicator, rating_missing, records which orders have no rating' },
          { id: 'stars', rule: 'range', column: 'rating', min: 1, max: 5, integer: true, text: 'rating holds only whole stars from 1 to 5 (no averages written into it)' },
          { id: 'kept', rule: 'equals', column: 'rating_missing', expr: '0 * rating', tol: 0, text: 'No rating has been invented: every order flagged in rating_missing still has a blank rating' },
          { id: 'unknown', rule: 'missing-between', column: 'rating', min: 77, max: 77, text: 'The 77 orders without a rating still have none: unknown ratings are flagged, not filled' },
        ],
      },
      items: [
        {
          id: 'b02-pj-m1', type: 'classify', kind: 'applied',
          prompt: 'Decide what to do with each value the rules and the outlier check flag.',
          items: [
            'LC-10079: quantity −2, unit_price $17.00, discount 0, order_total $34.00',
            'LC-10082: quantity 999, unit_price $16.50, discount $1.65, order_total $14.85',
            'LC-10105: quantity 0, unit_price $18.00, discount 0, order_total $18.00',
            'LC-10175: quantity 0, unit_price $16.50, discount $1.65, order_total $14.85',
            'LC-10144: quantity 120, unit_price $14.00, discount $168.00, order_total $1,512.00',
            'LC-10148: quantity 1, unit_price $1,800.00, discount 0, order_total $18.00',
          ],
          categories: ['Correct it: the rest of the row shows the true value', 'Keep it: a genuine value', 'Set it to missing: no evidence for the true value'],
          answer: [0, 0, 0, 0, 1, 0],
          feedback: {
            0: '$34.00 = 2 × $17.00 − 0: the quantity was keyed as a refund. Correct it to 2.',
            1: '$14.85 = 1 × $16.50 − $1.65: 999 is a placeholder. Correct it to 1.',
            4: '120 × $14.00 − $168.00 = $1,512.00, and $168 is the 10% bulk discount: every column agrees. Removing or capping it would understate revenue.',
            5: '$18.00 = 1 × $18.00 − 0, the Sumatra list price: the decimal point was lost. Correct the price to $18.00.',
          },
          solution: 'Each total was charged on the true values, so the total is the evidence: quantities 2, 1, 1 and 1, and a price of $18.00. The 120-bag order is extreme but consistent in every column and has a bulk discount, so it is genuine and stays. Nothing here needs to be set to missing, because every error can be corrected from the row itself.',
        },
        {
          id: 'b02-pj-m2', type: 'num', kind: 'numerical',
          prompt: 'After the four quantities are corrected, run the 1.5 × IQR rule on <code>quantity</code> (quartiles by linear interpolation). How many orders does it flag?',
          answer: 11, check: iqrFlagged, unit: 'orders', places: 0, tol: 0,
          wrong: [
            { value: 1, say: 'Only the 120-bag order is far out, but the rule flags more. With Q1 = 1 and Q3 = 2 the upper fence is 3.5, so every order of 4 bags or more is flagged.' },
            { value: 21, say: 'Orders of 3 bags lie inside the fence of 3.5. Count the orders of 4, 5, 6 and 120 bags.' },
          ],
          solution: 'Q1 = 1 and Q3 = 2, so IQR = 1 and the fences are −0.5 and 3.5. Orders above 3.5: 5 of 4 bags, 4 of 5 bags, 1 of 6 bags and the 120-bag order, 11 in all. In a small, discrete, right-skewed variable the rule flags ordinary larger orders too; a flag starts an investigation, it isn’t a verdict.',
        },
        {
          id: 'b02-pj-m3', type: 'num', kind: 'applied',
          prompt: 'After stage 2, 7 of the 231 orders have no e-mail address. How many of them can be recovered from another order by the same customer?',
          answer: 4, check: () => EMAIL_RECOVERABLE.length, unit: 'addresses', places: 0, tol: 0,
          wrong: [
            { value: 7, say: 'Three of the customers have no other order in the file, so there is no address to copy for them.' },
            { value: 5, say: 'That was true of the raw file. One blank was on the incomplete copy of LC-10076, which stage 2 removed.' },
          ],
          solution: 'Four blanks belong to customers with the address on another order: LC-10030 (C0060), LC-10092 (C0032), and LC-10143 and LC-10194 (both C0016). The other three (LC-10065, LC-10130, LC-10151) belong to customers with no other order, so 3 of 231 orders, 1.30%, stay without an address.',
        },
        {
          id: 'b02-pj-m4', type: 'num', kind: 'numerical',
          prompt: 'Of the 127 one-off orders, 66 have a rating. Of the 104 subscription orders, 88 have one. What percentage of one-off orders have no rating? (2 decimal places)',
          answer: 48.03, check: () => (RATINGS.no.orders - RATINGS.no.rated) / RATINGS.no.orders * 100, unit: '%', places: 2, tol: 0.01,
          wrong: [
            { value: 15.38, say: 'That is the share for subscription orders (16 of 104).' },
            { value: 33.33, say: 'That is the share for all orders (77 of 231). The question asks about one-off orders.' },
            { value: 51.97, say: 'That is the share of one-off orders that do have a rating.' },
          ],
          solution: 'One-off orders without a rating: 127 − 66 = 61, and 61 ÷ 127 × 100 = 48.03%. For subscription orders the share is 16 ÷ 104 = 15.38%. A gap that large (the lab’s chi-square test gives p < 0.001) is strong evidence against MCAR: whether a rating is missing depends on subscription.',
        },
        {
          id: 'b02-pj-m5', type: 'num', kind: 'applied',
          prompt: 'The 88 subscription ratings add to 387 stars and the 66 one-off ratings to 245. Assume ratings are missing at random given subscription, and weight each group’s average by its number of orders (104 subscription, 127 one-off). What is the estimated average rating across all 231 orders? (2 decimal places)',
          answer: 4.02, check: marRating, unit: 'stars', places: 2, tol: 0.006,
          wrong: [
            { value: 4.1, say: 'That is the average of the 154 ratings given, (387 + 245) ÷ 154. Subscribers rate more often and more highly, so it over-weights them.' },
            { value: 4.05, say: 'That is the plain average of the two group averages. The groups have different numbers of orders: weight by 104 and 127.' },
          ],
          solution: 'Group averages: 387 ÷ 88 = 4.398 for subscribers, 245 ÷ 66 = 3.712 for one-off buyers. Weighted by orders: (104 × 4.398 + 127 × 3.712) ÷ 231 = (457.36 + 471.44) ÷ 231 = 4.02. The average of the given ratings, 4.10, overstates it because subscribers both rate more often and rate higher, so they make up 88 of the 154 ratings but only 104 of the 231 orders. Under MNAR even 4.02 could be wrong, which the report must say.',
        },
        {
          id: 'b02-pj-m6', type: 'mc', kind: 'conceptual',
          prompt: 'A colleague suggests filling the 77 missing ratings with the average rating so that every order has one. What is wrong with that?',
          options: [
            'It invents ratings, keeps the biased average, shrinks the spread and hides that one-off buyers rarely rate',
            'Nothing, as long as the average is rounded to a whole star',
            'Only that it changes the average rating, so the report can no longer be compared with the figures from earlier months',
            'It is wrong only because the mean should be replaced by the median, which suits ordinal star ratings better',
          ],
          answer: 0,
          feedback: {
            1: 'Rounding makes the invented ratings look real, which is worse.',
            2: 'Mean imputation leaves the mean exactly as it is; the problems are what it hides and what it does to the spread.',
            3: 'Any single fill value has the same problems; the median only moves the invented ratings to another number.',
          },
          solution: 'Mean imputation keeps the biased average of those who rated, shrinks the standard deviation, weakens relationships with other columns and erases the evidence that missingness depends on subscription. Keep the blanks, record them with an indicator, and report the average with what it represents, plus the MAR estimate.',
        },
      ],
    },
    // ---------------------------------------------------------------- 4
    {
      id: 'prepare', title: 'Prepare the data for analysis',
      html: `<p>This lab starts from the table after the standard steps of stages 2 and 3 (231 rows, corrected quantities and price, ratings flagged). Prepare it for Ana’s analysis:</p>
<ul>
<li>Test rule V5 with <strong>Validate values</strong>: <code>order_total</code> must equal the formula <code>quantity * unit_price - discount</code> within 0.01, with failures flagged. Read the failing orders and what each one got wrong.</li>
<li>Rebuild the totals from their parts with <strong>Derive a column</strong>: <code>line_value</code> = quantity × unit_price, then <code>total_calc</code> = line_value − discount. Delete the stored <code>order_total</code>, rename <code>total_calc</code> to <code>order_total</code> and delete <code>line_value</code>. The flag column keeps the record of which totals changed.</li>
<li>One-hot encode <code>region</code> for the regression Ana’s analyst will run. The regression has an intercept, so drop the first level: it becomes the reference region.</li>
<li>Delete <code>email</code>: the analysis identifies customers by <code>customer_id</code> and doesn’t need anyone’s address.</li>
</ul>
<p>When you finish, the Export panel downloads the cleaned file, this stage’s recipe and a draft report.</p>`,
      tool: {
        kind: 'cleaning', dataset: 'lantern-orders', prepare: [...STANDARD_RECORDS, ...STANDARD_VALUES],
        ops: ['validate', 'derive', 'drop-column', 'rename', 'encode'], watch: ['order_total'],
        task: 'Check that every total follows from its parts, rebuild the ones that don’t while keeping a record of them, encode region and remove the e-mail addresses.',
        goals: [
          ALL_ORDERS,
          { id: 'flag', rule: 'range', column: 'order_total_invalid', min: 0, max: 1, integer: true, text: 'order_total_invalid records which stored totals failed rule V5' },
          { id: 'v5', rule: 'equals', column: 'order_total', expr: 'quantity * unit_price - discount', tol: 0.01, text: 'Every order_total equals quantity × unit_price − discount, to the cent' },
          { id: 'complete', rule: 'no-missing', column: 'order_total', text: 'No order_total is missing' },
          { id: 'encode', rule: 'range', column: 'region_North', min: 0, max: 1, integer: true, text: 'region is one-hot encoded (region_North and the other region columns hold 0 or 1)' },
        ],
      },
      items: [
        {
          id: 'b02-pj-a1', type: 'multi', kind: 'applied',
          prompt: 'Which orders’ stored totals fail rule V5 in this stage’s table? Select all that apply.',
          options: ['LC-10016', 'LC-10107', 'LC-10112', 'LC-10191', 'LC-10198', 'LC-10144', 'LC-10082', 'LC-10148'],
          answer: [0, 1, 2, 3, 4],
          feedback: {
            5: 'The 120-bag order reconciles: 120 × $14.00 − $168.00 = $1,512.00.',
            6: 'LC-10082’s total of $14.85 always matched 1 bag; with the quantity corrected from 999 to 1, it reconciles.',
            7: 'LC-10148’s total of $18.00 matched the true price; with the price corrected from $1,800.00, it reconciles.',
          },
          solution: 'Five totals fail: LC-10016 ($21.35 for 1 × 16.50 − 1.65 = $14.85: a $6.50 shipping charge included), LC-10107 ($15.50 for $13.95: discount not subtracted), LC-10112 ($64.00 for $46.00: digits swapped), LC-10191 ($79.20 for 2 × 54.00 − 10.80 = $97.20: digits swapped) and LC-10198 ($138.00 for 3 × 46.00 − 5.00 = $133.00: discount not subtracted). Five other rows failed V5 before stage 3 (the four impossible quantities and the $1,800.00 price); the corrections made them reconcile, which confirms them.',
        },
        {
          id: 'b02-pj-a2', type: 'num', kind: 'numerical',
          prompt: 'After the totals are rebuilt, what is Lantern’s revenue for the period, the sum of <code>order_total</code> over the 231 orders? (2 decimal places)',
          answer: 9096.15, check: revenueClean, unit: '$', places: 2, tol: 0.005,
          wrong: [
            { value: 9109.2, say: 'That is the sum of the stored totals of the 231 orders, before the five that fail V5 are rebuilt.' },
            { value: 9399.45, say: 'That is the raw export’s sum, which still counts the 9 surplus rows.' },
          ],
          solution: 'The stored totals of the 231 orders add to 9,399.45 − 290.25 (the 9 surplus rows) = $9,109.20. Rebuilding the five failing totals changes them by −6.50, −1.55, −18.00, +18.00 and −5.00, a net −$13.05, so revenue is $9,096.15.',
        },
        {
          id: 'b02-pj-a3', type: 'num', kind: 'numerical',
          prompt: 'By how much did rebuilding the five failing totals change total revenue? Enter a fall as a negative number. (2 decimal places)',
          answer: -13.05, check: () => sum(UNRECONCILED.map((o) => recomputed(o) - o.stored)), unit: '$', places: 2, tol: 0.005,
          wrong: [
            { value: 13.05, say: 'Revenue fell: four of the five stored totals were too high.' },
            { value: -49.05, say: 'That treats every correction as a fall. LC-10191 rose by $18.00 (its digits were swapped downwards), which offsets LC-10112’s fall of $18.00.' },
          ],
          solution: 'Changes: LC-10016 −6.50, LC-10107 −1.55, LC-10112 −18.00, LC-10191 +18.00, LC-10198 −5.00; net −$13.05. The net effect is small because two large errors cancel, which is why the report gives the individual corrections as well as the net: the orders themselves were wrong by up to $18.',
        },
        {
          id: 'b02-pj-a4', type: 'num', kind: 'applied',
          prompt: 'What share of the cleaned revenue of $9,096.15 comes from the single 120-bag office order (120 × $14.00 − $168.00)? (2 decimal places)',
          answer: 16.62, check: () => (BULK.q * BULK.p - BULK.d) / revenueClean() * 100, unit: '%', places: 2, tol: 0.01,
          wrong: [
            { value: 18.47, say: 'That uses the order’s value before the bulk discount ($1,680). Revenue counts what was charged, $1,512.' },
            { value: 0.43, say: 'That is its share of orders (1 of 231). The question asks for its share of revenue.' },
          ],
          solution: '120 × 14.00 − 168.00 = $1,512.00, and 1,512.00 ÷ 9,096.15 × 100 = 16.62%. One order in 231 brings a sixth of the revenue, and it is in Central, so Central’s average order value ($85.04) must be reported with and without it.',
        },
        {
          id: 'b02-pj-a5', type: 'mc', kind: 'applied',
          prompt: 'LC-10016’s stored total of $21.35 includes a $6.50 shipping charge. Rule V5 rebuilds it as $14.85. What else should happen?',
          options: [
            'Keep the order_total_invalid flag and list the order in the report, so the shop team can fix how shipping is recorded',
            'Nothing: once V5 has rebuilt the total, the shipping charge no longer affects any figure in the analysis or the report',
            'Keep $21.35, because that is what the customer paid',
            'Delete the order, because one of its values was wrong',
          ],
          answer: 0,
          feedback: {
            1: 'The cause sits upstream: unless someone fixes how the shop records shipping, the next export has the same error, and an unrecorded change can’t be audited.',
            2: 'The data dictionary defines order_total as quantity × unit_price − discount, to the cent; shipping belongs in another field. Mixing it in would make this order disagree with every other order.',
            3: 'The order is genuine and its other values are right. Deleting it would lose a real sale.',
          },
          solution: 'A cleaning step fixes the analysis file; the flag and the report fix the process. Record which totals were rebuilt and why, and send the list to the people who own the shop system.',
        },
        {
          id: 'b02-pj-a6', type: 'mc', kind: 'conceptual',
          prompt: 'Why does stage 4 delete the <code>email</code> column before the file goes to Ana’s analyst?',
          options: [
            'Addresses are personal data the analysis doesn’t need, since customer_id already identifies repeat customers',
            'Because some addresses are still missing, and a column with gaps can’t be handed over to the analyst for modelling',
            'Because e-mail addresses can’t be one-hot encoded',
            'Because the lab can only export ten columns',
          ],
          answer: 0,
          feedback: {
            1: 'Missing values are a reason to document a column, not to delete it. The reason here is that the column isn’t needed and is personal.',
            2: 'True, but identifiers aren’t model inputs anyway; the point is data minimisation.',
          },
          solution: 'Keep personal details out of analysis files: share only the columns the analysis needs. The raw export, with addresses, stays with the people entitled to it, and the report records that the column was removed and why.',
        },
      ],
    },
    // ---------------------------------------------------------------- 5
    {
      id: 'report', title: 'Write the data quality report',
      html: `<p>Write the data quality report Ana will attach to her review. Start from your notes and the lab’s draft report, then add what the lab can’t supply: the evidence for each decision, its effect on Ana’s figures, and what remains uncertain. Aim for 300–500 words under five headings: purpose and source; issues and decisions; effect on the analysis; limitations; cleaning log.</p>
<p>Give counts with their denominators, keep percentage points apart from relative changes, and name every order you changed.</p>`,
      items: [
        {
          id: 'b02-pj-r1', type: 'num', kind: 'numerical',
          prompt: 'What percentage of the export’s 240 rows did cleaning remove? (2 decimal places)',
          answer: 3.75, check: () => (RAW_ROWS - KEPT) / RAW_ROWS * 100, unit: '%', places: 2, tol: 0.01,
          wrong: [
            { value: 2.5, say: 'That counts only the 6 exact copies. The 3 surplus copies of repeated order ids were removed too.' },
            { value: 3.9, say: 'That divides by the 231 rows kept. The share removed is of the rows received.' },
          ],
          solution: '240 − 231 = 9 rows removed (6 exact copies and 3 surplus copies of repeated order ids): 9 ÷ 240 × 100 = 3.75%. No order was removed: every row that went was a second copy of an order that stays.',
        },
        {
          id: 'b02-pj-r2', type: 'short', kind: 'applied',
          prompt: 'Your data quality report for Lantern’s order export (300–500 words).',
          rubric: [
            'States the purpose and the source: the shop export for 1 March – 30 June 2026, 240 rows and 14 columns, kept unchanged, and 231 orders after cleaning.',
            'For each issue gives the evidence, the scale and the decision: 6 exact copies and 3 repeated ids (survivorship rule and the shop system’s confirmation), 22 non-ISO dates with the day-first reading of the 4 ambiguous ones, the decimal comma, 13 region and 8 product spellings, 4 impossible quantities and the $1,800.00 price corrected from the totals, 5 totals rebuilt.',
            'Keeps the genuine 120-bag order and says what it does to Central’s figures.',
            'Reports missing values with denominators: 77 of 231 ratings (48.03% of one-off orders, 15.38% of subscription orders), not imputed; 7 of 231 addresses, 4 recoverable; the column removed from the analysis file.',
            'Gives the effect on Ana’s figures: revenue $9,096.15 (surplus rows had added $290.25; rebuilt totals a net −$13.05), and the average rating 4.10 as given against about 4.02 under MAR given subscription.',
            'Names the limitations (the date reading is an inference, MAR can’t be tested against MNAR, 3 addresses unknown) and points to the replayable recipe.',
          ],
          model: '<b>Purpose and source.</b> Clean Lantern’s online-shop orders for 1 March – 30 June 2026 for Ana’s review of revenue by region, subscribers against one-off buyers, and ratings. Source: <code>lantern-orders.csv</code> from the shop platform, 240 rows and 14 columns, kept unchanged; the analysis file has 231 rows, one per order, matching the shop system’s count.<br><br><b>Issues and decisions.</b> (1) 6 rows repeated earlier rows exactly and were removed. 3 order ids appeared twice with different values: we kept the most complete copy, and the shop system confirmed 2 bags for LC-10042. (2) 22 dates were not ISO (written out, spreadsheet serials, slash dates). The 4 ambiguous slash dates were read day first, because every unambiguous web-order slash date is day first. One price typed with a decimal comma (16,50) was read as $16.50, the list price. 13 region values and 8 product names were standardised by trimming and case, with a reviewed mapping for 6 region spellings (N., S., E., Nrth, Soth, Wset), and 6 addresses trimmed and lower-cased. (3) 4 impossible quantities (−2, 999, 0, 0) and a price of $1,800.00 were corrected from the order totals to 2, 1, 1, 1 bags and $18.00. The 120-bag office order (LC-10144, $1,512.00) is consistent in every column and was kept. (4) 5 totals did not equal quantity × unit_price − discount (LC-10016, LC-10107, LC-10112, LC-10191, LC-10198: a shipping charge, two unsubtracted discounts, two swapped digits). They were rebuilt, flagged in <code>order_total_invalid</code> and sent to the shop team. (5) 77 of 231 orders have no rating: 48.03% of one-off orders but 15.38% of subscription orders. Ratings were not imputed; <code>rating_missing</code> records the gaps. 7 of 231 orders lacked an address; 4 are recoverable from the same customer’s other orders. The <code>email</code> column was removed from the analysis file.<br><br><b>Effect on the analysis.</b> Revenue is $9,096.15. The surplus rows had added $290.25, and the rebuilt totals change revenue by a net −$13.05 (individual errors up to $18). The given ratings average 4.10; weighting subscribers and one-off buyers by their orders gives 4.02 if ratings are missing at random given subscription. Central’s average order value is $85.04 with the office order and $25.58 without it, about 16.6% of all revenue coming from that one order.<br><br><b>Limitations.</b> The day-first reading of 4 dates is an inference. Whether non-raters would rate like raters can’t be tested (MNAR is possible). 3 addresses are unknown.<br><br><b>Cleaning log.</b> Every step, with its reason, is in the recipe files; replaying them on the raw export reproduces the analysis file.',
          solution: 'Compare your report with the model and the rubric. The figures that must be right are the counts with their denominators (240 → 231 rows; 77 of 231 ratings; 7 of 231 addresses), the revenue of $9,096.15 with the effects of the surplus rows ($290.25) and the rebuilt totals (−$13.05), and the two average ratings (4.10 as given, about 4.02 under MAR).',
        },
      ],
    },
  ],
  rubric: [
    'Stage 1: the profile and rules V1 to V4 are in place, and the counts are right: 240 rows, 231 distinct order ids, 6 exact copies, 8 blank addresses (3.33%), and 4, 13, 6 and 22 values flagged by V1 to V4.',
    'Stage 2: 231 rows, one per order, with the right copy of each repeated id; ISO dates with the ambiguous four read day first on stated evidence; numeric prices and totals (16,50 read as $16.50); standard regions, products and addresses.',
    'Stage 3: the four impossible quantities and the $1,800.00 price are corrected from the totals, the 120-bag order is kept unchanged, the ratings are flagged rather than filled, and the missing addresses are counted (4 recoverable, 3 not).',
    'Stage 4: the five unreconciled totals are found, rebuilt and flagged; revenue is $9,096.15; region is encoded and the e-mail addresses are gone from the analysis file.',
    'Stage 5: the report gives evidence, scale and a decision for each issue, reports counts with their denominators, states the effect on revenue and on the average rating, names its limitations and points to a replayable recipe.',
  ],
  /** Every figure in the project, recomputed from the manifest constants: [what, computed, shown, tol]. */
  verify() {
    const quantities = expand(QUANTITIES);
    return [
      ['orders kept', KEPT, 231], ['rows removed', RAW_ROWS - KEPT, 9], ['share of rows removed (%)', (RAW_ROWS - KEPT) / RAW_ROWS * 100, 3.75],
      ['quantities after correction add up to the orders', quantities.length, KEPT],
      ['ratings: orders in the two groups', RATINGS.yes.orders + RATINGS.no.orders, KEPT],
      ['ratings: blanks', KEPT - RATINGS.yes.rated - RATINGS.no.rated, 77],
      ['ratings: blank share (%)', (KEPT - RATINGS.yes.rated - RATINGS.no.rated) / KEPT * 100, 33.33, 0.005],
      ['ratings: one-off blank share (%)', (RATINGS.no.orders - RATINGS.no.rated) / RATINGS.no.orders * 100, 48.03, 0.005], ['ratings: subscription blank share (%)', (RATINGS.yes.orders - RATINGS.yes.rated) / RATINGS.yes.orders * 100, 15.38, 0.005],
      ['ratings: average as given', observedRating(), 4.10, 0.005], ['ratings: MAR estimate', marRating(), 4.02, 0.005],
      ['ratings: plain average of the two group averages (a wrong answer)', (RATINGS.yes.stars / RATINGS.yes.rated + RATINGS.no.stars / RATINGS.no.rated) / 2, 4.05, 0.005],
      ['ratings: subscriber share of the ratings given', RATINGS.yes.rated, 154 - 66], ['ratings: one-off share of the ratings given', RATINGS.no.rated, 154 - 88],
      ['ratings: subscriber average', 387 / 88, 4.398, 0.0005], ['ratings: one-off average', 245 / 66, 3.712, 0.0005],
      ['ratings: weighted parts', 104 * 387 / 88, 457.36, 0.005], ['ratings: weighted parts', 127 * 245 / 66, 471.44, 0.005],
      ['e-mail: blank in the raw file', EMAIL_BLANK_RAW.length, 8],
      ['V2 flags: abbreviations, typing errors, capitals, trailing spaces', FLAGGED_BY_RULE.region, 3 + 3 + 4 + 3], ['V1 flags: −2, 999, 0, 0', FLAGGED_BY_RULE.quantity, [-2, 999, 0, 0].length],
      ['e-mail: blank after stage 2', EMAIL_BLANK_KEPT, EMAIL_RECOVERABLE.length + EMAIL_UNRECOVERABLE.length],
      ['e-mail: unrecoverable share (%)', EMAIL_UNRECOVERABLE.length / KEPT * 100, 1.30, 0.005],
      ['e-mail: raw blank share (%)', EMAIL_BLANK_RAW.length / RAW_ROWS * 100, 3.33, 0.005],
      ['surplus totals', sum(SURPLUS_TOTALS), 290.25], ['stored totals of the kept orders', storedKeptSum(), 9109.20],
      ['revenue after rebuilding totals', revenueClean(), 9096.15], ['net change from rebuilding', sum(UNRECONCILED.map((o) => recomputed(o) - o.stored)), -13.05],
      ['absolute change from rebuilding', sum(UNRECONCILED.map((o) => Math.abs(recomputed(o) - o.stored))), 49.05],
      ['LC-10016 rebuilt', recomputed(UNRECONCILED[0]), 14.85], ['LC-10107 rebuilt', recomputed(UNRECONCILED[1]), 13.95],
      ['LC-10112 rebuilt', recomputed(UNRECONCILED[2]), 46.00], ['LC-10191 rebuilt', recomputed(UNRECONCILED[3]), 97.20], ['LC-10198 rebuilt', recomputed(UNRECONCILED[4]), 133.00],
      ['shipping charge in LC-10016', UNRECONCILED[0].stored - recomputed(UNRECONCILED[0]), 6.50],
      ['bulk order total', BULK.q * BULK.p - BULK.d, 1512], ['bulk discount is 10%', BULK.d / (BULK.q * BULK.p), 0.10],
      ['bulk order share of revenue (%)', (BULK.q * BULK.p - BULK.d) / revenueClean() * 100, 16.62, 0.005],
      ['Central average with the bulk order', CENTRAL.revenue / CENTRAL.orders, 85.04, 0.005],
      ['Central average without it', (CENTRAL.revenue - (BULK.q * BULK.p - BULK.d)) / (CENTRAL.orders - 1), 25.58, 0.005],
      ['IQR flags on quantity', iqrFlagged(), 11], ['orders of 4 to 6 bags', QUANTITIES[4] + QUANTITIES[5] + QUANTITIES[6], 10],
      ['serial 46176 is 3 June 2026', 46176 - 46082, (Date.UTC(2026, 5, 3) - Date.UTC(2026, 2, 1)) / 86400000], ['serial 46186 is 13 June 2026', 46186 - 46082, (Date.UTC(2026, 5, 13) - Date.UTC(2026, 2, 1)) / 86400000],
      ['raw totals overstated by the surplus (%)', sum(SURPLUS_TOTALS) / storedKeptSum() * 100, 3.19, 0.005],
    ];
  },
};
