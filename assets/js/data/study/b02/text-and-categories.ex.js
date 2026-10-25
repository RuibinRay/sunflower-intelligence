// text-and-categories.ex.js — B02 · Text cleaning and consistent categories: widgets, practice and the knowledge
// check (answer keys live here). Every business and number is fictional. Every number is recomputed by `check`.
// In tables, ␣ marks an ordinary space and ⍽ a non-breaking space, so students can see them.

const REGIONS = ['North', 'South', 'East', 'West', 'Central', 'Flag for review'];

export const widgets = {
  'txt-lab': {
    type: 'cleaning',
    dataset: 'lantern-orders',
    ops: ['trim', 'case', 'map'],
    watch: ['region'],
    task: 'Count the distinct values of <code>region</code> before you change anything; Lantern’s data dictionary allows five. Apply trim, then case normalisation, and note how many distinct values remain after each step. Then map the remaining variants to North, South, East, West and Central. Which mappings are you sure of, and which would you confirm with someone at Lantern before using them?',
  },
  'txt-countries': {
    type: 'chart',
    kind: 'bar',
    title: 'Harborview bookings by country: largest single spelling against all spellings (fictional)',
    x: { label: 'Country', values: ['United Kingdom', 'United States', 'Germany'] },
    series: [
      { name: 'Largest single spelling', values: [34, 30, 31] },
      { name: 'All spellings combined', values: [82, 67, 51] },
    ],
    y: { label: 'Bookings' },
    note: 'Out of 200 bookings. The largest single spelling understates the United States most: its 67 bookings were split across USA (30), United States (25) and US (12).',
  },
};

export const guided = [
  {
    id: 'b02-txt-g1', type: 'rows', kind: 'applied',
    prompt: 'Region values from Lantern’s export, with ␣ marking an ordinary space and ⍽ a non-breaking space. Select every row with a whitespace problem. Rows are numbered from 0.',
    data: { table: {
      head: ['Raw region'],
      rows: [['North'], ['South␣'], ['␣West'], ['East'], ['Central⍽'], ['West'], ['South␣␣'], ['N.']],
    } },
    answer: [1, 2, 4, 6],
    hints: [
      'Look at the start and the end of each value for ␣ or ⍽.',
      'An abbreviation is a variant, but not a whitespace problem.',
    ],
    solution: 'Rows 1 (trailing space), 2 (leading space), 4 (trailing non-breaking space) and 6 (two trailing spaces) have whitespace problems. Row 7, “N.”, is an abbreviation: it needs the mapping table, not trimming. Row 4 is the one Excel’s TRIM would leave unchanged.',
  },
  {
    id: 'b02-txt-g2', type: 'classify', kind: 'conceptual',
    prompt: 'After trimming and lower-casing, these region values remain. Lantern’s controlled vocabulary is North, South, East, West and Central. Decide the clean value for each, or flag it for review.',
    items: ['nrth', 's.', 'wset', 'central', 'e.', 'soth', 'ne', 'northgate'],
    categories: REGIONS,
    answer: [0, 1, 3, 4, 2, 1, 5, 5],
    hints: [
      'Most are an abbreviation or a single typing error away from one of the five names.',
      'If a value could reasonably mean two regions, or is a place name rather than a region, don’t guess.',
    ],
    feedback: {
      6: '“ne” could be North, East or a north-east area that Lantern doesn’t have. Ask the operations team rather than choosing.',
      7: '“Northgate” is a place, not a region. Someone who knows Lantern’s delivery map must say which region it belongs to; its spelling proves nothing.',
    },
    solution: 'nrth → North, s. → South, wset → West, central → Central, e. → East, soth → South. Flag “ne” (it could mean more than one region) and “northgate” (a place name whose region must be confirmed, however much it looks like “north”).',
  },
  {
    id: 'b02-txt-g3', type: 'steps', kind: 'numerical',
    prompt: 'Orders by raw region value for the South variants (fictional): South 41, SOUTH 3, South␣ 2, S. 4, Soth 1, south 5.',
    solution: 'An exact filter for “South” finds 41 orders. After consolidation South has 41 + 3 + 2 + 4 + 1 + 5 = 56, so the exact filter misses 15 orders, 15 ÷ 56 ≈ 26.8% of the region.',
    steps: [
      { id: 'b02-txt-g3-s1', type: 'num',
        prompt: 'How many orders does South have after consolidation?',
        answer: 56, check: () => 41 + 3 + 2 + 4 + 1 + 5, unit: 'orders', places: 0, tol: 0,
        hints: ['Every variant maps to South.', 'Add the counts of all six variants.'],
        wrong: [{ value: 41, say: 'That is the exact spelling only. Consolidation adds every variant that maps to South.' }] },
      { id: 'b02-txt-g3-s2', type: 'num',
        prompt: 'What percentage of South’s orders does an exact filter for “South” miss? Give one decimal place.',
        answer: 26.8, check: () => (56 - 41) / 56 * 100, unit: '%', places: 1, tol: 0.05,
        hints: ['Missed orders = consolidated count − exact count.', 'Divide the missed orders by the consolidated count, not by 41.'],
        wrong: [{ value: 36.6, say: 'You divided by the 41 orders the filter found. The share missed is out of all of South’s orders, 56.' }] },
    ],
  },
  {
    id: 'b02-txt-g4', type: 'mc', kind: 'conceptual',
    prompt: 'An analyst extracts pack sizes from product names with the pattern <code>(\\d+)\\s?g</code>. What happens with “Decaf Colombia 1kg”?',
    options: [
      'No match: right after “1” the pattern needs a space or a “g”, and the next character is “k”.',
      'It matches “1kg” and returns 1, because the optional space in the pattern can stand for the “k”.',
      'It returns 1000, because the pattern recognises “kg” as a thousand grams and converts the size.',
      'It matches the “g” at the end and returns an empty number.',
    ],
    answer: 0,
    hints: [
      'Read the pattern piece by piece: digits, an optional whitespace character, the letter g.',
      'What character follows the digit 1 in “1kg”?',
    ],
    feedback: {
      1: 'The pattern has no place for the “k”. It would need an alternative such as (g|kg).',
      2: 'A regular expression matches characters; it knows nothing about units or arithmetic.',
      3: '\\d+ needs at least one digit immediately before the optional space and the g, and “kg” has none.',
    },
    solution: 'The pattern requires one or more digits, an optional whitespace character and then “g”. In “1kg” the digit is followed by “k”, so there is no match and the kilogram packs are silently skipped. <code>(\\d+)\\s?(g|kg)</code> handles both units; matching case-insensitively also catches “250G”.',
  },
];

