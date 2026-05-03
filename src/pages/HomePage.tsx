import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Section } from '../components/ui/Section';
import { Bubbles } from '../components/ui/Bubbles';
import { Castle } from '../components/ui/Castle';
import { ProductCard } from '../components/product/ProductCard';
import productsRaw from '../data/products.json';
import { CATEGORIES } from '../data/categories';

const CAT_COLORS: Record<string, { bg: string; circle: string }> = {
  'chateau-gonflable': { bg: '#FFF0F0', circle: '#FF6B6B' },
  'accessoire':        { bg: '#F3EEFF', circle: '#8E72D9' },
  'restauration':      { bg: '#FFFBE6', circle: '#FFD84D' },
  'enceintes':         { bg: '#E8FDFB', circle: '#4ECDC4' },
};
import type { Product } from '../data/types';
import styles from './HomePage.module.css';

const products = productsRaw as unknown as Product[];
const featured = products.slice(0, 6);

const STEPS = [
  { n: '01', icon: '🏰', iconBg: '#D4F0EE', title: 'Choisissez', text: 'Naviguez par catégorie ou utilisez les filtres. Besoin d\'un conseil ? Contactez-nous.' },
  { n: '02', icon: '📅', iconBg: '#FFF3C4', title: 'Livraison ou retrait', text: 'Livraison sur site en Alsace ou retrait dans notre dépôt à Strasbourg.' },
  { n: '03', icon: '🚚', iconBg: '#D4F0E0', title: 'On installe', text: 'Notre équipe monte et sécurise le matériel sur place. Démonstration incluse.' },
  { n: '04', icon: '🎉', iconBg: '#FFE0DC', title: 'Vous kiffez', text: 'Profitez de votre fête sans stress. À l\'heure convenue, on revient tout démonter.' },
];

const TRUST = [
  { kicker: 'Pro', label: 'Équipe certifiée' },
  { kicker: '100%', label: 'Alsacien' },
  { kicker: 'Homologué CE', label: 'Norme EN 14960' },
  { kicker: 'RC Pro', label: 'Assurance incluse' },
];

export function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <Bubbles variant="hero" />
        <Castle size={144} rotation={-4} className={styles.castleHero} />
        <div className={`container ${styles.heroInner}`}>
          <div>
            <Badge tone="danger" rotation={-3}>LES KINGS DU GONFLABLE 👑</Badge>
            <h1 className={styles.title}>
              Ta fête va<br/>
              <span className={styles.titleAccent}>décoller.</span>
            </h1>
            <p className={styles.lead}>
              Châteaux gonflables, photobooths, sono et bien plus —<br/>
              on s'occupe de tout, vous kiffez.
            </p>
            <div className={styles.ctas}>
              <Button to="/catalogue" variant="primary" size="lg">Voir le catalogue →</Button>
              <Button to="/entreprise" variant="secondary" size="lg">Offres entreprise</Button>
            </div>
          </div>
          <ul className={styles.trust}>
            {TRUST.map((t) => (
              <li key={t.kicker}><strong>{t.kicker}</strong><span>{t.label}</span></li>
            ))}
          </ul>
        </div>
      </section>

      <Section background="gradientWarm" eyebrow="Simple & rapide" title="Comment ça marche ?">
        <Castle size={220} rotation={6} className={styles.castleWarm} />
        <div className={styles.steps}>
          {STEPS.map((s) => (
            <article key={s.n} className={styles.step}>
              <div className={styles.stepFlipper}>
                <div className={styles.stepFront}>
                  <span className={styles.stepIcon} style={{ background: s.iconBg }}>{s.icon}</span>
                  <span className={styles.stepNum}>{s.n}</span>
                  <h3>{s.title}</h3>
                </div>
                <div className={styles.stepBack}>
                  <span className={styles.stepNum}>{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Nos catégories" title="Tout ce qu'il faut pour la fête">
        <div className={styles.categories}>
          {CATEGORIES.map((c) => {
            const col = CAT_COLORS[c.id];
            return (
              <Link key={c.id} to={`/catalogue?cat=${c.id}`} className={styles.cat}
                style={{ '--cat-color': col.circle, '--cat-bg': col.bg } as React.CSSProperties}>
                <span className={styles.catCircle} style={{ background: col.bg }}>
                  <span className={styles.catEmoji}>{c.emoji}</span>
                </span>
                <span className={styles.catLabel}>{c.label}</span>
                <span className={styles.catLink}>Voir →</span>
              </Link>
            );
          })}
        </div>
      </Section>

      <Section background="gradientCool" eyebrow="Produits stars" title="On dirait qu'ils kiffent.">
        <Castle size={200} rotation={-7} className={styles.castleCool} />
        <div className={styles.productGrid}>
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        <div className={styles.center}>
          <Button to="/catalogue" variant="primary" size="md">Voir tout le catalogue →</Button>
        </div>
      </Section>

      <Section eyebrow="Pourquoi nous" title="L'événementiel alsacien, avec le cœur.">
        <Castle size={260} rotation={30} className={styles.castleDark} />
        <p className={styles.darkLead}>Fiestalo'K est née d'une passion simple : rendre chaque fête mémorable. Basée à Strasbourg, on intervient dans tout le Bas-Rhin et le Haut-Rhin.</p>
        <div className={styles.values}>
          {[
            { icon: '🛡️', title: 'Matériel homologué CE', text: 'Norme EN 14960 sur tous nos gonflables.' },
            { icon: '📋', title: 'Assurance RC Pro', text: 'Votre événement est couvert.' },
            { icon: '🎪', title: 'Équipe pro', text: 'On monte, on sécurise, avec le sourire.' },
            { icon: '📍', title: 'Ancrage local', text: 'Livraison Bas-Rhin & Haut-Rhin sans surcoût.' },
          ].map((v) => (
            <article key={v.title} className={styles.value}>
              <span className={styles.valueIcon}>{v.icon}</span>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
