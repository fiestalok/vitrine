# Mobile Filters — Design Spec
**Date :** 2026-06-23  
**Scope :** Mobile uniquement (≤ 900px). Desktop inchangé.

---

## Problème

Sur mobile, le layout catalogue passe en colonne unique (`grid-template-columns: 1fr`), ce qui place la sidebar `CatalogueFilters` et les `CategoryTabs` (grandes icônes + labels) entièrement au-dessus des produits. L'utilisateur doit scroller une hauteur significative avant de voir le moindre produit.

---

## Solution retenue : barre compacte + bottom sheet

### 1. Barre de filtres compacte (remplace CategoryTabs + sidebar sur mobile)

Une seule ligne horizontale scrollable remplace les deux blocs existants :

- **Chips catégories** (à gauche, scrollables) — même contenu que les `CategoryTabs` actuels (`✦ Tout`, `🏰 Châteaux`, etc.) mais en format pill compact. Le chip actif est rempli corail, les autres sont gris clair.
- **Bouton "Filtres"** (épinglé à droite, hors du scroll) — ouvre le bottom sheet.
  - État neutre : contour gris, texte sombre `⚙ Filtres`
  - État actif (≥ 1 filtre différent des valeurs par défaut) : fond corail plein, texte blanc `⚙ Filtres (N)` où N = nombre de filtres actifs

La barre est sticky sous la navbar (même comportement que la sidebar desktop avec `position: sticky`).

### 2. Bottom sheet (filtres dates / audience / budget)

Overlay qui monte depuis le bas au clic sur "Filtres" :

- **Fond semi-transparent** (`rgba(0,0,0,0.4)`) couvrant le contenu — clic dessus ferme le sheet
- **Panneau blanc** arrondi en haut (`border-radius: 16px 16px 0 0`), hauteur auto jusqu'à ~85vh
- **Drag handle** : petite barre grise centrée en haut du panneau
- **Contenu** : les 3 sections existantes de `CatalogueFilters` dans l'ordre actuel (Disponibilité → Pour qui → Budget max), + bouton Réinitialiser si filtres actifs
- **Application en temps réel** : pas de bouton "Appliquer", les filtres s'appliquent immédiatement (même comportement que la sidebar desktop)
- **Fermeture** : clic sur le fond OU sur le drag handle (tap) — pas de swipe-to-dismiss (évite la complexité)

---

## Architecture des composants

### Modifications à `CataloguePage`
- Conserver le rendu desktop (`CategoryTabs` + `CatalogueFilters` en sidebar) tel quel
- Ajouter sur mobile un `MobileFilterBar` à la place de la `tabsBar` + de la `CatalogueFilters`
- Gérer l'état `filtersOpen: boolean` dans `CataloguePage` (simple `useState`)

### Nouveau composant `MobileFilterBar`
`src/components/catalogue/MobileFilterBar.tsx`

Props :
```ts
interface Props {
  filters: FilterState;
  onCategoryChange: (c: CategoryId | 'all') => void;
  onFiltersOpen: () => void;
  activeFilterCount: number; // pour l'indicateur sur le bouton
}
```

Rendu : chips catégories scrollables + bouton Filtres épinglé à droite.

### Nouveau composant `MobileFiltersSheet`
`src/components/catalogue/MobileFiltersSheet.tsx`

Props :
```ts
interface Props {
  open: boolean;
  value: FilterState;
  maxAvailable: number;
  onChange: (f: FilterState) => void;
  onDateChange?: (f: FilterState) => void;
  onClose: () => void;
}
```

Rendu : overlay + panneau avec le contenu de `CatalogueFilters` (réutilise les sections existantes, pas un copié-collé — extraire la logique si besoin).

---

## CSS / responsive

- `MobileFilterBar` et `MobileFiltersSheet` n'existent que dans le rendu mobile : les composants sont montés/démontés via une media query CSS (`display: none` sur desktop, ou rendu conditionnel via un hook `useIsMobile`).
- Préférer `display: none` CSS plutôt qu'un hook JS pour éviter un flash au chargement.
- La barre sticky utilise `top: var(--navbar-height)` pour coller sous la navbar.
- Le bottom sheet utilise `position: fixed; inset: 0` pour l'overlay et `position: fixed; bottom: 0; left: 0; right: 0` pour le panneau.
- Animation d'entrée/sortie : `transform: translateY(100%)` → `translateY(0)` avec `transition: transform 0.25s ease`.

---

## Calcul du `activeFilterCount`

Un filtre est considéré "actif" si sa valeur diffère du défaut :
- `audiences.length > 0` → +1
- `maxPrice < maxAvailable` → +1
- `dateStart` non vide → +1

Total max = 3.

---

## Hors scope

- Swipe-to-dismiss (gesture) sur le bottom sheet
- Modifications du comportement desktop
- Changement du tri (sort) — reste dans le header des résultats comme actuellement
