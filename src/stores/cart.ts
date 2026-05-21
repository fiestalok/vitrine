import { persistentAtom } from '@nanostores/persistent';
import type { CartItem } from '../data/types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
}

export const cartStore = persistentAtom<CartStore>(
  'fiestalok.cart.v1',
  { items: [], isOpen: false },
  { encode: JSON.stringify, decode: JSON.parse }
);

export function addToCart(incoming: CartItem) {
  const { items } = cartStore.get();
  const existing = items.find((i) => i.productId === incoming.productId);
  if (existing) {
    cartStore.set({
      ...cartStore.get(),
      items: items.map((i) =>
        i.productId === incoming.productId
          ? {
              ...i,
              quantity: i.quantity + incoming.quantity,
              startDate: incoming.startDate ?? i.startDate,
              endDate: incoming.endDate ?? i.endDate,
            }
          : i
      ),
    });
  } else {
    cartStore.set({ ...cartStore.get(), items: [...items, incoming] });
  }
}

export function removeFromCart(productId: string) {
  cartStore.set({
    ...cartStore.get(),
    items: cartStore.get().items.filter((i) => i.productId !== productId),
  });
}

export function setCartQuantity(productId: string, qty: number) {
  // qty ≤ 0 removes the item (intentional — CartDrawer guards the button)
  if (qty <= 0) {
    removeFromCart(productId);
    return;
  }
  cartStore.set({
    ...cartStore.get(),
    items: cartStore.get().items.map((i) =>
      i.productId === productId ? { ...i, quantity: qty } : i
    ),
  });
}

export function clearCart() {
  cartStore.set({ ...cartStore.get(), items: [] });
}

export function openCart() {
  cartStore.set({ ...cartStore.get(), isOpen: true });
}

export function closeCart() {
  cartStore.set({ ...cartStore.get(), isOpen: false });
}
