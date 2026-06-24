import { Navigate, Link, useParams } from 'react-router-dom';
import { VILLES } from '../data/villes';
import { PageSEO } from '../components/seo/PageSEO';
import { Button } from '../components/ui/Button';
import { Section } from '../components/ui/Section';
import styles from './VillePage.module.css';

const SERVICES = [
  { catId: 'chateau-gonflable', label: 'Château gonflable', emoji: '🏰', desc: 'Pour enfants et adultes — norme CE EN 14960.' },
  { catId: 'accessoire',        label: 'Photobooth',        emoji: '📸', desc: 'Animation photo pour vos invités.' },
  { catId: 'restauration',      label: 'Machine à pop-corn', emoji: '🍿', desc: 'Parfaite pour toutes les fêtes.' },
  { catId: 'enceintes',         label: 'Enceinte sono',     emoji: '🔊', desc: 'Son de qualité pour votre événement.' },
];

export function VillePage() {
  const { slug } = useParams<{ slug: string }>();
  const ville = VILLES.find((v) => v.slug === slug);

  if (!ville) return <Navigate to="/catalogue" replace />;

  const dept = ville.departement === '67' ? 'Bas-Rhin' : 'Haut-Rhin';

  return (
    <>
      <PageSEO
        title={`Location château gonflable à ${ville.nom}`}
        description={ville.metaDescription}
        path={`/location/${ville.slug}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'FAQPage',
              mainEntity: ville.faq.map(({ q, a }) => ({
                '@type': 'Question',
                name: q,
                acceptedAnswer: { '@type': 'Answer', text: a },
              })),
            },
            {
              '@type': 'Service',
              name: `Location château gonflable à ${ville.nom}`,
              provider: { '@id': 'https://www.hoplalok.fr/#organization' },
              areaServed: { '@type': 'City', name: ville.nom },
            },
          ],
        }}
      />

      <section className={styles.hero}>
        <div className="container">
          <p className={styles.eyebrow}>Hoplalo'K — {dept}</p>
          <h1 className={styles.h1}>
            Location château gonflable<br />
            <span className={styles.accent}>à {ville.nom}</span>
          </h1>
          <p className={styles.intro}>{ville.intro}</p>
          <Button to="/devis" variant="primary" size="lg">
            Demander un devis pour {ville.nom} →
          </Button>
        </div>
      </section>

      <Section eyebrow="Nos équipements" title={`Ce qu'on livre à ${ville.nom}`}>
        <div className={styles.services}>
          {SERVICES.map((s) => (
            <Link key={s.catId} to={`/catalogue?cat=${s.catId}`} className={styles.serviceCard}>
              <span className={styles.serviceEmoji}>{s.emoji}</span>
              <h3 className={styles.serviceLabel}>{s.label}</h3>
              <p className={styles.serviceDesc}>{s.desc}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section eyebrow="Zone couverte" title={`Livraison à ${ville.nom} et alentours`}>
        <p className={styles.zoneText}>
          Nous livrons à <strong>{ville.nom}</strong> et dans les communes proches :{' '}
          {ville.zonesProches.join(', ')}.{' '}
          <Link to="/zones-de-livraison" className={styles.zoneLink}>
            Voir toutes les zones de livraison →
          </Link>
        </p>
      </Section>

      <Section eyebrow="Questions fréquentes" title={`FAQ — Location à ${ville.nom}`}>
        <dl className={styles.faq}>
          {ville.faq.map(({ q, a }) => (
            <div key={q} className={styles.faqItem}>
              <dt className={styles.faqQ}>{q}</dt>
              <dd className={styles.faqA}>{a}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section background="gradientWarm" eyebrow="Prêt ?" title={`Organisez votre fête à ${ville.nom}`}>
        <div className={styles.ctaGroup}>
          <Button to="/devis" variant="primary" size="lg">Demander un devis gratuit →</Button>
          <Button to="/catalogue" variant="secondary" size="lg">Voir le catalogue</Button>
        </div>
      </Section>
    </>
  );
}