export const independent = [
  {
    id: 'b02-txt-i1', type: 'fill', kind: 'applied',
    prompt: 'Complete Lantern’s region mapping table. It is applied after trimming, lower-casing and removing full stops.',
    text: 'nrth → [[0]]<br>e → [[1]]<br>wset → [[2]]<br>centre → [[3]]<br>ne → [[4]]',
    blanks: [
      { options: REGIONS, answer: 0 },
      { options: REGIONS, answer: 2 },
      { options: REGIONS, answer: 3 },
      { options: REGIONS, answer: 4 },
      { options: REGIONS, answer: 5 },
    ],
    solution: 'nrth → North (a typing error), e → East (the abbreviation “E.” with its full stop removed), wset → West (letters swapped), centre → Central (an alternative name, worth confirming once with the operations team), ne → flag for review, because it could mean more than one region.',
  },
  {
    id: 'b02-txt-i2', type: 'num', kind: 'numerical',
    prompt: 'North’s orders by raw spelling (fictional): North, 50 orders averaging $28.00; north, 10 averaging $21.00; N., 15 averaging $20.00; Nrth, 5 averaging $24.00. What is the mean order value of North after consolidation? Give two decimal places.',
    answer: 25.38, check: () => (50 * 28 + 10 * 21 + 15 * 20 + 5 * 24) / (50 + 10 + 15 + 5), unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 28, say: 'That is the exact spelling only. Consolidation includes all four variants.' },
      { value: 23.25, say: 'That is the simple average of the four means. Weight each mean by its number of orders.' },
    ],
    solution: 'Revenue: 50 × 28 + 10 × 21 + 15 × 20 + 5 × 24 = 1,400 + 210 + 300 + 120 = $2,030. Orders: 50 + 10 + 15 + 5 = 80. Mean: 2,030 ÷ 80 = $25.375 ≈ $25.38, well below the $28.00 of the exactly spelled rows.',
  },
  {
    id: 'b02-txt-i3', type: 'mc', kind: 'applied',
    prompt: 'Two customer records both show the city “Lisboa” and the name “José Alves”, yet an exact comparison says the names differ, and their lengths are 10 and 11 characters. Trimming both values changes nothing. What is the most likely cause, and the fix?',
    options: [
      'One “é” is “e” plus a combining accent; normalise both values to NFC before comparing.',
      'One name has a trailing space that the display hides; trim both values and compare again.',
      'The names differ in case somewhere that the font hides; lower-case both values before comparing.',
      'One name has a typing error that is hard to spot on screen; match them with an edit-distance cut-off of 1.',
    ],
    answer: 0,
    feedback: {
      1: 'A trailing space would add one character, but trimming changed nothing, so the extra character is elsewhere. In an accented name, the likeliest candidate is a combining accent, U+0301.',
      2: 'Both names display with the same capitals, and changing case doesn’t change length.',
      3: 'Nothing is misspelt; the strings display identically. Fuzzy matching would hide the cause instead of fixing it.',
    },
    solution: '“José Alves” has 10 characters when “é” is the single code point U+00E9, and 11 when it is “e” followed by U+0301. Both display the same. Normalising to NFC composes the second form, after which the values compare equal. (Checking the code points distinguishes this from a hidden trailing space, which also adds one character.)',
  },
  {
    id: 'b02-txt-i4', type: 'rows', kind: 'conceptual',
    prompt: 'A format check uses the pattern <code>^\\d{5}$</code>. Which of these values does it accept? Rows are numbered from 0; ␣ is a space.',
    data: { table: {
      head: ['Value'],
      rows: [['02134'], ['2134'], ['02134-1234'], ['␣02134'], ['O2134 (begins with the letter O)'], ['12345'], ['123456']],
    } },
    answer: [0, 5],
    solution: '^ and $ anchor the pattern to the whole value, and \\d{5} needs exactly five digits. It accepts 02134 and 12345. It rejects 2134 (four digits), 02134-1234 (extra characters), ␣02134 (a leading space), O2134 (a letter, not a zero) and 123456 (six digits).',
  },
  {
    id: 'b02-txt-i5', type: 'classify', kind: 'applied',
    prompt: 'Northfield University’s official programme list is the controlled vocabulary for the <code>programme</code> column. Map each raw value (fictional).',
    items: ['Bus. Admin.', 'CS', 'Pyschology', 'Econ.', 'Mech. Eng.', 'NURSING', 'Psych'],
    categories: ['Business Administration', 'Computer Science', 'Economics', 'Nursing', 'Psychology', 'Mechanical Engineering'],
    answer: [0, 1, 4, 2, 5, 3, 4],
    feedback: {
      1: 'An acronym is a variant like any other. It is unambiguous here because only one programme has these initials; confirm that once and record it in the mapping table.',
      2: 'Two letters are swapped: an edit distance of 2 from Psychology.',
    },
    solution: 'Bus. Admin. → Business Administration; CS → Computer Science; Pyschology → Psychology; Econ. → Economics; Mech. Eng. → Mechanical Engineering; NURSING → Nursing; Psych → Psychology.',
  },
  {
    id: 'b02-txt-i6', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these belong in a well-run mapping table for a category column? Select all that apply.',
    options: [
      'The variant as it appears after normalisation',
      'The value from the controlled vocabulary it maps to',
      'A note on why, or who confirmed it',
      'A version number or date for each change',
      'The cleaned value written over the raw value in the original file',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'The mapping table sits beside the data; it never replaces the raw values. Overwriting them makes every decision impossible to check or undo.',
    },
    solution: 'A mapping table holds the variant, the value it becomes, the reason or approval, and a version, so that it can be reviewed and rerun. The raw values stay unchanged in their own column.',
  },
];

