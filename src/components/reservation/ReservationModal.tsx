import { useState } from 'react';
import type { CartItem, Product } from '../../data/types';
import { createReservation, type ReservationCartItem } from '../../lib/directus';
import styles from './ReservationModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  products: Product[];
  total: number;
}

type Step = 'form' | 'loading' | 'success' | 'error';

export function ReservationModal({ isOpen, onClose, items, products, total }: Props) {
  const [step, setStep] = useState<Step>('form');
  const [trackingToken, setTrackingToken] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [type, setType] = useState<'particulier' | 'professionnel'>('particulier');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateStart, setDateStart] = useState(items.find(i => i.startDate)?.startDate ?? '');
  const [dateEnd, setDateEnd] = useState(items.find(i => i.endDate)?.endDate ?? '');
  const [delivery, setDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  if (!isOpen) return null;

  const notes = items
    .map((i) => {
      const p = products.find((p) => p.id === i.productId);
      return p ? `${p.name} x${i.quantity} (${i.startDate ?? '?'} → ${i.endDate ?? '?'})` : null;
    })
    .filter(Boolean)
    .join('\n');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep('loading');
    try {
      const cartItemsMapped: ReservationCartItem[] = items.map(i => {
        const p = products.find(p => p.id === i.productId);
        return { productId: i.productId, quantity: i.quantity, unit_price: p?.price ?? 0 };
      });

      const token = await createReservation({
        client: {
          type,
          first_name: firstName,
          last_name: lastName,
          company_name: type === 'professionnel' ? company : undefined,
          email,
          phone,
        },
        date_start: dateStart,
        date_end: dateEnd,
        delivery,
        delivery_address: delivery ? deliveryAddress : undefined,
        notes,
        total_price: total,
        cartItems: cartItemsMapped,
      });
      setTrackingToken(token);
      setStep('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur inconnue');
      setStep('error');
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer">✕</button>

        {step === 'form' && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2>Demande de devis</h2>

            <section>
              <h3>Vos informations</h3>
              <div className={styles.typeToggle}>
                <button type="button" className={type === 'particulier' ? styles.active : ''} onClick={() => setType('particulier')}>Particulier</button>
                <button type="button" className={type === 'professionnel' ? styles.active : ''} onClick={() => setType('professionnel')}>Professionnel</button>
              </div>
              <div className={styles.row}>
                <label>
                  Prénom *
                  <input required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Marie" />
                </label>
                <label>
                  Nom *
                  <input required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Dupont" />
                </label>
              </div>
              {type === 'professionnel' && (
                <label>
                  Société *
                  <input required value={company} onChange={e => setCompany(e.target.value)} placeholder="Ma Société SAS" />
                </label>
              )}
              <label>
                Email *
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="marie@exemple.fr" />
              </label>
              <label>
                Téléphone *
                <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="06 12 34 56 78" />
              </label>
            </section>

            <section>
              <h3>Détails de la location</h3>
              <div className={styles.row}>
                <label>
                  Date de début *
                  <input required type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} />
                </label>
                <label>
                  Date de fin *
                  <input required type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} min={dateStart} />
                </label>
              </div>
              <div className={styles.typeToggle}>
                <button type="button" className={!delivery ? styles.active : ''} onClick={() => setDelivery(false)}>Retrait sur place</button>
                <button type="button" className={delivery ? styles.active : ''} onClick={() => setDelivery(true)}>Livraison (+frais)</button>
              </div>
              {delivery && (
                <label>
                  Adresse de livraison *
                  <input required value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="12 rue des Lilas, 67000 Strasbourg" />
                </label>
              )}
            </section>

            <div className={styles.summary}>
              <strong>Récapitulatif</strong>
              <ul>
                {items.map(i => {
                  const p = products.find(p => p.id === i.productId);
                  return p ? <li key={i.productId}>{p.name} x{i.quantity} — {p.price * i.quantity}€</li> : null;
                })}
              </ul>
              <p className={styles.total}>Total estimé : <strong>{total}€</strong></p>
            </div>

            <button type="submit" className={styles.submitBtn}>Envoyer la demande</button>
          </form>
        )}

        {step === 'loading' && (
          <div className={styles.center}>
            <p>Envoi en cours...</p>
          </div>
        )}

        {step === 'success' && (
          <div className={styles.center}>
            <div className={styles.successIcon}>✅</div>
            <h2>Demande envoyée !</h2>
            <p>Nous vous contacterons rapidement pour confirmer votre devis.</p>
            {trackingToken && (
              <div className={styles.tracking}>
                <p>Suivez votre réservation :</p>
                <a href={`/suivi?token=${trackingToken}`} className={styles.trackingLink}>
                  Voir le statut de ma réservation
                </a>
              </div>
            )}
            <button className={styles.submitBtn} onClick={onClose}>Fermer</button>
          </div>
        )}

        {step === 'error' && (
          <div className={styles.center}>
            <div className={styles.errorIcon}>❌</div>
            <h2>Une erreur est survenue</h2>
            <p>{errorMsg}</p>
            <button className={styles.submitBtn} onClick={() => setStep('form')}>Réessayer</button>
          </div>
        )}
      </div>
    </div>
  );
}
