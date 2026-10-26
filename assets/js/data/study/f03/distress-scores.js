// distress-scores.js — F03 · Distress scores. Content only; exercises are in distress-scores.ex.js.
// Lantern’s figures come from case.js (PERIODS, LEASE); scores from core/ratios.js (altman, ALTMAN). Harbourline is
// F00’s fictional listed roaster (f00/case.js); its split of equity into retained earnings is a new fictional assumption
// made here (F00 gives only total equity). Starbucks’ FY2024 balance-sheet figures are from REAL-FIGURES.md and the
// filing cited.
//
// Altman zones, as verified for this lesson (see the report to the course lead):
// - Z: 1.81 lower bound in Altman (2000); 2.99 upper bound (and 1.8/1.80 for the lower) on Altman’s own slides (2017,
//   2019). The 1968 article itself could not be opened.
// - Z′: 1.23 and 2.90 in Altman (2000) text and on Altman’s 2017 slide (Altman 2000’s Table 6 also prints 1.21).
// - Z″: Altman’s 2017 slide gives 4.35 and 5.85 for Z″ with its +3.25 constant; 1.10 and 2.60 are those bounds less the
//   constant, which this lesson shows as arithmetic. No Altman source opened prints 1.10 and 2.60 directly.
import { PERIODS, LEASE } from './case.js?v=18';
import { HARBOURLINE as H, HARBOURLINE_DETAIL as HD } from '../f00/case.js?v=18';
import * as R from '../../../core/ratios.js?v=18';

const P26 = PERIODS[2026], P27 = PERIODS[2027];
const Z26 = R.altman(P26, 'zdouble'), Z27 = R.altman(P27, 'zdouble');
const ZP26 = R.altman(P26, 'zprime'), ZP27 = R.altman(P27, 'zprime');
const W = R.ALTMAN;
const EM = 3.25;                                                                 // Z″’s constant in its emerging-market form
const zone2 = (lo, hi) => [lo + EM, hi + EM];

// Lantern 2027 as it would have looked before ASC 842 (no right-of-use asset or lease liabilities; equal straight-line cost)
const NL = { ...P27, totalAssets: P27.totalAssets - P27.rightOfUse, currentLiabilities: P27.currentLiabilities - LEASE.current2027,
  totalLiabilities: P27.totalLiabilities - P27.leaseLiabilities };
const ZNL = R.altman(NL, 'zdouble');
// 2026 with ten months’ EBIT annualised (stocks unchanged)
const ZA26 = R.altman({ ...P26, ebit: R.annualise(P26.ebit, P26.months) }, 'zdouble');

// Harbourline Roasters (F00, $ millions). Assumption for this lesson (fictional): retained earnings $180m of its $300m equity.
const HRE = 180;
const HB = { revenue: H.revenue, ebit: H.ebit, currentAssets: H.currentAssets, currentLiabilities: H.currentLiabilities,
  totalAssets: HD.totalAssets, totalLiabilities: HD.totalAssets - HD.bookEquity, equity: HD.bookEquity, retainedEarnings: HRE,
  marketEquity: H.sharePrice * H.shares };
const HZ = R.altman(HB, 'z'), HZP = R.altman(HB, 'zprime'), HZD = R.altman(HB, 'zdouble');
const HZD0 = R.altman({ ...HB, retainedEarnings: 0 }, 'zdouble'), HZD300 = R.altman({ ...HB, retainedEarnings: HD.bookEquity }, 'zdouble');
const HZ0 = R.altman({ ...HB, retainedEarnings: 0 }, 'z'), HZ300 = R.altman({ ...HB, retainedEarnings: HD.bookEquity }, 'z');
const HREsafe = HRE - (HZ.score - W.z.zones[1]) / W.z.w[1] * HD.totalAssets;   // retained earnings at which Z = 2.99 (about $156m)

// Starbucks FY2024 (29 Sep 2024, $ millions; REAL-FIGURES.md §1, balance sheet and statements of earnings)
const SB = { revenue: 36176.2, ebit: 5408.8, currentAssets: 6847.4, currentLiabilities: 9070.0, totalAssets: 31339.3,
  totalLiabilities: 38780.9, equity: -7441.6, retainedEarnings: -7343.8, cfo: 6095.6, interest: 562.0, dividends: 2585.0, buybacks: 1266.7 };
const SBZ = R.altman(SB, 'zdouble');

// Altman (2000), Table 7: US bond-rating equivalents of the EM score (selected rows)
const BRE = { AAA: 8.15, 'BBB+': 6.25, BBB: 5.85, 'B-': 3.75, 'CCC+': 3.20, D: 0 };

const x3 = (v) => v.toFixed(3).replace('-', '−');
const t2 = (v) => v.toFixed(2).replace('-', '−');
const termRows = (a) => ['Working capital ÷ total assets', 'Retained earnings ÷ total assets', 'EBIT ÷ total assets', 'Book equity ÷ total liabilities']
  .map((l, i) => [`<m>X_${i + 1}</m>: ${l}`, String(W.zdouble.w[i]), x3(a.x[i]), t2(a.terms[i])]);

