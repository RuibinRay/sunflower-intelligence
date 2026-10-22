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
    blurb: 'Check a table’s quality, then describe it, find correlations and fit a regression.',
    where: 'the dark-eyed bloom on the left',
  },
  {
    id: 'marketing', name: 'Marketing', path: 'marketing/', color: '#56632C',
    chapter: 'Personal identity',
    blurb: 'Segment customers by how recently, how often and how much they buy, and measure price sensitivity.',
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
];
export const byId = Object.fromEntries(ROOMS.map((r) => [r.id, r]));
