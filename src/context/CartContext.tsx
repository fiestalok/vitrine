import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem } from '../data/types';
import { loadJSON, saveJSON } from '../lib/storage';

const STORAGE_KEY = 'hoplalok.cart.v2';
const TTL_MS = 24 * 60 * 60 * 1000;

interface StoredCart { items: CartItem[]; savedAt: number; }

function loadCart(): CartItem[] {
  const stored = loadJSON<StoredCart | null>(STORAGE_KEY, null);
  if (!stored) return [];
  if (Date.now() - stored.savedAt > TTL_MS) { localStorage.removeItem(STORAGE_KEY); return []; }
  return stored.items ?? [];
}

function saveCart(items: CartItem[]): void {
  saveJSON<StoredCart>(STORAGE_KEY, { items, savedAt: Date.now() });
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (item: CartItem) => void;
  remove: (productId: string) => void;
  removeItems: (productIds: string[]) => void;
  setQuantity: (productId: string, quantity: number) => void;
  updateDates: (startDate: string, endDate: string) => void;
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
    removeItems: (ids) => setItems((prev) => prev.filter((i) => !ids.includes(i.productId))),
    setQuantity: (id, qty) => setItems((prev) => prev.map((i) => i.productId === id ? { ...i, quantity: Math.max(1, qty) } : i)),
    updateDates: (startDate, endDate) => setItems((prev) => prev.map((i) => ({ ...i, startDate, endDate }))),
    clear: () => setItems([]),
  }), [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
