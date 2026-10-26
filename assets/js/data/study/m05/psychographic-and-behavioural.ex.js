// psychographic-and-behavioural.ex.js — M05 · Psychographic and behavioural segmentation: widgets, practice and the
// knowledge check (answer keys live here). Lantern's 640 respondents come from case.js (RESPONDENTS, LEVELS): cups a week,
// monthly spend, main source and the three local-loyalty items. Glisten Car Wash, the bus operator, the sportswear brand,
// the snack brand, Ashbury Bank and the other businesses named here are fictional. Every num item's `check` recomputes
// its answer.
import { RESPONDENTS, LEVELS } from './case.js?v=18';

const R = RESPONDENTS, N = R.length, L = N + 1;                 // data rows 2..641
const sum = (a) => a.reduce((s, x) => s + x, 0);
const int = (v) => Math.round(v).toLocaleString('en-US');
const p1 = (v) => `${(+(v * 100).toPrecision(12)).toFixed(1)}%`;   // toPrecision first, so 28.75 rounds to 28.8
const SRC = LEVELS.source;

// ---------------------------------------------------------------- widgets
const curve = (key) => {
  const s = [...R].sort((a, b) => b[key] - a[key]), tot = sum(R.map((r) => r[key]));
  return [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((q) => Math.round((sum(s.slice(0, Math.round((N * q) / 100)).map((r) => r[key])) / tot) * 1000) / 10);
};
const HEAVY = R.filter((r) => r.cups >= 16), BIG = R.filter((r) => r.spend >= 70);
const overlap = HEAVY.filter((r) => r.spend >= 70).length;
const sheetCells = (() => {
  const cells = { A1: 'respondent', B1: 'cups_week', C1: 'spend_month', D1: 'main_source', E1: 'loyal_1', F1: 'loyal_2', G1: 'loyal_3', H1: 'loyalty score', I1: 'heavy cut-off (cups)', J1: 16, I2: 'share of cups from heavy users', I3: 'share of respondents who are heavy', I4: 'share of spend from heavy users', I6: 'loyalty cut-off', J6: 11 / 3, I7: 'highly loyal respondents', I8: 'of whom mainly café' };
  R.forEach((r, i) => { const k = i + 2; Object.assign(cells, { [`A${k}`]: r.id, [`B${k}`]: r.cups, [`C${k}`]: r.spend, [`D${k}`]: SRC[r.source], [`E${k}`]: r.loyal[0], [`F${k}`]: r.loyal[1], [`G${k}`]: r.loyal[2] }); });
  return cells;
})();

export const widgets = {
  'pb-curve': {
    type: 'chart', kind: 'bar', title: 'How concentrated are cups and spending? The heaviest respondents’ cumulative share',
    x: { label: 'Heaviest respondents counted', values: ['Top 10%', 'Top 20%', 'Top 30%', 'Top 40%', 'Top 50%'] },
    series: [
      { name: 'Share of cups (ranked by cups)', values: curve('cups').slice(1, 6) },
      { name: 'Share of spend (ranked by spend)', values: curve('spend').slice(1, 6) },
      { name: 'Equal shares', values: [10, 20, 30, 40, 50] },
    ],
    y: { label: 'Cumulative share (%)', format: 'pct' },
    note: `The top 20% of respondents by cups drink ${curve('cups')[2]}% of the cups, and the top 20% by spend account for ${curve('spend')[2]}% of spending, against 80% under the 80/20 rule. Each series ranks respondents by its own measure, and the two top groups are mostly different people: only ${overlap} of the ${HEAVY.length} who drink 16 or more cups a week are among the ${BIG.length} who spend $70 or more a month. If everyone drank or spent the same, each bar would equal its share of respondents.`,
  },
  'pb-sheet': {
    type: 'sheet', title: 'Lantern’s needs study: usage, spend and local loyalty (640 respondents)',
    sheet: { cells: sheetCells },
    view: `A1:J${L}`, editable: true, mark: ['H2:H641', 'J2:J4', 'J7:J8'], maxHeight: '26rem',
    formats: { C: '$#,##0', H: '0.00', J2: '0.0%', J3: '0.0%', J4: '0.0%', J6: '0.00', J8: '0.0%' },
    widths: { A: 11, B: 10, C: 11, D: 18, E: 8, F: 8, G: 8, H: 12, I: 30, J: 9 },
    tools: ['formulas', 'fill', 'reset'],
    note: 'Columns: B cups a week, C monthly spend, D main source, E:G the three local-loyalty items (1 strongly disagree … 5 strongly agree). Try <x>=SUMIFS(B2:B641,B2:B641,">="&J1)/SUM(B2:B641)</x> in J2, then the same idea for respondents (COUNTIF ÷ COUNT) in J3 and for spend in J4 (<x>=SUMIFS(C2:C641,B2:B641,">="&J1)/SUM(C2:C641)</x>). Build the loyalty score with <x>=AVERAGE(E2:G2)</x> in H2 and fill it down; J6 holds 11 ÷ 3, a score of 11 out of 15. Then count the highly loyal in J7 and the share of them who mainly use cafés in J8.',
  },
};

// ---------------------------------------------------------------- guided practice
const cupsSheet = (() => {
  const cells = { A1: 'respondent', B1: 'cups_week', D1: 'heavy cut-off (cups a week)', E1: 16, D2: 'share of cups from heavy users', D3: 'share of respondents who are heavy' };
  R.forEach((r, i) => { cells[`A${i + 2}`] = r.id; cells[`B${i + 2}`] = r.cups; });
  return cells;
})();
const heavy = (t) => R.filter((r) => r.cups >= t);
const heavyCupShare = (t) => sum(heavy(t).map((r) => r.cups)) / sum(R.map((r) => r.cups));
const loyalCells = (() => {
  const cells = { A1: 'respondent', B1: 'main_source', C1: 'loyal_1', D1: 'loyal_2', E1: 'loyal_3', F1: 'loyalty score', H1: 'loyalty cut-off', I1: 4, H2: 'share of the highly loyal who mainly use cafés' };
  R.forEach((r, i) => { const k = i + 2; Object.assign(cells, { [`A${k}`]: r.id, [`B${k}`]: SRC[r.source], [`C${k}`]: r.loyal[0], [`D${k}`]: r.loyal[1], [`E${k}`]: r.loyal[2] }); });
  return cells;
})();
const withScores = { ...loyalCells, ...Object.fromEntries(R.map((_, i) => [`F${i + 2}`, `=AVERAGE(C${i + 2}:E${i + 2})`])) };
const score = R.map((r) => sum(r.loyal) / 3);
const cafeShareAt = (t) => { const g = R.filter((_, i) => score[i] >= t - 1e-9); return g.filter((r) => r.source === 0).length / g.length; };

export const guided = [
  {
    id: 'm05-pb-g1', type: 'steps', kind: 'applied',
    prompt: 'Test the 80/20 claim on Lantern’s heavy coffee drinkers. Column B holds each respondent’s cups a week, and E1 the smallest number of cups that counts as heavy (16).',
    solution: `<x>=SUMIFS(B2:B641,B2:B641,">="&E1)/SUM(B2:B641)</x> gives ${p1(heavyCupShare(16))} of cups, and <x>=COUNTIF(B2:B641,">="&E1)/COUNT(B2:B641)</x> gives ${p1(heavy(16).length / N)} of respondents. About a fifth of drinkers account for under half the cups: concentrated, but not 80/20.`,
    steps: [
      {
        id: 'm05-pb-g1-s1', type: 'formula',
        prompt: 'In E2, calculate the share of all cups drunk by respondents at or above the cut-off in E1, so that it updates when E1 changes.',
        sheet: { cells: cupsSheet, vary: { E1: [12, 20] } },
        cell: 'E2', answer: `=SUMIFS(B2:B${L},B2:B${L},">="&E1)/SUM(B2:B${L})`,
        alt: [`=SUMIF(B2:B${L},">="&E1)/SUM(B2:B${L})`, `=SUMPRODUCT((B2:B${L}>=E1)*B2:B${L})/SUM(B2:B${L})`],
        view: `A1:E${L}`, formats: { E2: '0.0%', E3: '0.0%' }, widths: { A: 11, B: 10, D: 32, E: 9 }, maxHeight: '22rem',
        wrong: [
          { formula: `=COUNTIF(B2:B${L},">="&E1)/COUNT(B2:B${L})`, say: 'That is the share of respondents who are heavy, not the share of cups they drink. Sum their cups with SUMIFS and divide by all cups.' },
          { formula: `=SUMIFS(B2:B${L},B2:B${L},">16")/SUM(B2:B${L})`, say: 'With 16 typed in, the formula ignores E1, and “>” leaves out respondents on exactly the cut-off. Use <x>">="&E1</x>.' },
          { formula: `=SUMIFS(B2:B${L},B2:B${L},">="&E1)/COUNT(B2:B${L})`, say: 'Dividing by the number of respondents gives heavy drinkers’ cups per respondent, not a share. Divide by the total cups, SUM(B2:B641).' },
        ],
        hints: ['Share of cups = cups drunk by heavy users ÷ all cups.', '<x>SUMIFS(B2:B641,B2:B641,">="&E1)</x> adds the cups of everyone at or above the cut-off.'],
      },
      {
        id: 'm05-pb-g1-s2', type: 'formula',
        prompt: 'In E3, calculate the share of respondents who are at or above the cut-off in E1.',
        sheet: { cells: { ...cupsSheet, E2: `=SUMIFS(B2:B${L},B2:B${L},">="&E1)/SUM(B2:B${L})` }, vary: { E1: [12, 20] } },
        cell: 'E3', answer: `=COUNTIF(B2:B${L},">="&E1)/COUNT(B2:B${L})`,
        alt: [`=COUNTIFS(B2:B${L},">="&E1)/COUNT(B2:B${L})`, `=COUNTIF(B2:B${L},">="&E1)/COUNTA(B2:B${L})`, `=COUNTIF(B2:B${L},">="&E1)/ROWS(B2:B${L})`],
        view: `A1:E${L}`, formats: { E2: '0.0%', E3: '0.0%' }, widths: { A: 11, B: 10, D: 32, E: 9 }, maxHeight: '22rem',
        wrong: [
          { formula: `=COUNTIF(B2:B${L},">="&E1)`, say: 'That is the number of heavy respondents. Divide by the number of all respondents to get a share.' },
          { formula: `=COUNTIF(B2:B${L},">="&E1)/SUM(B2:B${L})`, say: 'SUM adds the cups. The share of respondents divides by how many respondents there are: COUNT(B2:B641).' },
        ],
        hints: ['Share of respondents = heavy respondents ÷ all respondents.', '<x>COUNTIF(B2:B641,">="&E1)</x> ÷ <x>COUNT(B2:B641)</x>.'],
      },
      {
        id: 'm05-pb-g1-s3', type: 'mc',
        prompt: `With the cut-off at 16 cups, ${p1(heavy(16).length / N)} of respondents drink ${p1(heavyCupShare(16))} of the cups. What follows?`,
        options: [
          'Usage is concentrated, but far from 80/20: lighter drinkers still drink over half the cups',
          'Usage is far from concentrated, but heavy users still matter, since they drink a fifth of the cups',
          'Heavy drinkers are Lantern’s most valuable customers, since they drink almost half the coffee',
          'The cut-off is wrong: it should be moved until heavy users drink 80% of the cups',
        ],
        answer: 0,
        feedback: {
          1: 'A fifth of drinkers drink 45.7% of the cups, more than twice their share of people: usage is concentrated, though far less than 80/20.',
          2: 'Volume isn’t value: in the study heavy drinkers spend about the same per head as light drinkers ($50.34 against $49.25 a month). Spend, and module 2’s profiles, decide value.',
          3: 'Moving the cut-off until the data fit the rule tests nothing. Fix the definition first, then read the share.',
        },
        hints: ['Compare 45.7% with the 80% the rule predicts.', 'What share of cups comes from everyone else?'],
      },
    ],
  },
  {
    id: 'm05-pb-g2', type: 'classify', kind: 'conceptual',
    prompt: 'Is each segmentation base psychographic or behavioural?',
    items: [
      'Whether a customer buys coffee mainly on the way to work or at weekends',
      'Agreement with “I like to try new things before my friends do”',
      'The benefit a customer most wants from a toothpaste: whiter teeth or fewer fillings',
      'How strongly a person values tradition and security',
      'Number of cups bought in the last week',
      'Whether a customer has never bought, bought once or buys the brand regularly',
      'Agreement with “I enjoy being the centre of attention”',
    ],
    categories: ['Psychographic', 'Behavioural'],
    answer: [1, 0, 1, 0, 1, 1, 0],
    feedback: {
      0: 'The occasion of buying: behavioural.',
      1: 'An interest and an opinion about oneself, part of lifestyle: psychographic.',
      2: 'The benefit sought, Haley’s base: behavioural.',
      3: 'Values: psychographic.',
      4: 'Usage rate: behavioural.',
      5: 'User status: behavioural.',
      6: 'A personality trait: psychographic.',
    },
    hints: ['Psychographic: how people live, what they value, what they are like.', 'Behavioural: what they seek and do in this category.'],
    solution: 'Psychographic: the trying-new-things statement (lifestyle), valuing tradition (values) and enjoying attention (personality). Behavioural: buying occasion, benefit sought, cups bought (usage rate) and user status.',
  },
  {
    id: 'm05-pb-g3', type: 'steps', kind: 'applied',
    prompt: 'Columns C to E hold each respondent’s answers to the three local-loyalty items (1–5), and column B where they mostly get their coffee. Build the scale score and use it as a segmentation base.',
    solution: `<x>=AVERAGE(C2:E2)</x> filled down gives each respondent’s score. With a cut-off of 4 in I1, <x>=COUNTIFS(F2:F641,">="&I1,B2:B641,"Café")/COUNTIF(F2:F641,">="&I1)</x> gives ${p1(cafeShareAt(4))}: the highly loyal mainly use cafés far more often than the ${p1(R.filter((r) => r.source === 0).length / N)} of all respondents.`,
    steps: [
      {
        id: 'm05-pb-g3-s1', type: 'formula',
        prompt: 'In F2, calculate the respondent’s loyalty score as the mean of their three item answers, in a formula that can be filled down to F641.',
        sheet: { cells: loyalCells },
        cell: 'F2', fill: `F2:F${L}`, answer: '=AVERAGE(C2:E2)',
        alt: ['=SUM(C2:E2)/3', '=(C2+D2+E2)/3'],
        view: `A1:I${L}`, formats: { F: '0.00', I1: '0.00', I2: '0.0%' }, widths: { A: 11, B: 18, C: 8, D: 8, E: 8, F: 12, H: 40, I: 8 }, maxHeight: '22rem',
        wrong: [
          { formula: '=SUM(C2:E2)', say: 'That is the total, from 3 to 15. The lesson’s score is the mean of the three items, on the same 1–5 scale as each item: divide by 3 or use AVERAGE.' },
          { formula: '=AVERAGE($C$2:$E$2)', say: 'With $ every row averages the first respondent’s answers. Leave the references relative so each row uses its own.' },
          { formula: '=C2+D2+E2/3', say: 'Excel divides before it adds, so only E2 is divided by 3. Add first: (C2+D2+E2)/3, or AVERAGE(C2:E2).' },
        ],
        hints: ['A Likert scale score combines the items, here by averaging them.', '<x>=AVERAGE(C2:E2)</x>, filled down.'],
      },
      {
        id: 'm05-pb-g3-s2', type: 'formula',
        prompt: 'Every score is now in column F. In I2, calculate the share of respondents scoring at or above the cut-off in I1 who mainly get their coffee from a café, so that it updates when I1 changes.',
        sheet: { cells: withScores, vary: { I1: [3, 4.5] } },
        cell: 'I2', answer: `=COUNTIFS(F2:F${L},">="&I1,B2:B${L},"Café")/COUNTIF(F2:F${L},">="&I1)`,
        alt: [`=COUNTIFS(B2:B${L},"Café",F2:F${L},">="&I1)/COUNTIF(F2:F${L},">="&I1)`, `=COUNTIFS(F2:F${L},">="&I1,B2:B${L},"Café")/COUNTIFS(F2:F${L},">="&I1)`],
        view: `A1:I${L}`, formats: { F: '0.00', I1: '0.00', I2: '0.0%' }, widths: { A: 11, B: 18, C: 8, D: 8, E: 8, F: 12, H: 40, I: 8 }, maxHeight: '22rem',
        wrong: [
          { formula: `=COUNTIFS(F2:F${L},">="&I1,B2:B${L},"Café")/COUNT(F2:F${L})`, say: 'That divides by all 640 respondents: highly loyal café buyers as a share of everyone. The question asks for a share of the highly loyal, so divide by their number.' },
          { formula: `=COUNTIFS(F2:F${L},">="&I1,B2:B${L},"Café")/COUNTIF(B2:B${L},"Café")`, say: 'That is the share of café buyers who are highly loyal, the other direction. Percentage within the loyalty group: divide by how many score at or above the cut-off.' },
          { formula: `=COUNTIFS(F2:F${L},">"&I1,B2:B${L},"Café")/COUNTIF(F2:F${L},">"&I1)`, say: '“>” leaves out respondents exactly on the cut-off. “At or above” is >=.' },
        ],
        hints: ['Numerator: respondents meeting both conditions. Denominator: respondents meeting the loyalty condition.', '<x>COUNTIFS(F2:F641,">="&I1,B2:B641,"Café")</x> ÷ <x>COUNTIF(F2:F641,">="&I1)</x>.'],
      },
    ],
  },
  {
    id: 'm05-pb-g4', type: 'mc', kind: 'applied',
    prompt: 'A coffee roaster’s survey (fictional) produced a needs-based segment that rates “ethically sourced” 7 and price low. The marketing manager asks how to advertise to it, since no media owner sells an audience of “ethical coffee buyers”. What is the best next step?',
    options: [
      'Profile the segment by reachable variables (where its members shop, what they read) and target through them',
      'Abandon the segment, because a segment that can’t be bought as an audience fails the accessible test for good',
      'Replace the needs-based segments with demographic ones, which media owners can sell directly',
      'Advertise to everyone, since the segment’s members will notice the ethical message wherever it appears',
    ],
    answer: 0,
    feedback: {
      1: 'Accessible means reachable at an affordable cost, not sold as a ready-made audience. Profiling usually finds reachable descriptors.',
      2: 'That gives up the base that explains choice in exchange for one that is easy to buy. Keep the needs segments and describe them with demographics.',
      3: 'Advertising to everyone pays for reaching people the message won’t move: mass marketing by default.',
    },
    hints: ['Needs explain choice; descriptors make segments reachable.', 'What does module 2’s profiling lesson add to a needs-based segment?'],
    solution: 'Needs-based segments are formed on what can’t be seen, so they are made accessible by profiling: describing each segment by reachable variables (shops, media, demographics, places) and targeting through them, or by a short typing questionnaire for customers the roaster can already contact.',
  },
];

// ---------------------------------------------------------------- on your own
// Glisten Car Wash (fictional): loyalty members by washes
const GW = { members: 5000, top: 1000, topWashes: 11200, total: 30000 };
const LOY = (() => { const lo = R.filter((_, i) => score[i] <= 7 / 3 + 1e-9), hi = R.filter((_, i) => score[i] >= 11 / 3 - 1e-9); const c = (g) => g.filter((r) => r.coldbrew <= 2).length / g.length; return { lo: c(lo), hi: c(hi), cafeLo: lo.filter((r) => r.source === 0).length / lo.length, cafeHi: hi.filter((r) => r.source === 0).length / hi.length }; })();

export const independent = [
  {
    id: 'm05-pb-i1', type: 'num', kind: 'numerical',
    prompt: `Glisten Car Wash (fictional) has ${int(GW.members)} loyalty members. Last year the ${int(GW.top)} who washed most often bought ${int(GW.topWashes)} of the ${int(GW.total)} washes bought by members. What share of washes did the heaviest 20% buy? Give a percentage to one decimal place.`,
    answer: Math.round((GW.topWashes / GW.total) * 1000) / 10, check: () => (11200 / 30000) * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: Math.round((GW.topWashes / GW.members) * 10) / 10, say: 'That is washes per member, not a share. Divide the heavy members’ washes by all members’ washes, 30,000.' },
      { value: Math.round((GW.top / GW.members) * 1000) / 10, say: 'That is the heavy members’ share of members, 20% by construction. The question is their share of washes.' },
      { value: Math.round(((GW.total - GW.topWashes) / GW.total) * 1000) / 10, say: 'That is the share bought by the other 80% of members. The heaviest 20% bought 11,200 of 30,000.' },
    ],
    solution: `S = 11,200 ÷ 30,000 × 100 = ${((GW.topWashes / GW.total) * 100).toFixed(1)}%. The heaviest fifth buy just over a third of washes; the other four-fifths buy nearly two-thirds, so a loyalty scheme that ignored lighter members would ignore most of the business.`,
  },
  {
    id: 'm05-pb-i2', type: 'classify', kind: 'conceptual',
    prompt: 'A supplier of packaging to food businesses describes possible business segments. Which kind of B2B base is each?',
    items: [
      'Restaurants and cafés with 50 or more staff',
      'Customers whose kitchens use a particular ordering software',
      'Hospitals that need sterile packaging delivered within 24 hours',
      'Customers who spent over $100,000 with the supplier last year and order every month',
      'Buyers who opened the last three e-mails and visited the online price list',
    ],
    categories: ['Firmographic', 'Technographic', 'Needs-based', 'Value-based', 'Behavioural'],
    answer: [0, 1, 2, 3, 4],
    feedback: {
      0: 'Industry and size: firmographics.',
      1: 'The technology a customer uses: technographics.',
      2: 'What the customer needs from the product and service: needs-based.',
      3: 'How much and how often the customer buys, its value to the supplier: value-based (tiering).',
      4: 'How the buyer engages with the supplier online: behavioural.',
    },
    solution: 'Firmographic: industry and staff numbers. Technographic: the ordering software. Needs-based: sterile packaging within 24 hours. Value-based: spend and order frequency. Behavioural: e-mail opens and website visits.',
  },
  {
    id: 'm05-pb-i3', type: 'order', kind: 'conceptual',
    prompt: 'Put the buyer-readiness stages in order, from furthest from buying to closest.',
    items: ['Unaware', 'Aware', 'Informed', 'Interested', 'Desirous', 'Intending to buy'],
    solution: 'Unaware, aware, informed, interested, desirous, intending to buy. Each stage needs a different task from marketing: awareness for the unaware, information and interest for the aware, and a reason to act now for those who already want the product.',
  },
  {
    id: 'm05-pb-i4', type: 'mc', kind: 'applied',
    prompt: `In Lantern’s study, ${p1(LOY.cafeHi)} of respondents with high local-loyalty scores mainly buy from cafés, against ${p1(LOY.cafeLo)} of those with low scores; but ${p1(LOY.hi)} and ${p1(LOY.lo)} respectively would definitely or probably buy Lantern Cold Brew. What should Ana take from this for Cold Brew?`,
    options: [
      'It marks café customers, not Cold Brew buyers, so it suits the cafés better than Cold Brew',
      'Local loyalty is a poor scale, since a valid attitude scale would predict every coffee purchase equally well',
      'Cold Brew should be marketed only to highly loyal respondents, as they spend most on coffee',
      'The Cold Brew figures must be wrong, because loyal local buyers ought to be keener on a local brand',
    ],
    answer: 0,
    feedback: {
      1: 'An attitude predicts behaviours that express it; a canned drink from a supermarket expresses local loyalty much less than a café visit. The scale’s alpha of 0.86 and its link with café use support it.',
      2: 'The highly loyal are hardly keener on Cold Brew than the least loyal; spending in cafés doesn’t carry over to canned coffee.',
      3: 'Survey data can surprise; a finding that contradicts an expectation is a reason to rethink the expectation, not to discard the data.',
    },
    solution: 'The attitude is a good base for Lantern’s cafés and a weak one for Cold Brew: intent barely differs between high and low scorers. Cold Brew’s prospects must be found on other needs, which is the case for module 2’s needs-based segments.',
  },
  {
    id: 'm05-pb-i5', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements about needs-based (benefit) segmentation that are true.',
    options: [
      'It groups buyers by the benefits they seek, which Haley argued are the reasons segments exist.',
      'Its segments usually differ more in what they want than demographic segments do.',
      'Its segments can be bought directly as media audiences, like age and region groups can.',
      'It usually needs a survey of importance ratings and a clustering method.',
      'Once formed, its segments need reachable descriptors or a typing tool.',
      'It makes demographic data unnecessary once the segments have been formed.',
    ],
    answer: [0, 1, 3, 4],
    feedback: {
      2: 'Needs are invisible to media owners; segments formed on them must be profiled before they can be reached.',
      5: 'Demographics remain the main descriptors for finding and reaching needs-based segments.',
    },
    solution: 'True: the premise (Haley), the sharper differences, the survey-and-cluster method and the need for descriptors or typing tools. False: needs-based segments can’t be bought as audiences, and demographics are still needed to reach them.',
  },
];

