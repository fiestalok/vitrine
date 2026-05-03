import type { Review } from '../../data/types';
import { StarRating } from '../ui/StarRating';
import styles from './ReviewList.module.css';

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className={styles.empty}>Pas encore d'avis. Sois le premier à kiffer !</p>;
  }
  return (
    <ul className={styles.list}>
      {reviews.map((r) => (
        <li key={r.id} className={styles.item}>
          <div className={styles.head}>
            <span className={styles.avatar}>{r.author.charAt(0).toUpperCase()}</span>
            <strong>{r.author}</strong>
            <StarRating value={r.rating} />
            <time>{r.date}</time>
          </div>
          <p className={styles.body}>{r.comment}</p>
        </li>
      ))}
    </ul>
  );
}
