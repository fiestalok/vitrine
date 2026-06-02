# Scroll vers le planning + 2e bouton d'ajout — Design

Date : 2026-06-02
Branche : `feat/reservation-multi-jours`

## Contexte

Sur la page produit, le bouton « Ajouter au panier » est aujourd'hui **désactivé**
tant qu'aucune plage de dates complète n'est sélectionnée (introduit lors de la
fonctionnalité réservation multi-jours). L'utilisateur qui veut ajouter sans avoir
choisi de dates n'a aucun retour : le bouton est inerte et le planning est plus bas
dans la page.

On veut : (1) qu'un clic sur « Ajouter au panier » sans plage complète **fasse défiler
la page jusqu'au planning** de sélection des dates ; (2) ajouter un **second bouton
« Ajouter au panier » sous le planning** pour faciliter l'ajout une fois les dates
choisies.

## Décisions (validées)

- **Clic sans plage complète** : scroll **fluide** (smooth) vers le planning,
  **sans message** ni surbrillance supplémentaire.
- **Bouton du haut** : devient **toujours cliquable** (on retire l'état désactivé).
  Plage complète → ajoute au panier ; plage incomplète → scroll vers le planning.
- **Bouton du bas** (sous le planning) : **désactivé** tant que la plage est
  incomplète ; sert de raccourci d'ajout une fois les dates choisies (l'utilisateur
  est déjà au niveau du calendrier, un scroll serait inutile).

## Hors scope

- Pas de message d'invite, pas d'effet de surbrillance sur le calendrier.
- Aucun changement au calcul de prix, aux messages d'état existants, ni à `handleAdd`.

## Architecture & composant

Fichier unique : `src/pages/ProductPage.tsx`.

1. **Référence planning** : `const planningRef = useRef<HTMLElement>(null)`, attachée à
   la `<section className={styles.block}>` « Disponibilités » qui contient
   `<AvailabilityCalendar />`. C'est la cible du scroll.

2. **Bouton du haut** : retirer `disabled={!rangeComplete}`. Nouveau handler :
   ```tsx
   function handleAddOrScroll() {
     if (!rangeComplete) {
       planningRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
       return;
     }
     handleAdd();
   }
   ```
   `onClick={handleAddOrScroll}`.

3. **Bouton du bas** : ajouté à la fin de la section « Disponibilités », après les
   messages d'état existants :
   ```tsx
   <Button variant="primary" size="lg" onClick={handleAdd} disabled={!rangeComplete}>
     + Ajouter au panier
   </Button>
   ```

4. **Inchangé** : ligne de prix dynamique, messages « Sélectionnez la date de fin. » /
   « Période sélectionnée… », et `handleAdd` (qui ajoute au panier puis ouvre le
   `CartDrawer`).

## Cas limites

- Rien sélectionné → clic haut = scroll vers le planning ; bouton bas désactivé.
- Seulement le début sélectionné → idem (plage incomplète).
- Plage complète → les deux boutons ajoutent au panier.
- `scrollIntoView` est appelé sur un ref potentiellement null au tout premier rendu :
  l'optional chaining (`planningRef.current?.`) protège ce cas.

## Tests / vérification

`ProductPage` n'a aujourd'hui aucun test unitaire (page fortement couplée aux contextes
Products/Categories/Cart/Reviews). Comportement purement DOM (scroll + état désactivé).
Vérification retenue :
- `npm run build` (`tsc -b`) — typage OK.
- `npm run lint` — aucune nouvelle erreur.
- **Contrôle manuel** (Playwright) : clic haut sans dates → la page défile jusqu'au
  planning ; bouton bas grisé tant que la plage est incomplète, actif et fonctionnel
  une fois la plage choisie ; les deux boutons ajoutent au panier et ouvrent le drawer.

## Critères de réussite

- Cliquer « Ajouter au panier » (haut) sans plage complète fait défiler la page
  jusqu'au planning, en douceur.
- Un second bouton « Ajouter au panier » est présent sous le planning, désactivé tant
  que la plage est incomplète, fonctionnel ensuite.
- `npm run build` et `npm run lint` passent sans nouvelle erreur.
