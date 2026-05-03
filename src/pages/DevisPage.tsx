import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import productsRaw from '../data/products.json';
import type { Product } from '../data/types';
import { createReservation, type ReservationCartItem } from '../lib/directus';
import { formatPrice } from '../lib/format';
import styles from './DevisPage.module.css';

const products = productsRaw as unknown as Product[];

type Step = 'form' | 'loading' | 'success' | 'error';

export function DevisPage() {
  const { items, clear } = useCart();
  const navigate = useNavigate();

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

  const total = items.reduce((sum, i) => {
    const p = products.find(p => p.id === i.productId);
    return sum + (p ? p.price * i.quantity : 0);
  }, 0);

  const notes = items
    .map(i => {
      const p = products.find(p => p.id === i.productId);
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
      clear();
      setStep('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur inconnue');
      setStep('error');
    }
  }

  if (items.length === 0 && step === 'form') {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <p>Votre panier est vide.</p>
          <button className={styles.backBtn} onClick={() => navigate('/catalogue')}>
            Voir le catalogue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {step === 'form' && (
          <>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>← Retour</button>
            <h1>Demande de devis</h1>

            <div className={styles.layout}>
              <form onSubmit={handleSubmit} className={styles.form}>
                <section>
                  <h2>Vos informations</h2>
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
                  <h2>Détails de la location</h2>
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

                <button type="submit" className={styles.submitBtn}>Envoyer la demande</button>
              </form>

              <aside className={styles.summary}>
                <h2>Récapitulatif</h2>
                <ul>
                  {items.map(i => {
                    const p = products.find(p => p.id === i.productId);
                    return p ? (
                      <li key={i.productId} className={styles.summaryItem}>
                        <img src={p.images[0]} alt={p.name} />
                        <div>
                          <p>{p.name}</p>
                          <p className={styles.summaryQty}>x{i.quantity} — {formatPrice(p.price * i.quantity)}</p>
                        </div>
                      </li>
                    ) : null;
                  })}
                </ul>
                <div className={styles.totalRow}>
                  <span>Total estimé</span>
                  <strong>{formatPrice(total)}</strong>
                </div>
              </aside>
            </div>
          </>
        )}

        {step === 'loading' && (
          <div className={styles.center}>
            <p>Envoi en cours...</p>
          </div>
        )}

        {step === 'success' && (
          <div className={styles.center}>
            <div className={styles.icon}>✅</div>
            <h1>Demande envoyée !</h1>
            <p>Nous vous contacterons rapidement pour confirmer votre devis.</p>
            {trackingToken && (
              <div className={styles.tracking}>
                <p>Suivez l'avancement de votre réservation :</p>
                <a href={`/suivi?token=${trackingToken}`} className={styles.trackingLink}>
                  Voir le statut de ma réservation →
                </a>
              </div>
            )}
            <button className={styles.submitBtn} onClick={() => navigate('/')}>Retour à l'accueil</button>
          </div>
        )}

        {step === 'error' && (
          <div className={styles.center}>
            <div className={styles.icon}>❌</div>
            <h1>Une erreur est survenue</h1>
            <p>{errorMsg}</p>
            <button className={styles.submitBtn} onClick={() => setStep('form')}>Réessayer</button>
          </div>
        )}

      </div>
    </div>
  );
}
