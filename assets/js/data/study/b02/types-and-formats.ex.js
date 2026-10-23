// types-and-formats.ex.js — B02 · Incorrect data types and inconsistent dates: widgets, practice and the knowledge
// check (answer keys live here). Every business and number is fictional. Every number is recomputed by `check`.

const DAY = 86400000;
const serial1900 = (y, m, d) => (Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / DAY;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const longDate = (t) => `${WEEKDAYS[t.getUTCDay()]} ${t.getUTCDate()} ${MONTHS[t.getUTCMonth()]} ${t.getUTCFullYear()}`;
const iso = (t) => t.toISOString().slice(0, 10);

export const widgets = {
  'tf-lab': {
    type: 'cleaning',
    dataset: 'lantern-orders',
    ops: ['to-number', 'to-date'],
    watch: ['unit_price'],
    task: 'Before converting anything, list the different ways <code>unit_price</code> is written. Convert it to a number and compare the summary statistics before and after: did any value fail to convert, and is any converted price implausible for a bag of coffee? Then convert <code>order_date</code> and read what the lab reports about the values it could not read. Which of them could be read two ways, and what evidence would settle them? Compare the slash dates with the <code>channel</code> column: which channel writes four-digit years, which writes two-digit years, and which way round does each channel put the day and month in the dates that can only be read one way?',
  },
  'tf-serial': {
    type: 'formula',
    title: 'What date is this serial number?',
    intro: 'Spreadsheet serial numbers count days. The same number means different dates in Excel’s two date systems.',
    inputs: [
      { id: 'serial', label: 'Serial number', min: 61, max: 73050, step: 1, value: 46085, fmt: 'int' },
    ],
    compute: (v) => {
      const d1900 = new Date(Date.UTC(1899, 11, 30) + v.serial * DAY);
      const d1904 = new Date(Date.UTC(1904, 0, 1) + v.serial * DAY);
      return {
        headline: { label: 'Date in the 1900 date system', value: longDate(d1900) },
        rows: [
          ['ISO 8601', iso(d1900)],
          ['Same number read in the 1904 date system', `${longDate(d1904)} (${iso(d1904)})`],
          ['Days after 30 December 1899', Math.round(v.serial).toLocaleString('en-US')],
          ['Gap between the two readings', '1,462 days'],
        ],
        note: 'From 1 March 1900 (serial 61) onwards, a 1900-system serial number is the number of days since 30 December 1899, because Excel also counts a 29 February 1900 that never existed. If the workbook used the 1904 date system, the same number stands for a date 1,462 days (four years and one day) later.',
      };
    },
  },
};

export const guided = [
  {
    id: 'b02-tf-g1', type: 'classify', kind: 'conceptual',
    prompt: 'A plain number parser accepts only digits, an optional hyphen-minus at the start and a decimal point. For each value from a <code>price</code> or code column, decide what it needs.',
    items: ['42.50', '$42.50', '1,250.00', '(15.00)', '−15.00 (typed with the Unicode minus sign)', '-15', '19,50 (from a German-locale sheet)', '004517 (a site number)'],
    categories: ['Converts as it is', 'Needs cleaning before converting', 'Should stay text (an identifier)'],
    answer: [0, 1, 1, 1, 1, 0, 1, 2],
    hints: [
      'Look for any character other than digits, a leading hyphen-minus and a point.',
      'Ask of the last value whether arithmetic on it would ever make sense.',
    ],
    feedback: {
      3: 'Parentheses mark an accounting negative. Replace them with a minus sign first.',
      4: 'The Unicode minus (U+2212) looks like a hyphen but is a different character; parsers such as Python’s float() reject it.',
      6: 'In a German locale the comma is the decimal mark. Replace it with a point (19.50) before parsing.',
      7: 'Converting a site number to a number would turn 004517 into 4517. It is a label, so it stays text.',
    },
    solution: '42.50 and -15 convert as they are. $42.50 (currency symbol), 1,250.00 (grouping comma), (15.00) (parentheses), −15.00 (Unicode minus) and 19,50 (decimal comma) all need cleaning first. 004517 is an identifier and should stay text, or it loses its leading zeros.',
  },
  {
    id: 'b02-tf-g2', type: 'steps', kind: 'numerical',
    prompt: 'A spreadsheet column of order totals (fictional) holds: 14.00 and 22 stored as numbers, and the text values $17.00, $1,400.00, 15,50 (typed on a German-locale sheet) and (14.00).',
    solution: 'SUM adds only the two real numbers: 14 + 22 = $36.00. Converted, the values are 14, 22, 17, 1,400, 15.50 and −14, which total $1,454.50. The value 15,50 is fifteen dollars fifty because its source uses a decimal comma.',
    steps: [
      { id: 'b02-tf-g2-s1', type: 'num',
        prompt: 'What does a spreadsheet SUM over the column return before any conversion?',
        answer: 36, check: () => 14 + 22, unit: '$', places: 2, tol: 0.005,
        hints: ['SUM ignores text values.', 'Only 14.00 and 22 are stored as numbers.'],
        wrong: [{ value: 1454.5, say: 'That is the correct total after conversion. Before conversion SUM silently skips the four text values.' }] },
      { id: 'b02-tf-g2-s2', type: 'mc',
        prompt: 'How should “15,50” be converted?',
        options: ['15.50, because its source uses the comma as the decimal mark', '1,550, because the comma separates thousands', '15, dropping everything after the comma', 'Leave it as text, because it is ambiguous'],
        answer: 0,
        hints: ['The prompt tells you which locale the value came from.', 'In a German locale, 1.250,00 is one thousand two hundred and fifty.'],
        feedback: {
          1: 'A thousands separator is followed by three digits, and this source uses the comma as its decimal mark anyway.',
          2: 'Truncating throws away the cents, which are real.',
          3: 'The source’s locale settles it, so there is no need to leave it unconverted.',
        } },
      { id: 'b02-tf-g2-s3', type: 'num',
        prompt: 'What is the correct total after converting every value?',
        answer: 1454.5, check: () => 14 + 22 + 17 + 1400 + 15.50 - 14, unit: '$', places: 2, tol: 0.005,
        hints: ['The values become 14, 22, 17, 1,400, 15.50 and −14.', 'The refund in parentheses is subtracted.'],
        wrong: [
          { value: 1482.5, say: 'You added the refund. Parentheses mark a negative amount: subtract 14.' },
          { value: 2989, say: 'You read 15,50 as 1,550. Its source uses a decimal comma, so it is 15.50.' },
        ] },
    ],
  },
  {
    id: 'b02-tf-g3', type: 'num', kind: 'numerical',
    prompt: 'What serial number does 30 March 2026 have in Excel’s 1900 date system?',
    answer: 46111, check: () => serial1900(2026, 3, 30), unit: '', places: 0, tol: 0,
    hints: [
      'Serial number 46082 is 1 March 2026.',
      'Add the number of days from 1 March to 30 March.',
    ],
    wrong: [
      { value: 46109, say: 'You counted the days since 1 January 1900. In the 1900 system 1 January 1900 is day 1, not day 0, and Excel also counts a 29 February 1900: for modern dates, count from 30 December 1899.' },
      { value: 46110, say: 'You allowed for 1 January 1900 being day 1 but not for the 29 February 1900 that Excel counts although it never existed.' },
    ],
    solution: '1 March 2026 is 46082, and 30 March is 29 days later: 46082 + 29 = 46111. Equivalently, 46111 is the number of days from 30 December 1899 to 30 March 2026.',
  },
  {
    id: 'b02-tf-g4', type: 'fill', kind: 'applied',
    prompt: 'Lantern’s web shop writes slash dates day first with a four-digit year, as in 04/03/2026 for 4 March 2026. Choose the explicit format for each tool.',
    text: 'pandas: pd.to_datetime(s, format=[[0]], errors=&#39;coerce&#39;)<br>PostgreSQL: to_date(order_date, [[1]])',
    blanks: [
      { options: ['%d/%m/%Y', '%m/%d/%Y', '%d/%m/%y', '%Y-%m-%d'], answer: 0 },
      { options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'], answer: 0 },
    ],
    hints: [
      'Day comes first, then month, then a four-digit year.',
      'In pandas, %d is the day, %m the month, %Y a four-digit year and %y a two-digit year.',
    ],
    solution: 'pandas: format=&#39;%d/%m/%Y&#39;. PostgreSQL: to_date(order_date, &#39;DD/MM/YYYY&#39;). Both state the order of day and month explicitly, so 04/03/2026 is read as 4 March and a value that doesn’t fit the pattern fails (in pandas, becomes missing with errors=&#39;coerce&#39;) instead of being guessed.',
  },
];

export const independent = [
  {
    id: 'b02-tf-i1', type: 'rows', kind: 'applied',
    prompt: 'These dates come from a file whose source and format are unknown. Select every value that is ambiguous: it could be day/month/year or month/day/year, and the two readings give different dates. Rows are numbered from 0.',
    data: { table: {
      head: ['Raw date'],
      rows: [['12/03/2026'], ['25/03/2026'], ['03/03/2026'], ['07/11/2026'], ['11/30/2026'], ['2026-04-05'], ['01/02/2026'], ['13/01/2026']],
    } },
    answer: [0, 3, 6],
    solution: '12/03/2026 (12 March or 3 December), 07/11/2026 (7 November or 11 July) and 01/02/2026 (1 February or 2 January) are ambiguous. 25/03/2026, 11/30/2026 and 13/01/2026 each contain a number above 12, so only one reading is valid. 03/03/2026 reads the same both ways. 2026-04-05 is ISO 8601, which is always year-month-day.',
  },
  {
    id: 'b02-tf-i2', type: 'num', kind: 'applied',
    prompt: 'Lantern’s shop stamps orders in UTC. Lantern reports sales by its local day, and its local time is five hours behind UTC (UTC−05:00). Using the orders below (fictional), what is total revenue for 14 March in local time?',
    data: { table: {
      head: ['Timestamp (UTC)', 'order_total'],
      rows: [
        ['2026-03-14T13:05:00Z', '$14.00'],
        ['2026-03-14T22:40:00Z', '$19.50'],
        ['2026-03-15T03:15:00Z', '$49.00'],
        ['2026-03-15T04:50:00Z', '$22.00'],
        ['2026-03-15T05:20:00Z', '$17.00'],
        ['2026-03-14T04:30:00Z', '$16.50'],
      ],
    } },
    answer: 104.5, check: () => 14 + 19.50 + 49 + 22, unit: '$', places: 2, tol: 0.005,
    wrong: [
      { value: 50, say: 'That groups the orders by their UTC date. Convert each time to local time (subtract five hours) first.' },
      { value: 121.5, say: 'The 05:20 UTC order is 00:20 on 15 March in local time, so it belongs to the next day.' },
      { value: 121, say: 'The 04:30 UTC order on 14 March is 23:30 on 13 March in local time, so it belongs to the day before.' },
    ],
    solution: 'Subtract five hours from each timestamp. Local times: 08:05 on 14 March ($14.00), 17:40 on 14 March ($19.50), 22:15 on 14 March ($49.00), 23:50 on 14 March ($22.00), 00:20 on 15 March ($17.00) and 23:30 on 13 March ($16.50). Local 14 March: 14.00 + 19.50 + 49.00 + 22.00 = $104.50. Grouping by UTC date would give $50.00.',
  },
  {
    id: 'b02-tf-i3', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s app export writes dates such as 3/14/26 and 3/4/26. Which instruction reads them correctly in pandas?',
    options: [
      'pd.to_datetime(s, format=&#39;%m/%d/%y&#39;)',
      'pd.to_datetime(s, format=&#39;%d/%m/%Y&#39;)',
      'pd.to_datetime(s, format=&#39;%m/%d/%Y&#39;)',
      'pd.to_datetime(s, dayfirst=True)',
    ],
    answer: 0,
    feedback: {
      1: 'This reads day first with a four-digit year. 3/14/26 has no month 14, and the year has two digits.',
      2: 'The order is right, but %Y expects a four-digit year. A two-digit year needs %y.',
      3: 'The app writes month first, so preferring day first is wrong, and dayfirst is a preference rather than a rule: some values would still be read month-first.',
    },
    solution: 'The app writes month, day and a two-digit year, so the format is &#39;%m/%d/%y&#39;. Python reads two-digit years 00–68 as 2000–2068, so 26 becomes 2026; check that this century rule suits your data.',
  },
  {
    id: 'b02-tf-i4', type: 'classify', kind: 'conceptual',
    prompt: 'Choose the data type each column should have.',
    items: ['order_total', 'customer_id (values like C0089)', 'site number (values like 004517)', 'order_date', 'subscription (yes/no)', 'quantity', 'postcode (values like HC4 7QT)', 'phone number'],
    categories: ['Number', 'Text', 'Date', 'Boolean'],
    answer: [0, 1, 1, 2, 3, 0, 1, 1],
    feedback: {
      2: 'A site number is made of digits but is a label: stored as a number it loses its leading zeros.',
      7: 'Nobody adds or averages phone numbers, and stored as numbers they lose leading zeros and the plus sign.',
    },
    solution: 'Numbers: order_total and quantity, which you add and average. Text: customer_id, site number, postcode and phone number, which are labels. Date: order_date. Boolean: subscription.',
  },
  {
    id: 'b02-tf-i5', type: 'num', kind: 'numerical',
    prompt: 'A European green-coffee supplier’s statement lists three amounts in its own format: 1.250,00 and 87,40 and 2.015,75. What is their total?',
    answer: 3353.15, check: () => 1250.00 + 87.40 + 2015.75, unit: '$', places: 2, tol: 0.005,
    wrong: [{ value: 8743.27, say: 'You read the amounts with US conventions (comma for thousands, point for decimals), which turns 87,40 into 8,740 and 1.250,00 into 1.25. In this format the dot separates thousands and the comma is the decimal mark.' }],
    solution: 'In this format the dot separates thousands and the comma marks decimals: 1.250,00 = 1,250.00; 87,40 = 87.40; 2.015,75 = 2,015.75. Total: 1,250.00 + 87.40 + 2,015.75 = 3,353.15.',
  },
  {
    id: 'b02-tf-i6', type: 'mc', kind: 'conceptual',
    prompt: 'A colleague converts serial number 46082 by adding 46,082 days to 1 January 1900 and gets 3 March 2026. Excel shows 1 March 2026. Why are they two days apart?',
    options: [
      '1 January 1900 is day 1, not day 0, and Excel also counts a 29 February 1900 that never existed.',
      'The workbook uses the 1904 date system.',
      'Excel rounds serial numbers to the nearest even day.',
      'Two leap days were skipped between 1900 and 2026.',
    ],
    answer: 0,
    feedback: {
      1: 'The 1904 system would put the dates 1,462 days apart, not two.',
      2: 'Serial numbers are not rounded; whole numbers are whole days.',
      3: 'Every real leap day since 1904 is counted correctly by both methods. The extra day is a leap day that didn’t exist.',
    },
    solution: 'Adding n days to 1 January 1900 treats 1 January as day 0, but Excel numbers it 1: one day. Excel also counts a fictitious 29 February 1900, inherited from Lotus 1-2-3 for compatibility: a second day. For dates from 1 March 1900, count from 30 December 1899 instead.',
  },
];

export const check = [
  {
    id: 'b02-tf-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A column of order dates is stored as text in the form DD/MM/YYYY and sorted from A to Z. What happens?',
    options: [
      'Rows are ordered by the day of the month first, so 01/04/2026 sorts before 02/03/2026.',
      'The dates sort correctly, because they all have the same year.',
      'The sort stops with an error.',
      'The rows are ordered by month and then by day.',
    ],
    answer: 0,
    feedback: {
      1: 'Text is compared character by character from the left, and the left-hand characters here are the day, not the year.',
      2: 'Sorting text rarely fails; it simply uses the wrong order, which is why the problem goes unnoticed.',
      3: 'The month is in the middle of the string, so it only matters when two values share the same day.',
    },
    solution: 'Text sorts character by character, so DD/MM/YYYY strings are ordered by day, then month, then year: 1 April comes before 2 March. Converting to a date type, or writing the dates as ISO 8601 (YYYY-MM-DD), fixes the order.',
  },
  {
    id: 'b02-tf-k2', type: 'num', kind: 'numerical',
    prompt: 'What serial number does 4 June 2026 have in Excel’s 1900 date system? (4 March 2026 is 46085.)',
    answer: 46177, check: () => serial1900(2026, 6, 4), unit: '', places: 0, tol: 0,
    wrong: [
      { value: 46176, say: 'Count the days of March, April and May again: 31 + 30 + 31 = 92 days take 4 March to 4 June.' },
      { value: 46175, say: 'From 4 March to 4 June is 92 days: 31 (March) + 30 (April) + 31 (May).' },
    ],
    solution: 'From 4 March to 4 June is 31 + 30 + 31 = 92 days, so the serial number is 46085 + 92 = 46177.',
  },
  {
    id: 'b02-tf-k3', type: 'rows', kind: 'applied',
    prompt: 'The dates below come from an export whose sources are not recorded. Select the values that cannot be converted to a single date without more information. Rows are numbered from 0.',
    data: { table: {
      head: ['Raw date'],
      rows: [['2026-04-05'], ['14/04/2026'], ['04/05/2026'], ['April 5, 2026'], ['06/06/2026'], ['5/4/26'], ['13/05/2026']],
    } },
    answer: [2, 5],
    solution: '04/05/2026 (4 May or 5 April) and 5/4/26 (5 April or 4 May) can be read two ways, and with no known source there is no convention to apply: flag them, or look for a cross-field check such as a dispatch date. 2026-04-05 is ISO 8601; 14/04/2026 and 13/05/2026 have a first part above 12; April 5, 2026 is written out; 06/06/2026 reads the same either way.',
  },
  {
    id: 'b02-tf-k4', type: 'mc', kind: 'applied',
    prompt: 'A claims file’s customer numbers were saved as numbers and lost their leading zeros. In the register, customer numbers have 4, 5 or 6 digits. What should you do?',
    options: [
      'Go back to the source and export or import the column as text, because padding can’t tell which length each number had.',
      'Pad every value with zeros to six digits.',
      'Pad every value to the length of the longest number in the claims file.',
      'Join on the numeric value and accept the matches that work.',
    ],
    answer: 0,
    feedback: {
      1: 'Padding is safe only when every code has the same documented width. Here 4517 could have been 4517, 04517 or 004517, and padding would create numbers that were never issued.',
      2: 'That is the same guess as padding to six digits, and fails for the same reason.',
      3: 'Joining on numbers matches 4517 to whichever of 4517, 04517 or 004517 exists, which may be the wrong customer, and hides the problem.',
    },
    solution: 'Leading zeros can be restored only when the code’s width is fixed and documented. With codes of three different lengths, the original text is the only reliable source: re-export or re-import the column as text.',
  },
  {
    id: 'b02-tf-k5', type: 'fill', kind: 'conceptual',
    prompt: 'You are converting a <code>subscription</code> column to a boolean with an explicit mapping. Choose the value for each spelling.',
    text: '“Y” → [[0]]; “no” → [[1]]; “TRUE” → [[2]]; a blank cell → [[3]]',
    blanks: [
      { options: ['true', 'false', 'missing (flag)'], answer: 0 },
      { options: ['true', 'false', 'missing (flag)'], answer: 1 },
      { options: ['true', 'false', 'missing (flag)'], answer: 0 },
      { options: ['true', 'false', 'missing (flag)'], answer: 2 },
    ],
    solution: '“Y” and “TRUE” are spellings of true, and “no” is false. A blank means the answer wasn’t recorded, so it becomes missing and is flagged; converting it to false would invent information.',
  },
  {
    id: 'b02-tf-k6', type: 'num', kind: 'numerical',
    prompt: 'An order is stamped 2026-03-20T03:45:00Z. Lantern’s local time is UTC−05:00. At what hour (0–23) of the local clock was the order placed?',
    answer: 22, check: () => Math.floor((3 + 45 / 60 - 5 + 24) % 24), unit: 'hour', places: 0, tol: 0,
    wrong: [{ value: 8, say: 'You added five hours. A local time five hours behind UTC is earlier: subtract five hours.' }],
    solution: 'Local time = UTC − 5 hours: 03:45 − 5 h = 22:45 on the previous day, 19 March. The hour is 22, and the local date is 19 March, not 20 March.',
  },
];
