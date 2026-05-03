import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem } from '../data/types';
import { loadJSON, saveJSON } from '../lib/storage';

const STORAGE_KEY = 'fiestalok.cart.v1';

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (item: CartItem) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadJSON<CartItem[]>(STORAGE_KEY, []));
  const [isOpen, setOpen] = useState(false);

  useEffect(() => { saveJSON(STORAGE_KEY, items); }, [items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    isOpen,
    open: () => setOpen(true),
    close: () => setOpen(false),
    add: (incoming) => setItems((prev) => {
      const existing = prev.find((i) => i.productId === incoming.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === incoming.productId
            ? { ...i, quantity: i.quantity + incoming.quantity, startDate: incoming.startDate ?? i.startDate, endDate: incoming.endDate ?? i.endDate }
            : i
        );
      }
      return [...prev, incoming];
    }),
    remove: (id) => setItems((prev) => prev.filter((i) => i.productId !== id)),
    setQuantity: (id, qty) => setItems((prev) => prev.map((i) => i.productId === id ? { ...i, quantity: Math.max(1, qty) } : i)),
    clear: () => setItems([]),
  }), [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
