# Migration React → Astro SSR — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrer l'application React+Vite vers Astro SSR déployé sur Vercel, pour remplacer fiestalok.fr sans perdre le référencement.

**Architecture:** Astro `output: 'hybrid'` — pages rendues serveur par défaut, `/entreprise` et `/qui-sommes-nous` pré-rendues statiquement. React islands pour l'interactivité. nanostores pour l'état partagé (panier, avis). API route Astro pour la création de réservation (remplace les appels Directus côté client).

**Tech Stack:** Astro 5, @astrojs/react, @astrojs/vercel, @astrojs/sitemap, nanostores, @nanostores/react, @nanostores/persistent, Vitest

---

## Fichiers concernés

**Créés :**
- `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`
- `src/layouts/Layout.astro`
- `src/pages/index.astro`, `catalogue.astro`, `produit/[id].astro`
- `src/pages/entreprise.astro`, `qui-sommes-nous.astro`, `devis.astro`, `suivi.astro`, `404.astro`
- `src/pages/api/reservation.ts`
- `src/stores/cart.ts`, `src/stores/reviews.ts`
- `src/components/layout/Footer.astro`
- `src/components/home/HeroSection.astro`, `HowItWorksSection.astro`, `CategoriesSection.astro`, `WhyUsSection.astro`, `ZoneSection.astro`
- `src/components/home/FeaturedProducts.tsx`
- `src/components/catalogue/CatalogueClient.tsx`
- `src/components/product/AddToCartButton.tsx`, `ReviewsSection.tsx`
- `src/tests/cart.test.ts`, `src/tests/reservation.test.ts`
- `public/robots.txt`

**Modifiés :**
- `package.json` — scripts + dépendances
- `src/components/layout/Navbar.tsx` — useCart → nanostores, Link → `<a>`
- `src/components/layout/CartDrawer.tsx` — useCart/useNavigate → nanostores/window.location
- `src/components/product/ProductCard.tsx` — useCart → nanostores
- `src/lib/directus.ts` — VITE_DIRECTUS_URL → DIRECTUS_URL, retrait de createReservation
- `src/pages/DevisPage.tsx` — useCart → nanostores, createReservation → fetch('/api/reservation')
- `src/pages/SuiviPage.tsx` — accepte reservation+token en props au lieu de fetcher

**Supprimés (Task 18) :**
- `index.html`, `src/main.tsx`, `src/App.tsx`
- `src/context/` (CartContext, ProductsContext, CategoriesContext, ReviewsContext)
- `src/pages/*Page.tsx` et leurs `.module.css` (contenu migré dans pages Astro)
- `.github/workflows/deploy.yml`

---

## Task 1 : Scaffold Astro

**Files:**
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Déplacer les React pages pour libérer `src/pages/`**

```bash
mkdir src/views
git mv src/pages/HomePage.tsx src/views/HomePage.tsx
git mv src/pages/HomePage.module.css src/views/HomePage.module.css
git mv src/pages/CataloguePage.tsx src/views/CataloguePage.tsx
git mv src/pages/CataloguePage.module.css src/views/CataloguePage.module.css
git mv src/pages/ProductPage.tsx src/views/ProductPage.tsx
git mv src/pages/ProductPage.module.css src/views/ProductPage.module.css
git mv src/pages/EntreprisePage.tsx src/views/EntreprisePage.tsx
git mv src/pages/EntreprisePage.module.css src/views/EntreprisePage.module.css
git mv src/pages/QuiSommesNousPage.tsx src/views/QuiSommesNousPage.tsx
git mv src/pages/QuiSommesNousPage.module.css src/views/QuiSommesNousPage.module.css
git mv src/pages/DevisPage.tsx src/views/DevisPage.tsx
git mv src/pages/DevisPage.module.css src/views/DevisPage.module.css
git mv src/pages/SuiviPage.tsx src/views/SuiviPage.tsx
git mv src/pages/SuiviPage.module.css src/views/SuiviPage.module.css
```

- [ ] **Installer les dépendances Astro**

```bash
npm install astro @astrojs/react @astrojs/vercel @astrojs/sitemap nanostores @nanostores/react @nanostores/persistent
```

- [ ] **Créer `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://fiestalok.fr',
  output: 'server',
  adapter: vercel(),
  integrations: [react(), sitemap()],
});
```

- [ ] **Créer `tsconfig.json` (Astro a besoin du sien)**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": "."
  },
  "include": ["src", "astro.config.mjs"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Créer `vitest.config.ts`** (Astro prend la main sur Vite — Vitest a besoin de sa propre config)

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
  },
});
```

- [ ] **Mettre à jour les scripts dans `package.json`**

Remplacer les scripts existants par :
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "lint": "eslint ."
  }
}
```

- [ ] **Vérifier que le projet compile sans erreurs**

```bash
npx astro check
```
Attendu : warnings possibles sur les imports React, mais pas d'erreurs bloquantes.

- [ ] **Commit**

```bash
git add astro.config.mjs tsconfig.json vitest.config.ts package.json package-lock.json src/views/
git commit -m "chore: scaffold Astro, move React views to src/views"
```

---

## Task 2 : Stores nanostores (panier + avis)

**Files:**
- Create: `src/stores/cart.ts`
- Create: `src/stores/reviews.ts`
- Create: `src/tests/cart.test.ts`

- [ ] **Écrire les tests du cart store**

