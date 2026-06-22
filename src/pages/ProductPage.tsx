import { useRef, useState, useEffect } from 'react';
import { useParams, Link, Navigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useProducts } from '../context/ProductsContext';
import { useCategories } from '../context/CategoriesContext';
import { useCart } from '../context/CartContext';
import { useReviews } from '../context/ReviewsContext';
import { formatRange, rentalDays } from '../lib/format';
import { fetchReservedArticleIds } from '../lib/directus';
import { DateChangeModal } from '../components/ui/DateChangeModal';
import { ProductGallery } from '../components/product/ProductGallery';
import { PhotoGallery } from '../components/product/PhotoGallery';
import { AvailabilityCalendar, type DateRange } from '../components/product/AvailabilityCalendar';
import { StarRating } from '../components/ui/StarRating';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PageSEO } from '../components/seo/PageSEO';
import styles from './ProductPage.module.css';

const SPEC_ICONS: Record<string, string> = {
  capacité: '👥', enfants: '👧', personnes: '👥', participants: '👥',
  dimensions: '📐', taille: '📐', surface: '📐', longueur: '↔️', largeur: '↔️',
  hauteur: '↕️', poids: '⚖️',
  âge: '🎂', age: '🎂',
  puissance: '⚡', électricité: '🔌', connexion: '🔌',
  couleur: '🎨', thème: '🎨', theme: '🎨',
  montage: '🔧', installation: '🔧',
  son: '🔊', volume: '🔊',
  matière: '🏗️', matériau: '🏗️',
};

