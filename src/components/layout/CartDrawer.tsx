import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { cartStore, removeFromCart, setCartQuantity, clearCart, closeCart } from '../../stores/cart';
import { Button } from '../ui/Button';
import { formatPrice, lineTotal, rentalDays } from '../../lib/format';
import type { Product } from '../../data/types';
import styles from './CartDrawer.module.css';

interface CartDrawerProps {
  products: Product[];
}

export function CartDrawer({ products }: CartDrawerProps) {
  const { items, isOpen } = useStore(cartStore);

  const findProduct = (id: string) => products.find((p) => p.id === id);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const total = items.reduce((sum, i) => {
    const p = findProduct(i.productId);
    return sum + (p ? lineTotal(p.price, i.startDate, i.endDate, i.quantity) : 0);
  }, 0);

  function handleDevis() {
    closeCart();
    window.location.href = '/devis';
  }

  return (
    <>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.open : ''}`}
        onClick={closeCart}
        aria-hidden={!isOpen}
      />
      <aside className={`${styles.drawer} ${isOpen ? styles.open : ''}`} aria-label="Panier">
        <header className={styles.header}>
          <div>
            <h3>Mon panier</h3>
            <p>{items.length === 0 ? 'Aucun article' : `${items.length} article${items.length > 1 ? 's' : ''}`}</p>
          </div>
          <button onClick={closeCart} aria-label="Fermer" className={styles.closeBtn}>✕</button>
        </header>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🛒</div>
            <p className={styles.emptyTitle}>Panier vide</p>
            <p className={styles.emptyText}>Ajoutez des articles depuis le catalogue</p>
            <a href="/catalogue" className={styles.catalogueLink}>Voir le catalogue</a>
          </div>
        ) : (
          <>
            <ul className={styles.list}>
              {items.map((i) => {
                const p = findProduct(i.productId);
                if (!p) return null;
                return (
                  <li key={i.productId} className={styles.item}>
                    <img src={p.images[0]} alt={p.name} />
                    <div className={styles.itemBody}>
                      <p className={styles.itemName}>{p.name}</p>
                      {(() => {
                        const d = rentalDays(i.startDate, i.endDate);
                        return (
                          <p className={styles.itemPrice}>
                            {formatPrice(p.price)}
                            {d > 0 && (
                              <> · {d} jour{d > 1 ? 's' : ''} · <strong>{lineTotal(p.price, i.startDate, i.endDate, i.quantity)}€</strong></>
                            )}
                          </p>
                        );
                      })()}
                      <div className={styles.qty}>
                        <button onClick={() => setCartQuantity(i.productId, i.quantity - 1)}>−</button>
                        <span>{i.quantity}</span>
                        <button onClick={() => setCartQuantity(i.productId, i.quantity + 1)}>+</button>
                      </div>
                    </div>
                    <button className={styles.removeBtn} onClick={() => removeFromCart(i.productId)} aria-label="Retirer">🗑</button>
                  </li>
                );
              })}
            </ul>
            <footer className={styles.footer}>
              <div className={styles.totalRow}>
                <span>Total estimé</span>
                <strong>{total}€</strong>
              </div>
              <Button variant="primary" size="lg" onClick={handleDevis}>
                Demander un devis
              </Button>
              <button className={styles.clearBtn} onClick={clearCart}>Vider le panier</button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
