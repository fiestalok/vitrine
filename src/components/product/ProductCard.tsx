import { Link } from 'react-router-dom';
import type { Product } from '../../data/types';
import { Badge } from '../ui/Badge';
import { StarRating } from '../ui/StarRating';
import { CATEGORIES } from '../../data/categories';
import styles from './ProductCard.module.css';

interface ProductCardProps { product: Product; }

export function ProductCard({ product }: ProductCardProps) {
  const cat = CATEGORIES.find((c) => c.id === product.category);
  return (
    <Link to={`/produit/${product.id}`} className={styles.card}>
      <div className={styles.imgWrap}>
        <img src={product.images[0]} alt={product.name} loading="lazy" />
        {cat && <span className={styles.cat}>{cat.emoji}</span>}
        {product.badge && <Badge tone={product.badge === 'PROMO' ? 'danger' : product.badge === 'NOUVEAU' ? 'primary' : 'accent'} className={styles.badge}>{product.badge}</Badge>}
        <span className={styles.price}>{product.price}€/jour</span>
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>
        <StarRating value={product.rating} count={product.reviewCount} />
      </div>
    </Link>
  );
}
