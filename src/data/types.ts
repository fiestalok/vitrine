import type { CategoryId, Audience } from './categories';

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  audiences: Audience[];
  shortDescription: string;
  longDescription: string;
  price: number;
  rating: number;
  reviewCount: number;
  specs: Record<string, string>;
  images: string[];
  badge: 'PROMO' | 'TOP VENTE' | 'NOUVEAU' | null;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  comment: string;
  date: string; // ISO
}

export interface CartItem {
  productId: string;
  startDate: string | null;
  endDate: string | null;
  quantity: number;
}
