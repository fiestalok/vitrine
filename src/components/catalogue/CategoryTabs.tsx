import { useCategories } from '../../context/CategoriesContext';
import type { CategoryId } from '../../data/categories';
import styles from './CategoryTabs.module.css';

interface Props {
  active: CategoryId | 'all';
  onChange: (id: CategoryId | 'all') => void;
}

export function CategoryTabs({ active, onChange }: Props) {
  const { categories } = useCategories();

  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${active === 'all' ? styles.active : ''}`}
        onClick={() => onChange('all')}
      >
        <span className={styles.tabIcon}>✦</span>
        <span className={styles.tabLabel}>Tout voir</span>
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          className={`${styles.tab} ${active === c.id ? styles.active : ''}`}
          onClick={() => onChange(c.id)}
        >
          <span className={styles.tabIcon}>{c.emoji}</span>
          <span className={styles.tabLabel}>{c.label}</span>
        </button>
      ))}
    </div>
  );
}
