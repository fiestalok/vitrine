import type { APIRoute } from 'astro';
import { buildReservationPayload, type ReservationInput } from '../../lib/reservation';

const DIRECTUS_URL = import.meta.env.DIRECTUS_URL ?? 'http://localhost:8055';
const TURNSTILE_SECRET = import.meta.env.TURNSTILE_SECRET_KEY;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json() as ReservationInput & { cf_token: string };

  // 1. Valider le token Turnstile côté serveur
  const cfRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: TURNSTILE_SECRET, response: body.cf_token }),
  });
  const cfData = await cfRes.json() as { success: boolean };
  if (!cfData.success) {
    return new Response(JSON.stringify({ error: 'Validation antispam échouée' }), { status: 400 });
  }

  const { trackingToken, ...reservationData } = buildReservationPayload(body);

  // 2. Créer le client
  const clientRes = await fetch(`${DIRECTUS_URL}/items/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reservationData.client),
  });
  const clientJson = await clientRes.json() as { data: { id: number } };

  // 3. Créer la réservation
  const resaRes = await fetch(`${DIRECTUS_URL}/items/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client: clientJson.data.id,
      date_start: reservationData.date_start,
      date_end: reservationData.date_end,
      status: 'en_attente',
      delivery: reservationData.delivery,
      delivery_address: reservationData.delivery_address ?? null,
      notes: reservationData.notes,
      total_price: reservationData.total_price,
      tracking_token: trackingToken,
    }),
  });
  const resaJson = await resaRes.json() as { data: { id: number } };

  // 4. Résoudre les slugs → IDs Directus
  const slugs = reservationData.cartItems.map((i) => i.productId).join(',');
  const artRes = await fetch(`${DIRECTUS_URL}/items/articles?filter[slug][_in]=${slugs}&fields=id,slug`);
  const artJson = await artRes.json() as { data: { id: number; slug: string }[] };
  const idBySlug: Record<string, number> = {};
  for (const a of artJson.data ?? []) idBySlug[a.slug] = a.id;

  // 5. Créer les lignes de panier
  await Promise.all(
    reservationData.cartItems.map((item) => {
      const articleId = idBySlug[item.productId];
      if (!articleId) return Promise.resolve();
      return fetch(`${DIRECTUS_URL}/items/reservations_articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservations_id: resaJson.data.id, articles_id: articleId, quantity: item.quantity, unit_price: item.unit_price }),
      });
    })
  );

  return new Response(JSON.stringify({ trackingToken }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
