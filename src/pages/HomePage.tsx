import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Section } from '../components/ui/Section';
import { ProductCard } from '../components/product/ProductCard';
import { CATEGORIES } from '../data/categories';
import { useProducts } from '../context/ProductsContext';
import styles from './HomePage.module.css';

const STEPS = [
  { n: '01', title: 'Choisissez', text: 'Naviguez par catégorie ou utilisez les filtres. Besoin d\'un conseil ? Contactez-nous.' },
  { n: '02', title: 'Livraison ou retrait', text: 'Livraison sur site en Alsace ou retrait dans notre dépôt à Strasbourg.' },
  { n: '03', title: 'On installe', text: 'Notre équipe monte et sécurise le matériel sur place. Démonstration incluse.' },
  { n: '04', title: 'Vous kiffez', text: 'Profitez de votre fête sans stress. À l\'heure convenue, on revient tout démonter.' },
];

const TRUST = [
  { kicker: 'Pro', label: 'Équipe certifiée' },
  { kicker: '100%', label: 'Alsacien' },
  { kicker: 'Homologué CE', label: 'Norme EN 14960' },
  { kicker: 'RC Pro', label: 'Assurance incluse' },
];

export function HomePage() {
  const { products } = useProducts();
  const featured = products.slice(0, 6);

  return (
    <>
      <section className={styles.hero}>
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

      <Section eyebrow="Simple & rapide" title="Comment ça marche ?">
        <div className={styles.steps}>
          {STEPS.map((s) => (
            <article key={s.n} className={styles.step}>
              <span className={styles.stepNum}>{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Nos catégories" title="Tout ce qu'il faut pour la fête">
        <div className={styles.categories}>
          {CATEGORIES.map((c) => (
            <Link key={c.id} to={`/catalogue?cat=${c.id}`} className={styles.cat}>
              <span className={styles.catEmoji}>{c.emoji}</span>
              <span className={styles.catLabel}>{c.label}</span>
              <span className={styles.catLink}>Voir →</span>
            </Link>
          ))}
        </div>
      </Section>

      <Section eyebrow="Produits stars" title="On dirait qu'ils kiffent.">
        <div className={styles.productGrid}>
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        <div className={styles.center}>
          <Button to="/catalogue" variant="primary" size="md">Voir tout le catalogue →</Button>
        </div>
      </Section>

      <Section background="dark" eyebrow="Pourquoi nous" title="L'événementiel alsacien, avec le cœur.">
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
