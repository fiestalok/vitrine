import { useRef, useState } from 'react';
import { format } from 'date-fns';
import { addToCart, openCart } from '../../stores/cart';
import { AvailabilityCalendar, type DateRange } from './AvailabilityCalendar';
import { UNAVAILABLE_UNTIL_JUNE_22 } from '../../data/unavailable';
import { formatRange, rentalDays } from '../../lib/format';
import type { Product } from '../../data/types';
import styles from '../../views/ProductPage.module.css';

export function AddToCartButton({ product }: { product: Product }) {
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  const planningRef = useRef<HTMLElement>(null);

  const rangeComplete = Boolean(range.start && range.end);
  const startISO = range.start ? format(range.start, 'yyyy-MM-dd') : null;
  const endISO = range.end ? format(range.end, 'yyyy-MM-dd') : null;
  const days = rentalDays(startISO, endISO);
  const totalPrice = product.price * days;

  function handleAdd() {
    if (!range.start || !range.end) return;
    addToCart({
      productId: product.id,
      startDate: format(range.start, 'yyyy-MM-dd'),
      endDate: format(range.end, 'yyyy-MM-dd'),
      quantity: 1,
    });
    openCart();
  }

  function handleAddOrScroll() {
    if (!rangeComplete) {
      planningRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    handleAdd();
  }

  return (
    <>
      {rangeComplete && startISO && endISO && (
        <p className={styles.selected}>
          {formatRange(startISO, endISO)} — {days} jour{days > 1 ? 's' : ''} ·{' '}
          <strong>{totalPrice}€</strong>
        </p>
      )}

      <button className={styles.addBtn} onClick={handleAddOrScroll}>
        {rangeComplete ? '+ Ajouter au panier' : '+ Voir les disponibilités'}
      </button>

      <section ref={planningRef} className={styles.block}>
        <header>
          <h2>Disponibilités</h2>
          <p>Sélectionne une plage de dates pour réserver.</p>
        </header>
        <AvailabilityCalendar
          productId={product.id}
          unavailableDates={UNAVAILABLE_UNTIL_JUNE_22}
          range={range}
          onChange={setRange}
        />
        {rangeComplete && (
          <button className={styles.addBtn} onClick={handleAdd}>
            + Ajouter au panier
          </button>
        )}
      </section>
    </>
  );
}
