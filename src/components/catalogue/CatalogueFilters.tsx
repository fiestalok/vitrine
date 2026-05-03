import type { FilterState } from '../../lib/filterProducts';
import { AUDIENCES, type Audience } from '../../data/categories';
import styles from './CatalogueFilters.module.css';

interface Props {
  value: FilterState;
  onChange: (f: FilterState) => void;
}

const AUDIENCE_LABELS: Record<Audience, string> = {
  enfants: '🧒 Enfants',
  adultes: '🎉 Adultes',
  entreprises: '💼 Entreprises',
};

export function CatalogueFilters({ value, onChange }: Props) {
  const toggleAudience = (a: Audience) => {
    const has = value.audiences.includes(a);
    onChange({ ...value, audiences: has ? value.audiences.filter((x) => x !== a) : [...value.audiences, a] });
  };
  return (
    <aside className={styles.sidebar}>
      <h3 className={styles.title}>Filtres</h3>

      <div className={styles.group}>
        <h4>Pour qui ?</h4>
        <div className={styles.chips}>
          {AUDIENCES.map((a) => (
            <button
              key={a}
              type="button"
              className={`${styles.chip} ${value.audiences.includes(a) ? styles.chipActive : ''}`}
              onClick={() => toggleAudience(a)}
            >
              {AUDIENCE_LABELS[a]}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <h4>Prix max : {value.maxPrice}€</h4>
        <input
          type="range"
          min={30}
          max={400}
          step={10}
          value={value.maxPrice}
          onChange={(e) => onChange({ ...value, maxPrice: Number(e.target.value) })}
        />
      </div>
    </aside>
  );
}