export default {
  slug: 'distress-scores',
  title: 'Distress scores',
  blurb: 'Combine liquidity, accumulated profit, earning power and leverage into one score with Altman’s Z-score models, place a business in its zone, and judge when the score can and cannot be trusted.',
  status: 'draft',
  objectives: [
    'Calculate Altman’s Z, Z′ and Z″ scores from a balance sheet and income statement, and place a business in the distress, grey or safe zone.',
    'Explain what each ratio in the score measures and which ones moved Lantern from 6.47 in 2026 to 0.24 in 2027.',
    'Choose the version of the model that fits a business (public or private, manufacturer or not) and show how the choice changes the zone.',
    'Evaluate the limits of the scores: their samples, operating leases on the balance sheet, part-year periods and negative book equity.',
    'Distinguish a distress score from a forecast or a probability of default, and name other approaches to credit risk.',
  ],
  prerequisites: [
    { lesson: 'f03/liquidity', why: 'Working capital, the first ratio in every Z-score, and why Lantern’s fell below zero in 2027.' },
    { lesson: 'f03/solvency-and-leverage', why: 'Equity against liabilities, and operating leases as debt under ASC 842.' },
    { lesson: 'f03/cash-flow-and-earnings-quality', why: 'The quality of the EBIT and retained earnings that the score uses.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Coastline Bank (fictional, like Lantern) screens every small-business borrower with a distress score before a loan officer reads the file. For Lantern the screen gives 6.47 on its 2026 statements, well inside the safe zone, and 0.24 on its 2027 statements, inside the distress zone. The loan officer has to decide what that drop means, and whether the model was built for a business like Lantern at all.' },
    { p: 'Each ratio you have met in this course answers one question: can the business pay its bills this year, how much does it owe, how hard do its assets work, how profitable is it? A lender needs one answer to a different question: is this business likely to fail? In 1968 Edward Altman looked for a combination of ratios that would separate firms that went bankrupt from those that didn’t. His result, the <g>Altman Z-score</g>, is still the most widely taught distress score.' },
    { p: 'Altman took 66 US manufacturing companies, 33 that had filed for bankruptcy between 1946 and 1965 and 33 that had not, and used <g>multiple discriminant analysis</g>: a statistical method that finds the weights on several variables that best separate two groups. The weighted sum is a single score. Firms that later failed tended to have low scores; healthy firms high ones. Between them lay a range where the model made mistakes, which Altman called the zone of ignorance, now usually called the <g>grey zone</g>.' },
    { h: 'The five ratios' },
    { p: 'Every version of the score is built from some or all of the same five ratios. Each captures a different way a business can be weak.' },
    { list: [
      '<b><m>X_1</m> = working capital ÷ total assets.</b> <g>Working capital</g> is current assets minus current liabilities: the short-term cushion. A firm in trouble usually sees it shrink as losses eat its current assets and it borrows short term.',
      '<b><m>X_2</m> = retained earnings ÷ total assets.</b> <g>Retained earnings</g> are the profits a business has kept since it began. The ratio measures cumulative profitability, and it is low for young firms, which fail more often.',
      '<b><m>X_3</m> = EBIT ÷ total assets.</b> <g>EBIT</g> (earnings before interest and tax) over assets is the earning power of the assets, whatever the financing. It carries the largest weight in the original model.',
      '<b><m>X_4</m> = equity ÷ total liabilities.</b> How far the value of the business could fall before what it owes exceeds what it is worth. The original model uses the market value of equity; the private-firm versions use book equity.',
      '<b><m>X_5</m> = sales ÷ total assets.</b> Asset turnover: how much revenue the assets generate. It varies so much between industries that the non-manufacturer model leaves it out.',
    ] },
    { h: 'Three versions of the model' },
    { table: {
      caption: 'Altman’s Z-score models: weights and zones',
      head: ['Model', 'Score', 'Distress below', 'Safe above'],
      align: ['l', 'l', 'r', 'r'],
      rows: [
        ['Z (1968): public manufacturers', '1.2 X₁ + 1.4 X₂ + 3.3 X₃ + 0.6 X₄ + 1.0 X₅, with X₄ on the market value of equity', String(W.z.zones[0]), String(W.z.zones[1])],
        ['Z′: private manufacturers', '0.717 X₁ + 0.847 X₂ + 3.107 X₃ + 0.420 X₄ + 0.998 X₅, with book equity', String(W.zprime.zones[0]), W.zprime.zones[1].toFixed(2)],
        ['Z″: non-manufacturers and private firms', '6.56 X₁ + 3.26 X₂ + 6.72 X₃ + 1.05 X₄, with book equity', W.zdouble.zones[0].toFixed(2), W.zdouble.zones[1].toFixed(2)],
        ['Z″ with its +3.25 constant (the “EM score”)', '3.25 + 6.56 X₁ + 3.26 X₂ + 6.72 X₃ + 1.05 X₄', zone2(...W.zdouble.zones)[0].toFixed(2), zone2(...W.zdouble.zones)[1].toFixed(2)],
      ],
      note: 'Weights from Altman (2000). Zones: Z’s 1.81 from Altman (2000) and its 2.99 from Altman’s 2017 and 2019 presentations (which write the lower bound as 1.8); Z′’s from Altman (2000) and his 2017 presentation; Z″ with the constant from his 2017 presentation (4.35 and 5.85), so the plain Z″ zones are those less 3.25. Between the two bounds is the grey zone.',
    } },
    { p: 'Lantern is private and is not a manufacturer: it sells coffee, food and events. The model that fits is Z″. Here is its score for both years, from closing balances (the score uses the balance sheet at the date, not averages).' },
    { table: {
      caption: 'Lantern’s Z″, 2026 and 2027',
      head: ['Ratio', 'Weight', '2026', 'Term 2026', '2027', 'Term 2027'],
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      rows: termRows(Z26).map((r, i) => [...r, x3(Z27.x[i]), t2(Z27.terms[i])]),
      foot: [['Z″', '', '', t2(Z26.score), '', t2(Z27.score)]],
      note: `Fictional figures. Zones: below 1.10 distress, above 2.60 safe. 2026 is ${Z26.zone}; 2027 is ${Z27.zone}.`,
    } },
    { p: 'Read the terms rather than only the total. Working capital, the biggest single change, went from a cushion worth 2.11 points to a deficit costing 1.11: at the end of 2027 current liabilities exceeded current assets by $55,433, because the cash went into the cafés, the line of credit was drawn, the Coastline note fell due within the year and the cafés’ lease payments due in 2028 became current liabilities. Earning power fell from 2.71 to 0.67 points as EBIT dropped and total assets more than tripled. Equity against liabilities fell from 0.87 to 0.25 points, mostly because $173,379 of lease liabilities arrived on the balance sheet.' },
    { callout: 'key', title: 'A score is a screen, not a verdict', html: 'The zones describe where firms in Altman’s samples fell, not what will happen to Lantern. A score of 0.24 says Lantern’s 2027 balance sheet looks like those of firms that failed. The loan officer’s job is to find out why, and the reasons here (a fit-out paid in cash, leases now on the balance sheet, $30,840 of revenue due in March 2028) are exactly what the score cannot see.' },
  ],

  theory: [
    { h: 'Where the models came from' },
    { p: 'The original Z was fitted to manufacturers whose shares were traded, which is why it uses the market value of equity in <m>X_4</m>. Altman’s 1968 article wrote the first four ratios as percentages, so its published weights read 0.012, 0.014, 0.033 and 0.006 (and 0.999 on sales); his 2000 paper restates them as 1.2, 1.4, 3.3 and 0.6 for ratios written as decimals. Use the second set with decimals: mixing them is a classic error.' },
    { p: 'Most firms that borrow from banks have no share price. Altman re-estimated the model for private firms with book equity in <m>X_4</m>: that is Z′, whose weights and zones differ because book and market values differ. He then fitted Z″ without <m>X_5</m>, to reduce the industry effect that asset turnover brings: a retailer or café turns its assets over far faster than a steel mill, which would make it look safer than it is. Z″ was developed for non-manufacturers and for companies in emerging markets; in that use Altman added a constant of 3.25, so that a score of zero corresponds to a bond in default, and calibrated the scores to US bond ratings.' },
    { h: 'What the sources say about the zones' },
    { callout: 'standards', title: 'Checking the cut-offs', html: 'Textbooks and websites quote Altman’s zones with small differences, so it is worth knowing what he wrote. His 2000 working paper describes the original model’s cut-off of 2.675 and recommends the lower bound of the zone of ignorance, 1.81, as a more realistic cut-off; his later presentations show the original model’s zones as below 1.8 (distress), 1.8 to 2.99 (grey) and above 2.99 (safe). For Z′ the 2000 paper gives a grey area of 1.23 to 2.90 (one of its tables prints 1.21). For Z″ Altman’s 2017 presentation, which writes the model with its +3.25 constant and titles it simply Z″ (his 2000 paper calls the scores on this scale EM scores), gives below 4.35 (distress) and above 5.85 (safe); taking off the constant gives the 1.10 and 2.60 used for the plain Z″ in this course.' },
    { p: `The constant matters when you read someone else’s analysis. Lantern’s 2027 Z″ is 0.24 without the constant and <m>0.24 + 3.25 = 3.49</m> with it; both are in the distress zone of their own scale. Comparing 3.49 with the plain zones (1.10 and 2.60) would wrongly put Lantern in the safe zone. Altman (2000) also gives the average score with the constant for each US bond rating in 1994: 8.15 for AAA, 5.85 for BBB, 3.75 for B−, 3.20 for CCC+ and 0 for D. On that scale Lantern’s 2026 score of 9.72 is above the AAA average and its 2027 score of 3.49 lies between the CCC+ and B− averages. Those averages describe large rated companies in the mid-1990s, so treat them as a rough translation, not a rating.` },
    { h: 'Choosing the model changes the zone' },
    { p: 'The same business can land in different zones under different versions. Lantern’s 2027 Z′, which keeps sales ÷ total assets, is 2.16, in its grey zone: sales of $577,860 on $327,883 of assets add 1.76 points. That is the industry effect Z″ removes. For a café business, Z″ is the right model, and its answer is distress.' },
    { p: `Harbourline Roasters, the fictional listed roaster from F00, shows the other side. A roaster turns green beans into roasted coffee, so it is a manufacturer, and it has a share price, so the original Z applies. F00 gives Harbourline’s total equity ($300 million) but not its split; for this lesson assume (a fictional assumption) that $${HRE} million of it is retained earnings. With its market capitalisation of $765 million against liabilities of $360 million, Harbourline’s Z is ${t2(HZ.score)}, just inside the safe zone (above 2.99). That call rests on the assumption: between none and all of the $300 million being retained earnings, Z ranges from ${t2(HZ0.score)} to ${t2(HZ300.score)}, and with less than about $${Math.round(HREsafe)} million of retained earnings it would be grey. On book equity its Z′ is ${t2(HZP.score)}, in the grey zone, and its Z″ is ${t2(HZD.score)}, safe. The market thinks Harbourline’s equity is worth two and a half times its book value, and the original model gives that confidence weight.` },
    { h: 'Limits of the scores' },
    { list: [
      '<b>The samples.</b> The original Z was fitted to 66 US manufacturers with between $1 million and $25 million of assets, half of which failed between 1946 and 1965; later versions to other samples. A two-year-old private café business is far from any of them, and accounting, financing and industries have changed since.',
      '<b>Leases on the balance sheet.</b> Since ASC 842 (from 2019 for public companies; from fiscal years beginning after 15 December 2021 for private ones) and IFRS 16, lessees record right-of-use assets and lease liabilities. The current part of the lease liability cuts working capital, the asset enlarges every denominator and the liability lowers equity ÷ liabilities. The models were fitted before that change.',
      '<b>Part-year and first-year periods.</b> Lantern’s 2026 EBIT covers ten months. Annualised, its 2026 Z″ would be about 7.01 rather than 6.47 (same zone). Young firms also have small retained earnings, which <m>X_2</m> penalises by design.',
      '<b>Book equity that isn’t a cushion.</b> Some strong companies have negative book equity after years of buybacks and dividends. Their <m>X_2</m> and <m>X_4</m> go negative and the score says distress, which may say more about the balance sheet than about the risk.',
      '<b>Quality of the inputs.</b> The score takes EBIT and retained earnings at face value. Profit inflated by aggressive accounting raises the score, as the previous lesson showed it can.',
      '<b>Not a forecast.</b> The zones mark where Altman’s samples were classified with or without error; they are not probabilities. A score near a boundary is a reason to look closer, not a coin toss.',
    ] },
    { p: `Leases show the second limit at its starkest. Remove the right-of-use asset and the lease liabilities from Lantern’s 2027 balance sheet, as under the rules before ASC 842 (the straight-line lease cost equals what the rent would have been, so EBIT and equity don’t change), and its Z″ rises from 0.24 to ${t2(ZNL.score)}: grey, not distress. The cafés’ economics are the same; only the accounting moved.` },
    { p: `Starbucks illustrates the fourth. At 29 September 2024 it reported a retained deficit of $7,343.8 million and total shareholders’ deficit of $7,441.6 million, after years of dividends and share repurchases ($2,585.0 million and $1,266.7 million in fiscal 2024 alone). Its Z″ from the FY2024 balance sheet is ${t2(SBZ.score)}, deep in the distress zone, although in the same year its operations produced $6,095.6 million of cash and its operating income covered its interest expense <m>5{,}408.8 \\div 562.0 = 9.62</m> times. A model built on book equity misreads a company whose deficit comes from returning cash to shareholders.` },
    { h: 'Other approaches' },
    { p: 'Altman’s scores are the best known of many credit-scoring models. Ohlson’s O-score (1980) uses logistic regression on similar ratios and gives a probability of failure rather than a zone. Market-based models infer default risk from the share price and its volatility. Credit rating agencies combine financial ratios with judgement about the industry, management and the terms of the debt. Banks build their own scorecards from their loan histories, and Altman’s later work extends the approach to small and medium-sized firms. All of them start from the same evidence: liquidity, profitability, leverage and the quality of the figures.' },
  ],

  formulas: [
    { id: 'altman-z', name: 'Altman’s Z (1968): public manufacturers',
      tex: String.raw`Z = 1.2X_1 + 1.4X_2 + 3.3X_3 + 0.6X_4 + 1.0X_5`,
      where: [
        [String.raw`X_1`, 'Working capital (current assets − current liabilities) ÷ total assets', ''],
        [String.raw`X_2`, 'Retained earnings ÷ total assets', ''],
        [String.raw`X_3`, 'EBIT ÷ total assets', ''],
        [String.raw`X_4`, 'Market value of equity ÷ total liabilities (book value)', ''],
        [String.raw`X_5`, 'Sales ÷ total assets', ''],
        [String.raw`Z`, 'The score: below 1.81 distress, 1.81–2.99 grey, above 2.99 safe', ''],
      ],
      assumptions: 'Ratios as decimals, balances at the balance-sheet date. Fitted to US public manufacturers.',
      note: 'Harbourline (fictional, retained earnings assumed $180m): Z = 3.04.' },
    { id: 'altman-z-prime', name: 'Altman’s Z′: private manufacturers',
      tex: String.raw`Z' = 0.717X_1 + 0.847X_2 + 3.107X_3 + 0.420X_4 + 0.998X_5`,
      where: [
        [String.raw`X_1,\ X_2,\ X_3,\ X_5`, 'As in Z', ''],
        [String.raw`X_4`, 'Book value of equity ÷ total liabilities', ''],
        [String.raw`Z'`, 'The score: below 1.23 distress, 1.23–2.90 grey, above 2.90 safe', ''],
      ],
      note: 'Lantern 2027: 2.16 (grey), lifted by its high sales ÷ total assets.' },
    { id: 'altman-z-double', name: 'Altman’s Z″: non-manufacturers and private firms',
      tex: String.raw`Z'' = 6.56X_1 + 3.26X_2 + 6.72X_3 + 1.05X_4`,
      where: [
        [String.raw`X_1`, 'Working capital ÷ total assets', ''],
        [String.raw`X_2`, 'Retained earnings ÷ total assets', ''],
        [String.raw`X_3`, 'EBIT ÷ total assets', ''],
        [String.raw`X_4`, 'Book value of equity ÷ total liabilities', ''],
        [String.raw`Z''`, 'The score: below 1.10 distress, 1.10–2.60 grey, above 2.60 safe', ''],
      ],
      assumptions: 'Sales ÷ total assets is left out to reduce industry effects. The zones are Altman’s 4.35 and 5.85 for the version with the constant, less 3.25.',
      note: 'Lantern: 6.47 (2026, safe); 0.24 (2027, distress).' },
    { id: 'altman-em', name: 'Z″ with its constant (the EM score)',
      tex: String.raw`\text{EM score} = 3.25 + Z''`,
      where: [[String.raw`Z''`, 'Altman’s Z″ as above', ''], [String.raw`\text{EM score}`, 'The score on the scale calibrated to bond ratings: below 4.35 distress, 4.35–5.85 grey, above 5.85 safe', '']],
      note: 'Lantern 2027: 0.24 + 3.25 = 3.49. Compare it only with the zones of its own scale.' },
  ],

  examples: [
    { level: 'simple', title: 'Lantern’s 2027 Z″', fictional: true,
      setup: 'Lantern’s balance sheet at 31 December 2027: current assets $59,104; current liabilities $114,537; total assets $327,883; total liabilities $265,065; retained earnings $42,818; total equity $62,818. EBIT for 2027 was $32,787. Calculate Z″ and its zone.',
      steps: [
        'Working capital: <m>59{,}104 - 114{,}537 = -55{,}433</m>. <m>X_1 = -55{,}433 \\div 327{,}883 = -0.169</m>.',
        '<m>X_2 = 42{,}818 \\div 327{,}883 = 0.131</m>; <m>X_3 = 32{,}787 \\div 327{,}883 = 0.100</m>; <m>X_4 = 62{,}818 \\div 265{,}065 = 0.237</m>.',
        'Weight each ratio: <m>6.56 \\times (-0.169) = -1.11</m>; <m>3.26 \\times 0.131 = 0.43</m>; <m>6.72 \\times 0.100 = 0.67</m>; <m>1.05 \\times 0.237 = 0.25</m>.',
        'Add: <m>-1.11 + 0.43 + 0.67 + 0.25 = 0.24</m> (working with unrounded ratios gives 0.2375).',
        'Compare with the zones: 0.24 is below 1.10, the distress zone.',
      ],
      answer: 'Z″ = 0.24: the distress zone.',
      interpretation: 'Negative working capital alone costs Lantern 1.11 points. The other three terms are positive but small, because the balance sheet has tripled with leased assets while profit fell.' },
    { level: 'challenging', title: 'How much of the distress is lease accounting?', fictional: true,
      setup: 'At 31 December 2027 Lantern’s balance sheet includes a right-of-use asset of $173,379 and operating lease liabilities of $173,379, of which $37,010 is current. Before ASC 842 these would not have been recognised, and the straight-line lease cost of $40,000 would have been the same as rent expense. Recompute Lantern’s 2027 Z″ without the leases and explain the difference.',
      steps: [
        'Remove the lease balances: total assets <m>327{,}883 - 173{,}379 = 154{,}504</m>; current liabilities <m>114{,}537 - 37{,}010 = 77{,}527</m>; total liabilities <m>265{,}065 - 173{,}379 = 91{,}686</m>. Current assets, retained earnings, equity and EBIT are unchanged, because the expense is the same either way.',
        'Ratios: <m>X_1 = (59{,}104 - 77{,}527) \\div 154{,}504 = -18{,}423 \\div 154{,}504 = -0.119</m>; <m>X_2 = 42{,}818 \\div 154{,}504 = 0.277</m>; <m>X_3 = 32{,}787 \\div 154{,}504 = 0.212</m>; <m>X_4 = 62{,}818 \\div 91{,}686 = 0.685</m>.',
        'Terms: <m>-0.78 + 0.90 + 1.43 + 0.72 = 2.27</m>.',
        'Compare: 2.27 is between 1.10 and 2.60, the grey zone, against 0.24 (distress) with the leases.',
      ],
      answer: 'Without the leases Z″ is 2.27 (grey); with them, 0.24 (distress). Lease accounting accounts for about 2.03 points of the score.',
      interpretation: 'The leases are real obligations (Lantern must pay $4,000 a month until February 2032), so the 0.24 is not wrong. But Z″ was calibrated on balance sheets without them, so its zones are harsher for lease-heavy businesses than they were designed to be. Compare lessees with lessees, and say which basis you used.' },
    { level: 'applied', title: 'Which model for a listed roaster?', fictional: true,
      setup: `Coastline Bank’s treasury team is considering buying bonds issued by Harbourline Roasters (fictional, $ millions): current assets 180; current liabilities 120; total assets 660; total liabilities 360; book equity 300, of which retained earnings ${HRE} (assumed for this example); revenue 640; EBIT 61; 18 million shares at $42.50. Compute Z, Z′ and Z″, and advise which to rely on.`,
      steps: [
        'Shared ratios: <m>X_1 = (180 - 120) \\div 660 = 0.091</m>; <m>X_2 = 180 \\div 660 = 0.273</m>; <m>X_3 = 61 \\div 660 = 0.092</m>; <m>X_5 = 640 \\div 660 = 0.970</m>.',
        'Original Z, with market equity <m>42.50 \\times 18 = 765</m>: <m>X_4 = 765 \\div 360 = 2.125</m>. <m>Z = 1.2(0.091) + 1.4(0.273) + 3.3(0.092) + 0.6(2.125) + 1.0(0.970) = 3.04</m>: safe, just above 2.99.',
        'Z′ with book equity, <m>X_4 = 300 \\div 360 = 0.833</m>: <m>0.717(0.091) + 0.847(0.273) + 3.107(0.092) + 0.420(0.833) + 0.998(0.970) = 1.90</m>: grey.',
        'Z″: <m>6.56(0.091) + 3.26(0.273) + 6.72(0.092) + 1.05(0.833) = 2.98</m>: safe.',
        'Choose: Harbourline is a listed manufacturer, the population the original Z was fitted to, so Z is the primary score. Z′ is for private firms; Z″ for non-manufacturers.',
      ],
      answer: 'Z = 3.04 (safe, narrowly), Z′ = 1.90 (grey), Z″ = 2.98 (safe). Rely on Z, but note that it is only 0.05 above the safe boundary, that its strength comes from the market value of equity, and that the safe call depends on the assumed retained earnings: below about $156 million, Z would be grey.',
      interpretation: `Harbourline’s earning power is modest (EBIT is 9% of assets), and its safe score leans on the share price. If the shares fell by half, <m>X_4</m> would fall to about 1.06 and Z to about 2.40: grey. The team should treat the score as one input, look at interest coverage (61 ÷ 11 = 5.5 times) and the debt’s terms, and keep in mind that the retained-earnings figure here is an assumption: between none and all of the $300 million, Z ranges from ${t2(HZ0.score)} to ${t2(HZ300.score)} and Z″ from ${t2(HZD0.score)} to ${t2(HZD300.score)}.` },
  ],

  demo: [
    { widget: 'z-ratios', intro: 'Lantern’s Z″ and Z′ for both years, with Harbourline (fictional, retained earnings assumed) and Starbucks (FY2024) for comparison. Pick a score to see its terms. Tick the adjustment to take the café leases out of Lantern’s 2027 balance sheet.' },
    { widget: 'z-calc', intro: 'A Z″ calculator. Start from Lantern’s 2027 balance sheet and change one item at a time: what would it take to reach the grey zone (1.10) or the safe zone (2.60)? Try collecting the law firm’s $30,840 and using it to repay current debt: working capital doesn’t change, but total assets and liabilities fall.' },
  ],

  mistakes: [
    { title: '“The original weights are 0.012, 0.014, 0.033, 0.006 and 0.999.”', html: 'Those are the 1968 article’s weights for ratios written as percentages (15 for 15%). With ratios as decimals use 1.2, 1.4, 3.3, 0.6 and 1.0. Mixing them produces a false distress signal.' },
    { title: '“Use the original Z for any company.”', html: 'Z was fitted to public manufacturers with a share price. For a private firm use Z′ (book equity); for a non-manufacturer such as a café, a retailer or a service business use Z″, which drops sales ÷ total assets. Lantern’s Z′ (2.16, grey) and Z″ (0.24, distress) differ because of that one term.' },
    { title: '“Lantern’s EM score of 3.49 is above 2.60, so it is safe.”', html: 'The constant of 3.25 shifts the whole scale. Compare a score with the zones of its own version: 3.49 against 4.35 and 5.85, or 0.24 against 1.10 and 2.60. Both say distress.' },
    { title: '“A score in the distress zone means the firm will go bankrupt.”', html: 'The zones describe how firms in Altman’s samples were classified, not a probability for any one firm. The score is a screen that tells you where to look: for Lantern, at the timing of the law firm’s payment and the leases.' },
    { title: '“Comparing a firm’s Z″ before and after 2019 shows how its risk changed.”', html: 'Operating leases came onto US balance sheets under ASC 842 (from 2019 for public companies, later for private ones). A lease-heavy firm’s score can fall sharply with no change in its business: Lantern’s 2027 Z″ is 2.27 without its leases and 0.24 with them. Put both years on the same basis first.' },
  ],

  application: [
    { p: '<b>The loan officer’s file.</b> Coastline’s policy sends any borrower with Z″ below 1.10 to the credit committee instead of approving a renewal automatically. The loan officer’s note on Lantern does not argue with the score; it explains it. Of the drop from 6.47 to 0.24, the largest part comes from working capital, and the note traces it: cash spent on the cafés’ fit-out and machines, the line of credit, the Coastline note now due within a year and $37,010 of lease payments due in 2028. Recomputed without the leases the score is 2.27. The note recommends renewing the line at its current limit, not increasing it, on condition that Lantern reports monthly until the law firm’s payment arrives, and recomputing the score on the 2028 statements.' },
    { p: '<b>A supplier extending credit.</b> Kilnworth Roasting, which supplies Lantern’s beans on 30-day terms, runs a simpler check on its trade customers: a Z″ from their latest accounts, the trend over two years and how promptly they pay. A customer whose score has fallen into the distress zone and who has started paying late is moved to shorter terms. Lantern still pays on time, so Kilnworth keeps its terms but asks for the 2028 half-year figures.' },
    { p: '<b>A portfolio screen.</b> A fund that buys corporate bonds computes Z-scores for every issuer each quarter, using the version that fits each one, and reviews any issuer whose score has crossed into the grey or distress zone. The analysts know the model’s blind spots, so a low score triggers questions rather than a sale: is the cause leases, buybacks, a one-off loss, or a business that is genuinely weakening?' },
  ],

  summary: [
    'Altman’s Z-scores weight several ratios, found by multiple discriminant analysis, into one score that separates firms that failed from those that didn’t.',
    'The ratios: working capital, retained earnings, EBIT and equity (market or book), each over total assets or total liabilities, and in Z and Z′ sales ÷ total assets.',
    'Zones: Z below 1.81 distress, above 2.99 safe; Z′ 1.23 and 2.90; Z″ 1.10 and 2.60 (4.35 and 5.85 with its +3.25 constant).',
    'Lantern’s Z″ fell from 6.47 (safe) in 2026 to 0.24 (distress) in 2027, driven by negative working capital, lower earning power and lease liabilities.',
    'Choose the version for the firm: Z for public manufacturers, Z′ for private manufacturers, Z″ for non-manufacturers and private firms; the choice can change the zone.',
    'Limits: samples of 1946–65 US manufacturers with $1–25 million of assets, operating leases now on balance sheets (Lantern 2.27 without them), part-year periods, negative book equity (Starbucks −0.27) and the quality of the inputs.',
    'A score is a screen that tells you where to look, not a forecast or a probability of default.',
  ],

  glossary: [
    { term: 'Altman Z-score', def: 'A distress score developed by Edward Altman that weights several financial ratios (working capital, retained earnings, EBIT and equity, each relative to assets or liabilities, and in some versions sales) into one number, compared with zones that separate firms resembling those that failed from those that didn’t.' },
    { term: 'Multiple discriminant analysis', def: 'A statistical method that finds the weights on several variables which best separate observations into predefined groups, such as firms that went bankrupt and firms that did not.' },
    { term: 'Grey zone', def: 'The range of a distress score between the distress and safe cut-offs, where the model misclassified firms in its samples and cannot call the outcome; Altman called it the zone of ignorance.' },
  ],

  references: [
    { text: 'Altman, E. I. (1968). “Financial Ratios, Discriminant Analysis and the Prediction of Corporate Bankruptcy”. <i>Journal of Finance</i>, 23(4), 589–609 (issue page, American Finance Association).', url: 'https://afajof.org/issue/volume-23-issue-4/', checked: '2026-10-26' },
    { text: 'Altman, E. I. (2000). “Predicting Financial Distress of Companies: Revisiting the Z-Score and ZETA® Models”. Working paper, NYU Stern School of Business, July 2000 (university course mirror).', url: 'https://moodle2.units.it/pluginfile.php/322514/mod_resource/content/0/Zscores.pdf', checked: '2026-10-26' },
    { text: 'Altman, E. I. (2017). “The Evolution &amp; Applications of the Altman Z-Score Family of Models &amp; Global Credit Markets Commentary”. Presentation, Global Finance Conference, Hofstra University, 5 May 2017 (slides 11, 25, 27 and 28).', url: 'https://www.hofstra.edu/pdf/community/bdc/breslin/breslin-evolution-of-altman-z-score.pdf', checked: '2026-10-26' },
    { text: 'Altman, E. I. (2019). “50 Years of Altman Z-Score: What Have We Learned &amp; the Applications in Financial &amp; Managerial Markets”. Presentation, LSE Credit Seminar, 16 October 2019 (slide 10).', url: 'https://www.systemicrisk.ac.uk/sites/default/files/images/Evolution%20of%20Altman%20Z-Score.lse.pdf', checked: '2026-10-26' },
    { text: 'Starbucks Corporation (2024). Form 10-K for the fiscal year ended 29 September 2024: Consolidated Balance Sheets. SEC EDGAR.', url: 'https://www.sec.gov/Archives/edgar/data/829224/000082922424000057/R7.htm', checked: '2026-10-26' },
    { text: 'Starbucks Corporation (2024). Form 10-K for fiscal 2024: Consolidated Statements of Earnings (R3: operating income, interest expense) and Consolidated Statements of Cash Flows (R5: operating cash, dividends, repurchases). SEC EDGAR.', url: 'https://www.sec.gov/Archives/edgar/data/829224/000082922424000057/R5.htm', checked: '2026-10-26' },
    { text: 'Deloitte (2020). “FASB Issues ASU Providing Limited Effective-Date Delays for Guidance on Revenue and Leases”, 3 June 2020. DART.', url: 'https://dart.deloitte.com/USDART/home/publications/archive/deloitte-publications/news/2020/jun/fasb-asu-effective-date-delay-revenue-leases', checked: '2026-10-26' },
  ],

  checks: [
    // the model table (zones from core/ratios.js)
    { what: 'Z lower', value: W.z.zones[0], shown: 1.81 },
    { what: 'Z upper', value: W.z.zones[1], shown: 2.99 },
    { what: 'Z′ lower', value: W.zprime.zones[0], shown: 1.23 },
    { what: 'Z′ upper', value: W.zprime.zones[1], shown: 2.90 },
    { what: 'Z″ lower', value: W.zdouble.zones[0], shown: 1.10 },
    { what: 'Z″ upper', value: W.zdouble.zones[1], shown: 2.60 },
    { what: 'EM lower = Altman 2017 4.35', value: zone2(...W.zdouble.zones)[0], shown: 4.35 },
    { what: 'EM upper = Altman 2017 5.85', value: zone2(...W.zdouble.zones)[1], shown: 5.85 },
    { what: 'Z weights sum check', value: W.z.w.reduce((s, x) => s + x, 0), shown: 7.5 },
    { what: 'Z′ X4 weight', value: W.zprime.w[3], shown: 0.420 },
    { what: 'Z″ X1 weight', value: W.zdouble.w[0], shown: 6.56 },
    { what: 'Z″ X4 weight', value: W.zdouble.w[3], shown: 1.05 },
    { what: 'Sample size', value: 33 + 33, shown: 66 },
    { what: 'Sample years', value: 1965 - 1946, shown: 19 },
    // Lantern Z″
    { what: 'Z″ 2026', value: Z26.score, shown: 6.47 },
    { what: 'Z″ 2027', value: Z27.score, shown: 0.24 },
    { what: 'Z″ 2027 unrounded', value: Z27.score, shown: 0.2375, tol: 0.00005 },
    { what: 'Z″ 2026 X1', value: Z26.x[0], shown: 0.322, tol: 0.0005 },
    { what: 'Z″ 2026 X2', value: Z26.x[1], shown: 0.239, tol: 0.0005 },
    { what: 'Z″ 2026 X3', value: Z26.x[2], shown: 0.403, tol: 0.0005 },
    { what: 'Z″ 2026 X4', value: Z26.x[3], shown: 0.826, tol: 0.0005 },
    { what: 'term 2026 X1', value: Z26.terms[0], shown: 2.11 },
    { what: 'term 2026 X2', value: Z26.terms[1], shown: 0.78 },
    { what: 'term 2026 X3', value: Z26.terms[2], shown: 2.71 },
    { what: 'term 2026 X4', value: Z26.terms[3], shown: 0.87 },
    { what: 'Z″ 2027 X1', value: Z27.x[0], shown: -0.169, tol: 0.0005 },
    { what: 'Z″ 2027 X2', value: Z27.x[1], shown: 0.131, tol: 0.0005 },
    { what: 'Z″ 2027 X3', value: Z27.x[2], shown: 0.100, tol: 0.0005 },
    { what: 'Z″ 2027 X4', value: Z27.x[3], shown: 0.237, tol: 0.0005 },
    { what: 'term 2027 X1', value: Z27.terms[0], shown: -1.11 },
    { what: 'term 2027 X2', value: Z27.terms[1], shown: 0.43 },
    { what: 'term 2027 X3', value: Z27.terms[2], shown: 0.67 },
    { what: 'term 2027 X4', value: Z27.terms[3], shown: 0.25 },
    { what: 'rounded terms add', value: -1.11 + 0.43 + 0.67 + 0.25, shown: 0.24 },
    { what: 'Working capital 2027', value: P27.currentAssets - P27.currentLiabilities, shown: -55433 },
    { what: 'Current assets 2027', value: P27.currentAssets, shown: 59104 },
    { what: 'Current liabilities 2027', value: P27.currentLiabilities, shown: 114537 },
    { what: 'Total assets 2027', value: P27.totalAssets, shown: 327883 },
    { what: 'Total liabilities 2027', value: P27.totalLiabilities, shown: 265065 },
    { what: 'Retained earnings 2027', value: P27.retainedEarnings, shown: 42818 },
    { what: 'Equity 2027', value: P27.equity, shown: 62818 },
    { what: 'EBIT 2027', value: P27.ebit, shown: 32787 },
    { what: 'Total assets more than tripled', value: P27.totalAssets / P26.totalAssets, shown: 3.5, tol: 0.5 },
    { what: 'Lease liabilities', value: P27.leaseLiabilities, shown: 173379 },
    { what: 'Right-of-use asset', value: P27.rightOfUse, shown: 173379 },
    { what: 'Current lease liability', value: LEASE.current2027, shown: 37010 },
    { what: 'Contract asset', value: P27.contractAsset, shown: 30840 },
    // the constant and bond-rating equivalents
    { what: 'EM 2027', value: Z27.score + EM, shown: 3.49 },
    { what: 'EM 2027 (route)', value: 0.24 + 3.25, shown: 3.49 },
    { what: 'EM 2026', value: Z26.score + EM, shown: 9.72 },
    { what: 'BRE AAA', value: BRE.AAA, shown: 8.15 },
    { what: 'BRE BBB', value: BRE.BBB, shown: 5.85 },
    { what: 'BRE B−', value: BRE['B-'], shown: 3.75 },
    { what: 'BRE CCC+', value: BRE['CCC+'], shown: 3.20 },
    { what: 'BRE D', value: BRE.D, shown: 0 },
    { what: 'Lantern 2027 between CCC+ and B−', value: Z27.score + EM > BRE['CCC+'] && Z27.score + EM < BRE['B-'] ? 1 : 0, shown: 1 },
    { what: 'Lantern 2026 above AAA', value: Z26.score + EM > BRE.AAA ? 1 : 0, shown: 1 },
    { what: 'Original cut-off', value: 2.675, shown: 2.675, tol: 0.0005 },
    { what: '1968 weight X1 as percentage form', value: 1.2 / 100, shown: 0.012, tol: 0.00005 },
    { what: '1968 weight X5', value: 0.999, shown: 0.999, tol: 0.0005 },
    // Z′
    { what: 'Z′ 2027', value: ZP27.score, shown: 2.16 },
    { what: 'Z′ 2027 zone grey', value: ZP27.zone === 'grey' ? 1 : 0, shown: 1 },
    { what: 'Z′ 2027 sales term', value: ZP27.terms[4], shown: 1.76 },
    { what: 'Revenue 2027', value: P27.revenue, shown: 577860 },
    { what: 'Z′ 2026 safe', value: ZP26.zone === 'safe' ? 1 : 0, shown: 1 },
    // Harbourline
    { what: 'Harbourline Z', value: HZ.score, shown: 3.04 },
    { what: 'Harbourline Z′', value: HZP.score, shown: 1.90 },
    { what: 'Harbourline Z″', value: HZD.score, shown: 2.98 },
    { what: 'Harbourline market cap', value: H.sharePrice * H.shares, shown: 765 },
    { what: 'Harbourline liabilities', value: HB.totalLiabilities, shown: 360 },
    { what: 'Harbourline equity', value: HD.bookEquity, shown: 300 },
    { what: 'Market ÷ book', value: H.sharePrice * H.shares / HD.bookEquity, shown: 2.5, tol: 0.06 },
    { what: 'H X1', value: HZ.x[0], shown: 0.091, tol: 0.0005 },
    { what: 'H X2', value: HZ.x[1], shown: 0.273, tol: 0.0005 },
    { what: 'H X3', value: HZ.x[2], shown: 0.092, tol: 0.0005 },
    { what: 'H X4 market', value: HZ.x[3], shown: 2.125, tol: 0.0005 },
    { what: 'H X4 book', value: HZP.x[3], shown: 0.833, tol: 0.0005 },
    { what: 'H X5', value: HZ.x[4], shown: 0.970, tol: 0.0005 },
    { what: 'H above 2.99 by', value: HZ.score - W.z.zones[1], shown: 0.05, tol: 0.006 },
    { what: 'H EBIT % assets', value: H.ebit / HD.totalAssets * 100, shown: 9, tol: 0.5 },
    { what: 'H X4 if shares halve', value: H.sharePrice * H.shares / 2 / HB.totalLiabilities, shown: 1.06, tol: 0.005 },
    { what: 'H Z if shares halve', value: R.altman({ ...HB, marketEquity: HB.marketEquity / 2 }, 'z').score, shown: 2.40 },
    { what: 'H Z if shares halve is grey', value: R.altman({ ...HB, marketEquity: HB.marketEquity / 2 }, 'z').zone === 'grey' ? 1 : 0, shown: 1 },
    { what: 'H interest cover', value: H.ebit / HD.interest, shown: 5.5, tol: 0.06 },
    { what: 'H Z″ RE 0', value: HZD0.score, shown: 2.09 },
    { what: 'H Z RE 0', value: HZ0.score, shown: 2.66 },
    { what: 'H Z RE 300', value: HZ300.score, shown: 3.30 },
    { what: 'H RE threshold', value: HREsafe, shown: 156, tol: 0.5 },
    { what: 'Sample asset range low', value: 1, shown: 1 },
    { what: 'Sample asset range high', value: 25, shown: 25 },
    { what: 'H Z″ RE 300', value: HZD300.score, shown: 3.57 },
    { what: 'H share price', value: H.sharePrice, shown: 42.5 },
    { what: 'H shares', value: H.shares, shown: 18 },
    // leases
    { what: 'No-lease total assets', value: NL.totalAssets, shown: 154504 },
    { what: 'No-lease current liabilities', value: NL.currentLiabilities, shown: 77527 },
    { what: 'No-lease total liabilities', value: NL.totalLiabilities, shown: 91686 },
    { what: 'No-lease working capital', value: NL.currentAssets - NL.currentLiabilities, shown: -18423 },
    { what: 'No-lease X1', value: ZNL.x[0], shown: -0.119, tol: 0.0005 },
    { what: 'No-lease X2', value: ZNL.x[1], shown: 0.277, tol: 0.0005 },
    { what: 'No-lease X3', value: ZNL.x[2], shown: 0.212, tol: 0.0005 },
    { what: 'No-lease X4', value: ZNL.x[3], shown: 0.685, tol: 0.0005 },
    { what: 'No-lease terms', value: ZNL.terms[0], shown: -0.78 },
    { what: 'No-lease term 2', value: ZNL.terms[1], shown: 0.90 },
    { what: 'No-lease term 3', value: ZNL.terms[2], shown: 1.43 },
    { what: 'No-lease term 4', value: ZNL.terms[3], shown: 0.72 },
    { what: 'No-lease Z″', value: ZNL.score, shown: 2.27 },
    { what: 'Lease effect on the score', value: ZNL.score - Z27.score, shown: 2.03 },
    { what: 'Lease cost', value: LEASE.cost2027, shown: 40000 },
    { what: 'Monthly payment', value: LEASE.payment, shown: 4000 },
    { what: 'Annualised 2026 Z″', value: ZA26.score, shown: 7.01 },
    // Starbucks
    { what: 'Starbucks Z″', value: SBZ.score, shown: -0.27 },
    { what: 'Starbucks retained deficit', value: -SB.retainedEarnings, shown: 7343.8 },
    { what: 'Starbucks deficit', value: -SB.equity, shown: 7441.6 },
    { what: 'Starbucks dividends', value: SB.dividends, shown: 2585.0 },
    { what: 'Starbucks buybacks', value: SB.buybacks, shown: 1266.7 },
    { what: 'Starbucks CFO', value: SB.cfo, shown: 6095.6 },
    { what: 'Starbucks operating income', value: SB.ebit, shown: 5408.8 },
    { what: 'Starbucks interest', value: SB.interest, shown: 562.0 },
    { what: 'Starbucks coverage', value: SB.ebit / SB.interest, shown: 9.62 },
    // other years
    { what: 'Ohlson year', value: 1980, shown: 1980 },
  ],
};
