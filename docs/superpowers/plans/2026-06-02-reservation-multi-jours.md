# Réservation multi-jours — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre de sélectionner une plage de jours consécutifs lors de la réservation d'un produit, et répercuter la durée sur le prix (`prix/jour × nb de jours × quantité`).

**Architecture:** Une fonction pure `rentalDays`/`lineTotal` (dans `src/lib/format.ts`) centralise la règle de comptage des jours (inclusif) et de prix. Le `AvailabilityCalendar` passe d'un sélecteur de jour unique à un sélecteur de plage en 2 clics, avec refus des plages contenant un jour indisponible. `ProductPage`, `CartDrawer` et `DevisPage` consomment ces helpers pour afficher des prix tenant compte de la durée. Le `CartItem` (`startDate`/`endDate`) et le backend Directus sont déjà compatibles — pas de changement de schéma.

**Tech Stack:** React 19 + TypeScript + Vite, date-fns v4, Vitest + React Testing Library, CSS Modules.

**Spec :** `docs/superpowers/specs/2026-06-02-reservation-multi-jours-design.md`

**Conventions repo :** code en anglais, UI en français ; jamais de commit sur `main` (on est sur `feat/reservation-multi-jours`) ; `npx vitest run` et `npm run lint` doivent passer.

---

### Task 1 : Helpers durée & prix (`rentalDays`, `lineTotal`, `formatRange`)

**Files:**
- Modify: `src/lib/format.ts`
- Test: `src/tests/format.test.ts` (create)

Notes :
- `rentalDays` est **inclusif** : du 1er au 3 juin = 3 jours. Un seul jour (start sans end, ou start===end) = 1. Dates nulles = 0. Garde-fou : `end < start` → 1.
- date-fns v4 : `differenceInCalendarDays(dateLeft, dateRight)` renvoie `dateLeft - dateRight` en jours calendaires. On parse les ISO `yyyy-MM-dd` via `parseISO`.
- `formatRange` : « Du 01/06/2026 au 03/06/2026 » ; si 1 jour, « Le 01/06/2026 ».

- [ ] **Step 1 : Écrire les tests qui échouent**

Create `src/tests/format.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { rentalDays, lineTotal, formatRange } from '../lib/format';

describe('rentalDays', () => {
  it('compte 1 jour pour une date de début seule', () => {
    expect(rentalDays('2026-06-01', null)).toBe(1);
  });
  it('compte 1 jour quand début === fin', () => {
    expect(rentalDays('2026-06-01', '2026-06-01')).toBe(1);
  });
  it('compte de façon inclusive (1er au 3 juin = 3 jours)', () => {
    expect(rentalDays('2026-06-01', '2026-06-03')).toBe(3);
  });
  it('renvoie 0 quand il n’y a pas de date', () => {
    expect(rentalDays(null, null)).toBe(0);
    expect(rentalDays(null, '2026-06-03')).toBe(0);
  });
  it('garde-fou : fin avant début renvoie 1', () => {
    expect(rentalDays('2026-06-03', '2026-06-01')).toBe(1);
  });
});

describe('lineTotal', () => {
  it('multiplie prix × jours × quantité', () => {
    expect(lineTotal(40, '2026-06-01', '2026-06-03', 1)).toBe(120);
  });
  it('prend en compte la quantité', () => {
    expect(lineTotal(40, '2026-06-01', '2026-06-03', 2)).toBe(240);
  });
  it('un seul jour = prix × quantité', () => {
    expect(lineTotal(40, '2026-06-01', '2026-06-01', 1)).toBe(40);
  });
  it('renvoie 0 sans date', () => {
    expect(lineTotal(40, null, null, 1)).toBe(0);
  });
});

describe('formatRange', () => {
  it('affiche une plage', () => {
    expect(formatRange('2026-06-01', '2026-06-03')).toBe('Du 01/06/2026 au 03/06/2026');
  });
  it('affiche un jour unique', () => {
    expect(formatRange('2026-06-01', '2026-06-01')).toBe('Le 01/06/2026');
  });
});
```

