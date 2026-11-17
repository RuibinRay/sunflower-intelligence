// present-and-future-value.video.js — F04 · the authored opening of this lesson's video. It replaces the generated
// "The idea" chapter (the Lantern case paragraph) with the same case told for the ear, and acts out the lesson's
// first figure: the $10,000 repayment moved back to today one quarter at a time. The rest of the video is generated
// from the lesson. Every amount said or shown is recomputed in `checks` (tests/video.test.mjs runs them).
const r = 0.08 / 4;
const at = (q) => 10000 / (1 + r) ** (4 - q);   // the repayment's value at quarter q (quarter 4 = 1 March 2028)
const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default {
  chapters: [
    {
      id: 'two-repayments', title: 'Two payments of $10,000', replace: 'idea',
      // the replaced chapter is the lesson's opening case; its facts must all be said (checked by the tests)
      covers: ['concept[0]'],
      scenes: [
        {
          kind: 'case', kicker: 'Fictional case', head: 'Two amounts of $10,000. Are they worth the same?',
          segs: [
            { say: 'It is March 2027, and Lantern Coffee Co. has been trading for a year. On Ana’s desk are two amounts, both of $10,000, and they are not worth the same.' },
            { say: 'One is cash in Lantern’s bank account today. The other is the $10,000 Lantern must repay Coastline Bank on 1 March 2028, when its two-year note matures.' },
            { say: 'Lantern borrowed in March 2026 at 6% a year. Rates have risen since then: a similar loan now costs 8% a year, compounded quarterly. Like everything about Coastline, that rate is fictional.' },
            { say: 'So what is next year’s repayment worth in today’s money? Less than $10,000. Working out how much less is what this lesson is about.' },
          ],
        },
        {
          kind: 'visual', kicker: 'Draw the timeline first', head: 'Move the repayment back one quarter at a time',
          visual: {
            kind: 'timeline', periods: 4, factor: '÷ 1.02',
            marks: [
              { p: 0, label: '1 Mar 2027', sub: 'today' }, { p: 1, label: '1 Jun 2027' }, { p: 2, label: '1 Sep 2027' },
              { p: 3, label: '1 Dec 2027' }, { p: 4, label: '1 Mar 2028', sub: 'repayment' },
            ],
            values: [4, 3, 2, 1, 0].map((q) => ({ p: q, label: money(at(q)), final: q === 0 })),
          },
          segs: [
            { step: 0, say: 'Draw the timeline first. Today, 1 March 2027, is quarter 0. The repayment sits four quarters away, at quarter 4. Interest is compounded quarterly, so the rate per quarter is 8% divided by 4, which is 2%.' },
            { step: 1, say: `Moving the amount back one quarter means dividing by 1.02. On 1 December 2027 it is worth ${money(at(3))}.` },
            { step: 2, say: `Back another quarter, to 1 September: ${money(at(2))}.` },
            { step: 3, say: `To 1 June: ${money(at(1))}.` },
            { step: 4, say: `And to today: ${money(at(0))}. That is the present value, $10,000 divided by 1.02 to the power 4.` },
            { step: 4, say: `Read it the other way round: ${money(at(0))} invested today at 2% a quarter grows to exactly $10,000 by 1 March 2028. The rest of this video shows why, and how to do the same for any amount, any rate and any pair of dates.` },
          ],
        },
      ],
    },
  ],
  checks: [
    { what: 'Rate per quarter (%)', value: r * 100, shown: 2 },
    { what: 'Value on 1 December 2027', value: at(3), shown: 9803.92 },
    { what: 'Value on 1 September 2027', value: at(2), shown: 9611.69 },
    { what: 'Value on 1 June 2027', value: at(1), shown: 9423.22 },
    { what: 'Present value on 1 March 2027', value: at(0), shown: 9238.45 },
    { what: 'Growing it back: 9,238.45 × 1.02⁴', value: 9238.45 * 1.02 ** 4, shown: 10000, tol: 0.01 },
  ],
};