```ts
// src/tests/cart.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { cartStore, addToCart, removeFromCart, setCartQuantity, clearCart, openCart, closeCart } from '../stores/cart';

describe('cartStore', () => {
  beforeEach(() => {
    localStorage.clear();
    cartStore.set({ items: [], isOpen: false });
  });

  it('ajoute un article', () => {
    addToCart({ productId: 'chateau-royal', quantity: 1, startDate: null, endDate: null });
    expect(cartStore.get().items).toHaveLength(1);
    expect(cartStore.get().items[0].productId).toBe('chateau-royal');
  });

  it('incrémente la quantité si déjà présent', () => {
    addToCart({ productId: 'chateau-royal', quantity: 1, startDate: null, endDate: null });
    addToCart({ productId: 'chateau-royal', quantity: 2, startDate: null, endDate: null });
    expect(cartStore.get().items).toHaveLength(1);
    expect(cartStore.get().items[0].quantity).toBe(3);
  });

  it('supprime un article', () => {
    addToCart({ productId: 'chateau-royal', quantity: 1, startDate: null, endDate: null });
    removeFromCart('chateau-royal');
    expect(cartStore.get().items).toHaveLength(0);
  });

  it('modifie la quantité', () => {
    addToCart({ productId: 'chateau-royal', quantity: 1, startDate: null, endDate: null });
    setCartQuantity('chateau-royal', 4);
    expect(cartStore.get().items[0].quantity).toBe(4);
  });

  it('supprime si quantité ≤ 0', () => {
    addToCart({ productId: 'chateau-royal', quantity: 1, startDate: null, endDate: null });
    setCartQuantity('chateau-royal', 0);
    expect(cartStore.get().items).toHaveLength(0);
  });

  it('vide le panier', () => {
    addToCart({ productId: 'chateau-royal', quantity: 1, startDate: null, endDate: null });
    addToCart({ productId: 'machine-popcorn', quantity: 2, startDate: null, endDate: null });
    clearCart();
    expect(cartStore.get().items).toHaveLength(0);
  });

  it('ouvre et ferme le panier', () => {
    openCart();
    expect(cartStore.get().isOpen).toBe(true);
    closeCart();
    expect(cartStore.get().isOpen).toBe(false);
  });
});
```

- [ ] **Lancer les tests — ils doivent échouer**

```bash
npm test -- cart
```
Attendu : FAIL — `cartStore` n'existe pas encore.

- [ ] **Créer `src/stores/cart.ts`**

```ts
import { persistentAtom } from '@nanostores/persistent';
import type { CartItem } from '../data/types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
}

export const cartStore = persistentAtom<CartStore>(
  'fiestalok.cart.v1',
  { items: [], isOpen: false },
  { encode: JSON.stringify, decode: JSON.parse }
);

export function addToCart(incoming: CartItem) {
  const { items } = cartStore.get();
  const existing = items.find((i) => i.productId === incoming.productId);
  if (existing) {
    cartStore.set({
      ...cartStore.get(),
      items: items.map((i) =>
        i.productId === incoming.productId
          ? { ...i, quantity: i.quantity + incoming.quantity, startDate: incoming.startDate ?? i.startDate, endDate: incoming.endDate ?? i.endDate }
          : i
      ),
    });
  } else {
    cartStore.set({ ...cartStore.get(), items: [...items, incoming] });
  }
}

export function removeFromCart(productId: string) {
  cartStore.set({ ...cartStore.get(), items: cartStore.get().items.filter((i) => i.productId !== productId) });
}

export function setCartQuantity(productId: string, qty: number) {
  if (qty <= 0) { removeFromCart(productId); return; }
  cartStore.set({
    ...cartStore.get(),
    items: cartStore.get().items.map((i) => i.productId === productId ? { ...i, quantity: qty } : i),
  });
}

export function clearCart() {
  cartStore.set({ ...cartStore.get(), items: [] });
}

export function openCart() {
  cartStore.set({ ...cartStore.get(), isOpen: true });
}

export function closeCart() {
  cartStore.set({ ...cartStore.get(), isOpen: false });
}
```

- [ ] **Créer `src/stores/reviews.ts`** (remplace ReviewsContext — stockage localStorage)

```ts
import { persistentAtom } from '@nanostores/persistent';
import type { Review } from '../data/types';

export const reviewsStore = persistentAtom<Review[]>(
  'fiestalok.reviews.v1',
  [],
  { encode: JSON.stringify, decode: JSON.parse }
);

export function addReview(review: Omit<Review, 'id' | 'date'>) {
  reviewsStore.set([
    ...reviewsStore.get(),
    { ...review, id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10) },
  ]);
}

export function getReviewsForProduct(productId: string): Review[] {
  return reviewsStore.get().filter((r) => r.productId === productId);
}
```

- [ ] **Relancer les tests — ils doivent passer**

```bash
npm test -- cart
```
Attendu : PASS ✓ (7 tests)

- [ ] **Commit**

```bash
git add src/stores/ src/tests/cart.test.ts
git commit -m "feat: add cart and reviews nanostores"
```

---

## Task 3 : Layout.astro (SEO global)

**Files:**
- Create: `src/layouts/Layout.astro`
- Create: `public/robots.txt`

- [ ] **Créer `src/layouts/Layout.astro`**

```astro
---
import { ViewTransitions } from 'astro:transitions';

interface Props {
  title: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
  ogImage?: string;
  jsonLdProduct?: Record<string, unknown>;
}

const {
  title,
  description,
  canonical = new URL(Astro.url.pathname, Astro.site).href,
  noindex = false,
  ogImage = '/og-default.jpg',
  jsonLdProduct,
} = Astro.props;

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: "Fiestalo'K",
  description: 'Location de matériel festif : châteaux gonflables, enceintes, photobooths.',
  url: 'https://fiestalok.fr',
  telephone: '+33679515925',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Strasbourg',
    addressLocality: 'Strasbourg',
    postalCode: '67000',
    addressRegion: 'Alsace',
    addressCountry: 'FR',
  },
  areaServed: [
    { '@type': 'State', name: 'Bas-Rhin' },
    { '@type': 'State', name: 'Haut-Rhin' },
    { '@type': 'City', name: 'Strasbourg' },
    { '@type': 'City', name: 'Colmar' },
    { '@type': 'City', name: 'Mulhouse' },
  ],
  priceRange: '€€',
  openingHours: 'Mo-Su 08:00-20:00',
};
---
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    {noindex && <meta name="robots" content="noindex, nofollow" />}

    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={new URL(ogImage, Astro.site).href} />
    <meta name="theme-color" content="#FFE66D" />

    <script type="application/ld+json" set:html={JSON.stringify(localBusinessSchema)} />
    {jsonLdProduct && (
      <script type="application/ld+json" set:html={JSON.stringify(jsonLdProduct)} />
    )}

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet" />

    <!-- Navigation fluide SPA-like entre pages -->
    <ViewTransitions />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Créer `public/robots.txt`**

```
User-agent: *
Allow: /

