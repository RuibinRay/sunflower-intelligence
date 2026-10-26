// distress-scores.ex.js — F03 · Distress scores: widgets, practice and the knowledge check (answer keys live here).
// Lantern’s figures come from case.js and the scores from core/ratios.js. Harbourline is F00’s fictional roaster, with the
// retained-earnings split assumed in the lesson; Starbucks’ FY2024 figures are from its 10-K. Every other business is fictional.
import { PERIODS, LEASE } from './case.js?v=18';
import { HARBOURLINE as H, HARBOURLINE_DETAIL as HD } from '../f00/case.js?v=18';
import * as R from '../../../core/ratios.js?v=18';

const P26 = PERIODS[2026], P27 = PERIODS[2027];
const zdd = (p) => R.altman(p, 'zdouble').score;
const HB = { revenue: H.revenue, ebit: H.ebit, currentAssets: H.currentAssets, currentLiabilities: H.currentLiabilities,
  totalAssets: HD.totalAssets, totalLiabilities: HD.totalAssets - HD.bookEquity, equity: HD.bookEquity, retainedEarnings: 180,
  marketEquity: H.sharePrice * H.shares };
const SB = { revenue: 36176.2, ebit: 5408.8, operatingIncome: 5408.8, currentAssets: 6847.4, currentLiabilities: 9070.0, totalAssets: 31339.3,
  totalLiabilities: 38780.9, equity: -7441.6, retainedEarnings: -7343.8 };
// a fictional manufacturer for the original model ($ millions)
const MF = { wc: 120, re: 300, ebit: 90, mve: 600, tl: 400, sales: 1100, ta: 1000 };
const zOrig = (w) => w[0] * MF.wc / MF.ta + w[1] * MF.re / MF.ta + w[2] * MF.ebit / MF.ta + w[3] * MF.mve / MF.tl + w[4] * MF.sales / MF.ta;
// Lantern 2027 if $24,000 of new shares had repaid the line of credit
const INJ = { ...P27, currentLiabilities: P27.currentLiabilities - 24000, totalLiabilities: P27.totalLiabilities - 24000, equity: P27.equity + 24000 };
// Ferncliff Consulting (fictional), $ thousands
const FC = { ca: 840, cl: 610, ta: 1500, tl: 900, re: 380, ebit: 150 };
const fcZ = R.altman({ currentAssets: FC.ca, currentLiabilities: FC.cl, totalAssets: FC.ta, totalLiabilities: FC.tl, equity: FC.ta - FC.tl, retainedEarnings: FC.re, ebit: FC.ebit }, 'zdouble');
const f2 = (v) => v.toFixed(2).replace('-', '−');

