import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import productsRaw from '../data/products.json';
import type { Product } from '../data/types';
import type { CategoryId } from '../data/categories';
import { filterProducts, DEFAULT_FILTERS, type FilterState } from '../lib/filterProducts';
import { ProductCard } from '../components/product/ProductCard';
import { CategoryTabs } from '../components/catalogue/CategoryTabs';
import { CatalogueFilters } from '../components/catalogue/CatalogueFilters';
import { Bubbles } from '../components/ui/Bubbles';
import { Castle } from '../components/ui/Castle';
import styles from './CataloguePage.module.css';

const products = productsRaw as unknown as Product[];

export function CataloguePage() {
  const [params, setParams] = useSearchParams();
  const initial: FilterState = {
    ...DEFAULT_FILTERS,
    category: (params.get('cat') as CategoryId) || 'all',
  };
  const [filters, setFilters] = useState<FilterState>(initial);

  useEffect(() => {
    if (filters.category === 'all') params.delete('cat');
    else params.set('cat', filters.category);
    setParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category]);

  const filtered = useMemo(() => filterProducts(products, filters), [filters]);

  return (
    <div className={styles.page}>
      <section className={styles.heroBand}>
        <Bubbles variant="warm" />
        <div className={`container ${styles.heroBandInner}`}>
          <p className={styles.eyebrow}>Fiestalo'K</p>
          <h1 className={styles.title}>Notre <span>catalogue</span></h1>
          <p className={styles.lead}>Tout le matériel pour une fête réussie.</p>
        </div>
      </section>

      <div className={styles.contentArea}>
        <Bubbles variant="warm" />
        <Castle size={120} rotation={5} className={styles.castleRight} noInflate />
        <div className={`container ${styles.tabsBar}`}>
          <div />
          <CategoryTabs active={filters.category} onChange={(c) => setFilters((f) => ({ ...f, category: c }))} />
        </div>

        <div className={`container ${styles.layout}`}>
          <CatalogueFilters value={filters} onChange={setFilters} />

          <div className={styles.results}>
            <div className={styles.resultsHeader}>
              <p className={styles.count}>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</p>
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
                {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
