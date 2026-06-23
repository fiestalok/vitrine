# SEO & BrowserRouter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer HashRouter par BrowserRouter pour permettre l'indexation de toutes les pages, puis ajouter les balises SEO, JSON-LD, sitemap, robots.txt et les meta tags par page.

**Architecture:** GitHub Pages ne supporte pas le routing côté serveur, donc on utilise le workaround classique : `public/404.html` encode l'URL demandée en query string et redirige vers la racine ; un script dans `index.html` restaure l'URL avant que React se monte. `react-helmet-async` gère les balises `<head>` par page.

**Tech Stack:** React Router 7 (BrowserRouter), react-helmet-async, Vite, GitHub Pages

---

## Fichiers touchés

| Fichier | Action |
|---|---|
| `src/main.tsx` | Modifier — HashRouter → BrowserRouter + HelmetProvider |
| `index.html` | Modifier — script de restauration URL + fix meta description + og:image + og:url + JSON-LD |
| `public/404.html` | Créer — redirect GitHub Pages SPA |
| `public/robots.txt` | Créer — règles de crawl |
| `public/sitemap.xml` | Créer — toutes les routes statiques |
| `src/components/seo/PageSEO.tsx` | Créer — composant SEO réutilisable |
| `src/pages/HomePage.tsx` | Modifier — ajouter `<PageSEO>` |
| `src/pages/CataloguePage.tsx` | Modifier — ajouter `<PageSEO>` |
| `src/pages/ProductPage.tsx` | Modifier — ajouter `<PageSEO>` dynamique |
| `src/pages/EntreprisePage.tsx` | Modifier — ajouter `<PageSEO>` |
| `src/pages/QuiSommesNousPage.tsx` | Modifier — ajouter `<PageSEO>` |
| `src/pages/DevisPage.tsx` | Modifier — ajouter `<PageSEO>` |
| `src/pages/MentionsLegalesPage.tsx` | Modifier — ajouter `<PageSEO>` |

---

## Task 1 : GitHub Pages SPA — fichier 404.html

**Files:**
- Create: `public/404.html`

- [ ] **Step 1 : Créer `public/404.html`**

Ce fichier est servi par GitHub Pages pour toute URL inconnue (ex : `/catalogue`).
Il encode le chemin en query string et redirige vers la racine.

```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <title>Hoplalo'K</title>
    <script>
      // GitHub Pages SPA workaround — rafael.adm.br/p/gh-pages-with-angular-js
      // Encode the path + search into ?p=… then redirect to root
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.host + '/' +
        '?p=/' + l.pathname.slice(1).replace(/&/g, '~and~') +
        (l.search ? '&q=' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body></body>
</html>
```

- [ ] **Step 2 : Vérifier**

Ouvrir `http://localhost:5174/catalogue` dans le navigateur.
En dev (Vite gère le routing), la page Catalogue doit s'afficher — pas de 404.
Le fichier 404.html ne s'active qu'en prod sur GitHub Pages, donc ce step confirme surtout l'absence d'erreur de build.

---

## Task 2 : Restauration d'URL dans index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1 : Ajouter le script de restauration dans `<head>` avant tout autre script**

Ce script lit le query param `?p=` créé par `404.html` et utilise `history.replaceState`
pour rétablir la vraie URL avant que React se monte.

Ajouter juste après `<meta name="viewport" ...>` :

```html
    <!-- GitHub Pages SPA: restaure l'URL encodée par 404.html -->
    <script>
      (function (l) {
        if (l.search[1] === 'p') {
          var parts = l.search.slice(1).split('&').map(function (s) {
            return s.replace(/~and~/g, '&');
          });
          window.history.replaceState(
            null, null,
            parts[0].slice(2) +
            (parts[1] ? '?' + parts[1] : '') +
            l.hash
          );
        }
      }(window.location));
    </script>
```

---

## Task 3 : Passer de HashRouter à BrowserRouter

**Files:**
- Modify: `src/main.tsx`

- [ ] **Step 1 : Installer react-helmet-async**

```bash
npm install react-helmet-async
```

Résultat attendu : `react-helmet-async` apparaît dans `package.json` → `dependencies`.

- [ ] **Step 2 : Modifier `src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './styles/reset.css';
import './styles/tokens.css';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
```

- [ ] **Step 3 : Vérifier en dev**

```bash
npm run dev
```

Naviguer sur `http://localhost:5174/catalogue` → page Catalogue s'affiche.
Naviguer sur `http://localhost:5174/` → page Accueil s'affiche.
Le bouton retour du navigateur doit fonctionner entre les pages.

- [ ] **Step 4 : Lancer les tests**

```bash
npx vitest run
```

Résultat attendu : tous les tests passent (le changement de router est transparent pour les tests unitaires existants).

- [ ] **Step 5 : Commit**

