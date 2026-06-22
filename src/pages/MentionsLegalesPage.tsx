import { PageSEO } from '../components/seo/PageSEO';
import styles from './MentionsLegalesPage.module.css';

export function MentionsLegalesPage() {
  return (
    <div className={styles.wrapper}>
      <PageSEO
        title="Mentions légales"
        description="Mentions légales du site Hoplalo'K — éditeur, hébergement, données personnelles et RGPD."
        path="/mentions-legales"
      />
      <div className={`container ${styles.content}`}>
        <h1 className={styles.title}>Mentions légales</h1>
        <p className={styles.updated}>Dernière mise à jour : juin 2026</p>

        <section className={styles.section}>
          <h2>1. Éditeur du site</h2>
          <p>Le site <strong>hoplalok.fr</strong> est édité par :</p>
          <ul>
            <li><strong>Dénomination sociale :</strong> Hoplalo'K</li>
            <li><strong>Forme juridique :</strong> Association à but lucratif</li>
            <li><strong>Siège social :</strong> XX rue XXXXX, XXXXX Strasbourg (67), France</li>
            <li><strong>N° RNA :</strong> WXXXXXXXXX <em>(en cours d'immatriculation)</em></li>
            <li><strong>N° SIRET :</strong> XXX XXX XXX XXXXX <em>(en cours d'immatriculation)</em></li>
            <li><strong>Téléphone :</strong> +33 6 79 51 59 25</li>
            <li><strong>E-mail :</strong> <a href="mailto:contact@fiestalok.fr">contact@fiestalok.fr</a></li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>2. Directeur de publication</h2>
          <p>Le directeur de la publication est le représentant légal de l'association Hoplalo'K.</p>
          <p><strong>Contact :</strong> <a href="mailto:contact@fiestalok.fr">contact@fiestalok.fr</a></p>
        </section>

        <section className={styles.section}>
          <h2>3. Hébergement du site</h2>
          <p>Le site est hébergé via <strong>GitHub Pages</strong>, un service de GitHub, Inc. :</p>
          <ul>
            <li><strong>Société :</strong> GitHub, Inc. (filiale de Microsoft)</li>
            <li><strong>Adresse :</strong> 88 Colin P Kelly Jr St, San Francisco, CA 94107, États-Unis</li>
            <li><strong>Site web :</strong> <a href="https://pages.github.com" target="_blank" rel="noopener noreferrer">pages.github.com</a></li>
          </ul>
          <p>Le back-office et la base de données sont hébergés sur un <strong>serveur privé virtuel (VPS)</strong> loué auprès de :</p>
          <ul>
            <li><strong>Hébergeur :</strong> IONOS SE</li>
            <li><strong>Adresse :</strong> Elgendorfer Str. 57, 56410 Montabaur, Allemagne</li>
            <li><strong>Site web :</strong> <a href="https://www.ionos.fr" target="_blank" rel="noopener noreferrer">ionos.fr</a></li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. Données personnelles et RGPD</h2>
          <h3>Responsable du traitement</h3>
          <p>L'association Hoplalo'K, dont le siège est mentionné à l'article 1, est responsable du traitement de vos données personnelles.</p>

          <h3>Données collectées</h3>
          <p>Lors de la soumission d'un formulaire de demande de devis, les données suivantes sont collectées :</p>
          <ul>
            <li>Prénom et nom</li>
            <li>Adresse e-mail</li>
            <li>Numéro de téléphone</li>
            <li>Raison sociale (uniquement pour les professionnels)</li>
            <li>Adresse de livraison (si livraison demandée)</li>
            <li>Détail du panier et dates de location souhaitées</li>
          </ul>

          <h3>Finalité du traitement</h3>
          <p>Ces données sont utilisées exclusivement pour :</p>
          <ul>
            <li>Traiter votre demande de devis et y répondre</li>
            <li>Gérer votre réservation et le suivi de votre dossier</li>
            <li>Vous contacter en lien avec votre demande</li>
          </ul>

          <h3>Stockage et sécurité</h3>
          <p>Vos données sont stockées sur notre propre serveur, hébergé en Union Européenne (IONOS, Allemagne). <strong>Aucune donnée personnelle n'est transmise à des tiers.</strong></p>

          <h3>Durée de conservation</h3>
          <p>Vos données sont conservées pour la durée nécessaire au traitement de votre demande et, au-delà, pour satisfaire aux obligations légales et comptables applicables (5 ans maximum).</p>

          <h3>Vos droits</h3>
          <p>Conformément au Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679) et à la loi Informatique et Libertés, vous disposez des droits suivants :</p>
          <ul>
            <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
            <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
            <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données</li>
            <li><strong>Droit à la limitation</strong> : restreindre le traitement de vos données</li>
            <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données</li>
          </ul>
          <p>Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@fiestalok.fr">contact@fiestalok.fr</a></p>
          <p>En cas de réclamation non résolue, vous pouvez saisir la <strong>CNIL</strong> : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">cnil.fr</a></p>
        </section>

        <section className={styles.section}>
          <h2>5. Cookies et stockage local</h2>
          <p>Ce site <strong>n'utilise pas de cookies de suivi ou de profilage</strong>.</p>
          <p>Le site utilise le <strong>stockage local du navigateur</strong> uniquement pour retenir votre panier entre les pages. Ces données restent sur votre appareil et ne sont jamais transmises à nos serveurs.</p>
          <p>Un widget <strong>Cloudflare Turnstile</strong> est intégré sur le formulaire de devis à des fins de protection anti-spam. Ce service est soumis à la <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">politique de confidentialité de Cloudflare</a>.</p>
        </section>

        <section className={styles.section}>
          <h2>6. Propriété intellectuelle</h2>
          <p>L'ensemble des contenus présents sur ce site (textes, images, logo, graphismes, structure) est la propriété exclusive d'Hoplalo'K ou de ses partenaires, et est protégé par le droit d'auteur.</p>
          <p>Toute reproduction, représentation, modification ou exploitation, totale ou partielle, sans autorisation écrite préalable est interdite.</p>
        </section>

        <section className={styles.section}>
          <h2>7. Limitation de responsabilité</h2>
          <p>Hoplalo'K s'efforce de maintenir les informations publiées sur ce site à jour et exactes. Toutefois, nous ne pouvons garantir l'exactitude, l'exhaustivité ou l'actualité des informations diffusées. L'utilisation des informations contenues sur ce site se fait sous l'entière responsabilité de l'utilisateur.</p>
        </section>

        <section className={styles.section}>
          <h2>8. Droit applicable</h2>
          <p>Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>
        </section>
      </div>
    </div>
  );
}
