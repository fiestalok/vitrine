import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe('CartContext', () => {
  beforeEach(() => localStorage.clear());

  it('starts empty', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
  });

  it('adds an item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.add({ productId: '1', startDate: null, endDate: null, quantity: 1 }));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(1);
  });

  it('increments quantity when adding the same product', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.add({ productId: '1', startDate: null, endDate: null, quantity: 1 }));
    act(() => result.current.add({ productId: '1', startDate: null, endDate: null, quantity: 2 }));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3);
  });

  it('removes an item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.add({ productId: '1', startDate: null, endDate: null, quantity: 1 }));
    act(() => result.current.remove('1'));
    expect(result.current.items).toEqual([]);
  });

  it('persists across remounts via localStorage', () => {
    const first = renderHook(() => useCart(), { wrapper });
    act(() => first.result.current.add({ productId: '1', startDate: null, endDate: null, quantity: 2 }));
    const second = renderHook(() => useCart(), { wrapper });
    expect(second.result.current.items[0].quantity).toBe(2);
  });
});
