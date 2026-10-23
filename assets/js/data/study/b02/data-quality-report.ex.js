// data-quality-report.ex.js — B02 · Data quality reporting and a reproducible workflow: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// Businesses and figures in the exercises are fictional.

const pct = (x) => `${x.toFixed(1)}%`;

export const widgets = {
  'dq-lab': {
    type: 'cleaning',
    dataset: 'lantern-orders',
    ops: ['dedupe', 'dedupe-key', 'trim', 'case', 'map', 'to-number', 'to-date', 'fill', 'drop-missing', 'flag-missing', 'validate', 'outliers', 'transform', 'scale', 'encode', 'derive', 'rename', 'drop-column'],
    watch: ['order_id', 'order_date', 'email', 'region', 'product', 'quantity', 'unit_price', 'order_total', 'rating'],
    task: 'Take the raw export to analysis-ready data. Start by profiling it and writing validation rules; then fix records and formats, decide about missing and unusual values, derive what the analysis needs, and drop <code>email</code> once it has done its job. For every step, write one line of rationale. Finish by exporting the cleaning log and the before-and-after profile, and draft the report’s issues-and-decisions, effect and limitations sections from them.',
  },
  'dq-profile': {
    type: 'formula',
    title: 'Missing values before and after removing rows',
    intro: 'Cleaning removes some rows (duplicates, out-of-scope records). Some of the removed rows had a missing value in the column you are profiling.',
    inputs: [
      { id: 'rows', label: 'Rows before cleaning', min: 100, max: 10000, step: 100, value: 2400, fmt: 'int', unit: 'rows' },
      { id: 'miss', label: 'Missing values before cleaning', min: 0, max: 3000, step: 10, value: 360, fmt: 'int', unit: 'values' },
      { id: 'removed', label: 'Rows removed by cleaning', min: 0, max: 2000, step: 10, value: 150, fmt: 'int', unit: 'rows' },
      { id: 'missRemoved', label: 'Missing values among the removed rows', min: 0, max: 500, step: 1, value: 20, fmt: 'int', unit: 'values' },
    ],
    compute: (v) => {
      if (v.miss > v.rows) return { error: 'A column can’t have more missing values than there are rows.' };
      if (v.removed >= v.rows) return { error: 'Cleaning must leave at least one row.' };
      if (v.missRemoved > v.removed || v.missRemoved > v.miss) return { error: 'The removed rows can’t hold more missing values than there are removed rows, or than there were missing values.' };
      const rowsAfter = v.rows - v.removed;
      const missAfter = v.miss - v.missRemoved;
      const before = (100 * v.miss) / v.rows;
      const after = (100 * missAfter) / rowsAfter;
      const pp = after - before;
      const rel = v.miss ? (100 * (missAfter - v.miss)) / v.miss : 0;
      const direction = Math.abs(pp) < 0.05 ? 'barely moved' : pp > 0 ? 'rose' : 'fell';
      return {
        headline: { label: 'Missing share after cleaning', value: `${pct(after)} (was ${pct(before)})` },
        rows: [
          ['Rows after cleaning', `${rowsAfter} (${pct((100 * rowsAfter) / v.rows)} retained)`],
          ['Missing values after cleaning', `${missAfter}`],
          ['Change in the share', `${pp >= 0 ? '+' : '−'}${Math.abs(pp).toFixed(1)} percentage points`],
          ['Relative change in the count of missing values', `${rel >= 0 ? '+' : '−'}${Math.abs(rel).toFixed(1)}%`],
        ],
        note: `The share ${direction} although ${v.missRemoved} missing values went out with the removed rows, because the denominator changed too. Report the count and the rows behind each share, and describe the change in percentage points.`,
        chart: { kind: 'bar', x: { label: 'Profile', values: ['Before', 'After'] }, series: [{ name: 'Missing share (%)', values: [Math.round(before * 10) / 10, Math.round(after * 10) / 10] }], y: { label: 'Missing (%)' } },
      };
    },
  },
};

const SECTIONS = ['Source', 'Data dictionary', 'Issues and decisions', 'Effect on the analysis', 'Limitations', 'Cleaning log'];

