import type { Product } from '../data/types';
import type { Category, CategoryId, Audience } from '../data/categories';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL ?? 'http://localhost:8055';

const CATEGORY_EMOJI: Record<string, string> = {
  'chateau-gonflable': '🏰',
  'accessoire': '🎭',
  'restauration': '🍴',
  'enceintes': '🔊',
};

async function directusPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();

  if (!text) {
    throw new Error(`Réponse vide du serveur (status ${res.status}) sur ${path}`);
  }

  let json: { data?: T; errors?: { message: string }[] };
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Réponse invalide du serveur sur ${path} : ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    throw new Error(json.errors?.[0]?.message ?? `Erreur ${res.status} sur ${path}`);
  }

  return json.data as T;
}

// ── Types Directus ────────────────────────────────────────────────────────────

interface DirectusArticle {
  id: number;
  slug: string;
  name: string;
  short_description: string | null;
  long_description: string | null;
  price: number;
  stock: number;
  rating: number | null;
  review_count: number | null;
  specs: Record<string, string> | null;
  audiences: Audience[] | null;
  images_urls: string[] | null;
  badge: string | null;
  status: string;
  category: { id: number; name: string; slug: string } | null;
}

function mapArticle(a: DirectusArticle): Product {
  return {
    id: a.slug,
    name: a.name,
    category: (a.category?.slug ?? 'chateau-gonflable') as CategoryId,
    audiences: (a.audiences ?? []) as Audience[],
    shortDescription: a.short_description ?? '',
    longDescription: a.long_description ?? '',
    price: a.price,
    rating: a.rating ?? 0,
    reviewCount: a.review_count ?? 0,
    specs: a.specs ?? {},
    images: a.images_urls ?? [],
    badge: (a.badge as Product['badge']) ?? null,
  };
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${DIRECTUS_URL}/items/categories?sort=id`);
  const json = await res.json();
  return (json.data ?? []).map((c: { id: number; name: string; slug: string }) => ({
    id: c.slug,
    label: c.name,
    emoji: CATEGORY_EMOJI[c.slug] ?? '📦',
  }));
}

export async function fetchArticles(): Promise<Product[]> {
  const res = await fetch(
    `${DIRECTUS_URL}/items/articles?filter[status][_eq]=published&fields=*,category.slug,category.name&sort=id`
  );
  const json = await res.json();
  return (json.data ?? []).map(mapArticle);
}

// ── Suivi réservation ─────────────────────────────────────────────────────────

export interface ReservationArticleItem {
  quantity: number;
  unit_price: number;
  article: { name: string; images_urls: string[] | null; slug: string } | null;
}

export interface ReservationTracking {
  id: number;
  tracking_token: string;
  status: string;
  date_start: string;
  date_end: string;
  delivery: boolean;
  delivery_address: string | null;
  total_price: number;
  articles: ReservationArticleItem[];
}

export async function fetchReservationByToken(token: string): Promise<ReservationTracking | null> {
  const res = await fetch(
    `${DIRECTUS_URL}/items/reservations?filter[tracking_token][_eq]=${token}&fields=id,tracking_token,status,date_start,date_end,delivery,delivery_address,total_price&limit=1`
  );
  const json = await res.json();
  const resa = json.data?.[0];
  if (!resa) return null;

  const artRes = await fetch(
    `${DIRECTUS_URL}/items/reservations_articles?filter[reservation][_eq]=${resa.id}&fields=quantity,unit_price,article.name,article.images_urls,article.slug`
  );
  const artJson = await artRes.json();

  return { ...resa, articles: artJson.data ?? [] };
}

export async function fetchArticle(slug: string): Promise<Product | null> {
  const res = await fetch(
    `${DIRECTUS_URL}/items/articles?filter[slug][_eq]=${slug}&filter[status][_eq]=published&fields=*,category.slug,category.name&limit=1`
  );
  const json = await res.json();
  const article = json.data?.[0];
  return article ? mapArticle(article) : null;
}

// ── Reservation ───────────────────────────────────────────────────────────────

export interface ReservationClientData {
  type: 'particulier' | 'professionnel';
  first_name: string;
  last_name: string;
  company_name?: string;
  email: string;
  phone: string;
}

export interface ReservationCartItem {
  productId: string; // slug
  quantity: number;
  unit_price: number;
}

export interface ReservationData {
  client: ReservationClientData;
  date_start: string;
  date_end: string;
  delivery: boolean;
  delivery_address?: string;
  notes: string;
  total_price: number;
  cartItems: ReservationCartItem[];
}

export async function createReservation(data: ReservationData): Promise<string> {
  const trackingToken = crypto.randomUUID();

  // 1. Créer le client
  const client = await directusPost<{ id: number }>('/items/clients', data.client);

  // 2. Créer la réservation (token généré côté front)
  const reservation = await directusPost<{ id: number }>(
    '/items/reservations',
    {
      client: client.id,
      date_start: data.date_start,
      date_end: data.date_end,
      status: 'en_attente',
      delivery: data.delivery,
      delivery_address: data.delivery_address ?? null,
      notes: data.notes,
      total_price: data.total_price,
      tracking_token: trackingToken,
    }
  );

  // 3. Récupérer les IDs Directus des articles par slug
  const slugs = data.cartItems.map(i => i.productId).join(',');
  const articlesRes = await fetch(
    `${DIRECTUS_URL}/items/articles?filter[slug][_in]=${slugs}&fields=id,slug`
  );
  const articlesJson = await articlesRes.json();
  const articleBySlug: Record<string, number> = {};
  for (const a of articlesJson.data ?? []) {
    articleBySlug[a.slug] = a.id;
  }

  // 4. Créer les reservation_articles
  await Promise.all(
    data.cartItems.map((item) => {
      const articleId = articleBySlug[item.productId];
      if (!articleId) return Promise.resolve();
      return directusPost('/items/reservations_articles', {
        reservation: reservation.id,
        article: articleId,
        quantity: item.quantity,
        unit_price: item.unit_price,
      });
    })
  );

  return trackingToken;
}
