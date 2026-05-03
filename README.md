# Fiestalo'K — Site v2

Version multi-pages du site Fiestalo'K, basée sur Vite + React + React Router.
La v1 vanilla reste disponible à la racine du repo (`../index.html`).

## Lancer le site

```bash
cd site
npm install
npm run dev      # http://localhost:5174
npm run build    # build de production dans site/dist
npx vitest run   # lance la suite de tests
```

## Architecture

- `src/pages/` — une page par route (`HomePage`, `CataloguePage`, `ProductPage`, `EntreprisePage`, `QuiSommesNousPage`)
- `src/components/`
  - `layout/` — `Navbar`, `Footer`, `CartDrawer` (rendus par `App.tsx` autour de `<Routes>`)
  - `ui/` — `Button`, `Badge`, `Section`, `StarRating` (primitives réutilisables)
  - `product/` — `ProductCard`, `ProductGallery`, `AvailabilityCalendar`, `ReviewList`, `ReviewForm`
  - `catalogue/` — `CategoryTabs`, `CatalogueFilters`
- `src/context/` — `CartContext` et `ReviewsContext` (persistés en `localStorage`)
- `src/data/` — `products.json`, `categories.ts`, `unavailable.ts`, `types.ts`
- `src/lib/` — helpers purs (`filterProducts`, `format`, `storage`)
- `src/styles/` — `tokens.css` (variables CSS Pop Décalé), `reset.css`, `global.css`
- `src/tests/` — Vitest + React Testing Library (`CartContext`, `CatalogueFilters`, `AvailabilityCalendar`)

## Direction artistique

"Pop Décalé" — palette turquoise / corail / jaune / charbon, typo Bangers + Nunito, badges stickers rotatés.
Voir `../docs/superpowers/specs/2026-04-07-moodboard-direction-artistique-design.md` pour la spec complète et `../moodboard.html` pour l'aperçu.

## Routes

| Route | Page | Description |
|---|---|---|
| `/` | `HomePage` | Hero, comment ça marche, catégories, produits stars, valeurs |
| `/catalogue` | `CataloguePage` | Tabs catégories, filtres, tri, grille produits |
| `/produit/:id` | `ProductPage` | Galerie, specs, calendrier dispos, avis |
| `/entreprise` | `EntreprisePage` | Hero corporate, références, formules, gallery, conformité |
| `/qui-sommes-nous` | `QuiSommesNousPage` | Histoire, valeurs, stats |

## Données

Tout est local. Pas de backend.
- 15 produits dans `src/data/products.json` (images Unsplash).
- Indisponibilités mockées dans `src/data/unavailable.ts` pour les produits 1-3.
- Le panier et les avis sont persistés en `localStorage` via `CartContext` / `ReviewsContext`.
