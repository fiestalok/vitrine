import { Link } from 'react-router-dom';
import type { Product } from '../../data/types';
import { Badge } from '../ui/Badge';
import { useCategories } from '../../context/CategoriesContext';
import { useCart } from '../../context/CartContext';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  // undefined = pas de dates, null = vérification en cours, number = nombre d'articles dispos
  availCount?: number | null;
  dateStart?: string;
  dateEnd?: string;
}

export function ProductCard({ product, availCount, dateStart, dateEnd }: ProductCardProps) {
  const { categories } = useCategories();
  const { add, open, items } = useCart();
  const cat = categories.find((c) => c.id === product.category);
  const cartQty = items.find((i) => i.productId === product.id)?.quantity ?? 0;
  const inCart = cartQty > 0;

  const datesReady = !!(dateStart && dateEnd);
  const href = datesReady
    ? `/produit/${product.id}?from=${dateStart}&to=${dateEnd}`
    : `/produit/${product.id}`;

  const isUnavailable = availCount !== undefined && availCount !== null && availCount <= 0;
  const isLastDispo   = availCount === 1 && product.articleIds.length >= 2;
  const isAvailable   = availCount !== undefined && availCount !== null && availCount > 0;

  // Produit en panier : ne pas afficher comme indisponible visuellement
  const showAsUnavail = isUnavailable && !inCart;
  const maxReached = availCount !== undefined && availCount !== null && cartQty >= availCount;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isUnavailable || maxReached || !dateStart || !dateEnd) return;
    add({ productId: product.id, startDate: dateStart, endDate: dateEnd, quantity: 1 });
    open();
  }

  return (
    <Link to={href} className={`${styles.card} ${showAsUnavail ? styles.unavailCard : ''}`}>
      <div className={styles.imgWrap}>
        <img src={product.images[0]} alt={product.name} loading="lazy" />
        {cat && <span className={styles.cat}>{cat.emoji}</span>}
        {product.badge && !showAsUnavail && !inCart && (
          <Badge
            tone={product.badge === 'PROMO' ? 'danger' : product.badge === 'NOUVEAU' ? 'primary' : 'accent'}
            className={styles.badge}
          >
            {product.badge}
          </Badge>
        )}
        {inCart && (
          <Badge tone="warning" rotation={0} className={styles.badge}>
            🛒 {cartQty}
          </Badge>
        )}
        {showAsUnavail && (
          <Badge tone="danger" rotation={0} className={styles.badge}>Indisponible</Badge>
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.priceBody}>{product.price}€<span>/jour</span></p>
        <div className={styles.footer}>
          {inCart ? (
            <Badge tone="warning" rotation={0} className={styles.availBadge}>
              🎉 {cartQty} sélectionné{cartQty > 1 ? 's' : ''}
            </Badge>
          ) : isLastDispo ? (
            <Badge tone="warning" rotation={0} className={styles.availBadge}>⚡ Dernière dispo</Badge>
          ) : isAvailable ? (
            <Badge tone="success" rotation={0} className={styles.availBadge}>✓ Disponible</Badge>
          ) : null}
          {datesReady && !isUnavailable && !maxReached && (
            <button className={styles.addBtn} onClick={handleAdd} title="Ajouter au panier">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                <line x1="12" y1="10" x2="12" y2="16"/><line x1="9" y1="13" x2="15" y2="13"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