function specIcon(key: string): string {
  const k = key.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  for (const [word, icon] of Object.entries(SPEC_ICONS)) {
    const w = word.normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (k.includes(w)) return icon;
  }
  return '📋';
}

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { products, loading } = useProducts();
  const { categories } = useCategories();
  const product = products.find((p) => p.id === id);
  const cat = product ? categories.find((c) => c.id === product.category) : undefined;
  const { add, open, remove, setQuantity, items, updateDates, removeItems } = useCart();
  const { forProduct } = useReviews();

  const fromParam = searchParams.get('from');
  const toParam   = searchParams.get('to');
  const [range, setRange] = useState<DateRange>(() => ({
    start: fromParam ? new Date(fromParam) : null,
    end:   toParam   ? new Date(toParam)   : null,
  }));
  const [availCount, setAvailCount] = useState<number | null>(null);
  const planningRef = useRef<HTMLElement>(null);
  type PendingAdd = { unavailableIds: string[]; unavailableNames: string[]; newStart: string; newEnd: string };
  const [pendingAdd, setPendingAdd] = useState<PendingAdd | null>(null);

  useEffect(() => {
    if (!product || !range.start || !range.end) { setAvailCount(null); return; }
    const s = format(range.start, 'yyyy-MM-dd');
    const e = format(range.end,   'yyyy-MM-dd');
    fetchReservedArticleIds(product.articleIds, s, e)
      .then((reserved) => setAvailCount(product.articleIds.filter((id) => !reserved.has(id)).length))
      .catch(() => setAvailCount(null));
  }, [product, range.start, range.end]);

  if (loading) {
    return <div className={`container ${styles.page}`}><p>Chargement…</p></div>;
  }

  if (!product) return <Navigate to="/catalogue" replace />;

  const reviews = forProduct(product.id);
  const rangeComplete = Boolean(range.start && range.end);
  const cartQty = items.find((i) => i.productId === product.id)?.quantity ?? 0;
  const availLoading = rangeComplete && availCount === null;
  const maxReached = availCount !== null && cartQty >= availCount;

  const startISO = range.start ? format(range.start, 'yyyy-MM-dd') : null;
  const endISO = range.end ? format(range.end, 'yyyy-MM-dd') : null;
  const days = rentalDays(startISO, endISO);
  const totalPrice = product.price * days;

  async function handleAdd() {
    if (!product || !range.start || !range.end) return;
    if (availCount !== null && cartQty >= availCount) return;
    const newStart = format(range.start, 'yyyy-MM-dd');
    const newEnd   = format(range.end,   'yyyy-MM-dd');

    // Vérifier si les dates diffèrent des articles déjà dans le panier
    const datedItems = items.filter((i) => i.productId !== product.id && i.startDate && i.endDate);
    if (datedItems.length > 0) {
      const cartStart = datedItems[0].startDate!;
      const cartEnd   = datedItems[0].endDate!;
      if (newStart !== cartStart || newEnd !== cartEnd) {
        const allArticleIds = datedItems.flatMap((i) => products.find((p) => p.id === i.productId)?.articleIds ?? []);
        if (allArticleIds.length > 0) {
          const reserved = await fetchReservedArticleIds(allArticleIds, newStart, newEnd);
          const unavailable = datedItems.filter((i) => {
            const p = products.find((pr) => pr.id === i.productId);
            if (!p) return true;
            return p.articleIds.filter((id) => !reserved.has(id)).length < i.quantity;
          });
          if (unavailable.length > 0) {
            setPendingAdd({
              unavailableIds: unavailable.map((i) => i.productId),
              unavailableNames: unavailable.map((i) => products.find((p) => p.id === i.productId)?.name ?? i.productId),
              newStart,
              newEnd,
            });
            return;
          }
        }
        // Tous dispo pour les nouvelles dates → mettre à jour silencieusement
        updateDates(newStart, newEnd);
      }
    }

    add({ productId: product.id, startDate: newStart, endDate: newEnd, quantity: 1 });
    open();
  }

  function handleAddOrScroll() {
    if (!rangeComplete) {
      planningRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    handleAdd();
  }

  function handleDecrease() {
    if (!product) return;
    if (cartQty <= 1) remove(product.id);
    else setQuantity(product.id, cartQty - 1);
  }

  const selectedCard = rangeComplete ? (
    <div className={styles.selectedCard}>
      <div className={styles.selectedRow}>
        <div className={styles.selectedDates}>{formatRange(startISO!, endISO!)} · {days} jour{days > 1 ? 's' : ''}</div>
        <div className={styles.selectedActions}>
          <div className={styles.selectedPrice}>{totalPrice}€</div>
          <div className={styles.qtySelector}>
            <button className={styles.qtyBtn} onClick={handleDecrease} disabled={cartQty === 0} aria-label="Retirer un">−</button>
            <span className={styles.qtyValue}>{cartQty}</span>
            <button className={styles.qtyBtn} onClick={handleAdd} disabled={maxReached || availLoading} aria-label="Ajouter un">+</button>
          </div>
          {maxReached && <span className={styles.stockBadge}>STOCK<br/>ÉPUISÉ</span>}
        </div>
      </div>
      {cartQty > 0 && (
        <div className={styles.cartInfo}>
          🛒 {cartQty} sélectionné{cartQty > 1 ? 's' : ''} dans votre panier
          {maxReached && <span className={styles.stockEpuise}> · Pas de stock supplémentaire</span>}
        </div>
      )}
      {availCount === 1 && !maxReached && (
        <div className={styles.lastDispo}>⚡ Plus qu'un article dispo pour ces dates</div>
      )}
    </div>
  ) : null;

  return (
    <div className={`container ${styles.page}`}>
      <PageSEO
        title={`Location ${product.name} en Alsace`}
        description={`Louez ${product.name} pour votre événement en Alsace. ${product.longDescription.slice(0, 120)}…`}
        path={`/produit/${product.id}`}
        image={product.images[0] ?? undefined}
      />
      <nav className={styles.crumbs}>
        <Link to="/catalogue">Catalogue</Link> / <span>{product.name}</span>
      </nav>

      <div className={styles.top}>
        <ProductGallery images={product.images} alt={product.name} />

        <div className={styles.info}>
          {cat && <p className={styles.cat}>{cat.emoji} {cat.label}</p>}
          {product.badge && <Badge tone={product.badge === 'PROMO' ? 'danger' : 'accent'}>{product.badge}</Badge>}
          <h1 className={styles.name}>{product.name}</h1>
          <StarRating value={product.rating} count={product.reviewCount + reviews.length} size="md" />
          <p className={styles.desc}>{product.longDescription}</p>

          <div className={styles.priceRow}>
            <span className={styles.price}>{product.price}€</span>
            <span className={styles.unit}>/jour</span>
          </div>
          {selectedCard}
          {!rangeComplete && (
            <>
              {cartQty > 0 && (
                <div className={styles.cartInfo}>🛒 {cartQty} déjà dans votre panier</div>
              )}
              <Button variant="primary" size="lg" onClick={handleAddOrScroll}>
                + Ajouter au panier
              </Button>
            </>
          )}
        </div>
      </div>

      {Object.keys(product.specs).length > 0 && (
        <section className={styles.block}>
          <header><h2>Caractéristiques techniques</h2></header>
          <ul className={styles.specs}>
            {Object.entries(product.specs).map(([k, v]) => (
              <li key={k}>
                <span className={styles.specsIcon}>{specIcon(k)}</span>
                <span>{k}</span>
                <strong>{v}</strong>
              </li>
            ))}
          </ul>
        </section>
      )}

      {product.images.length > 0 && (
        <section className={styles.block}>
          <header><h2>Galerie photo</h2></header>
          <PhotoGallery images={product.images} alt={product.name} />
        </section>
      )}

      <section className={styles.block} ref={planningRef}>
        <header><h2>Disponibilités</h2><p>Choisis ta date pour vérifier la dispo.</p></header>
        <AvailabilityCalendar
          productId={product.id}
          articleIds={product.articleIds}
          totalArticles={product.articleIds.length}
          range={range}
          onChange={setRange}
        />
        {!rangeComplete && range.start && (
          <p className={styles.selected}>Sélectionnez la date de fin.</p>
        )}
        {selectedCard}
        {!rangeComplete && (
          <Button variant="primary" size="lg" onClick={handleAdd} disabled className={styles.calBtn}>
            Saisissez vos dates
          </Button>
        )}
      </section>

      <Link to="/catalogue" className={styles.back}>← Retour au catalogue</Link>

      {pendingAdd && (
        <DateChangeModal
          unavailableNames={pendingAdd.unavailableNames}
          onCancel={() => setPendingAdd(null)}
          onConfirm={() => {
            removeItems(pendingAdd.unavailableIds);
            updateDates(pendingAdd.newStart, pendingAdd.newEnd);
            add({ productId: product.id, startDate: pendingAdd.newStart, endDate: pendingAdd.newEnd, quantity: 1 });
            open();
            setPendingAdd(null);
          }}
        />
      )}
    </div>
  );
}
