import { useStore } from '@nanostores/react';
import { reviewsStore, addReview } from '../../stores/reviews';
import { ReviewList } from './ReviewList';
import { ReviewForm } from './ReviewForm';

export function ReviewsSection({ productId }: { productId: string }) {
  const allReviews = useStore(reviewsStore);
  const reviews = allReviews.filter((r) => r.productId === productId);

  return (
    <>
      <ReviewList reviews={reviews} />
      <ReviewForm onSubmit={(data) => addReview({ productId, ...data })} />
    </>
  );
}
