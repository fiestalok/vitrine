import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { cartStore, openCart } from '../../stores/cart';
import styles from './Navbar.module.css';

const LINKS = [
  { to: '/',                label: 'Accueil' },
  { to: '/catalogue',       label: 'Catalogue' },
  { to: '/entreprise',      label: 'Entreprise' },
  { to: '/qui-sommes-nous', label: 'Qui sommes-nous' },
];

export function Navbar() {
  const store = useStore(cartStore);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pathname, setPathname] = useState('');

  useEffect(() => {
    setMounted(true);
    setPathname(window.location.pathname);
  }, []);

  const totalItems = mounted
    ? store.items.reduce((s, i) => s + i.quantity, 0)
    : 0;

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <a href="/" className={styles.logo} onClick={() => setMobileOpen(false)}>Fiestalo'<span>K</span></a>
        <nav className={`${styles.nav} ${mobileOpen ? styles.navOpen : ''}`} aria-label="Navigation principale">
          {LINKS.map((l) => (
            <a
              key={l.to}
              href={l.to}
              onClick={() => setMobileOpen(false)}
              className={`${styles.link} ${pathname === l.to || (l.to !== '/' && pathname.startsWith(l.to)) ? styles.active : ''}`}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className={styles.actions}>
          <button className={styles.cart} onClick={openCart} aria-label={`Panier, ${totalItems} articles`}>
            🛒 <span className={styles.cartLabel}>Panier</span> {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
          </button>
          <button className={styles.burger} onClick={() => setMobileOpen((v) => !v)} aria-label="Menu" aria-expanded={mobileOpen}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </header>
  );
}
