import { useCategories } from '../../context/CategoriesContext';
import type { CategoryId } from '../../data/categories';
import type { FilterState } from '../../lib/filterProducts';
import styles from './MobileFilterBar.module.css';

interface Props {
  filters: FilterState;
  maxAvailable: number;
  onCategoryChange: (c: CategoryId | 'all') => void;
  onFiltersOpen: () => void;
}

function countActiveFilters(filters: FilterState, maxAvailable: number): number {
  let count = 0;
  if (filters.audiences.length > 0) count++;
  if (filters.maxPrice < maxAvailable) count++;
  if (filters.dateStart || filters.dateEnd) count++; // date range counts as 1
  // sort is not counted: it lives in the results header, not in the filter sheet
  return count;
}

export function MobileFilterBar({ filters, maxAvailable, onCategoryChange, onFiltersOpen }: Props) {
  const { categories } = useCategories();
  const activeCount = countActiveFilters(filters, maxAvailable);

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
      <button
        className={`${styles.filtersBtn} ${activeCount > 0 ? styles.filtersBtnActive : ''}`}
        onClick={onFiltersOpen}
      >
        ⚙ Filtres{activeCount > 0 ? ` (${activeCount})` : ''}
      </button>
    </div>
  );
}
