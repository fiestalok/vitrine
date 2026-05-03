import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { CategoryId } from '../data/categories';
import { useProducts } from '../context/ProductsContext';
import { filterProducts, DEFAULT_FILTERS, type FilterState } from '../lib/filterProducts';
import { ProductCard } from '../components/product/ProductCard';
import { CategoryTabs } from '../components/catalogue/CategoryTabs';
import { CatalogueFilters } from '../components/catalogue/CatalogueFilters';
import styles from './CataloguePage.module.css';

export function CataloguePage() {
  const { products, loading } = useProducts();
  const [params, setParams] = useSearchParams();
  const initial: FilterState = {
    ...DEFAULT_FILTERS,
    category: (params.get('cat') as CategoryId) || 'all',
  };
  const [filters, setFilters] = useState<FilterState>(initial);

  // Sync category to URL
  useEffect(() => {
    if (filters.category === 'all') params.delete('cat');
    else params.set('cat', filters.category);
    setParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category]);

  const filtered = useMemo(() => filterProducts(products, filters), [filters]);

  return (
    <>
      <section className={styles.heroBand}>
        <div className="container">
          <p className={styles.eyebrow}>Fiestalo'K</p>
          <h1 className={styles.title}>Notre <span>catalogue</span></h1>
          <p className={styles.lead}>Tout le matériel pour une fête réussie.</p>
        </div>
      </section>

      <div className={`container ${styles.tabsBar}`}>
        <CategoryTabs active={filters.category} onChange={(c) => setFilters((f) => ({ ...f, category: c }))} />
      </div>

      <div className={`container ${styles.layout}`}>
        <CatalogueFilters value={filters} onChange={setFilters} />

        <div className={styles.results}>
          <div className={styles.resultsHeader}>
            <p>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</p>
            <select
              value={filters.sort}
              onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as FilterState['sort'] }))}
              className={styles.sort}
            >
              <option value="default">Tri par défaut</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="rating">Mieux notés</option>
            </select>
          </div>

          {loading ? (
            <p>Chargement...</p>
          ) : filtered.length === 0 ? (
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
    </>
  );
}
