import { Section } from '../components/ui/Section';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageSEO } from '../components/seo/PageSEO';
import styles from './EntreprisePage.module.css';

const FORMULES = [
  {
    icon: '🏆',
    title: 'Team Building',
    text: 'On vous fournit tout : matériel pour animer votre journée cohésion : parcours gonflables, jeux collectifs, sono pour mettre l\'ambiance.',
    items: ['Parcours & châteaux gonflables', 'Jeux collectifs', 'Matériel sono & enceintes'],
  },
  {
    icon: '🥂',
    title: 'Séminaire & Soirée',
    text: 'On équipe votre événement avec sono pro et photobooth. Vous gérez la com, on s\'occupe du matos.',
    items: ['Sono & enceintes pro', 'Photobooth & miroir 360°', 'Boule à facette & éclairage'],
  },
  {
    icon: '🎪',
    title: 'Kermesse & Famille',
    text: 'On fournit tout le matériel pour régaler petits et grands : châteaux, machines pop-corn & barbe à papa.',
    items: ['Châteaux gonflables', 'Machine pop-corn & barbe à papa', 'Plancha tarte flambée & BBQ'],
  },
];

const BASE = import.meta.env.BASE_URL;
const EVENTS = [
  `${BASE}event1.jpg`,
  `${BASE}event2.jpg`,
  `${BASE}event3.jpg`,
  `${BASE}event4.jpg`,
  `${BASE}event5.jpg`,
  `${BASE}event6.jpg`,
];

const COMPLIANCE = [
  { icon: '🛡️', title: 'Norme EN 14960', text: 'Tous nos équipements gonflables sont certifiés CE et conformes à la norme européenne EN 14960. Contrôle technique annuel obligatoire.' },
  { icon: '📋', title: 'RC Pro & Assurance', text: 'Couverture Responsabilité Civile Professionnelle complète pour tous nos événements. Documentation fournie sur demande pour vos services RH et juridiques.' },
  { icon: '⚡', title: 'Conformité électrique', text: 'Tout le matériel électrique (sono, éclairage, machines) est vérifié et conforme aux normes NF C 15-100. Câblage adapté à vos installations.' },
  { icon: '🧯', title: 'Protocole sécurité', text: 'Briefing sécurité avant chaque installation. Présence d\'un responsable Hoplalo\'K durant le montage et le démontage. Vérification des zones d\'installation.' },
];

export function EntreprisePage() {
  return (
    <>
      <PageSEO
        title="Location matériel événementiel entreprise"
        description="Hoplalo'K équipe vos événements d'entreprise en Alsace : team building, séminaires, kermesses. Matériel festif professionnel, livraison et installation incluses."
        path="/entreprise"
      />
      <section className={styles.hero}>
        <div className="container">
          <Badge tone="danger">SOLUTIONS CORPORATE · ALSACE</Badge>
          <h1 className={styles.title}>L'événementiel <br/>qui donne <span>envie de se retrouver.</span></h1>
          <p className={styles.lead}>De la kermesse d'entreprise au séminaire festif — on s'occupe de tout, vous profitez.</p>
          <div className={styles.ctas}>
            <Button variant="primary" size="lg">Demander un devis →</Button>
            <Button to="/catalogue" variant="secondary" size="lg">Voir le catalogue</Button>
          </div>
        </div>
      </section>

<Section eyebrow="Ce qu'on propose" title="Nos formules entreprise">
        <div className={styles.formules}>
          {FORMULES.map((f) => (
            <article key={f.title} className={styles.formule}>
              <div className={styles.formuleHead}>
                <span className={styles.formuleIcon}>{f.icon}</span>
                <h3>{f.title}</h3>
              </div>
              <p>{f.text}</p>
              <ul>
                {f.items.map((i) => <li key={i}>✓ {i}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section background="gradientCool" eyebrow="En images" title="Nos événements corporate">
        <div className={styles.gallery}>
          {EVENTS.map((src) => (
            <div key={src} className={styles.galleryItem}>
              <img src={src} alt="" />
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Conformité & sécurité" title="Chaque détail, certifié et sécurisé.">
        <div className={styles.compliance}>
          {COMPLIANCE.map((c) => (
            <article key={c.title} className={styles.complianceItem}>
              <span className={styles.complianceIcon}>{c.icon}</span>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section background="gradientWarm" title="Prêt à organiser votre prochain événement ?">
        <p className={styles.darkLead}>Devis gratuit sous 24h. On s'adapte à votre budget et à vos contraintes logistiques.</p>
        <div className={styles.center}>
          <Button variant="primary" size="lg">Demander un devis gratuit →</Button>
        </div>
      </Section>
    </>
  );
}