Disallow: /api/
Disallow: /devis
Disallow: /suivi

Sitemap: https://fiestalok.fr/sitemap-index.xml
```

- [ ] **Ajouter un placeholder pour l'OG image**

Copier le logo ou une image 1200×630 dans `public/og-default.jpg`. Si aucune image disponible, créer un fichier vide temporaire :
```bash
cp public/logo.png public/og-default.jpg
```
(À remplacer par une vraie image 1200×630 avant le lancement.)

- [ ] **Commit**

```bash
git add src/layouts/ public/robots.txt public/og-default.jpg
git commit -m "feat: add Layout.astro with SEO and robots.txt"
```

---

## Task 4 : Mettre à jour directus.ts + créer la route API réservation

**Files:**
- Modify: `src/lib/directus.ts`
- Create: `src/pages/api/reservation.ts`
- Create: `src/tests/reservation.test.ts`

- [ ] **Mettre à jour `src/lib/directus.ts`**

Changer la première ligne :
```ts
// Avant :
const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL ?? 'http://localhost:8055';
// Après :
const DIRECTUS_URL = import.meta.env.DIRECTUS_URL ?? 'http://localhost:8055';
```

Supprimer l'export `createReservation` et tous ses types associés (`ReservationCartItem`, `ReservationData`, `ReservationClientData`) — ils seront gérés dans la route API.

Conserver : `fetchCategories`, `fetchArticles`, `fetchArticle`, `fetchReservationByToken`, `ReservationTracking`, `ReservationArticleItem`.

- [ ] **Écrire le test de la route API**

```ts
// src/tests/reservation.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Importer la logique métier isolée de la route
import { buildReservationPayload } from '../lib/reservation';

describe('buildReservationPayload', () => {
  it('génère un tracking token UUID', () => {
    const payload = buildReservationPayload({
      client: { type: 'particulier', first_name: 'Marie', last_name: 'Dupont', email: 'm@test.fr', phone: '0600000000' },
      date_start: '2026-06-01',
      date_end: '2026-06-02',
      delivery: false,
      notes: '',
      total_price: 150,
      cartItems: [{ productId: 'chateau-royal', quantity: 1, unit_price: 150 }],
    });
    expect(payload.trackingToken).toMatch(/^[0-9a-f-]{36}$/);
  });
});
```

- [ ] **Lancer les tests — ils doivent échouer**

```bash
npm test -- reservation
```
Attendu : FAIL — `buildReservationPayload` n'existe pas.

- [ ] **Créer `src/lib/reservation.ts`** (logique métier testable séparément de la route)

```ts
export interface ReservationInput {
  client: {
    type: 'particulier' | 'professionnel';
    first_name: string;
    last_name: string;
    company_name?: string;
    email: string;
    phone: string;
  };
  date_start: string;
  date_end: string;
  delivery: boolean;
  delivery_address?: string;
  notes: string;
  total_price: number;
  cartItems: { productId: string; quantity: number; unit_price: number }[];
}

