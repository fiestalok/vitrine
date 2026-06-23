import { useCategories } from '../../context/CategoriesContext';
import type { CategoryId } from '../../data/categories';
import type { FilterState } from '../../lib/filterProducts';
import styles from './MobileFilterBar.module.css';

interface Props {
  filters: FilterState;
  onCategoryChange: (c: CategoryId | 'all') => void;
}

export function MobileFilterBar({ filters, onCategoryChange }: Props) {
  const { categories } = useCategories();

  return (
    <div className={styles.bar}>
      <div className={styles.chips}>
        <button
          className={`${styles.chip} ${filters.category === 'all' ? styles.chipActive : ''}`}
          onClick={() => onCategoryChange('all')}
        >
          ✦ Tout
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`${styles.chip} ${filters.category === c.id ? styles.chipActive : ''}`}
            onClick={() => onCategoryChange(c.id)}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
