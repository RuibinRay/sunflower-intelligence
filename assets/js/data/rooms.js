// rooms.js — the five doorways. One place to rename a room or change what its flower says.
export const ROOMS = [
  {
    id: 'finance', name: 'Finance', path: 'finance/', color: '#E8B923',
    chapter: 'An obsession with yellow',
    blurb: 'Value a business from its cash flows, and screen a company for financial distress.',
    where: 'the golden bloom at the centre',
  },
  {
    id: 'analytics', name: 'Business analytics', path: 'analytics/', color: '#192B49',
    chapter: 'The golden spiral',
    blurb: 'Check a table’s quality, describe it, find correlations, fit a regression and forecast the next season.',
    where: 'the dark-eyed bloom on the left',
  },
  {
    id: 'marketing', name: 'Marketing', path: 'marketing/', color: '#56632C',
    chapter: 'Personal identity',
    blurb: 'Segment customers, measure price sensitivity and test the unit economics of growth.',
    where: 'the head turned aside, on the right',
  },
  {
    id: 'models', name: 'How I build the models', path: 'models/', color: '#252A31',
    chapter: 'The cycle of life',
    blurb: 'The method behind every tool here, and a lab that shows why I hold data back.',
    where: 'the crown at the top',
  },
  {
    id: 'contact', name: 'Contact', path: 'contact/', color: '#F6E7C1',
    chapter: 'Gratitude and friendship',
    blurb: 'Write me a letter, or find me on LinkedIn and GitHub.',
    where: 'the seed head resting on the vase',
  },
  {
    id: 'learn', name: 'Learn', path: 'learn/', color: '#C96F36',
    chapter: 'Learning by doing',
    blurb: 'An adaptive check of where you stand, then practice that tracks what you’ve mastered and when to review it.',
    where: 'the open bloom right of the vase',
  },
];
export const byId = Object.fromEntries(ROOMS.map((r) => [r.id, r]));
