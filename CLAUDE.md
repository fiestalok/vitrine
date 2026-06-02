# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Contexte métier

Fiestalo'K est une entreprise de **location de matériel festif** : châteaux gonflables,
accessoires de fête, matériel de restauration, enceintes. Ce repo est le **site vitrine v2**.

Modèle : **pas de paiement en ligne**. Le client constitue un panier (produit + dates),
puis remplit un formulaire de **devis** (`/devis`) qui crée une réservation côté backend
avec le statut `en_attente`. Il reçoit un `tracking_token` lui permettant de suivre l'avancement
de sa demande sur `/suivi?token=…` (en_attente → devis_realise → devis_confirme → terminee).
La conversion devis → contrat se fait hors site, par l'équipe Fiestalo'K.

## Conventions de travail

- **Langue** : échanges et UI/contenu en **français** ; le **code (identifiants, fonctions) en anglais**.
  (Du code existant porte des commentaires en français ; aligner le nouveau code sur l'anglais.)
- **Git** : jamais de commit direct sur `main`. Toujours une branche `feat/…` ou `fix/…` puis une PR.
- ⚠️ Tout push sur `main` **déclenche le déploiement GitHub Pages** (`.github/workflows/deploy.yml`).
  Vérifier `npx vitest run` et `npm run lint` avant de pousser vers `main`.

## Commandes

```bash
npm run dev        # serveur Vite sur http://localhost:5174 (proxy /api → https://back.fiestalok.fr)
npm run build      # tsc -b puis vite build → dist/
npm run lint       # ESLint sur tout le repo
npx vitest run     # suite de tests (one-shot, sans watch)
npx vitest run src/tests/CartContext.test.tsx   # un seul fichier de test
npx vitest -t "ajoute un produit"               # tests dont le nom matche le pattern
npm run deploy     # build + publication gh-pages (déploiement manuel ; CI le fait sur push main)
```

## Architecture

Stack : **React 19 + TypeScript + Vite 8 + React Router 7 (HashRouter)**. CSS Modules + variables CSS.
Tests : Vitest + React Testing Library (jsdom).

### Backend — Directus (repo séparé, non accessible ici)

Le front consomme l'API REST d'une instance **Directus** hébergée sur `back.fiestalok.fr`.
Tout l'accès réseau est centralisé dans `src/lib/directus.ts` — c'est le **contrat d'API** ;
aucun autre fichier ne doit faire de `fetch`. Variables d'env (préfixe `VITE_`, voir `.env`) :
- `VITE_DIRECTUS_URL` — base de l'API. En dev = `/api` (réécrit par le proxy Vite vers
  `back.fiestalok.fr`, voir `vite.config.ts`). Fallback hardcodé : `http://localhost:8055`.
- `VITE_TURNSTILE_SITE_KEY` — clé Cloudflare Turnstile (anti-bot du formulaire de devis).

Collections Directus consommées : `produits`, `categories`, `articles` (= unités physiques
individuelles d'un produit), `clients`, `reservations`, `reservations_articles`.

**Mapping Directus → modèle front** (`mapProduit`, `fetchProduits`) :
- `Product.id` côté front = `slug` Directus (jamais l'id numérique). Les routes produit
  utilisent le slug : `/produit/:id`.
- Seuls les produits `status=published` sont récupérés.
- `articleIds` agrège les unités physiques (`articles`) d'un produit ; ils servent au calcul
  de disponibilité par plage de dates (`fetchReservedArticleIds`) — une réservation occupe
  une unité, pas le produit entier.
- `rating`/`reviewCount` absents en base sont dérivés du slug (`slugRating`/`slugReviewCount`).

**Création de réservation** (`createReservation`, appelée par `DevisPage`) — séquence :
1. crée le `client`, 2. crée la `reservation` (statut `en_attente`, `tracking_token` = UUID local),
3. résout les `produits` par slug, 4. trouve une unité (`article`) disponible par produit sur la
plage, 5. crée les `reservations_articles`. Retourne le `tracking_token`.

### Frontend

- `src/App.tsx` — providers imbriqués (Products → Categories → Cart → Reviews) autour des
  `<Routes>`. Layout commun : `Navbar`, `Footer`, `CartDrawer`, `ScrollToTop`.
- `src/main.tsx` — **HashRouter** (URLs en `/#/…`), nécessaire pour GitHub Pages. `base: '/vitrine/'`.
- **Contexts** (`src/context/`) :
  - `ProductsContext` / `CategoriesContext` — fetch Directus au montage, exposent `{ data, loading }`.
    Sur erreur réseau → liste vide (le site reste affichable). Quasi tous les composants lisent
    leurs données via `useProducts()` / `useCategories()`, pas via import direct.
  - `CartContext` / `ReviewsContext` — état local persisté en **localStorage**
    (`fiestalok.cart.v1`, `fiestalok.reviews.v1`). Les avis sont **purement locaux** (non envoyés au backend).
- `src/pages/` — une page par route : `HomePage`, `CataloguePage`, `ProductPage`, `EntreprisePage`,
  `QuiSommesNousPage`, `DevisPage` (formulaire de devis + Turnstile), `SuiviPage` (suivi par token).
- `src/lib/` — helpers purs et testables : `filterProducts` (filtre/tri catalogue), `format`
  (prix `€/jour`, dates fr), `storage` (localStorage safe). `directus.ts` est la seule couche réseau.
- `src/data/` — `types.ts` (modèles `Product`/`Review`/`CartItem`), `categories.ts`
  (types `CategoryId`/`Audience`), `unavailable.ts` (indispos **mockées** côté front).
- `src/styles/` — `tokens.css` définit la DA **« Pop Décalé »** (palette corail/jaune/menthe,
  typos Bangers + Nunito, ombres « sticker »). Toujours réutiliser ces variables CSS.

### À savoir

- **Disponibilités produit incohérentes** : `ProductPage` affiche les indispos via le mock
  `src/data/unavailable.ts` (`BLOCKED_UNTIL_JUNE_22`), alors que la création de réservation
  calcule la vraie dispo via Directus (`fetchReservedArticleIds`). Le calendrier produit n'est
  donc pas encore branché sur les données réelles.
- Le **README.md décrit une version antérieure** (« pas de backend », v1 vanilla, moodboard,
  dossier `docs/`) : **obsolète, l'ignorer**. Ce repo est la seule source de vérité.
