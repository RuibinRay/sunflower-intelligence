// Lesson: needs-based segmentation, profiles against the average, and choosing a target.
import * as F from '../../core/format.js?v=9';

export default {
  id: 'segment',
  title: 'Segmentation and targeting',
  minutes: 7,
  hook: 'Split a market into groups that want different things, describe each group against the average customer, and choose the one you can serve best.',
  idea: [
    'A <b>needs-based segmentation</b> groups customers by what they value, using survey ratings such as price, quality or convenience. Each rating is first <b>standardised</b>, (answer − mean) ÷ standard deviation, so a 1–10 question doesn’t outweigh a 1–5 one. Then k-means puts respondents who answered alike in the same segment.',
    'k-means returns as many groups as you ask for, structure or not, so choose the number with the <b>silhouette</b>: how much closer each respondent sits to its own segment than to the next. Above 0.5 is clear structure, 0.25 to 0.5 weak, and below 0.25 the segments are a convenient cut rather than a discovery.',
    'Describe each segment with an <b>index</b> against the average respondent, segment mean ÷ overall mean × 100. Then size it in people and in spend, and score how well its needs fit what you do well. The target is a segment that is big enough, spends enough and wants your strengths.',
  ],
  formula: {
    html: 'z = <span class="frac"><span>answer − mean</span><span>standard deviation</span></span>,&ensp; index = <span class="frac"><span>segment mean</span><span>overall mean</span></span> × 100,&ensp; spend per head = <span class="frac"><span>share of spend</span><span>share of people</span></span> × average spend',
    terms: [
      ['z', 'a standardised answer: how many standard deviations from the average'],
      ['index', '100 = the average respondent; 140 = 40% above it'],
      ['silhouette', 'from −1 to 1: how clearly respondents separate into the segments'],
    ],
  },
  example: {
    setup: 'A survey of 600 shoppers rates how much price matters, from 1 to 7: the average answer is 4.6 with a standard deviation of 1.5. Average spend is $241 a year. One segment, “Price first”, holds 26% of respondents and 13% of spend, and its mean price rating is 6.3.',
    steps: [
      'A shopper who rates price 6 has z = (6 − 4.6) ÷ 1.5 = <b>0.93</b>, almost one standard deviation above average. k-means works on these z-scores.',
      'The segment’s price index: 6.3 ÷ 4.6 × 100 = <b>137</b>. It cares about price 37% more than the average respondent.',
      'Spend per head: 13% ÷ 26% = <b>0.5</b> of the average, or 0.5 × $241 = <b>$120.50</b> a year.',
      'Another segment has 15% of the people and 28% of spend: 28 ÷ 15 = <b>1.87</b> times the average, about <b>$450</b> a head, or <b>3.7</b> times what “Price first” spends per person.',
    ],
    result: 'The biggest segment is not automatically the best target. “Price first” is the largest but spends half the average, and if your strength is quality rather than price it also plays to your weakness.',
  },
  mistake: {
    title: 'Grouping on raw answers',
    html: 'Say spend has a standard deviation of $150 and a rating one of 1.5. A typical difference in spend then adds 150² = 22,500 to a squared distance, and a typical difference in a rating only 1.5² = 2.25: ten thousand times less. Unstandardised, k-means splits shoppers by spend alone. Standardise the ratings, and use spend to size segments, not to find them.',
  },
  remember: [
    'Standardise the answers, let k-means group respondents who answered alike, choose the number of segments with the silhouette, and check the groups make business sense.',
    'Index = segment mean ÷ overall mean × 100. Read a profile by what stands out from 100.',
    'Target on size, spend per head and fit together. Spend per head = share of spend ÷ share of people × average spend.',
  ],
  calc: {
    title: 'Read one segment',
    intro: 'One need and the segment’s size, against the average respondent.',
    inputs: [
      { id: 'seg', label: 'Segment’s mean rating', min: 1, max: 7, step: 0.1, value: 6.3, fmt: 'num', digits: 1 },
      { id: 'all', label: 'Everyone’s mean rating', min: 1, max: 7, step: 0.1, value: 4.6, fmt: 'num', digits: 1 },
      { id: 'people', label: 'Share of respondents', min: 1, max: 60, step: 1, value: 26, fmt: 'pct' },
      { id: 'spend', label: 'Share of spend', min: 1, max: 60, step: 1, value: 13, fmt: 'pct' },
      { id: 'avg', label: 'Average spend a year', min: 50, max: 1000, step: 1, value: 241, fmt: 'money' },
    ],
    compute({ seg, all, people, spend, avg }) {
      const index = (seg / all) * 100, head = spend / people;
      const need = index >= 120 ? 'cares much more than average about this need' : index <= 80 ? 'cares much less than average about this need' : 'is close to average on this need';
      const value = head >= 1.2 ? 'and spends well above average per person' : head <= 0.8 ? 'and spends below average per person' : 'and spends about the average per person';
      return {
        headline: { value: F.int(index), label: 'index for this need (100 = average)' },
        rows: [['Spend per head, against average', `${F.num(head, 2)}×`], ['Spend per head', F.money(head * avg, { digits: 2 })], ['Gap from the average rating', `${F.signed(seg - all, 1)} points`]],
        note: `This segment ${need}, ${value}.`,
      };
    },
  },
  tool: { href: 'marketing/segmentation/#needs', label: 'Segment by needs, in Marketing › Market segmentation' },
  checks: [
    { what: 'z', value: (6 - 4.6) / 1.5, shown: 0.93, tol: 0.005 },
    { what: 'index', value: (6.3 / 4.6) * 100, shown: 137, tol: 0.5 },
    { what: 'per head ratio', value: 13 / 26, shown: 0.5, tol: 1e-9 },
    { what: 'per head $', value: (13 / 26) * 241, shown: 120.5, tol: 1e-9 },
    { what: 'other ratio', value: 28 / 15, shown: 1.87, tol: 0.005 },
    { what: 'other $', value: (28 / 15) * 241, shown: 450, tol: 0.5 },
    { what: 'times Price first', value: (28 / 15) / (13 / 26), shown: 3.7, tol: 0.05 },
    { what: 'spend squared', value: 150 ** 2, shown: 22500, tol: 0 },
    { what: 'rating squared', value: 1.5 ** 2, shown: 2.25, tol: 0 },
    { what: 'ratio', value: 150 ** 2 / 1.5 ** 2, shown: 10000, tol: 1e-6 },
  ],
};
