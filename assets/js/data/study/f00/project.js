// project.js — F00 applied project: where Ana Lim should keep her $6,000 emergency fund for the next two years.
// Every fact comes from case.js (ANA, SAVINGS_CHOICES); every number is recomputed below and by `verify`.
import { ANA, SAVINGS_CHOICES as S, PROJECT_RESULTS as R } from './case.js?v=15';

const P = ANA.emergencyFund;                       // 6,000
const cd = S.cd.rate / 100, sav = S.savings.rate / 100, inf = S.inflation / 100;
const fvCd = P * (1 + cd) ** 2;                    // 6,489.60
const fvSav = P * (1 + sav / 12) ** 24;            // 6,396.01
const ear = ((1 + sav / 12) ** 12 - 1) * 100;      // 3.2474 %
const realCd = ((1 + cd) / (1 + inf) - 1) * 100;   // 1.1673 %
const realSav = ((1 + sav / 12) ** 12 / (1 + inf) - 1) * 100;   // 0.4352 %
const realOld = ((1 + ANA.savingsRate / 100) / (1 + inf) - 1) * 100;   // −1.2646 %
const todayCd = fvCd / (1 + inf) ** 2;             // 6,140.90 in today’s dollars
const penalty = P * cd / 2;                        // 120
const cdOut12 = P * (1 + cd) - penalty;            // 6,120
const savOut12 = P * (1 + sav / 12) ** 12;         // 6,194.84
const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CHOICES = {
  table: {
    caption: 'Ana’s two choices (fictional banks and rates)',
    head: ['', 'Two-year certificate of deposit', 'High-yield savings account'],
    rows: [
      ['Bank', 'Coastline Bank', 'Sandpiper Online'],
      ['Rate', '4.0% a year, fixed for two years', '3.2% a year, variable'],
      ['Interest paid', 'Once a year, added to the balance', 'Monthly, added to the balance'],
      ['Access', 'Locked for two years; early withdrawal costs six months’ interest', 'Withdraw any amount at any time'],
      ['Deposit insurance', 'FDIC-insured bank', 'FDIC-insured bank'],
    ],
    align: ['l', 'l', 'l'],
  },
};

