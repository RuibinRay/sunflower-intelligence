// assess-m2.js — B02 module 2 test: Fixing records and formats (duplicates, types-and-formats, text-and-categories).
// New questions, not copies of lesson exercises. No hints; solutions are shown when the student reviews the test.
// Every business, record and number is fictional. Every num item's `check` recomputes its answer.

const lev = (a, b) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  return d[a.length][b.length];
};
const serial1900 = (y, m, d) => (Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000;

export const items = [
  // ---------------------------------------------------------------- duplicates
  {
    id: 'b02-m2-1', lesson: 'duplicates', type: 'rows', kind: 'applied',
    prompt: 'Rows from Lantern’s order export (fictional). Select the rows to remove so that each order appears once. Keep the latest version of any order that was updated; if two rows are identical, remove the later one. Rows are numbered from 0.',
    data: { table: {
      head: ['order_id', 'updated_at', 'product', 'order_total'],
      rows: [
        ['LC-60401', '2026-06-02 10:00', 'House Blend 250g', '$14.00'],
        ['LC-60402', '2026-06-02 10:05', 'Gift Box Trio', '$58.00'],
        ['LC-60401', '2026-06-02 10:00', 'House Blend 250g', '$14.00'],
        ['LC-60402', '2026-06-02 10:40', 'Gift Box Trio', '$53.00'],
        ['LC-60403', '2026-06-02 12:15', 'Cold Brew Pack', '$22.00'],
        ['LC-60404', '2026-06-03 09:20', 'Espresso Roast 250g', '$15.50'],
        ['LC-60402', '2026-06-02 10:05', 'Gift Box Trio', '$58.00'],
      ],
    } },
    answer: [1, 2, 6],
    solution: 'Row 2 is an exact copy of row 0. Order LC-60402 has three rows: rows 1 and 6 are identical copies of the 10:05 version, and row 3 is the 10:40 update (a $5 promotion code: 58.00 − 5.00 = 53.00). Keep row 3 and remove rows 1 and 6. Rows 4 and 5 are separate orders. Four rows remain, one per order.',
  },
  {
    id: 'b02-m2-2', lesson: 'duplicates', type: 'num', kind: 'numerical',
    prompt: 'An export contains 2,000 genuine orders averaging $21.00, plus 80 surplus duplicate rows whose orders also average $21.00. What average order value does the export report?',
    answer: 21, check: () => (2000 * 21 + 80 * 21) / (2000 + 80), unit: '$', places: 2, tol: 0.005,
    wrong: [
      { value: 21.84, say: 'You divided the inflated revenue by the 2,000 genuine orders. The export reports an average over all 2,080 rows.' },
      { value: 20.19, say: 'You divided the true revenue by 2,080 rows. The export’s revenue includes the surplus rows too.' },
    ],
    solution: 'Reported revenue = 2,000 × 21 + 80 × 21 = $43,680 over 2,080 rows, so the reported average is $21.00. When the duplicated orders are typical, the average is unbiased, even though revenue is overstated by 80 × 21 = $1,680 and the order count by 80.',
  },
  {
    id: 'b02-m2-3', lesson: 'duplicates', type: 'mc', kind: 'conceptual',
    prompt: 'In Northfield University’s enrolment extract for one term, a student who changed programme appears twice: once under each programme, with the same student number. You need a headcount of students. What should the business key be?',
    options: [
      'The student number: the unit of the headcount is a student, so one row per student number should survive.',
      'The student number and programme together, because the two rows differ in programme.',
      'The programme, because headcounts are reported by programme.',
      'The row number, because every row is a separate record.',
    ],
    answer: 0,
    feedback: {
      1: 'That composite key suits a count of programme enrolments, where a student in two programmes counts twice. For a headcount of students it counts this student twice.',
      2: 'Many students share a programme, so the programme can’t identify one student.',
      3: 'A row number identifies a row, not a real-world thing, so it can never reveal a duplicate.',
    },
    solution: 'The business key follows from the question. For a headcount the unit is a student, so the key is the student number and the second row is a duplicate for this purpose. For a count of programme enrolments, the key would be student number and programme together, and both rows would stay.',
  },
  {
    id: 'b02-m2-4', lesson: 'duplicates', type: 'num', kind: 'numerical',
    prompt: 'A customer typed the company name as “Latnern” instead of “Lantern”. What is the edit (Levenshtein) distance between the two?',
    answer: 2, check: () => lev('Lantern', 'Latnern'), unit: 'edits', places: 0, tol: 0,
    wrong: [{ value: 1, say: 'Swapping two neighbouring letters (“nt” and “tn”) is one mistake but two single-character edits: Levenshtein distance has no swap operation.' }],
    solution: '“Lantern” and “Latnern” differ only in positions 3 and 4, where “nt” has become “tn”. Two substitutions fix it, and no single insertion, deletion or substitution can, so the distance is 2.',
  },
  // ---------------------------------------------------------------- types-and-formats
  {
    id: 'b02-m2-5', lesson: 'types-and-formats', type: 'classify', kind: 'conceptual',
    prompt: 'Each value is shown with the locale of the source that wrote it. Which number does each represent?',
    items: ['1,250.00 (US-formatted source)', '1.250,00 (German-formatted source)', '1,25 (German-formatted source)', '1,250 (US-formatted source)', '1,250 (German-formatted source)', '12,50 (German-formatted source)', '(1,250.00) (US-formatted source)'],
    categories: ['1250', '1.25', '12.5', '−1250'],
    answer: [0, 0, 1, 0, 1, 2, 3],
    feedback: {
      4: 'In a German-formatted source the comma is the decimal mark, so 1,250 is one and a quarter, not one thousand two hundred and fifty.',
      6: 'Parentheses mark an accounting negative.',
    },
    solution: 'US formatting uses a comma between thousands and a point before decimals; German formatting reverses them. So 1,250.00, 1.250,00 and the US 1,250 are all 1,250; 1,25 and the German 1,250 are 1.25; 12,50 is 12.5; (1,250.00) is −1,250. The same characters, 1,250, mean two different numbers depending on the source.',
  },
  {
    id: 'b02-m2-6', lesson: 'types-and-formats', type: 'num', kind: 'numerical',
    prompt: 'In an export, the order date of a May order appears as a number. What serial number does 1 May 2026 have in Excel’s 1900 date system? (1 March 2026 is 46082.)',
    answer: 46143, check: () => serial1900(2026, 5, 1), unit: '', places: 0, tol: 0,
    wrong: [
      { value: 46142, say: 'From 1 March to 1 May is 31 (March) + 30 (April) = 61 days, not 60.' },
      { value: 46141, say: 'Count the days of March (31) and April (30): 46082 + 61.' },
    ],
    solution: 'From 1 March to 1 May is 31 + 30 = 61 days, so the serial number is 46082 + 61 = 46143, the number of days from 30 December 1899 to 1 May 2026.',
  },
  {
    id: 'b02-m2-7', lesson: 'types-and-formats', type: 'rows', kind: 'applied',
    prompt: 'Lantern’s staff spreadsheet is documented as writing dates day/month/year with four-digit years, and you convert it with that explicit format. Select the values that will fail to convert to a valid date and need to be flagged. Rows are numbered from 0.',
    data: { table: {
      head: ['Raw order_date'],
      rows: [['12/03/2026'], ['31/04/2026'], ['15/06/2026'], ['29/02/2026'], ['3/14/26'], ['01/01/2026']],
    } },
    answer: [1, 3, 4],
    solution: '31/04/2026 is invalid because April has 30 days; 29/02/2026 is invalid because 2026 is not a leap year; 3/14/26 doesn’t fit the format (a two-digit year, and month 14 if read day first), which suggests it came from another source. All three should fail and be flagged, not guessed. 12/03/2026 (12 March), 15/06/2026 (15 June) and 01/01/2026 convert normally.',
  },
  {
    id: 'b02-m2-8', lesson: 'types-and-formats', type: 'mc', kind: 'applied',
    prompt: 'Lantern reports sales by its local day, and its local time is UTC−05:00. An order is stamped 2026-04-01T03:30:00Z. In which month’s local-day sales report does it belong?',
    options: [
      'March: in local time it was placed at 22:30 on 31 March.',
      'April: the timestamp says 1 April.',
      'Both months, split equally.',
      'Neither: a timestamp with a Z can’t be converted to local time.',
    ],
    answer: 0,
    feedback: {
      1: 'The date in the timestamp is the UTC date. Five hours earlier, on Lantern’s clock, it was still 31 March.',
      2: 'An order happens at one instant, so it belongs to exactly one local day.',
      3: 'Z means an offset of zero from UTC, which makes the conversion exact: subtract five hours.',
    },
    solution: 'Local time = UTC − 5 hours: 03:30 on 1 April UTC is 22:30 on 31 March locally, so the order belongs in March’s local-day report. Grouping by the UTC date would move it into April.',
  },
  // ---------------------------------------------------------------- text-and-categories
  {
    id: 'b02-m2-9', lesson: 'text-and-categories', type: 'classify', kind: 'applied',
    prompt: 'Lantern’s product master list is the controlled vocabulary for product names. Map each raw value from the export, or flag it.',
    items: ['house blend 250g', 'House␣␣Blend 250g', 'HOUSE BLEND 250G', 'House Blend 1kg', 'Espresso Roast 250 g', 'Expresso Roast 250g', 'House Blend'],
    categories: ['House Blend 250g', 'House Blend 1kg', 'Espresso Roast 250g', 'Flag for review'],
    answer: [0, 0, 0, 1, 2, 2, 3],
    feedback: {
      2: 'After case normalisation this is exactly “house blend 250g”.',
      5: 'A one-letter typing error (x for s), but the size and product are clear; confirm once and add it to the mapping table.',
      6: 'Without a size, this could be the 250g bag or the 1kg bag, which have different prices. Check the order’s size_g or unit price before mapping.',
    },
    solution: 'Case and the doubled space are mechanical differences: the first three values are House Blend 250g. House Blend 1kg is its own product. “Espresso Roast 250 g” (extra space) and “Expresso Roast 250g” (typing error) are Espresso Roast 250g. “House Blend” has no size, so flag it and resolve it from the size or price columns.',
  },
  {
    id: 'b02-m2-10', lesson: 'text-and-categories', type: 'num', kind: 'numerical',
    prompt: 'West’s orders by raw spelling (fictional): West, 56 orders averaging $24.50; “West␣”, 4 averaging $30.00; Wset, 2 averaging $19.00. What is West’s mean order value after consolidation? Give two decimal places.',
    answer: 24.68, check: () => (56 * 24.50 + 4 * 30.00 + 2 * 19.00) / (56 + 4 + 2), unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 24.5, say: 'That is the mean of the exact spelling alone, and also, by coincidence, the simple average of the three means. Include every variant and weight each mean by its number of orders.' },
    ],
    solution: 'Revenue: 56 × 24.50 + 4 × 30.00 + 2 × 19.00 = 1,372 + 120 + 38 = $1,530 over 62 orders. Mean: 1,530 ÷ 62 ≈ $24.68.',
  },
  {
    id: 'b02-m2-11', lesson: 'text-and-categories', type: 'mc', kind: 'conceptual',
    prompt: 'Customer names arrive from several systems, and the same accented letter is sometimes stored as one code point and sometimes as a letter plus a combining accent. How should names be stored so that equal names compare equal without losing information?',
    options: [
      'Normalise them to NFC.',
      'Normalise them to NFKC.',
      'Remove all accents.',
      'Convert them to lower case.',
    ],
    answer: 0,
    feedback: {
      1: 'NFKC also applies compatibility mappings, which fold characters that differ in presentation (ligatures, full-width letters). Useful for a matching key, but it changes the stored text.',
      2: 'Removing accents is lossy: it can merge different names and misspells the ones it touches.',
      3: 'Case doesn’t affect how an accent is encoded, and lower-casing changes how the name is displayed.',
    },
    solution: 'NFC (canonical decomposition followed by canonical composition) stores every canonically equivalent sequence the same way, composing a letter and its combining accent into one code point where one exists. It changes the encoding, not the text a reader sees.',
  },
  {
    id: 'b02-m2-12', lesson: 'text-and-categories', type: 'rows', kind: 'conceptual',
    prompt: 'From which product names does the case-sensitive pattern <code>(\\d+)\\s?(g|kg)</code> extract a pack size? Rows are numbered from 0.',
    data: { table: {
      head: ['product'],
      rows: [['House Blend 250g'], ['Decaf Colombia 1kg'], ['Espresso Roast 250 g'], ['Gift Box Trio'], ['Cold Brew Pack'], ['Sumatra Mandheling 250G']],
    } },
    answer: [0, 1, 2],
    solution: 'The pattern needs digits, an optional whitespace character, then “g” or “kg”. It matches “250g”, “1kg” and “250 g”. Gift Box Trio and Cold Brew Pack contain no size. “250G” has a capital G, which a case-sensitive pattern doesn’t match: make the match ignore case, or normalise case first.',
  },
];
