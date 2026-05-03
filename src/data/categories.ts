export type CategoryId = string;

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
}

export const AUDIENCES = ['enfants', 'adultes', 'entreprises'] as const;
export type Audience = typeof AUDIENCES[number];