export const widgets = {
  'z-ratios': {
    type: 'ratios',
    title: 'Distress scores: Lantern, Harbourline and Starbucks',
    periods: [{ label: 'Lantern 2026', data: P26 }, { label: 'Lantern 2027', data: P27 }],
    peers: [
      { label: 'Harbourline (fictional, $m)', data: HB, note: 'Retained earnings of $180m assumed.' },
      { label: 'Starbucks FY2024 ($m)', data: SB },
    ],
    ratios: ['zdouble', 'zprime'],
    adjust: [{
      id: 'no-leases', period: 1,
      label: 'Lantern 2027 without the café leases on the balance sheet (as before ASC 842)',
      delta: { totalAssets: -P27.rightOfUse, rightOfUse: -P27.rightOfUse, currentLiabilities: -LEASE.current2027, totalLiabilities: -P27.leaseLiabilities, leaseLiabilities: -P27.leaseLiabilities },
    }],
    select: 'zdouble',
    note: 'Z″ zones: below 1.10 distress, 1.10–2.60 grey, above 2.60 safe. Z′ zones: 1.23 and 2.90. Z′ is shown for comparison only: it was built for manufacturers, and its sales term flatters businesses that turn their assets over fast, like Lantern and Starbucks. Scores use closing balances.',
  },
  'z-calc': {
    type: 'formula',
    title: 'Altman Z″ calculator',
    intro: 'Starting values: Lantern’s balance sheet at 31 December 2027 and its 2027 EBIT. Equity is total assets minus total liabilities.',
    inputs: [
      { id: 'ca', label: 'Current assets', min: 0, max: 200000, step: 1, value: P27.currentAssets, fmt: 'money' },
      { id: 'cl', label: 'Current liabilities', min: 0, max: 250000, step: 1, value: P27.currentLiabilities, fmt: 'money' },
      { id: 'ta', label: 'Total assets', min: 50000, max: 500000, step: 1, value: P27.totalAssets, fmt: 'money' },
      { id: 'tl', label: 'Total liabilities', min: 10000, max: 450000, step: 1, value: P27.totalLiabilities, fmt: 'money' },
      { id: 're', label: 'Retained earnings', min: -50000, max: 150000, step: 1, value: P27.retainedEarnings, fmt: 'money' },
      { id: 'ebit', label: 'EBIT', min: -50000, max: 100000, step: 1, value: P27.ebit, fmt: 'money' },
    ],
    compute: (v) => {
      if (v.ca > v.ta) return { error: 'Current assets can’t be larger than total assets.' };
      if (v.cl > v.tl) return { error: 'Current liabilities can’t be larger than total liabilities.' };
      const a = R.altman({ currentAssets: v.ca, currentLiabilities: v.cl, totalAssets: v.ta, totalLiabilities: v.tl, retainedEarnings: v.re, ebit: v.ebit, equity: v.ta - v.tl }, 'zdouble');
      const names = ['Working capital ÷ assets', 'Retained earnings ÷ assets', 'EBIT ÷ assets', 'Equity ÷ liabilities'];
      const biggest = a.terms.map((t, i) => [names[i], t]).sort((p, q) => q[1] - p[1]);
      const toGrey = 1.1 - a.score, toSafe = 2.6 - a.score;
      return {
        headline: { label: 'Z″', value: `${f2(a.score)} (${a.zone})` },
        rows: [
          ...a.x.map((x, i) => [`${names[i]}: ${f2(x * 100 / 100)} × ${R.ALTMAN.zdouble.w[i]}`, f2(a.terms[i])]),
          ['With the +3.25 constant (EM score)', f2(a.score + 3.25)],
        ],
        note: `${a.zone === 'safe' ? 'Above 2.60: the safe zone.' : a.zone === 'grey' ? `In the grey zone; ${f2(toSafe)} more points would reach the safe zone.` : `In the distress zone; ${f2(toGrey)} more points would reach the grey zone.`} The largest positive term is ${biggest[0][0].toLowerCase()}${biggest[3][1] < 0 ? `; ${biggest[3][0].toLowerCase()} pulls the score down` : ''}. Equity is ${v.ta - v.tl < 0 ? 'negative' : `$${(v.ta - v.tl).toLocaleString('en-US')}`}.`,
        chart: { kind: 'bar', x: { label: 'Term', values: ['X₁ term', 'X₂ term', 'X₃ term', 'X₄ term', 'Z″'] }, series: [{ name: 'Points', values: [...a.terms, a.score] }], y: { label: 'Points' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f03-z-g1', type: 'steps', kind: 'numerical',
    prompt: 'Lantern’s balance sheet at 31 December 2026: current assets $56,476; current liabilities $26,289; total assets $93,676; total liabilities $51,289; retained earnings $22,387; total equity $42,387. EBIT for the ten months was $37,716. Work out its Z″.',
    steps: [
      { id: 'f03-z-g1a', type: 'num', kind: 'numerical', prompt: 'X₁, working capital ÷ total assets, to three decimal places.',
        answer: 0.322, check: () => (P26.currentAssets - P26.currentLiabilities) / P26.totalAssets, tol: 0.0005, unit: '', places: 3,
        hints: ['Working capital is current assets minus current liabilities.', '(56,476 − 26,289) ÷ 93,676.'],
        wrong: [{ value: 0.603, say: 'That is current assets ÷ total assets. Subtract current liabilities first.' }],
        solution: 'Working capital = 56,476 − 26,289 = 30,187. X₁ = 30,187 ÷ 93,676 = 0.322.' },
      { id: 'f03-z-g1b', type: 'num', kind: 'numerical', prompt: 'Z″, to two decimal places.',
        answer: 6.47, check: () => zdd(P26), tol: 0.01, unit: '', places: 2,
        hints: ['X₂ = 22,387 ÷ 93,676; X₃ = 37,716 ÷ 93,676; X₄ = 42,387 ÷ 51,289.', '6.56 × 0.322 + 3.26 × 0.239 + 6.72 × 0.403 + 1.05 × 0.826.'],
        wrong: [{ value: 3.22, say: 'You may have used the Z weights (1.2, 1.4, 3.3, 0.6). Z″ uses 6.56, 3.26, 6.72 and 1.05.' }],
        solution: 'X₂ = 0.239, X₃ = 0.403, X₄ = 0.826. Z″ = 2.11 + 0.78 + 2.71 + 0.87 = 6.47.' },
      { id: 'f03-z-g1c', type: 'mc', kind: 'conceptual', prompt: 'Which zone is that, and what is the main caution about it?',
        options: ['Safe, though ten months’ EBIT understates it a little', 'Grey: between the two cut-offs, so the model cannot call it', 'Safe; and annualising would push it into the grey zone', 'Distress; the score is below 2.60'],
        answer: 0,
        hints: ['Z″ zones: below 1.10 distress, above 2.60 safe.'],
        feedback: { 1: '6.47 is far above 2.60.', 2: 'Annualising raises EBIT, so the score would rise (to about 7.01), not fall.', 3: 'Below 2.60 is not distress: distress is below 1.10, and 6.47 is above both.' },
        solution: 'Safe (above 2.60). The ten-month EBIT makes X₃ smaller than a full year’s would; annualised, Z″ is about 7.01.' },
    ],
    solution: 'X₁ 0.322, X₂ 0.239, X₃ 0.403, X₄ 0.826; Z″ = 6.47, safe.',
  },
  {
    id: 'f03-z-g2', type: 'num', kind: 'numerical',
    prompt: 'Using the same 2026 figures for Lantern and its ten-month revenue of $193,320, calculate its Z′ (the private-manufacturer model, with book equity). Enter two decimal places.',
    answer: 4.09, check: () => R.altman(P26, 'zprime').score, tol: 0.01, unit: '', places: 2,
    hints: ['Z′ = 0.717 X₁ + 0.847 X₂ + 3.107 X₃ + 0.420 X₄ + 0.998 X₅.', 'X₅ = 193,320 ÷ 93,676 = 2.064.'],
    wrong: [
      { value: 6.47, say: 'That is Z″. Z′ has different weights and adds sales ÷ total assets.' },
      { value: 2.03, say: 'You left out the fifth term, 0.998 × sales ÷ total assets.' },
    ],
    solution: 'Terms: 0.717 × 0.322 = 0.23; 0.847 × 0.239 = 0.20; 3.107 × 0.403 = 1.25; 0.420 × 0.826 = 0.35; 0.998 × 2.064 = 2.06. Z′ = 4.09: safe (above 2.90). Half of it comes from asset turnover.',
  },
  {
    id: 'f03-z-g3', type: 'mc', kind: 'conceptual',
    prompt: 'A privately owned chain of six hotels wants a loan. Which Altman model fits it best?',
    options: ['Z″: a private non-manufacturer, whose asset turnover would distort the others', 'Z, because it is the original model and has been tested on the most companies over the longest time', 'Z′, because the chain is private and has no share price', 'None: Z-scores can only be used for listed companies'],
    answer: 0,
    hints: ['Is a hotel a manufacturer?', 'Which model drops sales ÷ total assets?'],
    feedback: {
      1: 'Z needs a market value of equity and was fitted to manufacturers.',
      2: 'Z′ uses book equity, which fits, but keeps sales ÷ total assets and was built for manufacturers.',
      3: 'Z′ and Z″ were developed precisely for firms without a share price.',
    },
    solution: 'Z″: built for non-manufacturers and private firms, with book equity and without the sales term.',
  },
  {
    id: 'f03-z-g4', type: 'num', kind: 'applied',
    prompt: 'Suppose that on 31 December 2027 Ana had put $24,000 of new equity into Lantern and used it at once to repay the line of credit. Lantern’s balance sheet would then show current liabilities of $90,537, total liabilities of $241,065 and equity of $86,818; current assets ($59,104), total assets ($327,883), retained earnings ($42,818) and EBIT ($32,787) are unchanged. What would its Z″ be? Enter two decimal places.',
    answer: 0.85, check: () => zdd(INJ), tol: 0.01, unit: '', places: 2,
    hints: ['Working capital rises by $24,000 to −$31,433; equity ÷ liabilities = 86,818 ÷ 241,065.', '6.56 × (−0.096) + 3.26 × 0.131 + 6.72 × 0.100 + 1.05 × 0.360.'],
    wrong: [
      { value: 0.24, say: 'That is the actual 2027 score. Repaying a current liability with new equity raises working capital and equity ÷ liabilities.' },
      { value: 0.89, say: 'Check X₂: retained earnings don’t change when new shares are issued; only total equity does.' },
    ],
    solution: 'X₁ = (59,104 − 90,537) ÷ 327,883 = −0.096; X₂ = 0.131; X₃ = 0.100; X₄ = 86,818 ÷ 241,065 = 0.360. Z″ = −0.63 + 0.43 + 0.67 + 0.38 = 0.85: still in the distress zone. A $24,000 injection would not by itself move Lantern out of it.',
  },
];

export const independent = [
  {
    id: 'f03-z-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional listed maker of kitchen appliances ($ millions): working capital 120; retained earnings 300; EBIT 90; market value of equity 600; total liabilities 400; sales 1,100; total assets 1,000. Calculate its original Z-score to two decimal places.',
    answer: 2.86, check: () => zOrig(R.ALTMAN.z.w), tol: 0.01, unit: '', places: 2,
    wrong: [
      { value: 1.12, say: 'You used the 1968 weights for percentages (0.012, 0.014, 0.033, 0.006, 0.999) with ratios as decimals.' },
      { value: 2.32, say: 'X₄ uses total liabilities as the denominator, not total assets: 600 ÷ 400 = 1.5.' },
    ],
    solution: 'X₁ 0.12, X₂ 0.30, X₃ 0.09, X₄ 600 ÷ 400 = 1.5, X₅ 1.10. Z = 1.2(0.12) + 1.4(0.30) + 3.3(0.09) + 0.6(1.5) + 1.0(1.10) = 0.144 + 0.420 + 0.297 + 0.900 + 1.100 = 2.86: the grey zone (1.81–2.99).',
  },
  {
    id: 'f03-z-i2', type: 'classify', kind: 'conceptual',
    prompt: 'Choose the Altman model that fits each fictional business.',
    items: ['A listed steel producer', 'A family-owned furniture factory', 'A private chain of hotels', 'A private engineering consultancy', 'A listed maker of car parts'],
    categories: ['Z (public manufacturer)', 'Z′ (private manufacturer)', 'Z″ (non-manufacturer or private firm)'],
    answer: [0, 1, 2, 2, 0],
    feedback: {
      1: 'A manufacturer without a share price: Z′, with book equity.',
      2: 'Hotels are services, and their asset turnover differs from manufacturers’: Z″.',
      3: 'A consultancy is a service business: Z″.',
    },
    solution: 'Listed manufacturers: Z. Private manufacturers: Z′. Non-manufacturers (services, retail, hospitality): Z″.',
  },
  {
    id: 'f03-z-i3', type: 'num', kind: 'numerical',
    prompt: 'Ferncliff Consulting, a fictional private firm ($ thousands): current assets 840; current liabilities 610; total assets 1,500; total liabilities 900; retained earnings 380; EBIT 150. Calculate its Z″ to two decimal places.',
    answer: 3.20, check: () => fcZ.score, tol: 0.01, unit: '', places: 2,
    wrong: [
      { value: 2.92, say: 'X₄ is equity ÷ total liabilities: (1,500 − 900) ÷ 900 = 0.667, not equity ÷ total assets.' },
      { value: 5.87, say: 'Working capital is current assets minus current liabilities (230), not current assets.' },
    ],
    solution: 'X₁ = 230 ÷ 1,500 = 0.153; X₂ = 380 ÷ 1,500 = 0.253; X₃ = 150 ÷ 1,500 = 0.100; X₄ = 600 ÷ 900 = 0.667. Z″ = 1.01 + 0.83 + 0.67 + 0.70 = 3.20. Safe (above 2.60).',
  },
  {
    id: 'f03-z-i4', type: 'mc', kind: 'conceptual',
    prompt: 'A café group adopts ASC 842 and records operating lease liabilities equal to its new right-of-use assets; its straight-line lease cost equals the rent it used to report. Ignoring everything else, what happens to its Z″?',
    options: [
      'It falls: the current lease liability cuts working capital, total assets grow and equity ÷ liabilities falls',
      'It rises: total assets grow, so the business looks larger and safer',
      'It is unchanged, because EBIT and equity are unchanged',
      'It falls only because EBIT is lower after the lease interest is deducted',
    ],
    answer: 0,
    feedback: {
      1: 'Larger total assets shrink every ratio with assets in the denominator; they don’t make the firm look safer.',
      2: 'EBIT and equity don’t change, but the balance sheet does, and three of the four ratios use it.',
      3: 'Under ASC 842 an operating lease has a single straight-line cost in operating expenses; EBIT is the same as with rent.',
    },
    solution: 'X₁ falls (current lease liability), X₂ and X₃ fall (larger total assets) and X₄ falls (more liabilities). Lantern’s 2027 Z″ is 2.27 without its leases and 0.24 with them.',
  },
  {
    id: 'f03-z-i5', type: 'num', kind: 'numerical',
    prompt: 'A fictional retailer reports Altman’s EM score (Z″ with the +3.25 constant) of 4.90. What is its plain Z″, and in which zone is it? Enter the plain Z″ to two decimal places.',
    answer: 1.65, check: () => 4.90 - 3.25, tol: 0.005, unit: '', places: 2,
    wrong: [{ value: 8.15, say: 'Subtract the constant, don’t add it: 4.90 − 3.25.' }],
    solution: '4.90 − 3.25 = 1.65, between 1.10 and 2.60: the grey zone. On the EM scale, 4.90 is between 4.35 and 5.85, the same zone.',
  },
];

export const check = [
  {
    id: 'f03-z-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What does it mean for a firm to be in the grey zone of a Z-score model?',
    options: [
      'It lies where Altman’s samples were misclassified, so the model can’t call it',
      'It has a 50% probability of going bankrupt within two years, as estimated by the model',
      'It has negative working capital but positive retained earnings',
      'It is a non-manufacturer, so only the grey-zone thresholds apply',
    ],
    answer: 0,
    feedback: {
      1: 'Zones are not probabilities; the score gives no percentage chance of failure.',
      2: 'The zone depends on the whole score, not on the signs of two ratios.',
      3: 'Every version has its own distress, grey and safe zones.',
    },
    solution: 'The grey zone (Altman’s zone of ignorance) is where the model made errors in its samples: look closer at the business.',
  },
  {
    id: 'f03-z-k2', type: 'num', kind: 'numerical',
    prompt: 'Lantern’s Z″ was 0.24 at the end of 2027. Without its café leases on the balance sheet it would have been 2.27. By how many points does the lease accounting lower the score? Enter two decimal places.',
    answer: 2.03, check: () => R.altman({ ...P27, totalAssets: P27.totalAssets - P27.rightOfUse, currentLiabilities: P27.currentLiabilities - LEASE.current2027, totalLiabilities: P27.totalLiabilities - P27.leaseLiabilities }, 'zdouble').score - zdd(P27), tol: 0.01, unit: '', places: 2,
    wrong: [{ value: -2.03, say: 'The question asks by how much the leases lower the score: enter the size of the fall as a positive number.' }],
    solution: '2.27 − 0.24 = 2.03 points: enough to move Lantern from the grey zone to the distress zone.',
  },
  {
    id: 'f03-z-k3', type: 'mc', kind: 'applied',
    prompt: 'Starbucks’ Z″ on its FY2024 balance sheet is about −0.27, in the distress zone, while its operations produced $6,095.6 million of cash that year. What is the best explanation?',
    options: [
      'Years of buybacks and dividends have left a retained deficit and negative equity, which push X₂ and X₄ below zero',
      'Starbucks is a manufacturer, so Z″ is the wrong model and the original Z would be correct',
      'Its EBIT is negative, so X₃ dominates the score',
      'Its lease liabilities are excluded from total liabilities under US GAAP',
    ],
    answer: 0,
    feedback: {
      1: 'Starbucks mainly sells through stores: a non-manufacturer, which is why Z″ was used. The problem is its negative book equity.',
      2: 'Operating income was $5,408.8 million: X₃ is positive.',
      3: 'Under ASC 842 operating lease liabilities are on the balance sheet and in total liabilities.',
    },
    solution: 'A retained deficit of $7,343.8 million and a shareholders’ deficit of $7,441.6 million make X₂ and X₄ negative. The score reads a balance sheet shaped by returning cash to shareholders as distress.',
  },
  {
    id: 'f03-z-k4', type: 'num', kind: 'numerical',
    prompt: 'A fictional private printing company (a manufacturer): working capital $45,000; retained earnings $90,000; EBIT $38,000; book equity $150,000; total liabilities $250,000; sales $520,000; total assets $400,000. Calculate its Z′ to two decimal places.',
    answer: 2.12, check: () => 0.717 * 45000 / 400000 + 0.847 * 90000 / 400000 + 3.107 * 38000 / 400000 + 0.42 * 150000 / 250000 + 0.998 * 520000 / 400000, tol: 0.01, unit: '', places: 2,
    wrong: [
      { value: 2.02, say: 'X₄ divides equity by total liabilities (250,000), not total assets.' },
      { value: 0.82, say: 'You left out the fifth term, 0.998 × sales ÷ total assets.' },
    ],
    solution: 'X₁ 0.1125, X₂ 0.225, X₃ 0.095, X₄ 0.6, X₅ 1.3. Z′ = 0.081 + 0.191 + 0.295 + 0.252 + 1.297 = 2.12: the grey zone (1.23–2.90). Asset turnover supplies more than half of it.',
  },
  {
    id: 'f03-z-k5', type: 'mc', kind: 'applied',
    prompt: 'Coastline’s screening policy refers any borrower with Z″ below 1.10 to the credit committee. How should the loan officer present Lantern’s 0.24?',
    options: [
      'Explain what drives the score and what it can’t see, and recommend terms that address those causes',
      'Recommend calling in the line of credit, because the score predicts that Lantern will go bankrupt within two years',
      'Recompute the score with Z′, which gives a grey-zone result, and present that instead',
      'Ignore the score, because Z-scores were not designed for small private businesses',
    ],
    answer: 0,
    feedback: {
      1: 'A score is not a prediction for one firm; it is a reason to look closer.',
      2: 'Choosing the model that gives the answer you want is not analysis: Z″ is the right model for a café business.',
      3: 'Its limits are a reason to interpret it, not to discard it: the low score points to real pressures.',
    },
    solution: 'Use the score as a screen: show what drives it, what it can’t see, and what conditions (monthly reporting, no increase until the law firm pays) address the risk.',
  },
  {
    id: 'f03-z-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Select all that apply: which are genuine limits of Altman’s Z-scores when applied to Lantern?',
    options: [
      'The models were fitted to samples of firms very different from a young private café business',
      'Operating leases on the balance sheet under ASC 842 lower the score compared with the balance sheets the models were fitted on',
      'The score uses EBIT and retained earnings as reported, so it inherits any weakness in earnings quality',
      'Z″ cannot be calculated for a firm with negative working capital',
      'The zones are probabilities of bankruptcy calibrated to Lantern’s industry',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'A negative X₁ simply gives a negative term, as in Lantern’s 2027 score.',
      4: 'The zones are ranges of the score in Altman’s samples, not probabilities, and not calibrated to cafés.',
    },
    solution: 'Sample differences, lease accounting and the quality of the inputs are real limits. Negative working capital is handled by the formula, and the zones are not probabilities.',
  },
];