export const guided = [
  {
    id: 'b02-dq-g1', type: 'order', kind: 'applied',
    prompt: 'Put these stages of a reproducible cleaning workflow in order.',
    items: [
      'Save the export exactly as received, make it read-only, and record its source and extraction date.',
      'Profile the raw data and write validation rules.',
      'Run the cleaning steps from a script or recorded recipe, logging the row count after each step.',
      'Profile the cleaned data and compare it with the raw profile.',
      'Write the report: issues, decisions and rationale, effects and limitations.',
      'Delete the outputs, rerun everything from the raw file, confirm identical results, and version the report.',
    ],
    hints: ['Nothing can be checked later unless the original is protected first.', 'You can’t write the report until you can compare the before and after profiles, and you can’t call it final until a rerun reproduces it.'],
    solution: 'Protect the raw file first, because everything is rebuilt from it. Profiling and rules come before cleaning, because they show what needs fixing and give the “before” measures. The steps run as a recorded recipe, then the cleaned data are profiled for the “after” measures. The report draws on both profiles and the log. Finally a rerun from raw proves the result is reproducible, and only then is the report versioned and released.',
  },
  {
    id: 'b02-dq-g2', type: 'classify', kind: 'conceptual',
    prompt: 'Lantern’s data quality report is being assembled. Choose the section each statement belongs in.',
    items: [
      'Downloaded from the shop platform on 3 July 2026 by J. Park; 14 columns.',
      '<code>discount</code>: discount on the whole order, in US dollars, 0 or more.',
      'Repeated order ids with changed values: kept the copy the shop system confirms, because the other copy’s quantity was edited after the sale.',
      'Ratings were analysed only where present; because one-off buyers rate less often, the average rating mainly reflects subscribers.',
      'Some missing e-mail addresses can’t be recovered from the file, so repeat purchases can’t be traced for those customers.',
      'Step 4: trimmed spaces and standardised case in <code>region</code>; row count unchanged.',
    ],
    categories: SECTIONS,
    answer: [0, 1, 2, 3, 4, 5],
    hints: ['Effect on the analysis describes consequences of a decision you made; limitations describe problems you couldn’t solve.', 'A numbered step with its row count belongs in the log; a definition of a variable belongs in the dictionary.'],
    feedback: {
      2: 'This states an issue, the decision and its reason: an issues-and-decisions entry.',
      3: 'It follows from a decision (analyse ratings only where present) and says what that does to the result: effect on the analysis.',
      4: 'Nothing in the file can fix it: a limitation, not the effect of a choice.',
    },
    solution: 'Source: where and when the file came from. Data dictionary: the definition of a variable. Issues and decisions: the duplicate-id entry with its rationale. Effect on the analysis: the consequence of analysing only the ratings that exist. Limitations: the unrecoverable e-mails. Cleaning log: the numbered step with its row count.',
  },
  {
    id: 'b02-dq-g3', type: 'num', kind: 'numerical',
    prompt: 'Pinecrest Outdoor, a fictional online retailer, exports 5,000 orders; 400 have no postcode (8.0%). Cleaning removes 250 duplicate rows, which include 50 of the missing postcodes. What percentage of postcodes is missing after cleaning?',
    answer: 7.37, check: () => (400 - 50) / (5000 - 250) * 100, unit: '%', places: 2, tol: 0.01,
    hints: ['Work out the new count of missing postcodes and the new number of rows separately.', 'Missing after = 400 − 50; rows after = 5,000 − 250.'],
    wrong: [
      { value: 7, say: 'You used the old number of rows. After cleaning there are 4,750 rows, so divide 350 by 4,750.' },
      { value: 8, say: 'The share changes: 50 missing postcodes left with the duplicates, and the row count fell too.' },
      { value: 8.42, say: 'You divided the original 400 missing values by the new row count. Remove the 50 that went with the duplicates as well.' },
    ],
    solution: 'Missing after = 400 − 50 = 350; rows after = 5,000 − 250 = 4,750. Share = 350 ÷ 4,750 × 100 ≈ 7.37%, a fall of about 0.63 percentage points from 8.0%.',
  },
  {
    id: 'b02-dq-g4', type: 'short', kind: 'applied',
    prompt: 'Harborview’s booking export has blank values in <code>children</code>. You find that every blank is on a booking from the online travel agency (OTA) made before October 2025, and the hotel’s data dictionary says that feed left zero children blank until then. Write the issues-and-decisions entry for this problem (four to six sentences).',
    hints: ['Use the five parts: evidence, scale, decision, rationale, alternatives.', 'Say how you would show the reader that the rule applies only where the documentation says it does.'],
    rubric: [
      'States the evidence: where the blanks occur (OTA bookings before October 2025) and how this was found.',
      'States the scale: how many bookings are affected, or that the entry lists them.',
      'States the decision precisely: fill those blanks with 0 (ideally with a flag), and only those.',
      'Gives the rationale: the documentation says blank means 0 for that feed and period, and the pattern of blanks matches it.',
      'Names an alternative (treat as missing, or impute) and what it would do to the analysis, such as dropping those bookings from guest counts.',
    ],
    model: '<b>Issue:</b> <code>children</code> is blank on some bookings. <b>Evidence and scale:</b> a completeness check found the blanks; every one is on an OTA booking made before October 2025, and the entry lists the bookings affected. <b>Decision:</b> set those blanks to 0 and add a flag column; any blank outside that feed and period would stay missing. <b>Rationale:</b> the hotel’s data dictionary states that the OTA feed left zero children blank until October 2025, and the blanks match that pattern exactly, so they are known zeros, not unknown values. <b>Alternative:</b> treating them as missing would drop these bookings from any analysis of guests per room and make OTA bookings look as if they never include children.',
    solution: 'A strong entry gives the evidence (pattern plus documentation), the scale, a precise decision limited to the documented case, the rationale, and the rejected alternative with its effect.',
  },
];

