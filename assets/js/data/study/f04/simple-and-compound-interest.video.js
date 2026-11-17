// simple-and-compound-interest.video.js — F04 · an authored chapter for this lesson's video: simple and compound
// interest race for 30 years on $10,000 at 6% (the rate on Lantern's note), so the gap the lesson explains is seen
// before it is derived. It is labelled an illustration: Lantern's note is paid off in two years. The lesson's own
// chapters follow unchanged. Every amount is recomputed in `checks`.
const P = 10000, r = 0.06, YEARS = 30;
const simple = (t) => P * (1 + r * t);
const compound = (t) => P * (1 + r) ** t;
const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(Math.round(x * 100) / 100) ? 0 : 2, maximumFractionDigits: 2 })}`;
const years = Array.from({ length: YEARS + 1 }, (_, t) => t);

export default {
  chapters: [
    {
      id: 'thirty-year-race', title: 'Simple against compound: a 30-year race', after: 'idea',
      scenes: [
        {
          kind: 'visual', kicker: 'Illustration', head: '$10,000 at 6% a year for 30 years: simple versus compound',
          visual: {
            kind: 'growth', tick: 5, max: compound(YEARS),
            periods: years.map((t) => `Yr ${t}`),
            series: [
              { name: 'Simple interest', values: years.map(simple), labels: years.map((t) => money(simple(t))) },
              { name: 'Compound interest', values: years.map(compound), labels: years.map((t) => money(compound(t))) },
            ],
            upto: [0, 5, 10, 20, 30],
          },
          segs: [
            { step: 0, say: 'Here is the difference this lesson is about, as an illustration. Put $10,000 away at 6% a year, the rate on Lantern’s note, and leave it for 30 years.' },
            { step: 1, say: `With simple interest, $600 a year is paid on the $10,000 alone: after five years the money has grown to ${money(simple(5))}. With compound interest each year’s interest earns interest too, and it has grown to ${money(compound(5))}.` },
            { step: 2, say: `After ten years the gap is wider: ${money(simple(10))} against ${money(compound(10))}.` },
            { step: 3, say: `After twenty years: ${money(simple(20))} against ${money(compound(20))}.` },
            { step: 4, say: `After thirty years simple interest has grown the money to ${money(simple(30))}. Compound interest has grown it to ${money(compound(30))}, more than twice as much. Same rate, same years; the only difference is interest on interest.` },
          ],
        },
      ],
    },
  ],
  checks: [
    { what: 'Simple interest a year', value: P * r, shown: 600 },
    { what: 'Simple, 5 years', value: simple(5), shown: 13000 },
    { what: 'Compound, 5 years', value: compound(5), shown: 13382.26 },
    { what: 'Simple, 10 years', value: simple(10), shown: 16000 },
    { what: 'Compound, 10 years', value: compound(10), shown: 17908.48 },
    { what: 'Simple, 20 years', value: simple(20), shown: 22000 },
    { what: 'Compound, 20 years', value: compound(20), shown: 32071.35 },
    { what: 'Simple, 30 years', value: simple(30), shown: 28000 },
    { what: 'Compound, 30 years', value: compound(30), shown: 57434.91 },
    { what: 'Compound is more than twice simple at 30 years (1 = yes)', value: compound(30) > 2 * simple(30) ? 1 : 0, shown: 1 },
  ],
};
