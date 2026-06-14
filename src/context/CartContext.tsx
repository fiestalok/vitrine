import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem } from '../data/types';

const STORAGE_KEY = 'hoplalok.cart.v2';
const TTL_MS = 24 * 60 * 60 * 1000;

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const { items, savedAt } = JSON.parse(raw);
    if (Date.now() - savedAt > TTL_MS) { localStorage.removeItem(STORAGE_KEY); return []; }
    return items ?? [];
  } catch { return []; }
}

function saveCart(items: CartItem[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, savedAt: Date.now() })); } catch {}
}

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
  const [items, setItems] = useState<CartItem[]>(loadCart);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => { saveCart(items); }, [items]);

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
