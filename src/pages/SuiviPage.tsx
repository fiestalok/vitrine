import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchReservationByToken, type ReservationTracking } from '../lib/directus';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import styles from './SuiviPage.module.css';

const STATUS_CONFIG: Record<string, { label: string; color: string; step: number }> = {
  en_attente:     { label: 'En attente de traitement', color: '#f59e0b', step: 1 },
  devis_realise:  { label: 'Devis réalisé',            color: '#3b82f6', step: 2 },
  devis_confirme: { label: 'Devis confirmé',           color: '#10b981', step: 3 },
  terminee:       { label: 'Location terminée',        color: '#6b7280', step: 4 },
  annulee:        { label: 'Annulée',                  color: '#ef4444', step: 0 },
};

const STEPS = ['En attente', 'Devis réalisé', 'Devis confirmé', 'Terminée'];

function formatDate(iso: string) {
  return format(new Date(iso), 'dd MMMM yyyy', { locale: fr });
}

export function SuiviPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? params.get('tracking_token');

  const [reservation, setReservation] = useState<ReservationTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token) { setLoading(false); setNotFound(true); return; }
    fetchReservationByToken(token)
      .then((data) => {
        if (!data) setNotFound(true);
        else setReservation(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className={`container ${styles.center}`}>
        <p>Chargement de votre réservation...</p>
      </div>
    );
  }

  if (notFound || !reservation) {
    return (
      <div className={`container ${styles.center}`}>
        <div className={styles.notFound}>
          <p className={styles.notFoundIcon}>🔍</p>
          <h1>Réservation introuvable</h1>
          <p>Le lien de suivi est invalide ou a expiré.</p>
          <Link to="/" className={styles.backLink}>Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[reservation.status] ?? STATUS_CONFIG.en_attente;
  const isCancelled = reservation.status === 'annulee';

  return (
    <div className={`container ${styles.page}`}>

      <div className={styles.header}>
        <p className={styles.eyebrow}>Suivi de réservation</p>
        <h1>Votre demande de devis</h1>
        <p className={styles.token}>Référence : <code>{reservation.tracking_token.slice(0, 8).toUpperCase()}</code></p>
      </div>

      {/* Barre de progression */}
      {!isCancelled && (
        <div className={styles.progress}>
          {STEPS.map((step, i) => {
            const stepNum = i + 1;
            const done = status.step >= stepNum;
            const current = status.step === stepNum;
            return (
              <div key={step} className={`${styles.progressStep} ${done ? styles.done : ''} ${current ? styles.current : ''}`}>
                <div className={styles.progressDot}>{done ? '✓' : stepNum}</div>
                <span>{step}</span>
                {i < STEPS.length - 1 && <div className={styles.progressLine} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Statut */}
      <div className={styles.statusCard} style={{ borderColor: status.color }}>
        <div className={styles.statusDot} style={{ background: status.color }} />
        <div>
          <p className={styles.statusLabel}>Statut actuel</p>
          <p className={styles.statusValue} style={{ color: status.color }}>{status.label}</p>
        </div>
      </div>

      <div className={styles.grid}>

        {/* Détails */}
        <div className={styles.card}>
          <h2>Détails de la location</h2>
          <dl className={styles.details}>
            <div>
              <dt>Date de début</dt>
              <dd>{formatDate(reservation.date_start)}</dd>
            </div>
            <div>
              <dt>Date de fin</dt>
              <dd>{formatDate(reservation.date_end)}</dd>
            </div>
            <div>
              <dt>Livraison</dt>
              <dd>{reservation.delivery ? `Oui — ${reservation.delivery_address ?? ''}` : 'Retrait sur place'}</dd>
            </div>
            {reservation.total_price > 0 && (
              <div>
                <dt>Total estimé</dt>
                <dd><strong>{reservation.total_price} €</strong></dd>
              </div>
            )}
          </dl>
        </div>

        {/* Articles */}
        {reservation.articles.length > 0 && (
          <div className={styles.card}>
            <h2>Articles réservés</h2>
            <ul className={styles.articleList}>
              {reservation.articles.map((item, i) => (
                <li key={i} className={styles.articleItem}>
                  {item.article?.images_urls?.[0] && (
                    <img src={item.article.images_urls[0]} alt={item.article.name ?? ''} />
                  )}
                  <div>
                    <p className={styles.articleName}>{item.article?.name ?? 'Article'}</p>
                    <p className={styles.articleMeta}>
                      Qté : {item.quantity} · {item.unit_price}€/unité
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>

      {/* Prochaines étapes */}
      <div className={styles.nextSteps}>
        {reservation.status === 'en_attente' && (
          <p>📞 Nous allons vous contacter prochainement pour établir votre devis.</p>
        )}
        {reservation.status === 'devis_realise' && (
          <p>📄 Votre devis est prêt. Vérifiez vos emails et confirmez pour bloquer votre date.</p>
        )}
        {reservation.status === 'devis_confirme' && (
          <p>✅ Votre réservation est confirmée ! Nous vous contacterons pour les détails logistiques.</p>
        )}
        {reservation.status === 'terminee' && (
          <p>🎉 Merci d'avoir fait confiance à Fiestalo'K ! À bientôt pour votre prochaine fête.</p>
        )}
        {reservation.status === 'annulee' && (
          <p>❌ Cette réservation a été annulée. Contactez-nous si vous avez des questions.</p>
        )}
      </div>

      <div className={styles.footer}>
        <Link to="/" className={styles.backLink}>← Retour à l'accueil</Link>
        <a href="mailto:contact@fiestalok.fr" className={styles.contactLink}>Nous contacter</a>
      </div>

    </div>
  );
}