```bash
git add src/main.tsx index.html public/404.html package.json package-lock.json
git commit -m "feat(seo): migrate HashRouter → BrowserRouter + GitHub Pages 404 workaround"
```

---

## Task 4 : Améliorer index.html (meta globaux + JSON-LD)

**Files:**
- Modify: `index.html`

- [ ] **Step 1 : Remplacer les balises meta et ajouter JSON-LD**

Remplacer le bloc `<title>` + `<!-- Open Graph -->` existant par :

```html
    <title>Hoplalo'K | Location de matériel festif en Alsace</title>
    <meta name="description" content="Hoplalo'K loue du matériel festif en Alsace : châteaux gonflables, enceintes, machines à pop-corn, plancha et plus. Livraison dans tout le Bas-Rhin et le Haut-Rhin." />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.hoplalok.fr/" />
    <meta property="og:title" content="Hoplalo'K | Location de matériel festif en Alsace" />
    <meta property="og:description" content="Hoplalo'K loue du matériel festif en Alsace : châteaux gonflables, enceintes, machines à pop-corn, plancha et plus. Livraison dans tout le Bas-Rhin et le Haut-Rhin." />
    <meta property="og:image" content="https://www.hoplalok.fr/logo.png" />
    <meta property="og:locale" content="fr_FR" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Hoplalo'K | Location de matériel festif en Alsace" />
    <meta name="twitter:description" content="Hoplalo'K loue du matériel festif en Alsace : châteaux gonflables, enceintes, machines à pop-corn, plancha et plus." />
    <meta name="twitter:image" content="https://www.hoplalok.fr/logo.png" />

    <!-- JSON-LD LocalBusiness -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Hoplalo'K",
      "description": "Location de matériel festif en Alsace : châteaux gonflables, enceintes, machines à pop-corn, plancha tarte flambée.",
      "url": "https://www.hoplalok.fr",
      "telephone": "+33679515925",
      "email": "contact@fiestalok.fr",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Strasbourg",
        "addressRegion": "Alsace",
        "addressCountry": "FR"
      },
      "areaServed": ["Bas-Rhin", "Haut-Rhin", "Alsace"],
      "image": "https://www.hoplalok.fr/logo.png",
      "priceRange": "€€",
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        "opens": "08:00",
        "closes": "20:00"
      }
    }
    </script>
```

- [ ] **Step 2 : Commit**

```bash
git add index.html
git commit -m "feat(seo): fix meta description + og tags + JSON-LD LocalBusiness"
```

---

## Task 5 : Composant PageSEO

**Files:**
- Create: `src/components/seo/PageSEO.tsx`

- [ ] **Step 1 : Créer `src/components/seo/PageSEO.tsx`**

```tsx
import { Helmet } from 'react-helmet-async';

interface PageSEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
}

const BASE_URL = 'https://www.hoplalok.fr';
const DEFAULT_IMAGE = `${BASE_URL}/logo.png`;

export function PageSEO({ title, description, path, image = DEFAULT_IMAGE }: PageSEOProps) {
  const url = `${BASE_URL}${path}`;
  const fullTitle = `${title} | Hoplalo'K`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
```

- [ ] **Step 2 : Commit**

```bash
git add src/components/seo/PageSEO.tsx
git commit -m "feat(seo): add reusable PageSEO component"
```

---

## Task 6 : Ajouter PageSEO sur toutes les pages

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/pages/CataloguePage.tsx`
- Modify: `src/pages/ProductPage.tsx`
- Modify: `src/pages/EntreprisePage.tsx`
- Modify: `src/pages/QuiSommesNousPage.tsx`
- Modify: `src/pages/DevisPage.tsx`
- Modify: `src/pages/MentionsLegalesPage.tsx`

- [ ] **Step 1 : HomePage**

Ajouter en premier enfant du fragment/div racine :

```tsx
import { PageSEO } from '../components/seo/PageSEO';

// Dans le return, en premier :
<PageSEO
  title="Location de matériel festif en Alsace"
  description="Hoplalo'K loue du matériel festif en Alsace : châteaux gonflables, enceintes, machines à pop-corn, plancha. Livraison dans tout le Bas-Rhin et le Haut-Rhin."
  path="/"
/>
```

- [ ] **Step 2 : CataloguePage**

```tsx
import { PageSEO } from '../components/seo/PageSEO';

<PageSEO
  title="Catalogue — Location de matériel festif"
  description="Découvrez notre catalogue de location : châteaux gonflables, enceintes sono, machines à pop-corn et barbe à papa, plancha tarte flambée. Disponible en Alsace."
  path="/catalogue"
/>
```

- [ ] **Step 3 : ProductPage**

`ProductPage` charge le produit via `useProducts()` et le slug. Ajouter un SEO dynamique :

