# Réservation multi-jours — Design

Date : 2026-06-02
Branche : `feat/reservation-multi-jours`

## Contexte

Aujourd'hui, la réservation d'un produit ne permet de choisir **qu'un seul jour**
dans le calendrier (`AvailabilityCalendar`), et le prix affiché ignore complètement
la durée : panier et devis calculent `prix × quantité`, en traitant chaque article
comme une location d'une journée.

On veut permettre de sélectionner **plusieurs jours consécutifs** et répercuter la
durée sur le prix : une plage de 3 jours = `prix unitaire × 3`.

Le modèle de données est déjà prêt : `CartItem` porte `startDate`/`endDate`, et le
backend Directus crée une réservation avec une plage `date_start`/`date_end`
(`createReservation`, `fetchReservedArticleIds`). Le travail est donc essentiellement
côté **UI calendrier** et **calcul de prix**.

## Décisions (validées)

- **Sélection** : 2 clics. 1er clic = jour de début, 2e clic = jour de fin ;
  l'intervalle complet se met en surbrillance. Un 3e clic redémarre une nouvelle
  sélection.
- **Comptage des jours** : **inclusif**. Du 1er au 3 juin = 3 jours ; une seule
  journée sélectionnée = 1 jour ; dates nulles = 0.
- **Indispo dans la plage** : si l'intervalle `[start..end]` contient un jour
  indisponible (ou passé), la sélection de la fin est **refusée** avec un message ;
  la sélection reste sur le début.
- **Portée des dates** : **une plage par produit**. Chaque ligne du panier garde sa
  propre plage et son prix calculé selon SA durée. Le devis utilise une plage
  globale couvrant tout le panier : `min(startDate)` → `max(endDate)`.

## Hors scope

- Brancher le calendrier sur les vraies disponibilités Directus : il reste sur le
  mock `src/data/unavailable.ts` (`BLOCKED_UNTIL_JUNE_22`). Le blocage des plages
  s'appuie sur cette liste mockée.
- Schéma backend : déjà compatible (`date_start`/`date_end`), pas de changement.

## Architecture & composants

### 1. Helpers durée/prix — `src/lib/format.ts`

Fonctions pures, testables, qui isolent la règle métier :

```ts
// Nombre de jours INCLUSIF entre deux dates ISO (yyyy-MM-dd).
// 1 seule date (start sans end, ou start === end) => 1. Dates nulles => 0.
export function rentalDays(startISO: string | null, endISO: string | null): number;

// Sous-total d'une ligne : prix/jour × nb de jours × quantité.
export function lineTotal(
  unitPrice: number,
  startISO: string | null,
  endISO: string | null,
  quantity: number,
): number;
```

Règles précises de `rentalDays` :
- `start` null → `0`.
- `start` non null, `end` null → `1` (un seul jour choisi).
- `start === end` → `1`.
- sinon → `differenceInCalendarDays(end, start) + 1` (inclusif).
- si `end < start` (incohérent) → `1` (garde-fou ; ne devrait pas arriver via l'UI).

`lineTotal` = `unitPrice * rentalDays(start, end) * quantity`.

On ajoute aussi un petit formateur d'affichage de durée :
```ts
export function formatRange(startISO: string, endISO: string): string;
// ex: "Du 01/06/2026 au 03/06/2026"  (ou "Le 01/06/2026" si 1 jour)
```

### 2. `AvailabilityCalendar` — sélection de plage en 2 clics

Fichier : `src/components/product/AvailabilityCalendar.tsx`

Nouvelle interface :
```ts
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface Props {
  productId: string;
  unavailableDates: string[];
  range: DateRange;
  onChange: (range: DateRange) => void;
}
```

Logique de clic (`handleDayClick(d)`), avec `today` et `isUnavailable` inchangés :
- **Pas de start, ou start+end déjà définis (sélection complète)** → on (re)démarre :
  `onChange({ start: d, end: null })`. (3e clic = nouveau départ.)
- **start défini, end null** :
  - si `d < start` → on redémarre sur `d` : `onChange({ start: d, end: null })`.
  - si `d === start` → plage d'un jour : `onChange({ start, end: d })`.
  - si `d > start` → on teste l'intervalle `[start..d]` :
    - s'il contient un jour indisponible ou passé → **refus** : on garde
      `{ start, end: null }` et on affiche le message d'erreur (state local
      `rangeError`).
    - sinon → `onChange({ start, end: d })`.

Helper interne `rangeHasBlockedDay(start, end)` :
`eachDayOfInterval({start,end})` puis test `isUnavailable(d) || isBefore(d, today)`.

Rendu des jours : en plus de `unavail`/`selected`, on calcule par jour :
- `isStart` = `isSameDay(d, range.start)`
- `isEnd` = `range.end && isSameDay(d, range.end)`
- `inRange` = `range.start && range.end && d > range.start && d < range.end`

