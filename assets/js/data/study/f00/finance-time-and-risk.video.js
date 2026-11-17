// finance-time-and-risk.video.js — F00 · an authored chapter for this lesson's video: right after Ana's case, her
// $20,000 is carried through three years at Coastline's 1.5% on a timeline, so the student sees compounding before
// reading about it. The lesson's own chapters follow unchanged. Every amount is recomputed in `checks`.
const r = 0.015;
const fv = (n) => 20000 * (1 + r) ** n;
const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(Math.round(x * 100) / 100) ? 0 : 2, maximumFractionDigits: 2 })}`;

export default {
  chapters: [
    {
      id: 'money-through-time', title: 'Ana’s $20,000 through time', after: 'idea',
      scenes: [
        {
          kind: 'visual', kicker: 'Money through time', head: 'What $20,000 of Ana’s savings becomes at 1.5% a year',
          visual: {
            kind: 'timeline', periods: 3, factor: '× 1.015',
            marks: [{ p: 0, label: 'Today', sub: 'January 2026' }, { p: 1, label: 'Year 1' }, { p: 2, label: 'Year 2' }, { p: 3, label: 'Year 3' }],
            values: [0, 1, 2, 3].map((n) => ({ p: n, label: money(fv(n)), final: n === 3 })),
          },
          segs: [
            { step: 0, say: 'Before the definitions, watch what time does to money. Take $20,000 of Ana’s savings and leave it in the Coastline Bank account at 1.5% a year.' },
            { step: 1, say: `After one year the bank adds $300 of interest, and the balance is ${money(fv(1))}.` },
            { step: 2, say: `In the second year the bank pays 1.5% on the whole ${money(fv(1))}, including last year’s interest, so the balance becomes ${money(fv(2))}. Earning interest on earlier interest is called compounding.` },
            { step: 3, say: `After three years it is ${money(fv(3))}. That is the future value of today’s $20,000.` },
            { step: 3, say: `Run the same arithmetic backwards and ${money(fv(3))} in three years is worth $20,000 today: its present value. Time is half of finance. Risk is the other half, and this lesson takes on both.` },
          ],
        },
      ],
    },
  ],
  checks: [
    { what: 'First year interest', value: fv(1) - 20000, shown: 300 },
    { what: 'Balance after one year', value: fv(1), shown: 20300 },
    { what: 'Balance after two years', value: fv(2), shown: 20604.5 },
    { what: 'Balance after three years', value: fv(3), shown: 20913.57 },
    { what: 'Discounting it back three years', value: 20913.57 / (1 + r) ** 3, shown: 20000, tol: 0.01 },
  ],
};
