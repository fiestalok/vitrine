import type { FilterState } from '../../lib/filterProducts';
import { AUDIENCES, type Audience } from '../../data/categories';
import styles from './CatalogueFilters.module.css';

interface Props {
  value: FilterState;
  onChange: (f: FilterState) => void;
}

const AUDIENCE_LABELS: Record<Audience, string> = {
  enfants:    '🧒 Enfants',
  adultes:    '🎉 Adultes',
  entreprises:'💼 Entreprises',
};

const today = new Date().toISOString().split('T')[0];

export function CatalogueFilters({ value, onChange }: Props) {
  const toggleAudience = (a: Audience) => {
    const has = value.audiences.includes(a);
    onChange({ ...value, audiences: has ? value.audiences.filter((x) => x !== a) : [...value.audiences, a] });
  };

  const hasActiveFilters =
    value.audiences.length > 0 || value.maxPrice < 400 || value.dateStart || value.dateEnd;

  return (
    <aside className={styles.sidebar}>
      <p className={styles.title}>Filtres</p>

      <div className={styles.group}>
        <p className={styles.groupLabel}>Disponibilité</p>
        <div className={styles.dateRow}>
          <label className={styles.dateLabel}>
            <span>Du</span>
            <input
              type="date"
              min={today}
              value={value.dateStart}
              onChange={(e) => {
                const newStart = e.target.value;
                onChange({
                  ...value,
                  dateStart: newStart,
                  dateEnd: value.dateEnd && value.dateEnd < newStart ? '' : value.dateEnd,
                });
              }}
              className={styles.dateInput}
            />
          </label>
          <label className={styles.dateLabel}>
            <span>Au</span>
            <input
              type="date"
              min={value.dateStart || today}
              value={value.dateEnd}
              onChange={(e) => onChange({ ...value, dateEnd: e.target.value })}
              className={styles.dateInput}
            />
          </label>
        </div>
      </div>

      <div className={styles.group}>
        <p className={styles.groupLabel}>Pour qui ?</p>
        {AUDIENCES.map((a) => (
          <label key={a} className={styles.checkItem}>
            <input
              type="checkbox"
              checked={value.audiences.includes(a)}
              onChange={() => toggleAudience(a)}
            />
            <span>{AUDIENCE_LABELS[a]}</span>
          </label>
        ))}
      </div>

      <div className={styles.group}>
        <p className={styles.groupLabel}>
          Budget max&nbsp;<strong className={styles.priceVal}>{value.maxPrice}€</strong>
        </p>
        <input
          type="range"
          min={30}
          max={400}
          step={10}
          value={value.maxPrice}
          onChange={(e) => onChange({ ...value, maxPrice: Number(e.target.value) })}
        />
        <div className={styles.priceRange}><span>30€</span><span>400€</span></div>
      </div>

      {hasActiveFilters && (
        <button
          className={styles.reset}
          onClick={() => onChange({ ...value, audiences: [], maxPrice: 400, dateStart: '', dateEnd: '' })}
        >
          Réinitialiser
        </button>
      )}
    </aside>
  );
}
