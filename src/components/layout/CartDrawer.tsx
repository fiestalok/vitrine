import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductsContext';
import { Button } from '../ui/Button';
import { formatPrice } from '../../lib/format';
import styles from './CartDrawer.module.css';

export function CartDrawer() {
  const { isOpen, close, items, remove, setQuantity, clear } = useCart();
  const { products } = useProducts();
  const navigate = useNavigate();

  const findProduct = (id: string) => products.find((p) => p.id === id);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  const total = items.reduce((sum, i) => {
    const p = findProduct(i.productId);
    return sum + (p ? p.price * i.quantity : 0);
  }, 0);

  function handleDevis() {
    close();
    navigate('/devis');
  }

  return (
    <>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.open : ''}`}
        onClick={close}
        aria-hidden={!isOpen}
      />
      <aside className={`${styles.drawer} ${isOpen ? styles.open : ''}`} aria-label="Panier">
        <header className={styles.header}>
          <div>
            <h3>Mon panier</h3>
            <p>{items.length === 0 ? 'Aucun article' : `${items.length} article${items.length > 1 ? 's' : ''}`}</p>
          </div>
          <button onClick={close} aria-label="Fermer" className={styles.closeBtn}>✕</button>
        </header>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🛒</div>
            <p className={styles.emptyTitle}>Panier vide</p>
            <p className={styles.emptyText}>Ajoutez des articles depuis le catalogue</p>
            <Button to="/catalogue" variant="primary" size="md">Voir le catalogue</Button>
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
                      <p className={styles.itemPrice}>{formatPrice(p.price)}</p>
                      <div className={styles.qty}>
                        <button onClick={() => setQuantity(i.productId, i.quantity - 1)}>−</button>
                        <span>{i.quantity}</span>
                        <button onClick={() => setQuantity(i.productId, i.quantity + 1)}>+</button>
                      </div>
                    </div>
                    <button className={styles.removeBtn} onClick={() => remove(i.productId)} aria-label="Retirer">🗑</button>
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
              <button className={styles.clearBtn} onClick={clear}>Vider le panier</button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
