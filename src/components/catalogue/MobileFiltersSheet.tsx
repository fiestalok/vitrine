import { AUDIENCES, type Audience } from '../../data/categories';
import type { FilterState } from '../../lib/filterProducts';
import styles from './MobileFiltersSheet.module.css';

interface Props {
  open: boolean;
  value: FilterState;
  maxAvailable: number;
  onChange: (f: FilterState) => void;
  onDateChange?: (f: FilterState) => void;
  onClose: () => void;
}

const AUDIENCE_LABELS: Record<Audience, string> = {
  enfants:     '🧒 Enfants',
  adultes:     '🎉 Adultes',
  entreprises: '💼 Entreprises',
};

export function MobileFiltersSheet({ open, value, maxAvailable, onChange, onDateChange, onClose }: Props) {
  if (!open) return null;

  const today = new Date().toISOString().split('T')[0];

  const emitDate = (newFilter: FilterState) => {
    if (onDateChange && (newFilter.dateStart !== value.dateStart || newFilter.dateEnd !== value.dateEnd)) {
      onDateChange(newFilter);
    } else {
      onChange(newFilter);
    }
  };

  const toggleAudience = (a: Audience) => {
    const has = value.audiences.includes(a);
    onChange({
      ...value,
      audiences: has ? value.audiences.filter((x) => x !== a) : [...value.audiences, a],
    });
  };

  const hasActiveFilters =
    value.audiences.length > 0 || value.maxPrice < maxAvailable || !!value.dateStart;

  return (
    <div
      className={styles.overlay}
      data-testid="sheet-overlay"
      onClick={onClose}
    >
      <div
        className={styles.sheet}
        data-testid="sheet-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.handle} />
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
                  emitDate({ ...value, dateStart: newStart, dateEnd: newStart });
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
                onChange={(e) => emitDate({ ...value, dateEnd: e.target.value })}
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
            Budget max <strong className={styles.priceVal}>{value.maxPrice}€</strong>
          </p>
          <input
            type="range"
            min={30}
            max={maxAvailable}
            step={10}
            value={value.maxPrice}
            onChange={(e) => onChange({ ...value, maxPrice: Number(e.target.value) })}
          />
          <div className={styles.priceRange}>
            <span>30€</span>
            <span>{maxAvailable}€</span>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            className={styles.reset}
            onClick={() =>
              onChange({ ...value, audiences: [], maxPrice: maxAvailable, dateStart: '', dateEnd: '' })
            }
          >
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
