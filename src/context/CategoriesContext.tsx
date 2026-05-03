import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Category } from '../data/categories';
import { fetchCategories } from '../lib/directus';

interface CategoriesContextValue {
  categories: Category[];
  loading: boolean;
}

const CategoriesContext = createContext<CategoriesContextValue>({ categories: [], loading: true });

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CategoriesContext.Provider value={{ categories, loading }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export const useCategories = () => useContext(CategoriesContext);
