import { Link } from 'react-router-dom';
import type { Product } from '../../data/types';
import { Badge } from '../ui/Badge';
import { StarRating } from '../ui/StarRating';
import { useCategories } from '../../context/CategoriesContext';
import styles from './ProductCard.module.css';

interface ProductCardProps { product: Product; }

export function ProductCard({ product }: ProductCardProps) {
  const { categories } = useCategories();
  const cat = categories.find((c) => c.id === product.category);
  return (
    <Link to={`/produit/${product.id}`} className={styles.card}>
      <div className={styles.imgWrap}>
        <img src={product.images[0]} alt={product.name} loading="lazy" />
        {cat && <span className={styles.cat}>{cat.emoji}</span>}
        {product.badge && <Badge tone={product.badge === 'PROMO' ? 'danger' : product.badge === 'NOUVEAU' ? 'primary' : 'accent'} className={styles.badge}>{product.badge}</Badge>}
        <span className={styles.price}>À partir de {product.price}€/jour</span>
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>
        <StarRating value={product.rating} count={product.reviewCount} />
      </div>
    </Link>
  );
}
