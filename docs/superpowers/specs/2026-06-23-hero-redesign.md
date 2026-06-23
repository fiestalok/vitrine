# Hero Section Redesign — Spec

**Date :** 2026-06-23  
**Statut :** approuvé  
**Périmètre :** `src/pages/HomePage.tsx` + `src/pages/HomePage.module.css`

---

## Objectif

Transformer la hero section en une page d'entrée immersive qui prend tout l'écran, avec une animation de texte dynamique qui donne vie au site dès l'arrivée. Remplacer le panneau "trust" par le château gonflable en fond, et recentrer les CTAs sur le parcours client principal (devis + catalogue).

---

## Layout & Dimensions

- La section `<section className={styles.hero}>` passe à `min-height: 100vh`.
- Padding top ajusté pour compenser la navbar (`padding-top: var(--navbar-height)`).
- Contenu centré verticalement (`display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center`).
- Suppression du grid actuel (text/ctas/trust en colonnes).

---

## Fond

Gradient diagonal festif :

```css
background: linear-gradient(135deg, #FF6B6B 0%, #ff8e53 55%, #FFE66D 100%);
```

Le composant `<Bubbles variant="hero" />` est conservé, en fond.

---

## Château en arrière-plan

Le composant `<Castle>` est repositionné en fond absolu bas-droite de la hero :

- Taille : `380px`
- `noInflate={true}` (toujours gonflé dans la hero, pas besoin de scroll-inflate)
- `rotation={-6}`
- Opacity : `0.12` via un wrapper CSS (`opacity: 0.12`)
- `z-index: 0` (derrière le contenu)
- Enveloppé dans un `div.castleBg` positionné en `position: absolute; bottom: -20px; right: -40px`

---

## Contenu

Ordre vertical, centré, `z-index: 1` :

1. **Badge** — composant `<Badge tone="danger" rotation={-3}>LES KINGS DU GONFLABLE 👑</Badge>`  
   → Le composant Badge n'est pas modifié. On lui passe une `className` override depuis HomePage pour forcer `background: #fff; color: var(--color-danger)` sur fond coloré, sans toucher aux autres usages du Badge.

2. **Titre H1**  
   ```
   Ta fête va
   décoller.
   ```
   - Couleur : `#ffffff`
   - `text-shadow: 2px 4px 0 rgba(45,52,54,0.2)`
   - L'accent `.titleAccent` passe en `#FFE66D` (jaune, pour contraste sur fond corail)

3. **Lead**  
   "Châteaux gonflables, photobooths, sono et bien plus — on s'occupe de tout, vous kiffez."  
   - Couleur : `rgba(255,255,255,0.9)`

4. **CTAs** (côte à côte, `flex-wrap: wrap`, centrés)  
   - "Demander un devis →" → `<Button to="/devis" variant="primary" size="lg">` — fond blanc, texte `var(--color-danger)`  
   - "Voir le catalogue" → `<Button to="/catalogue" variant="secondary" size="lg">` — transparent, bordure blanche, texte blanc  
   → Nouveaux variants CSS à ajouter dans `Button.module.css` : `heroDevis` et `heroCatalogue`, ou adapter `primary`/`secondary` pour détecter le contexte. Option retenue : passer une `className` override depuis HomePage pour ne pas polluer le composant Button générique.

---

## Animation d'entrée — Pop rebond staggeré

Chaque élément de contenu entre avec une animation CSS `pop-in` :

```css
@keyframes pop-in {
  from { opacity: 0; transform: scale(0.72); }
  to   { opacity: 1; transform: scale(1); }
}
```

Timing : `cubic-bezier(0.34, 1.56, 0.64, 1)` — ressort élastique festif.

| Élément | Délai |
|---------|-------|
| Badge   | 0.10s |
| Titre   | 0.30s |
| Lead    | 0.50s |
| CTAs    | 0.70s |

Durée : `0.55s` par élément.  
`animation-fill-mode: both` pour que les éléments restent invisibles avant de jouer.

```css
@media (prefers-reduced-motion: reduce) {
  /* Tous les éléments animés : animation: none; opacity: 1; transform: none; */
}
```

---

## Scroll Indicator

Un élément `<div className={styles.scrollIndicator}>` positionné en `position: absolute; bottom: 1.5rem; left: 50%; transform: translateX(-50%)` affiche une flèche `↓` avec :

```css
@keyframes bounce-arrow {
  0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.8; }
  50%       { transform: translateX(-50%) translateY(6px); opacity: 0.4; }
}
```

Il disparaît dès le premier scroll via un `useEffect` qui ajoute une classe CSS `hidden` (`opacity: 0; pointer-events: none`).

---

## Trust Badges — Déplacés sous la hero

Le bloc trust actuel est extrait de la hero et placé dans une **bande sobre** entre la hero et la section "Comment ça marche" :

```tsx
<div className={styles.trustBand}>
  {TRUST.map((t) => (
    <div key={t.kicker} className={styles.trustItem}>
      <strong>{t.kicker}</strong>
      <span>{t.label}</span>
    </div>
  ))}
</div>
```

Style : fond `var(--color-bg-alt)`, bordure top/bottom `var(--color-border)`, flex row, centré, compact. Pas de `box-shadow` sticker — sobre et fonctionnel.

---

## Responsive

| Breakpoint | Changement |
|------------|------------|
| `≤ 900px`  | Château bg réduit à 260px |
| `≤ 560px`  | Titre `clamp(2.8rem, 13vw, 4rem)`, CTAs en colonne pleine largeur, château bg 180px |

---

## Fichiers touchés

| Fichier | Nature |
|---------|--------|
| `src/pages/HomePage.tsx` | Restructuration hero, nouveau `scrollIndicator`, trust band, CTAs mis à jour |
| `src/pages/HomePage.module.css` | Tout le bloc `.hero*` réécrit, `.trustBand`, `.scrollIndicator`, animations CSS |
| `.gitignore` | Ajout de `.superpowers/` si absent |

---

## Hors scope

- Aucun changement au reste de la homepage (sections "Comment ça marche", catégories, produits, valeurs).
- Aucune modification aux composants `Castle`, `Bubbles`, `Badge`, `Button` — seule leur utilisation change dans `HomePage`.
- Pas de changement au backend, au routing, ni aux autres pages.