export const independent = [
  {
    id: 'b02-dq-i1', type: 'mc', kind: 'applied',
    prompt: 'While cleaning a customer survey scored 1 to 5, an analyst notices that removing the 1-star ratings as “outliers” would raise the average from 4.1 to 4.4. What should the report do?',
    options: [
      'Keep the 1-star ratings, since they are valid values on the scale, and report 4.1.',
      'Remove them and report 4.4, noting that outliers were removed.',
      'Report 4.4 in the summary and mention 4.1 in an appendix.',
      'Keep them but report the median instead, without mentioning the mean.',
    ],
    answer: 0,
    feedback: {
      1: 'A 1 on a 1-to-5 scale is a possible, valid answer. Disclosing a removal doesn’t make an unjustified removal acceptable.',
      2: 'Putting the convenient figure up front and the honest one out of sight misleads the readers who stop at the summary.',
      3: 'Reporting a median can be useful, but switching statistics to avoid an unwelcome mean, without saying so, is still selective reporting.',
    },
    solution: 'Values can be changed or excluded only on evidence that they are wrong or out of scope. A 1-star rating is neither: it is an unhappy customer. The report gives 4.1, with the distribution if it helps, and the low ratings are useful information for the business.',
  },
  {
    id: 'b02-dq-i2', type: 'num', kind: 'numerical',
    prompt: 'Cleaning reduces the share of orders with no e-mail address from 8.0% to 5.0%. By what percentage did the share fall (the relative change)?',
    answer: 37.5, check: () => (8.0 - 5.0) / 8.0 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 3, say: 'That is the fall in percentage points. The relative change divides that fall by the starting share: 3 ÷ 8.' }],
    solution: 'The share fell by 8.0 − 5.0 = 3 percentage points. Relative to its starting value that is 3 ÷ 8.0 × 100 = 37.5%. A report should say which one it means: “down 3 percentage points (a 37.5% relative fall)”.',
  },
  {
    id: 'b02-dq-i3', type: 'rows', kind: 'applied',
    prompt: 'An analyst’s cleaning log for a fictional sales export is below. Select every entry that breaks reproducibility or lineage.',
    data: { table: {
      head: ['Step', 'Log entry'],
      rows: [
        ['1', 'Read the raw export from the read-only folder; recorded its checksum.'],
        ['2', 'Removed exact duplicate rows (script, step 2).'],
        ['3', 'Fixed a few odd dates by hand in the spreadsheet.'],
        ['4', 'Mapped region spellings with mapping table version 2.'],
        ['5', 'Deleted rows that looked wrong.'],
        ['6', 'Saved the cleaned data over the raw export to keep things tidy.'],
        ['7', 'Flagged orders whose total disagrees with quantity × price − discount.'],
      ],
    } },
    answer: [2, 4, 5],
    solution: 'Step 3 is a hand edit with no rule and no list of changes, so it can’t be rerun or checked. Step 5 gives no rule, so nobody can tell which rows went or why. Step 6 destroys the raw data, so nothing can ever be rebuilt or traced back. Steps 1, 2, 4 and 7 are recorded, rule-based and repeatable.',
  },
  {
    id: 'b02-dq-i4', type: 'short', kind: 'applied',
    prompt: 'Harborview’s monthly report excludes cancelled and no-show bookings from its average daily rate. Write the “effect on the analysis” entry for this decision (three to five sentences).',
    rubric: [
      'States what was excluded and how many bookings, or that the counts are given.',
      'Says what the figure therefore describes (stays that happened, room nights actually sold).',
      'Considers whether the exclusion could bias the figure, for example if cancellations are more common in some channels, seasons or room types.',
      'Says what the reader should not use the figure for, or points to where the excluded bookings are reported.',
    ],
    model: 'The average daily rate covers completed stays only: the cancelled and no-show bookings in the month (counts in the profile section) are excluded, so the figure is room revenue per room night actually sold. Because cancellations are more common on some channels and in some seasons, the excluded bookings are not a random sample of all bookings, and the rate of booked business may differ from the rate of stays. The figure should therefore not be read as the average price of all bookings taken; cancelled and no-show revenue is reported separately in the channel table.',
    solution: 'A good entry says what was removed, what the remaining figure measures, whether the removed rows differ from the rest, and how the reader should and shouldn’t use the result.',
  },
  {
    id: 'b02-dq-i5', type: 'num', kind: 'numerical',
    prompt: 'Skylark Air, a fictional airline, surveys 1,200 economy and 300 business passengers. Complete answers come from 720 economy and 255 business passengers. What percentage of the complete answers come from business passengers?',
    answer: 26.2, check: () => 255 / (720 + 255) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 20, say: 'That is business passengers’ share of everyone surveyed (300 ÷ 1,500). The question asks about the complete answers.' },
      { value: 85, say: 'That is the business response rate (255 ÷ 300). Divide business answers by all complete answers.' },
    ],
    solution: 'Complete answers = 720 + 255 = 975; business share = 255 ÷ 975 × 100 ≈ 26.2%, against 20% of passengers surveyed. Business passengers answered far more often (85% against 60%), so an unweighted average of the answers leans towards their views, and the report should say so.',
  },
  {
    id: 'b02-dq-i6', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s analysis needs to count repeat customers. E-mail addresses were used during cleaning to recover missing customer numbers. What should the analysis file shared with the investor’s analyst contain?',
    options: [
      '<code>customer_id</code> but not <code>email</code>',
      'Both <code>customer_id</code> and <code>email</code>, so that the investor can check the matching',
      'Neither, to be safe',
      '<code>email</code> only, because it identifies customers more reliably',
    ],
    answer: 0,
    feedback: {
      1: 'Checking the matching doesn’t require sharing personal data: the report can describe the method and the counts. Sending e-mails goes beyond what the purpose needs.',
      2: 'Without any customer key, repeat customers can’t be counted, and that is the purpose of the analysis.',
      3: 'E-mail addresses are personal data; once they have done their job in cleaning, a pseudonymised key does the same work.',
    },
    solution: 'Data minimisation: keep only what the purpose needs. The purpose needs a stable customer key, which <code>customer_id</code> provides without identifying anyone directly. The e-mail addresses stay in the access-restricted raw file, and the report explains how they were used.',
  },
];