- [ ] **Step 2 : Lancer les tests pour vérifier qu'ils échouent**

Run: `npx vitest run src/tests/format.test.ts`
Expected: FAIL — `rentalDays`, `lineTotal`, `formatRange` n'existent pas (import error).

- [ ] **Step 3 : Implémenter les helpers**

Append to `src/lib/format.ts` :

```ts
import { differenceInCalendarDays, parseISO, format } from 'date-fns';

export function rentalDays(startISO: string | null, endISO: string | null): number {
  if (!startISO) return 0;
  if (!endISO) return 1;
  const diff = differenceInCalendarDays(parseISO(endISO), parseISO(startISO));
  if (diff <= 0) return 1;
  return diff + 1;
}

export function lineTotal(
  unitPrice: number,
  startISO: string | null,
  endISO: string | null,
  quantity: number,
): number {
  return unitPrice * rentalDays(startISO, endISO) * quantity;
}

export function formatRange(startISO: string, endISO: string): string {
  const start = format(parseISO(startISO), 'dd/MM/yyyy');
  if (!endISO || startISO === endISO) return `Le ${start}`;
  const end = format(parseISO(endISO), 'dd/MM/yyyy');
  return `Du ${start} au ${end}`;
}
```

Note : le `import` doit être placé **en haut** du fichier, pas au milieu. Regrouper avec d'éventuels imports existants.

- [ ] **Step 4 : Lancer les tests pour vérifier qu'ils passent**

Run: `npx vitest run src/tests/format.test.ts`
Expected: PASS (11 tests).

- [ ] **Step 5 : Commit**

```bash
git add src/lib/format.ts src/tests/format.test.ts
git commit -m "feat: helpers rentalDays/lineTotal/formatRange (durée et prix de location)"
```

---

### Task 2 : `AvailabilityCalendar` — sélection de plage en 2 clics

**Files:**
- Modify: `src/components/product/AvailabilityCalendar.tsx`
- Modify: `src/components/product/AvailabilityCalendar.module.css`
- Test: `src/tests/AvailabilityCalendar.test.tsx`

Notes sur l'interface : on remplace `value: Date | null` / `onChange: (date) => void` par une plage. On exporte le type `DateRange` pour le réutiliser dans `ProductPage`.

- [ ] **Step 1 : Mettre à jour les tests existants + ajouter les tests de plage (échouent)**

Replace the entire content of `src/tests/AvailabilityCalendar.test.tsx` with :

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { addDays, format } from 'date-fns';
import { AvailabilityCalendar } from '../components/product/AvailabilityCalendar';

const EMPTY = { start: null, end: null };

