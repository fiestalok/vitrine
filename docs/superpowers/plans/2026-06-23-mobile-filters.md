# Mobile Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sur mobile (≤ 900px), remplacer la sidebar `CatalogueFilters` et les `CategoryTabs` par une barre compacte (chips catégories + bouton Filtres) qui ouvre un bottom sheet pour les filtres dates/audience/budget. Desktop inchangé.

**Architecture:** Deux nouveaux composants autonomes (`MobileFilterBar`, `MobileFiltersSheet`) intégrés dans `CataloguePage`. Les composants desktop existants (`CategoryTabs`, `CatalogueFilters`) sont cachés sur mobile via une classe CSS `.desktopOnly` sans être supprimés.

**Tech Stack:** React 19 + TypeScript, CSS Modules, Vitest + React Testing Library

---

## Fichiers concernés

| Action | Fichier |
|--------|---------|
| Créer | `src/components/catalogue/MobileFilterBar.tsx` |
| Créer | `src/components/catalogue/MobileFilterBar.module.css` |
| Créer | `src/components/catalogue/MobileFiltersSheet.tsx` |
| Créer | `src/components/catalogue/MobileFiltersSheet.module.css` |
| Modifier | `src/pages/CataloguePage.tsx` |
| Modifier | `src/pages/CataloguePage.module.css` |
| Créer | `src/tests/MobileFilterBar.test.tsx` |
| Créer | `src/tests/MobileFiltersSheet.test.tsx` |

---

## Task 1 : MobileFilterBar

Barre sticky sous la navbar, visible uniquement sur mobile. Chips catégories scrollables + bouton "Filtres" épinglé à droite.

**Files:**
- Create: `src/components/catalogue/MobileFilterBar.tsx`
- Create: `src/components/catalogue/MobileFilterBar.module.css`
- Test: `src/tests/MobileFilterBar.test.tsx`

- [ ] **Step 1 : Écrire les tests en échec**

Créer `src/tests/MobileFilterBar.test.tsx` :

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileFilterBar } from '../components/catalogue/MobileFilterBar';
import { DEFAULT_FILTERS } from '../lib/filterProducts';

vi.mock('../context/CategoriesContext', () => ({
  useCategories: () => ({
    categories: [
      { id: 'chateau-gonflable', label: 'Châteaux', emoji: '🏰' },
      { id: 'accessoires', label: 'Accessoires', emoji: '🎉' },
    ],
    loading: false,
  }),
}));

const baseProps = {
  filters: { ...DEFAULT_FILTERS },
  maxAvailable: 400,
  onCategoryChange: vi.fn(),
  onFiltersOpen: vi.fn(),
};

