# Migration React → Astro SSR — Design validé

**Date :** 2026-05-21  
**Statut :** Design validé — prêt pour le plan d'implémentation

---

## Contexte

**Site actuel en prod :** `fiestalok.fr` — Vue.js SPA avec SSR, premier sur "chateau gonflable strasbourg".  
**Nouvelle app :** `vitrine/` — React + Vite SPA (ce repo), sans SSR, risque de perdre le référencement.  
**Objectif :** Migrer vers Astro SSR pour un SEO excellent avant de remplacer le site actuel.

**Backend :** Directus sur VPS  
**Auth antispam :** Cloudflare Turnstile  
**Hébergement cible :** Vercel (SSR, deploy auto depuis GitHub, remplace GitHub Pages)

---

## Architecture

### Principe : Astro SSR + React islands + nanostores

```
Page Astro (rendu serveur à chaque requête Vercel)
├── <head> SEO : title, meta, canonical, JSON-LD        ← Layout.astro
├── <Navbar client:load />                               ← île React (badge panier)
├── <main>
│   ├── Contenu HTML statique (sections non-interactives) ← composants .astro
│   ├── <CatalogueFilters client:load />                  ← île React
│   └── <ReviewList client:visible />                     ← île React (lazy)
└── <CartDrawer client:load />                            ← île React
```

### Règle d'hydratation

- `client:load` : Navbar, CartDrawer, tout composant visible immédiatement au chargement
- `client:visible` : ReviewList, ReviewForm — hydratation au scroll uniquement
- `.astro` pur (0 JS) : Footer, HeroSection, WhyUsSection, ZoneSection, AboutSection — sections sans interactivité, zéro JS émis

### Migration des abstractions React

| Actuel | Astro |
|---|---|
| `react-router-dom` | Routing fichiers `src/pages/` |
| `ProductsContext` | Fetch Directus dans frontmatter Astro → props |
| `CategoriesContext` | Idem |
| `CartContext` | **nanostores** + `@nanostores/persistent` |
| `ReviewsContext` | Fetch client-side dans l'île ReviewList |
| `useNavigate()` | `window.location.href` dans les îles |

---

## Pages et SEO

### Layout partagé (`src/layouts/Layout.astro`)

Reçoit `title`, `description`, `canonical`, `noindex?` en props. Génère :
- `<title>`, `<meta name="description">`, `<link rel="canonical">`
- Open Graph complet + `og:image` (image par défaut dans `public/og-default.jpg`)
- JSON-LD `LocalBusiness` sur toutes les pages (identique à l'actuel fiestalok.fr)
- `<meta name="robots" content="noindex">` si `noindex` prop présente
- `<ViewTransitions />` pour navigation fluide SPA-like

### SEO par page

| Route | Title | Description | Notes |
|---|---|---|---|
| `/` | Fiestalo'K — Location château gonflable Strasbourg & Alsace | Location de châteaux gonflables, sono, photobooths — livraison incluse en Alsace. Devis gratuit. | JSON-LD LocalBusiness |
| `/catalogue` | Catalogue — Location matériel festif Alsace \| Fiestalo'K | Parcourez notre catalogue : châteaux gonflables, enceintes, photobooths… | — |
| `/produit/[id]` | `{nom produit}` — Location Strasbourg \| Fiestalo'K | `{shortDescription}` — disponible à la location en Alsace. | JSON-LD Product |
| `/entreprise` | Offres entreprise — Fiestalo'K Strasbourg | Animation team-building, kermesses, événements d'entreprise en Alsace. | `prerender = true` |
| `/qui-sommes-nous` | Qui sommes-nous — Fiestalo'K Alsace | Découvrez l'équipe Fiestalo'K, spécialiste de la location festive à Strasbourg. | `prerender = true` |
| `/devis` | Demande de devis — Fiestalo'K | — | `noindex` |
| `/suivi` | Suivi de réservation — Fiestalo'K | — | `noindex` |

### JSON-LD Product sur `/produit/[id]`

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{nom}",
  "description": "{description}",
  "image": "{première image}",
  "offers": {
    "@type": "Offer",
    "price": "{prix}",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock"
  }
}
```

### Fichiers SEO

- `public/robots.txt` : autorise tout sauf `/api/`, disallow `/devis`, `/suivi`, pointe vers `/sitemap-index.xml`
- `sitemap.xml` : généré automatiquement par `@astrojs/sitemap` à chaque build
- `public/og-default.jpg` : image Open Graph par défaut (1200×630)
- `src/pages/404.astro` : page 404 personnalisée

---

## Cart store (nanostores)

**`src/stores/cart.ts`**

```ts
import { persistentAtom } from '@nanostores/persistent'

export type CartItem = {
  productId: string
  quantity: number
  startDate?: string
  endDate?: string
}

export type CartStore = {
  items: CartItem[]
  isOpen: boolean
}

export const cartStore = persistentAtom<CartStore>('fiestalok-cart', {
  items: [],
  isOpen: false,
}, { encode: JSON.stringify, decode: JSON.parse })