export function buildReservationPayload(input: ReservationInput) {
  return {
    ...input,
    trackingToken: crypto.randomUUID(),
  };
}
```

- [ ] **Créer `src/pages/api/reservation.ts`**

```ts
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
```

- [ ] **Relancer les tests — ils doivent passer**

```bash
npm test -- reservation
```
Attendu : PASS ✓

- [ ] **Commit**

```bash
git add src/lib/directus.ts src/lib/reservation.ts src/pages/api/ src/tests/reservation.test.ts
git commit -m "feat: add reservation API route, extract Directus logic server-side"
```

---

## Task 5 : Migrer Navbar.tsx

**Files:**
- Modify: `src/components/layout/Navbar.tsx`

- [ ] **Remplacer les imports react-router-dom + CartContext**

```tsx
// Supprimer :
import { NavLink, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

// Ajouter :
import { useStore } from '@nanostores/react';
import { cartStore, openCart } from '../../stores/cart';
```

- [ ] **Mettre à jour le composant**

Remplacer `const { totalItems, open } = useCart();` par :
```tsx
const { items, isOpen: _isOpen } = useStore(cartStore);
const totalItems = items.reduce((s, i) => s + i.quantity, 0);
```

Remplacer chaque `<Link to="...">` par `<a href="...">`.

Remplacer `<NavLink>` par `<a>` avec détection active via `typeof window !== 'undefined' && window.location.pathname`:
```tsx
const [pathname, setPathname] = useState('');
useEffect(() => { setPathname(window.location.pathname); }, []);

// Dans le rendu :
<a
  key={l.to}
  href={l.to}
  onClick={() => setMobileOpen(false)}
  className={`${styles.link} ${pathname === l.to || (l.to !== '/' && pathname.startsWith(l.to)) ? styles.active : ''}`}
>
  {l.label}
</a>
```

Remplacer `onClick={open}` par `onClick={openCart}`.

- [ ] **Vérifier la compilation TypeScript**

```bash
npx astro check
```
Attendu : pas d'erreur sur Navbar.tsx.

- [ ] **Commit**

```bash
git add src/components/layout/Navbar.tsx
git commit -m "feat: migrate Navbar to nanostores"
```

---

## Task 6 : Migrer CartDrawer.tsx

**Files:**
- Modify: `src/components/layout/CartDrawer.tsx`

- [ ] **Remplacer les imports**

```tsx
// Supprimer :
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

// Ajouter :
import { useStore } from '@nanostores/react';
import { cartStore, removeFromCart, setCartQuantity, clearCart, closeCart } from '../../stores/cart';
```

- [ ] **Mettre à jour le composant**

Remplacer `const { isOpen, close, items, remove, setQuantity, clear } = useCart();` par :
```tsx
const { items, isOpen } = useStore(cartStore);
```

Remplacer `close()` → `closeCart()`, `remove(id)` → `removeFromCart(id)`, `setQuantity(id, qty)` → `setCartQuantity(id, qty)`, `clear()` → `clearCart()`.

Remplacer `useNavigate` + `navigate('/devis')` par :
```tsx
function handleDevis() {
  closeCart();
  window.location.href = '/devis';
}
```

Remplacer `<Button to="/catalogue" ...>` par `<a href="/catalogue" ...>` (ou garder le composant Button si il supporte `href`).

- [ ] **Commit**

```bash
git add src/components/layout/CartDrawer.tsx
git commit -m "feat: migrate CartDrawer to nanostores"
```

---

## Task 7 : Migrer ProductCard.tsx

**Files:**
- Modify: `src/components/product/ProductCard.tsx`

- [ ] **Remplacer les imports CartContext**

```tsx
// Supprimer :
import { useCart } from '../../context/CartContext';

// Ajouter :
import { addToCart, openCart } from '../../stores/cart';
```

- [ ] **Remplacer l'utilisation du hook**

Supprimer la ligne `const { add, open } = useCart();`.

Remplacer `add({...})` par `addToCart({...})` et `open()` par `openCart()`.

- [ ] **Créer `src/components/product/AddToCartButton.tsx`** (utilisé dans la page produit)

```tsx
import { useState } from 'react';
import { format } from 'date-fns';
import { addToCart, openCart } from '../../stores/cart';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { UNAVAILABLE_DATES } from '../../data/unavailable';
import type { Product } from '../../data/types';
import styles from '../../views/ProductPage.module.css';

export function AddToCartButton({ product }: { product: Product }) {
  const [date, setDate] = useState<Date | null>(null);

  function handleAdd() {
    addToCart({
      productId: product.id,
      startDate: date ? format(date, 'yyyy-MM-dd') : null,
      endDate: date ? format(date, 'yyyy-MM-dd') : null,
      quantity: 1,
    });
    openCart();
  }

  return (
    <>
      <section className={styles.block}>
        <header><h2>Disponibilités</h2><p>Choisis ta date pour vérifier la dispo.</p></header>
        <AvailabilityCalendar
          productId={product.id}
          unavailableDates={UNAVAILABLE_DATES[product.id] ?? []}
          value={date}
          onChange={setDate}
        />
        {date && <p className={styles.selected}>Date sélectionnée : <strong>{format(date, 'dd/MM/yyyy')}</strong></p>}
      </section>
      <button className={styles.addBtn} onClick={handleAdd}>+ Ajouter au panier</button>
    </>
  );
}
```

- [ ] **Commit**

```bash
git add src/components/product/ProductCard.tsx src/components/product/AddToCartButton.tsx
git commit -m "feat: migrate ProductCard to nanostores, add AddToCartButton"
```

---

## Task 8 : Créer ReviewsSection.tsx

**Files:**
- Create: `src/components/product/ReviewsSection.tsx`

- [ ] **Créer `src/components/product/ReviewsSection.tsx`** (remplace useReviews dans ProductPage)

```tsx
import { useStore } from '@nanostores/react';
import { reviewsStore, addReview } from '../../stores/reviews';
import { ReviewList } from './ReviewList';
import { ReviewForm } from './ReviewForm';

export function ReviewsSection({ productId }: { productId: string }) {
  const allReviews = useStore(reviewsStore);
  const reviews = allReviews.filter((r) => r.productId === productId);

  return (
    <>
      <ReviewList reviews={reviews} />
      <ReviewForm onSubmit={(data) => addReview({ productId, ...data })} />
    </>
  );
}
```

- [ ] **Commit**

```bash
git add src/components/product/ReviewsSection.tsx
git commit -m "feat: add ReviewsSection with nanostores"
```

---

## Task 9 : Sections statiques Astro (home)

**Files:**
- Create: `src/components/layout/Footer.astro`
- Create: `src/components/home/HeroSection.astro`
- Create: `src/components/home/HowItWorksSection.astro`
- Create: `src/components/home/CategoriesSection.astro`
- Create: `src/components/home/WhyUsSection.astro`
- Create: `src/components/home/ZoneSection.astro`

- [ ] **Créer `src/components/layout/Footer.astro`**

Reprendre le contenu HTML de `src/components/layout/Footer.tsx` en remplaçant :
- `<Link to="...">` → `<a href="...">`
- `import { Bubbles }` + `<Bubbles />` → inline HTML/CSS équivalent ou garder le composant React avec `client:load`

```astro
---
import '../../../src/styles/global.css';
---
<footer class="footer">
  <div class="container footer-grid">
    <div>
      <p class="footer-logo">Fiestalo'<span>K</span></p>
      <p class="footer-tagline">Location de matériel festif en Alsace.<br/>On gonfle, vous kiffez.</p>
      <div class="footer-socials">
        <a href="#" aria-label="Instagram">📷</a>
        <a href="#" aria-label="Facebook">👍</a>
        <a href="#" aria-label="TikTok">🎵</a>
      </div>
    </div>
    <div>
      <h4>Navigation</h4>
      <ul>
        <li><a href="/catalogue">Catalogue</a></li>
        <li><a href="/entreprise">Entreprise</a></li>
        <li><a href="/qui-sommes-nous">Qui sommes-nous</a></li>
      </ul>
    </div>
    <div>
      <h4>Contact</h4>
      <ul>
        <li>📍 Strasbourg, Alsace</li>
        <li>📞 +33 6 79 51 59 25</li>
        <li>✉️ <a href="mailto:contact@fiestalok.fr">contact@fiestalok.fr</a></li>
        <li>🕐 Lun–Sam, 9h–19h</li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <p>© 2026 Fiestalo'K — Tous droits réservés</p>
    <p>Fait avec ❤️ en Alsace</p>
  </div>
</footer>
```

Copier les styles de `Footer.module.css` dans une balise `<style>` dans le fichier, en remplaçant `.footer` par la classe globale, ou garder le module CSS en l'important.

- [ ] **Créer les autres sections statiques**

Pour chacune, convertir le JSX correspondant dans `src/views/HomePage.tsx` en HTML Astro (pas de `className` → `class`, pas de `{}` expressions → valeurs en dur ou Astro expressions `{}`).

`src/components/home/HeroSection.astro` — contenu du bloc `<section className={styles.hero}>` dans HomePage.tsx (lignes 40–65).

`src/components/home/HowItWorksSection.astro` — section "Comment ça marche" (STEPS, lignes 67–87). Les données STEPS peuvent être déclarées dans le frontmatter :
```astro
---
const STEPS = [
  { n: '01', icon: '🏰', title: 'Choisissez', text: '...' },
  { n: '02', icon: '📅', title: 'Livraison ou retrait', text: '...' },
  { n: '03', icon: '🚚', title: 'On installe', text: '...' },
  { n: '04', icon: '🎉', title: 'Vous kiffez', text: '...' },
];
---
```

`src/components/home/WhyUsSection.astro` — section "Pourquoi nous" (lignes 117–134 de HomePage.tsx).

`src/components/home/ZoneSection.astro` — (pas dans la HomePage, mais dans `ZoneSection.vue` du site actuel). Reprendre le contenu : titre "Toute l'Alsace", liste des villes, Bas-Rhin/Haut-Rhin.

- [ ] **Commit**

```bash
git add src/components/layout/Footer.astro src/components/home/
git commit -m "feat: add static Astro sections (Footer, Hero, HowItWorks, WhyUs, Zone)"
```

---

## Task 10 : Créer FeaturedProducts.tsx + index.astro

**Files:**
- Create: `src/components/home/FeaturedProducts.tsx`
- Create: `src/pages/index.astro`

- [ ] **Créer `src/components/home/FeaturedProducts.tsx`**

```tsx
import { ProductCard } from '../product/ProductCard';
import type { Product } from '../../data/types';
import styles from '../../views/HomePage.module.css';

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <div className={styles.productGrid}>
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

- [ ] **Créer `src/pages/index.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer.astro';
import { CartDrawer } from '../components/layout/CartDrawer';
import HeroSection from '../components/home/HeroSection.astro';
import HowItWorksSection from '../components/home/HowItWorksSection.astro';
import CategoriesSection from '../components/home/CategoriesSection.astro';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import WhyUsSection from '../components/home/WhyUsSection.astro';
import ZoneSection from '../components/home/ZoneSection.astro';
import { fetchArticles, fetchCategories } from '../lib/directus';

const products = await fetchArticles();
const categories = await fetchCategories();
const featured = products.slice(0, 6);
---
<Layout
  title="Fiestalo'K — Location château gonflable Strasbourg & Alsace"
  description="Location de châteaux gonflables, sono, photobooths à Strasbourg et en Alsace. Livraison et montage inclus. Devis gratuit sous 24h."
  canonical="https://fiestalok.fr/"
>
  <Navbar client:load />
  <main>
    <HeroSection />
    <HowItWorksSection />
    <CategoriesSection categories={categories} />
    <section>
      <FeaturedProducts products={featured} client:load />
    </section>
    <WhyUsSection />
    <ZoneSection />
  </main>
  <Footer />
  <CartDrawer client:load />
</Layout>
```

- [ ] **Lancer `npm run dev` et vérifier la page d'accueil dans le navigateur**

```bash
npm run dev
```
Ouvrir http://localhost:4321. Vérifier : sections visibles, panier fonctionne, pas d'erreurs console.

- [ ] **Commit**

```bash
git add src/components/home/FeaturedProducts.tsx src/pages/index.astro
git commit -m "feat: add homepage (index.astro)"
```

---

## Task 11 : Page catalogue

**Files:**
- Create: `src/components/catalogue/CatalogueClient.tsx`
- Create: `src/pages/catalogue.astro`

- [ ] **Créer `src/components/catalogue/CatalogueClient.tsx`**

Copier `src/views/CataloguePage.tsx`, renommer en `CatalogueClient`, et modifier :

```tsx
// Supprimer :
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';

// Ajouter :
import type { Product } from '../../data/types';
import type { Category } from '../../data/categories';

// Changer la signature du composant :
export function CatalogueClient({ products, categories, initialCategory = 'all' }: {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
}) {
  // Supprimer : const { products, loading } = useProducts();
  // Remplacer initial FilterState :
  const initial: FilterState = { ...DEFAULT_FILTERS, category: initialCategory as CategoryId };

  // Remplacer useSearchParams par :
  const updateUrl = (cat: string) => {
    const url = new URL(window.location.href);
    if (cat === 'all') url.searchParams.delete('cat');
    else url.searchParams.set('cat', cat);
    window.history.replaceState({}, '', url.toString());
  };

  // Dans le useEffect sur filters.category, remplacer setParams par updateUrl :
  useEffect(() => { updateUrl(filters.category); }, [filters.category]);

  // Supprimer le state loading, remplacer {loading ? ... : ...} par {filtered.length === 0 ? ... : ...}
```

- [ ] **Créer `src/pages/catalogue.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer.astro';
import { CartDrawer } from '../components/layout/CartDrawer';
import { CatalogueClient } from '../components/catalogue/CatalogueClient';
import { fetchArticles, fetchCategories } from '../lib/directus';

const products = await fetchArticles();
const categories = await fetchCategories();
const initialCategory = Astro.url.searchParams.get('cat') ?? 'all';
---
<Layout
  title="Catalogue — Location matériel festif Alsace | Fiestalo'K"
  description="Parcourez notre catalogue : châteaux gonflables, enceintes, photobooths, machines à popcorn. Location en Alsace, livraison incluse."
>
  <Navbar client:load />
  <main>
    <CatalogueClient
      products={products}
      categories={categories}
      initialCategory={initialCategory}
      client:load
    />
  </main>
  <Footer />
  <CartDrawer client:load />
</Layout>
```

- [ ] **Tester `/catalogue` et `/catalogue?cat=chateau-gonflable`**

Vérifier filtres, onglets catégories, tri — tout doit fonctionner sans erreurs console.

- [ ] **Commit**

```bash
git add src/components/catalogue/CatalogueClient.tsx src/pages/catalogue.astro
git commit -m "feat: add catalogue page"
```

---

## Task 12 : Page produit

**Files:**
- Create: `src/pages/produit/[id].astro`

- [ ] **Créer `src/pages/produit/[id].astro`**

```astro
---
import Layout from '../../layouts/Layout.astro';
import { Navbar } from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer.astro';
import { CartDrawer } from '../../components/layout/CartDrawer';
import { ProductGallery } from '../../components/product/ProductGallery';
import { AddToCartButton } from '../../components/product/AddToCartButton';
import { ReviewsSection } from '../../components/product/ReviewsSection';
import { StarRating } from '../../components/ui/StarRating';
import { fetchArticle, fetchCategories } from '../../lib/directus';

const { id } = Astro.params;
const product = await fetchArticle(id!);

if (!product) return Astro.redirect('/catalogue');

const categories = await fetchCategories();
const cat = categories.find((c) => c.id === product.category);

const jsonLdProduct = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.shortDescription,
  image: product.images[0] ?? '',
  offers: {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
  },
};
---
<Layout
  title={`${product.name} — Location Strasbourg | Fiestalo'K`}
  description={`${product.shortDescription} — disponible à la location en Alsace. Livraison incluse.`}
  canonical={`https://fiestalok.fr/produit/${product.id}`}
  jsonLdProduct={jsonLdProduct}
>
  <Navbar client:load />
  <main class="container product-page">
    <nav class="crumbs">
      <a href="/catalogue">Catalogue</a> / <span>{product.name}</span>
    </nav>

    <div class="product-top">
      <ProductGallery images={product.images} alt={product.name} client:load />

      <div class="product-info">
        {cat && <p class="product-cat">{cat.emoji} {cat.label}</p>}
        {product.badge && <span class="badge">{product.badge}</span>}
        <h1>{product.name}</h1>
        <StarRating value={product.rating} count={product.reviewCount} size="md" client:load />
        <p class="product-desc">{product.longDescription}</p>
        <ul class="product-specs">
          {Object.entries(product.specs).map(([k, v]) => (
            <li><span>{k}</span><strong>{v}</strong></li>
          ))}
        </ul>
        <div class="price-row">
          <span class="price">{product.price}€</span>
          <span class="unit">/jour</span>
        </div>
        <AddToCartButton product={product} client:load />
      </div>
    </div>

    <section>
      <h2>Avis clients</h2>
      <ReviewsSection productId={product.id} client:visible />
    </section>
  </main>
  <Footer />
  <CartDrawer client:load />
</Layout>
```

- [ ] **Tester une page produit** (ex: `/produit/chateau-royal`) — vérifier SEO dans le code source (`<title>`, `<meta description>`, JSON-LD `Product`).

- [ ] **Commit**

```bash
git add src/pages/produit/
git commit -m "feat: add product page with SEO and React islands"
```

---

## Task 13 : Pages statiques (entreprise + qui-sommes-nous)

**Files:**
- Create: `src/pages/entreprise.astro`
- Create: `src/pages/qui-sommes-nous.astro`

- [ ] **Créer `src/pages/entreprise.astro`**

```astro
---
export const prerender = true;

import Layout from '../layouts/Layout.astro';
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer.astro';
import { CartDrawer } from '../components/layout/CartDrawer';

const REFS = ['Crédit Mutuel', 'Eurocorps', 'Groupe Eilor', 'EDF Alsace', 'Hôtel Régent'];
const FORMULES = [
  { icon: '🏆', title: 'Team Building', text: "On vous fournit tout : matériel pour animer votre journée cohésion : parcours gonflables, jeux collectifs, sono pour mettre l'ambiance.", items: ['Parcours & châteaux gonflables', 'Jeux collectifs', 'Matériel sono & enceintes'] },
  { icon: '🥂', title: 'Séminaire & Soirée', text: "On équipe votre événement avec sono pro et photobooth. Vous gérez la com, on s'occupe du matos.", items: ['Sono & enceintes pro', 'Photobooth & miroir 360°', 'Boule à facette & éclairage'] },
  { icon: '🎪', title: 'Kermesse & Famille', text: 'On fournit tout le matériel pour régaler petits et grands : châteaux, machines pop-corn & barbe à papa.', items: ['Châteaux gonflables', 'Machine pop-corn & barbe à papa', 'Plancha tarte flambée & BBQ'] },
];
const COMPLIANCE = [
  { icon: '🛡️', title: 'Norme EN 14960', text: 'Tous nos équipements gonflables sont certifiés CE et conformes à la norme européenne EN 14960. Contrôle technique annuel obligatoire.' },
  { icon: '📋', title: 'RC Pro & Assurance', text: 'Couverture Responsabilité Civile Professionnelle complète pour tous nos événements. Documentation fournie sur demande pour vos services RH et juridiques.' },
  { icon: '⚡', title: 'Conformité électrique', text: 'Tout le matériel électrique (sono, éclairage, machines) est vérifié et conforme aux normes NF C 15-100. Câblage adapté à vos installations.' },
  { icon: '🧯', title: 'Protocole sécurité', text: "Briefing sécurité avant chaque installation. Présence d'un responsable Fiestalo'K durant le montage et le démontage. Vérification des zones d'installation." },
];
---
<Layout
  title="Offres entreprise — Fiestalo'K Strasbourg"
  description="Animation team-building, kermesses, séminaires festifs en Alsace. Matériel certifié, équipe pro, devis gratuit."
  canonical="https://fiestalok.fr/entreprise"
>
  <Navbar client:load />
  <main>
    <!-- Reprendre le HTML de src/views/EntreprisePage.tsx en convertissant JSX → HTML Astro -->
    <!-- Utiliser les variables REFS, FORMULES, COMPLIANCE déclarées dans le frontmatter -->
    <!-- <a href="/devis"> à la place des <Button> -->
  </main>
  <Footer />
  <CartDrawer client:load />
</Layout>
```

Convertir le JSX de `src/views/EntreprisePage.tsx` en HTML Astro : `className` → `class`, `{FORMULES.map(...)}` → `{FORMULES.map(f => (<article>...</article>))}`.

- [ ] **Créer `src/pages/qui-sommes-nous.astro`** — même procédure avec `src/views/QuiSommesNousPage.tsx`.

```astro
---
export const prerender = true;
---
```

- [ ] **Vérifier que les pages sont pré-rendues** — après `npm run build`, les fichiers `dist/entreprise/index.html` et `dist/qui-sommes-nous/index.html` doivent exister comme HTML statique.

```bash
npm run build
ls dist/entreprise/
```
Attendu : `index.html` présent.

- [ ] **Commit**

```bash
git add src/pages/entreprise.astro src/pages/qui-sommes-nous.astro
git commit -m "feat: add static enterprise and about pages (prerender)"
```

---

## Task 14 : Page devis

**Files:**
- Modify: `src/views/DevisPage.tsx`
- Create: `src/pages/devis.astro`

- [ ] **Mettre à jour `src/views/DevisPage.tsx`**

Remplacer les imports :
```tsx
// Supprimer :
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createReservation, type ReservationCartItem } from '../lib/directus';

