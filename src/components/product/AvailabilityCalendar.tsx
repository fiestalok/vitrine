import { useMemo, useState } from 'react';
import {
  startOfMonth, endOfMonth, eachDayOfInterval, format,
  addMonths, isSameMonth, isSameDay, isBefore, startOfDay,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import styles from './AvailabilityCalendar.module.css';

interface Props {
  productId: string;
  unavailableDates: string[];
  value: Date | null;
  onChange: (date: Date) => void;
}

export function AvailabilityCalendar({ unavailableDates, value, onChange }: Props) {
  const [view, setView] = useState(() => startOfMonth(new Date()));
  const today = startOfDay(new Date());

  const days = useMemo(() => {
    const start = startOfMonth(view);
    const end = endOfMonth(view);
    return eachDayOfInterval({ start, end });
  }, [view]);

  const isUnavailable = (d: Date) => unavailableDates.includes(format(d, 'yyyy-MM-dd'));
  const startWeekday = (days[0].getDay() + 6) % 7; // Monday = 0

  return (
    <div className={styles.cal}>
      <header className={styles.header}>
        <button onClick={() => setView(addMonths(view, -1))} aria-label="Mois précédent">‹</button>
        <span data-testid="current-month">{format(view, 'MMMM yyyy', { locale: fr })}</span>
        <button onClick={() => setView(addMonths(view, 1))} aria-label="Mois suivant">›</button>
      </header>
      <div className={styles.weekdays}>
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className={styles.grid}>
        {Array.from({ length: startWeekday }).map((_, i) => <span key={`b${i}`} />)}
        {days.map((d) => {
          const past = isBefore(d, today) && !isSameDay(d, today);
          const unavail = isUnavailable(d);
          const selected = value && isSameDay(d, value);
          return (
            <button
              key={d.toISOString()}
              disabled={past || unavail || !isSameMonth(d, view)}
              className={`${styles.day} ${unavail ? styles.unavail : ''} ${selected ? styles.selected : ''}`}
              onClick={() => onChange(d)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
      <div className={styles.legend}>
        <span><span className={`${styles.dot} ${styles.unavailDot}`} /> Indisponible</span>
        <span><span className={`${styles.dot} ${styles.selectedDot}`} /> Sélectionné</span>
      </div>
    </div>
  );
}
