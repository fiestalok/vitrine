import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import styles from './Navbar.module.css';

const LINKS = [
  { to: '/',                label: 'Accueil' },
  { to: '/catalogue',       label: 'Catalogue' },
  { to: '/entreprise',      label: 'Entreprise' },
  { to: '/qui-sommes-nous', label: 'Qui sommes-nous' },
];

export function Navbar() {
  const { totalItems, open } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo} onClick={() => setMobileOpen(false)}>Fiestalo'<span>K</span></Link>
        <nav className={`${styles.nav} ${mobileOpen ? styles.navOpen : ''}`} aria-label="Navigation principale">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.actions}>
          <button className={styles.cart} onClick={open} aria-label={`Panier, ${totalItems} articles`}>
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