// Ajouter :
import { useStore } from '@nanostores/react';
import { cartStore, clearCart } from '../stores/cart';
```

Remplacer `const { items, clear } = useCart();` par :
```tsx
const { items } = useStore(cartStore);
```

Remplacer `const navigate = useNavigate();` — supprimer cette ligne.

Remplacer `navigate('/catalogue')` par `window.location.href = '/catalogue'`.
Remplacer `navigate(-1)` par `window.history.back()`.
Remplacer `navigate('/')` par `window.location.href = '/'`.
Remplacer `<Link to={...}>` par `<a href={...}>`.
Remplacer `clear()` par `clearCart()`.

Remplacer l'appel `createReservation(...)` par un fetch vers l'API route :
```tsx
const res = await fetch('/api/reservation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client: { type, first_name: firstName, last_name: lastName, company_name: type === 'professionnel' ? company : undefined, email, phone },
    date_start: dateStart,
    date_end: dateEnd,
    delivery,
    delivery_address: delivery ? deliveryAddress : undefined,
    notes,
    total_price: total,
    cartItems: cartItemsMapped,
    cf_token: cfToken,
  }),
});
if (!res.ok) {
  const err = await res.json() as { error: string };
  throw new Error(err.error ?? 'Erreur inconnue');
}
const { trackingToken } = await res.json() as { trackingToken: string };
```

Mettre à jour les imports de produits : supprimer `useProducts` — les produits doivent être reçus en props. Ajouter `products: Product[]` aux props du composant. Renommer le composant en `DevisForm`.

- [ ] **Créer `src/pages/devis.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer.astro';
import { CartDrawer } from '../components/layout/CartDrawer';
import { DevisForm } from '../views/DevisPage';
import { fetchArticles } from '../lib/directus';