export default {
  title: 'Two choices for Ana’s savings',
  brief: [
    { case: 'It is February 2026. On 1 March Ana Lim will put $20,000 of her $26,000 savings into Lantern Coffee Co. and give up her $52,000 salary to run it. She wants to keep the other $6,000 as an emergency fund for the next two years, in case the business is slow to pay her or something goes wrong at home. Today it sits in a Coastline Bank savings account paying 1.5% a year. She has narrowed the choice to two accounts and asked you which to use, and why, in words she can follow. The banks, rates and Ana are fictional.' },
    CHOICES,
    { p: 'Ana assumes inflation of 2.8% a year for the next two years. That is her working assumption, not a forecast. You will compare the choices on the four ideas this course is built on: time value (how much each grows), inflation (what the growth is worth in purchasing power), liquidity (what happens if she needs the money early) and risk (what could change). Then you will write her a short recommendation.' },
    { callout: 'note', title: 'Deposit insurance', html: 'In the United States, FDIC deposit insurance covers $250,000 per depositor, per FDIC-insured bank, for each account ownership category, and it covers savings accounts and certificates of deposit (FDIC, “Understanding Deposit Insurance”). Ana’s $6,000 is well inside the limit at either bank, so the risk of losing the money if a bank fails is not what separates the two choices.' },
  ],
  deliverables: [
    'The value of $6,000 after two years in each account, and the effective annual rate of the savings account.',
    'The real (after-inflation) return of each account and of Ana’s current account, and what the certificate’s balance is worth in today’s dollars.',
    'What Ana would get from each account if she needed all the money after one year.',
    'A recommendation to Ana of about 200–300 words that names the choice, gives the numbers that matter and says what would change your answer.',
  ],
  stages: [
    {
      id: 'compare', title: 'What each choice offers',
      html: '<p>Before any arithmetic, compare the two accounts on liquidity, risk and the kind of rate. An emergency fund exists to be there when something goes wrong, so liquidity matters as much as the rate.</p>',
      items: [
        { id: 'f00-pj-1', type: 'mc', kind: 'conceptual',
          prompt: 'Which account is more <b>liquid</b>?',
          options: ['The high-yield savings account', 'The certificate of deposit', 'They are equally liquid, because both are bank deposits'],
          answer: 0,
          feedback: { 1: 'The certificate pays more, but liquidity is how quickly and cheaply you can turn an asset into cash. The certificate charges six months’ interest to get out early.', 2: 'Both are safe deposits, but only one can be withdrawn at any time without a cost.' },
          solution: 'Liquidity is how quickly and cheaply an asset becomes cash. The savings account can be withdrawn at any time at no cost; the certificate locks the money for two years and charges six months’ interest to leave early. The savings account is more liquid.' },
        { id: 'f00-pj-2', type: 'classify', kind: 'conceptual',
          prompt: 'For each feature, say which account it applies to.',
          items: ['The rate could be cut next month', 'Ana pays a penalty if she needs the money before two years', 'Her rate stays at 4.0% even if market rates rise above it', 'She loses money if the bank fails'],
          categories: ['The certificate of deposit', 'The savings account', 'Neither, for Ana’s $6,000'],
          answer: [1, 0, 0, 2],
          feedback: { 0: 'The savings account’s rate is variable; the certificate’s is fixed for two years.', 2: 'The certificate’s rate is fixed for two years: if market rates rise, she is stuck at 4.0% (and if they fall, she keeps it).', 3: 'Both banks are FDIC-insured and $6,000 is far below the $250,000 limit, so neither exposes her to bank failure.' },
          solution: 'The savings rate is variable, so a rate cut is the savings account’s risk. The early-withdrawal penalty and the fixed 4.0%, which leaves her behind if market rates rise, belong to the certificate. Deposit insurance covers both accounts up to $250,000, so bank failure is not a risk for $6,000 in either.' },
        { id: 'f00-pj-3', type: 'mc', kind: 'applied',
          prompt: 'Ana’s money sits today in a savings account paying 1.5% a year. Why is “leave it where it is” weaker than either of the two accounts?',
          options: ['It earns less than inflation, so the money loses purchasing power every year, and it is no more liquid than the high-yield account', 'It is not insured', 'It cannot be withdrawn at short notice'],
          answer: 0,
          feedback: { 1: 'Nothing in the case says the current account is uninsured; it is at Coastline Bank like the certificate.', 2: 'A savings account is liquid; the problem is its rate.' },
          solution: 'At 1.5% against 2.8% inflation, the real return is about −1.26% a year: the money buys less each year. The high-yield account is just as liquid and pays 3.2%, so the current account is dominated.' },
      ],
    },
    {
      id: 'grow', title: 'How much each grows',
      html: '<p>Work out what $6,000 becomes after two years in each account. The certificate adds interest once a year; the savings account adds one-twelfth of the annual rate every month. Then put the savings account on the same footing as the certificate by finding its effective annual rate.</p>',
      items: [
        { id: 'f00-pj-4', type: 'num', kind: 'numerical', unit: '$', places: 2,
          prompt: 'What is the certificate worth after two years? (4.0% a year, compounded annually.)',
          answer: Math.round(fvCd * 100) / 100, check: () => 6000 * 1.04 * 1.04, tol: 0.01,
          wrong: [{ value: 6480, say: 'That is simple interest: $240 a year for two years. In the second year the certificate also earns interest on the first year’s $240.' }],
          solution: `Future value = 6,000 × 1.04² = 6,000 × 1.0816 = ${money(fvCd)}. The second year’s interest ($249.60) is larger than the first ($240) because it is earned on $6,240.` },
        { id: 'f00-pj-5', type: 'num', kind: 'numerical', unit: '$', places: 2,
          prompt: 'What is the savings account worth after two years if the rate stays at 3.2% a year, compounded monthly?',
          answer: Math.round(fvSav * 100) / 100, check: () => 6000 * (1 + 0.032 / 12) ** 24, tol: 0.02,
          wrong: [{ value: 6390.14, say: 'That compounds once a year at 3.2%. Here interest is added every month: 24 periods at 0.032 ÷ 12.' }, { value: 6384, say: 'That is simple interest. Interest is added to the balance every month and then earns interest itself.' }],
          solution: `Monthly rate = 0.032 ÷ 12 ≈ 0.002667; 24 months. Future value = 6,000 × (1.002667)²⁴ ≈ ${money(fvSav)}.` },
        { id: 'f00-pj-6', type: 'num', kind: 'numerical', unit: '%', places: 2,
          prompt: 'What is the savings account’s effective annual rate (the annual rate with monthly compounding included)?',
          answer: Math.round(ear * 100) / 100, check: () => ((1 + 0.032 / 12) ** 12 - 1) * 100, tol: 0.01,
          wrong: [{ value: 3.2, say: '3.2% is the stated (nominal) rate. Monthly compounding makes the effective rate a little higher.' }],
          solution: `EAR = (1 + 0.032 ÷ 12)¹² − 1 ≈ ${ear.toFixed(2)}%. Even with monthly compounding, the savings account pays less than the certificate’s 4.0%.` },
        { id: 'f00-pj-7', type: 'num', kind: 'numerical', unit: '$', places: 2,
          prompt: 'After two years, how much more does the certificate give Ana than the savings account (if neither rate changes and she withdraws nothing)?',
          answer: Math.round((fvCd - fvSav) * 100) / 100, check: () => 6000 * 1.04 ** 2 - 6000 * (1 + 0.032 / 12) ** 24, tol: 0.02,
          solution: `${money(fvCd)} − ${money(fvSav)} = ${money(fvCd - fvSav)}. That is the price of the savings account’s liquidity over two years, if rates stay where they are.` },
      ],
    },
    {
      id: 'real', title: 'After inflation',
      html: '<p>A balance that grows by 4% is not 4% richer if prices rise by 2.8%. Work out the real return of each account with the exact formula, (1 + nominal) ÷ (1 + inflation) − 1, using the effective annual rate for the savings account, and see what the certificate’s balance would buy in today’s prices.</p>',
      items: [
        { id: 'f00-pj-8', type: 'num', kind: 'numerical', unit: '%', places: 2,
          prompt: 'What is the certificate’s real return a year, with inflation at 2.8%?',
          answer: Math.round(realCd * 100) / 100, check: () => (1.04 / 1.028 - 1) * 100, tol: 0.01,
          wrong: [{ value: 1.2, say: '4.0 − 2.8 = 1.2 is the approximation. The exact real return divides: 1.04 ÷ 1.028 − 1.' }],
          solution: `Real return = 1.04 ÷ 1.028 − 1 ≈ ${realCd.toFixed(2)}% a year. The approximation 4.0 − 2.8 = 1.2% is close because both rates are small.` },
        { id: 'f00-pj-9', type: 'num', kind: 'numerical', unit: '%', places: 2,
          prompt: 'What is the savings account’s real return a year? Use its effective annual rate.',
          answer: Math.round(realSav * 100) / 100, check: () => ((1 + 0.032 / 12) ** 12 / 1.028 - 1) * 100, tol: 0.01,
          wrong: [{ value: 0.4, say: 'That uses the stated 3.2% and the approximation. Use the effective rate and divide.' }],
          solution: `Real return = (1 + ${(ear / 100).toFixed(6)}) ÷ 1.028 − 1 ≈ ${realSav.toFixed(2)}% a year.` },
        { id: 'f00-pj-10', type: 'num', kind: 'numerical', unit: '%', places: 2,
          prompt: 'And the real return of her current account at 1.5%?',
          answer: Math.round(realOld * 100) / 100, check: () => (1.015 / 1.028 - 1) * 100, tol: 0.01,
          wrong: [{ value: -1.3, say: '1.5 − 2.8 = −1.3 is the approximation. The exact real return divides: 1.015 ÷ 1.028 − 1.' }],
          solution: `1.015 ÷ 1.028 − 1 ≈ ${realOld.toFixed(2)}% a year: a loss of purchasing power.` },
        { id: 'f00-pj-11', type: 'num', kind: 'numerical', unit: '$', places: 2,
          prompt: 'What is the certificate’s balance after two years worth in today’s dollars (its purchasing power at the start)?',
          answer: Math.round(todayCd * 100) / 100, check: () => 6000 * 1.04 ** 2 / 1.028 ** 2, tol: 0.02,
          wrong: [{ value: 6144.86, say: 'That grows $6,000 at the approximate real rate of 1.2% (4.0 − 2.8). Divide the nominal balance by 1.028² instead.' }, { value: 6489.6, say: 'That is the balance in two years’ dollars. Divide by 1.028² to express it in today’s prices.' }],
          solution: `${money(fvCd)} ÷ 1.028² ≈ ${money(todayCd)}. In today’s prices, two years in the certificate adds about ${money(todayCd - P)} of purchasing power, not ${money(fvCd - P)}.` },
      ],
    },
    {
      id: 'early', title: 'If she needs the money early',
      html: '<p>An emergency fund is judged by what it delivers in an emergency. Suppose Lantern has a slow first year and Ana needs all $6,000 after exactly 12 months. The certificate has credited one year’s interest by then; taking the money out costs six months’ interest on the $6,000 (4.0% ÷ 2 × 6,000).</p>',
      items: [
        { id: 'f00-pj-12', type: 'num', kind: 'numerical', unit: '$', places: 2,
          prompt: 'How much does Ana get from the certificate if she withdraws everything after 12 months?',
          answer: Math.round(cdOut12 * 100) / 100, check: () => 6000 * 1.04 - 6000 * 0.04 / 2, tol: 0.01,
          wrong: [{ value: 6240, say: 'That ignores the early-withdrawal penalty of six months’ interest ($120).' }, { value: 5880, say: 'The penalty is subtracted from the balance including the year’s interest, not from the $6,000 alone.' }, { value: 6115.2, say: 'The penalty is six months’ interest on the $6,000 deposited (0.04 ÷ 2 × 6,000 = $120), not 2% of the $6,240 balance.' }],
          solution: `After a year the certificate holds 6,000 × 1.04 = $6,240. The penalty is six months’ interest: 6,000 × 0.04 ÷ 2 = $${penalty}. She receives $6,240 − $120 = ${money(cdOut12)}.` },
        { id: 'f00-pj-13', type: 'num', kind: 'numerical', unit: '$', places: 2,
          prompt: 'How much does she get from the savings account after 12 months (rate unchanged)?',
          answer: Math.round(savOut12 * 100) / 100, check: () => 6000 * (1 + 0.032 / 12) ** 12, tol: 0.02,
          wrong: [{ value: 6192, say: 'That is simple interest at 3.2%. Interest is added every month and then earns interest itself: 6,000 × (1 + 0.032 ÷ 12)¹².' }],
          solution: `6,000 × (1 + 0.032 ÷ 12)¹² ≈ ${money(savOut12)}, with no penalty.` },
        { id: 'f00-pj-14', type: 'mc', kind: 'applied',
          prompt: 'What do the two answers tell Ana?',
          options: ['The certificate wins if she leaves the money for two years; if she is likely to need it early, the savings account is better', 'The certificate always wins, because its 4.0% rate beats the 3.2% on the savings account, however soon she takes the money out', 'The savings account always wins, because being able to withdraw at any time is worth more than any difference in interest'],
          answer: 0,
          feedback: { 1: 'Over a full two years it does, by about $94. But an early withdrawal after 12 months leaves her about $75 worse off than in the savings account.', 2: 'Liquidity has a price: if she never touches the money, the certificate gives about $94 more.' },
          solution: `Held two years, the certificate gives ${money(fvCd - fvSav)} more. Withdrawn after one year, it gives ${money(savOut12 - cdOut12)} less. The better choice depends on how likely she is to need the money, which is exactly what an emergency fund is uncertain about.` },
      ],
    },
    {
      id: 'recommend', title: 'Recommend',
      html: '<p>Write Ana a recommendation she can act on. Use the numbers you worked out, but explain them in plain words. There is more than one defensible answer: what matters is that the choice follows from her situation and the evidence.</p>',
      items: [
        { id: 'f00-pj-15', type: 'short', kind: 'applied',
          prompt: 'Write your recommendation to Ana (about 200–300 words).',
          rubric: [
            'Names one choice (or a split between the two) and says why in the first two sentences.',
            'Uses the two-year values and the after-inflation returns, not only the stated rates.',
            'Weighs liquidity: what happens if she needs the money after a year, and how likely that is for someone starting a business.',
            'Mentions the savings account’s variable rate and the certificate’s fixed rate as a risk on each side.',
            'Says what would change the answer (for example, a separate cushion, or a sharp change in rates).',
            'Is written for Ana: short sentences, terms explained, no unexplained jargon.',
          ],
          model: `Keep the $6,000 in the Sandpiper Online savings account. It pays less than the certificate, but this money’s job is to be there in an emergency, and in your first two years of running Lantern an emergency is a real possibility.<br><br>If nothing goes wrong, the certificate would turn $6,000 into ${money(fvCd)} after two years and the savings account into about ${money(fvSav)}, a difference of about ${money(fvCd - fvSav)}. After 2.8% inflation, the certificate earns about ${realCd.toFixed(1)}% a year in real terms and the savings account about ${realSav.toFixed(1)}%. Both beat your current account, which loses about ${Math.abs(realOld).toFixed(1)}% a year of purchasing power.<br><br>The picture flips if you need the money early. After one year the certificate would pay ${money(cdOut12)} once the penalty of six months’ interest ($${penalty}) is taken, against ${money(savOut12)} from the savings account. If you needed the money in the first year, before any interest is credited, the $${penalty} would come out of your $6,000 itself. So the extra return from the certificate is small and only arrives if you never need the money.<br><br>Two risks to watch: the savings rate is variable and could be cut; the certificate’s 4.0% is fixed, which protects you if rates fall but leaves you behind if they rise. Both banks are FDIC-insured, so the $6,000 is safe either way.<br><br>What would change my advice: if you build a separate cushion of a few months’ costs elsewhere, you could put part of this fund, say half, in the certificate to earn more on money you are confident you won’t touch.`,
          solution: 'Compare your answer with the model and the rubric. A recommendation of the certificate can also earn full marks if it explains why Ana is unlikely to need the money and accepts the early-withdrawal cost.' },
      ],
    },
  ],
  rubric: [
    'Every dollar figure is correct to the cent and every rate to two decimal places, each labelled with what it is.',
    'The comparison uses time value, inflation, liquidity and risk, not the stated rate alone.',
    'The recommendation follows from Ana’s situation and says what would change it.',
    'Fictional facts (banks, rates, Ana) are presented as the case, not as real market information.',
  ],
  verify() {
    return [
      ['two-year certificate', fvCd, R.fvCd],
      ['two-year savings', fvSav, R.fvSavings],
      ['savings EAR', ear, R.earSavings, 1e-9],
      ['real certificate', realCd, R.realCd, 1e-9],
      ['real savings', realSav, R.realSavings, 1e-9],
      ['penalty', penalty, R.cdPenaltyYear1],
      ['certificate after 12 months', cdOut12, 6120],
      ['savings after 12 months', savOut12, 6194.84, 0.005],
      ['certificate in today’s dollars', todayCd, 6140.90, 0.005],
      ['difference two years', fvCd - fvSav, 93.59, 0.005],
      ['difference one year', savOut12 - cdOut12, 74.84, 0.005],
      ['real current account', realOld, -1.2646, 0.0001],
    ];
  },
};