// ---------------------------------------------------------------- knowledge check
const SN = { buyers: 50000, heavy: 10000, heavyPacks: 61000, packs: 104000 };

export const check = [
  {
    id: 'm05-pb-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What was the central argument of Russell Haley’s benefit segmentation?',
    options: [
      'Benefits sought cause buying: segment on them first, describe the segments afterwards',
      'Most of a brand’s sales come from a small group of heavy users, so segment by how much people buy',
      'Personality traits determine brand choice, so segment by personality measured with standard tests',
      'Segment by neighbourhood, because people in the same area buy alike',
    ],
    answer: 0,
    feedback: {
      1: 'That is usage-rate segmentation and the 80/20 idea; Haley’s base was the benefit sought.',
      2: 'Haley segmented on benefits, not personality, and personality turns out to be a weak predictor of brand choice.',
      3: 'That is geodemographics; Haley argued that descriptive characteristics like these predict buying poorly.',
    },
    solution: 'Haley (1968) argued that descriptive characteristics of buyers predict poorly, and that the benefits sought are the basic reasons segments exist; so segment on benefits and then describe each segment with demographics and behaviour.',
  },
  {
    id: 'm05-pb-k2', type: 'num', kind: 'numerical',
    prompt: `A snack brand (fictional) had ${int(SN.buyers)} buyers in a year. The heaviest ${int(SN.heavy)} bought ${int(SN.heavyPacks)} of the ${int(SN.packs)} packs sold. What share of packs did its heaviest 20% of buyers buy? Give a percentage to one decimal place.`,
    answer: Math.round((SN.heavyPacks / SN.packs) * 1000) / 10, check: () => (61000 / 104000) * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: Math.round((SN.heavyPacks / SN.buyers) * 1000) / 10, say: 'That divides packs by buyers. The share divides the heavy buyers’ packs by all packs, 104,000.' },
      { value: Math.round(((SN.packs - SN.heavyPacks) / SN.packs) * 1000) / 10, say: 'That is the share bought by the other 80% of buyers.' },
    ],
    solution: `S = 61,000 ÷ 104,000 × 100 ≈ ${((SN.heavyPacks / SN.packs) * 100).toFixed(1)}%: close to the 60/20 pattern Sharp, Romaniuk and Graham report for consumer brands (59% on average in the analysis they cite; lower over shorter periods), and well short of 80/20.`,
  },
  {
    id: 'm05-pb-k3', type: 'mc', kind: 'applied',
    prompt: 'In Lantern’s study the 20.8% of respondents who drink 16 or more cups a week drink 45.7% of the cups but account for only 20.8% of monthly coffee spending. What does this imply for a café business choosing its best prospects?',
    options: [
      'Rank prospects by what they spend in the category, because heavy users by volume buy mostly cheap cups',
      'Target the heaviest drinkers by cups, since they drink almost half of all the coffee drunk in Harbour City',
      'Ignore usage altogether, because the two rankings disagree and so neither can be trusted',
      'Use cups and spend interchangeably, since both measure how much coffee people buy',
    ],
    answer: 0,
    feedback: {
      1: 'Volume isn’t value: heavy drinkers spend about the same per head as light drinkers ($50.34 against $49.25), because their cups come from home, supermarkets and offices.',
      2: 'Both rankings are accurate; they measure different things. Choose the one that matches the decision.',
      3: 'They rank customers very differently (the correlation between cups and spend is about zero), so the choice matters.',
    },
    solution: 'Usage rate depends on what is counted. For a café, value is spend (or margin), and Lantern’s heavy drinkers by cups contribute about a fifth of spending, the same as their share of people. Ranking by spend picks a different, more valuable group.',
  },
  {
    id: 'm05-pb-k4', type: 'classify', kind: 'conceptual',
    prompt: 'A psychographic questionnaire includes these statements. What does each measure?',
    items: [
      '“I go to the gym at least three times a week.”',
      '“Protecting the environment matters more to me than saving money.”',
      '“I like taking risks.”',
      '“I follow several food bloggers.”',
      '“Family should always come first.”',
      '“I get nervous meeting new people.”',
    ],
    categories: ['Lifestyle (activities and interests)', 'Values', 'Personality'],
    answer: [0, 1, 2, 0, 1, 2],
    feedback: {
      0: 'An activity: lifestyle.',
      1: 'A lasting belief about what matters most: values.',
      2: 'A stable trait: personality.',
      3: 'An interest: lifestyle.',
      4: 'A belief about what is important: values.',
      5: 'A stable trait (shyness): personality.',
    },
    solution: 'Lifestyle: gym visits (an activity) and following food bloggers (an interest). Values: putting the environment above saving money; family first. Personality: risk-taking; nervousness with strangers.',
  },
  {
    id: 'm05-pb-k5', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement about VALS is accurate?',
    options: [
      'It is a psychographic system of eight US consumer types, from SRI',
      'It classifies every UK postcode into categories, groups and types built from census data',
      'It ranks consumers by how much they bought of a product over the last year',
      'It measures how far each consumer has moved from being unaware of a brand to intending to buy it',
    ],
    answer: 0,
    feedback: {
      1: 'That describes a geodemographic system such as CACI’s Acorn.',
      2: 'That is usage-rate segmentation, a behavioural base.',
      3: 'That is the buyer-readiness stage, a behavioural base.',
    },
    solution: 'VALS, launched by SRI International in 1978 and renewed in 1989, is a psychographic system with eight US types, from Innovators to Survivors, which differ in their resources and in what drives them. It is now offered by Strategic Business Insights, an SRI spin-off.',
  },
  {
    id: 'm05-pb-k6', type: 'multi', kind: 'applied',
    prompt: 'Ashbury Bank (fictional) has built a reliable five-item scale of customers’ concern for the environment. Which behaviours would you expect the scale to predict best? Select all that apply.',
    options: [
      'Choosing a savings account that funds only renewable-energy projects',
      'Opting for paperless statements when offered the choice',
      'The size of the mortgage the customer takes out on their home',
      'Whether the customer banks on a smartphone app rather than in a branch',
      'Responding to a mailing about a green home-improvement loan',
    ],
    answer: [0, 1, 4],
    feedback: {
      2: 'Mortgage size depends on income, house prices and life stage; environmental concern expresses itself there only weakly, if at all.',
      3: 'Using an app reflects convenience, age and habit more than environmental concern; any link would be indirect.',
    },
    solution: 'An attitude predicts behaviours that express it. A green savings account, paperless statements and a green loan all express environmental concern directly; mortgage size and app use are driven by other things, so the scale would predict them weakly.',
  },
];
