import { Link } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Section } from '../components/ui/Section';
import { Bubbles } from '../components/ui/Bubbles';
import { Castle } from '../components/ui/Castle';
import { ProductCard } from '../components/product/ProductCard';
import { useProducts } from '../context/ProductsContext';
import { useCategories } from '../context/CategoriesContext';
import { useCart } from '../context/CartContext';
import { PageSEO } from '../components/seo/PageSEO';
import styles from './HomePage.module.css';

const FAQ = [
  {
    q: 'Dans quelles villes livrez-vous ?',
    a: "Nous livrons dans tout le Bas-Rhin et le Haut-Rhin : Strasbourg, Schiltigheim, Illkirch-Graffenstaden, Haguenau, Colmar, Mulhouse et des dizaines d'autres communes.",
    linkLabel: 'Voir toutes les zones →',
    linkTo: '/zones-de-livraison',
  },
  {
    q: 'Livrez-vous le week-end ?',
    a: 'Oui, nous livrons 7j/7 de 8h à 20h, y compris le samedi et le dimanche pour vos fêtes.',
  },
  {
    q: 'Quelle superficie faut-il prévoir pour un château gonflable ?',
    a: 'Comptez au minimum 5 × 5 m de surface plane et dégagée, avec 2 m de hauteur libre au-dessus.',
  },
  {
    q: 'Faut-il une autorisation pour installer un château gonflable ?',
    a: "Pour un usage privé dans votre jardin, aucune autorisation n'est requise. Pour un espace public, nous vous accompagnons dans les démarches.",
  },
];

const CAT_COLORS: Record<string, { bg: string; circle: string }> = {
  'chateau-gonflable': { bg: '#FFF0F0', circle: '#FF6B6B' },
  'accessoire':        { bg: '#F3EEFF', circle: '#8E72D9' },
  'restauration':      { bg: '#FFFBE6', circle: '#FFD84D' },
  'enceintes':         { bg: '#E8FDFB', circle: '#4ECDC4' },
};

const STEPS = [
  { n: '01', icon: '🏰', iconBg: '#D4F0EE', title: 'Choisissez', text: 'Naviguez par catégorie ou utilisez les filtres. Besoin d\'un conseil ? Contactez-nous.' },
  { n: '02', icon: '📅', iconBg: '#FFF3C4', title: 'Livraison ou retrait', text: 'Livraison sur site en Alsace ou retrait dans notre dépôt à Strasbourg.' },
  { n: '03', icon: '🚚', iconBg: '#D4F0E0', title: 'On installe', text: 'Notre équipe monte et sécurise le matériel sur place. Démonstration incluse.' },
  { n: '04', icon: '🎉', iconBg: '#FFE0DC', title: 'Vous profitez', text: 'Profitez de votre fête sans stress. À l\'heure convenue, on revient tout démonter.' },
];

const TRUST = [
  { kicker: 'Pro', label: 'Équipe certifiée' },
  { kicker: '100%', label: 'Alsacien' },
  { kicker: 'Homologué CE', label: 'Norme EN 14960' },
  { kicker: 'RC Pro', label: 'Assurance incluse' },
];

export function HomePage() {
  const { products } = useProducts();
  const { categories } = useCategories();
  const { items: cartItems } = useCart();
  const featured = products.slice(0, 6);
  const cartDatedItem = cartItems.find((i) => i.startDate && i.endDate);

  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollIndicatorRef.current;
    if (!el) return;
    const onScroll = () => {
      if (window.scrollY > 40) el.classList.add(styles.scrollIndicatorHidden);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <PageSEO
        title="Location Château Gonflable Strasbourg & Alsace"
        description="Louez un château gonflable à Strasbourg avec Hoplalo'K. Livraison et installation dans tout le Bas-Rhin et le Haut-Rhin. Photobooths, machines à pop-corn, enceintes — certifiés CE, assurés RC Pro."
        path="/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQ.map(({ q, a }) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text: a },
          })),
        }}
      />
      <section className={styles.hero}>
        <Bubbles variant="hero" />
        <div className={styles.castleBg}>
          <Castle size={380} rotation={-6} noInflate />
        </div>
        <div className={`container ${styles.heroInner}`}>
          <h1 className={`${styles.title} ${styles.animTitle}`}>
            Ta fête va<br/>
            <span className={styles.titleAccent}>décoller.</span>
          </h1>
          <p className={`${styles.lead} ${styles.animLead}`}>
            Châteaux gonflables, photobooths, sono et bien plus —<br/>
            on s'occupe de tout, vous profitez.
          </p>
          <div className={`${styles.ctas} ${styles.animCtas}`}>
            <Button href="mailto:contact@fiestalok.fr" variant="secondary" size="lg" className={styles.ctaDevis}>
              Demander un devis →
            </Button>
            <Button to="/catalogue" variant="secondary" size="lg">
              Voir le catalogue
            </Button>
          </div>
        </div>
        <div
          ref={scrollIndicatorRef}
          className={styles.scrollIndicator}
          aria-hidden="true"
        >
          ↓
        </div>
      </section>

      <ul className={styles.trustBand}>
        {TRUST.map((t) => (
          <li key={t.kicker} className={styles.trustItem}>
            <strong>{t.kicker}</strong>
            <span>{t.label}</span>
          </li>
        ))}
      </ul>

      <Section id="how-it-works" background="gradientWarm" eyebrow="Simple & rapide" title="Comment ça marche ?">
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
          {categories.map((c) => {
            const col = CAT_COLORS[c.id] ?? { bg: '#F5F5F5', circle: '#999' };
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

      <Section background="gradientCool" eyebrow="Produits stars" title="Les préférés de l'Alsace">
        <Castle size={200} rotation={-7} className={styles.castleCool} />
        <div className={styles.productGrid}>
          {featured.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              dateStart={cartDatedItem?.startDate ?? undefined}
              dateEnd={cartDatedItem?.endDate ?? undefined}
            />
          ))}
        </div>
        <div className={styles.center}>
          <Button to="/catalogue" variant="primary" size="md">Voir tout le catalogue →</Button>
        </div>
      </Section>

      <Section eyebrow="Pourquoi nous" title="L'événementiel alsacien, avec le cœur.">
<p className={styles.darkLead}>Hoplalo'K est née d'une passion simple : rendre chaque fête mémorable. Basée à Strasbourg, on intervient dans tout le Bas-Rhin et le Haut-Rhin.</p>
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

      <Section eyebrow="Questions fréquentes" title="Tout ce que vous voulez savoir.">
        <dl className={styles.faq}>
          {FAQ.map((item) => (
            <div key={item.q} className={styles.faqItem}>
              <dt className={styles.faqQ}>{item.q}</dt>
              <dd className={styles.faqA}>
                {item.a}
                {item.linkTo && (
                  <> <Link to={item.linkTo} className={styles.faqLink}>{item.linkLabel}</Link></>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </Section>
    </>
  );
}
