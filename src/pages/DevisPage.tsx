import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import { createReservation, type ReservationCartItem } from '../lib/directus';
import { formatPrice, lineTotal, rentalDays } from '../lib/format';
import { PageSEO } from '../components/seo/PageSEO';
import styles from './DevisPage.module.css';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string;

type Step = 'form' | 'loading' | 'success' | 'error';

export function DevisPage() {
  const { items, clear } = useCart();
  const { products } = useProducts();
  const navigate = useNavigate();
  const turnstileRef = useRef<TurnstileInstance>(null);

  const [step, setStep] = useState<Step>('form');
  const [trackingToken, setTrackingToken] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cfToken, setCfToken] = useState('');

  const [type, setType] = useState<'particulier' | 'professionnel'>('particulier');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const datedItem = items.find((i) => i.startDate && i.endDate);
  const dateStart = datedItem?.startDate ?? '';
  const dateEnd = datedItem?.endDate ?? '';
  const [delivery, setDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const findProduct = (id: string) => products.find(p => p.id === id);

  const total = items.reduce((sum, i) => {
    const p = findProduct(i.productId);
    return sum + (p ? lineTotal(p.price, i.startDate, i.endDate, i.quantity) : 0);
  }, 0);

  const notes = items
    .map(i => {
      const p = findProduct(i.productId);
      return p ? `${p.name} x${i.quantity} (${i.startDate ?? '?'} → ${i.endDate ?? '?'})` : null;
    })
    .filter(Boolean)
    .join('\n');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cfToken) return;

    setStep('loading');
    try {
      const cartItemsMapped: ReservationCartItem[] = items.map(i => {
        const p = findProduct(i.productId);
        return { numericId: p?.numericId ?? 0, quantity: i.quantity, unit_price: p?.price ?? 0 };
      });

      const token = await createReservation({
        client: { type, first_name: firstName, last_name: lastName, company_name: type === 'professionnel' ? company : "", email, phone, address: delivery ? deliveryAddress : "" },
        date_start: dateStart,
        date_end: dateEnd,
        delivery,
        delivery_address: delivery ? deliveryAddress : undefined,
        notes,
        total_price: total,
        cartItems: cartItemsMapped,
        cf_token: cfToken,
      });
      setTrackingToken(token);
      clear();
      setStep('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur inconnue');
      // Réinitialise Turnstile pour permettre un nouvel essai
      turnstileRef.current?.reset();
      setCfToken('');
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
      <PageSEO
        title="Demande de devis — Location matériel festif"
        description="Envoyez votre demande de devis pour louer du matériel festif en Alsace. Réponse rapide, livraison dans tout le Bas-Rhin et le Haut-Rhin."
        path="/devis"
      />
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
                    <label>Prénom *<input required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Marie" /></label>
                    <label>Nom *<input required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Dupont" /></label>
                  </div>
                  {type === 'professionnel' && (
                    <label>Société *<input required value={company} onChange={e => setCompany(e.target.value)} placeholder="Ma Société SAS" /></label>
                  )}
                  <label>Email *<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="marie@exemple.fr" /></label>
                  <label>Téléphone *<input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="06 12 34 56 78" /></label>
                </section>

                <section>
                  <h2>Détails de la location</h2>
                  <div className={styles.row}>
                    <label>Date de début *<input required type="date" value={dateStart} readOnly className={styles.readonlyDate} /></label>
                    <label>Date de fin *<input required type="date" value={dateEnd} readOnly className={styles.readonlyDate} /></label>
                  </div>
                  <p className={styles.dateHint}>Pour modifier les dates, retournez dans votre panier.</p>
                  <div className={styles.typeToggle}>
                    <button type="button" className={!delivery ? styles.active : ''} onClick={() => setDelivery(false)}>Retrait sur place</button>
                    <button type="button" className={delivery ? styles.active : ''} onClick={() => setDelivery(true)}>Livraison (+frais)</button>
                  </div>
                  {delivery && (
                    <label>Adresse de livraison *<input required value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="12 rue des Lilas, 67000 Strasbourg" /></label>
                  )}
                </section>

                <Turnstile
                  ref={turnstileRef}
                  siteKey={SITE_KEY}
                  onSuccess={setCfToken}
                  onExpire={() => setCfToken('')}
                  onError={() => setCfToken('')}
                  options={{ language: 'fr' }}
                />

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={!cfToken}
                >
                  Envoyer la demande
                </button>
              </form>

              <aside className={styles.summary}>
                <h2>Récapitulatif</h2>
                <ul>
                  {items.map(i => {
                    const p = findProduct(i.productId);
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
                {dateStart && (
                  <div className={styles.daysRow}>
                    <span>Durée</span>
                    <strong>{rentalDays(dateStart, dateEnd)} jour{rentalDays(dateStart, dateEnd) > 1 ? 's' : ''}</strong>
                  </div>
                )}
                <div className={styles.totalRow}>
                  <span>Total estimé</span>
                  <strong>{total}€</strong>
                </div>
              </aside>
            </div>
          </>
        )}

        {step === 'loading' && (
          <div className={styles.center}><p>Envoi en cours…</p></div>
        )}

        {step === 'success' && (
          <div className={styles.center}>
            <div className={styles.icon}>✅</div>
            <h1>Demande envoyée !</h1>
            <p>Nous vous contacterons rapidement pour confirmer votre devis.</p>
            {trackingToken && (
              <div className={styles.tracking}>
                <p>Suivez l'avancement de votre réservation :</p>
                <Link to={`/suivi?token=${trackingToken}`} className={styles.trackingLink}>
                  Voir le statut de ma réservation →
                </Link>
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
