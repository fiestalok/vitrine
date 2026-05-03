export type CategoryId = 'chateau-gonflable' | 'accessoire' | 'restauration' | 'enceintes';

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
}

export const CATEGORIES: Category[] = [
  { id: 'chateau-gonflable', label: 'Château Gonflable', emoji: '🏰' },
  { id: 'accessoire',        label: 'Accessoire',        emoji: '🎭' },
  { id: 'restauration',      label: 'Restauration',      emoji: '🍴' },
  { id: 'enceintes',         label: 'Sono & Enceintes',  emoji: '🔊' },
];

export const AUDIENCES = ['enfants', 'adultes', 'entreprises'] as const;
export type Audience = typeof AUDIENCES[number];
