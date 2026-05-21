import { useState } from 'react';
import { format } from 'date-fns';
import { addToCart, openCart } from '../../stores/cart';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { UNAVAILABLE_DATES } from '../../data/unavailable';
import type { Product } from '../../data/types';
import styles from '../../views/ProductPage.module.css';

export function AddToCartButton({ product }: { product: Product }) {
  const [date, setDate] = useState<Date | null>(null);

  function handleAdd() {
    addToCart({
      productId: product.id,
      startDate: date ? format(date, 'yyyy-MM-dd') : null,
      endDate: date ? format(date, 'yyyy-MM-dd') : null,
      quantity: 1,
    });
    openCart();
  }

  return (
    <>
      <section className={styles.block}>
        <header><h2>Disponibilités</h2><p>Choisis ta date pour vérifier la dispo.</p></header>
        <AvailabilityCalendar
          productId={product.id}
          unavailableDates={UNAVAILABLE_DATES[product.id] ?? []}
          value={date}
          onChange={setDate}
        />
        {date && <p className={styles.selected}>Date sélectionnée : <strong>{format(date, 'dd/MM/yyyy')}</strong></p>}
      </section>
      <button className={styles.addBtn} onClick={handleAdd}>+ Ajouter au panier</button>
    </>
  );
}
