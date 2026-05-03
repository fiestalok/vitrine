import { describe, it, expect } from 'vitest';
import { filterProducts, DEFAULT_FILTERS } from '../lib/filterProducts';
import type { Product } from '../data/types';

const SAMPLE: Product[] = [
  { id: '1', name: 'Château', category: 'chateau-gonflable', audiences: ['enfants'], shortDescription: '', longDescription: '', price: 120, rating: 4.5, reviewCount: 2, specs: {}, images: [], badge: null },
  { id: '2', name: 'Sono',    category: 'enceintes',         audiences: ['adultes', 'entreprises'], shortDescription: '', longDescription: '', price: 60,  rating: 4.8, reviewCount: 5, specs: {}, images: [], badge: null },
  { id: '3', name: 'BBQ',     category: 'restauration',      audiences: ['adultes'], shortDescription: '', longDescription: '', price: 90, rating: 4.2, reviewCount: 1, specs: {}, images: [], badge: null },
];

describe('filterProducts', () => {
  it('returns everything by default', () => {
    expect(filterProducts(SAMPLE, DEFAULT_FILTERS)).toHaveLength(3);
  });
  it('filters by category', () => {
    expect(filterProducts(SAMPLE, { ...DEFAULT_FILTERS, category: 'enceintes' })).toEqual([SAMPLE[1]]);
  });
  it('filters by audience (OR)', () => {
    const out = filterProducts(SAMPLE, { ...DEFAULT_FILTERS, audiences: ['enfants'] });
    expect(out).toEqual([SAMPLE[0]]);
  });
  it('filters by max price', () => {
    const out = filterProducts(SAMPLE, { ...DEFAULT_FILTERS, maxPrice: 80 });
    expect(out).toEqual([SAMPLE[1]]);
  });
  it('sorts by price asc', () => {
    const out = filterProducts(SAMPLE, { ...DEFAULT_FILTERS, sort: 'price-asc' });
    expect(out.map((p) => p.id)).toEqual(['2', '3', '1']);
  });
  it('sorts by rating desc', () => {
    const out = filterProducts(SAMPLE, { ...DEFAULT_FILTERS, sort: 'rating' });
    expect(out.map((p) => p.id)).toEqual(['2', '1', '3']);
  });
});