const products = await fetchArticles();
---
<Layout
  title="Demande de devis — Fiestalo'K"
  description="Demandez votre devis de location de matériel festif en Alsace."
  noindex={true}
>
  <Navbar client:load />
  <main>
    <DevisForm products={products} client:load />
  </main>
  <Footer />
  <CartDrawer client:load />
</Layout>
```

- [ ] **Tester le flux complet** : ajouter un produit au panier → ouvrir CartDrawer → Demander un devis → remplir le formulaire → vérifier que `POST /api/reservation` est appelé (onglet Network).

- [ ] **Commit**

```bash
git add src/views/DevisPage.tsx src/pages/devis.astro
git commit -m "feat: add devis page, migrate to /api/reservation"
```

---

## Task 15 : Page suivi

**Files:**
- Modify: `src/views/SuiviPage.tsx`
- Create: `src/pages/suivi.astro`

- [ ] **Mettre à jour `src/views/SuiviPage.tsx`**

Remplacer la signature pour recevoir données en props (plus de fetch interne) :
```tsx
// Supprimer :
import { useSearchParams, Link } from 'react-router-dom';
import { fetchReservationByToken, type ReservationTracking } from '../lib/directus';

// Ajouter :
import type { ReservationTracking } from '../lib/directus';
```

Remplacer le composant entier par une version qui accepte les données :
```tsx
export function SuiviPage({ reservation, token }: { reservation: ReservationTracking | null; token: string | null }) {
  // Supprimer tous les useEffect + useState de chargement
  // Remplacer les conditions loading/notFound :
  if (!reservation) {
    return (
      <div className={`container ${styles.center}`}>
        <div className={styles.notFound}>
          <p className={styles.notFoundIcon}>🔍</p>
          <h1>Réservation introuvable</h1>
          <p>Le lien de suivi est invalide ou a expiré.</p>
          <a href="/" className={styles.backLink}>Retour à l'accueil</a>
        </div>
      </div>
    );
  }
  // Le reste du composant reste identique, sauf remplacer <Link> par <a>
```

- [ ] **Créer `src/pages/suivi.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer.astro';
import { CartDrawer } from '../components/layout/CartDrawer';
import { SuiviPage } from '../views/SuiviPage';
import { fetchReservationByToken } from '../lib/directus';

const token = Astro.url.searchParams.get('token') ?? Astro.url.searchParams.get('tracking_token');
const reservation = token ? await fetchReservationByToken(token) : null;
---
<Layout
  title="Suivi de réservation — Fiestalo'K"
  description="Suivez l'avancement de votre réservation Fiestalo'K."
  noindex={true}
>
  <Navbar client:load />
  <main>
    <SuiviPage reservation={reservation} token={token} client:load />
  </main>
  <Footer />
  <CartDrawer client:load />
</Layout>
```

- [ ] **Tester `/suivi?token=xxx`** avec un vrai token Directus — les données doivent apparaître sans spinner de chargement.

- [ ] **Commit**

```bash
git add src/views/SuiviPage.tsx src/pages/suivi.astro
git commit -m "feat: add suivi page with server-side fetch"
```

---

## Task 16 : Fichiers SEO + 404

**Files:**
- Create: `src/pages/404.astro`

- [ ] **Créer `src/pages/404.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer.astro';
import { CartDrawer } from '../components/layout/CartDrawer';
---
<Layout
  title="Page introuvable — Fiestalo'K"
  description="Cette page n'existe pas."
  noindex={true}
>
  <Navbar client:load />
  <main class="container" style="text-align:center; padding: 4rem 1rem;">
    <h1 style="font-size: 6rem; margin: 0;">404</h1>
    <p style="font-size: 1.25rem; margin: 1rem 0 2rem;">Oups, cette page a décollé sans nous prévenir.</p>
    <a href="/" style="background: var(--color-coral); color: white; padding: 0.75rem 2rem; border-radius: 9999px; text-decoration: none;">
      Retour à l'accueil
    </a>
  </main>
  <Footer />
  <CartDrawer client:load />
</Layout>
```

- [ ] **Vérifier que `robots.txt` et le sitemap sont corrects après un build**

```bash
npm run build
cat dist/robots.txt
cat dist/sitemap-index.xml
```
Attendu : `robots.txt` présent, `sitemap-index.xml` listant toutes les pages publiques (hors /devis, /suivi, /api/).

- [ ] **Commit**

```bash
git add src/pages/404.astro
git commit -m "feat: add 404 page"
```

---

## Task 17 : Nettoyage des anciens fichiers

**Files:**
- Delete: `index.html`, `src/main.tsx`, `src/App.tsx`
- Delete: `src/context/`
- Delete: `src/views/` (une fois toutes les pages Astro créées)
- Delete: `.github/workflows/deploy.yml`
- Modify: `package.json` (retrait gh-pages, react-router-dom)

- [ ] **Vérifier qu'aucun fichier dans `src/views/` n'est encore importé depuis Astro**

```bash
grep -r "from.*views/" src/pages/
```
Attendu : seuls `DevisPage` et `SuiviPage` dans `src/views/` sont encore importés (c'est voulu, ils sont des React islands).

- [ ] **Supprimer les fichiers obsolètes**

```bash
rm index.html src/main.tsx src/App.tsx
rm -rf src/context/
rm .github/workflows/deploy.yml
```

- [ ] **Désinstaller les dépendances inutiles**

```bash
npm uninstall react-router-dom gh-pages
```

- [ ] **Faire un build complet et vérifier l'absence d'erreurs**

```bash
npm run build
```
Attendu : build réussi, aucune erreur TypeScript.

- [ ] **Commit**

```bash
git add -A
git commit -m "chore: remove Vite SPA boilerplate, react-router-dom, old contexts"
```

---

## Task 18 : Déploiement Vercel

- [ ] **Connecter le repo à Vercel**

Sur https://vercel.com/new :
1. Importer le repo GitHub du projet `vitrine`
2. Vercel détecte Astro automatiquement
3. Framework Preset : **Astro**
4. Build Command : `astro build`
5. Output Directory : `dist`

- [ ] **Ajouter les variables d'environnement dans le dashboard Vercel**

Dans Settings → Environment Variables :

| Nom | Valeur | Environment |
|---|---|---|
| `DIRECTUS_URL` | URL du VPS Directus (ex: `https://api.fiestalok.fr`) | Production, Preview |
| `TURNSTILE_SECRET_KEY` | Clé secrète Cloudflare Turnstile | Production, Preview |
| `PUBLIC_TURNSTILE_SITE_KEY` | Clé publique Cloudflare Turnstile | Production, Preview |

- [ ] **Déclencher un premier deploy et tester sur l'URL Vercel preview**

```bash
git push origin wip/astro
```
Vérifier sur l'URL preview Vercel (`vitrine-xxx.vercel.app`) :
- Page d'accueil ✓
- Catalogue ✓
- Page produit ✓
- Ajout au panier ✓
- Formulaire devis (tester avec Turnstile en mode test) ✓
- Suivi réservation ✓
- `View Source` sur la homepage → contenu HTML visible sans JS ✓

- [ ] **Merger vers main et pointer le domaine**

Une fois validé sur la preview :
```bash
git checkout main
git merge wip/astro
git push origin main
```

Dans le dashboard Vercel → Domains → Ajouter `fiestalok.fr` → Suivre les instructions DNS (changer les enregistrements A/CNAME chez le registrar).

- [ ] **Vérifier le déploiement en production**

```bash
curl -I https://fiestalok.fr
```
Attendu : `HTTP/2 200`, header `x-vercel-id` présent.

Vérifier dans Google Search Console que le nouveau sitemap est soumis.

- [ ] **Commit final**

```bash
git add .
git commit -m "chore: finalize Vercel deployment config"
git push origin main
```

---

## Checklist de validation finale

- [ ] `View Source` sur fiestalok.fr — le contenu HTML est visible sans JS (SSR OK)
- [ ] `<title>` et `<meta description>` corrects sur chaque page
- [ ] JSON-LD `LocalBusiness` présent sur toutes les pages
- [ ] JSON-LD `Product` présent sur les pages `/produit/:id`
- [ ] `/sitemap-index.xml` accessible et complet
- [ ] `/robots.txt` correct (Disallow /api/, /devis, /suivi)
- [ ] Panier persiste entre les rechargements de page
- [ ] Formulaire devis soumet vers `/api/reservation` (pas directement vers Directus)
- [ ] `/suivi?token=xxx` affiche les données sans spinner
- [ ] Pages `/entreprise` et `/qui-sommes-nous` sont dans `dist/` comme HTML statique
- [ ] Google PageSpeed Insights : score Performance > 90 sur mobile
