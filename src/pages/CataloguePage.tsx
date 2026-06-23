import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { CategoryId } from '../data/categories';
import { filterProducts, DEFAULT_FILTERS, type FilterState } from '../lib/filterProducts';
import { fetchReservedArticleIds } from '../lib/directus';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/product/ProductCard';
import { CategoryTabs } from '../components/catalogue/CategoryTabs';
import { CatalogueFilters } from '../components/catalogue/CatalogueFilters';
import { DateChangeModal } from '../components/ui/DateChangeModal';
import { Bubbles } from '../components/ui/Bubbles';
import { Castle } from '../components/ui/Castle';
import { PageSEO } from '../components/seo/PageSEO';
import { MobileFilterBar } from '../components/catalogue/MobileFilterBar';
import { MobileFiltersSheet } from '../components/catalogue/MobileFiltersSheet';
import styles from './CataloguePage.module.css';

export function CataloguePage() {
  const { products, loading } = useProducts();
  const { items: cartItems, updateDates, removeItems } = useCart();
  const [params, setParams] = useSearchParams();

  const maxProductPrice = useMemo(
    () => products.length > 0 ? Math.ceil(Math.max(...products.map((p) => p.price)) / 10) * 10 : 400,
    [products],
  );

  const [filters, setFilters] = useState<FilterState>(() => {
    const cartDatedItem = cartItems.find((i) => i.startDate && i.endDate);
    return {
      ...DEFAULT_FILTERS,
      category: (params.get('cat') as CategoryId) || 'all',
      dateStart: cartDatedItem?.startDate ?? '',
      dateEnd:   cartDatedItem?.endDate   ?? '',
    };
  });

  useEffect(() => {
    if (products.length > 0)
      setFilters((f) => f.maxPrice === DEFAULT_FILTERS.maxPrice ? { ...f, maxPrice: maxProductPrice } : f);
  }, [maxProductPrice]);

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
    const withAvail = filtered.map((p) => ({
      ...p,
      _availCount: p.articleIds.filter((id) => !reservedIds.has(id)).length,
    }));
    // Disponibles en premier, indisponibles en dernier
    return [...withAvail].sort((a, b) => {
      if (a._availCount > 0 && b._availCount <= 0) return -1;
      if (a._availCount <= 0 && b._availCount > 0) return 1;
      return 0;
    });
  }, [filtered, datesSelected, reservedIds]);

  const isLoading = loading || availLoading;

  type PendingDateChange = {
    newFilter: FilterState;
    unavailableIds: string[];
    unavailableNames: string[];
  };
  const [pendingDateChange, setPendingDateChange] = useState<PendingDateChange | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleDateChange = useCallback(async (newFilter: FilterState) => {
    const datedItems = cartItems.filter((i) => i.startDate && i.endDate);
    // No cart items with dates → apply directly
    if (datedItems.length === 0) { setFilters(newFilter); return; }
    // Dates unchanged from first cart item → apply directly
    const cartStart = datedItems[0].startDate!;
    const cartEnd   = datedItems[0].endDate!;
    if (newFilter.dateStart === cartStart && newFilter.dateEnd === cartEnd) { setFilters(newFilter); return; }
    // Check availability of cart items at new dates
    const cartArticleIds = datedItems.flatMap((i) => products.find((p) => p.id === i.productId)?.articleIds ?? []);
    if (cartArticleIds.length === 0) {
      updateDates(newFilter.dateStart, newFilter.dateEnd);
      setFilters(newFilter);
      return;
    }
    const reserved = await fetchReservedArticleIds(cartArticleIds, newFilter.dateStart, newFilter.dateEnd);
    const unavailable = datedItems.filter((i) => {
      const p = products.find((pr) => pr.id === i.productId);
      if (!p) return true;
      return p.articleIds.filter((id) => !reserved.has(id)).length < i.quantity;
    });
    if (unavailable.length === 0) {
      updateDates(newFilter.dateStart, newFilter.dateEnd);
      setFilters(newFilter);
      return;
    }
    setPendingDateChange({
      newFilter,
      unavailableIds: unavailable.map((i) => i.productId),
      unavailableNames: unavailable.map((i) => products.find((p) => p.id === i.productId)?.name ?? i.productId),
    });
  }, [cartItems, products, updateDates]);

  return (
    <>
    <PageSEO
      title="Location Château Gonflable & Matériel Festif — Alsace"
      description="Catalogue de location : châteaux gonflables, photobooths, sono, machines à pop-corn, plancha. Livraison avec installation à Strasbourg et dans toute l'Alsace."
      path="/catalogue"
    />
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

        {/* Desktop: category tabs bar */}
        <div className={`container ${styles.tabsBar} ${styles.desktopOnly}`}>
          <div />
          <CategoryTabs active={filters.category} onChange={(c) => setFilters((f) => ({ ...f, category: c }))} />
        </div>

        {/* Mobile: compact filter bar */}
        <MobileFilterBar
          filters={filters}
          maxAvailable={maxProductPrice}
          onCategoryChange={(c) => setFilters((f) => ({ ...f, category: c }))}
          onFiltersOpen={() => setFiltersOpen(true)}
        />

        <div className={`container ${styles.layout}`}>
          {/* Desktop: filters sidebar */}
          <div className={styles.desktopOnly}>
            <CatalogueFilters
              value={filters}
              onChange={setFilters}
              onDateChange={handleDateChange}
              maxAvailable={maxProductPrice}
            />
          </div>

          <div className={styles.results}>
            <div className={styles.resultsHeader}>
              <p className={styles.count}>
                {isLoading
                  ? 'Chargement…'
                  : (() => {
                      if (!datesSelected || availLoading) return `${displayed.length} résultat${displayed.length > 1 ? 's' : ''}`;
                      const availableCount = displayed.filter((p: any) => (p._availCount ?? 0) > 0).length;
                      return `${availableCount} disponible${availableCount > 1 ? 's' : ''} sur ${displayed.length}`;
                    })()}
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
                    availCount={!datesSelected ? undefined : availLoading ? null : (p as any)._availCount}
                    dateStart={filters.dateStart || undefined}
                    dateEnd={filters.dateEnd || undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile: filters bottom sheet */}
        <MobileFiltersSheet
          open={filtersOpen}
          value={filters}
          maxAvailable={maxProductPrice}
          onChange={setFilters}
          onDateChange={handleDateChange}
          onClose={() => setFiltersOpen(false)}
        />
      </div>
    </div>

    {pendingDateChange && (
      <DateChangeModal
        unavailableNames={pendingDateChange.unavailableNames}
        onCancel={() => setPendingDateChange(null)}
        onConfirm={() => {
          removeItems(pendingDateChange.unavailableIds);
          updateDates(pendingDateChange.newFilter.dateStart, pendingDateChange.newFilter.dateEnd);
          setFilters(pendingDateChange.newFilter);
          setPendingDateChange(null);
        }}
      />
    )}
    </>
  );
}
