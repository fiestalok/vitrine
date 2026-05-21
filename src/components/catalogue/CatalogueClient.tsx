import { useMemo, useState, useEffect } from 'react';
import type { CategoryId, Category } from '../../data/categories';
import { filterProducts, DEFAULT_FILTERS, type FilterState } from '../../lib/filterProducts';
import type { Product } from '../../data/types';
import { ProductCard } from '../product/ProductCard';
import { CategoryTabs } from './CategoryTabs';
import { CatalogueFilters } from './CatalogueFilters';
import styles from '../../views/CataloguePage.module.css';

interface Props {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
}

export function CatalogueClient({ products, categories, initialCategory = 'all' }: Props) {
  const initial: FilterState = {
    ...DEFAULT_FILTERS,
    category: (initialCategory as CategoryId) || 'all',
  };
  const [filters, setFilters] = useState<FilterState>(initial);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (filters.category === 'all') url.searchParams.delete('cat');
    else url.searchParams.set('cat', filters.category);
    window.history.replaceState({}, '', url.toString());
  }, [filters.category]);

  const filtered = useMemo(() => filterProducts(products, filters), [products, filters]);

  return (
    <div className={styles.page}>
      <section className={styles.heroBand}>
        <div className={`container ${styles.heroBandInner}`}>
          <p className={styles.eyebrow}>Fiestalo'K</p>
          <h1 className={styles.title}>Notre <span>catalogue</span></h1>
          <p className={styles.lead}>Tout le matériel pour une fête réussie.</p>
        </div>
      </section>

      <div className={styles.contentArea}>
        <div className={`container ${styles.tabsBar}`}>
          <div />
          <CategoryTabs
            categories={categories}
            active={filters.category}
            onChange={(c) => setFilters((f) => ({ ...f, category: c }))}
          />
        </div>

        <div className={`container ${styles.layout}`}>
          <CatalogueFilters value={filters} onChange={setFilters} />

          <div className={styles.results}>
            <div className={styles.resultsHeader}>
              <p className={styles.count}>
                {`${filtered.length} résultat${filtered.length > 1 ? 's' : ''}`}
              </p>
              <div className={styles.sortWrap}>
                {([
                  { value: 'default',    label: 'Défaut' },
                  { value: 'price-asc',  label: 'Prix ↑' },
                  { value: 'price-desc', label: 'Prix ↓' },
                  { value: 'rating',     label: '★ Notes' },
                ] as const).map((o) => (
                  <button
                    key={o.value}
                    className={`${styles.sortBtn} ${filters.sort === o.value ? styles.sortActive : ''}`}
                    onClick={() => setFilters((f) => ({ ...f, sort: o.value }))}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className={styles.empty}>
                <p>Aucun produit ne correspond à tes filtres.</p>
                <button onClick={() => setFilters(DEFAULT_FILTERS)}>Réinitialiser</button>
              </div>
            ) : (
              <div className={styles.grid}>
                {filtered.map((p) => <ProductCard key={p.id} product={p} categories={categories} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
