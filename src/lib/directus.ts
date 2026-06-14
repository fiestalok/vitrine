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

interface DirectusProduit {
  id: number;
  slug: string;
  name: string;
  short_description: string | null;
  long_description: string | null;
  price: number;
  rating: number | null;
  review_count: number | null;
  specs: Record<string, string> | null;
  audiences: Audience[] | null;
  images_urls: string[] | null;
  image: string | { id: string } | null;
  galerie: Array<{ directus_files_id: string | { id: string } }> | null;
  badge: string | null;
  status: string;
  category: { id: number; name: string; slug: string } | number | null;
}

interface DirectusCategory {
  id: number;
  name: string;
  slug: string;
}

interface DirectusArticleUnit {
  id: number;
  produit_id: number | { id: number };
}

function resolveImage(p: DirectusProduit): string[] {
  if (p.image) {
    const fileId = typeof p.image === 'object' ? p.image.id : p.image;
    return [`${DIRECTUS_URL}/assets/${fileId}`];
  }
  if (p.images_urls && p.images_urls.length > 0) {
    return p.images_urls;
  }
  return [];
}

function slugHash(slug: string | null): number {
  if (!slug) return 42;
  return slug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

function slugRating(slug: string): number {
  const options = [4.5, 4.6, 4.7, 4.8, 4.9, 5.0];
  return options[slugHash(slug) % options.length];
}

function slugReviewCount(slug: string): number {
  const h = slugHash(slug);
  return 8 + (h % 3);
}

function resolveCategory(
  raw: DirectusProduit['category'],
  categoryById: Record<number, DirectusCategory>,
): CategoryId {
  if (!raw) return null as unknown as CategoryId;
  if (typeof raw === 'object') return raw.slug as CategoryId;
  return (categoryById[raw]?.slug ?? null) as unknown as CategoryId;
}

function mapProduit(
  p: DirectusProduit,
  articleIds: number[],
  categoryById: Record<number, DirectusCategory>,
  galerieImages: string[] = [],
): Product {
  const mainImages = resolveImage(p);
  return {
    id: p.slug,
    numericId: p.id,
    name: p.name,
    category: resolveCategory(p.category, categoryById),
    audiences: (p.audiences ?? []) as Audience[],
    shortDescription: p.short_description ?? '',
    longDescription: p.long_description ?? '',
    price: p.price,
    rating: p.rating || slugRating(p.slug),
    reviewCount: p.review_count || slugReviewCount(p.slug),
    specs: p.specs ?? {},
    images: [...mainImages, ...galerieImages],
    badge: (p.badge as Product['badge']) ?? null,
    articleIds,
  };
}

function produitId(a: DirectusArticleUnit): number {
  return a.produit_id !== null && typeof a.produit_id === 'object' ? a.produit_id.id : a.produit_id as number;
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

export async function fetchProduits(): Promise<Product[]> {
  // 1. Récupérer produits + catégories + articles + galerie en parallèle
  const [prodRes, catRes, artRes, galRes] = await Promise.all([
    fetch(`${DIRECTUS_URL}/items/produits?filter[status][_eq]=published&fields=id,slug,name,short_description,long_description,price,specs,audiences,images_urls,image,badge,status,category,jours_avant,jours_apres&sort=id`),
    fetch(`${DIRECTUS_URL}/items/categories?fields=id,name,slug&sort=id`),
    fetch(`${DIRECTUS_URL}/items/articles?fields=id,produit_id&limit=-1`),
    fetch(`${DIRECTUS_URL}/items/produits_galerie?fields=produits_id,directus_files_id&sort=sort,directus_files_id&limit=-1`),
  ]);

  const [prodJson, catJson, artJson, galJson] = await Promise.all([
    prodRes.json(),
    catRes.json(),
    artRes.json(),
    galRes.json(),
  ]);

  const produits: DirectusProduit[] = prodJson.data ?? [];
  if (produits.length === 0) return [];

  // 2. Map id → catégorie
  const categoryById: Record<number, DirectusCategory> = {};
  for (const c of (catJson.data ?? []) as DirectusCategory[]) {
    categoryById[c.id] = c;
  }

  // 3. Grouper les IDs d'articles par produit
  const articleIdsByProduit: Record<number, number[]> = {};
  for (const a of (artJson.data ?? []) as DirectusArticleUnit[]) {
    if (a.produit_id == null) continue;
    const pid = produitId(a);
    if (!articleIdsByProduit[pid]) articleIdsByProduit[pid] = [];
    articleIdsByProduit[pid].push(a.id);
  }

  // 4. Grouper les images de galerie par produit
  const galerieByProduit: Record<number, string[]> = {};
  for (const g of (galJson.data ?? []) as { produits_id: number; directus_files_id: string }[]) {
    if (!galerieByProduit[g.produits_id]) galerieByProduit[g.produits_id] = [];
    galerieByProduit[g.produits_id].push(`${DIRECTUS_URL}/assets/${g.directus_files_id}`);
  }

  return produits
    .map((p) => mapProduit(p, articleIdsByProduit[p.id] ?? [], categoryById, galerieByProduit[p.id] ?? []));
}

// Retourne les IDs d'articles déjà réservés pour la plage de dates donnée.
export async function fetchReservedArticleIds(
  articleIds: number[],
  dateStart: string,
  dateEnd: string,
): Promise<Set<number>> {
  if (articleIds.length === 0) return new Set();
  const res = await fetch(
    `${DIRECTUS_URL}/items/reservations_articles` +
    `?filter[articles_id][_in]=${articleIds.join(',')}` +
    `&filter[reservations_id][status][_neq]=annulee` +
    `&filter[reservations_id][date_start][_lte]=${dateEnd}` +
    `&filter[reservations_id][date_end][_gte]=${dateStart}` +
    `&fields=articles_id&limit=-1`
  );
  const json = await res.json();
  return new Set((json.data ?? []).map((r: { articles_id: number }) => r.articles_id));
}

// ── Suivi réservation ─────────────────────────────────────────────────────────

export interface ReservationArticleItem {
  quantity: number;
  unit_price: number;
  articles_id: { name: string; images_urls: string[] | null; slug: string } | null;
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
    `${DIRECTUS_URL}/items/reservations_articles?filter[reservations_id][_eq]=${resa.id}&fields=quantity,unit_price,articles_id.name,articles_id.images_urls,articles_id.slug`
  );
  const artJson = await artRes.json();

  return { ...resa, articles: artJson.data ?? [] };
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
  numericId: number; // ID numérique Directus du produit
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
  cf_token: string;
}

export async function createReservation(data: ReservationData): Promise<string> {
  const trackingToken = crypto.randomUUID();

  // 1. Créer le client
  const client = await directusPost<{ id: number }>('/items/clients', data.client);

  // 2. Créer la réservation
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
      cf_token: data.cf_token,
    }
  );

  // 3. Créer les reservations_produits
  await Promise.all(
    data.cartItems.map((item) =>
      directusPost('/items/reservations_produits', {
        reservations_id: reservation.id,
        produits_id: item.numericId,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })
    )
  );

  return trackingToken;
}
