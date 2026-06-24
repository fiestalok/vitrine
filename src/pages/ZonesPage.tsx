import { Link } from 'react-router-dom';
import { PageSEO } from '../components/seo/PageSEO';
import { Section } from '../components/ui/Section';
import { Button } from '../components/ui/Button';
import styles from './ZonesPage.module.css';

type ZoneEntry = { nom: string; slug?: string };

const ZONE_GROUPS: Array<{ title: string; communes: ZoneEntry[] }> = [
  {
    title: 'Strasbourg & Eurométropole',
    communes: [
      { nom: 'Strasbourg', slug: 'strasbourg' },
      { nom: 'Schiltigheim', slug: 'schiltigheim' },
      { nom: 'Bischheim' },
      { nom: 'Hoenheim' },
      { nom: 'Illkirch-Graffenstaden', slug: 'illkirch' },
      { nom: 'Ostwald' },
      { nom: 'Lingolsheim' },
      { nom: 'Oberhausbergen' },
      { nom: 'Eckbolsheim' },
      { nom: 'Wolfisheim' },
      { nom: 'La Wantzenau' },
      { nom: 'Lampertheim' },
      { nom: 'Souffelweyersheim' },
      { nom: 'Mundolsheim' },
      { nom: 'Geispolsheim' },
    ],
  },
  {
    title: 'Bas-Rhin (67)',
    communes: [
      { nom: 'Haguenau', slug: 'haguenau' },
      { nom: 'Bischwiller' },
      { nom: 'Saverne' },
      { nom: 'Molsheim' },
      { nom: 'Obernai' },
      { nom: 'Sélestat' },
      { nom: 'Wissembourg' },
      { nom: 'Brumath' },
      { nom: 'Erstein' },
      { nom: 'Benfeld' },
    ],
  },
  {
    title: 'Haut-Rhin (68)',
    communes: [
      { nom: 'Colmar', slug: 'colmar' },
      { nom: 'Mulhouse' },
      { nom: 'Guebwiller' },
      { nom: 'Thann' },
      { nom: 'Saint-Louis' },
      { nom: 'Rouffach' },
      { nom: 'Munster' },
    ],
  },
];

const areaServedSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://www.hoplalok.fr/#organization',
  areaServed: ZONE_GROUPS.flatMap((g) =>
    g.communes.map((c) => ({ '@type': 'City', name: c.nom }))
  ),
};

export function ZonesPage() {
  return (
    <>
      <PageSEO
        title="Zones de livraison — Bas-Rhin & Haut-Rhin"
        description="Hoplalo'K livre châteaux gonflables, photobooths et matériel festif dans tout le Bas-Rhin et le Haut-Rhin : Strasbourg, Haguenau, Colmar, Mulhouse et des dizaines de communes."
        path="/zones-de-livraison"
        jsonLd={areaServedSchema}
      />

      <section className={styles.hero}>
        <div className="container">
          <p className={styles.eyebrow}>Hoplalo'K</p>
          <h1 className={styles.h1}>Zones de livraison<br /><span className={styles.accent}>Bas-Rhin & Haut-Rhin</span></h1>
          <p className={styles.lead}>
            Nous livrons et installons votre matériel festif dans tout le Bas-Rhin et le Haut-Rhin.
            Vous ne trouvez pas votre commune ? Contactez-nous, nous trouverons une solution.
          </p>
        </div>
      </section>

      <Section eyebrow="Toutes nos zones" title="Où livrons-nous ?">
        <div className={styles.groups}>
          {ZONE_GROUPS.map((group) => (
            <div key={group.title} className={styles.group}>
              <h2 className={styles.groupTitle}>{group.title}</h2>
              <ul className={styles.communeList}>
                {group.communes.map((c) => (
                  <li key={c.nom} className={styles.communeItem}>
                    {c.slug ? (
                      <Link to={`/location/${c.slug}`} className={styles.communeLink}>
                        {c.nom}
                      </Link>
                    ) : (
                      c.nom
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section background="gradientWarm" eyebrow="Votre ville n'est pas listée ?" title="On livre probablement chez vous.">
        <p className={styles.ctaText}>
          Notre zone de livraison couvre l'ensemble du Bas-Rhin et du Haut-Rhin.
          Demandez un devis gratuit et nous vous confirmons la disponibilité.
        </p>
        <div className={styles.ctaGroup}>
          <Button to="/devis" variant="primary" size="lg">Demander un devis gratuit →</Button>
          <Button to="/catalogue" variant="secondary" size="lg">Voir le catalogue</Button>
        </div>
      </Section>
    </>
  );
}