```tsx
import { PageSEO } from '../components/seo/PageSEO';

// Dans le composant, après la résolution du produit :
// (product est déjà résolu via useParams + useProducts dans la page)

{product && (
  <PageSEO
    title={`Location ${product.name} en Alsace`}
    description={`Louez ${product.name} pour votre événement en Alsace. ${product.description?.slice(0, 120) ?? 'Livraison dans tout le Bas-Rhin et le Haut-Rhin.'}...`}
    path={`/produit/${product.id}`}
    image={product.image ?? undefined}
  />
)}
```

- [ ] **Step 4 : EntreprisePage**

```tsx
import { PageSEO } from '../components/seo/PageSEO';

<PageSEO
  title="Location matériel événementiel entreprise"
  description="Hoplalo'K équipe vos événements d'entreprise en Alsace : team building, séminaires, kermesses. Matériel festif professionnel, livraison et installation incluses."
  path="/entreprise"
/>
```

- [ ] **Step 5 : QuiSommesNousPage**

```tsx
import { PageSEO } from '../components/seo/PageSEO';

<PageSEO
  title="Qui sommes-nous — Équipe festive alsacienne"
  description="Découvrez l'équipe Hoplalo'K : une association alsacienne passionnée par les fêtes et l'événementiel. Certifiés CE, assurés RC Pro, basés à Strasbourg."
  path="/qui-sommes-nous"
/>
```

- [ ] **Step 6 : DevisPage**

```tsx
import { PageSEO } from '../components/seo/PageSEO';

<PageSEO
  title="Demande de devis — Location matériel festif"
  description="Envoyez votre demande de devis pour louer du matériel festif en Alsace. Réponse rapide, livraison dans tout le Bas-Rhin et le Haut-Rhin."
  path="/devis"
/>
```

- [ ] **Step 7 : MentionsLegalesPage**

```tsx
import { PageSEO } from '../components/seo/PageSEO';

<PageSEO
  title="Mentions légales"
  description="Mentions légales du site Hoplalo'K — éditeur, hébergement, données personnelles et RGPD."
  path="/mentions-legales"
/>
```

- [ ] **Step 8 : Vérifier en dev**

```bash
npm run dev
```

Naviguer sur chaque page et inspecter `<title>` dans les DevTools → chaque page doit avoir un titre unique.

- [ ] **Step 9 : Commit**

```bash
git add src/pages/
git commit -m "feat(seo): add per-page meta tags via PageSEO component"
```

---

## Task 7 : robots.txt et sitemap.xml

**Files:**
- Create: `public/robots.txt`
- Create: `public/sitemap.xml`

- [ ] **Step 1 : Créer `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://www.hoplalok.fr/sitemap.xml
```

- [ ] **Step 2 : Créer `public/sitemap.xml`**

Les URLs produit sont dynamiques (slugs Directus), donc seules les routes statiques sont incluses.
Mettre à jour `lastmod` à la date du déploiement.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.hoplalok.fr/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.hoplalok.fr/catalogue</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.hoplalok.fr/entreprise</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.hoplalok.fr/qui-sommes-nous</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://www.hoplalok.fr/devis</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.hoplalok.fr/mentions-legales</loc>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
</urlset>
```

- [ ] **Step 3 : Commit**

```bash
git add public/robots.txt public/sitemap.xml
git commit -m "feat(seo): add robots.txt and sitemap.xml"
```

---

## Task 8 : Google Search Console — vérification du domaine

Cette tâche est **manuelle** — elle nécessite votre intervention.

- [ ] **Step 1 : Aller sur Search Console**

Ouvrir [search.google.com/search-console](https://search.google.com/search-console) et se connecter avec le compte Google de Hoplalo'K.

- [ ] **Step 2 : Ajouter la propriété**

Choisir **"Préfixe d'URL"** (pas "Domaine") et entrer : `https://www.hoplalok.fr/`

- [ ] **Step 3 : Choisir la méthode de vérification "Balise HTML"**

Google fournit une balise du type :
```html
<meta name="google-site-verification" content="VOTRE_CODE_ICI" />
```

- [ ] **Step 4 : Ajouter la balise dans index.html**

Dans `index.html`, après `<meta name="theme-color" ...>`, ajouter la balise fournie par Google.

- [ ] **Step 5 : Déployer et valider**

```bash
git add index.html
git commit -m "feat(seo): add Google Search Console verification"
git push origin wip/seo
```

Puis dans Search Console cliquer **"Vérifier"**. Une fois validé, soumettre le sitemap :  
Search Console → Sitemaps → entrer `sitemap.xml` → Soumettre.

---

## Récapitulatif des commits attendus

1. `feat(seo): migrate HashRouter → BrowserRouter + GitHub Pages 404 workaround`
2. `feat(seo): fix meta description + og tags + JSON-LD LocalBusiness`
3. `feat(seo): add reusable PageSEO component`
4. `feat(seo): add per-page meta tags via PageSEO component`
5. `feat(seo): add robots.txt and sitemap.xml`
6. `feat(seo): add Google Search Console verification` *(après action manuelle)*