Classes CSS appliquées : `.rangeStart`, `.rangeEnd`, `.inRange` (nouvelles, dans
`AvailabilityCalendar.module.css`), en réutilisant les variables de `tokens.css`.

Message d'erreur : un `<p role="alert">` sous la grille quand `rangeError` est vrai
(« Cette plage contient des jours indisponibles, choisissez une autre période. »),
remis à `null` au prochain clic de départ.

### 3. `ProductPage` — état plage + prix dynamique

Fichier : `src/pages/ProductPage.tsx`

- Remplacer `const [date, setDate] = useState<Date | null>(null)` par
  `const [range, setRange] = useState<DateRange>({ start: null, end: null })`.
- Passer `range`/`onChange={setRange}` au calendrier.
- Affichage sous le calendrier :
  - si plage complète : « Du JJ/MM/AAAA au JJ/MM/AAAA — N jour(s) » + le **prix
    total** (`product.price × N`) à côté du prix unitaire `formatPrice`.
  - si seulement le début : « Sélectionnez la date de fin ».
- `handleAdd` : n'agit que si `range.start && range.end`. Écrit
  `startDate = format(range.start)`, `endDate = format(range.end)`.
- Bouton « Ajouter au panier » **désactivé** tant que la plage n'est pas complète.

### 4. Affichage prix — `CartDrawer` & `DevisPage`

- `CartDrawer` (`src/components/layout/CartDrawer.tsx`) : remplacer
  `p.price * i.quantity` par `lineTotal(p.price, i.startDate, i.endDate, i.quantity)`
  dans le calcul du `total` ET dans l'affichage de chaque ligne. Afficher la durée
  de la ligne (« 3 jours ») et son sous-total.
- `DevisPage` (`src/pages/DevisPage.tsx`) : même substitution pour `total`.

### 5. `DevisPage` — plage globale couvrante

- `dateStart` initial = **min** des `startDate` non nuls du panier (au lieu du
  premier item) ; `dateEnd` initial = **max** des `endDate` non nuls.
- Les champs `<input type="date">` restent éditables (override manuel possible).
- `cartItemsMapped` : `unit_price` reste le prix/jour ; `total_price` = total calculé
  avec les durées (déjà corrigé via `lineTotal`).

### 6. Comportement panier (`CartContext`)

Inchangé sur le fond : un produit = une ligne. Ajouter le même produit met à jour
`quantity` + dates (comportement existant). Pas de changement de type `CartItem`
(`startDate`/`endDate` existent déjà). On ne gère pas plusieurs plages pour un même
produit (YAGNI).

## Flux de données

```
Calendrier (DateRange, 2 clics, blocage indispo)
  └─> ProductPage state `range` ──handleAdd──> CartItem { startDate, endDate }
        └─> CartContext (localStorage fiestalok.cart.v1)
              ├─> CartDrawer  : lineTotal(price, start, end, qty) par ligne + total
              └─> DevisPage   : total via lineTotal ; date_start=min, date_end=max
                    └─> createReservation(date_start, date_end, total_price, items)
                          └─> Directus (déjà compatible)
```

## Gestion des erreurs / cas limites

- Plage incomplète (start sans end) → bouton « Ajouter » désactivé, pas d'ajout.
- Plage contenant un indispo → refus + message, sélection non validée.
- `end < start` → impossible via l'UI (clic avant start redémarre) ; `rentalDays`
  a un garde-fou retournant 1.
- Panier vide / dates nulles → `rentalDays` = 0, `lineTotal` = 0 (pas de NaN).

## Tests (TDD)

- **`src/tests/format.test.ts`** (nouveau ou complété) :
  - `rentalDays` : 1 seule date → 1 ; start===end → 1 ; 1er→3 juin → 3 ;
    dates nulles → 0 ; end<start → 1.
  - `lineTotal` : `prix × jours × quantité` ; quantité>1 ; dates nulles → 0.
- **`src/tests/AvailabilityCalendar.test.tsx`** (complété) :
  - 2 clics (début puis fin) produisent un `onChange` avec `{start, end}`.
  - 3e clic redémarre une sélection (`end` remis à null).
  - clic sur une fin dont l'intervalle contient un indispo → pas de plage validée
    + message d'alerte affiché.
  - jours intermédiaires reçoivent la classe `inRange`.
- **`src/tests/CartContext.test.tsx`** / drawer : sous-total d'une ligne =
  `prix × jours × quantité`.

## Critères de réussite

- Sur une page produit, on sélectionne une plage de jours consécutifs en 2 clics.
- Le prix affiché (page produit, panier, devis) = `prix/jour × nb de jours × qté`.
- Une plage chevauchant un jour indisponible est refusée avec un message.
- Le devis envoie une plage globale cohérente couvrant tout le panier.
- `npx vitest run` et `npm run lint` passent.