export const check = [
  {
    id: 'b02-txt-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why should whitespace and case be normalised <i>before</i> a mapping table is applied?',
    options: [
      'So that the table needs one row per genuine variant, not one per combination of spacing and capitals.',
      'Because mapping tables can only contain lower-case values with no spaces at either end.',
      'Because normalising afterwards would undo the mapping.',
      'So that the cleaned values keep their original capitals, which a mapping table would otherwise overwrite.',
    ],
    answer: 0,
    feedback: {
      1: 'A mapping table can hold any text. The point is how many rows it needs, and how easily one is missed.',
      2: 'Normalising the clean values afterwards wouldn’t undo anything; it would just be in the wrong place to help the matching.',
      3: 'The display value comes from the controlled vocabulary (“North”), not from the raw capitals.',
    },
    solution: 'If you map first, “North”, “north”, “North␣”, “NORTH” and “␣north” each need a row, and any combination you miss slips through. Normalising first reduces them all to “north”, so the table needs only the genuine variants, such as “n” and “nrth”.',
  },
  {
    id: 'b02-txt-k2', type: 'num', kind: 'numerical',
    prompt: 'Orders by raw region value for the East variants (fictional): East 50, east 3, E. 2, East␣ 1, Eats 1. How many orders does East have after consolidation?',
    answer: 57, check: () => 50 + 3 + 2 + 1 + 1, unit: 'orders', places: 0, tol: 0,
    wrong: [
      { value: 50, say: 'That counts the exact spelling only.' },
      { value: 56, say: '“Eats” is a typing error for East (two letters swapped). Include it once the mapping is confirmed.' },
    ],
    solution: 'All five values map to East: 50 + 3 + 2 + 1 + 1 = 57 orders.',
  },
  {
    id: 'b02-txt-k3', type: 'rows', kind: 'applied',
    prompt: 'After applying Excel’s TRIM to each value below, which values would still differ from the text “North” in an exact, case-sensitive comparison? Rows are numbered from 0; ␣ is an ordinary space and ⍽ a non-breaking space.',
    data: { table: {
      head: ['Raw value'],
      rows: [['North␣'], ['␣␣North'], ['North⍽'], ['⍽North'], ['North'], ['north␣']],
    } },
    answer: [2, 3, 5],
    solution: 'TRIM removes the ordinary spaces in rows 0 and 1, which then equal “North”, and row 4 is already equal. It doesn’t remove the non-breaking spaces in rows 2 and 3, and it doesn’t change case, so row 5 becomes “north”. Replace character 160 with an ordinary space before TRIM, and normalise case, to fix all three.',
  },
  {
    id: 'b02-txt-k4', type: 'mc', kind: 'conceptual',
    prompt: 'An online form checks email addresses with the pattern <code>^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$</code>. Which statement is true?',
    options: [
      'It rejects some obvious errors, such as a missing @ or a space, but accepts addresses such as maya@example..com that no server will deliver to.',
      'It guarantees that every accepted address can receive email.',
      'It accepts every address allowed by the formal email syntax.',
      'It rejects maya.okafor@example.com, because the address contains a dot before the @.',
    ],
    answer: 0,
    feedback: {
      1: 'A pattern checks only the shape of the text. Whether a mailbox exists can be proved only by sending a message to it.',
      2: 'The formal syntax (RFC 5322) allows forms, such as quoted names containing spaces, that this pattern rejects.',
      3: '[^@\\s]+ allows dots; it excludes only @ and whitespace. maya.okafor@example.com is accepted.',
    },
    solution: 'The pattern requires a run without @ or spaces, an @, another such run, a dot and a final run. That catches missing @ signs and spaces, but “maya@example..com” fits the shape. Use a pattern to catch typing errors and a confirmation email to prove an address works.',
  },
  {
    id: 'b02-txt-k5', type: 'num', kind: 'numerical',
    prompt: 'South’s orders by raw spelling (fictional): South, 60 orders averaging $27.00; south, 20 orders averaging $31.00. What is South’s mean order value after consolidation?',
    answer: 28, check: () => (60 * 27 + 20 * 31) / (60 + 20), unit: '$', places: 2, tol: 0.005,
    wrong: [
      { value: 29, say: 'That is the simple average of the two means. The 60 correctly spelled orders count three times as much as the 20 others.' },
      { value: 27, say: 'That is the exact spelling only.' },
    ],
    solution: '(60 × 27 + 20 × 31) ÷ (60 + 20) = (1,620 + 620) ÷ 80 = 2,240 ÷ 80 = $28.00.',
  },
  {
    id: 'b02-txt-k6', type: 'classify', kind: 'applied',
    prompt: 'Harborview’s data dictionary says <code>country</code> holds full English country names. Map each raw value from the booking feed.',
    items: ['USA', 'U.S.', 'GB', 'UK', 'DE', 'CA', 'United States␣'],
    categories: ['United States', 'United Kingdom', 'Germany', 'Canada', 'Flag for review'],
    answer: [0, 0, 1, 1, 2, 3, 0],
    feedback: {
      2: 'GB is the ISO 3166 two-letter code for the United Kingdom.',
      5: 'In a country column, CA is the two-letter code for Canada. (In a column of US states it would mean California: context decides.)',
      6: 'A trailing space is removed by trimming; the value is then exactly “United States”.',
    },
    solution: 'USA, U.S. and “United States␣” (after trimming) → United States; GB and UK → United Kingdom; DE → Germany; CA → Canada.',
  },
];
