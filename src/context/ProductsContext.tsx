import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Product } from '../data/types';
import { fetchArticles } from '../lib/directus';

interface ProductsContextValue {
  products: Product[];
  loading: boolean;
}

const ProductsContext = createContext<ProductsContextValue>({ products: [], loading: true });

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProductsContext.Provider value={{ products, loading }}>
      {children}
    </ProductsContext.Provider>
  );
}

export const useProducts = () => useContext(ProductsContext);