describe('AvailabilityCalendar', () => {
  it('renders the current month name', () => {
    render(<AvailabilityCalendar productId="1" unavailableDates={[]} range={EMPTY} onChange={() => {}} />);
    const monthFr = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date());
    expect(screen.getByText(new RegExp(monthFr, 'i'))).toBeInTheDocument();
  });

  it('lets the user navigate to next month', async () => {
    render(<AvailabilityCalendar productId="1" unavailableDates={[]} range={EMPTY} onChange={() => {}} />);
    const before = screen.getByTestId('current-month').textContent;
    await userEvent.click(screen.getByLabelText('Mois suivant'));
    const after = screen.getByTestId('current-month').textContent;
    expect(after).not.toBe(before);
  });

  it('premier clic définit le début (end null)', async () => {
    const onChange = vi.fn();
    // jour cliquable : demain (évite les jours passés désactivés)
    const day = addDays(new Date(), 1);
    render(<AvailabilityCalendar productId="1" unavailableDates={[]} range={EMPTY} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: String(day.getDate()) }));
    expect(onChange).toHaveBeenCalledWith({ start: expect.any(Date), end: null });
  });

  it('deuxième clic définit la fin (plage)', async () => {
    const onChange = vi.fn();
    const start = addDays(new Date(), 1);
    const end = addDays(new Date(), 3);
    render(
      <AvailabilityCalendar
        productId="1"
        unavailableDates={[]}
        range={{ start, end: null }}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: String(end.getDate()) }));
    expect(onChange).toHaveBeenCalledWith({ start, end: expect.any(Date) });
  });

  it('refuse une plage contenant un jour indisponible et affiche une alerte', async () => {
    const onChange = vi.fn();
    const start = addDays(new Date(), 1);
    const blocked = addDays(new Date(), 2);
    const end = addDays(new Date(), 3);
    render(
      <AvailabilityCalendar
        productId="1"
        unavailableDates={[format(blocked, 'yyyy-MM-dd')]}
        range={{ start, end: null }}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: String(end.getDate()) }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2 : Lancer les tests pour vérifier qu'ils échouent**

Run: `npx vitest run src/tests/AvailabilityCalendar.test.tsx`
Expected: FAIL — le composant attend encore `value`/`onChange(date)`, le prop `range` n'existe pas ; les nouveaux tests de plage et d'alerte échouent.

- [ ] **Step 3 : Réécrire le composant en sélecteur de plage**

Replace the entire content of `src/components/product/AvailabilityCalendar.tsx` with :

```tsx
import { useMemo, useState } from 'react';
import {
  startOfMonth, endOfMonth, eachDayOfInterval, format,
  addMonths, isSameMonth, isSameDay, isBefore, isAfter, startOfDay,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import styles from './AvailabilityCalendar.module.css';

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

export function AvailabilityCalendar({ unavailableDates, range, onChange }: Props) {
  const [view, setView] = useState(() => startOfMonth(new Date()));
  const [rangeError, setRangeError] = useState(false);
  const today = startOfDay(new Date());

  const days = useMemo(() => {
    const start = startOfMonth(view);
    const end = endOfMonth(view);
    return eachDayOfInterval({ start, end });
  }, [view]);

  const isUnavailable = (d: Date) => unavailableDates.includes(format(d, 'yyyy-MM-dd'));
  const startWeekday = (days[0].getDay() + 6) % 7; // Monday = 0

  const rangeHasBlockedDay = (start: Date, end: Date) =>
    eachDayOfInterval({ start, end }).some(
      (d) => isUnavailable(d) || (isBefore(d, today) && !isSameDay(d, today)),
    );

  function handleDayClick(d: Date) {
    setRangeError(false);
    // Pas de début, ou plage déjà complète => (re)démarre une sélection.
    if (!range.start || range.end) {
      onChange({ start: d, end: null });
      return;
    }
    // Début défini, fin null.
    if (isBefore(d, range.start)) {
      onChange({ start: d, end: null });
      return;
    }
    if (isSameDay(d, range.start)) {
      onChange({ start: range.start, end: d });
      return;
    }
    // d > start : valider l'intervalle.
    if (rangeHasBlockedDay(range.start, d)) {
      setRangeError(true);
      return;
    }
    onChange({ start: range.start, end: d });
  }

  return (
    <div className={styles.cal}>
      <header className={styles.header}>
        <button onClick={() => setView(addMonths(view, -1))} aria-label="Mois précédent">‹</button>
        <span data-testid="current-month">{format(view, 'MMMM yyyy', { locale: fr })}</span>
        <button onClick={() => setView(addMonths(view, 1))} aria-label="Mois suivant">›</button>
      </header>
      <div className={styles.weekdays}>
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className={styles.grid}>
        {Array.from({ length: startWeekday }).map((_, i) => <span key={`b${i}`} />)}
        {days.map((d) => {
          const past = isBefore(d, today) && !isSameDay(d, today);
          const unavail = isUnavailable(d);
          const isStart = range.start && isSameDay(d, range.start);
          const isEnd = range.end && isSameDay(d, range.end);
          const inRange =
            range.start && range.end &&
            isAfter(d, range.start) && isBefore(d, range.end);
          return (
            <button
              key={d.toISOString()}
              disabled={past || unavail || !isSameMonth(d, view)}
              className={[
                styles.day,
                unavail ? styles.unavail : '',
                isStart ? styles.rangeStart : '',
                isEnd ? styles.rangeEnd : '',
                inRange ? styles.inRange : '',
              ].filter(Boolean).join(' ')}
              onClick={() => handleDayClick(d)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
      {rangeError && (
        <p role="alert" className={styles.error}>
          Cette plage contient des jours indisponibles, choisissez une autre période.
        </p>
      )}
      <div className={styles.legend}>
        <span><span className={`${styles.dot} ${styles.unavailDot}`} /> Indisponible</span>
        <span><span className={`${styles.dot} ${styles.selectedDot}`} /> Sélectionné</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4 : Ajouter les styles de plage**

Append to `src/components/product/AvailabilityCalendar.module.css` :

```css
.rangeStart, .rangeEnd { background: var(--color-ink); color: var(--color-bg); }
.inRange { background: var(--color-accent); }
.error { padding: var(--space-sm) var(--space-md); margin: 0; color: var(--color-danger); font-size: 0.85rem; font-weight: 700; }
```

- [ ] **Step 5 : Lancer les tests pour vérifier qu'ils passent**

Run: `npx vitest run src/tests/AvailabilityCalendar.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 6 : Commit**

```bash
git add src/components/product/AvailabilityCalendar.tsx src/components/product/AvailabilityCalendar.module.css src/tests/AvailabilityCalendar.test.tsx
git commit -m "feat: sélection de plage en 2 clics dans AvailabilityCalendar"
```

---

### Task 3 : `ProductPage` — état plage + prix dynamique

**Files:**
- Modify: `src/pages/ProductPage.tsx`

Notes : `ProductPage` n'a pas de test dédié ; la vérification se fait par `npm run lint` + build TypeScript (`tsc -b`) qui casseraient sur l'ancienne API `value`/`onChange`. Le bouton « Ajouter au panier » devient désactivé tant que la plage est incomplète.

- [ ] **Step 1 : Importer les helpers et le type, remplacer l'état**

Dans `src/pages/ProductPage.tsx`, modifier les imports en tête de fichier :

- Remplacer la ligne `import { AvailabilityCalendar } from '../components/product/AvailabilityCalendar';` par :

```tsx
import { AvailabilityCalendar, type DateRange } from '../components/product/AvailabilityCalendar';
```

- Ajouter l'import des helpers (à côté des autres imports `../lib` ou juste après le bloc d'imports composants) :

```tsx
import { formatPrice, formatRange, rentalDays } from '../lib/format';
```

- Remplacer la ligne 31 :

```tsx
  const [date, setDate] = useState<Date | null>(null);
```

par :

```tsx
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
```

- [ ] **Step 2 : Mettre à jour `handleAdd` et dériver durée/prix**

Remplacer la fonction `handleAdd` (lignes 41-50) par :

```tsx
  function handleAdd() {
    if (!product || !range.start || !range.end) return;
    add({
      productId: product.id,
      startDate: format(range.start, 'yyyy-MM-dd'),
      endDate: format(range.end, 'yyyy-MM-dd'),
      quantity: 1,
    });
    open();
  }
```

Juste après la ligne `const reviews = forProduct(product.id);`, ajouter les valeurs dérivées :

```tsx
  const rangeComplete = Boolean(range.start && range.end);
  const startISO = range.start ? format(range.start, 'yyyy-MM-dd') : null;
  const endISO = range.end ? format(range.end, 'yyyy-MM-dd') : null;
  const days = rentalDays(startISO, endISO);
  const totalPrice = product.price * days;
```

- [ ] **Step 3 : Brancher le calendrier sur `range` et afficher le prix dynamique**

Remplacer le bloc `priceRow` + bouton (lignes 74-79) par :

```tsx
          <div className={styles.priceRow}>
            <span className={styles.price}>{product.price}€</span>
            <span className={styles.unit}>/jour</span>
          </div>
          {rangeComplete && (
            <p className={styles.selected}>
              {formatRange(startISO!, endISO!)} — {days} jour{days > 1 ? 's' : ''} ·{' '}
              <strong>{totalPrice}€</strong>
            </p>
          )}

          <Button variant="primary" size="lg" onClick={handleAdd} disabled={!rangeComplete}>
            + Ajouter au panier
          </Button>
```

Remplacer le bloc calendrier (lignes 85-91) par :

```tsx
        <AvailabilityCalendar
          productId={product.id}
          unavailableDates={UNAVAILABLE_DATES[product.id] ?? BLOCKED_UNTIL_JUNE_22}
          range={range}
          onChange={setRange}
        />
        {!rangeComplete && range.start && (
          <p className={styles.selected}>Sélectionnez la date de fin.</p>
        )}
        {rangeComplete && (
          <p className={styles.selected}>
            Période sélectionnée : <strong>{formatRange(startISO!, endISO!)}</strong> ({days} jour{days > 1 ? 's' : ''})
          </p>
        )}
```

Note : `formatPrice` reste importé car déjà potentiellement utilisé ; s'il devient inutilisé, le retirer de l'import pour éviter une erreur lint `no-unused-vars`. Vérifier à l'étape 4.

- [ ] **Step 4 : Vérifier le typage, le lint et la suite de tests**

Run: `npx vitest run && npm run lint`
Expected: PASS. Si lint signale `formatPrice` non utilisé, retirer `formatPrice` de la ligne d'import `import { formatPrice, formatRange, rentalDays } ...` → `import { formatRange, rentalDays } from '../lib/format';`.

- [ ] **Step 5 : Vérification visuelle rapide (optionnel mais recommandé)**

Run: `npm run dev` puis ouvrir une page produit. Vérifier : 2 clics sélectionnent une plage, le prix total s'affiche (`prix × jours`), le bouton est désactivé tant que la fin n'est pas choisie, une plage sur un jour bloqué affiche l'alerte. Arrêter le serveur (Ctrl-C).

- [ ] **Step 6 : Commit**

```bash
git add src/pages/ProductPage.tsx
git commit -m "feat: page produit avec sélection de plage et prix par durée"
```

---

### Task 4 : `CartDrawer` — prix par durée et affichage de la durée

**Files:**
- Modify: `src/components/layout/CartDrawer.tsx`

Notes : le `key` de liste reste `i.productId` (un produit = une ligne). On affiche la durée de chaque ligne et son sous-total.

- [ ] **Step 1 : Importer `lineTotal`/`rentalDays` et corriger le total**

Dans `src/components/layout/CartDrawer.tsx`, remplacer l'import :

```tsx
import { formatPrice } from '../../lib/format';
```

par :

```tsx
import { formatPrice, lineTotal, rentalDays } from '../../lib/format';
```

Remplacer le calcul du total (lignes 23-26) :

```tsx
  const total = items.reduce((sum, i) => {
    const p = findProduct(i.productId);
    return sum + (p ? p.price * i.quantity : 0);
  }, 0);
```

par :

```tsx
  const total = items.reduce((sum, i) => {
    const p = findProduct(i.productId);
    return sum + (p ? lineTotal(p.price, i.startDate, i.endDate, i.quantity) : 0);
  }, 0);
```

- [ ] **Step 2 : Afficher la durée + sous-total par ligne**

Dans le `.map` des items, remplacer la ligne prix (ligne 67) :

```tsx
                      <p className={styles.itemPrice}>{formatPrice(p.price)}</p>
```

par :

```tsx
                      {(() => {
                        const d = rentalDays(i.startDate, i.endDate);
                        return (
                          <p className={styles.itemPrice}>
                            {formatPrice(p.price)}
                            {d > 0 && (
                              <> · {d} jour{d > 1 ? 's' : ''} · <strong>{lineTotal(p.price, i.startDate, i.endDate, i.quantity)}€</strong></>
                            )}
                          </p>
                        );
                      })()}
```

- [ ] **Step 3 : Vérifier le lint et les tests**

Run: `npx vitest run && npm run lint`
Expected: PASS.

- [ ] **Step 4 : Commit**

```bash
git add src/components/layout/CartDrawer.tsx
git commit -m "feat: panier calcule le prix selon la durée de location"
```

---

### Task 5 : `DevisPage` — total par durée + plage globale couvrante

**Files:**
- Modify: `src/pages/DevisPage.tsx`

Notes : la plage globale du devis couvre tout le panier : `date_start` = plus petit `startDate` non nul, `date_end` = plus grand `endDate` non nul. Comparaison de chaînes ISO `yyyy-MM-dd` valide lexicographiquement (ordre = ordre chronologique).

- [ ] **Step 1 : Importer `lineTotal` et calculer la plage globale**

Vérifier/ajuster l'import en tête de `src/pages/DevisPage.tsx` pour inclure `lineTotal`. Si un import depuis `../lib/format` existe déjà, y ajouter `lineTotal` ; sinon ajouter :

```tsx
import { lineTotal } from '../lib/format';
```

Remplacer l'initialisation des dates (lignes 31-32) :

```tsx
  const [dateStart, setDateStart] = useState(items.find(i => i.startDate)?.startDate ?? '');
  const [dateEnd, setDateEnd] = useState(items.find(i => i.endDate)?.endDate ?? '');
```

par :

```tsx
  const starts = items.map(i => i.startDate).filter((d): d is string => Boolean(d));
  const ends = items.map(i => i.endDate).filter((d): d is string => Boolean(d));
  const [dateStart, setDateStart] = useState(starts.length ? starts.reduce((a, b) => (a < b ? a : b)) : '');
  const [dateEnd, setDateEnd] = useState(ends.length ? ends.reduce((a, b) => (a > b ? a : b)) : '');
```

- [ ] **Step 2 : Corriger le total avec la durée**

Remplacer le calcul du total (lignes 38-41) :

```tsx
  const total = items.reduce((sum, i) => {
    const p = findProduct(i.productId);
    return sum + (p ? p.price * i.quantity : 0);
  }, 0);
```

par :

```tsx
  const total = items.reduce((sum, i) => {
    const p = findProduct(i.productId);
    return sum + (p ? lineTotal(p.price, i.startDate, i.endDate, i.quantity) : 0);
  }, 0);
```

- [ ] **Step 3 : Vérifier le lint et les tests**

Run: `npx vitest run && npm run lint`
Expected: PASS.

- [ ] **Step 4 : Commit**

```bash
git add src/pages/DevisPage.tsx
git commit -m "feat: devis calcule le total par durée et couvre la plage globale du panier"
```

---

### Task 6 : Vérification finale

- [ ] **Step 1 : Suite complète + lint**

Run: `npx vitest run && npm run lint`
Expected: tous les tests PASS, aucun warning lint.

- [ ] **Step 2 : Build de production**

Run: `npm run build`
Expected: `tsc -b` sans erreur de type, build Vite OK (vérifie qu'aucune ancienne API `value`/`onChange(date)` ne subsiste).

- [ ] **Step 3 : (optionnel) Vérification visuelle de bout en bout**

`npm run dev` → page produit (sélection plage, prix) → ajout panier (durée + sous-total) → `/devis` (total cohérent, dates pré-remplies min→max). Ctrl-C pour arrêter.

---

## Self-review (résultat)

- **Couverture spec :** §1 helpers → Task 1 ; §2 calendrier plage + blocage indispo → Task 2 ; §3 ProductPage état/prix → Task 3 ; §4 CartDrawer → Task 4 ; §5 DevisPage total+plage globale → Task 5 ; §6 tests → répartis (Task 1, 2) + Task 6. Hors-scope (dispos réelles Directus, schéma backend) non touché, conforme.
- **Cohérence des types :** `DateRange { start, end }` défini en Task 2, importé en Task 3. Signatures `rentalDays(startISO, endISO)`, `lineTotal(unitPrice, startISO, endISO, quantity)`, `formatRange(startISO, endISO)` identiques entre Task 1 et leurs usages (Tasks 3, 4, 5). `CartItem.startDate/endDate: string | null` inchangé.
- **Pas de placeholder :** tout le code est fourni ; commandes et résultats attendus explicites.
