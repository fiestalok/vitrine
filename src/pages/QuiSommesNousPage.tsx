import { Section } from '../components/ui/Section';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageSEO } from '../components/seo/PageSEO';
import styles from './QuiSommesNousPage.module.css';

const VALUES = [
  { icon: '❤️', title: 'Passion',       text: 'Hoplalo\'K est née d\'une passion simple : rendre chaque fête unique et mémorable, qu\'il s\'agisse d\'un anniv d\'enfant ou d\'un séminaire d\'entreprise.' },
  { icon: '🤝', title: 'Engagement',    text: 'On s\'engage sur chaque prestation : ponctualité, propreté, et une équipe disponible du montage jusqu\'au démontage.' },
  { icon: '📍', title: 'Ancrage local', text: 'Entreprise 100% alsacienne, on connaît le territoire. On livre dans tout le Bas-Rhin et le Haut-Rhin, souvent le jour même.' },
];

const STATS = [
  { v: 'PRO',           l: 'Équipe certifiée' },
  { v: '100%',          l: 'Alsacien' },
  { v: 'HOMOLOGUÉ CE',  l: 'Norme EN 14960' },
  { v: 'RC PRO',        l: 'Assurance incluse' },
];

export function QuiSommesNousPage() {
  return (
    <>
      <PageSEO
        title="Qui sommes-nous — Équipe festive alsacienne"
        description="Découvrez l'équipe Hoplalo'K : une association alsacienne passionnée par les fêtes et l'événementiel. Certifiés CE, assurés RC Pro, basés à Strasbourg."
        path="/qui-sommes-nous"
      />
      <section className={styles.hero}>
        <div className="container">
          <Badge tone="danger">NOTRE HISTOIRE</Badge>
          <h1 className={styles.title}>Qui <span>sommes-nous ?</span></h1>
          <p className={styles.lead}>Une équipe alsacienne, pro et passionnée par les belles fêtes.</p>
        </div>
      </section>

      <Section background="gradientWarm">
        <div className={styles.story}>
          <div className={styles.photo}>
            <img
              src="/equipe.webp"
              width={1200}
              height={900}
              loading="lazy"
              alt="L'équipe Hoplalo'K devant le château gonflable Crocodile World"
            />
            <span className={styles.photoTag}>L'équipe Hoplalo'K · Strasbourg · Alsace</span>
          </div>
          <div className={styles.text}>
            <p className={styles.eyebrow}>Notre histoire</p>
            <h2>Tout a commencé par une décision audacieuse.</h2>
            <p>Hoplalo'K, c'est une équipe de copains alsaciens partis d'une idée simple : faire de chaque fête un moment dont on parle encore des mois après. Anniversaire, kermesse, mariage ou team building : peu importe l'occasion, on y met la même énergie.</p>
            <p>Basés à Schiltigheim, aux portes de Strasbourg, on livre et on installe châteaux gonflables, photobooths et sono dans tout le Bas-Rhin et le Haut-Rhin. Vous n'avez plus qu'à profiter.</p>
            <p>Eh oui, on teste nous-mêmes tous nos châteaux gonflables. Pour la science. Mais chez vous, place au sérieux : installation soignée et une équipe à vos côtés du premier message jusqu'au démontage.</p>
            <div className={styles.ctas}>
              <Button to="/catalogue" variant="primary" size="md">Voir nos produits →</Button>
              <Button to="/entreprise" variant="secondary" size="md">Offres entreprise</Button>
            </div>
          </div>
        </div>
      </Section>

      <Section eyebrow="Ce qui nous anime" title="Nos valeurs">
        <div className={styles.values}>
          {VALUES.map((v) => (
            <article key={v.title} className={styles.value}>
              <span className={styles.valueIcon}>{v.icon}</span>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <section className={styles.stats}>
        <div className={`container ${styles.statsGrid}`}>
          {STATS.map((s) => (
            <div key={s.l} className={styles.stat}>
              <strong>{s.v}</strong>
              <span>{s.l}</span>
            </div>
          ))}
        </div>
      </section>

      <Section title="On se rencontre ?">
        <p className={styles.center}>Venez visiter notre dépôt à Strasbourg ou contactez-nous pour un premier échange sans engagement.</p>
        <div className={styles.center}>
          <Button href="mailto:contact@fiestalok.fr" variant="primary" size="lg">Nous contacter →</Button>
        </div>
      </Section>
    </>
  );
}
