# Performance — Images WebP + Fonts auto-hébergées

**Date :** 2026-06-25
**Objectif :** Améliorer le score PageSpeed mobile (68→85+) en éliminant les deux plus gros bottlenecks : images lourdes et Google Fonts bloquantes.

---

## Contexte

PageSpeed Insights mobile (25 juin 2026) :
- Score : 68/100
- LCP : 10,5s (rouge) ← principale cause : images non compressées
- FCP : 2,6s (orange) ← cause : Google Fonts bloquantes
- Payload totale : 3 150 Ko dont ~2 900 Ko d'images

Fichiers incriminés :
- `public/event6.jpg` : 1 048 Ko
- `public/logo.png` : 852 Ko
- `public/event1-5.jpg` : 60–84 Ko chacun
- Google Fonts (Bangers + Nunito) chargés via `<link>` bloquant

---

## Axe 1 — Images WebP + lazy loading

### Script de conversion

`scripts/convert-images.mjs` — script Node.js one-shot utilisant `sharp` :
- Convertit tous les fichiers `public/*.jpg` et `public/*.png` (sauf `icon.png`) en WebP
- Compression : qualité 82 pour les photos, 90 pour les logos
- Produit des fichiers `.webp` à côté des originaux (les originaux sont conservés pour compatibilité)

### Références dans le code

Mise à jour de toutes les balises `<img src="...jpg">` et `<img src="...png">` vers `.webp` dans :
- `src/pages/HomePage.tsx` (section galerie événements, logo si référencé)
- `src/components/layout/Navbar.tsx` (logo)
- `src/components/layout/Footer.tsx` (logo si présent)
- Tout autre composant référençant ces images

### Lazy loading

- `loading="eager"` (défaut) conservé sur `event1.webp` (premier visible)
- `loading="lazy"` ajouté sur `event2` à `event6`
- `<link rel="preload" as="image" href="/event1.webp">` dans `index.html`

---

## Axe 2 — Fonts auto-hébergées

### Fichiers à télécharger

| Famille | Variante | Fichier |
|---|---|---|
| Bangers | 400 regular | `bangers-regular.woff2` |
| Nunito | 400 regular | `nunito-400.woff2` |
| Nunito | 400 italic | `nunito-400-italic.woff2` |
| Nunito | 600 | `nunito-600.woff2` |
| Nunito | 700 | `nunito-700.woff2` |
| Nunito | 800 | `nunito-800.woff2` |

Stockés dans `public/fonts/`.

### @font-face dans tokens.css

Remplacement du commentaire de fonte dans `src/styles/tokens.css` par des déclarations `@font-face` avec `font-display: swap`.

### index.html

Suppression des 3 lignes Google Fonts (`preconnect` × 2 + `<link stylesheet>`).
Ajout d'un `<link rel="preload" as="font" crossorigin>` pour `bangers-regular.woff2` et `nunito-700.woff2` (les plus utilisées).

---

## Fichiers modifiés

| Fichier | Modification |
|---|---|
| `scripts/convert-images.mjs` | Créé — script de conversion sharp |
| `public/fonts/` | Créé — 6 fichiers woff2 |
| `public/*.webp` | Créé — images converties |
| `src/styles/tokens.css` | @font-face remplace l'import Google |
| `index.html` | Supprime Google Fonts, ajoute preload image + fonts |
| `src/pages/HomePage.tsx` | .jpg → .webp + loading="lazy" |
| `src/components/layout/Navbar.tsx` | logo.png → logo.webp |
| `src/components/layout/Footer.tsx` | logo.png → logo.webp si présent |

---

## Hors périmètre

- Code splitting JS (gain 59 Ko, complexité élevée)
- Optimisation DOM
- Images Directus (produits) — gérées côté CMS
