import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useCategories } from '../context/CategoriesContext';
import { UNAVAILABLE_DATES } from '../data/unavailable';
import { useCart } from '../context/CartContext';
import { useReviews } from '../context/ReviewsContext';
import { ProductGallery } from '../components/product/ProductGallery';
import { AvailabilityCalendar } from '../components/product/AvailabilityCalendar';
import { ReviewList } from '../components/product/ReviewList';
import { ReviewForm } from '../components/product/ReviewForm';
import { StarRating } from '../components/ui/StarRating';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { format } from 'date-fns';
import styles from './ProductPage.module.css';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { products, loading } = useProducts();
  const { categories } = useCategories();
  const product = products.find((p) => p.id === id);
  const cat = product ? categories.find((c) => c.id === product.category) : undefined;
  const { add, open } = useCart();
  const { forProduct, add: addReview } = useReviews();
  const [date, setDate] = useState<Date | null>(null);

  if (loading) {
    return <div className={`container ${styles.page}`}><p>Chargement…</p></div>;
  }

  if (!product) return <Navigate to="/catalogue" replace />;

  const reviews = forProduct(product.id);

  function handleAdd() {
    if (!product) return;
    add({
      productId: product.id,
      startDate: date ? format(date, 'yyyy-MM-dd') : null,
      endDate: date ? format(date, 'yyyy-MM-dd') : null,
      quantity: 1,
    });
    open();
  }

  return (
    <div className={`container ${styles.page}`}>
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

          <ul className={styles.specs}>
            {Object.entries(product.specs).map(([k, v]) => (
              <li key={k}><span>{k}</span><strong>{v}</strong></li>
            ))}
          </ul>

          <div className={styles.priceRow}>
            <span className={styles.price}>{product.price}€</span>
            <span className={styles.unit}>/jour</span>
          </div>

          <Button variant="primary" size="lg" onClick={handleAdd}>+ Ajouter au panier</Button>
        </div>
      </div>

      <section className={styles.block}>
        <header><h2>Disponibilités</h2><p>Choisis ta date pour vérifier la dispo.</p></header>
        <AvailabilityCalendar
          productId={product.id}
          unavailableDates={UNAVAILABLE_DATES[product.id] ?? []}
          value={date}
          onChange={setDate}
        />
        {date && <p className={styles.selected}>Date sélectionnée : <strong>{format(date, 'dd/MM/yyyy')}</strong></p>}
      </section>

      <section className={styles.block}>
        <header><h2>Avis clients</h2></header>
        <ReviewList reviews={reviews} />
        <ReviewForm onSubmit={(data) => addReview({ productId: product.id, ...data })} />
      </section>

      <Link to="/catalogue" className={styles.back}>← Retour au catalogue</Link>
    </div>
  );
}
