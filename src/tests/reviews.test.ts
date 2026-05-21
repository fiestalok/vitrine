import { describe, it, expect, beforeEach } from 'vitest';
import { reviewsStore, addReview, getReviewsForProduct } from '../stores/reviews';

describe('reviewsStore', () => {
  beforeEach(() => {
    localStorage.clear();
    reviewsStore.set([]);
  });

  it('ajoute un avis avec id et date', () => {
    addReview({ productId: 'chateau-royal', author: 'Marie', rating: 5, comment: 'Super !' });
    const reviews = reviewsStore.get();
    expect(reviews).toHaveLength(1);
    expect(reviews[0].id).toMatch(/^[0-9a-f-]{36}$/);
    expect(reviews[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(reviews[0].productId).toBe('chateau-royal');
  });

  it('filtre les avis par produit', () => {
    addReview({ productId: 'chateau-royal', author: 'Marie', rating: 5, comment: 'Super !' });
    addReview({ productId: 'machine-popcorn', author: 'Jean', rating: 4, comment: 'Bien' });
    const filtered = getReviewsForProduct('chateau-royal');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].productId).toBe('chateau-royal');
  });

  it('retourne un tableau vide si aucun avis pour ce produit', () => {
    expect(getReviewsForProduct('inexistant')).toHaveLength(0);
  });
});