describe('MobileFilterBar', () => {
  it('affiche le chip Tout et les chips des catégories', () => {
    render(<MobileFilterBar {...baseProps} />);
    expect(screen.getByRole('button', { name: /Tout/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Châteaux/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Accessoires/i })).toBeInTheDocument();
  });

  it('appelle onCategoryChange avec l'id correct au clic sur un chip', () => {
    const onCategoryChange = vi.fn();
    render(<MobileFilterBar {...baseProps} onCategoryChange={onCategoryChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Châteaux/i }));
    expect(onCategoryChange).toHaveBeenCalledWith('chateau-gonflable');
  });

  it('affiche "⚙ Filtres" sans compteur quand aucun filtre actif', () => {
    render(<MobileFilterBar {...baseProps} />);
    expect(screen.getByRole('button', { name: '⚙ Filtres' })).toBeInTheDocument();
  });

  it('affiche "⚙ Filtres (1)" quand une audience est sélectionnée', () => {
    render(
      <MobileFilterBar
        {...baseProps}
        filters={{ ...DEFAULT_FILTERS, audiences: ['enfants'] }}
      />
    );
    expect(screen.getByRole('button', { name: '⚙ Filtres (1)' })).toBeInTheDocument();
  });

  it('affiche "⚙ Filtres (2)" pour audiences + budget réduit', () => {
    render(
      <MobileFilterBar
        {...baseProps}
        filters={{ ...DEFAULT_FILTERS, audiences: ['adultes'], maxPrice: 100 }}
        maxAvailable={400}
      />
    );
    expect(screen.getByRole('button', { name: '⚙ Filtres (2)' })).toBeInTheDocument();
  });

  it('appelle onFiltersOpen au clic sur le bouton Filtres', () => {
    const onFiltersOpen = vi.fn();
    render(<MobileFilterBar {...baseProps} onFiltersOpen={onFiltersOpen} />);
    fireEvent.click(screen.getByRole('button', { name: /Filtres/ }));
    expect(onFiltersOpen).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2 : Lancer les tests pour vérifier l'échec**

```bash
npx vitest run src/tests/MobileFilterBar.test.tsx
```

Résultat attendu : **FAIL** — `Cannot find module '../components/catalogue/MobileFilterBar'`

- [ ] **Step 3 : Créer `MobileFilterBar.tsx`**

```tsx
import { useCategories } from '../../context/CategoriesContext';
import type { CategoryId } from '../../data/categories';
import type { FilterState } from '../../lib/filterProducts';
import styles from './MobileFilterBar.module.css';

interface Props {
  filters: FilterState;
  maxAvailable: number;
  onCategoryChange: (c: CategoryId | 'all') => void;
  onFiltersOpen: () => void;
}

function countActiveFilters(filters: FilterState, maxAvailable: number): number {
  let count = 0;
  if (filters.audiences.length > 0) count++;
  if (filters.maxPrice < maxAvailable) count++;
  if (filters.dateStart) count++;
  return count;
}

export function MobileFilterBar({ filters, maxAvailable, onCategoryChange, onFiltersOpen }: Props) {
  const { categories } = useCategories();
  const activeCount = countActiveFilters(filters, maxAvailable);

  return (
    <div className={styles.bar}>
      <div className={styles.chips}>
        <button
          className={`${styles.chip} ${filters.category === 'all' ? styles.chipActive : ''}`}
          onClick={() => onCategoryChange('all')}
        >
          ✦ Tout
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`${styles.chip} ${filters.category === c.id ? styles.chipActive : ''}`}
            onClick={() => onCategoryChange(c.id)}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>
      <button
        className={`${styles.filtersBtn} ${activeCount > 0 ? styles.filtersBtnActive : ''}`}
        onClick={onFiltersOpen}
      >
        ⚙ Filtres{activeCount > 0 ? ` (${activeCount})` : ''}
      </button>
    </div>
  );
}
```

- [ ] **Step 4 : Créer `MobileFilterBar.module.css`**

```css
.bar {
  display: none; /* caché sur desktop, affiché uniquement via media query */
}

@media (max-width: 900px) {
  .bar {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    background: #fff;
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: var(--navbar-height);
    z-index: 10;
    overflow: hidden;
  }
}

.chips {
  display: flex;
  gap: var(--space-xs);
  overflow-x: auto;
  flex: 1;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.chips::-webkit-scrollbar { display: none; }

.chip {
  background: #f5f5f5;
  color: var(--color-ink-soft);
  border: 1.5px solid transparent;
  border-radius: var(--radius-pill);
  padding: 0.3rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
  cursor: pointer;
}
.chipActive {
  background: var(--color-primary);
  color: #fff;
}

.filtersBtn {
  flex-shrink: 0;
  background: #fff;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-pill);
  padding: 0.3rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--color-ink);
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.filtersBtnActive {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}
```

- [ ] **Step 5 : Vérifier que les tests passent**

```bash
npx vitest run src/tests/MobileFilterBar.test.tsx
```

Résultat attendu : **PASS** — 6 tests verts

- [ ] **Step 6 : Commit**

```bash
git add src/components/catalogue/MobileFilterBar.tsx src/components/catalogue/MobileFilterBar.module.css src/tests/MobileFilterBar.test.tsx
git commit -m "feat(mobile): add MobileFilterBar component with tests"
```

---

## Task 2 : MobileFiltersSheet

Bottom sheet overlay (modal venant du bas) contenant les filtres disponibilité/audience/budget.

**Files:**
- Create: `src/components/catalogue/MobileFiltersSheet.tsx`
- Create: `src/components/catalogue/MobileFiltersSheet.module.css`
- Test: `src/tests/MobileFiltersSheet.test.tsx`

- [ ] **Step 1 : Écrire les tests en échec**

Créer `src/tests/MobileFiltersSheet.test.tsx` :

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileFiltersSheet } from '../components/catalogue/MobileFiltersSheet';
import { DEFAULT_FILTERS } from '../lib/filterProducts';

const baseProps = {
  open: true,
  value: { ...DEFAULT_FILTERS, maxPrice: 400 },
  maxAvailable: 400,
  onChange: vi.fn(),
  onClose: vi.fn(),
};

describe('MobileFiltersSheet', () => {
  it('ne rend rien quand open=false', () => {
    const { container } = render(<MobileFiltersSheet {...baseProps} open={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('affiche les 3 sections de filtre quand open=true', () => {
    render(<MobileFiltersSheet {...baseProps} />);
    expect(screen.getByText(/Disponibilité/i)).toBeInTheDocument();
    expect(screen.getByText(/Pour qui/i)).toBeInTheDocument();
    expect(screen.getByText(/Budget max/i)).toBeInTheDocument();
  });

  it('appelle onClose au clic sur le fond (overlay)', () => {
    const onClose = vi.fn();
    render(<MobileFiltersSheet {...baseProps} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('sheet-overlay'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('n'appelle pas onClose au clic dans le panneau', () => {
    const onClose = vi.fn();
    render(<MobileFiltersSheet {...baseProps} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('sheet-panel'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('appelle onChange quand une audience est cochée', () => {
    const onChange = vi.fn();
    render(<MobileFiltersSheet {...baseProps} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText(/🧒 Enfants/i));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ audiences: ['enfants'] })
    );
  });

  it('affiche le bouton Réinitialiser quand des filtres sont actifs', () => {
    render(
      <MobileFiltersSheet
        {...baseProps}
        value={{ ...DEFAULT_FILTERS, maxPrice: 400, audiences: ['enfants'] }}
      />
    );
    expect(screen.getByRole('button', { name: /Réinitialiser/i })).toBeInTheDocument();
  });

  it('n'affiche pas le bouton Réinitialiser quand aucun filtre actif', () => {
    render(<MobileFiltersSheet {...baseProps} />);
    expect(screen.queryByRole('button', { name: /Réinitialiser/i })).toBeNull();
  });

  it('appelle onDateChange si fourni quand les dates changent', () => {
    const onDateChange = vi.fn();
    const onChange = vi.fn();
    render(
      <MobileFiltersSheet
        {...baseProps}
        onChange={onChange}
        onDateChange={onDateChange}
        value={{ ...DEFAULT_FILTERS, maxPrice: 400, dateStart: '', dateEnd: '' }}
      />
    );
    const inputs = screen.getAllByDisplayValue('');
    fireEvent.change(inputs[0], { target: { value: '2026-07-01' } });
    expect(onDateChange).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2 : Lancer les tests pour vérifier l'échec**

```bash
npx vitest run src/tests/MobileFiltersSheet.test.tsx
```

Résultat attendu : **FAIL** — `Cannot find module '../components/catalogue/MobileFiltersSheet'`

- [ ] **Step 3 : Créer `MobileFiltersSheet.tsx`**

```tsx
import { AUDIENCES, type Audience } from '../../data/categories';
import type { FilterState } from '../../lib/filterProducts';
import styles from './MobileFiltersSheet.module.css';

interface Props {
  open: boolean;
  value: FilterState;
  maxAvailable: number;
  onChange: (f: FilterState) => void;
  onDateChange?: (f: FilterState) => void;
  onClose: () => void;
}

const AUDIENCE_LABELS: Record<Audience, string> = {
  enfants:     '🧒 Enfants',
  adultes:     '🎉 Adultes',
  entreprises: '💼 Entreprises',
};

export function MobileFiltersSheet({ open, value, maxAvailable, onChange, onDateChange, onClose }: Props) {
  if (!open) return null;

  const today = new Date().toISOString().split('T')[0];

  const emitDate = (newFilter: FilterState) => {
    if (onDateChange && (newFilter.dateStart !== value.dateStart || newFilter.dateEnd !== value.dateEnd)) {
      onDateChange(newFilter);
    } else {
      onChange(newFilter);
    }
  };

  const toggleAudience = (a: Audience) => {
    const has = value.audiences.includes(a);
    onChange({
      ...value,
      audiences: has ? value.audiences.filter((x) => x !== a) : [...value.audiences, a],
    });
  };

  const hasActiveFilters =
    value.audiences.length > 0 || value.maxPrice < maxAvailable || !!value.dateStart;

  return (
    <div
      className={styles.overlay}
      data-testid="sheet-overlay"
      onClick={onClose}
    >
      <div
        className={styles.sheet}
        data-testid="sheet-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.handle} />
        <p className={styles.title}>Filtres</p>

        <div className={styles.group}>
          <p className={styles.groupLabel}>Disponibilité</p>
          <div className={styles.dateRow}>
            <label className={styles.dateLabel}>
              <span>Du</span>
              <input
                type="date"
                min={today}
                value={value.dateStart}
                onChange={(e) => {
                  const newStart = e.target.value;
                  emitDate({ ...value, dateStart: newStart, dateEnd: newStart });
                }}
                className={styles.dateInput}
              />
            </label>
            <label className={styles.dateLabel}>
              <span>Au</span>
              <input
                type="date"
                min={value.dateStart || today}
                value={value.dateEnd}
                onChange={(e) => emitDate({ ...value, dateEnd: e.target.value })}
                className={styles.dateInput}
              />
            </label>
          </div>
        </div>

        <div className={styles.group}>
          <p className={styles.groupLabel}>Pour qui ?</p>
          {AUDIENCES.map((a) => (
            <label key={a} className={styles.checkItem}>
              <input
                type="checkbox"
                checked={value.audiences.includes(a)}
                onChange={() => toggleAudience(a)}
              />
              <span>{AUDIENCE_LABELS[a]}</span>
            </label>
          ))}
        </div>

        <div className={styles.group}>
          <p className={styles.groupLabel}>
            Budget max <strong className={styles.priceVal}>{value.maxPrice}€</strong>
          </p>
          <input
            type="range"
            min={30}
            max={maxAvailable}
            step={10}
            value={value.maxPrice}
            onChange={(e) => onChange({ ...value, maxPrice: Number(e.target.value) })}
          />
          <div className={styles.priceRange}>
            <span>30€</span>
            <span>{maxAvailable}€</span>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            className={styles.reset}
            onClick={() =>
              onChange({ ...value, audiences: [], maxPrice: maxAvailable, dateStart: '', dateEnd: '' })
            }
          >
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4 : Créer `MobileFiltersSheet.module.css`**

```css
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.sheet {
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: var(--space-md) var(--space-lg) var(--space-xl);
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

.handle {
  width: 32px;
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  margin: 0 auto var(--space-md);
}

.title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--color-danger);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin: 0 0 var(--space-sm);
}

.group {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.groupLabel {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-ink);
  margin: 0 0 var(--space-xs);
}
.groupLabel::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 14px;
  border-radius: 2px;
  background: var(--color-primary);
  flex-shrink: 0;
}

.priceVal {
  color: var(--color-primary);
  font-weight: 800;
}

.checkItem {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-ink-soft);
  padding: 0.2rem 0;
}
.checkItem input[type=checkbox] {
  appearance: none;
  -webkit-appearance: none;
  width: 17px;
  height: 17px;
  border: 1.5px solid var(--color-border);
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  flex-shrink: 0;
  position: relative;
  transition: border-color 0.15s, background 0.15s;
}
.checkItem input[type=checkbox]:checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}
.checkItem input[type=checkbox]:checked::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 5px;
  width: 4px;
  height: 8px;
  border: 1.5px solid #fff;
  border-top: none;
  border-left: none;
  transform: rotate(45deg);
}

.group input[type=range] {
  width: 100%;
  accent-color: var(--color-primary);
  margin-top: var(--space-2xs);
  height: 4px;
}

.priceRange {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--color-ink-soft);
}

.dateRow {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.dateLabel {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-ink-soft);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.dateInput {
  width: 100%;
  padding: 0.4rem 0.5rem;
  font-size: 0.85rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: #fff;
  color: var(--color-ink);
  cursor: pointer;
  transition: border-color 0.15s;
}
.dateInput:focus {
  outline: none;
  border-color: rgba(45, 52, 54, 0.35);
}
.dateInput::-webkit-calendar-picker-indicator {
  opacity: 0.5;
  cursor: pointer;
}

.reset {
  font-size: 0.78rem;
  color: var(--color-ink-soft);
  text-decoration: underline;
  cursor: pointer;
  text-align: left;
  padding-top: var(--space-xs);
}
.reset:hover { color: var(--color-primary); }
```

- [ ] **Step 5 : Vérifier que les tests passent**

```bash
npx vitest run src/tests/MobileFiltersSheet.test.tsx
```

Résultat attendu : **PASS** — 8 tests verts

- [ ] **Step 6 : Commit**

```bash
git add src/components/catalogue/MobileFiltersSheet.tsx src/components/catalogue/MobileFiltersSheet.module.css src/tests/MobileFiltersSheet.test.tsx
git commit -m "feat(mobile): add MobileFiltersSheet bottom sheet component with tests"
```

---

## Task 3 : Intégration dans CataloguePage

Câbler `MobileFilterBar` et `MobileFiltersSheet` dans la page, masquer les composants desktop sur mobile.

**Files:**
- Modify: `src/pages/CataloguePage.tsx`
- Modify: `src/pages/CataloguePage.module.css`

- [ ] **Step 1 : Ajouter `.desktopOnly` dans `CataloguePage.module.css`**

Ajouter à la fin du fichier :

```css
.desktopOnly { display: block; }
@media (max-width: 900px) {
  .desktopOnly { display: none; }
}
```

- [ ] **Step 2 : Modifier `CataloguePage.tsx`**

Ajouter les imports en haut du fichier (après les imports existants) :

```tsx
import { MobileFilterBar } from '../components/catalogue/MobileFilterBar';
import { MobileFiltersSheet } from '../components/catalogue/MobileFiltersSheet';
```

Ajouter l'état `filtersOpen` juste après la déclaration de `pendingDateChange` :

```tsx
const [filtersOpen, setFiltersOpen] = useState(false);
```

Remplacer le bloc `<div className={styles.contentArea}>` entier par le suivant (noter les ajouts `desktopOnly`, `MobileFilterBar`, et `MobileFiltersSheet`) :

```tsx
<div className={styles.contentArea}>
  <Bubbles variant="warm" />
  <Castle size={120} rotation={5} className={styles.castleRight} noInflate />

  {/* Desktop : barre de catégories */}
  <div className={`container ${styles.tabsBar} ${styles.desktopOnly}`}>
    <div />
    <CategoryTabs active={filters.category} onChange={(c) => setFilters((f) => ({ ...f, category: c }))} />
  </div>

  {/* Mobile : barre compacte */}
  <MobileFilterBar
    filters={filters}
    maxAvailable={maxProductPrice}
    onCategoryChange={(c) => setFilters((f) => ({ ...f, category: c }))}
    onFiltersOpen={() => setFiltersOpen(true)}
  />

  <div className={`container ${styles.layout}`}>
    {/* Desktop : sidebar filtres */}
    <div className={styles.desktopOnly}>
      <CatalogueFilters
        value={filters}
        onChange={setFilters}
        onDateChange={handleDateChange}
        maxAvailable={maxProductPrice}
      />
    </div>

    <div className={styles.results}>
      <div className={styles.resultsHeader}>
        <p className={styles.count}>
          {isLoading
            ? 'Chargement…'
            : (() => {
                if (!datesSelected || availLoading) return `${displayed.length} résultat${displayed.length > 1 ? 's' : ''}`;
                const availableCount = displayed.filter((p: any) => (p._availCount ?? 0) > 0).length;
                return `${availableCount} disponible${availableCount > 1 ? 's' : ''} sur ${displayed.length}`;
              })()}
        </p>
        <div className={styles.sortWrap}>
          {([
            { value: 'default',    label: 'Défaut' },
            { value: 'price-asc',  label: 'Prix ↑' },
            { value: 'price-desc', label: 'Prix ↓' },
            { value: 'rating',     label: '★ Notes' },
          ] as const).map((o) => (
            <button
              key={o.value}
              className={`${styles.sortBtn} ${filters.sort === o.value ? styles.sortActive : ''}`}
              onClick={() => setFilters((f) => ({ ...f, sort: o.value }))}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className={styles.empty}><p>Chargement des produits…</p></div>
      ) : displayed.length === 0 ? (
        <div className={styles.empty}>
          <p>
            {datesSelected
              ? 'Aucun produit disponible pour ces dates.'
              : 'Aucun produit ne correspond à tes filtres.'}
          </p>
          <button onClick={() => setFilters(DEFAULT_FILTERS)}>Réinitialiser</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {displayed.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              availCount={!datesSelected ? undefined : availLoading ? null : (p as any)._availCount}
              dateStart={filters.dateStart || undefined}
              dateEnd={filters.dateEnd || undefined}
            />
          ))}
        </div>
      )}
    </div>
  </div>

  {/* Mobile : bottom sheet filtres */}
  <MobileFiltersSheet
    open={filtersOpen}
    value={filters}
    maxAvailable={maxProductPrice}
    onChange={setFilters}
    onDateChange={handleDateChange}
    onClose={() => setFiltersOpen(false)}
  />
</div>
```

- [ ] **Step 3 : Vérifier le build TypeScript**

```bash
npm run build 2>&1 | head -30
```

Résultat attendu : aucune erreur TypeScript. Si erreurs → les corriger avant de continuer.

- [ ] **Step 4 : Lancer la suite de tests complète**

```bash
npx vitest run
```

Résultat attendu : **PASS** — tous les tests verts (dont les 14 nouveaux des Tasks 1 et 2).

- [ ] **Step 5 : Lint**

```bash
npm run lint
```

Résultat attendu : aucune erreur.

- [ ] **Step 6 : Commit final**

```bash
git add src/pages/CataloguePage.tsx src/pages/CataloguePage.module.css
git commit -m "feat(mobile): wire MobileFilterBar and MobileFiltersSheet into CataloguePage"
```
