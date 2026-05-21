import { describe, it, expect, beforeEach } from 'vitest';
import { cartStore, addToCart, removeFromCart, setCartQuantity, clearCart, openCart, closeCart } from '../stores/cart';

describe('cartStore', () => {
  beforeEach(() => {
    localStorage.clear();
    cartStore.set({ items: [], isOpen: false });
  });

  it('ajoute un article', () => {
    addToCart({ productId: 'chateau-royal', quantity: 1, startDate: null, endDate: null });
    expect(cartStore.get().items).toHaveLength(1);
    expect(cartStore.get().items[0].productId).toBe('chateau-royal');
  });

  it('incrémente la quantité si déjà présent', () => {
    addToCart({ productId: 'chateau-royal', quantity: 1, startDate: null, endDate: null });
    addToCart({ productId: 'chateau-royal', quantity: 2, startDate: null, endDate: null });
    expect(cartStore.get().items).toHaveLength(1);
    expect(cartStore.get().items[0].quantity).toBe(3);
  });

  it('supprime un article', () => {
    addToCart({ productId: 'chateau-royal', quantity: 1, startDate: null, endDate: null });
    removeFromCart('chateau-royal');
    expect(cartStore.get().items).toHaveLength(0);
  });

  it('modifie la quantité', () => {
    addToCart({ productId: 'chateau-royal', quantity: 1, startDate: null, endDate: null });
    setCartQuantity('chateau-royal', 4);
    expect(cartStore.get().items[0].quantity).toBe(4);
  });

  it('supprime si quantité ≤ 0', () => {
    addToCart({ productId: 'chateau-royal', quantity: 1, startDate: null, endDate: null });
    setCartQuantity('chateau-royal', 0);
    expect(cartStore.get().items).toHaveLength(0);
  });

  it('vide le panier', () => {
    addToCart({ productId: 'chateau-royal', quantity: 1, startDate: null, endDate: null });
    addToCart({ productId: 'machine-popcorn', quantity: 2, startDate: null, endDate: null });
    clearCart();
    expect(cartStore.get().items).toHaveLength(0);
  });

  it('ouvre et ferme le panier', () => {
    openCart();
    expect(cartStore.get().isOpen).toBe(true);
    closeCart();
    expect(cartStore.get().isOpen).toBe(false);
  });
});
