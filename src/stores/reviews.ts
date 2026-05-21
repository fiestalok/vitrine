import { persistentAtom } from '@nanostores/persistent';
import type { Review } from '../data/types';

export const reviewsStore = persistentAtom<Review[]>(
  'fiestalok.reviews.v1',
  [],
  { encode: JSON.stringify, decode: JSON.parse }
);

export function addReview(review: Omit<Review, 'id' | 'date'>) {
  reviewsStore.set([
    ...reviewsStore.get(),
    {
      ...review,
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
    },
  ]);
}

export function getReviewsForProduct(productId: string): Review[] {
  return reviewsStore.get().filter((r) => r.productId === productId);
}
