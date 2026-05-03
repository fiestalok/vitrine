import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Review } from '../data/types';
import { loadJSON, saveJSON } from '../lib/storage';

const STORAGE_KEY = 'fiestalok.reviews.v1';

interface ReviewsContextValue {
  reviews: Review[];
  forProduct: (productId: string) => Review[];
  add: (review: Omit<Review, 'id' | 'date'>) => void;
}

const ReviewsContext = createContext<ReviewsContextValue | null>(null);

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>(() => loadJSON<Review[]>(STORAGE_KEY, []));
  useEffect(() => { saveJSON(STORAGE_KEY, reviews); }, [reviews]);

  const value = useMemo<ReviewsContextValue>(() => ({
    reviews,
    forProduct: (id) => reviews.filter((r) => r.productId === id),
    add: (r) => setReviews((prev) => [
      ...prev,
      { ...r, id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10) },
    ]),
  }), [reviews]);

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}

export function useReviews(): ReviewsContextValue {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error('useReviews must be used within a ReviewsProvider');
  return ctx;
}
