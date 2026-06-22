import type { Product } from '../data/types';
import type { Category, CategoryId, Audience } from '../data/categories';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL ?? 'http://localhost:8055';

const CATEGORY_EMOJI: Record<string, string> = {
  'chateau-gonflable': '🏰',
  'accessoire': '🎭',
  'restauration': '🍴',
  'enceintes': '🔊',
};

// ── Shared request helpers ────────────────────────────────────────────────────

async function directusGet<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const text = await res.text();
  let json: { data?: T; errors?: { message: string }[] };
  try { json = JSON.parse(text); } catch {
    throw new Error(`Réponse invalide du serveur : ${text.slice(0, 200)}`);
  }
  if (!res.ok) throw new Error(json.errors?.[0]?.message ?? `Erreur ${res.status}`);
  return json.data as T;
}

async function directusPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  if (!text) throw new Error(`Réponse vide du serveur (status ${res.status}) sur ${path}`);

  let json: { data?: T; errors?: { message: string }[] };
  try { json = JSON.parse(text); } catch {
    throw new Error(`Réponse invalide du serveur sur ${path} : ${text.slice(0, 200)}`);
  }
  if (!res.ok) throw new Error(json.errors?.[0]?.message ?? `Erreur ${res.status} sur ${path}`);
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
  if (p.images_urls && p.images_urls.length > 0) return p.images_urls;
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
    images: [...resolveImage(p), ...galerieImages],
    badge: (p.badge as Product['badge']) ?? null,
    articleIds,
  };
}

