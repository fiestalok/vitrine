import { Section } from '../components/ui/Section';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import styles from './QuiSommesNousPage.module.css';

const VALUES = [
  { icon: '❤️', title: 'Passion',       text: 'Fiestalo\'K est née d\'une passion simple : rendre chaque fête unique et mémorable, qu\'il s\'agisse d\'un anniv d\'enfant ou d\'un séminaire d\'entreprise.' },
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
      <section className={styles.hero}>
        <div className="container">
          <Badge tone="danger">NOTRE HISTOIRE</Badge>
          <h1 className={styles.title}>Qui <span>sommes-nous ?</span></h1>
          <p className={styles.lead}>Une équipe alsacienne, pro et passionnée par les belles fêtes.</p>
        </div>
      </section>

      <Section>
        <div className={styles.story}>
          <div className={styles.photo}>
            <img src="https://images.unsplash.com/photo-1543007631-283050bb3e8c?w=900" alt="L'équipe Fiestalo'K" />
            <span className={styles.photoTag}>L'équipe Fiestalo'K · Strasbourg · Alsace</span>
          </div>
          <div className={styles.text}>
            <p className={styles.eyebrow}>Notre histoire</p>
            <h2>Tout a commencé par une envie de faire la fête.</h2>
            <p>Tout a commencé par une décision audacieuse : <strong>6 mecs bien gaulés du cerveau</strong> ont décidé de se lancer dans une aventure magique. Pas de bureau, pas de costard — juste une envie folle de rendre chaque fête inoubliable.</p>
            <p>De cette belle idée est née Fiestalo'K à Strasbourg. On équipe des événements à travers toute l'Alsace — des anniversaires d'enfants aux team buildings d'entreprise, en passant par les kermesses de quartier.</p>
            <p>La magie, on ne l'a pas perdue. Notre équipe est là pour vous, du premier coup de fil jusqu'au démontage du dernier château gonflable.</p>
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
          <Button variant="primary" size="lg">Nous contacter →</Button>
        </div>
      </Section>
    </>
  );
}
