import { ProductCard } from '../product/ProductCard';
import type { Product } from '../../data/types';
import type { Category } from '../../data/categories';
import styles from '../../views/HomePage.module.css';

interface FeaturedProductsProps {
  products: Product[];
  categories: Category[];
}

export function FeaturedProducts({ products, categories }: FeaturedProductsProps) {
  return (
    <div className={styles.productGrid}>
      {products.map((p) => <ProductCard key={p.id} product={p} categories={categories} />)}
    </div>
  );
}
