import { useEffect, useState } from 'react';
import { loadJSON, saveJSON } from '../../lib/storage';
import { initGTM } from '../../lib/analytics';
import styles from './CookieBanner.module.css';

const STORAGE_KEY = 'fiestalok.cookies.v1';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = loadJSON<string | null>(STORAGE_KEY, null);
    if (consent === 'accepted') {
      initGTM();
    } else if (consent === null) {
      setVisible(true);
    }
  }, []);

  function accept() {
    saveJSON(STORAGE_KEY, 'accepted');
    initGTM();
    setVisible(false);
  }

  function refuse() {
    saveJSON(STORAGE_KEY, 'refused');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.banner} role="dialog" aria-label="Gestion des cookies">
        <p className={styles.title}>🍪 Cookies</p>
        <p className={styles.text}>
          Nous utilisons Google Analytics pour mesurer l'audience du site et améliorer nos services.
          Aucune donnée n'est revendue à des tiers.{' '}
          <a href="/#/mentions-legales">En savoir plus</a>
        </p>
        <div className={styles.actions}>
          <button className={styles.refuse} onClick={refuse}>Refuser</button>
          <button className={styles.accept} onClick={accept}>Accepter</button>
        </div>
      </div>
    </div>
  );
}
