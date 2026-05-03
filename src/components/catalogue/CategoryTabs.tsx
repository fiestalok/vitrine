import { CATEGORIES, type CategoryId } from '../../data/categories';
import styles from './CategoryTabs.module.css';

interface Props {
  active: CategoryId | 'all';
  onChange: (id: CategoryId | 'all') => void;
}

export function CategoryTabs({ active, onChange }: Props) {
  return (
    <div className={styles.tabs}>
      <button className={`${styles.tab} ${active === 'all' ? styles.active : ''}`} onClick={() => onChange('all')}>Tout voir</button>
      {CATEGORIES.map((c) => (
        <button
          key={c.id}
          className={`${styles.tab} ${active === c.id ? styles.active : ''}`}
          onClick={() => onChange(c.id)}
        >
          {c.emoji} {c.label}
        </button>
      ))}
    </div>
  );
}
