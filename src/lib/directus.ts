import type { Product } from '../data/types';
import type { Category, CategoryId, Audience } from '../data/categories';

const DIRECTUS_URL = import.meta.env.DIRECTUS_URL ?? 'http://localhost:8055';

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
  if (p.images_urls && p.images_urls.length > 0) {
    return p.images_urls;
  }
  if (p.image) {
    const fileId = typeof p.image === 'object' ? p.image.id : p.image;
    return [`${DIRECTUS_URL}/assets/${fileId}`];
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
  if (!raw) return 'chateau-gonflable';
  if (typeof raw === 'object') return raw.slug as CategoryId;
  return (categoryById[raw]?.slug ?? 'chateau-gonflable') as CategoryId;
}

function mapProduit(
  p: DirectusProduit,
  articleIds: number[],
  categoryById: Record<number, DirectusCategory>,
): Product {
  return {
    id: p.slug,
    name: p.name,
    category: resolveCategory(p.category, categoryById),
    audiences: (p.audiences ?? []) as Audience[],
    shortDescription: p.short_description ?? '',
    longDescription: p.long_description ?? '',
    price: p.price,
    rating: p.rating || slugRating(p.slug),
    reviewCount: p.review_count || slugReviewCount(p.slug),
    specs: p.specs ?? {},
    images: resolveImage(p),
    badge: (p.badge as Product['badge']) ?? null,
    articleIds,
  };
}

function produitId(a: DirectusArticleUnit): number {
  return typeof a.produit_id === 'object' ? a.produit_id.id : a.produit_id;
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${DIRECTUS_URL}/items/categories?fields=id,name,slug&sort=id`);
  const json = await res.json();
  return (json.data ?? []).map((c: DirectusCategory) => ({
    id: c.slug,
    label: c.name,
    emoji: CATEGORY_EMOJI[c.slug] ?? '📦',
  }));
}

export async function fetchProduits(): Promise<Product[]> {
  const [prodRes, catRes, artRes] = await Promise.all([
    fetch(`${DIRECTUS_URL}/items/produits?filter[status][_eq]=published&fields=*&sort=id`),
    fetch(`${DIRECTUS_URL}/items/categories?fields=id,name,slug&sort=id`),
    fetch(`${DIRECTUS_URL}/items/articles?fields=id,produit_id&limit=-1`),
  ]);
  const [prodJson, catJson, artJson] = await Promise.all([
    prodRes.json(), catRes.json(), artRes.json(),
  ]);

  const categoryById: Record<number, DirectusCategory> = Object.fromEntries(
    (catJson.data ?? []).map((c: DirectusCategory) => [c.id, c]),
  );

  const articlesByProduit: Record<number, number[]> = {};
  for (const a of (artJson.data ?? []) as DirectusArticleUnit[]) {
    const pid = produitId(a);
    (articlesByProduit[pid] ??= []).push(a.id);
  }

  return (prodJson.data ?? []).map((p: DirectusProduit) =>
    mapProduit(p, articlesByProduit[p.id] ?? [], categoryById),
  );
}

/** @deprecated Use fetchProduits() for listing. Kept for single-product Astro pages. */
export async function fetchArticles(): Promise<Product[]> {
  return fetchProduits();
}

export async function fetchArticle(slug: string): Promise<Product | null> {
  const [prodRes, catRes, artRes] = await Promise.all([
    fetch(`${DIRECTUS_URL}/items/produits?filter[slug][_eq]=${slug}&fields=*&limit=1`),
    fetch(`${DIRECTUS_URL}/items/categories?fields=id,name,slug&sort=id`),
    fetch(`${DIRECTUS_URL}/items/articles?fields=id,produit_id&limit=-1`),
  ]);
  const [prodJson, catJson, artJson] = await Promise.all([
    prodRes.json(), catRes.json(), artRes.json(),
  ]);

  const p: DirectusProduit | undefined = prodJson.data?.[0];
  if (!p) return null;

  const categoryById: Record<number, DirectusCategory> = Object.fromEntries(
    (catJson.data ?? []).map((c: DirectusCategory) => [c.id, c]),
  );

  const articleIds = (artJson.data ?? [] as DirectusArticleUnit[])
    .filter((a: DirectusArticleUnit) => produitId(a) === p.id)
    .map((a: DirectusArticleUnit) => a.id);

  return mapProduit(p, articleIds, categoryById);
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
