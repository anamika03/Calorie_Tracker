export type Tier = { id: string; label: string; color: string };

export const tiers: Tier[] = [
  { id: 'S', label: 'S', color: '#dc4a40' },
  { id: 'A', label: 'A', color: '#e8702f' },
  { id: 'B', label: 'B', color: '#ddab3a' },
  { id: 'C', label: 'C', color: '#3f9447' },
  { id: 'D', label: 'D', color: '#3a7bd5' },
];

export const UNRANKED = 'unranked';