// Helpers exportés et utilisables dans toutes les îles
export function addToCart(item: CartItem) { ... }
export function removeFromCart(productId: string) { ... }
export function setCartQuantity(productId: string, qty: number) { ... }
export function clearCart() { ... }
export function openCart() { ... }
export function closeCart() { ... }
```

**Dans les îles React :**
```ts
import { useStore } from '@nanostores/react'
import { cartStore } from '../stores/cart'

const { items, isOpen } = useStore(cartStore)
```

**Note :** lors du premier rendu SSR, le panier est toujours vide (pas de localStorage serveur). Le badge Navbar flashera brièvement de 0 au vrai compte lors de l'hydratation — comportement attendu et acceptable, géré avec une classe CSS `opacity-0` retirée après hydratation.

---

## Route API réservation

**`src/pages/api/reservation.ts`** — remplace les appels Directus directs depuis `DevisPage`

```
POST /api/reservation
  ← { client, dates, delivery, cartItems, cf_token }
  → valide Turnstile côté serveur
  → crée client + réservation + articles dans Directus
  → retourne { trackingToken }
```

Avantages :
- URL Directus jamais exposée au navigateur (`DIRECTUS_URL` sans préfixe PUBLIC)
- Validation Turnstile côté serveur avant tout appel Directus
- 1 appel HTTP client → serveur au lieu de 4+ appels client → Directus

---

## SuiviPage : fetch serveur

`suivi.astro` lit `Astro.url.searchParams.get('token')` dans le frontmatter et fetch la réservation côté serveur. Le HTML rendu contient déjà les données — pas de spinner de chargement.

---

## Pages pré-rendues (hybride)

`/entreprise` et `/qui-sommes-nous` n'ont aucune donnée dynamique :

```ts
// en haut de entreprise.astro et qui-sommes-nous.astro
export const prerender = true
```

Servis comme fichiers statiques depuis le edge Vercel, plus rapides et sans consommer de fonction serverless.

---

## Déploiement Vercel

### Configuration Astro

```js
// astro.config.mjs
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import vercel from '@astrojs/vercel/serverless'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://fiestalok.fr',
  output: 'hybrid',          // hybrid = SSR par défaut + prerender possible par page
  adapter: vercel(),
  integrations: [react(), sitemap()],
})
```

### Variables d'environnement (Vercel dashboard)

| Variable | Valeur | Visibilité |
|---|---|---|
| `DIRECTUS_URL` | URL du VPS Directus | Serveur uniquement |
| `TURNSTILE_SECRET_KEY` | Clé secrète Turnstile | Serveur uniquement |
| `PUBLIC_TURNSTILE_SITE_KEY` | Clé publique Turnstile | Client (préfixe PUBLIC_) |

### Workflow de bascule sans downtime

1. Connecter le repo GitHub à Vercel → deploy automatique sur chaque push `main`
2. Tester sur l'URL Vercel preview (`vitrine.vercel.app`)
3. Ajouter `fiestalok.fr` dans les domaines Vercel
4. Changer les DNS `fiestalok.fr` → Vercel (propagation ~10 min)
5. Supprimer le workflow `deploy.yml` GitHub Pages après validation

---

## Flux panier (conservé à l'identique)

```
ProductCard (île React)
  → addToCart(nanostore)
     ↓
CartDrawer (île React, client:load)
  → "Demander un devis" → window.location.href = '/devis'
     ↓
devis.astro → <DevisForm client:load /> (île React)
  → POST /api/reservation
     ↓
suivi.astro?token=xxx (fetch serveur)
```

---

## Structure de fichiers cible

```
src/
  layouts/
    Layout.astro           ← head SEO + ViewTransitions
  pages/
    index.astro
    catalogue.astro
    produit/[id].astro
    entreprise.astro       ← prerender = true
    qui-sommes-nous.astro  ← prerender = true
    devis.astro
    suivi.astro
    404.astro
    api/
      reservation.ts       ← POST handler
  components/
    layout/
      Navbar.tsx           ← île React (client:load)
      CartDrawer.tsx       ← île React (client:load)
      Footer.astro         ← statique
    catalogue/
      CatalogueClient.tsx  ← île React (client:load) — filters + cards
    product/
      ProductGallery.tsx   ← île React (client:load)
      AvailabilityCalendar.tsx ← île React (client:load)
      ReviewList.tsx       ← île React (client:visible)
      ReviewForm.tsx       ← île React (client:visible)
    home/
      HeroSection.astro    ← statique
      WhyUsSection.astro   ← statique
      ZoneSection.astro    ← statique
    ui/                    ← composants UI, mixte .astro / .tsx selon besoin
  stores/
    cart.ts                ← nanostores
  lib/
    directus.ts            ← fetchArticles, fetchArticle, fetchCategories (serveur)
                              fetchReservationByToken (serveur)
                              createReservation retiré → remplacé par /api/reservation
public/
  og-default.jpg
  robots.txt
  favicon.svg
```
