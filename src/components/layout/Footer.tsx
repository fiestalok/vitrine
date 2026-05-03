import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div>
          <p className={styles.logo}>Fiestalo'<span>K</span></p>
          <p className={styles.tagline}>Location de matériel festif en Alsace.<br/>On gonfle, vous kiffez.</p>
          <div className={styles.socials}>
            <a href="#" aria-label="Instagram">📷</a>
            <a href="#" aria-label="Facebook">👍</a>
            <a href="#" aria-label="TikTok">🎵</a>
          </div>
        </div>
        <div>
          <h4 className={styles.title}>Navigation</h4>
          <ul>
            <li><Link to="/catalogue">Catalogue</Link></li>
            <li><Link to="/entreprise">Entreprise</Link></li>
            <li><Link to="/qui-sommes-nous">Qui sommes-nous</Link></li>
          </ul>
        </div>
        <div>
          <h4 className={styles.title}>Contact</h4>
          <ul>
            <li>📍 Strasbourg, Alsace</li>
            <li>📞 +33 6 00 00 00 00</li>
            <li>✉️ contact@fiestalok.fr</li>
            <li>🕐 Lun–Sam, 9h–19h</li>
          </ul>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>© 2026 Fiestalo'K — Tous droits réservés</p>
        <p>Fait avec ❤️ en Alsace</p>
      </div>
    </footer>
  );
}