export const check = [
  {
    id: 'b02-dq-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which situation shows that a cleaning workflow is reproducible?',
    options: [
      'A colleague deletes the cleaned files, reruns the recorded steps on the raw export and gets identical outputs.',
      'The cleaned file has no missing values and passes every validation rule.',
      'The analyst can describe from memory every change made to the data.',
      'The same cleaning steps run on next month’s export give similar averages.',
    ],
    answer: 0,
    feedback: {
      1: 'Passing the rules says the output looks clean, not that anyone could produce it again.',
      2: 'Memory isn’t a record: nobody else can rerun it, and it fades.',
      3: 'Same steps on new data is closer to replication. Reproducibility means the same data and steps give the same result.',
    },
    solution: 'Reproducibility means that the same steps on the same data give the same result every time. The proof is a rerun from the raw file by someone else, producing identical outputs.',
  },
  {
    id: 'b02-dq-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional university’s enrolment export has 3,200 rows. Cleaning removes 96 duplicate rows and 64 rows for students outside the reporting year. What percentage of rows is retained?',
    answer: 95, check: () => (3200 - 96 - 64) / 3200 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 5, say: 'That is the share removed. The question asks for the share retained.' },
      { value: 97, say: 'You subtracted only the duplicates. The out-of-scope rows are removed too.' },
    ],
    solution: 'Rows after = 3,200 − 96 − 64 = 3,040; retained = 3,040 ÷ 3,200 × 100 = 95.0%. The report gives the 160 removed rows by reason: 96 duplicates and 64 out of scope.',
  },
  {
    id: 'b02-dq-k3', type: 'classify', kind: 'conceptual',
    prompt: 'Choose the report section each statement belongs in.',
    items: [
      '<code>rate</code>: nightly room rate in US dollars, $100 to $500.',
      'Version 1.2: April bookings added; country mapping table updated.',
      'Ambiguous slash dates were read day first, the convention followed by the unambiguous dates in the same format.',
      'Ten bookings with check-out before check-in: check-out reset to check-in + nights, because total ÷ rate agrees with the stored nights.',
    ],
    categories: ['Data dictionary', 'Version and history', 'Assumptions', 'Issues and decisions', 'Limitations'],
    answer: [0, 1, 2, 3],
    feedback: {
      2: 'The reading is believed, on evidence, but not proved: that makes it an assumption, which the reader needs to see.',
      3: 'It names the issue, the decision and the evidence for it: an issues-and-decisions entry.',
    },
    solution: 'Variable definitions go in the dictionary; the version line in the history; an unproved but reasoned belief about the data in assumptions; a problem with its decision and evidence in issues and decisions.',
  },
  {
    id: 'b02-dq-k4', type: 'order', kind: 'applied',
    prompt: 'Put the stages of Lantern’s end-to-end cleaning in order.',
    items: [
      'Freeze the raw export and record where it came from.',
      'Describe the unit of observation, the key and the variables.',
      'Profile the data and write validation rules.',
      'Fix records and formats: duplicates, types, dates and text.',
      'Decide about missing values and outliers.',
      'Derive, aggregate and join what the analysis needs.',
      'Profile again, write the report and rerun from raw to confirm.',
    ],
    solution: 'Protect the source; understand what a row is; measure the problems; fix structural problems (records and formats) before judging values, because a missing or extreme value can’t be assessed while dates and prices are still text; prepare the analysis tables from clean values; then document and prove reproducibility.',
  },
  {
    id: 'b02-dq-k5', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s regional comparison depends on one decision: if a contested batch of orders is kept, the North region leads; if it is excluded, the West leads. The evidence for excluding the batch is suggestive but not conclusive. What should the report do?',
    options: [
      'Show both results, explain the evidence for and against excluding the batch, and say which is preferred and why.',
      'Report whichever result is preferred and leave the other out to avoid confusing readers.',
      'Report the result that matches what the sales team expected.',
      'Drop the regional comparison from the report without explanation.',
    ],
    answer: 0,
    feedback: {
      1: 'Hiding a decision that changes the conclusion takes the judgement away from the reader, who can’t then weigh the risk.',
      2: 'Choosing by the expected answer is the definition of cleaning towards a conclusion.',
      3: 'Silently dropping it hides useful information; if the comparison is withheld, the report should say why.',
    },
    solution: 'When a contested decision changes the conclusion, the honest report shows the result both ways (a sensitivity check), sets out the evidence, and states its preferred version with reasons. Readers can then see how fragile the conclusion is.',
  },
  {
    id: 'b02-dq-k6', type: 'num', kind: 'numerical',
    prompt: 'A fictional clothing brand asks customers to rate their purchase. Online: 600 customers, 300 ratings averaging 4.2. In store: 400 customers, 80 ratings averaging 3.6. Weighting each channel by its number of customers, what is the adjusted average rating?',
    answer: 3.96, check: () => (600 * 4.2 + 400 * 3.6) / (600 + 400), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 4.07, say: 'That is the unadjusted average of the ratings that exist, (300 × 4.2 + 80 × 3.6) ÷ 380, which over-represents online customers. Weight by customers instead.' },
      { value: 3.9, say: 'That is the plain average of the two channel averages. Weight each by its number of customers: 600 and 400.' },
    ],
    solution: 'Adjusted average = (600 × 4.2 + 400 × 3.6) ÷ 1,000 = (2,520 + 1,440) ÷ 1,000 = 3.96. The unadjusted figure, 1,548 ÷ 380 ≈ 4.07, leans towards online customers, who rate more often (50% against 20%) and more highly. The adjustment assumes that raters in each channel are like the non-raters in that channel, and the report should say so.',
  },
];
