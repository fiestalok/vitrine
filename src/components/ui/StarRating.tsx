import styles from './StarRating.module.css';

interface StarRatingProps {
  value: number;
  count?: number;
  size?: 'sm' | 'md';
}

export function StarRating({ value, count, size = 'sm' }: StarRatingProps) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (i < full) return '★';
    if (i === full && half) return '⯨';
    return '☆';
  });
  return (
    <span className={`${styles.wrap} ${styles[size]}`} aria-label={`Note ${value} sur 5`}>
      <span className={styles.stars}>{stars.join('')}</span>
      <span className={styles.value}>{value.toFixed(1)}</span>
      {count !== undefined && <span className={styles.count}>({count})</span>}
    </span>
  );
}
