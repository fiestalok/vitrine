import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { CategoryId } from '../data/categories';
import { filterProducts, DEFAULT_FILTERS, type FilterState } from '../lib/filterProducts';
import { fetchReservedArticleIds } from '../lib/directus';
import { useProducts } from '../context/ProductsContext';
import { ProductCard } from '../components/product/ProductCard';
import { CategoryTabs } from '../components/catalogue/CategoryTabs';
import { CatalogueFilters } from '../components/catalogue/CatalogueFilters';
import { Bubbles } from '../components/ui/Bubbles';
import { Castle } from '../components/ui/Castle';
import styles from './CataloguePage.module.css';

export function CataloguePage() {
  const { products, loading } = useProducts();
  const [params, setParams] = useSearchParams();
  const initial: FilterState = {
    ...DEFAULT_FILTERS,
    category: (params.get('cat') as CategoryId) || 'all',
  };
  const [filters, setFilters] = useState<FilterState>(initial);

  const [reservedIds, setReservedIds] = useState<Set<number>>(new Set());
  const [availLoading, setAvailLoading] = useState(false);

  useEffect(() => {
    if (filters.category === 'all') params.delete('cat');
    else params.set('cat', filters.category);
    setParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category]);

  const allArticleIds = useMemo(
    () => products.flatMap((p) => p.articleIds),
    [products],
  );

  useEffect(() => {
    if (!filters.dateStart || !filters.dateEnd) {
      setReservedIds(new Set());
      return;
    }
    setAvailLoading(true);
    fetchReservedArticleIds(allArticleIds, filters.dateStart, filters.dateEnd)
      .then(setReservedIds)
      .catch(() => setReservedIds(new Set()))
      .finally(() => setAvailLoading(false));
  }, [filters.dateStart, filters.dateEnd, allArticleIds]);

  const datesSelected = !!(filters.dateStart && filters.dateEnd);

  const filtered = useMemo(() => filterProducts(products, filters), [products, filters]);

  const displayed = useMemo(() => {
    if (!datesSelected) return filtered;
    return filtered
      .map((p) => ({
        ...p,
        _availCount: p.articleIds.filter((id) => !reservedIds.has(id)).length,
      }))
      .filter((p) => p._availCount > 0);
  }, [filtered, datesSelected, reservedIds]);

  const isLoading = loading || availLoading;

  return (
    <div className={styles.page}>
      <section className={styles.heroBand}>
        <Bubbles variant="warm" />
        <div className={`container ${styles.heroBandInner}`}>
          <p className={styles.eyebrow}>Hoplalo'K</p>
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
              <p className={styles.count}>
                {isLoading
                  ? 'Chargement…'
                  : `${displayed.length} résultat${displayed.length > 1 ? 's' : ''}${datesSelected ? ' disponibles' : ''}`}
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

            {isLoading ? (
              <div className={styles.empty}><p>Chargement des produits…</p></div>
            ) : displayed.length === 0 ? (
              <div className={styles.empty}>
                <p>
                  {datesSelected
                    ? 'Aucun produit disponible pour ces dates.'
                    : 'Aucun produit ne correspond à tes filtres.'}
                </p>
                <button onClick={() => setFilters(DEFAULT_FILTERS)}>Réinitialiser</button>
              </div>
            ) : (
              <div className={styles.grid}>
                {displayed.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    showAvailable={datesSelected}
                    lastAvailable={datesSelected && (p as any)._availCount === 1}
                    dateStart={filters.dateStart || undefined}
                    dateEnd={filters.dateEnd || undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
