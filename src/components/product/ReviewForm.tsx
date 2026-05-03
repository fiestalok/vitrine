import { useState, type FormEvent } from 'react';
import { Button } from '../ui/Button';
import styles from './ReviewForm.module.css';

interface Props {
  onSubmit: (data: { author: string; rating: number; comment: string }) => void;
}

export function ReviewForm({ onSubmit }: Props) {
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) return;
    onSubmit({ author: author.trim(), rating, comment: comment.trim() });
    setAuthor(''); setComment(''); setRating(5);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h4>Laisser un avis</h4>
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} étoile${n > 1 ? 's' : ''}`}>
            {n <= rating ? '★' : '☆'}
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder="Ton prénom"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        required
      />
      <textarea
        placeholder="Ton commentaire..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        required
      />
      <Button type="submit" variant="danger" size="md">Publier l'avis</Button>
    </form>
  );
}
