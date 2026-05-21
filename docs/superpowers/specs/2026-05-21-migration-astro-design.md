# Migration React → Astro SSR — Design

**Date :** 2026-05-21  
**Statut :** En cours de brainstorming (architecture validée, sections SEO/pages/déploiement à valider)

---

## Contexte

**Site actuel en prod :** `fiestalok.fr` — Vue.js SPA avec SSR, premier sur "chateau gonflable strasbourg".  
**Nouvelle app :** `vitrine/` — React + Vite SPA (ce repo), sans SSR, risque de perdre le référencement au déploiement.  
**Objectif :** Migrer la nouvelle app vers Astro SSR pour avoir un SEO excellent avant de remplacer le site actuel.

**Backend :** Directus sur VPS (URL via `VITE_DIRECTUS_URL`)  
**Auth antispam :** Cloudflare Turnstile (`VITE_TURNSTILE_SITE_KEY`)  
**Hébergement cible :** Vercel (SSR, deploy auto depuis GitHub)

---

## Architecture validée ✅

### Principe : Astro SSR + React islands + nanostores

```
Page Astro (rendu serveur à chaque requête)
├── <head> SEO : title, meta, canonical, JSON-LD   ← Astro
├── <Navbar client:load />                          ← île React
├── <main>
│   ├── Contenu HTML statique                       ← rendu serveur
│   └── <ComponentInteractif client:load />         ← île React
└── <CartDrawer client:load />                      ← île React
```

### Migration des Contexts

| Actuel | Astro |
|---|---|
| `react-router-dom` | Routing fichiers `src/pages/` |
| `ProductsContext` | Fetch Directus dans frontmatter Astro → props |
| `CategoriesContext` | Idem |
| `CartContext` | **nanostores** + `@nanostores/persistent` (localStorage) |
| `ReviewsContext` | Fetch client-side dans l'île ReviewList |
| `useNavigate()` | `window.location.href` dans les îles |

**Nanostores uniquement pour le panier** — seul état partagé entre plusieurs îles (Navbar badge, CartDrawer, ProductPage, DevisPage). Produits et catégories passés en props depuis le serveur.

---

## Sections à valider

- [ ] Structure des pages (routing, SEO par page, JSON-LD)
- [ ] Détail du cart store (nanostores)
- [ ] Stratégie de déploiement Vercel
- [ ] Gestion des variables d'environnement
- [ ] Sitemap + robots.txt

---

## Flux panier (existant, à conserver)

```
ProductCard → add to cart (nanostore)
     ↓
CartDrawer (slide-in) → "Demander un devis"
     ↓
/devis → DevisPage (formulaire : infos client + dates + livraison)
     ↓
createReservation() → Directus API
     ↓
/suivi?token=xxx → SuiviPage
```

## Pages existantes à migrer

| Route actuelle | Fichier Astro |
|---|---|
| `/` | `src/pages/index.astro` |
| `/catalogue` | `src/pages/catalogue.astro` |
| `/produit/:id` | `src/pages/produit/[id].astro` |
| `/entreprise` | `src/pages/entreprise.astro` |
| `/qui-sommes-nous` | `src/pages/qui-sommes-nous.astro` |
| `/devis` | `src/pages/devis.astro` |
| `/suivi` | `src/pages/suivi.astro` |
