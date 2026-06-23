import { useMemo, useState, useEffect } from 'react';
import {
  startOfMonth, endOfMonth, eachDayOfInterval, format,
  addMonths, isSameMonth, isSameDay, isBefore, isAfter, startOfDay,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { fetchUnavailableDates } from '../../lib/directus';
import styles from './AvailabilityCalendar.module.css';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface Props {
  productId: string;
  articleIds: number[];
  totalArticles: number;
  range: DateRange;
  onChange: (range: DateRange) => void;
}

export function AvailabilityCalendar({ articleIds, totalArticles, range, onChange }: Props) {
  const [view, setView] = useState(() => startOfMonth(new Date()));
  const [rangeError, setRangeError] = useState(false);
  const [unavailDates, setUnavailDates] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const today = startOfDay(new Date());

  const articleKey = articleIds.join(',');
  useEffect(() => {
    if (articleIds.length === 0 || totalArticles === 0) { setUnavailDates([]); return; }
    let cancelled = false;
    setLoadingDates(true);
    const monthStart = format(startOfMonth(view), 'yyyy-MM-dd');
    const monthEnd   = format(endOfMonth(view),   'yyyy-MM-dd');
    fetchUnavailableDates(articleIds, monthStart, monthEnd, totalArticles)
      .then((dates) => { if (!cancelled) setUnavailDates(dates); })
      .catch(() => { if (!cancelled) setUnavailDates([]); })
      .finally(() => { if (!cancelled) setLoadingDates(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleKey, totalArticles, view]);

  const days = useMemo(() => {
    const start = startOfMonth(view);
    const end   = endOfMonth(view);
    return eachDayOfInterval({ start, end });
  }, [view]);

  const unavailSet = useMemo(() => new Set(unavailDates), [unavailDates]);
  const isUnavailable = (d: Date) => unavailSet.has(format(d, 'yyyy-MM-dd'));
  const startWeekday = (days[0].getDay() + 6) % 7;

  const rangeHasBlockedDay = (start: Date, end: Date) =>
    eachDayOfInterval({ start, end }).some(
      (d) => isUnavailable(d) || (isBefore(d, today) && !isSameDay(d, today)),
    );

  function handleDayClick(d: Date) {
    setRangeError(false);
    if (!range.start || range.end) { onChange({ start: d, end: null }); return; }
    if (isBefore(d, range.start))  { onChange({ start: d, end: null }); return; }
    if (isSameDay(d, range.start)) { onChange({ start: range.start, end: d }); return; }
    if (rangeHasBlockedDay(range.start, d)) { setRangeError(true); return; }
    onChange({ start: range.start, end: d });
  }

  return (
    <div className={styles.cal}>
      <header className={styles.header}>
        <button onClick={() => setView(addMonths(view, -1))} aria-label="Mois précédent">‹</button>
        <span data-testid="current-month">
          {format(view, 'MMMM yyyy', { locale: fr })}
          {loadingDates && <span style={{ fontSize: '0.7em', opacity: 0.5, marginLeft: '0.5em' }}>…</span>}
        </span>
        <button onClick={() => setView(addMonths(view, 1))} aria-label="Mois suivant">›</button>
      </header>
      <div className={styles.weekdays}>
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className={styles.grid}>
        {Array.from({ length: startWeekday }).map((_, i) => <span key={`b${i}`} />)}
        {days.map((d) => {
          const past    = isBefore(d, today) && !isSameDay(d, today);
          const unavail = isUnavailable(d);
          const isStart = range.start && isSameDay(d, range.start);
          const isEnd   = range.end   && isSameDay(d, range.end);
          const inRange =
            range.start && range.end &&
            isAfter(d, range.start) && isBefore(d, range.end);
          return (
            <button
              key={d.toISOString()}
              disabled={past || unavail || !isSameMonth(d, view)}
              className={[
                styles.day,
                past    ? styles.dayPast   : '',
                unavail ? styles.unavail   : '',
                isStart ? styles.rangeStart : '',
                isEnd   ? styles.rangeEnd   : '',
                inRange ? styles.inRange    : '',
              ].filter(Boolean).join(' ')}
              onClick={() => handleDayClick(d)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
      {rangeError && (
        <p role="alert" className={styles.error}>
          Cette plage contient des jours indisponibles, choisissez une autre période.
        </p>
      )}
      <div className={styles.legend}>
        <span><span className={`${styles.dot} ${styles.unavailDot}`} /> Indisponible</span>
        <span><span className={`${styles.dot} ${styles.selectedDot}`} /> Sélectionné</span>
      </div>
    </div>
  );
}
