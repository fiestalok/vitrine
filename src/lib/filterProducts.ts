import type { Product } from '../data/types';
import type { Audience, CategoryId } from '../data/categories';

export interface FilterState {
  category: CategoryId | 'all';
  audiences: Audience[];
  maxPrice: number;
  sort: 'default' | 'price-asc' | 'price-desc' | 'rating';
}

export const DEFAULT_FILTERS: FilterState = {
  category: 'all',
  audiences: [],
  maxPrice: 400,
  sort: 'default',
};

export function filterProducts(products: Product[], f: FilterState): Product[] {
  let out = products.filter((p) => {
    if (f.category !== 'all' && p.category !== f.category) return false;
    if (f.audiences.length > 0 && !f.audiences.some((a) => p.audiences.includes(a))) return false;
    if (p.price > f.maxPrice) return false;
    return true;
  });
  switch (f.sort) {
    case 'price-asc':  out = [...out].sort((a, b) => a.price - b.price); break;
    case 'price-desc': out = [...out].sort((a, b) => b.price - a.price); break;
    case 'rating':     out = [...out].sort((a, b) => b.rating - a.rating); break;
  }
  return out;
}