function produitId(a: DirectusArticleUnit): number {
  return a.produit_id !== null && typeof a.produit_id === 'object' ? a.produit_id.id : a.produit_id as number;
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

export async function fetchCategories(): Promise<Category[]> {
  const rows = await directusGet<DirectusCategory[]>(`${DIRECTUS_URL}/items/categories?sort=id`);
  return rows.map((c) => ({ id: c.slug, label: c.name, emoji: CATEGORY_EMOJI[c.slug] ?? '📦' }));
}

export async function fetchProduits(): Promise<Product[]> {
  const [produits, cats, articles, galerie] = await Promise.all([
    directusGet<DirectusProduit[]>(
      `${DIRECTUS_URL}/items/produits?filter[status][_eq]=published` +
      `&fields=id,slug,name,short_description,long_description,price,specs,audiences,images_urls,image,badge,status,category,jours_avant,jours_apres&sort=id`
    ),
    directusGet<DirectusCategory[]>(`${DIRECTUS_URL}/items/categories?fields=id,name,slug&sort=id`).catch(() => [] as DirectusCategory[]),
    directusGet<DirectusArticleUnit[]>(`${DIRECTUS_URL}/items/articles?fields=id,produit_id&limit=-1`).catch(() => [] as DirectusArticleUnit[]),
    directusGet<{ produits_id: number; directus_files_id: string }[]>(
      `${DIRECTUS_URL}/items/produits_galerie?fields=produits_id,directus_files_id&sort=sort,directus_files_id&limit=-1`
    ).catch(() => [] as { produits_id: number; directus_files_id: string }[]),
  ]);

  if (produits.length === 0) return [];

  const categoryById: Record<number, DirectusCategory> = {};
  for (const c of cats) categoryById[c.id] = c;

  const articleIdsByProduit: Record<number, number[]> = {};
  for (const a of articles) {
    if (a.produit_id == null) continue;
    const pid = produitId(a);
    (articleIdsByProduit[pid] ??= []).push(a.id);
  }

  const galerieByProduit: Record<number, string[]> = {};
  for (const g of galerie) {
    (galerieByProduit[g.produits_id] ??= []).push(`${DIRECTUS_URL}/assets/${g.directus_files_id}`);
  }

  return produits.map((p) =>
    mapProduit(p, articleIdsByProduit[p.id] ?? [], categoryById, galerieByProduit[p.id] ?? [])
  );
}

function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function computeUnavailable(
  ranges: { articles_id: number; date_start: string; date_end: string }[],
  monthStart: string,
  monthEnd: string,
  totalArticles: number,
): string[] {
  const unavailable: string[] = [];
  for (const d = new Date(`${monthStart}T00:00:00`); isoDay(d) <= monthEnd; d.setDate(d.getDate() + 1)) {
    const iso = isoDay(d);
    const reserved = new Set<number>();
    for (const r of ranges) {
      const rs = r.date_start.slice(0, 10);
      const re = r.date_end.slice(0, 10);
      if (iso >= rs && iso <= re) reserved.add(r.articles_id);
    }
    if (reserved.size >= totalArticles) unavailable.push(iso);
  }
  return unavailable;
}

// Renvoie les dates du mois où TOUS les articles sont réservés (stock = 0)
export async function fetchUnavailableDates(
  articleIds: number[],
  monthStart: string,
  monthEnd: string,
  totalArticles: number,
): Promise<string[]> {
  if (articleIds.length === 0 || totalArticles === 0) return [];

  type JunctionRow = {
    articles_id: number;
    reservations_id: number | { date_start: string; date_end: string } | null;
  };

  // Étape 1 : récupérer les junctions avec tentative d'expansion des dates
  const junctions = await directusGet<JunctionRow[]>(
    `${DIRECTUS_URL}/items/reservations_articles` +
    `?filter[articles_id][_in]=${articleIds.join(',')}` +
    `&filter[reservations_id][status][_neq]=annulee` +
    `&filter[reservations_id][date_start][_lte]=${monthEnd}` +
    `&filter[reservations_id][date_end][_gte]=${monthStart}` +
    `&fields=articles_id,reservations_id.date_start,reservations_id.date_end&limit=-1`
  ).catch(() => [] as JunctionRow[]);

  if (junctions.length === 0) return [];

  // Cas A : le rôle public peut lire reservations → expansion OK
  const firstRid = junctions[0]?.reservations_id;
  if (firstRid !== null && typeof firstRid === 'object') {
    const ranges = junctions
      .filter((j) => j.reservations_id !== null && typeof j.reservations_id === 'object')
      .map((j) => ({
        articles_id: j.articles_id,
        ...(j.reservations_id as { date_start: string; date_end: string }),
      }));
    return computeUnavailable(ranges, monthStart, monthEnd, totalArticles);
  }

  // Cas B : expansion échouée (reservations_id est un entier) → 2e requête sur reservations
  const resaIds = [...new Set(
    junctions
      .map((j) => j.reservations_id)
      .filter((v): v is number => typeof v === 'number'),
  )];
  if (resaIds.length === 0) return [];

  const resaDates = await directusGet<{ id: number; date_start: string; date_end: string }[]>(
    `${DIRECTUS_URL}/items/reservations` +
    `?filter[id][_in]=${resaIds.join(',')}` +
    `&fields=id,date_start,date_end&limit=-1`
  ).catch(() => [] as { id: number; date_start: string; date_end: string }[]);

  if (resaDates.length === 0) return [];

  const dateByResaId = new Map(resaDates.map((r) => [r.id, r]));
  const ranges = junctions.flatMap((j) => {
    const r = dateByResaId.get(j.reservations_id as number);
    if (!r) return [];
    return [{ articles_id: j.articles_id, date_start: r.date_start, date_end: r.date_end }];
  });
  return computeUnavailable(ranges, monthStart, monthEnd, totalArticles);
}

export async function fetchReservedArticleIds(
  articleIds: number[],
  dateStart: string,
  dateEnd: string,
): Promise<Set<number>> {
  if (articleIds.length === 0) return new Set();
  const rows = await directusGet<{ articles_id: number }[]>(
    `${DIRECTUS_URL}/items/reservations_articles` +
    `?filter[articles_id][_in]=${articleIds.join(',')}` +
    `&filter[reservations_id][status][_neq]=annulee` +
    `&filter[reservations_id][date_start][_lte]=${dateEnd}` +
    `&filter[reservations_id][date_end][_gte]=${dateStart}` +
    `&fields=articles_id&limit=-1`
  );
  return new Set(rows.map((r) => r.articles_id));
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
  const reservations = await directusGet<ReservationTracking[]>(
    `${DIRECTUS_URL}/items/reservations?filter[tracking_token][_eq]=${token}` +
    `&fields=id,tracking_token,status,date_start,date_end,delivery,delivery_address,total_price&limit=1`
  );
  const resa = reservations[0];
  if (!resa) return null;

  const articles = await directusGet<ReservationArticleItem[]>(
    `${DIRECTUS_URL}/items/reservations_articles?filter[reservations_id][_eq]=${resa.id}` +
    `&fields=quantity,unit_price,articles_id.name,articles_id.images_urls,articles_id.slug`
  );

  return { ...resa, articles };
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
  numericId: number;
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

  const client = await directusPost<{ id: number }>('/items/clients', data.client);
  const reservation = await directusPost<{ id: number }>('/items/reservations', {
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
  });

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
